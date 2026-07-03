const ACCENT_STYLES = {
    violet: {
        icon: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400',
        hover: 'group-hover:bg-violet-600 group-hover:text-white dark:group-hover:bg-violet-500',
    },
    emerald: {
        icon: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        hover: 'group-hover:bg-emerald-600 group-hover:text-white dark:group-hover:bg-emerald-500',
    },
    orange: {
        icon: 'bg-orange-50 dark:bg-orange-500/10 text-orange-500 dark:text-orange-400',
        hover: 'group-hover:bg-orange-500 group-hover:text-white',
    },
    blue: {
        icon: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
        hover: 'group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-500',
    },
};

const DashboardMetricCard = ({ title, value, subtitle, icon, accent = 'violet', onClick }) => {
    const styles = ACCENT_STYLES[accent] || ACCENT_STYLES.violet;
    const Tag = onClick ? 'button' : 'div';

    return (
        <Tag
            type={onClick ? 'button' : undefined}
            onClick={onClick}
            className={`bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm group hover:shadow-md transition-all text-left w-full ${
                onClick ? 'cursor-pointer hover:border-violet-200 dark:hover:border-violet-800' : ''
            }`}
        >
            <div className="flex items-start justify-between gap-3 mb-4">
                <div
                    className={`p-3 rounded-xl flex-shrink-0 transition-all duration-300 ${styles.icon} ${styles.hover}`}
                >
                    {icon}
                </div>
                <p className="text-[11px] sm:text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right leading-tight pt-1">
                    {title}
                </p>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {value}
            </p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
        </Tag>
    );
};

export default DashboardMetricCard;
