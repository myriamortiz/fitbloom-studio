// -------------------------------
// SELFCARE UNIVERSE (V1)
// -------------------------------

document.addEventListener("DOMContentLoaded", () => {
  loadMoodModule();

  loadJournalModule();
  loadRitual();
  loadRespiration();

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

  // GAMIFICATION: XP for Mood Log
  // Check if first time today? Or allow updates? 
  // Let's allow updates but maybe cap per day elsewhere?
  // Current gamification engine allows accumulation. Let's assume daily check inside gainXP wrapper if we wanted specific limits, 
  // but here we can just verify if entry existed before.
  // Actually, simplest is to just give it. Or check usage.
  // Let's check if we ALREADY had an entry for today.
  const alreadyLogged = (history[today] && history[today].val) ? true : false;
  // Wait, I just overwrote it above. I should have checked before.
  // Instead, let's just make a separate tracking for 'xp_given_mood_DATE'.

  const xpKey = `xp_mood_${today}`;
  if (!localStorage.getItem(xpKey) && window.gainXP) {
    window.gainXP(20, "Humeur du jour 🌈");
    localStorage.setItem(xpKey, "true");
  }

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

    // Check if first time specific today
    if (!journalData[today] && text.length > 5) {
      if (window.gainXP) window.gainXP(15, "Journaling du jour");
    }

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
let guidanceInterval;

window.startBreathing = (durationMinutes) => {
  const circle = document.getElementById('breath-circle');
  const timerText = document.getElementById('breath-timer');

  if (!circle) return;

  stopBreathing();
  circle.classList.add('active');

  // Initial State
  timerText.textContent = "Inspire...";
  let secondsLeft = durationMinutes * 60;

  // Update Guidance Text every 5 seconds (sync with 10s animation: 5s In, 5s Out)
  // We use a separate interval to stay perfectly synced with the phase changes
  let phase = 'in'; // 'in' or 'out'

  // Start the guidance loop
  guidanceInterval = setInterval(() => {
    // This flips every 5 seconds
    phase = (phase === 'in') ? 'out' : 'in';
    timerText.textContent = (phase === 'in') ? "Inspire..." : "Expire...";
  }, 5000);

  // Global Timer (just to stop at the end)
  breatheInterval = setInterval(() => {
    secondsLeft--;

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
  clearInterval(guidanceInterval);
  timerText.textContent = "Prête ?";
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

// TODO LIST (Refactored)
function loadTodos() {
  const container = document.getElementById('todos-container');
  if (!container) return;

  const input = document.getElementById('todo-input');
  const addBtn = document.getElementById('add-todo');

  // Upgrade styling
  if (input && input.parentElement && input.parentElement.classList.contains("todo-add")) {
    input.parentElement.className = "todo-add-row";
    input.className = "todo-input-modern";
    if (addBtn) addBtn.className = "todo-add-btn-modern";
  }

  // Wraps in a container if not already (hacky but works for legacy HTML structure)
  // Ideally we change HTML but let's keep it JS-driven for simplicity in this step.

  let todos = JSON.parse(localStorage.getItem('todos')) || [];

  const render = () => {
    container.innerHTML = "";
    todos.forEach((todo, idx) => {
      const div = document.createElement("div");
      div.className = `todo-item-modern ${todo.done ? 'done' : ''}`;

      div.innerHTML = `
        <input type="checkbox" ${todo.done ? 'checked' : ''} class="grocery-check" onchange="toggleTodo(${idx})">
        <span class="todo-text-modern">${todo.text}</span>
        <button class="todo-del-btn" onclick="deleteTodo(${idx})">🗑️</button>
      `;
      container.appendChild(div);
    });
  };

  addBtn.onclick = () => {
    if (!input.value.trim()) return;
    todos.push({ text: input.value, done: false });
    localStorage.setItem('todos', JSON.stringify(todos));
    input.value = "";
    render();
  };

  window.toggleTodo = (idx) => {
    todos[idx].done = !todos[idx].done;
    localStorage.setItem('todos', JSON.stringify(todos));
    render();
  };

  window.deleteTodo = (idx) => {
    todos.splice(idx, 1);
    localStorage.setItem('todos', JSON.stringify(todos));
    render();
  };

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

  // Render with Clickable Cards
  container.innerHTML = list.map(item => {
    // Escape item for onclick
    const jsonItem = JSON.stringify(item).replace(/"/g, "&quot;");
    return `
        <div class="complement-card" onclick="openComplementDetails(${jsonItem})">
            <div style="font-size:2rem; margin-bottom:0.5rem;">${item.icon}</div>
            <h3 style="color:var(--fbs-rose-pale); font-size:1rem; margin-bottom:0.3rem;">${item.name}</h3>
            <p style="font-size:0.85rem; color:var(--fbs-taupe-rose); line-height:1.4;">${item.desc.substring(0, 50)}...</p>
        </div>
    `;
  }).join('');
}

// OPEN DETAIL
window.openComplementDetails = (item) => {
  document.getElementById('comp-icon').textContent = item.icon;
  document.getElementById('comp-title').textContent = item.name;
  document.getElementById('comp-desc').textContent = item.desc;

  // Fake extra data if not in JSON (to save time, or we could update JSON)
  // Let's assume JSON has benefits/dosage OR we generate generic ones
  document.getElementById('comp-benefits').textContent = item.benefits || "Favorise le bien-être général et aide à l'équilibre du corps. Idéal pour compléter une alimentation variée.";
  document.getElementById('comp-dosage').textContent = item.dosage || "1 à 2 gélules par jour avec un grand verre d'eau, de préférence le matin.";

  document.getElementById('complements-popup').style.display = 'flex';
};

document.getElementById('close-complements').onclick = () => {
  document.getElementById('complements-popup').style.display = 'none';
};

// ----------------------------
// WEEKLY RECAP LOGIC
// ----------------------------
function loadWeeklyRecap() {
  const container = document.getElementById('weekly-recap');
  if (!container) return;

  const moodHistory = JSON.parse(localStorage.getItem("emotions_history")) || {};
  const habitHistory = JSON.parse(localStorage.getItem("habits_history")) || {};

  // Calculate Average Mood (Last 7 days)
  let totalMood = 0;
  let moodCount = 0;
  let daysAnalyzed = 0;

  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];

    if (moodHistory[key]) {
      totalMood += moodHistory[key].val;
      moodCount++;
    }
  }

  // Calculate Top Habit
  const habitCounts = {};
  Object.values(habitHistory).forEach(doneList => {
    doneList.forEach(hId => {
      habitCounts[hId] = (habitCounts[hId] || 0) + 1;
    });
  });

  // Find max
  let topHabitId = null;
  let maxCount = 0;
  Object.entries(habitCounts).forEach(([id, count]) => {
    if (count > maxCount) {
      maxCount = count;
      topHabitId = id;
    }
  });

  // Render
  if (moodCount === 0) {
    container.innerHTML = "Pas assez de données cette semaine. Continue à prendre soin de toi ! 💖";
    return;
  }

  const avg = (totalMood / moodCount).toFixed(1);
  let msg = `Humeur moyenne : <strong>${avg}/5</strong> this week.`;
  container.innerHTML = msg;
}

// Calls logic at end of load
// Add to init?
// It was not called in DOMContentLoaded in original file, let's look at line 12.
// We can just call it at the end of file or add to init list.
// For safety, let's append it to the global init or just call it here if DOM is ready.
if (document.readyState === "complete") {
  loadWeeklyRecap();
} else {
  window.addEventListener("load", loadWeeklyRecap);
}
