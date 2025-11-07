// app.js v5
(function(){
  const $ = (id) => document.getElementById(id);
  function getParams() {
    const p = new URLSearchParams(location.search);
    return {
      src: p.get('src') || '',
      title: p.get('title') || 'Live Player',
      autoplay: p.get('autoplay') === '1',
      muted: p.get('muted') !== '0',
      poster: p.get('poster') || ''
    };
  }
  function setParam(key, val) {
    const u = new URL(location.href);
    if (val) u.searchParams.set(key, val); else u.searchParams.delete(key);
    history.replaceState(null, '', u.href);
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
  function mixedContent(src) { return location.protocol === 'https:' && /^http:/.test(src); }
  function logd(msg) {
    try { $('debug').textContent += (typeof msg === 'string' ? msg : JSON.stringify(msg, null, 2)) + "\n"; }
    catch { $('debug').textContent += String(msg) + "\n"; }
  }

  async function testURL(url) {
    $('debug').textContent = '';
    if (!url) { logd('URL vide'); return; }
    if (mixedContent(url)) logd('Alerte: mixed content http sur page https');
    try {
      const res = await fetch(url, { method: 'GET', mode: 'cors' });
      logd({status: res.status, ok: res.ok, url: res.url, type: res.type, cors: res.type === 'cors'});
      const ct = res.headers.get('content-type');
      logd({contentType: ct});
    } catch(e) {
      logd({fetch_error: e.message || String(e)});
    }
  }

  async function loadWithShaka(video, src, opts) {
    const shaka = await window.shakaReady;
    if (!shaka || !shaka.Player || !shaka.Player.isBrowserSupported()) throw new Error('Shaka unsupported');
    if (shaka.polyfill) shaka.polyfill.installAll();
    const player = new shaka.Player();
    player.addEventListener('error', e => {
      const code = e.detail?.code || 'inconnue';
      $('status').textContent = 'Erreur: ' + code;
      logd({shaka_error: e.detail});
    });
    await player.attach(video);
    await player.load(src);
    return player;
  }

  async function start() {
    applyTheme();
    const cfg = getParams();
    $('title').textContent = cfg.title;
    document.title = cfg.title;
    const video = $('video');
    if (cfg.poster) video.poster = cfg.poster;
    video.muted = cfg.muted;
    $('btnMute').textContent = video.muted ? 'Mute' : 'Unmute';
    $('themeToggle').onclick = toggleTheme;
    $('btnMute').onclick = () => { video.muted = !video.muted; $('btnMute').textContent = video.muted ? 'Mute' : 'Unmute'; };
    $('btnFs').onclick = async () => { if (!document.fullscreenElement) await document.documentElement.requestFullscreen().catch(()=>{}); else await document.exitFullscreen().catch(()=>{}); };
    $('btnPlay').onclick = () => { const p = video.play(); if (p && p.catch) p.catch(()=>{ $('status').textContent='Lecture bloquée.'; }); };

    // UI helpers
    const srcInput = $('srcInput');
    const btnTest = $('btnTest');
    const btnLoad = $('btnLoad');
    const demoSel = $('demoSel');
    srcInput.value = cfg.src;
    srcInput.addEventListener('change', () => setParam('src', srcInput.value));
    demoSel.addEventListener('change', () => { if (demoSel.value) { srcInput.value = demoSel.value; setParam('src', demoSel.value); } });
    btnTest.onclick = () => testURL(srcInput.value);
    btnLoad.onclick = () => doLoad(srcInput.value);

    if (!cfg.src) { $('loaderMsg').textContent = 'Ajoutez ?src=URLduFlux ou utilisez le champ ci-dessus'; return; }
    doLoad(cfg.src);

    async function doLoad(src) {
      $('loader').classList.remove('hidden');
      $('loaderMsg').textContent = 'Chargement…';
      $('status').textContent = 'Init…';
      $('debug').textContent = '';
      if (mixedContent(src)) { $('loaderMsg').textContent = 'Mixed content http bloqué'; $('status').textContent='Mixed content'; return; }
      try {
        try {
          await loadWithShaka(video, src, {});
          $('loader').classList.add('hidden');
          $('status').textContent = 'En lecture';
          if (cfg.autoplay) { const p = video.play(); if (p && p.catch) p.catch(()=>{ $('status').textContent='Autoplay bloqué'; }); }
          return;
        } catch (e) {
          logd({attach_or_load_failed: e.message || String(e)});
        }
        // Fallback natif
        video.src = src;
        $('loader').classList.add('hidden');
        $('status').textContent = 'Mode natif';
      } catch (err) {
        $('status').textContent = 'Échec de chargement';
        logd({fatal: err.message || String(err)});
      }
    }
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') start();
  else document.addEventListener('DOMContentLoaded', start);
})();