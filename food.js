// ----------------------------
// CONFIG
// ----------------------------
const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const CATEGORIES = ["brunch", "collation", "diner"];
const DATA_PATHS = {
  brunch: "data/brunch/brunch.json",
  collation: "data/collation/collation.json",
  diner: "data/diner/diner.json",
};

// ----------------------------
// LOAD ALL JSON FILES
// ----------------------------
async function loadAllData() {
  const data = {};

  for (let cat of CATEGORIES) {
    const response = await fetch(DATA_PATHS[cat]);
    data[cat] = await response.json();
  }

  return data;
}


// ----------------------------
// RANDOM PICK (80% permanent / 20% saison)
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
// GENERATE WEEK MENU
// ----------------------------
function generateWeek(data) {
  const week = [];

  for (let i = 0; i < 7; i++) {
    const day = {
      brunch: pickRecipe(data.brunch),
      collation: pickRecipe(data.collation),
      diner: pickRecipe(data.diner),
    };
    week.push(day);
  }

  return week;
}


// ----------------------------
// SAVE / LOAD
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
  localStorage.setItem("fbs-week", JSON.stringify(newWeek));
  localStorage.setItem("fbs-week-date", thisMonday);

  return newWeek;
}


// ----------------------------
// DISPLAY WEEK
// ----------------------------
function displayWeek(week) {
  const container = document.getElementById("food-week");
  container.innerHTML = "";

  week.forEach((day, i) => {
    const block = document.createElement("div");
    block.className = "food-day";

    block.innerHTML = `
      <h2>${DAYS[i]}</h2>

      <div class="meal-block" data-cat="brunch" data-day="${i}">
        <p class="food-meal-title">🥞 Brunch</p>
        <p class="food-meal-text clickable">${day.brunch.name}</p>
      </div>

      <div class="meal-block" data-cat="collation" data-day="${i}">
        <p class="food-meal-title">🥜 Collation</p>
        <p class="food-meal-text clickable">${day.collation.name}</p>
      </div>

      <div class="meal-block" data-cat="diner" data-day="${i}">
        <p class="food-meal-title">🍽️ Dîner</p>
        <p class="food-meal-text clickable">${day.diner.name}</p>
      </div>
    `;

    container.appendChild(block);
  });

  activatePopups(week);
}


// ----------------------------
// POPUP RECETTE
// ----------------------------
function activatePopups(week) {
  const items = document.querySelectorAll(".clickable");

  items.forEach(item => {
    item.addEventListener("click", () => {
      const parent = item.parentElement;
      const category = parent.dataset.cat;
      const dayIndex = parent.dataset.day;
      const recipe = week[dayIndex][category];

      openRecipePopup(recipe);
    });
  });
}

function openRecipePopup(recipe) {
  const popup = document.getElementById("recipe-popup");
  const title = document.getElementById("popup-title");
  const calories = document.getElementById("popup-cal");
  const ingredients = document.getElementById("popup-ingredients");
  const instructions = document.getElementById("popup-instructions");

  title.textContent = recipe.name;
  calories.textContent = `${recipe.calories} kcal`;

  ingredients.innerHTML = recipe.ingredients.map(i => `<li>${i}</li>`).join("");
  instructions.textContent = recipe.instructions;

  popup.style.display = "flex";
}

document.getElementById("close-recipe").addEventListener("click", () => {
  document.getElementById("recipe-popup").style.display = "none";
});


// ----------------------------
// GROCERY LIST
// ----------------------------
function buildGroceryList(week) {
  let ingredients = {};

  const pushIng = (raw) => {
    if (!raw.includes(":")) return;
    const [name, qty] = raw.split(":");
    const cleanName = name.trim();
    const cleanQty = qty.trim();

    if (!ingredients[cleanName]) {
      ingredients[cleanName] = [];
    }
    ingredients[cleanName].push(cleanQty);
  };

  week.forEach(day => {
    CATEGORIES.forEach(cat => {
      day[cat].ingredients.forEach(pushIng);
    });
  });

  return ingredients;
}

function renderGroceryPopup(list) {
  const ul = document.getElementById("grocery-list");
  ul.innerHTML = "";

  Object.keys(list).forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item} : ${list[item].join(" + ")}`;
    ul.appendChild(li);
  });
}

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
