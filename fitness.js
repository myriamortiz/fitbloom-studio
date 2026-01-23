// -------------------------------
// CONFIG & CHARGEMENT
// -------------------------------
const DATA_URL = "data/fitness.json";

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

// Global Pools Cache
let globalPools = null;

// 1. CHARGEMENT POOLS
async function loadFitnessData() {
  try {
    const response = await fetch(DATA_URL);
    const pools = await response.json();
    initPage(pools);
  } catch (error) {
    console.error("Erreur chargement fitness:", error);
  }
}

// 2. LE GÉNÉRATEUR DYNAMIQUE (THE MIXER) 🧠
function generateSession(pools, profile, weekParity, targetDay = null) {
  // Determine Track based on Goal
  let primary = 'fullbody';
  let secondary = 'cardio';

  if (profile.goal === 'perte_poids') { primary = 'cardio'; secondary = 'fullbody'; }
  if (profile.goal === 'prise_masse') { primary = 'upper'; secondary = 'lower'; }
  if (profile.goal === 'forme') { primary = 'soft'; secondary = 'fullbody'; }

  // Target Day: default to Today (0-6)
  const dayToUse = (targetDay !== null) ? targetDay : new Date().getDay();

  // Safe Array Check
  const days = profile.workoutDays || [1, 3, 5];
  const isWorkoutDay = days.includes(dayToUse);

  if (!isWorkoutDay) {
    return {
      name: "🌿 Repos Actif",
      duration: "Libre",
      exercises: [],
      isRest: true
    };
  }

  // Seed for stability
  const seed = dayToUse + (weekParity ? 10 : 0);

  let category = primary;
  if (seed % 2 !== 0) category = secondary;
  if (profile.goal === 'prise_masse') {
    category = (seed % 2 === 0) ? 'upper' : 'lower';
  }

  const pool = pools[category];
  if (!pool || pool.length === 0) return (pools['fullbody'] && pools['fullbody'][0]) || { name: "Erreur", duration: "0", exercises: [], isRest: true };

  const sessionIndex = seed % pool.length;
  let session = pool[sessionIndex];

  let badge = "";
  if (category === 'cardio') badge = "🔥";
  if (category === 'soft') badge = "🧘‍♀️";
  if (category === 'upper' || category === 'lower') badge = "💪";

  return {
    ...session,
    name: `${badge} ${session.name}`,
    isRest: false
  };
}

// -------------------------------
// INITIALISATION DE LA PAGE
// -------------------------------
function initPage(pools) {
  globalPools = pools;
  const profile = JSON.parse(localStorage.getItem('userProfile')) || { workoutDays: [1, 3, 5], goal: 'forme' };

  // Clean initialization
  const d = new Date();
  const currentWeekNumber = getWeekNumber(d);
  const isWeekB = currentWeekNumber % 2 !== 0;

  // Render TODAY by default
  updateDisplayForDay(d.getDay());

  // Week Grid
  for (let i = 1; i <= 7; i++) {
    const simDay = (i === 7) ? 0 : i; // 1..6, 0
    const isActive = (profile.workoutDays || []).includes(simDay);

    const bubble = document.getElementById(`day-${i}`);
    if (bubble) {
      if (isActive) {
        bubble.querySelector("span").textContent = "Sport";
        bubble.style.borderColor = "var(--fbs-rose-clair)";
      } else {
        bubble.querySelector("span").textContent = "Repos";
        bubble.style.opacity = "0.5";
      }

      bubble.style.cursor = "pointer";
      bubble.onclick = () => {
        // Highlight
        for (let k = 1; k <= 7; k++) {
          const b = document.getElementById(`day-${k}`);
          if (b) b.style.background = 'transparent';
        }
        bubble.style.background = 'rgba(255,255,255,0.1)';

        updateDisplayForDay(simDay);
      };
    }
  }
}

function updateDisplayForDay(dayIndex) {
  if (!globalPools) return;

  const profile = JSON.parse(localStorage.getItem('userProfile')) || { workoutDays: [1, 3, 5], goal: 'forme' };
  const currentWeekNumber = getWeekNumber(new Date());
  const isWeekB = currentWeekNumber % 2 !== 0;

  const session = generateSession(globalPools, profile, isWeekB, dayIndex);

  // UI Update
  const titleEl = document.querySelector('.session-title');
  if (titleEl) {
    const isToday = (dayIndex === new Date().getDay());
    titleEl.textContent = isToday ? "Séance du jour" : `Aperçu : ${getDayName(dayIndex)}`;
  }

  document.getElementById("today-session-name").textContent = session.name;
  document.getElementById("today-session-duration").textContent = session.duration;

  const btn = document.getElementById("voir-seance");
  const oldMsg = document.getElementById('msg-repos');
  if (oldMsg) oldMsg.remove();

  if (session.isRest) {
    if (btn) btn.style.display = 'none';

    const msg = document.createElement('p');
    msg.id = 'msg-repos';
    msg.textContent = "Repos ou Marche active 🌿";
    msg.style.color = "var(--fbs-rose-suave)";
    msg.style.marginTop = "1rem";
    if (btn && btn.parentNode) btn.parentNode.insertBefore(msg, btn);

    const checkBtn = document.getElementById("check-session-btn");
    if (checkBtn) checkBtn.style.display = 'none';

  } else {
    if (btn) btn.style.display = 'inline-block';
    setupModal(session.exercises);

    setupCheckButton(session); // Setup validation button logic
    const checkBtn = document.getElementById("check-session-btn");
    if (checkBtn) checkBtn.style.display = 'block';
  }
}

function getDayName(dayIndex) {
  const names = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  return names[dayIndex];
}

// -------------------------------
// GESTION DU BOUTON VALIDATION
// -------------------------------
function setupCheckButton(session) {
  const sessionContainer = document.querySelector(".session");
  let checkBtn = document.getElementById("check-session-btn");
  if (!checkBtn) {
    checkBtn = document.createElement("button");
    checkBtn.className = "main-btn";

    // Insertion dans le container .session-actions
    const actionContainer = document.querySelector(".session-actions");
    if (actionContainer) {
      actionContainer.appendChild(checkBtn);
    } else {
      // Fallback si pas de container
      const voirBtn = document.getElementById("voir-seance");
      if (voirBtn && voirBtn.parentNode) {
        voirBtn.parentNode.insertBefore(checkBtn, voirBtn.nextSibling);
      }
    }
  }

  const dateKey = getTodayStr();
  const history = JSON.parse(localStorage.getItem("fitness_history")) || {};
  const isDone = history[dateKey];

  updateCheckButtonState(checkBtn, isDone);

  checkBtn.onclick = () => {
    const newStatus = !history[dateKey];
    if (newStatus) {
      history[dateKey] = true;
      confettiEffect();
    } else {
      delete history[dateKey];
    }
    localStorage.setItem("fitness_history", JSON.stringify(history));
    updateCheckButtonState(checkBtn, newStatus);
  };
}

function updateCheckButtonState(btn, isDone) {
  if (isDone) {
    btn.textContent = "Séance terminée ! ✅";
    btn.style.background = "var(--fbs-rose-suave)";
    btn.style.color = "#fff";
    btn.style.borderColor = "var(--fbs-rose-suave)";
  } else {
    btn.textContent = "Valider ma séance";
    btn.style.background = ""; // Retour au style CSS .main-btn
    btn.style.color = "";
    btn.style.borderColor = "";
  }
}

function confettiEffect() {
  const sessionBox = document.querySelector(".session");
  if (sessionBox) {
    sessionBox.style.transition = "box-shadow 0.3s";
    sessionBox.style.boxShadow = "0 0 50px var(--fbs-rose-clair)";
    setTimeout(() => {
      sessionBox.style.boxShadow = "0 0 18px var(--fbs-glow)";
    }, 500);
  }
}

// -------------------------------
// GESTION DE LA MODAL EXERCICES
// -------------------------------
function setupModal(exercises) {
  const buttonVoirSeance = document.getElementById("voir-seance");
  const modal = document.querySelector(".modal");
  const modalCloseButton = document.querySelector(".modal-close");
  const exercicesList = document.getElementById("exercices-list");

  if (buttonVoirSeance) {
    buttonVoirSeance.onclick = () => {
      // Clear
      exercicesList.innerHTML = '';
      if (!exercises || exercises.length === 0) {
        exercicesList.innerHTML = "<p>Repos.</p>";
      } else {
        exercises.forEach(ex => {
          const div = document.createElement("div");
          div.className = "exercice";
          div.style.marginBottom = "1rem";
          div.style.paddingBottom = "1rem";
          div.style.borderBottom = "1px solid rgba(255,255,255,0.1)";
          div.innerHTML = `
              <p style="font-size:1.1rem; color:var(--fbs-rose-clair); margin-bottom:0.2rem;"><strong>${ex.name}</strong></p>
              <div style="display:flex; gap:1rem; font-size:0.95rem;">
                <span>🔄 ${ex.repetitions}</span>
                <span>🔁 ${ex.rounds} tours</span>
              </div>
            `;
          exercicesList.appendChild(div);
        });
      }
      modal.classList.remove("hidden");
    };
  }

  if (modalCloseButton) {
    modalCloseButton.onclick = () => {
      modal.classList.add("hidden");
    };
  }
}

// -------------------------------
// HELPERS
// -------------------------------
const backButton = document.querySelector(".back-btn");
if (backButton) {
  backButton.addEventListener("click", () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "index.html";
    }
  });
}

function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// START
loadFitnessData();
