// ================= Motor de desenho vertical (1080x1920, TikTok / WhatsApp) — modelo Recorte Dourado =================
// Paleta "Bronze e Vinho": vinho-escuro, terracota, bronze polido, azul do Egeu, oliva e mármore; capa carmim.
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
const P = { noite0: '#120809', noite1: '#24100f', noite2: '#3a1a16', aco: '#1e5a63', aco2: '#2f7a80', ambar: '#e9b860', luz: '#f6dc9a', creme: '#efe6d4', ciano: '#5fb8b8', verm: '#c42a22', verde: '#7a8a3e', tinta: '#140a0a', bronze: '#b98a3e', bronze2: '#e9c27a', bronze0: '#6e4a1e', terra: '#b5532c', oliva: '#5d6b3a', carmim: '#a3191b', carmim0: '#6a0f12', pele: '#c98e62', pele0: '#9a6440', marmore: '#efe6d4' };
const AMB = '233,184,96', CIA = '95,184,184', VER = '196,42,34';

// ---------- textos ----------
const COND = '"Fira Sans Extra Condensed", Arial, sans-serif', ROM = '"Cinzel", Georgia, serif';
// letras romanas (títulos)
function rom(str, x, y, size, col, o = {}) { c.save(); c.globalAlpha *= o.a ?? 1; c.font = `${o.w || 900} ${size}px ${ROM}`; c.textAlign = o.align || 'center'; if ('letterSpacing' in c) c.letterSpacing = (o.ls ?? size * .06) + 'px'; if (o.sh !== 0) { c.shadowColor = 'rgba(10,4,4,.9)'; c.shadowBlur = size * .25; c.shadowOffsetY = size * .05 } c.fillStyle = col; c.fillText(str, x, y); c.restore() }
// faixa grega (meandro)
function meandro(x, y, w, h, col, a = 1) { c.save(); c.globalAlpha *= a; c.strokeStyle = col; c.lineWidth = h * .14; c.lineJoin = 'miter'; const u = h; c.beginPath(); for (let px = x; px + u <= x + w; px += u) { c.moveTo(px, y + u * .9); c.lineTo(px, y + u * .1); c.lineTo(px + u * .8, y + u * .1); c.lineTo(px + u * .8, y + u * .7); c.lineTo(px + u * .3, y + u * .7); c.lineTo(px + u * .3, y + u * .4); c.lineTo(px + u * .55, y + u * .4) } c.stroke(); line(x, y - h * .1, x + w, y - h * .1, col, h * .1); line(x, y + h * 1.1, x + w, y + h * 1.1, col, h * .1); c.restore() }
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
  { const lw = Math.max(wn, w * ramp(tl, t0, t0 + str.length / cps)); c.save(); c.beginPath(); c.rect(x - 4, y + 8, lw + 8, 40); c.clip(); meandro(x, y + 14, Math.max(w, 300), 24, linha); c.restore() }
  if (sub) { const t2 = t0 + str.length / cps + .15, n2 = clamp(Math.floor((tl - t2) * cps * 1.6), 0, sub.length); txt(sub.slice(0, n2), x, y + 92, subSize, '#e6d6bc', { w: 600, ls: subSize * .12 }) }
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
  const fo = 1 - ramp(t, L.t1 - .12, L.t1), y0 = 1420 - (lines.length - 1) * 40;
  lines.forEach((ln, k) => {
    const lw = ln.reduce((a, i) => a + ws[i] + sp, -sp); let x = W / 2 - lw / 2; const y = y0 + k * 82;
    ln.forEach(i => { const [s, tw, hl] = L.w[i], u = ramp(t, tw - .04, tw + .1); if (u > 0) { c.globalAlpha = fo * u; const sc = 1 + (1 - eo(u)) * .25; c.save(); c.translate(x + ws[i] / 2, y); c.scale(sc, sc); txt(s, -ws[i] / 2, 0, size, hl ? P.bronze2 : '#fbf6ec', { ls: 1 }); c.restore() } x += ws[i] + sp });
  });
  c.restore();
}
// acabamento: vinheta, sombra atrás da legenda e grão de papel
const GRAIN = (() => { const g = document.createElement('canvas'); g.width = g.height = 512; const x = g.getContext('2d'), d = x.createImageData(512, 512), q = rng(123); for (let i = 0; i < d.data.length; i += 4) { const v = 90 + q() * 165 | 0; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255 } x.putImageData(d, 0, 0); return g })();
function finish(t) {
  c.fillStyle = lg(0, 1250, 0, 1620, [[0, 'rgba(12,5,4,0)'], [.45, 'rgba(12,5,4,.6)'], [1, 'rgba(12,5,4,0)']]); c.fillRect(0, 1250, W, 370);
  c.fillStyle = rg(W / 2, H / 2, 600, 1250, [[0, 'rgba(14,4,2,0)'], [1, 'rgba(14,4,2,.6)']]); c.fillRect(0, 0, W, H);
  c.save(); c.globalCompositeOperation = 'overlay'; c.globalAlpha = .15; const q = rng(Math.floor(t * 12) + 1), ox = q() * 512 | 0, oy = q() * 512 | 0; for (let x = -ox; x < W; x += 512)for (let y = -oy; y < H; y += 512)c.drawImage(GRAIN, x, y); c.restore();
}

// ---------- tomadas e transições ----------
const SHOTS = [];
function shot(t0, t1, fn, tr = 'corte') { SHOTS.push({ t0, t1, fn, tr }) }
const BUF = [0, 1].map(() => { const k = document.createElement('canvas'); k.width = W; k.height = H; return k.getContext('2d') });
function pinta(ctx, s, t) { const ant = c; c = ctx; c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none'; c.fillStyle = P.noite0; c.fillRect(0, 0, W, H); c.save(); s.fn(t - s.t0, t); c.restore(); c = ant }
const TD = { flash: .5, cortina: .6, zoom: .55, iris: .6, desliza: .55, escuro: .8, poeira: .8, corte: 0 };
function transicao(tipo, u, A, B, t) {
  const a = A.canvas, b = B.canvas, e = ease(u);
  if (tipo === 'flash') { c.drawImage(u < .5 ? a : b, 0, 0); c.fillStyle = `rgba(255,246,220,${1 - Math.abs(u - .5) * 2})`; c.fillRect(0, 0, W, H) }
  else if (tipo === 'cortina') { c.drawImage(a, 0, 0); const x = lerp(-500, W + 500, e), sk = 380; c.save(); c.beginPath(); c.moveTo(-600, 0); c.lineTo(x + sk, 0); c.lineTo(x - sk, H); c.lineTo(-600, H); c.clip(); c.drawImage(b, 0, 0); c.restore(); c.save(); c.translate(x, H / 2); c.transform(1, 0, -sk * 2 / H, 1, 0, 0); c.fillStyle = P.bronze2; c.fillRect(-14, -H, 28, 2 * H); c.fillStyle = P.bronze0; c.fillRect(14, -H, 10, 2 * H); c.restore() }
  else if (tipo === 'zoom') { c.save(); c.globalAlpha = 1; const sb = lerp(.75, 1, e); c.translate(W / 2, H / 2); c.scale(sb, sb); c.drawImage(b, -W / 2, -H / 2); c.restore(); c.save(); c.globalAlpha = 1 - e; const sa = 1 + e * 1.6; c.translate(W / 2, H / 2); c.scale(sa, sa); c.drawImage(a, -W / 2, -H / 2); c.restore() }
  else if (tipo === 'iris') { c.drawImage(a, 0, 0); const r = e * 1250; c.save(); c.beginPath(); c.arc(W / 2, H / 2, r, 0, 7); c.clip(); c.drawImage(b, 0, 0); c.restore(); c.strokeStyle = P.bronze2; c.lineWidth = 16; c.beginPath(); c.arc(W / 2, H / 2, r, 0, 7); c.stroke() }
  else if (tipo === 'escuro') { c.drawImage(u < .5 ? a : b, 0, 0); c.fillStyle = `rgba(8,3,3,${1 - Math.abs(u - .5) * 2})`; c.fillRect(0, 0, W, H) }
  else if (tipo === 'poeira') { c.drawImage(a, 0, 0); const q = rng(3); c.save(); c.beginPath(); for (let i = 0; i < 90; i++) { const x = q() * W, y = q() * H, r0 = (40 + q() * 160) * clamp(e * 2.2 - q() * 1.2) * 1.6; if (r0 > 0) { c.moveTo(x + r0, y); c.arc(x, y, r0, 0, 7) } } c.clip(); c.drawImage(b, 0, 0); c.restore(); if (e > .85) { c.globalAlpha = (e - .85) / .15; c.drawImage(b, 0, 0); c.globalAlpha = 1 } }
  else if (tipo === 'desliza') { c.drawImage(a, 0, -e * H); c.drawImage(b, 0, H - e * H); c.fillStyle = P.bronze2; c.fillRect(0, H - e * H - 6, W, 12) }
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
// cartão de capítulo (no intervalo entre falas): número romano, meandro e título
function capitulo(tl, n, titulo) {
  const a = 1 - ramp(tl, 1.25, 1.7); if (a <= 0) return; const u = eo(ramp(tl, 0, .5));
  c.save(); c.globalAlpha = a; c.fillStyle = P.noite0; c.fillRect(0, 0, W, H); glow(W / 2, 860, 700, '185,138,62', .18);
  rom(`CAPÍTULO ${n}`, W / 2, 760, 52, P.bronze2, { w: 700, ls: 14 }); c.save(); c.beginPath(); c.rect(W / 2 - 330 * u, 790, 660 * u, 60); c.clip(); meandro(W / 2 - 330, 800, 660, 30, P.bronze); c.restore();
  c.globalAlpha = a * u; rom(titulo, W / 2, 990 + (1 - u) * 20, 120, P.creme); c.restore();
}
