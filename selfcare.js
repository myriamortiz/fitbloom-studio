// -------------------------------
// GESTION DES ÉMOTIONS
// -------------------------------
const emotionButtons = document.querySelectorAll(".emotion-btn");
const emotionSaveMsg = document.getElementById("emotion-save-msg");

emotionButtons.forEach(button => {
  button.addEventListener("click", () => {
    const emotion = button.dataset.emotion;
    localStorage.setItem("emotion", emotion);
    emotionSaveMsg.textContent = `Emotion enregistrée : ${emotion}`;
    setTimeout(() => {
      emotionSaveMsg.textContent = "";
    }, 2000);
  });
});

// -------------------------------
// HABIT TRACKER (Checkboxes)
// -------------------------------
const habitCheckboxes = document.querySelectorAll(".habit");

habitCheckboxes.forEach(checkbox => {
  checkbox.addEventListener("change", () => {
    const habit = checkbox.dataset.habit;
    const status = checkbox.checked ? "done" : "not done";
    localStorage.setItem(habit, status);
  });
});

// -------------------------------
// TO-DO LIST
// -------------------------------
const todoInput = document.getElementById("todo-input");
const addTodoButton = document.getElementById("add-todo");
const todosContainer = document.getElementById("todos-container");

// Ajouter une nouvelle tâche
addTodoButton.addEventListener("click", () => {
  const todoText = todoInput.value.trim();
  if (todoText) {
    const todoItem = document.createElement("div");
    todoItem.className = "todo-item";

    // Ajouter une date d'expiration (minuit le jour suivant)
    const expirationDate = new Date();
    expirationDate.setHours(24, 0, 0, 0); // Minuit du jour suivant

    todoItem.innerHTML = `
      <label><input type="checkbox" class="todo-checkbox"> ${todoText}</label>
    `;
    todosContainer.appendChild(todoItem);

    todoInput.value = ""; // Clear input
    saveTodos();
  }
});

// Sauvegarder les tâches dans localStorage
function saveTodos() {
  const todoItems = document.querySelectorAll(".todo-item");
  const todos = [];
  todoItems.forEach(item => {
    const text = item.querySelector("label").textContent.trim();
    const checked = item.querySelector(".todo-checkbox").checked;

    // Ajouter la date d'expiration
    const expirationDate = new Date();
    expirationDate.setHours(24, 0, 0, 0); // Expiration à minuit

    todos.push({
      text,
      checked,
      expirationDate: expirationDate.toISOString() // Sauvegarder la date d'expiration
    });
  });

  localStorage.setItem("todos", JSON.stringify(todos));
}

// Charger les tâches depuis localStorage et supprimer celles expirées
function loadTodos() {
  const todos = JSON.parse(localStorage.getItem("todos")) || [];
  const currentDate = new Date();

  // Parcourir les tâches et vérifier si elles sont expirées
  todos.forEach(todo => {
    const todoItem = document.createElement("div");
    todoItem.className = "todo-item";

    const expirationDate = new Date(todo.expirationDate);

    // Si la tâche est expirée (au-delà de minuit le jour suivant), ne pas l'afficher
    if (currentDate >= expirationDate) {
      return; // Ne pas ajouter la tâche si elle est expirée
    }

    todoItem.innerHTML = `
      <label><input type="checkbox" class="todo-checkbox" ${todo.checked ? "checked" : ""}> ${todo.text}</label>
    `;
    todosContainer.appendChild(todoItem);
  });
}

// Charger les tâches dès que la page se charge
loadTodos();

// -------------------------------
// RITUELS DU JOUR (exemple simple)
// -------------------------------
// -------------------------------
// RITUEL HEBDOMADAIRE
// -------------------------------
const rituelText = document.getElementById("rituel");
const dayOfWeek = new Date().getDay();  // 0 = Dimanche

// Liste des rituels pour chaque semaine avec des détails
const weeklyRituals = [
  { // Semaine 1 : Relaxation et bien-être
    title: "Semaine de la relaxation et du bien-être",
    details: [
      "Commence par 10 minutes de méditation pour apaiser ton esprit.",
      "Prends un bain relaxant avec des huiles essentielles comme la lavande.",
      "Pratique des exercices de respiration profonde pour réduire le stress.",
      "Fais 10 minutes de relaxation guidée ou de relaxation musculaire progressive.",
    ]
  },
  { // Semaine 2 : Énergie et motivation
    title: "Semaine de l'énergie et de la motivation",
    details: [
      "Réveille-toi avec un smoothie énergisant (par exemple, banane, épinards, et spiruline).",
      "Fais une séance de yoga dynamique ou de stretching pendant 30 minutes.",
      "Pratique des affirmations positives pour booster ta motivation.",
      "Prends 5 minutes à la fin de la journée pour réfléchir aux moments positifs.",
    ]
  },
  { // Semaine 3 : Détox et bien-être intérieur
    title: "Semaine de détox et de bien-être intérieur",
    details: [
      "Commence la journée avec un grand verre d'eau chaude au citron.",
      "Mange des repas légers et riches en fibres pour favoriser la digestion.",
      "Fais une séance de relaxation ou de méditation de 10 à 15 minutes.",
      "Prends un bain de vapeur pour libérer ton corps des toxines.",
    ]
  },
  { // Semaine 4 : Gratitude et épanouissement personnel
    title: "Semaine de la gratitude et de l'épanouissement",
    details: [
      "Écris 3 choses pour lesquelles tu es reconnaissant(e) chaque matin.",
      "Prends un moment pour toi chaque jour et fais une activité créative (dessin, écriture).",
      "Fais 10 minutes de méditation pour la pleine conscience.",
      "Pratique le yoga ou des étirements pour libérer les tensions.",
    ]
  }
];

// Calculer la semaine actuelle de l'année
const weekNumber = Math.floor((new Date().getDate() - 1) / 7);  // On divise les jours de l'année par 7 pour obtenir la semaine
const ritual = weeklyRituals[weekNumber % weeklyRituals.length];  // Boucle à travers les semaines

// Afficher le rituel de la semaine
rituelText.innerHTML = `
  <strong>${ritual.title}</strong>
  <ul>
    ${ritual.details.map(detail => `<li>${detail}</li>`).join('')}
  </ul>
`;

// -------------------------------
// COMPLÉMENTS ALIMENTAIRES (exemple simple)
// -------------------------------

const complementsBySeason = {
  printemps: {
    "Stress & Sommeil": ["Ashwagandha", "Mélatonine", "Magnésium", "Rhodiole"],
    "Immunité": ["Vitamine C", "Probiotiques", "Curcuma", "Zinc"],
    "Digestion": ["Ginger", "Fenouil", "Charbon actif"],
    "Énergie": ["Ginseng", "Spiruline", "Maca"]
  },
  été: {
    "Stress & Sommeil": ["Ashwagandha", "Mélatonine", "Magnésium", "Rhodiole"],
    "Immunité": ["Vitamine D", "Probiotiques", "Curcuma", "Zinc"],
    "Digestion": ["Ginger", "Menthe", "Fenouil"],
    "Énergie": ["Ginseng", "Spiruline", "Maca"]
  },
  automne: {
    "Stress & Sommeil": ["Ashwagandha", "Mélatonine", "Magnésium", "Rhodiole"],
    "Immunité": ["Vitamine C", "Probiotiques", "Curcuma", "Zinc"],
    "Digestion": ["Ginger", "Fenouil", "Charbon actif"],
    "Énergie": ["Ginseng", "Spiruline", "Maca"]
  },
  hiver: {
    "Stress & Sommeil": ["Ashwagandha", "Mélatonine", "Magnésium", "Rhodiole"],
    "Immunité": ["Vitamine D", "Probiotiques", "Curcuma", "Zinc"],
    "Digestion": ["Ginger", "Fenouil", "Charbon actif"],
    "Énergie": ["Ginseng", "Spiruline", "Maca"]
  }
};

function getSeason() {
  const month = new Date().getMonth(); // Mois actuel (0 = janvier, 11 = décembre)
  
  if (month >= 2 && month <= 4) return "printemps"; // Mars à mai
  if (month >= 5 && month <= 7) return "été";     // Juin à août
  if (month >= 8 && month <= 10) return "automne"; // Septembre à novembre
  return "hiver"; // Décembre à février
}

function updateComplements() {
  const season = getSeason();  // Obtenir la saison actuelle
  const seasonComplements = complementsBySeason[season]; // Compléments en fonction de la saison

  const complementsContainer = document.getElementById("complements-container");
  complementsContainer.innerHTML = "";  // Vider le container actuel

  // Pour chaque catégorie de compléments, ajouter les éléments à afficher
  for (const category in seasonComplements) {
    const categoryDiv = document.createElement("div");
    categoryDiv.className = "complement-category";

    categoryDiv.innerHTML = `
      <h3>${category}</h3>
      <ul>
        ${seasonComplements[category].map(item => `<li>${item}</li>`).join("")}
      </ul>
    `;
    complementsContainer.appendChild(categoryDiv);
  }
}

// Mettre à jour les compléments lorsque la page se charge
updateComplements();

// -------------------------------
// RECAP DE LA SEMAINE
// -------------------------------
const weeklyRecap = document.getElementById("weekly-recap");

function generateWeeklyRecap() {
  const emotion = localStorage.getItem("emotion") || "Aucune émotion enregistrée";
  const todosStatus = JSON.parse(localStorage.getItem("todos")) || [];
  const todosDone = todosStatus.filter(todo => todo.checked).length;

  weeklyRecap.innerHTML = `
    <p>Emotion de la semaine : ${emotion}</p>
    <p>Tâches complètes : ${todosDone} / ${todosStatus.length}</p>
  `;
}

generateWeeklyRecap();

// -------------------------------
// BOUTON RETOUR
// -------------------------------
const backButton = document.querySelector(".back-btn");

backButton.addEventListener("click", () => {
  if (window.history.length > 1) {
    window.history.back();  // Retourner à la page précédente
  } else {
    window.location.href = "index.html";  // Rediriger vers la page d'accueil si pas d'historique
  }
});
