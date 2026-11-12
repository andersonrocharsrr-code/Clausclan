'use strict';
// Cena de frente: o trem vem na direção da câmera, com cata-ventos girando dos lados.
(() => {
  const C = T.C, A = T.A, f1 = A.f1;
  const { sin, floor } = Math;
  T.mkFrontal = () => {
    const P = T.PAL.campo, rnd = T.rng(91), g = T.el('g', {});
    const HY = 545;
    let s = `<defs><linearGradient id="skyF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.sky[0]}"/><stop offset="1" stop-color="${P.sky[1]}"/></linearGradient></defs><rect width="1920" height="700" fill="url(#skyF)"/>`;
    s += `<g transform="translate(330,170)">${A.sun(58)}</g><g opacity=".7">${A.rainbow(960, 600, 760, 26)}</g>` + A.cloud(250, 330, 1.2) + A.cloud(1580, 210, 1.5) + A.cloud(1130, 120, 0.9) + A.cloud(700, 260, 0.7);
    s += A.mountains(1920, 580, 5, 190, 330, P.mt[0], P.mt[1], 21, P.mt[2]);
    const fn = A.hillFn(1920, 540, [[14, 2, 0.4], [6, 5, 1]]);
    s += A.hill(fn, 1920, P.h1[0], P.h1[1]) + A.windmill(520, f1(fn(520) + 6), 0.8) + A.windmill(1500, f1(fn(1500) + 6), 0.6);
    for (let i = 0; i < 16; i++) { const x = 60 + i * 120 + 40 * rnd(); if (Math.abs(x - 960) > 150) s += A.tree(f1(x), f1(fn(x) + 10), 0.4 + 0.25 * rnd(), P.tr[i % 3][0], P.tr[i % 3][1], P.tr[i % 3][2]); }
    s += `<rect y="${HY + 12}" width="1920" height="540" fill="${P.gr[1]}"/>`;
    const fan = [C.lilac, P.h3[0], C.coralL, P.gr[0], C.goldL, P.h3[0], C.pink, P.gr[0]];
    for (const sd of [-1, 1]) for (let i = 0; i < 8; i++) { const a = 420 + i * 330, b = a + 330; s += `<path d="M${960 + sd * 30},${HY + 12} L${960 + sd * a},1080 L${960 + sd * b},1080Z" fill="${fan[i]}"/>`; }
    s += `<path d="M946,${HY + 12} L974,${HY + 12} L1330,1080 L590,1080Z" fill="#D2C0A2"/>`;
    T.g(g, s);
    const sl = T.el('g', {}, g), sleepers = [];
    for (let i = 0; i < 18; i++) sleepers.push(T.el('rect', { rx: 4, fill: C.brown }, sl));
    T.g(g, `<path d="M957,${HY + 12} L960,${HY + 12} L718,1080 L690,1080Z M963,${HY + 12} L960,${HY + 12} L1202,1080 L1230,1080Z" fill="#7C869B"/>`);
    // trem de frente
    const tr = T.el('g', {}, g), slots = [];
    const cols = [[C.coral, C.coralD, C.coralL], [C.gold, C.goldD, C.goldL], [C.sky, C.skyD, C.skyL], [C.green, C.greenD, C.greenL]];
    for (let k = 4; k >= 1; k--) {
      const c = cols[k - 1], w = T.el('g', { transform: `translate(${k * 232},${-k * 20}) scale(${1 - 0.12 * k})` }, tr);
      slots[k - 1] = T.el('g', {}, w);
      T.g(w, `<rect x="-152" y="-70" width="46" height="74" rx="12" fill="${C.ink}"/><rect x="106" y="-70" width="46" height="74" rx="12" fill="${C.ink}"/><rect x="-140" y="-300" width="280" height="252" rx="26" fill="${c[0]}"/><rect x="-140" y="-120" width="280" height="72" rx="26" fill="${c[1]}" opacity=".5"/><rect x="-152" y="-314" width="304" height="36" rx="18" fill="${c[2]}"/><circle cx="0" cy="-190" r="44" fill="${C.cream}"/><circle cx="0" cy="-190" r="26" fill="${c[0]}"/>`);
    }
    const lg = T.el('g', {}, tr);
    T.g(lg, `<rect x="-236" y="-96" width="46" height="104" rx="14" fill="${C.ink}"/><rect x="190" y="-96" width="46" height="104" rx="14" fill="${C.ink}"/><rect x="-178" y="-470" width="356" height="390" rx="24" fill="${C.blueD}"/><path d="M-204,-458 q0,-46 46,-46 h316 q46,0 46,46 v10 h-408Z" fill="${C.coral}"/><rect x="-170" y="-496" width="340" height="12" rx="6" fill="${C.coralL}"/>`);
    const puffs = T.el('g', { fill: '#fff' }, lg), pf = [];
    for (let i = 0; i < 8; i++) pf.push(T.g(puffs, `<circle r="40"/><circle cx="34" cy="10" r="28"/><circle cx="-30" cy="12" r="26"/>`));
    T.g(lg, `<path d="M-46,-420 L-56,-560 L56,-560 L46,-420Z" fill="${C.coral}"/><path d="M10,-420 L14,-560 L56,-560 L46,-420Z" fill="${C.coralD}" opacity=".5"/><rect x="-70" y="-594" width="140" height="44" rx="18" fill="${C.coralD}"/><rect x="-62" y="-594" width="124" height="15" rx="7" fill="${C.gold}"/>
<circle cx="0" cy="-252" r="176" fill="${C.blue}"/><path d="M-176,-252 a176,176 0 0 0 352,0 a200,150 0 0 1 -352,0Z" fill="${C.blueD}" opacity=".6"/><circle cx="0" cy="-252" r="150" fill="${C.cream}" stroke="${C.gold}" stroke-width="13"/>
<rect x="-36" y="-470" width="72" height="54" rx="15" fill="${C.coral}"/><circle cx="0" cy="-443" r="21" fill="${C.goldL}"/><circle cx="0" cy="-443" r="96" fill="url(#lampG)"/>
<rect x="-218" y="-124" width="436" height="60" rx="15" fill="${C.coral}"/><rect x="-218" y="-92" width="436" height="28" rx="12" fill="${C.coralD}"/><circle cx="-150" cy="-96" r="26" fill="${C.gold}"/><circle cx="-150" cy="-96" r="13" fill="${C.goldD}"/><circle cx="150" cy="-96" r="26" fill="${C.gold}"/><circle cx="150" cy="-96" r="13" fill="${C.goldD}"/>
<path d="M-172,-66 L-228,8 L228,8 L172,-66Z" fill="${C.gold}"/><g stroke="${C.goldD}" stroke-width="9"><path d="M-110,-60 L-140,4 M-38,-60 L-48,4 M38,-60 L48,4 M110,-60 L140,4"/></g>`);
    const face = T.face(lg, { cx: 0, cy: -262, s: 2.9, dx: 21, my: 16 });
    // enfeites que passam dos lados
    const og = T.el('g', {}, g), objs = [];
    const kinds = [() => A.pinwheel(1.5).replace('<g ', '<g transform="translate(0,-225)"><g ') + '</g>', () => A.tree(0, 0, 2.2, P.tr[0][0], P.tr[0][1], P.tr[0][2]), () => A.tulip(-50, 0, 2, C.coral, C.coralD) + A.tulip(10, 0, 2.4, C.lilac, C.lilacD) + A.tulip(60, 0, 1.9, C.gold, C.goldD), () => `<g transform="translate(0,-225)">${A.pinwheel(1.5)}</g>`, () => A.bush(0, 0, 2.4, P.tr[1][0], P.tr[1][1]) + A.flower(-50, 0, 2, C.pink) + A.flower(60, 0, 2.2, C.white)];
    for (let k = 0; k < 14; k++) { const e = T.g(og, kinds[[3, 1, 3, 2, 3, 4, 3][k % 7]]()); objs.push({ e, sd: k % 2 ? 1 : -1, X: 560 + ((k * 5) % 3) * 110, k }); }
    const spins = [...g.querySelectorAll('.spin')].map(e => ({ e, sp: +e.getAttribute('data-sp') })), sways = T.collectSways(g);
    let lastKey = '';
    return {
      g, slots, face,
      update(t, Zt, piu) {
        const ph = t * 1.5;
        for (let i = 0; i < sleepers.length; i++) {
          let Z = 0.7 + (((i - ph * 2.5) % 18) + 18) % 18 * 0.4; const d = 1 / Z, r = sleepers[i], h = Math.max(2, 34 * d * d), w = 330 * d;
          r.setAttribute('x', f1(960 - w)); r.setAttribute('width', f1(2 * w)); r.setAttribute('y', f1(HY + 12 + 535 * d - h / 2)); r.setAttribute('height', f1(h));
        }
        const ord = [];
        for (const o of objs) {
          const Z = 0.72 + ((((o.k * 0.5 - ph) % 7) + 7) % 7), d = 1 / Z; o.Z = Z; ord.push(o);
          T.setT(o.e, `translate(${f1(960 + o.sd * o.X * d * 1.75)},${f1(HY + 12 + 535 * d)}) scale(${(d * 1.35).toFixed(3)})`); o.e.style.opacity = T.ramp(Z, 7.6, 6.6);
        }
        ord.sort((a, b) => b.Z - a.Z); const key = ord.map(o => o.k).join(','); if (key !== lastKey) { lastKey = key; for (const o of ord) og.appendChild(o.e); }
        const d = 1 / Zt, bn = T.bounce(t);
        T.setT(tr, `translate(${f1(960 + 10 * sin(t * 2.2))},${f1(HY + 12 + 535 * d - 8 * bn * d - 26 * (piu || 0) * d)}) scale(${(d * 0.92).toFixed(3)}) rotate(${(1.2 * sin(t * 3.4)).toFixed(2)})`);
        const DT = T.BEAT / 2, n = floor(t / DT);
        for (let k = 0; k < pf.length; k++) { const tb = (n - k) * DT, u = (t - tb) / (pf.length * DT); T.setT(pf[k], `translate(${f1(30 * sin(tb * 5) + 60 * u)},${f1(-610 - 330 * Math.sqrt(u))}) scale(${(0.5 + 1.2 * u).toFixed(2)})`); pf[k].style.opacity = (0.95 * (1 - u * u)).toFixed(2); }
        face.set((t + 1.3) % 3.7 < 0.13, piu > 0.1 ? piu : T.sing(t) * 0.7, 0, piu > 0.1);
        for (const s of spins) T.setT(s.e, `rotate(${(t * s.sp) % 360})`); T.runSways(sways, t);
      }
    };
  };
})();
