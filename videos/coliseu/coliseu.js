// ================= Coliseu: prédio, arena, gladiadores, romanos e animais (modelo Recorte Dourado) =================
const TRAV = ['#5e5240', '#9a8a6c', '#d6c6a0', '#efe3c2', '#b8a682']; // travertino: sombra → luz
const OURO = '#f0b94a', CREME = '#fff6e0', PALHA = '#e6d3a0', SANGUE = '#a8382a', PURPURA = '#6a2a4a';
const FONTE = '"Fira Sans Extra Condensed", sans-serif';
const ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIIII', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI', 'XXII', 'XXIII', 'XXIIII', 'XXV', 'XXVI', 'XXVII', 'XXVIII', 'XXIX', 'XXX'];

// ---------- fachada (elevação curva). base = chão; Wd = largura; Ht = altura (48 m) ----------
const ANDARES = [0, .22, .465, .70, 1.0];
function coliseuFachada(cx, base, Wd, Ht, t, o = {}) {
  const N = o.n || 36, amp = Ht * .035, pal = o.pal || TRAV;
  const X = th => cx + Wd / 2 * sin(th), Y = (f, th) => base - Ht * f + amp * cos(th);
  const ths = []; for (let i = 0; i <= N; i++) ths.push(-PI / 2 + PI * i / N);
  // interior visível por cima (lado de lá da arquibancada)
  if (!o.semDentro) { c.fillStyle = shadeHex(pal[1], .8); c.beginPath(); c.moveTo(X(-PI / 2), Y(1, -PI / 2)); for (const th of ths) c.lineTo(X(th), base - Ht - amp * 2.2 * cos(th) - Ht * .07 * cos(th)); for (let i = ths.length - 1; i >= 0; i--) c.lineTo(X(ths[i]), Y(1, ths[i])); c.fill();
    c.strokeStyle = 'rgba(40,30,20,.35)'; c.lineWidth = Math.max(1, Ht * .004); for (let k = 1; k < 6; k++) { c.beginPath(); ths.forEach((th, i) => { const y = lerp(Y(1, th), base - Ht - amp * 2.2 * cos(th) - Ht * .07 * cos(th), k / 6); i ? c.lineTo(X(th), y) : c.moveTo(X(th), y) }); c.stroke() } }
  const ruinaAte = o.ruina ? (th => th < -.25 ? (th < -1.1 ? 1 : th < -.8 ? 2 : th < -.5 ? 2 : 3) : 4) : (() => 4);
  if (o.ruina) { // anel interno aparece onde o externo caiu
    for (let i = 0; i < N; i++) { const a = ths[i], b = ths[i + 1]; if (a > -.25) continue; const x0 = X(a) + Wd * .03, x1 = X(b) + Wd * .03, top = Y(.86, a);
      poly([[x0, Y(0, a)], [x1, Y(0, b)], [x1, top], [x0, top]], shadeHex(pal[1], .85)); c.fillStyle = 'rgba(30,24,18,.75)'; for (const [f0, f1] of [[.47, .64], [.72, .82]]) { const yy0 = Y(f1, a), yy1 = Y(f0, a), w = (x1 - x0) * .55; c.beginPath(); c.moveTo(x0 + (x1 - x0) * .22, yy1); c.lineTo(x0 + (x1 - x0) * .22, yy0 + w / 2); c.arc((x0 + x1) / 2, yy0 + w / 2, w / 2, PI, 0); c.lineTo(x0 + (x1 - x0) * .78, yy1); c.fill() } } }
  for (let i = 0; i < N; i++) {
    const a = ths[i], b = ths[i + 1], m = (a + b) / 2, x0 = X(a), x1 = X(b), bw = x1 - x0, luz = clamp(.55 + .45 * sin(m + .9)), lim = ruinaAte(m);
    const cor = k => pal[Math.min(4, Math.max(0, Math.round(lerp(0, 3, luz)) + k))];
    for (let s = 0; s < Math.min(lim, 4); s++) {
      const yb = Y(ANDARES[s], m), yt = Y(ANDARES[s + 1], m);
      let ytop = yt; if (o.ruina && s === lim - 1 && lim < 4) ytop = lerp(yb, yt, .55 + .35 * ((i * 37) % 7) / 7);
      poly([[x0, Y(ANDARES[s], a)], [x1, Y(ANDARES[s], b)], [x1, ytop], [x0, ytop]], cor(0));
      if (s < 3) {
        const aw = bw * .62, ax = x0 + bw * .19, ah = (yb - yt) * .78, ay = yb - ah;
        if (ytop <= ay + aw / 2) { c.fillStyle = s === 0 ? '#2e241a' : '#3a2e22'; c.beginPath(); c.moveTo(ax, yb); c.lineTo(ax, ay + aw / 2); c.arc(ax + aw / 2, ay + aw / 2, aw / 2, PI, 0); c.lineTo(ax + aw, yb); c.closePath(); c.fill();
          c.strokeStyle = cor(1); c.lineWidth = Math.max(1, bw * .06); c.beginPath(); c.arc(ax + aw / 2, ay + aw / 2, aw / 2 + bw * .03, PI, 0); c.stroke();
          if (s > 0 && o.estatuas !== false && bw > 8) { const sx = ax + aw / 2, sh = ah * .62; c.fillStyle = cor(2); c.beginPath(); c.ellipse(sx, yb - sh * .93, sh * .07, sh * .08, 0, 0, 7); c.fill(); poly([[sx - sh * .1, yb - sh * .82], [sx + sh * .1, yb - sh * .82], [sx + sh * .13, yb - sh * .05], [sx - sh * .13, yb - sh * .05]], cor(2)); c.fillStyle = cor(1); c.fillRect(sx - sh * .16, yb - sh * .06, sh * .32, sh * .06) }
          if (s === 0 && o.numeros && bw > 30) { const n = (o.numeros + i) % 30; txt(ROMANOS[n], ax + aw / 2, ay - bw * .02, Math.min(28, bw * .22), shadeHex(pal[0], .9), { align: 'center', w: 800, sh: 0 }) } }
        // meia-coluna com capitel
        const cw = bw * .14; c.fillStyle = cor(1); c.fillRect(x0 - cw / 2, ytop, cw, yb - ytop); c.fillStyle = cor(2); c.fillRect(x0 - cw / 2, ytop, cw * .4, yb - ytop);
        if (ytop === yt) { c.fillStyle = cor(2); c.fillRect(x0 - cw * .8, yt + (yb - yt) * .1, cw * 1.6, (yb - yt) * .05); if (s === 1 && bw > 14) { disc(x0 - cw * .55, yt + (yb - yt) * .14, cw * .28, cor(1)); disc(x0 + cw * .55, yt + (yb - yt) * .14, cw * .28, cor(1)) } if (s === 2 && bw > 14) for (let k = -1; k <= 1; k++) poly([[x0 + k * cw * .4, yt + (yb - yt) * .15], [x0 + k * cw * .4 - cw * .2, yt + (yb - yt) * .1], [x0 + k * cw * .4 + cw * .2, yt + (yb - yt) * .1]], cor(1)) }
        // entablamento
        if (ytop === yt) { c.fillStyle = cor(2); c.beginPath(); c.moveTo(x0, yt); c.lineTo(x1, Y(ANDARES[s + 1], b)); c.lineTo(x1, Y(ANDARES[s + 1], b) + (yb - yt) * .1); c.lineTo(x0, yt + (yb - yt) * .1); c.fill(); c.fillStyle = 'rgba(30,24,18,.25)'; c.fillRect(x0, yt + (yb - yt) * .1, bw, Math.max(1, (yb - yt) * .02)) }
      } else if (lim === 4) { // ático
        const pw = bw * .12; if (i % 2 === 0) { c.fillStyle = cor(1); c.fillRect(x0 - pw / 2, yt, pw, yb - yt) }
        if (i % 2 === 1 && bw > 6) { c.fillStyle = '#3a2e22'; c.fillRect(x0 + bw * .32, yt + (yb - yt) * .42, bw * .36, (yb - yt) * .2) }
        c.fillStyle = cor(2); for (let k = 0; k < 3; k++) c.fillRect(x0 + bw * (.18 + k * .3), yt + (yb - yt) * .08, bw * .1, (yb - yt) * .06);
        c.fillStyle = cor(2); c.fillRect(x0, yt - (yb - yt) * .03, bw + .5, (yb - yt) * .05);
        if (o.mastros !== false && i % 2 === 0) line(x0 + bw * .2, yt, x0 + bw * .2, yt - (yb - yt) * .5, '#5a4a36', Math.max(1, bw * .05));
      }
    }
    if (o.ruina && lim < 4) { c.fillStyle = cor(-1); const yy = Y(ANDARES[lim], m); for (let k = 0; k < 3; k++) c.fillRect(x0 + bw * k / 3, yy - (k % 2) * bw * .2, bw / 3, bw * .25) }
  }
  c.fillStyle = 'rgba(30,24,18,.3)'; c.beginPath(); c.moveTo(X(-PI / 2), Y(0, -PI / 2)); ths.forEach(th => c.lineTo(X(th), Y(0, th))); c.lineTo(X(PI / 2), Y(0, PI / 2) + Ht * .03); c.lineTo(X(-PI / 2), Y(0, -PI / 2) + Ht * .03); c.fill();
}
// ---------- planta vista de cima ----------
function coliseuPlanta(cx, cy, rx, ry, t, o = {}) {
  const ring = (k, col) => { c.fillStyle = col; c.beginPath(); c.ellipse(cx, cy, rx * k, ry * k, 0, 0, 7); c.fill() };
  ring(1.03, '#3a2e22'); ring(1, '#cbb88e'); ring(.93, '#a8966e'); ring(.86, '#bfae86'); ring(.74, '#a8966e'); ring(.62, '#c8b68e'); ring(.555, '#e6dcc0');
  c.strokeStyle = 'rgba(60,44,30,.35)'; c.lineWidth = 1.5; for (let k = 0; k < 40; k++) { const a = k / 40 * 2 * PI; c.beginPath(); c.moveTo(cx + cos(a) * rx * .56, cy + sin(a) * ry * .56); c.lineTo(cx + cos(a) * rx * .99, cy + sin(a) * ry * .99); c.stroke() }
  for (let k = 0; k < 80; k++) { const a = k / 80 * 2 * PI; disc(cx + cos(a) * rx * 1.015, cy + sin(a) * ry * 1.015, Math.max(2, rx * .012), '#2a2018') }
  c.fillStyle = '#d8b880'; c.beginPath(); c.ellipse(cx, cy, rx * .44, ry * .30, 0, 0, 7); c.fill();
  if (o.hipogeu) { c.strokeStyle = 'rgba(80,60,40,.6)'; c.lineWidth = 2; for (let k = -6; k <= 6; k++) { c.beginPath(); c.moveTo(cx + k * rx * .06, cy - ry * .26); c.lineTo(cx + k * rx * .06, cy + ry * .26); c.stroke() } }
  c.strokeStyle = '#8a6a40'; c.lineWidth = 3; c.beginPath(); c.ellipse(cx, cy, rx * .44, ry * .30, 0, 0, 7); c.stroke();
}
// ---------- multidão (cabeças e ombros em fileiras) ----------
const ROUPAS = ['#efe7d4', '#e6dcc0', '#c8b48a', '#8a4a34', '#a85a3a', '#5a6a7a', '#7a8a5a', '#d9b35a', '#6a3a4a', '#f2ece0'];
function fileiraGente(x0, x1, y, s, seed, t, o = {}) { const q = rng(seed), n = Math.floor((x1 - x0) / (s * 1.25)); for (let i = 0; i < n; i++) { const x = x0 + (i + .5) * (x1 - x0) / n + (q() - .5) * s * .3, cor = ROUPAS[Math.floor(q() * ROUPAS.length)], b = o.agita ? Math.max(0, sin(t * 6 + i * 1.7 + seed)) * s * .25 : 0; c.fillStyle = cor; c.beginPath(); c.ellipse(x, y - b + s * .25, s * .55, s * .55, 0, PI, 0); c.fill(); disc(x, y - b - s * .45, s * .3, ['#c99a74', '#a8784f', '#e0b48e', '#8a5a3a'][Math.floor(q() * 4)]); disc(x, y - b - s * .58, s * .27, ['#2a2018', '#5a3a22', '#1c1a18', '#8a6a3a'][Math.floor(q() * 4)]); if (o.bracos && q() < .2) line(x + s * .4, y - b, x + s * .6, y - b - s * 1.1, cor, s * .2) } }
// ---------- arena vista de dentro (da arquibancada) ----------
function arenaVista(t, o = {}) {
  const cy = o.cy ?? 760, rx = o.rx ?? 820, ry = o.ry ?? 210, ceu = o.ceu || [[0, '#7fa3b0'], [.7, '#cfd2b8'], [1, '#efe2bc']];
  c.fillStyle = lg(0, 0, 0, 300, ceu); c.fillRect(0, 0, W, H);
  if (o.sol !== false) sunGlow(o.solX ?? 1500, o.solY ?? 120, 360, '255,240,200', .7);
  // anel de lá: arquibancadas em faixas elípticas
  const top = cy - ry - 420; c.fillStyle = '#b8a682'; c.beginPath(); c.ellipse(W / 2, cy, rx + 700, ry + 420, 0, PI, 0); c.lineTo(W + 400, cy); c.lineTo(-400, cy); c.fill();
  for (let k = 0; k < 12; k++) { const u = k / 12, ex = lerp(rx + 680, rx + 30, u), ey = lerp(ry + 400, ry + 26, u); c.strokeStyle = k % 3 === 0 ? '#8a7a5a' : 'rgba(80,64,44,.4)'; c.lineWidth = k % 3 === 0 ? 6 : 2; c.beginPath(); c.ellipse(W / 2, cy, ex, ey, 0, PI, 0); c.stroke();
    if (o.gente !== false) { const q = rng(k + 3); for (let i = 0; i < 70; i++) { const a = PI + (i + q()) / 70 * PI, px = W / 2 + cos(a) * (ex - 14), py = cy + sin(a) * (ey - 8); if (py > cy - ry * .3) continue; const s = lerp(4, 9, u), b = o.agita ? Math.max(0, sin(t * 6 + i + k)) * s * .5 : 0; c.fillStyle = ROUPAS[(i * 7 + k) % ROUPAS.length]; c.fillRect(px - s * .6, py - s * 1.1 - b, s * 1.2, s * 1.2); disc(px, py - s * 1.4 - b, s * .45, ['#c99a74', '#a8784f', '#e0b48e'][(i + k) % 3]) } } }
  // ático e mastros lá no alto
  c.fillStyle = '#9a8a6c'; c.beginPath(); c.ellipse(W / 2, cy, rx + 720, ry + 440, 0, PI, 0); c.ellipse(W / 2, cy, rx + 700, ry + 420, 0, 0, PI, true); c.fill();
  for (let k = 1; k < 30; k++) { const a = PI + k / 30 * PI, px = W / 2 + cos(a) * (rx + 715), py = cy + sin(a) * (ry + 435); line(px, py, px, py - 60, '#5a4a36', 3) }
  if (o.velario) { const u = o.velario; for (let k = 0; k < 16; k++) { const a0 = PI + k / 16 * PI, a1 = PI + (k + .9) / 16 * PI, r0 = 1.0, r1 = lerp(1, .55, u); poly([[W / 2 + cos(a0) * (rx + 715) * r0, cy + sin(a0) * (ry + 435) * r0 - 60], [W / 2 + cos(a1) * (rx + 715) * r0, cy + sin(a1) * (ry + 435) * r0 - 60], [W / 2 + cos(a1) * (rx + 715) * r1, cy + sin(a1) * (ry + 435) * r1 - 60 - 40 * u], [W / 2 + cos(a0) * (rx + 715) * r1, cy + sin(a0) * (ry + 435) * r1 - 60 - 40 * u]], k % 2 ? '#e8dcc0' : '#d6c6a0') } }
  // camarote do imperador (pulvinar)
  if (o.camarote !== false) { const px = o.camX ?? W / 2, py = cy - ry - 40; c.fillStyle = '#efe3c2'; c.fillRect(px - 110, py - 70, 220, 74); c.fillStyle = PURPURA; c.fillRect(px - 100, py - 34, 200, 30); for (let k = 0; k < 5; k++) { c.fillStyle = '#d6c6a0'; c.fillRect(px - 100 + k * 48, py - 110, 10, 76) } poly([[px - 120, py - 110], [px + 120, py - 110], [px, py - 150]], '#c8452f'); c.fillStyle = '#d9b35a'; c.fillRect(px - 120, py - 112, 240, 5); if (o.imperador !== false) { c.save(); c.translate(px, py - 30); c.scale(.6, .6); romano(0, 0, 90, IMPERADOR, t); c.restore() } }
  // muro do pódio e arena de areia
  c.fillStyle = '#efe7d4'; c.beginPath(); c.ellipse(W / 2, cy, rx + 30, ry + 26, 0, 0, 7); c.fill(); c.fillStyle = '#8a6a40'; c.beginPath(); c.ellipse(W / 2, cy, rx + 30, ry + 26, 0, PI, 0); c.ellipse(W / 2, cy, rx + 30, ry + 14, 0, 0, PI, true); c.fill();
  c.fillStyle = bands(0, cy - ry, 0, cy + ry, [[.3, '#cfae78'], [.7, '#d8b880'], [1, '#e2c490']]); c.beginPath(); c.ellipse(W / 2, cy, rx, ry, 0, 0, 7); c.fill();
  const q = rng(77); c.fillStyle = 'rgba(150,110,60,.25)'; for (let i = 0; i < 220; i++) { const a = q() * 2 * PI, r = Math.sqrt(q()); c.fillRect(W / 2 + cos(a) * r * rx * .97, cy + sin(a) * r * ry * .95, 3 + q() * 8, 2) }
  if (o.alcapoes) for (let k = -4; k <= 4; k++) { c.fillStyle = 'rgba(90,64,36,.5)'; c.fillRect(W / 2 + k * 120 - 26, cy - 14 + (k % 2) * 40, 52, 22) }
}
function primeiroPlano(t, seed, o = {}) { for (let k = 0; k < 3; k++) { c.fillStyle = ['#a8966e', '#9a8a64', '#8a7a58'][k]; c.fillRect(0, 900 + k * 70, W, 80); fileiraGente(-40, W + 40, 960 + k * 70, 34 + k * 8, seed + k, t, { agita: o.agita, bracos: o.agita }) } }

// ---------- gente de Roma ----------
function louro(x, y, s) { for (let k = 0; k < 9; k++) { const a = PI + .25 + k / 8 * (PI - .5), px = x + cos(a) * 8.2 * s, py = y + sin(a) * 7.6 * s; c.save(); c.translate(px, py); c.rotate(a + PI / 2); c.fillStyle = k % 2 ? '#5a7a3a' : '#7a9a4a'; c.beginPath(); c.ellipse(0, 0, 1.2 * s, 2.6 * s, 0, 0, 7); c.fill(); c.restore() } }
function romano(x, y, h, f, t = 0) {
  const s = h / 100, pele = f.pele || '#d2a882', ps = f.peleS || '#b38a66'; c.save(); c.translate(x, y); c.scale(s, s); c.lineCap = 'round'; c.lineJoin = 'round';
  limb([[-4, -30], [-4.4, -5]], 4.6, 4, pele); limb([[4, -30], [4.4, -5]], 4.6, 4, ps); for (const k of [-1, 1]) { c.fillStyle = '#6a4a2a'; c.beginPath(); c.ellipse(k * 4.6, -2.2, 3.6, 1.8, 0, 0, 7); c.fill(); c.strokeStyle = '#4a3020'; c.lineWidth = .6; c.beginPath(); c.moveTo(k * 2.6, -6); c.lineTo(k * 6.4, -3); c.stroke() }
  const tun = () => { c.beginPath(); c.moveTo(-5, -85); c.quadraticCurveTo(-12, -85, -14.4, -81.6); c.quadraticCurveTo(-15.6, -76, -14.6, -66); c.quadraticCurveTo(-12.6, -50, -14.6, -28); c.quadraticCurveTo(0, -25.6, 14.6, -28); c.quadraticCurveTo(12.6, -50, 14.6, -66); c.quadraticCurveTo(15.6, -76, 14.4, -81.6); c.quadraticCurveTo(12, -85, 5, -85); c.closePath() };
  c.fillStyle = f.tunica || '#efe7d4'; tun(); c.fill(); c.save(); tun(); c.clip(); c.fillStyle = shadeHex(f.tunica || '#efe7d4', .82); c.fillRect(3, -90, 16, 70);
  // toga: faixa diagonal do ombro esquerdo até o quadril direito, com dobras
  c.fillStyle = f.toga || '#f2ece0'; c.beginPath(); c.moveTo(4, -86); c.quadraticCurveTo(14, -84, 16, -70); c.lineTo(16, -26); c.lineTo(-6, -26); c.quadraticCurveTo(-12, -46, -15, -52); c.quadraticCurveTo(-4, -62, 4, -86); c.fill();
  c.strokeStyle = 'rgba(80,60,40,.25)'; c.lineWidth = .6; for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(-10 + k * 4, -52 + k * 2); c.quadraticCurveTo(-2 + k * 3, -40, -4 + k * 4, -27); c.stroke() }
  if (f.borda) { c.strokeStyle = f.borda; c.lineWidth = 2.2; c.beginPath(); c.moveTo(4, -86); c.quadraticCurveTo(-4, -62, -15, -52); c.stroke() }
  c.restore();
  limb([[-13, -80], [-15.6, -64], [-14.6, -50]], 5.4, 4.4, f.tunica || '#efe7d4'); mao(-14.6, -46.6, -1, pele, ps);
  limb([[13, -80], [15, -64], [13.4, -52]], 5.6, 4.6, f.toga || '#f2ece0'); mao(13.4, -48.4, 1, pele, ps);
  if (f.rolo) { c.fillStyle = '#e8dcc0'; c.fillRect(14.6, -54, 3, 12); c.fillStyle = '#8a6a40'; c.fillRect(14.2, -55, 3.8, 1.4); c.fillRect(14.2, -42.6, 3.8, 1.4) }
  c.fillStyle = ps; c.fillRect(-2.4, -89, 4.8, 4.6);
  c.translate(0, -92.4); c.scale(.64, .64); rosto(f.rosto || { estilo: 'curto', cabelo: '#3a2a1c' }); if (f.louro) louro(0, -4, 1.05);
  c.restore();
}
const IMPERADOR = { tunica: '#efe7d4', toga: '#6a2a4a', borda: '#d9b35a', louro: 1, rolo: 1, rosto: { estilo: 'curto', velho: 1, cabelo: '#4a3a2a' } };
const SENADOR = { tunica: '#efe7d4', toga: '#f2ece0', borda: '#8a2a3a', rosto: { estilo: 'curto', velho: 1, cabelo: '#8a8a80' } };

// ---------- gladiadores ----------
const PELE_G = ['#c8946a', '#a8784f', '#d8a87e', '#8a5a3a'];
function escudoScutum(w, h, cor, t) { // retângulo curvo, borda de bronze, raio dourado
  c.fillStyle = shadeHex(cor, .7); c.beginPath(); c.roundRect(-w / 2 - .8, -h / 2, w + 1.6, h, 2.2); c.fill(); c.fillStyle = cor; c.beginPath(); c.roundRect(-w / 2, -h / 2, w, h, 2); c.fill();
  c.fillStyle = shadeHex(cor, .82); c.fillRect(w * .18, -h / 2, w * .32, h); c.strokeStyle = '#c9a050'; c.lineWidth = 1.2; c.beginPath(); c.roundRect(-w / 2 + 1, -h / 2 + 1, w - 2, h - 2, 1.6); c.stroke();
  disc(0, 0, w * .16, '#c9a050'); disc(0, 0, w * .1, '#e0c070'); c.strokeStyle = '#d9b35a'; c.lineWidth = 1.1; for (const k of [-1, 1]) { c.beginPath(); c.moveTo(0, k * h * .1); c.lineTo(k * w * .12, k * h * .22); c.lineTo(-k * w * .05, k * h * .28); c.lineTo(k * w * .08, k * h * .42); c.stroke() }
  c.fillStyle = '#d9b35a'; for (const k of [-1, 1]) { poly([[k * w * .14, -h * .02], [k * w * .4, -h * .1], [k * w * .4, -h * .02]], '#d9b35a') } }
function gladio(len) { c.fillStyle = '#d8dce0'; poly([[-.9, 0], [.9, 0], [.9, -len * .82], [0, -len], [-.9, -len * .82]], '#d8dce0'); c.fillStyle = 'rgba(80,90,100,.35)'; c.fillRect(-.15, -len * .8, .3, len * .78); c.fillStyle = '#8a6a40'; c.fillRect(-2.6, -.4, 5.2, 1.2); c.fillStyle = '#5a3a20'; c.fillRect(-.8, .8, 1.6, 4.6); disc(0, 6, 1.2, '#c9a050') }
function sica(len) { c.fillStyle = '#d8dce0'; c.beginPath(); c.moveTo(-.9, 0); c.quadraticCurveTo(-1.6, -len * .6, 2.2 + len * .25, -len); c.quadraticCurveTo(.6, -len * .5, .9, 0); c.fill(); c.fillStyle = '#8a6a40'; c.fillRect(-2.4, -.4, 4.8, 1.2); c.fillStyle = '#5a3a20'; c.fillRect(-.8, .8, 1.6, 4.4) }
function capacete(tipo, s = 1, t = 0) { // cabeça centrada em (0,0), ~20 de altura
  const br = '#b98a3a', brS = '#8a6224', brL = '#e0b86a', fe = '#9aa0a6', feS = '#6e747a', feL = '#d0d6da';
  if (tipo === 'mirmilao') {
    poly([[-13, 1], [13, 1], [10, 4], [-10, 4]], brS); c.fillStyle = br; c.beginPath(); c.ellipse(0, -2, 10.4, 11, 0, PI, 0); c.lineTo(10.4, 2); c.lineTo(-10.4, 2); c.fill(); c.fillStyle = brS; c.beginPath(); c.ellipse(4, -2, 6, 10.6, 0, -PI / 2, 0); c.lineTo(4, 2); c.fill();
    c.fillStyle = '#1a1612'; c.beginPath(); c.roundRect(-6.4, -6, 12.8, 10, 2.4); c.fill(); c.strokeStyle = fe; c.lineWidth = .7; for (let k = -5; k <= 5; k += 2) { c.beginPath(); c.moveTo(k, -5.6); c.lineTo(k, 3.6); c.stroke() } for (let k = -4; k <= 3; k += 2.4) { c.beginPath(); c.moveTo(-6, k); c.lineTo(6, k); c.stroke() }
    c.strokeStyle = brL; c.lineWidth = 1; c.beginPath(); c.roundRect(-6.6, -6.2, 13.2, 10.4, 2.6); c.stroke();
    poly([[-1.6, -12.6], [1.6, -12.6], [2, -22], [-2, -22]], brS); poly([[-1.2, -22], [1.2, -22], [3.6, -27], [-3.6, -27]], br); for (let k = -3; k <= 3; k++) poly([[k * 1.1 - .6, -26.6], [k * 1.1 + .6, -26.6], [k * 1.6 + sin(t * 4 + k) * .4, -33 - Math.abs(k) * -.6]], k % 2 ? '#c8452f' : '#e0603a');
    for (const k of [-1, 1]) disc(k * 8.6, -3, 1, brL);
  } else if (tipo === 'tracio') {
    c.fillStyle = brS; c.beginPath(); c.ellipse(0, 2, 13.6, 3.2, 0, 0, 7); c.fill(); c.fillStyle = br; c.beginPath(); c.ellipse(0, -2, 10, 11, 0, PI, 0); c.lineTo(10, 2); c.lineTo(-10, 2); c.fill(); c.fillStyle = brS; c.beginPath(); c.ellipse(4, -2, 5.6, 10.6, 0, -PI / 2, 0); c.lineTo(4, 2); c.fill();
    c.fillStyle = '#1a1612'; c.beginPath(); c.roundRect(-6, -5.6, 12, 9.4, 2.2); c.fill(); c.strokeStyle = fe; c.lineWidth = .6; for (let k = -4.5; k <= 4.5; k += 1.5) { c.beginPath(); c.moveTo(k, -5.2); c.lineTo(k, 3.4); c.stroke() } for (let k = -4.4; k <= 3; k += 1.5) { c.beginPath(); c.moveTo(-5.6, k); c.lineTo(5.6, k); c.stroke() }
    c.fillStyle = brL; c.beginPath(); c.moveTo(-1.4, -12.4); c.quadraticCurveTo(-2, -20, 2.4, -24); c.quadraticCurveTo(7.6, -27, 8.6, -22); c.lineTo(6.2, -21.4); c.quadraticCurveTo(4.4, -23, 3, -20); c.quadraticCurveTo(1.6, -16, 1.6, -12.4); c.fill(); disc(7.2, -23.4, .7, '#1a1612'); poly([[8.4, -22.4], [10.4, -21.6], [8.2, -21]], brS);
    for (const k of [-1, 1]) for (let j = 0; j < 3; j++) poly([[k * 8.6, -9 + j], [k * (10 + j * .6), -18 - j * 2], [k * (9.4 + j * .6), -18 - j * 2 + 2.4]], j % 2 ? '#efe7d4' : '#c8452f');
  } else if (tipo === 'secutor') {
    c.fillStyle = fe; c.beginPath(); c.moveTo(-9.6, 3); c.quadraticCurveTo(-11, -12, 0, -14.6); c.quadraticCurveTo(11, -12, 9.6, 3); c.quadraticCurveTo(0, 5, -9.6, 3); c.fill(); c.fillStyle = feS; c.beginPath(); c.moveTo(2.6, -14.4); c.quadraticCurveTo(11, -12, 9.6, 3); c.quadraticCurveTo(6, 4.2, 3.2, 4.4); c.fill();
    c.fillStyle = feL; c.beginPath(); c.ellipse(-4, -7, 2.2, 4.4, -.3, 0, 7); c.fill(); poly([[-1, -14.6], [1, -14.6], [.8, -21], [-.8, -21]], feS); c.fillStyle = feS; c.fillRect(-.5, -21, 1, 18); for (const k of [-1, 1]) { disc(k * 3.2, -3.4, 1.15, '#14100c'); c.strokeStyle = feS; c.lineWidth = .4; c.beginPath(); c.arc(k * 3.2, -3.4, 1.6, 0, 7); c.stroke() }
    c.fillStyle = feS; c.fillRect(-9.2, 2, 18.4, 1.2);
  }
}
// gladiador de frente (destaque com detalhes). tipo: mirmilao, tracio, secutor, reciario
function gladiador(x, y, h, tipo, t = 0, o = {}) {
  const s = h / 100, pele = o.pele || PELE_G[0], ps = shadeHex(pele, .78), resp = sin(t * 2.4) * .4; c.save(); c.translate(x, y); c.scale(s * (o.dir || 1), s); c.lineCap = 'round'; c.lineJoin = 'round';
  // pernas: faixas acolchoadas e caneleiras de bronze
  for (const k of [-1, 1]) { limb([[k * 4.6, -44], [k * 6, -24], [k * 6.4, -4]], 8.6, 6.8, pele); c.fillStyle = '#6a4a2a'; c.beginPath(); c.ellipse(k * 6.8, -2, 4.6, 2, 0, 0, 7); c.fill(); c.strokeStyle = '#5a3a20'; c.lineWidth = .5; for (let j = 0; j < 3; j++) { c.beginPath(); c.moveTo(k * 3.6, -4 - j * 2.2); c.lineTo(k * 9.2, -4 - j * 2.2); c.stroke() } }
  const greave = (k, alta) => { const y0 = alta ? -40 : -24; c.fillStyle = '#b98a3a'; c.beginPath(); c.moveTo(k * 2.4, y0); c.lineTo(k * 10.4, y0); c.quadraticCurveTo(k * 10.6, -14, k * 9.4, -5); c.lineTo(k * 3.4, -5); c.quadraticCurveTo(k * 2, -14, k * 2.4, y0); c.fill(); c.fillStyle = '#e0b86a'; c.fillRect(k > 0 ? 4 : -5.6, y0 + 2, 1.6, -y0 - 8); c.fillStyle = '#8a6224'; c.beginPath(); c.ellipse(k * 6.4, y0 + 1.6, 4.6, 2.2, 0, 0, 7); c.fill() };
  const fasc = (k) => { c.fillStyle = '#efe7d4'; c.beginPath(); c.moveTo(k * 1.8, -44); c.lineTo(k * 11, -44); c.lineTo(k * 10.4, -26); c.lineTo(k * 2.6, -26); c.closePath(); c.fill(); c.strokeStyle = 'rgba(120,100,70,.5)'; c.lineWidth = .5; for (let j = 0; j < 6; j++) { c.beginPath(); c.moveTo(k * 2, -42 + j * 3); c.lineTo(k * 10.8, -43 + j * 3); c.stroke() } };
  if (tipo === 'tracio') { fasc(-1); fasc(1); greave(-1, 1); greave(1, 1) } else if (tipo !== 'reciario') greave(1, 0); else { greave(-1, 0) }
  // tronco nu com músculos
  const tor = () => { c.beginPath(); c.moveTo(-5, -84.6); c.quadraticCurveTo(-13, -85, -16, -80); c.quadraticCurveTo(-16.6, -72, -13.6, -62); c.quadraticCurveTo(-11, -54, -11.6, -46); c.lineTo(11.6, -46); c.quadraticCurveTo(11, -54, 13.6, -62); c.quadraticCurveTo(16.6, -72, 16, -80); c.quadraticCurveTo(13, -85, 5, -84.6); c.closePath() };
  c.fillStyle = pele; tor(); c.fill(); c.save(); tor(); c.clip(); c.fillStyle = ps; c.fillRect(4, -90, 16, 50);
  c.strokeStyle = 'rgba(90,50,30,.35)'; c.lineWidth = .7; c.beginPath(); c.moveTo(-10, -72 + resp); c.quadraticCurveTo(-5, -67, 0, -71); c.quadraticCurveTo(5, -67, 10, -72 + resp); c.moveTo(0, -78); c.lineTo(0, -48); for (const yy of [-63, -57.5, -52]) { c.moveTo(-4.6, yy); c.quadraticCurveTo(0, yy + 1.2, 4.6, yy) } c.stroke(); disc(-5.6, -70 + resp, .6, 'rgba(90,50,30,.5)'); disc(5.6, -70 + resp, .6, 'rgba(90,50,30,.5)'); c.restore();
  // tanga (subligáculo) e cinto largo de bronze (balteus)
  c.fillStyle = '#efe7d4'; c.beginPath(); c.moveTo(-11.6, -46.5); c.lineTo(11.6, -46.5); c.quadraticCurveTo(10, -38, 4, -33); c.lineTo(0, -36); c.lineTo(-4, -33); c.quadraticCurveTo(-10, -38, -11.6, -46.5); c.fill(); c.fillStyle = 'rgba(120,100,70,.3)'; c.fillRect(1, -46, 10, 10);
  c.fillStyle = '#8a6224'; c.fillRect(-12.4, -52, 24.8, 6.6); c.fillStyle = '#c9a050'; c.fillRect(-12.4, -51.4, 24.8, 1); c.fillRect(-12.4, -47, 24.8, 1); for (let k = -10; k <= 10; k += 4) disc(k, -48.8, .8, '#e0c070');
  // braços
  const manica = (pts) => { limb(pts, 6.8, 5.8, '#d8d0bc'); c.strokeStyle = 'rgba(90,80,60,.5)'; c.lineWidth = .5; for (let j = 0; j < 8; j++) { const u = j / 8, px = lerp(pts[0][0], pts[2][0], u), py = lerp(pts[0][1], pts[2][1], u); c.beginPath(); c.moveTo(px - 3, py); c.lineTo(px + 3, py + .6); c.stroke() } };
  const braçoDir = [[-14.4, -80], [-19, -66], [-21, -54]], braçoEsq = [[14.4, -80], [18.4, -66], [16, -58]];
  if (tipo === 'reciario') { limb(braçoDir, 6.4, 5.4, pele); manica(braçoEsq); poly([[9, -88], [21, -86], [22, -96], [14, -100]], '#b98a3a'); poly([[14, -100], [22, -96], [22.6, -93], [15, -96]], '#e0b86a') }
  else { manica(braçoDir); limb(braçoEsq, 6.4, 5.4, pele) }
  // arma na mão direita (lado esquerdo da tela)
  c.save(); c.translate(-21.4, -51); mao(0, 0, -1, pele, ps); c.translate(0, -1);
  if (tipo === 'tracio') { c.rotate(-.35); sica(26) } else if (tipo === 'reciario') { c.rotate(-.06); c.fillStyle = '#6a4a2a'; c.fillRect(-.9, -42, 1.8, 60); c.fillStyle = '#a8aeb4'; c.fillRect(-4.6, -46, 9.2, 1.4); for (const k of [-4, 0, 4]) poly([[k - .8, -45], [k + .8, -45], [k, -54]], '#c8ced4') } else { c.rotate(-.18); gladio(22) }
  c.restore();
  // escudo no braço esquerdo (lado direito da tela)
  if (tipo === 'mirmilao' || tipo === 'secutor') { c.save(); c.translate(19, -52); c.rotate(.05); escudoScutum(22, 44, o.cor || '#a8382a', t); c.restore() }
  else if (tipo === 'tracio') { c.save(); c.translate(19, -58); c.rotate(.04); c.fillStyle = '#8a6224'; c.beginPath(); c.roundRect(-9.4, -10.4, 18.8, 20.8, 1.6); c.fill(); c.fillStyle = o.cor || '#3a5a6a'; c.beginPath(); c.roundRect(-8.6, -9.6, 17.2, 19.2, 1.2); c.fill(); c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(1.6, -9.6, 7, 19.2); disc(0, 0, 2.2, '#c9a050'); c.restore(); mao(16, -55, 1, pele, ps) }
  else { mao(16, -55, 1, pele, ps); c.strokeStyle = '#c8b890'; c.lineWidth = .5; for (let k = 0; k < 7; k++) { c.beginPath(); c.moveTo(13 + k * 1.2, -54); c.quadraticCurveTo(19 + k, -40, 14 + k * 1.6, -22); c.stroke() } for (let k = 0; k < 9; k++) { c.beginPath(); c.moveTo(12, -50 + k * 3.4); c.lineTo(24, -48 + k * 3.4); c.stroke() } }
  // cabeça
  c.translate(0, -92); c.scale(.66, .66);
  if (tipo === 'reciario') rosto({ estilo: 'curto', cabelo: '#2a2018', pele, peleS: ps }); else capacete(tipo, 1, t);
  c.restore();
}
// gladiador de perfil, para as lutas (dir = 1 olha para a direita)
function gladPerfil(x, y, h, tipo, dir, t = 0, o = {}) {
  const s = h / 100, pele = o.pele || PELE_G[1], ps = shadeHex(pele, .78), at = o.ataque || 0; c.save(); c.translate(x, y); c.scale(s * dir, s); c.lineCap = 'round'; c.lineJoin = 'round';
  if (o.ajoelhado) { limb([[-2, -30], [-12, -18], [-10, -2]], 8.6, 7, ps); limb([[2, -30], [12, -24], [10, -4]], 8.6, 7, pele); c.translate(0, 16) }
  else { limb([[-1, -46], [-9, -24], [-14, -4]], 8.8, 7, ps); limb([[2, -46], [9, -26], [8, -4]], 8.8, 7, pele); if (tipo !== 'reciario') { c.fillStyle = '#b98a3a'; c.beginPath(); c.moveTo(6.6, -26); c.lineTo(11.4, -26); c.lineTo(10.4, -6); c.lineTo(6, -6); c.fill() } c.fillStyle = '#6a4a2a'; c.beginPath(); c.ellipse(-12.6, -2, 5, 2, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(10, -2, 5, 2, 0, 0, 7); c.fill() }
  const tor = () => { c.beginPath(); c.moveTo(-7, -84); c.quadraticCurveTo(-10, -66, -8, -46); c.lineTo(8, -46); c.quadraticCurveTo(10, -62, 9, -76); c.quadraticCurveTo(7, -85, 0, -85.6); c.closePath() };
  c.fillStyle = pele; tor(); c.fill(); c.save(); tor(); c.clip(); c.fillStyle = ps; c.fillRect(-12, -90, 7, 50); c.restore();
  c.fillStyle = '#efe7d4'; poly([[-8.4, -47], [8.4, -47], [6, -34], [-6, -34]], '#efe7d4'); c.fillStyle = '#8a6224'; c.fillRect(-8.8, -52, 17.6, 6); c.fillStyle = '#c9a050'; c.fillRect(-8.8, -51.4, 17.6, .9);
  // braço da arma (vai à frente)
  const ax = lerp(20, 26, at), ay = lerp(-62, -86, at); limb([[2, -80], [12, lerp(-68, -80, at)], [ax, ay]], 6.4, 5.4, tipo === 'reciario' ? pele : '#d8d0bc'); c.save(); c.translate(ax, ay); mao(0, 0, 1, pele, ps);
  if (tipo === 'reciario') { c.rotate(PI / 2 - .25); c.fillStyle = '#6a4a2a'; c.fillRect(-.9, -46, 1.8, 66); c.fillStyle = '#a8aeb4'; c.fillRect(-4.6, -48, 9.2, 1.4); for (const k of [-4, 0, 4]) poly([[k - .8, -47], [k + .8, -47], [k, -56]], '#c8ced4') }
  else { c.rotate(lerp(.9, -.2, at)); if (tipo === 'tracio') sica(26); else gladio(22) } c.restore();
  // escudo à frente do corpo
  if (tipo === 'mirmilao' || tipo === 'secutor') { c.save(); c.translate(11, -56); escudoScutum(20, 46, o.cor || '#a8382a', t); c.restore() }
  else if (tipo === 'tracio') { c.save(); c.translate(11, -60); c.fillStyle = '#8a6224'; c.beginPath(); c.roundRect(-9, -10, 18, 20, 1.6); c.fill(); c.fillStyle = o.cor || '#3a5a6a'; c.beginPath(); c.roundRect(-8.2, -9.2, 16.4, 18.4, 1.2); c.fill(); disc(0, 0, 2, '#c9a050'); c.restore() }
  else { c.strokeStyle = '#c8b890'; c.lineWidth = .6; for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(-4 + k * 1.2, -74); c.quadraticCurveTo(-10 + k * 2, -50, -6 + k * 2, -28); c.stroke() } poly([[-6, -88], [4, -88], [4, -98], [-4, -100]], '#b98a3a') }
  // cabeça de perfil
  c.save(); c.translate(1, -94);
  if (tipo === 'reciario') { c.fillStyle = pele; c.beginPath(); c.ellipse(0, 0, 7, 8.4, 0, 0, 7); c.fill(); poly([[6, -1], [9, 2], [6.4, 3]], pele); disc(3.8, -1.6, .8, '#14100c'); c.fillStyle = '#2a2018'; c.beginPath(); c.ellipse(-1.4, -3.6, 6.8, 5.6, 0, PI * .9, PI * 2.05); c.fill() }
  else if (tipo === 'secutor') { c.fillStyle = '#9aa0a6'; c.beginPath(); c.moveTo(-8, 6); c.quadraticCurveTo(-10, -12, 2, -12.6); c.quadraticCurveTo(11, -10, 10, 6); c.quadraticCurveTo(0, 8, -8, 6); c.fill(); c.fillStyle = '#6e747a'; c.beginPath(); c.moveTo(-1, -12.4); c.quadraticCurveTo(-6, -16, -10, -8); c.lineTo(-7, -8); c.fill(); disc(6.4, -1, 1.1, '#14100c') }
  else { c.save(); c.scale(.66, .66); const ty = tipo; c.fillStyle = '#b98a3a'; c.beginPath(); c.ellipse(0, -1, 11, 12, 0, PI, 0); c.lineTo(14, 2); c.lineTo(-14, 2); c.fill(); c.fillStyle = '#1a1612'; c.beginPath(); c.roundRect(4, -6, 8, 9, 2); c.fill(); c.strokeStyle = '#9aa0a6'; c.lineWidth = .7; for (let k = 5; k < 12; k += 2) { c.beginPath(); c.moveTo(k, -5.6); c.lineTo(k, 2.6); c.stroke() }
    if (ty === 'tracio') { c.fillStyle = '#e0b86a'; c.beginPath(); c.moveTo(-6, -11); c.quadraticCurveTo(-2, -24, 8, -22); c.lineTo(10, -19); c.quadraticCurveTo(2, -20, 0, -11); c.fill(); poly([[9.4, -21], [12, -19.6], [9.4, -18.8]], '#8a6224') } else { poly([[-8, -11], [6, -11], [2, -22], [-6, -24]], '#8a6224'); for (let k = 0; k < 5; k++) poly([[-6 + k * 2.2, -23], [-4 + k * 2.2, -23], [-9 + k * 2.6 + sin(t * 5 + k), -31]], k % 2 ? '#c8452f' : '#e0603a') } c.restore() }
  c.restore(); c.restore();
}
// ---------- animais (de perfil, olhando para a direita) ----------
function leao(x, y, s, t, o = {}) { c.save(); c.translate(x, y); c.scale(s * (o.dir || 1), s); const pa = sin(t * 8) * (o.anda ? 4 : 0), juba = '#8a5a24', pelo = '#c89a52', pS = '#a87a3a';
  for (const [lx, k] of [[-30, 1], [26, -1]]) { limb([[lx, -26], [lx - 4 + k * pa, -10], [lx - 2 + k * pa, 0]], 8, 6, pS) }
  c.fillStyle = pelo; c.beginPath(); c.ellipse(0, -36, 40, 15, 0, 0, 7); c.fill(); c.fillStyle = pS; c.beginPath(); c.ellipse(0, -30, 38, 8, 0, 0, PI); c.fill();
  for (const [lx, k] of [[-26, -1], [30, 1]]) limb([[lx, -26], [lx + 2 + k * pa, -10], [lx + 4 + k * pa, 0]], 8.4, 6.4, pelo);
  c.strokeStyle = pelo; c.lineWidth = 3.4; c.beginPath(); c.moveTo(-38, -40); c.quadraticCurveTo(-58, -46, -60, -30 + sin(t * 3) * 4); c.stroke(); disc(-60, -29 + sin(t * 3) * 4, 3.6, juba);
  c.fillStyle = juba; for (let k = 0; k < 14; k++) { const a = k / 14 * 2 * PI; poly([[38 + cos(a) * 10, -50 + sin(a) * 12], [38 + cos(a + .2) * 22, -50 + sin(a + .2) * 22], [38 + cos(a + .45) * 10, -50 + sin(a + .45) * 12]], k % 2 ? juba : '#6a4018') } disc(38, -50, 15, juba);
  c.fillStyle = pelo; c.beginPath(); c.ellipse(48, -50, 10, 9, 0, 0, 7); c.fill(); poly([[50, -46], [62, -44], [62, -38], [50, -38]], pelo); disc(61.4, -44.6, 1.8, '#3a2018'); disc(50, -54, 1.4, '#1a1008'); c.strokeStyle = '#6a4018'; c.lineWidth = .8; c.beginPath(); c.moveTo(54, -39.4); c.lineTo(61, -39.4); c.stroke();
  if (o.ruge) { poly([[52, -40], [62, -38], [60, -32], [52, -35]], '#5a1a14'); poly([[56, -38], [57, -36], [58, -38]], '#f2ece0') }
  c.restore() }
function urso(x, y, s, t) { c.save(); c.translate(x, y); c.scale(s, s); const p = '#5a3a24', pS = '#3e2818'; limb([[-24, -26], [-26, 0]], 12, 11, pS); limb([[22, -26], [24, 0]], 12, 11, pS); c.fillStyle = p; c.beginPath(); c.ellipse(0, -36, 36, 22, 0, 0, 7); c.fill(); limb([[-18, -26], [-16, 0]], 12, 11, p); limb([[26, -26], [30, 0]], 12, 11, p); disc(38, -50, 13, p); poly([[44, -54], [58, -48], [56, -42], [44, -42]], p); disc(57, -48, 2.2, '#1a1008'); disc(32, -60, 4, pS); disc(45, -54, 1.4, '#0a0806'); c.restore() }
function elefante(x, y, s, t) { c.save(); c.translate(x, y); c.scale(s, s); const p = '#8a8478', pS = '#6e695e'; for (const lx of [-26, 22]) limb([[lx, -40], [lx, 0]], 14, 13, pS); c.fillStyle = p; c.beginPath(); c.ellipse(0, -56, 44, 30, 0, 0, 7); c.fill(); for (const lx of [-16, 32]) limb([[lx, -40], [lx, 0]], 14, 13, p); disc(44, -66, 20, p); c.fillStyle = pS; c.beginPath(); c.ellipse(36, -64, 12, 16, -.2, 0, 7); c.fill(); limb([[58, -62], [64, -40], [62, -20 + sin(t * 2) * 3]], 9, 5, p); poly([[56, -52], [70, -46], [56, -48]], '#f2ece0'); disc(52, -72, 1.6, '#1a1008'); c.restore() }
// ---------- pedra e grampo ----------
function blocoPedra(x, y, w, h, seed) { const q = rng(seed); c.fillStyle = bands(x, 0, x + w, 0, [[.7, '#d6c6a0'], [1, '#b8a682']]); c.fillRect(x, y, w, h); c.fillStyle = 'rgba(120,100,70,.25)'; for (let i = 0; i < 30; i++) c.fillRect(x + q() * w, y + q() * h, 3 + q() * 14, 2); c.strokeStyle = 'rgba(60,44,30,.5)'; c.lineWidth = 3; c.strokeRect(x, y, w, h) }
function pinheiro(x, y, s, cor = '#3a4a2a') { c.fillStyle = '#4a3a2a'; c.fillRect(x - 2 * s, y - 60 * s, 4 * s, 60 * s); pill(x, y - 64 * s, 70 * s, 22 * s, cor); pill(x - 10 * s, y - 72 * s, 50 * s, 16 * s, shadeHex(cor.length === 7 ? cor : '#3a4a2a', 1.2)) }
function cipreste(x, y, s, cor = '#2a3a24') { c.fillStyle = cor; c.beginPath(); c.ellipse(x, y - 34 * s, 7 * s, 34 * s, 0, 0, 7); c.fill() }
function templo(x, y, w, h, cor = '#d6c6a0') { c.fillStyle = cor; c.fillRect(x, y - h * .1, w, h * .1); const n = 6; for (let k = 0; k < n; k++) c.fillRect(x + w * .05 + k * w * .9 / (n - 1) - w * .025, y - h * .8, w * .05, h * .7); c.fillRect(x - w * .02, y - h * .86, w * 1.04, h * .07); poly([[x - w * .02, y - h * .86], [x + w * 1.02, y - h * .86], [x + w / 2, y - h * 1.12]], shadeHex(cor, .9)) }
function telhados(x0, x1, base, seed, t) { const q = rng(seed); let x = x0; while (x < x1) { const w = 30 + q() * 70, h = 30 + q() * 70; c.fillStyle = ['#c8b48a', '#d8c49a', '#b8a07a', '#e0d0a8'][Math.floor(q() * 4)]; c.fillRect(x, base - h, w, h); poly([[x - 4, base - h], [x + w + 4, base - h], [x + w / 2, base - h - w * .22]], ['#a8503a', '#b8603a', '#8a4030'][Math.floor(q() * 3)]); c.fillStyle = 'rgba(40,30,20,.5)'; for (let k = 0; k < 3; k++) if (q() < .6) c.fillRect(x + 6 + k * w * .3, base - h + 10 + q() * (h - 24), 6, 9); x += w + q() * 6 } }
function aqueduto(x0, x1, y, h, cor) { c.fillStyle = cor; c.fillRect(x0, y - h, x1 - x0, h * .2); for (let x = x0; x < x1; x += h * .5) { c.fillRect(x, y - h, h * .12, h); } c.fillStyle = cor; for (let x = x0; x < x1; x += h * .5) { c.beginPath(); c.arc(x + h * .25 + h * .06, y - h * .8, h * .19, PI, 0); c.lineTo(x + h * .5, y - h * .8); c.lineTo(x + h * .5, y - h); c.lineTo(x + h * .12, y - h); c.fill() } }
function colosso(x, y, s) { c.fillStyle = '#4a3a24'; c.fillRect(x - 10 * s, y - 20 * s, 20 * s, 20 * s); c.fillStyle = '#b98a3a'; c.save(); c.translate(x, y - 20 * s); c.scale(s, s); limb([[-3, 0], [-3, -40]], 5, 4, '#a87a2a'); limb([[3, 0], [3, -40]], 5, 4, '#b98a3a'); poly([[-6, -40], [6, -40], [7, -70], [-7, -70]], '#b98a3a'); limb([[6, -68], [14, -84], [14, -96]], 3, 2.6, '#b98a3a'); c.fillStyle = '#8a6224'; c.fillRect(13, -110, 1.4, 30); disc(0, -76, 5, '#b98a3a'); for (let k = 0; k < 7; k++) { const a = -PI + .3 + k * .42; line(cos(a) * 5, -76 + sin(a) * 5, cos(a) * 11, -76 + sin(a) * 11, '#e0b86a', 1.2) } c.restore() }
