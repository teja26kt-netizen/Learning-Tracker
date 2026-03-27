const calculateStreak = (lastCompletedDate, currentStreak) => {
    if (!lastCompletedDate) return 1;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastDate = new Date(lastCompletedDate);
    lastDate.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastDate.getTime() === yesterday.getTime()) {
        return currentStreak + 1;
    } else if (lastDate.getTime() === today.getTime()) {
        return currentStreak;
    } else {
        return 1;
    }
};

// Test Cases
console.log("Test 1: First time completion -> Expected: 1, Actual:", calculateStreak(null, 0));

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
console.log("Test 2: Completed yesterday -> Expected: 6, Actual:", calculateStreak(yesterday, 5));

const today = new Date();
console.log("Test 3: Already completed today -> Expected: 5, Actual:", calculateStreak(today, 5));

const twoDaysAgo = new Date();
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
console.log("Test 4: Gap in completion -> Expected: 1, Actual:", calculateStreak(twoDaysAgo, 5));
