// PLANNING AUTOMATIQUE OPTION B 💖

// Séances selon jour de la semaine
const sessions = {
  1: { name: "🍑 Booty + Cuisses", duration: "30–40 min" },
  2: { name: "💪 Full Body", duration: "25–35 min" },
  3: { name: "🩰 Danse – Jour off", duration: "1h–1h30" },
  4: { name: "🔥 Abdos + Gainage", duration: "20–30 min" },
  5: { name: "⚡ Full Body rapide", duration: "20–25 min" },
  6: { name: "🐶 Balade – Récup active", duration: "30–60 min" },
  7: { name: "🌿 Balade + Chill", duration: "Libre" },
};

// Affichage séance du jour
const today = new Date().getDay(); // 0 = Dimanche → on adapte ensuite
const index = today === 0 ? 7 : today;

document.getElementById("today-session-name").textContent = sessions[index].name;
document.getElementById("today-session-duration").textContent = sessions[index].duration;

// Affichage hebdo des bulles
Object.keys(sessions).forEach((day) => {
  const bubble = document.getElementById(`day-${day}`);
  if (!bubble) return;

  bubble.innerHTML = `
    <strong>${bubble.textContent}</strong>
    <span>${sessions[day].name}</span>
  `;
});
