// -------------------------------
// SAUVEGARDE ET AFFICHAGE DES MENUS
// -------------------------------

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const MONTH_LABELS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
const FIELDS = ["poids", "taille", "poitrine", "hanches", "cuisses", "bras"];

const addWeightButton = document.getElementById("add-entry");
let weightChart = null; // Variable globale pour le graphique

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

  // Mettre à jour le graphique
  updateChart(monthlyData);

  // Afficher un message de confirmation
  alert("Mensurations enregistrées avec succès ! ✨");
});

// CHARGEMENT
function loadMensurations() {
  const mensurations = JSON.parse(localStorage.getItem("mensurations")) || {};

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

  // Initialiser le graphique avec les données chargées
  initChart(mensurations);
}

// -------------------------------
// GESTION DU GRAPHIQUE (Chart.js)
// -------------------------------
function initChart(data) {
  const ctx = document.getElementById('weightChart').getContext('2d');

  // Extraire les poids
  const weights = MONTHS.map(m => (data[m] && data[m].poids) ? parseFloat(data[m].poids) : null);

  weightChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: MONTH_LABELS,
      datasets: [{
        label: 'Mon Poids (kg)',
        data: weights,
        borderColor: '#eedbd1', // --fbs-rose-clair
        backgroundColor: 'rgba(238, 219, 209, 0.2)',
        borderWidth: 2,
        pointBackgroundColor: '#f2d5c8', // --fbs-rose-pale
        pointRadius: 4,
        tension: 0.4, // Courbe lisse
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: false,
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          ticks: { color: '#d9c0b8' } // --fbs-taupe-rose
        },
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#d9c0b8' }
        }
      },
      plugins: {
        legend: {
          labels: { color: '#f2d5c8' } // --fbs-rose-pale
        }
      }
    }
  });
}

function updateChart(data) {
  if (weightChart) {
    // Mettre à jour les données
    const weights = MONTHS.map(m => (data[m] && data[m].poids) ? parseFloat(data[m].poids) : null);
    weightChart.data.datasets[0].data = weights;
    weightChart.update();
  }
}

// Charger les mensurations au chargement de la page
loadMensurations();

// BOUTON RETOUR
const backButton = document.querySelector(".back-btn");
if (backButton) {
  backButton.addEventListener("click", function (e) {
    if (backButton.tagName === "BUTTON") {
      e.preventDefault();
      window.history.back();
    }
  });
}
