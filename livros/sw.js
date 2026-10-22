/* Service worker do Calhamaço: o app abre mesmo sem internet. */
const CACHE = 'calhamaco-v4';
// Os arquivos levam "?v=" no index.html: ao mudar a versão, o celular nunca mistura CSS/JS antigo com HTML novo.
const FILES = ['./', 'index.html', 'style.css?v=9', 'fonts/fontes.css', 'art.js?v=9', 'exemplos.js?v=9', 'app.js?v=9', 'intro.js?v=9', 'icon.svg', 'icon-192.png', 'icon-512.png', 'manifest.webmanifest', 'exemplos/cacador.jpg', 'fonts/caveat-400-700.woff2', 'fonts/cinzel-400-900.woff2', 'fonts/cormorant-garamond-400.woff2', 'fonts/cormorant-garamond-italico-400.woff2', 'fonts/courier-prime-400.woff2', 'fonts/courier-prime-700.woff2', 'fonts/courier-prime-italico-400.woff2', 'fonts/crimson-pro-200-900.woff2', 'fonts/crimson-pro-italico-200-900.woff2', 'fonts/dm-serif-display-400.woff2', 'fonts/dm-serif-display-italico-400.woff2', 'fonts/eb-garamond-400-800.woff2', 'fonts/eb-garamond-italico-400-800.woff2', 'fonts/fraunces-300-700.woff2', 'fonts/fraunces-italico-300-700.woff2', 'fonts/inter-400-700.woff2', 'fonts/libre-baskerville-400.woff2', 'fonts/libre-baskerville-italico-400.woff2', 'fonts/literata-400.woff2', 'fonts/literata-italico-400.woff2', 'fonts/lora-400-700.woff2', 'fonts/lora-italico-400-700.woff2', 'fonts/merriweather-400.woff2', 'fonts/merriweather-italico-400.woff2', 'fonts/nunito-400-900.woff2', 'fonts/nunito-italico-400-900.woff2', 'fonts/playfair-display-400-900.woff2', 'fonts/playfair-display-italico-400-900.woff2', 'fonts/special-elite-400.woff2', 'fonts/spectral-400.woff2', 'fonts/spectral-600.woff2', 'fonts/spectral-italico-400.woff2'];

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

// Rede primeiro; cache só se estiver offline.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  const fresh = e.request.mode === 'navigate'
    ? new Request(e.request.url, { cache: 'no-cache' })
    : new Request(e.request, { cache: 'no-cache' });
  e.respondWith(
    fetch(fresh)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('index.html')))
  );
});
