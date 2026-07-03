/** Consecutive active days ending today (from daily-goals activity). */
export const calcStreak = (days) => {
    if (!days?.length) return 0;
    let streak = 0;
    for (let i = days.length - 1; i >= 0; i -= 1) {
        if (days[i].count > 0 || days[i].allCompleted) streak += 1;
        else break;
    }
    return streak;
};
