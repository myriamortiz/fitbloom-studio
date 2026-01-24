// ----------------------------
// CONFIG
// ----------------------------
// ----------------------------
// CONFIG & DATA
// ----------------------------
const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const MEALS_URL = "data/meals.json";
const JUICE_URL = "data/jus/jus.json";

let ALL_RECIPES = []; // List of all recipes from meals.json
let JUICE_DATA = {}; // Keep juice separate for now if structure differs

// ----------------------------
// LOAD DATA
// ----------------------------
async function loadAllData() {
  try {
    // Load Meals
    const respMeals = await fetch(MEALS_URL);
    const jsonMeals = await respMeals.json();
    ALL_RECIPES = jsonMeals.recipes || [];

    // Load Juice
    const respJuice = await fetch(JUICE_URL);
    JUICE_DATA = await respJuice.json();

    return { recipes: ALL_RECIPES, juice: JUICE_DATA };
  } catch (e) {
    console.error("Error loading recipes", e);
    return { recipes: [], juice: {} };
  }
}

// ----------------------------
// SMART ENGINE 🧠
// ----------------------------
function getSmartProfile() {
  try {
    return JSON.parse(localStorage.getItem("userProfile")) || null;
  } catch (e) { return null; }
}

function getFastingConfig(profile) {
  if (!profile || !profile.fasting) return "standard"; // 4 meals
  return profile.fastingMode || "standard"; // 'skip_breakfast' | 'skip_dinner'
}

/*
  Categories mapping based on config:
  Standard: [breakfast, lunch, snack, dinner]
  Skip Breakfast: [lunch, snack, dinner]
  Skip Dinner: [breakfast, lunch, snack]
*/
function getMealSlots(profile) {
  const mode = getFastingConfig(profile);
  if (mode === 'skip_breakfast') return ['brunch', 'collation', 'diner']; // using old keys for now or new tags?
  // Let's use generic keys and map them to tags
  // Keys for UI: 'breakfast', 'lunch', 'snack', 'dinner'
  if (mode === 'skip_breakfast') return ['lunch', 'snack', 'dinner'];
  if (mode === 'skip_dinner') return ['breakfast', 'lunch', 'snack'];
  return ['breakfast', 'lunch', 'snack', 'dinner'];
}

function getTagsForSlot(slot) {
  // Map UI slot to DB tags
  // We used 'brunch' tag for breakfast/lunch in migration script
  if (slot === 'breakfast') return ['brunch'];
  if (slot === 'lunch') return ['brunch', 'lunch']; // some brunch recipes work as lunch
  if (slot === 'snack') return ['snack', 'collation'];
  if (slot === 'dinner') return ['dinner', 'diner'];
  return [];
}

// ----------------------------
// SCALING ENGINE ⚖️
// ----------------------------
function scaleString(str, factor) {
  if (factor === 1) return str;

  // Regex : cherche les nombres (entiers ou décimaux) au début ou au milieu
  // On gère : "100g", "1.5L", "2 tranches", "1/2"
  return str.replace(/(\d+[\.,]?\d*|\d+\/\d+)/g, (match) => {
    let val = 0;
    if (match.includes('/')) {
      const [n, d] = match.split('/');
      val = parseFloat(n) / parseFloat(d);
    } else {
      val = parseFloat(match.replace(',', '.'));
    }

    let newVal = val * factor;

    // Smart Rounding
    if (newVal > 10) newVal = Math.round(newVal); // 102.4 -> 102
    else if (newVal > 1) newVal = parseFloat(newVal.toFixed(1)); // 2.43 -> 2.4
    else newVal = parseFloat(newVal.toFixed(2)); // 0.333 -> 0.33

    return newVal;
  });
}

// Calculate target calories for specific slot/profile
function getTargetForSlot(slot, profile) {
  if (!profile || !profile.targetCalories) return null;

  const mode = getFastingConfig(profile);

  // Shares
  let share = 0.25;
  if (mode === 'standard') {
    if (slot === 'breakfast') share = 0.20;
    if (slot === 'lunch') share = 0.35;
    if (slot === 'snack') share = 0.10;
    if (slot === 'dinner') share = 0.35;
  } else {
    if (slot === 'lunch') share = 0.45;
    if (slot === 'snack') share = 0.15;
    if (slot === 'dinner') share = 0.40;
    if (mode === 'skip_dinner' && slot === 'breakfast') share = 0.40;
  }
  return Math.round(profile.targetCalories * share);
}

function filterRecipes(pool, profile, slot) {
  let candidates = pool;

  // Apply Intolerance Filter first
  if (profile && profile.intolerances && profile.intolerances.length > 0) {
    candidates = candidates.filter(r => {
      return profile.intolerances.every(into => r.tags.includes(into));
    });
  }

  // Apply Tag Filter
  const targetTags = getTagsForSlot(slot);
  candidates = candidates.filter(r => r.tags && targetTags.some(t => r.tags.includes(t)));

  // 3. Goal & Calorie Filtering (Elastic Match 🧘‍♂️)
  // Logic: We define a Target. We look for recipes within a WIDE range (e.g. 0.5x to 1.5x)
  // AND we verify if their type (plaisir/healthy) fits the goal.

  const target = getTargetForSlot(slot, profile);

  if (target) {
    // Elastic Tolerance: allow recipes from 50% to 150% of target
    // We will SCALE them later.
    const min = target * 0.5;
    const max = target * 1.5;

    // Filter candidates
    let matches = candidates.filter(r => {
      const c = r.calories || 0;
      return c >= min && c <= max;
    });

    // Valid candidates?
    if (matches.length === 0) {
      // Fallback: take all, we will scale hard
      matches = candidates;
    }

    // Inject Scale Factor directly into the returned object selection
    // But wait! We can't modify the GLOBAL recipe objects.
    // We must decide strictly on candidates here.
    // The cloning/scaling happens in pickRecipeForSlot.
    candidates = matches;

    // Sort by proximity to avoid extreme scaling if possible
    candidates.sort((a, b) => {
      const distA = Math.abs((a.calories || 0) - target);
      const distB = Math.abs((b.calories || 0) - target);
      return distA - distB;
    });
    // Keep top 20 to have variety
    if (candidates.length > 20) candidates = candidates.slice(0, 20);

  } else {
    // Legacy generic goals
    if (profile && profile.goal === 'perte_poids') {
      candidates = candidates.sort((a, b) => (a.calories || 0) - (b.calories || 0));
      if (candidates.length > 5) candidates = candidates.slice(0, Math.ceil(candidates.length * 0.5));
    }
    if (profile && profile.goal === 'prise_masse') {
      candidates = candidates.sort((a, b) => (b.calories || 0) - (a.calories || 0));
      if (candidates.length > 5) candidates = candidates.slice(0, Math.ceil(candidates.length * 0.5));
    }
  }

  return candidates;
}

function pickRecipeForSlot(slot, profile) {
  const candidates = filterRecipes(ALL_RECIPES, profile, slot);
  if (!candidates || candidates.length === 0) return { name: "Aucune recette trouvée", calories: 0, ingredients: [], instructions: "" };

  // Random pick
  const base = candidates[Math.floor(Math.random() * candidates.length)];

  // CLONE & SCALE
  const recipe = { ...base };
  const target = getTargetForSlot(slot, profile);

  if (target && recipe.calories > 0) {
    recipe.targetCal = target;
    recipe.scaleFactor = target / recipe.calories;
    recipe.adjustedCalories = Math.round(recipe.calories * recipe.scaleFactor);
  } else {
    recipe.scaleFactor = 1;
    recipe.adjustedCalories = recipe.calories;
  }

  return recipe;
}

// ----------------------------
// GENERATE WEEK
// ----------------------------
function pickJuice(bgData) {
  // NEW LOGIC: Flatten all seasons to offer maximum variety
  let allJuices = [];
  if (bgData.permanent) allJuices = allJuices.concat(bgData.permanent);
  if (bgData.spring) allJuices = allJuices.concat(bgData.spring);
  if (bgData.summer) allJuices = allJuices.concat(bgData.summer);
  if (bgData.autumn) allJuices = allJuices.concat(bgData.autumn);
  if (bgData.winter) allJuices = allJuices.concat(bgData.winter);

  if (allJuices.length === 0) return { name: "Jus Detox (Défaut)" };

  // Pick random
  return allJuices[Math.floor(Math.random() * allJuices.length)];
}

function generateWeek(data) {
  const week = [];
  const profile = getSmartProfile();

  const juice = pickJuice(data.juice);
  week.push({ juice });

  const slots = getMealSlots(profile);

  for (let i = 0; i < 7; i++) {
    const dayPlan = {};
    slots.forEach(slot => {
      dayPlan[slot] = pickRecipeForSlot(slot, profile);
    });
    week.push(dayPlan);
  }
  return week;
}

// ----------------------------
// LOCALSTORAGE MANIPULATION
// ----------------------------
function getMonday() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}
function mondayString(date) { return date.toISOString().split("T")[0]; }

function loadOrGenerateWeek(data) {
  const saved = localStorage.getItem("fbs-week-v2"); // New key for V2 structure
  const savedMonday = localStorage.getItem("fbs-week-date");
  const thisMonday = mondayString(getMonday());

  // Check if we need to regenerate (new monday OR profile changed recently - not handled here but could be)
  if (saved && savedMonday === thisMonday) {
    try { return JSON.parse(saved); } catch (e) { console.error(e); }
  }

  const newWeek = generateWeek(data);
  saveWeek(newWeek);
  return newWeek;
}

function saveWeek(week) {
  const thisMonday = mondayString(getMonday());
  localStorage.setItem("fbs-week-v2", JSON.stringify(week));
  localStorage.setItem("fbs-week-date", thisMonday);
}

function swapRecipe(dayIndex, slot) {
  const profile = getSmartProfile();
  const newRecipe = pickRecipeForSlot(slot, profile);
  const week = JSON.parse(localStorage.getItem("fbs-week-v2"));

  week[dayIndex + 1][slot] = newRecipe;
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
  const profile = getSmartProfile();
  const slots = getMealSlots(profile); // Ensure consistency

  // Helper labels
  const labels = {
    'breakfast': '🥞 Petit Déjeuner',
    'lunch': '🥗 Déjeuner',
    'snack': '🥜 Collation',
    'dinner': '🍲 Dîner'
  };

  const escape = (str) => {
    if (!str) return '{}';
    return JSON.stringify(str).replace(/'/g, "&apos;").replace(/"/g, "&quot;");
  }

  // JUICE
  if (week[0] && week[0].juice) {
    const j = week[0].juice;
    juiceSection.innerHTML = `
        <div class="juice-card">
        <h2>🌱 Jus bien-être de la semaine</h2>
        <p class="juice-name">${j.name || ""}</p>
        <p class="juice-cal">${j.calories || 0} kcal</p>
        <button class="see-btn" onclick='openRecipe(${escape(j)})'>Voir la recette</button>
        </div>`;
  }

  container.innerHTML = "";

  // DAYS
  week.slice(1).forEach((day, i) => {
    const block = document.createElement("div");
    block.className = "food-day";

    let html = `<h2>${DAYS[i]}</h2>`;

    slots.forEach(slot => {
      const recipe = day[slot];
      const label = labels[slot] || slot;

      if (recipe) {
        // Difficulty Icon
        let diffIcon = '';
        if (recipe.difficulty === 'facile') diffIcon = '🟢';
        if (recipe.difficulty === 'moyen') diffIcon = '🟡';
        if (recipe.difficulty === 'difficile') diffIcon = '🔴';

        // Time display
        let timeDisplay = '';
        if (recipe.prep_time) timeDisplay = `<span style="font-size:0.8em; color:#888; margin-left:5px;">⏱ ${recipe.prep_time} min</span>`;

        html += `
           <div class="meal-block">
            <div class="meal-header">
            <p class="food-meal-title">${label} ${diffIcon}</p>
            <button class="swap-btn" onclick="swapRecipe(${i}, '${slot}')" title="Changer">🔀</button>
            </div>
            <p class="food-meal-text">${recipe.name}</p>
            ${timeDisplay}
            <button class="see-btn" onclick='openRecipe(${escape(recipe)})'>Voir la recette</button>
           </div>`;
      }
    });

    block.innerHTML = html;
    container.appendChild(block);
  });
}

// ----------------------------
// HELPERS FOR RECIPE DISPLAY
// ----------------------------
function scaleString(str, factor) {
  if (!str || factor === 1) return str;

  // Regex to find numbers at the beginning of the string, possibly with units
  const match = str.match(/^(\d+(\.\d+)?)\s*([a-zA-Z%]*)\s*(.*)/);
  if (match) {
    const value = parseFloat(match[1]);
    const unit = match[3];
    const rest = match[4];

    if (!isNaN(value)) {
      const scaledValue = Math.round(value * factor * 10) / 10; // Round to one decimal place
      return `${scaledValue}${unit ? ' ' + unit : ''} ${rest}`.trim();
    }
  }
  return str; // Return original string if no number found or parsing fails
}

// ----------------------------
// POPUP RECETTE
// ----------------------------
function openRecipe(recipe) {
  if (!recipe) return;
  document.getElementById("popup-title").textContent = recipe.name;

  // Use Adjusted Calories
  const showCal = recipe.adjustedCalories || recipe.calories || 0;

  let metaHtml = `<strong>${showCal} kcal</strong>`;
  if (recipe.prep_time) metaHtml += ` • ⏱ ${recipe.prep_time} min`;
  if (recipe.difficulty) metaHtml += ` • Niveau: ${recipe.difficulty}`;

  // Show Scaling Info if exists
  const factor = recipe.scaleFactor || 1;
  if (Math.abs(factor - 1) > 0.1) {
    metaHtml += ` <br><span style="font-size:0.8em; color:var(--fbs-rose-suave)">Portion ajustée à tes besoins (x${factor.toFixed(2)})</span>`;
  }

  document.getElementById("popup-cal").innerHTML = metaHtml;

  const ul = document.getElementById("popup-ingredients");
  ul.innerHTML = (recipe.ingredients || []).map(i => {
    // Scale string
    const txt = scaleString(i, factor);
    return `<li>${txt}</li>`;
  }).join("");

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

  // Generic iteration over all keys in daily object except 'juice'
  week.slice(1).forEach(day => {
    Object.keys(day).forEach(slotKey => {
      const r = day[slotKey];
      if (r && r.ingredients) r.ingredients.forEach(pushIng);
    });
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
  const week = JSON.parse(localStorage.getItem("fbs-week-v2"));
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
