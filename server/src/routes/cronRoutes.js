const express = require('express');
const { checkAndSendReminders } = require('../utils/cronJobs');
const sendEmail = require('../utils/emailService');
const { isEmailConfigured } = require('../utils/emailConfig');
const { runHealthWatch } = require('../utils/healthWatch');

const router = express.Router();

const authorizeCron = (req, res, next) => {
    const secret = process.env.CRON_SECRET;
    if (!secret) {
        return res.status(503).json({ message: 'CRON_SECRET is not configured on the server.' });
    }

    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : req.query.secret;

    if (token !== secret) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    next();
};

// Ping from Render Cron / cron-job.org every minute so reminders run on hosted API
router.post('/reminders', authorizeCron, async (req, res) => {
    const result = await checkAndSendReminders();
    res.json({ ok: true, ...result });
});

router.get('/reminders', authorizeCron, async (req, res) => {
    const result = await checkAndSendReminders();
    res.json({ ok: true, ...result });
});

// Background health watch — cron-job.org pings every 10–15 min; emails ADMIN_EMAIL on failure
router.get('/health-watch', authorizeCron, async (req, res) => {
    const result = await runHealthWatch();
    res.status(result.ok ? 200 : 503).json(result);
});

router.post('/health-watch', authorizeCron, async (req, res) => {
    const result = await runHealthWatch();
    res.status(result.ok ? 200 : 503).json(result);
});

// Send a sample reminder email (protected — for launch verification)
router.get('/sample-reminder', authorizeCron, async (req, res) => {
    const email = req.query.email;
    if (!email) {
        return res.status(400).json({ message: 'email query param required' });
    }
    if (!isEmailConfigured()) {
        return res.status(503).json({ message: 'Email is not configured (set BREVO_API_KEY on Render)' });
    }

    const message = `Hello,\n\nYou have some pending daily goals in Learning Tracker to complete today:\n\n- Watch roadmap video (Current Streak: 3)\n- Complete one module\n\nKeep up the great work and mark them complete when done!\n\nBest,\nThe Learning Tracker Team`;

    try {
        await sendEmail({
            email,
            subject: 'Learning Tracker - Daily Reminder: Pending Goals',
            message,
        });
        res.json({ ok: true, sentTo: email, sample: true });
    } catch (err) {
        console.error('Sample reminder failed:', err.message);
        res.status(500).json({ ok: false, message: err.message });
    }
});

module.exports = router;
