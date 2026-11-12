'use strict';
// Os amiguinhos: macaquinho, girafa, coelhinho, ursinho e a borboleta.
(() => {
  const C = T.C;
  const { sin, cos, PI, abs } = Math;
  const K = {
    macaco: { b: '#8B5A3C', bd: '#6F452C', be: '#F2D3A8', hand: '#F2D3A8', foot: '#6F452C', hy: -118, s: 1 },
    girafa: { b: '#F7C245', bd: '#E0A52B', be: '#FCE39A', hand: '#8B5A3C', foot: '#8B5A3C', hy: -112, s: 0.94 },
    coelho: { b: '#FCF8F1', bd: '#E6DACB', be: '#FFFFFF', hand: '#FCF8F1', foot: '#FCF8F1', hy: -118, s: 1, st: ' stroke="#DCCFBD" stroke-width="3"' },
    urso: { b: '#C98F5A', bd: '#A87344', be: '#F5DDB5', hand: '#A87344', foot: '#A87344', hy: -118, s: 1 }
  };
  const spots = pts => pts.map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.8}" fill="#B9773A"/>`).join('');

  T.mkChar = kind => {
    const k = K[kind], st = k.st || '';
    const root = T.el('g', {}), q = T.el('g', {}, root);
    let tail = null, earL = null, earR = null, hat = null;
    if (kind === 'macaco') tail = T.g(q, `<path d="M0,0 q62,6 62,-48 q0,-34 -28,-32 q-20,2 -16,20" fill="none" stroke="${k.b}" stroke-width="11" stroke-linecap="round"/>`);
    if (kind === 'coelho') T.g(q, `<circle cx="40" cy="-44" r="15" fill="#fff"${st}/>`);
    if (kind === 'girafa') tail = T.g(q, `<path d="M0,0 q30,6 34,34" fill="none" stroke="${k.b}" stroke-width="7" stroke-linecap="round"/><circle cx="35" cy="40" r="8" fill="#8B5A3C"/>`);
    const leg = sx => T.g(q, `<rect x="-12" y="-4" width="24" height="30" rx="10" fill="${k.b}"${st}/><ellipse cx="${sx * 3}" cy="27" rx="19" ry="10" fill="${k.foot}"${st}/>`);
    const lL = leg(-1), lR = leg(1);
    T.g(q, `<ellipse cx="0" cy="-80" rx="${kind === 'girafa' ? 46 : 50}" ry="56" fill="${k.b}"${st}/>${kind === 'girafa' ? spots([[-26, -100, 11], [22, -112, 9], [30, -70, 12], [-30, -58, 10], [0, -40, 9]]) : `<ellipse cx="0" cy="-70" rx="33" ry="38" fill="${k.be}"/>`}`);
    const arm = () => T.g(q, `<rect x="-11" y="-8" width="22" height="64" rx="11" fill="${k.b}"${st}/><circle cy="54" r="13" fill="${k.hand}"${st}/>`);
    const aL = arm(), aR = arm();
    const head = T.el('g', {}, q);
    let fo;
    if (kind === 'macaco') {
      head.innerHTML = `<circle cx="-58" cy="-50" r="21" fill="${k.b}"/><circle cx="-58" cy="-50" r="12" fill="${k.be}"/><circle cx="58" cy="-50" r="21" fill="${k.b}"/><circle cx="58" cy="-50" r="12" fill="${k.be}"/>
<circle cx="0" cy="-50" r="55" fill="${k.b}"/><path d="M-12,-100 q8,-22 14,-4 q10,-16 12,4Z" fill="${k.b}"/>
<circle cx="-19" cy="-58" r="25" fill="${k.be}"/><circle cx="19" cy="-58" r="25" fill="${k.be}"/><ellipse cx="0" cy="-30" rx="39" ry="27" fill="${k.be}"/><ellipse cx="-4" cy="-41" rx="2.5" ry="3.5" fill="${k.bd}"/><ellipse cx="4" cy="-41" rx="2.5" ry="3.5" fill="${k.bd}"/>`;
      fo = { cx: 0, cy: -52, dx: 19, my: 20 };
    } else if (kind === 'urso') {
      head.innerHTML = `<circle cx="-40" cy="-94" r="21" fill="${k.b}"/><circle cx="-40" cy="-94" r="11" fill="${k.be}"/><circle cx="40" cy="-94" r="21" fill="${k.b}"/><circle cx="40" cy="-94" r="11" fill="${k.be}"/>
<circle cx="0" cy="-50" r="56" fill="${k.b}"/><ellipse cx="0" cy="-30" rx="28" ry="22" fill="${k.be}"/><ellipse cx="0" cy="-42" rx="9.5" ry="7" fill="#5E3D29"/>`;
      fo = { cx: 0, cy: -54, dx: 23, my: 24 };
    } else if (kind === 'coelho') {
      const ear = () => T.g(head, `<ellipse cy="-46" rx="17" ry="52" fill="${k.b}"${st}/><ellipse cy="-44" rx="8" ry="36" fill="${C.pink}"/>`);
      earL = ear(); earR = ear();
      T.g(head, `<circle cx="0" cy="-50" r="55" fill="${k.b}"${st}/><ellipse cx="-13" cy="-28" rx="15" ry="12" fill="#fff"/><ellipse cx="13" cy="-28" rx="15" ry="12" fill="#fff"/><path d="M-8,-42 h16 q0,10 -8,11 q-8,-1 -8,-11Z" fill="${C.pink}"/>`);
      fo = { cx: 0, cy: -54, dx: 23, my: 26 };
    } else {
      head.innerHTML = `<rect x="-17" y="-190" width="34" height="204" rx="16" fill="${k.b}"/>${spots([[-6, -150, 8], [7, -110, 9], [-5, -70, 8], [6, -32, 9]])}
<ellipse cx="-52" cy="-236" rx="19" ry="10" fill="${k.b}" transform="rotate(25 -52 -236)"/><ellipse cx="52" cy="-236" rx="19" ry="10" fill="${k.b}" transform="rotate(-25 52 -236)"/>
<rect x="-34" y="-290" width="9" height="38" rx="4" fill="${k.b}" transform="rotate(-14 -30 -256)"/><circle cx="-39" cy="-292" r="8" fill="#8B5A3C"/><rect x="25" y="-290" width="9" height="38" rx="4" fill="${k.b}" transform="rotate(14 30 -256)"/><circle cx="39" cy="-292" r="8" fill="#8B5A3C"/>
<ellipse cx="0" cy="-216" rx="45" ry="43" fill="${k.b}"/><ellipse cx="0" cy="-194" rx="33" ry="25" fill="${k.be}"/><ellipse cx="-9" cy="-204" rx="3" ry="4" fill="${k.bd}"/><ellipse cx="9" cy="-204" rx="3" ry="4" fill="${k.bd}"/>`;
      fo = { cx: 0, cy: -224, dx: 21, my: 32, s: 0.92 };
    }
    const face = T.face(head, fo);
    if (kind === 'girafa') hat = T.g(head, `<ellipse cx="0" cy="0" rx="40" ry="9" fill="${C.lilacD}"/><rect x="-26" y="-44" width="52" height="46" rx="10" fill="${C.lilac}"/><rect x="-26" y="-16" width="52" height="11" fill="${C.lilacD}"/><rect x="-18" y="-38" width="10" height="18" rx="5" fill="${C.lilacL}" opacity=".8"/><circle cx="16" cy="-10" r="6" fill="${C.gold}"/>`);
    const o = {
      kind, g: root, s0: k.s,
      // pose: x,y,s,rot,flip,sq, aL,aR (graus: 0 = baixo, 180 = cima; negativo = para dentro), head, lL,lR, mouth, blink, look, hatUp
      pose(p) {
        const s = (p.s || 1) * k.s, sq = p.sq || 0;
        T.setT(root, `translate(${p.x.toFixed(1)},${p.y.toFixed(1)}) rotate(${(p.rot || 0).toFixed(2)}) scale(${(s * (p.flip == null ? 1 : p.flip) * (1 + sq)).toFixed(3)},${(s * (1 - sq)).toFixed(3)})`);
        T.setT(head, `translate(0,${k.hy}) rotate(${(p.head || 0).toFixed(2)})`);
        T.setT(aL, `translate(-43,-112) rotate(${(p.aL == null ? 14 : p.aL).toFixed(1)})`);
        T.setT(aR, `translate(43,-112) rotate(${(-(p.aR == null ? 14 : p.aR)).toFixed(1)})`);
        T.setT(lL, `translate(-22,${(-30 - (p.lL || 0)).toFixed(1)})`); T.setT(lR, `translate(22,${(-30 - (p.lR || 0)).toFixed(1)})`);
        face.set(p.blink, p.mouth || 0, p.look || 0);
        const w = p.wag || 0;
        if (tail) T.setT(tail, kind === 'macaco' ? `translate(40,-44) rotate(${(w * 14).toFixed(1)})` : `translate(40,-70) rotate(${(w * 18).toFixed(1)})`);
        if (earL) { T.setT(earL, `translate(-22,-92) rotate(${(-9 + w * 9).toFixed(1)})`); T.setT(earR, `translate(22,-92) rotate(${(9 + w * 7).toFixed(1)})`); }
        if (hat) { const h = p.hatUp || 0; T.setT(hat, `translate(${(h * 34).toFixed(1)},${(-258 - h * 46).toFixed(1)}) rotate(${(h * 24 - 4).toFixed(1)})`); }
      }
    };
    return o;
  };

  // Borboleta amiga (com rostinho)
  T.mkButterfly = () => {
    const g = T.el('g', {});
    const wing = sx => T.g(g, `<path d="M0,-6 C${sx * 20},-62 ${sx * 86},-58 ${sx * 70},-8 C${sx * 62},6 ${sx * 20},8 0,2Z" fill="${C.coral}"/><path d="M0,2 C${sx * 22},4 ${sx * 62},14 ${sx * 50},44 C${sx * 40},62 ${sx * 8},44 0,14Z" fill="${C.sky}"/><circle cx="${sx * 46}" cy="-28" r="13" fill="${C.gold}"/><circle cx="${sx * 46}" cy="-28" r="6" fill="${C.cream}"/><circle cx="${sx * 30}" cy="28" r="9" fill="${C.lilac}"/><path d="M0,-6 C${sx * 20},-62 ${sx * 86},-58 ${sx * 70},-8" fill="none" stroke="${C.coralD}" stroke-width="4"/>`);
    const wl = wing(-1), wr = wing(1);
    T.g(g, `<path d="M-5,-34 q-10,-22 -20,-22 M5,-34 q10,-22 20,-22" stroke="${C.ink}" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="-26" cy="-56" r="4" fill="${C.coral}"/><circle cx="26" cy="-56" r="4" fill="${C.coral}"/><rect x="-8" y="-12" width="16" height="50" rx="8" fill="${C.lilacD}"/><rect x="-8" y="2" width="16" height="6" fill="${C.lilac}"/><rect x="-8" y="16" width="16" height="6" fill="${C.lilac}"/><circle cx="0" cy="-24" r="17" fill="${C.lilac}"/>`);
    const face = T.face(g, { cx: 0, cy: -24, s: 0.42, dx: 17, my: 14, cheeks: false });
    return {
      g, pose(p) {
        T.setT(g, `translate(${p.x.toFixed(1)},${p.y.toFixed(1)}) rotate(${(p.rot || 0).toFixed(1)}) scale(${p.s || 1})`);
        const f = 0.25 + 0.75 * abs(cos(p.flap)); T.setT(wl, `scale(${f.toFixed(2)},1)`); T.setT(wr, `scale(${f.toFixed(2)},1)`);
        face.set(p.blink, p.mouth || 0, 0);
      }
    };
  };
})();
