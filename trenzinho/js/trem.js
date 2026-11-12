'use strict';
// O trenzinho (locomotiva azul + vagões vermelho, amarelo, azul e verde) e o rosto usado em todos os personagens.
(() => {
  const C = T.C, A = T.A;
  const { sin, cos, PI, floor } = Math;

  // Rosto: olhos grandes, bochechas, sorriso e boca que abre.
  T.face = (parent, o) => {
    const dx = o.dx || 22, my = o.my == null ? 16 : o.my;
    const g = T.el('g', { transform: `translate(${o.cx},${o.cy}) scale(${o.s || 1})` }, parent);
    g.innerHTML = `${o.cheeks === false ? '' : `<circle cx="${-dx - 19}" cy="15" r="11" fill="${C.pink}" opacity=".8"/><circle cx="${dx + 19}" cy="15" r="11" fill="${C.pink}" opacity=".8"/>`}
<g><ellipse cx="${-dx}" cy="-8" rx="14" ry="18" fill="#fff"/><ellipse cx="${dx}" cy="-8" rx="14" ry="18" fill="#fff"/><g><circle cx="${-dx}" cy="-6" r="9.5" fill="${C.ink}"/><circle cx="${dx}" cy="-6" r="9.5" fill="${C.ink}"/><circle cx="${-dx + 3.5}" cy="-10" r="3.6" fill="#fff"/><circle cx="${dx + 3.5}" cy="-10" r="3.6" fill="#fff"/></g></g>
<path d="M${-dx - 12},-4 q12,-13 24,0 M${dx - 12},-4 q12,-13 24,0" stroke="${C.ink}" stroke-width="5" fill="none" stroke-linecap="round" style="display:none"/>
<path d="M-15,${my} Q0,${my + 17} 15,${my}" stroke="${C.ink}" stroke-width="5" fill="none" stroke-linecap="round"/>
<g style="display:none"><ellipse rx="14" ry="13" fill="#7A2E3A"/><ellipse cy="6" rx="9" ry="5.5" fill="${C.coralL}"/></g>`;
    const k = g.children, off = o.cheeks === false ? 0 : 2;
    const eyes = k[off], pp = eyes.children[2], shut = k[off + 1], smile = k[off + 2], mo = k[off + 3];
    return {
      g, set(blink, mouth, look, oo) {
        T.show(eyes, !blink); T.show(shut, !!blink);
        T.setT(pp, `translate(${(look || 0) * 4},0)`);
        const open = mouth > 0.12; T.show(smile, !open); T.show(mo, open);
        if (open) T.setT(mo, `translate(0,${my + 7}) scale(${oo ? 0.75 : 0.85 + 0.25 * mouth},${0.35 + 0.8 * mouth})`);
      }
    };
  };

  const wheel = (r, cx) => { let sp = ''; for (let i = 0; i < 6; i++) sp += `<rect x="-3.5" y="${-r + 8}" width="7" height="${r - 10}" rx="3" fill="${C.coralD}" transform="rotate(${i * 60})"/>`; return `<g transform="translate(${cx},${-r})"><g class="wh" data-r="${r}"><circle r="${r}" fill="${C.ink}"/><circle r="${r - 6}" fill="${C.coral}"/><circle r="${r - 13}" fill="${C.cream}"/>${sp}<circle r="${r * 0.36}" fill="${C.gold}"/><circle r="${r * 0.16}" fill="${C.goldD}"/></g></g>`; };

  const CARS = [
    { c: C.coral, d: C.coralD, l: C.coralL }, { c: C.gold, d: C.goldD, l: C.goldL },
    { c: C.sky, d: C.skyD, l: C.skyL }, { c: C.green, d: C.greenD, l: C.greenL }
  ];
  const emblem = i => [
    A.apple(15),
    `<circle r="11" fill="${C.gold}"/>` + [0, 1, 2, 3, 4, 5, 6, 7].map(k => `<rect x="-2.5" y="-21" width="5" height="7" rx="2.5" fill="${C.gold}" transform="rotate(${k * 45})"/>`).join(''),
    `<path d="M0,-18 Q14,0 14,8 A14,14 0 0 1 -14,8 Q-14,0 0,-18Z" fill="${C.sky}"/><ellipse cx="-5" cy="8" rx="3" ry="5" fill="#fff" opacity=".7"/>`,
    `<path d="M-14,14 Q-18,-12 14,-16 Q18,12 -14,14Z" fill="${C.green}"/><path d="M-12,12 L10,-12" stroke="${C.greenD}" stroke-width="3"/>`
  ][i];
  const cargo = i => [
    // maçãs
    [[-78, -160], [-48, -164], [-18, -158], [-62, -186], [-32, -188]].map(([x, y]) => `<g transform="translate(${x},${y})">${A.apple(19)}</g>`).join('') + `<g class="hero" transform="translate(-48,-215)"><g>${A.apple(40)}</g></g>`,
    // girassóis
    `<g transform="translate(-74,-120)">${A.sunflower(0, 0, 0.8)}</g><g transform="translate(-36,-128)">${A.sunflower(0, 0, 0.95)}</g>`,
    // balões azuis
    `<g class="bal"><path d="M-60,-120 L-84,-250 M-60,-120 L-52,-282 M-60,-120 L-22,-246" stroke="${C.cream}" stroke-width="2.5"/>` + [[-84, -280, C.skyD, C.sky], [-52, -314, C.sky, C.skyL], [-22, -276, C.blue, C.blueL]].map(([x, y, c, l]) => `<ellipse cx="${x}" cy="${y}" rx="26" ry="32" fill="${c}"/><ellipse cx="${x - 9}" cy="${y - 11}" rx="6" ry="10" fill="${l}" opacity=".8"/>`).join('') + '</g>',
    // plantas
    `<g transform="translate(-58,-150)">${A.fern(0, 0, 1.15, C.greenD)}${A.fern(0, 4, 0.8, C.greenL)}</g>`
  ][i];

  T.mkTrain = () => {
    const g = T.el('g', {});
    T.el('defs', {}, g).innerHTML = `<radialGradient id="lampG"><stop offset="0" stop-color="#FFF3B0" stop-opacity=".95"/><stop offset=".35" stop-color="#FFE27A" stop-opacity=".45"/><stop offset="1" stop-color="#FFE27A" stop-opacity="0"/></radialGradient>`;
    const cars = [];
    for (let i = 3; i >= 0; i--) {
      const k = CARS[i], cg = T.el('g', {}, g);
      const back = T.g(cg, `<rect x="-106" y="-166" width="212" height="110" rx="14" fill="${k.d}"/><rect x="-96" y="-158" width="192" height="96" rx="8" fill="#000" opacity=".16"/>`);
      const inn = T.g(cg, cargo(i));
      const front = T.g(cg, `<rect x="98" y="-62" width="56" height="11" rx="5" fill="${C.ink}"/><circle cx="128" cy="-56" r="8" fill="${C.goldD}"/>
<path d="M-114,-150 h228 l-10,96 q-2,13 -15,13 h-178 q-13,0 -15,-13Z" fill="${k.c}"/>
<path d="M-104,-70 h208 l-2,16 q-2,13 -15,13 h-174 q-13,0 -15,-13Z" fill="${k.d}" opacity=".55"/>
<g stroke="${k.d}" stroke-width="4" opacity=".4"><path d="M-58,-134 V-48 M58,-134 V-48"/></g>
<rect x="-120" y="-160" width="240" height="22" rx="11" fill="${k.l}"/><rect x="-108" y="-156" width="216" height="6" rx="3" fill="#fff" opacity=".35"/>
<circle cx="0" cy="-94" r="32" fill="${C.cream}"/><circle cx="0" cy="-94" r="32" fill="none" stroke="${k.d}" stroke-width="4" opacity=".5"/><g transform="translate(0,-94)">${emblem(i)}</g>
<g fill="${C.cream}" opacity=".8"><circle cx="-94" cy="-128" r="4"/><circle cx="94" cy="-128" r="4"/><circle cx="-88" cy="-60" r="4"/><circle cx="88" cy="-60" r="4"/></g>
<rect x="-102" y="-52" width="204" height="17" rx="7" fill="${C.ink}"/>${wheel(30, -60)}${wheel(30, 60)}`);
      cars[i] = { g: cg, inn, back, front, off: -332 - i * 256, hero: inn.querySelector('.hero'), bal: inn.querySelector('.bal') };
    }
    // Locomotiva
    const lg = T.el('g', {}, g);
    const puffs = T.g(lg, ''), pf = [], wf = [];
    for (let i = 0; i < 9; i++) pf.push(T.g(puffs, `<circle r="24"/><circle cx="20" cy="7" r="17"/><circle cx="-18" cy="9" r="15"/>`, { fill: '#fff' }));
    for (let i = 0; i < 27; i++) wf.push(T.g(puffs, `<circle r="15"/><circle cx="12" cy="5" r="10"/>`, { fill: '#fff' }));
    const body = T.g(lg, `
<rect x="-232" y="-62" width="60" height="11" rx="5" fill="${C.ink}"/>
<path d="M88,-196 L82,-262 L128,-262 L122,-196Z" fill="${C.coral}"/><path d="M108,-196 L112,-262 L128,-262 L122,-196Z" fill="${C.coralD}" opacity=".6"/>
<rect x="72" y="-286" width="66" height="28" rx="12" fill="${C.coralD}"/><rect x="76" y="-286" width="58" height="10" rx="5" fill="${C.gold}"/>
<rect x="-29" y="-232" width="13" height="30" rx="4" fill="${C.goldD}"/><rect x="-34" y="-240" width="23" height="12" rx="6" fill="${C.gold}"/>
<rect x="-60" y="-206" width="246" height="142" rx="62" fill="${C.blue}"/>
<path d="M-30,-104 H152 Q178,-92 160,-74 Q150,-64 124,-64 H-30Z" fill="${C.blueD}" opacity=".55"/>
<rect x="-30" y="-196" width="150" height="20" rx="10" fill="${C.blueL}" opacity=".8"/>
<rect x="-6" y="-206" width="15" height="142" fill="${C.gold}"/><rect x="-6" y="-104" width="15" height="40" fill="${C.goldD}"/>
<rect x="58" y="-206" width="12" height="142" fill="${C.gold}"/><rect x="58" y="-104" width="12" height="40" fill="${C.goldD}"/>
<path d="M12,-205 a19,21 0 0 1 38,0Z" fill="${C.gold}"/><path d="M31,-226 a19,21 0 0 1 19,21 h-10Z" fill="${C.goldD}"/>
<rect x="-176" y="-252" width="138" height="192" rx="14" fill="${C.blueD}"/><rect x="-176" y="-252" width="20" height="192" rx="10" fill="#000" opacity=".1"/>
<rect x="-154" y="-226" width="94" height="76" rx="14" fill="${C.cream}"/><rect x="-146" y="-218" width="78" height="60" rx="9" fill="#BDE4F8"/><path d="M-136,-164 L-104,-212 h16 L-120,-164Z" fill="#fff" opacity=".55"/>
<rect x="-154" y="-132" width="94" height="10" rx="5" fill="${C.gold}"/><circle cx="-107" cy="-98" r="15" fill="${C.gold}"/><circle cx="-107" cy="-98" r="8" fill="${C.coral}"/>
<path d="M-194,-250 q0,-30 30,-30 h114 q30,0 30,30 v6 h-174Z" fill="${C.coral}"/><rect x="-176" y="-276" width="130" height="8" rx="4" fill="${C.coralL}"/>
<circle cx="120" cy="-136" r="60" fill="${C.cream}"/><circle cx="120" cy="-136" r="60" fill="none" stroke="${C.gold}" stroke-width="7"/>
<rect x="142" y="-236" width="34" height="30" rx="9" fill="${C.coral}"/><rect x="170" y="-232" width="12" height="22" rx="5" fill="${C.goldL}"/>
<rect x="-188" y="-80" width="386" height="32" rx="11" fill="${C.coral}"/><rect x="-188" y="-62" width="386" height="14" rx="7" fill="${C.coralD}"/>
<g fill="${C.gold}"><circle cx="-160" cy="-64" r="4.5"/><circle cx="-50" cy="-64" r="4.5"/><circle cx="60" cy="-64" r="4.5"/><circle cx="180" cy="-64" r="4.5"/></g>
<path d="M186,-76 L244,-12 L176,-12 L176,-76Z" fill="${C.gold}"/><g stroke="${C.goldD}" stroke-width="5"><path d="M190,-58 L190,-14 M206,-44 L206,-14 M222,-28 L222,-14"/></g>
<rect x="116" y="-58" width="62" height="30" rx="9" fill="${C.blueD}"/><rect x="116" y="-58" width="62" height="9" rx="4" fill="${C.blueL}"/>
${wheel(46, -112)}${wheel(46, -6)}${wheel(27, 96)}`);
    const glow = T.el('circle', { cx: 186, cy: -221, r: 70, fill: 'url(#lampG)' }, lg);
    const rods = T.g(lg, `<line stroke="#C3CBDA" stroke-width="9" stroke-linecap="round"/><line stroke="#9AA4B8" stroke-width="7" stroke-linecap="round"/><circle r="7" fill="${C.goldD}"/><circle r="7" fill="${C.goldD}"/>`);
    const face = T.face(lg, { cx: 120, cy: -140, s: 1.22, dx: 21, my: 16 });
    const wheels = [...g.querySelectorAll('.wh')].map(e => ({ e, r: +e.getAttribute('data-r') }));
    const loco = { g: lg, off: 0 };
    const PIU = [3.72, 4.40, 44.30, 45.24, 47.98, 48.90, 62.72, 63.68, 106.78, 107.68];
    for (let t = 121.32; t < 123.5; t += 0.16) PIU.push(t);
    const DT = T.BEAT / 2;
    return {
      g, cars, loco, face, PIU,
      // Posiciona uma peça (0 = locomotiva, 1..4 = vagões)
      place(i, x, y, rot, s) { T.setT(i ? cars[i - 1].g : lg, `translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${rot.toFixed(2)}) scale(${s})`); },
      // Rodas, bielas, vapor, farol e rosto
      run(t, dist, vrel, puffColor, expr) {
        for (const w of wheels) w.e.setAttribute('transform', `rotate(${(dist / w.r * 57.2958 % 360).toFixed(1)})`);
        const a = dist / 46, px = 26 * cos(a), py = 26 * sin(a), r = rods.children;
        const x1 = -112 + px, x2 = -6 + px, y = -46 + py;
        r[0].setAttribute('x1', x1); r[0].setAttribute('y1', y); r[0].setAttribute('x2', x2); r[0].setAttribute('y2', y);
        r[1].setAttribute('x1', x2); r[1].setAttribute('y1', y); r[1].setAttribute('x2', 130); r[1].setAttribute('y2', -43);
        T.setT(r[2], `translate(${x1},${y})`); T.setT(r[3], `translate(${x2},${y})`);
        const n = floor(t / DT);
        for (let k = 0; k < pf.length; k++) {
          const tb = (n - k) * DT, age = t - tb, u = age / (pf.length * DT), p = pf[k];
          if (tb < 0) { T.show(p, false); continue; } T.show(p, true);
          T.setT(p, `translate(${(105 - vrel * age * 0.55 + 14 * sin(tb * 7)).toFixed(1)},${(-296 - 150 * Math.sqrt(u) - 40 * u).toFixed(1)}) scale(${(0.45 + 1.5 * u).toFixed(2)})`);
          p.setAttribute('fill', (puffColor && puffColor(tb)) || '#fff'); p.style.opacity = (0.95 * (1 - u * u)).toFixed(2);
        }
        let wi = 0, piu = 0;
        for (const tp of PIU) {
          const age = t - tp; if (age < 0 || age > 0.9) continue;
          if (age < 0.5) piu = Math.max(piu, sin(PI * age / 0.5));
          for (let j = 0; j < 3 && wi < wf.length; j++, wi++) {
            const u = age / 0.9, e = 1 - (1 - u) * (1 - u), p = wf[wi]; T.show(p, true);
            T.setT(p, `translate(${(-22 + (j - 1) * 34 * e - vrel * age * 0.3).toFixed(1)},${(-244 - (150 + j * 22) * e).toFixed(1)}) scale(${(0.5 + 1.6 * u).toFixed(2)})`); p.style.opacity = (1 - u).toFixed(2);
          }
        }
        for (; wi < wf.length; wi++) T.show(wf[wi], false);
        glow.style.opacity = (0.75 + 0.25 * sin(t * 5)).toFixed(2);
        const e = expr || {};
        face.set(e.blink != null ? e.blink : ((t + 1.3) % 3.7 < 0.13), piu > 0.1 ? piu : (e.mouth || 0), e.look || 0, piu > 0.1);
        return piu;
      }
    };
  };
})();
