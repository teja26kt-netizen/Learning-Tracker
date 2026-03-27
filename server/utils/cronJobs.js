const cron = require('node-cron');
const DailyGoal = require('../models/DailyGoal');
const sendEmail = require('./emailService');

// Schedule a daily job at 00:00 (midnight) to reset daily goals
cron.schedule('0 0 * * *', async () => {
    console.log('Running midnight daily goal reset...');
    try {
        const result = await DailyGoal.updateMany({}, { completed: false });
        console.log(`Reset ${result.modifiedCount} goals to incomplete.`);
    } catch (err) {
        console.error('Error resetting daily goals at midnight:', err);
    }
});

// Schedule a daily job at 8:00 AM server time
cron.schedule('0 8 * * *', async () => {
    console.log('Running daily goal reminder check...');

    try {
        // Find all daily goals that are incomplete and have email reminders enabled
        const incompleteGoals = await DailyGoal.find({
            completed: false,
            emailReminders: true
        }).populate('userId', 'name email');

        if (incompleteGoals.length === 0) {
            console.log('No reminders to send today.');
            return;
        }

        // Group incomplete goals by user
        const goalsByUser = {};
        incompleteGoals.forEach((goal) => {
            const userId = goal.userId._id.toString();
            if (!goalsByUser[userId]) {
                goalsByUser[userId] = {
                    user: goal.userId,
                    goals: []
                };
            }
            goalsByUser[userId].goals.push(goal);
        });

        // Send an email to each user summarizing their pending tasks
        for (const userId in goalsByUser) {
            const { user, goals } = goalsByUser[userId];

            const goalListText = goals.map(g => {
                let streakText = "";
                if (g.streak > 0) {
                    streakText = ` (Current Streak: ${g.streak} 🔥)`;
                }
                return `- ${g.title}${streakText}`;
            }).join('\n');

            const message = `Hello ${user.name},\n\nYou have some pending daily goals in DevTrack to complete today:\n\n${goalListText}\n\nKeep up the great work and mark them complete when done!\n\nBest,\nThe DevTrack Team`;

            try {
                await sendEmail({
                    email: user.email,
                    subject: 'DevTrack - Daily Reminder: Pending Goals',
                    message,
                });
                console.log(`Reminder email sent to ${user.email}`);
            } catch (err) {
                console.error(`Failed to send email to ${user.email}:`, err.message);
            }
        }
    } catch (err) {
        console.error('Error running daily goal cron job:', err);
    }
});

// Schedule an evening job at 6:00 PM (18:00) server time for pending goals
cron.schedule('0 18 * * *', async () => {
    console.log('Running evening pending goal reminder check...');

    try {
        const incompleteGoals = await DailyGoal.find({
            completed: false,
            emailReminders: true
        }).populate('userId', 'name email');

        if (incompleteGoals.length === 0) {
            console.log('No evening reminders to send.');
            return;
        }

        const goalsByUser = {};
        incompleteGoals.forEach((goal) => {
            const userId = goal.userId._id.toString();
            if (!goalsByUser[userId]) {
                goalsByUser[userId] = { user: goal.userId, goals: [] };
            }
            goalsByUser[userId].goals.push(goal);
        });

        for (const userId in goalsByUser) {
            const { user, goals } = goalsByUser[userId];
            const goalListText = goals.map(g => `- ${g.title}`).join('\n');

            const message = `Hello ${user.name},\n\nJust a friendly evening reminder! You still have some pending goals for today:\n\n${goalListText}\n\nThere's still time to finish strong! Mark them as complete in DevTrack when you're done.\n\nBest,\nThe DevTrack Team`;

            try {
                await sendEmail({
                    email: user.email,
                    subject: 'DevTrack - Evening Catch-up: Pending Goals',
                    message,
                });
                console.log(`Evening reminder email sent to ${user.email}`);
            } catch (err) {
                console.error(`Failed to send evening email to ${user.email}:`, err.message);
            }
        }
    } catch (err) {
        console.error('Error running evening cron job:', err);
    }
});

module.exports = cron;
