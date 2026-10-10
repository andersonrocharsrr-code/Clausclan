/* Fibrafit — figuras animadas dos exercícios (SVG desenhado na hora, sem vídeo).
   Cada movimento tem duas posições (início e fim). A figura é um "boneco" com juntas: o app interpola os
   ângulos entre as posições e mantém o ponto de apoio (pés, quadril, mãos) parado, como no exercício real.
   Ângulos em graus no sistema do SVG: 0 = direita, 90 = baixo, -90 = cima. A figura olha para a direita. */
(() => {
  'use strict';
  const RAD = Math.PI / 180;
  const LEN = { torso: 50, neck: 7, head: 9, ua: 27, fa: 25, th: 38, sn: 36, ft: 11 };
  const GROUND = 186;
  const add = (p, a, l) => [p[0] + Math.cos(a * RAD) * l, p[1] + Math.sin(a * RAD) * l];
  const f1 = (n) => Math.round(n * 10) / 10;
  const pt = (p) => `${f1(p[0])},${f1(p[1])}`;
  const ease = (x) => 0.5 - Math.cos(Math.PI * x) / 2;

  /* ---------------- Posições ---------------- */
  // Completa os ângulos que faltam (lado de trás igual ao da frente, pé perpendicular à canela).
  function norm(q) {
    const o = { dx: 0, dy: 0, sy: 0, ul: 1, tl: 1, ...q };
    o.hd ??= o.t;
    o.ua2 ??= o.ua; o.fa2 ??= o.fa;
    o.th2 ??= o.th; o.sn2 ??= o.sn;
    o.ft ??= o.sn - 90; o.ft2 ??= o.sn2 - 90;
    return o;
  }
  const lerp = (A, B, k) => { const o = {}; for (const key in A) o[key] = A[key] + ((B[key] ?? A[key]) - A[key]) * k; return o; };

  // Cinemática direta: a partir do quadril, calcula onde fica cada junta.
  function fk(q, anchor) {
    const P = {};
    P.hip = [0, 0];
    P.sh = add(P.hip, q.t, LEN.torso);
    P.head = add(P.sh, q.hd, LEN.neck + LEN.head);
    P.el = add(P.sh, q.ua, LEN.ua); P.ha = add(P.el, q.fa, LEN.fa);
    P.el2 = add(P.sh, q.ua2, LEN.ua); P.ha2 = add(P.el2, q.fa2, LEN.fa);
    P.kn = add(P.hip, q.th, LEN.th); P.an = add(P.kn, q.sn, LEN.sn); P.to = add(P.an, q.ft, LEN.ft);
    P.kn2 = add(P.hip, q.th2, LEN.th); P.an2 = add(P.kn2, q.sn2, LEN.sn); P.to2 = add(P.an2, q.ft2, LEN.ft);
    const a = P[anchor.p];
    const ox = anchor.x - a[0] + q.dx, oy = anchor.y - a[1] + q.dy;
    for (const k in P) P[k] = [P[k][0] + ox, P[k][1] + oy];
    return P;
  }

  // Vista de frente (elevação lateral, crossover, encolhimento…): braços e pernas espelhados.
  function fkFront(q, anchor) {
    const cx = anchor.x, hipY = anchor.y + q.dy;
    const P = {};
    P.hip = [cx, hipY];
    P.neck = [cx, hipY - LEN.torso + q.sy];
    P.head = [cx, hipY - LEN.torso - LEN.neck - LEN.head + q.sy * 0.3];
    P.sh = [cx + 15, hipY - LEN.torso + 4 + q.sy]; P.sh2 = [cx - 15, P.sh[1]];
    P.el = add(P.sh, q.ua, LEN.ua * q.ul); P.ha = add(P.el, q.fa, LEN.fa);
    P.el2 = add(P.sh2, 180 - q.ua, LEN.ua * q.ul); P.ha2 = add(P.el2, 180 - q.fa, LEN.fa);
    P.hp = [cx + 8, hipY]; P.hp2 = [cx - 8, hipY];
    P.kn = add(P.hp, q.th, LEN.th * q.tl); P.an = add(P.kn, q.sn, LEN.sn);
    P.kn2 = add(P.hp2, 180 - q.th, LEN.th * q.tl); P.an2 = add(P.kn2, 180 - q.sn, LEN.sn);
    return P;
  }

  /* ---------------- Desenho ---------------- */
  const seg = (a, b, w, cls) => `<line x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}" stroke-width="${w}" class="${cls}"/>`;
  const W = { torso: 15, ua: 8.5, fa: 7.5, th: 12, sn: 9.5, ft: 6 };

  function drawSide(P, q, s) {
    const hl = new Set(s.hl || []);
    const c = (part, back) => (hl.has(part) ? (back ? 'k-hl2' : 'k-hl') : back ? 'k-b2' : 'k-b');
    let o = '';
    // Lado de trás (mais claro, dá profundidade).
    o += seg(P.hip, P.kn2, W.th, c('th', 1)) + seg(P.kn2, P.an2, W.sn, c('sn', 1)) + seg(P.an2, P.to2, W.ft, 'k-b2');
    o += seg(P.sh, P.el2, W.ua, c('ua', 1)) + seg(P.el2, P.ha2, W.fa, c('fa', 1));
    if (s.impl2) o += impl(s.impl2, P.ha2, P.el2, 1);
    // Tronco e regiões destacadas.
    o += seg(P.hip, P.sh, W.torso, 'k-b');
    const tA = Math.atan2(P.sh[1] - P.hip[1], P.sh[0] - P.hip[0]) / RAD;
    const along = (k) => [P.hip[0] + (P.sh[0] - P.hip[0]) * k, P.hip[1] + (P.sh[1] - P.hip[1]) * k];
    const side = (p, sgn, d) => add(p, tA + 90 * sgn, d);
    if (hl.has('chest')) o += seg(side(along(0.62), 1, 3.5), side(along(0.9), 1, 3.5), 7, 'k-hl');
    if (hl.has('abs')) o += seg(side(along(0.18), 1, 3.5), side(along(0.55), 1, 3.5), 6, 'k-hl');
    if (hl.has('back')) o += seg(side(along(0.35), -1, 3.5), side(along(0.92), -1, 3.5), 7, 'k-hl');
    if (hl.has('low')) o += seg(side(along(0.08), -1, 3.5), side(along(0.4), -1, 3.5), 6, 'k-hl');
    if (hl.has('glute')) o += `<circle cx="${f1(side(P.hip, -1, 4)[0])}" cy="${f1(side(P.hip, -1, 4)[1])}" r="7.5" class="k-hlf"/>`;
    if (hl.has('delt')) o += `<circle cx="${f1(P.sh[0])}" cy="${f1(P.sh[1])}" r="6" class="k-hlf"/>`;
    // Cabeça.
    o += `<circle cx="${f1(P.head[0])}" cy="${f1(P.head[1])}" r="${LEN.head}" class="k-head"/>`;
    // Lado da frente.
    o += seg(P.hip, P.kn, W.th, c('th')) + seg(P.kn, P.an, W.sn, c('sn')) + seg(P.an, P.to, W.ft, 'k-b');
    o += seg(P.sh, P.el, W.ua, c('ua')) + seg(P.el, P.ha, W.fa, c('fa'));
    if (s.impl) o += impl(s.impl, P.ha, P.el, 0);
    return o;
  }

  function drawFront(P, q, s) {
    const hl = new Set(s.hl || []);
    const c = (part) => (hl.has(part) ? 'k-hl' : 'k-b');
    let o = '';
    o += seg(P.hp, P.kn, W.th, c('th')) + seg(P.kn, P.an, W.sn, c('sn'));
    o += seg(P.hp2, P.kn2, W.th, c('th')) + seg(P.kn2, P.an2, W.sn, c('sn'));
    o += seg([P.an[0], P.an[1]], [P.an[0] + 5, P.an[1] + 1], W.ft, 'k-b') + seg(P.an2, [P.an2[0] - 5, P.an2[1] + 1], W.ft, 'k-b');
    // Tronco: trapézio entre ombros e quadril.
    o += `<path d="M${pt(P.sh2)}L${pt(P.sh)}L${pt([P.hp[0] + 2, P.hip[1]])}L${pt([P.hp2[0] - 2, P.hip[1]])}Z" class="k-torso"/>`;
    if (hl.has('chest')) o += `<path d="M${pt([P.sh2[0] + 3, P.sh2[1] + 4])}L${pt([P.sh[0] - 3, P.sh[1] + 4])}L${pt([P.sh[0] - 6, P.sh[1] + 16])}L${pt([P.sh2[0] + 6, P.sh2[1] + 16])}Z" class="k-hlf"/>`;
    if (hl.has('trap')) o += `<path d="M${pt([P.neck[0] - 5, P.neck[1] - 4])}L${pt([P.neck[0] + 5, P.neck[1] - 4])}L${pt([P.sh[0] - 1, P.sh[1] + 1])}L${pt([P.sh2[0] + 1, P.sh2[1] + 1])}Z" class="k-hlf"/>`;
    if (hl.has('glute')) o += `<circle cx="${f1(P.hp[0])}" cy="${f1(P.hip[1] - 2)}" r="6" class="k-hlf"/><circle cx="${f1(P.hp2[0])}" cy="${f1(P.hip[1] - 2)}" r="6" class="k-hlf"/>`;
    o += seg([P.neck[0], P.neck[1] + 2], [P.neck[0], P.head[1] + 4], 7, 'k-b');
    o += `<circle cx="${f1(P.head[0])}" cy="${f1(P.head[1])}" r="${LEN.head}" class="k-head"/>`;
    for (const [s1, e, h] of [[P.sh, P.el, P.ha], [P.sh2, P.el2, P.ha2]]) {
      o += seg(s1, e, W.ua, c('ua')) + seg(e, h, W.fa, c('fa'));
      if (hl.has('delt')) o += `<circle cx="${f1(s1[0])}" cy="${f1(s1[1])}" r="6" class="k-hlf"/>`;
    }
    if (s.impl === 'barbell') o += seg([P.ha2[0] - 14, P.ha2[1]], [P.ha[0] + 14, P.ha[1]], 3, 'k-eq') + `<rect x="${f1(P.ha[0] + 8)}" y="${f1(P.ha[1] - 11)}" width="5" height="22" rx="1.5" class="k-eqf"/><rect x="${f1(P.ha2[0] - 13)}" y="${f1(P.ha2[1] - 11)}" width="5" height="22" rx="1.5" class="k-eqf"/>`;
    else if (s.impl === 'dumbbell') for (const h of [P.ha, P.ha2]) o += `<rect x="${f1(h[0] - 3.5)}" y="${f1(h[1] - 8)}" width="7" height="16" rx="2.5" class="k-eqf"/>`;
    else if (s.impl === 'handle') for (const h of [P.ha, P.ha2]) o += `<circle cx="${f1(h[0])}" cy="${f1(h[1])}" r="4" class="k-eqf"/>`;
    return o;
  }

  // Equipamento preso na mão.
  function impl(kind, h, e, back) {
    const cls = back ? 'k-eqf2' : 'k-eqf';
    if (kind === 'barbell') return back ? '' : `<circle cx="${f1(h[0])}" cy="${f1(h[1])}" r="12.5" class="k-plate"/><circle cx="${f1(h[0])}" cy="${f1(h[1])}" r="3" class="k-eqf"/>`;
    if (kind === 'dumbbell') return `<circle cx="${f1(h[0])}" cy="${f1(h[1])}" r="6.5" class="${cls}"/>`;
    if (kind === 'kb') return `<circle cx="${f1(h[0])}" cy="${f1(h[1] + 7)}" r="8" class="${cls}"/>`;
    if (kind === 'handle' || kind === 'rope') return `<circle cx="${f1(h[0])}" cy="${f1(h[1])}" r="${kind === 'rope' ? 4.5 : 3.5}" class="${cls}"/>`;
    return '';
  }

  /* ---------------- Cenário ---------------- */
  const R = {
    floor: () => `<line x1="8" x2="232" y1="${GROUND}" y2="${GROUND}" class="k-floor"/>`,
    // Banco embaixo do tronco (segue a inclinação do corpo).
    bench(P0, o = {}) {
      const tA = Math.atan2(P0.sh[1] - P0.hip[1], P0.sh[0] - P0.hip[0]) / RAD;
      const sgn = o.below === 'front' ? 1 : -1;
      const a = add(add(P0.hip, tA + 180, o.back ?? 14), tA + 90 * sgn, 11);
      const b = add(add(P0.sh, tA, o.front ?? 12), tA + 90 * sgn, 11);
      const legs = [a, b].map((p, i) => seg([p[0] + (i ? -6 : 6), p[1] + 3], [p[0] + (i ? -6 : 6), GROUND], 4, 'k-prop')).join('');
      return legs + seg(a, b, 8, 'k-pad');
    },
    seat(x, y, w = 34, back) {
      let s = seg([x - w / 2, y], [x + w / 2, y], 8, 'k-pad') + seg([x, y + 4], [x, GROUND], 4, 'k-prop') + seg([x - 12, GROUND], [x + 12, GROUND], 4, 'k-prop');
      if (back) s += seg([x - w / 2 - 2, y - 2], add([x - w / 2 - 2, y - 2], back, 52), 8, 'k-pad');
      return s;
    },
    cable: (p, from) => `<line x1="${f1(from[0])}" y1="${f1(from[1])}" x2="${f1(p[0])}" y2="${f1(p[1])}" class="k-cable"/><circle cx="${f1(from[0])}" cy="${f1(from[1])}" r="4.5" class="k-prop-f"/>`,
    tower: (x) => seg([x, 12], [x, GROUND], 6, 'k-prop'),
    bar: (x1, x2, y) => seg([x1, y], [x2, y], 5, 'k-prop'),
  };

  /* ---------------- Marcas: trajetória, limite, abdômen ---------------- */
  function arrowHead(a, b, cls) {
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const p1 = [b[0] - Math.cos(ang - 0.5) * 6, b[1] - Math.sin(ang - 0.5) * 6];
    const p2 = [b[0] - Math.cos(ang + 0.5) * 6, b[1] - Math.sin(ang + 0.5) * 6];
    return `<path d="M${pt(p1)}L${pt(b)}L${pt(p2)}" class="${cls}"/>`;
  }
  function marks(spec, A, B, PA, PB, Pnow) {
    let o = '';
    for (const m of spec.marks || []) {
      if (m.k === 'path') {
        const pts = [];
        for (let i = 0; i <= 16; i++) {
          const q = lerp(A, B, i / 16);
          const P = spec.front ? fkFront(q, spec.anchor) : fk(q, spec.anchor);
          pts.push([P[m.j || 'ha'][0] + (m.off?.[0] || 0), P[m.j || 'ha'][1] + (m.off?.[1] || 0)]);
        }
        o += `<polyline points="${pts.map(pt).join(' ')}" class="k-path"/>`;
        o += arrowHead(pts[pts.length - 3], pts[pts.length - 1], 'k-path-h') + arrowHead(pts[2], pts[0], 'k-path-h');
      } else if (m.k === 'limit') {
        const l = m.f(PA, PB);
        o += `<line x1="${f1(l[0][0])}" y1="${f1(l[0][1])}" x2="${f1(l[1][0])}" y2="${f1(l[1][1])}" class="k-limit"/>`;
      } else if (m.k === 'pin') {
        const p = Pnow[m.j];
        o += `<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="7" class="k-pin"/>`;
      } else if (m.k === 'core') {
        const a = spec.front ? Pnow.hip : Pnow.hip, b = spec.front ? Pnow.neck : Pnow.sh;
        const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
        const ang = Math.atan2(b[1] - a[1], b[0] - a[0]) / RAD;
        o += `<ellipse cx="${f1(mx)}" cy="${f1(my)}" rx="${spec.front ? 16 : 30}" ry="${spec.front ? 30 : 13}" transform="rotate(${spec.front ? 0 : f1(ang)} ${f1(mx)} ${f1(my)})" class="k-core"/>`;
      }
    }
    return o;
  }

  /* ---------------- Movimentos ---------------- */
  // Cada função devolve: A (início), B (fim), anchor (ponto fixo), props (cenário), impl, hl (músculos), marks, tempo.
  const stand = { t: -90, ua: 90, fa: 90, th: 90, sn: 90 };
  const FLOOR = { p: 'an', x: 118, y: GROUND - 4 };
  const limitH = (j, which, label, x1 = 30, x2 = 210) => ({ k: 'limit', label, f: (PA, PB) => { const p = (which === 'A' ? PA : PB)[j]; return [[x1, p[1]], [x2, p[1]]]; } });
  const limitV = (j, which, label, y1 = 20, y2 = GROUND) => ({ k: 'limit', label, f: (PA, PB) => { const p = (which === 'A' ? PA : PB)[j]; return [[p[0], y1], [p[0], y2]]; } });

  const M = {
    squat: (o = {}) => ({
      A: { t: -88, ua: 150, fa: -40, th: 90, sn: 90 },
      B: { t: -52, ua: 186, fa: -4, th: 10, sn: 116 },
      anchor: FLOOR, impl: 'barbell', hl: ['th', 'glute'],
      props: (P0) => R.floor() + (o.smith ? R.tower(P0.ha[0] + 26) + R.tower(P0.ha[0] - 30) : ''),
      marks: [{ k: 'path', j: 'ha' }, limitH('kn', 'B', 'quadril na linha do joelho'), { k: 'core' }],
      tempo: [0.5, 1.8, 0.3, 1.1],
    }),
    goblet: () => ({
      A: { t: -88, ua: 95, fa: -40, th: 90, sn: 90 },
      B: { t: -62, ua: 122, fa: -14, th: 8, sn: 115 },
      anchor: FLOOR, impl: 'kb', impl2: null, hl: ['th', 'glute'],
      props: () => R.floor(),
      marks: [{ k: 'path', j: 'hip', off: [-14, 0] }, limitH('kn', 'B', 'quadril na linha do joelho'), { k: 'core' }],
      tempo: [0.5, 1.8, 0.3, 1.1],
    }),
    legpress: () => ({
      A: { t: -140, ua: 80, fa: 30, th: -38, sn: -44, ft: -130 },
      B: { t: -140, ua: 80, fa: 30, th: -100, sn: -8, ft: -98 },
      anchor: { p: 'hip', x: 92, y: 150 }, hl: ['th', 'glute'],
      props: (P0, P) => R.seat(80, 160, 30) + seg([60, 168], add([60, 168], -140, 60), 9, 'k-pad')
        + seg(add(P.an, -130, 16), add(P.an, 50, 16), 6, 'k-pad') + seg(add(P0.an, 140, 50), add(P0.an, -40, 30), 4, 'k-prop') + R.floor(),
      marks: [{ k: 'path', j: 'an', off: [8, 8] }],
      tempo: [0.4, 1.8, 0.3, 1.2],
    }),
    extension: () => ({
      A: { t: -98, ua: 95, fa: 70, th: -4, sn: 92 },
      B: { t: -98, ua: 95, fa: 70, th: -4, sn: 0 },
      anchor: { p: 'hip', x: 96, y: 128 }, hl: ['th'],
      props: (P0, P) => R.seat(98, 138, 44, -100) + `<circle cx="${f1(P.an[0] + 2)}" cy="${f1(P.an[1] - 6)}" r="6" class="k-padf"/>` + R.floor(),
      marks: [{ k: 'path', j: 'an', off: [6, 0] }],
      tempo: [0.4, 1.0, 0.6, 1.8],
    }),
    legcurl: () => ({
      A: { t: 180, hd: 180, ua: 100, fa: 20, th: 2, sn: 0, ft: 80 },
      B: { t: 180, hd: 180, ua: 100, fa: 20, th: 2, sn: -105, ft: -20 },
      anchor: { p: 'hip', x: 120, y: 112 }, hl: ['th', 'glute'],
      props: (P0, P) => R.bench(P0, { below: 'front', back: -60, front: 18 }) + `<circle cx="${f1(P.an[0])}" cy="${f1(P.an[1] - 8)}" r="6" class="k-padf"/>` + R.floor(),
      marks: [{ k: 'path', j: 'an', off: [0, -10] }, { k: 'core' }],
      tempo: [0.4, 1.0, 0.5, 1.8],
    }),
    seatedcurl: () => ({
      A: { t: -100, ua: 95, fa: 70, th: -2, sn: 10 },
      B: { t: -100, ua: 95, fa: 70, th: -2, sn: 105 },
      anchor: { p: 'hip', x: 92, y: 128 }, hl: ['th'],
      props: (P0, P) => R.seat(94, 138, 44, -102) + `<circle cx="${f1(P.an[0] + 2)}" cy="${f1(P.an[1] + 7)}" r="6" class="k-padf"/>` + `<circle cx="${f1(P0.kn[0] - 6)}" cy="${f1(P0.kn[1] - 10)}" r="5.5" class="k-padf"/>` + R.floor(),
      marks: [{ k: 'path', j: 'an', off: [-6, 6] }],
      tempo: [0.4, 1.0, 0.5, 1.8],
    }),
    hinge: (o = {}) => ({
      A: { t: -90, ua: 90, fa: 90, th: 90, sn: 90 },
      B: { t: o.deep ? -8 : -18, ua: 88, fa: 88, th: 78, sn: o.deep ? 96 : 93 },
      anchor: FLOOR, impl: o.impl ?? 'barbell', impl2: o.impl === 'dumbbell' ? 'dumbbell' : null, hl: ['th', 'glute', 'low'],
      props: () => R.floor(),
      marks: [{ k: 'path', j: 'ha', off: [6, 0] }, { k: 'core' }],
      tempo: [0.4, 2.0, 0.3, 1.2],
    }),
    deadlift: () => ({
      A: { t: -38, ua: 88, fa: 90, th: 14, sn: 104 },
      B: { t: -90, ua: 90, fa: 90, th: 90, sn: 90 },
      anchor: FLOOR, impl: 'barbell', hl: ['th', 'glute', 'back', 'low'],
      props: () => R.floor(),
      marks: [{ k: 'path', j: 'ha', off: [6, 0] }, { k: 'core' }],
      tempo: [0.6, 1.2, 0.5, 1.6],
    }),
    row: (o = {}) => ({
      A: { t: o.t ?? -22, ua: 92, fa: 90, th: 76, sn: 96, ...(o.one ? { ua2: 60, fa2: 92 } : {}) },
      B: { t: o.t ?? -22, ua: 196, fa: 104, th: 76, sn: 96, ...(o.one ? { ua2: 60, fa2: 92 } : {}) },
      anchor: FLOOR, impl: o.impl ?? 'barbell', impl2: o.one ? null : o.impl === 'dumbbell' ? 'dumbbell' : null, hl: ['back', 'ua', 'delt'],
      props: (P0) => R.floor() + (o.one ? R.bench({ hip: [P0.ha2[0] - 40, P0.ha2[1] + 9], sh: [P0.ha2[0] + 10, P0.ha2[1] + 9] }, { back: 0, front: 0 }) : ''),
      marks: [{ k: 'path', j: 'ha', off: [0, 8] }, { k: 'core' }],
      tempo: [0.4, 1.0, 0.6, 1.6],
    }),
    seatedrow: (o = {}) => ({
      A: { t: -82, ua: 4, fa: 2, th: -6, sn: 8 },
      B: { t: -92, ua: 128, fa: 6, th: -6, sn: 8 },
      anchor: { p: 'hip', x: 82, y: 150 }, impl: 'handle', hl: ['back', 'ua'],
      props: (P0, P) => R.seat(84, 160, 34) + seg([P0.an[0] + 8, P0.an[1] - 14], [P0.an[0] + 8, P0.an[1] + 10], 6, 'k-pad') + R.cable(P.ha, [214, P0.ha[1]]) + R.tower(220) + R.floor(),
      marks: [{ k: 'path', j: 'ha', off: [0, -9] }, { k: 'core' }],
      tempo: [0.4, 1.0, 0.6, 1.6],
    }),
    pulldown: (o = {}) => ({
      A: { t: -100, ua: -78, fa: -84, th: -4, sn: 92 },
      B: { t: -104, ua: 112, fa: -68, th: -4, sn: 92 },
      anchor: { p: 'hip', x: 102, y: 140 }, impl: 'handle', hl: ['back', 'ua'],
      props: (P0, P) => R.seat(104, 150, 34) + `<circle cx="${f1(P0.kn[0] - 4)}" cy="${f1(P0.kn[1] - 11)}" r="6" class="k-padf"/>` + R.cable(P.ha, [P0.ha[0], 10]) + R.floor(),
      marks: [{ k: 'path', j: 'ha', off: [9, 0] }, limitH('sh', 'B', 'até a parte alta do peito', 70, 170)],
      tempo: [0.4, 1.0, 0.6, 1.6],
    }),
    straightpull: () => ({
      A: { t: -72, ua: -50, fa: -50, th: 88, sn: 92 },
      B: { t: -72, ua: 72, fa: 72, th: 88, sn: 92 },
      anchor: FLOOR, impl: 'handle', hl: ['back'],
      props: (P0, P) => R.cable(P.ha, [196, 16]) + R.tower(204) + R.floor(),
      marks: [{ k: 'path', j: 'ha', off: [7, 0] }, { k: 'core' }],
      tempo: [0.4, 1.1, 0.5, 1.6],
    }),
    pullup: () => ({
      A: { t: -90, ua: -88, fa: -90, th: 100, sn: 168 },
      B: { t: -86, ua: 112, fa: -72, th: 100, sn: 168 },
      anchor: { p: 'ha', x: 126, y: 26 }, hl: ['back', 'ua'],
      props: () => R.bar(70, 190, 26) + R.tower(72) + R.tower(188) + R.floor(),
      marks: [{ k: 'path', j: 'head', off: [16, 0] }, limitH('ha', 'A', 'queixo acima da barra', 80, 172), { k: 'core' }],
      tempo: [0.4, 1.1, 0.5, 1.8],
    }),
    bench: (o = {}) => {
      const t = 180 + (o.tilt || 0);
      return {
        A: { t, hd: t, ua: -90, fa: -90, th: 14, sn: 96 },
        B: { t, hd: t, ua: o.fly ? 76 : 82, fa: o.fly ? -50 : -98, th: 14, sn: 96 },
        anchor: { p: 'hip', x: 150, y: 120 }, impl: o.impl ?? 'barbell', impl2: null, hl: o.close ? ['ua', 'chest'] : ['chest', 'delt', 'ua'],
        props: (P0) => R.bench(P0, { back: 10, front: 26 }) + R.floor(),
        marks: [{ k: 'path', j: 'ha', off: [0, 0] }, { k: 'limit', f: (PA, PB) => [[PB.sh[0] - 24, PB.ha[1] + 13], [PB.sh[0] + 40, PB.ha[1] + 13]] }, { k: 'core' }],
        tempo: [0.4, 1.8, 0.3, 1.1],
      };
    },
    crossover: () => ({
      front: true,
      A: { ua: -32, fa: -20, th: 92, sn: 90 },
      B: { ua: 96, fa: 150, th: 92, sn: 90 },
      anchor: { x: 120, y: 112 }, impl: 'handle', hl: ['chest'],
      props: (P0, P) => R.tower(24) + R.tower(216) + R.cable(P.ha, [212, 26]) + R.cable(P.ha2, [28, 26]) + R.floor(),
      marks: [{ k: 'path', j: 'ha' }, { k: 'core' }],
      tempo: [0.4, 1.0, 0.6, 1.6],
    }),
    peckdeck: () => ({
      front: true,
      A: { ua: 0, fa: -88, th: 90, sn: 90, tl: 0.3 },
      B: { ua: 0, fa: -88, th: 90, sn: 90, tl: 0.3, ul: -0.2 },
      anchor: { x: 120, y: 128 }, impl: 'handle', hl: ['chest'],
      props: () => R.floor() + seg([94, 132], [146, 132], 8, 'k-pad') + seg([120, 136], [120, GROUND], 4, 'k-prop'),
      marks: [{ k: 'core' }],
      tempo: [0.4, 1.0, 0.6, 1.6],
    }),
    press: (o = {}) => ({
      A: { t: -90, ua: 74, fa: -96, th: o.seated ? -2 : 90, sn: o.seated ? 90 : 90 },
      B: { t: -90, ua: -86, fa: -90, th: o.seated ? -2 : 90, sn: o.seated ? 90 : 90 },
      anchor: o.seated ? { p: 'hip', x: 100, y: 140 } : FLOOR, impl: o.impl ?? 'dumbbell', hl: ['delt', 'ua'],
      props: () => (o.seated ? R.seat(102, 150, 34, -92) : '') + R.floor(),
      marks: [{ k: 'path', j: 'ha', off: [8, 0] }, { k: 'core' }],
      tempo: [0.4, 1.1, 0.4, 1.7],
    }),
    lateral: () => ({
      front: true,
      A: { ua: 80, fa: 84, th: 90, sn: 90 },
      B: { ua: 2, fa: 6, th: 90, sn: 90 },
      anchor: { x: 120, y: 112 }, impl: 'dumbbell', hl: ['delt'],
      props: () => R.floor(),
      marks: [{ k: 'path', j: 'ha' }, { k: 'limit', f: (PA, PB) => [[150, PB.sh[1]], [214, PB.sh[1]]] }, { k: 'core' }],
      tempo: [0.4, 1.0, 0.4, 1.7],
    }),
    frontraise: () => ({
      A: { ...stand, ua: 86, fa: 86 },
      B: { ...stand, ua: -4, fa: -2 },
      anchor: FLOOR, impl: 'dumbbell', impl2: 'dumbbell', hl: ['delt'],
      props: () => R.floor(),
      marks: [{ k: 'path', j: 'ha' }, limitH('sh', 'A', 'altura dos ombros', 120, 210), { k: 'core' }],
      tempo: [0.4, 1.0, 0.4, 1.7],
    }),
    facepull: () => ({
      A: { ...stand, t: -92, ua: -14, fa: -12 },
      B: { ...stand, t: -92, ua: 186, fa: -40 },
      anchor: FLOOR, impl: 'rope', hl: ['delt', 'back'],
      props: (P0, P) => R.cable(P.ha, [214, P0.head[1]]) + R.tower(220) + R.floor(),
      marks: [{ k: 'path', j: 'ha', off: [0, -8] }, { k: 'core' }],
      tempo: [0.4, 1.0, 0.6, 1.6],
    }),
    shrug: () => ({
      front: true,
      A: { ua: 92, fa: 90, th: 90, sn: 90, sy: 0 },
      B: { ua: 92, fa: 90, th: 90, sn: 90, sy: -8 },
      anchor: { x: 120, y: 112 }, impl: 'dumbbell', hl: ['trap'],
      props: () => R.floor(),
      marks: [{ k: 'path', j: 'sh', off: [10, 0] }],
      tempo: [0.4, 0.7, 0.8, 1.2],
    }),
    curl: (o = {}) => ({
      A: { ...stand, ua: 92, fa: 88 },
      B: { ...stand, ua: 84, fa: -64 },
      anchor: FLOOR, impl: o.impl ?? 'barbell', impl2: o.impl === 'dumbbell' ? 'dumbbell' : null, hl: ['ua'],
      props: (P0, P) => R.floor() + (o.cable ? R.cable(P.ha, [P0.ha[0] + 50, GROUND - 6]) : ''),
      marks: [{ k: 'path', j: 'ha', off: [8, 0] }, { k: 'pin', j: 'el' }, { k: 'core' }],
      tempo: [0.4, 1.0, 0.4, 1.8],
    }),
    scott: () => ({
      A: { t: -84, ua: 52, fa: 46, th: -2, sn: 90 },
      B: { t: -84, ua: 52, fa: -66, th: -2, sn: 90 },
      anchor: { p: 'hip', x: 96, y: 140 }, impl: 'barbell', hl: ['ua'],
      props: (P0) => R.seat(96, 150, 30) + seg(add(P0.sh, 52, 2), add(P0.sh, 52, 30), 9, 'k-pad') + seg(add(P0.sh, 52, 30), [P0.el[0] + 4, 150], 4, 'k-prop') + R.floor(),
      marks: [{ k: 'path', j: 'ha', off: [6, 0] }, { k: 'pin', j: 'el' }],
      tempo: [0.4, 1.0, 0.4, 1.8],
    }),
    pushdown: () => ({
      A: { ...stand, t: -82, ua: 96, fa: -28 },
      B: { ...stand, t: -82, ua: 92, fa: 88 },
      anchor: FLOOR, impl: 'rope', hl: ['ua'],
      props: (P0, P) => R.cable(P.ha, [P0.ha[0] + 18, 14]) + R.floor(),
      marks: [{ k: 'path', j: 'ha', off: [8, 0] }, { k: 'pin', j: 'el' }, { k: 'core' }],
      tempo: [0.4, 0.9, 0.5, 1.6],
    }),
    skull: () => ({
      A: { t: 180, hd: 180, ua: -100, fa: -98, th: 14, sn: 96 },
      B: { t: 180, hd: 180, ua: -104, fa: 168, th: 14, sn: 96 },
      anchor: { p: 'hip', x: 150, y: 120 }, impl: 'barbell', hl: ['ua'],
      props: (P0) => R.bench(P0, { back: 10, front: 26 }) + R.floor(),
      marks: [{ k: 'path', j: 'ha' }, { k: 'pin', j: 'el' }],
      tempo: [0.4, 1.6, 0.3, 1.0],
    }),
    overhead: () => ({
      A: { t: -90, ua: -84, fa: -88, th: -2, sn: 90 },
      B: { t: -90, ua: -96, fa: 96, th: -2, sn: 90 },
      anchor: { p: 'hip', x: 108, y: 140 }, impl: 'dumbbell', hl: ['ua'],
      props: () => R.seat(110, 150, 34, -92) + R.floor(),
      marks: [{ k: 'path', j: 'ha', off: [8, 0] }, { k: 'pin', j: 'el' }, { k: 'core' }],
      tempo: [0.4, 1.6, 0.3, 1.0],
    }),
    dips: (o = {}) => o.bench ? ({
      A: { t: -84, ua: 94, fa: 92, th: -6, sn: 10 },
      B: { t: -80, ua: 182, fa: 66, th: -14, sn: 30 },
      anchor: { p: 'ha', x: 70, y: 128 }, hl: ['ua'],
      props: () => R.seat(54, 132, 40) + R.floor(),
      marks: [{ k: 'path', j: 'sh', off: [-12, 0] }, { k: 'core' }],
      tempo: [0.4, 1.6, 0.3, 1.0],
    }) : ({
      A: { t: -84, ua: 92, fa: 90, th: 100, sn: 150 },
      B: { t: -66, ua: 178, fa: 66, th: 110, sn: 160 },
      anchor: { p: 'ha', x: 128, y: 106 }, hl: ['chest', 'ua'],
      props: () => R.bar(108, 150, 108) + seg([112, 108], [112, GROUND], 4, 'k-prop') + seg([146, 108], [146, GROUND], 4, 'k-prop') + R.floor(),
      marks: [{ k: 'path', j: 'sh', off: [14, 0] }, { k: 'limit', f: (PA, PB) => [[PB.el[0] - 30, PB.el[1]], [PB.el[0] + 50, PB.el[1]]] }],
      tempo: [0.4, 1.6, 0.3, 1.0],
    }),
    pushup: () => ({
      A: { t: -10, hd: -10, ua: 90, fa: 90, th: 172, sn: 172, ft: 100 },
      B: { t: 4, hd: 4, ua: 160, fa: 30, th: 178, sn: 178, ft: 100 },
      anchor: { p: 'ha', x: 168, y: GROUND - 2 }, hl: ['chest', 'ua'],
      props: () => R.floor(),
      marks: [{ k: 'path', j: 'sh', off: [0, -12] }, { k: 'core' }],
      tempo: [0.4, 1.4, 0.3, 1.0],
    }),
    lunge: (o = {}) => ({
      A: o.bulg ? { t: -90, ua: 90, fa: 90, th: 84, sn: 96, th2: 112, sn2: -142 } : { t: -90, ua: 90, fa: 90, th: 78, sn: 100, th2: 106, sn2: 82, ft2: -10 },
      B: o.bulg ? { t: -86, ua: 90, fa: 90, th: 8, sn: 96, th2: 98, sn2: -168 } : { t: -86, ua: 90, fa: 90, th: 6, sn: 96, th2: 104, sn2: 172, ft2: 100 },
      anchor: { p: 'an', x: 150, y: GROUND - 4 }, impl: 'dumbbell', impl2: 'dumbbell', hl: ['th', 'glute'],
      props: (PA, P, PB) => (o.bulg ? R.seat(PB.to2[0] - 4, PB.to2[1] + 7, 38) : '') + R.floor(),
      marks: [{ k: 'path', j: 'hip', off: [-12, 0] }, { k: 'limit', f: (PA, PB) => [[PB.an[0] + 8, 70], [PB.an[0] + 8, GROUND]] }, { k: 'core' }],
      tempo: [0.4, 1.6, 0.3, 1.1],
    }),
    hipthrust: (o = {}) => ({
      A: o.floor ? { t: 180, hd: 180, ua: 20, fa: 0, th: -40, sn: 60 } : { t: 215, hd: 205, ua: 60, fa: 0, th: -20, sn: 88 },
      B: o.floor ? { t: 150, hd: 170, ua: 20, fa: 0, th: 0, sn: 64 } : { t: 180, hd: 180, ua: 60, fa: 0, th: 25, sn: 100 },
      anchor: o.floor ? { p: 'sh', x: 70, y: GROUND - 8 } : { p: 'sh', x: 70, y: 128 },
      impl: o.floor ? null : 'barbell', hl: ['glute', 'th'],
      props: () => (o.floor ? '' : R.seat(52, 138, 40)) + R.floor(),
      marks: [{ k: 'path', j: 'hip', off: [0, 10] }, limitH('sh', 'B', 'quadril alinhado com o tronco', 60, 190), { k: 'core' }],
      tempo: [0.4, 1.0, 0.8, 1.6],
    }),
    abduction: (o = {}) => ({
      front: true,
      A: { ua: 112, fa: 96, th: o.in ? 20 : 80, sn: 92, tl: o.in ? 0.7 : 0.3 },
      B: { ua: 112, fa: 96, th: o.in ? 80 : 20, sn: 92, tl: o.in ? 0.3 : 0.7 },
      anchor: { x: 120, y: 132 }, hl: o.in ? ['th'] : ['glute'],
      props: () => seg([96, 136], [144, 136], 8, 'k-pad') + seg([120, 140], [120, GROUND], 4, 'k-prop') + R.floor(),
      marks: [{ k: 'path', j: 'kn' }, { k: 'core' }],
      tempo: [0.4, 1.0, 0.6, 1.6],
    }),
    kickback: () => ({
      A: { t: -60, ua: 10, fa: 10, th: 96, sn: 92, th2: 90, sn2: 90 },
      B: { t: -60, ua: 10, fa: 10, th: 156, sn: 150, th2: 90, sn2: 90 },
      anchor: { p: 'an2', x: 112, y: GROUND - 4 }, hl: ['glute'],
      props: (P0, P) => R.cable(P.an, [30, GROUND - 6]) + seg([P0.ha[0] + 6, P0.ha[1] - 10], [P0.ha[0] + 6, GROUND], 6, 'k-prop') + R.floor(),
      marks: [{ k: 'path', j: 'an', off: [0, 8] }, { k: 'core' }],
      tempo: [0.4, 1.0, 0.6, 1.6],
    }),
    calf: (o = {}) => ({
      A: o.seated ? { t: -90, ua: 70, fa: 0, th: -2, sn: 90, ft: 0 } : { ...stand, ft: 0 },
      B: o.seated ? { t: -90, ua: 70, fa: 0, th: -2, sn: 90, ft: 40 } : { ...stand, ft: 42 },
      anchor: { p: 'to', x: 132, y: GROUND - 10 }, hl: ['sn'],
      props: (P0, P) => seg([108, GROUND - 6], [150, GROUND - 6], 8, 'k-pad') + R.floor() + (o.seated ? R.seat(P0.hip[0] - 6, P0.hip[1] + 10, 34) + `<circle cx="${f1(P.kn[0] - 3)}" cy="${f1(P.kn[1] - 9)}" r="6" class="k-padf"/>` : ''),
      marks: [{ k: 'path', j: 'an', off: [-12, 0] }],
      tempo: [0.4, 0.8, 0.8, 1.4],
    }),
    crunch: () => ({
      A: { t: 178, hd: 178, ua: -40, fa: 150, th: -46, sn: 50 },
      B: { t: -148, hd: -140, ua: 10, fa: -150, th: -46, sn: 50 },
      anchor: { p: 'hip', x: 130, y: GROUND - 8 }, hl: ['abs'],
      props: () => R.floor(),
      marks: [{ k: 'path', j: 'sh', off: [0, -12] }, limitH('sh', 'B', 'só tire as escápulas do chão', 40, 140)],
      tempo: [0.4, 0.9, 0.6, 1.4],
    }),
    legraise: () => ({
      A: { t: 180, hd: 180, ua: 172, fa: 176, th: -4, sn: 0 },
      B: { t: 180, hd: 180, ua: 172, fa: 176, th: -88, sn: -88 },
      anchor: { p: 'hip', x: 120, y: GROUND - 8 }, hl: ['abs', 'th'],
      props: () => R.floor(),
      marks: [{ k: 'path', j: 'an', off: [8, 0] }, { k: 'core' }],
      tempo: [0.4, 1.2, 0.4, 1.8],
    }),
    plank: () => ({
      A: { t: -8, hd: -8, ua: 92, fa: 0, th: 172, sn: 172, ft: 100 },
      B: { t: -8, hd: -8, ua: 92, fa: 0, th: 172, sn: 172, ft: 100, dy: -1.2 },
      anchor: { p: 'el', x: 160, y: GROUND - 3 }, hl: ['abs', 'glute'],
      props: () => R.floor(),
      marks: [{ k: 'core' }, { k: 'limit', f: (PA) => [[PA.an[0] - 10, PA.an[1] - 6], [PA.sh[0] + 14, PA.sh[1] - 6]] }],
      tempo: [1.4, 1.2, 1.4, 1.2],
    }),
    walk: () => ({
      A: { t: -86, ua: 112, fa: 70, ua2: 66, fa2: 20, th: 66, sn: 96, th2: 112, sn2: 120 },
      B: { t: -86, ua: 66, fa: 20, ua2: 112, fa2: 70, th: 112, sn: 120, th2: 66, sn2: 96 },
      anchor: { p: 'hip', x: 118, y: 112 }, hl: ['th', 'sn'],
      props: () => seg([40, 188], [200, 178], 8, 'k-pad') + seg([186, 178], [204, 70], 5, 'k-prop') + R.floor(),
      marks: [],
      tempo: [0, 0.45, 0, 0.45],
    }),
    bike: () => ({
      A: { t: -66, ua: 10, fa: 30, th: -12, sn: 74, th2: 26, sn2: 112 },
      B: { t: -66, ua: 10, fa: 30, th: 26, sn: 112, th2: -12, sn2: 74 },
      anchor: { p: 'hip', x: 96, y: 112 }, hl: ['th', 'sn'],
      props: () => R.seat(96, 120, 22) + `<circle cx="140" cy="160" r="16" class="k-wheel"/>` + seg([140, 160], [176, 92], 5, 'k-prop') + R.floor(),
      marks: [],
      tempo: [0, 0.5, 0, 0.5],
    }),
    rope: () => ({
      A: { ...stand, ua: 100, fa: 30, ft: 30 },
      B: { ...stand, ua: 100, fa: 30, ft: 30, dy: -12 },
      anchor: { p: 'to', x: 124, y: GROUND - 1 }, hl: ['sn'],
      props: (P0, P) => `<path d="M${pt(P.ha)} Q ${f1(P.ha[0] + 30)},${f1(GROUND + 4)} ${f1(P.ha[0] + 8)},${f1(P.ha[1] - 4)}" class="k-cable"/>` + R.floor(),
      marks: [],
      tempo: [0.05, 0.25, 0.05, 0.25],
    }),
    rower: () => ({
      A: { t: -70, ua: 10, fa: 4, th: -48, sn: 50 },
      B: { t: -106, ua: 150, fa: 2, th: -4, sn: 6 },
      anchor: { p: 'to', x: 182, y: 158 }, impl: 'handle', hl: ['back', 'th'],
      props: (P0, P) => seg([30, 172], [214, 172], 6, 'k-prop') + seg([P.hip[0] - 10, P.hip[1] + 8], [P.hip[0] + 10, P.hip[1] + 8], 6, 'k-pad') + R.cable(P.ha, [210, 150]) + R.floor(),
      marks: [],
      tempo: [0.2, 0.7, 0.2, 1.1],
    }),
  };

  /* ---------------- Montagem ---------------- */
  const cache = {};
  function spec(anim) {
    const key = JSON.stringify(anim);
    if (cache[key]) return cache[key];
    const s = M[anim.m](anim);
    s.A = norm(s.A); s.B = norm(s.B);
    // Gira pelo caminho mais curto (ex.: de 178° para -148° passa por 180°, não por 0°).
    for (const k in s.B) {
      if (['dx', 'dy', 'sy', 'ul', 'tl'].includes(k)) continue;
      while (s.B[k] - s.A[k] > 180) s.B[k] -= 360;
      while (s.B[k] - s.A[k] < -180) s.B[k] += 360;
    }
    s.PA = s.front ? fkFront(s.A, s.anchor) : fk(s.A, s.anchor);
    s.PB = s.front ? fkFront(s.B, s.anchor) : fk(s.B, s.anchor);
    cache[key] = s;
    return s;
  }
  function frame(anim, k, opt = {}) {
    const s = spec(anim);
    const q = lerp(s.A, s.B, k);
    const P = s.front ? fkFront(q, s.anchor) : fk(q, s.anchor);
    const body = s.front ? drawFront(P, q, s) : drawSide(P, q, s);
    const props = s.props ? s.props(s.PA, P, s.PB) : '';
    const mk = opt.marks === false ? '' : marks(s, s.A, s.B, s.PA, s.PB, P);
    return `<g class="k-props">${props}</g>${mk}<g class="k-fig">${body}</g>`;
  }
  const svg = (anim, k = 0.5, opt = {}) => `<svg viewBox="0 0 240 200" class="kfig${opt.cls ? ' ' + opt.cls : ''}" aria-hidden="true">${frame(anim, k, opt)}</svg>`;

  /* Player: repete o movimento (início → fim → início) com pausas nas pontas. */
  const players = new Set();
  function mount(el, anim, opt = {}) {
    const s = spec(anim);
    el.innerHTML = `<svg viewBox="0 0 240 200" class="kfig" role="img" aria-label="${opt.label || 'Animação do exercício'}"></svg>`;
    const root = el.firstChild;
    const p = { el, anim, slow: false, paused: false, t0: performance.now(), pt: 0, k: 0, phase: 0 };
    const tempo = s.tempo || [0.4, 1.2, 0.4, 1.4];
    p.render = (now) => {
      const sp = p.slow ? 2.8 : 1;
      const T = tempo.map((x) => x * sp);
      const total = T.reduce((a, b) => a + b, 0);
      const t = ((now - p.t0) / 1000) % total;
      let k, ph;
      if (t < T[0]) { k = 0; ph = 0; } else if (t < T[0] + T[1]) { k = ease((t - T[0]) / T[1]); ph = 1; } else if (t < T[0] + T[1] + T[2]) { k = 1; ph = 2; } else { k = 1 - ease((t - T[0] - T[1] - T[2]) / T[3]); ph = 3; }
      p.k = k;
      if (ph !== p.phase && opt.onPhase) opt.onPhase(ph);
      p.phase = ph;
      root.innerHTML = frame(anim, k, opt);
    };
    p.setSlow = (v) => { const now = performance.now(); const sp0 = p.slow ? 2.8 : 1, sp1 = v ? 2.8 : 1; p.t0 = now - ((now - p.t0) * sp1) / sp0; p.slow = v; };
    p.pause = () => { if (!p.paused) { p.paused = true; p.pt = performance.now(); } };
    p.play = () => { if (p.paused) { p.t0 += performance.now() - p.pt; p.paused = false; } };
    p.show = (k) => { p.pause(); root.innerHTML = frame(anim, k, opt); };
    p.destroy = () => players.delete(p);
    p.render(performance.now());
    players.add(p);
    if (!loopOn) { loopOn = true; requestAnimationFrame(loop); }
    return p;
  }
  let loopOn = false;
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function loop(now) {
    for (const p of players) {
      if (!p.el.isConnected) { players.delete(p); continue; }
      if (!p.paused && !document.hidden && !(reduce && !p.forced)) p.render(now);
    }
    if (players.size) requestAnimationFrame(loop); else loopOn = false;
  }

  window.Kfig = { svg, mount, has: (anim) => !!(anim && M[anim.m]), kinds: (anim) => new Set((spec(anim).marks || []).map((m) => m.k)) };
})();
