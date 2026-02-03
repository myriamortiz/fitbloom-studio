// -------------------------------
// FITBLOOM GAMIFICATION ENGINE 🌸 (RPG V2)
// -------------------------------

// Nouvelle Logic XP : Cumulatif
// Niveaux : 1 -> Infini
// XP par action

const XP_TABLE = [
    0,      // Level 1 starts at 0
    100,    // Level 2
    250,    // Level 3
    500,    // Level 4
    800,    // Level 5
    1200,   // Level 6
    1700,   // Level 7
    2300,   // Level 8
    3000,   // Level 9
    4000    // Level 10 (etc...)
];

// Configuration des Gains
const ACTIONS_XP = {
    'HABIT_DONE': 10,
    'WORKOUT': 50,
    'JOURNAL': 15,
    'MEAL_LOG': 5,
    'LOGIN_BONUS': 20
};

// Images (Nouvelles versions transparentes)
const BLOOM_STAGES = [
    { minLevel: 1, img: 'assets/bloom/bloom_stage_1_seed.png', label: "Graine Potentielle 🌱" },
    { minLevel: 4, img: 'assets/bloom/bloom_stage_2_sprout.png', label: "Jeune Pousse 🌿" },
    { minLevel: 7, img: 'assets/bloom/bloom_stage_3_bud.png', label: "Bourgeon Prometteur 🌷" },
    { minLevel: 10, img: 'assets/bloom/bloom_stage_4_flower.png', label: "Fleur Épanouie 🌸" }
];

document.addEventListener("DOMContentLoaded", () => {
    initGamification();
    renderBloomWidget();
});


// ----------------------------------------
// CORE ENGINE
// ----------------------------------------

function initGamification() {
    let progress = getProgress();

    // Daily Login Bonus Check
    const today = new Date().toISOString().split("T")[0];
    if (progress.lastLogin !== today) {
        progress.lastLogin = today;
        saveProgress(progress);
        gainXP(ACTIONS_XP.LOGIN_BONUS, "Bonus Connexion Quotidienne");
    }
}

function getProgress() {
    const defaultState = {
        level: 1,
        currentXP: 0,
        totalXP: 0,
        lastLogin: null,
        history: [] // Log des gains récents
    };
    return JSON.parse(localStorage.getItem('fbs_gamification')) || defaultState;
}

function saveProgress(state) {
    localStorage.setItem('fbs_gamification', JSON.stringify(state));
}

function getNextLevelXP(level) {
    // Si on dépasse la table, on ajoute 1000 par niveau
    if (level >= XP_TABLE.length) return XP_TABLE[XP_TABLE.length - 1] + ((level - XP_TABLE.length + 1) * 1200);
    return XP_TABLE[level];
}

// PUBLIC API : Gain XP
window.gainXP = function (amount, reason) {
    let p = getProgress();

    p.currentXP += amount;
    p.totalXP += amount;

    // Check Level Up
    let nextLevelThreshold = getNextLevelXP(p.level);
    let leveledUp = false;

    while (p.currentXP >= nextLevelThreshold) {
        p.currentXP -= nextLevelThreshold;
        p.level++;
        leveledUp = true;
        nextLevelThreshold = getNextLevelXP(p.level); // Re-calc for multi-level jump
    }

    saveProgress(p);
    renderBloomWidget();

    if (leveledUp) {
        showLevelUpModal(p.level);
        triggerConfetti();
    } else {
        showToast(`+${amount} XP : ${reason}`);
    }
}

// ----------------------------------------
// UI & WIDGET
// ----------------------------------------

function getStageForLevel(level) {
    // Find highest stage where minLevel <= current level
    return BLOOM_STAGES.slice().reverse().find(s => level >= s.minLevel) || BLOOM_STAGES[0];
}

function renderBloomWidget() {
    const container = document.getElementById("bloom-widget-area");
    if (!container) return;

    const p = getProgress();
    const stage = getStageForLevel(p.level);
    const nextLimit = getNextLevelXP(p.level);
    const pct = Math.min((p.currentXP / nextLimit) * 100, 100);

    container.innerHTML = `
        <div class="bloom-card" style="position:relative; overflow:hidden;">
            <div class="bloom-visual">
                <img src="${stage.img}" alt="${stage.label}" class="bloom-img">
            </div>
            <div class="bloom-info">
                <h3>Niveau ${p.level}</h3>
                <p class="bloom-status">${stage.label}</p>
                
                <div class="progress-bar-bg" style="margin-top:8px;">
                    <div class="progress-bar-fill" style="width:${pct}%"></div>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--fbs-taupe-rose); margin-top:4px;">
                    <span>${p.currentXP} XP</span>
                    <span>${nextLimit} XP</span>
                </div>
            </div>
        </div>
    `;
}

// ----------------------------------------
// FEEDBACK & ANIMATIONS
// ----------------------------------------

function showToast(msg) {
    // Simple toast
    const div = document.createElement('div');
    div.className = 'xp-toast';
    div.innerHTML = `✨ ${msg}`;
    div.style.cssText = `
        position: fixed; top: 20px; right: 20px;
        background: rgba(255,255,255,0.1); backdrop-filter: blur(10px);
        border: 1px solid var(--fbs-rose-clair); color: white;
        padding: 10px 20px; border-radius: 20px; z-index: 9999;
        box-shadow: 0 5px 20px rgba(0,0,0,0.5);
        animation: slideIn 0.5s ease-out forwards;
    `;
    document.body.appendChild(div);

    setTimeout(() => {
        div.style.animation = 'fadeOut 0.5s ease-out forwards';
        setTimeout(() => div.remove(), 500);
    }, 3000);
}

function showLevelUpModal(newLevel) {
    // Could be a nice overlay. For now simple alert customized? 
    // Let's make a quick temporary overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.85); z-index: 10000;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        text-align: center; color: white;
    `;

    overlay.innerHTML = `
        <h1 style="font-size: 3rem; color: var(--fbs-rose-clair); margin-bottom: 1rem;">NIVEAU ${newLevel} !</h1>
        <p style="font-size: 1.2rem; color: var(--fbs-rose-pale);">Tu grandis magnifiquement. Continue comme ça ! 🌸</p>
        <button onclick="this.parentElement.remove()" style="
            margin-top: 2rem; padding: 1rem 2rem; background: var(--fbs-rose-clair); 
            border: none; border-radius: 30px; font-weight: bold; cursor: pointer; color: #1a1a1a;">
            Continuer
        </button>
    `;

    document.body.appendChild(overlay);
}

function triggerConfetti() {
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#c48a8a', '#eedbd1', '#ffffff']
        });
    }
}

// CSS Injection for Animations
const style = document.createElement('style');
style.innerHTML = `
@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
@keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
`;
document.head.appendChild(style);

// ----------------------------------------
// HOOKS (Legacy support shim)
// ----------------------------------------
// Used by fitness.js / index.html legacy calls if any
window.declareWorkout = () => {
    // Verify if already done today? With cumulative XP, maybe we allow once per day?
    const today = new Date().toISOString().split("T")[0];
    const key = `workout_xp_${today}`;

    if (!localStorage.getItem(key)) {
        gainXP(ACTIONS_XP.WORKOUT, "Séance de sport terminée");
        localStorage.setItem(key, 'true');
        triggerConfetti();
    } else {
        alert("Tu as déjà validé ta séance aujourd'hui ! Reviens demain 💪");
    }
};

