// ----------------------------
// CONFIG
// ----------------------------
const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const CATEGORIES = ["brunch", "collation", "diner"];
const DATA_PATHS = {
  brunch: "data/brunch/brunch.json",
  collation: "data/collation/collation.json",
  diner: "data/diner/diner.json",
  jus: "data/jus/jus.json",
};

// Variable globale pour stocker les données brutes
let ALL_DATA = {};

// ----------------------------
// LOAD ALL JSON FILES
// ----------------------------
async function loadAllData() {
  const data = {};

  for (let cat of [...CATEGORIES, "jus"]) {
    const response = await fetch(DATA_PATHS[cat]);
    data[cat] = await response.json();
  }

  ALL_DATA = data;
  return data;
}

// ----------------------------
// PICK (80% permanent / 20% saison)
// ----------------------------
function pickRecipe(list) {
  const roll = Math.random();

  if (roll <= 0.8) {
    return list.permanent[Math.floor(Math.random() * list.permanent.length)];
  } else {
    const seasons = ["spring", "summer", "autumn", "winter"];
    const season = seasons[Math.floor(Math.random() * seasons.length)];
    const arr = list[season];
    return arr[Math.floor(Math.random() * arr.length)];
  }
}

// ----------------------------
// GENERATE WEEK (with weekly juice)
// ----------------------------
function generateWeek(data) {
  const week = [];

  // Jus de la semaine
  const juice = pickRecipe(data.jus);
  week.push({ juice });

  // 7 jours
  for (let i = 0; i < 7; i++) {
    week.push({
      brunch: pickRecipe(data.brunch),
      collation: pickRecipe(data.collation),
      diner: pickRecipe(data.diner),
    });
  }

  return week;
}

// ----------------------------
// LOCALSTORAGE (weekly persistence)
// ----------------------------
function getMonday() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function mondayString(date) {
  return date.toISOString().split("T")[0];
}

function loadOrGenerateWeek(data) {
  const saved = localStorage.getItem("fbs-week");
  const savedMonday = localStorage.getItem("fbs-week-date");
  const thisMonday = mondayString(getMonday());

  if (saved && savedMonday === thisMonday) {
    return JSON.parse(saved);
  }

  const newWeek = generateWeek(data);
  saveWeek(newWeek);
  return newWeek;
}

function saveWeek(week) {
  const thisMonday = mondayString(getMonday());
  localStorage.setItem("fbs-week", JSON.stringify(week));
  localStorage.setItem("fbs-week-date", thisMonday);
}

// ----------------------------
// SWAP RECIPE
// ----------------------------
function swapRecipe(dayIndex, category) {
  // dayIndex : 0 à 6
  // category : 'brunch', 'collation', 'diner'

  // 1. Piocher une nouvelle recette
  const newRecipe = pickRecipe(ALL_DATA[category]);

  // 2. Mettre à jour la semaine
  const week = JSON.parse(localStorage.getItem("fbs-week"));

  // Note: week[0] est le jus, donc les jours sont à partir de l'index 1
  // Le jour 0 (Lundi) est à l'index 1 du tableau week
  week[dayIndex + 1][category] = newRecipe;

  // 3. Sauvegarder
  saveWeek(week);

  // 4. Rafraîchir l'affichage
  displayWeek(week);
}


// ----------------------------
// DISPLAY WEEK + JUICE
// ----------------------------
function displayWeek(week) {
  const juiceSection = document.getElementById("weekly-juice");
  const container = document.getElementById("food-week");

  const juice = week[0].juice;

  // JUS PREMIUM
  juiceSection.innerHTML = `
    <div class="juice-card">
      <h2>🌱 Jus bien-être de la semaine</h2>
      <p class="juice-name">${juice.name}</p>
      <p class="juice-cal">${juice.calories} kcal</p>
      <button class="see-btn" onclick='openRecipe(${JSON.stringify(juice)})'>Voir la recette</button>
    </div>
  `;

  container.innerHTML = "";

  // JOURS
  week.slice(1).forEach((day, i) => {
    const block = document.createElement("div");
    block.className = "food-day";

    block.innerHTML = `
      <h2>${DAYS[i]}</h2>

      <div class="meal-block">
        <div class="meal-header">
          <p class="food-meal-title">🥞 Brunch</p>
          <button class="swap-btn" onclick="swapRecipe(${i}, 'brunch')" title="Changer de recette">🔀</button>
        </div>
        <p class="food-meal-text">${day.brunch.name}</p>
        <button class="see-btn" onclick='openRecipe(${JSON.stringify(day.brunch)})'>Voir la recette</button>
      </div>

      <div class="meal-block">
        <div class="meal-header">
          <p class="food-meal-title">🥜 Collation</p>
          <button class="swap-btn" onclick="swapRecipe(${i}, 'collation')" title="Changer de recette">🔀</button>
        </div>
        <p class="food-meal-text">${day.collation.name}</p>
        <button class="see-btn" onclick='openRecipe(${JSON.stringify(day.collation)})'>Voir la recette</button>
      </div>

      <div class="meal-block">
        <div class="meal-header">
          <p class="food-meal-title">🍽️ Dîner</p>
          <button class="swap-btn" onclick="swapRecipe(${i}, 'diner')" title="Changer de recette">🔀</button>
        </div>
        <p class="food-meal-text">${day.diner.name}</p>
        <button class="see-btn" onclick='openRecipe(${JSON.stringify(day.diner)})'>Voir la recette</button>
      </div>
    `;

    container.appendChild(block);
  });
}

// ----------------------------
// POPUP RECETTE
// ----------------------------
function openRecipe(recipe) {
  document.getElementById("popup-title").textContent = recipe.name;
  document.getElementById("popup-cal").textContent = recipe.calories + " kcal";

  const ul = document.getElementById("popup-ingredients");
  ul.innerHTML = recipe.ingredients.map(i => `<li>${i}</li>`).join("");

  document.getElementById("popup-instructions").textContent = recipe.instructions;

  document.getElementById("recipe-popup").style.display = "flex";
}

document.getElementById("close-recipe").addEventListener("click", () => {
  document.getElementById("recipe-popup").style.display = "none";
});

// ----------------------------
// LISTE DE COURSES
// ----------------------------
function buildGroceryList(week) {
  let ingredients = {};

  const pushIng = (raw) => {
    if (!raw.includes(":")) return;
    const [name, qty] = raw.split(":");
    const cleanName = name.trim();
    const cleanQty = qty.trim();
    if (!ingredients[cleanName]) ingredients[cleanName] = [];
    ingredients[cleanName].push(cleanQty);
  };

  // juice
  week[0].juice.ingredients.forEach(pushIng);

  // meals
  week.slice(1).forEach(day => {
    CATEGORIES.forEach(cat => day[cat].ingredients.forEach(pushIng));
  });

  return ingredients;
}

function renderGroceryPopup(list) {
  const ul = document.getElementById("grocery-list");
  ul.innerHTML = "";
  Object.keys(list).forEach(item => {
    const li = document.createElement("li");
    li.className = "grocery-item";

    // Création de la checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "grocery-check";

    // Création du label
    const label = document.createElement("span");
    label.textContent = `${item} : ${list[item].join(" + ")}`;

    // Event listener pour barrer le texte
    checkbox.addEventListener("change", function () {
      if (this.checked) {
        label.style.textDecoration = "line-through";
        label.style.opacity = "0.5";
      } else {
        label.style.textDecoration = "none";
        label.style.opacity = "1";
      }
    });

    li.appendChild(checkbox);
    li.appendChild(label);
    ul.appendChild(li);
  });
}

// popup events
document.getElementById("open-grocery").addEventListener("click", () => {
  const week = JSON.parse(localStorage.getItem("fbs-week"));
  const list = buildGroceryList(week);
  renderGroceryPopup(list);
  document.getElementById("grocery-popup").style.display = "flex";
});

document.getElementById("close-grocery").addEventListener("click", () => {
  document.getElementById("grocery-popup").style.display = "none";
});

// ----------------------------
// INIT
// ----------------------------
(async function init() {
  const data = await loadAllData();
  const week = loadOrGenerateWeek(data);
  displayWeek(week);
})();
