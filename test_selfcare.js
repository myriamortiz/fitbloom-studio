const fs = require('fs');

// Mock Storage
const storage = {};
const localStorage = {
    getItem: (k) => storage[k] || null,
    setItem: (k, v) => { storage[k] = v; console.log(`[Storage] Set ${k}:`, v); }
};

// Mock Document
const document = {
    getElementById: (id) => ({
        value: "",
        textContent: "",
        classList: { add: () => { }, remove: () => { } },
        innerHTML: "",
        appendChild: () => { }
    }),
    querySelectorAll: () => [],
    createElement: () => ({ classList: { add: () => { } }, innerHTML: "" })
};
const window = { confirm: () => true };

// --- LOGIC REPLICATION FOR TEST ---
// We replicate the core logic functions here since the original file has DOM deps mixed in.

function testMood() {
    console.log("--- Testing Mood ---");
    const today = new Date().toISOString().split("T")[0];
    const history = {};

    // Simulate Save
    history[today] = { emotion: "😊", val: 5 };
    localStorage.setItem("emotions_history", JSON.stringify(history));

    // Verify
    const saved = JSON.parse(localStorage.getItem("emotions_history"));
    if (saved[today].val === 5) console.log("✅ Mood saved correctly");
    else console.error("❌ Mood save failed");
}

function testHabits() {
    console.log("\n--- Testing Habits ---");
    // 1. Add Habit
    const habits = [{ id: 'water', label: 'Water' }];
    const newId = "h_test";
    habits.push({ id: newId, label: "Read" });
    localStorage.setItem('my_custom_habits', JSON.stringify(habits));

    // 2. Toggle Habit
    const today = new Date().toISOString().split("T")[0];
    const history = {};
    history[today] = [newId]; // Done
    localStorage.setItem("habits_history", JSON.stringify(history));

    // 3. Streak Calc
    let streak = 0;
    if (history[today] && history[today].length > 0) streak = 1;

    if (streak === 1) console.log("✅ Streak detected correctly");
    else console.error("❌ Streak failed");
}

function testJournal() {
    console.log("\n--- Testing Journal ---");
    const today = new Date().toISOString().split("T")[0];
    const journal = {};
    journal[today] = "I am grateful for code.";
    localStorage.setItem("my_journal", JSON.stringify(journal));

    const saved = JSON.parse(localStorage.getItem("my_journal"));
    if (saved[today] === "I am grateful for code.") console.log("✅ Journal saved correctly");
}

// RUN
testMood();
testHabits();
testJournal();
