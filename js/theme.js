/* ════════════════════════════════════════════════════════
   THEME — dark (default) ↔ light toggle
   Persists to localStorage under 'ocros-theme'.
   The anti-FOUC inline script in <head> pre-applies the
   saved theme before first paint; this module wires the
   toggle button and keeps everything in sync.
   ════════════════════════════════════════════════════════ */

const STORAGE_KEY = 'ocros-theme';

function getCurrent() {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function applyTheme(theme) {
  if (theme === 'light') document.documentElement.dataset.theme = 'light';
  else delete document.documentElement.dataset.theme;

  // Update aria-pressed on all pill options
  document.querySelectorAll('.theme-toggle__opt').forEach(btn => {
    btn.setAttribute('aria-pressed', btn.dataset.value === theme ? 'true' : 'false');
  });
}

export function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY) || 'dark';
  applyTheme(saved);

  document.querySelectorAll('.theme-toggle__opt').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = btn.dataset.value;
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
    });
  });
}
