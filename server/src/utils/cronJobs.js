const cron = require('node-cron');
const DailyGoal = require('../models/DailyGoal');
const User = require('../models/User');
const sendEmail = require('./emailService');
const { notifyAdmin } = require('./alertService');
const { isEmailConfigured } = require('./emailConfig');
const {
    DEFAULT_TIMEZONE,
    getLocalNow,
    getLocalDateKey,
    isReminderDue,
    wasReminderSentToday,
    hasReminderTime,
    to24HourParts,
} = require('./reminderSchedule');

const pad = (n) => String(n).padStart(2, '0');

/** Reset goals completed on a previous local calendar day (IST by default). */
const resetStaleCompletedGoals = async (localNow = getLocalNow()) => {
    const todayKey = localNow.dateKey;
    const completedGoals = await DailyGoal.find({
        completed: true,
        lastCompletedDate: { $exists: true, $ne: null },
    });

    let resetCount = 0;
    for (const goal of completedGoals) {
        const completedKey = getLocalDateKey(goal.lastCompletedDate, localNow.timezone);
        if (completedKey < todayKey) {
            goal.completed = false;
            await goal.save();
            resetCount += 1;
        }
    }

    if (resetCount > 0) {
        console.log(
            `Reset ${resetCount} daily goals for new local day (${todayKey}, ${localNow.timezone})`
        );
    }

    return resetCount;
};

// Midnight reset in user timezone — backup; primary reset runs each reminder check
cron.schedule(
    '0 0 * * *',
    async () => {
        console.log(`Running midnight daily goal reset (${DEFAULT_TIMEZONE})...`);
        try {
            await resetStaleCompletedGoals();
        } catch (err) {
            console.error('Error resetting daily goals at midnight:', err);
        }
    },
    { timezone: DEFAULT_TIMEZONE }
);

const getIncompleteReminderGoals = async (userId) =>
    DailyGoal.find({
        userId,
        completed: false,
        emailReminders: true,
    });

/**
 * Atomically claim today's reminder slot so concurrent cron pings cannot double-send.
 * Returns updated user doc or null if already sent today.
 */
const claimReminderSlot = async (userId, dateKey) =>
    User.findOneAndUpdate(
        {
            _id: userId,
            lastReminderDateKey: { $ne: dateKey },
        },
        {
            $set: {
                lastReminderDateKey: dateKey,
                lastReminderSent: new Date(),
            },
        },
        { new: true }
    );

const releaseReminderSlot = async (userId) => {
    await User.findByIdAndUpdate(userId, {
        $unset: {
            lastReminderSent: '',
            lastReminderDateKey: '',
        },
    });
};

const checkAndSendReminders = async () => {
    const localNow = getLocalNow();

    if (!isEmailConfigured()) {
        console.warn('Email reminders skipped: set BREVO_API_KEY on Render.');
        return { sent: 0, skipped: 0, reason: 'email_not_configured' };
    }

    await resetStaleCompletedGoals(localNow);

    let sent = 0;
    let skipped = 0;
    let eligibleUsers = 0;
    const skipReasons = {
        no_reminder_email: 0,
        no_reminder_time: 0,
        already_sent: 0,
        not_due_yet: 0,
        no_incomplete_goals: 0,
        email_disabled: 0,
        send_failed: 0,
    };

    try {
        const userIds = await DailyGoal.distinct('userId', {
            completed: false,
            emailReminders: true,
        });

        eligibleUsers = userIds.length;

        if (userIds.length === 0) {
            return { sent: 0, skipped: 0, reason: 'no_eligible_goals', timezone: localNow.timezone };
        }

        const users = await User.find({ _id: { $in: userIds } });

        for (const user of users) {
            if (user.emailNotification === false) {
                skipped += 1;
                skipReasons.email_disabled += 1;
                continue;
            }

            const reminderEmail = user.getReminderEmail?.() || user.reminderEmail?.trim();
            if (!reminderEmail) {
                skipped += 1;
                skipReasons.no_reminder_email += 1;
                continue;
            }

            if (!hasReminderTime(user)) {
                skipped += 1;
                skipReasons.no_reminder_time += 1;
                continue;
            }

            if (wasReminderSentToday(user, localNow)) {
                skipped += 1;
                skipReasons.already_sent += 1;
                continue;
            }

            if (!isReminderDue(user, localNow)) {
                skipped += 1;
                skipReasons.not_due_yet += 1;
                continue;
            }

            const incompleteGoals = await getIncompleteReminderGoals(user._id);

            if (incompleteGoals.length === 0) {
                skipped += 1;
                skipReasons.no_incomplete_goals += 1;
                continue;
            }

            const timeParts = to24HourParts(user.reminderTime, user.reminderAmPm);
            if (!timeParts) {
                skipped += 1;
                skipReasons.no_reminder_time += 1;
                continue;
            }
            const { hour, minute } = timeParts;

            const claimed = await claimReminderSlot(user._id, localNow.dateKey);
            if (!claimed) {
                skipped += 1;
                skipReasons.already_sent += 1;
                continue;
            }

            const includeStreak = user.streakAlertNotification !== false;
            const goalListText = incompleteGoals
                .map((g) => {
                    let streakText = '';
                    if (includeStreak && g.streak > 0) {
                        streakText = ` (Current Streak: ${g.streak})`;
                    }
                    return `- ${g.title}${streakText}`;
                })
                .join('\n');

            const message = `Hello ${user.name},\n\nYou have some pending daily goals in Learning Tracker to complete today:\n\n${goalListText}\n\nKeep up the great work and mark them complete when done!\n\nBest,\nThe Learning Tracker Team`;

            try {
                await sendEmail({
                    email: reminderEmail,
                    subject: 'Learning Tracker - Daily Reminder: Pending Goals',
                    message,
                });
                console.log(
                    `Reminder email sent to ${reminderEmail} (scheduled ${pad(hour)}:${pad(minute)}, tz ${localNow.timezone}, local ${pad(localNow.hour)}:${pad(localNow.minute)}, date ${localNow.dateKey})`
                );
                sent += 1;
            } catch (err) {
                console.error(`Failed to send email to ${reminderEmail}:`, err.message);
                await releaseReminderSlot(user._id);
                skipped += 1;
                skipReasons.send_failed = (skipReasons.send_failed || 0) + 1;
            }
        }
    } catch (err) {
        console.error('Error running checkAndSendReminders:', err);
        await notifyAdmin({
            alertKey: 'reminder-cron-error',
            subject: '[Learning Tracker] Reminder job crashed',
            message: `The daily reminder cron failed:\n\n${err.message}`,
        });
        return { sent, skipped, skipReasons, error: err.message, timezone: localNow.timezone };
    }

    if (skipReasons.send_failed > 0) {
        await notifyAdmin({
            alertKey: 'reminder-send-failed',
            subject: `[Learning Tracker] ${skipReasons.send_failed} reminder email(s) failed`,
            message: [
                'Some reminder emails could not be sent.',
                '',
                `Failed: ${skipReasons.send_failed}`,
                `Sent: ${sent}`,
                `Skipped: ${skipped}`,
                `Timezone: ${localNow.timezone}`,
            ].join('\n'),
        });
    }

    if (sent === 0 && eligibleUsers > 0) {
        console.log('Reminder check: no emails sent.', {
            skipped,
            skipReasons,
            timezone: localNow.timezone,
            localTime: `${pad(localNow.hour)}:${pad(localNow.minute)}`,
        });
    }

    return { sent, skipped, skipReasons, timezone: localNow.timezone, localTime: `${pad(localNow.hour)}:${pad(localNow.minute)}` };
};

let internalCronStarted = false;

/** Start after MongoDB is connected — avoids races on first ticks. */
const startInternalReminderCron = () => {
    if (internalCronStarted || process.env.DISABLE_INTERNAL_CRON === 'true') {
        return;
    }
    internalCronStarted = true;
    cron.schedule('* * * * *', async () => {
        await checkAndSendReminders();
    });
    console.log(`Internal reminder scheduler enabled (timezone: ${DEFAULT_TIMEZONE})`);
};

module.exports = {
    cron,
    checkAndSendReminders,
    resetStaleCompletedGoals,
    startInternalReminderCron,
    DEFAULT_TIMEZONE,
};
