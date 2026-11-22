// Vídeo de 8 s do app Caixa (vertical 1080×1920). render(t) desenha o quadro do segundo t.
// Cortes e falas (narração em narracao.py; tempos medidos no áudio):
//   0,00 cena 1  "Fechar o caixa no papel? Nunca mais."   (fala a em 0,20)
//   2,50 cena 2  "No app Caixa, você fala e ele soma tudo." (fala b em 2,70)
//   5,15 cena 3  "Fechou!"                                  (fala c em 5,40)
//   6,75 cena 4  marca do app
const cv = document.getElementById('c'), X = cv.getContext('2d'), W = 1080, H = 1920, DUR = 8;
const CUTS = [2.5, 5.15, 6.75], TR = 0.3; // troca de cena: desliza para o lado em 0,3 s
const COR = { ink: '#0f1b33', azul: '#2563eb', azulE: '#1d4ed8', azulC: '#bcd0fb', muted: '#64708a', verde: '#16a34a', ouro: '#f5b82e' };
const F = (w, s) => `${w} ${s}px "Bricolage"`;

// ---------- utilidades ----------
const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const pr = (t, a, b) => cl((t - a) / (b - a));
const eOut = p => 1 - Math.pow(1 - p, 3), eIO = p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
const eBack = p => { const c = 1.9; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2) };
const rnd = s => { const x = Math.sin(s * 127.1) * 43758.5453; return x - Math.floor(x) };
function rr(x, y, w, h, r) { X.beginPath(); X.roundRect(x, y, w, h, r) }
function sombra(x, y, rx, ry, a = .18) { const g = X.createRadialGradient(x, y, 0, x, y, rx); g.addColorStop(0, `rgba(15,27,51,${a})`); g.addColorStop(1, 'rgba(15,27,51,0)'); X.save(); X.translate(x, y); X.scale(1, ry / rx); X.translate(-x, -y); X.fillStyle = g; X.beginPath(); X.arc(x, y, rx, 0, 7); X.fill(); X.restore() }

// palavras que sobem e aparecem uma a uma: linhas = [[ [palavra, cor], ... ], ...]
function palavras(t, linhas, x, y, tam, t0, passo = .12, alinhar = 'center') {
  X.save(); X.font = F(800, tam); X.textBaseline = 'alphabetic'; let k = 0;
  linhas.forEach((ln, i) => {
    const esp = tam * .26, larg = ln.map(([p]) => X.measureText(p).width), tot = larg.reduce((a, b) => a + b, 0) + esp * (ln.length - 1);
    let cx = alinhar === 'center' ? x - tot / 2 : x;
    ln.forEach(([p, cor], j) => {
      const q = pr(t, t0 + k * passo, t0 + k * passo + .38); k++;
      if (q > 0) { X.save(); X.globalAlpha = cl(q * 2.2); X.fillStyle = cor || COR.ink; const s = .7 + .3 * eBack(q);
        X.translate(cx + larg[j] / 2, y + i * tam * 1.08 + (1 - eOut(q)) * 50); X.scale(s, s); X.textAlign = 'center'; X.fillText(p, 0, 0); X.restore() }
      cx += larg[j] + esp;
    });
  });
  X.restore();
}

// ---------- fundos ----------
function fundoClaro(t) {
  const g = X.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#f7f9fd'); g.addColorStop(1, '#e4ecf9'); X.fillStyle = g; X.fillRect(0, 0, W, H);
  [[220 + 60 * Math.sin(t * .7), 520, 520, 'rgba(37,99,235,.10)'], [900, 1500 + 50 * Math.cos(t * .6), 600, 'rgba(14,165,233,.10)'], [980, 300, 380, 'rgba(245,184,46,.08)']].forEach(([x, y, r, c]) => {
    const b = X.createRadialGradient(x, y, 0, x, y, r); b.addColorStop(0, c); b.addColorStop(1, 'rgba(255,255,255,0)'); X.fillStyle = b; X.fillRect(0, 0, W, H) });
}
function fundoAzul(t) {
  const g = X.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#1d4ed8'); g.addColorStop(.55, '#2563eb'); g.addColorStop(1, '#0ea5e9'); X.fillStyle = g; X.fillRect(0, 0, W, H);
  const b = X.createRadialGradient(540, 820, 0, 540, 820, 700); b.addColorStop(0, 'rgba(255,255,255,.22)'); b.addColorStop(1, 'rgba(255,255,255,0)'); X.fillStyle = b; X.fillRect(0, 0, W, H);
}

// ---------- personagens (volume com degradê, tipo boneco 3D fofo) ----------
function olho(x, y, r, olhar = 0, fecha = 0) {
  X.save(); X.translate(x, y); X.scale(1, 1 - fecha * .92);
  X.fillStyle = '#fff'; X.beginPath(); X.ellipse(0, 0, r, r * 1.15, 0, 0, 7); X.fill();
  X.fillStyle = '#1b2235'; X.beginPath(); X.ellipse(olhar * r * .25, r * .12, r * .66, r * .76, 0, 0, 7); X.fill();
  X.fillStyle = '#fff'; X.beginPath(); X.arc(olhar * r * .25 - r * .22, -r * .18, r * .24, 0, 7); X.fill(); X.beginPath(); X.arc(olhar * r * .25 + r * .2, r * .32, r * .1, 0, 7); X.fill();
  X.restore();
}
function bochecha(x, y, r) { const g = X.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(255,120,140,.55)'); g.addColorStop(1, 'rgba(255,120,140,0)'); X.fillStyle = g; X.beginPath(); X.arc(x, y, r, 0, 7); X.fill() }
function gota(x, y, s) { X.save(); X.translate(x, y); X.scale(s, s); const g = X.createLinearGradient(0, -40, 0, 30); g.addColorStop(0, '#bfe6ff'); g.addColorStop(1, '#4aa8f0'); X.fillStyle = g;
  X.beginPath(); X.moveTo(0, -42); X.bezierCurveTo(14, -18, 26, 0, 26, 12); X.arc(0, 12, 26, 0, Math.PI); X.bezierCurveTo(-26, 0, -14, -18, 0, -42); X.fill();
  X.fillStyle = 'rgba(255,255,255,.8)'; X.beginPath(); X.ellipse(-9, 8, 5, 9, -.3, 0, 7); X.fill(); X.restore() }
function braco(x, y, ang, comp, cor, corE) { X.save(); X.translate(x, y); X.rotate(ang); const g = X.createLinearGradient(-18, 0, 18, 0); g.addColorStop(0, cor); g.addColorStop(1, corE);
  X.fillStyle = g; rr(-17, 0, 34, comp, 17); X.fill(); X.beginPath(); X.arc(0, comp, 24, 0, 7); X.fill(); X.restore() }

// folha de papel aflita (cena 1). humor: 0 = aflita, 1 = aliviada
function folha(x, y, s, t, humor) {
  X.save(); X.translate(x, y); X.scale(s, s); X.rotate(Math.sin(t * 9) * .035 * (1 - humor));
  braco(-150, 20, .5, 120, '#fbf5e6', '#d9ccae'); braco(150, 20, -.5, 120, '#fbf5e6', '#d9ccae');
  // espessura e corpo
  X.fillStyle = '#cdbf9f'; rr(-160, -205, 320, 420, 34); X.fill();
  const g = X.createRadialGradient(-70, -120, 20, 0, 0, 330); g.addColorStop(0, '#fffefa'); g.addColorStop(.7, '#f6efdf'); g.addColorStop(1, '#e3d6b8');
  X.fillStyle = g; rr(-160, -215, 320, 412, 34); X.fill();
  // canto dobrado
  X.fillStyle = '#e6d9bb'; X.beginPath(); X.moveTo(96, -215); X.lineTo(160, -151); X.lineTo(110, -151); X.quadraticCurveTo(96, -151, 96, -165); X.fill();
  // linhas de conta rabiscadas
  X.strokeStyle = '#9fb6e8'; X.lineWidth = 7; X.lineCap = 'round';
  [[-110, -160, 150], [-110, -120, 200], [-110, -80, 120]].forEach(([a, b, c], i) => { X.beginPath(); X.moveTo(a, b); for (let k = 0; k <= c; k += 20) X.lineTo(a + k, b + Math.sin(k * .2 + i) * 5); X.stroke() });
  X.strokeStyle = '#e05252'; X.lineWidth = 6; X.beginPath(); X.moveTo(40, -130); X.lineTo(90, -80); X.moveTo(90, -130); X.lineTo(40, -80); X.stroke();
  // rosto
  const pisca = (t % 1.7) < .1 ? 1 : 0;
  olho(-55, 20, 34, Math.sin(t * 5) * (1 - humor), pisca); olho(55, 20, 34, Math.sin(t * 5) * (1 - humor), pisca);
  X.strokeStyle = '#3a2f22'; X.lineWidth = 8; X.lineCap = 'round';
  const sob = 1 - humor, ey = -30 - 14 * humor; // sobrancelha: aflita sobe no meio; aliviada fica reta e alta
  X.beginPath(); X.moveTo(-85, ey + 10 * sob); X.lineTo(-30, ey - 12 * sob); X.moveTo(85, ey + 10 * sob); X.lineTo(30, ey - 12 * sob); X.stroke();
  X.beginPath();
  if (humor < .5) { X.moveTo(-40, 110); for (let k = 0; k <= 80; k += 10) X.lineTo(-40 + k, 110 + Math.sin(k * .25 + t * 14) * 6) } else { X.moveTo(-42, 95); X.quadraticCurveTo(0, 140, 42, 95) }
  X.stroke();
  bochecha(-95, 80, 34); bochecha(95, 80, 34);
  if (humor < .5) gota(150, -150 + ((t * 120) % 60), .9);
  X.restore();
}
function papelSolto(x, y, s, ang) { X.save(); X.translate(x, y); X.rotate(ang); X.scale(s, s);
  X.fillStyle = 'rgba(15,27,51,.08)'; rr(-62, -78, 132, 168, 12); X.fill();
  const g = X.createLinearGradient(-70, -85, 70, 85); g.addColorStop(0, '#fffefa'); g.addColorStop(1, '#eadfc6'); X.fillStyle = g; rr(-70, -85, 140, 170, 12); X.fill();
  X.fillStyle = '#c9d6f2'; for (let i = 0; i < 4; i++) { rr(-48, -55 + i * 30, 70 + (i % 2) * 26, 9, 5); X.fill() } X.restore() }

// caixinha azul (ícone do app) feliz. pulo: 0..1 (amassa e estica)
function caixinha(x, y, s, t, pulo = 0, comMoeda = true) {
  const sq = Math.sin(pulo * Math.PI), sy = 1 + .12 * sq, sx = 1 - .08 * sq;
  X.save(); X.translate(x, y); X.scale(s * sx, s * sy);
  braco(-175, 40, .25 + Math.sin(t * 6) * .08, 110, '#3b82f6', '#1e40af');
  braco(175, 40, -.25 - Math.sin(t * 6) * .08, 110, '#3b82f6', '#1e40af');
  if (comMoeda) moeda(-200 + 30, 190, .8, t * 3);
  // recibo saindo por cima
  const g0 = X.createLinearGradient(0, -330, 0, -170); g0.addColorStop(0, '#ffffff'); g0.addColorStop(1, '#dfe7f6'); X.fillStyle = g0;
  X.beginPath(); X.moveTo(-95, -170); X.lineTo(-95, -300); for (let k = 0; k <= 10; k++) X.lineTo(-95 + k * 19, -300 - (k % 2 ? 14 : 0)); X.lineTo(95, -170); X.fill();
  X.fillStyle = COR.azulC; rr(-65, -270, 110, 12, 6); X.fill(); rr(-65, -240, 80, 12, 6); X.fill();
  // corpo
  X.fillStyle = '#163a9c'; rr(-200, -190, 400, 400, 90); X.fill();
  const g = X.createRadialGradient(-90, -120, 30, 0, 0, 340); g.addColorStop(0, '#5b95ff'); g.addColorStop(.6, '#2563eb'); g.addColorStop(1, '#1d4ed8');
  X.fillStyle = g; rr(-200, -200, 400, 385, 90); X.fill();
  X.fillStyle = 'rgba(255,255,255,.28)'; X.beginPath(); X.ellipse(-95, -140, 70, 34, -.5, 0, 7); X.fill();
  // folhinha branca com R$ (como no ícone)
  X.fillStyle = 'rgba(15,27,51,.18)'; rr(-112, -40, 224, 175, 28); X.fill();
  X.fillStyle = '#fff'; rr(-112, -48, 224, 175, 28); X.fill();
  // rosto
  const pisca = ((t + .6) % 2.1) < .1 ? 1 : 0;
  olho(-52, 5, 27, 0, pisca); olho(52, 5, 27, 0, pisca);
  X.fillStyle = '#7a1f2b'; X.beginPath(); X.moveTo(-40, 60); X.quadraticCurveTo(0, 125, 40, 60); X.closePath(); X.fill();
  X.fillStyle = '#ff7f93'; X.beginPath(); X.ellipse(0, 95, 20, 11, 0, 0, 7); X.fill();
  bochecha(-85, 62, 26); bochecha(85, 62, 26);
  X.restore();
}
function moeda(x, y, s, giro) { X.save(); X.translate(x, y); X.scale(s * (.35 + .65 * Math.abs(Math.cos(giro))), s);
  X.fillStyle = '#c98a12'; X.beginPath(); X.arc(0, 6, 50, 0, 7); X.fill();
  const g = X.createRadialGradient(-16, -18, 4, 0, 0, 52); g.addColorStop(0, '#fff2b3'); g.addColorStop(.5, '#f5b82e'); g.addColorStop(1, '#d99a17');
  X.fillStyle = g; X.beginPath(); X.arc(0, 0, 50, 0, 7); X.fill();
  X.strokeStyle = 'rgba(160,100,10,.5)'; X.lineWidth = 5; X.beginPath(); X.arc(0, 0, 38, 0, 7); X.stroke();
  X.fillStyle = '#b27a0c'; X.font = F(800, 44); X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText('$', 0, 3); X.restore() }

// ---------- celular com o app ----------
const NOTAS = [['Raimunda', 500, 3.30], ['Francisca', 320, 3.72], ['Ana Paula', 180, 4.14]];
const brl = v => 'R$ ' + Math.round(v).toLocaleString('pt-BR');
function celular(t, x, y, s) {
  X.save(); X.translate(x, y); X.scale(s, s);
  const w = 600, h = 1080; sombra(0, h / 2 + 40, 330, 50, .22);
  X.fillStyle = '#0f172a'; rr(-w / 2, -h / 2, w, h, 78); X.fill();
  X.fillStyle = '#334155'; rr(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8, 74); X.fill(); X.fillStyle = '#0f172a'; rr(-w / 2 + 10, -h / 2 + 10, w - 20, h - 20, 70); X.fill();
  X.save(); rr(-w / 2 + 22, -h / 2 + 22, w - 44, h - 44, 58); X.clip();
  X.fillStyle = '#eef2f8'; X.fillRect(-w / 2, -h / 2, w, h);
  const g = X.createLinearGradient(-w / 2, -h / 2, w / 2, -h / 2 + 220); g.addColorStop(0, '#1d4ed8'); g.addColorStop(.5, '#2563eb'); g.addColorStop(1, '#0ea5e9');
  X.fillStyle = g; X.fillRect(-w / 2, -h / 2, w, 230);
  X.fillStyle = '#fff'; X.textAlign = 'left'; X.textBaseline = 'alphabetic'; X.font = F(800, 50); X.fillText('Caixa', -240, -h / 2 + 150);
  X.font = F(600, 24); X.globalAlpha = .85; X.fillText('Recebimento · semana', -240, -h / 2 + 190); X.globalAlpha = 1;
  // cartão "Notas 25%"
  const cy0 = -h / 2 + 260; X.fillStyle = '#fff'; rr(-260, cy0, 520, 560, 30); X.fill();
  X.fillStyle = COR.ink; X.font = F(800, 34); X.fillText('Notas 25%', -230, cy0 + 62);
  // microfone pulsando enquanto ouve
  const ouv = pr(t, 2.95, 3.1) * (1 - pr(t, 4.4, 4.6)), mx = 185, my = cy0 + 50;
  for (let k = 0; k < 3; k++) { const f = ((t * 1.3 + k / 3) % 1); X.strokeStyle = `rgba(37,99,235,${.45 * (1 - f) * ouv})`; X.lineWidth = 5; X.beginPath(); X.arc(mx, my, 34 + f * 46, 0, 7); X.stroke() }
  X.fillStyle = ouv > .5 ? '#dc2626' : COR.azul; X.beginPath(); X.arc(mx, my, 34, 0, 7); X.fill();
  X.fillStyle = '#fff'; rr(mx - 9, my - 20, 18, 28, 9); X.fill(); X.strokeStyle = '#fff'; X.lineWidth = 4; X.beginPath(); X.arc(mx, my + 2, 16, .15 * Math.PI, .85 * Math.PI); X.stroke(); X.fillRect(mx - 2, my + 18, 4, 8);
  // onda da voz
  if (ouv > 0) { X.fillStyle = COR.azul; X.globalAlpha = ouv; for (let k = 0; k < 16; k++) { const a = 6 + 22 * Math.abs(Math.sin(t * 13 + k * .9) * Math.sin(t * 5 + k * .4)); rr(-230 + k * 22, cy0 + 112 - a / 2, 10, a, 5); X.fill() } X.globalAlpha = 1 }
  // notas entrando
  let total = 0;
  NOTAS.forEach(([nome, v, t0], i) => {
    const q = pr(t, t0, t0 + .35); if (q <= 0) return; total += v * eOut(pr(t, t0, t0 + .5));
    const ry = cy0 + 160 + i * 112; X.save(); X.globalAlpha = cl(q * 2); X.translate(0, ry + 45); const sc = .6 + .4 * eBack(q); X.scale(sc, sc);
    X.fillStyle = '#eaf1ff'; rr(-230, -45, 460, 90, 22); X.fill();
    X.fillStyle = COR.azul; X.beginPath(); X.arc(-185, 0, 26, 0, 7); X.fill(); X.fillStyle = '#fff'; X.font = F(800, 26); X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText(nome[0], -185, 1);
    X.textAlign = 'left'; X.fillStyle = COR.ink; X.font = F(600, 32); X.fillText(nome, -142, 1);
    X.textAlign = 'right'; X.fillStyle = COR.azulE; X.font = F(800, 34); X.fillText(brl(v), 205, 1); X.restore();
  });
  // total
  const ty = cy0 + 590; X.fillStyle = '#fff'; rr(-260, ty, 520, 130, 30); X.fill(); X.strokeStyle = COR.azul; X.lineWidth = 4; rr(-258, ty + 2, 516, 126, 28); X.stroke();
  X.textBaseline = 'middle'; X.textAlign = 'left'; X.fillStyle = COR.muted; X.font = F(600, 30); X.fillText('Total recebido', -228, ty + 65);
  X.textAlign = 'right'; X.fillStyle = COR.azulE; X.font = F(800, 46); X.fillText(brl(total), 228, ty + 67);
  X.restore(); X.restore();
}

// ---------- cenas ----------
function cena1(t) {
  fundoClaro(t);
  // papelada: espalhada ao redor e voando para longe quando vem o "Nunca mais"
  const voa = eIO(pr(t, 1.62, 2.4));
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + 1, r = 330 + rnd(i) * 90, bx = 540 + Math.cos(a) * r, by = 1260 + Math.sin(a) * r * .7;
    const fx = (bx - 540) * 2.6 * voa, fy = -900 * voa * (.6 + rnd(i + 3)); papelSolto(bx + fx + Math.sin(t * 3 + i) * 8, by + fy + Math.cos(t * 2.5 + i) * 10, .9 + rnd(i + 9) * .3, (rnd(i + 5) - .5) * .8 + voa * (rnd(i) - .5) * 5) }
  sombra(540, 1530, 230, 34);
  const humor = eOut(pr(t, 1.75, 2.05));
  folha(540, 1270 - Math.abs(Math.sin(t * 9)) * 8 * (1 - humor), 1.05, t, humor);
  palavras(t, [[['Fechar', COR.ink], ['o', COR.ink], ['caixa', COR.ink]], [['no', COR.ink], ['papel?', COR.azul]]], 540, 360, 118, .25, .14);
  // "Nunca mais." carimbado
  const q = pr(t, 1.6, 1.9); if (q > 0) { X.save(); X.translate(540, 640); X.rotate(-.06); const s = 1.6 - .6 * eBack(q); X.scale(s, s); X.globalAlpha = cl(q * 3);
    X.fillStyle = '#dc2626'; rr(-270, -70, 540, 130, 34); X.fill(); X.fillStyle = '#fff'; X.font = F(800, 92); X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText('Nunca mais.', 0, -2); X.restore() }
}
function cena2(t) {
  fundoClaro(t);
  palavras(t, [[['Você', COR.ink], ['fala,', COR.ink]], [['ele', COR.ink], ['soma.', COR.azul]]], 540, 250, 118, 3.25, .2);
  const q = pr(t, 2.55, 3.05); celular(t, 540, 1180 + (1 - eBack(q)) * 900, .92);
  // caixinha espiando no canto
  const c = pr(t, 3.0, 3.4); if (c > 0) caixinha(905, 1720 - eBack(c) * 140 + Math.sin(t * 4) * 6, .42, t, 0, false);
}
function cena3(t) {
  fundoClaro(t);
  // explosão de moedas a partir da caixinha
  const t0 = 5.32;
  for (let i = 0; i < 14; i++) { const d = t - t0 - rnd(i) * .15; if (d < 0) continue; const a = -Math.PI / 2 + (rnd(i + 2) - .5) * 2.6, v = 900 + rnd(i + 7) * 700;
    moeda(540 + Math.cos(a) * v * d, 1150 + Math.sin(a) * v * d + 1400 * d * d, .55 + rnd(i + 1) * .35, d * 8 + i) }
  // confete
  for (let i = 0; i < 40; i++) { const d = t - 5.35; if (d < 0) break; const x = 540 + (rnd(i) - .5) * 1300 * eOut(cl(d * 2)) + Math.sin(d * 5 + i) * 30, y = 900 - 700 * eOut(cl(d * 2.5)) * rnd(i + 4) + 520 * d * d * 2;
    X.save(); X.translate(x, y); X.rotate(d * 6 + i); X.fillStyle = ['#2563eb', '#f5b82e', '#16a34a', '#0ea5e9', '#ff7f93'][i % 5]; X.fillRect(-12, -6, 24, 12); X.restore() }
  const pulo = pr(t, 5.3, 5.75), alt = Math.sin(pulo * Math.PI) * 160;
  sombra(540, 1480, 250 - alt * .5, 36, .2 - alt * .0006);
  caixinha(540, 1200 - alt, 1.05, t, pulo);
  // "Fechou!"
  const q = pr(t, 5.38, 5.7); if (q > 0) { X.save(); X.translate(540, 470); X.rotate(-.04); const s = .3 + .7 * eBack(q); X.scale(s, s); X.globalAlpha = cl(q * 3);
    X.font = F(800, 210); X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillStyle = 'rgba(29,78,216,.18)'; X.fillText('Fechou!', 8, 14); X.fillStyle = COR.azul; X.fillText('Fechou!', 0, 0); X.restore() }
  // cartão do total com check
  const k = pr(t, 5.75, 6.1); if (k > 0) { X.save(); X.translate(540, 1690); const s = .6 + .4 * eBack(k); X.scale(s, s); X.globalAlpha = cl(k * 2.5);
    X.fillStyle = 'rgba(15,27,51,.08)'; rr(-330, -80, 660, 170, 44); X.fill(); X.fillStyle = '#fff'; rr(-330, -90, 660, 170, 44); X.fill();
    X.fillStyle = COR.verde; X.beginPath(); X.arc(-245, -5, 46, 0, 7); X.fill(); X.strokeStyle = '#fff'; X.lineWidth = 12; X.lineCap = 'round'; X.lineJoin = 'round'; X.beginPath(); X.moveTo(-268, -5); X.lineTo(-252, 13); X.lineTo(-220, -24); X.stroke();
    X.textAlign = 'left'; X.textBaseline = 'middle'; X.fillStyle = COR.muted; X.font = F(600, 30); X.fillText('Caixa da semana', -175, -32);
    X.fillStyle = COR.ink; X.font = F(800, 64); X.fillText('R$ 1.000', -175, 22); X.restore() }
}
function iconeApp(x, y, s) { X.save(); X.translate(x, y); X.scale(s, s);
  X.fillStyle = 'rgba(10,20,60,.25)'; rr(-256, -236, 512, 512, 112); X.fill();
  const g = X.createLinearGradient(0, -256, 0, 256); g.addColorStop(0, '#2b5fe0'); g.addColorStop(1, '#1a44c4'); X.fillStyle = g; rr(-256, -256, 512, 512, 112); X.fill();
  X.strokeStyle = 'rgba(255,255,255,.35)'; X.lineWidth = 6; rr(-253, -253, 506, 506, 110); X.stroke();
  X.fillStyle = '#fff'; rr(-120, -160, 240, 320, 24); X.fill(); X.fillStyle = COR.azulC; rr(-84, -110, 168, 22, 11); X.fill(); rr(-84, -60, 120, 22, 11); X.fill(); rr(-84, -10, 150, 22, 11); X.fill();
  X.fillStyle = COR.azulE; X.font = 'bold 84px Arial,Helvetica,sans-serif'; X.textAlign = 'center'; X.textBaseline = 'alphabetic'; X.fillText('R$', 0, 116); X.restore() }
function cena4(t) {
  fundoAzul(t);
  // raios girando atrás do ícone
  X.save(); X.translate(540, 820); X.rotate(t * .25); X.fillStyle = 'rgba(255,255,255,.07)'; for (let i = 0; i < 12; i++) { X.rotate(Math.PI / 6); X.beginPath(); X.moveTo(0, 0); X.lineTo(-90, -1100); X.lineTo(90, -1100); X.fill() } X.restore();
  const q = pr(t, 6.8, 7.2); iconeApp(540, 820 - (1 - eOut(q)) * 80, (.2 + .8 * eBack(q)) * .78);
  X.save(); X.textAlign = 'center'; X.textBaseline = 'alphabetic'; X.fillStyle = '#fff';
  const a = pr(t, 7.05, 7.35); X.globalAlpha = a; X.font = F(800, 150); X.fillText('Caixa', 540, 1260 + (1 - eOut(a)) * 40);
  const b = pr(t, 7.25, 7.55); X.globalAlpha = b; X.font = F(600, 52); X.fillText('Você fala. Ele fecha o caixa.', 540, 1360 + (1 - eOut(b)) * 30);
  const c = pr(t, 7.4, 7.7); X.globalAlpha = c; X.fillStyle = 'rgba(255,255,255,.95)'; rr(290, 1450, 500, 100, 50); X.fill();
  X.fillStyle = COR.azulE; X.font = F(800, 44); X.textBaseline = 'middle'; X.fillText('Baixe o app', 540, 1502); X.restore();
}

const CENAS = [cena1, cena2, cena3, cena4];
function desenha(i, t) { X.save(); CENAS[i](t); X.restore() }
function render(t) {
  let i = CUTS.findIndex(c => t < c); if (i < 0) i = CENAS.length - 1;
  const c = CUTS[i - 1]; // troca: a cena anterior sai para a esquerda e a nova entra pela direita
  if (i > 0 && t < c + TR / 2) {
    const p = eIO(pr(t, c - TR / 2, c + TR / 2));
    X.save(); X.translate(-p * W, 0); desenha(i - 1, t); X.restore();
    X.save(); X.translate((1 - p) * W, 0); desenha(i, t); X.restore();
  } else if (i < CUTS.length && t > CUTS[i] - TR / 2) {
    const p = eIO(pr(t, CUTS[i] - TR / 2, CUTS[i] + TR / 2));
    X.save(); X.translate(-p * W, 0); desenha(i, t); X.restore();
    X.save(); X.translate((1 - p) * W, 0); desenha(i + 1, t); X.restore();
  } else desenha(i, t);
}
