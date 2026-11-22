// ================= Cosmos: galáxias, teia cósmica, buraco negro, James Webb, campo profundo, radiação cósmica =================
// galáxia espiral feita de partículas (pré-calculadas): braços em espiral logarítmica, núcleo, poeira e nebulosas
const GAL = {};
function particulas(seed, n, bracos) {
  if (GAL[seed]) return GAL[seed]; const q = rng(seed), a = [];
  for (let i = 0; i < n; i++) { const tipo = q(); let r, ang;
    if (tipo < .22) { r = Math.pow(q(), 2) * .22; ang = q() * 2 * PI; a.push([r, ang, 0, q()]) } // núcleo
    else if (tipo < .4) { r = .1 + Math.sqrt(q()) * .85; ang = q() * 2 * PI; a.push([r, ang, 4, q()]) } // disco difuso
    else { const b = (q() * bracos) | 0, u = Math.pow(q(), .8); r = .08 + u * .92; const sp = (q() + q() + q() - 1.5) * (.7 - u * .25); ang = b * 2 * PI / bracos + Math.log(r / .08) * 2.1 + sp; a.push([r * (1 + (q() - .5) * .08), ang, tipo < .9 ? 1 : tipo < .96 ? 2 : 3, q()]) } }
  GAL[seed] = a; return a;
}
function galaxia(x, y, R, t, o = {}) {
  const pts = particulas(o.seed || 7, o.n || 7000, o.bracos || 2), rot = (o.rot || 0) + t * (o.giro ?? .02), inc = o.inc ?? 1, ang = o.ang || 0, br = o.brilho ?? 1;
  c.save(); c.translate(x, y); c.rotate(ang); c.scale(1, inc);
  c.save(); c.globalCompositeOperation = 'lighter'; glow(0, 0, R * 1.05, '120,140,200', .18 * br); glow(0, 0, R * .4, '255,220,160', .5 * br); glow(0, 0, R * .15, '255,240,210', .8 * br);
  for (const [r, a0, tp, k] of pts) { const a = a0 + rot, px = cos(a) * r * R, py = sin(a) * r * R, s = Math.max(1, R * (.004 + k * .006));
    if (tp === 0) c.fillStyle = `rgba(255,${(210 + k * 30) | 0},${(150 + k * 50) | 0},${.5 * br})`; else if (tp === 1) c.fillStyle = k < .5 ? `rgba(170,190,255,${.45 * br})` : `rgba(240,235,255,${.4 * br})`; else if (tp === 2) c.fillStyle = `rgba(255,120,170,${.55 * br})`; else if (tp === 4) c.fillStyle = `rgba(230,220,210,${.16 * br})`; else { c.fillStyle = `rgba(200,220,255,${.9 * br})`; }
    c.fillRect(px, py, s, s) }
  for (let b = 0; b < (o.bracos || 2); b++) for (let k = 0; k < 26; k++) { const r = .12 + k / 26 * .8, a = b * 2 * PI / (o.bracos || 2) + Math.log(r / .08) * 2.1 + rot; glow(cos(a) * r * R, sin(a) * r * R, R * (.16 - k * .003), k % 3 ? '140,160,240' : '255,150,190', .16 * br) }
  c.restore();
  // faixas de poeira escura seguindo os braços
  if (o.poeira !== false) { c.strokeStyle = `rgba(20,14,10,${.28 * br})`; c.lineWidth = R * .03; for (let b = 0; b < (o.bracos || 2); b++) { c.beginPath(); for (let k = 0; k <= 40; k++) { const r = .12 + k / 40 * .8, a = b * 2 * PI / (o.bracos || 2) + Math.log(r / .08) * 2.1 + rot - .2; k ? c.lineTo(cos(a) * r * R, sin(a) * r * R) : c.moveTo(cos(a) * r * R, sin(a) * r * R) } c.stroke() } }
  c.restore();
}
function eliptica(x, y, r, cor = '255,220,170', ang = 0, k = .6) { c.save(); c.translate(x, y); c.rotate(ang); c.scale(1, k); glow(0, 0, r, cor, .8); glow(0, 0, r * .35, '255,245,225', .9); c.restore() }
// teia cósmica: nós e filamentos com milhares de pontinhos (galáxias)
const TEIA = (() => { const q = rng(55), nos = []; for (let i = 0; i < 26; i++) nos.push([q() * 1.4 - .2, q() * 1.4 - .2, .5 + q()]); const fil = []; nos.forEach((a, i) => nos.forEach((b, j) => { if (j > i && Math.hypot(a[0] - b[0], a[1] - b[1]) < .38) fil.push([a, b]) })); const pts = []; fil.forEach(([a, b]) => { for (let k = 0; k < 70; k++) { const u = q(), off = (q() - .5) * .035; pts.push([lerp(a[0], b[0], u) + off, lerp(a[1], b[1], u) + (q() - .5) * .035, q()]) } }); nos.forEach(([x, y, s]) => { for (let k = 0; k < 90 * s; k++) { const a = q() * 7, r = Math.pow(q(), 2) * .06 * s; pts.push([x + cos(a) * r, y + sin(a) * r, q()]) } }); return { nos, fil, pts } })();
function teia(t, cx, cy, S, o = {}) { const tt = t * (o.vel ?? .01); c.save(); c.translate(cx, cy); c.rotate(tt); c.globalCompositeOperation = 'lighter';
  TEIA.fil.forEach(([a, b]) => { c.strokeStyle = 'rgba(120,140,210,.10)'; c.lineWidth = S * .012; c.beginPath(); c.moveTo((a[0] - .5) * S, (a[1] - .5) * S); c.lineTo((b[0] - .5) * S, (b[1] - .5) * S); c.stroke() });
  TEIA.nos.forEach(([x, y, s]) => glow((x - .5) * S, (y - .5) * S, S * .07 * s, '255,200,140', .35));
  for (const [x, y, k] of TEIA.pts) { c.fillStyle = k < .3 ? 'rgba(255,210,160,.75)' : 'rgba(180,200,255,.6)'; c.fillRect((x - .5) * S, (y - .5) * S, 1.6 + k * 1.6, 1.6 + k * 1.6) } c.restore() }
// buraco negro com disco de acreção (lente gravitacional: o disco aparece por cima e por baixo)
function buracoNegro(x, y, r, t) { c.save(); c.translate(x, y); glow(0, 0, r * 4, '255,170,90', .35);
  const disco = (frente) => { c.save(); c.scale(1, .28); for (let k = 0; k < 40; k++) { const rr2 = r * (1.6 + k * .06), a0 = t * (2.5 - k * .04) + k; c.strokeStyle = `rgba(${255},${(180 - k * 2) | 0},${(90 - k) | 0},${.5 - k * .01})`; c.lineWidth = r * .07; c.beginPath(); c.arc(0, 0, rr2, frente ? 0 : PI, frente ? PI : 2 * PI); c.stroke(); disc(cos(a0) * rr2, (frente ? 1 : -1) * Math.abs(sin(a0)) * rr2, r * .05, 'rgba(255,240,200,.7)') } c.restore() };
  disco(false); c.strokeStyle = 'rgba(255,210,140,.8)'; c.lineWidth = r * .18; c.beginPath(); c.arc(0, 0, r * 1.25, PI * 1.05, PI * 1.95); c.stroke(); disc(0, 0, r, '#000'); c.strokeStyle = 'rgba(255,240,200,.95)'; c.lineWidth = r * .05; c.beginPath(); c.arc(0, 0, r * 1.03, 0, 7); c.stroke(); disco(true); c.restore() }
// James Webb: 18 hexágonos dourados, espelho secundário, escudo solar em 5 camadas
function jwst(x, y, s, t) { c.save(); c.translate(x, y); c.scale(s, s);
  for (let k = 0; k < 5; k++) { const o = k * 14; poly([[-360 + o, 300 - o * .3], [0, 180 - o], [360 - o, 300 - o * .3], [0, 420 - o * .4]], k % 2 ? '#b8a8c8' : '#d8cce0') } c.fillStyle = 'rgba(255,255,255,.15)'; poly([[-300, 300], [0, 200], [0, 250], [-200, 310]], 'rgba(255,255,255,.18)');
  rr(-60, 180, 120, 70, 6, '#3a3a40'); line(0, 180, 0, 60, '#5a5a60', 10);
  const hx = (cx, cy, r) => { const p = []; for (let i = 0; i < 6; i++) p.push([cx + cos(i * PI / 3 + PI / 6) * r, cy + sin(i * PI / 3 + PI / 6) * r]); return p }, R = 50;
  const ax = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1], [2, 0], [2, -1], [2, -2], [1, -2], [0, -2], [-1, -1], [-2, 0], [-2, 1], [-2, 2], [-1, 2], [0, 2], [1, 1]];
  ax.forEach(([q2, r2]) => { const cx = R * Math.sqrt(3) * (q2 + r2 / 2), cy = R * 1.5 * r2 - 60, g = rg(cx - 22, cy - 22, 4, R * 1.3, [[0, '#fff4c0'], [.45, '#e8b840'], [1, '#9a6a14']]); poly(hx(cx, cy, R * .95), g); poly(hx(cx, cy, R * .95), null, 'rgba(70,45,8,.7)', 2.5); poly(hx(cx - 8, cy - 8, R * .35), 'rgba(255,255,230,.18)') });
  for (const [sx, sy] of [[-1, 1], [1, 1], [0, -1]]) line(sx * 160, sy * 150 - 60, 0, -300, '#8a8a90', 5); disc(0, -300, 22, '#d8b850'); add(() => glow(-60, -120, 220, '255,230,160', .25 + .1 * sin(t * 2)));
  c.restore() }
// campo profundo: centenas de galáxias de formas, cores e tamanhos diferentes, arcos de lente e estrelas com 6 pontas
const CAMPO = (() => { const q = rng(303), a = []; for (let i = 0; i < 420; i++) a.push([q(), q(), q(), q(), q(), q()]); return a })();
function campoProfundo(t, z = 1, cx = 540, cy = 900) { c.fillStyle = '#04050a'; c.fillRect(0, 0, W, H); c.save(); c.translate(cx, cy); c.scale(z, z); c.translate(-cx, -cy); c.globalCompositeOperation = 'lighter';
  for (const [u, v, s, k, a, b] of CAMPO) { const x = u * W, y = v * H, r = 3 + Math.pow(s, 3) * 46, cor = k < .35 ? '255,180,120' : k < .55 ? '255,120,80' : k < .8 ? '190,210,255' : '255,235,200';
    if (b < .5) { c.save(); c.translate(x, y); c.rotate(a * 7); c.scale(1, .3 + a * .6); glow(0, 0, r, cor, .7); if (r > 16) { c.strokeStyle = `rgba(${cor},.5)`; c.lineWidth = r * .1; for (let m = 0; m < 2; m++) { c.beginPath(); for (let j = 0; j < 20; j++) { const rr2 = r * (.2 + j / 20 * .9), aa = m * PI + j * .32; j ? c.lineTo(cos(aa) * rr2, sin(aa) * rr2) : c.moveTo(cos(aa) * rr2, sin(aa) * rr2) } c.stroke() } } c.restore() } else eliptica(x, y, r * .8, cor, a * 7, .5 + a * .5) }
  c.strokeStyle = 'rgba(255,200,140,.55)'; c.lineWidth = 4; for (const [x, y, r, a] of [[620, 860, 150, .4], [630, 880, 210, 1.9], [520, 830, 260, 3.6]]) { c.beginPath(); c.arc(x, y, r, a, a + .7); c.stroke() } eliptica(600, 860, 50, '255,230,180', .2, .8);
  for (const [x, y, s] of [[260, 420, 40], [880, 1260, 55], [760, 340, 30], [180, 1500, 34]]) { glow(x, y, s, '255,250,240', .9); for (let k = 0; k < 6; k++) { const a = k * PI / 3 + PI / 2; c.strokeStyle = 'rgba(255,250,240,.6)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + cos(a) * s * 3.4, y + sin(a) * s * 3.4); c.stroke() } line(x - s * 1.6, y, x + s * 1.6, y, 'rgba(255,250,240,.35)', 1.5) }
  c.restore() }
// radiação cósmica de fundo: esfera manchada (azul-frio e laranja-quente)
const CMB = (() => { const q = rng(9), a = []; for (let i = 0; i < 520; i++) a.push([q(), q(), q(), q()]); return a })();
function radiacaoFundo(x, y, r, t) { c.save(); c.beginPath(); c.ellipse(x, y, r, r, 0, 0, 7); c.clip(); c.fillStyle = '#c87a3a'; c.fillRect(x - r, y - r, 2 * r, 2 * r); for (const [u, v, s, k] of CMB) el(x - r + u * 2 * r, y - r + v * 2 * r, r * (.03 + s * .08), r * (.02 + s * .06), k < .5 ? 'rgba(60,110,200,.55)' : k < .75 ? 'rgba(240,190,90,.5)' : 'rgba(200,70,40,.45)', s * 5); c.fillStyle = rg(x - r * .35, y - r * .35, r * .1, r * 1.1, [[0, 'rgba(255,255,255,.12)'], [.7, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.55)']]); c.fillRect(x - r, y - r, 2 * r, 2 * r); c.restore(); c.strokeStyle = 'rgba(240,200,140,.6)'; c.lineWidth = 4; c.beginPath(); c.arc(x, y, r, 0, 7); c.stroke() }
// laranja e grão de areia
function laranja(x, y, r) { glow(x, y, r * 1.6, '255,170,60', .25); disc(x, y, r, '#e8861e'); disc(x - r * .25, y - r * .25, r * .7, '#f4a03a'); const q = rng(4); for (let i = 0; i < 60; i++) { const a = q() * 7, d = Math.sqrt(q()) * r * .9; disc(x + cos(a) * d, y + sin(a) * d, r * .025, 'rgba(160,80,10,.35)') } el(x + r * .05, y - r * .95, r * .14, r * .07, '#4a6a2a'); disc(x - r * .35, y - r * .4, r * .15, 'rgba(255,240,200,.35)') }
function grao(x, y, r) { glow(x, y, r * 6, '120,170,230', .35); disc(x, y, r, '#6aa0d8'); disc(x - r * .3, y - r * .3, r * .5, '#a8d0f0') }
// mapa do Brasil (contorno simplificado)
const BRASIL = [[.30, .02], [.45, 0], [.55, .08], [.66, .06], [.75, .14], [.86, .2], [1, .3], [.96, .42], [.88, .55], [.83, .68], [.72, .76], [.62, .85], [.55, .97], [.48, 1], [.44, .9], [.38, .8], [.35, .7], [.26, .66], [.2, .55], [.08, .5], [0, .4], [.05, .3], [.12, .22], [.2, .16], [.25, .08]];
function brasil(x, y, s, o = {}) { const P2 = BRASIL.map(([u, v]) => [x + (u - .5) * s, y + (v - .5) * s * 1.02]); c.save(); c.translate(8, 10); poly(P2, 'rgba(0,0,0,.4)'); c.restore(); poly(P2, o.cor || '#3a5a3a', o.borda || '#d9b35a', 4); return (u, v) => [x + (u - .5) * s, y + (v - .5) * s * 1.02] }
// mão aberta (palma para cima) segurando algo minúsculo
function mao(x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); const pele = '#d8a882', p0 = '#b8865e'; for (let k = 0; k < 4; k++) { c.save(); c.translate(-90 + k * 58, -150 - (k === 1 || k === 2 ? 30 : 0)); c.rotate((k - 1.5) * .08); rr(-24, -120 + (k === 3 ? 30 : 0), 48, 190 - (k === 3 ? 30 : 0), 24, pele); rr(6, -120 + (k === 3 ? 30 : 0), 18, 190 - (k === 3 ? 30 : 0), 12, p0); line(-14, -40, 14, -40, 'rgba(120,70,40,.4)', 2); c.restore() } c.save(); c.translate(140, 20); c.rotate(-.7); rr(-26, -110, 52, 150, 26, pele); c.restore(); el(0, 20, 170, 140, pele); el(40, 30, 120, 110, p0); el(-20, 0, 130, 100, '#e4b892'); c.strokeStyle = 'rgba(140,80,50,.35)'; c.lineWidth = 3; c.beginPath(); c.moveTo(-110, -20); c.quadraticCurveTo(0, 30, 110, -40); c.moveTo(-90, 50); c.quadraticCurveTo(0, 40, 80, 90); c.stroke(); c.restore() }
// silhueta de pessoa de costas olhando o céu, numa colina
function observador(x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); const k = '#07080c'; poly([[-26, 0], [-20, -150], [20, -150], [26, 0]], k); bezPoly([[-34, -150], [-40, -280], [0, -300], [40, -280], [34, -150]], k); disc(0, -330, 30, k); rr(-46, -280, 16, 130, 8, k); rr(30, -280, 16, 130, 8, k); c.restore() }

// ================= James Webb detalhado (substitui o anterior), vista de três quartos =================
function jwst(x, y, s, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  // escudo solar: 5 camadas em losango, separadas, com costuras e hastes
  for (let k = 4; k >= 0; k--) { const o = k * 16, cor = ['#efe6f4', '#e2d4ec', '#d4c2e2', '#c6b2d8', '#b8a2cc'][k];
    const L = [-560 + o * .6, 330 + o], T = [0, 190 + o * .7], R = [560 - o * .6, 330 + o], B = [0, 470 + o * .5]; poly([L, T, R, B], cor); poly([T, R, B, [0, 330 + o]], 'rgba(60,40,90,.12)');
    c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 2; c.beginPath(); c.moveTo(...L); c.lineTo(...T); c.lineTo(...R); c.stroke(); c.strokeStyle = 'rgba(90,70,120,.25)'; c.lineWidth = 1.2; for (let j = 1; j < 6; j++) { c.beginPath(); c.moveTo(lerp(L[0], T[0], j / 6), lerp(L[1], T[1], j / 6)); c.lineTo(lerp(B[0], R[0], j / 6), lerp(B[1], R[1], j / 6)); c.stroke() } }
  for (const [ax, ay] of [[-600, 336], [600, 336], [0, 176], [0, 500]]) line(ax * .9, ay, ax, ay + (ax ? 4 : 0), '#5a5a62', 6);
  poly([[590, 320], [660, 300], [670, 350], [600, 352]], '#d8cce0'); line(560, 330, 600, 336, '#6a6a72', 4); // aba de equilíbrio
  // corpo da nave sob o escudo: caixa com manta dourada, painel solar e antena
  rr(-90, 470, 180, 110, 6, '#2e2e34'); rr(-90, 470, 70, 110, 6, '#3e3e46'); for (let k = 0; k < 4; k++) line(-86, 486 + k * 24, 86, 486 + k * 24, 'rgba(230,190,90,.35)', 2);
  c.save(); c.translate(90, 540); c.rotate(.25); rr(0, -24, 220, 48, 3, '#1e2a48'); for (let k = 1; k < 8; k++) line(k * 27, -24, k * 27, 24, '#3a4a70', 2); line(0, 0, 220, 0, '#3a4a70', 2); c.restore(); c.save(); c.translate(-40, 600); c.rotate(.5); el(0, 0, 34, 12, '#d8d4c8'); line(0, -10, 0, -30, '#8a8a90', 4); c.restore();
  // torre e caixa dos instrumentos (ISIM) atrás do espelho
  rr(-26, 40, 52, 160, 4, '#4a4a52'); rr(-26, 40, 18, 160, 4, '#5e5e68'); rr(-120, -40, 240, 120, 8, '#1a1a20'); rr(-120, -40, 240, 26, 6, '#2a2a32');
  // espelho primário: estrutura escura + 18 hexágonos dourados (cada um com brilho próprio)
  c.save(); c.translate(0, -90); c.scale(1, .93);
  const R = 52, hx = (cx, cy, r) => { const p = []; for (let i = 0; i < 6; i++) p.push([cx + cos(i * PI / 3 + PI / 6) * r, cy + sin(i * PI / 3 + PI / 6) * r]); return p };
  const ax = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1], [2, 0], [2, -1], [2, -2], [1, -2], [0, -2], [-1, -1], [-2, 0], [-2, 1], [-2, 2], [-1, 2], [0, 2], [1, 1]];
  ax.forEach(([q2, r2]) => { const cx = R * Math.sqrt(3) * (q2 + r2 / 2), cy = R * 1.5 * r2; poly(hx(cx + 6, cy + 8, R * 1.04), '#14141a') });
  ax.forEach(([q2, r2], n) => { const cx = R * Math.sqrt(3) * (q2 + r2 / 2), cy = R * 1.5 * r2, sh2 = .5 + .5 * sin(t * .8 + n * .7); poly(hx(cx, cy, R * .95), rg(cx - 24, cy - 26, 3, R * 1.3, [[0, '#fff8d0'], [.35, '#f0c450'], [.8, '#b8841c'], [1, '#7a5410']])); poly(hx(cx, cy, R * .95), null, 'rgba(60,38,6,.75)', 2.5); c.save(); c.globalAlpha = .18 + .2 * sh2; poly([[cx - R * .6, cy - R * .5], [cx - R * .1, cy - R * .8], [cx + R * .1, cy - R * .5], [cx - R * .4, cy - R * .2]], '#fffbe8'); c.restore(); disc(cx, cy, 2.5, 'rgba(80,50,10,.6)') });
  poly(hx(0, 0, R * .7), '#0c0c12'); rr(-16, -16, 32, 32, 4, '#2a2a32'); c.restore();
  // tripé do espelho secundário (duas hastes de baixo e uma de cima) e o espelho secundário
  const sec = [0, -470]; for (const [px, py] of [[-235, 20], [235, 20], [0, -330]]) { line(px, py, sec[0], sec[1], '#2a2a30', 9); line(px + 2, py, sec[0] + 2, sec[1], '#7a7a84', 3) }
  poly([[-30, -470], [-15, -496], [15, -496], [30, -470], [15, -444], [-15, -444]], '#e8c060'); poly([[-30, -470], [-15, -496], [0, -470], [-15, -444]], '#fff0b0'); rr(-12, -500, 24, 10, 2, '#2a2a30');
  add(() => glow(-60, -140, 260, '255,230,160', .22 + .08 * sin(t * 2)));
  c.restore();
}
// ================= buraco negro detalhado (substitui o anterior) =================
function buracoNegro(x, y, r, t) {
  c.save(); c.translate(x, y); glow(0, 0, r * 5, '255,150,70', .3); glow(0, 0, r * 2.6, '255,200,120', .25);
  const cor = (u, a) => { const k = clamp(u); return `rgba(255,${(250 - k * 150) | 0},${(220 - k * 200) | 0},${a})` };
  // disco: faixas concêntricas achatadas, com turbulência e um lado mais claro (o gás vem na nossa direção)
  const disco = (frente) => { c.save(); c.scale(1, .24); const a0 = frente ? 0 : PI, a1 = frente ? PI : 2 * PI;
    for (let k = 0; k < 46; k++) { const u = k / 46, rr2 = r * (1.45 + u * 2.4), lw = r * .07; for (let s2 = 0; s2 < 12; s2++) { const aa = a0 + (a1 - a0) * s2 / 12, ab = a0 + (a1 - a0) * (s2 + 1) / 12, mid = (aa + ab) / 2, dop = .55 + .45 * -Math.cos(mid), turb = .65 + .35 * sin(k * 1.7 + s2 * 2.3 + t * (3 - u * 2)); c.strokeStyle = cor(u, (.75 - u * .55) * dop * turb); c.lineWidth = lw; c.beginPath(); c.arc(0, 0, rr2, aa, ab + .02); c.stroke() } }
    const q = rng(5); for (let i = 0; i < 260; i++) { const u = q(), rr2 = r * (1.5 + u * 2.3), a = q() * 7 + t * (2.6 - u * 1.8), on = frente ? sin(a) > 0 : sin(a) <= 0; if (!on) continue; disc(cos(a) * rr2, sin(a) * rr2, r * .02 + q() * r * .02, `rgba(255,${(235 - u * 80) | 0},${(190 - u * 120) | 0},${.7 - u * .4})`) } c.restore() };
  disco(false);
  // imagem da parte de trás do disco, curvada pela gravidade por cima e por baixo da sombra
  for (let k = 0; k < 18; k++) { const u = k / 18, rr2 = r * (1.12 + u * .55); c.strokeStyle = cor(u * .9, (.7 - u * .55)); c.lineWidth = r * .045; c.beginPath(); c.arc(0, 0, rr2, PI * (1.02 + u * .03), PI * (1.98 - u * .03)); c.stroke(); c.strokeStyle = cor(u, (.35 - u * .3)); c.lineWidth = r * .03; c.beginPath(); c.arc(0, 0, rr2 * .98, PI * .08, PI * .92); c.stroke() }
  // sombra e anel de fótons
  disc(0, 0, r, '#000'); for (let k = 0; k < 3; k++) { c.strokeStyle = `rgba(255,245,215,${.9 - k * .28})`; c.lineWidth = r * (.025 + k * .02); c.beginPath(); c.arc(0, 0, r * (1.02 + k * .025), 0, 7); c.stroke() } c.strokeStyle = 'rgba(255,255,240,.95)'; c.lineWidth = r * .04; c.beginPath(); c.arc(0, 0, r * 1.02, PI * .6, PI * 1.4); c.stroke();
  disco(true); c.restore();
}
// ================= buraco negro (versão final): disco liso e contínuo, arcos de lente suaves =================
function buracoNegro(x, y, r, t) {
  c.save(); c.translate(x, y); glow(0, 0, r * 5.5, '255,140,60', .28); glow(0, 0, r * 2.8, '255,190,110', .22);
  const R0 = r * 1.4, R1 = r * 4.0;
  const anel = (a0, a1, achata, alfa) => { c.save(); c.scale(1, achata); const g = c.createRadialGradient(0, 0, R0, 0, 0, R1); g.addColorStop(0, `rgba(255,250,225,${alfa})`); g.addColorStop(.12, `rgba(255,220,150,${alfa})`); g.addColorStop(.35, `rgba(255,160,70,${alfa * .9})`); g.addColorStop(.7, `rgba(190,70,30,${alfa * .55})`); g.addColorStop(1, 'rgba(120,30,10,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, R1, a0, a1); c.arc(0, 0, R0, a1, a0, true); c.closePath(); c.fill();
    // lado que vem na nossa direção mais claro, o outro mais escuro
    const d = c.createLinearGradient(-R1, 0, R1, 0); d.addColorStop(0, 'rgba(255,245,220,.35)'); d.addColorStop(.5, 'rgba(255,245,220,0)'); d.addColorStop(1, 'rgba(20,5,0,.45)'); c.fillStyle = d; c.beginPath(); c.arc(0, 0, R1, a0, a1); c.arc(0, 0, R0, a1, a0, true); c.closePath(); c.fill();
    // turbulência: filetes finos girando (mais rápido perto do centro)
    const q = rng(7); c.lineCap = 'round'; for (let i = 0; i < 140; i++) { const u = q(), rr2 = lerp(R0 * 1.02, R1 * .92, u), a = q() * 7 + t * (2.4 - u * 1.8), L = .2 + q() * .5; let s0 = a, s1 = a + L; const lo = Math.max(s0, a0 + (s0 > a1 ? 2 * PI : 0)); c.strokeStyle = `rgba(255,${(240 - u * 110) | 0},${(190 - u * 150) | 0},${(.35 - u * .25) * alfa})`; c.lineWidth = r * (.012 + q() * .02); c.beginPath(); for (let k = 0; k <= 8; k++) { const aa = s0 + (s1 - s0) * k / 8, ok = ((aa - a0) % (2 * PI) + 2 * PI) % (2 * PI) <= (a1 - a0); if (!ok) { c.stroke(); c.beginPath(); continue } k ? c.lineTo(cos(aa) * rr2, sin(aa) * rr2) : c.moveTo(cos(aa) * rr2, sin(aa) * rr2) } c.stroke() }
    c.restore() };
  anel(PI, 2 * PI, .23, 1); // metade de trás do disco
  // luz da parte de trás curvada por cima (arco largo) e por baixo (arco fino) da sombra
  const arco = (a0, a1, r0, r1, alfa) => { const g = c.createRadialGradient(0, 0, r0, 0, 0, r1); g.addColorStop(0, `rgba(255,248,220,${alfa})`); g.addColorStop(.3, `rgba(255,200,120,${alfa * .8})`); g.addColorStop(1, 'rgba(200,80,30,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, r1, a0, a1); c.arc(0, 0, r0, a1, a0, true); c.closePath(); c.fill() };
  arco(PI * 1.0, PI * 2.0, r * 1.06, r * 1.85, .95); arco(0, PI, r * 1.04, r * 1.35, .55);
  disc(0, 0, r, '#000');
  c.strokeStyle = 'rgba(255,250,230,.95)'; c.lineWidth = r * .035; c.beginPath(); c.arc(0, 0, r * 1.025, 0, 7); c.stroke(); c.strokeStyle = 'rgba(255,230,180,.45)'; c.lineWidth = r * .08; c.beginPath(); c.arc(0, 0, r * 1.07, 0, 7); c.stroke();
  anel(0, PI, .23, 1); // metade da frente passa na frente da sombra
  c.restore();
}

// ================= James Webb — versão mais detalhada =================
function jwst(x, y, s, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  // hastes do escudo com cabos
  for (const [ax, ay] of [[-640, 336], [640, 336]]) { line(ax * .86, ay - 4, ax, ay, '#4a4a52', 8); line(ax, ay, ax * .5, ay - 40, 'rgba(200,200,210,.4)', 1.5); line(ax, ay, ax * .5, ay + 40, 'rgba(200,200,210,.4)', 1.5); disc(ax, ay, 7, '#6a6a72') }
  // escudo solar: 5 membranas com brilho rosa-prateado, rugas e costuras
  for (let k = 4; k >= 0; k--) { const o = k * 17, L = [-580 + o * .6, 330 + o], T = [0, 188 + o * .7], R = [580 - o * .6, 330 + o], B = [0, 476 + o * .5];
    const g = c.createLinearGradient(-580, 200, 580, 470); g.addColorStop(0, ['#f6eef8', '#eadcf0', '#dccae6', '#ceb8dc', '#c0a6d0'][k]); g.addColorStop(.45, ['#fbf4ff', '#efe4f6', '#e2d2ec', '#d4c0e2', '#c6aed6'][k]); g.addColorStop(.55, ['#e8d6ec', '#dcc8e4', '#d0bada', '#c4acd0', '#b89ec6'][k]); g.addColorStop(1, ['#d8c4e2', '#ccb6da', '#c0a8d0', '#b49ac6', '#a88cbc'][k]); poly([L, T, R, B], g);
    poly([T, R, B, [0, 330 + o]], 'rgba(60,30,90,.1)'); c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 2; c.beginPath(); c.moveTo(...L); c.lineTo(...T); c.lineTo(...R); c.stroke();
    if (k === 0) { c.strokeStyle = 'rgba(90,60,120,.18)'; c.lineWidth = 1.2; for (let j = 1; j < 9; j++) { c.beginPath(); c.moveTo(lerp(L[0], T[0], j / 9), lerp(L[1], T[1], j / 9)); c.lineTo(lerp(B[0], R[0], j / 9), lerp(B[1], R[1], j / 9)); c.stroke() } const q = rng(3); c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1.5; for (let j = 0; j < 22; j++) { const u = q(), v = q(), px = lerp(lerp(L[0], T[0], u), lerp(B[0], R[0], u), v), py = lerp(lerp(L[1], T[1], u), lerp(B[1], R[1], u), v); c.beginPath(); c.moveTo(px - 30, py + 4); c.quadraticCurveTo(px, py - 6, px + 34, py + 6); c.stroke() } el(0, 300, 260, 44, 'rgba(40,30,60,.18)') } }
  poly([[610, 318], [690, 296], [702, 354], [620, 354]], '#e0d4e8'); for (let k = 1; k < 4; k++) line(610 + k * 22, 316 - k * 5, 620 + k * 22, 354, 'rgba(90,70,120,.3)', 1.5);
  // corpo da nave: manta dourada acolchoada, radiadores, rastreadores de estrelas, propulsores
  rr(-100, 476, 200, 120, 6, '#b8902a'); rr(-100, 476, 80, 120, 6, '#d4ac44'); c.strokeStyle = 'rgba(120,80,20,.45)'; c.lineWidth = 1.5; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(-96, 490 + i * 18); c.quadraticCurveTo(0, 496 + i * 18, 96, 488 + i * 18); c.stroke() } for (let k = 0; k < 5; k++) rr(-100 + k * 42, 600, 30, 26, 2, '#9aa0a8'); for (const sx of [-70, 50]) { c.save(); c.translate(sx, 470); c.rotate(-.5); rr(-10, -34, 20, 34, 4, '#2a2a30'); disc(0, -34, 9, '#4a6a8a'); c.restore() } for (const sx of [-96, 96]) poly([[sx, 590], [sx - 10 * Math.sign(sx) * -1, 612], [sx + 10 * Math.sign(sx), 612]], '#5a5a62');
  c.save(); c.translate(100, 560); c.rotate(.25); const sp = c.createLinearGradient(0, -26, 0, 26); sp.addColorStop(0, '#2a3a68'); sp.addColorStop(1, '#141c38'); rr(0, -26, 240, 52, 3, sp); c.strokeStyle = '#4a5a90'; c.lineWidth = 1.5; for (let k = 1; k < 10; k++) { c.beginPath(); c.moveTo(k * 24, -26); c.lineTo(k * 24, 26); c.stroke() } c.beginPath(); c.moveTo(0, 0); c.lineTo(240, 0); c.stroke(); c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(0, -26, 240, 10); c.restore();
  c.save(); c.translate(-50, 630); c.rotate(.5); line(0, -14, 0, -40, '#8a8a90', 5); el(0, 0, 40, 14, '#e8e4d8'); el(0, 3, 32, 9, '#c8c4b8'); c.restore();
  // torre e caixa de instrumentos
  rr(-28, 40, 56, 160, 4, '#3a3a42'); rr(-28, 40, 20, 160, 4, '#5a5a64'); for (let k = 0; k < 6; k++) line(-28, 50 + k * 26, 28, 64 + k * 26, 'rgba(160,160,170,.35)', 2);
  rr(-130, -44, 260, 128, 8, '#16161c'); rr(-130, -44, 260, 26, 6, '#2a2a34'); for (let k = 0; k < 5; k++) rr(-118 + k * 50, -10, 36, 70, 3, '#1e1e26');
  // estrutura de trás (treliça) aparecendo nas bordas do espelho
  c.save(); c.translate(0, -90); c.scale(1, .93); c.strokeStyle = 'rgba(120,120,130,.6)'; c.lineWidth = 3; for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(k * 90 + 6, -210); c.lineTo(k * 90 + 26, 210); c.stroke() } c.beginPath(); c.moveTo(-250, -40); c.lineTo(250, 40); c.moveTo(-250, 60); c.lineTo(250, -60); c.stroke(); c.restore();
  // espelho primário detalhado
  c.save(); c.translate(0, -90); c.scale(1, .93);
  const R = 52, hx = (cx, cy, r) => { const p = []; for (let i = 0; i < 6; i++) p.push([cx + cos(i * PI / 3 + PI / 6) * r, cy + sin(i * PI / 3 + PI / 6) * r]); return p };
  const ax = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1], [2, 0], [2, -1], [2, -2], [1, -2], [0, -2], [-1, -1], [-2, 0], [-2, 1], [-2, 2], [-1, 2], [0, 2], [1, 1]];
  ax.forEach(([q2, r2]) => { const cx = R * Math.sqrt(3) * (q2 + r2 / 2), cy = R * 1.5 * r2; poly(hx(cx + 7, cy + 9, R * 1.05), '#0e0e14') });
  const brilho = ((t * .12) % 1.6) - .3;
  ax.forEach(([q2, r2], n) => { const cx = R * Math.sqrt(3) * (q2 + r2 / 2), cy = R * 1.5 * r2;
    poly(hx(cx, cy, R * .96), '#6a4a10'); poly(hx(cx, cy, R * .9), rg(cx - 24, cy - 26, 3, R * 1.3, [[0, '#fffbe0'], [.3, '#f4ca58'], [.75, '#bc8a22'], [1, '#86600e']]));
    const pts = hx(cx, cy, R * .9); c.strokeStyle = 'rgba(255,245,200,.55)'; c.lineWidth = 2; c.beginPath(); c.moveTo(...pts[3]); c.lineTo(...pts[4]); c.lineTo(...pts[5]); c.stroke(); c.strokeStyle = 'rgba(60,38,6,.7)'; c.beginPath(); c.moveTo(...pts[0]); c.lineTo(...pts[1]); c.lineTo(...pts[2]); c.stroke();
    for (let a = 0; a < 3; a++) disc(cx + cos(a * 2.1 + .5) * R * .45, cy + sin(a * 2.1 + .5) * R * .45, 2.2, 'rgba(90,60,10,.55)');
    const d = (cx + cy * .6) / 500 - brilho; const al = Math.max(0, 1 - Math.abs(d) * 4) * .55; if (al > 0) { c.save(); c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(...p) : c.moveTo(...p)); c.closePath(); c.clip(); c.fillStyle = `rgba(255,255,240,${al})`; c.fillRect(cx - R, cy - R, R * 2, R * 2); c.restore() } });
  poly(hx(0, 0, R * .72), '#0a0a10'); disc(0, 0, 26, '#1a1a22'); c.strokeStyle = '#d8b450'; c.lineWidth = 4; c.beginPath(); c.arc(0, 0, 26, 0, 7); c.stroke(); disc(0, 0, 12, '#050508'); c.restore();
  // tripé com articulações e espelho secundário
  const sec = [0, -480]; for (const [px, py] of [[-240, 24], [240, 24], [0, -340]]) { line(px, py, sec[0], sec[1], '#24242a', 10); line(px + 2, py, sec[0] + 2, sec[1], '#8a8a94', 3); disc(px, py, 8, '#5a5a62'); disc(lerp(px, sec[0], .5), lerp(py, sec[1], .5), 6, '#5a5a62') }
  poly([[-34, -480], [-17, -508], [17, -508], [34, -480], [17, -452], [-17, -452]], '#e8c060'); poly([[-34, -480], [-17, -508], [0, -480], [-17, -452]], '#fff2b8'); rr(-20, -516, 40, 12, 3, '#24242a'); disc(0, -480, 4, '#8a6a20');
  add(() => glow(-80, -150, 300, '255,230,160', .2 + .08 * sin(t * 2)));
  c.restore();
}
// ================= buraco negro — versão mais detalhada =================
const BN_ESTRELAS = (() => { const q = rng(91), a = []; for (let i = 0; i < 260; i++) a.push([q() * 2 - 1, q() * 2 - 1, q()]); return a })();
function buracoNegro(x, y, r, t) {
  c.save(); c.translate(x, y);
  // estrelas de fundo desviadas pela gravidade (anel de Einstein): perto da sombra viram arquinhos
  for (const [u, v, k] of BN_ESTRELAS.slice(0, 140)) { const px = u * r * 5, py = v * r * 5, d = Math.hypot(px, py); if (d < r * 1.1) continue; const lente = r * r * 1.6 / d, a = Math.atan2(py, px), dd = d + lente, estica = dd < r * 2.4 ? Math.min(.07, lente / d * .35) : 0; if (estica < .02) { disc(cos(a) * dd, sin(a) * dd, .8 + k * 1.4, `rgba(255,250,240,${.4 + k * .5})`) } else { c.strokeStyle = `rgba(255,250,240,${.35 + k * .45})`; c.lineWidth = 1 + k * 1.3; c.lineCap = 'round'; c.beginPath(); c.arc(0, 0, dd, a - estica, a + estica); c.stroke() } }
  glow(0, 0, r * 6, '255,130,50', .26); glow(0, 0, r * 3, '255,190,110', .2);
  const R0 = r * 1.4, R1 = r * 4.1;
  const anel = (a0, a1) => { c.save(); c.scale(1, .23); const g = c.createRadialGradient(0, 0, R0, 0, 0, R1); g.addColorStop(0, 'rgba(255,252,235,1)'); g.addColorStop(.08, 'rgba(255,235,180,1)'); g.addColorStop(.3, 'rgba(255,170,80,.95)'); g.addColorStop(.65, 'rgba(200,80,30,.6)'); g.addColorStop(1, 'rgba(110,25,8,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, R1, a0, a1); c.arc(0, 0, R0, a1, a0, true); c.closePath(); c.fill();
    const d = c.createLinearGradient(-R1, 0, R1, 0); d.addColorStop(0, 'rgba(255,248,225,.4)'); d.addColorStop(.5, 'rgba(255,248,225,0)'); d.addColorStop(1, 'rgba(20,4,0,.5)'); c.fillStyle = d; c.beginPath(); c.arc(0, 0, R1, a0, a1); c.arc(0, 0, R0, a1, a0, true); c.closePath(); c.fill();
    c.save(); c.beginPath(); c.arc(0, 0, R1, a0, a1); c.arc(0, 0, R0, a1, a0, true); c.closePath(); c.clip();
    // ondas espirais de densidade (faixas escuras e claras)
    for (let b = 0; b < 3; b++) { c.strokeStyle = b % 2 ? 'rgba(255,230,170,.18)' : 'rgba(40,10,0,.22)'; c.lineWidth = r * .09; c.beginPath(); for (let k = 0; k <= 60; k++) { const rr2 = R0 + (R1 - R0) * k / 60, a = b * 2.1 + Math.log(rr2 / R0) * 3.2 + t * 1.2; k ? c.lineTo(cos(a) * rr2, sin(a) * rr2) : c.moveTo(cos(a) * rr2, sin(a) * rr2) } c.stroke() }
    // filetes de turbulência e pontos quentes
    const q = rng(7); c.lineCap = 'round'; for (let i = 0; i < 220; i++) { const u = q(), rr2 = lerp(R0 * 1.02, R1 * .95, u), a = q() * 7 + t * (2.6 - u * 2), L = .15 + q() * .6; c.strokeStyle = `rgba(255,${(242 - u * 120) | 0},${(200 - u * 160) | 0},${.4 - u * .3})`; c.lineWidth = r * (.01 + q() * .02); c.beginPath(); c.arc(0, 0, rr2, a, a + L); c.stroke() }
    for (let i = 0; i < 6; i++) { const u = .1 + i * .12, rr2 = lerp(R0, R1, u), a = i * 1.3 + t * (2.4 - u * 1.8); glow(cos(a) * rr2, sin(a) * rr2, r * .25, '255,240,200', .6) }
    c.restore(); c.strokeStyle = 'rgba(255,255,240,.85)'; c.lineWidth = r * .05; c.beginPath(); c.arc(0, 0, R0 * 1.01, a0, a1); c.stroke(); c.restore() };
  // fios de gás sendo sugados de fora para dentro
  c.save(); c.scale(1, .23); for (let k = 0; k < 4; k++) { c.strokeStyle = 'rgba(220,120,60,.25)'; c.lineWidth = r * .05; c.beginPath(); for (let j = 0; j <= 50; j++) { const rr2 = R1 * 1.6 - j / 50 * (R1 * .6), a = k * 1.57 + j * .06 + t * .4; j ? c.lineTo(cos(a) * rr2, sin(a) * rr2) : c.moveTo(cos(a) * rr2, sin(a) * rr2) } c.stroke() } c.restore();
  anel(PI, 2 * PI);
  const arco = (a0, a1, r0, r1, alfa) => { const g = c.createRadialGradient(0, 0, r0, 0, 0, r1); g.addColorStop(0, `rgba(255,250,228,${alfa})`); g.addColorStop(.25, `rgba(255,205,125,${alfa * .85})`); g.addColorStop(.6, `rgba(230,120,50,${alfa * .45})`); g.addColorStop(1, 'rgba(180,60,20,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, r1, a0, a1); c.arc(0, 0, r0, a1, a0, true); c.closePath(); c.fill() };
  arco(PI, 2 * PI, r * 1.06, r * 1.9, .95); arco(0, PI, r * 1.04, r * 1.38, .55);
  c.save(); c.beginPath(); c.arc(0, 0, r * 1.9, PI, 2 * PI); c.arc(0, 0, r * 1.06, 2 * PI, PI, true); c.closePath(); c.clip(); const q2 = rng(12); for (let i = 0; i < 60; i++) { const rr2 = r * (1.1 + q2() * .75), a = PI + q2() * PI; c.strokeStyle = `rgba(255,240,200,${.12 + q2() * .15})`; c.lineWidth = 1.5; c.beginPath(); c.arc(0, 0, rr2, a, a + .2 + q2() * .4); c.stroke() } c.restore();
  disc(0, 0, r, '#000'); c.strokeStyle = 'rgba(255,252,236,.98)'; c.lineWidth = r * .03; c.beginPath(); c.arc(0, 0, r * 1.02, 0, 7); c.stroke(); c.strokeStyle = 'rgba(255,240,200,.55)'; c.lineWidth = r * .014; c.beginPath(); c.arc(0, 0, r * 1.065, 0, 7); c.stroke(); c.strokeStyle = 'rgba(255,220,160,.35)'; c.lineWidth = r * .09; c.beginPath(); c.arc(0, 0, r * 1.1, 0, 7); c.stroke();
  anel(0, PI);
  c.restore();
}

// ================= cache de desenho estático (desenha uma vez numa tela própria) =================
function cache(nome, w, h, fn) { const C2 = (cache.m = cache.m || {}); if (!C2[nome]) { const k = document.createElement('canvas'); k.width = w; k.height = h; const ant = c; c = k.getContext('2d'); fn(); c = ant; C2[nome] = k } return C2[nome] }
// ================= universo observável realista (escala logarítmica, como nas ilustrações científicas) =================
function universoObservavel(cx, cy, R, t, o = {}) {
  const img = cache('uo', 1200, 1200, () => { const X = 600, Y = 600, RR = 580, q = rng(2024); c.fillStyle = '#000'; c.beginPath(); c.arc(X, Y, RR, 0, 7); c.fill();
    // borda: plasma primordial e radiação cósmica de fundo (manchas)
    let g = c.createRadialGradient(X, Y, RR * .8, X, Y, RR); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.55, 'rgba(120,30,20,.6)'); g.addColorStop(.8, 'rgba(230,110,40,.85)'); g.addColorStop(.95, 'rgba(255,190,110,.95)'); g.addColorStop(1, 'rgba(255,230,180,.6)'); c.fillStyle = g; c.beginPath(); c.arc(X, Y, RR, 0, 7); c.fill();
    c.save(); c.beginPath(); c.arc(X, Y, RR * .985, 0, 7); c.arc(X, Y, RR * .87, 0, 7, true); c.clip(); for (let i = 0; i < 2600; i++) { const a = q() * 7, d = RR * (.87 + q() * .12), s = 4 + q() * 14; c.fillStyle = q() < .45 ? `rgba(255,${(120 + q() * 80) | 0},50,${.25 + q() * .3})` : q() < .7 ? `rgba(140,30,20,${.3 + q() * .3})` : `rgba(90,110,190,${.15 + q() * .2})`; c.beginPath(); c.ellipse(X + cos(a) * d, Y + sin(a) * d, s, s * .6, a, 0, 7); c.fill() } c.restore();
    // teia cósmica: nós e filamentos com milhares de galáxias (mais densa para fora)
    c.save(); c.beginPath(); c.arc(X, Y, RR * .87, 0, 7); c.clip(); c.globalCompositeOperation = 'lighter'; const nos = []; for (let i = 0; i < 230; i++) { const a = q() * 7, d = RR * (.3 + Math.pow(q(), .6) * .57); nos.push([X + cos(a) * d, Y + sin(a) * d, d]) }
    nos.forEach((A, i) => nos.forEach((B, j) => { if (j <= i) return; const L2 = Math.hypot(A[0] - B[0], A[1] - B[1]); if (L2 > 95) return; const n = (L2 / 2) | 0; for (let k = 0; k < n; k++) { const u = q(), w = (q() - .5) * 6; const px = lerp(A[0], B[0], u) + w, py = lerp(A[1], B[1], u) + (q() - .5) * 6; const k2 = q(); c.fillStyle = k2 < .7 ? 'rgba(150,130,255,.28)' : k2 < .9 ? 'rgba(220,200,255,.45)' : 'rgba(255,220,180,.6)'; c.fillRect(px, py, 1.4, 1.4) } c.strokeStyle = 'rgba(110,90,220,.07)'; c.lineWidth = 5; c.beginPath(); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); c.stroke() }));
    nos.forEach(([x, y, d]) => { glow(x, y, 6 + q() * 10, '255,210,190', .55); glow(x, y, 18, '160,120,255', .2) });
    for (let i = 0; i < 9000; i++) { const a = q() * 7, d = RR * (.32 + Math.pow(q(), .5) * .55); c.fillStyle = `rgba(170,160,255,${.05 + q() * .12})`; c.fillRect(X + cos(a) * d, Y + sin(a) * d, 1.2, 1.2) } c.restore();
    // galáxias próximas (Grupo Local e vizinhas)
    c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 46; i++) { const a = q() * 7, d = RR * (.14 + q() * .17), r2 = 4 + q() * 9; c.save(); c.translate(X + cos(a) * d, Y + sin(a) * d); c.rotate(q() * 3); c.scale(1, .4 + q() * .6); glow(0, 0, r2 * 1.8, q() < .5 ? '200,210,255' : '255,220,180', .7); c.strokeStyle = 'rgba(200,210,255,.6)'; c.lineWidth = 1.2; c.beginPath(); c.arc(0, 0, r2, 0, 4); c.stroke(); c.restore() } c.restore();
    // Via Láctea e Andrômeda em destaque, e o Sistema Solar no centro
    c.save(); c.globalCompositeOperation = 'lighter'; glow(X, Y, RR * .12, '200,180,255', .35); for (let k = 0; k < 4; k++) { c.strokeStyle = 'rgba(210,200,255,.5)'; c.lineWidth = 2; c.beginPath(); for (let j = 0; j < 30; j++) { const r3 = 6 + j * 1.8, aa = k * PI / 2 + j * .25; j ? c.lineTo(X + cos(aa) * r3, Y + sin(aa) * r3) : c.moveTo(X + cos(aa) * r3, Y + sin(aa) * r3) } c.stroke() } c.restore(); solDisco(X, Y, 5);
    c.save(); c.translate(X + RR * .2, Y - RR * .07); c.rotate(-.6); c.scale(1, .35); glow(0, 0, 22, '230,220,255', .9); c.restore();
    // brilho de esfera
    g = c.createRadialGradient(X - RR * .3, Y - RR * .35, 0, X, Y, RR); g.addColorStop(0, 'rgba(255,255,255,.05)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.beginPath(); c.arc(X, Y, RR, 0, 7); c.fill() });
  c.save(); c.translate(cx, cy); c.rotate(t * (o.giro ?? .01)); const s = R / 580; c.scale(s, s); glow(0, 0, 680, '255,150,80', .18); c.drawImage(img, -600, -600); c.restore();
  if (o.rotulos) { const u = o.rotulos; [['SISTEMA SOLAR', 0, 0], ['GALÁXIAS VIZINHAS', .24, -.5], ['TEIA CÓSMICA', .62, .5], ['A LUZ MAIS ANTIGA', .93, -1.2]].forEach(([s2, d, a], i) => { const px = cx + cos(a) * d * R, py = cy + sin(a) * d * R; txt(s2, px, py + (i ? 0 : 40), 30, '#fff6e0', { align: 'center', a: ramp(u, i * .8, i * .8 + .4) }) }) }
}
// ================= Laniakea realista: galáxias em filamentos, linhas de fluxo e contorno =================
function laniakea(t, tl, z) {
  espaco(t, { via: false });
  const img = cache('lani', 1200, 1200, () => { const X = 600, Y = 600, q = rng(77); c.globalCompositeOperation = 'lighter';
    const nos = []; for (let i = 0; i < 120; i++) { const a = q() * 7, d = Math.pow(q(), .7) * 560; nos.push([X + cos(a) * d, Y + sin(a) * d * .8]) }
    nos.forEach((A, i) => nos.forEach((B, j) => { if (j <= i) return; const L2 = Math.hypot(A[0] - B[0], A[1] - B[1]); if (L2 > 120) return; for (let k = 0; k < L2 * .9; k++) { const u = q(); c.fillStyle = q() < .2 ? 'rgba(255,200,150,.6)' : 'rgba(150,180,255,.4)'; const s = .8 + q() * 1.8; c.fillRect(lerp(A[0], B[0], u) + (q() - .5) * 8, lerp(A[1], B[1], u) + (q() - .5) * 8, s, s) } }));
    nos.forEach(([x, y]) => glow(x, y, 8 + q() * 14, '255,220,190', .5));
    // linhas de fluxo convergindo para o Grande Atrator
    const GA = [X + 40, Y + 20]; for (let f = 0; f < 70; f++) { const a = q() * 7, d = 300 + q() * 300; let px = GA[0] + cos(a) * d, py = GA[1] + sin(a) * d * .8; c.strokeStyle = `rgba(255,255,255,${.18 + q() * .15})`; c.lineWidth = 1.3; c.beginPath(); c.moveTo(px, py); for (let k = 0; k < 80; k++) { const ang = Math.atan2(GA[1] - py, GA[0] - px) + .35, dd = Math.hypot(GA[0] - px, GA[1] - py); if (dd < 20) break; px += cos(ang) * 6; py += sin(ang) * 6; c.lineTo(px, py) } c.stroke() }
    glow(GA[0], GA[1], 90, '255,220,170', .6);
    // contorno da bacia de Laniakea
    c.globalCompositeOperation = 'source-over'; c.strokeStyle = 'rgba(240,160,80,.8)'; c.lineWidth = 4; c.beginPath(); for (let k = 0; k <= 60; k++) { const a = k / 60 * 2 * PI, r = 470 + 50 * sin(a * 3 + 1) + 30 * sin(a * 5); k ? c.lineTo(X + cos(a) * r, Y + sin(a) * r * .8) : c.moveTo(X + cos(a) * r, Y + sin(a) * r * .8) } c.closePath(); c.stroke(); c.fillStyle = 'rgba(240,160,80,.05)'; c.fill() });
  c.save(); c.translate(540, 820); c.scale(z * .9, z * .9); c.drawImage(img, -600, -600);
  // pontinhos andando pelas linhas de fluxo
  const q = rng(5); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 40; i++) { const a = q() * 7 - t * .2, d = (420 - ((t * 25 + q() * 400) % 400)); disc(40 + cos(a) * d, 20 + sin(a) * d * .8, 3, 'rgba(255,255,255,.8)') } c.restore();
}
// ================= pessoa realista de costas, olhando o céu (com luz de contorno) =================
function observador(x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); const k = '#0a0c14', k2 = '#121624', rim = 'rgba(170,190,240,.55)';
  bezPoly([[-30, 0], [-34, -60, -30, -150], [-6, -150], [-8, -60, -10, 0]], k); bezPoly([[30, 0], [34, -60, 30, -150], [6, -150], [8, -60, 10, 0]], k2); // pernas (calça)
  bezPoly([[-40, 0], [-44, -12], [-12, -14], [-8, 0]], '#1a1c22'); bezPoly([[40, 0], [44, -12], [12, -14], [8, 0]], '#1a1c22'); // tênis
  bezPoly([[-46, -150], [-52, -230, -44, -290], [-24, -318, 0, -322], [24, -318, 44, -290], [52, -230, 46, -150]], k2); // jaqueta
  bezPoly([[-46, -150], [-52, -230, -44, -290], [-24, -318, -4, -320], [-6, -150]], k); line(0, -310, 0, -152, 'rgba(60,70,100,.6)', 2);
  bezPoly([[-44, -286], [-60, -240, -58, -160], [-46, -150], [-40, -230]], k); bezPoly([[44, -286], [60, -240, 58, -160], [46, -150], [40, -230]], k2); el(-52, -150, 9, 12, '#1a1418'); el(52, -150, 9, 12, '#1a1418'); // braços e mãos
  bezPoly([[-12, -322], [-10, -336], [10, -336], [12, -322]], '#14100e'); // pescoço
  el(0, -362, 26, 30, '#0c0a0c'); bezPoly([[-27, -360], [-30, -396, 0, -398], [30, -396, 27, -360], [24, -340], [-24, -340]], '#0e0c10'); // cabeça e cabelo
  c.strokeStyle = rim; c.lineWidth = 2.5; c.beginPath(); c.moveTo(27, -362); c.quadraticCurveTo(30, -396, 0, -398); c.stroke(); c.beginPath(); c.moveTo(44, -290); c.quadraticCurveTo(52, -230, 46, -150); c.stroke(); c.beginPath(); c.moveTo(24, -318); c.quadraticCurveTo(40, -308, 44, -290); c.stroke(); c.beginPath(); c.moveTo(34, -150); c.quadraticCurveTo(34, -60, 30, 0); c.stroke();
  c.restore() }
// ================= praia à noite, com a Via Láctea, ondas, areia e uma lupa nos grãos =================
function praia(t) {
  c.fillStyle = lg(0, 0, 0, 900, [[0, '#04060c'], [.6, '#0c1630'], [1, '#1c2c48']]); c.fillRect(0, 0, W, 920);
  c.save(); c.translate(540, 450); c.rotate(-.5); for (let k = 0; k < 4; k++) { c.fillStyle = lg(0, -200 + k * 40, 0, 200 - k * 40, [[0, 'rgba(160,150,200,0)'], [.5, `rgba(${k > 1 ? '230,200,170' : '150,150,210'},${.09 + k * .04})`], [1, 'rgba(160,150,200,0)']]); c.fillRect(-1400, -200 + k * 40, 2800, 400 - k * 80) } c.restore();
  const q = rng(8); for (let i = 0; i < 700; i++) { c.fillStyle = `rgba(255,250,235,${.25 + q() * .7})`; const s2 = .8 + q() * 2; c.fillRect(q() * W, q() * 880, s2, s2) }
  disc(860, 260, 34, '#f2eee0'); glow(860, 260, 140, '240,240,220', .25);
  c.fillStyle = lg(0, 880, 0, 1110, [[0, '#0e2236'], [1, '#1c3a52']]); c.fillRect(0, 880, W, 230); for (let k = 0; k < 18; k++) { const y = 900 + k * 12; pill(860 + sin(t + k) * 20, y, 40 + k * 6, 3, `rgba(240,240,220,${.35 - k * .015})`) }
  for (let k = 0; k < 4; k++) { const y = 1000 + k * 34, ph = t * 1.2 + k; c.fillStyle = `rgba(230,240,250,${.55 - k * .08})`; c.beginPath(); c.moveTo(0, y); for (let x = 0; x <= W; x += 18) c.lineTo(x, y + sin(x * .015 + ph) * 8 + sin(x * .04 - ph) * 3); c.lineTo(W, y + 8); for (let x = W; x >= 0; x -= 18) c.lineTo(x, y + 8 + sin(x * .015 + ph) * 8); c.fill() }
  c.fillStyle = lg(0, 1110, 0, 1180, [[0, '#4a4234'], [1, '#6a5c44']]); c.fillRect(0, 1110, W, 70); c.fillStyle = 'rgba(200,210,230,.12)'; c.fillRect(0, 1112, W, 10);
  c.fillStyle = lg(0, 1180, 0, H, [[0, '#a8926a'], [1, '#6e5a3e']]); c.fillRect(0, 1180, W, H - 1180); for (let i = 0; i < 5000; i++) { const y = 1180 + Math.pow(q(), .8) * (H - 1180), s2 = .8 + (y - 1180) / 300; c.fillStyle = q() < .5 ? 'rgba(70,56,36,.5)' : 'rgba(230,214,180,.45)'; c.fillRect(q() * W, y, s2, s2) } for (let k = 0; k < 5; k++) { c.strokeStyle = 'rgba(60,48,30,.25)'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 1240 + k * 60); c.quadraticCurveTo(540, 1220 + k * 60, W, 1250 + k * 60); c.stroke() }
  // lupa sobre a areia mostrando os grãos (formas e cores diferentes)
  const lx = 760, ly = 1270, lr = 150; c.save(); c.beginPath(); c.arc(lx, ly, lr, 0, 7); c.clip(); c.fillStyle = '#8a7656'; c.fillRect(lx - lr, ly - lr, 2 * lr, 2 * lr); const g2 = rng(31); for (let i = 0; i < 160; i++) { const gx = lx - lr + g2() * 2 * lr, gy = ly - lr + g2() * 2 * lr, r2 = 6 + g2() * 12, cor = ['#e8d8b0', '#d8b888', '#c8a070', '#f0e6d0', '#a8886a', '#e0c8a0', '#9a8a7a'][(g2() * 7) | 0]; c.save(); c.translate(gx, gy); c.rotate(g2() * 3); el(0, 0, r2, r2 * (.6 + g2() * .4), cor); el(-r2 * .3, -r2 * .25, r2 * .4, r2 * .25, 'rgba(255,255,255,.35)'); el(r2 * .2, r2 * .25, r2 * .5, r2 * .3, 'rgba(0,0,0,.15)'); c.restore() } c.restore();
  c.strokeStyle = '#2a2a30'; c.lineWidth = 16; c.beginPath(); c.arc(lx, ly, lr, 0, 7); c.stroke(); c.strokeStyle = '#8a8a94'; c.lineWidth = 4; c.beginPath(); c.arc(lx, ly, lr - 6, 0, 7); c.stroke(); line(lx - lr * .72, ly + lr * .72, lx - lr * 1.5, ly + lr * 1.5, '#3a2a20', 26); c.fillStyle = 'rgba(255,255,255,.08)'; c.beginPath(); c.arc(lx - 40, ly - 50, 60, 0, 7); c.fill();
}
// ================= pessoa realista de costas (versão final) =================
function observador(x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); const k0 = '#07080e', k1 = '#0f1220', k2 = '#161a2c', rim = 'rgba(180,200,245,.6)';
  // pernas: coxas largas afinando até o tornozelo, joelho marcado
  bezPoly([[-34, -158], [-38, -110, -30, -78], [-28, -40, -24, -8], [-8, -8], [-6, -50, -8, -84], [-4, -120, -2, -158]], k0); bezPoly([[34, -158], [38, -110, 30, -78], [28, -40, 24, -8], [8, -8], [6, -50, 8, -84], [4, -120, 2, -158]], k1);
  c.strokeStyle = 'rgba(80,90,130,.35)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-26, -80); c.quadraticCurveTo(-18, -74, -10, -80); c.moveTo(26, -80); c.quadraticCurveTo(18, -74, 10, -80); c.stroke();
  bezPoly([[-30, -10], [-36, 0], [-2, 2], [-4, -10]], '#1c1e26'); bezPoly([[30, -10], [36, 0], [2, 2], [4, -10]], '#22242e'); // tênis
  // jaqueta com ombros arredondados, barra e costura
  bezPoly([[-44, -150], [-50, -200, -50, -248], [-50, -292, -26, -312], [0, -318], [26, -312, 50, -292], [50, -248, 50, -200], [44, -150], [0, -144]], k1);
  bezPoly([[-44, -150], [-50, -200, -50, -248], [-50, -292, -26, -312], [-2, -318], [-4, -144]], k0); rr(-46, -158, 92, 14, 6, '#0b0d16'); line(0, -300, 0, -150, 'rgba(70,80,120,.5)', 2);
  // capuz caído nas costas
  bezPoly([[-30, -318], [-36, -296, -20, -276], [0, -268], [20, -276, 36, -296], [30, -318]], '#121626'); c.strokeStyle = 'rgba(70,80,120,.5)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-26, -310); c.quadraticCurveTo(0, -282, 26, -310); c.stroke();
  // braços relaxados ao lado do corpo, mãos
  bezPoly([[-46, -296], [-62, -260, -60, -200], [-56, -160], [-44, -158], [-46, -210, -40, -270]], k0); bezPoly([[46, -296], [62, -260, 60, -200], [56, -160], [44, -158], [46, -210, 40, -270]], k2); el(-50, -150, 8, 12, '#1e1618'); el(50, -150, 8, 12, '#241a1c');
  // pescoço, cabeça levemente inclinada para cima, cabelo com mechas
  bezPoly([[-11, -318], [-10, -334], [10, -334], [11, -318]], '#140e0c'); c.save(); c.translate(0, -362); c.rotate(-.12); el(0, 0, 25, 30, '#0c0a0c'); el(-24, 2, 5, 9, '#140e0e'); el(24, 2, 5, 9, '#140e0e'); bezPoly([[-26, 4], [-30, -34, 0, -38], [30, -34, 26, 4], [22, -6], [12, -16], [-12, -16], [-22, -6]], '#0e0b0c'); c.strokeStyle = 'rgba(90,80,90,.4)'; c.lineWidth = 1.2; for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(k * 6, -34); c.quadraticCurveTo(k * 8, -20, k * 9, -8); c.stroke() } c.strokeStyle = rim; c.lineWidth = 2.5; c.beginPath(); c.arc(0, -4, 29, -1.4, .3); c.stroke(); c.restore();
  // luz de contorno (o céu ilumina a borda direita)
  c.strokeStyle = rim; c.lineWidth = 2.5; c.beginPath(); c.moveTo(26, -312); c.quadraticCurveTo(50, -292, 50, -248); c.quadraticCurveTo(50, -200, 44, -152); c.stroke(); c.beginPath(); c.moveTo(56, -260); c.quadraticCurveTo(60, -210, 56, -162); c.stroke(); c.beginPath(); c.moveTo(34, -156); c.quadraticCurveTo(38, -110, 30, -78); c.quadraticCurveTo(28, -40, 24, -10); c.stroke();
  c.restore() }
