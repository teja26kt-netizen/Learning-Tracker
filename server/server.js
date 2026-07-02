const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./src/config/db');
const { getEmailProvider, isEmailConfigured, parseSender } = require('./src/utils/emailConfig');
const { DEFAULT_TIMEZONE } = require('./src/utils/reminderSchedule');
const { runSystemHealthCheck } = require('./src/utils/systemHealth');
const { notifyAdmin } = require('./src/utils/alertService');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// ─── CORS must be FIRST, before any body parsers ──────────────────────────────
// Preflight OPTIONS requests must receive CORS headers before reaching any other middleware
const parseOrigins = (value) =>
    (value || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'https://learning-tracker-two-xi.vercel.app',
    'https://learning-tracker-ycxw.vercel.app',
    ...parseOrigins(process.env.FRONTEND_URL),
];

const isLocalDevOrigin = (origin) =>
    /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Postman, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        // Vite may use 3001+ when 3000 is busy — allow any localhost port in dev
        if (process.env.NODE_ENV !== 'production' && isLocalDevOrigin(origin)) {
            return callback(null, true);
        }
        // Allow Vercel preview/production deployments (*.vercel.app)
        if (/^https:\/\/[\w-]+\.vercel\.app$/.test(origin)) {
            return callback(null, true);
        }
        callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

// cors() middleware handles OPTIONS preflight — do not use app.options('*') on Express 5
app.use(cors(corsOptions));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Health check — warms Render instance; ?deep=1 pings MongoDB
app.get('/api/health', async (req, res) => {
    const basic = {
        ok: true,
        emailProvider: getEmailProvider(),
        emailReady: isEmailConfigured(),
        senderConfigured: Boolean(parseSender().email),
        cronConfigured: Boolean(process.env.CRON_SECRET),
        adminAlertsConfigured: Boolean(process.env.ADMIN_EMAIL?.trim()),
        reminderTimezone: DEFAULT_TIMEZONE,
    };

    if (req.query.deep !== '1') {
        return res.status(200).json(basic);
    }

    const deep = await runSystemHealthCheck();
    res.status(deep.ok ? 200 : 503).json({ ...basic, ...deep, ok: deep.ok });
});

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/goals', require('./src/routes/goalRoutes'));
app.use('/api/progress', require('./src/routes/progressRoutes'));
app.use('/api/time', require('./src/routes/timeRoutes'));
app.use('/api/analytics', require('./src/routes/analyticsRoutes'));
app.use('/api/daily-goals', require('./src/routes/dailyGoalRoutes'));
app.use('/api/notes', require('./src/routes/noteRoutes'));
app.use('/api/feedback', require('./src/routes/feedbackRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));
app.use('/api/cron', require('./src/routes/cronRoutes'));

// Initialize cron jobs (also exposed at POST /api/cron/reminders for hosted cron pings)
const mongoose = require('mongoose');
const { checkAndSendReminders, startInternalReminderCron } = require('./src/utils/cronJobs');

mongoose.connection.once('open', () => {
    console.log('MongoDB connection established. Running startup email reminders check...');
    startInternalReminderCron();
    checkAndSendReminders();
});

// Error handling middleware — emails admin on server errors (rate-limited)
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    const path = `${req.method} ${req.originalUrl || req.url}`;

    if (statusCode >= 500 && !String(err.message || '').includes('CORS:')) {
        notifyAdmin({
            alertKey: `api-error-${path}`,
            subject: `[Learning Tracker] API error ${statusCode}`,
            message: [
                'A user request triggered a server error.',
                '',
                `Path: ${path}`,
                `Error: ${err.message}`,
            ].join('\n'),
        }).catch(() => {});
    }

    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`Email provider: ${getEmailProvider()}`);
});
