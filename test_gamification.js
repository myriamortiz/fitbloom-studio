const fs = require('fs');

// Mock Storage
const storage = {};
const localStorage = {
    getItem: (k) => storage[k] || null,
    setItem: (k, v) => { storage[k] = v; console.log(`[Storage] Set ${k}:`, v); }
};

// Mock DOM
const document = {
    getElementById: (id) => ({ innerHTML: "" }),
    addEventListener: () => { }
};

// --- LOGIC REPLICATION ---
function calculateDailyBloom() {
    let score = 0;
    const today = new Date().toISOString().split("T")[0];

    // 1. Habits
    const habitsHistory = JSON.parse(localStorage.getItem("habits_history")) || {};
    const habitsDone = habitsHistory[today] || [];
    score += Math.min(habitsDone.length * 10, 30);

    // 2. Emotion
    const emotionHistory = JSON.parse(localStorage.getItem("emotions_history")) || {};
    if (emotionHistory[today]) score += 15;

    // 3. Journal
    const journal = JSON.parse(localStorage.getItem("my_journal")) || {};
    if (journal[today]) score += 15;

    // 4. Workout
    const workoutDone = localStorage.getItem(`workout_done_${today}`);
    if (workoutDone === 'true') score += 40;

    return Math.min(score, 100);
}

// TEST CASE
function runTest() {
    console.log("--- Gamification Test ---");
    const today = new Date().toISOString().split("T")[0];

    // 1. Simuler 2 habitudes
    const habits = {};
    habits[today] = ["h1", "h2"];
    localStorage.setItem("habits_history", JSON.stringify(habits));

    // 2. Simuler Emotion
    const emos = {};
    emos[today] = "Happy";
    localStorage.setItem("emotions_history", JSON.stringify(emos));

    // Calc Score (20 + 15 = 35)
    let score = calculateDailyBloom();
    console.log(`Score (Habits+Emo): ${score} / 100 (Expected ~35)`);

    // 3. Add Workout
    localStorage.setItem(`workout_done_${today}`, 'true');
    score = calculateDailyBloom();
    console.log(`Score (+Workout): ${score} / 100 (Expected ~75)`);

    if (score === 75) console.log("✅ XP Logic Correct");
    else console.error("❌ XP Logic Failed");
}

runTest();
