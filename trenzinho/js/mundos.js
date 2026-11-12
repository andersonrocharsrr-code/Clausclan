'use strict';
// Mundos: cenários em camadas (paralaxe) por onde o trenzinho passa.
(() => {
  const C = T.C, A = T.A, f1 = A.f1;
  const { sin, cos, PI, floor } = Math;
  const R = T.RAIL;
  const FL = [C.coral, C.gold, C.lilac, C.white, C.orange, C.pink];

  const PAL = {
    dia: { sky: ['#7CCBF5', '#DDF3FD'], mt: ['#9DB7E3', '#B9CCF0', '#FFFFFF'], h1: ['#A5DDB4', '#BFE8C8'], h2: ['#7BCB8D', '#97D9A3'], h3: ['#5DBF7C', '#7DD094'], gr: ['#4FB56E', '#63C381'], fo: ['#2F9A5F', '#3FAE70'], tr: [['#3DB57C', '#6FD29E', '#2A9364'], ['#58C06A', '#8ADB8E', '#3C9E52'], ['#2FA58A', '#63C9AE', '#22836E']], cl: {}, wall: C.cream, roofs: [[C.coral, C.coralD], [C.lilac, C.lilacD], [C.orange, '#D9742A'], [C.sky, C.skyD]] },
    tarde: { sky: ['#8E7CC9', '#F9B27A'], mt: ['#8B76C4', '#A690D6', '#F9D7B0'], h1: ['#B79BB4', '#C9ADC2'], h2: ['#86A98C', '#9ABA9B'], h3: ['#5F8F7C', '#74A08A'], gr: ['#4C8A6B', '#5C9A78'], fo: ['#2D6652', '#387761'], tr: [['#3F8F6C', '#62AC86', '#2C7055'], ['#4F9A63', '#73B480', '#3A7C4C'], ['#35826F', '#59A28D', '#276456']], cl: { c: '#FFE3C2', sh: '#F4B79A', op: 0.9 }, wall: '#FBE3C0', roofs: [['#D9564E', '#B8433F'], ['#9478C7', '#7A61AB'], ['#DF7A35', '#BE6327'], ['#5C9BD1', '#4A80B1']], win: '#FFE27A' }
  };
  PAL.campo = Object.assign({}, PAL.dia, { sky: ['#86D2F7', '#E6F7FE'] });
  PAL.mata = Object.assign({}, PAL.dia, { sky: ['#BDE9D6', '#EAF8E4'], gr: ['#46A968', '#59B878'], fo: ['#27875A', '#34996A'] });
  T.PAL = PAL;

  const jit = (rnd, W, n) => { const a = []; for (let i = 0; i < n; i++) a.push((i + 0.15 + 0.7 * rnd()) * W / n); return a; };
  const pick = (rnd, arr) => arr[floor(rnd() * arr.length)];
  const skyDef = (P, id) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.sky[0]}"/><stop offset="1" stop-color="${P.sky[1]}"/></linearGradient></defs><rect x="-200" y="-200" width="2320" height="1000" fill="url(#${id})"/>`;
  const clouds = (rnd, W, n, P, y0, y1, s0, s1) => jit(rnd, W, n).map(x => A.cloud(f1(x), f1(y0 + (y1 - y0) * rnd()), f1(s0 + (s1 - s0) * rnd()), P.cl)).join('');
  const treeAt = (rnd, P, x, y, s, o) => { const t = pick(rnd, P.tr); return rnd() < 0.3 ? A.pine(f1(x), f1(y), s, t[0], t[2]) : A.tree(f1(x), f1(y), s, t[0], t[1], t[2], o); };
  const houseAt = (rnd, P, x, y, s) => { const r = pick(rnd, P.roofs); return A.house(f1(x), f1(y), s, P.wall, r[0], r[1], { win: P.win }); };

  // Mundo lateral. kind: vale | tarde | mata | ponte | campo | estacao | praca
  T.mkWorld = (kind, sAt) => {
    const P = PAL[{ vale: 'dia', tarde: 'tarde', mata: 'mata', ponte: 'dia', campo: 'campo', estacao: 'dia', praca: 'campo' }[kind]];
    const rnd = T.rng({ vale: 11, tarde: 23, mata: 37, ponte: 41, campo: 59, estacao: 67, praca: 73 }[kind]);
    const back = T.el('g', {}), front = T.el('g', {}), L = [];
    const tile = (where, f, W, html, drift) => { const g = T.tile(where, W, html); L.push({ g, f, tile: 1, drift: drift || 0 }); return g; };
    const free = (where, f, html) => { const g = T.g(where, html); L.push({ g, f }); return g; };
    T.g(back, skyDef(P, T.uid('sky')));
    const sun = T.g(back, kind === 'tarde' ? A.sun(86, '#FF9E5E', '#FFC48A') : A.sun(54));
    const sunPos = kind === 'tarde' ? [1440, 400] : kind === 'mata' ? [1500, 150] : [1560, 150];
    let rainbow = null;
    if (kind === 'vale' || kind === 'campo' || kind === 'praca') rainbow = T.g(back, A.rainbow(760, 700, 620, 22), { opacity: 0.6 });
    const static_ = kind === 'estacao' || kind === 'praca';

    if (kind === 'mata') {
      T.g(back, `<g fill="${C.cream}" opacity=".35"><path d="M900,-50 L1300,-50 L700,800 L420,800Z"/><path d="M1400,-50 L1620,-50 L1180,800 L1020,800Z"/><path d="M400,-50 L560,-50 L120,800 L20,800Z"/></g>`);
      const wall = (W, base, n, c, cl, r0, r1) => { let s = `<rect x="0" y="${base}" width="${W}" height="600" fill="${c}"/>`; for (const x of jit(rnd, W, n)) { const r = r0 + (r1 - r0) * rnd(); s += `<circle cx="${f1(x)}" cy="${f1(base + 10 - r * 0.5 * rnd())}" r="${f1(r)}" fill="${c}"/><circle cx="${f1(x - r * 0.25)}" cy="${f1(base - r * 0.45)}" r="${f1(r * 0.4)}" fill="${cl}" opacity=".5"/>`; } return s; };
      tile(back, 0.08, 2400, wall(2400, 430, 26, '#A9DDB5', '#C4EACB', 70, 120));
      tile(back, 0.2, 2400, wall(2400, 540, 22, '#7DCB92', '#9ADBA8', 70, 110) + jit(rnd, 2400, 9).map(x => `<rect x="${f1(x)}" y="560" width="16" height="140" fill="#6B8F6E" opacity=".6"/>`).join(''));
      const fn2 = A.hillFn(2880, 690, [[10, 2, 1], [6, 5, 2]]);
      tile(back, 0.4, 2880, jit(rnd, 2880, 16).map(x => treeAt(rnd, P, x, fn2(x) + 6, 1.5 + 0.7 * rnd(), { trunk: C.brownD })).join('') + A.hill(fn2, 2880, P.h2[0], P.h2[1]));
    } else {
      const cl = tile(back, 0.03, 2400, clouds(rnd, 2400, 6, P, 90, 330, 0.7, 1.5), 9);
      if (kind === 'tarde') cl.setAttribute('opacity', 0.85);
      back.insertBefore(sun, cl);
      tile(back, 0.06, 2400, A.mountains(2400, 640, 6, 210, 360, P.mt[0], P.mt[1], kind.length * 7 + 3, P.mt[2]));
      const fn1 = A.hillFn(2400, 592, [[22, 2, 0.5], [10, 5, 2]]);
      let s1 = A.hill(fn1, 2400, P.h1[0], P.h1[1]);
      for (const x of jit(rnd, 2400, 14)) s1 += rnd() < 0.25 ? houseAt(rnd, P, x, fn1(x) + 8, 0.42) : treeAt(rnd, P, x, fn1(x) + 8, 0.36 + 0.2 * rnd());
      if (kind === 'campo' || kind === 'praca') s1 += A.windmill(900, f1(fn1(900) + 6), 0.95) + A.windmill(2050, f1(fn1(2050) + 6), 0.7);
      tile(back, 0.15, 2400, s1);
    }
    if (kind === 'ponte') {
      // rio largo com ondinhas
      T.g(back, `<defs><linearGradient id="agua" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FD3F4"/><stop offset="1" stop-color="${C.skyD}"/></linearGradient></defs><rect x="-200" y="632" width="2320" height="500" fill="url(#agua)"/><rect x="-200" y="632" width="2320" height="7" fill="#fff" opacity=".5"/>`);
      const waves = (W, y, n, s, op) => jit(rnd, W, n).map(x => `<path d="M${f1(x)},${f1(y + 30 * rnd())} q${10 * s},-${7 * s} ${20 * s},0 q${10 * s},${7 * s} ${20 * s},0 q${10 * s},-${7 * s} ${20 * s},0" fill="none" stroke="#fff" stroke-width="${3 * s}" stroke-linecap="round" opacity="${op}"/>`).join('');
      tile(back, 0.25, 1920, waves(1920, 656, 12, 0.6, 0.6) + `<g transform="translate(700,676)"><path d="M-46,0 h92 l-14,18 h-64Z" fill="${C.coral}"/><rect x="-2" y="-70" width="4" height="70" fill="${C.brown}"/><path d="M4,-68 L46,-8 H4Z" fill="${C.cream}"/><path d="M-4,-60 L-34,-8 H-4Z" fill="${C.goldL}"/></g>`, 14);
      tile(back, 0.5, 1920, waves(1920, 712, 11, 0.9, 0.55), 24);
      let br = `<rect x="0" y="744" width="480" height="9" rx="4" fill="${C.brownL}"/>`;
      for (let x = 30; x < 480; x += 120) br += `<rect x="${x - 6}" y="738" width="12" height="64" rx="4" fill="${C.brown}"/><path d="M${x},754 L${x + 120},800 M${x + 120},754 L${x},800" stroke="${C.brownL}" stroke-width="5" opacity=".8"/>`;
      br += `<rect x="0" y="${R + 9}" width="480" height="24" fill="${C.brown}"/><rect x="0" y="${R + 9}" width="480" height="7" fill="${C.brownL}"/><rect x="0" y="${R + 27}" width="480" height="6" fill="${C.brownD}"/>`;
      for (let x = 12; x < 480; x += 48) br += `<rect x="${x}" y="${R + 5}" width="24" height="9" rx="3" fill="${C.brownD}"/>`;
      br += `<rect x="0" y="${R}" width="480" height="9" fill="#7C869B"/><rect x="0" y="${R}" width="480" height="3" fill="#C3CBDA"/>`;
      for (const x of [90, 330]) br += `<rect x="${x - 13}" y="${R + 33}" width="26" height="300" fill="${C.brown}"/><rect x="${x + 3}" y="${R + 33}" width="10" height="300" fill="${C.brownD}"/><ellipse cx="${x}" cy="965" rx="46" ry="9" fill="#fff" opacity=".45"/>`;
      br += `<path d="M90,${R + 40} L330,${R + 150} M330,${R + 40} L90,${R + 150} M330,${R + 40} L570,${R + 150} M570,${R + 40} L330,${R + 150}" stroke="${C.brownL}" stroke-width="12"/><path d="M-150,${R + 40} L90,${R + 150} M90,${R + 40} L-150,${R + 150}" stroke="${C.brownL}" stroke-width="12"/>`;
      tile(back, 1, 480, br);
      tile(front, 1.3, 1920, waves(1920, 930, 9, 1.5, 0.6), 40);
      tile(front, 1.6, 1920, waves(1920, 1010, 8, 2, 0.6) + jit(rnd, 1920, 5).map(x => `<g transform="translate(${f1(x)},1050)"><ellipse rx="44" ry="13" fill="${C.green}"/><path d="M0,0 L44,-6 L44,6Z" fill="${C.skyD}"/><circle cx="-8" cy="-6" r="9" fill="${C.pink}"/><circle cx="-8" cy="-6" r="4" fill="${C.gold}"/></g>`).join(''), 30);
    } else {
      if (kind !== 'mata') {
        const fn2 = A.hillFn(2880, 668, [[20, 2, 1.3], [9, 5, 0.4]]);
        let s2 = '';
        if (kind === 'campo' || kind === 'praca') { const cs = [C.lilac, C.coralL, C.goldL, C.pink, '#8BD6A0']; cs.forEach((c, i) => { s2 += `<path d="${A.hillPath(fn2, 2880, i * 17)}" fill="${c}"/>`; }); s2 += `<path d="${A.hillPath(fn2, 2880, 85)}" fill="${P.h2[0]}"/>`; }
        else s2 = A.hill(fn2, 2880, P.h2[0], P.h2[1]);
        if (kind === 'vale' || kind === 'tarde') s2 += `<ellipse cx="1500" cy="${f1(fn2(1500) + 52)}" rx="250" ry="20" fill="${kind === 'tarde' ? '#F4B79A' : C.skyL}"/><ellipse cx="1470" cy="${f1(fn2(1500) + 50)}" rx="120" ry="7" fill="#fff" opacity=".5"/>`;
        if (!static_) for (const x of jit(rnd, 2880, 13)) { const y = fn2(x) + 8; s2 += rnd() < 0.3 ? houseAt(rnd, P, x, y, 0.85) : treeAt(rnd, P, x, y, 0.75 + 0.35 * rnd(), { apples: kind === 'vale' && rnd() < 0.3 }); }
        if (!static_) s2 += A.fence(300, 800, x => fn2(x) + 30) + A.fence(1900, 2500, x => fn2(x) + 30);
        tile(back, 0.4, 2880, s2);
      }
      const fn3 = A.hillFn(2880, 748, [[9, 3, 2], [4, 7, 1]]);
      let s3 = A.hill(fn3, 2880, P.h3[0], P.h3[1]);
      for (const x of jit(rnd, 2880, kind === 'campo' ? 44 : 26)) {
        const y = fn3(x) + 12, q = rnd();
        if (kind === 'campo') s3 += q < 0.45 ? A.tulip(f1(x), f1(y), 0.8 + 0.4 * rnd(), ...pick(rnd, [[C.coral, C.coralD], [C.lilac, C.lilacD], [C.gold, C.goldD], [C.pink, '#E58CA0']])) : q < 0.8 ? A.flower(f1(x), f1(y), 0.9, pick(rnd, FL)) : q < 0.9 ? `<circle cx="${f1(x)}" cy="${f1(y - 24)}" r="30" fill="${C.goldL}"/><circle cx="${f1(x)}" cy="${f1(y - 24)}" r="20" fill="none" stroke="${C.goldD}" stroke-width="4" opacity=".5"/><circle cx="${f1(x)}" cy="${f1(y - 24)}" r="8" fill="${C.goldD}" opacity=".5"/>` : A.bush(f1(x), f1(y), 0.9, P.tr[0][0], P.tr[0][1]);
        else if (kind === 'mata') s3 += q < 0.3 ? A.fern(f1(x), f1(y), 0.9, P.tr[1][2]) : q < 0.5 ? A.mushroom(f1(x), f1(y), 0.9, pick(rnd, [C.coral, C.orange, C.lilac])) : q < 0.75 ? A.bush(f1(x), f1(y), 1.1, P.tr[2][0], P.tr[2][1]) : A.flower(f1(x), f1(y), 0.9, pick(rnd, FL));
        else if (!static_) s3 += q < 0.3 ? A.bush(f1(x), f1(y), 0.8 + 0.5 * rnd(), P.tr[0][0], P.tr[0][1]) : q < 0.45 ? A.rock(f1(x), f1(y), 0.8) : q < 0.8 ? A.flower(f1(x), f1(y), 0.9, pick(rnd, FL)) : treeAt(rnd, P, x, y, 0.8);
      }
      tile(back, 0.75, 2880, s3);
    }
    const timed = free(back, 0.75, '');     // adereços com hora marcada (cores do verso 1)
    const anchored = free(back, 1, '');      // construções dos mundos parados
    if (kind !== 'ponte') {
      let sg = `<rect x="0" y="770" width="1920" height="340" fill="${P.gr[0]}"/><rect x="0" y="${R + 38}" width="1920" height="300" fill="${P.gr[1]}"/>`;
      if (static_) {
        const pv = kind === 'estacao' ? ['#F3E3C3', '#E6D2AC', '#FBF0D9'] : ['#F6E2C6', '#EBC9A6', '#FFF1DC'];
        sg += `<rect x="0" y="${R + 38}" width="1920" height="300" fill="${pv[0]}"/><rect x="0" y="${R + 38}" width="1920" height="10" fill="${pv[1]}"/>`;
        for (let i = 0; i < 5; i++) sg += `<rect x="0" y="${R + 80 + i * 48 + i * i * 4}" width="1920" height="4" fill="${pv[1]}" opacity=".7"/>`;
        for (let x = 0; x < 1920; x += 160) sg += `<path d="M${x + 60},${R + 48} L${x},1100" stroke="${pv[1]}" stroke-width="4" opacity=".6"/>`;
        if (kind === 'estacao') sg += `<rect x="0" y="752" width="1920" height="30" fill="#E6D2AC"/><rect x="0" y="752" width="1920" height="8" fill="#FBF0D9"/><rect x="0" y="772" width="1920" height="8" fill="${C.gold}"/>`;
      }
      sg += A.track(1920);
      if (!static_) for (const x of jit(rnd, 1920, 22)) { const y = R + 60 + 150 * rnd(), q = rnd(); sg += q < 0.5 ? A.tuft(f1(x), f1(y), 0.9, P.gr[0]) : q < 0.7 ? `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="12" ry="6" fill="#D7D3E3"/>` : `<circle cx="${f1(x)}" cy="${f1(y)}" r="6" fill="${pick(rnd, FL)}"/><circle cx="${f1(x)}" cy="${f1(y)}" r="2.5" fill="${C.gold}"/>`; }
      tile(back, 1, 1920, sg);
    }
    const sea = free(back, 1, '');
    if (kind === 'vale' && sAt) {
      // vermelho: macieiras; amarelo: girassóis; verde: árvores bem folhudas
      let s = '';
      for (let i = 0; i < 6; i++) { const x = 1250 + sAt(18.1 + i * 0.62) * 0.75; s += A.tree(f1(x), 778, 1.55, C.green, C.greenL, C.greenD, { apples: 1, amp: 2 }); }
      for (let i = 0; i < 16; i++) { const x = 1300 + sAt(21.4 + i * 0.24) * 0.75; s += A.sunflower(f1(x), 790, 1.25 + 0.5 * ((i * 7) % 3) / 2); }
      for (let i = 0; i < 8; i++) { const x = 1250 + sAt(28.0 + i * 0.5) * 0.75, t = P.tr[i % 3]; s += A.tree(f1(x), 780, 1.9 + 0.3 * (i % 2), t[0], t[1], t[2], { amp: 3.5 }); }
      timed.innerHTML = s;
      // azul: o mar ao lado do trilho
      const xa = 900 + sAt(25.0), xb = 1300 + sAt(29.0);
      let w = `<path d="M${xa},${R + 46} Q${xa - 90},960 ${xa - 30},1100 L${xb + 30},1100 Q${xb + 90},960 ${xb},${R + 46}Z" fill="${C.sky}"/><path d="M${xa + 6},${R + 46} Q${xa - 60},940 ${xa - 6},1100 L${xa + 60},1100 Q${xa + 10},950 ${xa + 60},${R + 46}Z" fill="${C.skyL}" opacity=".7"/>`;
      for (let x = xa + 90; x < xb - 60; x += 170) for (let r = 0; r < 3; r++) w += `<path d="M${x + r * 60},${R + 80 + r * 60} q14,-10 28,0 q14,10 28,0 q14,-10 28,0" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".75"/>`;
      for (let x = xa + 420; x < xb - 200; x += 760) w += `<g transform="translate(${x},${R + 120})"><path d="M-60,0 h120 l-18,26 h-84Z" fill="${C.coral}"/><rect x="-3" y="-96" width="6" height="96" fill="${C.brown}"/><path d="M6,-94 L62,-10 H6Z" fill="${C.cream}"/><path d="M-6,-82 L-46,-10 H-6Z" fill="${C.goldL}"/></g>`;
      sea.innerHTML = w;
    }
    let extra = null;
    if (kind === 'estacao') {
      // estação colorida
      let b = `<g transform="translate(960,752)">` + A.tree(-640, 0, 2.1, P.tr[0][0], P.tr[0][1], P.tr[0][2]) + A.tree(660, 0, 2.3, P.tr[1][0], P.tr[1][1], P.tr[1][2]) + A.pine(-800, 0, 1.9, P.tr[2][0], P.tr[2][2]) + A.pine(820, 0, 1.7, P.tr[2][0], P.tr[2][2]) +
        `<rect x="-470" y="-250" width="940" height="252" rx="10" fill="${C.cream}"/><rect x="-470" y="-60" width="940" height="62" fill="${C.creamD}"/><rect x="-90" y="-420" width="180" height="230" rx="10" fill="#FBE9C8"/>
<path d="M-112,-416 L0,-512 L112,-416Z" fill="${C.coral}" stroke="${C.coral}" stroke-width="12" stroke-linejoin="round"/><path d="M0,-516 L116,-414 L40,-414Z" fill="${C.coralD}" opacity=".5"/><rect x="-4" y="-566" width="7" height="50" fill="${C.brown}"/><path class="flag" d="M3,-566 L52,-552 L3,-538Z" fill="${C.gold}"/>
<circle cx="0" cy="-340" r="50" fill="#fff" stroke="${C.blue}" stroke-width="10"/><g fill="${C.ink}"><circle cx="0" cy="-376" r="3.5"/><circle cx="0" cy="-304" r="3.5"/><circle cx="-36" cy="-340" r="3.5"/><circle cx="36" cy="-340" r="3.5"/></g><g transform="translate(0,-340)"><rect class="hh" x="-3.5" y="-24" width="7" height="27" rx="3" fill="${C.ink}"/><rect class="hm" x="-2.5" y="-36" width="5" height="39" rx="2.5" fill="${C.coral}"/><circle r="5" fill="${C.ink}"/></g>
<path d="M-510,-246 L-450,-316 H-96 V-246Z M510,-246 L450,-316 H96 V-246Z" fill="${C.coral}"/><path d="M-510,-246 H-96 v14 H-510Z M510,-246 H96 v14 H510Z" fill="${C.coralD}"/>`;
      for (let x = -500; x < 500; x += 40) if (x < -110 || x > 80) b += `<path d="M${x},-234 h40 a20,20 0 0 1 -40,0Z" fill="${(x / 40) % 2 ? C.cream : C.gold}"/>`;
      for (const x of [-390, -250, 250, 390]) b += `<rect x="${x - 44}" y="-196" width="88" height="96" rx="44" fill="${C.blue}" opacity=".25"/><path d="M${x - 38},-104 v-48 a38,38 0 0 1 76,0 v48Z" fill="#BDE4F8"/><path d="M${x - 38},-104 v-48 a38,38 0 0 1 76,0 v48Z" fill="none" stroke="#fff" stroke-width="7"/><path d="M${x},-190 V-104 M${x - 38},-146 H${x + 38}" stroke="#fff" stroke-width="5"/><rect x="${x - 50}" y="-104" width="100" height="16" rx="6" fill="${C.brownL}"/>` + [-30, 0, 30].map(d => `<circle cx="${x + d}" cy="-110" r="11" fill="${FL[(x + d + 600) % 5]}"/>`).join('');
      b += `<path d="M-52,2 v-130 a52,52 0 0 1 104,0 v130Z" fill="${C.blue}"/><path d="M-40,2 v-128 a40,40 0 0 1 80,0 v128Z" fill="${C.blueD}"/><path d="M0,-166 V2" stroke="${C.blue}" stroke-width="6"/><circle cx="-10" cy="-70" r="5" fill="${C.gold}"/><circle cx="10" cy="-70" r="5" fill="${C.gold}"/>
<rect x="-560" y="-74" width="8" height="76" fill="${C.ink}"/><rect x="-600" y="-150" width="88" height="80" rx="12" fill="${C.green}"/><rect x="-590" y="-140" width="68" height="60" rx="8" fill="${C.cream}"/><g transform="translate(-556,-110) scale(.16)"><rect x="-150" y="-60" width="200" height="90" rx="30" fill="${C.blue}"/><rect x="-170" y="-100" width="90" height="130" rx="14" fill="${C.blueD}"/><rect x="40" y="-110" width="34" height="60" fill="${C.coral}"/><circle cx="-110" cy="50" r="40" fill="${C.coral}"/><circle cx="10" cy="50" r="40" fill="${C.coral}"/></g></g>`;
      for (const x of [330, 1590]) b += `<g transform="translate(${x},752)"><rect x="-6" y="-250" width="12" height="252" rx="5" fill="${C.ink}"/><path d="M-30,-250 h60 l-10,-44 h-40Z" fill="${C.goldL}"/><path d="M-36,-296 h72 l-12,-16 h-48Z" fill="${C.ink}"/><circle cy="-262" r="46" fill="${C.goldL}" opacity=".3"/></g>`;
      anchored.innerHTML = b + `<g transform="translate(600,752)"><rect x="-70" y="-44" width="140" height="12" rx="5" fill="${C.brownL}"/><rect x="-70" y="-78" width="140" height="10" rx="5" fill="${C.brownL}"/><rect x="-70" y="-62" width="140" height="10" rx="5" fill="${C.brown}"/><rect x="-58" y="-80" width="10" height="82" fill="${C.ink}"/><rect x="48" y="-80" width="10" height="82" fill="${C.ink}"/></g>` + A.bunting(250, 470, 870, 380, 26, 12) + A.bunting(1050, 380, 1670, 470, 26, 12);
      const pot = (x, y, s, c) => `<g transform="translate(${x},${y}) scale(${s})"><g transform="translate(0,-60)">${A.bush(0, 0, 1.2, C.green, C.greenL)}${A.flower(-30, -20, 0.9, c)}${A.flower(24, -26, 1, C.gold, { mid: C.coral })}${A.flower(0, -34, 0.9, C.lilac)}</g><path d="M-52,-64 h104 l-12,64 h-80Z" fill="${C.orange}"/><rect x="-58" y="-74" width="116" height="20" rx="8" fill="#D9742A"/></g>`;
      extra = free(front, 1.25, pot(70, 1090, 1.9, C.coral) + pot(1850, 1090, 1.9, C.pink));
    }
    if (kind === 'praca') {
      let b = '';
      const cols = [[C.coralL, C.coralD], [C.goldL, C.orange], [C.skyL, C.blue], ['#BFE8C8', C.greenD], [C.lilacL, C.lilacD], [C.cream, C.coral], [C.pink, C.coralD]];
      cols.forEach((c, i) => { const x = 130 + i * 280, s = 2.6 + (i % 2) * 0.35; b += A.house(x, 760, s, c[0], c[1], c[1]) + A.tree(x + 140, 760, 1.5 + (i % 3) * 0.2, P.tr[i % 3][0], P.tr[i % 3][1], P.tr[i % 3][2]); });
      // coreto
      b += `<g transform="translate(960,756)"><rect x="-190" y="-40" width="380" height="44" rx="8" fill="${C.cream}"/><rect x="-190" y="-40" width="380" height="12" rx="6" fill="#fff"/>` + [-170, -60, 60, 170].map(x => `<rect x="${x - 7}" y="-250" width="14" height="212" fill="${C.cream}"/>`).join('') + `<path d="M-230,-246 Q0,-420 230,-246Z" fill="${C.lilac}"/><path d="M0,-334 Q120,-320 230,-246 H60Z" fill="${C.lilacD}" opacity=".5"/><circle cx="0" cy="-340" r="14" fill="${C.gold}"/><path d="M-230,-246 h460 v16 h-460Z" fill="${C.lilacD}"/>` + [-200, -150, -100, -50, 0, 50, 100, 150].map((x, i) => `<path d="M${x},-230 h50 a25,25 0 0 1 -50,0Z" fill="${i % 2 ? C.cream : C.gold}"/>`).join('') + `</g>`;
      for (const x of [240, 1680]) b += `<rect x="${x - 7}" y="250" width="14" height="510" rx="6" fill="${C.cream}"/><circle cx="${x}" cy="248" r="14" fill="${C.gold}"/>`;
      anchored.innerHTML = b + A.bunting(240, 262, 960, 300, 44, 16) + A.bunting(960, 300, 1680, 262, 44, 16);
      let fr = A.bunting(-40, 40, 700, 70, 50, 14) + A.bunting(1220, 70, 1960, 40, 50, 14);
      const bc = [[C.coral, C.coralL], [C.gold, C.goldL], [C.sky, C.skyL], [C.green, C.greenL], [C.lilac, C.lilacL], [C.orange, C.goldL]];
      [[110, 700], [210, 640], [300, 720], [1630, 720], [1720, 640], [1820, 700]].forEach(([x, y], i) => { fr += `<g data-sw="${x},${y + 330},3">${A.balloon(x, y, 1.5, bc[i][0], bc[i][1])}<path d="M${x},${y + 240} L${x < 960 ? 200 : 1720},1010" stroke="${C.cream}" stroke-width="3"/></g>`; });
      for (const x of [200, 1720]) fr += `<path d="M${x - 46},1000 h92 l-12,90 h-68Z" fill="${C.sky}"/><rect x="${x - 54}" y="988" width="108" height="22" rx="9" fill="${C.skyD}"/>`;
      extra = free(front, 1, fr);
    }
    if (kind === 'mata') {
      let tr = '';
      for (const x of [300]) tr += `<rect x="${x - 80}" y="-20" width="160" height="1120" fill="#4E3626"/><rect x="${x + 10}" y="-20" width="70" height="1120" fill="#3D2A1D"/><path d="M${x - 50},300 q20,40 0,90 M${x - 30},620 q24,40 0,80" stroke="#6A4A34" stroke-width="10" fill="none" stroke-linecap="round"/>` + [-170, -80, 30, 130, 220].map((d, i) => `<circle cx="${x + d}" cy="${-10 + (i % 2) * 34}" r="${98 + (i % 3) * 14}" fill="${i % 2 ? '#1F7A50' : '#27875A'}"/>`).join('');
      const g = T.tile(front, 2600, tr); L.push({ g, f: 2.2, tile: 1, drift: 0, late: 1 });
    }
    if (!static_ && kind !== 'ponte') {
      const fnF = A.hillFn(2880, 1012, [[16, 2, 0.4], [7, 5, 1.1]]);
      let sf = '';
      for (const x of jit(rnd, 2880, 26)) { const y = fnF(x) + 16, q = rnd(); sf += q < 0.4 ? (kind === 'campo' ? A.tulip(f1(x), f1(y), 1.7, ...pick(rnd, [[C.coral, C.coralD], [C.lilac, C.lilacD], [C.gold, C.goldD]])) : A.flower(f1(x), f1(y), 1.7, pick(rnd, FL), { stem: '#1F7A50', leaf: P.fo[1] })) : q < 0.6 ? (kind === 'mata' ? A.fern(f1(x), f1(y), 1.7, P.fo[1]) : A.bush(f1(x), f1(y + 10), 1.5, P.fo[1], P.gr[1])) : q < 0.7 ? A.mushroom(f1(x), f1(y), 1.5) : A.tuft(f1(x), f1(y), 2.2, P.fo[1]); }
      sf += A.hill(fnF, 2880, P.fo[0], P.fo[1]);
      const fg = T.tile(front, 2880, sf); L.unshift({ g: fg, f: 1.5, tile: 1, drift: 0 });
      if (kind === 'mata') front.insertBefore(fg, front.firstChild);
    }
    const sways = T.collectSways(back).concat(T.collectSways(front));
    const spins = [...back.querySelectorAll('.spin'), ...front.querySelectorAll('.spin')].map(e => ({ e, sp: +e.getAttribute('data-sp') }));
    const rays = sun.querySelector('.rays'), hh = back.querySelector('.hh'), hm = back.querySelector('.hm');
    return {
      kind, back, front, sun, rainbow, anchor: 0,
      update(t, scroll, o) {
        o = o || {};
        const sp = o.sun || sunPos;
        T.setT(sun, `translate(${sp[0]},${sp[1]}) scale(${o.sunS || 1})`); T.setT(rays, `rotate(${(t * 9) % 360})`);
        for (const l of L) { const off = (scroll - (l.tile ? 0 : this.anchor)) * l.f + (l.drift || 0) * t; if (l.tile) T.scrollTile(l.g, off); else T.setT(l.g, `translate(${(-off).toFixed(1)},0)`); }
        T.runSways(sways, t, o.wind || 1);
        for (const s of spins) T.setT(s.e, `rotate(${(t * s.sp) % 360})`);
        if (hh) { T.setT(hh, `rotate(${(t * 3 + 60) % 360})`); T.setT(hm, `rotate(${(t * 36) % 360})`); }
        if (rainbow) rainbow.style.opacity = o.rainbow == null ? 0.6 : o.rainbow;
      }
    };
  };

  // Vista geral do vale (abertura e despedida ao pôr do sol), com o trem pequeno lá longe.
  T.vy = x => 652 + 36 * sin(x / 310 + 0.6) + 13 * sin(x / 140 + 2);
  T.mkVista = sunset => {
    const P = sunset ? PAL.tarde : PAL.dia, rnd = T.rng(sunset ? 5 : 9), vy = T.vy;
    const g = T.el('g', {});
    T.g(g, skyDef(P, T.uid('sky')).replace('height="1000"', 'height="1500"'));
    let stars = null;
    if (sunset) { let s = ''; for (let i = 0; i < 40; i++) s += `<path d="${A.star4}" transform="translate(${f1(1920 * rnd())},${f1(330 * rnd())}) scale(${f1(0.25 + 0.4 * rnd())})" fill="#FFF4DD" opacity="${f1(0.4 + 0.5 * rnd())}"/>`; stars = T.g(g, s); }
    const sun = T.g(g, sunset ? A.sun(100, '#FF9E5E', '#FFC48A') : A.sun(62)); T.setT(sun, sunset ? 'translate(1330,455)' : 'translate(1620,170)');
    if (!sunset) T.g(g, A.rainbow(900, 690, 640, 24), { opacity: 0.75 });
    const cl = T.g(g, clouds(rnd, 2600, 7, P, 80, 330, 0.8, 1.7));
    const far = T.g(g, A.mountains(2400, 640, 7, 220, 400, P.mt[0], P.mt[1], sunset ? 4 : 8, P.mt[2]));
    T.setT(far, 'translate(-240,0)');
    const fn1 = A.hillFn(2400, 600, [[26, 2, 0.5], [10, 5, 2]]);
    let s1 = A.hill(fn1, 2400, P.h1[0], P.h1[1]);
    for (const x of jit(rnd, 2400, 18)) s1 += rnd() < 0.25 ? houseAt(rnd, P, x, fn1(x) + 8, 0.42) : treeAt(rnd, P, x, fn1(x) + 8, 0.34 + 0.2 * rnd());
    s1 += A.windmill(700, f1(fn1(700) + 6), 0.8) + `<path d="M1300,${f1(fn1(1300) + 10)} q-40,40 10,90 l60,0 q-30,-50 -20,-90Z" fill="${sunset ? '#F4B79A' : C.skyL}"/>`;
    const hl = T.g(g, s1); T.setT(hl, 'translate(-240,0)');
    // morro do meio com o trilho
    const mid = T.el('g', {}, g);
    let d = 'M-300,1100', rail = '';
    for (let x = -300; x <= 2220; x += 30) { d += `L${x},${f1(vy(x) + 4)}`; rail += `${x ? 'L' : 'M'}${x},${f1(vy(x))}`; }
    rail = rail.replace(/^L/, 'M');
    const waterC = sunset ? '#B9A3DC' : C.sky, waterL = sunset ? '#F9CDB0' : C.skyL;
    let sm = `<path d="${d}L2220,1100Z" fill="${P.h2[1]}"/><path d="${d.replace(/,(\d+\.\d)/g, (m, v) => ',' + f1(+v + 10))}L2220,1110Z" fill="${P.h2[0]}"/>`;
    sm += `<path d="M1085,${f1(vy(1085))} Q1010,800 1160,900 Q1330,1010 1040,1100 L420,1100 Q900,1000 880,900 Q850,790 1015,${f1(vy(1015))}Z" fill="${waterC}"/><path d="M1040,720 q20,-8 40,0 M930,880 q30,-12 60,0 q30,12 60,0 M760,1020 q40,-14 80,0 q40,14 80,0 M1000,790 q24,-10 48,0" fill="none" stroke="${waterL}" stroke-width="6" stroke-linecap="round"/>`;
    for (const [x, y, s] of [[250, 770, 1.15], [520, 850, 1.3], [1450, 800, 1.2], [1700, 880, 1.35], [690, 760, 0.95]]) sm += houseAt(rnd, P, x, y, s);
    for (const [x, y, s] of [[120, 800, 1.2], [380, 790, 1.0], [640, 900, 1.4], [1320, 780, 1.0], [1570, 830, 1.3], [1850, 800, 1.2], [1250, 900, 1.5], [330, 940, 1.6], [1560, 990, 1.5], [800, 770, 0.9], [-80, 870, 1.5], [2020, 900, 1.6]]) sm += treeAt(rnd, P, x, y, s, { apples: !sunset && rnd() < 0.35 });
    sm += A.fence(140, 460, () => 880) + A.fence(1380, 1640, () => 930);
    for (const x of jit(rnd, 2200, 34)) { const y = 760 + 260 * rnd(); if (Math.abs(x - 1000) > 220 || y < 700) sm += A.flower(f1(x - 100), f1(y), 0.6, pick(rnd, FL), { amp: 3 }); }
    sm += `<path d="${rail}" fill="none" stroke="${C.brown}" stroke-width="13" stroke-dasharray="6 10" transform="translate(0,4)"/><path d="${rail}" fill="none" stroke="#7C869B" stroke-width="5"/><path d="${rail}" fill="none" stroke="#C3CBDA" stroke-width="1.6" transform="translate(0,-1.5)"/>`;
    for (const x of [1010, 1050, 1090]) sm += `<rect x="${x - 5}" y="${f1(vy(x) + 6)}" width="10" height="44" fill="${C.brown}"/>`;
    sm += `<g transform="translate(180,${f1(vy(180) - 2)}) scale(.8)"><rect x="-70" y="-64" width="140" height="64" rx="5" fill="${P.wall}"/><path d="M-86,-60 L-56,-96 H56 L86,-60Z" fill="${C.coral}"/><rect x="-14" y="-38" width="28" height="38" rx="12" fill="${C.blue}"/><rect x="-54" y="-44" width="24" height="22" rx="4" fill="${P.win || '#BDE4F8'}"/><rect x="30" y="-44" width="24" height="22" rx="4" fill="${P.win || '#BDE4F8'}"/></g>`;
    mid.innerHTML = sm;
    const slot = T.el('g', {}, mid);
    const fore = T.el('g', {}, g);
    const t0 = P.tr[0], t1 = P.tr[2];
    fore.innerHTML = `<path d="M-300,1100 L-300,930 Q60,860 420,1000 Q560,1050 640,1100Z M2220,1100 L2220,900 Q1900,850 1560,1010 Q1460,1060 1400,1100Z" fill="${P.fo[0]}"/>` + A.tree(40, 960, 3.1, t0[0], t0[1], t0[2], { amp: 1.2, trunk: C.brownD }) + A.tree(1880, 950, 3.3, t1[0], t1[1], t1[2], { amp: 1.2, trunk: C.brownD }) + A.bush(300, 1010, 2, P.fo[1], P.gr[1]) + A.bush(1620, 1030, 2.2, P.fo[1], P.gr[1]) + [[220, 1060, C.coral], [420, 1080, C.gold], [520, 1090, C.lilac], [1500, 1090, C.pink], [1700, 1080, C.gold], [1420, 1100, C.coral], [120, 1090, C.white]].map(([x, y, c]) => A.flower(x, y, 1.8, c, { stem: '#1F7A50' })).join('');
    const sways = T.collectSways(g), spins = [...g.querySelectorAll('.spin')].map(e => ({ e, sp: +e.getAttribute('data-sp') })), rays = sun.querySelector('.rays');
    return {
      g, slot, stars, update(t, pan) {
        T.setT(cl, `translate(${(-340 + t * 7 - pan * 0.1).toFixed(1)},0)`); T.setT(far, `translate(${(-240 - pan * 0.2).toFixed(1)},0)`); T.setT(hl, `translate(${(-240 - pan * 0.4).toFixed(1)},0)`);
        T.setT(mid, `translate(${(-pan * 0.7).toFixed(1)},0)`); T.setT(fore, `translate(${(-pan * 1.5).toFixed(1)},0)`);
        T.setT(rays, `rotate(${(t * 8) % 360})`); T.runSways(sways, t); for (const s of spins) T.setT(s.e, `rotate(${(t * s.sp) % 360})`);
      }
    };
  };
})();
