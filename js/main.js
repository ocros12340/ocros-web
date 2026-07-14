/**
 * main.js — Homepage entry point
 * Imports and initialises all homepage modules.
 * Loaded via: <script type="module" src="/js/main.js">
 */

import { init as initI18n } from './i18n.js';
import { init as initNav }  from './nav.js';
import { init as initAnims } from './animations.js';
import { init as initLogo }  from './logo-home.js';
import { init as initServices } from './services.js';
import { initTheme } from './theme.js';

// ── Hero name letter animation ───────────────────────────────────────────────
function initLetterAnimation() {
  const nameEl = document.getElementById('hero-name');
  if (!nameEl) return;
  const word = 'Okros';
  nameEl.innerHTML = word.split('').map((ch, i) => {
    const delay = (0.35 + i * 0.09).toFixed(2);
    return `<span class="letter" style="animation-delay:${delay}s">${ch}</span>`;
  }).join('');
}

// ── Hero waveform canvas ─────────────────────────────────────────────────────
function initWaveform() {
  const canvas = document.getElementById('waveform-canvas');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const POINTS = 180;
  let phase = 0;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cy   = canvas.height / 2;
    const step = canvas.width  / POINTS;

    // Layer 1 — main wave
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(196, 149, 106, 0.55)';
    ctx.lineWidth   = 1.2;
    for (let i = 0; i <= POINTS; i++) {
      const x   = i * step;
      const t   = (i / POINTS) * Math.PI * 10;
      const env = Math.pow(Math.sin((i / POINTS) * Math.PI), 0.6);
      const y   = cy
        + Math.sin(t + phase)              * 72 * env
        + Math.sin(t * 2.1 + phase * 0.6) * 28 * env
        + Math.sin(t * 0.4 + phase * 1.5) * 44 * env;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Layer 2 — softer echo
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(196, 149, 106, 0.2)';
    ctx.lineWidth   = 0.8;
    for (let i = 0; i <= POINTS; i++) {
      const x   = i * step;
      const t   = (i / POINTS) * Math.PI * 7;
      const env = Math.pow(Math.sin((i / POINTS) * Math.PI), 0.8);
      const y   = cy
        + Math.sin(t + phase * 1.3 + 1.2) * 55 * env
        + Math.sin(t * 1.7 + phase * 0.9) * 20 * env;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    phase += 0.006;
    if (!document.hidden) requestAnimationFrame(draw);
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) requestAnimationFrame(draw);
  });

  draw();
}

// ── Ticker pause (Safari fix — CSS hover resets animation position) ──────────
function initTicker() {
  const ticker = document.querySelector('.ticker');
  const track  = document.querySelector('.ticker__track');
  if (!ticker || !track) return;
  ticker.addEventListener('mouseenter', () => {
    track.style.animationPlayState = 'paused';
  });
  ticker.addEventListener('mouseleave', () => {
    track.style.animationPlayState = 'running';
  });
}

// ── Footer back-to-top (replaces inline onclick) ─────────────────────────────
function initBackToTop() {
  document.addEventListener('click', e => {
    if (e.target.closest('[data-action="back-to-top"]')) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

// ── Boot ─────────────────────────────────────────────────────────────────────
initTheme();
initI18n();
initNav();
initAnims();
initLogo();
initServices();
initLetterAnimation();
initWaveform();
initTicker();
initBackToTop();
