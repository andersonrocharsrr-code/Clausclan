// ================= Figuras de frente, com rosto e farda (Hitler, SS, generais, Eva Braun) =================
// Fardas da época sem símbolos nazistas (sem suástica, sem caveira, sem runas da SS).

// Rosto de frente. Unidades: cabeça com ~20 de altura, centro em (0,0).
function rosto(o = {}) {
  const pele = o.pele || '#d6ad88', sombra = o.peleS || '#b88d68', cab = o.cabelo || '#2a2018';
  if (o.estilo === 'mulher') { c.fillStyle = cab; c.beginPath(); c.ellipse(0, 1.5, 10.6, 12.6, 0, 0, 7); c.fill(); for (let k = -1; k <= 1; k += 2) disc(k * 9.2, 9.5, 3.6, cab) }
  const cabeca = () => { c.beginPath(); c.moveTo(0, -10); c.bezierCurveTo(5.0, -10, 7.3, -6.6, 7.2, -2); c.bezierCurveTo(7.0, 2.6, 5.6, 6.2, 3.4, 8.8); c.bezierCurveTo(2.2, 10.1, 1.1, 10.7, 0, 10.7); c.bezierCurveTo(-1.1, 10.7, -2.2, 10.1, -3.4, 8.8); c.bezierCurveTo(-5.6, 6.2, -7.0, 2.6, -7.2, -2); c.bezierCurveTo(-7.3, -6.6, -5.0, -10, 0, -10); c.closePath() };
  c.fillStyle = sombra; c.fillRect(-2.7, 6.5, 5.4, 7.5); c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(0, 10.2, 3.6, 1.6, 0, 0, 7); c.fill();
  for (const k of [-1, 1]) { disc(k * 7.2, .2, 2.2, sombra); disc(k * 7.4, .2, 1.2, pele) }
  c.fillStyle = pele; cabeca(); c.fill();
  c.save(); cabeca(); c.clip(); poly([[3.4, -12], [9, -12], [9, 12], [1, 12], [3.6, 6.4], [4.6, 1.2]], sombra); c.fillStyle = 'rgba(150,90,60,.18)'; c.beginPath(); c.ellipse(-4.4, 3.2, 1.8, 1.2, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(4.4, 3.2, 1.8, 1.2, 0, 0, 7); c.fill(); c.restore();
  if (o.velho) { c.strokeStyle = 'rgba(120,80,50,.45)'; c.lineWidth = .35; for (const k of [-1, 1]) { c.beginPath(); c.arc(k * 3.3, .2, 1.6, .3, PI - .3); c.stroke(); c.beginPath(); c.moveTo(k * 1.7, 3.6); c.quadraticCurveTo(k * 2.9, 5.6, k * 2.6, 7.4); c.stroke() } }
  for (const k of [-1, 1]) { c.fillStyle = '#f4ece0'; c.beginPath(); c.ellipse(k * 3.3, -1.2, 1.55, .85, 0, 0, 7); c.fill(); disc(k * 3.3 + .1, -1.15, .68, o.olho || '#3a2a1c'); disc(k * 3.3 + .1, -1.15, .3, '#0c0c0e'); c.fillStyle = 'rgba(40,24,14,.7)'; c.fillRect(k * 3.3 - 1.6, -2.15, 3.2, .4) }
  c.fillStyle = o.estilo === 'mulher' ? '#6a4a2a' : cab; c.fillRect(-5.2, -3.6, 3.6, o.estilo === 'mulher' ? .5 : .9); c.fillRect(1.6, -3.6, 3.6, o.estilo === 'mulher' ? .5 : .9);
  poly([[.1, -1.2], [1.5, 3.7], [-.2, 4.5], [-1.1, 3.9]], sombra); disc(.9, 4.2, .35, 'rgba(60,30,20,.6)'); disc(-.9, 4.2, .35, 'rgba(60,30,20,.6)');
  if (o.bigode) { c.fillStyle = cab; c.fillRect(-1.5, 4.7, 3, 1.4) }
  c.fillStyle = o.estilo === 'mulher' ? '#a8504a' : '#7a4a3a'; c.fillRect(-2.3, 6.8, 4.6, .55); c.fillStyle = 'rgba(160,90,70,.4)'; c.fillRect(-1.6, 7.35, 3.2, .45);
  // cabelo
  if (o.estilo === 'lado') {
    c.fillStyle = cab; c.beginPath(); c.ellipse(0, -3.4, 7.7, 7.2, 0, PI, 0); c.fill(); c.fillRect(-7.7, -3.6, 1.4, 2.2); c.fillRect(6.3, -3.6, 1.4, 2.2);
    c.strokeStyle = 'rgba(214,173,136,.7)'; c.lineWidth = .3; c.beginPath(); c.moveTo(-3.3, -9.6); c.lineTo(-3.1, -6.8); c.stroke();
    poly([[-3, -9.9], [1, -10.6], [5.6, -8.4], [6.6, -5.4], [5.2, -2.4], [4.0, -4.2], [2.6, -5.4], [-.4, -6.6], [-3.1, -7.2]], shadeHex(cab, 1.25));
    c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = .3; c.beginPath(); c.moveTo(-1, -9.4); c.quadraticCurveTo(3.5, -8.6, 5.4, -3.6); c.stroke();
  } else if (o.estilo === 'mulher') {
    c.fillStyle = cab; c.beginPath(); c.ellipse(0, -4.2, 8.4, 6.8, 0, PI, 0); c.fill(); poly([[-8.2, -4.4], [-2, -9], [3, -5.2], [-6.4, -2]], shadeHex(cab, 1.12)); poly([[8.2, -4.4], [2, -9.4], [-1, -6], [6.6, -2.4]], shadeHex(cab, 1.12));
  } else if (o.estilo !== 'quepe') { c.fillStyle = cab; c.beginPath(); c.ellipse(0, -3.6, 7.8, 7, 0, PI, 0); c.fill(); c.fillRect(-7.8, -3.8, 1.4, 3); c.fillRect(6.4, -3.8, 1.4, 3) }
  if (o.capacete) capaceteFrente(o.capacete, cab);
  if (o.quepe) { c.fillStyle = cab; c.fillRect(-7.7, -5, 1.6, 3.4); c.fillRect(6.1, -5, 1.6, 3.4); const q = o.quepe; poly([[-10.4, -8.2], [-7, -14.2], [7, -14.2], [10.4, -8.2], [7.9, -6.4], [-7.9, -6.4]], q.cor); poly([[3, -14.2], [7, -14.2], [10.4, -8.2], [7.9, -6.4], [4, -6.4]], shadeHex(q.cor, .78)); c.fillStyle = q.faixa || q.cor; c.fillRect(-7.9, -7.8, 15.8, 2.4); c.fillStyle = q.vivo || '#c8c8c8'; c.fillRect(-10.2, -8.4, 20.4, .45); c.fillRect(-7.9, -5.5, 15.8, .35); c.fillStyle = q.cordao || '#c8c8c8'; c.fillRect(-7.4, -5.8, 14.8, .55); disc(0, -9.6, .9, q.cordao || '#c8c8c8'); poly([[-7.6, -5.2], [7.6, -5.2], [6.2, -3.3], [-6.2, -3.3]], '#0c0c0e'); c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(-5.6, -4.9, 6, .35) }
}
function shadeHex(hex, k) { const n = parseInt(hex.slice(1), 16); const f = v => Math.max(0, Math.min(255, Math.round(v * k))); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})` }
function cruzFerro(x, y, r) { const arm = (rot) => { c.save(); c.translate(x, y); c.rotate(rot); poly([[-r * .28, 0], [r * .28, 0], [r * .55, -r], [-r * .55, -r]], '#c8c8c8'); poly([[-r * .2, -r * .1], [r * .2, -r * .1], [r * .42, -r * .86], [-r * .42, -r * .86]], '#121214'); c.restore() }; for (let k = 0; k < 4; k++) arm(k * PI / 2); disc(x, y, r * .26, '#121214') }
function star5(x, y, r, col) { const p = []; for (let k = 0; k < 10; k++) { const a = -PI / 2 + k * PI / 5, rr = k % 2 ? r * .42 : r; p.push([x + cos(a) * rr, y + sin(a) * rr]) } poly(p, col) }
function capaceteFrente(tipo, cab) {
  c.fillStyle = cab; c.fillRect(-7.7, -4.6, 1.5, 3.2); c.fillRect(6.2, -4.6, 1.5, 3.2);
  if (tipo === 'm1') { c.fillStyle = '#5a5a3c'; c.beginPath(); c.ellipse(0, -5.2, 9.6, 8.6, 0, PI, 0); c.fill(); c.fillStyle = '#4a4a30'; c.beginPath(); c.ellipse(3, -5.2, 6.6, 8.4, 0, -PI / 2, 0); c.lineTo(3, -5.2); c.fill(); c.fillStyle = '#474730'; c.fillRect(-10.4, -5.8, 20.8, 1.5); c.strokeStyle = '#3a3624'; c.lineWidth = .5; c.beginPath(); c.moveTo(-7.4, -4.4); c.quadraticCurveTo(-6.6, 4, -2, 9.6); c.moveTo(7.4, -4.4); c.quadraticCurveTo(6.6, 4, 2, 9.6); c.stroke() }
  else if (tipo === 'stahlhelm') { const g = '#565b4e', gs = '#45493e'; poly([[-9.2, -6], [-12, 1.4], [-8.8, 2.2], [-7.2, -3.6]], gs); poly([[9.2, -6], [12, 1.4], [8.8, 2.2], [7.2, -3.6]], gs); c.fillStyle = g; c.beginPath(); c.ellipse(0, -5.4, 9.4, 8.8, 0, PI, 0); c.fill(); c.fillStyle = gs; c.beginPath(); c.ellipse(3.2, -5.4, 6.2, 8.6, 0, -PI / 2, 0); c.lineTo(3.2, -5.4); c.fill(); c.fillStyle = '#3e4238'; c.fillRect(-9, -6, 18, 1.4) }
  else if (tipo === 'pilotka') { poly([[-7.8, -6.2], [7.8, -6.2], [6.6, -10.6], [-1, -9.6], [-6.4, -10]], '#7e7850'); poly([[1, -9.8], [6.6, -10.6], [7.8, -6.2], [2, -6.2]], '#6a6442'); c.fillStyle = '#5e5838'; c.fillRect(-7.8, -7.4, 15.6, 1.2); star5(-3.2, -8.2, 1.3, '#b8352a') }
}
const limb = (pts, w0, w1, col) => { c.strokeStyle = col; c.lineCap = 'round'; c.lineJoin = 'round'; for (let i = 0; i < pts.length - 1; i++) { c.lineWidth = lerp(w0, w1, i / Math.max(1, pts.length - 2)); c.beginPath(); c.moveTo(...pts[i]); c.lineTo(...pts[i + 1]); c.stroke() } };
function mao(x, y, k, pele, sombra) { c.fillStyle = pele; c.beginPath(); c.ellipse(x, y, 2.3, 3.1, k * .12, 0, 7); c.fill(); c.fillStyle = sombra; c.beginPath(); c.ellipse(x + k * 1.0, y + .5, 1.0, 2.4, k * .12, 0, 7); c.fill(); c.fillStyle = pele; c.beginPath(); c.ellipse(x - k * 1.9, y - 1.2, .9, 1.6, -k * .5, 0, 7); c.fill() }
const TORSO = () => { c.beginPath(); c.moveTo(-5.6, -85.4); c.quadraticCurveTo(-11.5, -85.2, -14.6, -82.4); c.quadraticCurveTo(-16.9, -79.6, -16.3, -73); c.lineTo(-15.1, -61); c.quadraticCurveTo(-13.4, -55, -13.6, -50); c.lineTo(-15, -40.5); c.quadraticCurveTo(0, -38.8, 15, -40.5); c.lineTo(13.6, -50); c.quadraticCurveTo(13.4, -55, 15.1, -61); c.lineTo(16.3, -73); c.quadraticCurveTo(16.9, -79.6, 14.6, -82.4); c.quadraticCurveTo(11.5, -85.2, 5.6, -85.4); c.closePath() };
// Figura fardada de frente. Pés em (x,y), altura h. Ver FARDAS abaixo.
function fardado(x, y, h, f, t = 0, o = {}) {
  const s = h / 100, tr = o.treme ? sin(t * 38) * .5 + sin(t * 23) * .35 : 0, pele = f.pele || '#d6ad88', ps = f.peleS || '#b88d68', anda = o.anda ? sin(t * 5) * 1.6 : 0;
  c.save(); c.translate(x, y); c.scale(s, s); c.lineCap = 'round'; c.lineJoin = 'round';
  if (f.arma) { limb([[11, -99], [13.6, -60]], 1.4, 1.4, '#2a2420'); limb([[12.8, -76], [14.2, -58]], 2.8, 2.8, '#4a3020') }
  for (const k of [-1, 1]) {
    const dy = k * anda, bota = f.bota || '#121214';
    c.save(); c.translate(0, dy * .3);
    if (f.culote) {
      c.fillStyle = k < 0 ? f.calca : shadeHex(f.calca, .82); c.beginPath(); c.moveTo(k * 1.2, -46); c.lineTo(k * 12.8, -46); c.quadraticCurveTo(k * 17.6, -37, k * 10.2, -25); c.lineTo(k * 2.6, -25); c.quadraticCurveTo(k * 1.2, -34, k * 1.2, -46); c.fill();
      if (f.faixa) { c.strokeStyle = f.faixa; c.lineWidth = .9; c.beginPath(); c.moveTo(k * 12.6, -44); c.quadraticCurveTo(k * 16.8, -37, k * 10.4, -27); c.stroke() }
    } else { c.fillStyle = k < 0 ? f.calca : shadeHex(f.calca, .82); c.beginPath(); c.moveTo(k * 1.0, -46); c.lineTo(k * 12.6, -46); c.quadraticCurveTo(k * 12.6, -24, k * 10.6, -4); c.lineTo(k * 3.0, -4); c.quadraticCurveTo(k * 2.2, -20, k * 1.0, -32); c.closePath(); c.fill() }
    if (f.culote || f.botaAlta) { c.fillStyle = bota; c.beginPath(); c.moveTo(k * 2.4, -26.5); c.lineTo(k * 10.6, -26.5); c.quadraticCurveTo(k * 10.2, -12, k * 9.6, -3); c.lineTo(k * 2.8, -3); c.quadraticCurveTo(k * 2.2, -14, k * 2.4, -26.5); c.fill(); c.fillStyle = 'rgba(255,255,255,.13)'; c.fillRect(k > 0 ? 4 : -5.4, -24, 1.3, 19) }
    if (f.perneira) { c.fillStyle = f.perneira; c.beginPath(); c.moveTo(k * 2.8, -16); c.lineTo(k * 10.6, -16); c.lineTo(k * 10.2, -4); c.lineTo(k * 3, -4); c.closePath(); c.fill(); c.fillStyle = 'rgba(0,0,0,.25)'; for (let j = 0; j < 3; j++) c.fillRect(k > 0 ? 3 : -10.4, -14 + j * 3.6, 7.4, .5) }
    c.fillStyle = f.sapato || bota; c.beginPath(); c.ellipse(k * 6.6, -1.8, 5.2, 2.3, 0, 0, 7); c.fill();
    c.restore();
  }
  c.save(); c.translate(0, o.curvado ? 2 : 0);
  c.fillStyle = f.tun; TORSO(); c.fill(); c.save(); TORSO(); c.clip(); poly([[4.6, -90], [20, -90], [20, -38], [5, -38]], f.tunD); c.restore();
  if (f.estilo === 'fechada') { c.fillStyle = shadeHex(f.tun, .9); c.beginPath(); c.moveTo(-5.4, -85.6); c.quadraticCurveTo(0, -83.6, 5.4, -85.6); c.lineTo(5.6, -82.6); c.quadraticCurveTo(0, -80.8, -5.6, -82.6); c.closePath(); c.fill(); c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(-.5, -82, 1, 15); for (const by of [-79, -73]) disc(1.6, by, .6, f.botao || '#b8a060') }
  else { poly([[-5.5, -85.2], [5.5, -85.2], [0, -71]], f.camisa || '#ece6da'); if (f.gravata !== false) { c.fillStyle = '#121214'; c.fillRect(-.8, -82, 1.6, 9); poly([[-1.2, -82.8], [1.2, -82.8], [.8, -81], [-.8, -81]], '#121214') }
    poly([[-5.5, -85.2], [-8.4, -84.6], [-1, -66], [0, -71]], shadeHex(f.tun, 1.12)); poly([[5.5, -85.2], [8.4, -84.6], [1, -66], [0, -71]], shadeHex(f.tunD, 1.12)) }
  if (f.gola) { poly([[-7.6, -84.4], [-4.8, -84.4], [-3.8, -80.6], [-5.8, -80.6]], f.gola); poly([[7.6, -84.4], [4.8, -84.4], [3.8, -80.6], [5.8, -80.6]], f.gola); if (f.golaBorda) { c.strokeStyle = f.golaBorda; c.lineWidth = .3; c.beginPath(); c.moveTo(-7.6, -84.4); c.lineTo(-5.8, -80.6); c.lineTo(-3.8, -80.6); c.moveTo(7.6, -84.4); c.lineTo(5.8, -80.6); c.lineTo(3.8, -80.6); c.stroke() } }
  if (f.ombro) { poly([[-14.4, -82.4], [-8.8, -84.8], [-8.4, -82.8], [-14, -80.4]], f.ombro); poly([[14.4, -82.4], [8.8, -84.8], [8.4, -82.8], [14, -80.4]], f.ombro) }
  c.strokeStyle = 'rgba(0,0,0,.22)'; c.lineWidth = .45; const bolsos = f.estilo === 'fechada' ? [[-11, -76, 6.6, 6], [4.4, -76, 6.6, 6]] : [[-11.4, -75, 7, 6.5], [4.4, -75, 7, 6.5], [-12, -58, 8, 8.5], [4, -58, 8, 8.5]];
  for (const [px, py, pw, ph] of bolsos) { c.beginPath(); c.roundRect(px, py, pw, ph, 1.2); c.stroke(); c.beginPath(); c.moveTo(px, py + 1.9); c.lineTo(px + pw, py + 1.9); c.stroke(); disc(px + pw / 2, py + 1.4, .45, f.botao || '#c8c8c8') }
  if (f.estilo !== 'fechada') for (const by of [-68, -61, -54, -44]) disc(.9, by, .75, f.botao || '#c8c8c8');
  if (f.capote) { c.strokeStyle = '#6a604c'; c.lineWidth = 4.2; c.beginPath(); c.moveTo(-13.6, -84); c.quadraticCurveTo(-2, -70, 13.4, -48); c.stroke(); c.strokeStyle = 'rgba(0,0,0,.22)'; c.lineWidth = .4; for (let k = 0; k < 6; k++) { const u = k / 6, px = lerp(-13.6, 13.4, u), py = lerp(-84, -48, u) + 6 * sin(u * PI); c.beginPath(); c.moveTo(px - 1.6, py - 1.2); c.lineTo(px + 1.6, py + 1.2); c.stroke() } }
  c.fillStyle = f.cinto || '#141416'; c.fillRect(-13.9, -50.6, 27.8, 3.4); c.fillStyle = f.fivela || '#a8a8a8'; c.beginPath(); c.roundRect(-2.2, -51.2, 4.4, 4.6, .6); c.fill(); c.fillStyle = f.cinto || '#141416'; c.fillRect(-1.2, -50.2, 2.4, 2.6);
  if (f.correia) { c.strokeStyle = f.cinto || '#141416'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(9.4, -83.4); c.lineTo(-10.8, -50.4); c.stroke() }
  if (f.fitas) { const cols = ['#121214', '#f2ece0', '#a8382a', '#3a5a3a', '#d9b35a']; for (let k = 0; k < 5; k++) { c.fillStyle = cols[k]; c.fillRect(4.6 + k * 1.3, -78.4, 1.3, 1.6) } }
  if (f.cruz) cruzFerro(8, -66.4, 2.5);
  if (f.ferida) { c.fillStyle = '#121214'; c.beginPath(); c.ellipse(8, -59.5, 1.7, 2.1, 0, 0, 7); c.fill(); c.strokeStyle = '#8a8a8a'; c.lineWidth = .35; c.stroke() }
  if (f.cavaleiro) { c.strokeStyle = '#a8382a'; c.lineWidth = .7; c.beginPath(); c.moveTo(-2.4, -84); c.lineTo(0, -78); c.lineTo(2.4, -84); c.stroke(); cruzFerro(0, -75.4, 2.2) }
  if (f.medalhaVermelha) star5(-7.6, -67, 1.8, '#b8352a');
  // braços arredondados e mãos
  for (const k of [-1, 1]) { const col = k < 0 ? f.tun : f.tunD, wx = k * 16.6 + (k > 0 ? tr : 0) - k * anda * .2, wy = -49.5; limb([[k * 14.2, -80.6], [k * 17.4, -64], [wx, wy]], 6.4, 5.4, col); limb([[wx - k * .2, wy - 2.2], [wx, wy - .6]], 5.8, 5.8, shadeHex(f.tun, .8)); mao(wx, wy + 3, k, pele, ps) }
  c.fillStyle = ps; c.fillRect(-2.6, -88.6, 5.2, 4.2);
  c.translate(0, -92.4 + (o.curvado ? 2.6 : 0)); c.scale(.66, .66); rosto(f.rosto);
  c.restore(); c.restore();
}
// Soldado de perfil (aperto de mão no Elba). dir = 1 olha para a direita.
function soldadoPerfil(x, y, h, dir, f, t = 0) {
  const s = h / 100, pele = f.pele || '#d6ad88', ps = f.peleS || '#b88d68';
  c.save(); c.translate(x, y); c.scale(s * dir, s); c.lineCap = 'round'; c.lineJoin = 'round';
  if (f.arma) limb([[-9, -100], [-3, -52]], 1.6, 1.6, '#2a2420');
  limb([[-2, -46], [-4, -24], [-5, -4]], 8.6, 7.4, shadeHex(f.calca, .78)); c.fillStyle = f.bota || '#121214'; c.beginPath(); c.ellipse(-2.6, -2, 6, 2.4, 0, 0, 7); c.fill();
  limb([[2, -46], [4, -24], [5, -4]], 8.8, 7.6, f.calca); if (f.perneira) limb([[4.4, -16], [5, -5]], 8, 8, f.perneira); if (f.culote || f.botaAlta) limb([[4.2, -25], [5, -5]], 7.8, 7.8, f.bota || '#121214'); c.fillStyle = f.bota || '#121214'; c.beginPath(); c.ellipse(7.6, -2, 6.4, 2.5, 0, 0, 7); c.fill();
  const tor = () => { c.beginPath(); c.moveTo(-6.6, -84); c.quadraticCurveTo(-9.6, -70, -8, -42); c.lineTo(8, -42); c.quadraticCurveTo(9.4, -62, 8.4, -76); c.quadraticCurveTo(6.6, -85, 0, -85.6); c.closePath() };
  c.fillStyle = f.tun; tor(); c.fill(); c.save(); tor(); c.clip(); c.fillStyle = f.tunD; c.fillRect(-12, -90, 7, 50); c.restore();
  c.fillStyle = f.cinto || '#2a2016'; c.fillRect(-8.4, -51, 17, 3); c.fillStyle = f.fivela || '#b8a060'; c.fillRect(6, -51.4, 3, 3.8);
  if (f.capote) { c.strokeStyle = '#6a604c'; c.lineWidth = 4.4; c.beginPath(); c.moveTo(-6, -84); c.quadraticCurveTo(4, -70, 7.4, -50); c.stroke() }
  c.strokeStyle = 'rgba(0,0,0,.22)'; c.lineWidth = .45; c.beginPath(); c.roundRect(2, -76, 5.6, 6, 1); c.stroke();
  limb([[1, -80], [9, -66], [21, -62]], 6.2, 5.2, f.tun); mao(23.4, -61.6, 1, pele, ps);
  c.fillStyle = ps; c.fillRect(-2.4, -89.6, 5.4, 5);
  c.save(); c.translate(0, -94); c.fillStyle = pele; c.beginPath(); c.moveTo(-6.4, -2); c.quadraticCurveTo(-6.6, -9, 0, -9); c.quadraticCurveTo(6, -9, 6.6, -3); c.lineTo(7.8, .6); c.lineTo(6.6, 1.4); c.quadraticCurveTo(6.8, 4.2, 5.8, 5.6); c.quadraticCurveTo(2, 7.8, -2.4, 6.4); c.quadraticCurveTo(-6.4, 4, -6.4, -2); c.fill();
  c.fillStyle = ps; c.beginPath(); c.ellipse(-1.4, 0, 1.8, 2.4, 0, 0, 7); c.fill(); disc(3.8, -2.2, .7, '#14120e'); c.fillStyle = shadeHex(f.cabelo || '#2a2018', 1); c.fillRect(2.4, -3.8, 3.2, .6); c.fillStyle = '#7a4a3a'; c.fillRect(3.6, 3.6, 2.6, .5);
  c.fillStyle = f.cabelo || '#2a2018'; c.beginPath(); c.moveTo(-6.6, 0); c.quadraticCurveTo(-7.4, -9.6, 1, -9.4); c.lineTo(1, -6); c.quadraticCurveTo(-4, -6, -4.2, 0); c.closePath(); c.fill();
  if (f.capacete === 'm1') { c.fillStyle = '#5a5a3c'; c.beginPath(); c.ellipse(.4, -5, 8.8, 7.6, 0, PI, 0); c.fill(); c.fillStyle = '#474730'; c.fillRect(-9.2, -5.6, 19.8, 1.6); c.strokeStyle = '#3a3624'; c.lineWidth = .5; c.beginPath(); c.moveTo(-1, -4); c.lineTo(3, 6); c.stroke() }
  else if (f.capacete === 'stahlhelm') { poly([[-8.6, -5.4], [-10.4, 2.4], [-6.6, 1.4], [-5.6, -4]], '#45493e'); c.fillStyle = '#565b4e'; c.beginPath(); c.ellipse(0, -5, 8.6, 7.8, 0, PI, 0); c.fill(); poly([[7.4, -5], [9.6, -3.6], [8.4, -2.8], [6.4, -4.4]], '#45493e') }
  else if (f.capacete === 'pilotka') { poly([[-7, -6.6], [6.6, -7.4], [5, -11.4], [-5.6, -10]], '#7e7850'); c.fillStyle = '#5e5838'; c.fillRect(-7, -7.8, 13.6, 1.2); star5(4.4, -8.8, 1.2, '#b8352a') }
  c.restore(); c.restore();
}
// Pessoa de costas, arredondada (substitui a do motor)
function person(x, y, h, o = {}) {
  const s = h / 100, { coat = '#8c4a3a', dark = '#5e2e26', legs = '#22242b', hair = '#2a2018', skin = '#c99a74', hat = null } = o;
  c.save(); c.translate(x, y); c.scale(s, s); c.lineCap = 'round'; c.lineJoin = 'round';
  limb([[-5, -44], [-5.4, -22], [-5.8, -4]], 8.4, 7, legs); limb([[5, -44], [5.4, -22], [5.8, -4]], 8.4, 7, shadeHex(legs.startsWith('#') ? legs : '#22242b', .85));
  c.fillStyle = '#16161a'; c.beginPath(); c.ellipse(-6, -2, 4.6, 2.2, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(6, -2, 4.6, 2.2, 0, 0, 7); c.fill();
  const tor = () => { c.beginPath(); c.moveTo(-5, -85); c.quadraticCurveTo(-11.6, -85, -14, -82); c.quadraticCurveTo(-16.2, -79, -15.4, -72); c.lineTo(-13, -46); c.quadraticCurveTo(0, -40.6, 13, -46); c.lineTo(15.4, -72); c.quadraticCurveTo(16.2, -79, 14, -82); c.quadraticCurveTo(11.6, -85, 5, -85); c.closePath() };
  c.fillStyle = coat; tor(); c.fill(); c.save(); tor(); c.clip(); c.fillStyle = dark; c.fillRect(3.2, -90, 14, 50); c.restore();
  limb([[-13.4, -79.6], [-16, -63], [-15.4, -50]], 6, 5, coat); limb([[13.4, -79.6], [16, -63], [15.4, -50]], 6, 5, dark);
  c.fillStyle = skin; c.beginPath(); c.ellipse(-15.4, -46.4, 2.3, 3, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(15.4, -46.4, 2.3, 3, 0, 0, 7); c.fill();
  c.fillStyle = skin; c.fillRect(-2.6, -89.4, 5.2, 5.6); disc(-6.4, -92.6, 1.7, skin); disc(6.4, -92.6, 1.7, skin);
  c.fillStyle = hair; c.beginPath(); c.ellipse(0, -93.6, 6.6, 7.4, 0, 0, 7); c.fill(); c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(2.4, -92.6, 4, 6.4, 0, -PI / 2, PI / 2); c.fill();
  if (hat) { c.fillStyle = hat; c.fillRect(-9, -97.6, 18, 3); c.beginPath(); c.arc(0, -97.6, 7, PI, 0); c.fill() }
  c.restore();
}
// Eva Braun: vestido preto de seda, cabelo claro
function mulher(x, y, h, o, t = 0) {
  const s = h / 100, pele = '#e0b896', ps = '#c49a76'; c.save(); c.translate(x, y); c.scale(s, s); c.lineCap = 'round'; c.lineJoin = 'round';
  limb([[-4, -26], [-4.4, -5]], 4, 3.4, pele); limb([[4, -26], [4.4, -5]], 4, 3.4, ps); c.fillStyle = '#0e0e10'; c.beginPath(); c.ellipse(-4.6, -2.4, 3.4, 1.8, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(4.6, -2.4, 3.4, 1.8, 0, 0, 7); c.fill();
  const v = () => { c.beginPath(); c.moveTo(-4.8, -84.4); c.quadraticCurveTo(-10.6, -84.4, -12.6, -81); c.quadraticCurveTo(-14.4, -76, -13, -66); c.quadraticCurveTo(-10.4, -56, -11, -50); c.quadraticCurveTo(-15, -38, -16.4, -24); c.quadraticCurveTo(0, -21.6, 16.4, -24); c.quadraticCurveTo(15, -38, 11, -50); c.quadraticCurveTo(10.4, -56, 13, -66); c.quadraticCurveTo(14.4, -76, 12.6, -81); c.quadraticCurveTo(10.6, -84.4, 4.8, -84.4); c.closePath() };
  c.fillStyle = o.vestido; v(); c.fill(); c.save(); v(); c.clip(); c.fillStyle = shadeHex(o.vestido, .65); c.fillRect(3.4, -90, 16, 70); c.strokeStyle = 'rgba(255,255,255,.1)'; c.lineWidth = .5; for (const k of [-6, 0, 6]) { c.beginPath(); c.moveTo(k * .6, -47); c.quadraticCurveTo(k, -36, k * 1.4, -24); c.stroke() } c.restore();
  poly([[-4.8, -84.6], [4.8, -84.6], [0, -78.4]], pele); c.fillStyle = shadeHex(o.vestido, .8); c.fillRect(-11.4, -52.2, 22.8, 1.6);
  limb([[-11.6, -80], [-14.6, -64], [-13.6, -50]], 5.2, 4.2, o.vestido); limb([[11.6, -80], [14.6, -64], [13.6, -50]], 5.2, 4.2, shadeHex(o.vestido, .65));
  mao(-13.6, -47, -1, pele, ps); mao(13.6, -47, 1, pele, ps);
  c.fillStyle = ps; c.fillRect(-2.2, -88.4, 4.4, 4.6);
  c.translate(0, -92); c.scale(.62, .62); rosto({ estilo: 'mulher', cabelo: o.cabelo || '#b8945a', pele, peleS: ps, olho: '#4a6a80' });
  c.restore();
}
const HITLER_F = { tun: '#6e7058', tunD: '#55574a', calca: '#1a1a1c', sapato: '#0e0e10', botao: '#a8a8a0', cinto: '#2a2620', fivela: '#8a8a80', cruz: 1, ferida: 1, pele: '#d8b294', peleS: '#b89070', rosto: { estilo: 'lado', bigode: 1, velho: 1, cabelo: '#2e241c', olho: '#4a6a80', pele: '#d8b294', peleS: '#b89070' } };
const SS_PRETO = { tun: '#1c1c20', tunD: '#111114', calca: '#18181c', culote: 1, botao: '#c8c8c8', cinto: '#0a0a0c', fivela: '#b8b8b8', correia: 1, gola: '#0a0a0c', golaBorda: '#c8c8c8', ombro: '#a8a8a8', cruz: 1, fitas: 1, rosto: { estilo: 'quepe', quepe: { cor: '#1a1a1e', faixa: '#0c0c0e', vivo: '#d8d8d8', cordao: '#c8c8c8' }, cabelo: '#4a3a28' } };
const SS_PRETO2 = { ...SS_PRETO, cruz: 0, fitas: 0, rosto: { ...SS_PRETO.rosto, cabelo: '#8a6a3a', pele: '#dcb492' } };
const GENERAL = { tun: '#6a6c56', tunD: '#52543f', calca: '#5a5c48', culote: 1, faixa: '#a8382a', botao: '#d9b35a', cinto: '#2a2016', fivela: '#b8a060', gola: '#a8382a', golaBorda: '#d9b35a', ombro: '#d9b35a', cruz: 1, cavaleiro: 1, fitas: 1, rosto: { estilo: 'quepe', velho: 1, quepe: { cor: '#6a6c56', faixa: '#3e4032', vivo: '#d9b35a', cordao: '#d9b35a' }, cabelo: '#8a8a80' } };
const GENERAL2 = { ...GENERAL, cavaleiro: 0, rosto: { estilo: 'curto', velho: 1, cabelo: '#9a9a90' } };
const PARTIDO = { tun: '#8a6c42', tunD: '#6e5434', calca: '#1a1a1c', sapato: '#0e0e10', botao: '#c8a860', cinto: '#2a2016', fivela: '#b8a060', correia: 1, gola: '#a8382a', golaBorda: '#c8a860', cruz: 0, rosto: { estilo: 'curto', cabelo: '#1e1814' } };
const GOEBBELS = { ...PARTIDO, rosto: { estilo: 'curto', cabelo: '#1e1814', pele: '#d0a880', peleS: '#b08a66' } };
const SS_COSTAS = { coat: '#1c1c20', dark: '#111114', legs: '#121216', hair: '#3a2a1c' };
// soldados de 1945
const AMERICANO = { tun: '#6b6648', tunD: '#55513a', calca: '#6a604a', camisa: '#7a6e52', gravata: false, perneira: '#8a7a5a', sapato: '#4a3624', bota: '#4a3624', botao: '#4a4630', cinto: '#7a6a48', fivela: '#8a8458', cabelo: '#5a3a22', capacete: 'm1', arma: 1, rosto: { estilo: 'quepe', capacete: 'm1', cabelo: '#5a3a22' } };
const SOVIETICO = { tun: '#8a8456', tunD: '#6e6a44', calca: '#6e6a48', culote: 1, estilo: 'fechada', botao: '#b8a060', cinto: '#5a3a20', fivela: '#b8a060', capote: 1, medalhaVermelha: 1, cabelo: '#8a6a3a', capacete: 'pilotka', arma: 1, rosto: { estilo: 'quepe', capacete: 'pilotka', cabelo: '#8a6a3a', pele: '#dcb492' } };
const SOVIETICO2 = { ...SOVIETICO, capote: 0, medalhaVermelha: 0, cabelo: '#2a2018', rosto: { estilo: 'quepe', capacete: 'pilotka', cabelo: '#2a2018' } };
const ALEMAO = { tun: '#646854', tunD: '#4e5242', calca: '#5a5e4c', botaAlta: 1, botao: '#8a8a80', cinto: '#141416', fivela: '#8a8a80', correia: 1, gola: '#4a5040', cabelo: '#6a5a40', capacete: 'stahlhelm', rosto: { estilo: 'quepe', capacete: 'stahlhelm', cabelo: '#6a5a40', velho: 1 } };
const ALEMAO2 = { ...ALEMAO, rosto: { estilo: 'quepe', capacete: 'stahlhelm', cabelo: '#a8865a', pele: '#dcb492' } };
