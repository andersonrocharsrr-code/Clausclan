// ================= Motor de desenho vertical (1080x1920, TikTok / WhatsApp) — modelo Recorte Dourado =================
// Paleta Recorte Dourado (padrão da Starship): espaço em azul-ardósia profundo, ocre, creme e dourado, com grão de papel.
// Planos de luz e sombra com borda reta, grão de papel, placas que se escrevem e legenda palavra por palavra.
const W = 1080, H = 1920;
const cv = document.getElementById('c'); let c = cv.getContext('2d');
const lerp = (a, b, u) => a + (b - a) * u, clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (t, a, b) => clamp((t - a) / (b - a)), ease = u => u * u * (3 - 2 * u), eo = u => 1 - Math.pow(1 - u, 3);
const sin = Math.sin, cos = Math.cos, PI = Math.PI;
function rng(s) { return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 } }
function lg(x0, y0, x1, y1, st) { const g = c.createLinearGradient(x0, y0, x1, y1); st.forEach(([o, col]) => g.addColorStop(o, col)); return g }
function rg(x, y, r0, r1, st) { const g = c.createRadialGradient(x, y, r0, x, y, r1); st.forEach(([o, col]) => g.addColorStop(o, col)); return g }
function bands(x0, y0, x1, y1, list) { const st = []; let p = 0; list.forEach(([e, col]) => { st.push([p, col], [e, col]); p = e }); return lg(x0, y0, x1, y1, st) }
function disc(x, y, r, col) { if (r <= 0) return; c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill() }
function glow(x, y, r, rgb, a) { if (a <= .003 || r <= 0) return; c.fillStyle = rg(x, y, 0, r, [[0, `rgba(${rgb},${a})`], [.5, `rgba(${rgb},${a * .45})`], [1, `rgba(${rgb},0)`]]); c.beginPath(); c.arc(x, y, r, 0, 7); c.fill() }
function poly(pts, fill, stroke, lw) { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); if (fill) { c.fillStyle = fill; c.fill() } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 1; c.stroke() } }
function line(x0, y0, x1, y1, col, lw) { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke() }
function rr(x, y, w, h, r, col) { c.fillStyle = col; c.beginPath(); c.roundRect(x, y, w, h, r); c.fill() }
function pill(x, y, w, h, col) { rr(x - w / 2, y - h / 2, w, h, h / 2, col) }
const add = fn => { c.save(); c.globalCompositeOperation = 'lighter'; fn(); c.restore() };
const fmt = n => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

// ---------- paleta ----------
const P = { noite0: '#07090f', noite1: '#0c1220', noite2: '#16203a', aco: '#2a3a52', aco2: '#4b6a80', ambar: '#d9b35a', luz: '#f3e0a6', creme: '#fff6e0', ciano: '#85a4a1', verm: '#c8553a', verde: '#9aa86a', tinta: '#14161d', ouro: '#d9b35a', ouro2: '#f0d48a', ocre: '#b4874a', ardosia: '#4b6a80' };
const AMB = '217,179,90', CIA = '133,164,161', VER = '200,85,58';

// ---------- textos ----------
const COND = '"Fira Sans Extra Condensed", Arial, sans-serif';
function txt(str, x, y, size, col, o = {}) {
  c.save(); c.globalAlpha *= o.a ?? 1; c.font = `${o.w || 800} ${size}px ${COND}`; c.textAlign = o.align || 'left'; c.textBaseline = 'alphabetic'; if ('letterSpacing' in c) c.letterSpacing = (o.ls ?? size * .02) + 'px';
  if (o.sh !== 0) { c.shadowColor = 'rgba(4,6,12,.85)'; c.shadowBlur = size * .22; c.shadowOffsetY = size * .05 }
  c.fillStyle = col; c.fillText(str, x, y); c.restore();
}
const largura = (str, size, w = 800) => { c.save(); c.font = `${w} ${size}px ${COND}`; if ('letterSpacing' in c) c.letterSpacing = size * .02 + 'px'; const m = c.measureText(str).width; c.restore(); return m };
// placa no canto: escreve letra por letra, com traço âmbar crescendo embaixo e uma linha menor
function placa(tl, x, y, str, t0, t1, o = {}) {
  const { size = 74, col = P.creme, cps = 26, sub = null, subSize = 38, linha = P.ambar } = o;
  const al = Math.min(ramp(tl, t0 - .2, t0), 1 - ramp(tl, t1 - .3, t1)); if (al <= 0) return;
  c.save(); c.globalAlpha = al;
  const n = clamp(Math.floor((tl - t0) * cps), 0, str.length), w = largura(str, size), wn = largura(str.slice(0, n), size);
  c.save(); c.translate(x + w * .45, y - size * .3); c.scale(1.7, 1); glow(0, 0, 120 + w * .35, '4,6,12', .55); c.restore();
  txt(str.slice(0, n), x, y, size, col);
  if (n < str.length && (tl * 3 % 1) < .6) { c.fillStyle = linha; c.fillRect(x + wn + 6, y - size * .78, 6, size * .82) }
  c.fillStyle = linha; c.fillRect(x, y + 16, Math.max(wn, w * ramp(tl, t0, t0 + str.length / cps)), 5);
  if (sub) { const t2 = t0 + str.length / cps + .15, n2 = clamp(Math.floor((tl - t2) * cps * 1.6), 0, sub.length); txt(sub.slice(0, n2), x, y + 66, subSize, '#e6d3a0', { w: 600, ls: subSize * .12 }) }
  c.restore();
}
// texto grande no meio que entra subindo
function titulo(tl, str, x, y, size, col, t0 = 0, o = {}) {
  const u = eo(ramp(tl, t0, t0 + .35)), a = u * (o.fim != null ? 1 - ramp(tl, o.fim - .25, o.fim) : 1); if (a <= 0) return;
  txt(str, x, y + (1 - u) * 40, size, col, { align: o.align || 'center', a, w: o.w, ls: o.ls });
}
// carimbo FALSO / VERDADE: entra grande e bate
function carimbo(tl, t0, str, x, y, size, rgb = VER, ang = -.18) {
  const u = ramp(tl, t0, t0 + .22); if (u <= 0) return; const s = lerp(2.2, 1, eo(u)), a = Math.min(1, u * 2);
  c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s); c.globalAlpha = a;
  const w = largura(str, size) + 70, h = size * 1.2;
  c.strokeStyle = `rgb(${rgb})`; c.lineWidth = 12; c.beginPath(); c.roundRect(-w / 2, -h / 2, w, h, 18); c.stroke();
  c.lineWidth = 4; c.beginPath(); c.roundRect(-w / 2 + 16, -h / 2 + 16, w - 32, h - 32, 10); c.stroke();
  txt(str, 0, size * .36, size, `rgb(${rgb})`, { align: 'center', sh: 0, ls: size * .08 });
  c.restore();
  if (u < 1) { c.save(); c.globalAlpha = (1 - u) * .5; c.fillStyle = `rgb(${rgb})`; c.fillRect(0, 0, W, H); c.restore() }
}
// marca ✓ ou ✗ desenhada
function marca(x, y, s, ok, u = 1) {
  if (u <= 0) return; c.save(); c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = s * .2; c.strokeStyle = ok ? P.verde : P.verm; c.beginPath();
  if (ok) { const pts = [[x - s * .45, y], [x - s * .12, y + s * .35], [x + s * .5, y - s * .4]]; c.moveTo(...pts[0]); const k = u * 2; if (k < 1) c.lineTo(lerp(pts[0][0], pts[1][0], k), lerp(pts[0][1], pts[1][1], k)); else { c.lineTo(...pts[1]); c.lineTo(lerp(pts[1][0], pts[2][0], k - 1), lerp(pts[1][1], pts[2][1], k - 1)) } }
  else { const k = u * 2; c.moveTo(x - s * .4, y - s * .4); c.lineTo(lerp(x - s * .4, x + s * .4, Math.min(1, k)), lerp(y - s * .4, y + s * .4, Math.min(1, k))); if (k > 1) { c.moveTo(x + s * .4, y - s * .4); c.lineTo(lerp(x + s * .4, x - s * .4, k - 1), lerp(y - s * .4, y + s * .4, k - 1)) } }
  c.stroke(); c.restore();
}
// cartão de "pista": tarja inclinada com número
function pista(tl, n, str, ok = false) {
  const u = eo(ramp(tl, 0, .4)), a = 1 - ramp(tl, 2.4, 2.8); if (a <= 0) return;
  c.save(); c.globalAlpha = a; c.translate(W / 2 + (1 - u) * -W, 330); c.rotate(-.05);
  rr(-470, -90, 940, 180, 14, ok ? P.verde : P.ambar); rr(-470, -90, 180, 180, 14, P.tinta);
  txt(ok ? '✓' : String(n), -380, 40, 120, ok ? P.verde : P.ambar, { align: 'center', sh: 0 });
  txt(str, -260, 34, 82, P.tinta, { sh: 0, ls: 2 }); c.restore();
}

// ---------- legenda: palavra por palavra, no meio de baixo (fora da área dos botões do TikTok) ----------
function legenda(t) {
  const L = LEG.find(l => t >= l.t0 && t < l.t1); if (!L) return;
  const size = 66, maxW = 880; c.save(); c.font = `800 ${size}px ${COND}`; if ('letterSpacing' in c) c.letterSpacing = '1px';
  const sp = c.measureText(' ').width + 6, ws = L.w.map(([s]) => c.measureText(s).width);
  const lines = [[]]; let acc = 0; L.w.forEach((_, i) => { if (acc + ws[i] > maxW && lines[lines.length - 1].length) { lines.push([]); acc = 0 } lines[lines.length - 1].push(i); acc += ws[i] + sp });
  const fo = 1 - ramp(t, L.t1 - .12, L.t1), y0 = 1520 - (lines.length - 1) * 40;
  lines.forEach((ln, k) => {
    const lw = ln.reduce((a, i) => a + ws[i] + sp, -sp); let x = W / 2 - lw / 2; const y = y0 + k * 82;
    ln.forEach(i => { const [s, tw, hl] = L.w[i], u = ramp(t, tw - .04, tw + .1); if (u > 0) { c.globalAlpha = fo * u; const sc = 1 + (1 - eo(u)) * .25; c.save(); c.translate(x + ws[i] / 2, y); c.scale(sc, sc); txt(s, -ws[i] / 2, 0, size, hl ? '#f0b94a' : '#fffaf0', { ls: 1 }); c.restore() } x += ws[i] + sp });
  });
  c.restore();
}
// acabamento: vinheta, sombra atrás da legenda e grão de papel
const GRAIN = (() => { const g = document.createElement('canvas'); g.width = g.height = 512; const x = g.getContext('2d'), d = x.createImageData(512, 512), q = rng(123); for (let i = 0; i < d.data.length; i += 4) { const v = 90 + q() * 165 | 0; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255 } x.putImageData(d, 0, 0); return g })();
function finish(t) {
  c.fillStyle = lg(0, 1250, 0, 1620, [[0, 'rgba(4,6,12,0)'], [.45, 'rgba(4,6,12,.55)'], [1, 'rgba(4,6,12,0)']]); c.fillRect(0, 1250, W, 370);
  c.fillStyle = rg(W / 2, H / 2, 600, 1250, [[0, 'rgba(2,4,10,0)'], [1, 'rgba(2,4,10,.55)']]); c.fillRect(0, 0, W, H);
  c.save(); c.globalCompositeOperation = 'overlay'; c.globalAlpha = .15; const q = rng(Math.floor(t * 12) + 1), ox = q() * 512 | 0, oy = q() * 512 | 0; for (let x = -ox; x < W; x += 512)for (let y = -oy; y < H; y += 512)c.drawImage(GRAIN, x, y); c.restore();
}

// ---------- tomadas e transições ----------
const SHOTS = [];
function shot(t0, t1, fn, tr = 'corte') { SHOTS.push({ t0, t1, fn, tr }) }
const BUF = [0, 1].map(() => { const k = document.createElement('canvas'); k.width = W; k.height = H; return k.getContext('2d') });
function pinta(ctx, s, t) { const ant = c; c = ctx; c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none'; c.fillStyle = P.noite0; c.fillRect(0, 0, W, H); c.save(); s.fn(t - s.t0, t); c.restore(); c = ant }
// transições suaves: névoa de estrelas, escuro, luz dourada, cortina de borda macia, zoom lento, círculo macio, deslizar com fusão
const TD = { nevoa: 1.1, escuro: 1.0, flash: .9, cortina: 1.0, zoom: 1.0, iris: 1.1, desliza: .9, corte: 0 };
const MB = (() => { const k = document.createElement('canvas'); k.width = W; k.height = H; return k.getContext('2d') })();
function mascara(b, grad) { MB.globalCompositeOperation = 'source-over'; MB.clearRect(0, 0, W, H); MB.drawImage(b, 0, 0); MB.globalCompositeOperation = 'destination-in'; MB.fillStyle = grad; MB.fillRect(0, 0, W, H); MB.globalCompositeOperation = 'source-over'; c.drawImage(MB.canvas, 0, 0) }
function transicao(tipo, u, A, B, t) {
  const a = A.canvas, b = B.canvas, e = ease(u), pico = Math.sin(u * PI);
  if (tipo === 'nevoa') { c.drawImage(a, 0, 0); c.globalAlpha = e; c.drawImage(b, 0, 0); c.globalAlpha = 1; for (let k = 0; k < 5; k++) { const y = H * (.1 + k * .2); c.fillStyle = lg(0, y - 300, 0, y + 300, [[0, 'rgba(120,140,160,0)'], [.5, `rgba(120,140,160,${.35 * pico})`], [1, 'rgba(120,140,160,0)']]); c.fillRect(0, y - 300, W, 600) } }
  else if (tipo === 'escuro') { c.drawImage(u < .5 ? a : b, 0, 0); c.fillStyle = `rgba(4,5,8,${pico})`; c.fillRect(0, 0, W, H) }
  else if (tipo === 'flash') { c.drawImage(a, 0, 0); c.globalAlpha = e; c.drawImage(b, 0, 0); c.globalAlpha = 1; c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = rg(W / 2, H / 2, 0, 1300, [[0, `rgba(217,179,90,${.45 * pico})`], [1, `rgba(217,179,90,${.1 * pico})`]]); c.fillRect(0, 0, W, H); c.restore() }
  else if (tipo === 'cortina') { c.drawImage(a, 0, 0); const x = lerp(-500, W + 500, e), g = c.createLinearGradient(x - 420, 0, x + 80, 0); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)'); mascara(b, g) }
  else if (tipo === 'zoom') { c.save(); c.translate(W / 2, H / 2); const sa = 1 + e * .18; c.scale(sa, sa); c.drawImage(a, -W / 2, -H / 2); c.restore(); c.save(); c.globalAlpha = e; c.translate(W / 2, H / 2); const sb = 1.12 - e * .12; c.scale(sb, sb); c.drawImage(b, -W / 2, -H / 2); c.restore() }
  else if (tipo === 'iris') { c.drawImage(a, 0, 0); const r = e * 1500, g = c.createRadialGradient(W / 2, H / 2, Math.max(0, r - 420), W / 2, H / 2, r + 1); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)'); mascara(b, g) }
  else if (tipo === 'desliza') { c.drawImage(a, 0, -e * H * .25); c.globalAlpha = e; c.drawImage(b, 0, (1 - e) * H * .25); c.globalAlpha = 1 }
}
function render(t) {
  const i = Math.max(0, SHOTS.findIndex(s => t >= s.t0 && t < s.t1)), s = SHOTS[t >= DUR ? SHOTS.length - 1 : i], d = TD[s.tr] || 0;
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none';
  const k = SHOTS.indexOf(s);
  if (k > 0 && d && t - s.t0 < d) { pinta(BUF[0], SHOTS[k - 1], t); pinta(BUF[1], s, t); c.fillStyle = '#000'; c.fillRect(0, 0, W, H); transicao(s.tr, (t - s.t0) / d, BUF[0], BUF[1], t) }
  else { c.fillStyle = P.noite0; c.fillRect(0, 0, W, H); c.save(); s.fn(t - s.t0, t); c.restore() }
  finish(t); legenda(t);
  const fd = Math.max(1 - ramp(t, 0, .4), ramp(t, DUR - 1.0, DUR - .05)); if (fd > 0) { c.fillStyle = `rgba(0,0,0,${fd})`; c.fillRect(0, 0, W, H) }
}
function capitulo(tl, n, titulo) {
  const a = 1 - ramp(tl, 1.4, 1.9); if (a <= 0) return; const u = eo(ramp(tl, 0, .5));
  c.save(); c.globalAlpha = a; c.fillStyle = '#07090f'; c.fillRect(0, 0, W, H); add(() => glow(W / 2, 880, 700, AMB, .12));
  txt(`CAPÍTULO ${n}`, W / 2, 800, 48, P.ouro, { align: 'center', w: 600, ls: 16 }); c.fillStyle = P.ouro; c.fillRect(W / 2 - 240 * u, 830, 480 * u, 3);
  c.globalAlpha = a * u; let tam = 120; while (largura(titulo, tam) + titulo.length * 4 > W - 110 && tam > 50) tam -= 4; txt(titulo, W / 2, 990 + (1 - u) * 20, tam, P.creme, { align: 'center', ls: 4 }); c.restore();
}
