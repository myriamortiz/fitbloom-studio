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

    // GAMIFICATION
    if (delta > 0 && window.gainXP) {
        window.gainXP(5, "Hydratation 💧");
    }
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

// --- FASTING (MANUAL) ---
let fastInterval;

function initFasting() {
    updateFastingUI();
    // Update timer every minute
    fastInterval = setInterval(updateFastingUI, 60000); // 1 min update
}

window.toggleFast = () => {
    try {
        const data = getFastingData();
        console.log("Toggle Fast. Current:", data);

        if (data.isFasting) {
            // STOP FASTING
            const now = Date.now();
            const start = data.startTime;
            const elapsedHours = (now - start) / (1000 * 60 * 60);

            // GAMIFICATION CHECK (Target: 16h)
            if (elapsedHours >= 16 && window.gainXP) {
                window.gainXP(50, "Jeûne 16h réussi ! ⏳");
                alert(`Jeûne terminé : ${elapsedHours.toFixed(1)}h. Bravo ! +50 XP 🔥`);
            } else {
                alert(`Jeûne terminé : ${elapsedHours.toFixed(1)}h. (Objectif : 16h)`);
            }

            saveFastingData(false, null);
        } else {
            // START FASTING
            saveFastingData(true, Date.now());
            console.log("Started Fasting");
        }
        updateFastingUI();
    } catch (e) {
        alert("Erreur JS: " + e.message);
    }
};

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

    if (data.isFasting) {
        // FASTING MODE
        statusText.textContent = "Jeûne en cours 🌑";
        btn.textContent = "Arrêter le Jeûne 🍳";
        btn.style.background = "var(--fbs-rose-clair)";
        btn.style.color = "#1a1a1a";
        card.style.borderLeft = "4px solid #a8e6cf"; // Green

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
        card.style.borderLeft = "4px solid #ffb7b2"; // Red

        timerDisplay.textContent = "--:--";
    }
}
