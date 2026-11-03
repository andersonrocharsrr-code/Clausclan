// Fig: o motor GEnx-2B do 747-8 em corte, no estilo das ilustrações de corte dos fabricantes.
// Construído com a skill Anatomy (MIT). O motor é cortado ao meio por um plano que passa pelo eixo:
// no plano aparecem as pás de cada estágio em perfil, os discos, os eixos e o caminho do ar
// (azul frio, vermelho quente); atrás do plano, a metade de trás das carcaças e as tubulações por fora.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const HERE = dirname(fileURLToPath(import.meta.url));
const KIT = join(HERE, "../../.claude/skills/anatomy");
const k = await import(KIT + "/kit/iso-kit.mjs");
const G = await import(KIT + "/kit/lathe.mjs");
const { kitScript } = await import(KIT + "/scripts/inline-kit.mjs");
const theme = process.argv.includes("--light") ? "light" : "dark";

const WIDTH = 660, HEIGHT = 460, DEG = Math.PI / 180;
const ZC = 96;
const W = (x, r, th) => [x, r * Math.cos(th), ZC + r * Math.sin(th)];

// ---------- Perfis do motor (x ao longo do eixo, r = raio), na proporção do corte do GEnx-2B ----------
const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const HUB = (x) => x < -82 ? 17 : x < -58 ? 17 + (x + 82) * 0.08 : x < -34 ? lerp(18.9, 11, sm(-58, -34, x)) : x < 20 ? 11 + (x + 34) * 0.028 : x < 42 ? 10.5 : x < 54 ? 12 : x < 66 ? lerp(12, 14, sm(54, 66, x)) : x < 128 ? 14 + (x - 66) * 0.05 : 17.1;
const CAS = (x) => x < -82 ? 26 : x < -58 ? 26 - (x + 82) * 0.04 : x < -34 ? lerp(25, 15, sm(-58, -34, x)) : x < 18 ? 15 - (x + 34) * 0.027 : x < 24 ? lerp(13.6, 19, sm(18, 24, x)) : x < 42 ? lerp(19, 16, sm(34, 42, x)) : x < 54 ? 16 : x < 66 ? lerp(16, 22.5, sm(54, 66, x)) : x < 128 ? 22.5 + (x - 66) * 0.137 : lerp(31, 28, sm(128, 150, x));
const COWL = (x) => x < -58 ? lerp(26.6, 29.5, sm(-82, -74, x)) : x < -34 ? lerp(29.5, 27.5, sm(-58, -34, x)) : x < 20 ? 27.5 - (x + 34) * 0.02 : x < 72 ? lerp(26.4, 30.5, sm(20, 72, x)) : CAS(x) + 2.4;
const FC = (x) => x < -118 ? lerp(62, 60, sm(-130, -118, x)) : x < -60 ? 60 - (x + 118) * 0.02 : 58.8;
const NAC = (x) => x < 20 ? 59 : lerp(59, 52, sm(20, 78, x));
const PLUG = (x) => 17.1 * Math.sqrt(Math.max(0, 1 - Math.pow((x - 128) / 34, 2)));
const FAN_X = -98, FAN_R = 57.5, HUB_R = 17, BLADE_N = 18, FRAMES = 8;

const P = k.fitProjection([[-132, 0, ZC + 64], [-132, 0, ZC - 64], [-132, 64, ZC], [-132, -64, ZC], [178, 0, ZC], [80, 0, ZC + 60], [-80, 0, 0], [150, 0, 0], [-80, 46, 0], [150, -46, 0]], WIDTH, HEIGHT, { pad: 34, azimuth: 122, elevation: 16 });
const V = G.viewOf(P), LUZ = G.lightOf(P);
const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const path = (pts) => "M" + pts.map((p) => at(p).map((v) => v.toFixed(1)).join(" ")).join("L");
const longe = (th) => Math.cos(th) * V[1] + Math.sin(th) * V[2] < 0;
const hex = (h, f) => "#" + [1, 3, 5].map((i) => Math.max(0, Math.min(255, Math.round(parseInt(h.slice(i, i + 2), 16) * f))).toString(16).padStart(2, "0")).join("");
const lum = (n) => 0.5 + 0.5 * Math.max(0, n[0] * LUZ[0] + n[1] * LUZ[1] + n[2] * LUZ[2]);

// O plano do corte: contém o eixo e fica de frente para quem olha. r com sinal: + em cima, - embaixo.
const THC = Math.atan2(V[2], V[1]);
let T0 = THC + Math.PI / 2; if (Math.sin(T0) < 0) T0 += Math.PI;
const Q = (x, r) => [x, r * Math.cos(T0), ZC + r * Math.sin(T0)];
const TRAS = THC + Math.PI;                       // direção da metade de trás
const FAR = (f) => TRAS + f;                       // ângulo perto do meio da metade de trás
const qpath = (pts) => "M" + pts.map(([x, r]) => at(Q(x, r)).map((v) => v.toFixed(1)).join(" ")).join("L") + "Z";
const corte = (pts, fill, stroke = "none", w = 0.5, extra = "") => [1, -1].map((s) => `<path d="${qpath(pts.map(([x, r]) => [x, r * s]))}" fill="${fill}" stroke="${stroke}" stroke-width="${w}" stroke-linejoin="round"${extra}/>`).join("");
const faixa = (rIn, rOut, x0, x1, step = 2) => { const a = [], b = []; for (let x = x0; x <= x1 + 0.01; x += step) { a.push([x, rIn(x)]); b.push([x, rOut(x)]); } return [...a, ...b.reverse()]; };

// ---------- Cascas da metade de trás ----------
function cascaDentro(R, x0, x1, cor, dx = 4, dth = 7.5 * DEG) {
  const quads = [];
  for (let x = x0; x < x1 - 0.01; x += dx) {
    const x2 = Math.min(x1, x + dx);
    for (let th = 0; th < 2 * Math.PI - 0.001; th += dth) {
      const tm = th + dth / 2; if (!longe(tm)) continue;
      const n = [0, -Math.cos(tm), -Math.sin(tm)], f = 0.36 + lum(n) * 0.56;
      quads.push({ d: k.depthOf(W((x + x2) / 2, R((x + x2) / 2), tm), P), h: `<path d="${path([W(x, R(x), th), W(x2, R(x2), th), W(x2, R(x2), th + dth), W(x, R(x), th + dth)])}Z" fill="${hex(cor, f)}" stroke="${hex(cor, f)}" stroke-width=".5"/>` });
    }
  }
  quads.sort((a, b) => a.d - b.d);
  return quads.map((q) => q.h).join("");
}
function cascaFora(R, x0, x1, cor, dx = 3) {
  const quads = [], dth = 6 * DEG;
  for (let x = x0; x < x1 - 0.01; x += dx) {
    const x2 = Math.min(x1, x + dx);
    for (let th = 0; th < 2 * Math.PI - 0.001; th += dth) {
      const tm = th + dth / 2; if (!longe(tm)) continue;
      const slope = (R(x2) - R(x)) / (x2 - x), n = G.unit3([-slope, Math.cos(tm), Math.sin(tm)]), f = 0.4 + lum(n) * 0.62;
      quads.push({ d: k.depthOf(W((x + x2) / 2, R((x + x2) / 2), tm), P), h: `<path d="${path([W(x, R(x), th), W(x2, R(x2), th), W(x2, R(x2), th + dth), W(x, R(x), th + dth)])}Z" fill="${hex(cor, f)}" stroke="${hex(cor, f)}" stroke-width=".5"/>` });
    }
  }
  quads.sort((a, b) => a.d - b.d);
  return quads.map((q) => q.h).join("");
}
function anelTras(x, r, cor, w) {
  const pts = []; for (let f = -Math.PI / 2 + 0.02; f <= Math.PI / 2 - 0.02; f += 3 * DEG) pts.push(W(x, r, TRAS + f));
  return `<path d="${path(pts)}" fill="none" stroke="${hex(cor, 0.5)}" stroke-width="${w + 1}" stroke-linecap="round"/><path d="${path(pts)}" fill="none" stroke="${cor}" stroke-width="${w}" stroke-linecap="round"/>`;
}

// ---------- Estágios: pás em perfil no plano do corte ----------
const ROTOR = [], STATOR = [];
const est = (k2, xs, w, corR, corS) => xs.forEach((x, i) => { ROTOR.push({ k: k2, x, w, cor: corR }); STATOR.push({ k: k2, x: x + (xs[i + 1] ? (xs[i + 1] - x) / 2 : w * 1.4), w: w * 0.7, cor: corS }); });
est("lpc", [-78, -71, -64], 3.2, "#d3d9de", "#9aa3ab");
est("hpc", Array.from({ length: 10 }, (_, i) => -30 + i * 4.9), 2.4, "#dfe4e8", "#a7b0b8");
est("hpt", [45.5, 51.5], 3, "#d9a548", "#a3784a");
est("lpt", Array.from({ length: 6 }, (_, i) => 71 + i * 10.4), 4.2, "#c99a62", "#8f7458");
function pa(x, w, r0, r1, lean = 0.6) { return [[x - w / 2, r0], [x + w / 2, r0], [x + w * 0.42 + lean, r1], [x - w * 0.42 + lean, r1]]; }
function estagios() {
  const out = [];
  for (const s of STATOR) out.push(`<g data-k="${s.k}">${corte(pa(s.x, s.w, HUB(s.x) + 1, CAS(s.x) - 0.2, -0.4), s.cor, "#2a3036", 0.5)}</g>`);
  for (const r of ROTOR) {
    const h = HUB(r.x), c = CAS(r.x);
    const disco = [[r.x - r.w * 0.55, 7.2], [r.x + r.w * 0.55, 7.2], [r.x + r.w * 0.25, h - 2.6], [r.x + r.w * 0.6, h - 1.2], [r.x + r.w * 0.6, h], [r.x - r.w * 0.6, h], [r.x - r.w * 0.6, h - 1.2], [r.x - r.w * 0.25, h - 2.6]];
    out.push(`<g data-k="${r.k}">${corte(disco, "#7d8790", "#2a3036", 0.5)}${corte(pa(r.x, r.w, h, c - 0.5), r.cor, "#2a3036", 0.55)}</g>`);
  }
  return out.join("");
}

// ---------- Caminho do ar no corte ----------
function caminhos() {
  const gx = (x) => at(Q(x, 0))[0].toFixed(1);
  const out = [`<defs><linearGradient id="gq" gradientUnits="userSpaceOnUse" x1="${gx(20)}" y1="0" x2="${gx(150)}" y2="0"><stop offset="0" stop-color="#ffb347"/><stop offset=".25" stop-color="#ff5a2a"/><stop offset=".6" stop-color="#e2442a"/><stop offset="1" stop-color="#ff9b45" stop-opacity=".6"/></linearGradient>
    <linearGradient id="gb" gradientUnits="userSpaceOnUse" x1="${gx(-96)}" y1="0" x2="${gx(90)}" y2="0"><stop offset="0" stop-color="#5aa3e6" stop-opacity=".75"/><stop offset=".55" stop-color="#5aa3e6" stop-opacity=".45"/><stop offset="1" stop-color="#5aa3e6" stop-opacity="0"/></linearGradient>
    <linearGradient id="ge" gradientUnits="userSpaceOnUse" x1="${gx(150)}" y1="0" x2="${gx(190)}" y2="0"><stop offset="0" stop-color="#ff9b45" stop-opacity=".55"/><stop offset="1" stop-color="#ff9b45" stop-opacity="0"/></linearGradient></defs>`];
  out.push(`<g data-k="bypass">${corte(faixa((x) => COWL(x), (x) => (x < -50 ? FC(x) : NAC(x)) - 0.4, -92, 78), "url(#gb)")}</g>`);
  out.push(corte(faixa(HUB, CAS, -82, 22), "#4f8fcf", "none", 0, ` opacity=".6"`));
  out.push(corte(faixa(HUB, CAS, 22, 150), "url(#gq)", "none", 0, ` opacity=".85"`));
  out.push(corte(faixa((x) => PLUG(x) + 0.2, (x) => lerp(28, 22, sm(150, 190, x)), 150, 190), "url(#ge)"));
  return out.join("");
}
function paredes() {
  const out = [];
  out.push(corte(faixa(CAS, (x) => (x < 72 ? COWL(x) - 0.6 : CAS(x) + 2.4), -82, 150), "#3a4047", "#22272c", 0.6));
  out.push(corte(faixa(CAS, (x) => CAS(x) + 1.3, -82, 150), "#8e979f"));
  out.push(corte(faixa((x) => COWL(x) - 0.9, COWL, -82, 72), "#c9d0d6"));
  for (const [x, r, rr] of [[-24, 19.8, 1.6], [-14, 21.5, 1.2], [-4, 20.4, 1.7], [8, 19.8, 1.3], [60, 24.6, 1.5]]) for (const s of [1, -1]) { const c = at(Q(x, r * s)); out.push(`<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${(rr * 1.6).toFixed(1)}" fill="#c47a3a" stroke="#22272c" stroke-width=".5"/>`); }
  out.push(`<g data-k="fancase">${corte(faixa(FC, (x) => FC(x) + 4.5, -128, -50), "#4c7d3c", "#22272c", 0.6)}${corte(faixa(FC, (x) => FC(x) + 1.4, -128, -50), "#2f3439")}</g>`);
  out.push(`<g data-k="inlet">${corte([[-134, 61.5], [-128, 59.6], [-118, 59.8], [-118, 66.5], [-128, 67.5], [-134, 65]], "#d6dce1", "#22272c", 0.6)}</g>`);
  out.push([1, -1].map((s) => `<path d="${"M" + [[-50, 64], [20, 64], [78, 56], [78, 52]].map(([x, r]) => at(Q(x, r * s)).map((v) => v.toFixed(1)).join(" ")).join("L")}" fill="none" stroke="var(--fantasma)" stroke-width="1" stroke-dasharray="4 3"/>`).join(""));
  out.push(`<g data-k="splitter">${corte([[-84.5, 26.3], [-80, 25.6], [-74, 26], [-74, 29.6], [-80, 28.4]], "#e6eaee", "#22272c", 0.6)}</g>`);
  out.push(`<g data-k="ogv">${corte([[-62, COWL(-62)], [-57, COWL(-57)], [-55.5, FC(-55.5)], [-60.5, FC(-60.5)]], "#aeb7bf", "#22272c", 0.6)}</g>`);
  out.push(`<g data-k="vbv">${corte([[-56, CAS(-56)], [-52, CAS(-52)], [-51, COWL(-51) - 0.6], [-55, COWL(-55) - 0.6]], "#141719")}${corte([[-55.4, COWL(-55.4) - 0.8], [-50.6, COWL(-50.6) - 0.8], [-48, COWL(-48) + 2.2], [-49.2, COWL(-49.2) + 2.6]], "#e0a33c", "#22272c", 0.5)}</g>`);
  return out.join("");
}
function eixos() {
  return `<g data-k="lpshaft">${corte([[-96, -2.6], [150, -2.6], [150, 2.6], [-96, 2.6]], "#b9c1c8", "#2a3036", 0.5).split("/>")[0]}/></g>`
    + `<g data-k="hpshaft">${corte(faixa(() => 3.8, () => 6.4, -34, 56), "#6f7a85", "#2a3036", 0.5)}</g>`
    + `<g data-k="mancal">${[-88, -38, 56, 132].map((x) => corte([[x - 2.2, 2.7], [x + 2.2, 2.7], [x + 2.2, 7.4], [x - 2.2, 7.4]], "#b8894c", "#2a3036", 0.5) + corte([[x - 1.2, 4.2], [x + 1.2, 4.2], [x + 1.2, 6], [x - 1.2, 6]], "#3a2c1c")).join("")}</g>`;
}
function combustao() {
  const gx = (x) => at(Q(x, 0))[0].toFixed(1);
  const liner = [[22, 11.2], [26, 10.6], [40, 11.6], [42, 12.6], [42, 15.4], [40, 16.4], [26, 18.2], [22, 17.2]];
  return `<defs><linearGradient id="chama" gradientUnits="userSpaceOnUse" x1="${gx(23)}" y1="0" x2="${gx(40)}" y2="0"><stop offset="0" stop-color="#fff2b0"/><stop offset=".35" stop-color="#ffbf3c"/><stop offset="1" stop-color="#ff5a1f"/></linearGradient></defs>`
    + `<g data-k="comb">${corte(liner, "#7a4a2a", "#e08a3a", 1)}<g data-part="chama">${corte([[24, 12.4], [38, 12.6], [39, 14], [38, 15.4], [24, 16.6], [23, 14.5]], "url(#chama)")}</g></g>`
    + `<g data-k="fuel">${corte([[19.6, 26.6], [21.4, 26.6], [21.6, 15.2], [23.4, 14.6], [23.4, 13.6], [19.8, 14.6]], "#d9a548", "#2a3036", 0.5)}</g>`;
}
function escape() {
  return `<g data-k="nozzle">${corte(faixa(() => 0, PLUG, 128, 162, 1), "#8a6e52", "#2a3036", 0.6)}${corte(faixa(CAS, (x) => CAS(x) + 2.2, 128, 150), "#9a8064", "#2a3036", 0.6)}</g>`;
}
function reversor() {
  const out = [];
  for (const s of [1, -1]) for (let x = 6; x < 44; x += 4) out.push(`<path d="${qpath([[x, 58.6 * s], [x + 3, 58.4 * s], [x + 4, 63.6 * s], [x + 1, 63.8 * s]])}" fill="#4a5158" stroke="#22272c" stroke-width=".5"/>`);
  return `<g data-k="reverser">${out.join("")}</g>`;
}
function externos() {
  const out = [anelTras(-48, 28.6, "#e7c33a", 4)];
  for (const x of [50, 58, 82, 98, 114]) out.push(anelTras(x, (x < 72 ? COWL(x) : CAS(x) + 2.4) + 1.6, "#c58440", 1.8));
  for (const [f, cor, w] of [[-0.25, "#c58440", 2.2], [-0.05, "#b7c0c8", 1.8], [0.15, "#d36a3a", 2]]) {
    const pts = []; for (let x = -46; x <= 70; x += 4) pts.push(W(x, COWL(x) + 2.2, FAR(f)));
    out.push(`<path d="${path(pts)}" fill="none" stroke="${hex(cor, 0.55)}" stroke-width="${w + 0.9}" stroke-linecap="round"/><path d="${path(pts)}" fill="none" stroke="${cor}" stroke-width="${w}" stroke-linecap="round"/>`);
  }
  const cab = []; for (let x = -46; x <= 40; x += 4) cab.push(W(x, COWL(x) + 1.5, FAR(0.38)));
  out.push(`<path d="${path(cab)}" fill="none" stroke="#5c646c" stroke-width="3.2" stroke-linecap="round"/><path d="${path(cab)}" fill="none" stroke="#8a939b" stroke-width="1.4" stroke-dasharray="3 2"/>`);
  return out.join("");
}

// ---------- Fan, spinner, caixa de acessórios, extintor, suporte ----------
function pas(phase) {
  const list = [];
  for (let i = 0; i < BLADE_N; i++) {
    const a = phase + (i / BLADE_N) * 2 * Math.PI, pts = [], ret = [];
    for (let j = 0; j <= 12; j++) {
      const t = j / 12, r = HUB_R + (FAN_R - HUB_R) * t, sw = 0.42 * Math.pow(t, 1.25), chord = 0.2 - 0.09 * t, tw = 7 + 7 * t;
      pts.push(W(FAN_X - tw * 0.5, r, a + sw)); ret.push(W(FAN_X + tw * 0.5, r, a + sw + chord));
    }
    const mid = W(FAN_X, (HUB_R + FAN_R) / 2, a + 0.24);
    const n = G.unit3([-0.6, Math.cos(a + 0.24 + Math.PI / 2) * 0.8, Math.sin(a + 0.24 + Math.PI / 2) * 0.8]), f = 0.5 + lum(n) * 0.5;
    list.push({ d: k.depthOf(mid, P), h: `<path d="${path([...pts, ...ret.reverse()])}Z" fill="${hex("#2a2f35", f)}" stroke="#14171a" stroke-width=".5"/><path d="${path(pts)}" fill="none" stroke="#e9edf0" stroke-width="1.3"/>` });
  }
  list.sort((a, b) => a.d - b.d);
  return list.map((q) => q.h).join("");
}
const fanFrames = () => Array.from({ length: FRAMES }, (_, i) => `<g data-fan="${i}" style="opacity:${i ? 0 : 1}">${pas((i / FRAMES) * (2 * Math.PI / BLADE_N))}</g>`).join("");
function spinner() {
  const F = G.frameOf([FAN_X + 4, 0, ZC], [-1, 0, 0], [0, 1, 0], [0, 0, 1]);
  const prof = [[0, HUB_R + 1], [6, HUB_R - 1, 1], [14, HUB_R - 6, 1], [22, HUB_R - 12, 1], [28, 0]];
  const esp = []; for (let j = 0; j <= 36; j++) { const s = j / 36 * 26, r = (HUB_R + 1) * (1 - Math.pow(s / 28, 1.6)); esp.push(G.pointOf(F, s, r + 0.3, 1.2 + j * 0.15)); }
  const vis = esp.filter((p) => G.dot3(G.unit3(G.sub3(p, [p[0], 0, ZC])), V) > -0.05);
  return S(G.lathe(prof, F, P, { smooth: true }), { tone: "hi", className: "c-spinner" }) + `<path d="${path(vis)}" fill="none" stroke="#f4f6f8" stroke-width="2.2"/>`;
}
const LADO = Math.sign(V[1]) || 1;
function acessorios() {
  const out = [], z0 = ZC - 40, y0 = LADO * 4;
  out.push(S(k.slabOf({ x: -42, y: y0 - 9, w: 40, d: 18, r: 3 }, z0, 9, P, 4, 0.5), { tone: "mid", className: "c-agb" }));
  for (const [x, r, h] of [[-36, 4.2, 7], [-26, 5.4, 9], [-15, 3.6, 6], [-7, 4.6, 8]]) out.push(S(k.cylinder(x, y0 + 1, r, z0 - h, h, P, 28, 0.3), { tone: "mid", className: "c-aco" }));
  out.push(S(G.disc(0, 14, 1.5, G.frameAlong([-30, y0, z0 + 9], [0.06, 0, 1]), P), { tone: "mid", className: "c-aco" }));
  return `<g data-k="agb">${out.join("")}</g>`;
}
function extintor() {
  const c = [6, LADO * 6, ZC - 46];
  return `<g data-k="extintor">${S(G.sphereOf(c, 5.5, P, { steps: 28 }), { tone: "hi", className: "c-extintor" })}${S(G.disc(0, 6, 1.2, G.frameAlong([c[0], c[1], c[2] + 5], [0, 0, 1]), P), { tone: "mid", className: "c-aco" })}</g>`;
}
function suporte() {
  const out = [], PL = { x: -120, y: -40, w: 290, d: 80, r: 6 };
  out.push(`<path class="iso-halo" d="${k.haloOf(PL, -6, 6, P)}"/>`);
  out.push(S(k.slabOf(PL, -6, 6, P, 6, 1), { tone: "mid", className: "c-chao" }));
  for (const [x, alto] of [[-78, ZC - FC(-78) - 4], [122, ZC - CAS(122) - 5]]) {
    out.push(S(k.slabOf({ x: x - 10, y: -32, w: 20, d: 64, r: 2 }, 0, 6, P, 3, 0.4), { tone: "mid", className: "c-stand" }));
    for (const y of [-22, 22]) out.push(S(k.slabOf({ x: x - 3, y: y - 3, w: 6, d: 6, r: 1 }, 6, alto - 6, P, 3, 0.3), { tone: "mid", className: "c-stand" }));
    out.push(S(k.slabOf({ x: x - 5, y: -24, w: 10, d: 48, r: 1.5 }, alto - 1, 4, P, 3, 0.3), { tone: "mid", className: "c-stand" }));
  }
  return out.join("");
}

// ---------- Componentes, números e textos ----------
const PECAS = [
  ["inlet", "Entrada de ar", "A boca da nacele. A borda é aquecida para não juntar gelo, e por dentro há painéis que abafam o ruído.", Q(-131, 63)],
  ["spinner", "Cone do fan (spinner)", "O cone que gira no centro do fan. A espiral branca mostra à equipe de solo que o motor está girando.", Q(-112, -6)],
  ["fan", "Pás do fan", "18 pás de compósito de fibra de carbono com a borda de ataque de titânio. O fan, de cerca de 2,7 m, faz a maior parte do empuxo.", W(FAN_X, 42, THC)],
  ["fancase", "Carcaça do fan", "O anel em volta do fan, feito para segurar uma pá que se solte. No GEnx ela é de compósito.", Q(-90, 62.5)],
  ["splitter", "Divisor de fluxo", "O bico que separa o ar: a maior parte vai por fora do núcleo; uma parte entra nele.", Q(-80, 27.4)],
  ["ogv", "Palhetas guia (OGV)", "Palhetas fixas atrás do fan. Endireitam o ar, que sai do fan girando, e ajudam a segurar a carcaça.", Q(-58.5, -44)],
  ["bypass", "Duto do fan (bypass)", "Por aqui passa cerca de 8 vezes mais ar do que pelo núcleo. Esse ar frio dá a maior parte do empuxo.", Q(-20, 44)],
  ["lpc", "Compressor de baixa (booster)", "3 estágios que giram junto com o fan e fazem a primeira compressão do ar do núcleo.", Q(-71, 22)],
  ["vbv", "Válvulas de sangria (VBV)", "Portinholas que abrem em baixa rotação e soltam ar do booster no duto do fan, para o compressor não estolar.", Q(-50, -28)],
  ["hpc", "Compressor de alta (HPC)", "10 estágios. As primeiras fileiras de palhetas fixas giram para se ajustar à rotação. A pressão sai cerca de 23 vezes maior que a da entrada.", Q(-6, 13)],
  ["fuel", "Injetores de combustível", "Bicos que entram pela carcaça e pulverizam o combustível na cabeça da câmara de combustão.", Q(20.5, -24)],
  ["comb", "Câmara de combustão (TAPS)", "O anel onde o combustível queima. O sistema TAPS mistura ar e combustível antes da chama, para poluir menos.", Q(32, 14.5)],
  ["hpt", "Turbina de alta (HPT)", "2 estágios que recebem o gás mais quente, acima do ponto de fusão do metal; as pás são resfriadas por dentro com ar do compressor.", Q(48.5, 14)],
  ["lpt", "Turbina de baixa (LPT)", "Estágios cada vez maiores que tiram energia do gás para girar o fan e o booster.", Q(96, 20)],
  ["hpshaft", "Eixo de alta (N2)", "Eixo oco que liga a turbina de alta ao compressor de alta.", Q(10, -5)],
  ["lpshaft", "Eixo de baixa (N1)", "Passa por dentro do eixo de alta e liga a turbina de baixa ao fan.", Q(100, -1.5)],
  ["mancal", "Mancais", "Rolamentos que seguram os eixos; trabalham mergulhados em óleo.", Q(56, 5)],
  ["reverser", "Reversor de empuxo", "No pouso, a parte de trás da nacele recua e estas grades jogam o ar do fan para a frente, ajudando a frear.", Q(25, 61)],
  ["extintor", "Extintor de fogo", "Garrafa que descarrega o agente extintor dentro da nacele se houver fogo no motor.", [6, LADO * 6, ZC - 46]],
  ["agb", "Caixa de acessórios", "Engrenagens movidas pelo eixo de alta que acionam as bombas de combustível, óleo e hidráulica e os geradores.", [-24, LADO * 4, ZC - 36]],
  ["nozzle", "Bocal e cone de escape", "Por onde sai o gás quente do núcleo. O cone guia o fluxo na saída.", Q(150, 8)],
];
function pinos() {
  const list = PECAS.map(([id, , , p], i) => { const a = at(p); return { id, n: i + 1, a, top: a[1] < HEIGHT * 0.48 }; });
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
function fluxo() {
  const dots = [];
  for (let i = 0; i < 110; i++) dots.push(`<circle data-flow="b" data-s="${((i * 0.618) % 1).toFixed(3)}" data-f="${((i * 0.37) % 1).toFixed(3)}" data-sg="${i % 2 ? 1 : -1}" r="1.5" fill="#cfe7ff"/>`);
  for (let i = 0; i < 80; i++) dots.push(`<circle data-flow="c" data-s="${((i * 0.618) % 1).toFixed(3)}" data-f="${((i * 0.53) % 1).toFixed(3)}" data-sg="${i % 2 ? 1 : -1}" r="1.2" fill="#e2f1ff"/>`);
  return `<g data-part="fluxo">${dots.join("")}</g>`;
}

const MATERIAIS = { aco: "#9aa4ae", spinner: "#22272c", agb: "#7c8792", extintor: "#d23b2f", chao: "#5d646d", stand: "#2f6fa8" };
const CORES = Object.entries(MATERIAIS).map(([n, c]) => `.c-${n}{--anatomy-shade-0:${hex(c, 0.6)};--anatomy-shade-1:${hex(c, 0.7)};--anatomy-shade-2:${hex(c, 0.8)};--anatomy-shade-3:${hex(c, 0.9)};--anatomy-top:${hex(c, 1.06)};--anatomy-paper:${hex(c, 0.85)};--anatomy-face:${hex(c, 0.85)}}.c-${n} .iso-edge{stroke:${hex(c, 0.42)}}`).join("")
  + `.c-chao .iso-line{stroke:#454b52}.iso{--fantasma:#8a96a3;--pino:#dfe5ea}.iso[data-theme=light]{--fantasma:#7d8894;--pino:#3d454e}`
  + `[data-part=chama]{animation:chama .9s ease-in-out infinite alternate}@keyframes chama{from{opacity:.65}to{opacity:1}}`
  + `.pino{cursor:pointer}.pino-l{stroke:var(--pino);stroke-width:.8;fill:none}.pino-d{fill:var(--pino)}.pino-c{fill:var(--anatomy-card);stroke:var(--pino);stroke-width:1.4}.pino-t{fill:var(--pino);font:700 13px ui-sans-serif,system-ui,sans-serif}`
  + `.pino.gx-on .pino-c{fill:#f06aae;stroke:#f06aae}.pino.gx-on .pino-t{fill:#fff}.pino.gx-on .pino-l{stroke:#f06aae;stroke-width:1.4}.pino.gx-on .pino-d{fill:#f06aae}`
  + `.gx-sel [data-k]{transition:opacity .25s}.gx-sel [data-k]:not(.gx-on){opacity:.18}.gx-sel [data-k].gx-on{filter:drop-shadow(0 0 3px #f06aae)}`
  + `.gx-info{margin:10px 2px 8px;line-height:1.5;min-height:3em}.gx-info b{color:#f06aae}`
  + `.gx-lista{display:grid;grid-template-columns:1fr 1fr;gap:5px}.gx-lista button{display:flex;gap:7px;align-items:center;text-align:left;border:1px solid var(--anatomy-mid);background:transparent;color:inherit;border-radius:8px;padding:5px 6px;font:inherit;font-size:11.5px;line-height:1.25;cursor:pointer;-webkit-tap-highlight-color:transparent}`
  + `.gx-lista button b{flex:0 0 19px;height:19px;border-radius:50%;display:grid;place-items:center;font-size:11px;border:1px solid currentColor}.gx-lista button[aria-pressed=true]{border-color:#f06aae;color:#f06aae}`;

const svg = k.figureSvg({
  width: WIDTH, height: HEIGHT,
  label: "O motor GEnx-2B do Boeing 747-8 cortado ao meio, num suporte de transporte azul. No corte aparecem, da frente para trás: a entrada de ar, o fan de 18 pás com o cone de nariz, a carcaça do fan, o divisor de fluxo, o compressor de baixa de 3 estágios, o compressor de alta de 10 estágios, a câmara de combustão com a chama, a turbina de alta de 2 estágios, a turbina de baixa, os eixos, os mancais e o cone de escape. O ar frio aparece em azul e o gás quente em vermelho e laranja. Por fora, tubos, anéis de resfriamento, a vedação amarela contra fogo, a caixa de acessórios e o extintor.",
  body: [suporte(),
    `<g data-k="fancase">${cascaDentro(FC, -128, -50, "#3d444b")}</g>`,
    `<g data-k="bypass">${cascaFora(COWL, -82, 72, "#b3bbc3")}</g>`,
    `<g data-k="lpt">${cascaFora((x) => CAS(x) + 2.4, 72, 150, "#9a8064")}</g>`,
    externos(),
    cascaDentro((x) => CAS(x) - 0.3, -82, 150, "#4b5157", 4, 9 * DEG),
    caminhos(), paredes(), eixos(), estagios(), combustao(), escape(), reversor(),
    acessorios(), extintor(), fluxo(),
    `<g data-k="fan">${fanFrames()}</g>`, `<g data-k="spinner">${spinner()}</g>`, pinos()],
});

const TEXTOS = Object.fromEntries(PECAS.map(([id, nome, txt], i) => [id, [i + 1, nome, txt]]));
const live = `
const TEXTOS = ${JSON.stringify(TEXTOS)};
const P = ${JSON.stringify(P)}, ZC = ${ZC}, FRAMES = ${FRAMES}, T0 = ${T0};
const sm = ${sm.toString()}, lerp = ${lerp.toString()};
const HUB = ${HUB.toString()}, CAS = ${CAS.toString()}, COWL = ${COWL.toString()}, FC = ${FC.toString()}, NAC = ${NAC.toString()};
const Q = (x, r) => [x, r * Math.cos(T0), ZC + r * Math.sin(T0)];
const stage = document.querySelector(".iso-stage"), svg = stage.querySelector("svg");
const fans = [...svg.querySelectorAll("[data-fan]")], chama = svg.querySelector('[data-part="chama"]');
const parts = [...svg.querySelectorAll("[data-flow]")].map((el) => ({ el, tipo: el.dataset.flow, s: +el.dataset.s, f: +el.dataset.f, sg: +el.dataset.sg }));
const readout = document.querySelector("[data-readout]"), still = matchMedia("(prefers-reduced-motion: reduce)");
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
let n1 = 22, target = 22, touring = true, clock = 0, last = 0, frame = 0, visible = false, idle = 0, ang = 0;
const tour = (c) => { const u = (c % 14) / 14; return u < 0.15 ? 22 : u < 0.45 ? 22 + (u - 0.15) / 0.3 * 78 : u < 0.75 ? 100 : 100 - (u - 0.75) / 0.25 * 78; };
const corDe = (x) => x < 20 ? "#e2f1ff" : x < 44 ? "#fff1a8" : x < 100 ? "#ffd0a0" : "#ffb27a";
function lugar(p) {
  if (p.tipo === "b") { const x = -94 + p.s * 175, ri = COWL(Math.max(x, -82)), ro = (x < -50 ? FC(x) : NAC(x)) - 1.5; return [x, (ri + 1.5 + (ro - ri - 3) * p.f) * p.sg, x > 60 ? Math.max(0, 1 - (x - 60) / 21) : 1]; }
  const x = -96 + p.s * 260; if (x < -82) return [x, (17 + 8 * p.f) * p.sg, 1];
  if (x > 150) return [x, (6 + 16 * p.f) * p.sg, Math.max(0, 1 - (x - 150) / 14)];
  const h = HUB(x), c = CAS(x); return [x, (h + 1 + (c - h - 2) * p.f) * p.sg, 1];
}
function draw(dt) {
  const v = n1 / 100;
  ang += dt * (2 + v * 30);
  const fi = Math.floor((((ang % 1) + 1) % 1) * FRAMES);
  fans.forEach((g, i) => { g.style.opacity = i === fi ? "1" : "0"; });
  for (const p of parts) {
    p.s = (p.s + dt * (0.05 + v * 0.42) * (p.tipo === "b" ? 1 : 0.65)) % 1;
    const [x, r, fade] = lugar(p), s = iso(Q(x, r), P);
    p.el.setAttribute("cx", s[0].toFixed(1)); p.el.setAttribute("cy", s[1].toFixed(1));
    p.el.style.opacity = ((0.3 + 0.7 * v) * fade).toFixed(2);
    if (p.tipo === "c") p.el.setAttribute("fill", corDe(x));
  }
  chama.style.opacity = String(0.35 + 0.65 * v);
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
  keys: [{ mark: "blue", label: "Ar frio: o que passa por fora do núcleo e o que entra nele" }, { mark: "red", label: "Gás quente, depois da câmara de combustão" }, { mark: "dashed", label: "Nacele, desenhada só pelo contorno" }],
  caption: "Simplificado, mas na proporção do motor real. O fan, de 18 pás, empurra quase todo o ar por fora do núcleo. O ar que entra no núcleo passa pelo booster (3 estágios) e pelo compressor de alta (10), recebe combustível, queima e move a turbina de alta (2 estágios), que gira o compressor, e a turbina de baixa, que gira o fan. O empuxo máximo do GEnx-2B é de cerca de 66.500 lbf.",
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="Motor GEnx-2B: setas aceleram e reduzem" aria-valuemin="22" aria-valuemax="100" aria-valuenow="22">${svg}</div>
    <p class="gx-info" id="gxInfo">Toque num número ou num nome para ver a peça.</p>
    <div class="gx-lista">${PECAS.map(([id, nome], i) => `<button type="button" data-peca="${id}"><b>${i + 1}</b>${nome}</button>`).join("")}</div>`,
});
const file = theme === "light" ? "fig-genx-light.html" : "fig-genx.html";
const css = `<style>${CORES}body{margin:0}.iso-page{width:100%!important;margin:0!important;padding:14px 18px 18px;box-sizing:border-box}.iso-plate{padding:44px 16px 58px!important;box-shadow:none!important;border-radius:12px!important}.iso-stage{touch-action:pan-y}</style>`;
writeFileSync(join(HERE, "../../aviao/assets", file), k.pageHtml({ title: "GEnx-2B", theme, body: body + css, script: kitScript() + live }));
console.log("wrote", file);
