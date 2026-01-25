// Variables pour stocker les choix
let userProfile = {
    name: "",
    goals: ["forme"], // Changé de string unique à tableau, default "forme"
    intolerances: [],
    fasting: undefined, // Changé de false à undefined pour forcer un choix
    fastingMode: "none" // 'none', 'skip_breakfast', 'skip_dinner'
};

// Navigation entre les étapes
function nextStep(stepNumber) {
    console.log("Moving to step:", stepNumber);

    // VALIDATION & SAVE de l'étape ACTUELLE avant de passer à la suivante

    // Si on est à l'étape 1 (Prénom) et qu'on veut aller vers 'age'
    if (stepNumber === 'age') {
        const nameInput = document.getElementById('user-name').value.trim();
        if (!nameInput) return alert("Raconte-moi, comment t'appelles-tu ? 😊");
        userProfile.name = nameInput;
    }

    // Si on est à l'étape 'age' et qu'on veut aller vers 'measure'
    if (stepNumber === 'measure') {
        const age = document.getElementById('user-age').value;
        if (!age) return alert("Quel âge as-tu ?");
        userProfile.age = parseInt(age);
        if (!userProfile.gender) userProfile.gender = 'F'; // Default
    }

    // Si on est à l'étape 'measure' et qu'on veut aller vers 2 (Objectif)
    if (stepNumber === 2) {
        const height = document.getElementById('user-height').value;
        const weight = document.getElementById('user-weight').value;
        if (!height || !weight) return alert("Nous avons besoin de ta taille et ton poids pour le calcul !");
        userProfile.height = parseInt(height);
        userProfile.weight = parseInt(weight);
    }

    // Si on est à l'étape 2 (Objectif)
    if (stepNumber === 'activity') { // On vient de cliquer sur "Suivant" dans Step 2 ou Step Intensity
        if (!userProfile.goals || userProfile.goals.length === 0) return alert("Choisis au moins un objectif !");

        // INTERCEPTION : Si c'est perte de poids et qu'on n'a pas encore choisi l'intensité
        // On vérifie si on est actuellement sur l'écran Step 2
        const step2Active = document.getElementById('step-2').classList.contains('active');
        
        // Si PARMI les objectifs on a "perte_poids"
        if (step2Active && userProfile.goals.includes('perte_poids')) {
            // Rediriger vers l'étape intensité au lieu d'activity
            stepNumber = 'intensity';
        }

        // Si on est sur l'étape Intensité, on vérifie la sélection
        const stepIntActive = document.getElementById('step-intensity').classList.contains('active');
        if (stepIntActive && !userProfile.intensity) {
             // Si perte_poids est actif, l'intensité est requise
             if(userProfile.goals.includes('perte_poids')) {
                return alert("Choisis un rythme !");
             }
        }
    }

    // Si on est à l'étape 'activity' et qu'on veut aller vers 'fasting'
    if (stepNumber === 'fasting') {
        if (!userProfile.activity) return alert("Choisis ton niveau d'activité !");
    }

    // Logique spéciale pour le Jeûne (Step 'fasting')
    if (stepNumber === 'fasting-details' || stepNumber === 'days') {
        // Cette validation s'exécute quand on clique sur "Suivant" depuis l'étape 'fasting'
        if (typeof userProfile.fasting === 'undefined') return alert("Pratiques-tu le jeûne intermittent ?");

        // Si l'utilisateur a choisi NON au jeûne, on saute directement à 'days' (Planning)
        if (userProfile.fasting === false) {
            userProfile.fastingMode = "none";
            stepNumber = 'days';
        }
    }

    if (stepNumber === 'days' && document.getElementById('step-fasting-details').classList.contains('active')) {
        if (!userProfile.fastingMode || userProfile.fastingMode === 'none') return alert("Dis-moi quel repas tu sautes !");
    }

    // Validation finale avant l'étape 3 (Intolérances)
    if (stepNumber === 3) {
        if (!userProfile.workoutDays || userProfile.workoutDays.length === 0) {
            // Par défaut si rien choisi
            userProfile.workoutDays = [1, 3, 5];
        }
    }

    // TRANSITION VISUELLE
    // Masquer tout
    document.querySelectorAll('.step-container').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.dot').forEach(el => el.classList.remove('active'));

    // Afficher la cible
    let nextId = stepNumber.toString();
    const nextElem = document.getElementById(`step-${nextId}`);
    if (nextElem) {
        nextElem.classList.add('active');
    } else {
        console.error("Step element not found:", `step-${nextId}`);
    }

    // Activer le dot correspondant (Mapper intensity -> dot 2)
    let dotId = nextId;
    if (nextId === 'intensity') dotId = '2';

    const dotElem = document.getElementById(`dot-${dotId}`);
    if (dotElem) {
        dotElem.classList.add('active');
    }
}

// ---------------------------
// Day Selection Logic V4
// ---------------------------
function toggleDay(btn, dayIndex) {
    if (!userProfile.workoutDays) userProfile.workoutDays = [];

    // Toggle
    if (userProfile.workoutDays.includes(dayIndex)) {
        userProfile.workoutDays = userProfile.workoutDays.filter(d => d !== dayIndex);
        btn.classList.remove('selected');
        btn.style.background = "rgba(255,255,255,0.05)";
        btn.style.color = "var(--fbs-taupe-rose)";
    } else {
        userProfile.workoutDays.push(dayIndex);
        btn.classList.add('selected');
        btn.style.background = "var(--fbs-rose-clair)";
        btn.style.color = "#1a1a1a";
    }
}

// Sélection de l'objectif (Multiple)
function toggleGoal(element, goalValue) {
    element.classList.toggle('selected');
    
    if (element.classList.contains('selected')) {
        // Ajouter si pas présent
        if (!userProfile.goals.includes(goalValue)) {
            userProfile.goals.push(goalValue);
        }
    } else {
        // Enlever
        userProfile.goals = userProfile.goals.filter(g => g !== goalValue);
    }
}

// Ancienne fonction pour compatibilité (ne devrait plus être appelée mais au cas où)
function selectGoal(element, goalValue) {
   toggleGoal(element, goalValue);
}

// Sélection des tags (multiple)
function toggleTag(element, tagValue) {
    element.classList.toggle('selected');

    if (element.classList.contains('selected')) {
        if (!userProfile.intolerances.includes(tagValue)) {
            userProfile.intolerances.push(tagValue);
        }
    } else {
        userProfile.intolerances = userProfile.intolerances.filter(t => t !== tagValue);
    }
}

// Helper Selection
function selectGender(btn, gender) {
    document.querySelectorAll('#step-age button').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    userProfile.gender = gender;
}

function selectActivity(div, factor) {
    document.querySelectorAll('#step-activity .goal-card').forEach(c => c.classList.remove('selected'));
    div.classList.add('selected');
    userProfile.activity = factor;
}

function selectFasting(div, isFasting) {
    document.querySelectorAll('#step-fasting .goal-card').forEach(c => c.classList.remove('selected'));
    div.classList.add('selected');
    userProfile.fasting = isFasting;
    // Visu: on pré-sélectionne none si jamais
    if (!isFasting) userProfile.fastingMode = "none";
}

function selectSkipMeal(div, mode) {
    document.querySelectorAll('#step-fasting-details .goal-card').forEach(c => c.classList.remove('selected'));
    div.classList.add('selected');
    userProfile.fastingMode = mode;
}

function selectIntensity(div, mode) {
    document.querySelectorAll('#step-intensity .goal-card').forEach(c => c.classList.remove('selected'));
    div.classList.add('selected');
    userProfile.intensity = mode;
}

// Calcul Mifflin-St Jeor
function calculateCalories() {
    // Security: Ensure valid numbers
    const weight = Math.max(parseFloat(userProfile.weight) || 0, 30);
    let height = Math.max(parseFloat(userProfile.height) || 0, 0); // Allow 0 to detect invalid, but we'll floor at 100 later
    const age = Math.max(parseFloat(userProfile.age) || 0, 15);
    const activity = parseFloat(userProfile.activity) || 1.2;

    // Auto-fix: If height is small (e.g. 1.75), assume meters and convert to cm
    if (height > 0 && height < 3) {
        height *= 100;
    }
    // Floor height to 100cm (child/dwarf limit)
    height = Math.max(height, 100);

    let bmr;
    if (userProfile.gender === 'H') {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }

    // Security: BMR floor
    bmr = Math.max(bmr, 1000);

    let tdee = bmr * activity;

    // Ajustement selon objectifs multiples
    // On applique les multiplicateurs séquentiellement
    
    // 1. Perte de poids
    if (userProfile.goals.includes('perte_poids')) {
        if (userProfile.intensity === 'hard') {
            tdee *= 0.70; // -30%
        } else {
            tdee *= 0.85; // -15% (défaut)
        }
    }
    
    // 2. Prise de masse
    if (userProfile.goals.includes('prise_masse')) {
        tdee *= 1.10; // +10%
    }
    
    // 3. Forme (neutre, pas de changement explicite sauf si seul)
    // "Forme" est neutre, donc ne modifie pas le TDEE par elle-même.
    // Si l'utilisateur choisit "Forme" + "Perte de poids", la perte de poids prime (définie ci-dessus).

    // Security: Absolute floor (1200 kcal is a standard healthy minimum for women, 1500 for men)
    const absoluteFloor = (userProfile.gender === 'H') ? 1500 : 1200;
    userProfile.targetCalories = Math.round(Math.max(tdee, absoluteFloor));
}

// Fin de l'onboarding
function finishOnboarding() {
    // Calcul final
    calculateCalories();

    // Sauvegarder dans localStorage
    localStorage.setItem('userProfile', JSON.stringify(userProfile));

    // Animation de sortie
    const btn = document.querySelector('#step-3 .btn-next');
    btn.innerHTML = "Calcul de ton programme...";

    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// Pré-sélection par défaut visuelle
document.addEventListener('DOMContentLoaded', () => {
    // Sélectionner 'forme' (bien-être) par défaut visuellement
    // Attention: userProfile.goals est un tableau maintenant
    
    // Si userProfile.goals contient 'forme', on l'active
    if(userProfile.goals.includes('forme')) {
         const defaultGoal = document.querySelector('.goal-card[onclick*="forme"]');
         if (defaultGoal) defaultGoal.classList.add('selected');
    }

    // Default Gender visual (optional)
    const defaultF = document.querySelector('#step-age button');
    if (defaultF) selectGender(defaultF, 'F');

    // Default activity
    const defaultAct = document.querySelector('#step-activity .goal-card');
    if (defaultAct) selectActivity(defaultAct, 1.2);
});
// Mocks
const document = {
    getElementById: (id) => ({
        value: '',
        classList: {
            contains: () => false,
            add: () => { },
            remove: () => { },
            toggle: () => { console.log('Mock Toggle Called'); }
        } // Mock classList
    }),
    querySelectorAll: () => [],
    querySelector: () => ({ innerHTML: '' }), // Mock
    addEventListener: () => { } // Mock
};
const window = { location: { href: '' } };
const localStorage = { setItem: () => { } };
function alert(msg) { console.log("ALERT:", msg); }

// Load the file content (in a real env I'd require it, but here I'll simulate by pasting relevant parts or assuming it's loaded if I were running in a browser context. 
// Since I'm running via node, I need to load the JS file. 
// But simple read/eval is risky. 
// Instead, I will copy the logic I just wrote to ensure it works in isolation, OR better, I will read the file and eval it.)

const fs = require('fs');
const content = fs.readFileSync('intro.js', 'utf8');

// Mock DOM before eval
global.document = document;
global.window = window;
global.localStorage = localStorage;
global.alert = alert;

eval(content);

// Test Suite
console.log("--- START TESTS ---");

// Test 1: Single Goal DEFAULT
// userProfile.goals should be ['forme'] by default
console.log("Test 1: Default Goal");
if (userProfile.goals.includes('forme') && userProfile.goals.length === 1) {
    console.log("PASS: Default is forme");
} else {
    console.log("FAIL: Default is " + JSON.stringify(userProfile.goals));
}

// Test 2: Toggle Add
console.log("Test 2: Add 'perte_poids'");
toggleGoal({ classList: { toggle: () => { }, contains: () => true } }, 'perte_poids');
if (userProfile.goals.includes('perte_poids') && userProfile.goals.includes('forme')) {
    console.log("PASS: Added perte_poids, now have 2 goals");
} else {
    console.log("FAIL: " + JSON.stringify(userProfile.goals));
}

// Test 3: Toggle Remove
console.log("Test 3: Remove 'forme'");
toggleGoal({ classList: { toggle: () => { }, contains: () => false } }, 'forme');
if (!userProfile.goals.includes('forme') && userProfile.goals.includes('perte_poids')) {
    console.log("PASS: Removed forme");
} else {
    console.log("FAIL: " + JSON.stringify(userProfile.goals));
}

// Test 4: Calculation Logic (Standard Male)
userProfile.gender = 'H';
userProfile.weight = 80;
userProfile.height = 180;
userProfile.age = 30;
userProfile.activity = 1.2;
// BMR = 10*80 + 6.25*180 - 5*30 + 5 
// = 800 + 1125 - 150 + 5 = 1780
// TDEE Base = 1780 * 1.2 = 2136

// Goal is currently just ['perte_poids'] from Test 3. 
// Default intensity is undefined, let's set it to 'soft' (default implicit in logic if not hard)
userProfile.intensity = 'soft';

calculateCalories();
// Expected: 2136 * 0.85 = 1815.6 -> 1816
console.log("Test 4: Calc Weight Loss (Soft)");
console.log("Target: " + userProfile.targetCalories);
if (userProfile.targetCalories >= 1815 && userProfile.targetCalories <= 1817) {
    console.log("PASS: Calc correct");
} else {
    console.log("FAIL: Expected ~1816, got " + userProfile.targetCalories);
}

// Test 5: Combined Goals (Weight Loss + Muscle Gain)
console.log("Test 5: Combined Goals");
userProfile.goals = ['perte_poids', 'prise_masse'];
userProfile.intensity = 'soft'; // -15%
// Logic: TDEE * 0.85 * 1.10
// 2136 * 0.85 = 1815.6
// 1815.6 * 1.10 = 1997.16 -> 1997
calculateCalories();
console.log("Target: " + userProfile.targetCalories);
if (userProfile.targetCalories >= 1996 && userProfile.targetCalories <= 1998) {
    console.log("PASS: Combined Calc correct");
} else {
    console.log("FAIL: Expected ~1997, got " + userProfile.targetCalories);
}

// Test 6: Combined Hard
console.log("Test 6: Combined Goals (Hard)");
userProfile.intensity = 'hard'; // -30%
// 2136 * 0.70 = 1495.2
// 1495.2 * 1.10 = 1644.72 -> 1645
calculateCalories();
console.log("Target: " + userProfile.targetCalories);
if (userProfile.targetCalories >= 1644 && userProfile.targetCalories <= 1646) {
    console.log("PASS: Combined Hard correct");
} else {
    console.log("FAIL: Expected ~1645, got " + userProfile.targetCalories);
}

