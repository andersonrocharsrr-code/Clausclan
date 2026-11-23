// ================= Desenhos novos deste vídeo: recorte de papel plano, paleta "Nebulosa" =================
// Planos de luz e sombra com borda reta (sem esfumaçado nos objetos), violeta profundo, ciano, rosa e creme.
const NEB = { v0: '#090619', v1: '#120c2c', v2: '#1e1646', v3: '#2e2464', v4: '#4a3a96', v5: '#6a54c8', lav: '#b8a8f0', cia: '#4fd8e8', cia2: '#a8f2fa', ros: '#ff5fa2', ros2: '#ffb0d4', cre: '#f3eefc', lar: '#ff9a5a', ama: '#ffd27a' };
function cache(nome, w, h, fn) { const M = (cache.m = cache.m || {}); if (!M[nome]) { const k = document.createElement('canvas'); k.width = w; k.height = h; const ant = c; c = k.getContext('2d'); fn(); c = ant; M[nome] = k } return M[nome] }
function el(x, y, rx, ry, col, rot = 0) { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), rot, 0, 7); c.fill() }
const zoomTela = (z, cx, cy, fn) => { c.save(); c.translate(cx, cy); c.scale(z, z); c.translate(-cx, -cy); fn(); c.restore() };
// estrela de 4 pontas (recorte)
function brilho4(x, y, s, col, a = 1) { if (a <= 0) return; c.save(); c.globalAlpha *= a; c.fillStyle = col; c.beginPath(); c.moveTo(x, y - s); c.lineTo(x + s * .18, y - s * .18); c.lineTo(x + s, y); c.lineTo(x + s * .18, y + s * .18); c.lineTo(x, y + s); c.lineTo(x - s * .18, y + s * .18); c.lineTo(x - s, y); c.lineTo(x - s * .18, y - s * .18); c.closePath(); c.fill(); c.restore() }
// fundo: degradê em faixas retas + nebulosas recortadas (planos) + estrelas
function fundo(t, o = {}) { const k = o.seed || 1;
  c.drawImage(cache('fundo' + k + (o.cor || ''), W, H, () => {
    const cs = o.cor === 'quente' ? ['#0e0618', '#1e0a24', '#33102e', '#4a1836'] : [NEB.v0, NEB.v1, NEB.v2, '#241a52'];
    c.fillStyle = bands(0, 0, 0, H, [[.3, cs[0]], [.55, cs[1]], [.78, cs[2]], [1, cs[3]]]); c.fillRect(0, 0, W, H);
    const q = rng(k * 31);
    // nebulosas: grandes recortes translúcidos com borda reta
    for (let n = 0; n < 7; n++) { const cx = q() * W, cy = q() * H, R = 260 + q() * 420, m = 7 + (q() * 5 | 0), cor = [NEB.v4, NEB.v5, '#7a3a9a', NEB.v3][n % 4]; c.globalAlpha = .14 + q() * .12; const pts = []; for (let i = 0; i < m; i++) { const a = i / m * 7 + q() * .5, r = R * (.55 + q() * .5); pts.push([cx + cos(a) * r, cy + sin(a) * r * .6]) } poly(pts, cor); c.globalAlpha = 1 }
    c.save(); c.translate(W / 2, H * .4); c.rotate(-.55); for (let b = 0; b < 4; b++) { c.globalAlpha = .07 + b * .02; c.fillStyle = [NEB.lav, NEB.v5, NEB.ros2, NEB.cia2][b]; c.fillRect(-1600, -120 + b * 34, 3200, 240 - b * 68) } c.restore(); c.globalAlpha = 1;
    for (let i = 0; i < 900; i++) { const x = q() * W, y = q() * H, s = q() < .9 ? 1 + q() * 1.6 : 2.5 + q() * 2; c.fillStyle = q() < .15 ? NEB.ros2 : q() < .3 ? NEB.cia2 : NEB.cre; c.globalAlpha = .35 + q() * .65; c.fillRect(x, y, s, s) } c.globalAlpha = 1 }), 0, 0);
  const q = rng(k * 7); for (let i = 0; i < 26; i++) { const x = q() * W, y = q() * H, s = 8 + q() * 16, b = .5 + .5 * sin(t * (1 + q() * 2) + i); brilho4(x, y, s * (.6 + .4 * b), i % 5 ? NEB.cre : NEB.cia2, .5 + .5 * b) } }
// colinas em camadas (chão da cena noturna)
function colinas(y0 = 1250) { const cs = ['#1a1338', '#140e2c', '#0d0920']; cs.forEach((col, i) => { const y = y0 + i * 70, q = rng(40 + i); const pts = [[0, H], [0, y + q() * 60]]; for (let x = 0; x <= W; x += 120) pts.push([x, y + (q() - .5) * 90]); pts.push([W, H]); poly(pts, col) }) }
// pessoa de costas, olhando para cima, com luz de borda ciano
function pessoaCostas(x, y, s = 1, o = {}) { c.save(); c.translate(x, y); c.scale(s, s); const corpo = o.cor || '#0a0716', borda = o.borda || NEB.cia;
  poly([[-40, 0], [-34, -150], [34, -150], [40, 0]], corpo); poly([[-62, -140], [-50, -230], [50, -230], [62, -140], [40, -130], [-40, -130]], corpo); // pernas, tronco
  poly([[-66, -150], [-56, -232], [-42, -232], [-50, -150]], corpo); poly([[66, -150], [56, -232], [42, -232], [50, -150]], corpo); // braços
  poly([[-16, -228], [16, -228], [14, -244], [-14, -244]], corpo); c.save(); c.translate(0, -278); c.rotate(-.12); el(0, 0, 32, 38, corpo); el(4, -8, 30, 34, o.cabelo || '#160f2a'); c.restore(); // cabeça erguida
  // luz de borda (plano reto)
  c.globalAlpha = .9; poly([[48, -228], [56, -232], [66, -150], [60, -150]], borda); poly([[36, -150], [40, 0], [34, 0], [30, -150]], borda); c.save(); c.translate(0, -278); c.rotate(-.12); c.beginPath(); c.ellipse(0, 0, 32, 38, 0, -1.2, .9); c.lineWidth = 5; c.strokeStyle = borda; c.stroke(); c.restore(); c.restore() }
// planeta recortado: disco base, sombra de borda reta (outro círculo), faixas e brilho de borda
function planeta(x, y, r, o = {}) { const base = o.base || NEB.v5, sombra = o.sombra || 'rgba(8,4,24,.62)', ang = o.ang ?? -2.4;
  if (o.anel) el(x, y, r * 2.1, r * .5, o.anelCor || NEB.lav, o.anelRot || -.25);
  c.save(); c.beginPath(); c.arc(x, y, r, 0, 7); c.clip(); c.fillStyle = base; c.fillRect(x - r, y - r, 2 * r, 2 * r);
  (o.faixas || []).forEach(([dy, h, col]) => { c.fillStyle = col; c.fillRect(x - r, y + dy * r, 2 * r, h * r) }); if (o.extra) o.extra();
  c.fillStyle = 'rgba(255,255,255,.14)'; c.beginPath(); c.arc(x + cos(ang) * r * .25, y + sin(ang) * r * .25, r * .85, 0, 7); c.fill();
  c.fillStyle = sombra; c.beginPath(); c.arc(x - cos(ang) * r * .9, y - sin(ang) * r * .9, r * 1.35, 0, 7); c.fill(); c.restore();
  if (o.anel) { c.save(); c.beginPath(); c.rect(x - r * 2.3, y, r * 4.6, r * 1.2); c.clip(); c.save(); c.translate(x, y); c.rotate(o.anelRot || -.25); c.lineWidth = r * .12; c.strokeStyle = o.anelCor || NEB.lav; c.beginPath(); c.ellipse(0, 0, r * 1.8, r * .42, 0, 0, PI); c.stroke(); c.restore(); c.restore() }
  if (o.atm) { c.lineWidth = r * .05; c.strokeStyle = o.atm; c.beginPath(); c.arc(x, y, r * 1.02, 0, 7); c.stroke() } }
// Terra recortada: oceano, continentes que giram, nuvens, lado da noite reto
const CONT = [[[0, -.5], [.25, -.6], [.4, -.35], [.3, -.1], [.1, 0], [.05, .3], [-.1, .45], [-.15, .15], [-.05, -.2]], [[.7, -.4], [1.1, -.55], [1.3, -.3], [1.2, .05], [.95, .25], [.85, -.05]], [[1.5, .2], [1.75, .1], [1.85, .35], [1.6, .5]], [[-.7, -.2], [-.45, -.3], [-.4, .1], [-.55, .35], [-.75, .15]]];
function terra(x, y, r, t, o = {}) { const giro = (o.giro ?? t * .05) % 2.6;
  planeta(x, y, r, { base: '#2f6fd8', atm: NEB.cia, ang: o.ang ?? -2.4, extra: () => { for (let rep = -1; rep <= 1; rep++) CONT.forEach((pts, i) => poly(pts.map(([a, b]) => [x + (a + giro + rep * 2.6 - 1.3) * r * .8, y + b * r]), i % 2 ? '#3fae6a' : '#5cc07a'));
    c.fillStyle = 'rgba(255,255,255,.85)'; for (let i = 0; i < 6; i++) { const cx = x + (((i * .43 + giro * 1.3) % 2.4) - 1.2) * r, cy = y + (i % 3 - 1) * r * .45; c.fillRect(cx - r * .25, cy, r * .5, r * .06); c.fillRect(cx - r * .1, cy - r * .05, r * .3, r * .05) } el(x, y - r * .95, r * .6, r * .14, '#eef6ff'); el(x, y + r * .95, r * .5, r * .12, '#eef6ff') } }) }
// Sol recortado: anéis de cor com borda reta e raios triangulares girando
function sol(x, y, r, t, o = {}) { const cores = o.cores || ['#ff6a3a', '#ff8a4a', '#ffb05a', '#ffd27a', '#fff0b8'];
  c.save(); c.translate(x, y); c.rotate(t * .05); for (let k = 0; k < 2; k++) { c.fillStyle = k ? 'rgba(255,190,110,.35)' : 'rgba(255,120,80,.25)'; c.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * PI * 2 + k * .2, a2 = a + PI / 16; c.moveTo(cos(a - .08) * r, sin(a - .08) * r); c.lineTo(cos(a2) * r * (1.5 + k * .3), sin(a2) * r * (1.5 + k * .3)); c.lineTo(cos(a + .08 + PI / 8) * r, sin(a + .08 + PI / 8) * r) } c.fill() } c.restore();
  cores.forEach((col, i) => disc(x - i * r * .05, y - i * r * .05, r * (1 - i * .17), col)); add(() => glow(x, y, r * 2.2, '255,160,90', .25)) }
// galáxia recortada: braços feitos de pedaços de papel ao longo da espiral (em cache), núcleo em discos
function galaxia(x, y, R, t, o = {}) { const sd = o.seed || 1, inc = o.inc ?? .55, ang = o.ang ?? -.3, cores = o.cores || [NEB.lav, NEB.v5, NEB.cia2, NEB.ros2];
  const img = cache('gal' + sd + cores.join(), 800, 800, () => { const X = 400, q = rng(sd * 13); c.translate(X, X);
    for (let br = 0; br < 2; br++) for (let i = 0; i < 260; i++) { const u = i / 260, a = br * PI + u * 3.4 * PI * .55 + (q() - .5) * .25, d = 40 + u * 330 + (q() - .5) * 30, s = (1 - u) * 26 + 6; c.globalAlpha = .25 + (1 - u) * .45; c.fillStyle = cores[(i + br) % cores.length]; c.save(); c.translate(cos(a) * d, sin(a) * d); c.rotate(a + 1.2); c.fillRect(-s, -s * .4, s * 2, s * .8); c.restore() }
    c.globalAlpha = 1; for (let i = 0; i < 300; i++) { const a = q() * 7, d = q() ** 1.5 * 360; c.fillStyle = q() < .3 ? NEB.ros2 : NEB.cre; c.globalAlpha = .4 + q() * .6; c.fillRect(cos(a) * d, sin(a) * d, 2.5, 2.5) } c.globalAlpha = 1;
    [[110, NEB.v5], [80, NEB.lav], [52, '#e8dcff'], [30, NEB.cre], [14, '#ffffff']].forEach(([r, col]) => { c.fillStyle = col; c.globalAlpha = .55 + (110 - r) / 220; c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill() }); c.globalAlpha = 1 });
  c.save(); c.translate(x, y); c.rotate(ang); c.scale(1, inc); c.rotate(t * (o.vel ?? .04)); c.globalAlpha *= o.a ?? 1; c.drawImage(img, -R, -R, 2 * R, 2 * R); c.restore(); add(() => glow(x, y, R * .45, '230,210,255', .25 * (o.a ?? 1))) }
// buraco negro recortado: disco de acreção em faixas, sombra negra, anel de fótons e o arco do disco de trás
function buracoNegro(x, y, r, t) { const fx = ['#ff5fa2', '#ff8a6a', '#ffb07a', '#ffd8a0', '#fff2d8'];
  c.save(); c.translate(x, y); // arco de trás (dobrado pela gravidade)
  fx.forEach((col, i) => { c.strokeStyle = col; c.lineWidth = r * .1; c.beginPath(); c.ellipse(0, 0, r * (1.25 + i * .14), r * (1.15 + i * .12), 0, PI * 1.08, PI * 1.92); c.stroke() });
  fx.forEach((col, i) => { c.strokeStyle = col; c.lineWidth = r * .12; c.beginPath(); c.ellipse(0, 0, r * (2.6 - i * .26), r * (.5 - i * .05), 0, PI, 2 * PI); c.stroke() });
  disc(0, 0, r * 1.02, NEB.cia2); disc(0, 0, r, '#000000');
  fx.forEach((col, i) => { c.strokeStyle = col; c.lineWidth = r * .14; c.beginPath(); c.ellipse(0, 0, r * (2.6 - i * .26), r * (.5 - i * .05), 0, 0, PI); c.stroke() });
  c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 4; c.setLineDash([30, 50]); c.lineDashOffset = -t * 160; c.beginPath(); c.ellipse(0, 0, r * 2.2, r * .42, 0, 0, PI); c.stroke(); c.setLineDash([]); c.restore(); add(() => glow(x, y, r * 3, '255,120,170', .18)) }
// explosão recortada: estrelas de pontas irregulares em camadas + estilhaços
function explosao(x, y, u, t, R = 420) { if (u <= 0) return; const cores = ['#ff4f7a', '#ff8a5a', '#ffd27a', '#fff6e0'], q0 = rng(5);
  cores.forEach((col, k) => { const q = rng(9 + k), r = R * eo(u) * (1 - k * .2), n = 14; c.fillStyle = col; c.globalAlpha = 1 - ramp(u, .7, 1) * .6; c.beginPath(); for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * PI * 2 + k * .3 + t * .05, rr2 = i % 2 ? r * (.45 + q() * .15) : r * (.85 + q() * .3); i ? c.lineTo(x + cos(a) * rr2, y + sin(a) * rr2) : c.moveTo(x + cos(a) * rr2, y + sin(a) * rr2) } c.closePath(); c.fill() });
  c.globalAlpha = 1; for (let i = 0; i < 40; i++) { const a = q0() * 7, d = R * (.6 + q0() * .9) * eo(u), s = 6 + q0() * 14; c.save(); c.translate(x + cos(a) * d, y + sin(a) * d); c.rotate(a + t); c.fillStyle = i % 2 ? '#ffd27a' : '#ff8a5a'; c.fillRect(-s, -s * .3, s * 2, s * .6); c.restore() } add(() => glow(x, y, R * 1.3 * u, '255,140,110', .4 * (1 - u * .5))) }
// asteroide facetado
function asteroide(x, y, r, rot = 0) { c.save(); c.translate(x, y); c.rotate(rot); const q = rng(3), pts = []; for (let i = 0; i < 11; i++) { const a = i / 11 * 7, rr2 = r * (.75 + q() * .3); pts.push([cos(a) * rr2, sin(a) * rr2]) } poly(pts, '#5a4a6a'); poly(pts.slice(0, 6).concat([[0, 0]]), '#7a6888'); poly([[0, 0], pts[2], pts[3], pts[4]], '#9a88a8'); [[.3, -.2, .18], [-.35, .2, .14], [.1, .4, .1]].forEach(([a, b, s]) => { el(a * r, b * r, s * r, s * r * .8, '#4a3a58'); el(a * r + 2, b * r + 2, s * r * .7, s * r * .5, '#3a2c48') }); c.restore() }
// dinossauro (silhueta recortada)
function dino(x, y, s, col = '#0d0920') { c.save(); c.translate(x, y); c.scale(s, s); poly([[-120, -60], [-40, -90], [20, -100], [60, -140], [100, -150], [130, -135], [125, -118], [95, -115], [70, -100], [60, -70], [40, -50], [30, 0], [15, 0], [10, -40], [-20, -40], [-25, 0], [-42, 0], [-45, -45], [-80, -55], [-170, -40]], col); poly([[60, -95], [78, -78], [72, -74], [56, -88]], col); c.restore() }
// termômetro recortado
function termometro(x, y, h, u) { rr(x - 26, y - h, 52, h, 26, '#2a2250'); disc(x, y + 10, 44, '#2a2250'); const lv = h * (1 - u * .92); rr(x - 12, y - h + 20 + (h - 20) * (1 - (1 - u)), 24, Math.max(0, (h - 20) * (1 - u)) + 10, 12, NEB.cia); disc(x, y + 10, 30, NEB.cia); for (let i = 0; i < 8; i++) c.fillRect(x + 30, y - h + 20 + i * (h - 40) / 7, 22, 4) }
// cristais de gelo recortados
function gelo(t, a) { if (a <= 0) return; const q = rng(66); c.save(); c.globalAlpha = a; for (let i = 0; i < 18; i++) { const x = q() * W, y = q() * 1300, s = 20 + q() * 40; c.strokeStyle = NEB.cia2; c.lineWidth = 3; c.beginPath(); for (let k = 0; k < 3; k++) { const an = k * PI / 3 + t * .2; c.moveTo(x - cos(an) * s, y - sin(an) * s); c.lineTo(x + cos(an) * s, y + sin(an) * s) } c.stroke() } c.restore() }
// calendário cósmico
const MESES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
function calendario(x, y, u, t) { for (let i = 0; i < 12; i++) { const cx = x + (i % 3) * 300, cy = y + Math.floor(i / 3) * 210, a = ramp(u, i / 14, i / 14 + .1); if (a <= 0) continue; c.save(); c.globalAlpha = a; rr(cx - 130, cy - 85, 260, 170, 10, i === 11 ? NEB.ros : NEB.v3); rr(cx - 130, cy - 85, 260, 40, 10, i === 11 ? '#ff8ac0' : NEB.v4); txt(MESES[i], cx, cy + 40, 64, i === 11 ? '#fff' : NEB.lav, { align: 'center' }); c.restore() } }
// "pálido ponto azul": faixas de luz retas e um pontinho
function pontoAzul(t, u) { c.save(); c.translate(540, 900); c.rotate(-.35); [[-260, 150, '#c87a9a'], [-60, 110, '#9a7ac8'], [120, 170, '#7ab0c8']].forEach(([y, h, col]) => { c.fillStyle = col; c.globalAlpha = .22; c.fillRect(-1500, y, 3000, h); c.globalAlpha = .12; c.fillRect(-1500, y + h * .3, 3000, h * .4) }); c.restore(); c.globalAlpha = 1; disc(612, 900, 5, '#9ad8ff'); c.strokeStyle = NEB.cia; c.lineWidth = 4; c.globalAlpha = u; c.beginPath(); c.arc(612, 900, 40 + (1 - u) * 60, 0, 7); c.stroke(); c.globalAlpha = 1 }
// grade do espaço que se estica, com galáxias presas nela
function gradeEspaco(t, s, o = {}) { c.save(); c.translate(540, o.cy || 850); const n = 7, d = 110 * s; c.strokeStyle = 'rgba(79,216,232,.35)'; c.lineWidth = 2; for (let i = -n; i <= n; i++) { line(i * d, -n * d, i * d, n * d, 'rgba(79,216,232,.3)', 2); line(-n * d, i * d, n * d, i * d, 'rgba(79,216,232,.3)', 2) }
  const q = rng(4); for (let i = 0; i < 14; i++) { const gx = Math.round((q() - .5) * 8) * d, gy = Math.round((q() - .5) * 10) * d; c.save(); c.translate(gx, gy); c.rotate(q() * 3); c.scale(1, .5); disc(0, 0, 22, NEB.lav); disc(0, 0, 12, NEB.cre); c.restore() } c.restore() }
// mapa da radiação cósmica de fundo (mosaico recortado em elipse)
function radiacao(x, y, R, t) { const img = cache('cmb', 1000, 500, () => { c.save(); c.beginPath(); c.ellipse(500, 250, 495, 245, 0, 0, 7); c.clip(); const q = rng(1965), cs = ['#2a3aa8', '#3a6ad8', '#4fb8e8', '#9ae0d8', '#ffd27a', '#ff9a5a', '#ff5f7a'];
    for (let i = 0; i < 1600; i++) { const x0 = q() * 1000, y0 = q() * 500, s = 14 + q() * 34, m = 5 + (q() * 3 | 0), pts = []; for (let k = 0; k < m; k++) { const a = k / m * 7, rr2 = s * (.6 + q() * .5); pts.push([x0 + cos(a) * rr2, y0 + sin(a) * rr2 * .8]) } poly(pts, cs[Math.min(6, Math.floor((q() + q() + q()) / 3 * 7.5))]) } c.restore(); c.strokeStyle = NEB.cre; c.lineWidth = 5; c.beginPath(); c.ellipse(500, 250, 495, 245, 0, 0, 7); c.stroke() });
  c.drawImage(img, x - R, y - R / 2, 2 * R, R) }
// pasta confidencial com carimbo
function pasta(x, y, s, t) { c.save(); c.translate(x, y); c.scale(s, s); c.rotate(-.06); poly([[-260, -170], [-120, -170], [-90, -200], [40, -200], [60, -170], [260, -170], [260, 190], [-260, 190]], '#c89a5a'); poly([[-260, -130], [260, -130], [260, 190], [-260, 190]], '#e0b46a'); poly([[-260, -130], [260, -130], [260, -112], [-260, -112]], '#b0844a');
  for (let i = 0; i < 6; i++) c.fillStyle = '#5a4630', c.fillRect(-200, -60 + i * 38, 260 + (i * 47 % 120), 10); rr(110, 60, 120, 90, 4, '#f3eefc'); el(170, 100, 30, 34, '#3a3050'); c.restore() }
// simulação: esfera de arame + chuva de código
function simulacao(t, a = 1) { c.save(); c.globalAlpha = a; const q = rng(12); c.font = `700 30px ${COND}`; for (let col = 0; col < 24; col++) { const x = col * 46 + 10, v = 120 + q() * 200, o0 = q() * 2000; for (let k = 0; k < 18; k++) { const y = ((t * v + o0 + k * 36) % 2100) - 100; c.fillStyle = k === 17 ? NEB.cre : `rgba(79,216,232,${k / 18 * .7})`; c.fillText(((col * 7 + k + Math.floor(t * 4)) % 3) ? '1' : '0', x, y) } } c.restore();
  c.save(); c.translate(540, 860); c.strokeStyle = NEB.cia2; c.lineWidth = 3; c.globalAlpha = a; for (let i = 0; i < 9; i++) { const la = -PI / 2 + i * PI / 8; c.beginPath(); c.ellipse(0, Math.sin(la) * 300, Math.cos(la) * 300, Math.cos(la) * 60, 0, 0, 7); c.stroke() } for (let i = 0; i < 8; i++) { const lo = i * PI / 8 + t * .4; c.beginPath(); c.ellipse(0, 0, Math.abs(Math.cos(lo)) * 300, 300, 0, 0, 7); c.stroke() } c.restore() }
// bolhas do multiverso
function bolhas(t) { const q = rng(77); for (let i = 0; i < 9; i++) { const x = 140 + q() * 800, y = 380 + q() * 900 + sin(t * .7 + i) * 20, r = 70 + q() * 120; c.save(); c.beginPath(); c.arc(x, y, r, 0, 7); c.clip(); c.fillStyle = [NEB.v3, '#3a1a52', '#1a2a5a'][i % 3]; c.fillRect(x - r, y - r, 2 * r, 2 * r); galaxia(x, y, r * .8, t, { seed: i + 3, inc: .4 + q() * .4, ang: q() * 3, cores: i % 2 ? [NEB.ros2, NEB.lav, NEB.cre] : [NEB.cia2, NEB.lav, NEB.cre] }); c.restore(); c.strokeStyle = 'rgba(200,240,255,.8)'; c.lineWidth = 5; c.beginPath(); c.arc(x, y, r, 0, 7); c.stroke(); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(x - r * .4, y - r * .45, r * .3, r * .12, -.6, 0, 7); c.fill() } }
// ciclo eterno: anel de setas e o universo nascendo e encolhendo
function ciclo(x, y, R, t) { c.save(); c.translate(x, y); c.rotate(t * .5); c.lineWidth = 22; for (let k = 0; k < 3; k++) { c.strokeStyle = [NEB.cia, NEB.ros, NEB.lav][k]; c.beginPath(); c.arc(0, 0, R, k * 2.1 + .2, k * 2.1 + 1.8); c.stroke(); const a = k * 2.1 + 1.8; poly([[cos(a) * (R - 40), sin(a) * (R - 40)], [cos(a) * (R + 40), sin(a) * (R + 40)], [cos(a + .3) * R, sin(a + .3) * R]], c.strokeStyle) } c.restore();
  const f = (sin(t * 1.2) + 1) / 2; galaxia(x, y, 40 + f * (R - 90), t, { seed: 21, inc: .7 }); }
// Georges Lemaître (recorte): batina preta, colarinho branco, óculos redondos
function lemaitre(x, y, s, t) { c.save(); c.translate(x, y); c.scale(s, s); poly([[-110, 0], [-95, -260], [-60, -300], [60, -300], [95, -260], [110, 0]], '#14101e'); poly([[-60, -300], [60, -300], [95, -260], [70, -250], [0, -270], [-70, -250], [-95, -260]], '#221a30');
  rr(-26, -312, 52, 18, 4, '#f3eefc'); rr(-22, -340, 44, 30, 6, '#e8b890'); el(0, -385, 58, 66, '#f0c4a0'); poly([[0, -385], [58, -385], [56, -350], [20, -320], [0, -320]], '#e0a882'); // rosto com plano de sombra
  el(0, -440, 52, 22, '#5a5a66'); el(-50, -400, 10, 22, '#5a5a66'); el(50, -400, 10, 22, '#5a5a66'); // cabelo grisalho dos lados
  c.lineWidth = 5; c.strokeStyle = '#1a1420'; c.beginPath(); c.arc(-22, -390, 16, 0, 7); c.stroke(); c.beginPath(); c.arc(22, -390, 16, 0, 7); c.stroke(); line(-6, -390, 6, -390, '#1a1420', 4); disc(-20, -388, 4, '#1a1420'); disc(24, -388, 4, '#1a1420');
  poly([[-4, -378], [6, -360], [-6, -358]], '#d89878'); line(-14, -342, 14, -342, '#a8605a', 4);
  // braço apontando para o quadro
  poly([[70, -250], [190, -330], [205, -310], [95, -220]], '#14101e'); el(208, -326, 16, 14, '#f0c4a0'); c.restore() }
function quadroNegro(x, y, w, h, t, u) { rr(x - 12, y - 12, w + 24, h + 24, 8, '#6a4a2a'); rr(x, y, w, h, 4, '#1e3a32'); c.save(); c.globalAlpha = .1; c.fillStyle = '#fff'; c.fillRect(x + w * .1, y + h * .2, w * .5, h * .1); c.restore();
  const eqs = ['v = H · d', 'UNIVERSO EM', 'EXPANSÃO', 'ÁTOMO PRIMORDIAL']; eqs.forEach((s2, i) => { const a = ramp(u, i * .2, i * .2 + .2); if (a > 0) txt(s2, x + 40, y + 100 + i * 110, i === 0 ? 76 : 54, '#e8f4ea', { a, w: 600, sh: 0 }) }) }
// raios de luz vindos do alto (a primeira luz)
function raios(x, y, t, a = 1, R = 2200) { c.save(); c.translate(x, y); c.rotate(t * .03); for (let i = 0; i < 18; i++) { const an = i / 18 * PI * 2; c.fillStyle = i % 2 ? `rgba(255,240,210,${.16 * a})` : `rgba(168,242,250,${.12 * a})`; c.beginPath(); c.moveTo(0, 0); c.lineTo(cos(an - .06) * R, sin(an - .06) * R); c.lineTo(cos(an + .06) * R, sin(an + .06) * R); c.closePath(); c.fill() } c.restore() }
// ponto de luz que se acende
function centelha(x, y, u, t) { if (u <= 0) return; const s = eo(u); [[220, 'rgba(168,242,250,.25)'], [130, 'rgba(255,240,210,.45)'], [60, '#fff6e0'], [26, '#ffffff']].forEach(([r, col]) => disc(x, y, r * s, col)); brilho4(x, y, 300 * s, '#ffffff', .9); brilho4(x, y, 160 * s, NEB.cia2, .8); add(() => glow(x, y, 600 * s, '200,240,255', .35)) }
// cópia de você: duas pessoas espelhadas
function espelho(t, u) { pessoaCostas(300, 1380, 1.4); c.save(); c.globalAlpha = u; pessoaCostas(780, 1380, 1.4, { borda: NEB.ros }); c.restore(); c.strokeStyle = `rgba(184,168,240,${.6 * u})`; c.lineWidth = 4; c.setLineDash([16, 18]); c.lineDashOffset = -t * 40; line(390, 1100, 690, 1100, c.strokeStyle, 4); c.setLineDash([]) }
// cometa/linha de luz que viaja entre dois pontos
function feixe(x0, y0, x1, y1, u, cor = '79,216,232') { if (u <= 0) return; const x = lerp(x0, x1, Math.min(1, u)), y = lerp(y0, y1, Math.min(1, u)); line(x0, y0, x, y, `rgba(${cor},.6)`, 5); add(() => glow(x, y, 70, cor, .9)); disc(x, y, 9, '#ffffff') }
