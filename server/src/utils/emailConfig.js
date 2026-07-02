const brevoApiKey = () => process.env.BREVO_API_KEY?.trim() || '';

const isEmailConfigured = () => Boolean(brevoApiKey() && parseSender().email);

const getEmailProvider = () => (brevoApiKey() ? 'brevo' : 'none');

/** Parse `Name <email@example.com>` or plain email for Brevo sender. */
const parseSender = () => {
    const raw = process.env.EMAIL_FROM?.trim() || '';
    const bracketed = raw.match(/^(.+?)\s*<([^>]+)>$/);
    if (bracketed) {
        return { name: bracketed[1].trim(), email: bracketed[2].trim().toLowerCase() };
    }
    if (raw.includes('@')) {
        return {
            name: process.env.BREVO_SENDER_NAME?.trim() || 'Learning Tracker',
            email: raw.toLowerCase(),
        };
    }
    const email = process.env.BREVO_SENDER_EMAIL?.trim().toLowerCase() || '';
    return {
        name: process.env.BREVO_SENDER_NAME?.trim() || 'Learning Tracker',
        email,
    };
};

module.exports = {
    isEmailConfigured,
    getEmailProvider,
    brevoApiKey,
    parseSender,
};
