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
  "Méditation ou relaxation",
  "Prendre un bain ou une douche relaxante",
  "Faire une activité créative (ex: dessin, écriture)",
  "Faire du yoga ou des étirements"
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
