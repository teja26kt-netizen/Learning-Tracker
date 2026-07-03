import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { FiActivity, FiClock, FiList, FiDownload } from 'react-icons/fi';
import { useAuthReady } from '../hooks/useAuthReady';
import API from '../services/api';
import LoadingScreen from '../components/ui/LoadingScreen';
import PageHeader, { PAGE_SHELL } from '../components/layout/PageHeader';

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];

const Insights = () => {
    const { ready: authReady } = useAuthReady();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!authReady) return;

        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                setError('');
                const { data: res } = await API.get('analytics/dashboard');
                setData(res);
            } catch (err) {
                console.error('Failed to load analytics', err);
                setError(err.response?.data?.message || 'Could not load analytics. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [authReady]);

    const timeData =
        data?.goalsAnalysis?.length > 0
            ? data.goalsAnalysis.map((g, i) => ({
                  name: g.technology,
                  value: Math.max(g.currentProgress || 0, 1),
                  color: PIE_COLORS[i % PIE_COLORS.length],
              }))
            : [{ name: 'No active goals', value: 1, color: '#cbd5e1' }];

    const uniqueDays = data?.consistencyMetrics?.uniqueStudyDays ?? 0;
    const consistencyPct =
        data?.activeGoals > 0
            ? Math.min(100, Math.round((uniqueDays / Math.max(data.activeGoals * 7, 1)) * 100))
            : 0;

    const avgProgress =
        data?.goalsAnalysis?.length > 0
            ? Math.round(
                  data.goalsAnalysis.reduce((sum, g) => sum + (g.currentProgress || 0), 0) /
                      data.goalsAnalysis.length
              )
            : 0;

    if (loading) {
        return <LoadingScreen message="Loading insights" compact />;
    }

    return (
        <div className={PAGE_SHELL}>
            <PageHeader
                title="Insights"
                description="Live stats from your study logs and learning goals."
                actions={(
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 print:hidden"
                    >
                        <FiDownload size={16} /> Export PDF
                    </button>
                )}
            />

            {error && (
                <p className="text-sm font-semibold text-rose-600 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-xl px-4 py-3">
                    {error}
                </p>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 premium-shadow p-5 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-6 flex flex-col items-center">
                    <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-3 self-start uppercase tracking-[0.2em]">
                        <div className="w-8 h-8 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-xl flex items-center justify-center shadow-sm"><FiActivity size={16} /></div>
                        Goal progress
                    </h3>
                    <div className="w-full h-64 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={timeData} innerRadius={60} outerRadius={85} paddingAngle={8} stroke="none" dataKey="value">
                                    {timeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '1.5rem', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', padding: '16px', backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', fontFamily: 'Outfit' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" formatter={(value) => <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{value}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none">
                            <p className="text-xl font-black text-slate-900 dark:text-white leading-none">{avgProgress}%</p>
                            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1">Avg progress</p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-slate-900 premium-shadow p-5 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden">
                    <h3 className="text-xs font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3 uppercase tracking-[0.2em]">
                        <div className="w-8 h-8 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-xl flex items-center justify-center shadow-sm"><FiList size={16} /></div>
                        Active learning paths
                    </h3>
                    <div className="flex-1 overflow-x-auto">
                        {data?.goalsAnalysis?.length > 0 ? (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                        <th className="pb-4 px-4">Track</th>
                                        <th className="pb-4 px-4">Current</th>
                                        <th className="pb-4 px-4">Expected</th>
                                        <th className="pb-4 px-4 text-right">Insight</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {data.goalsAnalysis.map((goal) => (
                                        <tr key={goal.goalId} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                                            <td className="py-4 px-4">
                                                <p className="font-black text-slate-900 dark:text-white group-hover:text-violet-600 transition-colors uppercase tracking-tight text-xs">{goal.technology}</p>
                                            </td>
                                            <td className="py-4 px-4 text-xs font-black text-violet-600 dark:text-violet-400">{goal.currentProgress}%</td>
                                            <td className="py-4 px-4 text-xs font-bold text-slate-400 dark:text-slate-500">{goal.expectedProgress}%</td>
                                            <td className="py-4 px-4 text-right">
                                                <span className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-[1rem] text-xs font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-900/30 max-w-[200px] inline-block truncate">
                                                    {goal.suggestion}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-sm font-semibold text-slate-500 px-4 py-8">No active learning goals yet. Add one from the Dashboard.</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { icon: <FiClock />, label: 'Total study hours', val: `${data?.totalStudyHours ?? 0}h` },
                    { icon: <FiActivity />, label: 'Weekly hours', val: `${data?.weeklyStudyHours ?? 0}h` },
                    { icon: <FiActivity />, label: 'Study consistency', val: `${consistencyPct}%` },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 premium-shadow p-6 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center group hover:-translate-y-2 transition-all">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 text-violet-600 dark:text-violet-400 flex items-center justify-center text-2xl mb-8 shadow-sm group-hover:bg-violet-600 group-hover:text-white group-hover:rotate-6 transition-all duration-500">
                            {stat.icon}
                        </div>
                        <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{stat.val}</p>
                        <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-3 leading-none">{stat.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Insights;
