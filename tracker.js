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
 
// -------------------------------
// BOUTON RETOUR
// -------------------------------
const backButton = document.querySelector(".back-btn");

if (backButton) {
  backButton.addEventListener("click", () => {
    // Vérifie si l'historique du navigateur contient plusieurs pages dans la pile
    if (window.history.length > 1) {
      window.history.back();  // Cela revient à la page précédente dans l'historique
    } else {
      window.location.href = "index.html";  // Rediriger vers la page d'accueil si pas d'historique
    }
  });
}
</tbody> 
 </table> 
</section>
