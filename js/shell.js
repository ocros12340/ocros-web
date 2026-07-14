/**
 * shell.js — Shared nav and footer as custom elements.
 * Single source of truth for both index.html and work/index.html.
 *
 * Usage:
 *   <okros-nav page="home"></okros-nav>   — anchor hrefs, Back-to-top footer
 *   <okros-nav page="work"></okros-nav>   — absolute hrefs, Work link active, ← Home footer
 *
 * Loaded as a sync (non-deferred) <script> in <head> so connectedCallback
 * fires immediately when the parser processes the custom element — no FOUC.
 */

/* ── NAV ──────────────────────────────────────────────────── */
class OkrosNav extends HTMLElement {
  connectedCallback() {
    if (this.hasChildNodes()) return; // idempotent
    const isWork = this.getAttribute('page') === 'work';

    this.innerHTML = `
  <nav class="nav" id="nav" aria-label="Main navigation">
    <div class="nav__inner">
      <a href="/" class="nav__logo" aria-label="Okros — Sound Designer">
        <svg class="nav__logomark" viewBox="38 134 204 116" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <clipPath id="okros-clip-nav">
              <circle cx="120" cy="190" r="50"/>
            </clipPath>
          </defs>
          <circle cx="120" cy="190" r="50" stroke="currentColor" stroke-width="1.8" vector-effect="non-scaling-stroke"/>
          <path d="M58,190 C70,190 76,167 84,167 C92,167 98,213 106,213 C114,213 120,167 128,167 C136,167 142,213 150,213 C158,213 164,190 182,190"
                stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"
                clip-path="url(#okros-clip-nav)" vector-effect="non-scaling-stroke"/>
          <line x1="70" y1="190" x2="44" y2="190" stroke="currentColor" stroke-width="1.4" opacity="0.45" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
          <line x1="170" y1="190" x2="196" y2="190" stroke="currentColor" stroke-width="1.4" opacity="0.45" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
        </svg>
        <span class="nav__wordmark" data-i18n="nav.logo">Okros</span>
      </a>

      <button class="nav__hamburger" id="hamburger" aria-label="Open menu" aria-expanded="false" aria-controls="nav-links">
        <span></span><span></span><span></span>
      </button>

      <ul class="nav__links" id="nav-links" role="list">
        <li><a href="${isWork ? '/#services' : '#services'}" data-i18n="nav.services">Services</a></li>
        <li><a href="/work"${isWork ? ' class="nav__link--active"' : ''} data-i18n="nav.work">Work</a></li>
        <li><a href="${isWork ? '/#about' : '#about'}" data-i18n="nav.about">About</a></li>
        <li><a href="${isWork ? '/#contact' : '#contact'}" data-i18n="nav.contact">Contact</a></li>
        <li class="lang-toggle" role="group" aria-label="Language selector">
          <button class="lang-btn active" id="lang-en" data-lang="en" aria-pressed="true">EN</button>
          <span class="lang-sep" aria-hidden="true">/</span>
          <button class="lang-btn" id="lang-hu" data-lang="hu" aria-pressed="false">HU</button>
        </li>
        <li>
          <div class="theme-toggle" role="group" aria-label="Color scheme">
            <span class="theme-toggle__thumb" aria-hidden="true"></span>
            <button class="theme-toggle__opt" data-value="dark" aria-pressed="true" aria-label="Dark mode">☾</button>
            <button class="theme-toggle__opt" data-value="light" aria-pressed="false" aria-label="Light mode">☀&#xFE0E;</button>
          </div>
        </li>
      </ul>
    </div>
  </nav>`;
  }
}

/* ── FOOTER ───────────────────────────────────────────────── */
class OkrosFooter extends HTMLElement {
  connectedCallback() {
    if (this.hasChildNodes()) return; // idempotent
    const isWork = this.getAttribute('page') === 'work';

    this.innerHTML = `
  <footer class="footer">
    <div class="footer__inner">

      <div class="footer__brand">
        <a href="${isWork ? '#' : '/'}" class="footer__wordmark" aria-label="Okros — back to top">Okros</a>
        <span class="footer__tagline" data-i18n="footer.tagline">Sound that stays.</span>
      </div>

      <div class="footer__bottom">
        <p class="footer__copy">
          &copy; <span id="year"></span> Okros. <span data-i18n="footer.rights">All rights reserved.</span>
        </p>
        ${isWork
          ? '<a href="/" class="footer__back" data-i18n="footer.home">← Home</a>'
          : '<button type="button" class="footer__back" data-i18n="footer.back" data-action="back-to-top">Back to top ↑</button>'
        }
      </div>

    </div>
  </footer>`;
  }
}

customElements.define('okros-nav', OkrosNav);
customElements.define('okros-footer', OkrosFooter);
