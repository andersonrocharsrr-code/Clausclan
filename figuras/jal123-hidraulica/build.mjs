// Fig: o sistema hidráulico do JAL 123. Construído com a skill Anatomy (MIT).
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

const WIDTH = 600, HEIGHT = 420;
const PLATE = { x: -150, y: -46, w: 300, d: 104, r: 8 }, PLATE_H = 10, FOOT_H = 5;
const DOME = { x: -30, z: 62, R: 52, depth: 22 };
const FIN = { x: 40, cut: 44 };               // a deriva corta na altura z = cut
const SYS = [0, 1, 2, 3].map((i) => ({ i, y: 10 + i * 10, xr: 34 + i * 9, cor: ["#3b82f6", "#22c55e", "#eab308", "#ef4444"][i] }));
const RES_X = -124, RES_R = 6.5, RES_H = 20, PIPE_R = 1.9, PIPE_Z = 3, RISER_Y = 6, ACT_Z = 108;

const P = k.fitProjection([...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [FIN.x + 95, 0, 132], [DOME.x, -DOME.R, DOME.z + DOME.R], [FIN.x + 160, 0, 190]], WIDTH, HEIGHT, { pad: 22, azimuth: 38 });
const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (pts, style) => k.dotsSvg(pts, style);
const byDepth = (pts) => [...pts].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));

function bancada() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 20))) {
    out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo", className: "c-borracha" }));
    out.push(S(k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid", className: "c-borracha" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.4), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 6), 0, P), { tone: "lo" }));
  // trilhos do piso da cabine, onde se apoiam as poltronas
  for (const y of [-30, -16]) out.push(L(k.lineOnTop([PLATE.x + 10, y], [DOME.x - 14, y], 0, P), { tone: "faint" }));
  const screws = k.corners(PLATE, 9);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  return out.join("");
}

// Quatro reservatórios com manômetro em cima
const gaugeAt = (i, psi) => {
  const s = SYS[i], ang = -Math.PI * 0.75 + Math.min(1, psi / 3000) * Math.PI * 1.5, z = RES_H + 2.2;
  return k.lineOnTop([RES_X, s.y], [RES_X + Math.sin(ang) * (RES_R - 2), s.y - Math.cos(ang) * (RES_R - 2)], z + 0.2, P);
};
function reservatorios() {
  const out = [];
  for (const s of [...SYS].sort((a, b) => k.depthOf([RES_X, a.y, 0], P) - k.depthOf([RES_X, b.y, 0], P))) {
    out.push(`<g class="c-h${s.i}">`);
    out.push(S(k.cylinder(RES_X, s.y, RES_R, 0, 3, P, 32, 0.4), { tone: "mid", className: "c-metal" }));
    out.push(S(k.cylinder(RES_X, s.y, RES_R - 0.8, 3, RES_H - 3, P, 40), { tone: "hi" }));
    out.push(L(k.sideArc(RES_X, s.y, RES_R - 0.8, 8, P, 20) + k.sideArc(RES_X, s.y, RES_R - 0.8, 15, P, 20), { tone: "faint" }));
    out.push(S(k.cylinder(RES_X, s.y, RES_R, RES_H, 2.2, P, 40, 0.4), { tone: "mid", className: "c-metal" }));
    out.push(L(k.ring(RES_X, s.y, RES_R - 1, RES_H + 2.2, P, 32), { tone: "lo" }));
    const t = k.radialTicks(RES_X, s.y, RES_R - 1.4, 12, 3, RES_H + 2.2, [0.7, 1.4], P, -Math.PI * 0.75 + Math.PI, Math.PI * 1.5);
    out.push(`<g class="mostrador">${L(t.minor, { tone: "lo" })}${L(t.major, { tone: "mid" })}</g>`);
    out.push(`<path data-gauge="${s.i}" class="iso-line" data-free="start" d="${gaugeAt(s.i, 3000)}" style="stroke:#ffd23f;stroke-width:1"/>`);
    out.push(`</g>`);
  }
  return out.join("");
}

// Antepara de pressão traseira: cúpula de alumínio em primer, com nervuras radiais e a flange
const DF = G.frameOf([DOME.x, 0, DOME.z], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
const domeR = (s) => DOME.R * Math.sqrt(Math.max(0, 1 - Math.pow(s / DOME.depth, 2)));
function antepara() {
  const out = [];
  out.push(S(k.slabOf({ x: DOME.x - 10, y: -7, w: 14, d: 14, r: 1.5 }, 0, DOME.z - DOME.R + 2, P, 3, 0.4), { tone: "mid", className: "c-metal" }));
  out.push(S(G.disc(-3, 0, DOME.R + 3, DF, P, { bevel: 0.6 }), { tone: "mid", className: "c-primer" }));
  const prof = Array.from({ length: 13 }, (_, j) => { const s = (j / 12) * DOME.depth; return [s, domeR(s), j > 0 && j < 12 ? 1 : 0]; });
  prof[12] = [DOME.depth, 0];
  const ribs = G.spokesOf ? G.spokesOf(DF, 0.1, 8, DOME.R - 2, 0, P) : "";
  out.push(S(G.lathe(prof, DF, P, { smooth: { slope: (s) => { const r = domeR(s); return r > 0.5 ? -DOME.R * DOME.R * s / (DOME.depth * DOME.depth * r) : -40; } } }), { tone: "hi", className: "c-primer",
    inner: L([0.25, 0.5, 0.75].map((f) => G.arcOf(DF, f * DOME.depth, domeR(f * DOME.depth), P, { slope: -DOME.R * DOME.R * f * DOME.depth / (DOME.depth * DOME.depth * Math.max(1, domeR(f * DOME.depth))) })).join(""), { tone: "faint" }) }));
  out.push(D(G.dotsOf(DF, 0, DOME.R + 1.4, 36, P), { size: 0.45, tone: "lo" }));
  return out.join("");
}
// A rachadura e o ar escapando (aparecem no estrondo)
function rompimento() {
  const pts = [[8, 10], [10, 4], [13, 12], [15, 6], [18, 14], [20, 8]].map(([s, a]) => G.pointOf(DF, s, domeR(s) * 0.98, 0.9 + a * 0.05));
  const crack = `M${pts.map((p) => at(p).map((v) => v.toFixed(1)).join(" ")).join("L")}`;
  const ar = [];
  for (const [dy, dz] of [[0, 0], [10, 8], [-8, 12], [6, -10], [-12, -4]]) {
    const a = at([DOME.x + DOME.depth + 4, dy, DOME.z + dz]), b = at([FIN.x + 30, dy * 0.4, 30 + dz * 0.6]);
    ar.push(`<path class="iso-line" data-tone="blue" data-free="both" d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}" style="stroke-dasharray:5 5;stroke-width:1.4" data-part="ar"/>`);
  }
  return `<g data-part="burst" style="opacity:0"><path class="iso-line" data-free="both" d="${crack}" style="stroke:#ffd23f;stroke-width:1.4"/>${ar.join("")}</g>`;
}

// Deriva (estabilizador vertical): parte de baixo fica, parte de cima é arrancada
const FF = G.frameOf([FIN.x, -2, 0], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
const lead = (z) => z * 0.5, trail = (z) => 72 + z * 0.22;
function derivaBase() {
  const out = [];
  out.push(S(k.slabOf({ x: FIN.x - 6, y: -9, w: 96, d: 16, r: 3 }, 0, 12, P, 4, 0.5), { tone: "mid", className: "c-pintura" }));
  const z0 = 12, z1 = FIN.cut;
  out.push(S(G.prismOf(FF, [[lead(z0), z0], [trail(z0), z0], [trail(z1), z1], [lead(z1), z1]], 0, 4, P), { tone: "hi", className: "c-pintura" }));
  return out.join("");
}
function derivaTopo() {
  const z0 = FIN.cut, z1 = 128, out = [];
  out.push(S(G.prismOf(FF, [[lead(z0), z0], [trail(z0) - 16, z0], [trail(z1) - 14, z1], [lead(z1), z1]], 0, 4, P), { tone: "hi", className: "c-pintura" }));
  // leme (rudder), atrás da deriva
  out.push(S(G.prismOf(FF, [[trail(z0) - 15, z0], [trail(z0), z0], [trail(z1), z1], [trail(z1) - 13, z1]], 0.4, 3.6, P), { tone: "hi", className: "c-leme" }));
  out.push(D([60, 80, 100, 120].map((z) => at([FIN.x + trail(z) - 15, 2, z])), { size: 0.5, tone: "lo" }));
  return out.join("");
}

// Linhas hidráulicas: do reservatório pelo piso, sobem ao lado da deriva até o atuador do leme
function cano(points, r) {
  const out = [];
  for (let j = 0; j < points.length - 1; j++) {
    const a = points[j], b = points[j + 1], d = G.sub3(b, a), len = G.len3(d);
    out.push(S(G.disc(0, len, r, G.frameAlong(a, G.unit3(d)), P), { tone: "hi", crease: "none" }));
    if (j > 0) out.push(S(G.sphereOf(a, r * 1.15, P, { steps: 20 }), { tone: "hi", crease: "none" }));
  }
  return out.join("");
}
function linhasBaixo() {
  return [...SYS].reverse().map((s) => `<g class="c-h${s.i}">${cano([[RES_X + RES_R, s.y, PIPE_Z], [s.xr + FIN.x - 34, s.y, PIPE_Z], [s.xr + FIN.x - 34, RISER_Y, PIPE_Z], [s.xr + FIN.x - 34, RISER_Y, FIN.cut]], PIPE_R)}</g>`).join("");
}
function linhasCima() {
  return SYS.map((s) => {
    const x = s.xr + FIN.x - 34;
    return `<g class="c-h${s.i}">${cano([[x, RISER_Y, FIN.cut], [x, RISER_Y, ACT_Z - s.i * 6]], PIPE_R)}${S(G.disc(0, 9, 3, G.frameAlong([x - 4.5, RISER_Y, ACT_Z - s.i * 6], [1, 0, 0]), P), { tone: "mid", className: "c-metal" })}</g>`;
  }).join("");
}
// Fluido vazando das pontas cortadas
function vazamento() {
  return SYS.map((s) => {
    const x = s.xr + FIN.x - 34, a = at([x, RISER_Y, FIN.cut]), b = at([x + 2, RISER_Y, 6]);
    return `<path data-leak="${s.i}" class="iso-line" data-free="both" d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}" style="stroke:${s.cor};stroke-width:1.4;stroke-dasharray:2 6;opacity:0"/>`;
  }).join("");
}

const MATERIAIS = { borracha: "#30343a", metal: "#8d97a2", primer: "#a7b46a", pintura: "#e3e7eb", leme: "#cfd5db", h0: "#3b82f6", h1: "#22c55e", h2: "#eab308", h3: "#ef4444" };
const hex = (h, f) => "#" + [1, 3, 5].map((i) => Math.max(0, Math.min(255, Math.round(parseInt(h.slice(i, i + 2), 16) * f))).toString(16).padStart(2, "0")).join("");
const CORES = Object.entries(MATERIAIS).map(([n, c]) => `.c-${n}{--anatomy-shade-0:${hex(c, 0.6)};--anatomy-shade-1:${hex(c, 0.7)};--anatomy-shade-2:${hex(c, 0.8)};--anatomy-shade-3:${hex(c, 0.9)};--anatomy-top:${hex(c, 1.06)};--anatomy-paper:${hex(c, 0.85)};--anatomy-face:${hex(c, 0.85)}}.c-${n} .iso-edge{stroke:${hex(c, 0.42)}}`).join("")
  + `.c-chao{--anatomy-shade-0:#4a5058;--anatomy-shade-1:#555c64;--anatomy-shade-2:#616871;--anatomy-shade-3:#6c737c;--anatomy-top:#7a828b;--anatomy-paper:#6a717a;--anatomy-face:#6a717a}.c-chao .iso-edge{stroke:#2c3036}.c-chao .iso-line[data-tone=lo],.c-chao .iso-line[data-tone=faint]{stroke:#4f565e}`
  + `.mostrador .iso-line{stroke:#e9edf1}`;

const svg = k.figureSvg({
  width: WIDTH, height: HEIGHT,
  label: "Corte da cauda de um Boeing 747 sobre uma bancada: a antepara de pressão traseira, a deriva com o leme e as quatro linhas hidráulicas, uma de cada cor, que saem de quatro reservatórios e sobem pela deriva até os atuadores do leme. Quando a antepara se rompe, o ar da cabine arranca a parte de cima da deriva, as quatro linhas são cortadas, o fluido vaza e os manômetros caem a zero.",
  body: [`<g class="c-chao">${bancada()}</g>`, reservatorios(), antepara(), derivaBase(), `<g data-part="topo">${derivaTopo()}${linhasCima()}</g>`, linhasBaixo(), vazamento(), rompimento()],
});

const live = `
const SYS = ${JSON.stringify(SYS)}, RES_X = ${RES_X}, RES_R = ${RES_R}, RES_H = ${RES_H};
const P = ${JSON.stringify(P)};
const gaugeAt = ${gaugeAt.toString().replace("k.lineOnTop", "lineOnTop")};
const stage = document.querySelector(".iso-stage"), svg = stage.querySelector("svg");
const topo = svg.querySelector('[data-part="topo"]'), burst = svg.querySelector('[data-part="burst"]');
const gauges = [...svg.querySelectorAll("[data-gauge]")], leaks = [...svg.querySelectorAll("[data-leak]")], ares = [...svg.querySelectorAll('[data-part="ar"]')];
const readout = document.querySelector("[data-readout]"), still = matchMedia("(prefers-reduced-motion: reduce)");
const clamp = (v, a, b) => Math.min(b, Math.max(a, v)), smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
// t: 0 = cruzeiro normal; 0,2 = estrondo; depois, cada sistema perde a pressão (simplificado)
const psiOf = (i, t) => 3000 * (1 - smooth(0.24 + i * 0.05, 0.62 + i * 0.07, t));
let t = 0, target = 0, touring = true, clock = 0, last = 0, frame = 0, visible = false, idle = 0, dash = 0;
const tour = (c) => { const u = (c % 16) / 16; return u < 0.1 ? 0 : u < 0.75 ? (u - 0.1) / 0.65 : u < 0.9 ? 1 : 1 - (u - 0.9) / 0.1; };
function draw() {
  const b = smooth(0.18, 0.23, t), voa = smooth(0.2, 0.42, t);
  burst.style.opacity = (b * (1 - smooth(0.5, 0.7, t) * 0.6)).toFixed(3);
  topo.setAttribute("transform", translateAlong(P, [voa * 70, 0, voa * 90]));
  topo.style.opacity = (1 - voa).toFixed(3);
  const psi = SYS.map((s) => psiOf(s.i, t));
  gauges.forEach((g, i) => g.setAttribute("d", gaugeAt(i, psi[i])));
  leaks.forEach((l, i) => { l.style.opacity = (smooth(0.21, 0.26, t) * Math.min(1, psi[i] / 600 + 0.15)).toFixed(3); l.style.strokeDashoffset = String(-dash * 1.6); });
  ares.forEach((a) => { a.style.strokeDashoffset = String(-dash); });
  const txt = t < 0.18 ? "18:24 · tudo normal · 3000 psi" : t < 0.3 ? "18:24:35 · estrondo na cauda" : "psi " + psi.map((p) => Math.round(p / 100) * 100).join(" · ");
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
  fig: "Fig 2", title: "JAL 123 · hidráulica", hint: "Arraste para avançar",
  readout: "18:24 · tudo normal · 3000 psi",
  keys: [{ mark: "blue", label: "Ar da cabine escapando pela antepara" }, { mark: "raised", label: "Quatro sistemas hidráulicos, um de cada cor" }],
  caption: "Simplificado e fora de escala. As linhas dos quatro sistemas hidráulicos do 747 passavam pela cauda. Quando a antepara de pressão se rompeu, o ar da cabine arrancou a maior parte da deriva e cortou as quatro de uma vez: o fluido vazou e os comandos pararam de responder.",
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="JAL 123: setas avançam e voltam o tempo" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">${svg}</div>`,
});
const file = theme === "light" ? "fig-jal123-hidraulica-light.html" : "fig-jal123-hidraulica.html";
const css = `<style>${CORES}body{margin:0}.iso-page{width:100%!important;margin:0!important;padding:14px 18px 18px;box-sizing:border-box}.iso-plate{padding:44px 16px 58px!important;box-shadow:none!important;border-radius:12px!important}.iso-stage{touch-action:pan-y}</style>`;
writeFileSync(join(HERE, "../../aviao/assets", file), k.pageHtml({ title: "JAL 123 · hidráulica", theme, body: body + css, script: kitScript() + live }));
console.log("wrote", file);
