/* Service worker: o app abre e funciona offline. */
const CACHE = 'hangar-escola-v32';
// Os arquivos levam "?v=" no index.html: ao mudar a versão, o celular nunca mistura CSS/JS antigo com HTML novo.
const FILES = ['./', 'index.html', 'style.css?v=32', 'avioes.js?v=32', 'catalogo747.js?v=32', 'cockpit747.js?v=32', 'app.js?v=32', 'icon.svg', 'manifest.webmanifest', 'assets/747-lateral.jpg', 'assets/747-frontal.jpg', 'assets/747-motor.jpg', 'assets/747-superior.png', 'assets/747-lado.webp', 'assets/747-lado-prof.webp', 'assets/747-tras.webp', 'assets/747-tras-trem.webp', 'assets/bank-angle.mp3'];

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
