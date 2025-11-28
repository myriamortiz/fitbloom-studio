// -------------------------------
// CONFIG GLOBALE
// -------------------------------
const SELFCARE_VERSION = "1.0";

// Émotions disponibles
const EMOTIONS = [
  { id: "joy", label: "😊 Joie" },
  { id: "calm", label: "🌿 Calme" },
  { id: "stress", label: "😣 Stress" },
  { id: "fatigue", label: "🥱 Fatigue" },
  { id: "sad", label: "😢 Tristesse" }
];

// Habitudes quotidiennes
const HABITS = [
  { id: "water", label: "Boire 2L d'eau" },
  { id: "supplements", label: "Prendre mes compléments" },
  { id: "sport", label: "Faire ma séance sport" },
  { id: "rituel_soir", label: "Rituel du soir" }
];

// Exemple de rituels relaxation (rotations)
const RITUELS = [
  "Méditation respiration 10 min",
  "Relaxation corporelle 15 min",
  "Étirements doux + musique 12 min",
  "Méditation guidée 15 min",
  "Respiration cohérente 5-10 min"
];

// -------------------------------
// SAISON AUTOMATIQUE (compléments)
// -------------------------------
function getSeason() {
  const m = new Date().getMonth() + 1;
  if (m >= 3 && m <= 5) return "printemps";
  if (m >= 6 && m <= 8) return "ete";
  if (m >= 9 && m <= 11) return "automne";
  return "hiver";
}

// -------------------------------
// LOCALSTORAGE – Gestion stockage
// -------------------------------
function loadData() {
  const data = localStorage.getItem("selfcare-data");
  return data ? JSON.parse(data) : {};
}

function saveData(data) {
  localStorage.setItem("selfcare-data", JSON.stringify(data));
}

// -------------------------------
// Structure d’un jour
// -------------------------------
function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function getTodayData() {
  const data = loadData();
  const today = getTodayKey();

  if (!data[today]) {
    data[today] = {
      emotion: null,
      habits: {},
      rituel: pickRandom(RITUELS),
      todos: []
    };
    saveData(data);
  }

  return data[today];
}

// -------------------------------
// UTILITAIRES
// -------------------------------
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// -------------------------------
// ENREGISTREMENT ÉMOTION
// -------------------------------
function setEmotion(emotionId) {
  const data = loadData();
  const today = getTodayKey();
  data[today].emotion = emotionId;
  saveData(data);
  renderEmotion();
}

// -------------------------------
// ENREGISTREMENT HABIT
// -------------------------------
function toggleHabit(habitId) {
  const data = loadData();
  const today = getTodayKey();

  data[today].habits[habitId] = !data[today].habits[habitId];

  saveData(data);
  renderHabits();
}

// -------------------------------
// TO-DO LIST
// -------------------------------
function addTodo(text) {
  const data = loadData();
  const today = getTodayKey();

  data[today].todos.push({ text, done: false });
  saveData(data);
  renderTodos();
}

function toggleTodo(index) {
  const data = loadData();
  const today = getTodayKey();

  data[today].todos[index].done = !data[today].todos[index].done;
  saveData(data);
  renderTodos();
}

function deleteTodo(index) {
  const data = loadData();
  const today = getTodayKey();

  data[today].todos.splice(index, 1);
  saveData(data);
  renderTodos();
}

// -------------------------------
// AFFICHAGE — Emotions
// -------------------------------
function renderEmotion() {
  const container = document.getElementById("emotion-container");
  const today = getTodayData();

  container.innerHTML = EMOTIONS.map(e => `
    <button class="emotion-btn ${today.emotion === e.id ? "active" : ""}"
            onclick="setEmotion('${e.id}')">
      ${e.label}
    </button>
  `).join("");
}

// -------------------------------
// AFFICHAGE — Habitudes
// -------------------------------
function renderHabits() {
  const container = document.getElementById("habits-container");
  const today = getTodayData();

  container.innerHTML = HABITS.map(h => `
    <label class="habit-item">
      <input type="checkbox" 
             ${today.habits[h.id] ? "checked" : ""}
             onclick="toggleHabit('${h.id}')">
      ${h.label}
    </label>
  `).join("");
}

// -------------------------------
// AFFICHAGE — Rituel du jour
// -------------------------------
function renderRituel() {
  const container = document.getElementById("rituel-container");
  const today = getTodayData();

  container.textContent = today.rituel;
}

// -------------------------------
// AFFICHAGE — TO-DO LIST
// -------------------------------
function renderTodos() {
  const container = document.getElementById("todos-container");
  const input = document.getElementById("todo-input");

  const today = getTodayData();

  container.innerHTML = today.todos
    .map((t, i) => `
      <div class="todo-item">
        <input type="checkbox" ${t.done ? "checked" : ""} onclick="toggleTodo(${i})">
        <span class="${t.done ? "done" : ""}">${t.text}</span>
        <button class="delete-todo" onclick="deleteTodo(${i})">✖</button>
      </div>
    `)
    .join("");

  input.value = "";
}

// -------------------------------
// RÉCAP SEMAINE (émotions + habitude + alimentation)
// -------------------------------
function renderWeeklyRecap() {
  const container = document.getElementById("weekly-recap");
  if (!container) return; // optionnel

  const data = loadData();
  const keys = Object.keys(data).slice(-7);

  let goodDays = 0;
  let emotionsCount = {};

  keys.forEach(k => {
    const d = data[k];

    // Habitudes
    const habitsDone = Object.values(d.habits).filter(x => x).length;
    if (habitsDone >= 3) goodDays++;

    // Émotions
    if (d.emotion) {
      emotionsCount[d.emotion] = (emotionsCount[d.emotion] || 0) + 1;
    }
  });

  const dominantEmotion =
    Object.keys(emotionsCount).sort((a, b) => emotionsCount[b] - emotionsCount[a])[0];

  container.innerHTML = `
    <p>✨ Jours bien tenus : ${goodDays}/7</p>
    <p>💖 Émotion prédominante : ${
      dominantEmotion ? EMOTIONS.find(e => e.id === dominantEmotion).label : "—"
    }</p>
  `;
}

// -------------------------------
// COMPLÉMENTS — Chargement JSON
// -------------------------------
async function loadComplements() {
  const response = await fetch("data/complements/complements.json");
  return await response.json();
}

async function renderComplements() {
  const container = document.getElementById("complements-container");
  if (!container) return;

  const data = await loadComplements();
  const season = getSeason();

  const all = [
    ...data.stress_sommeil,
    ...data.hormones_endometriose,
    ...data.digestion,
    ...data.energie,
    ...data.poids,
    ...data.cheveux_ongles,
    ...data.saisons[season]
  ];

  container.innerHTML = all
    .map(c => `
      <div class="comp-card">
        <h4>${c.name}</h4>
        <p>${c.benefit}</p>
      </div>
    `)
    .join("");
}

// -------------------------------
// INIT
// -------------------------------
function initSelfcare() {
  renderEmotion();
  renderHabits();
  renderRituel();
  renderTodos();
  renderWeeklyRecap();
  renderComplements();
}

document.addEventListener("DOMContentLoaded", initSelfcare);
