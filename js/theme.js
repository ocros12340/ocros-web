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
  if (theme === 'light') {
    document.documentElement.dataset.theme = 'light';
  } else {
    delete document.documentElement.dataset.theme;
  }
  document.querySelectorAll('.theme-btn').forEach(btn => {
    const isLight = theme === 'light';
    btn.textContent = isLight ? '☾' : '☀';
    btn.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
    btn.setAttribute('aria-pressed', isLight ? 'false' : 'true');
  });
}

export function initTheme() {
  // Apply saved preference (anti-FOUC script may have already set data-theme,
  // but we still need to set button state)
  const saved = localStorage.getItem(STORAGE_KEY) || 'dark';
  applyTheme(saved);

  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = getCurrent() === 'dark' ? 'light' : 'dark';
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
    });
  });
}
