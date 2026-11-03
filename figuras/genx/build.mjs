// Fig: o motor GEnx-2B do 747-8 em corte. Construído com a skill Anatomy (MIT).
// Arrastar muda a rotação do fan (N1): as pás giram, o ar frio passa por fora do núcleo (bypass)
// e o ar quente sai pelo núcleo depois da câmara de combustão.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const HERE = dirname(fileURLToPath(import.meta.url));
const KIT = join(HERE, "../../.claude/skills/anatomy");
const k = await import(KIT + "/kit/iso-kit.mjs");
const G = await import(KIT + "/kit/lathe.mjs");
const { kitScript } = await import(KIT + "/scripts/inline-kit.mjs");
const theme = process.argv.includes("--light") ? "light" : "dark";

const WIDTH = 640, HEIGHT = 440, DEG = Math.PI / 180;
const ZC = 92;                                   // altura do eixo
const AX = G.frameOf([0, 0, ZC], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
const W = (x, r, th) => [x, r * Math.cos(th), ZC + r * Math.sin(th)];

// Perfis (x, raio). Nacele: boca de entrada até a saída do bypass
const NAC_IN = (x) => (x < -118 ? 58 + (x + 128) * 0.25 : x < 40 ? 60 - Math.max(0, x - 0) * 0.05 : 58 - (x - 40) * 0.32);
const X_LIP = -128, X_NAC_END = 70;
const FAN_X = -96, FAN_R = 57, HUB_R = 16;
// Núcleo (casca interna do núcleo)
const CORE = (x) => (x < -78 ? 24 : x < -50 ? 24 + (x + 78) * 0.12 : x < 30 ? 27.4 - (x + 50) * 0.11 : x < 60 ? 18.6 : 18.6 + (x - 60) * 0.11);
const X_CORE0 = -78, X_CORE1 = 140;
const PLUG = [[0, 15], [8, 14.5, 1], [20, 11.5, 1], [32, 6.5, 1], [42, 0]];

const BLADE_N = 18, FRAMES = 8;
const P = k.fitProjection([[X_LIP - 6, 0, ZC + 66], [X_LIP - 6, 0, ZC - 66], [X_LIP, 66, ZC], [X_LIP, -66, ZC], [190, 0, ZC], [70, 0, ZC + 100], [-60, 0, 0], [150, 0, 0], [-60, 50, 0], [150, -50, 0]], WIDTH, HEIGHT, { pad: 18, azimuth: 118, elevation: 18 });
const V = G.viewOf(P), LUZ = G.lightOf(P);
const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const path = (pts) => "M" + pts.map((p) => at(p).map((v) => v.toFixed(1)).join(" ")).join("L");
const longe = (th) => Math.cos(th) * V[1] + Math.sin(th) * V[2] < 0;
const hex = (h, f) => "#" + [1, 3, 5].map((i) => Math.max(0, Math.min(255, Math.round(parseInt(h.slice(i, i + 2), 16) * f))).toString(16).padStart(2, "0")).join("");
const lum = (n) => 0.5 + 0.5 * Math.max(0, n[0] * LUZ[0] + n[1] * LUZ[1] + n[2] * LUZ[2]);

// Casca vista por dentro (metade de trás), com textura de painéis
function cascaDentro(R, x0, x1, cor, dx = 5, dth = 7.5 * DEG, linhas = true) {
  const quads = [];
  for (let x = x0; x < x1 - 0.01; x += dx) {
    const x2 = Math.min(x1, x + dx);
    for (let th = 0; th < 2 * Math.PI - 0.001; th += dth) {
      const tm = th + dth / 2; if (!longe(tm)) continue;
      const n = [0, -Math.cos(tm), -Math.sin(tm)], f = 0.38 + lum(n) * 0.56;
      const c = W((x + x2) / 2, R((x + x2) / 2), tm);
      quads.push({ d: k.depthOf(c, P), h: `<path d="${path([W(x, R(x), th), W(x2, R(x2), th), W(x2, R(x2), th + dth), W(x, R(x), th + dth)])}Z" fill="${hex(cor, f)}" stroke="${hex(cor, f)}" stroke-width=".5"/>` });
    }
  }
  quads.sort((a, b) => a.d - b.d);
  let out = quads.map((q) => q.h).join("");
  if (linhas) {
    const rings = [];
    for (let x = x0 + 12; x < x1; x += 12) { const pts = []; for (let th = 0; th <= 2 * Math.PI + 0.01; th += 4 * DEG) if (longe(th)) pts.push(W(x, R(x) - 0.3, th)); else if (pts.length) { rings.push(path(pts)); pts.length = 0; } if (pts.length) rings.push(path(pts)); }
    out += `<path d="${rings.join("")}" fill="none" stroke="${hex(cor, 0.35)}" stroke-width=".6"/>`;
  }
  return out;
}
// Casca vista por fora (a metade de trás também, para o núcleo, que é "embrulhado" pelo bypass)
function cascaFora(R, x0, x1, cor) {
  const quads = [], dx = 4, dth = 6 * DEG;
  for (let x = x0; x < x1 - 0.01; x += dx) {
    const x2 = Math.min(x1, x + dx);
    for (let th = 0; th < 2 * Math.PI - 0.001; th += dth) {
      const tm = th + dth / 2; if (!longe(tm)) continue;
      const slope = (R(x2) - R(x)) / (x2 - x), n = G.unit3([-slope, Math.cos(tm), Math.sin(tm)]), f = 0.4 + lum(n) * 0.6;
      const c = W((x + x2) / 2, R((x + x2) / 2), tm);
      quads.push({ d: k.depthOf(c, P), h: `<path d="${path([W(x, R(x), th), W(x2, R(x2), th), W(x2, R(x2), th + dth), W(x, R(x), th + dth)])}Z" fill="${hex(cor, f)}" stroke="${hex(cor, f)}" stroke-width=".5"/>` });
    }
  }
  quads.sort((a, b) => a.d - b.d);
  return quads.map((q) => q.h).join("");
}
// Borda do corte (onde a casca foi cortada ao meio)
function bordaCorte(R, x0, x1, cor = "var(--borda)", w = 1.2) {
  const th = Math.atan2(V[2], V[1]), out = [];
  for (const s of [1, -1]) { const pts = []; for (let x = x0; x <= x1 + 0.01; x += 3) pts.push(W(x, R(x), th + s * Math.PI / 2)); out.push(path(pts)); }
  return `<path d="${out.join("")}" fill="none" stroke="${cor}" stroke-width="${w}"/>`;
}
// Uma fileira de pás vista de frente: "spokes" no plano x, com torção
function fileira(x, r0, r1, n, cor, sweep = 0.18, w = 1.1) {
  return `<path d="${G.spokesOf(AX, x, r0, r1, n, P, { sweep })}" fill="none" stroke="${cor}" stroke-width="${w}" stroke-linecap="round"/>`;
}
// Disco (cubo) de uma fileira
const disco = (x0, x1, r, cls) => S(G.disc(x0, x1, r, AX, P), { tone: "mid", className: cls });

// ---------- Fan: 18 pás largas e curvas (compósito, com borda de titânio), girando ----------
function pas(phase) {
  const out = [];
  const list = [];
  for (let i = 0; i < BLADE_N; i++) {
    const a = phase + (i / BLADE_N) * 2 * Math.PI;
    // a pá: da raiz à ponta, larga no meio, varrida para trás e torcida (vira em ângulo com o eixo)
    const pts = [], ret = [];
    for (let j = 0; j <= 10; j++) {
      const t = j / 10, r = HUB_R + (FAN_R - HUB_R) * t, sw = 0.34 * Math.pow(t, 1.3), chord = 0.16 - 0.06 * t, tw = 6 + 6 * t;
      pts.push(W(FAN_X - tw * 0.5, r, a + sw));
      ret.push(W(FAN_X + tw * 0.5, r, a + sw + chord));
    }
    const all = [...pts, ...ret.reverse()];
    const mid = W(FAN_X, (HUB_R + FAN_R) / 2, a + 0.2);
    const n = G.unit3([-0.6, Math.cos(a + 0.2 + Math.PI / 2) * 0.8, Math.sin(a + 0.2 + Math.PI / 2) * 0.8]);
    const f = 0.42 + lum(n) * 0.5;
    list.push({ d: k.depthOf(mid, P), h: `<path d="${path(all)}Z" fill="${hex("#4a5560", f)}" stroke="${hex("#2b323a", 1)}" stroke-width=".5"/><path d="${path(pts)}" fill="none" stroke="#c7cfd6" stroke-width=".9"/>` });
  }
  list.sort((a, b) => a.d - b.d);
  return list.map((q) => q.h).join("");
}
function fanFrames() {
  return Array.from({ length: FRAMES }, (_, i) => `<g data-fan="${i}" style="opacity:${i ? 0 : 1}">${pas((i / FRAMES) * (2 * Math.PI / BLADE_N))}</g>`).join("");
}
// Spinner (cone do nariz) com a espiral branca pintada
function spinner() {
  const F = G.frameOf([FAN_X + 4, 0, ZC], [-1, 0, 0], [0, 1, 0], [0, 0, 1]);
  const prof = [[0, HUB_R + 1], [6, HUB_R - 1, 1], [14, HUB_R - 6, 1], [22, HUB_R - 12, 1], [27, 0]];
  const espiral = []; for (let j = 0; j <= 30; j++) { const s = j / 30 * 25, r = (HUB_R + 1) * (1 - Math.pow(s / 27, 1.6)); espiral.push(G.pointOf(F, s, r + 0.3, 1.2 + j * 0.16)); }
  const vis = espiral.filter((p) => G.dot3(G.unit3(G.sub3(p, [p[0], 0, ZC])), V) > -0.1);
  return S(G.lathe(prof, F, P, { smooth: true }), { tone: "hi", className: "c-spinner" }) + `<path d="${path(vis)}" fill="none" stroke="#f4f6f8" stroke-width="1.6"/>`;
}

// ---------- Núcleo: booster, compressor de alta, câmara de combustão, turbinas ----------
function nucleoDentro() {
  const out = [];
  // casca do núcleo por dentro (só metade de trás)
  out.push(cascaDentro((x) => CORE(x) - 1.6, X_CORE0, X_CORE1, "#5b6168", 5, 9 * DEG, false));
  // eixo
  out.push(K("lpshaft", S(G.disc(X_CORE0 - 10, X_CORE1 + 4, 3, AX, P), { tone: "mid", className: "c-aco" })));
  return out.join("");
}
function estagiosK() { return estagios(); }
function estagios() {
  const rows = [];
  // booster (compressor de baixa): 4 fileiras
  for (let i = 0; i < 3; i++) rows.push({ k: "lpc", x: -70 + i * 7, r0: 12, r1: CORE(-70 + i * 7) - 2.5, n: 40, cor: "#b9c3cc" });
  // compressor de alta: 10 fileiras, cada vez menores
  for (let i = 0; i < 10; i++) { const x = -40 + i * 6.4; rows.push({ k: "hpc", x, r0: 9.5 + i * 0.25, r1: CORE(x) - 2.2, n: 46, cor: "#d4dbe1" }); }
  // turbina de alta: 2 fileiras (pás quentes, douradas)
  for (let i = 0; i < 2; i++) rows.push({ k: "hpt", x: 50 + i * 6, r0: 10, r1: 17, n: 36, cor: "#e7b25c" });
  // turbina de baixa: 7 fileiras, cada vez maiores
  for (let i = 0; i < 6; i++) { const x = 66 + i * 10; rows.push({ k: "lpt", x, r0: 9, r1: CORE(x) - 2, n: 42, cor: "#c9a06a" }); }
  rows.sort((a, b) => k.depthOf([a.x, 0, ZC], P) - k.depthOf([b.x, 0, ZC], P));
  return rows.map((r) => K(r.k, disco(r.x - 1.2, r.x + 1.2, r.r0, "c-aco") + fileira(r.x, r.r0, r.r1, r.n, r.cor, 0.12, 0.8))).join("");
}
function combustao() {
  // câmara anular: anel brilhante entre o compressor e a turbina
  const F = AX, out = [];
  out.push(S(G.ringBand(28, 46, 11, 17.5, F, P), { tone: "mid", className: "c-camara" }));
  // bicos de combustível (pontinhos ao redor)
  out.push(k.dotsSvg(G.dotsOf(F, 28, 14, 22, P, { all: true }), { size: 0.8, tone: "lo" }));
  out.push(`<g data-part="chama">${[0, 1, 2].map((j) => `<path d="${G.circleOf(F, 33 + j * 5, 14.2, P, 48)}" fill="none" stroke="#ff8a2a" stroke-width="${2.4 - j * 0.6}" opacity="${0.8 - j * 0.2}"/>`).join("")}</g>`);
  return out.join("");
}
function plug() {
  const F = G.frameOf([X_CORE1, 0, ZC], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  return S(G.lathe(PLUG, F, P, { smooth: true }), { tone: "hi", className: "c-quente" });
}

// ---------- Fluxo de ar: partículas no bypass (frio) e no núcleo (esquenta depois da combustão) ----------
function fluxo() {
  const dots = [];
  for (let i = 0; i < 90; i++) dots.push(`<circle data-flow="b" data-s="${(i * 0.618) % 1}" data-a="${(i * 2.399) % (2 * Math.PI)}" r="1.4" fill="#7fb8ff"/>`);
  for (let i = 0; i < 60; i++) dots.push(`<circle data-flow="c" data-s="${(i * 0.618) % 1}" data-a="${(i * 2.399) % (2 * Math.PI)}" r="1.2" fill="#9ad0ff"/>`);
  return `<g data-part="fluxo">${dots.join("")}</g>`;
}

// ---------- Nacele, pilone e boca de entrada ----------
function nacele() {
  return cascaDentro((x) => NAC_IN(x), X_LIP + 2, X_NAC_END, "#7d8791", 5, 7.5 * DEG, true);
}
function lip() {
  // boca de entrada: anel arredondado de alumínio polido
  const F = G.frameOf([X_LIP, 0, ZC], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  const c = (s0, r) => G.circleOf(F, s0, r, P, 96);
  return `<path d="${c(3, 61)}" fill="none" stroke="#5f6870" stroke-width="7.5"/><path d="${c(0, 60)}" fill="none" stroke="#c9d0d6" stroke-width="6"/>`
    + `<path d="${c(-1, 58.6)}" fill="none" stroke="#f3f6f8" stroke-width="1.4"/><path d="${c(0, 63.2)}" fill="none" stroke="#2f363d" stroke-width=".8"/><path d="${c(1, 56.8)}" fill="none" stroke="#2f363d" stroke-width=".8"/>`;
}
function pilone() {
  const out = [], topo = ZC + 63;
  out.push(S(G.prismOf(G.frameOf([0, -4, 0], [0, 1, 0], [1, 0, 0], [0, 0, 1]), [[-60, topo - 12], [70, topo - 14], [120, topo + 8], [-10, topo + 14]], 0, 8, P), { tone: "hi", className: "c-pintura" }));
  return out.join("");
}
function bancada() {
  const PL = { x: -110, y: -46, w: 250, d: 92, r: 8 };
  const out = [`<path class="iso-halo" d="${k.haloOf(PL, -8, 8, P)}"/>`];
  out.push(S(k.slabOf(PL, -8, 8, P, 8, 1.2), { tone: "mid", className: "c-chao" }));
  out.push(L(k.planOutline(k.insetPlan(PL, 6), 0, P), { tone: "lo" }));
  for (const x of [-36, 70]) {
    out.push(S(k.slabOf({ x: x - 8, y: -36, w: 16, d: 72, r: 2 }, 0, 6, P, 3, 0.4), { tone: "mid", className: "c-amarelo" }));
    for (const y of [-26, 26]) out.push(S(k.slabOf({ x: x - 3, y: y - 3, w: 6, d: 6, r: 1 }, 6, ZC - 60 - 6 + Math.abs(y) * 0.2, P, 3, 0.3), { tone: "mid", className: "c-amarelo" }));
  }
  return out.join("");
}

// ---------- Componentes extras ----------
const THC = Math.atan2(V[2], V[1]), FAR0 = THC + Math.PI / 2 + 0.05, FAR1 = THC + 1.5 * Math.PI - 0.05;
function carcacaFan() {
  // a carcaça do fan: a parte da nacele em volta do fan, mais escura, com os anéis de contenção
  return cascaDentro((x) => NAC_IN(x) - 0.2, -118, -64, "#56606b", 4, 7.5 * DEG, false)
    + [-108, -100, -88, -76].map((x) => { const pts = []; for (let th = FAR0; th <= FAR1; th += 3 * DEG) pts.push(W(x, NAC_IN(x) - 0.5, th)); return `<path d="${path(pts)}" fill="none" stroke="#2e353c" stroke-width="1.6"/>`; }).join("");
}
function divisor() {
  const c = (r, s0) => G.circleOf(AX, s0, r, P, 72);
  return `<path d="${c(25.4, -80)}" fill="none" stroke="#c9d0d6" stroke-width="3.2"/><path d="${c(24.2, -80)}" fill="none" stroke="#f4f6f8" stroke-width=".8"/>`;
}
function ogv() {
  return `<path d="${G.spokesOf(AX, -66, CORE(-66) + 0.6, NAC_IN(-66) - 1, 44, P, { sweep: 0.06, from: FAR0, to: FAR1 })}" fill="none" stroke="#a9b2bb" stroke-width="1.3" stroke-linecap="round"/>`;
}
function vbv() {
  const out = [];
  for (const th of [FAR0 + 0.5, FAR0 + 1.1, FAR0 + 1.7, FAR0 + 2.3]) {
    const a = W(-52, CORE(-52) + 0.4, th), b = W(-46, CORE(-46) + 0.4, th), c = W(-46, CORE(-46) + 0.4, th + 0.18), d = W(-52, CORE(-52) + 0.4, th + 0.18);
    out.push(`<path d="${path([a, b, c, d])}Z" fill="#3c444c" stroke="#1f2429" stroke-width=".6"/>`);
  }
  return out.join("");
}
function injetores() {
  const out = [];
  for (let i = 0; i < 8; i++) { const th = FAR0 + (i + 0.5) * (FAR1 - FAR0) / 8; out.push(path([W(27, CORE(27) + 1.5, th), W(29, 15, th)])); }
  return `<path d="${out.join("")}" fill="none" stroke="#e0a64a" stroke-width="1.4" stroke-linecap="round"/>`;
}
function eixos() {
  return S(G.disc(-46, 52, 5.6, AX, P), { tone: "mid", className: "c-eixoalta" });
}
function mancais() {
  return [-84, -46, 60, 132].map((x) => S(G.disc(x - 1.6, x + 1.6, x < 0 ? 8 : 7.4, AX, P), { tone: "mid", className: "c-bronze" })).join("");
}
function reversor() {
  // grades do reversor (cascatas) na parte de trás da nacele
  const out = [];
  for (let x = 16; x <= 58; x += 4) { const pts = []; for (let th = FAR0; th <= FAR1; th += 3 * DEG) pts.push(W(x, NAC_IN(x) - 0.4, th)); out.push(path(pts)); }
  for (let th = FAR0; th <= FAR1; th += 6 * DEG) out.push(path([W(16, NAC_IN(16) - 0.4, th), W(58, NAC_IN(58) - 0.4, th)]));
  return `<path d="${out.join("")}" fill="none" stroke="#2a3138" stroke-width=".9"/>`;
}
function acessorios() {
  const out = [];
  const box = { x: -112, y: -12, w: 34, d: 22, r: 2 }, z0 = ZC - 76;
  out.push(S(k.slabOf(box, z0, 12, P, 3, 0.4), { tone: "mid", className: "c-agb" }));
  // bombas e gerador presos na caixa
  out.push(S(k.cylinder(-104, -4, 4, z0 - 7, 7, P, 24), { tone: "mid", className: "c-aco" }));
  out.push(S(k.cylinder(-92, 2, 5, z0 - 8, 8, P, 28), { tone: "mid", className: "c-aco" }));
  out.push(S(k.cylinder(-82, -6, 3.4, z0 - 6, 6, P, 20), { tone: "mid", className: "c-aco" }));
  // eixo radial que sobe até o núcleo
  out.push(S(G.disc(0, 50, 1.4, G.frameAlong([-90, -2, z0 + 12], [0.05, 0, 1]), P), { tone: "mid", className: "c-aco" }));
  return out.join("");
}
function extintor() {
  const c = [-60, -6, ZC - 74];
  return S(G.sphereOf(c, 6, P, { steps: 28 }), { tone: "hi", className: "c-extintor" })
    + S(G.disc(0, 6, 1.3, G.frameAlong([c[0], c[1], c[2] + 5], [0, 0, 1]), P), { tone: "mid", className: "c-aco" });
}
function bocal() {
  const c = (x, r) => G.circleOf(AX, x, r, P, 72);
  return `<path d="${c(X_CORE1, CORE(X_CORE1))}" fill="none" stroke="#3a3128" stroke-width="2.4"/>`;
}

// Números e textos dos 21 componentes
const PECAS = [
  ["inlet", "Entrada de ar", "A boca da nacele. A borda é aquecida para não juntar gelo, e por dentro há painéis que abafam o ruído.", [X_LIP, 0, ZC + 61]],
  ["spinner", "Cone do fan (spinner)", "O cone que gira no centro do fan. A espiral pintada mostra para a equipe de solo que o motor está girando.", [FAN_X - 14, -4, ZC + 6]],
  ["fan", "Pás do fan", "18 pás de compósito de fibra de carbono com a borda de titânio, num fan de cerca de 2,7 m. O fan faz a maior parte do empuxo.", [FAN_X, -24, ZC - 30]],
  ["fancase", "Carcaça do fan", "O anel que envolve o fan. É feito para segurar uma pá que se solte, sem deixar que ela saia do motor.", [-100, -40, ZC - 40]],
  ["splitter", "Divisor de fluxo", "A borda que separa o ar: a maior parte vai por fora do núcleo, e uma parte entra nele.", [-80, -24, ZC + 6]],
  ["ogv", "Palhetas guia (OGV)", "Palhetas fixas atrás do fan. Elas endireitam o ar, que sai do fan girando.", [-66, -36, ZC - 32]],
  ["bypass", "Duto do fan (bypass)", "Por aqui passa cerca de 8 vezes mais ar do que pelo núcleo. Esse ar frio dá a maior parte do empuxo.", [-20, -30, ZC + 38]],
  ["lpc", "Compressor de baixa (booster)", "3 estágios que giram junto com o fan e fazem a primeira compressão do ar que entra no núcleo.", [-64, -12, ZC + 18]],
  ["vbv", "Válvulas de sangria (VBV)", "Portinholas que abrem em baixa rotação e soltam ar do booster no duto do fan, para o compressor não estolar.", [-49, -20, ZC - 22]],
  ["hpc", "Compressor de alta (HPC)", "10 estágios que comprimem o ar até cerca de 23 vezes a pressão de entrada.", [-6, -10, ZC + 18]],
  ["fuel", "Injetores de combustível", "Bicos que pulverizam o combustível dentro da câmara de combustão.", [28, -18, ZC - 12]],
  ["comb", "Câmara de combustão (TAPS)", "O anel onde o combustível queima. O modelo TAPS mistura ar e combustível antes da chama, para poluir menos.", [38, 0, ZC + 17]],
  ["hpt", "Turbina de alta (HPT)", "2 estágios que recebem o gás mais quente e giram o compressor de alta.", [53, 0, ZC + 17]],
  ["lpt", "Turbina de baixa (LPT)", "6 estágios que giram o fan e o booster.", [96, 0, ZC + 24]],
  ["hpshaft", "Eixo de alta (N2)", "Liga a turbina de alta ao compressor de alta.", [0, -5, ZC - 2]],
  ["lpshaft", "Eixo de baixa (N1)", "Passa por dentro do eixo de alta e liga a turbina de baixa ao fan.", [118, -2, ZC]],
  ["mancal", "Mancais", "Rolamentos que seguram os eixos. Giram mergulhados em óleo.", [60, -7, ZC - 4]],
  ["reverser", "Reversor de empuxo", "No pouso, a parte de trás da nacele recua e estas grades jogam o ar do fan para a frente, ajudando a frear.", [36, -40, ZC + 40]],
  ["extintor", "Extintor de fogo", "Garrafa que descarrega o agente extintor dentro da nacele se houver fogo no motor.", [-60, -6, ZC - 74]],
  ["agb", "Caixa de acessórios", "Engrenagens que tiram força do eixo de alta para as bombas de combustível, óleo e hidráulica e para os geradores.", [-96, 0, ZC - 64]],
  ["nozzle", "Bocal e cone de escape", "Por onde sai o gás quente do núcleo. O cone guia o fluxo na saída.", [160, 0, ZC + 4]],
];
function pinos() {
  const list = PECAS.map(([id], i) => { const a = at(PECAS[i][3]); return { id, n: i + 1, a, top: a[1] < HEIGHT * 0.47 }; });
  const out = [];
  for (const top of [true, false]) {
    const row = list.filter((p) => p.top === top).sort((a, b) => a.a[0] - b.a[0]);
    const gap = 27, y = top ? 18 : HEIGHT - 16;
    row.forEach((p, i) => { p.x = Math.max(p.a[0], i ? row[i - 1].x + gap : 16); });
    for (let i = row.length - 1; i >= 0; i--) row[i].x = Math.min(row[i].x, i < row.length - 1 ? row[i + 1].x - gap : WIDTH - 16);
    for (const p of row) out.push(`<g class="pino" data-pin="${p.id}"><path d="M${p.x.toFixed(1)} ${y + (top ? 12 : -12)}L${p.a[0].toFixed(1)} ${p.a[1].toFixed(1)}" class="pino-l"/><circle cx="${p.a[0].toFixed(1)}" cy="${p.a[1].toFixed(1)}" r="2.2" class="pino-d"/><circle cx="${p.x.toFixed(1)}" cy="${y}" r="12" class="pino-c"/><text x="${p.x.toFixed(1)}" y="${y + 4.6}" text-anchor="middle" class="pino-t">${p.n}</text></g>`);
  }
  return `<g data-part="pinos">${out.join("")}</g>`;
}
const K = (id, html) => `<g data-k="${id}">${html}</g>`;

const MATERIAIS = { eixoalta: "#7f8b97", bronze: "#b98a4e", agb: "#6f7b86", extintor: "#d23b2f",  aco: "#9aa4ae", spinner: "#3b4249", quente: "#8a6a4e", camara: "#8c5a3a", lip: "#d9dee3", pintura: "#e6eaee", chao: "#5d646d", amarelo: "#d9a520" };
const CORES = Object.entries(MATERIAIS).map(([n, c]) => `.c-${n}{--anatomy-shade-0:${hex(c, 0.6)};--anatomy-shade-1:${hex(c, 0.7)};--anatomy-shade-2:${hex(c, 0.8)};--anatomy-shade-3:${hex(c, 0.9)};--anatomy-top:${hex(c, 1.06)};--anatomy-paper:${hex(c, 0.85)};--anatomy-face:${hex(c, 0.85)}}.c-${n} .iso-edge{stroke:${hex(c, 0.42)}}`).join("")
  + `.c-chao .iso-line{stroke:#454b52}.iso{--borda:#e3e8ed}.iso[data-theme=light]{--borda:#3d454e}`
  + `[data-part=chama]{animation:chama 1.2s ease-in-out infinite alternate}@keyframes chama{from{opacity:.55}to{opacity:1}}`
  + `.pino{cursor:pointer}.pino-l{stroke:var(--pino);stroke-width:.8;fill:none}.pino-d{fill:var(--pino)}.pino-c{fill:var(--anatomy-card);stroke:var(--pino);stroke-width:1.4}.pino-t{fill:var(--pino);font:700 13px ui-sans-serif,system-ui,sans-serif}`
  + `.pino.gx-on .pino-c{fill:#f06aae;stroke:#f06aae}.pino.gx-on .pino-t{fill:#fff}.pino.gx-on .pino-l{stroke:#f06aae;stroke-width:1.4}.pino.gx-on .pino-d{fill:#f06aae}`
  + `.gx-sel [data-k]{transition:opacity .25s}.gx-sel [data-k]:not(.gx-on){opacity:.22}.gx-sel [data-k].gx-on{filter:drop-shadow(0 0 4px #f06aae)}`
  + `.iso{--pino:#dfe5ea}.iso[data-theme=light]{--pino:#3d454e}`
  + `.gx-info{margin:10px 2px 8px;line-height:1.5;min-height:3em}.gx-info b{color:#f06aae}`
  + `.gx-lista{display:grid;grid-template-columns:1fr 1fr;gap:5px}.gx-lista button{display:flex;gap:7px;align-items:center;text-align:left;border:1px solid var(--anatomy-mid);background:transparent;color:inherit;border-radius:8px;padding:5px 6px;font:inherit;font-size:11.5px;line-height:1.25;cursor:pointer;-webkit-tap-highlight-color:transparent}`
  + `.gx-lista button b{flex:0 0 19px;height:19px;border-radius:50%;display:grid;place-items:center;font-size:11px;border:1px solid currentColor}.gx-lista button[aria-pressed=true]{border-color:#f06aae;color:#f06aae}`;

const svg = k.figureSvg({
  width: WIDTH, height: HEIGHT,
  label: "O motor GEnx-2B do Boeing 747-8 em corte, sobre um carrinho de transporte: a nacele aberta ao meio, o fan de 18 pás com o cone de nariz, o núcleo com o compressor de baixa, o compressor de alta, a câmara de combustão e as turbinas, e o cone de escape. Partículas azuis mostram o ar que passa por fora do núcleo; no núcleo, o ar esquenta depois da câmara de combustão.",
  body: [bancada(), pilone(), K("inlet", nacele()), K("fancase", carcacaFan()), K("reverser", reversor()), K("ogv", ogv()), K("bypass", cascaFora((x) => CORE(x), X_CORE0, X_CORE1, "#a8b0b8")), K("vbv", vbv()), K("agb", acessorios()), K("extintor", extintor()), nucleoDentro(),
    K("hpshaft", eixos()), K("mancal", mancais()), estagiosK(), K("fuel", injetores()), K("comb", combustao()), K("nozzle", plug() + bocal()), fluxo(), K("fan", fanFrames()), K("spinner", spinner()), K("splitter", divisor()), K("inlet", lip()),
    bordaCorte(NAC_IN, X_LIP + 2, X_NAC_END), bordaCorte(CORE, X_CORE0, X_CORE1, "var(--borda)", 0.9), pinos()],
});

const TEXTOS = Object.fromEntries(PECAS.map(([id, nome, txt], i) => [id, [i + 1, nome, txt]]));
const live = `
const TEXTOS = ${JSON.stringify(TEXTOS)};
const P = ${JSON.stringify(P)}, ZC = ${ZC}, FRAMES = ${FRAMES};
const NAC_IN = ${NAC_IN.toString()}, CORE = ${CORE.toString()};
const V = ${JSON.stringify(V)};
const stage = document.querySelector(".iso-stage"), svg = stage.querySelector("svg");
const fans = [...svg.querySelectorAll("[data-fan]")], flows = [...svg.querySelectorAll("[data-flow]")], chama = svg.querySelector('[data-part="chama"]');
const readout = document.querySelector("[data-readout]"), still = matchMedia("(prefers-reduced-motion: reduce)");
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const W = (x, r, th) => [x, r * Math.cos(th), ZC + r * Math.sin(th)];
const longe = (th) => Math.cos(th) * V[1] + Math.sin(th) * V[2] < 0;
// N1 em %: marcha lenta ~ 22%, decolagem ~ 100%
let n1 = 22, target = 22, touring = true, clock = 0, last = 0, frame = 0, visible = false, idle = 0, ang = 0;
const tour = (c) => { const u = (c % 14) / 14; return u < 0.15 ? 22 : u < 0.45 ? 22 + (u - 0.15) / 0.3 * 78 : u < 0.75 ? 100 : 100 - (u - 0.75) / 0.25 * 78; };
const parts = flows.map((el) => ({ el, tipo: el.dataset.flow, s: +el.dataset.s, a: +el.dataset.a }));
function lugar(p) {
  if (p.tipo === "b") { // bypass: entre o núcleo e a nacele, de x -110 a 90
    const x = -112 + p.s * 190, rIn = x < -78 ? 18 : CORE(Math.min(x, 140)) + 2, rOut = x < 70 ? NAC_IN(x) - 3 : 54 - (x - 70) * 0.25;
    return [W(x, rIn + (rOut - rIn) * (0.25 + 0.5 * ((p.a * 7) % 1)), p.a), x, x > 60 ? Math.max(0, 1 - (x - 60) / 18) : 1];
  }
  const x = -110 + p.s * 300, r = x < -78 ? 14 : x < 140 ? Math.max(8, CORE(x) - 6) : 10 - (x - 140) * 0.05; // núcleo
  return [W(x, r * (0.6 + 0.3 * ((p.a * 5) % 1)), p.a), x];
}
function cor(x) { if (x < 28) return "#9ad0ff"; if (x < 50) return "#ffd27a"; if (x < 120) return "#ff9a3c"; return "#ff6a3c"; }
function draw(dt) {
  const v = n1 / 100;
  ang += dt * (2 + v * 30);
  const fi = Math.floor(((ang % 1) + 1) % 1 * FRAMES);
  fans.forEach((g, i) => { g.style.opacity = i === fi ? "1" : "0"; });
  for (const p of parts) {
    p.s = (p.s + dt * (0.05 + v * 0.45) * (p.tipo === "b" ? 1 : 0.7)) % 1;
    const [w, x, fade = 1] = lugar(p), s = iso(w, P);
    p.el.setAttribute("cx", s[0].toFixed(1)); p.el.setAttribute("cy", s[1].toFixed(1));
    p.el.style.opacity = ((0.25 + 0.7 * v) * fade).toFixed(2);
    if (p.tipo === "c") p.el.setAttribute("fill", cor(x));
  }
  chama.style.opacity = String(0.25 + 0.75 * v);
  const empuxo = Math.round(66500 * Math.pow(v, 2.2) / 100) * 100;
  const txt = "N1 " + Math.round(n1) + "% · empuxo ~" + empuxo.toLocaleString("pt-BR") + " lbf";
  if (readout.textContent !== txt) readout.textContent = txt;
  stage.setAttribute("aria-valuenow", String(Math.round(n1))); stage.setAttribute("aria-valuetext", txt);
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60; last = now;
  if (touring) { clock += dt; target = tour(clock); }
  n1 = still.matches ? target : n1 + (target - n1) * (1 - Math.exp(-dt / 1.2));
  draw(still.matches ? 0 : dt);
  frame = visible ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
const steer = (v) => { touring = false; target = clamp(v, 22, 100); clearTimeout(idle); idle = setTimeout(() => { touring = !still.matches; clock = 0; run(); }, 4500); run(); };
new IntersectionObserver((e) => { visible = e[e.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
if (still.matches) touring = false;
stage.addEventListener("pointermove", (e) => { const r = svg.getBoundingClientRect(); steer(22 + clamp(((e.clientX - r.left) / r.width - 0.1) / 0.8, 0, 1) * 78); });
stage.addEventListener("keydown", (e) => { const d = e.key === "ArrowRight" || e.key === "ArrowUp" ? 8 : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -8 : 0; if (!d) return; e.preventDefault(); steer(target + d); });
draw(0);
// Escolher uma peça: pelo número no desenho ou pelo nome na lista
const info = document.getElementById("gxInfo"), botoes = [...document.querySelectorAll("[data-peca]")];
let escolhida = null;
function escolher(id) {
  escolhida = escolhida === id ? null : id;
  svg.classList.toggle("gx-sel", !!escolhida);
  svg.querySelectorAll("[data-k]").forEach((g) => g.classList.toggle("gx-on", g.dataset.k === escolhida));
  svg.querySelectorAll("[data-pin]").forEach((g) => g.classList.toggle("gx-on", g.dataset.pin === escolhida));
  botoes.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.peca === escolhida)));
  info.innerHTML = escolhida ? "<b>" + TEXTOS[escolhida][0] + ". " + TEXTOS[escolhida][1] + "</b> " + TEXTOS[escolhida][2] : "Toque num número ou num nome para ver a peça.";
}
svg.addEventListener("click", (e) => { const p = e.target.closest("[data-pin]"); if (p) escolher(p.dataset.pin); });
botoes.forEach((b) => b.addEventListener("click", () => escolher(b.dataset.peca)));
`;

const body = k.plateHtml({
  fig: "Fig 1", title: "GEnx-2B · 747-8", hint: "Arraste para acelerar",
  readout: "N1 22% · marcha lenta",
  keys: [{ mark: "blue", label: "Ar que passa por fora do núcleo (bypass)" }, { mark: "red", label: "Ar quente que sai do núcleo" }],
  caption: "Simplificado. O fan, de 18 pás, empurra quase todo o ar por fora do núcleo; só uma parte entra no núcleo, é comprimida, recebe combustível, queima e move as turbinas, que giram o fan e os compressores. Os números são aproximados: o GEnx-2B dá até cerca de 66.500 lbf de empuxo na decolagem.",
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="Motor GEnx-2B: setas aceleram e reduzem" aria-valuemin="22" aria-valuemax="100" aria-valuenow="22">${svg}</div>
    <p class="gx-info" id="gxInfo">Toque num número ou num nome para ver a peça.</p>
    <div class="gx-lista">${PECAS.map(([id, nome], i) => `<button type="button" data-peca="${id}"><b>${i + 1}</b>${nome}</button>`).join("")}</div>`,
});
const file = theme === "light" ? "fig-genx-light.html" : "fig-genx.html";
const css = `<style>${CORES}body{margin:0}.iso-page{width:100%!important;margin:0!important;padding:14px 18px 18px;box-sizing:border-box}.iso-plate{padding:44px 16px 58px!important;box-shadow:none!important;border-radius:12px!important}.iso-stage{touch-action:pan-y}</style>`;
writeFileSync(join(HERE, "../../aviao/assets", file), k.pageHtml({ title: "GEnx-2B", theme, body: body + css, script: kitScript() + live }));
console.log("wrote", file);
