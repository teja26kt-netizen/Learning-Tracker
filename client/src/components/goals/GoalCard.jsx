import { FiClock, FiCalendar, FiTrash2, FiEdit2 } from 'react-icons/fi';

const GoalCard = ({ goal, onDelete, onEdit }) => {
    const startDate = new Date(goal.startDate).toLocaleDateString();
    const endDate = new Date(goal.endDate).toLocaleDateString();

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl premium-shadow border border-slate-200 dark:border-slate-800 p-5 hover:border-violet-100 dark:hover:border-violet-900 transition-all group">
            <div className="flex justify-between items-start mb-3">
                <div className="min-w-0 flex-1 pr-2">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors uppercase tracking-tight leading-tight break-words line-clamp-2">{goal.technology}</h3>
                    <div className="mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-black uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-500/20">
                            Active
                        </span>
                    </div>
                </div>
                <div className="flex gap-1">
                    {onEdit && (
                        <button
                            type="button"
                            onClick={() => onEdit(goal)}
                            className="p-2.5 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-slate-300 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-500/10 rounded-xl transition-all"
                            title="Edit Goal"
                        >
                            <FiEdit2 size={14} />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => onDelete && onDelete(goal._id)}
                        className="p-2.5 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                        title="Delete Goal"
                    >
                        <FiTrash2 size={14} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-0.5">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Duration</p>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                        <FiCalendar className="text-violet-500" size={12} />
                        <span>{goal.durationDays} Days</span>
                    </div>
                </div>
                <div className="space-y-0.5">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Daily Focus</p>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                        <FiClock className="text-violet-500" size={12} />
                        <span>{goal.dailyTargetHours}h/day</span>
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-800 flex justify-between gap-2 text-xs font-black uppercase tracking-widest text-slate-400 min-w-0">
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <span className="text-[10px] text-slate-300 dark:text-slate-600">Start</span>
                    <span className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 truncate">{startDate}</span>
                </div>
                <div className="flex flex-col gap-0.5 text-right min-w-0 flex-1">
                    <span className="text-[10px] text-slate-300 dark:text-slate-600">End</span>
                    <span className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 truncate">{endDate}</span>
                </div>
            </div>
        </div>
    );
};

export default GoalCard;
