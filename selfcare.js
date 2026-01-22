// -------------------------------
// SELFCARE UNIVERSE
// -------------------------------

// EMOTIONS
function loadEmotions() {
  const container = document.getElementById("emotion-container");
  if (!container) return; // Pas sur la page

  // Gérer le clic
  const buttons = container.querySelectorAll(".emotion-btn");
  buttons.forEach(btn => {
    btn.onclick = () => {
      // Retirer la classe active
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const emotion = btn.getAttribute("data-emotion");
      saveEmotion(emotion);
    };
  });
}

function saveEmotion(emotion) {
  const msg = document.getElementById("emotion-save-msg");

  // Sauvegarde fictive
  const today = new Date().toISOString().split("T")[0];
  const history = JSON.parse(localStorage.getItem("emotions_history")) || {};
  history[today] = emotion;
  localStorage.setItem("emotions_history", JSON.stringify(history));

  msg.textContent = `Noté : "${emotion}". Prends soin de toi 💖`;
}

// HABITS
function loadHabits() {
  const habits = document.querySelectorAll(".habit");
  if (!habits.length) return;

  const today = new Date().toISOString().split("T")[0];
  const history = JSON.parse(localStorage.getItem("habits_history")) || {};
  const todaysHabits = history[today] || [];

  habits.forEach(h => {
    const type = h.getAttribute("data-habit");

    // Restaurer l'état
    if (todaysHabits.includes(type)) {
      h.checked = true;
      h.parentElement.style.color = "var(--fbs-rose-clair)";
    }

    // Click event
    h.onchange = () => {
      let current = history[today] || [];
      if (h.checked) {
        if (!current.includes(type)) current.push(type);
        h.parentElement.style.color = "var(--fbs-rose-clair)";
      } else {
        current = current.filter(x => x !== type);
        h.parentElement.style.color = "var(--fbs-rose-pale)";
      }
      history[today] = current;
      localStorage.setItem("habits_history", JSON.stringify(history));
    };
  });
}

// RITUEL DU JOUR
function displayDate() {
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

  const today = new Date().getDate(); // 1-31
  const index = today % rituels.length;
  rituelText.textContent = `✨ ${rituels[index]}`;
}


// RESPIRATION
let breatheInterval;
function startBreathing(durationMinutes) {
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

function stopBreathing() {
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

// TODO LIST
function loadTodos() {
  const container = document.getElementById('todos-container');
  const input = document.getElementById('todo-input');
  const addBtn = document.getElementById('add-todo');

  if (!container) return;

  let todos = JSON.parse(localStorage.getItem('todos')) || [];

  function render() {
    container.innerHTML = '';
    todos.forEach((todo, idx) => {
      const div = document.createElement('div');
      div.style.display = 'flex';
      div.style.justifyContent = 'space-between';
      div.style.background = 'rgba(255,255,255,0.05)';
      div.style.padding = '0.8rem';
      div.style.borderRadius = '15px';
      div.style.alignItems = 'center';

      div.innerHTML = `
                <span style="text-decoration: ${todo.done ? 'line-through' : 'none'}; color: ${todo.done ? 'grey' : 'white'}">${todo.text}</span>
                <button onclick="toggleTodo(${idx})" style="background:none; border:none; cursor:pointer;">${todo.done ? '✅' : '🔲'}</button>
                <button onclick="deleteTodo(${idx})" style="background:none; border:none; cursor:pointer; margin-left:10px;">🗑️</button>
            `;
      container.appendChild(div);
    });
  }

  addBtn.onclick = () => {
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

// 4. INIT
// ----------------------------
document.addEventListener("DOMContentLoaded", () => {
  displayDate();
  loadEmotions();
  loadHabits();
  loadTodos();
  loadComplements(); // V8

  const recap = document.getElementById('weekly-recap');
  if (recap) {
    const profile = JSON.parse(localStorage.getItem('userProfile'));
    if (profile) {
      recap.innerHTML = `Semaine en cours pour <strong>${profile.name}</strong>.<br>Objectif : ${profile.goal.replace('_', ' ')}.`;
    }
  }
});

// 5. COMPLEMENTS EXPERT (V8 - 4 SAISONS + CATEGORIES)
let complementsData = null;

async function loadComplements() {
  // Detect 4 Seasons
  const month = new Date().getMonth(); // 0 = Jan, 11 = Dec
  let season = 'hiver'; // default
  let seasonIcon = '❄️ Hiver';

  if (month >= 2 && month <= 4) { season = 'printemps'; seasonIcon = '🌸 Printemps'; }
  else if (month >= 5 && month <= 7) { season = 'ete'; seasonIcon = '☀️ Été'; }
  else if (month >= 8 && month <= 10) { season = 'automne'; seasonIcon = '🍂 Automne'; }

  // Titre Badge Saison
  const header = document.querySelector('.page-selfcare .sc-title');
  if (header) {
    // Reset content to ensure clean state
    if (!header.getAttribute('data-original-text')) {
      header.setAttribute('data-original-text', 'Mes compléments');
    }
    header.innerHTML = `Mes compléments <span class="season-badge">${seasonIcon}</span>`;
  }

  // Load 'saison' by default
  updateComplementsDisplay('saison');
}

window.switchComplementTab = function (category, btn) {
  // Highlighting
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
      console.error("Erreur chargement", e);
      container.innerHTML = "<p>Erreur.</p>";
      return;
    }
  }

  let list = [];

  // LOGIC : Category or Season ?
  if (category === 'saison') {
    const month = new Date().getMonth();
    let seasonKey = 'hiver';
    if (month >= 2 && month <= 4) seasonKey = 'printemps';
    else if (month >= 5 && month <= 7) seasonKey = 'ete';
    else if (month >= 8 && month <= 10) seasonKey = 'automne';

    list = complementsData['saisons'][seasonKey];
  } else {
    // Direct category Access (stress, poids...)
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

// BACK BUTTON
const backButton = document.querySelector(".back-btn");
if (backButton) {
  backButton.addEventListener("click", function (e) {
    if (window.history.length > 1) {
      e.preventDefault();
      window.history.back();
    }
  });
}
