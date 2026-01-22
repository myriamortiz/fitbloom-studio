// Variables pour stocker les choix
let userProfile = {
    name: "",
    goal: "forme", // Valeur par défaut
    intolerances: []
};

// Navigation entre les étapes
function nextStep(stepNumber) {
    // Navigation séquentielle : 1 -> age -> measure -> 2 -> activity -> 3

    // VALIDATION & SAVE
    if (stepNumber === 'age') {
        const nameInput = document.getElementById('user-name').value.trim();
        if (!nameInput) return alert("Raconte-moi, comment t'appelles-tu ? 😊");
        userProfile.name = nameInput;
    }

    if (stepNumber === 'measure') {
        const age = document.getElementById('user-age').value;
        if (!age) return alert("Quel âge as-tu ?");
        userProfile.age = parseInt(age);
        if (!userProfile.gender) userProfile.gender = 'F'; // Default
    }

    if (stepNumber === 2) { // Coming from 'measure'
        const height = document.getElementById('user-height').value;
        const weight = document.getElementById('user-weight').value;
        if (!height || !weight) return alert("Nous avons besoin de ta taille et ton poids pour le calcul !");
        userProfile.height = parseInt(height);
        userProfile.weight = parseInt(weight);
    }

    // TRANSITION
    // Hide all
    document.querySelectorAll('.step-container').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.dot').forEach(el => el.classList.remove('active'));

    // Determine ID
    let nextId = stepNumber; // default (e.g. 'age')
    if (typeof stepNumber === 'number') nextId = stepNumber.toString();

    document.getElementById(`step-${nextId}`).classList.add('active');

    // Update dots (mapping simple)
    const dotId = `dot-${nextId}`;
    if (document.getElementById(dotId)) {
        document.getElementById(dotId).classList.add('active');
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

// Calcul Mifflin-St Jeor
function calculateCalories() {
    let bmr;
    if (userProfile.gender === 'H') {
        bmr = (10 * userProfile.weight) + (6.25 * userProfile.height) - (5 * userProfile.age) + 5;
    } else {
        bmr = (10 * userProfile.weight) + (6.25 * userProfile.height) - (5 * userProfile.age) - 161;
    }

    let tdee = bmr * (userProfile.activity || 1.2);

    // Ajustement selon objectif
    if (userProfile.goal === 'perte_poids') {
        tdee *= 0.85; // Déficit 15%
    } else if (userProfile.goal === 'prise_masse') {
        tdee *= 1.10; // Surplus 10%
    }

    userProfile.targetCalories = Math.round(tdee);
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
