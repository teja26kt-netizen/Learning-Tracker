const sendEmail = require('./emailService');
const { isEmailConfigured } = require('./emailConfig');
const { getAdminEmails } = require('./adminAccess');

const COOLDOWN_MS = Number(process.env.ALERT_COOLDOWN_MINUTES || 30) * 60 * 1000;
const lastSentAt = new Map();

/**
 * Email the admin when something breaks. Cooldown prevents inbox spam (default 30 min per alert type).
 */
const notifyAdmin = async ({ subject, message, alertKey = 'general', force = false }) => {
    const admins = getAdminEmails();
    const fullMessage = [
        message,
        '',
        '— Learning Tracker monitoring',
        `Alert key: ${alertKey}`,
        `Time (UTC): ${new Date().toISOString()}`,
    ].join('\n');

    if (!admins.length) {
        console.error('[alert] ADMIN_EMAIL not set:', alertKey, message);
        return { sent: false, reason: 'no_admin_email' };
    }

    if (!isEmailConfigured()) {
        console.error('[alert] Email not configured:', alertKey, message);
        return { sent: false, reason: 'email_not_configured' };
    }

    const now = Date.now();
    const last = lastSentAt.get(alertKey) || 0;
    if (!force && now - last < COOLDOWN_MS) {
        return { sent: false, reason: 'cooldown' };
    }

    try {
        for (const email of admins) {
            await sendEmail({ email, subject, message: fullMessage });
        }
        lastSentAt.set(alertKey, now);
        console.log(`[alert] Sent to ${admins.join(', ')}: ${alertKey}`);
        return { sent: true, to: admins };
    } catch (err) {
        console.error('[alert] Failed to send:', err.message);
        return { sent: false, reason: err.message };
    }
};

module.exports = { notifyAdmin, COOLDOWN_MS };
