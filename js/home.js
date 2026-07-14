// Last updated
const lastUpdated = document.getElementById("lastUpdated");

const updated = new Date("2026-07-14");

lastUpdated.textContent = updated.toLocaleDateString("en-AU", {
  day: "numeric",
  month: "long",
  year: "numeric"
});


// Melbourne weather
async function fetchWeather() {
  const weatherValEl = document.getElementById('weatherValue');
  if (!weatherValEl) return;

  // Example coordinates for Melbourne, Australia (adjust as needed!)
  const lat = -37.8136;
  const lon = 144.9631;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const temp = Math.round(data.current_weather.temperature);
    const code = data.current_weather.weathercode;

    // Map Open-Meteo WMO codes to retro emoji/GIF representations
    let icon = "✨";
    let condition = "Vibing";

    if (code === 0) { icon = "☀️"; condition = "Sunny"; }
    else if ([1, 2, 3].includes(code)) { icon = "⛅"; condition = "Partly Cloudy"; }
    else if ([45, 48].includes(code)) { icon = "🌫️"; condition = "Foggy"; }
    else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) { icon = "🌧️"; condition = "Rainy"; }
    else if ([71, 73, 75, 77, 85, 86].includes(code)) { icon = "❄️"; condition = "Snowy"; }
    else if ([95, 96, 99].includes(code)) { icon = "⛈️"; condition = "Stormy"; }

    // Update the DOM with the retro layout
    weatherValEl.innerHTML = `
      <span style="font-size: 24px; display: block; margin-bottom: 4px;">${icon}</span>
      <span>${temp}°C &bull; ${condition}</span>
    `;
  } catch (error) {
    console.error("Weather fetch failed:", error);
    weatherValEl.textContent = "Error Loading 🖥️";
  }
}

// Run on load
fetchWeather();

// vibe check button?
const VIBE_FORTUNES = [
  "✧ coming soon ✧",
  "★ soon ★",
];

function triggerVibeCheck() {
  const vibeTextEl = document.getElementById('vibeText');
  if (!vibeTextEl) return;

  // 1. Pick a random fortune
  const randomIndex = Math.floor(Math.random() * VIBE_FORTUNES.length);
  vibeTextEl.innerHTML = `<span class="blink">${VIBE_FORTUNES[randomIndex]}</span>`;

  // 2. Burst multiple shooting stars using your existing CSS classes
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      createBurstStar();
    }, i * 150); // slight stagger for chaotic retro energy
  }
}

function createBurstStar() {
  const star = document.createElement('div');
  star.classList.add('shooting-star');
  
  // Start from random edges
  star.style.top = Math.random() * 40 + 'vh';
  star.style.left = Math.random() * 40 + 'vw';
  
  // Set custom CSS variables for the travel direction defined in your stylesheet
  const travelX = (50 + Math.random() * 50) + 'vw';
  const travelY = (50 + Math.random() * 50) + 'vh';
  star.style.setProperty('--travel-x', travelX);
  star.style.setProperty('--travel-y', travelY);
  
  document.body.appendChild(star);
  
  // Clean up element after animation completes
  setTimeout(() => {
    star.remove();
  }, 1400);
}