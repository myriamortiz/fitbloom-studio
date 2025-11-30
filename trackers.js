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
  const Poids = prompt("Entrez votre poids (kg)");
  const Taille = prompt("Entrez votre taille (cm)");
  const Poitrine = prompt("Entrez votre taille (cm)")
  const Hanches = prompt("Entrez vos hanches (cm)");
  const Cuisses = prompt("Entrez votre tour de taille (cm)");
  const Bras = prompt("Entrez votre taille (cm)")

  if (date && Poids && Taille && Poitrine && Hanches && Cuisses && Bras) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${date}</td>
      <td>${Poids}</td>
      <td>${Taille}</td>
      <td>${Poitrine}</td>
      <td>${Hanches}</td>
      <td>${Cuisses}</td>
      <td>${Bras}</td>
    `;
    weightTrackingTable.appendChild(row);
  }
});

<section class="intermittent-fasting-section">
  <h2>Suivi du Jeûne Intermittent (17:7)</h2>
  <p>Voici un tableau adapté à tes horaires de travail en 3x8.</p>

  <table id="fasting-table">
    <thead>
      <tr>
        <th>Jour</th>
        <th>Horaire de travail</th>
        <th>Fenêtre de repas</th>
        <th>Jeûne</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Lundi</td>
        <td>8H – 16H15</td>
        <td>12H – 19H</td>
        <td>19H – 12H</td>
      </tr>
      <tr>
        <td>Mardi</td>
        <td>6H – 14H18</td>
        <td>10H – 17H</td>
        <td>17H – 10H</td>
      </tr>
      <tr>
        <td>Mercredi</td>
        <td>16H – 00H15</td>
        <td>20H – 3H</td>
        <td>3H – 20H</td>
      </tr>
      <tr>
        <td>Jeudi</td>
        <td>14H – 22H18</td>
        <td>18H – 1H</td>
        <td>1H – 18H</td>
      </tr>
      <tr>
        <td>Vendredi</td>
        <td>00H – 8H15</td>
        <td>4H – 11H</td>
        <td>11H – 4H</td>
      </tr>
      <tr>
        <td>Samedi</td>
        <td>22H – 6H18</td>
        <td>2H – 9H</td>
        <td>9H – 2H</td>
      </tr>
      <tr>
        <td>Dimanche</td>
        <td>8H – 16H15</td>
        <td>12H – 19H</td>
        <td>19H – 12H</td>
      </tr>
    </tbody>
  </table>
</section>
