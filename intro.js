// Variables pour stocker les choix
let userProfile = {
    name: "",
    goal: "forme", // Valeur par défaut
    intolerances: []
};

// Navigation entre les étapes
function nextStep(stepNumber) {
    if (stepNumber === 2) {
        const nameInput = document.getElementById('user-name').value.trim();
        if (!nameInput) {
            alert("Raconte-moi, comment t'appelles-tu ? 😊");
            return;
        }
        userProfile.name = nameInput;
    }

    // Cacher toutes les étapes
    document.querySelectorAll('.step-container').forEach(el => el.classList.remove('active'));
    // Afficher la suivante
    document.getElementById(`step-${stepNumber}`).classList.add('active');

    // Mettre à jour les points
    document.querySelectorAll('.dot').forEach(el => el.classList.remove('active'));
    document.getElementById(`dot-${stepNumber}`).classList.add('active');
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

// Fin de l'onboarding
function finishOnboarding() {
    // Si aucun objectif sélectionné explicitement, garder le dernier ou défaut
    // (Déjà géré par userProfile.goal)

    // Sauvegarder dans localStorage
    localStorage.setItem('userProfile', JSON.stringify(userProfile));

    // Animation de sortie (optionnelle) ou redirection directe
    // Petit délai pour l'effet "C'est parti"
    const btn = document.querySelector('#step-3 .btn-next');
    btn.innerHTML = "Configuration...";

    setTimeout(() => {
        window.location.href = 'index.html';
    }, 800);
}

// Pré-sélection par défaut visuelle
document.addEventListener('DOMContentLoaded', () => {
    // Sélectionner 'forme' (bien-être) par défaut visuellement
    const defaultGoal = document.querySelector('.goal-card[onclick*="forme"]');
    if (defaultGoal) defaultGoal.classList.add('selected');
});
