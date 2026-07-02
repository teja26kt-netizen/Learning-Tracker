import { useParams, useNavigate } from 'react-router-dom';
import { courses } from '../data/CourseData';
import { FiChevronLeft, FiBookOpen, FiArrowRight, FiPlayCircle, FiCheckCircle } from 'react-icons/fi';

const CourseDetail = () => {
    const { courseId, stepIdx } = useParams();
    const navigate = useNavigate();
    
    const course = courses.find(c => c.id === courseId);
    const step = course?.roadmap[parseInt(stepIdx)];

    if (!course || !step) return <div className="p-20 text-center">Step not found.</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">
            {/* Context Navigation */}
            <button 
                onClick={() => navigate(`/roadmap/${courseId}`)}
                className="flex items-center gap-3 text-xs font-black text-slate-600 dark:text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 transition-all uppercase tracking-[0.2em] group"
            >
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg group-hover:bg-violet-50 dark:group-hover:bg-violet-900/30 transition-colors"><FiChevronLeft /></div> 
                Back to {course.title} Roadmap
            </button>

            {/* Step Hero - Premium Glass */}
            <div className="bg-white dark:bg-slate-900 premium-shadow p-16 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 relative overflow-hidden group transition-all duration-500">
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-violet-600/5 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-1000"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-6 mb-8">
                        <span className="px-6 py-2 bg-violet-600 text-white rounded-[1.2rem] text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-violet-200/30">Milestone 0{parseInt(stepIdx) + 1}</span>
                        <div className="w-1.5 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                        <span className="text-slate-600 dark:text-slate-500 font-black text-xs uppercase tracking-[0.2em]">{course.title}</span>
                    </div>
                    <h1 className="text-6xl font-black text-slate-900 dark:text-white leading-[1.1] mb-6 tracking-tighter uppercase">{step.step}</h1>
                    <p className="text-slate-700 dark:text-slate-400 text-xl font-bold max-w-2xl leading-relaxed">
                        In this technical module, we'll deep dive into the architecture and practical tooling required to master <span className="text-violet-600 dark:text-violet-400 font-bold">{step.step.toLowerCase()}</span>.
                    </p>
                </div>
            </div>

            {/* Detailed Topics */}
            <div className="space-y-10">
                <h2 className="text-xs font-black text-slate-900 dark:text-white px-4 flex items-center gap-4 uppercase tracking-[0.3em]">
                    <div className="w-10 h-10 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-xl flex items-center justify-center shadow-sm"><FiBookOpen size={18} /></div>
                    Technical Syllabus
                </h2>
                
                <div className="grid grid-cols-1 gap-6">
                    {step.topics?.map((topic, i) => (
                        <div key={i} className="group bg-white dark:bg-slate-900 premium-shadow p-10 rounded-[2rem] border border-slate-100 dark:border-slate-800 hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-500 hover:-translate-y-2">
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-violet-600 dark:text-violet-400 font-black shrink-0 text-xl shadow-sm group-hover:bg-violet-600 group-hover:text-white group-hover:rotate-6 transition-all duration-500">
                                    {(i + 1).toString().padStart(2, '0')}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors tracking-tight uppercase">{topic.title}</h3>
                                    <p className="text-slate-700 dark:text-slate-400 leading-relaxed text-base font-bold">{topic.detail}</p>
                                    
                                    <div className="mt-8 flex items-center gap-8">
                                        <button 
                                            onClick={() => navigate(`/roadmap/${courseId}/${stepIdx}/${i}`)}
                                            className="flex items-center gap-3 text-xs font-black text-violet-600 dark:text-violet-400 hover:gap-5 transition-all uppercase tracking-[0.2em]"
                                        >
                                            Technical Protocol <FiArrowRight />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const channel = course.topChannels?.[0];
                                                if (channel?.url) {
                                                    window.open(channel.url, '_blank', 'noopener,noreferrer');
                                                } else {
                                                    navigate(`/roadmap/${courseId}/${stepIdx}/${i}`);
                                                }
                                            }}
                                            className="flex items-center gap-3 text-xs font-black text-slate-600 dark:text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 transition-all uppercase tracking-[0.2em]"
                                        >
                                            <FiPlayCircle size={16} /> Workshop Session
                                        </button>
                                    </div>
                                </div>
                                <div className="self-center">
                                    <div className="w-16 h-16 rounded-full border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-100 dark:text-slate-700 group-hover:border-emerald-200 dark:group-hover:border-emerald-900/50 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-all duration-500 bg-white dark:bg-slate-950 shadow-sm relative overflow-hidden">
                                        <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <FiCheckCircle size={28} className="relative z-10" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {!step.topics && (
                        <div className="p-24 text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                            <p className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.3em]">Curriculum Finalization in Progress</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Next Module Preview */}
            {course.roadmap[parseInt(stepIdx) + 1] && (
                <div className="pt-12">
                    <div className="bg-white rounded-[2.5rem] p-12 text-slate-900 flex flex-col md:flex-row items-center justify-between gap-10 premium-shadow relative overflow-hidden group border border-violet-100">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/5 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-1000"></div>
                        <div className="relative z-10">
                            <p className="text-violet-500 font-black uppercase tracking-[0.4em] text-xs mb-4">Core Track Progression</p>
                            <h3 className="text-4xl font-black tracking-tight uppercase leading-tight text-slate-900">{course.roadmap[parseInt(stepIdx) + 1].step}</h3>
                        </div>
                        <button 
                            onClick={() => navigate(`/roadmap/${courseId}/${parseInt(stepIdx) + 1}`)}
                            className="px-12 py-5 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all flex items-center gap-4 whitespace-nowrap shadow-2xl shadow-red-600/30 btn-hover-scale relative z-10 active:scale-95"
                        >
                            Next Milestone <FiPlayCircle size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseDetail;
