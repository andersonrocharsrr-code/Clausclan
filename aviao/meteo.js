/* Meteorologia para a aviação: os tipos de nuvens (desenhados aqui mesmo), o radar meteorológico no ND
   com as cores de verdade e o corte de lado mostrando o feixe do radar atravessando as nuvens. */
(() => {
'use strict';
const $ = (s) => document.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const D2R = Math.PI / 180;
const nf = (v, d = 0) => v.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; }; }

/* ---------- Os 10 gêneros de nuvens (classificação da OMM) ---------- */
const CLOUDS = [
  { id: 'ci', nome: 'Cirrus', sigla: 'Ci', nivel: 'alta', alt: 'acima de 20.000 ft', base: 30000, top: 38000,
    como: 'Fios e fiapos brancos, finos como penas. São feitas só de cristais de gelo.',
    voo: 'Não trazem perigo direto. Faixas longas e rápidas podem marcar a corrente de jato, onde há turbulência de céu claro (CAT).', perigo: ['CAT perto da corrente de jato'] },
  { id: 'cc', nome: 'Cirrocumulus', sigla: 'Cc', nivel: 'alta', alt: 'acima de 20.000 ft', base: 26000, top: 30000,
    como: 'Pequenos flocos brancos arrumados em fileiras, o "céu de escamas de peixe".',
    voo: 'Turbulência leve. Mostram ar instável lá em cima.', perigo: ['Turbulência leve'] },
  { id: 'cs', nome: 'Cirrostratus', sigla: 'Cs', nivel: 'alta', alt: 'acima de 20.000 ft', base: 22000, top: 26000,
    como: 'Um véu fino e esbranquiçado que cobre o céu e faz um halo em volta do Sol ou da Lua.',
    voo: 'Sem perigo direto, mas costuma anunciar uma frente quente chegando: a base das nuvens vai baixar nas próximas horas.', perigo: ['Anuncia frente quente'] },
  { id: 'ac', nome: 'Altocumulus', sigla: 'Ac', nivel: 'média', alt: '6.500 a 20.000 ft', base: 12000, top: 15000,
    como: 'Bolas e rolos brancos e cinza em grupos ou fileiras. As lenticulares, em forma de disco, aparecem perto de montanhas.',
    voo: 'Turbulência leve a moderada e gelo. As lenticulares indicam ondas de montanha, com turbulência forte.', perigo: ['Turbulência', 'Gelo'] },
  { id: 'as', nome: 'Altostratus', sigla: 'As', nivel: 'média', alt: '6.500 a 20.000 ft', base: 9000, top: 16000,
    como: 'Uma camada cinza-azulada que cobre o céu. O Sol aparece como através de vidro fosco.',
    voo: 'Gelo e pouca visibilidade dentro da nuvem. Pode trazer chuva fraca e contínua.', perigo: ['Gelo', 'Visibilidade'] },
  { id: 'ns', nome: 'Nimbostratus', sigla: 'Ns', nivel: 'média', alt: 'base baixa, até 20.000 ft', base: 2500, top: 16000,
    como: 'Uma camada grossa e escura que tapa o Sol, com chuva ou neve contínua.',
    voo: 'Teto baixo, chuva contínua e gelo moderado a forte. Voo por instrumentos (IFR).', perigo: ['Gelo forte', 'Teto baixo', 'IFR'] },
  { id: 'st', nome: 'Stratus', sigla: 'St', nivel: 'baixa', alt: 'superfície a 6.500 ft', base: 600, top: 2500,
    como: 'Uma camada cinza e lisa, como um nevoeiro que não encosta no chão. Pode dar garoa.',
    voo: 'Teto e visibilidade muito baixos: é a nuvem que mais fecha aeroportos para pouso.', perigo: ['Teto baixo', 'Nevoeiro', 'IFR'] },
  { id: 'sc', nome: 'Stratocumulus', sigla: 'Sc', nivel: 'baixa', alt: 'superfície a 6.500 ft', base: 2500, top: 5000,
    como: 'Rolos e bolas cinza em camada, com espaços de céu azul entre eles.',
    voo: 'Turbulência leve e gelo leve. Muito comum e quase sempre tranquila.', perigo: ['Turbulência leve'] },
  { id: 'cu', nome: 'Cumulus', sigla: 'Cu', nivel: 'vertical', alt: 'base 2.000 a 5.000 ft', base: 3000, top: 8000,
    como: 'Nuvens de algodão com a base reta e o topo em couve-flor. Nascem do ar quente que sobe.',
    voo: 'Turbulência de calor (térmicas) embaixo e dentro. Quando crescem viram cumulus congestus.', perigo: ['Térmicas'] },
  { id: 'tcu', nome: 'Cumulus congestus', sigla: 'TCU', nivel: 'vertical', alt: 'base 2.000 a 5.000 ft, topo até 25.000 ft', base: 3000, top: 22000,
    como: 'Torres altas e brilhantes de couve-flor, crescendo rápido. No METAR aparecem como TCU.',
    voo: 'Turbulência moderada a forte e gelo. Muitas viram cumulonimbus em poucos minutos: o piloto desvia delas.', perigo: ['Turbulência forte', 'Gelo', 'Vira CB'] },
  { id: 'cb', nome: 'Cumulonimbus', sigla: 'CB', nivel: 'vertical', alt: 'base 1.000 a 5.000 ft, topo até 45.000 ft ou mais', base: 2500, top: 45000,
    como: 'A nuvem de tempestade: uma torre enorme com o topo achatado em bigorna, base escura e pancadas de chuva.',
    voo: 'O maior perigo da meteorologia: turbulência severa, granizo, raios, gelo forte, tesoura de vento (windshear) e microexplosões perto do solo. Nunca se atravessa: desvia-se de longe.', perigo: ['Turbulência severa', 'Granizo', 'Raios', 'Windshear', 'Gelo forte'] },
];
const NIVEL = { alta: 'Nuvens altas', 'média': 'Nuvens médias', baixa: 'Nuvens baixas', vertical: 'Desenvolvimento vertical' };

/* ---------- Desenho das nuvens ---------- */
function sky(c, w, h, storm) {
  const g = c.createLinearGradient(0, 0, 0, h);
  if (storm) { g.addColorStop(0, '#5a6b7c'); g.addColorStop(1, '#a9b4bd'); } else { g.addColorStop(0, '#2f6fc2'); g.addColorStop(0.65, '#7fb2e6'); g.addColorStop(1, '#cfe3f5'); }
  c.fillStyle = g; c.fillRect(0, 0, w, h);
}
// "Puff": bola de nuvem iluminada por cima (o Sol vem do alto à esquerda)
// Bordas que somem aos poucos, para parecer vapor e não uma bola
const rgba = (hex, a) => `rgba(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(',')},${a})`;
function puff(c, x, y, r, top, bot, a = 1) {
  const g = c.createRadialGradient(x - r * 0.3, y - r * 0.4, r * 0.05, x, y, r);
  g.addColorStop(0, rgba(top, a)); g.addColorStop(0.55, rgba(lerpCol(top, bot, 0.45), a * 0.95)); g.addColorStop(0.85, rgba(bot, a * 0.6)); g.addColorStop(1, rgba(bot, 0));
  c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
}
function lerpCol(a, b, t) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)), A = p(a), B = p(b);
  return '#' + A.map((v, i) => Math.round(lerp(v, B[i], t)).toString(16).padStart(2, '0')).join('');
}
// Cúmulo: base reta, topo de couve-flor. darkness 0..1 deixa a base mais escura.
function cumulus(c, x, y, w, h, seed, dark = 0, lit = '#ffffff') {
  c.save(); if ('filter' in c) c.filter = 'blur(0.7px)';
  const R = rng(seed), base = lerpCol('#c9d0d8', '#3d4752', dark);
  for (let i = 0; i < 26 + h / 6; i++) {
    const u = R(), v = Math.pow(R(), 0.8), px = x + (u - 0.5) * w * (1 - 0.55 * v), py = y - v * h * 0.82, r = (w * 0.12 + h * 0.08) * (0.55 + R() * 0.6) * (1 - 0.35 * v);
    puff(c, px, py, r, lit, lerpCol(lit, base, 0.25 + 0.6 * (1 - v)));
  }
  // base reta e mais escura
  const g = c.createLinearGradient(0, y - h * 0.18, 0, y + 4);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, base);
  c.fillStyle = g; c.beginPath(); c.ellipse(x, y - h * 0.06, w * 0.48, h * 0.14, 0, 0, 7); c.fill();
  c.restore();
}
// Camada (stratus, altostratus, nimbostratus): uma faixa contínua com as bordas onduladas e macias
function stratus(c, x, y, w, h, seed, col = '#b9c1c9', dark = '#8d97a1') {
  const R = rng(seed), ph = [R() * 6, R() * 6, R() * 6], x0 = x - w / 2, x1 = x + w / 2;
  const edge = (xx, s) => s * h * 0.5 + h * 0.12 * (Math.sin(xx / w * 9 + ph[0]) + 0.6 * Math.sin(xx / w * 23 + ph[1]) + 0.3 * Math.sin(xx / w * 51 + ph[2]));
  c.save(); if ('filter' in c) c.filter = `blur(${Math.max(1, h * 0.06)}px)`;
  const g = c.createLinearGradient(0, y - h / 2, 0, y + h / 2);
  g.addColorStop(0, col.startsWith('#') ? lerpCol(col, '#ffffff', 0.25) : col); g.addColorStop(0.6, col); g.addColorStop(1, dark);
  c.fillStyle = g; c.beginPath();
  for (let i = 0; i <= 60; i++) { const xx = lerp(x0, x1, i / 60); c.lineTo(xx, y + edge(xx, -1)); }
  for (let i = 60; i >= 0; i--) { const xx = lerp(x0, x1, i / 60); c.lineTo(xx, y + edge(xx + 37, 1) * 0.6 + h * 0.15); }
  c.closePath(); c.fill();
  // textura suave por dentro
  for (let i = 0; i < 40; i++) {
    const px = lerp(x0, x1, R()), py = y + (R() - 0.5) * h * 0.5, rw = w * (0.04 + R() * 0.08);
    const gg = c.createRadialGradient(px, py, 1, px, py, rw); gg.addColorStop(0, R() > 0.5 ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.08)'); gg.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = gg; c.beginPath(); c.ellipse(px, py, rw, rw * 0.3, 0, 0, 7); c.fill();
  }
  c.restore();
}
function cirrus(c, x, y, w, h, seed) {
  const R = rng(seed);
  c.lineCap = 'round';
  for (let i = 0; i < 26; i++) {
    const sx = x + (R() - 0.5) * w, sy = y + (R() - 0.5) * h, L = w * (0.12 + R() * 0.25), cur = (R() - 0.3) * h * 0.8;
    c.strokeStyle = `rgba(255,255,255,${0.35 + R() * 0.5})`; c.lineWidth = 1 + R() * 2.5;
    c.beginPath(); c.moveTo(sx, sy); c.quadraticCurveTo(sx + L * 0.5, sy - cur * 0.2, sx + L, sy + cur); c.stroke();
    // ganchinho na ponta (o "rabo de égua")
    c.lineWidth = 0.8; c.beginPath(); c.moveTo(sx + L, sy + cur); c.quadraticCurveTo(sx + L + 6, sy + cur + 4, sx + L + 3, sy + cur + 10); c.stroke();
  }
}
function flecks(c, x, y, w, h, seed, big = 0) {
  const R = rng(seed), rows = big ? 5 : 8;
  for (let rI = 0; rI < rows; rI++) for (let k = 0; k < (big ? 7 : 14); k++) {
    const px = x - w / 2 + (k + R() * 0.5) / (big ? 7 : 14) * w, py = y - h / 2 + (rI + R() * 0.4) / rows * h, r = (big ? w / 28 : w / 60) * (0.7 + R() * 0.6);
    puff(c, px, py, r, '#ffffff', big ? '#9aa6b2' : '#d6e0ea', big ? 1 : 0.85);
  }
}
function rain(c, x0, x1, y0, y1, seed, a = 0.5) {
  const R = rng(seed); c.strokeStyle = `rgba(90,105,120,${a})`; c.lineWidth = 1;
  for (let i = 0; i < 90; i++) { const x = lerp(x0, x1, R()), y = lerp(y0, y1, R() * 0.7); c.beginPath(); c.moveTo(x, y); c.lineTo(x - 4, y + (y1 - y0) * 0.3); c.stroke(); }
}
function cumulonimbus(c, x, y, w, h, seed, t = 0) {
  const R = rng(seed);
  // bigorna
  const ay = y - h * 0.9;
  const g = c.createLinearGradient(0, ay - h * 0.08, 0, ay + h * 0.12);
  g.addColorStop(0, '#f4f6f8'); g.addColorStop(1, '#aeb7c0');
  c.fillStyle = g; c.beginPath();
  c.moveTo(x - w * 0.25, ay + h * 0.1); c.quadraticCurveTo(x - w * 0.55, ay + h * 0.02, x - w * 0.62, ay - h * 0.02);
  c.quadraticCurveTo(x, ay - h * 0.12, x + w * 0.85, ay - h * 0.03); c.quadraticCurveTo(x + w * 0.6, ay + h * 0.06, x + w * 0.2, ay + h * 0.11); c.closePath(); c.fill();
  // torre
  for (let i = 0; i < 130; i++) {
    const v = Math.pow(R(), 0.85), u = R(), wid = lerp(0.62, 0.34, v), px = x + (u - 0.5) * w * wid + v * w * 0.05, py = y - v * h * 0.86, r = w * (0.09 + R() * 0.07) * (1 - 0.25 * v);
    puff(c, px, py, r, '#ffffff', lerpCol('#ffffff', '#2e3742', 0.35 + 0.55 * (1 - v)));
  }
  const bg = c.createLinearGradient(0, y - h * 0.2, 0, y + 6); bg.addColorStop(0, 'rgba(30,36,44,0)'); bg.addColorStop(1, '#262d35');
  c.fillStyle = bg; c.beginPath(); c.ellipse(x, y - h * 0.05, w * 0.32, h * 0.12, 0, 0, 7); c.fill();
  rain(c, x - w * 0.22, x + w * 0.2, y, y + h * 0.22, seed + 3, 0.65);
  // raio piscando de vez em quando
  if (Math.sin(t * 1.7) > 0.96) {
    c.strokeStyle = '#fffbe0'; c.lineWidth = 2; c.beginPath(); let lx = x + w * 0.05, ly = y + 2; c.moveTo(lx, ly);
    for (let i = 0; i < 6; i++) { lx += (R() - 0.5) * 18; ly += h * 0.04; c.lineTo(lx, ly); } c.stroke();
  }
}
function drawCloud(c, id, w, h, t = 0) {
  const storm = id === 'cb' || id === 'ns';
  sky(c, w, h, storm);
  const gy = h * 0.92;
  c.fillStyle = storm ? '#46524a' : '#557a4c'; c.fillRect(0, gy, w, h - gy);
  switch (id) {
    case 'ci': cirrus(c, w * 0.5, h * 0.35, w * 0.9, h * 0.35, 11); break;
    case 'cc': flecks(c, w * 0.5, h * 0.35, w * 0.85, h * 0.35, 12); break;
    case 'cs': { const g = c.createLinearGradient(0, 0, 0, h * 0.7); g.addColorStop(0, 'rgba(255,255,255,.65)'); g.addColorStop(1, 'rgba(255,255,255,.1)'); c.fillStyle = g; c.fillRect(0, 0, w, h * 0.7);
      c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 3; c.beginPath(); c.arc(w * 0.7, h * 0.3, h * 0.2, 0, 7); c.stroke();
      c.fillStyle = '#fffbe6'; c.beginPath(); c.arc(w * 0.7, h * 0.3, h * 0.04, 0, 7); c.fill(); break; }
    case 'ac': flecks(c, w * 0.5, h * 0.42, w * 0.9, h * 0.38, 13, 1); break;
    case 'as': stratus(c, w * 0.5, h * 0.4, w * 1.2, h * 0.45, 14, '#aab4c0', '#7c8794'); c.fillStyle = 'rgba(255,250,230,.55)'; c.beginPath(); c.arc(w * 0.65, h * 0.38, h * 0.05, 0, 7); c.fill(); break;
    case 'ns': stratus(c, w * 0.5, h * 0.4, w * 1.3, h * 0.6, 15, '#6f7984', '#4b545e'); rain(c, 0, w, h * 0.55, gy, 15, 0.45); break;
    case 'st': stratus(c, w * 0.5, h * 0.62, w * 1.3, h * 0.3, 16, '#c3c9cf', '#a2aab2'); break;
    case 'sc': for (let i = 0; i < 5; i++) cumulus(c, w * (0.1 + i * 0.2), h * 0.66, w * 0.28, h * 0.16, 30 + i, 0.5, '#e9edf0'); break;
    case 'cu': cumulus(c, w * 0.3, h * 0.78, w * 0.32, h * 0.3, 41); cumulus(c, w * 0.72, h * 0.8, w * 0.26, h * 0.22, 42); break;
    case 'tcu': cumulus(c, w * 0.5, h * 0.86, w * 0.45, h * 0.75, 51, 0.45); break;
    case 'cb': cumulonimbus(c, w * 0.45, h * 0.8, w * 0.7, h * 0.72, 61, t); break;
  }
}

/* ---------- Atlas: todas as nuvens por altitude ---------- */
let atlas = null, sel = 'cb';
const ATLAS_X = { ci: 0.36, cc: 0.56, cs: 0.74, ac: 0.24, as: 0.52, ns: 0.85, st: 0.34, sc: 0.52, cu: 0.65, tcu: 0.76, cb: 0.9 };
function drawAtlas(t) {
  const { c, w, h } = atlas, top = 48000, Y = (ft) => h - 14 - ft / top * (h - 30);
  sky(c, w, h, false);
  c.fillStyle = '#557a4c'; c.fillRect(0, h - 14, w, 14);
  // faixas de altitude
  c.font = `600 11px ${getComputedStyle(document.documentElement).getPropertyValue('--mono') || 'monospace'}`;
  for (const [ft, txt] of [[6500, '6.500 ft'], [20000, '20.000 ft'], [36000, '36.000 ft · cruzeiro']]) {
    c.strokeStyle = 'rgba(255,255,255,.55)'; c.setLineDash([5, 5]); c.beginPath(); c.moveTo(0, Y(ft)); c.lineTo(w, Y(ft)); c.stroke(); c.setLineDash([]);
    c.fillStyle = 'rgba(255,255,255,.9)'; c.textAlign = 'left'; c.fillText(txt, 6, Y(ft) - 4);
  }
  atlas.hits = [];
  for (const cl of CLOUDS) {
    const x = ATLAS_X[cl.id] * w, y0 = Y(cl.base), y1 = Y(cl.top), cw = Math.min(w * 0.22, 140);
    c.save();
    if (sel && sel !== cl.id) c.globalAlpha = 0.55;
    if (cl.id === 'cb') cumulonimbus(c, x - cw * 0.1, y0, cw * 1.1, y0 - y1, 61, t);
    else if (cl.id === 'cu' || cl.id === 'tcu') cumulus(c, x, y0, cw * (cl.id === 'cu' ? 0.45 : 0.6), y0 - y1, cl.id === 'cu' ? 41 : 51, cl.id === 'tcu' ? 0.4 : 0);
    else if (cl.id === 'ci') cirrus(c, x, (y0 + y1) / 2, cw * 1.2, y0 - y1, 11);
    else if (cl.id === 'cc') flecks(c, x, (y0 + y1) / 2, cw * 1.2, y0 - y1, 12);
    else if (cl.id === 'ac') flecks(c, x, (y0 + y1) / 2, cw * 1.1, y0 - y1, 13, 1);
    else if (cl.id === 'cs') stratus(c, x, (y0 + y1) / 2, cw * 1.4, (y0 - y1) * 0.8, 17, 'rgba(255,255,255,.7)', 'rgba(255,255,255,.2)');
    else if (cl.id === 'sc') { for (let i = 0; i < 3; i++) cumulus(c, x + (i - 1) * cw * 0.32, y0, cw * 0.38, y0 - y1, 30 + i, 0.4, '#eceff2'); }
    else stratus(c, x, (y0 + y1) / 2, cw * 1.3, Math.max(14, y0 - y1), 14 + cl.id.length, cl.id === 'ns' ? '#6f7984' : '#b8c0c8', cl.id === 'ns' ? '#4b545e' : '#8d97a1');
    c.restore();
    const ly = cl.id === 'cb' ? Y(30000) : (y0 + y1) / 2;
    const on = sel === cl.id, tw = c.measureText(cl.sigla).width + 14;
    c.fillStyle = on ? '#c2185b' : 'rgba(16,22,28,.75)'; c.beginPath(); c.roundRect ? c.roundRect(x - tw / 2, ly - 10, tw, 20, 10) : c.rect(x - tw / 2, ly - 10, tw, 20); c.fill();
    c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(cl.sigla, x, ly + 0.5); c.textBaseline = 'alphabetic';
    atlas.hits.push({ id: cl.id, x0: x - cw / 2, x1: x + cw / 2, y0: Math.min(y1, ly - 12), y1: Math.max(y0, ly + 12) });
  }
  // Nome das faixas por cima de tudo, à esquerda (embaixo de cada linha de altitude)
  c.textAlign = 'left'; c.textBaseline = 'middle';
  for (const [ft, txt] of [[3800, 'NUVENS BAIXAS'], [17000, 'NUVENS MÉDIAS'], [33000, 'NUVENS ALTAS']]) {
    const tw = c.measureText(txt).width + 12; c.fillStyle = 'rgba(16,22,28,.55)'; c.fillRect(4, Y(ft) - 9, tw, 18);
    c.fillStyle = '#fff'; c.fillText(txt, 10, Y(ft) + 0.5);
  }
  c.textBaseline = 'alphabetic';
}

/* ---------- Radar meteorológico ---------- */
// Células de tempestade: posição em milhas náuticas (x para a direita, y para a frente do avião), raio, refletividade máxima (dBZ) e topo (ft)
const SCEN = {
  leve: { nome: 'Chuva leve em camada', txt: 'Chuva de nimbostratus: uma área larga, só verde e um pouco de amarelo. Dá para voar através com o sinal de cintos ligado, atento ao gelo.',
    cells: [[-10, 55, 38, 30, 16000], [18, 70, 30, 32, 15000], [-30, 90, 30, 28, 15000], [5, 100, 34, 33, 16000]] },
  cb: { nome: 'CB isolado com granizo', txt: 'Um cumulonimbus maduro à frente e à direita: núcleo vermelho e magenta (granizo provável) e o contorno apertado do lado de onde vem o vento. A regra é desviar pelo menos 20 NM dos ecos fortes, de preferência pelo lado de onde vem o vento, e nunca passar por baixo da bigorna.',
    cells: [[14, 42, 7, 58, 45000], [17, 46, 5, 48, 42000], [9, 38, 9, 38, 38000], [-25, 95, 10, 30, 20000]] },
  linha: { nome: 'Linha de instabilidade', txt: 'Uma linha de CBs cruzando a rota, com núcleos fortes muito juntos. Não se passa entre duas células a menos de 40 NM uma da outra: o piloto contorna a linha inteira ou espera. Repare na sombra atrás das células mais fortes: o radar não enxerga através delas.',
    cells: [[-55, 62, 9, 50, 40000], [-33, 58, 8, 56, 43000], [-12, 60, 9, 52, 42000], [8, 63, 8, 57, 45000], [28, 66, 9, 49, 40000], [48, 70, 8, 45, 38000], [-5, 110, 12, 40, 30000]] },
  topo: { nome: 'Topo de CB com gelo seco', txt: 'O feixe passa pela parte de cima de um CB, onde só há gelo e cristais. Gelo seco reflete pouco: o radar mostra só verde ou quase nada, mas a turbulência é severa. Por isso o piloto inclina a antena para baixo (tilt) para medir a parte com água, mais embaixo.',
    cells: [[-6, 40, 9, 56, 46000], [10, 85, 11, 45, 35000]] },
};
let sc = 'cb', range = 80, tilt = -1.5, alt = 35000, mode = 'wx', gain = 0, radar = null, prof = null, sweep = 0, dirty = true;
// Refletividade (dBZ) num ponto do espaço: forte embaixo, perto do nível de congelamento; o topo de gelo reflete pouco
function dbz(x, y, ft) {
  let best = 0;
  for (const [cx, cy, r, peak, topFt] of SCEN[sc].cells) {
    const d2 = ((x - cx) ** 2 + (y - cy) ** 2) / (r * r);
    if (d2 > 4) continue;
    if (ft > topFt) continue;
    const z = ft / topFt, vert = z < 0.45 ? 1 : z < 0.75 ? lerp(1, 0.55, (z - 0.45) / 0.3) : lerp(0.55, 0.12, (z - 0.75) / 0.25);
    const wob = 1 + 0.08 * Math.sin(x * 0.9 + y * 0.7) + 0.06 * Math.sin(x * 2.3 - y * 1.7);
    const v = peak * Math.exp(-d2 * 1.1) * vert * wob;
    if (v > best) best = v;
  }
  return best;
}
// Feixe de 3,5° de abertura: na distância R ele cobre de alt + R·tan(tilt − 1,75°) até alt + R·tan(tilt + 1,75°)
const NM_FT = 6076;
function beam(R) { return [alt + R * NM_FT * Math.tan((tilt - 1.75) * D2R), alt + R * NM_FT * Math.tan((tilt + 1.75) * D2R)]; }
function colorOf(z) { // escala de cores do radar de bordo
  if (z >= 50) return [230, 40, 220];
  if (z >= 40) return [235, 30, 30];
  if (z >= 30) return [245, 230, 40];
  if (z >= 20) return [40, 200, 60];
  return null;
}
function buildRadar() {
  const { off, S } = radar, oc = off.getContext('2d'), img = oc.createImageData(S, S), cx = S / 2, cy = S * 0.86, Rpx = S * 0.78;
  const NA = 160, NR = 120, grid = [];
  // Ao longo de cada raio: refletividade, eco de solo e a atenuação (o radar perde força atravessando chuva forte)
  for (let ia = 0; ia < NA; ia++) {
    const a = lerp(-50, 50, ia / (NA - 1)) * D2R; let att = 0;
    const row = [];
    for (let ir = 0; ir < NR; ir++) {
      const R = (ir + 0.5) / NR * range, x = R * Math.sin(a), y = R * Math.cos(a), [b0, b1] = beam(R);
      let z = 0;
      for (let k = 0; k <= 4; k++) { const ft = lerp(Math.max(0, b0), Math.max(0, b1), k / 4); if (b1 < 0) break; z = Math.max(z, dbz(x, y, ft)); }
      if (b0 < 0) z = Math.max(z, 22 + 25 * clamp(-b0 / 20000, 0, 1) * (0.5 + 0.5 * Math.sin(x * 3.1) * Math.sin(y * 2.7)));
      z = z + gain - att;
      att += Math.max(0, z - 40) * 0.12 * range / NR;
      let turb = false;
      if (mode === 'wxt' && R < 40 && z > 30) { const dz = Math.abs(dbz(x + 1.5, y, alt) - dbz(x - 1.5, y, alt)) + Math.abs(dbz(x, y + 1.5, alt) - dbz(x, y - 1.5, alt)); turb = dz > 14; }
      row.push([z, turb]);
    }
    grid.push(row);
  }
  for (let py = 0; py < S; py++) for (let px = 0; px < S; px++) {
    const dx = px - cx, dy = cy - py, r = Math.hypot(dx, dy) / Rpx, a = Math.atan2(dx, dy) / D2R;
    if (r > 1 || r <= 0 || Math.abs(a) > 50) continue;
    const ia = Math.round((a + 50) / 100 * (NA - 1)), ir = Math.min(NR - 1, Math.floor(r * NR)), [z, turb] = grid[ia][ir];
    const col = turb ? [230, 40, 220] : colorOf(z);
    if (!col) continue;
    const k = (py * S + px) * 4; img.data[k] = col[0]; img.data[k + 1] = col[1]; img.data[k + 2] = col[2]; img.data[k + 3] = 235;
  }
  oc.putImageData(img, 0, 0);
  dirty = false;
}
function drawND(t) {
  const { c, w, h, off, S } = radar;
  if (dirty) buildRadar();
  c.fillStyle = '#05080b'; c.fillRect(0, 0, w, h);
  // O arco de ±50° precisa caber na largura e, com os números do rumo, na altura
  const Rp = Math.min(w * 0.62, h - 90), cx = w / 2, cy = h - 48, sc2 = Rp / (S * 0.78), ox = cx - S / 2 * sc2, oy = cy - S * 0.86 * sc2;
  const fs = Math.round(clamp(Rp * 0.035, 11, 15));
  // Ecos com a varredura: a antena vai e volta e o setor recém-varrido fica mais vivo
  c.save(); c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, Rp, -Math.PI / 2 - 50 * D2R, -Math.PI / 2 + 50 * D2R); c.closePath(); c.clip();
  c.drawImage(off, ox, oy, S * sc2, S * sc2);
  c.restore();
  sweep = Math.sin(t * 0.9) * 50;
  const sa = (sweep - 90) * D2R;
  c.strokeStyle = 'rgba(120,255,150,.35)'; c.lineWidth = 2; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(sa) * Rp, cy + Math.sin(sa) * Rp); c.stroke();
  // Arcos de distância e a rosa
  const mono = getComputedStyle(document.documentElement).getPropertyValue('--mono') || 'monospace';
  c.strokeStyle = '#e8eef2'; c.lineWidth = 1.5;
  c.beginPath(); c.arc(cx, cy, Rp, -Math.PI / 2 - 52 * D2R, -Math.PI / 2 + 52 * D2R); c.stroke();
  c.setLineDash([4, 6]); c.lineWidth = 1;
  for (const f of [0.25, 0.5, 0.75]) { c.beginPath(); c.arc(cx, cy, Rp * f, -Math.PI / 2 - 52 * D2R, -Math.PI / 2 + 52 * D2R); c.stroke(); }
  c.setLineDash([]);
  c.font = `600 ${fs}px ${mono}`; c.fillStyle = '#e8eef2'; c.textAlign = 'right';
  for (const f of [0.5, 1]) c.fillText(String(range * f), cx - Rp * f * Math.sin(42 * D2R) - 4, cy - Rp * f * Math.cos(42 * D2R) + 4);
  // marcas da bússola no arco (rumo 090 para cima)
  c.textAlign = 'center';
  for (let d = -50; d <= 50; d += 5) {
    const a = (d - 90) * D2R, L = d % 10 ? 7 : 13;
    c.beginPath(); c.moveTo(cx + Math.cos(a) * Rp, cy + Math.sin(a) * Rp); c.lineTo(cx + Math.cos(a) * (Rp + L), cy + Math.sin(a) * (Rp + L)); c.stroke();
    if (!(d % 30)) c.fillText(String(((90 + d + 360) % 360) / 10).padStart(2, '0'), cx + Math.cos(a) * (Rp + 14 + fs), cy + Math.sin(a) * (Rp + 14 + fs) + fs * 0.35);
  }
  // Rota (magenta) e o avião
  c.strokeStyle = '#ff52d9'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx, cy - Rp); c.stroke();
  c.strokeStyle = '#fff'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(cx, cy - 14); c.lineTo(cx, cy + 10); c.moveTo(cx - 12, cy - 2); c.lineTo(cx + 12, cy - 2); c.moveTo(cx - 5, cy + 9); c.lineTo(cx + 5, cy + 9); c.stroke();
  // Anúncios do radar (embaixo, à esquerda, como no ND)
  c.font = `600 ${fs + 1}px ${mono}`; c.textAlign = 'left'; c.fillStyle = '#3fe07a';
  c.fillText(mode === 'wxt' ? 'WX+T' : 'WXR', 10, h - 14 - fs * 1.4);
  c.fillText(`${tilt > 0 ? '+' : ''}${nf(tilt, 1)}°`, 10, h - 14);
  if (gain) { c.fillStyle = '#f2d23a'; c.fillText(gain > 0 ? 'GAIN +' : 'GAIN −', 10 + fs * 5, h - 14); }
  c.textAlign = 'right'; c.fillStyle = '#e8eef2'; c.fillText(`HDG 090 · ${range} NM`, w - 10, h - 14);
}

/* ---------- Corte de lado: o feixe atravessando as nuvens ---------- */
function drawProfile() {
  const { c, w, h } = prof, top = 50000, X = (nm) => 30 + nm / range * (w - 40), Y = (ft) => h - 16 - ft / top * (h - 30);
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0d1a2b'); g.addColorStop(1, '#2a4566');
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  // Fatia vertical das células ao longo da rota (x = 0, de 0 até o alcance)
  const NX = 140, NY = 70, cw = (w - 40) / NX + 1, ch = (h - 30) / NY + 1;
  for (let i = 0; i < NX; i++) for (let j = 0; j < NY; j++) {
    const nm = (i + 0.5) / NX * range, ft = (j + 0.5) / NY * top;
    // A fatia junta o que está até 20 NM de cada lado da rota (é o que o feixe pode varrer)
    let z = 0; for (let xo = -20; xo <= 20; xo += 4) z = Math.max(z, dbz(xo, nm, ft));
    if (z < 12) continue;
    const col = colorOf(z) || [150, 160, 170];
    c.fillStyle = `rgba(${col.join(',')},${z < 20 ? 0.25 : 0.75})`; c.fillRect(X(nm), Y(ft) - ch, cw, ch);
  }
  c.fillStyle = '#3d4f3a'; c.fillRect(0, Y(0), w, 16);
  // o feixe
  const [a0, a1] = [beam(range), beam(0)];
  c.fillStyle = 'rgba(120,255,150,.16)'; c.strokeStyle = 'rgba(120,255,150,.7)'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(X(0), Y(alt)); c.lineTo(X(range), Y(a0[1])); c.lineTo(X(range), Y(a0[0])); c.closePath(); c.fill(); c.stroke();
  // avião e escala
  c.fillStyle = '#fff'; c.beginPath(); c.moveTo(X(0) + 10, Y(alt)); c.lineTo(X(0) - 8, Y(alt) - 5); c.lineTo(X(0) - 8, Y(alt) + 5); c.closePath(); c.fill();
  const mono = getComputedStyle(document.documentElement).getPropertyValue('--mono') || 'monospace';
  c.font = `600 10.5px ${mono}`; c.fillStyle = 'rgba(255,255,255,.8)'; c.textAlign = 'left';
  for (const ft of [10000, 20000, 30000, 40000]) { c.fillText(`${ft / 1000}k`, 2, Y(ft) + 3); c.strokeStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.moveTo(28, Y(ft)); c.lineTo(w, Y(ft)); c.stroke(); }
  c.textAlign = 'center'; for (const f of [0.25, 0.5, 0.75, 1]) c.fillText(`${range * f} NM`, X(range * f) - (f === 1 ? 18 : 0), h - 3);
  void a1;
}

/* ---------- Montagem ---------- */
let raf = 0, active = () => false, last = 0, time = 0, cards = [], atlasDirty = true, profDirty = true;
function setCanvas(cv, hgt) {
  const d = Math.min(2, window.devicePixelRatio || 1), w = cv.clientWidth || 320, h = typeof hgt === 'function' ? hgt(w) : hgt;
  cv.width = w * d; cv.height = h * d; cv.style.height = h + 'px';
  const c = cv.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0);
  return { c, w, h };
}
function size() {
  if (!$('#metAtlas')) return;
  atlas = { ...setCanvas($('#metAtlas'), (w) => Math.round(clamp(w * 0.6, 300, 460))), hits: [] };
  const S = 520, off = document.createElement('canvas'); off.width = off.height = S;
  radar = { ...setCanvas($('#metNd'), (w) => Math.round(clamp(w * 0.62, 300, 480))), off, S };
  prof = setCanvas($('#metProf'), (w) => Math.round(clamp(w * 0.36, 150, 230)));
  cards = [...document.querySelectorAll('#metCards canvas')].map((cv) => ({ id: cv.dataset.cl, ...setCanvas(cv, 120) }));
  dirty = true; atlasDirty = true; profDirty = true;
  cards.forEach((k) => drawCloud(k.c, k.id, k.w, k.h, 0));
}
function frame(t) {
  if (!active()) { raf = 0; return; }
  const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t; time += dt;
  // O atlas e os cartões são desenhos parados (com desfoque, pesados): só redesenham quando algo muda
  if (atlasDirty) { drawAtlas(0); atlasDirty = false; }
  drawND(time);
  if (profDirty) { drawProfile(); profDirty = false; }
  raf = requestAnimationFrame(frame);
}
function start() { size(); showCloud(sel); if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
function showCloud(id) {
  sel = id; atlasDirty = true; const cl = CLOUDS.find((k) => k.id === id); if (!cl) return;
  $('#metName').textContent = `${cl.nome} (${cl.sigla})`;
  $('#metLevel').textContent = `${NIVEL[cl.nivel]} · ${cl.alt}`;
  $('#metHow').textContent = cl.como; $('#metFly').textContent = cl.voo;
  $('#metTags').innerHTML = cl.perigo.map((p) => `<span class="met-tag">${p}</span>`).join('');
  document.querySelectorAll('#metCards [data-cl]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cl === id)));
}
function setScen(id) {
  sc = id; dirty = true; profDirty = true;
  document.querySelectorAll('#metScen [data-sc]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.sc === id)));
  $('#metScenTxt').innerHTML = `<b>${SCEN[id].nome}</b>${SCEN[id].txt}`;
}
function init(opts) {
  if (!$('#metAtlas')) return;
  active = opts.active;
  $('#metCards').innerHTML = CLOUDS.map((k) => `<button type="button" class="met-card" data-cl="${k.id}" aria-pressed="false"><canvas data-cl="${k.id}"></canvas><b>${k.nome} <small>${k.sigla}</small></b><span>${NIVEL[k.nivel]}</span></button>`).join('');
  $('#metCards').addEventListener('click', (e) => { const b = e.target.closest('[data-cl]'); if (b) showCloud(b.dataset.cl); });
  $('#metAtlas').addEventListener('click', (e) => {
    const r = e.currentTarget.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    const hit = atlas.hits.find((q) => x >= q.x0 && x <= q.x1 && y >= q.y0 && y <= q.y1); if (hit) showCloud(hit.id);
  });
  $('#metScen').addEventListener('click', (e) => { const b = e.target.closest('[data-sc]'); if (b) setScen(b.dataset.sc); });
  const tl = $('#metTilt'), to = $('#metTiltO'), al = $('#metAlt'), ao = $('#metAltO');
  tl.addEventListener('input', () => { tilt = tl.value / 2; to.textContent = `${tilt > 0 ? '+' : ''}${nf(tilt, 1)}°`; dirty = true; profDirty = true; });
  al.addEventListener('input', () => { alt = +al.value; ao.textContent = `${nf(alt)} ft`; dirty = true; profDirty = true; });
  $('#metRange').addEventListener('click', (e) => { const b = e.target.closest('[data-rng]'); if (!b) return; range = +b.dataset.rng; dirty = true; profDirty = true; document.querySelectorAll('#metRange [data-rng]').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); });
  $('#metMode').addEventListener('click', (e) => { const b = e.target.closest('[data-md]'); if (!b) return; mode = b.dataset.md; dirty = true; profDirty = true; document.querySelectorAll('#metMode [data-md]').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); });
  $('#metGain').addEventListener('click', (e) => { const b = e.target.closest('[data-g]'); if (!b) return; gain = +b.dataset.g; dirty = true; profDirty = true; document.querySelectorAll('#metGain [data-g]').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); });
  setScen('cb');
}
window.Meteo = { init, start, size };
})();
