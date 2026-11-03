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
const LIFT = 56, LOW = 30, AFT = 44;

// ---------- Explosão: módulos e para onde vão ----------
const PIECES = {
  spinner: { name: "Cone do fan (spinner)", say: "cone do fan · gira com o eixo de baixa (N1)", move: [-78, 0, 0] },
  fan: { name: "Fan · 18 pás", say: "fan · 18 pás de fibra de carbono com borda de titânio · ~2,7 m", move: [-54, 0, 0] },
  booster: { name: "Booster (compressor de baixa)", say: "booster · 3 estágios, gira junto com o fan", move: [-30, 0, 0] },
  fancase: { name: "Carcaça do fan e palhetas guia", say: "carcaça do fan · segura uma pá que se solte · 44 palhetas guia atrás", move: [0, 0, 0] },
  hpccase: { name: "Carcaça do compressor de alta", say: "carcaça do HPC · anéis que giram as palhetas variáveis", move: [0, 0, LOW] },
  hpc: { name: "Compressor de alta (rotor)", say: "compressor de alta · 10 estágios · pressão ~23 vezes maior", move: [0, 0, 0] },
  combcase: { name: "Câmara de combustão e injetores", say: "carcaça da câmara · 18 injetores no anel de combustível", move: [0, 0, LIFT] },
  comb: { name: "Câmara de combustão (TAPS)", say: "câmara TAPS · mistura ar e combustível antes da chama", move: [0, 0, 0] },
  hptcase: { name: "Carcaça da turbina de alta", say: "carcaça da HPT · anel de ar que controla a folga das pás", move: [0, 0, LOW] },
  hpt: { name: "Turbina de alta (rotor)", say: "turbina de alta · 2 estágios · gira o compressor de alta (N2)", move: [0, 0, 0] },
  lptcase: { name: "Carcaça da turbina de baixa", say: "carcaça da LPT · anéis de ar que esfriam a carcaça", move: [0, 0, LIFT] },
  lpt: { name: "Turbina de baixa (rotor)", say: "turbina de baixa · 6 estágios · gira o fan e o booster (N1)", move: [0, 0, 0] },
  exhaust: { name: "Armação traseira, bocal e cone", say: "armação traseira com o suporte de trás · bocal e cone de escape", move: [AFT + 28, 0, 0] },
  agb: { name: "Caixa de acessórios", say: "caixa de acessórios · bombas de combustível, óleo e hidráulica e gerador", move: [0, 0, -20] },
  eec: { name: "FADEC (EEC) e cabos", say: "FADEC · o computador que controla o motor", move: [0, 0, 0] },
  core: { name: "Armação do fan", say: "armação do fan, suporte da frente e válvulas de sangria (VBV)", move: [0, 0, 0] },
  stand: { name: "Suporte de transporte", say: "", move: [0, 0, 0] },
};
const STAGGER = ["spinner", "fan", "booster", "agb", "hpccase", "combcase", "hptcase", "lptcase", "lpt", "exhaust"];
const SPRING = { stagger: 0.05, stiffness: 52, damping: 13, substeps: 4 };

// ---------- Câmera ----------
const fitPts = [[178, 0, Z0 + 44 + LIFT + 3], [132, 0, Z0 + 31 + LIFT + 3], [-26, 0, Z0], [0, 70, Z0], [0, -70, Z0], [0, 0, Z0 + 70], [40, 0, Z0 - 66], [240, 0, Z0], [-110, 0, Z0], [AFT + 270, 0, Z0], [120, 0, Z0 + 40 + LIFT + 10], [-10, -46, 0], [210, 46, 0], [210, -46, 0], [-10, 46, 0], [76, 0, Z0 - 78]];
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
// cada rotor sai junto com a sua carcaça (o módulo inteiro), como na oficina: nada atravessa nada no caminho
const RIDE = { hpc: "hpccase", comb: "combcase", hpt: "hptcase", lpt: "lptcase" };
function put(piece, ref, svg, { bias = 0, shapes = [], name, route, chunk, ride: r0 } = {}) {
  const ride = r0 ?? RIDE[piece];
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
// rotor: tambor cortado entre as fileiras e cada fileira como um disco cheio (pás na face, aro do cubo),
// assim nenhuma peça envolve outra e a ordem de pintura não tem ciclos
function rotor(piece, s0, s1, hub, rows, { tone = "hi", sweep = 0.16, name } = {}) {
  let cur = s0;
  const seg = (a, b) => { if (b - a > 0.05) turned(piece, AX, [[a, 0], [a, hub(a)], [b, hub(b)], [b, 0]], { tone: "mid", name: `${piece}.tambor` }); };
  for (const r of rows) {
    seg(cur, r.s);
    const face = G.dot3(AX.a, V) > 0 ? r.s + r.w : r.s, h = hub(r.s + r.w / 2);
    const pas = G.spokesOf(AX, face, h + 0.4, r.tip - 0.4, r.count, P, { sweep: r.sweep ?? sweep });
    disco(piece, AX, r.s, r.s + r.w, r.tip, { tone, name: name ?? `${piece}.fileira`, extra: Ln(pas, { tone: "faint" }) + Ln(G.circleOf(AX, face, h, P, 64) + G.circleOf(AX, face, h + (r.tip - h) * 0.5, P, 64), { tone: "faint" }) });
    cur = r.s + r.w;
  }
  seg(cur, s1);
}
function caixa(piece, plan, z, h, { tone = "hi", extra = "", bias = 0, name, bevel = 0.5, steps = 3, inner = "" } = {}) {
  const id = nameFor(name ?? `${piece}.caixa`);
  const shape = record(A.slab(plan, z, h, { name: id }, steps));
  put(piece, [plan.x + plan.w / 2, plan.y + plan.d / 2, z + h / 2], S(k.slabOf(plan, z, h, P, steps, bevel), { tone, inner }) + extra, { bias, name: id, shapes: [shape] });
  return shape;
}
function disco(piece, F, s0, s1, r, { tone = "hi", extra = "", bias = 0, name, bevel = 0, meta = {} } = {}) {
  const id = nameFor(name ?? `${piece}.disco`);
  const shape = record(A.disc(F, s0, s1, r, { name: id, ...meta }));
  put(piece, G.pointOf(F, (s0 + s1) / 2, 0, 0), S(G.disc(s0, s1, r, F, P, { bevel }), { tone }) + extra, { bias, name: id, shapes: [shape] });
  return shape;
}
function bola(piece, c, r, { tone = "mid", bias = 0, name } = {}) {
  const id = nameFor(name ?? `${piece}.bola`);
  put(piece, c, S(G.sphereOf(c, r, P, { steps: G.stepsFor(r, 24) }), { tone }), { bias, name: id, shapes: [record(A.ball(c, r, { name: id }))] });
}
function tubo(piece, route, r, { name, tone = "hi", bias = 0, gaps = [], breaks = [], closed = false, maxLength = 20, spacing, free = [false, false], limp = false, touch, bundle, rims } = {}) {
  const id = nameFor(name ?? `${piece}.tubo`);
  R.route(id, route, r, { owner: id, touch, bundle, limp, gaps, closed, free, rims, piece, move: PIECES[RIDE[piece] ?? piece].move, ride: RIDE[piece] ?? piece });
  tubePieces(route, r, P, { maxLength, spacing: spacing ?? Math.max(0.8, Math.min(2.4, r * 0.2)), closed, gaps, breaks }).forEach((part, i) =>
    put(piece, part.mid, tubeSvg(part, { tone }), { bias, name: `${id}:${i}`, route: id, chunk: i, shapes: [A.tube(part.points, part.radii)] }));
  return id;
}
function cano(piece, pts, r, opts = {}) { return tubo(piece, G.fillet(pts, opts.bend ?? Math.max(r * 2.8, 3), 12, { P, tube: r }), r, opts); }
function cabo(piece, pts, opts = {}) { return tubo(piece, G.fillet(pts, opts.bend ?? 5, 12, { P, tube: 0.6 }), 0.6, { tone: "mid", limp: true, maxLength: 12, spacing: 1, ...opts }); }


// Casca que envolve outras peças (a carcaça do fan, o divisor): dividida em metade de trás, que mostra a
// parede de dentro, e metade da frente, que mostra a parede de fora e a face da frente. As peças de dentro
// ficam entre as duas na ordem de pintura (craft.md, "Painter's order").
const shade = (n) => { const b = G.toneOf(n, P); return b >= 4 ? `class="iso-top"` : `class="iso-shade" data-shade="${b}"`; };
const qd = (pts) => "M" + pts.map((p) => at(p).map((v) => v.toFixed(1)).join(" ")).join("L") + "Z";
// rIn e rOut podem ser números ou funções de s (cone, bojo); cada metade registra a forma de verdade:
// o anel inteiro cortado pelo semiespaço da outra metade, e o settle mede a ordem delas com as peças de dentro.
const NV = G.unit3([0, V[1], V[2]]);
const SIL = Math.atan2(NV[2], NV[1]) / DEG + 90;   // ângulo da silhueta (onde a metade da frente encontra a de trás)
const LADO = (frente) => A.prism(G.frameOf([0, 0, Z0], [1, 0, 0], NV, [0, -NV[2], NV[1]]), frente ? [[0, -400], [400, -400], [400, 400], [0, 400]] : [[-400, -400], [0, -400], [0, 400], [-400, 400]], -1000, 1000);
// o plano que separa a parte de fora que se vê da que não se vê: passa pelas duas geratrizes da silhueta
function planoSilhueta(s0, s1, fo) {
  const kk = (fo(s1) - fo(s0)) / (s1 - s0), vyz = Math.hypot(V[1], V[2]), phi = Math.atan2(V[2], V[1]);
  const al = Math.acos(Math.max(-1, Math.min(1, (kk * V[0]) / vyz)));
  const A_ = on(s0, fo(s0), (phi + al) / DEG), B_ = on(s1, fo(s1), (phi + al) / DEG), C_ = on(s0, fo(s0), (phi - al) / DEG);
  const a = G.unit3(G.sub3(B_, A_));
  let n = G.unit3(G.cross3(a, G.sub3(C_, A_)));
  if (G.dot3(n, G.sub3(on((s0 + s1) / 2, fo((s0 + s1) / 2), phi / DEG), A_)) < 0) n = G.mul3(n, -1);
  const F = G.frameOf(A_, a, n, G.cross3(a, n));
  return (frente) => A.prism(F, frente ? [[0, -400], [400, -400], [400, 400], [0, 400]] : [[-400, -400], [0, -400], [0, 400], [-400, 400]], -400, 400);
}
function casca(piece, s0, s1, rIn, rOut, { tone = "hi", name, linhas = [], arcos = "", arcosMid = "", pontos = "", segs, naFace } = {}) {
  const fi = typeof rIn === "function" ? rIn : () => rIn, fo = typeof rOut === "function" ? rOut : () => rOut;
  const curvo = typeof rIn === "function" || typeof rOut === "function";
  const M = segs ?? (curvo ? 10 : 1);
  const S_ = Array.from({ length: M + 1 }, (_, j) => s0 + (j / M) * (s1 - s0));
  const faceS = G.dot3(AX.a, V) > 0 ? s1 : s0, farS = faceS === s0 ? s1 : s0;
  const naFrente = (th) => Math.cos(th) * NV[1] + Math.sin(th) * NV[2] > 0;
  // frente: o sólido torneado do kit (sombras suaves, contorno de verdade) com o furo na boca
  const merid = [[s0, fi(s0)], ...S_.map((x, j) => [x, fo(x), curvo && j > 0 && j < M ? 1 : 0]), [s1, fi(s1)]];
  const frente = `<g style="fill-rule:evenodd">${S(G.lathe(merid, AX, P, { hole: [faceS, fi(faceS)] }), { tone })}</g>`;
  // trás: a cavidade vista pela boca, num tom de sombra, com o aro de dentro do fundo
  const furo = G.circleOf(AX, faceS, fi(faceS), P, 96);
  const fundo = G.arcOf(AX, farS, fi(farS), P, { inward: true });
  const id = nameFor(name ?? `${piece}.casca`);
  const prof = [...S_.map((x) => [x, fo(x)]), ...[...S_].reverse().map((x) => [x, fi(x)])];
  const corte = planoSilhueta(s0, s1, fo);
  const shF = record(A.lathe(AX, prof, { name: `${id}.frente`, owner: id, cut: corte(false) }));
  const shT = record(A.lathe(AX, prof, { name: `${id}.tras`, owner: id, cut: corte(true) }));
  const centro = (fr) => on((s0 + s1) / 2, fo((s0 + s1) / 2), (Math.atan2(NV[2], NV[1]) + (fr ? 0 : Math.PI)) / DEG);
  const la = linhas.map((x) => G.arcOf(AX, x, fo(x), P)).join("");
  R.put({ piece, ride: piece, at: centro(false), move: PIECES[piece].move, name: `${id}.tras`, shapes: [shT],
    svg: `<g class="iso-solid"><path class="iso-shade" data-shade="1" d="${furo}"/>${fundo ? Ln(fundo, { tone: "lo" }) : ""}</g>` });
  R.put({ piece, ride: piece, at: centro(true), move: PIECES[piece].move, name: `${id}.frente`, shapes: [shF],
    svg: frente + (naFace ? Ln(naFace(true, faceS) + naFace(false, faceS), { tone: "faint" }) : "") + (la ? Ln(la, { tone: "faint" }) : "") + (arcos ? Ln(arcos, { tone: "faint" }) : "") + (arcosMid ? Ln(arcosMid, { tone: "mid" }) : "") + pontos });
  return [shF, shT];
}

// ================= SUPORTE DE TRANSPORTE =================
const BASE = { x: -14, y: -42, w: 226, d: 84, r: 4 };
for (const y of [-36, 36]) caixa("stand", { x: BASE.x, y: y - 4, w: BASE.w, d: 8, r: 1 }, 10, 6, { tone: "mid", name: "stand.trilho", bevel: 0.6 });
for (const x of [-8, 40, 100, 160, 206]) caixa("stand", { x: x - 3, y: -32, w: 6, d: 64, r: 1 }, 10, 6, { tone: "mid", name: "stand.travessa", bevel: 0.4 });
for (const [x, y] of [[-6, -36], [-6, 36], [204, -36], [204, 36]]) {
  caixa("stand", { x: x - 5, y: y - 5, w: 10, d: 10, r: 1.2 }, 7.2, 2.8, { tone: "lo", name: "stand.garfo" });
  const F = G.frameOf([x, y - 3.5, 3.6], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  disco("stand", F, 0, 7, 3.6, { tone: "lo", name: "stand.roda", extra: Ln(G.circleOf(F, G.dot3(F.a, V) > 0 ? 7 : 0, 1.6, P, 16), { tone: "faint" }) });
}
// berço da frente (embaixo da carcaça do fan) e de trás (embaixo da carcaça da turbina de alta)
const FC_R = 64.4, BERCO = [[22, Z0 - FC_R], [124, Z0 - 30.6]];
for (const [x, top] of BERCO) {
  for (const y of [-26, 26]) caixa("stand", { x: x - 3, y: y - 3, w: 6, d: 6, r: 1 }, 16, top - 16 - 4, { tone: "mid", name: "stand.coluna", bevel: 0.3 });
  caixa("stand", { x: x - 6, y: -30, w: 12, d: 60, r: 1.5 }, top - 4, 4, { tone: "mid", name: "stand.berco", bevel: 0.5, extra: Dots([at([x - 3.5, -24, top]), at([x - 3.5, 24, top]), at([x + 3.5, -24, top]), at([x + 3.5, 24, top])], { size: 0.45 }) });
  for (const y of [-26, 26]) for (const [a, b] of [[y - 9, y - 3], [y + 3, y + 9]]) caixa("stand", { x: x - 1.5, y: a, w: 3, d: b - a, r: 0.6 }, 16, 3, { tone: "lo", name: "stand.mao-francesa" });
}
const halo = `<path class="iso-halo" d="${k.haloOf(BASE, 0, 16, P)}"/>`;

// ================= FAN: CONE, DISCO E 18 PÁS =================
const SP0 = -34, SP1 = 8, SPR = 18.5;
const spR = (s) => SPR * (1 - Math.pow(Math.max(0, (SP1 - s) / (SP1 - SP0)), 1.5));
const spSlope = (s) => (SPR * 1.5 * Math.pow(Math.max(1e-6, (SP1 - s) / (SP1 - SP0)), 0.5)) / (SP1 - SP0);
{
  const prof = Array.from({ length: 22 }, (_, i) => { const s = SP0 + 0.05 + (i / 21) * (SP1 - SP0 - 0.05); return [s, spR(s), i > 0 && i < 21 ? 1 : 0]; });
  prof[0] = [SP0, 0];
  // a espiral pintada (só a parte que se vê) e a ponta de borracha
  const esp = []; for (let j = 0; j <= 50; j++) { const s = SP0 + 2 + j * (SP1 - SP0 - 3) / 50; esp.push(G.pointOf(AX, s, spR(s) + 0.15, (40 + j * 9) * DEG)); }
  const vis = []; let run = []; for (const p of esp) { const rad = G.unit3(G.sub3(p, [p[0], 0, Z0])); const n = G.unit3(G.sub3(rad, [spSlope(p[0]), 0, 0])); if (G.dot3(n, V) > 0.12) run.push(p); else if (run.length) { vis.push(run); run = []; } } if (run.length) vis.push(run);
  turned("spinner", AX, prof, { tone: "mid", smooth: { slope: spSlope, rows: 5 }, name: "spinner.cone", extra: vis.map((r) => `<path class="iso-line" data-tone="hi" data-free="both" d="M${r.map((p) => at(p).map((v) => v.toFixed(1)).join(" ")).join("L")}" style="stroke-width:2.2;stroke-linecap:round"/>`).join("") });
  anel("spinner", SP1, SP1 + 0.8, SPR - 1.5, SPR + 0.4, { tone: "mid", name: "spinner.anel", extra: Dots(G.dotsOf(AX, SP1, SPR - 0.6, 24, P, { fade: FADE }), { size: 0.4 }) });
}
disco("fan", AX, SP1 + 0.8, 22, 18.6, { tone: "mid", name: "fan.disco" });
const BLADES = 18;
// cada pá é uma superfície torcida: da raiz à ponta o ângulo abre (de 28° a 68° com o eixo), a corda cresce
// e a ponta vai para trás, como as pás largas de compósito do GEnx; a borda de ataque de titânio fica clara
for (let i = 0; i < BLADES; i++) {
  const th = (i / BLADES) * 360 + 6;
  const rad = [0, Math.cos(th * DEG), Math.sin(th * DEG)], tan = [0, -Math.sin(th * DEG), Math.cos(th * DEG)];
  const le = [], te = [], N = 12;
  for (let j = 0; j <= N; j++) {
    const t = j / N, r = 18.4 + (58.9 - 18.4) * t, beta = (28 + 40 * t) * DEG, c = 5.8 + 5.4 * t - 2.2 * t * t * t, sweep = 2.4 * t * t;
    const c0 = G.add3([14.5 + sweep, 0, Z0], G.mul3(rad, r));
    const d = G.add3(G.mul3([1, 0, 0], Math.cos(beta)), G.mul3(tan, Math.sin(beta)));
    le.push(G.add3(c0, G.mul3(d, -c))); te.push(G.add3(c0, G.mul3(d, c * 0.9)));
  }
  const faces = [];
  for (let j = 0; j < N; j++) {
    let n = G.unit3(G.cross3(G.sub3(le[j + 1], le[j]), G.sub3(te[j], le[j])));
    if (G.dot3(n, V) < 0) n = G.mul3(n, -1);
    faces.push(`<path ${shade(n)} d="${qd([le[j], le[j + 1], te[j + 1], te[j]])}"/>`);
  }
  const contorno = "M" + [...le, ...[...te].reverse()].map((p) => at(p).map((v) => v.toFixed(1)).join(" ")).join("L") + "Z";
  const borda = "M" + le.map((p) => at(p).map((v) => v.toFixed(1)).join(" ")).join("L");
  const F = G.frameOf([15.5, 0, Z0], rad, [1, 0, 0], tan), b = 48 * DEG, poly = [];
  for (let j = 0; j < 12; j++) { const q = (j / 12) * 2 * Math.PI, x = 8 * Math.cos(q), y = 0.9 * Math.sin(q); poly.push([x * Math.cos(b) - y * Math.sin(b), x * Math.sin(b) + y * Math.cos(b)]); }
  const id = nameFor("fan.pa");
  put("fan", G.pointOf(F, 40, 0, 0), `<g class="iso-solid"><path class="iso-fill" d="${contorno}"/>${faces.join("")}<path class="iso-line iso-edge" data-tone="hi" d="${contorno}"/><path class="iso-line" data-tone="lit" d="${borda}" style="stroke-width:1.3"/></g>`, { name: id, shapes: [record(A.prism(F, poly, 18.3, 58.9, { name: id }))] });
}

// ================= CARCAÇA DO FAN, PALHETAS GUIA E EQUIPAMENTOS =================
// carcaça do fan: anéis em casca, da frente para trás (a da frente fica por cima)
const FCK = (sx) => 60 - sx * 0.01;
casca("fancase", -6, -2, 59.6, 66.5, { keyFrente: FCK(-6), keyTras: -500 + 6, tone: "mid", name: "fancase.flange-frente", pontos: Dots(G.dotsOf(AX, -6, 64.2, 60, P, { fade: FADE }), { size: 0.4 }) });
casca("fancase", -2, 26, 59.6, 64.4, { keyFrente: FCK(-2), keyTras: -500 - 2, tone: "lo", name: "fancase.contencao", linhas: [6, 13, 20] });
casca("fancase", 26, 41, 59.6, 63.2, { keyFrente: FCK(26), keyTras: -500 - 26, tone: "mid", name: "fancase.traseira", linhas: [29, 37] });
casca("fancase", 31, 32.6, 63.2, 65.4, { keyFrente: FCK(31) + 0.001, keyTras: -600, tone: "mid", name: "fancase.reforco" });
casca("fancase", 41, 43.5, 59.6, 67, { keyFrente: FCK(41), keyTras: -500 - 41, tone: "mid", name: "fancase.flange-tras", pontos: Dots(G.dotsOf(AX, 41, 65.4, 64, P, { fade: FADE }), { size: 0.4 }) });
// palhetas guia (OGV) entre o núcleo e a carcaça
casca("fancase", 37, 41, 32.6, 59.6, { tone: "mid", name: "fancase.ogv", naFace: (frente, x, th0) => Array.from({ length: 44 }, (_, q) => (q / 44) * 2 * Math.PI + 0.03).filter((th) => (Math.cos(th) * NV[1] + Math.sin(th) * NV[2] > 0) === frente).map((th) => k.segment(on(x, 33, th / DEG), on(x, 59.2, (th + 0.05) / DEG), P)).join("") });
// FADEC (EEC): caixa com aletas presa na lateral da carcaça, com dois conectores e cabos
const EY = SIDE * 66.6, EEC = { x: 4, y: SIDE > 0 ? EY : EY - 7, w: 20, d: 7, r: 1.2 };
for (const x of [7, 21]) caixa("eec", { x: x - 1.4, y: SIDE > 0 ? 64 : -66.6, w: 2.8, d: 2.6, r: 0.4 }, Z0 - 8, 16, { tone: "lo", name: "eec.suporte" });
caixa("eec", EEC, Z0 - 13, 26, { tone: "hi", name: "eec.caixa", bevel: 0.7, inner: Ln(Array.from({ length: 7 }, (_, i) => k.segment([EEC.x + 3 + i * 2.4, EEC.y + (SIDE > 0 ? EEC.d : 0), Z0 - 13], [EEC.x + 3 + i * 2.4, EEC.y + (SIDE > 0 ? EEC.d : 0), Z0 + 13], P)).join(""), { tone: "faint" }) });
const conectores = [];
for (const [x, z] of [[8, Z0 + 15], [15, Z0 + 15], [20, Z0 + 15]]) {
  const F = G.frameOf([x, EEC.y + EEC.d / 2, Z0 + 13], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  disco("eec", F, 0, 2.6, 1.7, { tone: "mid", name: "eec.conector" });
  conectores.push([x, EEC.y + EEC.d / 2, Z0 + 15.6]);
}
// tanque de óleo na parte de baixo da carcaça, com o visor
const TQ_DEG = SIDE > 0 ? -40 : 220, TQ_R = 64.4 + 1.5 + 6.8;
const TQ = G.frameOf(on(2, TQ_R, TQ_DEG), [1, 0, 0], [0, 1, 0], [0, 0, 1]);
turned("fancase", TQ, [[0, 0], [0, 5.4], [1.4, 6.8], [22, 6.8], [23.4, 5.4], [23.4, 0]], { tone: "hi", name: "fancase.tanque-oleo", inner: Ln(G.arcOf(TQ, 11.7, 6.8, P), { tone: "faint" }) });
// duas sapatas radiais prendem o tanque na carcaça de contenção
for (const x of [7, 20]) { const b = on(x, 64.4, TQ_DEG); disco("fancase", G.frameAlong(b, G.unit3(G.sub3(b, [x, 0, Z0]))), 0, 1.5, 1.4, { tone: "lo", name: "fancase.suporte-tanque" }); }

// ================= NÚCLEO: ARMAÇÃO DO FAN E EIXO =================
// booster: tambor com 3 fileiras, dentro do bocal do núcleo
rotor("booster", 22, 43.5, (x) => 19 + (x - 22) * 2 / 21.5, [25, 31, 37].map((x) => ({ s: x, w: 2.4, tip: 29.2, count: 64 })));
// divisor de fluxo (bico do núcleo) e carcaça do booster: ficam com a carcaça do fan
casca("fancase", 22, 37, 29.6, 32.6, { keyFrente: 20, keyTras: -400, tone: "hi", name: "fancase.divisor" });
// armação do fan (cone que desce até o compressor de alta) e suporte da frente em cima
const ARM = turned("core", AX, [[43.5, 0], [43.5, 33], [48, 33, 1], [54, 27.6, 1], [54, 0]], { tone: "mid", name: "core.armacao" });
caixa("core", { x: 44, y: -5, w: 9, d: 10, r: 1 }, Z0 + 33, 5.5, { tone: "mid", name: "core.suporte-frente", extra: Dots([at([46, -2.5, Z0 + 38.5]), at([51, -2.5, Z0 + 38.5]), at([46, 2.5, Z0 + 38.5]), at([51, 2.5, Z0 + 38.5])], { size: 0.45 }) });
// portinholas das válvulas de sangria (VBV), na armação
for (const deg of [-60, -20, 20, 60, 120, 160, 200, 240]) {
  const c = on(49, 31.4, deg), n = G.unit3(G.sub3(c, [49, 0, Z0]));
  if (G.dot3(n, V) < -0.2) continue;
  const id = nameFor("core.vbv");
  const F = G.frameAlong(c, n);
  put("core", c, S(G.disc(0, 0.7, 2.6, F, P), { tone: "lo" }), { name: id, bias: 0.05, shapes: [record(A.disc(F, -0.5, 0.7, 2.6, { name: id, seated: true, cut: ARM }))] });
}

// ================= COMPRESSOR DE ALTA =================
const HPC = (s) => 26.4 - (s - 54) * 0.065;          // raio externo da carcaça
const HPC_S = Array.from({ length: 10 }, (_, i) => 56 + i * 4.3);
rotor("hpc", 54, 98, (x) => 13.2 + (x - 54) * 2 / 44, HPC_S.map((x) => ({ s: x, w: 1.8, tip: HPC(x) - 2.6, count: 72 - Math.round((x - 56) / 4.3) * 2 })));
// carcaça em duas partes, com os flanges de cada estágio
// anéis das palhetas variáveis (VSV) nos 6 primeiros estágios: faixas e alavancas na superfície da carcaça
const VSV = HPC_S.slice(0, 6).map((x) => x + 0.9);
const HPCC = casca("hpccase", 54, 98, (x) => HPC(x) - 1.8, HPC, { tone: "hi", name: "hpccase.carcaca", arcos: HPC_S.map((s) => G.arcOf(AX, s + 2, HPC(s + 2), P, { slope: -0.065 })).join(""), arcosMid: VSV.map((x) => G.arcOf(AX, x - 0.5, HPC(x - 0.5), P, { slope: -0.065 }) + G.arcOf(AX, x + 0.5, HPC(x + 0.5), P, { slope: -0.065 })).join(""), pontos: VSV.map((x) => Dots(G.dotsOf(AX, x, HPC(x), 40, P, { fade: FADE, slope: -0.065 }), { size: 0.4 })).join("") });
// dois atuadores das palhetas variáveis (hidráulicos), em cima, com a haste
for (const deg of [70, 110]) {
  const a = on(57, HPC(57) + 4.4, deg), b = on(83, HPC(83) + 4.4, deg);
  const F = G.frameAlong(a, G.unit3(G.sub3(b, a)));
  turned("hpccase", F, [[0, 0], [0, 1.6], [1, 2.2], [13, 2.2], [14, 1.6], [14, 0]], { tone: "hi", name: "hpccase.atuador" });
  disco("hpccase", F, 14, 23, 0.8, { tone: "mid", name: "hpccase.haste" });
  for (const [s, topo] of [[3, -2.0], [23, -0.6]]) { const c = G.pointOf(F, s, 0, 0), xs = c[0], n = G.unit3(G.sub3(c, [xs, 0, Z0])), alt = Math.hypot(c[1], c[2] - Z0) - HPC(xs); disco("hpccase", G.frameAlong(c, n), -alt + 0.05, topo, 1.1, { tone: "lo", name: "hpccase.pe-atuador" }); }
}
// saída de ar de sangria (bleed) no alto, com flange
const BLEED = on(88, HPC(88), 90);
disco("hpccase", G.frameAlong(BLEED, [0, 0, 1]), -1.2, 4, 4.2, { tone: "mid", name: "hpccase.bossa-bleed", meta: { seated: true, cut: HPCC } });

// ================= CÂMARA DE COMBUSTÃO =================
const CB = (s) => 23.6 + 6.4 * Math.sin(Math.min(1, Math.max(0, (s - 98) / 22)) * Math.PI);
const cbSlope = (s) => 6.4 * Math.cos(Math.min(1, Math.max(0, (s - 98) / 22)) * Math.PI) * Math.PI / 22;
const CBC = casca("combcase", 98, 120, 23, CB, { tone: "hi", name: "combcase.carcaca", segs: 22, arcos: G.arcOf(AX, 109, CB(109), P) });
// 18 injetores na carcaça e o anel de combustível (manifold) em volta
const FN = 18, FN_S = 104, MAN_R = CB(FN_S) + 5;
for (let i = 0; i < FN; i++) {
  const deg = (i / FN) * 360 + 10, base = on(FN_S, CB(FN_S) - 0.3, deg), n = G.unit3(G.sub3(base, [FN_S, 0, Z0]));
  if (G.dot3(n, V) < 0.1) continue;
  const F = G.frameAlong(base, n);
  disco("combcase", F, -1.2, 2.4, 1.9, { tone: "mid", name: "combcase.injetor", meta: { seated: true, cut: CBC } });
  disco("combcase", F, 2.4, 3.4, 1.2, { tone: "lo", name: "combcase.injetor-tampa" });
}
{
  const ring = Array.from({ length: 73 }, (_, i) => on(FN_S + 3.4, MAN_R, SIL + (i / 72) * 360));
  const Lb = MAN_R * ((((-90 - SIL) % 360) + 360) % 360) * DEG, gb = MAN_R * Math.asin(2 / MAN_R);
  tubo("combcase", ring, 0.8, { name: "combcase.manifold", closed: true, tone: "mid", maxLength: 10, breaks: [Math.PI * MAN_R], gaps: [[Lb - gb, Lb + gb]], touch: ["combcase.conexao*"] });
}
// liner da câmara (aparece quando a carcaça sobe)
anel("comb", 100, 120, 15.6, 22.6, { tone: "hi", name: "comb.liner", inner: Ln(G.arcOf(AX, 104, 22.6, P) + G.arcOf(AX, 112, 22.6, P), { tone: "faint" }), extra: Dots(G.dotsOf(AX, 108, 22.6, 36, P, { fade: FADE }), { size: 0.5, tone: "lo" }) });
for (let i = 0; i < 12; i++) { const deg = (i / 12) * 360 + 15, F = G.frameAlong(on(100, 19, deg), [-1, 0, 0]); if (G.dot3([0, Math.cos(deg * DEG), Math.sin(deg * DEG)], V) < -0.3) continue; disco("comb", F, 0, 1.6, 1.4, { tone: "mid", name: "comb.swirler" }); }

// ================= TURBINAS =================
casca("hptcase", 120, 132, 20, 30.6, { tone: "hi", name: "hptcase.carcaca", arcos: G.arcOf(AX, 128.5, 30.6, P), arcosMid: G.arcOf(AX, 125.4, 30.6, P) + G.arcOf(AX, 126.6, 30.6, P), pontos: Dots(G.dotsOf(AX, 126, 30.6, 48, P, { fade: FADE }), { size: 0.4 }) });
rotor("hpt", 120, 131, () => 13.4, [121.5, 127].map((x) => ({ s: x, w: 2.6, tip: 19.4, count: 64 })));
anel("hpt", 131, 132, 13.4, 20, { tone: "lo", name: "hpt.vedacao" });   // vedação e suporte do mancal atrás do rotor
const LPT = (s) => 31 + (s - 132) * 0.27;
const LPT_S = Array.from({ length: 6 }, (_, i) => 135 + i * 7.4);
rotor("lpt", 132, 175.5, (x) => 15 + (x - 132) * 4 / 46, LPT_S.map((x) => ({ s: x, w: 3, tip: LPT(x) - 2.6, count: 80 })));
disco("lpt", AX, 175.5, 178, LPT(175.5) - 1.8, { tone: "lo", name: "lpt.armacao-mancal" });   // armação do mancal de trás
casca("lptcase", 132, 178, (x) => LPT(x) - 1.8, LPT, { tone: "hi", name: "lptcase.carcaca", arcos: LPT_S.map((s) => G.arcOf(AX, s + 4.5, LPT(s + 4.5), P, { slope: 0.27 })).join("") });
// anéis do controle ativo de folga (ACC): tubos perfurados em volta da carcaça, com o tubo que alimenta
const ACC_S = [139, 151, 163, 172];
for (const s of ACC_S) {
  const rr = LPT(s) + 1.25, phi = Math.atan2(V[2], V[1]), al = Math.acos(Math.max(-1, Math.min(1, (0.27 * V[0]) / Math.hypot(V[1], V[2]))));
  const ring = Array.from({ length: 97 }, (_, i) => on(s, rr, (phi + Math.PI) / DEG + (i / 96) * 360));
  const La = rr * ((((90 - (phi / DEG + 180)) % 360) + 360) % 360) * DEG, ga = rr * Math.asin(1.6 / rr);
  tubo("lptcase", ring, 0.75, { name: "lptcase.acc", closed: true, tone: "mid", maxLength: 12, breaks: [rr * (Math.PI - al), rr * (Math.PI + al)], gaps: s === 139 || s === 172 ? [[La - ga, La + ga]] : [], touch: ["lptcase.grampo*", "lptcase.conexao*"] });
  for (const d of [-55, -15, 25, 65]) { const deg = phi / DEG + d, b = on(s, LPT(s), deg); disco("lptcase", G.frameAlong(b, G.unit3(G.sub3(b, [s, 0, Z0]))), -0.2, 0.5, 0.55, { tone: "lo", name: "lptcase.grampo" }); }
}
const accTopo = (x) => Z0 + LPT(x) + 1.25 + 1.15;
for (const x of [139, 172]) caixa("lptcase", { x: x - 1.6, y: -1.6, w: 3.2, d: 3.2, r: 0.5 }, Z0 + LPT(x + 1.6) - 0.1, accTopo(x) - (Z0 + LPT(x + 1.6) - 0.1), { tone: "mid", name: "lptcase.conexao" });
cano("lptcase", [[139, 0, accTopo(139)], [139, 0, accTopo(139) + 19], [172, 0, accTopo(172) + 19], [172, 0, accTopo(172)]], 0.7, { name: "lptcase.acc-alimenta", tone: "hi", bend: 18 });

// ================= ARMAÇÃO TRASEIRA, BOCAL E CONE =================
casca("exhaust", 178, 189, 30, 44.6, { tone: "hi", name: "exhaust.armacao", pontos: Dots(G.dotsOf(AX, 178, 43.2, 56, P, { fade: FADE }), { size: 0.4 }) });
caixa("exhaust", { x: 180, y: -6, w: 8, d: 12, r: 1 }, Z0 + 44.4, 6, { tone: "mid", name: "exhaust.suporte-tras", extra: Dots([at([182, -3, Z0 + 50.4]), at([186, -3, Z0 + 50.4]), at([182, 3, Z0 + 50.4]), at([186, 3, Z0 + 50.4])], { size: 0.45 }) });
casca("exhaust", 189, 202, 37.6, 43.4, { tone: "mid", name: "exhaust.bocal", arcos: G.arcOf(AX, 195, 43.4, P) });
{
  const PL = (s) => 30 * Math.sqrt(Math.max(0, 1 - ((s - 186) / 54) ** 2));
  const plSlope = (s) => { const r = PL(s); return r > 0.3 ? (-900 * (s - 186)) / (54 * 54 * r) : -40; };
  const prof = [[186, 0]]; for (let i = 0; i <= 20; i++) { const s = 186 + i * 53.6 / 20; prof.push([s, PL(s), i > 0 && i < 20 ? 1 : 0]); } prof.push([240, 0]);
  turned("exhaust", AX, prof, { tone: "hi", smooth: { slope: plSlope, rows: 5 }, name: "exhaust.cone" });
}

// ================= CAIXA DE ACESSÓRIOS (no núcleo, embaixo) =================
const GB = { x: 56, y: -10, w: 42, d: 20, r: 3 }, GBZ = Z0 - 50;
caixa("agb", GB, GBZ, 12, { tone: "hi", name: "agb.caixa", bevel: 0.8, inner: Ln(k.sideSeam(GB, GBZ + 6, P, 3), { tone: "faint" }) });
for (const x of [62, 92]) caixa("agb", { x: x - 1.5, y: -1.5, w: 3, d: 3, r: 0.5 }, GBZ + 12, Z0 - HPC(x) - GBZ - 12, { tone: "lo", name: "agb.tirante" });
disco("agb", G.frameAlong([70, 0, GBZ + 12], [0, 0, 1]), 0, Z0 - HPC(70) - GBZ - 12 - 0.15, 2.2, { tone: "mid", name: "agb.eixo-radial" });
// na face que se vê: bomba de combustível, bomba de óleo, bomba hidráulica, gerador e partida
const FACE_Y = SIDE > 0 ? GB.y + GB.d : GB.y;
const acess = [[61, GBZ + 4.4, 3.2, 7, "agb.bomba-combustivel"], [70, GBZ + 6, 2.6, 6, "agb.bomba-oleo"], [78, GBZ + 5, 3.4, 8, "agb.bomba-hidraulica"], [90, GBZ + 6, 5.4, 11, "agb.gerador"]];
for (const [x, z, r, len, name] of acess) {
  const F = G.frameOf([x, FACE_Y, z], [0, SIDE, 0], [1, 0, 0], [0, 0, 1]);
  turned("agb", F, [[0, 0], [0, r + 1.2], [1, r + 1.2], [1, r], [len, r], [len + 0.8, r - 0.8], [len + 0.8, 0]], { tone: "hi", name, extra: Dots(G.dotsOf(F, 1, r + 0.6, 6, P, { all: true }), { size: 0.4 }) });
}
const PARTIDA = G.frameOf([GB.x, 0, GBZ + 6], [-1, 0, 0], [0, 1, 0], [0, 0, 1]);
turned("agb", PARTIDA, [[0, 0], [0, 5], [2, 5], [2, 4.2], [8.6, 4.2], [10.2, 3], [10.8, 0]], { tone: "hi", name: "agb.partida", extra: Dots(G.dotsOf(PARTIDA, 0, 4.4, 8, P, { all: true }), { size: 0.4 }) });

// ================= TUBOS E CABOS =================
// combustível: da bomba na caixa até o anel de injetores (solto da caixa quando o motor se abre)
const pc = [61, FACE_Y + SIDE * 7.8, GBZ + 4.4];
const MP = on(FN_S + 3.4, MAN_R, -90);
caixa("combcase", { x: MP[0] - 2, y: MP[1] - 2, w: 4, d: 4, r: 0.6 }, MP[2] - 1.6, 3.2, { tone: "mid", name: "combcase.conexao" });
cano("agb", [pc, [61, SIDE * 21, GBZ + 4.4], [61, SIDE * 21, GBZ - 6], [74, SIDE * 3, GBZ - 6], [MP[0] - 4, 0, GBZ - 6], [MP[0], 0, GBZ - 2], [MP[0], 0, MP[2] - 1.6]], 1.1, { name: "agb.linha-combustivel", free: [false, true], tone: "hi" });
// óleo: da bomba de óleo até o mancal da frente (na armação do fan)
const po = [70, FACE_Y + SIDE * 6.8, GBZ + 6];
cano("core", [po, [70, FACE_Y + SIDE * 9, GBZ + 6], [70, SIDE * 24, Z0 - 36], on(46, 39, SIDE > 0 ? -40 : 220), on(46, 33, SIDE > 0 ? -40 : 220)], 0.9, { name: "core.linha-oleo", free: [true, false], tone: "mid" });
// ar de sangria: duto grosso que sobe da bossa até a interface do pilone, com uma válvula
const top = [88, 0, Z0 + HPC(88) + 4];
cano("hpccase", [top, [88, 0, Z0 + 33], [80, 0, Z0 + 40], [58, 0, Z0 + 40]], 2.6, { name: "hpccase.duto-bleed", tone: "hi" });
caixa("hpccase", { x: 54, y: -4.5, w: 4, d: 9, r: 1 }, Z0 + 35.5, 9, { tone: "mid", name: "hpccase.flange-pilone" });
// cabos do FADEC: do conector até a carcaça do compressor (soltos quando a carcaça sobe)
conectores.forEach((c, i) => cabo("eec", [c, [c[0], c[1], Z0 + 22 - i * 2], [46 + (2 - i) * 5, SIDE * (72 - i * 1.5), Z0 + 21 - i * 2], [46 + (2 - i) * 5, SIDE * (72 - i * 1.5), Z0 - 6], on(66 + (2 - i) * 8, HPC(66 + (2 - i) * 8) + 6, SIDE > 0 ? -15 : 195), on(66 + (2 - i) * 8, HPC(66 + (2 - i) * 8), SIDE > 0 ? -15 : 195)], { name: "eec.cabo", free: [false, true], bundle: "harness", bend: 14 }));

// ================= ORDEM DE PINTURA MEDIDA E SAÍDA =================
A.settle(R, P, { states: [0, ...A.prefixStates(STAGGER, { shares: [0.5, 1] }), 1] });
items.sort((a, b) => a.key - b.key);
const DENTRO = new Set(["spinner", "fan", "booster", "hpc", "comb", "hpt", "lpt", "stand"]);
const groups = items.map((it, i) => { const [mx, my, mz] = it.move; return `<g class="it"${DENTRO.has(it.piece) ? "" : " data-g"} data-piece="${it.piece}" data-r="${it.ride ?? it.piece}" data-k="${it.key.toFixed(2)}" data-m="${mx.toFixed(1)},${my.toFixed(1)},${mz.toFixed(1)}" data-i="${i}">${it.svg}</g>`; });
const nSolidos = items.filter((it) => !it.route).length;

const ORDER = ["spinner", "fan", "booster", "fancase", "eec", "core", "hpccase", "hpc", "combcase", "comb", "hptcase", "hpt", "lptcase", "lpt", "exhaust", "agb"];
const unit = (v) => { const o = at([0, 0, 0]), p = at(v); return [p[0] - o[0], p[1] - o[1]]; };
const DATA = { V, EX: unit([1, 0, 0]), EY: unit([0, 1, 0]), EZ: unit([0, 0, 1]), stagger: STAGGER, spring: SPRING, order: ORDER, pieces: Object.fromEntries(Object.entries(PIECES).map(([id, p]) => [id, { name: p.name, say: p.say }])) };

const svg = `<svg xmlns="http://www.w3.org/2000/svg" class="iso-svg gx-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="O motor GEnx-2B do Boeing 747-8 sem a nacele, num suporte de transporte: o cone e o fan de 18 pás na frente, a carcaça do fan com as palhetas guia, o FADEC e o tanque de óleo; atrás, o núcleo com a carcaça do compressor de alta, os atuadores das palhetas variáveis, o duto de ar de sangria, a câmara de combustão com 18 injetores e o anel de combustível, as turbinas com os anéis de ar de resfriamento, a armação traseira, o bocal e o cone de escape; embaixo, a caixa de acessórios com bombas, gerador e motor de partida."><g class="gx-back">${halo}</g><g class="gx-engine">${groups.join("")}</g></svg>`;

const LIVE = `
const D = ${JSON.stringify(DATA)};
const stage = document.querySelector(".gx-stage"), engine = stage.querySelector(".gx-engine");
const readout = document.querySelector("[data-readout]"), botoes = [...document.querySelectorAll("[data-peca]")];
const svgEl = stage.querySelector("svg"), FULL = svgEl.viewBox.baseVal, F0 = [FULL.x, FULL.y, FULL.width, FULL.height];
const raio = document.querySelector(".gx-rx");
let CLOSE = null, shownBox = "";
function closeBox() {
  // enquadra o motor montado (o desenho todo em repouso) mantendo a proporção do quadro
  let b; try { b = engine.getBBox(); } catch (e) { return null; }
  if (!b || b.width < 10) return null;
  const pad = 10, ar = F0[2] / F0[3];
  let w = b.width + pad * 2, h = b.height + pad * 2;
  if (w / h > ar) h = w / ar; else w = h * ar;
  w = Math.min(w, F0[2]); h = Math.min(h, F0[3]);
  let x = b.x + b.width / 2 - w / 2, y = b.y + b.height / 2 - h / 2;
  x = Math.max(F0[0], Math.min(x, F0[0] + F0[2] - w)); y = Math.max(F0[1], Math.min(y, F0[1] + F0[3] - h));
  return [x, y, w, h];
}
function frameView() {
  if (!CLOSE) { CLOSE = closeBox(); if (!CLOSE) return; }
  let z = 0; for (const id of D.stagger) z = Math.max(z, piece[id].x);
  z = Math.max(0, Math.min(1, z)); z = z * z * (3 - 2 * z);
  const v = CLOSE.map((c, i) => (c + (F0[i] - c) * z).toFixed(2)).join(" ");
  if (v !== shownBox) { shownBox = v; svgEl.setAttribute("viewBox", v); }
}
function setXray(v) {
  v ? stage.setAttribute("data-xray", "") : stage.removeAttribute("data-xray");
  raio.setAttribute("aria-pressed", String(v));
  if (!selected) say(v ? "raio X · compressores, câmara e turbinas por dentro" : rest());
}
const still = matchMedia("(prefers-reduced-motion: reduce)");
const nodes = [...engine.querySelectorAll(".it")].map((el) => ({ el, piece: el.dataset.piece, ride: el.dataset.r, key: +el.dataset.k, m: el.dataset.m.split(",").map(Number), shown: "" }));
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
    const sh = piece[n.ride].x;
    const tx = (D.EX[0] * n.m[0] + D.EY[0] * n.m[1] + D.EZ[0] * n.m[2]) * sh, ty = (D.EX[1] * n.m[0] + D.EY[1] * n.m[1] + D.EZ[1] * n.m[2]) * sh;
    const t = sh === 0 ? "" : "translate(" + tx.toFixed(2) + " " + ty.toFixed(2) + ")";
    if (t !== n.shown) { n.shown = t; t ? n.el.setAttribute("transform", t) : n.el.removeAttribute("transform"); }
  }
  const next = nodes.map((_, i) => i).sort((a, b) => nodes[a].key + nodes[a].lift * piece[nodes[a].ride].x - (nodes[b].key + nodes[b].lift * piece[nodes[b].ride].x));
  if (next.some((v, i) => v !== order[i])) { const f = document.createDocumentFragment(); for (const i of next) f.appendChild(nodes[i].el); engine.appendChild(f); order = next; }
  frameView();
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
new IntersectionObserver((e) => { visible = e[e.length - 1].isIntersecting; if (visible) { frameView(); run(); } }, { rootMargin: "120px 0px" }).observe(stage);
stage.addEventListener("click", (e) => { grab(); const g = e.target.closest(".it"); if (apart && g && g.dataset.piece !== "stand") { select(g.dataset.piece === selected ? null : g.dataset.piece); return; } setApart(!apart); if (!apart) select(null); run(); });
stage.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); grab(); setApart(!apart); run(); } if (e.key === "Escape") { grab(); select(null); setApart(false); } });
botoes.forEach((b) => b.addEventListener("click", () => { grab(); setApart(true); select(b.dataset.peca); run(); }));
raio.addEventListener("click", () => { grab(); setXray(raio.getAttribute("aria-pressed") !== "true"); });
addEventListener("resize", () => { CLOSE = null; frameView(); });
place(); say(rest());
`;

const CSS = `body{margin:0}.iso-page{width:100%!important;margin:0!important;padding:14px 18px 18px;box-sizing:border-box}.iso-plate{padding:44px 12px 58px!important;box-shadow:none!important;border-radius:12px!important}
.gx-stage{cursor:pointer;touch-action:pan-y;outline:none}.gx-stage svg{display:block;width:100%;height:auto}
.gx-stage[data-focus] .it:not([data-on]){opacity:.22;transition:opacity .3s}.gx-stage .it{transition:opacity .3s}
.gx-stage .it[data-on] .iso-edge{stroke:var(--anatomy-lit)!important;stroke-width:1.1}
.gx-stage[data-xray] .it[data-g]{opacity:.1}.gx-stage[data-xray] .it[data-g][data-on]{opacity:.5}
.gx-stage[data-xray] .it:not([data-g]):not([data-piece=stand]) .iso-edge{stroke:var(--anatomy-lit)}
.gx-ctl{display:flex;justify-content:center;margin-top:8px}.gx-rx{display:flex;gap:8px;align-items:center;border:1px solid var(--anatomy-mid);background:transparent;color:inherit;border-radius:999px;padding:7px 16px;font:inherit;font-size:13px;letter-spacing:.06em;cursor:pointer;-webkit-tap-highlight-color:transparent}
.gx-rx::before{content:"";width:14px;height:14px;border-radius:50%;border:1.5px solid currentColor;box-sizing:border-box}
.gx-rx[aria-pressed=true]{border-color:var(--anatomy-lit);color:var(--anatomy-lit)}.gx-rx[aria-pressed=true]::before{background:currentColor}
.gx-lista{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:10px}.gx-lista button{display:flex;gap:7px;align-items:center;text-align:left;border:1px solid var(--anatomy-mid);background:transparent;color:inherit;border-radius:8px;padding:5px 6px;font:inherit;font-size:11.5px;line-height:1.25;cursor:pointer;-webkit-tap-highlight-color:transparent}
.gx-lista button b{flex:0 0 19px;height:19px;border-radius:50%;display:grid;place-items:center;font-size:10.5px;border:1px solid currentColor}.gx-lista button[aria-pressed=true]{border-color:var(--anatomy-lit);color:var(--anatomy-lit)}`;
const body = k.plateHtml({
  fig: "Fig 1", title: "GEnx-2B · 747-8", hint: "Toque para desmontar",
  readout: "montado · GEnx-2B",
  keys: [{ mark: "raised", label: `${nSolidos} peças sólidas e ${items.length - nSolidos} trechos de tubo e cabo` }, { mark: "lit", label: "Toque num módulo (ou num nome) para ver o que ele faz" }, { mark: "raised", label: "Raio X: as carcaças ficam transparentes e mostram os compressores, a câmara e as turbinas" }],
  caption: "O motor do 747-8 sem a nacele, num suporte de transporte, e desmontado em módulos como na manutenção. Proporções e quantidades reais: fan de 18 pás, booster de 3 estágios, compressor de alta de 10, câmara TAPS com 18 injetores, turbina de alta de 2 e turbina de baixa de 6. Tubos, cabos e equipamentos foram simplificados e algumas posições, ajustadas para aparecerem.",
  body: `<div class="gx-stage" tabindex="0" role="button" aria-label="Toque ou Enter para desmontar e montar o motor">${svg}</div><div class="gx-ctl"><button type="button" class="gx-rx" aria-pressed="false">Raio X</button></div><div class="gx-lista">${ORDER.map((id, i) => `<button type="button" data-peca="${id}"><b>${i + 1}</b>${PIECES[id].name}</button>`).join("")}</div>`,
});
const file = THEME === "light" ? "fig-genx-light.html" : "fig-genx.html";
const page = k.pageHtml({ title: "GEnx-2B", theme: THEME, body: `<style>${CSS}</style>${body}`, script: kitScript() + LIVE });
writeFileSync(join(HERE, "../../aviao/assets", file), page);
console.log("wrote", file, `${(page.length / 1024).toFixed(0)} KB`, `${items.length} itens, ${nSolidos} sólidos`);
// --rapido: só uma em cada 6 poses do voo (para iterar); sem ele, todas
{ const fr = A.explodeStates(R.order, R.spring).frames; A.auditOrExit(R, P, process.argv.includes("--rapido") ? { frames: fr.filter((_, i) => i % 6 === 0) } : {}); }
