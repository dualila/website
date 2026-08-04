
(function naarmClock() {
  const HOURS = ["twelve","one","two","three","four","five",
                 "six","seven","eight","nine","ten","eleven"];

  const MIN = {
    5:"five past", 10:"ten past", 15:"quarter past", 20:"twenty past",
    25:"twenty-five past", 30:"half past", 35:"twenty-five to",
    40:"twenty to", 45:"quarter to", 50:"ten to", 55:"five to",
  };

  // current time in Melbourne (handles AEST/AEDT daylight saving automatically)
  function naarmNow() {
    const parts = new Intl.DateTimeFormat("en-AU", {
      timeZone: "Australia/Melbourne",
      hour: "2-digit", minute: "2-digit", hour12: false,
    }).formatToParts(new Date());
    let h = 0, m = 0;
    for (const p of parts) {
      if (p.type === "hour") h = parseInt(p.value, 10) % 24;
      if (p.type === "minute") m = parseInt(p.value, 10);
    }
    return { h, m };
  }

  // time → words, rounded to the nearest 5 min (hence "about")
  function wordTime(t) {
    let h = t.h;
    let m = Math.round(t.m / 5) * 5;
    if (m === 60) { m = 0; h = (h + 1) % 24; }

    const isTo = m > 30;
    const ph = isTo ? (h + 1) % 24 : h;   // "to" refers to the next hour

    const hourWord =
      ph === 0 ? "midnight" :
      ph === 12 ? "noon" :
      HOURS[ph % 12];

    if (m === 0) {
      return (hourWord === "midnight" || hourWord === "noon")
        ? "about " + hourWord
        : "about " + hourWord + " o'clock";
    }
    return "about " + MIN[m] + " " + hourWord;
  }

  function digital(t) {
    return String(t.h).padStart(2, "0") + ":" + String(t.m).padStart(2, "0");
  }

  let el, showDigits = false;

  function tick() {
    if (!el) return;
    const t = naarmNow();
    el.textContent = showDigits
      ? "★ " + digital(t) + " in naarm ★"
      : "★ it's " + wordTime(t) + " at home ★";
  }

  function build() {
    const footer = document.querySelector("footer");
    if (!footer || footer.querySelector(".vibe-clock")) return;

    el = document.createElement("div");
    el.className = "vibe-clock";
    el.title = "click for the real time";
    el.style.cssText =
      "margin-top:8px;font-family:'Courier New',monospace;font-size:11px;" +
      "color:#9fd0ff;text-shadow:0 0 4px rgba(120,180,255,.4);" +
      "letter-spacing:1px;cursor:pointer;";
    el.addEventListener("click", () => { showDigits = !showDigits; tick(); });

    footer.appendChild(el);
    tick();
    setInterval(tick, 15000);   // catch minute rollovers without being wasteful
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();