import { useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiUser, FiBell, FiMail, FiCheckCircle, FiMessageCircle } from 'react-icons/fi';
import PageHeader, { PAGE_SHELL } from '../components/layout/PageHeader';
import ReportIssueForm from '../components/feedback/ReportIssueForm';
import { formatReminderTime } from '../utils/formatReminderTime';
import { REMINDER_TIMEZONE_LABEL } from '../config/reminderTimezone';
import API from '../services/api';

const Settings = () => {
    const { user, updateProfile } = useContext(AuthContext);
    const location = useLocation();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        reminderEmail: user?.reminderEmail || user?.email || '',
    });

    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [amPm, setAmPm] = useState(user?.reminderAmPm || 'AM');
    const [reminderTime, setReminderTime] = useState(user?.reminderTime || '');
    const [reminderStatus, setReminderStatus] = useState(null);

    const loadReminderStatus = useCallback(async () => {
        try {
            const { data } = await API.get('auth/reminder-status');
            setReminderStatus(data);
        } catch (err) {
            console.warn('Could not load reminder status', err);
        }
    }, []);

    const savedSnapshot = useMemo(() => {
        if (!user) return null;
        return JSON.stringify({
            name: user.name || '',
            reminderEmail: user.reminderEmail || user.email || '',
            reminderTime: user.reminderTime || '',
            reminderAmPm: user.reminderAmPm || 'AM',
        });
    }, [user]);

    const hasUnsavedChanges = useMemo(() => {
        if (!savedSnapshot) return false;
        const current = JSON.stringify({
            name: formData.name,
            reminderEmail: formData.reminderEmail,
            reminderTime,
            reminderAmPm: amPm,
        });
        return current !== savedSnapshot;
    }, [savedSnapshot, formData, reminderTime, amPm]);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                reminderEmail: user.reminderEmail || user.email || '',
            });
            setAmPm(user.reminderAmPm || 'AM');
            setReminderTime(user.reminderTime || '');
        }
    }, [user]);

    useEffect(() => {
        loadReminderStatus();
    }, [loadReminderStatus, user?.reminderTime, user?.emailNotification]);

    useEffect(() => {
        const hash = location.hash.replace('#', '');
        if (hash === 'reminders' || hash === 'feedback') {
            requestAnimationFrame(() => {
                document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        }
    }, [location.hash]);

    const applyAmPmToTime = (time24, nextAmPm) => {
        const [hStr, m] = time24.split(':');
        const hour12 = (parseInt(hStr, 10) % 12) || 12;
        const hour24 =
            nextAmPm === 'AM'
                ? (hour12 === 12 ? 0 : hour12)
                : (hour12 === 12 ? 12 : hour12 + 12);
        return `${String(hour24).padStart(2, '0')}:${m}`;
    };

    const amPmFromTime = (time24) => (parseInt(time24.split(':')[0], 10) >= 12 ? 'PM' : 'AM');

    const handleAmPmChange = (value) => {
        if (!reminderTime) return;
        setAmPm(value);
        setReminderTime((prev) => applyAmPmToTime(prev, value));
    };

    const handleTimeChange = (value) => {
        setReminderTime(value);
        setAmPm(amPmFromTime(value));
        if (value) setSaveError('');
    };

    const handleSave = async () => {
        setSaveError('');
        setSaving(true);
        setSaved(false);
        try {
            await updateProfile({
                name: formData.name,
                reminderEmail: formData.reminderEmail.trim(),
                ...(reminderTime ? { reminderTime, reminderAmPm: amPm } : { reminderTime: '', reminderAmPm: '' }),
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
            loadReminderStatus();
        } catch (error) {
            console.error('Failed to update profile:', error);
            setSaveError(error.response?.data?.message || 'Failed to save preferences. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={PAGE_SHELL}>
            <PageHeader
                title="Settings"
                description="Profile and daily email reminders."
                actions={(
                    <>
                        {hasUnsavedChanges && (
                            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 text-center sm:text-right">
                                Unsaved changes
                            </p>
                        )}
                        {saveError && (
                            <p className="text-xs font-semibold text-rose-600 text-center sm:text-right">{saveError}</p>
                        )}
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={!hasUnsavedChanges || saving}
                            className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 dark:bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-sky-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {saving ? 'Saving…' : 'Save'} {saved && !saving && <FiCheckCircle className="animate-in zoom-in duration-300" />}
                        </button>
                    </>
                )}
            />

            <div className={`max-w-2xl rounded-2xl p-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                user?.isAdmin
                    ? 'bg-violet-50 dark:bg-violet-950/30 border-violet-100 dark:border-violet-900/50'
                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'
            }`}>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-slate-900 dark:text-white break-words">
                        Signed in as <span className="text-sky-600 break-all">{user?.email}</span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {user?.isAdmin ? 'You have admin access.' : 'Your session stays active on this device.'}
                    </p>
                </div>
                {user?.isAdmin ? (
                    <Link
                        to="/admin"
                        className="shrink-0 px-4 py-2.5 bg-violet-600 text-white rounded-xl font-bold text-sm hover:bg-violet-700 transition-all text-center"
                    >
                        Open admin panel
                    </Link>
                ) : null}
            </div>

            <div className="max-w-2xl bg-white dark:bg-slate-900 premium-shadow rounded-2xl p-6 border border-slate-100 dark:border-slate-800 space-y-5">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <FiUser size={16} className="text-sky-500" />
                    Profile
                </h3>
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full h-11 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Email</label>
                        <div className="relative">
                            <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="email"
                                readOnly
                                value={user?.email || ''}
                                className="w-full h-11 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-3.5 text-sm font-semibold text-slate-500 dark:text-slate-400 cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div id="reminders" className="max-w-2xl bg-white dark:bg-slate-900 premium-shadow rounded-2xl p-6 border border-slate-100 dark:border-slate-800 scroll-mt-24 space-y-5">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <FiBell size={16} className="text-rose-500" />
                    Email reminders
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                    Daily reminders go to your reminder email (defaults to your login email). Tap the bell on each goal on Daily Goals.
                </p>

                {reminderStatus && (
                    <div className={`rounded-xl border px-4 py-3 text-xs font-medium space-y-2 ${
                        reminderStatus.willSendWhenDue
                            ? 'border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300'
                            : 'border-amber-100 dark:border-amber-900/40 bg-amber-50/80 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200'
                    }`}>
                        <p className="font-bold">
                            {reminderStatus.willSendWhenDue
                                ? `Ready — emails send after ${formatReminderTime(reminderStatus.reminderTime, reminderStatus.reminderAmPm)} ${REMINDER_TIMEZONE_LABEL} when you have incomplete goals.`
                                : 'Complete these steps to receive reminder emails:'}
                        </p>
                        <ul className="space-y-1 list-disc pl-4">
                            <li className={reminderStatus.checklist?.timeSet ? 'opacity-70' : ''}>
                                {reminderStatus.checklist?.timeSet ? '✓' : '○'} Reminder time saved below
                            </li>
                            <li className={reminderStatus.checklist?.goalsReady ? 'opacity-70' : ''}>
                                {reminderStatus.checklist?.goalsReady ? '✓' : '○'} At least one incomplete daily goal with bell on
                            </li>
                            <li className={reminderStatus.checklist?.notificationsOn ? 'opacity-70' : ''}>
                                {reminderStatus.checklist?.notificationsOn ? '✓' : '○'} Daily email reminders turned on
                            </li>
                        </ul>
                        {reminderStatus.sentToday && (
                            <p className="text-[11px] opacity-90">Today&apos;s reminder was already sent. You won&apos;t get another until tomorrow.</p>
                        )}
                        {!reminderStatus.dueNow && reminderStatus.checklist?.timeSet && !reminderStatus.sentToday && (
                            <p className="text-[11px] opacity-90">
                                Server time now: {reminderStatus.localTime} {REMINDER_TIMEZONE_LABEL}. Emails send after your chosen time.
                            </p>
                        )}
                    </div>
                )}

                <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Reminder email
                    </label>
                    <div className="relative">
                        <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={formData.reminderEmail}
                            onChange={(e) => setFormData({ ...formData, reminderEmail: e.target.value })}
                            className="w-full h-11 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-3.5 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all"
                        />
                    </div>
                    {!formData.reminderEmail && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            Leave blank to use your login email ({user?.email}).
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3">
                    <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Daily email reminders</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Turn off to stop all reminder emails.
                        </p>
                    </div>
                    <button
                        type="button"
                        role="switch"
                        aria-checked={user?.emailNotification !== false}
                        onClick={async () => {
                            const next = user?.emailNotification === false;
                            try {
                                await updateProfile({ emailNotification: next });
                                loadReminderStatus();
                            } catch (err) {
                                console.error('Failed to update email reminders:', err);
                            }
                        }}
                        className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${user?.emailNotification !== false ? 'bg-violet-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                        <span
                            className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${user?.emailNotification !== false ? 'translate-x-5' : ''}`}
                        />
                    </button>
                </div>

                {user?.reminderTime ? (
                    <div className="rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/80 dark:bg-emerald-950/30 px-4 py-3 text-xs text-emerald-800 dark:text-emerald-300 font-medium break-words">
                        Active: emails send at <strong>{formatReminderTime(user.reminderTime, user.reminderAmPm)} {REMINDER_TIMEZONE_LABEL}</strong> for incomplete goals with the bell on.
                    </div>
                ) : (
                    <div className="rounded-xl border border-amber-100 dark:border-amber-900/40 bg-amber-50/80 dark:bg-amber-950/30 px-4 py-3 text-xs text-amber-800 dark:text-amber-300 font-medium">
                        No send time saved yet — pick a time below and tap <strong>Save</strong>.
                    </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
                    <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Send at</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 break-words">
                            {reminderTime ? `${REMINDER_TIMEZONE_LABEL} — save to apply` : 'Pick a time — no default until you save'}
                        </p>
                    </div>
                    <div className="flex w-full sm:w-auto items-center justify-between sm:justify-start bg-slate-50 dark:bg-slate-800 rounded-xl p-2 gap-2 border border-slate-200 dark:border-slate-700 shrink-0">
                        <input
                            type="time"
                            value={reminderTime}
                            onChange={(e) => handleTimeChange(e.target.value)}
                            className="bg-transparent border-none text-sm font-bold text-slate-900 dark:text-white focus:ring-0 p-1 cursor-pointer outline-none"
                        />
                        <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />
                        {['AM', 'PM'].map((period) => (
                            <button
                                key={period}
                                type="button"
                                onClick={() => handleAmPmChange(period)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${amPm === period ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-sky-600'}`}
                            >
                                {period}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div id="feedback" className="max-w-2xl bg-white dark:bg-slate-900 premium-shadow rounded-2xl p-6 border border-slate-100 dark:border-slate-800 scroll-mt-24 space-y-5">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <FiMessageCircle size={16} className="text-sky-500" />
                    Report an issue
                </h3>
                <ReportIssueForm />
            </div>
        </div>
    );
};

export default Settings;
