const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const DailyGoal = require('../models/DailyGoal');
const { normalizeReminderStorage, getLocalNow, hasReminderTime, isReminderDue, wasReminderSentToday, DEFAULT_TIMEZONE } = require('../utils/reminderSchedule');
const { isAdminUser } = require('../utils/adminAccess');
const { normalizeEmail, maskEmail } = require('../utils/emailUtils');
const { createAndSendOtp, verifyOtp: verifyOtpCode } = require('../utils/otpService');
const { isEmailConfigured } = require('../utils/emailConfig');

const generateToken = (id) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
    }
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '365d',
    });
};

const formatAuthResponse = (user) => ({
    _id: user.id,
    name: user.name,
    email: user.email,
    reminderEmail: user.reminderEmail || user.email || '',
    emailNotification: user.emailNotification,
    streakAlertNotification: user.streakAlertNotification,
    reminderTime: user.reminderTime,
    reminderAmPm: user.reminderAmPm,
    isAdmin: isAdminUser(user),
    token: generateToken(user._id),
});

// @desc    Send OTP to email
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = asyncHandler(async (req, res) => {
    const email = normalizeEmail(req.body.email);
    if (!email) {
        res.status(400);
        throw new Error('Enter a valid email address.');
    }

    const user = await User.findOne({ email });
    await createAndSendOtp(email);

    const mockMode = process.env.OTP_MOCK === 'true' || !isEmailConfigured();

    res.json({
        message: `OTP sent to ${maskEmail(email)}.`,
        isNewUser: !user,
        mock: mockMode,
    });
});

// @desc    Verify OTP and sign in / sign up
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = asyncHandler(async (req, res) => {
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || '').trim();
    const name = String(req.body.name || '').trim();

    if (!email) {
        res.status(400);
        throw new Error('Enter a valid email address.');
    }
    if (!otp || otp.length < 4) {
        res.status(400);
        throw new Error('Enter the OTP sent to your email.');
    }

    await verifyOtpCode(email, otp);

    let user = await User.findOne({ email });

    if (!user) {
        if (!name) {
            res.status(400);
            throw new Error('Please enter your name to create your account.');
        }
        user = await User.create({ email, name, reminderEmail: email });
    } else if (name && name !== user.name) {
        user.name = name;
        await user.save();
    }

    res.json(formatAuthResponse(user));
});

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    const userId = req.user?._id || req.user?.id;
    const user = await User.findById(userId);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    const existingToken = req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null;
    res.json({
        ...formatAuthResponse(user),
        token: existingToken || generateToken(user._id),
    });
});

// @desc    Logout user
// @route   GET /api/auth/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {
    res.status(200).json({ message: 'User logged out successfully' });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (req.body.name) {
        user.name = req.body.name;
    }
    if (req.body.reminderEmail !== undefined) {
        const next = String(req.body.reminderEmail || '').trim().toLowerCase();
        user.reminderEmail = next || user.email;
    }
    if (req.body.bio) user.bio = req.body.bio;
    if (req.body.specialization) user.specialization = req.body.specialization;
    if (req.body.role) user.role = req.body.role;

    if (req.body.emailNotification !== undefined) {
        user.emailNotification = req.body.emailNotification;
    }
    if (req.body.reminderTime !== undefined || req.body.reminderAmPm !== undefined) {
        const rawTime = req.body.reminderTime ?? user.reminderTime;
        if (!rawTime) {
            user.reminderTime = undefined;
            user.reminderAmPm = undefined;
            user.lastReminderSent = undefined;
            user.lastReminderDateKey = undefined;
        } else {
            const normalized = normalizeReminderStorage(
                rawTime,
                req.body.reminderAmPm ?? user.reminderAmPm ?? 'AM'
            );
            const timeChanged =
                normalized.reminderTime !== user.reminderTime ||
                normalized.reminderAmPm !== user.reminderAmPm;
            user.reminderTime = normalized.reminderTime;
            user.reminderAmPm = normalized.reminderAmPm;
            if (timeChanged) {
                user.lastReminderSent = undefined;
                user.lastReminderDateKey = undefined;
            }
        }
    }

    const updatedUser = await user.save();

    res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        reminderEmail: updatedUser.reminderEmail || updatedUser.email || '',
        bio: updatedUser.bio,
        specialization: updatedUser.specialization,
        role: updatedUser.role,
        emailNotification: updatedUser.emailNotification,
        streakAlertNotification: updatedUser.streakAlertNotification,
        reminderTime: updatedUser.reminderTime,
        reminderAmPm: updatedUser.reminderAmPm,
        isAdmin: isAdminUser(updatedUser),
    });
});

// @desc    Reminder readiness for the logged-in user
// @route   GET /api/auth/reminder-status
// @access  Private
const getReminderStatus = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const localNow = getLocalNow();
    const incompleteGoals = await DailyGoal.find({
        userId: user._id,
        completed: false,
        emailReminders: true,
    });

    const blockers = [];
    if (!isEmailConfigured()) blockers.push('server_email_not_ready');
    if (user.emailNotification === false) blockers.push('email_notifications_off');
    if (!user.getReminderEmail?.()) blockers.push('no_reminder_email');
    if (!hasReminderTime(user)) blockers.push('no_reminder_time');
    if (incompleteGoals.length === 0) blockers.push('no_incomplete_goals_with_bell');

    const sentToday = wasReminderSentToday(user, localNow);
    const dueNow = hasReminderTime(user) && isReminderDue(user, localNow);

    res.json({
        timezone: DEFAULT_TIMEZONE,
        localTime: `${String(localNow.hour).padStart(2, '0')}:${String(localNow.minute).padStart(2, '0')}`,
        localDate: localNow.dateKey,
        reminderEmail: user.getReminderEmail(),
        reminderTime: user.reminderTime,
        reminderAmPm: user.reminderAmPm,
        emailNotification: user.emailNotification !== false,
        goalsWithBell: incompleteGoals.length,
        sentToday,
        dueNow,
        willSendWhenDue: blockers.length === 0 && !sentToday,
        blockers,
        checklist: {
            serverEmail: isEmailConfigured(),
            notificationsOn: user.emailNotification !== false,
            timeSet: hasReminderTime(user),
            goalsReady: incompleteGoals.length > 0,
        },
    });
});

module.exports = {
    sendOtp,
    verifyOtp,
    getMe,
    logoutUser,
    updateUserProfile,
    getReminderStatus,
};
