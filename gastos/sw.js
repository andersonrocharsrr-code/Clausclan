/* Service worker: funciona offline e abre o app ao tocar numa notificação. */
const CACHE = 'nexa-money-v44';
// Os arquivos levam "?v=" no index.html: ao mudar a versão, o celular nunca mistura CSS/JS antigo com HTML novo.
const FILES = ['./', 'index.html', 'style.css?v=44', 'app.js?v=44', 'icon.svg', 'icon-192.png', 'badge-96.png', 'icon-512.png', 'manifest.webmanifest'];

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

// Rede primeiro (sempre conferindo com o servidor, sem usar cópia velha do navegador),
// cache só se estiver offline.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
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

// Notificação enviada pelo servidor (chega mesmo com o app fechado).
self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { body: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Nexa Money', {
    body: d.body || '', tag: d.tag || undefined, icon: 'icon-192.png', badge: 'badge-96.png',
    vibrate: [80, 40, 80], data: { url: d.url || './' },
  }));
});

// Tocar na notificação abre o app (na tela certa, se a notificação indicar), mas ela continua na barra
// até o usuário limpar.
self.addEventListener('notificationclick', (e) => {
  const url = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (list) => {
      const open = list.find((c) => c.url.startsWith(self.registration.scope));
      if (!open) return self.clients.openWindow(url);
      const client = await open.focus();
      if (url !== './' && client && client.navigate) return client.navigate(url).catch(() => client);
      return client;
    })
  );
});
