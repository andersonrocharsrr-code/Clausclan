'use strict';
// O Circo Chegou na Cidade: linha do tempo. Cada instante é desenhado a partir do tempo da música (T.seek(t)).
(() => {
  T.DUR = 171.16; T.BEAT = 0.4164; T.BEAT0 = 0.14;
  const C = T.C, A = T.A;
  const { sin, cos, PI, abs, floor, min, max } = Math;
  const { lerp, ramp, sm, smr, bump, kf, clamp } = T;
  const svg = document.getElementById('palco');
  const ext = T.mkExt(), ring = T.mkRing(), aud = T.mkAud();
  svg.appendChild(ring.g); svg.appendChild(aud.g); svg.appendChild(ext.g);
  const frac = v => v - floor(v);

  // ---------- Elenco ----------
  const N = ['chico', 'magico', 'malabarista', 'bailarina', 'equilibrista'];
  const cast = N.map(k => T.mkPerson(T.ELENCO[k])); cast.push(T.mkLion(), T.mkChar('macaco')); T.KIDS.forEach(k => cast.push(T.mkPerson(k)));
  const CH = 0, MG = 1, ML = 2, BA = 3, EQ = 4, LE = 5, MC = 6, K0 = 7;
  const LY = 872, LS = 1.2, ACT = [960, 925, 1.35], CURT = [960, 668, 0.62], KX = [330, 600, 1270, 1620], KY = 1042, KS = 1.15;
  const path = keys => { const fx = kf(keys.map(k => [k[0], k[1]])), fy = kf(keys.map(k => [k[0], k[2]])), fs = kf(keys.map(k => [k[0], k[3]])); return t => ({ x: fx(t), y: fy(t), s: fs(t), mv: abs(fx(t + 0.04) - fx(t - 0.04)) / 0.08 + abs(fy(t + 0.04) - fy(t - 0.04)) / 0.08 }); };
  const kidPath = j => { const off = j < 2 ? -260 : 2180; return path([[47.5, off, KY, KS], [48.5, KX[j], KY, KS], [60.3, KX[j], KY, KS], [61.2, off, KY, KS], [84.0, off, KY, KS], [85.0, KX[j], KY, KS]]); };
  const POS = [
    path([[7.0, -320, 925, 1.35], [9.6, 960, 925, 1.35], [19.2, 960, 925, 1.35], [20.3, ...CURT], [33.9, ...CURT], [34.8, 960, 905, 1.4], [47.8, 960, 905, 1.4], [48.6, 960, LY, LS], [60.5, 960, LY, LS], [61.3, ...CURT], [87.2, ...CURT], [88.1, 960, LY, LS], [100.5, 960, LY, LS], [101.1, 960, 995, 1.6], [117.6, 960, 995, 1.6], [118.5, 960, LY, LS], [127.5, 960, LY, LS], [128.3, 960, 990, 1.55], [130.9, 960, 990, 1.55], [131.6, 960, 910, 1.4]]),
    path([[19.3, 2250, 925, 1.35], [20.2, 1040, 925, 1.35], [24.4, 1040, 925, 1.35], [24.6, 1200, LY, LS]]),
    path([[24.4, ...ACT], [33.5, ...ACT], [34.4, 720, LY, LS]]),
    path([[60.9, ...CURT], [62.0, ...ACT], [66.9, ...ACT], [67.7, 480, LY, LS]]),
    path([[67.0, 1600, 330, 0.8], [67.7, 1560, 330, 0.8], [70.6, 1010, 341, 0.8], [71.3, 960, 341, 0.8], [73.4, 360, 330, 0.8], [73.8, 300, 330, 0.8], [74.9, 300, LY, 0.9], [75.5, 240, LY, LS]]),
    path([[73.2, 2250, 838, 1.3], [74.2, 1560, 838, 1.3], [87.1, 1560, 838, 1.3], [88.0, 1680, LY, LS]]),
    path([[78.84, 330, 330, 0.9], [80.1, 1000, 925, 1.25], [87.2, 1000, 925, 1.25], [88.0, 1440, LY, LS]]),
    kidPath(0), kidPath(1), kidPath(2), kidPath(3)
  ];
  const HIDE = [[[20.3, 33.9], [61.3, 87.2]], [[0, 19.3]], [[0, 24.4]], [[0, 60.9]], [[0, 67.0]], [[0, 73.2]], [[0, 77.0]]];
  const hidden = (i, t) => { if (i >= K0) return (t > 6.1 && t < 29.5) || (t > 33.75 && t < 47.5) || (t > 61.2 && t < 84.0); for (const [a, b] of HIDE[i]) if (t >= a && t < b) return true; return false; };

  // ---------- Adereços e efeitos ----------
  const props = T.el('g', {}, ring.g), fx = T.el('g', {}, ring.g);
  // cartola do truque (de boca para cima) com o coelho dentro
  const hatP = T.el('g', {}, props);
  hatP.innerHTML = `<defs><clipPath id="sohAcima"><rect x="-300" y="-500" width="600" height="503"/></clipPath></defs><ellipse cx="0" cy="0" rx="54" ry="11" fill="${C.ink}"/><ellipse cx="0" cy="0" rx="38" ry="7" fill="#141a2e"/><g clip-path="url(#sohAcima)"></g><rect x="-36" y="0" width="72" height="80" rx="7" fill="${C.ink}"/><rect x="-36" y="8" width="72" height="15" fill="${C.coral}"/><path d="M-54,0 A54,11 0 0 0 54,0Z" fill="${C.ink}"/>`;
  const rabbit = T.mkChar('coelho'); hatP.children[3].appendChild(rabbit.g);
  const pole = T.g(props, `<rect x="-290" y="-6" width="580" height="12" rx="6" fill="${C.gold}"/><rect x="-290" y="-6" width="60" height="12" rx="6" fill="${C.coral}"/><rect x="230" y="-6" width="60" height="12" rx="6" fill="${C.coral}"/>`);
  const BALLC = [C.coral, C.gold, C.sky, C.green, C.lilac];
  const balls = BALLC.map(c => T.g(fx, `<circle r="19" fill="${c}"/><circle cx="-6" cy="-6" r="6" fill="#fff" opacity=".6"/>`));
  const pool = (n, html, parent) => { const a = []; for (let i = 0; i < n; i++) a.push(T.g(parent || fx, typeof html === 'function' ? html(i) : html)); return a; };
  const dizzy = pool(5, i => `<path d="${A.star4}" fill="${i % 2 ? C.gold : C.goldL}"/>`);
  const sparks = pool(14, `<path d="${A.star4}" fill="#fff"/><path d="${A.star4}" fill="${C.goldL}" transform="scale(.55)"/>`);
  const rings = pool(3, `<path d="M0,-60 A60,60 0 0 1 0,60" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round"/>`);
  const notes = pool(8, i => A.note([C.coral, C.blue, C.lilacD, C.gold][i % 4]));
  const hearts = pool(8, i => `<path d="${A.heart}" fill="${[C.coral, C.pink, C.coralL][i % 3]}"/>`);
  const claps = pool(4, `<path d="${A.star4}" fill="${C.goldL}" transform="scale(2.2)"/>`);
  const CF = [C.coral, C.gold, C.sky, C.green, C.lilac, C.orange, C.pink];
  const top = T.el('g', {}, svg);
  const confetti = pool(110, i => i % 3 ? `<rect x="-10" y="-6" width="20" height="12" rx="2" fill="${CF[i % 7]}"/>` : `<circle r="8" fill="${CF[i % 7]}"/>`, top);
  const shots = pool(60, i => `<rect x="-9" y="-6" width="18" height="12" rx="2" fill="${CF[i % 7]}"/>`, fx);
  const FONT = `font-family="Fredoka, 'Arial Rounded MT Bold', Arial, sans-serif" font-weight="700"`;
  const word = (txt, size, col) => `<text ${FONT} font-size="${size}" text-anchor="middle" fill="${C.cream}" stroke="${C.cream}" stroke-width="${size * 0.22}" stroke-linejoin="round">${txt}</text><text ${FONT} font-size="${size}" text-anchor="middle" fill="${col}">${txt}</text>`;
  const CUES = [[102.34, 'PÁ!', C.coral, 0], [104.42, 'PÁ!', C.blue, 0], [105.98, '1', C.gold, -1], [106.68, '2', C.green, 1], [109.32, '1', C.coral, -1], [109.64, '2', C.gold, 0], [110.04, '3', C.sky, 1]];
  const cues = CUES.map(c => T.g(top, word(c[1], 190, c[2])));
  const curtains = T.mkCurtains(top);
  const msg = T.el('g', {}, top);
  const ml = (txt, y, size) => { const cs = [C.coral, C.gold, C.sky, C.green, C.orange, C.lilacL]; let i = 0; const sp = [...txt].map(ch => ch === ' ' ? ' ' : `<tspan fill="${cs[i++ % 6]}">${ch}</tspan>`).join(''); const a = `x="0" y="${y}" text-anchor="middle" ${FONT} font-size="${size}" letter-spacing="3"`; return `<g><text ${a} transform="translate(0,10)" fill="#3B1F4A" opacity=".4" stroke="#3B1F4A" stroke-width="28" stroke-linejoin="round">${txt}</text><text ${a} fill="${C.cream}" stroke="${C.cream}" stroke-width="28" stroke-linejoin="round">${txt}</text><text ${a}>${sp}</text></g>`; };
  msg.innerHTML = ml('ATÉ A PRÓXIMA', 0, 132) + ml('AVENTURA!', 150, 150);
  const fade = T.el('rect', { width: 1920, height: 1080, fill: '#2B2046' }, top);

  // ---------- Câmera do picadeiro ----------
  const CAM = [[6.8, 960, 540, 1], [9.6, 960, 700, 1.45], [10.2, 960, 700, 1.45], [10.6, 960, 905, 2.5], [11.3, 960, 905, 2.5], [11.8, 960, 640, 2.3], [13.0, 960, 640, 2.3], [13.4, 960, 720, 1.35], [19.3, 960, 720, 1.35],
  [20.2, 1000, 720, 1.45], [21.2, 1000, 720, 1.45], [21.7, 960, 690, 1.9], [23.2, 960, 690, 1.9], [23.7, 1000, 640, 1.5], [26.6, 960, 660, 1.3], [33.4, 960, 660, 1.3],
  [34.6, 960, 620, 1.25], [47.6, 960, 620, 1.25], [48.6, 960, 640, 1.05], [57.4, 960, 640, 1.05], [58.2, 960, 540, 1], [60.9, 960, 540, 1],
  [61.9, 960, 700, 1.4], [63.9, 960, 700, 1.4], [64.3, 960, 915, 2.5], [65.4, 960, 915, 2.5], [65.9, 960, 690, 1.3], [67.0, 960, 690, 1.3],
  [67.7, 1280, 360, 1.5], [70.4, 1010, 360, 1.5], [71.0, 990, 250, 2.2], [73.2, 640, 270, 2.0], [73.6, 640, 360, 1.5], [74.7, 1300, 690, 1.3], [75.5, 1300, 690, 1.3], [75.9, 1400, 640, 1.5], [77.3, 1400, 640, 1.5],
  [77.9, 880, 560, 1.08], [80.2, 880, 560, 1.08], [81.0, 1000, 780, 1.5], [83.8, 1000, 780, 1.5], [84.6, 960, 640, 1.15], [87.2, 960, 640, 1.15], [88.1, 960, 540, 1], [91.2, 960, 540, 1],
  [91.7, 560, 700, 1.4], [94.4, 1360, 700, 1.4], [95.0, 960, 540, 1], [100.5, 960, 540, 1], [101.1, 960, 640, 1.1], [113.7, 960, 640, 1.1], [114.1, 960, 700, 1.9], [115.3, 960, 700, 1.9], [115.7, 960, 680, 1.4], [117.5, 960, 680, 1.4],
  [118.5, 960, 540, 1], [121.5, 960, 540, 1], [122.0, 1300, 650, 1.55], [124.4, 1300, 650, 1.55], [124.9, 960, 540, 1], [127.7, 960, 540, 1], [128.3, 960, 720, 1.35], [130.8, 960, 720, 1.35], [131.6, 960, 540, 1], [134.5, 960, 540, 1],
  [135.0, 560, 700, 1.4], [137.6, 1360, 700, 1.4], [138.2, 960, 540, 1], [144.4, 960, 560, 1.06], [150.5, 960, 560, 1.06], [151.0, 560, 700, 1.4], [154.2, 1360, 700, 1.4], [154.9, 960, 560, 1.1], [158.5, 960, 540, 1]];
  const camX = kf(CAM.map(k => [k[0], k[1]])), camY = kf(CAM.map(k => [k[0], k[2]])), camZ = kf(CAM.map(k => [k[0], k[3]]));
  const camT = (g, cx, cy, z) => { cx = clamp(cx, 960 / z, 1920 - 960 / z); cy = clamp(cy, 540 / z, 1080 - 540 / z); T.setT(g, `translate(960,540) scale(${z.toFixed(4)}) translate(${(-cx).toFixed(1)},${(-cy).toFixed(1)})`); };
  const setParent = (o, p) => { if (o.g.parentNode !== p) p.appendChild(o.g); };

  // ---------- Coreografias comuns ----------
  const CHO = [34.92, 88.22, 131.50];
  function chorus(p, i, r, t) {
    const b = T.beat(t), sw = T.swing(t, 2), w = sin(t * 9 + i);
    p.mouth = T.sing(t, i * 0.01);
    const jump = (tp, h, d) => { const u = bump(r, tp, d || 0.5); if (u > 0) { p.y -= h * p.s * u; p.aL = p.aR = 160; } p.sq += 0.1 * bump(r, tp - 0.13, 0.13); };
    if (r < 3.1) { p.aL = 30 + 130 * max(bump(r, 0.15, 0.7), bump(r, 1.85, 1.0)); p.aR = 30 + 130 * max(bump(r, 1.0, 0.7), bump(r, 1.85, 1.0)); p.y -= 26 * p.s * (bump(r, 0.15, 0.4) + bump(r, 1.0, 0.4) + bump(r, 1.85, 0.4)); p.rot = 5 * sw; }
    else if (r < 6.8) { const c = bump(frac(b), 0, 0.5); p.aL = p.aR = lerp(46, -36, c); p.rot = 4 * sw; p.head = -4 * sw; p.clap = c; }
    else if (r < 8.35) { jump(6.9, 120); jump(7.7, 120); }
    else if (r < 10.0) { const u = ramp(r, 8.4 + i * 0.03, 9.7 + i * 0.03); p.flip = cos(2 * PI * sm(u) * 1.5) > 0 ? cos(2 * PI * sm(u) * 1.5) : cos(2 * PI * sm(u) * 1.5); p.y -= 40 * p.s * sin(PI * u); p.aL = p.aR = 150; }
    else { p.aL = 100 + 60 * sin(PI * b); p.aR = 100 - 60 * sin(PI * b); p.rot = 6 * sw; p.head = -6 * sw; p.x += 30 * T.swing(t, 4); p.lL = 12 * max(0, sin(PI * b)); p.lR = 12 * max(0, -sin(PI * b)); }
  }
  function brincar(p, i, t) {   // "Êê, vamos brincar... vamos cantar... pode comemorar... alegria em todo lugar"
    const b = T.beat(t), sw = T.swing(t, 4); p.mouth = T.sing(t, i * 0.01);
    if (t < 49.5 || (t > 51.7 && t < 52.8)) { p.aL = 150 + 24 * sw; p.aR = 150 - 24 * sw; p.rot = 9 * sw; p.head = 6 * sw; }
    else if (t < 51.7) { p.y -= 60 * p.s * (bump(t, 49.9, 0.45) + bump(t, 50.7, 0.45)); p.aL = 110 + 50 * sin(PI * b); p.aR = 110 - 50 * sin(PI * b); }
    else if (t < 54.2) { p.aL = p.aR = 70 + 12 * sin(t * 9); p.head = -8 + 5 * sw; p.mouth = max(0.4, p.mouth); p.rot = 5 * sw; }
    else if (t < 57.8) { p.y -= 110 * p.s * (bump(t, 54.5, 0.5) + bump(t, 56.2, 0.5)); p.aL = 150 + 16 * sin(t * 10 + i); p.aR = 150 - 16 * sin(t * 10 + i); p.grin = t > 56.7; }
    else { const u = ramp(t, 58.1 + i * 0.05, 59.0 + i * 0.05); p.flip = cos(2 * PI * sm(u)); p.aR = 150 + 26 * sin(t * 10 + i); p.aL = 40; p.rot = 4 * T.swing(t, 2); }
  }
  function interativo(p, i, t) {
    const sw = T.swing(t, 2), w = sin(t * 9 + i); p.mouth = i === CH ? T.sing(t) : 0;
    if (t < 104.44) { const c = max(bump(t, 102.2, 0.3), bump(t, 104.28, 0.3)), pre = max(smr(t, 101.2, 101.8) * (1 - ramp(t, 102.1, 102.2)), smr(t, 102.9, 103.5) * (1 - ramp(t, 104.2, 104.3))); p.aL = p.aR = lerp(lerp(30, 75, pre), -38, c); p.clap = c; p.y -= 10 * c; }
    else if (t < 107.5) { for (const tp of [105.98, 106.68]) { const u = bump(t, tp - 0.05, 0.55); if (u > 0) { p.y -= 130 * p.s * u; p.aL = p.aR = 150; } p.sq += 0.12 * bump(t, tp - 0.2, 0.15); } }
    else if (t < 110.8) { p.aL = p.aR = 120; for (const tp of [109.32, 109.64, 110.04]) { const u = ramp(t, tp - 0.05, tp + 0.3); if (u > 0 && u < 1) p.flip = cos(2 * PI * u); } if (t < 109.2) { p.rot = 6 * sw; p.aL = p.aR = 60; } }
    else if (t < 112.3) { const u = T.pop(t, 110.9, 0.35); p.aL = p.aR = lerp(20, 172, u) + 5 * w; p.y -= 14 * p.s * u; p.head = -6; }
    else if (t < 113.95) { const u = smr(t, 112.36, 112.75); p.sq = 0.24 * u; p.aL = p.aR = lerp(172, 4, u); p.head = 16 * u; p.look = 0; p.blink = false; }
    else if (t < 115.42) { p.tongue = true; p.aL = 125 + 22 * sin(t * 22); p.aR = 125 - 22 * sin(t * 22); p.head = 12 * sin(t * 12 + i); p.blink = true; p.rot = 4 * sin(t * 12); }
    else { p.grin = true; const u = T.pop(t, 115.46, 0.4); p.aL = p.aR = lerp(20, 78, u); p.y -= 10 * p.s * T.bounce(t); p.head = 5 * sw; }
  }
  function final(p, i, t) {
    const sw = T.swing(t, 2);
    if (t < 148.0) { const B = smr(t, 145.6, 146.3) * (1 - smr(t, 147.3, 147.9)); p.sq = 0.2 * B; p.head = 22 * B; p.aL = p.aR = lerp(40, 0, B); p.blink = B > 0.5 || p.blink; }
    else if (t < 150.7) { p.aL = 150 + 16 * sin(t * 9 + i); p.aR = 150 - 16 * sin(t * 9 + i); p.y -= 90 * p.s * bump(t, 149.4, 0.5); p.grin = t > 149.4; }
    else { const alt = i % 2; p.aR = alt ? 30 : 150 + 28 * sin(t * 10 + i); p.aL = alt ? 150 - 28 * sin(t * 10 + i) : 30; p.rot = 4 * sw; p.head = 5 * sw; p.grin = t > 155.5 && (t < 157.5 || (floor(t / 2.2) + i) % 2 === 0); p.mouth = t < 157 ? T.sing(t, i * 0.01) : 0; if (i >= K0) p.y -= 50 * p.s * bump(frac((t + i * 0.7) / 3.2) * 3.2, 0, 0.5); }
  }

  function poseOf(i, t) {
    const P = POS[i](t), b = T.beat(t), bn = T.bounce(t), sw = T.swing(t, 2);
    const p = { x0: P.x, y0: P.y, x: P.x, y: P.y, s: P.s, rot: 0, head: 4 * sin(PI * b * 0.5 + i * 1.3), aL: 14, aR: 14, lL: 0, lR: 0, kL: 0, kR: 0, mouth: 0, blink: ((t + i * 0.83) % 3.4) < 0.13, look: 0, sq: 0, flip: 1, wag: sin(t * 5 + i), tt: t };
    if (P.mv > 50) { const st = sin(t * 15 + i); p.lL = 16 * max(0, st); p.lR = 16 * max(0, -st); p.y -= 8 * p.s * abs(st); p.rot = 4 * st; p.aL = 30 + 20 * st; p.aR = 30 - 20 * st; return act(p, i, t, true); }
    p.y -= 5 * p.s * bn;
    // seções em grupo
    for (const c0 of CHO) { const r = t - c0; if (r >= 0 && r < (c0 > 131 ? 12.86 : 13.5)) { chorus(p, i, r, t); if (i === MC && r > 3.1 && r < 6.8) drumming(p, t); return p; } }
    if (t >= 48.4 && t < 60.4) { brincar(p, i, t); return p; }
    if (t >= 101.14 && t < 117.7) { interativo(p, i, t); return p; }
    if (t >= 144.3) { final(p, i, t); return p; }
    return act(p, i, t, false);
  }
  function drumming(p, t) { const b = T.beat(t), hl = bump(frac(b), 0, 0.3), hr = bump(frac(b + 0.5), 0, 0.3); p.aL = lerp(125, -8, hl); p.aR = lerp(125, -8, hr); p.head = 6 * sin(PI * b); p.hit = max(hl, hr); p.mouth = 0.4; }
  // números de cada artista e reações
  function act(p, i, t, walking) {
    const b = T.beat(t), bn = T.bounce(t), sw = T.swing(t, 2), w = sin(t * 9 + i);
    if (i === CH) {
      if (t < 9.7) { p.aR = 150 + 26 * sin(t * 10); p.kL = 16 * max(0, sin(t * 15)); p.kR = 16 * max(0, -sin(t * 15)); p.grin = true; }
      else if (t < 11.5) { const k = smr(t, 10.2, 10.5); p.kL = k * 22 * max(0, sin(t * 13)); p.kR = k * 22 * max(0, -sin(t * 13)); p.lL = k * 14 * max(0, sin(t * 13)); p.lR = k * 14 * max(0, -sin(t * 13)); p.aL = p.aR = 50; p.head = 10; p.look = 0; }
      else if (t < 13.2) { const u = smr(t, 11.5, 11.9) * (1 - smr(t, 12.9, 13.2)); p.aL = p.aR = lerp(30, 166, u); p.head = 9 * sin(t * 6) * u; p.grin = true; }
      else if (t < 15.35) { const u = ramp(t, 13.7, 15.2); p.sq = 0.16 * bump(t, 13.35, 0.35); p.rot = 360 * sm(u); p.y -= 190 * sin(PI * u); p.aL = p.aR = 150 * (u > 0 ? 1 : 0.3); p.mouth = u > 0 ? 0.8 : 0; }
      else if (t < 16.84) { p.y += 46; p.kL = p.kR = 64; p.sq = 0.16 * bump(t, 15.35, 0.3); p.aL = p.aR = 44; p.head = 9 * sin(t * 7); p.mouth = 0.7; p.blink = frac(t * 2.2) < 0.5; p.dizzy = 1; }
      else if (t < 18.1) { p.y -= 70 * bump(t, 16.84, 0.5); p.grin = true; p.aL = p.aR = lerp(40, 150, T.pop(t, 16.9, 0.4)); }
      else if (t < 19.3) { p.rot = 11 * sin(t * 13); p.aL = 90 + 60 * sin(t * 12); p.aR = 90 - 60 * sin(t * 12); p.grin = true; p.lL = 12 * max(0, sin(t * 13)); p.lR = 12 * max(0, -sin(t * 13)); }
      else if (t > 127.6 && t < 131.5) { p.aR = 105 + 45 * sin(t * 9); p.aL = 34; p.grin = true; p.head = 6 * sw; p.y -= 8 * bn * p.s; }
      else if (walking) { p.aR = 150 + 20 * sin(t * 10); }
    }
    if (i === MG) {
      if (t < 20.2) { }
      else if (t < 24.4) { p.hatOff = t > 20.45; p.aL = lerp(14, 62, smr(t, 20.3, 20.9)); const tap = bump(t, 21.3, 0.45); p.aR = lerp(lerp(30, 120, smr(t, 20.9, 21.25)), 46, tap > 0 ? tap : 0); if (t > 21.8) { p.aR = 150 + 10 * w; p.grin = true; } if (t > 23.3) { p.aR = lerp(60, 172, T.pop(t, 23.4, 0.35)); p.grin = false; p.mouth = 0.6; p.head = -8; } p.look = t < 23.3 ? -1 : 0; }
      else if (t > 121.8 && t < 124.8) { p.aR = 120 + 44 * sin(2 * PI * b); p.aL = 60 + 30 * sin(2 * PI * b + 1); p.head = 6 * sin(PI * b); }
    }
    if (i === ML && t < 33.6) { p.aL = 52 + 18 * sin(t * 6.9); p.aR = 52 - 18 * sin(t * 6.9); p.head = -7 + 3 * sin(t * 3.4); p.mouth = 0.3; }
    if (i === BA) {
      if (t < 61.3) { }
      else if (t < 64.05) { p.flip = cos(2 * PI * 1.5 * (t - 61.3)); p.aL = p.aR = 158; p.lR = 34; p.kR = 30; p.y -= 12; p.head = 0; }
      else if (t < 65.55) { const st = sin(t * 20); p.lL = 12 * max(0, st); p.lR = 12 * max(0, -st); p.y -= 10; p.aL = p.aR = 96; p.x += 40 * sin((t - 64.05) * 2.1); }
      else if (t < 66.9) { const u = smr(t, 65.6, 66.0) * (1 - smr(t, 66.6, 66.9)); p.rot = -9 * u; p.aL = lerp(40, 100, u); p.aR = lerp(40, 165, u); p.kL = 58 * u; p.lL = 20 * u; p.y -= 10 * u; p.grin = true; }
      else if (walking) { p.aL = p.aR = 96; }
    }
    if (i === EQ) {
      if (t < 73.5) { const st = sin(t * 5.2); p.aL = p.aR = 86; p.rot = 4.5 * sin(t * 3.1) + 2.5 * sin(t * 7.3) + 9 * bump(t, 70.6, 0.8) * sin(t * 11); p.lL = 9 * max(0, st); p.lR = 9 * max(0, -st); p.y += 0; p.tongue = t > 70.7 && t < 73.3; p.head = 5 * sin(t * 3.1); p.pole = 1; }
      else if (t < 75.0) { p.aL = p.aR = 168; p.rot = 0; p.mouth = 0.7; p.lL = p.lR = 0; p.kL = p.kR = 14; }
    }
    if (i === LE) {
      if (!walking && t < 87.2) { const r = smr(t, 75.6, 75.9) * (1 - smr(t, 77.2, 77.5)); p.roar = r; p.rot = -5 * r; p.aL = p.aR = 14 + 60 * r + (t < 75.6 ? 110 * bump(t, 74.6, 0.8) : 0); p.wag = sin(t * 8); if (t > 77.5 && t < 78.6) { p.grin = true; p.y -= 14 * abs(sin(t * 14)); } if (t > 78.8 && t < 80.2) { p.look = -1; p.head = -8; p.sq = 0.14 * bump(t, 79.3, 0.6); } if (t > 81.2) { p.aL = 90 + 50 * sin(PI * b); p.aR = 90 - 50 * sin(PI * b); p.rot = 5 * sw; } }
      if (t > 121.5 && t < 124.8) { p.trumpet = true; p.aR = 96; p.head = -6 + 4 * sin(2 * PI * b); p.y -= 8 * bn; }
    }
    if (i === MC) {
      if (t < 78.84) { p.s *= T.pop(t, 77.0, 0.4); p.y -= 36 * abs(sin(t * 9)); p.aL = p.aR = 150; p.mouth = 0.7; }
      else if (t < 80.1) { const u = ramp(t, 78.84, 80.1); p.x = lerp(330, 1000, u); p.y = lerp(330, 925, u * u) - 250 * sin(PI * u); p.rot = 720 * sm(u); p.aL = p.aR = 160; p.mouth = 0.9; p.s = lerp(0.9, 1.25, u); }
      else if (t < 81.2) { p.sq = 0.2 * bump(t, 80.1, 0.3); p.y -= 30 * abs(sin((t - 80.1) * 9)) * (t > 80.4 ? 1 : 0); p.mouth = 0.8; p.aL = p.aR = 120 + 30 * w; p.wag = sin(t * 14); }
      else if (t < 87.2 || (t > 121.8 && t < 124.8)) drumming(p, t);
    }
    if (i >= K0) {
      if (t > 84.9 && t < 88.2) { p.aL = 100 + 60 * sin(PI * b); p.aR = 100 - 60 * sin(PI * b); p.rot = 7 * sw; p.x += 34 * T.swing(t, 4); p.lL = 14 * max(0, sin(PI * b)); p.lR = 14 * max(0, -sin(PI * b)); const u = ramp(t, 86.3 + (i - K0) * 0.08, 87.1 + (i - K0) * 0.08); p.flip = cos(2 * PI * sm(u)); p.grin = true; }
    }
    // todos os que estão no palco fora do seu número
    if (t > 118.5 && t < 131.5 && !(i === CH && t > 127.6)) {
      if (t < 121.8) { p.aL = 150 + 22 * T.swing(t, 4); p.aR = 150 - 22 * T.swing(t, 4); p.head = -8; p.rot = 5 * T.swing(t, 4); p.mouth = 0.4; }
      else if (t < 124.8) { if (i !== MG && i !== LE && i !== MC) { p.aL = 100 + 50 * sin(PI * b); p.aR = 100 - 50 * sin(PI * b); p.rot = 6 * sw; } }
      else if (t < 127.9) { p.y -= 110 * p.s * (bump(t, 125.0, 0.5) + bump(t, 126.6, 0.5)); p.aL = 150 + 14 * w; p.aR = 150 - 14 * w; p.head = -8; p.mouth = 0.6; }
      else { p.aL = 100 + 60 * sin(PI * b); p.aR = 100 - 60 * sin(PI * b); p.rot = 6 * sw; p.y -= 8 * bn * p.s; }
    }
    // plateia do palco: quem já se apresentou acompanha o número dos outros
    if (!walking && i < K0 && t > 24.6 && t < 88.1 && p.y0 === LY && !(i === MC)) { p.look = p.x0 < 960 ? 1 : -1; if (frac(b / 4) < 0.5) { const c = bump(frac(b), 0, 0.5); p.aL = p.aR = lerp(44, -34, c); } p.grin = t > 77.5 && t < 81.2; }
    return p;
  }

  // ---------- Desenha um instante ----------
  let lastOrder = '';
  function seek(t) {
    t = clamp(t, 0, T.DUR);
    const b = T.beat(t), bn = T.bounce(t);
    const extK = t < 6.5 ? 1 : ramp(t, 23.85, 24.25) * (1 - ramp(t, 26.5, 26.9)), audK = ramp(t, 29.55, 29.9) * (1 - ramp(t, 33.35, 33.7));
    T.show(ext.g, extK > 0); ext.g.style.opacity = extK; T.show(aud.g, audK > 0); aud.g.style.opacity = audK; T.show(ring.g, t >= 6.5);
    if (extK > 0) { const first = t < 6.5, z = first ? lerp(1, 1.4, smr(t, 0.3, 6.3)) : lerp(1.12, 1.2, ramp(t, 23.8, 27)); camT(ext.g, 960, first ? lerp(540, 690, smr(t, 0.3, 6.3)) : 560, z); ext.update(t, first ? 40 * smr(t, 0, 6) - 20 : 0, first ? 0 : 1); }
    if (audK > 0) { camT(aud.g, 960, 600 - 30 * smr(t, 29.6, 33.6), lerp(1.05, 1.18, smr(t, 29.6, 33.6))); aud.update(t); }

    // crianças fora do picadeiro
    const kidsExt = t < 6.5, kidsAud = t > 29.4 && t < 33.75;
    for (let j = 0; j < 4; j++) {
      const c = cast[K0 + j], i = K0 + j;
      if (kidsExt) {
        setParent(c, ext.slot); T.show(c.g, t < 6.1);
        const sx = [600, 790, 1140, 1330][j], sy = [1000, 1035, 1035, 1000][j], off = j < 2 ? -200 : 2120, u = smr(t, 0.2 + j * 0.15, 1.8 + j * 0.1), v = smr(t, 4.5 + j * 0.12, 5.9 + j * 0.05), st = sin(t * 15 + j);
        const p = { x: lerp(lerp(off, sx, u), 960 + (j - 1.5) * 26, v), y: lerp(sy, 872, v), s: lerp(1.05, 0.42, v), aL: 14, aR: 14, blink: ((t + j) % 3.1) < 0.13, mouth: T.sing(t, j * 0.02) };
        if (u < 1 || v > 0) { p.lL = 16 * max(0, st); p.lR = 16 * max(0, -st); p.y -= 8 * abs(st) * p.s; p.aL = 130; p.aR = 130; p.rot = 4 * st; }
        else { p.y -= 80 * (bump(t, 2.2 + j * 0.08, 0.5) + bump(t, 3.5 + j * 0.08, 0.5)); p.aL = 150 + 20 * sin(t * 10 + j); p.aR = j % 2 ? 150 - 20 * sin(t * 10 + j) : 100; p.grin = t > 3.9; p.rot = 4 * T.swing(t, 2); }
        c.pose(p);
      } else if (kidsAud) {
        setParent(c, aud.slot); T.show(c.g, true);
        const p = { x: 330 + j * 420, y: 1060 - 16 * abs(sin(PI * b + j)), s: 2.1, blink: ((t + j) % 2.9) < 0.12, head: 6 * sin(t * 3 + j) };
        if (t < 31.1) { p.aL = p.aR = 160 + 10 * sin(t * 12 + j); p.mouth = 0.9; p.y -= 50 * bump(t, 30.5 + j * 0.06, 0.5); p.look = 0; p.head = -6; }
        else { p.mouth = max(0.3, T.sing(t)); p.aL = 120 + 40 * sin(t * 11 + j); p.aR = 120 - 40 * sin(t * 11 + j); p.head = 10 * sin(t * 9 + j); p.y -= 40 * bump(t, 32.6 + j * 0.05, 0.5); }
        c.pose(p);
      }
    }
    if (t >= 6.5) {
      // picadeiro
      const order = [];
      for (let i = 0; i < cast.length; i++) {
        const c = cast[i]; if (i >= K0 && (kidsExt || kidsAud)) continue;
        const h = hidden(i, t); if (i < K0 || !h) setParent(c, ring.stage); T.show(c.g, !h); if (h) continue;
        const p = poseOf(i, t); c.pose(p); c._p = p; order.push([p.y + (i === CH ? 0.5 : 0), i]);
      }
      order.sort((a, b2) => a[0] - b2[0]); const key = order.map(o => o[1]).join(','); if (key !== lastOrder) { lastOrder = key; for (const o of order) ring.stage.appendChild(cast[o[1]].g); }
      const pc = cast[CH]._p || {}, pm = cast[MG]._p, pj = cast[ML]._p, pe = cast[EQ]._p, pl = cast[LE]._p, pk = cast[MC]._p;
      // cartola e coelho
      const hatOn = t > 20.45 && t < 24.4; T.show(hatP, hatOn);
      if (hatOn && pm) { const u = smr(t, 20.45, 21.0), hx = lerp(pm.x, pm.x - 150, u), hy = lerp(pm.y - pm.s * 248, pm.y - pm.s * 150, u); T.setT(hatP, `translate(${hx.toFixed(1)},${hy.toFixed(1)}) rotate(${(180 * (1 - u)).toFixed(1)}) scale(${pm.s})`); const up = T.pop(t, 21.62, 0.4) * (1 - smr(t, 23.45, 23.85)); rabbit.pose({ x: 0, y: 160 - 68 * up, s: 0.62, aR: 150 + 24 * sin(t * 11), aL: 30, wag: sin(t * 10), mouth: up > 0.9 ? 0.5 : 0, blink: (t % 1.7) < 0.1, head: 6 * sin(t * 4) }); }
      // vara do equilibrista
      const poleOn = !hidden(EQ, t) && pe && pe.pole; T.show(pole, !!poleOn); if (poleOn) T.setT(pole, `translate(${pe.x.toFixed(1)},${(pe.y - pe.s * 96).toFixed(1)}) rotate(${(pe.rot * 1.8).toFixed(1)}) scale(${pe.s})`);
      // tambor, banquinho e canhões
      const dOn = t > 80.2; T.show(ring.drum, dOn);
      if (dOn) { const u = smr(t, 80.2, 81.2), v = smr(t, 87.2, 88.0); T.setT(ring.drum, `translate(${lerp(lerp(960, 1000, u), 1440, v).toFixed(1)},${lerp(lerp(700, 990, u), 946, v).toFixed(1)}) scale(${lerp(lerp(0.5, 1.15, u), 1.1, v).toFixed(3)}) rotate(${(8 * sin(t * 12) * (1 - u)).toFixed(1)})`); }
      const pOn = t > 73.2 && t < 88.0; T.show(ring.ped, pOn); if (pOn && pl) { T.setT(ring.ped, `translate(${(t < 87.1 ? pl.x : 1560).toFixed(1)},932) scale(1.3)`); ring.ped.style.opacity = 1 - ramp(t, 87.4, 88.0); }
      const cOn = t > 123.8; T.show(ring.cnL, cOn); T.show(ring.cnR, cOn);
      if (cOn) { const u = T.pop(t, 123.9, 0.6), k = 1 + 0.12 * (bump(t, 124.9, 0.3) + bump(t, 126.5, 0.3)); T.setT(ring.cnL, `translate(${lerp(-200, 70, u).toFixed(1)},1075) scale(${(0.9 * k).toFixed(3)})`); T.setT(ring.cnR, `translate(${lerp(2120, 1850, u).toFixed(1)},1075) scale(${(0.9 * k).toFixed(3)})`); }
      // luzes
      const o = { cheer: 0.35, open: max(bump(t, 19.5, 1.2), bump(t, 33.6, 1.5), bump(t, 60.7, 1.6), bump(t, 86.9, 1.5), bump(t, 80.0, 1.4)), hit: (pk && pk.hit) || 0 };
      const inCh = CHO.some(c0 => t >= c0 && t < c0 + 13.4) || (t > 48.4 && t < 61) || t > 118.5;
      if (inCh) { o.cheer = 1; o.beams = [[620 + 320 * sin(t * 1.3), 900], [960 + 420 * sin(t * 0.9 + 2), 900], [1300 + 320 * sin(t * 1.1 + 4), 900]]; o.bk = 0.34; o.tint = [C.gold, C.pink, C.sky, C.lilac][floor(b / 2) % 4 < 0 ? 0 : ((floor(b / 2) % 4) + 4) % 4]; o.tk = t > 118.5 && t < 122 ? 0.13 : 0.06; o.pk = 0.6; }
      else { let ax = 960, ay = 930; if (t < 20) { ax = pc.x || 960; } else if (t < 24.6 && pm) ax = pm.x - 60; else if (t > 67 && t < 73.8 && pe) { ax = pe.x; ay = pe.y + 10; } else if (t > 73.8 && t < 77.8 && pl) ax = pl.x; else if (t > 77.8 && t < 88 && pk) ax = pk.x; else if (t > 101 && t < 118) ax = 960; o.px = ax; o.py = ay > 400 ? 940 : 352; o.pk = ay > 400 ? 1 : 0.5; o.beams = [[ax - 60, ay > 400 ? 930 : 350], [ax, ay > 400 ? 930 : 350], [ax + 60, ay > 400 ? 930 : 350]]; o.bk = 0.26; if (t > 75.6 && t < 77.5) o.cheer = 1; if (t > 80.1 && t < 81.3) o.cheer = 1; }
      ring.update(t, o);
      // câmera
      let cx = camX(t), cy = camY(t), z = camZ(t);
      if (inCh) z += 0.012 * bn;
      camT(ring.g, cx, cy, z);
      runFx(t, { pc, pm, pj, pl, pk });
    }
    // ----- por cima de tudo -----
    const party = max(smr(t, 54.3, 54.7) * (1 - smr(t, 57.8, 59.5)) * 0.7, smr(t, 125.2, 126.2));
    confetti.forEach((c, k) => { const on = party > 0.01 && (k / confetti.length) < party; T.show(c, on); if (!on) return; const h1 = (k * 0.6180339) % 1, h2 = (k * 0.754877) % 1, y = ((t * (170 + h2 * 150) + h2 * 1300) % 1300) - 100; T.setT(c, `translate(${(h1 * 2000 - 40 + 50 * sin(t * (1.5 + h2) + k)).toFixed(1)},${y.toFixed(1)}) rotate(${((t * (200 + h1 * 300) * (k % 2 ? 1 : -1)) % 360).toFixed(0)}) scale(${(0.8 + h2 * 0.7).toFixed(2)},${(0.3 + 0.7 * abs(cos(t * (3 + h1 * 3) + k))).toFixed(2)})`); });
    CUES.forEach((c, k) => { const a = t - c[0], e = cues[k]; if (a < 0 || a > 0.75) return T.show(e, false); T.show(e, true); T.setT(e, `translate(${960 + c[3] * 330},${(330 - 30 * a).toFixed(1)}) rotate(${c[3] * 8 + 4 * sin(a * 20)}) scale(${(T.back(min(1, a * 5)) * (1 + 0.1 * sin(a * 18))).toFixed(3)})`); e.style.opacity = (1 - ramp(a, 0.55, 0.75)).toFixed(2); });
    curtains.set(max(1 - abs(t - 6.5) / 0.62, 0) > 0 ? sm(clamp(1.25 * (1 - abs(t - 6.5) / 0.62))) : 0.115 * smr(t, 157.2, 159.2));
    const mt = t - 159.4; T.show(msg, mt > 0);
    if (mt > 0) { const k = msg.children; for (let j = 0; j < 2; j++) { const s = T.pop(t, 159.4 + j * 0.6, 0.6); T.setT(k[j], `translate(960,${(250 + 6 * sin(t * 2 + j)).toFixed(1)}) scale(${max(0.001, s).toFixed(3)}) rotate(${(1.2 * sin(t * 1.6 + j)).toFixed(2)})`); k[j].style.opacity = ramp(t, 159.4 + j * 0.6, 159.55 + j * 0.6); } }
    const f = max(ramp(t, 169.9, 171.0), 1 - ramp(t, 0, 0.5)); T.show(fade, f > 0.001); fade.style.opacity = f.toFixed(3);
  }

  function runFx(t, q) {
    const off = e => T.show(e, false), on = e => T.show(e, true);
    const { pc, pm, pj, pl, pk } = q;
    // estrelinhas de tontura do Chico
    dizzy.forEach((d, k) => { if (!(pc && pc.dizzy)) return off(d); on(d); const a = t * 5 + k * 1.2566; T.setT(d, `translate(${(pc.x + 95 * cos(a)).toFixed(1)},${(pc.y - 330 + 24 * sin(a)).toFixed(1)}) scale(${(1 + 0.3 * sin(a)).toFixed(2)}) rotate(${(t * 200) % 360})`); });
    // brilhos: coelho saindo da cartola e estrelas da varinha
    sparks.forEach((s, k) => {
      if (pm && t > 21.6 && t < 23.3) { on(s); const a = k * 0.45 + t * 1.2, r = 70 + 60 * ((k * 0.37) % 1) + 80 * min(1, (t - 21.6) * 3), tw = abs(sin(t * 6 + k * 1.3)); T.setT(s, `translate(${(pm.x - 150 + r * cos(a)).toFixed(1)},${(pm.y - pm.s * 200 + r * 0.7 * sin(a)).toFixed(1)}) scale(${(0.5 + 1.2 * tw).toFixed(2)})`); s.style.opacity = 1; }
      else if (pm && t > 23.4 && t < 24.4) { on(s); const a = t - 23.4 - (k % 7) * 0.05; if (a < 0) return off(s); const ang = -1.57 + (k - 6.5) * 0.16; T.setT(s, `translate(${(pm.x + 70 + 900 * a * cos(ang)).toFixed(1)},${(pm.y - pm.s * 260 + 900 * a * sin(ang)).toFixed(1)}) scale(${(1.6 - a * 0.5).toFixed(2)}) rotate(${(t * 300) % 360})`); s.style.opacity = 1; }
      else if (t > 118.5 && t < 122.2) { on(s); const tw = abs(sin(t * 4 + k * 1.9)); T.setT(s, `translate(${(140 + ((k * 137) % 1640))},${(140 + ((k * 211) % 420))}) scale(${(0.4 + 1.8 * tw).toFixed(2)})`); s.style.opacity = tw.toFixed(2); }
      else if (pc && t > 115.46 && t < 117.5) { on(s); const a = k * 0.45 + t, tw = abs(sin(t * 6 + k)); T.setT(s, `translate(${(pc.x + 190 * cos(a)).toFixed(1)},${(pc.y - 290 + 150 * sin(a)).toFixed(1)}) scale(${(0.4 + 1.2 * tw).toFixed(2)})`); s.style.opacity = 1; }
      else off(s);
    });
    // bolas do malabarista
    const J = !pj ? 0 : t < 33.6 ? 1 : (t > 44.9 && t < 48.3) || (t > 98.2 && t < 101) || (t > 128 && t < 131.4) || (t > 141.4 && t < 144.2) ? 0.55 : 0;
    balls.forEach((bl, k) => { if (J <= 0) return off(bl); on(bl); const rate = 1.15, v = t * rate + k / 5, ph = frac(v), dir = floor(v) % 2 ? 1 : -1, hx = 66 * pj.s, H = (J === 1 ? 330 + 60 * smr(t, 29, 31) : 190) * pj.s; T.setT(bl, `translate(${(pj.x + dir * lerp(-hx, hx, ph)).toFixed(1)},${(pj.y - pj.s * 96 - H * 4 * ph * (1 - ph)).toFixed(1)}) scale(${pj.s})`); });
    // rugido
    rings.forEach((r, k) => { const a = frac((t - 75.7) * 1.6 + k / 3); if (!(pl && t > 75.7 && t < 77.4)) return off(r); on(r); T.setT(r, `translate(${(pl.x - 90 - 240 * a).toFixed(1)},${(pl.y - pl.s * 150).toFixed(1)}) scale(${(-(0.6 + 1.6 * a)).toFixed(2)},${(0.6 + 1.6 * a).toFixed(2)})`); r.style.opacity = (0.9 * (1 - a)).toFixed(2); });
    // notas musicais (cantar, tambor e banda)
    notes.forEach((n, k) => {
      let x0, y0; if (t > 52.8 && t < 54.3) { x0 = [720, 960, 1200, 330, 600, 1270, 1620, 960][k]; y0 = 520; } else if (pk && ((t > 81.2 && t < 88) || (t > 121.8 && t < 124.8))) { x0 = pk.x + (k % 2 ? 90 : -90); y0 = pk.y - 250; if (t > 121.8 && k > 4) { x0 = 1680; y0 = 600; } } else return off(n);
      on(n); const a = frac(t / 1.6 + k / 8); T.setT(n, `translate(${(x0 + (k % 2 ? 1 : -1) * 70 * a + 14 * sin(t * 6 + k)).toFixed(1)},${(y0 - 190 * a).toFixed(1)}) scale(${(1.1 + 0.5 * sin(PI * a)).toFixed(2)}) rotate(${(14 * sin(t * 5 + k)).toFixed(1)})`); n.style.opacity = sin(PI * a).toFixed(2);
    });
    hearts.forEach((h, k) => { const a = t - 148.1 - k * 0.22; if (a < 0 || a > 2.2) return off(h); on(h); const u = a / 2.2; T.setT(h, `translate(${(240 + k * 205 + 30 * sin(a * 4 + k)).toFixed(1)},${(620 - 260 * u).toFixed(1)}) scale(${(T.back(min(1, a * 3)) * 2).toFixed(2)})`); h.style.opacity = (1 - u * u).toFixed(2); });
    claps.forEach((c, k) => { const a = (pc && pc.clap) || 0; if (a < 0.3 || !(t > 101 && t < 105)) return off(c); on(c); T.setT(c, `translate(${(pc.x + (k - 1.5) * 60).toFixed(1)},${(pc.y - 150 + (k % 2) * 40).toFixed(1)}) scale(${(0.4 + a).toFixed(2)}) rotate(${k * 25})`); c.style.opacity = a.toFixed(2); });
    // tiros de confete dos canhões
    shots.forEach((s, k) => { const e = k % 2, tb = (k % 4 < 2) ? 124.9 : 126.5, a = t - tb; if (a < 0 || a > 2.2) return off(s); on(s); const h1 = (k * 0.618) % 1, h2 = (k * 0.7549) % 1, vx = (e ? -1 : 1) * (300 + 700 * h1), vy = -(900 + 700 * h2); T.setT(s, `translate(${((e ? 1790 : 130) + vx * a * (1 - 0.2 * a)).toFixed(1)},${(960 + vy * a + 900 * a * a).toFixed(1)}) rotate(${((a * 500 + k * 40) % 360).toFixed(0)}) scale(${(1 + h1).toFixed(2)})`); s.style.opacity = (1 - ramp(a, 1.7, 2.2)).toFixed(2); });
  }
  T.seek = seek;
})();
