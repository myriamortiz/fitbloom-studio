// -------------------------------
// SELFCARE UNIVERSE (V1)
// -------------------------------

document.addEventListener("DOMContentLoaded", () => {
  loadMoodModule();
  loadHabitsModule();
  loadJournalModule();
  loadRitual();
  loadRespiration();
  loadTodos();
  loadComplements(); // V8 logic
});


// ============================================
// 1. MOOD TRACKER & HISTORY
// ============================================

function loadMoodModule() {
  const container = document.getElementById("emotion-container");
  if (!container) return;

  // 1. Click Handler
  const buttons = container.querySelectorAll(".emotion-btn");
  buttons.forEach(btn => {
    btn.onclick = () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const emotion = btn.getAttribute("data-emotion"); // e.g. "😊"
      const val = parseInt(btn.getAttribute("data-val") || "3", 10);

      saveEmotion(emotion, val);
    };
  });

  // 2. Render Chart
  renderMoodChart();
}

function saveEmotion(emotion, val) {
  const msg = document.getElementById("emotion-save-msg");
  const today = new Date().toISOString().split("T")[0];

  // Save current feeling (for recap)
  const history = JSON.parse(localStorage.getItem("emotions_history")) || {};
  history[today] = { emotion, val };

  // Cleanup old entries (> 30 days) to keep easy storage? (Optional, let's keep it simple)

  localStorage.setItem("emotions_history", JSON.stringify(history));

  msg.textContent = `Enregistré : ${emotion}. Prends soin de toi 💖`;

  // Re-render chart to show today's update
  renderMoodChart();
}

function renderMoodChart() {
  const chartEl = document.getElementById('mood-chart');
  if (!chartEl) return;

  chartEl.innerHTML = '';

  // Get last 7 days including today
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }

  const history = JSON.parse(localStorage.getItem("emotions_history")) || {};

  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  days.forEach(dateStr => {
    const entry = history[dateStr];
    const dateObj = new Date(dateStr);
    const dayLabel = dayNames[dateObj.getDay()];

    // Value 1 to 5 mapping to percentage height
    // 1=20%, 5=100%
    let height = "5px";
    let color = "rgba(255,255,255,0.1)";
    let icon = "";

    if (entry) {
      const pct = (entry.val / 5) * 100;
      height = `${Math.max(pct, 10)}%`; // Min 10% visible
      color = "var(--fbs-rose-clair)";
      // Color variations
      if (entry.val <= 2) color = "#c48a8a"; // Red-ish
      if (entry.val >= 4) color = "#a8d5ba"; // Green-ish/Happy
      icon = entry.emotion || "";
    }

    const barContainer = document.createElement('div');
    barContainer.className = 'mood-bar-container';

    barContainer.innerHTML = `
            <div style="margin-bottom:2px; font-size:0.8rem">${icon}</div>
            <div class="mood-bar" style="height:${height}; background:${color}"></div>
            <div class="mood-day">${dayLabel}</div>
        `;

    chartEl.appendChild(barContainer);
  });
}


// ============================================
// 2. HABITS TRACKER (Dynamic)
// ============================================

const DEFAULT_HABITS = [
  { id: 'water', label: "Boire 2L d’eau 💧" },
  { id: 'complements', label: "Prendre mes compléments 💊" },
  { id: 'sport', label: "Bouger mon corps 💪" }
];

function loadHabitsModule() {
  renderHabitsList();

  // Add Button Logic
  const addBtn = document.getElementById('add-habit-btn');
  const addInput = document.getElementById('new-habit-input');

  if (addBtn && addInput) {
    addBtn.onclick = () => {
      const text = addInput.value.trim();
      if (text) {
        addNewHabit(text);
        addInput.value = "";
      }
    };
  }

  updateStreak();
}

function getMyHabits() {
  const custom = JSON.parse(localStorage.getItem('my_custom_habits'));
  if (!custom) {
    // Init defaults
    localStorage.setItem('my_custom_habits', JSON.stringify(DEFAULT_HABITS));
    return DEFAULT_HABITS;
  }
  return custom;
}

function addNewHabit(text) {
  const habits = getMyHabits();
  const id = "h_" + Date.now();
  habits.push({ id, label: text });
  localStorage.setItem('my_custom_habits', JSON.stringify(habits));
  renderHabitsList();
}

function deleteHabit(id) {
  let habits = getMyHabits();
  habits = habits.filter(h => h.id !== id);
  localStorage.setItem('my_custom_habits', JSON.stringify(habits));
  renderHabitsList();
}

function renderHabitsList() {
  const container = document.getElementById('habits-list');
  if (!container) return;

  const habits = getMyHabits();
  const today = new Date().toISOString().split("T")[0];
  const history = JSON.parse(localStorage.getItem("habits_history")) || {};
  const todaysDone = history[today] || [];

  container.innerHTML = "";

  habits.forEach(h => {
    const isDone = todaysDone.includes(h.id);

    const el = document.createElement('div');
    el.className = 'habit-item';

    // Inner HTML
    el.innerHTML = `
            <div class="habit-label" onclick="toggleHabit('${h.id}')">
                <div style="
                    width:20px; height:20px; 
                    border:2px solid var(--fbs-rose-clair); 
                    border-radius:50%; 
                    display:flex; align-items:center; justify-content:center;
                    background:${isDone ? 'var(--fbs-rose-clair)' : 'transparent'}
                ">
                    ${isDone ? '<span style="color:#1a1a1a; font-size:0.8rem">✔</span>' : ''}
                </div>
                <span style="color:${isDone ? 'var(--fbs-rose-clair)' : 'var(--fbs-rose-pale)'}; text-decoration:${isDone ? 'line-through' : 'none'}">
                    ${h.label}
                </span>
            </div>
            <button class="delete-habit-btn" onclick="deleteHabit('${h.id}')">✕</button>
        `;

    container.appendChild(el);
  });
}

// Global scope for onclick
window.toggleHabit = (id) => {
  const today = new Date().toISOString().split("T")[0];
  const history = JSON.parse(localStorage.getItem("habits_history")) || {};
  let todaysDone = history[today] || [];

  if (todaysDone.includes(id)) {
    todaysDone = todaysDone.filter(x => x !== id);
  } else {
    todaysDone.push(id);
  }

  history[today] = todaysDone;
  localStorage.setItem("habits_history", JSON.stringify(history));

  renderHabitsList();
  updateStreak();
};

window.deleteHabit = (id) => {
  if (confirm("Supprimer cette habitude ?")) {
    deleteHabit(id);
  }
}

function updateStreak() {
  // Simple streak logic: check consecutive days backward where at least 1 habit was done
  const history = JSON.parse(localStorage.getItem("habits_history")) || {};
  let streak = 0;

  for (let i = 0; i < 365; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];

    if (history[dateStr] && history[dateStr].length > 0) {
      streak++;
    } else if (i === 0) {
      // If today is empty, don't break streak yet (user might do it later)
      continue;
    } else {
      break;
    }
  }

  const el = document.getElementById('habit-streak');
  if (el && streak > 1) {
    el.textContent = `🔥 Série : ${streak} jours !`;
  } else {
    if (el) el.textContent = "";
  }
}


// ============================================
// 3. JOURNALING
// ============================================

function loadJournalModule() {
  const input = document.getElementById('journal-input');
  const btn = document.getElementById('save-journal-btn');
  const feedback = document.getElementById('journal-feedback');

  if (!input || !btn) return;

  const today = new Date().toISOString().split("T")[0];
  const journalData = JSON.parse(localStorage.getItem("my_journal")) || {};

  // Load existing
  if (journalData[today]) {
    input.value = journalData[today];
  }

  btn.onclick = () => {
    const text = input.value;
    journalData[today] = text;
    localStorage.setItem("my_journal", JSON.stringify(journalData));

    feedback.textContent = "Sauvegardé ✨";
    setTimeout(() => feedback.textContent = "", 2000);
  };
}


// ============================================
// 4. HELPERS & LEGACY (Respiration, Rituals...)
// ============================================

function loadRitual() {
  const rituelText = document.getElementById("rituel");
  if (!rituelText) return;

  const rituels = [
    "Prends 5 grandes respirations avant de te lever.",
    "Écris 3 choses pour lesquelles tu es reconnaissante.",
    "Bois un grand verre d'eau tiède au réveil.",
    "Fais un compliment à une personne que tu aimes.",
    "Masse-toi le visage pendant 2 minutes ce soir.",
    "Écoute ta chanson préférée et danse.",
    "Regarde le ciel pendant 1 minute sans rien faire."
  ];

  const today = new Date().getDate();
  const index = today % rituels.length;
  rituelText.textContent = `✨ ${rituels[index]}`;
}

// RESPIRATION
let breatheInterval;
window.startBreathing = (durationMinutes) => {
  const circle = document.getElementById('breath-circle');
  const timerText = document.getElementById('breath-timer');

  if (!circle) return;

  stopBreathing();
  circle.classList.add('active');

  let secondsLeft = durationMinutes * 60;
  timerText.textContent = formatTime(secondsLeft);

  breatheInterval = setInterval(() => {
    secondsLeft--;
    timerText.textContent = formatTime(secondsLeft);

    if (secondsLeft <= 0) {
      stopBreathing();
      timerText.textContent = "Terminé ✨";
    }
  }, 1000);
}

window.stopBreathing = () => {
  const circle = document.getElementById('breath-circle');
  const timerText = document.getElementById('breath-timer');
  if (!circle) return;

  circle.classList.remove('active');
  clearInterval(breatheInterval);
  timerText.textContent = "Prête ?";
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

// TODO LIST (Legacy)
function loadTodos() {
  // Keeping existing TODO logic but simplified for brevity in this rewrite
  // Assuming user wants to keep it
  const container = document.getElementById('todos-container');
  const input = document.getElementById('todo-input');
  const addBtn = document.getElementById('add-todo');
  if (!container) return;

  let todos = JSON.parse(localStorage.getItem('todos')) || [];

  function render() {
    container.innerHTML = '';
    todos.forEach((todo, idx) => {
      const div = document.createElement('div');
      div.style.cssText = "display:flex; justify-content:space-between; background:rgba(255,255,255,0.05); padding:0.8rem; border-radius:15px; margin-bottom:0.5rem; align-items:center;";
      div.innerHTML = `
                <span style="text-decoration: ${todo.done ? 'line-through' : 'none'}; color: ${todo.done ? 'grey' : 'white'}">${todo.text}</span>
                <div>
                   <button onclick="toggleTodo(${idx})" style="background:none; border:none; cursor:pointer;">${todo.done ? '✅' : '🔲'}</button>
                   <button onclick="deleteTodo(${idx})" style="background:none; border:none; cursor:pointer; margin-left:10px;">🗑️</button>
                </div>
            `;
      container.appendChild(div);
    });
  }

  if (addBtn) addBtn.onclick = () => {
    if (input.value.trim()) {
      todos.push({ text: input.value, done: false });
      localStorage.setItem('todos', JSON.stringify(todos));
      input.value = '';
      render();
    }
  }

  window.toggleTodo = (idx) => {
    todos[idx].done = !todos[idx].done;
    localStorage.setItem('todos', JSON.stringify(todos));
    render();
  }

  window.deleteTodo = (idx) => {
    todos.splice(idx, 1);
    localStorage.setItem('todos', JSON.stringify(todos));
    render();
  }

  render();
}

// COMPLEMENTS (V8 Logic)
let complementsData = null;
async function loadComplements() {
  const month = new Date().getMonth();
  let seasonIcon = '❄️ Hiver';
  if (month >= 2 && month <= 4) { seasonIcon = '🌸 Printemps'; }
  else if (month >= 5 && month <= 7) { seasonIcon = '☀️ Été'; }
  else if (month >= 8 && month <= 10) { seasonIcon = '🍂 Automne'; }

  const header = document.querySelector('.page-selfcare .sc-title');
  if (header && !header.innerHTML.includes("span")) {
    header.innerHTML = `Mes compléments <span class="season-badge">${seasonIcon}</span>`;
  }
  updateComplementsDisplay('saison');
}

window.switchComplementTab = function (category, btn) {
  document.querySelectorAll('.tab-pill').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  updateComplementsDisplay(category);
}

async function updateComplementsDisplay(category) {
  const container = document.getElementById('complements-container');
  if (!container) return;
  if (!complementsData) {
    try {
      const res = await fetch('data/complements/complements.json');
      complementsData = await res.json();
    } catch (e) {
      container.innerHTML = "<p>Erreur.</p>";
      return;
    }
  }

  let list = [];
  if (category === 'saison') {
    const month = new Date().getMonth();
    let seasonKey = 'hiver';
    if (month >= 2 && month <= 4) seasonKey = 'printemps';
    else if (month >= 5 && month <= 7) seasonKey = 'ete';
    else if (month >= 8 && month <= 10) seasonKey = 'automne';
    list = complementsData['saisons'][seasonKey];
  } else {
    list = complementsData[category] || [];
  }

  container.innerHTML = list.map(item => `
        <div class="complement-card">
            <div style="font-size:2rem; margin-bottom:0.5rem;">${item.icon}</div>
            <h3 style="color:var(--fbs-rose-pale); font-size:1rem; margin-bottom:0.3rem;">${item.name}</h3>
            <p style="font-size:0.85rem; color:var(--fbs-taupe-rose); line-height:1.4;">${item.desc}</p>
        </div>
    `).join('');
}
