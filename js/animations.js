/**
 * animations.js — Scroll parallax, mouse parallax, page-hidden class toggle
 * Exports: init()
 * Shared between: main.js (homepage), work-main.js (work page)
 */

export function init() {
  initScrollParallax();
  initMouseParallax();
  initPageHiddenToggle();
}

// ── Scroll parallax ──────────────────────────────────────────────────────────
function initScrollParallax() {
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  if (!parallaxEls.length) return;
  if (window.innerWidth < 769) return; // CSS hides elements on mobile anyway
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const items = Array.from(parallaxEls).map(el => ({
    el,
    speed: parseFloat(el.dataset.parallax),
    originY: el.getBoundingClientRect().top + window.scrollY,
  }));

  let ticking = false;

  function update() {
    const scrollY = window.scrollY;
    items.forEach(({ el, speed, originY }) => {
      const delta = scrollY - originY + window.innerHeight * 0.5;
      el.style.transform = `translateY(${delta * speed}px)`;
    });
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });

  update();
}

// ── Mouse / gyroscope parallax ───────────────────────────────────────────────
function initMouseParallax() {
  const mpEls = document.querySelectorAll('[data-mpx]');
  if (!mpEls.length) return;
  if (window.innerWidth < 769) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const LERP = 0.06;
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  document.addEventListener('mousemove', e => {
    targetX = e.clientX / window.innerWidth  - 0.5;
    targetY = e.clientY / window.innerHeight - 0.5;
  });

  window.addEventListener('deviceorientation', e => {
    if (e.gamma == null) return;
    targetX = Math.max(-0.5, Math.min(0.5, e.gamma        / 25));
    targetY = Math.max(-0.5, Math.min(0.5, (e.beta - 45)  / 25));
  }, { passive: true });

  let tickId = null;

  function tick() {
    if (document.hidden) { tickId = null; return; }
    tickId = requestAnimationFrame(tick);
    currentX += (targetX - currentX) * LERP;
    currentY += (targetY - currentY) * LERP;

    for (let i = 0; i < mpEls.length; i++) {
      const el = mpEls[i];
      const sx = parseFloat(el.dataset.mpx) || 20;
      const sy = parseFloat(el.dataset.mpy) || 20;
      el.style.setProperty('--mpx', (currentX * sx).toFixed(2) + 'px');
      el.style.setProperty('--mpy', (currentY * sy).toFixed(2) + 'px');
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && tickId === null) tickId = requestAnimationFrame(tick);
  });

  tickId = requestAnimationFrame(tick);
}

// ── Tab-hidden: pause CSS animations ────────────────────────────────────────
function initPageHiddenToggle() {
  document.addEventListener('visibilitychange', () => {
    document.documentElement.classList.toggle('js-page-hidden', document.hidden);
  });
}
