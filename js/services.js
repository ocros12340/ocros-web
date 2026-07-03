/**
 * services.js — Service card click (pointer) and touch behavior
 * Homepage only.
 * Exports: init()
 */

export function init() {
  const cards = document.querySelectorAll('.service-card');
  if (!cards.length) return;

  // ── Pointer/mouse devices: entire card is clickable ─────────────────────────
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const link = card.querySelector('.service-card__link');
        if (link) window.location.href = link.href;
      });
    });
  }

  // ── Touch devices: highlight when in-view, tap to navigate ──────────────────
  if (window.matchMedia('(hover: none)').matches) {
    const svcObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
      });
    }, { threshold: 0.2 });

    cards.forEach(card => {
      svcObs.observe(card);

      let touchStartY = 0;
      let touchMoved  = false;

      card.addEventListener('touchstart', e => {
        touchStartY = e.touches[0].clientY;
        touchMoved  = false;
      }, { passive: true });

      card.addEventListener('touchmove', e => {
        if (Math.abs(e.touches[0].clientY - touchStartY) > 12) touchMoved = true;
      }, { passive: true });

      // preventDefault blocks synthesized click after touchend
      card.addEventListener('touchend', e => {
        e.preventDefault();
        if (touchMoved) return;
        const link = card.querySelector('.service-card__link');
        if (link) window.location.href = link.href;
      }, { passive: false });
    });
  }
}
