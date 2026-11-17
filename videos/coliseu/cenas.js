// ================= O COLISEU — 3 min 50 s — modelo Recorte Dourado =================
// Tempos em tempos.js (gerado por tempos.py). Lutas sem sangue; a morte é dita, não mostrada.
const TX = 110, TY = 170;
const SKY_ROMA = [[0, '#6f97a8'], [.55, '#c8c8a8'], [.85, '#efd8a0'], [1, '#f6e2b0']];
const SKY_POR = [[0, '#2a2a44'], [.4, '#7a4a5a'], [.75, '#e0864a'], [1, '#f6c46a']];
const CAPIM = ['#c8b878', '#a89850', '#8a8040', '#e0d098'];
function ceu(st, hy) { c.fillStyle = lg(0, 0, 0, hy, st); c.fillRect(0, 0, W, H) }
function zoomTela(z, fx, fy, fn) { c.save(); c.translate(fx, fy); c.scale(z, z); c.translate(-fx, -fy); fn(); c.restore() }
function chao(y, cor = '#b8a070') { c.fillStyle = cor; c.fillRect(0, y, W, H - y) }
// Roma vista de longe: morros, templos, telhados, aqueduto, pinheiros, Coliseu e o Colosso de Nero
function romaPanorama(t, o = {}) {
  ceu(o.ceu || SKY_ROMA, 640); sunGlow(o.solX ?? 1580, o.solY ?? 300, 460, '255,232,180', .9); cloudsBand(4, 6, 90, 360, 50, 90, '250,240,220', .5, t * 4);
  c.fillStyle = '#9aa88a'; c.beginPath(); c.moveTo(0, 640); c.quadraticCurveTo(260, 470, 560, 560); c.quadraticCurveTo(820, 610, 1080, 520); c.quadraticCurveTo(1400, 430, 1920, 560); c.lineTo(1920, 640); c.fill();
  aqueduto(-20, 760, 620, 70, '#c8b488'); templo(1240, 520, 150, 110, '#e6d8b4'); templo(300, 560, 110, 80, '#d6c6a0');
  telhados(-20, 1940, 700, 9, t);
  c.fillStyle = '#8a9a6a'; c.fillRect(0, 700, W, H - 700); telhados(-20, 700, 760, 13, t); telhados(1240, 1940, 760, 14, t);
  coliseuFachada(960, 760, 560, 230, t, {}); colosso(1290, 760, 1.6);
  for (const [x, s] of [[120, 1.4], [520, 1.1], [1500, 1.3], [1780, 1.5]]) pinheiro(x, 780, s); for (const x of [380, 640, 1180, 1660]) cipreste(x, 790, 1.6);
  c.fillStyle = '#7a8a5a'; c.fillRect(0, 790, W, H - 790); telhados(-40, 1960, 900, 21, t);
}

// --- 1: Roma, ano 80 — aproximação rápida até o Coliseu ---
shot(CUTS[0], CUTS[1], (tl, t) => {
  const u = ease(ramp(tl, .5, CUTS[1] - .2)); zoomTela(lerp(1, 2.7, u * u), 960, 680, () => romaPanorama(t));
  typeText(tl, TX, TY, 'ROMA · ANO 80 D.C.', .4, CUTS[1] - .3, { sub: 'A MAIOR CIDADE DO MUNDO' });
});
// --- 2: 50 mil pessoas entrando pelos arcos numerados ---
shot(CUTS[1], CUTS[2], (tl, t) => {
  ceu(SKY_ROMA, 300); const z = 1 + .05 * tl; zoomTela(z, 960, 600, () => { coliseuFachada(960, 1200, 3600, 1900, t, { n: 36, numeros: 18, semDentro: 1, mastros: false }) });
  chao(1010, '#b8a070'); c.fillStyle = '#a89060'; c.fillRect(0, 1010, W, 14);
  const q = rng(2); const G = []; for (let i = 0; i < 26; i++) { const lane = Math.floor(q() * 3), x = [520, 960, 1400][lane] + (q() - .5) * 200, d = (q() + tl * .18) % 1, y = lerp(1180, 1000, d), h = lerp(330, 150, d); G.push([y, x, h, i]) }
  G.sort((a, b) => a[0] - b[0]).forEach(([y, x, h, i]) => person(x, y, h, { coat: ROUPAS[i % ROUPAS.length], dark: shadeHex(ROUPAS[i % ROUPAS.length], .78), legs: '#c99a74', hair: ['#2a2018', '#5a3a22', '#8a6a3a'][i % 3] }));
  label(W - 120, 300, '50.000', { size: 170, align: 'right', a: ramp(tl, .3, .7) }); label(W - 120, 360, 'ESPECTADORES', { size: 52, align: 'right', col: OURO, a: ramp(tl, .5, .9), w: 600 });
  typeText(tl, TX, TY, 'PORTÃO XXIII', .2, CUTS[2] - CUTS[1] - .3, { size: 60, sub: 'CADA ENTRADA TINHA UM NÚMERO' });
});
// --- 3: lá dentro, diante do imperador ---
shot(CUTS[2], CUTS[3], (tl, t) => {
  arenaVista(t, { agita: 1, velario: .6 });
  gladPerfil(820, 800, 150, 'mirmilao', 1, t, { cor: '#a8382a' }); gladPerfil(1100, 800, 150, 'tracio', -1, t, { cor: '#3a5a6a' });
  primeiroPlano(t, 30, { agita: 1 });
  typeText(tl, TX, TY, 'DIANTE DO IMPERADOR', .2, CUTS[3] - CUTS[2] - .3, { sub: 'TITO, NO CAMAROTE' });
});
// --- 4: título ---
shot(CUTS[3], CUTS[4], (tl, t) => {
  c.fillStyle = '#0b0a0c'; c.fillRect(0, 0, W, H); const rv = ramp(tl, 0, 1.2); add(() => glow(960, 700, 900, '217,150,70', .18 * rv));
  c.save(); c.globalAlpha = rv; coliseuFachada(960, 900, 1300, 520, t, { pal: ['#3a2c1c', '#6b5230', '#a8864a', '#d9b35a', '#8a6a3a'] }); c.restore();
  label(W / 2, 300, 'O COLISEU', { size: 190, align: 'center', a: ramp(tl, .4, 1.0) }); label(W / 2, 370, 'ANFITEATRO FLÁVIO · ROMA', { size: 48, align: 'center', col: OURO, a: ramp(tl, .8, 1.3), w: 600 });
});

// --- 5: CAPÍTULO 1 — o lago de Nero vira canteiro de obras (sépia) ---
shot(CUTS[4], CUTS[5], (tl, t) => {
  const obra = ramp(tl, 5.0, 6.0); ceu(SKY_ROMA, 640); sunGlow(1500, 300, 420, '255,232,180', .8);
  c.fillStyle = '#9aa88a'; c.fillRect(0, 560, W, H);
  if (obra < 1) { c.save(); c.globalAlpha = 1 - obra; c.fillStyle = '#6f97a8'; c.beginPath(); c.ellipse(960, 760, 700, 150, 0, 0, 7); c.fill(); for (let i = 0; i < 20; i++) pill(500 + (i * 97) % 900, 700 + (i * 41) % 120, 60, 4, 'rgba(255,255,255,.35)'); templo(200, 600, 520, 160, '#efe3c2'); templo(1260, 600, 460, 150, '#efe3c2'); for (const x of [700, 1220]) cipreste(x, 640, 2); c.restore() }
  if (obra > 0) { c.save(); c.globalAlpha = obra; c.fillStyle = '#b8a070'; c.fillRect(0, 640, W, H - 640);
    coliseuFachada(900, 940, 1300, 420 * lerp(.4, .7, ramp(tl, 6, 9)), t, { n: 30, semDentro: 1, mastros: false, estatuas: false });
    c.strokeStyle = '#7a5a34'; c.lineWidth = 6; for (let x = 300; x < 1560; x += 90) { c.beginPath(); c.moveTo(x, 940); c.lineTo(x, 520); c.stroke() } for (let y = 560; y < 940; y += 80) { c.beginPath(); c.moveTo(300, y); c.lineTo(1560, y); c.stroke() }
    const gx = 1650, gy = 940; c.strokeStyle = '#6a4a2a'; c.lineWidth = 10; c.beginPath(); c.moveTo(gx, gy); c.lineTo(gx - 180, 420); c.lineTo(gx - 40, gy); c.stroke(); c.beginPath(); c.arc(gx - 30, gy - 110, 100, 0, 7); c.stroke(); for (let k = 0; k < 8; k++) { const a = k / 8 * PI + t * .8; line(gx - 30, gy - 110, gx - 30 + cos(a) * 100, gy - 110 + sin(a) * 100, '#6a4a2a', 5) }
    person(gx - 30, gy - 14, 120, { coat: '#c8b48a', dark: '#a8966e', legs: '#c99a74' }); line(gx - 180, 420, gx - 180, 560 + 40 * sin(t), '#3a2a1a', 3); blocoPedra(gx - 230, 560 + 40 * sin(t), 100, 60, 3);
    for (let i = 0; i < 6; i++) person(300 + i * 200 + sin(t + i) * 10, 1010, 170, { coat: '#c8b48a', dark: '#a8966e', legs: '#c99a74', hair: '#2a2018' }); c.restore() }
  sepia(.8);
  typeText(tl, TX, TY, obra > 0 ? 'ANO 70 · VESPASIANO' : 'O LAGO DO PALÁCIO DE NERO', 1.8, obra > 0 ? CUTS[5] - CUTS[4] - .3 : 4.9, { sub: obra > 0 ? 'COMEÇA A OBRA' : 'ONDE NASCEU O COLISEU', col: '#fff0d8' });
  chapter(tl, 1, 'O GIGANTE DE PEDRA');
});
// --- 6: Tito inaugura com 100 dias de jogos ---
shot(CUTS[5], CUTS[6], (tl, t) => {
  c.fillStyle = '#0b0a0c'; c.fillRect(0, 0, W, H); add(() => glow(700, 560, 700, '217,150,70', .16 * ramp(tl, 0, .6)));
  c.fillStyle = '#2a2016'; c.fillRect(480, 960, 440, 120); c.fillStyle = '#3a2c1c'; c.fillRect(500, 940, 400, 24);
  romano(700, 960, 760, IMPERADOR, t);
  label(1060, 360, 'TITO', { size: 140, a: ramp(tl, .2, .5) }); label(1060, 430, 'FILHO DE VESPASIANO', { size: 44, col: PALHA, a: ramp(tl, .4, .7), w: 600 });
  const n = Math.floor(100 * eo(ramp(tl, 1.4, 3.4))); label(1060, 640, String(n), { size: 220, col: OURO, a: ramp(tl, 1.2, 1.5) }); label(1060, 710, 'DIAS DE JOGOS NA INAUGURAÇÃO', { size: 48, a: ramp(tl, 1.6, 1.9), w: 600 }); label(1060, 770, 'ANO 80', { size: 48, col: PALHA, a: ramp(tl, 2.0, 2.3), w: 600 });
});
// --- 7: tamanho — 189 m × 48 m, como um prédio de 15 andares ---
shot(CUTS[6], CUTS[7], (tl, t) => {
  c.fillStyle = '#0b0c11'; c.fillRect(0, 0, W, H); add(() => glow(960, 600, 900, '217,150,70', .1));
  c.save(); c.translate(0, -130); c.fillStyle = '#2a2620'; c.fillRect(0, 860, W, 400);
  coliseuFachada(820, 860, 1180, 300, t, {});
  const bx = 1560, bh = 300 * (45 / 48), bw = 120, bg = ramp(tl, 4.4, 5.4) * 1; c.save(); c.globalAlpha = bg; c.fillStyle = '#5a646a'; c.fillRect(bx, 860 - bh * eo(ramp(tl, 4.4, 5.4)), bw, bh * eo(ramp(tl, 4.4, 5.4))); c.fillStyle = 'rgba(240,226,180,.6)'; for (let f = 0; f < 15; f++) for (let k = 0; k < 4; k++) { const y = 860 - (f + .7) * bh / 15; if (y > 860 - bh * eo(ramp(tl, 4.4, 5.4))) c.fillRect(bx + 10 + k * 28, y, 18, bh / 15 * .5) } c.restore();
  label(bx + bw / 2, 860 - bh - 30, '15 ANDARES', { size: 40, align: 'center', a: ramp(tl, 5.2, 5.5), w: 600 });
  const g1 = eo(ramp(tl, .4, 1.6)); dim(lerp(820, 230, g1), 930, lerp(820, 1410, g1), 930, OURO, ramp(tl, .3, .5)); label(820, 1000, `${Math.round(189 * g1)} m DE COMPRIMENTO`, { size: 60, col: OURO, align: 'center', a: ramp(tl, .4, .7) });
  const g2 = eo(ramp(tl, 2.2, 3.2)); dim(170, 860, 170, lerp(860, 860 - 300, g2), CREME, ramp(tl, 2.1, 2.3)); label(150, 860 - 150, `${Math.round(48 * g2)} m`, { size: 80, align: 'right', a: ramp(tl, 2.2, 2.5) }); label(150, 860 - 100, 'DE ALTURA', { size: 34, align: 'right', a: ramp(tl, 2.6, 2.9), w: 600 }); c.restore();
  label(TX, 200, '156 m DE LARGURA', { size: 46, col: PALHA, a: ramp(tl, 1.6, 2.0), w: 600 });
});
// --- 8: a fachada de perto — 3 andares de arcos, 3 estilos de coluna ---
function capitel(x, y, w, tipo) { if (tipo === 'toscana') { c.fillStyle = '#e6d8b4'; c.fillRect(x - w * .7, y, w * 1.4, w * .25); c.fillRect(x - w * .55, y + w * .25, w * 1.1, w * .2) } else if (tipo === 'jonica') { c.fillStyle = '#e6d8b4'; c.fillRect(x - w * .7, y, w * 1.4, w * .22); for (const k of [-1, 1]) { disc(x + k * w * .55, y + w * .32, w * .26, '#e6d8b4'); c.strokeStyle = '#8a7a5a'; c.lineWidth = w * .05; c.beginPath(); c.arc(x + k * w * .55, y + w * .32, w * .14, 0, 5.5); c.stroke() } } else { c.fillStyle = '#e6d8b4'; c.fillRect(x - w * .75, y, w * 1.5, w * .2); for (let r = 0; r < 2; r++) for (let k = -2; k <= 2; k++) { c.fillStyle = r ? '#d6c6a0' : '#c8b88e'; c.beginPath(); c.ellipse(x + k * w * .28, y + w * (.42 + r * .28), w * .14, w * .24, k * .2, 0, 7); c.fill() } } }
shot(CUTS[7], CUTS[8], (tl, t) => {
  ceu(SKY_ROMA, 400); const z = lerp(1, 1.12, ease(ramp(tl, 0, 8))); zoomTela(z, 960, 560, () => {
    const base = 1060, hs = [0, 330, 640, 930, 1180]; c.fillStyle = '#d6c6a0'; c.fillRect(0, base - 1180, W, 1180);
    const tipos = ['toscana', 'jonica', 'corintia'];
    for (let s = 0; s < 3; s++) { const yb = base - hs[s], yt = base - hs[s + 1], ah = (yb - yt) * .78;
      for (let i = -1; i < 5; i++) { const x0 = 80 + i * 440, aw = 280; c.fillStyle = '#3a2e22'; c.beginPath(); c.moveTo(x0 + 80, yb); c.lineTo(x0 + 80, yb - ah + aw / 2); c.arc(x0 + 80 + aw / 2, yb - ah + aw / 2, aw / 2, PI, 0); c.lineTo(x0 + 80 + aw, yb); c.fill(); c.strokeStyle = '#efe3c2'; c.lineWidth = 16; c.beginPath(); c.arc(x0 + 80 + aw / 2, yb - ah + aw / 2, aw / 2 + 10, PI, 0); c.stroke();
        if (s > 0) { const sx = x0 + 80 + aw / 2, sh = ah * .7; c.fillStyle = '#efe7d4'; c.save(); c.translate(sx, yb); c.scale(sh / 100, sh / 100); romano(0, 0, 100, { tunica: '#efe7d4', toga: '#e6dcc0', rosto: { estilo: 'curto', cabelo: '#e6dcc0', pele: '#efe7d4', peleS: '#d6c6a0', olho: '#d6c6a0' } }, 0); c.restore() }
        const cw = 64; c.fillStyle = '#c8b88e'; c.fillRect(x0 - cw / 2, yt + 40, cw, yb - yt - 40); c.fillStyle = '#e6d8b4'; c.fillRect(x0 - cw / 2, yt + 40, cw * .4, yb - yt - 40); capitel(x0, yt + 40, cw, tipos[s]) }
      c.fillStyle = '#efe3c2'; c.fillRect(0, yt, W, 40); c.fillStyle = 'rgba(40,30,20,.25)'; c.fillRect(0, yt + 40, W, 6) }
  });
  const nomes = [['DÓRICA (TOSCANA)', 1.0], ['JÔNICA', 2.2], ['CORÍNTIA', 3.4]]; nomes.forEach(([n, a], s) => { const y = [930, 640, 330][s] * z - 560 * (z - 1) + 60; label(W - 80, [870, 560, 270][s], n, { size: 60, align: 'right', col: OURO, a: ramp(tl, a, a + .3) }) });
  typeText(tl, TX, TY, '80 ARCOS EM CADA ANDAR', .3, CUTS[8] - CUTS[7] - .3, { sub: '3 ESTILOS DE COLUNA, UM EM CADA ANDAR' });
});
// --- 9: travertino e grampos de ferro ---
shot(CUTS[8], CUTS[9], (tl, t) => {
  c.fillStyle = '#0b0a0c'; c.fillRect(0, 0, W, H); add(() => glow(960, 540, 800, '217,150,70', .14));
  const q = rng(9); for (let r = 0; r < 4; r++) for (let k = -1; k < 4; k++) blocoPedra(160 + k * 520 + (r % 2) * 260, 160 + r * 210, 510, 200, r * 9 + k);
  const ab = ramp(tl, .6, 1.6); c.save(); c.globalAlpha = ab; c.fillStyle = '#2a2016'; c.fillRect(838, 340, 244, 120); c.fillStyle = '#2a2016'; c.fillRect(700, 300, 520, 200); const gx = 960, gy = 360 + (1 - eo(ab)) * -60; poly([[gx - 230, gy], [gx - 140, gy], [gx - 110, gy + 40], [gx + 110, gy + 40], [gx + 140, gy], [gx + 230, gy], [gx + 230, gy + 90], [gx - 230, gy + 90]], '#5a5e64'); c.fillStyle = '#8a9096'; c.fillRect(gx - 230, gy, 460, 14); c.fillStyle = '#a8aeb4'; c.fillRect(gx - 225, gy + 4, 40, 80); c.fillRect(gx + 185, gy + 4, 40, 80); c.restore(); label(960, 280, 'GRAMPO DE FERRO', { size: 44, align: 'center', col: OURO, a: ramp(tl, 1.2, 1.5), w: 600 });
  label(960, 600, 'TRAVERTINO', { size: 110, align: 'center', a: ramp(tl, .1, .4) }); label(960, 660, 'GRAMPOS DE FERRO ENTRE OS BLOCOS', { size: 46, align: 'center', col: OURO, a: ramp(tl, 1.2, 1.5), w: 600 });
});

// --- 10: CAPÍTULO 2 — 80 portões, vista de cima ---
shot(CUTS[9], CUTS[10], (tl, t) => {
  c.fillStyle = '#7a8a5a'; c.fillRect(0, 0, W, H); for (let i = 0; i < 30; i++) pill((i * 211) % W, (i * 97) % H, 120, 40, 'rgba(60,70,40,.25)');
  coliseuPlanta(960, 560, 640, 520, t, {});
  const q = rng(10); for (let i = 0; i < 160; i++) { const a = q() * 2 * PI, ph = (q() + tl * .25 * (i % 2 ? 1 : -1) + 2) % 1, r = lerp(1.25, .98, ph); disc(960 + cos(a) * 640 * r, 560 + sin(a) * 520 * r, 5, ROUPAS[i % ROUPAS.length]) }
  label(W / 2, 560 + 20, '80 PORTÕES', { size: 110, align: 'center', a: ramp(tl, 1.8, 2.2) }); label(W / 2, 560 + 76, 'ENTRAR E SAIR EM POUCOS MINUTOS', { size: 40, align: 'center', col: '#3a2e22', a: ramp(tl, 2.2, 2.5), w: 600, sh: 0 });
  chapter(tl, 2, 'POR DENTRO');
});
// --- 11: cada um no seu lugar — corte da arquibancada ---
shot(CUTS[10], CUTS[11], (tl, t) => {
  c.fillStyle = '#0b0c11'; c.fillRect(0, 0, W, H); add(() => glow(960, 500, 900, '217,150,70', .1));
  c.fillStyle = '#d8b880'; c.fillRect(0, 860, 360, 60); txt('ARENA', 180, 900, 40, '#3a2e22', { align: 'center', sh: 0 });
  const Z = [['PÓDIO · SENADORES', '#efe7d4', 1.0], ['CAVALEIROS', '#d6c6a0', 1.8], ['CIDADÃOS', '#c8b48a', 2.6], ['O POVO', '#b8a07a', 3.4], ['MULHERES E POBRES', '#8a6a40', 4.4]];
  Z.forEach(([n, cor, a], k) => { const x0 = 360 + k * 280, y0 = 860 - k * 130, al = ramp(tl, a - .4, a); c.save(); c.globalAlpha = .35 + .65 * al; for (let j = 0; j < 5; j++) { c.fillStyle = shadeHex(cor, 1 - j * .03); c.fillRect(x0 + j * 56, y0 - j * 26, 280 - j * 56, 26) } c.fillStyle = shadeHex(cor, .55); c.fillRect(x0, y0, 280, 1080 - y0);
    c.fillStyle = 'rgba(20,16,12,.55)'; for (let j = 0; j < 3; j++) { c.beginPath(); c.arc(x0 + 70 + j * 80, y0 + 140, 30, PI, 0); c.lineTo(x0 + 100 + j * 80, y0 + 260); c.lineTo(x0 + 40 + j * 80, y0 + 260); c.fill() }
    for (let j = 0; j < 4; j++) { c.save(); c.translate(x0 + 40 + j * 64, y0 - j * 26); c.scale(.42, .42); fileiraGente(-20, 20, 0, 60, k * 10 + j, t); c.restore() } c.restore();
    label(x0 + 140, y0 - 170, n, { size: 34, align: 'center', col: k ? CREME : OURO, a: al, w: 800 }) });
  typeText(tl, TX, TY, 'CADA UM NO SEU LUGAR', .3, CUTS[11] - CUTS[10] - .3, { sub: 'QUANTO MAIS IMPORTANTE, MAIS PERTO DA ARENA' });
});
// --- 12: o velário, puxado por marinheiros ---
shot(CUTS[11], CUTS[12], (tl, t) => {
  const u = eo(ramp(tl, .4, 5)); arenaVista(t, { velario: u, gente: true, camarote: false, cy: 980, ry: 160, sol: true, solX: 960, solY: 120 });
  for (let k = 0; k < 14; k++) { const a = PI + (k + .5) / 14 * PI, px = W / 2 + cos(a) * (820 + 715), py = 980 + sin(a) * (160 + 435) - 60; if (px < -20 || px > W + 20) continue; c.save(); c.translate(px, py); c.scale(.32, .32); person(0, 0, 100, { coat: '#3a4a6a', dark: '#2a3a5a', legs: '#c99a74' }); c.restore(); line(px, py - 20, W / 2, 140, 'rgba(90,70,40,.4)', 2) }
  label(W / 2, 380, 'VELÁRIO', { size: 120, align: 'center', a: ramp(tl, .6, 1.0) }); label(W / 2, 440, 'TOLDO PUXADO POR MARINHEIROS DA FROTA', { size: 42, align: 'center', col: OURO, a: ramp(tl, 3.6, 4.0), w: 600 });
});
// --- 13: o chão — madeira coberta de areia: harena ---
shot(CUTS[12], CUTS[13], (tl, t) => {
  c.fillStyle = '#0b0a0c'; c.fillRect(0, 0, W, H); add(() => glow(960, 520, 900, '217,150,70', .12));
  const y = 520; c.fillStyle = bands(0, y, 0, y + 70, [[.5, '#e2c490'], [1, '#cfae78']]); c.fillRect(0, y - 60 * eo(ramp(tl, .3, 1.6)), W, 60 * eo(ramp(tl, .3, 1.6)) + 2);
  const q = rng(13); for (let i = 0; i < 400; i++) disc(q() * W, y - q() * 60 * eo(ramp(tl, .3, 1.6)), 1.5 + q() * 2, 'rgba(160,120,70,.5)');
  for (let k = 0; k < 12; k++) { c.fillStyle = k % 2 ? '#8a6a40' : '#7a5a34'; c.fillRect(k * 170, y, 166, 50); c.fillStyle = 'rgba(40,24,12,.35)'; c.fillRect(k * 170 + 160, y, 6, 50); for (let j = 0; j < 3; j++) c.fillRect(k * 170 + 10, y + 12 + j * 12, 120, 2) }
  for (let k = 0; k < 6; k++) { c.fillStyle = '#5a3a20'; c.fillRect(120 + k * 340, y + 50, 30, 400) } c.fillStyle = '#5a3a20'; c.fillRect(0, y + 50, W, 22);
  label(1600, y - 120, 'AREIA', { size: 60, align: 'right', col: OURO, a: ramp(tl, .8, 1.1) }); label(1600, y + 140, 'MADEIRA', { size: 60, align: 'right', a: ramp(tl, .4, .7) });
  typeText(tl, TX, 820, 'HARENA', 2.0, CUTS[13] - CUTS[12] - .3, { size: 130, sub: '"AREIA", EM LATIM' });
});

// --- 14: CAPÍTULO 3 — quem eram: a escola Ludus Magnus ---
shot(CUTS[13], CUTS[14], (tl, t) => {
  ceu(SKY_ROMA, 500); sunGlow(1500, 200, 360, '255,240,200', .7); c.fillStyle = '#c8b48a'; c.fillRect(0, 380, W, 260); for (let k = 0; k < 16; k++) { c.fillStyle = '#efe3c2'; c.fillRect(40 + k * 124, 400, 30, 240) } c.fillStyle = '#a8503a'; poly([[0, 380], [W, 380], [W, 350], [0, 350]], '#a8503a'); c.fillStyle = '#efe3c2'; c.fillRect(0, 380, W, 24);
  chao(640, '#d8b880'); const q = rng(14); for (let i = 0; i < 200; i++) c.fillRect(q() * W, 650 + q() * 430, 6, 2);
  c.fillStyle = '#6a4a2a'; c.fillRect(1250, 600, 36, 260); c.fillStyle = '#5a3a20'; c.fillRect(1250, 600, 12, 260);
  gladPerfil(1130, 880, 300, 'reciario', 1, t, { ataque: .5 + .5 * sin(t * 4), pele: PELE_G[2] });
  gladPerfil(560, 900, 320, 'mirmilao', 1, t, { cor: '#a8382a', ataque: Math.max(0, sin(t * 3)) }); gladiador(320, 940, 330, 'secutor', t, { cor: '#3a5a6a', pele: PELE_G[3] });
  romano(1600, 960, 340, { tunica: '#8a6a40', toga: '#7a5a34', rosto: { estilo: 'curto', velho: 1, cabelo: '#9a9a90' } }, t);
  const L = [['ESCRAVOS', .3], ['PRISIONEIROS DE GUERRA', 1.3], ['CONDENADOS', 2.6], ['HOMENS LIVRES', 4.4]]; L.forEach(([s, a], k) => label(W - 100, 520 + k * 66 - 260, s, { size: 54, align: 'right', col: k === 3 ? OURO : CREME, a: ramp(tl, a + 1.6, a + 1.9) }));
  typeText(tl, TX, TY, 'LUDUS MAGNUS', 7.0, CUTS[14] - CUTS[13] - .3, { sub: 'A ESCOLA AO LADO DO COLISEU' });
  chapter(tl, 3, 'OS GLADIADORES');
});
// destaque de um gladiador, com etiquetas
function destaque(tl, t, tipo, nome, itens, o = {}) {
  c.fillStyle = '#0b0a0c'; c.fillRect(0, 0, W, H); add(() => glow(760, 560, 760, '217,150,70', .18 * ramp(tl, 0, .5))); c.fillStyle = '#1a1612'; c.beginPath(); c.ellipse(760, 1010, 380, 60, 0, 0, 7); c.fill();
  const g = eo(ramp(tl, 0, .8)); gladiador(760, 1000, 860 * (.94 + .06 * g), tipo, t, o);
  label(1220, 300, nome, { size: 130, a: ramp(tl, .2, .5) });
  itens.forEach(([s, a, px, py], k) => { const al = ramp(tl, a, a + .3); if (al <= 0) return; const ly = 420 + k * 86; c.save(); c.globalAlpha = al; c.strokeStyle = OURO; c.lineWidth = 3; c.beginPath(); c.moveTo(1200, ly - 14); c.lineTo(px, py); c.stroke(); disc(px, py, 8, OURO); c.restore(); label(1220, ly, s, { size: 50, a: al, w: 600 }) });
}
// --- 15: o mirmilão ---
shot(CUTS[14], CUTS[15], (tl, t) => destaque(tl, t, 'mirmilao', 'MIRMILÃO', [['CAPACETE DE METAL COM CRISTA', 1.4, 760, 160], ['ESCUDO GRANDE (SCUTUM)', 3.6, 940, 560], ['GLÁDIO, A ESPADA CURTA', 5.2, 560, 420], ['MANGA ACOLCHOADA', 6.0, 620, 360], ['CANELEIRA DE BRONZE', 6.6, 820, 900]], { cor: '#a8382a' }));
// --- 16: o trácio ---
shot(CUTS[15], CUTS[16], (tl, t) => destaque(tl, t, 'tracio', 'TRÁCIO', [['CAPACETE COM GRIFO', .6, 790, 140], ['ESCUDO PEQUENO', 1.2, 925, 500], ['ESPADA CURVA (SICA)', 1.8, 560, 360], ['CANELEIRAS ALTAS', 2.4, 720, 800]], { cor: '#3a5a6a', pele: PELE_G[2] }));
// --- 17: secutor contra reciário ---
shot(CUTS[16], CUTS[17], (tl, t) => {
  arenaVista(t, { agita: 1, camarote: false });
  const ap = ease(ramp(tl, .2, 2.5)); gladPerfil(lerp(520, 680, ap), 980, 560, 'secutor', 1, t, { cor: '#3a5a6a', pele: PELE_G[0] }); gladPerfil(lerp(1420, 1240, ap), 990, 560, 'reciario', -1, t, { pele: PELE_G[3], ataque: .3 + .2 * sin(t * 3) });
  label(500, 300, 'SECUTOR', { size: 90, a: ramp(tl, .3, .6) }); label(500, 350, 'CAPACETE LISO, OLHOS PEQUENOS', { size: 36, col: OURO, a: ramp(tl, .6, .9), w: 600 });
  label(1420, 300, 'RECIÁRIO', { size: 90, align: 'right', a: ramp(tl, 2.6, 2.9) }); label(1420, 350, 'SEM CAPACETE · REDE E TRIDENTE', { size: 36, align: 'right', col: OURO, a: ramp(tl, 3.0, 3.3), w: 600 });
});

// --- 18: CAPÍTULO 4 — de manhã, a caça aos animais ---
shot(CUTS[17], CUTS[18], (tl, t) => {
  arenaVista(t, { agita: 1, ceu: [[0, '#8fb0c0'], [.7, '#e0dcc0'], [1, '#f2e6c4']], solX: 400, solY: 160 });
  elefante(1560, 780, 2.2, t); urso(lerp(1320, 1200, ramp(tl, 2, 8)), 880, 2.6, t);
  leao(lerp(260, 640, ease(ramp(tl, 1.6, 7))), 930, 3.6, t, { anda: 1, ruge: tl > 4.2 && tl < 5.6 });
  c.save(); c.translate(lerp(980, 900, ramp(tl, 2, 8)), 960); c.scale(-1, 1); romano(0, 0, 260, { tunica: '#c8b48a', toga: '#c8b48a', rosto: { estilo: 'curto', cabelo: '#2a2018' } }, t); c.restore(); line(940, 840, 1080, 760, '#6a4a2a', 6); poly([[1080, 760], [1096, 746], [1092, 766]], '#c8ced4');
  primeiroPlano(t, 50, { agita: 1 });
  typeText(tl, TX, TY, 'DE MANHÃ: A CAÇA', 1.8, CUTS[18] - CUTS[17] - .3, { sub: 'LEÕES · URSOS · ELEFANTES' });
  chapter(tl, 4, 'UM DIA DE JOGOS');
});
// --- 19: o hipogeu de Domiciano — elevadores e alçapões ---
shot(CUTS[18], CUTS[19], (tl, t) => {
  const yA = 360; ceu([[0, '#8fb0c0'], [1, '#e0dcc0']], yA); c.fillStyle = '#b8a682'; c.fillRect(0, yA - 160, W, 160); fileiraGente(0, W, yA - 100, 26, 3, t, { agita: 1 }); fileiraGente(0, W, yA - 40, 30, 4, t, { agita: 1 });
  c.fillStyle = '#d8b880'; c.fillRect(0, yA, W, 40);
  c.fillStyle = '#4a3a2a'; c.fillRect(0, yA + 40, W, H); for (let r = 0; r < 2; r++) for (let k = 0; k < 9; k++) { const x = k * 230 - 40, y = yA + 90 + r * 330; c.fillStyle = '#6a4e34'; c.fillRect(x, y, 220, 300); c.fillStyle = '#2a1e14'; c.beginPath(); c.moveTo(x + 30, y + 300); c.lineTo(x + 30, y + 110); c.arc(x + 110, y + 110, 80, PI, 0); c.lineTo(x + 190, y + 300); c.fill(); c.strokeStyle = 'rgba(30,20,12,.35)'; c.lineWidth = 2; for (let j = 0; j < 10; j++) { c.beginPath(); c.moveTo(x, y + j * 30); c.lineTo(x + 220, y + j * 30); c.stroke() } }
  for (const [x, y] of [[180, 820], [1540, 830]]) { c.strokeStyle = '#2a2016'; c.lineWidth = 6; for (let k = 0; k < 7; k++) { c.beginPath(); c.moveTo(x + k * 26, y - 150); c.lineTo(x + k * 26, y); c.stroke() } c.strokeRect(x - 6, y - 154, 168, 156) } leao(1600, 820, 1.2, t, {}); urso(240, 816, 1.0, t);
  const sx = 960, up = eo(ramp(tl, 3.4, 6.8)), py = lerp(yA + 360, yA - 10, up); c.fillStyle = '#2a1e14'; c.fillRect(sx - 120, yA + 40, 240, 520); c.strokeStyle = '#8a7a5a'; c.lineWidth = 3; line(sx - 100, yA, sx - 100, py, '#c8b48a', 3); line(sx + 100, yA, sx + 100, py, '#c8b48a', 3);
  c.fillStyle = '#7a5a34'; c.fillRect(sx - 110, py, 220, 20); leao(sx - 30, py, 1.3, t, { ruge: up > .95 });
  const tr = ramp(tl, 3.0, 3.6); c.fillStyle = '#8a6a40'; c.save(); c.translate(sx - 120, yA); c.rotate(-tr * 1.4); c.fillRect(0, 0, 120, 16); c.restore(); c.save(); c.translate(sx + 120, yA); c.rotate(tr * 1.4); c.fillRect(-120, 0, 120, 16); c.restore();
  const cx = 1240, cyy = 1000; c.fillStyle = '#6a4a2a'; disc(cx, cyy - 60, 26, '#6a4a2a'); for (let k = 0; k < 4; k++) { const a = t * 1.4 + k * PI / 2; line(cx, cyy - 60, cx + cos(a) * 140, cyy - 60 + sin(a) * 30, '#7a5a34', 10) } line(cx, cyy - 60, sx + 100, yA + 30, 'rgba(200,180,140,.6)', 3);
  for (let k = 0; k < 3; k++) { const a = t * 1.4 + k * 2.1; c.save(); c.translate(cx + cos(a) * 120, cyy + 40 + sin(a) * 6); c.scale(.55, .55); person(0, 0, 100, { coat: '#8a6a40', dark: '#6a4e30', legs: '#c99a74' }); c.restore() }
  label(W - 80, 560, 'HIPOGEU', { size: 110, align: 'right', a: ramp(tl, .6, 1.0) }); label(W - 80, 620, 'OBRA DO IMPERADOR DOMICIANO', { size: 40, align: 'right', col: OURO, a: ramp(tl, 1.0, 1.3), w: 600 });
  label(W - 80, 700, 'ELEVADORES MOVIDOS A BRAÇO', { size: 40, align: 'right', a: ramp(tl, 2.6, 2.9), w: 600 });
});
// --- 20: à tarde, os gladiadores — o ponto alto ---
shot(CUTS[19], CUTS[20], (tl, t) => {
  const sh = Math.max(0, sin(t * 3.2)); arenaVista(t, { agita: 1, ceu: [[0, '#7a8aa0'], [.7, '#e0b880'], [1, '#f2c88a']], solX: 1500, solY: 220 });
  const c1 = Math.max(0, sin(t * 3.2 + 1)), c2 = Math.max(0, sin(t * 3.2 + 2.4)), dx = 30 * sin(t * 1.6);
  gladPerfil(820 + dx, 1000, 520, 'mirmilao', 1, t, { cor: '#a8382a', ataque: c1 }); gladPerfil(1120 + dx, 1000, 520, 'tracio', -1, t, { cor: '#3a5a6a', pele: PELE_G[2], ataque: c2 });
  if (c1 > .95 || c2 > .95) { add(() => glow(970 + dx, 620, 60, '255,240,200', .8)); for (let k = 0; k < 6; k++) { const a = k / 6 * 2 * PI; line(970 + dx, 620, 970 + dx + cos(a) * 40, 620 + sin(a) * 40, '#fff1c8', 3) } }
  for (let i = 0; i < 10; i++) disc(800 + i * 40 + dx, 990 - Math.abs(sin(t * 6 + i)) * 20, 14, 'rgba(216,184,128,.5)');
  typeText(tl, TX, TY, 'À TARDE: OS GLADIADORES', .3, CUTS[20] - CUTS[19] - .3, { sub: 'O PONTO ALTO DO DIA' });
});
// --- 21: vida ou morte — a decisão do imperador ---
shot(CUTS[20], CUTS[21], (tl, t) => {
  const fase = tl < 4.4 ? 0 : 1;
  if (!fase) { arenaVista(t, { agita: 1, ceu: [[0, '#7a8aa0'], [.7, '#e0b880'], [1, '#f2c88a']], solX: 1500, solY: 220 });
    gladPerfil(1080, 1000, 520, 'mirmilao', -1, t, { cor: '#a8382a', ataque: 0 }); gladPerfil(800, 1000, 520, 'secutor', 1, t, { cor: '#3a5a6a', ajoelhado: 1 });
    c.save(); c.translate(860, 600); line(0, 0, 0, -70, '#c8946a', 8); disc(0, -74, 5, '#c8946a'); c.restore();
    label(W / 2, 260, 'O DERROTADO LEVANTA O DEDO', { size: 64, align: 'center', a: ramp(tl, .6, 1.0) }); label(W / 2, 320, 'E PEDE CLEMÊNCIA', { size: 46, align: 'center', col: OURO, a: ramp(tl, 1.0, 1.4), w: 600 }) }
  else { c.fillStyle = '#2a2018'; c.fillRect(0, 0, W, H); add(() => glow(960, 540, 800, '217,150,70', .18)); c.fillStyle = '#efe3c2'; c.fillRect(300, 760, 1320, 320); c.fillStyle = PURPURA; c.fillRect(300, 760, 1320, 60); for (let k = 0; k < 6; k++) { c.fillStyle = '#d6c6a0'; c.fillRect(320 + k * 250, 100, 50, 660) }
    romano(960, 1080, 820, IMPERADOR, t);
    label(W / 2, 200, 'QUEM DECIDIA?', { size: 100, align: 'center', a: ramp(tl, 4.6, 5.0) }); label(W / 2, 260, 'QUEM PAGAVA OS JOGOS · MUITAS VEZES, O IMPERADOR', { size: 40, align: 'center', col: OURO, a: ramp(tl, 5.2, 5.6), w: 600 });
    label(W / 2, 330, 'OUVINDO OS GRITOS DA MULTIDÃO', { size: 40, align: 'center', a: ramp(tl, 6.6, 7.0), w: 600 }) }
});
// --- 22: nem toda luta terminava em morte ---
shot(CUTS[21], CUTS[22], (tl, t) => {
  arenaVista(t, { agita: 1, ceu: [[0, '#6a7a96'], [.7, '#d8a878'], [1, '#eab87a']], solX: 1500, solY: 260 });
  const up = eo(ramp(tl, 1.4, 3.2)); gladPerfil(1080, 1000, 520, 'mirmilao', -1, t, { cor: '#a8382a' }); gladPerfil(800, 1000, 520, 'secutor', 1, t, { cor: '#3a5a6a', ajoelhado: up < .5 });
  label(W / 2, 260, 'NEM TODA LUTA', { size: 110, align: 'center', a: ramp(tl, .6, 1.0) }); label(W / 2, 360, 'TERMINAVA EM MORTE', { size: 110, align: 'center', col: OURO, a: ramp(tl, 1.0, 1.4) });
});
// --- 23: ídolos — nomes pintados nas paredes ---
shot(CUTS[22], CUTS[23], (tl, t) => {
  c.fillStyle = bands(0, 0, W, 0, [[.7, '#e6d8b8'], [1, '#d6c6a0']]); c.fillRect(0, 0, W, H); const q = rng(23); c.strokeStyle = 'rgba(120,100,70,.4)'; c.lineWidth = 2; for (let i = 0; i < 12; i++) { let x = q() * W, y = q() * H; c.beginPath(); c.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (q() - .5) * 120; y += q() * 80; c.lineTo(x, y) } c.stroke() }
  const G = [['CELADVS', 'SVSPIRIVM PVELLARVM', 200, 440, -.04, .3], ['CRESCES', 'RETIARIVS', 1100, 260, .03, 1.2], ['PRISCVS · VERVS', 'MVNERA', 520, 640, -.02, 2.2]];
  G.forEach(([a, b, x, y, r, t0]) => { const al = ramp(tl, t0, t0 + .5); c.save(); c.translate(x, y); c.rotate(r); c.globalAlpha = al * .9; c.font = `800 110px ${FONTE}`; c.fillStyle = '#a8382a'; c.fillText(a.slice(0, Math.floor(clamp((tl - t0) * 14, 0, a.length))), 0, 0); c.font = `600 52px ${FONTE}`; c.fillStyle = '#5a2a20'; c.fillText(b, 0, 70); c.restore() });
  c.save(); c.globalAlpha = ramp(tl, 1.6, 2.2) * .8; c.strokeStyle = '#3a2a20'; c.lineWidth = 6; const gx = 1400, gy = 700; disc(gx, gy - 140, 18, 'rgba(0,0,0,0)'); c.beginPath(); c.arc(gx, gy - 140, 18, 0, 7); c.moveTo(gx, gy - 120); c.lineTo(gx, gy - 40); c.lineTo(gx - 30, gy + 10); c.moveTo(gx, gy - 40); c.lineTo(gx + 30, gy + 10); c.moveTo(gx, gy - 100); c.lineTo(gx + 50, gy - 130); c.moveTo(gx, gy - 100); c.lineTo(gx - 40, gy - 70); c.stroke(); c.strokeRect(gx - 80, gy - 110, 34, 60); c.restore();
  for (let i = 0; i < 9; i++) { const al = ramp(tl, 3.0 + i * .08, 3.2 + i * .08); c.save(); c.globalAlpha = al; c.translate(1500 + (i % 3) * 60, 960 - Math.floor(i / 3) * 24); c.fillStyle = '#c9a050'; c.beginPath(); c.ellipse(0, 0, 40, 12, 0, 0, 7); c.fill(); c.fillStyle = '#e0c070'; c.beginPath(); c.ellipse(0, -4, 40, 12, 0, 0, 7); c.fill(); c.restore() }
  label(1440, 1000 - 220, 'CUSTAVAM CARO', { size: 60, col: '#3a2a20', align: 'center', a: ramp(tl, 3.4, 3.7), sh: 0 });
  typeText(tl, TX, TY, 'ÍDOLOS DE ROMA', .2, CUTS[23] - CUTS[22] - .3, { sub: 'NOMES PINTADOS NAS PAREDES' });
});
// --- 24: mesmo assim, milhares morreram ---
shot(CUTS[23], CUTS[24], (tl, t) => {
  arenaVista(t, { gente: false, camarote: false, ceu: SKY_POR, solX: 960, solY: 300 });
  c.fillStyle = 'rgba(40,20,30,.35)'; c.fillRect(0, 0, W, H);
  c.save(); c.translate(860, 860); c.scale(8, 8); c.rotate(.5); capacete('mirmilao', 1, 0); c.restore();
  c.save(); c.translate(1180, 900); c.rotate(-1.25); c.scale(1, .55); c.scale(8, 8); escudoScutum(22, 44, '#7a2a20', t); c.restore(); c.save(); c.translate(560, 950); c.rotate(1.35); c.scale(7, 7); gladio(22); c.restore();
  c.fillStyle = 'rgba(30,16,20,.4)'; c.beginPath(); c.ellipse(1020, 960, 420, 50, 0, 0, 7); c.fill();
  label(W / 2, 300, 'MILHARES MORRERAM', { size: 110, align: 'center', a: ramp(tl, 1.2, 1.7) }); label(W / 2, 370, 'NA AREIA DO COLISEU', { size: 52, align: 'center', col: OURO, a: ramp(tl, 1.8, 2.2), w: 600 });
});

// --- 25: CAPÍTULO 5 — o fim dos jogos (sépia) ---
shot(CUTS[24], CUTS[25], (tl, t) => {
  ceu(SKY_ROMA, 600); c.fillStyle = '#8a9a6a'; c.fillRect(0, 760, W, H);
  coliseuFachada(960, 900, 1500, 480, t, { mastros: false, estatuas: false });
  const q = rng(25); for (let i = 0; i < 60; i++) { const x = 260 + q() * 1400, y = 360 + q() * 540; c.fillStyle = q() < .5 ? '#5a7a3a' : '#7a9a4a'; c.beginPath(); c.ellipse(x, y, 12 + q() * 22, 6 + q() * 10, 0, 0, 7); c.fill() }
  for (let i = 0; i < 6; i++) { const x = 300 + i * 260 + sin(t * .3 + i) * 10; c.fillStyle = '#efe7d4'; c.beginPath(); c.ellipse(x, 1000, 32, 18, 0, 0, 7); c.fill(); disc(x + 30, 990, 10, '#efe7d4'); c.fillStyle = '#3a3026'; c.fillRect(x - 18, 1010, 5, 22); c.fillRect(x + 14, 1010, 5, 22) }
  sepia(.85);
  label(TX, 200, 'SÉCULO V', { size: 90, col: '#fff0d8', a: ramp(tl, 2.6, 2.9) }); label(TX, 250, 'FIM DAS LUTAS DE GLADIADORES', { size: 40, col: '#ffe9c4', a: ramp(tl, 2.8, 3.1), w: 600 });
  label(1000, 200, 'SÉCULO VI', { size: 90, col: '#fff0d8', a: ramp(tl, 5.6, 5.9) }); label(1000, 250, 'FIM DAS CAÇADAS', { size: 40, col: '#ffe9c4', a: ramp(tl, 5.8, 6.1), w: 600 });
  chapter(tl, 5, 'O FIM');
});
// --- 26: terremotos ---
shot(CUTS[25], CUTS[26], (tl, t) => {
  const sh = ramp(tl, .2, .5) * (1 - ramp(tl, 2.6, 3.2)), dx = sin(t * 60) * 14 * sh, dy = sin(t * 47) * 8 * sh;
  c.save(); c.translate(dx, dy); ceu(SKY_ROMA, 600); c.fillStyle = '#8a9a6a'; c.fillRect(-40, 760, W + 80, H);
  coliseuFachada(960, 900, 1500, 560, t, { mastros: false, ruina: tl > 1.2 });
  const q = rng(26); for (let i = 0; i < 30; i++) { const t0 = 1.0 + q() * 1.4, a = tl - t0; if (a < 0) continue; const x = 300 + q() * 500, y = 400 + q() * 200 + a * a * 600; if (y > 980) continue; c.save(); c.translate(x + a * 40 * (q() - .5), y); c.rotate(a * 3); blocoPedra(-20, -14, 40, 28, i); c.restore() }
  if (tl > 1.0) for (let i = 0; i < 14; i++) { const a = tl - 1.0; disc(400 + i * 50, 980 - a * 60 * (1 + i % 3), 30 + a * 60, `rgba(200,180,140,${clamp(.6 - a * .2)})`) }
  c.restore();
  label(W - 100, 300, 'TERREMOTOS', { size: 110, align: 'right', a: ramp(tl, .3, .6) }); label(W - 100, 360, 'ANOS 847 E 1349', { size: 46, align: 'right', col: OURO, a: ramp(tl, .6, .9), w: 600 });
});
// --- 27: as pedras viram igrejas e palácios ---
shot(CUTS[26], CUTS[27], (tl, t) => {
  ceu(SKY_ROMA, 640); sunGlow(1600, 260, 380, '255,232,180', .8);
  c.fillStyle = '#efe3c2'; c.fillRect(1200, 420, 560, 360); c.beginPath(); c.arc(1480, 420, 170, PI, 0); c.fill(); c.fillStyle = '#d6c6a0'; c.fillRect(1460, 160, 40, 110); disc(1480, 150, 20, '#d6c6a0'); for (let k = 0; k < 8; k++) { c.fillStyle = '#c8b88e'; c.fillRect(1230 + k * 66, 520, 26, 260) } poly([[1180, 520], [1780, 520], [1480, 440]], '#d6c6a0');
  c.fillStyle = '#b8a070'; c.fillRect(0, 780, W, H); coliseuFachada(260, 900, 700, 260, t, { ruina: 1, mastros: false });
  const cx = lerp(560, 1060, ease(ramp(tl, .2, 5))); for (const k of [0, 1]) { c.save(); c.translate(cx - 200 + k * 70, 940); c.scale(1, 1); c.fillStyle = '#8a7a6a'; c.beginPath(); c.ellipse(0, -60, 60, 32, 0, 0, 7); c.fill(); disc(56, -76, 20, '#8a7a6a'); poly([[60, -96], [80, -112], [70, -92]], '#efe7d4'); for (const lx of [-40, -10, 20, 44]) c.fillRect(lx, -36, 10, 40); c.restore() }
  c.fillStyle = '#6a4a2a'; c.fillRect(cx - 40, 870, 300, 30); disc(cx, 920, 34, '#4a3020'); disc(cx + 220, 920, 34, '#4a3020'); for (let k = 0; k < 3; k++) blocoPedra(cx - 20 + k * 90, 790, 84, 80, 30 + k);
  romano(cx + 300, 980, 240, { tunica: '#8a6a40', toga: '#8a6a40', rosto: { estilo: 'curto', cabelo: '#2a2018' } }, t);
  label(W / 2, 260, 'AS PEDRAS FORAM PARA', { size: 70, align: 'center', a: ramp(tl, .3, .6) }); label(W / 2, 350, 'IGREJAS E PALÁCIOS', { size: 90, align: 'center', col: OURO, a: ramp(tl, 1.4, 1.8) });
});
// --- 28: hoje — milhões de visitantes ---
shot(CUTS[27], CUTS[28], (tl, t) => {
  ceu([[0, '#4a86b8'], [.6, '#9cc0d8'], [1, '#e6e8dc']], 700); sunGlow(1600, 200, 380, '255,250,230', .8); cloudsBand(28, 6, 100, 360, 50, 100, '255,255,255', .7, t * 6);
  const z = lerp(1.05, 1, ease(ramp(tl, 0, 8))); zoomTela(z, 960, 700, () => { c.fillStyle = '#6a7a52'; c.fillRect(0, 820, W, H); coliseuFachada(960, 900, 1700, 640, t, { ruina: 1, mastros: false, estatuas: false, pal: ['#6a5e4c', '#a8987a', '#d8ccae', '#ece2c8', '#bcae92'] }); c.fillStyle = '#9a9488'; c.fillRect(0, 900, W, H - 900) });
  const q = rng(28), P = []; for (let i = 0; i < 26; i++) P.push([q() * (W + 200) - 100, 960 + q() * 120, 170 + q() * 70, i]); P.sort((a, b) => a[1] - b[1]).forEach(([x, y, h, i]) => person(x + sin(t * .5 + i) * 20, y, h, { coat: ['#d84a3a', '#3a7ab8', '#f2c84a', '#ffffff', '#2a2a2e', '#6ab84a', '#e88ac0'][i % 7], dark: '#1e1e22', legs: ['#2a3a5a', '#c8b89a', '#1e1e22'][i % 3], hair: ['#2a2018', '#8a6a3a', '#d8b878'][i % 3] }));
  label(W - 100, 300, 'MILHÕES', { size: 150, align: 'right', a: ramp(tl, 1.4, 1.8) }); label(W - 100, 370, 'DE VISITANTES POR ANO', { size: 52, align: 'right', col: OURO, a: ramp(tl, 1.8, 2.2), w: 600 });
  typeText(tl, TX, TY, 'HOJE', .2, CUTS[28] - CUTS[27] - .3, { size: 80, sub: 'QUASE 2 MIL ANOS DEPOIS' });
});
// --- 29: pôr do sol — o maior anfiteatro do mundo antigo ---
shot(CUTS[28], CUTS[29], (tl, t) => {
  ceu(SKY_POR, 700); sunGlow(1500, 620, 620, '255,190,110', 1); cloudsBand(29, 7, 140, 460, 50, 110, '240,150,110', .4, t * 4);
  for (let i = 0; i < 9; i++) { const x = (200 + i * 170 + t * 30) % (W + 200) - 100, y = 260 + (i % 3) * 40 + sin(t * 2 + i) * 6; c.strokeStyle = '#2a1e1e'; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 12, y - 4 * Math.abs(sin(t * 6 + i))); c.lineTo(x, y); c.lineTo(x + 12, y - 4 * Math.abs(sin(t * 6 + i))); c.stroke() }
  const z = lerp(1, 1.08, ease(ramp(tl, 0, 14))); zoomTela(z, 960, 760, () => { c.fillStyle = '#3a2a2a'; c.fillRect(0, 860, W, H); coliseuFachada(960, 920, 1700, 640, t, { ruina: 1, mastros: false, estatuas: false, pal: ['#3a2a2a', '#7a4a3a', '#c8865a', '#f0b878', '#a86a4a'] }); for (const x of [120, 1800]) pinheiro(x, 940, 2.4, '#2a2020'); for (const x of [300, 1640]) cipreste(x, 950, 2.6, '#1e1818') });
  c.fillStyle = '#1e1616'; c.fillRect(0, 980, W, 100);
  label(W / 2, 220, 'O COLISEU', { size: 150, align: 'center', a: ramp(tl, CUTS[29] - CUTS[28] - 7.4, CUTS[29] - CUTS[28] - 6.6) }); label(W / 2, 290, 'ANO 80 · ROMA · HOJE', { size: 48, align: 'center', col: OURO, a: ramp(tl, CUTS[29] - CUTS[28] - 6.6, CUTS[29] - CUTS[28] - 5.8), w: 600 });
});
