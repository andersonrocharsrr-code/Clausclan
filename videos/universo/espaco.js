// ================= Espaço: estrelas, planetas, Voyager, foguete, disco de ouro, heliosfera, antenas =================
const STARS = (() => { const q = rng(77), a = []; for (let i = 0; i < 520; i++)a.push([q() * W, q() * H, .6 + q() * 1.8, .25 + q() * .75, q()]); return a })();
function el(x, y, rx, ry, col, rot = 0) { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot, 0, 7); c.fill() }
function bezPoly(pts, col) { c.fillStyle = col; c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) { const p = pts[i]; if (p.length === 4) c.quadraticCurveTo(p[0], p[1], p[2], p[3]); else c.lineTo(p[0], p[1]) } c.closePath(); c.fill() }
// céu de espaço: gradiente ardósia, faixa da Via Láctea, poeira e estrelas que cintilam (algumas em cruz)
function espaco(t, o = {}) {
  c.fillStyle = lg(0, 0, 0, H, [[0, '#05070c'], [.5, '#0b1222'], [1, '#121a2e']]); c.fillRect(0, 0, W, H);
  if (o.via !== false) { c.save(); c.translate(W / 2, H / 2); c.rotate(-.6); for (let k = 0; k < 3; k++) { c.fillStyle = lg(0, -260 + k * 60, 0, 260 - k * 60, [[0, 'rgba(120,130,160,0)'], [.5, `rgba(${k ? '217,190,140' : '120,130,170'},${.08 + k * .03})`], [1, 'rgba(120,130,160,0)']]); c.fillRect(-1600, -260 + k * 60, 3200, 520 - k * 120) } c.restore() }
  const dx = (o.deriva ?? 0) * t;
  STARS.forEach(([x, y, r, b, k], i) => { const xx = ((x + dx * (.3 + k)) % W + W) % W, al = b * (.7 + .3 * sin(t * 2 + i)); c.fillStyle = k < .15 ? `rgba(255,220,170,${al})` : k < .3 ? `rgba(180,200,255,${al})` : `rgba(255,248,230,${al})`; if (i % 31 === 0) { poly([[xx, y - r * 6], [xx + r, y], [xx, y + r * 6], [xx - r, y]], c.fillStyle); poly([[xx - r * 6, y], [xx, y - r], [xx + r * 6, y], [xx, y + r]], c.fillStyle) } else c.fillRect(xx, y, r, r) });
}
function solDisco(x, y, r, a = 1) { glow(x, y, r * 6, '255,214,150', .35 * a); glow(x, y, r * 2.6, '255,226,170', .6 * a); disc(x, y, r, `rgba(255,244,214,${a})`); disc(x - r * .2, y - r * .2, r * .7, `rgba(255,252,240,${a})`) }
// planeta genérico: disco, faixas, sombra (terminador) e brilho de borda
function planeta(x, y, r, o = {}) {
  c.save(); if (o.halo) glow(x, y, r * 1.5, o.halo, .25); c.beginPath(); c.arc(x, y, r, 0, 7); c.clip();
  c.fillStyle = o.base; c.fillRect(x - r, y - r, 2 * r, 2 * r); if (o.faixas) { const q = rng(o.seed || 3); o.faixas.forEach(([y0, h, col]) => { c.fillStyle = col; c.beginPath(); c.moveTo(x - r, y + y0 * r); for (let k = 0; k <= 20; k++) c.lineTo(x - r + k * r / 10, y + y0 * r + sin(k * 1.3 + (o.t || 0) * .2 + y0 * 9) * r * .015); c.lineTo(x + r, y + (y0 + h) * r); c.lineTo(x - r, y + (y0 + h) * r); c.fill() }) }
  if (o.extra) o.extra(); const sx = o.luz ?? -1; c.fillStyle = rg(x - sx * r * .5, y - r * .3, r * .3, r * 1.7, [[0, 'rgba(0,0,0,0)'], [.55, 'rgba(0,0,0,.1)'], [1, 'rgba(2,4,10,.85)']]); c.fillRect(x - r, y - r, 2 * r, 2 * r); c.restore();
  c.strokeStyle = 'rgba(255,240,210,.15)'; c.lineWidth = r * .03; c.beginPath(); c.arc(x, y, r, PI * .6, PI * 1.4); c.stroke();
}
function terra(x, y, r, t) { planeta(x, y, r, { base: '#2d5d7a', halo: '120,170,210', t, extra: () => { const q = rng(8); for (let i = 0; i < 9; i++) { const a = q() * 7, d = q() * r * .8; bezPoly([[x + cos(a) * d, y + sin(a) * d], [x + cos(a) * d + r * .3, y + sin(a) * d - r * .1], [x + cos(a) * d + r * .2, y + sin(a) * d + r * .25], [x + cos(a) * d - r * .1, y + sin(a) * d + r * .15]], i % 3 ? '#7a8a5a' : '#a8946a') } for (let i = 0; i < 14; i++) { const yy = y - r + q() * 2 * r, xx = ((x - r + q() * 2 * r + t * 6) % (2 * r)) + x - r; pill(xx, yy, r * (.3 + q() * .5), r * .06, 'rgba(250,250,240,.75)') } el(x, y - r * .92, r * .5, r * .12, 'rgba(240,244,248,.9)') } }) }
function lua(x, y, r) { planeta(x, y, r, { base: '#b8b4a8', extra: () => { const q = rng(4); for (let i = 0; i < 14; i++) { disc(x + (q() - .5) * 1.6 * r, y + (q() - .5) * 1.6 * r, r * (.05 + q() * .14), 'rgba(120,116,108,.6)') } } }) }
function jupiter(x, y, r, t) { planeta(x, y, r, { base: '#d8b88a', t, faixas: [[-1, .22, '#a8805a'], [-.6, .12, '#e8d4b0'], [-.42, .16, '#b8885a'], [-.18, .14, '#ecdcc0'], [-.02, .1, '#c89a6a'], [.14, .18, '#e4ccaa'], [.34, .14, '#a87a52'], [.52, .2, '#d8c09a'], [.75, .3, '#9a7454']], extra: () => { const gx = x + r * .25 + ((t * 8) % (r * .4)) - r * .2; el(gx, y + r * .22, r * .2, r * .1, '#b85a3a'); el(gx, y + r * .22, r * .13, r * .06, '#d8806a') } }) }
function io(x, y, r, t) { planeta(x, y, r, { base: '#e8d070', extra: () => { const q = rng(9); for (let i = 0; i < 12; i++) disc(x + (q() - .5) * 1.6 * r, y + (q() - .5) * 1.6 * r, r * (.05 + q() * .1), ['#c8762a', '#8a4a2a', '#f0e8b0'][(q() * 3) | 0]) } }); // pluma do vulcão na borda
  for (let k = 0; k < 10; k++) { const ph = (t * .5 + k / 10) % 1, a = -2.2 + (k % 3) * .08; c.fillStyle = `rgba(200,210,240,${.4 * (1 - ph)})`; c.beginPath(); c.arc(x + cos(a) * r * (1 + ph * .5), y + sin(a) * r * (1 + ph * .5), r * .06 + ph * r * .1, 0, 7); c.fill() } c.strokeStyle = 'rgba(190,200,240,.4)'; c.lineWidth = 3; c.beginPath(); c.arc(x + cos(-2.2) * r, y + sin(-2.2) * r, r * .35, -2.2 - 1.3, -2.2 + 1.3); c.stroke() }
function saturno(x, y, r, t, o = {}) { const rot = -.18, aneis = [[2.2, 'rgba(200,180,140,.55)', .18], [1.9, 'rgba(240,220,180,.9)', .22], [1.6, 'rgba(190,170,130,.7)', .14], [1.38, 'rgba(160,140,110,.5)', .1]];
  const meio = (frente) => { c.save(); c.translate(x, y); c.rotate(rot); c.beginPath(); c.rect(-r * 3, frente ? 0 : -r * 3, r * 6, r * 3); c.clip(); for (const [k, col, w] of aneis) { c.strokeStyle = col; c.lineWidth = r * w; c.beginPath(); c.ellipse(0, 0, r * k, r * k * .26, 0, 0, 7); c.stroke() } c.restore() };
  meio(false); planeta(x, y, r, { base: '#e0c890', t, faixas: [[-1, .3, '#c8a870'], [-.5, .14, '#ecd8a8'], [-.2, .12, '#d0b080'], [.1, .2, '#e8d4a4'], [.4, .2, '#c8a46e'], [.7, .3, '#b8945e']] }); meio(true) }
function tita(x, y, r) { planeta(x, y, r, { base: '#d89a4a', halo: '230,160,80', faixas: [[-1, .4, '#c8883a'], [.3, .7, '#e0a858']] }) }
function urano(x, y, r, t) { c.strokeStyle = 'rgba(180,220,230,.3)'; c.lineWidth = 2; c.beginPath(); c.ellipse(x, y, r * .3, r * 1.6, .15, 0, 7); c.stroke(); planeta(x, y, r, { base: '#9cd0d4', halo: '160,220,230', faixas: [[-.2, .4, '#a8dadc']] }) }
function netuno(x, y, r, t) { planeta(x, y, r, { base: '#3a62b0', halo: '90,130,220', t, faixas: [[-1, .4, '#2e54a0'], [-.3, .2, '#4a72c0'], [.4, .6, '#3058a8']], extra: () => { el(x - r * .2, y + r * .15, r * .22, r * .12, '#1e3a78'); pill(x - r * .1, y + r * .02, r * .3, r * .05, 'rgba(240,248,255,.85)'); pill(x + r * .3, y - r * .35, r * .25, r * .04, 'rgba(240,248,255,.7)') } }) }
// ---------- a Voyager (centro do corpo em 0,0; escala ~ 1 m = 30 px). o.ang gira a nave ----------
function voyager(x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.rotate(o.ang || 0); c.scale(s, s);
  // haste do magnetômetro (13 m) em treliça fina
  const mg = o.mag ?? 1, my = 30 + 390 * mg, mx = 20 - 60 * mg; c.strokeStyle = 'rgba(200,190,170,.75)'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(20, 30); c.lineTo(mx, my); c.stroke(); for (let k = 0; k < Math.round(24 * mg); k++) { const u = k / Math.round(24 * mg); c.beginPath(); c.moveTo(lerp(20, mx, u) - 6, lerp(30, my, u)); c.lineTo(lerp(20, mx, u + .04) + 6, lerp(30, my, u + .04)); c.stroke() } el(mx, my + 4, 10, 6, '#c8b890');
  // braço dos geradores de plutônio (RTG): três cilindros com aletas
  line(-40, 10, -260, 70, '#8a8478', 7); for (let k = 0; k < 3; k++) { const rx = -140 - k * 44, ry = 38 + k * 12; c.save(); c.translate(rx, ry); c.rotate(.27); rr(-20, -24, 40, 48, 6, '#3a3632'); for (let f = 0; f < 6; f++) { const a = f * PI / 3; line(cos(a) * 14, sin(a) * 18, cos(a) * 30, sin(a) * 34, '#5a544a', 4) } rr(-20, -24, 14, 48, 5, '#5a5448'); if (o.rtgGlow) add(() => glow(0, 0, 60, '255,120,60', o.rtgGlow)); c.restore() }
  // braço da ciência com a plataforma de varredura (câmeras)
  line(40, 10, 250, -20, '#8a8478', 7); c.save(); c.translate(250, -20); rr(-34, -30, 68, 56, 6, '#3e3a34'); rr(-34, -30, 24, 56, 5, '#5a5448'); rr(14, -40, 40, 22, 4, '#1a1a1e'); disc(54, -29, 9, '#0a0a0e'); disc(54, -29, 5, '#4a6a80'); rr(14, -12, 30, 16, 3, '#1a1a1e'); disc(44, -4, 6, '#0a0a0e'); c.restore(); line(140, -4, 160, -90, '#8a8478', 3); el(160, -94, 14, 8, '#c8b890');
  // corpo decagonal com manta térmica dourada e o disco de ouro
  poly([[-60, -10], [-40, -34], [40, -34], [60, -10], [60, 30], [40, 52], [-40, 52], [-60, 30]], '#b8902a'); poly([[0, -34], [40, -34], [60, -10], [60, 30], [40, 52], [0, 52]], '#8a6a1e'); c.strokeStyle = 'rgba(255,240,180,.35)'; c.lineWidth = 1.5; for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(-58, -6 + k * 10); c.lineTo(58, -2 + k * 10 + sin(k) * 4); c.stroke() }
  disc(-24, 16, 18, '#e8c870'); disc(-24, 16, 13, '#c8a040'); disc(-24, 16, 3, '#7a5a1e'); c.strokeStyle = 'rgba(120,80,20,.5)'; c.lineWidth = 1; for (let k = 5; k < 13; k += 2) { c.beginPath(); c.arc(-24, 16, k, 0, 7); c.stroke() }
  // antena de alto ganho (3,7 m): prato branco visto de três quartos, com alimentador
  c.save(); c.translate(0, -52); el(0, 0, 112, 36, '#e8e4d8'); el(0, 4, 104, 30, '#cfcabc'); el(-30, -4, 50, 14, 'rgba(255,255,255,.4)'); c.strokeStyle = 'rgba(80,80,80,.35)'; c.lineWidth = 1; for (let k = 1; k < 6; k++) { c.beginPath(); c.ellipse(0, 4, 104 * k / 6, 30 * k / 6, 0, 0, 7); c.stroke() } for (let k = 0; k < 3; k++) { const a = -PI / 2 + (k - 1) * 1.6; line(cos(a) * 80, 4 + sin(a) * 22, 0, -60, '#8a8478', 2.5) } el(0, -62, 16, 6, '#d8d4c8'); el(0, -66, 10, 4, '#8a8478'); c.restore();
  if (o.sinal) { const a0 = o.sinalAng ?? -PI / 2; for (let k = 0; k < 5; k++) { const ph = (t * .8 + k / 5) % 1; c.strokeStyle = `rgba(240,212,138,${.6 * (1 - ph)})`; c.lineWidth = 4; c.beginPath(); c.arc(0, -120, 60 + ph * 600, a0 - .25, a0 + .25); c.stroke() } }
  c.restore();
}
// ---------- foguete Titan IIIE-Centaur (base em 0,0; ~48 m = 900 px a escala 1) ----------
function titan(x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s); const lit = o.lit ?? 0;
  if (lit) { for (const bx of [-78, 78, 0]) { const L = bx ? 520 : 260, w = bx ? 56 : 40; for (const [k, col] of [[1, '#d9662e'], [.75, '#f09a3e'], [.5, '#f8cf6a'], [.28, '#fff6dc']]) { c.fillStyle = col; c.beginPath(); c.moveTo(bx - w * k, 0); c.quadraticCurveTo(bx - w * k * 1.4, L * k * .5, bx + sin(t * 40 + bx) * 6, L * k * (1 + .06 * sin(t * 37 + bx))); c.quadraticCurveTo(bx + w * k * 1.4, L * k * .5, bx + w * k, 0); c.fill() } } add(() => glow(0, 120, 520, '255,190,110', .5 * lit)) }
  for (const sx of [-1, 1]) { const bx = sx * 78; rr(bx - 44, -620, 88, 620, 10, '#e8e2d0'); rr(bx - 44, -620, 30, 620, 8, '#fff8e8'); rr(bx + 16, -620, 28, 620, 8, '#b8b2a0'); for (let k = 0; k < 7; k++) rr(bx - 44, -560 + k * 80, 88, 14, 0, '#2a2420'); poly([[bx - 44, -620], [bx, -700], [bx + 44, -620]], '#d8d2c0'); poly([[bx - 40, 0], [bx + 40, 0], [bx + 30, 30], [bx - 30, 30]], '#3a3632') }
  rr(-34, -860, 68, 860, 4, '#3a3a34'); rr(-34, -860, 22, 860, 4, '#55554c'); rr(-34, -560, 68, 8, 0, '#1a1a18');
  rr(-36, -1060, 72, 200, 4, '#d8d4c8'); rr(-36, -1060, 24, 200, 4, '#f0ece0'); rr(-36, -980, 72, 30, 0, '#b8a070');
  bezPoly([[-44, -1060], [-44, -1240], [-30, -1320, 0, -1350], [30, -1320, 44, -1240], [44, -1060]], '#ece8dc'); bezPoly([[0, -1350], [30, -1320, 44, -1240], [44, -1060], [10, -1060]], '#c8c4b8'); txt('UNITED STATES', 0, -800, 22, '#e8e2d0', { align: 'center', sh: 0, ls: 1 });
  c.restore();
}
// torre de lançamento e plataforma
function plataforma(x, y, s, t) { c.save(); c.translate(x, y); c.scale(s, s); rr(-400, 0, 800, 60, 0, '#3a3632'); for (const sx of [-260, 260]) { c.fillStyle = '#2a2622'; c.fillRect(sx - 30, -1100, 60, 1100); c.strokeStyle = 'rgba(230,200,140,.25)'; c.lineWidth = 3; for (let k = 0; k < 18; k++) { c.beginPath(); c.moveTo(sx - 30, -k * 60); c.lineTo(sx + 30, -k * 60 - 60); c.moveTo(sx + 30, -k * 60); c.lineTo(sx - 30, -k * 60 - 60); c.stroke() } } c.restore() }
// fumaça de lançamento (bolotas planas em dois tons, rolando pelo chão)
function fumacaChao(x, y, t, t0, n, seed) { const q = rng(seed); for (let i = 0; i < n; i++) { const b = t0 + q() * 2, dir = q() < .5 ? -1 : 1, v = 60 + q() * 180, age = t - b; if (age <= 0) continue; const r = Math.min(260, 40 + age * 70) * (.6 + q() * .6), xx = x + dir * (40 + v * age * .6), yy = y - age * (10 + q() * 40); disc(xx + r * .1, yy - r * .1, r, 'rgba(200,190,170,.9)'); disc(xx - r * .08, yy + r * .1, r * .86, 'rgba(236,228,210,.9)') } }
// disco de ouro: sulcos, rótulo, e a capa com as gravuras (mapa de pulsares, átomo de hidrogênio, agulha)
function discoOuro(x, y, r, t, o = {}) {
  c.save(); c.translate(x, y); c.rotate(o.gira ? t * o.gira : 0); glow(0, 0, r * 1.5, '240,200,110', .25);
  c.fillStyle = rg(-r * .3, -r * .3, r * .1, r * 1.2, [[0, '#fff0b8'], [.4, '#e8c060'], [.8, '#b88a2a'], [1, '#7a5a1a']]); c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill();
  c.strokeStyle = 'rgba(90,60,10,.35)'; c.lineWidth = 1; for (let k = r * .3; k < r * .97; k += 4) { c.beginPath(); c.arc(0, 0, k, 0, 7); c.stroke() } c.fillStyle = 'rgba(255,250,220,.25)'; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, r, -1.2, -.7); c.fill();
  disc(0, 0, r * .28, '#c89a3a'); disc(0, 0, r * .05, '#3a2a10');
  if (o.capa) { c.strokeStyle = '#5a3e10'; c.lineWidth = 2; // mapa de pulsares: raios saindo do centro com marcas
    for (let k = 0; k < 14; k++) { const a = k * .45 + .2, L = r * (.35 + (k * 37 % 50) / 100); c.beginPath(); c.moveTo(-r * .45, r * .45); c.lineTo(-r * .45 + cos(a) * L * .6, r * .45 + sin(a) * L * .6); c.stroke() }
    c.beginPath(); c.arc(-r * .55, -r * .55, r * .08, 0, 7); c.stroke(); c.beginPath(); c.arc(-r * .35, -r * .55, r * .08, 0, 7); c.stroke(); line(-r * .47, -r * .55, -r * .43, -r * .55, '#5a3e10', 2);
    c.beginPath(); c.arc(r * .45, -r * .4, r * .2, 0, 7); c.stroke(); line(r * .25, -r * .62, r * .5, -r * .45, '#5a3e10', 3); for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(r * .2, r * .3 + k * 12); for (let x2 = 0; x2 < r * .5; x2 += 6) c.lineTo(r * .2 + x2, r * .3 + k * 12 + sin(x2 * .3 + k) * 5); c.stroke() } }
  c.restore();
}
// heliosfera: bolha do vento solar, choque de terminação, heliopausa e a nave saindo
function heliosfera(cx, cy, s, t, o = {}) {
  c.save(); c.translate(cx, cy); c.scale(s, s);
  c.fillStyle = 'rgba(70,100,140,.25)'; c.beginPath(); c.ellipse(-60, 0, 420, 330, 0, 0, 7); c.fill(); c.strokeStyle = 'rgba(217,179,90,.8)'; c.lineWidth = 6; c.setLineDash([18, 10]); c.beginPath(); c.ellipse(-60, 0, 420, 330, 0, 0, 7); c.stroke(); c.setLineDash([]);
  c.fillStyle = 'rgba(120,150,190,.25)'; c.beginPath(); c.ellipse(-30, 0, 260, 220, 0, 0, 7); c.fill(); c.strokeStyle = 'rgba(180,200,230,.6)'; c.lineWidth = 3; c.beginPath(); c.ellipse(-30, 0, 260, 220, 0, 0, 7); c.stroke();
  for (let k = 0; k < 24; k++) { const a = k / 24 * 2 * PI, ph = (t * .4 + k * .13) % 1; disc(cos(a) * (30 + ph * 220), sin(a) * (30 + ph * 190), 3, `rgba(255,220,160,${.8 * (1 - ph)})`) }
  solDisco(0, 0, 26); c.restore();
}
// antena de 70 m da Rede de Espaço Profundo
function antenaDSN(x, y, s, t, o = {}) { c.save(); c.translate(x, y); c.scale(s, s); rr(-90, -40, 180, 40, 4, '#5a5a54'); poly([[-70, -40], [-30, -260], [30, -260], [70, -40]], '#8a8a80'); poly([[0, -260], [30, -260], [70, -40], [10, -40]], '#6a6a62'); c.save(); c.translate(0, -300); c.rotate(-.5); el(0, 0, 220, 70, '#e8e4d8'); el(0, 8, 204, 58, '#c8c4b8'); c.strokeStyle = 'rgba(80,80,80,.3)'; c.lineWidth = 2; for (let k = 1; k < 6; k++) { c.beginPath(); c.ellipse(0, 8, 204 * k / 6, 58 * k / 6, 0, 0, 7); c.stroke() } for (const sx of [-1, 1]) line(sx * 120, 0, 0, -150, '#8a8478', 5); el(0, -156, 16, 10, '#d8d4c8'); c.restore(); if (o.recebe) { for (let k = 0; k < 4; k++) { const ph = (t * .6 + k / 4) % 1; c.strokeStyle = `rgba(240,212,138,${.6 * ph})`; c.lineWidth = 3; c.beginPath(); c.arc(-60, -520, 400 * (1 - ph) + 20, .8, 1.6); c.stroke() } } c.restore() }
// carro (sedã) e avião (jato), de lado
function carro(x, y, s, t) { c.save(); c.translate(x, y); c.scale(s, s); bezPoly([[-160, -30], [-150, -70], [-80, -80], [-40, -130], [70, -130], [110, -80], [170, -70], [175, -30]], '#8a3a2e'); bezPoly([[-40, -122], [60, -122], [92, -82], [-74, -82]], '#2a3a4a'); line(10, -122, 10, -82, '#8a3a2e', 6); rr(-170, -40, 345, 14, 6, '#5a2a20'); for (const wx of [-95, 105]) { c.save(); c.translate(wx, -20); disc(0, 0, 32, '#141414'); disc(0, 0, 16, '#8a8a8a'); c.rotate(t * 12); line(-14, 0, 14, 0, '#3a3a3a', 3); c.restore() } disc(168, -58, 8, '#f0e0a0'); c.restore() }
function aviao(x, y, s, t) { c.save(); c.translate(x, y); c.scale(s, s); bezPoly([[-260, -10], [-220, -34], [200, -34], [250, -20], [260, 0], [220, 14], [-230, 14]], '#e8e4d8'); bezPoly([[-260, -10], [-300, -110], [-250, -110], [-200, -30]], '#c8553a'); bezPoly([[-40, 0], [60, 0], [-60, 90], [-110, 90]], '#c8c4b8'); for (let k = 0; k < 14; k++) disc(-160 + k * 24, -16, 4, '#2a3a4a'); rr(-40, 22, 70, 22, 10, '#8a8a80'); c.restore() }

// ================= Terra detalhada (substitui a anterior): continentes reais em projeção ortográfica, nuvens, atmosfera e lado da noite =================
const CONTINENTES = [
  [[-168, 66], [-162, 70], [-140, 70], [-125, 72], [-95, 72], [-80, 73], [-62, 66], [-55, 52], [-66, 45], [-75, 38], [-81, 31], [-80, 25], [-90, 29], [-97, 26], [-97, 21], [-90, 21], [-87, 16], [-83, 10], [-79, 8], [-85, 12], [-92, 15], [-105, 20], [-112, 28], [-117, 32], [-124, 40], [-124, 48], [-133, 56], [-150, 60], [-165, 62]],
  [[-50, 60], [-42, 60], [-22, 70], [-20, 80], [-40, 83], [-60, 80], [-56, 72]],
  [[-80, 8], [-72, 12], [-62, 10], [-50, 0], [-35, -6], [-38, -15], [-48, -26], [-58, -38], [-65, -42], [-68, -52], [-74, -50], [-72, -35], [-71, -18], [-81, -6]],
  [[-10, 36], [-9, 43], [-2, 44], [-5, 48], [3, 51], [8, 54], [10, 58], [5, 62], [15, 69], [28, 71], [40, 67], [30, 60], [28, 46], [22, 40], [20, 37], [12, 44], [15, 40], [8, 44], [3, 43]],
  [[-6, 50], [1, 51], [1, 53], [-3, 56], [-5, 58], [-7, 57], [-3, 54], [-5, 52]],
  [[-17, 15], [-17, 21], [-10, 30], [-6, 36], [10, 37], [20, 32], [32, 31], [35, 25], [43, 12], [51, 12], [42, -2], [40, -15], [35, -25], [20, -35], [17, -29], [12, -17], [13, -5], [9, 4], [-5, 5], [-12, 7]],
  [[44, -13], [50, -15], [48, -25], [44, -24]],
  [[28, 46], [40, 42], [48, 30], [56, 25], [60, 23], [68, 24], [72, 20], [77, 8], [80, 14], [88, 22], [92, 22], [98, 16], [104, 1], [104, 10], [109, 12], [108, 21], [118, 24], [122, 30], [121, 38], [128, 40], [130, 43], [140, 47], [142, 53], [140, 60], [160, 62], [170, 65], [180, 68], [180, 72], [140, 74], [110, 78], [90, 76], [70, 73], [60, 70], [40, 67], [30, 60]],
  [[130, 31], [136, 34], [141, 38], [142, 44], [139, 40], [133, 34]],
  [[95, 5], [105, -6], [115, -8], [120, -9], [110, -3], [100, 2]], [[110, 0], [118, 6], [119, -3], [114, -4]], [[131, -1], [141, -3], [150, -6], [145, -8], [137, -6]],
  [[114, -22], [122, -18], [130, -12], [137, -12], [142, -11], [146, -19], [153, -26], [150, -37], [141, -38], [131, -31], [115, -34]],
  [[166, -46], [172, -41], [178, -38], [174, -42], [168, -47]],
  Array.from({ length: 13 }, (_, k) => [-180 + k * 30, -70 - (k % 2) * 3]).concat([[180, -90], [-180, -90]]),
];
const NUVENS = (() => { const q = rng(21), a = []; for (let i = 0; i < 70; i++) a.push([q() * 360 - 180, (q() - .5) * 150, 6 + q() * 16, 1.5 + q() * 3]); return a })();
function projeta(lon, lat, l0, f0) { const R = PI / 180, la = lat * R, dl = (lon - l0) * R, f = f0 * R; return [Math.cos(la) * Math.sin(dl), Math.cos(f) * Math.sin(la) - Math.sin(f) * Math.cos(la) * Math.cos(dl), Math.sin(f) * Math.sin(la) + Math.cos(f) * Math.cos(la) * Math.cos(dl)] }
function terra(x, y, r, t, o = {}) {
  const l0 = o.lon ?? (-40 + t * 2), f0 = o.lat ?? 18; glow(x, y, r * 1.25, '110,170,230', .35);
  c.save(); c.beginPath(); c.arc(x, y, r, 0, 7); c.clip();
  c.fillStyle = rg(x - r * .3, y - r * .35, r * .1, r * 1.1, [[0, '#3f86b8'], [.6, '#1f5a8a'], [1, '#0f3458']]); c.fillRect(x - r, y - r, 2 * r, 2 * r);
  const P2 = (lon, lat) => { const [px, py, pz] = projeta(lon, lat, l0, f0); if (pz >= 0) return [x + px * r, y - py * r, pz]; const n = Math.hypot(px, py) || 1; return [x + px / n * r, y - py / n * r, pz] };
  CONTINENTES.forEach((pts, i) => { const pp = pts.map(([a, b]) => P2(a, b)); if (pp.every(p => p[2] < 0)) return; const ant = i === CONTINENTES.length - 1; c.fillStyle = ant ? '#e8eef2' : (i === 5 || i === 7 ? '#8a7a52' : '#5a7a44'); c.beginPath(); pp.forEach(([a, b], k) => k ? c.lineTo(a, b) : c.moveTo(a, b)); c.closePath(); c.fill(); if (!ant) { c.save(); c.clip(); c.fillStyle = 'rgba(40,70,30,.45)'; for (const [a, b] of pts) { const [px, py, pz] = P2(a + 4, b - 3); if (pz > 0) disc(px, py, r * .05, 'rgba(60,90,40,.35)') } c.restore(); c.strokeStyle = 'rgba(230,220,180,.35)'; c.lineWidth = Math.max(1, r * .006); c.stroke() } });
  NUVENS.forEach(([lon, lat, w, h], i) => { const [px, py, pz] = projeta(lon + t * 1.2, lat, l0, f0); if (pz <= .05) return; c.save(); c.translate(x + px * r, y - py * r); c.scale(pz, 1); el(0, 0, r * w / 180 * 1.4, r * h / 180, `rgba(250,250,250,${.55 * pz})`, .2); c.restore() });
  el(x + projeta(0, 90, l0, f0)[0] * r, y - projeta(0, 90, l0, f0)[1] * r, r * .35, r * .12 * Math.max(.2, projeta(0, 90, l0, f0)[2]), 'rgba(240,246,250,.9)');
  c.fillStyle = rg(x - r * .45, y - r * .4, r * .2, r * 1.5, [[0, 'rgba(0,0,0,0)'], [.55, 'rgba(0,4,12,.15)'], [.85, 'rgba(2,6,16,.7)'], [1, 'rgba(2,6,16,.92)']]); c.fillRect(x - r, y - r, 2 * r, 2 * r);
  if (o.marcas) o.marcas.forEach(([lon, lat, cor]) => { const [px, py, pz] = projeta(lon, lat, l0, f0); if (pz > 0) { disc(x + px * r, y - py * r, Math.max(5, r * .05), cor || '#f0b94a'); c.strokeStyle = cor || '#f0b94a'; c.lineWidth = 3; c.beginPath(); c.arc(x + px * r, y - py * r, r * .09 + (t * 30 % (r * .08)), 0, 7); c.stroke() } });
  c.restore();
  c.strokeStyle = 'rgba(150,200,240,.55)'; c.lineWidth = Math.max(2, r * .025); c.beginPath(); c.arc(x, y, r * 1.01, PI * .55, PI * 1.45); c.stroke(); c.strokeStyle = 'rgba(150,200,240,.2)'; c.lineWidth = Math.max(2, r * .05); c.beginPath(); c.arc(x, y, r * 1.03, PI * .6, PI * 1.4); c.stroke();
}
// ================= carro realista (sedã de lado), substitui o anterior =================
function carro(x, y, s, t) { c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(0, 6, 200, 12, 0, 0, 7); c.fill();
  // carroceria com linhas curvas
  bezPoly([[-190, -38], [-192, -62, -176, -72], [-120, -82], [-70, -90], [-40, -128, 10, -132], [70, -132, 104, -92], [160, -84], [196, -70, 198, -44], [196, -26], [-188, -24]], '#7a1e22');
  bezPoly([[-188, -50], [-120, -60], [0, -64], [120, -62], [196, -54], [196, -44], [0, -50], [-188, -40]], 'rgba(255,255,255,.12)');
  bezPoly([[-190, -30], [196, -30], [196, -24], [-188, -22]], '#3a0e10'); bezPoly([[-188, -36], [196, -38], [196, -30], [-190, -30]], 'rgba(0,0,0,.25)');
  // janelas com colunas
  bezPoly([[-58, -88], [-32, -122, 8, -124], [8, -88]], '#1e2a36'); bezPoly([[16, -124], [62, -124, 92, -90], [16, -88]], '#1e2a36'); bezPoly([[-52, -92], [-28, -116, 2, -118], [2, -110], [-40, -100]], 'rgba(200,220,240,.25)'); rr(8, -126, 8, 40, 2, '#3a0e10');
  line(-68, -88, 100, -88, '#5a1416', 3); line(10, -84, 10, -30, '#5a1416', 2.5); line(-70, -84, -76, -32, '#5a1416', 2.5); line(102, -84, 110, -36, '#5a1416', 2.5);
  rr(-40, -72, 24, 6, 3, '#c8c8c0'); rr(40, -72, 24, 6, 3, '#c8c8c0'); bezPoly([[96, -100], [110, -104], [112, -96], [100, -94]], '#1a1a1a');
  // faróis, lanterna, grade e para-choques
  bezPoly([[176, -70], [196, -64], [196, -54], [172, -58]], '#f4ecc8'); add(() => glow(196, -60, 50, '255,240,200', .35)); bezPoly([[-190, -60], [-176, -64], [-176, -50], [-190, -48]], '#c83a2a'); rr(184, -50, 14, 14, 3, '#2a2a2a'); rr(-196, -30, 30, 10, 4, '#2a2a2a'); rr(170, -30, 30, 10, 4, '#2a2a2a');
  // rodas: pneu, aro, raios girando e caixa de roda escura
  for (const wx of [-118, 122]) { el(wx, -24, 50, 44, '#1a0a0c'); c.save(); c.translate(wx, -14); disc(0, 0, 40, '#141414'); disc(0, 0, 33, '#2a2a2a'); disc(0, 0, 26, '#b8bcc0'); disc(0, 0, 22, '#8a9096'); c.rotate(t * 14); for (let k = 0; k < 5; k++) { c.save(); c.rotate(k * 2 * PI / 5); rr(-4, -22, 8, 18, 3, '#d8dce0'); c.restore() } disc(0, 0, 7, '#5a6068'); c.restore() }
  c.restore() }
