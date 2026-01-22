// -------------------------------
// CONFIG & CHARGEMENT
// -------------------------------

const DATA_URL = "data/fitness.json";

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

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
function generateSession(pools, profile, weekParity) {
  // Determine Track based on Goal
  let primary = 'fullbody';
  let secondary = 'cardio';

  if (profile.goal === 'perte_poids') { primary = 'cardio'; secondary = 'fullbody'; }
  if (profile.goal === 'prise_masse') { primary = 'upper'; secondary = 'lower'; } // Split
  if (profile.goal === 'forme') { primary = 'soft'; secondary = 'fullbody'; }

  // On crée une semaine de 7 jours
  // On veut distribuer les séances sur les userProfile.workoutDays
  // Ex: Lundi (1), Mercredi (3), Vendredi (5)

  const today = new Date().getDay(); // 0-6
  const isWorkoutDay = profile.workoutDays && profile.workoutDays.includes(today);

  if (!isWorkoutDay) {
    // JOUR OFF
    return {
      name: "🌿 Repos Actif",
      duration: "Libre",
      exercises: [], // Vide = Pas de bouton voir
      isRest: true
    };
  }

  // JOUR ON : QUELLE SÉANCE ?
  // Pour varier, on utilise le numéro du jour + parité
  // Pseudo-random stable
  const seed = today + (weekParity ? 10 : 0);

  // Distribution Intelligente
  // Si c'est le 1er jour de la semaine -> Primary
  // Si c'est le 2eme -> Secondary
  // etc... (Simplifié ici pour la démo)

  let category = primary;
  if (seed % 2 !== 0) category = secondary;

  // Si prise de masse, on alterne Upper/Lower strict
  if (profile.goal === 'prise_masse') {
    category = (seed % 2 === 0) ? 'upper' : 'lower';
  }

  // Pioche dans le pool
  const pool = pools[category];
  if (!pool) return pools['fullbody'][0]; // Fallback

  const sessionIndex = seed % pool.length;
  let session = pool[sessionIndex];

  // Customisation du nom
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
  const profile = JSON.parse(localStorage.getItem('userProfile')) || { workoutDays: [1, 3, 5], goal: 'forme' };
  const currentWeekNumber = getWeekNumber(new Date());
  const isWeekB = currentWeekNumber % 2 !== 0;

  // Générer la séance DU JOUR
  const session = generateSession(pools, profile, isWeekB);

  // 1. Afficher les infos
  document.getElementById("today-session-name").textContent = session.name;
  document.getElementById("today-session-duration").textContent = session.duration;

  // Petit indicateur Semaine
  const subtitle = document.querySelector('.sub-subtitle');
  if (subtitle) {
    subtitle.innerHTML = `FitBloom Coach • Semaine ${isWeekB ? 'B' : 'A'}`;
  }

  // 2. Bouton Voir (Caché si repos)
  const btn = document.getElementById("voir-seance");
  if (session.isRest) {
    btn.style.display = 'none';
    // Msg repos
    const msg = document.createElement('p');
    msg.textContent = "Profite pour récupérer ou aller marcher !";
    msg.style.color = "var(--fbs-rose-suave)";
    msg.style.marginTop = "1rem";
    if (btn.parentNode) btn.parentNode.insertBefore(msg, btn);
  } else {
    btn.style.display = 'inline-block';
    setupModal(session.exercises);
  }

  // 3. Gestion du bouton "Séance terminée ✅" (Uniquement si pas repos)
  if (!session.isRest) setupCheckButton(session);

  // 4. Grille de la semaine (Visualisation)
  // On génère toute la semaine pour l'affichage
  for (let d = 1; d <= 7; d++) { // 1=Lundi -> 7=Dimanche
    // Simuler le jour d
    // Attention: getDay() renvoie 0 pour Dimanche, donc mapping 7->0
    const simDay = (d === 7) ? 0 : d;
    const isActive = profile.workoutDays.includes(simDay);

    const bubble = document.getElementById(`day-${d}`); // HTML IDs day-1 to day-7
    if (bubble) {
      if (isActive) {
        bubble.querySelector("span").textContent = "Sport";
        bubble.style.borderColor = "var(--fbs-rose-clair)";
      } else {
        bubble.querySelector("span").textContent = "Repos";
        bubble.style.opacity = "0.5";
      }
    }
  }
}

// -------------------------------
// GESTION DU BOUTON VALIDATION
// -------------------------------
function setupCheckButton(session) {
  const sessionContainer = document.querySelector(".session");
  let checkBtn = document.getElementById("check-session-btn");
  if (!checkBtn) {
    checkBtn = document.createElement("button");
    checkBtn.id = "check-session-btn";
    checkBtn.className = "main-btn";
    checkBtn.style.marginTop = "1rem";
    checkBtn.style.background = "rgba(255,255,255,0.1)";
    checkBtn.style.borderColor = "var(--fbs-rose-pale)";
    const voirBtn = document.getElementById("voir-seance");
    // Insert after "voir-seance" safely
    if (voirBtn && voirBtn.parentNode) {
      voirBtn.parentNode.insertBefore(checkBtn, voirBtn.nextSibling);
      voirBtn.style.marginRight = "1rem";
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
    btn.style.background = "var(--fbs-rose-pale)";
    btn.style.color = "#1a1a1a";
  } else {
    btn.textContent = "Valider ma séance";
    btn.style.background = "rgba(255,255,255,0.1)";
    btn.style.color = "var(--fbs-rose-pale)";
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
// NAVIGATION RETOUR + HELPER
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
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return weekNo;
}

// LANCHER LE CHARGEMENT
loadFitnessData();
