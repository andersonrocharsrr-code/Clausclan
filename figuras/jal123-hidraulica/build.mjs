// Fig: o sistema hidráulico do JAL 123, dentro da cauda do 747 em corte. Construído com a skill Anatomy (MIT).
// A antepara de pressão traseira se rompe, o ar da cabine arranca a parte de cima da deriva
// e corta as linhas dos quatro sistemas hidráulicos; os manômetros caem a zero.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const HERE = dirname(fileURLToPath(import.meta.url));
const KIT = join(HERE, "../../.claude/skills/anatomy");
const k = await import(KIT + "/kit/iso-kit.mjs");
const G = await import(KIT + "/kit/lathe.mjs");
const { kitScript } = await import(KIT + "/scripts/inline-kit.mjs");
const theme = process.argv.includes("--light") ? "light" : "dark";

const WIDTH = 620, HEIGHT = 470;
const DEG = Math.PI / 180;

// ---------- Forma da fuselagem: cilindro na frente, cone que afina e sobe na cauda ----------
const X0 = -150, XB = -24, X1 = 150, R0 = 58, RT = 15, ZC0 = 86;
const R = (x) => (x <= XB ? R0 : R0 - (R0 - RT) * Math.pow((x - XB) / (X1 - XB), 1.35));
const ZC = (x) => ZC0 + (R0 - R(x)) * 0.78;
const TOPO = (x) => ZC(x) + R(x);
const W = (x, th, off = 0) => [x, (R(x) - off) * Math.cos(th), ZC(x) + (R(x) - off) * Math.sin(th)];
const PISO_Z = ZC0 - 20, PISO_W = Math.sqrt(R0 * R0 - 20 * 20) - 1;

// Deriva: raiz em cima do cone
const FX0 = 34, FX1 = 146, FH = 104;
const lead = (z) => FX0 + (z - TOPO(FX0)) * 0.62, trail = (z) => FX1 + (z - TOPO(FX1)) * 0.3;
const ZCUT = TOPO(FX0) + 30, ZTOP = TOPO(FX0) + FH;

// Quatro sistemas hidráulicos
const SYS = [0, 1, 2, 3].map((i) => ({ i, th: (171 + i * 6) * DEG, rx: -132 + i * 15, xf: 70 + i * 13, cor: ["#3b82f6", "#22c55e", "#eab308", "#ef4444"][i] }));
const RES_Y = -40, RES_R = 5.6, RES_H = 18, PIPE_R = 1.7;

const PLATE = { x: -164, y: -48, w: 328, d: 96, r: 8 }, PLATE_H = 8;
const P = k.fitProjection([...k.boxCorners(PLATE, -PLATE_H, 0), [X0, -R0, ZC0 + R0], [X0, R0, ZC0 - R0], [lead(ZTOP), 0, ZTOP], [trail(ZTOP) + 10, 0, ZTOP], [X1, 0, TOPO(X1)]], WIDTH, HEIGHT, { pad: 20, azimuth: 70, elevation: 22 });
const V = G.viewOf(P), LUZ = G.lightOf(P);
const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (pts, style) => k.dotsSvg(pts, style);
const path = (pts) => "M" + pts.map((p) => at(p).map((v) => v.toFixed(1)).join(" ")).join("L");
const longe = (th) => Math.cos(th) * V[1] + Math.sin(th) * V[2] < 0;   // metade de trás (a que fica dentro do corte)

const hex = (h, f) => "#" + [1, 3, 5].map((i) => Math.max(0, Math.min(255, Math.round(parseInt(h.slice(i, i + 2), 16) * f))).toString(16).padStart(2, "0")).join("");
const PRIMER = "#9aab5e";

// ---------- Bancada e berços ----------
function bancada() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H, PLATE_H, P)}"/>`];
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.2), { tone: "mid", className: "c-chao" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 6), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 9);
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  // dois berços que seguram a fuselagem
  for (const x of [-112, -48]) {
    const fundo = ZC(x) - R(x);
    out.push(S(k.slabOf({ x: x - 7, y: -30, w: 14, d: 60, r: 2 }, 0, 6, P, 3, 0.4), { tone: "mid", className: "c-metal" }));
    out.push(S(k.slabOf({ x: x - 4, y: -4, w: 8, d: 8, r: 1 }, 6, fundo - 6 + 2, P, 3, 0.3), { tone: "mid", className: "c-metal" }));
  }
  return out.join("");
}

// ---------- Casca: só a metade de trás, vista por dentro, com cavernas e longarinas ----------
function cascaDentro(xmin, xmax) {
  const quads = [], dx = 6, dth = 7.5 * DEG;
  for (let x = xmin; x < xmax - 0.01; x += dx) {
    const x2 = Math.min(xmax, x + dx);
    for (let th = 0; th < 2 * Math.PI - 0.001; th += dth) {
      const tm = th + dth / 2;
      if (!longe(tm)) continue;
      const pts = [W(x, th), W(x2, th), W(x2, th + dth), W(x, th + dth)];
      const n = [0, -Math.cos(tm), -Math.sin(tm)];
      const lum = 0.5 + 0.5 * Math.max(0, n[0] * LUZ[0] + n[1] * LUZ[1] + n[2] * LUZ[2]);
      const c = [(x + x2) / 2, ...W((x + x2) / 2, tm).slice(1)];
      quads.push({ d: k.depthOf(c, P), html: `<path d="${path(pts)}Z" fill="${hex(PRIMER, 0.42 + lum * 0.5)}" stroke="${hex(PRIMER, 0.42 + lum * 0.5)}" stroke-width=".5"/>` });
    }
  }
  quads.sort((a, b) => a.d - b.d);
  const out = [quads.map((q) => q.html).join("")];
  // cavernas (anéis estruturais) e longarinas na metade de trás
  const caverna = [], longarina = [];
  for (let x = Math.ceil(xmin / 18) * 18; x <= xmax; x += 18) {
    const pts = []; for (let th = 0; th <= 2 * Math.PI + 0.001; th += 4 * DEG) if (longe(th)) pts.push(W(x, th, 0.5)); else if (pts.length) { caverna.push(path(pts)); pts.length = 0; }
    if (pts.length) caverna.push(path(pts));
  }
  for (let th = 0; th < 2 * Math.PI; th += 15 * DEG) if (longe(th)) { const pts = []; for (let x = xmin; x <= xmax + 0.01; x += 6) pts.push(W(x, th, 0.4)); longarina.push(path(pts)); }
  out.push(`<path d="${longarina.join("")}" fill="none" stroke="${hex(PRIMER, 0.55)}" stroke-width=".6"/>`);
  out.push(`<path d="${caverna.join("")}" fill="none" stroke="${hex(PRIMER, 0.35)}" stroke-width="1.6"/>`);
  return out.join("");
}

// Contorno da fuselagem (o que mostra a circunferência): bordas do corte, anéis da frente e as cavernas da metade da frente em "raio-X"
function cascaFora() {
  const out = [];
  // bordas do corte: onde a casca vira para o lado de quem olha
  const borda = (sinal) => { const pts = []; for (let x = X0; x <= X1 + 0.01; x += 4) { const th = Math.atan2(V[2], V[1]) + sinal * Math.PI / 2; pts.push(W(x, th)); } return path(pts); };
  // anéis da frente (cavernas da metade removida), finos, só para mostrar a forma redonda
  const aneis = [];
  for (let x = X0 + 18; x <= X1 - 6; x += 18) { const pts = []; for (let th = 0; th <= 2 * Math.PI + 0.001; th += 4 * DEG) if (!longe(th)) pts.push(W(x, th)); aneis.push(path(pts)); }
  out.push(`<path d="${aneis.join("")}" fill="none" stroke="var(--anillo)" stroke-width=".7" stroke-dasharray="3 3"/>`);
  // borda do corte na frente: o anel inteiro, grosso, com a espessura da casca
  const ring = (r) => { const pts = []; for (let th = 0; th <= 2 * Math.PI + 0.001; th += 3 * DEG) pts.push([X0, r * Math.cos(th), ZC(X0) + r * Math.sin(th)]); return path(pts); };
  out.push(`<path d="${ring(R0)}${ring(R0 - 3)}" fill="none" stroke="var(--borda)" stroke-width="1.3"/>`);
  out.push(`<path d="${borda(1)}${borda(-1)}" fill="none" stroke="var(--borda)" stroke-width="1.5"/>`);
  // ponta da cauda (cone de escape da APU)
  out.push(S(G.disc(0, 8, RT * 0.55, G.frameAlong([X1, 0, ZC(X1)], [1, 0, 0]), P), { tone: "hi", className: "c-pintura" }));
  return out.join("");
}

// ---------- Piso da cabine, trilhos das poltronas e reservatórios ----------
function piso() {
  const out = [];
  out.push(S(k.slabOf({ x: X0, y: -PISO_W, w: XB - X0 - 2, d: PISO_W * 2, r: 0.5 }, PISO_Z - 3, 3, P, 2, 0.4), { tone: "mid", className: "c-piso" }));
  for (const y of [-34, -20, 20, 34]) out.push(L(k.lineOnTop([X0 + 2, y], [XB - 4, y], PISO_Z, P), { tone: "lo" }));
  return out.join("");
}
const gaugeAt = (i, psi) => {
  const s = SYS[i], ang = -Math.PI * 0.75 + Math.min(1, psi / 3000) * Math.PI * 1.5, z = PISO_Z + RES_H + 2;
  return k.lineOnTop([s.rx, RES_Y], [s.rx + Math.sin(ang) * (RES_R - 1.8), RES_Y - Math.cos(ang) * (RES_R - 1.8)], z + 0.2, P);
};
function reservatorios() {
  const out = [];
  for (const s of [...SYS].sort((a, b) => k.depthOf([a.rx, RES_Y, 0], P) - k.depthOf([b.rx, RES_Y, 0], P))) {
    const z = PISO_Z;
    out.push(`<g class="c-h${s.i}">`);
    out.push(S(k.cylinder(s.rx, RES_Y, RES_R, z, 2.4, P, 32, 0.4), { tone: "mid", className: "c-metal" }));
    out.push(S(k.cylinder(s.rx, RES_Y, RES_R - 0.7, z + 2.4, RES_H - 2.4, P, 36), { tone: "hi" }));
    out.push(L(k.sideArc(s.rx, RES_Y, RES_R - 0.7, z + 8, P, 18) + k.sideArc(s.rx, RES_Y, RES_R - 0.7, z + 13, P, 18), { tone: "faint" }));
    out.push(S(k.cylinder(s.rx, RES_Y, RES_R, z + RES_H, 2, P, 36, 0.4), { tone: "mid", className: "c-metal" }));
    const t = k.radialTicks(s.rx, RES_Y, RES_R - 1.2, 12, 3, z + RES_H + 2, [0.6, 1.3], P, Math.PI * 0.25, Math.PI * 1.5);
    out.push(`<g class="mostrador">${L(t.minor, { tone: "lo" })}${L(t.major, { tone: "mid" })}</g>`);
    out.push(`<path data-gauge="${s.i}" class="iso-line" data-free="start" d="${gaugeAt(s.i, 3000)}" style="stroke:#ffd23f;stroke-width:1"/>`);
    out.push(`</g>`);
  }
  return out.join("");
}

// ---------- Antepara de pressão traseira: cúpula com nervuras radiais e anéis ----------
const BD = 22;
const DF = G.frameOf([XB, 0, ZC0], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
const domeR = (s) => (R0 - 1.5) * Math.sqrt(Math.max(0, 1 - Math.pow(s / BD, 2)));
const domeSlope = (s) => { const r = domeR(s); return r > 0.6 ? -(R0 - 1.5) * (R0 - 1.5) * s / (BD * BD * r) : -60; };
function antepara() {
  const out = [];
  out.push(S(G.disc(-3, 0, R0 - 0.5, DF, P, { bevel: 0.6 }), { tone: "mid", className: "c-primer" }));
  const prof = Array.from({ length: 15 }, (_, j) => { const s = (j / 14) * BD; return [s, domeR(s), j > 0 && j < 14 ? 1 : 0]; });
  prof[14] = [BD, 0];
  const rings = [0.3, 0.55, 0.78].map((f) => G.arcOf(DF, f * BD, domeR(f * BD), P, { slope: domeSlope(f * BD) })).join("");
  out.push(S(G.lathe(prof, DF, P, { smooth: { slope: domeSlope } }), { tone: "hi", className: "c-primer", inner: L(rings, { tone: "faint" }) }));
  // nervuras radiais (como na peça real, em forma de guarda-chuva)
  const nerv = [];
  for (let a = 0; a < 360; a += 20) {
    const pts = []; for (let j = 0; j <= 12; j++) { const s = (j / 12) * BD * 0.97; const p = G.pointOf(DF, s, domeR(s) + 0.6, a * DEG); pts.push(p); }
    const mid = G.pointOf(DF, BD * 0.4, domeR(BD * 0.4), a * DEG), nrm = G.sub3(mid, DF.o);
    if (G.dot3(G.unit3(nrm), V) > -0.05) nerv.push(path(pts));
  }
  out.push(`<path d="${nerv.join("")}" fill="none" stroke="${hex(PRIMER, 0.45)}" stroke-width="1.1"/>`);
  out.push(D(G.dotsOf(DF, -1.5, R0 - 2, 40, P, { all: true }).slice(0, 0), { size: 0.4 }));
  return out.join("");
}
// A rachadura no lado de baixo da cúpula e o ar da cabine escapando para a cauda
function rompimento() {
  const pts = [[5, 248], [9, 241], [12, 252], [15, 244], [18, 255], [20, 247]].map(([s, a]) => G.pointOf(DF, s, domeR(s) * 0.99, a * DEG));
  const ar = [];
  for (const [dy, dz, x2] of [[0, -14, 60], [10, -6, 50], [-8, -20, 70], [16, 6, 40], [-14, 0, 64]]) {
    const a = [XB + 14, dy, ZC0 + dz], b = [x2, dy * 0.5, ZC(x2) + dz * 0.3 + 20];
    ar.push(`<path class="iso-line" data-tone="blue" data-free="both" d="${path([a, b])}" style="stroke-dasharray:6 5;stroke-width:1.6" data-part="ar"/>`);
  }
  return `<g data-part="burst" style="opacity:0"><path class="iso-line" data-free="both" d="${path(pts)}" style="stroke:#ffd23f;stroke-width:1.6"/>${ar.join("")}</g>`;
}

// ---------- Deriva: base fica, topo é arrancado ----------
const FF = G.frameOf([0, -2.6, 0], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
function derivaBase() {
  const z0a = TOPO(FX0) - 2, z0b = TOPO(FX1) - 2;
  return S(G.prismOf(FF, [[FX0, z0a], [FX1, z0b], [trail(ZCUT), ZCUT], [lead(ZCUT), ZCUT]], 0, 5.2, P), { tone: "hi", className: "c-pintura" });
}
function derivaTopo() {
  const out = [];
  out.push(S(G.prismOf(FF, [[lead(ZCUT), ZCUT], [trail(ZCUT) - 22, ZCUT], [trail(ZTOP) - 18, ZTOP], [lead(ZTOP), ZTOP]], 0, 5.2, P), { tone: "hi", className: "c-pintura" }));
  out.push(S(G.prismOf(FF, [[trail(ZCUT) - 21, ZCUT], [trail(ZCUT), ZCUT], [trail(ZTOP), ZTOP], [trail(ZTOP) - 17, ZTOP]], 0.6, 4.6, P), { tone: "hi", className: "c-leme" }));
  // nervuras da deriva
  const nerv = [];
  for (let z = ZCUT + 14; z < ZTOP - 4; z += 14) nerv.push(path([[lead(z), 2.7, z], [trail(z) - 21, 2.7, z]]));
  out.push(`<path d="${nerv.join("")}" fill="none" stroke="var(--nervura)" stroke-width=".7"/>`);
  return out.join("");
}

// ---------- Linhas hidráulicas: pela parede de trás, atravessam a antepara e sobem na deriva ----------
function cano(points, r, extra = "") {
  const out = [];
  for (let j = 0; j < points.length - 1; j++) {
    const a = points[j], b = points[j + 1], d = G.sub3(b, a), len = G.len3(d);
    if (len < 0.05) continue;
    out.push(S(G.disc(0, len, r, G.frameAlong(a, G.unit3(d)), P), { tone: "hi", crease: "none" }));
    if (j > 0) out.push(S(G.sphereOf(a, r * 1.08, P, { steps: 16 }), { tone: "hi", crease: "none" }));
  }
  return out.join("") + extra;
}
const rota = (s) => {
  const off = 3.5, top = 90 * DEG;
  const pts = [[s.rx, RES_Y, PISO_Z + RES_H + 2], [s.rx, RES_Y, W(s.rx, s.th, off)[2]], W(s.rx + 10, s.th, off)];
  for (let x = s.rx + 20; x < 26; x += 18) pts.push(W(x, s.th, off));
  for (let j = 0; j <= 8; j++) { const f = j / 8, x = 26 + (s.xf - 26) * f; pts.push(W(x, s.th + (top - s.th) * Math.pow(f, 0.8), off)); }
  return pts;
};
const antes = (pts) => pts.filter((p) => p[0] <= XB + 2), depois = (pts) => { const i = pts.findIndex((p) => p[0] > XB); return pts.slice(Math.max(0, i - 1)); };
function linhasAntes() { return SYS.map((s) => `<g class="c-h${s.i}">${cano(antes(rota(s)), PIPE_R)}</g>`).join(""); }
function linhasDepois() {
  return [...SYS].reverse().map((s) => {
    const r = depois(rota(s)), topo = r[r.length - 1];
    return `<g class="c-h${s.i}">${cano([...r, [s.xf, 0, ZCUT]], PIPE_R)}</g>`;
  }).join("");
}
function linhasDeriva() {
  return SYS.map((s) => {
    const zA = ZTOP - 22 - s.i * 9;
    return `<g class="c-h${s.i}">${cano([[s.xf, 0, ZCUT], [s.xf, 0, zA]], PIPE_R)}${S(G.disc(0, 10, 2.8, G.frameAlong([s.xf - 1, 0, zA], [1, 0, 0]), P), { tone: "mid", className: "c-metal" })}</g>`;
  }).join("");
}
function vazamento() {
  return SYS.map((s) => `<path data-leak="${s.i}" class="iso-line" data-free="both" d="${path([[s.xf, 0, ZCUT], [s.xf + 4, 0, ZCUT - 26]])}" style="stroke:${s.cor};stroke-width:1.8;stroke-dasharray:2 5;opacity:0"/>`).join("");
}

const MATERIAIS = { metal: "#8d97a2", primer: PRIMER, piso: "#6e665c", pintura: "#e3e7eb", leme: "#c9d0d7", h0: "#3b82f6", h1: "#22c55e", h2: "#eab308", h3: "#ef4444", chao: "#5d646d" };
const CORES = Object.entries(MATERIAIS).map(([n, c]) => `.c-${n}{--anatomy-shade-0:${hex(c, 0.6)};--anatomy-shade-1:${hex(c, 0.7)};--anatomy-shade-2:${hex(c, 0.8)};--anatomy-shade-3:${hex(c, 0.9)};--anatomy-top:${hex(c, 1.06)};--anatomy-paper:${hex(c, 0.85)};--anatomy-face:${hex(c, 0.85)}}.c-${n} .iso-edge{stroke:${hex(c, 0.42)}}`).join("")
  + `.c-chao .iso-line{stroke:#454b52}.c-piso .iso-line{stroke:#4a443d}.mostrador .iso-line{stroke:#e9edf1}`
  + `.iso{--anillo:#8a96a3;--borda:#d9dee4;--nervura:#a7b0ba}.iso[data-theme=light]{--anillo:#7d8894;--borda:#4b535c;--nervura:#9aa3ad}`;

const svg = k.figureSvg({
  width: WIDTH, height: HEIGHT,
  label: "A cauda de um Boeing 747 em corte, sobre dois berços: a casca redonda da fuselagem com as cavernas e as longarinas, o piso da cabine, a antepara de pressão traseira em forma de cúpula, a deriva com o leme e as quatro linhas hidráulicas, uma de cada cor, que saem de quatro reservatórios, correm pela parede, atravessam a antepara e sobem pela deriva até os atuadores do leme. Quando a antepara se rompe, o ar da cabine arranca a parte de cima da deriva, as quatro linhas são cortadas e os manômetros caem a zero.",
  body: [bancada(), cascaDentro(X0, X1), piso(), reservatorios(), linhasAntes(), antepara(), derivaBase(), linhasDepois(),
    `<g data-part="topo">${derivaTopo()}${linhasDeriva()}</g>`, vazamento(), rompimento(), cascaFora()],
});

const live = `
const SYS = ${JSON.stringify(SYS)}, RES_Y = ${RES_Y}, RES_R = ${RES_R}, PISO_Z = ${PISO_Z}, RES_H = ${RES_H};
const P = ${JSON.stringify(P)};
const gaugeAt = ${gaugeAt.toString().replace("k.lineOnTop", "lineOnTop")};
const stage = document.querySelector(".iso-stage"), svg = stage.querySelector("svg");
const topo = svg.querySelector('[data-part="topo"]'), burst = svg.querySelector('[data-part="burst"]');
const gauges = [...svg.querySelectorAll("[data-gauge]")], leaks = [...svg.querySelectorAll("[data-leak]")], ares = [...svg.querySelectorAll('[data-part="ar"]')];
const readout = document.querySelector("[data-readout]"), still = matchMedia("(prefers-reduced-motion: reduce)");
const clamp = (v, a, b) => Math.min(b, Math.max(a, v)), smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const psiOf = (i, t) => 3000 * (1 - smooth(0.24 + i * 0.05, 0.62 + i * 0.07, t));
let t = 0, target = 0, touring = true, clock = 0, last = 0, frame = 0, visible = false, idle = 0, dash = 0;
const tour = (c) => { const u = (c % 16) / 16; return u < 0.1 ? 0 : u < 0.75 ? (u - 0.1) / 0.65 : u < 0.9 ? 1 : 1 - (u - 0.9) / 0.1; };
function draw() {
  const b = smooth(0.18, 0.23, t), voa = smooth(0.2, 0.42, t);
  burst.style.opacity = (b * (1 - smooth(0.5, 0.7, t) * 0.6)).toFixed(3);
  topo.setAttribute("transform", translateAlong(P, [voa * 60, 0, voa * 110]));
  topo.style.opacity = (1 - voa).toFixed(3);
  const psi = SYS.map((s) => psiOf(s.i, t));
  gauges.forEach((g, i) => g.setAttribute("d", gaugeAt(i, psi[i])));
  leaks.forEach((l, i) => { l.style.opacity = (smooth(0.21, 0.26, t) * Math.min(1, psi[i] / 600 + 0.25)).toFixed(3); l.style.strokeDashoffset = String(-dash * 1.6); });
  ares.forEach((a) => { a.style.strokeDashoffset = String(-dash); });
  const txt = t < 0.18 ? "18:24 · normal · 3000 psi" : t < 0.3 ? "18:24:35 · estrondo" : "psi " + psi.map((p) => Math.round(p / 100) * 100).join(" · ");
  if (readout.textContent !== txt) readout.textContent = txt;
  stage.setAttribute("aria-valuenow", String(Math.round(t * 100))); stage.setAttribute("aria-valuetext", txt);
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60; last = now;
  if (touring) { clock += dt; target = tour(clock); }
  t = still.matches ? target : t + (target - t) * (1 - Math.exp(-dt / 0.35));
  dash += dt * 30;
  draw();
  frame = visible ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
const steer = (v) => { touring = false; target = clamp(v, 0, 1); clearTimeout(idle); idle = setTimeout(() => { touring = !still.matches; clock = 0; run(); }, 4500); run(); };
new IntersectionObserver((e) => { visible = e[e.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
if (still.matches) touring = false;
stage.addEventListener("pointermove", (e) => { const r = svg.getBoundingClientRect(); steer(clamp(((e.clientX - r.left) / r.width - 0.1) / 0.8, 0, 1)); });
stage.addEventListener("keydown", (e) => { const d = e.key === "ArrowRight" || e.key === "ArrowUp" ? 0.08 : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -0.08 : 0; if (!d) return; e.preventDefault(); steer(target + d); });
draw();
`;

const body = k.plateHtml({
  fig: "Fig 2", title: "JAL 123 · cauda", hint: "Arraste para avançar",
  readout: "18:24 · normal · 3000 psi",
  keys: [{ mark: "blue", label: "Ar da cabine escapando pela antepara" }, { mark: "raised", label: "Quatro sistemas hidráulicos, um de cada cor" }, { mark: "dashed", label: "Metade da frente da fuselagem, retirada para ver dentro" }],
  caption: "Simplificado e fora de escala. A cauda do 747 em corte: a antepara de pressão traseira fecha a cabine pressurizada. As linhas dos quatro sistemas hidráulicos passavam por trás dela, rumo à deriva. Quando a antepara se rompeu, o ar da cabine arrancou a maior parte da deriva e cortou as quatro de uma vez: o fluido vazou e os comandos pararam de responder.",
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="JAL 123: setas avançam e voltam o tempo" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">${svg}</div>`,
});
const file = theme === "light" ? "fig-jal123-hidraulica-light.html" : "fig-jal123-hidraulica.html";
const css = `<style>${CORES}body{margin:0}.iso-page{width:100%!important;margin:0!important;padding:14px 18px 18px;box-sizing:border-box}.iso-plate{padding:44px 16px 58px!important;box-shadow:none!important;border-radius:12px!important}.iso-stage{touch-action:pan-y}</style>`;
writeFileSync(join(HERE, "../../aviao/assets", file), k.pageHtml({ title: "JAL 123 · cauda", theme, body: body + css, script: kitScript() + live }));
console.log("wrote", file);
