// Companhia do Frio — versão 2 (35 s, vertical 1080×1920), no estilo do comercial de referência:
// fundo claro e limpo, letra grande escura com palavra em azul, cartõezinhos de aplicativo,
// números rolando, telas azuis de impacto e personagem 3D (o mascote da empresa).
// Usa a mesma narração e os mesmos tempos da versão 1 (videos/companhia-frio/narracao.py e audio.py).
const cv = document.getElementById('c'), X = cv.getContext('2d'), W = 1080, H = 1920, DUR = 35;
const CUTS = [2.45, 5.5, 11.5, 18.6, 23.5, 29.2], TR = 0.3;
const COR = { ink: '#172036', azul: '#1d6ff2', azulFundo: '#1f66f5', muted: '#6b7489', verde: '#16a34a', verm: '#e5484d', card: '#ffffff' };
const F = (w, s) => `${w} ${s}px "Bricolage"`;
const FOTOS = '../companhia-frio/fotos/', IMG = {};
for (const [n, ext] of [['mascote', 'png'], ['logo-escura', 'png'], ['logo-frase-escura', 'png'], ['compressor-velho', 'png'], ['compressor-novo', 'png'],
  ['led-antes', 'jpg'], ['led-depois', 'jpg'], ['limpeza-antes', 'jpg'], ['limpeza-depois', 'jpg']]) { const i = new Image(); i.src = FOTOS + n + '.' + ext; IMG[n] = i }

// ---------- utilidades ----------
const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const pr = (t, a, b) => cl((t - a) / (b - a));
const eOut = p => 1 - Math.pow(1 - p, 3), eIO = p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
const eBack = p => { const c = 1.7; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2) };
const rnd = s => { const x = Math.sin(s * 127.1) * 43758.5453; return x - Math.floor(x) };
function rr(x, y, w, h, r) { X.beginPath(); X.roundRect(x, y, w, h, r) }
function sombraSuave(blur = 50, y = 20, a = .14) { X.shadowColor = `rgba(23,32,54,${a})`; X.shadowBlur = blur; X.shadowOffsetY = y }
function semSombra() { X.shadowColor = 'transparent'; X.shadowBlur = 0; X.shadowOffsetY = 0 }

// frase alinhada à esquerda; cada palavra aparece desfocada e sobe um pouco (como na referência)
// linhas = [ [t0, [[palavra, cor], ...]], ... ]  — cada linha tem seu tempo de entrada
function frase(t, linhas, x, y, tam, cor = COR.ink, alinhar = 'left', passo = .09) {
  const base = X.globalAlpha; X.save(); X.font = F(800, tam); X.textBaseline = 'alphabetic';
  linhas.forEach(([t0, ln], i) => {
    const esp = tam * .25, larg = ln.map(([p]) => X.measureText(p).width), tot = larg.reduce((a, b) => a + b, 0) + esp * (ln.length - 1);
    let cx = alinhar === 'center' ? x - tot / 2 : x;
    ln.forEach(([p, c], j) => {
      const q = pr(t, t0 + j * passo, t0 + j * passo + .45);
      if (q > 0) { X.save(); X.globalAlpha = base * cl(q * 1.6); X.fillStyle = c || cor; const b = (1 - eOut(q)) * 14; if (b > .3) X.filter = `blur(${b}px)`;
        X.fillText(p, cx, y + i * tam * 1.08 + (1 - eOut(q)) * 26); X.restore() }
      cx += larg[j] + esp;
    });
  });
  X.restore();
}
// número rolando tipo hodômetro: o último dígito gira, os outros trocam inteiros
function rolando(v, x, y, tam, cor, pre = '', suf = '') {
  X.save(); X.font = F(800, tam); X.fillStyle = cor; X.textBaseline = 'alphabetic';
  const neg = v < -.001, a = Math.abs(v), int = Math.floor(a), fr = a - int, ini = Math.floor(int / 10), s1 = (ini ? String(ini) : '');
  let cx = x; const txtPre = pre + (neg ? '−' : ''); X.fillText(txtPre, cx, y); cx += X.measureText(txtPre).width;
  X.fillText(s1, cx, y); cx += X.measureText(s1).width;
  const dw = X.measureText('0').width; X.save(); X.beginPath(); X.rect(cx - 4, y - tam * .8, dw + 8, tam * .95); X.clip();
  const d0 = int % 10, d1 = (int + 1) % 10, e = eIO(fr), dy = e * tam * 1.05;
  X.fillText(String(d0), cx, y - dy); X.fillText(String(d1), cx, y - dy + tam * 1.05); X.restore();
  cx += dw; X.fillText(suf, cx, y); X.restore();
}
// cartãozinho de aplicativo: ícone, título, subtítulo e (opcional) chave liga/desliga
function cartao(t, t0, x, y, w, titulo, sub, icone, chave = null, corIcone = COR.azul) {
  const q = pr(t, t0, t0 + .45); if (q <= 0) return; const e = eOut(q);
  X.save(); X.globalAlpha = cl(q * 1.8); X.translate(x, y + (1 - e) * 40);
  sombraSuave(40, 16, .13); X.fillStyle = COR.card; rr(0, 0, w, 130, 30); X.fill(); semSombra();
  X.fillStyle = corIcone + '22'; rr(26, 27, 76, 76, 22); X.fill(); X.fillStyle = corIcone; X.font = F(800, 40); X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText(icone, 64, 67);
  X.textAlign = 'left'; X.fillStyle = COR.ink; X.font = F(800, 34); X.fillText(titulo, 124, 50); X.fillStyle = COR.muted; X.font = F(600, 27); X.fillText(sub, 124, 92);
  if (chave !== null) { const on = eIO(chave), kx = w - 130, ky = 40; X.fillStyle = on > .5 ? COR.verde : '#d5d9e3'; rr(kx, ky, 100, 52, 26); X.fill();
    X.fillStyle = '#fff'; sombraSuave(8, 2, .25); X.beginPath(); X.arc(kx + 26 + on * 48, ky + 26, 21, 0, 7); X.fill(); semSombra() }
  X.restore();
}
function pilula(t, t0, txt, cor, x, y, tam = 36) { const q = pr(t, t0, t0 + .35); if (q <= 0) return; X.save(); X.translate(x, y); const s = .6 + .4 * eBack(q); X.scale(s, s); X.globalAlpha = cl(q * 3);
  X.font = F(800, tam); const w = X.measureText(txt).width + tam * 1.3; sombraSuave(20, 8, .18); X.fillStyle = cor; rr(-w / 2, -tam * .9, w, tam * 1.8, tam * .9); X.fill(); semSombra();
  X.fillStyle = '#fff'; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText(txt, 0, 2); X.restore() }

// ---------- fundos ----------
function fundoClaro(t) {
  const g = X.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#f6f6fb'); g.addColorStop(.6, '#eef0f8'); g.addColorStop(1, '#e9ecf7'); X.fillStyle = g; X.fillRect(0, 0, W, H);
  [[150 + 40 * Math.sin(t * .5), 300, 600, 'rgba(196,181,253,.20)'], [980, 1500 + 40 * Math.cos(t * .4), 700, 'rgba(147,197,253,.22)'], [900, 200, 400, 'rgba(253,230,138,.12)']].forEach(([x, y, r, c]) => {
    const b = X.createRadialGradient(x, y, 0, x, y, r); b.addColorStop(0, c); b.addColorStop(1, 'rgba(255,255,255,0)'); X.fillStyle = b; X.fillRect(0, 0, W, H) });
}
function fundoAzul(t) {
  const g = X.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2a6ff7'); g.addColorStop(1, '#1550d6'); X.fillStyle = g; X.fillRect(0, 0, W, H);
  const b = X.createRadialGradient(540, 700, 0, 540, 700, 900); b.addColorStop(0, 'rgba(255,255,255,.14)'); b.addColorStop(1, 'rgba(255,255,255,0)'); X.fillStyle = b; X.fillRect(0, 0, W, H);
}

// ---------- imagens ----------
function mascote(x, yPe, alt, t, t0, flip = false) {
  const m = IMG.mascote, q = pr(t, t0, t0 + .5); if (q <= 0) return; const e = eBack(q), h = alt * (.5 + .5 * e), w = h * m.width / m.height;
  X.save(); X.globalAlpha = cl(q * 2.5); X.translate(x, yPe + (1 - eOut(q)) * 160); X.rotate(Math.sin(t * 2) * .02); if (flip) X.scale(-1, 1);
  const sg = X.createRadialGradient(0, 0, 0, 0, 0, w * .42); sg.addColorStop(0, 'rgba(23,32,54,.22)'); sg.addColorStop(1, 'rgba(23,32,54,0)'); X.save(); X.scale(1, .13); X.fillStyle = sg; X.beginPath(); X.arc(0, 0, w * .42, 0, 7); X.fill(); X.restore();
  X.drawImage(m, -w / 2, -h + Math.sin(t * 3) * 6, w, h); X.restore();
}
function foto(img, cx, cy, w, h, zoom = 1, rot = 0, alpha = 1) {
  X.save(); X.globalAlpha = alpha; X.translate(cx, cy); X.rotate(rot);
  sombraSuave(60, 26, .22); X.fillStyle = '#fff'; rr(-w / 2 - 14, -h / 2 - 14, w + 28, h + 28, 44); X.fill(); semSombra();
  X.save(); rr(-w / 2, -h / 2, w, h, 32); X.clip(); const s = Math.max(w / img.width, h / img.height) * zoom;
  X.drawImage(img, -img.width * s / 2, -img.height * s / 2, img.width * s, img.height * s); X.restore(); X.restore();
}
function recorte(img, cx, cy, w, alpha = 1, filtro = '') { const h = w * img.height / img.width; X.save(); X.globalAlpha = alpha;
  const sg = X.createRadialGradient(0, 0, 0, 0, 0, w * .5); sg.addColorStop(0, 'rgba(23,32,54,.25)'); sg.addColorStop(1, 'rgba(23,32,54,0)'); X.save(); X.translate(cx, cy + h * .5); X.scale(1, .12); X.fillStyle = sg; X.beginPath(); X.arc(0, 0, w * .5, 0, 7); X.fill(); X.restore();
  if (filtro) X.filter = filtro; X.drawImage(img, cx - w / 2, cy - h / 2, w, h); X.restore() }
function brilhos(t, t0, cx, cy, raio, n = 10, cor = '#fff') { for (let i = 0; i < n; i++) { const d = t - t0 - rnd(i) * .5; if (d < 0 || d > 1) continue; const s = Math.sin(d * Math.PI);
  X.save(); X.translate(cx + (rnd(i + 9) - .5) * raio * 2, cy + (rnd(i + 19) - .5) * raio * 2.2); X.rotate(d * 2); X.fillStyle = cor; X.globalAlpha = s; const r = 24 * s + 6;
  X.beginPath(); X.moveTo(0, -r); X.quadraticCurveTo(0, 0, r, 0); X.quadraticCurveTo(0, 0, 0, r); X.quadraticCurveTo(0, 0, -r, 0); X.quadraticCurveTo(0, 0, 0, -r); X.fill(); X.restore() } }

// picolé derretendo (personagem da abertura), com volume de degradê
function picole(x, y, s, t) {
  X.save(); X.translate(x, y); X.scale(s, s); X.rotate(Math.sin(t * 7) * .03);
  // palito
  const gp = X.createLinearGradient(-22, 0, 22, 0); gp.addColorStop(0, '#e9c48a'); gp.addColorStop(1, '#c49a5c'); X.fillStyle = gp; rr(-24, 170, 48, 170, 22); X.fill();
  // corpo
  X.fillStyle = '#c95f8a'; rr(-150, -250, 300, 450, 140); X.fill();
  const g = X.createRadialGradient(-60, -150, 20, 0, -20, 330); g.addColorStop(0, '#ffc2da'); g.addColorStop(.55, '#f58bb4'); g.addColorStop(1, '#d9608f'); X.fillStyle = g; rr(-150, -262, 300, 450, 140); X.fill();
  X.fillStyle = 'rgba(255,255,255,.45)'; X.beginPath(); X.ellipse(-80, -170, 34, 70, .3, 0, 7); X.fill();
  // pingos derretendo
  const gd = X.createLinearGradient(0, 120, 0, 280); gd.addColorStop(0, '#f58bb4'); gd.addColorStop(1, '#e06d9b'); X.fillStyle = gd;
  [[-100, 1], [-20, 1.5], [80, .8]].forEach(([px, k], i) => { const L = 40 + 40 * k + Math.sin(t * 2 + i) * 10; rr(px - 20, 140, 40, L, 20); X.fill(); X.beginPath(); X.arc(px, 140 + L, 22, 0, 7); X.fill() });
  const pd = (t * .9) % 1; X.beginPath(); X.arc(-20, 270 + pd * 300, 16 * (1 - pd * .3), 0, 7); X.globalAlpha = 1 - pd; X.fill(); X.globalAlpha = 1;
  // rosto aflito
  X.fillStyle = '#fff'; [[-55, -40], [55, -40]].forEach(([ex, ey]) => { X.beginPath(); X.ellipse(ex, ey, 34, 40, 0, 0, 7); X.fill() });
  X.fillStyle = '#2a1830'; [[-50, -34], [60, -34]].forEach(([ex, ey]) => { X.beginPath(); X.ellipse(ex, ey, 21, 26, 0, 0, 7); X.fill() });
  X.fillStyle = '#fff'; [[-58, -46], [52, -46]].forEach(([ex, ey]) => { X.beginPath(); X.arc(ex, ey, 8, 0, 7); X.fill() });
  X.strokeStyle = '#7a2e50'; X.lineWidth = 9; X.lineCap = 'round'; X.beginPath(); X.moveTo(-90, -95); X.lineTo(-30, -112); X.moveTo(90, -95); X.lineTo(30, -112); X.stroke();
  X.fillStyle = '#7a1f3d'; X.beginPath(); X.ellipse(0, 55, 34, 26, 0, 0, 7); X.fill(); X.fillStyle = '#ff9db5'; X.beginPath(); X.ellipse(0, 68, 20, 10, 0, 0, 7); X.fill();
  [[-100, 20], [100, 20]].forEach(([bx, by]) => { const b = X.createRadialGradient(bx, by, 0, bx, by, 34); b.addColorStop(0, 'rgba(255,90,130,.55)'); b.addColorStop(1, 'rgba(255,90,130,0)'); X.fillStyle = b; X.beginPath(); X.arc(bx, by, 34, 0, 7); X.fill() });
  // gota de suor e tracinhos de tremor
  X.fillStyle = '#9fd8ff'; X.beginPath(); X.moveTo(150, -170); X.bezierCurveTo(165, -140, 175, -125, 175, -112); X.arc(150, -112, 25, 0, Math.PI); X.bezierCurveTo(125, -125, 135, -140, 150, -170); X.fill();
  X.strokeStyle = '#fff'; X.globalAlpha = .9; X.lineWidth = 8; [[-195, -60, -225, -80], [-200, 0, -235, 0], [195, -10, 230, -20], [200, 50, 232, 62]].forEach(([a, b, c, d]) => { X.beginPath(); X.moveTo(a, b); X.lineTo(c, d); X.stroke() });
  X.restore();
}
// manômetros do gás
function manometro(x, y, r, cor, ang, rot) {
  X.save(); X.translate(x, y); sombraSuave(26, 10, .25); X.fillStyle = cor; X.beginPath(); X.arc(0, 0, r, 0, 7); X.fill(); semSombra();
  const g = X.createRadialGradient(-r * .3, -r * .3, 5, 0, 0, r * .85); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#e3e8f0'); X.fillStyle = g; X.beginPath(); X.arc(0, 0, r * .82, 0, 7); X.fill();
  for (let k = 0; k <= 12; k++) { const a = Math.PI * .75 + k / 12 * Math.PI * 1.5; X.strokeStyle = COR.ink; X.lineWidth = k % 3 ? 3 : 6; X.beginPath(); X.moveTo(Math.cos(a) * r * .56, Math.sin(a) * r * .56); X.lineTo(Math.cos(a) * r * .74, Math.sin(a) * r * .74); X.stroke() }
  X.fillStyle = COR.ink; X.font = F(800, r * .17); X.textAlign = 'center'; X.fillText(rot, 0, r * .48);
  X.rotate(Math.PI * .75 + ang * Math.PI * 1.5); X.fillStyle = '#e11d48'; X.beginPath(); X.moveTo(-8, 0); X.lineTo(0, -6); X.lineTo(r * .7, 0); X.lineTo(0, 6); X.fill();
  X.fillStyle = COR.ink; X.beginPath(); X.arc(0, 0, 15, 0, 7); X.fill(); X.restore();
}

// ---------- cenas ----------
function cena1a(t) { // tela azul de impacto: o problema
  fundoAzul(t);
  frase(t, [[.45, [['Seu'], ['freezer']]], [.95, [['ou'], ['geladeira']]], [1.5, [['deu'], ['problema?']]]], 90, 330, 104, '#fff');
  // cartão com a temperatura subindo (ruim)
  const q = pr(t, .5, .9); if (q > 0) { X.save(); X.globalAlpha = q; X.translate(90, 760 + (1 - eOut(q)) * 40);
    sombraSuave(50, 20, .25); X.fillStyle = '#fff'; rr(0, 0, 560, 260, 40); X.fill(); semSombra();
    X.fillStyle = COR.muted; X.font = F(600, 30); X.fillText('Freezer da loja', 40, 62);
    rolando(-18 + 30 * eOut(pr(t, .8, 2.2)), 40, 200, 120, COR.verm, '', '°C'); X.restore() }
  pilula(t, 1.6, 'não está gelando', COR.verm, 370, 1080, 34);
  picole(760, 1440, 1.3, t);
}
function cena1b(t) {
  fundoClaro(t);
  frase(t, [[2.56, [['Chama'], ['a']]], [2.8, [['Companhia', COR.azul]]], [3.1, [['do'], ['Frio!', COR.azul]]]], 90, 300, 112);
  cartao(t, 3.3, 90, 640, 600, 'Companhia do Frio', 'Refrigeração e assistência', '❄');
  mascote(700, 1870, 960, t, 2.6);
}
function cena2(t) {
  fundoClaro(t);
  frase(t, [[5.9, [['Adaptação'], ['de'], ['LED.', COR.azul]]]], 90, 250, 84);
  frase(t, [[8.37, [['O'], ['produto'], ['aparece', COR.azul]]], [8.8, [['muito'], ['mais.']]]], 90, 1650, 84);
  const troca = 7.55, z = 1.02 + (t - 5.5) * .01, q0 = eOut(pr(t, 5.6, 6.1));
  if (t < troca + .2) foto(IMG['led-antes'], 560, 930 + (1 - q0) * 900, 760, 1000, z, .03 * q0);
  if (t >= troca - .05) { const q = pr(t, troca - .05, troca + .3); foto(IMG['led-depois'], 560, 930, 760, 1000, z + .06 * (1 - eOut(q)), .03, cl(q * 2.5));
    X.save(); X.globalAlpha = (1 - q) * .85; X.fillStyle = '#fff'; X.fillRect(0, 0, W, H); X.restore() }
  brilhos(t, troca + .1, 560, 930, 320, 12);
  cartao(t, 6.3, 70, 1330, 640, 'Iluminação LED', t < troca ? 'instalando...' : 'ligada', '💡', pr(t, troca - .1, troca + .25), '#f59e0b');
}
function cena3(t) {
  fundoClaro(t);
  frase(t, [[11.9, [['Limpeza'], ['do']]], [12.25, [['condensador.', COR.azul]]]], 90, 250, 90);
  frase(t, [[15.6, [['Volta'], ['a'], ['gelar']]], [16.1, [['como'], ['novo.', COR.azul]]]], 90, 1690, 84);
  const a = eOut(pr(t, 11.6, 12.1)); foto(IMG['limpeza-antes'], 420, 980 + (1 - a) * 900, 560, 740, 1.05, -.06);
  pilula(t, 12.6, 'Antes', COR.verm, 260, 640, 34);
  const d = eBack(pr(t, 14.4, 15.0)); if (d > 0) { foto(IMG['limpeza-depois'], 660 + (1 - d) * 700, 1080, 560, 740, 1.05, .05); pilula(t, 14.9, 'Depois', COR.verde, 820, 740, 34) }
  brilhos(t, 15.1, 660, 1080, 280, 12);
  // sujeira removida 0 → 100 %
  const k = pr(t, 15.1, 15.5); if (k > 0) { X.save(); X.globalAlpha = k; X.translate(90, 1420); sombraSuave(40, 16, .13); X.fillStyle = '#fff'; rr(0, 0, 470, 120, 30); X.fill(); semSombra();
    X.fillStyle = COR.muted; X.font = F(600, 28); X.fillText('Sujeira removida', 30, 50); rolando(100 * eOut(pr(t, 15.2, 16.6)), 30, 102, 50, COR.verde, '', '%'); X.restore() }
}
function cena4(t) { // tela azul de impacto: gás
  fundoAzul(t);
  frase(t, [[19.1, [['Recuperação']]], [19.45, [['de'], ['gás.']]]], 540, 340, 120, '#fff', 'center');
  for (let i = 0; i < 3; i++) { X.fillStyle = `rgba(255,255,255,${.35 + .65 * (Math.floor(t * 3) % 3 === i)})`; X.beginPath(); X.arc(500 + i * 40, 560, 10, 0, 7); X.fill() }
  const q = eBack(pr(t, 20.1, 20.6)); if (q > 0) { X.save(); X.translate(540, 1000 + (1 - q) * 900);
    sombraSuave(60, 24, .3); X.fillStyle = '#fff'; rr(-420, -260, 840, 540, 56); X.fill(); semSombra();
    const firma = eOut(pr(t, 21.3, 21.9)), tr = 1 - firma;
    manometro(-190, -20, 170, '#1d4ed8', .3 + .15 * firma + tr * .05 * Math.sin(t * 23), 'BAIXA'); manometro(190, -20, 170, '#dc2626', .45 + .12 * firma + tr * .05 * Math.sin(t * 19 + 1), 'ALTA');
    const lg = X.createLinearGradient(0, 160, 0, 230); lg.addColorStop(0, '#f2cd76'); lg.addColorStop(1, '#a8741c'); X.fillStyle = lg; rr(-300, 165, 600, 70, 30); X.fill();
    X.restore() }
  pilula(t, 21.5, '✓ Medição na hora', COR.verde, 540, 1370, 40);
  frase(t, [[20.2, [['Equipamento'], ['certo.']]]], 90, 1560, 66, '#fff');
  mascote(900, 1900, 380, t, 20.4);
}
function cena5(t) {
  fundoClaro(t);
  frase(t, [[23.9, [['Troca'], ['de']]], [24.2, [['compressor.', COR.azul]]]], 90, 250, 96);
  const ent = eOut(pr(t, 23.6, 24.1)), sai = eIO(pr(t, 25.7, 26.2));
  if (sai < 1) { recorte(IMG['compressor-velho'], 540 - sai * 1000 + (1 - ent) * 900, 950, 640, 1, 'saturate(.6) brightness(.9)'); if (sai < .5) pilula(t, 25.25, '✕ Velho', COR.verm, 300 - sai * 1000, 650, 38) }
  const n = eBack(pr(t, 26.1, 26.6)); if (n > 0) { recorte(IMG['compressor-novo'], 540 + (1 - n) * 1000, 980, 760); pilula(t, 26.35, '✓ Novo', COR.verde, 300 + (1 - n) * 1000, 690, 38) }
  // temperatura descendo: o frio volta
  const k = pr(t, 27.2, 27.6); if (k > 0) { X.save(); X.globalAlpha = k; X.translate(90, 1330 + (1 - eOut(k)) * 30); sombraSuave(40, 16, .13); X.fillStyle = '#fff'; rr(0, 0, 520, 200, 36); X.fill(); semSombra();
    X.fillStyle = COR.muted; X.font = F(600, 30); X.fillText('Temperatura', 34, 56); rolando(12 - 30 * eOut(pr(t, 27.4, 28.9)), 34, 160, 96, COR.azul, '', '°C'); X.restore() }
  frase(t, [[27.4, [['E'], ['o'], ['frio'], ['volta.', COR.azul]]]], 90, 1700, 88);
  brilhos(t, 28.6, 820, 1430, 160, 8, '#9fd0ff');
}
function chip(t, t0, txt, x, y) { const q = pr(t, t0, t0 + .4); if (q <= 0) return; X.save(); X.globalAlpha = cl(q * 2); X.translate(x, y + (1 - eOut(q)) * 30);
  sombraSuave(30, 12, .12); X.fillStyle = '#fff'; rr(0, 0, 420, 96, 28); X.fill(); semSombra();
  X.fillStyle = COR.verde; X.beginPath(); X.arc(52, 48, 26, 0, 7); X.fill(); X.strokeStyle = '#fff'; X.lineWidth = 7; X.lineCap = 'round'; X.lineJoin = 'round'; X.beginPath(); X.moveTo(40, 48); X.lineTo(49, 58); X.lineTo(65, 38); X.stroke();
  X.fillStyle = COR.ink; X.font = F(800, 36); X.textBaseline = 'middle'; X.fillText(txt, 96, 50); X.restore() }
function cena6(t) {
  fundoClaro(t);
  const l = IMG['logo-escura'], lq = pr(t, 29.4, 29.9), lw = 900, lh = lw * l.height / l.width;
  X.save(); X.globalAlpha = lq; const b = (1 - eOut(lq)) * 14; if (b > .3) X.filter = `blur(${b}px)`; X.drawImage(l, 90, 170 + (1 - eOut(lq)) * 30, lw, lh); X.restore();
  const f = IMG['logo-frase-escura'], fq = pr(t, 31.0, 31.5), fw = 900, fh = fw * f.height / f.width; X.save(); X.globalAlpha = fq; X.drawImage(f, 90, 520 + (1 - eOut(fq)) * 20, fw, fh); X.restore();
  chip(t, 31.6, 'LED', 70, 720); chip(t, 31.8, 'Limpeza', 70, 836); chip(t, 32.0, 'Gás', 70, 952); chip(t, 32.2, 'Compressor', 70, 1068);
  mascote(810, 1880, 940, t, 29.6);
}

const CENAS = [cena1a, cena1b, cena2, cena3, cena4, cena5, cena6];
function desenha(i, t) { X.save(); CENAS[i](t); X.restore() }
function render(t) {
  let i = CUTS.findIndex(c => t < c); if (i < 0) i = CENAS.length - 1;
  const troca = (a, p) => { X.save(); X.translate(-p * W, 0); desenha(a, t); X.restore(); X.save(); X.translate((1 - p) * W, 0); desenha(a + 1, t); X.restore() };
  if (i > 0 && t < CUTS[i - 1] + TR / 2) troca(i - 1, eIO(pr(t, CUTS[i - 1] - TR / 2, CUTS[i - 1] + TR / 2)));
  else if (i < CUTS.length && t > CUTS[i] - TR / 2) troca(i, eIO(pr(t, CUTS[i] - TR / 2, CUTS[i] + TR / 2)));
  else desenha(i, t);
  const fim = DUR - .45; if (t > fim) { X.fillStyle = `rgba(255,255,255,${pr(t, fim, DUR)})`; X.fillRect(0, 0, W, H) }
}
