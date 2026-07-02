import { useState } from 'react';
import { FiBookmark, FiPlus, FiTrash2, FiExternalLink, FiLink, FiTag } from 'react-icons/fi';
import PageHeader, { PAGE_SHELL } from '../components/layout/PageHeader';

const categoryColors = {
    'Documentation': { bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-100 dark:border-violet-800' },
    'Tutorial':      { bg: 'bg-fuchsia-50 dark:bg-fuchsia-900/20', text: 'text-fuchsia-600 dark:text-fuchsia-400', border: 'border-fuchsia-100 dark:border-fuchsia-800' },
    'YouTube':       { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-100 dark:border-rose-800' },
    'Tool':          { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-800' },
    'Article':       { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-100 dark:border-amber-800' },
    'Other':         { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-700' },
};

const defaultBookmarks = [
    { id: 1, title: 'React Official Docs',      url: 'https://react.dev',           category: 'Documentation', topic: 'React' },
    { id: 2, title: 'JavaScript.info',          url: 'https://javascript.info',     category: 'Tutorial',      topic: 'JavaScript' },
    { id: 3, title: 'Fireship YouTube',         url: 'https://youtube.com/@Fireship', category: 'YouTube',    topic: 'General' },
    { id: 4, title: 'CSS Tricks',               url: 'https://css-tricks.com',      category: 'Article',       topic: 'CSS' },
    { id: 5, title: 'Vite.js Build Tool',       url: 'https://vitejs.dev',          category: 'Tool',          topic: 'Tooling' },
    { id: 6, title: 'MDN Web Docs',             url: 'https://developer.mozilla.org', category: 'Documentation', topic: 'Web' },
];

const Bookmarks = () => {
    const [bookmarks, setBookmarks] = useState(defaultBookmarks);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', url: '', category: 'Other', topic: '' });
    const [filter, setFilter] = useState('All');

    const categories = ['All', 'Documentation', 'Tutorial', 'YouTube', 'Tool', 'Article', 'Other'];

    const addBookmark = () => {
        if (!form.title.trim() || !form.url.trim()) return;
        setBookmarks(prev => [...prev, { ...form, id: Date.now() }]);
        setForm({ title: '', url: '', category: 'Other', topic: '' });
        setShowForm(false);
    };

    const removeBookmark = (id) => {
        setBookmarks(prev => prev.filter(b => b.id !== id));
    };

    const filtered = filter === 'All' ? bookmarks : bookmarks.filter(b => b.category === filter);

    return (
        <div className={PAGE_SHELL}>
            <PageHeader
                title="Resources"
                description="Save links, tools, and references in one place."
                actions={(
                    <button
                        type="button"
                        onClick={() => setShowForm((v) => !v)}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-sky-600 text-white rounded-xl font-bold text-sm hover:bg-sky-700 transition-all"
                    >
                        <FiPlus size={16} /> Add resource
                    </button>
                )}
            />

            {/* Add Form */}
            {showForm && (
                <div className="bg-white dark:bg-slate-900 premium-shadow p-10 rounded-[2rem] border border-slate-100 dark:border-slate-800 space-y-6 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-3"><FiLink className="text-violet-600 dark:text-violet-400" /> New Resource</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Title</label>
                            <input value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="e.g. React Docs" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-violet-500/10 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">URL</label>
                            <input value={form.url} onChange={e => setForm(p => ({...p, url: e.target.value}))} placeholder="https://..." className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-violet-500/10 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Category</label>
                            <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none cursor-pointer">
                                {categories.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Topic / Tag</label>
                            <input value={form.topic} onChange={e => setForm(p => ({...p, topic: e.target.value}))} placeholder="e.g. React, JavaScript" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-violet-500/10 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" />
                        </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button onClick={addBookmark} className="px-10 py-5 bg-violet-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-violet-700 transition-all shadow-xl shadow-violet-100/50">Save Resource</button>
                        <button onClick={() => setShowForm(false)} className="px-10 py-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Cancel</button>
                    </div>
                </div>
            )}

            {/* Category Filter Pills */}
            <div className="flex flex-nowrap sm:flex-wrap gap-2 overflow-x-auto pb-1 scrollbar-none max-w-full">
                {categories.map(c => (
                    <button key={c} onClick={() => setFilter(c)} className={`shrink-0 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wide transition-all border ${filter === c ? 'bg-violet-600 text-white border-violet-600 shadow-xl shadow-violet-100/50' : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800 hover:border-violet-200 hover:text-violet-600 dark:hover:text-violet-400'}`}>
                        {c} {c !== 'All' && `(${bookmarks.filter(b => b.category === c).length})`}
                    </button>
                ))}
            </div>

            {/* Bookmarks Grid */}
            {filtered.length === 0 ? (
                <div className="p-20 text-center bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <div className="text-6xl mb-6">📌</div>
                    <p className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em]">No resources yet</p>
                    <button onClick={() => setShowForm(true)} className="mt-8 text-violet-600 dark:text-violet-400 font-black hover:underline text-sm uppercase tracking-widest">Add your first resource &rarr;</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(b => {
                        const color = categoryColors[b.category] || categoryColors['Other'];
                        return (
                            <div key={b.id} className="bg-white dark:bg-slate-900 premium-shadow p-6 rounded-3xl border border-slate-200 dark:border-slate-800 group hover:-translate-y-1 transition-all relative">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white shrink-0 shadow-sm border border-slate-200 dark:border-slate-700 group-hover:bg-violet-50 dark:group-hover:bg-violet-900/30 group-hover:text-violet-600 dark:group-hover:text-violet-400 group-hover:border-violet-200 dark:group-hover:border-violet-700 transition-all duration-500">
                                        <FiBookmark size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                                            <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest border ${color.bg} ${color.text} ${color.border}`}>{b.category}</span>
                                            {b.topic && (
                                                <span className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                    <FiTag size={9} /> {b.topic}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-black text-slate-900 dark:text-white truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors uppercase tracking-tight leading-tight">{b.title}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1 truncate">{b.url}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
                                    <a href={b.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-4 py-2 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-lg text-xs font-black uppercase tracking-widest border border-violet-100 dark:border-violet-800 hover:bg-violet-600 hover:text-white transition-all">
                                        <FiExternalLink size={12} /> Open Resource
                                    </a>
                                    <button onClick={() => removeBookmark(b.id)} className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-black uppercase tracking-widest border border-red-700 hover:bg-red-700 transition-all ml-auto">
                                        <FiTrash2 size={12} /> Remove
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 premium-shadow p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                    <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{bookmarks.length} Resources Indexed</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-2">Saved on this device for quick access. Sign in to sync notes and goals to your account.</p>
                </div>
                <div className="text-6xl group-hover:scale-110 transition-transform hidden md:block">🗂️</div>
            </div>
        </div>
    );
};

export default Bookmarks;
