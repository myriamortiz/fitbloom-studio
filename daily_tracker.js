// DAILY TRACKER LOGIC
// -------------------

const STORAGE_PREFIX = "fbs_daily_";
const TODAY = new Date().toISOString().split('T')[0];

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    loadDailyData();
    initFasting();
});

function getDailyKey() {
    return `${STORAGE_PREFIX}${TODAY}`;
}

function loadDailyData() {
    const data = JSON.parse(localStorage.getItem(getDailyKey())) || { water: 0, steps: 0 };

    // Water
    updateWaterUI(data.water);

    // Steps
    document.getElementById('steps-input').value = data.steps > 0 ? data.steps : '';
    updateStepsUI(data.steps);
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
}

function updateWaterUI(count) {
    document.getElementById('water-count').textContent = count;
    const pct = Math.min((count / 8) * 100, 100);
    document.getElementById('water-fill').style.width = `${pct}%`;
}

// --- STEPS ---
window.saveSteps = () => {
    const input = document.getElementById('steps-input');
    const val = parseInt(input.value) || 0;
    saveDailyData('steps', val);
    updateStepsUI(val);
};

function updateStepsUI(count) {
    document.getElementById('steps-display').textContent = count;

    const goal = 10000;
    const pct = Math.min(count / goal, 1);

    // SVG Ring Logic
    // Circumference = 2 * PI * r (r=52) => ~326.7
    const circle = document.getElementById('steps-ring-fill');
    const circumference = 326.7;
    const offset = circumference - (pct * circumference);

    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = offset;
}

// --- FASTING ---
function initFasting() {
    const profile = JSON.parse(localStorage.getItem('userProfile')) || {};
    // Fasting Config
    // If no config, assume 16:8 (Skip Breakfast by default if not set?? Or balanced?)
    // In food.js we have logic: 'balanced', 'skip_breakfast', 'skip_dinner'
    // Let's replicate or assume simple logic based on current time.

    const mode = profile.fastingMode || 'skip_breakfast'; // default

    /* 
       MODE LOGIC SIMPLIFIED:
       skip_breakfast (16:8) -> Eat 12:00 - 20:00. Fast 20:00 - 12:00
       skip_dinner (16:8) -> Eat 08:00 - 16:00. Fast 16:00 - 08:00
       balanced (12:12) -> Eat 08:00 - 20:00. Fast 20:00 - 08:00
    */

    const now = new Date();
    const hour = now.getHours() + (now.getMinutes() / 60);

    let isFasting = false;
    let statusText = "";
    let nextEvent = "";

    if (mode === 'skip_breakfast') {
        // Window: 12h - 20h
        if (hour >= 12 && hour < 20) {
            isFasting = false;
            statusText = "Fenêtre d'alimentation 🥗";
        } else {
            isFasting = true;
            statusText = "En période de Jeûne 🌑";
        }
    } else if (mode === 'skip_dinner') {
        // Window: 8h - 16h
        if (hour >= 8 && hour < 16) {
            isFasting = false;
            statusText = "Fenêtre d'alimentation 🥗";
        } else {
            isFasting = true;
            statusText = "En période de Jeûne 🌑";
        }
    } else {
        // Balanced 12/12: Eat 8h - 20h
        if (hour >= 8 && hour < 20) {
            isFasting = false;
            statusText = "Fenêtre d'alimentation 🥗";
        } else {
            isFasting = true;
            statusText = "En période de Jeûne 🌑";
        }
    }

    document.getElementById('fasting-status-text').textContent = statusText;
    document.getElementById('fasting-meta').textContent = `Mode: ${mode === 'skip_breakfast' ? '16/8 (Sauter PDJ)' : mode}`;

    // Style update
    const card = document.getElementById('fasting-widget');
    if (isFasting) {
        card.style.borderLeft = "4px solid #a8e6cf"; // Greenish for Fasting (healing)
    } else {
        card.style.borderLeft = "4px solid #ffb7b2"; // Reddish/Orange for Eating
    }

    // Timer (Simulated "Time since switch")
    // This is complex without storing LastMealTime.
    // For now, just show current time? Or "Keep it up!"
    document.getElementById('fasting-timer-display').textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
