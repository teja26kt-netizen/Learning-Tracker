import { useState, useEffect } from 'react';
import API from '../services/api';
import { FiCheckCircle, FiCircle, FiBell, FiTrash2, FiPlus } from 'react-icons/fi';

const DailyGoalsSection = () => {
    const [goals, setGoals] = useState([]);
    const [newGoalTitle, setNewGoalTitle] = useState('');
    const [emailReminders, setEmailReminders] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchGoals = async () => {
        try {
            setLoading(true);
            const { data } = await API.get('/daily-goals');
            setGoals(data);
        } catch (err) {
            console.error('Error fetching daily goals:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    const handleAddGoal = async (e) => {
        e.preventDefault();
        if (!newGoalTitle.trim()) return;

        try {
            await API.post('/daily-goals/create', {
                title: newGoalTitle,
                emailReminders
            });
            setNewGoalTitle('');
            setEmailReminders(false);
            fetchGoals();
        } catch (err) {
            console.error('Error adding daily goal:', err);
        }
    };

    const toggleComplete = async (goal) => {
        try {
            await API.put(`/daily-goals/${goal._id}`, {
                completed: !goal.completed
            });
            // Optimistically update
            setGoals(goals.map(g => 
                g._id === goal._id ? { ...g, completed: !g.completed } : g
            ));
        } catch (err) {
            console.error('Error updating daily goal:', err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await API.delete(`/daily-goals/${id}`);
            // Optimistically update
            setGoals(goals.filter(g => g._id !== id));
        } catch (err) {
            console.error('Error deleting daily goal:', err);
        }
    };

    const toggleReminder = async (goal) => {
        try {
            await API.put(`/daily-goals/${goal._id}`, {
                emailReminders: !goal.emailReminders
            });
            // Optimistically update
            setGoals(goals.map(g => 
                g._id === goal._id ? { ...g, emailReminders: !g.emailReminders } : g
            ));
        } catch (err) {
            console.error('Error updating daily goal reminder:', err);
        }
    }

    return (
        <div className="glass-card premium-shadow p-12 rounded-[4rem] border border-white/50 space-y-8 mt-12 bg-white dark:bg-slate-900 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-500 dark:text-indigo-400 rounded-2xl flex items-center justify-center shadow-sm text-2xl">📝</div>
                        Daily Goals & Reminders
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Keep track of your day-to-day tasks like LeetCode or subject studies.</p>
                </div>
                <div className="px-6 py-3 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800">
                    {goals.filter(g => g.completed).length} / {goals.length} Completed
                </div>
            </div>

            {/* Add Goal Form */}
            <form onSubmit={handleAddGoal} className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                <div className="flex-1 w-full">
                    <input 
                        type="text" 
                        placeholder="E.g., Complete 2 LeetCode problems..." 
                        value={newGoalTitle}
                        onChange={(e) => setNewGoalTitle(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        required
                    />
                </div>
                <div className="flex items-center gap-4 shrink-0">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className={`w-10 h-6 rounded-full flex items-center p-1 transition-colors duration-300 ${emailReminders ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${emailReminders ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </div>
                        <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors flex items-center gap-1">
                            <FiBell /> Email Reminder
                        </span>
                        {/* Hidden checkbox for accessibility/state if needed, or simply handle click on label */}
                        <input type="checkbox" className="hidden" checked={emailReminders} onChange={(e) => setEmailReminders(e.target.checked)} />
                    </label>
                    
                    <button type="submit" className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50">
                        <FiPlus size={20} />
                    </button>
                </div>
            </form>

            {/* Goals List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="text-center py-8 text-slate-400 font-medium">Loading daily goals...</div>
                ) : goals.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                        <p className="text-slate-500 font-medium">No daily goals yet. Add one above!</p>
                    </div>
                ) : (
                    goals.map(goal => (
                        <div key={goal._id} className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${goal.completed ? 'bg-slate-50/50 border-slate-100 opacity-75' : 'bg-white border-slate-200 hover:border-indigo-300 shadow-sm'}`}>
                            <div className="flex items-center gap-4 flex-1">
                                <button 
                                    onClick={() => toggleComplete(goal)}
                                    title={goal.completed ? "Unmark Goal" : "Mark as Completed"}
                                    className={`flex-shrink-0 transition-all hover:scale-110 active:scale-95 ${goal.completed ? 'text-emerald-500' : 'text-slate-300 hover:text-indigo-500'}`}
                                >
                                    {goal.completed ? <FiCheckCircle size={24} /> : <FiCircle size={24} />}
                                </button>
                                <span className={`text-base font-medium transition-all ${goal.completed ? 'text-slate-400 dark:text-slate-600 line-through' : 'text-slate-800 dark:text-slate-200'}`}>
                                    {goal.title}
                                </span>
                                {goal.streak > 0 && (
                                    <div className="flex items-center gap-1 bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full text-[10px] font-black border border-orange-100">
                                        <span>{goal.streak}</span>
                                        <span role="img" aria-label="streak">🔥</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex items-center gap-3 shrink-0 ml-4">
                                <button 
                                    onClick={() => toggleReminder(goal)}
                                    title={goal.emailReminders ? "Reminders ON" : "Reminders OFF"}
                                    className={`p-2 rounded-lg transition-colors ${goal.emailReminders ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-100'}`}
                                >
                                    <FiBell size={16} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(goal._id)}
                                    title="Delete Goal"
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <FiTrash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DailyGoalsSection;
