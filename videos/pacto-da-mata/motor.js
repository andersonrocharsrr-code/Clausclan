// ================= Motor (canvas 2D, 1920x1080) — O Pacto da Mata =================
// Base do modelo Recorte Dourado (legenda palavra por palavra, placas, cartões de capítulo, grão),
// com pintura em camadas: degradês, luz volumétrica, neblina e profundidade.
const W = 1920, H = 1080;
const cv = document.getElementById('c'); let c = cv.getContext('2d');
const lerp = (a, b, u) => a + (b - a) * u, clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (t, a, b) => clamp((t - a) / (b - a)), ease = u => u * u * (3 - 2 * u), eo = u => 1 - Math.pow(1 - u, 3), ei = u => u * u * u;
const sin = Math.sin, cos = Math.cos, PI = Math.PI, TAU = PI * 2;
function rng(s) { return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 } }
function lg(x0, y0, x1, y1, st) { const g = c.createLinearGradient(x0, y0, x1, y1); st.forEach(([o, col]) => g.addColorStop(o, col)); return g }
function rg(x, y, r0, r1, st) { const g = c.createRadialGradient(x, y, r0, x, y, r1); st.forEach(([o, col]) => g.addColorStop(o, col)); return g }
function disc(x, y, r, col) { if (r <= 0) return; c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill() }
function ell(x, y, rx, ry, a, col) { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(.01, rx), Math.max(.01, ry), a, 0, TAU); c.fill() }
function glow(x, y, r, rgb, a) { if (a <= .003 || r <= 0) return; c.fillStyle = rg(x, y, 0, r, [[0, `rgba(${rgb},${a})`], [.4, `rgba(${rgb},${a * .45})`], [1, `rgba(${rgb},0)`]]); c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill() }
function poly(pts, fill, stroke, lw) { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); if (fill) { c.fillStyle = fill; c.fill() } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 1; c.stroke() } }
function line(x0, y0, x1, y1, col, lw) { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke() }
function pill(x, y, w, h, col) { c.fillStyle = col; c.beginPath(); c.roundRect(x - w / 2, y - h / 2, w, h, h / 2); c.fill() }
// caminho suave por pontos (Catmull-Rom → Bézier)
function smooth(pts, closed) {
  const n = pts.length, P = i => pts[closed ? (i + n) % n : clamp(i, 0, n - 1)];
  c.moveTo(...pts[0]);
  for (let i = 0; i < (closed ? n : n - 1); i++) { const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2); c.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]) }
  if (closed) c.closePath();
}
function blob(pts, fill) { c.beginPath(); smooth(pts, true); c.fillStyle = fill; c.fill() }
const add = fn => { c.save(); c.globalCompositeOperation = 'lighter'; fn(); c.restore() };
const alpha = (a, fn) => { if (a <= 0) return; c.save(); c.globalAlpha *= a; fn(); c.restore() };
const shade = (rgb, k) => rgb.split(',').map(v => Math.min(255, Math.round(v * k))).join(',');
function hex2rgb(h) { const n = parseInt(h.slice(1), 16); return `${n >> 16},${(n >> 8) & 255},${n & 255}` }
function mix(h1, h2, u) { const a = hex2rgb(h1).split(',').map(Number), b = hex2rgb(h2).split(',').map(Number); return `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], u))).join(',')})` }
function at(x, y, s, fn, ang = 0, flip = false) { c.save(); c.translate(x, y); if (ang) c.rotate(ang); c.scale(flip ? -s : s, s); fn(); c.restore() }
function zoomTela(z, fx, fy, fn) { c.save(); c.translate(fx, fy); c.scale(z, z); c.translate(-fx, -fy); fn(); c.restore() }
function treme(a, t) { if (a > 0) c.translate(sin(t * 61) * a + sin(t * 37) * a * .6, cos(t * 53) * a * .8) }

// ---------- camadas guardadas (desenhadas uma vez, depois só deslocadas) ----------
const CACHE = new Map();
function camada(key, w, h, fn) {
  let e = CACHE.get(key); if (e) return e;
  const cvs = document.createElement('canvas'); cvs.width = w; cvs.height = h; const old = c;
  c = cvs.getContext('2d'); try { fn(w, h) } finally { c = old }
  if (CACHE.size > 60) CACHE.delete(CACHE.keys().next().value);
  CACHE.set(key, cvs); return cvs;
}
// tela de rascunho para pintar figuras e depois banhá-las na luz da cena
const RASC = [0, 1].map(() => { const x = document.createElement('canvas'); x.width = W; x.height = H; return x });
let rascN = 0;
function banho(cor, a, fn, rim) { // desenha fn, cobre com a cor da luz da cena (só onde há figura) e cola na tela
  const r = RASC[rascN++ % 2], old = c; c = r.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H);
  const m = old.getTransform(); c.setTransform(m); fn(); c.setTransform(1, 0, 0, 1, 0, 0);
  if (a > 0) { c.globalCompositeOperation = 'source-atop'; c.fillStyle = cor; c.globalAlpha = a; c.fillRect(0, 0, W, H) }
  if (rim) { c.globalCompositeOperation = 'source-atop'; c.globalAlpha = 1; c.fillStyle = rim; c.fillRect(0, 0, W, H) }
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c = old;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(r, 0, 0); c.restore();
}

// ---------- textos ----------
const COND = '"Fira Sans Extra Condensed", "Liberation Sans Narrow", Arial, sans-serif';
const OURO = '#e8b65a', CREME = '#fff4dc';
function txt(str, x, y, size, col, o = {}) { c.save(); c.globalAlpha *= o.a ?? 1; c.font = `${o.w || 800} ${size}px ${COND}`; c.textAlign = o.align || 'left'; if ('letterSpacing' in c) c.letterSpacing = (o.ls ?? size * .02) + 'px'; if (o.sh !== 0) { c.shadowColor = 'rgba(4,6,8,.9)'; c.shadowBlur = size * .22; c.shadowOffsetY = size * .04; c.fillStyle = col; c.fillText(str, x, y); c.shadowBlur = size * .55; c.shadowOffsetY = 0; c.shadowColor = 'rgba(4,6,8,.6)'; c.fillText(str, x, y) } else { c.fillStyle = col; c.fillText(str, x, y) } c.restore() }
// placa no canto: escreve letra por letra, traço dourado embaixo e linha menor
function typeText(tl, x, y, str, t0, t1, o = {}) {
  const { size = 64, col = CREME, cps = 24, sub = null, subSize = 38 } = o;
  const al = Math.min(ramp(tl, t0 - .2, t0), 1 - ramp(tl, t1 - .4, t1)); if (al <= 0) return;
  c.save(); c.globalAlpha = al; c.font = `800 ${size}px ${COND}`; if ('letterSpacing' in c) c.letterSpacing = size * .02 + 'px';
  const n = clamp(Math.floor((tl - t0) * cps), 0, str.length), w = c.measureText(str).width, wn = c.measureText(str.slice(0, n)).width;
  c.save(); c.translate(x + w * .4, y); c.scale(1.9, 1); glow(0, 0, 150 + w * .32, '4,6,8', .55); c.restore();
  txt(str.slice(0, n), x, y, size, col);
  c.fillStyle = OURO; c.fillRect(x, y + 14, Math.max(wn, w * ramp(tl, t0, t0 + str.length / cps)), 3);
  if (sub) { const t2 = t0 + str.length / cps + .15, n2 = clamp(Math.floor((tl - t2) * cps * 1.5), 0, sub.length); txt(sub.slice(0, n2), x, y + 58, subSize, '#e8d6a8', { w: 600, ls: subSize * .12 }) }
  c.restore();
}
// cartão de capítulo: tela escura, "CAPÍTULO N" em dourado e o título em creme
function chapter(tl, n, title, dur = 4) {
  const a = Math.min(ramp(tl, 0, .5), 1 - ramp(tl, dur - .7, dur)); if (a <= 0) return;
  c.save(); c.globalAlpha = a; c.fillStyle = '#05080a'; c.fillRect(0, 0, W, H); add(() => glow(W / 2, 540, 700, '200,140,60', .1));
  const u = eo(ramp(tl, .2, .9));
  txt(`CAPÍTULO ${n}`, W / 2, 452, 46, OURO, { align: 'center', w: 600, ls: 16 });
  c.fillStyle = OURO; c.fillRect(W / 2 - 260 * u, 482, 520 * u, 3);
  c.globalAlpha = a * u; txt(title, W / 2, 620 + (1 - u) * 20, title.length > 22 ? 104 : 124, CREME, { align: 'center', ls: 4 });
  c.restore();
}
function label(x, y, str, o = {}) { const { size = 44, col = CREME, align = 'left', a = 1 } = o; if (a > 0) txt(str, x, y, size, col, { align, a, w: o.w || 800, sh: o.sh, ls: o.ls }) }
// legenda no rodapé, palavra por palavra. Fala de personagem: travessão e cor própria.
const COR_VOZ = { N: '#fff8ec', F: '#f3e2c0', A: '#e6ecf0', D: '#ff8a70' };
function legenda(t) {
  const L = LEG.find(l => t >= l.t0 && t < l.t1); if (!L) return;
  const size = 56; c.save(); c.font = `800 ${size}px ${COND}`; if ('letterSpacing' in c) c.letterSpacing = '1px';
  const w = L.v === 'N' ? L.w : [['—', L.w[0][1], 0], ...L.w];
  const sp = c.measureText(' ').width + 4, ws = w.map(([s]) => c.measureText(s).width), tot = ws.reduce((a, b) => a + b + sp, -sp);
  let lines = [[]]; if (tot > 1300) { let acc = 0; w.forEach((_, i) => { if (acc > tot / 2 - ws[i] / 2 && lines.length === 1) lines.push([]); lines[lines.length - 1].push(i); acc += ws[i] + sp }) } else lines = [w.map((_, i) => i)];
  const fo = 1 - ramp(t, L.t1 - .12, L.t1);
  lines.forEach((ln, k) => {
    const lw = ln.reduce((a, i) => a + ws[i] + sp, -sp); let x = W / 2 - lw / 2; const y = (lines.length === 1 ? 990 : 952) + k * 64;
    ln.forEach(i => { const [s, tw, hl] = w[i], u = ramp(t, tw - .04, tw + .12); if (u > 0) { c.globalAlpha = fo * u; txt(s, x, y + (1 - eo(u)) * 10, size, hl ? '#f0b94a' : COR_VOZ[L.v]) } x += ws[i] + sp });
  });
  c.restore();
}
// tempo absoluto de uma palavra/frase dentro de uma fala
const norm = s => s.toLowerCase().replace(/[^\wà-ÿ-]/g, '');
function P(k, frase, d = 0) {
  const ws = FW[k], alvo = frase.split(' ').map(norm);
  for (let i = 0; i + alvo.length <= ws.length; i++) if (alvo.every((a, j) => norm(ws[i + j][0]) === a)) return ws[i][1] + d;
  console.error('frase não achada', k, frase); return S[k] + d;
}
// acabamento: sombra do rodapé, vinheta e grão de filme
const GRAIN = (() => { const g = document.createElement('canvas'); g.width = g.height = 512; const x = g.getContext('2d'), d = x.createImageData(512, 512), q = rng(123); for (let i = 0; i < d.data.length; i += 4) { const v = 100 + q() * 155 | 0; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255 } x.putImageData(d, 0, 0); return g })();
function finish(t) {
  c.fillStyle = lg(0, 780, 0, H, [[0, 'rgba(3,6,8,0)'], [1, 'rgba(3,6,8,.7)']]); c.fillRect(0, 780, W, H - 780);
  c.fillStyle = rg(W / 2, H / 2, 520, 1180, [[0, 'rgba(2,6,8,0)'], [1, 'rgba(2,6,8,.62)']]); c.fillRect(0, 0, W, H);
  c.save(); c.globalCompositeOperation = 'overlay'; c.globalAlpha = .1; const q = rng(Math.floor(t * 6) + 1), ox = q() * 512 | 0, oy = q() * 512 | 0; for (let x = -ox; x < W; x += 512)for (let y = -oy; y < H; y += 512)c.drawImage(GRAIN, x, y); c.restore();
}

// ---------- tomadas ----------
const SHOTS = [];
function shot(t0, t1, fn) { SHOTS.push({ t0, t1, fn }) }
function render(t) {
  const s = SHOTS.find(s => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none'; c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
  c.save(); s.fn(t - s.t0, t, s.t1 - s.t0); c.restore();
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
  finish(t); legenda(t);
  const fd = Math.max(1 - ramp(t, 0, .6), ramp(t, DUR - 1.2, DUR - .1)); if (fd > 0) { c.fillStyle = `rgba(0,0,0,${fd})`; c.fillRect(0, 0, W, H) }
}
