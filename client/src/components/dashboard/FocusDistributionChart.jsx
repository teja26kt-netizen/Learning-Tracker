import { useMemo, useState } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

const EMPTY_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((name) => ({
    name,
    hours: 0,
}));

const EMPTY_MONTH = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'].map((name) => ({
    name,
    hours: 0,
}));

const buildYAxis = (data) => {
    const peak = Math.max(0, ...data.map((d) => d.hours || 0));
    const max = peak <= 8 ? 8 : Math.ceil(peak / 2) * 2;
    const ticks = [];
    for (let v = 0; v <= max; v += 2) ticks.push(v);
    return { domain: [0, max], ticks };
};

const FocusTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const hours = payload[0]?.value ?? 0;
    return (
        <div className="rounded-2xl border border-violet-100 bg-white/95 px-4 py-3 shadow-xl shadow-violet-100/50 backdrop-blur-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
            <p className="text-sm font-black text-violet-600">{hours}h focus</p>
        </div>
    );
};

const FocusDistributionChart = ({ weeklyActivity = [], monthlyActivity = [] }) => {
    const [range, setRange] = useState('weekly');

    const chartData = useMemo(() => {
        if (range === 'monthly') {
            return monthlyActivity.length ? monthlyActivity : EMPTY_MONTH;
        }
        return weeklyActivity.length ? weeklyActivity : EMPTY_WEEK;
    }, [range, weeklyActivity, monthlyActivity]);

    const { domain, ticks } = useMemo(() => buildYAxis(chartData), [chartData]);

    return (
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div className="min-w-0">
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                        Focus Distribution
                    </h3>
                    <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                        {range === 'weekly'
                            ? 'Detailed activity analysis by days'
                            : 'Weekly focus totals for this month'}
                    </p>
                </div>
                <div className="flex shrink-0 self-start sm:self-auto bg-slate-100/80 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700">
                    <button
                        type="button"
                        onClick={() => setRange('weekly')}
                        className={`px-4 sm:px-5 py-2.5 min-h-[44px] rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wide transition-all ${
                            range === 'weekly'
                                ? 'bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-400 shadow-sm'
                                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
                        }`}
                    >
                        Weekly
                    </button>
                    <button
                        type="button"
                        onClick={() => setRange('monthly')}
                        className={`px-4 sm:px-5 py-2.5 min-h-[44px] rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wide transition-all ${
                            range === 'monthly'
                                ? 'bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-400 shadow-sm'
                                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
                        }`}
                    >
                        Monthly
                    </button>
                </div>
            </div>

            <div className="h-[220px] sm:h-[260px] w-full sm:-ml-1">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                        <defs>
                            <linearGradient id="focusPurple" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.35} />
                                <stop offset="85%" stopColor="#7c3aed" stopOpacity={0.06} />
                                <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            stroke="#e8edf3"
                            strokeOpacity={0.9}
                            vertical={false}
                            horizontal
                        />
                        <XAxis
                            dataKey="name"
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                            interval="preserveStartEnd"
                            minTickGap={8}
                        />
                        <YAxis
                            domain={domain}
                            ticks={ticks}
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                            tickLine={false}
                            axisLine={false}
                            dx={-2}
                            width={26}
                        />
                        <Tooltip content={<FocusTooltip />} cursor={{ stroke: '#c4b5fd', strokeWidth: 1 }} />
                        <Area
                            type="natural"
                            dataKey="hours"
                            stroke="#7c3aed"
                            strokeWidth={2.5}
                            fill="url(#focusPurple)"
                            fillOpacity={1}
                            dot={false}
                            activeDot={{ r: 5, fill: '#7c3aed', stroke: '#fff', strokeWidth: 2 }}
                            animationDuration={900}
                            animationEasing="ease-out"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default FocusDistributionChart;
