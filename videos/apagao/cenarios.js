// ================= Cenários e objetos do vídeo do boato do apagão =================
// céu noturno com estrelas e lua recortada
const ESTR = (() => { const q = rng(41), a = []; for (let i = 0; i < 220; i++)a.push([q() * W, q() * 1300, .8 + q() * 1.8, .3 + q() * .7]); return a })();
function ceu(t, o = {}) {
  c.fillStyle = bands(0, 0, 0, o.hz ?? 1300, [[.35, P.noite0], [.62, P.noite1], [.82, P.noite2], [1, '#1d3354']]); c.fillRect(0, 0, W, H);
  ESTR.forEach(([x, y, r, b], i) => { c.fillStyle = `rgba(230,236,255,${(b * (.7 + .3 * sin(t * 2 + i)) * (o.estrelas ?? 1)).toFixed(3)})`; c.fillRect(x, y, r, r) });
  if (o.lua !== false) { const lx = o.lx ?? 820, ly = o.ly ?? 330; glow(lx, ly, 260, '220,230,255', .18); disc(lx, ly, 86, '#e9ecf2'); c.save(); c.beginPath(); c.arc(lx, ly, 86, 0, 7); c.clip(); disc(lx + 34, ly - 6, 86, 'rgba(160,172,200,.55)'); disc(lx - 30, ly - 22, 13, 'rgba(150,160,190,.5)'); disc(lx - 6, ly + 30, 9, 'rgba(150,160,190,.5)'); c.restore() }
}
// cidade: prédios em dois planos (luz e sombra); luz(i, x) devolve 0..1 (apagando de um lado para o outro)
function cidade(t, o = {}) {
  const base = o.base ?? 1330, luz = o.luz ?? (() => 1);
  const camada = (seed, h0, h1, wmin, wmax, cores, jan, dim) => {
    const q = rng(seed); let x = -60, i = 0;
    while (x < W + 60) {
      const w = wmin + q() * (wmax - wmin), h = h0 + q() * (h1 - h0), lit = clamp(luz(i, x + w / 2)), top = base - h, tipo = q();
      c.fillStyle = cores[0]; c.fillRect(x, top, w, h); c.fillStyle = cores[1]; c.fillRect(x + w * .62, top, w * .38, h);
      if (tipo < .25) { poly([[x + w * .2, top], [x + w * .5, top - 60], [x + w * .8, top]], cores[0]); line(x + w * .5, top - 60, x + w * .5, top - 130, cores[0], 5); if (lit > .5 && sin(t * 4 + i) > 0) disc(x + w * .5, top - 132, 6, P.verm) }
      else if (tipo < .45) { c.fillStyle = cores[1]; c.fillRect(x + w * .2, top - 40, w * .3, 40) }
      const cw = jan, rows = Math.floor((h - 50) / (cw * 1.6)), cols = Math.max(1, Math.floor((w - 24) / (cw * 1.5)));
      for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
        const on = q() < .62, wx = x + 14 + k * cw * 1.5, wy = top + 30 + r * cw * 1.6, fl = (q() - .5) * .3;
        const v = on ? clamp(lit * 1.2 + fl - (lit < 1 && lit > 0 ? (sin(t * 37 + r * 3 + k) > .6 ? .5 : 0) : 0)) : 0;
        c.fillStyle = v > .05 ? `rgba(255,${Math.round(196 + 30 * dim)},${Math.round(90 + 60 * dim)},${(.35 + .65 * v) * (1 - dim * .4)})` : 'rgba(8,14,26,.75)'; c.fillRect(wx, wy, cw, cw * .95);
      }
      if (lit > .1) add(() => glow(x + w / 2, top + h * .4, w * .9, AMB, .06 * lit * (1 - dim)));
      x += w + 6 + q() * 10; i++;
    }
  };
  camada(o.seed ?? 3, 380, 760, 110, 190, ['#14243c', '#0e1a2d'], 16, .6);
  camada((o.seed ?? 3) + 1, 220, 560, 130, 230, ['#1b3150', '#11213a'], 22, 0);
  c.fillStyle = '#0a1220'; c.fillRect(0, base, W, H - base); c.fillStyle = '#18283f'; c.fillRect(0, base, W, 10);
  const L = clamp(luz(0, W / 2)); for (let i = 0; i < 6; i++) { const x = 90 + i * 190; line(x, base + 200, x, base + 30, '#0f1b2e', 8); line(x, base + 30, x + 40, base + 30, '#0f1b2e', 6); if (L > .2) { add(() => glow(x + 40, base + 38, 140, AMB, .25 * L)); disc(x + 40, base + 38, 9, P.luz) } }
}
// calendário de mesa (folha que arranca)
function calendario(x, y, s, dia, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  rr(-230, -260, 460, 520, 26, '#0b1220'); rr(-220, -250, 440, 500, 22, P.creme); c.fillStyle = '#dcd6c6'; c.fillRect(0, -250, 220, 500);
  c.save(); c.beginPath(); c.roundRect(-220, -250, 440, 500, 22); c.clip(); c.fillStyle = o.cor || P.verm; c.fillRect(-220, -250, 440, 130); c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(0, -250, 220, 130); c.restore();
  for (let k = -3; k <= 3; k++) { rr(k * 56 - 9, -290, 18, 70, 9, '#9aa4b4'); rr(k * 56 - 9, -290, 9, 70, 4, '#c8d0dc') }
  txt(o.mes || 'NOVEMBRO 2026', 0, -160, 50, '#fff', { align: 'center', sh: 0, ls: 4 });
  txt(String(dia), 0, 120, 270, P.tinta, { align: 'center', sh: 0 });
  txt(o.sem || 'TERÇA-FEIRA', 0, 205, 46, '#5a6476', { align: 'center', sh: 0, ls: 6, w: 600 });
  if (o.circulo) { const u = o.circulo; c.strokeStyle = P.verm; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.ellipse(0, 30, 185, 150, -.1, -PI / 2, -PI / 2 + u * 2 * PI); c.stroke() }
  c.restore();
}
function folhaVoando(x, y, s, u, dia) { if (u <= 0 || u >= 1) return; c.save(); c.translate(x + u * 500, y - u * 300 + u * u * 900); c.rotate(u * 1.6); c.scale(s * (1 - u * .2), s * (1 - u * .5)); c.globalAlpha = 1 - u; rr(-220, -250, 440, 500, 22, P.creme); c.fillStyle = P.verm; c.fillRect(-220, -250, 440, 130); txt(String(dia), 0, 120, 270, P.tinta, { align: 'center', sh: 0 }); c.restore() }
// celular: desenha o conteúdo dentro da tela (coordenadas da tela: 0..440 x 0..900)
function celular(x, y, s, fn, o = {}) {
  c.save(); c.translate(x, y); c.rotate(o.rot || 0); c.scale(s, s);
  c.fillStyle = 'rgba(0,0,0,.45)'; c.beginPath(); c.roundRect(-240 + 18, -480 + 26, 480, 960, 64); c.fill();
  rr(-240, -480, 480, 960, 64, '#0d1424'); rr(-240, -480, 240, 960, 64, '#1a2438'); rr(-232, -472, 464, 944, 58, '#05080f');
  c.save(); c.beginPath(); c.roundRect(-220, -450, 440, 900, 44); c.clip(); c.translate(-220, -450); c.fillStyle = '#0c1322'; c.fillRect(0, 0, 440, 900); fn(); c.restore();
  rr(-60, -462, 120, 28, 14, '#05080f'); c.fillStyle = 'rgba(255,255,255,.05)'; c.beginPath(); c.moveTo(-220, -450); c.lineTo(40, -450); c.lineTo(-220, 200); c.fill();
  if (o.vibra) { c.strokeStyle = `rgba(${AMB},.8)`; c.lineWidth = 6; for (const sx of [-1, 1]) for (let k = 0; k < 2; k++) { c.beginPath(); c.arc(sx * 240, -300, 40 + k * 26, sx > 0 ? -.6 : PI - .6, sx > 0 ? .6 : PI + .6); c.stroke() } }
  c.restore();
}
// postagem de rede social genérica (sem marcas): avatar, nome, texto, imagem de alerta, contadores
function post(y, o = {}) {
  rr(16, y, 408, o.h ?? 520, 22, '#141e33'); disc(56, y + 46, 26, o.av || '#2f5a86'); txt(o.nome || 'perfil_alerta', 94, y + 40, 26, '#e6ecf5', { sh: 0, w: 800 }); txt(o.hora || 'há 2 h', 94, y + 68, 20, '#8a98b0', { sh: 0, w: 600 });
  (o.linhas || ['URGENTE: APAGÃO MUNDIAL', 'DIA 17 DE NOVEMBRO!']).forEach((s, i) => txt(s, 36, y + 120 + i * 38, 30, i ? '#cfd8e6' : '#fff', { sh: 0 }));
  const iy = y + 120 + (o.linhas || [1, 1]).length * 38; rr(36, iy, 368, 210, 14, o.imgCor || '#2a0d14');
  if (o.img) o.img(36, iy, 368, 210); else { poly([[220, iy + 30], [300, iy + 170], [140, iy + 170]], P.verm); txt('!', 220, iy + 158, 100, '#fff', { align: 'center', sh: 0 }) }
  const cy = iy + 250; txt('♥ ' + (o.likes || '1,2 mi'), 36, cy, 26, '#ff6b7d', { sh: 0 }); txt('↗ ' + (o.shares || '480 mil'), 210, cy, 26, '#9fb0c8', { sh: 0 });
}
// TV antiga de tubo, com antena e chiado
function tv(x, y, s, t, fn, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  line(-40, -330, -170, -520, '#8a94a6', 8); line(40, -330, 160, -540, '#8a94a6', 8); disc(-170, -520, 12, '#c8d0dc'); disc(160, -540, 12, '#c8d0dc');
  rr(-400, -340, 800, 620, 50, '#5a3b26'); rr(-400, -340, 400, 620, 50, '#6e4a30'); rr(-380, -320, 760, 580, 42, '#3c2718');
  rr(-350, -290, 560, 440, 60, '#0b0f14');
  c.save(); c.beginPath(); c.roundRect(-336, -276, 532, 412, 52); c.clip(); c.translate(-336, -276); fn(532, 412); const q = rng(Math.floor(t * 24)); c.fillStyle = 'rgba(255,255,255,.06)'; for (let i = 0; i < 40; i++)c.fillRect(q() * 532, q() * 412, 30 + q() * 90, 2); for (let yy = 0; yy < 412; yy += 6) { c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(0, yy, 532, 2) } c.restore();
  c.fillStyle = 'rgba(255,255,255,.07)'; c.beginPath(); c.ellipse(-180, -200, 140, 60, -.4, 0, 7); c.fill();
  for (const yy of [-180, -60]) { disc(300, yy, 46, '#24170e'); disc(300, yy, 36, '#8a6a4a'); line(300, yy, 300 + 30 * cos(t + yy), yy + 30 * sin(t + yy), '#24170e', 6) }
  for (let k = 0; k < 6; k++) c.fillRect(260 + (k % 3) * 28, 60 + Math.floor(k / 3) * 30, 18, 6);
  c.fillStyle = '#24170e'; c.fillRect(-330, 280, 40, 60); c.fillRect(290, 280, 40, 60);
  c.restore();
}
// diário (caderno de linhas com espiral)
function diario(x, y, s, t, u, o = {}) {
  c.save(); c.translate(x, y); c.rotate(o.rot ?? -.06); c.scale(s, s);
  c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(-330, -430, 680, 880); rr(-340, -440, 680, 880, 16, '#efe6cf'); c.fillStyle = '#e2d7bc'; c.fillRect(40, -440, 300, 880);
  for (let k = 0; k < 18; k++) line(-300, -300 + k * 42, 320, -300 + k * 42, 'rgba(70,110,170,.35)', 2); line(-250, -440, -250, 440, 'rgba(220,70,70,.5)', 3);
  for (let k = 0; k < 14; k++) { disc(-340, -400 + k * 60, 16, '#1a2438'); c.strokeStyle = '#9aa4b4'; c.lineWidth = 6; c.beginPath(); c.arc(-340, -400 + k * 60, 18, PI * .5, PI * 1.5); c.stroke() }
  const esc = (str, xx, yy, sz, k0, k1, col = '#20304a') => { const n = Math.floor(str.length * ramp(u, k0, k1)); if (n > 0) { c.save(); c.translate(xx, yy); c.rotate(-.02); txt(str.slice(0, n), 0, 0, sz, col, { sh: 0, w: 600, ls: 1 }); c.restore() } };
  esc('Querido diário,', -220, -260, 56, 0, .25); esc('17 de novembro', -220, -130, 84, .2, .5, '#b0202a');
  esc('Hoje veio uma tempestade...', -220, -10, 50, .5, .75);
  const n2 = ramp(u, .7, 1); if (n2 > 0) { c.save(); c.globalAlpha = n2; c.translate(60, 220); c.strokeStyle = '#20304a'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.arc(-60, 0, 60, PI * .9, PI * 1.9); c.arc(10, -30, 80, PI * 1.1, PI * 1.95); c.arc(90, 10, 55, PI * 1.4, PI * .4); c.lineTo(-110, 60); c.closePath(); c.stroke(); c.strokeStyle = '#d9a020'; c.beginPath(); c.moveTo(0, 70); c.lineTo(-30, 140); c.lineTo(10, 140); c.lineTo(-20, 220); c.stroke(); for (let k = 0; k < 5; k++) line(-90 + k * 45, 80, -105 + k * 45, 120, '#4a6a9a', 5); c.restore() }
  c.restore();
}
// torre de rádio com antenas, luz vermelha e ondas
function torre(x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const h = 900; poly([[-110, 0], [110, 0], [14, -h], [-14, -h]], null); c.strokeStyle = '#9fb3cc'; c.lineWidth = 9;
  c.beginPath(); c.moveTo(-110, 0); c.lineTo(-14, -h); c.moveTo(110, 0); c.lineTo(14, -h); c.stroke(); c.lineWidth = 4;
  for (let k = 0; k < 12; k++) { const y0 = -k * h / 12, y1 = -(k + 1) * h / 12, w0 = lerp(110, 14, k / 12), w1 = lerp(110, 14, (k + 1) / 12); c.beginPath(); c.moveTo(-w0, y0); c.lineTo(w1, y1); c.moveTo(w0, y0); c.lineTo(-w1, y1); c.moveTo(-w1, y1); c.lineTo(w1, y1); c.stroke() }
  rr(-24, -h + 120, 48, 90, 8, '#cfd8e6'); rr(-24, -h + 260, 48, 70, 8, '#cfd8e6'); line(0, -h, 0, -h - 120, '#9fb3cc', 7);
  const pis = sin(t * 5) > 0; if (pis) { add(() => glow(0, -h - 124, 90, VER, .7)); } disc(0, -h - 124, 14, pis ? '#ff6060' : '#7a1a1a');
  if (o.ondas !== false) for (let k = 0; k < 4; k++) { const ph = (t * .8 + k / 4) % 1, r = 60 + ph * 520; c.strokeStyle = `rgba(${o.rgb || CIA},${(1 - ph) * .8})`; c.lineWidth = 10; for (const sx of [-1, 1]) { c.beginPath(); c.arc(0, -h - 124, r, sx > 0 ? -.55 : PI - .55, sx > 0 ? .55 : PI + .55); c.stroke() } }
  c.restore();
}
// ícones: lâmpada, wi-fi, celular, mochila, garrafa, lata, lanterna, remédio, rádio, pilha, bateria
function icLampada(x, y, s, on) { c.save(); c.translate(x, y); c.scale(s, s); if (on) add(() => glow(0, -20, 160, AMB, .5)); disc(0, -30, 70, on ? P.luz : '#3a4458'); poly([[-36, 20], [36, 20], [28, 60], [-28, 60]], on ? '#f0c040' : '#2c3446'); rr(-30, 60, 60, 40, 8, '#9aa4b4'); rr(-30, 60, 30, 40, 6, '#c8d0dc'); c.restore() }
function icWifi(x, y, s, on) { c.save(); c.translate(x, y); c.scale(s, s); c.strokeStyle = on ? P.ciano : '#3a4458'; c.lineCap = 'round'; c.lineWidth = 22; for (let k = 1; k <= 3; k++) { c.beginPath(); c.arc(0, 60, k * 40, -PI * .78, -PI * .22); c.stroke() } disc(0, 60, 16, on ? P.ciano : '#3a4458'); c.restore() }
function icCel(x, y, s, on) { c.save(); c.translate(x, y); c.scale(s, s); rr(-50, -90, 100, 180, 18, '#1a2438'); rr(-42, -78, 84, 150, 10, on ? '#2f5a86' : '#0a0f1a'); if (on) { rr(-30, -60, 60, 10, 5, P.ciano); rr(-30, -40, 40, 10, 5, '#9fb3cc') } disc(0, 80, 6, '#3a4458'); c.restore() }
function riscado(x, y, r, u) { if (u <= 0) return; c.save(); c.strokeStyle = P.verm; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.arc(x, y, r, 0, 7); c.stroke(); c.beginPath(); c.moveTo(x - r * .7, y - r * .7); c.lineTo(x - r * .7 + r * 1.4 * u, y - r * .7 + r * 1.4 * u); c.stroke(); c.restore() }
function mochila(x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); c.strokeStyle = '#3c4a2a'; c.lineWidth = 18; c.beginPath(); c.arc(0, -150, 60, PI, 0); c.stroke(); rr(-140, -160, 280, 340, 60, '#5f7040'); rr(0, -160, 140, 340, 60, '#4a5a32'); rr(-100, 30, 200, 120, 24, '#4a5a32'); rr(-100, 30, 100, 120, 24, '#566838'); line(-90, 50, 90, 50, '#c8a040', 6); c.restore() }
function garrafa(x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); rr(-34, -120, 68, 230, 22, '#5fc8f0'); rr(0, -120, 34, 230, 18, '#3aa0d0'); rr(-20, -150, 40, 34, 6, '#1f6aa0'); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(-24, -90, 10, 160); rr(-34, -40, 68, 50, 0, '#e8f4fb'); c.restore() }
function lata(x, y, s, cor = '#c0392b') { c.save(); c.translate(x, y); c.scale(s, s); rr(-50, -70, 100, 140, 10, '#aab4c0'); rr(-50, -40, 100, 80, 0, cor); rr(0, -40, 50, 80, 0, 'rgba(0,0,0,.2)'); c.fillStyle = '#d8dee6'; c.beginPath(); c.ellipse(0, -70, 50, 12, 0, 0, 7); c.fill(); c.restore() }
function lanterna(x, y, s, t) { c.save(); c.translate(x, y); c.scale(s, s); add(() => { c.fillStyle = `rgba(${AMB},.18)`; c.beginPath(); c.moveTo(90, -30); c.lineTo(420, -160); c.lineTo(420, 160); c.lineTo(90, 30); c.fill() }); rr(-120, -26, 160, 52, 14, '#2a3448'); rr(-120, -26, 160, 26, 12, '#3a4660'); poly([[40, -26], [96, -46], [96, 46], [40, 26]], '#3a4660'); rr(92, -46, 10, 92, 4, P.luz); c.restore() }
function remedio(x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); rr(-90, -60, 180, 120, 14, '#f3efe4'); rr(0, -60, 90, 120, 12, '#dcd6c6'); c.fillStyle = P.verm; c.fillRect(-14, -40, 28, 80); c.fillRect(-40, -14, 80, 28); c.restore() }
function radio(x, y, s, t) { c.save(); c.translate(x, y); c.scale(s, s); line(60, -70, 130, -190, '#9aa4b4', 6); rr(-130, -70, 260, 150, 20, '#2f5a86'); rr(0, -70, 130, 150, 18, '#244a70'); for (let k = 0; k < 5; k++) line(-110, -40 + k * 20, -10, -40 + k * 20, '#13233d', 6); disc(70, 0, 34, '#13233d'); disc(70, 0, 24, P.ambar); c.restore() }
function pilha(x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); rr(-28, -70, 56, 140, 10, '#1a1a1a'); rr(-28, -70, 56, 50, 10, '#d9a020'); rr(-10, -82, 20, 14, 4, '#c8d0dc'); c.restore() }
function kit(x, y, s, t, n = 9) {
  const it = [() => mochila(0, 0, 1.1), () => garrafa(-250, 80, 1), () => garrafa(-170, 100, .9), () => lata(230, 120, .9), () => lata(320, 130, .8, '#d68910'), () => lanterna(-260, 260, .9, t), () => remedio(200, 280, .9), () => radio(-20, 300, .8, t), () => pilha(380, 290, .8)];
  c.save(); c.translate(x, y); c.scale(s, s); it.forEach((f, i) => { const u = clamp(n - i); if (u > 0) { c.save(); c.globalAlpha = u; c.translate(0, (1 - eo(u)) * -80); f(); c.restore() } }); c.restore();
}
// relógio de 72 horas: arco que enche
function relogio72(x, y, r, u, rotulo = '72 HORAS') {
  disc(x, y, r + 20, '#0b1220'); c.strokeStyle = '#1f3c63'; c.lineWidth = 30; c.beginPath(); c.arc(x, y, r, 0, 7); c.stroke();
  c.strokeStyle = P.ambar; c.lineCap = 'round'; c.beginPath(); c.arc(x, y, r, -PI / 2, -PI / 2 + u * 2 * PI); c.stroke();
  txt(String(Math.round(72 * u)), x, y + r * .25, r * .8, '#fff', { align: 'center' }); txt(rotulo, x, y + r * .62, r * .2, P.ambar, { align: 'center', ls: 4 });
}
// base militar com hangar, cerca, gerador e antena
function baseMilitar(t, o = {}) {
  const b = 1250; c.fillStyle = '#1a2a1e'; c.fillRect(0, b, W, H - b); c.fillStyle = '#22382a'; c.fillRect(0, b, W, 14);
  for (const [x, w, h] of [[60, 420, 260], [560, 360, 200]]) { c.fillStyle = '#2d3e34'; c.beginPath(); c.moveTo(x, b); c.quadraticCurveTo(x + w / 2, b - h * 1.4, x + w, b); c.fill(); c.fillStyle = '#24332a'; c.beginPath(); c.moveTo(x + w / 2, b); c.quadraticCurveTo(x + w * .78, b - h * 1.0, x + w, b); c.fill(); rr(x + w * .3, b - h * .45, w * .4, h * .45, 4, '#121c16'); for (let k = 1; k < 6; k++) line(x + w * k / 6, b, x + w * k / 6, b - h * .55 * sin(PI * k / 6), 'rgba(0,0,0,.2)', 3) }
  for (let k = 0; k < 3; k++) { const gx = 140 + k * 300; rr(gx, b + 60, 220, 120, 10, '#3d5040'); rr(gx + 110, b + 60, 110, 120, 10, '#334436'); for (let j = 0; j < 4; j++) line(gx + 20, b + 80 + j * 22, gx + 90, b + 80 + j * 22, '#1e2a20', 6); const on = sin(t * 6 + k * 2) > 0; disc(gx + 170, b + 90, 10, on ? P.verde : '#164a2a'); if (on) add(() => glow(gx + 170, b + 90, 40, '61,220,132', .5)) }
  c.strokeStyle = '#4a5a50'; c.lineWidth = 3; for (let x = 0; x < W; x += 40) line(x, b + 230, x, b + 330, '#4a5a50', 4); line(0, b + 250, W, b + 250, '#4a5a50', 3); line(0, b + 300, W, b + 300, '#4a5a50', 3);
  c.save(); c.translate(940, b - 40); line(0, 40, 0, -120, '#5a6a60', 12); c.rotate(-.5 + .3 * sin(t * .8)); c.fillStyle = '#c8d0dc'; c.beginPath(); c.ellipse(0, -140, 90, 30, 0, 0, 7); c.fill(); c.fillStyle = '#9aa4b4'; c.beginPath(); c.ellipse(0, -140, 90, 30, 0, 0, PI); c.fill(); c.restore();
}
// bateria grande que se enche
function bateria(x, y, s, u, rot = '90 DIAS') { c.save(); c.translate(x, y); c.scale(s, s); rr(-220, -110, 440, 220, 30, '#0b1220'); c.strokeStyle = '#cfd8e6'; c.lineWidth = 14; c.beginPath(); c.roundRect(-220, -110, 440, 220, 30); c.stroke(); rr(222, -40, 30, 80, 8, '#cfd8e6'); rr(-196, -86, 392 * u, 172, 16, P.verde); txt(rot, 0, 38, 110, '#fff', { align: 'center' }); c.restore() }
// globo com continentes planos, luzes noturnas e (opcional) redes elétricas separadas
const CONT = [[[.18, .2], [.42, .14], [.48, .3], [.36, .42], [.3, .52], [.2, .45], [.12, .32]], [[.32, .55], [.44, .58], [.46, .72], [.38, .9], [.33, .76]], [[.5, .18], [.66, .12], [.86, .2], [.9, .36], [.76, .44], [.64, .4], [.52, .32]], [[.5, .42], [.62, .44], [.64, .62], [.56, .76], [.5, .6]], [[.76, .62], [.88, .6], [.9, .72], [.78, .74]]];
function globo(x, y, r, t, o = {}) {
  glow(x, y, r * 1.4, CIA, .18); disc(x, y, r, '#0f2a4a'); c.save(); c.beginPath(); c.arc(x, y, r, 0, 7); c.clip();
  const gir = (t * .03) % 1;
  for (const off of [0, -1]) CONT.forEach((pts, ci) => { const cor = o.cores ? o.cores[ci] : '#1f4a3a'; poly(pts.map(([u, v]) => [x - r + (u + gir + off) * 2 * r, y - r + v * 2 * r]), cor, o.cores ? '#e8f0ff' : null, 4) });
  const q = rng(5); for (let i = 0; i < 260; i++) { const ci = Math.floor(q() * CONT.length), p = CONT[ci], a = p[Math.floor(q() * p.length)], b = p[Math.floor(q() * p.length)], k = q(), u = ((lerp(a[0], b[0], k) * .8 + .1 * q() + gir) % 1 + 1) % 1, v = lerp(a[1], b[1], k); const ap = o.apaga ? clamp(o.apaga * 1.3 - q() * .3) : 0; c.fillStyle = `rgba(255,214,110,${(.8 * (1 - ap)).toFixed(2)})`; c.fillRect(x - r + u * 2 * r, y - r + v * 2 * r, 4, 4) }
  c.fillStyle = 'rgba(0,0,0,.4)'; c.beginPath(); c.arc(x + r * .35, y, r * 1.05, 0, 7); c.fill();
  c.restore(); c.strokeStyle = 'rgba(69,212,255,.5)'; c.lineWidth = 4; c.beginPath(); c.arc(x, y, r, 0, 7); c.stroke();
}
// contorno simplificado do Brasil (0..1)
const BRASIL = [[.30, .02], [.45, 0], [.55, .08], [.66, .06], [.75, .14], [.86, .2], [1, .3], [.96, .42], [.88, .55], [.83, .68], [.72, .76], [.62, .85], [.55, .97], [.48, 1], [.44, .9], [.38, .8], [.35, .7], [.26, .66], [.2, .55], [.08, .5], [0, .4], [.05, .3], [.12, .22], [.2, .16], [.25, .08]];
function mapaBrasil(x, y, s, t, o = {}) {
  const pts = BRASIL.map(([u, v]) => [x + (u - .5) * s, y + (v - .5) * s * 1.02]);
  glow(x, y, s * .8, o.rgb || CIA, .18); poly(pts, '#0f2a4a', o.borda || P.ciano, 6);
  const q = rng(9), nos = []; for (let i = 0; i < 26; i++) { let px, py; do { px = q(); py = q() } while (!dentro(px, py)); nos.push([x + (px - .5) * s, y + (py - .5) * s * 1.02]) }
  c.lineWidth = 3; nos.forEach((a, i) => nos.slice(i + 1).forEach(b => { const d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (d < s * .22) { const fl = (sin(t * 3 + i) + 1) / 2; c.strokeStyle = `rgba(${o.rgb || AMB},${.35 + .4 * fl})`; c.beginPath(); c.moveTo(...a); c.lineTo(...b); c.stroke() } }));
  nos.forEach(([px, py], i) => { disc(px, py, 9, P.luz); add(() => glow(px, py, 30, AMB, .4)) });
}
function dentro(px, py) { let d = false; for (let i = 0, j = BRASIL.length - 1; i < BRASIL.length; j = i++) { const [xi, yi] = BRASIL[i], [xj, yj] = BRASIL[j]; if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) d = !d } return d }
// sala de controle: telão e operadores de costas (braços para baixo)
function operador(x, y, s, cor = '#2f5a86') { c.save(); c.translate(x, y); c.scale(s, s); rr(-70, -40, 140, 150, 30, '#13233d'); rr(-60, -170, 120, 150, 40, cor); rr(-60, -170, 60, 150, 40, 'rgba(255,255,255,.08)'); rr(-82, -150, 26, 120, 12, cor); rr(56, -150, 26, 120, 12, cor); disc(0, -210, 44, '#2a1d14'); disc(-10, -222, 30, '#3a2a1e'); c.restore() }
// chuva e enchente
function chuva(t, n = 140, a = .5) { const q = rng(17); c.strokeStyle = `rgba(160,190,230,${a})`; c.lineWidth = 3; for (let i = 0; i < n; i++) { const x = q() * (W + 300) - 150, sp = 1400 + q() * 600, y = ((q() * H + t * sp) % (H + 200)) - 100; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 40, y + 70); c.stroke() } }
function agua(y, t, cor = 'rgba(60,110,160,.85)') { c.fillStyle = cor; c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W; x += 30) c.lineTo(x, y + sin(x * .02 + t * 3) * 10 + sin(x * .05 - t * 2) * 5); c.lineTo(W, H); c.fill(); c.fillStyle = 'rgba(200,225,255,.35)'; for (let x = 0; x <= W; x += 90) c.fillRect(x + (t * 40 % 90), y + sin(x * .02 + t * 3) * 10 - 3, 40, 5) }
function casa(x, y, s, luz = 1) { c.save(); c.translate(x, y); c.scale(s, s); poly([[-160, -120], [0, -250], [160, -120]], '#5a2a20'); poly([[0, -250], [160, -120], [0, -120]], '#47201a'); c.fillStyle = '#cdbfa8'; c.fillRect(-140, -120, 280, 220); c.fillStyle = '#b3a58e'; c.fillRect(0, -120, 140, 220); for (const wx of [-100, 50]) { c.fillStyle = luz ? P.luz : '#1a2438'; c.fillRect(wx, -80, 60, 60); if (luz) add(() => glow(wx + 30, -50, 90, AMB, .3)) } c.fillStyle = '#5a3a26'; c.fillRect(-40, -10, 60, 110); c.restore() }
