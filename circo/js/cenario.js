'use strict';
// Cenários do circo: lado de fora (cidade e lona), picadeiro, arquibancada de perto e cortinas.
(() => {
  const C = T.C, A = T.A, f1 = A.f1;
  const { sin, cos, PI, sqrt, floor } = Math;
  const RED = '#D9574F', REDD = '#B8433F', CRM = '#F6E3C2', NAVY = '#2B2046', SAND = '#F3D9A4';
  const SKINS = ['#F6C9A0', '#D9A066', '#B97A4B', '#8D5B3F', '#F2B98C'], HAIRS = ['#2B1B17', '#7A5238', '#E9B44C', '#B5562B', '#3A2418'], SHIRTS = [C.coral, C.gold, C.sky, C.green, C.lilac, C.orange, C.pink, C.blue];
  const person = (rnd, x, y, s) => { const sk = SKINS[floor(rnd() * 5)], h = HAIRS[floor(rnd() * 5)], sh = SHIRTS[floor(rnd() * 8)], up = rnd() < 0.3; return `<g transform="translate(${f1(x)},${f1(y)}) scale(${s})"><rect x="-27" y="14" width="54" height="46" rx="18" fill="${sh}"/>${up ? `<rect x="-36" y="-22" width="12" height="44" rx="6" fill="${sh}" transform="rotate(-14 -30 20)"/><circle cx="-39" cy="-24" r="8" fill="${sk}"/><rect x="24" y="-22" width="12" height="44" rx="6" fill="${sh}" transform="rotate(14 30 20)"/><circle cx="39" cy="-24" r="8" fill="${sk}"/>` : ''}<circle r="23" fill="${sk}"/><path d="M-23,-2 Q-24,-26 0,-26 Q24,-26 23,-2 Q12,-14 0,-14 Q-12,-14 -23,-2Z" fill="${h}"/><circle cx="-8" cy="1" r="3" fill="${C.ink}"/><circle cx="8" cy="1" r="3" fill="${C.ink}"/><path d="M-7,10 Q0,17 7,10" stroke="${C.ink}" stroke-width="2.5" fill="none" stroke-linecap="round"/></g>`; };
  const stripesFan = (ax, ay, yb, w, n, c1, c2) => { let s = ''; for (let i = -n; i <= n; i++) s += `<path d="M${ax},${ay} L${ax + i * w - w / 2},${yb} L${ax + i * w + w / 2},${yb}Z" fill="${i % 2 ? c1 : c2}"/>`; return s; };
  const bulbs = (pts, id) => pts.map(([x, y], i) => `<g class="bl${i % 2}"><circle cx="${f1(x)}" cy="${f1(y)}" r="20" fill="#FFE9A0" opacity=".35"/></g><circle cx="${f1(x)}" cy="${f1(y)}" r="8" fill="${[C.goldL, C.coralL, C.skyL, '#fff'][i % 4]}"/>`).join('');
  const caten = (x0, y0, x1, y1, sag, n) => { const p = []; for (let i = 0; i <= n; i++) { const u = i / n; p.push([x0 + (x1 - x0) * u, y0 + (y1 - y0) * u + sag * 4 * u * (1 - u)]); } return p; };
  const line = pts => `<polyline points="${pts.map(p => f1(p[0]) + ',' + f1(p[1])).join(' ')}" fill="none" stroke="${C.ink}" stroke-width="3" opacity=".6"/>`;
  const twinkle = (root, t) => { const a = 0.35 + 0.65 * (sin(PI * T.beat(t)) > 0 ? 1 : 0.15); root.querySelectorAll('.bl0').forEach(e => e.style.opacity = a); root.querySelectorAll('.bl1').forEach(e => e.style.opacity = 1.15 - a); };

  // ---------- Lado de fora ----------
  T.mkExt = () => {
    const g = T.el('g', {}), rnd = T.rng(7);
    let s = `<defs><linearGradient id="ceuE" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7CCBF5"/><stop offset="1" stop-color="#FDF1D6"/></linearGradient></defs><rect x="-100" y="-100" width="2120" height="1000" fill="url(#ceuE)"/><g transform="translate(1640,170)">${A.sun(56)}</g>`;
    const sky = T.g(g, s), cl = T.g(g, A.cloud(260, 170, 1.3) + A.cloud(820, 110, 0.9) + A.cloud(1320, 260, 1.1) + A.cloud(1900, 150, 1.2) + A.cloud(-300, 240, 1));
    const far = T.el('g', {}, g);
    const fn = A.hillFn(1920, 640, [[26, 2, 0.7], [10, 5, 2]]);
    s = A.mountains(2100, 660, 6, 180, 300, '#A9BDE8', '#C2D1F2', 13, '#fff') + A.hill(fn, 1920, '#A5DDB4', '#BFE8C8');
    const cols = [[C.coralL, C.coralD], [C.goldL, C.orange], [C.skyL, C.blue], ['#BFE8C8', C.greenD], [C.lilacL, C.lilacD], [C.cream, C.coral]];
    [[90, 1.9], [300, 2.3], [1640, 2.2], [1840, 1.8], [470, 1.6], [1470, 1.7]].forEach(([x, sc], i) => { s += A.house(x, 760, sc, cols[i][0], cols[i][1], cols[i][1]); });
    s += A.tree(200, 770, 1.4, C.green, C.greenL, C.greenD) + A.tree(1740, 772, 1.5, '#58C06A', '#8ADB8E', '#3C9E52') + A.pine(560, 770, 1.3, '#2FA58A', '#22836E') + A.pine(1380, 770, 1.2, '#2FA58A', '#22836E');
    far.innerHTML = s;
    const mid = T.el('g', {}, g);
    s = `<rect x="-100" y="750" width="2120" height="400" fill="#63C381"/><path d="M-100,790 Q960,740 2020,790 V1100 H-100Z" fill="#4FB56E"/><path d="M880,850 L1040,850 L1400,1100 L520,1100Z" fill="#F6E2C6"/><path d="M880,850 L1040,850 L1080,878 L840,878Z" fill="#EBC9A6"/>`;
    // lonas pequenas dos lados
    for (const [x, c] of [[470, C.sky], [1450, C.gold]]) s += `<rect x="${x - 110}" y="640" width="220" height="200" fill="${CRM}"/>` + [0, 2, 4].map(i => `<rect x="${x - 110 + i * 44}" y="640" width="44" height="200" fill="${c}"/>`).join('') + `<path d="M${x - 140},646 L${x},500 L${x + 140},646Z" fill="${c}"/><path d="M${x - 46},646 L${x},500 L${x + 46},646Z" fill="${CRM}"/><rect x="${x - 3}" y="440" width="6" height="64" fill="${C.brown}"/><path class="flg" d="M${x + 3},442 l46,13 l-46,13Z" fill="${C.coral}"/>`;
    // lona grande
    s += `<rect x="520" y="560" width="880" height="300" fill="${CRM}"/>` + [0, 2, 4, 6, 8, 10].map(i => `<rect x="${520 + i * 80}" y="560" width="80" height="300" fill="${RED}"/>`).join('') + `<rect x="520" y="560" width="880" height="300" fill="${NAVY}" opacity=".08"/>`;
    s += `<g>${stripesFan(960, 226, 574, 100, 5, CRM, RED)}</g>`.replace('<g>', '<g clip-path="url(#teto)">') + `<defs><clipPath id="teto"><path d="M430,574 L960,226 L1490,574Z"/></clipPath></defs><path d="M960,226 L1490,574 L1180,574Z" fill="${NAVY}" opacity=".1"/>`;
    for (let x = 430; x < 1490; x += 66) s += `<path d="M${x},566 h66 v18 a33,33 0 0 1 -66,0Z" fill="${((x - 430) / 66) % 2 ? C.gold : C.goldL}"/>`;
    s += `<rect x="955" y="96" width="10" height="136" fill="${C.brown}"/><circle cx="960" cy="96" r="10" fill="${C.gold}"/><path class="flg" d="M965,104 l110,30 l-110,30Z" fill="${C.coral}"/>`;
    s += `<path d="M830,860 V690 Q960,560 1090,690 V860Z" fill="#3A2350"/><path d="M830,860 V690 Q890,610 960,600 Q900,720 880,860Z" fill="${C.blue}"/><path d="M1090,860 V690 Q1030,610 960,600 Q1020,720 1040,860Z" fill="${C.blue}"/><path d="M830,860 V690 Q960,560 1090,690 V860" fill="none" stroke="${C.gold}" stroke-width="12"/>`;
    s += `<rect x="770" y="470" width="380" height="104" rx="22" fill="${C.gold}"/><rect x="784" y="484" width="352" height="76" rx="14" fill="${RED}"/><text x="960" y="548" text-anchor="middle" font-family="Fredoka, Arial, sans-serif" font-weight="700" font-size="70" letter-spacing="8" fill="${C.cream}">CIRCO</text>`;
    const l1 = caten(960, 226, 240, 470, 60, 12), l2 = caten(960, 226, 1680, 470, 60, 12), l3 = caten(770, 470, 1150, 470, 0, 9);
    s += `<rect x="234" y="470" width="12" height="320" rx="5" fill="${C.cream}"/><rect x="1674" y="470" width="12" height="320" rx="5" fill="${C.cream}"/>` + line(l1) + line(l2) + bulbs(l1.concat(l2, l3));
    s += A.bunting(246, 520, 520, 600, 22, 7) + A.bunting(1400, 600, 1674, 520, 22, 7);
    // bilheteria e balões
    s += `<g transform="translate(300,870)"><rect x="-80" y="-200" width="160" height="200" rx="8" fill="${C.cream}"/><rect x="-80" y="-200" width="40" height="200" fill="${C.sky}"/><rect x="0" y="-200" width="40" height="200" fill="${C.sky}"/><rect x="-56" y="-150" width="112" height="70" rx="10" fill="#3A2350"/><path d="M-100,-196 L0,-270 L100,-196Z" fill="${C.coral}" stroke="${C.coral}" stroke-width="10" stroke-linejoin="round"/><rect x="-66" y="-80" width="132" height="14" rx="6" fill="${C.gold}"/><path d="${A.star4}" fill="${C.gold}" transform="translate(0,-232) scale(1.3)"/></g>`;
    const bc = [[C.coral, C.coralL], [C.gold, C.goldL], [C.sky, C.skyL], [C.green, C.greenL], [C.lilac, C.lilacL]];
    [[1560, 600], [1620, 540], [1690, 610], [1600, 660], [1660, 690]].forEach(([x, y], i) => { s += `<g data-sw="1630,900,2.5">${A.balloon(x, y, 1.2, bc[i][0], bc[i][1])}<path d="M${x},${y + 190} L1630,900" stroke="${C.cream}" stroke-width="2.5"/></g>`; });
    s += `<rect x="1622" y="880" width="16" height="40" rx="4" fill="${C.brown}"/>`;
    for (let i = 0; i < 22; i++) { const x = 40 + rnd() * 1840; if (x > 560 && x < 1360) continue; s += A.flower(f1(x), f1(900 + rnd() * 170), 1 + rnd() * 0.6, [C.coral, C.gold, C.lilac, '#fff', C.pink][i % 5]); }
    mid.innerHTML = s;
    const slot = T.el('g', {}, g);
    const dusk = T.el('rect', { x: -100, y: -100, width: 2120, height: 1280, fill: '#2B2470', opacity: 0 }, g);
    const stars = []; for (let i = 0; i < 46; i++) stars.push(T.g(g, `<path d="M0,0 l-4,-70 l8,0Z" fill="#FFE9A0" opacity=".5"/><path d="${A.star4}" fill="${i % 3 ? C.goldL : '#fff'}"/>`));
    const sways = T.collectSways(g), flags = [...g.querySelectorAll('.flg')], rays = g.querySelector('.rays');
    return {
      g, slot,
      update(t, pan, starK) {
        T.setT(cl, `translate(${f1(t * 9 - pan * 0.1)},0)`); T.setT(far, `translate(${f1(-pan * 0.4)},0)`); T.setT(mid, `translate(${f1(-pan * 0.8)},0)`);
        T.runSways(sways, t); twinkle(g, t); T.setT(rays, `rotate(${(t * 8) % 360})`);
        flags.forEach((f, i) => T.setT(f, `skewY(${f1(7 * sin(t * 5 + i))})`));
        dusk.setAttribute('opacity', (0.5 * starK).toFixed(2));
        stars.forEach((e, k) => { T.show(e, starK > 0.01); if (starK <= 0.01) return; const h1 = (k * 0.618) % 1, h2 = (k * 0.7549) % 1, y = ((t * (420 + h2 * 260) + h2 * 1300) % 1300) - 100; T.setT(e, `translate(${f1(h1 * 2000 - 40 + y * 0.12)},${f1(y)}) rotate(8) scale(${f1(0.9 + h2 * 1.2)})`); e.style.opacity = starK; });
      }
    };
  };

  // ---------- Picadeiro ----------
  T.curbY = x => { const u = Math.max(-1, Math.min(1, (x - 960) / 1000)); return 700 - 66 * sqrt(1 - u * u); };
  T.mkRing = () => {
    const g = T.el('g', {}), rnd = T.rng(31);
    let s = `<defs><linearGradient id="somb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3B1F4A" stop-opacity=".7"/><stop offset="1" stop-color="#3B1F4A" stop-opacity="0"/></linearGradient><linearGradient id="feixe" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity=".06"/></linearGradient><radialGradient id="poca"><stop offset="0" stop-color="#FFF6D8" stop-opacity=".85"/><stop offset="1" stop-color="#FFF6D8" stop-opacity="0"/></radialGradient></defs>`;
    s += `<rect x="-200" y="-200" width="2320" height="1000" fill="${RED}"/>` + stripesFan(960, -520, 720, 190, 7, '#C9504A', '#F1D9B4') + `<rect x="-200" y="-200" width="2320" height="760" fill="url(#somb)"/>`;
    for (let x = -60; x < 1980; x += 120) s += `<path d="M${x},-10 h120 v40 a60,60 0 0 1 -120,0Z" fill="${((x + 60) / 120) % 2 ? C.gold : C.lilac}"/><circle cx="${x + 60}" cy="96" r="9" fill="${C.cream}"/>`;
    const bl = caten(-40, 110, 960, 110, 34, 12).concat(caten(960, 110, 1960, 110, 34, 12));
    s += line(bl) + bulbs(bl);
    const bg = T.g(g, s);
    // arquibancadas
    const rows = [];
    for (let r = 0; r < 3; r++) {
      const y = 452 + r * 62, sc = 0.92 + r * 0.1; let h = `<rect x="-60" y="${y + 48}" width="800" height="70" fill="#6B3F33"/><rect x="1180" y="${y + 48}" width="800" height="70" fill="#6B3F33"/><rect x="-60" y="${y + 48}" width="800" height="9" fill="#8A5644"/><rect x="1180" y="${y + 48}" width="800" height="9" fill="#8A5644"/>`;
      const hs = []; for (let x = -10 + (r % 2) * 36; x < 730; x += 72) hs.push(x); for (let x = 1220 + (r % 2) * 36; x < 1950; x += 72) hs.push(x);
      const a = T.g(g, h + hs.filter((x, i) => i % 2 === 0).map(x => person(rnd, x, y, sc)).join('')), b = T.g(g, hs.filter((x, i) => i % 2).map(x => person(rnd, x, y, sc)).join(''));
      rows.push(a, b);
    }
    T.g(g, `<rect x="-200" y="380" width="2320" height="330" fill="${NAVY}" opacity=".2"/>`);
    // cortina do fundo
    T.g(g, `<rect x="740" y="250" width="440" height="430" fill="#241538"/>`);
    const drape = sx => T.g(g, `<rect x="0" y="0" width="212" height="420" fill="${C.blue}"/>` + [30, 80, 130, 180].map(x => `<rect x="${x}" y="0" width="14" height="420" fill="${C.blueD}" opacity=".6"/>`).join('') + [[50, 90], [150, 170], [70, 280], [160, 350], [110, 40]].map(([x, y]) => `<path d="${A.star4}" fill="${C.gold}" transform="translate(${x},${y}) scale(.9)"/>`).join('') + `<rect x="0" y="400" width="212" height="20" fill="${C.gold}"/>`);
    const dL = drape(-1), dR = drape(1);
    let fr = `<path d="M724,690 V300 Q960,150 1196,300 V690 h-26 V310 Q960,186 750,310 V690Z" fill="${C.gold}"/><path d="M750,312 Q960,186 1170,312 V250 H750Z" fill="${C.gold}"/><path d="M750,300 Q960,170 1170,300 L1170,236 H750Z" fill="${REDD}"/>`;
    for (let x = 750; x < 1170; x += 60) fr += `<path d="M${x},296 h60 a30,30 0 0 1 -60,0Z" fill="${((x - 750) / 60) % 2 ? C.gold : C.goldL}"/>`;
    fr += `<path d="${A.star4}" fill="${C.goldL}" transform="translate(960,222) scale(2.4)"/>`;
    T.g(g, fr);
    // chão e mureta do fundo
    let fl = 'M-200,1200'; for (let x = -200; x <= 2120; x += 40) fl += `L${x},${f1(T.curbY(x) + 30)}`; fl += 'L2120,1200Z';
    let cb = ''; for (let i = 0; i < 20; i++) { const x0 = -40 + i * 100, x1 = x0 + 100; cb += `<path d="M${x0},${f1(T.curbY(x0))} L${x1},${f1(T.curbY(x1))} L${x1},${f1(T.curbY(x1) + 44)} L${x0},${f1(T.curbY(x0) + 44)}Z" fill="${i % 2 ? RED : CRM}"/>` + (i % 2 ? `<path d="${A.star4}" fill="${C.gold}" transform="translate(${x0 + 50},${f1(T.curbY(x0 + 50) + 22)}) scale(.8)"/>` : ''); }
    let top = 'M-40,' + f1(T.curbY(-40)); for (let x = 0; x <= 1960; x += 40) top += `L${x},${f1(T.curbY(x))}`;
    T.g(g, `<path d="${fl}" fill="${SAND}"/><ellipse cx="960" cy="930" rx="820" ry="170" fill="#F8E4B8"/><path d="M960,800 L1010,900 L1130,912 L1040,984 L1068,1090 L960,1034 L852,1090 L880,984 L790,912 L910,900Z" fill="#EFCB8C" opacity=".8"/>${cb}<path d="${top}" fill="none" stroke="${C.gold}" stroke-width="10"/>`);
    // postes, plataformas, corda e trapézio
    let rg = '';
    for (const x of [300, 1620]) { rg += `<rect x="${x - 13}" y="-40" width="26" height="760" fill="${C.goldD}"/>` + [0, 1, 2, 3, 4, 5, 6, 7].map(i => `<rect x="${x - 13}" y="${40 + i * 90}" width="26" height="34" fill="${RED}"/>`).join('') + `<rect x="${x - 90}" y="330" width="180" height="16" rx="6" fill="${C.brown}"/><path d="M${x - 60},346 L${x - 13},400 M${x + 60},346 L${x + 13},400" stroke="${C.brown}" stroke-width="8"/>`; }
    rg += `<path d="M300,330 Q960,352 1620,330" fill="none" stroke="${C.cream}" stroke-width="6"/>`;
    rg += `<g data-sw="960,-30,3"><path d="M900,-30 L920,170 M1020,-30 L1000,170" stroke="${C.cream}" stroke-width="4"/><rect x="906" y="166" width="108" height="10" rx="5" fill="${C.gold}"/></g>`;
    T.g(g, rg);
    const pool = T.el('ellipse', { rx: 260, ry: 56, fill: 'url(#poca)' }, g);
    // adereços
    const ped = T.g(g, `<path d="M-90,0 L-64,-70 H64 L90,0Z" fill="${RED}"/><path d="M-64,-70 H64 L90,0 H30Z" fill="${REDD}" opacity=".5"/><ellipse cx="0" cy="-70" rx="66" ry="14" fill="${C.gold}"/><path d="${A.star4}" fill="${C.gold}" transform="translate(-14,-34) scale(1.3)"/>`);
    const stage = T.el('g', {}, g);
    const drum = T.g(g, `<path d="M-70,-10 L-90,60 M70,-10 L90,60" stroke="${C.brown}" stroke-width="9" stroke-linecap="round"/><rect x="-92" y="-120" width="184" height="120" rx="14" fill="${RED}"/><path d="M-92,-100 L-46,-20 L0,-100 L46,-20 L92,-100" fill="none" stroke="${C.gold}" stroke-width="6"/><rect x="-98" y="-130" width="196" height="22" rx="10" fill="${C.gold}"/><rect x="-98" y="-22" width="196" height="22" rx="10" fill="${C.gold}"/><ellipse class="pele" cx="0" cy="-130" rx="92" ry="20" fill="${C.cream}"/>`);
    const cannon = sx => T.g(g, `<g transform="scale(${sx},1)"><circle cx="-10" cy="-26" r="34" fill="${C.ink}"/><circle cx="-10" cy="-26" r="14" fill="${C.gold}"/><g transform="rotate(-48 0 -40)"><rect x="-10" y="-74" width="150" height="68" rx="18" fill="${C.blue}"/><rect x="110" y="-82" width="34" height="84" rx="10" fill="${C.gold}"/><rect x="20" y="-74" width="16" height="68" fill="${C.gold}"/></g></g>`);
    const cnL = cannon(1), cnR = cannon(-1);
    const beams = [0, 1, 2].map(() => T.el('polygon', { fill: 'url(#feixe)' }, g));
    const tint = T.el('rect', { x: -200, y: -200, width: 2320, height: 1500, opacity: 0 }, g);
    let fc = ''; const fy = x => 1052 + 44 * sqrt(Math.max(0, 1 - ((x - 960) / 1100) ** 2));
    for (let i = 0; i < 20; i++) { const x0 = -40 + i * 100, x1 = x0 + 100; fc += `<path d="M${x0},${f1(fy(x0))} L${x1},${f1(fy(x1))} L${x1},1200 L${x0},1200Z" fill="${i % 2 ? CRM : RED}"/>`; }
    T.g(g, fc);
    const sways = T.collectSways(g), pele = drum.querySelector('.pele');
    return {
      g, stage, drum, ped, cnL, cnR,
      update(t, o) {
        twinkle(g, t); T.runSways(sways, t);
        rows.forEach((r, i) => T.setT(r, `translate(0,${f1(-(o.cheer || 0.3) * 9 * Math.abs(sin(PI * T.beat(t) + i * 0.9)))})`));
        const op = o.open || 0; T.setT(dL, `translate(${f1(750 - op * 150)},264) scale(${f1(1 - op * 0.7)},1)`); T.setT(dR, `translate(${f1(1170 + op * 150)},264) scale(${f1(-(1 - op * 0.7))},1)`);
        T.setT(pool, `translate(${f1(o.px == null ? 960 : o.px)},${f1(o.py || 930)})`); pool.style.opacity = o.pk == null ? 1 : o.pk;
        const tg = o.beams || [[620, 900], [960, 900], [1300, 900]], src = [380, 960, 1540];
        beams.forEach((b, i) => { b.setAttribute('points', `${src[i] - 16},-60 ${src[i] + 16},-60 ${f1(tg[i][0] + 170)},${tg[i][1]} ${f1(tg[i][0] - 170)},${tg[i][1]}`); b.style.opacity = o.bk == null ? 0.3 : o.bk; });
        tint.setAttribute('fill', o.tint || '#fff'); tint.setAttribute('opacity', o.tk || 0);
        T.setT(pele, `translate(0,${f1(4 * (o.hit || 0))})`);
      }
    };
  };

  // ---------- Arquibancada de perto ----------
  T.mkAud = () => {
    const g = T.el('g', {}), rnd = T.rng(55);
    let s = `<rect width="1920" height="1080" fill="#B8433F"/>` + stripesFan(960, -700, 700, 230, 6, '#A93D3A', '#E9CFA8') + `<rect width="1920" height="900" fill="url(#somb)"/>`;
    const r1 = T.g(g, s + [...Array(11)].map((_, i) => person(rnd, 60 + i * 180, 300, 2.3)).join(''));
    const r2 = T.g(g, `<rect y="430" width="1920" height="200" fill="#6B3F33"/>` + [...Array(10)].map((_, i) => person(rnd, 150 + i * 180, 470, 2.7)).join(''));
    T.g(g, `<rect y="640" width="1920" height="460" fill="#5A3329"/><rect width="1920" height="1080" fill="${NAVY}" opacity=".22"/>`);
    const slot = T.el('g', {}, g);
    let rail = `<rect y="900" width="1920" height="200" fill="${RED}"/><rect y="880" width="1920" height="30" rx="10" fill="${C.gold}"/>`;
    for (let x = 0; x < 1920; x += 160) rail += `<path d="M${x},910 h160 a80,60 0 0 1 -160,0Z" fill="${(x / 160) % 2 ? REDD : '#E56A60'}"/><path d="${A.star4}" fill="${C.gold}" transform="translate(${x + 80},1010) scale(1.6)"/>`;
    T.g(g, rail);
    return { g, slot, update(t) { T.setT(r1, `translate(0,${f1(-10 * Math.abs(sin(PI * T.beat(t))))})`); T.setT(r2, `translate(0,${f1(-12 * Math.abs(sin(PI * T.beat(t) + 1)))})`); } };
  };

  // ---------- Cortinas da frente (troca de cena e moldura do final) ----------
  T.mkCurtains = parent => {
    const g = T.el('g', {}, parent);
    const half = sx => T.g(g, `<g transform="scale(${sx},1)"><rect x="-1100" y="-20" width="1100" height="1120" fill="${RED}"/>` + [...Array(9)].map((_, i) => `<rect x="${-1060 + i * 120}" y="-20" width="34" height="1120" fill="${REDD}" opacity=".55"/><rect x="${-1010 + i * 120}" y="-20" width="14" height="1120" fill="#E87A70" opacity=".5"/>`).join('') + `<rect x="-22" y="-20" width="22" height="1120" fill="${C.gold}"/><rect x="-1100" y="1040" width="1100" height="60" fill="${C.gold}"/></g>`);
    const L = half(1), Rr = half(-1);
    let pm = `<rect x="-20" y="-20" width="1960" height="96" fill="${REDD}"/>`; for (let x = -20; x < 1940; x += 140) pm += `<path d="M${x},70 h140 a70,56 0 0 1 -140,0Z" fill="${RED}"/><path d="M${x},70 h140 a70,56 0 0 1 -140,0" fill="none" stroke="${C.gold}" stroke-width="8"/>`;
    const P = T.g(g, pm);
    return { g, set(c) { T.show(g, c > 0.002); T.setT(L, `translate(${f1(c * 968)},0)`); T.setT(Rr, `translate(${f1(1920 - c * 968)},0)`); T.setT(P, `translate(0,${f1(-150 + 150 * Math.min(1, c * 6))})`); } };
  };
})();
