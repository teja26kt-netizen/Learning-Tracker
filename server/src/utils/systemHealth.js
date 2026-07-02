const mongoose = require('mongoose');
const { isEmailConfigured } = require('./emailConfig');

const runSystemHealthCheck = async () => {
    const issues = [];
    const checks = {
        mongodb: false,
        email: false,
        jwt: Boolean(process.env.JWT_SECRET?.trim()),
        cronSecret: Boolean(process.env.CRON_SECRET?.trim()),
        mongoUri: Boolean(process.env.MONGO_URI?.trim()),
    };

    if (!checks.mongoUri) {
        issues.push('MONGO_URI missing');
    }

    if (mongoose.connection.readyState !== 1) {
        issues.push(`MongoDB not connected (state ${mongoose.connection.readyState})`);
    } else {
        try {
            await mongoose.connection.db.admin().ping();
            checks.mongodb = true;
        } catch (err) {
            issues.push(`MongoDB ping failed: ${err.message}`);
        }
    }

    checks.email = isEmailConfigured();
    if (!checks.email) {
        issues.push('Email not ready (check BREVO_API_KEY and EMAIL_FROM)');
    }

    if (!checks.jwt) {
        issues.push('JWT_SECRET missing');
    }

    if (process.env.NODE_ENV === 'production' && !checks.cronSecret) {
        issues.push('CRON_SECRET missing');
    }

    return {
        ok: issues.length === 0,
        checks,
        issues,
        timestamp: new Date().toISOString(),
    };
};

module.exports = { runSystemHealthCheck };
