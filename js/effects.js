// effects.js — shared visual effects for every page.
// Currently: sparkle cursor trail. Add new shared effects here so we're not
// copy-pasting the same script into every HTML file.

(function sparkleTrail() {
  const sparkleChars = ['✦', '✧', '☆', '★', '✨', '*'];
  let lastSparkle = 0;

  document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastSparkle < 60) return; // throttle so it doesn't flood the DOM
    lastSparkle = now;

    const el = document.createElement('span');
    el.className = 'sparkle-trail';
    el.textContent = sparkleChars[Math.floor(Math.random() * sparkleChars.length)];
    el.style.left = e.clientX + 'px';
    el.style.top = e.clientY + 'px';
    el.style.color = `hsl(${Math.floor(Math.random() * 360)}, 100%, 70%)`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2400);
  });
})();
