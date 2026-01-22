// -------------------------------
// CONFIG & CHARGEMENT
// -------------------------------

const DATA_URL = "data/fitness.json";

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

async function loadFitnessData() {
  try {
    const response = await fetch(DATA_URL);
    const sessions = await response.json();
    initPage(sessions);
  } catch (error) {
    console.error("Erreur chargement fitness:", error);
  }
}

// -------------------------------
// INITIALISATION DE LA PAGE
// -------------------------------
function initPage(sessions) {
  const today = new Date().getDay(); // 0 = Dimanche
  const index = today === 0 ? 7 : today; // 1 = Lundi ... 7 = Dimanche

  // LOGIQUE SEMAINE A / SEMAINE B
  // On utilise le numéro de la semaine dans l'année
  const currentWeekNumber = getWeekNumber(new Date());
  const isWeekB = currentWeekNumber % 2 !== 0; // Impaire = B, Paire = A

  let session = sessions[index];

  // Variation B : On change un peu le programme !
  if (isWeekB) {
    // Pour la démo, on inverse le Nom ou on ajoute un suffixe "Intense"
    // Idéalement, on aurait un fichier fitness_b.json
    session = { ...session }; // Clone
    session.name += " (Week B)";
    // On pourrait aussi mixer les exercices ici si on voulait
  }

  // 1. Afficher les infos de la séance
  document.getElementById("today-session-name").textContent = session.name;
  document.getElementById("today-session-duration").textContent = session.duration;

  // Petit indicateur A/B
  const subtitle = document.querySelector('.sub-subtitle');
  if (subtitle && !subtitle.innerHTML.includes("Coach")) {
    subtitle.innerHTML += `<br><span style="font-size:0.8rem; opacity:0.7;">Programme ${isWeekB ? 'B' : 'A'}</span>`;
  }

  // 2. Gérer le bouton "Voir ma séance"
  setupModal(session.exercises);

  // 3. Gérer le bouton "Séance terminée ✅"
  setupCheckButton(session);

  // 4. Remplir la grille de la semaine (visuel simple)
  Object.keys(sessions).forEach((dayIdx) => {
    const bubble = document.getElementById(`day-${dayIdx}`);
    if (bubble) {
      bubble.querySelector("span").textContent = sessions[dayIdx].name;
    }
  });

  // 5. Conseil Coach Personnalisé
  const profile = JSON.parse(localStorage.getItem('userProfile'));
  if (profile && profile.goal) {
    let advice = "";
    if (profile.goal === 'perte_poids') advice = "🔥 Objectif Brûle-Graisse : Garde un rythme soutenu, minimise les pauses !";
    if (profile.goal === 'forme') advice = "✨ Objectif Vitalité : Concentre-toi sur la qualité du mouvement et ta respiration.";
    if (profile.goal === 'prise_masse') advice = "💪 Objectif Force : Ralentis la phase négative (descente) pour plus d'impact.";

    const subSubtitle = document.querySelector('.sub-subtitle');
    if (subSubtitle && advice) {
      subSubtitle.innerHTML = `<span style="color:var(--fbs-rose-suave); font-weight:600;">Coach:</span> ${advice}`;
    }
  }
}

// -------------------------------
// GESTION DU BOUTON VALIDATION
// -------------------------------
function setupCheckButton(session) {
  const sessionContainer = document.querySelector(".session");

  // Créer le bouton s'il n'existe pas déjà
  let checkBtn = document.getElementById("check-session-btn");
  if (!checkBtn) {
    checkBtn = document.createElement("button");
    checkBtn.id = "check-session-btn";
    checkBtn.className = "main-btn";
    checkBtn.style.marginTop = "1rem";
    checkBtn.style.background = "rgba(255,255,255,0.1)";
    checkBtn.style.borderColor = "var(--fbs-rose-pale)";
    // Insérer après le bouton "Voir ma séance"
    const voirBtn = document.getElementById("voir-seance");
    voirBtn.parentNode.insertBefore(checkBtn, voirBtn.nextSibling);
    // Petit espace entre les deux
    voirBtn.style.marginRight = "1rem";
  }

  const dateKey = getTodayStr();
  const history = JSON.parse(localStorage.getItem("fitness_history")) || {};
  const isDone = history[dateKey];

  updateCheckButtonState(checkBtn, isDone);

  checkBtn.onclick = () => {
    const newStatus = !history[dateKey];

    // Sauvegarde
    if (newStatus) {
      history[dateKey] = true;
      confettiEffect(); // Petit effet visuel
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
  // Simple effet visuel temporaire (juste un feedback)
  const sessionBox = document.querySelector(".session");
  sessionBox.style.transition = "box-shadow 0.3s";
  sessionBox.style.boxShadow = "0 0 50px var(--fbs-rose-clair)";
  setTimeout(() => {
    sessionBox.style.boxShadow = "0 0 18px var(--fbs-glow)";
  }, 500);
}

// -------------------------------
// GESTION DE LA MODAL EXERCICES
// -------------------------------
function setupModal(exercises) {
  const buttonVoirSeance = document.getElementById("voir-seance");
  const modal = document.querySelector(".modal");
  const modalCloseButton = document.querySelector(".modal-close");
  const exercicesList = document.getElementById("exercices-list");

  buttonVoirSeance.onclick = () => {
    exercicesList.innerHTML = '';

    if (!exercises || exercises.length === 0) {
      exercicesList.innerHTML = "<p>Aucun exercice technique aujourd'hui (Repos / Balade / Danse).</p>";
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

  if (modalCloseButton) {
    modalCloseButton.onclick = () => {
      modal.classList.add("hidden");
    };
  }
}

// -------------------------------
// NAVIGATION RETOUR
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

// LANCHER LE CHARGEMENT
loadFitnessData();

// HELPER : Numéro de semaine
function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return weekNo;
}
