/* Service worker: o app abre e funciona offline. */
const CACHE = 'hangar-escola-v130';
// Os arquivos levam "?v=" no index.html: ao mudar a versão, o celular nunca mistura CSS/JS antigo com HTML novo.
const FILES = ['./', 'index.html', 'style.css?v=130', 'avioes.js?v=130', 'catalogo747.js?v=130', 'cockpit747.js?v=130', 'motor3d.js?v=130', 'motor747.js?v=130', 'meteo.js?v=130', 'radio.js?v=130', 'historia.js?v=130', 'desastres.js?v=130', 'app.js?v=130', 'icon.svg', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'manifest.webmanifest', 'assets/747-lateral.jpg', 'assets/747-frontal.jpg', 'assets/747-motor.jpg', 'assets/747-superior.png', 'assets/747-lado.webp', 'assets/747-lado-prof.webp', 'assets/747-tras.webp', 'assets/747-tras-trem.webp', 'assets/bank-angle.mp3', 'assets/v1.mp3', 'assets/nuvem-cb.webp', 'assets/nuvem-cu.webp', 'assets/nuvem-ci.webp', 'assets/nuvem-cc.webp', 'assets/nuvem-cs.webp', 'assets/nuvem-ac.webp', 'assets/nuvem-as.webp', 'assets/nuvem-ns.webp', 'assets/nuvem-sc.webp', 'assets/nuvem-st.webp', 'assets/nuvens-atlas.webp', 'assets/historia-1881.webp', 'assets/historia-vevey.webp', 'assets/historia-serraria.webp', 'assets/historia-dominguez.webp', 'assets/historia-curtiss.webp', 'assets/jal123-mapa.webp', 'assets/jal123-haneda.webp', 'assets/jal123-decolagem.webp', 'assets/jal123-cauda.webp', 'assets/jal123-cabine.webp', 'assets/jal123-hidraulico.webp', 'assets/jal123-manetes.webp', 'assets/jal123-montanhas.webp', 'assets/jal123-bilhete.webp', 'assets/jal123-c130.webp', 'assets/jal123-deriva.webp', 'assets/af447-mapa.webp', 'assets/af447-galeao.webp', 'assets/af447-decolagem.webp', 'assets/af447-lua.webp', 'assets/af447-tempestade.webp', 'assets/af447-painel.webp', 'assets/cauda-af.webp', 'assets/cauda-jal.webp', 'assets/af447-pitot.webp', 'assets/af447-pitot-gelo.webp', 'assets/af447-manches.webp', 'assets/af447-estol.webp', 'assets/af447-cabine.webp', 'assets/af447-queda.webp', 'assets/af447-deriva.webp', 'assets/af447-painel-voos.webp', 'assets/af447-fundo.webp', 'assets/af447-relatorio.webp', 'assets/af447-sondas.webp', 'assets/af447-balanca.webp'];

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
