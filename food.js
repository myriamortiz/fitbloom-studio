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

// Variable globale
let ALL_DATA = {};

// ----------------------------
// LOAD ALL JSON FILES
// ----------------------------
async function loadAllData() {
  const data = {};
  try {
    for (let cat of [...CATEGORIES, "jus"]) {
      const response = await fetch(DATA_PATHS[cat]);
      data[cat] = await response.json();
    }
    ALL_DATA = data;
    return data;
  } catch (e) {
    console.error("Error loading data", e);
    return {};
  }
}

// ----------------------------
// SMART PICK ENGINE 🧠
// ----------------------------
function getSmartProfile() {
  try {
    const raw = localStorage.getItem("userProfile");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function filterByProfile(recipes, profile) {
  if (!profile || !profile.intolerances || profile.intolerances.length === 0) {
    return recipes;
  }
  return recipes.filter(r => {
    if (!r.tags) return false;
    return profile.intolerances.every(into => r.tags.includes(into));
  });
}

function pickRecipe(list) {
  if (!list) return { name: "Erreur", calories: 0, ingredients: [], instructions: "" };

  const profile = getSmartProfile();
  const seasons = ["spring", "summer", "autumn", "winter"];
  const season = seasons[Math.floor(Math.random() * seasons.length)];

  let poolPermanent = list.permanent || [];
  let poolSeason = list[season] || [];

  if (profile) {
    poolPermanent = filterByProfile(poolPermanent, profile);
    poolSeason = filterByProfile(poolSeason, profile);
  }

  // Filtrage par Objectif
  if (profile && profile.goal) {
    const filterByGoal = (recipes) => {
      let maxCaloriesPerMeal = 600;
      if (profile.targetCalories) {
        maxCaloriesPerMeal = Math.round(profile.targetCalories / 3.2);
      } else if (profile.goal === 'perte_poids') {
        maxCaloriesPerMeal = 500;
      }

      if (profile.goal === 'perte_poids') {
        const fitsInBudget = recipes.filter(r => r.calories <= maxCaloriesPerMeal);
        return fitsInBudget.length > 0 ? fitsInBudget : recipes.filter(r => r.calories <= maxCaloriesPerMeal + 100);
      }
      if (profile.goal === 'prise_masse') {
        const dense = recipes.filter(r => r.calories > 350);
        return dense.length > 0 ? dense : recipes;
      }
      return recipes;
    };
    poolPermanent = filterByGoal(poolPermanent);
    poolSeason = filterByGoal(poolSeason);
  }

  const roll = Math.random();
  if (roll <= 0.8 && poolPermanent.length > 0) {
    return poolPermanent[Math.floor(Math.random() * poolPermanent.length)];
  } else if (poolSeason.length > 0) {
    return poolSeason[Math.floor(Math.random() * poolSeason.length)];
  } else {
    return (list.permanent && list.permanent[0]) ? list.permanent[0] : { name: "Non trouvé" };
  }
}

// ----------------------------
// GENERATE WEEK
// ----------------------------
function generateWeek(data) {
  const week = [];
  const juice = pickRecipe(data.jus);
  week.push({ juice });

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
// LOCALSTORAGE
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
  if (!data.brunch) return []; // Data not loaded

  const saved = localStorage.getItem("fbs-week");
  const savedMonday = localStorage.getItem("fbs-week-date");
  const thisMonday = mondayString(getMonday());

  if (saved && savedMonday === thisMonday) {
    try {
      return JSON.parse(saved);
    } catch (e) { console.error(e); }
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

function swapRecipe(dayIndex, category) {
  const newRecipe = pickRecipe(ALL_DATA[category]);
  const week = JSON.parse(localStorage.getItem("fbs-week"));
  week[dayIndex + 1][category] = newRecipe;
  saveWeek(week);
  displayWeek(week);
}

// ----------------------------
// DISPLAY WEEK
// ----------------------------
function displayWeek(week) {
  if (!week || week.length === 0) return;

  const juiceSection = document.getElementById("weekly-juice");
  const container = document.getElementById("food-week");

  // SAFETY ESCAPE
  const escape = (str) => {
    if (!str) return '{}';
    return JSON.stringify(str).replace(/'/g, "&apos;");
  }

  const juice = week[0].juice;
  juiceSection.innerHTML = `
    <div class="juice-card">
      <h2>🌱 Jus bien-être de la semaine</h2>
      <p class="juice-name">${juice.name || "Jus mystère"}</p>
      <p class="juice-cal">${juice.calories || 0} kcal</p>
      <button class="see-btn" onclick='openRecipe(${escape(juice)})'>Voir la recette</button>
    </div>
  `;

  container.innerHTML = "";

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
        <button class="see-btn" onclick='openRecipe(${escape(day.brunch)})'>Voir la recette</button>
      </div>

      <div class="meal-block">
        <div class="meal-header">
          <p class="food-meal-title">🥜 Collation</p>
          <button class="swap-btn" onclick="swapRecipe(${i}, 'collation')" title="Changer de recette">🔀</button>
        </div>
        <p class="food-meal-text">${day.collation.name}</p>
        <button class="see-btn" onclick='openRecipe(${escape(day.collation)})'>Voir la recette</button>
      </div>
      
      <div class="meal-block">
        <div class="meal-header">
           <p class="food-meal-title">🥗 Dîner</p>
           <button class="swap-btn" onclick="swapRecipe(${i}, 'diner')" title="Changer de recette">🔀</button>
        </div>
        <p class="food-meal-text">${day.diner.name}</p>
        <button class="see-btn" onclick='openRecipe(${escape(day.diner)})'>Voir la recette</button>
      </div>
    `;

    container.appendChild(block);
  });
}

// ----------------------------
// POPUP RECETTE
// ----------------------------
function openRecipe(recipe) {
  if (!recipe) return;
  document.getElementById("popup-title").textContent = recipe.name;
  document.getElementById("popup-cal").textContent = (recipe.calories || 0) + " kcal";

  const ul = document.getElementById("popup-ingredients");
  ul.innerHTML = (recipe.ingredients || []).map(i => `<li>${i}</li>`).join("");

  document.getElementById("popup-instructions").textContent = recipe.instructions || "Pas d'instructions.";

  // V3 FEATURES (Favorites)
  const modalContent = document.querySelector("#recipe-popup .popup-content");

  const favs = JSON.parse(localStorage.getItem('fbs_favorites')) || [];
  const isFav = favs.includes(recipe.name);

  let heartBtn = document.getElementById('fav-heart');
  if (!heartBtn) {
    heartBtn = document.createElement('button');
    heartBtn.id = 'fav-heart';
    heartBtn.style.position = 'absolute';
    heartBtn.style.top = '1rem';
    heartBtn.style.right = '3rem';
    modalContent.appendChild(heartBtn);
  }
  heartBtn.className = isFav ? 'fav-btn active' : 'fav-btn';
  heartBtn.innerHTML = '❤';
  heartBtn.onclick = () => toggleFavorite(recipe.name);



  document.getElementById("recipe-popup").style.display = "flex";
}

document.getElementById("close-recipe").addEventListener("click", () => {
  document.getElementById("recipe-popup").style.display = "none";
});

// FAVORITE LOGIC
function toggleFavorite(recipeName) {
  let favs = JSON.parse(localStorage.getItem('fbs_favorites')) || [];
  if (favs.includes(recipeName)) {
    favs = favs.filter(n => n !== recipeName);
    document.getElementById('fav-heart').classList.remove('active');
  } else {
    favs.push(recipeName);
    document.getElementById('fav-heart').classList.add('active');
  }
  localStorage.setItem('fbs_favorites', JSON.stringify(favs));
}



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

  if (!week) return {};
  if (week[0] && week[0].juice) week[0].juice.ingredients.forEach(pushIng);
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
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "grocery-check";
    const label = document.createElement("span");
    label.textContent = `${item} : ${list[item].join(" + ")}`;

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

document.getElementById("open-grocery").addEventListener("click", () => {
  const week = JSON.parse(localStorage.getItem("fbs-week"));
  const list = buildGroceryList(week);
  const extras = JSON.parse(localStorage.getItem('grocery_ext')) || [];
  if (extras.length > 0) {
    list["Ajouts Manuels"] = extras;
  }
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

  const profile = getSmartProfile();
  if (profile && profile.name) {
    const title = document.querySelector('.sub-title');
    if (title) {
      title.innerHTML = `FitBloom <span style="font-size:0.6em; display:block; color:var(--fbs-rose-suave)">Bonjour ${profile.name} !</span>`;
    }
  }
  if (profile && profile.targetCalories) {
    const calDiv = document.getElementById('calorie-target-display');
    if (calDiv) {
      calDiv.innerHTML = `🎯 Objectif : <strong>${profile.targetCalories} kcal</strong> / jour`;
    }
  }
})();
