// shaka-loader.js : Load Shaka with timeout and expose shakaReady
(function(){
  const SHAKA_URL = 'https://cdnjs.cloudflare.com/ajax/libs/shaka-player/4.9.4/shaka-player.compiled.min.js';
  let resolved = false;
  let resolveFn, rejectFn;
  window.shakaReady = new Promise((res, rej) => { resolveFn = res; rejectFn = rej; });
  const s = document.createElement('script');
  s.src = SHAKA_URL; s.async = true;
  s.onload = () => { resolved = true; resolveFn(window.shaka); };
  s.onerror = () => { if (!resolved) rejectFn(new Error('CDN load error')); };
  document.head.appendChild(s);
  setTimeout(()=>{ if (!resolved) rejectFn(new Error('timeout')); }, 4000);
})();