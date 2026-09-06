import { Fragment, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiX } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import { getHomePath } from '../utils/authSession';
import { Header } from '../components/ui/header-2';
import LandingModuleIcon from '../components/landing/LandingModuleIcon';
import ModulePreview from '../components/landing/ModulePreview';
import ScrollReveal from '../components/landing/ScrollReveal';
import Logo from '../components/brand/Logo';

const modules = [
    { id: 'dashboard', icon: 'dashboard', title: 'Dashboard', desc: 'See active learning paths and goal progress in one place.' },
    { id: 'roadmaps', icon: 'roadmaps', title: 'Roadmaps', desc: 'Browse structured course roadmaps across development, AI, frontend, and more.' },
    { id: 'daily-goals', icon: 'goals', title: 'Daily Goals', desc: 'Set daily objectives, build streaks, and get email reminders for incomplete tasks.' },
    { id: 'resources', icon: 'resources', title: 'Resources', desc: 'Organize docs, tutorials, videos, and tools in your personal resource library.' },
    { id: 'email-reminders', icon: 'email', title: 'Email Reminders', desc: 'Get daily email nudges for incomplete goals so you stay consistent without checking the app.' },
    { id: 'study-notes', icon: 'notes', title: 'Study Notes', desc: 'Save daily learnings and future plans — synced securely to your account.' },
];

const stack = ['React', 'Node.js', 'MongoDB', 'JWT', 'Email OTP', 'Tailwind'];

const tickerItems = ['Roadmaps', 'Daily goals', 'Email reminders', 'Study notes', 'Resources', 'Dashboard'];

const Landing = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [activeModule, setActiveModule] = useState(null);

    useEffect(() => {
        if (user) {
            navigate(getHomePath(user), { replace: true });
        }
    }, [user, navigate]);

    const scrollToLogin = () => {
        navigate('/login');
    };

    const handleGetStarted = () => {
        if (user) {
            navigate(getHomePath(user));
            return;
        }
        navigate('/login');
    };

    const focusModule = (moduleId) => {
        setActiveModule((prev) => (prev === moduleId ? null : moduleId));
    };

    const workflowSteps = [
        { step: '01', label: 'Log in', desc: 'Sign in with email OTP', action: scrollToLogin },
        { step: '02', label: 'Pick a roadmap', desc: 'Choose your learning path', action: () => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }) },
        { step: '03', label: 'Set daily goals', desc: 'Build streaks & habits', action: () => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }) },
        { step: '04', label: 'Track progress', desc: 'Dashboard & resources', action: () => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }) },
    ];

    return (
        <div className="min-h-screen landing-page-bg font-body selection:bg-sky-500/30 overflow-x-hidden">
            <div className="landing-bg-shapes" aria-hidden>
                <svg className="landing-bg-shape top-[14%] left-[6%] w-28 h-28 md:w-36 md:h-36" viewBox="0 0 100 100" fill="none">
                    <polygon points="50,8 92,50 50,92 8,50" stroke="currentColor" strokeWidth="0.8" />
                    <line x1="50" y1="8" x2="50" y2="92" stroke="currentColor" strokeWidth="0.4" />
                    <line x1="8" y1="50" x2="92" y2="50" stroke="currentColor" strokeWidth="0.4" />
                </svg>
                <svg className="landing-bg-shape top-[22%] right-[10%] w-20 h-20 md:w-28 md:h-28 opacity-60" viewBox="0 0 100 100" fill="none">
                    <polygon points="50,12 88,75 12,75" stroke="currentColor" strokeWidth="0.7" />
                    <line x1="50" y1="12" x2="12" y2="75" stroke="currentColor" strokeWidth="0.4" />
                    <line x1="50" y1="12" x2="88" y2="75" stroke="currentColor" strokeWidth="0.4" />
                    <line x1="12" y1="75" x2="88" y2="75" stroke="currentColor" strokeWidth="0.4" />
                </svg>
                <svg className="landing-bg-shape bottom-[28%] left-[12%] w-16 h-16 md:w-24 md:h-24 opacity-50" viewBox="0 0 100 100" fill="none">
                    <rect x="25" y="25" width="50" height="50" stroke="currentColor" strokeWidth="0.6" transform="rotate(45 50 50)" />
                </svg>
                <svg className="landing-bg-shape bottom-[18%] right-[14%] w-24 h-24 md:w-32 md:h-32 opacity-70" viewBox="0 0 100 100" fill="none">
                    <polygon points="50,5 95,50 50,95 5,50" stroke="currentColor" strokeWidth="0.5" />
                    <polygon points="50,20 80,50 50,80 20,50" stroke="currentColor" strokeWidth="0.4" />
                </svg>
            </div>

            <div className="relative z-[1]">
            <div className="pt-10 md:pt-12 px-4 sm:px-6">
                <Header />
            </div>

            {/* Hero */}
            <section className="relative overflow-hidden w-full px-5 sm:px-8 xl:px-10 pt-12 md:pt-20 pb-10 md:pb-24">
                <div className="pointer-events-none absolute inset-0 -z-10 landing-hero-mesh" aria-hidden />

                <div className="relative z-10 max-w-6xl mx-auto text-center">
                        <ScrollReveal delay={100} distance={72} duration={0.7}>
                        <h1 className="landing-display flex flex-col items-center gap-1 sm:gap-2 md:gap-3 text-[2.75rem] leading-[0.95] sm:text-6xl md:text-8xl lg:text-[7.5rem] xl:text-[8.5rem] landing-heading-text mb-2 !tracking-[0.02em] max-w-full px-1">
                            <span className="landing-accent-text">Learning</span>
                            <span>Tracker</span>
                        </h1>
                        </ScrollReveal>

                        <ScrollReveal delay={200} distance={48}>
                        <p className="landing-hero-tagline text-lg sm:text-xl md:text-2xl landing-body-text mt-5 mb-8">
                            <span className="landing-accent-text">Build Consistency</span>
                            {', Not Just Knowledge.'}
                        </p>
                        </ScrollReveal>

                        <ScrollReveal delay={300} distance={40}>
                        <p className="text-sm md:text-base landing-body-text max-w-2xl mx-auto font-medium leading-relaxed mb-6 md:mb-10">
                            You don&apos;t need perfect motivation — you need a system. Pick a path, hit one goal a day,
                            and stack small wins until studying feels automatic. We&apos;ll remind you before you fall behind.
                        </p>
                        </ScrollReveal>

                        <ScrollReveal delay={400} distance={40}>
                        <div className="flex flex-col items-center gap-3">
                            <button
                                type="button"
                                onClick={handleGetStarted}
                                className="landing-cta w-auto max-w-[280px] sm:max-w-none px-7 py-3 sm:px-10 sm:py-4 text-white rounded-full landing-nav-label text-xs sm:text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] min-h-[44px]"
                            >
                                {user ? 'Go to dashboard' : 'Get started'} <FiArrowRight size={14} className="sm:w-4 sm:h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/walkthrough')}
                                className="landing-nav-label text-[10px] sm:text-xs landing-muted-text hover:text-sky-300 transition-colors underline underline-offset-4"
                            >
                                See the app in action
                            </button>
                        </div>
                        </ScrollReveal>

                        <ScrollReveal className="mt-8 md:mt-12 overflow-hidden py-2" delay={500} distance={24}>
                            <div className="flex w-max landing-hero-ticker gap-8">
                                {[...tickerItems, ...tickerItems].map((item, i) => (
                                    <span key={`${item}-${i}`} className="landing-nav-label text-xs landing-muted-text whitespace-nowrap">
                                        {item}
                                        <span className="text-white/15 ml-8">/</span>
                                    </span>
                                ))}
                            </div>
                        </ScrollReveal>

                        <ScrollReveal className="xl:hidden mt-16 sm:mt-14 text-center" delay={550} amount={0.1}>
                            <p className="landing-nav-label text-xs landing-muted-text mb-3">How it works</p>
                            <div className="flex flex-wrap justify-center items-center gap-2 text-xs font-bold landing-body-text">
                                {workflowSteps.map((item, i) => (
                                    <span key={item.step} className="inline-flex items-center gap-2">
                                        {i > 0 && <span className="text-white/20">→</span>}
                                        <button type="button" onClick={item.action} className="hover:text-sky-300 transition-colors">
                                            <span className="landing-accent-text mr-1">{item.step}</span>
                                            {item.label}
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </ScrollReveal>
                </div>
            </section>

            <section id="about" className="relative py-16 md:py-24">
                <div className="hidden 2xl:block pointer-events-none absolute left-8 top-1/2 -translate-y-1/2">
                    <p className="landing-display text-[10rem] text-white/[0.04] leading-none select-none [writing-mode:vertical-rl] rotate-180">LEARN</p>
                </div>
                <div className="hidden 2xl:block pointer-events-none absolute right-8 top-1/2 -translate-y-1/2">
                    <p className="landing-display text-[10rem] text-white/[0.04] leading-none select-none [writing-mode:vertical-rl]">TRACK</p>
                </div>

                <div className="max-w-6xl mx-auto px-5 sm:px-8 relative z-10">
                    <ScrollReveal className="text-center mb-12 md:mb-16" distance={64} amount={0.3} duration={0.6}>
                        <h2 className="landing-display text-3xl md:text-5xl landing-heading-text mb-4">
                            About us
                        </h2>
                        <p className="landing-body-text font-medium max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
                            Learning Tracker is a free app for self-learners — plan roadmaps, hit daily goals, save notes,
                            and get email reminders. Everything below is what you get after you log in.
                        </p>
                        <p className="landing-accent-text landing-nav-label text-xs mt-3 max-sm:hidden">Click any module to preview</p>
                        <p className="landing-accent-text landing-nav-label text-xs mt-3 sm:hidden">Tap any module to preview</p>
                    </ScrollReveal>

                    <div className="flex flex-col items-center gap-5 max-sm:gap-4 max-sm:px-2 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-5 md:gap-6 sm:items-stretch w-full">
                        {modules.map((mod, index) => {
                            const isActive = activeModule === mod.id;
                            const isBlurred = activeModule && !isActive;
                            return (
                                <Fragment key={mod.title}>
                                <ScrollReveal
                                    delay={0}
                                    direction="up"
                                    distance={36}
                                    amount={0.38}
                                    viewportMargin="0px 0px 6% 0px"
                                    once
                                    duration={0.48}
                                    className="w-full flex justify-center sm:block max-sm:mb-1"
                                >
                                <article
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => focusModule(mod.id)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            focusModule(mod.id);
                                        }
                                    }}
                                    className={`group relative rounded-2xl landing-card-dark flex flex-col cursor-pointer transition-all duration-300 overflow-hidden w-full min-w-0 ${
                                        isActive
                                            ? 'min-h-[16rem] sm:min-h-[20rem] md:min-h-[24rem]'
                                            : 'max-sm:min-h-[11.5rem] max-sm:hover:-translate-y-0.5 max-sm:active:scale-[0.99]'
                                    } ${
                                        isActive
                                            ? 'border-sky-400/60 shadow-xl shadow-sky-500/20 ring-2 ring-sky-500/20 z-20'
                                            : isBlurred
                                              ? 'border-white/5 blur-[5px] opacity-40'
                                              : 'hover:border-sky-400/40 hover:shadow-sky-500/10 sm:hover:-translate-y-1'
                                    }`}
                                >
                                    {isActive ? (
                                        <div className="absolute inset-0 z-10 flex flex-col p-4 md:p-5 rounded-2xl landing-card-dark">
                                            <div className="flex items-center justify-between gap-2 mb-3">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <LandingModuleIcon moduleId={mod.id} size="compact" />
                                                    <h3 className="landing-display text-sm landing-heading-text !tracking-tight truncate">{mod.title}</h3>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); setActiveModule(null); }}
                                                    className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/15 text-slate-300 flex items-center justify-center shrink-0"
                                                    aria-label="Close preview"
                                                >
                                                    <FiX size={14} />
                                                </button>
                                            </div>
                                            <div className="flex-1 min-h-0 overflow-hidden">
                                                <ModulePreview moduleId={mod.id} />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); scrollToLogin(); }}
                                                className="text-left landing-nav-label text-xs landing-accent-text hover:text-sky-300 flex items-center gap-1.5 mt-3 pt-2 border-t border-white/10"
                                            >
                                                Unlock free <FiArrowRight size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="px-4 py-5 sm:p-6 md:p-7 flex flex-col max-sm:min-h-[11.5rem] max-sm:justify-between">
                                            <div className="flex items-center gap-3 sm:block sm:mb-0">
                                                <div className="shrink-0 group-hover:scale-105 transition-transform sm:mb-5">
                                                    <LandingModuleIcon moduleId={mod.id} size="default" />
                                                </div>
                                                <h3 className="flex-1 min-w-0 landing-display text-sm sm:text-lg landing-heading-text sm:mb-2 !tracking-tight leading-tight break-words">
                                                    {mod.title}
                                                </h3>
                                            </div>
                                            <p className="text-xs sm:text-sm landing-body-text font-medium leading-relaxed text-center sm:text-left mt-3 sm:mt-0 mb-3 sm:mb-5 sm:flex-1">
                                                {mod.desc}
                                            </p>
                                            <span className="landing-nav-label text-[10px] sm:text-xs landing-accent-text flex items-center justify-center sm:justify-start gap-1 shrink-0">
                                                <span className="sm:hidden">Tap to preview</span>
                                                <span className="hidden sm:inline">Click to preview</span>
                                                <FiArrowRight size={11} className="sm:w-3.5 sm:h-3.5" />
                                            </span>
                                        </div>
                                    )}
                                </article>
                                </ScrollReveal>
                                </Fragment>
                            );
                        })}
                    </div>

                    {/* Workflow */}
                    <ScrollReveal
                        id="workflow"
                        className="mt-14 sm:mt-20 md:mt-32 pt-10 sm:pt-16 md:pt-24 pb-4 md:pb-8 border-t border-white/10"
                        distance={48}
                        amount={0.2}
                    >
                        <div className="text-center mb-6 sm:mb-14 md:mb-20 px-1">
                            <p className="landing-nav-label text-xs sm:text-lg md:text-xl text-white mb-1.5 sm:mb-3 tracking-[0.2em]">Workflow</p>
                            <h3 className="landing-display text-xl sm:text-3xl md:text-5xl lg:text-6xl landing-heading-text mb-2 sm:mb-4 leading-tight">
                                Start here, <span className="landing-accent-text">stay consistent</span>
                            </h3>
                            <p className="landing-body-text font-medium text-xs sm:text-sm md:text-base max-w-sm sm:max-w-xl mx-auto leading-relaxed">
                                Log in once with email OTP, follow four simple steps, and turn scattered study sessions into a routine that lasts.
                            </p>
                        </div>

                        <div className="relative max-w-md sm:max-w-6xl mx-auto">
                            <div
                                className="hidden md:block absolute top-5 left-[12%] right-[12%] h-px bg-sky-500/35"
                                aria-hidden
                            />

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 sm:gap-6 md:gap-8">
                                {workflowSteps.map((item, index) => (
                                    <ScrollReveal
                                        key={item.step}
                                        delay={index * 120}
                                        direction="up"
                                        distance={50}
                                        amount={0.3}
                                        className="relative"
                                    >
                                        <button
                                            type="button"
                                            onClick={item.action}
                                            className="group w-full min-w-0 text-left md:text-center rounded-lg sm:rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 sm:p-5 md:border-0 md:bg-transparent md:p-0 hover:border-sky-500/30 md:hover:border-0 transition-colors"
                                        >
                                            <div className="flex flex-col items-start md:items-center gap-2 sm:gap-3 md:gap-4">
                                                <div className="relative z-10 flex items-center gap-2 sm:gap-3 md:flex-col md:gap-4">
                                                    <span className="w-6 h-6 sm:w-10 sm:h-10 rounded-full bg-[#08080d] border-2 sm:border-[3px] border-sky-500 group-hover:bg-sky-600 group-hover:border-sky-400 transition-all shadow-sm shadow-sky-500/20 sm:shadow-sky-500/30 shrink-0" />
                                                    <span className="landing-display text-sm sm:text-xl md:text-2xl landing-accent-text">{item.step}</span>
                                                </div>
                                                <div className="w-full min-w-0 md:mt-0 md:px-2">
                                                    <p className="text-sm sm:text-base md:text-lg font-bold landing-heading-text group-hover:text-sky-300 transition-colors">{item.label}</p>
                                                    <p className="text-xs sm:text-sm md:text-base landing-muted-text mt-0.5 sm:mt-1.5 md:mt-2 leading-snug sm:leading-relaxed">{item.desc}</p>
                                                </div>
                                            </div>
                                        </button>
                                        {index < workflowSteps.length - 1 && (
                                            <div className="md:hidden flex justify-center py-0.5" aria-hidden>
                                                <span className="w-px h-2.5 bg-white/15" />
                                            </div>
                                        )}
                                    </ScrollReveal>
                                ))}
                            </div>

                            <div className="mt-7 sm:mt-14 md:mt-16 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-4">
                                <button
                                    type="button"
                                    onClick={scrollToLogin}
                                    className="landing-cta landing-nav-label text-xs md:text-sm text-white px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-full inline-flex items-center gap-2 transition-all group active:scale-[0.98]"
                                >
                                    Get started <FiArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/walkthrough')}
                                    className="landing-nav-label text-xs md:text-sm landing-body-text px-6 py-3 rounded-full border border-white/15 hover:border-sky-400/40 hover:text-sky-300 transition-colors inline-flex items-center gap-2"
                                >
                                    Preview the app <FiArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            <section className="py-12">
                <ScrollReveal className="max-w-6xl mx-auto px-5 sm:px-8 text-center" distance={48} amount={0.25}>
                    <p className="landing-nav-label text-xs landing-muted-text mb-6">Built with</p>
                    <div className="flex flex-wrap justify-center gap-3 md:gap-5">
                        {stack.map((tech) => (
                            <span key={tech} className="landing-nav-label text-xs landing-pill-dark px-4 py-2 rounded-full">
                                {tech}
                            </span>
                        ))}
                    </div>
                </ScrollReveal>
            </section>

            <section id="get-started" className="py-24 md:py-32">
                <div className="max-w-3xl mx-auto px-5 sm:px-8">
                    <ScrollReveal className="text-center mb-14 md:mb-16" distance={64} amount={0.3}>
                        <h2 className="landing-display flex flex-col items-center gap-2 md:gap-3 text-4xl md:text-6xl landing-heading-text mb-6 !tracking-[0.02em]">
                            <span>Start tracking</span>
                            <span className="landing-accent-text">today</span>
                        </h2>
                        <p className="landing-body-text font-medium text-sm md:text-base mb-4">
                            Create your free account — use for free.
                        </p>
                    </ScrollReveal>
                    <ScrollReveal delay={150} direction="left" distance={80} amount={0.2}>
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-lg shadow-slate-200/50 p-6 sm:p-10 text-center space-y-6">
                        <p className="text-slate-600 font-medium">
                            Sign in with your email. Set reminder time in Settings and turn the bell on for daily goals.
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-lg shadow-violet-200 transition-all"
                        >
                            Get started with OTP
                            <FiArrowRight />
                        </button>
                    </div>
                    </ScrollReveal>
                </div>
            </section>

            <footer className="py-10 text-center">
                <ScrollReveal className="flex flex-col items-center gap-4" distance={40} amount={0.3}>
                    <Logo className="w-10 h-10 opacity-80" />
                    <p className="landing-nav-label text-xs landing-muted-text">© 2026 Learning Tracker</p>
                </ScrollReveal>
            </footer>
            </div>
        </div>
    );
};

export default Landing;
