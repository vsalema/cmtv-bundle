// shaka-loader.js
// Charge Shaka Player depuis CDN avec un timeout dur, exporte une promesse globale window.shakaReady.
(function(){
  const SHAKA_URL = 'https://cdnjs.cloudflare.com/ajax/libs/shaka-player/4.9.4/shaka-player.compiled.min.js';
  let resolved = false;
  function inject() {
    const s = document.createElement('script');
    s.src = SHAKA_URL;
    s.async = true;
    s.onload = () => { resolved = true; readyResolve(window.shaka); };
    s.onerror = () => { if (!resolved) readyReject(new Error('CDN load error')); };
    document.head.appendChild(s);
  }
  let readyResolve, readyReject;
  window.shakaReady = new Promise((res, rej) => { readyResolve = res; readyReject = rej; });
  // Timeout 4s
  setTimeout(() => { if (!resolved) readyReject(new Error('timeout')); }, 4000);
  inject();
})();
