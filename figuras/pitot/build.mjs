// Fig: tubo de Pitot congelando (AF447). Construído com a skill Anatomy (MIT).
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const KIT = join(dirname(fileURLToPath(import.meta.url)), "../../.claude/skills/anatomy");
const k = await import(KIT + "/kit/iso-kit.mjs");
const G = await import(KIT + "/kit/lathe.mjs");
const { kitScript } = await import(KIT + "/scripts/inline-kit.mjs");
const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";

const WIDTH = 600, HEIGHT = 380;
const PLATE = { x: -130, y: -58, w: 262, d: 120, r: 8 }, PLATE_H = 10, FOOT_H = 5;
const FL = [-62, -14];                  // flange do mastro
const AX_Z = 52, AX_Y = -14;           // eixo do tubo
const T0 = -78, LEN = 108;             // tubo: de x = T0 até a ponta
const NOSE = T0 + LEN;
const DIAL = [78, 32], DIAL_R = 22, DIAL_Z = 22, DIAL_H = 8, DIAL_TOP = DIAL_Z + DIAL_H;
const PIPE_Y = 34, PIPE_Z = 3.2, PIPE_R = 2.2;
const MAXKT = 350, SPAN = Math.PI * 1.6, FROM = -Math.PI * 0.8;
const ICE_LEVELS = 6;

const P = k.fitProjection([...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [T0, AX_Y, AX_Z + 10], [NOSE + 4, AX_Y, AX_Z + 8], [NOSE + 60, AX_Y, AX_Z]], WIDTH, HEIGHT, { pad: 26, azimuth: 40 });
const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (pts, style) => k.dotsSvg(pts, style);
const byDepth = (pts) => [...pts].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));

// Painel da fuselagem: chapa com rebites
function painel() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 20))) {
    out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.4), { tone: "mid" }));
  // emendas das chapas e fileiras de rebites
  const skin = k.insetPlan(PLATE, 6);
  out.push(L(k.planOutline(skin, 0, P), { tone: "lo" }));
  out.push(L(k.lineOnTop([-6, skin.y], [-6, skin.y + skin.d], 0, P), { tone: "faint" }));
  const rivets = [];
  for (let x = skin.x + 6; x < skin.x + skin.w - 3; x += 9) rivets.push(at([x, skin.y + 4, 0]), at([x, skin.y + skin.d - 4, 0]));
  for (let y = skin.y + 12; y < skin.y + skin.d - 8; y += 9) rivets.push(at([-6 - 4, y, 0]), at([-6 + 4, y, 0]));
  out.push(D(rivets, { size: 0.42, tone: "lo" }));
  const screws = k.corners(PLATE, 9);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  // plaqueta de identificação
  const tag = { x: 18, y: PLATE.y + 10, w: 44, d: 12, r: 1.2 };
  out.push(S(k.slabOf(tag, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  out.push(k.faceTextSvg(k.topMatrix([tag.x + tag.w / 2, tag.y + 7.4], 0.6, P, "x"), "PITOT 1", { size: 3.4, tone: "mid", anchor: "middle" }));
  out.push(D([at([tag.x + 2.4, tag.y + 6, 0.6]), at([tag.x + tag.w - 2.4, tag.y + 6, 0.6])], { size: 0.4 }));
  return out.join("");
}

// Tomada estática: a pressão do ar parado, que o velocímetro subtrai da pressão total
function estatica() {
  const out = [], [x, y] = [-104, 22];
  out.push(S(k.cylinder(x, y, 8, 0, 0.8, P, 40, 0.3), { tone: "mid" }));
  out.push(L(k.ring(x, y, 5.6, 0.8, P, 32), { tone: "lo" }));
  out.push(D([[-1.6, -1.2], [1.6, -1.2], [0, 1.6], [-1.6, 1.8], [1.6, 1.8]].map(([dx, dy]) => at([x + dx * 1.6, y + dy * 1.6, 0.8])), { size: 0.55, tone: "lo" }));
  out.push(D([0, 1, 2, 3].map((i) => at([x + Math.cos(i * Math.PI / 2 + 0.8) * 7, y + Math.sin(i * Math.PI / 2 + 0.8) * 7, 0.8])), { size: 0.4 }));
  return out.join("");
}
// Conector do aquecimento elétrico na flange e o cabo até a borda do painel
function aquecimento() {
  const out = [], cx = FL[0] + 13, cy = FL[1] - 12;
  out.push(S(k.cylinder(cx, cy, 3.6, 2.4, 5, P, 24), { tone: "mid" }));
  out.push(L(k.knurl(cx, cy, 3.6, 4, 7.4, 20, P), { tone: "lo" }));
  out.push(k.wireSvg(at([cx, cy, 7.4]), at([cx + 30, PLATE.y + 5, 0]), { via: [at([cx + 6, cy - 6, 7]), at([cx + 22, PLATE.y + 10, 1])], tone: "lo", ends: "both", size: 1.1 }));
  return out.join("");
}

// Mastro: flange com parafusos, haste aerodinâmica e o tubo deitado
const TUBE = G.frameAlong([T0, AX_Y, AX_Z], [1, 0, 0]);
function mastro() {
  const out = [];
  const [fx, fy] = FL;
  out.push(S(k.cylinder(fx, fy, 17, 0, 2.4, P, 56, 0.6), { tone: "mid" }));
  const bolts = Array.from({ length: 8 }, (_, i) => [fx + Math.cos(i * Math.PI / 4) * 13.4, fy + Math.sin(i * Math.PI / 4) * 13.4]);
  out.push(L(bolts.map(([x, y]) => k.ring(x, y, 1.5, 2.4, P, 12)).join(""), { tone: "lo" }));
  out.push(D(bolts.map(([x, y]) => at([x, y, 2.4])), { size: 0.45 }));
  // haste: perfil de gota estendido para cima
  const foil = [];
  for (let i = 0; i <= 20; i++) { const t = i / 20, x = -12 + t * 24, w = 4.6 * Math.sin(Math.PI * Math.pow(t, 0.7)) + 0.4; foil.push([fx + x, fy - w]); }
  for (let i = 20; i >= 0; i--) { const t = i / 20, x = -12 + t * 24, w = 4.6 * Math.sin(Math.PI * Math.pow(t, 0.7)) + 0.4; foil.push([fx + x, fy + w]); }
  out.push(S(k.extrude(foil, 2.4, AX_Z - 6 - 2.4, P, { bevel: 0.4 }), { tone: "mid" }));
  out.push(L(k.lineOnTop([fx - 9, fy], [fx + 9, fy], 2.4, P), { tone: "faint" }));
  // tubo: tampa traseira, corpo e ponta afinada com a entrada
  const prof = [[0, 0], [0, 6.2], [2, 6.4], [70, 6.4], [84, 5.6, 1], [96, 4.4, 1], [LEN, 3.6]];
  out.push(S(G.lathe(prof, TUBE, P, { hole: [LEN, 2.0], bevel: 0.5 }), { tone: "hi", inner: L([20, 46, 70].map((s) => G.arcOf(TUBE, s, 6.4, P)).join(""), { tone: "faint" }) }));
  // furo de dreno embaixo e marca de aquecimento
  out.push(D([at([T0 + 78, AX_Y + 3.8, AX_Z - 4.8])], { size: 0.6, tone: "lo" }));
  return out.join("");
}

// Gelo: cristais que crescem na entrada (níveis pré-calculados)
function gelo(level) {
  if (level === 0) return "";
  const f = level / ICE_LEVELS, out = [];
  const pts = [];
  for (let i = 0; i < 40; i++) {
    const a = (i * 2.399) % (Math.PI * 2), rr = 0.6 + (i % 6) * 0.95, s = LEN - 3 + (i % 5) * 1.6 * f;
    if (i / 40 > f * 1.1) continue;
    pts.push({ c: G.pointOf(TUBE, s + f * 3, rr * (0.5 + f * 0.8), a), r: 1.0 + f * 2.6 * (0.55 + (i % 4) * 0.2) });
  }
  pts.sort((a, b) => k.depthOf(a.c, P) - k.depthOf(b.c, P));
  for (const p of pts) out.push(S(G.sphereOf(p.c, p.r, P, { steps: 20 }), { tone: "hi", crease: "none", className: "ice" }));
  return out.join("");
}

// Fluxo de ar chegando na ponta
function fluxo() {
  const out = [];
  for (const [dy, dz, len] of [[0, 0, 70], [0, 7, 64], [0, -7, 64], [-7, 0, 60], [7, 0, 60]]) {
    const a = at([NOSE + 6, AX_Y + dy, AX_Z + dz]), b = at([NOSE + 6 + len, AX_Y + dy, AX_Z + dz]);
    out.push(`<path class="iso-line" data-tone="blue" data-free="both" d="M${b[0].toFixed(1)} ${b[1].toFixed(1)}L${a[0].toFixed(1)} ${a[1].toFixed(1)}" style="stroke-dasharray:4 5;stroke-width:1" data-part="flow"/>`);
  }
  return out.join("");
}

// Tubulação de pressão: sai da flange, corre na chapa até o velocímetro
function tubulacao() {
  const out = [];
  const A = G.frameAlong([FL[0], FL[1] + 15, PIPE_Z], [0, 1, 0]), lenA = PIPE_Y - FL[1] - 15;
  out.push(S(G.disc(0, lenA, PIPE_R, A, P), { tone: "mid" }));
  out.push(S(G.sphereOf([FL[0], PIPE_Y, PIPE_Z], PIPE_R * 1.25, P, { steps: 24 }), { tone: "mid" }));
  const B = G.frameAlong([FL[0], PIPE_Y, PIPE_Z], [1, 0, 0]), lenB = DIAL[0] - DIAL_R * 0.55 - FL[0];
  out.push(S(G.disc(0, lenB, PIPE_R, B, P), { tone: "mid" }));
  for (const x of [-26, 14]) {
    const cl = { x: x - 3, y: PIPE_Y - 4.4, w: 6, d: 8.8, r: 1 };
    out.push(S(k.slabOf(cl, 0, PIPE_Z * 2 + 0.6, P, 3, 0.3), { tone: "lo" }));
    out.push(D([at([x, PIPE_Y - 3.2, PIPE_Z * 2 + 0.6]), at([x, PIPE_Y + 3.2, PIPE_Z * 2 + 0.6])], { size: 0.4 }));
  }
  return out.join("");
}

// Velocímetro: corpo, aro serrilhado, mostrador com marcas a cada 10 kt
const needleAt = (kt) => {
  const ang = FROM + Math.min(1, kt / MAXKT) * SPAN, [x, y] = DIAL;
  return k.lineOnTop([x - Math.sin(ang) * 3.6, y + Math.cos(ang) * 3.6], [x + Math.sin(ang) * (DIAL_R - 4.4), y - Math.cos(ang) * (DIAL_R - 4.4)], DIAL_TOP + 0.2, P);
};
function velocimetro() {
  const out = [];
  const [x, y] = DIAL;
  out.push(`<path class="iso-halo" d="${k.haloOf({ x: x - DIAL_R, y: y - DIAL_R, w: DIAL_R * 2, d: DIAL_R * 2, r: DIAL_R }, 0, 0.1, P)}" style="filter:blur(3px)"/>`);
  out.push(S(k.cylinder(x, y, DIAL_R - 4, 0, 6, P, 48), { tone: "lo" }));
  out.push(S(k.cylinder(x, y, 6, 6, DIAL_Z - 6, P, 28), { tone: "mid" }));
  out.push(L(k.sideArc(x, y, 6, 12, P, 16), { tone: "faint" }));
  out.push(S(k.cylinder(x, y, DIAL_R, DIAL_Z, DIAL_H, P, 72, 0.8), { tone: "hi", crease: "lo" }));
  out.push(L(k.knurl(x, y, DIAL_R, DIAL_TOP - 3.2, DIAL_TOP, 84, P, 0.3), { tone: "lo" }));
  out.push(L(k.sideArc(x, y, DIAL_R, DIAL_TOP - 3.2, P, 40), { tone: "faint" }));
  out.push(L(k.ring(x, y, DIAL_R - 2.2, DIAL_TOP, P, 64), { tone: "lo" }));
  const t = k.radialTicks(x, y, DIAL_R - 3, 35, 5, DIAL_TOP, [1.3, 2.9], P, FROM + Math.PI, SPAN * 35 / 35);
  out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  // arco vermelho da velocidade de estol (até ~ 120 kt, didático)
  const arc = []; for (let i = 0; i <= 16; i++) { const a = FROM + (i / 16) * SPAN * (120 / MAXKT); arc.push([x + Math.sin(a) * (DIAL_R - 6.6), y - Math.cos(a) * (DIAL_R - 6.6)]); }
  out.push(`<path class="iso-line" data-tone="red" d="${k.onTop(arc, DIAL_TOP, P)}" style="stroke-width:1.6"/>`);
  out.push(k.faceTextSvg(k.topMatrix([x, y + 9], DIAL_TOP, P, "x"), "KT", { size: 3, tone: "lo", anchor: "middle" }));
  out.push(L(k.ring(x, y, 1.6, DIAL_TOP, P, 16), { tone: "mid" }));
  return out.join("");
}

const ices = Array.from({ length: ICE_LEVELS + 1 }, (_, i) => `<g data-ice="${i}" style="opacity:${i ? 0 : 1}">${gelo(i)}</g>`).join("");
const svg = k.figureSvg({
  width: WIDTH, height: HEIGHT,
  label: "Tubo de Pitot preso a um painel da fuselagem, ligado por um tubo fino a um velocímetro. O ar entra pela ponta do tubo; quando cristais de gelo entopem a entrada, a pressão cai e o ponteiro do velocímetro despenca, mesmo com o avião na mesma velocidade.",
  body: [painel(), estatica(), aquecimento(), mastro(), ices, fluxo(), tubulacao(), velocimetro(),
    `<path data-part="needle" class="iso-line" data-tone="lit" data-free="start" d="${needleAt(275)}" style="stroke-width:1.2"/>`],
});

const live = `
const P = ${JSON.stringify(P)};
const DIAL = ${JSON.stringify(DIAL)}, DIAL_R = ${DIAL_R}, DIAL_TOP = ${DIAL_TOP}, MAXKT = ${MAXKT}, SPAN = ${SPAN}, FROM = ${FROM}, LEVELS = ${ICE_LEVELS};
const needleAt = ${needleAt.toString().replace("k.lineOnTop", "lineOnTop")};
const stage = document.querySelector(".iso-stage"), svg = stage.querySelector("svg");
const needle = svg.querySelector('[data-part="needle"]'), ices = [...svg.querySelectorAll("[data-ice]")], flows = [...svg.querySelectorAll('[data-part="flow"]')];
const readout = document.querySelector("[data-readout]"), still = matchMedia("(prefers-reduced-motion: reduce)");
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
// Modelo: a velocidade indicada vem da pressão dinâmica medida. Com a entrada entupida e o dreno aberto, a pressão total vaza e o ponteiro cai.
const indicada = (b) => 275 * Math.sqrt(Math.max(0, 1 - b * 0.95));
let b = 0, target = 0, kt = 275, rate = 0, touring = true, clock = 0, last = 0, frame = 0, visible = false, idle = 0, dash = 0;
const tour = (t) => { const c = (t % 14) / 14; return c < 0.15 ? 0 : c < 0.55 ? (c - 0.15) / 0.4 : c < 0.75 ? 1 : 1 - (c - 0.75) / 0.25; };
function draw() {
  const lv = b * LEVELS, i0 = Math.floor(lv), f = lv - i0;
  ices.forEach((g, i) => { const o = i === i0 ? 1 - f : i === i0 + 1 ? f : 0; g.style.opacity = o.toFixed(3); });
  needle.setAttribute("d", needleAt(kt));
  flows.forEach((p, i) => { p.style.strokeDashoffset = String(dash * (1 - b * 0.9)); p.style.opacity = String(1 - b * 0.7); });
  const pct = Math.round(b * 100), txt = (pct < 5 ? "entrada livre" : "entrada " + pct + "% entupida") + " · velocímetro " + Math.round(kt) + " kt";
  if (readout.textContent !== txt) readout.textContent = txt;
  stage.setAttribute("aria-valuenow", String(pct)); stage.setAttribute("aria-valuetext", txt);
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60; last = now;
  const calm = still.matches;
  if (touring) { clock += dt; target = tour(clock); }
  b = calm ? target : b + (target - b) * (1 - Math.exp(-dt / 0.6));
  const want = indicada(b);
  for (let i = 0; i < 4; i++) { rate += ((want - kt) * 60 - rate * 12) * dt / 4; kt += rate * dt / 4; }
  dash -= dt * 40;
  draw();
  frame = visible ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
const steer = (v) => { touring = false; target = clamp(v, 0, 1); clearTimeout(idle); idle = setTimeout(() => { touring = !still.matches; clock = 0; run(); }, 4000); run(); };
new IntersectionObserver((e) => { visible = e[e.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
if (still.matches) touring = false;
stage.addEventListener("pointermove", (e) => { const r = svg.getBoundingClientRect(); steer(clamp(((e.clientX - r.left) / r.width - 0.15) / 0.7, 0, 1)); });
stage.addEventListener("keydown", (e) => { const d = e.key === "ArrowRight" || e.key === "ArrowUp" ? 0.1 : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -0.1 : 0; if (!d) return; e.preventDefault(); steer(target + d); });
draw();
`;

const body = k.plateHtml({
  fig: "Fig 1", title: "Tubo de Pitot", hint: "Arraste para congelar",
  readout: "entrada livre · velocímetro 275 kt",
  keys: [{ mark: "lit", label: "Ponteiro: a velocidade mostrada" }, { mark: "blue", label: "Ar entrando na ponta do tubo" }, { mark: "dotted", label: "Tomada estática: pressão do ar parado" }],
  caption: "Simplificado. O tubo de Pitot mede a pressão do ar que bate de frente na ponta; a tomada estática, rente à fuselagem, mede a do ar parado. A diferença entre as duas é a velocidade. No AF447, cristais de gelo entupiram a entrada por menos de um minuto: a pressão caiu e a velocidade mostrada despencou, mesmo com o avião voando igual.",
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="Tubo de Pitot: setas para congelar ou descongelar a entrada" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">${svg}</div>`,
});
const file = theme === "light" ? "fig-pitot-light.html" : "fig-pitot.html";
writeFileSync(join(HERE, "../../aviao/assets", file), k.pageHtml({ title: "Tubo de Pitot", theme, body: body + `<style>.ice path{fill:#e4f1fb!important;stroke:#8fb0c9!important;stroke-width:.5!important}.ice path:nth-of-type(n+3){fill:#cfe3f3!important}body{margin:0}.iso-page{width:100%!important;margin:0!important}.iso-plate{padding:44px 10px 58px!important;box-shadow:none!important;border-radius:12px!important}.iso-stage{touch-action:pan-y}</style>`, script: kitScript() + live }));
console.log("wrote", file);
