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
  if (o.quepe) { c.fillStyle = cab; c.fillRect(-7.7, -5, 1.6, 3.4); c.fillRect(6.1, -5, 1.6, 3.4); const q = o.quepe; poly([[-10.4, -8.2], [-7, -14.2], [7, -14.2], [10.4, -8.2], [7.9, -6.4], [-7.9, -6.4]], q.cor); poly([[3, -14.2], [7, -14.2], [10.4, -8.2], [7.9, -6.4], [4, -6.4]], shadeHex(q.cor, .78)); c.fillStyle = q.faixa || q.cor; c.fillRect(-7.9, -7.8, 15.8, 2.4); c.fillStyle = q.vivo || '#c8c8c8'; c.fillRect(-10.2, -8.4, 20.4, .45); c.fillRect(-7.9, -5.5, 15.8, .35); c.fillStyle = q.cordao || '#c8c8c8'; c.fillRect(-7.4, -5.8, 14.8, .55); disc(0, -9.6, .9, q.cordao || '#c8c8c8'); poly([[-7.6, -5.2], [7.6, -5.2], [6.2, -3.3], [-6.2, -3.3]], '#0c0c0e'); c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(-5.6, -4.9, 6, .35) }
}
function shadeHex(hex, k) { const n = parseInt(hex.slice(1), 16); const f = v => Math.max(0, Math.min(255, Math.round(v * k))); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})` }
function cruzFerro(x, y, r) { const arm = (rot) => { c.save(); c.translate(x, y); c.rotate(rot); poly([[-r * .28, 0], [r * .28, 0], [r * .55, -r], [-r * .55, -r]], '#c8c8c8'); poly([[-r * .2, -r * .1], [r * .2, -r * .1], [r * .42, -r * .86], [-r * .42, -r * .86]], '#121214'); c.restore() }; for (let k = 0; k < 4; k++) arm(k * PI / 2); disc(x, y, r * .26, '#121214') }
// Figura fardada de frente. Pés em (x,y), altura h. Ver FARDAS abaixo.
function fardado(x, y, h, f, t = 0, o = {}) {
  const s = h / 100, tr = o.treme ? sin(t * 38) * .5 + sin(t * 23) * .35 : 0;
  c.save(); c.translate(x, y); c.scale(s, s);
  // pernas
  if (f.culote) { poly([[-13, -46], [13, -46], [15.5, -34], [10, -23], [1.8, -23], [0, -31], [-1.8, -23], [-10, -23], [-15.5, -34]], f.calca); poly([[4, -46], [13, -46], [15.5, -34], [10, -23], [5, -23]], shadeHex(f.calca, .8)); if (f.faixa) { c.fillStyle = f.faixa; c.fillRect(-15, -40, 1, 10); c.fillRect(14, -40, 1, 10) }
    for (const k of [-1, 1]) { const bx = k < 0 ? -9.8 : 1.8; c.fillStyle = '#121214'; c.fillRect(bx, -24, 8, 24); c.fillStyle = 'rgba(255,255,255,.14)'; c.fillRect(bx + 1.2, -22, 1.2, 20) } }
  else { poly([[-12, -46], [12, -46], [11, -2], [1.6, -2], [0, -30], [-1.6, -2], [-11, -2]], f.calca); poly([[4, -46], [12, -46], [11, -2], [5, -2]], shadeHex(f.calca, .8)); c.fillStyle = '#0e0e10'; c.fillRect(-12.5, -2.5, 11, 2.5); c.fillRect(1.5, -2.5, 11, 2.5) }
  c.save(); c.translate(0, o.curvado ? 2 : 0);
  // braços
  poly([[-13.5, -83], [-17.6, -79.5], [-19.6, -48], [-15.6, -47], [-14.4, -74]], f.tun); poly([[13.5, -83], [17.6, -79.5], [19.6, -48], [15.6, -47], [14.4, -74]], f.tunD);
  c.fillStyle = shadeHex(f.tun, .85); c.fillRect(-19.8, -51, 4.4, 2.4); c.fillStyle = shadeHex(f.tunD, .85); c.fillRect(15.4, -51, 4.4, 2.4);
  for (const k of [-1, 1]) { c.save(); c.translate(k * 17.7 + (k > 0 ? tr : 0), -45.5); disc(0, 0, 2.6, f.pele || '#d6ad88'); c.fillStyle = f.peleS || '#b88d68'; c.fillRect(-2, .8, 4, 2.8); c.fillRect(k > 0 ? 1 : -1.9, -1.2, .9, 3.4); c.restore() }
  // túnica
  poly([[-6, -85.2], [-13.5, -83.4], [-15.6, -79.6], [-15.2, -62], [-14, -51], [-15.4, -40], [15.4, -40], [14, -51], [15.2, -62], [15.6, -79.6], [13.5, -83.4], [6, -85.2]], f.tun); poly([[4.5, -84.8], [13.5, -83.4], [15.6, -79.6], [15.2, -62], [14, -51], [15.4, -40], [5, -40]], f.tunD);
  poly([[-5.5, -84], [5.5, -84], [0, -71]], '#ece6da'); c.fillStyle = '#121214'; c.fillRect(-.8, -82, 1.6, 9); poly([[-1.2, -82.8], [1.2, -82.8], [.8, -81], [-.8, -81]], '#121214');
  poly([[-5.5, -84], [-8, -84], [-1, -66], [0, -71]], shadeHex(f.tun, 1.12)); poly([[5.5, -84], [8, -84], [1, -66], [0, -71]], shadeHex(f.tunD, 1.12));
  if (f.gola) { poly([[-7.4, -83.2], [-4.6, -83.2], [-3.6, -79.6], [-5.6, -79.6]], f.gola); poly([[7.4, -83.2], [4.6, -83.2], [3.6, -79.6], [5.6, -79.6]], f.gola); if (f.golaBorda) { c.strokeStyle = f.golaBorda; c.lineWidth = .3; c.beginPath(); c.moveTo(-7.4, -83.2); c.lineTo(-5.6, -79.6); c.lineTo(-3.6, -79.6); c.moveTo(7.4, -83.2); c.lineTo(5.6, -79.6); c.lineTo(3.6, -79.6); c.stroke() } }
  if (f.ombro) { poly([[-14.8, -82.6], [-9, -84.6], [-8.6, -82.6], [-14.4, -80.4]], f.ombro); poly([[14.8, -82.6], [9, -84.6], [8.6, -82.6], [14.4, -80.4]], f.ombro) }
  c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = .45; for (const [px, py, pw, ph] of [[-11.5, -74, 7, 6.5], [4.5, -74, 7, 6.5], [-12.5, -57, 8, 9], [4.5, -57, 8, 9]]) { c.strokeRect(px, py, pw, ph); c.beginPath(); c.moveTo(px, py + 1.8); c.lineTo(px + pw, py + 1.8); c.stroke() }
  for (const by of [-68, -61, -54, -44]) disc(.9, by, .75, f.botao || '#c8c8c8');
  c.fillStyle = f.cinto || '#141416'; c.fillRect(-14.2, -50.5, 28.4, 3.4); c.fillStyle = f.fivela || '#a8a8a8'; c.fillRect(-2.2, -51.2, 4.4, 4.8); c.fillStyle = f.cinto || '#141416'; c.fillRect(-1.2, -50.2, 2.4, 2.8);
  if (f.correia) { c.save(); c.strokeStyle = f.cinto || '#141416'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(9.5, -82); c.lineTo(-11, -50); c.stroke(); c.restore() }
  if (f.fitas) { const cols = ['#121214', '#f2ece0', '#a8382a', '#3a5a3a', '#d9b35a']; for (let k = 0; k < 5; k++) { c.fillStyle = cols[k]; c.fillRect(4.6 + k * 1.3, -77.6, 1.3, 1.6) } }
  if (f.cruz) cruzFerro(8, -66.4, 2.5);
  if (f.ferida) { c.fillStyle = '#121214'; c.beginPath(); c.ellipse(8, -59.5, 1.7, 2.1, 0, 0, 7); c.fill(); c.strokeStyle = '#8a8a8a'; c.lineWidth = .35; c.stroke() }
  if (f.cavaleiro) { c.strokeStyle = '#a8382a'; c.lineWidth = .7; c.beginPath(); c.moveTo(-2.4, -83); c.lineTo(0, -77); c.lineTo(2.4, -83); c.stroke(); cruzFerro(0, -74.6, 2.2) }
  c.translate(0, -91 + (o.curvado ? 2.6 : 0)); c.scale(.62, .62); rosto(f.rosto);
  c.restore(); c.restore();
}
// Eva Braun: vestido preto de seda, cabelo claro
function mulher(x, y, h, o, t = 0) {
  const s = h / 100; c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = '#d6ad88'; c.fillRect(-6, -24, 3.6, 20); c.fillRect(2.4, -24, 3.6, 20); c.fillStyle = '#0e0e10'; c.fillRect(-7, -4, 5.4, 4); c.fillRect(1.6, -4, 5.4, 4);
  poly([[-12, -80], [12, -80], [15, -60], [11, -48], [17, -24], [-17, -24], [-11, -48], [-15, -60]], o.vestido); poly([[3, -80], [12, -80], [15, -60], [11, -48], [17, -24], [5, -24]], shadeHex(o.vestido, .7));
  c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = .5; for (const k of [-6, 0, 6]) { c.beginPath(); c.moveTo(k * .6, -46); c.quadraticCurveTo(k, -36, k * 1.4, -25); c.stroke() }
  poly([[-12, -80], [-16, -76], [-17, -50], [-13.5, -49], [-12.4, -72]], o.vestido); poly([[12, -80], [16, -76], [17, -50], [13.5, -49], [12.4, -72]], shadeHex(o.vestido, .7));
  disc(-15.2, -47.5, 2.3, '#d6ad88'); disc(15.2, -47.5, 2.3, '#c8a07c'); poly([[-4.6, -80.4], [4.6, -80.4], [0, -75]], '#d6ad88');
  c.translate(0, -90); c.scale(.6, .6); rosto({ estilo: 'mulher', cabelo: o.cabelo || '#b8945a', pele: '#e0b896', peleS: '#c49a76', olho: '#4a6a80' });
  c.restore();
}
const HITLER_F = { tun: '#6e7058', tunD: '#55574a', calca: '#1a1a1c', botao: '#a8a8a0', cinto: '#2a2620', fivela: '#8a8a80', cruz: 1, ferida: 1, pele: '#d8b294', peleS: '#b89070', rosto: { estilo: 'lado', bigode: 1, velho: 1, cabelo: '#2e241c', olho: '#4a6a80', pele: '#d8b294', peleS: '#b89070' } };
const SS_PRETO = { tun: '#1c1c20', tunD: '#111114', calca: '#18181c', culote: 1, botao: '#c8c8c8', cinto: '#0a0a0c', fivela: '#b8b8b8', correia: 1, gola: '#0a0a0c', golaBorda: '#c8c8c8', ombro: '#a8a8a8', cruz: 1, fitas: 1, rosto: { estilo: 'quepe', quepe: { cor: '#1a1a1e', faixa: '#0c0c0e', vivo: '#d8d8d8', cordao: '#c8c8c8' }, cabelo: '#4a3a28' } };
const SS_PRETO2 = { ...SS_PRETO, cruz: 0, fitas: 0, rosto: { ...SS_PRETO.rosto, cabelo: '#8a6a3a', pele: '#dcb492' } };
const GENERAL = { tun: '#6a6c56', tunD: '#52543f', calca: '#5a5c48', culote: 1, faixa: '#a8382a', botao: '#d9b35a', cinto: '#2a2016', fivela: '#b8a060', gola: '#a8382a', golaBorda: '#d9b35a', ombro: '#d9b35a', cruz: 1, cavaleiro: 1, fitas: 1, rosto: { estilo: 'quepe', velho: 1, quepe: { cor: '#6a6c56', faixa: '#3e4032', vivo: '#d9b35a', cordao: '#d9b35a' }, cabelo: '#8a8a80' } };
const GENERAL2 = { ...GENERAL, cavaleiro: 0, rosto: { estilo: 'curto', velho: 1, cabelo: '#9a9a90' } };
const PARTIDO = { tun: '#8a6c42', tunD: '#6e5434', calca: '#1a1a1c', botao: '#c8a860', cinto: '#2a2016', fivela: '#b8a060', correia: 1, gola: '#a8382a', golaBorda: '#c8a860', cruz: 0, rosto: { estilo: 'curto', cabelo: '#1e1814' } };
const GOEBBELS = { ...PARTIDO, rosto: { estilo: 'curto', cabelo: '#1e1814', pele: '#d0a880', peleS: '#b08a66' } };
const SS_COSTAS = { coat: '#1c1c20', dark: '#111114', legs: '#121216', hair: '#3a2a1c' };
