// -------------------------------
// Gérer les mensurations
// -------------------------------
const addMeasurementButton = document.getElementById("add-measurement");
const measurementsTable = document.getElementById("measurements-table").getElementsByTagName('tbody')[0];

addMeasurementButton.addEventListener("click", () => {
  const date = prompt("Entrez la date (ex : 01/12/2025):");
  const weight = prompt("Entrez votre poids (en kg):");
  const waist = prompt("Entrez votre tour de taille (en cm):");
  const chest = prompt("Entrez votre tour de poitrine (en cm):");
  const hips = prompt("Entrez votre tour de hanches (en cm):");
  const arm = prompt("Entrez votre tour de bras (en cm):");
  const thigh = prompt("Entrez votre tour de cuisse (en cm):");

  // Ajout des données dans le tableau
  const row = measurementsTable.insertRow();
  row.innerHTML = `
    <td>${date}</td>
    <td>${weight}</td>
    <td>${waist}</td>
    <td>${chest}</td>
    <td>${hips}</td>
    <td>${arm}</td>
    <td>${thigh}</td>
  `;

  // Sauvegarde dans localStorage
  const measurements = JSON.parse(localStorage.getItem("measurements")) || [];
  measurements.push({ date, weight, waist, chest, hips, arm, thigh });
  localStorage.setItem("measurements", JSON.stringify(measurements));
});

// Charger les données des mensurations depuis localStorage
function loadMeasurements() {
  const measurements = JSON.parse(localStorage.getItem("measurements")) || [];
  measurements.forEach(measurement => {
    const row = measurementsTable.insertRow();
    row.innerHTML = `
      <td>${measurement.date}</td>
      <td>${measurement.weight}</td>
      <td>${measurement.waist}</td>
      <td>${measurement.chest}</td>
      <td>${measurement.hips}</td>
      <td>${measurement.arm}</td>
      <td>${measurement.thigh}</td>
    `;
  });
}
loadMeasurements();

// -------------------------------
// Gérer les moments optimisés pour manger
// -------------------------------
const addMealTimesButton = document.getElementById("add-meal-times");
const mealTimesTable = document.getElementById("meal-times-table").getElementsByTagName('tbody')[0];

addMealTimesButton.addEventListener("click", () => {
  const day = prompt("Entrez le jour de la semaine (ex : Lundi, Mardi, etc.):");
  const lunchTime = prompt("Entrez le moment optimal pour le déjeuner:");
  const dinnerTime = prompt("Entrez le moment optimal pour le dîner:");

  // Ajout des données dans le tableau
  const row = mealTimesTable.insertRow();
  row.innerHTML = `
    <td>${day}</td>
    <td>${lunchTime}</td>
    <td>${dinnerTime}</td>
  `;

  // Sauvegarde dans localStorage
  const mealTimes = JSON.parse(localStorage.getItem("mealTimes")) || [];
  mealTimes.push({ day, lunchTime, dinnerTime });
  localStorage.setItem("mealTimes", JSON.stringify(mealTimes));
});

// Charger les horaires de repas depuis localStorage
function loadMealTimes() {
  const mealTimes = JSON.parse(localStorage.getItem("mealTimes")) || [];
  mealTimes.forEach(meal => {
    const row = mealTimesTable.insertRow();
    row.innerHTML = `
      <td>${meal.day}</td>
      <td>${meal.lunchTime}</td>
      <td>${meal.dinnerTime}</td>
    `;
  });
}
loadMealTimes();
