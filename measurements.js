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
// -------------------------------
// GESTION DU GRAPHIQUE (Chart.js)
// -------------------------------
let currentMetric = 'poids';
const METRIC_LABELS = {
  'poids': { label: 'Poids (kg)', color: '#eedbd1' },
  'taille': { label: 'Taille (cm)', color: '#d4a5a5' },
  'poitrine': { label: 'Poitrine (cm)', color: '#ffb7b2' },
  'hanches': { label: 'Hanches (cm)', color: '#ff9aa2' },
  'cuisses': { label: 'Cuisses (cm)', color: '#e2f0cb' },
  'bras': { label: 'Bras (cm)', color: '#b5ead7' }
};

function initChart(data) {
  const ctx = document.getElementById('weightChart').getContext('2d');

  // Prepare data for current metric
  const values = getValuesForMetric(data, currentMetric);

  weightChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: MONTH_LABELS,
      datasets: [{
        label: METRIC_LABELS[currentMetric].label,
        data: values,
        borderColor: METRIC_LABELS[currentMetric].color,
        backgroundColor: hexToRgba(METRIC_LABELS[currentMetric].color, 0.2),
        borderWidth: 2,
        pointBackgroundColor: METRIC_LABELS[currentMetric].color,
        pointRadius: 4,
        tension: 0.4,
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
          ticks: { color: '#d9c0b8' }
        },
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#d9c0b8' }
        }
      },
      plugins: {
        legend: {
          labels: { color: '#f2d5c8' }
        }
      }
    }
  });
}

function updateChart(data) {
  if (weightChart) {
    const values = getValuesForMetric(data, currentMetric);
    const conf = METRIC_LABELS[currentMetric];

    weightChart.data.datasets[0].data = values;
    weightChart.data.datasets[0].label = conf.label;
    weightChart.data.datasets[0].borderColor = conf.color;
    weightChart.data.datasets[0].backgroundColor = hexToRgba(conf.color, 0.2);
    weightChart.data.datasets[0].pointBackgroundColor = conf.color;

    weightChart.update();
  }
}

// Helper to get array of values
function getValuesForMetric(data, metric) {
  return MONTHS.map(m => (data[m] && data[m][metric]) ? parseFloat(data[m][metric]) : null);
}

// Helper Color
function hexToRgba(hex, alpha) {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = "0x" + hex[1] + hex[1];
    g = "0x" + hex[2] + hex[2];
    b = "0x" + hex[3] + hex[3];
  } else if (hex.length === 7) {
    r = "0x" + hex[1] + hex[2];
    g = "0x" + hex[3] + hex[4];
    b = "0x" + hex[5] + hex[6];
  }
  return "rgba(" + +r + "," + +g + "," + +b + "," + alpha + ")";
}

// Global Switcher
window.switchMetric = (metric, btn) => {
  currentMetric = metric;

  // UI Update
  document.querySelectorAll('.metric-selector .tab-pill').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // Chart Update
  const mensurations = JSON.parse(localStorage.getItem("mensurations")) || {};
  updateChart(mensurations);
};

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
