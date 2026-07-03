import {
    MdDashboard,
    MdMenuBook,
    MdTrackChanges,
    MdEditNote,
    MdBookmark,
    MdInsights,
    MdSettings,
    MdMail,
    MdAdminPanelSettings,
    MdTimer,
} from 'react-icons/md';

export const iconRegistry = {
    dashboard: MdDashboard,
    roadmaps: MdMenuBook,
    goals: MdTrackChanges,
    focus: MdTimer,
    notes: MdEditNote,
    resources: MdBookmark,
    insights: MdInsights,
    settings: MdSettings,
    email: MdMail,
    admin: MdAdminPanelSettings,
};

const NavIcon = ({
    name,
    size = 20,
    active = false,
    compact = false,
    large = false,
    className = '',
}) => {
    const Icon = iconRegistry[name];
    if (!Icon) return null;

    const iconSize = size || (large ? 24 : compact ? 18 : 20);

    const colorClass = active
        ? 'text-sky-500 dark:text-sky-400'
        : 'text-slate-500 dark:text-slate-400 group-hover:text-sky-500 dark:group-hover:text-sky-400 hover:text-sky-500 dark:hover:text-sky-400';

    return (
        <span
            className={`inline-flex shrink-0 items-center justify-center leading-none transition-colors duration-200 ${colorClass} ${className}`}
            aria-hidden
        >
            <Icon size={iconSize} className="block" />
        </span>
    );
};

export default NavIcon;
