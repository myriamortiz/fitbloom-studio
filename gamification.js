// -------------------------------
// FITBLOOM GAMIFICATION ENGINE 🌸
// -------------------------------

const BLOOM_LEVELS = [
    { min: 0, max: 25, stage: 'seed', img: 'assets/bloom/bloom_stage_1_seed_1769281746060.png', label: "Graine Potentielle 🌱" },
    { min: 25, max: 50, stage: 'sprout', img: 'assets/bloom/bloom_stage_2_sprout_1769281758730.png', label: "Jeune Pousse 🌿" },
    { min: 50, max: 75, stage: 'bud', img: 'assets/bloom/bloom_stage_3_bud_1769281783120.png', label: "Bourgeon Prometteur 🌷" },
    { min: 75, max: 1000, stage: 'flower', img: 'assets/bloom/bloom_stage_4_flower_1769281796752.png', label: "Fleur Épanouie 🌸" }
];

document.addEventListener("DOMContentLoaded", () => {
    updateBloomScore();
    renderBloomWidget();
});


// Calculate Daily Score (0-100)
function calculateDailyBloom() {
    let score = 0;
    const today = new Date().toISOString().split("T")[0];

    // 1. HABITS (Self-Care)
    const habitsHistory = JSON.parse(localStorage.getItem("habits_history")) || {};
    const habitsDone = habitsHistory[today] || [];
    // Cap at 3 habits = 30 pts
    score += Math.min(habitsDone.length * 10, 30);

    // 2. EMOTION (Self-Care)
    const emotionHistory = JSON.parse(localStorage.getItem("emotions_history")) || {};
    if (emotionHistory[today]) {
        score += 15; // Just tracking it is good!
    }

    // 3. JOURNAL (Self-Care)
    const journal = JSON.parse(localStorage.getItem("my_journal")) || {};
    if (journal[today]) {
        score += 15;
    }

    // 4. WORKOUT (Fitness) - Need to confirm if marked as done?
    // For now, let's assume if they visited the fitness page > 1 min?
    // Or simpler: Add a specific "I worked out" button in gamification widget?
    const workoutDone = localStorage.getItem(`workout_done_${today}`);
    if (workoutDone === 'true') {
        score += 40;
    }

    return Math.min(score, 100);
}

function updateBloomScore() {
    const score = calculateDailyBloom();
    // Save maybe? not strictly needed if calc on fly
}

function getBloomStage(score) {
    return BLOOM_LEVELS.find(l => score >= l.min && score < l.max) || BLOOM_LEVELS[0];
}

function renderBloomWidget() {
    const container = document.getElementById("bloom-widget-area");
    if (!container) return;

    const score = calculateDailyBloom();
    const stage = getBloomStage(score);
    const today = new Date().toISOString().split("T")[0];
    const isWorkoutDone = localStorage.getItem(`workout_done_${today}`) === 'true';

    container.innerHTML = `
        <div class="bloom-card">
            <div class="bloom-visual">
                <img src="${stage.img}" alt="${stage.label}" class="bloom-img ${score >= 75 ? 'pulse' : ''}">
            </div>
            <div class="bloom-info">
                <h3>Mon Bloom du Jour</h3>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width:${score}%"></div>
                </div>
                <p class="bloom-status">${score}% - ${stage.label}</p>
                
                ${!isWorkoutDone ?
            `<button class="fbs-btn-small" onclick="declareWorkout()" style="margin-top:10px; width:100%">
                    J'ai fait mon sport ! (+40 XP)
                   </button>` :
            `<div style="color:var(--fbs-vert-sauge); font-size:0.9rem; margin-top:5px;">✨ Sport validé !</div>`
        }
            </div>
        </div>
    `;
}

window.declareWorkout = () => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(`workout_done_${today}`, 'true');
    renderBloomWidget();

    // Confetti effect? (maybe V2)
    alert("Bravo ! Ta fleur grandit ! 🌱 -> 🌿");
};
