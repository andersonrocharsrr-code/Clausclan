// Companhia do Frio — vídeo de 35 s (vertical 1080×1920). render(t) desenha o quadro do segundo t.
// Cortes e falas (tempos medidos no áudio de narracao.py):
//   0,0  abertura   "Seu freezer ou geladeira deu problema? Chama a Companhia do Frio!"  (fala a em 0,4)
//   5,5  LED        "Adaptação de LED: o freezer fica iluminado..."                       (fala b em 5,9)
//  11,5  limpeza    "Limpeza do condensador: tira toda a sujeira..."                      (fala c em 11,9)
//  18,6  gás        "Recuperação de gás, com equipamento certo e medição na hora."        (fala d em 19,1)
//  23,5  compressor "Troca de compressor: sai o velho, entra o novo, e o frio volta."     (fala e em 23,9)
//  29,2  final      "Companhia do Frio. Refrigeração e assistência técnica especializada." (fala f em 29,6)
const cv = document.getElementById('c'), X = cv.getContext('2d'), W = 1080, H = 1920, DUR = 35;
const CUTS = [5.5, 11.5, 18.6, 23.5, 29.2], TR = 0.32;
const COR = { azul: '#3aa0f0', azulF: '#1d6fe0', gelo: '#bfe4ff', branco: '#ffffff', fundo: '#050d22', verde: '#22c55e', verm: '#ef4444' };
const F = (w, s, it = '') => `${it} ${w} ${s}px "Mont"`;
const IMG = {};
for (const n of ['mascote', 'logo', 'logo-frase', 'compressor-velho', 'compressor-novo', 'led-antes', 'led-depois', 'limpeza-antes', 'limpeza-depois']) { const i = new Image(); i.src = `fotos/${n}.${n.includes('-antes') || n.includes('-depois') ? 'jpg' : 'png'}`; IMG[n] = i }

// ---------- utilidades ----------
const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const pr = (t, a, b) => cl((t - a) / (b - a));
const eOut = p => 1 - Math.pow(1 - p, 3), eIO = p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
const eBack = p => { const c = 1.9; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2) };
const rnd = s => { const x = Math.sin(s * 127.1) * 43758.5453; return x - Math.floor(x) };
function rr(x, y, w, h, r) { X.beginPath(); X.roundRect(x, y, w, h, r) }
function brilho(x, y, r, cor, a = 1) { const g = X.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, cor); g.addColorStop(1, 'rgba(0,0,0,0)'); X.save(); X.globalAlpha = a; X.globalCompositeOperation = 'lighter'; X.fillStyle = g; X.fillRect(x - r, y - r, 2 * r, 2 * r); X.restore() }

// palavras que sobem e aparecem uma a uma: linhas = [[ [palavra, cor], ... ], ...]
function palavras(t, linhas, x, y, tam, t0, passo = .1, peso = 900) {
  const base = X.globalAlpha; X.save(); X.font = F(peso, tam); X.textBaseline = 'alphabetic'; let k = 0;
  linhas.forEach((ln, i) => {
    const esp = tam * .28, larg = ln.map(([p]) => X.measureText(p).width), tot = larg.reduce((a, b) => a + b, 0) + esp * (ln.length - 1);
    let cx = x - tot / 2;
    ln.forEach(([p, cor], j) => {
      const q = pr(t, t0 + k * passo, t0 + k * passo + .38); k++;
      if (q > 0) { X.save(); X.globalAlpha = base * cl(q * 2.2); X.fillStyle = cor || COR.branco; const s = .7 + .3 * eBack(q);
        X.shadowColor = 'rgba(0,0,0,.45)'; X.shadowBlur = 24; X.shadowOffsetY = 6;
        X.translate(cx + larg[j] / 2, y + i * tam * 1.1 + (1 - eOut(q)) * 50); X.scale(s, s); X.textAlign = 'center'; X.fillText(p, 0, 0); X.restore() }
      cx += larg[j] + esp;
    });
  });
  X.restore();
}
// etiqueta do serviço no topo: número + nome, com traço azul que cresce
function etiqueta(t, t0, num, nome) {
  const q = eBack(pr(t, t0, t0 + .45)), a = pr(t, t0, t0 + .25); if (a <= 0) return;
  X.save(); X.globalAlpha = a; X.font = F(900, 58); const w = X.measureText(nome).width + 190;
  X.translate(540, 210); X.scale(.6 + .4 * q, .6 + .4 * q);
  X.fillStyle = 'rgba(6,18,48,.75)'; rr(-w / 2, -62, w, 124, 62); X.fill(); X.strokeStyle = 'rgba(58,160,240,.7)'; X.lineWidth = 3; X.stroke();
  X.fillStyle = COR.azul; X.beginPath(); X.arc(-w / 2 + 62, 0, 44, 0, 7); X.fill();
  X.fillStyle = '#04122e'; X.font = F(900, 44); X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText(num, -w / 2 + 62, 2);
  X.fillStyle = '#fff'; X.font = F(900, 58); X.textAlign = 'left'; X.fillText(nome, -w / 2 + 128, 3);
  const tr = eOut(pr(t, t0 + .3, t0 + .9)); X.fillStyle = COR.azul; rr(-w / 2 + 128, 48, (w - 180) * tr, 8, 4); X.fill();
  X.restore();
}

// ---------- fundo da marca: azul-noite, faixas diagonais azuis e neve ----------
function fundo(t, forte = 1) {
  const g = X.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#071735'); g.addColorStop(.55, '#040b1e'); g.addColorStop(1, '#081a3d'); X.fillStyle = g; X.fillRect(0, 0, W, H);
  X.save(); X.globalCompositeOperation = 'lighter';
  [[-260, 0, .9, 'rgba(29,111,224,.55)'], [-120, 0, .9, 'rgba(58,160,240,.25)'], [W + 200, H, .9, 'rgba(29,111,224,.45)'], [W + 60, H, .9, 'rgba(58,160,240,.2)']].forEach(([x, y, ang, c], i) => {
    X.save(); X.translate(x + Math.sin(t * .4 + i) * 20, y); X.rotate(ang); const lg = X.createLinearGradient(-110, 0, 110, 0); lg.addColorStop(0, 'rgba(0,0,0,0)'); lg.addColorStop(.5, c); lg.addColorStop(1, 'rgba(0,0,0,0)');
    X.fillStyle = lg; X.globalAlpha = forte; X.fillRect(-110, -1600, 220, 3200); X.restore() });
  X.restore();
  brilho(540, 1000, 900, 'rgba(29,111,224,.22)', forte);
  neve(t);
}
function floco(x, y, r, a) { X.save(); X.translate(x, y); X.rotate(a); X.strokeStyle = 'rgba(200,232,255,.85)'; X.lineWidth = Math.max(1.5, r * .16); X.lineCap = 'round'; X.beginPath();
  for (let k = 0; k < 6; k++) { X.rotate(Math.PI / 3); X.moveTo(0, 0); X.lineTo(0, -r); X.moveTo(0, -r * .55); X.lineTo(r * .28, -r * .78); X.moveTo(0, -r * .55); X.lineTo(-r * .28, -r * .78) } X.stroke(); X.restore() }
function neve(t) {
  for (let i = 0; i < 60; i++) { const v = 40 + rnd(i) * 90, y = ((rnd(i + 1) * H + t * v) % (H + 80)) - 40, x = rnd(i + 2) * W + Math.sin(t * .8 + i) * 30, r = 2 + rnd(i + 3) * 5;
    X.fillStyle = `rgba(210,236,255,${.25 + rnd(i + 4) * .45})`; X.beginPath(); X.arc(x, y, r, 0, 7); X.fill() }
  for (let i = 0; i < 7; i++) { const y = ((rnd(i + 50) * H + t * 60) % (H + 120)) - 60; floco(rnd(i + 60) * W, y, 14 + rnd(i + 70) * 14, t * .5 + i) }
}

// ---------- foto num cartão com borda, sombra e zoom lento ----------
function foto(img, cx, cy, w, h, zoom = 1, rot = 0, alpha = 1, corte = 1) {
  X.save(); X.globalAlpha = alpha; X.translate(cx, cy); X.rotate(rot);
  X.shadowColor = 'rgba(0,0,0,.55)'; X.shadowBlur = 60; X.shadowOffsetY = 30; X.fillStyle = '#fff'; rr(-w / 2 - 12, -h / 2 - 12, w + 24, h + 24, 46); X.fill(); X.shadowColor = 'transparent';
  X.save(); rr(-w / 2, -h / 2, w * corte, h, 36); X.clip();
  const s = Math.max(w / img.width, h / img.height) * zoom; X.drawImage(img, -img.width * s / 2, -img.height * s / 2, img.width * s, img.height * s); X.restore();
  X.restore();
}
function selo(t, t0, txt, cor, x, y) { const q = pr(t, t0, t0 + .35); if (q <= 0) return; X.save(); X.translate(x, y); X.rotate(-.05); const s = .4 + .6 * eBack(q); X.scale(s, s); X.globalAlpha = cl(q * 3);
  X.font = F(900, 46); const w = X.measureText(txt).width + 70; X.shadowColor = 'rgba(0,0,0,.4)'; X.shadowBlur = 20; X.fillStyle = cor; rr(-w / 2, -42, w, 84, 42); X.fill(); X.shadowColor = 'transparent';
  X.fillStyle = '#fff'; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText(txt, 0, 3); X.restore() }
function brilhos(t, t0, cx, cy, raio, n = 10) { for (let i = 0; i < n; i++) { const d = t - t0 - rnd(i) * .5; if (d < 0 || d > 1) continue; const s = Math.sin(d * Math.PI);
  const x = cx + (rnd(i + 9) - .5) * raio * 2, y = cy + (rnd(i + 19) - .5) * raio * 2.4; X.save(); X.translate(x, y); X.rotate(d * 2); X.fillStyle = '#fff'; X.globalAlpha = s; const r = 26 * s + 6;
  X.beginPath(); X.moveTo(0, -r); X.quadraticCurveTo(0, 0, r, 0); X.quadraticCurveTo(0, 0, 0, r); X.quadraticCurveTo(0, 0, -r, 0); X.quadraticCurveTo(0, 0, 0, -r); X.fill(); X.restore(); brilho(x, y, 60 * s, 'rgba(120,200,255,.6)') } }
function mascote(x, yPe, alt, t, t0 = -9, bal = 1) {
  const m = IMG.mascote, q = pr(t, t0, t0 + .55); if (q <= 0) return; const e = eBack(q), h = alt * (.4 + .6 * e), w = h * m.width / m.height;
  X.save(); X.translate(x, yPe + (1 - eOut(q)) * 300); X.rotate(Math.sin(t * 2.2) * .025 * bal); X.scale(1 + Math.sin(t * 4.4) * .01 * bal, 1 - Math.sin(t * 4.4) * .01 * bal);
  const sg = X.createRadialGradient(0, 0, 0, 0, 0, w * .45); sg.addColorStop(0, 'rgba(0,0,0,.5)'); sg.addColorStop(1, 'rgba(0,0,0,0)'); X.save(); X.scale(1, .16); X.fillStyle = sg; X.beginPath(); X.arc(0, 0, w * .45, 0, 7); X.fill(); X.restore();
  X.drawImage(m, -w / 2, -h, w, h); X.restore();
}
function logo(cx, cy, w, a = 1) { const l = IMG.logo, h = w * l.height / l.width; X.save(); X.globalAlpha = a; X.shadowColor = 'rgba(58,160,240,.6)'; X.shadowBlur = 40; X.drawImage(l, cx - w / 2, cy - h / 2, w, h); X.restore() }

// ---------- cenas ----------
function cena1(t) {
  fundo(t);
  const sai = eIO(pr(t, 2.3, 2.7));
  X.save(); X.globalAlpha = 1 - sai; X.translate(0, -sai * 120);
  palavras(t, [[['Seu', ], ['freezer', COR.azul]], [['ou', ], ['geladeira', COR.azul]], [['deu', ], ['problema?']]], 540, 560, 112, .45, .2);
  X.restore();
  // termômetro subindo (problema) antes do mascote
  if (t < 2.8) { const a = pr(t, .3, .7) * (1 - sai); X.save(); X.globalAlpha = a; X.translate(540 + Math.sin(t * 30) * 6 * pr(t, 1.2, 1.4), 1330);
    X.fillStyle = '#1a2b4f'; rr(-46, -330, 92, 400, 46); X.fill(); X.beginPath(); X.arc(0, 110, 95, 0, 7); X.fill();
    const n = .25 + .7 * eOut(pr(t, .6, 2)); X.fillStyle = COR.verm; rr(-22, 60 - 360 * n, 44, 360 * n + 40, 22); X.fill(); X.beginPath(); X.arc(0, 110, 70, 0, 7); X.fill();
    brilho(0, 110, 260, 'rgba(239,68,68,.5)', n); X.restore() }
  // virada: logo + mascote
  const lq = pr(t, 2.6, 3.0); if (lq > 0) { X.save(); X.translate(540, 330); const s = .5 + .5 * eBack(lq); X.scale(s, s); logo(0, 0, 900, cl(lq * 2)); X.restore() }
  brilho(540, 1300, 700, 'rgba(58,160,240,.35)', pr(t, 2.6, 3.2));
  mascote(540, 1860, 1250, t, 2.75);
}
function cena2(t) {
  fundo(t, .7);
  etiqueta(t, 5.65, '1', 'ADAPTAÇÃO DE LED');
  const troca = 7.55, z = 1.03 + (t - 5.5) * .012;
  const entra = eBack(pr(t, 5.6, 6.1));
  if (t < troca + .15) foto(IMG['led-antes'], 540, 1000 + (1 - entra) * 1200, 820, 1160, z, -.02);
  if (t >= troca - .05) { const q = pr(t, troca - .05, troca + .25); foto(IMG['led-depois'], 540, 1000, 820, 1160, z + .08 * (1 - eOut(q)), .015, cl(q * 2.5));
    brilho(540, 1000, 900, 'rgba(255,255,255,.9)', (1 - q) * .9); brilho(360, 900, 500, 'rgba(160,215,255,.35)', .6 + .2 * Math.sin(t * 5)) }
  selo(t, 6.1, 'DURANTE O SERVIÇO', '#475569', 540, 470);
  if (t >= troca) { X.save(); X.globalAlpha = pr(t, troca, troca + .2); X.fillStyle = '#040b1e'; rr(200, 420, 680, 100, 50); X.fill(); X.restore(); selo(t, troca + .1, 'PRONTO: ILUMINADO!', COR.azulF, 540, 470) }
  brilhos(t, troca + .1, 540, 1000, 330, 14);
  palavras(t, [[['Produto', ], ['aparece', COR.azul]], [['muito', ], ['mais.', COR.azul]]], 540, 1700, 84, 8.35, .17);
}
function cena3(t) {
  fundo(t, .7);
  etiqueta(t, 11.65, '2', 'LIMPEZA');
  const entra = eBack(pr(t, 11.6, 12.1)), z = 1.04 + (t - 11.5) * .01, cx = 540, cy = 1000, w = 820, h = 1100;
  foto(IMG['limpeza-antes'], cx, cy + (1 - entra) * 1200, w, h, z);
  // cortina: o "depois" entra da esquerda para a direita
  const c = eIO(pr(t, 14.4, 15.4));
  if (c > 0) { X.save(); X.beginPath(); X.rect(0, 0, cx - w / 2 + w * c, H); X.clip(); foto(IMG['limpeza-depois'], cx, cy, w, h, z); X.restore();
    if (c < 1) { const bx = cx - w / 2 + w * c; X.fillStyle = '#fff'; X.shadowColor = COR.azul; X.shadowBlur = 40; X.fillRect(bx - 6, cy - h / 2 - 12, 12, h + 24); X.shadowColor = 'transparent';
      X.beginPath(); X.arc(bx, cy, 44, 0, 7); X.fill(); X.fillStyle = COR.azulF; X.font = F(900, 40); X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText('⇆', bx, cy + 2) } }
  selo(t, 12.3, 'ANTES: SUJEIRA', COR.verm, 540, 470);
  if (c >= 1) { X.save(); X.fillStyle = '#040b1e'; rr(190, 420, 700, 100, 50); X.fill(); X.restore(); selo(t, 15.4, 'DEPOIS: LIMPINHO', COR.verde, 540, 470) }
  brilhos(t, 15.45, cx, cy, 330, 16);
  palavras(t, [[['Volta', ], ['a', ], ['gelar', COR.azul]], [['como', ], ['novo!', COR.azul]]], 540, 1700, 84, 15.6, .17);
}
// manômetro (relógio do gás)
function manometro(x, y, r, cor, ang, rot = '') {
  X.save(); X.translate(x, y);
  X.shadowColor = 'rgba(0,0,0,.5)'; X.shadowBlur = 30; X.fillStyle = cor; X.beginPath(); X.arc(0, 0, r, 0, 7); X.fill(); X.shadowColor = 'transparent';
  for (let k = 0; k < 28; k++) { X.save(); X.rotate(k / 28 * Math.PI * 2); X.fillStyle = 'rgba(0,0,0,.18)'; X.fillRect(-5, -r, 10, 14); X.restore() }
  const g = X.createRadialGradient(-r * .3, -r * .3, 5, 0, 0, r * .85); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#dfe7ef'); X.fillStyle = g; X.beginPath(); X.arc(0, 0, r * .82, 0, 7); X.fill();
  X.strokeStyle = cor; X.lineWidth = 10; X.beginPath(); X.arc(0, 0, r * .66, Math.PI * .75, Math.PI * 2.25); X.stroke();
  for (let k = 0; k <= 12; k++) { const a = Math.PI * .75 + k / 12 * Math.PI * 1.5; X.strokeStyle = '#1e293b'; X.lineWidth = k % 3 ? 3 : 6; X.beginPath(); X.moveTo(Math.cos(a) * r * .55, Math.sin(a) * r * .55); X.lineTo(Math.cos(a) * r * .74, Math.sin(a) * r * .74); X.stroke() }
  X.fillStyle = '#1e293b'; X.font = F(800, r * .16); X.textAlign = 'center'; X.fillText(rot, 0, r * .45);
  X.rotate(Math.PI * .75 + ang * Math.PI * 1.5); X.fillStyle = '#e11d48'; X.beginPath(); X.moveTo(-8, 0); X.lineTo(0, -6); X.lineTo(r * .7, 0); X.lineTo(0, 6); X.fill();
  X.fillStyle = '#1e293b'; X.beginPath(); X.arc(0, 0, 16, 0, 7); X.fill(); X.restore();
  X.save(); X.translate(x, y); X.fillStyle = 'rgba(255,255,255,.35)'; X.beginPath(); X.ellipse(-r * .3, -r * .45, r * .35, r * .14, -.5, 0, 7); X.fill(); X.restore();
}
function mangueira(x0, y0, x1, y1, cor, curva) { X.save(); X.lineCap = 'round'; X.strokeStyle = 'rgba(0,0,0,.35)'; X.lineWidth = 40; X.beginPath(); X.moveTo(x0, y0 + 6); X.bezierCurveTo(x0, y0 + curva, x1, y1 - curva, x1, y1 + 6); X.stroke();
  X.strokeStyle = cor; X.lineWidth = 32; X.beginPath(); X.moveTo(x0, y0); X.bezierCurveTo(x0, y0 + curva, x1, y1 - curva, x1, y1); X.stroke();
  X.strokeStyle = 'rgba(255,255,255,.35)'; X.lineWidth = 8; X.beginPath(); X.moveTo(x0 - 8, y0); X.bezierCurveTo(x0 - 8, y0 + curva, x1 - 8, y1 - curva, x1 - 8, y1); X.stroke(); X.restore() }
function cena4(t) {
  fundo(t, .7);
  etiqueta(t, 18.75, '3', 'RECUPERAÇÃO DE GÁS');
  const q = eBack(pr(t, 18.7, 19.3)); X.save(); X.translate(540, 820 + (1 - q) * 1200);
  // mangueiras
  mangueira(-170, 140, -260, 600, '#2563eb', 220); mangueira(0, 150, 10, 620, '#eab308', 200); mangueira(170, 140, 260, 600, '#dc2626', 220);
  [[-260, 600], [10, 620], [260, 600]].forEach(([x, y]) => { X.fillStyle = '#c8902c'; rr(x - 26, y, 52, 46, 10); X.fill() });
  // corpo de latão
  const lg = X.createLinearGradient(0, 40, 0, 170); lg.addColorStop(0, '#f7d27a'); lg.addColorStop(.5, '#c8902c'); lg.addColorStop(1, '#8a5a12');
  X.fillStyle = lg; rr(-260, 40, 520, 120, 40); X.fill(); X.fillStyle = 'rgba(255,255,255,.4)'; rr(-230, 52, 460, 18, 9); X.fill();
  [-170, 0, 170].forEach(x => { X.fillStyle = lg; rr(x - 34, 130, 68, 50, 12); X.fill() });
  [-80, 80].forEach(x => { X.fillStyle = '#9aa8b8'; rr(x - 20, -40, 40, 90, 10); X.fill() });
  // relógios: tremem e depois firmam na medição ("medição na hora" em 21,4)
  const firma = eOut(pr(t, 21.3, 21.9)), tremor = (1 - firma);
  const a1 = .2 + .25 * pr(t, 19.3, 21.3) + tremor * .06 * Math.sin(t * 23) + firma * .2, a2 = .3 + .2 * pr(t, 19.3, 21.3) + tremor * .06 * Math.sin(t * 19 + 1) + firma * .15;
  manometro(-200, -170, 190, '#1d4ed8', a1, 'BAIXA'); manometro(200, -170, 190, '#dc2626', a2, 'ALTA');
  X.restore();
  // leitura "OK"
  selo(t, 21.5, '✓ MEDIÇÃO NA HORA', COR.verde, 540, 1100);
  // gás saindo como névoa fria
  for (let i = 0; i < 18; i++) { const d = ((t * .6 + rnd(i)) % 1); brilho(540 + (rnd(i + 3) - .5) * 600 + d * 80, 1700 - d * 400, 90 + d * 120, 'rgba(160,215,255,.25)', (1 - d) * pr(t, 19, 19.6)) }
  mascote(900, 1900, 500, t, 19.9, .6);
  palavras(t, [[['Equipamento', ]], [['certo', COR.azul]]], 420, 1600, 84, 20.2, .2);
}
// compressor: foto recortada (fotos/compressor-velho.png e compressor-novo.png), com sombra no chão
function compressor(x, y, s, novo) {
  const im = IMG[novo ? 'compressor-novo' : 'compressor-velho'], w = 820 * s / 1.35, h = w * im.height / im.width;
  X.save(); X.translate(x, y);
  const sg = X.createRadialGradient(0, 0, 0, 0, 0, w * .55); sg.addColorStop(0, 'rgba(0,0,0,.6)'); sg.addColorStop(1, 'rgba(0,0,0,0)'); X.save(); X.translate(0, h * .5); X.scale(1, .14); X.fillStyle = sg; X.beginPath(); X.arc(0, 0, w * .55, 0, 7); X.fill(); X.restore();
  if (!novo) X.filter = 'saturate(.6) brightness(.85)';
  X.drawImage(im, -w / 2, -h / 2, w, h); X.restore();
}
function compressorDesenhado(x, y, s, novo) {
  X.save(); X.translate(x, y); X.scale(s, s);
  X.fillStyle = novo ? '#1f2937' : '#57534e'; rr(-260, 160, 520, 46, 14); X.fill();
  [-200, 200].forEach(px => { X.fillStyle = '#111827'; X.beginPath(); X.arc(px, 183, 16, 0, 7); X.fill() });
  const g = X.createLinearGradient(-200, 0, 200, 0);
  if (novo) { g.addColorStop(0, '#0b1120'); g.addColorStop(.35, '#334155'); g.addColorStop(.55, '#111827'); g.addColorStop(1, '#020617') } else { g.addColorStop(0, '#3f3a34'); g.addColorStop(.4, '#6b6157'); g.addColorStop(1, '#2d2924') }
  X.fillStyle = g; X.beginPath(); X.moveTo(-200, 170); X.lineTo(-200, -60); X.bezierCurveTo(-200, -250, 200, -250, 200, -60); X.lineTo(200, 170); X.closePath(); X.fill();
  X.strokeStyle = novo ? '#475569' : '#2a2520'; X.lineWidth = 8; X.beginPath(); X.moveTo(-205, 20); X.lineTo(205, 20); X.stroke();
  // tubos de cobre
  X.strokeStyle = novo ? '#e3965a' : '#8b5a3c'; X.lineWidth = 22; X.lineCap = 'round';
  X.beginPath(); X.moveTo(120, -150); X.quadraticCurveTo(140, -260, 250, -250); X.stroke(); X.beginPath(); X.moveTo(-90, -165); X.lineTo(-90, -250); X.stroke();
  if (novo) { X.fillStyle = 'rgba(255,255,255,.18)'; X.beginPath(); X.ellipse(-80, -110, 50, 110, .25, 0, 7); X.fill(); X.fillStyle = '#fff'; rr(-70, 60, 140, 70, 10); X.fill(); X.fillStyle = COR.azulF; X.font = F(900, 30); X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText('NOVO', 0, 96) }
  else for (let i = 0; i < 9; i++) { X.fillStyle = `rgba(150,80,30,${.35 + rnd(i) * .3})`; X.beginPath(); X.ellipse((rnd(i + 1) - .5) * 340, (rnd(i + 2) - .3) * 260, 20 + rnd(i + 3) * 30, 12 + rnd(i + 4) * 14, rnd(i) * 3, 0, 7); X.fill() }
  X.restore();
}
function cena5(t) {
  fundo(t, .7);
  etiqueta(t, 23.65, '4', 'TROCA DE COMPRESSOR');
  // velho entra, leva X em "sai o velho" (25,3) e sai para a esquerda
  const ent = eBack(pr(t, 23.6, 24.1)), sai = eIO(pr(t, 25.7, 26.2));
  if (sai < 1) { X.save(); X.translate(-sai * 1100, 0); X.rotate(-sai * .3); compressor(540, 1050 + (1 - ent) * 1100, 1.35, false);
    selo(t, 25.25, '✕ SAI O VELHO', COR.verm, 540, 640); X.restore() }
  const ent2 = eBack(pr(t, 26.1, 26.6));
  if (ent2 > 0) { brilho(540, 1050, 600, 'rgba(58,160,240,.3)', ent2); brilho(540, 1050, 700, 'rgba(150,210,255,.25)', 1 - pr(t, 27.3, 29.2) * .6 * (t > 27.3)); compressor(540 + (1 - ent2) * 1100, 1050, 1.35, true); selo(t, 26.35, '✓ ENTRA O NOVO', COR.verde, 540, 640) }
  // o frio volta: rajada de neve
  const fq = pr(t, 27.3, 29.2); if (fq > 0) { for (let i = 0; i < 26; i++) { const a = rnd(i) * Math.PI * 2, d = eOut(cl(fq * 1.6 - rnd(i + 5) * .3)), r = 120 + d * (380 + rnd(i + 2) * 260);
    X.save(); X.globalAlpha = 1 - fq * .7; floco(540 + Math.cos(a) * r, 1000 + Math.sin(a) * r * .9, 18 + rnd(i + 8) * 22, fq * 3 + i); X.restore() } }
  palavras(t, [[['E', ], ['o', ], ['frio', COR.azul], ['volta!', COR.azul]]], 540, 1640, 100, 27.4, .14);
}
function chip(t, t0, txt, x, y) { const q = pr(t, t0, t0 + .35); if (q <= 0) return; X.save(); X.translate(x, y); const s = .5 + .5 * eBack(q); X.scale(s, s); X.globalAlpha = cl(q * 3);
  X.fillStyle = 'rgba(12,30,70,.9)'; rr(-220, -46, 440, 92, 46); X.fill(); X.strokeStyle = 'rgba(58,160,240,.7)'; X.lineWidth = 3; X.stroke();
  X.fillStyle = COR.verde; X.beginPath(); X.arc(-172, 0, 28, 0, 7); X.fill(); X.strokeStyle = '#fff'; X.lineWidth = 7; X.lineCap = 'round'; X.lineJoin = 'round'; X.beginPath(); X.moveTo(-186, 0); X.lineTo(-176, 11); X.lineTo(-158, -10); X.stroke();
  X.fillStyle = '#fff'; X.font = F(800, 38); X.textAlign = 'left'; X.textBaseline = 'middle'; X.fillText(txt, -128, 2); X.restore() }
function cena6(t) {
  fundo(t, 1);
  // raios girando
  X.save(); X.translate(540, 1300); X.rotate(t * .15); X.globalCompositeOperation = 'lighter'; X.fillStyle = 'rgba(58,160,240,.06)'; for (let i = 0; i < 12; i++) { X.rotate(Math.PI / 6); X.beginPath(); X.moveTo(0, 0); X.lineTo(-110, -1400); X.lineTo(110, -1400); X.fill() } X.restore();
  const lq = pr(t, 29.3, 29.8); X.save(); X.translate(540, 300); const s = .4 + .6 * eBack(lq); X.scale(s, s); logo(0, 0, 960, cl(lq * 2)); X.restore();
  const fq = pr(t, 31.0, 31.5), fr = IMG['logo-frase'], fw = 960, fh = fw * fr.height / fr.width; X.save(); X.globalAlpha = fq; X.drawImage(fr, 540 - fw / 2, 545 + (1 - eOut(fq)) * 30, fw, fh); X.restore();
  chip(t, 31.6, 'LED', 300, 760); chip(t, 31.8, 'Limpeza', 780, 760); chip(t, 32.0, 'Gás', 300, 875); chip(t, 32.2, 'Compressor', 780, 875);
  mascote(540, 1880, 900, t, 29.5);
  brilhos(t, 33.2, 540, 1400, 360, 12);
}

const CENAS = [cena1, cena2, cena3, cena4, cena5, cena6];
function desenha(i, t) { X.save(); CENAS[i](t); X.restore() }
function render(t) {
  let i = CUTS.findIndex(c => t < c); if (i < 0) i = CENAS.length - 1;
  const fim = DUR - .45; // escurece no fim
  const troca = (a, p) => { X.save(); X.translate(-p * W, 0); desenha(a, t); X.restore(); X.save(); X.translate((1 - p) * W, 0); desenha(a + 1, t); X.restore() };
  if (i > 0 && t < CUTS[i - 1] + TR / 2) troca(i - 1, eIO(pr(t, CUTS[i - 1] - TR / 2, CUTS[i - 1] + TR / 2)));
  else if (i < CUTS.length && t > CUTS[i] - TR / 2) troca(i, eIO(pr(t, CUTS[i] - TR / 2, CUTS[i] + TR / 2)));
  else desenha(i, t);
  if (t > fim) { X.fillStyle = `rgba(0,0,0,${pr(t, fim, DUR)})`; X.fillRect(0, 0, W, H) }
}
