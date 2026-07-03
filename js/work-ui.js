/**
 * work-ui.js — Work page UI: drag scroll, hash nav, float CTA, logo color
 * Work page only.
 * Exports: init()
 */

export function init() {
  initDragScroll();
  initHashNav();
  initFloatCta();
  initLogoWork();
}

// ── Horizontal drag-to-scroll on all .work__scroll-wrap elements ─────────────
function initDragScroll() {
  document.querySelectorAll('.work__scroll-wrap').forEach(wrap => {
    let isDown = false, startX, scrollLeft;

    wrap.addEventListener('mousedown', e => {
      isDown     = true;
      startX     = e.pageX - wrap.offsetLeft;
      scrollLeft = wrap.scrollLeft;
      wrap.classList.add('is-dragging');
    });
    wrap.addEventListener('mouseleave', () => { isDown = false; wrap.classList.remove('is-dragging'); });
    wrap.addEventListener('mouseup',    () => { isDown = false; wrap.classList.remove('is-dragging'); });
    wrap.addEventListener('mousemove',  e => {
      if (!isDown) return;
      e.preventDefault();
      wrap.scrollLeft = scrollLeft - (e.pageX - wrap.offsetLeft - startX) * 1.2;
    });
  });
}

// ── Hash anchor scroll — prevents browser scroll restoration jump ─────────────
// Note: `history.scrollRestoration = 'manual'; window.scrollTo(0,0);` must run
// as an inline script *before* this module fires (it's in the HTML <head>).
function initHashNav() {
  window.__scrollToHash = function () {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const target = document.getElementById(hash);
    if (!target) return;
    const navH = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
    ) || 72;
    const top = target.getBoundingClientRect().top + window.scrollY - navH - 24;
    window.scrollTo({ top, behavior: 'instant' });
  };

  window.addEventListener('hashchange', window.__scrollToHash);
}

// ── Floating CTA — scroll-driven vertical drift and show/hide ────────────────
function initFloatCta() {
  const floatCta = document.getElementById('floatCta');
  if (!floatCta) return;

  const SHOW_AFTER = 120;
  const TOP_START  = 20;
  const TOP_END    = 40;
  let ticking = false;

  function updateCta() {
    ticking = false;
    const scrollY   = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress  = maxScroll > 0 ? Math.min(1, Math.max(0, scrollY / maxScroll)) : 0;

    // Ease-in-out cubic
    const eased = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    floatCta.style.top = (TOP_START + (TOP_END - TOP_START) * eased).toFixed(2) + '%';
    floatCta.classList.toggle('visible', scrollY > SHOW_AFTER);
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(updateCta); ticking = true; }
  }, { passive: true });

  updateCta();
}

// ── Nav logomark section color — IntersectionObserver (no crossfade on work page) ──
function initLogoWork() {
  const navMark = document.querySelector('.nav__logomark');
  if (!navMark) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // CSS already forces opacity:1 on work page via !important.
  // Color changes via IntersectionObserver as sections enter view.
  const sectionColors = {
    hero:     '#C4956A',  // amber
    services: '#5BADA8',  // teal
    work:     '#C47060',  // terracotta
    about:    '#9B7BB5',  // violet
    contact:  '#C4956A',  // amber
  };

  const colorObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navMark.style.color = sectionColors[entry.target.id] || sectionColors.hero;
      }
    });
  }, { threshold: 0, rootMargin: '-20% 0px -55% 0px' });

  ['hero', 'services', 'work', 'about', 'contact'].forEach(id => {
    const el = document.getElementById(id);
    if (el) colorObs.observe(el);
  });
}
