const { runSystemHealthCheck } = require('./systemHealth');
const { notifyAdmin } = require('./alertService');

let lastHealthOk = true;

const runHealthWatch = async () => {
    const health = await runSystemHealthCheck();
    let alert = null;

    if (!health.ok) {
        alert = await notifyAdmin({
            alertKey: 'system-health-failed',
            subject: '[Learning Tracker] Health check FAILED',
            message: [
                'Something is wrong with the Learning Tracker API.',
                '',
                'Issues:',
                ...health.issues.map((i) => `• ${i}`),
                '',
                'Checks:',
                JSON.stringify(health.checks, null, 2),
                '',
                'Fix on Render → learning-tracker-api-hqzm → Environment, then redeploy.',
            ].join('\n'),
        });
    } else if (!lastHealthOk) {
        alert = await notifyAdmin({
            alertKey: 'system-health-recovered',
            subject: '[Learning Tracker] Health check recovered',
            message: 'All system checks passed again. The API should be working normally.',
            force: true,
        });
    }

    lastHealthOk = health.ok;

    return { ...health, alert };
};

module.exports = { runHealthWatch };
