import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courses } from '../data/CourseData';
import API from '../services/api';
import { useAuthReady } from '../hooks/useAuthReady';
import { readDashboardCache, writeDashboardCache } from '../utils/dashboardCache';
import DashboardMetricCard from '../components/dashboard/DashboardMetricCard';
import FocusDistributionChart from '../components/dashboard/FocusDistributionChart';
import ReminderCard from '../components/goals/ReminderCard';
import GoalCard from '../components/goals/GoalCard';
import { FiClock, FiTarget, FiCalendar, FiPlus, FiArrowRight, FiPieChart } from 'react-icons/fi';
import { IoFlame } from 'react-icons/io5';
import { PAGE_SHELL_WIDE } from '../components/layout/PageHeader';
import { calcStreak } from '../utils/calcStreak';

const StatSkeleton = () => (
    <div className="glass-card premium-shadow p-5 rounded-xl animate-pulse">
        <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-xl mb-4" />
        <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg mb-2" />
        <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded" />
    </div>
);

const Dashboard = () => {
    const navigate = useNavigate();
    const { ready: authReady } = useAuthReady();
    const [data, setData] = useState(() => readDashboardCache()?.data ?? null);
    const [loadingStats, setLoadingStats] = useState(false);
    const [loadingGoals, setLoadingGoals] = useState(false);
    const [goals, setGoals] = useState(() => readDashboardCache()?.goals ?? []);
    const [goalActivity, setGoalActivity] = useState(null);
    const [addingGoal, setAddingGoal] = useState(false);
    const [goalNotice, setGoalNotice] = useState('');

    // Goal Setting State
    const [selectedTrack, setSelectedTrack] = useState(courses[0].id);
    const [targetDate, setTargetDate] = useState('2026-08-30');
    const [daysLeft, setDaysLeft] = useState(0);

    useEffect(() => {
        const calculateDays = () => {
            const diff = new Date(targetDate) - new Date();
            setDaysLeft(Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))));
        };
        calculateDays();
    }, [targetDate]);

    const handleAddGoal = async () => {
        const track = courses.find(c => c.id === selectedTrack);
        
        // Map frontend category to backend enum: ['Frontend', 'Backend', 'Full Stack', 'Other']
        let backendCategory = 'Other';
        const cat = track?.category?.toLowerCase();
        if (cat?.includes('front')) backendCategory = 'Frontend';
        else if (cat?.includes('back')) backendCategory = 'Backend';
        else if (cat?.includes('stack') || cat?.includes('dev')) backendCategory = 'Full Stack';

        const goalData = {
            technology: track?.title || 'Unknown',
            category: backendCategory,
            startDate: new Date().toISOString(),
            endDate: targetDate,
            durationDays: daysLeft,
            dailyTargetHours: 2,
            subTasks: (track?.roadmap || []).slice(0, 12).map((r) => ({ title: r.step, completed: false })),
        };

        setAddingGoal(true);
        setGoalNotice('');
        try {
            const { data } = await API.post('goals/create', goalData);
            setGoals((prev) => [data, ...(prev || [])]);
            setGoalNotice(`${track?.title} added to your active paths.`);
        } catch (err) {
            console.error('Failed to add goal', err);
            setGoalNotice(err.response?.data?.message || 'Failed to add goal. Please try again.');
        } finally {
            setAddingGoal(false);
        }
    };

    const handleDeleteGoal = async (id) => {
        if (!window.confirm("Are you sure you want to delete this learning path?")) return;
        try {
            await API.delete(`goals/${id}`);
            setGoals(prev => prev.filter(g => g._id !== id));
        } catch (err) {
            console.error('Failed to delete goal', err);
            alert('Failed to delete goal. Please try again.');
        }
    };

    useEffect(() => {
        if (!authReady) return;

        let cancelled = false;

        const fetchGoals = API.get('goals')
            .then((res) => {
                if (!cancelled && Array.isArray(res?.data)) setGoals(res.data);
            })
            .catch((err) => {
                console.warn('Failed to load goals', err);
                if (!cancelled) setGoals([]);
            })
            .finally(() => {
                if (!cancelled) setLoadingGoals(false);
            });

        const fetchAnalytics = API.get('analytics/dashboard')
            .then((res) => {
                if (!cancelled) {
                    setData(res?.data || { totalStudyHours: 0, weeklyStudyHours: 0, completionRate: 0 });
                }
            })
            .catch((err) => {
                console.warn('Failed to load dashboard analytics', err);
                if (!cancelled) {
                    setData((prev) => prev || { totalStudyHours: 0, weeklyStudyHours: 0, completionRate: 0 });
                }
            })
            .finally(() => {
                if (!cancelled) setLoadingStats(false);
            });

        const activityTimer = setTimeout(() => {
            API.get('daily-goals/activity', { timeout: 12000 })
                .then((res) => {
                    if (!cancelled) setGoalActivity(res?.data ?? null);
                })
                .catch((err) => {
                    console.warn('Failed to load goal activity', err);
                });
        }, 300);

        return () => {
            cancelled = true;
            clearTimeout(activityTimer);
        };
    }, [authReady]);

    useEffect(() => {
        if (!loadingStats && !loadingGoals) {
            writeDashboardCache(data, goals);
        }
    }, [data, goals, loadingStats, loadingGoals]);

    const weekActivity = goalActivity?.days?.slice(-7) ?? [];
    const streakDays = calcStreak(goalActivity?.days);
    const weeklyHours = data?.weeklyStudyHours ?? 0;
    const completionRate = data?.completionRate ?? 0;
    const totalPaths = goals.length;
    const activePaths = goals.filter((g) => new Date(g.endDate) >= new Date()).length;
    const studyTimeLabel = weeklyHours === 1 ? '1 hr' : `${weeklyHours} hrs`;

    return (
        <div className={PAGE_SHELL_WIDE}>
            {goalNotice && (
                <p className="text-xs font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900 rounded-xl px-4 py-2.5 break-words">
                    {goalNotice}
                </p>
            )}
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 md:p-6 text-slate-800 dark:text-slate-100 relative overflow-hidden shadow-sm group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
                <div className="relative z-10 space-y-5">
                    <div className="max-w-2xl">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.16em] mb-2.5 border border-slate-200 dark:border-slate-700">
                            Adaptive Roadmap
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black leading-tight tracking-tighter text-slate-900 dark:text-white italic break-words">
                            Fast-Track Your Learning Goal
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mt-2">
                            Pick a course, set your target date, then add your learning goal.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 lg:gap-4 items-end">
                        <div className="sm:col-span-2 lg:col-span-4 space-y-1">
                            <label htmlFor="banner-course" className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                                Course Choice
                            </label>
                            <select
                                id="banner-course"
                                value={selectedTrack}
                                onChange={(e) => setSelectedTrack(e.target.value)}
                                className="w-full min-h-[44px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-violet-100 dark:focus:ring-violet-900/20 transition-all outline-none cursor-pointer"
                            >
                                {courses.map((c) => (
                                    <option key={c.id} value={c.id}>{c.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className="sm:col-span-2 lg:col-span-3 space-y-1">
                            <label htmlFor="banner-date" className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                                Target Date
                            </label>
                            <input
                                id="banner-date"
                                type="date"
                                value={targetDate}
                                onChange={(e) => setTargetDate(e.target.value)}
                                className="w-full min-h-[44px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-violet-100 dark:focus:ring-violet-900/20 transition-all outline-none"
                            />
                        </div>
                        <div className="sm:col-span-2 lg:col-span-2 flex items-center justify-center py-2 px-2 min-h-[44px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-center">
                            <div>
                                <p className="text-lg sm:text-xl font-black text-violet-600 dark:text-violet-400 leading-none">{daysLeft}</p>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-0.5">Days Left</p>
                            </div>
                        </div>
                        <div className="sm:col-span-2 lg:col-span-3">
                            <button
                                type="button"
                                onClick={handleAddGoal}
                                disabled={addingGoal}
                                className="w-full min-h-[44px] py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-black rounded-xl transition-all shadow-md shadow-violet-200 dark:shadow-none flex items-center justify-center gap-2 uppercase tracking-widest text-[10px] sm:text-xs disabled:opacity-60 disabled:pointer-events-none"
                            >
                                <FiPlus className="shrink-0" /> {addingGoal ? 'Adding…' : 'Add Goal'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {loadingStats || loadingGoals ? (
                    <>
                        <StatSkeleton />
                        <StatSkeleton />
                        <StatSkeleton />
                        <StatSkeleton />
                    </>
                ) : (
                    <>
                        <DashboardMetricCard
                            title="Study Time"
                            value={studyTimeLabel}
                            subtitle={weeklyHours > 0 ? 'This Week' : 'Log time in Focus Station →'}
                            icon={<FiClock size={20} />}
                            accent="violet"
                            onClick={() => navigate('/progress')}
                        />
                        <DashboardMetricCard
                            title="Active Goals"
                            value={totalPaths > 0 ? `${activePaths} / ${totalPaths}` : '0'}
                            subtitle="In Progress"
                            icon={<FiTarget size={20} />}
                            accent="emerald"
                        />
                        <DashboardMetricCard
                            title="Streak"
                            value={`${streakDays} ${streakDays === 1 ? 'Day' : 'Days'}`}
                            subtitle={streakDays > 0 ? 'Keep it up!' : 'Complete a daily goal'}
                            icon={<IoFlame size={20} />}
                            accent="orange"
                        />
                        <DashboardMetricCard
                            title="Progress"
                            value={`${completionRate}%`}
                            subtitle="Overall"
                            icon={<FiPieChart size={20} />}
                            accent="blue"
                        />
                    </>
                )}
            </div>

            {/* Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Activity & Goals */}
                <div className="lg:col-span-8 space-y-6">
                    <FocusDistributionChart
                        weeklyActivity={data?.weeklyActivity}
                        monthlyActivity={data?.monthlyActivity}
                    />

                    {/* Active Goals Horizontal */}
                    <div className="space-y-6">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-0 sm:px-2 min-w-0">
                             <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white min-w-0 truncate">Active Paths</h3>
                             <button onClick={() => navigate('/courses')} className="self-start sm:self-auto shrink-0 text-xs sm:text-sm font-black text-violet-600 hover:text-violet-700 transition-all flex items-center gap-2 whitespace-nowrap">View Curriculum <FiArrowRight /></button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                            {loadingGoals ? (
                                <>
                                    <StatSkeleton />
                                    <StatSkeleton />
                                </>
                            ) : goals.length > 0 ? (
                                goals.slice(0, 2).map(goal => (
                                    <GoalCard key={goal._id} goal={goal} onDelete={handleDeleteGoal} />
                                ))
                            ) : (
                                <p className="text-sm font-semibold text-slate-500 col-span-2 px-2">No active paths yet. Add a learning goal to get started.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Goal Setting & Tips */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-slate-800 shadow-sm overflow-visible">
                         <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-6 sm:mb-8 flex items-center gap-3">
                            <FiCalendar className="text-indigo-600" /> Focus Streak
                        </h3>
                        {weekActivity.length > 0 ? (
                            <div className="grid grid-cols-7 gap-1 sm:gap-2 min-w-0">
                                {weekActivity.map((day) => {
                                    const dateNum = day.date?.split('-')[2] ?? '';
                                    const dayLabel = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][day.dayOfWeek] ?? '';
                                    const isActive = day.count > 0 || day.allCompleted;
                                    return (
                                        <div key={day.date} className="flex flex-col items-center gap-1.5 sm:gap-3 min-w-0">
                                            <span className={`text-[10px] sm:text-xs font-black uppercase truncate ${day.isToday ? 'text-violet-600 dark:text-violet-400' : 'text-slate-600 dark:text-slate-500'}`}>{dayLabel}</span>
                                            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center text-[10px] sm:text-xs font-black ${isActive ? 'bg-violet-600 text-white shadow-lg shadow-violet-100' : 'bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 border border-slate-100 dark:border-slate-700'} ${day.isToday ? 'ring-2 ring-violet-400 ring-offset-1 sm:ring-offset-2 dark:ring-offset-slate-900' : ''}`}>
                                                {dateNum}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm font-semibold text-slate-500">Add daily goals and check them off to build your streak.</p>
                        )}
                        {streakDays > 0 && (
                            <p className="text-xs font-bold text-violet-600 dark:text-violet-400 mt-4">{streakDays} day streak — keep going!</p>
                        )}
                    </div>

                    {data?.goalsAnalysis?.[0] && <ReminderCard suggestion={data.goalsAnalysis[0].suggestion} />}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
