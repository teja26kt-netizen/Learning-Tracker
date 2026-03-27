const asyncHandler = require('express-async-handler');
const DailyGoal = require('../models/DailyGoal');
const sendEmail = require('../utils/emailService');

// @desc    Create a new daily goal
// @route   POST /api/daily-goals/create
// @access  Private
const createDailyGoal = asyncHandler(async (req, res) => {
    const { title, emailReminders } = req.body;

    if (!title) {
        res.status(400);
        throw new Error('Please provide a goal title');
    }

    const goal = await DailyGoal.create({
        userId: req.user.id,
        title,
        emailReminders: emailReminders || false,
    });

    res.status(201).json(goal);
});

// @desc    Get user daily goals
// @route   GET /api/daily-goals
// @access  Private
const getDailyGoals = asyncHandler(async (req, res) => {
    // Get goals created today or incomplete goals from previous days?
    // Let's just return all of the user's daily goals, maybe sorted by incomplete first and then by date.
    const goals = await DailyGoal.find({ userId: req.user.id })
        .sort({ completed: 1, createdAt: -1 });
    
    res.status(200).json(goals);
});

// @desc    Update a daily goal
// @route   PUT /api/daily-goals/:id
// @access  Private
const updateDailyGoal = asyncHandler(async (req, res) => {
    const goal = await DailyGoal.findById(req.params.id);

    if (!goal) {
        res.status(404);
        throw new Error('Daily Goal not found');
    }

    // Make sure the logged in user matches the goal user
    if (goal.userId.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    // Handle streak logic if completed status is being updated
    if (req.body.completed !== undefined && req.body.completed !== goal.completed) {
        if (req.body.completed) {
            // Goal is being marked as completed
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (goal.lastCompletedDate) {
                const lastDate = new Date(goal.lastCompletedDate);
                lastDate.setHours(0, 0, 0, 0);

                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);

                if (lastDate.getTime() === yesterday.getTime()) {
                    // Completed yesterday, increment streak
                    req.body.streak = (goal.streak || 0) + 1;
                } else if (lastDate.getTime() === today.getTime()) {
                    // Already completed today, keep current streak
                    req.body.streak = goal.streak;
                } else {
                    // Gap in completion, reset streak to 1
                    req.body.streak = 1;
                }
            } else {
                // First time completion
                req.body.streak = 1;
            }
            req.body.lastCompletedDate = today;
        } else {
            // Goal is being unmarked (rare but possible)
            // We could decrement streak if it was incremented today, but for simplicity
            // let's just keep the streak as is or handle it based on requirements.
            // Usually, unmarking doesn't reset the streak unless it's a new day and was never marked.
        }
    }

    const updatedGoal = await DailyGoal.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    // Send email notification if goal was marked as completed and reminders are enabled
    if (req.body.completed === true && goal.completed === false && updatedGoal.emailReminders) {
        try {
            await sendEmail({
                email: req.user.email,
                subject: `Goal Completed: ${updatedGoal.title} 🚀`,
                message: `Great job, ${req.user.name}!\n\nYou've successfully completed your daily goal: "${updatedGoal.title}".\n\n🔥 CURRENT STREAK: ${updatedGoal.streak} DAYS 🔥\n\nKeep up the amazing momentum and finish the week strong!\n\nBest,\nThe DevTrack Team`,
            });
            console.log(`Completion email sent to ${req.user.email} for goal: ${updatedGoal.title}`);
        } catch (error) {
            console.error('Error sending goal completion email:', error.message);
        }
    }

    res.status(200).json(updatedGoal);
});

// @desc    Delete a daily goal
// @route   DELETE /api/daily-goals/:id
// @access  Private
const deleteDailyGoal = asyncHandler(async (req, res) => {
    const goal = await DailyGoal.findById(req.params.id);

    if (!goal) {
        res.status(404);
        throw new Error('Daily Goal not found');
    }

    // Make sure the logged in user matches the goal user
    if (goal.userId.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await goal.deleteOne();

    res.status(200).json({ id: req.params.id });
});

module.exports = {
    createDailyGoal,
    getDailyGoals,
    updateDailyGoal,
    deleteDailyGoal,
};
