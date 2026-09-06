import { useState } from 'react';
import { courses } from '../data/CourseData';
import { FiChevronRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';

const countTopics = (roadmap = []) =>
    roadmap.reduce((sum, chapter) => sum + (chapter.topics?.length ?? 0), 0);

const TrackCard = ({ course, onOpen, compact = false }) => {
    const chapterCount = course.roadmap?.length ?? 0;
    const topicCount = countTopics(course.roadmap);
    const visibleTools = compact ? 4 : 5;

    return (
        <article
            role="button"
            tabIndex={0}
            onClick={() => onOpen(course.id)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onOpen(course.id);
                }
            }}
            className={`group relative flex h-full min-w-0 cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-500/10 active:scale-[0.99] ${
                compact ? 'min-h-[15rem] p-5 gap-4' : 'min-h-[16.5rem] p-5'
            }`}
        >
            <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-violet-500/5 blur-2xl transition-transform duration-700 group-hover:scale-150" />

            <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-3.5">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-2xl shadow-sm transition-all group-hover:scale-105 group-hover:border-violet-200">
                        {course.icon}
                    </div>
                    <span className="inline-flex shrink-0 items-center rounded-full border border-violet-100 bg-violet-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-violet-600">
                        {course.category}
                    </span>
                </div>

                <div className="min-w-0 space-y-2">
                    <h3 className="text-base font-black leading-snug text-slate-900 transition-colors group-hover:text-violet-600 break-words line-clamp-2 lg:text-[1.05rem]">
                        {course.title}
                    </h3>
                    <p className="text-xs sm:text-sm font-medium leading-relaxed text-slate-500 line-clamp-3">
                        {course.description}
                    </p>
                </div>

                <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
                    {course.tools.slice(0, visibleTools).map((tool) => (
                        <span
                            key={tool}
                            className="max-w-[7rem] truncate rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold capitalize text-slate-600"
                        >
                            {tool}
                        </span>
                    ))}
                    {course.tools.length > visibleTools && (
                        <span className="shrink-0 rounded-md border border-violet-100 bg-violet-50 px-2.5 py-1 text-[10px] font-black text-violet-600">
                            +{course.tools.length - visibleTools}
                        </span>
                    )}
                </div>
            </div>

            <div className="relative z-10 mt-3.5 flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 pt-3.5">
                <div className="min-w-0">
                    <div className="flex items-baseline gap-1">
                        <span className="text-lg font-black tabular-nums leading-none text-slate-900">
                            {chapterCount}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wider text-violet-500">
                            Chapters
                        </span>
                    </div>
                    {topicCount > 0 && (
                        <p className="mt-0.5 text-[10px] font-bold text-slate-400">
                            {topicCount} topics · {course.tools.length} tools
                        </p>
                    )}
                </div>
                <span className="inline-flex shrink-0 items-center gap-0.5 rounded-lg bg-red-600 px-3.5 py-2 text-[10px] font-black uppercase tracking-wide text-white shadow-md shadow-red-500/25 transition-colors group-hover:bg-red-700">
                    Begin <FiChevronRight size={12} />
                </span>
            </div>
        </article>
    );
};

const CourseCatalog = () => {
    const [category, setCategory] = useState('All');
    const navigate = useNavigate();

    const categories = ['All', ...new Set(courses.map((c) => c.category))];

    const filteredCourses = courses.filter((c) => category === 'All' || c.category === category);

    const categoryFilters = (
        <div className="flex max-w-full flex-nowrap gap-2.5 sm:gap-3 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-2 sm:p-2.5 [-webkit-overflow-scrolling:touch] scrollbar-none sm:flex-wrap [mask-image:linear-gradient(to_right,black_85%,transparent)] sm:[mask-image:none]">
            {categories.map((cat) => (
                <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`shrink-0 rounded-lg border px-3.5 py-2.5 min-h-[40px] sm:min-h-[44px] text-[10px] font-black transition-all active:scale-95 sm:px-4 sm:py-2 sm:text-xs ${
                        category === cat
                            ? 'border-sky-500 bg-sky-600 text-white shadow-md shadow-sky-500/20'
                            : 'border-slate-200 bg-white text-slate-500 hover:border-sky-300 hover:text-sky-600'
                    }`}
                >
                    {cat.toUpperCase()}
                </button>
            ))}
        </div>
    );

    const openCourse = (courseId) => navigate(`/roadmap/${courseId}`);

    return (
        <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col">
            <div className="shrink-0 space-y-2 border-b border-slate-200 bg-white pb-2 dark:border-slate-800 dark:bg-slate-950">
                <PageHeader
                    dense
                    embedded
                    title="Mastery Tracks"
                    description="Systematic learning paths engineered for rapid technical progression."
                />
                <div className="w-full min-w-0 pb-0.5">
                    {categoryFilters}
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto pb-20 pt-3 md:pb-4 max-md:overscroll-y-contain max-md:[-webkit-overflow-scrolling:touch]">
                {/* Mobile — stacked cards */}
                <div className="flex w-full min-w-0 flex-col gap-5 md:hidden">
                    {filteredCourses.map((course) => (
                        <TrackCard key={course.id} course={course} onOpen={openCourse} compact />
                    ))}
                </div>

                {/* Desktop — full-width grid */}
                <div className="hidden w-full min-w-0 md:grid md:grid-cols-2 md:gap-4 lg:gap-5 xl:grid-cols-4 xl:gap-5 pb-2">
                    {filteredCourses.map((course) => (
                        <TrackCard key={course.id} course={course} onOpen={openCourse} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CourseCatalog;
