// Fig: o motor GEnx-2B do Boeing 747-8 pendurado numa estrutura de teste, com um quarto cortado para mostrar
// por dentro o fan, o booster, o compressor de alta, a câmara de combustão e as turbinas. A manete muda a
// potência: o fan gira, a chama acende e os jatos frio (do fan) e quente (do núcleo) crescem (WebGL).
// Construído com a skill Anatomy (MIT): peças torneadas (kit/lathe), tubos (kit/tube), ordem de pintura
// medida (A.settle) e auditoria (node build.mjs --audit).
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

// ---------- Módulos (tocar num nome destaca o módulo) ----------
const PIECES = {
  spinner: { name: "Cone do fan (spinner)", say: "cone do fan · gira com o eixo de baixa (N1)" },
  fan: { name: "Fan · 18 pás", say: "fan · 18 pás de fibra de carbono · empurra ~90% do empuxo (fluxo frio)" },
  booster: { name: "Booster (compressor de baixa)", say: "booster · 3 estágios, gira junto com o fan" },
  fancase: { name: "Carcaça do fan e palhetas guia", say: "carcaça do fan · segura uma pá que se solte · 44 palhetas guia" },
  agb: { name: "Caixa de acessórios", say: "caixa de acessórios · na carcaça do fan · bombas, gerador e partida" },
  eec: { name: "FADEC (EEC)", say: "FADEC · o computador que controla o motor" },
  core: { name: "Armação do fan", say: "armação do fan e válvulas de sangria (VBV)" },
  hpc: { name: "Compressor de alta (rotor)", say: "compressor de alta · 10 estágios · pressão ~23 vezes maior" },
  hpccase: { name: "Carcaça do compressor de alta", say: "carcaça do HPC · anéis que giram as palhetas variáveis" },
  comb: { name: "Câmara de combustão (TAPS)", say: "câmara TAPS · mistura ar e combustível · a chama passa de 1.700 °C" },
  combcase: { name: "Carcaça da câmara e injetores", say: "carcaça da câmara · 18 injetores no anel de combustível" },
  hpt: { name: "Turbina de alta (rotor)", say: "turbina de alta · 2 estágios · gira o compressor de alta (N2)" },
  hptcase: { name: "Carcaça da turbina de alta", say: "carcaça da HPT · controla a folga das pás" },
  lpt: { name: "Turbina de baixa (rotor)", say: "turbina de baixa · 6 estágios · gira o fan e o booster (N1)" },
  lptcase: { name: "Carcaça da turbina de baixa", say: "carcaça da LPT" },
  exhaust: { name: "Bocal e cone de escape", say: "armação traseira, bocal do núcleo e cone · sai o jato quente" },
  nacele: { name: "Nacele e reversor", say: "nacele · entrada de ar, capô do fan e reversor · o duto do fluxo frio" },
  stand: { name: "Estrutura de teste e pilone", say: "pilone e estrutura de teste" },
};
for (const p of Object.values(PIECES)) p.move = [0, 0, 0];
const STAGGER = [];
const SPRING = { stagger: 0.05, stiffness: 52, damping: 13, substeps: 4 };

// ---------- Câmera ----------
const fitPts = [[-48, 0, Z0 + 81], [-48, 0, Z0 - 81], [-48, 81, Z0], [-48, -81, Z0], [40, 81, Z0], [40, 0, Z0 - 81], [245, 0, Z0], [290, 0, Z0 + 20], [-60, -105, 0], [250, -105, 0], [250, 95, 0], [-60, 95, 0], [60, -95, Z0 + 125], [60, 0, Z0 + 125], [150, 0, Z0 + 125]];
const P = k.fitProjection(fitPts, W, H, { pad: 12, azimuth: 146, elevation: 22 });
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
const RIDE = {};
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
function tubo(piece, route, r, { name, tone = "hi", bias = 0, gaps = [], breaks = [], ends = [true, true], closed = false, maxLength = 20, spacing, free = [false, false], limp = false, touch, bundle, rims } = {}) {
  const id = nameFor(name ?? `${piece}.tubo`);
  R.route(id, route, r, { owner: id, touch, bundle, limp, gaps, closed, ends, free, rims, piece, move: PIECES[RIDE[piece] ?? piece].move, ride: RIDE[piece] ?? piece });
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
  const fn = (frente) => A.prism(F, frente ? [[0, -400], [400, -400], [400, 400], [0, 400]] : [[-400, -400], [0, -400], [0, 400], [-400, 400]], -400, 400);
  fn.lado = (p) => G.dot3(n, G.sub3(p, A_)) > 0;
  return fn;
}
// Corte de um quarto (o de cima, do lado de quem olha): o material das cascas fica só fora desta cunha.
const CUT = SIDE > 0 ? [-8, 78] : [102, 188];
const naCunha = (deg) => { const d = ((((deg - CUT[0]) % 360) + 360) % 360); return d > 0 && d < CUT[1] - CUT[0]; };
const CUNHA = A.prism(AX, [[0, 0], ...Array.from({ length: 7 }, (_, i) => { const d = (CUT[0] + (i / 6) * (CUT[1] - CUT[0])) * DEG; return [300 * Math.cos(d), 300 * Math.sin(d)]; })], -1000, 1000);
const pathOf = (pts, close) => "M" + pts.map((p) => at(p).map((v) => v.toFixed(1)).join(" ")).join("L") + (close ? "Z" : "");
// Casca cortada: metade de trás (parede de dentro vista pelo corte) e metade da frente (parede de fora, faces do
// corte com hachura, boca). rIn/rOut são números ou funções de s. Cada metade registra a forma de verdade.
function casca(piece, s0, s1, rIn, rOut, { tone = "hi", name, segs, linhas = [], linhasMid = [], parafusos = [], naFace, corte = true, extraTras = "", brilho = false } = {}) {
  const fi = typeof rIn === "function" ? rIn : () => rIn, fo = typeof rOut === "function" ? rOut : () => rOut;
  const curvo = typeof rIn === "function" || typeof rOut === "function";
  const M = segs ?? (curvo ? 12 : 1);
  const S_ = Array.from({ length: M + 1 }, (_, j) => s0 + (j / M) * (s1 - s0));
  const der = (f, x) => { const a = Math.max(s0, x - 0.05), b = Math.min(s1, x + 0.05); return (f(b) - f(a)) / (b - a); };
  const faceS = G.dot3(AX.a, V) > 0 ? s1 : s0, farS = faceS === s0 ? s1 : s0;
  const corteS = planoSilhueta(s0, s1, fo), smid = (s0 + s1) / 2;
  const frenteDe = (deg, x = smid, f = fo) => corteS.lado(on(x, f(x), deg));
  // ângulos do material, em graus: de CUT[1] até CUT[0] + 360 (sem corte: a volta inteira)
  const a0 = corte ? CUT[1] : 0, a1 = corte ? CUT[0] + 360 : 360, NA = Math.ceil((a1 - a0) / 2);
  const ths = Array.from({ length: NA + 1 }, (_, i) => a0 + (i / NA) * (a1 - a0));
  const out = { true: { f: [], e: [], extra: [] }, false: { f: [], e: [], extra: [] } }, chama = [];
  const nOut = (x, deg) => G.unit3([-der(fo, x), Math.cos(deg * DEG), Math.sin(deg * DEG)]);
  const nIn = (x, deg) => G.unit3([der(fi, x), -Math.cos(deg * DEG), -Math.sin(deg * DEG)]);
  const strip = (a, b, f, d0, d1) => [...ths.filter((t) => t >= d0 - 1e-9 && t <= d1 + 1e-9).map((t) => on(a, f(a), t)), ...ths.filter((t) => t >= d0 - 1e-9 && t <= d1 + 1e-9).reverse().map((t) => on(b, f(b), t))];
  for (let j = 0; j < M; j++) {
    const a = S_[j], b = S_[j + 1], sm = (a + b) / 2;
    for (const [f, nf, quem] of [[fo, nOut, "out"], [fi, nIn, "in"]]) {
      let run = null;
      const flush = () => { if (run) { const d = pathOf(strip(a, b, f, run.d0, run.d1), true); out[run.half].f.push(`<path ${run.cls} d="${d}"/>`); if (brilho && quem === "in") chama.push(d); run = null; } };
      for (let i = 0; i < NA; i++) {
        const am = (ths[i] + ths[i + 1]) / 2, n = nf(sm, am), half = frenteDe(am, sm, f);
        const ok = G.dot3(n, V) > 0 && (quem === "out" || !half);
        if (!ok) { flush(); continue; }
        const cls = shade(n);
        if (run && run.cls === cls && run.half === half) run.d1 = ths[i + 1];
        else { flush(); run = { cls, half, d0: ths[i], d1: ths[i + 1] }; }
      }
      flush();
    }
    // contorno ao longo de s onde a parede de fora visível começa ou acaba
    for (let i = 0; i <= NA; i++) {
      const vis = (k2) => (k2 < 0 || k2 >= NA ? null : G.dot3(nOut(sm, (ths[k2] + ths[k2 + 1]) / 2), V) > 0 ? frenteDe((ths[k2] + ths[k2 + 1]) / 2, sm) : null);
      const A_ = vis(i - 1), B_ = vis(i);
      if (A_ !== B_) { const quem = A_ ?? B_; out[quem].e.push(k.segment(on(a, fo(a), ths[i]), on(b, fo(b), ths[i]), P)); }
    }
  }
  // arcos (aros, linhas, rebites) só onde há material e de onde se vê
  const arco = (x, r, cond) => { const runs = []; let run = []; for (const t of ths) { if (cond(t)) run.push(on(x, r(x), t)); else if (run.length) { runs.push(run); run = []; } } if (run.length) runs.push(run); return runs.filter((q) => q.length > 1).map((q) => pathOf(q)).join(""); };
  const visO = (x) => (t) => G.dot3(nOut(x, t), V) > 0, visI = (x) => (t) => G.dot3(nIn(x, t), V) > 0;
  const fn = faceS === s0 ? [-1, 0, 0] : [1, 0, 0];
  for (const half of [true, false]) {
    const H_ = (t, x = faceS, f = fo) => frenteDe(t, x, f) === half;
    // boca (face da ponta da frente)
    let run = [];
    const fecha = () => { if (run.length > 1) out[half].f.push(`<path ${shade(fn)} d="${pathOf([...run.map((t) => on(faceS, fo(faceS), t)), ...[...run].reverse().map((t) => on(faceS, fi(faceS), t))], true)}"/>`); run = []; };
    for (const t of ths) { if (H_(t)) run.push(t); else fecha(); } fecha();
    out[half].e.push(arco(faceS, fo, (t) => H_(t)) + arco(faceS, fi, (t) => H_(t, faceS, fi)) + arco(farS, fo, (t) => H_(t, farS) && visO(farS)(t)) + (half ? "" : arco(farS, fi, (t) => H_(t, farS, fi) && visI(farS)(t))));
    const lf = linhas.map((x) => arco(x, fo, (t) => H_(t, x) && visO(x)(t))).join(""), lm = linhasMid.map((x) => arco(x, fo, (t) => H_(t, x) && visO(x)(t))).join("");
    if (lf) out[half].extra.push(Ln(lf, { tone: "faint" }));
    if (lm) out[half].extra.push(Ln(lm, { tone: "mid" }));
    for (const { s: x, r: rr, n: cnt } of parafusos) {
      const pts = Array.from({ length: cnt }, (_, q) => a0 + ((q + 0.5) / cnt) * (a1 - a0)).filter((t) => H_(t, x) && visO(x)(t)).map((t) => at(on(x, typeof rr === "function" ? rr(x) : rr, t)));
      if (pts.length) out[half].extra.push(Dots(pts, { size: 0.42 }));
    }
    if (naFace) { const d = naFace(H_, faceS, ths); if (d) out[half].extra.push(Ln(d, { tone: "faint" })); }
  }
  // faces do corte: o perfil da parede no plano da cunha, com hachura
  const prof = [...S_.map((x) => [x, fo(x)]), ...[...S_].reverse().map((x) => [x, fi(x)])];
  if (corte) for (const [deg, n] of [[CUT[1], [0, Math.sin(CUT[1] * DEG), -Math.cos(CUT[1] * DEG)]], [CUT[0], [0, -Math.sin(CUT[0] * DEG), Math.cos(CUT[0] * DEG)]]]) {
    if (G.dot3(n, V) <= 0) continue;
    const half = frenteDe(deg, smid, (x) => (fi(x) + fo(x)) / 2);
    const poly = prof.map(([x, r]) => on(x, r, deg));
    const nh = Math.max(1, Math.floor((s1 - s0) / 2.2));
    const hach = Array.from({ length: nh }, (_, q) => { const x = s0 + ((q + 0.5) / nh) * (s1 - s0), x2 = Math.min(s1, x + 1.2); return k.segment(on(x, fi(x), deg), on(x2, fo(x2), deg), P); }).join("");
    out[half].f.push(`<path class="iso-top" d="${pathOf(poly, true)}"/>`);
    out[half].extra.push(Ln(hach, { tone: "faint" }));
    out[half].e.push(pathOf(poly, true));
  }
  const id = nameFor(name ?? `${piece}.casca`);
  const cutF = corte ? [corteS(false), CUNHA] : corteS(false), cutT = corte ? [corteS(true), CUNHA] : corteS(true);
  const shF = record(A.lathe(AX, prof, { name: `${id}.frente`, owner: id, cut: cutF }));
  const shT = record(A.lathe(AX, prof, { name: `${id}.tras`, owner: id, cut: cutT }));
  for (const half of [false, true]) {
    const o = out[half];
    if (!o.f.length && !o.extra.length) continue;
    const ang = (Math.atan2(NV[2], NV[1]) / DEG) + (half ? 0 : 180);
    R.put({ piece, ride: piece, at: on((s0 + s1) / 2, fo((s0 + s1) / 2), ang), move: PIECES[piece].move, name: `${id}.${half ? "frente" : "tras"}`, shapes: [half ? shF : shT],
      svg: `<g class="iso-solid">${o.f.join("")}${o.extra.join("")}${!half && chama.length ? `<path class="gx-chama" d="${chama.join("")}"/>` : ""}<path class="iso-line iso-edge" data-tone="${tone}" d="${o.e.join("")}"/>${half ? "" : extraTras}</g>` });
  }
  return [shF, shT];
}

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
// carcaça do fan: anéis em casca, cortados no mesmo quarto que a nacele
casca("fancase", -6, -2, 59.6, 66.5, { tone: "mid", name: "fancase.flange-frente", parafusos: [{ s: -6, r: 64.2, n: 90 }] });
casca("fancase", -2, 26, 59.6, 64.4, { tone: "lo", name: "fancase.contencao", linhas: [6, 13, 20] });
casca("fancase", 26, 41, 59.6, 63.2, { tone: "mid", name: "fancase.traseira", linhas: [29, 37] });
casca("fancase", 31, 32.6, 63.2, 65.4, { tone: "mid", name: "fancase.reforco" });
casca("fancase", 41, 43.5, 59.6, 67, { tone: "mid", name: "fancase.flange-tras", parafusos: [{ s: 41, r: 65.4, n: 96 }] });
// palhetas guia (OGV) entre o núcleo e a carcaça
casca("fancase", 37, 41, 32.6, 59.6, { tone: "mid", name: "fancase.ogv", naFace: (H_, x, ths) => Array.from({ length: 44 }, (_, q) => (q / 44) * 360 + 2).filter((t) => !naCunha(t) && !naCunha(t + 3) && H_(t)).map((t) => k.segment(on(x, 33, t), on(x, 59.2, t + 3), P)).join("") });
// FADEC (EEC): caixa com aletas presa no lado de baixo da carcaça, com três conectores
const EEC = { x: 4, y: SIDE > 0 ? 61.5 : -66.5, w: 20, d: 5, r: 1.2 }, EZ = Z0 - 36;
for (const x of [7, 21]) { const deg = Math.asin(-30 / 64.4) / DEG, b = on(x, 64.4, SIDE > 0 ? deg : 180 - deg), n = G.unit3(G.sub3(b, [x, 0, Z0])), t = (61.5 - Math.abs(b[1])) / Math.abs(n[1]) - 0.2; disco("eec", G.frameAlong(b, n), -0.15, t, 1.0, { tone: "lo", name: "eec.suporte" }); }
caixa("eec", EEC, EZ, 14, { tone: "hi", name: "eec.caixa", bevel: 0.7, inner: Ln(Array.from({ length: 7 }, (_, i) => k.segment([EEC.x + 3 + i * 2.4, EEC.y + (SIDE > 0 ? EEC.d : 0), EZ], [EEC.x + 3 + i * 2.4, EEC.y + (SIDE > 0 ? EEC.d : 0), EZ + 14], P)).join(""), { tone: "faint" }) });
for (const x of [8, 14, 20]) disco("eec", G.frameOf([x, EEC.y + (SIDE > 0 ? EEC.d : 0), EZ + 3.5], [0, SIDE, 0], [1, 0, 0], [0, 0, 1]), 0, 2.4, 1.6, { tone: "mid", name: "eec.conector" });
// tanque de óleo na carcaça, mais embaixo, com duas sapatas
const TQ_DEG = SIDE > 0 ? -58 : 238, TQ_RR = 4.6, TQ_R = 64.4 + 1.5 + TQ_RR;
const TQ = G.frameOf(on(2, TQ_R, TQ_DEG), [1, 0, 0], [0, 1, 0], [0, 0, 1]);
turned("fancase", TQ, [[0, 0], [0, 3.6], [1.0, TQ_RR], [22, TQ_RR], [23.4, 3.6], [23.4, 0]], { tone: "hi", name: "fancase.tanque-oleo", inner: Ln(G.arcOf(TQ, 11.7, TQ_RR, P), { tone: "faint" }) });
for (const x of [7, 20]) { const b = on(x, 64.4, TQ_DEG); disco("fancase", G.frameAlong(b, G.unit3(G.sub3(b, [x, 0, Z0]))), 0, 1.5, 1.4, { tone: "lo", name: "fancase.suporte-tanque" }); }
// caixa de acessórios presa embaixo da carcaça do fan (como no GEnx-2B), com bombas, gerador e partida
const GB = { x: -1, y: -10, w: 31, d: 20, r: 3 }, GBZ = Z0 - 64.4 - 10;
caixa("agb", GB, GBZ, 10, { tone: "hi", name: "agb.caixa", bevel: 0.8, inner: Ln(k.sideSeam(GB, GBZ + 5, P, 3), { tone: "faint" }) });
const FACE_Y = SIDE > 0 ? GB.y + GB.d : GB.y;
for (const [x, z, r, len, name] of [[3.5, GBZ + 4.4, 3.0, 6, "agb.bomba-combustivel"], [11, GBZ + 5, 2.2, 5, "agb.bomba-oleo"], [18.5, GBZ + 4.6, 2.8, 7, "agb.bomba-hidraulica"], [27, GBZ + 5, 3.4, 9, "agb.gerador"]]) {
  const F = G.frameOf([x, FACE_Y, z], [0, SIDE, 0], [1, 0, 0], [0, 0, 1]);
  turned("agb", F, [[0, 0], [0, r + 1.0], [1, r + 1.0], [1, r], [len, r], [len + 0.8, r - 0.8], [len + 0.8, 0]], { tone: "hi", name, extra: Dots(G.dotsOf(F, 1, r + 0.5, 6, P, { all: true }), { size: 0.4 }) });
}
const PARTIDA = G.frameOf([GB.x + GB.w, 0, GBZ + 5], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
turned("agb", PARTIDA, [[0, 0], [0, 4.4], [1.6, 4.4], [1.6, 3.6], [6.4, 3.6], [7.4, 2.6], [7.8, 0]], { tone: "hi", name: "agb.partida", extra: Dots(G.dotsOf(PARTIDA, 0, 3.9, 8, P, { all: true }), { size: 0.4 }) });

// ================= NÚCLEO: ARMAÇÃO DO FAN =================
rotor("booster", 22, 41, (x) => 19 + (x - 22) * 2 / 21.5, [25, 31, 37].map((x) => ({ s: x, w: 2.4, tip: 29.2, count: 64 })));
casca("fancase", 22, 37, 29.6, 32.6, { tone: "hi", name: "fancase.divisor" });
const ARM = turned("core", AX, [[41, 0], [41, 33], [48, 33], [54, 27.6], [54, 0]], { tone: "mid", name: "core.armacao" });
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
const VSV = HPC_S.slice(0, 6).map((x) => x + 0.9);
const HPCC = casca("hpccase", 54, 98, (x) => HPC(x) - 1.8, HPC, { tone: "hi", name: "hpccase.carcaca", linhas: HPC_S.map((x) => x + 2), linhasMid: VSV.flatMap((x) => [x - 0.5, x + 0.5]), parafusos: VSV.map((x) => ({ s: x, r: HPC, n: 40 })) });
// dois atuadores das palhetas variáveis (fora do corte)
for (const deg of SIDE > 0 ? [100, 125] : [80, 55]) {
  const a = on(57, HPC(57) + 4.4, deg), b = on(83, HPC(83) + 4.4, deg);
  const F = G.frameAlong(a, G.unit3(G.sub3(b, a)));
  turned("hpccase", F, [[0, 0], [0, 1.6], [1, 2.2], [13, 2.2], [14, 1.6], [14, 0]], { tone: "hi", name: "hpccase.atuador" });
  disco("hpccase", F, 14, 23, 0.8, { tone: "mid", name: "hpccase.haste" });
  for (const [s, topo] of [[3, -2.0], [23, -0.6]]) { const c = G.pointOf(F, s, 0, 0), xs = c[0], n = G.unit3(G.sub3(c, [xs, 0, Z0])), alt = Math.hypot(c[1], c[2] - Z0) - HPC(xs); disco("hpccase", G.frameAlong(c, n), -alt + 0.05, topo, 1.1, { tone: "lo", name: "hpccase.pe-atuador" }); }
}
// saída de ar de sangria no alto: um duto curto até a carenagem do núcleo
const BLEED = on(88, HPC(88), 90);
disco("hpccase", G.frameAlong(BLEED, [0, 0, 1]), -1.2, 4, 4.2, { tone: "mid", name: "hpccase.bossa-bleed", meta: { seated: true, cut: HPCC } });

// ================= CÂMARA DE COMBUSTÃO =================
const CB = (s) => 23.6 + 6.4 * Math.sin(Math.min(1, Math.max(0, (s - 98) / 22)) * Math.PI);
const CBC = casca("combcase", 98, 120, 23, CB, { tone: "hi", name: "combcase.carcaca", segs: 22, linhas: [109] });
const FN = 18, FN_S = 104, MAN_R = CB(FN_S) + 5;
for (let i = 0; i < FN; i++) {
  const deg = (i / FN) * 360 + 10, base = on(FN_S, CB(FN_S) - 0.3, deg), n = G.unit3(G.sub3(base, [FN_S, 0, Z0]));
  if (G.dot3(n, V) < 0.1 || naCunha(deg) || naCunha(deg - 6) || naCunha(deg + 6)) continue;
  const F = G.frameAlong(base, n);
  disco("combcase", F, -1.2, 2.4, 1.9, { tone: "mid", name: "combcase.injetor", meta: { seated: true, cut: CBC } });
  disco("combcase", F, 2.4, 3.4, 1.2, { tone: "lo", name: "combcase.injetor-tampa" });
}
{
  // anel de combustível: cortado na cunha (as pontas são cortes de seção), preso por quatro suportes
  const a0 = CUT[1] + 4, a1 = CUT[0] + 356, ring = Array.from({ length: 61 }, (_, i) => on(FN_S + 3.4, MAN_R, a0 + (i / 60) * (a1 - a0)));
  const phi = Math.atan2(V[2], V[1]) / DEG, L = (deg) => MAN_R * (deg - a0) * DEG;
  const sil = [phi + 90, phi + 270].map((d) => { let x = d; while (x < a0) x += 360; while (x > a1) x -= 360; return x; }).filter((d) => d > a0 && d < a1);
  tubo("combcase", ring, 0.8, { name: "combcase.manifold", tone: "mid", maxLength: 10, breaks: sil.map(L), ends: [false, false], touch: ["combcase.suporte-anel*"] });
  for (const d of [a0 + 20, a0 + 110, a0 + 190, a1 - 20]) { const b = on(FN_S + 3.4, CB(FN_S + 3.4), d); disco("combcase", G.frameAlong(b, G.unit3(G.sub3(b, [FN_S + 3.4, 0, Z0]))), -0.4, MAN_R - CB(FN_S + 3.4) - 0.8, 0.6, { tone: "lo", name: "combcase.suporte-anel" }); }
}
// liner (parede da chama), também cortado: por dentro dele aparece a chama
casca("comb", 100, 120, 15.6, 22.6, { tone: "hi", name: "comb.liner", linhas: [104, 112], parafusos: [{ s: 108, r: 22.6, n: 60 }], brilho: true });
for (let i = 0; i < 12; i++) { const deg = (i / 12) * 360 + 15, F = G.frameAlong(on(100, 19, deg), [-1, 0, 0]); if (G.dot3([0, Math.cos(deg * DEG), Math.sin(deg * DEG)], V) < -0.3 || naCunha(deg) || naCunha(deg - 5) || naCunha(deg + 5)) continue; disco("comb", F, 0, 1.6, 1.4, { tone: "mid", name: "comb.swirler" }); }

// ================= TURBINAS =================
casca("hptcase", 120, 132, 20, 30.6, { tone: "hi", name: "hptcase.carcaca", linhas: [128.5], linhasMid: [125.4, 126.6], parafusos: [{ s: 126, r: 30.6, n: 48 }] });
rotor("hpt", 120, 131, () => 13.4, [121.5, 127].map((x) => ({ s: x, w: 2.6, tip: 19.4, count: 64 })));
anel("hpt", 131, 132, 13.4, 20, { tone: "lo", name: "hpt.vedacao" });
const LPT = (s) => 31 + (s - 132) * 0.27;
const LPT_S = Array.from({ length: 6 }, (_, i) => 135 + i * 7.4);
rotor("lpt", 132, 175.5, (x) => 15 + (x - 132) * 4 / 46, LPT_S.map((x) => ({ s: x, w: 3, tip: LPT(x) - 2.6, count: 80 })));
disco("lpt", AX, 175.5, 178, LPT(175.5) - 1.8, { tone: "lo", name: "lpt.armacao-mancal" });
casca("lptcase", 132, 178, (x) => LPT(x) - 1.8, LPT, { tone: "hi", name: "lptcase.carcaca", linhas: LPT_S.map((x) => x + 4.5) });

// ================= ARMAÇÃO TRASEIRA, BOCAL E CONE =================
casca("exhaust", 178, 189, 30, 44.6, { tone: "hi", name: "exhaust.armacao", parafusos: [{ s: 178, r: 43.2, n: 56 }] });
casca("exhaust", 189, 202, 37.6, 43.4, { tone: "mid", name: "exhaust.bocal", linhas: [195] });
{
  const PL = (s) => 30 * Math.sqrt(Math.max(0, 1 - ((s - 186) / 54) ** 2));
  const plSlope = (s) => { const r = PL(s); return r > 0.3 ? (-900 * (s - 186)) / (54 * 54 * r) : -40; };
  const prof = [[186, 0]]; for (let i = 0; i <= 20; i++) { const s = 186 + i * 53.6 / 20; prof.push([s, PL(s), i > 0 && i < 20 ? 1 : 0]); } prof.push([240, 0]);
  turned("exhaust", AX, prof, { tone: "hi", smooth: { slope: plSlope, rows: 5 }, name: "exhaust.cone" });
}

// ================= NACELE (cortada) =================
const ccPts = [[43.5, 35.6], [56, 39], [100, 41.5], [140, 45.5], [182, 48.2]];
const ccO = (x) => { for (let i = 0; i < ccPts.length - 1; i++) { const [xa, ra] = ccPts[i], [xb, rb] = ccPts[i + 1]; if (x <= xb + 1e-9) { const t = (x - xa) / (xb - xa), u = t * t * (3 - 2 * t); return ra + (rb - ra) * u; } } return ccPts[ccPts.length - 1][1]; };
const ccI = (x) => ccO(x) - 2.2;
const inI = (x) => { const u = (x + 44) / 38; return 59.6 + 4.0 * (1 - u) ** 6 - 1.6 * Math.sin(Math.PI * u); };
const inO = (x) => { const u = (x + 44) / 38; return 63.6 + 16.4 * (1 - (1 - u) ** 2.5); };
const rvI = (x) => 59.6 - (x - 43.5) * (7.1 / 82.5), rvO = (x) => 80 - (x - 43.5) * (26.6 / 82.5);
casca("nacele", -44, -6, inI, inO, { tone: "hi", name: "nacele.entrada", segs: 16, linhas: [-30, -18] });
casca("nacele", -6, 43.5, 77, 80, { tone: "hi", name: "nacele.capo-fan", linhas: [10, 30], parafusos: [{ s: -4, r: 80, n: 70 }, { s: 41.5, r: 80, n: 70 }] });
casca("nacele", 43.5, 126, rvI, rvO, { tone: "hi", name: "nacele.reversor", segs: 8, linhas: [60, 92], linhasMid: [76] });
casca("nacele", 43.5, 182, ccI, ccO, { tone: "mid", name: "nacele.carenagem-nucleo", segs: 24, linhas: [90, 150] });
// duto de sangria: da bossa no alto do compressor até a carenagem (vai para o pilone)
cano("hpccase", [[88, 0, Z0 + HPC(88) + 4], [88, 0, Z0 + ccI(88)]], 1.8, { name: "hpccase.duto-bleed", tone: "hi" });

// ================= ESTRUTURA DE TESTE E PILONE =================
const BASE = { x: -60, y: -105, w: 310, d: 200, r: 6 };
caixa("stand", BASE, 0, 5, { tone: "lo", name: "stand.piso", bevel: 1.2, inner: Ln(Array.from({ length: 31 }, (_, i) => k.segment([BASE.x + 10 + i * 10, BASE.y + BASE.d - 6, 5], [BASE.x + 10 + i * 10, BASE.y + BASE.d - (i % 5 ? 9 : 12), 5], P)).join(""), { tone: "faint" }), extra: Dots([[-52, -97], [-52, 87], [242, -97], [242, 87]].map(([x, y]) => at([x, y, 5])), { size: 0.55 }) });
const halo = `<path class="iso-halo" d="${k.haloOf(BASE, 0, 5, P)}"/>`;
const TOPO = Z0 + 108, FAR = -SIDE * 92;
for (const x of [10, 130]) {
  caixa("stand", { x: x - 10, y: FAR - 10, w: 20, d: 20, r: 1.5 }, 5, 3, { tone: "mid", name: "stand.sapata", extra: Dots([[x - 7, FAR - 7], [x + 7, FAR - 7], [x - 7, FAR + 7], [x + 7, FAR + 7]].map(([a, b]) => at([a, b, 8])), { size: 0.5 }) });
  caixa("stand", { x: x - 5, y: FAR - 5, w: 10, d: 10, r: 1 }, 8, TOPO + 10 - 8, { tone: "mid", name: "stand.coluna", bevel: 0.5 });
  caixa("stand", { x: x - 4, y: Math.min(FAR + 5, -4), w: 8, d: Math.abs(FAR) + 4 - 5 + 4, r: 1 }, TOPO + 2, 8, { tone: "mid", name: "stand.braco", bevel: 0.5 });
}
caixa("stand", { x: -12, y: -6, w: 154, d: 12, r: 1.5 }, TOPO, 2, { tone: "lo", name: "stand.viga-placa" });
caixa("stand", { x: 16, y: -5, w: 112, d: 10, r: 1.5 }, Z0 + 86, TOPO - (Z0 + 86), { tone: "hi", name: "stand.pilone", bevel: 0.8, inner: Ln(k.sideSeam({ x: 16, y: -5, w: 112, d: 10, r: 1.5 }, Z0 + 97, P, 2), { tone: "faint" }) });
caixa("stand", { x: 26, y: -3, w: 6, d: 6, r: 1 }, Z0 + 80, 6, { tone: "mid", name: "stand.suporte-frente" });
caixa("stand", { x: 100, y: -3, w: 6, d: 6, r: 1 }, Z0 + rvO(100), Z0 + 86 - (Z0 + rvO(100)), { tone: "mid", name: "stand.suporte-tras" });

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
