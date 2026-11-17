// ================= STARSHIP · VOO 15 — 90,5 s =================
// Cortes acompanham a narração (ver ROTEIRO.md). Visual plano, tipo recorte de papel; legenda palavra por palavra (legendas.js).
const DUR = 90.5;
const CUTS = [0, 4.6, 9.7, 18.2, 25.0, 30.3, 36.8, 41.2, 45.0, 51.3, 54.8, 60.3, 64.4, 68.0, 72.6, 76.0, 83.0, 85.3, DUR];
const TX = 110, TY = 170; // canto da placa de texto
const CAPIM = ['#d9c98a', '#b9a557', '#8c8540', '#efe2a8'], GENTE = [[1230, { coat: '#27304a', dark: '#1a2136' }], [1330, { coat: '#9a4a34', dark: '#6c3024', hair: '#5a3a22' }], [1420, { coat: '#d8d2bc', dark: '#a9a48e', hat: '#8c4a3a' }], [1560, { coat: '#3f6a80', dark: '#2a4a5c', hair: '#1c1a18' }], [1650, { coat: '#6b7a4a', dark: '#4a5632', hair: '#3a2a1c' }]];
function plateia(t, a = 1) { c.save(); c.globalAlpha = a; GENTE.forEach(([x, o], i) => person(x, 1075 + (i % 2) * 14, 250 + (i * 37 % 40), o)); c.restore(); grass(t, 31, 150, 860, CAPIM) }

// foguete inteiro na mesa de lançamento, com a torre
function pad(t, o = {}) {
  const pal = o.pal || 'ouro';
  ground(pal); farBuildings(pal);
  tower({ phase: 'tras', armY: o.armY ?? 112, pal, qd: 1 });
  mesa(pal);
  at(0, MESA, 0, () => booster({ pal, frost: o.frost ?? .8 }));
  at(0, MESA + 72, 0, () => ship({ pal, frost: o.frost ?? .8 }));
  tower({ phase: 'frente', armY: o.armY ?? 112, pal });
  vent(4.5, MESA + 33, t, 3, 1); vent(-4.5, MESA + 66, t, 5, -1, .8); vent(4.5, MESA + 90, t, 8, 1, .7);
  for (let i = 0; i < 6; i++)puff(-14 + i * 6 + sin(t * .7 + i) * 2, 1.5 + (i % 2) * 1.5, 4, '252,248,232', .7);
}
const horizon = () => M(0, 0)[1];

// --- 1: Starbase no fim da tarde — avanço rápido até o foguete ---
shot(CUTS[0], CUTS[1], (tl, t) => {
  const u = ease(Math.min(1, tl / 4.6)), cam = { x: lerp(70, 4, u), y: lerp(62, 96, u), z: lerp(2.3, 7.5, u * u) };
  CAM = cam; sky(SKY_GOLD, horizon()); sunGlow(1500 - u * 200, horizon() - 90 - u * 60, 520, '255,236,190');
  cloudsBand(4, 9, 120, 420, 40, 90, '250,244,222', .5, t * 6);
  world(cam, () => pad(t));
  plateia(t, 1 - ramp(tl, 2.6, 3.6));
  typeText(tl, TX, TY, 'STARBASE · TEXAS', .4, 4.4, { sub: '13 DE NOVEMBRO DE 2026' });
});
// --- 2: de perto, subindo pelo foguete ---
shot(CUTS[1], CUTS[2], (tl, t) => {
  const u = ease(Math.min(1, tl / 5.1)), cam = { x: lerp(14, 8, u), y: lerp(34, 132, u), z: 10.5 };
  CAM = cam; sky(SKY_GOLD, horizon()); sunGlow(1640, horizon() - 150, 600, '255,236,190');
  cloudsBand(4, 8, 80, 500, 50, 100, '250,244,222', .5, t * 10);
  world(cam, () => pad(t));
  typeText(tl, TX, TY, 'STARSHIP · 15º VOO', .5, 4.9, { sub: 'O MAIOR FOGUETE JÁ CONSTRUÍDO' });
});

// estúdio: foguete em pé no chão, sem torre, para as medidas
function studio(t, cam, o = {}) {
  CAM = cam; sky(SKY_DAY, horizon()); sunGlow(1650, 190, 420, '255,240,200', .8); cloudsBand(12, 7, 120, 480, 50, 100, '250,246,228', .5, t * 5);
  world(cam, () => {
    ground('dia');
    c.fillStyle = 'rgba(20,22,29,.3)'; c.beginPath(); c.ellipse(5, -.6, 17, 1.3, 0, 0, 7); c.fill();
    at(0, 0, 0, () => booster({ pal: 'dia', frost: o.frost || 0 }));
    at(0, 72 + (o.gap || 0), 0, () => ship({ pal: 'dia', frost: o.frost || 0 }));
    if (o.extra) o.extra();
  });
}
function building(x, h, a) { // prédio de 40 andares (3 m por andar)
  if (a <= 0) return; c.save(); c.globalAlpha = a;
  c.fillStyle = bands(x, 0, x + 26, 0, [[.62, '#8a8f8a'], [1, '#5f666a']]); c.fillRect(x, 0, 26, h);
  for (let f = 0; f < Math.floor(h / 3); f++) for (let k = 0; k < 7; k++) { c.fillStyle = (f * 7 + k * 3) % 5 ? '#3f4a52' : '#f0d58a'; c.fillRect(x + 1.6 + k * 3.4, f * 3 + .8, 2.3, 1.5) }
  c.fillStyle = '#4a5054'; c.fillRect(x - .6, h, 27.2, 1.4); c.fillRect(x + 10, h + 1.4, 6, 3);
  c.restore();
}
// --- 3: CAPÍTULO 1 — altura e largura ---
shot(CUTS[2], CUTS[3], (tl, t) => {
  const u = ease(ramp(tl, 0, 8.5)), cam = { x: lerp(42, 46, u), y: 46, z: 5.6 };
  const hB = eo(ramp(tl, 4.2, 5.4));
  studio(t, cam, { extra: () => building(52, 120 * hB, ramp(tl, 4.1, 4.4)) });
  const g = eo(ramp(tl, 1.2, 3.4)), [x0, y0] = M(-17, 0), [, y1] = M(-17, 124 * g);
  dim(x0, y0, x0, y1, '#f0b94a', ramp(tl, 1.1, 1.3));
  label(x0 - 30, y1 + 70, `${Math.round(124 * g)} m`, { size: 110, col: '#f0b94a', align: 'right', a: ramp(tl, 1.2, 1.5) });
  label(x0 - 30, y1 + 122, 'DE ALTURA', { size: 44, align: 'right', a: ramp(tl, 2.6, 3.0), w: 600 });
  const [bx, by] = M(65, 120 * hB); label(bx + 100, by + 60, 'PRÉDIO DE', { size: 46, a: ramp(tl, 4.6, 5.0), w: 600 }); label(bx + 100, by + 122, '40 ANDARES', { size: 70, a: ramp(tl, 4.6, 5.0) }); label(bx + 100, by + 176, '120 m', { size: 50, col: '#e6d3a0', a: ramp(tl, 4.9, 5.3), w: 600 });
  const wa = ramp(tl, 6.8, 7.1), [wx0, wy] = M(-4.5, -4.5), [wx1] = M(4.5, -4.5), wg = eo(ramp(tl, 6.8, 7.4));
  dim(lerp((wx0 + wx1) / 2, wx0, wg), wy, lerp((wx0 + wx1) / 2, wx1, wg), wy, '#fff6e0', wa);
  label(wx1 + 30, wy + 20, '9 m DE LARGURA', { size: 60, a: ramp(tl, 7.0, 7.4) });
  chapter(tl, 1, 'O GIGANTE');
});
// --- 4: as duas partes ---
shot(CUTS[3], CUTS[4], (tl, t) => {
  const u = ease(ramp(tl, 0, 6.8)), gap = 9 * ease(ramp(tl, .2, 1.4)), cam = { x: lerp(40, 44, u), y: 50, z: 5.3 };
  studio(t, cam, { gap });
  const a1 = ramp(tl, 1.5, 1.8), g1 = eo(ramp(tl, 1.5, 2.6)), [x, yb0] = M(12, 0), [, yb1] = M(12, 72 * g1);
  dim(x, yb0, x, yb1, '#f0b94a', a1);
  const [, ym] = M(12, 36); label(x + 40, ym - 30, 'SUPER HEAVY', { size: 84, col: '#f0b94a', a: ramp(tl, 1.7, 2.0) }); label(x + 40, ym + 22, 'O PROPULSOR', { size: 42, a: ramp(tl, 2.0, 2.3), w: 600 }); label(x + 40, ym + 118, '72 m', { size: 100, a: ramp(tl, 3.2, 3.5) });
  const a2 = ramp(tl, 4.6, 4.9), g2 = eo(ramp(tl, 4.6, 5.5)), [, ys0] = M(12, 72 + gap), [, ys1] = M(12, 72 + gap + 52 * g2);
  dim(x, ys0, x, ys1, '#fff6e0', a2);
  const [, yn] = M(12, 72 + gap + 26); label(x + 40, yn - 30, 'STARSHIP', { size: 84, col: '#f0b94a', a: ramp(tl, 4.7, 5.0) }); label(x + 40, yn + 22, 'A NAVE', { size: 42, a: ramp(tl, 4.9, 5.2), w: 600 }); label(x + 40, yn + 118, '52 m', { size: 100, a: ramp(tl, 5.5, 5.8) });
});
// --- 5: o peso, abastecida ---
function jumbo(x, y, s, a) { c.save(); c.translate(x, y); c.scale(s, s); c.globalAlpha = a; poly([[-6, 2], [10, 2], [-14, 26], [-22, 26]], '#b9b6a2'); pill(0, 0, 88, 15, '#f2ecd6'); c.fillStyle = '#c9c4ac'; c.fillRect(-36, 2, 74, 4); poly([[-40, -2], [-30, -2], [-44, -22], [-49, -22]], '#d9b35a'); c.restore() }
shot(CUTS[4], CUTS[5], (tl, t) => {
  const u = ease(ramp(tl, 0, 5.3)), cam = { x: lerp(46, 43, u), y: 46, z: 5.6 }, fr = ease(ramp(tl, .2, 3.6));
  studio(t, cam, { frost: fr, extra: () => { vent(4.5, 33, t, 3, 1); vent(-4.5, 66, t, 5, -1, .8); vent(4.5, 92, t, 8, 1, .7); for (let i = 0; i < 7; i++)puff(-16 + i * 6 + sin(t * .6 + i) * 2, 1.5 + (i % 2) * 1.5, 4.5, '252,248,232', .8 * fr) } });
  const n = 5300 * eo(ramp(tl, .6, 3.9));
  label(820, 250, 'PESO, ABASTECIDA', { size: 50, col: '#f0b94a', a: ramp(tl, .3, .6), w: 600 });
  label(820, 440, `${fmt(n)} t`, { size: 220, a: ramp(tl, .5, .8) });
  label(820, 510, 'TONELADAS', { size: 50, a: ramp(tl, 2.4, 2.8), w: 600 });
  for (let i = 0; i < 13; i++)jumbo(870 + (i % 7) * 132, 600 + Math.floor(i / 7) * 70, 1.15, ramp(tl, 3.6 + i * .05, 3.8 + i * .05));
  label(820, 760, '= 13 JUMBOS 747 CARREGADOS', { size: 48, col: '#e6d3a0', a: ramp(tl, 4.2, 4.5), w: 600 });
});

// --- 6: CAPÍTULO 2 — os 33 motores, vistos por baixo ---
const ENG = (() => { const a = []; for (let i = 0; i < 3; i++)a.push([.115, i / 3 * 2 * PI + .5, 0]); for (let i = 0; i < 10; i++)a.push([.43, i / 10 * 2 * PI, 1]); for (let i = 0; i < 20; i++)a.push([.82, i / 20 * 2 * PI + .1, 2]); return a })();
shot(CUTS[5], CUTS[6], (tl, t) => {
  const z = 1 + .12 * ease(ramp(tl, 0, 6.5)), R = 400 * z, cx = 1260, cy = 560, wh = ramp(tl, 5.2, 6.5);
  c.fillStyle = '#08080b'; c.fillRect(0, 0, W, H); const rv = ramp(tl, 1.3, 2.6); add(() => glow(cx, cy, R * 2.2, '217,150,70', .1 + .12 * rv));
  disc(cx, cy, R * 1.07, '#3a2c1c'); c.fillStyle = bands(cx - R * 1.07, 0, cx + R * 1.07, 0, [[.3, '#2a2016'], [.62, '#6b5230'], [1, '#2f2418']]); c.beginPath(); c.arc(cx, cy, R * 1.05, 0, 7); c.fill(); disc(cx, cy, R, '#100e0d'); disc(cx, cy, R * .62, '#161311');
  ENG.forEach(([rr, a, ring], i) => {
    const x = cx + cos(a) * rr * R, y = cy + sin(a) * rr * R, r = R * .083, on = ramp(tl, 1.15 + ring * .45 + (i % 5) * .04, 1.4 + ring * .45 + (i % 5) * .04);
    disc(x, y, r, '#8a6a3a'); disc(x, y, r * .9, '#3a2c1c'); disc(x, y, r * .74, '#c9a25a'); disc(x, y, r * .66, '#0b0a09'); c.strokeStyle = 'rgba(240,210,150,.5)'; c.lineWidth = 3; c.beginPath(); c.arc(x, y, r * .5, -2.4, -1.2); c.stroke();
    if (on > 0) { const f = 1 + .06 * sin(t * 50 + i * 3); add(() => glow(x, y, r * 2.6 * f, '255,160,70', .5 * on)); disc(x, y, r * .66 * on, '#f09a3e'); disc(x, y, r * .5 * on * f, '#f8cf6a'); disc(x, y, r * .3 * on, '#fff6dc') }
  });
  const all = ramp(tl, 2.6, 4.2); add(() => glow(cx, cy, R * (1.6 + wh * 3), '255,170,90', .3 * all + wh * .6));
  typeText(tl, TX, TY, '33 MOTORES', 1.0, 6.3, { size: 96, sub: 'RAPTOR 3' });
  label(TX, 470, 'COMBUSTÍVEL', { size: 40, col: '#f0b94a', a: ramp(tl, 2.6, 2.9), w: 600 });
  label(TX, 550, 'METANO LÍQUIDO', { size: 72, a: ramp(tl, 2.8, 3.1) });
  label(TX, 630, '+ OXIGÊNIO LÍQUIDO', { size: 72, col: '#e6d3a0', a: ramp(tl, 3.9, 4.2) });
  chapter(tl, 2, 'A FORÇA');
  if (wh > 0) { c.fillStyle = `rgba(255,240,205,${wh * wh})`; c.fillRect(0, 0, W, H) }
});
// --- 7: decolagem ---
shot(CUTS[6], CUTS[7], (tl, t) => {
  const h = 5.2 * tl * tl + 2 * tl, cam = { x: 16 + sin(t * 47) * .5, y: 78 + h * .45 + sin(t * 61) * .45, z: 4.3 };
  CAM = cam; sky(SKY_GOLD, horizon()); sunGlow(1560, horizon() - 120, 560, '255,236,190'); cloudsBand(4, 8, 60, 480, 50, 100, '250,244,222', .5, t * 6);
  world(cam, () => {
    ground('ouro'); farBuildings('ouro'); tower({ phase: 'tras', armY: 112, pal: 'ouro' }); mesa('ouro');
    smokeRoll(tl + 1.6, 0, 60, 21, '214,196,160');
    at(0, MESA + h, 0, () => { plume(95, 9, t, 1); booster({ pal: 'ouro', frost: .7, lit: 1 }) });
    at(0, MESA + h + 72, 0, () => ship({ pal: 'ouro', frost: .7 }));
    tower({ phase: 'frente', armY: 112, pal: 'ouro' });
    smokeRoll(tl + 1.6, .4, 40, 33, '244,232,204');
    add(() => glow(0, MESA - 4, 70, '255,170,90', .4));
  });
  c.fillStyle = `rgba(255,240,205,${(1 - ramp(tl, 0, .5)) * .9})`; c.fillRect(0, 0, W, H);
  typeText(tl, TX, TY, 'MAIS DE 9.000 t', .4, 4.2, { size: 96, sub: 'DE EMPUXO NA DECOLAGEM' });
});
// --- 8: a nave segue para a órbita com seus 6 motores ---
shot(CUTS[7], CUTS[8], (tl, t) => {
  c.fillStyle = lg(0, 0, 0, H, [[0, '#07080f'], [.7, '#101a2e'], [1, '#1d3350']]); c.fillRect(0, 0, W, H); stars(.8, t);
  earthLimb(880 + tl * 8, 3400, t, { seed: 8 });
  c.save(); c.translate(W / 2, H / 2); c.scale(1, -1);
  at(-560 - tl * 46, -150 - tl * 34, -1.1 + tl * .12, () => { c.scale(3.1, 3.1); booster({ pal: 'espaco' }) });
  at(-200 + tl * 30, -40 + tl * 16, -1.22, () => { c.scale(10.5, 10.5); plume(46, 6.5, t, 2, { vac: 1 }); ship({ pal: 'espaco', view: 'lado', lit: 1 }) }, true);
  c.restore();
  typeText(tl, TX, TY, 'A NAVE · 6 MOTORES', .3, 3.6, { sub: 'RUMO À ÓRBITA' });
});

// --- 9: CAPÍTULO 3 — em órbita, soltando os satélites ---
shot(CUTS[8], CUTS[9], (tl, t) => {
  c.fillStyle = '#07080f'; c.fillRect(0, 0, W, H); stars(1, t); sunGlow(1700, 150, 300, '255,236,190', .9);
  earthLimb(700, 3000, t * 6, { seed: 15 });
  const sx = 900 + tl * 10, sy = 520 - tl * 3, S = 13;
  c.save(); c.translate(sx, sy); c.scale(1, -1);
  // satélites saindo da fenda, um a um (acelerado)
  const n = Math.floor(clamp((tl - 1.2) / .14, 0, 26));
  for (let i = 0; i < n; i++) { const age = tl - 1.2 - i * .14, x = 30.2 * S + age * (22 + (i % 3) * 5), y = 4.6 * S + age * (60 + (i % 4) * 9) + age * age * 6; at(x, y, .25 + age * .12, () => { c.fillStyle = '#f2ecd6'; c.fillRect(-34, -4, 68, 8); c.fillStyle = '#8b96a0'; c.fillRect(-34, -4, 68, 3); c.fillStyle = '#d9b35a'; c.fillRect(-30, .5, 60, 2) }) }
  at(0, 0, -PI / 2, () => { c.scale(S, S); ship({ pal: 'espaco', view: 'lado', slot: 1 }) }, true);
  c.restore();
  typeText(tl, TX, TY, `SATÉLITES STARLINK: ${String(n).padStart(2, '0')}/26`, 1.0, 6.1, { cps: 40, sub: 'ALTITUDE: 275 km' });
  chapter(tl, 3, 'A MISSÃO');
});
// --- 10: 14 voltas na Terra ---
shot(CUTS[9], CUTS[10], (tl, t) => {
  c.fillStyle = '#08090e'; c.fillRect(0, 0, W, H); add(() => glow(1220, 520, 900, '60,100,140', .22)); stars(.6, t);
  const cx = 1220, cy = 500, R = 280, tilt = -.38, rx = 430, ry = 120;
  const orb = (a) => [cx + cos(tilt) * cos(a) * rx - sin(tilt) * sin(a) * ry, cy + sin(tilt) * cos(a) * rx + cos(tilt) * sin(a) * ry];
  const ang = tl * 2 * PI * 1.25 + 1;
  const arc = (a0, a1, col, lw) => { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); for (let a = a0; a <= a1; a += .04) { const [x, y] = orb(a); a === a0 ? c.moveTo(x, y) : c.lineTo(x, y) } c.stroke() };
  const dot = () => { const [x, y] = orb(ang); for (let k = 1; k < 26; k++) { const [tx, ty] = orb(ang - k * .035); c.fillStyle = `rgba(240,185,74,${.6 * (1 - k / 26)})`; c.beginPath(); c.arc(tx, ty, 5, 0, 7); c.fill() } add(() => glow(x, y, 40, '255,210,120', .9)); disc(x, y, 9, '#fff6dc') };
  const back = sin(ang % (2 * PI)) < 0;
  arc(PI, 2 * PI, 'rgba(217,179,90,.4)', 3); if (back) dot();
  disc(cx, cy, R + 14, 'rgba(170,205,205,.3)'); disc(cx, cy, R, '#12334e');
  c.save(); c.beginPath(); c.arc(cx, cy, R, 0, 7); c.clip(); disc(cx - 70, cy - 70, R * .98, '#1d4a66'); disc(cx - 150, cy - 150, R * .7, '#2a6080'); c.restore();
  c.save(); c.beginPath(); c.arc(cx, cy, R, 0, 7); c.clip();
  const q = rng(41); for (let i = 0; i < 46; i++) { const lon = q() * 2 * PI + t * .5, la = (q() - .5) * 2.2, x = cx + sin(lon) * cos(la) * R, y = cy + sin(la) * R; const r = 30 + q() * 60; if (cos(lon) > 0) { pill(x, y, r * 3.2 * Math.max(.25, cos(lon)), r * .42, 'rgba(240,232,205,.6)') } }
  c.strokeStyle = 'rgba(240,232,205,.12)'; c.lineWidth = 1.5; for (let k = -2; k <= 2; k++) { const y = cy + sin(k * .5) * R; c.beginPath(); c.ellipse(cx, y + 6, cos(k * .5) * R, 16 * cos(k * .5), 0, 0, 7); c.stroke() } for (let k = 0; k < 6; k++) { const a = k * PI / 6 + t * .5; c.beginPath(); c.ellipse(cx, cy, Math.abs(cos(a)) * R, R, 0, 0, 7); c.stroke() }
  c.restore();
  arc(0, PI, 'rgba(217,179,90,.9)', 3.5); if (!back) dot();
  const v = Math.min(14, 1 + Math.floor(ramp(tl, .3, 2.6) * 13.99));
  label(TX, 300, 'VOLTAS NA TERRA', { size: 56, col: '#f0b94a', a: ramp(tl, .1, .4), w: 600 });
  label(TX, 560, String(v).padStart(2, '0'), { size: 300, a: ramp(tl, .2, .5) });
  label(TX + 250, 560, '/14', { size: 110, col: '#e6d3a0', a: ramp(tl, .2, .5), w: 600 });
  label(TX, 660, '22H30 NO ESPAÇO', { size: 64, col: '#e6d3a0', a: ramp(tl, 1.6, 1.9) });
});
// --- 11: a torre espera de braços abertos — avanço rápido ---
shot(CUTS[10], CUTS[11], (tl, t) => {
  const u = ease(Math.min(1, tl / 5.5)), cam = { x: lerp(40, -2, u), y: lerp(64, 100, u), z: lerp(3.0, 8.5, u * u) };
  CAM = cam; sky(SKY_DAY, horizon()); sunGlow(1560, 250, 420, '255,240,200', .8); cloudsBand(22, 8, 100, 520, 50, 100, '250,246,228', .5, t * 7);
  const p = ramp(tl, .8, 5.5); for (let k = 0; k < 22; k++)puff(1300 - p * 260 + k * 9, 110 + p * 150 - k * 5, 7 * (1 - k / 22), '240,185,74', .9 * (1 - k / 22)); disc(1300 - p * 260, 110 + p * 150, 9, '#fff6dc');
  world(cam, () => { ground('dia'); farBuildings('dia'); tower({ phase: 'tras', armY: 100, pal: 'dia' }); mesa('dia'); tower({ phase: 'frente', armY: 100, pal: 'dia' }) });
  typeText(tl, TX, TY, 'DE VOLTA PARA A TORRE', .3, 5.3, { sub: 'PELA PRIMEIRA VEZ' });
});

// --- 12: CAPÍTULO 4 — ninguém pilota ---
shot(CUTS[11], CUTS[12], (tl, t) => {
  c.fillStyle = lg(0, 0, 0, H, SKY_HIGH); c.fillRect(0, 0, W, H); stars(.5, t);
  cloudsBand(51, 14, 880, 1080, 50, 110, '240,232,205', .6, t * 30);
  const sx = 760 + tl * 16, sy = 500 + tl * 10, S = 9.5, tilt = -PI / 2 - .5 + sin(t * 1.3) * .015;
  c.save(); c.translate(sx, sy); c.scale(1, -1); at(0, 0, tilt, () => { c.scale(S, S); c.translate(0, -26); ship({ pal: 'dia', view: 'lado', flap: sin(t * 3) * .5 }) }, true); c.restore();
  // mira do computador
  const cy = '#f0b94a', b = 290, bl = ramp(tl, 1.4, 1.7); c.save(); c.globalAlpha = bl; c.strokeStyle = cy; c.lineWidth = 4;
  for (const [dx, dy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { c.beginPath(); c.moveTo(sx + dx * b, sy + dy * (b * .62 - 50)); c.lineTo(sx + dx * b, sy + dy * b * .62); c.lineTo(sx + dx * (b - 50), sy + dy * b * .62); c.stroke() }
  c.setLineDash([16, 12]); c.lineDashOffset = -t * 60; c.beginPath(); c.moveTo(sx + 240, sy + 120); c.quadraticCurveTo(1480, 600, 1640, 790); c.globalAlpha = bl * ramp(tl, 1.8, 2.4); c.stroke(); c.setLineDash([]);
  c.beginPath(); c.arc(1640, 790, 26 + sin(t * 6) * 4, 0, 7); c.stroke(); c.beginPath(); c.moveTo(1600, 790); c.lineTo(1680, 790); c.moveTo(1640, 750); c.lineTo(1640, 830); c.stroke(); c.restore();
  label(1600, 740, 'TORRE', { size: 44, col: cy, align: 'right', a: ramp(tl, 2.2, 2.5) });
  const a = ramp(tl, 1.5, 1.8); label(TX, 640, `ALTITUDE  ${fmt(72 - tl * 2.2)} km`, { size: 46, col: '#e6d3a0', a, w: 600 }); label(TX, 696, `VELOCIDADE  ${fmt(24800 - tl * 610)} km/h`, { size: 46, col: '#e6d3a0', a, w: 600 });
  disc(TX + 12, 742, 11, `rgba(240,185,74,${a * ((t * 2) % 1 < .6 ? 1 : .25)})`); label(TX + 36, 758, 'PILOTO AUTOMÁTICO', { size: 46, col: cy, a });
  typeText(tl, TX, TY, 'NINGUÉM PILOTA', 1.4, 3.9, { size: 96, sub: 'OS COMPUTADORES GUIAM TUDO' });
  chapter(tl, 4, 'POUSAR SOZINHO');
});
// --- 13: reentrada de barriga ---
shot(CUTS[12], CUTS[13], (tl, t) => {
  c.fillStyle = lg(0, 0, 0, H, [[0, '#07080f'], [.6, '#111b2e'], [1, '#1f3852']]); c.fillRect(0, 0, W, H); stars(.6, t);
  earthLimb(840 - tl * 14, 3600, t * 14, { seed: 23 });
  const sx = 980 + sin(t * 31) * 2, sy = 450 + sin(t * 37) * 2, S = 11.5, q = rng(3);
  c.save(); c.translate(sx, sy); c.scale(1, -1);
  at(0, 0, -PI / 2 - .32, () => {
    c.scale(S, S); c.translate(0, -26);
    add(() => glow(-6, 26, 46, '232,116,58', .28));
    // riscos de fogo indo para trás
    for (let k = 0; k < 26; k++) { const y = q() * 54, ph = (q() + t * (1.1 + q())) % 1, L = 10 + q() * 26, w = .5 + q() * 1.1, x0 = -5.6 + ph * 16, y0 = y - ph * 30; c.globalAlpha = .85 * (1 - ph); poly([[x0, y0], [x0 + w, y0 + .4], [x0 + L * .42, y0 - L]], k % 3 ? '#e8743a' : '#f6c25a'); c.globalAlpha = 1 }
    // camada de choque na barriga: três planos
    const layer = (d, col, ph) => { c.fillStyle = col; c.beginPath(); c.moveTo(-4.3, -2.5); for (let y = -2.5; y <= 54; y += 1.5)c.lineTo(-4.5 - d * (1 + .16 * sin(y * .9 - t * 22 + ph)) * Math.min(1, (y + 4) / 8, (56 - y) / 6), y); c.lineTo(-4.3, 54); c.closePath(); c.fill() };
    layer(3.4, '#d9662e', 0); layer(2.3, '#f09a3e', 1); layer(1.3, '#f8cf6a', 2); layer(.55, '#fff6dc', 3);
    ship({ pal: 'espaco', view: 'lado', heat: .9, flap: sin(t * 4) * .4 });
  }, true);
  c.restore();
  typeText(tl, TX, TY, 'REENTRADA DE BARRIGA', .3, 3.4, { sub: 'FREANDO NO AR' });
});
// --- 14: queda de barriga, motores e a virada ---
shot(CUTS[13], CUTS[14], (tl, t) => {
  const fall = tl < 2.3 ? tl * 560 : 2.3 * 560 + (tl - 2.3) * 560 - ramp(tl, 2.3, 4.6) * (tl - 2.3) * 330;
  const hy = 900 - tl * 30; sky(SKY_DAY, hy); sunGlow(1560, 260, 420, '255,240,200', .8);
  c.fillStyle = bands(0, hy, 0, H, [[.12, '#8fb0b0'], [.4, '#6f979f'], [1, '#55808c']]); c.fillRect(0, hy, W, H);
  const q = rng(61); for (let i = 0; i < 12; i++) { const x = q() * W, y0 = q() * 2400, r = 50 + q() * 70, y = ((y0 - fall * (.5 + q() * .5)) % 2400 + 2400) % 2400 - 600; pill(x, Math.min(y, hy - 30), r * 4.6, r * .5, 'rgba(250,246,228,.75)'); pill(x - r * .7, Math.min(y, hy - 30) - r * .34, r * 2.6, r * .46, 'rgba(250,246,228,.75)') }
  const fl = ease(ramp(tl, 2.3, 3.5)), ang = lerp(-PI / 2, 0, fl) + sin(ramp(tl, 3.5, 4.6) * PI * 2) * .06 * (1 - ramp(tl, 3.5, 4.6)), on = ramp(tl, 1.15, 1.4), S = 9.2;
  if (tl < 2.6) { c.globalAlpha = 1 - ramp(tl, 2.2, 2.6); for (let i = 0; i < 22; i++) { const x = q() * W, y = ((q() * H - tl * 1900 * (.6 + q())) % H + H) % H; c.fillStyle = 'rgba(255,250,230,.5)'; c.fillRect(x, y - 110, 3, 70 + q() * 80) } c.globalAlpha = 1 }
  c.save(); c.translate(960 - fl * 30, 480 + fl * 30); c.scale(1, -1);
  at(0, 0, ang, () => { c.scale(S, S); c.translate(0, -26); if (on > 0) plume(30 + 10 * fl, 4.6, t, 4, { a: on }); ship({ pal: 'dia', view: 'lado', lit: on > 0, flap: sin(t * 5) * .6 * (1 - fl) }) }, true);
  c.restore();
  typeText(tl, TX, TY, 'LIGA OS MOTORES', 1.0, 4.4, { size: 96, sub: 'E VIRA DE PÉ' });
});
// nave descendo / presa nos braços da torre
function catchScene(t, o) {
  const pal = o.pal || 'dia';
  ground(pal); farBuildings(pal); tower({ phase: 'tras', armY: 100, pal, len: o.len }); mesa(pal);
  if (o.dust) smokeRoll(o.dust, 0, 34, 71, pal === 'por' ? '90,60,62' : '232,222,196', { span: 1.5, life: 7 });
  at(0, o.y, o.ang || 0, () => { if (o.burn > 0) plume(34 * o.burn, 4.2, t, 6, { a: Math.min(1, o.burn * 2) }); ship({ pal, view: 'lado', lit: o.burn > 0 }) });
  tower({ phase: 'frente', armY: 100, pal, len: o.len });
  if (o.vent) { vent(4.5, o.y + 20, t, 13, 1, .9); vent(-4.5, o.y + 8, t, 17, -1, .7) }
}
const ceuDia = (t) => { sky(SKY_DAY, horizon()); sunGlow(1560, 250, 420, '255,240,200', .8); cloudsBand(22, 8, 100, 520, 50, 100, '250,246,228', .5, t * 7) };
// --- 15: agarrada pelos braços da torre ---
shot(CUTS[14], CUTS[15], (tl, t) => {
  const d = eo(ramp(tl, 0, 2.4)), y = lerp(176, 66.5, d) + (tl > 2.4 ? 1.1 * Math.exp(-(tl - 2.4) * 5) * cos((tl - 2.4) * 16) : 0);
  const burn = tl < 2.3 ? 1 - .35 * d : 1 - ramp(tl, 2.3, 2.6), sh = burn * .35;
  const cam = { x: 8 + sin(t * 43) * sh, y: lerp(112, 92, ease(ramp(tl, 0, 2.6))) + sin(t * 57) * sh, z: 6.4 };
  CAM = cam; ceuDia(t);
  world(cam, () => catchScene(t, { y, burn, len: lerp(.72, 1, ease(ramp(tl, 1.5, 2.3))), dust: tl - .6, ang: sin(tl * 3) * .02 * (1 - d) }));
  typeText(tl, TX, TY, 'AGARRADA NO AR', .4, 3.3, { size: 96, sub: 'PELOS BRAÇOS DA TORRE' });
});
// --- 16: a nave 42 em casa, com gente olhando ---
shot(CUTS[15], CUTS[16], (tl, t) => {
  const u = ease(ramp(tl, 0, 7)), cam = { x: lerp(6, 34, u), y: lerp(92, 74, u), z: lerp(7.2, 4.2, u) };
  CAM = cam; ceuDia(t);
  world(cam, () => catchScene(t, { y: 66.5, burn: 0, len: 1, dust: tl + 3.2, vent: 1 }));
  plateia(t, ramp(tl, 2.2, 3.4));
  typeText(tl, TX, TY, '14 DE NOVEMBRO DE 2026', .4, 6.8, { sub: 'NAVE 42 · 22H30 NO ESPAÇO' });
});
// --- 17: o dia anterior, em sépia — o propulsor cai no mar ---
shot(CUTS[16], CUTS[17], (tl, t) => {
  const hy = 700; sky(SKY_GOLD, hy); sunGlow(520, hy - 70, 480, '255,236,190'); cloudsBand(81, 7, 120, 460, 50, 100, '250,244,222', .5, t * 8);
  const y = lerp(-80, hy + 180, ramp(tl, 0, 1.25) ** 1.3), hit = tl - 1.05, q = rng(91);
  c.save(); c.translate(1180, y); c.scale(1, -1); at(0, 0, .12, () => { c.scale(5.6, 5.6); booster({ pal: 'ouro' }) }); c.restore();
  c.fillStyle = bands(0, hy, 0, H, [[.06, '#c9c7a2'], [.3, '#7f9c9c'], [.62, '#5f8088'], [1, '#476670']]); c.fillRect(0, hy, W, H);
  for (let i = 0; i < 26; i++)pill(q() * W + sin(t + i) * 10, hy + 20 + q() * 280, 60 + q() * 160, 5, 'rgba(250,244,222,.3)');
  if (hit > 0) { const P = []; for (let i = 0; i < 34; i++) { const a = -PI / 2 + (q() - .5) * 1.5, v = 300 + q() * 620; P.push([1180 + cos(a) * v * hit * .8, Math.min(hy + 20 + sin(a) * v * hit + 420 * hit * hit, hy + 50), (26 + q() * 50) * Math.min(1, hit * 6) * (1 - ramp(hit, .5, 1.4))]) } P.forEach(([x, yy, r]) => disc(x + r * .1, yy + r * .14, r, '#b9c4bc')); P.forEach(([x, yy, r]) => disc(x, yy, r * .86, '#f4efdc')) }
  sepia(.85);
  typeText(tl, TX, TY, 'PROPULSOR 22', .15, 2.3, { size: 96, cps: 34, sub: 'CAPTURA ABORTADA · CAIU NO MAR' });
});
// --- 18: fim do dia — a primeira nave a voltar da órbita para casa ---
shot(CUTS[17], CUTS[18], (tl, t) => {
  const u = ease(ramp(tl, 0, 5.2)), cam = { x: lerp(-70, -62, u), y: lerp(64, 70, u), z: lerp(4.6, 5.2, u) };
  CAM = cam; sky(SKY_SET, horizon()); sunGlow(1330, horizon() - 50, 620, '255,200,120'); cloudsBand(95, 9, 120, 560, 50, 110, '240,150,100', .45, t * 5);
  world(cam, () => catchScene(t, { y: 66.5, burn: 0, len: 1, pal: 'por', vent: 0 }));
  c.save(); c.globalAlpha = .9; GENTE.forEach(([x, o], i) => person(x - 760, 1075 + (i % 2) * 14, 250 + (i * 37 % 40), { coat: '#17121a', dark: '#0f0c12', legs: '#0f0c12', hair: '#0f0c12', skin: '#17121a', hat: o.hat ? '#0f0c12' : null })); c.restore(); grass(t, 31, 150, 880, ['#17121a', '#2b2029', '#3a2a30']);
  label(TX, 250, 'A PRIMEIRA NAVE A VOLTAR', { size: 104, a: ramp(tl, .5, 1.0) });
  label(TX, 360, 'DA ÓRBITA PARA CASA', { size: 104, a: ramp(tl, 1.3, 1.8), col: '#f0b94a' });
  c.fillStyle = '#d9b35a'; c.fillRect(TX, 388, 600 * ramp(tl, 1.8, 2.6), 4);
  label(TX, 452, 'STARSHIP · VOO 15', { size: 44, a: ramp(tl, 2.4, 2.9), col: '#e6d3a0', w: 600 });
});
