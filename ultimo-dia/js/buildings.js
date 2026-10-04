'use strict';
/* Último Dia — telhados em 3D (quatro e duas águas, com beiral, telhas e chaminé),
   lajes com mureta e equipamentos, e a torre da igreja. Usado quando o prédio inteiro
   está à vista; com recorte perto do jogador vale o telhado plano por ladrilho. */

const ROOF_OVH = 0.28, ROOF_PITCH = 0.5;
let rg = null; // contexto de desenho dos telhados (a tela ou a imagem em cache)
const GABLE = new Set(['celeiro', 'fazenda', 'igreja']);
const P3 = (x, y, z) => [PX(x, y), PY(x, y, z)];
// parte linear da projeção: direção 3D -> direção na tela
const J3 = (d) => [(d[0] - d[1]) * HW, (d[0] + d[1]) * HH - d[2] * HZ];
function v3(a, b) { return [b[0] - a[0], b[1] - a[1], b[2] - a[2]]; }
function unit3(a) { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
function path3(pts) { rg.beginPath(); pts.forEach((p, i) => { const s = P3(...p); if (i) rg.lineTo(s[0], s[1]); else rg.moveTo(s[0], s[1]); }); rg.closePath(); }

// telhas: textura já na cor da face (um preenchimento só por face)
const shingleCache = new Map();
function shingles(col) {
  let pat = shingleCache.get(col);
  if (pat) return pat;
  const c = document.createElement('canvas'); c.width = c.height = 32; const g = c.getContext('2d');
  const R = mulberry(77);
  g.fillStyle = col; g.fillRect(0, 0, 32, 32);
  for (let row = 0; row < 2; row++) {
    const y = row * 16, off = row * 8;
    for (let k = -1; k < 3; k++) { const x = off + k * 16; g.fillStyle = `rgba(${R() < 0.5 ? '0,0,0' : '255,255,255'},${(R() * 0.07).toFixed(3)})`; g.fillRect(x, y, 16, 16); }
    g.fillStyle = 'rgba(0,0,0,.30)'; g.fillRect(0, y, 32, 2.2); // sombra da fiada de cima
    g.fillStyle = 'rgba(255,255,255,.10)'; g.fillRect(0, y + 2.2, 32, 1.2);
    g.fillStyle = 'rgba(0,0,0,.22)'; for (let k = -1; k < 3; k++) g.fillRect(off + k * 16, y, 1.3, 16);
  }
  pat = rg.createPattern(c, 'repeat');
  if (shingleCache.size > 80) shingleCache.clear();
  shingleCache.set(col, pat);
  return pat;
}
// preenche a face com um padrão alinhado a ela: u ao longo do beiral, v subindo o caimento
function patternFace(pts, pat, o, eu, ev, scale) {
  const s0 = P3(...o), ju = J3(eu), jv = J3(ev), k = 1 / scale;
  pat.setTransform(new DOMMatrix([ju[0] * k, ju[1] * k, -jv[0] * k, -jv[1] * k, s0[0], s0[1]]));
  path3(pts); rg.fillStyle = pat; rg.fill();
}
function roofLight(base, n) {
  const d = (n[0] * LIGHT_DIR[0] + n[1] * LIGHT_DIR[1] + n[2] * LIGHT_DIR[2]) / (Math.hypot(...n) || 1);
  return shade(base, Math.round((d - 0.7) * 1.2 * 40) / 40);
}

// geometria do telhado em coordenadas do mundo (independe do zoom)
function roofGeom(B) {
  if (B._rg) return B._rg;
  const X0 = B.x - ROOF_OVH, X1 = B.x + B.w + ROOF_OVH, Y0 = B.y - ROOF_OVH, Y1 = B.y + B.h + ROOF_OVH, ez = WALL_H - 0.08;
  const hz = X1 - X0 >= Y1 - Y0, half = Math.min(X1 - X0, Y1 - Y0) / 2, rise = Math.min(1.45, half * ROOF_PITCH), rz = ez + rise;
  const gable = GABLE.has(B.t);
  // tudo escrito com "a" no eixo comprido e "b" no curto; m() devolve x, y
  const m = hz ? (a, b, z) => [a, b, z] : (a, b, z) => [b, a, z];
  const [A0, A1, B0, B1] = hz ? [X0, X1, Y0, Y1] : [Y0, Y1, X0, X1], bc = (B0 + B1) / 2;
  const ra0 = gable ? A0 : A0 + half, ra1 = gable ? A1 : A1 - half;
  const faces = [
    { pts: [m(A0, B0, ez), m(A1, B0, ez), m(ra1, bc, rz), m(ra0, bc, rz)] },
    { pts: [m(A0, B1, ez), m(A1, B1, ez), m(ra1, bc, rz), m(ra0, bc, rz)] },
  ];
  if (!gable) faces.push({ pts: [m(A0, B1, ez), m(A0, B0, ez), m(ra0, bc, rz)] }, { pts: [m(A1, B0, ez), m(A1, B1, ez), m(ra1, bc, rz)] });
  for (const f of faces) {
    const [e0, e1] = f.pts, apex = f.pts[f.pts.length - 1];
    f.eu = unit3(v3(e0, e1));
    const up = v3(e0, apex), d = up[0] * f.eu[0] + up[1] * f.eu[1] + up[2] * f.eu[2];
    f.ev = unit3([up[0] - f.eu[0] * d, up[1] - f.eu[1] * d, up[2] - f.eu[2] * d]);
    let n = [f.eu[1] * f.ev[2] - f.eu[2] * f.ev[1], f.eu[2] * f.ev[0] - f.eu[0] * f.ev[2], f.eu[0] * f.ev[1] - f.eu[1] * f.ev[0]];
    if (n[2] < 0) n = n.map((c) => -c);
    f.n = n; f.front = n[0] + n[1] > 0; // voltada para a câmera
  }
  // empenas (paredes triangulares) nas pontas do telhado de duas águas
  const wa0 = hz ? B.x : B.y, wa1 = hz ? B.x + B.w : B.y + B.h, wb0 = hz ? B.y : B.x, wb1 = hz ? B.y + B.h : B.x + B.w;
  const gables = gable ? [[m(wa1, wb0, WALL_H), m(wa1, wb1, WALL_H), m(wa1, bc, rz - 0.04)]] : [];
  // altura do telhado em um ponto (para chaminé e torre)
  const hAt = (x, y) => {
    const [a, b] = hz ? [x, y] : [y, x];
    const db = Math.min(b - B0, B1 - b), da = gable ? 1e9 : Math.min(a - A0, A1 - a);
    return ez + Math.min(rise, Math.max(0, Math.min(db, da)) * (rise / half));
  };
  const R = (k) => hk(B.x * 7 + k, B.y * 3 + B.w, 5);
  let chimney = null;
  if ((B.t === 'casa' || B.t === 'fazenda') && R(1) > 0.3) {
    const cx = hz ? B.x + B.w * (0.3 + R(2) * 0.4) : B.x + B.w * 0.62, cy = hz ? B.y + B.h * 0.62 : B.y + B.h * (0.3 + R(2) * 0.4);
    chimney = [cx, cy];
  }
  B._rg = { faces, gables, hAt, hz, rz, ez, chimney, X0, X1, Y0, Y1, R };
  return B._rg;
}

// caixa sobre o telhado: cada canto apoiado na altura do telhado
function roofBox(hAt, x0, y0, x1, y1, ztop, col, cap, zfix) {
  const zb = zfix != null ? () => zfix : (x, y) => hAt(x, y) - 0.05;
  const L = [[x0, y1, zb(x0, y1)], [x1, y1, zb(x1, y1)], [x1, y1, ztop], [x0, y1, ztop]];
  const Rr = [[x1, y0, zb(x1, y0)], [x1, y1, zb(x1, y1)], [x1, y1, ztop], [x1, y0, ztop]];
  path3(L); rg.fillStyle = shade(col, -0.1); rg.fill();
  path3(Rr); rg.fillStyle = shade(col, -0.3); rg.fill();
  path3([[x0, y0, ztop], [x1, y0, ztop], [x1, y1, ztop], [x0, y1, ztop]]); rg.fillStyle = cap || shade(col, 0.08); rg.fill();
  rg.strokeStyle = 'rgba(0,0,0,.35)'; rg.lineWidth = Math.max(0.6, 0.8 * K);
  for (const q of [L, Rr]) { path3(q); rg.stroke(); }
}

function drawPitchedRoof(B) {
  const G3 = roofGeom(B), base = B.t === 'celeiro' ? '#a8322a' : B.t === 'abandonada' ? '#5a534a' : B.roof, wc = wallCol(B);
  const trim = B.t === 'celeiro' ? '#ece4d4' : B.t === 'abandonada' ? '#6a6258' : '#e4dfd2';
  rg.lineJoin = 'round';
  // sombra do beiral nas paredes da frente
  rg.fillStyle = 'rgba(0,0,0,.2)';
  path3([[B.x, B.y + B.h, WALL_H - 0.42], [B.x + B.w, B.y + B.h, WALL_H - 0.42], [B.x + B.w, B.y + B.h, WALL_H], [B.x, B.y + B.h, WALL_H]]); rg.fill();
  path3([[B.x + B.w, B.y, WALL_H - 0.42], [B.x + B.w, B.y + B.h, WALL_H - 0.42], [B.x + B.w, B.y + B.h, WALL_H], [B.x + B.w, B.y, WALL_H]]); rg.fill();
  // torre da igreja (atrás do telhado)
  if (B.t === 'igreja') drawChurchTower(B, G3);
  // empenas
  for (const t of G3.gables) {
    path3(t); rg.fillStyle = shade(wc, -0.3); rg.fill();
    if (B.t === 'celeiro') { rg.strokeStyle = trim; rg.lineWidth = 2 * K; path3(t); rg.stroke(); }
    else { const c = [(t[0][0] + t[1][0] + t[2][0]) / 3, (t[0][1] + t[1][1] + t[2][1]) / 3, (t[0][2] * 2 + t[2][2]) / 3]; const s = P3(...c); rg.fillStyle = '#2a2a2c'; rg.beginPath(); rg.arc(s[0], s[1], 4 * K, 0, 7); rg.fill(); }
  }
  const order = G3.faces.slice().sort((a, b) => (a.front ? 1 : 0) - (b.front ? 1 : 0));
  rg.lineWidth = Math.max(0.8, 1.1 * K);
  for (const f of order) {
    const col = roofLight(base, f.n);
    if (B.t === 'celeiro') {
      path3(f.pts); rg.fillStyle = col; rg.fill(); // zinco ondulado: listras no sentido do caimento
      rg.save(); path3(f.pts); rg.clip(); rg.strokeStyle = 'rgba(0,0,0,.16)'; rg.lineWidth = 1.4 * K; rg.beginPath();
      const e0 = f.pts[0], L = Math.hypot(...v3(e0, f.pts[1]));
      for (let u = 0.1; u < L; u += 0.2) { const p = [e0[0] + f.eu[0] * u, e0[1] + f.eu[1] * u, e0[2]], a = P3(...p), b = P3(p[0] + f.ev[0] * 4, p[1] + f.ev[1] * 4, p[2] + f.ev[2] * 4); rg.moveTo(a[0], a[1]); rg.lineTo(b[0], b[1]); }
      rg.stroke(); rg.restore();
    } else patternFace(f.pts, shingles(col), f.pts[0], f.eu, f.ev, 100);
    path3(f.pts); rg.strokeStyle = shade(base, -0.5); rg.stroke();
  }
  // cumeeira e espigões
  rg.strokeStyle = shade(base, -0.42); rg.lineWidth = Math.max(1.5, 2.6 * K); rg.lineCap = 'round'; rg.beginPath();
  const f0 = G3.faces[0], r0 = P3(...f0.pts[3]), r1 = P3(...f0.pts[2]);
  rg.moveTo(r0[0], r0[1]); rg.lineTo(r1[0], r1[1]);
  if (G3.faces.length > 2) for (const f of G3.faces.slice(2)) for (const e of [f.pts[0], f.pts[1]]) { const a = P3(...e), b = P3(...f.pts[2]); rg.moveTo(a[0], a[1]); rg.lineTo(b[0], b[1]); }
  rg.stroke();
  rg.strokeStyle = B.t === 'celeiro' ? trim : shade(base, 0.12); rg.lineWidth = Math.max(0.6, 0.9 * K); rg.beginPath(); rg.moveTo(r0[0], r0[1] - 1.2 * K); rg.lineTo(r1[0], r1[1] - 1.2 * K); rg.stroke();
  rg.lineCap = 'butt';
  // testeira (borda do beiral) nos lados que a câmera vê
  for (const f of G3.faces) {
    if (!f.front) continue;
    const [e0, e1] = f.pts;
    path3([e0, e1, [e1[0], e1[1], e1[2] - 0.1], [e0[0], e0[1], e0[2] - 0.1]]);
    rg.fillStyle = roofLight(trim, [f.n[0], f.n[1], 0.2]); rg.fill(); rg.strokeStyle = 'rgba(0,0,0,.35)'; rg.lineWidth = Math.max(0.6, 0.8 * K); rg.stroke();
  }
  // casa abandonada: telhas faltando e musgo
  if (B.t === 'abandonada') {
    for (let k = 0; k < 4; k++) {
      const x = B.x + B.w * (0.2 + G3.R(10 + k) * 0.6), y = B.y + B.h * (0.2 + G3.R(20 + k) * 0.6), z = G3.hAt(x, y);
      path3([[x, y, z], [x + 0.45, y + 0.1, G3.hAt(x + 0.45, y + 0.1)], [x + 0.35, y + 0.45, G3.hAt(x + 0.35, y + 0.45)], [x - 0.05, y + 0.35, G3.hAt(x - 0.05, y + 0.35)]]);
      rg.fillStyle = k % 2 ? '#1c1916' : 'rgba(70,96,46,.6)'; rg.fill();
    }
  }
  // chaminé
  if (G3.chimney) {
    const [cx, cy] = G3.chimney, s = 0.22, top = G3.hAt(cx, cy) + 0.7;
    roofBox(G3.hAt, cx - s, cy - s, cx + s, cy + s, top, '#8a4b3a');
    roofBox(G3.hAt, cx - s - 0.04, cy - s - 0.04, cx + s + 0.04, cy + s + 0.04, top + 0.08, '#6f6a64', null, top - 0.02); // capa
    path3([[cx - s + 0.08, cy - s + 0.08, top + 0.081], [cx + s - 0.08, cy - s + 0.08, top + 0.081], [cx + s - 0.08, cy + s - 0.08, top + 0.081], [cx - s + 0.08, cy + s - 0.08, top + 0.081]]);
    rg.fillStyle = '#1e1a18'; rg.fill();
  }
}

function drawChurchTower(B, G3) {
  const s = Math.min(B.w, B.h) * 0.42, hz = G3.hz;
  const x0 = hz ? B.x + 0.3 : B.x + (B.w - s) / 2, y0 = hz ? B.y + (B.h - s) / 2 : B.y + 0.3, x1 = x0 + s, y1 = y0 + s;
  const top = G3.rz + 1.4, col = '#ece6d8';
  path3([[x0, y1, WALL_H], [x1, y1, WALL_H], [x1, y1, top], [x0, y1, top]]); rg.fillStyle = shade(col, -0.08); rg.fill();
  path3([[x1, y0, WALL_H], [x1, y1, WALL_H], [x1, y1, top], [x1, y0, top]]); rg.fillStyle = shade(col, -0.28); rg.fill();
  // janelas do sino
  path3([[lerp(x0, x1, 0.3), y1, top - 0.75], [lerp(x0, x1, 0.7), y1, top - 0.75], [lerp(x0, x1, 0.7), y1, top - 0.2], [lerp(x0, x1, 0.3), y1, top - 0.2]]); rg.fillStyle = '#26221e'; rg.fill();
  path3([[x1, lerp(y0, y1, 0.3), top - 0.75], [x1, lerp(y0, y1, 0.7), top - 0.75], [x1, lerp(y0, y1, 0.7), top - 0.2], [x1, lerp(y0, y1, 0.3), top - 0.2]]); rg.fillStyle = '#1a1714'; rg.fill();
  rg.fillStyle = shade(col, -0.18); path3([[x0, y0, top], [x1, y0, top], [x1, y1, top], [x0, y1, top]]); rg.fill();
  // telhado em pirâmide
  const ap = [(x0 + x1) / 2, (y0 + y1) / 2, top + s * 1.1], base = '#5a3e5a';
  for (const [a, b, sh] of [[[x0 - 0.06, y0 - 0.06, top], [x1 + 0.06, y0 - 0.06, top], -0.25], [[x0 - 0.06, y0 - 0.06, top], [x0 - 0.06, y1 + 0.06, top], -0.05], [[x0 - 0.06, y1 + 0.06, top], [x1 + 0.06, y1 + 0.06, top], 0.08], [[x1 + 0.06, y0 - 0.06, top], [x1 + 0.06, y1 + 0.06, top], -0.32]]) {
    path3([a, b, ap]); rg.fillStyle = shade(base, sh); rg.fill(); rg.strokeStyle = 'rgba(0,0,0,.3)'; rg.lineWidth = Math.max(0.6, 0.8 * K); rg.stroke();
  }
  const c = P3(...ap); rg.strokeStyle = '#e8c860'; rg.lineWidth = Math.max(1.5, 2.2 * K); rg.lineCap = 'round';
  rg.beginPath(); rg.moveTo(c[0], c[1]); rg.lineTo(c[0], c[1] - 22 * K); rg.moveTo(c[0] - 7 * K, c[1] - 15 * K); rg.lineTo(c[0] + 7 * K, c[1] - 15 * K); rg.stroke(); rg.lineCap = 'butt';
}

// telhado pronto numa imagem por prédio (refeita quando o zoom muda): colar é bem mais barato que redesenhar
const roofSprites = new Map();
let roofPx = 0, roofHW = 0, roofDPR = 0, roofHWAt = 0;
G.resetRoofSprites = () => { roofSprites.clear(); roofPx = 0; };
function roofBounds(B) {
  const G3 = roofGeom(B), pts = [];
  for (const f of G3.faces) pts.push(...f.pts);
  pts.push([B.x, B.y + B.h, WALL_H - 0.5], [B.x + B.w, B.y, WALL_H - 0.5], [B.x + B.w, B.y + B.h, WALL_H - 0.5]);
  if (G3.chimney) pts.push([G3.chimney[0], G3.chimney[1], G3.rz + 1]);
  if (B.t === 'igreja') { const c = [B.x + B.w / 2, B.y + B.h / 2]; pts.push([c[0], c[1], G3.rz + 1.4 + Math.min(B.w, B.h) * 0.5 + 1.2]); pts.push([B.x, B.y, G3.rz + 4]); }
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const p of pts) { const s = P3(...p); x0 = Math.min(x0, s[0]); y0 = Math.min(y0, s[1]); x1 = Math.max(x1, s[0]); y1 = Math.max(y1, s[1]); }
  const m = 6 * K + 2;
  return [x0 - m, y0 - m, x1 + m, y1 + m];
}
function drawRoofCached(B) {
  const now = performance.now();
  if (HW !== roofHW || DPR !== roofDPR) { roofHW = HW; roofDPR = DPR; roofHWAt = now; G.resetRoofSprites(); }
  if (now - roofHWAt < 300) return drawPitchedRoof(B); // durante o zoom desenha direto
  let sp = roofSprites.get(B);
  if (sp) { roofSprites.delete(B); roofSprites.set(B, sp); } // fim da fila = usado agora
  else {
    const ox = OX, oy = OY; OX = 0; OY = 0;
    try {
      const [x0, y0, x1, y1] = roofBounds(B), w = Math.ceil((x1 - x0) * DPR), h = Math.ceil((y1 - y0) * DPR);
      while (roofSprites.size && roofPx + w * h > 9e6) { const [k, v] = roofSprites.entries().next().value; roofSprites.delete(k); roofPx -= v.px; }
      const cv2 = document.createElement('canvas'); cv2.width = w; cv2.height = h;
      rg = cv2.getContext('2d'); rg.setTransform(DPR, 0, 0, DPR, -x0 * DPR, -y0 * DPR);
      drawPitchedRoof(B);
      sp = { cv: cv2, x0: Math.round(x0 * DPR), y0: Math.round(y0 * DPR), px: w * h };
      roofSprites.set(B, sp); roofPx += sp.px;
    } finally { rg = ctx; OX = ox; OY = oy; }
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(sp.cv, Math.round(OX * DPR) + sp.x0, Math.round(OY * DPR) + sp.y0);
  resetXform();
}

/* ---------- lajes: mureta e equipamentos em 3D ---------- */
function roofProps(B) {
  if (B._rp) return B._rp;
  const R = (k) => hk(B.x * 7 + k, B.y * 3 + B.w, 9), out = [];
  const n = B.t === 'hospital' ? 2 : Math.max(1, Math.floor(B.w * B.h / 9));
  for (let k = 0; k < n; k++) {
    const x = B.t === 'hospital' ? B.x + B.w * (0.42 + k * 0.13) : B.x + 0.6 + R(k + 3) * (B.w - 1.8);
    const y = B.t === 'hospital' ? B.y + B.h * 0.12 + 0.3 : B.y + B.h * 0.58 + R(k + 9) * (B.h * 0.38 - 1);
    out.push({ k: 'ac', x, y });
  }
  for (let k = 0; k < 2; k++) out.push({ k: 'vent', x: B.x + 0.5 + R(k + 30) * (B.w - 1), y: B.y + 0.5 + R(k + 40) * (B.h * 0.4) });
  if (B.t === 'delegacia') out.push({ k: 'antena', x: B.x + B.w - 0.5, y: B.y + 0.5 });
  if (B.t === 'fabrica') out.push({ k: 'chamine', x: B.x + B.w * 0.8, y: B.y + B.h * 0.3 }, { k: 'chamine', x: B.x + B.w * 0.8, y: B.y + B.h * 0.65 });
  return (B._rp = out);
}
function drawFlatRoofExtras(B) {
  const z = WALL_H, t = 0.14, hP = 0.2;
  const wc = shade(wallCol(B), 0.04), x0 = B.x, y0 = B.y, x1 = B.x + B.w, y1 = B.y + B.h;
  ctx.lineWidth = Math.max(0.6, 0.8 * K);
  // sombra interna da mureta
  ctx.fillStyle = 'rgba(0,0,0,.16)'; path3([[x0 + t, y0 + t, z], [x1 - t, y0 + t, z], [x1 - t, y0 + t + 0.25, z], [x0 + t, y0 + t + 0.25, z]]); ctx.fill();
  path3([[x0 + t, y0 + t, z], [x0 + t + 0.25, y0 + t, z], [x0 + t + 0.25, y1 - t, z], [x0 + t, y1 - t, z]]); ctx.fill();
  // equipamentos
  for (const p of roofProps(B)) {
    if (p.k === 'ac') {
      isoBox(p.x, p.y, p.x + 0.7, p.y + 0.5, z, z + 0.32, '#c9cccd', '#b4b8ba', '#9a9ea1');
      const c = P3(p.x + 0.22, p.y + 0.25, z + 0.321); ctx.fillStyle = '#7d8285'; ctx.beginPath(); ctx.ellipse(c[0], c[1], 9 * K, 4.5 * K, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#4d5255'; ctx.beginPath(); ctx.ellipse(c[0], c[1], 3 * K, 1.5 * K, 0, 0, 7); ctx.fill();
      faceQuad('L', p.x, p.y, p.x + 0.7, p.y + 0.5, 0.55, 0.92, z + 0.06, z + 0.26, 'rgba(0,0,0,.18)');
    } else if (p.k === 'vent') {
      isoBox(p.x, p.y, p.x + 0.22, p.y + 0.22, z, z + 0.22, '#6f7476', '#5d6265', '#4d5255');
      isoBox(p.x - 0.04, p.y - 0.04, p.x + 0.26, p.y + 0.26, z + 0.22, z + 0.27, '#7f8486', '#6a6f72', '#5a5f62');
    } else if (p.k === 'antena') {
      const a = P3(p.x, p.y, z), b = P3(p.x, p.y, z + 1.3); ctx.strokeStyle = '#666'; ctx.lineWidth = Math.max(1, 1.5 * K); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      ctx.fillStyle = '#e03a30'; ctx.beginPath(); ctx.arc(b[0], b[1], 2.5 * K, 0, 7); ctx.fill();
    } else if (p.k === 'chamine') {
      const r = 0.38, hgt = 2.4, c0 = P3(p.x, p.y, z), c1 = P3(p.x, p.y, z + hgt), rx = r * HW * 1.41, ry = r * HH * 1.41;
      const gr = ctx.createLinearGradient(c0[0] - rx, 0, c0[0] + rx, 0); gr.addColorStop(0, '#9a6450'); gr.addColorStop(0.45, '#7a5040'); gr.addColorStop(1, '#4e3228');
      ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(c0[0], c0[1], rx, ry, 0, 0, Math.PI); ctx.lineTo(c1[0] - rx, c1[1]); ctx.ellipse(c1[0], c1[1], rx, ry, 0, Math.PI, 0, true); ctx.closePath(); ctx.fill();
      for (let k = 1; k < 4; k++) { const cc = P3(p.x, p.y, z + hgt * k / 4); ctx.strokeStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(cc[0], cc[1], rx, ry, 0, 0, Math.PI); ctx.stroke(); }
      ctx.fillStyle = '#5a3a30'; ctx.beginPath(); ctx.ellipse(c1[0], c1[1], rx, ry, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#151210'; ctx.beginPath(); ctx.ellipse(c1[0], c1[1], rx * 0.7, ry * 0.7, 0, 0, 7); ctx.fill();
    }
  }
  // mureta: fundo, laterais e frente (nessa ordem para se sobreporem certo)
  const rim = (a, b, c, d) => isoBox(a, b, c, d, z, z + hP, shade(wc, 0.06), shade(wc, -0.14), shade(wc, -0.32));
  rim(x0, y0, x1, y0 + t); rim(x0, y0, x0 + t, y1); rim(x1 - t, y0, x1, y1); rim(x0, y1 - t, x1, y1);
  ctx.strokeStyle = 'rgba(0,0,0,.3)'; path3([[x0, y1, z + hP], [x1, y1, z + hP], [x1, y0, z + hP]]); ctx.stroke();
}
