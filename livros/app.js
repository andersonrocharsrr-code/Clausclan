'use strict';
/* Calhamaço — escreva seus livros, com imagens e as fontes que quiser. Tudo fica salvo no aparelho (IndexedDB). */

/* ================= utilitários ================= */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI', 'XXII', 'XXIII', 'XXIV', 'XXV'];
const roman = (i) => ROMAN[i] || String(i + 1);
const fmt = (n) => n.toLocaleString('pt-BR');
const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sem espaço */ } } };
// No APK (Capacitor) usa os recursos do Android: salvar/compartilhar arquivos e o botão voltar.
const Cap = window.Capacitor;
const NATIVE = !!(Cap && Cap.isNativePlatform && Cap.isNativePlatform());
const plugin = (n) => (NATIVE ? (Cap.Plugins && Cap.Plugins[n]) || (Cap.registerPlugin && Cap.registerPlugin(n)) || null : null);

const IC = {
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
  pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', left: '<path d="m15 18-6-6 6-6"/>', right: '<path d="m9 18 6-6-6-6"/>', up: '<path d="m18 15-6-6-6 6"/>', down: '<path d="m6 9 6 6 6-6"/>',
  star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  quote: '<path d="M3 21c3 0 7-1 7-8V5H3v7h4c0 3-1 5-4 5zM14 21c3 0 7-1 7-8V5h-7v7h4c0 3-1 5-4 5z"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  focus: '<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  check: '<path d="M20 6 9 17l-5-5"/>', x: '<path d="M18 6 6 18M6 6l12 12"/>',
  more: '<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3.3A2.5 2.5 0 0 0 8.5 14.5z"/>',
  trash: '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
  edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z"/>',
  aa: '<path d="M3 18 8 6l5 12M4.6 14h6.8"/><path d="M15 12.5a3 3 0 1 1 0 4.5V10M21 18v-6"/>',
  sep: '<path d="M4 12h3M10.5 12h3M17 12h3"/>',
  h: '<path d="M6 4v16M18 4v16M6 12h12"/>',
};
const I = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${IC[n] || ''}</svg>`;
const LOGO = `<svg viewBox="0 0 40 40" aria-hidden="true"><defs><linearGradient id="lgt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d07a4b"/><stop offset="1" stop-color="#9c4024"/></linearGradient><linearGradient id="lgp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#ead6b8"/></linearGradient></defs><rect width="40" height="40" rx="11" fill="url(#lgt)"/><ellipse cx="20.5" cy="31.5" rx="12" ry="2.2" fill="#5e2414" opacity=".35"/><path d="M7 15.5 L22.5 9.5 L33.5 13.5 L18 19.5Z" fill="#2a231d"/><path d="M11.5 15.4 L22.5 11.2 L28.5 13.4 L17.5 17.6Z" fill="none" stroke="#e8b04a" stroke-width=".7"/><path d="M18 19.5 L33.5 13.5 L33.5 23.5 L18 29.5Z" fill="url(#lgp)"/><g stroke="#cfae84" stroke-width=".55"><path d="M18 21.6 L33.5 15.6M18 23.6 L33.5 17.6M18 25.6 L33.5 19.6M18 27.6 L33.5 21.6"/></g><path d="M7 15.5 L18 19.5 L18 29.5 L7 25.5Z" fill="#3b2c22"/><path d="M7 18 L18 22M7 23 L18 27" stroke="#e8b04a" stroke-width=".9"/><path d="M33.5 13.5 L33.5 23.5 L18 29.5" stroke="#2a231d" stroke-width="1.1" fill="none" stroke-linejoin="round"/><path d="M27 25.3 L27 31.5 L28.4 30.4 L29.8 31.1 L29.8 24.2Z" fill="#e8b04a"/></svg>`;

function toast(msg, ms = 2600) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('on'), ms);
}

/* ================= fontes e aparência ================= */
const FONTES = [
  { f: 'Lora', c: 'Clássica · equilibrada', g: 'classica' },
  { f: 'EB Garamond', c: 'Clássica · elegante', g: 'classica' },
  { f: 'Merriweather', c: 'Clássica · ótima na tela', g: 'classica' },
  { f: 'Crimson Pro', c: 'Clássica · leve', g: 'classica' },
  { f: 'Libre Baskerville', c: 'Clássica · tradicional', g: 'classica' },
  { f: 'Literata', c: 'Moderna · de e-book', g: 'moderna' },
  { f: 'Spectral', c: 'Moderna · fina', g: 'moderna' },
  { f: 'Cormorant Garamond', c: 'Romântica · delicada', g: 'classica' },
  { f: 'Playfair Display', c: 'Títulos · dramática', g: 'titulo' },
  { f: 'Cinzel', c: 'Títulos · fantasia épica', g: 'titulo' },
  { f: 'Nunito', c: 'Moderna · infantil', g: 'moderna' },
  { f: 'Courier Prime', c: 'Máquina de escrever', g: 'maquina' },
  { f: 'Special Elite', c: 'Máquina antiga · suspense', g: 'maquina' },
  { f: 'Caveat', c: 'Manuscrita · diário', g: 'manuscrita' },
  { f: 'DM Serif Display', c: 'Títulos · marcante', g: 'titulo' },
  { f: 'Fraunces', c: 'Moderna · com charme', g: 'moderna' },
];
const FONT_FALLBACK = { classica: 'Georgia, serif', moderna: 'Georgia, serif', titulo: 'Georgia, serif', maquina: "'Courier New', monospace", manuscrita: 'cursive' };
const fontStack = (name) => { const x = FONTES.find((o) => o.f === name) || FONTES[0]; return `'${x.f}', ${FONT_FALLBACK[x.g]}`; };
const COMBOS = [
  { n: 'Romance clássico', t: 'Playfair Display', b: 'Lora' }, { n: 'Fantasia épica', t: 'Cinzel', b: 'EB Garamond' },
  { n: 'Suspense', t: 'Special Elite', b: 'Crimson Pro' }, { n: 'Diário', t: 'Caveat', b: 'Literata' },
  { n: 'Moderno', t: 'DM Serif Display', b: 'Spectral' }, { n: 'Infantil', t: 'Fraunces', b: 'Nunito' },
];
const PAPERS = {
  branco: { n: 'Branco', bg: '#ffffff', ink: '#2a231d', mut: '#8c7f72' },
  creme: { n: 'Creme', bg: '#fffdf8', ink: '#3a312a', mut: '#8c7f72' },
  sepia: { n: 'Sépia', bg: '#f4e8cf', ink: '#4a3a2a', mut: '#8d7556' },
  noite: { n: 'Noite', bg: '#1f1b17', ink: '#e4d8c6', mut: '#a3957f' },
};
const MARGENS = { estreita: { n: 'Estreita', px: 44, k: 0.09 }, media: { n: 'Média', px: 76, k: 0.12 }, larga: { n: 'Larga', px: 110, k: 0.15 } };
const DEF_STYLE = { font: 'Lora', titleFont: 'Playfair Display', size: 18, lh: 1.75, margin: 'media', paper: 'creme' };
const styleOf = (b) => ({ ...DEF_STYLE, ...(b.style || {}) });
function applyStyle(el, st, paper) {
  const p = PAPERS[paper || st.paper] || PAPERS.creme;
  el.style.setProperty('--bf', fontStack(st.font)); el.style.setProperty('--tf', fontStack(st.titleFont));
  el.style.setProperty('--fs', st.size + 'px'); el.style.setProperty('--lh', st.lh);
  el.style.setProperty('--pad', (MARGENS[st.margin] || MARGENS.media).px + 'px');
  el.style.setProperty('--pbg', p.bg); el.style.setProperty('--pink', p.ink); el.style.setProperty('--pmut', p.mut);
}

/* ================= banco de dados ================= */
// O nome do banco continua "imersa": é o mesmo dos livros escritos antes da mudança de nome.
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
async function saveMedia(kind, blob, name) {
  const m = { id: uid(), kind, name: name || 'Imagem', type: blob.type, blob, createdAt: Date.now() };
  await DB.put('media', m);
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
async function fillMedia(root) {
  for (const img of $$('img[data-media]', root)) { const u = await mediaURL(img.dataset.media); if (u) img.src = u; }
}

/* ================= livros ================= */
let books = [];
const getBook = (id) => books.find((b) => b.id === id);
function newBook(data = {}) {
  return { id: uid(), title: 'Livro sem título', author: '', genre: '', theme: 'floresta', coverMedia: null, cloth: null, status: 'escrevendo', fav: false, meta: 0,
    style: { ...DEF_STYLE }, createdAt: Date.now(), updatedAt: Date.now(), chapters: [{ id: uid(), title: 'Capítulo 1', html: '<p><br></p>', notes: '' }], ...data };
}
async function loadBooks() {
  books = (await DB.all('books')).sort((a, b) => b.updatedAt - a.updatedAt);
  // Livros de antes da mudança: ganham aparência e status, e perdem as marcações de som.
  for (const b of books) {
    let mudou = false;
    if (!b.style) { b.style = { ...DEF_STYLE }; mudou = true; }
    if (!b.status) { b.status = 'escrevendo'; mudou = true; }
    for (const c of b.chapters) if (/m-(fx|amb|mus)/.test(c.html || '')) { c.html = sanitize(c.html); mudou = true; }
    if (mudou) await DB.put('books', b);
  }
}
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
function textStats(html) {
  const t = document.createElement('template'); t.innerHTML = html || '';
  const txt = (t.content.textContent || '').trim();
  return { words: txt.split(/\s+/).filter(Boolean).length, chars: txt.length, imgs: t.content.querySelectorAll('.m-img').length };
}
function bookStats(b) { return b.chapters.reduce((a, c) => { const s = textStats(c.html); a.words += s.words; a.imgs += s.imgs; return a; }, { words: 0, imgs: 0 }); }
const minutes = (w) => Math.max(1, Math.round(w / 200));
const lastCh = (b) => clamp(LS.get('imersa-lastch-' + b.id, 0), 0, b.chapters.length - 1);

/* meta de palavras do dia e dias seguidos escrevendo */
const today = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const metaDia = () => LS.get('calh-meta', 500);
function addWords(n) { if (n <= 0) return; const d = LS.get('calh-dias', {}); d[today()] = (d[today()] || 0) + n; LS.set('calh-dias', d); }
function wordsOn(day) { return LS.get('calh-dias', {})[day] || 0; }
function streak() {
  const d = new Date(); let n = 0;
  if (!wordsOn(today(d))) d.setDate(d.getDate() - 1);
  while (wordsOn(today(d)) > 0) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
function goalHTML(cls = '') {
  const w = wordsOn(today()), g = metaDia(), s = streak(), days = [];
  for (let k = 6; k >= 0; k--) { const d = new Date(); d.setDate(d.getDate() - k); days.push([d, wordsOn(today(d))]); }
  return `<button class="goal ${cls}" data-goal title="Mudar a meta do dia">
    <div class="row" style="gap:8px;color:var(--terra)">${I('flame')}<span style="font-size:11.5px;font-weight:700;letter-spacing:1px">${s ? `${s} ${s === 1 ? 'DIA' : 'DIAS'} SEGUIDOS` : 'ESCREVA HOJE'}</span></div>
    <div style="margin-top:10px"><b>${fmt(w)} de ${fmt(g)}</b> <span class="muted" style="font-size:13px">palavras hoje</span></div>
    <div class="bar"><i style="width:${clamp(w / g * 100, 0, 100)}%"></i></div>
    <div class="week">${days.map(([, n]) => `<span class="${n >= g ? 'w2' : n > 0 ? 'w1' : ''}"></span>`).join('')}${days.map(([d]) => `<small>${'DSTQQSS'[d.getDay()]}</small>`).join('')}</div></button>`;
}
async function editGoal() {
  const v = await askText('Meta de palavras por dia', String(metaDia()), 'Palavras', 'Salvar', 'number');
  const n = parseInt(v, 10); if (n > 0) { LS.set('calh-meta', n); route(); }
}

/* ================= capas ================= */
const CLOTHS = { azul: '#24324a', vinho: '#5e2a26', verde: '#3e4f36', mostarda: '#7d5a17', ameixa: '#4a2d48', grafite: '#2c2a28' };
function coverHTML(b, opts = {}) {
  const st = styleOf(b);
  if (!b.coverMedia && b.cloth) {
    return `<div class="cover cloth" style="background-color:${CLOTHS[b.cloth] || CLOTHS.azul};${opts.style || ''}"><div class="frame"></div>${b.author ? `<div class="au">${esc(b.author)}</div>` : ''}<div class="orn">❦</div><div class="tt" style="font-family:${fontStack(st.titleFont)}">${esc(b.title)}</div><div class="orn">✦</div></div>`;
  }
  const art = b.coverMedia ? `<img data-media="${esc(b.coverMedia)}" alt="">` : Arte.svg(b.theme);
  return `<div class="cover" style="${opts.style || ''}">${art}<div class="shade"></div>${opts.noTitle ? '' : `<div class="ct" style="font-family:${fontStack(st.titleFont)}">${esc(b.title)}${b.genre ? `<small>${esc(b.genre)}</small>` : ''}</div>`}</div>`;
}

/* ================= conteúdo: limpeza e montagem ================= */
const OK_TAGS = new Set(['P', 'H2', 'H3', 'BLOCKQUOTE', 'B', 'STRONG', 'I', 'EM', 'U', 'BR', 'UL', 'OL', 'LI']);
function sanitize(html) {
  const t = document.createElement('template'); t.innerHTML = html || '';
  const walk = (node) => {
    for (const el of [...node.children]) {
      // marcações de som da versão antiga: somem
      if (el.matches('span.m-fx, div.m-amb, div.m-mus')) { el.remove(); continue; }
      const blk = (el.tagName === 'FIGURE' && el.classList.contains('m-img')) ? 'm-img' : (el.tagName === 'DIV' && el.classList.contains('m-scene')) ? 'm-scene' : null;
      if (blk) {
        const n = document.createElement(el.tagName); n.className = blk;
        for (const k of ['data-media', 'data-art', 'data-caption', 'data-size']) if (el.hasAttribute(k)) n.setAttribute(k, el.getAttribute(k));
        el.replaceWith(n); continue;
      }
      if (OK_TAGS.has(el.tagName)) { for (const a of [...el.attributes]) el.removeAttribute(a.name); walk(el); continue; }
      if (el.tagName === 'DIV') { const p = document.createElement('p'); p.append(...el.childNodes); el.replaceWith(p); walk(p); continue; }
      if (['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'svg', 'SVG', 'IMG', 'VIDEO', 'AUDIO', 'LINK', 'META', 'FIGURE'].includes(el.tagName)) { el.remove(); continue; }
      walk(el); el.replaceWith(...el.childNodes);
    }
  };
  walk(t.content);
  return t.innerHTML;
}
function imgInner(d) { return d.media ? `<img data-media="${esc(d.media)}" alt="">` : Arte.svg(d.art || 'floresta'); }
function hydrate(el) {
  el.contentEditable = 'false';
  if (el.classList.contains('m-img')) {
    const d = el.dataset;
    el.innerHTML = `<div class="frame">${imgInner(d)}</div>${d.caption ? `<figcaption>${esc(d.caption)}</figcaption>` : ''}`;
    el.title = 'Toque para mudar a imagem';
    fillMedia(el);
  } else if (el.classList.contains('m-scene')) { el.innerHTML = ''; el.title = 'Separador de cena — toque para tirar'; }
  return el;
}
function serialize(root) {
  const c = root.cloneNode(true);
  for (const el of $$('.m-img,.m-scene', c)) { el.innerHTML = ''; el.removeAttribute('contenteditable'); el.removeAttribute('title'); }
  return c.innerHTML;
}

/* ================= janelas ================= */
let modalStack = [];
function modal(html, { size = '', onClose } = {}) {
  const m = document.createElement('div'); m.className = 'modal';
  m.innerHTML = `<div class="sheet ${size}" role="dialog" aria-modal="true">${html}</div>`;
  document.body.appendChild(m);
  const close = () => { if (!m.isConnected) return; m.remove(); modalStack = modalStack.filter((x) => x !== close); if (onClose) onClose(); };
  m.addEventListener('mousedown', (e) => { if (e.target === m) close(); });
  $$('[data-close]', m).forEach((b) => b.addEventListener('click', close));
  modalStack.push(close);
  const f = $('input.input,textarea', m); if (f && matchMedia('(pointer:fine)').matches) setTimeout(() => f.focus(), 50);
  return { el: m, close };
}
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (slashState) return;
  if (modalStack.length) modalStack[modalStack.length - 1]();
  else if (document.body.classList.contains('focus')) { document.body.classList.remove('focus'); const x = $('#exitFocus'); if (x) x.hidden = true; }
});
const sheetHead = (title) => `<div class="sheet-h"><h3>${title}</h3><button class="ib" data-close aria-label="Fechar">${I('x')}</button></div>`;
function ask(title, msg, ok = 'Confirmar', danger = false) {
  return new Promise((res) => {
    let done = false;
    const m = modal(`${sheetHead(esc(title))}<div class="sheet-b"><p class="muted">${esc(msg)}</p></div><div class="sheet-f"><span class="grow"></span><button class="btn" data-close>Cancelar</button><button class="btn ${danger ? 'danger' : 'pri'}" id="okb">${esc(ok)}</button></div>`, { onClose: () => { if (!done) res(false); } });
    $('#okb', m.el).onclick = () => { done = true; m.close(); res(true); };
  });
}
function askText(title, value = '', label = 'Nome', ok = 'Salvar', type = 'text') {
  return new Promise((res) => {
    let done = false;
    const m = modal(`${sheetHead(esc(title))}<div class="sheet-b"><div class="field"><label>${esc(label)}</label><input class="input" id="tx" type="${type}" value="${esc(value)}" maxlength="80"></div></div><div class="sheet-f"><span class="grow"></span><button class="btn" data-close>Cancelar</button><button class="btn pri" id="okb">${esc(ok)}</button></div>`, { onClose: () => { if (!done) res(null); } });
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
const onLeave = (fn) => teardown.push(fn);
function route() {
  teardown.forEach((f) => { try { f(); } catch (e) { console.error(e); } }); teardown = [];
  closeMenus(); modalStack.slice().forEach((c) => c()); closeSlash();
  document.body.classList.remove('focus');
  const [, a, b, c] = (location.hash.slice(1) || '/').split('/');
  window.scrollTo(0, 0);
  if (a === 'livro' && getBook(b)) viewEditor(getBook(b), +c || 0);
  else if (a === 'ler' && getBook(b)) viewBook(getBook(b), +c || 0);
  else viewShelf(a === 'favoritos' ? 'fav' : 'all');
}
const go = (h) => { if (location.hash === h) route(); else location.hash = h; };

/* ================= ESTANTE ================= */
let shelfFilter = 'todos', shelfSearch = '';
function viewShelf(nav) {
  document.title = 'Calhamaço — sua estante';
  const h = new Date().getHours();
  const hello = h < 5 ? 'Boa madrugada.' : h < 12 ? 'Bom dia.' : h < 18 ? 'Boa tarde.' : 'Boa noite.';
  const dateTxt = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const last = books[0];
  let cont = '';
  if (last) {
    const ci = lastCh(last), ch = last.chapters[ci], st = textStats(ch.html), bs = bookStats(last);
    const t = document.createElement('template'); t.innerHTML = ch.html;
    const ps = [...t.content.querySelectorAll('p')].map((p) => p.textContent.trim()).filter((x) => x.length > 20);
    const snip = ps.length ? ps[ps.length - 1] : '';
    const quando = new Date(last.updatedAt).toLocaleString('pt-BR', { weekday: 'long', hour: '2-digit', minute: '2-digit' });
    cont = `<div class="card continue">${coverHTML(last, { style: 'width:140px' })}
      <div class="info"><span class="kicker">Continuar de onde parou</span><h3>${esc(last.title)}</h3>
      <span class="muted" style="font-size:13.5px">Capítulo ${roman(ci)} — ${esc(ch.title)} · ${fmt(st.words)} palavras · ${esc(quando)}</span>
      ${snip ? `<blockquote style="font-family:${fontStack(styleOf(last).font)}">“${esc(snip.length > 240 ? '…' + snip.slice(-240) : snip)}”</blockquote>` : '<div style="height:16px"></div>'}
      <div class="acts"><button class="btn pri" data-go="#/livro/${last.id}/${ci}">${I('pen')}Continuar escrevendo</button><button class="btn hide-m" data-go="#/ler/${last.id}/${ci}">${I('eye')}Ver como livro</button>
      ${last.meta ? `<span class="grow hide-m"></span><span class="muted hide-m" style="font-size:12.5px">${Math.round(Math.min(1, bs.words / last.meta) * 100)}% da meta do livro</span><div class="bar hide-m" style="width:140px"><i style="width:${Math.min(100, bs.words / last.meta * 100)}%"></i></div>` : ''}</div></div></div>`;
  }
  const favs = books.filter((b) => b.fav).length;
  app.innerHTML = `
  <header class="topbar"><div class="logo">${LOGO}<span>Calhamaço</span></div>
    <label class="input hide-m" style="display:flex;align-items:center;gap:9px;width:320px;height:40px;margin-left:30px;color:var(--muted)">${I('search')}<input id="q" placeholder="Buscar nos seus livros…" value="${esc(shelfSearch)}" style="border:0;outline:0;background:none;flex:1;color:var(--ink)"></label>
    <span class="grow"></span>
    <button class="btn hide-m" id="impBtn">${I('download')}Importar</button>
    <button class="btn terra" id="newTop">${I('plus')}<span class="hide-m">Novo livro</span></button>
    <button class="ib" id="mainMenu" aria-label="Mais opções">${I('more')}</button></header>
  <div class="shelf-wrap">
    <aside class="side">
      <button class="nav ${nav === 'all' ? 'on' : ''}" data-go="#/">${I('book')}Estante<span class="c">${books.length}</span></button>
      <button class="nav ${nav === 'fav' ? 'on' : ''}" data-go="#/favoritos">${I('star')}Favoritos<span class="c">${favs}</span></button>
      ${goalHTML()}
    </aside>
    <main class="shelf">
      <div class="date">${esc(dateTxt.charAt(0).toUpperCase() + dateTxt.slice(1))}</div>
      <h1 class="hello">${hello} <em>Vamos escrever?</em></h1>
      ${nav === 'all' ? cont : ''}
      <div class="sec-h"><h2>${nav === 'fav' ? 'Favoritos' : 'Sua estante'}</h2>
        <div class="chips" id="flt">${[['todos', 'Todos'], ['escrevendo', 'Escrevendo'], ['terminado', 'Terminados'], ['rascunho', 'Rascunhos']].map(([k, n]) => `<button class="chip ${shelfFilter === k ? 'on' : ''}" data-f="${k}">${n}</button>`).join('')}</div></div>
      <div class="books" id="bookGrid"></div>
      ${goalHTML('m only-m')}
    </main>
  </div>`;
  const grid = $('#bookGrid');
  const drawBooks = () => {
    const q = shelfSearch.toLowerCase();
    const list = books.filter((b) => (nav !== 'fav' || b.fav) && (shelfFilter === 'todos' || b.status === shelfFilter) && (!q || (b.title + ' ' + b.author + ' ' + b.genre).toLowerCase().includes(q)));
    grid.innerHTML = list.map((b) => {
      const st = bookStats(b);
      return `<button class="book" data-go="#/livro/${b.id}/${lastCh(b)}">${b.fav ? `<span class="fav">${I('star')}</span>` : ''}${coverHTML(b)}<span class="meta"><b>${esc(b.title)}</b><small>${b.status === 'rascunho' ? 'rascunho · ' : b.status === 'terminado' ? 'terminado · ' : `${b.chapters.length} cap. · `}${fmt(st.words)} palavras</small>${b.meta ? `<div class="bar"><i style="width:${Math.min(100, st.words / b.meta * 100)}%"></i></div>` : ''}</span></button>`;
    }).join('') + (nav === 'fav' ? '' : `<button class="newbook" id="newBook">${I('plus')}Novo livro</button>`);
    if (!list.length && nav === 'fav') grid.innerHTML = '<p class="empty" style="grid-column:1/-1">Marque um livro como favorito nos dados do livro.</p>';
    fillMedia(grid);
    $$('[data-go]', grid).forEach((b) => b.onclick = () => go(b.dataset.go));
    if ($('#newBook')) $('#newBook').onclick = () => bookDialog(null);
  };
  drawBooks();
  fillMedia(app);
  $$('[data-go]', app).forEach((b) => { if (!grid.contains(b)) b.onclick = () => go(b.dataset.go); });
  $$('[data-goal]', app).forEach((b) => b.onclick = editGoal);
  $('#flt').onclick = (e) => { const b = e.target.closest('[data-f]'); if (!b) return; shelfFilter = b.dataset.f; $$('#flt .chip').forEach((x) => x.classList.toggle('on', x === b)); drawBooks(); };
  if ($('#q')) $('#q').oninput = (e) => { shelfSearch = e.target.value; drawBooks(); };
  $('#newTop').onclick = () => bookDialog(null);
  $('#impBtn').onclick = importFile;
  $('#mainMenu').onclick = (e) => popMenu(e.currentTarget, [
    { icon: 'upload', label: 'Abrir livro ou backup (.json)', run: importFile },
    { icon: 'download', label: 'Fazer backup de tudo', run: exportAll },
    '-',
    { icon: 'flame', label: 'Mudar a meta do dia', run: editGoal },
    '-',
    { icon: 'book', label: 'Ver a introdução', run: () => showIntro() },
    { icon: 'eye', label: introOn() ? 'Abrir sem a introdução' : 'Mostrar a introdução ao abrir', run: toggleIntro },
  ]);
}

function bookDialog(book) {
  const isNew = !book;
  const b = book ? { ...book, style: styleOf(book) } : newBook({ title: '' });
  let tab = b.coverMedia ? 'foto' : b.cloth ? 'tecido' : 'arte';
  const m = modal(`${sheetHead(isNew ? 'Novo livro' : 'Dados do livro')}<div class="sheet-b">
    <div class="field"><label>Título</label><input class="input" id="bt" value="${esc(b.title)}" placeholder="Ex.: O Silêncio da Mata" maxlength="90"></div>
    <div class="row"><div class="field"><label>Autor(a)</label><input class="input" id="ba" value="${esc(b.author)}" placeholder="Seu nome" maxlength="60"></div>
    <div class="field"><label>Gênero</label><input class="input" id="bg" value="${esc(b.genre)}" placeholder="Romance, fantasia…" maxlength="40"></div></div>
    <div class="row"><div class="field"><label>Situação</label><select class="input" id="bs">${[['escrevendo', 'Escrevendo'], ['rascunho', 'Rascunho'], ['terminado', 'Terminado']].map(([k, n]) => `<option value="${k}" ${b.status === k ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
    <div class="field"><label>Meta de palavras do livro</label><input class="input" id="bm" type="number" min="0" step="1000" value="${b.meta || ''}" placeholder="opcional"></div></div>
    <div class="field"><label>Capa</label><div class="seg" id="ctab" style="margin-bottom:12px"><button data-t="arte">Ilustração</button><button data-t="tecido">Tecido e ouro</button><button data-t="foto">Foto</button></div><div id="cpick"></div></div>
    <label class="row" style="gap:10px;font-size:14px;cursor:pointer"><input type="checkbox" id="bf" ${b.fav ? 'checked' : ''} style="width:18px;height:18px;accent-color:var(--terra)">Favorito</label>
  </div><div class="sheet-f">${isNew ? '' : `<button class="btn danger" id="del">${I('trash')}Excluir</button>`}<span class="grow"></span><button class="btn" data-close>Cancelar</button><button class="btn pri" id="ok">${isNew ? 'Criar livro' : 'Salvar'}</button></div>`, { size: 'wide' });
  const cp = $('#cpick', m.el);
  const cur = () => ({ ...b, title: $('#bt', m.el).value || 'Título', author: $('#ba', m.el).value, genre: $('#bg', m.el).value });
  const draw = () => {
    $$('#ctab button', m.el).forEach((x) => x.classList.toggle('on', x.dataset.t === tab));
    const c = cur();
    if (tab === 'arte') cp.innerHTML = `<div class="covers">${Arte.temas.map((t) => `<button data-th="${t.id}" class="${!b.coverMedia && !b.cloth && b.theme === t.id ? 'on' : ''}" title="${esc(t.name)}">${coverHTML({ ...c, coverMedia: null, cloth: null, theme: t.id })}</button>`).join('')}</div>`;
    else if (tab === 'tecido') cp.innerHTML = `<div class="swatches" style="margin-bottom:12px">${Object.entries(CLOTHS).map(([k, v]) => `<button data-cl="${k}" class="${b.cloth === k ? 'on' : ''}" style="background:${v}" title="${k}"></button>`).join('')}</div><div style="width:120px">${coverHTML({ ...c, coverMedia: null, cloth: b.cloth || 'azul' })}</div>`;
    else cp.innerHTML = `<div class="covers">${b.coverMedia ? `<button class="on">${coverHTML({ ...c, cloth: null })}</button>` : ''}<button class="up" data-up>${I('upload')}${b.coverMedia ? 'Trocar a foto' : 'Escolher uma foto'}</button></div>`;
    fillMedia(cp);
  };
  draw();
  $('#ctab', m.el).onclick = (e) => { const x = e.target.closest('button'); if (!x) return; tab = x.dataset.t; if (tab === 'tecido' && !b.cloth) { b.cloth = 'azul'; b.coverMedia = null; } draw(); };
  $('#bt', m.el).addEventListener('change', draw);
  cp.onclick = async (e) => {
    const x = e.target.closest('button'); if (!x) return;
    if (x.dataset.th) { b.theme = x.dataset.th; b.coverMedia = null; b.cloth = null; }
    else if (x.dataset.cl) { b.cloth = x.dataset.cl; b.coverMedia = null; }
    else if (x.hasAttribute('data-up')) {
      const f = await pickFile('image/*'); if (!f) return;
      const md = await saveMedia('image', await resizeImage(f, 1400), 'Capa'); b.coverMedia = md.id; b.cloth = null;
    }
    draw();
  };
  $('#ok', m.el).onclick = async () => {
    b.title = $('#bt', m.el).value.trim() || 'Livro sem título'; b.author = $('#ba', m.el).value.trim(); b.genre = $('#bg', m.el).value.trim();
    b.status = $('#bs', m.el).value; b.meta = parseInt($('#bm', m.el).value, 10) || 0; b.fav = $('#bf', m.el).checked;
    if (tab === 'arte') b.cloth = null;
    if (isNew) { books.unshift(b); await saveBook(b, true); m.close(); go(`#/livro/${b.id}/0`); }
    else { Object.assign(book, b); await saveBook(book, true); m.close(); route(); }
  };
  if (!isNew) $('#del', m.el).onclick = () => { m.close(); deleteBook(book); };
}
async function deleteBook(book) {
  if (!(await ask('Excluir livro?', `"${book.title}" e todos os capítulos serão apagados deste aparelho. Isso não pode ser desfeito.`, 'Excluir', true))) return;
  await DB.del('books', book.id); books = books.filter((x) => x.id !== book.id); go('#/'); toast('Livro excluído');
}

/* ================= EDITOR ================= */
let slashState = null;
let slashInsert = () => {};
function viewEditor(book, ci) {
  ci = clamp(ci, 0, book.chapters.length - 1);
  LS.set('imersa-lastch-' + book.id, ci);
  const ch = book.chapters[ci];
  const st = () => styleOf(book);
  document.title = `${ch.title} — ${book.title}`;
  app.innerHTML = `
  <header class="topbar">
    <button class="ib keep" id="backBtn" aria-label="Estante">${I('left')}</button>
    <button class="ib only-m" id="openSide" aria-label="Capítulos">${I('menu')}</button>
    <div class="crumb"><b>${esc(book.title)}</b><small><span class="dot" id="saveDot"></span><span id="saveTxt">Salvo</span><span class="hide-m">· Capítulo ${roman(ci)} — ${esc(ch.title)}</span></small></div>
    <span class="grow"></span>
    <button class="btn hide-m" id="focusBtn">${I('focus')}Modo foco</button>
    <button class="btn keep" id="exitFocus" hidden>${I('x')}Sair do foco</button>
    <button class="btn" id="readBtn">${I('eye')}<span class="hide-m">Ver como livro</span></button>
    <button class="btn pri hide-m" id="expBtn">${I('download')}Exportar</button>
    <button class="ib" id="bookMenu" aria-label="Mais opções">${I('more')}</button>
  </header>
  <div class="toolbar"><div class="tools" id="tools">
    <button class="sel" id="fontSel" title="Fonte do texto"><span id="fontName"></span>${I('down')}</button>
    <select class="sel" id="sizeSel" title="Tamanho da letra" style="gap:0;font-family:var(--ui)">${[14, 15, 16, 17, 18, 19, 20, 22, 24, 26].map((n) => `<option value="${n}">${n}</option>`).join('')}</select>
    <span class="sep"></span>
    <button class="tb" data-cmd="bold" title="Negrito"><b>B</b></button>
    <button class="tb" data-cmd="italic" title="Itálico"><i style="font-family:Lora">I</i></button>
    <button class="tb" data-cmd="underline" title="Sublinhado"><u>U</u></button>
    <button class="tb" data-cmd="h2" title="Subtítulo">${I('h')}</button>
    <button class="tb" data-cmd="quote" title="Citação">${I('quote')}</button>
    <button class="tb" data-cmd="list" title="Lista">${I('list')}</button>
    <span class="sep"></span>
    <button class="tb img" data-ins="img">${I('image')}Imagem</button>
    <button class="tb" data-ins="scene" title="Separador de cena">✦ <span class="hide-m">Separador</span></button>
    <button class="tb" id="aaBtn" title="Aparência do livro">${I('aa')}<span class="hide-m">Aparência</span></button>
  </div></div>
  <div class="ed-wrap" id="edWrap">
    <aside class="side ed" id="side"></aside>
    <main class="desk">
      <div class="paper" id="paper">
        <div class="chapno">Capítulo ${roman(ci)}</div>
        <input class="ch-title" id="chTitle" value="${esc(ch.title)}" placeholder="Título do capítulo" maxlength="90">
        <div class="orn">✦ ❦ ✦</div>
        <div class="editor" id="ed" contenteditable="true" spellcheck="true" data-ph="Comece a escrever… digite / para pôr uma imagem ou um separador"></div>
      </div>
    </main>
    <aside class="panel" id="panel"></aside>
  </div>
  <div class="status"><span id="stW"></span><span class="hide-m" id="stC"></span><span id="stM"></span><span class="grow"></span><span class="hide-m" id="stB"></span></div>`;
  const ed = $('#ed'), paper = $('#paper'), side = $('#side'), panel = $('#panel');
  try { document.execCommand('defaultParagraphSeparator', false, 'p'); } catch (e) { /* navegador antigo */ }
  ed.innerHTML = sanitize(ch.html) || '<p><br></p>';
  $$('.m-img,.m-scene', ed).forEach(hydrate);
  normalize(ed);
  const restyle = () => { applyStyle(paper, st()); $('#fontName').textContent = st().font; $('#fontName').style.fontFamily = fontStack(st().font); $('#sizeSel').value = st().size; };
  restyle();
  if (LS.get('calh-panel', true) === false) $('#edWrap').classList.add('no-panel');

  // lateral: capítulos, nota e palavras do capítulo
  const drawSide = () => {
    const cs = textStats(serialize(ed));
    side.innerHTML = `<div class="lbl" style="padding:2px 10px 8px">Capítulos</div>
      ${book.chapters.map((c, i) => `<button class="ch ${i === ci ? 'on' : ''}" data-ch="${i}"><span class="n">${roman(i)}</span><span class="t">${esc(c.title || 'Sem título')}</span><span class="w">${(() => { const w = i === ci ? cs.words : textStats(c.html).words; return w ? fmt(w) : '—'; })()}</span></button>
        ${i === ci ? `<div class="ch-tools">${i > 0 ? `<button data-mv="-1" title="Subir">${I('up')}</button>` : ''}${i < book.chapters.length - 1 ? `<button data-mv="1" title="Descer">${I('down')}</button>` : ''}${book.chapters.length > 1 ? `<button data-delch title="Excluir capítulo">${I('trash')}Excluir</button>` : ''}</div>` : ''}`).join('')}
      <button class="ch" id="addCh" style="color:var(--muted)"><span class="n">+</span>Novo capítulo</button>
      <div class="lbl" style="padding:16px 10px 8px">Notas do capítulo</div>
      <textarea class="note" id="note" placeholder="Ideias, lembretes, o que acontece depois…">${esc(ch.notes || '')}</textarea>
      <div class="goal" style="cursor:default"><div class="muted" style="font-size:12px">Este capítulo</div><b>${fmt(cs.words)} palavras</b>
        <div class="muted" style="font-size:11.5px;margin-top:4px">${minutes(cs.words)} min de leitura · ${cs.imgs} ${cs.imgs === 1 ? 'imagem' : 'imagens'}</div></div>`;
    $('#note').oninput = (e) => { ch.notes = e.target.value; saveBook(book); };
  };
  drawSide();
  side.onclick = async (e) => {
    const b = e.target.closest('button'); if (!b) return;
    flush();
    if (b.dataset.ch != null) { closeSide(); go(`#/livro/${book.id}/${b.dataset.ch}`); }
    else if (b.id === 'addCh') { book.chapters.push({ id: uid(), title: `Capítulo ${book.chapters.length + 1}`, html: '<p><br></p>', notes: '' }); await saveBook(book, true); go(`#/livro/${book.id}/${book.chapters.length - 1}`); }
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

  // painel de aparência (fica à direita no computador; no celular abre numa janela)
  const drawPanel = (box) => {
    const s = st(), top4 = [s.font, ...['Lora', 'EB Garamond', 'Merriweather', 'Courier Prime'].filter((f) => f !== s.font)].slice(0, 4);
    box.innerHTML = `<h4 class="ph">Aparência do livro</h4>
      <div><div class="lbl" style="margin-bottom:8px">Fonte do texto</div>
        ${top4.map((f) => `<button class="fopt ${f === s.font ? 'on' : ''}" data-font="${esc(f)}" style="font-family:${fontStack(f)}">${esc(f)}${f === s.font ? `<span class="ck">${I('check')}</span>` : '<span class="muted" style="font-size:12px;font-family:var(--ui)">Aa</span>'}</button>`).join('')}
        <button class="link" data-all="font">Ver todas as ${FONTES.length} fontes →</button></div>
      <div><div class="lbl" style="margin-bottom:8px">Fonte dos títulos</div>
        <button class="fopt on" data-all="titleFont" style="font-family:${fontStack(s.titleFont)};font-style:italic;font-size:18px;border-color:var(--line2)">${esc(s.titleFont)}${I('down')}</button></div>
      <div><div class="lbl" style="margin-bottom:10px">Tamanho e espaço</div>
        <div class="slider"><div class="row"><span>Tamanho</span><b id="vSize">${s.size}</b></div><input type="range" class="range" data-k="size" min="14" max="26" step="1" value="${s.size}"></div>
        <div class="slider"><div class="row"><span>Entre linhas</span><b id="vLh">${String(s.lh).replace('.', ',')}</b></div><input type="range" class="range" data-k="lh" min="1.3" max="2.2" step="0.05" value="${s.lh}"></div>
        <div class="row" style="justify-content:space-between;font-size:12.5px;color:var(--ink2);margin:4px 0 6px"><span>Margens</span></div>
        <div class="seg" id="mg">${Object.entries(MARGENS).map(([k, v]) => `<button data-mg="${k}" class="${s.margin === k ? 'on' : ''}">${v.n}</button>`).join('')}</div></div>
      <div><div class="lbl" style="margin-bottom:8px">Papel</div><div class="papers">${Object.entries(PAPERS).map(([k, v]) => `<button data-pp="${k}" class="${s.paper === k ? 'on' : ''}"><i style="background:${v.bg}"></i>${v.n}</button>`).join('')}</div></div>`;
  };
  const setStyle = (patch) => { book.style = { ...st(), ...patch }; restyle(); saveBook(book); };
  const panelEvents = (box) => {
    box.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.font) setStyle({ font: b.dataset.font });
      else if (b.dataset.all) { fontPicker(book, b.dataset.all, (patch) => { setStyle(patch); drawPanel(box); }); return; }
      else if (b.dataset.mg) setStyle({ margin: b.dataset.mg });
      else if (b.dataset.pp) setStyle({ paper: b.dataset.pp });
      else return;
      drawPanel(box);
    });
    box.addEventListener('input', (e) => {
      const k = e.target.dataset.k; if (!k) return;
      const v = +e.target.value; setStyle({ [k]: v });
      if (k === 'size') $('#vSize', box).textContent = v; else $('#vLh', box).textContent = String(v).replace('.', ',');
    });
  };
  drawPanel(panel); panelEvents(panel);
  $('#aaBtn').onclick = () => {
    if (innerWidth > 1220) { const w = $('#edWrap'); w.classList.toggle('no-panel'); LS.set('calh-panel', !w.classList.contains('no-panel')); return; }
    const m = modal(`${sheetHead('Aparência do livro')}<div class="sheet-b" id="pbox" style="display:flex;flex-direction:column;gap:18px"></div>`);
    const box = $('#pbox', m.el); drawPanel(box); $('.ph', box).remove(); panelEvents(box);
  };
  $('#fontSel').onclick = () => fontPicker(book, 'font', (patch) => { setStyle(patch); drawPanel(panel); });
  $('#sizeSel').onchange = (e) => { setStyle({ size: +e.target.value }); drawPanel(panel); };

  // salvar e contar palavras
  let lastWords = textStats(ch.html).words;
  const updStatus = () => {
    const s = textStats(ch.html), b = bookStats(book);
    $('#stW').textContent = `${fmt(s.words)} palavras`; $('#stC').textContent = `${fmt(s.chars)} caracteres`;
    $('#stM').textContent = `${minutes(s.words)} min de leitura`; $('#stB').textContent = `Livro: ${fmt(b.words)} palavras · ${book.chapters.length} ${book.chapters.length === 1 ? 'capítulo' : 'capítulos'}`;
  };
  const markEmpty = () => ed.classList.toggle('is-empty', !ed.textContent.trim() && !ed.querySelector('.m-img,.m-scene'));
  const flush = () => { ch.html = serialize(ed); saveBook(book); };
  let sideT;
  const changed = () => {
    ch.html = serialize(ed); markEmpty();
    const w = textStats(ch.html).words; addWords(w - lastWords); lastWords = w;
    updStatus(); saveBook(book); clearTimeout(sideT); sideT = setTimeout(drawSide, 1200);
  };
  updStatus(); markEmpty();
  ed.addEventListener('input', () => { normalize(ed); changed(); checkSlash(); });
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
  tools.addEventListener('mousedown', (e) => { if (e.target.closest('button.tb')) e.preventDefault(); });
  tools.addEventListener('click', (e) => {
    const b = e.target.closest('button.tb'); if (!b) return;
    if (b.dataset.cmd) {
      ed.focus(); restore();
      const blk = topBlock(ed, getSelection().anchorNode), c = b.dataset.cmd;
      if (c === 'bold' || c === 'italic' || c === 'underline') document.execCommand(c);
      else if (c === 'h2') document.execCommand('formatBlock', false, blk && blk.tagName === 'H2' ? 'p' : 'h2');
      else if (c === 'quote') document.execCommand('formatBlock', false, blk && blk.tagName === 'BLOCKQUOTE' ? 'p' : 'blockquote');
      else if (c === 'list') document.execCommand('insertUnorderedList');
      normalize(ed); changed();
    } else if (b.dataset.ins) insert(b.dataset.ins);
  });

  // imagens e separadores
  const insert = (type, existing) => {
    const range = existing ? null : (restore() || endRange(ed));
    const put = (el) => {
      if (existing) existing.replaceWith(el); else insertBlock(ed, range, el);
      hydrate(el); normalize(ed); changed();
    };
    const remove = existing ? () => { existing.remove(); normalize(ed); changed(); } : null;
    if (type === 'img') imageDialog(existing, put, remove);
    else if (type === 'scene') {
      if (existing) ask('Separador de cena', 'Este separador marca a passagem de uma cena para outra.', 'Tirar o separador', true).then((ok) => ok && remove());
      else { const d = document.createElement('div'); d.className = 'm-scene'; put(d); }
    }
  };
  ed.addEventListener('click', (e) => {
    const el = e.target.closest('.m-img,.m-scene'); if (!el) return;
    e.preventDefault(); insert(el.classList.contains('m-img') ? 'img' : 'scene', el);
  });

  // menu "/"
  ed.addEventListener('keydown', (e) => {
    if (!slashState) return;
    const items = $$('.it', slashState.el);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); slashState.i = (slashState.i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length; items.forEach((x, i) => x.classList.toggle('on', i === slashState.i)); }
    else if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); items[slashState.i].click(); }
    else if (e.key === 'Escape') { e.preventDefault(); closeSlash(); }
  });
  slashInsert = (t) => {
    const s = getSelection();
    if (s.rangeCount) { const r = s.getRangeAt(0), n = r.startContainer; if (n.nodeType === 3 && r.startOffset > 0 && n.data[r.startOffset - 1] === '/') n.deleteData(r.startOffset - 1, 1); saved = s.getRangeAt(0).cloneRange(); }
    closeSlash();
    if (t === 'img' || t === 'scene') insert(t);
    else { ed.focus(); restore(); document.execCommand('formatBlock', false, t === 'h2' ? 'h2' : 'blockquote'); changed(); }
  };
  ed.addEventListener('blur', () => setTimeout(() => { if (slashState && !slashState.el.matches(':hover')) closeSlash(); }, 150));

  // modo foco, ler, exportar e menu
  const setFocus = (on) => { document.body.classList.toggle('focus', on); $('#exitFocus').hidden = !on; };
  $('#focusBtn').onclick = () => { setFocus(true); ed.focus(); toast('Modo foco: aperte Esc para sair', 1800); };
  $('#exitFocus').onclick = () => setFocus(false);
  onLeave(() => setFocus(false));
  $('#backBtn').onclick = () => go('#/');
  $('#readBtn').onclick = () => { flush(); go(`#/ler/${book.id}/${ci}`); };
  $('#expBtn').onclick = (e) => { flush(); exportMenu(e.currentTarget, book); };
  $('#bookMenu').onclick = (e) => popMenu(e.currentTarget, [
    { icon: 'edit', label: 'Título, autor e capa', run: () => { flush(); bookDialog(book); } },
    { icon: 'aa', label: 'Aparência do livro', run: () => { if (innerWidth > 1220) { $('#edWrap').classList.remove('no-panel'); LS.set('calh-panel', true); } else $('#aaBtn').click(); } },
    { icon: 'focus', label: 'Modo foco', run: () => setFocus(true) },
    { icon: 'download', label: 'Exportar o livro', run: () => { flush(); exportMenu($('#bookMenu'), book); } },
    '-',
    { icon: 'trash', label: 'Excluir livro', danger: true, run: () => deleteBook(book) },
  ]);
  if (!textStats(ch.html).words) setTimeout(() => { ed.focus(); placeCaret(ed.firstElementChild || ed, false); }, 60);
}

/* ---- ajudas do editor ---- */
function topBlock(ed, node) { while (node && node.parentNode !== ed) node = node.parentNode; return node && node.nodeType === 1 ? node : null; }
function normalize(ed) {
  // texto solto vira parágrafo; sempre sobra um parágrafo no fim para continuar escrevendo
  for (const n of [...ed.childNodes]) {
    if (n.nodeType === 3 && n.data.trim()) { const p = document.createElement('p'); n.replaceWith(p); p.appendChild(n); }
    else if (n.nodeType === 1 && n.tagName === 'DIV' && !n.classList.contains('m-scene')) { const p = document.createElement('p'); p.append(...n.childNodes); n.replaceWith(p); }
  }
  const last = ed.lastElementChild;
  if (!last || last.matches('.m-scene,.m-img')) { const p = document.createElement('p'); p.innerHTML = '<br>'; ed.appendChild(p); }
}
function endRange(ed) { normalize(ed); const r = document.createRange(); r.selectNodeContents(ed.lastElementChild); r.collapse(false); return r; }
function placeCaret(el, start) { const r = document.createRange(); r.selectNodeContents(el); r.collapse(!!start); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
function insertBlock(ed, range, el) {
  const blk = topBlock(ed, range.startContainer);
  if (!blk) { ed.appendChild(el); return; }
  if (blk.matches('.m-scene,.m-img')) { blk.after(el); return; }
  const tail = document.createRange(); tail.setStart(range.endContainer, range.endOffset); tail.setEnd(blk, blk.childNodes.length);
  const frag = tail.extractContents();
  const p = document.createElement(['H2', 'UL', 'OL'].includes(blk.tagName) ? 'p' : blk.tagName.toLowerCase()); p.appendChild(frag);
  if (!blk.textContent.trim()) blk.replaceWith(el); else blk.after(el);
  if (p.textContent.trim()) el.after(p); else { const np = document.createElement('p'); np.innerHTML = '<br>'; el.after(np); }
  placeCaret(el.nextElementSibling, true);
}
const SLASH = [
  { t: 'img', icon: 'image', name: 'Imagem', sub: 'foto, desenho ou ilustração pronta' },
  { t: 'scene', icon: 'sep', name: 'Separador de cena', sub: '✦ ❦ ✦ entre uma cena e outra' },
  { t: 'h2', icon: 'h', name: 'Subtítulo', sub: 'um título dentro do capítulo' },
  { t: 'quote', icon: 'quote', name: 'Citação', sub: 'carta, poema ou epígrafe' },
];
function checkSlash() {
  const s = getSelection(); if (!s.rangeCount) return closeSlash();
  const r = s.getRangeAt(0), n = r.startContainer;
  if (n.nodeType !== 3 || !r.collapsed || !/(^|\s)\/$/.test(n.data.slice(0, r.startOffset))) return closeSlash();
  const rect = r.getBoundingClientRect();
  if (!slashState) {
    const el = document.createElement('div'); el.className = 'slash';
    el.innerHTML = `<div class="hd">Inserir no texto</div>${SLASH.map((x, i) => `<button class="it ${i ? '' : 'on'}" data-t="${x.t}"><span class="b">${I(x.icon)}</span><span><b>${x.name}</b><small>${x.sub}</small></span></button>`).join('')}`;
    el.addEventListener('mousedown', (e) => e.preventDefault());
    el.addEventListener('click', (e) => { const b = e.target.closest('.it'); if (b) slashInsert(b.dataset.t); });
    document.body.appendChild(el); slashState = { el, i: 0 };
  }
  const el = slashState.el, h = el.offsetHeight;
  el.style.left = clamp(rect.left, 10, innerWidth - 280) + 'px';
  el.style.top = (rect.bottom + h + 12 > innerHeight ? Math.max(10, rect.top - h - 8) : rect.bottom + 8) + 'px';
}
function closeSlash() { if (slashState) { slashState.el.remove(); slashState = null; } }

/* ---- escolha de fontes ---- */
function fontPicker(book, which, onDone) {
  const s = styleOf(book);
  let pick = { font: s.font, titleFont: s.titleFont }, cat = 'todas';
  const isTitle = which === 'titleFont';
  const m = modal(`${sheetHead(isTitle ? 'Fonte dos títulos' : 'Escolha a voz do seu livro')}<div class="sheet-b">
    <div class="fpick"><div>
      <div class="chips" id="fc" style="margin-bottom:14px">${[['todas', 'Todas'], ['classica', 'Clássicas'], ['moderna', 'Modernas'], ['titulo', 'Títulos'], ['manuscrita', 'Manuscritas'], ['maquina', 'Máquina de escrever']].map(([k, n]) => `<button class="chip ${k === cat ? 'on' : ''}" data-c="${k}">${n}</button>`).join('')}</div>
      <div class="fgrid" id="fg"></div></div>
      <div class="fprev-wrap"><div class="lbl" style="margin-bottom:8px">Combinações prontas</div><div class="combos" id="cb"></div>
        <div class="lbl" style="margin-bottom:8px">Prévia</div><div class="fprev" id="pv"></div></div></div>
  </div><div class="sheet-f"><span class="grow"></span><button class="btn" data-close>Cancelar</button><button class="btn terra" id="ok">${I('check')}Usar ${isTitle ? 'esta fonte' : 'estas fontes'}</button></div>`, { size: 'xl' });
  const ch = book.chapters[lastCh(book)];
  const t = document.createElement('template'); t.innerHTML = ch.html;
  const sample = [...t.content.querySelectorAll('p')].map((p) => p.textContent.trim()).filter(Boolean).slice(0, 2);
  const frase = (sample[0] || 'Era uma vez uma história que ainda não tinha sido escrita.').split(/(?<=[.!?])\s/)[0];
  const draw = () => {
    const cur = isTitle ? pick.titleFont : pick.font;
    $('#fg', m.el).innerHTML = FONTES.filter((f) => cat === 'todas' || f.g === cat).map((f) => `<button class="fcard ${f.f === cur ? 'on' : ''}" data-f="${esc(f.f)}">${f.f === cur ? `<span class="ok">${I('check')}</span>` : ''}
      <div class="row" style="gap:12px;align-items:baseline"><span class="aa" style="font-family:${fontStack(f.f)}">Aa</span><span><b>${esc(f.f)}</b><small>${f.c}</small></span></div>
      <p style="font-family:${fontStack(f.f)}">${esc(frase)}</p></button>`).join('');
    $('#cb', m.el).innerHTML = COMBOS.map((c, i) => `<button data-cb="${i}" class="${pick.font === c.b && pick.titleFont === c.t ? 'on' : ''}"><b style="font-family:${fontStack(c.t)}">${c.n}</b><small>${c.t} + ${c.b}</small></button>`).join('');
    const pv = $('#pv', m.el); applyStyle(pv, { ...s, ...pick });
    pv.style.background = 'var(--pbg)'; pv.style.color = 'var(--pink)'; pv.style.boxShadow = '0 14px 34px rgba(60,40,20,.14)';
    pv.innerHTML = `<div class="chapno">Capítulo ${roman(lastCh(book))}</div><div style="text-align:center;font-family:var(--tf);font-style:italic;font-weight:500;font-size:32px;margin:6px 0 4px">${esc(ch.title)}</div><div class="orn" style="margin-bottom:16px">✦ ❦ ✦</div>${(sample.length ? sample : ['Era uma vez uma história que ainda não tinha sido escrita.']).map((p) => `<p style="text-indent:1.4em">${esc(p.slice(0, 420))}</p>`).join('')}`;
  };
  draw();
  $('#fc', m.el).onclick = (e) => { const b = e.target.closest('[data-c]'); if (!b) return; cat = b.dataset.c; $$('#fc .chip', m.el).forEach((x) => x.classList.toggle('on', x === b)); draw(); };
  $('#fg', m.el).onclick = (e) => { const b = e.target.closest('[data-f]'); if (!b) return; pick[isTitle ? 'titleFont' : 'font'] = b.dataset.f; draw(); };
  $('#cb', m.el).onclick = (e) => { const b = e.target.closest('[data-cb]'); if (!b) return; const c = COMBOS[+b.dataset.cb]; pick = { font: c.b, titleFont: c.t }; draw(); };
  $('#ok', m.el).onclick = () => { m.close(); onDone(pick); };
}

/* ---- imagem ---- */
async function imageDialog(existing, put, remove) {
  const d = existing ? existing.dataset : {};
  let src = d.media ? { media: d.media } : d.art ? { art: d.art } : null;
  let tab = d.media ? 'mine' : d.art ? 'art' : 'up', size = d.size || 'inteira';
  const imgs = (await DB.all('media')).filter((x) => x.kind === 'image').sort((a, b) => b.createdAt - a.createdAt);
  const m = modal(`${sheetHead(existing ? 'Imagem' : 'Inserir imagem')}<div class="sheet-b">
    <div class="ipreview" id="pv" ${src ? '' : 'hidden'}></div>
    <div class="seg" id="tb" style="margin-bottom:12px"><button data-t="up">${I('upload')}Do aparelho</button><button data-t="art">Ilustrações</button><button data-t="mine">${I('image')}Já usadas (${imgs.length})</button></div>
    <div id="tc" style="margin-bottom:14px"></div>
    <div class="field"><label>Legenda (opcional)</label><input class="input" id="cp" value="${esc(d.caption || '')}" placeholder="Ex.: A clareira ao luar" maxlength="140"></div>
    <div class="field"><label>Como aparece no texto</label><div class="seg" id="sz">${[['inteira', 'Inteira'], ['lado', 'Ao lado do texto'], ['moldura', 'Com moldura']].map(([k, n]) => `<button data-s="${k}" class="${size === k ? 'on' : ''}">${n}</button>`).join('')}</div></div>
  </div><div class="sheet-f">${remove ? `<button class="btn danger" id="rm">${I('trash')}Tirar</button>` : ''}<span class="grow"></span><button class="btn" data-close>Cancelar</button><button class="btn pri" id="ok">${existing ? 'Salvar' : 'Inserir'}</button></div>`, { size: 'wide' });
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
  $('#sz', m.el).onclick = (e) => { const b = e.target.closest('button'); if (!b) return; size = b.dataset.s; $$('#sz button', m.el).forEach((x) => x.classList.toggle('on', x === b)); };
  tc.onclick = async (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.id === 'dp') {
      const f = await pickFile('image/*'); if (!f) return;
      b.innerHTML = 'Preparando a imagem…';
      const md = await saveMedia('image', await resizeImage(f), f.name); imgs.unshift(md); src = { media: md.id };
      tab = 'mine'; drawTab(); drawPv(); return;
    }
    src = b.dataset.art ? { art: b.dataset.art } : { media: b.dataset.media }; drawTab(); drawPv();
  };
  if (remove) $('#rm', m.el).onclick = () => { m.close(); remove(); };
  $('#ok', m.el).onclick = () => {
    if (!src) { toast('Escolha uma imagem'); return; }
    const el = document.createElement('figure'); el.className = 'm-img';
    if (src.media) el.dataset.media = src.media; else el.dataset.art = src.art;
    el.dataset.caption = $('#cp', m.el).value.trim(); el.dataset.size = size;
    m.close(); put(el);
  };
}

/* ================= VER COMO LIVRO ================= */
// Monta o livro inteiro (folha de rosto + capítulos) no formato usado na tela e no PDF.
function bookBody(book, { titlePage = true } = {}) {
  const parts = [];
  if (titlePage) parts.push(`<section class="bk-title"><h1>${esc(book.title)}</h1><div class="bk-orn" style="margin:1.2em 0">✦ ❦ ✦</div>${book.author ? `<div class="au">${esc(book.author)}</div>` : ''}</section>`);
  book.chapters.forEach((c, i) => {
    const t = document.createElement('template'); t.innerHTML = sanitize(c.html);
    for (const el of [...t.content.querySelectorAll('.m-img')]) {
      const f = document.createElement('figure'); f.dataset.size = el.dataset.size || 'inteira';
      f.innerHTML = imgInner(el.dataset) + (el.dataset.caption ? `<figcaption>${esc(el.dataset.caption)}</figcaption>` : '');
      el.replaceWith(f);
    }
    for (const el of [...t.content.querySelectorAll('.m-scene')]) { const d = document.createElement('div'); d.className = 'bk-scene'; d.textContent = '✦ ✦ ✦'; el.replaceWith(d); }
    for (const p of [...t.content.querySelectorAll('p')]) if (!p.textContent.trim() && !p.querySelector('img')) p.remove();
    const first = t.content.querySelector('p'); if (first) first.classList.add('first');
    const box = document.createElement('div'); box.appendChild(t.content);
    parts.push(`<section class="bk-ch" data-ch="${i}"><div class="bk-chno">CAPÍTULO ${roman(i)}</div><div class="bk-tt">${esc(c.title)}</div><div class="bk-orn">✦ ❦ ✦</div>${box.innerHTML}</section>`);
  });
  return parts.join('');
}
function viewBook(book, ci) {
  const st = styleOf(book);
  let paper = st.paper, scale = 1;
  document.title = `${book.title} — ver como livro`;
  app.innerHTML = `<div class="bk" id="bk">
    <div class="bk-top"><button class="ib" id="back" aria-label="Voltar">${I('left')}</button>
      <div class="t"><b>${esc(book.title)}</b><small id="pgInfo">Ver como livro</small></div><span class="grow"></span>
      <button class="ib" id="aBtn" aria-label="Tamanho da letra">${I('aa')}</button>
      <button class="ib" id="nBtn" aria-label="Papel claro ou escuro">${I(paper === 'noite' ? 'sun' : 'moon')}</button>
      <button class="btn light" id="xBtn">${I('download')}<span class="hide-m">Exportar</span></button></div>
    <div class="bk-stage" id="stage"><div class="bk-book" id="bkBook"></div></div>
    <div class="bk-bot"><button class="ib" id="prev" aria-label="Página anterior">${I('left')}</button><div class="track"><i id="trk"></i></div><button class="ib" id="next" aria-label="Próxima página">${I('right')}</button></div>
  </div>`;
  const bk = $('#bk'), stage = $('#stage'), bb = $('#bkBook');
  const body = bookBody(book);
  let L = null, cur = 0;
  const layout = (keepRatio) => {
    const ratio = L ? cur / Math.max(1, L.pages) : null;
    applyStyle(bk, st, paper);
    const W = stage.clientWidth - 40, H = stage.clientHeight - 20, two = W >= 900;
    let ph = H, pw = ph * 0.68;
    if (two && pw * 2 + 2 > W) { pw = (W - 2) / 2; ph = pw / 0.68; }
    if (!two && pw > W) { pw = W; ph = Math.min(H, pw / 0.62); }
    pw = Math.floor(pw); ph = Math.floor(ph);
    const gut = two ? 2 : 0, m = Math.round(pw * (MARGENS[st.margin] || MARGENS.media).k), mt = Math.round(ph * 0.1), mb = Math.round(ph * 0.1);
    const colW = pw - 2 * m, step = pw + gut;
    bk.style.setProperty('--bfs', clamp(st.size * scale * pw / 560 * 0.95, 11, 30) + 'px');
    bk.style.setProperty('--imgmax', Math.round((ph - mt - mb) * 0.62) + 'px');
    bb.innerHTML = `${two ? '<div class="bk-page l"><div class="hd" id="h0"></div><div class="pn" id="n0"></div></div><div class="bk-gut"></div><div class="bk-page r"><div class="hd" id="h1"></div><div class="pn" id="n1"></div></div>' : '<div class="bk-page solo"><div class="hd" id="h0"></div><div class="pn" id="n0"></div></div>'}
      <div class="bk-clip" style="left:${m}px;top:${mt}px;width:${(two ? 2 * pw + gut : pw) - 2 * m}px;height:${ph - mt - mb}px"><div class="bk-flow" id="flow" style="width:${colW}px;column-width:${colW}px;column-gap:${2 * m + gut}px">${body}<span id="endMark"></span></div></div>`;
    $$('.bk-page', bb).forEach((p) => { p.style.width = pw + 'px'; p.style.height = ph + 'px'; });
    fillMedia(bb);
    const flow = $('#flow'), fx = flow.getBoundingClientRect().left;
    const pageOf = (el) => Math.max(0, Math.round((el.getBoundingClientRect().left - fx) / step));
    const chStarts = $$('.bk-ch', flow).map((s) => pageOf(s));
    L = { two, per: two ? 2 : 1, step, pages: pageOf($('#endMark')) + 1, chStarts, flow };
    if (keepRatio && ratio != null) cur = Math.round(ratio * L.pages); else cur = chStarts[ci] != null ? chStarts[ci] : 0;
    show();
  };
  const chapterAt = (pg) => { let c = -1; L.chStarts.forEach((s, i) => { if (s <= pg) c = i; }); return c; };
  const show = () => {
    cur = clamp(cur - (cur % L.per), 0, Math.max(0, L.pages - 1));
    L.flow.style.transform = `translateX(${-cur * L.step}px)`;
    for (let k = 0; k < L.per; k++) {
      const pg = cur + k, c = chapterAt(pg), isStart = L.chStarts.includes(pg);
      const h = $('#h' + k), n = $('#n' + k); if (!h) continue;
      const inside = pg < L.pages && pg > 0;
      h.textContent = inside && !isStart ? (k === 0 && L.two ? book.title : (c >= 0 ? `Capítulo ${roman(c)} · ${book.chapters[c].title}` : book.title)) : '';
      n.textContent = inside ? pg + 1 : '';
    }
    $('#pgInfo').textContent = L.per === 2 ? `páginas ${cur + 1} e ${Math.min(cur + 2, L.pages)} de ${L.pages}` : `página ${cur + 1} de ${L.pages}`;
    $('#trk').style.width = clamp((cur + L.per) / L.pages * 100, 0, 100) + '%';
    const c = chapterAt(cur); if (c >= 0) LS.set('imersa-lastch-' + book.id, c);
  };
  const turn = (d) => { const nx = cur + d * L.per; if (nx < 0 || nx >= L.pages) return; cur = nx; show(); };
  requestAnimationFrame(() => layout(false));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (L && $('#flow')) layout(true); });
  $('#prev').onclick = () => turn(-1); $('#next').onclick = () => turn(1);
  $('#back').onclick = () => go(`#/livro/${book.id}/${Math.max(0, L ? chapterAt(cur) : ci)}`);
  $('#nBtn').onclick = () => { paper = paper === 'noite' ? (st.paper === 'noite' ? 'creme' : st.paper) : 'noite'; $('#nBtn').innerHTML = I(paper === 'noite' ? 'sun' : 'moon'); layout(true); };
  $('#aBtn').onclick = () => { scale = scale >= 1.2 ? 0.88 : +(scale + 0.12).toFixed(2); layout(true); toast(scale < 1 ? 'Letra menor' : scale > 1.05 ? 'Letra maior' : 'Letra normal', 1000); };
  $('#xBtn').onclick = (e) => exportMenu(e.currentTarget, book);
  const onKey = (e) => { if (modalStack.length) return; if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); turn(1); } else if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); turn(-1); } };
  document.addEventListener('keydown', onKey);
  let rT; const onResize = () => { clearTimeout(rT); rT = setTimeout(() => layout(true), 150); };
  addEventListener('resize', onResize);
  let sx = null;
  bb.addEventListener('pointerdown', (e) => { sx = e.clientX; });
  bb.addEventListener('pointerup', (e) => {
    if (sx == null) return; const dx = e.clientX - sx; sx = null;
    if (Math.abs(dx) > 40) turn(dx < 0 ? 1 : -1);
    else { const r = bb.getBoundingClientRect(), x = e.clientX - r.left; if (x < r.width * 0.25) turn(-1); else if (x > r.width * 0.75) turn(1); }
  });
  onLeave(() => { document.removeEventListener('keydown', onKey); removeEventListener('resize', onResize); clearTimeout(rT); });
}

/* ================= exportar ================= */
function exportMenu(anchor, book) {
  popMenu(anchor, [
    ...(NATIVE ? [] : [{ icon: 'book', label: 'PDF (para imprimir ou enviar)', run: () => exportPDF(book) }]),
    { icon: 'book', label: 'EPUB (leitores de e-book)', run: () => exportEPUB(book) },
    { icon: 'edit', label: 'Word (.doc)', run: () => exportWord(book) },
    '-',
    { icon: 'download', label: 'Arquivo do Calhamaço (.json)', run: () => exportBook(book) },
  ]);
}
const blobToData = (b) => new Promise((r) => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(b); });
async function downloadBlob(name, blob) {
  const FS = plugin('Filesystem'), SHARE = plugin('Share');
  if (FS && SHARE) {
    // No APK: grava o arquivo e abre o compartilhar (Google Drive, WhatsApp, Arquivos…).
    try {
      const data = (await blobToData(blob)).split(',')[1];
      const { uri } = await FS.writeFile({ path: name, data, directory: 'CACHE' });
      await SHARE.share({ title: name, files: [uri], dialogTitle: 'Guardar ou enviar o arquivo' });
    } catch (e) { if (!/cancel|abort/i.test(String(e && (e.message || e.name)))) toast('Não deu para gerar o arquivo.'); }
    return;
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'livro';
async function exportPDF(book) {
  let area = $('#printArea'); if (!area) { area = document.createElement('div'); area.id = 'printArea'; document.body.appendChild(area); }
  applyStyle(area, styleOf(book), 'branco');
  area.innerHTML = bookBody(book);
  await fillMedia(area);
  await Promise.all($$('img', area).map((im) => (im.complete ? 0 : new Promise((r) => { im.onload = im.onerror = r; }))));
  if (document.fonts) await document.fonts.ready;
  const old = document.title; document.title = book.title;
  setTimeout(() => { window.print(); document.title = old; }, 50);
}
// imagens do livro, para virarem arquivos (EPUB) ou dados embutidos (Word)
async function bookImages(book) {
  const out = new Map(); // "m:id" ou "a:tema" → { name, type, blob }
  const add = async (key) => {
    if (out.has(key)) return;
    if (key.startsWith('m:')) {
      const m = await DB.get('media', key.slice(2)); if (!m) return;
      const t = m.blob.type || 'image/jpeg', ext = /png/.test(t) ? 'png' : /webp/.test(t) ? 'webp' : /gif/.test(t) ? 'gif' : 'jpg';
      out.set(key, { name: `img/${key.slice(2)}.${ext}`, type: t, blob: m.blob });
    } else {
      const svg = Arte.svg(key.slice(2)).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ').replace(/style="[^"]*"/, 'width="1200" height="700"');
      out.set(key, { name: `img/${key.slice(2)}.svg`, type: 'image/svg+xml', blob: new Blob([svg], { type: 'image/svg+xml' }) });
    }
  };
  if (book.coverMedia) await add('m:' + book.coverMedia);
  for (const c of book.chapters) {
    const t = document.createElement('template'); t.innerHTML = c.html || '';
    for (const f of t.content.querySelectorAll('.m-img')) await add(f.dataset.media ? 'm:' + f.dataset.media : 'a:' + (f.dataset.art || 'floresta'));
  }
  return out;
}
async function svgToJpg(blob) {
  const url = URL.createObjectURL(blob), im = new Image();
  await new Promise((r) => { im.onload = im.onerror = r; im.src = url; });
  const c = document.createElement('canvas'); c.width = 1200; c.height = 700; c.getContext('2d').drawImage(im, 0, 0, 1200, 700); URL.revokeObjectURL(url);
  return new Promise((r) => c.toBlob(r, 'image/jpeg', 0.88));
}
const exportDoc = document.implementation.createHTMLDocument('');
// capítulo para EPUB (xhtml = true) ou Word, com as imagens apontando para src
function chapterExport(book, i, srcOf, xhtml) {
  const c = book.chapters[i];
  const t = document.createElement('template'); t.innerHTML = sanitize(c.html);
  for (const el of [...t.content.querySelectorAll('.m-img')]) {
    const src = srcOf(el.dataset.media ? 'm:' + el.dataset.media : 'a:' + (el.dataset.art || 'floresta'));
    const f = t.content.ownerDocument.createElement('figure');
    f.innerHTML = (src ? `<img src="${src}" alt="${esc(el.dataset.caption || '')}">` : '') + (el.dataset.caption ? `<figcaption>${esc(el.dataset.caption)}</figcaption>` : '');
    el.replaceWith(f);
  }
  for (const el of [...t.content.querySelectorAll('.m-scene')]) { const d = t.content.ownerDocument.createElement('p'); d.className = 'cena'; d.textContent = '✦ ✦ ✦'; el.replaceWith(d); }
  for (const p of [...t.content.querySelectorAll('p')]) if (!p.textContent.trim() && !p.querySelector('img')) p.remove();
  const first = t.content.querySelector('p:not(.cena)'); if (first) first.className = 'primeiro';
  const box = exportDoc.createElement('div'); box.appendChild(exportDoc.importNode(t.content, true));
  const inner = xhtml ? [...box.childNodes].map((n) => new XMLSerializer().serializeToString(n)).join('') : box.innerHTML;
  return `<p class="chno">CAPÍTULO ${roman(i)}</p><h1>${esc(c.title)}</h1><p class="orn">✦ ❦ ✦</p>${inner}`;
}
async function exportWord(book) {
  toast('Preparando o arquivo do Word…');
  const st = styleOf(book), imgs = await bookImages(book), data = new Map();
  for (const [k, v] of imgs) data.set(k, await blobToData(v.type === 'image/svg+xml' ? await svgToJpg(v.blob) : v.blob));
  const html = book.chapters.map((c, i) => `<div style="page-break-before:always">${chapterExport(book, i, (k) => data.get(k), false)}</div>`).join('');
  const doc = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>${esc(book.title)}</title>
<style>@page Section1{size:14.8cm 21cm;margin:2cm 1.8cm 2.2cm}div.Section1{page:Section1}body{font-family:'${st.font}',Georgia,serif;font-size:12pt;line-height:1.5}p{margin:0;text-indent:1.2cm;text-align:justify}p.primeiro,p.chno,p.orn,p.cena{text-indent:0}p.chno{text-align:center;font-size:9pt;letter-spacing:3pt;color:#777;margin-top:3cm}h1{text-align:center;font-family:'${st.titleFont}',Georgia,serif;font-style:italic;font-weight:normal;font-size:24pt;margin:6pt 0}p.orn,p.cena{text-align:center;color:#a07a35;margin:8pt 0 18pt}figure{margin:12pt 0;text-align:center}img{width:12cm}figcaption{font-style:italic;font-size:10pt;color:#666;text-align:center}.capa{text-align:center;margin-top:6cm}.capa h1{font-size:30pt;font-style:normal}</style></head>
<body><div class="Section1"><div class="capa"><h1>${esc(book.title)}</h1>${book.author ? `<p style="text-align:center;text-indent:0;font-style:italic">${esc(book.author)}</p>` : ''}</div>${html}</div></body></html>`;
  await downloadBlob(`${slug(book.title)}.doc`, new Blob(['﻿' + doc], { type: 'application/msword' }));
}
/* zip simples (sem compressão), suficiente para o EPUB */
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = (u8) => { let c = 0xFFFFFFFF; for (let i = 0; i < u8.length; i++) c = CRC[(c ^ u8[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
function zip(files, type) {
  const enc = new TextEncoder(), parts = [], central = []; let off = 0;
  for (const f of files) {
    const nm = enc.encode(f.name), d = f.data, crc = crc32(d);
    const h = new DataView(new ArrayBuffer(30));
    h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(12, 0x21, true);
    h.setUint32(14, crc, true); h.setUint32(18, d.length, true); h.setUint32(22, d.length, true); h.setUint16(26, nm.length, true);
    parts.push(new Uint8Array(h.buffer), nm, d);
    const c = new DataView(new ArrayBuffer(46));
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint16(14, 0x21, true);
    c.setUint32(16, crc, true); c.setUint32(20, d.length, true); c.setUint32(24, d.length, true); c.setUint16(28, nm.length, true); c.setUint32(42, off, true);
    central.push(new Uint8Array(c.buffer), nm);
    off += 30 + nm.length + d.length;
  }
  const size = central.reduce((a, b) => a + b.length, 0), e = new DataView(new ArrayBuffer(22));
  e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, size, true); e.setUint32(16, off, true);
  return new Blob([...parts, ...central, new Uint8Array(e.buffer)], { type });
}
async function exportEPUB(book) {
  toast('Preparando o EPUB…');
  const st = styleOf(book), imgs = await bookImages(book), enc = new TextEncoder(), files = [];
  const txt = (name, s) => files.push({ name, data: enc.encode(s) });
  const page = (title, body) => `<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE html>\n<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="pt-BR" xml:lang="pt-BR"><head><meta charset="utf-8"/><title>${esc(title)}</title><link rel="stylesheet" type="text/css" href="estilo.css"/></head><body>${body}</body></html>`;
  txt('mimetype', 'application/epub+zip');
  txt('META-INF/container.xml', '<?xml version="1.0" encoding="utf-8"?>\n<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>');
  txt('OEBPS/estilo.css', `body{font-family:"${st.font}",Georgia,serif;line-height:1.55}p{margin:0;text-indent:1.4em;text-align:justify}p.primeiro,p.chno,p.orn,p.cena{text-indent:0}p.chno{text-align:center;font-size:.75em;letter-spacing:.3em;color:#777;margin-top:3em}h1{text-align:center;font-family:"${st.titleFont}",Georgia,serif;font-style:italic;font-weight:normal;font-size:1.9em;margin:.3em 0}p.orn,p.cena{text-align:center;color:#a07a35;margin:.6em 0 1.4em}figure{margin:1em 0;text-align:center}img{max-width:100%}figcaption{font-style:italic;font-size:.85em;color:#666}.rosto{text-align:center;margin-top:30%}.rosto h1{font-style:normal;font-size:2.2em}.capa{text-align:center}.capa img{max-height:95vh}`);
  const items = [], spine = [];
  const cover = book.coverMedia && imgs.get('m:' + book.coverMedia);
  if (cover) { txt('OEBPS/capa.xhtml', page(book.title, `<div class="capa"><img src="${cover.name}" alt="Capa"/></div>`)); items.push('<item id="capa" href="capa.xhtml" media-type="application/xhtml+xml"/>'); spine.push('<itemref idref="capa"/>'); }
  txt('OEBPS/rosto.xhtml', page(book.title, `<div class="rosto"><h1>${esc(book.title)}</h1><p class="orn">✦ ❦ ✦</p>${book.author ? `<p class="orn" style="font-style:italic;color:#555">${esc(book.author)}</p>` : ''}</div>`));
  items.push('<item id="rosto" href="rosto.xhtml" media-type="application/xhtml+xml"/>'); spine.push('<itemref idref="rosto"/>');
  book.chapters.forEach((c, i) => {
    txt(`OEBPS/cap${i + 1}.xhtml`, page(c.title, `<section epub:type="chapter">${chapterExport(book, i, (k) => imgs.get(k) && imgs.get(k).name, true)}</section>`));
    items.push(`<item id="cap${i + 1}" href="cap${i + 1}.xhtml" media-type="application/xhtml+xml"/>`); spine.push(`<itemref idref="cap${i + 1}"/>`);
  });
  txt('OEBPS/nav.xhtml', page('Sumário', `<nav epub:type="toc" id="toc"><h1>Sumário</h1><ol>${book.chapters.map((c, i) => `<li><a href="cap${i + 1}.xhtml">${roman(i)}. ${esc(c.title)}</a></li>`).join('')}</ol></nav>`));
  let n = 0;
  for (const [k, v] of imgs) { files.push({ name: 'OEBPS/' + v.name, data: new Uint8Array(await v.blob.arrayBuffer()) }); items.push(`<item id="im${++n}" href="${v.name}" media-type="${v.type}"${cover && k === 'm:' + book.coverMedia ? ' properties="cover-image"' : ''}/>`); }
  txt('OEBPS/content.opf', `<?xml version="1.0" encoding="utf-8"?>\n<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid" xml:lang="pt-BR"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="uid">urn:calhamaco:${esc(book.id)}</dc:identifier><dc:title>${esc(book.title)}</dc:title>${book.author ? `<dc:creator>${esc(book.author)}</dc:creator>` : ''}<dc:language>pt-BR</dc:language><meta property="dcterms:modified">${new Date().toISOString().slice(0, 19)}Z</meta></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="css" href="estilo.css" media-type="text/css"/>${items.join('')}</manifest><spine>${spine.join('')}</spine></package>`);
  await downloadBlob(`${slug(book.title)}.epub`, zip(files, 'application/epub+zip'));
}

/* ================= backup ================= */
const json = (o) => new Blob([JSON.stringify(o)], { type: 'application/json' });
async function packMedia(ids) {
  const out = [];
  for (const id of ids) { const m = await DB.get('media', id); if (m && m.kind === 'image') { const { blob, ...rest } = m; out.push({ ...rest, data: await blobToData(blob) }); } }
  return out;
}
function mediaIdsOf(b) {
  const ids = new Set(); if (b.coverMedia) ids.add(b.coverMedia);
  for (const c of b.chapters) for (const m of (c.html || '').matchAll(/data-media="([^"]+)"/g)) ids.add(m[1]);
  return [...ids];
}
// "app: imersa" continua no arquivo para os backups antigos e novos abrirem nas duas versões.
async function exportBook(b) { toast('Preparando o arquivo…'); await downloadBlob(`${slug(b.title)}.calhamaco.json`, json({ app: 'imersa', v: 2, books: [b], media: await packMedia(mediaIdsOf(b)) })); }
async function exportAll() {
  toast('Preparando o backup…');
  const media = await DB.all('media');
  await downloadBlob(`calhamaco-backup-${today()}.json`, json({ app: 'imersa', v: 2, books, media: await packMedia(media.map((m) => m.id)) }));
}
async function importFile() {
  const f = await pickFile('application/json,.json'); if (!f) return;
  let data; try { data = JSON.parse(await f.text()); } catch (e) { return toast('Arquivo inválido'); }
  if (!data || data.app !== 'imersa' || !Array.isArray(data.books)) return toast('Este arquivo não é do Calhamaço');
  for (const m of data.media || []) {
    if (!m.id || !m.data || m.kind !== 'image') continue;
    const blob = await (await fetch(m.data)).blob(); const { data: _, ...rest } = m;
    await DB.put('media', { ...rest, blob });
  }
  let n = 0;
  for (const b of data.books) {
    if (!b || !Array.isArray(b.chapters)) continue;
    const nb = { ...newBook(), ...b, chapters: b.chapters.map((c) => ({ id: c.id || uid(), title: String(c.title || ''), html: sanitize(c.html), notes: String(c.notes || '') })) };
    if (getBook(nb.id)) { nb.id = uid(); nb.title += ' (cópia)'; }
    books.unshift(nb); await DB.put('books', nb); n++;
  }
  await loadBooks(); route();
  toast(n === 1 ? 'Livro aberto na estante' : `${n} livros abertos na estante`);
}

/* ================= livros de exemplo ================= */
function sampleBook() {
  const c1 = `<p>A névoa havia recuado para a beira do rio quando Lia finalmente alcançou a clareira. As árvores, antes cerradas como muralhas, abriam-se agora num círculo perfeito, e no centro dele a lua derramava uma luz tão fria que parecia possível segurá-la nas mãos.</p>
<p>Foi então que ouviu um piado longo, vindo de muito acima, como se a própria noite tivesse resolvido falar.</p>
<figure class="m-img" data-art="floresta" data-size="inteira" data-caption="A clareira ao luar"></figure>
<p>Lia deu um passo à frente. Sob suas botas, um galho estalou, e o som correu entre os troncos como um aviso.</p>
<p>— Quem está aí? — perguntou, e a própria voz lhe pareceu pequena demais para tanto silêncio.</p>
<p>Ninguém respondeu. Só os grilos, que continuavam sua conversa antiga, e o vento, que passava entre os pinheiros como quem procura alguma coisa perdida. Ela apertou a lanterna contra o peito e contou até dez, como a avó ensinara.</p>
<p>No sete, ouviu passos atrás de si. Leves, cuidadosos, quase educados.</p>
<p>No dez, virou-se.</p>
<p>Não havia ninguém. Havia apenas, no chão úmido da clareira, uma trilha de pegadas pequenas que começava exatamente onde ela estava e seguia em direção ao rio — pegadas de alguém que, até um instante atrás, caminhava ao seu lado sem que ela soubesse.</p>
<div class="m-scene"></div>
<p>Quando o dia nasceu, ela já estava longe da floresta, seguindo as pegadas até a beira do mar.</p>`;
  const c2 = `<figure class="m-img" data-art="farol" data-size="inteira" data-caption="O farol no penhasco"></figure>
<p>A tempestade chegou sem pedir licença. Primeiro o vento, que dobrou as gramas do penhasco como quem penteia um bicho assustado; depois a chuva, grossa e fria, batendo nas pedras.</p>
<p>Lia ergueu os olhos para a torre. Lá no alto, onde ninguém subia havia quarenta anos, uma luz acabava de se acender. E, no exato instante em que o céu se partiu ao meio, ela entendeu que não estava sozinha.</p>
<p>A porta do farol, que deveria estar trancada, rangia aberta no ritmo do vento. Ela entrou. A escada subia em espiral, e cada degrau respondia aos seus passos com um gemido de madeira velha.</p>
<p>Lá em cima, diante da grande lente, havia uma menina de cabelos molhados olhando o mar.</p>
<p>— Você demorou — disse a menina, sem se virar. — As pegadas eram minhas.</p>`;
  return newBook({ title: 'A Floresta dos Sussurros', genre: 'Exemplo · fantasia', theme: 'floresta', style: { ...DEF_STYLE, font: 'EB Garamond', titleFont: 'Cinzel' },
    chapters: [{ id: uid(), title: 'Sob a lua de prata', html: c1, notes: '' }, { id: uid(), title: 'O farol esquecido', html: c2, notes: '' }] });
}
// Livros de exemplo (exemplos.js): entram na estante uma única vez, com a imagem guardada no aparelho.
async function seedExamples() {
  if (typeof EXEMPLOS === 'undefined') return;
  const done = LS.get('imersa-exemplos', []);
  for (const ex of EXEMPLOS) {
    if (done.includes(ex.id)) continue;
    if (!getBook(ex.id)) {
      try {
        const r = await fetch(ex.imagem.arquivo); if (!r.ok) throw new Error(ex.imagem.arquivo);
        const img = await saveMedia('image', await r.blob(), ex.imagem.nome);
        const b = newBook({ id: ex.id, title: ex.titulo, genre: ex.genero, coverMedia: img.id, style: { ...DEF_STYLE, ...(ex.estilo || {}) },
          chapters: ex.capitulos.map((c) => ({ id: uid(), title: c.titulo, html: c.html.replaceAll('__IMG__', img.id), notes: '' })) });
        await DB.put('books', b); books.unshift(b);
      } catch (e) { continue; } // sem o arquivo agora: tenta de novo na próxima abertura
    }
    done.push(ex.id); LS.set('imersa-exemplos', done);
  }
}

/* ================= introdução ================= */
// Ao abrir: um calhamaço fecha-se no centro, a capa abre, as folhas viram, as linhas se escrevem e o nome aparece.
// Toque em qualquer lugar para pular. Dá para desligar (ou rever) no menu da estante.
const INTRO_MS = 3600;
const introOn = () => LS.get('calh-intro', true);
function showIntro(ready = Promise.resolve()) {
  $$('.intro').forEach((x) => x.remove());
  const el = document.createElement('div'); el.className = 'intro'; el.setAttribute('role', 'presentation');
  const nome = 'Calhamaço';
  el.innerHTML = `<div class="in-wrap">
    <div class="in-stage"><div class="in-book">
      <div class="in-page"><i class="in-cap"></i><i class="in-orn">✦ ❦ ✦</i>
        <p><b class="in-drop"></b>${[92, 84, 96, 70, 100, 88, 94, 60].map((w, i) => `<i class="ln" style="--w:${w}%;--d:${(1.75 + i * .11).toFixed(2)}s"></i>`).join('')}</p>
        <i class="in-pen"></i><i class="in-ribbon"></i></div>
      ${[0, 1, 2].map((i) => `<div class="in-leaf" style="--i:${i}"></div>`).join('')}
      <div class="in-cover"><div class="in-front"><span class="in-frame"><b>C</b><i>✦ ✦ ✦</i></span></div><div class="in-inside"><i>❦</i></div></div>
    </div><div class="in-shadow"></div></div>
    <h1 class="in-name" aria-label="${nome}">${[...nome].map((c, i) => `<span style="--d:${(1.45 + i * .05).toFixed(2)}s">${c}</span>`).join('')}</h1>
    <svg class="in-swash" viewBox="0 0 220 18" aria-hidden="true"><path d="M4 12 C 50 2, 90 18, 130 9 S 196 4, 216 10"/></svg>
    <p class="in-tag">escreva o seu livro</p>
  </div><button class="in-skip">Pular</button>`;
  document.body.appendChild(el);
  let done = false;
  const finish = () => { if (done) return; done = true; el.classList.add('out'); setTimeout(() => el.remove(), 650); };
  el.addEventListener('click', finish);
  Promise.all([ready, new Promise((r) => setTimeout(r, INTRO_MS))]).then(finish, finish);
}
function toggleIntro() {
  const on = !introOn(); LS.set('calh-intro', on);
  toast(on ? 'A introdução vai aparecer ao abrir o app' : 'O app vai abrir direto na estante');
}

/* ================= início ================= */
(async () => {
  let ready = () => {}; const readyP = new Promise((r) => { ready = r; });
  if (introOn() && !matchMedia('(prefers-reduced-motion: reduce)').matches) showIntro(readyP);
  try {
    await loadBooks();
    if (!LS.get('imersa-seeded', false) && !books.length) { const b = sampleBook(); await DB.put('books', b); books = [b]; }
    LS.set('imersa-seeded', true);
    await seedExamples();
  } catch (e) {
    ready();
    app.innerHTML = '<div class="empty">Não foi possível abrir o armazenamento do navegador. Saia do modo anônimo ou libere espaço e tente de novo.</div>';
    return;
  }
  addEventListener('hashchange', route);
  route();
  ready();
  // Funciona sem internet: no site pelo service worker; no APK os arquivos já vêm dentro dele.
  if (!NATIVE && 'serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  // Botão voltar do Android: fecha o que estiver aberto, depois volta uma tela, e na estante minimiza.
  const AppP = plugin('App');
  if (AppP) AppP.addListener('backButton', () => {
    if ($('.intro')) { $('.intro').click(); return; }
    if (slashState) { closeSlash(); return; }
    if ($('.menu')) { closeMenus(); return; }
    if (modalStack.length) { modalStack[modalStack.length - 1](); return; }
    if (document.body.classList.contains('focus')) { document.body.classList.remove('focus'); const x = $('#exitFocus'); if (x) x.hidden = true; return; }
    if ($('.side.open')) { $('.side-bd') && $('.side-bd').click(); return; }
    const [, a, b, c] = (location.hash.slice(1) || '/').split('/');
    if (a === 'ler') go(`#/livro/${b}/${c || 0}`);
    else if (a === 'livro' || a === 'favoritos') go('#/');
    else AppP.minimizeApp();
  });
})();
