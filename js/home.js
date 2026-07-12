// Last updated
const lastUpdated = document.getElementById("lastUpdated");

const updated = new Date("2026-07-12");

lastUpdated.textContent = updated.toLocaleDateString("en-AU", {
  day: "numeric",
  month: "long",
  year: "numeric"
});


// Melbourne weather
async function loadWeather() {
  const weather = document.getElementById("weatherValue");

  try {
    const response = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=-37.8136&longitude=144.9631&current=temperature_2m,weather_code"
    );

    const data = await response.json();

    const temp = Math.round(data.current.temperature_2m);
    const code = data.current.weather_code;

    const descriptions = {
      0: "☀️ sunny",
      1: "🌤 mostly clear",
      2: "⛅ partly cloudy",
      3: "☁️ cloudy",
      45: "🌫 foggy",
      61: "🌧 rainy",
      80: "🌦 showers"
    };

    weather.textContent =
      `${descriptions[code] || "🌡 "} · ${temp}°C`;

  } catch (error) {
    weather.textContent = "weather unavailable :(";
    console.error(error);
  }
}

loadWeather();