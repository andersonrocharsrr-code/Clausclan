// ================= Cenários da Londres industrial (paleta "Fuligem") =================
const CEUS = {
  nevoa: [[0, '#1c2024'], [.5, '#3a423e'], [.85, '#5e665c'], [1, '#727866']],
  amarelo: [[0, '#2a2618'], [.45, '#5a5434'], [.8, '#8e8458'], [1, '#a29664']],
  noite: [[0, '#07080b'], [.5, '#12161c'], [.85, '#1e242a'], [1, '#2a3034']],
  crepusculo: [[0, '#14161a'], [.4, '#2e2c2a'], [.75, '#6a5038'], [1, '#a07040']],
  chuva: [[0, '#14181c'], [.5, '#262e32'], [1, '#3e4846']],
};
function ceu(t, tipo = 'nevoa', o = {}) {
  const hz = o.hz ?? 760; c.fillStyle = lg(0, 0, 0, hz, CEUS[tipo]); c.fillRect(0, 0, W, H);
  if (o.sol !== false && tipo !== 'chuva') { const sx = o.sx ?? 1400, sy = o.sy ?? 300, lua = tipo === 'noite'; glow(sx, sy, 260, lua ? '200,205,200' : '230,190,120', lua ? .1 : .2); disc(sx, sy, o.sr ?? 60, lua ? 'rgba(210,212,204,.75)' : 'rgba(236,206,150,.55)') }
  const q = rng(o.seed || 4); for (let i = 0; i < 9; i++) { const y = 60 + q() * (hz - 200), x = ((q() * W * 1.6 + t * (10 + q() * 14)) % (W + 900)) - 450; pill(x, y, 400 + q() * 700, 24 + q() * 40, tipo === 'noite' ? 'rgba(60,66,70,.25)' : 'rgba(30,30,28,.22)') }
}
// névoa em faixas que passam devagar
function nevoa(t, y, a = .35, cor = '120,128,116', n = 7, seed = 9) { const q = rng(seed); for (let i = 0; i < n; i++) { const yy = y + (q() - .5) * 200, x = ((q() * W * 1.4 + t * (14 + q() * 20)) % (W + 1400)) - 700, w = 700 + q() * 900; c.fillStyle = lg(0, yy - 60, 0, yy + 60, [[0, `rgba(${cor},0)`], [.5, `rgba(${cor},${a})`], [1, `rgba(${cor},0)`]]); c.fillRect(x, yy - 60, w, 120) } }
function chuva(t, n = 220, a = .28) { const q = rng(17); c.strokeStyle = `rgba(170,180,180,${a})`; c.lineWidth = 2; for (let i = 0; i < n; i++) { const x = q() * (W + 300) - 150, sp = 1300 + q() * 500, y = ((q() * H + t * sp) % (H + 200)) - 100; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 18, y + 50); c.stroke() } }
// fumaça de chaminé: bolotas que sobem, crescem e se espalham com o vento
function fumaca(x, y, h, t, seed = 1, cor = '40,40,38', vento = 1, a = .8) { const q = rng(seed); for (let i = 0; i < 16; i++) { const ph = (t * .12 + q()) % 1, r = 14 + ph * h * .35, xx = x + ph * h * .7 * vento + sin(t + i) * 8, yy = y - ph * h; disc(xx, yy, r, `rgba(${cor},${(a * (1 - ph) * .8).toFixed(3)})`) } }
// tijolos: argamassa clara em fiadas desencontradas
function tijolos(x, y, w, h, cor, k = 1) { c.fillStyle = cor; c.fillRect(x, y, w, h); c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 1.2 * k; const bh = 10 * k, bw = 26 * k; for (let yy = y, r = 0; yy < y + h; yy += bh, r++) { c.beginPath(); c.moveTo(x, yy); c.lineTo(x + w, yy); c.stroke(); for (let xx = x + (r % 2) * bw / 2; xx < x + w; xx += bw) { c.beginPath(); c.moveTo(xx, yy); c.lineTo(xx, yy + bh); c.stroke() } } const q = rng(x | 0); for (let i = 0; i < w * h / 900; i++) { c.fillStyle = `rgba(${q() < .5 ? '0,0,0' : '255,230,200'},${.05 + q() * .06})`; c.fillRect(x + q() * w, y + q() * h, bw, bh) } c.restore() }
// janela de guilhotina com caixilhos, peitoril e (às vezes) luz de vela
function janela(x, y, w, h, luz = 0, t = 0, o = {}) { rr(x - 4, y - 4, w + 8, h + 8, 2, o.moldura || '#c8bca4'); c.fillStyle = luz ? `rgba(232,166,64,${.55 + .25 * sin(t * 3 + x)})` : '#14181c'; c.fillRect(x, y, w, h); if (luz) add(() => glow(x + w / 2, y + h / 2, w * 1.6, AMB, .18 * luz)); else { c.fillStyle = 'rgba(160,170,170,.12)'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + w * .5, y); c.lineTo(x, y + h * .6); c.fill() } c.strokeStyle = '#2a2420'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y + h / 2); c.lineTo(x + w, y + h / 2); c.moveTo(x + w / 2, y); c.lineTo(x + w / 2, y + h); c.stroke(); rr(x - 8, y + h + 2, w + 16, 7, 1, '#b8ac94') }
// casas geminadas de tijolo (3 andares), portas com degraus, cornijas, chaminés com fumaça e lojas no térreo
function casas(x0, x1, base, t, o = {}) {
  const q = rng(o.seed || (x0 | 0) + 5), k = o.k || 1, cores = o.cores || [F.tijolo, '#4e2a22', F.tijolo2, '#5e3a2c', '#46302a'];
  for (let x = x0; x < x1;) {
    const w = (180 + q() * 70) * k, h = (300 + q() * 140) * k, cor = cores[(q() * cores.length) | 0], topo = base - h;
    tijolos(x, topo, w, h, cor, k); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(x + w - 10 * k, topo, 10 * k, h);
    rr(x - 4, topo - 14 * k, w + 8, 16 * k, 2, '#8e8676'); rr(x - 4, topo - 14 * k, w + 8, 4 * k, 1, '#a8a090');
    for (let cx = x + 20 * k; cx < x + w - 30 * k; cx += 70 * k) { tijolos(cx, topo - 60 * k, 34 * k, 48 * k, sh(cor.startsWith('#') ? cor : '#5a2e24', .85), k); for (let p = 0; p < 2; p++) { rr(cx + 3 * k + p * 15 * k, topo - 78 * k, 10 * k, 20 * k, 2, '#6a4a3a'); } if (o.fumaca !== false && q() < .6) fumaca(cx + 17 * k, topo - 80 * k, 220 * k, t, cx | 0, '38,38,36', 1, .55) }
    const andares = Math.floor((h - 110 * k) / (100 * k)), nj = Math.max(2, Math.floor(w / (70 * k)));
    for (let a = 0; a < andares; a++) for (let j = 0; j < nj; j++) { const wx = x + (w / nj) * (j + .5) - 18 * k, wy = topo + 30 * k + a * 100 * k; janela(wx, wy, 36 * k, 58 * k, (o.noite ? q() < .5 : q() < .12) ? 1 : 0, t) }
    if (o.lojas && q() < .7) { const lw = w - 20 * k; rr(x + 10 * k, base - 104 * k, lw, 100 * k, 2, '#22261e'); rr(x + 10 * k, base - 118 * k, lw, 18 * k, 2, o.placaCor || '#2f4a3e'); txt(o.nomes ? o.nomes[(q() * o.nomes.length) | 0] : 'SHOP', x + 10 * k + lw / 2, base - 104 * k, 15 * k, '#d8c890', { align: 'center' }); c.fillStyle = o.noite ? 'rgba(232,166,64,.5)' : 'rgba(150,160,150,.25)'; c.fillRect(x + 18 * k, base - 96 * k, lw - 60 * k, 64 * k); rr(x + lw - 34 * k, base - 96 * k, 30 * k, 92 * k, 2, '#3a2a20');
      for (let s = 0; s < 6; s++) poly([[x + 10 * k + s * lw / 6, base - 118 * k], [x + 10 * k + (s + 1) * lw / 6, base - 118 * k], [x + 10 * k + (s + .5) * lw / 6, base - 132 * k]], s % 2 ? '#5a2e24' : '#c8bca4') }
    else { const dx = x + w * .65; rr(dx, base - 92 * k, 40 * k, 88 * k, 3, '#1e2a24'); rr(dx - 8 * k, base - 100 * k, 56 * k, 10 * k, 2, '#c8bca4'); disc(dx + 32 * k, base - 50 * k, 3 * k, '#b8a070'); for (let d = 0; d < 3; d++) rr(dx - 6 * k - d * 4 * k, base - 4 * k + d * 4 * k - 8 * k, 52 * k + d * 8 * k, 6 * k, 1, '#8e8676'); line(x + 10 * k, base - 30 * k, x + w * .6, base - 30 * k, '#141414', 3 * k); for (let g = x + 14 * k; g < x + w * .6; g += 12 * k) line(g, base - 30 * k, g, base, '#141414', 2 * k) }
    x += w;
  }
}
// silhueta de Londres ao longe: domo de São Paulo, torres de igreja, chaminés com fumaça
function skyline(base, t, o = {}) {
  const cor = o.cor || '#2a302e', cor2 = o.cor2 || '#363c38', q = rng(o.seed || 3);
  c.fillStyle = cor2; for (let x = -20; x < W; x += 30 + q() * 50) { const h = 40 + q() * 90; c.fillRect(x, base - h, 34 + q() * 40, h + 300) }
  c.fillStyle = cor; for (let x = -20; x < W; x += 40 + q() * 70) { const h = 60 + q() * 120; c.fillRect(x, base - h, 50 + q() * 50, h + 300); if (q() < .3) { c.fillRect(x + 10, base - h - 60, 10, 60) } }
  if (o.stpauls !== false) stPauls(o.spx ?? 760, base, o.sps ?? 1, cor);
  for (const [sx, hh] of [[260, 220], [1180, 260], [1560, 190]]) { c.fillStyle = cor; c.fillRect(sx - 12, base - hh, 24, hh); poly([[sx - 14, base - hh], [sx, base - hh - 70], [sx + 14, base - hh]], cor) }
  for (let k = 0; k < (o.chamines ?? 7); k++) { const x = 100 + q() * (W - 200), hh = 160 + q() * 140; c.fillStyle = cor; c.fillRect(x - 10, base - hh, 20, hh); c.fillRect(x - 14, base - hh, 28, 10); fumaca(x, base - hh - 10, 380, t, k + 20, '30,30,28', 1.2, .55) }
}
function stPauls(x, base, s, cor) { c.save(); c.translate(x, base); c.scale(s, s); c.fillStyle = cor; c.fillRect(-160, -150, 320, 150); c.fillRect(-90, -230, 180, 80); c.beginPath(); c.arc(0, -230, 90, PI, 0); c.fill(); c.fillRect(-10, -360, 20, 50); disc(0, -366, 9, cor); c.fillRect(-2, -400, 4, 30); for (const sx of [-1, 1]) { c.fillRect(sx * 130 - 18, -260, 36, 120); poly([[sx * 130 - 22, -260], [sx * 130, -300], [sx * 130 + 22, -260]], cor) } c.restore() }
// rua de paralelepípedos com calçada, sarjeta e poças refletindo a luz
function rua(y, t, o = {}) {
  c.fillStyle = o.calcada || '#4a4a44'; c.fillRect(0, y, W, 40); c.fillStyle = '#5e5c54'; c.fillRect(0, y, W, 6); c.fillStyle = '#2a2a26'; c.fillRect(0, y + 40, W, 8);
  c.fillStyle = o.pedra || '#34352f'; c.fillRect(0, y + 48, W, H - y - 48); const q = rng(31);
  for (let r = 0; y + 52 + r * r * 1.4 + r * 11 < H; r++) { const yy = y + 52 + r * r * 1.4 + r * 11, hh = 9 + r * 3, ww = 24 + r * 5; for (let x = -((r * 13) % ww); x < W; x += ww) { rr(x + 2, yy, ww - 4, hh - 3, 3, `rgba(${q() < .5 ? '80,80,72' : '62,62,56'},.9)`); c.fillStyle = 'rgba(255,255,240,.05)'; c.fillRect(x + 4, yy + 1, ww - 10, 3) } }
  if (o.pocas) for (let i = 0; i < 6; i++) { const px = q() * W, py = y + 120 + q() * (H - y - 140); el(px, py, 80 + q() * 80, 12, 'rgba(120,130,130,.25)'); el(px + 10, py - 2, 30, 4, 'rgba(232,166,64,.25)') }
  c.fillStyle = 'rgba(30,26,20,.35)'; for (let i = 0; i < 18; i++) el(q() * W, y + 70 + q() * (H - y - 80), 10 + q() * 20, 4 + q() * 6, 'rgba(40,32,22,.45)');
}
// lampião a gás: poste de ferro, lanterna de vidro, chama
function lampiao(x, y, h, t, aceso = 1) { line(x, y, x, y - h, '#141414', 10); rr(x - 14, y - 20, 28, 20, 3, '#1a1a1a'); line(x - 22, y - h + 30, x + 22, y - h + 30, '#141414', 5); poly([[x - 22, y - h], [x + 22, y - h], [x + 16, y - h + 50], [x - 16, y - h + 50]], aceso ? 'rgba(255,210,120,.85)' : 'rgba(80,90,90,.6)'); poly([[x - 26, y - h], [x, y - h - 22], [x + 26, y - h]], '#141414'); line(x, y - h + 50, x, y - h + 60, '#141414', 5); line(x - 16, y - h + 50, x + 16, y - h + 50, '#141414', 4); if (aceso) { add(() => glow(x, y - h + 24, 200, AMB, .45 * aceso * (.9 + .1 * sin(t * 13 + x)))); disc(x, y - h + 28, 7, F.chama) } }
// fábrica de tijolo: janelas em arco iluminadas, telhado em serra, chaminé alta
function chamine(x, y, h, w, t, seed = 1, fum = true) { tijolos(x - w / 2, y - h, w, h, '#4a2a22', .8); c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(x + w * .1, y - h, w * .4, h); rr(x - w / 2 - 8, y - h - 14, w + 16, 16, 2, '#2a1a14'); for (let k = 1; k < 4; k++) rr(x - w / 2 - 3, y - h + k * h / 4, w + 6, 6, 1, '#3a2018'); if (fum) fumaca(x, y - h - 16, 520, t, seed, '28,28,26', 1.3, .9) }
function fabrica(x, y, w, h, t, o = {}) {
  tijolos(x, y - h, w, h, o.cor || '#4e2c22'); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(x + w - 20, y - h, 20, h);
  for (let k = 0; k < Math.floor(w / 120); k++) { const sx = x + k * 120; poly([[sx, y - h], [sx + 60, y - h - 70], [sx + 120, y - h]], '#2a2e30'); poly([[sx + 60, y - h - 70], [sx + 120, y - h], [sx + 60, y - h]], '#1e2224'); poly([[sx + 66, y - h - 62], [sx + 110, y - h - 8], [sx + 66, y - h - 8]], o.noite ? 'rgba(232,166,64,.5)' : 'rgba(150,160,150,.35)') }
  for (let r = 0; r < Math.floor((h - 60) / 110); r++) for (let k = 0; k < Math.floor(w / 80); k++) { const wx = x + 24 + k * 80, wy = y - h + 40 + r * 110; c.fillStyle = (o.luz ?? 1) ? `rgba(232,166,64,${.45 + .2 * sin(t * 2 + k + r)})` : '#16181a'; c.beginPath(); c.moveTo(wx, wy + 70); c.lineTo(wx, wy + 20); c.arc(wx + 20, wy + 20, 20, PI, 0); c.lineTo(wx + 40, wy + 70); c.fill(); c.strokeStyle = '#2a2420'; c.lineWidth = 3; c.beginPath(); c.moveTo(wx + 20, wy); c.lineTo(wx + 20, wy + 70); c.moveTo(wx, wy + 40); c.lineTo(wx + 40, wy + 40); c.stroke(); rr(wx - 4, wy + 70, 48, 6, 1, '#8e8676') }
  if (o.chamine !== false) chamine(x + w * .82, y - h, o.ch || 360, 54, t, (x | 0) + 3);
  if (o.nome) { rr(x + w * .2, y - h + 8, w * .5, 30, 2, '#1e2420'); txt(o.nome, x + w * .45, y - h + 32, 22, '#c8b880', { align: 'center' }) }
}
// armazém das docas: alto, portas de carga em cada andar, viga com guincho e fardos
function armazem(x, y, w, h, t, o = {}) { tijolos(x, y - h, w, h, o.cor || '#4a3428'); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(x + w - 16, y - h, 16, h); rr(x - 6, y - h - 14, w + 12, 16, 2, '#6a645a');
  const n = Math.floor(h / 110); for (let a = 0; a < n; a++) { rr(x + w / 2 - 34, y - h + 30 + a * 110, 68, 80, 2, '#1c1a16'); rr(x + w / 2 - 34, y - h + 30 + a * 110, 10, 80, 1, '#3a3026'); for (const sx of [-1, 1]) janela(x + w / 2 + sx * 90 - 18, y - h + 40 + a * 110, 36, 50, 0, t) }
  line(x + w / 2, y - h + 20, x + w / 2 + 90, y - h + 20, '#141414', 10); const cy = y - h + 40 + ((t * 30) % 300); line(x + w / 2 + 84, y - h + 20, x + w / 2 + 84, cy, '#1a1a1a', 2); rr(x + w / 2 + 64, cy, 40, 30, 3, '#8a6e44'); if (o.nome) txt(o.nome, x + w / 2, y - h + 12, 20, '#c8bca4', { align: 'center' }) }
// guindaste de madeira das docas
function guindaste(x, y, s, t) { c.save(); c.translate(x, y); c.scale(s, s); poly([[-40, 0], [40, 0], [26, -60], [-26, -60]], '#2a2420'); line(0, -60, 0, -300, '#3a2e24', 18); const a = -.9 + sin(t * .5) * .15; c.save(); c.translate(0, -280); c.rotate(a); rr(0, -8, 260, 16, 3, '#4a3a2a'); line(0, -40, 250, -4, '#1a1a1a', 2); c.translate(250, 0); c.rotate(-a); line(0, 0, 0, 160, '#141414', 2); rr(-30, 160, 60, 36, 3, '#8a6e44'); rr(-30, 160, 60, 8, 2, '#6a5434'); c.restore(); line(0, -300, -60, -80, '#1a1a1a', 2); c.restore() }
// navio de três mastros (velas recolhidas, cordame)
function navioVela(x, y, s, t, o = {}) { c.save(); c.translate(x, y + sin(t * 1.2 + x) * 3); c.scale(s * (o.dir || 1), s);
  bezPoly([[-320, -60], [-300, 10], [280, 10], [360, -70], [380, -90], [-330, -90]], o.casco || '#1e1a18'); rr(-320, -92, 690, 14, 2, '#5a4a36'); c.fillStyle = '#c8bca4'; c.fillRect(-300, -60, 600, 10); for (let k = 0; k < 12; k++) rr(-270 + k * 48, -58, 16, 7, 1, '#1a1612');
  line(380, -90, 480, -150, '#2a2420', 8);
  for (const [mx, mh] of [[-180, 420], [20, 480], [210, 400]]) { line(mx, -90, mx, -90 - mh, '#2a2420', 10); for (let k = 0; k < 3; k++) { const yy = -150 - mh * (.3 + k * .25), ww = 110 - k * 26; line(mx - ww, yy, mx + ww, yy, '#2a2420', 6); el(mx, yy + 6, ww * .9, 9, '#a8a08c') } c.strokeStyle = 'rgba(20,18,16,.6)'; c.lineWidth = 1.5; for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(mx, -90 - mh); c.lineTo(mx + k * 60, -92); c.stroke() } if (o.bandeira) { poly([[mx, -90 - mh], [mx + 50, -80 - mh + sin(t * 4) * 4], [mx, -70 - mh]], o.bandeira) } }
  c.restore() }
// vapor de rodas (paddle steamer) com chaminé fumegando
function navioVapor(x, y, s, t, o = {}) { c.save(); c.translate(x, y + sin(t * 1.4 + x) * 3); c.scale(s * (o.dir || 1), s); bezPoly([[-260, -40], [-240, 10], [240, 10], [300, -50], [-270, -50]], '#1a1816'); rr(-200, -100, 360, 50, 4, '#3a3a34'); for (let k = 0; k < 8; k++) janela(-180 + k * 44, -90, 20, 22, 0, t, { moldura: '#5a5a50' }); c.save(); c.translate(0, -30); disc(0, 0, 70, '#2a2420'); c.rotate(t * 2); for (let k = 0; k < 10; k++) { const a = k * PI / 5; line(0, 0, cos(a) * 66, sin(a) * 66, '#4a3a2a', 6) } c.restore(); disc(0, -30, 74, 'rgba(0,0,0,0)'); bezPoly([[-74, -30], [-70, -110, 0, -112], [70, -110, 74, -30]], '#3a2e26'); rr(-30, -260, 50, 170, 4, '#2a1a14'); rr(-30, -250, 50, 16, 0, '#7a2a1e'); fumaca(-5, -270, 420, t, 7, '26,26,24', -1.4, .9); line(-180, -100, -180, -300, '#2a2420', 6); c.restore() }
// barcaça
function barcaca(x, y, s, t) { c.save(); c.translate(x, y + sin(t * 1.3 + x) * 2); c.scale(s, s); bezPoly([[-160, -30], [-150, 6], [150, 6], [170, -30]], '#2a2420'); for (let k = 0; k < 5; k++) rr(-130 + k * 52, -66, 46, 36, 3, k % 2 ? '#8a6e44' : '#6e5634'); c.restore() }
// Tâmisa
function tamisa(y, t, o = {}) { c.fillStyle = lg(0, y, 0, H, [[0, o.c1 || F.tamisa2], [1, o.c2 || '#1a2220']]); c.fillRect(0, y, W, H - y); const q = rng(6); for (let i = 0; i < 70; i++) { const yy = y + 6 + q() * (H - y), w = 40 + q() * 160 * (yy - y) / 300, x = ((q() * W + t * 14 * (q() < .5 ? 1 : -1)) % (W + 200) + W + 200) % (W + 200) - 100; pill(x, yy, w, 3 + (yy - y) / 140, `rgba(200,200,180,${.06 + q() * .1})`) } if (o.sujo) for (let i = 0; i < 40; i++) el((q() * W + t * 10) % W, y + 20 + q() * (H - y - 20), 20 + q() * 50, 5 + q() * 6, `rgba(${80 + q() * 30 | 0},${70 + q() * 20 | 0},40,.45)`) }
// ônibus a cavalo de dois andares, com bancos no teto e placas de propaganda
function omnibus(x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s * (o.dir || 1), s);
  cavaloLado(330, 0, .62, t, { arreio: true, cor: '#4a3020', passo: t * 1.1 }); cavaloLado(370, 10, .62, t, { arreio: true, cor: '#2a2420', passo: t * 1.1 + .5 });
  bezPoly([[-220, -60], [-230, -260], [200, -260], [210, -60]], o.cor || '#3a4a3e'); rr(-230, -270, 440, 16, 3, '#1e2420'); rr(-226, -120, 430, 16, 2, '#c8b880');
  for (let k = 0; k < 6; k++) { janela(-200 + k * 64, -230, 46, 70, o.noite ? 1 : 0, t, { moldura: '#2a2420' }) }
  rr(-226, -100, 430, 34, 2, '#5a2e24'); txt(o.rota || 'CHARING CROSS · BANK', -10, -76, 22, '#e8dcc0', { align: 'center' });
  for (let k = 0; k < 6; k++) { c.save(); c.translate(-180 + k * 70, -318); c.scale(.62, .62); rr(-24, 0, 48, 50, 10, k % 2 ? '#22262a' : '#3a3a34'); c.translate(0, -20); cabecaLado({ chapeu: k % 2 ? 'cartola' : 'coco', barba: k % 3 ? null : 'bigode' }); c.restore() } rr(-210, -330, 400, 56, 3, '#d8ccb0'); rr(-210, -330, 400, 6, 2, '#b8ac94'); txt(o.anuncio || 'TEA · COCOA · SOAP', -10, -292, 28, '#5a1e1e', { align: 'center' });
  rr(-240, -250, 20, 200, 3, '#2a2420'); line(-240, -60, -270, -60, '#2a2420', 6);
  for (const wx of [-150, 130]) { c.save(); c.translate(wx, -40); disc(0, 0, 56, '#1a1612'); c.strokeStyle = '#5a4a36'; c.lineWidth = 7; c.beginPath(); c.arc(0, 0, 48, 0, 7); c.stroke(); c.rotate(t * 3); for (let k = 0; k < 12; k++) line(0, 0, cos(k * PI / 6) * 48, sin(k * PI / 6) * 48, '#5a4a36', 4); disc(0, 0, 10, '#2a2420'); c.restore() }
  line(200, -60, 280, -110, '#2a2420', 6);
  c.restore();
}
// carroça de carga puxada por um cavalo
function carroca(x, y, s, t, o = {}) { c.save(); c.translate(x, y); c.scale(s * (o.dir || 1), s); cavaloLado(260, 0, .7, t, { arreio: true, cor: o.cavalo || '#5a3a24', passo: t * 1.1 }); rr(-200, -150, 300, 70, 4, '#4a3a2a'); rr(-200, -150, 300, 12, 2, '#6a5438'); for (let k = 0; k < (o.carga ?? 5); k++) rr(-190 + k * 56, -210, 50, 60, 4, k % 2 ? '#8a6e44' : '#a08050'); line(100, -110, 200, -120, '#2a2420', 6); for (const wx of [-120, 40]) { c.save(); c.translate(wx, -50); disc(0, 0, 50, '#1a1612'); c.strokeStyle = '#6a5438'; c.lineWidth = 6; c.beginPath(); c.arc(0, 0, 42, 0, 7); c.stroke(); c.rotate(t * 3.4); for (let k = 0; k < 10; k++) line(0, 0, cos(k * PI / 5) * 42, sin(k * PI / 5) * 42, '#6a5438', 4); c.restore() } if (o.cocheiro !== false) pessoaLado(-60, -150, 210, t, { parado: true, roupa: 'jaqueta', chapeu: 'coco', cor: '#3a3a34' }); c.restore() }
// cabriolé (hansom cab): cocheiro alto atrás
function hansom(x, y, s, t, o = {}) { c.save(); c.translate(x, y); c.scale(s * (o.dir || 1), s); cavaloLado(240, 0, .66, t, { arreio: true, cor: '#1e1a18', passo: t * 1.2 }); bezPoly([[-120, -80], [-140, -240], [60, -250], [80, -90]], '#1a1e22'); janela(-100, -220, 70, 80, o.noite ? 1 : 0, t, { moldura: '#2a2a2a' }); c.save(); c.translate(-40, -60); disc(0, 0, 80, 'rgba(0,0,0,0)'); c.strokeStyle = '#2a2420'; c.lineWidth = 7; c.beginPath(); c.arc(0, 0, 76, 0, 7); c.stroke(); c.rotate(t * 2.2); for (let k = 0; k < 12; k++) line(0, 0, cos(k * PI / 6) * 76, sin(k * PI / 6) * 76, '#2a2420', 3.5); c.restore(); line(60, -120, 230, -150, '#1a1612', 6); pessoaLado(-150, -250, 200, t, { parado: true, chapeu: 'cartola', cor: '#22262a' }); c.restore() }
// locomotiva a vapor (de lado) com vagões
function locomotiva(x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s * (o.dir || 1), s); const rod = t * (o.vel ?? 6);
  for (let v = 1; v <= (o.vagoes ?? 3); v++) { const vx = -v * 360; rr(vx - 150, -230, 320, 170, 8, '#2e3a32'); rr(vx - 150, -246, 320, 20, 6, '#1e2420'); for (let k = 0; k < 4; k++) janela(vx - 120 + k * 76, -200, 46, 60, o.noite ? 1 : 0, t, { moldura: '#c8b880' }); line(vx - 150, -100, vx + 170, -100, '#c8b880', 3); for (const wx of [-100, 110]) { disc(vx + wx, -50, 34, '#141414'); disc(vx + wx, -50, 10, '#3a3a34') } line(vx + 170, -70, vx + 210, -70, '#141414', 8) }
  rr(-200, -280, 150, 230, 6, '#1e2420'); rr(-190, -260, 60, 70, 4, o.noite ? 'rgba(232,166,64,.7)' : '#3a4440'); rr(-210, -296, 170, 22, 6, '#141414');
  rr(-60, -210, 300, 130, 30, '#2a3430'); rr(-60, -210, 300, 30, 14, '#3e4a44'); for (let k = 0; k < 4; k++) rr(-40 + k * 70, -212, 8, 132, 2, '#b8a070');
  rr(150, -300, 46, 100, 6, '#141414'); rr(140, -312, 66, 18, 6, '#141414'); el(60, -216, 34, 24, '#b8a070'); rr(250, -150, 40, 70, 6, '#141414'); poly([[290, -60], [340, -20], [290, -20]], '#5a1e1e'); if (o.farol || o.noite) { disc(272, -170, 16, F.chama); add(() => glow(300, -170, 260, AMB, .5)) }
  for (const [wx, r] of [[-130, 46], [10, 64], [150, 64]]) { c.save(); c.translate(wx, -50); disc(0, 0, r, '#141414'); c.strokeStyle = '#7a2a1e'; c.lineWidth = 6; c.beginPath(); c.arc(0, 0, r - 8, 0, 7); c.stroke(); c.rotate(rod); for (let k = 0; k < 10; k++) line(0, 0, cos(k * PI / 5) * (r - 8), sin(k * PI / 5) * (r - 8), '#3a3a34', 4); disc(0, 0, 10, '#b8a070'); c.restore() }
  line(10 + cos(rod) * 40, -50 + sin(rod) * 40, 150 + cos(rod) * 40, -50 + sin(rod) * 40, '#b8a070', 8);
  fumaca(172, -320, 520, t, 3, '40,40,38', -1.6, .95); for (let k = 0; k < 4; k++) { const ph = (t * .8 + k * .25) % 1; disc(240 + ph * 60, -40 - ph * 30, 20 + ph * 40, `rgba(220,220,210,${.5 * (1 - ph)})`) }
  c.restore();
}
// máquina a vapor de balancim (estilo Watt): balancim, cilindro, biela, volante e regulador de bolas
function maquinaVapor(t, cx = 960, cy = 620, s = 1) {
  c.save(); c.translate(cx, cy); c.scale(s, s); const a = t * 1.6, bal = sin(a) * .22;
  tijolos(-700, -520, 1400, 640, '#3a2620', 1.2); c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(-700, -520, 1400, 640); rr(-720, 100, 1440, 300, 0, '#22201c');
  rr(-60, -460, 120, 560, 6, '#2e2a26'); rr(-60, -460, 50, 560, 6, '#3e3832'); rr(-90, -470, 180, 30, 4, '#22201c');
  c.save(); c.translate(0, -440); c.rotate(bal); rr(-420, -30, 840, 60, 14, '#4a3e34'); rr(-420, -30, 840, 18, 10, '#6a5a48'); for (let k = -3; k <= 3; k++) disc(k * 110, 0, 10, '#b8a070'); c.restore(); disc(0, -440, 22, '#b8a070');
  const ex = -380 * cos(bal), ey = -440 - 380 * sin(bal); rr(-460, -260, 160, 300, 10, '#3a3832'); rr(-460, -260, 60, 300, 10, '#4e4a42'); for (let k = 0; k < 4; k++) rr(-470, -250 + k * 80, 180, 10, 3, '#b8a070'); line(ex, ey, -380, -262, '#b8a070', 14);
  const bx = 380 * cos(bal), by = -440 + 380 * sin(bal), fx = 420, fy = 40, R = 260, crx = fx + cos(a) * 120, cry = fy + sin(a) * 120;
  line(bx, by, crx, cry, '#6a5a48', 22); line(bx, by, crx, cry, '#8a7a64', 8);
  c.save(); c.translate(fx, fy); disc(0, 0, R, '#2a2622'); c.strokeStyle = '#5a4e40'; c.lineWidth = 30; c.beginPath(); c.arc(0, 0, R - 18, 0, 7); c.stroke(); c.rotate(a); for (let k = 0; k < 6; k++) { c.save(); c.rotate(k * PI / 3); rr(-12, 0, 24, R - 30, 6, '#4a4034'); c.restore() } disc(0, 0, 40, '#b8a070'); c.restore(); disc(crx, cry, 16, '#d8c890');
  c.save(); c.translate(-200, -300); line(0, 0, 0, -140, '#b8a070', 8); c.rotate(a * 2); const ab = .5 + .15 * sin(a); for (const sx of [-1, 1]) { line(0, -140, sx * 70 * sin(ab + .5), -140 + 70 * cos(ab + .5), '#b8a070', 5); disc(sx * 70 * sin(ab + .5), -140 + 70 * cos(ab + .5), 20, '#d8c890') } c.restore();
  for (let k = 0; k < 6; k++) { const ph = (t * .5 + k / 6) % 1; disc(-380 + sin(k) * 30, -280 - ph * 300, 30 + ph * 80, `rgba(220,220,210,${.4 * (1 - ph)})`) }
  add(() => glow(-300, 200, 400, AMB, .18)); c.restore();
}
// Palácio de Westminster com a torre do relógio
function parlamento(x, y, s, t, o = {}) { c.save(); c.translate(x, y); c.scale(s, s); const cor = o.cor || '#4a463a', cor0 = sh(cor, .7);
  c.fillStyle = cor; c.fillRect(-600, -200, 1200, 200); for (let k = 0; k < 30; k++) { const px = -590 + k * 40; poly([[px, -200], [px + 8, -236], [px + 16, -200]], cor); rr(px + 12, -170, 14, 60, 2, o.noite ? 'rgba(232,166,64,.6)' : '#262620'); rr(px + 12, -90, 14, 60, 2, o.noite && k % 3 ? 'rgba(232,166,64,.5)' : '#262620') }
  c.fillStyle = cor0; c.fillRect(-640, -400, 140, 400); poly([[-640, -400], [-570, -470], [-500, -400]], cor0);
  c.fillStyle = cor; c.fillRect(480, -560, 100, 560); c.fillStyle = cor0; c.fillRect(530, -560, 50, 560); rr(470, -660, 120, 100, 4, cor); disc(530, -610, 40, '#d8ccb0'); c.strokeStyle = '#1a1a1a'; c.lineWidth = 4; c.beginPath(); c.arc(530, -610, 40, 0, 7); c.stroke(); line(530, -610, 530 + sin(t * .1) * 28, -610 - cos(t * .1) * 28, '#1a1a1a', 4); line(530, -610, 550, -600, '#1a1a1a', 4); poly([[470, -660], [530, -800], [590, -660]], cor0); line(530, -800, 530, -840, cor0, 6);
  c.restore() }
// Palácio de Cristal: ferro e vidro, transepto em arco
function palacioCristal(t, o = {}) { const y = o.y ?? 860, x0 = 120, x1 = 1800;
  const vidro = (x, yy, w, h) => { c.fillStyle = 'rgba(170,190,190,.35)'; c.fillRect(x, yy, w, h); c.strokeStyle = 'rgba(30,34,34,.85)'; c.lineWidth = 2; for (let gx = x; gx <= x + w; gx += 24) { c.beginPath(); c.moveTo(gx, yy); c.lineTo(gx, yy + h); c.stroke() } for (let gy = yy; gy <= yy + h; gy += 30) { c.beginPath(); c.moveTo(x, gy); c.lineTo(x + w, gy); c.stroke() } c.fillStyle = 'rgba(255,255,240,.12)'; c.beginPath(); c.moveTo(x, yy); c.lineTo(x + w * .3, yy); c.lineTo(x, yy + h * .7); c.fill() };
  vidro(x0, y - 220, x1 - x0, 220); vidro(x0 + 80, y - 320, x1 - x0 - 160, 100); vidro(x0 + 200, y - 400, x1 - x0 - 400, 80);
  c.save(); c.beginPath(); c.moveTo(780, y - 400); c.arc(960, y - 400, 180, PI, 0); c.lineTo(1140, y); c.lineTo(780, y); c.closePath(); c.clip(); vidro(780, y - 600, 360, 600); c.restore(); c.strokeStyle = '#1e2222'; c.lineWidth = 6; c.beginPath(); c.arc(960, y - 400, 180, PI, 0); c.stroke(); for (let k = 1; k < 8; k++) { const a = PI + k * PI / 8; c.beginPath(); c.moveTo(960, y - 400); c.lineTo(960 + cos(a) * 180, y - 400 + sin(a) * 180); c.stroke() }
  for (let k = 0; k < 9; k++) { const fx = x0 + 60 + k * 200; c.save(); c.translate(fx, y - 420); line(0, 0, 0, -40, '#1e2222', 3); poly([[0, -40], [28, -34 + sin(t * 4 + k) * 4], [0, -28]], k % 2 ? '#7a2a1e' : '#2f4a3e'); c.restore() }
  rr(0, y, W, H - y, 0, '#3a3e30'); for (let k = 0; k < 9; k++) el(160 + k * 200, y + 40, 60, 14, 'rgba(60,80,50,.6)') }
// Tower Bridge (aberta em 1894): torres góticas e passarelas altas
function towerBridge(x, y, s, t, o = {}) { c.save(); c.translate(x, y); c.scale(s, s); const cor = o.cor || '#3a3a34', cor0 = sh(cor, .7);
  for (const tx of [-260, 260]) { c.fillStyle = cor; c.fillRect(tx - 70, -520, 140, 520); c.fillStyle = cor0; c.fillRect(tx, -520, 70, 520); poly([[tx - 80, -520], [tx, -640], [tx + 80, -520]], cor0); for (const sx of [-1, 1]) { c.fillStyle = cor; c.fillRect(tx + sx * 64 - 10, -600, 20, 100); poly([[tx + sx * 64 - 12, -600], [tx + sx * 64, -640], [tx + sx * 64 + 12, -600]], cor) } for (let k = 0; k < 4; k++) rr(tx - 20, -470 + k * 100, 40, 60, 20, o.noite ? 'rgba(232,166,64,.6)' : '#262620') }
  rr(-190, -460, 380, 50, 2, cor0); for (let k = 0; k < 10; k++) line(-190 + k * 38, -460, -190 + k * 38 + 38, -410, cor, 3);
  rr(-700, -140, 1400, 40, 2, cor0); for (const sx of [-1, 1]) { c.strokeStyle = cor0; c.lineWidth = 10; c.beginPath(); c.moveTo(sx * 330, -460); c.quadraticCurveTo(sx * 520, -200, sx * 720, -140); c.stroke() }
  c.restore() }
// mapa da Grã-Bretanha (contorno simplificado)
const GB = [[.42, .02], [.52, .0], [.56, .1], [.5, .18], [.6, .24], [.58, .34], [.64, .44], [.7, .56], [.78, .64], [.86, .72], [.84, .8], [.92, .86], [.8, .92], [.66, .96], [.5, .98], [.38, 1], [.3, .96], [.4, .9], [.36, .84], [.44, .8], [.4, .74], [.32, .76], [.34, .68], [.42, .62], [.4, .52], [.34, .46], [.38, .36], [.32, .3], [.36, .2], [.32, .12], [.38, .08]];
function mapaGB(t, cx, cy, s, o = {}) { const P2 = GB.map(([u, v]) => [cx + (u - .6) * s * .8, cy + (v - .5) * s]); c.save(); c.translate(8, 10); poly(P2, 'rgba(0,0,0,.4)'); c.restore(); poly(P2, o.cor || '#4a4c40', '#8e8676', 3); const lon = [cx + (.78 - .6) * s * .8, cy + (.88 - .5) * s]; if (o.londres !== false) { disc(lon[0], lon[1], 14, F.ambar); c.strokeStyle = F.ambar; c.lineWidth = 4; c.beginPath(); c.arc(lon[0], lon[1], 20 + (t * 30 % 30), 0, 7); c.stroke(); txt('LONDRES', lon[0] + 30, lon[1] + 12, 40, F.creme) } return lon }
// túnel de tijolos (esgoto ou metrô)
function tunel(t, o = {}) { c.fillStyle = '#0a0a0a'; c.fillRect(0, 0, W, H); for (let k = 9; k >= 0; k--) { const u = k / 9, r = lerp(820, 90, Math.pow(u, .6)), cy = lerp(620, 470, u); c.fillStyle = sh(o.cor || '#5a3a2c', lerp(1, .25, u)); c.beginPath(); c.ellipse(960, cy, r * 1.2, r, 0, 0, 7); c.fill(); c.fillStyle = o.fundo || '#0c0c0a'; c.beginPath(); c.ellipse(960, cy, r * 1.2 - 34 * (1 - u * .7), r - 34 * (1 - u * .7), 0, 0, 7); c.fill() } c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 2; for (let k = 0; k < 40; k++) { const a = PI + k * PI / 40; c.beginPath(); c.moveTo(960 + cos(a) * 980, 620 + sin(a) * 820); c.lineTo(960 + cos(a) * 110, 470 + sin(a) * 90); c.stroke() } }
// bomba d'água pública de ferro (Broad Street)
function bomba(x, y, s, t, o = {}) { c.save(); c.translate(x, y); c.scale(s, s); rr(-60, -20, 120, 20, 3, '#2a2a26'); rr(-34, -360, 68, 340, 10, '#22261e'); rr(-34, -360, 26, 340, 8, '#34382e'); rr(-44, -380, 88, 30, 6, '#1a1c16'); disc(0, -394, 18, '#1a1c16'); rr(30, -230, 70, 18, 6, '#22261e'); el(100, -214, 10, 14, '#22261e'); if (o.alavanca !== false) { c.save(); c.translate(-30, -280); c.rotate(o.ang ?? -.4); rr(-150, -8, 150, 16, 6, '#1a1c16'); c.restore() } else { disc(-30, -280, 8, '#3a3a32') } for (let k = 0; k < 3; k++) rr(-36, -320 + k * 100, 72, 8, 2, '#3a3e34'); if (o.agua) for (let k = 0; k < 6; k++) { const ph = (t * 2 + k / 6) % 1; disc(104, -200 + ph * 180, 5, `rgba(150,170,160,${.7 * (1 - ph)})`) } c.restore() }
