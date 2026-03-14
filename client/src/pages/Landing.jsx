import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiCode, FiCpu, FiLayout, FiSmartphone } from 'react-icons/fi';

const Landing = () => {
    const navigate = useNavigate();

    const features = [
        { icon: <FiCode />, title: "Code Mastery", desc: "Interactive environments and real-world projects." },
        { icon: <FiCpu />, title: "AI Integration", desc: "Learn to build and leverage modern AI models." },
        { icon: <FiLayout />, title: "Visual Roadmaps", desc: "Step-by-step paths curated by industry experts." },
        { icon: <FiSmartphone />, title: "Mobile Friendly", desc: "Learn on the go with our responsive platform." }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-indigo-500 selection:text-white overflow-hidden relative">
            {/* Background Glow */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]"></div>
                <div className="absolute top-[20%] -right-[10%] w-[30%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]"></div>
            </div>

            {/* Navbar */}
            <nav className="relative z-10 px-8 py-8 flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-500/50">D</div>
                    <span className="text-2xl font-black tracking-tighter">Dev Learning</span>
                </div>
                <div className="hidden md:flex items-center gap-10 text-sm font-bold text-slate-400 capitalize">
                    <a href="#" className="hover:text-white transition-colors">Courses</a>
                    <a href="#" className="hover:text-white transition-colors">Resources</a>
                    <a href="#" className="hover:text-white transition-colors">Community</a>
                    <button 
                        onClick={() => navigate('/login')}
                        className="px-6 py-3 bg-white text-slate-950 rounded-xl hover:bg-indigo-500 hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-white/5"
                    >
                        Sign In
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-black uppercase tracking-widest">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            v2.0 is now live
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black leading-[1.1] tracking-tighter">
                            Master the <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-500">Tech Market</span>
                        </h1>
                        <p className="text-xl text-slate-400 max-w-xl leading-relaxed">
                            Stop guessing. Start building. Follow curated roadmaps designed to take you from zero to job-ready in months, not years.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-5 pt-5">
                            <button 
                                onClick={() => navigate('/login')}
                                className="w-full sm:w-auto px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-500/40 group"
                            >
                                Start Learning Now <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="w-full sm:w-auto px-10 py-5 bg-slate-900 border border-slate-800 rounded-2xl font-black text-slate-300 hover:bg-slate-800 transition-all">
                                View Catalog
                            </button>
                        </div>
                        <div className="flex items-center gap-6 pt-10">
                            <div className="flex -space-x-3">
                                {[1,2,3,4].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-4 border-slate-950 bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                                        JS
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm font-bold text-slate-500">Join Over <span className="text-white">12,000+</span> Devs Worldwide</p>
                        </div>
                    </div>

                    <div className="relative group lg:block hidden">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-[3rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                        <div className="relative bg-slate-900 border border-slate-800 rounded-[3rem] p-8 aspect-square flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 opacity-20 pointer-events-none">
                                <pre className="text-[10px] leading-3 text-indigo-400 font-mono">
                                    {`function learnTech(skill) {
  if (skill.hard) {
    practice(skill);
    buildProject(skill);
  }
  return master(skill);
}

// Full Stack Roadmap
const stack = ['HTML', 'CSS', 'JS', 'React', 'Node'];
stack.forEach(tech => master(tech));`}
                                </pre>
                            </div>
                            <div className="relative z-10 w-full h-full bg-slate-950/50 rounded-2xl border border-white/5 flex items-center justify-center text-7xl p-20 text-center animate-rocket">
                                🚀
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Feature Grid */}
            <section className="bg-slate-900/50 border-t border-slate-800 py-24 relative z-10">
                <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {features.map((f, i) => (
                        <div key={i} className="group p-8 rounded-3xl bg-slate-950/50 border border-slate-800 hover:border-indigo-500/50 transition-all duration-300">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-400 text-2xl mb-6 group-hover:scale-110 transition-transform">
                                {f.icon}
                            </div>
                            <h3 className="text-xl font-black mb-3">{f.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Landing;
