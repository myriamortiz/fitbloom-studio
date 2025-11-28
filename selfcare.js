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

    todoItem.innerHTML = `
      <label><input type="checkbox" class="todo-checkbox"> ${todoText}</label>
    `;
    todosContainer.appendChild(todoItem);

    todoInput.value = "";
    saveTodos();
  }
});

function saveTodos() {
  const todoItems = document.querySelectorAll(".todo-item");
  const todos = [];
  todoItems.forEach(item => {
    const text = item.querySelector("label").textContent.trim();
    const checked = item.querySelector(".todo-checkbox").checked;
    todos.push({ text, checked });
  });

  localStorage.setItem("todos", JSON.stringify(todos));
}

function loadTodos() {
  const todos = JSON.parse(localStorage.getItem("todos")) || [];
  todos.forEach(todo => {
    const todoItem = document.createElement("div");
    todoItem.className = "todo-item";

    todoItem.innerHTML = `
      <label><input type="checkbox" class="todo-checkbox" ${todo.checked ? "checked" : ""}> ${todo.text}</label>
    `;
    todosContainer.appendChild(todoItem);
  });
}

loadTodos();

// -------------------------------
// RITUELS DU JOUR (exemple simple)
// -------------------------------
const rituelText = document.getElementById("rituel");
const dayOfWeek = new Date().getDay();

const rituels = [
  "Méditation ou relaxation",
  "Prendre un bain ou une douche relaxante",
  "Faire une activité créative (ex: dessin, écriture)",
  "Faire du yoga ou des étirements"
];

rituelText.textContent = rituels[dayOfWeek % rituels.length];

// -------------------------------
// COMPLÉMENTS ALIMENTAIRES (exemple simple)
// -------------------------------
const complementsContainer = document.getElementById("complements-container");

const complements = {
  "Stress & Sommeil": ["Ashwagandha", "Mélatonine", "Magnésium", "Rhodiole"],
  "Immunité": ["Vitamine C", "Probiotiques", "Curcuma", "Zinc"],
  "Digestion": ["Ginger", "Fenouil", "Charbon actif"],
  "Énergie": ["Ginseng", "Spiruline", "Maca"]
};

function displayComplements() {
  for (const category in complements) {
    const categoryDiv = document.createElement("div");
    categoryDiv.className = "complement-category";

    categoryDiv.innerHTML = `
      <h3>${category}</h3>
      <ul>
        ${complements[category]
          .map(item => `<li>${item}</li>`)
          .join("")}
      </ul>
    `;
    complementsContainer.appendChild(categoryDiv);
  }
}

displayComplements();

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
