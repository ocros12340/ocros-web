/**
 * work-loader.js — Supabase data loader + DOM builder for the work page
 * Exports: init()
 * Depends on: window.supabase (loaded via CDN <script> before this module)
 *             setLang from i18n.js (re-applies translations after DOM injection)
 */

import { setLang, getLang } from './i18n.js';

const SUPABASE_URL = 'https://zspmnnrmcfcxdudmiegc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_hex89ktAS2X0tyrSenty4g_pPlrTACL';

// ── HTML escaping helpers ────────────────────────────────────────────────────
function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function escAttr(s) {
  return String(s || '').replace(/"/g, '&quot;');
}

// ── URL parsers ──────────────────────────────────────────────────────────────
function getVimeoId(url) {
  if (!url) return null;
  const m = url.match(
    /vimeo\.com\/(?:video\/|channels\/[^/]+\/|groups\/[^/]+\/videos\/|album\/[^/]+\/video\/)?(\d+)/
  );
  return m ? m[1] : null;
}

function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  return m ? m[1] : null;
}

// ── Individual project card builder ─────────────────────────────────────────
function buildItem(p) {
  const isAudio   = p.media_type === 'audio';
  const cover     = p.cover_image_url || '';
  const hasCover  = cover.length > 0;
  const title     = p.title       ? escHtml(p.title)       : '[Project Title]';
  const desc      = p.description ? escHtml(p.description) : '';
  const vimeoId   = getVimeoId(p.cloudinary_url);
  const youtubeId = getYouTubeId(p.cloudinary_url);

  let mediaPart;

  if (isAudio) {
    const coverBg    = hasCover
      ? ` style="background-image:url('${escAttr(cover)}');background-size:cover;background-position:center;"`
      : '';
    const coverClass = hasCover ? ' has-cover' : '';
    mediaPart = `<div class="work-item__media${coverClass}"${coverBg}`
      + ` data-cld-src="${escAttr(p.cloudinary_url)}" data-cld-type="audio">`
      + (hasCover ? '<div class="work-item__cover-overlay"></div>' : '')
      + '<audio controls preload="metadata"></audio>'
      + (!hasCover
          ? '<div class="work-item__placeholder">'
            + '<svg class="work-item__placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>'
            + '<span class="work-item__placeholder-text">Audio — upload file</span>'
            + '</div>'
          : '')
      + '</div>';

  } else if (youtubeId) {
    const thumb = hasCover
      ? escAttr(cover)
      : `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
    mediaPart = '<div class="work-item__media work-item__media--vimeo">'
      + `<div class="yt-facade" data-yt-id="${escAttr(youtubeId)}">`
      + `<img class="yt-facade__thumb" src="${thumb}" alt="${escAttr(p.title)}" loading="lazy">`
      + '<div class="yt-facade__play"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>'
      + '</div></div>';

  } else if (vimeoId) {
    mediaPart = '<div class="work-item__media work-item__media--vimeo">'
      + `<iframe src="https://player.vimeo.com/video/${vimeoId}?badge=0&autopause=0&player_id=0&app_id=58479&dnt=1"`
      + ` frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen`
      + ` title="${escAttr(p.title)}"></iframe>`
      + '</div>';

  } else {
    const posterAttr = hasCover ? ` poster="${escAttr(cover)}"` : '';
    mediaPart = '<div class="work-item__media"'
      + ` data-cld-src="${escAttr(p.cloudinary_url)}" data-cld-type="video">`
      + `<video controls preload="metadata"${posterAttr}></video>`
      + '<div class="work-item__placeholder">'
      + '<svg class="work-item__placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>'
      + '<span class="work-item__placeholder-text">Video — upload file</span>'
      + '</div></div>';
  }

  return `<div class="work-item">${mediaPart}`
    + '<div class="work-item__footer"><div>'
    + `<h3 class="work-item__title">${title}</h3>`
    + `<p class="work-item__desc">${desc}</p>`
    + '</div></div></div>';
}

// ── Cloudinary lazy src resolver ─────────────────────────────────────────────
function applyCldMedia(container) {
  container.querySelectorAll('.work-item__media[data-cld-src]').forEach(wrap => {
    const src  = wrap.dataset.cldSrc;
    const type = wrap.dataset.cldType;
    const el   = wrap.querySelector(type);
    if (!el || !src) return;
    el.src = src;
    wrap.classList.add('media-loaded');
    el.addEventListener('error', () => {
      wrap.classList.remove('media-loaded');
      el.removeAttribute('src');
    }, { once: true });
  });
}

// ── Album card builder ───────────────────────────────────────────────────────
function buildAlbumCard(album, tracks) {
  const cover   = album.cover_image_url || '';
  const title   = album.title       ? escHtml(album.title)       : '[Album]';
  const desc    = album.description ? escHtml(album.description) : '';
  const flipId  = 'flip-' + album.id.replace(/-/g, '');

  const trackItems = tracks.map((t, i) =>
    `<div class="album-track" data-src="${escAttr(t.cloudinary_url)}">`
    + `<span class="album-track__num">${i + 1}</span>`
    + `<span class="album-track__title">${escHtml(t.title || '')}</span>`
    + '<span class="album-track__icon">▶</span>'
    + '</div>'
  ).join('');

  const frontStyle = cover
    ? ` style="background-image:url('${escAttr(cover)}')"`
    : '';

  return `<div class="work-item album-item">`
    + `<div class="album-flip" id="${flipId}">`
      + '<div class="album-flip__inner">'
        + '<div class="album-flip__spine"></div>'
        + `<div class="album-flip__front"${frontStyle}>`
          + '<div class="album-flip__front-overlay">'
            + '<span class="album-flip__hint" data-i18n="work.tracklist">↻  Tracklist</span>'
          + '</div>'
        + '</div>'
        + '<div class="album-flip__back">'
          + '<div class="album-back__header">'
            + `<span class="album-back__close" data-flip="${flipId}">✕</span>`
            + `<div class="album-back__title">${title}</div>`
            + (desc ? `<div class="album-back__desc">${desc}</div>` : '')
          + '</div>'
          + `<div class="album-back__tracklist">${trackItems}</div>`
          + '<div class="album-player">'
            + '<div class="album-player__title">—</div>'
            + '<div class="album-player__progress">'
              + '<span class="album-player__time album-player__time--cur">0:00</span>'
              + '<div class="album-player__bar">'
                + '<div class="album-player__fill"></div>'
                + '<div class="album-player__thumb"></div>'
              + '</div>'
              + '<span class="album-player__time album-player__time--dur">0:00</span>'
            + '</div>'
            + '<div class="album-player__controls">'
              + '<button class="album-player__skip" data-skip="-10" aria-label="Back 10 seconds">↩︎</button>'
              + '<button class="album-player__playpause">▶</button>'
              + '<button class="album-player__skip" data-skip="10" aria-label="Forward 10 seconds">↪︎</button>'
            + '</div>'
          + '</div>'
          + '<audio class="album-audio" preload="none"></audio>'
        + '</div>'
      + '</div>'
    + '</div>'
    + '<p class="work-item__tag">Album</p>'
    + '<div class="work-item__footer"><div>'
      + `<h3 class="work-item__title">${title}</h3>`
      + (desc ? `<p class="work-item__desc">${desc}</p>` : '')
    + '</div></div>'
    + '</div>';
}

// ── Album flip / mini player ─────────────────────────────────────────────────
let currentAlbumAudio = null;

// ── Album bottom sheet state (mobile) ────────────────────────────────────────
let sheetEl          = null;
let sheetBackdropEl  = null;
let sheetAudio       = null;
let sheetCurrentTrackEl = null;

function fmtTime(s) {
  if (!isFinite(s) || isNaN(s)) return '0:00';
  const m   = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec < 10 ? '0' : ''}${sec}`;
}

function triggerFlip(flipEl, toBack, audio) {
  flipEl.classList.remove('is-animating', 'to-back');
  void flipEl.offsetWidth; // reflow to restart animation
  if (toBack) flipEl.classList.add('to-back');
  flipEl.classList.add('is-animating');
  if (toBack) {
    flipEl.classList.add('is-flipped');
  } else {
    flipEl.classList.remove('is-flipped');
    if (audio && !audio.paused) audio.pause();
  }
  flipEl.addEventListener('animationend', function cleanup() {
    flipEl.classList.remove('is-animating', 'to-back');
    flipEl.removeEventListener('animationend', cleanup);
  }, { once: true });
}

function initAlbumCards(container) {
  const isMobile = window.matchMedia('(hover: none)').matches;

  container.querySelectorAll('.album-flip').forEach(flipEl => {
    const front = flipEl.querySelector('.album-flip__front');

    // ── Mobile: tap opens bottom sheet instead of flipping ──────────────────
    if (isMobile) {
      front.addEventListener('click', () => openAlbumSheet(flipEl));
      return;
    }

    // ── Desktop: full flip + mini player ────────────────────────────────────
    const backEl   = flipEl.querySelector('.album-flip__back');
    const audio    = flipEl.querySelector('.album-audio');
    const tracks   = flipEl.querySelectorAll('.album-track');
    const closeBtn = flipEl.querySelector('.album-back__close');

    const player = flipEl.querySelector('.album-player');
    const pTitle = player.querySelector('.album-player__title');
    const pCur   = player.querySelector('.album-player__time--cur');
    const pDur   = player.querySelector('.album-player__time--dur');
    const pFill  = player.querySelector('.album-player__fill');
    const pThumb = player.querySelector('.album-player__thumb');
    const pBar   = player.querySelector('.album-player__bar');
    const pPlay  = player.querySelector('.album-player__playpause');
    const pSkips = player.querySelectorAll('.album-player__skip');

    function showPlayer(trackEl) {
      pTitle.textContent = trackEl.querySelector('.album-track__title').textContent;
      player.classList.add('is-active');
    }

    function resetTracks() {
      tracks.forEach(t => {
        t.classList.remove('is-playing');
        t.querySelector('.album-track__icon').textContent = '▶';
      });
    }

    // Audio events
    audio.addEventListener('timeupdate', () => {
      if (!audio.duration) return;
      const pct = (audio.currentTime / audio.duration) * 100;
      pFill.style.width  = pct + '%';
      pThumb.style.left  = pct + '%';
      pCur.textContent   = fmtTime(audio.currentTime);
    });
    audio.addEventListener('loadedmetadata', () => {
      pDur.textContent = fmtTime(audio.duration);
    });
    audio.addEventListener('play', () => {
      pPlay.textContent = '▮▮';
      pPlay.classList.add('is-playing');
      if (currentAlbumAudio?.trackEl) {
        currentAlbumAudio.trackEl.classList.add('is-playing');
        currentAlbumAudio.trackEl.querySelector('.album-track__icon').textContent = '▮▮';
      }
    });
    audio.addEventListener('pause', () => {
      pPlay.textContent = '▶';
      pPlay.classList.remove('is-playing');
      if (currentAlbumAudio?.el === audio && currentAlbumAudio?.trackEl) {
        currentAlbumAudio.trackEl.classList.remove('is-playing');
        currentAlbumAudio.trackEl.querySelector('.album-track__icon').textContent = '▶';
      }
    });
    audio.addEventListener('ended', () => {
      resetTracks();
      pPlay.textContent = '▶';
      pPlay.classList.remove('is-playing');
      pFill.style.width = '0%';
      pThumb.style.left = '0%';
      pCur.textContent  = '0:00';
      currentAlbumAudio = null;
    });

    // Player controls
    pPlay.addEventListener('click', e => {
      e.stopPropagation();
      audio.paused ? audio.play().catch(() => {}) : audio.pause();
    });
    pBar.addEventListener('click', e => {
      e.stopPropagation();
      if (!audio.duration) return;
      const rect = pBar.getBoundingClientRect();
      const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      audio.currentTime = pct * audio.duration;
    });
    pSkips.forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const skip = parseFloat(btn.dataset.skip);
        audio.currentTime = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + skip));
      });
    });

    // Flip controls
    front.addEventListener('click', () => triggerFlip(flipEl, true, audio));
    closeBtn.addEventListener('click', e => {
      e.stopPropagation();
      triggerFlip(flipEl, false, audio);
    });
    backEl.addEventListener('click', e => {
      if (!e.target.closest('.album-track')
       && !e.target.closest('.album-back__close')
       && !e.target.closest('.album-player')) {
        triggerFlip(flipEl, false, audio);
      }
    });

    // Track click
    tracks.forEach(trackEl => {
      trackEl.addEventListener('click', () => {
        const src = trackEl.dataset.src;
        if (!src) return;

        if (currentAlbumAudio?.el !== audio) {
          currentAlbumAudio?.el.pause();
          currentAlbumAudio = null;
        }

        if (currentAlbumAudio?.el === audio && currentAlbumAudio?.trackEl === trackEl) {
          audio.paused ? audio.play().catch(() => {}) : audio.pause();
          return;
        }

        audio.pause();
        resetTracks();
        audio.src = src;
        currentAlbumAudio = { el: audio, trackEl };
        showPlayer(trackEl);
        audio.play().catch(() => {});
      });
    });
  });
}

// ── Album bottom sheet — create / open / close / player / swipe ──────────────

function createAlbumSheet() {
  if (sheetEl) return; // singleton

  sheetBackdropEl = document.createElement('div');
  sheetBackdropEl.className = 'album-sheet-backdrop';
  sheetBackdropEl.addEventListener('click', closeAlbumSheet);
  // Prevent background scroll on iOS when touching the backdrop
  sheetBackdropEl.addEventListener('touchmove', e => e.preventDefault(), { passive: false });

  sheetEl = document.createElement('div');
  sheetEl.className = 'album-sheet';
  sheetEl.setAttribute('role', 'dialog');
  sheetEl.setAttribute('aria-modal', 'true');
  sheetEl.innerHTML =
    '<div class="album-sheet__handle-wrap" aria-hidden="true">'
      + '<div class="album-sheet__handle"></div>'
    + '</div>'
    + '<div class="album-sheet__header">'
      + '<img class="album-sheet__cover" src="" alt="" aria-hidden="true">'
      + '<div class="album-sheet__info">'
        + '<div class="album-sheet__title"></div>'
        + '<div class="album-sheet__desc"></div>'
      + '</div>'
      + '<button class="album-sheet__close" aria-label="Close">✕</button>'
    + '</div>'
    + '<div class="album-sheet__tracklist" role="list"></div>'
    + '<div class="album-sheet__player">'
      + '<div class="album-sheet__player-title">—</div>'
      + '<div class="album-sheet__player-progress">'
        + '<span class="album-sheet__player-time">0:00</span>'
        + '<div class="album-sheet__player-bar">'
          + '<div class="album-sheet__player-fill"></div>'
          + '<div class="album-sheet__player-thumb"></div>'
        + '</div>'
        + '<span class="album-sheet__player-time album-sheet__player-time--dur">0:00</span>'
      + '</div>'
      + '<div class="album-sheet__player-controls">'
        + '<button class="album-sheet__player-skip" data-skip="-10" aria-label="Back 10 seconds">↩︎</button>'
        + '<button class="album-sheet__player-playpause">▶</button>'
        + '<button class="album-sheet__player-skip" data-skip="10" aria-label="Forward 10 seconds">↪︎</button>'
      + '</div>'
    + '</div>'
    + '<audio class="album-sheet__audio" preload="none"></audio>';

  document.body.appendChild(sheetBackdropEl);
  document.body.appendChild(sheetEl);

  sheetAudio = sheetEl.querySelector('.album-sheet__audio');
  sheetEl.querySelector('.album-sheet__close').addEventListener('click', closeAlbumSheet);

  initSheetPlayer();
  initSheetSwipe();
}

function openAlbumSheet(flipEl) {
  createAlbumSheet(); // idempotent

  // Pause any playing desktop audio
  if (currentAlbumAudio?.el && !currentAlbumAudio.el.paused) {
    currentAlbumAudio.el.pause();
    currentAlbumAudio = null;
  }

  // Read cover URL from front face background-image style
  const frontEl    = flipEl.querySelector('.album-flip__front');
  const bgStyle    = frontEl ? frontEl.style.backgroundImage : '';
  const coverMatch = bgStyle.match(/url\(['"]?([^'")\s]+)['"]?\)/);
  const coverUrl   = coverMatch ? coverMatch[1] : '';

  const titleEl = flipEl.querySelector('.album-back__title');
  const descEl  = flipEl.querySelector('.album-back__desc');
  const tracks  = flipEl.querySelectorAll('.album-track');

  // Populate header
  const coverImg = sheetEl.querySelector('.album-sheet__cover');
  if (coverUrl) {
    coverImg.src          = coverUrl;
    coverImg.style.display = '';
  } else {
    coverImg.src          = '';
    coverImg.style.display = 'none';
  }
  sheetEl.querySelector('.album-sheet__title').textContent = titleEl ? titleEl.textContent : '';
  sheetEl.querySelector('.album-sheet__desc').textContent  = descEl  ? descEl.textContent  : '';

  // Populate tracklist
  const tracklistEl = sheetEl.querySelector('.album-sheet__tracklist');
  tracklistEl.innerHTML = '';
  tracks.forEach((t, i) => {
    const src   = t.dataset.src || '';
    const label = t.querySelector('.album-track__title')?.textContent || '';
    const div   = document.createElement('div');
    div.className  = 'album-track';
    div.dataset.src = src;
    div.setAttribute('role', 'listitem');
    div.innerHTML =
      `<span class="album-track__num">${i + 1}</span>`
      + `<span class="album-track__title">${escHtml(label)}</span>`
      + '<span class="album-track__icon">▶</span>';
    div.addEventListener('click', () => sheetPlayTrack(div));
    tracklistEl.appendChild(div);
  });

  // Reset player to idle state
  sheetAudio.pause();
  sheetAudio.src      = '';
  sheetCurrentTrackEl = null;
  const pTitle = sheetEl.querySelector('.album-sheet__player-title');
  const pPlay  = sheetEl.querySelector('.album-sheet__player-playpause');
  const pFill  = sheetEl.querySelector('.album-sheet__player-fill');
  const pThumb = sheetEl.querySelector('.album-sheet__player-thumb');
  const pCur   = sheetEl.querySelector('.album-sheet__player-time:not(.album-sheet__player-time--dur)');
  const pDur   = sheetEl.querySelector('.album-sheet__player-time--dur');
  pTitle.textContent = '—';
  pPlay.textContent  = '▶';
  pPlay.classList.remove('is-playing');
  if (pFill)  pFill.style.width  = '0%';
  if (pThumb) pThumb.style.left  = '0%';
  if (pCur)   pCur.textContent   = '0:00';
  if (pDur)   pDur.textContent   = '0:00';

  // Open — lock scroll on both <html> and <body> (iOS Safari needs both)
  const scrollY = window.scrollY;
  document.body.dataset.sheetScrollY        = String(scrollY);
  document.documentElement.style.overflowY  = 'hidden';
  document.body.style.position              = 'fixed';
  document.body.style.top                   = `-${scrollY}px`;
  document.body.style.width                 = '100%';
  sheetBackdropEl.classList.add('is-open');
  sheetEl.classList.add('is-open');
}

function closeAlbumSheet() {
  if (!sheetEl) return;
  sheetEl.classList.remove('is-open');
  sheetBackdropEl.classList.remove('is-open');
  // Restore scroll on both <html> and <body>
  const savedY = parseInt(document.body.dataset.sheetScrollY || '0', 10);
  document.documentElement.style.overflowY = '';
  document.body.style.position             = '';
  document.body.style.top                  = '';
  document.body.style.width                = '';
  delete document.body.dataset.sheetScrollY;
  window.scrollTo(0, savedY);
  if (sheetAudio && !sheetAudio.paused) sheetAudio.pause();
  sheetCurrentTrackEl = null;
}

function sheetPlayTrack(trackEl) {
  const src = trackEl.dataset.src;
  if (!src) return;

  const tracklistEl = sheetEl.querySelector('.album-sheet__tracklist');
  const pTitle = sheetEl.querySelector('.album-sheet__player-title');

  if (sheetCurrentTrackEl === trackEl) {
    // Same track — toggle play/pause
    sheetAudio.paused ? sheetAudio.play().catch(() => {}) : sheetAudio.pause();
    return;
  }

  // New track — reset all track states, load and play
  sheetAudio.pause();
  tracklistEl.querySelectorAll('.album-track').forEach(t => {
    t.classList.remove('is-playing');
    t.querySelector('.album-track__icon').textContent = '▶';
  });

  sheetAudio.src      = src;
  sheetCurrentTrackEl = trackEl;
  pTitle.textContent  = trackEl.querySelector('.album-track__title')?.textContent || '';
  sheetAudio.play().catch(() => {});
}

function initSheetPlayer() {
  const pPlay  = sheetEl.querySelector('.album-sheet__player-playpause');
  const pBar   = sheetEl.querySelector('.album-sheet__player-bar');
  const pFill  = sheetEl.querySelector('.album-sheet__player-fill');
  const pThumb = sheetEl.querySelector('.album-sheet__player-thumb');
  const pCur   = sheetEl.querySelector('.album-sheet__player-time:not(.album-sheet__player-time--dur)');
  const pDur   = sheetEl.querySelector('.album-sheet__player-time--dur');
  const pSkips = sheetEl.querySelectorAll('.album-sheet__player-skip');

  sheetAudio.addEventListener('timeupdate', () => {
    if (!sheetAudio.duration) return;
    const pct = (sheetAudio.currentTime / sheetAudio.duration) * 100;
    pFill.style.width = pct + '%';
    pThumb.style.left = pct + '%';
    pCur.textContent  = fmtTime(sheetAudio.currentTime);
  });
  sheetAudio.addEventListener('loadedmetadata', () => {
    pDur.textContent = fmtTime(sheetAudio.duration);
  });
  sheetAudio.addEventListener('play', () => {
    pPlay.textContent = '▮▮';
    pPlay.classList.add('is-playing');
    if (sheetCurrentTrackEl) {
      sheetCurrentTrackEl.classList.add('is-playing');
      sheetCurrentTrackEl.querySelector('.album-track__icon').textContent = '▮▮';
    }
  });
  sheetAudio.addEventListener('pause', () => {
    pPlay.textContent = '▶';
    pPlay.classList.remove('is-playing');
    if (sheetCurrentTrackEl) {
      sheetCurrentTrackEl.classList.remove('is-playing');
      sheetCurrentTrackEl.querySelector('.album-track__icon').textContent = '▶';
    }
  });
  sheetAudio.addEventListener('ended', () => {
    pPlay.textContent = '▶';
    pPlay.classList.remove('is-playing');
    pFill.style.width = '0%';
    pThumb.style.left = '0%';
    pCur.textContent  = '0:00';
    if (sheetCurrentTrackEl) {
      sheetCurrentTrackEl.classList.remove('is-playing');
      sheetCurrentTrackEl.querySelector('.album-track__icon').textContent = '▶';
      sheetCurrentTrackEl = null;
    }
  });

  pPlay.addEventListener('click', e => {
    e.stopPropagation();
    sheetAudio.paused ? sheetAudio.play().catch(() => {}) : sheetAudio.pause();
  });
  pBar.addEventListener('click', e => {
    e.stopPropagation();
    if (!sheetAudio.duration) return;
    const rect = pBar.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    sheetAudio.currentTime = pct * sheetAudio.duration;
  });
  pSkips.forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const skip = parseFloat(btn.dataset.skip);
      sheetAudio.currentTime = Math.max(0, Math.min(sheetAudio.duration || 0, sheetAudio.currentTime + skip));
    });
  });
}

function initSheetSwipe() {
  let startY = 0, currentY = 0, isDragging = false;

  // Drag zones: handle bar + entire header row
  const dragZones = [
    sheetEl.querySelector('.album-sheet__handle-wrap'),
    sheetEl.querySelector('.album-sheet__header'),
  ];

  dragZones.forEach(zone => {
    zone.addEventListener('touchstart', e => {
      startY     = e.touches[0].clientY;
      currentY   = startY;
      isDragging = true;
      sheetEl.style.transition = 'none';
    }, { passive: true });

    zone.addEventListener('touchmove', e => {
      if (!isDragging) return;
      e.preventDefault(); // block iOS pull-to-refresh
      currentY = e.touches[0].clientY;
      const delta = Math.max(0, currentY - startY); // downward only
      sheetEl.style.transform = `translateY(${delta}px)`;
    }, { passive: false });

    zone.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;
      sheetEl.style.transition = '';
      sheetEl.style.transform  = '';
      if (currentY - startY > 80) closeAlbumSheet();
    });
  });
}

// ── YouTube facade: global click delegation ──────────────────────────────────
function initYouTubeFacade() {
  document.addEventListener('click', e => {
    const facade = e.target.closest('.yt-facade');
    if (!facade) return;
    const id = facade.dataset.ytId;
    if (!id) return;
    const wrapper = facade.parentElement;
    const iframe  = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
    iframe.setAttribute('allowfullscreen', '');
    iframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:none;';
    wrapper.innerHTML = '';
    wrapper.appendChild(iframe);
  });
}

// ── Main data fetch ──────────────────────────────────────────────────────────
async function loadAll() {
  const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  // Standalone projects (no album)
  const pRes = await sb.from('projects').select('*')
    .eq('visible', true).is('album_id', null)
    .order('display_order', { ascending: true })
    .order('created_at',    { ascending: true });

  // Albums
  const aRes = await sb.from('albums').select('*')
    .eq('visible', true)
    .order('display_order', { ascending: true })
    .order('created_at',    { ascending: true });

  const projects = pRes.data || [];
  const albums   = aRes.data || [];

  // Fetch tracks per album
  const albumTrackMap = {};
  for (const album of albums) {
    const tRes = await sb.from('projects').select('*')
      .eq('album_id', album.id)
      .order('display_order', { ascending: true })
      .order('created_at',    { ascending: true });
    albumTrackMap[album.id] = tRes.data || [];
  }

  // Group by category
  const grouped       = {};
  const albumGrouped  = {};
  projects.forEach(p => {
    if (!grouped[p.category]) grouped[p.category] = [];
    grouped[p.category].push(p);
  });
  albums.forEach(a => {
    if (!albumGrouped[a.category]) albumGrouped[a.category] = [];
    albumGrouped[a.category].push(a);
  });

  // Inject into DOM groups
  ['film', 'comm', 'music', 'pod'].forEach(cat => {
    const group = document.querySelector(`.work-group[data-category="${cat}"]`);
    if (!group) return;
    const track = group.querySelector('.work__track');
    if (!track) return;

    let html = '';
    (grouped[cat] || []).forEach(p => { html += buildItem(p); });
    (albumGrouped[cat] || []).forEach(a => {
      html += buildAlbumCard(a, albumTrackMap[a.id] || []);
    });

    if (html) {
      track.innerHTML = html;
      applyCldMedia(track);
      initAlbumCards(track);
    }
    // else: "Coming soon" placeholder already in HTML — leave it
  });

  // Re-apply current language to newly injected data-i18n elements
  setLang(getLang());

  // Mark tracks as loaded
  document.querySelectorAll('.work__track').forEach(t => t.classList.add('is-loaded'));

  // Scroll to hash now that layout is settled
  if (typeof window.__scrollToHash === 'function') window.__scrollToHash();
}

export function init() {
  initYouTubeFacade();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAll);
  } else {
    loadAll();
  }
}
