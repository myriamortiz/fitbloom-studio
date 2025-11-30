// -------------------------------
// GESTION DES PARAMÈTRES
// -------------------------------

// Sauvegarde des paramètres du profil
document.getElementById("save-profile").addEventListener("click", () => {
  const userName = document.getElementById("user-name").value;
  const avatar = document.getElementById("avatar-upload").files[0];
  if (userName) {
    localStorage.setItem("user-name", userName);
  }

  if (avatar) {
    const reader = new FileReader();
    reader.onloadend = function() {
      localStorage.setItem("user-avatar", reader.result);
    };
    reader.readAsDataURL(avatar);
  }

  alert("Profil mis à jour !");
});

// Paramètres des notifications
const trainingNotifications = document.getElementById("training-notifications");
const mealNotifications = document.getElementById("meal-notifications");
const healthNotifications = document.getElementById("health-notifications");

trainingNotifications.addEventListener("change", () => {
  localStorage.setItem("training-notifications", trainingNotifications.checked);
});
mealNotifications.addEventListener("change", () => {
  localStorage.setItem("meal-notifications", mealNotifications.checked);
});
healthNotifications.addEventListener("change", () => {
  localStorage.setItem("health-notifications", healthNotifications.checked);
});

// Paramètres d'accessibilité
const darkMode = document.getElementById("dark-mode");
const fontSize = document.getElementById("font-size");

// Appliquer le mode sombre si activé
darkMode.addEventListener("change", () => {
  if (darkMode.checked) {
    document.body.classList.add("dark-mode");
    localStorage.setItem("dark-mode", "enabled");
  } else {
    document.body.classList.remove("dark-mode");
    localStorage.setItem("dark-mode", "disabled");
  }
});

// Ajuster la taille du texte
fontSize.addEventListener("input", () => {
  document.body.style.fontSize = `${fontSize.value}px`;
  localStorage.setItem("font-size", fontSize.value);
});

// Récupérer les paramètres enregistrés au démarrage
function loadSettings() {
  // Profil
  const userName = localStorage.getItem("user-name");
  const avatar = localStorage.getItem("user-avatar");

  if (userName) {
    document.getElementById("user-name").value = userName;
  }
  if (avatar) {
    const img = new Image();
    img.src = avatar;
    document.getElementById("avatar-upload").style.backgroundImage = `url(${img.src})`;
  }

  // Notifications
  trainingNotifications.checked = localStorage.getItem("training-notifications") === "true";
  mealNotifications.checked = localStorage.getItem("meal-notifications") === "true";
  healthNotifications.checked = localStorage.getItem("health-notifications") === "true";

  // Accessibilité
  if (localStorage.getItem("dark-mode") === "enabled") {
    darkMode.checked = true;
    document.body.classList.add("dark-mode");
  } else {
    darkMode.checked = false;
    document.body.classList.remove("dark-mode");
  }

  const savedFontSize = localStorage.getItem("font-size");
  if (savedFontSize) {
    fontSize.value = savedFontSize;
    document.body.style.fontSize = `${savedFontSize}px`;
  }
}

// Charger les paramètres au démarrage
loadSettings();

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
