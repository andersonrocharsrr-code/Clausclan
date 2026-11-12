'use strict';
// Elenco do circo: gente (Chico, mágico, malabarista, bailarina, equilibrista, crianças) e o leão.
(() => {
  const C = T.C;
  const { sin, cos, PI, abs } = Math;
  const SK = { claro: ['#F6C9A0', '#E5AE82'], medio: ['#D9A066', '#C48A52'], moreno: ['#B97A4B', '#A0663B'], escuro: ['#8D5B3F', '#774A32'] };
  const INK = C.ink;

  // Boneco humano. Origem nos pés. Mesma API de pose dos bichos do trenzinho.
  T.mkPerson = sp => {
    const kid = !!sp.kid, D = kid ? { lt: -52, ll: 36, tt: -124, th: 82, tw: 36, sy: -108, al: 46, hy: -118 } : { lt: -78, ll: 60, tt: -160, th: 94, tw: sp.slim ? 33 : 42, sy: -142, al: 58, hy: -154 };
    const sk = SK[sp.skin], shoe = sp.shoe || { rx: 22, ry: 11, c: INK };
    const root = T.el('g', {}), q = T.el('g', {}, root);
    if (sp.back) T.g(q, sp.back);
    const leg = sx => T.g(q, `<rect x="-13" y="0" width="26" height="${D.ll + 8}" rx="11" fill="${sp.pants[sx < 0 ? 0 : 1] || sp.pants[0]}"/>${sp.legX || ''}<ellipse cx="${sx * shoe.rx * 0.38}" cy="${D.ll + 8}" rx="${shoe.rx}" ry="${shoe.ry}" fill="${shoe.c}"/><ellipse cx="${sx * shoe.rx * 0.5}" cy="${D.ll + 4}" rx="${shoe.rx * 0.45}" ry="${shoe.ry * 0.4}" fill="#fff" opacity=".35"/>${shoe.x || ''}`);
    const lL = leg(-1), lR = leg(1);
    T.g(q, `<rect x="${-D.tw}" y="${D.tt}" width="${D.tw * 2}" height="${D.th}" rx="${kid ? 26 : 30}" fill="${sp.top}"/>${sp.torso || ''}`);
    const arm = right => T.g(q, `<rect x="-11" y="-8" width="22" height="${D.al}" rx="11" fill="${sp.sleeve || sp.top}"/><circle cy="${D.al - 4}" r="13" fill="${sp.glove || sk[0]}"/>${right && sp.handR ? `<g transform="translate(0,${D.al - 4})">${sp.handR}</g>` : ''}`);
    const aL = arm(0), aR = arm(1);
    if (sp.skirt) T.g(q, sp.skirt);
    const head = T.el('g', {}, q);
    T.g(head, `${sp.hairBack || ''}<rect x="-11" y="-12" width="22" height="22" fill="${sk[1]}"/><circle cx="-50" cy="-46" r="11" fill="${sk[0]}"/><circle cx="50" cy="-46" r="11" fill="${sk[0]}"/><circle cx="0" cy="-50" r="50" fill="${sk[0]}"/>${sp.paint || ''}`);
    const my = sp.my || 20, face = T.face(head, { cx: 0, cy: -54, dx: 20, my });
    const grin = T.g(head, `<path d="M-24,${my - 4} Q0,${my + 34} 24,${my - 4}Z" fill="#fff" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/><path d="M-17,${my + 4} H17" stroke="${INK}" stroke-width="2" opacity=".35"/>`, { transform: 'translate(0,-54)' });
    const tongue = T.g(head, `<ellipse cx="0" cy="${my + 20}" rx="10" ry="15" fill="${C.coralL}"/><path d="M0,${my + 10} v16" stroke="${C.coralD}" stroke-width="2.5"/>`, { transform: 'translate(0,-54)' });
    T.g(head, `${sp.nose || `<ellipse cx="0" cy="-44" rx="6" ry="4.5" fill="${sk[1]}"/>`}${sp.hair || ''}`);
    const hat = sp.hat ? T.g(head, sp.hat) : null;
    return {
      g: root, sp,
      pose(p) {
        const s = p.s || 1, sq = p.sq || 0;
        T.setT(root, `translate(${p.x.toFixed(1)},${p.y.toFixed(1)}) rotate(${(p.rot || 0).toFixed(2)}) scale(${(s * (p.flip == null ? 1 : p.flip) * (1 + sq)).toFixed(3)},${(s * (1 - sq)).toFixed(3)})`);
        T.setT(head, `translate(0,${D.hy}) rotate(${(p.head || 0).toFixed(2)})`);
        T.setT(aL, `translate(${-D.tw + 3},${D.sy}) rotate(${(p.aL == null ? 14 : p.aL).toFixed(1)})`);
        T.setT(aR, `translate(${D.tw - 3},${D.sy}) rotate(${(-(p.aR == null ? 14 : p.aR)).toFixed(1)})`);
        T.setT(lL, `translate(-19,${(D.lt - (p.lL || 0)).toFixed(1)}) rotate(${(p.kL || 0).toFixed(1)})`); T.setT(lR, `translate(19,${(D.lt - (p.lR || 0)).toFixed(1)}) rotate(${(-(p.kR || 0)).toFixed(1)})`);
        const g = !!p.grin, tg = !!p.tongue;
        face.set(p.blink, g ? 0 : tg ? 0.7 : (p.mouth || 0), p.look || 0);
        T.show(grin, g); T.show(tongue, tg);
        if (hat) T.show(hat, !p.hatOff);
      }
    };
  };

  const dots = (pts, r) => pts.map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`).join('');
  const topHat = `<ellipse cx="0" cy="-94" rx="54" ry="11" fill="${INK}"/><rect x="-36" y="-172" width="72" height="80" rx="7" fill="${INK}"/><rect x="-36" y="-114" width="72" height="15" fill="${C.coral}"/><rect x="-28" y="-164" width="10" height="44" rx="5" fill="#fff" opacity=".18"/>`;
  T.topHat = topHat;
  T.ELENCO = {
    chico: {
      skin: 'claro', top: C.gold, sleeve: C.gold, pants: [C.lilac, C.sky], glove: '#fff', shoe: { rx: 44, ry: 19, c: C.coral },
      torso: dots([[-22, -128, C.coral], [14, -138, C.sky], [24, -104, C.green], [-12, -98, C.lilac], [-28, -80, C.sky], [8, -78, C.coral]], 7) + `<path d="M-28,-160 V-70 M28,-160 V-70" stroke="${C.coralD}" stroke-width="9"/><circle cx="0" cy="-112" r="10" fill="${C.coral}"/><circle cx="0" cy="-84" r="10" fill="${C.green}"/>` + [-40, -20, 0, 20, 40].map(x => `<circle cx="${x}" cy="-156" r="15" fill="${C.sky}"/><circle cx="${x}" cy="-159" r="9" fill="${C.skyL}"/>`).join(''),
      hairBack: dots([[-54, -70, C.orange], [-64, -44, C.orange], [-50, -92, C.orange], [54, -70, C.orange], [64, -44, C.orange], [50, -92, C.orange]], 23) + dots([[-58, -74, '#F9A860'], [58, -74, '#F9A860']], 10),
      paint: `<ellipse cx="0" cy="-27" rx="33" ry="22" fill="#fff"/><path d="M-30,-82 q10,-12 20,0 M10,-82 q10,-12 20,0" stroke="${C.blue}" stroke-width="5" fill="none" stroke-linecap="round"/>`,
      nose: `<circle cx="0" cy="-45" r="13" fill="${C.coral}"/><circle cx="-4" cy="-49" r="4" fill="#fff" opacity=".7"/>`,
      hat: `<g transform="rotate(-9 0 -96)"><path d="M-40,-96 Q-40,-140 0,-140 Q40,-140 40,-96Z" fill="#fff"/><path d="M-48,-90 Q-52,-112 -40,-112 H40 Q52,-112 48,-90 Q0,-82 -48,-90Z" fill="#F4F6FA" stroke="${C.blue}" stroke-width="5"/><rect x="-34" y="-124" width="68" height="7" fill="${C.blue}"/><circle cx="0" cy="-144" r="10" fill="${C.coral}"/></g>`
    },
    magico: {
      skin: 'moreno', top: INK, sleeve: INK, pants: [INK], glove: '#fff', shoe: { rx: 24, ry: 11, c: '#1E2740' },
      back: `<path d="M-46,-156 Q-96,-70 -78,-8 H78 Q96,-70 46,-156Z" fill="${INK}"/><path d="M-40,-150 Q-78,-70 -62,-14 H62 Q78,-70 40,-150Z" fill="${C.coral}"/>`,
      torso: `<path d="M-20,-160 L0,-96 L20,-160Z" fill="#fff"/><path d="M-20,-160 L-36,-150 L-6,-100Z M20,-160 L36,-150 L6,-100Z" fill="${C.lilac}"/><path d="M0,-146 l-18,-10 v20Z M0,-146 l18,-10 v20Z" fill="${C.coral}"/><circle cx="0" cy="-146" r="5" fill="${C.coralD}"/><circle cx="0" cy="-92" r="4" fill="${C.gold}"/><circle cx="0" cy="-78" r="4" fill="${C.gold}"/>`,
      hairBack: `<path d="M-50,-50 Q-52,-104 0,-102 Q52,-104 50,-50 Q30,-80 0,-80 Q-30,-80 -50,-50Z" fill="#1E2740"/>`,
      hair: `<path d="M-3,-34 q-12,-10 -24,0 q-4,6 2,8 M3,-34 q12,-10 24,0 q4,6 -2,8" stroke="#1E2740" stroke-width="6" fill="none" stroke-linecap="round"/>`, my: 24,
      hat: topHat,
      handR: `<g transform="rotate(-25)"><rect x="-4" y="-66" width="8" height="78" rx="3" fill="#1E2740"/><rect x="-4" y="-66" width="8" height="15" rx="3" fill="#fff"/></g>`
    },
    malabarista: {
      skin: 'claro', top: C.green, sleeve: C.greenL, pants: [C.orange, C.gold], shoe: { rx: 23, ry: 11, c: C.lilacD },
      torso: `<path d="M-42,-150 Q-42,-66 -30,-66 H-6 L-18,-160Z M42,-150 Q42,-66 30,-66 H6 L18,-160Z" fill="${C.lilac}"/><path d="${T.A.star4}" fill="${C.gold}" transform="translate(-26,-112) scale(.6)"/><path d="${T.A.star4}" fill="${C.gold}" transform="translate(26,-112) scale(.6)"/><rect x="-42" y="-82" width="84" height="12" rx="6" fill="${C.gold}"/>`,
      legX: `<path d="M-13,14 L0,2 L13,14 L0,26Z M-13,40 L0,28 L13,40 L0,52Z" fill="#fff" opacity=".4"/>`,
      hairBack: `<path d="M-52,-46 Q-56,-106 0,-104 Q56,-106 52,-46 Q40,-84 0,-86 Q-40,-84 -52,-46Z" fill="${C.brown}"/><circle cx="0" cy="-108" r="15" fill="${C.brown}"/>`,
      hair: `<path d="M-49,-64 Q0,-92 49,-64 L47,-76 Q0,-104 -47,-76Z" fill="${C.gold}"/>`
    },
    bailarina: {
      skin: 'escuro', slim: 1, top: C.pink, sleeve: '#8D5B3F', pants: ['#F9C9D4'], shoe: { rx: 17, ry: 9, c: '#F28CA6', x: `<path d="M-10,52 L10,60 M10,52 L-10,60" stroke="#F28CA6" stroke-width="3"/>` },
      torso: `<path d="M-33,-160 q33,26 66,0" fill="none" stroke="#F28CA6" stroke-width="6"/><path d="${T.A.star4}" fill="#fff" transform="translate(0,-118) scale(.55)"/>`,
      skirt: `<ellipse cx="0" cy="-70" rx="78" ry="22" fill="#F9C9D4"/><ellipse cx="0" cy="-76" rx="64" ry="17" fill="${C.pink}"/><ellipse cx="0" cy="-82" rx="46" ry="12" fill="#FBDDE4"/>`,
      hairBack: `<path d="M-52,-44 Q-56,-106 0,-104 Q56,-106 52,-44 Q40,-88 0,-88 Q-40,-88 -52,-44Z" fill="#2B1B17"/><circle cx="0" cy="-112" r="21" fill="#2B1B17"/><path d="M-22,-102 q22,-14 44,0" stroke="#F28CA6" stroke-width="7" fill="none"/>`,
      hair: `<path d="M-14,-96 l6,-14 l8,10 l8,-10 l6,14Z" fill="${C.gold}"/><path d="M-36,-66 l-10,-6 M36,-66 l10,-6" stroke="#2B1B17" stroke-width="3.5" stroke-linecap="round"/>`
    },
    equilibrista: {
      skin: 'medio', top: C.blue, sleeve: C.blue, pants: [C.blue], shoe: { rx: 19, ry: 9, c: '#fff' },
      torso: `<g fill="#fff"><rect x="-41" y="-146" width="82" height="11"/><rect x="-42" y="-122" width="84" height="11"/><rect x="-42" y="-98" width="84" height="11"/></g><rect x="-42" y="-82" width="84" height="15" rx="7" fill="${C.coral}"/><path d="M26,-74 l10,36 l10,-34Z" fill="${C.coral}"/>`,
      legX: `<rect x="-13" y="14" width="26" height="10" fill="#fff"/><rect x="-13" y="38" width="26" height="10" fill="#fff"/>`,
      hairBack: `<path d="M-52,-48 Q-58,-110 -10,-104 Q10,-118 30,-102 Q60,-96 52,-48 Q36,-84 0,-84 Q-36,-84 -52,-48Z" fill="#D9642E"/>`,
      hair: `<path d="M-49,-66 Q0,-92 49,-66 L48,-76 Q0,-102 -48,-76Z" fill="${C.coral}"/>`
    }
  };
  const kid = (skin, top, pants, shoeC, hairBack, hair, extra) => Object.assign({ kid: 1, skin, top, pants: [pants], shoe: { rx: 20, ry: 10, c: shoeC }, hairBack, hair }, extra || {});
  T.KIDS = [
    kid('claro', C.gold, C.coral, '#fff', `<path d="M-52,-44 Q-56,-106 0,-104 Q56,-106 52,-44 Q40,-86 0,-86 Q-40,-86 -52,-44Z" fill="#E9B44C"/><circle cx="-64" cy="-40" r="19" fill="#E9B44C"/><circle cx="64" cy="-40" r="19" fill="#E9B44C"/><circle cx="-52" cy="-52" r="7" fill="${C.coral}"/><circle cx="52" cy="-52" r="7" fill="${C.coral}"/>`, '', { skirt: `<path d="M-40,-66 L-56,-34 H56 L40,-66Z" fill="${C.gold}"/><path d="M-56,-34 H56 v8 H-56Z" fill="${C.goldD}"/>`, torso: `<circle cx="0" cy="-92" r="9" fill="#fff"/>` }),
    kid('escuro', C.green, C.blue, C.coral, `<path d="M-52,-46 Q-54,-100 0,-100 Q54,-100 52,-46 Q36,-78 0,-80 Q-36,-78 -52,-46Z" fill="#2B1B17"/>`, `<path d="M-50,-74 Q-50,-112 0,-112 Q50,-112 50,-74Z" fill="${C.coral}"/><path d="M-54,-72 Q-30,-64 44,-74 L50,-84 Q0,-90 -50,-82Z" fill="${C.coralD}"/><circle cx="0" cy="-112" r="6" fill="${C.coralD}"/>`, { torso: `<rect x="-36" y="-98" width="72" height="12" fill="#fff" opacity=".8"/>` }),
    kid('moreno', C.lilac, C.orange, C.sky, dots([[-44, -78, '#3A2418'], [-56, -52, '#3A2418'], [-24, -98, '#3A2418'], [0, -104, '#3A2418'], [24, -98, '#3A2418'], [44, -78, '#3A2418'], [56, -52, '#3A2418'], [-52, -28, '#3A2418'], [52, -28, '#3A2418']], 20), `<circle cx="34" cy="-92" r="9" fill="${C.gold}"/>`, { torso: `<path d="${T.A.heart}" fill="${C.coral}" transform="translate(0,-88) scale(1.1)"/>` }),
    kid('claro', C.coral, C.ink, C.gold, `<path d="M-52,-50 Q-56,-108 0,-104 Q56,-108 52,-50 Q30,-88 -10,-84 Q-40,-80 -52,-50Z" fill="#B5562B"/>`, `<g fill="none" stroke="${C.ink}" stroke-width="4"><circle cx="-20" cy="-61" r="19"/><circle cx="20" cy="-61" r="19"/><path d="M-1,-61 h2 M-39,-64 l-10,-4 M39,-64 l10,-4"/></g>`, { torso: `<rect x="-36" y="-110" width="72" height="9" fill="#fff"/><rect x="-36" y="-92" width="72" height="9" fill="#fff"/>` })
  ];

  // Leão de brinquedo, simpático (com remendo de pelúcia).
  T.mkLion = () => {
    const b = '#F0A93E', bd = '#D98E2B', be = '#FCE6B8', mn = '#C9652B', mn2 = '#E07F35';
    const root = T.el('g', {}), q = T.el('g', {}, root);
    const tail = T.g(q, `<path d="M0,0 q60,0 66,-56" fill="none" stroke="${b}" stroke-width="10" stroke-linecap="round"/><path d="M66,-56 q-20,-22 -4,-44 q22,18 4,44Z" fill="${mn}"/>`);
    const leg = sx => T.g(q, `<rect x="-14" y="-4" width="28" height="32" rx="11" fill="${b}"/><ellipse cx="${sx * 3}" cy="28" rx="21" ry="11" fill="${bd}"/>`);
    const lL = leg(-1), lR = leg(1);
    T.g(q, `<ellipse cx="0" cy="-82" rx="54" ry="58" fill="${b}"/><ellipse cx="0" cy="-72" rx="35" ry="40" fill="${be}"/><rect x="8" y="-84" width="24" height="24" rx="4" fill="${C.lilac}" transform="rotate(12 20 -72)"/><path d="M6,-80 l6,6 M30,-86 l6,6 M34,-60 l6,-4 M10,-56 l-5,5" stroke="${C.lilacD}" stroke-width="3" stroke-linecap="round"/>`);
    const arm = right => T.g(q, `<rect x="-12" y="-8" width="24" height="64" rx="12" fill="${b}"/><circle cy="54" r="14" fill="${bd}"/>`);
    const aL = arm(0), aR = arm(1);
    const head = T.el('g', {}, q);
    let m = ''; for (let i = 0; i < 14; i++) { const a = i * 2 * PI / 14; m += `<circle cx="${(66 * cos(a)).toFixed(1)}" cy="${(-52 + 66 * sin(a)).toFixed(1)}" r="27" fill="${i % 2 ? mn : mn2}"/>`; }
    const mane = T.g(head, m);
    T.g(head, `<circle cx="-42" cy="-94" r="17" fill="${b}"/><circle cx="-42" cy="-94" r="9" fill="${be}"/><circle cx="42" cy="-94" r="17" fill="${b}"/><circle cx="42" cy="-94" r="9" fill="${be}"/><circle cx="0" cy="-50" r="55" fill="${b}"/><circle cx="-15" cy="-28" r="19" fill="${be}"/><circle cx="15" cy="-28" r="19" fill="${be}"/><path d="M-11,-44 h22 q0,13 -11,14 q-11,-1 -11,-14Z" fill="#7A4A2A"/>`);
    const face = T.face(head, { cx: 0, cy: -56, dx: 23, my: 34 });
    const tp = T.g(head, `<rect x="-5" y="0" width="10" height="70" rx="4" fill="${C.goldD}"/><path d="M-6,62 L-34,112 Q0,126 34,112 L6,62Z" fill="${C.gold}"/><ellipse cx="0" cy="112" rx="34" ry="10" fill="${C.goldD}"/><circle cx="0" cy="22" r="6" fill="${C.goldL}"/><circle cx="0" cy="38" r="6" fill="${C.goldL}"/>`, { transform: 'translate(4,-14) rotate(-62)' });
    const roar = T.g(head, `<ellipse rx="30" ry="34" fill="#7A2E3A"/><ellipse cy="16" rx="18" ry="13" fill="${C.coralL}"/><path d="M-20,-24 l7,14 l7,-16Z M20,-24 l-7,14 l-7,-16Z" fill="#fff"/>`);
    return {
      g: root,
      pose(p) {
        const s = p.s || 1, sq = p.sq || 0;
        T.setT(root, `translate(${p.x.toFixed(1)},${p.y.toFixed(1)}) rotate(${(p.rot || 0).toFixed(2)}) scale(${(s * (p.flip == null ? 1 : p.flip) * (1 + sq)).toFixed(3)},${(s * (1 - sq)).toFixed(3)})`);
        T.setT(head, `translate(0,-120) rotate(${(p.head || 0).toFixed(2)})`);
        T.setT(aL, `translate(-46,-114) rotate(${(p.aL == null ? 14 : p.aL).toFixed(1)})`); T.setT(aR, `translate(46,-114) rotate(${(-(p.aR == null ? 14 : p.aR)).toFixed(1)})`);
        T.setT(lL, `translate(-24,${(-30 - (p.lL || 0)).toFixed(1)})`); T.setT(lR, `translate(24,${(-30 - (p.lR || 0)).toFixed(1)})`);
        T.setT(tail, `translate(44,-46) rotate(${((p.wag || 0) * 16).toFixed(1)})`);
        const r = p.roar || 0; T.show(roar, r > 0.05); if (r > 0.05) T.setT(roar, `translate(0,-16) scale(${(0.5 + 0.6 * r).toFixed(2)},${(0.3 + 0.8 * r).toFixed(2)})`);
        T.setT(mane, `rotate(${(r * 6 * sin(p.tt * 40)).toFixed(1)} 0 -52) scale(${(1 + 0.1 * r).toFixed(3)})`);
        face.set(p.blink || r > 0.3, r > 0.05 ? 0 : (p.grin ? 0.5 : p.mouth || 0), p.look || 0);
        T.show(tp, !!p.trumpet);
      }
    };
  };
})();
