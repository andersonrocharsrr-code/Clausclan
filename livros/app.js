'use strict';
/* Imersa — escreva livros com imagens e sons. Tudo fica salvo no aparelho (IndexedDB). */

/* ================= utilitários ================= */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX'];
const roman = (i) => ROMAN[i] || String(i + 1);
// No APK (Capacitor) usa os recursos do Android: salvar/compartilhar arquivos e o botão voltar.
const Cap = window.Capacitor;
const NATIVE = !!(Cap && Cap.isNativePlatform && Cap.isNativePlatform());
const plugin = (n) => (NATIVE ? (Cap.Plugins && Cap.Plugins[n]) || (Cap.registerPlugin && Cap.registerPlugin(n)) || null : null);
const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sem espaço */ } } };

const IC = {
  play: '<polygon points="7 4 20 12 7 20 7 4"/>', pause: '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>',
  stop: '<rect x="5" y="5" width="14" height="14" rx="2"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  vol: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/>',
  mute: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="m22 9-6 6M16 9l6 6"/>',
  wind: '<path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><path d="M12 18v4"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
  left: '<path d="m15 18-6-6 6-6"/>', right: '<path d="m9 18 6-6-6-6"/>', up: '<path d="m18 15-6-6-6 6"/>', down: '<path d="m6 9 6 6 6-6"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  spark: '<path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z"/><path d="M19 17l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
  type: '<path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/>',
  more: '<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>',
  head: '<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>',
  rain: '<path d="M20 16.6A5 5 0 0 0 18 7h-1.3A8 8 0 1 0 4 15.3"/><path d="M8 19v2M8 13v2M16 19v2M16 13v2M12 21v2M12 15v2"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3.3A2.5 2.5 0 0 0 8.5 14.5z"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  quote: '<path d="M3 21c3 0 7-1 7-8V5H3v7h4c0 3-1 5-4 5zM14 21c3 0 7-1 7-8V5h-7v7h4c0 3-1 5-4 5z"/>',
  waves: '<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>',
  zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
  steps: '<path d="M4 16v-2.4C4 11.5 3 10.5 3 8c0-2.7 1.5-6 4.5-6C9.4 2 10 3.8 10 5.5c0 3.1-2 5.7-2 8.7V16a2 2 0 1 1-4 0zM20 20v-2.4c0-2.1 1-3.1 1-5.6 0-2.7-1.5-6-4.5-6C14.6 6 14 7.8 14 9.5c0 3.1 2 5.7 2 8.7V20a2 2 0 1 0 4 0z"/>',
  door: '<path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14"/><path d="M2 20h20"/><path d="M14 12v.01"/>',
  bird: '<path d="M16 7h.01"/><path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.3-2.3L2 20"/><path d="m20 7 2 .5-2 .5"/><path d="M10 18v3M14 17.8V21M7 18a6 6 0 0 0 3.8-10.6"/>',
  branch: '<path d="M4 20 20 4"/><path d="m9 15-3-6M14 10l5 1"/>',
  heart: '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z"/>',
  check: '<path d="M20 6 9 17l-5-5"/>', x: '<path d="M18 6 6 18M6 6l12 12"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
  droplet: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5S5 13 5 15a7 7 0 0 0 7 7z"/>',
  mountain: '<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>',
  glass: '<path d="M8 22h8M7 10h10M12 15v7M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
  sword: '<path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="m13 19 6-6M16 16l4 4M19 21l2-2"/>',
  trash: '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
  edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>', list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  hour: '<path d="M5 22h14M5 2h14M17 22v-4.2a2 2 0 0 0-.6-1.4L12 12l-4.4 4.4a2 2 0 0 0-.6 1.4V22M7 2v4.2a2 2 0 0 0 .6 1.4L12 12l4.4-4.4a2 2 0 0 0 .6-1.4V2"/>',
  layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>',
  sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
};
const I = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${IC[n] || IC.spark}</svg>`;
const LOGO = `<svg aria-hidden="true" viewBox="0 0 100 100"><defs> <radialGradient id="lgobg" cx="28%" cy="18%" r="95%"><stop offset="0" stop-color="#7b5cf0"/><stop offset=".45" stop-color="#3b2483"/><stop offset="1" stop-color="#140c2e"/></radialGradient> <radialGradient id="lgoglow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffc56b" stop-opacity=".55"/><stop offset="1" stop-color="#ffc56b" stop-opacity="0"/></radialGradient> <linearGradient id="lgopl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3d6"/><stop offset="1" stop-color="#f6c477"/></linearGradient> <linearGradient id="lgopr" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe4ad"/><stop offset="1" stop-color="#ee9d52"/></linearGradient> <linearGradient id="lgocv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ec8fae"/><stop offset="1" stop-color="#b9507a"/></linearGradient> <linearGradient id="lgowv" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8af0df"/><stop offset="1" stop-color="#3fb8d6"/></linearGradient> <filter id="lgosoft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.6"/></filter><clipPath id="lgoc"><rect width="100" height="100" rx="22"/></clipPath></defs><g clip-path="url(#lgoc)"><rect width="100" height="100" fill="url(#lgobg)"/><circle cx="16" cy="18" r="1.17" fill="#fff" opacity="0.9"/><circle cx="80" cy="14" r="0.91" fill="#fff" opacity="0.7"/><circle cx="88" cy="30" r="0.65" fill="#fff" opacity="0.5"/><circle cx="12" cy="44" r="0.65" fill="#fff" opacity="0.5"/><circle cx="70" cy="24" r="0.59" fill="#fff" opacity="0.45"/><circle cx="24" cy="84" r="0.52" fill="#fff" opacity="0.4"/><circle cx="86" cy="82" r="0.45" fill="#fff" opacity="0.35"/><circle cx="60" cy="10" r="0.65" fill="#fff" opacity="0.5"/><g transform="translate(-3 0)"> <circle cx="45" cy="56" r="34" fill="url(#lgoglow)"/>  <path d="M14 38 C26 33 38 34 45 40 C52 34 64 33 76 38 L76 76 C64 72 52 73 45 79 C38 73 26 72 14 76 Z" fill="url(#lgocv)"/>  <path d="M17 35 C28 31 39 32 45 38 L45 75 C39 70 28 69 17 72 Z" fill="url(#lgopl)"/> <path d="M73 35 C62 31 51 32 45 38 L45 75 C51 70 62 69 73 72 Z" fill="url(#lgopr)"/> <path d="M45 38 L45 75" stroke="#c9763a" stroke-width="1.2" opacity=".55"/> <g stroke="#c98a4a" stroke-width="1.6" stroke-linecap="round" opacity=".45" fill="none"> <path d="M23 45 C29 43.5 34 43.5 39 45"/><path d="M23 51 C29 49.5 34 49.5 39 51"/><path d="M23 57 C29 55.5 34 55.5 39 57"/><path d="M23 63 C28 61.7 32 61.7 35 62.6"/> <path d="M51 45 C56 43.5 61 43.5 67 45"/><path d="M51 51 C56 49.5 61 49.5 67 51"/> </g>  <g fill="none" stroke-linecap="round"> <path d="M80 47 C84 51 84 59 80 63" stroke="#7ff0dc" stroke-width="5" opacity=".5" filter="url(#lgosoft)"/> <path d="M86 41 C93 49 93 61 86 69" stroke="#7ff0dc" stroke-width="5" opacity=".4" filter="url(#lgosoft)"/> <path d="M80 47 C84 51 84 59 80 63" stroke="url(#lgowv)" stroke-width="4.2"/> <path d="M86 41 C93 49 93 61 86 69" stroke="url(#lgowv)" stroke-width="4.2"/> </g>  <path d="M58 15 L60.2 21.8 L67 24 L60.2 26.2 L58 33 L55.8 26.2 L49 24 L55.8 21.8 Z" fill="#ffd98a"/> <circle cx="58" cy="24" r="7" fill="#ffd98a" opacity=".35" filter="url(#lgosoft)"/></g></g></svg>`;

function toast(msg, ms = 2600) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('on'), ms);
}

/* ================= banco de dados ================= */
const DB = (() => {
  let dbp;
  const open = () => dbp || (dbp = new Promise((res, rej) => {
    const r = indexedDB.open('imersa', 1);
    r.onupgradeneeded = () => { const d = r.result; d.createObjectStore('books', { keyPath: 'id' }); d.createObjectStore('media', { keyPath: 'id' }); };
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  }));
  async function run(store, mode, fn) {
    const d = await open();
    return new Promise((res, rej) => {
      const t = d.transaction(store, mode), req = fn(t.objectStore(store));
      t.oncomplete = () => res(req && req.result); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error);
    });
  }
  return {
    all: (s) => run(s, 'readonly', (o) => o.getAll()),
    get: (s, id) => run(s, 'readonly', (o) => o.get(id)),
    put: (s, v) => run(s, 'readwrite', (o) => o.put(v)),
    del: (s, id) => run(s, 'readwrite', (o) => o.delete(id)),
  };
})();

const urlCache = new Map();
async function mediaURL(id) {
  if (!id) return null;
  if (urlCache.has(id)) return urlCache.get(id);
  const m = await DB.get('media', id);
  if (!m) return null;
  const u = URL.createObjectURL(m.blob); urlCache.set(id, u); return u;
}
Som.userLoader.get = async (id) => { const m = await DB.get('media', id); return m && m.blob; };
let userSounds = []; // [{id, name, ...}] sem o blob
async function loadUserSounds() {
  const all = await DB.all('media');
  userSounds = all.filter((m) => m.kind === 'audio').map(({ blob, ...m }) => m).sort((a, b) => b.createdAt - a.createdAt);
  return userSounds;
}
function soundInfo(id) {
  if (id && id.startsWith('u:')) { const u = userSounds.find((s) => s.id === id.slice(2)); return { id, kind: 'user', name: u ? u.name : 'Som removido', icon: 'mic' }; }
  return Som.info(id);
}
async function saveMedia(kind, blob, name) {
  const m = { id: uid(), kind, name: name || (kind === 'image' ? 'Imagem' : 'Som'), type: blob.type, blob, createdAt: Date.now() };
  await DB.put('media', m);
  if (kind === 'audio') await loadUserSounds();
  return m;
}
async function resizeImage(file, max = 1800) {
  try {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    const out = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.86));
    return out || file;
  } catch (e) { return file; }
}
function pickFile(accept) {
  return new Promise((res) => {
    // O campo fica na página enquanto o seletor está aberto (o WebView do Android precisa disso).
    const i = document.createElement('input'); i.type = 'file'; i.accept = accept; i.hidden = true;
    const done = (f) => { i.remove(); res(f); };
    i.onchange = () => done(i.files[0] || null); i.addEventListener('cancel', () => done(null));
    document.body.appendChild(i); i.click();
  });
}

/* ================= livros ================= */
let books = [];
async function loadBooks() { books = (await DB.all('books')).sort((a, b) => b.updatedAt - a.updatedAt); }
const getBook = (id) => books.find((b) => b.id === id);
const saveTimers = {};
function saveBook(book, now = false) {
  book.updatedAt = Date.now();
  clearTimeout(saveTimers[book.id]);
  setSaving(true);
  const go = () => DB.put('books', book).then(() => setSaving(false)).catch(() => toast('Não consegui salvar. O aparelho pode estar sem espaço.'));
  if (now) return go();
  saveTimers[book.id] = setTimeout(go, 500);
}
function setSaving(busy) {
  const d = $('#saveDot'), t = $('#saveTxt'); if (!d) return;
  d.classList.toggle('busy', busy); t.textContent = busy ? 'Salvando…' : 'Salvo';
}
function newBook(data = {}) {
  return { id: uid(), title: 'Livro sem título', author: '', genre: '', theme: 'floresta', coverMedia: null, createdAt: Date.now(), updatedAt: Date.now(), chapters: [{ id: uid(), title: 'Capítulo 1', html: '<p><br></p>' }], ...data };
}
function chapterStats(html) {
  const t = document.createElement('template'); t.innerHTML = html || '';
  const words = (t.content.textContent || '').trim().split(/\s+/).filter(Boolean).length;
  return { words, imgs: t.content.querySelectorAll('.m-img').length, snds: t.content.querySelectorAll('.m-fx,.m-amb,.m-mus').length };
}
function bookStats(b) {
  return b.chapters.reduce((a, c) => { const s = chapterStats(c.html); a.words += s.words; a.imgs += s.imgs; a.snds += s.snds; return a; }, { words: 0, imgs: 0, snds: 0 });
}
const fmt = (n) => n.toLocaleString('pt-BR');

function coverHTML(b, opts = {}) {
  const art = b.coverMedia ? `<img data-media="${esc(b.coverMedia)}" alt="">` : Arte.svg(b.theme);
  return `<div class="cover" ${opts.style ? `style="${opts.style}"` : ''}>${art}<div class="shade"></div>${opts.noTitle ? '' : `<div class="ct">${esc(b.title)}${b.genre ? `<small>${esc(b.genre)}</small>` : ''}</div>`}</div>`;
}
async function fillMedia(root) {
  for (const img of $$('img[data-media]', root)) { const u = await mediaURL(img.dataset.media); if (u) img.src = u; }
}

/* ================= conteúdo: limpeza e montagem ================= */
const BLOCK_CLASSES = { FIGURE: ['m-img'], DIV: ['m-amb', 'm-mus', 'm-scene'], SPAN: ['m-fx'] };
const OK_TAGS = new Set(['P', 'H2', 'H3', 'BLOCKQUOTE', 'B', 'STRONG', 'I', 'EM', 'U', 'BR']);
function sanitize(html) {
  const t = document.createElement('template'); t.innerHTML = html || '';
  const walk = (node) => {
    for (const el of [...node.children]) {
      const cls = BLOCK_CLASSES[el.tagName] && BLOCK_CLASSES[el.tagName].find((c) => el.classList.contains(c));
      if (cls) {
        const keep = {}; for (const a of el.attributes) if (a.name.startsWith('data-')) keep[a.name] = a.value;
        const n = document.createElement(el.tagName); n.className = cls;
        for (const [k, v] of Object.entries(keep)) n.setAttribute(k, v);
        el.replaceWith(n); continue;
      }
      if (OK_TAGS.has(el.tagName)) { for (const a of [...el.attributes]) el.removeAttribute(a.name); walk(el); continue; }
      if (el.tagName === 'DIV') { const p = document.createElement('p'); p.append(...el.childNodes); el.replaceWith(p); walk(p); continue; }
      if (['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'svg', 'SVG', 'IMG', 'VIDEO', 'AUDIO', 'LINK', 'META'].includes(el.tagName)) { el.remove(); continue; }
      walk(el); el.replaceWith(...el.childNodes);
    }
  };
  walk(t.content);
  return t.innerHTML;
}
const parseLayers = (s) => (s || '').split('|').filter(Boolean).map((x) => { const i = x.lastIndexOf(':'); return { id: x.slice(0, i), vol: clamp(parseFloat(x.slice(i + 1)) || 0.6, 0, 1) }; });
const layersAttr = (ls) => ls.map((l) => `${l.id}:${l.vol.toFixed(2)}`).join('|');
const kindCls = (k) => ({ amb: 'k-amb', mus: 'k-mus', fx: 'k-fx', user: 'k-user' }[k] || 'k-user');

// Desenha o conteúdo visível de um elemento de mídia no editor
function hydrate(el) {
  el.contentEditable = 'false';
  const d = el.dataset;
  if (el.classList.contains('m-fx')) {
    const s = soundInfo(d.sound);
    el.classList.toggle('user', s.kind === 'user');
    el.innerHTML = `${I(s.icon)}${esc(d.label || s.name)}`;
    el.title = `Som: ${s.name} — toque para editar`;
  } else if (el.classList.contains('m-amb')) {
    const ls = parseLayers(d.layers);
    const names = ls.length ? ls.map((l) => soundInfo(l.id).name).join(' + ') : 'Silêncio (o ambiente para aqui)';
    el.classList.add('m-blk');
    el.innerHTML = `<span class="ic">${I(ls.length ? 'waves' : 'mute')}</span><span class="tx"><small>Ambiente da cena</small><b>${esc(names)}</b></span>${ls.length ? `<span class="play" data-act="play">${I('play', 'fill')}</span>` : ''}`;
  } else if (el.classList.contains('m-mus')) {
    const s = d.sound ? soundInfo(d.sound) : null;
    el.classList.add('m-blk');
    el.innerHTML = `<span class="ic">${I(s ? 'music' : 'mute')}</span><span class="tx"><small>Música</small><b>${s ? esc(s.name) + ` · ${Math.round((+d.vol || 0.5) * 100)}%` : 'Parar a música aqui'}</b></span>${s ? `<span class="play" data-act="play">${I('play', 'fill')}</span>` : ''}`;
  } else if (el.classList.contains('m-scene')) {
    el.innerHTML = '<span class="orn">✦ ❦ ✦</span><small>Mudança de cena · os sons da cena anterior param</small>';
  } else if (el.classList.contains('m-img')) {
    const art = d.media ? `<img data-media="${esc(d.media)}" alt="">` : Arte.svg(d.art || 'floresta');
    const badges = [d.fx === 'zoom' ? `<span>${I('spark')}Zoom lento</span>` : '', d.bg === '1' ? `<span>${I('layers')}Fundo da leitura</span>` : ''].join('');
    el.innerHTML = `<div class="frame">${art}<div class="badges">${badges}</div></div>${d.caption ? `<figcaption>${esc(d.caption)}</figcaption>` : ''}`;
    fillMedia(el);
  }
  return el;
}
function serialize(root) {
  const c = root.cloneNode(true);
  for (const el of $$('.m-fx,.m-amb,.m-mus,.m-scene,.m-img', c)) { el.innerHTML = ''; el.removeAttribute('contenteditable'); el.removeAttribute('title'); el.classList.remove('m-blk', 'user'); }
  return c.innerHTML;
}

/* ================= janelas ================= */
let modalStack = [];
function modal(html, { wide = false, onClose } = {}) {
  const m = document.createElement('div'); m.className = 'modal';
  m.innerHTML = `<div class="sheet ${wide ? 'wide' : ''}" role="dialog" aria-modal="true">${html}</div>`;
  document.body.appendChild(m);
  const close = () => { if (!m.isConnected) return; m.remove(); modalStack = modalStack.filter((x) => x !== close); if (onClose) onClose(); };
  m.addEventListener('mousedown', (e) => { if (e.target === m) close(); });
  $$('[data-close]', m).forEach((b) => b.addEventListener('click', close));
  modalStack.push(close);
  const f = $('input:not([type=range]):not([type=checkbox]),textarea', m); if (f && matchMedia('(pointer:fine)').matches) setTimeout(() => f.focus(), 50);
  return { el: m, close };
}
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modalStack.length && !slashState) modalStack[modalStack.length - 1](); });
const sheetHead = (title) => `<div class="sheet-h"><h3>${title}</h3><button class="icon-btn" data-close aria-label="Fechar">${I('x')}</button></div>`;
function ask(title, msg, ok = 'Confirmar', danger = false) {
  return new Promise((res) => {
    let done = false;
    const m = modal(`${sheetHead(esc(title))}<div class="sheet-b"><p class="muted">${esc(msg)}</p></div><div class="sheet-f"><span class="grow"></span><button class="btn" data-close>Cancelar</button><button class="btn ${danger ? 'danger' : 'pri'}" id="okb">${esc(ok)}</button></div>`, { onClose: () => { if (!done) res(false); } });
    $('#okb', m.el).onclick = () => { done = true; m.close(); res(true); };
  });
}
function askText(title, value = '', label = 'Nome', ok = 'Salvar') {
  return new Promise((res) => {
    let done = false;
    const m = modal(`${sheetHead(esc(title))}<div class="sheet-b"><div class="field"><label>${esc(label)}</label><input class="input" id="tx" value="${esc(value)}" maxlength="80"></div></div><div class="sheet-f"><span class="grow"></span><button class="btn" data-close>Cancelar</button><button class="btn pri" id="okb">${esc(ok)}</button></div>`, { onClose: () => { if (!done) res(null); } });
    const go = () => { done = true; const v = $('#tx', m.el).value.trim(); m.close(); res(v || value); };
    $('#okb', m.el).onclick = go; $('#tx', m.el).onkeydown = (e) => { if (e.key === 'Enter') go(); };
  });
}
function popMenu(anchor, items) {
  closeMenus();
  const m = document.createElement('div'); m.className = 'menu';
  m.innerHTML = items.map((it, i) => it === '-' ? '<hr>' : `<button data-i="${i}" class="${it.danger ? 'danger' : ''}">${I(it.icon)}${esc(it.label)}</button>`).join('');
  document.body.appendChild(m);
  const r = anchor.getBoundingClientRect();
  m.style.top = Math.min(r.bottom + 6, innerHeight - m.offsetHeight - 10) + 'px';
  m.style.left = clamp(r.right - m.offsetWidth, 10, innerWidth - m.offsetWidth - 10) + 'px';
  m.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; closeMenus(); items[+b.dataset.i].run(); });
  setTimeout(() => document.addEventListener('mousedown', closeMenusOutside), 0);
}
function closeMenusOutside(e) { if (!e.target.closest('.menu')) closeMenus(); }
function closeMenus() { $$('.menu').forEach((m) => m.remove()); document.removeEventListener('mousedown', closeMenusOutside); }

/* ================= roteamento ================= */
const app = $('#app');
let teardown = [];
function onLeave(fn) { teardown.push(fn); }
function route() {
  teardown.forEach((f) => { try { f(); } catch (e) { console.error(e); } }); teardown = [];
  closeMenus(); modalStack.slice().forEach((c) => c()); closeSlash();
  Som.stopPreview();
  const [, a, b, c] = (location.hash.slice(1) || '/').split('/');
  window.scrollTo(0, 0);
  if (a === 'livro' && getBook(b)) viewEditor(getBook(b), +c || 0);
  else if (a === 'ler' && getBook(b)) viewReader(getBook(b), +c || 0);
  else if (a === 'sons') viewSounds();
  else viewShelf();
}
const go = (h) => { if (location.hash === h) route(); else location.hash = h; };

/* ================= ESTANTE ================= */
function viewShelf() {
  document.title = 'Imersa — sua estante';
  const hour = new Date().getHours();
  const hello = hour < 5 ? 'Boa madrugada' : hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const last = books[0];
  let cont = '';
  if (last) {
    const st = bookStats(last), ci = clamp(LS.get('imersa-lastch-' + last.id, 0), 0, last.chapters.length - 1), ch = last.chapters[ci];
    cont = `<div class="continue">${coverHTML(last, { style: 'width:110px', noTitle: false })}
      <div class="info"><span class="kicker">Continuar escrevendo</span><h3>${esc(last.title)}</h3>
      <span class="muted" style="font-size:13px">Cap. ${roman(ci)} — ${esc(ch.title)} · ${fmt(st.words)} palavras</span>
      <div class="pills" style="margin-top:10px"><span class="pill amber">${I('image')}${st.imgs}</span><span class="pill teal">${I('vol')}${st.snds}</span><span class="pill">${I('book')}${last.chapters.length} cap.</span></div>
      <div class="acts"><button class="btn pri sm" data-go="#/livro/${last.id}/${ci}">${I('pen')}Escrever</button><button class="btn sm" data-go="#/ler/${last.id}/${ci}">${I('eye')}Ler</button></div></div></div>`;
  }
  app.innerHTML = `<div class="shelf-bg">
    <header class="topbar"><div class="logo">${LOGO}Imersa</div><span class="grow"></span>
      <button class="btn sm" data-go="#/sons">${I('head')}<span class="hide-m">Sons</span></button>
      <button class="icon-btn" id="mainMenu" aria-label="Mais opções">${I('more')}</button></header>
    <div class="shelf"><div class="hello">${hello} ✦</div><h1 class="h1">Sua estante</h1>${cont}
      <div class="sec-h"><h2>Meus livros</h2><span class="muted" style="font-size:13px">${books.length} ${books.length === 1 ? 'livro' : 'livros'}</span></div>
      <div class="books">${books.map((b) => { const st = bookStats(b); return `<button class="book" data-go="#/livro/${b.id}/${clamp(LS.get('imersa-lastch-' + b.id, 0), 0, b.chapters.length - 1)}">${coverHTML(b)}<span class="meta"><b>${esc(b.title)}</b><small>${b.chapters.length} cap. · ${fmt(st.words)} palavras</small></span></button>`; }).join('')}
        <button class="newbook" id="newBook">${I('plus')}Novo livro</button></div>
    </div></div>`;
  fillMedia(app);
  $$('[data-go]', app).forEach((b) => b.onclick = () => go(b.dataset.go));
  $('#newBook').onclick = () => bookDialog(null);
  $('#mainMenu').onclick = (e) => popMenu(e.currentTarget, [
    { icon: 'upload', label: 'Abrir livro ou backup (.json)', run: importFile },
    { icon: 'download', label: 'Fazer backup de tudo', run: exportAll },
    '-',
    { icon: 'head', label: 'Biblioteca de sons', run: () => go('#/sons') },
  ]);
}

function bookDialog(book) {
  const isNew = !book;
  const b = book ? { ...book } : newBook({ title: '' });
  const m = modal(`${sheetHead(isNew ? 'Novo livro' : 'Dados do livro')}<div class="sheet-b">
    <div class="field"><label>Título</label><input class="input" id="bt" value="${esc(b.title)}" placeholder="Ex.: A Floresta dos Sussurros" maxlength="90"></div>
    <div class="row"><div class="field"><label>Autor(a)</label><input class="input" id="ba" value="${esc(b.author)}" placeholder="Seu nome" maxlength="60"></div>
    <div class="field"><label>Gênero</label><input class="input" id="bg" value="${esc(b.genre)}" placeholder="Fantasia, romance…" maxlength="40"></div></div>
    <div class="field"><label>Capa</label><div class="themes" id="th"></div></div>
  </div><div class="sheet-f">${isNew ? '' : `<button class="btn danger" id="del">${I('trash')}Excluir</button>`}<span class="grow"></span><button class="btn" data-close>Cancelar</button><button class="btn pri" id="ok">${isNew ? 'Criar livro' : 'Salvar'}</button></div>`);
  const th = $('#th', m.el);
  const draw = () => {
    th.innerHTML = Arte.temas.map((t) => `<button data-t="${t.id}" class="${!b.coverMedia && b.theme === t.id ? 'on' : ''}" title="${esc(t.name)}">${coverHTML({ ...b, coverMedia: null, theme: t.id, title: $('#bt', m.el).value || 'Título', genre: '' })}</button>`).join('')
      + (b.coverMedia ? `<button class="on" data-t="img">${coverHTML({ ...b, title: $('#bt', m.el).value || 'Título', genre: '' })}</button>` : '')
      + `<button class="up" data-t="up">${I('upload')}Usar uma foto</button>`;
    fillMedia(th);
  };
  draw();
  $('#bt', m.el).addEventListener('change', draw);
  th.onclick = async (e) => {
    const t = e.target.closest('button'); if (!t) return;
    if (t.dataset.t === 'up') {
      const f = await pickFile('image/*'); if (!f) return;
      const md = await saveMedia('image', await resizeImage(f, 1400), 'Capa'); b.coverMedia = md.id;
    } else if (t.dataset.t !== 'img') { b.theme = t.dataset.t; b.coverMedia = null; }
    draw();
  };
  $('#ok', m.el).onclick = async () => {
    b.title = $('#bt', m.el).value.trim() || 'Livro sem título'; b.author = $('#ba', m.el).value.trim(); b.genre = $('#bg', m.el).value.trim();
    if (isNew) { books.unshift(b); await saveBook(b, true); m.close(); go(`#/livro/${b.id}/0`); }
    else { Object.assign(book, b); await saveBook(book, true); m.close(); route(); }
  };
  if (!isNew) $('#del', m.el).onclick = async () => { m.close(); deleteBook(book); };
}
async function deleteBook(book) {
  if (!(await ask('Excluir livro?', `"${book.title}" e todos os capítulos serão apagados deste aparelho. Isso não pode ser desfeito.`, 'Excluir', true))) return;
  await DB.del('books', book.id); books = books.filter((x) => x.id !== book.id); go('#/'); toast('Livro excluído');
}

/* ================= EDITOR ================= */
let slashState = null;
function viewEditor(book, ci) {
  ci = clamp(ci, 0, book.chapters.length - 1);
  LS.set('imersa-lastch-' + book.id, ci);
  const ch = book.chapters[ci];
  document.title = `${ch.title} — ${book.title}`;
  app.innerHTML = `
  <header class="topbar ed-top">
    <button class="icon-btn" data-go="#/" aria-label="Estante">${I('left')}</button>
    <button class="icon-btn only-m" id="openSide" aria-label="Capítulos">${I('list')}</button>
    <div class="crumb"><b>${esc(book.title)}</b><small><span class="dot" id="saveDot"></span><span id="saveTxt">Salvo</span> · <span id="wc"></span></small></div>
    <span class="grow"></span>
    <button class="btn sm hide-m" data-go="#/sons">${I('head')}Sons</button>
    <button class="btn pri sm" id="readBtn">${I('eye')}Ler</button>
    <button class="icon-btn" id="bookMenu" aria-label="Mais opções">${I('more')}</button>
  </header>
  <div class="ed-wrap">
    <aside class="side" id="side"></aside>
    <main class="desk">
      <div class="toolbar"><div class="tools" id="tools">
        <button data-cmd="bold" title="Negrito (Ctrl+B)"><b>B</b></button>
        <button data-cmd="italic" title="Itálico (Ctrl+I)"><i style="font-family:var(--serif);font-size:17px">I</i></button>
        <button data-cmd="h2" title="Subtítulo">${I('type')}</button>
        <button data-cmd="quote" title="Citação">${I('quote')}</button>
        <span class="sep"></span>
        <button data-ins="img" class="c-img">${I('image')}Imagem</button>
        <button data-ins="fx" class="c-snd">${I('vol')}Som</button>
        <button data-ins="amb" class="c-snd">${I('waves')}Ambiente</button>
        <button data-ins="mus" class="c-mus">${I('music')}Música</button>
        <button data-ins="scene" class="c-scn">${I('hour')}Cena</button>
      </div></div>
      <div class="paper">
        <div class="chapno">Capítulo ${roman(ci)}</div>
        <input class="ch-title" id="chTitle" value="${esc(ch.title)}" placeholder="Título do capítulo" maxlength="90">
        <div class="editor" id="ed" contenteditable="true" spellcheck="true" data-ph="Comece a escrever… digite / para pôr sons e imagens"></div>
      </div>
    </main>
  </div>`;
  $$('[data-go]', app).forEach((b) => b.onclick = () => go(b.dataset.go));
  const ed = $('#ed');
  try { document.execCommand('defaultParagraphSeparator', false, 'p'); } catch (e) { /* navegador antigo */ }
  ed.innerHTML = sanitize(ch.html) || '<p><br></p>';
  $$('.m-fx,.m-amb,.m-mus,.m-scene,.m-img', ed).forEach(hydrate);
  normalize(ed);

  const side = $('#side');
  const drawSide = () => {
    const st = bookStats(book);
    side.innerHTML = `<div class="bookcard">${coverHTML(book, { noTitle: true })}<div><h3>${esc(book.title)}</h3><div class="muted" style="font-size:12px;margin-top:3px">${esc(book.genre || 'Sem gênero')}</div><div class="muted" style="font-size:11.5px;margin-top:6px">${fmt(st.words)} palavras · ${book.chapters.length} cap.</div></div></div>
      <div class="lbl">Capítulos</div>
      ${book.chapters.map((c, i) => { const s = chapterStats(i === ci ? serialize(ed) : c.html); return `<button class="ch ${i === ci ? 'on' : ''}" data-ch="${i}"><span class="n">${roman(i)}</span><span class="t">${esc(c.title || 'Sem título')}</span><span class="meta">${s.imgs ? `<span>${I('image')}${s.imgs}</span>` : ''}${s.snds ? `<span>${I('vol')}${s.snds}</span>` : ''}</span></button>
        ${i === ci ? `<div class="ch-tools">${i > 0 ? `<button data-mv="-1" title="Subir">${I('up')}</button>` : ''}${i < book.chapters.length - 1 ? `<button data-mv="1" title="Descer">${I('down')}</button>` : ''}${book.chapters.length > 1 ? `<button data-delch title="Excluir capítulo">${I('trash')}Excluir</button>` : ''}</div>` : ''}`; }).join('')}
      <button class="ch addch" id="addCh"><span class="n">+</span>Novo capítulo</button>
      <div class="tip">Digite <kbd>/</kbd> no texto para pôr <b>sons</b>, <b>ambientes</b>, <b>músicas</b> e <b>imagens</b>. Toque num deles para mudar. Depois aperte <b>Ler</b> para sentir como o leitor vai viver a história.</div>`;
    fillMedia(side);
  };
  drawSide();
  side.onclick = async (e) => {
    const b = e.target.closest('button'); if (!b) return;
    flush();
    if (b.dataset.ch != null) { closeSide(); go(`#/livro/${book.id}/${b.dataset.ch}`); }
    else if (b.id === 'addCh') { book.chapters.push({ id: uid(), title: `Capítulo ${book.chapters.length + 1}`, html: '<p><br></p>' }); await saveBook(book, true); go(`#/livro/${book.id}/${book.chapters.length - 1}`); }
    else if (b.dataset.mv) { const j = ci + +b.dataset.mv; [book.chapters[ci], book.chapters[j]] = [book.chapters[j], book.chapters[ci]]; await saveBook(book, true); go(`#/livro/${book.id}/${j}`); }
    else if (b.hasAttribute('data-delch')) {
      if (!(await ask('Excluir capítulo?', `"${ch.title}" será apagado. Isso não pode ser desfeito.`, 'Excluir', true))) return;
      book.chapters.splice(ci, 1); await saveBook(book, true); go(`#/livro/${book.id}/${Math.max(0, ci - 1)}`);
    }
  };
  let bd;
  const closeSide = () => { side.classList.remove('open'); if (bd) { bd.remove(); bd = null; } };
  $('#openSide').onclick = () => { side.classList.add('open'); bd = document.createElement('div'); bd.className = 'side-bd'; bd.onclick = closeSide; document.body.appendChild(bd); };
  onLeave(closeSide);

  // salvar
  const wc = $('#wc');
  const updWC = () => { wc.textContent = fmt(chapterStats(ch.html).words) + ' palavras'; };
  const flush = () => { ch.html = serialize(ed); saveBook(book); };
  let sideT;
  const markEmpty = () => ed.classList.toggle('is-empty', !ed.textContent.trim() && !ed.querySelector('.m-fx,.m-amb,.m-mus,.m-scene,.m-img'));
  const changed = () => { ch.html = serialize(ed); updWC(); markEmpty(); saveBook(book); clearTimeout(sideT); sideT = setTimeout(drawSide, 1200); };
  updWC(); markEmpty();
  ed.addEventListener('input', () => { normalize(ed); changed(); checkSlash(ed); });
  $('#chTitle').addEventListener('input', (e) => { ch.title = e.target.value; saveBook(book); clearTimeout(sideT); sideT = setTimeout(drawSide, 600); });
  $('#chTitle').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); ed.focus(); placeCaret(ed.firstElementChild || ed, true); } });
  onLeave(() => { ch.html = serialize(ed); clearTimeout(saveTimers[book.id]); DB.put('books', book); });
  const beforeUnload = () => { ch.html = serialize(ed); DB.put('books', book); };
  addEventListener('pagehide', beforeUnload); onLeave(() => removeEventListener('pagehide', beforeUnload));

  // seleção guardada (para inserir onde o cursor estava)
  let saved = null;
  const onSel = () => { const s = getSelection(); if (s.rangeCount && ed.contains(s.anchorNode)) saved = s.getRangeAt(0).cloneRange(); };
  document.addEventListener('selectionchange', onSel); onLeave(() => document.removeEventListener('selectionchange', onSel));
  const restore = () => { if (!saved || !ed.contains(saved.startContainer)) return null; const s = getSelection(); s.removeAllRanges(); s.addRange(saved); return saved; };

  // colar só texto
  ed.addEventListener('paste', (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text/plain') || '';
    const parts = text.replace(/\r/g, '').split(/\n\s*\n|\n/).map((s) => s.trim()).filter(Boolean);
    if (parts.length <= 1) document.execCommand('insertText', false, text.replace(/\s+/g, ' '));
    else document.execCommand('insertHTML', false, parts.map((p) => `<p>${esc(p)}</p>`).join(''));
  });

  // barra de ferramentas
  const tools = $('#tools');
  tools.addEventListener('mousedown', (e) => { if (e.target.closest('button')) e.preventDefault(); });
  tools.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.cmd) {
      ed.focus(); restore();
      const blk = topBlock(ed, getSelection().anchorNode);
      if (b.dataset.cmd === 'bold' || b.dataset.cmd === 'italic') document.execCommand(b.dataset.cmd);
      else if (b.dataset.cmd === 'h2') document.execCommand('formatBlock', false, blk && blk.tagName === 'H2' ? 'p' : 'h2');
      else document.execCommand('formatBlock', false, blk && blk.tagName === 'BLOCKQUOTE' ? 'p' : 'blockquote');
      changed();
    } else if (b.dataset.ins) insert(b.dataset.ins);
  });

  // inserir / editar mídia
  const insert = (type, existing) => {
    const range = existing ? null : (restore() || endRange(ed));
    const put = (el) => {
      if (existing) { existing.replaceWith(el); }
      else if (el.tagName === 'SPAN') insertInline(ed, range, el);
      else insertBlock(ed, range, el);
      hydrate(el); normalize(ed); changed();
    };
    const remove = existing ? () => { existing.remove(); normalize(ed); changed(); } : null;
    if (type === 'img') imageDialog(existing, put, remove);
    else if (type === 'fx') fxDialog(existing, put, remove);
    else if (type === 'amb') ambDialog(existing, put, remove);
    else if (type === 'mus') musDialog(existing, put, remove);
    else if (type === 'scene') { if (existing) { ask('Mudança de cena', 'Aqui os sons da cena anterior param e a próxima cena começa em silêncio.', 'Remover', true).then((ok) => ok && remove()); } else { const d = document.createElement('div'); d.className = 'm-scene'; put(d); } }
  };
  ed.addEventListener('click', (e) => {
    const el = e.target.closest('.m-fx,.m-amb,.m-mus,.m-scene,.m-img'); if (!el) return;
    e.preventDefault();
    if (e.target.closest('[data-act=play]')) {
      if (el.classList.contains('m-amb')) { const ls = parseLayers(el.dataset.layers); Som.init(); Som.stopPreview(); Som.setAmbience(ls, 0.6); toast('Ouvindo o ambiente por 8 segundos'); clearTimeout(ed.amb); ed.amb = setTimeout(() => Som.setAmbience([], 1.5), 8000); }
      else Som.previewSound(el.dataset.sound, +el.dataset.vol || 0.6);
      return;
    }
    const type = el.classList.contains('m-fx') ? 'fx' : el.classList.contains('m-amb') ? 'amb' : el.classList.contains('m-mus') ? 'mus' : el.classList.contains('m-img') ? 'img' : 'scene';
    insert(type, el);
  });
  onLeave(() => { clearTimeout(ed.amb); Som.stopAll(0.5); });

  // menu "/"
  ed.addEventListener('keydown', (e) => {
    if (slashState) {
      const items = $$('.it', slashState.el);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); slashState.i = (slashState.i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length; items.forEach((x, i) => x.classList.toggle('on', i === slashState.i)); return; }
      if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); items[slashState.i].click(); return; }
      if (e.key === 'Escape') { e.preventDefault(); closeSlash(); return; }
    }
  });
  slashInsert = (type) => {
    const s = getSelection();
    if (s.rangeCount) { const r = s.getRangeAt(0); const n = r.startContainer; if (n.nodeType === 3 && r.startOffset > 0 && n.data[r.startOffset - 1] === '/') { n.deleteData(r.startOffset - 1, 1); } saved = s.getRangeAt(0).cloneRange(); }
    closeSlash(); insert(type);
  };
  ed.addEventListener('blur', () => setTimeout(() => { if (slashState && !slashState.el.matches(':hover')) closeSlash(); }, 150));

  $('#readBtn').onclick = () => { flush(); go(`#/ler/${book.id}/${ci}`); };
  $('#bookMenu').onclick = (e) => popMenu(e.currentTarget, [
    { icon: 'edit', label: 'Título, autor e capa', run: () => { flush(); bookDialog(book); } },
    { icon: 'eye', label: 'Ler desde o começo', run: () => { flush(); go(`#/ler/${book.id}/0`); } },
    { icon: 'download', label: 'Exportar este livro', run: () => { flush(); exportBook(book); } },
    '-',
    { icon: 'trash', label: 'Excluir livro', danger: true, run: () => deleteBook(book) },
  ]);
  if (!chapterStats(ch.html).words) setTimeout(() => { ed.focus(); placeCaret(ed.firstElementChild || ed, false); }, 60);
}

/* ---- ajudas do editor ---- */
function topBlock(ed, node) {
  while (node && node.parentNode !== ed) node = node.parentNode;
  return node && node.nodeType === 1 ? node : null;
}
function normalize(ed) {
  // texto solto vira parágrafo; garante um parágrafo no fim para continuar escrevendo
  for (const n of [...ed.childNodes]) {
    if (n.nodeType === 3 && n.data.trim()) { const p = document.createElement('p'); n.replaceWith(p); p.appendChild(n); }
    else if (n.nodeType === 1 && n.tagName === 'DIV' && !n.matches('.m-amb,.m-mus,.m-scene')) { const p = document.createElement('p'); p.append(...n.childNodes); n.replaceWith(p); }
    else if (n.nodeType === 1 && n.tagName === 'SPAN' && n.classList.contains('m-fx')) { const p = document.createElement('p'); n.replaceWith(p); p.appendChild(n); }
  }
  const last = ed.lastElementChild;
  if (!last || last.matches('.m-amb,.m-mus,.m-scene,.m-img')) { const p = document.createElement('p'); p.innerHTML = '<br>'; ed.appendChild(p); }
}
function endRange(ed) {
  normalize(ed);
  const r = document.createRange(); const last = ed.lastElementChild; r.selectNodeContents(last); r.collapse(false); return r;
}
function placeCaret(el, start) {
  const r = document.createRange(); r.selectNodeContents(el); r.collapse(!!start);
  const s = getSelection(); s.removeAllRanges(); s.addRange(r);
}
function insertInline(ed, range, el) {
  let blk = topBlock(ed, range.startContainer);
  if (!blk || blk.matches('.m-amb,.m-mus,.m-scene,.m-img')) { const p = document.createElement('p'); (blk ? blk.after(p) : ed.appendChild(p)); blk = p; range = document.createRange(); range.selectNodeContents(p); range.collapse(false); }
  range.deleteContents();
  const space = document.createTextNode(' ');
  range.insertNode(space); range.insertNode(el);
  const prev = el.previousSibling;
  if (prev && prev.nodeType === 3 && prev.data && !/\s$/.test(prev.data)) prev.data += ' ';
  const s = getSelection(), r = document.createRange(); r.setStartAfter(space); r.collapse(true); s.removeAllRanges(); s.addRange(r);
}
function insertBlock(ed, range, el) {
  const blk = topBlock(ed, range.startContainer);
  if (!blk) { ed.appendChild(el); return; }
  if (blk.matches('.m-amb,.m-mus,.m-scene,.m-img')) { blk.after(el); return; }
  const tail = document.createRange(); tail.setStart(range.endContainer, range.endOffset); tail.setEnd(blk, blk.childNodes.length);
  const frag = tail.extractContents();
  const p = document.createElement(blk.tagName === 'H2' ? 'p' : blk.tagName.toLowerCase()); p.appendChild(frag);
  const empty = !blk.textContent.trim() && !blk.querySelector('.m-fx');
  if (empty) blk.replaceWith(el); else blk.after(el);
  if (p.textContent.trim() || p.querySelector('.m-fx')) el.after(p);
  else { const np = document.createElement('p'); np.innerHTML = '<br>'; el.after(np); }
  placeCaret(el.nextElementSibling, true);
}

let slashInsert = () => {};
const SLASH = [
  { t: 'fx', icon: 'vol', name: 'Som no momento', sub: 'toca quando o leitor chegar aqui', cls: 'k-fx' },
  { t: 'img', icon: 'image', name: 'Imagem', sub: 'foto, desenho ou ilustração pronta', cls: 'k-fx' },
  { t: 'amb', icon: 'waves', name: 'Ambiente da cena', sub: 'chuva, mar, floresta, fogueira…', cls: 'k-amb' },
  { t: 'mus', icon: 'music', name: 'Música', sub: 'trilha que entra suave', cls: 'k-mus' },
  { t: 'scene', icon: 'hour', name: 'Mudança de cena', sub: 'para os sons e respira', cls: 'k-user' },
];
function checkSlash(ed) {
  const s = getSelection(); if (!s.rangeCount) return closeSlash();
  const r = s.getRangeAt(0), n = r.startContainer;
  if (n.nodeType !== 3 || !r.collapsed) return closeSlash();
  const before = n.data.slice(0, r.startOffset);
  if (!/(^|\s)\/$/.test(before)) return closeSlash();
  const rect = r.getBoundingClientRect();
  if (!slashState) {
    const el = document.createElement('div'); el.className = 'slash';
    el.innerHTML = `<div class="hd">Inserir no texto</div>${SLASH.map((x, i) => `<button class="it ${i ? '' : 'on'}" data-t="${x.t}"><span class="b ${x.cls}">${I(x.icon)}</span><span><b>${x.name}</b><small>${x.sub}</small></span></button>`).join('')}`;
    el.addEventListener('mousedown', (e) => e.preventDefault());
    el.addEventListener('click', (e) => { const b = e.target.closest('.it'); if (b) slashInsert(b.dataset.t); });
    document.body.appendChild(el); slashState = { el, i: 0 };
  }
  const el = slashState.el, h = el.offsetHeight;
  el.style.left = clamp(rect.left, 10, innerWidth - 310) + 'px';
  el.style.top = (rect.bottom + h + 12 > innerHeight ? Math.max(10, rect.top - h - 8) : rect.bottom + 8) + 'px';
}
function closeSlash() { if (slashState) { slashState.el.remove(); slashState = null; } }

/* ================= seletor de sons ================= */
// mode: 'single' | 'multi'; kinds: ['fx'] etc. Devolve controle com .value
function soundPicker(root, { kinds, mode = 'single', value = [], onChange }) {
  let sel = [...value], q = '', tab = 'all', playing = null, rec = null;
  const listFor = () => {
    const builtin = Som.catalog.filter((s) => kinds.includes(s.kind));
    const mine = userSounds.map((u) => ({ id: 'u:' + u.id, name: u.name, kind: 'user', icon: 'mic', tags: 'meu som gravado' }));
    let all = tab === 'mine' ? mine : tab === 'all' ? [...builtin, ...mine] : builtin;
    if (q) { const k = q.toLowerCase(); all = all.filter((s) => (s.name + ' ' + (s.tags || '')).toLowerCase().includes(k)); }
    return all;
  };
  const kindLabel = { amb: 'ambiente · repete', mus: 'música', fx: 'efeito', user: 'meu som' };
  const draw = () => {
    const list = listFor();
    root.innerHTML = `<div class="picker-tools"><label class="search">${I('search', 'muted')}<input placeholder="Buscar: chuva, porta, medo…" value="${esc(q)}" id="pq"></label></div>
      <div class="seg" style="margin-bottom:10px"><button data-tab="all" class="${tab === 'all' ? 'on' : ''}">Todos</button><button data-tab="mine" class="${tab === 'mine' ? 'on' : ''}">${I('mic')}Meus sons (${userSounds.length})</button></div>
      ${rec ? `<div class="rec-box"><span class="rec-dot"></span><b id="recT">Gravando… 0:00</b><span class="grow"></span><button class="btn sm danger" data-rec="stop">${I('stop')}Parar</button></div>` : `<div class="row" style="margin-bottom:10px"><button class="btn sm" data-rec="start" style="flex:1">${I('mic')}Gravar um som</button><button class="btn sm" data-up style="flex:1">${I('upload')}Enviar arquivo</button></div>`}
      <div class="slist">${list.length ? list.map((s) => `<div class="sitem ${sel.includes(s.id) ? 'on' : ''}" data-id="${esc(s.id)}" role="button" tabindex="0">
        <span class="ic ${kindCls(s.kind)}">${I(s.icon)}</span><span class="tx"><b>${esc(s.name)}</b><small>${kindLabel[s.kind]}</small></span>
        <button class="pp" data-pp="${esc(s.id)}" aria-label="Ouvir">${I(playing === s.id ? 'stop' : 'play', 'fill')}</button>
        ${mode === 'multi' ? `<span class="tick">${I('check')}</span>` : ''}</div>`).join('') : `<div class="empty">${tab === 'mine' ? 'Você ainda não tem sons seus. Grave ou envie um arquivo.' : 'Nada encontrado.'}</div>`}</div>`;
    const qi = $('#pq', root); qi.oninput = () => { q = qi.value; const pos = qi.selectionStart; draw(); const n = $('#pq', root); n.focus(); n.setSelectionRange(pos, pos); };
  };
  root.addEventListener('click', async (e) => {
    const t = e.target;
    const tb = t.closest('[data-tab]'); if (tb) { tab = tb.dataset.tab; draw(); return; }
    const pp = t.closest('[data-pp]');
    if (pp) {
      e.stopPropagation();
      if (playing === pp.dataset.pp) { Som.stopPreview(); playing = null; } else { await Som.previewSound(pp.dataset.pp, 0.8); playing = pp.dataset.pp; clearTimeout(root.pt); root.pt = setTimeout(() => { playing = null; draw(); }, 7000); }
      draw(); return;
    }
    if (t.closest('[data-up]')) {
      const f = await pickFile('audio/*'); if (!f) return;
      if (f.size > 25 * 1024 * 1024) { toast('Arquivo muito grande (máx. 25 MB)'); return; }
      const m = await saveMedia('audio', f, f.name.replace(/\.[^.]+$/, '').slice(0, 60));
      pick('u:' + m.id); tab = 'mine'; draw(); toast('Som adicionado aos seus sons'); return;
    }
    const rb = t.closest('[data-rec]');
    if (rb) { if (rb.dataset.rec === 'start') startRec(); else rec && rec.stop(); return; }
    const it = t.closest('.sitem'); if (it) { pick(it.dataset.id); draw(); }
  });
  const pick = (id) => {
    if (mode === 'single') sel = [id];
    else sel = sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id].slice(-4);
    onChange && onChange(sel);
  };
  async function startRec() {
    if (!navigator.mediaDevices || !window.MediaRecorder) { toast('Este navegador não grava áudio'); return; }
    let stream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch (e) { toast('Permita o uso do microfone para gravar'); return; }
    const mr = new MediaRecorder(stream), chunks = [], t0 = Date.now();
    mr.ondataavailable = (ev) => ev.data.size && chunks.push(ev.data);
    mr.onstop = async () => {
      stream.getTracks().forEach((tr) => tr.stop()); clearInterval(timer); rec = null;
      const blob = new Blob(chunks, { type: mr.mimeType || 'audio/webm' });
      if (blob.size < 1000) { draw(); return; }
      const name = await askText('Nome do som', `Gravação ${userSounds.length + 1}`);
      const m = await saveMedia('audio', blob, name || 'Gravação');
      pick('u:' + m.id); tab = 'mine'; draw(); toast('Gravação salva nos seus sons');
    };
    const timer = setInterval(() => { const s = Math.floor((Date.now() - t0) / 1000); const el = $('#recT', root); if (el) el.textContent = `Gravando… ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; if (s >= 120) mr.stop(); }, 250);
    mr.start(); rec = mr; draw();
  }
  draw();
  return { get value() { return sel; }, set value(v) { sel = v; draw(); }, stop() { Som.stopPreview(); if (rec) rec.stop(); }, redraw: draw };
}

const panOpts = [[-0.7, 'Esquerda'], [0, 'Centro'], [0.7, 'Direita']];
function fxDialog(existing, put, remove) {
  const d = existing ? existing.dataset : {};
  let vol = +d.vol || 0.85, pan = +d.pan || 0, label = d.label || '';
  const m = modal(`${sheetHead(existing ? 'Som no texto' : 'Inserir som')}<div class="sheet-b">
    <p class="muted" style="font-size:13px;margin-bottom:12px">O som toca uma vez quando o leitor chegar neste ponto do texto.</p>
    <div id="pk"></div>
    <div class="field" style="margin-top:14px"><label>Texto que aparece no editor</label><input class="input" id="lb" value="${esc(label)}" placeholder="Ex.: trovão ao longe" maxlength="40"></div>
    <div class="field"><label>Volume</label><div class="vol"><input type="range" class="range" id="vl" min="0.1" max="1" step="0.05" value="${vol}"><span id="vlt">${Math.round(vol * 100)}%</span></div></div>
    <div class="field"><label>De onde vem o som</label><div class="seg" id="pn">${panOpts.map(([v, n]) => `<button data-v="${v}" class="${Math.abs(v - pan) < 0.1 ? 'on' : ''}">${n}</button>`).join('')}</div></div>
  </div><div class="sheet-f">${remove ? `<button class="btn danger" id="rm">${I('trash')}</button>` : ''}<button class="btn" id="hear">${I('play', 'fill')}Ouvir</button><span class="grow"></span><button class="btn" data-close>Cancelar</button><button class="btn pri" id="ok">${existing ? 'Salvar' : 'Inserir'}</button></div>`, { onClose: () => pk.stop() });
  const lb = $('#lb', m.el);
  const pk = soundPicker($('#pk', m.el), { kinds: ['fx'], value: d.sound ? [d.sound] : [], onChange: (s) => { if (!lb.dataset.touched) lb.value = soundInfo(s[0]).name.toLowerCase(); } });
  lb.oninput = () => { lb.dataset.touched = 1; };
  if (label) lb.dataset.touched = 1;
  $('#vl', m.el).oninput = (e) => { vol = +e.target.value; $('#vlt', m.el).textContent = Math.round(vol * 100) + '%'; };
  $('#pn', m.el).onclick = (e) => { const b = e.target.closest('button'); if (!b) return; pan = +b.dataset.v; $$('button', $('#pn', m.el)).forEach((x) => x.classList.toggle('on', x === b)); };
  $('#hear', m.el).onclick = () => { if (pk.value[0]) Som.previewSound(pk.value[0], vol, pan); else toast('Escolha um som'); };
  if (remove) $('#rm', m.el).onclick = () => { m.close(); remove(); };
  $('#ok', m.el).onclick = () => {
    const id = pk.value[0]; if (!id) { toast('Escolha um som'); return; }
    const el = document.createElement('span'); el.className = 'm-fx';
    Object.assign(el.dataset, { sound: id, vol: vol.toFixed(2), pan: String(pan), label: lb.value.trim() || soundInfo(id).name.toLowerCase() });
    m.close(); put(el);
  };
}
function ambDialog(existing, put, remove) {
  let layers = existing ? parseLayers(existing.dataset.layers) : [];
  let silence = !!existing && !layers.length;
  const m = modal(`${sheetHead('Ambiente da cena')}<div class="sheet-b">
    <p class="muted" style="font-size:13px;margin-bottom:12px">O ambiente fica tocando em volta da leitura a partir daqui, até o próximo ambiente ou mudança de cena. Junte até 4 sons.</p>
    <label class="check"><input type="checkbox" id="sil" ${silence ? 'checked' : ''}><span>Silêncio<small>para o ambiente neste ponto</small></span></label>
    <div class="layers" id="ly"></div><div id="pk"></div>
  </div><div class="sheet-f">${remove ? `<button class="btn danger" id="rm">${I('trash')}</button>` : ''}<button class="btn" id="hear">${I('play', 'fill')}Ouvir juntos</button><span class="grow"></span><button class="btn" data-close>Cancelar</button><button class="btn pri" id="ok">${existing ? 'Salvar' : 'Inserir'}</button></div>`, { onClose: () => { pk.stop(); Som.setAmbience([], 0.8); } });
  const ly = $('#ly', m.el);
  const drawLayers = () => {
    ly.innerHTML = layers.map((l, i) => `<div class="layer"><div class="top">${I(soundInfo(l.id).icon)}${esc(soundInfo(l.id).name)}<button data-x="${i}" aria-label="Tirar">${I('x')}</button></div><div class="vol">${I('vol')}<input type="range" class="range" data-v="${i}" min="0.05" max="1" step="0.05" value="${l.vol}"><span>${Math.round(l.vol * 100)}%</span></div></div>`).join('');
    ly.hidden = silence || !layers.length; $('#pk', m.el).hidden = silence;
  };
  const pk = soundPicker($('#pk', m.el), { kinds: ['amb'], mode: 'multi', value: layers.map((l) => l.id), onChange: (ids) => { layers = ids.map((id) => layers.find((l) => l.id === id) || { id, vol: 0.6 }); drawLayers(); } });
  drawLayers();
  ly.oninput = (e) => { const i = e.target.dataset.v; if (i == null) return; layers[i].vol = +e.target.value; e.target.nextElementSibling.textContent = Math.round(layers[i].vol * 100) + '%'; if (m.el.hearing) Som.setAmbience(layers, 0.3); };
  ly.onclick = (e) => { const b = e.target.closest('[data-x]'); if (!b) return; layers.splice(+b.dataset.x, 1); pk.value = layers.map((l) => l.id); drawLayers(); };
  $('#sil', m.el).onchange = (e) => { silence = e.target.checked; drawLayers(); };
  $('#hear', m.el).onclick = () => {
    if (m.el.hearing) { Som.setAmbience([], 0.8); m.el.hearing = false; $('#hear', m.el).innerHTML = `${I('play', 'fill')}Ouvir juntos`; return; }
    if (!layers.length) { toast('Escolha pelo menos um som'); return; }
    Som.stopPreview(); Som.setAmbience(layers, 0.6); m.el.hearing = true; $('#hear', m.el).innerHTML = `${I('stop', 'fill')}Parar`;
  };
  if (remove) $('#rm', m.el).onclick = () => { m.close(); remove(); };
  $('#ok', m.el).onclick = () => {
    if (!silence && !layers.length) { toast('Escolha um som ou marque Silêncio'); return; }
    const el = document.createElement('div'); el.className = 'm-amb'; el.dataset.layers = silence ? '' : layersAttr(layers);
    m.close(); put(el);
  };
}
function musDialog(existing, put, remove) {
  const d = existing ? existing.dataset : {};
  let vol = +d.vol || 0.45, stop = !!existing && !d.sound;
  const m = modal(`${sheetHead('Música')}<div class="sheet-b">
    <p class="muted" style="font-size:13px;margin-bottom:12px">A música entra suave a partir daqui e continua até outra música, "parar música" ou mudança de cena.</p>
    <label class="check"><input type="checkbox" id="st" ${stop ? 'checked' : ''}><span>Parar a música aqui<small>a música anterior some devagar</small></span></label>
    <div id="opts"><div class="field"><label>Volume</label><div class="vol"><input type="range" class="range" id="vl" min="0.1" max="1" step="0.05" value="${vol}"><span id="vlt">${Math.round(vol * 100)}%</span></div></div><div id="pk"></div></div>
  </div><div class="sheet-f">${remove ? `<button class="btn danger" id="rm">${I('trash')}</button>` : ''}<span class="grow"></span><button class="btn" data-close>Cancelar</button><button class="btn pri" id="ok">${existing ? 'Salvar' : 'Inserir'}</button></div>`, { onClose: () => pk.stop() });
  const pk = soundPicker($('#pk', m.el), { kinds: ['mus'], value: d.sound ? [d.sound] : [] });
  $('#opts', m.el).hidden = stop;
  $('#st', m.el).onchange = (e) => { stop = e.target.checked; $('#opts', m.el).hidden = stop; };
  $('#vl', m.el).oninput = (e) => { vol = +e.target.value; $('#vlt', m.el).textContent = Math.round(vol * 100) + '%'; };
  if (remove) $('#rm', m.el).onclick = () => { m.close(); remove(); };
  $('#ok', m.el).onclick = () => {
    if (!stop && !pk.value[0]) { toast('Escolha uma música'); return; }
    const el = document.createElement('div'); el.className = 'm-mus';
    el.dataset.sound = stop ? '' : pk.value[0]; el.dataset.vol = vol.toFixed(2);
    m.close(); put(el);
  };
}
async function imageDialog(existing, put, remove) {
  const d = existing ? existing.dataset : {};
  let src = d.media ? { media: d.media } : d.art ? { art: d.art } : null;
  let tab = d.media ? 'mine' : d.art ? 'art' : 'up';
  const imgs = (await DB.all('media')).filter((x) => x.kind === 'image').sort((a, b) => b.createdAt - a.createdAt);
  const m = modal(`${sheetHead(existing ? 'Imagem' : 'Inserir imagem')}<div class="sheet-b">
    <div class="ipreview" id="pv" ${src ? '' : 'hidden'}></div>
    <div class="seg" id="tb" style="margin-bottom:12px"><button data-t="up">${I('upload')}Do aparelho</button><button data-t="art">${I('spark')}Ilustrações</button><button data-t="mine">${I('image')}Já usadas (${imgs.length})</button></div>
    <div id="tc" style="margin-bottom:14px"></div>
    <div class="field"><label>Legenda (opcional)</label><input class="input" id="cp" value="${esc(d.caption || '')}" placeholder="Ex.: A clareira ao luar" maxlength="120"></div>
    <label class="check"><input type="checkbox" id="zm" ${d.fx === 'zoom' || !existing ? 'checked' : ''}><span>Zoom lento<small>a imagem se aproxima devagar, como no cinema</small></span></label>
    <label class="check"><input type="checkbox" id="bgk" ${d.bg === '1' || !existing ? 'checked' : ''}><span>Fundo da leitura<small>vira o cenário atrás do texto a partir daqui</small></span></label>
  </div><div class="sheet-f">${remove ? `<button class="btn danger" id="rm">${I('trash')}</button>` : ''}<span class="grow"></span><button class="btn" data-close>Cancelar</button><button class="btn pri" id="ok">${existing ? 'Salvar' : 'Inserir'}</button></div>`, { wide: true });
  const pv = $('#pv', m.el), tc = $('#tc', m.el);
  const drawPv = async () => { pv.hidden = !src; if (!src) return; pv.innerHTML = src.media ? `<img src="${await mediaURL(src.media)}" alt="">` : Arte.svg(src.art); };
  const drawTab = () => {
    $$('#tb button', m.el).forEach((b) => b.classList.toggle('on', b.dataset.t === tab));
    if (tab === 'up') tc.innerHTML = `<button class="drop" id="dp">${I('upload')}<b>Escolher foto ou desenho</b><span style="font-size:12.5px">JPG, PNG ou da câmera do celular</span></button>`;
    else if (tab === 'art') tc.innerHTML = `<div class="igrid">${Arte.temas.map((t) => `<button data-art="${t.id}" class="${src && src.art === t.id ? 'on' : ''}">${Arte.svg(t.id)}<span>${esc(t.name)}</span></button>`).join('')}</div>`;
    else { tc.innerHTML = imgs.length ? `<div class="igrid">${imgs.map((x) => `<button data-media="${x.id}" class="${src && src.media === x.id ? 'on' : ''}"><img data-media="${x.id}" alt=""></button>`).join('')}</div>` : '<div class="empty">Nenhuma imagem enviada ainda.</div>'; fillMedia(tc); }
  };
  drawTab(); drawPv();
  $('#tb', m.el).onclick = (e) => { const b = e.target.closest('button'); if (b) { tab = b.dataset.t; drawTab(); } };
  tc.onclick = async (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.id === 'dp') {
      const f = await pickFile('image/*'); if (!f) return;
      b.innerHTML = 'Preparando a imagem…';
      const md = await saveMedia('image', await resizeImage(f), f.name); imgs.unshift(md); src = { media: md.id };
      if (!$('#cp', m.el).value) $('#cp', m.el).placeholder = 'Escreva uma legenda (opcional)';
      tab = 'mine'; drawTab(); drawPv(); return;
    }
    src = b.dataset.art ? { art: b.dataset.art } : { media: b.dataset.media }; drawTab(); drawPv();
  };
  if (remove) $('#rm', m.el).onclick = () => { m.close(); remove(); };
  $('#ok', m.el).onclick = () => {
    if (!src) { toast('Escolha uma imagem'); return; }
    const el = document.createElement('figure'); el.className = 'm-img';
    if (src.media) el.dataset.media = src.media; else el.dataset.art = src.art;
    el.dataset.caption = $('#cp', m.el).value.trim(); el.dataset.fx = $('#zm', m.el).checked ? 'zoom' : ''; el.dataset.bg = $('#bgk', m.el).checked ? '1' : '';
    m.close(); put(el);
  };
}

/* ================= LEITURA ================= */
function viewReader(book, ci) {
  ci = clamp(ci, 0, book.chapters.length - 1);
  const ch = book.chapters[ci];
  document.title = `${ch.title} — ${book.title}`;
  const t = document.createElement('template'); t.innerHTML = sanitize(ch.html);
  for (const el of [...t.content.querySelectorAll('.m-fx')]) {
    const s = soundInfo(el.dataset.sound), n = document.createElement('span');
    n.className = 'r-fx'; n.dataset.trigger = 'fx'; n.dataset.sound = el.dataset.sound; n.dataset.vol = el.dataset.vol || '0.85'; n.dataset.pan = el.dataset.pan || '0'; n.dataset.name = el.dataset.label || s.name; n.dataset.icon = s.icon;
    n.innerHTML = I(s.icon); n.title = el.dataset.label || s.name; el.replaceWith(n);
  }
  for (const el of [...t.content.querySelectorAll('.m-amb')]) {
    const ls = parseLayers(el.dataset.layers), n = document.createElement('div');
    n.className = 'r-mark'; n.dataset.trigger = 'amb'; n.dataset.layers = el.dataset.layers || '';
    n.innerHTML = ls.length ? ls.map((l) => `<span>${I(soundInfo(l.id).icon)}${esc(soundInfo(l.id).name)}</span>`).join('') : `<span>${I('mute')}silêncio</span>`;
    el.replaceWith(n);
  }
  for (const el of [...t.content.querySelectorAll('.m-mus')]) {
    const n = document.createElement('div'); n.className = 'r-mark mus'; n.dataset.trigger = 'mus'; n.dataset.sound = el.dataset.sound || ''; n.dataset.vol = el.dataset.vol || '0.45';
    n.innerHTML = `<span>${I(el.dataset.sound ? 'music' : 'mute')}${el.dataset.sound ? esc(soundInfo(el.dataset.sound).name) : 'a música para'}</span>`;
    el.replaceWith(n);
  }
  for (const el of [...t.content.querySelectorAll('.m-scene')]) { const n = document.createElement('div'); n.className = 'r-scene'; n.dataset.trigger = 'scene'; n.textContent = '✦ ✦ ✦'; el.replaceWith(n); }
  for (const el of [...t.content.querySelectorAll('.m-img')]) {
    const d = el.dataset, n = document.createElement('figure'); n.className = 'r-img'; n.dataset.trigger = 'img';
    if (d.media) n.dataset.media = d.media; else n.dataset.art = d.art || 'floresta';
    n.dataset.fx = d.fx || ''; n.dataset.bg = d.bg || '';
    n.innerHTML = `<div class="frame">${d.media ? `<img data-media="${esc(d.media)}" alt="">` : Arte.svg(d.art)}</div>${d.caption ? `<figcaption>${esc(d.caption)}</figcaption>` : ''}`;
    el.replaceWith(n);
  }
  const holder = document.createElement('div'); holder.appendChild(t.content);
  const next = book.chapters[ci + 1];
  const fs = LS.get('imersa-fs', 1), FS = [19, 21, 23, 26, 29];
  app.innerHTML = `<div class="reader" id="rd">
    <div class="r-bg"><div class="r-layer" id="bgA"></div><div class="r-layer" id="bgB"></div><div class="r-shade"></div></div>
    <header class="r-top"><button class="icon-btn ghost" id="back" aria-label="Voltar">${I('left')}</button>
      <div class="t"><b>${esc(book.title)}</b><small>Capítulo ${roman(ci)} · ${esc(ch.title)}</small></div><span class="grow"></span>
      <button class="icon-btn ghost" id="fsBtn" aria-label="Tamanho da letra">${I('type')}</button>
      <button class="icon-btn ghost on" id="sndBtn" aria-label="Som ligado">${I('head')}</button>
      <button class="icon-btn ghost" id="edBtn" aria-label="Editar">${I('pen')}</button></header>
    <article class="r-col"><div class="chapno">Capítulo ${roman(ci)}</div><h1>${esc(ch.title)}</h1>
      <div class="r-text" id="rt" style="--rfs:${FS[fs]}px">${holder.innerHTML}</div>
      <div class="r-end"><div class="orn">✦ ❦ ✦</div><div class="acts">
        ${next ? `<button class="btn pri" data-go="#/ler/${book.id}/${ci + 1}">Próximo: ${esc(next.title)}${I('right')}</button>` : '<p class="muted" style="font-family:var(--serif);font-size:22px;font-style:italic">Fim.</p>'}
      </div><div class="acts"><button class="btn sm" data-go="#/livro/${book.id}/${ci}">${I('pen')}Editar capítulo</button><button class="btn sm" data-go="#/">${I('book')}Estante</button></div></div>
    </article>
    <footer class="r-bar"><div class="nowpl"><button class="icon-btn ghost" id="mtBtn" aria-label="Pausar sons">${I('pause', 'fill')}</button><span class="tx"><b id="npT">Silêncio</b><small id="npS">os sons começam com a leitura</small></span><span class="eq" id="eq"><i></i><i></i><i></i><i></i><i></i></span></div>
      <div class="track"><div class="ln" id="ln"><i id="lnI" style="width:0"></i></div><div class="lg"><span id="pgT"></span><span class="hide-m">capítulo ${ci + 1} de ${book.chapters.length}</span></div></div>
      <input type="range" class="range r-vol" id="vol" min="0" max="1" step="0.05" value="${LS.get('imersa-vol', 0.9)}" aria-label="Volume"></footer>
    <div class="toast-fx" id="fxT"><span class="d"></span><span></span></div>
  </div>`;
  fillMedia(app);
  $$('[data-go]', app).forEach((b) => b.onclick = () => go(b.dataset.go));
  $('#back').onclick = () => go(`#/livro/${book.id}/${ci}`);
  $('#edBtn').onclick = () => go(`#/livro/${book.id}/${ci}`);
  const rt = $('#rt');
  $('#fsBtn').onclick = () => { const v = (LS.get('imersa-fs', 1) + 1) % FS.length; LS.set('imersa-fs', v); rt.style.setProperty('--rfs', FS[v] + 'px'); toast(['Letra pequena', 'Letra normal', 'Letra média', 'Letra grande', 'Letra bem grande'][v], 1200); };
  Som.setMaster(LS.get('imersa-vol', 0.9));
  $('#vol').oninput = (e) => { Som.setMaster(+e.target.value); LS.set('imersa-vol', +e.target.value); };

  const triggers = $$('[data-trigger]', rt), fxs = triggers.filter((x) => x.dataset.trigger === 'fx');
  let soundOn = false, paused = false, curAmb = null, curMus = null, curBg = null, first = true;

  // marcadores na barra de progresso
  const ln = $('#ln');
  const placeMarks = () => {
    $$('.mk', ln).forEach((x) => x.remove());
    const H = document.documentElement.scrollHeight - innerHeight;
    triggers.forEach((el) => {
      const y = el.getBoundingClientRect().top + scrollY - innerHeight * 0.6, c = { fx: 'var(--amber)', img: 'var(--rose)', amb: 'var(--teal)', mus: 'var(--violet)', scene: '#fff' }[el.dataset.trigger];
      const s = document.createElement('span'); s.className = 'mk'; s.style.left = clamp(y / H * 100, 0, 100) + '%'; s.style.background = c; s.style.boxShadow = `0 0 8px ${c}`; ln.appendChild(s);
    });
  };

  // fundo
  const bgs = [$('#bgA'), $('#bgB')]; let bgI = 0;
  const setBg = async (key, html, zoom) => {
    if (key === curBg) return; curBg = key;
    bgI = 1 - bgI; const L = bgs[bgI], O = bgs[1 - bgI];
    L.innerHTML = typeof html === 'function' ? html() : html; L.classList.toggle('zoom', !!zoom); await fillMedia(L);
    requestAnimationFrame(() => { L.classList.add('on'); O.classList.remove('on'); });
  };
  const defBg = book.coverMedia ? `<img data-media="${esc(book.coverMedia)}" alt="">` : Arte.svg(book.theme);
  setBg('def', defBg, true);

  const fxToast = $('#fxT');
  const showFx = (el) => {
    fxToast.firstElementChild.innerHTML = I(el.dataset.icon); fxToast.lastElementChild.textContent = el.dataset.name;
    fxToast.classList.add('on'); clearTimeout(fxToast.h); fxToast.h = setTimeout(() => fxToast.classList.remove('on'), 2200);
  };
  const updNow = () => {
    const names = [...(curAmb || []).map((l) => soundInfo(l.id).name), ...(curMus ? [soundInfo(curMus.id).name] : [])];
    $('#npT').textContent = !soundOn ? 'Som desligado' : paused ? 'Sons pausados' : names.length ? names.slice(0, 2).join(' · ') + (names.length > 2 ? ` +${names.length - 2}` : '') : 'Silêncio';
    $('#npS').textContent = !soundOn ? 'toque no fone para ligar' : names.length ? (curMus ? 'ambiente e música' : 'ambiente da cena') : 'os sons seguem a leitura';
    $('#eq').classList.toggle('on', soundOn && !paused && names.length > 0);
    $('#mtBtn').innerHTML = I(paused || !soundOn ? 'play' : 'pause', 'fill');
  };
  const applyAudio = () => {
    if (!soundOn || paused) { Som.setAmbience([], 1.2); Som.setMusic(null, 0.5, 1.5); return; }
    Som.setAmbience(curAmb || [], 3);
    if (curMus) Som.setMusic(curMus.id, curMus.vol, 4); else Som.setMusic(null, 0.5, 3);
  };
  let calmT;
  const update = () => {
    const line = innerHeight * 0.6;
    let amb = [], mus = null, bg = null;
    for (const el of triggers) {
      const top = el.getBoundingClientRect().top; if (top > line) break;
      const k = el.dataset.trigger;
      if (k === 'amb') amb = parseLayers(el.dataset.layers);
      else if (k === 'mus') mus = el.dataset.sound ? { id: el.dataset.sound, vol: +el.dataset.vol || 0.45 } : null;
      else if (k === 'scene') { amb = []; mus = null; }
      else if (k === 'img' && el.dataset.bg === '1') bg = el;
    }
    const ak = JSON.stringify(amb), mk = mus ? mus.id + mus.vol : '';
    if (ak !== JSON.stringify(curAmb) || mk !== (curMus ? curMus.id + curMus.vol : '')) { curAmb = amb; curMus = mus; applyAudio(); updNow(); }
    if (bg) setBg(bg.dataset.media || bg.dataset.art, () => bg.dataset.media ? `<img data-media="${esc(bg.dataset.media)}" alt="">` : Arte.svg(bg.dataset.art), bg.dataset.fx === 'zoom');
    else setBg('def', defBg, true);
    for (const el of fxs) {
      const top = el.getBoundingClientRect().top;
      if (top < line && !el.fired) {
        el.fired = true; el.classList.add('fired');
        if (!first && soundOn && !paused) { Som.playFx(el.dataset.sound, +el.dataset.vol, +el.dataset.pan); showFx(el); if (navigator.vibrate && el.dataset.sound === 'b:thunder') navigator.vibrate(60); }
      } else if (top > line + 80 && el.fired) { el.fired = false; el.classList.remove('fired'); }
    }
    first = false;
    const H = document.documentElement.scrollHeight - innerHeight, p = H > 0 ? clamp(scrollY / H, 0, 1) : 0;
    $('#lnI').style.width = p * 100 + '%';
    const left = Math.max(0, Math.round(((1 - p) * chapterStats(ch.html).words) / 200));
    $('#pgT').textContent = p > 0.98 ? 'fim do capítulo' : left > 1 ? `faltam uns ${left} min neste capítulo` : 'falta menos de 2 min neste capítulo';
  };
  let raf = 0;
  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(() => { raf = 0; update(); });
    $('#rd').classList.remove('calm'); clearTimeout(calmT); calmT = setTimeout(() => $('#rd') && scrollY > 120 && $('#rd').classList.add('calm'), 2500);
  };
  addEventListener('scroll', onScroll, { passive: true });
  const onResize = () => { placeMarks(); update(); };
  addEventListener('resize', onResize);
  onLeave(() => { removeEventListener('scroll', onScroll); removeEventListener('resize', onResize); clearTimeout(calmT); Som.stopAll(1.2); });

  $('#sndBtn').onclick = () => {
    soundOn = !soundOn; $('#sndBtn').classList.toggle('on', soundOn);
    if (soundOn) { Som.init(); paused = false; } applyAudio(); updNow();
  };
  $('#mtBtn').onclick = () => {
    if (!soundOn) { $('#sndBtn').click(); return; }
    paused = !paused; applyAudio(); updNow();
  };

  // tela de início: o navegador só deixa tocar som depois de um toque
  const start = document.createElement('div'); start.className = 'r-start';
  start.innerHTML = `<div class="card">${coverHTML(book)}<div class="chapno" style="color:var(--amber)">Capítulo ${roman(ci)}</div><h2>${esc(ch.title)}</h2>
    <p>Use fones de ouvido para sentir os sons em volta de você.</p>
    <button class="btn pri" id="go1">${I('head')}Ler com som</button><button class="btn" id="go2">Ler sem som</button></div>`;
  app.appendChild(start); fillMedia(start);
  const begin = (withSound) => {
    soundOn = withSound; $('#sndBtn').classList.toggle('on', soundOn);
    if (soundOn) Som.init();
    start.remove(); curAmb = null; curMus = null; update(); applyAudio(); updNow();
  };
  $('#go1').onclick = () => begin(true); $('#go2').onclick = () => begin(false);
  requestAnimationFrame(() => { placeMarks(); update(); updNow(); });
  setTimeout(placeMarks, 800);
}

/* ================= SONS ================= */
function viewSounds() {
  document.title = 'Imersa — sons';
  let playing = null, rec = null;
  const groups = [['amb', 'Ambientes', 'tocam em loop durante a cena'], ['mus', 'Músicas', 'trilhas que entram suaves'], ['fx', 'Efeitos', 'tocam uma vez, no momento certo do texto']];
  const draw = () => {
    app.innerHTML = `<header class="topbar"><button class="icon-btn" id="bk" aria-label="Voltar">${I('left')}</button><div class="logo" style="font-size:19px">Biblioteca de sons</div><span class="grow"></span></header>
    <div class="sounds">
      <div class="sec-h"><h2>Meus sons</h2></div>
      ${rec ? `<div class="rec-box"><span class="rec-dot"></span><b id="recT">Gravando…</b><span class="grow"></span><button class="btn sm danger" id="recStop">${I('stop')}Parar</button></div>` : `<div class="row" style="margin-bottom:12px;flex-wrap:wrap"><button class="btn teal" id="recGo">${I('mic')}Gravar um som</button><button class="btn" id="upGo">${I('upload')}Enviar arquivo de áudio</button></div>`}
      <div class="sgrid">${userSounds.length ? userSounds.map((s) => card({ id: 'u:' + s.id, name: s.name, kind: 'user', icon: 'mic' }, true)).join('') : '<p class="muted" style="grid-column:1/-1;font-size:14px">Grave sua voz, um barulho de casa ou envie músicas e efeitos. Eles aparecem aqui e na hora de inserir sons no livro.</p>'}</div>
      ${groups.map(([k, t, sub]) => `<div class="sec-h"><h2>${t} <span class="muted" style="font-weight:400;font-size:13px">· ${sub}</span></h2></div><div class="sgrid">${Som.catalog.filter((s) => s.kind === k).map((s) => card(s)).join('')}</div>`).join('')}
    </div>`;
    $('#bk').onclick = () => history.length > 1 ? history.back() : go('#/');
  };
  const card = (s, mine) => `<div class="scard ${playing === s.id ? 'playing' : ''}" data-id="${esc(s.id)}"><span class="ic ${kindCls(s.kind)}">${I(s.icon)}</span><span><b>${esc(s.name)}</b><small>${{ amb: 'ambiente', mus: 'música', fx: 'efeito', user: 'meu som' }[s.kind]}</small></span>
    <span class="acts"><button data-play aria-label="Ouvir">${I(playing === s.id ? 'stop' : 'play', 'fill')}</button>${mine ? `<button data-ren aria-label="Renomear">${I('edit')}</button><button data-del aria-label="Excluir">${I('trash')}</button>` : ''}</span></div>`;
  draw();
  app.onclick = async (e) => {
    const t = e.target;
    if (t.closest('#recGo')) return startRec();
    if (t.closest('#recStop')) return rec && rec.stop();
    if (t.closest('#upGo')) {
      const f = await pickFile('audio/*'); if (!f) return;
      if (f.size > 25 * 1024 * 1024) return toast('Arquivo muito grande (máx. 25 MB)');
      await saveMedia('audio', f, f.name.replace(/\.[^.]+$/, '').slice(0, 60)); draw(); toast('Som adicionado'); return;
    }
    const c = t.closest('.scard'); if (!c) return;
    const id = c.dataset.id;
    if (t.closest('[data-ren]')) { const u = userSounds.find((x) => 'u:' + x.id === id); const n = await askText('Renomear som', u.name); if (n) { const m = await DB.get('media', u.id); m.name = n; await DB.put('media', m); await loadUserSounds(); draw(); } return; }
    if (t.closest('[data-del]')) {
      const u = userSounds.find((x) => 'u:' + x.id === id);
      if (!(await ask('Excluir som?', `"${u.name}" será apagado. Nos livros em que ele foi usado, o lugar fica sem som.`, 'Excluir', true))) return;
      await DB.del('media', u.id); Som.forget(id); await loadUserSounds(); draw(); return;
    }
    if (playing === id) { Som.stopPreview(); playing = null; } else { await Som.previewSound(id, 0.85); playing = id; clearTimeout(app.pt); app.pt = setTimeout(() => { playing = null; if (location.hash === '#/sons') draw(); }, 7000); }
    draw();
  };
  onLeave(() => { app.onclick = null; Som.stopPreview(); if (rec) rec.stop(); });
  async function startRec() {
    if (!navigator.mediaDevices || !window.MediaRecorder) return toast('Este navegador não grava áudio');
    let stream; try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch (e) { return toast('Permita o uso do microfone para gravar'); }
    const mr = new MediaRecorder(stream), chunks = [], t0 = Date.now();
    mr.ondataavailable = (ev) => ev.data.size && chunks.push(ev.data);
    const timer = setInterval(() => { const s = Math.floor((Date.now() - t0) / 1000); const el = $('#recT'); if (el) el.textContent = `Gravando… ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; if (s >= 120) mr.stop(); }, 250);
    mr.onstop = async () => {
      stream.getTracks().forEach((tr) => tr.stop()); clearInterval(timer); rec = null;
      const blob = new Blob(chunks, { type: mr.mimeType || 'audio/webm' });
      if (blob.size > 1000 && location.hash === '#/sons') { const n = await askText('Nome do som', `Gravação ${userSounds.length + 1}`); await saveMedia('audio', blob, n || 'Gravação'); toast('Gravação salva'); }
      if (location.hash === '#/sons') draw();
    };
    mr.start(); rec = mr; draw();
  }
}

/* ================= backup ================= */
const blobToData = (b) => new Promise((r) => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(b); });
async function download(name, obj) {
  const FS = plugin('Filesystem'), SHARE = plugin('Share');
  if (FS && SHARE) {
    // No APK: grava o arquivo e abre o compartilhar (Google Drive, WhatsApp, Arquivos…).
    try {
      const { uri } = await FS.writeFile({ path: name, data: JSON.stringify(obj), directory: 'CACHE', encoding: 'utf8' });
      await SHARE.share({ title: name, files: [uri], dialogTitle: 'Guardar ou enviar o arquivo' });
    } catch (e) {
      if (!/cancel|abort/i.test(String(e && (e.message || e.name)))) toast('Não deu para gerar o arquivo.');
    }
    return;
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(obj)], { type: 'application/json' }));
  a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'livro';
async function packMedia(ids) {
  const out = [];
  for (const id of ids) { const m = await DB.get('media', id); if (m) { const { blob, ...rest } = m; out.push({ ...rest, data: await blobToData(blob) }); } }
  return out;
}
function mediaIdsOf(b) {
  const ids = new Set(); if (b.coverMedia) ids.add(b.coverMedia);
  for (const c of b.chapters) {
    for (const m of (c.html || '').matchAll(/data-media="([^"]+)"/g)) ids.add(m[1]);
    for (const m of (c.html || '').matchAll(/u:([a-z0-9]+)/g)) ids.add(m[1]);
  }
  return [...ids];
}
async function exportBook(b) {
  toast('Preparando o arquivo…');
  await download(`${slug(b.title)}.imersa.json`, { app: 'imersa', v: 1, books: [b], media: await packMedia(mediaIdsOf(b)) });
}
async function exportAll() {
  toast('Preparando o backup…');
  const media = await DB.all('media');
  await download(`imersa-backup-${new Date().toISOString().slice(0, 10)}.json`, { app: 'imersa', v: 1, books, media: await packMedia(media.map((m) => m.id)) });
}
async function importFile() {
  const f = await pickFile('application/json,.json'); if (!f) return;
  let data; try { data = JSON.parse(await f.text()); } catch (e) { return toast('Arquivo inválido'); }
  if (!data || data.app !== 'imersa' || !Array.isArray(data.books)) return toast('Este arquivo não é do Imersa');
  for (const m of data.media || []) {
    if (!m.id || !m.data) continue;
    const blob = await (await fetch(m.data)).blob(); const { data: _, ...rest } = m;
    await DB.put('media', { ...rest, blob });
  }
  let n = 0;
  for (const b of data.books) {
    if (!b || !Array.isArray(b.chapters)) continue;
    const nb = { ...newBook(), ...b, chapters: b.chapters.map((c) => ({ id: c.id || uid(), title: String(c.title || ''), html: sanitize(c.html) })) };
    if (getBook(nb.id)) { nb.id = uid(); nb.title += ' (cópia)'; }
    books.unshift(nb); await DB.put('books', nb); n++;
  }
  await loadUserSounds(); await loadBooks(); route();
  toast(n === 1 ? 'Livro aberto na estante' : `${n} livros abertos na estante`);
}

/* ================= livro de exemplo ================= */
function sampleBook() {
  const fx = (s, label, vol = 0.85, pan = 0) => `<span class="m-fx" data-sound="${s}" data-vol="${vol}" data-pan="${pan}" data-label="${label}"></span>`;
  const c1 = `<div class="m-amb" data-layers="b:forest:0.70|b:wind:0.25"></div>
<p>A névoa havia recuado para a beira do rio quando Lia finalmente alcançou a clareira. As árvores, antes cerradas como muralhas, abriam-se agora num círculo perfeito, e no centro dele a lua derramava uma luz tão fria que parecia possível segurá-la nas mãos.</p>
<p>Foi então que ouviu ${fx('b:owl', 'coruja ao longe', 0.8, -0.5)} um piado longo, vindo de muito acima, como se a própria noite tivesse resolvido falar.</p>
<div class="m-mus" data-sound="b:m_calm" data-vol="0.35"></div>
<figure class="m-img" data-art="floresta" data-fx="zoom" data-bg="1" data-caption="A clareira ao luar"></figure>
<p>Lia deu um passo à frente. Sob suas botas, um galho estalou ${fx('b:branch', 'galho quebrando', 0.9, 0.3)} e o som correu entre os troncos como um aviso.</p>
<p>— Quem está aí? — perguntou, e a própria voz lhe pareceu pequena demais para tanto silêncio.</p>
<p>Ninguém respondeu. Só os grilos, que continuavam sua conversa antiga, e o vento, que passava entre os pinheiros como quem procura alguma coisa perdida. Ela apertou a lanterna contra o peito e contou até dez, como a avó ensinara.</p>
<p>No sete, ouviu passos ${fx('b:steps', 'passos', 0.75, 0.6)} atrás de si. Leves, cuidadosos, quase educados.</p>
<p>No dez, virou-se.</p>
<div class="m-mus" data-sound="b:m_mystery" data-vol="0.4"></div>
<p>Não havia ninguém. Havia apenas, no chão úmido da clareira, uma trilha de pegadas pequenas que começava exatamente onde ela estava e seguia em direção ao rio — pegadas de alguém que, até um instante atrás, caminhava ao seu lado sem que ela soubesse.</p>
<p>Ao longe, muito longe, um lobo uivou ${fx('b:wolf', 'lobo uivando', 0.6, -0.6)} para a lua. Lia sentiu o coração bater mais rápido ${fx('b:heartbeat', 'coração', 0.9)} e, pela primeira vez desde que saíra de casa, pensou em voltar.</p>
<p>Mas não voltou.</p>
<div class="m-scene"></div>
<p>Quando o dia nasceu, ela já estava longe da floresta, seguindo as pegadas até a beira do mar.</p>`;
  const c2 = `<div class="m-amb" data-layers="b:sea:0.70|b:wind:0.45"></div>
<figure class="m-img" data-art="farol" data-fx="zoom" data-bg="1" data-caption="O farol no penhasco"></figure>
<p>A tempestade chegou sem pedir licença. Primeiro o vento, que dobrou as gramas do penhasco como quem penteia um bicho assustado; depois a chuva, grossa e fria, batendo nas pedras.</p>
<div class="m-amb" data-layers="b:storm:0.75|b:sea:0.55"></div>
<p>Lia ergueu os olhos para a torre. Lá no alto, onde ninguém subia havia quarenta anos, uma luz acabava de se acender.</p>
<div class="m-mus" data-sound="b:m_tension" data-vol="0.35"></div>
<p>E, no exato instante em que o céu se partiu ao meio ${fx('b:thunder', 'trovão', 1, -0.3)}, ela entendeu que não estava sozinha.</p>
<p>As ondas se lançavam contra o rochedo com a fúria de quem guarda um segredo. A porta do farol, que deveria estar trancada, rangia aberta ${fx('b:door', 'porta rangendo', 0.8, 0.4)} no ritmo do vento.</p>
<p>Ela entrou. A escada subia em espiral, e cada degrau respondia aos seus passos ${fx('b:steps', 'passos na escada', 0.7)} com um gemido de madeira velha. Do alto vinha um tique-taque ${fx('b:clock', 'relógio', 0.6, 0.5)} paciente, como se alguém marcasse o tempo à sua espera.</p>
<p>Lá em cima, diante da grande lente, havia uma menina de cabelos molhados olhando o mar.</p>
<p>— Você demorou — disse a menina, sem se virar. — As pegadas eram minhas.</p>
<div class="m-scene"></div>
<div class="m-amb" data-layers="b:rain:0.45"></div>
<div class="m-mus" data-sound="b:m_hope" data-vol="0.35"></div>
<figure class="m-img" data-art="aurora" data-fx="zoom" data-bg="1" data-caption="O amanhecer depois da tempestade"></figure>
<p>A chuva foi ficando mais fina até virar só um sussurro na janela. Quando o sol apareceu atrás das montanhas, as duas ainda conversavam, e lá embaixo, no vale, os sinos do castelo começaram a tocar ${fx('b:bell', 'sinos', 0.7, -0.4)}, um a um, acordando o mundo.</p>
<p>Lia sorriu. Às vezes, para encontrar o caminho de casa, é preciso primeiro se perder.</p>`;
  return newBook({ title: 'A Floresta dos Sussurros', author: 'Imersa', genre: 'Exemplo · fantasia', theme: 'floresta', chapters: [{ id: uid(), title: 'Sob a lua de prata', html: c1 }, { id: uid(), title: 'O farol esquecido', html: c2 }] });
}

/* ================= início ================= */
(async () => {
  try {
    await loadBooks(); await loadUserSounds();
    if (!LS.get('imersa-seeded', false) && !books.length) { const b = sampleBook(); await DB.put('books', b); books = [b]; }
    LS.set('imersa-seeded', true);
  } catch (e) {
    app.innerHTML = '<div class="empty">Não foi possível abrir o armazenamento do navegador. Saia do modo anônimo ou libere espaço e tente de novo.</div>';
    return;
  }
  addEventListener('hashchange', route);
  route();
  // Funciona sem internet: no site pelo service worker; no APK os arquivos já vêm dentro dele.
  if (!NATIVE && 'serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
  // Botão voltar do Android: fecha o que estiver aberto, depois volta uma tela, e na estante minimiza.
  const AppP = plugin('App');
  if (AppP) AppP.addListener('backButton', () => {
    if (slashState) { closeSlash(); return; }
    if ($('.menu')) { closeMenus(); return; }
    if (modalStack.length) { modalStack[modalStack.length - 1](); return; }
    if ($('.side.open')) { $('.side-bd') && $('.side-bd').click(); return; }
    const [, a, b, c] = (location.hash.slice(1) || '/').split('/');
    if (a === 'ler') go(`#/livro/${b}/${c || 0}`);
    else if (a === 'livro' || a === 'sons') go('#/');
    else AppP.minimizeApp();
  });
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
})();
