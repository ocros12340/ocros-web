/* ════════════════════════════════════════════════════════
   THEME — dark (default) ↔ light toggle
   Persists to localStorage under 'okros-theme'.
   The anti-FOUC inline script in <head> pre-applies the
   saved theme before first paint; this module wires the
   toggle button and keeps everything in sync.
   ════════════════════════════════════════════════════════ */

const STORAGE_KEY = 'okros-theme';

function getCurrent() {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme; // always set: 'dark' | 'light'

  // Update aria-pressed on all pill options
  document.querySelectorAll('.theme-toggle__opt').forEach(btn => {
    btn.setAttribute('aria-pressed', btn.dataset.value === theme ? 'true' : 'false');
  });
}

export function initTheme() {
  const raw   = localStorage.getItem(STORAGE_KEY);
  const saved = raw === 'light' ? 'light' : 'dark'; // whitelist: only accept known values
  applyTheme(saved);

  document.querySelectorAll('.theme-toggle__opt').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = btn.dataset.value;
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
    });
  });
}
