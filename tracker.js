// -------------------------------
// SAUVEGARDE ET AFFICHAGE DES MENUS
// -------------------------------

const addWeightButton = document.getElementById("add-entry");

addWeightButton.addEventListener("click", () => {
  const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  
  // Créer un objet pour chaque mois
  let monthlyData = {};
  months.forEach(month => {
    monthlyData[month] = {
      poids: document.getElementById(`poids-${month.toLowerCase()}`).value,
      taille: document.getElementById(`taille-${month.toLowerCase()}`).value,
      poitrine: document.getElementById(`poitrine-${month.toLowerCase()}`).value,
      hanches: document.getElementById(`hanches-${month.toLowerCase()}`).value,
      cuisses: document.getElementById(`cuisses-${month.toLowerCase()}`).value,
      bras: document.getElementById(`bras-${month.toLowerCase()}`).value,
    };
  });

  // Sauvegarder dans le localStorage
  localStorage.setItem("mensurations", JSON.stringify(monthlyData));

  // Afficher un message de confirmation
  alert("Mensurations enregistrées avec succès!");
});

// -------------------------------
// GESTION DES MENSURATIONS
// -------------------------------

function loadMensurations() {
  const mensurations = JSON.parse(localStorage.getItem("mensurations"));
  if (mensurations) {
    const months = ["janvier", "fevrier", "mars", "avril", "mai", "juin", "juillet", "aout", "septembre", "octobre", "novembre", "decembre"];
    months.forEach(month => {
      const data = mensurations[month.charAt(0).toUpperCase() + month.slice(1)];

      if (data) {
        document.getElementById(`poids-${month}`).value = data.poids;
        document.getElementById(`taille-${month}`).value = data.taille;
        document.getElementById(`poitrine-${month}`).value = data.poitrine;
        document.getElementById(`hanches-${month}`).value = data.hanches;
        document.getElementById(`cuisses-${month}`).value = data.cuisses;
        document.getElementById(`bras-${month}`).value = data.bras;
      }
    });
  }
}

// Charger les mensurations au chargement de la page
loadMensurations();

// -------------------------------
// GESTION DES MENSURATIONS
// -------------------------------

function loadMensurations() {
  const mensurations = JSON.parse(localStorage.getItem("mensurations"));
  if (mensurations) {
    const months = ["janvier", "fevrier", "mars", "avril", "mai", "juin", "juillet", "aout", "septembre", "octobre", "novembre", "decembre"];
    months.forEach(month => {
      const data = mensurations[month.charAt(0).toUpperCase() + month.slice(1)];

      if (data) {
        document.getElementById(`poids-${month}`).value = data.poids;
        document.getElementById(`taille-${month}`).value = data.taille;
        document.getElementById(`poitrine-${month}`).value = data.poitrine;
        document.getElementById(`hanches-${month}`).value = data.hanches;
        document.getElementById(`cuisses-${month}`).value = data.cuisses;
        document.getElementById(`bras-${month}`).value = data.bras;
      }
    });
  }
}

// Charger les mensurations au chargement de la page
loadMensurations();

    }
  });
// Bouton "Retour" pour rediriger vers la page précédente
const backButton = document.querySelector(".back-btn");

if (backButton) {
  backButton.addEventListener("click", function () {
    window.history.back(); // Cela revient à la page précédente dans l'historique
  });
}
