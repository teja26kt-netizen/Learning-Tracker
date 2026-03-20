import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { FiActivity, FiAward, FiClock, FiList, FiCheckCircle, FiLock, FiDownload } from 'react-icons/fi';
import DailyGoalsSection from '../components/DailyGoalsSection';

const badges = [
    { icon: '🚀', name: 'First Launch',    desc: 'Logged first study session',    earned: true },
    { icon: '🔥', name: '7-Day Streak',    desc: 'Studied 7 days in a row',        earned: true },
    { icon: '⚡', name: 'Speed Learner',   desc: 'Completed a topic in under 1 day', earned: true },
    { icon: '🏆', name: 'Track Master',    desc: 'Completed an entire roadmap',   earned: false },
    { icon: '💯', name: '100 Hours',       desc: 'Logged 100+ study hours',        earned: false },
    { icon: '🧠', name: 'Deep Thinker',    desc: 'Used AI Mentor 10+ times',       earned: true },
    { icon: '📚', name: 'Bookworm',        desc: 'Saved 5+ resources to library',  earned: false },
    { icon: '🌟', name: 'Consistent Pro',  desc: 'Maintained 30-day streak',       earned: false },
];

const Insights = () => {
    const timeData = [
        { name: 'Core Foundations', value: 35, color: '#6366F1' },
        { name: 'Frontend Tech',    value: 45, color: '#4F46E5' },
        { name: 'System Design',    value: 15, color: '#4338CA' },
        { name: 'Soft Skills',      value: 5,  color: '#A5B4FC' }
    ];

    const completedTopics = [
        { id: 1, title: 'CSS Grid Mastery',      date: '2024-03-12', timeSpent: '4h 20m', status: 'Mastered' },
        { id: 2, title: 'React Hooks Deep Dive', date: '2024-03-11', timeSpent: '6h 45m', status: 'Excellent' },
        { id: 3, title: 'HTTP/HTTPS Protocol',   date: '2024-03-10', timeSpent: '2h 15m', status: 'Passed' },
        { id: 4, title: 'Modern JS Internals',   date: '2024-03-09', timeSpent: '5h 10m', status: 'Mastered' }
    ];

    const earnedCount = badges.filter(b => b.earned).length;

    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="max-w-2xl">
                    <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">Mastery Analytics</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-4 text-xl font-medium leading-relaxed">Advanced behavioral tracking and engineering growth statistics.</p>
                </div>
                <button 
                    onClick={() => window.print()}
                    className="flex items-center gap-3 px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-[2rem] font-black text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-700 btn-hover-scale shrink-0 print:hidden"
                >
                    <FiDownload size={18} /> Export PDF Report
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Focus Pie */}
                <div className="lg:col-span-1 glass-card premium-shadow p-12 rounded-[4rem] border border-white/50 space-y-10 flex flex-col items-center">
                    <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-4 self-start uppercase tracking-[0.2em]">
                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shadow-sm"><FiActivity size={18} /></div>
                        Focus Allocation
                    </h3>
                    <div className="w-full h-80 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={timeData} innerRadius={70} outerRadius={100} paddingAngle={10} stroke="none" dataKey="value">
                                    {timeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.5)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', padding: '24px', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', fontFamily: 'Outfit' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" formatter={(value) => <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{value}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                            <p className="text-2xl font-black text-slate-900 leading-none">88%</p>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Consistency</p>
                        </div>
                    </div>
                </div>

                {/* Milestone Log */}
                <div className="lg:col-span-2 glass-card premium-shadow p-12 rounded-[4rem] border border-white/50 flex flex-col overflow-hidden">
                    <h3 className="text-xs font-black text-slate-900 dark:text-white mb-12 flex items-center gap-4 uppercase tracking-[0.2em]">
                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shadow-sm"><FiList size={18} /></div>
                        Milestone Log
                    </h3>
                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-50 dark:border-slate-800 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                    <th className="pb-8 px-6">Technical Module</th>
                                    <th className="pb-8 px-6">Timestamp</th>
                                    <th className="pb-8 px-6">Intensity</th>
                                    <th className="pb-8 px-6 text-right">Verification</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {completedTopics.map((topic) => (
                                    <tr key={topic.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all">
                                        <td className="py-8 px-6">
                                            <p className="font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{topic.title}</p>
                                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter mt-1">Course ID: DEV-{topic.id * 128}</p>
                                        </td>
                                        <td className="py-8 px-6 text-sm font-bold text-slate-400 dark:text-slate-500">{topic.date}</td>
                                        <td className="py-8 px-6 text-sm font-black text-indigo-500">{topic.timeSpent}</td>
                                        <td className="py-8 px-6 text-right">
                                            <span className="px-6 py-2.5 bg-emerald-50 text-emerald-600 rounded-[1rem] text-[9px] font-black uppercase tracking-widest border border-emerald-100/50">{topic.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[
                    { icon: <FiClock />,    label: 'Productive Hours',  val: '142.5' },
                    { icon: <FiActivity />, label: 'Avg Consistency',   val: '94%' },
                    { icon: <FiAward />,    label: 'badges Earned',     val: `${earnedCount}/${badges.length}` },
                    { icon: <FiActivity />, label: 'Target Accuracy',   val: '88%' }
                ].map((stat, i) => (
                    <div key={i} className="glass-card premium-shadow p-10 rounded-[3rem] border border-white/50 dark:border-slate-800 flex flex-col items-center text-center group hover:-translate-y-2 transition-all">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl mb-8 shadow-sm group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-6 transition-all duration-500">
                            {stat.icon}
                        </div>
                        <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{stat.val}</p>
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-3 leading-none">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* 🏆 Trophy Room */}
            <div className="space-y-8">
                <div className="flex items-end justify-between border-b border-slate-100 dark:border-slate-800 pb-6">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 text-amber-500 dark:text-amber-400 rounded-2xl flex items-center justify-center shadow-sm text-2xl">🏆</div>
                            Trophy Room
                        </h2>
                        <p className="text-slate-500 mt-2 font-medium">{earnedCount} of {badges.length} achievements unlocked. Keep learning!</p>
                    </div>
                    <div className="px-6 py-3 bg-amber-50 text-amber-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-amber-100">{earnedCount} Earned</div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {badges.map((badge, i) => (
                        <div key={i} className={`relative p-8 rounded-[3rem] border flex flex-col items-center text-center transition-all duration-500 group ${badge.earned ? 'glass-card premium-shadow border-white/50 hover:-translate-y-2' : 'bg-slate-50 border-slate-100 opacity-50'}`}>
                            {badge.earned
                                ? <div className="absolute top-4 right-4 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center"><FiCheckCircle className="text-white" size={12} /></div>
                                : <div className="absolute top-4 right-4 w-6 h-6 bg-slate-300 rounded-full flex items-center justify-center"><FiLock className="text-white" size={12} /></div>
                            }
                            <div className={`text-5xl mb-5 transition-transform duration-500 ${badge.earned ? 'group-hover:scale-125 group-hover:rotate-12' : 'grayscale'}`}>
                                {badge.icon}
                            </div>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">{badge.name}</h4>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-2 leading-relaxed uppercase tracking-tight">{badge.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Daily Goals & Reminders Section */}
            <DailyGoalsSection />
        </div>
    );
};

export default Insights;
