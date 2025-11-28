// --------------------------
// FitBloom Studio – Food Planner
// --------------------------

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

const PATHS = {
  brunch: "data/brunch/brunch.json",
  collation: "data/collation/collation.json",
  diner: "data/diner/diner.json",
  jus: "data/jus/jus.json",
};

const container = document.getElementById("week-container");

init();

async function init() {
  const saved = JSON.parse(localStorage.getItem("weeklyMenu"));

  const currentWeek = getWeekNumber();

  if (!saved || saved.week !== currentWeek) {
    const menu = await generateMenu();
    localStorage.setItem("weeklyMenu", JSON.stringify(menu));
    displayWeek(menu);
  } else {
    displayWeek(saved);
  }
}

// --------------------------
// GET WEEK NUMBER
// --------------------------
function getWeekNumber() {
  const now = new Date();
  const onejan = new Date(now.getFullYear(), 0, 1);
  return Math.ceil(((now - onejan) / 86400000 + onejan.getDay() + 1) / 7);
}

// --------------------------
// GENERATE NEW WEEK MENU
// --------------------------
async function generateMenu() {
  const [brunch, collation, diner, jus] = await Promise.all([
    fetch(PATHS.brunch).then(r => r.json()),
    fetch(PATHS.collation).then(r => r.json()),
    fetch(PATHS.diner).then(r => r.json()),
    fetch(PATHS.jus).then(r => r.json())
  ]);

  return {
    week: getWeekNumber(),
    brunch: pick7(brunch),
    collation: pick7(collation),
    diner: pick7(diner),
    jus: pick7(jus)
  };
}

function pick7(data) {
  const all = [
    ...data.permanent,
    ...(data.spring || []),
    ...(data.summer || []),
    ...(data.autumn || []),
    ...(data.winter || [])
  ];

  all.sort(() => Math.random() - 0.5);
  return all.slice(0, 7);
}

// --------------------------
// DISPLAY THE WEEK
// --------------------------
function displayWeek(menu) {
  container.innerHTML = "";

  DAYS.forEach((day, i) => {
    const card = document.createElement("div");
    card.className = "day-card";

    card.innerHTML = `
      <div class="day-title">${day}</div>

      <div class="meal-block">
        <h3>🥞 Brunch</h3>
        <p>${menu.brunch[i].name}</p>
      </div>

      <div class="meal-block">
        <h3>🍓 Collation</h3>
        <p>${menu.collation[i].name}</p>
      </div>

      <div class="meal-block">
        <h3>🍽️ Dîner</h3>
        <p>${menu.diner[i].name}</p>
      </div>

      <div class="meal-block">
        <h3>🧃 Jus (optionnel)</h3>

        <div class="jus-toggle">
          <input type="checkbox" id="jus-${i}">
          <label for="jus-${i}">Afficher un jus</label>
        </div>

        <p class="jus-text" id="jus-text-${i}" style="display:none;">
          ${menu.jus[i].name}
        </p>
      </div>
    `;

    container.appendChild(card);

    // Toggle jus
    const checkbox = card.querySelector(`#jus-${i}`);
    const jusText = card.querySelector(`#jus-text-${i}`);

    checkbox.addEventListener("change", () => {
      jusText.style.display = checkbox.checked ? "block" : "none";
    });
  });
}
