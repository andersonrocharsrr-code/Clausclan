// ===== Personagens detalhados no estilo Recorte Dourado: planos de luz e sombra com borda reta, luz de borda dourada =====
// pracinha(x, y, s, o): pés em (x, y); altura ≈ 340·s. o.pose: 'parado' | 'anda' | 'sobe' | 'bandeira' | 'neve'; o.flip; o.t (tempo, para respirar/andar)
const PR = { pele: '#C99A6B', pele2: '#9C6C45', pele3: '#7A5034', farda: '#5E5B3B', farda2: '#47452C', farda3: '#77734C', capa: '#6A5F44', capa2: '#4E4532', capacete: '#4C5034', capacete2: '#3A3D27', capacete3: '#646A45', couro: '#5A3A1E', bota: '#2A1D12', perneira: '#9A8B62', perneira2: '#7C6F4C', madeira: '#8A5A30', madeira2: '#6A4222', metal: '#2B2F35', ouro: '#E0B25E', olho: '#1A1410' };
function membro(x0, y0, x1, y1, w0, w1, cor, cor2) { const a = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(a), ny = Math.cos(a); poly([[x0 + nx * w0, y0 + ny * w0], [x1 + nx * w1, y1 + ny * w1], [x1 - nx * w1, y1 - ny * w1], [x0 - nx * w0, y0 - ny * w0]], cor); if (cor2) poly([[x0, y0], [x1, y1], [x1 - nx * w1, y1 - ny * w1], [x0 - nx * w0, y0 - ny * w0]], cor2) }
function mao(x, y, r, a, cor = PR.pele, cor2 = PR.pele2) { c.save(); c.translate(x, y); c.rotate(a); el(0, 0, r, r * .8, cor); for (let k = 0; k < 4; k++) rr(r * .3 + k * .1, -r * .7 + k * r * .42, r * .95, r * .34, r * .17, k % 2 ? cor : cor2); rr(-r * .4, -r * 1.05, r * .7, r * .38, r * .19, cor2); c.restore() }
const el = (x, y, rx, ry, col, a = 0) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), a, 0, 7); c.fill() };
function rosto(o = {}) { // cabeça em 3/4 olhando para a direita; centro (0,0), raio ≈ 30
  const pele = o.pele || PR.pele, pele2 = o.pele2 || PR.pele2, pele3 = PR.pele3;
  rr(-10, 20, 22, 26, 6, pele2); // pescoço
  el(0, 0, 27, 33, pele); poly([[4, -30], [26, -14], [28, 10], [18, 30], [2, 34]], pele2); // plano de sombra do lado oposto à luz
  poly([[-27, -2], [-29, 12], [-20, 26], [-8, 33], [-14, 16]], pele2); // maxilar
  el(-24, 2, 7, 10, pele2); el(-24, 2, 4, 6, pele3); // orelha
  rr(6, -6, 16, 5, 2, '#F1E6D2'); el(15, -4, 3.4, 3.2, PR.olho); rr(5, -13, 19, 4, 2, o.cab || '#2A1E14'); // olho e sobrancelha
  poly([[22, -6], [33, 9], [22, 11]], pele); poly([[22, 4], [33, 9], [22, 11]], pele2); // nariz
  rr(12, 18, 15, 3, 1.5, pele3); // boca
  if (o.barba !== false) { const q = rng(7); c.fillStyle = 'rgba(60,40,25,.35)'; for (let i = 0; i < 40; i++) c.fillRect(-14 + q() * 38, 14 + q() * 18, 2, 2) }
  if (o.bigode) rr(10, 13, 20, 5, 3, o.cab || '#3A2A1C');
}
function capaceteM1(neve = 0) { // M1 americano usado pela FEB, com rede e jugular
  c.beginPath(); c.ellipse(2, -22, 40, 30, 0, Math.PI, 0); c.fillStyle = PR.capacete; c.fill(); poly([[-38, -22], [44, -22], [46, -14], [-40, -14]], PR.capacete2);
  c.save(); c.beginPath(); c.ellipse(2, -22, 40, 30, 0, Math.PI, 0); c.clip(); poly([[6, -52], [42, -22], [6, -22]], PR.capacete2); c.strokeStyle = 'rgba(30,32,20,.55)'; c.lineWidth = 2; for (let k = -40; k < 44; k += 9) { c.beginPath(); c.moveTo(k, -52); c.lineTo(k + 14, -20); c.stroke(); c.beginPath(); c.moveTo(k + 14, -52); c.lineTo(k, -20); c.stroke() } c.restore();
  poly([[-30, -40], [-10, -50], [-14, -44]], PR.capacete3); if (neve) { c.save(); c.beginPath(); c.ellipse(2, -22, 40, 30, 0, Math.PI, 0); c.clip(); c.beginPath(); c.ellipse(2, -50, 34 * neve, 12, 0, 0, 7); c.fillStyle = '#F2EEE6'; c.fill(); c.restore() } c.strokeStyle = PR.couro; c.lineWidth = 3; c.beginPath(); c.moveTo(-30, -16); c.lineTo(-18, 26); c.stroke() }
function garand(x, y, a, s = 1) { c.save(); c.translate(x, y); c.rotate(a); c.scale(s, s); poly([[-70, -6], [60, -5], [64, 5], [-60, 8], [-78, 16], [-92, 10], [-86, -4]], PR.madeira); poly([[-70, 1], [60, 0], [64, 5], [-60, 8]], PR.madeira2); rr(-20, -10, 120, 6, 2, PR.metal); rr(-10, -14, 30, 6, 2, PR.metal); rr(96, -12, 6, 10, 1, PR.metal); c.strokeStyle = '#3B2A18'; c.lineWidth = 3; c.beginPath(); c.moveTo(-60, 10); c.quadraticCurveTo(0, 26, 50, 6); c.stroke(); c.restore() }
function pracinha(x, y, s = 1, o = {}) { const pose = o.pose || 'parado', t = o.t || 0, neve = pose === 'neve', ang = pose === 'anda' || pose === 'sobe' ? Math.sin(t * 6) : 0, lean = pose === 'sobe' ? .22 : pose === 'anda' ? .06 : 0;
  c.save(); c.translate(x, y); c.scale(s * (o.flip ? -1 : 1), s); c.globalAlpha *= o.a ?? 1;
  el(0, 2, 56, 9, 'rgba(0,0,0,.35)');
  // pernas (quadril em 0,-150): coxa → joelho → canela; perneiras e botas
  const quadril = [0, -150], perna = (lado, fase) => { const ab = lado * (.18 + .22 * fase), jx = quadril[0] + Math.sin(ab) * 70 + (pose === 'sobe' ? 16 : 0), jy = quadril[1] + Math.cos(ab) * 72, px = jx + Math.sin(ab * .4) * 10 + lado * 6, py = -12;
    membro(quadril[0] + lado * 8, quadril[1], jx, jy, 17, 14, PR.farda, lado > 0 ? PR.farda2 : null); membro(jx, jy, px, py - 30, 14, 12, PR.farda, lado > 0 ? PR.farda2 : null);
    membro(jx + 1, jy + 22, px, py - 2, 13, 12, PR.perneira, PR.perneira2); for (let k = 0; k < 3; k++) linha(jx - 8 + (px - jx) * (k + 1) / 4, jy + 30 + (py - jy - 30) * (k + 1) / 4, jx + 10 + (px - jx) * (k + 1) / 4, jy + 26 + (py - jy - 30) * (k + 1) / 4, 'rgba(60,50,30,.5)', 2);
    poly([[px - 16, py - 6], [px + 30, py - 4], [px + 34, py + 10], [px - 18, py + 10]], PR.bota); rr(px - 18, py + 8, 54, 5, 2, '#140E08') };
  perna(-1, ang); perna(1, -ang);
  c.rotate(lean);
  // tronco: capote (neve) ou jaqueta com bolsos, botões, cinto, cartucheiras e cantil
  if (neve) { poly([[-46, -262], [44, -262], [58, -96], [-54, -96]], PR.capa); poly([[10, -262], [44, -262], [58, -96], [20, -96]], PR.capa2); for (let k = 0; k < 4; k++) disc(4, -240 + k * 34, 4, '#2A2418'); rr(-40, -274, 80, 22, 8, '#7A3A2A'); rr(16, -262, 18, 50, 6, '#6A3222') }
  else { poly([[-40, -262], [40, -262], [44, -148], [-44, -148]], PR.farda); poly([[8, -262], [40, -262], [44, -148], [14, -148]], PR.farda2); poly([[-40, -262], [-6, -262], [-2, -238], [-24, -232]], PR.farda3); poly([[6, -262], [36, -262], [24, -236], [2, -240]], PR.farda2);
    for (const [bx, sh] of [[-30, 0], [12, 1]]) { rr(bx, -226, 22, 28, 3, sh ? PR.farda2 : PR.farda3); rr(bx - 1, -228, 24, 9, 3, sh ? '#3C3A25' : PR.farda); disc(bx + 11, -224, 2.6, '#2A2418') } for (let k = 0; k < 4; k++) disc(-1, -248 + k * 24, 3, '#2A2418');
    rr(-46, -158, 92, 14, 4, PR.couro); rr(-6, -160, 14, 18, 3, '#B8924A'); for (let k = 0; k < 3; k++) rr(-42 + k * 15, -164, 13, 20, 3, '#4A4A2E'); el(36, -138, 14, 18, '#4C5A3A'); rr(30, -158, 12, 8, 3, '#3A4630');
    rr(-44, -262, 14, 18, 4, '#3F3E28'); el(-37, -248, 7, 8, PR.ouro); el(-37, -248, 4, 5, '#3F6B46') } // ombreira com distintivo da FEB
  // braços conforme a pose
  const ombroD = [30, -250], ombroE = [-30, -250], manga = neve ? PR.capa : PR.farda, manga2 = neve ? PR.capa2 : PR.farda2;
  if (pose === 'bandeira') { membro(...ombroD, 46, -330, 14, 12, manga, manga2); membro(...ombroE, 20, -350, 14, 12, manga); mao(48, -340, 11, -1.4); mao(22, -362, 11, -1.4) }
  else { const ex = pose === 'sobe' ? 46 : 38, ey = -196; membro(...ombroE, -10, -200, 14, 12, manga); membro(-10, -200, 30, -180, 12, 11, manga); membro(...ombroD, ex, ey, 14, 12, manga, manga2); membro(ex, ey, 54, -166, 12, 11, manga, manga2);
    garand(18, -186, pose === 'sobe' ? -.55 : -.9, .95); mao(34, -180, 10, .4); mao(56, -168, 10, .2) }
  // cabeça: rosto, capacete; cachecol na neve
  c.save(); c.translate(6, -288); c.rotate(pose === 'bandeira' ? -.2 : pose === 'sobe' ? .1 : 0); c.scale(.8, .8); rosto({barba: true}); capaceteM1(neve ? 1 : 0); c.restore();
  if (neve) { rr(-26, -268, 56, 14, 6, '#8A3A2A'); }
  // luz de borda dourada nos planos voltados para a luz (à esquerda/acima)
  c.globalAlpha *= .85; if (!neve) poly([[-40, -258], [-36, -258], [-40, -150], [-44, -150]], PR.ouro); else poly([[-46, -258], [-42, -258], [-50, -100], [-54, -100]], PR.ouro); c.restore() }
// soldado alemão (capacete Stahlhelm, uniforme cinza-campo), opcionalmente com as mãos para cima
function alemao(x, y, s = 1, o = {}) { c.save(); c.translate(x, y); c.scale(s * (o.flip ? -1 : 1), s); c.globalAlpha *= o.a ?? 1; const cz = '#5C6360', cz2 = '#454B49';
  el(0, 2, 52, 9, 'rgba(0,0,0,.35)'); membro(-8, -150, -16, -10, 17, 13, cz); membro(8, -150, 18, -10, 17, 13, cz, cz2); poly([[-34, -16], [6, -16], [8, 0], [-36, 0]], '#1E1A16'); poly([[0, -16], [42, -16], [44, 0], [-2, 0]], '#1E1A16');
  poly([[-40, -262], [40, -262], [44, -148], [-44, -148]], cz); poly([[8, -262], [40, -262], [44, -148], [14, -148]], cz2); rr(-46, -160, 92, 12, 4, '#2A2420'); for (let k = 0; k < 4; k++) disc(0, -248 + k * 24, 3, '#2A2A2A');
  if (o.rende) { membro(30, -250, 50, -330, 14, 12, cz, cz2); membro(-30, -250, -46, -330, 14, 12, cz); mao(52, -340, 11, -1.6); mao(-48, -340, 11, -1.6) } else { membro(30, -250, 40, -170, 14, 12, cz, cz2); membro(-30, -250, -38, -170, 14, 12, cz) }
  c.save(); c.translate(4, -288); c.scale(.8, .8); rosto({barba: false}); c.beginPath(); c.moveTo(-40, -6); c.lineTo(-36, -30); c.quadraticCurveTo(0, -66, 34, -30); c.lineTo(42, -10); c.lineTo(30, -12); c.lineTo(28, -22); c.lineTo(-28, -22); c.lineTo(-30, -4); c.closePath(); c.fillStyle = '#4E5552'; c.fill(); poly([[4, -50], [34, -30], [42, -10], [30, -12], [28, -22], [4, -22]], '#3C4240'); c.restore(); c.restore() }
// general (busto, ilustração): quepe com aba e galão dourado, gola com estrelas, gravata
function general(x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); const f = '#5A5838', f2 = '#45432B';
  poly([[-170, 260], [-150, 60], [-60, 10], [60, 10], [150, 60], [170, 260]], f); poly([[20, 10], [60, 10], [150, 60], [170, 260], [40, 260]], f2); poly([[-60, 10], [0, 120], [60, 10], [30, 4], [0, 60], [-30, 4]], '#E8DCC0'); poly([[-12, 40], [12, 40], [16, 140], [0, 160], [-16, 140]], '#3A3626');
  for (const sx of [-1, 1]) { poly([[sx * 30, 8], [sx * 80, 30], [sx * 40, 100]], f2); for (let k = 0; k < 3; k++) { const px = sx * (60 + k * 22), py = 40 + k * 6; c.fillStyle = PR.ouro; c.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 4 : 9, a = i * Math.PI / 5 - Math.PI / 2; c.lineTo(px + Math.cos(a) * r, py + Math.sin(a) * r) } c.fill() } }
  for (let k = 0; k < 4; k++) rr(-120 + k * 18, 140, 14, 10, 2, ['#C8553A', '#D9B35A', '#3F6B46', '#4B6A80'][k]);
  c.save(); c.translate(0, -70); c.scale(2.2, 2.2); rosto({barba: false, bigode: false, cab: '#8A8A8A'}); c.restore();
  // quepe
  el(10, -138, 92, 30, '#4A4830'); poly([[-70, -150], [80, -150], [90, -118], [-80, -118]], '#5A5838'); rr(-80, -126, 172, 14, 4, PR.ouro); poly([[-60, -112], [92, -112], [120, -92], [-40, -96]], '#1E1A12'); disc(6, -142, 14, PR.ouro); c.restore() }
