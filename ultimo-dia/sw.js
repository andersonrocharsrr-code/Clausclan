/* Service worker: o jogo abre e funciona offline. */
const CACHE = 'ultimo-dia-v10';
// Os arquivos levam "?v=" no index.html: ao mudar a versão, o celular nunca mistura arquivos antigos e novos.
const FILES = ['./', 'index.html', 'style.css?v=10', 'js/data.js?v=10', 'js/audio.js?v=10', 'js/world.js?v=10', 'js/sim.js?v=10', 'js/art.js?v=10', 'js/people.js?v=10', 'js/vehicles.js?v=10', 'js/buildings.js?v=10', 'js/render.js?v=10', 'js/input.js?v=10', 'js/ui.js?v=10', 'js/main.js?v=10', 'icon.svg', 'manifest.webmanifest'];

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
