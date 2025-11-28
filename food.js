// -------------------------
//  FitBloom Studio – Weekly Food Planner
// -------------------------

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const foodWeekContainer = document.getElementById("food-week");

// Fichiers JSON
const brunchPath = "data/brunch/brunch.json";
const collationPath = "data/collation/collation.json";
const dinerPath = "data/diner/diner.json";
const jusPath = "data/jus/jus.json";

// ------------------------------------
// 1) Vérifier si on doit générer une nouvelle semaine
// ------------------------------------
function shouldGenerateNewWeek() {
  const savedMonday = localStorage.getItem("fbs_week_monday");
  const today = new Date();
  const monday = getMondayOfCurrentWeek();

  return savedMonday !== monday;
}

function getMondayOfCurrentWeek() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split("T")[0];
}

// ------------------------------------
// 2) Générer une nouvelle semaine
// ------------------------------------
async function generateWeek() {
  const [brunchData, collationData, dinerData, jusData] = await Promise.all([
    fetch(brunchPath).then(r => r.json()),
    fetch(collationPath).then(r => r.json()),
    fetch(dinerPath).then(r => r.json()),
    fetch(jusPath).then(r => r.json()),
  ]);

  const week = {};

  DAYS.forEach(day => {
    week[day] = {
      brunch: pickRandom(brunchData.permanent),
      collation: pickRandom(collationData.permanent),
      diner: pickRandom(dinerData.permanent),
      jus: pickRandom(jusData.permanent)
    };
  });

  localStorage.setItem("fbs_week", JSON.stringify(week));
  localStorage.setItem("fbs_week_monday", getMondayOfCurrentWeek());

  return week;
}

// Fonction utilitaire pour choisir une recette aléatoire
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ------------------------------------
// 3) Affichage visuel de la semaine
// ------------------------------------
function renderWeek(week) {
  foodWeekContainer.innerHTML = "";

  DAYS.forEach(day => {
    const d = week[day];

    const block = document.createElement("div");
    block.className = "food-day";

    block.innerHTML = `
      <h2>${day}</h2>

      <p class="food-meal-title">🥞 Brunch</p>
      <p class="food-meal-text">${d.brunch.name}</p>

      <p class="food-meal-title">🥜 Collation</p>
      <p class="food-meal-text">${d.collation.name}</p>

      <p class="food-meal-title">🍽️ Dîner</p>
      <p class="food-meal-text">${d.diner.name}</p>

      <label class="jus-toggle">
        <input type="checkbox" data-day="${day}">
        🧃 Ajouter un jus ?
      </label>

      <p class="food-meal-title" id="jus-${day}" style="display:none;">🧃 Jus</p>
      <p class="food-meal-text" id="jus-text-${day}" style="display:none;">${d.jus.name}</p>
    `;

    foodWeekContainer.appendChild(block);
  });

  // Gestion des jus (afficher/masquer)
  document.querySelectorAll(".jus-toggle input").forEach(input => {
    input.addEventListener("change", e => {
      const day = e.target.dataset.day;
      const title = document.getElementById(`jus-${day}`);
      const text = document.getElementById(`jus-text-${day}`);

      const visible = e.target.checked;
      title.style.display = visible ? "block" : "none";
      text.style.display = visible ? "block" : "none";
    });
  });
}

// ------------------------------------
// 4) Init
// ------------------------------------
async function initFood() {
  let week;

  if (shouldGenerateNewWeek()) {
    week = await generateWeek();
  } else {
    week = JSON.parse(localStorage.getItem("fbs_week"));
  }

  renderWeek(week);
}

initFood();
