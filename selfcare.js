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

addTodoButton.addEventListener("click", () => {
  const todoText = todoInput.value.trim();
  if (todoText) {
    const todoItem = document.createElement("div");
    todoItem.className = "todo-item";

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

function saveTodos() {
  const todoItems = document.querySelectorAll(".todo-item");
  const todos = [];
  todoItems.forEach(item => {
    const text = item.querySelector("label").textContent.trim();
    const checked = item.querySelector(".todo-checkbox").checked;
    const expirationDate = new Date();
    expirationDate.setHours(24, 0, 0, 0);

    todos.push({
      text,
      checked,
      expirationDate: expirationDate.toISOString()
    });
  });

  localStorage.setItem("todos", JSON.stringify(todos));
}

function loadTodos() {
  const todos = JSON.parse(localStorage.getItem("todos")) || [];
  const currentDate = new Date();

  todos.forEach(todo => {
    const todoItem = document.createElement("div");
    todoItem.className = "todo-item";

    const expirationDate = new Date(todo.expirationDate);
    if (currentDate >= expirationDate) {
      return; // Ne pas afficher si la tâche est expirée
    }

    todoItem.innerHTML = `
      <label><input type="checkbox" class="todo-checkbox" ${todo.checked ? "checked" : ""}> ${todo.text}</label>
    `;
    todosContainer.appendChild(todoItem);
  });
}

loadTodos();

// -------------------------------
// RITUELS DU JOUR (avec rotation hebdomadaire)
// -------------------------------
const rituelText = document.getElementById("rituel");
const dayOfWeek = new Date().getDay();  // 0 = Dimanche

const dailyRituals = [
      "Chaque matin ou soir, pratique 10 à 20 minutes de yoga doux.",
      "Prends une douche bien chaude avec des huiles essentielles comme la lavande.",
      "Choisis une soirée pour déconnecter complètement de tous tes écrans.",
      "Allonge-toi dans un endroit calme et pratique la relaxation musculaire progressive.",
      "Utilise une huile ou une crème hydratante pour masser tes mains et poignets tous les soirs.",
      "Consacre une soirée à un soin du visage relaxant.",
      "Réveille-toi avec une playlist qui te boostent.",
      "Bois un verre d'eau chaque matin avec du citron, du gingembre ou des feuilles de menthe.",
      "Chaque matin, écris une affirmation positive liée à tes objectifs de la semaine.",
      "Fais une séance de yoga dynamique ou de stretching pendant 30 minutes.",
      "À la fin de chaque journée, prends 5 minutes pour noter 3 choses que tu as accomplies.",
      "Chaque soir avant de te coucher, prends quelques minutes pour visualiser tes objectifs.",
      "Chaque matin, commence ta journée avec un grand verre d'eau tiède citronnée.",
      "Mange des repas légers et riches en fibres pour favoriser la digestion.",
      "Pratique une méditation guidée de détox mentale chaque jour.",
      "Profite d’une séance de sauna ou d’un bain de vapeur.",
      "Pratique une détox numérique en réduisant ton temps passé sur les écrans.",
      "Bois une infusion détox chaque jour, comme du thé vert, du pissenlit, de la menthe ou du gingembre.",
      "Pendant cette semaine, engage-toi dans un acte de gentillesse chaque jour.",
      "Tous les jours, prends quelques minutes devant un miroir pour regarder ton reflet et te dire des choses positives.",
      "Chaque jour, pratique une méditation guidée de l’amour de soi.",
      "Offre-toi un moment de plaisir sans culpabilité.",
      "Pratique le yoga ou des étirements pour libérer les tensions.",
      "Avant de t'endormir, prends 5 à 10 minutes pour méditer sur les choses qui te rendent heureuse.",
];

rituelText.textContent = dailyRituals[dayOfWeek % dailyRituals.length];

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
// COMPLÉMENTS ALIMENTAIRES (exemple simple)
// -------------------------------
const complementsBySeason = {
  printemps: {
    "Stress & Sommeil": ["Ashwagandha", "L-Theanine", "Magnésium", "Mélatonine"],
    "Immunité": ["Vitamine D3 + K2", "Échinacée", "Propolis", "Zinc"],
    "Digestion": ["Probiotiques", "Gingembre / Curcuma", "Fibre de psyllium", "Extrait de papaye fermentée"],
    "Énergie": ["Rhodiola rosea", "Ginseng", "Vitamine B12", "Coenzyme Q10"],
    "Autres": ["Biotine", "Collagène", "Oméga‑3"]
  },
  été: {
    "Stress & Sommeil": ["L-théanine", "Valériane", "Vitamines B", "Magnésium bisglycinate ou marin"],
    "Immunité": ["Vitamine D", "Vitamine C", "Zinc"],
    "Digestion": ["Probiotiques", "Enzymes digestives", "Fibres psyllium ou fibres solubles"],
    "Énergie": ["Ginseng", "Coenzyme Q10", "Un bon multivitamines"],
    "Autres": ["Bêta-carotène", "Cuivre", "Chardon-marie"]
  },
  automne: {
    "Stress & Sommeil": ["Passiflore", "Minéraux", "Valériane", "Rhodiole"],
    "Immunité": ["Vitamine C", "Vitamines B6, B12", "Sélénium", "Zinc"],
    "Digestion": ["Bromélaïne", "Fenouil", "Charbon actif"],
    "Énergie": ["Ginseng", "Fer", "Guarana"],
    "Autres": ["Biotine", "Collagène", "Propolis"]
  },
  hiver: {
    "Stress & Sommeil": ["Ashwagandha", "Mélatonine", "Magnésium", "Rhodiole"],
    "Immunité": ["Vitamine D3", "Vitamine C", "Oméga‑3 EPA/DHA", "Zinc"],
    "Digestion": ["Probiotiques", "Artichaut", "Mélisse"],
    "Énergie": ["Ginseng", "Gelée royale", "Acérola"],
    "Autres": ["Sélénium", "Levure de bière", "Acide hyaluronique"]
  }
};

function getSeason() {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "printemps";
  if (month >= 5 && month <= 7) return "été";
  if (month >= 8 && month <= 10) return "automne";
  return "hiver";
}

function updateComplements() {
  const season = getSeason();
  const seasonComplements = complementsBySeason[season];

  const complementsContainer = document.getElementById("complements-container");
  complementsContainer.innerHTML = "";

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

updateComplements();

// -------------------------------
// BOUTON RETOUR
// -------------------------------
const backButton = document.querySelector(".back-btn");

backButton.addEventListener("click", () => {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "index.html";
  }
});
