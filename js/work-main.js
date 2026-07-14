/**
 * work-main.js — Work page entry point
 * Loaded via: <script type="module" src="/js/work-main.js">
 * The Supabase CDN script must appear *before* this module tag in the HTML.
 */

import { init as initI18n }   from './i18n.js?v=2';
import { init as initNav }    from './nav.js?v=2';
import { init as initAnims }  from './animations.js?v=2';
import { init as initWorkUi } from './work-ui.js?v=2';
import { init as initLoader } from './work-loader.js?v=2';
import { initTheme }          from './theme.js?v=2';

initTheme();
initI18n();
initNav();
initAnims();
initWorkUi();
initLoader(); // fires async Supabase fetch; sets window.__scrollToHash
