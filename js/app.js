// Paramètres URL sans forcer l'absolu
function getParams() {
  const p = new URLSearchParams(location.search);
  return {
    src: p.get('src') || '',
    type: (p.get('type') || '').toLowerCase(), // 'hls' | 'dash' | ''
    title: p.get('title') || 'Live Player',
    autoplay: p.get('autoplay') === '1',
    muted: p.get('muted') !== '0',             // true par défaut pour compat mobile
    poster: p.get('poster') || '',
    token: p.get('token') || '',
  };
}

function withToken(url, token) {
  if (!token) return url;
  try {
    const u = new URL(url, location.href); // respecte les chemins relatifs
    if (!u.searchParams.has('token')) u.searchParams.set('token', token);
    return u.href;
  } catch {
    const sep = url.includes('?') ? '&' : '?';
    return url + sep + 'token=' + encodeURIComponent(token);
  }
}

function toggleTheme() {
  const curr = document.documentElement.dataset.theme || 'auto';
  const next = curr === 'light' ? 'dark' : curr === 'dark' ? 'auto' : 'light';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('theme', next);
}

function applyTheme() {
  const saved = localStorage.getItem('theme') || 'auto';
  document.documentElement.dataset.theme = saved;
}

async function boot() {
  applyTheme();
  const cfg = getParams();
  document.title = cfg.title;
  document.getElementById('title').textContent = cfg.title;

  const video = document.getElementById('video');
  const status = document.getElementById('status');
  const btnMute = document.getElementById('btnMute');
  const btnFs = document.getElementById('btnFs');
  const btnPlay = document.getElementById('btnPlay');
  const loader = document.getElementById('loader');
  const loaderMsg = document.getElementById('loaderMsg');
  const themeToggle = document.getElementById('themeToggle');

  themeToggle.addEventListener('click', toggleTheme);

  if (cfg.poster) video.poster = cfg.poster;
  video.muted = cfg.muted;

  btnMute.onclick = () => {
    video.muted = !video.muted;
    btnMute.textContent = video.muted ? 'Mute' : 'Unmute';
  };

  btnFs.onclick = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen().catch(()=>{});
    } else {
      await document.exitFullscreen().catch(()=>{});
    }
  };

  btnPlay.onclick = () => {
    const p = video.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => { status.textContent = 'Lecture bloquée.'; });
    }
  };

  if (!cfg.src) {
    status.textContent = 'Paramètre ?src manquant';
    loaderMsg.textContent = 'Ajoutez ?src=URLduFlux';
    return;
  }

  if (!window.shaka || !shaka.Player.isBrowserSupported()) {
    status.textContent = 'Navigateur non supporté par Shaka';
    loaderMsg.textContent = 'Shaka non supporté par ce navigateur.';
    return;
  }

  const player = new shaka.Player(video);

  player.addEventListener('error', e => {
    const code = e.detail?.code || 'inconnue';
    status.textContent = 'Erreur: ' + code;
  });

  player.configure({
    streaming: {
      rebufferingGoal: 3,
      bufferingGoal: 10,
      retryParameters: { maxAttempts: 4, timeout: 8000, stallTimeout: 8000, connectionTimeout: 8000 }
    },
    manifest: { retryParameters: { maxAttempts: 4 } },
  });

  const src = withToken(cfg.src, cfg.token);

  try {
    loaderMsg.textContent = 'Chargement du flux…';
    await player.load(src); // Shaka auto-détecte HLS/DASH
    loader.classList.add('hidden');
    status.textContent = 'En lecture';

    if (cfg.autoplay) {
      const p = video.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => { status.textContent = 'Autoplay bloqué. Appuyez Lecture.'; });
      }
    }
  } catch (err) {
    console.error(err);
    loaderMsg.textContent = 'Échec de chargement';
    status.textContent = 'Échec de chargement';
  }

  // UI visible en paysage mobile
  function keepUI() { document.body.style.cursor = 'auto'; }
  ['mousemove','touchstart','keydown'].forEach(ev => window.addEventListener(ev, keepUI, {passive:true}));

  // Libellé mute initial
  btnMute.textContent = video.muted ? 'Mute' : 'Unmute';
}

document.addEventListener('readystatechange', () => {
  if (document.readyState === 'complete') boot();
});
