/**
 * Dry-run reminder eligibility for all users with active reminder goals.
 * Usage: node scripts/verifyReminders.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const User = require('../src/models/User');
const DailyGoal = require('../src/models/DailyGoal');
const {
    getLocalNow,
    hasReminderTime,
    isReminderDue,
    wasReminderSentToday,
    DEFAULT_TIMEZONE,
} = require('../src/utils/reminderSchedule');
const { getEmailProvider } = require('../src/utils/emailConfig');

const run = async () => {
    await connectDB();
    const localNow = getLocalNow();

    console.log('--- Reminder verification ---');
    console.log(`Timezone: ${DEFAULT_TIMEZONE}`);
    console.log(`Local now: ${localNow.dateKey} ${String(localNow.hour).padStart(2, '0')}:${String(localNow.minute).padStart(2, '0')}`);
    console.log(`Email provider: ${getEmailProvider()}`);
    console.log(`Brevo configured: ${Boolean(process.env.BREVO_API_KEY)}`);
    console.log(`CRON_SECRET configured: ${Boolean(process.env.CRON_SECRET)}`);
    console.log('');

    const userIds = await DailyGoal.distinct('userId', {
        completed: false,
        emailReminders: true,
    });

    if (userIds.length === 0) {
        console.log('No users with incomplete goals + bell ON.');
        process.exit(0);
    }

    const users = await User.find({ _id: { $in: userIds } });

    for (const user of users) {
        const goals = await DailyGoal.find({
            userId: user._id,
            completed: false,
            emailReminders: true,
        });
        const status = {
            email: user.email,
            emailNotification: user.emailNotification !== false,
            reminderEmail: user.reminderEmail || '(none)',
            reminderTime: user.reminderTime,
            reminderAmPm: user.reminderAmPm,
            goals: goals.length,
            hasTime: hasReminderTime(user),
            due: isReminderDue(user, localNow),
            sentToday: wasReminderSentToday(user, localNow),
            lastReminderDateKey: user.lastReminderDateKey || '(none)',
        };
        console.log(JSON.stringify(status, null, 2));
    }

    await mongoose.disconnect();
    process.exit(0);
};

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
