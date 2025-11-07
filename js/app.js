// app.js
(function(){
  const $ = (id) => document.getElementById(id);
  function getParams() {
    const p = new URLSearchParams(location.search);
    return {
      src: p.get('src') || '',
      type: (p.get('type') || '').toLowerCase(),
      title: p.get('title') || 'Live Player',
      autoplay: p.get('autoplay') === '1',
      muted: p.get('muted') !== '0',
      poster: p.get('poster') || ''
    };
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
  function mixedContent(src) {
    return location.protocol === 'https:' && /^http:/.test(src);
  }

  function wireUI(video, status) {
    const btnMute = $('btnMute');
    const btnFs = $('btnFs');
    const btnPlay = $('btnPlay');
    const themeToggle = $('themeToggle');
    themeToggle.onclick = toggleTheme;
    btnMute.onclick = () => { video.muted = !video.muted; btnMute.textContent = video.muted ? 'Mute' : 'Unmute'; };
    btnFs.onclick = async () => {
      if (!document.fullscreenElement) { await document.documentElement.requestFullscreen().catch(()=>{}); }
      else { await document.exitFullscreen().catch(()=>{}); }
    };
    btnPlay.onclick = () => {
      const p = video.play();
      if (p && p.catch) p.catch(()=>{ status.textContent='Lecture bloquée.'; });
    };
  }

  async function start() {
    applyTheme();
    const cfg = getParams();
    document.title = cfg.title;
    $('title').textContent = cfg.title;

    const video = $('video');
    const status = $('status');
    const loader = $('loader');
    const loaderMsg = $('loaderMsg');

    if (cfg.poster) video.poster = cfg.poster;
    video.muted = cfg.muted;
    $('btnMute').textContent = video.muted ? 'Mute' : 'Unmute';

    wireUI(video, status);

    if (!cfg.src) {
      loaderMsg.textContent = 'Ajoutez ?src=URLduFlux';
      status.textContent = 'Paramètre ?src manquant';
      return;
    }
    if (mixedContent(cfg.src)) {
      loaderMsg.textContent = 'Mixed content: flux http sur page https';
      status.textContent = 'Mixed content bloqué';
      return;
    }

    loaderMsg.textContent = 'Chargement…';

    // Essaye Shaka, sinon fallback natif
    try {
      const shaka = await window.shakaReady;
      if (shaka && shaka.Player && shaka.Player.isBrowserSupported()) {
        if (shaka.polyfill) shaka.polyfill.installAll();
        const player = new shaka.Player(video);
        player.addEventListener('error', e => {
          const code = e.detail?.code || 'inconnue';
          status.textContent = 'Erreur: ' + code;
          console.warn('Shaka error', e);
        });
        await player.load(cfg.src);
        loader.classList.add('hidden');
        status.textContent = 'En lecture';
        if (cfg.autoplay) {
          const p = video.play();
          if (p && p.catch) p.catch(()=>{ status.textContent='Autoplay bloqué. Appuyez Lecture.'; });
        }
        return;
      }
    } catch(e) {
      console.warn('Shaka indisponible:', e && e.message || e);
    }

    // Fallback natif
    try {
      video.src = cfg.src;
      loader.classList.add('hidden');
      status.textContent = 'Mode natif';
      if (cfg.autoplay) {
        const p = video.play();
        if (p && p.catch) p.catch(()=>{ status.textContent='Autoplay bloqué. Appuyez Lecture.'; });
      }
    } catch(err) {
      status.textContent = 'Échec de chargement';
      console.error(err);
    }
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') start();
  else document.addEventListener('DOMContentLoaded', start);
})();