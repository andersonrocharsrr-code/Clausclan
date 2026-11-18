// ================= Figuras: hoplitas espartanos, persas, Xerxes, Gorgo, meninos da agogê =================
// Luz vem da esquerda: o plano da esquerda é claro e o da direita é escuro (recorte de papel).
const BZ = ['#5a3a16', '#8a6128', '#b98a3e', '#e9c27a', '#fff0c8']; // bronze: sombra → brilho
function el(x, y, rx, ry, col, rot = 0) { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot, 0, 7); c.fill() }
function bezPoly(pts, col) { c.fillStyle = col; c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) { const p = pts[i]; if (p.length === 4) c.quadraticCurveTo(p[0], p[1], p[2], p[3]); else c.lineTo(p[0], p[1]) } c.closePath(); c.fill() }

// mão fechada segurando algo (dedos marcados)
function punho(x, y, r, cor = P.pele, cor0 = P.pele0) { c.save(); c.translate(x, y); rr(-r, -r * 1.1, r * 2, r * 2.2, r * .7, cor); rr(0, -r * 1.1, r, r * 2.2, r * .6, cor0); c.strokeStyle = 'rgba(80,40,20,.55)'; c.lineWidth = Math.max(1, r * .14); for (let k = -1; k <= 1; k++) { c.beginPath(); c.moveTo(-r * .9, k * r * .55); c.lineTo(r * .6, k * r * .55); c.stroke() } el(-r * .9, -r * .2, r * .4, r * .7, cor0); c.restore() }
// ---------- escudo (aspis): borda de bronze, face em faixas, lambda Λ de Esparta ----------
function aspis(x, y, r, o = {}) {
  const rx = r * (o.esq ?? 1), sym = o.sym ?? 'L', face = o.face || P.carmim;
  c.save(); c.translate(x, y); c.rotate(o.rot || 0);
  el(8, 10, rx, r, 'rgba(0,0,0,.35)');
  el(0, 0, rx, r, BZ[1]); c.save(); c.beginPath(); c.ellipse(0, 0, rx, r, 0, 0, 7); c.clip(); c.fillStyle = BZ[3]; c.fillRect(-rx, -r, rx * .9, 2 * r); c.fillStyle = BZ[4]; c.fillRect(-rx * .78, -r, rx * .16, 2 * r); c.restore(); // borda
  const k = .86; el(0, 0, rx * k, r * k, o.bronze ? BZ[2] : face);
  c.save(); c.beginPath(); c.ellipse(0, 0, rx * k, r * k, 0, 0, 7); c.clip();
  c.fillStyle = 'rgba(255,240,210,.16)'; c.beginPath(); c.ellipse(-rx * .3, -r * .3, rx * .5, r * .6, -.4, 0, 7); c.fill(); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(rx * .25, -r, rx, 2 * r);
  c.lineCap = 'round'; c.lineJoin = 'miter'; c.strokeStyle = o.bronze ? P.carmim : BZ[3]; c.lineWidth = r * .15;
  if (sym === 'L') { c.beginPath(); c.moveTo(-rx * .45, r * .48); c.lineTo(0, -r * .5); c.lineTo(rx * .45, r * .48); c.stroke() }
  else if (sym === 'clava') { c.fillStyle = BZ[3]; c.beginPath(); c.moveTo(-rx * .1, r * .55); c.lineTo(rx * .1, r * .55); c.lineTo(rx * .22, -r * .4); c.lineTo(-rx * .22, -r * .4); c.fill() }
  else if (sym === 'tridente') { c.beginPath(); c.moveTo(0, r * .55); c.lineTo(0, -r * .5); c.moveTo(-rx * .32, -r * .5); c.lineTo(-rx * .32, -r * .15); c.lineTo(rx * .32, -r * .15); c.lineTo(rx * .32, -r * .5); c.stroke() }
  else if (sym === 'olho') { el(0, 0, rx * .4, r * .22, BZ[4]); el(0, 0, rx * .16, r * .16, P.tinta) }
  else if (sym === 'estrela') { for (let i = 0; i < 8; i++) { const a = i * PI / 4; line(0, 0, cos(a) * rx * .5, sin(a) * r * .5, BZ[3], r * .09) } disc(0, 0, r * .12, BZ[4]) }
  c.restore();
  c.strokeStyle = 'rgba(40,20,6,.5)'; c.lineWidth = r * .03; c.beginPath(); c.ellipse(0, 0, rx * k, r * k, 0, 0, 7); c.stroke();
  for (let i = 0; i < 16; i++) { const a = i / 16 * 2 * PI; disc(cos(a) * rx * .93, sin(a) * r * .93, r * .022, BZ[4]) }
  c.restore();
}
// ---------- lança (dory): haste de freixo, ponta de ferro em folha, ponteira de bronze (sauroter) ----------
function dory(x0, y0, x1, y1, w = 7) {
  const a = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0);
  c.save(); c.translate(x0, y0); c.rotate(a);
  c.fillStyle = '#6e4a26'; c.fillRect(0, -w / 2, L, w); c.fillStyle = '#9a6e3e'; c.fillRect(0, -w / 2, L, w * .4);
  c.fillStyle = '#d8dde2'; c.beginPath(); c.moveTo(L - 4, -w * .9); c.quadraticCurveTo(L + w * 3, -w * 1.6, L + w * 8, 0); c.quadraticCurveTo(L + w * 3, w * 1.6, L - 4, w * .9); c.fill(); c.fillStyle = '#8a929a'; c.beginPath(); c.moveTo(L - 4, 0); c.lineTo(L + w * 8, 0); c.quadraticCurveTo(L + w * 3, w * 1.6, L - 4, w * .9); c.fill();
  c.fillStyle = BZ[2]; c.beginPath(); c.moveTo(4, -w * .8); c.lineTo(-w * 4.5, -w * .25); c.lineTo(-w * 4.5, w * .25); c.lineTo(4, w * .8); c.fill(); c.fillStyle = '#2a1a10'; c.fillRect(L * .45, -w * .6, w * 3, w * 1.2);
  c.restore();
}
// ---------- capacete coríntio de frente (centro do rosto em 0,0; raio ~34) ----------
function corintioFrente(o = {}) {
  const cr = o.crista ?? 'long', cor = o.corCrista || P.carmim, cor0 = o.corCrista0 || P.carmim0;
  if (cr === 'trans') { c.fillStyle = cor0; c.beginPath(); c.moveTo(-62, -40); c.quadraticCurveTo(-70, -96, 0, -104); c.quadraticCurveTo(70, -96, 62, -40); c.lineTo(36, -44); c.quadraticCurveTo(0, -60, -36, -44); c.fill(); c.fillStyle = cor; c.beginPath(); c.moveTo(-62, -40); c.quadraticCurveTo(-70, -96, 0, -104); c.lineTo(0, -54); c.quadraticCurveTo(-30, -52, -36, -44); c.fill(); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 2; for (let k = -5; k <= 5; k++) { c.beginPath(); c.moveTo(k * 9, -52); c.lineTo(k * 12, -98 + Math.abs(k) * 3); c.stroke() } }
  else if (cr === 'long') { c.fillStyle = cor0; c.beginPath(); c.moveTo(-12, -40); c.quadraticCurveTo(-16, -110, 0, -112); c.quadraticCurveTo(16, -110, 12, -40); c.fill(); c.fillStyle = cor; c.beginPath(); c.moveTo(-12, -40); c.quadraticCurveTo(-16, -110, 0, -112); c.lineTo(0, -40); c.fill(); c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 1.5; for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(k * 4, -44); c.quadraticCurveTo(k * 5, -80, k * 2, -108); c.stroke() } rr(-8, -50, 16, 14, 3, BZ[1]) }
  // calota
  bezPoly([[-36, 6], [-40, -30, -26, -46], [0, -52, 26, -46], [40, -30, 36, 6]], BZ[2]); bezPoly([[-36, 6], [-40, -30, -26, -46], [-6, -52, -4, -50], [-14, -20]], BZ[3]); c.fillStyle = 'rgba(255,240,200,.5)'; c.beginPath(); c.ellipse(-16, -34, 6, 10, -.5, 0, 7); c.fill();
  // bochechas: placas que descem até o queixo, com a abertura em T
  bezPoly([[-36, 0], [-38, 30], [-30, 52], [-9, 58], [-6, 20], [-4, 4], [-26, 2]], BZ[3]); bezPoly([[36, 0], [38, 30], [30, 52], [9, 58], [6, 20], [4, 4], [26, 2]], BZ[1]);
  c.fillStyle = 'rgba(255,240,200,.35)'; c.fillRect(-33, 8, 4, 36);
  // olhos (fendas amendoadas) e guarda-nariz
  for (const sx of [-1, 1]) { c.fillStyle = '#120806'; c.beginPath(); c.moveTo(sx * 4, -8); c.quadraticCurveTo(sx * 18, -16, sx * 32, -6); c.quadraticCurveTo(sx * 18, 2, sx * 4, 2); c.fill(); if (o.olhos !== false) { el(sx * 17, -5, 5, 3.2, '#e8dccb'); disc(sx * 16, -5, 2.4, o.olhoCor || '#3a2a18') } }
  poly([[-5, -10], [5, -10], [4, 26], [-4, 26]], BZ[2]); poly([[-5, -10], [0, -10], [0, 26], [-4, 26]], BZ[3]);
  c.strokeStyle = 'rgba(40,20,6,.55)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-36, 2); c.quadraticCurveTo(0, -6, 36, 2); c.stroke(); c.strokeStyle = BZ[4]; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-34, 6); c.quadraticCurveTo(-36, 30, -28, 48); c.stroke();
  // barba aparecendo pela abertura e por baixo
  c.fillStyle = o.barba || '#2a1a10'; c.beginPath(); c.moveTo(-9, 30); c.lineTo(9, 30); c.lineTo(10, 58); c.quadraticCurveTo(0, 80, -10, 58); c.fill(); c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(-2, 34, 4, 14); c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1.4; for (let k = -2; k <= 2; k++) { if (k) { c.beginPath(); c.moveTo(k * 3.5, 40); c.quadraticCurveTo(k * 4.5, 56, k * 3, 70); c.stroke() } }
  for (let k = 0; k < 9; k++) { const a = PI * (.08 + k * .105); disc(-cos(a) * 33, -sin(a) * 40 + 2, 1.6, BZ[4]) } c.strokeStyle = BZ[0]; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-30, -14); c.quadraticCurveTo(-16, -24, -3, -14); c.moveTo(30, -14); c.quadraticCurveTo(16, -24, 3, -14); c.stroke();
}
// ---------- capacete coríntio de perfil (virado para a direita; centro 0,0) ----------
function corintioPerfil(o = {}) {
  const cor = o.corCrista || P.carmim, cor0 = o.corCrista0 || P.carmim0;
  if (o.crista !== false) { c.fillStyle = cor0; c.beginPath(); c.moveTo(18, -44); c.quadraticCurveTo(10, -92, -40, -84); c.quadraticCurveTo(-70, -70, -78, -10); c.quadraticCurveTo(-56, -40, -24, -48); c.fill(); c.fillStyle = cor; c.beginPath(); c.moveTo(18, -44); c.quadraticCurveTo(10, -92, -40, -84); c.quadraticCurveTo(-60, -76, -66, -40); c.quadraticCurveTo(-40, -60, 0, -52); c.fill(); rr(-6, -56, 16, 14, 3, BZ[1]) }
  // calota + proteção da nuca (abre para trás)
  bezPoly([[34, 4], [40, -40, 0, -50], [-30, -50, -38, -18], [-42, 18], [-52, 40], [-30, 36], [-18, 18], [-8, 28], [-4, 54], [26, 56], [30, 30]], BZ[2]);
  bezPoly([[0, -50], [-30, -50, -38, -18], [-42, 18], [-52, 40], [-40, 38], [-30, 10], [-20, -30]], BZ[1]);
  bezPoly([[34, 4], [40, -40, 0, -50], [-10, -46], [16, -30], [24, 0]], BZ[3]); c.fillStyle = 'rgba(255,240,200,.5)'; c.beginPath(); c.ellipse(8, -36, 10, 5, -.3, 0, 7); c.fill();
  // olho e guarda-nariz
  c.fillStyle = '#120806'; c.beginPath(); c.moveTo(34, -8); c.quadraticCurveTo(22, -14, 8, -6); c.quadraticCurveTo(20, 2, 34, 0); c.fill(); el(26, -5, 4, 2.6, '#e8dccb'); disc(28, -5, 2, '#3a2a18');
  poly([[30, -10], [38, -8], [38, 24], [32, 24]], BZ[3]); c.strokeStyle = 'rgba(40,20,6,.55)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-8, 28); c.quadraticCurveTo(-10, 10, -18, 18); c.stroke();
  c.fillStyle = o.barba || '#2a1a10'; c.beginPath(); c.moveTo(20, 50); c.quadraticCurveTo(36, 54, 30, 74); c.quadraticCurveTo(18, 70, 12, 54); c.fill();
}
// ---------- hoplita de frente (pés em 0,0; ~470 de altura com a crista) ----------
// o.escudo: 'frente' (cobre o corpo) | 'lado' | false;  o.crista: 'long' | 'trans';  o.lanca: true/false
function hoplitaFrente(x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s); const capa = o.capa || P.carmim, capa0 = o.capa0 || P.carmim0, vento = sin(t * 1.3 + x) * 6;
  // capa atrás
  bezPoly([[-64, -332], [-98 + vento, -150], [-104 + vento, -40], [-40, -54], [0, -40], [40, -54], [104 + vento, -40], [98 + vento, -150], [64, -332]], capa0);
  bezPoly([[-64, -332], [-98 + vento, -150], [-104 + vento, -40], [-60, -50], [-40, -300]], capa); c.fillStyle = 'rgba(0,0,0,.2)'; for (const fx of [-50, 20, 70]) { c.beginPath(); c.moveTo(fx, -300); c.lineTo(fx + 12, -60); c.lineTo(fx + 26, -60); c.lineTo(fx + 8, -300); c.fill() }
  c.strokeStyle = 'rgba(0,0,0,.22)'; c.lineWidth = 2; for (const fx of [-80, -30, 46, 86]) { c.beginPath(); c.moveTo(fx * .7, -320); c.quadraticCurveTo(fx, -190, fx + vento * .6, -50); c.stroke() } c.strokeStyle = 'rgba(30,0,0,.6)'; c.lineWidth = 6; c.beginPath(); c.moveTo(-104 + vento, -44); c.lineTo(-40, -58); c.lineTo(0, -44); c.lineTo(40, -58); c.lineTo(104 + vento, -44); c.stroke();
  // pernas: coxas, grevas de bronze, sandálias
  for (const sx of [-1, 1]) {
    const lx = sx * 26; poly([[lx - 18, -200], [lx + 18, -200], [lx + 15, -112], [lx - 15, -112]], sx < 0 ? P.pele : P.pele0);
    bezPoly([[lx - 17, -118], [lx - 20, -70, lx - 13, -18], [lx + 13, -18], [lx + 20, -70, lx + 17, -118], [lx, -126]], BZ[sx < 0 ? 2 : 1]); poly([[lx - 17, -118], [lx - 4, -124], [lx - 6, -20], [lx - 13, -18]], BZ[sx < 0 ? 3 : 2]);
    c.strokeStyle = 'rgba(40,20,6,.5)'; c.lineWidth = 2; c.beginPath(); c.arc(lx, -112, 10, PI * .1, PI * .9); c.stroke(); c.beginPath(); c.moveTo(lx, -80); c.quadraticCurveTo(lx + 8 * sx, -60, lx, -40); c.stroke();
    poly([[lx - 13, -18], [lx + 13, -18], [lx + 16, -2], [lx - 16, -2]], P.pele0); rr(lx - 18, -4, 36, 8, 3, '#4a2a14'); line(lx - 12, -16, lx + 12, -8, '#4a2a14', 3); line(lx + 12, -16, lx - 12, -8, '#4a2a14', 3); line(lx - 13, -20, lx + 13, -20, '#4a2a14', 3); for (let k = -2; k <= 2; k++) disc(lx + k * 6, -4, 3, P.pele0);
    c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(lx + (sx < 0 ? 6 : -16), -196, 10, 80); el(lx, -114, 12, 9, sx < 0 ? '#d8a070' : '#a87048'); c.fillStyle = 'rgba(255,240,200,.45)'; c.fillRect(lx - 12, -112, 4, 86); for (let k = 0; k < 4; k++) disc(lx - 15, -110 + k * 26, 1.8, BZ[4]);
  }
  // quíton e ptéruges (tiras de linho)
  poly([[-56, -232], [56, -232], [62, -176], [-62, -176]], capa);
  for (let i = 0; i < 9; i++) { const px = -54 + i * 12; rr(px, -222, 11, 44, 2, i % 2 ? '#d8ccb0' : '#efe6d4'); c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(px + 7, -222, 4, 44); disc(px + 5.5, -216, 2, BZ[3]); for (let f = 0; f < 3; f++) line(px + 2 + f * 3.5, -178, px + 2 + f * 3.5, -172, '#cfc2a4', 1.4) }
  rr(-8, -236, 16, 14, 3, BZ[4]); disc(0, -229, 3, BZ[0]);
  // couraça muscular de bronze
  bezPoly([[-58, -330], [-64, -280], [-52, -226], [0, -216], [52, -226], [64, -280], [58, -330], [0, -340]], BZ[2]);
  bezPoly([[-58, -330], [-64, -280], [-52, -226], [-6, -217], [-6, -338]], BZ[3]);
  c.strokeStyle = BZ[0]; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-44, -300); c.quadraticCurveTo(-22, -284, -2, -296); c.moveTo(44, -300); c.quadraticCurveTo(22, -284, 2, -296); c.moveTo(0, -312); c.lineTo(0, -228); for (const yy of [-268, -248]) { c.moveTo(-26, yy); c.quadraticCurveTo(-12, yy + 6, 0, yy); c.quadraticCurveTo(12, yy + 6, 26, yy) } c.stroke();
  c.fillStyle = 'rgba(255,240,200,.45)'; c.beginPath(); c.ellipse(-30, -306, 12, 6, -.3, 0, 7); c.fill(); disc(-8, -232, 2.5, BZ[0]);
  rr(-60, -232, 120, 10, 3, BZ[1]); rr(-60, -232, 60, 10, 3, BZ[3]);
  // ombreiras e braços para baixo (a mão direita segura a lança)
  bezPoly([[-58, -334], [-82, -326], [-86, -290], [-60, -296]], BZ[3]); bezPoly([[58, -334], [82, -326], [86, -290], [60, -296]], BZ[1]);
  poly([[-84, -292], [-64, -294], [-70, -216], [-88, -212]], P.pele); disc(-80, -206, 11, P.pele);
  if (o.escudo !== 'frente') { poly([[84, -292], [64, -294], [70, -216], [88, -212]], P.pele0); disc(80, -206, 11, P.pele0) }
  // pescoço e cabeça
  poly([[-12, -350], [12, -350], [10, -334], [-10, -334]], P.pele0);
  c.save(); c.translate(0, -390); c.scale(1.15, 1.15); corintioFrente({ crista: o.crista ?? 'long', olhoCor: o.olhoCor, barba: o.barba }); c.restore();
  if (o.lanca !== false) { dory(-80, 30, -80, -600, 7); punho(-80, -206, 12) }
  c.fillStyle = 'rgba(0,0,0,.15)'; c.fillRect(-82, -286, 8, 60); c.strokeStyle = 'rgba(80,40,20,.4)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-86, -270); c.quadraticCurveTo(-78, -256, -86, -240); c.stroke(); rr(-90, -236, 22, 8, 3, BZ[2]);
  if (o.escudo === 'frente') aspis(40, -250, 120, { sym: o.sym ?? 'L' }); else if (o.escudo === 'lado') aspis(120, -236, 104, { sym: o.sym ?? 'L', esq: .9 });
  c.restore();
}
// ---------- hoplita de perfil (virado para a direita), marchando ou em combate ----------
// o.passo: fase da caminhada (0..1); o.lanca: 'marcha' | 'ataque' | 'baixa'
function hoplitaPerfil(x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s * (o.esq ? -1 : 1), s); const capa = o.capa || P.carmim, capa0 = o.capa0 || P.carmim0, ph = (o.passo ?? 0) * 2 * PI, sw = o.parado ? 0 : sin(ph), bob = o.parado ? 0 : Math.abs(cos(ph)) * 4;
  c.translate(0, -bob);
  // capa esvoaçando para trás
  bezPoly([[-6, -330], [-60, -250], [-96 - sw * 10, -90], [-70, -70], [-40, -120], [-14, -220]], capa0); bezPoly([[-6, -330], [-46, -250], [-70 - sw * 8, -100], [-40, -110], [-14, -220]], capa); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 2; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(-14 - k * 10, -300); c.quadraticCurveTo(-40 - k * 14, -200, -60 - k * 12 - sw * 8, -96); c.stroke() }
  // pernas (a de trás mais escura)
  const perna = (ang, cor, gr) => { c.save(); c.translate(0, -200); c.rotate(ang); poly([[-14, 0], [16, 0], [12, 92], [-12, 92]], cor); c.translate(0, 90); c.rotate(-ang * .6); bezPoly([[-12, -6], [-16, 40, -10, 84], [12, 84], [16, 30, 12, -6]], gr); poly([[-12, 84], [12, 84], [34, 92], [34, 100], [-12, 100]], '#4a2a14'); line(-10, 78, 12, 70, '#4a2a14', 3); line(-10, 70, 12, 78, '#4a2a14', 3); c.fillStyle = 'rgba(255,240,200,.4)'; c.fillRect(6, -2, 3, 76); el(2, -4, 12, 8, 'rgba(0,0,0,.15)'); for (let k = 0; k < 3; k++) disc(-11, 6 + k * 26, 1.6, BZ[4]); c.restore() };
  perna(-sw * .35, P.pele0, BZ[1]); perna(sw * .35, P.pele, BZ[2]);
  poly([[-36, -236], [38, -236], [44, -180], [-40, -180]], capa); for (let i = 0; i < 6; i++) { rr(-34 + i * 13, -226, 11, 42, 2, i % 2 ? '#d8ccb0' : '#efe6d4'); disc(-28.5 + i * 13, -220, 2, BZ[3]); c.fillStyle = 'rgba(0,0,0,.1)'; c.fillRect(-27 + i * 13, -226, 4, 42) }
  // couraça de lado
  bezPoly([[-30, -334], [-40, -280], [-34, -228], [38, -226], [42, -290], [34, -330], [0, -342]], BZ[2]); bezPoly([[0, -342], [34, -330], [42, -290], [38, -226], [14, -228], [16, -300]], BZ[3]);
  c.strokeStyle = BZ[0]; c.lineWidth = 2.5; c.beginPath(); c.moveTo(42, -290); c.quadraticCurveTo(26, -276, 32, -262); c.stroke(); rr(-36, -236, 78, 10, 3, BZ[1]);
  // braço da lança
  const lanca = o.lanca || 'marcha';
  c.save(); c.translate(-4, -322);
  if (lanca === 'ataque') { const st = (o.estoca || 0) * 34; c.rotate(-.3); poly([[-10, 0], [12, 0], [10, -70], [-8, -70]], P.pele); c.restore(); dory(-180 + st, -390, 230 + st, -330, 7); punho(20 + st, -364, 11); }
  else if (lanca === 'baixa') { poly([[-10, 0], [12, 0], [34, 70], [16, 80]], P.pele); c.restore(); dory(-130, -230, 280, -260, 7); punho(26, -248, 11) }
  else { poly([[-12, 0], [12, 0], [16, 96], [-6, 100]], P.pele); c.restore(); dory(-20, 20, 30, -620, 7); punho(6, -224, 11) }
  // cabeça
  poly([[0, -356], [18, -356], [16, -336], [0, -336]], P.pele0); c.save(); c.translate(6, -388); corintioPerfil({ crista: o.crista, corCrista: o.corCrista }); c.restore();
  // escudo no braço da frente (3/4, mostra o símbolo)
  if (o.escudo !== false) aspis(52, -262, 116, { sym: o.sym ?? 'L', esq: .62, rot: .04 });
  c.restore();
}
// ---------- Leônidas: retrato do rei sem capacete (cabelo longo, barba, capa) ----------
function leonidasRosto(t, o = {}) {
  const cab = '#2a1a10', cab1 = '#3e2818';
  bezPoly([[-70, 40], [-86, -40, -60, -96], [0, -122, 60, -96], [86, -40, 70, 40], [96, 140], [56, 120], [44, 0], [-44, 0], [-56, 120], [-96, 140]], cab);
  bezPoly([[-260, 380], [-200, 160], [-80, 120], [80, 120], [200, 160], [260, 380]], P.carmim0); bezPoly([[-260, 380], [-200, 160], [-80, 120], [-20, 380]], P.carmim);
  bezPoly([[-80, 130], [-30, 380], [30, 380], [80, 130], [0, 150]], BZ[2]); bezPoly([[-80, 130], [-30, 380], [0, 380], [0, 150]], BZ[3]); disc(-96, 150, 18, BZ[4]); disc(-96, 150, 10, BZ[1]);
  poly([[-30, 70], [30, 70], [36, 134], [-36, 134]], P.pele0);
  bezPoly([[-56, -40], [-60, 20, -44, 60], [0, 96, 44, 60], [60, 20, 56, -40], [0, -84]], P.pele); bezPoly([[0, -84], [56, -40], [60, 20, 44, 60], [0, 96]], P.pele0);
  // olhos, sobrancelhas, nariz
  for (const sx of [-1, 1]) { el(sx * 24, -18, 13, 7, '#efe4d4'); disc(sx * 22, -18, 6, '#4a3020'); disc(sx * 22, -18, 3, '#120806'); disc(sx * 20, -20, 1.6, '#fff'); line(sx * 10, -32, sx * 40, -36 + (o.bravo ? sx * 0 : 0), cab, 6) }
  c.fillStyle = 'rgba(80,40,20,.35)'; c.beginPath(); c.moveTo(-4, -20); c.lineTo(-12, 22); c.lineTo(6, 26); c.fill(); poly([[0, -20], [10, 22], [-2, 26]], P.pele0);
  // barba cheia e bigode
  bezPoly([[-52, 10], [-60, 70, -30, 120], [0, 150, 30, 120], [60, 70, 52, 10], [36, 34], [0, 40], [-36, 34]], cab); bezPoly([[0, 40], [36, 34], [52, 10], [60, 70, 30, 120], [0, 150]], cab1);
  c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 2; for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(k * 12, 50); c.quadraticCurveTo(k * 14, 90, k * 9, 130); c.stroke() }
  bezPoly([[-30, 40], [-10, 30], [0, 34], [10, 30], [30, 40], [10, 42], [0, 46], [-10, 42]], '#1a0e08'); poly([[-12, 52], [12, 52], [8, 58], [-8, 58]], '#6a2a1e');
  bezPoly([[-58, -50], [-50, -100, 0, -104], [50, -100, 58, -50], [30, -76], [0, -70], [-30, -76]], cab);
  c.strokeStyle = 'rgba(90,60,30,.5)'; c.lineWidth = 2; for (const sx of [-1, 1]) for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(sx * (60 + k * 6), -60 + k * 10); c.quadraticCurveTo(sx * (72 + k * 5), 40, sx * (64 + k * 8), 130); c.stroke() }
  for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(-40 + k * 20, -96); c.quadraticCurveTo(-30 + k * 18, -80, -46 + k * 22, -58); c.stroke() }
  el(-58, -6, 8, 16, P.pele0); el(58, -6, 8, 16, '#8a5a38'); c.strokeStyle = 'rgba(80,40,20,.35)'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-18, -50); c.lineTo(18, -50); c.moveTo(-14, -42); c.lineTo(14, -42); c.moveTo(-40, -4); c.quadraticCurveTo(-36, 10, -44, 20); c.moveTo(40, -4); c.quadraticCurveTo(36, 10, 44, 20); c.stroke();
  for (const sx of [-1, 1]) { c.strokeStyle = 'rgba(40,20,10,.6)'; c.lineWidth = 2; c.beginPath(); c.moveTo(sx * 12, -24); c.quadraticCurveTo(sx * 24, -28, sx * 36, -22); c.stroke() }
  c.fillStyle = 'rgba(255,255,255,.08)'; c.beginPath(); c.moveTo(-200, 170); c.lineTo(-120, 140); c.lineTo(-180, 380); c.lineTo(-240, 380); c.fill(); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 3; for (const fx of [-150, -110, 130, 170]) { c.beginPath(); c.moveTo(fx, 170); c.lineTo(fx * 1.2, 380); c.stroke() }
}
// ---------- Gorgo: retrato (cabelo preso, diadema, peplo) ----------
function gorgoRosto(t) {
  const cab = '#3a2214';
  bezPoly([[-60, -40], [-74, -90, -20, -112], [40, -112, 70, -80], [86, -20], [70, 30], [-70, 30]], cab); el(0, -118, 46, 30, cab);
  bezPoly([[-240, 380], [-190, 170], [-70, 130], [70, 130], [190, 170], [240, 380]], '#e9dfc8'); bezPoly([[-240, 380], [-190, 170], [-70, 130], [-10, 380]], '#f6efdc'); c.fillStyle = P.aco; c.fillRect(-240, 330, 480, 24); meandro(-230, 334, 460, 16, BZ[3]);
  disc(-120, 168, 14, BZ[3]); disc(120, 168, 14, BZ[2]);
  poly([[-24, 70], [24, 70], [30, 136], [-30, 136]], P.pele0);
  bezPoly([[-50, -40], [-54, 20, -38, 58], [0, 92, 38, 58], [54, 20, 50, -40], [0, -80]], '#d8a07a'); bezPoly([[0, -80], [50, -40], [54, 20, 38, 58], [0, 92]], '#b98060');
  for (const sx of [-1, 1]) { el(sx * 22, -14, 12, 6, '#f2e8d8'); disc(sx * 21, -14, 5.5, '#3a5a4a'); disc(sx * 21, -14, 2.6, '#120806'); disc(sx * 19, -16, 1.5, '#fff'); line(sx * 10, -28, sx * 36, -28, cab, 4); line(sx * 34, -14, sx * 38, -18, '#120806', 2) }
  poly([[0, -16], [8, 20], [-4, 22]], '#b98060'); bezPoly([[-14, 42], [0, 38], [14, 42], [0, 50]], '#a3402e');
  disc(-54, 16, 5, BZ[3]); disc(54, 16, 5, BZ[2]);
  bezPoly([[-52, -46], [-40, -90, 0, -92], [40, -90, 52, -46], [20, -66], [-20, -66]], cab);
  c.fillStyle = BZ[3]; c.beginPath(); c.moveTo(-54, -54); c.quadraticCurveTo(0, -90, 54, -54); c.lineTo(50, -46); c.quadraticCurveTo(0, -80, -50, -46); c.fill(); for (let k = -3; k <= 3; k++) disc(k * 13, -72 + Math.abs(k) * 3.4, 4, BZ[4]);
}
// ---------- menino da agogê (pés em 0,0; ~250 de altura): túnica curta, descalço, escudo de vime ----------
function menino(x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s * (o.esq ? -1 : 1), s); const ph = (o.passo ?? 0) * 2 * PI, sw = o.parado ? 0 : sin(ph);
  const perna = (a, cor, dx) => { c.save(); c.translate(dx, -110); c.rotate(a); bezPoly([[-10, 0], [10, 0], [8, 50], [9, 70], [7, 104], [-7, 104], [-8, 70], [-9, 50]], cor); el(0, 50, 8, 6, 'rgba(0,0,0,.1)'); bezPoly([[-8, 100], [8, 100], [20, 104], [22, 110], [-8, 110]], cor); c.strokeStyle = 'rgba(80,40,20,.4)'; c.lineWidth = 1.2; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(12 + k * 3, 104); c.lineTo(14 + k * 3, 110); c.stroke() } c.restore() };
  const dp = o.parado ? 9 : 0; perna(-sw * .4, P.pele0, dp); perna(sw * .4, P.pele, -dp);
  bezPoly([[-26, -202], [26, -202], [32, -150], [38, -100], [10, -96], [-10, -102], [-38, -100], [-32, -150]], o.tunica || '#8a2a1e'); poly([[2, -202], [26, -202], [32, -150], [38, -100], [10, -96]], 'rgba(0,0,0,.2)'); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 2; for (const fx of [-22, -8, 14, 26]) { c.beginPath(); c.moveTo(fx * .8, -150); c.lineTo(fx * 1.15, -102); c.stroke() } line(-30, -152, 30, -152, '#6a4a26', 4); disc(-10, -152, 3, '#a8843e'); line(-10, -150, -14, -132, '#6a4a26', 2.5); poly([[-26, -202], [-6, -202], [-14, -186]], 'rgba(0,0,0,.15)');
  poly([[30, -196], [40, -150], [34, -128], [24, -150]], P.pele0); disc(34, -124, 7, P.pele0);
  poly([[-30, -196], [-42, -130], [-30, -126], [-20, -186]], P.pele); disc(-36, -124, 8, P.pele);
  poly([[-8, -214], [8, -214], [7, -198], [-7, -198]], P.pele0);
  el(0, -236, 22, 26, P.pele); bezPoly([[0, -262], [22, -246], [22, -220], [0, -212]], P.pele0); bezPoly([[-23, -238], [-22, -262, 0, -264], [22, -262, 23, -238], [10, -252], [-10, -252]], '#2a1a10');
  el(-7, -238, 4.5, 3, '#efe4d4'); el(9, -238, 4.5, 3, '#efe4d4'); disc(9, -238, 2.2, '#2a1a10'); disc(-7, -238, 2.2, '#2a1a10'); line(-12, -246, -2, -247, '#2a1a10', 2.4); line(4, -247, 14, -246, '#2a1a10', 2.4); poly([[2, -236], [6, -226], [0, -225]], P.pele0); line(-4, -218, 6, -218, '#8a3a2a', 2); el(-22, -234, 4, 7, P.pele0); disc(-12, -228, 5, 'rgba(200,90,60,.2)'); disc(14, -228, 5, 'rgba(200,90,60,.2)'); 
  if (o.escudo !== false) { c.save(); c.translate(28, -160); el(0, 0, 34, 52, '#8a6a3a'); el(0, 0, 26, 42, '#b08a52'); c.strokeStyle = '#6a4a26'; c.lineWidth = 2; for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(k * 10, -40); c.lineTo(k * 10, 40); c.stroke() } c.restore() }
  if (o.vara) line(-36, -40, -36, -300, '#6e4a26', 6);
  c.restore();
}
// ---------- persa (Imortal), de perfil, virado para a esquerda por padrão ----------
// turbante de pano com faixa no queixo, túnica longa com bordados, calças, escudo de vime, lança com romã de ouro
function persa(x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s * (o.dir ? 1 : -1), s); const ph = (o.passo ?? 0) * 2 * PI, sw = o.parado ? 0 : sin(ph), rb = o.roupa || '#6a3a7a', rb0 = o.roupa0 || '#4a2456', fx = o.faixa || BZ[3];
  const perna = (a, cor) => { c.save(); c.translate(0, -180); c.rotate(a); poly([[-14, 0], [14, 0], [12, 170], [-12, 170]], cor); bezPoly([[-12, 168], [12, 168], [32, 174], [40, 166], [36, 184], [-12, 184]], '#5a3418'); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 2; for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(-12, 20 + k * 30); c.quadraticCurveTo(0, 30 + k * 30, 12, 20 + k * 30); c.stroke() } c.restore() };
  perna(-sw * .35, '#3a2a40'); perna(sw * .35, '#56405e');
  // túnica longa com mangas largas
  bezPoly([[-32, -330], [-48, -200], [-58, -90], [56, -90], [46, -200], [34, -330], [0, -340]], rb); bezPoly([[0, -340], [34, -330], [46, -200], [56, -90], [10, -90], [12, -300]], rb0);
  c.fillStyle = fx; c.fillRect(-56, -104, 112, 12); for (let k = 0; k < 7; k++) disc(-46 + k * 15, -98, 3.4, '#fff0c8'); c.fillRect(-3, -330, 8, 230); for (let k = 0; k < 9; k++) { const q = (k * 37) % 5; disc(-26 + (k % 3) * 14, -300 + Math.floor(k / 3) * 60 + q, 4.5, 'rgba(255,240,200,.55)') }
  rr(-36, -232, 74, 12, 4, BZ[1]); disc(0, -226, 5, BZ[4]); c.strokeStyle = 'rgba(0,0,0,.22)'; c.lineWidth = 2; for (const px of [-36, -20, 18, 34]) { c.beginPath(); c.moveTo(px * .8, -220); c.quadraticCurveTo(px, -160, px * 1.25, -94); c.stroke() } c.fillStyle = fx; for (let k = 0; k < 10; k++) c.fillRect(-56 + k * 11.5, -116, 6, 6);
  bezPoly([[-28, -320], [-50, -250], [-58, -200], [-34, -196], [-26, -250]], rb0); rr(-60, -206, 30, 12, 4, fx); punho(-44, -186, 10);
  // aljava nas costas
  if (o.aljava !== false) { c.save(); c.translate(-34, -300); c.rotate(-.35); rr(-14, -20, 28, 140, 8, '#8a5a2a'); rr(-14, -20, 12, 140, 8, '#a8743a'); for (let k = 0; k < 4; k++) line(-8 + k * 5, -20, -10 + k * 6, -52, '#e9dfc8', 3); c.restore() }
  // braço com lança (em ataque ou em marcha)
  const at = o.lanca === 'ataque', st = (o.estoca || 0) * 30;
  if (at) { dory(-160 + st, -330, 220 + st, -300, 6); disc(28 + st, -316, 11, P.pele); c.save(); c.translate(-140 + st, -332); c.fillStyle = BZ[3]; disc(0, 0, 13, BZ[3]); disc(-3, -3, 5, BZ[4]); c.restore() }
  else { dory(-10, 6, 20, -560, 6); disc(4, -230, 11, P.pele); disc(-10, 6, 14, BZ[3]); disc(-13, 3, 5, BZ[4]) }
  // cabeça: pele, barba crespa, turbante
  poly([[-4, -352], [16, -352], [14, -334], [-2, -334]], P.pele0);
  bezPoly([[-16, -404], [-20, -370, -10, -352], [24, -350], [32, -372], [30, -398], [6, -414]], P.pele); bezPoly([[24, -350], [32, -372], [30, -398], [20, -404], [18, -360]], P.pele0);
  disc(20, -384, 2.6, '#120806'); line(14, -392, 28, -394, '#1a0e08', 3); poly([[30, -382], [38, -372], [30, -370]], P.pele0);
  bezPoly([[-14, -372], [-18, -340, 0, -326], [26, -326], [34, -346], [30, -360], [10, -356]], '#1a0e08'); for (let k = 0; k < 4; k++) { c.strokeStyle = '#3a2214'; c.lineWidth = 2; c.beginPath(); c.arc(4 + k * 6, -340, 4, 0, PI); c.stroke() }
  bezPoly([[-24, -400], [-26, -440, 6, -446], [36, -440, 34, -404], [20, -400], [-4, -398]], o.turbante || '#e9dfc8'); bezPoly([[-24, -400], [-30, -360], [-20, -330], [-12, -360], [-10, -398]], o.turbante0 || '#c8bca2'); c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(-20, -424, 50, 6); c.fillRect(-18, -410, 46, 4);
  // escudo de vime (gerron)
  if (o.escudo !== false) { c.save(); c.translate(44, -240); rr(-14, -120, 40, 200, 10, '#7a5a2a'); rr(-10, -116, 32, 192, 8, '#a8843e'); c.strokeStyle = '#6a4a20'; c.lineWidth = 2; for (let k = 0; k < 14; k++) { c.beginPath(); c.moveTo(-10, -110 + k * 14); c.lineTo(22, -104 + k * 14); c.stroke() } c.restore() }
  c.restore();
}
// ---------- Xerxes no trono: coroa alta, barba quadrada, manto púrpura, cetro e flor de lótus ----------
function xerxes(x, y, s, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  // trono com pés de leão
  rr(-190, -520, 380, 520, 20, '#5a3a1a'); rr(-190, -520, 190, 520, 20, '#7a5226'); rr(-170, -500, 340, 30, 6, BZ[3]); for (const sx of [-1, 1]) { rr(sx * 150 - 20, -260, 40, 260, 8, BZ[2]); el(sx * 150, -10, 34, 20, BZ[3]) }
  // manto
  bezPoly([[-150, -40], [-120, -330], [-60, -380], [60, -380], [120, -330], [150, -40]], '#5a2a6a'); bezPoly([[0, -380], [60, -380], [120, -330], [150, -40], [20, -40]], '#3e1a4a'); c.fillStyle = BZ[3]; c.fillRect(-150, -60, 300, 18); for (let k = 0; k < 10; k++) disc(-135 + k * 30, -51, 5, BZ[4]); c.fillRect(-8, -370, 16, 320);
  for (let k = 0; k < 14; k++) disc(-100 + (k % 4) * 60 + (k % 2) * 10, -330 + Math.floor(k / 4) * 70, 6, 'rgba(233,194,122,.6)');
  // mãos: cetro (direita) e lótus (esquerda), braços para baixo segurando
  dory(-110, -40, -110, -520, 9); disc(-110, -530, 18, BZ[3]); disc(-110, -250, 16, P.pele); disc(110, -250, 16, P.pele0); line(110, -250, 130, -330, '#5d6b3a', 5); for (let k = -2; k <= 2; k++) el(130 + k * 8, -344, 6, 18, '#e9dfc8', k * .3);
  // cabeça
  poly([[-18, -400], [18, -400], [16, -376], [-16, -376]], P.pele0);
  bezPoly([[-40, -470], [-44, -420, -30, -400], [0, -396], [30, -400], [44, -420, 40, -470]], P.pele); bezPoly([[0, -396], [30, -400], [44, -420, 40, -470], [0, -470]], P.pele0);
  for (const sx of [-1, 1]) { el(sx * 16, -448, 9, 5, '#efe4d4'); disc(sx * 15, -448, 4, '#120806'); line(sx * 6, -460, sx * 28, -462, '#120806', 4) } poly([[0, -446], [8, -420], [-4, -418]], P.pele0);
  // barba longa e quadrada, cacheada
  bezPoly([[-40, -430], [-44, -330], [44, -330], [40, -430], [20, -414], [0, -410], [-20, -414]], '#140a06'); for (let r2 = 0; r2 < 5; r2++) for (let k = -3; k <= 3; k++) { c.strokeStyle = '#3a2214'; c.lineWidth = 2; c.beginPath(); c.arc(k * 11, -400 + r2 * 16, 5, 0, PI); c.stroke() }
  bezPoly([[-24, -414], [0, -420], [24, -414], [0, -408]], '#2a1a10');
  // coroa alta (kidaris) com ameias
  rr(-44, -560, 88, 92, 4, BZ[3]); rr(0, -560, 44, 92, 4, BZ[2]); for (let k = 0; k < 5; k++) rr(-44 + k * 20, -578, 12, 22, 2, BZ[3]); c.fillStyle = P.carmim; c.fillRect(-44, -520, 88, 12); for (let k = 0; k < 4; k++) disc(-30 + k * 20, -490, 6, '#5fb8b8');
  bezPoly([[-44, -470], [-56, -440], [-50, -400], [-40, -430]], '#140a06'); bezPoly([[44, -470], [56, -440], [50, -400], [40, -430]], '#140a06');
  c.restore();
}
// ---------- mulher espartana (mãe) e figuras simples ----------
function mae(x, y, s) { c.save(); c.translate(x, y); c.scale(s, s);
  bezPoly([[-44, -290], [-62, -120], [-70, 0], [70, 0], [62, -120], [44, -290], [0, -300]], '#8a5a3a'); bezPoly([[0, -300], [44, -290], [62, -120], [70, 0], [16, 0], [10, -200]], '#6a4428'); c.fillStyle = 'rgba(0,0,0,.15)'; for (const fx of [-30, -6, 20]) c.fillRect(fx, -200, 6, 200); rr(-50, -40, 100, 12, 2, P.aco);
  bezPoly([[-46, -280], [-58, -180], [-44, -140], [-34, -270]], '#7a4c30'); disc(-46, -136, 10, P.pele); bezPoly([[46, -280], [58, -180], [44, -140], [34, -270]], '#5a3a22'); disc(46, -136, 10, P.pele0);
  poly([[-10, -312], [10, -312], [9, -296], [-9, -296]], P.pele0); el(0, -336, 22, 27, P.pele); bezPoly([[0, -362], [22, -340], [20, -314], [0, -310]], P.pele0);
  disc(-8, -338, 2.4, '#120806'); disc(8, -338, 2.4, '#120806'); line(-12, -346, -4, -346, '#3a2214', 2); line(4, -346, 12, -346, '#3a2214', 2); line(-5, -322, 5, -322, '#8a3a2a', 2);
  bezPoly([[-28, -330], [-30, -372, 0, -374], [30, -372, 28, -330], [36, -290], [24, -300], [20, -350], [-20, -350], [-24, -300], [-36, -290]], '#e9dfc8'); bezPoly([[0, -374], [30, -372, 28, -330], [36, -290], [24, -300], [20, -350]], '#cfc2a4');
  c.restore() }
