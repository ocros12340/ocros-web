const CLD_CLOUD  = 'dlbardl1q';
    const CLD_PRESET = 'fkr8z3st';

    // ── Cloudinary upload ──────────────────────────────────────────
    const uploadZone    = document.getElementById('upload-zone');
    const uploadInput   = document.getElementById('upload-input');
    const uploadIdle    = document.getElementById('upload-idle');
    const uploadProgress= document.getElementById('upload-progress');
    const uploadDone    = document.getElementById('upload-done');
    const uploadBar     = document.getElementById('upload-bar');
    const uploadStatus  = document.getElementById('upload-status');
    const uploadFilename= document.getElementById('upload-filename');
    const modalUrlInput = document.getElementById('modal-url');

    function resetUploadZone() {
      uploadIdle.style.display = '';
      uploadProgress.style.display = 'none';
      uploadDone.style.display = 'none';
      uploadBar.style.width = '0%';
      uploadInput.value = '';
    }

    const MAX_MEDIA_BYTES = 200 * 1024 * 1024;  // 200 MB
    const MAX_IMAGE_BYTES =  15 * 1024 * 1024;  //  15 MB

    async function uploadFile(file) {
      if (!file.type.startsWith('video/') && !file.type.startsWith('audio/')) {
        toast('Only video and audio files are supported.', 'error');
        return;
      }
      if (file.size > MAX_MEDIA_BYTES) {
        toast('File too large — maximum 200 MB.', 'error');
        return;
      }
      uploadIdle.style.display = 'none';
      uploadProgress.style.display = '';
      uploadDone.style.display = 'none';
      uploadBar.style.width = '0%';
      uploadStatus.textContent = 'Uploading…';

      // Cloudinary uses 'video' resource_type for both video AND audio uploads
      const isAudio = file.type.startsWith('audio/');
      const isVideo = file.type.startsWith('video/');
      const resourceType = 'video';

      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', CLD_PRESET);

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLD_CLOUD}/${resourceType}/upload`);

        xhr.upload.addEventListener('progress', e => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            uploadBar.style.width = pct + '%';
            uploadStatus.textContent = pct + '%';
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            let data;
            try { data = JSON.parse(xhr.responseText); } catch(e) {
              uploadStatus.textContent = 'Upload error — invalid response.';
              setTimeout(resetUploadZone, 2000);
              reject(new Error('Invalid JSON response')); return;
            }
            const url = data.secure_url;

            // Auto-detect media type from file and set dropdown
            const mediaTypeSelect = document.getElementById('modal-media-type');
            if (isAudio) mediaTypeSelect.value = 'audio';
            else if (isVideo) mediaTypeSelect.value = 'video';

            // Fill URL field
            modalUrlInput.value = url;

            // Show done state
            uploadProgress.style.display = 'none';
            uploadDone.style.display = '';
            uploadFilename.textContent = file.name;
            resolve(url);
          } else {
            uploadStatus.textContent = 'Upload failed.';
            setTimeout(resetUploadZone, 2000);
            reject(new Error('Upload failed: ' + xhr.status));
          }
        });

        xhr.addEventListener('error', () => {
          uploadStatus.textContent = 'Network error.';
          setTimeout(resetUploadZone, 2000);
          reject(new Error('Network error'));
        });

        xhr.send(fd);
      });
    }

    // Drag & drop
    uploadZone.addEventListener('dragover', e => {
      e.preventDefault();
      uploadZone.classList.add('drag-over');
    });
    uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
    uploadZone.addEventListener('drop', e => {
      e.preventDefault();
      uploadZone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file).catch(err => toast(err.message, 'error'));
    });

    // Click to browse
    document.getElementById('upload-browse').addEventListener('click', e => {
      e.stopPropagation();
      uploadInput.click();
    });
    uploadZone.addEventListener('click', () => {
      if (uploadDone.style.display === '') return; // already uploaded — display='' means visible
      uploadInput.click();
    });
    uploadInput.addEventListener('change', () => {
      const file = uploadInput.files[0];
      if (file) uploadFile(file).catch(err => toast(err.message, 'error'));
    });

    // Remove uploaded file
    document.getElementById('upload-remove').addEventListener('click', e => {
      e.stopPropagation();
      resetUploadZone();
      modalUrlInput.value = '';
    });

    // ── Cover image upload ─────────────────────────────────────────
    const coverZone    = document.getElementById('cover-zone');
    const coverInput   = document.getElementById('cover-input');
    const coverIdle    = document.getElementById('cover-idle');
    const coverProgress= document.getElementById('cover-progress');
    const coverDone    = document.getElementById('cover-done');
    const coverBar     = document.getElementById('cover-bar');
    const coverStatus  = document.getElementById('cover-status');
    const coverFilename= document.getElementById('cover-filename');
    const coverPreview = document.getElementById('cover-preview');
    const coverUrlInput= document.getElementById('modal-cover-url');

    function resetCoverZone() {
      coverIdle.style.display = '';
      coverProgress.style.display = 'none';
      coverDone.style.display = 'none';
      coverBar.style.width = '0%';
      coverPreview.src = '';
      coverInput.value = '';
    }

    function compressImage(file, maxPx, quality) {
      return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          URL.revokeObjectURL(url);
          let w = img.width, h = img.height;
          if (w > maxPx || h > maxPx) {
            if (w > h) { h = Math.round(h * maxPx / w); w = maxPx; }
            else       { w = Math.round(w * maxPx / h); h = maxPx; }
          }
          const c = document.createElement('canvas');
          c.width = w; c.height = h;
          c.getContext('2d').drawImage(img, 0, 0, w, h);
          c.toBlob(blob => resolve(blob || file), 'image/jpeg', quality);
        };
        img.onerror = () => resolve(file);
        img.src = url;
      });
    }

    async function uploadCover(file) {
      if (!file.type.startsWith('image/')) {
        toast('Only image files are supported for cover art.', 'error');
        return;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        toast('Image too large — maximum 15 MB.', 'error');
        return;
      }
      coverIdle.style.display = 'none';
      coverProgress.style.display = '';
      coverDone.style.display = 'none';
      coverBar.style.width = '0%';
      coverStatus.textContent = 'Compressing…';

      const compressed = await compressImage(file, 1920, 0.85);
      coverStatus.textContent = 'Uploading…';

      const fd = new FormData();
      fd.append('file', compressed, 'cover.jpg');
      fd.append('upload_preset', CLD_PRESET);

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLD_CLOUD}/image/upload`);

        xhr.upload.addEventListener('progress', e => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            coverBar.style.width = pct + '%';
            coverStatus.textContent = pct + '%';
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            let data;
            try { data = JSON.parse(xhr.responseText); } catch(e) {
              coverStatus.textContent = 'Upload error — invalid response.';
              setTimeout(resetCoverZone, 2000);
              reject(new Error('Invalid JSON response')); return;
            }
            const url = data.secure_url;
            coverUrlInput.value = url;
            coverProgress.style.display = 'none';
            coverDone.style.display = '';
            coverPreview.src = url;
            coverFilename.textContent = file.name;
            resolve(url);
          } else {
            let msg = 'Upload failed.';
            try { const d = JSON.parse(xhr.responseText); if (d.error && d.error.message) msg = d.error.message; } catch(e){}
            coverStatus.textContent = msg;
            setTimeout(resetCoverZone, 2000);
            reject(new Error(msg));
          }
        });

        xhr.addEventListener('error', () => {
          coverStatus.textContent = 'Network error.';
          setTimeout(resetCoverZone, 2000);
          reject(new Error('Network error'));
        });

        xhr.send(fd);
      });
    }

    coverZone.addEventListener('dragover', e => { e.preventDefault(); coverZone.classList.add('drag-over'); });
    coverZone.addEventListener('dragleave', () => coverZone.classList.remove('drag-over'));
    coverZone.addEventListener('drop', e => {
      e.preventDefault(); coverZone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) uploadCover(file).catch(err => toast(err.message, 'error'));
    });
    document.getElementById('cover-browse').addEventListener('click', e => { e.stopPropagation(); coverInput.click(); });
    coverZone.addEventListener('click', () => { if (coverDone.style.display === '') return; coverInput.click(); });
    coverInput.addEventListener('change', () => {
      const file = coverInput.files[0];
      if (file) uploadCover(file).catch(err => toast(err.message, 'error'));
    });
    document.getElementById('cover-remove').addEventListener('click', e => {
      e.stopPropagation(); resetCoverZone(); coverUrlInput.value = '';
    });

    // Show existing cover when editing
    function loadExistingCover(url) {
      if (!url) { resetCoverZone(); return; }
      coverUrlInput.value = url;
      coverIdle.style.display = 'none';
      coverProgress.style.display = 'none';
      coverDone.style.display = '';
      coverPreview.src = url;
      coverFilename.textContent = 'Current cover';
    }

    // ── Album cover upload ─────────────────────────────────────────
    const albumCoverZone     = document.getElementById('album-cover-zone');
    const albumCoverInput    = document.getElementById('album-cover-input');
    const albumCoverIdle     = document.getElementById('album-cover-idle');
    const albumCoverProgress = document.getElementById('album-cover-progress');
    const albumCoverDone     = document.getElementById('album-cover-done');
    const albumCoverBar      = document.getElementById('album-cover-bar');
    const albumCoverStatus   = document.getElementById('album-cover-status');
    const albumCoverFilename = document.getElementById('album-cover-filename');
    const albumCoverPreview  = document.getElementById('album-cover-preview');
    const albumCoverUrlInput = document.getElementById('album-modal-cover-url');

    function resetAlbumCoverZone() {
      albumCoverIdle.style.display = ''; albumCoverProgress.style.display = 'none';
      albumCoverDone.style.display = 'none'; albumCoverBar.style.width = '0%';
      albumCoverPreview.src = ''; albumCoverInput.value = ''; albumCoverUrlInput.value = '';
    }
    function loadExistingAlbumCover(url) {
      if (!url) { resetAlbumCoverZone(); return; }
      albumCoverUrlInput.value = url; albumCoverIdle.style.display = 'none';
      albumCoverDone.style.display = ''; albumCoverPreview.src = url;
      albumCoverFilename.textContent = 'Current cover';
    }
    async function uploadAlbumCover(file) {
      if (!file.type.startsWith('image/')) {
        toast('Only image files are supported for album cover.', 'error');
        return;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        toast('Image too large — maximum 15 MB.', 'error');
        return;
      }
      albumCoverIdle.style.display = 'none'; albumCoverProgress.style.display = '';
      albumCoverDone.style.display = 'none'; albumCoverBar.style.width = '0%';
      albumCoverStatus.textContent = 'Compressing…';
      const compressed = await compressImage(file, 1920, 0.85);
      albumCoverStatus.textContent = 'Uploading…';
      const fd = new FormData(); fd.append('file', compressed, 'cover.jpg'); fd.append('upload_preset', CLD_PRESET);
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLD_CLOUD}/image/upload`);
        xhr.upload.addEventListener('progress', e => {
          if (e.lengthComputable) { const pct = Math.round((e.loaded/e.total)*100); albumCoverBar.style.width=pct+'%'; albumCoverStatus.textContent=pct+'%'; }
        });
        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            let data;
            try { data = JSON.parse(xhr.responseText); } catch(e) {
              albumCoverStatus.textContent = 'Upload error — invalid response.';
              setTimeout(resetAlbumCoverZone, 2000); reject(new Error('Invalid JSON response')); return;
            }
            albumCoverUrlInput.value = data.secure_url; albumCoverProgress.style.display = 'none';
            albumCoverDone.style.display = ''; albumCoverPreview.src = data.secure_url;
            albumCoverFilename.textContent = file.name; resolve(data.secure_url);
          } else {
            let msg = 'Upload failed.';
            try { const d = JSON.parse(xhr.responseText); if (d.error) msg = d.error.message; } catch(e) {}
            albumCoverStatus.textContent = msg; setTimeout(resetAlbumCoverZone, 2000); reject(new Error(msg));
          }
        });
        xhr.addEventListener('error', () => { albumCoverStatus.textContent = 'Network error.'; setTimeout(resetAlbumCoverZone, 2000); reject(new Error('Network error')); });
        xhr.send(fd);
      });
    }
    albumCoverZone.addEventListener('click', () => {
      if (albumCoverDone.style.display === '') return;
      albumCoverInput.click();
    });
    albumCoverZone.addEventListener('dragover', e => { e.preventDefault(); albumCoverZone.classList.add('drag-over'); });
    albumCoverZone.addEventListener('dragleave', () => albumCoverZone.classList.remove('drag-over'));
    albumCoverZone.addEventListener('drop', e => {
      e.preventDefault(); albumCoverZone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) uploadAlbumCover(file).catch(err => toast(err.message, 'error'));
    });
    document.getElementById('album-cover-browse').addEventListener('click', e => { e.stopPropagation(); albumCoverInput.click(); });
    albumCoverInput.addEventListener('change', () => { const f = albumCoverInput.files[0]; if (f) uploadAlbumCover(f).catch(err => toast(err.message,'error')); });
    document.getElementById('album-cover-remove').addEventListener('click', e => { e.stopPropagation(); resetAlbumCoverZone(); });

    // ── Track audio upload ─────────────────────────────────────────
    const trackAudioZone     = document.getElementById('track-audio-zone');
    const trackAudioInput    = document.getElementById('track-audio-input');
    const trackAudioIdle     = document.getElementById('track-audio-idle');
    const trackAudioProgress = document.getElementById('track-audio-progress');
    const trackAudioDone     = document.getElementById('track-audio-done');
    const trackAudioBar      = document.getElementById('track-audio-bar');
    const trackAudioStatus   = document.getElementById('track-audio-status');
    const trackAudioFilename = document.getElementById('track-audio-filename');
    const trackAudioUrlInput = document.getElementById('track-modal-url');

    function resetTrackAudioZone() {
      trackAudioIdle.style.display = ''; trackAudioProgress.style.display = 'none';
      trackAudioDone.style.display = 'none'; trackAudioBar.style.width = '0%';
      trackAudioInput.value = ''; trackAudioUrlInput.value = '';
    }
    async function uploadTrackAudio(file) {
      if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) {
        toast('Only audio files are supported for track uploads.', 'error');
        return;
      }
      if (file.size > MAX_MEDIA_BYTES) {
        toast('File too large — maximum 200 MB.', 'error');
        return;
      }
      trackAudioIdle.style.display = 'none'; trackAudioProgress.style.display = '';
      trackAudioDone.style.display = 'none'; trackAudioBar.style.width = '0%';
      trackAudioStatus.textContent = 'Uploading…';
      const fd = new FormData(); fd.append('file', file); fd.append('upload_preset', CLD_PRESET);
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLD_CLOUD}/video/upload`);
        xhr.upload.addEventListener('progress', e => {
          if (e.lengthComputable) { const pct = Math.round((e.loaded/e.total)*100); trackAudioBar.style.width=pct+'%'; trackAudioStatus.textContent=pct+'%'; }
        });
        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            let data;
            try { data = JSON.parse(xhr.responseText); } catch(e) {
              trackAudioStatus.textContent = 'Upload error — invalid response.';
              setTimeout(resetTrackAudioZone, 2000); reject(new Error('Invalid JSON response')); return;
            }
            trackAudioUrlInput.value = data.secure_url; trackAudioProgress.style.display = 'none';
            trackAudioDone.style.display = ''; trackAudioFilename.textContent = file.name; resolve(data.secure_url);
          } else {
            let msg = 'Upload failed.';
            try { const d = JSON.parse(xhr.responseText); if (d.error) msg = d.error.message; } catch(e) {}
            trackAudioStatus.textContent = msg; setTimeout(resetTrackAudioZone, 2000); reject(new Error(msg));
          }
        });
        xhr.addEventListener('error', () => { trackAudioStatus.textContent = 'Network error.'; setTimeout(resetTrackAudioZone, 2000); reject(new Error('Network error')); });
        xhr.send(fd);
      });
    }
    trackAudioZone.addEventListener('click', () => {
      if (trackAudioDone.style.display === '') return;
      trackAudioInput.click();
    });
    trackAudioZone.addEventListener('dragover', e => { e.preventDefault(); trackAudioZone.classList.add('drag-over'); });
    trackAudioZone.addEventListener('dragleave', () => trackAudioZone.classList.remove('drag-over'));
    trackAudioZone.addEventListener('drop', e => {
      e.preventDefault(); trackAudioZone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) uploadTrackAudio(file).catch(err => toast(err.message, 'error'));
    });
    document.getElementById('track-audio-browse').addEventListener('click', e => { e.stopPropagation(); trackAudioInput.click(); });
    trackAudioInput.addEventListener('change', () => { const f = trackAudioInput.files[0]; if (f) uploadTrackAudio(f).catch(err => toast(err.message,'error')); });
    document.getElementById('track-audio-remove').addEventListener('click', e => { e.stopPropagation(); resetTrackAudioZone(); });

    const SUPABASE_URL = 'https://zspmnnrmcfcxdudmiegc.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_hex89ktAS2X0tyrSenty4g_pPlrTACL';
    const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    const CATEGORIES = [
      { id: 'film',  label: 'Film / Video Sound Design', color: '#5BADA8', defaultType: 'video' },
      { id: 'comm',  label: 'Commercial & Brand', color: '#C4956A', defaultType: 'video' },
      { id: 'music', label: 'Film Score Composition',   color: '#9B7BB5', defaultType: 'audio' },
      { id: 'pod',   label: 'Podcast Production',       color: '#7BA5C4', defaultType: 'audio' },
    ];

    let projects = [];
    let albums   = [];
    let deleteTarget = null; // { type: 'project'|'album'|'track', id }

    // ── HTML escaping helpers ──────────────────────────────────────────
    function escHtml(s) {
      return String(s == null ? '' : s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }
    // Safe for double-quoted HTML attributes (data-*): escapes & and "
    function escAttr(s) {
      return String(s == null ? '' : s)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    // ── Toast ──────────────────────────────────────────────────────
    function toast(msg, type = '') {
      const el = document.getElementById('toast');
      el.textContent = msg;
      el.className = 'toast show ' + type;
      setTimeout(() => { el.className = 'toast'; }, 3000);
    }

    // ── Admin identity (hardcoded — single-user panel) ─────────────
    const ADMIN_EMAIL = 'okros.sound@gmail.com';

    // ── Login (brute-force protection: 5 attempts → 30s lockout) ──────
    // Stored in sessionStorage — page reload does NOT reset the lockout counter
    function _getAttempts()  { return parseInt(sessionStorage.getItem('_okros_attempts') || '0', 10); }
    function _getLocked()    { return parseInt(sessionStorage.getItem('_okros_locked')   || '0', 10); }
    function _setAttempts(n) { sessionStorage.setItem('_okros_attempts', n); }
    function _setLocked(t)   { sessionStorage.setItem('_okros_locked', t);   }

    async function login() {
      const pw = document.getElementById('pw-input').value.trim();
      const errEl = document.getElementById('login-error');
      errEl.textContent = '';
      if (!pw) return;

      // Brute-force lockout check
      const now = Date.now();
      const _lockedUntil = _getLocked();
      if (now < _lockedUntil) {
        const secs = Math.ceil((_lockedUntil - now) / 1000);
        errEl.textContent = `Too many attempts. Try again in ${secs}s.`;
        return;
      }

      // Supabase Auth — replaces client-side SHA-256 comparison
      const { error } = await sb.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: pw
      });

      if (error) {
        const att = _getAttempts() + 1;
        _setAttempts(att);
        if (att >= 5) {
          _setLocked(Date.now() + 30_000);
          _setAttempts(0);
          errEl.textContent = 'Too many attempts. Locked for 30 seconds.';
        } else {
          errEl.textContent = `Incorrect password. (${5 - att} attempt${5 - att === 1 ? '' : 's'} left)`;
        }
        document.getElementById('pw-input').value = '';
        return;
      }

      _setAttempts(0);
      _setLocked(0);
      showDashboard();
    }

    async function logout() {
      try { await sb.auth.signOut(); } catch(e) { console.warn('signOut error:', e.message); }
      document.getElementById('dashboard').style.display = 'none';
      document.getElementById('login-screen').style.display = 'flex';
      document.getElementById('pw-input').value = '';
    }

    function showDashboard() {
      document.getElementById('login-screen').style.display = 'none';
      document.getElementById('dashboard').style.display = 'block';
      loadData();
    }

    // ── Load & render ───────────────────────────────────────────────
    async function loadData() {
      try {
        const [pRes, aRes] = await Promise.all([
          sb.from('projects').select('*').is('album_id', null)
            .order('display_order', { ascending: true }).order('created_at', { ascending: true }),
          sb.from('albums').select('*')
            .order('display_order', { ascending: true }).order('created_at', { ascending: true }),
        ]);
        if (pRes.error) { toast('Failed to load projects', 'error'); return; }
        if (aRes.error) { toast('Failed to load albums', 'error'); return; }
        projects = pRes.data || [];
        albums   = aRes.data || [];
        renderDashboard();
      } catch (err) {
        toast('Failed to load data: ' + err.message, 'error');
      }
    }

    function renderDashboard() {
      const main = document.getElementById('admin-main');
      main.innerHTML = '';

      CATEGORIES.forEach(cat => {
        const catProjects = projects.filter(p => p.category === cat.id);
        const catAlbums   = albums.filter(a => a.category === cat.id);
        const total = catProjects.length + catAlbums.length;
        const section = document.createElement('div');
        section.className = 'category-section';
        section.innerHTML = `
          <div class="category-header">
            <div class="category-header__left">
              <div class="category-dot" style="background:${cat.color}"></div>
              <span class="category-title">${cat.label}</span>
              <span class="category-count">${total}</span>
            </div>
            <div class="section-btn-group">
              <button class="btn btn-ghost" style="font-size:0.75rem;padding:7px 14px"
                data-action="add-project" data-category="${cat.id}">+ Add project</button>
              <button class="btn btn-ghost" style="font-size:0.75rem;padding:7px 14px"
                data-action="add-album" data-category="${cat.id}">+ Add album</button>
            </div>
          </div>
          <div class="projects-grid" id="grid-${cat.id}">
            ${total === 0
              ? `<div class="empty-state">No projects yet — click "Add project" or "Add album" to get started</div>`
              : [
                  ...catProjects.map(p => projectCardHTML(p)),
                  ...catAlbums.map(a => albumCardHTML(a))
                ].join('')
            }
          </div>
        `;
        main.appendChild(section);
      });

      loadAllAlbumTracks();
    }

    function projectCardHTML(p) {
      const isEmpty = !p.title;
      const eId    = escHtml(p.id);
      const eTitle = escHtml(p.title || '(no title)');
      const eType  = escHtml(p.media_type);
      const eUrl   = escHtml(p.cloudinary_url || '— no URL yet');
      const eDesc  = escHtml(p.description);
      return `
        <div class="project-card ${p.visible ? '' : 'hidden-project'}" data-id="${eId}">
          <div class="project-card__info">
            <div class="project-card__title ${isEmpty ? 'empty' : ''}">${eTitle}</div>
            <div class="project-card__meta">
              <span class="tag tag-${eType}">${eType}</span>
              ${!p.visible ? '<span class="tag tag-hidden">hidden</span>' : ''}
              <span class="project-card__url">${eUrl}</span>
            </div>
            ${p.description ? `<div style="font-size:0.78rem;color:var(--text-muted);margin-top:2px">${eDesc}</div>` : ''}
          </div>
          <div class="project-card__actions">
            <button class="btn btn-edit" data-action="edit-project" data-id="${eId}">Edit</button>
            <button class="btn btn-danger" data-action="delete" data-type="project" data-id="${eId}" data-title="${escAttr(p.title || 'this project')}">Delete</button>
          </div>
        </div>
      `;
    }

    // ── Add / Edit modal ───────────────────────────────────────────
    function openAddModal(categoryId) {
      const cat = CATEGORIES.find(c => c.id === categoryId);
      document.getElementById('modal-title').textContent = `Add project — ${cat.label}`;
      document.getElementById('modal-id').value = '';
      document.getElementById('modal-category').value = categoryId;
      document.getElementById('modal-proj-title').value = '';
      document.getElementById('modal-desc').value = '';
      document.getElementById('modal-url').value = '';
      document.getElementById('modal-media-type').value = cat.defaultType;
      document.getElementById('modal-order').value =
        projects.filter(p => p.category === categoryId).length +
        albums.filter(a => a.category === categoryId).length;
      document.getElementById('modal-visible').checked = true;
      resetUploadZone();
      resetCoverZone();
      openModal('project-modal');
    }

    function openEditModal(id) {
      const p = projects.find(p => p.id === id);
      if (!p) return;
      const cat = CATEGORIES.find(c => c.id === p.category);
      document.getElementById('modal-title').textContent = `Edit — ${p.title || 'project'}`;
      document.getElementById('modal-id').value = p.id;
      document.getElementById('modal-category').value = p.category;
      document.getElementById('modal-proj-title').value = p.title;
      document.getElementById('modal-desc').value = p.description ?? '';
      document.getElementById('modal-url').value = p.cloudinary_url ?? '';
      document.getElementById('modal-media-type').value = p.media_type;
      document.getElementById('modal-order').value = p.display_order;
      document.getElementById('modal-visible').checked = p.visible;
      resetUploadZone();
      loadExistingCover(p.cover_image_url || '');
      openModal('project-modal');
    }

    async function saveProject() {
      const id       = document.getElementById('modal-id').value;
      const category = document.getElementById('modal-category').value;
      const title    = document.getElementById('modal-proj-title').value.trim();
      const desc     = document.getElementById('modal-desc').value.trim();
      const url      = document.getElementById('modal-url').value.trim();
      const type     = document.getElementById('modal-media-type').value;
      const order    = parseInt(document.getElementById('modal-order').value) || 0;
      const visible  = document.getElementById('modal-visible').checked;
      const coverUrl = document.getElementById('modal-cover-url').value.trim();

      if (!title) { toast('Title is required', 'error'); return; }

      const btn = document.getElementById('modal-save');
      btn.disabled = true;
      try {
        const payload = { category, title, description: desc, cloudinary_url: url,
                          media_type: type, display_order: order, visible,
                          cover_image_url: coverUrl };
        let error;
        if (id) {
          ({ error } = await sb.from('projects').update(payload).eq('id', id));
        } else {
          ({ error } = await sb.from('projects').insert(payload));
        }
        if (error) { toast('Save failed: ' + error.message, 'error'); btn.disabled = false; return; }
        closeModal('project-modal');
        toast(id ? 'Project updated ✓' : 'Project added ✓', 'success');
        loadData();
      } catch(e) {
        toast('Save failed — network error.', 'error');
        btn.disabled = false;
      }
    }

    // ── Album card HTML ────────────────────────────────────────────
    function albumCardHTML(a) {
      const eId   = escHtml(a.id);
      const eTitle = escHtml(a.title || '(no title)');
      const eDesc  = escHtml(a.description);
      return `
        <div class="album-admin-card ${a.visible ? '' : 'hidden-album'}" id="album-card-${eId}">
          <div class="album-admin-header">
            <div class="album-admin-info">
              <div class="album-admin-title">
                <span class="tag tag-album" style="margin-right:8px;font-size:0.6rem">Album</span>${eTitle}
              </div>
              <div class="album-admin-meta">
                ${!a.visible ? '<span class="tag tag-hidden">hidden</span>' : ''}
                ${a.description ? `<span>${eDesc}</span>` : ''}
              </div>
            </div>
            <div class="album-admin-actions">
              <button class="btn btn-edit" data-action="edit-album" data-id="${eId}">Edit</button>
              <button class="btn btn-danger" data-action="delete" data-type="album" data-id="${eId}" data-title="${escAttr(a.title||'this album')}">Delete</button>
            </div>
          </div>
          <div class="album-tracks-list" id="tracks-${eId}">
            <div style="color:var(--text-muted);font-size:0.8rem;padding:4px 0">Loading tracks…</div>
          </div>
        </div>
      `;
    }

    async function loadAllAlbumTracks() {
      if (!albums.length) return;
      const { data: allTracks, error: tErr } = await sb.from('projects').select('*')
        .in('album_id', albums.map(a => a.id))
        .order('display_order', { ascending: true })
        .order('created_at',    { ascending: true });
      if (tErr) { toast('Failed to load tracks: ' + tErr.message, 'error'); return; }
      const trackMap = {};
      (allTracks || []).forEach(t => {
        if (!trackMap[t.album_id]) trackMap[t.album_id] = [];
        trackMap[t.album_id].push(t);
      });
      for (const a of albums) {
        const container = document.getElementById('tracks-' + a.id);
        if (!container) continue;
        const tracks    = trackMap[a.id] || [];
        const eAlbumId  = escHtml(a.id);
        const eCategory = escHtml(a.category);
        const trackHTML = tracks.map((t, i) => {
          const eTId   = escHtml(t.id);
          const eTitle = escHtml(t.title || '(no title)');
          return `
          <div class="track-admin-item">
            <div class="track-num">${i + 1}</div>
            <div class="track-title-cell">${eTitle}</div>
            <div class="track-actions">
              <button class="btn btn-edit" data-action="edit-track" data-id="${eTId}" data-album-id="${eAlbumId}">Edit</button>
              <button class="btn btn-danger" data-action="delete" data-type="track" data-id="${eTId}" data-title="${escAttr(t.title||'this track')}">Delete</button>
            </div>
          </div>
        `;}).join('');
        container.innerHTML = trackHTML + `<button class="add-track-btn" data-action="add-track" data-album-id="${eAlbumId}" data-category="${eCategory}">+ Add track</button>`;
      }
    }

    // ── Album modal ────────────────────────────────────────────────
    function openAddAlbumModal(catId) {
      document.getElementById('album-modal-title').textContent = 'Add album';
      document.getElementById('album-modal-id').value = '';
      document.getElementById('album-modal-category').value = catId;
      document.getElementById('album-modal-name').value = '';
      document.getElementById('album-modal-desc').value = '';
      document.getElementById('album-modal-order').value =
        projects.filter(p => p.category === catId).length +
        albums.filter(a => a.category === catId).length;
      document.getElementById('album-modal-visible').checked = true;
      resetAlbumCoverZone();
      openModal('album-modal');
    }

    function openEditAlbumModal(albumId) {
      const a = albums.find(a => a.id === albumId);
      if (!a) return;
      document.getElementById('album-modal-title').textContent = 'Edit album — ' + (a.title || 'album');
      document.getElementById('album-modal-id').value = a.id;
      document.getElementById('album-modal-category').value = a.category;
      document.getElementById('album-modal-name').value = a.title ?? '';
      document.getElementById('album-modal-desc').value = a.description ?? '';
      document.getElementById('album-modal-order').value = a.display_order;
      document.getElementById('album-modal-visible').checked = a.visible;
      loadExistingAlbumCover(a.cover_image_url || '');
      openModal('album-modal');
    }

    async function saveAlbum() {
      const id      = document.getElementById('album-modal-id').value;
      const cat     = document.getElementById('album-modal-category').value;
      const title   = document.getElementById('album-modal-name').value.trim();
      const desc    = document.getElementById('album-modal-desc').value.trim();
      const order   = parseInt(document.getElementById('album-modal-order').value) || 0;
      const visible = document.getElementById('album-modal-visible').checked;
      const cover   = document.getElementById('album-modal-cover-url').value.trim();

      if (!title) { toast('Album title is required', 'error'); return; }

      const btn = document.getElementById('album-modal-save');
      btn.disabled = true;
      try {
        const payload = { category: cat, title, description: desc, cover_image_url: cover, display_order: order, visible };
        let error;
        if (id) {
          ({ error } = await sb.from('albums').update(payload).eq('id', id));
        } else {
          ({ error } = await sb.from('albums').insert(payload));
        }
        if (error) { toast('Save failed: ' + error.message, 'error'); btn.disabled = false; return; }
        closeModal('album-modal');
        toast(id ? 'Album updated ✓' : 'Album added ✓', 'success');
        loadData();
      } catch(e) {
        toast('Save failed — network error.', 'error');
        btn.disabled = false;
      }
    }

    // ── Track modal ────────────────────────────────────────────────
    function openAddTrackModal(albumId, catId) {
      document.getElementById('track-modal-title').textContent = 'Add track';
      document.getElementById('track-modal-id').value = '';
      document.getElementById('track-modal-album-id').value = albumId;
      document.getElementById('track-modal-category').value = catId;
      document.getElementById('track-modal-name').value = '';
      document.getElementById('track-modal-url').value = '';
      const container = document.getElementById('tracks-' + albumId);
      const count = container ? container.querySelectorAll('.track-admin-item').length : 0;
      document.getElementById('track-modal-order').value = count;
      resetTrackAudioZone();
      openModal('track-modal');
    }

    async function openEditTrackModal(trackId, albumId) {
      const { data: t, error } = await sb.from('projects').select('*').eq('id', trackId).single();
      if (error) { toast('Failed to load track: ' + error.message, 'error'); return; }
      if (!t) return;
      document.getElementById('track-modal-title').textContent = 'Edit track — ' + (t.title || 'track');
      document.getElementById('track-modal-id').value = t.id;
      document.getElementById('track-modal-album-id').value = albumId;
      document.getElementById('track-modal-category').value = t.category;
      document.getElementById('track-modal-name').value = t.title ?? '';
      document.getElementById('track-modal-url').value = t.cloudinary_url ?? '';
      document.getElementById('track-modal-order').value = t.display_order;
      if (t.cloudinary_url) {
        trackAudioIdle.style.display = 'none';
        trackAudioDone.style.display = '';
        trackAudioFilename.textContent = 'Current audio file';
      } else {
        resetTrackAudioZone();
      }
      openModal('track-modal');
    }

    async function saveTrack() {
      const id      = document.getElementById('track-modal-id').value;
      const albumId = document.getElementById('track-modal-album-id').value;
      const cat     = document.getElementById('track-modal-category').value;
      const title   = document.getElementById('track-modal-name').value.trim();
      const url     = document.getElementById('track-modal-url').value.trim();
      const order   = parseInt(document.getElementById('track-modal-order').value) || 0;

      if (!title) { toast('Track title is required', 'error'); return; }

      const btn = document.getElementById('track-modal-save');
      btn.disabled = true;
      try {
        // Base payload — excludes visible/description so edits don't overwrite them
        const basePayload = { album_id: albumId, category: cat, title,
                              cloudinary_url: url, media_type: 'audio',
                              display_order: order, cover_image_url: '' };
        let error;
        if (id) {
          ({ error } = await sb.from('projects').update(basePayload).eq('id', id));
        } else {
          ({ error } = await sb.from('projects').insert({ ...basePayload, description: '', visible: true }));
        }
        if (error) { toast('Save failed: ' + error.message, 'error'); btn.disabled = false; return; }
      } catch(e) {
        toast('Save failed — network error.', 'error');
        btn.disabled = false; return;
      }
      closeModal('track-modal');
      toast(id ? 'Track updated ✓' : 'Track added ✓', 'success');
      loadData();
    }

    // ── Delete ─────────────────────────────────────────────────────
    function confirmDelete(type, id, name) {
      deleteTarget = { type, id };
      document.getElementById('confirm-title').textContent = name;
      document.getElementById('confirm-overlay').classList.add('open');
    }

    async function doDelete() {
      if (!deleteTarget) return;
      const { type, id } = deleteTarget;
      document.getElementById('confirm-overlay').classList.remove('open');
      deleteTarget = null;

      let error;
      if (type === 'album') {
        const { error: tracksErr } = await sb.from('projects').delete().eq('album_id', id); // delete tracks first
        if (tracksErr) { toast('Delete failed: ' + tracksErr.message, 'error'); return; }
        ({ error } = await sb.from('albums').delete().eq('id', id));
        if (error) { toast('Delete failed', 'error'); return; }
        toast('Album deleted', 'success');
      } else {
        ({ error } = await sb.from('projects').delete().eq('id', id));
        if (error) { toast('Delete failed', 'error'); return; }
        toast(type === 'track' ? 'Track deleted' : 'Project deleted', 'success');
      }
      loadData();
    }

    // ── Change password ────────────────────────────────────────────
    async function savePassword() {
      const np = document.getElementById('new-pw').value;
      const cp = document.getElementById('confirm-pw').value;
      const errEl = document.getElementById('pw-error');
      errEl.textContent = '';
      if (!np) { errEl.textContent = 'Enter a new password.'; return; }
      if (np !== cp) { errEl.textContent = 'Passwords do not match.'; return; }
      if (np.length < 6) { errEl.textContent = 'Minimum 6 characters.'; return; }

      // Updates the Supabase Auth user password (replaces settings-table hash)
      try {
        const { error } = await sb.auth.updateUser({ password: np });
        if (error) { errEl.textContent = 'Save failed: ' + error.message; return; }
        closeModal('pw-modal');
        document.getElementById('new-pw').value = '';
        document.getElementById('confirm-pw').value = '';
        toast('Password changed ✓', 'success');
      } catch(e) {
        errEl.textContent = 'Save failed — network error.';
      }
    }

    // ── Modal helpers ──────────────────────────────────────────────
    function openModal(id) { document.getElementById(id).classList.add('open'); }
    function closeModal(id) { document.getElementById(id).classList.remove('open'); }

    // ── Event listeners ────────────────────────────────────────────
    document.getElementById('login-btn').addEventListener('click', login);
    document.getElementById('pw-input').addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
    document.getElementById('logout-btn').addEventListener('click', logout);
    document.getElementById('change-pw-btn').addEventListener('click', () => openModal('pw-modal'));

    document.getElementById('modal-close').addEventListener('click', () => closeModal('project-modal'));
    document.getElementById('modal-cancel').addEventListener('click', () => closeModal('project-modal'));
    document.getElementById('modal-save').addEventListener('click', saveProject);

    document.getElementById('pw-modal-close').addEventListener('click', () => closeModal('pw-modal'));
    document.getElementById('pw-cancel').addEventListener('click', () => closeModal('pw-modal'));
    document.getElementById('pw-save').addEventListener('click', savePassword);

    document.getElementById('confirm-cancel').addEventListener('click', () => {
      document.getElementById('confirm-overlay').classList.remove('open');
      deleteTarget = null;
    });
    document.getElementById('confirm-ok').addEventListener('click', doDelete);

    // Album modal
    document.getElementById('album-modal-close').addEventListener('click', () => closeModal('album-modal'));
    document.getElementById('album-modal-cancel').addEventListener('click', () => closeModal('album-modal'));
    document.getElementById('album-modal-save').addEventListener('click', saveAlbum);

    // Track modal
    document.getElementById('track-modal-close').addEventListener('click', () => closeModal('track-modal'));
    document.getElementById('track-modal-cancel').addEventListener('click', () => closeModal('track-modal'));
    document.getElementById('track-modal-save').addEventListener('click', saveTrack);

    // Close modal on overlay click
    ['project-modal', 'pw-modal', 'album-modal', 'track-modal'].forEach(id => {
      document.getElementById(id).addEventListener('click', e => {
        if (e.target === e.currentTarget) closeModal(id);
      });
    });

    // Close open modal on Escape key
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      ['project-modal', 'pw-modal', 'album-modal', 'track-modal'].forEach(id => {
        const el = document.getElementById(id);
        if (el && el.classList.contains('open')) closeModal(id);
      });
    });

    // ── Event delegation for dynamically rendered admin cards ──────────
    document.getElementById('admin-main').addEventListener('click', e => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      if      (action === 'edit-project')  openEditModal(btn.dataset.id);
      else if (action === 'delete')        confirmDelete(btn.dataset.type, btn.dataset.id, btn.dataset.title);
      else if (action === 'edit-album')    openEditAlbumModal(btn.dataset.id);
      else if (action === 'edit-track')    openEditTrackModal(btn.dataset.id, btn.dataset.albumId);
      else if (action === 'add-track')     openAddTrackModal(btn.dataset.albumId, btn.dataset.category);
      else if (action === 'add-project')   openAddModal(btn.dataset.category);
      else if (action === 'add-album')     openAddAlbumModal(btn.dataset.category);
    });

    // ── Auto-login if Supabase session exists (persists across reloads) ──
    (async () => {
      const { data: { session } } = await sb.auth.getSession();
      if (session) showDashboard();
    })();

    // ── Session expiry guard — redirect to login when token expires ──
    sb.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        document.getElementById('dashboard').style.display = 'none';
        document.getElementById('login-screen').style.display = 'flex';
      }
    });
