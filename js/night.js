

(function dayNight() {
  const h = new Date().getHours();
  let period;
  if (h < 5)       period = "latenight";   // 12am–5am  ← the night-lurker zone
  else if (h < 11) period = "morning";     // 5am–11am
  else if (h < 17) period = "day";         // 11am–5pm
  else if (h < 21) period = "evening";     // 5pm–9pm
  else             period = "night";       // 9pm–12am


  const info = DATA[period];
  const greeting = info.lines[Math.floor(Math.random() * info.lines.length)];

  // let other scripts (the orb, etc.) read the current mood
  window.TIME_OF_DAY = { period, label: info.label, greeting };

  function apply() {
    document.body.classList.add("tod-" + period);

    if (info.tint && !document.getElementById("todTint")) {
      const tint = document.createElement("div");
      tint.id = "todTint";
      tint.style.cssText =
        "position:fixed;inset:0;pointer-events:none;z-index:-1;" +
        "background:" + info.tint + ";transition:background 2s ease;";
      document.body.appendChild(tint);
    }
    const tick = document.querySelector(".ticker span");
    if (tick && !tick.dataset.tod) {
      tick.dataset.tod = "1";
      tick.textContent = tick.textContent.trim() + "   ✦   " + info.ticker + "   ✦";
    }
    const line = document.getElementById("todLine");
    if (line) {
      line.textContent = greeting;
      line.style.transition = "opacity 1.2s ease";
      line.style.opacity = "0";
      requestAnimationFrame(() => { line.style.opacity = "1"; });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply);
  } else {
    apply();
  }
})();