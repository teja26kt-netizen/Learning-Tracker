const asyncHandler = require('express-async-handler');
const LearningGoal = require('../models/LearningGoal');
const Progress = require('../models/Progress');
const TimeLog = require('../models/TimeLog');
const { calculateProgress } = require('../utils/progressCalculator');

// @desc    Get combined analytics dashboard data
// @route   GET /api/analytics/dashboard
// @access  Private
const getDashboardData = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const [goals, timeLogs] = await Promise.all([
        LearningGoal.find({ userId }).select('technology startDate endDate').lean(),
        TimeLog.find({ userId }).select('hours date').lean(),
    ]);

    const goalIds = goals.map((g) => g._id);
    const progressList = goalIds.length
        ? await Progress.find({ goalId: { $in: goalIds } }).select('goalId completedDays').lean()
        : [];

    const progressByGoalId = new Map(
        progressList.map((p) => [p.goalId.toString(), p.completedDays ?? 0])
    );

    let totalHours = 0;
    let weeklyHours = 0;
    const uniqueStudyDays = new Set();

    for (const log of timeLogs) {
        totalHours += log.hours;
        const logDate = new Date(log.date);
        if (logDate >= startOfWeek) weeklyHours += log.hours;
        uniqueStudyDays.add(logDate.toDateString());
    }

    const goalProgressList = goals.map((goal) => {
        const completedDays = progressByGoalId.get(goal._id.toString()) ?? 0;
        const currentProgressPercent = calculateProgress(
            completedDays,
            goal.startDate,
            goal.endDate
        );

        const start = new Date(goal.startDate);
        const end = new Date(goal.endDate);
        const totalGoalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
        const passedDays = Math.ceil((now - start) / (1000 * 60 * 60 * 24));

        let expectedPercent = Math.round((passedDays / totalGoalDays) * 100);
        expectedPercent = Math.min(100, Math.max(0, expectedPercent));

        let suggestion = 'You are on track! Keep it up.';
        if (currentProgressPercent < expectedPercent) {
            suggestion = `Study extra hours this week to catch up to the expected ${expectedPercent}%.`;
        }

        return {
            goalId: goal._id,
            technology: goal.technology,
            currentProgress: currentProgressPercent,
            expectedProgress: expectedPercent,
            suggestion,
        };
    });

    const completionRate =
        goalProgressList.length > 0
            ? Math.round(
                  goalProgressList.reduce((sum, g) => sum + g.currentProgress, 0) /
                      goalProgressList.length
              )
            : 0;

    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const monday = new Date(now);
    const dayOfWeek = monday.getDay();
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    monday.setDate(monday.getDate() - daysFromMonday);
    monday.setHours(0, 0, 0, 0);

    const sumHoursBetween = (start, end) =>
        timeLogs
            .filter((log) => {
                const logDate = new Date(log.date);
                return logDate >= start && logDate < end;
            })
            .reduce((sum, log) => sum + log.hours, 0);

    const weeklyActivity = dayLabels.map((name, i) => {
        const dayStart = new Date(monday);
        dayStart.setDate(monday.getDate() + i);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayStart.getDate() + 1);
        return {
            name,
            hours: Math.round(sumHoursBetween(dayStart, dayEnd) * 10) / 10,
        };
    });

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyActivity = [0, 1, 2, 3].map((weekIndex) => {
        const weekStart = new Date(monthStart);
        weekStart.setDate(monthStart.getDate() + weekIndex * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        if (weekStart > now) {
            return { name: `Wk ${weekIndex + 1}`, hours: 0 };
        }
        const effectiveEnd = weekEnd > now ? new Date(now.getTime() + 86400000) : weekEnd;
        return {
            name: `Wk ${weekIndex + 1}`,
            hours: Math.round(sumHoursBetween(weekStart, effectiveEnd) * 10) / 10,
        };
    });

    res.status(200).json({
        totalStudyHours: Math.round(totalHours * 10) / 10,
        weeklyStudyHours: Math.round(weeklyHours * 10) / 10,
        activeGoals: goals.length,
        completionRate,
        consistencyMetrics: { uniqueStudyDays: uniqueStudyDays.size },
        goalsAnalysis: goalProgressList,
        weeklyActivity,
        monthlyActivity,
    });
});

module.exports = {
    getDashboardData
};
