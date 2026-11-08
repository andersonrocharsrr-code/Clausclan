/* Sereno — figura das posturas, desenhada pelo app (SVG, sem imagens).
   O boneco tem juntas: o app calcula onde fica cada uma a partir dos ângulos da postura, encosta o ponto
   mais baixo no tapete e centraliza. Nas transições, interpola os ângulos, então os membros nunca esticam. */
(() => {
  'use strict';
  const K = 0.88; // escala geral do boneco
  const L = { torso: 50 * K, neck: 14 * K, up: 25 * K, fore: 23 * K, thigh: 38 * K, shin: 36 * K, foot: 10 * K };
  const HEAD = 8.5, FLOOR = 178, W = 200, LIMB = 4;
  const RAD = Math.PI / 180;
  const at = (p, a, l) => [p[0] + Math.cos(a * RAD) * l, p[1] + Math.sin(a * RAD) * l];
  const r1 = (n) => Math.round(n * 10) / 10;
  const pts = (...ps) => ps.map((p) => `${r1(p[0])},${r1(p[1])}`).join(' ');
  const ease = (x) => 0.5 - Math.cos(Math.PI * x) / 2;
  const reduce = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Dobra a junta para a ponta do membro alcançar o alvo (duas partes de tamanho fixo).
  function ik(base, tx, ty, l1, l2, k) {
    const dx = tx - base[0], dy = ty - base[1];
    const th = Math.atan2(dy, dx) / RAD;
    const d = Math.min(Math.max(Math.hypot(dx, dy), Math.abs(l1 - l2) + 0.5), l1 + l2 - 0.01);
    const a = Math.acos((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)) / RAD;
    const u = th - (k || 1) * a;
    const e = at(base, u, l1);
    return [u, Math.atan2(ty - e[1], tx - e[0]) / RAD];
  }

  // Transforma a descrição da postura em ângulos (com cache).
  const cache = new WeakMap();
  function angles(f) {
    if (cache.has(f)) return cache.get(f);
    const neck = at([0, 0], f.t, L.torso);
    const arm = (v) => (Array.isArray(v) ? v : ik(neck, v.x * K, v.y * K, L.up, L.fore, v.k));
    const leg = (v) => (Array.isArray(v) ? v : ik([0, 0], v.x * K, v.y * K, L.thigh, L.shin, v.k));
    const a = arm(f.a), b = arm(f.b || f.a), l = leg(f.l), r = leg(f.r || f.l);
    const n = {
      t: f.t, h: f.h ?? f.t, c: f.c || 0,
      a0: a[0], a1: a[1], b0: b[0], b1: b[1], l0: l[0], l1: l[1], r0: r[0], r1: r[1],
      fl: f.fl ?? l[1] - 90, fr: f.fr ?? r[1] - 90,
    };
    cache.set(f, n);
    return n;
  }
  const ANG = ['t', 'h', 'a0', 'a1', 'b0', 'b1', 'l0', 'l1', 'r0', 'r1', 'fl', 'fr'];
  // Espelha (lado esquerdo): a figura passa a olhar para a esquerda.
  function mirror(n) {
    const o = { c: -n.c };
    for (const k of ANG) o[k] = 180 - n[k];
    return o;
  }
  const prep = (f, mir) => (mir ? mirror(angles(f)) : { ...angles(f) });
  function lerp(A, B, k) {
    const o = { c: A.c + (B.c - A.c) * k };
    for (const key of ANG) {
      const d = ((((B[key] - A[key]) % 360) + 540) % 360) - 180; // caminho mais curto
      o[key] = A[key] + d * k;
    }
    return o;
  }

  // Calcula as juntas, encosta o ponto mais baixo no tapete e centraliza.
  function solve(n) {
    const P = {};
    P.hip = [0, 0];
    P.neck = at(P.hip, n.t, L.torso);
    P.head = at(P.neck, n.h, L.neck);
    P.ae = at(P.neck, n.a0, L.up); P.ah = at(P.ae, n.a1, L.fore);
    P.be = at(P.neck, n.b0, L.up); P.bh = at(P.be, n.b1, L.fore);
    P.lk = at(P.hip, n.l0, L.thigh); P.la = at(P.lk, n.l1, L.shin); P.lt = at(P.la, n.fl, L.foot);
    P.rk = at(P.hip, n.r0, L.thigh); P.ra = at(P.rk, n.r1, L.shin); P.rt = at(P.ra, n.fr, L.foot);
    let maxY = P.head[1] + HEAD, minX = P.head[0] - HEAD, maxX = P.head[0] + HEAD;
    for (const k in P) {
      if (k === 'head') continue;
      maxY = Math.max(maxY, P[k][1] + LIMB);
      minX = Math.min(minX, P[k][0] - LIMB); maxX = Math.max(maxX, P[k][0] + LIMB);
    }
    // Se a postura não couber no quadro, diminui um pouco (em volta do ponto mais baixo, no centro).
    const minY = Math.min(...Object.entries(P).map(([k, p]) => p[1] - (k === 'head' ? HEAD : LIMB)));
    const s = Math.min(1, (FLOOR - 6) / (maxY - minY), (W - 14) / (maxX - minX));
    const cx = (minX + maxX) / 2;
    for (const k in P) P[k] = [W / 2 + (P[k][0] - cx) * s, FLOOR + (P[k][1] - maxY) * s];
    // Curvatura da coluna: ponto de controle deslocado para o lado do tronco.
    const v = [P.neck[0] - P.hip[0], P.neck[1] - P.hip[1]], len = Math.hypot(v[0], v[1]) || 1;
    const mid = [(P.hip[0] + P.neck[0]) / 2, (P.hip[1] + P.neck[1]) / 2];
    P.ctrl = [mid[0] + (v[1] / len) * n.c * 1.6, mid[1] - (v[0] / len) * n.c * 1.6];
    return P;
  }

  function shapes(P) {
    return {
      r: pts(P.hip, P.rk, P.ra, P.rt),
      b: pts(P.neck, P.be, P.bh),
      torso: `M${r1(P.hip[0])} ${r1(P.hip[1])}Q${r1(P.ctrl[0])} ${r1(P.ctrl[1])} ${r1(P.neck[0])} ${r1(P.neck[1])}`,
      l: pts(P.hip, P.lk, P.la, P.lt),
      a: pts(P.neck, P.ae, P.ah),
      hx: r1(P.head[0]), hy: r1(P.head[1]),
    };
  }

  const MAT = `<rect class="fig__mat" x="16" y="${FLOOR}" width="168" height="5" rx="2.5"/>`;
  function markup(s, cls) {
    return `<svg class="fig ${cls || ''}" viewBox="0 0 ${W} 192" aria-hidden="true" focusable="false">${MAT}
<g class="fig__body"><polyline class="fig__far" data-k="r" points="${s.r}"/><polyline class="fig__far" data-k="b" points="${s.b}"/>
<path class="fig__torso" d="${s.torso}"/><polyline class="fig__near" data-k="l" points="${s.l}"/>
<circle class="fig__head" r="${HEAD}" cx="${s.hx}" cy="${s.hy}"/><polyline class="fig__near" data-k="a" points="${s.a}"/></g></svg>`;
  }

  // Figura parada (listas e miniaturas).
  function svg(f, mir, cls) {
    return markup(shapes(solve(prep(f, mir))), cls);
  }

  // Figura animada: set() posiciona, to() anima até a próxima postura.
  function mount(el, cls) {
    let cur = null, raf = 0;
    el.innerHTML = markup(shapes(solve(angles(POSES[0].f))), cls);
    const q = (s) => el.querySelector(s);
    const E = { r: q('[data-k="r"]'), b: q('[data-k="b"]'), l: q('[data-k="l"]'), a: q('[data-k="a"]'), torso: q('.fig__torso'), head: q('.fig__head') };
    function draw(n) {
      const s = shapes(solve(n));
      E.r.setAttribute('points', s.r); E.b.setAttribute('points', s.b);
      E.l.setAttribute('points', s.l); E.a.setAttribute('points', s.a);
      E.torso.setAttribute('d', s.torso);
      E.head.setAttribute('cx', s.hx); E.head.setAttribute('cy', s.hy);
    }
    return {
      set(f, mir) { cancelAnimationFrame(raf); cur = prep(f, mir); draw(cur); },
      to(f, mir, ms = 1000) {
        const target = prep(f, mir);
        cancelAnimationFrame(raf);
        if (!cur || reduce() || ms <= 0) { cur = target; draw(cur); return; }
        const from = cur, t0 = performance.now();
        const step = (now) => {
          const k = Math.min(1, (now - t0) / ms);
          cur = lerp(from, target, ease(k));
          draw(cur);
          if (k < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      stop() { cancelAnimationFrame(raf); },
    };
  }

  window.Fig = { svg, mount };
})();
