'use strict';
// Arte: peças de cenário em vetor (árvores, casas, nuvens, montanhas, flores, trilho...).
(() => {
  const C = T.C, A = T.A = {};
  const { sin, cos, PI } = Math;
  const f1 = v => (+v).toFixed(1);
  A.f1 = f1;

  A.tree = (x, y, s, c, cl, cd, o = {}) => {
    let ap = '';
    if (o.apples) for (const [ax, ay] of [[-38, -95], [18, -150], [40, -100], [-8, -112], [-30, -140], [12, -78], [58, -78]]) ap += `<circle cx="${ax}" cy="${ay}" r="10" fill="${C.coral}"/><circle cx="${ax - 3}" cy="${ay - 3}" r="3.5" fill="${C.coralL}"/>`;
    return `<g data-sw="${x},${y},${o.amp || 1.6}"><g transform="translate(${x},${y}) scale(${s})">
<rect x="-10" y="-74" width="20" height="78" rx="7" fill="${o.trunk || C.brown}"/><rect x="0" y="-74" width="10" height="78" rx="5" fill="#000" opacity=".12"/>
<g fill="${cd}"><circle cx="0" cy="-112" r="62"/><circle cx="-44" cy="-84" r="40"/><circle cx="46" cy="-82" r="42"/></g>
<g fill="${c}"><circle cx="0" cy="-124" r="62"/><circle cx="-44" cy="-96" r="40"/><circle cx="46" cy="-94" r="42"/></g>
<g fill="${cl}" opacity=".55"><circle cx="-20" cy="-146" r="30"/><circle cx="-52" cy="-106" r="18"/><circle cx="30" cy="-112" r="16"/></g>${ap}</g></g>`;
  };
  A.pine = (x, y, s, c, cd) => `<g data-sw="${x},${y},1.1"><g transform="translate(${x},${y}) scale(${s})"><rect x="-8" y="-30" width="16" height="34" rx="5" fill="${C.brown}"/>
<path d="M-56,-26 Q-20,-70 0,-122 Q20,-70 56,-26 Q0,-10 -56,-26Z M-46,-76 Q-16,-116 0,-162 Q16,-116 46,-76 Q0,-62 -46,-76Z M-34,-124 Q-10,-160 0,-198 Q10,-160 34,-124 Q0,-112 -34,-124Z" fill="${c}"/>
<path d="M0,-198 Q10,-160 34,-124 Q17,-116 0,-116Z M0,-162 Q16,-116 46,-76 Q20,-66 0,-66Z M0,-122 Q20,-70 56,-26 Q25,-14 0,-14Z" fill="${cd}" opacity=".55"/></g></g>`;
  A.bush = (x, y, s, c, cl) => `<g transform="translate(${x},${y}) scale(${s})"><g fill="${c}"><circle cx="-30" cy="-18" r="24"/><circle cx="0" cy="-30" r="32"/><circle cx="32" cy="-16" r="22"/><rect x="-52" y="-20" width="104" height="22" rx="10"/></g><circle cx="-8" cy="-40" r="14" fill="${cl}" opacity=".5"/></g>`;
  A.flower = (x, y, s, col, o = {}) => {
    let p = ''; for (let i = 0; i < 5; i++) { const a = i * 1.2566 - 1.57; p += `<circle cx="${f1(11 * cos(a))}" cy="${f1(11 * sin(a))}" r="8.5" fill="${col}"/>`; }
    return `<g data-sw="${x},${y},${o.amp || 4}"><g transform="translate(${x},${y}) scale(${s})"><path d="M0,0 Q5,-22 0,-46" stroke="${o.stem || C.greenD}" stroke-width="4.5" fill="none" stroke-linecap="round"/><path d="M1,-18 q16,-12 22,2 q-14,6 -22,-2Z" fill="${o.leaf || C.green}"/><g transform="translate(0,-50)">${p}<circle r="7" fill="${o.mid || C.gold}"/></g></g></g>`;
  };
  A.tulip = (x, y, s, col, colD) => `<g data-sw="${x},${y},3"><g transform="translate(${x},${y}) scale(${s})"><path d="M0,0 Q-4,-24 0,-48" stroke="${C.greenD}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M-1,-8 q-20,-10 -18,-32 q16,8 18,32Z" fill="${C.green}"/><path d="M-15,-52 q0,-22 5,-26 l10,10 l10,-10 q5,4 5,26 q-15,14 -30,0Z" fill="${col}"/><path d="M0,-68 l10,-10 q5,4 5,26 q-7,7 -15,7Z" fill="${colD}"/></g></g>`;
  A.sunflower = (x, y, s) => { let p = ''; for (let i = 0; i < 12; i++) p += `<ellipse rx="7" ry="17" cy="-22" fill="${i % 2 ? C.gold : C.goldL}" transform="rotate(${i * 30})"/>`; return `<g data-sw="${x},${y},3"><g transform="translate(${x},${y}) scale(${s})"><path d="M0,0 V-80" stroke="${C.greenD}" stroke-width="7" stroke-linecap="round"/><path d="M0,-30 q26,-16 34,4 q-22,10 -34,-4Z M0,-48 q-26,-16 -34,4 q22,10 34,-4Z" fill="${C.green}"/><g transform="translate(0,-92)">${p}<circle r="17" fill="${C.brown}"/><circle r="10" fill="${C.brownD}"/></g></g></g>`; };
  A.tuft = (x, y, s, c) => `<path transform="translate(${x},${y}) scale(${s})" d="M-14,0 Q-18,-22 -24,-30 Q-8,-22 -6,0Z M-5,0 Q-2,-34 4,-44 Q8,-24 7,0Z M8,0 Q16,-20 26,-26 Q20,-10 18,0Z" fill="${c}"/>`;
  A.fern = (x, y, s, c) => { let d = ''; for (let i = -3; i <= 3; i++) d += `<path d="M0,0 Q${i * 14},-40 ${i * 26},-${70 - Math.abs(i) * 8} Q${i * 8},-30 0,0Z" fill="${c}"/>`; return `<g data-sw="${x},${y},3"><g transform="translate(${x},${y}) scale(${s})">${d}</g></g>`; };
  A.rock = (x, y, s, c = '#B9B6C9', cl = '#D5D2E2') => `<g transform="translate(${x},${y}) scale(${s})"><path d="M-32,2 Q-36,-26 -8,-32 Q24,-36 32,-8 Q36,2 30,2Z" fill="${c}"/><path d="M-22,-12 Q-18,-26 -4,-27 Q8,-28 12,-22 Q-6,-22 -22,-12Z" fill="${cl}"/></g>`;
  A.mushroom = (x, y, s, col = C.coral) => `<g transform="translate(${x},${y}) scale(${s})"><rect x="-8" y="-24" width="16" height="26" rx="7" fill="${C.cream}"/><path d="M-30,-20 Q-30,-52 0,-52 Q30,-52 30,-20 Q0,-12 -30,-20Z" fill="${col}"/><circle cx="-12" cy="-34" r="5" fill="#fff"/><circle cx="8" cy="-42" r="4" fill="#fff"/><circle cx="16" cy="-28" r="3.5" fill="#fff"/></g>`;
  A.house = (x, y, s, wall, roof, roofD, o = {}) => `<g transform="translate(${x},${y}) scale(${s})"><rect x="24" y="-128" width="16" height="36" rx="3" fill="${roofD}"/><rect x="-48" y="-74" width="96" height="78" rx="5" fill="${wall}"/><rect x="14" y="-74" width="34" height="78" fill="#000" opacity=".06"/>
<path d="M-60,-70 L0,-124 L60,-70Z" fill="${roof}" stroke="${roof}" stroke-width="10" stroke-linejoin="round"/><path d="M0,-126 L62,-68 L20,-68Z" fill="${roofD}" opacity=".55"/>
<path d="M-12,4 v-34 a12,12 0 0 1 24,0 v34Z" fill="${o.door || C.brownL}"/><circle cx="6" cy="-14" r="2.5" fill="${C.gold}"/>
<rect x="-41" y="-56" width="22" height="22" rx="4" fill="${o.win || '#BDE4F8'}" stroke="${C.cream}" stroke-width="4"/><rect x="21" y="-56" width="22" height="22" rx="4" fill="${o.win || '#BDE4F8'}" stroke="${C.cream}" stroke-width="4"/></g>`;
  A.cloud = (x, y, s, o = {}) => `<g transform="translate(${x},${y}) scale(${s})" opacity="${o.op || 1}"><g fill="${o.sh || '#D3E7F6'}"><circle cx="-50" cy="6" r="34"/><circle cx="0" cy="-10" r="50"/><circle cx="56" cy="8" r="36"/><rect x="-84" y="6" width="176" height="36" rx="18"/></g><g fill="${o.c || '#fff'}"><circle cx="-50" cy="-3" r="34"/><circle cx="0" cy="-21" r="50"/><circle cx="56" cy="-1" r="36"/><rect x="-84" y="-5" width="176" height="36" rx="18"/></g></g>`;
  A.mountains = (W, base, n, h0, h1, c, cl, seed, snow) => {
    const r = T.rng(seed); let s = '';
    for (let i = 0; i < n; i++) {
      const x = (i + 0.2 + 0.6 * r()) * W / n, h = h0 + (h1 - h0) * r(), w = h * (1.15 + 0.5 * r()), t = base - h;
      s += `<path d="M${f1(x - w)},${base} L${f1(x - 14)},${f1(t + 16)} Q${f1(x)},${f1(t - 2)} ${f1(x + 14)},${f1(t + 16)} L${f1(x + w)},${base}Z" fill="${c}"/><path d="M${f1(x - w)},${base} L${f1(x - 14)},${f1(t + 16)} Q${f1(x)},${f1(t - 2)} ${f1(x + 4)},${f1(t + 8)} L${f1(x - w * 0.14)},${f1(t + h * 0.5)} L${f1(x + w * 0.08)},${base}Z" fill="${cl}"/>`;
      if (snow) { const k = 0.24, yy = t + h * k + 4, ww = w * k; s += `<path d="M${f1(x - ww - 8)},${f1(yy)} L${f1(x - 14)},${f1(t + 16)} Q${f1(x)},${f1(t - 2)} ${f1(x + 14)},${f1(t + 16)} L${f1(x + ww + 8)},${f1(yy)} l${f1(-ww * 0.5)},-12 l${f1(-ww * 0.45)},14 l${f1(-ww * 0.5)},-14 l${f1(-ww * 0.4)},12Z" fill="${snow}"/>`; }
    }
    return s;
  };
  A.hillFn = (W, base, parts) => x => { let y = base; for (const [a, k, p] of parts) y += a * sin(2 * PI * k * x / W + p); return y; };
  A.hillPath = (fn, W, dy = 0, bottom = 1100) => { let d = `M-2,${bottom}`; for (let x = -2; x <= W + 2; x += 32) d += `L${x},${f1(fn(x) + dy)}`; return d + `L${W + 2},${bottom}Z`; };
  A.hill = (fn, W, c, cl) => `<path d="${A.hillPath(fn, W)}" fill="${cl}"/><path d="${A.hillPath(fn, W, 9)}" fill="${c}"/>`;
  A.fence = (x0, x1, fn, c = C.cream, cd = C.creamD) => { let s = '', pts = '', pts2 = ''; for (let x = x0; x <= x1; x += 34) { const y = fn(x); s += `<rect x="${x - 4}" y="${f1(y - 34)}" width="9" height="38" rx="4" fill="${c}"/>`; pts += `${x},${f1(y - 24)} `; pts2 += `${x},${f1(y - 11)} `; } return `<polyline points="${pts}" fill="none" stroke="${cd}" stroke-width="5"/><polyline points="${pts2}" fill="none" stroke="${cd}" stroke-width="5"/>${s}`; };
  A.track = (W, o = {}) => {
    const R = T.RAIL; let s = `<rect x="0" y="${R + 12}" width="${W}" height="26" fill="${o.bal || '#D2C0A2'}"/><rect x="0" y="${R + 28}" width="${W}" height="10" fill="${o.balD || '#B9A688'}"/>`;
    for (let x = 10; x < W; x += 48) s += `<rect x="${x}" y="${R + 6}" width="26" height="13" rx="3" fill="${C.brown}"/><rect x="${x}" y="${R + 6}" width="26" height="4" rx="2" fill="${C.brownL}"/>`;
    return s + `<rect x="0" y="${R}" width="${W}" height="9" fill="#7C869B"/><rect x="0" y="${R}" width="${W}" height="3" fill="#C3CBDA"/>`;
  };
  A.rainbow = (cx, cy, r, w) => [C.coral, C.orange, C.gold, C.green, C.sky, C.lilac].map((c, i) => { const rr = r - i * w; return `<path d="M${cx - rr},${cy} A${rr},${rr} 0 0 1 ${cx + rr},${cy}" fill="none" stroke="${c}" stroke-width="${w + 1}"/>`; }).join('');
  A.sun = (r, c = C.gold, cl = C.goldL) => { let rays = ''; for (let i = 0; i < 12; i++) rays += `<path d="M-${r * 0.16},-${r * 1.22} L0,-${r * (i % 2 ? 1.7 : 1.5)} L${r * 0.16},-${r * 1.22}Z" fill="${c}" transform="rotate(${i * 30})"/>`; return `<circle r="${r * 2.6}" fill="${cl}" opacity=".18"/><circle r="${r * 1.9}" fill="${cl}" opacity=".22"/><g class="rays">${rays}</g><circle r="${r}" fill="${c}"/><circle r="${r * 0.82}" fill="${cl}"/>`; };
  A.windmill = (x, y, s) => { let b = ''; for (let i = 0; i < 4; i++) b += `<g transform="rotate(${i * 90})"><rect x="-4" y="-96" width="8" height="96" rx="3" fill="${C.brown}"/><rect x="4" y="-94" width="26" height="62" rx="4" fill="${C.cream}" stroke="${C.creamD}" stroke-width="3"/></g>`; return `<g transform="translate(${x},${y}) scale(${s})"><path d="M-34,0 L-22,-120 L22,-120 L34,0Z" fill="${C.cream}"/><path d="M4,-120 L22,-120 L34,0 L10,0Z" fill="${C.creamD}"/><path d="M-30,-118 Q0,-160 30,-118Z" fill="${C.coral}"/><rect x="-9" y="-24" width="18" height="24" rx="8" fill="${C.brownL}"/><rect x="-8" y="-84" width="16" height="18" rx="4" fill="#BDE4F8"/><g transform="translate(0,-124)"><g class="spin" data-sp="40">${b}</g><circle r="9" fill="${C.coralD}"/></g></g>`; };
  A.pinwheel = (s = 1) => { let b = ''; const cs = [C.coral, C.gold, C.sky, C.green]; for (let i = 0; i < 4; i++) b += `<path d="M0,0 L0,-52 Q30,-46 30,-18Z" fill="${cs[i]}" transform="rotate(${i * 90})"/><path d="M0,0 L30,-18 Q20,-8 0,0Z" fill="#000" opacity=".12" transform="rotate(${i * 90})"/>`; return `<g transform="scale(${s})"><rect x="-4" y="0" width="8" height="150" rx="4" fill="${C.cream}"/><g class="spin" data-sp="300">${b}</g><circle r="8" fill="${C.cream}"/></g>`; };
  A.balloon = (x, y, s, c, cl) => `<g transform="translate(${x},${y}) scale(${s})"><path d="M0,34 q-8,30 2,60 q8,30 -2,60" stroke="${C.cream}" stroke-width="2.5" fill="none" opacity=".9"/><ellipse rx="30" ry="36" fill="${c}"/><path d="M-6,34 L6,34 L0,42Z" fill="${c}"/><ellipse cx="-11" cy="-13" rx="8" ry="12" fill="${cl}" opacity=".8" transform="rotate(-20 -11 -13)"/></g>`;
  A.bunting = (x0, y0, x1, y1, sag, n) => { const cs = [C.coral, C.gold, C.sky, C.green, C.lilac, C.orange]; let s = `<path d="M${x0},${y0} Q${(x0 + x1) / 2},${(y0 + y1) / 2 + sag * 2} ${x1},${y1}" fill="none" stroke="${C.cream}" stroke-width="4"/>`; for (let i = 0; i < n; i++) { const u = (i + 0.5) / n, x = (1 - u) * (1 - u) * x0 + 2 * u * (1 - u) * (x0 + x1) / 2 + u * u * x1, y = (1 - u) * (1 - u) * y0 + 2 * u * (1 - u) * ((y0 + y1) / 2 + sag * 2) + u * u * y1; s += `<path d="M${f1(x - 17)},${f1(y)} L${f1(x + 17)},${f1(y)} L${f1(x)},${f1(y + 38)}Z" fill="${cs[i % 6]}"/>`; } return s; };
  A.heart = 'M0,10 C-22,-8 -12,-26 0,-14 C12,-26 22,-8 0,10Z';
  A.star4 = 'M0,-16 Q2,-2 16,0 Q2,2 0,16 Q-2,2 -16,0 Q-2,-2 0,-16Z';
  A.note = c => `<ellipse cx="-6" cy="12" rx="9" ry="7" fill="${c}" transform="rotate(-20 -6 12)"/><rect x="0" y="-22" width="4" height="34" fill="${c}"/><path d="M0,-24 q16,2 16,16 q-6,-8 -16,-6Z" fill="${c}"/>`;
  A.leaf = c => `<path d="M0,-14 Q14,-8 10,8 Q4,14 0,14 Q-12,6 -8,-6 Q-4,-12 0,-14Z" fill="${c}"/><path d="M0,-12 V12" stroke="#000" stroke-opacity=".15" stroke-width="2"/>`;
  A.apple = (r = 20) => `<g transform="scale(${r / 20})"><path d="M0,-14 C-10,-22 -24,-14 -22,4 C-20,20 -8,24 0,19 C8,24 20,20 22,4 C24,-14 10,-22 0,-14Z" fill="${C.coral}"/><path d="M0,-14 C10,-22 24,-14 22,4 C20,20 8,24 0,19 C10,10 8,-6 0,-14Z" fill="${C.coralD}" opacity=".6"/><ellipse cx="-11" cy="-4" rx="4" ry="7" fill="#fff" opacity=".7" transform="rotate(20 -11 -4)"/><rect x="-1.5" y="-25" width="3.5" height="12" rx="1.5" fill="${C.brown}"/><path d="M2,-22 q10,-10 18,-2 q-10,8 -18,2Z" fill="${C.green}"/></g>`;
  // Passarinho e borboleta de cenário (animados no clipe.js)
  A.mkBird = (parent, col, colD) => { const g = T.g(parent, `<path d="M-14,2 l-16,-6 l4,10Z" fill="${colD}"/><ellipse rx="17" ry="11" fill="${col}"/><circle cx="14" cy="-7" r="9" fill="${col}"/><path d="M21,-8 l11,3 l-11,4Z" fill="${C.orange}"/><circle cx="16" cy="-9" r="2.2" fill="${C.ink}"/><ellipse cx="2" cy="4" rx="10" ry="5" fill="${C.cream}" opacity=".7"/>`); const w = T.g(g, `<path d="M-10,-4 Q-4,-34 14,-30 Q8,-12 6,-4Z" fill="${colD}"/>`); return { g, w }; };
  A.mkFly = (parent, c1, c2) => { const g = T.g(parent, ''); const l = T.g(g, `<ellipse cx="-13" cy="-7" rx="13" ry="11" fill="${c1}"/><ellipse cx="-10" cy="8" rx="9" ry="8" fill="${c2}"/>`), r = T.g(g, `<ellipse cx="13" cy="-7" rx="13" ry="11" fill="${c1}"/><ellipse cx="10" cy="8" rx="9" ry="8" fill="${c2}"/>`); T.g(g, `<rect x="-2.5" y="-12" width="5" height="26" rx="2.5" fill="${C.ink}"/>`); return { g, l, r }; };
})();
