

(function dayNight() {
  const h = new Date().getHours();
  let period;
  if (h < 5)       period = "latenight";   // 12am–5am  ← the night-lurker zone
  else if (h < 11) period = "morning";     // 5am–11am
  else if (h < 17) period = "day";         // 11am–5pm
  else if (h < 21) period = "evening";     // 5pm–9pm
  else             period = "night";       // 9pm–12am

  const DATA = {
    latenight: {
      label: "the small hours",
      tint: "rgba(12,10,60,0.30)",
      ticker: "it's the middle of the night ✦ i'm glad you're here anyway",
      lines: [
        "who's awake at this hour? ...oh. you.",
        "the site is quieter now. it's just us.",
        "3am on the internet again, huh.",
        "you should sleep. but not yet.",
      ],
    },
    morning: {
      label: "morning",
      tint: "rgba(255,190,130,0.07)",
      ticker: "good morning ☀ you're up early",
      lines: [
        "morning. have you had water today?",
        "the sun's barely up and here you are.",
        "a whole fresh day. don't waste it here. (but stay a bit.)",
      ],
    },
    day: {
      label: "daytime",
      tint: "",   // no tint — daylight is the default look
      ticker: "hello, daytime visitor ✦",
      lines: [
        "hi! a normal person, browsing at a normal hour.",
        "the site probably looks best in daylight.",
        "welcome, well-adjusted daytime person.",
      ],
    },
    evening: {
      label: "evening",
      tint: "rgba(255,120,70,0.09)",
      ticker: "good evening ✦ the light's going gold",
      lines: [
        "evening. the good part of the day.",
        "winding down? same.",
        "golden hour, allegedly.",
      ],
    },
    night: {
      label: "night",
      tint: "rgba(20,12,70,0.18)",
      ticker: "good evening, night owl ✦ cosy in here",
      lines: [
        "it's dark out. cosy in here though.",
        "night shift. welcome.",
        "the orb is sleeping. you are not.",
      ],
    },
  };
  // ───────────────────────────────────────────────────────

  const info = DATA[period];
  const greeting = info.lines[Math.floor(Math.random() * info.lines.length)];

  // let other scripts (the orb, etc.) read the current mood
  window.TIME_OF_DAY = { period, label: info.label, greeting };

  function apply() {
    document.body.classList.add("tod-" + period);

    // faint full-site mood tint (sits behind the content)
    if (info.tint && !document.getElementById("todTint")) {
      const tint = document.createElement("div");
      tint.id = "todTint";
      tint.style.cssText =
        "position:fixed;inset:0;pointer-events:none;z-index:-1;" +
        "background:" + info.tint + ";transition:background 2s ease;";
      document.body.appendChild(tint);
    }

    // append a time line to the ticker, keeping the page's own message
    const tick = document.querySelector(".ticker span");
    if (tick && !tick.dataset.tod) {
      tick.dataset.tod = "1";
      tick.textContent = tick.textContent.trim() + "   ✦   " + info.ticker + "   ✦";
    }

    // fill an opt-in #todLine element with the greeting
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