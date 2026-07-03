/**
 * logo-home.js — Scroll-driven hero↔nav logo crossfade + color waypoints
 * Homepage only. The nav logomark fades in as the hero logomark fades out,
 * and its color morphs across section accent colors as the user scrolls.
 * Exports: init()
 */

export function init() {
  const heroMark = document.querySelector('.hero__logomark');
  const navMark  = document.querySelector('.nav__logomark');
  const heroEl   = document.getElementById('hero');
  if (!heroMark || !navMark || !heroEl) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Start invisible — JS drives opacity from here
  navMark.style.opacity = '0';

  // ── Scroll-driven crossfade ────────────────────────────────────────────────
  let ticking = false;

  function updateLogo() {
    ticking = false;
    const heroH    = heroEl.offsetHeight;
    const progress = Math.min(1, Math.max(0, window.scrollY / (heroH * 0.48)));

    // Hero mark: fade out + gentle scale + drift upward
    const heroOpacity = Math.max(0, 1 - progress * 1.7);
    const heroScale   = (1 - progress * 0.11).toFixed(4);
    const heroY       = (-progress * 18).toFixed(2);
    heroMark.style.opacity   = heroOpacity.toFixed(4);
    heroMark.style.transform = `scale(${heroScale}) translateY(${heroY}px)`;

    // Nav mark: fades in once hero mark is mostly gone
    const navOpacity = Math.max(0, (progress - 0.38) / 0.55);
    navMark.style.opacity = Math.min(1, navOpacity).toFixed(4);

    updateColor();
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(updateLogo); ticking = true; }
  }, { passive: true });

  // ── Scroll-based color morph across section accent colors ──────────────────
  const colorStops = [
    { id: 'hero',     rgb: [196, 149, 106] },  // amber
    { id: 'services', rgb: [91,  173, 168] },  // teal
    { id: 'about',    rgb: [155, 123, 181] },  // violet
    { id: 'contact',  rgb: [196, 112, 96]  },  // terracotta
  ].map(s => ({ el: document.getElementById(s.id), rgb: s.rgb }))
   .filter(s => s.el);

  function lerp(a, b, t) { return a + (b - a) * t; }

  function buildWaypoints() {
    return colorStops.map(s => ({ y: s.el.offsetTop, rgb: s.rgb }));
  }

  let waypoints = buildWaypoints();
  let _resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(() => { waypoints = buildWaypoints(); }, 150);
  });

  function updateColor() {
    const scrollY = window.scrollY + window.innerHeight * 0.15;
    let fromIdx = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      if (scrollY >= waypoints[i].y) fromIdx = i;
    }
    const from = waypoints[fromIdx];
    const to   = waypoints[Math.min(fromIdx + 1, waypoints.length - 1)];
    const t    = from.y === to.y ? 1 : Math.min(1, Math.max(0, (scrollY - from.y) / (to.y - from.y)));
    const r = Math.round(lerp(from.rgb[0], to.rgb[0], t));
    const g = Math.round(lerp(from.rgb[1], to.rgb[1], t));
    const b = Math.round(lerp(from.rgb[2], to.rgb[2], t));
    navMark.style.color = `rgb(${r},${g},${b})`;
  }

  // Run once on load
  updateLogo();
}
