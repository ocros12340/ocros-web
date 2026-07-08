/**
 * i18n.js — Translation strings and language switcher
 * Exports: strings, setLang, getLang
 * Used by: main.js, work-main.js (via work-loader.js)
 */

export const strings = {
  en: {
    // Navigation
    'nav.logo':                  'Okros',
    'nav.services':              'Services',
    'nav.work':                  'Work',
    'nav.about':                 'About',
    'nav.contact':               'Contact',

    // Hero (homepage)
    'hero.label':                'Sound Designer',
    'hero.statement':            'Crafting the sonic layer that makes a scene land, an ad resonate, and a story stay with you.',
    'hero.scroll':               'Scroll',

    // Services (homepage)
    'services.label':            'What I do',
    'services.title':            'Sound, shaped\nwith intention.',
    'services.film.title':       'Film / Video Sound Design',
    'services.film.desc':        'Post-production audio for short and feature-length film — dialogue cleaning, atmosphere, sound effects, foley, mixing, and mastering. Every layer built to serve the story.',
    'services.commercial.title': 'Commercial & Brand',
    'services.commercial.desc':  'Sound design and audio finishing for ads, brand films, and digital content. Built for impact within tight timelines.',
    'services.podcast.title':    'Podcast Production',
    'services.podcast.desc':     "End-to-end editing, noise reduction, mixing, and mastering for spoken word. Consistent, clean audio that respects the listener's ears.",
    'services.music.title':      'Film Score Composition',
    'services.music.desc':       'Original score composition for film, documentary, and episodic content. Music built from the story — not placed over it.',

    // About (homepage)
    'about.title':               '<em>About</em>',
    'about.p1':                  'I started playing piano at five. Over the next twenty years I built what is, by any measure, one of the most thorough audio educations available in Hungary — studying sound engineering, studio recording, music theory, and post-production at the Szent István Király Music High School, then completing a two-year audio technician programme, before graduating with a degree in Film Sound from the University of Theatre and Film Arts Budapest.',
    'about.p2':                  'Most recently I worked on Valami Igazi / Homebound, a film directed by Kristóf Lendvai — as both sound designer and composer. My approach: I listen carefully to what a project needs, then bring something more to it.',
    'about.p3':                  'Available for film sound design, commercial, film score, and podcast editing projects.',
    'about.tools.label':         'Tools & DAWs',

    // Contact (homepage)
    'contact.label':             'Get in touch',
    'contact.title':             "Let's make something<br><em>worth hearing.</em>",
    'contact.sub':               'Available for film sound design, commercial, film score, and podcast editing projects.\nResponse within 24 hours.',
    'contact.social.linkedin':   'LinkedIn',

    // Work page
    'work.cta':                  "Let's work together",
    'work.label':                'Selected Work',
    'work.title':                'Recent projects.',
    'work.coming_soon':          'Coming soon',
    'work.tracklist':            '↻  Tracklist',

    // Footer (both pages)
    'footer.tagline':            'Sound that stays.',
    'footer.rights':             'All rights reserved.',
    'footer.back':               'Back to top',
    'footer.home':               '← Home',
  },
  hu: {
    // Navigáció
    'nav.logo':                  'Okros',
    'nav.services':              'Szolgáltatások',
    'nav.work':                  'Munkák',
    'nav.about':                 'Rólam',
    'nav.contact':               'Kapcsolat',

    // Hero (főoldal)
    'hero.label':                'Sound Designer',
    'hero.statement':            'Megalkotom azt a hangzásvilágot, amitől egy reklám megragadja a figyelmet, és egy történet veled marad.',
    'hero.scroll':               'Görgess',

    // Szolgáltatások (főoldal)
    'services.label':            'Amit csinálok',
    'services.title':            'Hang, szándékkal\nformálva.',
    'services.film.title':       'Filmes hangdesign',
    'services.film.desc':        'Rövid- és nagyjátékfilmek teljes hangutómunkája — dialógustisztítástól a foley-n és hangeffekteken át a keverésig és maszteringig. Minden elem a film hangulatát szolgálja.',
    'services.commercial.title': 'Reklám és Brand',
    'services.commercial.desc':  'Hangdesign és audiomunka reklámokhoz, brand filmekhez és digitális tartalmakhoz. Hatásos eredmény, szoros határidők mellett.',
    'services.podcast.title':    'Podcast szerkesztés',
    'services.podcast.desc':     'Teljes podcast utómunka — vágás, zajcsökkentés, keverés és masztering. Tiszta, következetes hang, amelyet hallgatni is élmény.',
    'services.music.title':      'Filmzeneszerzés',
    'services.music.desc':       'Eredeti zeneszerzés filmekhez, dokumentumfilmekhez és sorozatokhoz. A zene a történetből születik — nem utólag kerül rá.',

    // Rólam (főoldal)
    'about.title':               '<em>Rólam</em>',
    'about.p1':                  'Ötéves koromban kezdtem el zongorázni. Az elkövetkező húsz évben szereztem meg azt a hangoktatási alapot, ami Magyarországon keveseknek adatik meg: a Szent István Király Zeneművészeti Szakgimnáziumban hangtechnikát, stúdiófelvételt, szolfézst, zeneelméletet és utómunkát tanultam, majd elvégeztem egy kétéves hangtechnikusi képzést, végül a Színház- és Filmművészeti Egyetemen hangmesteri diplomát szereztem.',
    'about.p2':                  'Legutóbb Lendvai Kristóf Valami Igazi / Homebound című filmjén dolgoztam — sound designerként és zeneszerzőként egyszerre. Meghallgatom, mire van szüksége a projektnek — és további kreatív megoldásokkal egészítem ki.',
    'about.p3':                  'Film és reklám, filmzene és podcast hang utómunkára elérhető vagyok.',
    'about.tools.label':         'Eszközök és DAW-ok',

    // Kapcsolat (főoldal)
    'contact.label':             'Keress meg',
    'contact.title':             'Adjunk hangot az elképzelésednek.',
    'contact.sub':               'Keress bátran film és reklámhang utómunkára, film zeneszerzésre vagy podcast utómunkára.\nVálasz 24 órán belül.',
    'contact.social.linkedin':   'LinkedIn',

    // Work oldal
    'work.cta':                  'Dolgozzunk együtt',
    'work.label':                'Válogatott munkák',
    'work.title':                'Legutóbbi projektek.',
    'work.coming_soon':          'Hamarosan',
    'work.tracklist':            '↻  Tracklista',

    // Lábléc (mindkét oldal)
    'footer.tagline':            'Hang, ami marad.',
    'footer.rights':             'Minden jog fenntartva.',
    'footer.back':               'Vissza a tetejére',
    'footer.home':               '← Főoldal',
  }
};

let _currentLang = 'en';

export function getLang() {
  return _currentLang;
}

export function setLang(lang) {
  _currentLang = lang;
  localStorage.setItem('okros-lang', lang);
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const val = strings[lang][key];
    if (val !== undefined) el.innerHTML = val.replace(/\n/g, '<br>');
  });

  const enBtn = document.getElementById('lang-en');
  const huBtn = document.getElementById('lang-hu');
  if (enBtn) enBtn.classList.toggle('active', lang === 'en');
  if (huBtn) huBtn.classList.toggle('active', lang === 'hu');
}

export function init() {
  const enBtn = document.getElementById('lang-en');
  const huBtn = document.getElementById('lang-hu');
  if (enBtn) enBtn.addEventListener('click', () => setLang('en'));
  if (huBtn) huBtn.addEventListener('click', () => setLang('hu'));
  const raw = localStorage.getItem('okros-lang');
  setLang(raw === 'hu' ? 'hu' : 'en');
}
