// ================= COLUMBIA · STS-107 — 2 min (122 s) — modelo Recorte Dourado =================
// Cortes acompanham a narração (ver ROTEIRO.md). Desenho do estilo em motor.js; aqui ficam o ônibus espacial e as cenas.
const DUR = 122.0;
const CUTS = [0, 7.4, 12.2, 16.4, 21.3, 27.5, 32.0, 35.4, 44.8, 46.9, 50.0, 54.6, 59.3, 64.6, 70.8, 77.7, 85.0, 88.6, 101.0, 105.0, 109.6, 113.2, 118.4, DUR];
const TX = 110, TY = 170;
const OURO = '#f0b94a', CREME = '#fff6e0', PALHA = '#e6d3a0', FERRUGEM = '#b8452f';

// ---------- cores do ônibus espacial por luz ----------
const TILE = {
  dia: { w: ['#8f8b7e', '#d6d0bd', '#f4efdc', '#c4bda7'], k: '#121318', k2: '#2a2d35', g: ['#4f525a', '#878a91'], o: ['#74391a', '#b05c2b', '#d6813f', '#9e5229'], s: ['#9a958a', '#dad4c1', '#f6f1de', '#c6bfa9'] },
  alva: { w: ['#4e4a58', '#a29a98', '#ede0c6', '#8f8790'], k: '#0c0d12', k2: '#22242c', g: ['#3a3c44', '#62656d'], o: ['#4a2614', '#86461f', '#c07038', '#6b3a1c'], s: ['#5a5560', '#b0a8a2', '#efe2c8', '#9a929a'] },
  esp: { w: ['#2f343d', '#8f979e', '#f5f3e6', '#b2b9be'], k: '#0b0c10', k2: '#1f2229', g: ['#363940', '#666a72'], o: ['#4a2614', '#86461f', '#c07038', '#6b3a1c'], s: ['#2f343d', '#8f979e', '#f5f3e6', '#b2b9be'] },
  hang: { w: ['#5a5348', '#b4aa94', '#efe3c4', '#a59a84'], k: '#111216', k2: '#26282f', g: ['#44464d', '#74777e'], o: ['#4a2614', '#86461f', '#c07038', '#6b3a1c'], s: ['#5a5348', '#b4aa94', '#efe3c4', '#a59a84'] },
};
const FONTE = '"Fira Sans Extra Condensed", sans-serif';

// Orbitador visto de lado: nariz para +x, barriga em y=0, 37 m de comprimento (x de -18,6 a 18,6)
function orbSide(o = {}) {
  const P = TILE[o.pal || 'dia'], w = P.w;
  if (o.bay) { poly([[-11, 5.8], [10.2, 5.8], [10.6, 10.4], [-10.6, 10.4]], w[3]); c.fillStyle = 'rgba(20,22,29,.18)'; for (let x = -10; x < 10; x += 2.4) c.fillRect(x, 6, .08, 4.3); c.fillStyle = w[2]; c.fillRect(-10.6, 10.1, 21.2, .3) }
  for (const ey of [3.0, 5.6]) { poly([[-18.4, ey - .55], [-18.4, ey + .55], [-21.4, ey + 1.15], [-21.4, ey - 1.15]], o.lit ? '#7a4a2c' : '#2a2c33'); c.fillStyle = o.lit ? '#f6c25a' : '#4a4d55'; c.fillRect(-21.5, ey - 1.15, .25, 2.3) }
  poly([[-10.6, 5.9], [-16.2, 16.3], [-18.3, 16.7], [-19.5, 16.4], [-19.4, 7.6], [-18.4, 6.6]], w[2]);
  poly([[-17.6, 7.0], [-18.3, 16.5], [-19.5, 16.4], [-19.4, 7.6]], w[3]);
  line(-10.6, 5.9, -16.2, 16.3, P.g[1], .4);
  if (o.silts !== false) poly([[-16.0, 16.2], [-15.8, 16.9], [-16.5, 17.5], [-18.6, 17.5], [-18.5, 16.6]], P.k);
  poly([[-11.2, 5.9], [-12.6, 7.0], [-17.0, 7.6], [-18.6, 7.1], [-18.6, 5.9]], w[2]); poly([[-12.6, 7.0], [-17.0, 7.6], [-18.6, 7.1], [-16, 6.8]], w[1]);
  poly([[-18.6, 6.4], [-18.6, 7.0], [-19.9, 7.35], [-19.9, 6.05]], '#2a2c33');
  const body = [[-18.6, 1.0], [-17.2, .3], [12.6, .3], [15.8, .55], [17.6, 1.2], [18.45, 2.0], [18.5, 2.7], [18.0, 3.4], [16.7, 4.4], [15.2, 5.8], [14.0, 6.45], [12.4, 6.65], [11.2, 6.2], [10.6, 5.9], [-11.2, 5.9], [-18.6, 5.9]];
  poly(body, bands(0, .3, 0, 6.65, [[.3, w[0]], [.56, w[3]], [.84, w[2]], [1, w[1]]]));
  poly([[-18.6, 1.0], [-17.2, .3], [12.6, .3], [15.8, .55], [17.6, 1.2], [18.45, 2.0], [17.4, 2.05], [15.6, 1.6], [12, 1.5], [9.6, 1.55], [-1.5, 2.2], [-15.9, 2.05], [-18.6, 1.95]], P.k);
  poly([[17.6, 1.2], [18.45, 2.0], [18.5, 2.7], [18.1, 3.2], [17.5, 2.05]], P.g[1]);
  line(9.6, 1.6, -1.5, 2.25, P.g[1], .3); line(-1.5, 2.25, -15.9, 2.1, P.k2, .18);
  poly([[15.0, 5.0], [16.2, 4.25], [16.6, 4.55], [15.5, 5.4]], P.k); poly([[13.8, 5.85], [14.9, 5.1], [15.3, 5.5], [14.2, 6.15]], P.k); poly([[12.4, 5.05], [13.5, 5.05], [13.5, 5.65], [12.4, 5.65]], P.k);
  c.fillStyle = P.k2; c.fillRect(-11.2, 5.72, 21.8, .12); for (let x = -10.8; x < 10; x += 3.6) c.fillRect(x, 5.0, .07, .72);
  c.strokeStyle = P.k2; c.lineWidth = .1; c.beginPath(); c.arc(11.4, 3.5, .5, 0, 7); c.stroke();
  poly([[-17.2, .3], [-20.0, .25], [-20.0, .75], [-17.6, .95]], P.k);
  if (o.nome) { c.save(); c.scale(1, -1); c.font = `800 1.2px ${FONTE}`; c.fillStyle = P.k2; c.fillText('COLUMBIA', -9, -3.4); c.restore() }
  if (o.heat) { c.save(); c.globalAlpha = o.heat; poly([[-18.6, 1.0], [-17.2, .3], [12.6, .3], [15.8, .55], [17.6, 1.2], [18.45, 2.0], [18.5, 2.7], [17.4, 2.05], [12, 1.5], [-1.5, 2.2], [-18.6, 1.95]], '#d9662e'); poly([[-17.2, .3], [12.6, .3], [15.8, .55], [17.6, 1.2], [18.45, 2.0], [18.5, 2.7], [17.6, 1.6], [12, .9], [-17.2, .9]], '#f09a3e'); c.restore() }
}
// Planta do orbitador (vista de cima ou de baixo): nariz para +x, asa esquerda para +y
const PLAN = [[18.6, 0], [18.2, .75], [17.3, 1.45], [15.6, 2.1], [12.8, 2.55], [10, 2.7], [-1.5, 4.6], [-10.4, 11.55], [-11.3, 11.9], [-14.4, 11.9], [-15.9, 4.1], [-16.4, 2.7], [-18.0, 2.7], [-18.6, 2.2], [-18.6, 0]];
const PLAN_FULL = PLAN.concat(PLAN.slice(1, -1).reverse().map(([x, y]) => [x, -y]));
const LE = (u, s = 1) => [-1.5 + (-10.4 + 1.5) * u, s * (4.6 + (11.55 - 4.6) * u)]; // borda de ataque da asa, u de 0 (raiz) a 1 (ponta)
function orbPlan(o = {}) {
  const P = TILE[o.pal || 'dia'], w = P.w, baixo = o.view === 'baixo';
  for (const ey of [-1.3, 0, 1.3]) poly([[-18.6, ey - .45], [-18.6, ey + .45], [-21, ey + .7], [-21, ey - .7]], '#2a2c33');
  poly(PLAN_FULL, baixo ? P.k : bands(0, -12, 0, 12, [[.3, w[3]], [.5, w[2]], [.7, w[2]], [1, w[1]]]));
  for (const s of [1, -1]) {
    c.strokeStyle = baixo ? P.g[1] : P.g[0]; c.lineWidth = .45; c.beginPath(); c.moveTo(...LE(0, s)); c.lineTo(...LE(1, s)); c.stroke();
    c.strokeStyle = baixo ? '#3a3d44' : 'rgba(20,22,29,.25)'; c.lineWidth = .1; c.beginPath(); c.moveTo(-13.3, s * 4.2); c.lineTo(-13.6, s * 11.9); c.moveTo(-13.4, s * 8); c.lineTo(-15.2, s * 8); c.stroke();
    if (!baixo) { poly([[10, s * 2.7], [-1.5, s * 4.6], [.6, s * 3.5], [9, s * 2.55]], P.k); poly([[-11.6, s * 2.3], [-17.8, s * 2.35], [-17.8, s * 3.3], [-12.6, s * 3.2]], w[1]) }
  }
  if (baixo) { poly([[17.6, -1.4], [18.6, 0], [17.6, 1.4], [16.8, 0]], P.g[1]); c.strokeStyle = '#2e3138'; c.lineWidth = .12; c.strokeRect(-6, 3.0, 4.2, 1.6); c.strokeRect(-6, -4.6, 4.2, 1.6); c.strokeRect(12.5, -.6, 2.8, 1.2) }
  else {
    c.fillStyle = w[2]; c.fillRect(-11, -2.35, 20.5, 4.7); c.fillStyle = 'rgba(20,22,29,.2)'; c.fillRect(-11, -.05, 20.5, .1); for (let x = -11; x <= 9.5; x += 3.42) c.fillRect(x, -2.35, .07, 4.7);
    for (const s of [1, -1]) { poly([[13.6, s * .25], [14.7, s * .25], [14.4, s * 1.2], [13.4, s * 1.1]], P.k); poly([[14.9, s * .25], [15.6, s * .25], [15.3, s * .95], [14.6, s * 1.0]], P.k) }
    c.fillStyle = w[1]; c.fillRect(-18.4, -.35, 7.4, .7); if (o.silts !== false) { c.fillStyle = P.k; c.beginPath(); c.ellipse(-16.9, 0, 1.2, .38, 0, 0, 7); c.fill() }
  }
}
// Tanque externo + foguetes auxiliares + orbitador, de lado. Base (bocal do SRB) em y=0.
function srb(P) {
  const s = P.s;
  poly([[-1.0, 3.6], [1.0, 3.6], [1.8, 0], [-1.8, 0]], bands(-1.8, 0, 1.8, 0, [[.35, '#24262c'], [.7, '#4a4d55'], [1, '#2e3036']]));
  poly([[-1.85, 6.8], [1.85, 6.8], [2.55, 3.6], [-2.55, 3.6]], bands(-2.55, 0, 2.55, 0, [[.3, s[0]], [.55, s[3]], [.8, s[2]], [1, s[1]]]));
  c.fillStyle = bands(-1.85, 0, 1.85, 0, [[.25, s[0]], [.5, s[3]], [.78, s[2]], [1, s[1]]]); c.fillRect(-1.85, 6.8, 3.7, 34.2);
  c.fillStyle = 'rgba(20,22,29,.28)'; for (const y of [13.4, 20.2, 27, 33.8]) c.fillRect(-1.85, y, 3.7, .28);
  poly([[-1.85, 41], [1.85, 41], [1.5, 43], [-1.5, 43]], s[3]);
  c.fillStyle = bands(-1.5, 0, 1.5, 0, [[.3, s[0]], [.6, s[2]], [1, s[1]]]); c.beginPath(); c.moveTo(-1.5, 43); c.quadraticCurveTo(-1.3, 45.4, 0, 45.8); c.quadraticCurveTo(1.3, 45.4, 1.5, 43); c.fill();
}
function stack(o = {}) {
  const P = TILE[o.pal || 'dia'], et = o.etBranco ? P.s : P.o;
  c.fillStyle = bands(-4.2, 0, 4.2, 0, [[.2, et[0]], [.45, et[1]], [.72, et[2]], [1, et[3]]]);
  c.beginPath(); c.moveTo(-4.2, 4.5); c.lineTo(-4.2, 39); c.bezierCurveTo(-4.2, 45, -1.6, 50.3, 0, 51); c.bezierCurveTo(1.6, 50.3, 4.2, 45, 4.2, 39); c.lineTo(4.2, 4.5); c.quadraticCurveTo(0, 2.6, -4.2, 4.5); c.fill();
  c.fillStyle = 'rgba(20,22,29,.2)'; c.fillRect(-4.2, 31, 8.4, 5.4); c.fillStyle = 'rgba(20,22,29,.16)'; for (let x = -3.8; x < 4; x += .8) c.fillRect(x, 31, .12, 5.4);
  c.fillStyle = P.g[0]; c.beginPath(); c.arc(0, 50.6, .55, 0, 7); c.fill();
  if (o.ramp !== false) poly([[4.2, 36.6], [4.9, 37.4], [4.9, 38.2], [4.2, 38.6]], et[2]);
  c.fillStyle = P.k2; c.fillRect(4.2, 37.3, .9, .4);
  c.save(); c.translate(4.6, 24.6); c.rotate(PI / 2); c.scale(1, -1); orbSide({ pal: o.pal, lit: o.lit, silts: o.silts }); c.restore();
  srb(P);
}
const SSME = [[7.6, 3.2], [10.2, 3.2]];
function stackFlames(t, a = 1, big = 1) { at(0, 0, 0, () => plume(70 * big, 4.6, t, 1, { a })); SSME.forEach(([x, y], i) => at(x, y, 0, () => plume(16 * big, 1.9, t, 3 + i, { vac: 1, a }))) }
// plataforma de lançamento: torre, plataforma móvel (topo em y=0) e chão em y=-8
function pad(o = {}) {
  const pal = o.ground || 'dia';
  at(0, -8, 0, () => ground(pal));
  const tw = o.night ? ['#0d0e13', '#1d2028', '#2c3039'] : ['#191b21', '#2b2e36', '#454952'];
  c.fillStyle = bands(-26, 0, -15, 0, [[.4, tw[0]], [.8, tw[1]], [1, tw[2]]]); c.fillRect(-26, -8, 11, 84);
  c.strokeStyle = o.night ? 'rgba(240,210,150,.14)' : 'rgba(240,230,200,.2)'; c.lineWidth = .28;
  for (let y = -8; y < 76; y += 9) { c.beginPath(); c.moveTo(-26, y); c.lineTo(-15, y + 9); c.moveTo(-15, y); c.lineTo(-26, y + 9); c.moveTo(-26, y); c.lineTo(-15, y); c.stroke() }
  c.fillStyle = tw[0]; c.fillRect(-27, 76, 13, 3); c.fillRect(-21, 79, .9, 26); c.fillRect(-30, 72, 20, 1.6);
  c.fillStyle = tw[1]; c.fillRect(-15, 49, 9.5 * (o.arm ?? 1), 1.6);
  c.fillStyle = bands(0, 0, 0, -8, [[.2, '#5a5d63'], [1, '#2e3036']]); c.fillRect(-27, -8, 54, 8); c.fillStyle = '#16171c'; c.fillRect(-3, -8, 6, 4); c.fillRect(-12, -8, 3, 8); c.fillRect(9, -8, 3, 8);
  if (o.night) for (const [x, ang] of [[-60, .35], [55, -.38], [-110, .55], [100, -.6]]) { c.save(); c.translate(x, -7); c.rotate(ang); c.globalAlpha = .16; poly([[-.8, 0], [.8, 0], [10, 140], [-10, 140]], '#ffe7b0'); c.globalAlpha = 1; c.restore(); disc(x, -7, 1.6, '#fff1c8') }
}
function exhaustColumn(t, base, h, rgb = '244,232,204') { const q = rng(55); for (let i = 0; i < 40; i++) { const u = i / 40, y = base - u * h, r = 4 + u * 9 + q() * 3; disc(sin(t * .8 + i) * 1.2 + (q() - .5) * 3, y, r, `rgb(${shade(rgb, .82)})`) } for (let i = 0; i < 40; i++) { const u = i / 40, y = base - u * h, r = (4 + u * 9) * .8; disc(sin(t * .8 + i) * 1.2 - .5, y + .5, r, `rgb(${rgb})`) } }
// astronauta de costas, roupa laranja, capacete branco na mão
function astro(x, y, h, i, t) { const b = Math.abs(sin(t * 3.2 + i * 1.3)) * 4; person(x, y - b, h, { coat: '#d4692c', dark: '#a24a20', legs: '#b95826', hair: ['#2a2018', '#4a3020', '#1a1614', '#6a4a2a'][i % 4], skin: ['#c99a74', '#a8784f', '#e0b48e'][i % 3] }); const s = h / 100; disc(x + 22 * s, y - b - 44 * s, 11 * s, '#f2ecd6'); disc(x + 27 * s, y - b - 45 * s, 5 * s, '#2a2d35') }
// pessoa sentada de costas (sala de controle)
function seated(x, y, s, o = {}) {
  const { coat = '#3f4a5c', dark = '#2c3442', hair = '#2a2018', skin = '#c99a74' } = o;
  c.fillStyle = coat; c.beginPath(); c.roundRect(x - 36 * s, y - 32 * s, 72 * s, 70 * s, 24 * s); c.fill(); c.fillStyle = dark; c.beginPath(); c.roundRect(x + 2 * s, y - 32 * s, 34 * s, 70 * s, [0, 24 * s, 24 * s, 0]); c.fill();
  c.fillStyle = skin; c.fillRect(x - 6 * s, y - 42 * s, 12 * s, 12 * s); disc(x, y - 56 * s, 17 * s, hair);
  if (o.fone) { c.strokeStyle = '#14161d'; c.lineWidth = 3 * s; c.beginPath(); c.arc(x, y - 58 * s, 19 * s, PI * 1.05, PI * 1.95); c.stroke(); disc(x - 18 * s, y - 54 * s, 5 * s, '#14161d'); disc(x + 18 * s, y - 54 * s, 5 * s, '#14161d') }
}
function desk(y, h, monitors, t, seed) { c.fillStyle = '#2a2620'; c.fillRect(0, y, W, h); c.fillStyle = '#4a4134'; c.fillRect(0, y, W, 6); const q = rng(seed); monitors.forEach(x => { c.fillStyle = '#14161d'; c.fillRect(x - 46, y - 64, 92, 60); c.fillStyle = q() < .5 ? '#1f4a52' : '#3a3420'; c.fillRect(x - 40, y - 58, 80, 48); c.fillStyle = 'rgba(240,185,74,.5)'; for (let k = 0; k < 4; k++) c.fillRect(x - 34, y - 50 + k * 10, 20 + q() * 44, 3) }) }
function paperSheet(x, y, w, h, rot) { c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(-w / 2 + 14, -h / 2 + 18, w, h); c.fillStyle = bands(-w / 2, 0, w / 2, 0, [[.7, '#efe5c8'], [1, '#ddd1b0']]); c.fillRect(-w / 2, -h / 2, w, h); return () => c.restore() }
const NOMES = [['RICK', 'HUSBAND', 'COMANDANTE'], ['WILLIAM', 'MCCOOL', 'PILOTO'], ['MICHAEL', 'ANDERSON', ''], ['KALPANA', 'CHAWLA', ''], ['DAVID', 'BROWN', ''], ['LAUREL', 'CLARK', ''], ['ILAN', 'RAMON', '1º ASTRONAUTA DE ISRAEL']];
const T_NOME = [88.96, 90.32, 91.82, 93.28, 95.02, 96.3, 97.7];
const ESTRELA = i => [290 + i * 223, 430 - 70 * sin(PI * i / 6)];
function star4(x, y, r, col) { poly([[x, y - r], [x + r * .22, y - r * .22], [x + r, y], [x + r * .22, y + r * .22], [x, y + r], [x - r * .22, y + r * .22], [x - r, y], [x - r * .22, y - r * .22]], col) }
function nightSky(t) { c.fillStyle = lg(0, 0, 0, H, [[0, '#07080f'], [.7, '#121a2c'], [1, '#1f2b40']]); c.fillRect(0, 0, W, H); stars(.55, t) }

// ===================== CENAS =====================
// --- 1: Kennedy, 1º de fevereiro — famílias esperam na pista ---
shot(CUTS[0], CUTS[1], (tl, t) => {
  const z = 1 + .05 * ease(ramp(tl, 0, 7.4)); c.save(); c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2);
  const hy = 560; sky(SKY_DAY, hy); sunGlow(1540, 210, 420, '255,240,200', .8); cloudsBand(7, 6, 110, 420, 50, 90, '250,246,228', .5, t * 6);
  c.fillStyle = '#7f9a8c'; c.fillRect(0, hy - 20, W, 20); for (let i = 0; i < 40; i++) pill(i * 52 + 10, hy - 22, 70, 22, i % 2 ? '#5d7458' : '#6b8462');
  c.fillStyle = '#9d9249'; c.fillRect(0, hy, W, H - hy); c.fillStyle = '#b7aa5c'; c.fillRect(0, hy, W, 60);
  poly([[905, hy], [1015, hy], [1720, H], [200, H]], '#55585c'); poly([[905, hy], [930, hy], [520, H], [200, H]], '#4a4d52');
  for (let k = 0; k < 9; k++) { const u0 = (k / 9 + (t * .02) % (1 / 9)) ** 2, u1 = u0 + .03 * (1 + k * .4); c.fillStyle = '#efe5c2'; const y0 = lerp(hy, H, u0), y1 = lerp(hy, H, Math.min(1, u1)); poly([[960 - 2 - u0 * 12, y0], [960 + 2 + u0 * 12, y0], [960 + 2 + u1 * 12, y1], [960 - 2 - u1 * 12, y1]], '#efe5c2') }
  c.fillStyle = '#d9b35a'; poly([[300, 760], [480, 760], [480, 770], [300, 770]], '#d9b35a');
  c.restore();
  const G = [[1180, { coat: '#27304a', dark: '#1a2136' }, 250], [1270, { coat: '#9a4a34', dark: '#6c3024', hair: '#5a3a22' }, 230], [1345, { coat: '#d8d2bc', dark: '#a9a48e' }, 170], [1430, { coat: '#3f6a80', dark: '#2a4a5c' }, 260], [1520, { coat: '#6b7a4a', dark: '#4a5632', hair: '#3a2a1c' }, 240], [1590, { coat: '#8c4a3a', dark: '#5e2e26', hair: '#1c1a18' }, 150], [1680, { coat: '#d9b35a', dark: '#a8863a' }, 255]];
  G.forEach(([x, o, h], i) => person(x, 1080 + (i % 2) * 10, h, o)); grass(t, 9, 120, 900, CAPIM);
  typeText(tl, TX, TY, 'CENTRO ESPACIAL KENNEDY', .4, 7.1, { sub: '1º DE FEVEREIRO DE 2003 · FLÓRIDA' });
});
const CAPIM = ['#d9c98a', '#b9a557', '#8c8540', '#efe2a8'];
// --- 2: o relógio passa das 9h16 ---
shot(CUTS[1], CUTS[2], (tl, t) => {
  c.fillStyle = '#08080b'; c.fillRect(0, 0, W, H); const cx = 960, cy = 470, R = 330, rv = ramp(tl, 0, 1.2);
  add(() => glow(cx, cy, R * 2, '217,150,70', .16 * rv));
  c.save(); c.globalAlpha = rv; disc(cx, cy, R * 1.08, '#3a2c1c'); c.fillStyle = bands(cx - R * 1.06, 0, cx + R * 1.06, 0, [[.32, '#2a2016'], [.64, '#6b5230'], [1, '#2f2418']]); c.beginPath(); c.arc(cx, cy, R * 1.05, 0, 7); c.fill(); disc(cx, cy, R, '#141210'); disc(cx, cy, R * .94, '#191613');
  for (let i = 0; i < 60; i++) { const a = i / 60 * 2 * PI, l = i % 5 ? 14 : 34, wd = i % 5 ? 3 : 7; c.save(); c.translate(cx, cy); c.rotate(a); c.fillStyle = i % 5 ? '#8a7448' : '#d9b35a'; c.fillRect(-wd / 2, -R * .9, wd, l); c.restore() }
  const sec = 13 * 60 + 40 + tl * 52, mins = sec / 60, mark = (16 / 60) * 2 * PI - PI / 2, pm = .5 + .5 * sin(t * 6);
  const mk = ramp(tl, .9, 1.3) * (1 - ramp(tl, 4.2, 4.8)); c.save(); c.translate(cx, cy); c.rotate(mark); c.fillStyle = `rgba(240,185,74,${mk * (.6 + .4 * pm)})`; c.fillRect(R * .62, -12, R * .3, 24); c.restore();
  const hand = (ang, len, wd, col) => { c.save(); c.translate(cx, cy); c.rotate(ang); poly([[-len * .14, -wd / 2], [len, -wd * .2], [len, wd * .2], [-len * .14, wd / 2]], col); c.restore() };
  hand(((9 + mins / 60) / 12) * 2 * PI - PI / 2, R * .5, 22, '#e6d3a0'); hand((mins / 60) * 2 * PI - PI / 2, R * .78, 14, '#fff6e0'); hand(((sec % 60) / 60) * 2 * PI - PI / 2, R * .86, 4, OURO); disc(cx, cy, 16, '#d9b35a'); disc(cx, cy, 7, '#14161d');
  c.restore();
  label(cx + R * .98, cy - 150, '9H16', { size: 76, col: OURO, a: mk }); label(cx + R * .98, cy - 100, 'POUSO PREVISTO', { size: 36, a: mk, w: 600 });
});
// --- 3: CAPÍTULO 1 — 12 de abril de 1981, o primeiro voo (sépia) ---
shot(CUTS[2], CUTS[3], (tl, t) => {
  const lt = Math.max(0, tl - 1.7), h = 3.2 * lt * lt, cam = { x: 2, y: 30 + h * .5, z: 8.6 };
  CAM = cam; sky(SKY_GOLD, M(0, -8)[1]); sunGlow(1520, M(0, -8)[1] - 160, 520, '255,236,190'); cloudsBand(13, 7, 90, 440, 50, 100, '250,244,222', .5, t * 5);
  world(cam, () => { pad({ ground: 'ouro', arm: .5 }); if (lt > 0) { exhaustColumn(t, h - 2, h + 6); at(0, -8, 0, () => smokeRoll(lt + .4, 0, 40, 21, '214,196,160')) } at(0, h, 0, () => { if (lt > 0) stackFlames(t); stack({ pal: 'dia', etBranco: 1 }) }); if (lt > 0) at(0, -8, 0, () => smokeRoll(lt + .4, .3, 30, 33, '244,232,204')) });
  sepia(.85);
  typeText(tl, TX, TY, '12 DE ABRIL DE 1981', 1.8, 4.1, { sub: 'STS-1 · O PRIMEIRO VOO' });
  chapter(tl, 1, 'O COLUMBIA');
});
// --- 4: tamanho — vista de cima, com as medidas ---
shot(CUTS[3], CUTS[4], (tl, t) => {
  c.fillStyle = '#0b0c11'; c.fillRect(0, 0, W, H); add(() => glow(960, 520, 900, '217,150,70', .1));
  const u = ease(ramp(tl, 0, 4.9)), cam = { x: lerp(-2, -4, u), y: lerp(-7.5, -7, u), z: 22 }, rv = ramp(tl, 0, .8);
  c.save(); c.globalAlpha = rv; world(cam, () => { c.fillStyle = 'rgba(0,0,0,.4)'; c.save(); c.translate(.8, -1.2); poly(PLAN_FULL, 'rgba(0,0,0,.45)'); c.restore(); orbPlan({ pal: 'dia' }) }); c.restore();
  const g1 = eo(ramp(tl, .5, 1.6)), [x0, yl] = M(-18.6, -14.4), [x1] = M(18.6, -14.4), mx = (x0 + x1) / 2;
  dim(lerp(mx, x0, g1), yl, lerp(mx, x1, g1), yl, OURO, ramp(tl, .4, .6)); label(mx, yl + 92, `${Math.round(37 * g1)} m`, { size: 92, col: OURO, align: 'center', a: ramp(tl, .5, .8) }); label(mx, yl + 136, 'DE COMPRIMENTO', { size: 38, align: 'center', a: ramp(tl, 1.0, 1.3), w: 600 });
  const g2 = eo(ramp(tl, 2.8, 3.8)), [xs, ya] = M(23, 11.9), [, yb] = M(23, -11.9), my = (ya + yb) / 2;
  dim(xs, lerp(my, ya, g2), xs, lerp(my, yb, g2), CREME, ramp(tl, 2.7, 2.9)); label(xs + 34, my + 10, `${Math.round(24 * g2)} m`, { size: 92, a: ramp(tl, 2.8, 3.1) }); label(xs + 34, my + 56, 'DE ASA A ASA', { size: 38, a: ramp(tl, 3.2, 3.5), w: 600 });
  typeText(tl, TX, TY, 'ÔNIBUS ESPACIAL COLUMBIA', .3, 4.7, { sub: 'VISTO DE CIMA' });
});
// --- 5: a tripulação caminha para a nave, de madrugada ---
shot(CUTS[4], CUTS[5], (tl, t) => {
  const z = 1 + .06 * ease(ramp(tl, 0, 6.2)); c.save(); c.translate(W / 2, H * .6); c.scale(z, z); c.translate(-W / 2, -H * .6);
  const hy = 640; c.fillStyle = lg(0, 0, 0, hy, [[0, '#0b0e1c'], [.55, '#2a2c48'], [.85, '#8a5a5a'], [1, '#e0915a']]); c.fillRect(0, 0, W, hy); stars(.4, t);
  c.save(); c.translate(1310, hy); c.scale(2.2, -2.2); pad({ ground: 'por', night: 1 }); stack({ pal: 'alva', silts: 1 }); c.restore();
  c.fillStyle = '#1c1820'; c.fillRect(0, hy, W, H - hy); poly([[900, hy], [1010, hy], [1500, H], [420, H]], '#2a2630'); for (let k = 0; k < 8; k++) { const u = (k / 8) ** 2, u1 = u + .02 + k * .006; poly([[955 - 3 - u * 10, lerp(hy, H, u)], [955 + 3 + u * 10, lerp(hy, H, u)], [955 + 3 + u1 * 10, lerp(hy, H, u1)], [955 - 3 - u1 * 10, lerp(hy, H, u1)]], '#6a5a40') }
  c.restore();
  const walk = tl * 14; [[560, 1110, 340], [700, 1140, 360], [840, 1115, 345], [980, 1145, 365], [1120, 1112, 342], [1260, 1140, 360], [1400, 1118, 350]].forEach(([x, y, h], i) => astro(x, y - walk * .6, h - walk * 1.2, i, t));
  typeText(tl, TX, TY, 'STS-107 · 28ª MISSÃO', .3, 6.0, { sub: '7 ASTRONAUTAS · 16 DIAS DE CIÊNCIA' });
});
// --- 6: CAPÍTULO 2 — 16 de janeiro de 2003, decolagem ---
shot(CUTS[5], CUTS[6], (tl, t) => {
  const lt = Math.max(0, tl - 1.5), h = 3.4 * lt * lt, sh = lt > 0 ? .5 : 0, cam = { x: 4 + sin(t * 47) * sh, y: 32 + h * .55 + sin(t * 61) * sh, z: 7.6 };
  CAM = cam; sky(SKY_DAY, M(0, -8)[1]); sunGlow(1560, M(0, -8)[1] - 200, 480, '255,240,200', .8); cloudsBand(22, 7, 90, 470, 50, 100, '250,246,228', .5, t * 6);
  world(cam, () => { pad({ ground: 'dia', arm: .5 }); if (lt > 0) { exhaustColumn(t, h - 2, h + 6); at(0, -8, 0, () => smokeRoll(lt + .4, 0, 50, 21, '214,196,160')) } at(0, h, 0, () => { if (lt > 0) stackFlames(t); stack({ pal: 'dia' }) }); if (lt > 0) { at(0, -8, 0, () => smokeRoll(lt + .4, .3, 36, 33, '244,232,204')); add(() => glow(0, -6, 60, '255,170,90', .35)) } });
  typeText(tl, TX, TY, '16 DE JANEIRO DE 2003', 1.7, 4.4, { sub: 'DECOLAGEM · 10H39' });
  chapter(tl, 2, '81 SEGUNDOS');
});
// --- 7: a 20 km de altura, T+81,7 s — a espuma se solta ---
shot(CUTS[6], CUTS[7], (tl, t) => {
  c.fillStyle = lg(0, 0, 0, H, [[0, '#121a32'], [.6, '#2c4a6c'], [1, '#6f8fa0']]); c.fillRect(0, 0, W, H); stars(.15, t);
  cloudsBand(37, 9, 860, 1080, 60, 120, '230,226,206', .6, -t * 40);
  const sx = 900 + tl * 22, sy = 640 - tl * 30, S = 9.2, rel = 1.4;
  c.save(); c.translate(sx, sy); c.scale(S, -S); c.rotate(-.48);
  stackFlames(t, 1, 1.4); stack({ pal: 'dia' });
  if (tl > rel) { const a = tl - rel; for (let k = 0; k < 7; k++) puff(5 + a * (1 + k * .4), 37.6 - a * 14 - k * .6, .5 + a * 1.4, '242,232,206', clamp(.9 - a * .45)); poly([[5.2 + a * 1.2, 37.4 - a * 22], [6.0 + a * 1.2, 37.8 - a * 22], [6.2 + a * 1.2, 36.9 - a * 22], [5.4 + a * 1.2, 36.6 - a * 22]], '#e8b878') }
  c.restore();
  const s = 78.2 + Math.min(tl, rel) * (3.5 / rel), cor = tl > rel ? OURO : CREME;
  label(TX, 250, `T + ${s.toFixed(1).replace('.', ',')} s`, { size: 110, col: cor }); label(TX, 300, '20 km DE ALTURA · 2,5 VEZES A VELOCIDADE DO SOM', { size: 36, col: PALHA, w: 600, a: ramp(tl, .2, .5) });
  if (tl > rel) { const [px, py] = [sx + 30, sy - 300]; label(px + 150, py - 40, 'ESPUMA SE SOLTA', { size: 46, col: OURO, a: ramp(tl, rel + .1, rel + .4) }) }
});
// --- 8: em câmera lenta — a espuma bate na borda da asa esquerda ---
const LEP = u => [200 + u * 1800, 880 - u * 430];   // borda de ataque na tela
shot(CUTS[7], CUTS[8], (tl, t) => {
  c.fillStyle = lg(0, 0, 0, H, [[0, '#18223a'], [1, '#3a5670']]); c.fillRect(0, 0, W, H);
  const zz = 1 + .06 * ease(ramp(tl, 3.1, 9)); c.save(); c.translate(1064, 640); c.scale(zz, zz); c.translate(-1064, -640);
  c.fillStyle = bands(-60, 0, 520, 0, [[.25, '#74391a'], [.55, '#b05c2b'], [.8, '#d6813f'], [1, '#9e5229']]); c.beginPath(); c.moveTo(-60, -20); c.lineTo(420, -20); c.quadraticCurveTo(560, 300, 470, 640); c.lineTo(-60, 640); c.fill();
  c.fillStyle = 'rgba(20,22,29,.18)'; for (let y = 40; y < 640; y += 70) c.fillRect(-60, y, 520, 4);
  // superfície de cima (placas brancas) e de baixo (preta)
  const [ax, ay] = LEP(0), [bx, by] = LEP(1), nx = .23, ny = .97;
  poly([[ax, ay], [bx, by], [W + 50, -60], [600, -60]], bands(0, -60, 0, by, [[.5, '#d6d0bd'], [1, '#f4efdc']]));
  c.strokeStyle = 'rgba(20,22,29,.12)'; c.lineWidth = 2; for (let k = 1; k < 14; k++) { const [px, py] = LEP(k / 14); c.beginPath(); c.moveTo(px, py - 40); c.lineTo(px + 260, py - 700); c.stroke() }
  poly([[ax, ay + 60], [bx, by + 60], [W + 50, H + 60], [ax, H + 60]], '#121318');
  for (let i = 3; i <= 13; i++) { const u0 = (i - 3) / 11, u1 = (i - 2) / 11, [x0, y0] = LEP(u0 + .004), [x1, y1] = LEP(u1 - .004), sel = i === 8;
    poly([[x0, y0 - 18], [x1, y1 - 18], [x1, y1 + 62], [x0, y0 + 62]], sel && tl > 3.1 ? '#4a4c52' : (i % 2 ? '#62656c' : '#6e7178')); poly([[x0, y0 + 20], [x1, y1 + 20], [x1, y1 + 62], [x0, y0 + 62]], '#3e4148');
    const [mx, my] = LEP((u0 + u1) / 2); c.save(); c.translate(mx, my + 14); c.rotate(-.23); c.font = `800 26px ${FONTE}`; c.textAlign = 'center'; c.fillStyle = sel ? OURO : '#c8c4b4'; c.fillText(String(i), 0, 8); c.restore() }
  // pedaço de espuma em câmera lenta
  const hit = 3.1, [hx, hy] = LEP(5.5 / 11);
  if (tl < hit) { const u = ease(ramp(tl, 0, hit)), x = lerp(380, hx, u), y = lerp(40, hy - 10, u * u * .3 + u * .7), r = tl * 2.2; c.save(); c.translate(x, y); c.rotate(r); poly([[-48, -26], [30, -36], [52, 4], [20, 34], [-40, 26]], '#e8b878'); poly([[20, 34], [52, 4], [40, 22]], '#b8844a'); poly([[-48, -26], [-40, 26], [-30, 0]], '#c9965a'); c.restore() }
  else { const a = tl - hit, q = rng(4); add(() => glow(hx, hy, 260 * (1 - ramp(a, 0, .6)), '255,230,170', .9 * (1 - ramp(a, 0, .6)))); for (let i = 0; i < 46; i++) { const ang = -PI * .9 + q() * PI * .9, v = 120 + q() * 520; disc(hx + cos(ang) * v * a, hy + sin(ang) * v * a + 160 * a * a, (3 + q() * 9) * (1 - ramp(a, .2, 2.4)), q() < .5 ? '#e8b878' : '#c9c4b4') }
    c.save(); c.translate(hx - 4, hy + 18); c.rotate(-.23); c.fillStyle = '#060608'; c.beginPath(); c.ellipse(0, 0, 34, 26, 0, 0, 7); c.fill(); c.strokeStyle = '#2a2a2e'; c.lineWidth = 3; c.beginPath(); c.moveTo(30, -6); c.lineTo(62, -20); c.moveTo(-30, 10); c.lineTo(-58, 26); c.moveTo(4, 24); c.lineTo(10, 54); c.stroke(); c.restore();
    const ra = ramp(tl, 8.2, 8.6); if (ra > 0) { c.strokeStyle = `rgba(240,185,74,${ra})`; c.lineWidth = 6; c.beginPath(); c.arc(hx - 4, hy + 18, 70 + 8 * sin(t * 5), 0, 7); c.stroke() } }
  c.restore();
  const TINTA = '#2a2620', DOUR = '#9a6a1a', o1 = 1 - ramp(tl, 4.6, 4.9), o2 = ramp(tl, 4.9, 5.2) * (1 - ramp(tl, 8.0, 8.3)), o3 = ramp(tl, 8.3, 8.6);
  label(1100, 210, 'PEDAÇO DE ESPUMA', { size: 44, col: DOUR, a: ramp(tl, .2, .5) * o1, w: 600, sh: 0 }); label(1100, 330, '760 g', { size: 140, col: TINTA, a: ramp(tl, .3, .6) * o1, sh: 0 });
  label(1100, 210, 'VELOCIDADE DA BATIDA', { size: 44, col: DOUR, a: o2, w: 600, sh: 0 }); label(1100, 330, '≈ 880 km/h', { size: 140, col: TINTA, a: o2, sh: 0 });
  label(1100, 210, 'BORDA DA ASA ESQUERDA', { size: 44, col: DOUR, a: o3, w: 600, sh: 0 }); label(1100, 330, 'FURO NO PAINEL 8', { size: 100, col: TINTA, a: o3, sh: 0 });
  typeText(tl, TX, TY, 'CÂMERA LENTA', .2, 3.0, { size: 56, sub: 'O QUE OS VÍDEOS MOSTRARAM DEPOIS' });
});
// --- 9: a subida continua, como se nada fosse ---
shot(CUTS[8], CUTS[9], (tl, t) => {
  c.fillStyle = lg(0, 0, 0, H, [[0, '#0a0e1e'], [.6, '#1f3452'], [1, '#4f6f86']]); c.fillRect(0, 0, W, H); stars(.4, t);
  const sx = 1100 + tl * 60, sy = 420 - tl * 40; c.save(); c.translate(sx, sy); c.scale(3.2, -3.2); c.rotate(-.9); stackFlames(t, 1, 2.4); stack({ pal: 'dia' }); c.restore();
  c.save(); c.globalAlpha = .7; c.strokeStyle = '#e6d8b8'; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(sx - 120, sy + 90); c.quadraticCurveTo(700, 820, 300, 1180); c.stroke(); c.restore();
});
// --- 10: CAPÍTULO 3 — 16 dias em órbita ---
shot(CUTS[9], CUTS[10], (tl, t) => {
  c.fillStyle = '#07080f'; c.fillRect(0, 0, W, H); stars(1, t); sunGlow(1700, 150, 300, '255,236,190', .9);
  earthLimb(760, 3200, t * 6, { seed: 15 });
  c.save(); c.translate(980 + tl * 12, 470); c.scale(19, -19); c.rotate(.04); orbSide({ pal: 'esp', bay: 1 }); c.restore();
  const d = 1 + Math.floor(ramp(tl, 1.6, 2.9) * 15.99);
  label(TX, 300, 'DIA', { size: 56, col: OURO, a: ramp(tl, 1.5, 1.8), w: 600 }); label(TX, 520, String(Math.min(16, d)).padStart(2, '0'), { size: 260, a: ramp(tl, 1.5, 1.8) }); label(TX + 260, 520, '/16', { size: 100, col: PALHA, a: ramp(tl, 1.5, 1.8), w: 600 });
  chapter(tl, 3, '16 DIAS');
});
// --- 11: em terra, engenheiros reveem a batida ---
shot(CUTS[10], CUTS[11], (tl, t) => {
  c.fillStyle = '#232838'; c.fillRect(0, 0, W, H); c.fillStyle = '#1b1f2c'; c.fillRect(0, 0, W, 90);
  c.fillStyle = '#14161d'; c.fillRect(520, 110, 880, 500); c.fillStyle = lg(0, 130, 0, 590, [[0, '#2c4a6c'], [1, '#6f8fa0']]); c.fillRect(540, 130, 840, 460);
  const fr = (tl * 1.2) % 2.2, s2 = 4.6; c.save(); c.translate(900 + fr * 30, 420 - fr * 20); c.scale(s2, -s2); c.rotate(-.5); stackFlames(t, 1, 1.2); stack({ pal: 'dia' }); c.restore();
  if (fr > 1.1) { puff(930 + fr * 30, 300, 10 + (fr - 1.1) * 30, '242,232,206', .9); }
  c.strokeStyle = OURO; c.lineWidth = 4; c.strokeRect(860 + fr * 30, 250, 120, 110);
  label(560, 170, 'VÍDEO DO LANÇAMENTO · T+81 s', { size: 30, col: OURO, w: 600 });
  desk(820, 260, [260, 560, 1360, 1660], t, 3);
  [[400, 960, { coat: '#3f4a5c', dark: '#2c3442' }], [760, 975, { coat: '#d8d2bc', dark: '#a9a48e', hair: '#5a3a22' }], [1160, 965, { coat: '#6b7a4a', dark: '#4a5632', hair: '#1c1a18', skin: '#a8784f' }], [1520, 970, { coat: '#9a4a34', dark: '#6c3024', hair: '#3a2a1c' }]].forEach(([x, y, o]) => seated(x, y, 2.2, o));
  const p = ramp(tl, 2.8, 3.3); if (p > 0) { const done = paperSheet(1560, 740 + (1 - eo(p)) * 300, 300, 200, -.08); txt('PEDIDO: FOTOS DA ASA', -130, -50, 32, '#2a2620', { w: 800 }); c.fillStyle = 'rgba(42,38,32,.35)'; for (let k = 0; k < 4; k++) c.fillRect(-130, -20 + k * 26, 200 + (k % 2) * 50, 8); done() }
  typeText(tl, TX, 64 + 40, 'EM TERRA · HOUSTON', .3, 4.4, { size: 48 });
});
// --- 12: o pedido é cancelado ---
shot(CUTS[11], CUTS[12], (tl, t) => {
  c.fillStyle = '#0b0b0e'; c.fillRect(0, 0, W, H); add(() => glow(620, 540, 700, '217,150,70', .12 * ramp(tl, 0, .5)));
  const done = paperSheet(620, 540, 620, 780, -.04);
  txt('PEDIDO DE IMAGENS', -260, -300, 54, '#2a2620'); txt('ASA ESQUERDA · NAVE EM ÓRBITA', -260, -250, 30, '#6a5a40', { w: 600 });
  c.fillStyle = 'rgba(42,38,32,.3)'; for (let k = 0; k < 13; k++) c.fillRect(-260, -190 + k * 34, 380 + ((k * 37) % 140), 9);
  const st = tl - .7; if (st > 0) { const sc = 1 + 1.2 * (1 - eo(ramp(st, 0, .18))); c.save(); c.translate(20, 40); c.rotate(-.22); c.scale(sc, sc); c.globalAlpha = .9 * ramp(st, 0, .1); c.strokeStyle = FERRUGEM; c.lineWidth = 9; c.strokeRect(-230, -70, 460, 140); c.font = `800 104px ${FONTE}`; c.textAlign = 'center'; c.fillStyle = FERRUGEM; c.fillText('CANCELADO', 0, 36); c.restore() }
  done();
  label(1060, 360, 'CONCLUSÃO', { size: 46, col: OURO, a: ramp(tl, 1.6, 1.9), w: 600 }); label(1060, 470, 'A ESPUMA', { size: 110, a: ramp(tl, 1.8, 2.1) }); label(1060, 580, 'NÃO OFERECE', { size: 110, a: ramp(tl, 2.9, 3.2) }); label(1060, 690, 'PERIGO', { size: 110, col: OURO, a: ramp(tl, 3.1, 3.4) });
});
// --- 13: CAPÍTULO 4 — a volta: reentrada ---
shot(CUTS[12], CUTS[13], (tl, t) => {
  c.fillStyle = lg(0, 0, 0, H, [[0, '#07080f'], [.6, '#111b2e'], [1, '#1f3852']]); c.fillRect(0, 0, W, H); stars(.6, t);
  earthLimb(860 - tl * 12, 3600, t * 14, { seed: 23 });
  const S = 21, sx = 920 + sin(t * 31) * 2, sy = 450 + sin(t * 37) * 2, q = rng(3), ht = .6 + .4 * ramp(tl, 0, 4);
  c.save(); c.translate(sx, sy); c.scale(S, -S); c.rotate(.62);
  add(() => glow(0, -2, 26, '232,116,58', .3 * ht));
  for (let k = 0; k < 30; k++) { const x = -18 + q() * 36, ph = (q() + t * (1.1 + q())) % 1, L = 8 + q() * 18, x0 = x - ph * 22, y0 = -1.5 - ph * 6; c.globalAlpha = .8 * (1 - ph) * ht; poly([[x0, y0], [x0, y0 - .5], [x0 - L, y0 - L * .35]], k % 3 ? '#e8743a' : '#f6c25a'); c.globalAlpha = 1 }
  const layer = (d, col, ph) => { c.fillStyle = col; c.beginPath(); c.moveTo(-18, .4); for (let x = -18; x <= 19.5; x += 1.2) c.lineTo(x, .3 - d * (1 + .15 * sin(x * .8 - t * 20 + ph)) * Math.min(1, (x + 20) / 8, (20.5 - x) / 3)); c.lineTo(19.5, 2.4); c.closePath(); c.fill() };
  c.globalAlpha = ht; layer(2.6, '#d9662e', 0); layer(1.8, '#f09a3e', 1); layer(1.0, '#f8cf6a', 2); layer(.4, '#fff6dc', 3); c.globalAlpha = 1;
  orbSide({ pal: 'esp', heat: .75 * ht, silts: 1 });
  c.restore();
  label(1250, 760, '+ 1.500 °C', { size: 110, col: OURO, a: ramp(tl, 3.5, 3.8) }); label(1250, 810, 'NA BORDA DAS ASAS', { size: 40, a: ramp(tl, 3.7, 4.0), w: 600 });
  typeText(tl, TX, TY, '1º DE FEVEREIRO · 8H44', 1.7, 5.1, { sub: 'REENTRADA NA ATMOSFERA' });
  chapter(tl, 4, 'A VOLTA');
});
// --- 14: por dentro da asa esquerda: o ar em brasa e os sensores ---
const SENS = [[-3.2, 6.6], [-5.2, 8.0], [-7.6, 9.6], [-4.4, 5.6], [-8.6, 7.4], [-11.2, 8.6], [-6.4, 5.0], [-10.4, 6.2], [-12.6, 10.6], [-2.6, 5.2], [-13.4, 6.8], [-9.6, 10.9]];
shot(CUTS[13], CUTS[14], (tl, t) => {
  c.fillStyle = '#0a0c12'; c.fillRect(0, 0, W, H); c.strokeStyle = 'rgba(217,179,90,.06)'; c.lineWidth = 1; for (let x = 0; x < W; x += 60) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke() } for (let y = 0; y < H; y += 60) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke() }
  const cam = { x: -2.4, y: -8.2, z: 54 };
  world(cam, () => { c.save(); c.rotate(PI / 2);
    poly(PLAN_FULL, 'rgba(230,214,170,.08)'); c.strokeStyle = 'rgba(230,214,170,.55)'; c.lineWidth = .1; c.beginPath(); PLAN_FULL.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.stroke();
    c.strokeStyle = 'rgba(230,214,170,.3)'; c.lineWidth = .07; c.beginPath(); c.moveTo(-1.1, 5.4); c.lineTo(-9.6, 12.0 - .4); for (let k = 0; k < 7; k++) { const x = -2 - k * 1.85; c.moveTo(x, 4.4 + k * .1); c.lineTo(x - 1.4, 11.5) } c.moveTo(-13.3, 4.2); c.lineTo(-13.6, 11.9); c.stroke();
    c.strokeStyle = 'rgba(230,214,170,.45)'; c.setLineDash([.3, .2]); c.strokeRect(-6, 4.8, 4.2, 2.2); c.setLineDash([]);
    for (let i = 1; i <= 22; i++) { const [x0, y0] = LE((i - 1) / 22), [x1, y1] = LE(i / 22); c.strokeStyle = i === 8 ? OURO : '#8a8d94'; c.lineWidth = i === 8 ? .5 : .35; c.beginPath(); c.moveTo(x0 + .05, y0); c.lineTo(x1 - .05, y1); c.stroke() }
    const [px, py] = LE(7.5 / 22), g = ramp(tl, .8, 3.6);
    if (g > 0) { const q = rng(8); for (const [col, k] of [['#d9662e', 1], ['#f09a3e', .7], ['#f8cf6a', .42]]) { c.fillStyle = col; c.beginPath(); c.moveTo(px, py); for (let a = 0; a <= 12; a++) { const ang = PI * .62 + a / 12 * PI * .9, rr = g * k * (3.2 + 2.4 * sin(a * 1.7 + t * 4) * .3) * (a > 4 && a < 9 ? 1.8 : 1); c.lineTo(px + cos(ang) * rr * 1.2, py + sin(ang) * rr * .8) } c.closePath(); c.fill() } add(() => glow(px, py, 6 * g + 1, '255,170,90', .35)) }
    disc(px, py, .35 + .1 * sin(t * 8), '#fff6dc');
    SENS.forEach(([x, y], i) => { const off = ramp(tl, 4.05 + i * .13, 4.15 + i * .13); disc(x, y, .32, off > 0 ? '#3a3c44' : OURO); if (off <= 0) add(() => glow(x, y, .9, '240,185,74', .5)); else { c.strokeStyle = '#8a8d94'; c.lineWidth = .08; c.beginPath(); c.moveTo(x - .25, y - .25); c.lineTo(x + .25, y + .25); c.moveTo(x + .25, y - .25); c.lineTo(x - .25, y + .25); c.stroke() } });
    c.restore() });
  const on = SENS.filter((_, i) => tl < 4.1 + i * .13).length;
  label(1340, 300, 'ASA ESQUERDA', { size: 52, col: OURO, w: 600 }); label(1340, 360, 'VISTA POR DENTRO', { size: 38, w: 600 });
  label(1340, 560, 'AR A MAIS DE 1.500 °C', { size: 52, col: '#f09a3e', a: ramp(tl, 1.0, 1.3) }); label(1340, 610, 'ENTRA PELO FURO DO PAINEL 8', { size: 36, a: ramp(tl, 1.2, 1.5), w: 600 });
  label(1340, 770, `SENSORES: ${String(on).padStart(2, '0')}/${SENS.length}`, { size: 64, col: on ? CREME : '#8a8d94', a: ramp(tl, 3.9, 4.1) });
});
// --- 15: controle da missão, 8h59 ---
shot(CUTS[14], CUTS[15], (tl, t) => {
  c.fillStyle = '#1e2230'; c.fillRect(0, 0, W, H); c.fillStyle = '#171a25'; c.fillRect(0, 0, W, 120);
  const scr = (x, y, w, h) => { c.fillStyle = '#3a3f50'; c.fillRect(x - 8, y - 8, w + 16, h + 16); c.fillStyle = '#0e1a22'; c.fillRect(x, y, w, h) };
  scr(110, 200, 440, 300); scr(600, 160, 720, 400); scr(1370, 200, 440, 300);
  c.fillStyle = 'rgba(240,185,74,.45)'; for (let k = 0; k < 10; k++) { c.fillRect(140, 230 + k * 26, 120 + (k * 53 % 200), 8); c.fillRect(1400, 230 + k * 26, 90 + (k * 71 % 230), 8) }
  // mapa
  c.save(); c.beginPath(); c.rect(600, 160, 720, 400); c.clip(); c.fillStyle = '#163038'; c.fillRect(600, 160, 720, 400);
  poly([[600, 160], [1320, 160], [1320, 330], [1250, 330], [1235, 420], [1215, 455], [1190, 395], [1120, 365], [1040, 372], [990, 400], [950, 470], [905, 420], [860, 360], [800, 335], [720, 300], [640, 260], [600, 250]], '#3a4a3a');
  c.strokeStyle = 'rgba(240,226,180,.25)'; c.lineWidth = 2; c.setLineDash([6, 6]); c.beginPath(); c.moveTo(900, 160); c.lineTo(900, 400); c.moveTo(1040, 160); c.lineTo(1050, 372); c.stroke(); c.setLineDash([]);
  const trk = u => [620 + u * 680, 230 + u * 150 - sin(u * PI) * 40], stopU = .52, u = Math.min(stopU, .3 + (t - 70.8) / 4.8 * .22);
  c.strokeStyle = 'rgba(240,185,74,.35)'; c.lineWidth = 3; c.setLineDash([10, 8]); c.beginPath(); for (let k = 0; k <= 30; k++) { const [x, y] = trk(stopU + k / 30 * (1 - stopU)); k ? c.lineTo(x, y) : c.moveTo(x, y) } c.stroke(); c.setLineDash([]);
  c.strokeStyle = OURO; c.lineWidth = 5; c.beginPath(); for (let k = 0; k <= 40; k++) { const [x, y] = trk(k / 40 * u); k ? c.lineTo(x, y) : c.moveTo(x, y) } c.stroke();
  const [dx, dy] = trk(u), lost = t > 75.6; if (!lost) { add(() => glow(dx, dy, 30, '255,210,120', .8)); disc(dx, dy, 9, '#fff6dc') } else { c.strokeStyle = (t * 2) % 1 < .6 ? FERRUGEM : '#5a2a20'; c.lineWidth = 6; c.beginPath(); c.moveTo(dx - 16, dy - 16); c.lineTo(dx + 16, dy + 16); c.moveTo(dx + 16, dy - 16); c.lineTo(dx - 16, dy + 16); c.stroke() }
  txt('CALIFÓRNIA', 640, 300, 24, PALHA, { w: 600 }); txt('TEXAS', 930, 380, 28, PALHA, { w: 600 }); txt('FLÓRIDA', 1200, 470, 24, PALHA, { w: 600 });
  const tt = 'COLUMBIA: “ROGER, UH, BU…”', n = clamp(Math.floor((t - 74.0) * 22), 0, tt.length); if (t > 74) { c.fillStyle = 'rgba(8,9,13,.75)'; c.fillRect(620, 480, 680, 64); txt(tt.slice(0, n), 640, 526, 40, CREME) }
  if (lost && (t * 2) % 1 < .6) txt('SEM SINAL', 1120, 230, 52, FERRUGEM, { align: 'center' });
  c.restore();
  const secs = 32 + (t - 74.06), mm = 59 + Math.floor(secs / 60), ss = Math.floor(((secs % 60) + 60) % 60); c.fillStyle = '#08090c'; c.fillRect(820, 30, 280, 86); txt(`08:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`, 960, 98, 72, OURO, { align: 'center' });
  desk(700, 40, [200, 480, 1440, 1720], t, 5); [[340, 760], [620, 770], [1300, 765], [1580, 760]].forEach(([x, y], i) => seated(x, y, 1.1, { fone: 1, coat: ['#3f4a5c', '#6b7a4a', '#d8d2bc', '#9a4a34'][i], dark: ['#2c3442', '#4a5632', '#a9a48e', '#6c3024'][i] }));
  desk(870, 210, [120, 420, 760, 1160, 1500, 1800], t, 7); [[280, 1010], [600, 1030], [960, 1015], [1330, 1025], [1660, 1010]].forEach(([x, y], i) => seated(x, y, 2.0, { fone: 1, coat: ['#d8d2bc', '#27304a', '#6b4a3a', '#3f6a80', '#5a5a52'][i], dark: ['#a9a48e', '#1a2136', '#4a3428', '#2a4a5c', '#3a3a34'][i], hair: ['#2a2018', '#5a3a22', '#1c1a18', '#8a7a6a', '#3a2a1c'][i] }));
  typeText(tl, TX, 230, 'CONTROLE DA MISSÃO', .2, 2.8, { size: 54, sub: 'HOUSTON · HORÁRIO DA FLÓRIDA' });
});
// --- 16: sobre o Texas — a nave se desfaz ---
shot(CUTS[15], CUTS[16], (tl, t) => {
  const hy = 860; c.fillStyle = lg(0, 0, 0, hy, [[0, '#4d7380'], [.55, '#97b0a8'], [1, '#e6dcb4']]); c.fillRect(0, 0, W, hy); sunGlow(260, 620, 380, '255,240,200', .7);
  cloudsBand(61, 5, 600, 820, 40, 80, '250,246,228', .45, t * 3);
  c.fillStyle = '#5a6a44'; c.fillRect(0, hy, W, H - hy); for (let i = 0; i < 46; i++) pill(i * 44 + 8, hy - 10, 58 + (i % 3) * 20, 26 + (i % 4) * 6, i % 2 ? '#3f4e34' : '#4a5a3a');
  c.fillStyle = '#3a4430'; c.fillRect(1500, hy - 120, 8, 120); disc(1504, hy - 132, 26, '#3a4430');
  const sp = 240, x0 = -200 + tl * sp, y0 = 260 + tl * 14, br = 5.6;
  const trail = (hx, hy2, sx, sy, w, a) => { c.save(); c.globalAlpha = a; c.strokeStyle = lg(hx, hy2, sx, sy, [[0, 'rgba(255,248,228,.95)'], [1, 'rgba(255,248,228,0)']]); c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(sx, sy); c.lineTo(hx, hy2); c.stroke(); c.restore() };
  if (tl < br) { trail(x0, y0, x0 - 1400, y0 - 90, 9, 1); add(() => glow(x0, y0, 44, '255,220,150', .9)); disc(x0, y0, 9, '#fffaf0') }
  else { const a = tl - br, bx = -200 + br * sp, by = 260 + br * 14; trail(bx, by, bx - 1400, by - 90, 9 + a * 6, 1); const q = rng(19); for (let k = 0; k < 9; k++) { const ang = (q() - .5) * .5 + .05, v = sp * (.7 + q() * .4), hx = bx + cos(ang) * v * a, hy2 = by + sin(ang) * v * a + 18 * a * a * q(); trail(hx, hy2, bx, by, 4 + q() * 4, .9); add(() => glow(hx, hy2, 16, '255,220,150', .7)); disc(hx, hy2, 3 + q() * 4, '#fffaf0') } add(() => glow(bx, by, 120 * (1 - ramp(a, 0, 1.2)), '255,236,200', .7 * (1 - ramp(a, 0, 1.2)))) }
  typeText(tl, TX, TY, 'SOBRE O TEXAS · 9H00', .3, 6.9, { sub: '60 km DE ALTURA · 18 VEZES A VELOCIDADE DO SOM' });
});
// --- 17: em silêncio, gente olhando o céu ---
shot(CUTS[16], CUTS[17], (tl, t) => {
  const dk = ramp(tl, 1.6, 3.6), hy = 700; c.fillStyle = lg(0, 0, 0, hy, [[0, '#4d7380'], [.55, '#97b0a8'], [1, '#e6dcb4']]); c.fillRect(0, 0, W, hy);
  const q = rng(19); for (let k = 0; k < 9; k++) { const sx = 300 + k * 40, sy = 120, ex = sx + 900 + q() * 500, ey = sy + 40 + q() * 300; c.save(); c.globalAlpha = .6 - k * .03; c.strokeStyle = lg(ex, ey, sx, sy, [[0, 'rgba(255,248,228,.95)'], [1, 'rgba(255,248,228,.15)']]); c.lineWidth = 7 + tl * 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex, ey); c.stroke(); c.restore() }
  c.fillStyle = '#5a6a44'; c.fillRect(0, hy, W, H - hy); for (let i = 0; i < 46; i++) pill(i * 44 + 8, hy - 10, 58 + (i % 3) * 20, 26 + (i % 4) * 6, i % 2 ? '#3f4e34' : '#4a5a3a');
  [[620, { coat: '#6b4a3a', dark: '#4a3428' }, 300], [760, { coat: '#3f6a80', dark: '#2a4a5c' }, 280], [1180, { coat: '#d8d2bc', dark: '#a9a48e', hair: '#8a7a6a' }, 300], [1290, { coat: '#9a4a34', dark: '#6c3024' }, 200]].forEach(([x, o, h], i) => person(x, 1085, h, o));
  grass(t, 41, 120, 920, CAPIM);
  c.fillStyle = `rgba(7,8,15,${dk * .92})`; c.fillRect(0, 0, W, H);
});
// --- 18: a tripulação ---
shot(CUTS[17], CUTS[18], (tl, t) => {
  nightSky(t); add(() => glow(960, 520, 900, '217,150,70', .07));
  label(W / 2, 200, 'A TRIPULAÇÃO DO COLUMBIA', { size: 64, align: 'center', a: ramp(tl, .1, .5) }); c.fillStyle = '#d9b35a'; c.fillRect(W / 2 - 220 * ramp(tl, .3, .9), 228, 440 * ramp(tl, .3, .9), 3);
  NOMES.forEach(([n1, n2, n3], i) => { const a = ramp(t, T_NOME[i] - .1, T_NOME[i] + .3), [x, y] = ESTRELA(i); if (a <= 0) return; add(() => glow(x, y, 70, '240,185,74', .45 * a)); star4(x, y, 26 + 4 * sin(t * 2 + i), `rgba(255,236,190,${a})`);
    label(x, y + 110, n1, { size: 38, align: 'center', a, w: 600, col: PALHA }); label(x, y + 166, n2, { size: 56, align: 'center', a }); if (n3) label(x, y + 210, n3, { size: 26, align: 'center', a: i === 6 ? ramp(t, 98.8, 99.2) : a, col: OURO, w: 600 }) });
});
// --- 19: 84.000 pedaços, montados no chão de um hangar ---
const PECAS = (() => { const q = rng(84), a = [], inside = (x, y) => { let r = false; for (let i = 0, j = PLAN_FULL.length - 1; i < PLAN_FULL.length; j = i++) { const [xi, yi] = PLAN_FULL[i], [xj, yj] = PLAN_FULL[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) r = !r } return r }; while (a.length < 260) { const x = -18 + q() * 36, y = -11.5 + q() * 23; if (!inside(x, y)) continue; if (y < 0 && q() < .55) continue; a.push([x, y, .3 + q() * .9, q() * 6, q() < .55 ? 0 : q() < .6 ? 1 : 2, q()]) } return a })();
shot(CUTS[18], CUTS[19], (tl, t) => {
  c.fillStyle = '#4e4a40'; c.fillRect(0, 0, W, H); c.strokeStyle = 'rgba(240,226,180,.12)'; c.lineWidth = 2; for (let x = 0; x < W; x += 72) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke() } for (let y = 0; y < H; y += 72) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke() }
  const cam = { x: 0, y: -1, z: 24 };
  world(cam, () => { c.save(); c.translate(-2, 0); c.rotate(PI / 2);
    c.strokeStyle = '#d9b35a'; c.lineWidth = .14; c.setLineDash([.6, .4]); c.beginPath(); PLAN_FULL.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.stroke(); c.setLineDash([]);
    PECAS.forEach(([x, y, r, rot, k, d], i) => { const a = ramp(tl, .2 + d * 2.6, .5 + d * 2.6); if (a <= 0) return; const s = r * (1.6 - .6 * eo(a)), yy = y + (1 - eo(a)) * 14; c.save(); c.translate(x, yy); c.rotate(rot); c.globalAlpha = a; poly([[-s, -s * .6], [s * .7, -s * .8], [s, s * .3], [-s * .2, s * .9]], ['#e6dfcc', '#1a1b20', '#6a6d74'][k]); c.restore() });
    c.restore() });
  const n = 84000 * eo(ramp(tl, .3, 3.0));
  label(TX, 560, fmt(n), { size: 200 }); label(TX, 630, 'PEDAÇOS RECOLHIDOS', { size: 52, col: OURO, a: ramp(tl, .4, .7) }); label(TX, 690, 'NO TEXAS E NA LOUISIANA', { size: 36, w: 600, a: ramp(tl, 1.6, 1.9) });
  typeText(tl, TX, TY, 'A RECONSTRUÇÃO', .2, 3.8, { sub: 'NO CHÃO DE UM HANGAR' });
});
// --- 20: o relatório da investigação ---
shot(CUTS[19], CUTS[20], (tl, t) => {
  c.fillStyle = '#0b0b0e'; c.fillRect(0, 0, W, H); add(() => glow(560, 540, 640, '217,150,70', .12 * ramp(tl, 0, .5)));
  c.save(); c.translate(560, 560); c.rotate(-.05); c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(-280, -360, 580, 760); c.fillStyle = bands(-300, 0, 280, 0, [[.06, '#0e1220'], [.7, '#1c2440'], [1, '#141a30']]); c.fillRect(-300, -380, 580, 760);
  c.fillStyle = '#d9b35a'; c.fillRect(-240, -250, 460, 3); txt('RELATÓRIO DA', -240, -170, 52, CREME); txt('INVESTIGAÇÃO', -240, -110, 52, CREME); txt('ACIDENTE DO COLUMBIA', -240, -50, 34, PALHA, { w: 600 }); txt('AGOSTO DE 2003', -240, 300, 34, OURO, { w: 600 }); c.restore();
  label(1000, 330, 'CAUSA FÍSICA', { size: 44, col: OURO, a: ramp(tl, .1, .4), w: 600 }); label(1000, 430, 'A ESPUMA DO TANQUE', { size: 92, a: ramp(tl, .2, .5) });
  label(1000, 610, 'CAUSA NA ORGANIZAÇÃO', { size: 44, col: OURO, a: ramp(tl, 2.2, 2.5), w: 600 }); label(1000, 710, 'UMA CULTURA', { size: 92, a: ramp(tl, 2.3, 2.6) }); label(1000, 800, 'ACOSTUMADA AO RISCO', { size: 92, col: OURO, a: ramp(tl, 3.0, 3.3) });
});
// --- 21: dois anos e meio no chão ---
shot(CUTS[20], CUTS[21], (tl, t) => {
  c.fillStyle = lg(0, 0, 0, H, [[0, '#14161d'], [.7, '#2a2a2c'], [1, '#3a362e']]); c.fillRect(0, 0, W, H);
  for (let i = 0; i < 5; i++) { const x = 260 + i * 350; add(() => glow(x, 90, 260, '255,226,170', .12)); pill(x, 90, 160, 16, '#fff1c8') }
  c.fillStyle = '#2b2a28'; c.fillRect(0, 900, W, 180); c.fillStyle = '#3a3830'; c.fillRect(0, 900, W, 8);
  c.save(); c.translate(1080, 760); c.scale(28, -28); c.fillStyle = '#4a4d55'; c.fillRect(-12, -5.4, 1, 5.4); c.fillRect(8, -5.4, 1, 5.4); orbSide({ pal: 'hang', silts: false }); c.restore();
  c.fillStyle = '#3a3d44'; for (const y of [520, 690]) c.fillRect(420, y, 1360, 18); for (const x of [440, 900, 1360, 1760]) c.fillRect(x, 520, 14, 380);
  const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'], m = 1 + Math.floor(ramp(tl, .4, 2.8) * 29);
  label(TX, 360, `${meses[m % 12]} ${2003 + Math.floor(m / 12)}`, { size: 150 }); label(TX, 430, 'NENHUM VOO', { size: 52, col: OURO, a: ramp(tl, .3, .6) });
  label(TX, 500, 'ATÉ JULHO DE 2005', { size: 38, w: 600, a: ramp(tl, 2.6, 2.9) });
});
// --- 22: inspeção da asa no espaço ---
shot(CUTS[21], CUTS[22], (tl, t) => {
  c.fillStyle = '#07080f'; c.fillRect(0, 0, W, H); stars(1, t); sunGlow(1700, 160, 300, '255,236,190', .9);
  earthLimb(800, 3200, t * 6, { seed: 31 });
  c.save(); c.translate(1000, 440); c.scale(22, -22);
  orbSide({ pal: 'esp', bay: 1, silts: false });
  const sw = sin(tl * 1.4) * .5 + .5, tipx = lerp(9, -12, sw), tipy = -3.4;
  c.strokeStyle = '#e6e1d2'; c.lineCap = 'round'; c.lineWidth = .45; c.beginPath(); c.moveTo(7.5, 6.2); c.lineTo(lerp(4, -2, sw), 14); c.lineTo(lerp(14, -6, sw), 6); c.stroke(); c.lineWidth = .3; c.beginPath(); c.moveTo(lerp(14, -6, sw), 6); c.lineTo(tipx, tipy); c.stroke();
  disc(tipx, tipy, .45, '#d9b35a');
  c.globalAlpha = .35 + .15 * sin(t * 10); poly([[tipx, tipy], [tipx - 3, 1.7], [tipx + 3, 1.7]], '#f0b94a'); c.globalAlpha = 1; c.strokeStyle = OURO; c.lineWidth = .12; c.beginPath(); c.moveTo(tipx - 3, 1.75); c.lineTo(tipx + 3, 1.75); c.stroke();
  c.restore();
  typeText(tl, TX, TY, 'INSPEÇÃO NO ESPAÇO', .3, 5.0, { sub: 'A CADA VOO, A PARTIR DE 2005' });
});
// --- 23: em memória ---
shot(CUTS[22], CUTS[23], (tl, t) => {
  nightSky(t); add(() => glow(960, 520, 900, '217,150,70', .07));
  NOMES.forEach((_, i) => { const [x, y] = ESTRELA(i); add(() => glow(x, y + 120, 60, '240,185,74', .35)); star4(x, y + 120, 22 + 3 * sin(t * 2 + i), '#ffecbe') });
  label(W / 2, 330, 'STS-107 · COLUMBIA', { size: 104, align: 'center', a: ramp(tl, .2, .7) }); label(W / 2, 400, '1º DE FEVEREIRO DE 2003', { size: 48, align: 'center', col: OURO, a: ramp(tl, .6, 1.1), w: 600 });
  label(W / 2, 760, 'EM MEMÓRIA DOS SETE', { size: 44, align: 'center', col: PALHA, a: ramp(tl, 1.2, 1.7), w: 600 });
});
