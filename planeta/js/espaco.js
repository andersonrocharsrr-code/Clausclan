'use strict';
// Peças do espaço: foguete, astronautas, estrelas, luas, cometa, planetas, alienígenas, robôs, fundo e base de lançamento.
(() => {
  const C = T.C, A = T.A, f1 = A.f1;
  const { sin, cos, PI, abs, floor } = Math;
  const P = T.P = { navy: '#141A40', navy2: '#232A66', pink: '#FF8FB8', pinkD: '#E86A9A', mint: '#7EE0C0', mintD: '#4FC3A1', yel: '#FFD86B', yelD: '#F2B93B', pur: '#B79CF2', purD: '#8F73D9', turq: '#3FC8D4', turqD: '#2AA3B0', white: '#F7F9FF', shade: '#D9DEF0', orange: '#FF9E5E', red: '#F0565A' };
  const mk = html => { const g = T.el('g', {}); g.innerHTML = html; return g; };
  const starD = (r, r2) => { let d = ''; for (let i = 0; i < 10; i++) { const a = -PI / 2 + i * PI / 5, q = i % 2 ? r2 : r; d += (i ? 'L' : 'M') + f1(q * cos(a)) + ',' + f1(q * sin(a)); } return d + 'Z'; };
  T.starD = starD;

  // Estrelinha com rosto
  T.mkStar = (col = P.yel, colD = P.yelD) => {
    const g = mk(`<circle r="120" fill="${col}" opacity=".16"/><circle r="84" fill="${col}" opacity=".2"/><path d="${starD(70, 34)}" fill="${col}" stroke="${col}" stroke-width="22" stroke-linejoin="round"/><path d="${starD(70, 34)}" fill="none" stroke="${colD}" stroke-width="4" stroke-linejoin="round" opacity=".35"/>`);
    const face = T.face(g, { cx: 0, cy: 2, s: 0.8, dx: 19, my: 14 });
    return { g, glow: g.children[0], set(x, y, s, rot, t, o = {}) { T.setT(g, `translate(${f1(x)},${f1(y)}) rotate(${f1(rot || 0)}) scale(${(s * (1 + 0.04 * sin(t * 5 + x))).toFixed(3)})`); g.children[0].setAttribute('opacity', (0.12 + 0.14 * abs(sin(t * 3 + x))).toFixed(2)); face.set(o.blink != null ? o.blink : ((t + x * 0.01) % 3.1) < 0.12, o.mouth || 0, 0); } };
  };
  // Lua crescente sorridente
  T.mkMoon = flip => {
    const g = mk(`<circle r="130" fill="${P.yel}" opacity=".12"/><path d="M30,-92 A96,96 0 1 0 30,92 A118,118 0 0 1 30,-92Z" fill="#FFF0B8"/><path d="M30,92 A96,96 0 0 1 -60,34 A96,96 0 0 0 30,92Z" fill="${P.yel}" opacity=".6"/><circle cx="-56" cy="-44" r="8" fill="${P.yel}" opacity=".6"/><circle cx="-8" cy="62" r="6" fill="${P.yel}" opacity=".6"/>`);
    const face = T.face(g, { cx: -34, cy: 0, s: 0.8, dx: 18, my: 16 });
    return { g, set(x, y, s, rot, t, mouth) { T.setT(g, `translate(${f1(x)},${f1(y)}) rotate(${f1(rot)}) scale(${(flip ? -s : s).toFixed(3)},${s.toFixed(3)})`); face.set(((t + (flip ? 1 : 0)) % 3.3) < 0.12, mouth || 0, 0); } };
  };
  // Cometa de chapéu
  T.mkComet = () => {
    let tr = `<defs><linearGradient id="cauda" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="${P.mint}"/><stop offset=".5" stop-color="${P.pur}" stop-opacity=".7"/><stop offset="1" stop-color="${P.pur}" stop-opacity="0"/></linearGradient></defs><path d="M0,-60 Q-300,-70 -640,-10 Q-300,-4 -620,40 Q-300,60 0,60Z" fill="url(#cauda)"/>`;
    for (let i = 0; i < 10; i++) tr += `<path class="fa" d="${A.star4}" fill="${i % 2 ? '#fff' : P.yel}" transform="translate(${-90 - i * 54},${f1(40 * sin(i * 2.1))}) scale(${f1(1.3 - i * 0.08)})"/>`;
    const g = mk(tr + `<circle r="70" fill="${P.mint}"/><path d="M-60,34 A70,70 0 0 0 60,34 A80,60 0 0 1 -60,34Z" fill="${P.mintD}" opacity=".6"/><g transform="translate(10,-62) rotate(12) scale(.62)"><ellipse cx="0" cy="0" rx="54" ry="11" fill="${C.ink}"/><rect x="-36" y="-78" width="72" height="80" rx="7" fill="${C.ink}"/><rect x="-36" y="-22" width="72" height="15" fill="${P.pink}"/></g>`);
    const face = T.face(g, { cx: 8, cy: 4, s: 0.85, dx: 20, my: 16 }), fa = [...g.querySelectorAll('.fa')];
    return { g, set(x, y, s, rot, t) { T.setT(g, `translate(${f1(x)},${f1(y)}) rotate(${f1(rot)}) scale(${s})`); face.set((t % 2.7) < 0.12, 0.5 + 0.3 * sin(t * 8), 1); fa.forEach((e, i) => e.setAttribute('opacity', (0.3 + 0.7 * abs(sin(t * 7 + i * 1.7))).toFixed(2))); } };
  };
  // Planeta com faixas, anel e rosto
  T.mkPlanet = (col, colD, colL, ringC, r = 90, withFace = true) => {
    const id = T.uid('pl');
    const g = mk(`<defs><clipPath id="${id}"><circle r="${r}"/></clipPath></defs><path d="M${-r * 1.75},0 A${r * 1.75},${r * 0.42} 0 0 1 ${r * 1.75},0" fill="none" stroke="${ringC}" stroke-width="${r * 0.16}" opacity=".7"/><circle r="${r}" fill="${col}"/><g clip-path="url(#${id})"><g class="fx"><path d="M${-r * 3},${-r * 0.55} h${r * 6} v${r * 0.22} h${-r * 6}Z M${-r * 3},${r * 0.3} h${r * 6} v${r * 0.3} h${-r * 6}Z" fill="${colD}" opacity=".55"/>` + [-2.2, -1.1, 0, 1.1, 2.2].map(k => `<circle cx="${f1(k * r)}" cy="${f1(-r * 0.1)}" r="${f1(r * 0.13)}" fill="${colL}" opacity=".7"/><circle cx="${f1(k * r + r * 0.5)}" cy="${f1(r * 0.7)}" r="${f1(r * 0.09)}" fill="${colL}" opacity=".7"/>`).join('') + `</g><path d="M${r},0 A${r},${r} 0 0 1 ${-r * 0.3},${r * 0.95} A${r * 1.1},${r * 1.1} 0 0 0 ${r},0Z" fill="#000" opacity=".12"/></g><path d="M${-r * 1.75},0 A${r * 1.75},${r * 0.42} 0 0 0 ${r * 1.75},0" fill="none" stroke="${ringC}" stroke-width="${r * 0.16}"/><circle class="lu" cx="${r * 1.75}" cy="0" r="${r * 0.13}" fill="#fff"/>`);
    const face = withFace ? T.face(g, { cx: 0, cy: -r * 0.08, s: r / 105, dx: 22, my: 16 }) : null, fx = g.querySelector('.fx'), lu = g.querySelector('.lu');
    return { g, r, set(x, y, s, t, tilt, mouth) { T.setT(g, `translate(${f1(x)},${f1(y)}) rotate(${f1(tilt == null ? -14 : tilt)}) scale(${s.toFixed(3)})`); T.setT(fx, `translate(${f1(((t * r * 0.5) % (r * 1.1)))},0)`); const a = t * 2.4; lu.setAttribute('cx', f1(r * 1.75 * cos(a))); lu.setAttribute('cy', f1(r * 0.42 * sin(a))); lu.setAttribute('opacity', sin(a) > 0 ? 1 : 0); if (face) face.set(((t + x * 0.01) % 3.4) < 0.12, mouth || 0, 0); } };
  };
  // Astronauta (criança de traje branco)
  const SKN = ['#F6C9A0', '#8D5B3F', '#D9A066', '#F2B98C', '#B97A4B'], HAIR = ['#7A5238', '#2B1B17', '#3A2418', '#E9B44C', '#2B1B17'];
  T.mkAstro = (k, acc, accD) => {
    const W = P.white, S = P.shade, sk = SKN[k], root = T.el('g', {}), q = T.el('g', {}, root);
    T.g(q, `<rect x="-50" y="-156" width="100" height="92" rx="20" fill="#AEB6D6"/>`);
    const leg = sx => T.g(q, `<rect x="-15" y="-4" width="30" height="34" rx="12" fill="${W}"/><rect x="-15" y="12" width="30" height="8" fill="${S}"/><ellipse cx="${sx * 3}" cy="32" rx="22" ry="12" fill="${acc}"/>`);
    const lL = leg(-1), lR = leg(1);
    T.g(q, `<rect x="-46" y="-152" width="92" height="106" rx="36" fill="${W}"/><path d="M10,-150 h14 q22,6 22,36 v36 q0,30 -22,32 h-14Z" fill="${S}" opacity=".7"/><rect x="-28" y="-116" width="56" height="40" rx="10" fill="${acc}"/><circle cx="-14" cy="-96" r="6" fill="${P.pink}"/><circle cx="0" cy="-96" r="6" fill="${P.yel}"/><circle cx="14" cy="-96" r="6" fill="${P.mint}"/><rect x="-46" y="-66" width="92" height="12" fill="${accD}"/>`);
    const arm = () => T.g(q, `<rect x="-13" y="-8" width="26" height="54" rx="13" fill="${W}"/><rect x="-13" y="26" width="26" height="8" fill="${S}"/><circle cy="50" r="15" fill="${acc}"/>`);
    const aL = arm(), aR = arm(), head = T.el('g', {}, q);
    T.g(head, `<circle cx="0" cy="-56" r="45" fill="${sk}"/><path d="M-44,-62 Q-46,-104 0,-102 Q46,-104 44,-62 Q24,-88 -6,-84 Q-30,-82 -44,-62Z" fill="${HAIR[k]}"/>`);
    const face = T.face(head, { cx: 0, cy: -54, s: 0.86, dx: 20, my: 18 });
    const helm = T.g(head, `<circle cx="0" cy="-58" r="68" fill="none" stroke="${W}" stroke-width="16"/><circle cx="0" cy="-58" r="60" fill="#9FE3F0" opacity=".16"/><path d="M-44,-86 A52,52 0 0 1 -8,-108" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".7"/><rect x="-40" y="2" width="80" height="18" rx="9" fill="${acc}"/><circle cx="-72" cy="-56" r="13" fill="${acc}"/><circle cx="72" cy="-56" r="13" fill="${acc}"/><rect x="-3" y="-150" width="6" height="26" fill="${S}"/><circle cx="0" cy="-152" r="8" fill="${P.pink}"/>`);
    return {
      g: root, head,
      pose(p) {
        const s = p.s || 1, sq = p.sq || 0;
        T.setT(root, `translate(${p.x.toFixed(1)},${p.y.toFixed(1)}) rotate(${(p.rot || 0).toFixed(2)}) scale(${(s * (p.flip == null ? 1 : p.flip) * (1 + sq)).toFixed(3)},${(s * (1 - sq)).toFixed(3)})`);
        T.setT(head, `translate(0,-150) rotate(${(p.head || 0).toFixed(2)})`);
        T.setT(aL, `translate(-44,-132) rotate(${(p.aL == null ? 14 : p.aL).toFixed(1)})`); T.setT(aR, `translate(44,-132) rotate(${(-(p.aR == null ? 14 : p.aR)).toFixed(1)})`);
        T.setT(lL, `translate(-22,${(-34 - (p.lL || 0)).toFixed(1)}) rotate(${(p.kL || 0).toFixed(1)})`); T.setT(lR, `translate(22,${(-34 - (p.lR || 0)).toFixed(1)}) rotate(${(-(p.kR || 0)).toFixed(1)})`);
        face.set(p.blink, p.mouth || 0, p.look || 0);
        const hy = p.helmY || 0; T.show(helm, hy > -900); T.setT(helm, `translate(0,${hy.toFixed(1)})`);
      }
    };
  };
  // Foguete gordinho (origem na base; aponta para cima)
  T.mkRocket = () => {
    const g = T.el('g', {});
    const flame = T.g(g, `<path d="M-44,0 Q-52,90 0,190 Q52,90 44,0Z" fill="${P.orange}"/><path d="M-26,0 Q-30,60 0,120 Q30,60 26,0Z" fill="${P.yel}"/><path d="M-12,0 Q-14,30 0,62 Q14,30 12,0Z" fill="#fff"/>`);
    T.g(g, `<path d="M-64,-120 L-128,-6 Q-130,8 -112,2 L-58,-30Z" fill="${P.pink}"/><path d="M64,-120 L128,-6 Q130,8 112,2 L58,-30Z" fill="${P.pinkD}"/><path d="M-44,-30 L-36,2 H36 L44,-30Z" fill="#8E97BD"/><rect x="-36" y="-4" width="72" height="10" rx="4" fill="#6F78A3"/>
<path d="M-76,-40 C-104,-200 -70,-310 0,-360 C70,-310 104,-200 76,-40 Q0,-22 -76,-40Z" fill="${P.white}"/><path d="M20,-346 C74,-300 104,-200 76,-40 Q50,-32 26,-30 C56,-180 50,-290 20,-346Z" fill="${P.shade}"/>
<path d="M-50,-290 C-34,-322 -16,-346 0,-360 C16,-346 34,-322 50,-290 Q0,-272 -50,-290Z" fill="${P.turq}"/><path d="M16,-348 C30,-332 42,-310 50,-290 Q36,-284 22,-282 C26,-306 22,-330 16,-348Z" fill="${P.turqD}"/>
<path d="M-84,-92 Q0,-72 84,-92 L82,-66 Q0,-46 -82,-66Z" fill="${P.pink}"/><path d="M0,-78 Q40,-80 84,-92 L82,-66 Q40,-54 0,-52Z" fill="${P.pinkD}" opacity=".5"/>
<path d="M-12,-64 L-18,-2 Q0,10 18,-2 L12,-64Z" fill="${P.pink}"/><circle cx="0" cy="-196" r="58" fill="${P.turq}"/><circle cx="0" cy="-196" r="46" fill="#1D2757"/>`);
    const win = T.el('g', { 'clip-path': 'url(#janelaF)' }, g);
    T.g(g, `<defs><clipPath id="janelaF"><circle cx="0" cy="-196" r="46"/></clipPath></defs><path d="M-34,-222 A46,46 0 0 1 -6,-240" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".6"/><g fill="${P.yel}"><circle cx="-40" cy="-128" r="5"/><circle cx="0" cy="-122" r="5"/><circle cx="40" cy="-128" r="5"/></g>`);
    const slot = T.el('g', {}, win);
    return { g, slot, flame, set(x, y, s, rot, t, fl) { T.setT(g, `translate(${f1(x)},${f1(y)}) rotate(${f1(rot)}) scale(${s.toFixed(3)})`); T.show(flame, fl > 0.02); T.setT(flame, `scale(${(0.8 + 0.2 * sin(t * 31)).toFixed(2)},${(fl * (0.85 + 0.2 * sin(t * 23))).toFixed(2)})`); T.setT(slot, `translate(0,-162) rotate(${f1(-rot)} 0 -34) scale(.5)`); } };
  };
  // Foguetinho de brinquedo com rastro de arco-íris
  T.mkMini = col => mk([P.red, P.orange, P.yel, P.mint, P.turq, P.pur].map((c, i) => `<rect x="-330" y="${-21 + i * 7}" width="300" height="7.5" fill="${c}" opacity=".9"/>`).join('') + `<path d="M-40,-22 L-64,-44 L-20,-26Z M-40,22 L-64,44 L-20,26Z" fill="${P.pink}"/><path d="M-44,-24 H20 Q62,-14 74,0 Q62,14 20,24 H-44Z" fill="${P.white}"/><path d="M20,-24 Q62,-14 74,0 Q62,14 20,24Z" fill="${col}"/><circle cx="-4" cy="0" r="12" fill="${P.navy2}" stroke="${col}" stroke-width="5"/><path d="M-44,-12 L-64,0 L-44,12Z" fill="${P.yel}"/>`);
  // Alienígena
  T.mkAlien = i => {
    const cs = [[P.mint, P.mintD], [P.pink, P.pinkD], [P.yel, P.yelD], [P.pur, P.purD], [P.orange, '#E07F3A'], [P.turq, P.turqD]][i], eyes = [2, 1, 3, 2, 1, 3][i], na = [2, 1, 2, 1, 2, 2][i];
    const g = T.el('g', {});
    const ant = []; for (let k = 0; k < na; k++) ant.push(T.g(g, `<path d="M0,0 Q${k ? 16 : -16},-34 ${k ? 24 : -24},-58" fill="none" stroke="${cs[1]}" stroke-width="7" stroke-linecap="round"/><circle cx="${k ? 24 : -24}" cy="-62" r="11" fill="${[P.yel, P.pink, P.mint][(i + k) % 3]}"/>`));
    const arm = sx => T.g(g, `<rect x="-9" y="0" width="18" height="48" rx="9" fill="${cs[0]}"/><circle cy="48" r="11" fill="${cs[1]}"/>`), aL = arm(-1), aR = arm(1);
    let e = ''; const ex = eyes === 1 ? [0] : eyes === 2 ? [-24, 24] : [-34, 0, 34];
    for (const x of ex) { const r = eyes === 1 ? 28 : eyes === 2 ? 19 : 14; e += `<circle cx="${x}" cy="${eyes === 3 && x === 0 ? -98 : -90}" r="${r}" fill="#fff"/><circle class="pp" cx="${x}" cy="${eyes === 3 && x === 0 ? -96 : -88}" r="${r * 0.55}" fill="${C.ink}"/><circle cx="${x + r * 0.2}" cy="${eyes === 3 && x === 0 ? -102 : -94}" r="${r * 0.2}" fill="#fff"/>`; }
    T.g(g, `<ellipse cx="-22" cy="-4" rx="20" ry="11" fill="${cs[1]}"/><ellipse cx="22" cy="-4" rx="20" ry="11" fill="${cs[1]}"/><path d="M-58,-20 C-70,-90 -52,-140 0,-142 C52,-140 70,-90 58,-20 Q0,2 -58,-20Z" fill="${cs[0]}"/><ellipse cx="0" cy="-34" rx="30" ry="18" fill="#fff" opacity=".35"/><circle cx="-38" cy="-56" r="9" fill="${C.pink}" opacity=".7"/><circle cx="38" cy="-56" r="9" fill="${C.pink}" opacity=".7"/>${e}<path d="M-16,-56 Q0,-40 16,-56" stroke="${C.ink}" stroke-width="5" fill="none" stroke-linecap="round"/>`);
    return { g, set(x, y, s, rot, t, wave) { T.setT(g, `translate(${f1(x)},${f1(y)}) rotate(${f1(rot)}) scale(${s.toFixed(3)})`); ant.forEach((a, k) => T.setT(a, `translate(${k || na === 1 ? (na === 1 ? 0 : 20) : -20},-136) rotate(${f1(10 * sin(t * 6 + i + k * 2))})`)); T.setT(aL, `translate(-52,-70) rotate(${f1(30 + wave * 110 + 20 * sin(t * 9 + i))})`); T.setT(aR, `translate(52,-70) rotate(${f1(-30 - wave * 110 + 20 * sin(t * 9 + i))})`); } };
  };
  // Robô quadradinho
  T.mkRobot = i => {
    const cs = [[P.mint, P.mintD], [P.pink, P.pinkD], [P.yel, P.yelD], [P.pur, P.purD]][i % 4];
    const g = mk(`<rect x="-78" y="-74" width="156" height="14" rx="7" fill="#AEB6D6"/><circle cx="-80" cy="-67" r="12" fill="${cs[1]}"/><circle cx="80" cy="-67" r="12" fill="${cs[1]}"/><circle cx="-26" cy="-4" r="15" fill="#3A416E"/><circle cx="26" cy="-4" r="15" fill="#3A416E"/><circle cx="-26" cy="-4" r="6" fill="#AEB6D6"/><circle cx="26" cy="-4" r="6" fill="#AEB6D6"/><rect x="-42" y="-96" width="84" height="80" rx="14" fill="${cs[0]}"/><rect x="8" y="-96" width="34" height="80" rx="14" fill="${cs[1]}" opacity=".5"/><rect x="-24" y="-70" width="48" height="30" rx="8" fill="#1D2757"/><path class="co" d="${A.heart}" fill="${P.pink}" transform="translate(0,-55) scale(.8)"/><rect x="-10" y="-112" width="20" height="18" fill="#AEB6D6"/><rect x="-38" y="-170" width="76" height="60" rx="14" fill="${P.white}"/><rect x="-28" y="-160" width="56" height="34" rx="10" fill="#1D2757"/><circle class="ol" cx="-13" cy="-143" r="8" fill="${P.mint}"/><circle class="ol" cx="13" cy="-143" r="8" fill="${P.mint}"/><path d="M-10,-120 h20" stroke="${cs[1]}" stroke-width="5" stroke-linecap="round"/><rect x="-3" y="-192" width="6" height="24" fill="#AEB6D6"/><circle class="an" cx="0" cy="-196" r="9" fill="${P.yel}"/>`);
    const ol = [...g.querySelectorAll('.ol')], an = g.querySelector('.an'), co = g.querySelector('.co');
    return { g, set(x, y, s, rot, t) { T.setT(g, `translate(${f1(x)},${f1(y)}) rotate(${f1(rot)}) scale(${s.toFixed(3)})`); const bl = ((t + i * 0.4) % 2.6) < 0.12; ol.forEach(e => e.setAttribute('r', bl ? 2 : 8)); an.setAttribute('opacity', sin(t * 8 + i) > 0 ? 1 : 0.35); T.setT(co, `translate(0,-55) scale(${(0.8 + 0.15 * abs(sin(t * 6 + i))).toFixed(2)})`); } };
  };
  // Sol sorridente
  T.mkSun = () => { const g = mk(`<circle r="250" fill="${P.yel}" opacity=".14"/><circle r="190" fill="${P.yel}" opacity=".2"/><g class="rays">` + [...Array(12)].map((_, i) => `<path d="M-22,-150 L0,-${i % 2 ? 214 : 190} L22,-150Z" fill="${P.orange}" transform="rotate(${i * 30})"/>`).join('') + `</g><circle r="138" fill="${P.yel}"/><circle r="138" fill="none" stroke="${P.yelD}" stroke-width="8" opacity=".5"/>`); const face = T.face(g, { cx: 0, cy: 0, s: 1.7, dx: 22, my: 16 }), rays = g.querySelector('.rays'); return { g, set(x, y, s, t, mouth) { T.setT(g, `translate(${f1(x)},${f1(y)}) scale(${s.toFixed(3)})`); T.setT(rays, `rotate(${(t * 14) % 360})`); face.set((t % 3.6) < 0.13, mouth || 0, 0); } }; };
  // Mão de luva com cinco dedos
  T.mkHand = () => { const g = T.el('g', {}); const f = [-52, -26, 0, 26, 52].map((x, i) => T.g(g, `<rect x="-13" y="-${[70, 92, 100, 92, 60][i]}" width="26" height="${[70, 92, 100, 92, 60][i] + 10}" rx="13" fill="${P.turq}"/><rect x="-13" y="-${[70, 92, 100, 92, 60][i]}" width="26" height="22" rx="11" fill="#7BE0E8"/>`, { transform: `translate(${x},${[-10, -28, -34, -28, 6][i]}) rotate(${[-22, -9, 0, 9, 40][i]})` })); T.g(g, `<rect x="-66" y="-40" width="132" height="110" rx="40" fill="${P.turq}"/><rect x="-50" y="60" width="100" height="40" rx="12" fill="${P.white}"/><rect x="-50" y="60" width="100" height="12" fill="${P.shade}"/>`); return { g, f, bx: [-52, -26, 0, 26, 52], by: [-10, -28, -34, -28, 6], br: [-22, -9, 0, 9, 40] }; };
  // Número grande
  const FONT = `font-family="Fredoka, 'Arial Rounded MT Bold', Arial, sans-serif" font-weight="700"`;
  T.NUMC = [P.yel, P.pink, P.mint, P.pur, P.turq, P.orange, P.yel, P.pink, P.mint, P.pur];
  T.mkNum = (txt, size, col) => mk(`<text ${FONT} font-size="${size}" text-anchor="middle" dominant-baseline="central" fill="${P.navy}" stroke="${P.navy}" stroke-width="${size * 0.3}" stroke-linejoin="round" opacity=".55" transform="translate(0,${size * 0.05})">${txt}</text><text ${FONT} font-size="${size}" text-anchor="middle" dominant-baseline="central" fill="#fff" stroke="#fff" stroke-width="${size * 0.2}" stroke-linejoin="round">${txt}</text><text ${FONT} font-size="${size}" text-anchor="middle" dominant-baseline="central" fill="${col}">${txt}</text>`);
  T.FONT = FONT;

  // ---------- Fundo do espaço ----------
  T.mkSpace = () => {
    const g = T.el('g', {}), rnd = T.rng(17);
    T.g(g, `<defs><linearGradient id="ceuS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0F1436"/><stop offset="1" stop-color="#262B6B"/></linearGradient><radialGradient id="neb1"><stop offset="0" stop-color="${P.pur}" stop-opacity=".4"/><stop offset="1" stop-color="${P.pur}" stop-opacity="0"/></radialGradient><radialGradient id="neb2"><stop offset="0" stop-color="${P.pink}" stop-opacity=".28"/><stop offset="1" stop-color="${P.pink}" stop-opacity="0"/></radialGradient><radialGradient id="neb3"><stop offset="0" stop-color="${P.turq}" stop-opacity=".25"/><stop offset="1" stop-color="${P.turq}" stop-opacity="0"/></radialGradient></defs><rect x="-200" y="-200" width="2320" height="1480" fill="url(#ceuS)"/>`);
    const neb = T.tile(g, 3840, `<ellipse cx="500" cy="300" rx="620" ry="330" fill="url(#neb1)"/><ellipse cx="1700" cy="760" rx="700" ry="360" fill="url(#neb2)"/><ellipse cx="2900" cy="380" rx="640" ry="340" fill="url(#neb3)"/><ellipse cx="3500" cy="860" rx="520" ry="280" fill="url(#neb1)"/>`);
    const dots = (n, r0, r1, op) => { let s = ''; for (let i = 0; i < n; i++) s += `<circle cx="${f1(rnd() * 1920)}" cy="${f1(rnd() * 1080)}" r="${f1(r0 + rnd() * (r1 - r0))}" fill="${rnd() < 0.2 ? P.yel : rnd() < 0.3 ? P.pink : '#fff'}" opacity="${f1(op * (0.5 + rnd() * 0.5))}"/>`; return s; };
    const l1 = T.tile(g, 1920, dots(90, 1, 2.4, 0.7)), l2 = T.tile(g, 1920, dots(50, 2, 3.6, 0.9));
    let far = ''; [[300, 220, 34, P.pink, P.pinkD], [1250, 840, 46, P.mint, P.mintD], [2300, 260, 28, P.pur, P.purD], [3200, 700, 40, P.orange, '#E07F3A']].forEach(([x, y, r, c, d]) => { far += `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity=".55"/><path d="M${x + r},${y} A${r},${r} 0 0 1 ${x - r * 0.3},${y + r * 0.95} A${r * 1.1},${r * 1.1} 0 0 0 ${x + r},${y}Z" fill="${d}" opacity=".55"/><ellipse cx="${x}" cy="${y}" rx="${r * 1.7}" ry="${r * 0.36}" fill="none" stroke="#fff" stroke-width="4" opacity=".3" transform="rotate(-16 ${x} ${y})"/>`; });
    const l3 = T.tile(g, 3840, far);
    let ast = ''; for (let i = 0; i < 12; i++) { const x = rnd() * 2880, y = 60 + rnd() * 960, r = 14 + rnd() * 26, n = 5 + floor(rnd() * 3); let pts = ''; for (let k = 0; k < n; k++) { const a = k * 2 * PI / n, q = r * (0.7 + 0.5 * rnd()); pts += f1(x + q * cos(a)) + ',' + f1(y + q * sin(a)) + ' '; } ast += `<polygon points="${pts}" fill="${i % 2 ? '#5B5FA8' : '#4A4E93'}"/><circle cx="${f1(x - r * 0.2)}" cy="${f1(y - r * 0.2)}" r="${f1(r * 0.2)}" fill="#fff" opacity=".18"/>`; }
    const l4 = T.tile(g, 2880, ast);
    const tw = []; for (let i = 0; i < 26; i++) tw.push({ e: T.g(g, `<path d="${A.star4}" fill="${i % 3 ? '#fff' : P.yel}"/>`), x: rnd() * 1920, y: rnd() * 1080, s: 0.5 + rnd() * 1.1, ph: rnd() * 6 });
    return { g, update(t, sc, twK) { T.scrollTile(neb, sc * 0.04); T.scrollTile(l1, sc * 0.06); T.scrollTile(l2, sc * 0.13); T.scrollTile(l3, sc * 0.2); T.scrollTile(l4, sc * 0.5); for (const w of tw) { const k = abs(sin(t * 2.2 + w.ph)); T.setT(w.e, `translate(${f1((((w.x - sc * 0.1) % 1920) + 1920) % 1920)},${f1(w.y)}) scale(${(w.s * (0.3 + k) * (twK || 1)).toFixed(2)})`); w.e.setAttribute('opacity', (0.3 + 0.7 * k).toFixed(2)); } } };
  };

  // ---------- Base de lançamento ----------
  T.mkSite = () => {
    const g = T.el('g', {}), rnd = T.rng(5);
    let s = `<defs><linearGradient id="ceuB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#11163A"/><stop offset="1" stop-color="#3A3585"/></linearGradient><linearGradient id="aurora" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6B5BC9" stop-opacity="0"/><stop offset=".55" stop-color="${P.pink}" stop-opacity=".75"/><stop offset="1" stop-color="${P.yel}"/></linearGradient></defs><rect x="-300" y="-2600" width="2520" height="3500" fill="url(#ceuB)"/>`;
    for (let i = 0; i < 150; i++) s += `<circle cx="${f1(-200 + rnd() * 2320)}" cy="${f1(-2500 + rnd() * 3100)}" r="${f1(1 + rnd() * 2.6)}" fill="${rnd() < 0.2 ? P.yel : '#fff'}" opacity="${f1(0.4 + rnd() * 0.6)}"/>`;
    T.g(g, s);
    const dawn = T.el('rect', { x: -300, y: -300, width: 2520, height: 1200, fill: 'url(#aurora)', opacity: 0 }, g);
    const fn = A.hillFn(1920, 700, [[30, 2, 0.4], [14, 5, 2]]), fn2 = A.hillFn(1920, 770, [[18, 3, 2], [8, 7, 1]]);
    s = `<path d="${A.hillPath(fn, 1920, 0, 1200)}" fill="#232B66"/>`;
    for (let i = 0; i < 9; i++) { const x = 60 + i * 230 + rnd() * 60; s += `<rect x="${f1(x - 5)}" y="${f1(fn(x) - 40)}" width="10" height="46" fill="#1B2153"/><circle cx="${f1(x)}" cy="${f1(fn(x) - 62)}" r="34" fill="#2B3478"/><circle cx="${f1(x - 10)}" cy="${f1(fn(x) - 72)}" r="14" fill="#38428F"/>`; }
    s += `<path d="${A.hillPath(fn2, 1920, 0, 1200)}" fill="#2C3A7A"/><path d="${A.hillPath(fn2, 1920, 12, 1200)}" fill="#27346F"/>`;
    for (const [x, y] of [[180, 800], [420, 830], [1560, 810], [1800, 840], [660, 795]]) s += `<circle cx="${x}" cy="${y - 56}" r="46" fill="${P.mintD}"/><circle cx="${x - 30}" cy="${y - 34}" r="30" fill="${P.mintD}"/><circle cx="${x + 30}" cy="${y - 32}" r="32" fill="${P.mintD}"/><circle cx="${x - 12}" cy="${y - 70}" r="20" fill="${P.mint}" opacity=".6"/><rect x="${x - 7}" y="${y - 20}" width="14" height="40" rx="5" fill="#3A416E"/>`;
    s += `<rect x="-300" y="860" width="2520" height="400" fill="#27346F"/><rect x="-300" y="860" width="2520" height="14" fill="#33438A"/>`;
    // plataforma
    s += `<path d="M560,880 L640,846 H1080 L1160,880Z" fill="#AEB6D6"/><rect x="560" y="880" width="600" height="46" fill="#8E97BD"/>`; for (let x = 570; x < 1150; x += 60) s += `<path d="M${x},884 h30 l-20,38 h-30Z" fill="${P.yel}"/>`;
    s += `<rect x="560" y="926" width="600" height="14" fill="#6F78A3"/>`;
    // torre
    s += `<rect x="610" y="420" width="16" height="430" fill="${P.pur}"/><rect x="690" y="420" width="16" height="430" fill="${P.purD}"/>`; for (let y = 430; y < 840; y += 70) s += `<path d="M618,${y} L698,${y + 70} M698,${y} L618,${y + 70}" stroke="${P.pink}" stroke-width="8"/><rect x="606" y="${y - 6}" width="104" height="10" fill="${P.purD}"/>`;
    s += `<rect x="600" y="400" width="116" height="24" rx="8" fill="${P.pink}"/><rect x="654" y="350" width="8" height="52" fill="#AEB6D6"/><circle class="luz" cx="658" cy="344" r="12" fill="${P.red}"/><rect x="706" y="560" width="96" height="16" rx="6" fill="#AEB6D6"/><rect x="706" y="700" width="80" height="16" rx="6" fill="#AEB6D6"/>`;
    // painel
    s += `<g transform="translate(1310,900)"><path d="M-110,0 L-96,-150 H96 L110,0Z" fill="${P.mintD}"/><path d="M-96,-150 H96 L104,-132 H-104Z" fill="${P.mint}"/><rect x="-76" y="-118" width="92" height="62" rx="10" fill="#1D2757"/>` + [0, 1, 2, 3, 4].map(i => `<rect class="bar" x="${-66 + i * 17}" y="-70" width="11" height="6" fill="${[P.pink, P.yel, P.mint, P.turq, P.pur][i]}"/>`).join('') + [0, 1, 2].map(i => `<circle class="pl${i}" cx="${38 + (i % 2) * 34}" cy="${-104 + floor(i / 2) * 30 + (i === 1 ? 0 : 0)}" r="10" fill="${[P.yel, P.pink, P.turq][i]}"/>`).join('') + `<rect x="-90" y="-40" width="180" height="10" rx="5" fill="${P.mint}"/></g>`;
    T.g(g, s);
    const btn = T.g(g, `<rect x="-56" y="-14" width="112" height="22" rx="8" fill="#6F78A3"/><g class="cap"><path d="M-44,-12 Q-44,-64 0,-64 Q44,-64 44,-12Z" fill="${P.red}"/><path d="M-30,-40 Q-22,-56 -4,-56" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".6"/></g>`, { transform: 'translate(1310,750)' });
    const cap = btn.querySelector('.cap'), bars = [...g.querySelectorAll('.bar')], luz = g.querySelector('.luz'), pls = [0, 1, 2].map(i => g.querySelector('.pl' + i));
    const back = T.el('g', {}, g), slot = T.el('g', {}, g), front = T.el('g', {}, g);
    const smoke = []; for (let i = 0; i < 18; i++) smoke.push(T.g(front, `<circle r="60"/><circle cx="50" cy="14" r="42"/><circle cx="-46" cy="16" r="40"/>`, { fill: [P.orange, P.yel, '#FFE9C2', '#fff'][i % 4] }));
    return {
      g, slot, back,
      update(t, o) {
        dawn.setAttribute('opacity', o.dawn || 0);
        T.setT(cap, `translate(0,${f1(-12 + 12 * 0)}) scale(${(1 + 0.25 * (o.press || 0)).toFixed(2)},${(1 - 0.6 * (o.press || 0)).toFixed(2)})`);
        bars.forEach((b, i) => { const h = 8 + 36 * abs(sin(t * (3 + i) + i)); b.setAttribute('height', f1(h)); b.setAttribute('y', f1(-64 - h)); });
        luz.setAttribute('opacity', sin(t * 6) > 0 ? 1 : 0.25); pls.forEach((p, i) => p.setAttribute('opacity', sin(t * 9 + i * 2) > 0 ? 1 : 0.3));
        smoke.forEach((e, k) => { const a = (o.smoke || 0) <= 0 ? -1 : ((t * 1.3 + k / 18) % 1); if (a < 0) return T.show(e, false); T.show(e, true); const sd = k % 2 ? 1 : -1, h = (k * 0.618) % 1; T.setT(e, `translate(${f1(860 + sd * (40 + 520 * a * (0.5 + h)))},${f1(860 - 90 * a * h + 20 * sin(k))}) scale(${(0.5 + 1.8 * a).toFixed(2)})`); e.setAttribute('opacity', ((1 - a) * o.smoke).toFixed(2)); });
      }
    };
  };
})();
