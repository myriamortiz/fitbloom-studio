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
  // Strict separation V3 (User Request)
  if (slot === 'breakfast') return ['petit-dej'];
  if (slot === 'lunch') return ['lunch', 'dejeuner']; // Removed 'brunch'
  if (slot === 'snack') return ['snack', 'collation'];
  if (slot === 'dinner') return ['dinner', 'diner']; // Keeping 'dinner' as it is the main tag in JSON
  return [];
}

// ----------------------------
// SCALING ENGINE ⚖️
// ----------------------------
function scaleString(str, factor) {
  if (factor === 1) return str;

  // Regex : cherche les fractions d'abord, puis les nombres
  return str.replace(/(\d+\/\d+|\d+[\.,]?\d*)\s*([a-zA-Z]+)?/g, (match, qtyStr, unit) => {
    let val = 0;
    if (qtyStr.includes('/')) {
      const [n, d] = qtyStr.split('/');
      val = parseFloat(n) / parseFloat(d);
    } else {
      val = parseFloat(qtyStr.replace(',', '.'));
    }

    let newVal = val * factor;

    // --- SMARTER ROUNDING LOGIC (V6) ---
    const wholeStringLower = str.toLowerCase();

    // CATEGORIES
    const integerKeywords = ['oeuf', 'pain', 'tranche', 'toast', 'wrap', 'tortilla', 'muffin', 'cookie', 'gaufre', 'crepe', 'pancake', 'biscuit'];
    const halfStepKeywords = ['avocat', 'banane', 'pomme', 'poire', 'peche', 'orange', 'clementine'];

    const isInteger = integerKeywords.some(k => wholeStringLower.includes(k));
    const isHalfStep = halfStepKeywords.some(k => wholeStringLower.includes(k));

    // Determine effective unit
    let effectiveUnit = unit ? unit.toLowerCase() : '';

    // 1. STRICT INTEGERS (Eggs, Bread slices...)
    if (isInteger) {
      return `${Math.round(newVal)} ${unit || ''}`.trim();
    }

    // 2. HALF STEPS (Avocado, Fruits...) -> 0.5, 1, 1.5...
    if (isHalfStep) {
      let rounded = Math.round(newVal * 2) / 2;
      if (rounded === 0) rounded = 0.5; // Avoid 0 for things like avocado
      return `${rounded} ${unit || ''}`.trim();
    }

    // 3. STANDARD UNITS (g, ml, c.à.s)
    if (unit) {
      if (effectiveUnit === 'g' || effectiveUnit === 'ml') {
        if (newVal >= 100) {
          return `${Math.round(newVal / 5) * 5} ${unit}`;
        } else if (newVal > 10) {
          return `${Math.round(newVal)} ${unit}`;
        } else {
          const fixed = newVal.toFixed(1);
          const finalVal = fixed.endsWith('.0') ? parseInt(fixed) : parseFloat(fixed);
          return `${finalVal} ${unit}`;
        }
      }
      // Other units
      else {
        const nearestInt = Math.round(newVal);
        if (Math.abs(newVal - nearestInt) < 0.2) {
          return `${nearestInt} ${unit}`;
        } else if (newVal > 10) {
          return `${Math.round(newVal)} ${unit}`;
        } else {
          const fixed = newVal.toFixed(1);
          const finalVal = fixed.endsWith('.0') ? parseInt(fixed) : parseFloat(fixed);
          return `${finalVal} ${unit}`;
        }
      }
    } else {
      // 4. UNITLESS GENERIC
      if (newVal >= 100) return Math.round(newVal / 5) * 5;

      const nearestInt = Math.round(newVal);
      if (Math.abs(newVal - nearestInt) < 0.2) return nearestInt;

      if (newVal > 10) return Math.round(newVal);

      const fixed = newVal.toFixed(1);
      return fixed.endsWith('.0') ? parseInt(fixed) : parseFloat(fixed);
    }
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
  // Security: Ensure target is never negative or dangerously low
  const minTarget = (slot === 'snack') ? 100 : 300;
  return Math.round(Math.max(profile.targetCalories * share, minTarget));
}

function filterRecipes(pool, profile, slot) {
  let candidates = pool;

  // Apply Intolerance Filter first
  if (profile && profile.intolerances && profile.intolerances.length > 0) {
    candidates = candidates.filter(r => {
      return profile.intolerances.every(into => r.tags.includes(into));
    });
  }

  // SAFETY BLACKLIST (V9.12 Fix) - Bloque strictement les plats salés lourds le matin
  if (slot === 'breakfast') {
    const BLACKLIST = ['boeuf', 'poisson', 'steak', 'saumon', 'thon', 'cabillaud', 'navet', 'chou', 'haricot', 'brocoli', 'poulet', 'dinde', 'porc', 'agneau', 'sardine', 'maquereau', 'crevette', 'burger', 'pizza', 'tacos', 'curry', 'okonomiyaki'];
    candidates = candidates.filter(r => {
      const n = r.name.toLowerCase();
      // Exception: "Bacon" is allowed even if it triggers "dinde" or "porc"
      if (n.includes('bacon')) return true;

      return !BLACKLIST.some(bad => n.includes(bad));
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
    // Support singular 'goal' for backward compatibility or plural 'goals'
    const goals = profile.goals || (profile.goal ? [profile.goal] : []);

    if (goals.includes('perte_poids')) {
      candidates = candidates.sort((a, b) => (a.calories || 0) - (b.calories || 0));
      if (candidates.length > 5) candidates = candidates.slice(0, Math.ceil(candidates.length * 0.5));
    }
    // If 'prise_masse' is selected AND NOT 'perte_poids' (conflict resolution: weight loss wins for calorie restriction)
    else if (goals.includes('prise_masse')) {
      candidates = candidates.sort((a, b) => (b.calories || 0) - (a.calories || 0));
      if (candidates.length > 5) candidates = candidates.slice(0, Math.ceil(candidates.length * 0.5));
    }
  }

  return candidates;
}

function pickRecipeForSlot(slot, profile, usedNames = new Set()) {
  let candidates = filterRecipes(ALL_RECIPES, profile, slot);

  // Filter out used recipes
  const freshCandidates = candidates.filter(r => !usedNames.has(r.name));

  // If we have enough fresh candidates, use them. Otherwise fallback to all candidates to avoid empty slots.
  if (freshCandidates.length > 0) {
    candidates = freshCandidates;
  }

  if (!candidates || candidates.length === 0) return { name: "Aucune recette trouvée", calories: 0, ingredients: [], instructions: "" };

  // Random pick
  const base = candidates[Math.floor(Math.random() * candidates.length)];

  // Add to used list
  if (base.name) usedNames.add(base.name);

  // CLONE & SCALE
  const recipe = { ...base };
  const target = getTargetForSlot(slot, profile);

  if (target && recipe.calories > 0 && target > 0) {
    recipe.targetCal = target;
    recipe.scaleFactor = Math.max(target / recipe.calories, 0.1); // Avoid 0 or negative scale
    recipe.adjustedCalories = Math.round(recipe.calories * recipe.scaleFactor);
  } else {
    recipe.scaleFactor = 1;
    recipe.adjustedCalories = recipe.calories;
  }

  // IMAGE ENGINE (V4)
  recipe.image = getRecipeImage(recipe);

  return recipe;
}

// MOTEUR VISUEL : Assigne une image magnifique selon le contexte
function getRecipeImage(recipe) {
  const name = recipe.name.toLowerCase();
  const tags = (recipe.tags || []).join(' ').toLowerCase();

  if (name.includes('jus') || name.includes('smoothie') || name.includes('dr')) return "assets/food/aesthetic_green_juice_1769281546709.png";
  if (name.includes('porridge') || name.includes('oat') || name.includes('bowl') && tags.includes('petit-dej')) return "assets/food/breakfast_oatmeal_1769281517208.png";
  if (name.includes('bowl') || tags.includes('bowl') || name.includes('salade')) return "assets/food/healthy_buddha_bowl_1769281530331.png";
  if (name.includes('balls') || name.includes('barre') || tags.includes('snack') || tags.includes('collation')) return "assets/food/snack_energy_balls_1769281587972.png";

  // Default Main Dish
  return "assets/food/dinner_healthy_chicken_1769281569061.png";
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
  const usedNames = new Set(); // Track used recipes for this week

  const juice = pickJuice(data.juice);
  week.push({ juice });

  const slots = getMealSlots(profile);

  for (let i = 0; i < 7; i++) {
    const dayPlan = {};
    slots.forEach(slot => {
      dayPlan[slot] = pickRecipeForSlot(slot, profile, usedNames);
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
  const week = JSON.parse(localStorage.getItem("fbs-week-v2"));

  // Build set of currently used recipes to avoid picking them again
  const usedNames = new Set();

  // We can scan the whole week to be strict, or just try to avoid the *current* one.
  // Let's scan the whole week for better UX.
  if (week) {
    week.slice(1).forEach(day => {
      Object.values(day).forEach(r => {
        if (r && r.name) usedNames.add(r.name);
      });
    });
  }

  // Remove the current one from set so we don't block swapping BACK to it if it was the only option (edge case),
  // but actually we want to CHANGE, so keeping it in usedNames ensures we get something else.

  const newRecipe = pickRecipeForSlot(slot, profile, usedNames);

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
            
            <div class="food-card-content" style="text-align:center; padding:5px 10px;">
              <!-- IMAGE REMOVED -->
              <div>
                 <p class="food-meal-text" style="font-weight:600; font-size:1.1em; margin-bottom:2px;">${recipe.name}</p>
                 <p style="font-size:0.9em; color:#bbb; margin:0;">${recipe.adjustedCalories || recipe.calories} kcal</p>
                 ${timeDisplay}
              </div>
            </div>
            
            <button class="see-btn" onclick='openRecipe(${escape(recipe)})'>Voir la recette</button>
           </div>`;
      }
    });

    block.innerHTML = html;
    container.appendChild(block);
  });
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

// ----------------------------
// FAVORITE LOGIC
// ----------------------------
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

// SHOW FAVORITES
document.getElementById("open-favorites").addEventListener("click", () => {
  const container = document.getElementById("favorites-list");
  container.innerHTML = "";

  const favs = JSON.parse(localStorage.getItem('fbs_favorites')) || [];

  if (favs.length === 0) {
    container.innerHTML = "<p style='text-align:center; opacity:0.6'>Aucune recette favorite pour le moment.</p>";
  } else {
    // Find recipe objects
    // Note: This relies on ALL_RECIPES being populated.
    const found = ALL_RECIPES.filter(r => favs.includes(r.name));

    found.forEach(r => {
      const div = document.createElement("div");
      div.className = "meal-block";
      div.style.marginBottom = "0";
      div.innerHTML = `
          <div class="food-card-content" style="text-align:left; display:flex; align-items:center; gap:10px;">
             <div style="flex:1">
               <p class="food-meal-text" style="font-weight:600;">${r.name}</p>
               <p style="font-size:0.8em; color:#bbb">${r.calories} kcal</p>
             </div>
             <button class="see-btn" style="margin:0; padding:5px 10px; font-size:0.8em">Voir</button>
             <button class="delete-habit-btn" style="font-size:1.2em; color:var(--fbs-rose-suave)">✖</button>
          </div>
      `;

      // Click Handlers
      div.querySelector(".see-btn").onclick = () => openRecipe(r);
      div.querySelector(".delete-habit-btn").onclick = () => {
        toggleFavorite(r.name);
        div.remove();
        // If empty
        if (document.getElementById("favorites-list").children.length === 0) {
          document.getElementById("favorites-list").innerHTML = "<p style='text-align:center; opacity:0.6'>Aucune recette favorite pour le moment.</p>";
        }
      };

      container.appendChild(div);
    });
  }

  document.getElementById("favorites-popup").style.display = "flex";
});

document.getElementById("close-favorites").addEventListener("click", () => {
  document.getElementById("favorites-popup").style.display = "none";
});
// ----------------------------
// GROCERY ENGINE 🛒
// ----------------------------

const AISLES = {
  "Fruits & Légumes": ["pomme", "poire", "banane", "citron", "avocat", "tomate", "concombre", "carotte", "chou", "épinard", "mangue", "figue", "raisin", "maïs", "ciboulette", "persil", "basilic", "menthe", "ail", "oignon", "patate douce", "poivron", "champignon", "fruits"],
  "Boucherie & Poisson": ["saumon", "thon", "dinde", "bacon", "poulet", "crevette", "oeuf", "œuf"],
  "Frais & Crémerie": ["lait", "crème", "beurre", "yaourt", "fromage", "chèvre", "feta", "skyr", "tofu", "faux-mage", "guacamole", "houmous"],
  "Épicerie Salée": ["riz", "pâte", "quinoa", "sarrasin", "pain", "bagel", "wrap", "tortilla", "huile", "vinaigre", "soja", "chia", "not", "amande", "noix", "noisette", "cajou", "graine", "lentille", "pois chiche", "haricot", "farine"],
  "Épicerie Sucrée & Matin": ["flocon", "avoine", "muesli", "granola", "miel", "sirop", "sucre", "chocolat", "cacao", "vanille", "compote", "brioche", "biscuit", "cookie"],
  "Surgelés": ["glace", "fruit rouge"],
  "Divers": []
};

function getAisle(ingredientName) {
  const lower = ingredientName.toLowerCase();
  for (const [aisle, keywords] of Object.entries(AISLES)) {
    if (keywords.some(k => lower.includes(k))) return aisle;
  }
  return "Divers";
}

function parseQuantity(qtyStr) {
  // Extract number and unit
  // "200g" -> {val: 200, unit: "g"}
  // "2" -> {val: 2, unit: ""}
  // "1/2" -> {val: 0.5, unit: ""}

  if (!qtyStr) return { val: 1, unit: "" };

  const clean = qtyStr.trim().replace(',', '.');

  // Try fraction
  if (clean.includes('/')) {
    const [n, d] = clean.split('/');
    const val = parseFloat(n) / parseFloat(d);
    // remove numbers to find unit
    const unit = clean.replace(/[0-9\/.]/g, '').trim();
    return { val, unit };
  }

  const val = parseFloat(clean);
  if (isNaN(val)) return { val: 1, unit: clean }; // Fallback if no number found

  const unit = clean.replace(/[0-9.]/g, '').trim();
  return { val, unit };
}

// Normalizes units (e.g. "tr" -> "tranches", "cas" -> "c.à.s")
function normalizeUnit(unit) {
  let u = unit.toLowerCase().trim();

  if (u === "tr" || u.startsWith("tranche")) return "tranches";
  if (u === "cas" || u === "càs" || u.includes("soupe") || u === "c.à.s") return "c.à.s";
  if (u === "cac" || u === "càc" || u.includes("café") || u === "c.à.c") return "c.à.c";
  if (u === "pincée" || u === "pincee") return "pincée";
  if (u === "g" || u === "gr" || u === "gramme" || u === "grammes") return "g";
  if (u === "ml" || u === "milli") return "ml";

  return u;
}

function normalizeIngredient(name) {
  let n = name.toLowerCase().trim();

  // 1. Remove parsing artifacts / useless qualifiers
  n = n.replace(/^[\d\s\/\.,]+(g|ml|cl|kg|l)?\s*/, "");

  // Remove cooking states / shapes
  const badWords = ["cuit", "cru", "frais", "grillé", "rôti", "vapeur", "ciselé", "émincé", "haché", "brouillés", "dur", "en dés", "en tranches", "tranche de", "tranches de", "feuilles de", "feuille de", "poudre", "déshydraté", "nouvelle", "chaud", "froid", "risotto", "soufflé", "concassée", "concassées", "râpée", "râpé"];
  badWords.forEach(w => {
    n = n.replace(new RegExp(`\\b${w}\\b`, 'g'), "").trim();
  });

  // Fix common chars
  n = n.replace(/œ/g, "oe");
  n = n.replace(/\./g, ""); // "c.à.s" -> "cas"
  n = n.replace(/’/g, "'");

  // 2. Specific Mappings (Canonicals) - Priority Rules
  if (n.includes("oeuf") || n.includes("œuf")) return "Oeufs";
  if (n.includes("avocat")) return "Avocat";
  if (n.includes("banane")) return "Banane";
  if (n.includes("patate douce")) return "Patate douce";
  if (n.includes("pomme de terre") || n === "pdt") return "Pommes de terre";
  if (n.includes("pomme") && !n.includes("terre") && !n.includes("compote")) return "Pommes"; // Fruit
  if (n.includes("poire") && !n.includes("poireau")) return "Poires";
  if (n.includes("abricot")) return "Abricots";
  if (n.includes("ananas")) return "Ananas";
  if (n.includes("figue")) return "Figues";
  if (n.includes("fraise")) return "Fraises";
  if (n.includes("framboise")) return "Framboises";
  if (n.includes("mangue")) return "Mangue";
  if (n.includes("melon")) return "Melon";
  if (n.includes("myrtille")) return "Myrtilles";
  if (n.includes("nectarine")) return "Nectarine";
  if (n.includes("pêche")) return "Pêche";
  if (n.includes("pruneau")) return "Pruneaux";
  if (n.includes("raisin") && !n.includes("sec")) return "Raisins";
  if (n.includes("raisin") && n.includes("sec")) return "Raisins secs";

  // Seeds / Nuts
  if (n.includes("chia")) return "Graines de Chia";
  if (n.includes("courge") && n.includes("graine")) return "Graines de courge";
  if (n.includes("sésame") || n.includes("sesame")) return "Sésame";
  if (n.includes("amande") && !n.includes("lait") && !n.includes("beurre") && !n.includes("farine") && !n.includes("poudre")) return "Amandes";
  if (n.includes("beurre") && (n.includes("amande") || n.includes("cacahuète") || n.includes("noix"))) return "Beurre d'oléagineux";
  if (n.includes("noix") && n.includes("cajou")) return "Noix de cajou";
  if (n.includes("noix") && !n.includes("beurre") && !n.includes("cajou") && !n.includes("coco")) return "Noix";
  if (n.includes("noisette")) return "Noisettes";
  if (n.includes("pistache")) return "Pistaches";

  // Grains / Carbs
  if (n.includes("riz") && !n.includes("farine") && !n.includes("nouille") && !n.includes("galette") && !n.includes("vinaigre")) return "Riz";
  if (n.includes("nouille") && n.includes("riz")) return "Nouilles de riz";
  if (n.includes("quinoa")) return "Quinoa";
  if (n.includes("sarrasin") && !n.includes("farine") && !n.includes("galette") && !n.includes("flocon")) return "Sarrasin (grains)";
  if (n.includes("boulgour") || n.includes("bulgur")) return "Boulgour";

  // Doughs vs Pasta (Corrected)
  // "Pâte GF" often used for pizza base => Map to Pâte Brisée as requested
  if (n === "pâte gf" || n === "pate gf" || (n.includes("pâte") && (n.includes("pizza") || n.includes("tarte") || n.includes("brisée")))) return "Pâte Brisée";
  if (n.includes("pâte") && !n.includes("patate") && !n.includes("curry") && !n.includes("tartiner")) return "Pâtes"; // Pasta

  // Flours & Milks
  if (n.includes("farine") && n.includes("sarrasin")) return "Farine de sarrasin";
  if (n.includes("farine") && n.includes("riz")) return "Farine de riz";
  if (n.includes("farine") && n.includes("avoine")) return "Farine d'avoine";

  if (n.includes("lait") && n.includes("coco")) return "Lait de coco";
  if (n.includes("lait") && n.includes("amande")) return "Lait d'amande";
  if (n.includes("lait") && n.includes("soja")) return "Lait de soja";
  if (n.includes("lait") && n.includes("avoine")) return "Lait d'avoine";
  if (n.includes("crème") && n.includes("coco") || n.includes("creme") && n.includes("coco")) return "Crème coco";
  if (n.includes("crème") && n.includes("soja")) return "Crème soja";

  // Breads
  if (n.includes("pain") && (n.includes("gf") || n.includes("gluten") || n.includes("complet"))) return "Pain sans gluten/complet";
  if (n.includes("bagel")) return "Bagel";
  if (n.includes("wrap") || n.includes("tortilla")) return "Wraps/Tortillas";
  if (n.includes("muffin anglais")) return "Muffin anglais";
  if (n.includes("brioche")) return "Brioche";
  if (n.includes("galette") && n.includes("sarrasin")) return "Galette sarrasin";

  // Proteins
  if (n.includes("poulet")) return "Poulet";
  if (n.includes("dinde") && !n.includes("jambon") && !n.includes("bacon") && !n.includes("steak")) return "Dinde";
  if (n.includes("steak") && n.includes("dinde")) return "Steak de dinde";
  if (n.includes("bacon")) return "Bacon";
  if (n.includes("jambon")) return "Jambon";
  if (n.includes("boeuf") || n.includes("bœuf")) return "Boeuf";
  if (n.includes("saumon") && n.includes("fumé")) return "Saumon fumé";
  if (n.includes("saumon") && !n.includes("fumé")) return "Saumon";
  if (n.includes("thon")) return "Thon";
  if (n.includes("cabillaud")) return "Cabillaud";
  if (n.includes("crevette")) return "Crevettes";
  if (n.includes("sardine")) return "Sardines";

  // Veg/Vegan Proteins
  if (n.includes("tofu")) return "Tofu";
  if (n.includes("pois chiche")) return "Pois Chiches";
  if (n.includes("lentille")) return "Lentilles";
  if (n.includes("haricot") && n.includes("rouge")) return "Haricots rouges";

  // Veggies
  if (n.includes("tomate") && n.includes("cerise")) return "Tomates cerises";
  if (n.startsWith("tomate")) return "Tomates";
  if (n.includes("concombre")) return "Concombre";
  if (n.includes("courgette")) return "Courgettes";
  if (n.includes("carotte")) return "Carottes";
  if (n.includes("poivron")) return "Poivrons";
  if (n.includes("champignon")) return "Champignons";
  if (n.includes("épinard") || n.includes("epinard")) return "Épinards";
  if (n.includes("oignon") && n.includes("rouge")) return "Oignon rouge";
  if (n.startsWith("oignon")) return "Oignons";
  if (n.includes("ail")) return "Ail";
  if (n.includes("échalote")) return "Echalote";
  if (n.includes("chou") && n.includes("fleur")) return "Chou-fleur";
  if (n.includes("chou") && !n.includes("fleur")) return "Chou";
  if (n.includes("brocoli")) return "Brocoli";
  if (n.includes("asperge")) return "Asperges";
  if (n.includes("aubergine")) return "Aubergine";
  if (n.includes("poireau")) return "Poireaux";
  if (n.includes("radis")) return "Radis";
  if (n.includes("courge") || n.includes("potimarron") || n.includes("potiron")) return "Courge/Potimarron";

  // Dairy / Fresh
  if (n.includes("yaourt") && n.includes("coco")) return "Yaourt Coco";
  if (n.includes("yaourt") && n.includes("soja")) return "Yaourt Soja";
  if (n.includes("yaourt") && (n.includes("grec") || n.includes("grecque"))) return "Yaourt Grec";
  if (n.includes("fromage blanc")) return "Fromage blanc";
  if (n.includes("mozza")) return "Mozzarella";
  if (n.includes("feta")) return "Feta";
  if (n.includes("chèvre")) return "Fromage de Chèvre";
  if (n.includes("parmesan")) return "Parmesan";
  if (n.includes("emmental") || n.includes("gruyère") || n.includes("comté")) return "Fromage râpé";
  if (n.includes("beurre") && !n.includes("cacahuète") && !n.includes("amande")) return "Beurre";
  if (n.includes("faux-mage")) return "Faux-mage";

  // Others
  if (n.includes("chocolat") && (n.includes("noir") || n.includes("85"))) return "Chocolat Noir 85%";
  if (n.includes("sirop") && n.includes("agave")) return "Sirop d'agave";
  if (n.includes("sirop") && (n.includes("érable") || n.includes("erable"))) return "Sirop d'érable";
  if (n.includes("miel")) return "Miel";
  if (n.includes("huile") && n.includes("olive")) return "Huile d'olive";
  if (n.includes("sauce soja") || n.includes("tamari")) return "Sauce Soja/Tamari";
  if (n.includes("vinaigre")) return "Vinaigre";
  if (n.includes("épices") || n.includes("curry") || n.includes("paprika") || n.includes("cannelle") || n.includes("muscade") || n.includes("cumin") || n.includes("herbes") || n.includes("coriandre") || n.includes("persil") || n.includes("basilic") || n.includes("menthe") || n.includes("origan") || n.includes("thym") || n.includes("romarin") || n.includes("ciboulette")) return "Épices & Herbes";

  // 3. Generic Pluralization (if not caught above)
  if (n.endsWith("s") && !n.endsWith("ss") && !n.endsWith("is") && !n.endsWith("us") && !n.endsWith("os")) n = n.slice(0, -1);

  // Capitalize
  return n.charAt(0).toUpperCase() + n.slice(1);
}

function buildGroceryList(week) {
  let rawList = {}; // name -> { unit -> totalVal }

  const pushIng = (rawLine) => {
    if (!rawLine.includes(":")) return;
    const [name, qtyRaw] = rawLine.split(":");

    // Normalize Name
    const finalName = normalizeIngredient(name);

    let { val, unit } = parseQuantity(qtyRaw);
    unit = normalizeUnit(unit);

    if (!rawList[finalName]) rawList[finalName] = {};
    if (!rawList[finalName][unit]) rawList[finalName][unit] = 0;

    rawList[finalName][unit] += val;
  };

  if (!week) return {};
  if (week[0] && week[0].juice) (week[0].juice.ingredients || []).forEach(pushIng);

  week.slice(1).forEach(day => {
    Object.keys(day).forEach(slotKey => {
      const r = day[slotKey];
      if (r && r.ingredients) r.ingredients.forEach(pushIng);
    });
  });

  // Format final list with categorization
  let categorized = {};

  // Add extras
  const extras = JSON.parse(localStorage.getItem('grocery_ext')) || [];
  extras.forEach(ext => {
    if (!categorized["Divers"]) categorized["Divers"] = [];
    categorized["Divers"].push({ str: ext, checked: false });
  });

  Object.keys(rawList).forEach(name => {
    const versions = rawList[name];
    const aisle = getAisle(name);
    if (!categorized[aisle]) categorized[aisle] = [];

    // Combine versions
    const parts = [];
    Object.keys(versions).forEach(unit => {
      let val = versions[unit];
      val = Math.round(val * 100) / 100;
      // If unit is empty, just number
      parts.push(unit ? `${val} ${unit}` : `${val}`);
    });

    const displayStr = parts.join(" + ");
    categorized[aisle].push({ name, displayStr, full: `${name} : ${displayStr}`, checked: false });
  });

  return categorized;
}

function renderGroceryPopup(categorizedList) {
  const container = document.getElementById("grocery-list");
  container.innerHTML = "";

  // Order of aisles
  const orderedKeys = Object.keys(AISLES); // Priority order defined in obj

  orderedKeys.forEach(aisle => {
    if (!categorizedList[aisle] || categorizedList[aisle].length === 0) return;

    // Header
    const h3 = document.createElement('h3');
    h3.textContent = aisle;
    h3.className = 'grocery-aisle-header';
    container.appendChild(h3);

    // Items
    categorizedList[aisle].forEach(item => {
      const li = document.createElement("li");
      li.className = "grocery-item";
      li.style.listStyle = "none";
      li.style.textAlign = "left";
      li.style.display = "flex";
      li.style.alignItems = "center";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "grocery-check";
      checkbox.style.marginRight = "10px";

      const label = document.createElement("span");
      label.textContent = item.full || item.str;
      label.style.color = "var(--fbs-rose-clair)";

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
      container.appendChild(li);
    });
  });

  // Handle remaining "Divers" or extras if they were not in ordered keys (though Divers is in keys)
}

document.getElementById("open-grocery").addEventListener("click", () => {
  const week = JSON.parse(localStorage.getItem("fbs-week-v2"));
  const catList = buildGroceryList(week);
  renderGroceryPopup(catList);
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
