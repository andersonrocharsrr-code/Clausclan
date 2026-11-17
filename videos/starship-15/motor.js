// ================= Motor de desenho (canvas 2D, 1920x1080) — Starship voo 15 =================
const W = 1920, H = 1080;
const cv = document.getElementById('c'), c = cv.getContext('2d');
const lerp = (a, b, u) => a + (b - a) * u, clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (t, a, b) => clamp((t - a) / (b - a)), ease = u => u * u * (3 - 2 * u), eo = u => 1 - Math.pow(1 - u, 3);
const sin = Math.sin, cos = Math.cos, PI = Math.PI;
function rng(s) { return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 } }
function lg(x0, y0, x1, y1, st) { const g = c.createLinearGradient(x0, y0, x1, y1); st.forEach(([o, col]) => g.addColorStop(o, col)); return g }
function rg(x, y, r0, r1, st) { const g = c.createRadialGradient(x, y, r0, x, y, r1); st.forEach(([o, col]) => g.addColorStop(o, col)); return g }
function puff(x, y, r, rgb, a) { if (a <= 0.003 || r <= 0) return; c.fillStyle = rg(x, y, 0, r, [[0, `rgba(${rgb},${a})`], [.55, `rgba(${rgb},${a * .55})`], [1, `rgba(${rgb},0)`]]); c.beginPath(); c.arc(x, y, r, 0, 7); c.fill() }
function poly(pts, fill, stroke, lw) { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); if (fill) { c.fillStyle = fill; c.fill() } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 1; c.stroke() } }
function line(x0, y0, x1, y1, col, lw) { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke() }
const add = fn => { c.save(); c.globalCompositeOperation = 'lighter'; fn(); c.restore() };
const fmt = n => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

// ---------- câmera do "mundo" (metros, y para cima, chão em y=0) ----------
let CAM = { x: 0, y: 0, z: 1 };
function world(cam, fn) { CAM = cam; c.save(); c.translate(W / 2, H / 2); c.scale(cam.z, -cam.z); c.translate(-cam.x, -cam.y); fn(); c.restore() }
const M = (x, y) => [W / 2 + (x - CAM.x) * CAM.z, H / 2 - (y - CAM.y) * CAM.z];
function at(x, y, ang, fn, flip) { c.save(); c.translate(x, y); c.rotate(ang); if (flip) c.scale(-1, 1); fn(); c.restore() }

// ---------- céus ----------
const SKY_GOLD = [[0, '#2d5c9c'], [.45, '#86abd0'], [.8, '#f1cf9c'], [1, '#fbe3b4']];
const SKY_DAY = [[0, '#2a6cba'], [.55, '#7db4e2'], [.9, '#d6e6ee'], [1, '#efe9d6']];
const SKY_SET = [[0, '#141d42'], [.4, '#5a3f6c'], [.72, '#e2794a'], [1, '#ffd27a']];
const SKY_HIGH = [[0, '#02040a'], [.5, '#0a1c3c'], [.85, '#2a5c9c'], [1, '#8cc0ea']];
function sky(st, hy) { c.fillStyle = lg(0, 0, 0, Math.max(hy, 10), st); c.fillRect(0, 0, W, H) }
function sunGlow(x, y, r, rgb, a = 1) { add(() => { puff(x, y, r, rgb, .55 * a); puff(x, y, r * .35, '255,250,235', .9 * a); puff(x, y, r * .09, '255,255,255', 1 * a) }) }
const STARS = (() => { const q = rng(77), a = []; for (let i = 0; i < 420; i++)a.push([q() * W, q() * H, .4 + q() * 1.5, .3 + q() * .7]); return a })();
function stars(a = 1, t = 0) { STARS.forEach(([x, y, r, b], i) => { c.fillStyle = `rgba(255,255,255,${(b * a * (.8 + .2 * sin(t * 3 + i))).toFixed(3)})`; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill() }) }
function cloudsBand(seed, n, y0, y1, r0, r1, rgb, a, dx = 0) { const q = rng(seed); for (let i = 0; i < n; i++) { const x = ((q() * (W + 800) + dx) % (W + 800) + W + 800) % (W + 800) - 400, y = lerp(y0, y1, q()), r = lerp(r0, r1, q()); c.save(); c.translate(x, y); c.scale(2.6, 1); puff(0, 0, r, rgb, a * (.5 + q() * .5)); c.restore() } }
// Terra vista de cima: curva do horizonte, nuvens e a faixa da atmosfera
function earthLimb(top, R, t, o = {}) {
  const cx = o.cx ?? W / 2, cy = top + R;
  add(() => { c.fillStyle = rg(cx, cy, R - 4, R + 46, [[0, 'rgba(120,190,255,.75)'], [.3, 'rgba(90,160,255,.35)'], [1, 'rgba(60,120,255,0)']]); c.beginPath(); c.arc(cx, cy, R + 46, 0, 7); c.fill() });
  c.save(); c.beginPath(); c.arc(cx, cy, R, 0, 7); c.clip();
  c.fillStyle = rg(cx, cy, R - 520, R, [[0, '#0b2c5c'], [.55, '#15509a'], [.9, '#3f8fd6'], [1, '#a8d8ff']]); c.fillRect(0, top - 10, W, H);
  const q = rng(o.seed || 5);
  for (let i = 0; i < 90; i++) { const a = -PI / 2 + (q() - .5) * .9 + t * 0.004 * (o.spin ?? 1), d = R - 20 - q() * 420, x = cx + cos(a) * d, y = cy + sin(a) * d, r = 30 + q() * 110; c.save(); c.translate(x, y); c.rotate(a + PI / 2); c.scale(2.8, .8); puff(0, 0, r, '255,255,255', .1 + q() * .3); c.restore() }
  if (o.night) { c.fillStyle = lg(0, top, W, top, [[0, 'rgba(0,0,10,.75)'], [.45, 'rgba(0,0,10,.15)'], [1, 'rgba(0,0,10,0)']]); c.fillRect(0, top - 10, W, H) }
  c.restore();
}

// ---------- aço e escudo térmico ----------
const STEEL = { // esquerda → direita
  dia: [[0, '#474b52'], [.1, '#8c9299'], [.36, '#f4f1ea'], [.55, '#cfcdc8'], [.82, '#8b8e93'], [1, '#3e4248']],
  ouro: [[0, '#4a4640'], [.1, '#9a8e7c'], [.36, '#fff0d0'], [.55, '#e0c8a2'], [.82, '#94897a'], [1, '#3d3a38']],
  espaco: [[0, '#0c0e12'], [.2, '#3a4048'], [.5, '#aab2bc'], [.72, '#ffffff'], [.9, '#c8d2de'], [1, '#6d7682']],
  por: [[0, '#1a1418'], [.15, '#4a3238'], [.4, '#b8684a'], [.6, '#6a4648'], [1, '#161216']],
};
function steel(pal, w = 4.5) { return lg(-w, 0, w, 0, STEEL[pal]) }
function rings(y0, y1, w, step = 1.85) { for (let y = y0; y < y1; y += step) { c.fillStyle = 'rgba(0,0,0,.11)'; c.fillRect(-w, y, 2 * w, .1); c.fillStyle = 'rgba(255,255,255,.07)'; c.fillRect(-w, y + .1, 2 * w, .07) } }
function frost(y0, y1, a) { if (a <= 0) return; c.fillStyle = lg(0, y0, 0, y1, [[0, 'rgba(255,255,255,0)'], [.08, `rgba(250,253,255,${.62 * a})`], [.92, `rgba(250,253,255,${.62 * a})`], [1, 'rgba(255,255,255,0)']]); c.fillRect(-4.5, y0, 9, y1 - y0); c.fillStyle = lg(-4.5, 0, 4.5, 0, [[0, `rgba(40,50,70,${.45 * a})`], [.25, 'rgba(40,50,70,0)'], [.8, 'rgba(40,50,70,0)'], [1, `rgba(40,50,70,${.5 * a})`]]); c.fillRect(-4.5, y0, 9, y1 - y0) }
function nozzles(n, w, len, rw, lit) { for (let i = 0; i < n; i++) { const x = (i - (n - 1) / 2) * (2 * w / n); poly([[x - rw * .55, 0], [x + rw * .55, 0], [x + rw, -len], [x - rw, -len]], lit ? '#5a3a2a' : '#17191d'); c.fillStyle = lit ? 'rgba(255,190,120,.8)' : 'rgba(255,255,255,.08)'; c.fillRect(x - rw, -len, 2 * rw, .12) } }

// Propulsor Super Heavy: 72 m (base em y=0)
function booster(o = {}) {
  const pal = o.pal || 'dia';
  nozzles(9, 4.1, 1.5, .42, o.lit);
  c.fillStyle = steel(pal); c.fillRect(-4.5, 0, 9, 70);
  rings(1.2, 70, 4.5);
  c.fillStyle = 'rgba(0,0,0,.28)'; c.fillRect(-4.5, 0, 9, 2.6);
  c.fillStyle = 'rgba(0,0,0,.16)'; c.fillRect(1.6, 3, .55, 62); c.fillRect(-2.6, 3, .4, 62);
  for (const sx of [-1, 1]) { poly([[sx * 4.5, 1], [sx * 5.25, 1.6], [sx * 5.25, 19], [sx * 4.5, 21]], sx < 0 ? '#3c4046' : '#6a6e74') }
  frost(4, 31, o.frost || 0); frost(34, 65, (o.frost || 0) * .9);
  // aletas de grade
  for (const sx of [-1, 1]) { c.save(); c.scale(sx, 1); c.fillStyle = sx < 0 ? '#3a3d42' : '#63676d'; c.fillRect(4.5, 62.2, 4.4, 3.6); c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = .1; for (let i = 1; i < 6; i++) { c.beginPath(); c.moveTo(4.5 + i * .73, 62.2); c.lineTo(4.5 + i * .73, 65.8); c.stroke() } for (let j = 1; j < 4; j++) { c.beginPath(); c.moveTo(4.5, 62.2 + j * .9); c.lineTo(8.9, 62.2 + j * .9); c.stroke() } c.restore() }
  // anel de separação a quente (treliça)
  c.fillStyle = '#25272c'; c.fillRect(-4.5, 70, 9, 2); c.fillStyle = steel(pal); c.globalAlpha = .55; for (let i = 0; i < 12; i++)c.fillRect(-4.4 + i * .75, 70.25, .32, 1.5); c.globalAlpha = 1;
  c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(-4.5, 69.6, 9, .4);
}
const SHIP_PATH = () => { c.beginPath(); c.moveTo(-4.5, 0); c.lineTo(-4.5, 37); c.bezierCurveTo(-4.5, 44.5, -2.4, 50, 0, 52); c.bezierCurveTo(2.4, 50, 4.5, 44.5, 4.5, 37); c.lineTo(4.5, 0); c.closePath() };
// Nave Starship: 52 m (base em y=0). view 'frente' (aletas dos lados) ou 'lado' (barriga preta à esquerda)
function ship(o = {}) {
  const pal = o.pal || 'dia', side = o.view === 'lado', fa = o.flap || 0;
  nozzles(side ? 3 : 4, 3.4, 1.7, .85, o.lit);
  const blackFlap = '#1b1d21', steelFlap = pal === 'espaco' ? '#b9c2cc' : pal === 'por' ? '#3a2a30' : '#7d8288';
  if (!side) { // aletas dos lados
    poly([[-4.4, 1], [-8.6, 1.4], [-8.6, 8.5], [-4.4, 14]], blackFlap); poly([[4.4, 1], [8.6, 1.4], [8.6, 8.5], [4.4, 14]], steelFlap);
    poly([[-4.3, 32], [-7.5, 32.4], [-7.3, 37], [-3.7, 42.5]], blackFlap); poly([[4.3, 32], [7.5, 32.4], [7.3, 37], [3.7, 42.5]], steelFlap);
  }
  SHIP_PATH(); c.fillStyle = steel(pal); c.fill();
  c.save(); SHIP_PATH(); c.clip();
  rings(1.5, 37, 4.5);
  const bx = side ? -1.4 : -.4; // limite do escudo térmico
  c.fillStyle = lg(-4.5, 0, bx + .5, 0, [[0, '#07080a'], [.35, '#1c1e23'], [.8, '#24272c'], [1, '#101114']]); c.fillRect(-4.5, 0, bx + 4.5, 53);
  c.strokeStyle = 'rgba(255,255,255,.055)'; c.lineWidth = .05; for (let y = .5; y < 52; y += .62) { c.beginPath(); c.moveTo(-4.5, y); c.lineTo(bx, y); c.stroke() } for (let x = -4.2; x < bx; x += .55) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 52); c.stroke() }
  c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(-4.5, 0, 9, 1.6);
  frost(5, 16, (o.frost || 0) * .9); frost(18, 33, (o.frost || 0) * .8);
  if (o.heat) { c.globalCompositeOperation = 'lighter'; c.fillStyle = lg(-4.5, 0, bx + 1, 0, [[0, `rgba(255,150,90,${.85 * o.heat})`], [.6, `rgba(255,60,40,${.4 * o.heat})`], [1, 'rgba(255,60,40,0)']]); c.fillRect(-4.5, 0, bx + 5.5, 53) }
  c.restore();
  if (side) { // aletas vistas de lado: painéis sobre o corpo, mexendo um pouco
    const fl = (pts, hx, hy) => { c.save(); c.translate(hx, hy); c.transform(1 - Math.abs(fa) * .35, 0, 0, 1, 0, 0); c.translate(-hx, -hy); poly(pts, lg(-3, 0, 3.5, 0, [[0, '#15171a'], [.45, '#2c2f35'], [1, steelFlap]]), 'rgba(0,0,0,.6)', .12); c.restore() };
    fl([[-2.9, 1.2], [3, 1.2], [3, 8.5], [-2.9, 13.5]], -2.9, 7); fl([[-2.6, 32.2], [2.3, 32.2], [1.9, 37.5], [-2.4, 41.5]], -2.6, 36);
  }
  if (o.slot) { c.fillStyle = '#0a0b0d'; c.fillRect(3.2, 29.2, 1.25, 2.1); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(3.2, 29.2, .1, 2.1) }
}
// chama dos motores (para baixo a partir de y=0), em metros
function plume(len, w, t, seed = 0, o = {}) {
  const f = 1 + .07 * sin(t * 43 + seed) + .05 * sin(t * 71 + seed * 2), L = len * f, a = o.a ?? 1;
  add(() => {
    const sh = (wd, l, st) => { c.fillStyle = lg(0, 0, 0, -l, st); c.beginPath(); c.moveTo(-wd * .5, 0); c.bezierCurveTo(-wd * 1.25, -l * .3, -wd * .7, -l * .8, 0, -l); c.bezierCurveTo(wd * .7, -l * .8, wd * 1.25, -l * .3, wd * .5, 0); c.closePath(); c.fill() };
    if (o.vac) { sh(w * 3.2, L, [[0, `rgba(150,180,255,${.5 * a})`], [.4, `rgba(120,140,255,${.2 * a})`], [1, 'rgba(120,140,255,0)']]); sh(w * .8, L * .5, [[0, `rgba(255,255,255,${.95 * a})`], [1, 'rgba(180,200,255,0)']]) }
    else {
      sh(w * 1.5, L, [[0, `rgba(255,150,60,${.75 * a})`], [.5, `rgba(255,110,40,${.4 * a})`], [1, 'rgba(255,80,30,0)']]);
      sh(w * 1.0, L * .72, [[0, `rgba(255,220,170,${.95 * a})`], [.6, `rgba(255,170,90,${.5 * a})`], [1, 'rgba(255,120,50,0)']]);
      sh(w * .6, L * .42, [[0, `rgba(255,255,255,${a})`], [.7, `rgba(215,200,255,${.7 * a})`], [1, 'rgba(200,170,255,0)']]);
      for (let i = 1; i < 5; i++) { const y = -L * (.1 + i * .085) + (t * 0) , r = w * (.36 - i * .04); puff(0, y, r * 1.6, '255,240,255', .5 * a) }
    }
    puff(0, -w * .2, w * 2.4, '255,200,140', .45 * a);
  });
}

// ---------- Starbase: chão, mar, torre, mesa de lançamento ----------
const MESA = 20; // altura da mesa de lançamento (m)
function ground(pal = 'ouro') {
  const sea = pal === 'por' ? ['#b8684a', '#3a2c48'] : pal === 'dia' ? ['#9cc4dc', '#3f7fa8'] : ['#e8c898', '#5f8aa6'];
  c.fillStyle = lg(0, 3.2, 0, 0, [[0, sea[0]], [1, sea[1]]]); c.fillRect(-4000, 0, 8000, 3.2);
  const g = pal === 'por' ? ['#2a2028', '#120e12'] : pal === 'dia' ? ['#9a8f6a', '#5a5540'] : ['#a58c5c', '#55472e'];
  c.fillStyle = lg(0, 0, 0, -120, [[0, g[0]], [1, g[1]]]); c.fillRect(-4000, -900, 8000, 900);
  const q = rng(9); for (let i = 0; i < 140; i++) { const x = -900 + q() * 1800, y = -q() * 70 - .5, w = 6 + q() * 30; c.fillStyle = `rgba(${q() < .5 ? '60,70,40' : '0,0,0'},${.06 + q() * .1})`; c.fillRect(x, y, w, .5 + q() * 1.2) }
}
function farBuildings(pal = 'ouro') {
  const dk = pal === 'por';
  const tk = dk ? [[0, '#1a1418'], [.4, '#6a4038'], [1, '#141014']] : [[0, '#8a8a88'], [.35, '#fbf6ea'], [1, '#77787a']];
  for (let i = 0; i < 7; i++) { const x = -150 + i * 9.5; c.save(); c.translate(x, 0); c.fillStyle = lg(-3.6, 0, 3.6, 0, tk); c.fillRect(-3.6, 0, 7.2, 24 + (i % 3) * 5); c.beginPath(); c.ellipse(0, 24 + (i % 3) * 5, 3.6, 1.6, 0, 0, PI); c.fill(); c.restore() }
  c.fillStyle = dk ? '#18131a' : '#6f6a60'; c.fillRect(110, 0, 60, 9); c.fillRect(180, 0, 26, 16); c.fillStyle = dk ? '#120e14' : '#5a564e'; c.fillRect(-230, 0, 50, 7);
  // segunda torre, ao longe
  c.save(); c.translate(300, 0); c.scale(.62, .62); c.globalAlpha = .55; towerBody(pal); c.globalAlpha = 1; c.restore();
}
function towerBody(pal) {
  c.fillStyle = lg(-22, 0, -12, 0, pal === 'por' ? [[0, '#0d0a0e'], [1, '#2a1c20']] : [[0, '#17191d'], [.5, '#2c3036'], [1, '#42464d']]); c.fillRect(-22, 0, 10, 152);
  c.strokeStyle = pal === 'por' ? 'rgba(255,150,90,.18)' : 'rgba(255,255,255,.16)'; c.lineWidth = .28;
  for (let y = 0; y < 152; y += 9.5) { c.beginPath(); c.moveTo(-22, y); c.lineTo(-12, y + 9.5); c.moveTo(-12, y); c.lineTo(-22, y + 9.5); c.moveTo(-22, y); c.lineTo(-12, y); c.stroke() }
  c.fillStyle = '#1a1c20'; c.fillRect(-23, 152, 12, 3); c.fillRect(-17.3, 155, .7, 14);
}
function arm(armY, len, front, pal) {
  const x1 = -12 + 29 * len, col = pal === 'por' ? (front ? '#150f13' : '#2c1c20') : (front ? '#1d2025' : '#4a4e55');
  c.fillStyle = col; c.fillRect(-12.5, armY - 2.6, x1 + 12.5, 2.6); c.fillRect(-12.5, armY - 8, 3.2, 12);
  c.strokeStyle = pal === 'por' ? 'rgba(255,160,100,.25)' : 'rgba(255,255,255,.22)'; c.lineWidth = .2;
  for (let x = -9; x < x1 - 2; x += 2.6) { c.beginPath(); c.moveTo(x, armY - 2.6); c.lineTo(x + 1.3, armY); c.lineTo(x + 2.6, armY - 2.6); c.stroke() }
  c.fillStyle = front ? '#c8452f' : '#8a3a2c'; c.fillRect(-9, armY - .35, x1 + 8, .35);
}
function tower(o = {}) { // phase 'tras' (torre + braço de trás) ou 'frente' (braço da frente)
  const y = o.armY ?? 100, len = o.len ?? 1, pal = o.pal || 'ouro';
  if (o.phase !== 'frente') { towerBody(pal); c.save(); c.translate(0, 1.4); arm(y, len * .96, false, pal); c.restore(); if (o.qd) { c.fillStyle = '#2a2d33'; c.fillRect(-12, MESA + 76, 7.6, 2.2) } }
  else arm(y, len, true, pal);
}
function mesa(pal = 'ouro') {
  const d = pal === 'por' ? '#120d11' : '#2b2e33', l = pal === 'por' ? '#2a1c20' : '#565a61';
  for (const x of [-9, -3.2, 2, 7.2]) { c.fillStyle = lg(x, 0, x + 1.8, 0, [[0, d], [1, l]]); c.fillRect(x, 0, 1.8, 15) }
  c.fillStyle = lg(0, 20, 0, 14, [[0, l], [1, d]]); c.fillRect(-10.5, 14, 21, 6); c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(-10.5, 14, 21, 1);
  c.fillStyle = d; c.fillRect(-16, 0, 32, 1.6);
}
// vapor saindo (respiro dos tanques)
function vent(x, y, t, seed, dir = 1, s = 1) { const q = rng(seed); for (let i = 0; i < 9; i++) { const ph = (t * .45 + q()) % 1; puff(x + dir * ph * 16 * s + sin(t + i) * 1, y + ph * 3 * s - ph * ph * 5 * s, (1 + ph * 5) * s, '255,255,255', .5 * (1 - ph)) } }
// nuvens de fumaça que rolam pelo chão
function smokeRoll(t, t0, n, seed, rgb, o = {}) {
  const q = rng(seed);
  for (let i = 0; i < n; i++) { const b = t0 + q() * (o.span ?? 2.5), dir = q() < .5 ? -1 : 1, v = 18 + q() * 34, age = t - b, up = q(); if (age <= 0) { q(); continue } const x = dir * (6 + v * age * (1 - .08 * Math.min(age, 6))), y = 2 + up * 8 + age * (2 + up * 9), r = 7 + age * (8 + q() * 7); puff((o.x || 0) + x, y, r, rgb, clamp(.6 - age * (o.fade ?? .05)) * clamp(age * 3)) }
}

// ---------- textos ----------
const MONO = '"DejaVu Sans Mono", monospace', SANS = '"Liberation Sans", Arial, sans-serif';
function backing(x, y, w, h) { c.save(); c.filter = 'blur(14px)'; c.fillStyle = 'rgba(5,8,11,.62)'; c.fillRect(x, y, w, h); c.restore() }
// máquina de escrever: letra por letra, cursor e traço vermelho que cresce
function typeText(tl, x, y, str, t0, t1, o = {}) {
  const { size = 46, col = '#fff6e6', cps = 24, sub = null, subSize = 36 } = o;
  const al = Math.min(ramp(tl, t0 - .2, t0), 1 - ramp(tl, t1 - .3, t1)); if (al <= 0) return;
  c.save(); c.globalAlpha = al; c.textBaseline = 'alphabetic'; c.textAlign = 'left';
  c.font = `bold ${size}px ${MONO}`; const cw = c.measureText('M').width + 3, w = str.length * cw;
  c.font = `bold ${subSize}px ${MONO}`; const sw = sub ? sub.length * (c.measureText('M').width + 3) : 0;
  backing(x - 30, y - size - 22, Math.max(w, sw) + 90, sub ? size + 116 : size + 58);
  const n = clamp(Math.floor((tl - t0) * cps), 0, str.length), cur = (n < str.length || (tl * 2) % 1 < .5) && tl < t1 - .3 ? '▌' : '';
  c.font = `bold ${size}px ${MONO}`; c.fillStyle = col; [...(str.slice(0, n) + cur)].forEach((ch, i) => c.fillText(ch, x + i * cw, y));
  c.fillStyle = '#c8452f'; c.fillRect(x, y + 14, w * ramp(tl, t0, t0 + str.length / cps), 5);
  if (sub) { const t2 = t0 + str.length / cps + .2, n2 = clamp(Math.floor((tl - t2) * cps * 1.4), 0, sub.length); c.font = `bold ${subSize}px ${MONO}`; const cw2 = c.measureText('M').width + 3; c.fillStyle = '#ffe9c4';[...sub.slice(0, n2)].forEach((ch, i) => c.fillText(ch, x + i * cw2, y + 58)) }
  c.restore();
}
// cartão de capítulo por cima do começo da cena
function chapter(tl, n, title) {
  const a = 1 - ramp(tl, 1.15, 1.6); if (a <= 0) return;
  c.save(); c.globalAlpha = a; c.fillStyle = 'rgba(6,9,14,.86)'; c.fillRect(0, 0, W, H);
  const u = eo(ramp(tl, 0, .45)); c.textAlign = 'center';
  c.font = `bold 44px ${MONO}`; c.fillStyle = '#c8452f'; c.fillText(`C A P Í T U L O   ${n}`, W / 2, 470);
  c.fillStyle = '#c8452f'; c.fillRect(W / 2 - 330 * u, 500, 660 * u, 5);
  c.font = `bold 104px ${SANS}`; c.fillStyle = '#fff6e6'; c.globalAlpha = a * u; c.fillText(title, W / 2, 630 + (1 - u) * 24);
  c.restore();
}
function label(x, y, str, o = {}) {
  const { size = 44, col = '#fff', align = 'left', a = 1, font = SANS } = o; if (a <= 0) return;
  c.save(); c.globalAlpha = a; c.font = `bold ${size}px ${font}`; c.textAlign = align; c.lineJoin = 'round'; c.strokeStyle = 'rgba(8,12,18,.85)'; c.lineWidth = size * .13; c.strokeText(str, x, y); c.fillStyle = col; c.fillText(str, x, y); c.restore();
}
// cota: linha com pontas e marcas
function dim(x0, y0, x1, y1, col, a = 1, lw = 5) {
  if (a <= 0) return; c.save(); c.globalAlpha = a; c.lineCap = 'round';
  line(x0, y0, x1, y1, 'rgba(8,12,18,.7)', lw + 5); line(x0, y0, x1, y1, col, lw);
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L * 16, ny = dx / L * 16;
  for (const [x, y] of [[x0, y0], [x1, y1]]) { line(x - nx, y - ny, x + nx, y + ny, 'rgba(8,12,18,.7)', lw + 5); line(x - nx, y - ny, x + nx, y + ny, col, lw) }
  c.restore();
}
function vignette() { c.fillStyle = rg(W / 2, H / 2, 520, 1180, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.42)']]); c.fillRect(0, 0, W, H) }
function sepia(k = .8) { c.save(); c.filter = `sepia(${k}) contrast(1.05)`; c.drawImage(cv, 0, 0); c.restore() }

// ---------- tomadas ----------
const SHOTS = [];
function shot(t0, t1, fn) { SHOTS.push({ t0, t1, fn }) }
function render(t) {
  const s = SHOTS.find(s => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none'; c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
  c.save(); s.fn(t - s.t0, t); c.restore();
  vignette();
  const fd = Math.max(1 - ramp(t, 0, .5), ramp(t, DUR - 1.1, DUR - .1)); if (fd > 0) { c.fillStyle = `rgba(0,0,0,${fd})`; c.fillRect(0, 0, W, H) }
}
