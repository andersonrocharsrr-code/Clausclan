// ================= Motor de desenho (canvas 2D, 1920x1080) — Starship voo 15 =================
// Estilo: ilustração plana tipo recorte de papel — planos de luz e sombra com borda reta, paleta quente
// (ocre, creme, dourado, azul-ardósia), grão de papel e legenda palavra por palavra no rodapé.
const W = 1920, H = 1080;
const cv = document.getElementById('c'), c = cv.getContext('2d');
const lerp = (a, b, u) => a + (b - a) * u, clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (t, a, b) => clamp((t - a) / (b - a)), ease = u => u * u * (3 - 2 * u), eo = u => 1 - Math.pow(1 - u, 3);
const sin = Math.sin, cos = Math.cos, PI = Math.PI;
function rng(s) { return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 } }
function lg(x0, y0, x1, y1, st) { const g = c.createLinearGradient(x0, y0, x1, y1); st.forEach(([o, col]) => g.addColorStop(o, col)); return g }
function rg(x, y, r0, r1, st) { const g = c.createRadialGradient(x, y, r0, x, y, r1); st.forEach(([o, col]) => g.addColorStop(o, col)); return g }
// faixas de cor com borda reta: [[fim da faixa (0..1), cor], ...]
function bands(x0, y0, x1, y1, list) { const st = []; let p = 0; list.forEach(([e, col]) => { st.push([p, col], [e, col]); p = e }); return lg(x0, y0, x1, y1, st) }
function disc(x, y, r, col) { if (r <= 0) return; c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill() }
function puff(x, y, r, rgb, a) { if (a > .003) disc(x, y, r, `rgba(${rgb},${a})`) }                       // disco plano
function glow(x, y, r, rgb, a) { if (a <= .003 || r <= 0) return; c.fillStyle = rg(x, y, 0, r, [[0, `rgba(${rgb},${a})`], [.55, `rgba(${rgb},${a * .5})`], [1, `rgba(${rgb},0)`]]); c.beginPath(); c.arc(x, y, r, 0, 7); c.fill() } // brilho suave
function poly(pts, fill, stroke, lw) { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); if (fill) { c.fillStyle = fill; c.fill() } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 1; c.stroke() } }
function line(x0, y0, x1, y1, col, lw) { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke() }
function pill(x, y, w, h, col) { c.fillStyle = col; c.beginPath(); c.roundRect(x - w / 2, y - h / 2, w, h, h / 2); c.fill() }
const add = fn => { c.save(); c.globalCompositeOperation = 'lighter'; fn(); c.restore() };
const fmt = n => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const shade = (rgb, k) => rgb.split(',').map(v => Math.round(v * k)).join(',');

// ---------- câmera do "mundo" (metros, y para cima, chão em y=0) ----------
let CAM = { x: 0, y: 0, z: 1 };
function world(cam, fn) { CAM = cam; c.save(); c.translate(W / 2, H / 2); c.scale(cam.z, -cam.z); c.translate(-cam.x, -cam.y); fn(); c.restore() }
const M = (x, y) => [W / 2 + (x - CAM.x) * CAM.z, H / 2 - (y - CAM.y) * CAM.z];
function at(x, y, ang, fn, flip) { c.save(); c.translate(x, y); c.rotate(ang); if (flip) c.scale(-1, 1); fn(); c.restore() }

// ---------- céus (paleta quente) ----------
const SKY_GOLD = [[0, '#5d7a80'], [.4, '#a3ad94'], [.75, '#e0c98c'], [1, '#f3e0a6']];
const SKY_DAY = [[0, '#4d7380'], [.5, '#85a4a1'], [.85, '#cdcea8'], [1, '#e6dcb4']];
const SKY_SET = [[0, '#20263f'], [.4, '#63465c'], [.72, '#d57f4e'], [1, '#f3c46e']];
const SKY_HIGH = [[0, '#0a0d1a'], [.5, '#1b2942'], [.85, '#4b6a80'], [1, '#a9bcae']];
const INK = '#14161d';
function sky(st, hy) { c.fillStyle = lg(0, 0, 0, Math.max(hy, 10), st); c.fillRect(0, 0, W, H); const q = rng(3); for (let i = 0; i < 9; i++)pill(q() * W, 40 + q() * Math.max(60, hy - 120), 500 + q() * 900, 5 + q() * 12, `rgba(255,250,225,${.07 + q() * .08})`) }
function sunGlow(x, y, r, rgb, a = 1) { puff(x, y, r * .62, rgb, .1 * a); puff(x, y, r * .42, rgb, .14 * a); puff(x, y, r * .27, '255,244,214', .3 * a); disc(x, y, r * .15, `rgba(255,248,226,${a})`) }
const STARS = (() => { const q = rng(77), a = []; for (let i = 0; i < 300; i++)a.push([q() * W, q() * H, .6 + q() * 1.6, .3 + q() * .7]); return a })();
function stars(a = 1, t = 0) { STARS.forEach(([x, y, r, b], i) => { const al = b * a * (.75 + .25 * sin(t * 2 + i)); c.fillStyle = `rgba(255,240,205,${al.toFixed(3)})`; if (i % 23 === 0) { poly([[x, y - r * 5], [x + r, y], [x, y + r * 5], [x - r, y]], c.fillStyle); poly([[x - r * 5, y], [x, y - r], [x + r * 5, y], [x, y + r]], c.fillStyle) } else { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill() } }) }
// nuvens planas: pilhas de "pílulas"
function cloudsBand(seed, n, y0, y1, r0, r1, rgb, a, dx = 0) {
  const q = rng(seed);
  for (let i = 0; i < n; i++) { const x = ((q() * (W + 900) + dx) % (W + 900) + W + 900) % (W + 900) - 450, y = lerp(y0, y1, q()), r = lerp(r0, r1, q()), al = Math.min(1, a * 1.5 * (.6 + q() * .4)); pill(x, y, r * 4.6, r * .5, `rgba(${rgb},${al})`); pill(x - r * .7, y - r * .34, r * 2.6, r * .46, `rgba(${rgb},${al})`); pill(x + r * .9, y + r * .32, r * 3, r * .4, `rgba(${shade(rgb, .88)},${al})`) }
}
// Terra vista de cima: disco plano, faixa de atmosfera e nuvens recortadas
function earthLimb(top, R, t, o = {}) {
  const cx = o.cx ?? W / 2, cy = top + R;
  disc(cx, cy, R + 26, 'rgba(120,170,190,.22)'); disc(cx, cy, R + 11, 'rgba(170,205,205,.5)');
  c.save(); c.beginPath(); c.arc(cx, cy, R, 0, 7); c.clip();
  c.fillStyle = '#1d4a66'; c.fillRect(0, top - 10, W, H);
  disc(cx, cy, R - 46, '#173e5a'); disc(cx, cy, R - 150, '#12334e'); disc(cx, cy, R - 330, '#0e2a43');
  const q = rng(o.seed || 5);
  for (let i = 0; i < 70; i++) { const a = -PI / 2 + (q() - .5) * .9 + t * 0.004 * (o.spin ?? 1), d = R - 16 - q() * 420, x = cx + cos(a) * d, y = cy + sin(a) * d, r = 20 + q() * 60, al = .25 + q() * .5; c.save(); c.translate(x, y); c.rotate(a + PI / 2); pill(0, 0, r * 6, r * .55, `rgba(240,232,205,${al})`); pill(r * 1.2, -r * .4, r * 3.4, r * .45, `rgba(240,232,205,${al})`); c.restore() }
  c.restore();
}

// ---------- aço e escudo térmico: 5 planos de luz, da esquerda para a direita ----------
const STEEL = {
  dia: ['#58616a', '#a7aeae', '#f1f0e2', '#c8cbc2', '#7c858a'],
  ouro: ['#5f5747', '#b4a57e', '#fbeecb', '#dbc999', '#857a5f'],
  espaco: ['#10141c', '#3c4652', '#a9b3ba', '#f5f3e6', '#8b96a0'],
  por: ['#15121a', '#33262f', '#c9774a', '#6b4648', '#1a141a'],
};
function steel(pal, w = 4.5) { const s = STEEL[pal]; return bands(-w, 0, w, 0, [[.13, s[0]], [.33, s[1]], [.56, s[2]], [.83, s[3]], [1, s[4]]]) }
function rings(y0, y1, w, step = 3.7) { c.fillStyle = 'rgba(20,22,29,.13)'; for (let y = y0; y < y1; y += step)c.fillRect(-w, y, 2 * w, .12) }
function frost(y0, y1, a) { if (a <= 0) return; c.fillStyle = `rgba(250,250,240,${.5 * a})`; c.fillRect(-4.5, y0, 9, y1 - y0); c.fillStyle = `rgba(250,250,240,${.35 * a})`; c.fillRect(-4.5, y0 + 1, 9, .6); c.fillRect(-4.5, y1 - 1.6, 9, .6) }
function nozzles(n, w, len, rw, lit) { for (let i = 0; i < n; i++) { const x = (i - (n - 1) / 2) * (2 * w / n); poly([[x - rw * .55, 0], [x + rw * .55, 0], [x + rw, -len], [x - rw, -len]], lit ? '#7a4a2c' : '#1b1d22'); c.fillStyle = lit ? '#f6c25a' : '#3a3d44'; c.fillRect(x - rw, -len, 2 * rw, .14) } }

// Propulsor Super Heavy: 72 m (base em y=0)
function booster(o = {}) {
  const pal = o.pal || 'dia', s = STEEL[pal];
  nozzles(9, 4.1, 1.5, .42, o.lit);
  c.fillStyle = steel(pal); c.fillRect(-4.5, 0, 9, 70);
  rings(3.7, 70, 4.5);
  c.fillStyle = 'rgba(20,22,29,.3)'; c.fillRect(-4.5, 0, 9, 2.6);
  c.fillStyle = 'rgba(20,22,29,.2)'; c.fillRect(1.9, 3, .5, 62);
  for (const sx of [-1, 1]) poly([[sx * 4.5, 1], [sx * 5.3, 1.6], [sx * 5.3, 19], [sx * 4.5, 21]], sx < 0 ? s[0] : s[4]);
  frost(4, 31, o.frost || 0); frost(34, 65, (o.frost || 0) * .9);
  for (const sx of [-1, 1]) { c.save(); c.scale(sx, 1); c.fillStyle = sx < 0 ? '#2b2e35' : '#4a4e56'; c.fillRect(4.5, 62.2, 4.4, 3.6); c.strokeStyle = 'rgba(240,230,200,.28)'; c.lineWidth = .1; for (let i = 1; i < 6; i++) { c.beginPath(); c.moveTo(4.5 + i * .73, 62.2); c.lineTo(4.5 + i * .73, 65.8); c.stroke() } for (let j = 1; j < 4; j++) { c.beginPath(); c.moveTo(4.5, 62.2 + j * .9); c.lineTo(8.9, 62.2 + j * .9); c.stroke() } c.restore() }
  c.fillStyle = INK; c.fillRect(-4.5, 70, 9, 2); c.fillStyle = s[1]; for (let i = 0; i < 12; i++)c.fillRect(-4.4 + i * .75, 70.3, .3, 1.4);
}
const SHIP_PATH = () => { c.beginPath(); c.moveTo(-4.5, 0); c.lineTo(-4.5, 37); c.bezierCurveTo(-4.5, 44.5, -2.4, 50, 0, 52); c.bezierCurveTo(2.4, 50, 4.5, 44.5, 4.5, 37); c.lineTo(4.5, 0); c.closePath() };
// Nave Starship: 52 m (base em y=0). view 'frente' (aletas dos lados) ou 'lado' (barriga preta à esquerda)
function ship(o = {}) {
  const pal = o.pal || 'dia', side = o.view === 'lado', fa = o.flap || 0, s = STEEL[pal];
  nozzles(side ? 3 : 4, 3.4, 1.7, .85, o.lit);
  const blackFlap = '#17191f', steelFlap = s[4];
  if (!side) {
    poly([[-4.4, 1], [-8.6, 1.4], [-8.6, 8.5], [-4.4, 14]], blackFlap); poly([[4.4, 1], [8.6, 1.4], [8.6, 8.5], [4.4, 14]], steelFlap);
    poly([[-4.3, 32], [-7.5, 32.4], [-7.3, 37], [-3.7, 42.5]], blackFlap); poly([[4.3, 32], [7.5, 32.4], [7.3, 37], [3.7, 42.5]], steelFlap);
  }
  SHIP_PATH(); c.fillStyle = steel(pal); c.fill();
  c.save(); SHIP_PATH(); c.clip();
  rings(3.7, 37, 4.5);
  const bx = side ? -1.4 : -.4, hw = bx + 4.5; // escudo térmico: dois planos de preto
  c.fillStyle = '#0d0e13'; c.fillRect(-4.5, 0, hw, 53); c.fillStyle = '#24272f'; c.fillRect(-4.5 + hw * .42, 0, hw * .4, 53);
  c.fillStyle = 'rgba(20,22,29,.3)'; c.fillRect(-4.5, 0, 9, 1.6);
  frost(5, 16, (o.frost || 0) * .9); frost(18, 33, (o.frost || 0) * .8);
  if (o.heat) { c.fillStyle = `rgba(232,116,58,${.9 * o.heat})`; c.fillRect(-4.5, 0, hw * .42, 53); c.fillStyle = `rgba(160,60,40,${.6 * o.heat})`; c.fillRect(-4.5 + hw * .42, 0, hw * .4, 53) }
  c.restore();
  if (side) {
    const fl = (pts, hx, hy) => { c.save(); c.translate(hx, hy); c.transform(1 - Math.abs(fa) * .35, 0, 0, 1, 0, 0); c.translate(-hx, -hy); poly(pts, '#1e2128', '#0b0c10', .14); c.fillStyle = '#343842'; c.beginPath(); c.moveTo(pts[1][0], pts[1][1]); c.lineTo(pts[2][0], pts[2][1]); c.lineTo(pts[2][0] - 1.4, pts[2][1] + .8); c.lineTo(pts[1][0] - 1.4, pts[1][1]); c.closePath(); c.fill(); c.restore() };
    fl([[-2.9, 1.2], [3, 1.2], [3, 8.5], [-2.9, 13.5]], -2.9, 7); fl([[-2.6, 32.2], [2.3, 32.2], [1.9, 37.5], [-2.4, 41.5]], -2.6, 36);
  }
  if (o.slot) { c.fillStyle = '#0a0b0d'; c.fillRect(3.2, 29.2, 1.25, 2.1); c.fillStyle = '#d9b35a'; c.fillRect(3.2, 29.2, .12, 2.1) }
}
// chama: três planos com borda reta e ondulada (para baixo a partir de y=0), em metros
function plume(len, w, t, seed = 0, o = {}) {
  const f = 1 + .06 * sin(t * 43 + seed) + .04 * sin(t * 71 + seed * 2), a = o.a ?? 1;
  const sh = (wd, l, col, ph) => { c.fillStyle = col; c.beginPath(); c.moveTo(-wd * .5, 0); const N = 18; for (let i = 1; i <= N; i++) { const u = i / N; c.lineTo(-wd * (.5 + .55 * sin(u * PI * .9)) * (1 - u * u) - wd * .07 * sin(u * 16 - t * 34 + ph) * u, -l * u) } for (let i = N - 1; i >= 0; i--) { const u = i / N; c.lineTo(wd * (.5 + .55 * sin(u * PI * .9)) * (1 - u * u) + wd * .07 * sin(u * 14 - t * 30 + ph + 2) * u, -l * u) } c.closePath(); c.fill() };
  add(() => glow(0, -w * .4, w * 3.2, o.vac ? '150,180,230' : '255,190,110', .4 * a));
  c.save(); c.globalAlpha = a;
  if (o.vac) { c.globalAlpha = .5 * a; sh(w * 1.7, len * f, '#7f9fc4', seed); c.globalAlpha = .75 * a; sh(w * 1.1, len * f * .7, '#b9cfe0', seed + 1); c.globalAlpha = a; sh(w * .55, len * f * .42, '#fff6dc', seed + 2) }
  else { sh(w * 1.25, len * f, '#d9662e', seed); sh(w * .95, len * f * .76, '#f09a3e', seed + 1); sh(w * .68, len * f * .54, '#f8cf6a', seed + 2); sh(w * .4, len * f * .33, '#fff6dc', seed + 3) }
  c.restore();
}

// ---------- Starbase: chão, mar, torre, mesa de lançamento ----------
const MESA = 20; // altura da mesa de lançamento (m)
const GND = { ouro: ['#8fa9a3', '#b3a258', '#9a8c47', '#7f7539'], dia: ['#7fa3a8', '#b7aa5c', '#9d9249', '#827a3b'], por: ['#b8684a', '#2b2029', '#211922', '#17121a'] };
function ground(pal = 'ouro') {
  const g = GND[pal];
  c.fillStyle = g[0]; c.fillRect(-4000, 0, 8000, 3.4); c.fillStyle = 'rgba(255,250,225,.35)'; c.fillRect(-4000, 3.0, 8000, .4);
  c.fillStyle = g[1]; c.fillRect(-4000, -900, 8000, 900);
  const q = rng(9);
  for (let k = 0; k < 3; k++) { c.fillStyle = g[1 + k]; c.beginPath(); c.moveTo(-4000, -900); c.lineTo(-4000, -6 - k * 22); for (let x = -4000; x <= 4000; x += 80)c.lineTo(x, -6 - k * 22 + sin(x * .011 + k * 2) * 3.5 + sin(x * .027 + k) * 1.6); c.lineTo(4000, -900); c.closePath(); c.fill() }
  for (let i = 0; i < 90; i++) { const x = -900 + q() * 1800, y = -q() * 60 - 1; c.fillStyle = `rgba(20,22,29,${.06 + q() * .08})`; c.fillRect(x, y, 10 + q() * 30, .5) }
}
function farBuildings(pal = 'ouro') {
  const dk = pal === 'por', tk = dk ? ['#17121a', '#5e3a38', '#1c151c'] : ['#8e918a', '#f2ecd6', '#b9b6a2'];
  for (let i = 0; i < 7; i++) { const x = -150 + i * 9.5, h = 24 + (i % 3) * 5; c.save(); c.translate(x, 0); c.fillStyle = bands(-3.6, 0, 3.6, 0, [[.25, tk[0]], [.6, tk[1]], [1, tk[2]]]); c.fillRect(-3.6, 0, 7.2, h); c.beginPath(); c.ellipse(0, h, 3.6, 1.6, 0, 0, PI); c.fill(); c.restore() }
  c.fillStyle = dk ? '#18131a' : '#6d6a5a'; c.fillRect(110, 0, 60, 9); c.fillRect(180, 0, 26, 16); c.fillStyle = dk ? '#120e14' : '#8a856c'; c.fillRect(110, 9, 60, 1.2); c.fillRect(-230, 0, 50, 7);
  c.save(); c.translate(300, 0); c.scale(.62, .62); c.globalAlpha = .5; towerBody(pal); c.globalAlpha = 1; c.restore();
}
function towerBody(pal) {
  c.fillStyle = bands(-22, 0, -12, 0, pal === 'por' ? [[.6, '#0d0a0e'], [1, '#3a2428']] : [[.3, '#191b21'], [.72, '#2b2e36'], [1, '#474b54']]); c.fillRect(-22, 0, 10, 152);
  c.strokeStyle = pal === 'por' ? 'rgba(240,150,90,.22)' : 'rgba(240,230,200,.2)'; c.lineWidth = .28;
  for (let y = 0; y < 152; y += 9.5) { c.beginPath(); c.moveTo(-22, y); c.lineTo(-12, y + 9.5); c.moveTo(-12, y); c.lineTo(-22, y + 9.5); c.moveTo(-22, y); c.lineTo(-12, y); c.stroke() }
  c.fillStyle = INK; c.fillRect(-23, 152, 12, 3); c.fillRect(-17.3, 155, .7, 14);
}
function arm(armY, len, front, pal) {
  const x1 = -12 + 29 * len, col = pal === 'por' ? (front ? '#150f13' : '#2c1c20') : (front ? '#1d2027' : '#4a4e57');
  c.fillStyle = col; c.fillRect(-12.5, armY - 2.6, x1 + 12.5, 2.6); c.fillRect(-12.5, armY - 8, 3.2, 12);
  c.strokeStyle = pal === 'por' ? 'rgba(240,160,100,.3)' : 'rgba(240,230,200,.28)'; c.lineWidth = .2;
  for (let x = -9; x < x1 - 2; x += 2.6) { c.beginPath(); c.moveTo(x, armY - 2.6); c.lineTo(x + 1.3, armY); c.lineTo(x + 2.6, armY - 2.6); c.stroke() }
  c.fillStyle = front ? '#d9b35a' : '#8f7a44'; c.fillRect(-9, armY - .35, x1 + 8, .35);
}
function tower(o = {}) { // phase 'tras' (torre + braço de trás) ou 'frente' (braço da frente)
  const y = o.armY ?? 100, len = o.len ?? 1, pal = o.pal || 'ouro';
  if (o.phase !== 'frente') { towerBody(pal); c.save(); c.translate(0, 1.4); arm(y, len * .96, false, pal); c.restore(); if (o.qd) { c.fillStyle = '#2a2d33'; c.fillRect(-12, MESA + 76, 7.6, 2.2) } }
  else arm(y, len, true, pal);
}
function mesa(pal = 'ouro') {
  const d = pal === 'por' ? '#120d11' : '#23262d', l = pal === 'por' ? '#2a1c20' : '#4d515a';
  for (const x of [-9, -3.2, 2, 7.2]) { c.fillStyle = bands(x, 0, x + 1.8, 0, [[.55, d], [1, l]]); c.fillRect(x, 0, 1.8, 15) }
  c.fillStyle = l; c.fillRect(-10.5, 14, 21, 6); c.fillStyle = d; c.fillRect(-10.5, 14, 21, 2.6); c.fillRect(-16, 0, 32, 1.6);
}
// vapor saindo (respiro dos tanques): bolinhas planas
function vent(x, y, t, seed, dir = 1, s = 1) { const q = rng(seed); for (let i = 0; i < 7; i++) { const ph = (t * .4 + q()) % 1; puff(x + dir * ph * 15 * s + sin(t + i) * .8, y + ph * 3 * s - ph * ph * 5 * s, (.8 + ph * 2.6) * s * (1 - ph * .6), '252,248,232', .85 * (1 - ph)) } }
// fumaça plana em dois tons, que rola pelo chão e some encolhendo
function smokeRoll(t, t0, n, seed, rgb, o = {}) {
  const q = rng(seed), life = o.life ?? 9, P = [];
  for (let i = 0; i < n; i++) { const b = t0 + q() * (o.span ?? 2.5), dir = q() < .5 ? -1 : 1, v = 16 + q() * 30, up = q(), k = q(), age = t - b; if (age <= 0 || age > life) continue; const u = age / life; P.push([(o.x || 0) + dir * (5 + v * age * (1 - .06 * Math.min(age, 6))), 2 + up * 7 + age * (1.5 + up * 6), (5 + age * (5 + k * 4)) * Math.min(1, age * 3) * (1 - u * u * u), up]) }
  P.sort((a, b) => b[3] - a[3]);
  P.forEach(([x, y, r]) => disc(x + r * .12, y - r * .16, r, `rgb(${shade(rgb, .8)})`)); P.forEach(([x, y, r]) => disc(x - r * .08, y + r * .1, r * .86, `rgb(${rgb})`));
}
// capim em primeiro plano (tela), balançando — e a faixa escura do rodapé
function grass(t, seed, n, top, cols) {
  const q = rng(seed); c.lineCap = 'round';
  for (let i = 0; i < n; i++) { const x = q() * (W + 80) - 40, h = (H - top) * (.35 + q() * .65), sw = sin(t * 1.3 + x * .01 + q() * 3) * 16 + 22, col = cols[Math.floor(q() * cols.length)]; c.strokeStyle = col; c.lineWidth = 2 + q() * 2.4; c.beginPath(); c.moveTo(x, H + 6); c.quadraticCurveTo(x + sw * .2, H - h * .6, x + sw, H - h); c.stroke() }
}
// pessoas de costas, olhando o foguete: formas planas, braços para baixo
function person(x, y, h, o = {}) {
  const s = h / 100, { coat = '#8c4a3a', dark = '#5e2e26', legs = '#22242b', hair = '#2a2018', skin = '#c99a74', hat = null } = o;
  c.save(); c.translate(x, y); c.scale(s, s);
  poly([[-9, -44], [-1, -44], [-2, 0], [-9, 0]], legs); poly([[1, -44], [9, -44], [9, 0], [2, 0]], legs);
  poly([[-15, -47], [-11, -78], [-15, -80], [-20, -50]], dark); poly([[15, -47], [11, -78], [15, -80], [20, -50]], dark); // braços para baixo
  disc(-17.5, -46, 3.3, skin); disc(17.5, -46, 3.3, skin);
  poly([[-11, -40], [-12, -80], [-5, -84], [5, -84], [12, -80], [11, -40]], coat); poly([[2, -40], [3, -84], [5, -84], [12, -80], [11, -40]], dark);
  c.fillStyle = skin; c.fillRect(-3, -88, 6, 5); disc(0, -93, 7.4, hair); if (hat) { c.fillStyle = hat; c.fillRect(-9, -97, 18, 3); c.beginPath(); c.arc(0, -97, 7, PI, 0); c.fill() }
  c.restore();
}

// ---------- textos ----------
const COND = '"Fira Sans Extra Condensed", "Liberation Sans Narrow", Arial, sans-serif', MONO = COND, SANS = COND;
function txt(str, x, y, size, col, o = {}) { c.save(); c.globalAlpha *= o.a ?? 1; c.font = `${o.w || 800} ${size}px ${COND}`; c.textAlign = o.align || 'left'; if ('letterSpacing' in c) c.letterSpacing = (o.ls ?? size * .02) + 'px'; if (o.sh !== 0) { c.shadowColor = 'rgba(8,9,13,.85)'; c.shadowBlur = size * .22; c.shadowOffsetY = size * .04; c.fillStyle = col; c.fillText(str, x, y); c.shadowBlur = size * .5; c.shadowOffsetY = 0; c.shadowColor = 'rgba(8,9,13,.55)'; c.fillText(str, x, y) } else { c.fillStyle = col; c.fillText(str, x, y) } c.restore() }
// placa no canto: escreve letra por letra, com traço dourado crescendo embaixo e uma linha menor
function typeText(tl, x, y, str, t0, t1, o = {}) {
  const { size = 70, col = '#fff6e0', cps = 24, sub = null, subSize = 40 } = o;
  const al = Math.min(ramp(tl, t0 - .2, t0), 1 - ramp(tl, t1 - .3, t1)); if (al <= 0) return;
  c.save(); c.globalAlpha = al; c.font = `800 ${size}px ${COND}`; if ('letterSpacing' in c) c.letterSpacing = size * .02 + 'px';
  const n = clamp(Math.floor((tl - t0) * cps), 0, str.length), w = c.measureText(str).width, wn = c.measureText(str.slice(0, n)).width;
  c.save(); c.translate(x + w * .4, y); c.scale(1.9, 1); glow(0, 0, 150 + w * .32, '8,9,13', .5); c.restore();
  txt(str.slice(0, n), x, y, size, col);
  c.fillStyle = '#d9b35a'; c.fillRect(x, y + 14, Math.max(wn, w * ramp(tl, t0, t0 + str.length / cps)), 3);
  if (sub) { const t2 = t0 + str.length / cps + .15, n2 = clamp(Math.floor((tl - t2) * cps * 1.5), 0, sub.length); txt(sub.slice(0, n2), x, y + 62, subSize, '#e6d3a0', { w: 600, ls: subSize * .12 }) }
  c.restore();
}
// cartão de capítulo: tela escura com letras douradas
function chapter(tl, n, title) {
  const a = 1 - ramp(tl, 1.15, 1.6); if (a <= 0) return;
  c.save(); c.globalAlpha = a; c.fillStyle = '#0b0c11'; c.fillRect(0, 0, W, H); add(() => glow(W / 2, 540, 620, '217,179,90', .12));
  const u = eo(ramp(tl, 0, .5));
  txt(`CAPÍTULO ${n}`, W / 2, 462, 46, '#d9b35a', { align: 'center', w: 600, ls: 16 });
  c.fillStyle = '#d9b35a'; c.fillRect(W / 2 - 260 * u, 492, 520 * u, 3);
  c.globalAlpha = a * u; txt(title, W / 2, 640 + (1 - u) * 20, 140, '#fff6e0', { align: 'center', ls: 4 });
  c.restore();
}
function label(x, y, str, o = {}) { const { size = 44, col = '#fff6e0', align = 'left', a = 1 } = o; if (a > 0) txt(str, x, y, size, col, { align, a, w: o.w || 800, sh: o.sh }) }
// cota: linha fina com pontas
function dim(x0, y0, x1, y1, col, a = 1, lw = 4) {
  if (a <= 0) return; c.save(); c.globalAlpha = a; c.lineCap = 'butt';
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L * 15, ny = dx / L * 15;
  for (const [ox, cl] of [[3, 'rgba(8,9,13,.5)'], [0, col]]) { line(x0 + ox, y0 + ox, x1 + ox, y1 + ox, cl, lw); for (const [x, y] of [[x0, y0], [x1, y1]]) line(x - nx + ox, y - ny + ox, x + nx + ox, y + ny + ox, cl, lw) }
  c.restore();
}
// legenda no rodapé: a frase já tem o lugar marcado e cada palavra entra na hora em que é dita
function legenda(t) {
  const L = LEG.find(l => t >= l.t0 && t < l.t1); if (!L) return;
  const size = 58; c.save(); c.font = `800 ${size}px ${COND}`; if ('letterSpacing' in c) c.letterSpacing = '1px';
  const sp = c.measureText(' ').width + 4, ws = L.w.map(([s]) => c.measureText(s).width), tot = ws.reduce((a, b) => a + b + sp, -sp);
  let lines = [[]]; if (tot > 1280) { let acc = 0; L.w.forEach((w, i) => { if (acc > tot / 2 - ws[i] / 2 && lines.length === 1) lines.push([]); lines[lines.length - 1].push(i); acc += ws[i] + sp }) } else lines = [L.w.map((_, i) => i)];
  const fo = 1 - ramp(t, L.t1 - .12, L.t1);
  lines.forEach((ln, k) => {
    const lw = ln.reduce((a, i) => a + ws[i] + sp, -sp); let x = W / 2 - lw / 2; const y = (lines.length === 1 ? 978 : 942) + k * 66;
    ln.forEach(i => { const [s, tw, hl] = L.w[i], u = ramp(t, tw - .04, tw + .12); if (u > 0) { c.globalAlpha = fo * u; txt(s, x, y + (1 - eo(u)) * 10, size, hl ? '#f0b94a' : '#fffaf0') } x += ws[i] + sp });
  });
  c.restore();
}
// acabamento: sombra do rodapé, vinheta quente e grão de papel
const GRAIN = (() => { const g = document.createElement('canvas'); g.width = g.height = 512; const x = g.getContext('2d'), d = x.createImageData(512, 512), q = rng(123); for (let i = 0; i < d.data.length; i += 4) { const v = 90 + q() * 165 | 0; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255 } x.putImageData(d, 0, 0); return g })();
function finish(t) {
  c.fillStyle = lg(0, 760, 0, H, [[0, 'rgba(10,9,8,0)'], [1, 'rgba(10,9,8,.72)']]); c.fillRect(0, 760, W, H - 760);
  c.fillStyle = rg(W / 2, H / 2, 560, 1200, [[0, 'rgba(20,12,4,0)'], [1, 'rgba(20,12,4,.5)']]); c.fillRect(0, 0, W, H);
  c.save(); c.globalCompositeOperation = 'overlay'; c.globalAlpha = .16; const q = rng(Math.floor(t * 12) + 1), ox = q() * 512 | 0, oy = q() * 512 | 0; for (let x = -ox; x < W; x += 512)for (let y = -oy; y < H; y += 512)c.drawImage(GRAIN, x, y); c.restore();
}
function sepia(k = .8) { c.save(); c.filter = `sepia(${k}) contrast(1.05)`; c.drawImage(cv, 0, 0); c.restore() }

// ---------- tomadas ----------
const SHOTS = [];
function shot(t0, t1, fn) { SHOTS.push({ t0, t1, fn }) }
function render(t) {
  const s = SHOTS.find(s => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none'; c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
  c.save(); s.fn(t - s.t0, t); c.restore();
  finish(t); legenda(t);
  const fd = Math.max(1 - ramp(t, 0, .5), ramp(t, DUR - 1.1, DUR - .1)); if (fd > 0) { c.fillStyle = `rgba(0,0,0,${fd})`; c.fillRect(0, 0, W, H) }
}
