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
   3. CONTENEUR PRINCIPAL
----------------------------- */
const weekContainer = document.getElementById("food-week");


/* -----------------------------
   4. DÉTERMINER LA SAISON ACTUELLE
----------------------------- */
function getSeason() {
  const month = new Date().getMonth() + 1;

  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}


/* -----------------------------
   5. CHARGER TOUS LES FICHIERS JSON
----------------------------- */
async function loadAllData() {
  const brunch = await fetch(DATA_PATHS.brunch).then(r => r.json());
  const collation = await fetch(DATA_PATHS.collation).then(r => r.json());
  const diner = await fetch(DATA_PATHS.diner).then(r => r.json());
  const jus = await fetch(DATA_PATHS.jus).then(r => r.json());

  return { brunch, collation, diner, jus };
}


/* -----------------------------
   6. PICK ALÉATOIRE
----------------------------- */
function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}


/* -----------------------------
   7. CHOISIR UNE RECETTE PERMANENTE 80% / SAISON 20%
----------------------------- */
function pickWeightedRecipe(data) {
  const season = getSeason();

  const permanent = data.permanent || [];
  const seasonal = data[season] || [];

  const roll = Math.random();

  // 80% permanent
  if (roll < 0.8 || seasonal.length === 0) {
    return pickRandom(permanent);
  }

  // 20% saison
  return pickRandom(seasonal);
}


/* -----------------------------
   8. GÉNÉRER LE MENU D’UN JOUR
----------------------------- */
function generateDailyMenu(data) {
  return {
    brunch: pickWeightedRecipe(data.brunch),
    collation: pickWeightedRecipe(data.collation),
    diner: pickWeightedRecipe(data.diner),
    jus: pickWeightedRecipe(data.jus)
  };
}


/* -----------------------------
   9. GÉNÉRER UNE SEMAINE COMPLÈTE
----------------------------- */
function generateFullWeek(data) {
  const week = {};
  DAYS.forEach(day => {
    week[day] = generateDailyMenu(data);
  });
  return week;
}


/* -----------------------------
   10. TROUVER LE LUNDI COURANT
----------------------------- */
function getCurrentMonday() {
  const d = new Date();
  const day = d.getDay(); // Dimanche = 0
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.getTime();
}


/* -----------------------------
   11. CHARGER OU CRÉER LE MENU HEBDO
----------------------------- */
async function loadOrCreateWeek() {
  const savedWeek = localStorage.getItem("fbs_food_week");
  const savedMonday = localStorage.getItem("fbs_food_monday");

  const currentMonday = getCurrentMonday();

  // Si la semaine existe et est la même → on la garde
  if (savedWeek && savedMonday && Number(savedMonday) === currentMonday) {
    return JSON.parse(savedWeek);
  }

  // Sinon → nouvelle semaine
  const data = await loadAllData();
  const newWeek = generateFullWeek(data);

  localStorage.setItem("fbs_food_week", JSON.stringify(newWeek));
  localStorage.setItem("fbs_food_monday", currentMonday);

  return newWeek;
}


/* -----------------------------
   12. POPUP RECETTE
----------------------------- */
function openRecipeModal(recipe) {
  const modal = document.getElementById("recipe-modal");

  document.getElementById("modal-title").textContent = recipe.name;
  document.getElementById("modal-cal").textContent = recipe.calories + " kcal";

  const ingList = document.getElementById("modal-ingredients");
  ingList.innerHTML = recipe.ingredients.map(i => `<li>${i}</li>`).join("");

  document.getElementById("modal-instructions").textContent = recipe.instructions;

  modal.classList.remove("hidden");

  document.querySelector(".modal-close").onclick = () => {
    modal.classList.add("hidden");
  };

  modal.onclick = (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  };
}


/* -----------------------------
   13. AFFICHAGE D’UN JOUR
----------------------------- */
function createDayBlock(dayName, meals) {
  const block = document.createElement("div");
  block.className = "food-day";

  const brunchBtn = `onclick='openRecipeModal(${JSON.stringify(meals.brunch)})'`;
  const collationBtn = `onclick='openRecipeModal(${JSON.stringify(meals.collation)})'`;
  const dinerBtn = `onclick='openRecipeModal(${JSON.stringify(meals.diner)})'`;
  const jusBtn = `onclick='openRecipeModal(${JSON.stringify(meals.jus)})'`;

  block.innerHTML = `
    <h2>${dayName}</h2>

    <div class="food-meal-title">🥞 Brunch</div>
    <div class="food-meal-text">${meals.brunch.name}</div>
    <button class="view-recipe" ${brunchBtn}>Voir la recette</button>

    <div class="food-meal-title">🥜 Collation</div>
    <div class="food-meal-text">${meals.collation.name}</div>
    <button class="view-recipe" ${collationBtn}>Voir la recette</button>

    <div class="food-meal-title">🍽️ Dîner</div>
    <div class="food-meal-text">${meals.diner.name}</div>
    <button class="view-recipe" ${dinerBtn}>Voir la recette</button>

    <div class="jus-toggle">
      <label>
        <input type="checkbox" class="jus-check">
        Ajouter un jus
      </label>
      <p class="food-meal-text jus-text" style="display:none;">
        🧃 <span>${meals.jus.name}</span>
      </p>
      <button class="view-recipe jus-btn" style="display:none;" ${jusBtn}>Voir la recette</button>
    </div>
  `;

  // gestion jus
  const checkbox = block.querySelector(".jus-check");
  const jusText = block.querySelector(".jus-text");
  const jusButton = block.querySelector(".jus-btn");

  checkbox.addEventListener("change", () => {
    const visible = checkbox.checked;
    jusText.style.display = visible ? "block" : "none";
    jusButton.style.display = visible ? "block" : "none";
  });

  return block;
}


/* -----------------------------
   14. AFFICHER LA SEMAINE
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
   15. LANCEMENT
----------------------------- */
displayWeek();
