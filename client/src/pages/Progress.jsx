import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import ProgressBar from '../components/ProgressBar';
import { FiCheckCircle, FiClock, FiActivity, FiXCircle, FiPlay, FiPause, FiRotateCcw, FiCoffee, FiZap } from 'react-icons/fi';

const Progress = () => {
    const navigate = useNavigate();
    const [goals, setGoals] = useState([]);
    const [progressData, setProgressData] = useState({});
    const [loading, setLoading] = useState(true);

    // Timer States
    const [timerMode, setTimerMode] = useState('stopwatch'); // 'stopwatch' or 'pomodoro'
    const [timerActive, setTimerActive] = useState(false);
    const [time, setTime] = useState(0); // seconds
    const [activeGoalId, setActiveGoalId] = useState('');
    
    // Pomodoro specific
    const [pomoState, setPomoState] = useState('focus'); // 'focus' or 'break'
    const [pomoTimeLeft, setPomoTimeLeft] = useState(25 * 60);

    const fetchData = async () => {
        try {
            const { data } = await API.get('/goals');
            setGoals(data);

            const progressMap = {};
            await Promise.all(data.map(async (goal) => {
                try {
                    const res = await API.get(`/progress/${goal._id}`);
                    progressMap[goal._id] = res.data;
                } catch {
                    console.error('No progress yet for', goal._id);
                }
            }));
            setProgressData(progressMap);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Master Timer Effect
    useEffect(() => {
        let interval = null;
        if (timerActive) {
            interval = setInterval(() => {
                if (timerMode === 'stopwatch') {
                    setTime((prev) => prev + 1);
                } else {
                    setPomoTimeLeft((prev) => {
                        if (prev <= 1) {
                            handlePomodoroComplete();
                            return 0;
                        }
                        return prev - 1;
                    });
                }
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timerActive, timerMode]);

    const handlePomodoroComplete = () => {
        setTimerActive(false);
        if (pomoState === 'focus') {
            alert("Focus session complete! Time for a short break.");
            setPomoState('break');
            setPomoTimeLeft(5 * 60);
            // Log 25 mins automatically if goal is active
            if (activeGoalId) {
                logStudyTime(25 / 60);
            }
        } else {
            alert("Break over! Ready to focus?");
            setPomoState('focus');
            setPomoTimeLeft(25 * 60);
        }
    };

    const logStudyTime = async (hours) => {
        try {
            await API.post('/time/log', { goalId: activeGoalId, hours: Number(hours.toFixed(2)) });
            fetchData();
        } catch (err) {
            console.error('Failed to log pomodoro time', err);
        }
    };

    const handleMarkComplete = async (goalId) => {
        try {
            await API.post('/progress/mark-complete', { goalId });
            alert('Day marked as completed!');
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to mark complete');
        }
    };

    const handleStopTimer = async () => {
        setTimerActive(false);
        if (timerMode === 'stopwatch') {
            if (!activeGoalId || time < 60) {
                alert("Please select a goal and study for at least 1 minute to save.");
                setTime(0);
                return;
            }
            const hours = Number((time / 3600).toFixed(2));
            try {
                await API.post('/time/log', { goalId: activeGoalId, hours });
                alert(`Logged ${hours} hours successfully!`);
                setTime(0);
                setActiveGoalId('');
                fetchData();
            } catch {
                alert('Failed to log time');
            }
        }
    };

    const formatTime = (secs) => {
        if (timerMode === 'pomodoro') {
            const m = Math.floor(secs / 60).toString().padStart(2, '0');
            const s = (secs % 60).toString().padStart(2, '0');
            return `${m}:${s}`;
        }
        const h = Math.floor(secs / 3600).toString().padStart(2, '0');
        const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    const switchMode = (mode) => {
        if (timerActive) {
            if (!confirm("Your active session will be reset. Continue?")) return;
        }
        setTimerActive(false);
        setTimerMode(mode);
        setTime(0);
        if (mode === 'pomodoro') {
            setPomoState('focus');
            setPomoTimeLeft(25 * 60);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="max-w-2xl">
                    <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">Focus Station</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-4 text-xl font-medium leading-relaxed">Precision learning via high-performance intervals and telemetry.</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[1.5rem] border border-slate-200 dark:border-slate-700">
                    <button 
                        onClick={() => switchMode('stopwatch')}
                        className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timerMode === 'stopwatch' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                    >
                        Total Focus
                    </button>
                    <button 
                        onClick={() => switchMode('pomodoro')}
                        className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timerMode === 'pomodoro' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                    >
                        Pomodoro Protocol
                    </button>
                </div>
            </div>

            <div className={`p-12 rounded-[4rem] shadow-3xl relative overflow-hidden group transition-colors duration-700 ${timerMode === 'pomodoro' && pomoState === 'break' ? 'bg-emerald-900' : 'bg-slate-900'}`}>
                <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-[100px] -mr-48 -mt-48 group-hover:scale-150 transition-transform duration-1000 ${timerMode === 'pomodoro' && pomoState === 'break' ? 'bg-emerald-500/10' : 'bg-indigo-600/10'}`}></div>
                
                <div className="flex flex-col lg:flex-row gap-12 items-center justify-between relative z-10">
                    <div className="flex-1 space-y-8">
                        <div>
                             <h3 className={`text-xs font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-3 ${timerMode === 'pomodoro' && pomoState === 'break' ? 'text-emerald-400' : 'text-indigo-400'}`}>
                                {timerMode === 'stopwatch' ? <><FiZap /> Stopwatch Mode</> : <><FiClock /> Pomodoro: {pomoState.toUpperCase()}</>}
                             </h3>
                             <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm">
                                {timerMode === 'stopwatch' 
                                    ? "Track total focus time with second-by-second precision. Ideal for long intensive sessions."
                                    : "25 minutes of core focus followed by 5 minutes of cognitive reset. Science-backed mastery."}
                             </p>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Target Mastery Track</label>
                            <select
                                value={activeGoalId}
                                onChange={(e) => setActiveGoalId(e.target.value)}
                                className="w-full md:w-80 bg-slate-800 border-slate-700/50 rounded-2xl p-5 text-sm font-black text-white focus:ring-4 focus:ring-indigo-500/20 transition-all outline-none cursor-pointer"
                                disabled={timerActive}
                            >
                                <option value="">Select Target Module</option>
                                {goals.map(g => (
                                    <option key={g._id} value={g._id}>{g.technology.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="text-center lg:text-right space-y-8 min-w-[300px]">
                        <div className={`text-9xl font-black text-white tracking-tighter tabular-nums drop-shadow-2xl transition-all duration-500 ${timerActive ? 'scale-105' : 'scale-100'}`}>
                            {formatTime(timerMode === 'stopwatch' ? time : pomoTimeLeft)}
                        </div>
                        <div className="flex gap-4 justify-center lg:justify-end">
                            {!timerActive ? (
                                <button 
                                    onClick={() => setTimerActive(true)} 
                                    disabled={!activeGoalId} 
                                    className={`px-10 py-5 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all shadow-2xl disabled:opacity-20 flex items-center gap-3 btn-hover-scale ${timerMode === 'pomodoro' && pomoState === 'break' ? 'bg-emerald-600 shadow-emerald-600/20' : 'bg-indigo-600 shadow-indigo-600/20'}`}
                                >
                                    <FiPlay size={16} /> Start Protocol
                                </button>
                            ) : (
                                <button 
                                    onClick={timerMode === 'stopwatch' ? handleStopTimer : () => setTimerActive(false)} 
                                    className="px-10 py-5 bg-rose-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all shadow-2xl shadow-rose-600/20 flex items-center gap-3 btn-hover-scale"
                                >
                                    <FiPause size={16} /> {timerMode === 'stopwatch' ? 'Log & Reset' : 'Pause Protocol'}
                                </button>
                            )}
                            {(timerMode === 'stopwatch' ? time > 0 : pomoTimeLeft < (pomoState === 'focus' ? 25*60 : 5*60)) && !timerActive && (
                                <button 
                                    onClick={() => {
                                        if (timerMode === 'stopwatch') setTime(0);
                                        else setPomoTimeLeft(pomoState === 'focus' ? 25*60 : 5*60);
                                    }} 
                                    className="px-8 py-5 bg-slate-800 text-slate-400 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:text-white transition-all border border-slate-700 flex items-center gap-2"
                                >
                                    <FiRotateCcw /> Reset
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {goals.map(goal => {
                    const pData = progressData[goal._id] || { completedDays: 0, completionPercent: 0, daysRemaining: goal.durationDays };

                    return (
                        <div key={goal._id} className="glass-card premium-shadow p-10 rounded-[4rem] border border-white/50 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                            
                            <div className="flex justify-between items-start mb-10 relative z-10">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{goal.technology}</h3>
                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-3 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                                        {pData.daysRemaining} Cycles Remaining
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleMarkComplete(goal._id)}
                                    className="px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-[1.2rem] text-[9px] font-black uppercase tracking-widest border border-emerald-100/50 hover:bg-emerald-600 hover:text-white transition-all"
                                >
                                    Verify Today
                                </button>
                            </div>

                            <div className="space-y-8 relative z-10">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-1">
                                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3">Module Integrity</p>
                                         <p className="text-xs font-black text-indigo-600 mt-3">{Math.round(pData.completionPercent)}%</p>
                                    </div>
                                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-indigo-600 h-full rounded-full shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all duration-1000"
                                            style={{ width: `${pData.completionPercent}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 pt-2">
                                    <div className="flex items-center gap-3 bg-slate-50/80 dark:bg-slate-800 px-5 py-3 rounded-2xl border border-slate-100/50 dark:border-slate-700 shadow-sm">
                                        <FiActivity className="text-indigo-500" />
                                        <span className="text-xs font-black text-slate-900 dark:text-white">{pData.completedDays} Sessions</span>
                                    </div>
                                    <div className="flex items-center gap-3 bg-slate-50/80 dark:bg-slate-800 px-5 py-3 rounded-2xl border border-slate-100/50 dark:border-slate-700 shadow-sm">
                                        <FiClock className="text-indigo-500" />
                                        <span className="text-xs font-black text-slate-900 dark:text-white">{goal.dailyTargetHours}h Target</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {goals.length === 0 && (
                    <div className="col-span-2 p-24 text-center glass-card rounded-[4rem] border-2 border-dashed border-slate-200">
                        <p className="text-slate-400 font-black uppercase tracking-[0.2em]">No Active Mastery Protocols</p>
                        <button onClick={() => navigate('/courses')} className="mt-6 text-sm font-black text-indigo-600 hover:underline px-4">Initialize Roadmap</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Progress;
