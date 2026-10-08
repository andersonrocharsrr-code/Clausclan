/* Service worker: o Tempero abre e funciona offline (receitas, ilustrações e timers são locais). */
const CACHE = 'tempero-v1';
const FILES = [
  './', 'index.html', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'apple-touch-icon.png',
  'css/app.css',
  'js/core/pantry.js',
  'js/core/photos.js',
  'js/core/prefs.js',
  'js/core/quantity.js',
  'js/core/repo.js',
  'js/core/router.js',
  'js/core/search.js',
  'js/core/shopping.js',
  'js/core/sound.js',
  'js/core/store.js',
  'js/core/timer.js',
  'js/core/util.js',
  'js/data/categories.js',
  'js/data/ingredients.js',
  'js/data/recipes/brasileiras.js',
  'js/data/recipes/doces.js',
  'js/data/recipes/index.js',
  'js/data/recipes/leves.js',
  'js/data/recipes/pratos.js',
  'js/data/tools.js',
  'js/main.js',
  'js/screens/category.js',
  'js/screens/cook.js',
  'js/screens/done.js',
  'js/screens/favorites.js',
  'js/screens/home.js',
  'js/screens/pantry.js',
  'js/screens/profile.js',
  'js/screens/recipe.js',
  'js/screens/search.js',
  'js/screens/shopping.js',
  'js/ui/art-dishes.js',
  'js/ui/components.js',
  'js/ui/icons-food.js',
  'js/ui/icons.js',
  'js/ui/overlay.js',
  'js/ui/scene.js',
];

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

// Rede primeiro (pega atualizações); sem conexão, usa o cache. Fontes do Google ficam em cache quando carregadas.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const same = url.origin === location.origin;
  if (!same && !/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) return;
  e.respondWith(
    fetch(same ? new Request(e.request, { cache: 'no-cache' }) : e.request)
      .then((res) => {
        if (res.ok || res.type === 'opaque') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || (same && e.request.mode === 'navigate' ? caches.match('index.html') : undefined)))
  );
});

// Tocar no aviso de "tempo concluído" volta para o app.
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      const c = list.find((x) => x.url.includes(self.registration.scope));
      return c ? c.focus() : self.clients.openWindow('./');
    })
  );
});
