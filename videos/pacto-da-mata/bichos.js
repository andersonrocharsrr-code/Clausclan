// ================= Animais da Amazônia, de lado, olhando para +x, pés no chão em y=0 =================
// Pintura com volume: silhueta suave, músculos sombreados, textura de pelo, luz de contorno e olhos com brilho.
// Escala: 1 unidade ≈ 1 cm (Firmino tem 100 unidades = 1,75 m; use ~0,57 x a escala dele).

// ---------- ajudas ----------
// membro em cadeia (ombro→cotovelo→pulso→pata): segmentos afinando, juntas arredondadas e brilho na frente
function membro(pts, ws, col, luz) {
  for (let i = 0; i < pts.length - 1; i++) seg(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], ws[i], ws[i + 1], col);
  if (luz) { c.strokeStyle = luz; c.lineCap = 'round'; for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], L = Math.hypot(x1 - x0, y1 - y0) || 1, nx = (y1 - y0) / L, ny = -(x1 - x0) / L, o = ws[i] * .3; c.lineWidth = Math.max(.6, ws[i] * .16); c.beginPath(); c.moveTo(x0 + nx * o, y0 + ny * o); c.lineTo(x1 + nx * ws[i + 1] * .3, y1 + ny * ws[i + 1] * .3); c.stroke() } }
}
// pelo: tracinhos curtos no sentido do corpo, dentro do recorte atual
function pelo(x0, y0, x1, y1, n, ang, len, cols, seed, lw = .7) {
  const q = rng(seed); c.lineCap = 'round'; c.lineWidth = lw;
  for (let i = 0; i < n; i++) { const x = lerp(x0, x1, q()), y = lerp(y0, y1, q()), a = ang + (q() - .5) * .5, l = len * (.6 + q() * .8); c.strokeStyle = cols[i % cols.length]; c.beginPath(); c.moveTo(x, y); c.lineTo(x + cos(a) * l, y + sin(a) * l); c.stroke() }
}
// pata em três partes conforme o passo: devolve [ombro/quadril, junta, pulso/jarrete, pé]
function pernaFrente(sx, sy, ph, o) { // joelho (cotovelo) para trás
  const { passo, ergue, l1, l2, l3 = 0, an = 1 } = o, s = sin(ph), cc = cos(ph);
  const pe = [sx + s * passo * an + 4, -Math.max(0, cc) * ergue * an], pu = [pe[0] - 2 - Math.max(0, cc) * 6 * an, pe[1] - l3 + Math.max(0, cc) * 2 * an];
  const co = ik(sx, sy, pu[0], pu[1], l1, l2, -1); return [[sx, sy], co, pu, pe];
}
function pernaTras(hx, hy, ph, o) { // joelho para frente, jarrete para trás
  const { passo, ergue, l1, l2, l3, an = 1 } = o, s = sin(ph), cc = cos(ph);
  const pe = [hx + s * passo * an + 2, -Math.max(0, cc) * ergue * an], ja = [pe[0] - l3 * .42 - Math.max(0, -s) * 4 * an, pe[1] - l3 * .9];
  const jo = ik(hx, hy, ja[0], ja[1], l1, l2, 1); return [[hx, hy], jo, ja, pe];
}
function olhoBicho(x, y, r, iris = '#c89a30', ang = 0) { c.save(); c.translate(x, y); c.rotate(ang); ell(0, 0, r * 1.25, r * .8, 0, '#140c06'); ell(.1 * r, 0, r, r * .66, 0, iris); c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(-r, -r * .7, r * 2, r * .35); ell(.2 * r, 0, r * .42, r * .55, 0, '#050302'); disc(-.25 * r, -.25 * r, r * .2, 'rgba(255,255,255,.9)'); c.restore() }

// ---------- onça-pintada ----------
// passo lento de felino (anda < .5) ou galope (anda ≥ .5). o: { fase, anda, olhar }
const ROSETAS = (() => { const q = rng(201), a = []; for (let i = 0; i < 14; i++) for (let j = 0; j < 5; j++) a.push([(i + .5 + (q() - .5) * .55 + (j % 2) * .5) / 14.5, (j + .5 + (q() - .5) * .4) / 5, q(), q(), q()]); return a })();
function onca(t, o = {}) {
  const f = o.fase ?? t * 9, an = o.anda ?? 1, gal = an >= .5, flex = gal ? sin(f) * .6 * an : 0;
  const G = { base: '#c98f38', esc: '#8f5a1e', luz: '#e9b964', creme: '#f1e2c2', ink: '#1a0f07' };
  const bob = gal ? Math.abs(cos(f)) * 4 * an : Math.abs(sin(f)) * 1.2 * an;
  const sh = [42 + flex * 7, -60 + bob], hp = [-46 - flex * 7, -58 + (gal ? Math.abs(sin(f)) * 3 * an : 0)];
  const pf = { passo: gal ? 34 : 16, ergue: gal ? 18 : 9, l1: 26, l2: 25, l3: 9, an }, pt = { passo: gal ? 32 : 15, ergue: gal ? 16 : 8, l1: 27, l2: 24, l3: 20, an };
  const fa = gal ? [f + .55, f, f + PI + .55, f + PI] : [f + PI, f, f + PI * 1.5, f + PI * .5]; // trás-longe, frente-longe..., ordem: FL, FP, TL, TP
  const desenhaPerna = (pts, ws, col, luz) => { membro(pts, ws, col, luz); const pe = pts[3]; ell(pe[0] + 3, pe[1] - 3.2, 6.4, 3.6, 0, col); c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = .5; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(pe[0] + 4 + k * 1.8, pe[1] - 5.6); c.lineTo(pe[0] + 4.6 + k * 1.8, pe[1] - 1.2); c.stroke() } };
  const manchasPerna = (pts, s, seed) => { const q = rng(seed); for (let i = 0; i < pts.length - 1; i++) for (let k = 0; k < 5; k++) { const u = q(), x = lerp(pts[i][0], pts[i + 1][0], u) + (q() - .5) * 6 * s, y = lerp(pts[i][1], pts[i + 1][1], u) + (q() - .5) * 3; ell(x, y, (.8 + q() * .9) * s, (.6 + q() * .7) * s, q() * 3, G.ink) } };
  // pernas do lado de lá (mais escuras)
  const tL = pernaTras(hp[0] + 2, hp[1] + 10, fa[2], pt), fL = pernaFrente(sh[0] - 4, sh[1] + 14, fa[0], pf);
  desenhaPerna(tL, [17, 11, 7.4, 6.6], '#7a4c1c'); desenhaPerna(fL, [14, 10, 7.6, 7], '#83521f');
  // cauda grossa, com manchas e anéis na ponta
  const ts = [hp[0] - 14, hp[1] - 6], sw = sin(f * .5);
  const cauda = [ts, [ts[0] - 22, ts[1] + 14 + sw * 4], [ts[0] - 40, ts[1] + 30 + sw * 6], [ts[0] - 52, ts[1] + 38 + sw * 8], [ts[0] - 60, ts[1] + 32 + sw * 9]];
  c.lineCap = 'round'; c.strokeStyle = G.base; c.lineWidth = 7.5; c.beginPath(); smooth(cauda); c.stroke(); c.strokeStyle = 'rgba(255,225,160,.35)'; c.lineWidth = 2; c.beginPath(); smooth(cauda.map(([x, y]) => [x, y - 2.4])); c.stroke();
  for (let k = 1; k < 9; k++) { const u = k / 9, i = Math.min(3, Math.floor(u * 4)), v = u * 4 - i, x = lerp(cauda[i][0], cauda[i + 1][0], v), y = lerp(cauda[i][1], cauda[i + 1][1], v); if (k > 5) { c.strokeStyle = G.ink; c.lineWidth = 3; c.beginPath(); c.arc(x, y, 3.6, -1.9, 1.2); c.stroke() } else disc(x, y - 1, 2.2, G.ink) }
  disc(cauda[4][0], cauda[4][1], 3.9, G.ink);
  // corpo: ombro alto, peito fundo, barriga recolhida antes da coxa, garupa redonda
  const top = x => { const u = clamp((x - hp[0] + 18) / (sh[0] - hp[0] + 40)); return lerp(lerp(hp[1] - 14, -75 + bob * .6 + flex * 3, ease(clamp(u * 2))), sh[1] - 23, ease(clamp(u * 2 - 1))) };
  const bot = x => { const u = clamp((x - hp[0] + 18) / (sh[0] - hp[0] + 40)); return u < .2 ? lerp(hp[1] + 26, hp[1] + 30, u / .2) : u < .4 ? lerp(hp[1] + 30, -31 + bob * .4, (u - .2) / .2) : u < .78 ? lerp(-31 + bob * .4, sh[1] + 27, (u - .4) / .38) : lerp(sh[1] + 27, sh[1] + 10, (u - .78) / .22) };
  const C = [[hp[0] - 19, hp[1] + 2], [hp[0] - 13, hp[1] - 13], [hp[0], hp[1] - 17], [-14, -74 + bob * .6 + flex * 3], [sh[0] - 22, sh[1] - 17], [sh[0] - 8, sh[1] - 24], [sh[0] + 8, sh[1] - 21], [sh[0] + 22, sh[1] - 12],
    [sh[0] + 26, sh[1] + 4], [sh[0] + 18, sh[1] + 22], [sh[0] + 2, sh[1] + 29], [-10, -31 + bob * .4], [hp[0] + 20, hp[1] + 25], [hp[0] + 6, hp[1] + 32], [hp[0] - 10, hp[1] + 26]];
  const corpo = () => { c.beginPath(); smooth(C, true) };
  c.fillStyle = lg(0, -84, 0, -26, [[0, G.esc], [.22, G.base], [.5, G.luz], [.76, '#e6cc98'], [1, G.creme]]); corpo(); c.fill();
  c.save(); corpo(); c.clip();
  c.fillStyle = rg(sh[0] - 6, sh[1] + 2, 2, 30, [[0, 'rgba(255,215,140,.35)'], [1, 'rgba(255,215,140,0)']]); c.fillRect(-120, -120, 240, 140);
  c.fillStyle = rg(hp[0] + 2, hp[1] + 4, 2, 30, [[0, 'rgba(255,215,140,.3)'], [1, 'rgba(255,215,140,0)']]); c.fillRect(-120, -120, 240, 140);
  c.strokeStyle = 'rgba(80,45,12,.3)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(sh[0] - 16, sh[1] - 12); c.quadraticCurveTo(sh[0] - 20, sh[1] + 10, sh[0] - 10, sh[1] + 27); c.moveTo(hp[0] + 18, hp[1] - 8); c.quadraticCurveTo(hp[0] + 22, hp[1] + 12, hp[0] + 14, hp[1] + 28); c.stroke();
  pelo(hp[0] - 20, -86, sh[0] + 26, -26, 420, PI * .55, 2.4, ['rgba(90,55,15,.22)', 'rgba(255,225,160,.16)'], 7, .5);
  // rosetas: manchas pretas em anel quebrado, com miolo mais escuro e pintinhas; viram pintas sólidas na barriga
  ROSETAS.forEach(([u, v, a, b, cc]) => {
    const x = lerp(hp[0] - 16, sh[0] + 20, u), y0 = top(x) + 3, y1 = bot(x) - 3; if (y1 <= y0) return; const y = lerp(y0, y1, v);
    const r = lerp(5.4, 2.8, v) * (u > .84 ? .7 : 1) * (.85 + b * .35);
    if (v > .8) { ell(x, y, r * .55, r * .42, a * 3, G.ink); return }
    ell(x, y, r * .8, r * .66, 0, 'rgba(160,95,30,.6)');
    const nb = 4 + Math.floor(cc * 2.5), miss = Math.floor(a * nb);
    for (let k = 0; k < nb; k++) { if (k === miss && b > .4) continue; const ang = a * TAU + k / nb * TAU + (b - .5) * .4; c.fillStyle = G.ink; c.beginPath(); c.ellipse(x + cos(ang) * r, y + sin(ang) * r * .82, r * (.36 + cc * .14), r * .24, ang + PI / 2, 0, TAU); c.fill() }
    if (b > .3) disc(x + (a - .5) * r * .5, y, r * .17, G.ink); if (b > .7) disc(x - r * .3, y + r * .25, r * .13, G.ink);
  });
  c.fillStyle = lg(0, -86, 0, -68, [[0, 'rgba(255,230,170,.3)'], [1, 'rgba(255,230,170,0)']]); c.fillRect(-120, -92, 240, 26);
  c.fillStyle = lg(0, -40, 0, -24, [[0, 'rgba(40,20,5,0)'], [1, 'rgba(40,20,5,.3)']]); c.fillRect(-120, -40, 240, 20);
  c.restore();
  // pernas do lado de cá, musculosas, com pintas
  const tP = pernaTras(hp[0], hp[1] + 8, fa[3], pt), fP = pernaFrente(sh[0] - 2, sh[1] + 12, fa[1], pf);
  desenhaPerna(tP, [22, 12.4, 8, 7], G.base, 'rgba(255,220,150,.14)'); manchasPerna(tP, 1.1, 31);
  desenhaPerna(fP, [18, 12, 8.6, 7.8], G.luz, 'rgba(255,230,170,.16)'); manchasPerna(fP, 1, 32);
  // pescoço grosso e cabeça larga
  const hb = sin(f * (gal ? 1 : 2)) * (gal ? 2.4 : .8) * an;
  at(sh[0] + 28, sh[1] - 2 + hb, 1.22, () => {
    c.scale(.86, 1.04);
    const cab = () => { c.beginPath(); smooth([[-12, -10], [-6, -17], [4, -18], [13, -14], [20, -8], [24, -3], [25.5, 1], [24, 5], [19, 8.5], [12, 11], [2, 13], [-8, 12], [-14, 4]], true) };
    c.fillStyle = lg(0, -18, 0, 13, [[0, '#a8702c'], [.4, G.luz], [.8, '#ecd6aa'], [1, G.creme]]); cab(); c.fill();
    c.save(); cab(); c.clip();
    pelo(-14, -18, 26, 13, 160, .1, 1.8, ['rgba(90,55,15,.35)', 'rgba(255,225,160,.3)'], 9, .45);
    ell(16, 4, 9.6, 6.4, 0, '#f0e2c6'); ell(4, 7, 9, 5, .2, 'rgba(150,95,40,.25)'); // focinho e bochecha
    const q = rng(77); for (let i = 0; i < 26; i++) { const x = -10 + q() * 24, y = -15 + q() * 14; if (x > 10 && y > -6) continue; disc(x, y, .5 + q() * .9, G.ink) }
    for (let i = 0; i < 6; i++) disc(-12 + i * 2.6, 8 + (i % 2) * 2, 1, G.ink);
    c.fillStyle = 'rgba(255,230,170,.35)'; c.beginPath(); c.ellipse(4, -16, 10, 2.4, -.1, 0, TAU); c.fill();
    c.restore();
    // orelha redonda, preta atrás com mancha clara
    ell(-6, -16.5, 3.8, 3.4, -.4, '#2a1a0c'); ell(-5.4, -16, 2.2, 1.9, -.4, '#c8a878');
    // olho âmbar, nariz, boca, bigodes
    olhoBicho(11.5, -6.5, 2.1, '#d8a838', -.12); c.strokeStyle = G.ink; c.lineWidth = .7; c.beginPath(); c.moveTo(8, -8.8); c.quadraticCurveTo(11.5, -10.2, 15, -8.4); c.stroke();
    c.strokeStyle = 'rgba(30,15,5,.6)'; c.lineWidth = .9; c.beginPath(); c.moveTo(13, -4.6); c.quadraticCurveTo(18, -2, 21.8, -1.4); c.stroke();
    c.fillStyle = '#6a3a2a'; c.beginPath(); c.moveTo(23.4, -2.6); c.quadraticCurveTo(26.4, -1.6, 25.6, 1.2); c.quadraticCurveTo(23.6, 1.4, 22.4, -.6); c.fill();
    c.strokeStyle = G.ink; c.lineWidth = .7; c.beginPath(); c.moveTo(24.6, 1.4); c.lineTo(24.4, 4.4); c.quadraticCurveTo(20, 7, 14, 6.6); c.stroke();
    for (const [x, y] of [[17, 3], [19, 2], [18.4, 4.4], [20.6, 3.6]]) disc(x, y, .35, G.ink);
    c.strokeStyle = 'rgba(255,250,235,.7)'; c.lineWidth = .25; for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(19, 2.4 + k * .6); c.quadraticCurveTo(28, k * 1.6, 36, -1 + k * 2.8); c.stroke() }
  });
}

// ---------- anta (tapir): corpo pesado, tromba curta, orelhas de borda branca ----------
function anta(t, o = {}) {
  const f = o.fase ?? t * 7, an = o.anda ?? 1, b = Math.abs(sin(f)) * 3 * an, cor = '#3e3530', corL = '#64584f', esc = '#211b18';
  const sh = [38, -58 + b], hp = [-46, -60 + b];
  const pf = { passo: 22, ergue: 12, l1: 22, l2: 20, l3: 8, an }, pt = { passo: 22, ergue: 11, l1: 22, l2: 20, l3: 16, an };
  const pata = (pts, ws, col, luz) => { membro(pts, ws, col, luz); const pe = pts[3]; c.fillStyle = '#121010'; c.beginPath(); c.moveTo(pe[0] - 4, pe[1] - 5); c.lineTo(pe[0] + 6, pe[1] - 4); c.lineTo(pe[0] + 7, pe[1]); c.lineTo(pe[0] - 5, pe[1]); c.fill(); c.strokeStyle = '#3a3330'; c.lineWidth = .6; c.beginPath(); c.moveTo(pe[0] + 1, pe[1] - 4.6); c.lineTo(pe[0] + 1.4, pe[1]); c.stroke() };
  pata(pernaTras(hp[0] + 4, hp[1] + 14, f + PI + .4, pt), [20, 13, 10, 10], esc); pata(pernaFrente(sh[0] - 2, sh[1] + 16, f + .4, pf), [18, 12, 10, 10], esc);
  const C = [[hp[0] - 20, hp[1] + 8], [hp[0] - 16, hp[1] - 18], [hp[0], hp[1] - 30], [-14, -96 + b], [12, -92 + b], [sh[0] + 4, sh[1] - 28], [sh[0] + 22, sh[1] - 14], [sh[0] + 22, sh[1] + 10], [sh[0] + 10, sh[1] + 26], [0, -32 + b], [-24, -30 + b], [hp[0] + 10, hp[1] + 32], [hp[0] - 10, hp[1] + 28]];
  const corpo = () => { c.beginPath(); smooth(C, true) };
  c.fillStyle = lg(0, -98, 0, -28, [[0, corL], [.35, cor], [1, esc]]); corpo(); c.fill();
  c.save(); corpo(); c.clip();
  c.fillStyle = rg(-10, -88 + b, 4, 70, [[0, 'rgba(255,240,220,.16)'], [1, 'rgba(255,240,220,0)']]); c.fillRect(-120, -120, 240, 120);
  c.fillStyle = rg(hp[0], hp[1] + 6, 2, 28, [[0, 'rgba(255,240,220,.1)'], [1, 'rgba(0,0,0,0)']]); c.fillRect(-120, -120, 240, 120);
  pelo(hp[0] - 20, -96, sh[0] + 24, -30, 380, PI * .5, 2.2, ['rgba(0,0,0,.28)', 'rgba(255,240,220,.1)'], 11, .5);
  c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(sh[0] - 12, sh[1] - 16); c.quadraticCurveTo(sh[0] - 16, sh[1] + 8, sh[0] - 6, sh[1] + 24); c.moveTo(hp[0] + 14, hp[1] - 14); c.quadraticCurveTo(hp[0] + 18, hp[1] + 10, hp[0] + 8, hp[1] + 28); c.stroke();
  c.restore();
  // crina curta no pescoço
  c.fillStyle = '#17110e'; c.beginPath(); c.moveTo(10, -92 + b); c.quadraticCurveTo(30, -90 + b, sh[0] + 18, sh[1] - 18); c.lineTo(sh[0] + 14, sh[1] - 14); c.quadraticCurveTo(28, -85 + b, 10, -88 + b); c.fill();
  pata(pernaTras(hp[0] + 2, hp[1] + 12, f + PI, pt), [24, 14, 11, 10.6], cor, 'rgba(255,240,220,.18)'); pata(pernaFrente(sh[0] + 2, sh[1] + 14, f, pf), [20, 13, 11, 10.6], cor, 'rgba(255,240,220,.18)');
  at(sh[0] + 24, sh[1] - 8 + sin(f) * 2 * an, 1, () => {
    const cab = () => { c.beginPath(); smooth([[-10, -12], [2, -18], [16, -14], [26, -5], [33, 0], [39, 3 + sin(f * 2) * 1.2], [38, 8], [31, 9], [20, 12], [6, 15], [-8, 10]], true) };
    c.fillStyle = lg(0, -18, 0, 15, [[0, corL], [.5, cor], [1, esc]]); cab(); c.fill();
    c.save(); cab(); c.clip(); pelo(-10, -18, 40, 15, 90, .2, 1.6, ['rgba(0,0,0,.3)', 'rgba(255,240,220,.1)'], 13, .45); c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = .5; for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(27 + k * 2, -2 + k * .4); c.quadraticCurveTo(28 + k * 2, 3, 27 + k * 2, 8); c.stroke() } ell(14, 9, 10, 4, .2, 'rgba(210,195,180,.25)'); c.restore();
    ell(-4, -14, 4.2, 5.4, -.3, '#2a2220'); c.strokeStyle = '#ddd4c8'; c.lineWidth = 1; c.beginPath(); c.ellipse(-4, -14, 4.2, 5.4, -.3, PI * 1.05, PI * 1.95); c.stroke();
    olhoBicho(10, -5, 1.4, '#3a2618'); ell(37, 5.4, 1.3, .9, 0, '#0c0808');
  });
}

// ---------- capivara: corpo de barril, pelo grosso e comprido, cabeça quadrada ----------
function capivara(t, o = {}) {
  const f = o.fase ?? t * 11, an = o.anda ?? 1, b = Math.abs(sin(f)) * 3 * an, cor = '#8a5e3c', corL = '#b5875c', esc = '#55381f';
  const sh = [26, -30 + b], hp = [-28, -32 + b];
  const pf = { passo: 14, ergue: 9, l1: 12, l2: 11, l3: 5, an }, pt = { passo: 14, ergue: 9, l1: 13, l2: 11, l3: 9, an };
  const pata = (pts, ws, col) => { membro(pts, ws, col); const pe = pts[3]; ell(pe[0] + 2, pe[1] - 1.6, 4.4, 1.8, 0, '#2a1a10') };
  pata(pernaTras(hp[0] + 4, hp[1] + 6, f + PI + .5, pt), [12, 7.6, 6, 5.4], esc); pata(pernaFrente(sh[0], sh[1] + 8, f + .5, pf), [10, 7, 5.6, 5], esc);
  const C = [[hp[0] - 14, hp[1] + 4], [hp[0] - 12, hp[1] - 18], [hp[0] + 4, hp[1] - 30], [0, -66 + b], [16, -62 + b], [sh[0] + 10, sh[1] - 22], [sh[0] + 14, sh[1] - 4], [sh[0] + 10, sh[1] + 12], [0, -15 + b], [hp[0] + 8, hp[1] + 18], [hp[0] - 6, hp[1] + 16]];
  const corpo = () => { c.beginPath(); smooth(C, true) };
  c.fillStyle = lg(0, -66, 0, -14, [[0, corL], [.45, cor], [1, esc]]); corpo(); c.fill();
  c.save(); corpo(); c.clip();
  c.fillStyle = rg(-4, -58 + b, 2, 40, [[0, 'rgba(255,225,180,.22)'], [1, 'rgba(255,225,180,0)']]); c.fillRect(-80, -80, 160, 80);
  pelo(-46, -68, 44, -14, 420, PI * .62, 4.2, ['rgba(60,36,18,.45)', 'rgba(220,170,110,.35)', 'rgba(40,24,12,.3)'], 21, .6);
  c.restore();
  pata(pernaTras(hp[0] + 2, hp[1] + 4, f + PI, pt), [15, 8.4, 6.4, 5.6], cor); pata(pernaFrente(sh[0] + 2, sh[1] + 6, f, pf), [12, 7.6, 6, 5.4], cor);
  at(sh[0] + 14, sh[1] - 18 + sin(f) * 1.6 * an, 1, () => {
    const cab = () => { c.beginPath(); smooth([[-10, -6], [0, -12], [14, -11], [24, -6], [28, 2], [27, 9], [19, 12], [4, 12], [-8, 8]], true) };
    c.fillStyle = lg(0, -12, 0, 12, [[0, corL], [.5, cor], [1, esc]]); cab(); c.fill();
    c.save(); cab(); c.clip(); pelo(-10, -12, 28, 12, 80, .3, 2.4, ['rgba(60,36,18,.45)', 'rgba(220,170,110,.3)'], 23, .5); ell(22, 4, 7, 6, 0, 'rgba(40,22,10,.35)'); c.restore();
    ell(-3, -11, 3, 2.6, 0, esc); ell(-3, -10.6, 1.6, 1.4, 0, '#2a1a10'); olhoBicho(9, -5, 1.4, '#2a1a10'); ell(26.4, 0, 1.4, .9, .4, '#1a0e06');
    c.strokeStyle = 'rgba(30,15,5,.6)'; c.lineWidth = .5; c.beginPath(); c.moveTo(26, 3); c.quadraticCurveTo(24, 7, 20, 8); c.stroke();
  });
}

// ---------- queixada: pelo eriçado escuro, crina, beiço e queixo brancos ----------
function queixada(t, o = {}) {
  const f = o.fase ?? t * 13, an = o.anda ?? 1, b = Math.abs(sin(f)) * 2.5 * an, cor = '#2f2a27', corL = '#55504b', esc = '#191615';
  const sh = [22, -34 + b], hp = [-24, -36 + b];
  const pf = { passo: 16, ergue: 10, l1: 14, l2: 13, l3: 6, an }, pt = { passo: 16, ergue: 10, l1: 15, l2: 12, l3: 10, an };
  const pata = (pts, ws, col) => { membro(pts, ws, col); const pe = pts[3]; c.fillStyle = '#0a0908'; c.beginPath(); c.moveTo(pe[0] - 2, pe[1] - 3); c.lineTo(pe[0] + 3.4, pe[1] - 2.4); c.lineTo(pe[0] + 3.6, pe[1]); c.lineTo(pe[0] - 2.4, pe[1]); c.fill() };
  pata(pernaTras(hp[0] + 2, hp[1] + 8, f + PI + .5, pt), [9, 5, 3.6, 3.4], esc); pata(pernaFrente(sh[0], sh[1] + 8, f + .5, pf), [8, 4.6, 3.4, 3.2], esc);
  const C = [[hp[0] - 10, hp[1] + 8], [hp[0] - 10, hp[1] - 14], [-6, -62 + b], [12, -64 + b], [sh[0] + 10, sh[1] - 18], [sh[0] + 14, sh[1] + 2], [sh[0] + 8, sh[1] + 14], [0, -24 + b], [hp[0] + 6, hp[1] + 16]];
  const corpo = () => { c.beginPath(); smooth(C, true) };
  c.fillStyle = lg(0, -64, 0, -24, [[0, corL], [.5, cor], [1, esc]]); corpo(); c.fill();
  c.save(); corpo(); c.clip(); pelo(-36, -66, 38, -24, 380, PI * .58, 3.4, ['rgba(0,0,0,.45)', 'rgba(200,190,180,.18)', 'rgba(90,80,72,.3)'], 31, .6); c.restore();
  c.strokeStyle = '#0e0c0b'; c.lineWidth = 1.1; c.lineCap = 'round'; c.beginPath(); for (let x = -18; x < 30; x += 1.8) { const y = -62 + b + (x > 6 ? (x - 6) * .5 : 0); c.moveTo(x, y + 2); c.lineTo(x - 2.4, y - 4 - (sin(x * 3) + 1.4) * 1.6) } c.stroke();
  pata(pernaTras(hp[0], hp[1] + 6, f + PI, pt), [11, 6, 4, 3.6], cor); pata(pernaFrente(sh[0] + 2, sh[1] + 6, f, pf), [10, 5.4, 3.8, 3.4], cor);
  at(sh[0] + 13, sh[1] - 6 + sin(f) * 1.5 * an, 1, () => {
    const cab = () => { c.beginPath(); smooth([[-8, -13], [6, -11], [18, -4], [25, 0], [26, 4], [21, 6], [8, 9], [-6, 8]], true) };
    c.fillStyle = lg(0, -13, 0, 9, [[0, corL], [1, esc]]); cab(); c.fill();
    c.save(); cab(); c.clip(); pelo(-8, -13, 26, 9, 70, .3, 2, ['rgba(0,0,0,.4)', 'rgba(200,190,180,.15)'], 33, .45); c.restore();
    c.fillStyle = '#ece6da'; c.beginPath(); c.moveTo(-3, 6); c.quadraticCurveTo(10, 3.6, 22, 5.2); c.quadraticCurveTo(10, 10.4, -5, 9); c.fill();
    ell(25.6, 1.6, 1.6, 2.8, 0, '#4a3a36'); disc(25.8, 1, .4, '#0a0606'); disc(25.8, 2.4, .4, '#0a0606'); ell(-4, -12, 2.6, 3.4, .4, esc); olhoBicho(8, -4, 1.1, '#3a2010');
  });
}

// ---------- veado-mateiro: pernas finas, pescoço longo, rabo branco ----------
function veado(t, o = {}) {
  const f = o.fase ?? t * 8, an = o.anda ?? 1, b = Math.max(0, sin(f)) * 8 * an, cor = '#9a5a2e', corL = '#c27c46', esc = '#683a1c';
  const sh = [30, -66 - b], hp = [-30, -68 - b];
  const pf = { passo: 24, ergue: 16, l1: 26, l2: 24, l3: 12, an }, pt = { passo: 24, ergue: 16, l1: 26, l2: 22, l3: 24, an };
  const pata = (pts, ws, col) => { membro(pts, ws, col); const pe = pts[3]; c.fillStyle = '#1a1010'; c.beginPath(); c.moveTo(pe[0] - 1.6, pe[1] - 3.4); c.lineTo(pe[0] + 3, pe[1] - 2.6); c.lineTo(pe[0] + 3, pe[1]); c.lineTo(pe[0] - 1.8, pe[1]); c.fill() };
  pata(pernaTras(hp[0] + 2, hp[1] + 8, f + PI + .3, pt), [9, 5, 3, 2.8], esc); pata(pernaFrente(sh[0], sh[1] + 10, f + .3, pf), [8, 4, 2.8, 2.6], esc);
  const C = [[hp[0] - 9, hp[1] + 4], [hp[0] - 8, hp[1] - 12], [0, -88 - b], [20, -86 - b], [sh[0] + 8, sh[1] - 12], [sh[0] + 10, sh[1] + 4], [sh[0] + 2, sh[1] + 14], [-2, -52 - b], [hp[0] + 6, hp[1] + 14]];
  const corpo = () => { c.beginPath(); smooth(C, true) };
  c.fillStyle = lg(0, -90, 0, -50, [[0, corL], [.55, cor], [.82, '#d8b48a'], [1, '#ecd8bc']]); corpo(); c.fill();
  c.save(); corpo(); c.clip(); pelo(-40, -90, 40, -50, 260, PI * .55, 2.2, ['rgba(80,40,15,.35)', 'rgba(255,220,180,.25)'], 41, .5); c.fillStyle = rg(hp[0] + 4, hp[1], 2, 18, [[0, 'rgba(255,220,180,.25)'], [1, 'rgba(0,0,0,0)']]); c.fillRect(-60, -100, 120, 60); c.restore();
  c.fillStyle = '#f6f0e4'; c.beginPath(); c.ellipse(hp[0] - 9, hp[1] - 2, 3.4, 6, -.6 - sin(f) * .3, 0, TAU); c.fill();
  pata(pernaTras(hp[0], hp[1] + 6, f + PI, pt), [12, 6, 3.4, 3], cor); pata(pernaFrente(sh[0] + 2, sh[1] + 8, f, pf), [10, 5, 3.2, 3], cor);
  c.fillStyle = lg(0, sh[1] - 30, 0, sh[1], [[0, corL], [1, cor]]); c.beginPath(); c.moveTo(sh[0] - 2, sh[1] - 10); c.quadraticCurveTo(sh[0] + 6, sh[1] - 24, sh[0] + 12, sh[1] - 32); c.lineTo(sh[0] + 20, sh[1] - 28); c.quadraticCurveTo(sh[0] + 14, sh[1] - 12, sh[0] + 10, sh[1] + 2); c.fill();
  c.fillStyle = 'rgba(245,235,215,.8)'; c.beginPath(); c.moveTo(sh[0] + 18, sh[1] - 26); c.quadraticCurveTo(sh[0] + 13, sh[1] - 12, sh[0] + 10, sh[1] + 2); c.lineTo(sh[0] + 8, sh[1] - 2); c.quadraticCurveTo(sh[0] + 12, sh[1] - 14, sh[0] + 16, sh[1] - 26); c.fill();
  at(sh[0] + 16, sh[1] - 32, 1, () => {
    c.fillStyle = lg(0, -8, 0, 8, [[0, corL], [1, esc]]); c.beginPath(); smooth([[-6, -6], [4, -8], [12, -4], [19, 1], [18, 5], [11, 6], [-4, 4]], true); c.fill();
    ell(-2, -10, 3, 6.4, -.5, esc); ell(-2, -10, 1.7, 4.6, -.5, '#e0bc96'); c.strokeStyle = '#5a4a3a'; c.lineWidth = 1.1; c.beginPath(); c.moveTo(1.6, -6.4); c.lineTo(3.4, -14); c.moveTo(4.4, -6.2); c.lineTo(5.6, -13); c.stroke();
    olhoBicho(5.5, -2, 1.3, '#2a1608'); disc(18, 2, 1.3, '#1a1010'); ell(14, 4.6, 3, 1.4, 0, 'rgba(240,230,215,.6)');
  });
}

// ---------- macaco-prego (salto de galho em galho) ----------
function macaco(t, o = {}) {
  const u = o.salto ?? 0, cor = '#6e4c30', corL = '#946c48', esc = '#2a1c12', ext = sin(u * PI);
  c.lineCap = 'round';
  c.strokeStyle = cor; c.lineWidth = 3.6; c.beginPath(); c.moveTo(-14, -2); c.bezierCurveTo(-30, 6, -42, -12 + ext * 8, -50, -4 - ext * 6); c.quadraticCurveTo(-54, 2, -50, 4); c.stroke();
  const lim = (x0, y0, ang, len, w, col) => { const x1 = x0 + cos(ang) * len * .5, y1 = y0 + sin(ang) * len * .5, x2 = x1 + cos(ang + (1 - ext) * .9) * len * .5, y2 = y1 + sin(ang + (1 - ext) * .9) * len * .5; membro([[x0, y0], [x1, y1], [x2, y2]], [w, w * .8, w * .6], col); ell(x2, y2, w * .5, w * .38, ang, esc); for (let k = -1; k <= 1; k++) seg(x2, y2, x2 + cos(ang + k * .4) * w * .9, y2 + sin(ang + k * .4) * w * .9, w * .2, w * .16, esc) };
  lim(12, -2, lerp(.6, -.3, ext), 30, 5, esc); lim(-10, 2, lerp(.9, 2.6, ext), 30, 6, esc);
  c.fillStyle = lg(0, -12, 0, 10, [[0, corL], [1, cor]]); c.beginPath(); c.ellipse(0, 0, 18, 9, -.1, 0, TAU); c.fill();
  c.save(); c.beginPath(); c.ellipse(0, 0, 18, 9, -.1, 0, TAU); c.clip(); pelo(-18, -9, 18, 9, 120, PI * .9, 2.6, ['rgba(40,25,12,.4)', 'rgba(220,180,130,.25)'], 51, .5); ell(2, 6, 14, 4, -.1, 'rgba(210,170,120,.35)'); c.restore();
  lim(14, 1, lerp(.9, -.1, ext), 30, 5.4, cor); lim(-8, 4, lerp(1.2, 2.9, ext), 32, 6.4, cor);
  at(20, -6, 1, () => { ell(0, 0, 7.4, 7, 0, corL); ell(-1, -4.4, 6.6, 3.6, 0, esc); ell(4.4, 2, 4.6, 3.8, 0, '#dcb68e'); olhoBicho(4.4, -.6, 1.1, '#3a2010'); disc(7.6, 1.8, .45, '#2a1a10'); disc(7.6, 2.8, .45, '#2a1a10'); c.strokeStyle = '#5a3a20'; c.lineWidth = .5; c.beginPath(); c.moveTo(5, 4.2); c.quadraticCurveTo(6.6, 4.8, 8, 4); c.stroke(); ell(-3.6, -.6, 2, 2.6, 0, '#c8a07a'); ell(-3.4, -.4, 1, 1.5, 0, '#8a6040') });
}
// galho com folhas (para o macaco)
function galho(x0, y0, x1, y1, w, col, folhas) { c.strokeStyle = col; c.lineCap = 'round'; c.lineWidth = w; c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + w * 1.4, x1, y1); c.stroke(); c.strokeStyle = 'rgba(255,240,210,.14)'; c.lineWidth = w * .25; c.beginPath(); c.moveTo(x0, y0 - w * .3); c.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + w * 1.1, x1, y1 - w * .3); c.stroke(); if (folhas) { const q = rng(x0 | 0); for (let k = 0; k < 12; k++) { const u = q(), x = lerp(x0, x1, u), y = lerp(y0, y1, u) + w; folha(x, y, 30 + q() * 30, (q() - .5) * 2 + PI / 2, 9, folhas[k % folhas.length]) } } }
// ---------- arara voando (asas batendo, penas desenhadas). tipo 'vermelha' ou 'caninde' ----------
function arara(t, o = {}) {
  const fl = o.fase ?? t * 9, tipo = o.tipo || 'vermelha', a = sin(fl);
  const P = tipo === 'vermelha' ? { corpo: '#c8281e', corpoL: '#ea4c34', asa1: '#e8c030', asa1b: '#58a040', asa2: '#2a6ab8', asa3: '#1a4a8a', cauda: '#c8281e', cauda2: '#2a6ab8' } : { corpo: '#2a78c8', corpoL: '#3e9ae2', asa1: '#2a78c8', asa1b: '#3a8ad0', asa2: '#1a5aa8', asa3: '#123c78', cauda: '#2a78c8', cauda2: '#1a4a8a', barriga: '#f2c230' };
  const asa = (far) => {
    const ang = (far ? -.2 : 0) + a * 1.05, k = far ? .8 : 1, sh = far ? .72 : 1, col = h => far ? shadeHex(h, sh) : h;
    c.save(); c.translate(2, -2); c.rotate(-ang); c.scale(1, k);
    c.fillStyle = col(P.asa1); c.beginPath(); c.moveTo(-8, 0); c.quadraticCurveTo(0, -18, 6, -30); c.lineTo(12, -28); c.quadraticCurveTo(10, -10, 8, 0); c.fill();
    c.fillStyle = col(P.asa1b); c.beginPath(); c.moveTo(0, -14); c.quadraticCurveTo(4, -24, 6, -30); c.lineTo(12, -28); c.quadraticCurveTo(10, -20, 8, -12); c.fill();
    for (let i = 0; i < 8; i++) { const yy = -30 - i * 3.6, x0 = 5 + i * .3; c.fillStyle = col(i < 5 ? P.asa2 : P.asa3); c.beginPath(); c.moveTo(x0, yy + 4); c.quadraticCurveTo(x0 + 6 + i * .8, yy - 2, x0 + 8 + i * 1.6, yy + 1 + i * .8); c.quadraticCurveTo(x0 + 6, yy + 5, x0 + 2, yy + 6); c.fill() }
    c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = .35; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(-4 + i * 2, -2 - i * 4); c.lineTo(8 + i * .4, -4 - i * 4.4); c.stroke() }
    c.restore();
  };
  asa(true);
  for (let i = 0; i < 3; i++) { c.fillStyle = i === 1 ? P.cauda2 : P.cauda; c.beginPath(); c.moveTo(-10, -2 + i * 1.6); c.lineTo(-58 + i * 4, 3 + i * 2.4 + a * 3); c.lineTo(-53 + i * 4, 6.4 + i * 2.4 + a * 3); c.lineTo(-10, 2.4 + i * 1.6); c.fill() }
  c.fillStyle = lg(0, -8, 0, 8, [[0, P.corpoL], [1, P.corpo]]); c.beginPath(); c.ellipse(0, 0, 15, 6.4, -.08, 0, TAU); c.fill();
  c.strokeStyle = 'rgba(0,0,0,.2)'; c.lineWidth = .3; for (let i = 0; i < 8; i++) { c.beginPath(); c.arc(-8 + i * 2.6, -1 + (i % 2), 1.6, 0, PI); c.stroke() }
  if (P.barriga) { c.fillStyle = P.barriga; c.beginPath(); c.ellipse(1, 3, 12, 3.4, -.08, 0, PI); c.fill() }
  at(15, -3, 1, () => { ell(0, 0, 6, 5.4, 0, P.corpoL); ell(1, .6, 3.2, 2.6, 0, '#f2ede4'); c.strokeStyle = '#1a1a1a'; c.lineWidth = .4; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(-.6, -.6 + k * 1.1); c.lineTo(2.4, -.4 + k * 1.1); c.stroke() } olhoBicho(1, -.4, .8, '#e8d8a0'); c.fillStyle = '#2a2420'; c.beginPath(); c.moveTo(4, -2.6); c.quadraticCurveTo(10, -2, 8.4, 4.4); c.quadraticCurveTo(6.4, 2.4, 4.4, 2); c.fill(); c.fillStyle = tipo === 'vermelha' ? '#e8e0d0' : '#2a2420'; c.beginPath(); c.moveTo(4, -2.6); c.quadraticCurveTo(8, -2.4, 8, 0); c.lineTo(4.4, .4); c.fill() });
  asa(false);
}
// passarinhos (silhuetas) saindo em revoada
function revoada(t, t0, n, x, y, seed, cor = 'rgba(10,14,12,.85)') {
  const q = rng(seed); c.fillStyle = cor; c.strokeStyle = cor; c.lineWidth = 2.4; c.lineCap = 'round';
  for (let i = 0; i < n; i++) { const dt = t - t0 - q() * .8, vx = (q() - .3) * 260, vy = -120 - q() * 160; if (dt < 0) continue; const px = x + (q() - .5) * 300 + vx * dt, py = y + (q() - .5) * 60 + vy * dt + 20 * dt * dt, s = 4 + q() * 4, w = sin(t * 22 + i) * s; c.beginPath(); c.moveTo(px - s * 1.6, py - w); c.quadraticCurveTo(px - s * .5, py - Math.abs(w) * .3, px, py); c.quadraticCurveTo(px + s * .5, py - Math.abs(w) * .3, px + s * 1.6, py - w); c.stroke() }
}
// rastros no barro (pegadas de anta, veado e porco)
function pegadas(x, y, n, dx, tipo, a = 1, seed = 1) {
  const q = rng(seed); c.save(); c.globalAlpha *= a;
  for (let i = 0; i < n; i++) { const px = x + i * dx + (i % 2) * dx * .3, py = y + (i % 2 ? 18 : -18) + (q() - .5) * 6, s = 1 + i * .04;
    if (tipo === 'anta') for (const [ox, oy] of [[-8, -4], [0, -9], [8, -4]]) { ell(px + ox * s, py + oy * s, 5 * s, 6 * s, 0, 'rgba(20,12,6,.55)'); ell(px + ox * s, py + oy * s - 1.5, 4 * s, 3 * s, 0, 'rgba(255,230,190,.08)') }
    else { for (const ox of [-4, 4]) { c.fillStyle = 'rgba(20,12,6,.55)'; c.beginPath(); c.ellipse(px + ox * s, py, 3.4 * s, 9 * s, ox * .02, 0, TAU); c.fill() } } }
  c.restore();
}
