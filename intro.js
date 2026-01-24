// Variables pour stocker les choix
let userProfile = {
    name: "",
    goal: "forme", // Valeur par défaut
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
        if (!userProfile.goal) return alert("Choisis un objectif !");

        // INTERCEPTION : Si c'est perte de poids et qu'on n'a pas encore choisi l'intensité
        // On vérifie si on est actuellement sur l'écran Step 2
        const step2Active = document.getElementById('step-2').classList.contains('active');
        if (step2Active && userProfile.goal === 'perte_poids') {
            // Rediriger vers l'étape intensité au lieu d'activity
            stepNumber = 'intensity';
        }

        // Si on est sur l'étape Intensité, on vérifie la sélection
        const stepIntActive = document.getElementById('step-intensity').classList.contains('active');
        if (stepIntActive && !userProfile.intensity) {
            return alert("Choisis un rythme !");
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

// Sélection de l'objectif
function selectGoal(element, goalValue) {
    // Retirer la classe sélectionnée des autres
    document.querySelectorAll('.goal-card').forEach(el => el.classList.remove('selected'));
    // Ajouter à l'actuel
    element.classList.add('selected');

    userProfile.goal = goalValue;
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

    // Ajustement selon objectif
    if (userProfile.goal === 'perte_poids') {
        // Adaptation selon l'intensité choisie
        if (userProfile.intensity === 'hard') {
            tdee *= 0.70; // Déficit 30%
        } else {
            tdee *= 0.85; // Déficit 15% (Mode "Douce" par défaut)
        }
    } else if (userProfile.goal === 'prise_masse') {
        tdee *= 1.10; // Surplus 10%
    }

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
    const defaultGoal = document.querySelector('.goal-card[onclick*="forme"]');
    if (defaultGoal) defaultGoal.classList.add('selected');

    // Default Gender visual (optional)
    const defaultF = document.querySelector('#step-age button');
    if (defaultF) selectGender(defaultF, 'F');

    // Default activity
    const defaultAct = document.querySelector('#step-activity .goal-card');
    if (defaultAct) selectActivity(defaultAct, 1.2);
});
