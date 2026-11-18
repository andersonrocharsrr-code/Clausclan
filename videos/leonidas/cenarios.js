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
  ceu(t, o.ceu || 'aurora', { sx: 840, sy: 600, hz: 860 }); montes(860, [[180, '#6a5440', '#4e3c2c', 150]], { pinheiros: false, nevoa: true });
  c.save(); c.beginPath(); c.moveTo(540, 852); c.quadraticCurveTo(640, 1300, 780, H); c.lineTo(W, H); c.lineTo(W, 852); c.clip(); mar(852, t, { brilho: 840 }); c.restore();
  c.fillStyle = '#d8bc84'; c.beginPath(); c.moveTo(440, 852); c.lineTo(548, 852); c.quadraticCurveTo(648, 1300, 790, H); c.lineTo(250, H); c.quadraticCurveTo(420, 1300, 440, 852); c.fill();
  c.fillStyle = '#efe0b4'; c.beginPath(); c.moveTo(540, 852); c.quadraticCurveTo(640, 1300, 790, H); c.lineTo(740, H); c.quadraticCurveTo(610, 1300, 532, 852); c.fill();
  c.fillStyle = '#c8a46a'; c.beginPath(); c.moveTo(478, 852); c.lineTo(496, 852); c.quadraticCurveTo(540, 1300, 560, H); c.lineTo(470, H); c.quadraticCurveTo(500, 1300, 478, 852); c.fill();
  { const q = rng(21); for (let i = 0; i < 40; i++) { const p = q(), y = 860 + p * p * (H - 860), xl = lerp(440, 300, p * p), xr = lerp(545, 760, p * p), x = lerp(xl, xr, q()); el(x, y, 2 + p * 10, 1 + p * 5, 'rgba(120,90,50,.4)') } }
  for (let k = 0; k < 5; k++) { const ph = (t * .3 + k * .2) % 1, x = 520 + k * 22, y = 1000 + k * 110; pill(x + ph * 30, y - ph * 140, 50 + ph * 90, 20, `rgba(245,240,230,${.45 * (1 - ph)})`) }
  if (o.muro !== false) { c.save(); c.translate(500, 1060); c.rotate(.06); for (let k = 0; k < 8; k++) rr(-90 + (k % 4) * 46, -16 - Math.floor(k / 4) * 16, 44, 14, 3, k % 2 ? '#d8c8a8' : '#bca880'); c.restore(); for (let k = 0; k < 5; k++) { const x = 470 + k * 24; poly([[x, 1110], [x + 10, 1090], [x + 20, 1110]], '#e9dfc8') } }
  // o maciço à esquerda (montanha alta, com faces, fendas e estratos)
  c.save(); c.beginPath(); c.moveTo(0, 0); c.lineTo(560, 0); c.lineTo(500, 600); c.lineTo(452, 852); c.quadraticCurveTo(430, 1300, 262, H); c.lineTo(0, H); c.clip();
  c.save(); c.scale(1.5, 1); montes(1000, [[760, '#7a6040', '#56422c', 152]], { pinheiros: false, nevoa: true, nevoaA: .12 }); montes(1420, [[720, '#8a6e48', '#62503a', 153]], { pinheiros: false, nevoa: true, nevoaA: .1 }); montes(H + 40, [[640, '#9a7c52', '#6e5a40', 154]], {}); c.restore();
  c.restore();
  c.fillStyle = 'rgba(30,20,10,.35)'; c.beginPath(); c.moveTo(500, 600); c.lineTo(452, 852); c.quadraticCurveTo(430, 1300, 262, H); c.lineTo(230, H); c.quadraticCurveTo(410, 1300, 436, 852); c.lineTo(486, 600); c.fill();
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
  chaoDet(980, '#7a8a4a', '#6a7a3e', { seed: 5, mato: 'rgba(50,70,24,.7)' });
  c.fillStyle = 'rgba(120,90,40,.35)'; c.beginPath(); c.moveTo(640, 1000); c.lineTo(500, 1000); c.lineTo(380, H); c.lineTo(820, H); c.fill(); { const q = rng(6); for (let i = 0; i < 40; i++) { const p = q(), yy = 1000 + p * p * (H - 1000), x = lerp(570, 600, q()) + (q() - .5) * lerp(140, 440, p * p); el(x, yy, 4 + p * 16, 2 + p * 8, 'rgba(200,180,140,.5)') } }
  c.save(); c.beginPath(); c.moveTo(820, 1300); c.lineTo(W, 1260); c.lineTo(W, H); c.lineTo(860, H); c.clip(); c.fillStyle = '#8a6a3a'; c.fillRect(800, 1250, 300, 700); c.strokeStyle = 'rgba(60,40,16,.5)'; c.lineWidth = 6; for (let k = 0; k < 12; k++) { c.beginPath(); c.moveTo(820 + k * 30, 1300); c.lineTo(840 + k * 70, H); c.stroke() } c.restore();
  { const q = rng(8); for (let x = 0; x < 430; x += 26) { const hh = 18 + q() * 10; el(x, 1300 - x * .05, 16, hh * .6, '#9a8a70'); el(x - 4, 1296 - x * .05, 12, hh * .4, '#b8a888') } }
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

// ================= Versões detalhadas (substituem as simples acima) =================
// montanhas: cada pico com face de luz e de sombra, cristas, fendas, estratos de rocha, neve recortada,
// névoa no pé de cada camada e pinheiros na base da camada da frente
function montes(base, camadas, o = {}) {
  camadas.forEach(([h, c1, c2, seed], k) => {
    const q = rng(seed), picos = []; let x = -160;
    while (x < W + 260) { const w = 200 + q() * 300, ph = h * (.45 + q() * .55); picos.push([x, w, ph, q() * 1e6 | 0]); x += w * (.5 + q() * .3) }
    picos.sort((a, b) => b[2] - a[2]);
    // fundo contínuo da camada (sem buracos entre picos)
    c.fillStyle = c2; c.fillRect(-10, base - h * .22, W + 20, H - base + h * .22);
    picos.forEach(([px, w, ph, sd]) => {
      const r = rng(sd), sx = px + (r() - .5) * w * .2, sy = base - ph, L = [], R = [];
      for (let i = 1; i <= 4; i++) { const u = i / 5; L.push([lerp(sx, px - w / 2, u) + (r() - .5) * w * .07, lerp(sy, base, u) + (r() - .5) * ph * .06]); R.push([lerp(sx, px + w / 2, u) + (r() - .5) * w * .07, lerp(sy, base, u) + (r() - .5) * ph * .06]) }
      const pe = [[px - w / 2, base + 4], [px + w / 2, base + 4]], crista = [sx, sy], meio = [sx + w * .08, base + 4];
      poly([pe[0], ...L.slice().reverse(), crista, ...R, pe[1]], c2);                    // silhueta (sombra)
      poly([pe[0], ...L.slice().reverse(), crista, [sx + w * .03, sy + ph * .35], [sx - w * .04, sy + ph * .7], meio], c1); // face de luz
      // cristas secundárias e fendas
      for (let j = 0; j < 3; j++) { const u = .2 + r() * .5, p0 = [lerp(sx, px - w / 2, u), lerp(sy, base, u)], p1 = [p0[0] + w * (.05 + r() * .1), p0[1] + ph * (.25 + r() * .25)]; poly([p0, p1, [p1[0] + 10, p1[1] - 6], [p0[0] + 6, p0[1] + 4]], 'rgba(0,0,0,.18)') }
      for (let j = 0; j < 3; j++) { const u = .25 + r() * .5, p0 = [lerp(sx, px + w / 2, u), lerp(sy, base, u)], p1 = [p0[0] - w * (.04 + r() * .08), p0[1] + ph * (.2 + r() * .25)]; poly([p0, p1, [p1[0] + 8, p1[1] - 4], [p0[0] + 8, p0[1] + 2]], 'rgba(255,240,220,.08)') }
      c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 2; for (let j = 0; j < 5; j++) { const yy = sy + ph * (.35 + r() * .55), xx = sx + (r() - .6) * w * .5; c.beginPath(); c.moveTo(xx, yy); c.lineTo(xx + 30 + r() * 50, yy + (r() - .5) * 10); c.stroke() }
      c.strokeStyle = 'rgba(255,240,220,.18)'; c.lineWidth = 2; c.beginPath(); c.moveTo(...crista); c.lineTo(sx + w * .03, sy + ph * .35); c.lineTo(sx - w * .04, sy + ph * .7); c.stroke();
      // neve: capa recortada com dentes descendo pelas fendas
      if (o.neve && k === 0 && ph > h * .6) {
        const nv = .26 + r() * .1, a = [lerp(sx, L[0][0], 1), 0]; const pts = [crista]; const n = 7;
        for (let i = 0; i <= n; i++) { const u = i / n, xl = lerp(lerp(sx, px - w / 2, nv * 1.2), lerp(sx, px + w / 2, nv * 1.2), u), yl = sy + ph * nv * (1 + (i % 2 ? .35 : -.1) + (r() - .5) * .3); pts.push([xl, yl]) }
        poly([crista, ...pts.slice(1, 5), [sx + w * .03, sy + ph * .32]], 'rgba(244,240,234,.95)'); poly([crista, [sx + w * .03, sy + ph * .32], ...pts.slice(4)], 'rgba(196,206,222,.92)');
      }
    });
    // névoa no pé da camada
    if (k < camadas.length - 1 || o.nevoa) { c.fillStyle = lg(0, base - h * .35, 0, base + 10, [[0, 'rgba(255,226,190,0)'], [1, `rgba(255,226,190,${o.nevoaA ?? .16})`]]); c.fillRect(0, base - h * .35, W, h * .35 + 10) }
    // pinheiros na base da camada da frente
    if (k === camadas.length - 1 && o.pinheiros !== false) { const qq = rng(seed + 9); for (let x2 = -20; x2 < W + 20; x2 += 18 + qq() * 26) { const hh = 22 + qq() * 40, y2 = base + 6 - qq() * 18; poly([[x2, y2 - hh], [x2 + hh * .28, y2], [x2 - hh * .28, y2]], 'rgba(20,24,14,.55)'); poly([[x2, y2 - hh], [x2 + hh * .28, y2], [x2, y2]], 'rgba(0,0,0,.25)') } }
  });
}
// casa espartana: paredes de pedra e reboco, telhado de telhas, janela com veneziana, porta, varal de sombra
function casa(x, y, s, cor = '#c8a478') {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(10, 2, 80, 10, 0, 0, 7); c.fill();
  rr(-60, -70, 120, 70, 2, cor); rr(10, -70, 50, 70, 2, 'rgba(0,0,0,.2)'); const q = rng(x | 0);
  for (let i = 0; i < 10; i++) { const bx = -56 + q() * 100, by = -64 + q() * 56; rr(bx, by, 14 + q() * 12, 7, 2, 'rgba(90,60,30,.18)') } rr(-60, -14, 120, 14, 0, 'rgba(90,60,30,.25)');
  poly([[-72, -68], [0, -112], [72, -68]], '#9a4a2a'); poly([[0, -112], [72, -68], [0, -68]], '#7a3a20'); c.strokeStyle = 'rgba(60,20,10,.45)'; c.lineWidth = 2; for (let k = 1; k < 5; k++) { const yy = -112 + k * 9; c.beginPath(); c.moveTo(-72 * k / 4.9, yy); c.lineTo(72 * k / 4.9, yy); c.stroke() } for (let k = -6; k <= 6; k++) { c.beginPath(); c.moveTo(k * 3, -110); c.lineTo(k * 12, -69); c.stroke() }
  rr(-74, -70, 148, 6, 2, '#5a2a14'); rr(-16, -42, 26, 42, 2, '#3a2214'); rr(-16, -42, 12, 42, 2, '#4a2c1a'); disc(6, -20, 2, BZ[3]);
  rr(24, -54, 22, 20, 1, '#2a1a10'); rr(22, -56, 26, 3, 1, '#e9dfc8'); rr(46, -54, 6, 20, 1, '#5d6b3a'); rr(18, -54, 6, 20, 1, '#5d6b3a');
  c.restore();
}
// templo dórico: três degraus, colunas caneladas com sombra, arquitrave, tríglifos, frontão com relevo e acrotérios
function templo(x, y, s, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  for (let k = 0; k < 3; k++) { rr(-212 + k * 8, -14 - k * 14, 424 - k * 16, 14, 1, k % 2 ? '#d8ccb0' : '#e6dcc4'); rr(-212 + k * 8 + 212, -14 - k * 14, 212 - k * 8, 14, 1, 'rgba(0,0,0,.1)') }
  rr(-190, -220, 380, 180, 0, '#3a2c20'); if (o.fogo) { fogo(0, -42, 1, o.t || 0) }
  for (let k = 0; k < 6; k++) { const cx = -160 + k * 64; c.fillStyle = bands(cx - 15, 0, cx + 15, 0, [[.2, '#fbf4e4'], [.55, '#efe6d4'], [.8, '#d8ccb0'], [1, '#b8ab8e']]); c.fillRect(cx - 15, -222, 30, 182); for (let f = -2; f <= 2; f++) line(cx + f * 6, -222, cx + f * 6, -42, 'rgba(90,70,40,.15)', 1.5); rr(cx - 19, -232, 38, 10, 2, '#e6dcc4'); rr(cx - 17, -238, 34, 6, 1, '#d8ccb0') }
  rr(-198, -266, 396, 28, 1, '#e6dcc4'); rr(-198, -266, 396, 6, 1, '#f6efdc'); for (let k = 0; k < 13; k++) { rr(-192 + k * 30.5, -262, 12, 22, 1, '#7a6a52'); line(-188 + k * 30.5, -262, -188 + k * 30.5, -240, '#5a4a36', 1.5) } rr(-198, -272, 396, 6, 1, '#cfc2a4');
  poly([[-212, -272], [0, -350], [212, -272]], '#efe6d4'); poly([[0, -350], [212, -272], [0, -272]], '#d8ccb0'); poly([[-176, -280], [0, -340], [176, -280]], '#cbbf9f');
  for (let k = -3; k <= 3; k++) { const px = k * 40, ph = 50 - Math.abs(k) * 12; rr(px - 8, -280 - ph, 16, ph, 4, '#b8ab8e'); disc(px, -284 - ph, 7, '#b8ab8e') }
  poly([[-214, -272], [-226, -296], [-202, -280]], P.bronze); poly([[214, -272], [226, -296], [202, -280]], P.bronze); disc(0, -354, 9, P.bronze);
  c.restore();
}
// coluna persa: fuste canelado com sombra, base em sino e capitel de dois touros
function colunaPersa(x, y, h, s = 1) {
  c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = bands(-30, 0, 30, 0, [[.2, '#efe0bc'], [.55, '#d8c4a0'], [.8, '#b8a07a'], [1, '#98805a']]); c.fillRect(-30, -h, 60, h); for (let k = -3; k <= 3; k++) line(k * 8, -h, k * 8, -40, 'rgba(60,40,20,.14)', 2);
  bezPoly([[-52, 0], [-52, -20], [-34, -46], [34, -46], [52, -20], [52, 0]], '#c8b490'); bezPoly([[0, -46], [34, -46], [52, -20], [52, 0], [0, 0]], 'rgba(0,0,0,.15)'); for (let k = 0; k < 4; k++) line(-48, -6 - k * 10, 48, -6 - k * 10, 'rgba(60,40,20,.15)', 2);
  rr(-40, -h - 30, 80, 30, 3, '#c8b490'); for (let k = 0; k < 8; k++) el(-35 + k * 10, -h - 15, 5, 13, 'rgba(60,40,20,.15)');
  for (const sx of [-1, 1]) { c.save(); c.scale(sx, 1); bezPoly([[0, -h - 30], [76, -h - 34], [116, -h - 70], [108, -h - 96], [70, -h - 90], [20, -h - 74]], sx < 0 ? '#b8986a' : '#9a7a4e'); bezPoly([[108, -h - 96], [124, -h - 116], [116, -h - 80]], '#e9dfc8'); bezPoly([[86, -h - 92], [90, -h - 108], [96, -h - 92]], '#e9dfc8'); disc(100, -h - 80, 4, '#2a1a10'); line(80, -h - 40, 80, -h - 30, '#7a5e36', 10); line(56, -h - 40, 56, -h - 30, '#7a5e36', 10); c.strokeStyle = 'rgba(60,40,20,.3)'; c.lineWidth = 2; for (let k = 0; k < 4; k++) { c.beginPath(); c.arc(44, -h - 64, 6 + k * 4, PI, PI * 1.6); c.stroke() } c.restore() }
  c.restore();
}
// pedra do epitáfio: bloco com bisel, lascas, liquens e rachadura
function lapide(x, y, s, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(20, 26, 360, 26, 0, 0, 7); c.fill();
  poly([[-310, 20], [-310, -540], [-290, -560], [290, -560], [310, -540], [310, 20]], '#b8ae9a'); poly([[0, -560], [290, -560], [310, -540], [310, 20], [0, 20]], '#9a907c'); poly([[-310, -540], [-290, -560], [290, -560], [270, -540]], '#d0c6b2'); poly([[-310, 20], [-310, -540], [-292, -530], [-292, 20]], '#c8bea8');
  const q = rng(3); for (let i = 0; i < 140; i++) disc(-300 + q() * 600, -550 + q() * 560, 1 + q() * 3, `rgba(${q() < .5 ? '60,50,40' : '230,220,200'},.28)`); for (let i = 0; i < 6; i++) el(-280 + q() * 560, -40 + q() * 50, 20 + q() * 30, 8 + q() * 10, 'rgba(110,120,70,.35)');
  poly([[310, -380], [290, -360], [310, -330]], '#3a2c20'); poly([[-310, -120], [-290, -100], [-310, -86]], '#3a2c20');
  c.strokeStyle = 'rgba(60,50,40,.45)'; c.lineWidth = 3; c.beginPath(); c.moveTo(220, -560); c.lineTo(180, -470); c.lineTo(200, -420); c.lineTo(170, -360); c.stroke();
  c.restore();
}
// chão com camadas, pedras, tufos de mato e rachaduras (perspectiva: maior perto da câmera)
function chaoDet(y, c1, c2, o = {}) {
  c.fillStyle = c1; c.fillRect(0, y, W, H - y); c.fillStyle = c2; c.fillRect(0, y, W, 14);
  const q = rng(o.seed || (y | 0));
  for (let k = 0; k < 4; k++) { const yy = y + 30 + k * (H - y) / 4.5; c.fillStyle = k % 2 ? 'rgba(0,0,0,.07)' : 'rgba(255,240,210,.05)'; c.beginPath(); c.moveTo(0, yy); for (let x = 0; x <= W; x += 60) c.lineTo(x, yy + sin(x * .01 + k * 2) * 10 + (q() - .5) * 6); c.lineTo(W, H); c.lineTo(0, H); c.fill() }
  for (let i = 0; i < 70; i++) { const yy = y + 20 + Math.pow(q(), .7) * (H - y - 20), p = (yy - y) / (H - y), r0 = 3 + p * 22 * (.4 + q()), x = q() * W; el(x, yy, r0 * 1.4, r0 * .7, 'rgba(60,40,24,.35)'); el(x - r0 * .2, yy - r0 * .2, r0 * 1.2, r0 * .55, 'rgba(230,210,170,.35)'); el(x + r0 * .3, yy, r0 * .7, r0 * .4, 'rgba(0,0,0,.18)') }
  c.strokeStyle = o.mato || 'rgba(70,80,36,.7)'; c.lineCap = 'round'; for (let i = 0; i < 60; i++) { const yy = y + 10 + q() * (H - y), p = (yy - y) / (H - y), hh = 6 + p * 30, x = q() * W; c.lineWidth = 1.5 + p * 2.5; for (let j = -1; j <= 1; j++) { c.beginPath(); c.moveTo(x, yy); c.lineTo(x + j * hh * .4, yy - hh); c.stroke() } }
  c.strokeStyle = 'rgba(40,24,12,.25)'; c.lineWidth = 2; for (let i = 0; i < 10; i++) { let x = q() * W, yy = y + 40 + q() * (H - y - 60); c.beginPath(); c.moveTo(x, yy); for (let j = 0; j < 4; j++) { x += 20 + q() * 40; yy += (q() - .5) * 16; c.lineTo(x, yy) } c.stroke() }
}
