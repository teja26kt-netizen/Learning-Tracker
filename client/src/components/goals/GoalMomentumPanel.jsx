import { useEffect, useMemo, useState } from 'react';
import { FiZap, FiTrendingUp, FiCalendar } from 'react-icons/fi';
import API from '../../services/api';
import { useAuthReady } from '../../hooks/useAuthReady';
import { readActivityCache, writeActivityCache } from '../../utils/goalsCache';

import { calcStreak } from '../../utils/calcStreak';

const weekRate = (days) => {
    const last7 = days?.slice(-7) ?? [];
    if (!last7.length) return 0;
    const hit = last7.filter((d) => d.count > 0 || d.allCompleted).length;
    return Math.round((hit / last7.length) * 100);
};

const GoalMomentumPanel = ({ refreshKey = 0 }) => {
    const { ready: authReady } = useAuthReady();
    const cached = readActivityCache();
    const [activity, setActivity] = useState(cached);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!authReady) return;

        let cancelled = false;

        const fetchActivity = async () => {
            try {
                setError('');
                const { data } = await API.get('daily-goals/activity', { timeout: 10000 });
                if (!cancelled) {
                    setActivity(data);
                    writeActivityCache(data);
                }
            } catch (err) {
                console.error('Error fetching goal activity:', err);
                if (!cancelled) {
                    setError('Could not load momentum. Try again in a moment.');
                }
            }
        };

        fetchActivity();
        return () => { cancelled = true; };
    }, [refreshKey, authReady]);

    const streak = useMemo(() => calcStreak(activity?.days), [activity]);
    const weekly = useMemo(() => weekRate(activity?.days), [activity]);
    const last7 = useMemo(() => activity?.days?.slice(-7) ?? [], [activity]);

    const ringRadius = 36;
    const circumference = 2 * Math.PI * ringRadius;
    const offset = circumference - (weekly / 100) * circumference;

    return (
        <div className="bg-white dark:bg-slate-900 premium-shadow p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="relative shrink-0 mx-auto sm:mx-0">
                    <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
                        <circle cx="48" cy="48" r={ringRadius} fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-800" />
                        <circle
                            cx="48"
                            cy="48"
                            r={ringRadius}
                            fill="none"
                            stroke="url(#momentumGrad)"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            className="transition-all duration-700"
                        />
                        <defs>
                            <linearGradient id="momentumGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#38bdf8" />
                                <stop offset="100%" stopColor="#0ea5e9" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-black text-slate-900 dark:text-white leading-none">{weekly}%</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">This week</span>
                    </div>
                </div>

                <div className="flex-1 min-w-0 space-y-4">
                    <div>
                        <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                            <FiZap className="text-sky-500" size={16} />
                            Learning momentum
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                            Your consistency at a glance.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-xs font-black border border-orange-100 dark:border-orange-900/30">
                            {streak} day streak 🔥
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 text-xs font-black border border-sky-100 dark:border-sky-800">
                            <FiTrendingUp size={12} />
                            {activity?.activeDays ?? 0} active days
                        </span>
                        {activity?.allCompletedToday && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-xs font-black border border-emerald-100 dark:border-emerald-800">
                                All done today ✓
                            </span>
                        )}
                    </div>

                    {error && <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{error}</p>}

                    <div className="pt-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <FiCalendar size={11} /> Last 7 days
                        </p>
                        <div className="grid grid-cols-7 gap-0.5 sm:gap-1 min-w-0">
                            {last7.map((day) => {
                                const done = day.allCompleted || day.count > 0;
                                const label = new Date(day.date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'narrow' });
                                return (
                                    <div key={day.date} className="flex flex-col items-center gap-0.5 sm:gap-1 min-w-0">
                                        <div
                                            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-black border-2 transition-all ${
                                                    day.isToday
                                                        ? 'border-sky-500 bg-sky-500 text-white shadow-md shadow-sky-500/30 scale-110'
                                                        : done
                                                          ? 'border-sky-400 bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-300'
                                                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400'
                                                }`}
                                                title={day.date}
                                            >
                                                {done ? '✓' : '·'}
                                            </div>
                                        <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 truncate w-full text-center">{label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GoalMomentumPanel;
