/* Sereno — figura das posturas: uma pessoa ilustrada, desenhada pelo app (SVG, sem imagens).
   Por baixo existe um esqueleto com juntas: o app calcula onde fica cada junta a partir dos ângulos da postura,
   encosta o corpo no tapete e centraliza. Por cima, desenha o corpo com volume (cada parte é uma "cápsula"
   que afina de uma junta para a outra), pele, cabelo, regata e legging. Nas transições, interpola os ângulos,
   então os membros nunca esticam. */
(() => {
  'use strict';
  const K = 0.88; // escala geral da pessoa
  const L = { torso: 50 * K, neck: 14 * K, up: 25 * K, fore: 23 * K, thigh: 38 * K, shin: 36 * K, foot: 10 * K };
  const FLOOR = 176, W = 200;
  // Espessura (raio) de cada junta.
  const R = { hip: 9, waist: 7, chest: 8.3, sho: 6, neck: 3.1, head: 8.4, el: 3.6, wr: 2.6, hand: 3.1, kn: 5, an: 3.2, toe: 2.3, thighTop: 7.7 };
  const RAD = Math.PI / 180;
  const at = (p, a, l) => [p[0] + Math.cos(a * RAD) * l, p[1] + Math.sin(a * RAD) * l];
  const f1 = (n) => Math.round(n * 10) / 10;
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
    const h = f.h ?? f.t;
    const n = {
      t: f.t, h, c: f.c || 0, face: f.face ?? h + 90, // para onde o rosto aponta
      a0: a[0], a1: a[1], b0: b[0], b1: b[1], l0: l[0], l1: l[1], r0: r[0], r1: r[1],
      fl: f.fl ?? l[1] - 90, fr: f.fr ?? r[1] - 90,
    };
    cache.set(f, n);
    return n;
  }
  const ANG = ['t', 'h', 'face', 'a0', 'a1', 'b0', 'b1', 'l0', 'l1', 'r0', 'r1', 'fl', 'fr'];
  // Espelha (lado esquerdo): a pessoa passa a olhar para a esquerda.
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

  // Calcula as juntas, encosta o corpo no tapete e centraliza.
  const RAIO = { hip: R.hip, sp1: R.waist, sp2: R.chest, sho: R.sho, head: R.head + 1, bun: 4, ae: R.el, ah: R.hand, be: R.el, bh: R.hand, lk: R.kn, la: R.an, lt: R.toe, rk: R.kn, ra: R.an, rt: R.toe };
  function solve(n) {
    const P = {};
    P.hip = [0, 0];
    P.neck = at(P.hip, n.t, L.torso);
    // Curvatura da coluna: ponto de controle deslocado para o lado do tronco.
    const v = [P.neck[0], P.neck[1]], len = Math.hypot(v[0], v[1]) || 1;
    const ctrl = [P.neck[0] / 2 + (v[1] / len) * n.c * 1.6, P.neck[1] / 2 - (v[0] / len) * n.c * 1.6];
    const bz = (t) => [2 * (1 - t) * t * ctrl[0] + t * t * P.neck[0], 2 * (1 - t) * t * ctrl[1] + t * t * P.neck[1]];
    P.sp1 = bz(0.32); P.sp2 = bz(0.68); P.sho = bz(0.9);
    P.head = at(P.neck, n.h, L.neck);
    const fd = at([0, 0], n.face, 1), up = at([0, 0], n.h, 1);
    P.bun = [P.head[0] - fd[0] * 6.4 + up[0] * 4.6, P.head[1] - fd[1] * 6.4 + up[1] * 4.6];
    P.ae = at(P.sho, n.a0, L.up); P.ah = at(P.ae, n.a1, L.fore);
    P.be = at(P.sho, n.b0, L.up); P.bh = at(P.be, n.b1, L.fore);
    P.lk = at(P.hip, n.l0, L.thigh); P.la = at(P.lk, n.l1, L.shin); P.lt = at(P.la, n.fl, L.foot);
    P.rk = at(P.hip, n.r0, L.thigh); P.ra = at(P.rk, n.r1, L.shin); P.rt = at(P.ra, n.fr, L.foot);
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const k in RAIO) {
      const p = P[k], r = RAIO[k];
      minX = Math.min(minX, p[0] - r); maxX = Math.max(maxX, p[0] + r);
      minY = Math.min(minY, p[1] - r); maxY = Math.max(maxY, p[1] + r);
    }
    // Se a postura não couber no quadro, diminui um pouco.
    const s = Math.min(1, (FLOOR - 6) / (maxY - minY), (W - 12) / (maxX - minX));
    const cx = (minX + maxX) / 2;
    const T = (p) => [W / 2 + (p[0] - cx) * s, FLOOR + (p[1] - maxY) * s];
    for (const k in P) P[k] = T(P[k]);
    P.s = s; P.fd = fd; P.up = up;
    P.minX = W / 2 + (minX - cx) * s; P.maxX = W / 2 + (maxX - cx) * s;
    return P;
  }

  /* ---------------- Desenho ---------------- */
  // Cápsula: une dois círculos (raios r1 e r2) pelas tangentes externas.
  function cap(c1, r1, c2, r2) {
    const dx = c2[0] - c1[0], dy = c2[1] - c1[1], d = Math.hypot(dx, dy);
    if (d <= Math.abs(r1 - r2) + 0.01) return circ(r1 >= r2 ? c1 : c2, Math.max(r1, r2));
    const th = Math.atan2(dy, dx), al = Math.acos((r1 - r2) / d);
    const p = (c, r, a) => `${f1(c[0] + Math.cos(a) * r)} ${f1(c[1] + Math.sin(a) * r)}`;
    return `M${p(c1, r1, th + al)}L${p(c2, r2, th + al)}A${f1(r2)} ${f1(r2)} 0 0 0 ${p(c2, r2, th - al)}L${p(c1, r1, th - al)}A${f1(r1)} ${f1(r1)} 0 1 0 ${p(c1, r1, th + al)}Z`;
  }
  function circ(c, r) {
    return `M${f1(c[0] - r)} ${f1(c[1])}a${f1(r)} ${f1(r)} 0 1 0 ${f1(2 * r)} 0a${f1(r)} ${f1(r)} 0 1 0 ${f1(-2 * r)} 0Z`;
  }
  const off = (p, d, k) => [p[0] + d[0] * k, p[1] + d[1] * k];
  const unit = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l]; };

  // Partes do corpo, na ordem em que são pintadas (de trás para a frente).
  const PARTS = [
    ['shadow', 'fig__shadow'],
    ['bArm', 'fig__skin2'], ['bFore', 'fig__skin2'],
    ['rThigh', 'fig__pants2'], ['rShin', 'fig__pants2'], ['rFoot', 'fig__skin2'],
    ['bun', 'fig__hair'],
    ['torso1', 'fig__top'], ['torso2', 'fig__top'], ['torso3', 'fig__top'],
    ['pelvis', 'fig__pants'],
    ['lThigh', 'fig__pants'], ['lShin', 'fig__pants'], ['lFoot', 'fig__skin'],
    ['neck', 'fig__skin'], ['hair', 'fig__hair'], ['face', 'fig__skin'],
    ['aArm', 'fig__skin'], ['aFore', 'fig__skin'],
  ];
  function shapes(P) {
    const s = P.s, S = (r) => r * s;
    const hand = (e, w) => off(w, unit(e, w), S(1.6));
    const d = {};
    d.shadow = `M${f1(P.minX + 6)} ${FLOOR}a${f1((P.maxX - P.minX) / 2 - 6)} ${f1(S(3.2))} 0 1 0 ${f1(P.maxX - P.minX - 12)} 0a${f1((P.maxX - P.minX) / 2 - 6)} ${f1(S(3.2))} 0 1 0 ${f1(-(P.maxX - P.minX - 12))} 0Z`;
    d.bArm = cap(P.sho, S(R.el + 1.1), P.be, S(R.el));
    d.bFore = cap(P.be, S(R.el - 0.2), P.bh, S(R.wr)) + circ(hand(P.be, P.bh), S(R.hand));
    d.rThigh = cap(P.hip, S(R.thighTop), P.rk, S(R.kn));
    d.rShin = cap(P.rk, S(R.kn - 0.3), P.ra, S(R.an));
    d.rFoot = cap(P.ra, S(R.an - 0.2), P.rt, S(R.toe));
    d.bun = circ(P.bun, S(4));
    d.torso1 = cap(P.hip, S(R.hip - 0.6), P.sp1, S(R.waist));
    d.torso2 = cap(P.sp1, S(R.waist), P.sp2, S(R.chest));
    d.torso3 = cap(P.sp2, S(R.chest), P.sho, S(R.sho));
    d.pelvis = cap(P.hip, S(R.hip), off(P.hip, unit(P.hip, P.sp1), S(7)), S(R.waist + 0.6));
    d.lThigh = cap(P.hip, S(R.thighTop), P.lk, S(R.kn));
    d.lShin = cap(P.lk, S(R.kn - 0.3), P.la, S(R.an));
    d.lFoot = cap(P.la, S(R.an - 0.2), P.lt, S(R.toe));
    d.neck = cap(P.sho, S(R.neck + 0.6), P.head, S(R.neck));
    d.hair = circ(off(off(P.head, P.fd, -S(1.3)), P.up, S(0.7)), S(R.head + 0.6));
    d.face = circ(off(off(P.head, P.fd, S(1.4)), P.up, -S(0.5)), S(R.head - 0.6));
    d.aArm = cap(P.sho, S(R.el + 1.1), P.ae, S(R.el));
    d.aFore = cap(P.ae, S(R.el - 0.2), P.ah, S(R.wr)) + circ(hand(P.ae, P.ah), S(R.hand));
    return d;
  }

  const MAT = `<rect class="fig__mat" x="14" y="${FLOOR}" width="172" height="6" rx="3"/>`;
  function markup(d, cls) {
    return `<svg class="fig ${cls || ''}" viewBox="0 0 ${W} 190" aria-hidden="true" focusable="false">${MAT}<g class="fig__body">${PARTS.map(([k, c]) => `<path class="${c}" data-k="${k}" d="${d[k]}"/>`).join('')}</g></svg>`;
  }

  // Figura parada (listas e miniaturas).
  function svg(f, mir, cls) {
    return markup(shapes(solve(prep(f, mir))), cls);
  }

  // Figura animada: set() posiciona, to() anima até a próxima postura.
  function mount(el, cls) {
    let cur = null, raf = 0;
    el.innerHTML = markup(shapes(solve(angles(POSES[0].f))), cls);
    const E = Object.fromEntries(PARTS.map(([k]) => [k, el.querySelector(`[data-k="${k}"]`)]));
    function draw(n) {
      const d = shapes(solve(n));
      for (const k in E) E[k].setAttribute('d', d[k]);
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
