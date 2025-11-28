// PLANNING AUTOMATIQUE OPTION B 💖

// Séances selon jour de la semaine
const sessions = {
  1: { 
    name: "🍑 Booty + Cuisses", 
    duration: "30–40 min", 
    exercises: [
      { name: "Squats", repetitions: "15", rounds: "3" },
      { name: "Fentes", repetitions: "12", rounds: "3" },
      { name: "Hip Thrust (au sol)", repetitions: "12", rounds: "3" },
      { name: "Pont fessier", repetitions: "15", rounds: "3" },
      { name: "Squats sautés", repetitions: "10", rounds: "3" }
    ]
  },
  2: { 
    name: "💪 Full Body", 
    duration: "25–35 min", 
    exercises: [
      { name: "Pompes", repetitions: "10", rounds: "3" },
      { name: "Crunchs", repetitions: "20", rounds: "3" },
      { name: "Burpees", repetitions: "10", rounds: "3" },
      { name: "Planche", repetitions: "30s", rounds: "3" },
      { name: "Mountain Climbers", repetitions: "20", rounds: "3" }
    ]
  },
  3: { 
    name: "🩰 Danse – Jour off", 
    duration: "1h–1h30", 
    exercises: [] // Aucun exercice, juste de la danse
  },
  4: { 
    name: "🔥 Abdos + Gainage", 
    duration: "20–30 min", 
    exercises: [
      { name: "Planche", repetitions: "30s", rounds: "3" },
      { name: "Crunchs", repetitions: "20", rounds: "3" },
      { name: "Russian Twist", repetitions: "15", rounds: "3" },
      { name: "Relevé de jambes", repetitions: "12", rounds: "3" },
      { name: "Gainage latéral", repetitions: "30s", rounds: "2" }
    ]
  },
  5: { 
    name: "⚡ Full Body rapide", 
    duration: "20–25 min", 
    exercises: [
      { name: "Jumping Jacks", repetitions: "30", rounds: "3" },
      { name: "Mountain Climbers", repetitions: "20", rounds: "3" },
      { name: "Squats", repetitions: "15", rounds: "3" },
      { name: "Pompes", repetitions: "10", rounds: "3" },
      { name: "Fentes", repetitions: "12", rounds: "3" }
    ]
  },
  6: { 
    name: "🐶 Balade – Récup active", 
    duration: "30–60 min", 
    exercises: [] // Pas d'exercices, seulement la balade
  },
  7: { 
    name: "🌿 Balade + Chill", 
    duration: "Libre", 
    exercises: [] // Pas d'exercices, journée libre
  },
};

// Affichage séance du jour
const today = new Date().getDay(); // 0 = Dimanche → on adapte ensuite
const index = today === 0 ? 7 : today;

// Afficher la séance du jour
document.getElementById("today-session-name").textContent = sessions[index].name;
document.getElementById("today-session-duration").textContent = sessions[index].duration;

// Affichage des exercices dans la modal
const buttonVoirSeance = document.getElementById("voir-seance");
buttonVoirSeance.addEventListener("click", function () {
  // Récupérer la modal
  const modal = document.querySelector(".modal");
  const exercicesList = document.getElementById("exercices-list");

  // Vider la modal avant d'ajouter les exercices
  exercicesList.innerHTML = '';

  // Ajouter les exercices du jour dans la modal
  const exercises = sessions[index].exercises;
  if (exercises.length === 0) {
    exercicesList.innerHTML = "<p>Aucun exercice aujourd'hui, profitez de votre temps libre !</p>";
  } else {
    exercises.forEach(exercice => {
      const exerciceElement = document.createElement("div");
      exerciceElement.classList.add("exercice");

      exerciceElement.innerHTML = `
        <p><strong>${exercice.name}</strong></p>
        <p>Répétitions: ${exercice.repetitions}</p>
        <p>Nombre de tours: ${exercice.rounds}</p>
      `;

      // Ajouter l'exercice dans la modal
      exercicesList.appendChild(exerciceElement);
    });
  }

  // Afficher la modal
  modal.classList.remove("hidden");
});

// Fermer la modal
const modalCloseButton = document.querySelector(".modal-close");
if (modalCloseButton) {
  modalCloseButton.addEventListener("click", function () {
    const modal = document.querySelector(".modal");
    if (modal) {
      modal.classList.add("hidden"); // Cache la modal
    }
  });
}

// Affichage des bulles de la semaine
Object.keys(sessions).forEach((day) => {
  const bubble = document.getElementById(`day-${day}`);
  if (!bubble) return;

  bubble.innerHTML = `
    <strong>${bubble.textContent}</strong>
    <span>${sessions[day].name}</span>
  `;
});

// Bouton "Retour" pour rediriger vers la page précédente
const backButton = document.querySelector(".back-btn");

if (backButton) {
  backButton.addEventListener("click", function () {
    window.history.back(); // Cela revient à la page précédente dans l'historique
  });
}
