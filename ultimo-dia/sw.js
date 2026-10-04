/* Service worker: o jogo abre e funciona offline. */
const CACHE = 'ultimo-dia-v5';
// Os arquivos levam "?v=" no index.html: ao mudar a versão, o celular nunca mistura arquivos antigos e novos.
const FILES = ['./', 'index.html', 'style.css?v=5', 'js/data.js?v=5', 'js/audio.js?v=5', 'js/world.js?v=5', 'js/sim.js?v=5', 'js/art.js?v=5', 'js/render.js?v=5', 'js/input.js?v=5', 'js/ui.js?v=5', 'js/main.js?v=5', 'icon.svg', 'manifest.webmanifest'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Rede primeiro (para pegar atualizações), cache se estiver offline.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(new Request(e.request, { cache: 'no-cache' }))
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('index.html')))
  );
});
