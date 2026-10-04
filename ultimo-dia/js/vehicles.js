'use strict';
/* Último Dia — veículos em 3D low-poly: sólidos com faces iluminadas e contorno,
   vidros com reflexo, rodas cilíndricas com aro, faróis, lanternas e para-choques. */

// direção da câmera (faces voltadas para ela aparecem) e da luz
const CAM_DIR = [1, 1, 2 * 16 / 38];
const LIGHT_DIR = (() => { const v = [0.35, 0.6, 1], l = Math.hypot(...v); return v.map((c) => c / l); })();
const GLASS = '#2c3c48', GLASS_BROKEN = '#5a666c', CHROME = '#a4a8aa', TIRE = '#1b1b1b';

// referencial do veículo: l = comprimento (frente +), w = largura, z = altura
function vframe(x, y, ca, sa) {
  return {
    w3: (l, w, z) => [x + ca * l - sa * w, y + sa * l + ca * w, z],
    sc: (p) => [PX(p[0], p[1]), PY(p[0], p[1], p[2])],
    ca, sa,
  };
}
function sub3(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function cross3(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
function dot3(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function lit(col, n) {
  const l = Math.hypot(...n) || 1, d = dot3(n, LIGHT_DIR) / l;
  return shade(col, Math.round((d - 0.62) * 0.55 * 50) / 50);
}
function fillPoly(P, col, edge) {
  ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) ctx.lineTo(P[i][0], P[i][1]); ctx.closePath();
  ctx.fillStyle = col; ctx.fill();
  if (edge) { ctx.strokeStyle = edge; ctx.stroke(); }
}
// ponto (u, v) dentro de um quadrilátero de tela (cantos: base-início, base-fim, topo-fim, topo-início)
function quv(Q, u, v) {
  const ax = Q[0][0] + (Q[1][0] - Q[0][0]) * u, ay = Q[0][1] + (Q[1][1] - Q[0][1]) * u;
  const bx = Q[3][0] + (Q[2][0] - Q[3][0]) * u, by = Q[3][1] + (Q[2][1] - Q[3][1]) * u;
  return [ax + (bx - ax) * v, ay + (by - ay) * v];
}
function inset(Q, u0, u1, v0, v1, col, edge) { fillPoly([quv(Q, u0, v0), quv(Q, u1, v0), quv(Q, u1, v1), quv(Q, u0, v1)], col, edge); }
// vidro com reflexo diagonal
function glassPane(Q, u0, u1, v0, v1, col) {
  inset(Q, u0, u1, v0, v1, col, 'rgba(0,0,0,.35)');
  const w = u1 - u0;
  fillPoly([quv(Q, u0 + w * 0.18, v0), quv(Q, u0 + w * 0.34, v0), quv(Q, u0 + w * 0.22, v1), quv(Q, u0 + w * 0.06, v1)], 'rgba(220,235,245,.16)');
  fillPoly([quv(Q, u0 + w * 0.42, v0), quv(Q, u0 + w * 0.48, v0), quv(Q, u0 + w * 0.36, v1), quv(Q, u0 + w * 0.30, v1)], 'rgba(220,235,245,.1)');
}

/* sólido convexo: base [l0,l1,w0,w1] em z0 e topo [l0,l1,w0,w1] em z1.
   o.col: cor; o.top/o.front/o.back/o.side: cores por face; o.deco[face](Q, cor) desenha detalhes. */
function solid(F, b, t, z0, z1, o) {
  const B = [[b[0], b[2]], [b[1], b[2]], [b[1], b[3]], [b[0], b[3]]].map(([l, w]) => F.w3(l, w, z0));
  const T = [[t[0], t[2]], [t[1], t[2]], [t[1], t[3]], [t[0], t[3]]].map(([l, w]) => F.w3(l, w, z1));
  const C = F.w3((b[0] + b[1] + t[0] + t[1]) / 4, (b[2] + b[3] + t[2] + t[3]) / 4, (z0 + z1) / 2);
  const faces = [
    ['wa', [B[0], B[1], T[1], T[0]]], ['wb', [B[3], B[2], T[2], T[3]]],
    ['front', [B[1], B[2], T[2], T[1]]], ['back', [B[0], B[3], T[3], T[0]]], ['top', [T[0], T[1], T[2], T[3]]],
  ];
  for (const [name, P] of faces) {
    let n = cross3(sub3(P[1], P[0]), sub3(P[3], P[0]));
    const m = [(P[0][0] + P[2][0]) / 2 - C[0], (P[0][1] + P[2][1]) / 2 - C[1], (P[0][2] + P[2][2]) / 2 - C[2]];
    if (dot3(n, m) < 0) n = [-n[0], -n[1], -n[2]];
    if (dot3(n, CAM_DIR) <= 1e-4) continue;
    const base = (name === 'top' ? o.top : name === 'front' ? o.front : name === 'back' ? o.back : o.side) || o.col;
    const col = lit(base, n), Q = P.map(F.sc);
    fillPoly(Q, col, o.edge || shade(base, -0.55));
    const dk = o.deco && (o.deco[name] || (name[0] === 'w' && o.deco.side));
    if (dk) dk(Q, col, n);
  }
}

// roda: cilindro com eixo na largura; centro (l, w), raio r, largura wd
function wheel(F, l, w, r, wd, rim) {
  const N = 14, out = w >= 0 ? 1 : -1;
  const ring = (ww) => { const a = []; for (let i = 0; i < N; i++) { const t = (i / N) * Math.PI * 2; a.push(F.w3(l + Math.cos(t) * r, ww, r + Math.sin(t) * r)); } return a; };
  const A = ring(w - out * wd / 2), Bo = ring(w + out * wd / 2);
  const axis = sub3(F.w3(0, out, 0), F.w3(0, 0, 0));
  ctx.lineWidth = Math.max(0.6, 0.8 * K);
  for (let i = 0; i < N; i++) {
    const j = (i + 1) % N, t = ((i + 0.5) / N) * Math.PI * 2;
    const n = sub3(F.w3(Math.cos(t), 0, Math.sin(t)), F.w3(0, 0, 0));
    if (dot3(n, CAM_DIR) <= 0) continue;
    fillPoly([A[i], A[j], Bo[j], Bo[i]].map(F.sc), lit(TIRE, n));
  }
  const showOut = dot3(axis, CAM_DIR) > 0, disc = showOut ? Bo : A;
  const S = disc.map(F.sc);
  fillPoly(S, '#141414', '#0a0a0a');
  if (showOut || rim) {
    const c = F.sc(F.w3(l, w + (showOut ? out : -out) * wd / 2, r));
    const rs = S.map(([px, py]) => [c[0] + (px - c[0]) * 0.58, c[1] + (py - c[1]) * 0.58]);
    fillPoly(rs, showOut ? (rim || '#8c9094') : '#2a2a2a', 'rgba(0,0,0,.4)');
    if (showOut) fillPoly(rs.map(([px, py]) => [c[0] + (px - c[0]) * 0.4, c[1] + (py - c[1]) * 0.4]), '#55595c');
  }
}

// detalhes reutilizáveis das faces
const D = {
  front(light, grille = '#1c1e20') {
    return (Q) => {
      inset(Q, 0.32, 0.68, 0.28, 0.72, grille, 'rgba(0,0,0,.4)');
      ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.beginPath(); for (const v of [0.42, 0.56]) { const a = quv(Q, 0.34, v), b = quv(Q, 0.66, v); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); } ctx.stroke();
      inset(Q, 0.05, 0.25, 0.42, 0.78, light, 'rgba(0,0,0,.35)'); inset(Q, 0.75, 0.95, 0.42, 0.78, light, 'rgba(0,0,0,.35)');
    };
  },
  back() {
    return (Q) => { inset(Q, 0.04, 0.24, 0.5, 0.84, '#b42a22', 'rgba(0,0,0,.4)'); inset(Q, 0.76, 0.96, 0.5, 0.84, '#b42a22', 'rgba(0,0,0,.4)'); inset(Q, 0.36, 0.64, 0.42, 0.78, 'rgba(0,0,0,.18)'); };
  },
  doors(seams, handle) {
    return (Q, col) => {
      ctx.strokeStyle = 'rgba(0,0,0,.32)'; ctx.beginPath();
      for (const u of seams) { const a = quv(Q, u, 0.08), b = quv(Q, u, 0.98); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
      const a = quv(Q, 0.02, 0.62), b2 = quv(Q, 0.98, 0.62); ctx.moveTo(a[0], a[1]); ctx.lineTo(b2[0], b2[1]);
      ctx.stroke();
      if (handle) for (const u of seams) inset(Q, u - 0.07, u - 0.03, 0.72, 0.8, shade(col[0] === '#' ? col : '#888888', 0.3));
    };
  },
  windows(panes, col) { return (Q) => { for (const [u0, u1] of panes) glassPane(Q, u0, u1, 0.14, 0.9, col); }; },
};

function drawCar(v) {
  const d = VT[v.t], L = d.len / 2, W = d.wid / 2, ca = Math.cos(v.a), sa = Math.sin(v.a), x = v.x, y = v.y;
  const dead = v.hp <= 0, col = dead ? '#2f2b28' : v.col, glass = dead || v.hp < d.hp * 0.3 ? GLASS_BROKEN : GLASS;
  const F = vframe(x, y, ca, sa);
  // sombra suave
  const sh = [[-L, -W], [L, -W], [L, W], [-L, W]].map(([l, w]) => F.sc(F.w3(l * 1.06 + 0.1, w * 1.12 + 0.06, 0)));
  fillPoly(sh, 'rgba(0,0,0,.32)');
  ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(0.6, 0.9 * K);
  const light = v.lights || (v.on && daylight() < 0.5) ? '#fff6c8' : '#d8d8c8';
  const frontNear = ca + sa > 0; // a frente está do lado da câmera?
  const bumper = (front) => { const r = front ? [L - 0.03, L + 0.05] : [-L - 0.05, -L + 0.03]; solid(F, [r[0], r[1], -W * 0.94, W * 0.94], [r[0], r[1], -W * 0.92, W * 0.92], 0.13, 0.25, { col: dead ? '#3a3632' : CHROME }); };
  const bumpers = (draw) => { bumper(!frontNear); draw(); bumper(frontNear); };

  if (d.moto) {
    wheel(F, L * 0.72, 0, 0.21, 0.08, '#6a6e72'); wheel(F, -L * 0.72, 0, 0.21, 0.08, '#6a6e72');
    solid(F, [-L * 0.55, L * 0.55, -0.05, 0.05], [-L * 0.5, L * 0.5, -0.05, 0.05], 0.2, 0.3, { col: '#3a3a3a' });
    solid(F, [-L * 0.05, L * 0.45, -W * 0.45, W * 0.45], [0, L * 0.38, -W * 0.38, W * 0.38], 0.28, 0.52, { col });
    solid(F, [-L * 0.5, 0, -W * 0.3, W * 0.3], [-L * 0.45, -L * 0.05, -W * 0.28, W * 0.28], 0.4, 0.56, { col: '#1e1e1e' });
    solid(F, [L * 0.52, L * 0.58, -W * 0.85, W * 0.85], [L * 0.52, L * 0.58, -W * 0.85, W * 0.85], 0.72, 0.76, { col: '#2a2a2a' });
    solid(F, [L * 0.5, L * 0.6, -0.03, 0.03], [L * 0.5, L * 0.6, -0.03, 0.03], 0.35, 0.72, { col: '#2a2a2a' });
    solid(F, [L * 0.6, L * 0.68, -0.07, 0.07], [L * 0.6, L * 0.66, -0.06, 0.06], 0.5, 0.6, { col: light });
    if (v === S.player.inCar) drawPerson(x - ca * 0.1, y - sa * 0.1, 0.35, v.a, { look: playerLook(S.player), amp: 0, helmet: !!S.player.eq.cabeca });
    return;
  }
  if (v.t === 'trator') {
    wheel(F, L * 0.62, -W * 0.82, 0.24, 0.16, '#d8b23a'); wheel(F, L * 0.62, W * 0.82, 0.24, 0.16, '#d8b23a');
    wheel(F, -L * 0.5, -W * 0.95, 0.44, 0.24, '#d8b23a'); wheel(F, -L * 0.5, W * 0.95, 0.44, 0.24, '#d8b23a');
    solid(F, [-L * 0.1, L * 0.98, -W * 0.42, W * 0.42], [-L * 0.1, L * 0.9, -W * 0.36, W * 0.36], 0.3, 0.78, { col, front: '#2a2a2a', deco: { side: D.doors([0.35, 0.55, 0.75]) } });
    solid(F, [-L * 0.95, -L * 0.1, -W * 0.55, W * 0.55], [-L * 0.95, -L * 0.1, -W * 0.55, W * 0.55], 0.3, 0.62, { col: shade(col, -0.12) });
    solid(F, [L * 0.55, L * 0.62, -0.05, 0.05], [L * 0.55, L * 0.62, -0.04, 0.04], 0.78, 1.25, { col: '#2a2a2a' });
    solid(F, [-L * 0.75, -L * 0.45, -W * 0.25, W * 0.25], [-L * 0.72, -L * 0.48, -W * 0.22, W * 0.22], 0.62, 0.8, { col: '#232323' });
    for (const [l, w] of [[-L * 0.92, -W * 0.5], [-L * 0.92, W * 0.5], [-L * 0.18, -W * 0.5], [-L * 0.18, W * 0.5]]) solid(F, [l - 0.03, l + 0.03, w - 0.03, w + 0.03], [l - 0.03, l + 0.03, w - 0.03, w + 0.03], 0.62, 1.5, { col: '#2a2a2a' });
    solid(F, [-L * 1.0, -L * 0.1, -W * 0.62, W * 0.62], [-L * 0.98, -L * 0.12, -W * 0.6, W * 0.6], 1.5, 1.57, { col: shade(col, -0.2) });
    return;
  }

  const wr = v.t === 'caminhao' ? 0.22 : 0.19, wx = v.t === 'caminhao' ? [L * 0.7, -L * 0.55, -L * 0.78] : [L * 0.62, -L * 0.62];
  for (const l of wx) for (const sg of [-1, 1]) wheel(F, l, sg * (W - 0.05), wr, 0.14);

  if (v.t === 'caminhao') {
    const box = '#d8d6d0';
    solid(F, [-L, L * 0.97, -W * 0.6, W * 0.6], [-L, L * 0.97, -W * 0.6, W * 0.6], 0.2, 0.32, { col: '#2a2a2a' });
    solid(F, [-L, L * 0.4, -W, W], [-L, L * 0.4, -W, W], 0.32, 1.6, { col: v.col === '#e0e0e0' ? box : shade(box, -0.05), back: '#b8b6b0',
      deco: { side: (Q) => { ctx.strokeStyle = 'rgba(0,0,0,.1)'; ctx.beginPath(); for (let k = 1; k < 8; k++) { const a = quv(Q, k / 8, 0.03), b = quv(Q, k / 8, 0.97); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); } ctx.stroke(); inset(Q, 0.05, 0.95, 0.08, 0.2, col); },
        back: (Q) => { ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); const a = quv(Q, 0.5, 0.04), b = quv(Q, 0.5, 0.97); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); inset(Q, 0.05, 0.15, 0.05, 0.15, '#b42a22'); inset(Q, 0.85, 0.95, 0.05, 0.15, '#b42a22'); } } });
    bumpers(() => {
      solid(F, [L * 0.44, L, -W * 0.95, W * 0.95], [L * 0.44, L * 0.98, -W * 0.93, W * 0.93], 0.28, 0.72, { col, deco: { front: D.front(light), side: D.doors([0.2]) } });
      solid(F, [L * 0.44, L * 0.98, -W * 0.93, W * 0.93], [L * 0.44, L * 0.8, -W * 0.85, W * 0.85], 0.72, 1.32, { col, deco: { front: D.windows([[0.06, 0.94]], glass), side: D.windows([[0.12, 0.8]], glass) } });
    });
    return;
  }

  const police = v.t === 'viatura', amb = v.t === 'ambulancia', pickup = v.t === 'caminhonete';
  const bodyCol = police ? '#20283a' : col;
  const hood = amb ? 0.58 : pickup ? 0.56 : 0.48;
  bumpers(() => {
    // carroceria de baixo, um pouco chanfrada no topo
    solid(F, [-L, L, -W, W], [-L + 0.05, L - 0.04, -W + 0.03, W - 0.03], 0.15, hood, {
      col: bodyCol,
      deco: {
        front: D.front(light), back: D.back(),
        side: (Q, c) => {
          if (police) { inset(Q, 0.3, 0.7, 0.12, 0.95, '#e6e6e2', 'rgba(0,0,0,.3)'); }
          if (amb) { inset(Q, 0.02, 0.98, 0.45, 0.62, '#c8302a'); }
          D.doors(pickup ? [0.62] : amb ? [0.72] : [0.38, 0.62], true)(Q, bodyCol);
          // caixa de roda escura
          for (const u of pickup || amb ? [0.19, 0.81] : [0.19, 0.81]) inset(Q, u - 0.1, u + 0.1, 0, 0.36, 'rgba(0,0,0,.35)');
        },
        top: pickup ? (Q) => { inset(Q, 0.02, 0.42, 0.07, 0.93, '#1e1c1a', 'rgba(0,0,0,.5)'); inset(Q, 0.04, 0.4, 0.12, 0.88, '#2c2a26'); } : null,
      },
    });
    if (amb) {
      // baú de ambulância e cabine com para-brisa inclinado
      solid(F, [-L, L * 0.3, -W * 0.98, W * 0.98], [-L, L * 0.3, -W * 0.98, W * 0.98], hood, 1.32, {
        col: '#efefeb',
        deco: {
          side: (Q) => { inset(Q, 0.02, 0.98, 0.0, 0.14, '#c8302a'); glassPane(Q, 0.62, 0.86, 0.45, 0.82, glass); inset(Q, 0.25, 0.37, 0.5, 0.82, '#c8302a'); inset(Q, 0.18, 0.44, 0.61, 0.71, '#c8302a'); },
          top: (Q) => { inset(Q, 0.3, 0.7, 0.4, 0.6, '#c8302a'); inset(Q, 0.42, 0.58, 0.2, 0.8, '#c8302a'); },
          back: (Q) => { ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); const a = quv(Q, 0.5, 0.02), b = quv(Q, 0.5, 0.98); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); glassPane(Q, 0.12, 0.44, 0.5, 0.85, glass); glassPane(Q, 0.56, 0.88, 0.5, 0.85, glass); },
        },
      });
      solid(F, [L * 0.3, L * 0.96, -W * 0.95, W * 0.95], [L * 0.3, L * 0.6, -W * 0.9, W * 0.9], hood, 1.2, { col: '#efefeb', deco: { front: D.windows([[0.05, 0.95]], glass), side: D.windows([[0.08, 0.86]], glass) } });
    } else {
      const cab = pickup ? [[-L * 0.14, L * 0.42], [-L * 0.1, L * 0.2], 0.98] : [[-L * 0.56, L * 0.3], [-L * 0.42, L * 0.04], 0.9];
      const roof = police ? '#ececea' : bodyCol;
      solid(F, [cab[0][0], cab[0][1], -W * 0.9, W * 0.9], [cab[1][0], cab[1][1], -W * 0.75, W * 0.75], hood, cab[2], {
        col: bodyCol, top: roof,
        deco: { front: D.windows([[0.06, 0.94]], glass), back: D.windows([[0.08, 0.92]], glass), side: D.windows(pickup ? [[0.1, 0.86]] : [[0.07, 0.47], [0.53, 0.92]], glass) },
      });
      if (police || d.siren) {
        const on = v === S.player.inCar && v.on && Math.floor(performance.now() / 250) % 2, z = cab[2];
        solid(F, [-L * 0.24, -L * 0.1, -W * 0.62, 0], [-L * 0.23, -L * 0.11, -W * 0.6, 0], z, z + 0.09, { col: on ? '#6cf' : '#2a5aa0' });
        solid(F, [-L * 0.24, -L * 0.1, 0, W * 0.62], [-L * 0.23, -L * 0.11, 0, W * 0.6], z, z + 0.09, { col: on ? '#a22' : '#e03a30' });
      }
    }
    if (amb) {
      const on = v === S.player.inCar && v.on && Math.floor(performance.now() / 250) % 2;
      solid(F, [L * 0.2, L * 0.3, -W * 0.7, 0], [L * 0.2, L * 0.29, -W * 0.68, 0], 1.32, 1.4, { col: on ? '#a22' : '#e03a30' });
      solid(F, [L * 0.2, L * 0.3, 0, W * 0.7], [L * 0.2, L * 0.29, 0, W * 0.68], 1.32, 1.4, { col: on ? '#6cf' : '#2a5aa0' });
    }
    // retrovisores
    if (!amb) for (const sg of [-1, 1]) { const l = pickup ? L * 0.36 : L * 0.24, ww = sg < 0 ? [-W - 0.07, -W + 0.01] : [W - 0.01, W + 0.07]; solid(F, [l - 0.05, l + 0.03, ww[0], ww[1]], [l - 0.04, l + 0.02, ww[0], ww[1]], hood + 0.02, hood + 0.1, { col: bodyCol }); }
  });
}
