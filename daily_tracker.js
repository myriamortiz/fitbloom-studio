// DAILY TRACKER LOGIC
// -------------------

const STORAGE_PREFIX = "fbs_daily_";
let lastLoadedDate = null;

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    loadDailyData();
    initFasting();

    // Check for day change every minute
    setInterval(checkForDayChange, 60000);
});

function getTodayStr() {
    return new Date().toISOString().split('T')[0];
}

function getDailyKey() {
    return `${STORAGE_PREFIX}${getTodayStr()}`;
}

function loadDailyData() {
    lastLoadedDate = getTodayStr();
    const data = JSON.parse(localStorage.getItem(getDailyKey())) || { water: 0, steps: 0 };

    // Water
    updateWaterUI(data.water);

    // Steps
    document.getElementById('steps-input').value = data.steps > 0 ? data.steps : '';
    updateStepsUI(data.steps);
}

function checkForDayChange() {
    const currentToday = getTodayStr();
    if (lastLoadedDate && lastLoadedDate !== currentToday) {
        console.log(`[Tracker] Midnight detected! Resetting for ${currentToday}`);
        // Detected a day change!
        loadDailyData(); // Will load new day (empty) or existing data if reopened

        // Optional: Notify user lightly (toast) or just silently refresh
        // showToast("C'est une nouvelle journée ! Compteurs remis à zéro ☀️");
    }
}

function saveDailyData(key, value) {
    const current = JSON.parse(localStorage.getItem(getDailyKey())) || { water: 0, steps: 0 };
    current[key] = value;
    localStorage.setItem(getDailyKey(), JSON.stringify(current));

    // Also update generic stats if needed (Gamification XP could go here)
}

// --- WATER ---
function updateWater(delta) {
    const currentData = JSON.parse(localStorage.getItem(getDailyKey())) || { water: 0, steps: 0 };
    let newUnknown = (currentData.water || 0) + delta;
    if (newUnknown < 0) newUnknown = 0;
    if (newUnknown > 20) newUnknown = 20; // Cap

    saveDailyData('water', newUnknown);
    updateWaterUI(newUnknown);

    // GAMIFICATION
    if (delta > 0 && window.gainXP) {
        window.gainXP(5, "Hydratation 💧");
    }
}

function updateWaterUI(count) {
    const countEl = document.getElementById('water-count');
    const fillEl = document.getElementById('water-fill');

    if (countEl) countEl.textContent = count;
    if (fillEl) {
        const pct = Math.min((count / 8) * 100, 100);
        fillEl.style.width = `${pct}%`;
    }
}

// --- STEPS ---
window.saveSteps = () => {
    const input = document.getElementById('steps-input');
    const val = parseInt(input.value) || 0;

    // Check previous data for reward status
    const currentData = JSON.parse(localStorage.getItem(getDailyKey())) || { water: 0, steps: 0 };
    const alreadyClaimed = currentData.stepsRewardClaimed || false;

    saveDailyData('steps', val);
    updateStepsUI(val);

    // GAMIFICATION: Reward if goal met and not yet claimed
    if (val >= 10000 && !alreadyClaimed && window.gainXP) {
        window.gainXP(50, "Objectif 10k Pas ! 🏃‍♀️");
        saveDailyData('stepsRewardClaimed', true);
        alert("Bravo ! Objectif 10.000 pas atteint ! +50 XP 🔥");
    }
};

function updateStepsUI(count) {
    const displayEl = document.getElementById('steps-display');
    if (displayEl) displayEl.textContent = count;

    const goal = 10000;
    const pct = Math.min(count / goal, 1);

    // SVG Ring Logic
    // Circumference = 2 * PI * r (r=52) => ~326.7
    const circle = document.getElementById('steps-ring-fill');
    if (circle) {
        const circumference = 326.7;
        const offset = circumference - (pct * circumference);

        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = offset;
    }
}

// --- FASTING (MANUAL) ---
let fastInterval;

function initFasting() {
    updateFastingUI();
    // Update timer every minute
    fastInterval = setInterval(updateFastingUI, 60000); // 1 min update
}

window.toggleFast = () => {
    const data = getFastingData();

    if (data.isFasting) {
        // STOP FASTING
        const now = Date.now();
        const start = data.startTime;
        const elapsedHours = (now - start) / (1000 * 60 * 60);

        // GAMIFICATION (Flexible: 10 XP per hour)
        const points = Math.floor(elapsedHours * 10);

        if (points > 0) {
            if (window.gainXP) window.gainXP(points, `Jeûne de ${elapsedHours.toFixed(1)}h`);
            alert(`Jeûne terminé : ${elapsedHours.toFixed(1)}h. Bravo ! +${points} XP 🔥`);
            logFastingCompletion();
        } else {
            alert(`Jeûne terminé : ${elapsedHours.toFixed(1)}h.`);
        }
        saveFastingData(false, null);
    } else {
        // START FASTING
        saveFastingData(true, Date.now());
    }
    updateFastingUI();
};

// --- STREAK & HISTORY LOGIC ---
function updateStreaks() {
    // 1. Steps Streak
    const stepsStreak = calculateDailyStreak('steps', 10000); // Threshold 10k
    const stepsEl = document.getElementById('steps-streak');
    if (stepsEl) stepsEl.innerHTML = stepsStreak > 1 ? `🔥 ${stepsStreak}j` : '';

    // 2. Fasting Streak
    const fastStreak = calculateFastingStreak();
    const fastEl = document.getElementById('fast-streak');
    if (fastEl) fastEl.innerHTML = fastStreak > 1 ? `🔥 ${fastStreak}j` : '';
}

function calculateDailyStreak(metric, threshold) {
    let streak = 0;
    // Check yesterday, then day before...
    for (let i = 1; i < 365; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = `${STORAGE_PREFIX}${d.toISOString().split('T')[0]}`;
        const data = JSON.parse(localStorage.getItem(key));

        if (data && data[metric] >= threshold) {
            streak++;
        } else {
            break;
        }
    }

    // Check TODAY (if goal already met, add 1. If not, streak is based on yesterday)
    // Actually, "Current Streak" usually includes today if done, or holds from yesterday.
    const todayKey = getDailyKey();
    const todayData = JSON.parse(localStorage.getItem(todayKey));
    if (todayData && todayData[metric] >= threshold) {
        streak++;
    }

    return streak;
}

function calculateFastingStreak() {
    const history = JSON.parse(localStorage.getItem('fbs_fasting_history')) || [];
    // History is array of dates "YYYY-MM-DD" where fast was completed
    let streak = 0;

    // Convert to Set for easy lookup
    const dates = new Set(history);

    // Check if today is done?
    const today = getTodayStr();
    let counting = true;
    let daysBack = 0;

    if (dates.has(today)) {
        streak++;
        daysBack = 1;
    } else {
        // use yesterday as start
        daysBack = 1;
    }

    while (counting) {
        const d = new Date();
        d.setDate(d.getDate() - daysBack);
        const dateStr = d.toISOString().split('T')[0];
        if (dates.has(dateStr)) {
            streak++;
            daysBack++;
        } else {
            counting = false;
        }
    }
    return streak;
}

function logFastingCompletion() {
    const history = JSON.parse(localStorage.getItem('fbs_fasting_history')) || [];
    const today = getTodayStr();
    if (!history.includes(today)) {
        history.push(today);
        localStorage.setItem('fbs_fasting_history', JSON.stringify(history));
    }
}

function getFastingData() {
    return JSON.parse(localStorage.getItem('fbs_fasting_state')) || { isFasting: false, startTime: null };
}

function saveFastingData(isFasting, startTime) {
    localStorage.setItem('fbs_fasting_state', JSON.stringify({ isFasting, startTime }));
}

function updateFastingUI() {
    const data = getFastingData();
    const statusText = document.getElementById('fasting-status-text');
    const timerDisplay = document.getElementById('fasting-timer-display');
    const btn = document.getElementById('fast-btn');
    const card = document.getElementById('fasting-widget');

    if (!statusText || !timerDisplay || !btn) return;

    if (data.isFasting) {
        // FASTING MODE
        statusText.textContent = "Jeûne en cours 🌑";
        btn.textContent = "Arrêter le Jeûne 🍳";
        btn.style.background = "var(--fbs-rose-clair)";
        btn.style.color = "#1a1a1a";

        // Timer
        const diff = Date.now() - data.startTime;
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        timerDisplay.textContent = `${h}h ${m}m`;

    } else {
        // EATING MODE
        statusText.textContent = "Fenêtre d'alimentation 🥗";
        btn.textContent = "Commencer le Jeûne ⏳";
        btn.style.background = ""; // Default glass/border
        btn.style.color = "var(--fbs-rose-pale)";

        timerDisplay.textContent = "--:--";
    }

    // Also update streaks whenever UI updates
    updateStreaks();
}
