console.log("FitBloom Studio – app.js chargé ✅");

const QUOTES = [
  "Je m’accorde le droit d’être heureuse et en paix avec moi-même.",
  "Chaque petit pas est une victoire.",
  "Je suis ma propre priorité.",
  "Le bonheur est une direction, pas une destination.",
  "Je cultive la bienveillance envers moi-même.",
  "Mon corps est mon temple, je le respecte.",
  "Aujourd'hui, je choisis le calme.",
  "Je suis capable de grandes choses.",
  "La sérénité commence quand je m'accepte.",
  "Je respire la confiance, j'expire le doute.",
  "Tout ce dont j'ai besoin est déjà en moi.",
  "Je mérite amour et gentillesse.",
  "Je prends le temps de vivre l'instant présent.",
  "Mon énergie est précieuse, je la protège.",
  "Je suis la créatrice de ma propre réalité.",
  "La gratitude transforme ce que j'ai en suffisance.",
  "Je m'aime et je m'accepte tel que je suis.",
  "Chaque jour est une nouvelle chance.",
  "Je suis forte, je suis belle, je suis moi.",
  "La paix intérieure est mon plus grand trésor."
];

function loadDailyQuote() {
  const el = document.getElementById('daily-quote');
  if (!el) return;

  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const index = dayOfYear % QUOTES.length;

  el.textContent = QUOTES[index];
}

document.addEventListener("DOMContentLoaded", () => {
  loadDailyQuote();
});
// ---------------------------
// GESTION PWA (INSTALLATION)
// ---------------------------
let deferredPrompt;
const installBtn = document.getElementById('install-btn');

// 1. Détection iOS
const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator.standalone);

// 2. Écouter l'événement "beforeinstallprompt" (ANDROID / CHROME)
window.addEventListener('beforeinstallprompt', (e) => {
  // Empêcher Chrome d'afficher la barre mini-infobar tout de suite
  e.preventDefault();
  // Sauvegarder l'événement pour plus tard
  deferredPrompt = e;
  // Afficher notre bouton "Installer"
  if (installBtn) {
    installBtn.style.display = 'block';
    console.log("Bouton d'installation activé ! 📲");
  }
});

// 3. Gestion iOS (Afficher le bouton aussi, mais avec une alerte)
if (isIos && !isInStandaloneMode && installBtn) {
  installBtn.style.display = 'block';
  installBtn.textContent = "📲 Installer (iOS)";
}

// 4. Gérer le clic sur le bouton
if (installBtn) {
  installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
      // CAS ANDROID : On lance l'installation native
      deferredPrompt.prompt();
      // Attendre la réponse de l'utilisateur
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`Résultat installation : ${outcome}`);
      // On ne peut utiliser l'événement qu'une seule fois
      deferredPrompt = null;
      // Cacher le bouton
      installBtn.style.display = 'none';

    } else if (isIos) {
      // CAS IOS : On explique comment faire (Apple bloque l'automatisme)
      alert("👉 Sur iPhone : \n1. Appuyez sur le bouton 'Partager' 🛫 (carré avec flèche) en bas de l'écran.\n2. Cherchez et tapotez 'Sur l'écran d'accueil' ➕.");
    }
  });
}

// 5. Si l'app est installée, on cache le bouton
window.addEventListener('appinstalled', () => {
  console.log('FitBloom Studio a été installée ! ✨');
  if (installBtn) installBtn.style.display = 'none';
});
