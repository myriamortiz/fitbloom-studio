// -------------------------------
// FitBloom Studio – Food Universe
// -------------------------------

// Fichier JSON à charger selon l'onglet actif
const DATA_PATHS = {
  brunch: "data/brunch/brunch.json",
  collation: "data/collation/collation.json",
  diner: "data/diner/diner.json",
  jus: "data/jus/jus.json",
};

// Sélecteurs
const recipesContainer = document.getElementById("recipes-container");
const tabButtons = document.querySelectorAll(".tab-btn");

// -------------------------------
// CHARGEMENT DU BON FICHIER JSON
// -------------------------------
async function loadRecipes(category) {
  recipesContainer.innerHTML = `<p class="loading">Chargement...</p>`;

  try {
    const response = await fetch(DATA_PATHS[category]);
    if (!response.ok) throw new Error("Erreur lors du chargement du fichier JSON");

    const data = await response.json();
    displayRecipes(data);
  } catch (error) {
    recipesContainer.innerHTML = `
      <p class="error">Impossible de charger les recettes 😢</p>
    `;
    console.error(error);
  }
}

// -------------------------------
// AFFICHAGE DES RECETTES
// -------------------------------
function displayRecipes(data) {
  recipesContainer.innerHTML = "";

  const sections = ["permanent", "spring", "summer", "autumn", "winter"];

  sections.forEach(season => {
    if (data[season] && data[season].length > 0) {
      const seasonBlock = document.createElement("div");
      seasonBlock.className = "season-block";

      seasonBlock.innerHTML = `
        <h2 class="season-title">${season.toUpperCase()}</h2>
      `;

      data[season].forEach(recipe => {
        const card = createRecipeCard(recipe);
        seasonBlock.appendChild(card);
      });

      recipesContainer.appendChild(seasonBlock);
    }
  });
}

// -------------------------------
// TEMPLATE CARTE RECETTE
// -------------------------------
function createRecipeCard(recipe) {
  const card = document.createElement("div");
  card.className = "recipe-card";

  card.innerHTML = `
    <h3>${recipe.name}</h3>
    <p class="cal">${recipe.calories} kcal</p>

    <details>
      <summary>Ingrédients</summary>
      <ul>
        ${recipe.ingredients.map(i => `<li>${i}</li>`).join("")}
      </ul>
    </details>

    <details>
      <summary>Instructions</summary>
      <p>${recipe.instructions}</p>
    </details>
  `;

  return card;
}

// -------------------------------
// ONGLET ACTIF
// -------------------------------
tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    tabButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const category = btn.dataset.target;
    loadRecipes(category);
  });
});

// -------------------------------
// CHARGEMENT PAR DÉFAUT
// -------------------------------
loadRecipes("brunch");
