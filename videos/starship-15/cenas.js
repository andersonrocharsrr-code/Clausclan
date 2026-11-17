// ================= STARSHIP · VOO 15 — 90,5 s =================
// Cortes acompanham a narração (ver ROTEIRO.md). Estilo rápido na abertura, na volta à torre e no trecho em sépia.
const DUR = 90.5;
const CUTS = [0, 4.6, 9.7, 18.2, 25.0, 30.3, 36.8, 41.2, 45.0, 51.3, 54.8, 60.3, 64.4, 68.0, 72.6, 76.0, 83.0, 85.3, DUR];
const TX = 96, TY = 190; // canto do texto em máquina de escrever

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
  for (let i = 0; i < 6; i++)puff(-14 + i * 6 + sin(t * .7 + i) * 2, 3 + (i % 2) * 2, 7, '255,255,255', .22);
}
const horizon = () => M(0, 0)[1];

// --- 1: Starbase no fim da tarde — avanço rápido até o foguete ---
shot(CUTS[0], CUTS[1], (tl, t) => {
  const u = ease(Math.min(1, tl / 4.6)), cam = { x: lerp(70, 4, u), y: lerp(62, 96, u), z: lerp(2.3, 7.5, u * u) };
  CAM = cam; sky(SKY_GOLD, horizon()); sunGlow(1500 - u * 200, horizon() - 90 - u * 60, 520, '255,200,130');
  cloudsBand(4, 14, 120, 420, 40, 110, '255,236,210', .35, t * 6);
  world(cam, () => pad(t));
  typeText(tl, TX, TY, 'STARBASE · TEXAS', .4, 4.4, { size: 50, sub: '13 DE NOVEMBRO DE 2026' });
});
// --- 2: de perto, subindo pelo foguete ---
shot(CUTS[1], CUTS[2], (tl, t) => {
  const u = ease(Math.min(1, tl / 5.1)), cam = { x: lerp(14, 8, u), y: lerp(34, 132, u), z: 10.5 };
  CAM = cam; sky(SKY_GOLD, horizon()); sunGlow(1640, horizon() - 150, 600, '255,200,130');
  cloudsBand(4, 10, 80, 500, 60, 140, '255,236,210', .3, t * 10);
  world(cam, () => pad(t));
  typeText(tl, TX, TY, 'STARSHIP · 15º VOO', .5, 4.9, { size: 50, sub: 'O MAIOR FOGUETE JÁ CONSTRUÍDO' });
});

// estúdio: foguete em pé no chão, sem torre, para as medidas
function studio(t, cam, o = {}) {
  CAM = cam; sky(SKY_DAY, horizon()); cloudsBand(12, 9, 140, 520, 60, 150, '255,255,255', .32, t * 5);
  world(cam, () => {
    ground('dia');
    c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.ellipse(4, -.6, 16, 1.4, 0, 0, 7); c.fill();
    at(0, 0, 0, () => booster({ pal: 'dia', frost: o.frost || 0 }));
    at(0, 72 + (o.gap || 0), 0, () => ship({ pal: 'dia', frost: o.frost || 0 }));
    if (o.extra) o.extra();
  });
}
function building(x, h, a) { // prédio de 40 andares (3 m por andar)
  if (a <= 0) return; c.save(); c.globalAlpha = a;
  c.fillStyle = lg(x, 0, x + 26, 0, [[0, '#5d6772'], [.55, '#8d99a6'], [1, '#515a64']]); c.fillRect(x, 0, 26, h);
  for (let f = 0; f < Math.floor(h / 3); f++) for (let k = 0; k < 7; k++) { c.fillStyle = (f * 7 + k * 3) % 5 ? 'rgba(190,225,250,.75)' : 'rgba(255,240,190,.9)'; c.fillRect(x + 1.6 + k * 3.4, f * 3 + .8, 2.3, 1.5) }
  c.fillStyle = '#48505a'; c.fillRect(x - .6, h, 27.2, 1.4); c.fillRect(x + 10, h + 1.4, 6, 3);
  c.restore();
}
// --- 3: CAPÍTULO 1 — altura e largura ---
shot(CUTS[2], CUTS[3], (tl, t) => {
  const u = ease(ramp(tl, 0, 8.5)), cam = { x: lerp(42, 46, u), y: 60, z: 6.9 };
  const hB = eo(ramp(tl, 4.2, 5.4));
  studio(t, cam, { extra: () => building(52, 120 * hB, ramp(tl, 4.1, 4.4)) });
  const g = eo(ramp(tl, 1.2, 3.4)), [x0, y0] = M(-17, 0), [, y1] = M(-17, 124 * g);
  dim(x0, y0, x0, y1, '#ffd24a', ramp(tl, 1.1, 1.3));
  label(x0 - 26, y1 + 20, `${Math.round(124 * g)} m`, { size: 76, col: '#ffd24a', align: 'right', a: ramp(tl, 1.2, 1.5) });
  label(x0 - 26, y1 + 70, 'DE ALTURA', { size: 34, align: 'right', a: ramp(tl, 2.6, 3.0) });
  const [bx, by] = M(65, 120 * hB); label(bx, by - 62, 'PRÉDIO DE 40 ANDARES', { size: 36, align: 'center', a: ramp(tl, 4.6, 5.0) }); label(bx, by - 22, '120 m', { size: 34, col: '#cfe6ff', align: 'center', a: ramp(tl, 4.9, 5.3) });
  const wa = ramp(tl, 6.8, 7.1), [wx0, wy] = M(-4.5, -7), [wx1] = M(4.5, -7), wg = eo(ramp(tl, 6.8, 7.4));
  dim(lerp((wx0 + wx1) / 2, wx0, wg), wy, lerp((wx0 + wx1) / 2, wx1, wg), wy, '#6fe0ff', wa);
  label(wx1 + 34, wy + 20, '9 m DE LARGURA', { size: 54, col: '#6fe0ff', a: ramp(tl, 7.0, 7.4) });
  chapter(tl, 1, 'O GIGANTE');
});
// --- 4: as duas partes ---
shot(CUTS[3], CUTS[4], (tl, t) => {
  const u = ease(ramp(tl, 0, 6.8)), gap = 9 * ease(ramp(tl, .2, 1.4)), cam = { x: lerp(40, 44, u), y: 67, z: 6.6 };
  studio(t, cam, { gap });
  const a1 = ramp(tl, 1.5, 1.8), g1 = eo(ramp(tl, 1.5, 2.6)), [x, yb0] = M(12, 0), [, yb1] = M(12, 72 * g1);
  dim(x, yb0, x, yb1, '#ff9a3c', a1);
  const [, ym] = M(12, 36); label(x + 40, ym - 28, 'SUPER HEAVY', { size: 68, col: '#ff9a3c', a: ramp(tl, 1.7, 2.0) }); label(x + 40, ym + 26, 'O PROPULSOR', { size: 38, a: ramp(tl, 2.0, 2.3) }); label(x + 40, ym + 104, '72 m', { size: 84, col: '#fff', a: ramp(tl, 3.2, 3.5) });
  const a2 = ramp(tl, 4.6, 4.9), g2 = eo(ramp(tl, 4.6, 5.5)), [, ys0] = M(12, 72 + gap), [, ys1] = M(12, 72 + gap + 52 * g2);
  dim(x, ys0, x, ys1, '#6fe0ff', a2);
  const [, yn] = M(12, 72 + gap + 26); label(x + 40, yn - 28, 'STARSHIP', { size: 68, col: '#6fe0ff', a: ramp(tl, 4.7, 5.0) }); label(x + 40, yn + 26, 'A NAVE', { size: 38, a: ramp(tl, 4.9, 5.2) }); label(x + 40, yn + 104, '52 m', { size: 84, col: '#fff', a: ramp(tl, 5.5, 5.8) });
});
// --- 5: o peso, abastecida ---
function jumbo(x, y, s, a) { c.save(); c.translate(x, y); c.scale(s, s); c.globalAlpha = a; c.fillStyle = '#f2f4f7'; c.strokeStyle = 'rgba(8,12,18,.8)'; c.lineWidth = 3; c.beginPath(); c.ellipse(0, 0, 44, 7.5, 0, 0, 7); c.fill(); c.stroke(); poly([[-6, 2], [10, 2], [-14, 26], [-22, 26]], '#c9d0d8', 'rgba(8,12,18,.8)', 3); poly([[-40, -2], [-30, -2], [-44, -22], [-49, -22]], '#c8452f', 'rgba(8,12,18,.8)', 3); c.restore() }
shot(CUTS[4], CUTS[5], (tl, t) => {
  const u = ease(ramp(tl, 0, 5.3)), cam = { x: lerp(46, 43, u), y: 60, z: 6.9 }, fr = ease(ramp(tl, .2, 3.6));
  studio(t, cam, { frost: fr, extra: () => { vent(4.5, 33, t, 3, 1); vent(-4.5, 66, t, 5, -1, .8); vent(4.5, 92, t, 8, 1, .7); for (let i = 0; i < 7; i++)puff(-16 + i * 6 + sin(t * .6 + i) * 2, 2 + (i % 2) * 2, 8, '255,255,255', .3 * fr) } });
  const n = 5300 * eo(ramp(tl, .6, 3.9));
  label(820, 400, 'PESO, ABASTECIDA', { size: 44, col: '#ffd24a', a: ramp(tl, .3, .6) });
  label(820, 560, `${fmt(n)} t`, { size: 168, a: ramp(tl, .5, .8) });
  label(820, 630, 'TONELADAS', { size: 44, a: ramp(tl, 2.4, 2.8) });
  for (let i = 0; i < 13; i++)jumbo(870 + (i % 7) * 132, 740 + Math.floor(i / 7) * 74, 1.15, ramp(tl, 3.6 + i * .05, 3.8 + i * .05));
  label(820, 920, '≈ 13 JUMBOS 747 CARREGADOS', { size: 40, col: '#cfe6ff', a: ramp(tl, 4.2, 4.5) });
});

// --- 6: CAPÍTULO 2 — os 33 motores, vistos por baixo ---
const ENG = (() => { const a = []; for (let i = 0; i < 3; i++)a.push([.115, i / 3 * 2 * PI + .5, 0]); for (let i = 0; i < 10; i++)a.push([.43, i / 10 * 2 * PI, 1]); for (let i = 0; i < 20; i++)a.push([.82, i / 20 * 2 * PI + .1, 2]); return a })();
shot(CUTS[5], CUTS[6], (tl, t) => {
  const z = 1 + .12 * ease(ramp(tl, 0, 6.5)), R = 400 * z, cx = 1260, cy = 560, wh = ramp(tl, 5.2, 6.5);
  c.fillStyle = rg(cx, cy, 100, 1300, [[0, '#262b33'], [1, '#07090c']]); c.fillRect(0, 0, W, H);
  c.fillStyle = lg(cx - R, 0, cx + R, 0, [[0, '#3a3e45'], [.4, '#9aa1a9'], [.6, '#70767e'], [1, '#2a2d32']]); c.beginPath(); c.arc(cx, cy, R * 1.06, 0, 7); c.fill();
  c.fillStyle = rg(cx, cy, 0, R, [[0, '#1c1f24'], [1, '#0b0d10']]); c.beginPath(); c.arc(cx, cy, R, 0, 7); c.fill();
  ENG.forEach(([rr, a, ring], i) => {
    const x = cx + cos(a) * rr * R, y = cy + sin(a) * rr * R, r = R * .083, on = ramp(tl, 1.15 + ring * .45 + (i % 5) * .04, 1.4 + ring * .45 + (i % 5) * .04);
    c.fillStyle = rg(x - r * .2, y - r * .2, r * .2, r, [[0, '#2a2d33'], [.7, '#8d949c'], [.88, '#d5dae0'], [1, '#3a3e44']]); c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
    c.fillStyle = '#08090b'; c.beginPath(); c.arc(x, y, r * .66, 0, 7); c.fill();
    if (on > 0) add(() => { const f = 1 + .08 * sin(t * 50 + i * 3); puff(x, y, r * 2.3 * f, '255,140,60', .5 * on); puff(x, y, r * 1.1 * f, '255,225,190', .95 * on); puff(x, y, r * .55, '255,255,255', on) });
  });
  const all = ramp(tl, 2.6, 4.2); add(() => puff(cx, cy, R * (1.6 + wh * 3), '255,170,90', .35 * all + wh * .6));
  typeText(tl, TX, TY, '33 MOTORES', 1.0, 6.3, { size: 60, sub: 'RAPTOR 3' });
  label(TX, 560, 'COMBUSTÍVEL', { size: 34, col: '#ffd24a', a: ramp(tl, 2.6, 2.9) });
  label(TX, 630, 'METANO LÍQUIDO', { size: 52, a: ramp(tl, 2.8, 3.1) });
  label(TX, 700, '+ OXIGÊNIO LÍQUIDO', { size: 52, col: '#9fe0ff', a: ramp(tl, 3.9, 4.2) });
  chapter(tl, 2, 'A FORÇA');
  if (wh > 0) { c.fillStyle = `rgba(255,236,210,${wh * wh})`; c.fillRect(0, 0, W, H) }
});
// --- 7: decolagem ---
shot(CUTS[6], CUTS[7], (tl, t) => {
  const h = 5.2 * tl * tl + 2 * tl, cam = { x: 16 + sin(t * 47) * .5, y: 78 + h * .45 + sin(t * 61) * .45, z: 4.3 };
  CAM = cam; sky(SKY_GOLD, horizon()); sunGlow(1560, horizon() - 120, 560, '255,200,130'); cloudsBand(4, 12, 60, 480, 50, 130, '255,236,210', .3, t * 6);
  world(cam, () => {
    ground('ouro'); farBuildings('ouro'); tower({ phase: 'tras', armY: 112, pal: 'ouro' }); mesa('ouro');
    smokeRoll(tl + 1.6, 0, 70, 21, '236,214,186', { fade: .035 });
    at(0, MESA + h, 0, () => { plume(95, 9, t, 1); booster({ pal: 'ouro', frost: .7, lit: 1 }) });
    at(0, MESA + h + 72, 0, () => ship({ pal: 'ouro', frost: .7 }));
    tower({ phase: 'frente', armY: 112, pal: 'ouro' });
    smokeRoll(tl + 1.6, .4, 50, 33, '250,232,206', { fade: .04 });
    add(() => puff(0, MESA - 4, 60, '255,170,90', .5));
  });
  c.fillStyle = `rgba(255,236,210,${(1 - ramp(tl, 0, .5)) * .9})`; c.fillRect(0, 0, W, H);
  typeText(tl, TX, TY, 'MAIS DE 9.000 t', .4, 4.2, { size: 60, sub: 'DE EMPUXO NA DECOLAGEM' });
});
// --- 8: a nave segue para a órbita com seus 6 motores ---
shot(CUTS[7], CUTS[8], (tl, t) => {
  c.fillStyle = lg(0, 0, 0, H, [[0, '#010207'], [.7, '#071428'], [1, '#12305c']]); c.fillRect(0, 0, W, H); stars(.8, t);
  earthLimb(880 + tl * 8, 3400, t, { seed: 8 });
  c.save(); c.translate(W / 2, H / 2); c.scale(1, -1);
  at(-560 - tl * 46, -150 - tl * 34, -1.1 + tl * .12, () => { c.scale(3.1, 3.1); booster({ pal: 'espaco' }) });
  at(-200 + tl * 30, -40 + tl * 16, -1.22, () => { c.scale(10.5, 10.5); plume(46, 6.5, t, 2, { vac: 1 }); ship({ pal: 'espaco', view: 'lado', lit: 1 }) }, true);
  c.restore();
  typeText(tl, TX, TY, 'A NAVE · 6 MOTORES', .3, 3.6, { size: 50, sub: 'RUMO À ÓRBITA' });
});

// --- 9: CAPÍTULO 3 — em órbita, soltando os satélites ---
shot(CUTS[8], CUTS[9], (tl, t) => {
  c.fillStyle = '#01030a'; c.fillRect(0, 0, W, H); stars(1, t); sunGlow(1700, 150, 260, '200,220,255', .8);
  earthLimb(700, 3000, t * 6, { seed: 15 });
  const sx = 900 + tl * 10, sy = 520 - tl * 3, S = 13;
  c.save(); c.translate(sx, sy); c.scale(1, -1);
  // satélites saindo da fenda, um a um (acelerado)
  const n = Math.floor(clamp((tl - 1.2) / .14, 0, 26));
  for (let i = 0; i < n; i++) { const age = tl - 1.2 - i * .14, x = 30.2 * S + age * (22 + (i % 3) * 5), y = 4.6 * S + age * (60 + (i % 4) * 9) + age * age * 6; at(x, y, .25 + age * .12, () => { c.fillStyle = lg(0, -5, 0, 5, [[0, '#dfe6ee'], [.5, '#8a96a4'], [1, '#2a3038']]); c.fillRect(-34, -4, 68, 8); c.fillStyle = 'rgba(40,70,140,.9)'; c.fillRect(-30, -2.5, 60, 3) }) }
  at(0, 0, -PI / 2, () => { c.scale(S, S); ship({ pal: 'espaco', view: 'lado', slot: 1 }) }, true);
  c.restore();
  typeText(tl, TX, TY, `SATÉLITES STARLINK: ${String(n).padStart(2, '0')}/26`, 1.0, 6.1, { size: 46, cps: 40, sub: 'ALTITUDE: 275 km' });
  chapter(tl, 3, 'A MISSÃO');
});
// --- 10: 14 voltas na Terra ---
shot(CUTS[9], CUTS[10], (tl, t) => {
  c.fillStyle = rg(1180, 560, 100, 1300, [[0, '#0b1a30'], [1, '#02050b']]); c.fillRect(0, 0, W, H); stars(.5, t);
  c.strokeStyle = 'rgba(111,224,255,.06)'; c.lineWidth = 1; for (let x = 0; x < W; x += 80) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke() } for (let y = 0; y < H; y += 80) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke() }
  const cx = 1220, cy = 570, R = 300, tilt = -.38, rx = 430, ry = 120;
  const orb = (a) => [cx + cos(tilt) * cos(a) * rx - sin(tilt) * sin(a) * ry, cy + sin(tilt) * cos(a) * rx + cos(tilt) * sin(a) * ry];
  const ang = tl * 2 * PI * 1.25 + 1;
  const arc = (a0, a1, col, lw) => { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); for (let a = a0; a <= a1; a += .04) { const [x, y] = orb(a); a === a0 ? c.moveTo(x, y) : c.lineTo(x, y) } c.stroke() };
  const dot = () => { const [x, y] = orb(ang); for (let k = 1; k < 26; k++) { const [tx, ty] = orb(ang - k * .035); c.fillStyle = `rgba(255,210,74,${.5 * (1 - k / 26)})`; c.beginPath(); c.arc(tx, ty, 5, 0, 7); c.fill() } add(() => puff(x, y, 34, '255,220,120', .9)); c.fillStyle = '#fff'; c.beginPath(); c.arc(x, y, 8, 0, 7); c.fill() };
  const back = sin(ang % (2 * PI)) < 0;
  arc(PI, 2 * PI, 'rgba(111,224,255,.35)', 3); if (back) dot();
  add(() => puff(cx, cy, R * 1.25, '70,140,255', .35));
  c.fillStyle = rg(cx - 90, cy - 100, 20, R * 1.25, [[0, '#6fb6f2'], [.45, '#1f62b0'], [1, '#061a3c']]); c.beginPath(); c.arc(cx, cy, R, 0, 7); c.fill();
  c.save(); c.beginPath(); c.arc(cx, cy, R, 0, 7); c.clip();
  const q = rng(41); for (let i = 0; i < 46; i++) { const lon = q() * 2 * PI + t * .5, la = (q() - .5) * 2.2, x = cx + sin(lon) * cos(la) * R, y = cy + sin(la) * R; const r = 30 + q() * 60; if (cos(lon) > 0) { c.save(); c.translate(x, y); c.scale(2.4 * Math.max(.25, cos(lon)), .7); puff(0, 0, r, '255,255,255', .32); c.restore() } }
  c.strokeStyle = 'rgba(160,220,255,.2)'; c.lineWidth = 1.5; for (let k = -2; k <= 2; k++) { const y = cy + sin(k * .5) * R; c.beginPath(); c.ellipse(cx, y + 6, cos(k * .5) * R, 16 * cos(k * .5), 0, 0, 7); c.stroke() } for (let k = 0; k < 6; k++) { const a = k * PI / 6 + t * .5; c.beginPath(); c.ellipse(cx, cy, Math.abs(cos(a)) * R, R, 0, 0, 7); c.stroke() }
  c.restore();
  arc(0, PI, 'rgba(111,224,255,.75)', 3.5); if (!back) dot();
  const v = Math.min(14, 1 + Math.floor(ramp(tl, .3, 2.6) * 13.99));
  label(TX, 400, 'VOLTAS NA TERRA', { size: 44, col: '#ffd24a', a: ramp(tl, .1, .4) });
  label(TX, 590, String(v).padStart(2, '0'), { size: 220, a: ramp(tl, .2, .5), font: MONO });
  label(TX + 290, 590, '/14', { size: 90, col: '#9fb6c8', a: ramp(tl, .2, .5), font: MONO });
  label(TX, 690, '22H30 NO ESPAÇO', { size: 48, col: '#9fe0ff', a: ramp(tl, 1.6, 1.9) });
});
// --- 11: a torre espera de braços abertos — avanço rápido ---
shot(CUTS[10], CUTS[11], (tl, t) => {
  const u = ease(Math.min(1, tl / 5.5)), cam = { x: lerp(40, -2, u), y: lerp(64, 100, u), z: lerp(3.0, 8.5, u * u) };
  CAM = cam; sky(SKY_DAY, horizon()); sunGlow(1500, 230, 420, '255,252,244', .5); cloudsBand(22, 12, 100, 520, 50, 130, '255,255,255', .4, t * 7);
  const p = ramp(tl, .8, 5.5); add(() => { for (let k = 0; k < 18; k++)puff(1500 - p * 260 + k * 9, 120 + p * 150 - k * 5, 6, '255,220,180', .5 * (1 - k / 18)); puff(1500 - p * 260, 120 + p * 150, 12, '255,255,255', 1) });
  world(cam, () => { ground('dia'); farBuildings('dia'); tower({ phase: 'tras', armY: 100, pal: 'dia' }); mesa('dia'); tower({ phase: 'frente', armY: 100, pal: 'dia' }) });
  typeText(tl, TX, TY, 'DE VOLTA PARA A TORRE', .3, 5.3, { size: 50, sub: 'PELA PRIMEIRA VEZ' });
});

// --- 12: CAPÍTULO 4 — ninguém pilota ---
shot(CUTS[11], CUTS[12], (tl, t) => {
  c.fillStyle = lg(0, 0, 0, H, SKY_HIGH); c.fillRect(0, 0, W, H); stars(.5 * (1 - 0), t); c.fillStyle = lg(0, 300, 0, H, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(120,180,240,.25)']]); c.fillRect(0, 0, W, H);
  cloudsBand(51, 26, 900, 1080, 50, 120, '255,255,255', .5, t * 30);
  const sx = 760 + tl * 16, sy = 500 + tl * 10, S = 9.5, tilt = -PI / 2 - .5 + sin(t * 1.3) * .015;
  c.save(); c.translate(sx, sy); c.scale(1, -1); at(0, 0, tilt, () => { c.scale(S, S); c.translate(0, -26); ship({ pal: 'dia', view: 'lado', flap: sin(t * 3) * .5 }) }, true); c.restore();
  // mira do computador
  const cy = '#6fe0ff', b = 290, bl = ramp(tl, 1.4, 1.7); c.save(); c.globalAlpha = bl; c.strokeStyle = cy; c.lineWidth = 4;
  for (const [dx, dy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { c.beginPath(); c.moveTo(sx + dx * b, sy + dy * (b * .62 - 50)); c.lineTo(sx + dx * b, sy + dy * b * .62); c.lineTo(sx + dx * (b - 50), sy + dy * b * .62); c.stroke() }
  c.setLineDash([16, 12]); c.lineDashOffset = -t * 60; c.beginPath(); c.moveTo(sx + 240, sy + 120); c.quadraticCurveTo(1500, 700, 1640, 930); c.globalAlpha = bl * ramp(tl, 1.8, 2.4); c.stroke(); c.setLineDash([]);
  c.beginPath(); c.arc(1640, 930, 26 + sin(t * 6) * 4, 0, 7); c.stroke(); c.beginPath(); c.moveTo(1600, 930); c.lineTo(1680, 930); c.moveTo(1640, 890); c.lineTo(1640, 970); c.stroke(); c.restore();
  label(1610, 870, 'TORRE', { size: 34, col: cy, align: 'right', a: ramp(tl, 2.2, 2.5), font: MONO });
  const a = ramp(tl, 1.5, 1.8); label(TX, 860, `ALTITUDE   ${fmt(72 - tl * 2.2)} km`, { size: 36, col: cy, a, font: MONO }); label(TX, 912, `VELOCIDADE ${fmt(24800 - tl * 610)} km/h`, { size: 36, col: cy, a, font: MONO });
  c.fillStyle = `rgba(90,255,140,${a * ((t * 2) % 1 < .6 ? 1 : .25)})`; c.beginPath(); c.arc(TX + 12, 952, 11, 0, 7); c.fill(); label(TX + 36, 964, 'PILOTO AUTOMÁTICO', { size: 36, col: '#5aff8c', a, font: MONO });
  typeText(tl, TX, TY, 'NINGUÉM PILOTA', 1.4, 3.9, { size: 54, sub: 'OS COMPUTADORES GUIAM TUDO' });
  chapter(tl, 4, 'POUSAR SOZINHO');
});
// --- 13: reentrada de barriga ---
shot(CUTS[12], CUTS[13], (tl, t) => {
  c.fillStyle = lg(0, 0, 0, H, [[0, '#010207'], [.6, '#091a36'], [1, '#1c4a8a']]); c.fillRect(0, 0, W, H); stars(.6, t);
  earthLimb(820 - tl * 14, 3600, t * 14, { seed: 23 });
  const sx = 980 + sin(t * 31) * 2, sy = 470 + sin(t * 37) * 2, S = 11.5, q = rng(3);
  c.save(); c.translate(sx, sy); c.scale(1, -1);
  at(0, 0, -PI / 2 - .32, () => {
    c.scale(S, S); c.translate(0, -26);
    add(() => {
      for (let k = 0; k < 170; k++) { const y = q() * 52, d = .4 + q() * .6, ph = (q() + t * (1.3 + q())) % 1, x = -5.5 + ph * 34 * d, yy = y - ph * 58 * d + sin(t * 9 + k) * .7; puff(x, yy, 3 + ph * 7, ph < .2 ? '255,190,150' : '255,95,70', .16 * (1 - ph)) }
      for (let y = -1; y < 53; y += 1.5) { const f = 1 + .18 * sin(t * 27 + y * 1.7); puff(-6.4, y, 6.5 * f, '255,90,60', .34); puff(-5.6, y, 3.4 * f, '255,170,120', .4); puff(-4.9, y, 1.5, '255,235,220', .5) }
    });
    ship({ pal: 'espaco', view: 'lado', heat: .9, flap: sin(t * 4) * .4 });
    
  }, true);
  c.restore();
  typeText(tl, TX, TY, 'REENTRADA DE BARRIGA', .3, 3.4, { size: 50, sub: 'FREANDO NO AR' });
});
// --- 14: queda de barriga, motores e a virada ---
shot(CUTS[13], CUTS[14], (tl, t) => {
  const fall = tl < 2.3 ? tl * 560 : 2.3 * 560 + (tl - 2.3) * 560 - ramp(tl, 2.3, 4.6) * (tl - 2.3) * 330;
  c.fillStyle = lg(0, 0, 0, H, SKY_DAY); c.fillRect(0, 0, W, H); sunGlow(1560, 260, 420, '255,252,244', .5);
  const hy = 1010 - tl * 34; c.fillStyle = lg(0, hy, 0, H, [[0, '#a8cfe4'], [1, '#2f6f9c']]); c.fillRect(0, hy, W, H);
  const q = rng(61); for (let i = 0; i < 16; i++) { const x = q() * W, y0 = q() * 2400, r = 70 + q() * 120, y = ((y0 - fall * (.5 + q() * .5)) % 2400 + 2400) % 2400 - 600; c.save(); c.translate(x, Math.min(y, hy - 30)); c.scale(2.4, 1); puff(0, 0, r, '255,255,255', .5); c.restore() }
  const fl = ease(ramp(tl, 2.3, 3.5)), ang = lerp(-PI / 2, 0, fl) + sin(ramp(tl, 3.5, 4.6) * PI * 2) * .06 * (1 - ramp(tl, 3.5, 4.6)), on = ramp(tl, 1.15, 1.4), S = 9.2;
  c.save(); c.translate(960 - fl * 30, 540 + fl * 40); c.scale(1, -1);
  at(0, 0, ang, () => { c.scale(S, S); c.translate(0, -26); if (on > 0) plume(30 + 10 * fl, 4.6, t, 4, { a: on }); ship({ pal: 'dia', view: 'lado', lit: on > 0, flap: sin(t * 5) * .6 * (1 - fl) }) }, true);
  c.restore();
  if (tl < 2.3) { c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 3; for (let i = 0; i < 26; i++) { const x = q() * W, y = ((q() * H - tl * 1900 * (.6 + q())) % H + H) % H; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - 70 - q() * 90); c.stroke() } }
  typeText(tl, TX, TY, 'LIGA OS MOTORES', 1.0, 4.4, { size: 54, sub: 'E VIRA DE PÉ' });
});
// nave descendo / presa nos braços da torre
function catchScene(t, o) {
  const pal = o.pal || 'dia';
  ground(pal); farBuildings(pal); tower({ phase: 'tras', armY: 100, pal, len: o.len }); mesa(pal);
  if (o.dust) smokeRoll(o.dust, 0, 40, 71, pal === 'por' ? '120,80,80' : '236,226,210', { fade: .07, span: 1.5 });
  at(0, o.y, o.ang || 0, () => { if (o.burn > 0) plume(34 * o.burn, 4.2, t, 6, { a: Math.min(1, o.burn * 2) }); ship({ pal, view: 'lado', lit: o.burn > 0 }) });
  tower({ phase: 'frente', armY: 100, pal, len: o.len });
  if (o.vent) { vent(4.5, o.y + 20, t, 13, 1, .9); vent(-4.5, o.y + 8, t, 17, -1, .7) }
}
// --- 15: agarrada pelos braços da torre ---
shot(CUTS[14], CUTS[15], (tl, t) => {
  const d = eo(ramp(tl, 0, 2.4)), y = lerp(176, 66.5, d) + (tl > 2.4 ? 1.1 * Math.exp(-(tl - 2.4) * 5) * cos((tl - 2.4) * 16) - 1.1 : 0) + (tl > 2.4 ? 1.1 : 0);
  const burn = tl < 2.3 ? 1 - .35 * d : 1 - ramp(tl, 2.3, 2.6), sh = burn * .35;
  const cam = { x: 8 + sin(t * 43) * sh, y: lerp(112, 96, ease(ramp(tl, 0, 2.6))) + sin(t * 57) * sh, z: 6.4 };
  CAM = cam; sky(SKY_DAY, horizon()); sunGlow(1560, 240, 420, '255,252,244', .5); cloudsBand(22, 12, 100, 520, 50, 130, '255,255,255', .4, t * 7);
  world(cam, () => catchScene(t, { y, burn, len: lerp(.72, 1, ease(ramp(tl, 1.5, 2.3))), dust: tl - .6, ang: sin(tl * 3) * .02 * (1 - d) }));
  typeText(tl, TX, TY, 'AGARRADA NO AR', .4, 3.3, { size: 54, sub: 'PELOS BRAÇOS DA TORRE' });
});
// --- 16: a nave 42 em casa ---
shot(CUTS[15], CUTS[16], (tl, t) => {
  const u = ease(ramp(tl, 0, 7)), cam = { x: lerp(6, 34, u), y: lerp(92, 78, u), z: lerp(7.2, 4.4, u) };
  CAM = cam; sky(SKY_DAY, horizon()); sunGlow(1500, 250, 440, '255,252,244', .5); cloudsBand(22, 12, 100, 520, 50, 130, '255,255,255', .4, t * 7);
  world(cam, () => catchScene(t, { y: 66.5, burn: 0, len: 1, dust: tl + 3.2, vent: 1 }));
  typeText(tl, TX, TY, '14 DE NOVEMBRO DE 2026', .4, 6.8, { size: 48, sub: 'NAVE 42 · 22H30 NO ESPAÇO' });
});
// --- 17: o dia anterior, em sépia — o propulsor cai no mar ---
shot(CUTS[16], CUTS[17], (tl, t) => {
  const hy = 760; c.fillStyle = lg(0, 0, 0, hy, SKY_GOLD); c.fillRect(0, 0, W, H); sunGlow(520, hy - 60, 480, '255,200,130');
  cloudsBand(81, 10, 120, 500, 60, 140, '255,236,210', .4, t * 8);
  const y = lerp(-80, hy + 180, ramp(tl, 0, 1.25) ** 1.3), hit = tl - 1.05;
  c.save(); c.translate(1180, y); c.scale(1, -1); at(0, 0, .12, () => { c.scale(5.6, 5.6); booster({ pal: 'ouro' }) }); c.restore();
  c.fillStyle = lg(0, hy, 0, H, [[0, '#e8c898'], [.12, '#6f93a8'], [1, '#1f4258']]); c.fillRect(0, hy, W, H);
  c.strokeStyle = 'rgba(255,240,210,.25)'; c.lineWidth = 3; const q = rng(91); for (let i = 0; i < 40; i++) { const x = q() * W, yy = hy + 12 + q() * 300, w = 30 + q() * 120; c.beginPath(); c.moveTo(x + sin(t + i) * 8, yy); c.lineTo(x + w + sin(t + i) * 8, yy); c.stroke() }
  if (hit > 0) { for (let i = 0; i < 46; i++) { const a = -PI / 2 + (q() - .5) * 1.5, v = 300 + q() * 620, x = 1180 + cos(a) * v * hit * .8, yy = hy + 20 + sin(a) * v * hit + 420 * hit * hit; puff(x, Math.min(yy, hy + 60), 30 + hit * 90 * q(), '255,255,255', clamp(.75 - hit * .45)) } puff(1180, hy + 20, 120 + hit * 260, '255,255,255', clamp(.6 - hit * .4)) }
  sepia(.85);
  typeText(tl, TX, TY, 'PROPULSOR 22', .15, 2.3, { size: 54, cps: 34, sub: 'CAPTURA ABORTADA · CAIU NO MAR', col: '#fff0d8' });
});
// --- 18: fim do dia — a primeira nave a voltar da órbita para casa ---
shot(CUTS[17], CUTS[18], (tl, t) => {
  const u = ease(ramp(tl, 0, 5.2)), cam = { x: lerp(30, 22, u), y: lerp(70, 78, u), z: lerp(4.6, 5.3, u) };
  CAM = cam; sky(SKY_SET, horizon()); sunGlow(1230, horizon() - 40, 620, '255,160,80'); cloudsBand(95, 14, 120, 600, 50, 150, '255,170,120', .32, t * 5);
  world(cam, () => catchScene(t, { y: 66.5, burn: 0, len: 1, pal: 'por', vent: 0 }));
  c.textAlign = 'center';
  const a = ramp(tl, .5, 1.0);
  backing(380, 110, 1160, 230);
  label(W / 2, 200, 'A PRIMEIRA NAVE A VOLTAR', { size: 70, align: 'center', a, col: '#fff6e6' });
  label(W / 2, 290, 'DA ÓRBITA PARA CASA', { size: 70, align: 'center', a: ramp(tl, 1.3, 1.8), col: '#ffd27a' });
  c.fillStyle = '#c8452f'; c.fillRect(W / 2 - 300 * ramp(tl, 1.8, 2.6), 316, 600 * ramp(tl, 1.8, 2.6), 6);
  label(W / 2, 990, 'STARSHIP · VOO 15', { size: 36, align: 'center', a: ramp(tl, 2.4, 2.9), font: MONO, col: '#ffe9c4' });
});
