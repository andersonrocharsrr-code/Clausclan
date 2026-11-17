// ================= Drácula: paleta noturna (preto, azul-frio, neve) com vermelho-sangue =================
const SANGUE = '#b0141e', SANGUE2 = '#e03a3a', GELO = '#c8d0dc', LUAR = '#e8ecf0';
const FONTE = '"Fira Sans Extra Condensed", sans-serif';
const PEDRA = ['#0c0e14', '#1a1e28', '#2a303c', '#3e4654', '#566070']; // sombra → luz de lua

// ---------- céu, lua, montanhas, floresta, neve ----------
function ceuNoite(t, o = {}) {
  const mx = o.lx ?? 1380, my = o.ly ?? 300, mr = o.lr ?? 120;
  c.fillStyle = lg(0, 0, 0, H, [[0, '#020308'], [.5, '#0a0f1c'], [.8, '#141c2e'], [1, '#1c2638']]); c.fillRect(0, 0, W, H);
  STARS.forEach(([x, y, r, b], i) => { if (y > 760) return; c.fillStyle = `rgba(220,230,255,${(b * .7 * (.7 + .3 * sin(t * 2 + i))).toFixed(3)})`; c.beginPath(); c.arc(x, y, r * .8, 0, 7); c.fill() });
  add(() => { glow(mx, my, mr * 5, '150,170,210', .22); glow(mx, my, mr * 2.2, '200,215,240', .35) });
  disc(mx, my, mr, LUAR); c.save(); c.beginPath(); c.arc(mx, my, mr, 0, 7); c.clip(); disc(mx + mr * .35, my + mr * .1, mr * .95, 'rgba(160,170,190,.18)');
  for (const [dx, dy, r] of [[-.35, -.2, .22], [.1, .3, .16], [.3, -.35, .12], [-.1, .05, .08], [-.45, .35, .1], [.45, .15, .07]]) { disc(mx + dx * mr, my + dy * mr, r * mr, 'rgba(150,160,180,.35)'); disc(mx + dx * mr - r * mr * .2, my + dy * mr - r * mr * .2, r * mr * .7, 'rgba(240,244,250,.25)') } c.restore();
  const q = rng(o.seed || 5); for (let i = 0; i < 7; i++) { const x = ((q() * W * 1.6 + t * (14 + q() * 20)) % (W * 1.6)) - W * .3, y = 120 + q() * 420, w = 300 + q() * 500; pill(x, y, w, 26 + q() * 30, `rgba(26,32,48,${.55 + q() * .3})`); pill(x + w * .2, y - 14, w * .5, 22, `rgba(40,48,66,${.35})`) }
}
function montanhas(t, base, o = {}) {
  const camadas = o.camadas || [[base - 330, '#2a3446', '#d8e0ec', 61], [base - 230, '#1c2434', '#b8c4d4', 62], [base - 120, '#121824', '#8e9aac', 63]];
  for (const [y0, cor, neve, seed] of camadas) { const q = rng(seed); let x = -60; const pts = [[-60, H]]; while (x < W + 60) { const w = 140 + q() * 260, h = 60 + q() * 220; pts.push([x, y0 + h * .2], [x + w / 2, y0 - h * .55], [x + w, y0 + h * .2]); x += w * .8 } pts.push([W + 60, H]); poly(pts, cor);
    for (let i = 1; i + 2 < pts.length - 1; i += 3) { const [ax, ay] = pts[i], [px, py] = pts[i + 1], [bx, by] = pts[i + 2], k = .28; poly([[px, py], [lerp(px, bx, k), lerp(py, by, k)], [lerp(px, bx, k * .55), lerp(py, by, k) - 6], [lerp(px, ax, k * .7), lerp(py, ay, k * .8) + 8], [lerp(px, ax, k), lerp(py, ay, k)]], neve) } }
}
function abeto(x, y, h, cor, neve) { const tiers = 6; c.fillStyle = '#0a0c10'; c.fillRect(x - h * .025, y - h * .12, h * .05, h * .12); for (let k = 0; k < tiers; k++) { const u = k / tiers, ty = y - h * .1 - u * h * .86, w = h * (.36 - u * .28); poly([[x - w, ty], [x + w, ty], [x, ty - h * .26]], cor); if (neve) poly([[x - w * .9, ty - h * .015], [x - w * .1, ty - h * .2], [x + w * .25, ty - h * .2], [x + w * .6, ty - h * .03], [x + w * .2, ty - h * .05], [x - w * .3, ty - h * .02]], neve) } }
function floresta(y, seed, n, h0, h1, cor, neve, x0 = -60, x1 = W + 60) { const q = rng(seed), A = []; for (let i = 0; i < n; i++) A.push([lerp(x0, x1, q()), y + q() * 30, lerp(h0, h1, q())]); A.sort((a, b) => a[1] - b[1]).forEach(([x, yy, h]) => abeto(x, yy, h, cor, neve)) }
function neve(t, n, seed, sz, vel, a = .9) { const q = rng(seed); c.fillStyle = `rgba(235,240,250,${a})`; for (let i = 0; i < n; i++) { const x0 = q() * W, s = sz * (.6 + q() * .8), v = vel * (.7 + q() * .6), ph = q() * 9; const y = ((q() * H + t * v) % (H + 40)) - 20, x = x0 + sin(t * .8 + ph) * 30 + t * v * .15; c.beginPath(); c.arc(((x % W) + W) % W, y, s, 0, 7); c.fill() } }
function chaoNeve(y, cor = '#c8d0dc') { c.fillStyle = lg(0, y, 0, H, [[0, cor], [1, '#6a7484']]); c.fillRect(0, y, W, H - y); const q = rng(3); for (let i = 0; i < 40; i++) pill(q() * W, y + 10 + q() * (H - y), 120 + q() * 200, 10, 'rgba(120,130,150,.25)') }

// ---------- castelo gótico no penhasco (pés em x, base; escala s ≈ 1 → castelo de ~600 px) ----------
function torre(x, base, w, h, s, t, o = {}) {
  const tw = w * s, th = h * s, y0 = base - th;
  c.fillStyle = bands(x - tw / 2, 0, x + tw / 2, 0, [[.28, PEDRA[1]], [.62, PEDRA[2]], [.85, PEDRA[3]], [1, PEDRA[2]]]); c.fillRect(x - tw / 2, y0, tw, th);
  c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = Math.max(1, s * 1.2); for (let yy = y0 + 18 * s; yy < base; yy += 16 * s) { c.beginPath(); c.moveTo(x - tw / 2, yy); c.lineTo(x + tw / 2, yy); c.stroke() }
  // janelas em arco (algumas acesas)
  const q = rng(o.seed || 1); for (let k = 0; k < (o.janelas ?? 2); k++) { const wy = y0 + th * (.22 + k * .32), ww = tw * .22, wh = ww * 2, lit = q() < (o.luz ?? .5); c.fillStyle = lit ? '#e8a050' : '#06070a'; c.beginPath(); c.moveTo(x - ww / 2, wy + wh); c.lineTo(x - ww / 2, wy + ww / 2); c.arc(x, wy + ww / 2, ww / 2, PI, 0); c.lineTo(x + ww / 2, wy + wh); c.fill(); if (lit) add(() => glow(x, wy + wh / 2, ww * 3, '240,150,70', .35 + .1 * sin(t * 7 + k))) }
  if (o.ameias) { c.fillStyle = PEDRA[2]; for (let k = 0; k < 5; k++) c.fillRect(x - tw / 2 + k * tw / 4.5, y0 - 12 * s, tw / 9, 12 * s); c.fillStyle = 'rgba(220,228,240,.85)'; c.fillRect(x - tw / 2, y0 - 2 * s, tw, 3 * s) }
  else { const rh = tw * (o.agudo ?? 1.6); poly([[x - tw * .62, y0], [x + tw * .62, y0], [x, y0 - rh]], '#121620'); poly([[x, y0 - rh], [x + tw * .62, y0], [x + tw * .1, y0]], '#1e2432'); poly([[x - tw * .62, y0], [x - tw * .2, y0 - rh * .28], [x + tw * .05, y0 - rh * .12], [x + tw * .3, y0 - rh * .3], [x + tw * .62, y0]], 'rgba(220,228,240,.9)'); line(x, y0 - rh, x, y0 - rh - 22 * s, '#0c0e14', 2 * s); if (o.bandeira) poly([[x, y0 - rh - 22 * s], [x + 16 * s + sin(t * 4) * 3 * s, y0 - rh - 18 * s], [x, y0 - rh - 13 * s]], SANGUE) }
}
function castelo(x, base, s, t, o = {}) {
  // penhasco
  c.fillStyle = PEDRA[1]; c.beginPath(); c.moveTo(x - 360 * s, base + 420 * s); c.lineTo(x - 300 * s, base + 40 * s); c.lineTo(x - 230 * s, base); c.lineTo(x + 260 * s, base); c.lineTo(x + 330 * s, base + 70 * s); c.lineTo(x + 420 * s, base + 420 * s); c.fill();
  poly([[x + 40 * s, base], [x + 260 * s, base], [x + 330 * s, base + 70 * s], [x + 420 * s, base + 420 * s], [x + 120 * s, base + 420 * s]], PEDRA[2]);
  const q = rng(9); for (let i = 0; i < 14; i++) { const rx = x + (q() - .5) * 600 * s, ry = base + 40 * s + q() * 340 * s; poly([[rx, ry], [rx + 50 * s, ry + 20 * s], [rx + 10 * s, ry + 14 * s]], 'rgba(220,228,240,.75)'); poly([[rx - 30 * s, ry + 40 * s], [rx + 20 * s, ry + 10 * s], [rx + 6 * s, ry + 50 * s]], 'rgba(0,0,0,.25)') }
  // muralha
  c.fillStyle = bands(x - 240 * s, 0, x + 240 * s, 0, [[.4, PEDRA[1]], [.8, PEDRA[2]], [1, PEDRA[3]]]); c.fillRect(x - 240 * s, base - 110 * s, 480 * s, 110 * s); c.fillStyle = PEDRA[2]; for (let k = 0; k < 16; k++) c.fillRect(x - 240 * s + k * 31 * s, base - 124 * s, 16 * s, 14 * s); c.fillStyle = 'rgba(220,228,240,.85)'; c.fillRect(x - 240 * s, base - 112 * s, 480 * s, 4 * s);
  c.fillStyle = '#06070a'; c.beginPath(); c.moveTo(x - 26 * s, base); c.lineTo(x - 26 * s, base - 50 * s); c.arc(x, base - 50 * s, 26 * s, PI, 0); c.lineTo(x + 26 * s, base); c.fill(); c.strokeStyle = '#2a2018'; c.lineWidth = 2 * s; for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(x + k * 9 * s, base); c.lineTo(x + k * 9 * s, base - 64 * s); c.stroke() }
  // torres (de trás para a frente)
  torre(x - 150 * s, base - 100 * s, 54, 230, s, t, { seed: 2, luz: .3 }); torre(x + 170 * s, base - 100 * s, 60, 260, s, t, { seed: 3, luz: .6, bandeira: 1 });
  torre(x + 20 * s, base - 100 * s, 120, 330, s, t, { seed: 4, janelas: 3, luz: .7, ameias: 1 }); torre(x + 20 * s, base - 430 * s, 50, 120, s, t, { seed: 5, janelas: 1, luz: 1, agudo: 2.4, bandeira: 1 });
  torre(x - 250 * s, base, 70, 200, s, t, { seed: 6, luz: .5 }); torre(x + 250 * s, base, 74, 220, s, t, { seed: 7, luz: .4 });
  torre(x - 80 * s, base - 100 * s, 40, 170, s, t, { seed: 8, janelas: 1, luz: 1, agudo: 2 });
}
// ---------- morcegos ----------
function morcego(x, y, s, t, ph = 0, dir = 1) { const f = sin(t * 18 + ph), a = f * .9; c.save(); c.translate(x, y); c.scale(s * dir, s); c.fillStyle = '#05060a';
  for (const k of [-1, 1]) { c.save(); c.scale(k, 1); c.rotate(-a * .5); c.beginPath(); c.moveTo(2, -2); c.quadraticCurveTo(14, -16 - a * 8, 30, -10 - a * 14); c.lineTo(26, -4 - a * 8); c.quadraticCurveTo(22, -2, 20, 2 - a * 4); c.quadraticCurveTo(14, 0, 12, 4); c.quadraticCurveTo(8, 2, 2, 4); c.closePath(); c.fill(); c.restore() }
  c.beginPath(); c.ellipse(0, 0, 4.4, 7, 0, 0, 7); c.fill(); disc(0, -7, 4, '#05060a'); poly([[-3.4, -9], [-2, -15], [-.6, -9.6]], '#05060a'); poly([[3.4, -9], [2, -15], [.6, -9.6]], '#05060a'); disc(-1.4, -7.4, .7, SANGUE2); disc(1.4, -7.4, .7, SANGUE2); c.restore() }
function revoada(t, seed, n, cx, cy, raio, s0, vel = 1, o = {}) { const q = rng(seed); for (let i = 0; i < n; i++) { const a0 = q() * 2 * PI, r = raio * (.3 + q() * .9), w = (.4 + q() * .6) * vel * (q() < .5 ? 1 : -1), a = a0 + t * w, sp = o.espalha ? 1 + t * o.espalha * (q() + .4) : 1, x = cx + cos(a) * r * 1.6 * sp + (o.vento || 0) * t * 60, y = cy + sin(a) * r * .6 * sp + sin(t * 2 + i) * 10; morcego(x, y, s0 * (.6 + q() * .8), t, q() * 9, cos(a) * w > 0 ? 1 : -1) } }

// ---------- o rosto do Drácula (centro do rosto em (0,0); rosto ≈ 200 de altura) ----------
function draculaRosto(t, o = {}) {
  const boca = o.boca || 0, olho = o.olho ?? .6, pele = '#d6d2ca', ps = '#9a98a4', pss = '#6a6878', cab = '#08080c';
  // gola alta da capa (forro vermelho) atrás da cabeça
  c.fillStyle = '#05050a'; c.beginPath(); c.moveTo(-260, 260); c.quadraticCurveTo(-250, -40, -170, -170); c.quadraticCurveTo(-110, 40, -70, 150); c.lineTo(70, 150); c.quadraticCurveTo(110, 40, 170, -170); c.quadraticCurveTo(250, -40, 260, 260); c.fill();
  c.fillStyle = '#5a0a10'; c.beginPath(); c.moveTo(-235, 240); c.quadraticCurveTo(-226, -20, -168, -140); c.quadraticCurveTo(-120, 40, -84, 150); c.closePath(); c.fill(); c.beginPath(); c.moveTo(235, 240); c.quadraticCurveTo(226, -20, 168, -140); c.quadraticCurveTo(120, 40, 84, 150); c.closePath(); c.fill();
  c.fillStyle = '#8a1420'; c.beginPath(); c.moveTo(-200, 220); c.quadraticCurveTo(-196, 0, -166, -110); c.quadraticCurveTo(-140, 20, -120, 120); c.closePath(); c.fill();
  // pescoço, camisa e medalhão
  poly([[-36, 70], [36, 70], [44, 176], [-44, 176]], ps); poly([[8, 70], [36, 70], [44, 176], [14, 176]], pss); c.strokeStyle = 'rgba(70,68,84,.6)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-14, 110); c.quadraticCurveTo(-6, 140, -10, 170); c.stroke();
  poly([[-58, 150], [58, 150], [36, 270], [-36, 270]], '#e6e2da'); poly([[-58, 150], [-12, 196], [0, 176], [12, 196], [58, 150], [44, 142], [0, 162], [-44, 142]], '#cfcac2'); c.fillStyle = '#0a0a0e'; poly([[-10, 186], [10, 186], [16, 214], [0, 222], [-16, 214]], '#0a0a0e');
  poly([[-330, 360], [-150, 186], [-62, 150], [-34, 270], [-60, 360]], '#07070c'); poly([[330, 360], [150, 186], [62, 150], [34, 270], [60, 360]], '#07070c'); poly([[-150, 186], [-62, 150], [-56, 172], [-130, 204]], '#16161e'); poly([[150, 186], [62, 150], [56, 172], [130, 204]], '#121218');
  disc(0, 240, 20, '#a8862a'); disc(0, 240, 13, SANGUE); disc(-4, 236, 4, 'rgba(255,200,200,.6)'); c.strokeStyle = '#a8862a'; c.lineWidth = 2; c.beginPath(); c.moveTo(-20, 236); c.quadraticCurveTo(-40, 200, -50, 160); c.moveTo(20, 236); c.quadraticCurveTo(40, 200, 50, 160); c.stroke();
  // orelhas pontudas
  for (const k of [-1, 1]) { c.fillStyle = pss; c.beginPath(); c.moveTo(k * 70, -20); c.quadraticCurveTo(k * 108, -84, k * 112, -110); c.quadraticCurveTo(k * 96, -40, k * 78, 30); c.fill(); c.fillStyle = ps; c.beginPath(); c.moveTo(k * 74, -14); c.quadraticCurveTo(k * 100, -70, k * 104, -94); c.quadraticCurveTo(k * 90, -34, k * 78, 18); c.fill() }
  // rosto: magro, maçãs marcadas, queixo pontudo
  const face = () => { c.beginPath(); c.moveTo(0, -150); c.bezierCurveTo(52, -150, 82, -112, 80, -50); c.bezierCurveTo(78, 10, 66, 44, 46, 76); c.bezierCurveTo(30, 104, 14, 118, 0, 120); c.bezierCurveTo(-14, 118, -30, 104, -46, 76); c.bezierCurveTo(-66, 44, -78, 10, -80, -50); c.bezierCurveTo(-82, -112, -52, -150, 0, -150); c.closePath() };
  c.fillStyle = pele; face(); c.fill();
  c.save(); face(); c.clip(); c.fillStyle = lg(-80, 0, 80, 0, [[0, '#cfcac2'], [.35, '#e2ded6'], [.6, '#d0ccc4'], [1, '#a8a6b0']]); c.fillRect(-90, -160, 180, 290);
  poly([[30, -160], [100, -160], [100, 130], [10, 130], [40, 60], [52, 0]], 'rgba(120,118,134,.75)');
  poly([[-80, -6], [-46, 6], [-30, 46], [-40, 80], [-66, 54]], 'rgba(96,92,112,.55)'); poly([[80, -6], [46, 6], [30, 46], [40, 80], [66, 54]], 'rgba(60,56,76,.55)');
  for (const k of [-1, 1]) { c.fillStyle = 'rgba(70,62,92,.38)'; c.beginPath(); c.ellipse(k * 36, -32, 30, 22, 0, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.ellipse(k * 48, -4, 16, 8, k * -.4, 0, 7); c.fill() }
  c.fillStyle = 'rgba(255,255,255,.14)'; c.beginPath(); c.ellipse(-10, -100, 40, 22, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(0, 104, 16, 8, 0, 0, 7); c.fill();
  c.strokeStyle = 'rgba(90,86,104,.45)'; c.lineWidth = 1.6; for (const y of [-84, -74]) { c.beginPath(); c.moveTo(-34, y); c.quadraticCurveTo(0, y - 6, 34, y); c.stroke() } c.beginPath(); c.moveTo(-6, -64); c.lineTo(-4, -50); c.moveTo(6, -64); c.lineTo(4, -50); c.stroke();
  c.restore();
  // cabelo preto penteado para trás com o bico na testa, têmporas grisalhas
  c.fillStyle = cab; c.beginPath(); c.moveTo(-84, -40); c.bezierCurveTo(-94, -150, -40, -196, 0, -196); c.bezierCurveTo(40, -196, 94, -150, 84, -40); c.lineTo(76, -60); c.quadraticCurveTo(60, -110, 22, -118); c.lineTo(0, -88); c.lineTo(-22, -118); c.quadraticCurveTo(-60, -110, -76, -60); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(160,170,190,.55)'; c.lineWidth = 3; for (const k of [-1, 1]) { c.beginPath(); c.moveTo(k * 80, -50); c.quadraticCurveTo(k * 84, -110, k * 50, -150); c.stroke() } c.strokeStyle = 'rgba(60,70,90,.6)'; c.lineWidth = 2; for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(k * 16, -120 + Math.abs(k) * 4); c.quadraticCurveTo(k * 22, -170, k * 12, -192); c.stroke() }
  // sobrancelhas arqueadas, olhos vermelhos, olheiras
  for (const k of [-1, 1]) { poly([[k * 12, -52], [k * 34, -66], [k * 62, -60], [k * 64, -54], [k * 34, -58], [k * 14, -46]], cab);
    poly([[k * 16, -30], [k * 34, -42], [k * 56, -36], [k * 52, -26], [k * 32, -22]], '#efe8e0'); add(() => glow(k * 36, -32, 30 * olho + 4, '255,40,40', .55 * olho)); disc(k * 36, -32, 7.5, `rgb(${Math.round(120 + 100 * olho)},20,24)`); disc(k * 36, -32, 3, '#050505'); disc(k * 34, -34.5, 1.6, '#fff');
    c.strokeStyle = cab; c.lineWidth = 2.5; c.beginPath(); c.moveTo(k * 15, -30); c.quadraticCurveTo(k * 34, -46, k * 57, -36); c.stroke(); c.strokeStyle = 'rgba(70,60,90,.55)'; c.lineWidth = 3; c.beginPath(); c.moveTo(k * 20, -16); c.quadraticCurveTo(k * 36, -10, k * 54, -20); c.stroke() }
  // nariz aquilino
  poly([[0, -40], [8, -8], [16, 22], [6, 30], [-6, 30], [-14, 22], [-6, -8]], ps); poly([[-2, -36], [-6, -6], [-12, 20], [-2, 24]], 'rgba(240,236,228,.6)'); disc(-8, 26, 3, '#2a2a34'); disc(8, 26, 3, '#2a2a34');
  c.strokeStyle = 'rgba(90,88,104,.7)'; c.lineWidth = 2; for (const k of [-1, 1]) { c.beginPath(); c.moveTo(k * 16, 28); c.quadraticCurveTo(k * 30, 48, k * 30, 66); c.stroke() }
  // boca: abre e mostra os caninos
  const by = 62, abre = 4 + boca * 30;
  c.fillStyle = '#2a0a10'; c.beginPath(); c.moveTo(-30, by); c.quadraticCurveTo(0, by - 6, 30, by); c.quadraticCurveTo(0, by + abre * 1.3, -30, by); c.fill();
  if (boca > .05) { c.fillStyle = '#f2ece2'; c.beginPath(); c.moveTo(-26, by - 1); c.quadraticCurveTo(0, by - 5, 26, by - 1); c.lineTo(24, by + 4); c.quadraticCurveTo(0, by + 1, -24, by + 4); c.fill(); c.strokeStyle = 'rgba(120,110,100,.5)'; c.lineWidth = .8; for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(k * 6, by - 3); c.lineTo(k * 6, by + 3); c.stroke() }
    for (const k of [-1, 1]) { const fl = 6 + boca * 16; poly([[k * 13, by], [k * 21, by], [k * 16.5, by + fl]], '#fbf6ee'); poly([[k * 17, by], [k * 21, by], [k * 16.5, by + fl]], '#d8d0c4') }
    if (o.gota) { const gy = by + 6 + boca * 16 + o.gota * 40; c.fillStyle = SANGUE; c.beginPath(); c.moveTo(16.5, gy - 8); c.quadraticCurveTo(20, gy, 16.5, gy + 4); c.quadraticCurveTo(13, gy, 16.5, gy - 8); c.fill() } }
  c.fillStyle = '#5a1a24'; c.beginPath(); c.moveTo(-30, by); c.quadraticCurveTo(0, by - 8, 30, by); c.quadraticCurveTo(0, by - 3, -30, by); c.fill(); c.fillStyle = '#6a2a34'; c.beginPath(); c.moveTo(-26, by + abre * .9 + 1); c.quadraticCurveTo(0, by + abre * 1.35 + 6, 26, by + abre * .9 + 1); c.quadraticCurveTo(0, by + abre * 1.3, -26, by + abre * .9 + 1); c.fill();
  // luz fria de baixo para cima
  c.save(); face(); c.clip(); c.fillStyle = lg(0, 130, 0, -80, [[0, 'rgba(120,150,210,.18)'], [1, 'rgba(120,150,210,0)']]); c.fillRect(-100, -160, 200, 300); c.restore();
}
// ---------- cripta com o caixão ----------
function cripta(t, tampa = 0) {
  c.fillStyle = '#07080c'; c.fillRect(0, 0, W, H);
  for (let k = 0; k < 4; k++) { const x = 160 + k * 540; c.fillStyle = PEDRA[1]; c.fillRect(x - 60, 120, 120, 820); c.fillStyle = PEDRA[2]; c.fillRect(x - 60, 120, 40, 820); c.strokeStyle = PEDRA[1]; c.lineWidth = 40; c.beginPath(); c.arc(x + 270, 420, 270, PI, 0); c.stroke() }
  c.fillStyle = lg(0, 760, 0, H, [[0, '#1a1e28'], [1, '#0a0c10']]); c.fillRect(0, 760, W, H);
  for (const [x, h] of [[480, 160], [1440, 200], [620, 120], [1300, 140]]) { c.fillStyle = '#d8d0c0'; c.fillRect(x - 12, 860 - h, 24, h); c.fillStyle = '#3a2a1a'; c.fillRect(x - 40, 860, 80, 14); const f = 1 + .1 * sin(t * 12 + x); add(() => glow(x, 840 - h, 140 * f, '255,170,90', .35)); poly([[x, 820 - h - 22 * f], [x + 8, 846 - h], [x, 856 - h], [x - 8, 846 - h]], '#f0a040'); poly([[x, 830 - h - 12 * f], [x + 4, 846 - h], [x, 852 - h], [x - 4, 846 - h]], '#fff0c8') }
  c.fillStyle = PEDRA[2]; c.fillRect(640, 820, 640, 90); c.fillStyle = PEDRA[3]; c.fillRect(640, 820, 640, 14);
  const cx = 960, cy = 780; poly([[cx - 330, cy], [cx - 260, cy - 60], [cx + 200, cy - 60], [cx + 330, cy - 10], [cx + 330, cy + 30], [cx - 330, cy + 30]], '#2a1410'); poly([[cx - 330, cy + 30], [cx + 330, cy + 30], [cx + 330, cy + 46], [cx - 330, cy + 46]], '#1a0c0a');
  c.save(); c.translate(cx - 330, cy - 60); c.rotate(-tampa * .5); poly([[0, 60], [70, 0], [530, 0], [660, 50], [660, 66], [0, 76]], '#3a1c14'); poly([[70, 0], [530, 0], [520, 12], [80, 12]], '#4a2a1c'); c.fillStyle = '#a8862a'; c.fillRect(300, 24, 8, 34); c.fillRect(286, 34, 36, 8); c.restore();
}
// ---------- Vlad III, o Empalador (retrato) ----------
function vladRetrato(t) {
  c.save(); const pele = '#d2b49a', ps = '#a88a72';
  c.fillStyle = '#2a0a10'; c.beginPath(); c.moveTo(-300, 330); c.quadraticCurveTo(-260, 120, -120, 100); c.lineTo(120, 100); c.quadraticCurveTo(260, 120, 300, 330); c.fill();
  c.fillStyle = '#4a3a2a'; c.beginPath(); c.moveTo(-210, 330); c.quadraticCurveTo(-190, 150, -100, 112); c.lineTo(-60, 330); c.fill(); c.beginPath(); c.moveTo(210, 330); c.quadraticCurveTo(190, 150, 100, 112); c.lineTo(60, 330); c.fill();
  for (let k = 0; k < 9; k++) disc(-60 + k * 15, 150 + (k % 2) * 6, 5, '#e8e0d0');
  c.fillStyle = '#1a1008'; c.beginPath(); c.ellipse(0, -10, 110, 150, 0, 0, 7); c.fill(); for (const k of [-1, 1]) for (let j = 0; j < 6; j++) disc(k * (86 + j * 4), 20 + j * 26, 22, '#1a1008');
  c.fillStyle = ps; c.fillRect(-30, 60, 60, 60);
  c.fillStyle = pele; c.beginPath(); c.ellipse(0, -10, 68, 92, 0, 0, 7); c.fill(); c.fillStyle = ps; c.beginPath(); c.ellipse(26, -6, 40, 84, 0, -PI / 2, PI / 2); c.fill();
  for (const k of [-1, 1]) { c.fillStyle = '#f2ece2'; c.beginPath(); c.ellipse(k * 26, -26, 15, 9, 0, 0, 7); c.fill(); disc(k * 26, -26, 7, '#3a5a4a'); disc(k * 26, -26, 3, '#050505'); disc(k * 24, -28, 1.4, '#fff'); poly([[k * 8, -44], [k * 40, -52], [k * 44, -46], [k * 10, -40]], '#1a1008') }
  poly([[0, -30], [14, 20], [4, 30], [-6, 28], [-4, 0]], ps); poly([[-2, -26], [-6, 22], [-2, 26]], 'rgba(255,240,230,.4)');
  c.fillStyle = '#1a1008'; c.beginPath(); c.moveTo(-6, 34); c.quadraticCurveTo(-40, 34, -66, 76); c.quadraticCurveTo(-50, 52, -8, 46); c.lineTo(8, 46); c.quadraticCurveTo(50, 52, 66, 76); c.quadraticCurveTo(40, 34, 6, 34); c.fill(); c.fillStyle = '#7a3a34'; c.fillRect(-10, 50, 20, 4);
  c.fillStyle = '#8a1420'; c.beginPath(); c.moveTo(-84, -70); c.quadraticCurveTo(-90, -150, -10, -168); c.quadraticCurveTo(70, -170, 92, -120); c.quadraticCurveTo(96, -90, 80, -72); c.closePath(); c.fill(); c.fillStyle = '#6a0a14'; c.beginPath(); c.moveTo(20, -166); c.quadraticCurveTo(80, -160, 92, -120); c.quadraticCurveTo(96, -90, 80, -72); c.lineTo(30, -72); c.fill();
  c.fillStyle = '#5a4a3a'; c.fillRect(-88, -84, 176, 18); for (let k = 0; k < 12; k++) disc(-80 + k * 14.5, -75, 4.4, '#f0eadc');
  disc(10, -118, 16, '#a8862a'); disc(10, -118, 9, '#c8202a'); for (let k = 0; k < 7; k++) { const a = -PI / 2 + (k - 3) * .35; disc(10 + cos(a) * 24, -118 + sin(a) * 24, 3.4, '#f0eadc') } poly([[18, -132], [60, -200], [66, -196], [26, -128]], '#d8d0c0');
  c.restore();
}
