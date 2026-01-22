// -------------------------------
// SAUVEGARDE ET AFFICHAGE DES MENUS
// -------------------------------

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const FIELDS = ["poids", "taille", "poitrine", "hanches", "cuisses", "bras"];

const addWeightButton = document.getElementById("add-entry");

// SAUVEGARDE
addWeightButton.addEventListener("click", () => {
  let monthlyData = {};

  MONTHS.forEach(month => {
    monthlyData[month] = {};
    FIELDS.forEach(field => {
      const element = document.getElementById(`${field}-${month}`);
      if (element) {
        monthlyData[month][field] = element.value;
      }
    });
  });

  // Sauvegarder dans le localStorage
  localStorage.setItem("mensurations", JSON.stringify(monthlyData));

  // Afficher un message de confirmation
  alert("Mensurations enregistrées avec succès ! ✨");
});

// CHARGEMENT
function loadMensurations() {
  const mensurations = JSON.parse(localStorage.getItem("mensurations"));

  if (mensurations) {
    MONTHS.forEach(month => {
      const data = mensurations[month];
      if (data) {
        FIELDS.forEach(field => {
          const element = document.getElementById(`${field}-${month}`);
          if (element) {
            element.value = data[field] || "";
          }
        });
      }
    });
  }
}

// Charger les mensurations au chargement de la page
loadMensurations();

// BOUTON RETOUR
const backButton = document.querySelector(".back-btn");
if (backButton) {
  backButton.addEventListener("click", function (e) {
    // Si c'est un lien <a>, le comportement par défaut suffit.
    // Si c'est un <button>, on peut utiliser history.back()
    if (backButton.tagName === "BUTTON") {
      e.preventDefault();
      window.history.back();
    }
  });
}
