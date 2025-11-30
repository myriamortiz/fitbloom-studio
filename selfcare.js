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
      "Chaque matin ou soir, pratique 10 à 20 minutes de yoga doux.",
      "Prends une douche bien chaude avec des huiles essentielles comme la lavande.",
      "Choisis une soirée pour déconnecter complètement de tous tes écrans.",
      "Allonge-toi dans un endroit calme et pratique la relaxation musculaire progressive.",
      "Utilise une huile ou une crème hydratante pour masser tes mains et poignets tous les soirs.",
      "Consacre une soirée à un soin du visage relaxant.",
    ]
  },
  { // Semaine 2 : Énergie et motivation
    title: "Semaine de l'énergie et de la motivation",
    details: [
      "Réveille-toi avec une playlist qui te boostent.",
      "Bois un verre d'eau chaque matin avec du citron, du gingembre ou des feuilles de menthe.",
      "Chaque matin, écris une affirmation positive liée à tes objectifs de la semaine.",
      "Fais une séance de yoga dynamique ou de stretching pendant 30 minutes.",
      "À la fin de chaque journée, prends 5 minutes pour noter 3 choses que tu as accomplies.",
      "Chaque soir avant de te coucher, prends quelques minutes pour visualiser tes objectifs.",
    ]
  },
  { // Semaine 3 : Détox et bien-être intérieur
    title: "Semaine de détox et de bien-être intérieur",
    details: [
      "Chaque matin, commence ta journée avec un grand verre d'eau tiède citronnée.",
      "Mange des repas légers et riches en fibres pour favoriser la digestion.",
      "Pratique une méditation guidée de détox mentale chaque jour.",
      "Profite d’une séance de sauna ou d’un bain de vapeur.",
      "Pratique une détox numérique en réduisant ton temps passé sur les écrans.",
      "Bois une infusion détox chaque jour, comme du thé vert, du pissenlit, de la menthe ou du gingembre.",
    ]
  },
  { // Semaine 4 : Gratitude et épanouissement personnel
    title: "Semaine de l'amour de soi et de l'auto-compassion",
    details: [
      "Pendant cette semaine, engage-toi dans un acte de gentillesse chaque jour.",
      "Tous les jours, prends quelques minutes devant un miroir pour regarder ton reflet et te dire des choses positives.",
      "Chaque jour, pratique une méditation guidée de l’amour de soi.",
      "Offre-toi un moment de plaisir sans culpabilité.",
      "Pratique le yoga ou des étirements pour libérer les tensions.",
      "Avant de t'endormir, prends 5 à 10 minutes pour méditer sur les choses qui te rendent heureuse.",
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
    "Stress & Sommeil": ["Ashwagandha", "L-Theanine", "Magnésium", "Mélatonine"],
    "Immunité": ["Vitamine D3 + K2", "Échinacée", "Propolis", "Zinc"],
    "Digestion": ["Probiotiques", "Gingembre / Curcuma", "Fibre de psyllium", "Extrait de papaye fermentée"],
    "Énergie": ["Rhodiola rosea", "Ginseng", "Vitamine B12", "Coenzyme Q10"]
    "Autres": ["Biotine", "Collagène", "Oméga‑3"]
  },
  été: {
    "Stress & Sommeil": ["L-théanine", "Valériane", "Vitamines B", "Magnésium bisglycinate ou marin"],
    "Immunité": ["Vitamine D", "Vitamine C", "Zinc"],
    "Digestion": ["Probiotiques", "Enzymes digestives", "Fibres psyllium ou fibres solubles"],
    "Énergie": ["Ginseng", "Coenzyme Q10", "Un bon multivitamines"]
    "Autres": ["Bêta-carotène", "Cuivre", "Chardon-marie"]
  },
  automne: {
    "Stress & Sommeil": ["Passiflore", "Minéraux", "Valériane", "Rhodiole"],
    "Immunité": ["Vitamine C", "Vitamines B6, B12 ", "Sélénium", "Zinc"],
    "Digestion": ["Bromélaïne", "Fenouil", "Charbon actif"],
    "Énergie": ["Ginseng", "Fer", "Guarana"]
    "Autres": ["Biotine", "Collagène", "Propolis"]
  },
  hiver: {
    "Stress & Sommeil": ["Ashwagandha", "Mélatonine", "Magnésium", "Rhodiole"],
    "Immunité": ["Vitamine D3", "Vitamine C", "Oméga‑3 EPA/DHA", "Zinc"],
    "Digestion": ["Probiotiques", "Artichaut", "Mélisse"],
    "Énergie": ["Ginseng", "Gelée royale ", "Acérola "]
    "Autres": ["Sélénium", "Levure de bière", "Acide hyaluronique "]
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
