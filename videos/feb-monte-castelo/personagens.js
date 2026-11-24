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

// ===== Navio mercante detalhado (substitui o anterior): casco em planos de luz e sombra, linha d'água, vigias, convés,
// superestrutura com janelas, chaminé com faixa, mastros com cordame e paus de carga, botes salva-vidas e fumaça =====
function navio(x, y, s, inc = 0, col, o = {}) { const t = o.t || 0; c.save(); c.translate(x, y); c.rotate(inc); c.scale(s, s);
  const casco = '#2B3442', casco2 = '#1E2531', luz = '#E8DCC0', luz2 = '#C9B998', ferrugem = '#7A3B26', madeira = '#8A6A44';
  // fumaça saindo da chaminé (para trás)
  for (let i = 0; i < 7; i++) { const f = ((t * .5 + i / 7) % 1); c.globalAlpha = (1 - f) * .55; el(-10 - f * 160, -150 - f * 70, 16 + f * 30, 12 + f * 20, i % 2 ? '#6B6B6B' : '#8A8A86'); } c.globalAlpha = 1;
  // casco: proa alta à direita, popa à esquerda; plano iluminado em cima, sombra embaixo, faixa de ferrugem na linha d'água
  poly([[-200, -24], [196, -34], [224, -52], [206, 6], [180, 40], [-176, 40], [-206, 14]], casco);
  poly([[-206, 14], [206, 6], [180, 40], [-176, 40]], casco2); poly([[-198, 30], [190, 26], [180, 40], [-176, 40]], ferrugem);
  linha(-200, -22, 214, -40, '#3E4858', 4); for (let k = 0; k < 11; k++) disc(-150 + k * 30, -4 - k * .6, 3.4, '#E8C97A'); // vigias acesas
  for (let k = -180; k < 190; k += 34) linha(k, -26, k + 2, 34, 'rgba(0,0,0,.18)', 2); // chapas do casco
  // convés: escotilhas de carga
  for (const hx of [-150, -96, 70, 124]) { rr(hx, -40, 40, 12, 2, '#4A3A28'); rr(hx, -42, 40, 4, 2, madeira) }
  // mastros com paus de carga e cordame
  for (const [mx, mh] of [[-128, 120], [98, 130]]) { rr(mx - 3, -34 - mh, 6, mh, 2, '#3A3A3A'); linha(mx, -34 - mh * .7, mx + 46, -40, '#3A3A3A', 3); linha(mx, -34 - mh * .7, mx - 44, -40, '#3A3A3A', 3); c.strokeStyle = 'rgba(232,220,192,.35)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(mx, -34 - mh); c.lineTo(mx > 0 ? 214 : -200, mx > 0 ? -44 : -26); c.moveTo(mx, -34 - mh); c.lineTo(mx > 0 ? -10 : -40, -40); c.stroke() }
  // superestrutura em três andares com janelas e passadiço
  poly([[-46, -40], [44, -40], [40, -86], [-42, -86]], luz); poly([[18, -40], [44, -40], [40, -86], [16, -86]], luz2);
  poly([[-34, -86], [34, -86], [30, -118], [-30, -118]], luz); poly([[12, -86], [34, -86], [30, -118], [10, -118]], luz2); rr(-40, -124, 78, 8, 2, '#3E4858');
  for (let k = 0; k < 6; k++) rr(-38 + k * 13, -74, 8, 9, 1, '#1E2531'); for (let k = 0; k < 4; k++) rr(-24 + k * 13, -110, 8, 9, 1, '#E8C97A');
  // botes salva-vidas e turcos
  for (const bx of [-38, 22]) { el(bx, -92, 14, 5, '#D8D0BE'); linha(bx - 10, -96, bx - 10, -104, '#3A3A3A', 2); linha(bx + 10, -96, bx + 10, -104, '#3A3A3A', 2) }
  // chaminé com faixa
  poly([[-10, -124], [14, -124], [10, -168], [-8, -168]], '#2A2A2A'); rr(-9, -152, 21, 10, 1, '#B4874A'); poly([[4, -124], [14, -124], [10, -168], [4, -168]], 'rgba(0,0,0,.3)');
  // bandeira do Brasil na popa e luz de borda dourada no topo do casco
  linha(-196, -24, -196, -64, '#3A3A3A', 3); rr(-194, -64, 26, 18, 1, '#3F6B46'); poly([[-188, -55], [-181, -61], [-174, -55], [-181, -49]], '#D9B35A');
  c.globalAlpha = .8; poly([[-200, -24], [196, -34], [196, -30], [-200, -20]], '#E0B25E'); c.globalAlpha = 1; c.restore() }
// U-boat detalhado: casco charuto, torre com periscópios, canhão de convés, lemes e plano de sombra
function submarino(x, y, s, col) { c.save(); c.translate(x, y); c.scale(s, s); const a = '#4E565E', b = '#3A4148', l = '#6A737B';
  c.beginPath(); c.moveTo(-190, 0); c.quadraticCurveTo(-120, -30, 0, -28); c.quadraticCurveTo(150, -26, 196, -4); c.quadraticCurveTo(150, 22, 0, 24); c.quadraticCurveTo(-130, 22, -190, 0); c.fillStyle = a; c.fill();
  c.beginPath(); c.moveTo(-190, 0); c.quadraticCurveTo(-120, 22, 0, 24); c.quadraticCurveTo(150, 22, 196, -4); c.lineTo(196, 4); c.quadraticCurveTo(150, 30, 0, 30); c.quadraticCurveTo(-130, 28, -190, 0); c.fillStyle = b; c.fill();
  poly([[-40, -28], [34, -28], [26, -70], [-30, -70]], a); poly([[6, -28], [34, -28], [26, -70], [8, -70]], b); rr(-34, -74, 64, 6, 2, l);
  rr(-6, -110, 5, 40, 1, '#2A2E33'); rr(8, -100, 4, 30, 1, '#2A2E33'); rr(-6, -112, 12, 4, 1, '#2A2E33');
  rr(70, -40, 8, 14, 2, b); rr(60, -46, 40, 6, 2, '#2A2E33'); poly([[-196, -2], [-214, -16], [-210, 12]], b); linha(-120, -26, 140, -24, 'rgba(255,255,255,.12)', 3);
  for (let k = 0; k < 6; k++) disc(-90 + k * 30, -10, 2.4, 'rgba(0,0,0,.35)'); txt('U-507', -2, -40, 18, '#C8C2B4', {w: 700}); c.restore() }

// ===== Montanha detalhada (substitui a anterior): crista recortada, várias faces de luz e sombra, camadas de rocha,
// fendas, neve escorrendo em línguas, cascalho e pinheiros na base =====
function pinheiro(x, y, h, cor = '#1B2420', cor2 = '#141B18') { poly([[x, y - h], [x + h * .28, y - h * .45], [x + h * .16, y - h * .45], [x + h * .36, y], [x - h * .36, y], [x - h * .16, y - h * .45], [x - h * .28, y - h * .45]], cor); poly([[x, y - h], [x + h * .28, y - h * .45], [x + h * .16, y - h * .45], [x + h * .36, y], [x, y]], cor2); rr(x - h * .04, y - 2, h * .08, h * .1, 1, '#2A1E14') }
function montanha(cx, base, larg2, alt, cor = '#B4874A', neve = 0) { const q = rng(Math.round(cx * 7 + alt)), topo = [cx + larg2 * .02, base - alt];
  const escuro = '#5E4426', medio = '#8C6538', claro = cor, brilho = '#D6A866';
  // crista: pontos irregulares subindo da esquerda até o pico e descendo à direita
  const esq = [], dir = []; for (let i = 0; i <= 7; i++) { const u = i / 7; esq.push([cx - larg2 / 2 + u * (topo[0] - cx + larg2 / 2), base - alt * (u ** 1.15) + (i && i < 7 ? (q() - .5) * alt * .07 : 0)]) }
  for (let i = 1; i <= 7; i++) { const u = i / 7; dir.push([topo[0] + u * (cx + larg2 / 2 - topo[0]), base - alt * ((1 - u) ** 1.05) + (i < 7 ? (q() - .5) * alt * .08 : 0)]) }
  const silh = [...esq, ...dir]; poly(silh, medio);
  // faces: alternância de planos claros (lado da luz, à esquerda) e escuros (à direita), cada um ligando a crista à base
  for (let i = 0; i < esq.length - 1; i++) { const [x0, y0] = esq[i], [x1, y1] = esq[i + 1], bx = lerp(cx - larg2 * .45, cx - larg2 * .05, i / 7); poly([[x0, y0], [x1, y1], [bx + larg2 * .06, base], [bx - larg2 * .04, base]], i % 2 ? claro : brilho) }
  for (let i = 0; i < dir.length - 1; i++) { const [x0, y0] = dir[i], [x1, y1] = dir[i + 1], bx = lerp(cx + larg2 * .05, cx + larg2 * .45, i / 6); poly([[x0, y0], [x1, y1], [bx + larg2 * .05, base], [bx - larg2 * .03, base]], i % 2 ? escuro : '#6E4F2C') }
  poly([topo, [topo[0] + larg2 * .02, base], [topo[0] - larg2 * .06, base]], 'rgba(30,20,10,.25)'); // aresta principal
  // camadas de rocha e fendas
  c.save(); c.beginPath(); silh.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.lineTo(cx + larg2 / 2, base); c.lineTo(cx - larg2 / 2, base); c.closePath(); c.clip();
  c.strokeStyle = 'rgba(40,26,12,.35)'; c.lineWidth = 3; for (let k = 0; k < 9; k++) { const yy = base - alt * (.12 + k * .09); c.beginPath(); c.moveTo(cx - larg2 / 2, yy + 20); for (let xx = cx - larg2 / 2; xx < cx + larg2 / 2; xx += 40) c.lineTo(xx, yy + (q() - .5) * 18 + (xx - cx) * .08); c.stroke() }
  for (let k = 0; k < 7; k++) { const fx = cx + (q() - .5) * larg2 * .6, fy = base - alt * (.2 + q() * .55); poly([[fx, fy], [fx + 8, fy + 50 + q() * 60], [fx - 4, fy + 40]], 'rgba(30,20,10,.45)') }
  // neve: capa no pico com línguas escorrendo pelas canaletas
  if (neve) { const nv = `rgba(239,232,218,${neve})`, nv2 = `rgba(196,190,178,${neve})`, lim = base - alt * .72; const capa = silh.filter(([, y]) => y < lim);
    if (capa.length > 1) { const pts = [...capa]; for (let k = capa.length - 1; k >= 0; k--) { const [x, y] = capa[k]; pts.push([x + (q() - .5) * 20, Math.max(y, lim) + 20 + q() * alt * .12]) } poly(pts, nv); poly([topo, ...capa.filter(([x]) => x > topo[0]), [topo[0] + 10, lim + 40]], nv2) }
    for (let k = 0; k < 9; k++) { const lx = topo[0] + (q() - .5) * larg2 * .4, ly = lim + 10 + q() * 30, lh = 40 + q() * alt * .22; poly([[lx - 12, ly], [lx + 12, ly], [lx + 3, ly + lh]], k % 3 ? nv : nv2) } }
  c.restore();
  // cascalho e pinheiros na base
  for (let k = 0; k < 40; k++) { const px = cx + (q() - .5) * larg2 * .9, py = base - q() * alt * .12; disc(px, py, 2 + q() * 4, q() < .5 ? '#4A3620' : '#9C7646') }
  for (let k = 0; k < 14; k++) { const px = cx - larg2 / 2 + q() * larg2, ph = 40 + q() * 50; pinheiro(px, base + 6, ph) }
  return silh }
// Apeninos de fundo mais detalhados: cristas recortadas, faces de luz/sombra, neve nas pontas e mata de pinheiros na frente
function apeninos(t, base = 1350, neve = 1) { const camadas = [[base - 380, '#2A3344', '#222A38', .5], [base - 200, '#36404F', '#2B3340', .7], [base, '#4B5566', '#3A4352', 1]];
  camadas.forEach(([y, cor, cor2, f], k) => { const q = rng(20 + k); let x = -60; const pts = [[-60, H]]; while (x < W + 120) { pts.push([x, y - q() * 240 * f]); x += 70 + q() * 90 } pts.push([W + 120, H]); poly(pts, cor);
    for (let i = 1; i < pts.length - 2; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1]; if (y0 < y1) poly([[x0, y0], [x1, y1], [x1 + 20, H], [x0 + (x1 - x0) * .3, H]], cor2); else poly([[x0, y0], [x1, y1], [x1, y1 + 60], [x0 + 10, y0 + 90]], 'rgba(255,255,255,.04)');
      if (neve && y0 < y - 140 * f) { poly([[x0 - 26, y0 + 30], [x0, y0], [x0 + 30, y0 + 26], [x0 + 10, y0 + 46], [x0 + 2, y0 + 28], [x0 - 8, y0 + 50]], `rgba(239,232,218,${.85 * neve})`) } }
    if (k === 2) for (let i = 0; i < 26; i++) pinheiro(-20 + i * 44 + q() * 20, y + 40 + q() * 40, 50 + q() * 50, '#232C34', '#1A2129') }) }

// ===== Caça P-47 Thunderbolt do 1º Grupo de Aviação de Caça (vista lateral, nariz para a direita) =====
function caca(x, y, s, o = {}) { const t = o.t || 0; c.save(); c.translate(x, y); c.rotate(o.ang || 0); c.scale(s, s);
  const od = '#5B5A3A', od2 = '#46452C', od3 = '#76744C', cz = '#9AA0A3', cz2 = '#7D8487', ln = 'rgba(20,18,10,.55)';
  // escapamento: rastro de calor
  for (let i = 0; i < 5; i++) { const f = ((t * 3 + i / 5) % 1); c.globalAlpha = (1 - f) * .25; disc(60 - f * 140, 30 + f * 6, 6 + f * 14, '#3A3A3A') } c.globalAlpha = 1;
  // asa de longe (sombra atrás da fuselagem)
  poly([[-10, 18], [70, 14], [40, 4], [-30, 8]], od2);
  // estabilizador horizontal de longe
  poly([[-170, -4], [-130, -6], [-140, -12], [-180, -10]], od2);
  // fuselagem: barriga cinza, dorso oliva
  const fus = [[175, -6], [178, 18], [150, 40], [60, 44], [-60, 30], [-160, 8], [-196, 2], [-196, -10], [-150, -18], [-40, -30], [40, -36], [140, -34]];
  poly(fus, cz); c.save(); c.beginPath(); fus.forEach(([a, b], i) => i ? c.lineTo(a, b) : c.moveTo(a, b)); c.closePath(); c.clip();
  poly([[200, -60], [200, 6], [100, 12], [-60, 6], [-220, -2], [-220, -60]], od); // pintura oliva por cima
  poly([[200, -60], [200, -24], [40, -26], [-220, -12], [-220, -60]], od3); // luz no dorso
  poly([[200, 30], [200, 60], [-220, 60], [-220, 18], [-60, 30], [60, 40]], cz2); // sombra na barriga
  c.strokeStyle = ln; c.lineWidth = 1.6; [100, 30, -40, -110].forEach(px => { c.beginPath(); c.moveTo(px, -50); c.lineTo(px - 4, 60); c.stroke() }); // juntas de painéis
  for (let px = -150; px < 150; px += 12) disc(px, 2 + (px > 60 ? 4 : 0), .9, 'rgba(20,18,10,.35)'); // rebites
  c.restore();
  // capô do motor: grande e redondo, com faixa amarela e entrada de ar
  poly([[140, -34], [178, -30], [186, -6], [184, 22], [176, 40], [140, 42]], od2); rr(150, -32, 10, 72, 3, '#E2B22A'); poly([[160, 30], [186, 26], [182, 46], [158, 46]], '#2A2A22');
  c.strokeStyle = ln; c.lineWidth = 2; c.beginPath(); c.moveTo(168, -30); c.lineTo(168, 40); c.stroke();
  // escapamentos turbo
  for (let i = 0; i < 3; i++) rr(118 - i * 12, 18, 8, 5, 2, '#2A2620');
  // hélice de 4 pás girando: disco borrado + cubo + pá visível
  c.save(); c.translate(192, 8); c.beginPath(); c.ellipse(0, 0, 8, 74, 0, 0, 7); c.fillStyle = 'rgba(200,190,160,.18)'; c.fill();
  for (let k = 0; k < 2; k++) { const a = t * 47 + k * PI / 2, h = 72 * Math.cos(a); poly([[-2, 0], [4, 0], [3, h], [-3, h]], 'rgba(30,28,22,.75)'); disc(1, h, 3, '#E2B22A') }
  c.beginPath(); c.ellipse(4, 0, 14, 16, 0, -PI / 2, PI / 2); c.fillStyle = '#E2B22A'; c.fill(); c.restore();
  // cabine em bolha com moldura e piloto
  c.beginPath(); c.moveTo(20, -36); c.bezierCurveTo(24, -70, 80, -72, 96, -36); c.closePath(); c.fillStyle = 'rgba(120,150,170,.55)'; c.fill();
  c.save(); c.clip(); disc(58, -46, 11, '#3A2A1E'); rr(46, -60, 24, 12, 6, '#4A3A28'); disc(64, -48, 4, '#20262A'); poly([[30, -66], [70, -70], [60, -40], [26, -40]], 'rgba(255,255,255,.28)'); c.restore();
  c.strokeStyle = '#2E2D1E'; c.lineWidth = 3; c.beginPath(); c.moveTo(20, -36); c.bezierCurveTo(24, -70, 80, -72, 96, -36); c.stroke(); c.beginPath(); c.moveTo(70, -66); c.lineTo(66, -36); c.stroke();
  // asa de perto com flape, ailerão, metralhadoras e luz de borda
  poly([[110, 14], [-10, 20], [-40, 34], [100, 34]], od); poly([[-10, 20], [-40, 34], [10, 34], [20, 24]], od2); c.strokeStyle = ln; c.lineWidth = 1.5; c.beginPath(); c.moveTo(30, 22); c.lineTo(10, 34); c.stroke();
  for (let i = 0; i < 4; i++) rr(108, 18 + i * 3.4, 22, 2.2, 1, '#26241C'); // 4 de 8 metralhadoras .50
  linha(110, 14, -10, 20, 'rgba(240,212,138,.7)', 2);
  // trem de pouso recolhido (porta) e bombas sob a asa
  rr(30, 34, 46, 8, 4, cz2); if (o.bombas) { c.beginPath(); c.ellipse(50, 52, 30, 8, 0, 0, 7); c.fillStyle = '#3E3E30'; c.fill(); poly([[16, 52], [8, 44], [8, 60]], '#3E3E30') }
  // cauda: deriva com leme e o verde-amarelo do Brasil
  poly([[-150, -18], [-176, -78], [-196, -80], [-200, -10]], od); poly([[-186, -79], [-196, -80], [-200, -10], [-190, -10]], od2);
  rr(-200, -46, 12, 34, 2, '#00843D'); rr(-200, -46, 12, 11, 2, '#F5C518'); poly([[-150, 2], [-112, 0], [-120, 8], [-160, 10]], od3);
  // insígnia da FAB (estrela verde-amarela com círculo azul) e número do avião
  c.save(); c.translate(-60, 2); disc(0, 0, 18, '#1F3F8F'); c.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? 7 : 17, a = -PI / 2 + k * PI / 5; c.lineTo(Math.cos(a) * r, Math.sin(a) * r) } c.closePath(); c.fillStyle = '#F5C518'; c.fill(); disc(0, 0, 5, '#00843D'); c.restore();
  c.font = '800 18px Fira'; c.fillStyle = '#EFE8DA'; c.textAlign = 'center'; c.fillText(o.num || 'A1', -110, 6);
  // contorno dourado de luz no dorso
  c.strokeStyle = 'rgba(240,212,138,.55)'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-150, -18); c.lineTo(-40, -30); c.lineTo(20, -35); c.stroke(); c.beginPath(); c.moveTo(96, -36); c.lineTo(140, -34); c.lineTo(178, -30); c.stroke();
  c.restore() }

// ===== Distintivo da FEB: a cobra fumando (desenhado nas coordenadas da foto de referência, 685×840, centro 782,535) =====
function cobra(x, y, s, t, fumaca = 1) { c.save(); c.translate(x, y); c.scale(s * .407, s * .407); c.translate(-782, -535); c.lineJoin = 'round'; c.lineCap = 'round';
  const esc = [[480, 116], [1092, 116], [1128, 160], [1128, 800], [1000, 958], [560, 958], [436, 820], [436, 160]];
  c.save(); c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 40; c.shadowOffsetY = 14; poly(esc, '#C8202E'); c.restore();
  const dent = [[496, 142], [1076, 142], [1100, 172], [1100, 790], [988, 930], [572, 930], [464, 808], [464, 172]]; poly(dent, '#F2C417');
  c.save(); c.beginPath(); dent.forEach(([a, b], i) => i ? c.lineTo(a, b) : c.moveTo(a, b)); c.closePath(); c.clip();
  poly([[440, 120], [1120, 120], [1120, 282], [440, 282]], '#2A63D6'); rr(440, 282, 700, 16, 0, '#C8202E');
  poly([[440, 300], [1120, 300], [1120, 380], [440, 520]], 'rgba(255,255,255,.08)'); // brilho do esmalte
  c.restore();
  c.font = '800 120px Arial, sans-serif'; c.textAlign = 'center'; c.fillStyle = '#FFFFFF'; c.fillText('BRASIL', 790, 254);
  // corpo da cobra em S com laço embaixo
  const corpo = () => { c.beginPath(); c.moveTo(761, 881); c.bezierCurveTo(882, 872, 1000, 854, 1000, 770); c.bezierCurveTo(1000, 640, 850, 592, 700, 592); c.bezierCurveTo(520, 592, 470, 720, 560, 792); c.bezierCurveTo(650, 860, 810, 808, 830, 690); c.bezierCurveTo(852, 570, 722, 470, 722, 392); c.bezierCurveTo(722, 312, 790, 300, 840, 352) };
  const rabo = (u) => { const v = 1 - u; return [v * v * v * 612 + 3 * v * v * u * 760 + 3 * v * u * u * 1000 + u * u * u * 1000, v * v * v * 890 + 3 * v * v * u * 876 + 3 * v * u * u * 890 + u * u * u * 770] };
  for (let k = 0; k < 2; k++) { for (let i = 0; i <= 40; i++) { const u = i / 40 * .32, [px, py] = rabo(u), rr2 = 4 + 19 * Math.min(1, u / .3); disc(px, py, k ? rr2 : rr2 + 3, k ? '#3CB43C' : '#1D5E1E') }
    corpo(); c.strokeStyle = k ? '#3CB43C' : '#1D5E1E'; c.lineWidth = k ? 46 : 52; c.stroke() } 
  
  // cabeça alongada apontando para baixo à direita, boca aberta segurando o cachimbo
  const cab = (f, cor) => { c.beginPath(); f(); c.closePath(); c.fillStyle = cor; c.fill(); c.strokeStyle = '#1D5E1E'; c.lineWidth = 5; c.stroke() };
  // cabeça e cachimbo desenhados no recorte ampliado da foto (x3, origem 820,330)
  c.save(); c.translate(820, 330); c.scale(1 / 3, 1 / 3); c.lineJoin = 'round';
  c.beginPath(); c.moveTo(100, 22); c.quadraticCurveTo(230, 92, 305, 140); c.quadraticCurveTo(350, 168, 358, 205); c.lineTo(432, 395); c.quadraticCurveTo(438, 428, 410, 422); c.lineTo(336, 362); c.quadraticCurveTo(250, 310, 190, 260); c.quadraticCurveTo(128, 215, 122, 175); c.quadraticCurveTo(100, 180, 16, 110); c.fillStyle = '#3CB43C'; c.fill(); c.strokeStyle = '#1D5E1E'; c.lineWidth = 12; c.stroke();
  c.strokeStyle = '#1D5E1E'; c.lineWidth = 8; c.beginPath(); c.moveTo(240, 284); c.quadraticCurveTo(275, 312, 306, 330); c.stroke();
  c.save(); c.translate(272, 205); c.rotate(.45); c.beginPath(); c.ellipse(0, 0, 46, 32, 0, 0, 7); c.fillStyle = '#fff'; c.fill(); c.strokeStyle = '#1D5E1E'; c.lineWidth = 6; c.stroke(); c.beginPath(); c.ellipse(-4, 0, 11, 18, -.45, 0, 7); c.fillStyle = '#222'; c.fill(); c.restore();
  // cachimbo: piteira saindo da boca, descendo por cima do queixo e virando o fornilho
  c.beginPath(); c.moveTo(300, 336); c.quadraticCurveTo(312, 312, 338, 336); c.quadraticCurveTo(425, 400, 438, 470); c.lineTo(446, 560); c.quadraticCurveTo(450, 585, 470, 580); c.lineTo(515, 482);
  c.quadraticCurveTo(600, 470, 664, 545); c.quadraticCurveTo(650, 625, 560, 680); c.quadraticCurveTo(480, 700, 420, 680); c.quadraticCurveTo(392, 665, 394, 630); c.lineTo(390, 470); c.quadraticCurveTo(375, 405, 300, 336); c.closePath();
  c.fillStyle = '#E2602A'; c.fill(); c.strokeStyle = '#7A2C0E'; c.lineWidth = 9; c.stroke();
  c.beginPath(); c.ellipse(590, 513, 76, 28, .44, 0, 7); c.fillStyle = '#8A3A12'; c.fill(); c.stroke();
  poly([[405, 480], [418, 480], [420, 640], [408, 630]], 'rgba(255,220,160,.3)'); c.restore();
  // fumaça em fitas cinzas ondulando
  if (fumaca > 0) { c.lineWidth = 16; for (let k = 0; k < 3; k++) { c.globalAlpha = fumaca * (.85 - k * .2); c.strokeStyle = k ? '#C9CDD2' : '#E2E5E8'; c.beginPath(); for (let i = 0; i <= 20; i++) { const u = i / 20, yy = 492 - u * (170 + k * 20), xx = 1020 + k * 14 + sin(u * 7 - t * 4 + k) * 18 * u + u * 20; i ? c.lineTo(xx, yy) : c.moveTo(xx, yy) } c.stroke() } c.globalAlpha = 1 }
  c.restore() }
