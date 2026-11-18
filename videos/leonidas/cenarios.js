// ================= Cenários: céus, montanhas, mar, Termópilas, Esparta, Pérsia, mapa, navios =================
const CEUS = {
  aurora: [[0, '#1a1420'], [.35, '#3a2430'], [.62, '#a0503a'], [.82, '#e09a5a'], [1, '#f2d08a']],
  dia: [[0, '#2f6a74'], [.5, '#7aa8a4'], [.85, '#d8cfa8'], [1, '#efe2bc']],
  noite: [[0, '#07060c'], [.5, '#141626'], [.85, '#24283c'], [1, '#3a3a4a']],
  sangue: [[0, '#1a0608'], [.4, '#4a1210'], [.7, '#a8321e'], [.88, '#e07a3a'], [1, '#f4c06a']],
  bronze: [[0, '#140c08'], [.5, '#3a2414'], [.8, '#8a5a2a'], [1, '#d8a050']],
};
const ESTR = (() => { const q = rng(41), a = []; for (let i = 0; i < 200; i++)a.push([q() * W, q() * 1100, .8 + q() * 1.8, .3 + q() * .7]); return a })();
function ceu(t, tipo = 'aurora', o = {}) {
  const hz = o.hz ?? 1150; c.fillStyle = lg(0, 0, 0, hz, CEUS[tipo]); c.fillRect(0, 0, W, H);
  if (tipo === 'noite') ESTR.forEach(([x, y, r, b], i) => { c.fillStyle = `rgba(240,230,210,${(b * (.7 + .3 * sin(t * 2 + i))).toFixed(3)})`; c.fillRect(x, y, r, r) });
  if (o.sol !== false) { const sx = o.sx ?? 760, sy = o.sy ?? hz - 260, sr = o.sr ?? 90, lua = tipo === 'noite'; glow(sx, sy, sr * 4, lua ? '220,220,240' : '255,210,140', lua ? .16 : .35); disc(sx, sy, sr, lua ? '#ece6da' : '#fbe2a4'); if (lua) disc(sx + sr * .35, sy - sr * .1, sr * .95, 'rgba(150,150,170,.4)') }
  const q = rng(o.seed || 3); for (let i = 0; i < 7; i++) { const y = 140 + q() * (hz - 400), x = ((q() * W * 1.6 + t * (8 + q() * 10)) % (W + 700)) - 350; pill(x, y, 300 + q() * 500, 10 + q() * 16, tipo === 'noite' ? 'rgba(80,80,110,.18)' : 'rgba(255,230,190,.14)') }
}
// montanhas em camadas de papel: cada camada com face clara e face escura
function montes(base, camadas, o = {}) {
  camadas.forEach(([h, c1, c2, seed], k) => {
    const q = rng(seed), pts = []; let x = -100; while (x < W + 200) { pts.push([x, base - h * (.45 + q() * .55)]); x += 110 + q() * 160; pts.push([x, base - h * (.1 + q() * .3)]); x += 80 + q() * 120 }
    c.fillStyle = c1; c.beginPath(); c.moveTo(-100, H); pts.forEach(p => c.lineTo(...p)); c.lineTo(W + 200, H); c.fill();
    c.fillStyle = c2; for (let i = 0; i < pts.length - 1; i += 2) { const [x1, y1] = pts[i], [x2, y2] = pts[i + 1]; if (y1 < y2) { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.lineTo(x2, H); c.lineTo(x1 + (x2 - x1) * .3, H); c.fill() } }
    if (o.neve && k === 0) { c.fillStyle = 'rgba(240,236,228,.9)'; for (let i = 0; i < pts.length; i += 2) { const [x1, y1] = pts[i]; if (base - y1 > h * .7) poly([[x1 - 50, y1 + 60], [x1, y1], [x1 + 46, y1 + 56], [x1 + 20, y1 + 44], [x1, y1 + 66], [x1 - 22, y1 + 46]], 'rgba(240,236,228,.92)') } }
  });
}
function mar(y, t, o = {}) {
  c.fillStyle = lg(0, y, 0, H, [[0, o.c1 || '#2f7a80'], [1, o.c2 || '#123a44']]); c.fillRect(0, y, W, H - y);
  const q = rng(8); for (let i = 0; i < 60; i++) { const yy = y + 8 + q() * (H - y), w = 40 + q() * 160 * (yy - y) / 400, x = ((q() * W + t * 20 * (q() < .5 ? 1 : -1)) % (W + 200) + W + 200) % (W + 200) - 100; pill(x, yy, w, 4 + (yy - y) / 120, `rgba(240,230,200,${.12 + q() * .2})`) }
  if (o.brilho) { const q2 = rng(9); for (let i = 0; i < 30; i++) pill(o.brilho + (q2() - .5) * 200, y + 20 + q2() * 300, 30 + q2() * 80, 5, `rgba(255,220,150,${.3 + .3 * sin(t * 3 + i)})`) }
}
// árvores: cipreste e oliveira
function cipreste(x, y, h, cor = '#1e2a18') { bezPoly([[x, y - h], [x + h * .14, y - h * .5, x + h * .1, y], [x - h * .1, y], [x - h * .14, y - h * .5, x, y - h]], cor); bezPoly([[x, y - h], [x + h * .14, y - h * .5, x + h * .1, y], [x, y]], 'rgba(0,0,0,.25)') }
function oliveira(x, y, s, cor = '#5d6b3a') { c.save(); c.translate(x, y); c.scale(s, s); line(0, 0, -6, -70, '#4a3420', 14); line(-6, -70, -30, -110, '#4a3420', 8); line(-6, -70, 24, -104, '#4a3420', 8); for (const [ex, ey, r] of [[-40, -120, 40], [10, -136, 46], [44, -110, 36], [-6, -104, 40]]) el(ex, ey, r, r * .7, cor); el(20, -120, 30, 18, 'rgba(255,255,255,.08)'); c.restore() }
// Termópilas vista do alto: montanha à esquerda, mar à direita, faixa estreita de terra (com fontes quentes)
function termopilas(t, o = {}) {
  ceu(t, o.ceu || 'aurora', { sx: 820, sy: 360, hz: 700 });
  mar(700, t, { brilho: 820 });
  c.fillStyle = '#c8a46a'; c.beginPath(); c.moveTo(0, 620); c.lineTo(420, 640); c.quadraticCurveTo(520, 900, 560, H); c.lineTo(0, H); c.fill();
  c.fillStyle = '#a8844e'; c.beginPath(); c.moveTo(360, 640); c.quadraticCurveTo(480, 1000, 470, H); c.lineTo(560, H); c.quadraticCurveTo(520, 900, 420, 640); c.fill();
  c.fillStyle = '#e0c48a'; c.beginPath(); c.moveTo(380, 650); c.quadraticCurveTo(470, 980, 490, H); c.lineTo(520, H); c.quadraticCurveTo(500, 960, 410, 650); c.fill();
  montes(1300, [[620, '#4a3a2a', '#352818', 11]], {}); c.save(); c.beginPath(); c.moveTo(0, 0); c.lineTo(360, 0); c.lineTo(400, 640); c.quadraticCurveTo(450, 980, 440, H); c.lineTo(0, H); c.clip(); montes(H, [[1400, '#5a4630', '#3e2e1c', 12], [1100, '#6e5638', '#4e3c26', 13], [700, '#7e6440', '#5a4630', 14]]); c.restore();
  for (let k = 0; k < 4; k++) { const ph = (t * .3 + k * .25) % 1, x = 450 + k * 16, y = 900 + k * 120; pill(x + ph * 30, y - ph * 120, 60 + ph * 80, 22, `rgba(240,240,240,${.4 * (1 - ph)})`) }
  if (o.muro !== false) { c.save(); c.translate(470, 1010); c.rotate(.08); for (let k = 0; k < 6; k++) rr(-70 + (k % 3) * 46, -16 - Math.floor(k / 3) * 16, 44, 14, 3, k % 2 ? '#d8c8a8' : '#bca880'); c.restore() }
}
// Esparta: vale do Eurotas, monte Taigeto nevado, casas simples e templo
function templo(x, y, s, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s); rr(-200, -20, 400, 20, 2, '#cfc2a4'); rr(-190, -36, 380, 18, 2, '#ddd2b6');
  for (let k = 0; k < 6; k++) { const cx = -160 + k * 64; rr(cx - 14, -220, 28, 184, 3, '#efe6d4'); rr(cx, -220, 14, 184, 2, '#cfc2a4'); rr(cx - 18, -232, 36, 12, 2, '#ddd2b6') }
  rr(-196, -262, 392, 30, 2, '#ddd2b6'); for (let k = 0; k < 12; k++) rr(-190 + k * 32, -258, 14, 22, 1, '#b8a888');
  poly([[-206, -262], [0, -340], [206, -262]], '#efe6d4'); poly([[0, -340], [206, -262], [0, -262]], '#cfc2a4'); if (o.fogo) { fogo(0, -40, 1, o.t || 0) }
  c.restore();
}
function casa(x, y, s, cor = '#c8a478') { c.save(); c.translate(x, y); c.scale(s, s); rr(-60, -70, 120, 70, 2, cor); rr(0, -70, 60, 70, 2, 'rgba(0,0,0,.18)'); poly([[-70, -70], [0, -110], [70, -70]], '#9a4a2a'); poly([[0, -110], [70, -70], [0, -70]], '#7a3a20'); rr(-14, -40, 28, 40, 2, '#3a2214'); c.restore() }
function fogo(x, y, s, t) { c.save(); c.translate(x, y); c.scale(s, s); glow(0, -30, 160, '255,170,80', .5); const f = 1 + .1 * sin(t * 17); for (const [w, h, col] of [[46, 110, '#c84a1e'], [32, 80, '#f0902e'], [18, 50, '#f8d070']]) { c.fillStyle = col; c.beginPath(); c.moveTo(-w, 0); c.quadraticCurveTo(-w * .6, -h * .6 * f, 0, -h * f); c.quadraticCurveTo(w * .6, -h * .6 * f, w, 0); c.fill() } c.restore() }
function esparta(t, o = {}) {
  ceu(t, o.ceu || 'dia', { sx: 260, sy: 420 }); montes(1000, [[560, '#8a96a0', '#6a7680', 21], [380, '#5a6a5a', '#46543e', 22]], { neve: true });
  c.fillStyle = '#7a8a4a'; c.fillRect(0, 980, W, H); c.fillStyle = '#6a7a3e'; c.fillRect(0, 980, W, 30);
  [[120, 1060, .9], [330, 1040, .8], [760, 1050, .85], [960, 1070, .9], [560, 1120, 1]].forEach(([x, y, s]) => casa(x, y, s)); templo(540, 1010, .7, { fogo: o.fogo, t });
  for (const x of [40, 230, 880, 1040]) cipreste(x, 1130, 220); oliveira(200, 1260, 1.2); oliveira(900, 1260, 1.1);
}
// Persépolis: colunas altas com capitéis de touro duplo
function colunaPersa(x, y, h, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); rr(-30, -h, 60, h, 4, '#d8c4a0'); rr(4, -h, 26, h, 3, '#b8a07a'); for (let k = 0; k < 6; k++) line(-22 + k * 9, -h, -22 + k * 9, 0, 'rgba(0,0,0,.08)', 2); rr(-44, -20, 88, 20, 3, '#c8b490');
  // capitel de dois touros
  for (const sx of [-1, 1]) { c.save(); c.scale(sx, 1); bezPoly([[0, -h - 10], [70, -h - 20], [110, -h - 60], [96, -h - 80], [60, -h - 70], [20, -h - 60]], '#a88a5a'); poly([[96, -h - 80], [110, -h - 96], [104, -h - 64]], '#e9dfc8'); line(74, -h - 30, 74, -h - 6, '#8a6e44', 8); c.restore() } c.restore() }
// mapa da Grécia (contornos simplificados, em longitude/latitude)
const GEO = (lon, lat) => [80 + (lon - 19.5) * 105, 420 + (41.8 - lat) * 150];
const TERRAS = {
  continente: [[19.5, 41.8], [23.5, 41.8], [24.5, 40.9], [23.8, 40.3], [22.6, 40.5], [22.9, 39.9], [23.3, 39.2], [22.8, 38.9], [23.2, 38.7], [24.0, 38.2], [23.9, 37.7], [23.1, 38.0], [22.7, 38.3], [21.5, 38.4], [21.1, 38.6], [20.7, 39.1], [20.1, 39.7], [19.8, 40.6]],
  peloponeso: [[21.4, 38.25], [22.2, 38.15], [22.9, 37.95], [23.2, 37.5], [22.75, 37.2], [23.1, 36.45], [22.5, 36.45], [22.4, 36.85], [22.1, 36.6], [21.7, 36.8], [21.6, 37.4], [21.1, 37.7], [21.3, 38.1]],
  eubeia: [[22.9, 39.0], [23.6, 38.6], [24.3, 38.2], [24.6, 38.0], [24.1, 38.1], [23.3, 38.5], [22.85, 38.85]],
  asia: [[26.2, 41.8], [28.6, 41.8], [28.6, 36.4], [27.4, 36.7], [27.2, 37.4], [26.6, 38.2], [26.3, 38.6], [26.9, 39.4], [26.1, 39.5], [26.3, 40.1], [26.7, 40.4], [26.2, 40.9]],
};
const LUGAR = { termopilas: [22.55, 38.8], esparta: [22.43, 37.07], atenas: [23.73, 37.98], salamina: [23.5, 37.95], plateias: [23.27, 38.21], helesponto: [26.4, 40.2] };
function mapaGrecia(t, o = {}) {
  c.fillStyle = lg(0, 380, 0, 1300, [[0, '#1e4a54'], [1, '#123038']]); c.fillRect(0, 380, W, 940); c.strokeStyle = 'rgba(240,230,200,.06)'; c.lineWidth = 2; for (let k = 0; k < 8; k++) { c.beginPath(); c.moveTo(0, 420 + k * 120); c.lineTo(W, 420 + k * 120); c.stroke() }
  for (const [k, pts] of Object.entries(TERRAS)) { const P2 = pts.map(p => GEO(...p)); c.save(); c.translate(6, 8); poly(P2, 'rgba(0,0,0,.3)'); c.restore(); poly(P2, k === 'asia' ? (o.persia ? '#7a4a6a' : '#b89a6a') : '#d8bc84', '#f2e2b8', 3) }
  if (o.persia) { const [x, y] = GEO(27.5, 39.5); rom('PÉRSIA', x, y, 40, '#f2e2b8', { w: 700, ls: 6 }) }
  (o.marcas || []).forEach(([nome, txt0, cor, a0]) => { const [x, y] = GEO(...LUGAR[nome]), a = o.tl == null ? 1 : ramp(o.tl, a0 ?? 0, (a0 ?? 0) + .3); if (a <= 0) return; c.save(); c.globalAlpha = a; disc(x, y, 14, cor || P.carmim); c.strokeStyle = '#fff'; c.lineWidth = 3; c.beginPath(); c.arc(x, y, 14, 0, 7); c.stroke(); if (nome === o.pulsa) { c.strokeStyle = cor || P.carmim; c.lineWidth = 5; c.beginPath(); c.arc(x, y, 20 + (t * 40 % 40), 0, 7); c.stroke() } txt(txt0, x + (o.dir?.[nome] ?? 24), y + 14, 40, '#fbf6ec', { align: (o.dir?.[nome] ?? 24) < 0 ? 'right' : 'left' }); c.restore() });
  c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(0, 380, W, 8); c.fillRect(0, 1312, W, 8); meandro(40, 396, 1000, 20, 'rgba(233,194,122,.6)'); meandro(40, 1284, 1000, 20, 'rgba(233,194,122,.6)');
}
// seta animada sobre o mapa (pontos em lon/lat)
function setaMapa(pts, u, cor = P.carmim, w = 16, tela = false) {
  const P2 = tela ? pts : pts.map(p => GEO(...p)); let tot = 0; const seg = []; for (let i = 1; i < P2.length; i++) { const d = Math.hypot(P2[i][0] - P2[i - 1][0], P2[i][1] - P2[i - 1][1]); seg.push(d); tot += d }
  let rest = tot * u; c.strokeStyle = cor; c.lineWidth = w; c.lineCap = 'round'; c.setLineDash([w * 1.6, w * .9]); c.beginPath(); c.moveTo(...P2[0]); let fim = P2[0], ang = 0;
  for (let i = 1; i < P2.length && rest > 0; i++) { const k = Math.min(1, rest / seg[i - 1]); fim = [lerp(P2[i - 1][0], P2[i][0], k), lerp(P2[i - 1][1], P2[i][1], k)]; ang = Math.atan2(P2[i][1] - P2[i - 1][1], P2[i][0] - P2[i - 1][0]); c.lineTo(...fim); rest -= seg[i - 1] }
  c.stroke(); c.setLineDash([]); if (u > .02) { c.save(); c.translate(...fim); c.rotate(ang); poly([[w * 2, 0], [-w * 1.2, -w * 1.5], [-w * 1.2, w * 1.5]], cor); c.restore() }
}
// trirreme grega (de lado): casco escuro, olho pintado, esporão de bronze, três fileiras de remos
function trirreme(x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s * (o.esq ? -1 : 1), s);
  const casco = o.casco || '#2a1c14';
  if (o.vela) { line(0, -60, 0, -360, '#4a3420', 10); rr(-120, -340, 240, 220, 6, '#e9dfc8'); rr(0, -340, 120, 220, 6, '#cfc2a4'); if (o.simbolo) { c.save(); c.translate(0, -230); c.strokeStyle = P.carmim; c.lineWidth = 16; c.beginPath(); c.moveTo(-50, 50); c.lineTo(0, -50); c.lineTo(50, 50); c.stroke(); c.restore() } }
  bezPoly([[-340, -70], [-380, -110], [-360, -60], [-300, 0], [300, 0], [380, -40], [420, -40], [420, -20], [340, 10], [-320, 10]], casco);
  rr(-320, -70, 640, 26, 4, '#3e2a1c'); c.fillStyle = '#c8a46a'; c.fillRect(-320, -60, 640, 6); for (let k = 0; k < 3; k++) for (let i = 0; i < 26; i++) { const ox = -300 + i * 23, a = sin(t * 3 + i * .3 + k) * .25 + .5; c.save(); c.translate(ox, -30 + k * 14); c.rotate(a); c.fillStyle = '#8a6a3e'; c.fillRect(0, 0, 4, 120); c.restore() }
  poly([[380, -40], [440, -26], [380, -14]], BZ[3]); el(310, -42, 16, 9, '#efe6d4'); disc(314, -42, 6, '#120806');
  c.restore();
}
// chuva de flechas cobrindo o céu
function flechas(t, n, dens, o = {}) { const q = rng(o.seed || 5); c.strokeStyle = o.cor || 'rgba(20,10,8,.85)'; c.lineWidth = o.w || 3; for (let i = 0; i < n; i++) { const ph = (t * (o.vel || .5) + q()) % 1, x0 = q() * (W + 800) - (o.dir ?? 1) * 200, y0 = q() * 900 * dens, x = x0 + (o.dir ?? 1) * ph * 700, y = y0 + ph * 900, a = .5 * (o.dir ?? 1); c.beginPath(); c.moveTo(x, y); c.lineTo(x - (o.dir ?? 1) * 40, y - 30); c.stroke(); poly([[x, y], [x - (o.dir ?? 1) * 10, y - 2], [x - (o.dir ?? 1) * 4, y - 10]], c.strokeStyle) } }
// massa de exército persa ao longe: fileiras de silhuetas com lanças e estandartes
function exercitoLonge(t, y0, y1, n, o = {}) {
  const q = rng(o.seed || 7); for (let r = 0; r < n; r++) { const k = r / Math.max(1, n - 1), y = lerp(y0, y1, k), s = lerp(.06, .22, k), col = o.cor || `rgb(${Math.round(lerp(60, 30, k))},${Math.round(lerp(40, 20, k))},${Math.round(lerp(50, 26, k))})`, sp = 260 * s, ox = (t * 30 * s * (o.vel ?? 1)) % sp;
    c.fillStyle = col; for (let x = -sp + ox + (r % 2) * sp / 2; x < W + sp; x += sp * .55) { const h = 420 * s; c.fillRect(x - 14 * s * 4, y - h, 28 * s * 4, h); disc(x, y - h - 18 * s * 4, 16 * s * 4, col); c.fillRect(x + 20 * s * 4, y - h * 1.7, 3 * s * 4 + 1, h * 1.7) }
    if (r % 3 === 1) for (let x = 120 + q() * 200; x < W; x += 260 + q() * 200) { const h = 900 * s; line(x, y, x, y - h, col, 4 * s * 4); rr(x, y - h, 120 * s * 2, 70 * s * 2, 3, o.band || '#8a2a4a') } }
}
// pedra com inscrição (epitáfio)
function lapide(x, y, s, o = {}) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(-300, 20, 640, 30); rr(-310, -560, 620, 580, 10, '#b8ae9a'); rr(0, -560, 310, 580, 10, '#9a907c'); const q = rng(3); for (let i = 0; i < 80; i++) disc(-300 + q() * 600, -550 + q() * 560, 1 + q() * 3, `rgba(${q() < .5 ? '60,50,40' : '230,220,200'},.3)`); c.strokeStyle = 'rgba(60,50,40,.4)'; c.lineWidth = 3; c.beginPath(); c.moveTo(220, -560); c.lineTo(180, -470); c.lineTo(200, -420); c.stroke(); c.restore() }
