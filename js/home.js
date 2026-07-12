// Last updated
const lastUpdated = document.getElementById("lastUpdated");

const updated = new Date("2026-07-12");

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