// ================= Outras partes de Londres: cada cena com um lugar diferente =================
function quad(a, b, c2, d, col) { poly([a, b, c2, d], col) }
// árvore: tronco com galhos e copa em três tons (luz à esquerda); o.nua = sem folhas
function arvore(x, y, h, t, o = {}) {
  const q = rng(o.seed || (x | 0)), sw = sin(t * .8 + x) * 3, tr = o.tronco || '#2a2018';
  c.save(); c.translate(x, y); poly([[-h * .05, 0], [h * .05, 0], [h * .025, -h * .55], [-h * .025, -h * .55]], tr); poly([[0, 0], [h * .05, 0], [h * .025, -h * .55], [0, -h * .55]], 'rgba(0,0,0,.25)');
  for (let k = 0; k < 5; k++) { const a = -PI / 2 + (q() - .5) * 1.6, L = h * (.25 + q() * .2), y0 = -h * (.35 + q() * .2); line(0, y0, cos(a) * L + sw, y0 + sin(a) * L, tr, h * .018) }
  if (!o.nua) { const cores = o.cores || ['#1e2a22', '#2a3a2e', '#3a4c3c']; for (let k = 0; k < 3; k++) for (let i = 0; i < 9; i++) { const a = q() * 2 * PI, r = q() * h * .3, cx = cos(a) * r * 1.2 + sw * (k + 1) * .5 - k * h * .03, cy = -h * .72 + sin(a) * r * .8 - k * h * .03; el(cx, cy, h * (.13 + q() * .08), h * (.1 + q() * .06), cores[k]) } }
  c.restore();
}
// grade de ferro com pontas de lança
function grade(x0, x1, y, h, cor = '#141414') { line(x0, y - h, x1, y - h, cor, 4); line(x0, y - 10, x1, y - 10, cor, 4); for (let x = x0; x <= x1; x += 16) { line(x, y, x, y - h - 8, cor, 3); poly([[x - 4, y - h - 8], [x, y - h - 20], [x + 4, y - h - 8]], cor) } }
function poste(x, y, h, t) { lampiao(x, y, h, t, 1) }

// 1) rua em perspectiva: fachadas dos dois lados fugindo para o domo de São Paulo
function ruaPerspectiva(t, o = {}) {
  ceu(t, 'nevoa', { sx: 960, sy: 300, sr: 50 }); const VX = 960, VY = 560, P = (X, Y, z) => [VX + X / z, VY + Y / z];
  c.save(); c.globalAlpha = .7; stPauls(VX, VY + 20, .55, '#3a423e'); c.restore(); nevoa(t, 500, .4);
  c.fillStyle = '#2e2e2a'; poly([P(-760, 520, 1), P(760, 520, 1), P(760, 520, 30), P(-760, 520, 30)], '#34352f'); for (let z = 1.2; z < 20; z *= 1.25) { line(...P(-760, 520, z), ...P(760, 520, z), 'rgba(0,0,0,.18)', 2 / z * 3) }
  for (const sd of [-1, 1]) {
    poly([P(sd * 760, 520, 1), P(sd * 1100, 520, 1), P(sd * 1100, 520, 30), P(sd * 760, 520, 30)], '#4a4a44');
    const q = rng(sd > 0 ? 3 : 7); let z = 1;
    while (z < 26) { const z1 = z * (1.35 + q() * .3), hb = 900 + q() * 600, cor = [F.tijolo, '#4e3a2e', '#6a6458', F.tijolo2, '#3a3a36'][(q() * 5) | 0];
      quad(P(sd * 1100, 520, z), P(sd * 1100, -hb, z), P(sd * 1100, -hb, z1), P(sd * 1100, 520, z1), cor); quad(P(sd * 1100, 520, z), P(sd * 1100, -hb, z), P(sd * 1100, -hb, z1), P(sd * 1100, 520, z1), sd < 0 ? 'rgba(255,240,220,.04)' : 'rgba(0,0,0,.18)');
      quad(P(sd * 1100, -hb, z), P(sd * 1100, -hb - 40, z), P(sd * 1100, -hb - 40, z1), P(sd * 1100, -hb, z1), '#8e8676');
      for (let f = 0; f < Math.floor((hb - 250) / 210); f++) for (let w = 0; w < 3; w++) { const za = z + (z1 - z) * (.2 + w * .28), zb = za + (z1 - z) * .14, y0 = -hb + 120 + f * 210, lit = q() < .2; quad(P(sd * 1100, y0, za), P(sd * 1100, y0 + 120, za), P(sd * 1100, y0 + 120, zb), P(sd * 1100, y0, zb), lit ? 'rgba(232,166,64,.75)' : '#16181a') }
      quad(P(sd * 1100, 520, z), P(sd * 1100, 300, z), P(sd * 1100, 300, z1), P(sd * 1100, 520, z1), '#1e2420'); quad(P(sd * 1100, 300, z), P(sd * 1100, 250, z), P(sd * 1100, 250, z1), P(sd * 1100, 300, z1), [ '#2f4a3e', '#5a2e24', '#2a2e3a'][(q() * 3) | 0]);
      quad(P(sd * 1100, 500, z + (z1 - z) * .1), P(sd * 1100, 330, z + (z1 - z) * .1), P(sd * 1100, 330, z + (z1 - z) * .7), P(sd * 1100, 500, z + (z1 - z) * .7), o.noite ? 'rgba(232,166,64,.5)' : 'rgba(150,160,150,.22)');
      z = z1 }
    for (const zz of [1.3, 2, 3.2, 5, 8]) { const [lx, ly] = P(sd * 800, 520, zz); lampiao(lx, ly, 330 / zz, t, o.noite ? 1 : 0) }
  }
  nevoa(t, 620, .25);
}
// 2) colina com bosque olhando a cidade lá embaixo (a cidade cresce: o.cresce 0..1)
function colinaBosque(t, o = {}) {
  ceu(t, 'nevoa', { sx: 1500, sy: 240 }); c.save(); c.translate(0, (1 - (o.cresce ?? 1)) * 200); skyline(640, t, { cor: '#3a423e', cor2: '#465048', sps: .8, chamines: 5 + Math.round((o.cresce ?? 1) * 8) }); c.restore(); nevoa(t, 600, .35);
  c.fillStyle = '#2e3a2c'; c.beginPath(); c.moveTo(0, 760); c.quadraticCurveTo(700, 640, W, 780); c.lineTo(W, H); c.lineTo(0, H); c.fill(); c.fillStyle = '#26301f'; c.beginPath(); c.moveTo(0, 860); c.quadraticCurveTo(900, 760, W, 900); c.lineTo(W, H); c.lineTo(0, H); c.fill();
  c.fillStyle = '#5a5440'; c.beginPath(); c.moveTo(700, H); c.quadraticCurveTo(900, 860, 1100, 760); c.lineTo(1140, 764); c.quadraticCurveTo(980, 880, 900, H); c.fill();
  for (const [x, y, h] of [[120, 900, 520], [300, 860, 380], [1560, 880, 440], [1760, 920, 560], [1380, 820, 300], [480, 820, 260]]) arvore(x, y, h, t);
  rr(1200, 860, 140, 16, 3, '#3a2a1a'); line(1210, 876, 1210, 910, '#2a1a10', 6); line(1330, 876, 1330, 910, '#2a1a10', 6);
}
// 3) mar de telhados de ardósia com chaminés (vista do alto)
function telhados(t, o = {}) {
  ceu(t, o.ceu || 'amarelo', { sx: 1500, sy: 200 }); skyline(380, t, { cor: '#2a2a22', cor2: '#3a3a2c', sps: .6, chamines: 10 });
  for (let r = 0; r < 7; r++) { const y = 420 + r * r * 14 + r * 40, s = .45 + r * .2, q = rng(r + 3); for (let x = -100 + (r % 2) * 60 * s; x < W + 100; x += 230 * s) { const w = 220 * s, h = 90 * s, cor = ['#2e3438', '#363c40', '#2a2e32'][(q() * 3) | 0]; tijolos(x, y, w, 260 * s, ['#4a2a22', '#5a3426', '#3e261e'][(q() * 3) | 0], s); for (let k = 0; k < 2; k++) janela(x + w * (.2 + k * .45), y + 50 * s, 30 * s, 46 * s, q() < .15 ? 1 : 0, t); poly([[x - 8, y], [x + w / 2, y - h], [x + w + 8, y]], cor); poly([[x + w / 2, y - h], [x + w + 8, y], [x + w / 2, y]], 'rgba(0,0,0,.2)'); c.strokeStyle = 'rgba(0,0,0,.2)'; c.lineWidth = 1; for (let k = 1; k < 5; k++) { c.beginPath(); c.moveTo(x - 8 + k * w / 10, y - k * h / 5); c.lineTo(x + w + 8 - k * w / 10, y - k * h / 5); c.stroke() } if (q() < .6) { const cx = x + w * (.25 + q() * .5); tijolos(cx - 16 * s, y - h - 40 * s, 32 * s, 60 * s, '#4a2a22', s); for (let p = 0; p < 3; p++) rr(cx - 14 * s + p * 10 * s, y - h - 56 * s, 7 * s, 18 * s, 2, '#6a4a3a'); if (q() < .5) fumaca(cx, y - h - 60 * s, 200 * s, t, (x * 7 + r) | 0, '40,40,36', 1, .55) } } }
}
// 4) ponte de pedra sobre o Tâmisa (arcos, pilares com quebra-mar, balaustrada, lampiões) com tráfego em cima
function ponte(t, o = {}) {
  ceu(t, 'nevoa', { sx: 1500, sy: 220 }); skyline(470, t, { cor: '#353c38', cor2: '#424a44', sps: .6, spx: 1500 }); nevoa(t, 460, .3); tamisa(560, t);
  const y = 560; c.fillStyle = '#5e5a50'; c.fillRect(-20, y - 30, W + 40, 100); c.fillStyle = '#6e6a5e'; c.fillRect(-20, y - 30, W + 40, 16);
  for (let k = 0; k < 6; k++) { const ax = -40 + k * 380, aw = 300; c.fillStyle = '#5e5a50'; c.fillRect(ax + aw, y + 60, 80, 260); poly([[ax + aw, y + 300], [ax + aw + 40, y + 340], [ax + aw + 80, y + 300]], '#4e4a42'); c.fillStyle = '#1a2220'; c.beginPath(); c.moveTo(ax, y + 320); c.lineTo(ax, y + 160); c.ellipse(ax + aw / 2, y + 160, aw / 2, 100, 0, PI, 0); c.lineTo(ax + aw, y + 320); c.fill(); c.strokeStyle = '#4a463e'; c.lineWidth = 10; c.beginPath(); c.ellipse(ax + aw / 2, y + 160, aw / 2 + 6, 106, 0, PI, 0); c.stroke(); for (let j = 0; j < 9; j++) { const a = PI + j * PI / 8; line(ax + aw / 2 + cos(a) * (aw / 2), y + 160 + sin(a) * 100, ax + aw / 2 + cos(a) * (aw / 2 + 14), y + 160 + sin(a) * 114, '#3a362e', 2) } }
  tijolos(-20, y - 30, W + 40, 90, '#5e5a50', .9); c.fillStyle = 'rgba(0,0,0,.15)'; c.fillRect(-20, y + 30, W + 40, 30);
  if (o.trafego) o.trafego(y - 30); for (let x = 0; x < W; x += 24) rr(x, y - 70, 10, 40, 3, '#6e6a5e'); rr(-20, y - 78, W + 40, 12, 2, '#7e7a6e'); for (let x = 100; x < W; x += 380) lampiao(x, y - 70, 160, t, o.noite ? 1 : 0);
  barcaca(lerp(200, 1600, (t * .02) % 1), 920, .8, t); rr(0, 1000, W, 80, 0, '#3a3a34'); for (let x = 60; x < W; x += 300) rr(x, 960, 30, 50, 6, '#1a1a18');
}
// 5) mercado coberto: pórtico de colunas, telhado de vidro e barracas com toldo listrado
function mercado(t) {
  ceu(t, 'nevoa', { sol: false }); const y = 720; c.fillStyle = 'rgba(170,180,170,.3)'; c.fillRect(200, 200, 1520, 260); c.strokeStyle = 'rgba(30,34,34,.8)'; c.lineWidth = 3; for (let x = 200; x <= 1720; x += 40) { c.beginPath(); c.moveTo(x, 200); c.lineTo(x, 460); c.stroke() }
  rr(160, 420, 1600, y - 420, 0, '#8e8878'); rr(160, 420, 1600, 30, 0, '#a8a290'); poly([[700, 420], [960, 300], [1220, 420]], '#a8a290'); poly([[960, 300], [1220, 420], [960, 420]], '#8e8878'); txt('MARKET', 960, 405, 34, '#3a3a30', { align: 'center' });
  for (let k = 0; k < 10; k++) { const cx = 220 + k * 165; c.fillStyle = bands(cx - 22, 0, cx + 22, 0, [[.35, '#d8d0bc'], [.7, '#b8b0a0'], [1, '#8e8878']]); c.fillRect(cx - 22, 450, 44, y - 450); rr(cx - 28, 450, 56, 14, 2, '#c8c0ac') } c.fillStyle = 'rgba(20,20,18,.55)'; c.fillRect(160, 470, 1600, y - 470);
  for (let k = 0; k < 5; k++) { const sx = 160 + k * 340, q = rng(k + 9); rr(sx, y - 20, 280, 120, 4, '#4a3a2a'); for (let s = 0; s < 7; s++) poly([[sx - 10 + s * 43, y - 120], [sx - 10 + (s + 1) * 43, y - 120], [sx - 10 + (s + 1) * 43, y - 80], [sx - 10 + s * 43, y - 80]], s % 2 ? '#2f4a3e' : '#d8ccb0'); line(sx, y - 80, sx, y - 20, '#2a2018', 6); line(sx + 280, y - 80, sx + 280, y - 20, '#2a2018', 6); for (let i = 0; i < 9; i++) disc(sx + 26 + i * 28, y - 30 - (i % 2) * 14, 14, ['#3a5a2a', '#7a2a1e', '#8a6a2a', '#5a6a3a'][(q() * 4) | 0]); rr(sx + 20, y + 30, 70, 50, 4, '#6e5634'); rr(sx + 190, y + 30, 70, 50, 4, '#8a6e44') }
  rr(0, y + 100, W, H, 0, '#34352f');
}
// 6) praça georgiana à noite: casas iguais (térreo de estuque claro), jardim com árvores atrás da grade
function pracaNoite(t) {
  ceu(t, 'noite', { sx: 1600, sy: 180, sr: 46 }); const base = 640;
  for (let k = 0; k < 8; k++) { const x = -40 + k * 250; tijolos(x, base - 520, 250, 520, '#3e2a22'); rr(x, base - 160, 250, 160, 0, '#b8b0a0'); for (let j = 0; j < 4; j++) rr(x, base - 160 + j * 40, 250, 3, 0, 'rgba(0,0,0,.15)'); for (let f = 0; f < 3; f++) for (let w = 0; w < 3; w++) janela(x + 30 + w * 75, base - 480 + f * 110, 40, 70, (k + f + w) % 4 === 0 ? 1 : 0, t); rr(x + 100, base - 130, 50, 130, 3, '#14181a'); c.fillStyle = '#d8d0bc'; c.beginPath(); c.arc(x + 125, base - 130, 25, PI, 0); c.fill(); rr(x - 4, base - 530, 258, 14, 2, '#8e8676') }
  rr(0, base, W, 60, 0, '#4a4a44'); rr(0, base + 60, W, H, 0, '#2a2e26'); for (const [x, h] of [[200, 420], [620, 480], [1050, 400], [1500, 460], [1820, 380]]) arvore(x, 900, h, t, { cores: ['#141c16', '#1e2a20', '#2a382c'] }); grade(-10, W + 10, 960, 90); for (const x of [120, 760, 1400]) lampiao(x, 980, 300, t, 1); escuro(.15);
}
// 7) viaduto de tijolo com arcos (lojas embaixo) e trem passando em cima
function viaduto(t, o = {}) {
  ceu(t, 'nevoa', { sol: false }); skyline(420, t, { cor: '#353c38', cor2: '#424a44', stpauls: false, chamines: 6 }); const y = 460;
  tijolos(-20, y, W + 40, 300, '#4a2c22'); rr(-20, y - 20, W + 40, 24, 2, '#3a2018');
  for (let k = 0; k < 6; k++) { const ax = 30 + k * 330; c.fillStyle = '#121414'; c.beginPath(); c.moveTo(ax, y + 300); c.lineTo(ax, y + 140); c.arc(ax + 130, y + 140, 130, PI, 0); c.lineTo(ax + 260, y + 300); c.fill(); c.strokeStyle = '#6a4a36'; c.lineWidth = 10; c.beginPath(); c.arc(ax + 130, y + 140, 136, PI, 0); c.stroke(); if (k % 2 === 0) { rr(ax + 20, y + 180, 220, 120, 2, 'rgba(232,166,64,.45)'); rr(ax + 10, y + 160, 240, 26, 2, '#2f4a3e'); txt(['COFFEE', 'SMITH', 'COAL'][k / 2], ax + 130, y + 180, 20, '#d8c890', { align: 'center' }) } }
  if (o.trem !== false) { c.save(); c.translate(0, y - 20); locomotiva(lerp(-600, 2600, (t * .05) % 1), 0, .4, t, { vagoes: 4 }); c.restore() }
  rua(760, t, { pocas: true });
}
// 8) cais do Tâmisa (embankment): muro de granito, postes ornamentados, plátanos, banco de ferro
function cais(t, o = {}) {
  ceu(t, o.ceu || 'amarelo', { sol: false }); skyline(500, t, { cor: '#4a4632', cor2: '#585240', stpauls: false, chamines: 8 }); tamisa(560, t, { c1: '#5a5638', c2: '#3a3826' }); barcaca(600, 640, .7, t); navioVapor(1400, 650, .4, t);
  rr(0, 700, W, 90, 0, '#7a766a'); for (let x = 0; x < W; x += 120) rr(x, 700, 116, 44, 2, '#8a867a'); rr(0, 690, W, 14, 0, '#9a968a'); rr(0, 790, W, H, 0, '#4a4840');
  for (const x of [180, 700, 1220, 1740]) arvore(x, 790, 480, t, { cores: ['#3a3e2a', '#4a4e34', '#5a5e40'] });
  for (const x of [440, 960, 1480]) { line(x, 760, x, 520, '#1a1e1a', 12); el(x, 760, 26, 12, '#1a1e1a'); for (const sx of [-1, 1]) { line(x, 560, x + sx * 50, 540, '#1a1e1a', 6); disc(x + sx * 54, 530, 16, 'rgba(255,210,120,.8)'); add(() => glow(x + sx * 54, 530, 120, AMB, .3)) } }
  rr(1080, 830, 200, 14, 3, '#2a2420'); rr(1080, 800, 200, 10, 3, '#2a2420'); for (const sx of [1090, 1260]) { line(sx, 800, sx, 880, '#141414', 8) }
}
// 9) casas antigas de madeira (enxaimel): andares que avançam sobre a rua, vigas escuras, janelas de vidrinhos
function casasMadeira(t, o = {}) {
  ceu(t, o.ceu || 'chuva', { sol: false }); const base = 760, q = rng(5);
  for (let k = 0; k < 7; k++) { const x = -60 + k * 290, tilt = (q() - .5) * .04; c.save(); c.translate(x + 145, base); c.rotate(tilt); c.translate(-145, 0);
    for (let f = 0; f < 3; f++) { const ov = f * 22, yy = -170 - f * 170; rr(-ov, yy, 290 + ov * 2, 170, 0, f === 0 ? '#6a6050' : '#cfc4aa'); rr(-ov, yy, 290 + ov * 2, 12, 0, '#2a1e14'); for (let b = 0; b < 5; b++) rr(-ov + b * (290 + ov * 2) / 4 - 6, yy, 12, 170, 0, '#2a1e14'); line(-ov, yy + 170, -ov + 70, yy + 12, '#2a1e14', 10); line(290 + ov, yy + 170, 290 + ov - 70, yy + 12, '#2a1e14', 10); if (f) for (let w = 0; w < 2; w++) { const wx = -ov + 60 + w * 130, wy = yy + 50; rr(wx, wy, 70, 70, 2, (k + f + w) % 3 ? '#1a1c1c' : 'rgba(232,166,64,.6)'); c.strokeStyle = 'rgba(40,30,20,.8)'; c.lineWidth = 2; for (let d = -70; d < 70; d += 14) { c.beginPath(); c.moveTo(wx + Math.max(0, d), wy + Math.max(0, -d)); c.lineTo(wx + Math.min(70, d + 70), wy + Math.min(70, 70 - d)); c.stroke() } } }
    const top = -170 * 3 - 44; poly([[-70, -510], [145, top - 180], [360, -510]], '#2a2420'); poly([[145, top - 180], [360, -510], [145, -510]], '#1e1a18'); rr(-10, -170, 70, 170, 2, '#2a1e14'); rr(150, -120, 80, 80, 2, '#1a1c1c');
    c.restore() }
  rua(base, t, { pocas: true, pedra: '#2e2f2a' });
}
// 10) pracinha com igreja (torre e agulha) e uma taverna de esquina com placa pendurada
function pracaIgreja(t) {
  ceu(t, 'nevoa', { sx: 400, sy: 220 }); const base = 780;
  tijolos(100, base - 520, 560, 520, '#6a665a'); c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(480, base - 520, 180, 520); tijolos(230, base - 900, 180, 380, '#6a665a'); poly([[220, base - 900], [320, base - 1080], [420, base - 900]], '#4a483e'); poly([[320, base - 1080], [420, base - 900], [320, base - 900]], '#3a382e'); disc(320, base - 820, 40, '#d8ccb0'); line(320, base - 820, 320 + sin(t * .1) * 30, base - 820 - cos(t * .1) * 30, '#1a1a1a', 4);
  for (let k = 0; k < 3; k++) { const wx = 160 + k * 160; c.fillStyle = '#1a1e20'; c.beginPath(); c.moveTo(wx, base - 120); c.lineTo(wx, base - 380); c.arc(wx + 40, base - 380, 40, PI, 0); c.lineTo(wx + 80, base - 120); c.fill() } c.fillStyle = '#1e1a16'; c.beginPath(); c.moveTo(280, base); c.lineTo(280, base - 160); c.arc(320, base - 160, 40, PI, 0); c.lineTo(360, base); c.fill();
  tijolos(1180, base - 460, 560, 460, '#3a2a22'); rr(1180, base - 160, 560, 160, 0, '#2a3a30'); for (let w = 0; w < 3; w++) rr(1210 + w * 180, base - 140, 140, 100, 3, 'rgba(232,166,64,.55)'); rr(1170, base - 190, 580, 34, 2, '#1a1a16'); txt('PUBLIC HOUSE', 1460, base - 165, 26, '#d8c890', { align: 'center' }); for (let f = 0; f < 2; f++) for (let w = 0; w < 4; w++) janela(1220 + w * 130, base - 420 + f * 120, 50, 80, 0, t);
  line(1150, base - 260, 1060, base - 260, '#141414', 6); const sg = sin(t * 1.2) * .05; c.save(); c.translate(1080, base - 260); c.rotate(sg); rr(-60, 10, 120, 90, 4, '#2f4a3e'); c.strokeStyle = '#b8a070'; c.lineWidth = 4; c.beginPath(); c.roundRect(-54, 16, 108, 78, 3); c.stroke(); txt('THE', 0, 46, 20, '#d8c890', { align: 'center' }); txt('CROWN', 0, 78, 28, '#d8c890', { align: 'center' }); c.restore();
  rua(base, t);
}
// 11) casarões brancos de estuque com pórticos de colunas e sacadas de ferro (bairro rico)
function terracosBrancos(t, x0 = -40, x1 = W + 40, o = {}) {
  const base = o.base ?? 720;
  for (let x = x0; x < x1; x += 300) { rr(x, base - 600, 300, 600, 0, '#d8d0be'); rr(x + 250, base - 600, 50, 600, 0, 'rgba(0,0,0,.08)'); rr(x - 6, base - 620, 312, 24, 2, '#e8e2d2'); for (let j = 0; j < 6; j++) rr(x, base - 590 + j * 20, 300, 2, 0, 'rgba(0,0,0,.06)');
    for (let f = 0; f < 3; f++) for (let w = 0; w < 3; w++) janela(x + 40 + w * 90, base - 560 + f * 140, 44, 90, o.noite && (f + w) % 2 ? 1 : 0, t, { moldura: '#ece6d6' }); grade(x + 20, x + 280, base - 270, 30);
    rr(x + 110, base - 170, 80, 170, 3, '#141414'); for (const sx of [96, 196]) { c.fillStyle = bands(x + sx, 0, x + sx + 22, 0, [[.4, '#f2ecdc'], [1, '#c8c0ac']]); c.fillRect(x + sx, base - 200, 22, 200) } rr(x + 86, base - 218, 140, 22, 2, '#ece6d6'); for (let d = 0; d < 3; d++) rr(x + 80 - d * 6, base - 6 + d * 0 - d * 6 + 12, 152 + d * 12, 6, 1, '#b8b0a0') }
}
// 12) muro alto da fábrica com portão de ferro, torre do relógio e chaminé
function portaoFabrica(t, o = {}) {
  ceu(t, 'nevoa', { sol: false }); fabrica(300, 520, 1300, 260, t, { chamine: false }); chamine(1500, 520, 420, 70, t, 9); const base = 760;
  tijolos(-20, base - 300, W + 40, 300, '#4a2a22'); rr(-20, base - 316, W + 40, 18, 2, '#3a2018'); for (let x = 0; x < W; x += 200) rr(x, base - 320, 30, 320, 0, 'rgba(0,0,0,.18)');
  tijolos(840, base - 520, 240, 220, '#4e2c22'); poly([[830, base - 520], [960, base - 600], [1090, base - 520]], '#2a2e30'); disc(960, base - 430, 56, '#d8ccb0'); c.strokeStyle = '#1a1a1a'; c.lineWidth = 4; c.beginPath(); c.arc(960, base - 430, 56, 0, 7); c.stroke(); line(960, base - 430, 960 + 40 * sin(t * .3), base - 430 - 40 * cos(t * .3), '#1a1a1a', 4); line(960, base - 430, 990, base - 420, '#1a1a1a', 5);
  for (const sx of [760, 1120]) { rr(sx, base - 340, 50, 340, 2, '#6a665a'); disc(sx + 25, base - 350, 22, '#6a665a') } rr(810, base - 300, 310, 300, 0, '#121414'); const ab = o.aberto ?? 0; for (const sd of [-1, 1]) { const gx = 965 + sd * (77 + ab * 60); for (let k = 0; k < 8; k++) line(gx - 77 + k * 20, base - 290, gx - 77 + k * 20, base, '#2a2a26', 6); line(gx - 77, base - 280, gx + 77, base - 280, '#2a2a26', 8); line(gx - 77, base - 150, gx + 77, base - 150, '#2a2a26', 8) }
  rr(820, base - 360, 290, 40, 2, '#1e2420'); txt(o.nome || 'MATCH WORKS', 965, base - 330, 28, '#d8c890', { align: 'center' }); rua(base, t);
}
// 13) parque: gramado, árvores, coreto, caminho de cascalho e grade
function parque(t) {
  ceu(t, 'nevoa', { sx: 1500, sy: 220 }); skyline(520, t, { cor: '#3a423e', cor2: '#465048', chamines: 4 }); nevoa(t, 500, .3); rr(0, 560, W, H, 0, '#2e3a2c'); c.fillStyle = '#6a6250'; c.beginPath(); c.moveTo(0, 820); c.quadraticCurveTo(900, 700, W, 760); c.lineTo(W, 820); c.quadraticCurveTo(900, 760, 0, 900); c.fill();
  c.save(); c.translate(560, 640); rr(-130, -20, 260, 30, 3, '#4a4a44'); for (let k = 0; k < 6; k++) line(-120 + k * 48, -20, -120 + k * 48, -150, '#1e2420', 6); poly([[-150, -150], [0, -240], [150, -150]], '#2f4a3e'); poly([[0, -240], [150, -150], [0, -150]], '#24382e'); line(0, -240, 0, -270, '#1e2420', 4); c.restore();
  for (const [x, y, h] of [[150, 760, 460], [380, 700, 300], [880, 690, 320], [1200, 720, 420], [1500, 700, 340], [1780, 760, 480]]) arvore(x, y, h, t); grade(-10, W + 10, 1000, 70); for (const x of [300, 1100]) lampiao(x, 1010, 280, t, 0);
}
// 14) beco de cortiço: paredes próximas, varais com roupa, janelas quebradas, escada e lixo
function becoCortico(t, x0 = 0, x1 = W) {
  c.save(); c.beginPath(); c.rect(x0, 0, x1 - x0, H); c.clip(); const cx = (x0 + x1) / 2, w = x1 - x0;
  ceu(t, 'amarelo', { sol: false }); tijolos(x0, 0, w * .38, H, '#3a2a20'); tijolos(x1 - w * .38, 0, w * .38, H, '#34261e'); c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(x1 - w * .38, 0, w * .38, H);
  tijolos(cx - w * .14, 200, w * .28, 560, '#2e241c'); for (let f = 0; f < 4; f++) { janela(x0 + 40, 140 + f * 170, 60, 90, f === 2 ? 1 : 0, t); janela(x1 - 100, 160 + f * 170, 60, 90, 0, t); c.strokeStyle = '#d8d0bc'; c.lineWidth = 2; c.beginPath(); c.moveTo(x1 - 92, 168 + f * 170); c.lineTo(x1 - 60, 200 + f * 170); c.lineTo(x1 - 78, 230 + f * 170); c.stroke() }
  for (let k = 0; k < 3; k++) { const y = 260 + k * 160; c.strokeStyle = '#1a1a1a'; c.lineWidth = 2; c.beginPath(); c.moveTo(x0 + w * .38, y); c.quadraticCurveTo(cx, y + 40, x1 - w * .38, y); c.stroke(); for (let r = 0; r < 4; r++) { const rx = lerp(x0 + w * .42, x1 - w * .42, (r + .5) / 4), ry = y + 30 - Math.abs(r - 1.5) * 8; rr(rx - 20, ry, 40, 50 + (r % 2) * 20, 3, ['#b8b0a0', '#6a5a4a', '#8e8a80', '#5a3a30'][r]) } }
  rr(x0, 760, w, H, 0, '#26241e'); for (let k = 0; k < 6; k++) el(lerp(x0, x1, k / 6 + .08), 800 + (k % 2) * 40, 40, 10, 'rgba(90,90,80,.35)'); rr(x1 - w * .38 - 60, 700, 60, 60, 4, '#3a3026'); c.restore();
}
// 15) teatro iluminado: colunas, frontão, globos de gás e cartazes
function teatro(t) {
  ceu(t, 'noite', { sx: 300, sy: 160, sr: 40 }); const base = 760; rr(240, base - 620, 1440, 620, 0, '#4a463a'); rr(240, base - 640, 1440, 30, 2, '#6a665a'); poly([[600, base - 640], [960, base - 780], [1320, base - 640]], '#5a564a');
  rr(400, base - 600, 1120, 60, 2, '#2a2620'); txt('THEATRE ROYAL', 960, base - 556, 44, '#e8c880', { align: 'center' });
  for (let k = 0; k < 8; k++) { const x = 440 + k * 145; c.fillStyle = bands(x, 0, x + 40, 0, [[.4, '#d8d0bc'], [1, '#a8a090']]); c.fillRect(x, base - 520, 40, 520); rr(x - 8, base - 530, 56, 14, 2, '#c8c0ac') } c.fillStyle = 'rgba(232,166,64,.35)'; c.fillRect(400, base - 500, 1120, 500);
  for (let k = 0; k < 9; k++) { const x = 420 + k * 135; disc(x, base - 506, 14, F.chama); add(() => glow(x, base - 506, 90, AMB, .4)) } for (const x of [300, 1560]) { rr(x, base - 400, 80, 120, 3, '#d8ccb0'); txt('TONIGHT', x + 40, base - 360, 16, '#5a1e1e', { align: 'center' }) }
  rua(base, t, { pocas: true }); for (const x of [200, 1720]) lampiao(x, base + 20, 300, t, 1);
}
