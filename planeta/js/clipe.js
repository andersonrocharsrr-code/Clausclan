'use strict';
// A Viagem ao Planeta dos Números: linha do tempo. Cada instante é desenhado a partir do tempo da música (T.seek(t)).
(() => {
  T.DUR = 150.76; T.BEAT = 0.428; T.BEAT0 = 0.40;
  const C = T.C, A = T.A, P = T.P, f1 = A.f1;
  const { sin, cos, PI, abs, floor, min, max, sqrt } = Math;
  const { lerp, ramp, sm, smr, bump, kf, clamp } = T;
  const svg = document.getElementById('palco');
  const frac = v => v - floor(v);
  const space = T.mkSpace(), site = T.mkSite();
  svg.appendChild(space.g);
  const sp = T.el('g', {}, svg), gBeam = T.el('g', {}, sp), gBack = T.el('g', {}, sp), gObj = T.el('g', {}, sp), gFront = T.el('g', {}, sp), gRocket = T.el('g', {}, sp), gHero = T.el('g', {}, sp), gNum = T.el('g', {}, sp);
  svg.appendChild(site.g);
  const top = T.el('g', {}, svg);

  // ---------- Peças ----------
  const ALL = [];
  const reg = o => { o.g = o.g || o; if (!o.g.nodeType) o = { g: o }; ALL.push(o); return o; };
  const wrap = el => reg({ g: el });
  const use = (o, parent) => { if (o.g.parentNode !== parent) parent.appendChild(o.g); o.used = true; return o; };
  const rocket = reg(T.mkRocket());
  const hero = reg(T.mkAstro(0, P.turq, P.turqD)), heroW = T.mkAstro(0, P.turq, P.turqD); rocket.slot.appendChild(heroW.head);
  const friends = [[1, P.pink, P.pinkD], [2, P.yel, P.yelD], [3, P.pur, P.purD], [4, P.mint, P.mintD]].map(a => reg(T.mkAstro(...a)));
  const stars = [...Array(9)].map(() => reg(T.mkStar()));
  const moons = [reg(T.mkMoon(false)), reg(T.mkMoon(true))], comet = reg(T.mkComet());
  const PC = [[P.pink, P.pinkD, '#FFC2D9', P.yel], [P.mint, P.mintD, '#C4F5E6', P.pur], [P.pur, P.purD, '#DCCFFA', P.pink], [P.yel, P.yelD, '#FFEFB0', P.turq], [P.turq, P.turqD, '#B6EEF3', P.pink], [P.orange, '#E07F3A', '#FFD0A8', P.mint]];
  const planets = [0, 1, 2].map(i => reg(T.mkPlanet(...PC[i])));
  const minis = [...Array(10)].map((_, i) => reg(T.mkPlanet(...PC[i % 6], 90, false)));
  const bigP = reg(T.mkPlanet(P.pur, P.purD, '#DCCFFA', P.mint, 90, false)), sun = reg(T.mkSun());
  const aliens = [...Array(6)].map((_, i) => reg(T.mkAlien(i))), robots = [...Array(8)].map((_, i) => reg(T.mkRobot(i)));
  const mrk = [...Array(7)].map((_, i) => wrap(T.mkMini([P.turq, P.pink, P.yel, P.mint, P.pur, P.orange, P.turq][i])));
  const hands = [reg(T.mkHand()), reg(T.mkHand())];
  const B = {}, R = {}; for (let n = 1; n <= 10; n++) { B[n] = wrap(T.mkNum(n, 230, T.NUMC[n - 1])); R[n] = wrap(T.mkNum(n, 150, T.NUMC[n - 1])); }
  const QM = [0, 1, 2].map(i => wrap(T.mkNum('?', 170, [P.pink, P.mint, P.yel][i]))), EX = [0, 1, 2].map(i => wrap(T.mkNum('!', 190, [P.yel, P.pink, P.mint][i])));
  const CD = [3, 2, 1].map((n, i) => wrap(T.mkNum(n, 460, [P.pink, P.yel, P.mint][i])));
  // lua com crateras (alienígenas), linha de luz (9 estrelas), feixes (5 estrelas), cabo do astronauta
  const moonS = wrap(T.g(null, `<circle r="760" fill="#9C96D6"/><circle r="760" fill="none" stroke="#BDB8EA" stroke-width="18"/>` + [[-420, -560, 70], [-150, -660, 46], [140, -640, 84], [420, -540, 56], [-560, -420, 40], [560, -400, 44], [0, -520, 50], [-280, -470, 34], [290, -430, 38]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.6}" fill="#7F79BF"/><ellipse cx="${x}" cy="${y + r * 0.14}" rx="${r * 0.8}" ry="${r * 0.42}" fill="#6C66AD"/>`).join('')));
  const lineP = T.el('path', { fill: 'none', stroke: P.pink, 'stroke-width': 16, 'stroke-linecap': 'round', opacity: 0.75 }, gBeam), lineP2 = T.el('path', { fill: 'none', stroke: '#fff', 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0.9 }, gBeam);
  const beams = [...Array(5)].map(() => T.el('polygon', { fill: P.yel }, gBeam));
  const tether = T.el('path', { fill: 'none', stroke: P.white, 'stroke-width': 6, 'stroke-linecap': 'round', opacity: 0.8 }, gRocket);
  const sparks = [...Array(16)].map((_, i) => T.g(gNum, `<path d="${A.star4}" fill="${i % 2 ? '#fff' : P.yel}"/>`));
  const hearts = [...Array(6)].map((_, i) => T.g(top, `<path d="${A.heart}" fill="${[P.pink, P.red, P.pinkD][i % 3]}" transform="scale(4)"/><text ${T.FONT} font-size="44" text-anchor="middle" y="6" fill="#fff">${[1, 2, 3, 4, 5, 10][i]}</text>`));
  const CF = [P.pink, P.mint, P.yel, P.pur, P.turq, P.orange];
  const confetti = [...Array(90)].map((_, i) => T.g(top, i % 3 === 0 ? `<path d="${T.starD(10, 4.5)}" fill="${CF[i % 6]}"/>` : i % 3 === 1 ? `<rect x="-9" y="-5" width="18" height="10" rx="2" fill="${CF[i % 6]}"/>` : `<circle r="7" fill="${CF[i % 6]}"/>`));
  const flash = T.el('rect', { width: 1920, height: 1080, fill: '#fff', opacity: 0 }, top);
  const endT = T.el('g', {}, top);
  const el2 = (txt, size, y) => `<g><text ${T.FONT} font-size="${size}" text-anchor="middle" y="${y}" fill="${P.navy}" stroke="${P.navy}" stroke-width="${size * 0.3}" stroke-linejoin="round" opacity=".6">${txt}</text><text ${T.FONT} font-size="${size}" text-anchor="middle" y="${y}" fill="#fff" stroke="#fff" stroke-width="${size * 0.16}" stroke-linejoin="round">${txt}</text><text ${T.FONT} font-size="${size}" text-anchor="middle" y="${y}">${[...txt].map((ch, i) => `<tspan fill="${[P.pinkD, P.turqD, P.purD, '#E59A1F', P.mintD][i % 5]}">${ch}</tspan>`).join('')}</text></g>`;
  endT.innerHTML = el2('Até a próxima expedição!', 118, 0) + el2('Tchau, amiguinhos da imaginação!', 88, 150);
  const fade = T.el('rect', { width: 1920, height: 1080, fill: '#0B0F2A' }, top);

  const put = (o, x, y, s, rot) => T.setT(o.g, `translate(${f1(x)},${f1(y)}) rotate(${f1(rot || 0)}) scale(${(+s).toFixed(3)})`);
  const slide = (t, a, b) => (1 - T.back(ramp(t, a, a + 0.7))) * 1700 - 2600 * ramp(t, b - 0.45, b) ** 2;
  const popN = (o, t, tp, x, y, s, parent) => { if (t < tp) return; use(o, parent || gNum); put(o, x, y + 8 * sin(t * 3 + x), max(0.001, T.pop(t, tp, 0.5)) * s * (1 + 0.07 * T.bounce(t)), 5 * sin(t * 2.2 + x)); };

  // ---------- Foguete no espaço ----------
  function rocketPose(t) {
    const bob = 26 * sin(t * 1.6), wob = 4 * sin(t * 1.3);
    let x = 330, y = 560 + bob, s = 0.85, rot = 90 + wob;
    const to = (k, X, Y, S) => { x = lerp(x, X, k); y = lerp(y, Y + bob, k); s = lerp(s, S, k); };
    if (t < 19.0) { const u = smr(t, 17.3, 19.0); x = lerp(860, 330, u); y = lerp(470, 560 + bob, u) - 120 * sin(PI * u); rot = lerp(0, 90 + wob, u); s = lerp(1.05, 0.85, u); }
    to(smr(t, 41.4, 45.5) * (1 - smr(t, 46.3, 47.2)), 900, 760, 0.72);
    to(smr(t, 46.3, 47.4) * (1 - smr(t, 66.6, 67.6)), 800, 580, 1.0);
    if (t > 60.2 && t < 63.6) { const u = sm(ramp(t, 60.3, 63.4)), th = 4 * PI * u; x = 800 + 250 * sin(th); y = 580 + 250 * (1 - cos(th)) - 250 + bob * 0.3; rot = 90 + th * 57.2958; }
    to(smr(t, 66.6, 67.6) * (1 - smr(t, 73.6, 74.3)), 330, 420, 0.6);
    to(smr(t, 73.6, 74.4) * (1 - smr(t, 94.2, 94.9)), 290, 600, 0.6);
    to(smr(t, 94.2, 94.9) * (1 - smr(t, 101.2, 101.9)), lerp(220, 1700, ramp(t, 94.7, 100.8)), 820, 0.55);
    to(smr(t, 101.2, 102.0) * (1 - smr(t, 114.8, 115.6)), 200, 940, 0.42);
    to(smr(t, 114.8, 115.8), 1560, 540 + 90 * sin(t * 1.7), 0.8);
    if (t > 127.9) { const u = ramp(t, 127.9, 128.8); x += 900 * u * u; y += 700 * u * u; rot += 50 * u; }
    return { x, y, s, rot };
  }
  const scrollAt = (() => { const v = kf([[0, 0], [17, 0], [18.5, 300], [46, 300], [47.5, 520], [66.5, 520], [67.5, 160], [73.8, 160], [74.6, 300], [94.3, 300], [95, 200], [101.4, 200], [102, 60], [114.8, 60], [115.6, 560], [128, 560], [141, 40], [151, 40]]); const tab = []; let d = 0; for (let i = 0; i <= 15100; i++) { tab.push(d); d += v(i / 100) / 100; } return t => tab[clamp(floor(t * 100), 0, 15100)]; })();

  const heroBase = t => ({ x: 0, y: 0, s: 1, aL: 14, aR: 14, mouth: T.sing(t), blink: (t % 3.2) < 0.13, head: 4 * sin(t * 2), helmY: 0 });

  function seek(t) {
    t = clamp(t, 0, T.DUR);
    for (const o of ALL) o.used = false;
    const b = T.beat(t), bn = T.bounce(t), sc = scrollAt(t);
    const siteK = t < 17.3 ? 1 - ramp(t, 16.6, 17.3) : ramp(t, 128.2, 128.8) * (1 - ramp(t, 141.0, 142.4));
    T.show(site.g, siteK > 0); site.g.style.opacity = siteK; T.show(sp, t > 16.5 && t < 142.4);
    space.update(t, sc, t > 67 && t < 74 ? 1.9 : 1);
    T.show(lineP, false); T.show(lineP2, false); beams.forEach(e => T.show(e, false)); T.show(tether, false);
    let flashK = 0;
    hearts.forEach(h => T.show(h, false));

    // ================= BASE (decolagem e pouso) =================
    if (siteK > 0) {
      const landing = t > 100;
      let ry = 846, rx = 860, fl = 0, rsq = 0, press = 0, smoke = 0;
      const hp = heroBase(t); hp.s = 1.15; hp.x = 1130; hp.y = 905 - 6 * bn;
      let heroOn = true, winOn = false;
      if (!landing) {
        hp.helmY = t < 9.45 ? -1000 : lerp(-520, 0, T.back(ramp(t, 9.45, 10.1)));
        if (t < 2.9) { hp.aR = 150 + 24 * sin(t * 9); hp.look = -1; hp.mouth = 0; }
        else if (t < 6.3) { hp.y -= 60 * (bump(t, 3.7, 0.5) + bump(t, 4.9, 0.5)); hp.aL = 150 + 14 * sin(t * 9); hp.aR = 150 - 14 * sin(t * 9); }
        else if (t < 9.3) { hp.aL = 100 + 60 * sin(PI * b); hp.aR = 100 - 60 * sin(PI * b); hp.rot = 6 * T.swing(t, 2); }
        else if (t < 11.2) { hp.head = t < 10.1 ? -10 : 8 * sin(t * 14); hp.aL = hp.aR = t < 10.1 ? 150 : 40; hp.sq = 0.12 * bump(t, 10.02, 0.25); }
        else { const u = smr(t, 11.2, 11.9); hp.x = lerp(1130, 1216, u); hp.aR = lerp(30, 98, u) + 5 * sin(t * 8); hp.look = 1; hp.y -= 26 * (bump(t, 12.74, 0.35) + bump(t, 13.32, 0.35) + bump(t, 14.12, 0.3)); const pr = bump(t, 14.4, 0.3); hp.aR += 22 * pr; press = pr; }
        if (t > 14.62) { const u = ramp(t, 14.62, 15.15), e = sm(u); hp.x = lerp(1216, 860, e); hp.y = lerp(905, 700, e) - 240 * sin(PI * u); hp.s = lerp(1.15, 0.4, e); hp.rot = -360 * e; hp.aL = hp.aR = 160; heroOn = u < 1; winOn = u >= 1; }
        fl = smr(t, 14.5, 15.1) * (1 + 0.2 * sin(t * 30)); smoke = smr(t, 14.5, 14.9) * (1 - smr(t, 16.2, 17.0));
        if (t > 15.2) ry = 846 - 900 * ((t - 15.2) / 1.5) ** 2;
        if (t > 14.5 && t < 15.8) rx += 5 * sin(t * 70);
        [12.74, 13.32, 14.12].forEach((tp, i) => { const a = t - tp, o = CD[i]; if (a < 0 || a > (i < 2 ? 0.56 : 0.5)) return; use(o, top); put(o, 960, 380, T.back(min(1, a * 5)) * (1 - 0.5 * ramp(a, 0.4, 0.56)), 6 * sin(a * 18)); o.g.style.opacity = 1 - ramp(a, 0.42, 0.56); });
        flashK = 0.5 * bump(t, 14.46, 0.4);
      } else {
        const u = ramp(t, 128.6, 131.2), e = 1 - (1 - u) ** 2.4; ry = lerp(-520, 846, e); fl = lerp(1.1, 0.3, smr(t, 129.6, 130.7)) * (1 - smr(t, 130.8, 131.25)); smoke = smr(t, 130.2, 131.0) * (1 - smr(t, 131.6, 133.0)) * 0.8; rsq = 0.1 * bump(t, 131.2, 0.4);
        winOn = t < 132.1; heroOn = t >= 132.1;
        if (t < 132.8) { const v = ramp(t, 132.1, 132.8), e2 = sm(v); hp.x = lerp(860, 1130, e2); hp.y = lerp(700, 905, e2) - 200 * sin(PI * v); hp.s = lerp(0.4, 1.15, e2); hp.aL = hp.aR = 160; }
        else if (t < 135.7) { hp.aL = hp.aR = lerp(30, -34, smr(t, 132.9, 133.4)); hp.head = 6 * T.swing(t, 2); hp.rot = 4 * T.swing(t, 2); }
        else { hp.aR = 150 + 26 * sin(t * 10); hp.aL = t > 139 ? 150 - 26 * sin(t * 10) : 30; hp.head = -8; hp.y -= 40 * bump(t, 139.2, 0.5); }
        // amigos acenando lá do céu
        const fk = T.pop(t, 135.6, 0.6);
        if (t > 135.6) { use(stars[0], site.back).set(420, 250 + 16 * sin(t * 2), 0.8 * fk, 8 * sin(t * 2), t, { mouth: T.sing(t) }); use(moons[0], site.back).set(1500, 230 + 14 * sin(t * 1.7), 0.75 * fk, 10 * sin(t * 2), t); use(moons[1], site.back).set(1720, 330 + 14 * sin(t * 1.9), 0.6 * fk, -10 * sin(t * 2), t); use(aliens[0], site.back).set(170, 420 + 14 * sin(t * 2.2), 0.7 * fk, 8 * sin(t * 3), t, 1); use(aliens[3], site.back).set(720, 190 + 14 * sin(t * 2.5), 0.6 * fk, -8 * sin(t * 3), t, 1); use(robots[0], site.back).set(1180, 300 + 12 * sin(t * 2), 0.6 * fk, 6 * sin(t * 2.4), t); }
        hearts.forEach((h, k) => { const a = t - 133.0 - k * 0.3; if (a < 0 || a > 2.4) return T.show(h, false); T.show(h, true); const u2 = a / 2.4; T.setT(h, `translate(${f1(1040 + k * 90 + 30 * sin(a * 3 + k))},${f1(640 - 330 * u2)}) scale(${(T.back(min(1, a * 3)) * 0.9).toFixed(2)})`); h.style.opacity = (1 - u2 * u2).toFixed(2); });
      }
      const siteRocket = t < 16.6 || t >= 128.8;
      if (siteRocket) { use(rocket, site.slot).set(rx, ry, 1, 0, t, fl); T.setT(rocket.g, `translate(${f1(rx)},${f1(ry)}) scale(${(1 + rsq).toFixed(3)},${(1 - rsq).toFixed(3)})`); }
      T.show(heroW.head, winOn); if (winOn) { heroW.pose(Object.assign(heroBase(t), { x: 0, y: 0 })); T.setT(heroW.head, `rotate(${f1(5 * sin(t * 3))})`); }
      if (heroOn) use(hero, site.slot).pose(hp);
      site.update(t, { dawn: landing ? 0.85 : 0, press, smoke });
      let cx, cy, z;
      if (landing) { cx = kf([[131.6, 960], [132.6, 1040], [135.6, 1040], [136.4, 960]])(t); cy = kf([[128.2, 500], [131.6, 560], [132.6, 640], [135.6, 640], [136.4, 540], [141, 480]])(t); z = kf([[131.6, 1.04], [132.6, 1.3], [135.6, 1.3], [136.4, 1]])(t); }
      else { cx = kf([[2.9, 960], [9.0, 1000], [9.7, 1150], [12.5, 1180], [12.9, 1230], [14.5, 1230], [15.1, 960]])(t); cy = kf([[0, 600], [2.9, 660], [9.0, 670], [9.7, 690], [12.5, 690], [12.9, 700], [14.5, 700], [15.1, 560]])(t); z = kf([[0, 1.1], [2.9, 1.3], [9.0, 1.35], [9.7, 1.6], [12.5, 1.6], [12.9, 1.8], [14.5, 1.8], [15.1, 1.05]])(t); if (t > 15.2) cy -= 0.8 * (846 - ry); cx += (t > 14.5 && t < 16 ? 4 * sin(t * 61) : 0); }
      cy = min(cy, 1080 - 540 / z); cx = clamp(cx, 960 / z, 1920 - 960 / z);
      T.setT(site.g, `translate(960,540) scale(${z.toFixed(4)}) translate(${f1(-cx)},${f1(-cy)})`);
      // na passagem para o espaço o foguete fica por cima, sem sumir junto com a base
      if (t >= 16.6 && t < 17.3) { use(rocket, top).set((rx - cx) * z + 960, (ry - cy) * z + 540, z, 0, t, fl); top.insertBefore(rocket.g, top.firstChild); }
    }

    // ================= ESPAÇO =================
    if (t > 16.5 && t < 142.4 && !(siteK >= 1)) {
      const rp = rocketPose(t), inSpace = t < 128.9;
      if (t >= 17.3 && inSpace) { { use(rocket, gRocket).set(rp.x, rp.y, rp.s, rp.rot, t, 0.75 + 0.15 * sin(t * 5)); const out = (t > 67.3 && t < 73.7) || (t > 101.6 && t < 115.3); T.show(heroW.head, !out); if (!out) { heroW.pose(Object.assign(heroBase(t), { x: 0, y: 0 })); T.setT(heroW.head, `rotate(${f1(5 * sin(t * 3))})`); } } }
      let dx;
      // 1 estrelinha
      if (t >= 17.3 && t < 24.25) { dx = slide(t, 17.6, 24.25); use(stars[0], gFront).set(1150 + dx, 540 + 20 * sin(t * 2), 2.5, 6 * sin(t * 1.5), t, { mouth: T.sing(t) }); popN(B[1], t, 19.04, 1600 + dx, 300, 1); }
      // 2 luas
      if (t >= 24.25 && t < 27.55) { dx = slide(t, 24.25, 27.55); const th = (t - 24.3) * 2.6; moons.forEach((m, i) => { const sgn = i ? -1 : 1; use(m, gFront).set(1190 + dx + sgn * 270 * cos(th), 590 + sgn * 110 * sin(th), 1.6, sgn * 14 * sin(t * 3), t, T.sing(t)); }); popN(B[2], t, 25.62, 1190 + dx, 220, 1); }
      // cometa de chapéu
      if (t >= 27.5 && t < 31.3) { const u = ramp(t, 27.55, 31.2), e = 0.5 + 4 * (u - 0.5) ** 3; use(comet, gFront).set(lerp(-250, 2900, e), 500 + 140 * sin(u * PI * 2), 1.6, 6 * cos(u * PI * 2), t); }
      // 3 planetas
      if (t >= 31.0 && t < 34.4) { dx = slide(t, 31.0, 34.4); planets.forEach((p, i) => use(p, gFront).set(830 + i * 400 + dx, 610 + 26 * sin(t * 2 + i * 2), 1.3, t, -14 + 8 * sin(t * 1.6 + i), T.sing(t))); popN(B[3], t, 31.16, 1240 + dx, 220, 1); }
      // 4 astronautas
      if (t >= 34.3 && t < 38.0) { dx = slide(t, 34.3, 38.0); friends.forEach((f, i) => { const u = ramp(t, 36.0 + i * 0.22, 36.9 + i * 0.22); use(f, gFront).pose({ x: 800 + i * 290 + dx, y: 780 + 30 * sin(t * 2 + i * 1.6), s: 1.4, rot: 10 * sin(t * 1.4 + i) + 360 * sm(u), aR: 150 + 26 * sin(t * 10 + i), aL: i % 2 ? 150 - 26 * sin(t * 10 + i) : 40, kL: 10 * sin(t * 3 + i), kR: -10 * sin(t * 3 + i), mouth: T.sing(t, i * 0.02), blink: ((t + i) % 3) < 0.12 }); }); popN(B[4], t, 34.4, 1225 + dx, 210, 1); }
      // 5 estrelinhas e o clarão
      if (t >= 37.95 && t < 46.6) {
        dx = slide(t, 37.95, 46.6); const up = smr(t, 41.2, 42.2);
        for (let i = 0; i < 5; i++) { const on = T.pop(t, 38.04 + i * 0.4, 0.4), x = lerp(800 + i * 220, 520 + i * 300, up) + dx, y = lerp(500, 250, up) + 14 * sin(t * 2.4 + i); use(stars[i], gFront).set(x, y, 0.5 + 0.5 * on, 6 * sin(t * 2 + i), t, { mouth: on > 0.9 ? T.sing(t) : 0, blink: on < 0.5 }); stars[i].g.style.opacity = 0.35 + 0.65 * min(1, on);
          if (t > 41.2) { const bk = smr(t, 41.3 + i * 0.12, 42.0 + i * 0.12); T.show(beams[i], true); beams[i].setAttribute('points', `${f1(x - 20)},${f1(y)} ${f1(x + 20)},${f1(y)} ${f1(x + 150)},1100 ${f1(x - 250)},1100`); beams[i].setAttribute('opacity', (0.2 * bk * (0.8 + 0.2 * sin(t * 5 + i))).toFixed(3)); } }
        popN(B[5], t, 38.04, lerp(1240, 1120, up) + dx, lerp(220, 560, up), lerp(1, 1.25, up)); flashK = max(flashK, 0.45 * bump(t, 40.1, 0.5));
      } else for (const s of stars) s.g.style.opacity = 1;
      // refrão: 1, 2, 3
      for (const c0 of [53.42, 121.94]) if (t >= c0 && t < c0 + 6.4) { const out = ramp(t, c0 + 5.6, c0 + 6.4); [0, 0.48, 0.9].forEach((d, i) => { const big = c0 > 100 ? 0.8 : 1; popN(B[i + 1], t, c0 + d, (c0 > 100 ? 420 : 1180) + i * 250, (c0 > 100 ? 190 : 250) - 900 * out * out - 46 * big * bump(frac(b + i * 0.33), 0, 0.5) * (t > c0 + 1.4 ? 1 : 0), big); }); }
      // gira, gira e "sensacional": brilhos em volta do foguete
      const sk = (t > 60.3 && t < 67) ? 1 : (t > 67 && t < 74) ? 2 : (t > 90.9 && t < 94.5) ? 3 : 0;
      sparks.forEach((s, k) => { if (!sk) return T.show(s, false); T.show(s, true); const tw = abs(sin(t * 5 + k * 1.3)); if (sk === 1) { const a = k * 0.4 + t * 1.5, r = 150 + 40 * (k % 3) + (t > 63.5 ? 120 * abs(sin(t * 3 + k)) : 0); T.setT(s, `translate(${f1(rp.x + r * cos(a))},${f1(rp.y + r * sin(a))}) scale(${(0.5 + 1.6 * tw).toFixed(2)})`); } else if (sk === 2) T.setT(s, `translate(${f1(1000 + ((k * 197) % 860))},${f1(120 + ((k * 331) % 820))}) scale(${(0.6 + 2.2 * tw).toFixed(2)}) rotate(${(t * 40) % 90})`); else T.setT(s, `translate(${f1(700 + ((k * 197) % 1100))},${f1(160 + ((k * 331) % 800))}) scale(${(0.4 + 1.4 * tw).toFixed(2)})`); s.setAttribute('opacity', (0.4 + 0.6 * tw).toFixed(2)); });
      // "conta comigo, vem descobrir": astronauta passeando fora da nave
      if (t > 67.3 && t < 73.7) { const u = T.back(ramp(t, 67.3, 68.1)) * (1 - smr(t, 73.1, 73.7)), hx = lerp(rp.x + 40, 760, u), hy = lerp(rp.y, 680, u) + 22 * sin(t * 1.8); const hp = heroBase(t); Object.assign(hp, { x: hx, y: hy, s: lerp(0.3, 1.35, u), rot: 8 * sin(t * 1.3), aR: 128 + 12 * sin(t * 6), aL: 40 + 20 * sin(t * 2), kL: 12 * sin(t * 2.4), kR: -12 * sin(t * 2.4), look: 1, head: -6 }); use(hero, gHero).pose(hp); T.show(tether, true); tether.setAttribute('d', `M${f1(rp.x + 40)},${f1(rp.y)} Q${f1((rp.x + hx) / 2)},${f1(max(rp.y, hy) + 150 + 20 * sin(t * 2))} ${f1(hx - 40 * hp.s)},${f1(hy - 110 * hp.s)}`);
        [70.4, 71.32, 72.0].forEach((tp, i) => { if (t < 73.2) popN(QM[i], t, tp, 1180 + i * 220, 330 + (i % 2) * 150, 1); }); }
      // 6 alienígenas
      if (t >= 73.95 && t < 77.5) { dx = slide(t, 73.95, 77.5); use(moonS, gObj); put(moonS, 1280 + dx, 1560, 1); aliens.forEach((a, i) => { const x = 860 + i * 168, dy = 1560 - sqrt(760 * 760 - (x - 1280) ** 2), up = T.pop(t, 74.04 + i * 0.1, 0.4); use(a, gBack).set(x + dx, dy + 30 + 220 * (1 - up) - 34 * abs(sin(PI * b + (i % 2) * PI / 2)), 1.15, 9 * sin(PI * b + i * PI), t, 0.5 + 0.5 * sin(PI * b + i)); }); popN(B[6], t, 74.04, 1280 + dx, 210, 1); }
      // 7 foguetes
      if (t >= 77.4 && t < 81.0) { mrk.forEach((m, i) => { const u = frac((t - 77.45 - i * 0.11) / 1.75), x = -350 + 2900 * u + (i - 3) * 40, y = 1230 - 1300 * u + (i - 3) * 120; if (t - 77.45 - i * 0.11 < 0 || (t - 77.45 - i * 0.11) > 3.5) return; use(m, gFront); put(m, x, y, 1.25, -24.1); }); if (t < 80.9) popN(B[7], t, 77.46, 1500, 240, 1); if (t > 80.5) B[7].g.style.opacity = 1 - ramp(t, 80.5, 80.9); else B[7].g.style.opacity = 1; }
      // 8 robôs em trenzinho no anel
      if (t >= 80.9 && t < 84.2) { dx = slide(t, 80.9, 84.2); const cx = 1200 + dx, cy = 640, S = 2.5, rx = 90 * 1.75 * S, ry = 90 * 0.42 * S, ca = cos(-14 * PI / 180), sa = sin(-14 * PI / 180); use(bigP, gObj).set(cx, cy, S, t); robots.forEach((r, i) => { const ph = 2.75 - i * 0.36 + (t - 80.9) * 0.34, ex = rx * cos(ph), ey = ry * sin(ph); use(r, sin(ph) >= 0 ? gFront : gBack).set(cx + ex * ca - ey * sa, cy + ex * sa + ey * ca + 40 - 8 * abs(sin(t * 8 + i)), 0.8, -14 + 4 * sin(t * 8 + i), t); }); popN(B[8], t, 80.94, 1200 + dx, 200, 1); }
      // 9 estrelinhas iluminando o caminho
      if (t >= 84.1 && t < 87.8) { dx = slide(t, 84.1, 87.8); let d = '', n = 0; for (let i = 0; i < 9; i++) { const x = 640 + i * 140 + dx, y = 640 - 190 * sin(i / 8 * PI) + 10 * sin(t * 3 + i), on = T.pop(t, 84.12 + i * 0.13, 0.35); if (on > 0) { use(stars[i], gFront).set(x, y, 0.66 * on, 8 * sin(t * 2.4 + i), t, { mouth: T.sing(t) }); d += (n++ ? 'L' : 'M') + f1(x) + ',' + f1(y); } } if (n > 1) { T.show(lineP, true); T.show(lineP2, true); lineP.setAttribute('d', d); lineP2.setAttribute('d', d); lineP.setAttribute('opacity', (0.55 + 0.25 * sin(t * 8)).toFixed(2)); } popN(B[9], t, 84.12, 1200 + dx, 210, 1); }
      // 10 planetinhas em volta do sol
      if (t >= 87.7 && t < 94.6) { dx = slide(t, 87.7, 94.6); const z = 1 + 0.08 * smr(t, 90.9, 94); use(sun, gObj).set(1210 + dx, 600, 0.75 * z, t, T.sing(t)); minis.forEach((m, i) => { const ph = i * PI / 5 + (t - 87.7) * 0.75, on = T.pop(t, 87.78 + i * 0.09, 0.35); use(m, sin(ph) >= 0 ? gFront : gBack).set(1210 + dx + 560 * z * cos(ph), 600 + 250 * z * sin(ph), 0.5 * on * (1 + 0.15 * sin(ph)), t); }); popN(B[10], t, 87.78, 1210 + dx, 160, 0.85); }
      // cada número tem seu lugar: 1 a 10 em fila
      if (t >= 94.6 && t < 101.7) { const out = ramp(t, 101.1, 101.7); for (let n = 1; n <= 10; n++) { const tp = 94.72 + (n - 1) * 0.3, jump = t > 98.0 ? 90 * bump(frac(b / 2 + n * 0.1), 0, 0.5) : 0; if (t >= tp) { use(R[n], gNum); put(R[n], 185 + (n - 1) * 172, 430 + 40 * sin(n * 1.3) - jump - 900 * out * out, max(0.001, T.pop(t, tp, 0.45)) * (1.12 + 0.08 * bump(frac(b + n * 0.2), 0, 0.5)), 6 * sin(t * 2.4 + n)); } } }
      // ponte: quantos dedos?
      if (t > 101.6 && t < 115.3) {
        const u = T.back(ramp(t, 101.6, 102.4)) * (1 - smr(t, 114.7, 115.3)), hp = heroBase(t);
        Object.assign(hp, { x: lerp(rp.x, 960, u), y: lerp(rp.y, 1000, u) - 12 * bn, s: lerp(0.3, 1.75, u), aL: 150 + 8 * sin(t * 6), aR: 150 - 8 * sin(t * 6), head: 5 * T.swing(t, 2) });
        hp.y -= 110 * (bump(t, 104.08, 0.5) + bump(t, 107.48, 0.5) + bump(t, 109.7, 0.5)); if (t > 108.6 && t < 111.7) { const v = ramp(t, 110.3, 111.2); hp.flip = cos(2 * PI * sm(v)); }
        use(hero, gHero).pose(hp);
        hands.forEach((h, i) => { const t0 = i ? 105.12 : 101.95, tf = i ? 107.48 : 104.08, k = T.pop(t, t0, 0.5) * (1 - smr(t, 114.6, 115.2)); if (t < t0) return; use(h, gHero); put(h, i ? 1420 : 500, 640 + 14 * sin(t * 2 + i), 1.25 * max(0.001, k), (i ? 8 : -8) + 6 * sin(t * 3 + i)); h.f.forEach((fg, j) => { const ord = i ? j : 4 - j, e = T.pop(t, tf + ord * 0.08, 0.3), n = (i ? 6 : 1) + ord; let tap = 0; if (t > 111.8) { const tn = n <= 3 ? [111.84, 112.58, 113.46][n - 1] : 113.86 + (n - 4) * 0.14; tap = bump(t, tn, 0.3); } T.setT(fg, `translate(${h.bx[j]},${h.by[j]}) rotate(${h.br[j]}) scale(${(1 + 0.2 * tap).toFixed(2)},${(0.22 + 0.78 * e + 0.25 * tap).toFixed(2)})`); }); });
        if (t < 104.0) [102.2, 102.7, 103.2].forEach((tp, i) => popN(QM[i], t, tp, 760 + i * 200, 300 + (i % 2) * 70, 0.9));
        else if (t < 105.05) { popN(B[5], t, 104.08, 960, 300, 1.7); popN(EX[0], t, 104.2, 1180, 300, 1); popN(EX[1], t, 104.25, 740, 300, 1); }
        else if (t < 107.4) [105.7, 106.2, 106.7].forEach((tp, i) => popN(QM[i], t, tp, 760 + i * 200, 300 + (i % 2) * 70, 0.9));
        else if (t < 108.6) { popN(B[10], t, 107.48, 960, 300, 1.6); popN(EX[0], t, 107.6, 1270, 300, 1); popN(EX[1], t, 107.65, 650, 300, 1); }
        if (t > 111.8) for (let n = 1; n <= 10; n++) { const tn = n <= 3 ? [111.84, 112.58, 113.46][n - 1] : 113.86 + (n - 4) * 0.14, out = ramp(t, 114.8, 115.3); if (t >= tn) { use(R[n], gNum); put(R[n], 240 + (n - 1) * 160, 190 + 50 * (n % 2) - 600 * out * out, max(0.001, T.pop(t, tn, 0.35)) * 0.95, 6 * sin(t * 2.4 + n)); } }
      }
      // refrão final: desfile dos amigos atrás da nave
      if (t > 115.2 && t < 128.9) {
        const k = T.back(ramp(t, 115.3, 116.4)), line = [stars[0], moons[0], moons[1], planets[0], planets[1], planets[2], friends[0], friends[1], friends[2], friends[3], ...aliens];
        line.forEach((o, j) => { const x = rp.x - 230 - j * 104 - (1 - k) * 1900 + (t > 127.9 ? -1600 * ramp(t, 127.9, 128.8) ** 2 : 0), y = 540 + 90 * sin(t * 1.7 - (j + 2) * 0.33) + 30 * sin(t * 4 + j), rot = 10 * sin(t * 1.7 - j * 0.33); use(o, gFront);
          if (j === 0) o.set(x, y, 0.8, rot, t, { mouth: T.sing(t) }); else if (j < 3) o.set(x, y, 0.62, rot, t, T.sing(t)); else if (j < 6) o.set(x, y, 0.52, t, -14 + rot, T.sing(t)); else if (j < 10) o.pose({ x, y: y + 80, s: 0.72, rot, aR: 150 + 24 * sin(t * 10 + j), aL: 40, mouth: T.sing(t), blink: ((t + j) % 3) < 0.12 }); else o.set(x, y + 66, 0.72, rot, t, 0.5 + 0.5 * sin(t * 6 + j)); });
        const cu = frac((t - 115.5) / 4.2); use(comet, gFront).set(-300 + 2900 * cu, 190 + 60 * sin(cu * 6), 0.6, 4, t);
        robots.slice(0, 4).forEach((r, i) => use(r, gFront).set(((t * 230 + i * 110) % 2500) - 300, 1010 - 10 * abs(sin(t * 8 + i)), 0.75, 4 * sin(t * 8 + i), t));
      }
    }
    // ================= FINAL (céu com números e mensagem) =================
    if (t > 141.0) {
      const k = smr(t, 141.2, 142.6);
      for (let n = 1; n <= 10; n++) { const a = n * 0.628 + t * 0.12, big = n % 2; R[n].used = true; if (R[n].g.parentNode !== top) top.insertBefore(R[n].g, endT); put(R[n], 960 + 800 * cos(a), 560 + 410 * sin(a) + 14 * sin(t * 2 + n), 0.75 * k * (1 + 0.06 * sin(t * 3 + n)), 8 * sin(t * 1.4 + n)); R[n].g.style.opacity = 0.9 * k; }
    } else for (let n = 1; n <= 10; n++) R[n].g.style.opacity = 1;
    const et = t - 142.8; T.show(endT, et > 0);
    if (et > 0) { const kk = endT.children; for (let j = 0; j < 2; j++) { const s = T.pop(t, 142.8 + j * 0.7, 0.6); T.setT(kk[j], `translate(960,${f1(470 + 6 * sin(t * 2 + j))}) scale(${max(0.001, s).toFixed(3)}) rotate(${(1 * sin(t * 1.6 + j)).toFixed(2)})`); kk[j].style.opacity = ramp(t, 142.8 + j * 0.7, 142.95 + j * 0.7); } }
    // confete espacial
    const party = max(smr(t, 98.0, 98.5) * (1 - smr(t, 100.9, 101.6)), smr(t, 107.45, 107.7) * (1 - smr(t, 110.5, 111.6)), 0.5 * smr(t, 115.3, 116) * (1 - smr(t, 127.5, 128.5)), 0.45 * smr(t, 142.6, 143.4));
    confetti.forEach((c, k) => { const on = party > 0.01 && (k / confetti.length) < party; T.show(c, on); if (!on) return; const h1 = (k * 0.6180339) % 1, h2 = (k * 0.754877) % 1, y = ((t * (150 + h2 * 150) + h2 * 1300) % 1300) - 100; T.setT(c, `translate(${f1(h1 * 2000 - 40 + 50 * sin(t * (1.5 + h2) + k))},${f1(y)}) rotate(${((t * (200 + h1 * 300) * (k % 2 ? 1 : -1)) % 360).toFixed(0)}) scale(${(0.8 + h2 * 0.8).toFixed(2)},${(0.3 + 0.7 * abs(cos(t * (3 + h1 * 3) + k))).toFixed(2)})`); });
    for (const o of ALL) T.show(o.g, !!o.used);
    flash.setAttribute('opacity', flashK.toFixed(3)); T.show(flash, flashK > 0.005);
    const f = max(ramp(t, 149.7, 150.7), 1 - ramp(t, 0, 0.5)); T.show(fade, f > 0.001); fade.style.opacity = f.toFixed(3);
  }
  T.seek = seek;
})();
