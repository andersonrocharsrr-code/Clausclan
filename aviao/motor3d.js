/* Motor GEnx-2B em 3D (WebGL): corte em perspectiva no estilo das ilustrações técnicas de fábrica.
   Os perfis (em metros) vêm de motor747.js; aqui ficam a malha, os materiais, o corte e o desenho.
   Eixo do motor em +x (boca em x = 0); y para cima; z para o lado de quem olha. */
(() => {
'use strict';
const TAU = Math.PI * 2, D2R = Math.PI / 180;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;

/* ---------- Matemática (matrizes em colunas, como o WebGL espera) ---------- */
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scl = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
function persp(fy, asp, n, f) { const t = 1 / Math.tan(fy / 2), nf = 1 / (n - f); return [t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) * nf, -1, 0, 0, 2 * f * n * nf, 0]; }
function lookAt(e, c, u) { const z = norm(sub(e, c)), x = norm(cross(u, z)), y = cross(z, x); return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, e), -dot(y, e), -dot(z, e), 1]; }
function mul(a, b) { const o = new Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = s; } return o; }
const rotX = (t) => { const c = Math.cos(t), s = Math.sin(t); return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]; };
const transl = (x, y, z) => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
const I4 = transl(0, 0, 0);
function xform(m, p) { const [x, y, z] = p; return [m[0] * x + m[4] * y + m[8] * z + m[12], m[1] * x + m[5] * y + m[9] * z + m[13], m[2] * x + m[6] * y + m[10] * z + m[14], m[3] * x + m[7] * y + m[11] * z + m[15]]; }
const n3 = (m) => [m[0], m[1], m[2], m[4], m[5], m[6], m[8], m[9], m[10]];
const P3 = (x, r, t) => [x, r * Math.cos(t), r * Math.sin(t)];

/* ---------- Malha ---------- */
// Vértice: posição (3), normal (3), [material, peça, borda cromada, 0], [x0 do corte, x1 do corte, modo do corte, cor do corte]
const STRIDE = 14;
class Mesh {
  constructor() { this.d = []; }
  tri(a, b, c, m) {
    // A ordem dos vértices segue a normal, para a frente e o verso do triângulo saírem certos.
    const nn = add(add(a.n, b.n), c.n), cr = cross(sub(b.p, a.p), sub(c.p, a.p));
    if (dot(cr, nn) < 0) { const t = b; b = c; c = t; }
    for (const v of [a, b, c]) this.d.push(v.p[0], v.p[1], v.p[2], v.n[0], v.n[1], v.n[2], v.mat ?? m.mat, m.part || 0, v.e || 0, 0, m.cut ? m.cut[0] : 0, m.cut ? m.cut[1] : 0, m.cut ? m.cut[2] : 0, v.cap ?? m.cap ?? 0);
  }
  quad(a, b, c, d, m) { this.tri(a, b, c, m); this.tri(a, c, d, m); }
}
// Amostra um perfil r(x)
const S = (fn, x0, x1, n) => Array.from({ length: n + 1 }, (_, i) => { const x = lerp(x0, x1, i / n); return [x, fn(x)]; });

// Gira um contorno fechado (x, r) em volta do eixo: vira uma peça sólida. Cada ponto pode trocar o material da aresta que começa nele.
function revolve(mesh, loop, m, o = {}) {
  const segs = o.segs || 64, a0 = o.a0 ?? 0, a1 = o.a1 ?? TAU, full = a1 - a0 > TAU - 1e-6;
  const pts = loop.filter((p, i) => { const q = loop[(i + 1) % loop.length]; return Math.hypot(p[0] - q[0], p[1] - q[1]) > 1e-6; });
  const N = pts.length;
  let A = 0;
  for (let i = 0; i < N; i++) { const p = pts[i], q = pts[(i + 1) % N]; A += p[0] * q[1] - q[0] * p[1]; }
  const sg = A > 0 ? 1 : -1;
  const en = pts.map((p, i) => { const q = pts[(i + 1) % N], dx = q[0] - p[0], dr = q[1] - p[1], L = Math.hypot(dx, dr); return [sg * dr / L, -sg * dx / L]; });
  const vn = (i, e) => { // normal no vértice i para a aresta e (suave se as arestas quase se alinham)
    const a = en[(i - 1 + N) % N], b = en[i % N];
    if (a[0] * b[0] + a[1] * b[1] > 0.8) { const s = [a[0] + b[0], a[1] + b[1]], l = Math.hypot(s[0], s[1]); return [s[0] / l, s[1] / l]; }
    return en[e];
  };
  for (let i = 0; i < N; i++) {
    const p = pts[i], q = pts[(i + 1) % N];
    if (p[1] < 1e-5 && q[1] < 1e-5) continue;
    const mat = p[2] ?? m.mat, cap = p[3] ?? m.cap, part = p[4] ?? m.part;
    const mm = { ...m, mat, cap, part };
    const ns = vn(i, i), ne = vn((i + 1) % N, i);
    for (let j = 0; j < segs; j++) {
      const t0 = a0 + (a1 - a0) * j / segs, t1 = a0 + (a1 - a0) * (j + 1) / segs;
      const V = (pt, nn, t) => ({ p: P3(pt[0], pt[1], t), n: [nn[0], nn[1] * Math.cos(t), nn[1] * Math.sin(t)] });
      mesh.quad(V(p, ns, t0), V(q, ne, t0), V(q, ne, t1), V(p, ns, t1), mm);
    }
  }
  if (!full) for (const [t, s] of [[a0, -1], [a1, 1]]) {
    const n = scl([0, -Math.sin(t), Math.cos(t)], s);
    for (let i = 1; i < N - 1; i++) mesh.tri({ p: P3(pts[0][0], pts[0][1], t), n }, { p: P3(pts[i][0], pts[i][1], t), n }, { p: P3(pts[i + 1][0], pts[i + 1][1], t), n }, m);
  }
}
// Tubo ao longo de um caminho 3D
function tube(mesh, path, rad, m, sides = 10, caps = true) {
  const rings = [];
  // Referência fixa: a normal do plano do caminho (os tubos daqui são planos), para o anel não torcer
  let ref = cross(sub(path[1], path[0]), sub(path[path.length - 1], path[0]));
  if (Math.hypot(...ref) < 1e-9) ref = Math.abs(sub(path[1], path[0])[1]) > 0.9 * Math.hypot(...sub(path[1], path[0])) ? [1, 0, 0] : [0, 1, 0];
  ref = norm(ref);
  for (let i = 0; i < path.length; i++) {
    const T = norm(sub(path[Math.min(i + 1, path.length - 1)], path[Math.max(i - 1, 0)]));
    let Nn = cross(T, ref); if (Math.hypot(...Nn) < 1e-6) Nn = cross(T, [0, 0, 1]);
    Nn = norm(Nn); const B = cross(T, Nn);
    const rr = typeof rad === 'function' ? rad(i / (path.length - 1)) : rad;
    rings.push(Array.from({ length: sides }, (_, k) => { const a = k / sides * TAU, d = add(scl(Nn, Math.cos(a)), scl(B, Math.sin(a))); return { p: add(path[i], scl(d, rr)), n: d }; }));
  }
  for (let i = 0; i < rings.length - 1; i++) for (let k = 0; k < sides; k++) { const k2 = (k + 1) % sides; mesh.quad(rings[i][k], rings[i + 1][k], rings[i + 1][k2], rings[i][k2], m); }
  if (caps) for (const [i, s] of [[0, -1], [rings.length - 1, 1]]) {
    const n = scl(norm(sub(path[Math.min(i + 1, path.length - 1)], path[Math.max(i - 1, 0)])), s), c = { p: path[i], n };
    for (let k = 0; k < sides; k++) mesh.tri(c, { p: rings[i][k].p, n }, { p: rings[i][(k + 1) % sides].p, n }, m);
  }
}
function sphere(mesh, c, r, m, n = 8) {
  const P = (a, b) => { const d = [Math.cos(b), Math.sin(b) * Math.cos(a), Math.sin(b) * Math.sin(a)]; return { p: add(c, scl(d, r)), n: d }; };
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const a0 = i / n * TAU, a1 = (i + 1) / n * TAU, b0 = j / n * Math.PI, b1 = (j + 1) / n * Math.PI;
    mesh.quad(P(a0, b0), P(a0, b1), P(a1, b1), P(a1, b0), m);
  }
}
// Caixa orientada: centro, eixos (u, v, w) já com o tamanho (meia medida)
function box(mesh, c, u, v, w, m) {
  const F = (n, a, b) => { const nn = norm(n), base = add(c, n); mesh.quad({ p: add(add(base, scl(a, -1)), scl(b, -1)), n: nn }, { p: add(add(base, a), scl(b, -1)), n: nn }, { p: add(add(base, a), b), n: nn }, { p: add(add(base, scl(a, -1)), b), n: nn }, m); };
  F(u, v, w); F(scl(u, -1), v, w); F(v, u, w); F(scl(v, -1), u, w); F(w, u, v); F(scl(w, -1), u, v);
}

// Uma fileira de pás. As pás do rotor ganham a borda de ataque cromada (atributo "e").
function bladeRow(mesh, rw, m, o) {
  const fan = !!rw.fan, rot = rw.kind === 'r' && !o.plain;
  const us = fan ? [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] : [0, 0.5, 1];
  const vs = fan ? [0, 0.06, 0.1, 0.18, 0.3, 0.44, 0.58, 0.72, 0.86, 0.95, 1] : rot ? [0, 0.12, 0.55, 0.9, 1] : [0, 0.5, 1];
  const xc = rw.x + (rw.c || 0.3) / 2, rh = (o.rh ?? rw.hub(xc)) + 0.003, rt = (o.rt ?? rw.tip(xc)) - 0.005;
  const P = (tb, u, v) => {
    const r = lerp(rh, rt, u);
    let c, b, xl, lean = 0;
    if (fan) { c = lerp(0.2, 0.43, Math.min(1, u * 1.35)) - 0.05 * Math.max(0, u - 0.75); b = lerp(26, 62, u) * D2R; xl = 0.885 - 0.05 * Math.sin(u * Math.PI * 0.9) + 0.03 * u * u; lean = -0.22 * u * u; }
    else { c = rw.c; b = (rw.st + 8 * (u - 0.5) * Math.sign(rw.st || 1)) * D2R; xl = rw.x; }
    const camber = c * 0.07 * 4 * v * (1 - v) * (b >= 0 ? 1 : -1);
    const t = tb + (v * c * Math.sin(b) + camber) / r + lean;
    return [xl + v * c * Math.cos(b), r * Math.cos(t), r * Math.sin(t)];
  };
  const n = o.n ?? rw.n, list = o.only ?? Array.from({ length: n }, (_, j) => j);
  for (const j of list) {
    const tb = j / n * TAU + (o.off || 0);
    const G = us.map((u) => vs.map((v) => P(tb, u, v)));
    const V = (i, k) => {
      const du = sub(G[Math.min(i + 1, us.length - 1)][k], G[Math.max(i - 1, 0)][k]), dv = sub(G[i][Math.min(k + 1, vs.length - 1)], G[i][Math.max(k - 1, 0)]);
      const e = rot ? (k <= (fan ? 1 : 0) ? 1 : k === vs.length - 1 ? 0.55 : 0) + (fan && i === us.length - 1 ? 0.5 : 0) : 0;
      return { p: G[i][k], n: norm(cross(dv, du)), e: Math.min(1, e) };
    };
    for (let i = 0; i < us.length - 1; i++) for (let k = 0; k < vs.length - 1; k++) mesh.quad(V(i, k), V(i + 1, k), V(i + 1, k + 1), V(i, k + 1), m);
  }
}

/* ---------- Materiais ---------- */
// [r, g, b, tile] — tile: 0 cromado, 1 metal acetinado, 2 preto brilhante, 3 pintura, 4 chama, 5 metal quente; +10 = pinta os dois lados
const MATS = [
  [1, 1, 1, 0], // 0 cromado
  [0.93, 0.94, 0.96, 0], // 1 casco prateado
  [1, 1, 1, 12], // 2 pá preta (dois lados)
  [0.4, 0.57, 0.8, 3], // 3 azul do fan e do duto
  [0.52, 0.55, 0.58, 1], // 4 aço escuro (paredes do núcleo)
  [0.97, 0.97, 0.95, 3], // 5 branco (anel do cone)
  [1, 1, 1, 4], // 6 chama
  [0.86, 0.7, 0.38, 1], // 7 latão
  [0.95, 0.88, 0.78, 15], // 8 pá de turbina (metal quente, dois lados)
  [0.74, 0.76, 0.78, 11], // 9 palheta fixa (dois lados)
  [0.64, 0.72, 0.82, 1], // 10 parede interna do duto do fan
  [0.86, 0.87, 0.89, 1], // 11 tambor e discos
  [0.78, 0.2, 0.16, 3], // 12 vermelho (conexões)
  [0.32, 0.34, 0.37, 1], // 13 grafite (caixas e bombas)
];
// Cor das faces do corte (o "miolo" das peças)
const CAPS = [[0.8, 0.81, 0.83], [0.96, 0.47, 0.17], [0.5, 0.52, 0.55], [0.56, 0.66, 0.8], [0.84, 0.3, 0.22]];

/* ---------- O motor ---------- */
const MOD = { inlet: -1.6, fan: -0.85, case: 0, core: 0.95, lpt: 2.0 };
function buildEngine(g) {
  const groups = {};
  const M = (mod, spin = 's') => (groups[mod + ':' + spin] ||= new Mesh());
  const id = (k) => g.PID[k] || 0;
  const CUT = [1.2, 3.85, 1], CUT_CORE = [1.75, 5.65, 1], DEEP = [1.0, 5.7, 2], COWL = [0.72, 3.85, 3];
  const caseTh = (x) => lerp(0.12, 0.035, clamp((x - 1.45) / 0.2, 0, 1));
  const capCore = (x) => (x > 3.55 && x < 4.1 ? 1 : 0);

  // Entrada de ar (lábio polido, inteiro)
  revolve(M('inlet'), [...S(g.nacOut, -0.05, 0.72, 18), ...S(g.caseIn, 0.72, -0.05, 14)], { mat: 1, part: id('inlet'), cap: 0 }, { segs: 72 });
  // Carcaça do fan: por dentro azul (o anel em volta do fan e o duto)
  revolve(M('case'), [...S(g.caseIn, 0.72, 3.62, 40).map((p) => [p[0], p[1], 3, 3, p[0] < 1.6 ? id('fancase') : id('bypass')]), [3.62, g.caseIn(3.62) + 0.03], ...S((x) => g.caseIn(x) + caseTh(x), 3.62, 0.72, 40)], { mat: 4, part: id('fancase'), cap: 0, cut: CUT }, { segs: 72 });
  // Capô (pele de fora), aberto em cima e com a porta de baixo aberta
  revolve(M('case'), [...S(g.nacOut, 0.72, 3.7, 34), [3.7, g.nacOut(3.7) - 0.03], ...S((x) => g.nacOut(x) - 0.03, 3.7, 0.72, 34).map((p) => [p[0], p[1], 4])], { mat: 1, part: 0, cap: 0, cut: COWL }, { segs: 72 });
  // Cone do fan (preto com anel branco) e cubo cromado
  revolve(M('fan', 'lp'), [[0.12, 0], ...S(g.spin, 0.12, 0.95, 22).map((p) => [p[0], p[1], p[0] > 0.3 && p[0] < 0.36 ? 5 : 2]), [0.95, 0]], { mat: 2, part: id('spinner') }, { segs: 56 });
  revolve(M('fan', 'lp'), [[0.95, 0], [0.95, g.spin(0.95)], [1.0, 0.385], [1.22, 0.405], [1.22, 0]], { mat: 0, part: id('fan') }, { segs: 56 });
  // Parafusos em volta do cubo
  for (let i = 0; i < 30; i++) { const t = i / 30 * TAU; sphere(M('fan', 'lp'), P3(0.93, 0.33, t), 0.009, { mat: 13, part: id('spinner') }, 4); }
  // Pás do fan: pretas com a borda cromada
  for (const rw of g.ROWS) {
    if (rw.fan) bladeRow(M('fan', 'lp'), rw, { mat: 2, part: id('fan') }, { n: 18 });
    else if (rw.part === 'ogv') bladeRow(M('case'), rw, { mat: 9, part: id('ogv') }, { n: 40 });
    else if (rw.part === 'lpc') bladeRow(M('fan', rw.kind === 'r' ? 'lp' : 's'), rw, { mat: rw.kind === 'r' ? 2 : 9, part: id('lpc') }, { n: rw.kind === 'r' ? 44 : 48 });
    else if (rw.part === 'hpc') bladeRow(M('core', rw.kind === 'r' ? 'hp' : 's'), rw, { mat: rw.kind === 'r' ? 2 : 9, part: id('hpc') }, { n: rw.kind === 'r' ? 40 : 44 });
    else if (rw.part === 'hpt') bladeRow(M('core', rw.kind === 'r' ? 'hp' : 's'), rw, { mat: rw.kind === 'r' ? 8 : 9, part: id('hpt') }, { n: rw.kind === 'r' ? 48 : 36, plain: true });
    else if (rw.part === 'lpt') bladeRow(M('lpt', rw.kind === 'r' ? 'lp' : 's'), rw, { mat: rw.kind === 'r' ? 8 : 9, part: id('lpt') }, { n: rw.kind === 'r' ? 56 : 60, plain: true });
    else if (rw.part === 'nozzle') bladeRow(M('lpt'), rw, { mat: 9, part: id('nozzle') }, { n: 14 });
  }
  // Divisor de fluxo e carcaça do booster (o bico fica inteiro; atrás dele, pele e carcaça finas)
  const cw = g.cowl, oc = g.outC;
  revolve(M('fan'), [...S(cw, g.SPLIT, 2.3, 16).map((p) => [p[0], p[1], 10, 3, id('splitter')]), [2.3, cw(2.3) - 0.025], ...S((x) => cw(x) - 0.025, 2.3, 1.75, 8).map((p) => [p[0], p[1], 4]),
    [1.75, oc(1.75) + 0.035], ...S((x) => oc(x) + 0.035, 1.75, 2.3, 8).map((p) => [p[0], p[1], 1]), [2.3, oc(2.3)], ...S(oc, 2.3, g.SPLIT, 16).map((p) => [p[0], p[1], 4, 2, id('lpc')])], { mat: 4, part: id('splitter'), cap: 0, cut: CUT_CORE }, { segs: 64 });
  // Pele do núcleo e carcaça do compressor de alta e da câmara
  const strip = (mod, x0, x1, lo, hi, matIn, matOut, part, cut) => revolve(M(mod), [...S(lo, x0, x1, 24).map((p) => [p[0], p[1], matIn, capCore(p[0]), part(p[0])]), [x1, hi(x1)], ...S(hi, x1, x0, 24).map((p) => [p[0], p[1], matOut, capCore(p[0]), part(p[0])])], { mat: matOut, cap: 0, part: 0, cut }, { segs: 64 });
  const corePart = (x) => (x < 3.6 ? id('hpc') : x < 4.08 ? id('comb') : id('hpt'));
  strip('core', 2.3, 4.46, (x) => cw(x) - 0.025, cw, 4, 10, () => id('bypass'), CUT_CORE);
  strip('core', 2.3, 4.46, oc, (x) => oc(x) + 0.035, 4, 1, corePart, CUT_CORE);
  // Turbina de baixa: pele e carcaça unidas no bocal do núcleo
  revolve(M('lpt'), [...S(cw, 4.46, g.CORE_NOZ, 20).map((p) => [p[0], p[1], 10]), [g.CORE_NOZ, oc(g.CORE_NOZ)], ...S(oc, g.CORE_NOZ, 4.46, 20).map((p) => [p[0], p[1], 4]),
    [4.46, oc(4.46) + 0.035], ...S((x) => oc(x) + 0.035, 4.46, 5.62, 14).map((p) => [p[0], p[1], 1]), [5.62, cw(5.62) - 0.025], ...S((x) => cw(x) - 0.025, 5.62, 4.46, 14).map((p) => [p[0], p[1], 4])], { mat: 1, part: id('lpt'), cap: 0, cut: CUT_CORE }, { segs: 64 });
  // Tambores (giram) e paredes internas fixas do núcleo
  const ic = g.inC, drum = (mod, spin, x0, x1, part, mat = 11) => revolve(M(mod, spin), [...S(ic, x0, x1, 14), [x1, 0.2], [x0, 0.2]], { mat, part: id(part), cap: 2, cut: DEEP }, { segs: 56 });
  drum('fan', 'lp', 1.15, 2.04, 'lpc'); drum('core', 's', 2.04, 2.62, 'hpc', 4); drum('core', 'hp', 2.62, 3.6, 'hpc');
  drum('core', 's', 3.6, 4.08, 'comb', 4); drum('core', 'hp', 4.08, 4.46, 'hpt'); drum('lpt', 'lp', 4.46, 5.5, 'lpt'); drum('lpt', 's', 5.5, 5.8, 'nozzle', 4);
  revolve(M('lpt'), [[g.CORE_NOZ, 0], ...S(ic, g.CORE_NOZ, 6.7, 16)], { mat: 0, part: id('nozzle') }, { segs: 56 });
  // Eixos concêntricos
  revolve(M('lpt', 'lp'), [[0.95, 0], [0.95, g.SHAFT.lp], [5.65, g.SHAFT.lp], [5.65, 0]], { mat: 0, part: id('lpshaft') }, { segs: 32 });
  revolve(M('core', 'hp'), [[2.62, 0.12], [2.62, g.SHAFT.hp], [4.42, g.SHAFT.hp], [4.42, 0.12]], { mat: 11, part: id('hpshaft'), cap: 2, cut: DEEP }, { segs: 40 });
  for (const [x, s] of g.BRG) {
    const r = g.SHAFT[s] + 0.028, mod = x < 1.3 ? 'fan' : x < 4.46 ? 'core' : 'lpt';
    revolve(M(mod), [[x - 0.045, r - 0.035], [x + 0.045, r - 0.035], [x + 0.045, r + 0.035], [x - 0.045, r + 0.035]], { mat: 7, part: id('mancal'), cap: 2, cut: DEEP }, { segs: 40 });
  }
  // Câmara de combustão: revestimentos (acesos por dentro), domo e injetores
  const linO = (x) => lerp(0.396, 0.4, (x - 3.69) / 0.375) + 0.02 * Math.sin(clamp((x - 3.69) / 0.375, 0, 1) * Math.PI);
  const linI = (x) => lerp(0.302, 0.316, (x - 3.69) / 0.375) - 0.016 * Math.sin(clamp((x - 3.69) / 0.375, 0, 1) * Math.PI);
  const cm = { part: id('comb'), cap: 1, cut: CUT_CORE };
  revolve(M('core'), [...S(linO, 3.69, 4.065, 14).map((p) => [p[0], p[1], 6]), ...S((x) => linO(x) + 0.008, 4.065, 3.69, 14).map((p) => [p[0], p[1], 1])], { ...cm, mat: 1 }, { segs: 64 });
  revolve(M('core'), [...S((x) => linI(x) - 0.008, 3.69, 4.065, 14).map((p) => [p[0], p[1], 1]), ...S(linI, 4.065, 3.69, 14).map((p) => [p[0], p[1], 6])], { ...cm, mat: 1 }, { segs: 64 });
  revolve(M('core'), [[3.66, 0.30], [3.69, 0.302], [3.69, 0.33], [3.67, 0.335], [3.67, 0.365], [3.69, 0.37], [3.69, 0.396], [3.66, 0.398]], { ...cm, mat: 0 }, { segs: 64 });
  const NOZ = 22;
  for (let j = 0; j < NOZ; j++) {
    const t = (j + 0.5) / NOZ * TAU, fm = { mat: 0, part: id('fuel') };
    const path = [[3.585, 0.6], [3.585, 0.52], [3.59, 0.45], [3.605, 0.395], [3.63, 0.362], [3.66, 0.352]].map(([x, r]) => P3(x, r, t));
    tube(M('core'), path, 0.008, fm, 8);
    tube(M('core'), [P3(3.585, 0.462, t), P3(3.585, 0.486, t)], 0.024, { mat: 0, part: id('fuel') }, 10); // flange
    tube(M('core'), [P3(3.655, 0.352, t), P3(3.692, 0.352, t)], 0.017, { mat: 0, part: id('fuel') }, 10); // turbilhonador
    tube(M('core'), [P3(3.585, 0.6, t), P3(3.585, 0.625, t)], 0.012, { mat: 7, part: id('fuel') }, 8); // conexão
  }
  // Anel de combustível em volta da carcaça
  tube(M('core'), Array.from({ length: 97 }, (_, i) => P3(3.585, 0.625, i / 96 * TAU)), 0.012, { mat: 0, part: id('fuel') }, 8, false);
  tube(M('core'), Array.from({ length: 97 }, (_, i) => P3(3.535, 0.6, i / 96 * TAU)), 0.008, { mat: 7, part: id('fuel') }, 6, false);
  // Tubos e válvulas em cima da carcaça do fan
  const topR = (x) => g.caseIn(x) + caseTh(x) + 0.02;
  for (const [x, a0, a1, rr] of [[0.82, -10, 70, 0.016], [0.95, -6, 60, 0.012], [1.12, -12, 80, 0.018]]) tube(M('case'), Array.from({ length: 31 }, (_, i) => P3(x, topR(x) + 0.01, lerp(a0, a1, i / 30) * D2R)), rr, { mat: 0, part: id('fancase') }, 8);
  for (const [x, a] of [[0.88, 18], [1.05, 42]]) {
    const t = a * D2R;
    tube(M('case'), [P3(x, topR(x), t), P3(x, topR(x) + 0.08, t)], 0.03, { mat: 0, part: id('fancase') }, 12);
    tube(M('case'), [P3(x, topR(x) + 0.08, t), P3(x, topR(x) + 0.1, t)], 0.04, { mat: 7, part: id('fancase') }, 12);
  }
  // Caixa de acessórios embaixo, com bombas, gerador, tanque de óleo e tubos
  const agb = { mat: 1, part: id('agb') }, gA = 122 * D2R, gB = 150 * D2R;
  revolve(M('case'), [[1.65, 1.385], [2.45, 1.385], [2.45, 1.52], [1.65, 1.52]], { ...agb, cap: 2 }, { a0: gA, a1: gB, segs: 10 });
  revolve(M('case'), [[1.72, 1.39], [2.1, 1.39], [2.1, 1.5], [1.72, 1.5]], { mat: 13, part: id('agb'), cap: 2 }, { a0: 154 * D2R, a1: 166 * D2R, segs: 4 });
  for (const [a, r, x1, rad, mat] of [[126, 1.45, 2.66, 0.035, 0], [136, 1.455, 2.78, 0.058, 13], [146, 1.45, 2.6, 0.03, 0]]) {
    const t = a * D2R;
    tube(M('case'), [P3(2.45, r, t), P3(x1, r, t)], rad, { mat, part: id('agb') }, 14);
    tube(M('case'), [P3(x1, r, t), P3(x1 + 0.025, r, t)], rad * 0.6, { mat: 0, part: id('agb') }, 12);
  }
  tube(M('case'), [P3(2.3, 1.53, 140 * D2R), P3(2.3, 1.56, 140 * D2R)], 0.02, { mat: 12, part: id('agb') }, 10);
  for (const [a, dr] of [[124, 0], [131, 0.02], [143, 0.01]]) {
    const t = a * D2R;
    tube(M('case'), [[1.65, 1.47 + dr, 0], [1.5, 1.49 + dr, 0], [1.2, 1.5 + dr, 0], [0.95, 1.5 + dr, 0]].map(([x, r]) => P3(x, r, t)), 0.01, { mat: 0, part: id('agb') }, 6);
    tube(M('case'), [[2.45, 1.5 + dr, 0], [2.7, 1.52 + dr, 0], [3.0, 1.48 + dr, 0]].map(([x, r]) => P3(x, r, t + 0.05)), 0.009, { mat: 0, part: id('agb') }, 6);
  }
  // Válvula de sangria (VBV): portinhas entre o booster e o compressor de alta
  for (let j = 0; j < 12; j++) { const t = (j + 0.5) / 12 * TAU; box(M('fan'), P3(2.1, g.outC(2.1) + 0.045, t), [0.05, 0, 0], scl([0, Math.cos(t), Math.sin(t)], 0.01), scl([0, -Math.sin(t), Math.cos(t)], 0.07), { mat: 7, part: id('vbv') }); }
  return groups;
}

/* ---------- Peças separadas (galeria) ---------- */
function buildPieces(g) {
  const out = {}, P = (k) => (out[k] = new Mesh());
  const fanRow = g.ROWS.find((r) => r.fan);
  bladeRow(P('fan'), fanRow, { mat: 2 }, { n: 18, only: [0] });
  box(out.fan, [0.96, 0.33, 0], [0.11, 0, 0], [0, 0.03, 0], [0, 0, 0.05], { mat: 0 });
  box(out.fan, [0.96, 0.29, 0], [0.09, 0, 0], [0, 0.02, 0], [0, 0, 0.025], { mat: 0 });
  const ic = g.inC;
  revolve(P('hpc'), [...S(ic, 2.62, 3.6, 14), [3.6, 0.2], [2.62, 0.2]], { mat: 11 }, { segs: 56 });
  revolve(out.hpc, [[2.45, 0], [2.45, 0.1], [2.62, 0.12], [2.62, 0]], { mat: 0 }, { segs: 32 });
  revolve(out.hpc, [[3.6, 0], [3.6, 0.12], [3.8, 0.1], [3.8, 0]], { mat: 0 }, { segs: 32 });
  for (const rw of g.ROWS) if (rw.part === 'hpc' && rw.kind === 'r') bladeRow(out.hpc, rw, { mat: 2 }, { n: 44 });
  const t = 0;
  tube(P('fuel'), [[3.585, 0.6], [3.585, 0.52], [3.59, 0.45], [3.605, 0.395], [3.63, 0.362], [3.66, 0.352]].map(([x, r]) => P3(x, r, t)), 0.017, { mat: 0 }, 12);
  tube(out.fuel, [P3(3.585, 0.462, t), P3(3.585, 0.49, t)], 0.035, { mat: 0 }, 16);
  tube(out.fuel, [P3(3.655, 0.352, t), P3(3.7, 0.352, t)], 0.024, { mat: 0 }, 16);
  tube(out.fuel, [P3(3.585, 0.6, t), P3(3.585, 0.63, t)], 0.018, { mat: 7 }, 12);
  const linO = (x) => 0.398 + 0.02 * Math.sin((x - 3.69) / 0.375 * Math.PI), linI = (x) => 0.305 - 0.016 * Math.sin((x - 3.69) / 0.375 * Math.PI);
  revolve(P('comb'), [...S(linO, 3.69, 4.065, 14).map((p) => [p[0], p[1], 6]), ...S((x) => linO(x) + 0.01, 4.065, 3.69, 14)], { mat: 0 }, { segs: 72, a0: 0.3, a1: TAU - 0.3 });
  revolve(out.comb, [...S((x) => linI(x) - 0.01, 3.69, 4.065, 14), ...S(linI, 4.065, 3.69, 14).map((p) => [p[0], p[1], 6])], { mat: 0 }, { segs: 72, a0: 0.3, a1: TAU - 0.3 });
  revolve(out.comb, [[3.66, 0.30], [3.69, 0.302], [3.69, 0.396], [3.66, 0.398]], { mat: 1 }, { segs: 72, a0: 0.3, a1: TAU - 0.3 });
  const hr = g.ROWS.find((r) => r.part === 'hpt' && r.kind === 'r');
  bladeRow(P('hpt'), hr, { mat: 8 }, { n: 30, only: [0], rh: 0.31, rt: 0.44, plain: true });
  const xh = hr.x + hr.c / 2;
  box(out.hpt, [xh, 0.3, 0], [0.045, 0, 0], [0, 0.008, 0], [0, 0, 0.03], { mat: 8 });
  for (let i = 0; i < 4; i++) box(out.hpt, [xh, 0.285 - i * 0.016, 0], [0.04, 0, 0], [0, 0.007, 0], [0, 0, 0.018 - i * 0.003], { mat: 8 });
  const lr = g.ROWS.find((r) => r.part === 'lpt' && r.kind === 'r');
  bladeRow(P('lpt'), lr, { mat: 8 }, { n: 64, plain: true });
  revolve(out.lpt, [[lr.x - 0.03, 0.12], [lr.x + 0.09, 0.12], [lr.x + 0.09, lr.hub(lr.x)], [lr.x - 0.03, lr.hub(lr.x)]], { mat: 11 }, { segs: 56 });
  revolve(out.lpt, [[lr.x - 0.25, 0.05], [lr.x + 0.06, 0.05], [lr.x + 0.06, 0.13], [lr.x - 0.25, 0.08]], { mat: 0 }, { segs: 40 });
  revolve(P('mancal'), [[-0.03, 0.2], [0.03, 0.2], [0.03, 0.23], [-0.03, 0.23]], { mat: 0 }, { segs: 56 });
  revolve(out.mancal, [[-0.03, 0.3], [0.03, 0.3], [0.03, 0.33], [-0.03, 0.33]], { mat: 0 }, { segs: 56 });
  for (let i = 0; i < 14; i++) sphere(out.mancal, P3(0, 0.265, i / 14 * TAU), 0.034, { mat: 0 }, 10);
  return out;
}

/* ---------- WebGL ---------- */
const VS = `
attribute vec3 aP; attribute vec3 aN; attribute vec4 aM; attribute vec4 aC;
uniform mat4 uProj, uView, uRot, uOff; uniform mat3 uNM;
uniform vec4 uMats[14]; uniform vec3 uCaps[5];
varying vec3 vE; varying vec3 vN; varying vec3 vTint; varying vec3 vCap; varying vec4 vInfo; varying vec3 vCut;
void main() {
  vec4 e = uRot * vec4(aP, 1.0); vE = e.xyz;
  gl_Position = uProj * uView * uOff * e;
  vN = uNM * aN;
  vec4 mt = uMats[int(aM.x + 0.5)];
  vTint = mt.rgb; vCap = uCaps[int(aC.w + 0.5)];
  vInfo = vec4(mod(mt.w, 10.0), step(9.5, mt.w), aM.y, aM.z);
  vCut = aC.xyz;
}`;
const FS = `
precision highp float;
uniform sampler2D uTex; uniform vec4 uCut; uniform vec4 uDoor; uniform float uDeep, uHlOn, uTime, uHeat, uAlpha; uniform float uHl[4];
varying vec3 vE; varying vec3 vN; varying vec3 vTint; varying vec3 vCap; varying vec4 vInfo; varying vec3 vCut;
vec3 mc(float tile, vec2 uv) { vec2 o = vec2(mod(tile, 2.0), floor(tile / 2.0)) * 0.5; return texture2D(uTex, o + uv * 0.5).rgb; }
void main() {
  float th = atan(vE.z, vE.y), m = vCut.z;
  bool inX = vE.x > vCut.x && vE.x < vCut.y, inMain = th > uCut.x && th < uCut.y;
  if (inX && inMain && ((m > 0.5 && m < 1.5) || m > 2.5 || (m > 1.5 && m < 2.5 && uDeep > 0.5))) discard;
  if (m > 2.5 && th > uDoor.x && th < uDoor.y && vE.x > uDoor.z && vE.x < uDoor.w) discard;
  vec3 n = normalize(vN), col;
  bool hit = false;
  for (int i = 0; i < 4; i++) if (abs(vInfo.z - uHl[i]) < 0.5 && uHl[i] > 0.5) hit = true;
  if (!gl_FrontFacing && vInfo.y < 0.5) {
    col = vCap * (0.9 + 0.1 * abs(n.z)); // face do corte
  } else {
    if (!gl_FrontFacing) n = -n;
    vec2 uv = clamp(n.xy * 0.49 + 0.5, 0.01, 0.99);
    float tile = floor(vInfo.x + 0.5); // arredonda: o valor interpolado varia um pouco de pixel para pixel
    if (tile > 3.5 && tile < 4.5) {
      float f = 0.5 + 0.5 * sin(uTime * 13.0 + vE.x * 60.0 + th * 9.0) * sin(uTime * 7.0 + th * 5.0);
      col = mix(vec3(1.0, 0.38, 0.06), vec3(1.0, 0.88, 0.4), f) * (0.6 + 0.55 * uHeat);
    } else {
      col = mc(tile > 4.5 ? 0.0 : tile, uv) * vTint;
      col = mix(col, mc(0.0, uv) * 1.05, vInfo.w);
      if (tile > 4.5) col += vec3(1.0, 0.36, 0.1) * uHeat * 0.3 * smoothstep(5.6, 4.1, vE.x);
      col *= 0.6 + 0.4 * smoothstep(0.0, 0.55, abs(n.z));
    }
  }
  if (uHlOn > 0.5) { if (hit) col += vec3(0.95, 0.2, 0.55) * (0.04 + 0.04 * sin(uTime * 4.0) + 0.55 * pow(1.0 - abs(n.z), 3.0)); else col *= 0.78; }
  gl_FragColor = vec4(col * uAlpha, uAlpha);
}`;
const VS_S = `
attribute vec3 aA; attribute vec3 aB; attribute vec2 aSE; attribute vec4 aCol; attribute float aW;
uniform mat4 uPV; uniform vec2 uRes; varying vec4 vCol; varying float vS;
void main() {
  vec4 a = uPV * vec4(aA, 1.0), b = uPV * vec4(aB, 1.0);
  vec2 d = (b.xy / b.w - a.xy / a.w) * uRes; float l = length(d); d = l > 1e-5 ? d / l : vec2(1.0, 0.0);
  vec4 p = mix(a, b, aSE.y); p.xy += vec2(-d.y, d.x) * aSE.x * aW / uRes * p.w;
  gl_Position = p; vCol = vec4(aCol.rgb, aCol.a * (0.15 + 0.85 * aSE.y)); vS = aSE.x;
}`;
const FS_S = `precision mediump float; varying vec4 vCol; varying float vS; void main() { float a = vCol.a * (1.0 - vS * vS); gl_FragColor = vec4(vCol.rgb * a, a); }`;
const VS_G = `attribute vec2 aQ; uniform mat4 uPV; uniform vec4 uS; uniform float uY; varying vec2 vQ;
void main() { vQ = aQ; gl_Position = uPV * vec4(uS.x + aQ.x * uS.z, uY, uS.y + aQ.y * uS.w, 1.0); }`;
const FS_G = `precision mediump float; varying vec2 vQ; uniform float uA;
void main() { float a = uA * (1.0 - smoothstep(0.0, 1.0, length(vQ))); gl_FragColor = vec4(0.0, 0.0, 0.0, a); }`;

function program(gl, vs, fs) {
  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
  const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  const u = {}, a = {};
  for (let i = 0; i < gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); i++) { const n = gl.getActiveUniform(p, i).name.replace('[0]', ''); u[n] = gl.getUniformLocation(p, n); }
  for (let i = 0; i < gl.getProgramParameter(p, gl.ACTIVE_ATTRIBUTES); i++) { const n = gl.getActiveAttrib(p, i).name; a[n] = gl.getAttribLocation(p, n); }
  return { p, u, a };
}
// Matcap: a cor de cada direção da superfície, como uma esfera fotografada no estúdio (4 quadros: cromado, acetinado, preto brilhante, pintura)
function matcapCanvas() {
  const T = 256, c = document.createElement('canvas'); c.width = c.height = T * 2;
  const x = c.getContext('2d'), img = x.createImageData(T * 2, T * 2), L = norm([-0.45, 0.62, 0.65]), L2 = norm([0.6, 0.3, 0.75]);
  const sm = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  for (let tile = 0; tile < 4; tile++) {
    const ox = (tile % 2) * T, oy = (1 - Math.floor(tile / 2)) * T;
    for (let py = 0; py < T; py++) for (let px = 0; px < T; px++) {
      let nx = (px + 0.5 - T / 2) / (T / 2), ny = -(py + 0.5 - T / 2) / (T / 2);
      const d2 = nx * nx + ny * ny; if (d2 > 1) { const l = Math.sqrt(d2); nx /= l; ny /= l; }
      const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny)), R = [2 * nz * nx, 2 * nz * ny, 2 * nz * nz - 1];
      const dif = Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]), spc = Math.max(0, dot(R, L)), spc2 = Math.max(0, dot(R, L2)), rim = Math.pow(1 - nz, 2.5);
      let v;
      if (tile === 0) { // cromado: céu claro, faixa escura no horizonte, chão médio
        const sky = 0.78 + 0.22 * sm(0.1, 0.9, R[1]), gnd = 0.42 + 0.12 * sm(-1, -0.2, -R[1]), hz = 0.2;
        v = R[1] > 0.12 ? lerp(hz, sky, sm(0.12, 0.3, R[1])) : R[1] > -0.1 ? hz : lerp(hz, gnd, sm(-0.1, -0.3, R[1]));
        v += Math.pow(spc, 30) * 0.5 + Math.pow(spc2, 14) * 0.25; v = [v, v * 1.01, v * 1.04];
      } else if (tile === 1) { const s = 0.3 + 0.62 * dif + Math.pow(spc, 18) * 0.35 + rim * 0.12; v = [s, s * 1.005, s * 1.02]; }
      else if (tile === 2) { const s = 0.03 + 0.05 * dif + Math.pow(spc, 50) * 0.95 + Math.pow(spc, 8) * 0.12 + Math.pow(spc2, 20) * 0.35 + rim * 0.2; v = [s, s * 1.02, s * 1.06]; }
      else { const s = 0.28 + 0.68 * dif + Math.pow(spc, 28) * 0.3; v = [s, s, s]; }
      const k = ((oy + py) * T * 2 + ox + px) * 4;
      img.data[k] = clamp(v[0], 0, 1) * 255; img.data[k + 1] = clamp(v[1], 0, 1) * 255; img.data[k + 2] = clamp(v[2], 0, 1) * 255; img.data[k + 3] = 255;
    }
  }
  x.putImageData(img, 0, 0);
  return c;
}

function createGL(canvas, opts = {}) {
  const gl = canvas.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: true, preserveDrawingBuffer: !!opts.keep });
  if (!gl) return null;
  const main = program(gl, VS, FS);
  const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, matcapCanvas());
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const upload = (mesh) => { const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.d), gl.STATIC_DRAW); return { b, n: mesh.d.length / STRIDE }; };
  function useMain(P, V, u = {}) {
    gl.useProgram(main.p);
    const U = main.u;
    gl.uniformMatrix4fv(U.uProj, false, P); gl.uniformMatrix4fv(U.uView, false, V);
    gl.uniform4fv(U.uMats, MATS.flat()); gl.uniform3fv(U.uCaps, CAPS.flat());
    gl.uniform4fv(U.uCut, u.cut || [9, 9, 0, 0]); gl.uniform4fv(U.uDoor, u.door || [9, 9, 0, 0]);
    gl.uniform1f(U.uDeep, u.deep || 0); gl.uniform1f(U.uTime, u.time || 0); gl.uniform1f(U.uHeat, u.heat ?? 0.8);
    const hl = (u.hl || []).concat([0, 0, 0, 0]).slice(0, 4); gl.uniform1fv(U.uHl, hl); gl.uniform1f(U.uHlOn, u.hl && u.hl.length ? 1 : 0);
    gl.uniform1f(U.uAlpha, 1);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex); gl.uniform1i(U.uTex, 0);
  }
  function drawMesh(buf, V, rot, off) {
    const U = main.u, A = main.a;
    gl.uniformMatrix4fv(U.uRot, false, rot); gl.uniformMatrix4fv(U.uOff, false, off);
    gl.uniformMatrix3fv(U.uNM, false, n3(mul(V, rot)));
    gl.bindBuffer(gl.ARRAY_BUFFER, buf.b);
    const at = (n, size, o) => { if (A[n] < 0 || A[n] === undefined) return; gl.enableVertexAttribArray(A[n]); gl.vertexAttribPointer(A[n], size, gl.FLOAT, false, STRIDE * 4, o * 4); };
    at('aP', 3, 0); at('aN', 3, 3); at('aM', 4, 6); at('aC', 4, 10);
    gl.drawArrays(gl.TRIANGLES, 0, buf.n);
  }
  return { gl, main, upload, useMain, drawMesh };
}

/* ---------- Motor completo na tela ---------- */
function create(canvas, g) {
  let R;
  try { R = createGL(canvas); } catch (e) { console.warn('Motor 3D indisponível', e); return null; }
  if (!R) return null;
  const { gl } = R;
  const groups = buildEngine(g), bufs = {};
  for (const [k, m] of Object.entries(groups)) bufs[k] = R.upload(m);
  const streak = program(gl, VS_S, FS_S), ground = program(gl, VS_G, FS_G);
  const sbuf = gl.createBuffer(), gbuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, gbuf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1]), gl.STATIC_DRAW);
  let W = 1, H = 1, dpr = 1, Pm = I4, Vm = I4, PV = I4, eye = [0, 0, 0];

  // Ar: cada partícula segue o caminho do 2D (x, r) num ângulo fixo em volta do eixo, quase todas dentro do corte para aparecerem
  const air = [];
  const mk = (s, n) => {
    for (let i = 0; i < n; i++) {
      const f = 0.06 + Math.random() * 0.88, F = s === 'c' ? g.FSPLIT * f : s === 'b' ? g.FSPLIT + (1 - g.FSPLIT) * f : Math.random();
      const th = s === 'o' ? lerp(20, 80, Math.random()) * D2R : s === 'c' || Math.random() < 0.85 ? lerp(-4, 94, Math.random()) * D2R : Math.random() * TAU;
      air.push({ s, f, F, side: 1, th, x: g.X0 + Math.random() * (g.X1 - g.X0) });
    }
  };
  mk('b', 300); mk('c', 340); mk('o', 40);
  const flames = Array.from({ length: 160 }, () => ({ u: Math.random(), th: lerp(-4, 94, Math.random()) * D2R, r: 0.35 + (Math.random() - 0.5) * 0.05 }));
  const sdata = new Float32Array((air.length + flames.length + 40) * 6 * 12);

  function resize(w, h, d) {
    W = w; H = h; dpr = d;
    canvas.width = Math.round(w * d); canvas.height = Math.round(h * d);
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
  }
  function camera(c) {
    const ce = Math.cos(c.el * D2R), dir = [-ce * Math.cos(c.az * D2R), Math.sin(c.el * D2R), ce * Math.sin(c.az * D2R)];
    eye = add(c.at, scl(dir, c.dist));
    Pm = persp(30 * D2R, W / H, 0.05, 80); Vm = lookAt(eye, c.at, [0, 1, 0]); PV = mul(Pm, Vm);
  }
  // Ponto 3D (no sistema do motor, com o deslocamento do módulo) → tela
  function project(p, offX = 0) {
    const q = xform(PV, [p[0] + offX, p[1], p[2]]);
    if (q[3] <= 0.01) return null;
    return [(q[0] / q[3] * 0.5 + 0.5) * W, (1 - (q[1] / q[3] * 0.5 + 0.5)) * H, q[3]];
  }
  function render(st) {
    camera(st.cam);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE);
    // Sombra no chão
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
    gl.useProgram(ground.p);
    gl.uniformMatrix4fv(ground.u.uPV, false, PV); gl.uniform4fv(ground.u.uS, st.shadow || [3.2 + st.ex * 1.0, 0, 5.2 + st.ex * 2.5, 2.1]); gl.uniform1f(ground.u.uY, -1.9); gl.uniform1f(ground.u.uA, st.dark ? 0.5 : 0.22);
    gl.bindBuffer(gl.ARRAY_BUFFER, gbuf); gl.enableVertexAttribArray(ground.a.aQ); gl.vertexAttribPointer(ground.a.aQ, 2, gl.FLOAT, false, 8, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6); gl.disableVertexAttribArray(ground.a.aQ);
    gl.depthMask(true); gl.disable(gl.BLEND);
    // Peças
    R.useMain(Pm, Vm, { cut: [-8 * D2R, 98 * D2R, 0, 0], door: [108 * D2R, 166 * D2R, 1.55, 3.1], deep: st.deep, time: st.time, heat: 0.35 + 0.65 * st.sp, hl: st.hl });
    for (const [k, b] of Object.entries(bufs)) {
      const [mod, spin] = k.split(':');
      if (st.only && mod !== st.only) continue;
      const rot = spin === 'lp' ? rotX(st.phLP) : spin === 'hp' ? rotX(st.phHP) : I4;
      R.drawMesh(b, Vm, rot, transl(MOD[mod] * st.ex, 0, 0));
    }
    for (const k of ['aP', 'aN', 'aM', 'aC']) if (R.main.a[k] >= 0) gl.disableVertexAttribArray(R.main.a[k]);
    drawAir(st);
  }
  function drawAir(st) {
    const fade = 1 - clamp(st.ex * 3, 0, 1);
    if (fade < 0.02 || !st.showAir) return;
    let n = 0;
    const put = (A, B, col, a) => {
      for (const [s, e] of [[-1, 0], [1, 0], [1, 1], [-1, 0], [1, 1], [-1, 1]]) { sdata.set([A[0], A[1], A[2], B[0], B[1], B[2], s, e, col[0], col[1], col[2], a], n * 12); n++; }
    };
    const U = (0.3 + 1.4 * st.sp) * (st.slow ? 0.3 : 1), dt = st.dt;
    const wpx = clamp(H / 260, 1.4, 3.2) * dpr;
    for (const p of air) {
      const v = U * g.velOf(p, p.x);
      p.x += v * dt;
      if (p.x > g.X1) { p.x = g.X0 + Math.random() * 0.3; }
      const L = clamp(0.12 * v + 0.04, 0.05, 0.34), xa = p.x - L;
      const ra = g.pathY(p, xa), rb = g.pathY(p, p.x);
      const T = g.tempOf(p, p.x), col = g.tempRGB(T), hot = T > 400;
      const al = (p.s === 'o' ? 0.25 : hot ? 0.95 : p.x < 0.85 ? 0.16 : 0.7) * fade * (p.x > 7 ? clamp((7.6 - p.x) / 0.6, 0, 1) : 1);
      put(P3(xa, ra, p.th), P3(p.x, rb, p.th), col, al);
    }
    const nAir = n;
    // Chama dentro da câmara (somada à luz)
    const fl = 0.35 + 0.65 * st.sp;
    for (const f of flames) {
      f.u += dt * U * 1.2 * (0.6 + Math.random() * 0.8);
      if (f.u > 1) { f.u = 0; f.th = lerp(-4, 94, Math.random()) * D2R; f.r = 0.35 + (Math.random() - 0.5) * 0.05; }
      const x = 3.7 + f.u * 0.36, r = f.r + Math.sin(st.time * 9 + f.th * 20) * 0.01;
      const col = f.u < 0.12 ? [0.45, 0.5, 1] : f.u < 0.25 ? [0.8, 0.45, 1] : f.u < 0.6 ? [1, 0.9, 0.5] : [1, 0.55, 0.15];
      put(P3(x - 0.05, r, f.th), P3(x, r, f.th), col, 0.32 * fl * fade);
    }
    // Brilho do jato quente na saída
    for (let i = 0; i < 24; i++) {
      const th = i / 24 * TAU + st.time * 0.3, x = 5.9 + ((st.time * 0.8 + i * 0.37) % 1.6);
      put(P3(x - 0.3, 0.22, th), P3(x, 0.26 + (x - 5.9) * 0.08, th), [1, 0.45, 0.15], 0.18 * fl * fade * (1 - (x - 5.9) / 1.6));
    }
    gl.useProgram(streak.p);
    gl.uniformMatrix4fv(streak.u.uPV, false, PV); gl.uniform2fv(streak.u.uRes, [canvas.width, canvas.height]);
    gl.bindBuffer(gl.ARRAY_BUFFER, sbuf); gl.bufferData(gl.ARRAY_BUFFER, sdata.subarray(0, n * 12), gl.DYNAMIC_DRAW);
    const A = streak.a, at = (k, s, o) => { gl.enableVertexAttribArray(A[k]); gl.vertexAttribPointer(A[k], s, gl.FLOAT, false, 48, o * 4); };
    // Cada vértice: ponta A, ponta B, lado/ponta, cor com transparência; a largura é igual para cada lote
    at('aA', 3, 0); at('aB', 3, 3); at('aSE', 2, 6); at('aCol', 4, 8);
    gl.vertexAttrib1f(A.aW, wpx);
    gl.enable(gl.BLEND); gl.depthMask(false);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.drawArrays(gl.TRIANGLES, 0, nAir);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.vertexAttrib1f(A.aW, wpx * 4); gl.drawArrays(gl.TRIANGLES, nAir, flames.length * 6);
    gl.vertexAttrib1f(A.aW, wpx * 14); gl.drawArrays(gl.TRIANGLES, nAir + flames.length * 6, n - nAir - flames.length * 6);
    gl.depthMask(true); gl.disable(gl.BLEND);
    for (const k of ['aA', 'aB', 'aSE', 'aCol']) gl.disableVertexAttribArray(A[k]);
  }
  const tris = Object.values(bufs).reduce((s, b) => s + b.n / 3, 0);
  return { render, resize, project, MOD, tris };
}

/* ---------- Galeria: cada peça em 3D, girando devagar ---------- */
function createPieces(g) {
  const cv = document.createElement('canvas');
  let R;
  try { R = createGL(cv, { keep: true }); } catch (e) { return null; }
  if (!R) return null;
  const { gl } = R, meshes = buildPieces(g), bufs = {}, box3 = {};
  for (const [k, m] of Object.entries(meshes)) {
    bufs[k] = R.upload(m);
    let lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
    for (let i = 0; i < m.d.length; i += STRIDE) for (let a = 0; a < 3; a++) { lo[a] = Math.min(lo[a], m.d[i + a]); hi[a] = Math.max(hi[a], m.d[i + a]); }
    box3[k] = { c: scl(add(lo, hi), 0.5), r: Math.hypot(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]) / 2 };
  }
  return {
    has: (k) => !!bufs[k],
    render(k, w, h, d, t) {
      if (!bufs[k]) return null;
      if (cv.width !== Math.round(w * d) || cv.height !== Math.round(h * d)) { cv.width = Math.round(w * d); cv.height = Math.round(h * d); }
      gl.viewport(0, 0, cv.width, cv.height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); gl.enable(gl.DEPTH_TEST);
      const b = box3[k], face = k === 'fan' || k === 'hpt' || k === 'fuel', az = (face ? 92 : 38) + Math.sin(t * 0.4) * (face ? 35 : 25), el = face ? 8 : 16;
      const ce = Math.cos(el * D2R), dist = b.r / Math.sin(15 * D2R) * 0.82, eye = add(b.c, scl([-ce * Math.cos(az * D2R), Math.sin(el * D2R), ce * Math.sin(az * D2R)], dist));
      const Pm = persp(30 * D2R, w / h, 0.02, 40), Vm = lookAt(eye, b.c, [0, 1, 0]);
      R.useMain(Pm, Vm, { time: t, heat: 0.7 });
      const spin = k === 'lpt' || k === 'hpc' || k === 'mancal' ? rotX(t * 0.6) : I4;
      R.drawMesh(bufs[k], Vm, spin, I4);
      return cv;
    },
  };
}

window.Motor3D = { create, createPieces };
})();
