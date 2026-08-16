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

// ── Melbourne weather · precise conditions ────────────────────
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

async function fetchWeather() {
  const weatherValEl = document.getElementById('weatherValue');
  if (!weatherValEl) return;

  const lat = -37.8136;
  const lon = 144.9631;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,weather_code,is_day` +
    `&timezone=Australia%2FMelbourne`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const c = data.current || {};

    const temp  = Math.round(c.temperature_2m);
    const feels = Math.round(c.apparent_temperature);
    const code  = c.weather_code;

    // look up the exact description + icon
    let [icon, condition] = WMO[code] || ["✨", "✨✨"];

    // after dark, a clear sky isn't "clear" — it's just dark, 
    const hr = new Date().getHours();
    const isNight = (window.TIME_OF_DAY &&
        (window.TIME_OF_DAY.period === "night" || window.TIME_OF_DAY.period === "latenight"))
      || (c.is_day === 0)
      || hr >= 21 || hr < 5;
    if (isNight) {
      if (code === 0) { icon = "🌙"; condition = "dark. "; }
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
      <span style="display:block; font-size:11px; color:#c8ffd8; margin-top:6px;">${feelsLine}</span>
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