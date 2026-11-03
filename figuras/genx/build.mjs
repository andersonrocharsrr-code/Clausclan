// Fig: o motor GEnx-2B do Boeing 747-8, sem a nacele, num suporte de transporte.
// Construído com a skill Anatomy (MIT), seguindo o exemplo do Raptor: peças torneadas (kit/lathe),
// tubos e cabos (kit/tube), ordem de pintura medida (A.settle) e auditoria (node build.mjs --audit).
// Ao tocar, o motor se desmonta em módulos, como na manutenção: o cone e o fan saem para a frente,
// as carcaças do compressor, da câmara e das turbinas sobem e mostram os rotores, o módulo da
// turbina de baixa recua e a caixa de acessórios desce.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const HERE = dirname(fileURLToPath(import.meta.url));
const KIT = join(HERE, "../../.claude/skills/anatomy");
const k = await import(KIT + "/kit/iso-kit.mjs");
const G = await import(KIT + "/kit/lathe.mjs");
const { tubePieces, tubeSvg } = await import(KIT + "/kit/tube.mjs");
const A = await import(KIT + "/kit/audit.mjs");
const { kitScript } = await import(KIT + "/scripts/inline-kit.mjs");

const THEME = process.argv.includes("--light") ? "light" : "dark";
const DEG = Math.PI / 180;
const W = 760, H = 560;
const Z0 = 100;                                    // altura do eixo do motor
const AX = G.frameOf([0, 0, Z0], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
const on = (s, r, deg) => G.pointOf(AX, s, r, deg * DEG);   // ponto no motor: s ao longo do eixo, r raio, ângulo (0 = +y, 90 = cima)
const LIFT = 46, AFT = 44;

// ---------- Explosão: módulos e para onde vão ----------
const PIECES = {
  spinner: { name: "Cone do fan (spinner)", say: "cone do fan · gira com o eixo de baixa (N1)", move: [-78, 0, 0] },
  fan: { name: "Fan · 18 pás", say: "fan · 18 pás de fibra de carbono com borda de titânio · ~2,7 m", move: [-54, 0, 0] },
  booster: { name: "Booster (compressor de baixa)", say: "booster · 3 estágios, gira junto com o fan", move: [-30, 0, 0] },
  fancase: { name: "Carcaça do fan e palhetas guia", say: "carcaça do fan · segura uma pá que se solte · 44 palhetas guia atrás", move: [0, 0, 0] },
  hpccase: { name: "Carcaça do compressor de alta", say: "carcaça do HPC · anéis que giram as palhetas variáveis", move: [0, 0, LIFT] },
  hpc: { name: "Compressor de alta (rotor)", say: "compressor de alta · 10 estágios · pressão ~23 vezes maior", move: [0, 0, 0] },
  combcase: { name: "Câmara de combustão e injetores", say: "carcaça da câmara · 18 injetores no anel de combustível", move: [0, 0, LIFT] },
  comb: { name: "Câmara de combustão (TAPS)", say: "câmara TAPS · mistura ar e combustível antes da chama", move: [0, 0, 0] },
  hptcase: { name: "Carcaça da turbina de alta", say: "carcaça da HPT · anel de ar que controla a folga das pás", move: [0, 0, LIFT] },
  hpt: { name: "Turbina de alta (rotor)", say: "turbina de alta · 2 estágios · gira o compressor de alta (N2)", move: [0, 0, 0] },
  lptcase: { name: "Carcaça da turbina de baixa", say: "carcaça da LPT · anéis de ar que esfriam a carcaça", move: [AFT, 0, LIFT] },
  lpt: { name: "Turbina de baixa (rotor)", say: "turbina de baixa · 6 estágios · gira o fan e o booster (N1)", move: [AFT, 0, 0] },
  exhaust: { name: "Armação traseira, bocal e cone", say: "armação traseira com o suporte de trás · bocal e cone de escape", move: [AFT + 28, 0, 0] },
  agb: { name: "Caixa de acessórios", say: "caixa de acessórios · bombas de combustível, óleo e hidráulica e gerador", move: [0, 0, -26] },
  eec: { name: "FADEC (EEC) e cabos", say: "FADEC · o computador que controla o motor", move: [0, 0, 0] },
  core: { name: "Armação do fan e eixo", say: "armação do fan, suporte da frente e eixo de baixa", move: [0, 0, 0] },
  stand: { name: "Suporte de transporte", say: "", move: [0, 0, 0] },
};
const STAGGER = ["spinner", "fan", "booster", "agb", "hpccase", "combcase", "hptcase", "lptcase", "lpt", "exhaust"];
const SPRING = { stagger: 0.05, stiffness: 52, damping: 13, substeps: 4 };

// ---------- Câmera ----------
const fitPts = [[-26, 0, Z0], [0, 70, Z0], [0, -70, Z0], [0, 0, Z0 + 70], [40, 0, Z0 - 66], [240, 0, Z0], [-110, 0, Z0], [AFT + 270, 0, Z0], [120, 0, Z0 + 40 + LIFT + 10], [-10, -46, 0], [210, 46, 0], [210, -46, 0], [-10, 46, 0], [76, 0, Z0 - 78]];
const P = k.fitProjection(fitPts, W, H, { pad: 16, azimuth: 146, elevation: 22 });
const V = G.viewOf(P), KS = G.scaleOf(P);
const SIDE = Math.sign(V[1]) || 1;                 // lado do motor que fica de frente para quem olha
const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const Ln = (d, style) => k.lineSvg(d, style);
const Dots = (pts, style) => k.dotsSvg(pts, style);
const FADE = [0.04, 0.42];

const R = A.recorder(P, { order: STAGGER, spring: SPRING });
const { items, nameFor } = R;
const record = R.solid;
function put(piece, ref, svg, { bias = 0, shapes = [], name, route, chunk, ride } = {}) {
  R.put({ piece, ride: ride ?? piece, at: ref, bias, svg, move: PIECES[ride ?? piece].move, shapes, name: name ?? nameFor(`${piece}.item`), route, chunk });
}
const mid = (F, s) => G.pointOf(F, s, 0, 0);

// peça torneada no eixo do motor (ou em outro eixo)
function turned(piece, F, profile, { tone = "hi", inner = "", extra = "", bias = 0, name, smooth, steps, bevel = 0, rims } = {}) {
  const auto = profile.some((p) => p[2]);
  const sm = smooth ?? (auto ? { rows: 4 } : false);
  const paths = G.solidOf(profile, F, P, { bevel, smooth: sm, ...(steps ? { steps } : {}), ...(rims ? { rims } : {}) });
  const id = nameFor(name ?? `${piece}.turned`);
  const shape = record(A.solid(F, profile, { name: id, curve: auto && !(sm && sm.slope) ? profile : undefined }));
  put(piece, mid(F, (profile[0][0] + profile[profile.length - 1][0]) / 2), S(paths, { tone, inner }) + extra, { bias, name: id, shapes: [shape] });
  return shape;
}
// anel (carcaça, flange, faixa) no eixo
function anel(piece, s0, s1, rIn, rOut, { tone = "hi", inner = "", extra = "", bias = 0, name, F = AX, bevel = 0 } = {}) {
  const id = nameFor(name ?? `${piece}.anel`);
  const shape = record(A.ring(F, s0, s1, rIn, rOut, { name: id }));
  put(piece, G.pointOf(F, (s0 + s1) / 2, 0, 0), S(G.ringBand(s0, s1, rIn, rOut, F, P, { bevel }), { tone, inner }) + extra, { bias, name: id, shapes: [shape] });
  return shape;
}
// fileira de pás: um anel com as pás desenhadas como raios na face que se vê
function fileira(piece, s, w, rHub, rTip, count, { tone = "hi", sweep = 0.16, name } = {}) {
  const face = G.dot3(AX.a, V) > 0 ? s + w : s;
  const pas = G.spokesOf(AX, face, rHub + 0.4, rTip - 0.4, count, P, { sweep });
  return anel(piece, s, s + w, rHub, rTip, { tone, name, inner: Ln(pas, { tone: "faint" }) + Ln(G.circleOf(AX, face, rHub + (rTip - rHub) * 0.5, P, 64), { tone: "faint" }) });
}
function caixa(piece, plan, z, h, { tone = "hi", extra = "", bias = 0, name, bevel = 0.5, steps = 3, inner = "" } = {}) {
  const id = nameFor(name ?? `${piece}.caixa`);
  const shape = record(A.slab(plan, z, h, { name: id }, steps));
  put(piece, [plan.x + plan.w / 2, plan.y + plan.d / 2, z + h / 2], S(k.slabOf(plan, z, h, P, steps, bevel), { tone, inner }) + extra, { bias, name: id, shapes: [shape] });
  return shape;
}
function disco(piece, F, s0, s1, r, { tone = "hi", extra = "", bias = 0, name, bevel = 0 } = {}) {
  const id = nameFor(name ?? `${piece}.disco`);
  const shape = record(A.disc(F, s0, s1, r, { name: id }));
  put(piece, G.pointOf(F, (s0 + s1) / 2, 0, 0), S(G.disc(s0, s1, r, F, P, { bevel }), { tone }) + extra, { bias, name: id, shapes: [shape] });
  return shape;
}
function bola(piece, c, r, { tone = "mid", bias = 0, name } = {}) {
  const id = nameFor(name ?? `${piece}.bola`);
  put(piece, c, S(G.sphereOf(c, r, P, { steps: G.stepsFor(r, 24) }), { tone }), { bias, name: id, shapes: [record(A.ball(c, r, { name: id }))] });
}
function tubo(piece, route, r, { name, tone = "hi", bias = 0, gaps = [], closed = false, maxLength = 20, spacing, free = [false, false], limp = false, touch, bundle, rims } = {}) {
  const id = nameFor(name ?? `${piece}.tubo`);
  R.route(id, route, r, { owner: id, touch, bundle, limp, gaps, closed, free, rims, piece, move: PIECES[piece].move, ride: piece });
  tubePieces(route, r, P, { maxLength, spacing: spacing ?? Math.max(0.8, Math.min(2.4, r * 0.2)), closed, gaps }).forEach((part, i) =>
    put(piece, part.mid, tubeSvg(part, { tone }), { bias, name: `${id}:${i}`, route: id, chunk: i, shapes: [A.tube(part.points, part.radii)] }));
  return id;
}
function cano(piece, pts, r, opts = {}) { return tubo(piece, G.fillet(pts, Math.max(r * 2.8, 3), 12, { P, tube: r }), r, opts); }
function cabo(piece, pts, opts = {}) { return tubo(piece, G.fillet(pts, 5, 12, { P, tube: 0.6 }), 0.6, { tone: "mid", limp: true, maxLength: 12, spacing: 1, ...opts }); }

// ================= SUPORTE DE TRANSPORTE =================
const BASE = { x: -14, y: -42, w: 226, d: 84, r: 4 };
for (const y of [-36, 36]) caixa("stand", { x: BASE.x, y: y - 4, w: BASE.w, d: 8, r: 1 }, 10, 6, { tone: "mid", name: "stand.trilho", bevel: 0.6 });
for (const x of [-8, 40, 100, 160, 206]) caixa("stand", { x: x - 3, y: -32, w: 6, d: 64, r: 1 }, 10, 6, { tone: "mid", name: "stand.travessa", bevel: 0.4 });
for (const [x, y] of [[-6, -36], [-6, 36], [204, -36], [204, 36]]) {
  caixa("stand", { x: x - 5, y: y - 5, w: 10, d: 10, r: 1.2 }, 6, 4, { tone: "lo", name: "stand.garfo" });
  const F = G.frameOf([x, y - 3.5, 3.6], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  disco("stand", F, 0, 7, 3.6, { tone: "lo", name: "stand.roda", extra: Ln(G.circleOf(F, G.dot3(F.a, V) > 0 ? 7 : 0, 1.6, P, 16), { tone: "faint" }) });
}
// berço da frente (embaixo da carcaça do fan) e de trás (embaixo da carcaça da turbina de alta)
const FC_R = 63.5, BERCO = [[22, Z0 - FC_R], [124, Z0 - 30.6]];
for (const [x, top] of BERCO) {
  for (const y of [-26, 26]) caixa("stand", { x: x - 3, y: y - 3, w: 6, d: 6, r: 1 }, 16, top - 16 - 4, { tone: "mid", name: "stand.coluna", bevel: 0.3 });
  caixa("stand", { x: x - 6, y: -30, w: 12, d: 60, r: 1.5 }, top - 4, 4, { tone: "mid", name: "stand.berco", bevel: 0.5, extra: Dots([at([x - 3.5, -24, top]), at([x - 3.5, 24, top]), at([x + 3.5, -24, top]), at([x + 3.5, 24, top])], { size: 0.45 }) });
  for (const y of [-26, 26]) caixa("stand", { x: x - 1.5, y: y - 9, w: 3, d: 18, r: 0.6 }, 16, 3, { tone: "lo", name: "stand.mao-francesa" });
}
const halo = `<path class="iso-halo" d="${k.haloOf(BASE, 0, 16, P)}"/>`;

// ================= FAN: CONE, DISCO E 18 PÁS =================
const SP0 = -24, SP1 = 8, SPR = 18.5;
const spR = (s) => SPR * Math.sqrt(Math.max(0, 1 - ((s - SP1) / (SP1 - SP0)) ** 2));
const spSlope = (s) => { const r = spR(s); return r > 0.3 ? (-SPR * SPR * (s - SP1)) / ((SP1 - SP0) ** 2 * r) : 40; };
{
  const prof = Array.from({ length: 22 }, (_, i) => { const s = SP0 + 0.05 + (i / 21) * (SP1 - SP0 - 0.05); return [s, spR(s), i > 0 && i < 21 ? 1 : 0]; });
  prof[0] = [SP0, 0];
  // a espiral pintada (só a parte que se vê) e a ponta de borracha
  const esp = []; for (let j = 0; j <= 50; j++) { const s = SP0 + 2 + j * (SP1 - SP0 - 3) / 50; esp.push(G.pointOf(AX, s, spR(s) + 0.15, (40 + j * 9) * DEG)); }
  const vis = []; let run = []; for (const p of esp) { const n = G.unit3(G.sub3(p, [p[0], 0, Z0])); if (G.dot3(n, V) > 0.12) run.push(p); else if (run.length) { vis.push(run); run = []; } } if (run.length) vis.push(run);
  turned("spinner", AX, prof, { tone: "hi", smooth: { slope: spSlope, rows: 5 }, name: "spinner.cone", extra: vis.map((r) => k.fadeLineSvg(r.map(at), { fade: [3, 3], tone: "lit" })).join("") });
  anel("spinner", SP1 - 0.6, SP1 + 0.8, SPR - 1.5, SPR + 0.4, { tone: "mid", name: "spinner.anel", extra: Dots(G.dotsOf(AX, SP1 - 0.6, SPR - 0.6, 24, P, { fade: FADE }), { size: 0.4 }) });
}
disco("fan", AX, SP1 + 0.8, 22, 18.6, { tone: "mid", name: "fan.disco" });
const BLADES = 18;
for (let i = 0; i < BLADES; i++) {
  const th = (i / BLADES) * 360 + 6;
  const a = [0, Math.cos(th * DEG), Math.sin(th * DEG)], t = [0, -Math.sin(th * DEG), Math.cos(th * DEG)];
  const F = G.frameOf([14.5, 0, Z0], a, [1, 0, 0], t);
  const beta = 58 * DEG, poly = [];
  for (let j = 0; j < 14; j++) { const q = (j / 14) * 2 * Math.PI, x = 8.4 * Math.cos(q), y = 1.15 * Math.sin(q) * (Math.cos(q) > 0 ? 0.7 : 1); poly.push([x * Math.cos(beta) - y * Math.sin(beta), x * Math.sin(beta) + y * Math.cos(beta)]); }
  const id = nameFor("fan.pa");
  put("fan", G.pointOf(F, 38, 0, 0), S(G.prismOf(F, poly, 18.8, 58.9, P), { tone: "hi" }), { name: id, shapes: [record(A.prism(F, poly, 18.8, 58.9, { name: id }))] });
}

// ================= CARCAÇA DO FAN, PALHETAS GUIA E EQUIPAMENTOS =================
anel("fancase", -6, -2, 59.6, 66.5, { tone: "mid", name: "fancase.flange-frente", extra: Dots(G.dotsOf(AX, -6, 64.2, 60, P, { fade: FADE }), { size: 0.4 }) });
anel("fancase", -2, 26, 59.6, 64.4, { tone: "lo", name: "fancase.contencao", inner: Ln([6, 13, 20].map((s) => G.arcOf(AX, s, 64.4, P)).join(""), { tone: "faint" }) });
anel("fancase", 26, 41, 59.6, 63.2, { tone: "mid", name: "fancase.traseira", inner: Ln([29, 33, 37].map((s) => G.arcOf(AX, s, 63.2, P)).join(""), { tone: "faint" }) });
anel("fancase", 31, 32.6, 63.2, 65.4, { tone: "mid", name: "fancase.reforco" });
anel("fancase", 41, 43.5, 59.6, 67, { tone: "mid", name: "fancase.flange-tras", extra: Dots(G.dotsOf(AX, 41, 65.4, 64, P, { fade: FADE }), { size: 0.4 }) });
// palhetas guia (OGV) entre o núcleo e a carcaça
fileira("fancase", 37, 4, 33, 59.6, 44, { tone: "mid", sweep: 0.04, name: "fancase.ogv" });
// FADEC (EEC): caixa com aletas presa na lateral da carcaça, com dois conectores e cabos
const EY = SIDE * 66.6, EEC = { x: 4, y: SIDE > 0 ? EY : EY - 7, w: 20, d: 7, r: 1.2 };
for (const x of [7, 21]) caixa("eec", { x: x - 1.4, y: SIDE > 0 ? 63 : -66.6, w: 2.8, d: 3.6, r: 0.4 }, Z0 - 8, 16, { tone: "lo", name: "eec.suporte" });
caixa("eec", EEC, Z0 - 13, 26, { tone: "hi", name: "eec.caixa", bevel: 0.7, inner: Ln(Array.from({ length: 7 }, (_, i) => k.segment([EEC.x + 3 + i * 2.4, EEC.y + (SIDE > 0 ? EEC.d : 0), Z0 - 11], [EEC.x + 3 + i * 2.4, EEC.y + (SIDE > 0 ? EEC.d : 0), Z0 + 11], P)).join(""), { tone: "faint" }) });
const conectores = [];
for (const [x, z] of [[8, Z0 + 15], [15, Z0 + 15], [20, Z0 + 15]]) {
  const F = G.frameOf([x, EEC.y + EEC.d / 2, Z0 + 13], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  disco("eec", F, 0, 2.6, 1.7, { tone: "mid", name: "eec.conector" });
  conectores.push([x, EEC.y + EEC.d / 2, Z0 + 15.6]);
}
// tanque de óleo na parte de baixo da carcaça, com o visor
const TQ = G.frameOf([2, SIDE * 54, Z0 - 40], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
turned("fancase", TQ, [[0, 0], [0, 5.4], [1.4, 6.8, 1], [22, 6.8, 1], [23.4, 5.4], [23.4, 0]], { tone: "hi", name: "fancase.tanque-oleo", inner: Ln(G.arcOf(TQ, 11.7, 6.8, P), { tone: "faint" }) });
for (const s of [5, 18]) caixa("fancase", { x: 2 + s - 1.5, y: SIDE * 54 - 1.5, w: 3, d: 3, r: 0.4 }, Z0 - 34, 2.6, { tone: "lo", name: "fancase.suporte-tanque" });

// ================= NÚCLEO: ARMAÇÃO DO FAN E EIXO =================
// booster: tambor com 3 fileiras, dentro do bocal do núcleo
turned("booster", AX, [[22, 0], [22, 19], [44, 21], [44, 0]], { tone: "mid", name: "booster.tambor" });
for (const s of [25, 31, 37]) fileira("booster", s, 2.4, 20.4, 29.2, 64, { name: "booster.fileira" });
// divisor de fluxo (bico do núcleo) e carcaça do booster: ficam com a carcaça do fan
anel("fancase", 22, 37, 29.6, 32.6, { tone: "hi", name: "fancase.divisor", extra: Ln(G.arcOf(AX, 22, 31.1, P), { tone: "faint" }) });
// armação do fan (cone que desce até o compressor de alta) e suporte da frente em cima
turned("core", AX, [[43.5, 0], [43.5, 33], [48, 33, 1], [54, 27.6, 1], [54, 0]], { tone: "mid", name: "core.armacao" });
caixa("core", { x: 44, y: -5, w: 9, d: 10, r: 1 }, Z0 + 32.5, 6, { tone: "mid", name: "core.suporte-frente", extra: Dots([at([46, -2.5, Z0 + 38.5]), at([51, -2.5, Z0 + 38.5]), at([46, 2.5, Z0 + 38.5]), at([51, 2.5, Z0 + 38.5])], { size: 0.45 }) });
// portinholas das válvulas de sangria (VBV), na armação
for (const deg of [-60, -20, 20, 60, 120, 160, 200, 240]) {
  const c = on(49, 31.4, deg), n = G.unit3(G.sub3(c, [49, 0, Z0]));
  if (G.dot3(n, V) < -0.2) continue;
  const id = nameFor("core.vbv");
  const F = G.frameAlong(c, n);
  put("core", c, S(G.disc(0, 0.7, 2.6, F, P), { tone: "lo" }), { name: id, bias: 0.05, shapes: [record(A.disc(F, -0.5, 0.7, 2.6, { name: id, seated: true }))] });
}
// eixo de baixa (N1): aparece entre os módulos quando o motor se abre
disco("core", AX, 20, 196, 3.6, { tone: "mid", name: "core.eixo-n1" });

// ================= COMPRESSOR DE ALTA =================
const HPC = (s) => 26.4 - (s - 54) * 0.065;          // raio externo da carcaça
const HPC_S = Array.from({ length: 10 }, (_, i) => 56 + i * 4.3);
turned("hpc", AX, [[54, 0], [54, 13.2], [98, 15.2], [98, 0]], { tone: "mid", name: "hpc.tambor" });
for (const s of HPC_S) fileira("hpc", s, 1.8, 13.4 + (s - 54) * 0.045, HPC(s) - 2.6, 72 - Math.round((s - 56) / 4.3) * 2, { name: "hpc.fileira" });
// carcaça em duas partes, com os flanges de cada estágio
turned("hpccase", AX, [[54, 22.8], [54, HPC(54)], [98, HPC(98)], [98, 20]], { tone: "hi", name: "hpccase.carcaca", inner: Ln(HPC_S.map((s) => G.arcOf(AX, s + 2, HPC(s + 2), P, { slope: -0.065 })).join(""), { tone: "faint" }) });
// anéis das palhetas variáveis (VSV) nos 6 primeiros estágios, com as alavancas
for (let i = 0; i < 6; i++) {
  const s = HPC_S[i] + 0.9;
  anel("hpccase", s - 0.5, s + 0.5, HPC(s), HPC(s) + 1.5, { tone: "mid", name: "hpccase.anel-vsv", extra: Dots(G.dotsOf(AX, s - 0.5, HPC(s) + 0.4, 40, P, { fade: FADE, slope: -0.065 }), { size: 0.35 }) });
}
// dois atuadores das palhetas variáveis (hidráulicos), em cima, com a haste
for (const deg of [70, 110]) {
  const a = on(57, HPC(57) + 4.4, deg), b = on(83, HPC(83) + 4.4, deg);
  const F = G.frameAlong(a, G.unit3(G.sub3(b, a)));
  turned("hpccase", F, [[0, 0], [0, 1.6], [1, 2.2], [13, 2.2], [14, 1.6], [14, 0]], { tone: "hi", name: "hpccase.atuador" });
  disco("hpccase", F, 14, 25, 0.8, { tone: "mid", name: "hpccase.haste" });
  for (const s of [3, 23]) disco("hpccase", G.frameAlong(G.pointOf(F, s, 0, 0), G.unit3(G.sub3(G.pointOf(F, s, 0, 0), [57 + s, 0, Z0]))), -2.6, 0, 1.1, { tone: "lo", name: "hpccase.pe-atuador" });
}
// saída de ar de sangria (bleed) no alto, com flange
const BLEED = on(88, HPC(88), 90);
disco("hpccase", G.frameAlong(BLEED, [0, 0, 1]), -0.4, 4, 4.2, { tone: "mid", name: "hpccase.bossa-bleed" });

// ================= CÂMARA DE COMBUSTÃO =================
const CB = (s) => 23.6 + 6.4 * Math.sin(Math.min(1, Math.max(0, (s - 98) / 22)) * Math.PI);
const cbSlope = (s) => 6.4 * Math.cos(Math.min(1, Math.max(0, (s - 98) / 22)) * Math.PI) * Math.PI / 22;
{
  const prof = [[98, 18]]; for (let i = 0; i <= 16; i++) { const s = 98 + i * 22 / 16; prof.push([s, CB(s), i > 0 && i < 16 ? 1 : 0]); } prof.push([120, 18]);
  const id = nameFor("combcase.carcaca");
  put("combcase", [109, 0, Z0], S(G.lathe(prof, AX, P, { smooth: { slope: cbSlope, rows: 5 } }), { tone: "hi", inner: Ln(G.arcOf(AX, 109, CB(109), P), { tone: "faint" }) }), { name: id, shapes: [record(A.lathe(AX, prof, { name: id }))] });
}
// 18 injetores na carcaça e o anel de combustível (manifold) em volta
const FN = 18, FN_S = 104, MAN_R = CB(FN_S) + 5;
for (let i = 0; i < FN; i++) {
  const deg = (i / FN) * 360 + 10, base = on(FN_S, CB(FN_S) - 0.3, deg), n = G.unit3(G.sub3(base, [FN_S, 0, Z0]));
  if (G.dot3(n, V) < -0.35) continue;
  const F = G.frameAlong(base, n);
  disco("combcase", F, 0, 2.4, 1.9, { tone: "mid", name: "combcase.injetor" });
  disco("combcase", F, 2.4, 3.4, 1.2, { tone: "lo", name: "combcase.injetor-tampa" });
}
{
  const ring = Array.from({ length: 73 }, (_, i) => on(FN_S + 3.4, MAN_R, (i / 72) * 360));
  tubo("combcase", ring, 0.8, { name: "combcase.manifold", closed: true, tone: "mid", maxLength: 10 });
}
// liner da câmara (aparece quando a carcaça sobe)
anel("comb", 100, 118, 15.6, 22.6, { tone: "hi", name: "comb.liner", inner: Ln(G.arcOf(AX, 104, 22.6, P) + G.arcOf(AX, 112, 22.6, P), { tone: "faint" }), extra: Dots(G.dotsOf(AX, 108, 22.6, 36, P, { fade: FADE }), { size: 0.5, tone: "lo" }) });
for (let i = 0; i < 12; i++) { const deg = (i / 12) * 360 + 15, F = G.frameAlong(on(100, 19, deg), [-1, 0, 0]); if (G.dot3([0, Math.cos(deg * DEG), Math.sin(deg * DEG)], V) < -0.3) continue; disco("comb", F, 0, 1.6, 1.4, { tone: "mid", name: "comb.swirler" }); }

// ================= TURBINAS =================
anel("hptcase", 120, 132, 20, 30.6, { tone: "hi", name: "hptcase.carcaca", inner: Ln(G.arcOf(AX, 126, 30.6, P), { tone: "faint" }) });
anel("hptcase", 125.4, 126.6, 30.6, 32.6, { tone: "mid", name: "hptcase.anel" });
for (const s of [121.5, 127]) fileira("hpt", s, 2.6, 13.6, 19.4, 64, { name: "hpt.fileira" });
turned("hpt", AX, [[120, 0], [120, 13.4], [131, 13.4], [131, 0]], { tone: "mid", name: "hpt.disco" });
const LPT = (s) => 31 + (s - 132) * 0.27;
const LPT_S = Array.from({ length: 6 }, (_, i) => 135 + i * 7.4);
turned("lpt", AX, [[132, 0], [132, 15], [178, 19], [178, 0]], { tone: "mid", name: "lpt.tambor" });
for (const s of LPT_S) fileira("lpt", s, 3, 15.6 + (s - 132) * 0.09, LPT(s) - 2.6, 80, { name: "lpt.fileira" });
turned("lptcase", AX, [[132, 27], [132, LPT(132)], [178, LPT(178)], [178, 38]], { tone: "hi", name: "lptcase.carcaca", inner: Ln(LPT_S.map((s) => G.arcOf(AX, s + 4.5, LPT(s + 4.5), P, { slope: 0.27 })).join(""), { tone: "faint" }) });
// anéis do controle ativo de folga (ACC): tubos perfurados em volta da carcaça, com o tubo que alimenta
const ACC_S = [139, 151, 163, 172];
for (const s of ACC_S) {
  const ring = Array.from({ length: 49 }, (_, i) => on(s, LPT(s) + 1.6, (i / 48) * 360));
  tubo("lptcase", ring, 0.75, { name: "lptcase.acc", closed: true, tone: "mid", maxLength: 12 });
}
cano("lptcase", [on(136, LPT(136) + 6, 90), on(139, LPT(139) + 4, 90), on(172, LPT(172) + 4, 90)], 1.1, { name: "lptcase.acc-alimenta", tone: "hi", free: [true, false] });

// ================= ARMAÇÃO TRASEIRA, BOCAL E CONE =================
anel("exhaust", 178, 189, 30, 44.6, { tone: "hi", name: "exhaust.armacao", extra: Dots(G.dotsOf(AX, 178, 43.2, 56, P, { fade: FADE }), { size: 0.4 }) });
caixa("exhaust", { x: 180, y: -6, w: 8, d: 12, r: 1 }, Z0 + 44.4, 6, { tone: "mid", name: "exhaust.suporte-tras", extra: Dots([at([182, -3, Z0 + 50.4]), at([186, -3, Z0 + 50.4]), at([182, 3, Z0 + 50.4]), at([186, 3, Z0 + 50.4])], { size: 0.45 }) });
anel("exhaust", 189, 202, 37.6, 43.4, { tone: "mid", name: "exhaust.bocal", inner: Ln(G.arcOf(AX, 195, 43.4, P), { tone: "faint" }) });
{
  const PL = (s) => 30 * Math.sqrt(Math.max(0, 1 - ((s - 186) / 54) ** 2));
  const plSlope = (s) => { const r = PL(s); return r > 0.3 ? (-900 * (s - 186)) / (54 * 54 * r) : -40; };
  const prof = [[186, 0]]; for (let i = 0; i <= 20; i++) { const s = 186 + i * 53.6 / 20; prof.push([s, PL(s), i > 0 && i < 20 ? 1 : 0]); } prof.push([240, 0]);
  turned("exhaust", AX, prof, { tone: "hi", smooth: { slope: plSlope, rows: 5 }, name: "exhaust.cone" });
}

// ================= CAIXA DE ACESSÓRIOS (no núcleo, embaixo) =================
const GB = { x: 56, y: -10, w: 42, d: 20, r: 3 }, GBZ = Z0 - 50;
caixa("agb", GB, GBZ, 12, { tone: "hi", name: "agb.caixa", bevel: 0.8, inner: Ln(k.sideSeam(GB, GBZ + 6, P, 3), { tone: "faint" }) });
for (const x of [62, 92]) caixa("agb", { x: x - 1.5, y: -1.5, w: 3, d: 3, r: 0.5 }, GBZ + 12, Z0 - HPC(x) - GBZ - 12 + 0.6, { tone: "lo", name: "agb.tirante" });
disco("agb", G.frameAlong([70, 0, GBZ + 12], [0, 0, 1]), 0, Z0 - HPC(70) - GBZ - 12 + 0.6, 2.2, { tone: "mid", name: "agb.eixo-radial" });
// na face que se vê: bomba de combustível, bomba de óleo, bomba hidráulica, gerador e partida
const FACE_Y = SIDE > 0 ? GB.y + GB.d : GB.y;
const acess = [[61, GBZ + 4.4, 3.2, 7, "agb.bomba-combustivel"], [70, GBZ + 6, 2.6, 6, "agb.bomba-oleo"], [78, GBZ + 5, 3.4, 8, "agb.bomba-hidraulica"], [90, GBZ + 6, 5.4, 11, "agb.gerador"]];
for (const [x, z, r, len, name] of acess) {
  const F = G.frameOf([x, FACE_Y, z], [0, SIDE, 0], [1, 0, 0], [0, 0, 1]);
  turned("agb", F, [[0, 0], [0, r + 1.2], [1, r + 1.2], [1, r], [len, r], [len + 0.8, r - 0.8], [len + 0.8, 0]], { tone: "hi", name, extra: Dots(G.dotsOf(F, 1, r + 0.6, 6, P, { all: true }), { size: 0.4 }) });
}
const PARTIDA = G.frameOf([GB.x, 0, GBZ + 6], [-1, 0, 0], [0, 1, 0], [0, 0, 1]);
turned("agb", PARTIDA, [[0, 0], [0, 5], [2, 5], [2, 4.2], [12, 4.2, 1], [14, 3, 1], [15, 0]], { tone: "hi", name: "agb.partida", extra: Dots(G.dotsOf(PARTIDA, 0, 4.4, 8, P, { all: true }), { size: 0.4 }) });

// ================= TUBOS E CABOS =================
// combustível: da bomba na caixa até o anel de injetores (solto da caixa quando o motor se abre)
const pc = [61, FACE_Y + SIDE * 7.8, GBZ + 4.4];
cano("combcase", [pc, [61, FACE_Y + SIDE * 11, GBZ + 4.4], [96, SIDE * 31, GBZ + 4.4], [102, SIDE * 31, Z0 - 14], on(FN_S + 3.4, MAN_R + 0.2, SIDE > 0 ? -15 : 195)], 1.1, { name: "combcase.linha-combustivel", free: [true, false], tone: "hi" });
// óleo: da bomba de óleo até o mancal da frente (na armação do fan)
const po = [70, FACE_Y + SIDE * 6.8, GBZ + 6];
cano("core", [po, [70, FACE_Y + SIDE * 9, GBZ + 6], [52, SIDE * 22, GBZ + 6], on(50, 30.6, SIDE > 0 ? -40 : 220)], 0.9, { name: "core.linha-oleo", free: [true, false], tone: "mid" });
// ar de sangria: duto grosso que sobe da bossa até a interface do pilone, com uma válvula
const top = [88, 0, Z0 + HPC(88) + 4];
cano("hpccase", [top, [88, 0, Z0 + 34], [70, 0, Z0 + 40], [58, 0, Z0 + 40]], 2.6, { name: "hpccase.duto-bleed", tone: "hi" });
caixa("hpccase", { x: 54, y: -4.5, w: 4, d: 9, r: 1 }, Z0 + 35.5, 9, { tone: "mid", name: "hpccase.flange-pilone" });
// cabos do FADEC: do conector até a carcaça do compressor (soltos quando a carcaça sobe)
conectores.forEach((c, i) => cabo("eec", [c, [c[0], c[1], c[2] + 4 + i], [44, SIDE * (50 - i * 3), Z0 + 22 + i * 2], [60 + i * 8, SIDE * (HPC(60 + i * 8) * 0.55), Z0 + HPC(60 + i * 8) * 0.83 + 1.2]], { name: "eec.cabo", free: [false, true], bundle: "harness" }));

// ================= ORDEM DE PINTURA MEDIDA E SAÍDA =================
A.settle(R, P);
items.sort((a, b) => a.key - b.key);
const groups = items.map((it, i) => { const [mx, my, mz] = it.move; return `<g class="it" data-piece="${it.piece}" data-k="${it.key.toFixed(2)}" data-m="${mx.toFixed(1)},${my.toFixed(1)},${mz.toFixed(1)}" data-i="${i}">${it.svg}</g>`; });
const nSolidos = items.filter((it) => !it.route).length;

const ORDER = ["spinner", "fan", "booster", "fancase", "eec", "core", "hpccase", "hpc", "combcase", "comb", "hptcase", "hpt", "lptcase", "lpt", "exhaust", "agb"];
const unit = (v) => { const o = at([0, 0, 0]), p = at(v); return [p[0] - o[0], p[1] - o[1]]; };
const DATA = { V, EX: unit([1, 0, 0]), EY: unit([0, 1, 0]), EZ: unit([0, 0, 1]), stagger: STAGGER, spring: SPRING, order: ORDER, pieces: Object.fromEntries(Object.entries(PIECES).map(([id, p]) => [id, { name: p.name, say: p.say }])) };

const svg = `<svg xmlns="http://www.w3.org/2000/svg" class="iso-svg gx-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="O motor GEnx-2B do Boeing 747-8 sem a nacele, num suporte de transporte: o cone e o fan de 18 pás na frente, a carcaça do fan com as palhetas guia, o FADEC e o tanque de óleo; atrás, o núcleo com a carcaça do compressor de alta, os atuadores das palhetas variáveis, o duto de ar de sangria, a câmara de combustão com 18 injetores e o anel de combustível, as turbinas com os anéis de ar de resfriamento, a armação traseira, o bocal e o cone de escape; embaixo, a caixa de acessórios com bombas, gerador e motor de partida."><g class="gx-back">${halo}</g><g class="gx-engine">${groups.join("")}</g></svg>`;

const LIVE = `
const D = ${JSON.stringify(DATA)};
const stage = document.querySelector(".gx-stage"), engine = stage.querySelector(".gx-engine");
const readout = document.querySelector("[data-readout]"), botoes = [...document.querySelectorAll("[data-peca]")];
const still = matchMedia("(prefers-reduced-motion: reduce)");
const nodes = [...engine.querySelectorAll(".it")].map((el) => ({ el, piece: el.dataset.piece, key: +el.dataset.k, m: el.dataset.m.split(",").map(Number), shown: "" }));
for (const n of nodes) n.lift = n.m[0] * D.V[0] + n.m[1] * D.V[1] + n.m[2] * D.V[2];
let order = nodes.map((_, i) => i);
const piece = Object.fromEntries(Object.keys(D.pieces).map((id) => [id, { x: 0, v: 0, target: 0, pending: null }]));
let clock = 0, apart = false, selected = null, touring = !still.matches, tourClock = 0, idle = 0, visible = false, frame = 0, last = 0;
const say = (t) => { if (readout.textContent !== t) readout.textContent = t; };
const rest = () => apart ? "desmontado · 10 módulos" : "montado · GEnx-2B";
function setApart(v) {
  if (apart === v) return; apart = v; let i = 0;
  for (const id of v ? D.stagger : [...D.stagger].reverse()) piece[id].pending = { value: v ? 1 : 0, at: clock + (still.matches ? 0 : i++ * D.spring.stagger) };
  if (!selected) say(rest()); run();
}
function select(id) {
  if (id === "stand") id = null;
  selected = selected === id ? null : id;
  for (const n of nodes) n.piece === selected ? n.el.setAttribute("data-on", "") : n.el.removeAttribute("data-on");
  selected ? stage.setAttribute("data-focus", "") : stage.removeAttribute("data-focus");
  botoes.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.peca === selected)));
  say(selected ? D.pieces[selected].say : rest());
}
function spring(s, dt) {
  if (s.pending && clock >= s.pending.at) { s.target = s.pending.value; s.pending = null; }
  if (still.matches) { s.x = s.target; s.v = 0; return false; }
  for (let i = 0; i < D.spring.substeps; i++) { const h = dt / D.spring.substeps; s.v += ((s.target - s.x) * D.spring.stiffness - s.v * D.spring.damping) * h; s.x += s.v * h; }
  if (Math.abs(s.target - s.x) < 2e-4 && Math.abs(s.v) < 2e-4) { s.x = s.target; s.v = 0; return s.pending !== null; }
  return true;
}
function place() {
  for (const n of nodes) {
    const sh = piece[n.piece].x;
    const tx = (D.EX[0] * n.m[0] + D.EY[0] * n.m[1] + D.EZ[0] * n.m[2]) * sh, ty = (D.EX[1] * n.m[0] + D.EY[1] * n.m[1] + D.EZ[1] * n.m[2]) * sh;
    const t = sh === 0 ? "" : "translate(" + tx.toFixed(2) + " " + ty.toFixed(2) + ")";
    if (t !== n.shown) { n.shown = t; t ? n.el.setAttribute("transform", t) : n.el.removeAttribute("transform"); }
  }
  const next = nodes.map((_, i) => i).sort((a, b) => nodes[a].key + nodes[a].lift * piece[nodes[a].piece].x - (nodes[b].key + nodes[b].lift * piece[nodes[b].piece].x));
  if (next.some((v, i) => v !== order[i])) { const f = document.createDocumentFragment(); for (const i of next) f.appendChild(nodes[i].el); engine.appendChild(f); order = next; }
}
const TOUR = 0.9;
function tourAt(t) {
  const c = t % (4 + D.order.length * TOUR + 3);
  if (c < 2) return { apart: false, part: null };
  if (c < 4) return { apart: true, part: null };
  if (c < 4 + D.order.length * TOUR) return { apart: true, part: D.order[Math.floor((c - 4) / TOUR)] };
  return { apart: false, part: null };
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60; last = now; clock += dt;
  if (touring) { tourClock += dt; const st = tourAt(tourClock); setApart(st.apart); if (st.part !== selected) { selected = null; select(st.part); } }
  let moving = false; for (const id in piece) moving = spring(piece[id], dt) || moving;
  place();
  frame = visible && (moving || touring) ? requestAnimationFrame(tick) : 0;
}
function run() { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } }
function grab() { touring = false; clearTimeout(idle); idle = setTimeout(() => { if (!still.matches) { touring = true; tourClock = 0; select(null); run(); } }, 9000); }
new IntersectionObserver((e) => { visible = e[e.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
stage.addEventListener("click", (e) => { grab(); const g = e.target.closest(".it"); if (apart && g && g.dataset.piece !== "stand") { select(g.dataset.piece === selected ? null : g.dataset.piece); return; } setApart(!apart); if (!apart) select(null); run(); });
stage.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); grab(); setApart(!apart); run(); } if (e.key === "Escape") { grab(); select(null); setApart(false); } });
botoes.forEach((b) => b.addEventListener("click", () => { grab(); setApart(true); select(b.dataset.peca); run(); }));
place(); say(rest());
`;

const CSS = `body{margin:0}.iso-page{width:100%!important;margin:0!important;padding:14px 18px 18px;box-sizing:border-box}.iso-plate{padding:44px 12px 58px!important;box-shadow:none!important;border-radius:12px!important}
.gx-stage{cursor:pointer;touch-action:pan-y;outline:none}.gx-stage svg{display:block;width:100%;height:auto}
.gx-stage[data-focus] .it:not([data-on]){opacity:.22;transition:opacity .3s}.gx-stage .it{transition:opacity .3s}
.gx-stage .it[data-on] .iso-edge{stroke:var(--anatomy-lit)!important;stroke-width:1.1}
.gx-lista{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:10px}.gx-lista button{display:flex;gap:7px;align-items:center;text-align:left;border:1px solid var(--anatomy-mid);background:transparent;color:inherit;border-radius:8px;padding:5px 6px;font:inherit;font-size:11.5px;line-height:1.25;cursor:pointer;-webkit-tap-highlight-color:transparent}
.gx-lista button b{flex:0 0 19px;height:19px;border-radius:50%;display:grid;place-items:center;font-size:10.5px;border:1px solid currentColor}.gx-lista button[aria-pressed=true]{border-color:var(--anatomy-lit);color:var(--anatomy-lit)}`;
const body = k.plateHtml({
  fig: "Fig 1", title: "GEnx-2B · 747-8", hint: "Toque para desmontar",
  readout: "montado · GEnx-2B",
  keys: [{ mark: "raised", label: `${nSolidos} peças sólidas e ${items.length - nSolidos} trechos de tubo e cabo` }, { mark: "lit", label: "Toque num módulo (ou num nome) para ver o que ele faz" }],
  caption: "O motor do 747-8 sem a nacele, num suporte de transporte, e desmontado em módulos como na manutenção. Proporções e quantidades reais: fan de 18 pás, booster de 3 estágios, compressor de alta de 10, câmara TAPS com 18 injetores, turbina de alta de 2 e turbina de baixa de 6. Tubos, cabos e equipamentos foram simplificados e algumas posições, ajustadas para aparecerem.",
  body: `<div class="gx-stage" tabindex="0" role="button" aria-label="Toque ou Enter para desmontar e montar o motor">${svg}</div><div class="gx-lista">${ORDER.map((id, i) => `<button type="button" data-peca="${id}"><b>${i + 1}</b>${PIECES[id].name}</button>`).join("")}</div>`,
});
const file = THEME === "light" ? "fig-genx-light.html" : "fig-genx.html";
const page = k.pageHtml({ title: "GEnx-2B", theme: THEME, body: `<style>${CSS}</style>${body}`, script: kitScript() + LIVE });
writeFileSync(join(HERE, "../../aviao/assets", file), page);
console.log("wrote", file, `${(page.length / 1024).toFixed(0)} KB`, `${items.length} itens, ${nSolidos} sólidos`);
A.auditOrExit(R, P);
