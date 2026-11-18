// ================= Animais e navio mais realistas (substituem os desenhos simples de dracula.js / mundo*.js) =================
// Contorno com pelo (pequenas pontas), luz da lua no lombo, sombra embaixo, olhos que brilham.
function contornoPelo(pts, amp, seed, passo = 9) { // devolve o contorno com pelos (dentes pequenos e irregulares)
  const q = rng(seed), out = [];
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length], L = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.floor(L / passo)), nx = (y1 - y0) / (L || 1), ny = -(x1 - x0) / (L || 1);
    for (let k = 0; k < n; k++) { const u = k / n, a = (k % 2 ? 1 : -.25) * amp * (.5 + q()); out.push([lerp(x0, x1, u) + nx * a, lerp(y0, y1, u) + ny * a]) }
  }
  return out;
}
function caminho(pts) { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath() }
// ---------- lobo cinzento, de perfil, olhando para a direita (pés em y=0; s=1 → ~200 px de comprimento) ----------
function suave(pts) { const n = pts.length, m = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; c.beginPath(); c.moveTo(...m(pts[n - 1], pts[0])); for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n], mm = m(p, q); c.quadraticCurveTo(p[0], p[1], mm[0], mm[1]) } c.closePath() }
function tufos(pts, cor, comp, seed, passo = 5) { const q = rng(seed); c.strokeStyle = cor; c.lineCap = 'round'; for (let i = 0; i < pts.length; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length], L = Math.hypot(x1 - x0, y1 - y0), nx = (y1 - y0) / (L || 1), ny = -(x1 - x0) / (L || 1); for (let k = 0; k < L / passo; k++) { const u = k * passo / L, px = lerp(x0, x1, u), py = lerp(y0, y1, u), l = comp * (.3 + q() * .7); c.lineWidth = .7 + q() * .8; c.beginPath(); c.moveTo(px - nx * 1.5, py - ny * 1.5); c.lineTo(px + nx * l - (x1 - x0) / L * l * .8, py + ny * l - (y1 - y0) / L * l * .8); c.stroke() } } }
function lobo(x, y, s, t, dir = 1, o = {}) {
  c.save(); c.translate(x, y); c.scale(s * dir * .62, s * .62); c.lineJoin = 'round';
  const uiva = o.uiva ?? 0, pas = o.anda ? sin(t * 6) * 6 : 0, base = '#4a525e', escuro = '#1a1d24', sela = '#2a2e36', claro = '#a8b2c0', branco = '#d8dee8';
  // pernas do outro lado
  const pernaF = (x0, k, cor) => { c.fillStyle = cor; suave([[x0 - 6, -60], [x0 + 6, -60], [x0 + 6 + k, -28], [x0 + 5 + k, -6], [x0 + 12 + k, 0], [x0 - 2 + k, 0], [x0 - 3 + k, -28]]); c.fill() };
  const pernaT = (x0, k, cor) => { c.fillStyle = cor; suave([[x0 - 12, -66], [x0 + 10, -64], [x0 + 6, -42], [x0 - 2 + k, -26], [x0 + 2 + k, -6], [x0 + 9 + k, 0], [x0 - 5 + k, 0], [x0 - 8 + k, -24], [x0 - 4, -42]]); c.fill() };
  pernaF(56, -pas, escuro); pernaT(-52, pas, escuro);
  // cauda espessa, caída
  const cauda = [[-62, -90], [-70, -86], [-84, -64], [-92, -40], [-90, -24], [-82, -30], [-76, -52], [-64, -74]]; c.fillStyle = sela; suave(cauda); c.fill(); tufos(cauda.slice(1, 6), sela, 6, 3); c.fillStyle = escuro; c.beginPath(); c.ellipse(-88, -28, 4, 7, .3, 0, 7); c.fill();
  // corpo
  const corpo = [[52, -98], [20, -100], [-10, -97], [-40, -98], [-62, -92], [-74, -74], [-72, -56], [-60, -50], [-44, -50], [-20, -46], [10, -50], [36, -56], [56, -58], [72, -72], [84, -88], [74, -106]];
  c.save(); suave(corpo); c.fillStyle = lg(0, -100, 0, -46, [[0, claro], [.3, base], [1, escuro]]); c.fill(); c.clip();
  c.fillStyle = sela; c.beginPath(); c.ellipse(-10, -98, 52, 10, -.04, 0, 7); c.fill(); c.fillStyle = 'rgba(210,220,236,.35)'; c.beginPath(); c.ellipse(-6, -104, 50, 5, -.04, 0, 7); c.fill();
  c.fillStyle = branco; c.beginPath(); c.ellipse(70, -70, 16, 22, -.5, 0, 7); c.fill(); c.fillStyle = 'rgba(10,12,16,.35)'; c.beginPath(); c.ellipse(-10, -50, 50, 7, 0, 0, 7); c.fill();
  const q = rng(5); c.strokeStyle = 'rgba(20,22,28,.35)'; c.lineWidth = 1; for (let i = 0; i < 90; i++) { const px = -68 + q() * 140, py = -98 + q() * 48; c.beginPath(); c.moveTo(px, py); c.lineTo(px - 4 - q() * 4, py + 2 + q() * 3); c.stroke() } c.restore();
  tufos([[56, -58], [72, -72], [84, -88]], branco, 4.5, 9, 3); tufos([[-60, -50], [-44, -50], [-20, -46], [10, -50], [36, -56]], base, 5, 7, 4); tufos([[-62, -92], [-74, -74]], base, 5, 8, 4);
  // pernas deste lado
  pernaT(-44, -pas, base); pernaF(46, pas, base); c.fillStyle = 'rgba(216,222,232,.8)'; c.beginPath(); c.ellipse(52 + pas, -6, 6, 7, 0, 0, 7); c.fill();
  // cabeça (gira para cima quando uiva)
  c.save(); c.translate(76, -100); c.rotate(-uiva * .9);
  poly([[4, -10], [8, -32], [18, -12]], sela); poly([[7, -12], [9, -26], [15, -12]], '#5a3a3a'); poly([[14, -10], [20, -30], [26, -10]], base); poly([[17, -11], [20, -24], [23, -11]], '#6a4a4a');
  const cab = [[-6, 6], [-4, -6], [10, -12], [28, -10], [40, -6], [62, -2], [70, 2], [68, 8], [52, 12], [36, 16], [18, 20], [2, 18]];
  c.save(); suave(cab); c.fillStyle = lg(0, -12, 0, 20, [[0, claro], [.5, base], [1, sela]]); c.fill(); c.clip(); c.fillStyle = branco; c.beginPath(); c.ellipse(46, 10, 22, 6, .08, 0, 7); c.fill(); c.beginPath(); c.ellipse(26, 6, 12, 7, 0, 0, 7); c.fill(); c.fillStyle = sela; c.beginPath(); c.ellipse(30, -10, 18, 5, .1, 0, 7); c.fill(); c.restore();
  tufos([[-4, -6], [-6, 6], [2, 18], [18, 20]], branco, 5, 11, 3);
  c.fillStyle = '#08080a'; c.beginPath(); c.ellipse(68, 3, 4.2, 3.4, 0, 0, 7); c.fill(); c.strokeStyle = '#0c0c10'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(66, 8); c.quadraticCurveTo(54, 12, 42, 12 + uiva * 3); c.stroke();
  if (uiva > .3) { c.fillStyle = '#1a0a0c'; c.beginPath(); c.moveTo(64, 9); c.lineTo(42, 13); c.lineTo(58, 19); c.closePath(); c.fill(); poly([[60, 9], [61, 12], [62, 9]], '#f2ece2') }
  const bri = o.olhos ?? .7; add(() => glow(33, -4, 9, '255,190,70', .8 * bri)); c.fillStyle = '#ffcf5a'; c.beginPath(); c.ellipse(33, -4, 3.4, 2, -.25, 0, 7); c.fill(); disc(33.6, -4, 1.1, '#100804'); c.strokeStyle = '#0c0c10'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(29, -5); c.quadraticCurveTo(33, -7.4, 37, -5); c.stroke();
  c.restore(); c.restore();
}
// ---------- cavalo de perfil, olhando para a direita (cascos em y=0, ~2,4 m → 200 de altura) ----------
function cavalo(s, t, cor = '#0c0c10', galope = 1, ph = 0) {
  const g = (k) => sin(t * 9 * galope + ph + k) * galope, luz = 'rgba(200,210,230,.18)';
  const perna = (hx, hy, k, frente) => { const a = g(k) * .5, b = -Math.abs(g(k + 1)) * .9; c.save(); c.translate(hx, hy); c.rotate(a); c.fillStyle = cor; c.beginPath(); c.moveTo(-9, 0); c.quadraticCurveTo(-11, 30, -6, 48); c.lineTo(6, 48); c.quadraticCurveTo(10, 24, 9, 0); c.fill(); c.translate(0, 48); c.rotate(frente ? b * -.6 : b); c.beginPath(); c.moveTo(-5, 0); c.lineTo(-4, 40); c.lineTo(4, 40); c.lineTo(5, 0); c.fill(); c.translate(0, 40); c.fillRect(-6, 0, 13, 10); c.restore() };
  perna(-62, -120, 2.2, 0); perna(50, -122, 3.6, 1);
  c.fillStyle = cor; c.beginPath(); c.moveTo(-86, -150); c.bezierCurveTo(-70, -172, 30, -174, 62, -160); c.bezierCurveTo(78, -154, 84, -134, 74, -114); c.bezierCurveTo(40, -100, -40, -98, -76, -108); c.bezierCurveTo(-92, -116, -96, -138, -86, -150); c.fill();
  c.fillStyle = luz; c.beginPath(); c.ellipse(-10, -164, 70, 6, 0, 0, 7); c.fill();
  c.fillStyle = cor; c.beginPath(); c.moveTo(48, -160); c.bezierCurveTo(70, -196, 92, -226, 108, -236); c.lineTo(122, -226); c.bezierCurveTo(108, -200, 96, -170, 78, -126); c.closePath(); c.fill();
  c.save(); c.translate(112, -230); c.rotate(.55 + g(.5) * .05); c.beginPath(); c.moveTo(-10, -6); c.bezierCurveTo(10, -14, 40, -12, 60, -2); c.bezierCurveTo(66, 4, 62, 12, 54, 14); c.bezierCurveTo(30, 14, 4, 12, -10, 8); c.closePath(); c.fill(); poly([[-6, -8], [-2, -22], [4, -8]], cor); poly([[4, -10], [8, -24], [12, -10]], cor); disc(14, -4, 2, 'rgba(255,220,160,.6)'); disc(56, 4, 2.4, 'rgba(0,0,0,.7)'); c.restore();
  c.strokeStyle = cor; c.lineWidth = 6; for (let k = 0; k < 7; k++) { c.beginPath(); c.moveTo(56 + k * 9, -170 - k * 9); c.quadraticCurveTo(40 + k * 8 - g(k) * 6, -160 - k * 8, 30 + k * 8 - g(k) * 10, -150 - k * 6); c.stroke() }
  c.lineWidth = 8; c.beginPath(); c.moveTo(-86, -146); c.quadraticCurveTo(-120, -150 + g(1) * 10, -136, -110 + g(1) * 8); c.stroke(); c.lineWidth = 5; c.beginPath(); c.moveTo(-90, -140); c.quadraticCurveTo(-118, -130, -128, -96 + g(2) * 8); c.stroke();
  perna(-52, -118, 0, 0); perna(60, -120, 1.4, 1);
}
function cavaleiro(x, y, s, t, dir = 1, o = {}) { c.save(); c.translate(x, y); c.scale(s * dir * .5, s * .5); const cor = o.cor || '#08080c'; cavalo(1, t, cor, 1, x * .01);
  c.fillStyle = cor; c.beginPath(); c.moveTo(-26, -172); c.quadraticCurveTo(-34, -210, -10, -236); c.lineTo(14, -236); c.quadraticCurveTo(26, -206, 18, -170); c.fill(); limb([[0, -176], [20, -150], [10, -120]], 12, 10, cor); disc(2, -252, 15, cor); c.fillRect(-14, -270, 30, 8); c.beginPath(); c.moveTo(-26, -236); c.quadraticCurveTo(-70, -210 + sin(t * 8) * 8, -76, -170); c.lineTo(-20, -190); c.fill();
  limb([[10, -226], [50, -246], [74, -270]], 9, 7, cor); if (o.tocha) { line(74, -270, 84, -320, '#3a2a1a', 7); add(() => glow(86, -334, 110, '255,150,60', .7)); poly([[76, -326], [86, -372 - sin(t * 13) * 10], [98, -326]], '#f09a3e'); poly([[81, -330], [86, -356], [92, -330]], '#fff0c8') } if (o.lanca) line(-20, -200, 220, -280, cor, 6);
  c.restore() }
// carruagem: mesma caixa de antes, cavalos novos
function carruagem(x, y, s, t, o = {}) { c.save(); c.translate(x, y); c.scale(s * (o.dir || 1), s); const cor = o.cor || '#0a0a0e';
  c.fillStyle = cor; c.beginPath(); c.roundRect(-150, -150, 150, 110, 18); c.fill(); c.fillRect(-170, -60, 210, 20); poly([[-156, -150], [6, -150], [-10, -166], [-140, -166]], cor); if (o.luz) { c.fillStyle = '#e8a050'; c.fillRect(-120, -132, 46, 40); add(() => glow(-97, -112, 70, '240,150,70', .35)); lampada(-160, -150, t); lampada(10, -150, t) }
  for (const wx of [-130, -10]) { c.strokeStyle = cor; c.lineWidth = 6; c.beginPath(); c.arc(wx, -30, 30, 0, 7); c.stroke(); for (let k = 0; k < 8; k++) { const a = k / 8 * PI + t * 4; line(wx, -30, wx + cos(a) * 30, -30 + sin(a) * 30, cor, 2.4) } disc(wx, -30, 6, cor) }
  c.fillStyle = cor; c.fillRect(0, -110, 30, 50); disc(15, -128, 12, cor); c.fillRect(6, -154, 18, 22); c.fillRect(2, -158, 26, 4); line(30, -90, 110, -60, cor, 3);
  for (const hx of [110, 210]) { c.save(); c.translate(hx, 0); c.scale(.42, .42); cavalo(1, t, cor, 1, hx); c.restore() }
  c.restore() }
function lampada(x, y, t) { c.fillStyle = '#0a0a0e'; c.fillRect(x - 5, y - 4, 10, 14); add(() => glow(x, y + 2, 40, '255,200,120', .5)); disc(x, y + 2, 3, '#ffe0a0') }
// ---------- morcego mais detalhado (dedos da asa, membrana recortada, orelhas, pelo) ----------
function morcego(x, y, s, t, ph = 0, dir = 1) { const f = sin(t * 18 + ph), a = f * .95; c.save(); c.translate(x, y); c.scale(s * dir, s);
  for (const k of [-1, 1]) { c.save(); c.scale(k, 1); c.rotate(-a * .55);
    const P = [[3, -3], [12, -10 - a * 8], [20, -18 - a * 13], [38, -8 - a * 15]]; c.fillStyle = '#07080c'; c.beginPath(); c.moveTo(3, -1); c.lineTo(P[1][0], P[1][1]); c.lineTo(P[2][0], P[2][1]); c.lineTo(P[3][0], P[3][1]); c.quadraticCurveTo(31, -6 - a * 9, 30, -1 - a * 7); c.quadraticCurveTo(25, -3 - a * 5, 22, 3 - a * 4); c.quadraticCurveTo(17, 0, 14, 5 - a * 2); c.quadraticCurveTo(9, 2, 4, 5); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(70,40,50,.7)'; c.lineWidth = .7; c.beginPath(); c.moveTo(P[1][0], P[1][1]); c.lineTo(30, -1 - a * 7); c.moveTo(P[1][0], P[1][1]); c.lineTo(22, 3 - a * 4); c.moveTo(P[1][0], P[1][1]); c.lineTo(14, 5 - a * 2); c.stroke(); c.restore() }
  c.fillStyle = '#16121a'; c.beginPath(); c.ellipse(0, 0, 4.4, 7.4, 0, 0, 7); c.fill(); disc(0, -7.2, 4.2, '#16121a'); poly([[-3.6, -9], [-2.6, -16], [-.8, -9.8]], '#16121a'); poly([[3.6, -9], [2.6, -16], [.8, -9.8]], '#16121a'); poly([[-2.4, -10], [-2.2, -14], [-1.4, -10.4]], '#5a2a30'); poly([[2.4, -10], [2.2, -14], [1.4, -10.4]], '#5a2a30');
  disc(-1.4, -7.6, .75, SANGUE2); disc(1.4, -7.6, .75, SANGUE2); line(-1.6, 7, -2.6, 10, '#16121a', .8); line(1.6, 7, 2.6, 10, '#16121a', .8); c.restore() }
// ---------- corvos (silhueta com asas que batem) ----------
function corvos(t, seed, n, cx, cy, r) { const q = rng(seed); for (let i = 0; i < n; i++) { const a = q() * 6 + t * (.2 + q() * .3), x = cx + cos(a) * r * (1 + q()), y = cy + sin(a) * r * .3 + sin(t * 2 + i) * 8, sc = .8 + q() * .6, f = sin(t * 8 + i * 1.7), d = sin(a) > 0 ? 1 : -1;
  c.save(); c.translate(x, y); c.scale(sc * d, sc); c.fillStyle = '#05050a'; c.beginPath(); c.ellipse(0, 0, 13, 5, -.1, 0, 7); c.fill(); disc(12, -2, 4.4, '#05050a'); poly([[15, -3], [24, -1], [15, 0]], '#05050a'); poly([[-12, -1], [-24, -5], [-24, 4], [-12, 2]], '#05050a');
  for (const k of [-1, 1]) { c.beginPath(); c.moveTo(-4, -2); c.quadraticCurveTo(-2, -14 * f * k - 6, 8, -26 * f * k); c.lineTo(10, -22 * f * k); c.quadraticCurveTo(4, -8 * f * k, 6, -1); c.closePath(); c.fill() } c.restore() } }
// ---------- navio de dois mastros (escuna) na tempestade, olhando para a esquerda ----------
function navio(x, y, s, t, o = {}) { c.save(); c.translate(x, y); c.rotate(sin(t * 1.3) * (o.balanço ?? .08) + sin(t * 2.1) * .02); c.scale(s, s);
  const casco = '#1a120c', casco2 = '#2e2016', vela = o.velas || '#8a8e98', velaS = shadeHex(vela.length === 7 ? vela : '#8a8e98', .7), corda = 'rgba(20,16,12,.85)';
  // cordame de fundo
  c.strokeStyle = corda; c.lineWidth = 1.2; for (const [ax, ay, bx, by] of [[-60, -250, -190, -40], [60, -270, -60, -250], [60, -270, 170, -20], [-60, -250, 70, -20], [60, -270, -230, -60]]) { c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke() }
  // mastros e vergas
  for (const [mx, h] of [[-60, 250], [60, 270]]) { c.fillStyle = '#20160e'; c.fillRect(mx - 4, -h, 8, h); c.fillRect(mx - 46, -h + 30, 92, 5); c.fillRect(mx - 38, -h + 90, 76, 5) }
  c.save(); c.translate(-230, -60); c.rotate(-.18); c.fillStyle = '#20160e'; c.fillRect(0, -3, 90, 6); c.restore();
  // velas (curvas, sombreadas, rasgadas)
  const velaQ = (x0, y0, w, h, inf, rasg) => { const g = sin(t * 3 + x0) * 4 * inf; c.fillStyle = lg(x0, 0, x0 + w, 0, [[0, velaS], [.5, vela], [1, velaS]]); c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x0 + w / 2, y0 - 8, x0 + w, y0); c.quadraticCurveTo(x0 + w + 8 + g, y0 + h / 2, x0 + w - 4, y0 + h); c.quadraticCurveTo(x0 + w / 2, y0 + h + 10 + g, x0 + 4, y0 + h); c.quadraticCurveTo(x0 - 8 + g, y0 + h / 2, x0, y0); c.fill();
    c.strokeStyle = 'rgba(40,40,50,.35)'; c.lineWidth = 1; for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(x0 + 4, y0 + h * k / 4); c.quadraticCurveTo(x0 + w / 2, y0 + h * k / 4 + 6, x0 + w - 4, y0 + h * k / 4); c.stroke() }
    if (rasg) { c.fillStyle = 'rgba(8,10,16,.9)'; poly([[x0 + w * .5, y0 + h * .3], [x0 + w * .78, y0 + h * .5], [x0 + w * .6, y0 + h * .58], [x0 + w * .72, y0 + h * .82], [x0 + w * .46, y0 + h * .6]], 'rgba(8,10,16,.9)'); for (let k = 0; k < 3; k++) { c.strokeStyle = vela; c.lineWidth = 3; c.beginPath(); c.moveTo(x0 + w * .78, y0 + h * .5); c.quadraticCurveTo(x0 + w + 20 + k * 6, y0 + h * .5 + sin(t * 10 + k) * 10, x0 + w + 40 + k * 8, y0 + h * .4 + k * 10); c.stroke() } } };
  velaQ(-100, -218, 80, 56, 1, 0); velaQ(-96, -156, 72, 70, 1, o.rasgada); velaQ(20, -238, 80, 56, 1, 0); velaQ(24, -176, 72, 72, 1, o.rasgada);
  c.fillStyle = vela; c.beginPath(); c.moveTo(-64, -232); c.lineTo(-170, -60); c.quadraticCurveTo(-110, -64, -66, -40); c.closePath(); c.fill(); c.fillStyle = velaS; c.beginPath(); c.moveTo(-64, -232); c.lineTo(-120, -110); c.lineTo(-66, -40); c.closePath(); c.fill();
  c.fillStyle = shadeHex(vela.length === 7 ? vela : '#8a8e98', .85); c.beginPath(); c.moveTo(56, -250); c.lineTo(56, -40); c.lineTo(150, -46); c.quadraticCurveTo(120, -140, 56, -250); c.fill();
  // casco com tábuas, borda, escotilhas e figura de proa
  c.fillStyle = casco; c.beginPath(); c.moveTo(-210, -50); c.quadraticCurveTo(-180, -36, -150, -30); c.lineTo(170, -34); c.quadraticCurveTo(190, -40, 196, -60); c.lineTo(190, -20); c.quadraticCurveTo(170, 30, 120, 34); c.lineTo(-120, 34); c.quadraticCurveTo(-190, 20, -210, -50); c.fill();
  c.strokeStyle = 'rgba(80,60,40,.6)'; c.lineWidth = 1.4; for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(-200 + k * 6, -38 + k * 14); c.quadraticCurveTo(0, -24 + k * 14, 186 - k * 6, -30 + k * 13); c.stroke() }
  c.fillStyle = casco2; c.fillRect(-150, -38, 320, 8); c.fillStyle = '#c8b890'; c.fillRect(-150, -30, 320, 3); for (let k = 0; k < 7; k++) disc(-110 + k * 40, -10, 4, '#0a0806');
  c.fillStyle = '#2e2016'; c.fillRect(-150, -52, 320, 4); for (let k = 0; k < 16; k++) c.fillRect(-148 + k * 20, -52, 3, 14);
  poly([[-206, -52], [-224, -66], [-216, -40]], '#c8b890'); if (o.luz !== false) { add(() => glow(150, -60, 40, '255,190,110', .5)); disc(150, -60, 4, '#ffe0a0') }
  c.restore() }
// ondas com crista de espuma e respingos
function ondas(t, y, cor, a = 1) { c.fillStyle = cor; c.beginPath(); c.moveTo(0, H); const pts = []; for (let x = 0; x <= W; x += 16) { const yy = y + sin(x * .01 + t * 2) * 30 * a + sin(x * .023 - t * 3) * 18 * a; pts.push([x, yy]); c.lineTo(x, yy) } c.lineTo(W, H); c.fill();
  c.strokeStyle = `rgba(210,220,236,${.45 * a})`; c.lineWidth = 3; c.beginPath(); pts.forEach(([x, yy], i) => { const crista = sin(x * .01 + t * 2) > .6; if (crista) { c.moveTo(x, yy); c.lineTo(x + 16, yy - 2) } }); c.stroke();
  const q = rng(Math.floor(t * 6)); for (let i = 0; i < 30 * a; i++) { const [x, yy] = pts[Math.floor(q() * pts.length)]; if (sin(x * .01 + t * 2) > .5) disc(x + q() * 20, yy - q() * 30, 1.5 + q() * 3, `rgba(220,228,240,${.5 * a})`) } }
function chuva(t, n, a = .35) { c.strokeStyle = `rgba(190,200,220,${a})`; c.lineWidth = 1.4; const q = rng(77); c.beginPath(); for (let i = 0; i < n; i++) { const x = (q() * W * 1.3 + t * 300) % (W * 1.3) - W * .15, y = (q() * H + t * 1400 * (.8 + q() * .4)) % H; c.moveTo(x, y); c.lineTo(x - 14, y + 34) } c.stroke() }
