// -------------------------------
// TABLEAU DE SUIVI DU POIDS ET DES MENUS
// -------------------------------

// Suivi du poids et des mensurations
const weightTrackingTable = document.getElementById("weight-tracking");
const fastingTrackingTable = document.getElementById("fasting-tracking");

const addWeightButton = document.getElementById("add-entry");
const addFastButton = document.getElementById("add-fast");

// Ajouter une entrée de poids
addWeightButton.addEventListener("click", () => {
  const date = prompt("Entrez la date (format : AAAA-MM-JJ)");
  const poids = prompt("Entrez votre poids (kg)");
  const taille = prompt("Entrez votre taille (cm)");
  const poitrine = prompt("Entrez votre taille (cm)")
  const hanches = prompt("Entrez vos hanches (cm)");
  const cuisses = prompt("Entrez votre tour de taille (cm)");
  const bras = prompt("Entrez votre taille (cm)")

  if (date && poids && taille && hanches && tailleT) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${date}</td>
      <td>${poids}</td>
      <td>${taille}</td>
      <td>${hanches}</td>
      <td>${tailleT}</td>
    `;
    weightTrackingTable.appendChild(row);
  }
});

// Ajouter un jeûne intermittent
addFastButton.addEventListener("click", () => {
  const date = prompt("Entrez la date (format : AAAA-MM-JJ)");
  const startFast = prompt("Heure de début du jeûne (HH:mm)");
  const endFast = prompt("Heure de fin du jeûne (HH:mm)");
  const note = prompt("Note (facultative)");

  if (date && startFast && endFast) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${date}</td>
      <td>${startFast}</td>
      <td>${endFast}</td>
      <td>${note || "Aucune note"}</td>
    `;
    fastingTrackingTable.appendChild(row);
  }
});
