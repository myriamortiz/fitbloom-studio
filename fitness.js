// -------------------------------
// CONFIG & CONSTANTS
// -------------------------------
const DATA_URL = "data/fitness.json";
const STORAGE_KEY = "fbs-fitness-week-v1";

// -------------------------------
// 1. CHARGEMENT & INIT
// -------------------------------
async function loadFitnessData() {
  try {
    const response = await fetch(DATA_URL);
    const pools = await response.json();

    // Setup User Profile
    const profile = getUserProfile();

    // Init Week
    const weekData = getOrGenerateWeek(pools, profile);

    // Render
    renderWeek(weekData, profile);

  } catch (error) {
    console.error("Erreur chargement fitness:", error);
  }
}

function getUserProfile() {
  return JSON.parse(localStorage.getItem('userProfile')) || {
    name: "Guest",
    workoutDays: [1, 3, 5],
    goals: ['forme'],
    activity: 1.2
  };
}

// -------------------------------
// 2. LOGIQUE GÉNÉRATION SEMAINE
// -------------------------------
function getOrGenerateWeek(pools, profile) {
  const d = new Date();
  const currentWeekNum = getWeekNumber(d);

  // Check Storage
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (stored && stored.weekNum === currentWeekNum && stored.profileHash === hashProfile(profile)) {
    console.log("Chargement semaine fitness existante...");
    return stored.days;
  }

  console.log("Génération nouvelle semaine fitness...");
  const days = generateFullWeek(pools, profile);

  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    weekNum: currentWeekNum,
    profileHash: hashProfile(profile),
    days: days
  }));

  return days;
}

function generateFullWeek(pools, profile) {
  const weekPlan = [];
  const workoutDays = profile.workoutDays || []; // e.g. [1, 3, 5]
  let workoutCounter = 0;
  const usedSessions = new Set();

  for (let i = 0; i < 7; i++) {
    if (!workoutDays.includes(i)) {
      // Rest Day
      weekPlan[i] = { type: 'rest', name: "Repos & Récup", duration: "Active", exercises: [] };
    } else {
      // Workout Day
      weekPlan[i] = pickSession(pools, profile, i, workoutCounter, usedSessions);
      workoutCounter++;
    }
  }

  return weekPlan;
}

function pickSession(pools, profile, dayIndex, workoutCounter, usedSessions) {
  // STRATEGY BASED ON GOAL
  let category = 'fullbody';

  // Rotation based on sequence to ensure variety even if days are only even/odd
  const isEvenSeq = (workoutCounter % 2 === 0);

  if (profile.goals && profile.goals.includes('perte_poids') && profile.goals.includes('prise_masse')) {
    // HYBRID : Mix Cardio & Strength
    // Odd days = Cardio, Even days = Upper/Lower
    if (workoutCounter % 2 !== 0) {
      category = 'cardio';
    } else {
      category = (workoutCounter % 4 === 0) ? 'upper' : 'lower';
    }
  }
  else if (profile.goals && profile.goals.includes('perte_poids')) {
    // 70% Cardio/HIIT, 30% Fullbody
    // Use random primarily but ensure at least some Mix
    category = (Math.random() > 0.3) ? 'cardio' : 'fullbody';
  }
  else if (profile.goals && profile.goals.includes('prise_masse')) {
    // Upper / Lower Split STRICT rotation
    category = isEvenSeq ? 'upper' : 'lower';
  }
  else {
    // Forme: Mix everything
    const types = ['soft', 'fullbody', 'cardio', 'lower', 'upper'];
    category = types[workoutCounter % types.length];
  }

  // Safety fallback
  let pool = pools[category];
  if (!pool || pool.length === 0) pool = pools['fullbody'];

  // FILTER UNUSED
  // Start with fresh candidates
  let candidates = pool.filter(s => !usedSessions.has(s.name));

  // If we ran out of unique sessions in this category, reset (fallback to full pool)
  if (candidates.length === 0) candidates = pool;

  // Pick random from candidates
  const rawSession = candidates[Math.floor(Math.random() * candidates.length)];

  // Mark as used
  if (rawSession && rawSession.name) usedSessions.add(rawSession.name);

  // CLONE & ADAPT difficulty
  const session = JSON.parse(JSON.stringify(rawSession));
  adaptDifficulty(session, profile);

  return {
    type: 'workout',
    category: category,
    ...session
  };
}

function adaptDifficulty(session, profile) {
  const activity = profile.activity || 1.2;
  // 1.2 = Sedentary, 1.375 = Light, 1.55 = Moderate, 1.725 = Active

  let multiplier = 1;
  if (activity >= 1.55) multiplier = 1.5; // +50% rounds/reps
  else if (activity >= 1.375) multiplier = 1.2;

  if (multiplier > 1) {
    session.duration += " (+Intense)";
    session.exercises.forEach(ex => {
      if (ex.rounds && typeof ex.rounds === 'number') {
        ex.rounds = Math.ceil(ex.rounds * multiplier);
      }
    });
  }
}

// -------------------------------
// 3. AFFICHAGE (UI)
// -------------------------------
function renderWeek(weekData, profile) {
  // 1. Render Bubble Grid
  // UI expects day-1 (Mon) to day-7 (Sun)

  const todayIndex = new Date().getDay(); // 0=Sun, 1=Mon

  for (let i = 1; i <= 7; i++) {
    const jsDay = (i === 7) ? 0 : i; // Convert 7->0 for Sunday
    const bubble = document.getElementById(`day-${i}`);
    const dayData = weekData[jsDay];

    if (bubble) {
      const span = bubble.querySelector("span");

      // State
      if (dayData.type === 'rest') {
        bubble.classList.add('rest-day');
        span.innerHTML = `<span style="font-size:0.8em">Repos</span>`;
        bubble.style.opacity = '0.5';
        bubble.style.borderColor = 'rgba(255,255,255,0.1)';
      } else {
        bubble.classList.add('workout-day');
        // Icon based on category
        let icon = "💪";
        if (dayData.category === 'cardio') icon = "🔥";
        if (dayData.category === 'soft') icon = "🧘‍♀️";

        span.innerHTML = `${icon}<br><span style="font-size:0.7em">${getDayNameShort(jsDay)}</span>`;
        bubble.style.borderColor = 'var(--fbs-rose-clair)';
      }

      // Interaction
      bubble.onclick = () => showSession(jsDay, weekData[jsDay]);

      // Auto-select today
      if (jsDay === todayIndex) {
        bubble.click();
      }
    }
  }
}

function showSession(dayIndex, session) {
  // Highlight bubble
  document.querySelectorAll('.day-bubble').forEach(b => b.classList.remove('active-day'));
  const uiDay = (dayIndex === 0) ? 7 : dayIndex;
  const bubble = document.getElementById(`day-${uiDay}`);
  if (bubble) bubble.classList.add('active-day');

  // Update Card
  const titleEl = document.querySelector('.session-title');
  const nameEl = document.getElementById('today-session-name');
  const durEl = document.getElementById('today-session-duration');
  const btn = document.getElementById('voir-seance');

  // Is it today?
  const isToday = (dayIndex === new Date().getDay());
  titleEl.textContent = isToday ? "SÉANCE DU JOUR" : `PROGRAMME DU ${getDayName(dayIndex).toUpperCase()}`;

  nameEl.textContent = session.name;
  durEl.textContent = session.duration;

  // Clear old elements if any
  const oldMsg = document.getElementById('msg-repos');
  if (oldMsg) oldMsg.remove();

  if (session.type === 'rest') {
    btn.style.display = 'none';

    const msg = document.createElement('p');
    msg.id = 'msg-repos';
    msg.innerHTML = "💤 Profite de cette journée pour récupérer.<br>Une petite marche est toujours bienvenue !";
    msg.style.color = "var(--fbs-rose-suave)";
    msg.style.marginTop = "1rem";
    msg.style.fontSize = "0.9rem";
    btn.parentNode.insertBefore(msg, btn);

  } else {
    btn.style.display = 'inline-block';
    btn.onclick = () => openModal(session);
  }
}

// -------------------------------
// 4. MODAL
// -------------------------------
function openModal(session) {
  const modal = document.querySelector(".modal");
  const list = document.getElementById("exercices-list");

  list.innerHTML = ""; // Clear

  session.exercises.forEach(ex => {
    const div = document.createElement("div");
    div.className = "exo-item";
    div.innerHTML = `
            <div class="exo-header">
                <span class="exo-name">
                  ${ex.name} 
                  <a href="https://www.youtube.com/results?search_query=exercice+fitness+${encodeURIComponent(ex.name)}" target="_blank" style="text-decoration:none; margin-left:5px;" title="Voir démo vidéo">🎥</a>
                </span>
                <span class="exo-rounds">${ex.rounds} tours</span>
            </div>
            <div class="exo-reps">Répétitions: <strong>${ex.reps}</strong></div>
        `;
    list.appendChild(div);
  });

  modal.classList.remove("hidden");

  // Close logic
  document.querySelector(".modal-close").onclick = () => modal.classList.add("hidden");
}

// -------------------------------
// HELPERS
// -------------------------------
function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function hashProfile(p) {
  // Simple hash to detect significant profile changes
  return `${(p.goals || []).join('-')}-${p.activity}-${(p.workoutDays || []).join('')}`;
}

function getDayName(i) {
  return ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"][i];
}

function getDayNameShort(i) {
  return ["DIM", "LUN", "MAR", "MER", "JEU", "VEN", "SAM"][i];
}

// Navigation Back
const backButton = document.querySelector(".back-btn");
if (backButton) {
  backButton.addEventListener("click", () => {
    window.location.href = "index.html";
  });
}

// START
loadFitnessData();
