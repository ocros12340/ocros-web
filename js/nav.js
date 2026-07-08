/**
 * nav.js — Navigation: scroll effect, hamburger menu, scroll reveal, active link
 * Exports: init()
 * Shared between: main.js (homepage), work-main.js (work page)
 */

export function init() {
  // ── Nav scroll effect ───────────────────────────────────────────────────────
  const nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  // ── Mobile hamburger ────────────────────────────────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');

  if (hamburger && navLinks) {
    function preventScroll(e) { e.preventDefault(); }

    function openMenu() {
      document.body.classList.add('menu-open');
      document.addEventListener('touchmove', preventScroll, { passive: false });
      navLinks.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
    }

    function closeMenu() {
      document.body.classList.remove('menu-open');
      document.removeEventListener('touchmove', preventScroll);
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }

    hamburger.addEventListener('click', () => {
      navLinks.classList.contains('open') ? closeMenu() : openMenu();
    });

    navLinks.querySelectorAll('a, button').forEach(el => el.addEventListener('click', closeMenu));
  }

  // ── Scroll reveal ───────────────────────────────────────────────────────────
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  // ── Active nav link on scroll (homepage sections) ───────────────────────────
  const navLinkEls = document.querySelectorAll('.nav__links a');
  if (navLinkEls.length) {
    function setActive(id) {
      navLinkEls.forEach(a => {
        a.classList.toggle('nav__link--active', !!(id && a.getAttribute('href') === '#' + id));
      });
    }

    const sectionObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActive(entry.target.id === 'hero' ? '' : entry.target.id);
        }
      });
    }, { threshold: 0, rootMargin: '-20% 0px -55% 0px' });

    ['hero', 'services', 'about', 'contact', 'work'].forEach(id => {
      const el = document.getElementById(id);
      if (el) sectionObs.observe(el);
    });
  }

  // ── Footer year ─────────────────────────────────────────────────────────────
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}
