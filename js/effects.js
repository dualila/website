(function sparkleTrail() {
  const sparkleChars = ['✦', '✧', '☆', '★', '✨','✦', '✧', '☆', '★', '✨','✦', '✧', '☆', 'lily', 'lily','lilywakefield.com.au', '*'];
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
for(let i=0;i<40;i++){

const star=document.createElement("div");

star.className="star";

star.style.left=Math.random()*100+"vw";

star.style.animationDuration=8+Math.random()*15+"s";

star.style.animationDelay=-Math.random()*20+"s";

document.body.appendChild(star);

}

(function hiddenAdminLink() {
  function addIt() {
    const footer = document.querySelector('footer');
    if (!footer || footer.querySelector('.secret-admin')) return;

    const a = document.createElement('a');
    a.className = 'secret-admin';
    a.href = '/admin.html';
    a.textContent = '🔒';               
    a.style.cssText =
      'color:rgba(255,0,255,1);text-decoration:none;margin-left:8px;' +
      'transition:color .3s,text-shadow .3s;';

    a.addEventListener('mouseenter', () => {
      a.style.color = '#ff00ff';
      a.style.textShadow = '0 0 6px #ff00ff';
    });
    a.addEventListener('mouseleave', () => {
      a.style.color = 'rgba(255,0,255,0.14)';
      a.style.textShadow = 'none';
    });

    footer.appendChild(a);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addIt);
  } else {
    addIt();
  }
})();