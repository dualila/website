const lastUpdated = document.getElementById("lastUpdated");

// Fetch the latest commit from the GitHub repository
fetch("https://api.github.com/repos/dualila/website/commits/main")
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    // Extract the date string from the latest commit
    const commitDateString = data.commit.committer.date; 
    const updated = new Date(commitDateString);

    const formattedDate = updated.toLocaleDateString("en-AU", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    const formattedTime = updated.toLocaleTimeString("en-AU", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    }).toLowerCase(); //

    // Update the DOM with a line break between date and time
    lastUpdated.innerHTML = `${formattedDate}<br>${formattedTime}`;
  })
  .catch(error => {
    console.error("Failed to fetch last updated date:", error);
    lastUpdated.textContent = "Unavailable";
  });

// ── Melbourne weather · 
const WMO = {
  0:  ["☀️", "clear sky"],
  1:  ["🌤️", "mainly clear"],
  2:  ["⛅", "partly cloudy"],
  3:  ["☁️", "overcast"],
  45: ["🌫️", "fog"],
  48: ["🌫️", "depositing fog"],
  51: ["🌦️", "light drizzle"],
  53: ["🌦️", "moderate drizzle"],
  55: ["🌧️", "dense drizzle"],
  56: ["🌧️", "light freezing drizzle"],
  57: ["🌧️", "dense freezing drizzle"],
  61: ["🌦️", "slight rain"],
  63: ["🌧️", "moderate rain"],
  65: ["🌧️", "heavy rain"],
  66: ["🌧️", "light freezing rain"],
  67: ["🌧️", "heavy freezing rain"],
  71: ["🌨️", "slight snowfall"],
  73: ["🌨️", "moderate snowfall"],
  75: ["❄️", "heavy snowfall"],
  77: ["❄️", "snow grains"],
  80: ["🌦️", "slight rain showers"],
  81: ["🌧️", "moderate rain showers"],
  82: ["⛈️", "violent rain showers"],
  85: ["🌨️", "slight snow showers"],
  86: ["❄️", "heavy snow showers"],
  95: ["⛈️", "thunderstorm"],
  96: ["⛈️", "thunderstorm with slight hail"],
  99: ["⛈️", "thunderstorm with heavy hail"],
};

// turn a compass bearing into a proper 16-point direction, for no reason
function windDir(deg) {
  const dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE",
                "S","SSW","SW","WSW","W","WNW","NW","NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

async function fetchWeather() {
  const weatherValEl = document.getElementById('weatherValue');
  if (!weatherValEl) return;

  const lat = -37.8136;
  const lon = 144.9631;
  // ask for the works: temp, apparent temp, humidity, wind, gusts, precip, etc.
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,` +
    `wind_speed_10m,wind_direction_10m,wind_gusts_10m,precipitation,cloud_cover,` +
    `surface_pressure,is_day` +
    `&timezone=Australia%2FMelbourne`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const c = data.current || {};

    const temp    = Math.round(c.temperature_2m);
    const feels   = Math.round(c.apparent_temperature);
    const code    = c.weather_code;
    const humidity = Math.round(c.relative_humidity_2m);
    const wind    = Math.round(c.wind_speed_10m);
    const gust    = Math.round(c.wind_gusts_10m);
    const dir     = windDir(c.wind_direction_10m);
    const precip  = c.precipitation;
    const cloud   = Math.round(c.cloud_cover);
    const pressure = Math.round(c.surface_pressure);

    // look up the exact description + icon
    let [icon, condition] = WMO[code] || ["✨", "vibing"];

    // after dark, a clear sky isn't "clear" — it's just dark, obviously
    const hr = new Date().getHours();
    const isNight = (window.TIME_OF_DAY &&
        (window.TIME_OF_DAY.period === "night" || window.TIME_OF_DAY.period === "latenight"))
      || (c.is_day === 0)
      || hr >= 21 || hr < 5;
    if (isNight) {
      if (code === 0) { icon = "🌙"; condition = "dark. obviously"; }
      else if ([1, 2].includes(code)) { icon = "🌙"; condition = "dark, mostly clear"; }
      else if (code === 3) { icon = "🌙"; condition = "dark & overcast"; }
      else if ([45, 48].includes(code)) { icon = "🌫️"; condition = "dark & foggy"; }
      // precipitation keeps its exact description — weather doesn't care about the sun
    }

    // "feels like" only worth showing if it actually differs
    const feelsLine = (feels !== temp) ? `feels like ${feels}°` : `feels about right`;

    weatherValEl.innerHTML = `
      <span style="font-size: 24px; display: block; margin-bottom: 4px;">${icon}</span>
      <span>${temp}°C &bull; ${condition}</span>
      <span style="display:block; font-size:11px; color:#c8ffd8; margin-top:6px; line-height:1.6;">
        ${feelsLine}<br>
        💧 ${humidity}% humidity<br>
        🌬️ ${wind} km/h ${dir}${gust > wind + 5 ? ` (gusts ${gust})` : ""}<br>
        ☁️ ${cloud}% cloud${precip > 0 ? ` &bull; ${precip} mm` : ""}<br>
        <span style="opacity:.7;">📊 ${pressure} hPa · for no reason</span>
      </span>
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


  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      createBurstStar();
    }, i * 150); // slight stagger
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