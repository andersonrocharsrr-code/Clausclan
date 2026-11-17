// ================= OS ÚLTIMOS DIAS DE HITLER — 3 min 50 s (230 s) — modelo Recorte Dourado =================
// Cortes acompanham a narração (ver ROTEIRO.md). Nada de símbolos nazistas na tela; a morte é dita, não mostrada.
const DUR = 230.0;
const CUTS = [0, 10.4, 14.1, 18.0, 24.0, 32.2, 39.5, 44.2, 47.0, 51.0, 63.6, 69.4, 81.0, 85.0, 91.2, 96.0, 101.0, 109.0, 117.0, 123.0, 134.5, 148.0, 154.6, 158.6, 165.0, 176.0, 183.8, 188.0, 193.4, 201.0, 210.0, DUR];
const TX = 110, TY = 170;
const OURO = '#f0b94a', CREME = '#fff6e0', PALHA = '#e6d3a0', FERRUGEM = '#b8452f', VERM = '#a8382a', AZUL = '#3f6a80';
const FONTE = '"Fira Sans Extra Condensed", sans-serif';
const HITLER = { coat: '#5a5b45', dark: '#3e3f30', legs: '#26261f', hair: '#2a2420', skin: '#d2a882' };
const SKY_DUSK = [[0, '#2a2a3a'], [.45, '#5a4a52'], [.8, '#b46a42'], [1, '#e0a05a']];
const SKY_NIGHT = [[0, '#0b0c14'], [.6, '#1c1c2a'], [1, '#3a2a2a']];

function star4(x, y, r, col) { poly([[x, y - r], [x + r * .22, y - r * .22], [x + r, y], [x + r * .22, y + r * .22], [x, y + r], [x - r * .22, y + r * .22], [x - r, y], [x - r * .22, y - r * .22]], col) }
// ---------- cidade em ruínas ----------
function skyline(seed, base, n, h0, h1, cols, t, o = {}) {
  const q = rng(seed), w = (W + 200) / n;
  for (let i = 0; i < n; i++) {
    const x = -100 + i * w + (q() - .5) * w * .3, bw = w * (.7 + q() * .5), h = lerp(h0, h1, q()), top = base - h, br = q();
    const pts = [[x, base], [x, top + h * .08 * q()]]; const k = 3 + Math.floor(q() * 4); for (let j = 1; j < k; j++) pts.push([x + bw * j / k, top + (q() < .5 ? q() * h * .35 : 0)]); pts.push([x + bw, top + h * .2 * q()], [x + bw, base]);
    poly(pts, cols[0]); poly([[x + bw * .72, base], [x + bw * .72, top + h * .25], [x + bw, top + h * .2], [x + bw, base]], cols[1]);
    if (o.windows !== false) { const ww = Math.max(5, bw * .08), wh = ww * 1.5; for (let yy = top + h * .3; yy < base - wh * 2; yy += wh * 2.2) for (let xx = x + ww; xx < x + bw * .68; xx += ww * 2.2) { const r = q(); if (r < .5) continue; c.fillStyle = r > .97 && o.fire ? `rgba(240,140,60,${.6 + .4 * sin(t * 9 + xx)})` : (o.hole || 'rgba(10,10,14,.75)'); c.fillRect(xx, yy, ww, wh) } }
    if (o.fire && br > .82) add(() => glow(x + bw * .5, top + 10, 60 + 20 * sin(t * 5 + i), '240,120,50', .35));
  }
}
function smoke(x, y, h, t, seed, rgb, ws = 1, dir = 1) { const q = rng(seed), P = []; for (let i = 0; i < 22; i++) { const ph = (q() + t * .05) % 1, yy = y - ph * h, r = (16 + ph * 70) * ws; P.push([x + dir * ph * ph * h * .45 + sin(t * .6 + i) * 6, yy, r, ph]) } P.forEach(([px, py, r, ph]) => disc(px + r * .15, py + r * .1, r, `rgba(${shade(rgb, .78)},${.85 * (1 - ph * .6)})`)); P.forEach(([px, py, r, ph]) => disc(px - r * .08, py - r * .06, r * .82, `rgba(${rgb},${.85 * (1 - ph * .6)})`)) }
function rubble(x, y, w, h, seed, cols) { const q = rng(seed), pts = [[x, y]]; for (let i = 1; i < 9; i++) pts.push([x + w * i / 9, y - h * (sin(PI * i / 9) * (.6 + q() * .5))]); pts.push([x + w, y]); poly(pts, cols[0]); for (let i = 0; i < 9; i++) poly([[x + q() * w, y - q() * h * .6], [x + q() * w, y - q() * h * .6], [x + q() * w, y - q() * h * .3]], cols[1]) }
function bomber(x, y, s, col) { c.save(); c.translate(x, y); c.scale(s, s); pill(0, 0, 120, 12, col); poly([[-14, -4], [14, -4], [8, -70], [-4, -70]], col); poly([[-14, 4], [14, 4], [8, 70], [-4, 70]], col); poly([[-56, -3], [-46, -3], [-48, -22], [-54, -22]], col); poly([[-56, 3], [-46, 3], [-48, 22], [-54, 22]], col); for (const e of [-40, -20, 20, 40]) pill(10, e, 18, 7, col); c.restore() }
function facade(x, y, w, h, seed, o = {}) {
  const q = rng(seed), top = y - h; const pts = [[x, y], [x, top + q() * 40]]; for (let j = 1; j < 6; j++) pts.push([x + w * j / 6, top + (q() < .6 ? q() * h * .3 : 0)]); pts.push([x + w, top + q() * 60], [x + w, y]);
  poly(pts, o.col || '#6a5e4c'); c.fillStyle = o.col2 || '#54493a'; c.fillRect(x + w * .8, top + h * .2, w * .2, h * .8);
  for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const wx = x + 24 + k * (w - 40) / 4, wy = top + 60 + f * (h - 80) / 6; if (wy < top + 50) continue; c.fillStyle = o.holeCol || '#1a1712'; c.fillRect(wx, wy, (w - 60) / 8, h / 12) }
  c.fillStyle = 'rgba(20,18,14,.3)'; for (let f = 1; f < 6; f++) c.fillRect(x, top + 40 + f * (h - 80) / 6, w, 5);
}
// ---------- mapa (Berlim no centro; unidades ≈ km) ----------
const ODER = [[100, -230], [92, -150], [85, -90], [72, -30], [82, 30], [90, 90], [110, 150], [130, 230]];
const ELBA = [[60, 190], [20, 150], [-12, 112], [-60, 80], [-110, 50], [-145, 25], [-190, -40], [-250, -110], [-310, -150]];
function mapa(z, cx = 960, cy = 540, o = {}) {
  const P = (x, y) => [cx + x * z, cy + y * z];
  c.fillStyle = '#3b3428'; c.fillRect(0, 0, W, H);
  c.strokeStyle = 'rgba(230,210,160,.06)'; c.lineWidth = 1; for (let k = -800; k <= 800; k += 50) { const [x] = P(k, 0), [, y] = P(0, k); c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.moveTo(0, y); c.lineTo(W, y); c.stroke() }
  c.fillStyle = '#1f2a30'; c.beginPath(); c.moveTo(0, 0); c.lineTo(...P(-900, -230)); c.lineTo(...P(-300, -170)); c.lineTo(...P(-120, -200)); c.lineTo(...P(60, -175)); c.lineTo(...P(140, -150)); c.lineTo(...P(260, -200)); c.lineTo(...P(900, -260)); c.lineTo(W, 0); c.closePath(); c.fill();
  if (o.zonas) { const u = o.zonas; c.save(); c.globalAlpha = .55 * u; c.fillStyle = AZUL; c.beginPath(); c.moveTo(0, 0); ELBA.slice().reverse().forEach(([x, y]) => c.lineTo(...P(x, y - 0))); c.lineTo(...P(60, 900)); c.lineTo(0, H); c.closePath(); c.fill(); c.fillStyle = VERM; c.beginPath(); c.moveTo(W, 0); c.lineTo(...P(-310, -400)); ELBA.slice().reverse().forEach(([x, y]) => c.lineTo(...P(x, y))); c.lineTo(...P(60, 900)); c.lineTo(W, H); c.closePath(); c.fill(); c.restore() }
  const rio = (pts, lw) => { c.strokeStyle = '#4f6a72'; c.lineWidth = lw; c.lineJoin = 'round'; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(...P(x, y)) : c.moveTo(...P(x, y))); c.stroke() };
  rio(ODER, Math.max(3, z * 2.4)); rio(ELBA, Math.max(3, z * 2.4)); rio([[-30, -8], [0, 0], [20, 4], [40, 20]], Math.max(2, z * 1.6));
  if (z > 3) { c.fillStyle = 'rgba(200,180,140,.18)'; c.beginPath(); c.ellipse(...P(0, 0), 26 * z, 20 * z, 0, 0, 7); c.fill() }
  const [bx, by] = P(0, 0); add(() => glow(bx, by, 40, '240,185,74', .5)); disc(bx, by, 10, OURO);
  if (!o.semNomes) { txt('BERLIM', bx + 18, by - 14, 40, CREME); const [ox, oy] = P(86, -120); txt('RIO ODER', ox + 14, oy, 28, '#9fb6c0', { w: 600 }); const [ex, ey] = P(-150, 20); txt('RIO ELBA', ex - 140, ey + 50, 28, '#9fb6c0', { w: 600 }); const [mx, my] = P(-100, -215); txt('MAR BÁLTICO', mx, my, 28, '#7f96a0', { w: 600 }) }
  return P;
}
function arrow(x0, y0, x1, y1, u, col, w = 26) { if (u <= 0) return; const x = lerp(x0, x1, u), y = lerp(y0, y1, u), a = Math.atan2(y - y0, x - x0), L = Math.hypot(x - x0, y - y0); c.save(); c.translate(x0, y0); c.rotate(a); poly([[0, -w * .35], [Math.max(0, L - w * 1.4), -w * .35], [Math.max(0, L - w * 1.4), -w], [L, 0], [Math.max(0, L - w * 1.4), w], [Math.max(0, L - w * 1.4), w * .35], [0, w * .35]], col); c.restore() }
// ---------- bunker em corte ----------
function bunkerCorte(t, o = {}) {
  const sy = 380, M_ = 36;
  c.fillStyle = lg(0, 0, 0, sy, SKY_DUSK); c.fillRect(0, -2000, W, sy + 2000);
  skyline(3, sy - 70, 9, 120, 300, ['#2a2622', '#1f1c19'], t, { fire: 1 }); smoke(1500, sy - 160, 500, t, 4, '90,80,74', 1.2);
  c.fillStyle = '#3a3226'; c.fillRect(0, sy - 70, W, 70); poly([[200, sy - 70], [1300, sy - 70], [1300, sy - 290], [1180, sy - 240], [1050, sy - 300], [900, sy - 250], [700, sy - 290], [520, sy - 230], [380, sy - 280], [200, sy - 240]], '#2c2723');
  for (let k = 0; k < 6; k++) { const wx = 280 + k * 170; c.fillStyle = '#15130f'; c.fillRect(wx, sy - 210, 60, 100) }
  c.fillStyle = '#4a4232'; c.fillRect(0, sy - 4, W, 8);
  for (const [x, h] of [[1420, 120], [1600, 90], [1760, 140]]) { c.fillStyle = '#241f1a'; c.fillRect(x, sy - h, 10, h); poly([[x + 5, sy - h], [x - 40, sy - h - 30], [x - 30, sy - h - 34], [x + 5, sy - h - 10]], '#241f1a') }
  c.fillStyle = bands(0, sy, 0, 1400, [[.15, '#5a4a36'], [.4, '#4c3e2e'], [.7, '#3f3427'], [1, '#332a20']]); c.fillRect(0, sy, W, 1400);
  const q = rng(7); for (let i = 0; i < 60; i++) disc(q() * W, sy + 20 + q() * 900, 3 + q() * 8, 'rgba(30,24,18,.35)');
  // exit tower no jardim
  c.fillStyle = '#6a665c'; c.fillRect(1240, sy - 70, 110, 70); c.fillStyle = '#7a766a'; c.fillRect(1260, sy - 150, 46, 80); poly([[1256, sy - 150], [1310, sy - 150], [1283, sy - 190]], '#5a564c');
  // laje e salas
  const top = sy + 4.6 * M_, slab = 3 * M_, rh = 2.8 * M_;
  c.fillStyle = bands(0, top, 0, top + slab, [[.2, '#9a958a'], [1, '#7f7a70']]); c.fillRect(520, top, 900, slab); c.fillStyle = '#7f7a70'; c.fillRect(520, top + slab + rh, 900, 30);
  c.fillStyle = '#2a2620'; c.fillRect(520, top + slab, 900, rh);
  for (let k = 0; k < 8; k++) { const x = 540 + k * 110; c.fillStyle = k === 4 ? '#5a4a30' : '#3e3628'; c.fillRect(x, top + slab + 10, 96, rh - 20); add(() => glow(x + 48, top + slab + 24, 50, '255,210,140', .35 + .05 * sin(t * 13 + k))); disc(x + 48, top + slab + 18, 4, '#fff1c8') }
  c.fillStyle = '#7f7a70'; c.fillRect(1290, sy, 40, top - sy); c.fillStyle = '#2a2620'; c.fillRect(1298, sy, 24, top + slab - sy);
  c.fillStyle = '#8a857a'; c.fillRect(300, sy + 1.6 * M_, 260, 2.2 * M_); c.fillStyle = '#2a2620'; c.fillRect(312, sy + 1.6 * M_ + 18, 236, 2.2 * M_ - 36);
  return { sy, top, slab, rh, M_ };
}
// ---------- corredor do bunker (ponto de fuga) ----------
function corredor(t, o = {}) {
  const vx = 960, vy = 470, bx0 = 850, bx1 = 1070, by0 = 400, by1 = 560, fl = .92 + .08 * sin(t * 37) * sin(t * 11);
  c.fillStyle = '#1a1814'; c.fillRect(0, 0, W, H);
  poly([[0, 0], [W, 0], [bx1, by0], [bx0, by0]], '#4a463c'); poly([[0, H], [W, H], [bx1, by1], [bx0, by1]], '#3a3428');
  poly([[0, 0], [bx0, by0], [bx0, by1], [0, H]], '#57513f'); poly([[W, 0], [bx1, by0], [bx1, by1], [W, H]], '#4b4636');
  c.fillStyle = '#2e2a22'; c.fillRect(bx0, by0, bx1 - bx0, by1 - by0); c.fillStyle = o.door ? '#3a3020' : '#463e2c'; c.fillRect(930, 440, 60, 120); if (o.door) { add(() => glow(960, 560, 60, '255,210,140', .4)); c.fillStyle = '#ffd890'; c.fillRect(932, 556, 56, 3) }
  for (const s of [.18, .42, .66]) { const xl = lerp(0, bx0, s), xr = lerp(W, bx1, s), yt = lerp(0, by0, s), yb = lerp(H, by1, s); c.fillStyle = 'rgba(20,18,14,.3)'; c.fillRect(xl - 2, yt, 4, yb - yt); c.fillRect(xr - 2, yt, 4, yb - yt); if (s < .5) { poly([[xl + 30 * (1 - s), yt + 120 * (1 - s)], [xl + 120 * (1 - s), yt + 140 * (1 - s)], [xl + 120 * (1 - s), yb - 10], [xl + 30 * (1 - s), yb]], '#3a3428') } }
  c.strokeStyle = '#2a261e'; c.lineWidth = 6; for (const d of [40, 70]) { c.beginPath(); c.moveTo(W, d); c.lineTo(bx1, by0 + d * .12); c.stroke() }
  for (const s of [.12, .38, .62, .82]) { const y = lerp(0, by0, s), r = 26 * (1 - s) + 4; c.strokeStyle = '#2a261e'; c.lineWidth = 2; c.beginPath(); c.moveTo(vx, y - 30 * (1 - s)); c.lineTo(vx, y); c.stroke(); add(() => glow(vx, y + r * .5, r * 9, '255,214,150', .22 * fl)); disc(vx, y + r * .5, r * .55, `rgba(255,241,200,${fl})`) }
  c.fillStyle = `rgba(0,0,0,${.12 * (1 - fl) * 6})`; c.fillRect(0, 0, W, H);
}
// ---------- mesa de mapas ----------
function mesaMapa(t, o = {}) {
  c.fillStyle = '#26221b'; c.fillRect(0, 0, W, H); c.fillStyle = '#2e2920'; c.fillRect(0, 0, W, 520);
  add(() => glow(960, 560, 700, '255,210,140', .18)); c.strokeStyle = '#14120e'; c.lineWidth = 3; c.beginPath(); c.moveTo(960, 0); c.lineTo(960, 210); c.stroke(); poly([[900, 210], [1020, 210], [990, 180], [930, 180]], '#3a3428'); add(() => glow(960, 230, 120, '255,224,160', .5));
  c.globalAlpha = .9; poly([[960, 220], [1500, 820], [420, 820]], 'rgba(255,224,160,.06)'); c.globalAlpha = 1;
  if (o.atras) o.atras();
  poly([[360, 620], [1560, 620], [1700, 900], [220, 900]], '#4a3a26'); poly([[440, 630], [1480, 630], [1590, 870], [330, 870]], '#c9b58a');
  c.strokeStyle = 'rgba(80,90,90,.5)'; c.lineWidth = 4; c.beginPath(); c.moveTo(1180, 630); c.quadraticCurveTo(1150, 760, 1220, 870); c.stroke(); disc(960, 740, 9, '#5a3020');
  const q = rng(12); for (let i = 0; i < 18; i++) { const x = 500 + q() * 950, y = 650 + q() * 200, k = q(), a = o.fade ? 1 - ramp(t, o.fade + i * .08, o.fade + .4 + i * .08) : 1; c.globalAlpha = .25 + .75 * a; c.fillStyle = k < .6 ? '#1c1c20' : VERM; c.fillRect(x, y, 26, 14); if (a < .5) { c.strokeStyle = '#1c1c20'; c.lineWidth = 2; c.strokeRect(x, y, 26, 14) } c.globalAlpha = 1 }
  c.fillStyle = '#2a2219'; c.fillRect(220, 900, 1480, 200);
}
function front(x, y, h, o) { const s = h / 100; c.save(); c.translate(x, y); c.scale(s, s); poly([[-14, -40], [-12, -82], [12, -82], [14, -40]], o.coat); c.fillStyle = o.skin || '#c99a74'; c.fillRect(-3, -88, 6, 6); disc(0, -95, 8, o.skin || '#c99a74'); c.fillStyle = o.hair || '#2a2018'; c.beginPath(); c.arc(0, -96, 8.4, PI, 0); c.fill(); if (o.cap) { c.fillStyle = o.cap; c.fillRect(-11, -103, 22, 4); c.beginPath(); c.ellipse(0, -104, 9, 4, 0, PI, 0); c.fill() } c.restore() }
// ---------- objetos no escuro ----------
function escuro(rgb = '217,150,70', a = .12, x = 960, y = 540) { c.fillStyle = '#0b0a0c'; c.fillRect(0, 0, W, H); add(() => glow(x, y, 760, rgb, a)) }
function folha(x, y, w, h, rot, cor = '#efe5c8') { c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(-w / 2 + 14, -h / 2 + 18, w, h); c.fillStyle = bands(-w / 2, 0, w / 2, 0, [[.72, cor], [1, '#d6c9a6']]); c.fillRect(-w / 2, -h / 2, w, h); return () => c.restore() }
function carimbo(x, y, str, st, rot = -.2, cor = FERRUGEM) { if (st <= 0) return; const sc = 1 + 1.2 * (1 - eo(ramp(st, 0, .18))); c.save(); c.translate(x, y); c.rotate(rot); c.scale(sc, sc); c.globalAlpha = .9 * ramp(st, 0, .1); c.font = `800 96px ${FONTE}`; const w = c.measureText(str).width + 60; c.strokeStyle = cor; c.lineWidth = 9; c.strokeRect(-w / 2, -66, w, 132); c.textAlign = 'center'; c.fillStyle = cor; c.fillText(str, 0, 34); c.restore() }
function relogio(cx, cy, R, sec, rv = 1) {
  c.save(); c.globalAlpha = rv; disc(cx, cy, R * 1.08, '#3a2c1c'); c.fillStyle = bands(cx - R * 1.06, 0, cx + R * 1.06, 0, [[.32, '#2a2016'], [.64, '#6b5230'], [1, '#2f2418']]); c.beginPath(); c.arc(cx, cy, R * 1.05, 0, 7); c.fill(); disc(cx, cy, R, '#141210'); disc(cx, cy, R * .94, '#191613');
  for (let i = 0; i < 60; i++) { c.save(); c.translate(cx, cy); c.rotate(i / 60 * 2 * PI); c.fillStyle = i % 5 ? '#8a7448' : '#d9b35a'; c.fillRect(-(i % 5 ? 1.5 : 3.5), -R * .9, i % 5 ? 3 : 7, i % 5 ? 14 : 34); c.restore() }
  const mins = sec / 60, hand = (ang, len, wd, col) => { c.save(); c.translate(cx, cy); c.rotate(ang); poly([[-len * .14, -wd / 2], [len, -wd * .2], [len, wd * .2], [-len * .14, wd / 2]], col); c.restore() };
  hand(((mins / 60) % 12) / 12 * 2 * PI - PI / 2, R * .5, 22, '#e6d3a0'); hand(((mins % 60) / 60) * 2 * PI - PI / 2, R * .78, 14, CREME); hand(((sec % 60) / 60) * 2 * PI - PI / 2, R * .86, 4, OURO); disc(cx, cy, 16, '#d9b35a'); disc(cx, cy, 7, '#14161d'); c.restore();
}
function vela(x, y, h, t, i, a = 1) { c.save(); c.globalAlpha = a; c.fillStyle = bands(x - 16, 0, x + 16, 0, [[.4, '#e8dcc0'], [1, '#bfb293']]); c.fillRect(x - 16, y - h, 32, h); disc(x, y - h, 16, '#f2ead6'); c.fillStyle = '#14120e'; c.fillRect(x - 1.5, y - h - 14, 3, 12); const f = 1 + .08 * sin(t * 13 + i * 2); add(() => glow(x, y - h - 26, 90 * f, '255,190,100', .45)); poly([[x, y - h - 54 * f], [x + 9, y - h - 24], [x, y - h - 12], [x - 9, y - h - 24]], '#f09a3e'); poly([[x, y - h - 42 * f], [x + 5, y - h - 24], [x, y - h - 16], [x - 5, y - h - 24]], '#fff1c8'); c.restore() }
// soldado de perfil (para o encontro no Elba)
function soldado(x, y, h, dir, o) { const s = h / 100; c.save(); c.translate(x, y); c.scale(s * dir, s);
  poly([[-7, 0], [-2, 0], [0, -44], [-8, -44]], o.legs); poly([[3, 0], [9, 0], [6, -44], [-1, -44]], o.dark);
  poly([[-12, -40], [-10, -84], [10, -84], [12, -40]], o.coat); poly([[2, -40], [3, -84], [10, -84], [12, -40]], o.dark);
  poly([[6, -80], [12, -80], [30, -58], [27, -54]], o.coat); disc(29, -56, 4, o.skin || '#c99a74');
  c.fillStyle = o.skin || '#c99a74'; c.fillRect(-3, -90, 7, 7); disc(1, -96, 8, o.skin || '#c99a74'); disc(-2, -98, 8, o.hair || '#2a2018');
  if (o.capacete) { c.fillStyle = o.capacete; c.beginPath(); c.ellipse(0, -100, 12, 9, 0, PI, 0); c.fill(); c.fillRect(-13, -101, 26, 3) } else { c.fillStyle = o.boina || '#4a4a32'; c.fillRect(-9, -106, 18, 6) }
  c.strokeStyle = '#2a2018'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-10, -82); c.lineTo(-14, -30); c.stroke(); c.restore() }
function multidao(t, seed, n, y0, h0, sc, flags) { const q = rng(seed), P = []; for (let i = 0; i < n; i++) P.push([q() * (W + 200) - 100, y0 + q() * 160, h0 * (.8 + q() * .4), q()]); P.sort((a, b) => a[1] - b[1]); P.forEach(([x, y, h, k], i) => { const b = Math.abs(sin(t * 4 + i)) * 6 * sc; const cols = [['#27304a', '#1a2136'], ['#9a4a34', '#6c3024'], ['#d8d2bc', '#a9a48e'], ['#3f6a80', '#2a4a5c'], ['#6b7a4a', '#4a5632'], ['#5a4a3a', '#3a3028']][i % 6]; const s = h * (y / 1000) * sc; person(x, y - b, s, { coat: cols[0], dark: cols[1], hair: ['#2a2018', '#5a3a22', '#8a6a3a', '#1c1a18'][i % 4] }); if (flags && k < .3) { const fx = x + s * .175, fy = y - b - s * .46; line(fx, fy, fx, fy - s * .9, '#3a3028', 3); poly([[fx, fy - s * .9], [fx + s * .4, fy - s * .82 + sin(t * 6 + i) * 4], [fx + s * .4, fy - s * .6 + sin(t * 6 + i) * 4], [fx, fy - s * .66]], [VERM, CREME, AZUL][i % 3]) } else if (k > .85) disc(x + s * .175, y - b - s * .46, s * .08, '#2a2620') }) }

// ===================== CENAS =====================
// --- 1: Berlim em ruínas, abril de 1945 ---
shot(CUTS[0], CUTS[1], (tl, t) => {
  const z = 1 + .06 * ease(ramp(tl, 0, 10.4)); c.save(); c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2);
  c.fillStyle = lg(0, 0, 0, 760, SKY_DUSK); c.fillRect(0, 0, W, H); sunGlow(1420, 640, 520, '255,170,90', .9);
  cloudsBand(5, 6, 120, 380, 50, 100, '150,110,100', .5, t * 4);
  smoke(420, 600, 620, t, 1, '74,66,62', 1.4); smoke(1180, 620, 560, t, 2, '84,74,68', 1.1);
  skyline(11, 720, 16, 120, 260, ['#3a2e2a', '#2e2522'], t, { fire: 1 }); skyline(12, 860, 12, 160, 340, ['#24201d', '#1b1816'], t, { fire: 1 });
  c.fillStyle = '#16130f'; c.fillRect(0, 860, W, H - 860); rubble(-40, 900, 900, 90, 3, ['#211c17', '#2c261f']); rubble(1000, 900, 1000, 70, 4, ['#211c17', '#2c261f']);
  c.restore();
  typeText(tl, TX, TY, 'BERLIM · ABRIL DE 1945', 1.2, 10.0, { sub: 'CAPITAL DA ALEMANHA NAZISTA' });
});
// --- 2: os bombardeios ---
shot(CUTS[1], CUTS[2], (tl, t) => {
  c.fillStyle = lg(0, 0, 0, 900, [[0, '#4a4a52'], [.7, '#8a7a66'], [1, '#b49a72']]); c.fillRect(0, 0, W, H);
  for (let k = 0; k < 7; k++) bomber(-300 + (tl * 160 + k * 230) % 2400, 110 + (k % 3) * 60, .55 + (k % 2) * .1, 'rgba(30,28,30,.8)');
  facade(80, 960, 420, 760, 21, { holeCol: '#b9a282' }); facade(560, 960, 360, 620, 22, { col: '#5e5444', holeCol: '#a8936f' }); facade(1260, 960, 520, 820, 23, { col: '#625646', holeCol: '#b9a282' });
  smoke(980, 820, 600, t, 6, '96,86,78', 1.1);
  c.fillStyle = '#2a241d'; c.fillRect(0, 940, W, H - 940); rubble(380, 960, 600, 130, 8, ['#4a3e30', '#5a4c3a']); rubble(1100, 960, 500, 100, 9, ['#4a3e30', '#5a4c3a']);
  const cx = 1180 - tl * 30; person(cx, 1060, 260, { coat: '#5a4038', dark: '#3c2a24', hair: '#8a7a6a' }); c.fillStyle = '#3a3026'; c.fillRect(cx - 220, 960, 170, 60); disc(cx - 190, 1030, 22, '#2a221a'); disc(cx - 80, 1030, 22, '#2a221a'); line(cx - 50, 980, cx - 18, 1010, '#3a3026', 6);
  typeText(tl, TX, TY, 'BOMBARDEIOS', .3, 3.5, { sub: 'BAIRROS INTEIROS DESTRUÍDOS' });
});
// --- 3: pelo leste, o Exército Vermelho ---
shot(CUTS[2], CUTS[3], (tl, t) => {
  const P = mapa(.95, 900, 540);
  for (let k = 0; k < 4; k++) { const [x0, y0] = P(760, -140 + k * 110), [x1, y1] = P(150, -80 + k * 60); arrow(x0, y0, x1, y1, eo(ramp(tl, .2 + k * .2, 2.6 + k * .2)), VERM, 34) }
  label(1300, 860, 'EXÉRCITO VERMELHO', { size: 64, col: '#e0705a', a: ramp(tl, .6, 1.0) }); label(1300, 910, 'O MAIOR EXÉRCITO DA GUERRA', { size: 36, a: ramp(tl, 1.0, 1.4), w: 600 });
  typeText(tl, TX, TY, 'FRENTE LESTE', .3, 3.7, { sub: 'ABRIL DE 1945' });
});
// --- 4: debaixo da cidade ---
shot(CUTS[3], CUTS[4], (tl, t) => {
  const u = ease(ramp(tl, .4, 5.4)); c.save(); c.translate(0, lerp(260, -40, u)); bunkerCorte(t); c.restore();
  typeText(tl, TX, TY, 'DEBAIXO DA CIDADE', .5, 5.8, { sub: 'O ABRIGO DE HITLER' });
});
// --- 5: CAPÍTULO 1 — o bunker em corte, 8 m abaixo do jardim ---
shot(CUTS[4], CUTS[5], (tl, t) => {
  c.save(); c.translate(0, -40); const B = bunkerCorte(t);
  const x = 1500, y0 = B.sy, y1 = B.top + B.slab + B.rh, g = eo(ramp(tl, 4.6, 5.6));
  dim(x, y0, x, lerp(y0, y1, g), OURO, ramp(tl, 4.5, 4.7)); label(x + 30, (y0 + y1) / 2 + 20, '8 m', { size: 90, col: OURO, a: ramp(tl, 4.7, 5.0) }); label(x + 30, (y0 + y1) / 2 + 64, 'DE PROFUNDIDADE', { size: 32, a: ramp(tl, 5.0, 5.3), w: 600 });
  label(560, B.top + 70, 'LAJE DE CONCRETO', { size: 34, col: '#2a2620', a: ramp(tl, 2.0, 2.3), w: 800, sh: 0 }); label(1320, B.sy - 210, 'JARDIM DA CHANCELARIA', { size: 34, a: ramp(tl, 6.1, 6.4), w: 600 });
  c.restore();
  typeText(tl, TX, TY, 'FÜHRERBUNKER', 1.8, 8.0, { sub: 'O ABRIGO DESDE JANEIRO DE 1945' });
  chapter(tl, 1, 'O BUNKER');
});
// --- 6: salas pequenas, luz dia e noite, geradores ---
shot(CUTS[5], CUTS[6], (tl, t) => {
  const z = 1 + .08 * ease(ramp(tl, 0, 7.3)); c.save(); c.translate(W / 2, 470); c.scale(z, z); c.translate(-W / 2, -470); corredor(t); fardado(1290, 900, 430, SS_PRETO2, t); c.restore();
  typeText(tl, TX, TY, 'LUZ ELÉTRICA DIA E NOITE', .4, 7.0, { sub: 'E O BARULHO DOS GERADORES' });
});
// --- 7: exércitos que quase não existem ---
shot(CUTS[6], CUTS[7], (tl, t) => {
  mesaMapa(tl, { fade: 2.2, atras: () => { fardado(560, 930, 560, GENERAL, t); fardado(1370, 930, 560, SS_PRETO, t); fardado(1620, 950, 540, GENERAL2, t); fardado(960, 960, 600, HITLER_F, t, { curvado: 1 }) } });
  person(300, 1180, 420, SS_COSTAS);
  typeText(tl, TX, TY, 'EXÉRCITOS NO PAPEL', .3, 4.4, { sub: 'QUE JÁ QUASE NÃO EXISTEM' });
});
// --- 8: 56 anos, curvado ---
shot(CUTS[7], CUTS[8], (tl, t) => {
  corredor(t); const zz = 1 + .04 * tl; fardado(860, 1720 + tl * 6, 1250 * zz, HITLER_F, t, { curvado: 1, treme: 1 });
  label(1380, 520, '56', { size: 260, col: OURO, a: ramp(tl, .1, .4) }); label(1390, 580, 'ANOS', { size: 60, a: ramp(tl, .2, .5) });
});
// --- 9: a mão esquerda treme ---
shot(CUTS[8], CUTS[9], (tl, t) => {
  c.fillStyle = '#c9b58a'; c.fillRect(0, 0, W, H); add(() => glow(1100, 400, 900, '255,214,150', .25));
  c.strokeStyle = 'rgba(80,90,90,.45)'; c.lineWidth = 6; c.beginPath(); c.moveTo(1500, 0); c.quadraticCurveTo(1380, 500, 1560, H); c.stroke(); c.strokeStyle = 'rgba(60,50,40,.25)'; c.lineWidth = 2; for (let k = 0; k < 12; k++) { c.beginPath(); c.moveTo(0, k * 100); c.lineTo(W, k * 100 + 40); c.stroke() }
  const tr = ramp(tl, 1.4, 2.0), dx = sin(t * 38) * 5 * tr + sin(t * 23) * 3 * tr, dy = cos(t * 31) * 4 * tr;
  c.save(); c.translate(dx, dy); c.fillStyle = 'rgba(40,30,20,.25)'; c.beginPath(); c.ellipse(1010, 690, 330, 110, -.15, 0, 7); c.fill();
  poly([[-60, 360], [700, 420], [720, 700], [-60, 760]], '#55563f'); poly([[-60, 360], [700, 420], [706, 500], [-60, 470]], '#6a6b52'); c.fillStyle = '#3e3f30'; c.fillRect(640, 410, 70, 300);
  disc(668, 470, 10, '#9a8a5a'); disc(668, 640, 10, '#9a8a5a');
  poly([[700, 450], [960, 430], [1080, 470], [1120, 600], [1010, 690], [720, 690]], '#d2a882'); poly([[720, 600], [1010, 690], [1120, 600], [1060, 640], [740, 650]], '#b98d68');
  const fing = [[1080, 470, -.05, 230], [1110, 530, .06, 250], [1115, 590, .18, 230], [1090, 640, .32, 190]];
  fing.forEach(([x, y, a, L], i) => { c.save(); c.translate(x - 30, y); c.rotate(a + .04 * sin(t * 40 + i) * tr); pill(L / 2, 0, L, 54, i % 2 ? '#c99d78' : '#d2a882'); pill(L * .88, -6, 30, 30, '#e4c4a4'); c.fillStyle = 'rgba(120,80,50,.35)'; c.fillRect(L * .38, -26, 4, 52); c.fillRect(L * .66, -24, 4, 48); c.restore() });
  c.save(); c.translate(860, 430); c.rotate(-.55); pill(90, 0, 200, 64, '#c99d78'); pill(170, -4, 34, 34, '#e4c4a4'); c.restore();
  c.restore();
  label(TX, 200, 'A MÃO ESQUERDA', { size: 60, col: '#2a2620', a: ramp(tl, .3, .6), sh: 0 }); label(TX, 268, 'TREME SEM PARAR', { size: 60, col: '#8a3a20', a: ramp(tl, .5, .8), sh: 0 });
});
// --- 10: CAPÍTULO 2 — 16 de abril, o ataque a partir do Oder ---
shot(CUTS[9], CUTS[10], (tl, t) => {
  const P = mapa(2.4, 980, 560);
  for (let k = 0; k < 6; k++) { const [x0, y0] = P(330, -130 + k * 55), [x1, y1] = P(40 + (k % 3) * 6, -40 + k * 16); arrow(x0, y0, x1, y1, eo(ramp(tl, 2.0 + k * .15, 6.5 + k * .15)), VERM, 30) }
  const [ox] = P(78, 0), [bx, by] = P(0, 0); const g = eo(ramp(tl, 9.6, 10.6)); dim(bx, by + 120, lerp(bx, ox, g), by + 120, OURO, ramp(tl, 9.5, 9.7)); label((bx + ox) / 2, by + 196, '< 100 km', { size: 72, col: OURO, align: 'center', a: ramp(tl, 9.8, 10.1) });
  label(1300, 740, '2,5 MILHÕES', { size: 120, a: ramp(tl, 3.2, 3.5) }); label(1300, 800, 'DE SOLDADOS SOVIÉTICOS', { size: 42, col: '#e0705a', a: ramp(tl, 3.6, 3.9), w: 600 });
  typeText(tl, TX, TY, '16 DE ABRIL DE 1945', 1.8, 12.2, { sub: 'COMEÇA A BATALHA DE BERLIM' });
  chapter(tl, 2, 'O CERCO');
});
// --- 11: 20 de abril, a artilharia chega à cidade ---
shot(CUTS[10], CUTS[11], (tl, t) => {
  c.fillStyle = lg(0, 0, 0, 800, [[0, '#14141e'], [.6, '#3a2a30'], [1, '#7a4a3a']]); c.fillRect(0, 0, W, H);
  const q = rng(20), bursts = []; for (let i = 0; i < 16; i++) bursts.push([q() * W, 560 + q() * 260, q() * 5.6, .6 + q() * .8]);
  bursts.forEach(([x, y, t0, s]) => { const a = tl - t0; if (a < 0 || a > 1.6) return; add(() => glow(x, y, 260 * s * (1 - a / 1.6), '255,170,90', .7 * (1 - a / 1.6))) });
  skyline(31, 780, 14, 100, 240, ['#1c1818', '#141212'], t, { fire: 1 });
  c.fillStyle = '#100e0e'; c.fillRect(0, 860, W, H - 860); poly([[0, 780], [W, 780], [W, 870], [0, 870]], '#100e0e');
  const gx = 960, gy = 860; c.fillStyle = '#0c0b0b'; c.fillRect(gx - 260, gy - 200, 520, 40); c.fillRect(gx - 240, gy - 160, 480, 20); for (let k = 0; k < 6; k++) c.fillRect(gx - 230 + k * 88, gy - 140, 30, 140); c.fillRect(gx - 50, gy - 260, 100, 60); poly([[gx - 40, gy - 260], [gx + 40, gy - 260], [gx + 10, gy - 300], [gx - 30, gy - 290]], '#0c0b0b');
  bursts.forEach(([x, y, t0, s]) => { const a = tl - t0; if (a < 0 || a > 1.2) return; const r = 30 + 120 * s * eo(ramp(a, 0, .5)); disc(x, y, r * (1 - ramp(a, .5, 1.2)), `rgba(240,154,62,${1 - ramp(a, .3, 1.2)})`); disc(x, y, r * .55 * (1 - ramp(a, .3, .9)), '#fff1c8') });
  smoke(500, 760, 400, t, 9, '60,52,52', 1.2); smoke(1400, 760, 420, t, 10, '60,52,52', 1);
  typeText(tl, TX, TY, '20 DE ABRIL', .4, 5.4, { sub: 'ANIVERSÁRIO DE HITLER · 56 ANOS' });
});
// --- 12: 22 de abril, a guerra está perdida ---
shot(CUTS[11], CUTS[12], (tl, t) => {
  const sh = ramp(tl, 3.4, 3.7) * (1 - ramp(tl, 6.2, 7)), dx = sin(t * 47) * 6 * sh;
  mesaMapa(tl, { atras: () => { fardado(560, 930, 560, GENERAL2, t); fardado(1360, 930, 560, GENERAL, t); fardado(960 + dx, 950, 620, HITLER_F, t, { treme: sh > 0 }) } });
  person(420, 1180, 430, SS_COSTAS); person(1500, 1180, 430, SS_COSTAS);
  if (tl > 6.3) { c.fillStyle = `rgba(8,8,10,${.65 * ramp(tl, 6.3, 6.8)})`; c.fillRect(0, 0, W, H) }
  label(W / 2, 470, 'A GUERRA', { size: 150, align: 'center', a: ramp(tl, 6.5, 6.9) }); label(W / 2, 620, 'ESTÁ PERDIDA', { size: 150, align: 'center', col: OURO, a: ramp(tl, 6.7, 7.1) });
  label(W / 2, 720, 'ELE DECIDE FICAR EM BERLIM ATÉ O FIM', { size: 46, align: 'center', a: ramp(tl, 9.6, 10.0), w: 600 });
  typeText(tl, TX, TY, '22 DE ABRIL', .4, 6.2, { sub: 'REUNIÃO NO BUNKER' });
});
// --- 13: 25 de abril, Berlim cercada ---
shot(CUTS[12], CUTS[13], (tl, t) => {
  const P = mapa(7, 960, 560); const [bx, by] = P(0, 0), u = eo(ramp(tl, .4, 2.8)), R = 46 * 7 * .9;
  c.strokeStyle = VERM; c.lineWidth = 34; c.lineCap = 'butt'; c.beginPath(); c.arc(bx, by, R, 0 - u * PI, 0); c.stroke(); c.beginPath(); c.arc(bx, by, R, 0, u * PI); c.stroke();
  for (let k = 0; k < 10; k++) { const a = (k / 10) * 2 * PI; if (Math.abs(((a + PI) % (2 * PI)) - PI) > u * PI) continue; arrow(bx + cos(a) * (R + 90), by + sin(a) * (R + 90), bx + cos(a) * (R + 24), by + sin(a) * (R + 24), 1, VERM, 22) }
  label(1360, 600, 'CERCADA', { size: 120, col: OURO, a: ramp(tl, 2.6, 2.9) });
  typeText(tl, TX, TY, '25 DE ABRIL', .3, 3.8, { sub: 'BERLIM FECHADA PELO EXÉRCITO VERMELHO' });
});
// --- 14: no mesmo dia, o encontro no rio Elba ---
shot(CUTS[13], CUTS[14], (tl, t) => {
  c.fillStyle = lg(0, 0, 0, 640, [[0, '#6f8a90'], [.7, '#b7b49a'], [1, '#e2d6b0']]); c.fillRect(0, 0, W, H); sunGlow(1500, 260, 380, '255,240,200', .7); cloudsBand(14, 6, 120, 420, 50, 100, '240,236,214', .5, t * 4);
  c.fillStyle = '#4a5a40'; c.fillRect(0, 600, W, 50); for (let i = 0; i < 40; i++) pill(i * 52, 598, 70, 26, i % 2 ? '#3f4e34' : '#4a5a3a');
  c.fillStyle = bands(0, 640, 0, 840, [[.2, '#8aa0a0'], [.6, '#6f8c90'], [1, '#5a7a80']]); c.fillRect(0, 640, W, 200); for (let i = 0; i < 30; i++) pill((i * 137 + t * 20) % W, 660 + (i * 53) % 170, 80, 4, 'rgba(240,236,214,.3)');
  c.fillStyle = '#2e2a26'; c.fillRect(200, 560, 640, 22); for (let k = 0; k < 6; k++) { line(220 + k * 100, 582, 270 + k * 100, 560, '#2e2a26', 6); line(270 + k * 100, 560, 320 + k * 100, 582, '#2e2a26', 6) } poly([[840, 560], [900, 600], [880, 640], [820, 582]], '#2e2a26'); c.fillRect(260, 582, 30, 80); c.fillRect(640, 582, 30, 80);
  c.fillStyle = '#7a7048'; c.fillRect(0, 820, W, H - 820); c.fillStyle = '#8a8056'; c.fillRect(0, 820, W, 30);
  [[300, 900, 230, AMERICANO], [420, 920, 250, AMERICANO], [1500, 905, 235, SOVIETICO2], [1640, 925, 255, SOVIETICO]].forEach(([x, y, h, f]) => fardado(x, y, h, f, t));
  soldadoPerfil(850, 1070, 440, 1, AMERICANO, t); soldadoPerfil(1070, 1070, 440, -1, SOVIETICO, t);
  label(700, 700, 'EUA', { size: 54, col: '#9fc0d0', align: 'right', a: ramp(tl, .8, 1.1) }); label(1220, 700, 'URSS', { size: 54, col: '#e0705a', a: ramp(tl, .8, 1.1) });
  typeText(tl, TX, TY, 'TORGAU · RIO ELBA', .3, 5.9, { sub: '25 DE ABRIL · AMERICANOS E SOVIÉTICOS SE ENCONTRAM' });
});
// --- 15: a Alemanha partida ao meio ---
shot(CUTS[14], CUTS[15], (tl, t) => {
  const u = ease(ramp(tl, 0, 1.4)); mapa(1.6, 1080, 470, { zonas: u, semNomes: 0 });
  const P = (x, y) => [1080 + x * 1.6, 470 + y * 1.6], [tx, ty] = P(-12, 112); add(() => glow(tx, ty, 80, '240,185,74', .6)); star4(tx, ty, 30, OURO); txt('TORGAU', tx + 30, ty + 50, 34, CREME);
  label(260, 820, 'OESTE', { size: 70, col: '#9fc0d0', a: ramp(tl, .6, 1.0) }); label(1560, 820, 'LESTE', { size: 70, col: '#e0705a', a: ramp(tl, .6, 1.0) });
  label(W / 2, 260, 'A ALEMANHA PARTIDA AO MEIO', { size: 76, align: 'center', a: ramp(tl, .8, 1.2) });
});
// --- 16: CAPÍTULO 3 — os mais próximos se afastam ---
shot(CUTS[15], CUTS[16], (tl, t) => {
  mesaMapa(tl); const sw = sin(t * 1.6) * .06; c.save(); c.translate(960, 0); c.rotate(sw); c.translate(-960, 0); c.restore();
  for (const [x, a] of [[520, 0], [780, 0], [1150, 0], [1420, -1.3]]) { c.save(); c.translate(x, 1000); c.rotate(a); poly([[-50, 0], [50, 0], [44, -40], [-44, -40]], '#3a2c1e'); c.fillStyle = '#2a2016'; c.fillRect(-46, -170, 14, 170); c.fillRect(32, -170, 14, 170); c.fillRect(-46, -170, 92, 30); c.fillRect(-44, 0, 10, 90); c.fillRect(34, 0, 10, 90); c.restore() }
  person(1700 + tl * 60, 1110, 380, SS_COSTAS);
  typeText(tl, TX, TY, 'CADEIRAS VAZIAS', 1.8, 4.8, { sub: 'OS HOMENS MAIS PRÓXIMOS SE AFASTAM' });
  chapter(tl, 3, 'AS TRAIÇÕES');
});
// --- 17: o telegrama de Göring ---
shot(CUTS[16], CUTS[17], (tl, t) => {
  escuro('217,150,70', .12 * ramp(tl, 0, .6), 640, 540); const done = folha(640, 540, 640, 760, -.035);
  txt('TELEGRAMA', -270, -290, 64, '#2a2620'); txt('23 DE ABRIL DE 1945 · 00H56', -270, -240, 30, '#6a5a40', { w: 600 });
  const L = ['DE: HERMANN GÖRING', 'PARA: ADOLF HITLER', '', 'PEÇO PARA ASSUMIR', 'A DIREÇÃO DO REICH', 'SE NÃO HOUVER RESPOSTA', 'ATÉ AS 22 HORAS.']; L.forEach((s, i) => { const n = clamp(Math.floor((tl - .4 - i * .35) * 30), 0, s.length); txt(s.slice(0, n), -270, -150 + i * 54, 40, '#2a2620', { w: i > 2 ? 800 : 600 }) });
  carimbo(10, 260, 'PRISÃO', tl - 6.5);
  done();
  label(1060, 420, 'HERMANN GÖRING', { size: 86, a: ramp(tl, .2, .5) }); label(1060, 480, 'CHEFE DA FORÇA AÉREA', { size: 42, col: OURO, a: ramp(tl, .4, .7), w: 600 });
  label(1060, 640, 'HITLER MANDA PRENDÊ-LO', { size: 60, col: '#e0705a', a: ramp(tl, 6.5, 6.8) });
});
// --- 18: 28 de abril — o rádio e Himmler ---
shot(CUTS[17], CUTS[18], (tl, t) => {
  escuro('217,150,70', .14 * ramp(tl, 0, .6), 600, 560);
  const x = 600, y = 600; c.fillStyle = 'rgba(0,0,0,.4)'; c.beginPath(); c.roundRect(x - 270, y - 300, 560, 600, 60); c.fill();
  c.fillStyle = bands(x - 280, 0, x + 280, 0, [[.15, '#3a2616'], [.6, '#6a4626'], [1, '#4a3020']]); c.beginPath(); c.roundRect(x - 280, y - 320, 560, 600, [180, 180, 30, 30]); c.fill();
  c.fillStyle = '#2a1e14'; c.beginPath(); c.roundRect(x - 210, y - 250, 420, 330, [140, 140, 10, 10]); c.fill(); c.strokeStyle = 'rgba(160,120,80,.35)'; c.lineWidth = 3; for (let k = 0; k < 14; k++) { c.beginPath(); c.moveTo(x - 200 + k * 30, y - 230); c.lineTo(x - 200 + k * 30, y + 70); c.stroke() }
  const on = ramp(tl, .5, 1.2); add(() => glow(x, y + 160, 160, '255,200,120', .5 * on)); c.fillStyle = '#1a1410'; c.fillRect(x - 160, y + 120, 320, 70); c.fillStyle = `rgba(255,214,140,${.3 + .6 * on})`; c.fillRect(x - 150, y + 130, 300, 50); c.fillStyle = '#5a3a20'; for (let k = 0; k < 9; k++) c.fillRect(x - 140 + k * 34, y + 136, 2, 14); c.fillStyle = FERRUGEM; c.fillRect(x - 100 + 140 * ramp(tl, .5, 2.4), y + 130, 5, 50);
  disc(x - 180, y + 230, 34, '#2a1e14'); disc(x + 180, y + 230, 34, '#2a1e14'); disc(x - 180, y + 230, 20, '#5a3a20'); disc(x + 180, y + 230, 20, '#5a3a20');
  if (on > 0) for (let k = 0; k < 3; k++) { const ph = (tl * .9 + k / 3) % 1; c.strokeStyle = `rgba(240,185,74,${.5 * (1 - ph)})`; c.lineWidth = 4; c.beginPath(); c.arc(x + 300, y - 80, 40 + ph * 160, -.7, .7); c.stroke() }
  label(1060, 360, '28 DE ABRIL', { size: 50, col: OURO, a: ramp(tl, .2, .5), w: 600 }); label(1060, 460, 'HEINRICH HIMMLER', { size: 86, a: ramp(tl, 4.6, 4.9) }); label(1060, 520, 'CHEFE DA SS', { size: 42, col: OURO, a: ramp(tl, 6.0, 6.3), w: 600 });
  label(1060, 660, 'NEGOCIAVA COM OS ALIADOS', { size: 60, col: '#e0705a', a: ramp(tl, 6.6, 6.9) }); label(1060, 730, 'ÀS ESCONDIDAS', { size: 60, col: '#e0705a', a: ramp(tl, 7.4, 7.7) });
  typeText(tl, TX, TY, 'UMA RÁDIO INGLESA', .9, 7.6, { sub: 'A NOTÍCIA CHEGA AO BUNKER' });
});
// --- 19: a traição final ---
shot(CUTS[18], CUTS[19], (tl, t) => {
  const z = 1 + .1 * ease(ramp(tl, 0, 6)); c.save(); c.translate(W / 2, 470); c.scale(z, z); c.translate(-W / 2, -470); corredor(t); fardado(960, 900, 400 + tl * 12, HITLER_F, t, { curvado: 1 }); c.restore();
  label(W / 2, 300, 'A TRAIÇÃO FINAL', { size: 110, align: 'center', a: ramp(tl, 2.0, 2.4) * (1 - ramp(tl, 5.4, 5.9)) });
});
// --- 20: CAPÍTULO 4 — o casamento, de madrugada ---
shot(CUTS[19], CUTS[20], (tl, t) => {
  const q = rng(41), sh = [3.3, 7.8].some(b => tl > b && tl < b + .6) ? 4 : 0, dx = sin(t * 50) * sh;
  c.save(); c.translate(dx, 0);
  c.fillStyle = '#4e483a'; c.fillRect(0, 0, W, H); c.fillStyle = '#423c30'; c.fillRect(0, 0, W, 120); c.fillStyle = '#3a3428'; c.fillRect(0, 760, W, H - 760);
  c.fillStyle = '#2a2219'; c.fillRect(1380, 250, 260, 200); c.fillStyle = '#5a4a32'; c.fillRect(1395, 265, 230, 170); c.fillStyle = '#3a4a42'; c.fillRect(1410, 280, 200, 140);
  const sw = sin(t * 1.8) * .05 * (1 + sh); c.save(); c.translate(960, 0); c.rotate(sw); c.strokeStyle = '#14120e'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 180); c.stroke(); add(() => glow(0, 196, 500, '255,214,150', .25)); disc(0, 196, 14, '#fff1c8'); c.restore();
  fardado(250, 900, 430, PARTIDO, t); c.fillStyle = '#3a2c1e'; c.fillRect(90, 680, 400, 30); c.fillRect(110, 710, 20, 160); c.fillRect(450, 710, 20, 160); folha(290, 668, 180, 24, 0, '#efe5c8')();
  fardado(640, 1060, 480, PARTIDO, t); fardado(1500, 1060, 470, GOEBBELS, t); fardado(880, 1070, 500, HITLER_F, t, { curvado: 1 }); mulher(1110, 1070, 470, { vestido: '#16161c' }, t);
  if (sh) for (let i = 0; i < 30; i++) disc(q() * W, ((q() * 800) + (tl % 1) * 300) % 760, 2 + q() * 3, 'rgba(200,190,170,.7)');
  c.restore();
  label(1110, 540, 'EVA BRAUN', { size: 58, align: 'center', a: ramp(tl, 6.9, 7.2) * (1 - ramp(tl, 10.6, 11)) });
  typeText(tl, TX, TY, '29 DE ABRIL · MADRUGADA', 1.8, 11.2, { sub: 'OS SOVIÉTICOS A POUCOS QUARTEIRÕES' });
  chapter(tl, 4, 'O FIM');
});
// --- 21: o testamento, na máquina de escrever ---
shot(CUTS[20], CUTS[21], (tl, t) => {
  escuro('217,150,70', .14 * ramp(tl, 0, .6), 820, 520);
  const done = folha(820, 400, 700, 760, -.02); txt('TESTAMENTO POLÍTICO', -300, -300, 54, '#2a2620'); txt('29 DE ABRIL DE 1945 · 4H00', -300, -252, 28, '#6a5a40', { w: 600 });
  const L = [['', 0], ['CULPA OS JUDEUS PELA GUERRA', 4.3], ['', 0], ['EXPULSA GÖRING E HIMMLER', 6.5], ['', 0], ['SUCESSOR:', 8.5], ['ALMIRANTE KARL DÖNITZ', 8.8]];
  c.fillStyle = 'rgba(42,38,32,.3)'; for (let k = 0; k < 2; k++) c.fillRect(-300, -190 + k * 30, 420 + k * 120, 9);
  L.forEach(([s, t0], i) => { if (!s) return; const n = clamp(Math.floor((tl - t0) * 26), 0, s.length); txt(s.slice(0, n), -300, -100 + i * 52, 42, i >= 5 ? '#8a5a10' : '#2a2620') });
  done();
  c.fillStyle = bands(400, 0, 1300, 0, [[.2, '#16161a'], [.8, '#2a2a30'], [1, '#1c1c22']]); c.beginPath(); c.roundRect(380, 700, 900, 320, 40); c.fill(); c.fillStyle = '#0e0e12'; c.fillRect(340, 690, 980, 40); disc(330, 710, 34, '#2a2a30'); disc(1330, 710, 34, '#2a2a30');
  const q = rng(5); for (let r = 0; r < 4; r++) for (let k = 0; k < 11; k++) { const x = 470 + k * 70 + r * 16, y = 800 + r * 52, down = Math.floor(t * 14 + k * 3 + r * 5) % 9 === 0 && tl > .5; disc(x, y + (down ? 4 : 0), 20, '#0c0c0e'); disc(x, y - 3 + (down ? 4 : 0), 16, '#d8d0bc') }
  label(1380, 470, 'A GUERRA FOI', { size: 56, a: ramp(tl, 6.0, 6.3) }); label(1380, 530, 'COMEÇADA POR ELE', { size: 56, col: OURO, a: ramp(tl, 6.3, 6.6) });
  typeText(tl, 1380, 330, 'DITADO A UMA', 1.2, 5.6, { size: 54, sub: 'SECRETÁRIA' });
});
// --- 22: 30 de abril, 15h30 ---
shot(CUTS[21], CUTS[22], (tl, t) => {
  c.fillStyle = '#08080b'; c.fillRect(0, 0, W, H);
  if (tl < 3.9) { // calendário de parede: abril de 1945 (dia 1 foi domingo)
    const rv = ramp(tl, 0, .8), zz = 1 + .5 * ease(ramp(tl, 3.2, 3.9)), [cx30, cy30] = [960 - 330 + 47, 300 + 5 * 92 + 120];
    add(() => glow(960, 520, 700, '217,150,70', .14 * rv)); c.save(); c.globalAlpha = rv; c.translate(cx30, cy30); c.scale(zz, zz); c.translate(-cx30, -cy30);
    c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(612, 92, 720, 950); c.fillStyle = bands(600, 0, 1320, 0, [[.8, '#efe5c8'], [1, '#d6c9a6']]); c.fillRect(600, 80, 720, 950);
    c.fillStyle = '#7a2a20'; c.fillRect(600, 80, 720, 150); disc(760, 80, 12, '#2a2620'); disc(1160, 80, 12, '#2a2620');
    txt('ABRIL', 960, 190, 104, '#efe5c8', { align: 'center', sh: 0 }); txt('1945', 1240, 190, 44, '#e6c9a0', { align: 'right', w: 600, sh: 0 });
    ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'].forEach((d, i) => txt(d, 680 + i * 94, 280, 30, i === 6 ? '#8a3a20' : '#6a5a40', { align: 'center', w: 600, sh: 0 }));
    for (let d = 1; d <= 30; d++) { const k = d + 5, col = k % 7, row = Math.floor(k / 7), x = 680 + col * 94, y = 300 + row * 92 + 70; txt(String(d), x, y, 52, col === 6 ? '#8a3a20' : '#2a2620', { align: 'center', sh: 0 });
      const xd = ramp(tl, .4 + (d - 1) * .075, .5 + (d - 1) * .075); if (d < 30 && xd > 0) { c.strokeStyle = `rgba(90,80,70,${.7 * xd})`; c.lineWidth = 4; c.beginPath(); c.moveTo(x - 26, y - 44); c.lineTo(x - 26 + 52 * xd, y + 4 - 48 * (1 - xd)); c.stroke() } }
    const ci = ramp(tl, 2.8, 3.4); if (ci > 0) { c.strokeStyle = OURO; c.lineWidth = 7; c.beginPath(); c.arc(680, 300 + 5 * 92 + 52, 46, -PI / 2, -PI / 2 + ci * 2 * PI); c.stroke() }
    c.restore();
  } else {
    const t2 = tl - 3.9, rv = ramp(t2, 0, .5); add(() => glow(960, 520, 640, '217,150,70', .14 * rv));
    relogio(960, 520, 300, 15 * 3600 + 28 * 60 + 30 + Math.min(t2, 2.2) * 50 + Math.max(0, t2 - 2.2), rv);
    label(W / 2, 150, 'SEGUNDA-FEIRA, 30 DE ABRIL DE 1945', { size: 50, align: 'center', col: PALHA, a: rv, w: 600 }); label(W / 2 + 420, 560, '15H30', { size: 96, col: OURO, a: ramp(t2, 1.6, 2.0) });
  }
});
// --- 23: a porta fechada ---
shot(CUTS[22], CUTS[23], (tl, t) => {
  const z = 1.2 + .12 * ease(ramp(tl, 0, 4)); c.save(); c.translate(W / 2, 500); c.scale(z, z); c.translate(-W / 2, -500); corredor(t, { door: 1 }); c.restore();
  c.fillStyle = `rgba(0,0,0,${.3 * ramp(tl, 2.6, 4)})`; c.fillRect(0, 0, W, H);
});
// --- 24: o jardim da Chancelaria ---
shot(CUTS[23], CUTS[24], (tl, t) => {
  c.fillStyle = lg(0, 0, 0, 760, [[0, '#2a2a34'], [.6, '#5a4a4a'], [1, '#9a6a4a']]); c.fillRect(0, 0, W, H); smoke(300, 700, 600, t, 13, '70,62,60', 1.2);
  poly([[0, 740], [0, 420], [180, 380], [320, 430], [520, 360], [700, 420], [900, 390], [900, 740]], '#2a2420'); for (let k = 0; k < 5; k++) { c.fillStyle = '#14110e'; c.fillRect(80 + k * 160, 470, 60, 110) }
  c.fillStyle = '#4a4232'; c.fillRect(0, 740, W, H - 740); c.fillStyle = '#3a3226'; c.fillRect(0, 740, W, 20);
  for (const [x, y, r] of [[300, 860, 90], [700, 930, 60], [1500, 880, 110]]) { c.fillStyle = '#2a2219'; c.beginPath(); c.ellipse(x, y, r * 1.8, r * .45, 0, 0, 7); c.fill() }
  for (const [x, h] of [[1700, 260], [1820, 200]]) { c.fillStyle = '#241f1a'; c.fillRect(x, 740 - h, 14, h); poly([[x + 7, 740 - h], [x - 60, 740 - h - 40], [x - 50, 740 - h - 46], [x + 7, 740 - h - 14]], '#241f1a') }
  c.fillStyle = '#6a665c'; c.fillRect(1040, 560, 220, 200); c.fillStyle = '#7a766a'; c.fillRect(1180, 380, 90, 180); poly([[1172, 380], [1278, 380], [1225, 300], ], '#5a564c'); c.fillStyle = '#14110e'; c.fillRect(1080, 640, 70, 120);
  const fx = 900, fy = 880; add(() => glow(fx, fy - 40, 260, '255,150,60', .5)); for (let k = 0; k < 7; k++) { const h = 90 + 40 * sin(t * 7 + k * 1.7); poly([[fx - 140 + k * 40, fy], [fx - 120 + k * 40, fy - h], [fx - 100 + k * 40, fy]], k % 2 ? '#f09a3e' : '#d9662e') } smoke(fx, fy - 80, 640, t, 14, '50,44,42', 1.3, .4);
  for (const x of [1300, 1350]) { c.fillStyle = '#4a5038'; c.fillRect(x, 880, 44, 64); c.fillStyle = '#3a4028'; c.fillRect(x + 30, 880, 14, 64); c.fillRect(x + 8, 868, 26, 12) }
  typeText(tl, TX, TY, 'JARDIM DA CHANCELARIA', .4, 6.0, { sub: '30 DE ABRIL · FIM DA TARDE' });
});
// --- 25: o Reichstag e a bandeira vermelha ---
shot(CUTS[24], CUTS[25], (tl, t) => {
  c.fillStyle = lg(0, 0, 0, 900, SKY_NIGHT); c.fillRect(0, 0, W, H); stars(.3, t);
  const q = rng(25); for (let i = 0; i < 5; i++) { const x = 200 + q() * 1500, t0 = q() * 6, a = ((tl + t0) % 7) / 7, y = 120 + a * 300; add(() => glow(x, y, 180, '255,214,140', .35 * (1 - a))); disc(x, y, 6, `rgba(255,241,200,${1 - a})`) }
  add(() => glow(960, 900, 900, '240,120,50', .25)); smoke(300, 860, 600, t, 17, '50,40,40', 1.3); smoke(1600, 860, 600, t, 18, '50,40,40', 1.2, -1);
  const X0 = 300, X1 = 1620, Y = 860, col = '#16141a', col2 = '#211d22';
  c.fillStyle = col; c.fillRect(X0, Y - 330, X1 - X0, 330); c.fillStyle = col2; c.fillRect(X0, Y - 330, X1 - X0, 24);
  for (const x of [X0 - 30, X1 - 150]) { c.fillStyle = col; c.fillRect(x, Y - 440, 180, 440); c.fillStyle = col2; c.fillRect(x, Y - 440, 180, 20) }
  poly([[740, Y - 330], [1180, Y - 330], [960, Y - 440]], col); for (let k = 0; k < 6; k++) { c.fillStyle = '#0c0b0e'; c.fillRect(770 + k * 70, Y - 320, 18, 240) } c.fillStyle = col; c.fillRect(740, Y - 80, 440, 80);
  c.strokeStyle = '#1e1b20'; c.lineWidth = 8; for (let k = 0; k <= 8; k++) { c.beginPath(); c.ellipse(960, Y - 330, 210 * Math.cos(k / 8 * PI - PI / 2), 190, 0, PI, 0); c.stroke() } c.beginPath(); c.moveTo(750, Y - 330); c.lineTo(1170, Y - 330); c.stroke(); c.beginPath(); c.ellipse(960, Y - 400, 180, 30, 0, PI, 0); c.stroke();
  for (let k = 0; k < 40; k++) { const x = X0 + q() * (X1 - X0), y = Y - 300 + q() * 260; if (q() < .3) c.fillStyle = `rgba(240,140,60,${.5 + .5 * sin(t * 8 + k)})`; else continue; c.fillRect(x, y, 14, 22) }
  const fx = X1 - 60, fy = Y - 440, up = eo(ramp(tl, 6.0, 7.0)); disc(fx - 30, fy - 30, 14, '#0c0b0e'); c.fillStyle = '#0c0b0e'; c.fillRect(fx - 40, fy - 20, 22, 20);
  line(fx, fy, fx, fy - 140 * up, '#2a2420', 7); if (up > 0) { c.save(); c.translate(fx, fy - 140 * up); c.scale(1.05, 1.05); const wv = (y) => sin(t * 6 + y * .05) * 8; poly([[0, 0], [130, wv(0)], [130, 80 + wv(80)], [0, 80]], '#c8452f'); star4(26, 20, 12, '#f0c050'); c.restore() }
  for (let k = 0; k < 3; k++) fardado(fx - 96 + k * 30, fy, 52, k === 1 ? SOVIETICO : SOVIETICO2, t);
  typeText(tl, TX, TY, 'REICHSTAG', .3, 10.4, { sub: 'NOITE DE 30 DE ABRIL' });
});
// --- 26: 1º de maio — seis velas ---
shot(CUTS[25], CUTS[26], (tl, t) => {
  c.fillStyle = '#08080b'; c.fillRect(0, 0, W, H); c.fillStyle = '#121014'; c.fillRect(0, 760, W, H - 760);
  for (let i = 0; i < 6; i++) vela(560 + i * 160, 820, 140 + ((i * 37) % 60), t, i, ramp(tl, 3.8 + i * .18, 4.2 + i * .18));
  typeText(tl, TX, TY, '1º DE MAIO', .3, 7.4, { sub: 'GOEBBELS E A MULHER, MAGDA' });
});
// --- 27: 2 de maio, Berlim se rende ---
shot(CUTS[26], CUTS[27], (tl, t) => {
  c.fillStyle = lg(0, 0, 0, 900, [[0, '#6a6a6e'], [1, '#b4a48a']]); c.fillRect(0, 0, W, H); smoke(1000, 760, 500, t, 27, '110,100,92', 1);
  facade(60, 960, 520, 800, 31, { holeCol: '#a89878' }); facade(1300, 960, 560, 760, 32, { col: '#5e5444', holeCol: '#a89878' });
  for (const [x, y, w] of [[180, 340, 110], [330, 520, 90], [1420, 420, 120], [1600, 600, 90]]) poly([[x, y], [x + w, y], [x + w + sin(t * 3 + x) * 10, y + w * 1.2], [x + sin(t * 3 + x) * 8, y + w * 1.1]], '#f2ecd6');
  c.fillStyle = '#3a3228'; c.fillRect(0, 940, W, H - 940); rubble(560, 960, 760, 110, 33, ['#4a3e30', '#5a4c3a']);
  fardado(560, 1090, 380, SOVIETICO, t); fardado(1500, 1095, 390, SOVIETICO2, t);
  const wk = tl * 10; [[820, 1060, 330, ALEMAO], [1000, 1075, 345, ALEMAO2], [1170, 1062, 330, ALEMAO]].forEach(([x, y, h, f], i) => { fardado(x, y + wk * .4, h + wk, f, t + i, { anda: 1 }); if (i === 1) { const s = (h + wk) / 100, hx = x + 16.6 * s, hy = y + wk * .4 - 46 * s; line(hx, hy, hx + 8, hy - 120 * s * .9, '#3a3028', 4); poly([[hx + 8, hy - 108 * s], [hx + 8 + 60 * s, hy - 104 * s + sin(t * 5) * 6], [hx + 8 + 58 * s, hy - 70 * s + sin(t * 5) * 6], [hx + 8, hy - 76 * s]], '#f2ecd6') } });
  typeText(tl, TX, TY, '2 DE MAIO DE 1945', .2, 4.0, { sub: 'BERLIM SE RENDE' });
});
// --- 28: 7 de maio, Reims — rendição sem condições ---
shot(CUTS[27], CUTS[28], (tl, t) => {
  escuro('217,150,70', .14, 900, 520); c.fillStyle = '#3a2c1e'; c.fillRect(0, 760, W, H - 760); c.fillStyle = '#4a3a28'; c.fillRect(0, 760, W, 18);
  const done = folha(900, 470, 760, 640, .015); txt('ATO DE RENDIÇÃO MILITAR', -330, -230, 56, '#2a2620'); txt('REIMS, 7 DE MAIO DE 1945 · 2H41', -330, -182, 30, '#6a5a40', { w: 600 });
  c.fillStyle = 'rgba(42,38,32,.3)'; for (let k = 0; k < 7; k++) c.fillRect(-330, -120 + k * 34, 520 + ((k * 61) % 140), 9);
  txt('SEM CONDIÇÕES', -330, 170, 70, '#8a3a20'); c.strokeStyle = '#2a2620'; c.lineWidth = 2; c.beginPath(); c.moveTo(-330, 250); c.lineTo(60, 250); c.stroke();
  const sg = ramp(tl, 1.0, 3.0); c.strokeStyle = '#1c2a4a'; c.lineWidth = 4; c.beginPath(); for (let k = 0; k <= 60 * sg; k++) { const x = -320 + k * 6, y = 236 + sin(k * .7) * 12 + cos(k * .31) * 6; k ? c.lineTo(x, y) : c.moveTo(x, y) } c.stroke();
  const px = -320 + 360 * sg, py = 236; c.save(); c.translate(px, py); c.rotate(-.7); c.fillStyle = '#1c1c22'; c.fillRect(0, -6, 220, 12); c.fillStyle = '#d9b35a'; c.fillRect(0, -6, 30, 12); c.restore();
  done();
  typeText(tl, TX, TY, '7 DE MAIO', .2, 5.0, { sub: 'REIMS, FRANÇA' });
});
// --- 29: 8 de maio, fim da guerra na Europa ---
shot(CUTS[28], CUTS[29], (tl, t) => {
  c.fillStyle = lg(0, 0, 0, 700, [[0, '#7fa3a8'], [.6, '#c8c4a6'], [1, '#efe5c2']]); c.fillRect(0, 0, W, H); sunGlow(1500, 220, 420, '255,240,200', .8); cloudsBand(29, 6, 120, 380, 50, 90, '250,246,228', .5, t * 5);
  skyline(41, 720, 9, 220, 380, ['#8a8270', '#6e6858'], t, { hole: 'rgba(60,56,48,.5)' });
  c.strokeStyle = '#3a3028'; c.lineWidth = 3; for (let k = 0; k < 2; k++) { c.beginPath(); c.moveTo(0, 420 + k * 80); c.quadraticCurveTo(960, 520 + k * 80, W, 420 + k * 80); c.stroke(); for (let i = 0; i < 24; i++) { const x = i * 82 + 20, y = 420 + k * 80 + 4 * (1 - ((x - 960) / 960) ** 2) * 25; poly([[x, y], [x + 30, y], [x + 15, y + 34]], [VERM, CREME, AZUL][(i + k) % 3]) } }
  const q = rng(8); for (let i = 0; i < 70; i++) { const x = (q() * W + t * 30 * (q() - .5)) % W, y = (q() * H + t * 80) % H, s = 6 + q() * 6; c.save(); c.translate(x, y); c.rotate(t * 3 + i); c.fillStyle = [OURO, CREME, '#e0705a', '#9fc0d0'][i % 4]; c.fillRect(-s / 2, -s / 3, s, s * .66); c.restore() }
  c.fillStyle = '#5a5444'; c.fillRect(0, 760, W, H - 760); multidao(t, 3, 46, 820, 420, 1, 1);
  typeText(tl, TX, TY, '8 DE MAIO DE 1945', .3, 7.4, { sub: 'FIM DA GUERRA NA EUROPA' });
});
// --- 30: o custo — dezenas de milhões ---
shot(CUTS[29], CUTS[30], (tl, t) => {
  c.fillStyle = '#07080c'; c.fillRect(0, 0, W, H); const q = rng(30);
  for (let i = 0; i < 520; i++) { const d = q(), x = W / 2 + (q() - .5) * W * (.25 + d * 2.2), y = 560 + d * d * 520, r = 1.5 + d * 6, a = ramp(tl, q() * 3, q() * 3 + .6); if (a <= 0 || x < -10 || x > W + 10) continue; add(() => glow(x, y, r * 5, '255,190,100', .25 * a)); disc(x, y, r, `rgba(255,236,190,${a})`) }
  label(W / 2, 260, 'DEZENAS DE MILHÕES', { size: 120, align: 'center', a: ramp(tl, 1.4, 1.8) }); label(W / 2, 330, 'DE MORTOS NA GUERRA', { size: 50, align: 'center', col: PALHA, a: ramp(tl, 1.8, 2.2), w: 600 });
  label(W / 2, 460, '6 MILHÕES DE JUDEUS', { size: 96, align: 'center', col: OURO, a: ramp(tl, 5.1, 5.5) }); label(W / 2, 520, 'ASSASSINADOS NO HOLOCAUSTO', { size: 50, align: 'center', col: PALHA, a: ramp(tl, 5.6, 6.0), w: 600 });
});
// --- 31: Berlim, maio de 1945 — fim ---
shot(CUTS[30], CUTS[31], (tl, t) => {
  const u = ease(ramp(tl, 0, 12)); c.save(); c.translate(0, lerp(-80, 120, u)); const z = lerp(1.25, 1, u); c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2);
  c.fillStyle = lg(0, -200, 0, 760, [[0, '#2a3040'], [.5, '#7a6a6a'], [.85, '#d09a6a'], [1, '#f0c88a']]); c.fillRect(-200, -400, W + 400, H + 800); sunGlow(520, 700, 600, '255,190,110', .9);
  smoke(700, 700, 700, t, 41, '90,80,80', 1.3); smoke(1500, 720, 600, t, 42, '90,80,80', 1.1);
  skyline(51, 760, 18, 100, 230, ['#3a302c', '#2e2622'], t, { fire: 1 }); skyline(52, 900, 12, 180, 360, ['#211c19', '#191513'], t, { fire: 1 });
  c.fillStyle = '#15120f'; c.fillRect(-200, 900, W + 400, 600); rubble(-60, 940, 1100, 120, 53, ['#1e1915', '#29231d']); rubble(1000, 940, 1000, 100, 54, ['#1e1915', '#29231d']);
  c.fillStyle = '#3a3630'; c.fillRect(1240, 820, 110, 90); c.fillStyle = '#46423a'; c.fillRect(1258, 740, 44, 80); poly([[1254, 740], [1306, 740], [1280, 704]], '#33302a');
  c.restore();
  label(W / 2, 380, 'BERLIM · MAIO DE 1945', { size: 52, align: 'center', col: OURO, a: ramp(tl, 11.2, 11.8) * (1 - ramp(tl, 18.6, 19.3)), w: 600 });
  label(W / 2, 500, 'OS ÚLTIMOS DIAS DE HITLER', { size: 110, align: 'center', a: ramp(tl, 11.6, 12.3) * (1 - ramp(tl, 18.6, 19.3)) });
});
