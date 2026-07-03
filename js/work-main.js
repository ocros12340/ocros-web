/**
 * work-main.js — Work page entry point
 * Loaded via: <script type="module" src="/js/work-main.js">
 * The Supabase CDN script must appear *before* this module tag in the HTML.
 */

import { init as initI18n }   from './i18n.js';
import { init as initNav }    from './nav.js';
import { init as initAnims }  from './animations.js';
import { init as initWorkUi } from './work-ui.js';
import { init as initLoader } from './work-loader.js';
import { initTheme }          from './theme.js';

initTheme();
initI18n();
initNav();
initAnims();
initWorkUi();
initLoader(); // fires async Supabase fetch; sets window.__scrollToHash
