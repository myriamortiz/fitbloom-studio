// -------------------------------
// GESTION DES ÉMOTIONS (Historique)
// -------------------------------
const emotionButtons = document.querySelectorAll(".emotion-btn");
const emotionSaveMsg = document.getElementById("emotion-save-msg");

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

emotionButtons.forEach(button => {
  button.addEventListener("click", () => {
    const emotion = button.dataset.emotion;
    const date = getTodayStr();

    // Récupérer l'historique existant ou créer un nouvel objet
    const history = JSON.parse(localStorage.getItem("emotion_history")) || {};
    history[date] = emotion;

    localStorage.setItem("emotion_history", JSON.stringify(history));

    emotionSaveMsg.textContent = `Emotion enregistrée pour aujourd'hui : ${emotion}`;
    setTimeout(() => {
      emotionSaveMsg.textContent = "";
    }, 2000);

    generateWeeklyRecap(); // Mettre à jour le récap immédiatement
  });
});

// -------------------------------
// HABIT TRACKER (Checkboxes)
// -------------------------------
const habitCheckboxes = document.querySelectorAll(".habit");

habitCheckboxes.forEach(checkbox => {
  // Charger l'état sauvegardé
  const habitKey = `habit_${checkbox.dataset.habit}_${getTodayStr()}`;
  if (localStorage.getItem(habitKey) === "done") {
    checkbox.checked = true;
  }

  checkbox.addEventListener("change", () => {
    const status = checkbox.checked ? "done" : "not done";
    localStorage.setItem(habitKey, status);
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
    generateWeeklyRecap();
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

    // Ajouter l'event listener pour la case à cocher
    todoItem.querySelector(".todo-checkbox").addEventListener("change", () => {
      saveTodos();
      generateWeeklyRecap();
    });

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
// ESPACE RESPIRATION (Minuteur)
// -------------------------------
let breathingInterval;
let breathingTimeLeft = 0;
const breathCircle = document.getElementById("breath-circle");
const breathTimer = document.getElementById("breath-timer");

function startBreathing(minutes) {
  // Réinitialiser si déjà en cours
  stopBreathing();

  breathingTimeLeft = minutes * 60;
  breathCircle.classList.add("active");
  updateTimerDisplay();

  breathingInterval = setInterval(() => {
    breathingTimeLeft--;
    updateTimerDisplay();

    if (breathingTimeLeft <= 0) {
      stopBreathing();
      breathTimer.textContent = "Namasté 🙏";
    }
  }, 1000);
}

function stopBreathing() {
  clearInterval(breathingInterval);
  breathCircle.classList.remove("active");
  breathTimer.textContent = "Prête ?";
}

function updateTimerDisplay() {
  const min = Math.floor(breathingTimeLeft / 60);
  const sec = breathingTimeLeft % 60;
  breathTimer.textContent = `${min}:${sec < 10 ? "0" : ""}${sec}`;
}

// -------------------------------
// RECAP DE LA SEMAINE (7 derniers jours)
// -------------------------------
const weeklyRecap = document.getElementById("weekly-recap");

function generateWeeklyRecap() {
  const history = JSON.parse(localStorage.getItem("emotion_history")) || {};
  const todosStatus = JSON.parse(localStorage.getItem("todos")) || [];
  const todosDone = todosStatus.filter(todo => todo.checked).length;

  // Calculer l'historique des 7 derniers jours
  let emotionListHtml = '<ul style="list-style:none; padding:0; margin-top:0.5rem; font-size:0.95rem;">';
  const today = new Date();

  // On regarde les 7 derniers jours (incluant aujourd'hui)
  let hasEmotions = false;
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const frDate = d.toLocaleDateString("fr-FR", { weekday: 'short', day: 'numeric' });

    if (history[dateStr]) {
      hasEmotions = true;
      emotionListHtml += `<li>${frDate} : ${history[dateStr]}</li>`;
    }
  }
  emotionListHtml += "</ul>";

  if (!hasEmotions) {
    emotionListHtml = "<p style='font-size:0.9rem; font-style:italic;'>Aucune émotion enregistrée cette semaine.</p>";
  }

  weeklyRecap.innerHTML = `
    <div style="margin-bottom:1rem;">
      <strong>Historique bien-être :</strong>
      ${emotionListHtml}
    </div>
    <div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:0.5rem;">
      <strong>Tâches du jour :</strong><br>
      ${todosDone} / ${todosStatus.length} complétées
    </div>
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
  },
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
// La navigation est gérée par le lien HTML directement vers index.html
