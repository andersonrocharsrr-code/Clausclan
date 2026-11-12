'use strict';
// O clipe: monta as cenas e desenha cada instante a partir do tempo da música (T.seek(t)).
(() => {
  const C = T.C, A = T.A, R = T.RAIL;
  const { sin, cos, PI, abs, floor, atan, min, max } = Math;
  const { lerp, ramp, sm, smr, bump, kf, clamp } = T;
  const svg = document.getElementById('palco');

  // ---------- Movimento do trem ----------
  const speed = kf([[0, 420], [31.0, 420], [33.2, 0], [52.9, 0], [55.2, 460], [70.5, 460], [77.7, 420], [91.4, 420], [92.6, 760], [94.4, 300], [95.1, 0], [95.9, -430], [97.9, -430], [98.7, 0], [99.4, 450], [102.2, 450], [104.0, 0], [121.2, 0], [121.4, 250], [140, 230]]);
  const DTAB = []; { let d = 0; for (let i = 0; i <= 140 * 100; i++) { DTAB.push(d); d += speed(i / 100) / 100; } }
  const dist = t => { const x = clamp(t, 0, 139.9) * 100, i = floor(x); return lerp(DTAB[i], DTAB[i + 1], x - i); };
  const TX0 = 1467;   // posição da locomotiva com o trem inteiro centralizado
  const trainX = kf([[14.4, TX0], [15.2, 842], [18.1, 842], [18.9, 1265], [21.6, 1265], [22.3, 1520], [25.3, 1520], [26.0, 1775], [28.5, 1775], [29.2, 2030], [31.4, 2030], [32.8, TX0],
  [77.6, TX0], [77.7, 1775], [80.6, 1775], [81.3, 1520], [84.2, 1520], [84.9, 1265], [87.9, 1265], [88.6, 2030], [90.8, 2030], [91.6, 1300], [94.8, 1640], [98.4, 1300], [99.6, TX0],
  [121.2, TX0], [121.3, 900], [123.3, 900], [124.3, TX0]]);
  const scroll = t => dist(t) - (trainX(t) - TX0);
  const camZ = kf([[11.0, 1], [14.3, 1.22], [14.5, 1.22], [15.2, 2.1], [18.1, 2.1], [18.9, 1.8], [21.6, 1.8], [22.3, 1.6], [25.3, 1.6], [26.0, 1.45], [28.5, 1.45], [29.2, 1.7], [31.4, 1.7], [32.8, 1],
  [38.2, 1], [40.4, 1.12], [44.0, 1.12], [44.6, 1.2], [50.8, 1.2], [52.8, 1], [58.3, 1], [61.8, 1.3], [62.2, 1.3], [63.0, 1], [66.6, 1], [70.2, 1.12],
  [77.6, 1.12], [77.7, 1.9], [80.6, 1.9], [81.3, 1.55], [84.2, 1.55], [84.9, 1.6], [87.9, 1.6], [88.6, 1.9], [90.8, 1.9], [91.6, 1], [98.5, 1], [99.2, 1.14], [102.2, 1.14], [103.4, 1],
  [104.5, 1], [106.6, 1.14], [109.4, 1.14], [110.0, 1.45], [113.0, 1.45], [113.5, 1.1], [116.8, 1.1], [117.4, 1.0], [121.2, 1.08], [121.3, 1.7], [123.3, 1.7], [124.3, 1.2], [127.7, 1.3]]);
  const camY = kf([[11.0, 540], [14.3, 610], [14.5, 610], [15.2, 655], [18.1, 655], [18.9, 640], [21.6, 640], [22.3, 560], [25.3, 560], [26.0, 690], [28.5, 690], [29.2, 600], [31.4, 600], [32.8, 540],
  [38.2, 540], [40.4, 596], [44.0, 596], [44.6, 628], [50.8, 628], [52.8, 540], [58.3, 540], [61.8, 600], [62.2, 600], [63.0, 540], [66.6, 540], [70.2, 580],
  [77.6, 580], [77.7, 610], [80.6, 610], [81.3, 520], [84.2, 520], [84.9, 560], [87.9, 560], [88.6, 610], [90.8, 610], [91.6, 540], [98.5, 540], [99.2, 560], [102.2, 560], [103.4, 540],
  [104.5, 540], [106.6, 604], [109.4, 604], [110.0, 700], [113.0, 700], [113.5, 588], [116.8, 588], [117.4, 540], [121.2, 560], [121.3, 640], [123.3, 640], [124.3, 610], [127.7, 620]]);
  const camX = kf([[109.4, 960], [110.0, 700], [113.0, 1220], [113.5, 960]]);

  // ---------- Estrutura das cenas ----------
  const mk = p => T.el('g', {}, p);
  const vistaDia = T.mkVista(false), vistaTarde = T.mkVista(true), frontal = T.mkFrontal();
  const lat = mk(svg), latBack = mk(lat), skyFx = mk(lat), latTrain = mk(lat), latFront = mk(lat), actors = mk(lat), fx = mk(lat);
  svg.appendChild(vistaDia.g); svg.appendChild(frontal.g); svg.appendChild(vistaTarde.g);
  const WN = ['vale', 'estacao', 'mata', 'ponte', 'campo', 'praca', 'tarde'];
  const WIN = [[-9, -8], [31.4, 32.6], [54.0, 55.2], [61.9, 62.9], [66.1, 67.1], [101.6, 102.8], [121.3, 121.3]];
  const worlds = WN.map(k => { const w = T.mkWorld(k, scroll); latBack.appendChild(w.back); latFront.appendChild(w.front); return w; });
  worlds[1].anchor = scroll(33.2); worlds[5].anchor = scroll(104.0);
  const train = T.mkTrain(); latTrain.appendChild(train.g);
  const chars = ['macaco', 'girafa', 'coelho', 'urso'].map(T.mkChar);
  const fly = T.mkButterfly();
  const GX = [1350, 1090, 830, 570], GY = 1012, GS = 1.6;

  // ---------- Efeitos ----------
  const pool = (parent, n, html, attrs) => { const a = []; for (let i = 0; i < n; i++) a.push(T.g(parent, typeof html === 'function' ? html(i) : html, attrs)); return a; };
  const birds = [0, 1, 2, 3, 4].map(i => A.mkBird(skyFx, [C.sky, C.coral, C.gold, C.lilac, C.blue][i], [C.skyD, C.coralD, C.goldD, C.lilacD, C.blueD][i]));
  const flies = [0, 1, 2, 3].map(i => A.mkFly(fx, [C.gold, C.pink, C.lilac, C.orange][i], [C.coral, C.lilac, C.sky, C.gold][i]));
  const dust = pool(fx, 14, '<circle r="5"/>', { fill: C.cream, opacity: 0.55 });
  const hearts = pool(fx, 7, i => `<path d="${A.heart}" fill="${[C.coral, C.pink, C.coralL][i % 3]}"/>`);
  const sparks = pool(fx, 7, `<path d="${A.star4}" fill="#fff"/><path d="${A.star4}" fill="${C.goldL}" transform="scale(.55)"/>`);
  const leaves = pool(fx, 16, i => A.leaf([C.green, C.greenL, C.greenD, C.gold][i % 4]));
  const notes = pool(fx, 8, i => A.note([C.coral, C.blue, C.lilacD, C.orange][i % 4]));
  const confetti = pool(fx, 80, i => i % 3 ? `<rect x="-9" y="-5" width="18" height="10" rx="2" fill="${[C.coral, C.gold, C.sky, C.green, C.lilac, C.orange][i % 6]}"/>` : `<circle r="7" fill="${[C.coral, C.gold, C.sky, C.green, C.lilac, C.orange][i % 6]}"/>`);
  const bursts = pool(fx, 40, '<circle r="11"/>');
  const claps = pool(fx, 4, `<path d="${A.star4}" fill="${C.goldL}" transform="scale(1.8)"/>`);
  const glow = T.el('circle', { r: 900, fill: 'url(#solG)' }, fx);
  // por cima de tudo (fora da câmera)
  const top = mk(svg);
  T.el('defs', {}, top).innerHTML = `<radialGradient id="solG"><stop offset="0" stop-color="#FFF1A8" stop-opacity=".85"/><stop offset=".4" stop-color="#FFE27A" stop-opacity=".3"/><stop offset="1" stop-color="#FFE27A" stop-opacity="0"/></radialGradient>`;
  const wipe = mk(top), wp = [];
  for (let j = 0; j < 3; j++) for (let i = 0; i < 5; i++) { const c = T.el('g', {}, wipe); c.innerHTML = `<circle r="330" fill="#E3F1FA" cy="16"/><circle r="330" fill="#fff"/>`; wp.push({ c, x: 190 + i * 385 + (j % 2) * 60 - 30, y: 180 + j * 360, d: (i + j) * 0.03 }); }
  const WIPES = [7.3, 70.5, 77.7, 121.3, 127.65];
  const title = mk(top);
  const tl = (txt, y) => { const cs = [C.coral, C.gold, C.sky, C.green, C.orange, C.lilacL]; let i = 0; const sp = [...txt].map(ch => ch === ' ' ? ' ' : `<tspan fill="${cs[i++ % 6]}">${ch}</tspan>`).join(''); const a = `x="0" y="${y}" text-anchor="middle" font-family="Fredoka, 'Baloo 2', 'Arial Rounded MT Bold', Arial, sans-serif" font-weight="700" font-size="150" letter-spacing="4"`; return `<g><text ${a} transform="translate(0,12)" fill="#3B2A63" opacity=".35" stroke="#3B2A63" stroke-width="30" stroke-linejoin="round">${txt}</text><text ${a} fill="${C.cream}" stroke="${C.cream}" stroke-width="30" stroke-linejoin="round">${txt}</text><text ${a}>${sp}</text></g>`; };
  title.innerHTML = tl('O TRENZINHO', 0) + tl('DAS CORES', 160);
  const fade = T.el('rect', { width: 1920, height: 1080, fill: '#2B2046' }, top);

  const camT = (g, cx, cy, z, rot) => T.setT(g, `translate(960,540) rotate(${(rot || 0).toFixed(2)}) scale(${z.toFixed(4)}) translate(${(-cx).toFixed(1)},${(-cy).toFixed(1)})`);
  const setParent = (o, p) => { if (o.g.parentNode !== p) p.appendChild(o.g); };
  const CW1 = [54.66, 55.5, 56.62, 57.18], CW2 = [113.38, 114.16, 115.28, 115.86], CWC = [C.coral, C.gold, C.sky, C.green];
  const puffColor = tb => { for (const cw of [CW1, CW2]) for (let i = 0; i < 4; i++) if (tb >= cw[i] - 0.1 && tb < (i < 3 ? cw[i + 1] - 0.1 : cw[i] + 0.9)) return CWC[i]; return null; };

  // ---------- Coreografia dos amiguinhos ----------
  // Devolve a pose do personagem i no tempo t. where: 'car' (dentro do vagão) ou 'ground' (no chão, na frente).
  function poseOf(i, t, mv) {
    const b = T.beat(t), bn = T.bounce(t), sw2 = T.swing(t, 2), w9 = sin(t * 9 + i);
    const p = { where: 'car', x: 28, y: -62 - 6 * bn, s: 0.95, rot: 2.5 * sin(PI * b + i), head: 5 * sin(PI * b * 0.5 + i * 1.3), aL: 14, aR: 14, lL: 0, lR: 0, mouth: T.sing(t, i * 0.012) * (0.8 + 0.07 * i), blink: ((t + i * 0.83) % 3.4) < 0.13, wag: sin(t * 5 + i), look: 0, sq: 0, flip: 1, hatUp: 0 };
    const cheer = k => { p.aL = 150 + 18 * w9 * (k || 1); p.aR = 150 - 18 * w9 * (k || 1); };
    const waveR = () => { p.aR = 150 + 26 * sin(t * 10 + i * 0.7); };
    const jumpAt = (tp, h, d) => { const u = bump(t, tp, d || 0.5); if (u > 0) { p.y -= h * u; p.aL = max(p.aL, 150 * min(1, u * 2)); p.aR = max(p.aR, 150 * min(1, u * 2)); } p.sq += 0.1 * bump(t, tp - 0.14, 0.14) - 0.06 * bump(t, tp, 0.2); };
    const hop = (t0, d, out) => {   // pula do vagão para o chão (out) ou de volta
      const u = ramp(t, t0, t0 + d), e = out ? sm(u) : 1 - sm(u), cx = trainX(t) + train.cars[i].off + 28;
      const sx = lerp(cx, GX[i], e), sy = lerp(R - 62, GY, e) - 290 * sin(PI * u), s = lerp(0.95, GS, e);
      p.s = s; p.aL = 160; p.aR = 160; p.rot = (out ? 1 : -1) * 14 * sin(PI * u) * (i % 2 ? 1 : -1); p.sq = -0.08 * sin(PI * u); p.mouth = max(p.mouth, 0.7);
      if ((out ? u : 1 - u) < 0.42) { p.where = 'car'; p.x = sx - (cx - 28); p.y = sy - R; } else { p.where = 'ground'; p.x = sx; p.y = sy; }
    };
    const ground = () => { p.where = 'ground'; p.x = GX[i]; p.y = GY - 16 * bn; p.s = GS; p.rot = 3 * sw2; };
    const spin = (t0, d) => { const u = ramp(t, t0, t0 + d); if (u > 0 && u < 1) p.flip = cos(2 * PI * sm(u)); };
    const dance = () => { p.aL = 100 + 60 * sin(PI * b); p.aR = 100 - 60 * sin(PI * b); p.rot = 6 * sw2; p.head = -6 * sw2; };

    if (t < 7.3) { waveR(); }
    else if (t < 11.1) { waveR(); p.aL = 60 + 30 * sin(t * 10 + i); }
    else if (t < 14.8) { dance(); }
    else if (t < 18.4) { p.look = 1; }
    else if (t < 32.6) {
      const f = t < 21.9 ? 0 : t < 25.55 ? 1 : t < 28.7 ? 2 : 3;
      if (i === f) { cheer(); p.y -= 10 * bn; if (f === 0) { p.look = -1; p.head = -8; } if (f === 3) { p.rot = 9 * sw2; p.head = -7 * sw2; } }
      else p.look = i < f ? -1 : 1;
    }
    else if (t < 38.4 + i * 0.33) { p.aR = lerp(14, 165, T.pop(t, 33.0 + i * 0.07, 0.4)) + 6 * w9; if (t > 36.2) p.aL = lerp(14, 165, T.pop(t, 36.26 + i * 0.07, 0.4)) - 6 * w9; p.y = -62 - 3 * bn; }
    else if (t < 39.15 + i * 0.33) hop(38.4 + i * 0.33, 0.75, true);
    else if (t < 51.0 + i * 0.3) {
      ground();
      if (t < 40.4) { cheer(0.5); }
      else if (t < 41.45) { const c = max(bump(t, 40.46, 0.24), bump(t, 40.92, 0.24)); p.aL = p.aR = lerp(42, -38, c); p.y = GY - 8 * c; }
      else if (t < 42.4) { p.lL = 20 * bump(t, 41.42, 0.3); p.lR = 20 * bump(t, 41.92, 0.3); p.aL = p.aR = 48; p.rot = 5 * (bump(t, 41.92, 0.3) - bump(t, 41.42, 0.3)); p.y = GY; }
      else if (t < 44.2) { p.aL = 70 + 50 * sin(2 * PI * b); p.aR = 70 - 50 * sin(2 * PI * b); p.lL = 12 * max(0, sin(PI * b)); p.lR = 12 * max(0, -sin(PI * b)); }
      else {
        dance(); p.x += 46 * T.swing(t, 4);
        for (const tp of [44.30, 45.24, 47.98, 48.90]) jumpAt(tp, 120);
        spin(46.2 + i * 0.06, 0.8); spin(49.7 + i * 0.06, 0.8);
        if (t > 50.3) cheer();
      }
    }
    else if (t < 51.75 + i * 0.3) hop(51.0 + i * 0.3, 0.75, false);
    else if (t < 54.6) { waveR(); }
    else if (t < 58.3) { jumpAt(CW1[i], 46, 0.55); }
    else if (t < 62.6) { dance(); p.y -= 6 * bn; }
    else if (t < 66.6) { waveR(); p.aL = 60 + 30 * sin(t * 10 + i); jumpAt(62.72, 26, 0.4); jumpAt(63.68, 26, 0.4); }
    else if (t < 77.7) { cheer(); }
    else if (t < 91.4) {
      const f = t < 81.0 ? 2 : t < 84.6 ? 1 : t < 88.3 ? 0 : 3;
      if (i !== f) p.look = i < f ? -1 : 1;
      else if (f === 2) { p.look = -0.6; p.head = -8 + 3 * w9; p.wag = sin(t * 12); p.aL = 120 + 20 * w9; p.mouth = max(p.mouth, 0.5 * bump(t, 79.3, 1.2)); }
      else if (f === 1) { const h = smr(t, 82.0, 82.35) * (1 - smr(t, 82.9, 83.2)) + smr(t, 83.3, 83.6) * (1 - smr(t, 84.1, 84.4)); p.hatUp = h; p.head = 7 * sw2 - 6 * h; p.aR = 150 + 16 * w9; }
      else if (f === 0) { const j = abs(sin(PI * b * 0.5)); p.y -= 130 * j; cheer(); p.wag = sin(t * 14); p.sq = -0.07 * j + 0.1 * (1 - j) * (1 - j); spin(86.5, 0.7); p.mouth = max(p.mouth, 0.6); }
      else { p.mouth = max(0.25, T.sing(t)); p.blink = true; p.aL = 90 + 40 * sin(PI * b); p.aR = 90 - 40 * sin(PI * b); p.rot = 7 * sw2; p.head = 8 * sw2; }
    }
    else if (t < 95.05) { const k = smr(t, 91.5, 92.2) * (1 - smr(t, 94.3, 95.0)); p.rot = -11 * k; cheer(); p.mouth = max(p.mouth, 0.6 * k); }
    else if (t < 98.7) { const k = smr(t, 95.2, 95.9) * (1 - smr(t, 98.0, 98.6)); p.rot = 11 * k; p.aL = p.aR = 60; p.look = -1; }
    else if (t < 102.4) { cheer(); p.rot = -9 * sin(2 * PI * (t - 98.7) / 1.84); }
    else if (t < 104.9 + i * 0.28) { p.rot = 9 * bump(t, 103.3, 0.9); p.y = -62 - 3 * bn; if (t > 103.9) { p.aL = p.aR = 80 + 10 * w9; p.rot = 5 * sw2; p.mouth = max(0.3, T.sing(t)); } }
    else if (t < 105.6 + i * 0.28) hop(104.9 + i * 0.28, 0.7, true);
    else if (t < 121.3) {
      ground();
      if (t < 109.6) { dance(); p.x += 40 * T.swing(t, 4); jumpAt(106.78, 130); jumpAt(107.68, 130); spin(108.4 + i * 0.06, 0.8); }
      else if (t < 113.2) { dance(); p.y -= 8 * bn; p.mouth = max(p.mouth, 0.25); }
      else if (t < 116.9) { const c = bump(((b % 1) + 1) % 1, 0.0, 0.5); p.aL = p.aR = lerp(42, -38, c); jumpAt(CW2[i], 150, 0.6); spin(CW2[i] + 0.05, 0.5); }
      else { const u = smr(t, 116.9, 117.6), s3 = sin(2 * PI * (t - 117.0) / 3.675); p.x += u * 150 * s3; p.aL = 55 + 40 * sin(2 * PI * b); p.aR = 55 - 40 * sin(2 * PI * b); p.lL = 14 * max(0, sin(PI * b)); p.lR = 14 * max(0, -sin(PI * b)); p.rot = 5 * sw2; jumpAt(120.4, 90, 0.6); }
    }
    else if (t < 123.8) { p.look = 1; }
    else { waveR(); if (i % 2) p.aL = 150 - 26 * sin(t * 10); }
    return p;
  }

  // ---------- Desenha um instante ----------
  let lastScene = '';
  function seek(t) {
    t = clamp(t, 0, T.DUR);
    const scene = t < 7.3 ? 'vd' : t < 70.5 ? 'lat' : t < 77.7 ? 'fr' : t < 127.65 ? 'lat' : 'vt';
    if (scene !== lastScene) { lastScene = scene; T.show(vistaDia.g, scene === 'vd'); T.show(vistaTarde.g, scene === 'vt'); T.show(frontal.g, scene === 'fr'); T.show(lat, scene === 'lat'); }
    const b = T.beat(t), bn = T.bounce(t), v = speed(t), mv = clamp(abs(v) / 300);
    let piu = 0;
    const expr = { mouth: T.sing(t) * 0.55 };
    if (t > 14.8 && t < 18.4) { expr.mouth = 0; expr.blink = (t > 16.9 && t < 17.25) || (t > 15.9 && t < 16.02); }

    if (scene === 'vd' || scene === 'vt') {
      const V = scene === 'vd' ? vistaDia : vistaTarde, S = 0.3;
      setParent(train, V.slot);
      const X = scene === 'vd' ? -260 + t * 250 : 420 + (t - 127.65) * 105;
      for (let i = 0; i < 5; i++) { const x = X + (i ? train.cars[i - 1].off : 0) * S, y = T.vy(x), sl = (T.vy(x + 12) - T.vy(x - 12)) / 24; train.place(i, x, y - (i ? 0 : 3 * piu), atan(sl) * 57.3, S); }
      piu = train.run(t, X / S, 380, null, expr);
      chars.forEach((c, i) => { setParent(c, train.cars[i].inn); const p = poseOf(i, t, 1); p.where = 'car'; p.x = 28; p.y = -62 - 6 * bn; c.pose(p); });
      T.show(fly.g, false);
      let z, cx, cy;
      if (scene === 'vd') { const u = smr(t, 1.2, 7.4); z = lerp(1, 1.7, u); cx = lerp(960, X - 60, u * 0.85); cy = lerp(540, T.vy(X) - 20, u); }
      else { const u = smr(t, 127.6, 133.5); z = lerp(1.55, 1, u); cx = lerp(X - 100, 960, u); cy = lerp(T.vy(X) - 60, 540, u); }
      cx = clamp(cx, 960 / z, 1920 - 960 / z); cy = clamp(cy, 540 / z, 1080 - 540 / z);
      camT(V.g, cx, cy, z, 0); V.update(t, (cx - 960) * 0.25 + (scene === 'vd' ? t * 5 : (t - 127) * 3));
    }
    else if (scene === 'fr') {
      const Zt = lerp(1.7, 1.15, smr(t, 70.3, 76.4)) * (1 - 0.7 * smr(t, 76.8, 77.75));
      piu = 0;
      frontal.update(t, Zt, 0);
      chars.forEach((c, i) => { setParent(c, frontal.slots[i]); const p = poseOf(i, t, 1); p.where = 'car'; p.x = 0; p.y = -212 - 10 * bn; p.s = 1.25; p.aR = 150 + 26 * sin(t * 10 + i); p.aL = i % 2 ? 150 - 26 * sin(t * 10 + i) : 20; p.rot = 5 * sin(PI * b + i); c.pose(p); });
      setParent(fly, frontal.g); T.show(fly.g, true);
      fly.pose({ x: 560 + 120 * sin(t * 1.1), y: 300 + 60 * sin(t * 1.9), s: 1.1, flap: t * 16, rot: 10 * sin(t * 1.1) });
    }
    else {
      setParent(train, latTrain);
      // mundos: mostra o atual e o anterior durante a passagem suave
      let cur = 0; for (let i = 0; i < WN.length; i++) if (t >= WIN[i][0]) cur = i;
      const fo = ramp(t, WIN[cur][0], WIN[cur][1] + 1e-6), sc = scroll(t);
      const o = { wind: t > 28.6 && t < 32.6 ? 2.4 : 1 };
      if (cur === 0) { const y = smr(t, 21.6, 22.6) * (1 - smr(t, 25.2, 26.0)); o.sun = [lerp(1560, 1250, y), lerp(150, 330, y)]; o.sunS = 1 + 0.7 * y + 0.06 * y * sin(t * 6); o.rainbow = 0.6 * smr(t, 10.5, 12) * (1 - 0.6 * y); T.setT(glow, `translate(${o.sun[0]},${o.sun[1]})`); glow.style.opacity = y * 0.6; T.show(glow, y > 0.01); } else T.show(glow, false);
      worlds.forEach((w, i) => { const on = i === cur || (i === cur - 1 && fo < 1); T.show(w.back, on); T.show(w.front, on); if (on) { const op = i === cur ? fo : 1; w.back.style.opacity = op; w.front.style.opacity = op; w.update(t, sc, i === 0 ? o : null); } });
      const tx = trainX(t), tilt = t > 98.6 && t < 102.5 ? 4.5 * sin(2 * PI * (t - 98.7) / 1.84) * smr(t, 98.7, 99.3) * (1 - smr(t, 101.9, 102.4)) : 0;
      piu = 0; for (const tp of train.PIU) piu = max(piu, bump(t, tp, 0.45));
      for (let i = 0; i < 5; i++) {
        let y = R - mv * 2.5 * abs(sin(PI * (b + i * 0.25))), rot = mv * 0.9 * sin(PI * b + i * 0.8);
        if (i === 0) y -= 13 * piu; else { y -= 26 * (bump(t, CW1[i - 1], 0.45) + bump(t, CW2[i - 1], 0.45)); if (mv < 0.1) y -= 4 * bn * (t > 44 && t < 51 || t > 106.5 && t < 121 ? 1 : 0); }
        if (tilt) rot += 2.2 * sin(2 * PI * (t - 98.7 - i * 0.12) / 1.84);
        train.place(i, tx + (i ? train.cars[i - 1].off : 0), y, rot, 1);
      }
      train.run(t, dist(t), v * 0.9, puffColor, expr);
      // maçã em destaque
      const hero = train.cars[0].hero; T.setT(hero.firstChild, `scale(${(T.pop(t, 19.55, 0.5) * (1 - smr(t, 21.7, 22.1)) * (1 + 0.06 * sin(t * 8))).toFixed(3)}) rotate(${(6 * sin(t * 5)).toFixed(1)})`);
      T.setT(hero, `translate(-48,${(-225 - 40 * T.pop(t, 19.55, 0.5)).toFixed(1)})`);
      T.setT(train.cars[2].bal, `rotate(${(-4 - mv * 5 + 3 * sin(t * 2.3)).toFixed(1)} -60 -120)`);
      // personagens
      chars.forEach((c, i) => { const p = poseOf(i, t, mv); setParent(c, p.where === 'car' ? train.cars[i].inn : actors); c.pose(p); });
      // borboleta
      setParent(fly, actors); T.show(fly.g, true);
      const bx = tx + train.cars[2].off;
      let fp = { x: bx - 30 + 70 * sin(t * 1.3), y: 470 + 34 * sin(t * 2.1), s: 0.8, flap: t * 16, rot: 12 * sin(t * 1.3) };
      if (t > 77.7 && t < 81.2) { const u = smr(t, 78.3, 79.5) * (1 - smr(t, 80.7, 81.2)); fp.x = lerp(fp.x, bx - 78, u); fp.y = lerp(fp.y, R - 192, u); fp.flap = t * lerp(16, 5, u); fp.rot *= (1 - u); fp.s = 0.9; }
      if ((t > 39.5 && t < 52) || (t > 105.5 && t < 121.3)) { fp.x = 905 + 330 * sin(t * 0.9); fp.y = 600 + 50 * sin(t * 2.3); fp.s = 1; }
      fp.blink = (t % 2.9) < 0.12; fly.pose(fp);
      // câmera
      const z = camZ(t) + (t > 44.3 && t < 50.8 || t > 106.6 && t < 109.4 ? 0.012 * bn : 0), cy = min(camY(t), 1080 - 540 / z);
      camT(lat, camX(t), cy, z + (tilt ? 0.03 : 0), tilt);
      runFx(t, tx, sc);
    }
    // ----- por cima: nuvem de vapor (troca de cena), título e fim -----
    let wOn = false;
    for (const tw of WIPES) if (abs(t - tw) < 0.5) { wOn = true; for (const w of wp) { const k = clamp(1 - abs(t - tw + (w.d - 0.09) * 0.6) / 0.4), s = sm(k) * 0.98; T.setT(w.c, `translate(${w.x},${w.y}) scale(${s.toFixed(3)})`); } }
    T.show(wipe, wOn);
    const tt = t - 130.6; T.show(title, tt > 0);
    if (tt > 0) { const k = title.children; for (let j = 0; j < 2; j++) { const s = T.pop(t, 130.6 + j * 0.55, 0.6); T.setT(k[j], `translate(960,${(250 + 6 * sin(t * 2 + j)).toFixed(1)}) scale(${max(0.001, s).toFixed(3)}) rotate(${(1.2 * sin(t * 1.6 + j)).toFixed(2)})`); k[j].style.opacity = ramp(t, 130.6 + j * 0.55, 130.75 + j * 0.55); } }
    const f = max(ramp(t, 136.3, 137.2), 1 - ramp(t, 0, 0.5)); T.show(fade, f > 0.001); fade.style.opacity = f.toFixed(3);
  }

  function runFx(t, tx, sc) {
    const off = e => T.show(e, false), on = e => T.show(e, true);
    const inForest = t > 54.6 && t < 62.4, stop = (t > 33 && t < 53) || (t > 104 && t < 121.3);
    birds.forEach((bd, k) => { const x = ((t * (70 + k * 14) + k * 560) % 2700) - 380, y = 130 + k * 52 + 22 * sin(t * 1.3 + k); T.show(bd.g, !inForest); T.setT(bd.g, `translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${0.9 + 0.12 * k})`); T.setT(bd.w, `scale(1,${(0.2 + 0.8 * sin(t * 13 + k)).toFixed(2)})`); });
    flies.forEach((f, k) => { const x = 2100 - ((t * (60 + k * 22) + k * 640) % 2500), y = 470 + k * 150 + 46 * sin(t * 2.2 + k * 2), s = abs(cos(t * 15 + k)); T.setT(f.g, `translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${(-12 + 10 * sin(t * 3 + k)).toFixed(1)}) scale(${0.8 + 0.3 * (k % 2)})`); T.setT(f.l, `scale(${(0.3 + 0.7 * s).toFixed(2)},1)`); T.setT(f.r, `scale(${(0.3 + 0.7 * s).toFixed(2)},1)`); });
    dust.forEach((d, k) => { const x = (k * 151 + 40 * sin(t * 0.7 + k) + (stop ? 0 : -sc * 0.3) % 1920 + 5760) % 1920, y = 1000 - ((t * (18 + k % 5 * 6) + k * 83) % 620); T.setT(d, `translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${0.5 + (k % 3) * 0.35})`); });
    // corações no sorriso da locomotiva
    hearts.forEach((h, k) => { const tb = 15.2 + k * 0.42, a = t - tb; if (a < 0 || a > 1.9 || t > 18.5) return off(h); on(h); const u = a / 1.9; T.setT(h, `translate(${(tx + 150 + (k % 2 ? 60 : -50) + 30 * sin(a * 4 + k)).toFixed(1)},${(R - 250 - 190 * u).toFixed(1)}) scale(${(T.back(min(1, a * 3)) * (1.3 + 0.3 * (k % 3))).toFixed(2)}) rotate(${(12 * sin(a * 5 + k)).toFixed(1)})`); h.style.opacity = (1 - u * u).toFixed(2); });
    // brilhos: maçã e chapéu da girafa
    let sx = 0, sy = 0, sr = 0, sOn = false;
    if (t > 19.7 && t < 21.8) { sOn = true; sx = tx + train.cars[0].off - 48; sy = R - 270; sr = 78; }
    if (t > 82.0 && t < 84.4) { sOn = true; sx = tx + train.cars[1].off + 40; sy = R - 430; sr = 70; }
    sparks.forEach((s, k) => { if (!sOn) return off(s); on(s); const a = k * 0.9 + t * 0.8, tw = abs(sin(t * 5 + k * 1.3)); T.setT(s, `translate(${(sx + sr * cos(a) * 1.15).toFixed(1)},${(sy + sr * sin(a) * 0.9).toFixed(1)}) scale(${(0.5 + 1.1 * tw).toFixed(2)}) rotate(${(t * 60) % 90})`); });
    // folhas voando (verde)
    const lo = smr(t, 28.6, 29.2) * (1 - smr(t, 32.0, 32.7));
    leaves.forEach((l, k) => { if (lo < 0.01) return off(l); on(l); const a = t - 28.2, x = 2100 - ((a * (300 + k * 23) + k * 173) % 2300), y = ((a * (120 + k % 4 * 30) + k * 97) % 720) + 180 + 40 * sin(a * 3 + k); T.setT(l, `translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${((a * (160 + k * 20)) % 360).toFixed(0)}) scale(${1.3 + (k % 3) * 0.4})`); l.style.opacity = lo; });
    // notas musicais
    notes.forEach((n, k) => {
      let x0, y0, tb; const per = 0.46;
      if (t > 88.3 && t < 91.5) { x0 = tx + train.cars[3].off + 28; y0 = R - 290; tb = 88.3; }
      else if (t > 104.0 && t < 106.6) { x0 = tx + train.cars[k % 4].off + 28; y0 = R - 300 - (k % 4 === 1 ? 170 : 0); tb = 104.0; }
      else return off(n);
      const a = ((t - tb) + k * per * 0.5) % (per * 4), u = a / (per * 4); if (t - tb < k * 0.1) return off(n); on(n);
      T.setT(n, `translate(${(x0 + (k % 2 ? 1 : -1) * (40 + 90 * u) + 16 * sin(a * 6)).toFixed(1)},${(y0 - 190 * u).toFixed(1)}) scale(${(1.1 + 0.5 * sin(PI * u)).toFixed(2)}) rotate(${(14 * sin(a * 5 + k)).toFixed(1)})`); n.style.opacity = sin(PI * u).toFixed(2);
    });
    // festa: confete
    const party = smr(t, 106.3, 106.9) * (1 - smr(t, 120.9, 121.3));
    confetti.forEach((c, k) => { if (party < 0.01) return off(c); on(c); const a = t - 105, h1 = (k * 0.6180339) % 1, h2 = (k * 0.754877) % 1; const x = h1 * 2000 - 40 + 50 * sin(a * (1.5 + h2) + k), y = ((a * (170 + h2 * 150) + h2 * 1300) % 1300) - 100; T.setT(c, `translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${((a * (200 + h1 * 300) * (k % 2 ? 1 : -1)) % 360).toFixed(0)}) scale(${(0.8 + h2 * 0.7).toFixed(2)},${(0.3 + 0.7 * abs(cos(a * (3 + h1 * 3) + k))).toFixed(2)})`); c.style.opacity = party; });
    bursts.forEach((p, k) => { const e = k % 4, j = floor(k / 4), a = t - CW2[e]; if (a < 0 || a > 1.1) return off(p); on(p); const ang = j * 0.628 + e, r = 330 * (1 - (1 - a / 1.1) ** 2); p.setAttribute('fill', j % 3 ? CWC[e] : '#fff'); T.setT(p, `translate(${(GX[e] + r * cos(ang)).toFixed(1)},${(GY - 330 + r * sin(ang) + 260 * a * a).toFixed(1)}) scale(${(1.3 - a).toFixed(2)})`); p.style.opacity = (1 - a / 1.1).toFixed(2); });
    claps.forEach((c, k) => { const a = max(bump(t, 40.5, 0.22), bump(t, 40.96, 0.22)); if (a < 0.05) return off(c); on(c); T.setT(c, `translate(${GX[k]},${GY - 100 * GS}) scale(${(0.6 + a).toFixed(2)}) rotate(${k * 20})`); c.style.opacity = a.toFixed(2); });
  }

  T.seek = seek;
  T.speed = speed;
})();
