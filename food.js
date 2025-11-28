/* ----------------------------------------------------
   FITBLOOM STUDIO – FOOD UNIVERSE (Weekly Generator)
---------------------------------------------------- */

/* -----------------------------
   1. FICHIERS JSON
----------------------------- */
const DATA_PATHS = {
  brunch: "data/brunch/brunch.json",
  collation: "data/collation/collation.json",
  diner: "data/diner/diner.json",
  jus: "data/jus/jus.json",
};


/* -----------------------------
   2. JOURS DE LA SEMAINE
----------------------------- */
const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];


/* -----------------------------
   3. ÉLÉMENT CONTENEUR
----------------------------- */
const weekContainer = document.getElementById("food-week");


/* -----------------------------
   4. CHARGER TOUS LES FICHIERS JSON
----------------------------- */
async function loadAllData() {
  const brunch = await fetch(DATA_PATHS.brunch).then(r => r.json());
  const collation = await fetch(DATA_PATHS.collation).then(r => r.json());
  const diner = await fetch(DATA_PATHS.diner).then(r => r.json());
  const jus = await fetch(DATA_PATHS.jus).then(r => r.json());

  return { brunch, collation, diner, jus };
}


/* -----------------------------
   5. PICK ALÉATOIRE
----------------------------- */
function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}


/* -----------------------------
   6. GÉNÉRATION D’UN MENU JOURNALIER
----------------------------- */
function generateDailyMenu(data) {
  return {
    brunch: pickRandom(data.brunch.permanent),
    collation: pickRandom(data.collation.permanent),
    diner: pickRandom(data.diner.permanent),
    jus: pickRandom(data.jus.permanent)
  };
}


/* -----------------------------
   7. GÉNÉRER UNE SEMAINE COMPLÈTE
----------------------------- */
function generateFullWeek(data) {
  const week = {};
  DAYS.forEach(day => {
    week[day] = generateDailyMenu(data);
  });
  return week;
}


/* -----------------------------
   8. ISOLER LE LUNDI COURANT
----------------------------- */
function getCurrentMonday() {
  const d = new Date();
  const day = d.getDay(); // 0 = dimanche
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0,0,0,0);
  return monday.getTime();
}


/* -----------------------------
   9. CHARGER OU CRÉER LE MENU DE LA SEMAINE
----------------------------- */
async function loadOrCreateWeek() {

  const savedWeek = localStorage.getItem("fbs_food_week");
  const savedMonday = localStorage.getItem("fbs_food_monday");

  const currentMonday = getCurrentMonday();

  // Si on a déjà une semaine ET que c'est la même → on affiche
  if (savedWeek && savedMonday && Number(savedMonday) === currentMonday) {
    return JSON.parse(savedWeek);
  }

  // Sinon → nouvelle semaine !
  const data = await loadAllData();
  const newWeek = generateFullWeek(data);

  localStorage.setItem("fbs_food_week", JSON.stringify(newWeek));
  localStorage.setItem("fbs_food_monday", currentMonday);

  return newWeek;
}


/* -----------------------------
   10. AFFICHAGE D’UN JOUR
----------------------------- */
function createDayBlock(dayName, meals) {
  const block = document.createElement("div");
  block.className = "food-day";

  block.innerHTML = `
    <h2>${dayName}</h2>

    <div class="food-meal-title">🥞 Brunch</div>
    <div class="food-meal-text">${meals.brunch.name}</div>

    <div class="food-meal-title">🥜 Collation</div>
    <div class="food-meal-text">${meals.collation.name}</div>

    <div class="food-meal-title">🍽️ Dîner</div>
    <div class="food-meal-text">${meals.diner.name}</div>

    <div class="jus-toggle">
      <label>
        <input type="checkbox" class="jus-check">
        Ajouter un jus
      </label>
      <p class="food-meal-text jus-text" style="display:none;">
        🧃 <span>${meals.jus.name}</span>
      </p>
    </div>
  `;

  // gestion case jus
  const checkbox = block.querySelector(".jus-check");
  const jusText = block.querySelector(".jus-text");

  checkbox.addEventListener("change", () => {
    jusText.style.display = checkbox.checked ? "block" : "none";
  });

  return block;
}

/* -----------------------------
   POPUP RECETTE
----------------------------- */
function openRecipeModal(recipe) {
  const modal = document.getElementById("recipe-modal");

  document.getElementById("modal-title").textContent = recipe.name;
  document.getElementById("modal-cal").textContent = recipe.calories + " kcal";

  const ingList = document.getElementById("modal-ingredients");
  ingList.innerHTML = recipe.ingredients
    .map(i => `<li>${i}</li>`).join("");

  document.getElementById("modal-instructions").textContent = recipe.instructions;

  modal.classList.remove("hidden");

  document.querySelector(".modal-close").onclick = () => {
    modal.classList.add("hidden");
  }

  modal.onclick = (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  }
}

/* -----------------------------
   11. AFFICHER TOUTE LA SEMAINE
----------------------------- */
async function displayWeek() {
  const weekData = await loadOrCreateWeek();

  weekContainer.innerHTML = "";

  DAYS.forEach(day => {
    const block = createDayBlock(day, weekData[day]);
    weekContainer.appendChild(block);
  });
}


/* -----------------------------
   12. LANCEMENT
----------------------------- */
displayWeek();
