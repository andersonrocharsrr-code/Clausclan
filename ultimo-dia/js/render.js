/* Último Dia — desenho isométrico (2.5D): chão em blocos cacheados, cenário e pessoas ordenados por
   profundidade, paredes que se recortam perto do jogador, névoa pela linha de visão, luz e clima. */
'use strict';

const CH = 8; // tiles por bloco de chão cacheado
const chunks = new Map();
const cv = document.getElementById('game');
const ctx = cv.getContext('2d');
const fogCv = document.createElement('canvas'), fctx = fogCv.getContext('2d');
const lightCv = document.createElement('canvas'), lctx = lightCv.getContext('2d');
let VW = 0, VH = 0, DPR = 1, RES = 1, K = 1;
let HW = 32, HH = 16, HZ = 38, OX = 0, OY = 0; // meia-largura e meia-altura do losango, px por unidade de altura
const WALL_H = 1.7, CUT_H = 0.3;
G.cam = { x: 0, y: 0 }; G.zoom = 1;

function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  VW = window.innerWidth; VH = window.innerHeight;
  cv.width = Math.round(VW * DPR); cv.height = Math.round(VH * DPR);
  cv.style.width = VW + 'px'; cv.style.height = VH + 'px';
  lightCv.width = Math.ceil(VW / 2); lightCv.height = Math.ceil(VH / 2);
  fogCv.width = Math.ceil(VW / 4); fogCv.height = Math.ceil(VH / 4); // baixa resolução = bordas macias
}
window.addEventListener('resize', resize);
resize();

/* ---------- projeção ---------- */
const PX = (x, y) => (x - y) * HW + OX;
const PY = (x, y, z = 0) => (x + y) * HH + OY - z * HZ;
function screenToWorld(sx, sy, z = 0) { const a = (sx - OX) / HW, b = (sy + z * HZ - OY) / HH; return { x: (a + b) / 2, y: (b - a) / 2 }; }
// direção na tela (joystick, setas) -> direção no mundo, mantendo a intensidade
function screenDirToWorld(dx, dy) {
  const m = Math.hypot(dx, dy); if (m < 1e-6) return { x: 0, y: 0 };
  const x = dx / 2 + dy, y = dy - dx / 2, l = Math.hypot(x, y);
  return { x: (x / l) * m, y: (y / l) * m };
}
// liga as unidades do desenho visto de cima (0..32 por tile) ao plano isométrico na altura z
function tileXform(x, y, z) { const k = HW / 32, j = HH / 32; ctx.setTransform(DPR * k, DPR * j, -DPR * k, DPR * j, DPR * PX(x, y), DPR * PY(x, y, z)); }
const resetXform = () => ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
function poly(pts, fill) { ctx.beginPath(); ctx.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); }
// caixa alinhada ao mundo: só as faces que a câmera vê (+x, +y e topo)
function isoBox(x0, y0, x1, y1, z0, z1, top, left, right) {
  if (left) poly([PX(x0, y1), PY(x0, y1, z0), PX(x1, y1), PY(x1, y1, z0), PX(x1, y1), PY(x1, y1, z1), PX(x0, y1), PY(x0, y1, z1)], left);
  if (right) poly([PX(x1, y0), PY(x1, y0, z0), PX(x1, y1), PY(x1, y1, z0), PX(x1, y1), PY(x1, y1, z1), PX(x1, y0), PY(x1, y0, z1)], right);
  if (top) poly([PX(x0, y0), PY(x0, y0, z1), PX(x1, y0), PY(x1, y0, z1), PX(x1, y1), PY(x1, y1, z1), PX(x0, y1), PY(x0, y1, z1)], top);
}
// quadrilátero numa face: face 'L' (plano y=y1, u ao longo de x) ou 'R' (plano x=x1, u ao longo de y)
function faceQuad(f, x0, y0, x1, y1, u0, u1, z0, z1, fill) {
  const pt = (u, z) => (f === 'L' ? [PX(lerp(x0, x1, u), y1), PY(lerp(x0, x1, u), y1, z)] : [PX(x1, lerp(y0, y1, u)), PY(x1, lerp(y0, y1, u), z)]);
  poly([...pt(u0, z0), ...pt(u1, z0), ...pt(u1, z1), ...pt(u0, z1)], fill);
}
function faceLine(f, x0, y0, x1, y1, z, col, w) {
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath();
  if (f === 'L') { ctx.moveTo(PX(x0, y1), PY(x0, y1, z)); ctx.lineTo(PX(x1, y1), PY(x1, y1, z)); }
  else { ctx.moveTo(PX(x1, y0), PY(x1, y0, z)); ctx.lineTo(PX(x1, y1), PY(x1, y1, z)); }
  ctx.stroke();
}

/* ---------- chão em blocos (texturas vistas de cima, projetadas) ---------- */
G.chunkDirty = (x, y) => {
  for (const [a, b] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) { const c = chunks.get(Math.floor((x + a) / CH) * 100 + Math.floor((y + b) / CH)); if (c) c.dirty = 1; }
};
G.chunkDirtyAll = () => { for (const c of chunks.values()) c.dirty = 1; };
G.resetChunks = () => { chunks.clear(); G.resetRoofs(); };
const FLAT_OBJ = new Set(['cadaver', 'bolsa_chao', 'horta']);
function getChunk(cx, cy) {
  const k = cx * 100 + cy;
  let c = chunks.get(k);
  if (!c) {
    if (chunks.size > 44) { let old = null, ot = 1e18; for (const [kk, cc] of chunks) if (cc.used < ot) { ot = cc.used; old = kk; } chunks.delete(old); }
    const canvas = document.createElement('canvas'); canvas.width = Math.ceil(CH * 64 * RES); canvas.height = Math.ceil(CH * 32 * RES);
    c = { canvas, ctx: canvas.getContext('2d'), dirty: 1, used: 0 };
    chunks.set(k, c);
  }
  c.used = performance.now();
  if (c.dirty) { drawChunk(c, cx, cy); c.dirty = 0; }
  return c;
}
function drawChunk(c, cx, cy) {
  const g = c.ctx;
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, c.canvas.width, c.canvas.height);
  g.setTransform(RES, 0.5 * RES, -RES, 0.5 * RES, CH * 32 * RES, 0);
  for (let ty = 0; ty < CH; ty++) for (let tx = 0; tx < CH; tx++) {
    const x = cx * CH + tx, y = cy * CH + ty; if (!inb(x, y)) continue;
    drawTile(g, x, y, tx * TILE, ty * TILE);
  }
  for (let ty = 0; ty < CH; ty++) for (let tx = 0; tx < CH; tx++) {
    const x = cx * CH + tx, y = cy * CH + ty; if (!inb(x, y)) continue;
    const o = S.objs[ix(x, y)]; if (o && FLAT_OBJ.has(o.t)) drawObj(g, o, x, y, tx * TILE, ty * TILE);
  }
}

/* ---------- cenário com altura ---------- */
// [meia-largura, meia-profundidade, deslocamento para a parede, altura] em unidades de 32 por tile
const FURN_BOX = {
  geladeira: [11, 12, -2, 1.35], armario: [15, 10, -5, 0.62], fogao: [13, 12, -3, 0.6], pia: [15, 10, -5, 0.62], cama: [12, 15, 0, 0.38], sofa: [15, 11, -1, 0.5],
  guarda_roupa: [15, 8.5, -6.5, 1.45], estante: [15, 6, -9, 1.4], banheiro: [8, 10, -3, 0.42], mesa: [10, 10, 0, 0.55], prateleira: [14, 12, 0, 1.1], balcao: [15, 9, -3, 0.68],
  armario_med: [14, 7, -8, 1.2], maca: [10, 15, 0, 0.55], armario_armas: [14, 7.5, -7.5, 1.45], arquivo: [10, 9, -6, 1.0], ferramentas: [14, 7, -7, 0.85], pecas: [15, 9, -6, 1.2],
  caixote: [12, 12, 0, 0.62], banco_igreja: [16, 6, 0, 0.42], carteira: [9, 9, -3, 0.5], lixeira: [9, 9, 0, 0.6], bomba: [14, 9, 0, 0.95], feno: [13, 11, 0, 0.75],
  bau: [12, 9, 0, 0.5], cama_imp: [12, 15, 0, 0.25], fogueira: [13, 13, 0, 0.14], gerador: [13, 10, 0, 0.62], coletor: [12, 12, 0, 0.85], bancada: [15, 10, -2, 0.62],
  muro: [16, 16, 0, 1.45], muro_metal: [16, 16, 0, 1.45],
};
let NOSHADOW = false;
function drawFurniture(o, x, y, fade) {
  const d = FURN[o.t];
  if (o.t === 'cerca') return drawFence(x, y);
  if (o.t === 'portao') return drawGate(o, x, y);
  if (o.t === 'torre') return drawTower(x, y);
  const [hx, hy, cyo, h] = FURN_BOX[o.t] || [13, 13, 0, 0.6];
  const r = NO_ROT.has(o.t) ? 0 : wallSide(x, y);
  const c = Math.cos(r), s = Math.sin(r);
  const ox = -s * cyo, oy = c * cyo; // centro deslocado para a parede (já girado)
  const sw = Math.abs(s) > 0.5;
  const ex = (sw ? hy : hx) / 32, ey = (sw ? hx : hy) / 32;
  const cxw = x + 0.5 + ox / 32, cyw = y + 0.5 + oy / 32;
  if (fade) ctx.globalAlpha = 0.45;
  const col = o.t === 'muro' ? '#7d5530' : d.col;
  isoBox(cxw - ex, cyw - ey, cxw + ex, cyw + ey, 0, h, shade(col, 0.05), shade(col, -0.22), shade(col, -0.4));
  if (o.t === 'muro' || o.t === 'muro_metal') {
    ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1; ctx.beginPath();
    for (let k = 1; k < 5; k++) { const u = k / 5; ctx.moveTo(PX(x + u, y + 1), PY(x + u, y + 1, 0)); ctx.lineTo(PX(x + u, y + 1), PY(x + u, y + 1, h)); ctx.moveTo(PX(x + 1, y + u), PY(x + 1, y + u, 0)); ctx.lineTo(PX(x + 1, y + u), PY(x + 1, y + u, h)); }
    ctx.stroke();
  }
  const art = FURN_ART[o.t];
  if (art && o.t !== 'muro' && o.t !== 'muro_metal') {
    tileXform(x, y, h); ctx.translate(16, 16); if (r) ctx.rotate(r);
    NOSHADOW = true; art(ctx, hk(x, y, 77), o, x, y); NOSHADOW = false;
    resetXform();
  }
  if (fade) ctx.globalAlpha = 1;
}
function drawFence(x, y) {
  const hz = !(isFence(x, y - 1) || isFence(x, y + 1)) || isFence(x - 1, y) || isFence(x + 1, y);
  const post = '#6b4a2a', rail = '#a07445';
  if (hz) {
    for (const z of [0.22, 0.48]) isoBox(x, y + 0.46, x + 1, y + 0.54, z, z + 0.07, shade(rail, 0.1), rail, shade(rail, -0.3));
    for (const px of [x + 0.08, x + 0.58]) isoBox(px, y + 0.44, px + 0.1, y + 0.56, 0, 0.66, shade(post, 0.15), post, shade(post, -0.3));
  } else {
    for (const z of [0.22, 0.48]) isoBox(x + 0.46, y, x + 0.54, y + 1, z, z + 0.07, shade(rail, 0.1), rail, shade(rail, -0.3));
    for (const py of [y + 0.08, y + 0.58]) isoBox(x + 0.44, py, x + 0.56, py + 0.1, 0, 0.66, shade(post, 0.15), post, shade(post, -0.3));
  }
}
function drawGate(o, x, y) {
  const hz = isFence(x - 1, y) || isFence(x + 1, y) || !(isFence(x, y - 1) || isFence(x, y + 1));
  const c = '#7a5230';
  if (o.open) { if (hz) isoBox(x, y + 0.5, x + 0.12, y + 1.4, 0, 1.2, shade(c, 0.1), c, shade(c, -0.3)); else isoBox(x + 0.5, y, x + 1.4, y + 0.12, 0, 1.2, shade(c, 0.1), c, shade(c, -0.3)); return; }
  if (hz) { isoBox(x, y + 0.42, x + 1, y + 0.58, 0, 1.2, shade(c, 0.1), c, shade(c, -0.3)); for (let k = 1; k < 5; k++) faceLine('L', x, y + 0.42, x + 1, y + 0.58, k * 0.24, 'rgba(0,0,0,.25)', 1); }
  else { isoBox(x + 0.42, y, x + 0.58, y + 1, 0, 1.2, shade(c, 0.1), c, shade(c, -0.3)); for (let k = 1; k < 5; k++) faceLine('R', x + 0.42, y, x + 0.58, y + 1, k * 0.24, 'rgba(0,0,0,.25)', 1); }
}
function drawTower(x, y) {
  const c = '#6f4b2b';
  for (const [a, b] of [[0.05, 0.05], [0.83, 0.05], [0.05, 0.83], [0.83, 0.83]]) isoBox(x + a, y + b, x + a + 0.12, y + b + 0.12, 0, 2.2, shade(c, 0.1), c, shade(c, -0.3));
  isoBox(x, y, x + 1, y + 1, 1.95, 2.05, '#9a7048', '#7a5530', '#5a3c20');
  for (const z of [2.35, 2.6]) { isoBox(x, y + 0.94, x + 1, y + 1, z, z + 0.05, '#8a6038', '#7a5530', '#5a3c20'); isoBox(x + 0.94, y, x + 1, y + 1, z, z + 0.05, '#8a6038', '#7a5530', '#5a3c20'); }
}
// parede, porta ou janela (recortada = baixa, para ver o que há atrás)
function drawWallIso(x, y, t, B, cut, roofed) {
  const h = cut ? CUT_H : WALL_H, c = wallCol(B);
  const left = shade(c, -0.12), right = shade(c, -0.32), top = cut ? shade(c, -0.05) : '#3b3732';
  // uma face só aparece se o vizinho daquele lado não for uma parede da mesma altura (ou mais alta)
  const showL = !(isWallish(x, y + 1) && (!cutFn(x, y + 1) || cut)), showR = !(isWallish(x + 1, y) && (!cutFn(x + 1, y) || cut));
  const horiz = isWallish(x - 1, y) || isWallish(x + 1, y);
  const s = S.ts[ix(x, y)] || {};
  if (t === TL.DOOR) {
    if (!cut) isoBox(x, y, x + 1, y + 1, 1.3, h, top, showL ? left : null, showR ? right : null); // verga
    const dc = '#7a5232', dh = cut ? CUT_H : 1.3;
    if (!s.broken) {
      if (s.open) { if (horiz) isoBox(x, y + 0.5, x + 0.12, y + 1.35, 0, dh, shade(dc, 0.1), dc, shade(dc, -0.3)); else isoBox(x + 0.5, y, x + 1.35, y + 0.12, 0, dh, shade(dc, 0.1), dc, shade(dc, -0.3)); }
      else {
        const [x0, y0, x1, y1, f] = horiz ? [x, y + 0.42, x + 1, y + 0.58, 'L'] : [x + 0.42, y, x + 0.58, y + 1, 'R'];
        isoBox(x0, y0, x1, y1, 0, dh, shade(dc, 0.1), dc, shade(dc, -0.3));
        if (!cut) { faceQuad(f, x0, y0, x1, y1, 0.12, 0.45, 0.15, 1.15, shade(dc, 0.08)); faceQuad(f, x0, y0, x1, y1, 0.55, 0.88, 0.15, 1.15, shade(dc, 0.08)); faceQuad(f, x0, y0, x1, y1, 0.8, 0.86, 0.6, 0.67, '#e0c060'); }
      }
    }
    if (s.bar) planks(horiz ? 'L' : 'R', x, y, s.bar, cut);
  } else {
    isoBox(x, y, x + 1, y + 1, 0, h, top, showL ? left : null, showR ? right : null);
    if (!cut) {
      for (const [f, show] of [['L', showL], ['R', showR]]) {
        if (!show) continue;
        for (let k = 1; k < 4; k++) faceLine(f, x, y, x + 1, y + 1, k * 0.42, 'rgba(0,0,0,.08)', 1);
        faceLine(f, x, y, x + 1, y + 1, 0.03, 'rgba(0,0,0,.35)', 2);
      }
      if (t === TL.WINDOW) {
        const f = horiz ? 'L' : 'R';
        if ((f === 'L' && showL) || (f === 'R' && showR)) {
          faceQuad(f, x, y, x + 1, y + 1, 0.14, 0.86, 0.5, 1.38, '#e9e6de');
          if (s.broken || s.open) {
            faceQuad(f, x, y, x + 1, y + 1, 0.2, 0.8, 0.56, 1.32, '#1d1b19');
            if (s.glass) { faceQuad(f, x, y, x + 1, y + 1, 0.2, 0.32, 0.56, 0.75, 'rgba(200,230,245,.8)'); faceQuad(f, x, y, x + 1, y + 1, 0.66, 0.8, 1.1, 1.32, 'rgba(200,230,245,.8)'); }
          } else {
            faceQuad(f, x, y, x + 1, y + 1, 0.2, 0.8, 0.56, 1.32, f === 'L' ? '#7d9fb2' : '#5f8296');
            faceQuad(f, x, y, x + 1, y + 1, 0.3, 0.42, 0.62, 1.26, 'rgba(255,255,255,.28)');
            faceQuad(f, x, y, x + 1, y + 1, 0.485, 0.515, 0.56, 1.32, '#e9e6de');
          }
        }
        if (s.bar) planks(f, x, y, s.bar, false);
      }
    } else if (t === TL.WINDOW && s.bar) planks(horiz ? 'L' : 'R', x, y, s.bar, true);
  }
  if (roofed && !cut && B.whole !== frameNo) roofTile(x, y, B);
}
function planks(f, x, y, n, cut) {
  const zs = cut ? [0.12] : [0.45, 0.85, 1.2];
  for (let k = 0; k < Math.min(n, zs.length); k++) {
    const z = zs[k];
    faceQuad(f, x, y, x + 1, y + 1, -0.05, 1.05, z, z + 0.16, k % 2 ? '#a77a45' : '#b88b52');
    faceQuad(f, x, y, x + 1, y + 1, 0.06, 0.1, z + 0.05, z + 0.11, '#3a3a3a'); faceQuad(f, x, y, x + 1, y + 1, 0.9, 0.94, z + 0.05, z + 0.11, '#3a3a3a');
  }
}
function roofTile(x, y, B) {
  const bi = S.bld.indexOf(B), rc = roofCanvas(bi, RES), k = TILE * RES;
  tileXform(x, y, WALL_H);
  ctx.drawImage(rc, (x - B.x) * k, (y - B.y) * k, k, k, -0.15, -0.15, 32.3, 32.3);
  resetXform();
  // beiral nas bordas voltadas para a câmera
  const rc2 = B.t === 'celeiro' ? '#a8322a' : B.roof;
  if (y === B.y + B.h - 1) isoBox(x, y + 0.98, x + 1, y + 1.04, WALL_H - 0.12, WALL_H, null, shade(rc2, -0.45), null);
  if (x === B.x + B.w - 1) isoBox(x + 0.98, y, x + 1.04, y + 1, WALL_H - 0.12, WALL_H, null, null, shade(rc2, -0.55));
}
// telhado do prédio inteiro de uma vez (quando nada dele está recortado)
function drawWholeRoof(B) {
  const bi = S.bld.indexOf(B), rc = roofCanvas(bi, RES);
  tileXform(B.x, B.y, WALL_H);
  ctx.drawImage(rc, 0, 0, rc.width, rc.height, -0.15, -0.15, B.w * 32 + 0.3, B.h * 32 + 0.3);
  resetXform();
  const rc2 = B.t === 'celeiro' ? '#a8322a' : B.roof;
  isoBox(B.x, B.y + B.h - 0.02, B.x + B.w, B.y + B.h + 0.04, WALL_H - 0.12, WALL_H, null, shade(rc2, -0.45), null);
  isoBox(B.x + B.w - 0.02, B.y, B.x + B.w + 0.04, B.y + B.h, WALL_H - 0.12, WALL_H, null, null, shade(rc2, -0.55));
}
function drawLamp(x, y, lit) {
  let dx = 0, dy = 0; for (const [a, b] of N4) if (tileAt(x + a, y + b) === TL.ROAD) { dx = a; dy = b; }
  const bx = x + 0.5 - dx * 0.25, by = y + 0.5 - dy * 0.25, top = 2.6;
  ctx.strokeStyle = '#4a4e52'; ctx.lineWidth = Math.max(2, 3 * K); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(PX(bx, by), PY(bx, by, 0)); ctx.lineTo(PX(bx, by), PY(bx, by, top)); ctx.lineTo(PX(bx + dx * 0.6, by + dy * 0.6), PY(bx + dx * 0.6, by + dy * 0.6, top + 0.05)); ctx.stroke();
  const hx = PX(bx + dx * 0.65, by + dy * 0.65), hy = PY(bx + dx * 0.65, by + dy * 0.65, top - 0.05);
  ctx.fillStyle = '#2f3336'; ctx.beginPath(); ctx.ellipse(hx, hy, 6 * K, 3 * K, 0, 0, 7); ctx.fill();
  if (lit) { ctx.fillStyle = '#ffe9b0'; ctx.beginPath(); ctx.ellipse(hx, hy + 2 * K, 4 * K, 2 * K, 0, 0, 7); ctx.fill(); }
  ctx.lineCap = 'butt';
}
function drawDeco(x, y, d, fade) {
  const img = isoDeco[d.k][d.v], f = isoTreeRes;
  const gx = PX(x + 0.5 + (d.ox || 0), y + 0.5 + (d.oy || 0)), gy = PY(x + 0.5 + (d.ox || 0), y + 0.5 + (d.oy || 0));
  if (fade) ctx.globalAlpha = 0.5;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(img, Math.round(gx * DPR - DECO_W / 2 * f), Math.round(gy * DPR - (DECO_H - DECO_FOOT) * f));
  resetXform();
  if (fade) ctx.globalAlpha = 1;
}
function drawTreeSprite(x, y, fade) {
  const tr = treeAt(x, y), img = isoTrees[tr.k][tr.v][tr.si], f = isoTreeRes * img.sc;
  const gx = PX(x + 0.5 + tr.ox, y + 0.5 + tr.oy), gy = PY(x + 0.5 + tr.ox, y + 0.5 + tr.oy);
  if (fade) ctx.globalAlpha = 0.32;
  // em pixels exatos da tela (o sprite já foi desenhado no zoom atual)
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(img, Math.round(gx * DPR - ISO_TREE_W / 2 * f), Math.round(gy * DPR - (ISO_TREE_H - ISO_TREE_FOOT) * f));
  resetXform();
  if (fade) ctx.globalAlpha = 1;
}

/* ---------- pessoas, animais e veículos ---------- */
function drawPerson(x, y, z, a, o) {
  const s = K * (o.scale || 1);
  const fx = Math.cos(a) - Math.sin(a), fy = (Math.cos(a) + Math.sin(a)) / 2, fl = Math.hypot(fx, fy) || 1, dx = fx / fl, dy = fy / fl;
  const front = dy > -0.25;
  ctx.save(); ctx.translate(PX(x, y), PY(x, y, z));
  ctx.fillStyle = 'rgba(0,0,0,.32)'; ctx.beginPath(); ctx.ellipse(0, 0, 11 * s, 5.5 * s, 0, 0, 7); ctx.fill();
  if (o.down) {
    const dir = dx >= 0 ? 1 : -1;
    ctx.fillStyle = '#2f3136'; ctx.fillRect(-dir * 18 * s - 6 * s, -5 * s, 12 * s, 4 * s);
    ctx.fillStyle = o.body; rr(ctx, -10 * s, -9 * s, 20 * s, 9 * s, 3 * s); ctx.fill();
    ctx.fillStyle = o.skin; ctx.beginPath(); ctx.arc(dir * 14 * s, -5 * s, 5.5 * s, 0, 7); ctx.fill();
    ctx.restore(); return;
  }
  const amp = clamp(o.amp == null ? 1 : o.amp, 0, 1.15), sw = Math.sin(o.t || 0) * amp;
  const bob = Math.abs(Math.cos(o.t || 0)) * amp * 1.8 * s, lunge = o.lunge || 0, atk = o.atk || 0;
  // pernas
  ctx.lineCap = 'round'; ctx.strokeStyle = o.legs || '#2e3035'; ctx.lineWidth = 5.5 * s;
  for (const sg of [-1, 1]) { const st = sw * sg; ctx.beginPath(); ctx.moveTo(sg * 3.5 * s, -27 * s); ctx.lineTo(sg * 3.5 * s + st * dx * 6 * s, -3 * s + st * dy * 3 * s); ctx.stroke(); }
  ctx.fillStyle = '#1e1e20'; for (const sg of [-1, 1]) { const st = sw * sg; ctx.beginPath(); ctx.ellipse(sg * 3.5 * s + st * dx * 6 * s + dx * 2 * s, -2 * s + st * dy * 3 * s, 3.5 * s, 2.2 * s, 0, 0, 7); ctx.fill(); }
  // tronco, braços e cabeça sobem e descem um pouco a cada passo; o zumbi se inclina na investida
  ctx.translate(dx * lunge * 5 * s, -bob + dy * lunge * 2.5 * s);
  const arms = () => {
    ctx.strokeStyle = o.body; ctx.lineWidth = 4.8 * s;
    for (const sg of [-1, 1]) {
      const shx = sg * 8.5 * s, shy = -47 * s;
      let hx, hy;
      if (o.zombie) { const r = 17 + lunge * 9; hx = shx * 0.6 + dx * r * s; hy = shy + 4 * s + dy * r * 0.53 * s + sw * sg * 1.5 * s; }
      else if (sg === 1 && atk > 0) { const k = Math.sin((1 - atk / 0.22) * Math.PI); hx = shx + dx * (8 + k * 12) * s; hy = shy + 2 * s + dy * (4 + k * 6) * s - k * 6 * s; }
      else { const st = -sw * sg; hx = shx + st * dx * 5 * s; hy = -31 * s + st * dy * 3 * s; }
      ctx.beginPath(); ctx.moveTo(shx, shy); ctx.lineTo(hx, hy); ctx.stroke();
      ctx.fillStyle = o.skin; ctx.beginPath(); ctx.arc(hx, hy, 2.6 * s, 0, 7); ctx.fill();
      if (sg === 1 && o.weapon) { ctx.strokeStyle = o.gun ? '#1c1d1f' : '#8d8f90'; ctx.lineWidth = (o.gun ? 3.2 : 2.4) * s; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + dx * 15 * s, hy + dy * 7.5 * s - (o.gun ? 0 : 6 * s)); ctx.stroke(); ctx.strokeStyle = o.body; ctx.lineWidth = 4.8 * s; }
    }
  };
  if (!front) arms();
  if (o.pack && front) { ctx.fillStyle = shade(o.pack, -0.2); rr(ctx, -8 * s, -51 * s, 16 * s, 18 * s, 3 * s); ctx.fill(); }
  // tronco
  const gr = ctx.createLinearGradient(-9 * s, 0, 9 * s, 0); gr.addColorStop(0, shade(o.body, 0.12)); gr.addColorStop(1, shade(o.body, -0.25));
  ctx.fillStyle = gr; rr(ctx, -9 * s, -54 * s, 18 * s, 28 * s, 5 * s); ctx.fill();
  if (o.zombie) { ctx.fillStyle = 'rgba(95,12,10,.6)'; ctx.beginPath(); ctx.ellipse(-2 * s, -42 * s, 4 * s, 6 * s, 0.4, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(20,15,10,.4)'; ctx.fillRect(2 * s, -33 * s, 5 * s, 4 * s); }
  if (o.pack && !front) { ctx.fillStyle = o.pack; rr(ctx, -8 * s, -52 * s, 16 * s, 19 * s, 3 * s); ctx.fill(); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(-8 * s, -44 * s, 16 * s, 2 * s); }
  if (front) arms();
  // cabeça
  const hx = dx * 1.5 * s, hy = -62 * s;
  ctx.fillStyle = o.skin; ctx.beginPath(); ctx.arc(hx, hy, 8 * s, 0, 7); ctx.fill();
  if (o.hair) { ctx.fillStyle = o.hair; ctx.beginPath(); if (front) ctx.arc(hx, hy - 1.5 * s, 8.2 * s, Math.PI * 1.05, Math.PI * 1.95); else ctx.arc(hx, hy, 8.3 * s, Math.PI * 0.85, Math.PI * 2.15); ctx.fill(); }
  if (front) {
    const ex = hx + dx * 3 * s;
    ctx.fillStyle = o.zombie ? 'rgba(40,15,15,.75)' : '#2a2018';
    ctx.fillRect(ex - 3.5 * s, hy - 0.5 * s, 2 * s, 2 * s); ctx.fillRect(ex + 1.5 * s, hy - 0.5 * s, 2 * s, 2 * s);
    if (o.eyes) { ctx.fillStyle = o.eyes; ctx.fillRect(ex - 3 * s, hy, 1.2 * s, 1.2 * s); ctx.fillRect(ex + 2 * s, hy, 1.2 * s, 1.2 * s); }
    if (o.zombie) { ctx.fillStyle = 'rgba(90,10,10,.7)'; ctx.fillRect(ex - 2 * s, hy + 4 * s, 4 * s, 1.5 * s); }
  }
  ctx.lineCap = 'butt';
  ctx.restore();
}
function drawAnimal(a) {
  const s = K;
  ctx.save(); ctx.translate(PX(a.x, a.y), PY(a.x, a.y));
  const fx = Math.cos(a.a) - Math.sin(a.a), dir = fx >= 0 ? 1 : -1;
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(0, 0, (a.t === 'coelho' ? 7 : 16) * s, (a.t === 'coelho' ? 3 : 6) * s, 0, 0, 7); ctx.fill();
  ctx.scale(dir, 1);
  if (a.t === 'coelho') {
    ctx.fillStyle = '#8f7a5e'; ctx.beginPath(); ctx.ellipse(0, -5 * s, 6 * s, 4.5 * s, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(5 * s, -9 * s, 3 * s, 0, 7); ctx.fill();
    ctx.fillRect(4 * s, -17 * s, 1.6 * s, 6 * s); ctx.fillRect(6 * s, -16 * s, 1.6 * s, 6 * s); ctx.fillStyle = '#eee'; ctx.beginPath(); ctx.arc(-6 * s, -5 * s, 2 * s, 0, 7); ctx.fill();
  } else {
    ctx.strokeStyle = '#5a4430'; ctx.lineWidth = 2.4 * s; ctx.beginPath(); for (const lx of [-9, -5, 6, 10]) { ctx.moveTo(lx * s, -16 * s); ctx.lineTo(lx * s, 0); } ctx.stroke();
    ctx.fillStyle = '#9a7650'; ctx.beginPath(); ctx.ellipse(0, -20 * s, 15 * s, 7 * s, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(10 * s, -24 * s); ctx.lineTo(16 * s, -36 * s); ctx.lineTo(20 * s, -34 * s); ctx.lineTo(15 * s, -20 * s); ctx.fill();
    ctx.beginPath(); ctx.ellipse(19 * s, -36 * s, 4.5 * s, 3 * s, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = '#4a3828'; ctx.lineWidth = 1.5 * s; ctx.beginPath(); ctx.moveTo(18 * s, -39 * s); ctx.lineTo(15 * s, -46 * s); ctx.moveTo(20 * s, -39 * s); ctx.lineTo(23 * s, -46 * s); ctx.stroke();
    ctx.fillStyle = '#e8e0d0'; ctx.beginPath(); ctx.arc(-14 * s, -21 * s, 2.5 * s, 0, 7); ctx.fill();
  }
  ctx.restore();
}
// prisma num referencial girado (carros): comprimento l0..l1, largura w0..w1
function prism(cx, cy, ca, sa, l0, l1, w0, w1, z0, z1, side, top, opts = {}) {
  const P = [[l0, w0], [l1, w0], [l1, w1], [l0, w1]].map(([l, w]) => [cx + ca * l - sa * w, cy + sa * l + ca * w]);
  const pc = [(P[0][0] + P[2][0]) / 2, (P[0][1] + P[2][1]) / 2];
  for (let i = 0; i < 4; i++) {
    const a = P[i], b = P[(i + 1) % 4], mx = (a[0] + b[0]) / 2 - pc[0], my = (a[1] + b[1]) / 2 - pc[1];
    const ex = b[0] - a[0], ey = b[1] - a[1]; let nx = ey, ny = -ex; if (nx * mx + ny * my < 0) { nx = -nx; ny = -ny; }
    const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
    if (nx + ny <= 0.02) continue;
    let col = (i === 1 && opts.front) || (i === 3 && opts.back) || side;
    col = shade(col, -0.12 - (nx - ny) * 0.12);
    poly([PX(a[0], a[1]), PY(a[0], a[1], z0), PX(b[0], b[1]), PY(b[0], b[1], z0), PX(b[0], b[1]), PY(b[0], b[1], z1), PX(a[0], a[1]), PY(a[0], a[1], z1)], col);
  }
  if (top) poly([PX(P[0][0], P[0][1]), PY(P[0][0], P[0][1], z1), PX(P[1][0], P[1][1]), PY(P[1][0], P[1][1], z1), PX(P[2][0], P[2][1]), PY(P[2][0], P[2][1], z1), PX(P[3][0], P[3][1]), PY(P[3][0], P[3][1], z1)], top);
}
// desenho plano sobre o teto de um veículo (cruz da ambulância)
function carTopXform(cx, cy, ca, sa, z) {
  const fx = (ca - sa) * HW, fy = (ca + sa) * HH, sx2 = (-sa - ca) * HW, sy2 = (-sa + ca) * HH;
  ctx.setTransform(DPR * fx, DPR * fy, DPR * sx2, DPR * sy2, DPR * PX(cx, cy), DPR * PY(cx, cy, z));
}
function drawCar(v) {
  const d = VT[v.t], L = d.len / 2, W = d.wid / 2, ca = Math.cos(v.a), sa = Math.sin(v.a), x = v.x, y = v.y;
  const dead = v.hp <= 0, col = dead ? '#2f2b28' : v.col, glass = v.hp < d.hp * 0.3 ? '#56636a' : '#2a3a44';
  const sh = [[-L, -W], [L, -W], [L, W], [-L, W]].map(([l, w]) => [x + 0.12 + ca * l * 1.05 - sa * w * 1.1, y + 0.12 + sa * l * 1.05 + ca * w * 1.1]);
  poly(sh.flatMap(([a, b]) => [PX(a, b), PY(a, b)]), 'rgba(0,0,0,.35)');
  const wheel = (l, w, r = 0.2, wd = 0.12) => prism(x, y, ca, sa, l - r, l + r, w - wd, w + wd, 0, r * 1.6, '#151515', '#222');
  if (d.moto) {
    wheel(L * 0.75, 0, 0.2, 0.06); wheel(-L * 0.75, 0, 0.2, 0.06);
    prism(x, y, ca, sa, -L * 0.45, L * 0.5, -W * 0.5, W * 0.5, 0.25, 0.5, col, shade(col, 0.15));
    prism(x, y, ca, sa, -L * 0.4, L * 0.05, -W * 0.35, W * 0.35, 0.5, 0.58, '#222', '#2a2a2a');
    if (v === S.player.inCar) drawPerson(x - ca * 0.1, y - sa * 0.1, 0.35, v.a, { body: PROF_SHIRT[S.player.prof] || '#556', skin: '#e0b08a', hair: '#2a1d14' });
    return;
  }
  if (v.t === 'trator') {
    wheel(L * 0.6, -W * 0.9, 0.22, 0.12); wheel(L * 0.6, W * 0.9, 0.22, 0.12);
    prism(x, y, ca, sa, -L * 0.1, L * 0.95, -W * 0.45, W * 0.45, 0.25, 0.75, col, shade(col, 0.1));
    prism(x, y, ca, sa, -L * 0.95, -L * 0.15, -W * 0.6, W * 0.6, 0.25, 0.6, shade(col, -0.1), shade(col, 0.05));
    prism(x, y, ca, sa, -L * 0.75, -L * 0.45, -W * 0.3, W * 0.3, 0.6, 0.85, '#222', '#333');
    for (const [l, w] of [[-L * 0.9, -W * 0.55], [-L * 0.9, W * 0.55], [-L * 0.2, -W * 0.55], [-L * 0.2, W * 0.55]]) prism(x, y, ca, sa, l - 0.03, l + 0.03, w - 0.03, w + 0.03, 0.6, 1.5, '#2a2a2a', '#333');
    prism(x, y, ca, sa, -L * 0.95, -L * 0.15, -W * 0.6, W * 0.6, 1.5, 1.56, '#2a2a2a', '#3a3a3a');
    wheel(-L * 0.55, -W * 1.05, 0.42, 0.16); wheel(-L * 0.55, W * 1.05, 0.42, 0.16);
    return;
  }
  for (const [l, w] of [[L * 0.62, -W * 0.95], [L * 0.62, W * 0.95], [-L * 0.62, -W * 0.95], [-L * 0.62, W * 0.95]]) wheel(l, w);
  const light = v.lights || (v.on && daylight() < 0.5) ? '#fff6c8' : '#cfcfc0';
  if (v.t === 'caminhao') {
    prism(x, y, ca, sa, -L, L * 0.38, -W, W, 0.3, 1.45, shade(col, 0.1), shade(col, 0.2));
    prism(x, y, ca, sa, L * 0.42, L, -W * 0.95, W * 0.95, 0.3, 1.15, shade(col, -0.1), shade(col, 0.05), { front: glass });
  } else {
    const roofZ = v.t === 'ambulancia' ? 1.25 : 0.95, body = v.t === 'viatura' ? '#1f2a44' : col;
    prism(x, y, ca, sa, -L, L, -W, W, 0.18, 0.55, body, shade(body, 0.12), { front: shade(body, -0.05) });
    if (v.t === 'caminhonete') {
      prism(x, y, ca, sa, -L * 0.1, L * 0.45, -W * 0.92, W * 0.92, 0.55, 0.95, glass, shade(col, 0.15), { back: shade(col, -0.1) });
      prism(x, y, ca, sa, -L * 0.98, -L * 0.15, -W * 0.92, W * 0.92, 0.55, 0.62, shade(col, -0.2), shade(col, -0.45));
    } else if (v.t === 'ambulancia') {
      prism(x, y, ca, sa, -L, L * 0.35, -W * 0.98, W * 0.98, 0.55, roofZ, '#f2f2ef', '#f7f7f4');
      prism(x, y, ca, sa, L * 0.35, L * 0.75, -W * 0.92, W * 0.92, 0.55, 0.95, glass, '#f2f2ef');
      carTopXform(x, y, ca, sa, roofZ); ctx.fillStyle = '#c8302a'; ctx.fillRect(-L * 0.6, -0.08, 0.5, 0.16); ctx.fillRect(-L * 0.42, -0.26, 0.14, 0.52); resetXform();
    } else {
      prism(x, y, ca, sa, -L * 0.55, L * 0.3, -W * 0.9, W * 0.9, 0.55, 0.92, v.t === 'viatura' ? '#e8e8e8' : glass, v.t === 'viatura' ? '#f2f2f2' : shade(col, 0.18), { front: glass, back: glass });
      if (v.t === 'viatura') prism(x, y, ca, sa, -L * 0.6, L * 0.25, -W * 0.92, W * 0.92, 0.55, 0.78, glass, null, { front: glass, back: glass });
    }
    if (d.siren) {
      const on = v === S.player.inCar && v.on && Math.floor(performance.now() / 250) % 2;
      prism(x, y, ca, sa, -0.08, 0.08, -W * 0.7, 0, roofZ, roofZ + 0.1, on ? '#4af' : '#24508a', on ? '#7cf' : '#2f62a8');
      prism(x, y, ca, sa, -0.08, 0.08, 0, W * 0.7, roofZ, roofZ + 0.1, on ? '#922' : '#d33', on ? '#a33' : '#e44');
    }
  }
  for (const sg of [-1, 1]) {
    prism(x, y, ca, sa, L - 0.03, L + 0.01, sg * W * 0.75 - 0.1, sg * W * 0.75 + 0.1, 0.36, 0.46, light, light);
    prism(x, y, ca, sa, -L - 0.01, -L + 0.03, sg * W * 0.75 - 0.08, sg * W * 0.75 + 0.08, 0.38, 0.46, '#a82020', '#a82020');
  }
}

/* ---------- quadro ---------- */
const PROF_SHIRT = { policial: '#2f4a7a', carpinteiro: '#8a6a4a', mecanico: '#3a5068', enfermeira: '#5a8f88', agricultor: '#6a7040', escoteiro: '#556a48', desempregado: '#7a5a6a' };
let rainDrops = [];
let cutFn = () => false, frameNo = 0;
function render(now) {
  const p = S.player, t = now / 1000;
  K = clamp(Math.min(VW, VH) / (touchMode ? 8.6 : 10.5) / 64, 0.55, 1.5) * G.zoom;
  HW = 32 * K; HH = 16 * K; HZ = 38 * K;
  const want = clamp(Math.round(K * DPR * 2) / 2, 1, 1.5);
  if (want !== RES) { RES = want; chunks.clear(); G.resetRoofs(); }
  const tres = Math.round(K * DPR * 8) / 8;
  if (isoTreeRes !== tres && (!G.treeT || now - G.treeT > 250)) { G.treeT = now; buildIsoTrees(tres); }
  // câmera: segue com suavização que não depende da taxa de quadros e olha um pouco à frente
  const rdt = Math.min(0.1, (now - (G.lastR || now)) / 1000); G.lastR = now;
  let lx = 0, ly = 0;
  if (p.inCar) { const lead = Math.min(1, Math.abs(p.inCar.sp) / 4) * 1.5; lx = Math.cos(p.a) * lead; ly = Math.sin(p.a) * lead; }
  else { lx = (p.vx || 0) * 0.22; ly = (p.vy || 0) * 0.22; }
  const kl = 1 - Math.exp(-rdt * 3); G.lead = G.lead || { x: 0, y: 0 }; G.lead.x += (lx - G.lead.x) * kl; G.lead.y += (ly - G.lead.y) * kl;
  const tx = p.x + G.lead.x, ty = p.y + G.lead.y;
  const kc = 1 - Math.exp(-rdt * 10);
  G.cam.x += (tx - G.cam.x) * kc; G.cam.y += (ty - G.cam.y) * kc;
  if (Math.abs(G.cam.x - tx) > 10 || Math.abs(G.cam.y - ty) > 10) { G.cam.x = tx; G.cam.y = ty; }
  let shx = 0, shy = 0;
  if (G.shake > 0) { shx = rnd(-1, 1) * G.shake * 8; shy = rnd(-1, 1) * G.shake * 8; }
  OX = VW / 2 - (G.cam.x - G.cam.y) * HW + shx; OY = VH / 2 - (G.cam.x + G.cam.y) * HH + 0.7 * HZ + shy;
  OX = Math.round(OX * DPR) / DPR; OY = Math.round(OY * DPR) / DPR; // tudo no mesmo pixel: sem tremedeira
  resetXform();
  ctx.fillStyle = '#121310'; ctx.fillRect(0, 0, VW, VH);
  ctx.imageSmoothingEnabled = true;
  // área visível do mundo (com folga embaixo para objetos altos)
  const marg = 4.5 * HZ;
  const cs = [screenToWorld(-HW * 2, -HH * 4), screenToWorld(VW + HW * 2, -HH * 4), screenToWorld(-HW * 2, VH + marg), screenToWorld(VW + HW * 2, VH + marg)];
  const xmin = Math.max(0, Math.floor(Math.min(...cs.map((c) => c.x)))), xmax = Math.min(MAP_W - 1, Math.ceil(Math.max(...cs.map((c) => c.x))));
  const ymin = Math.max(0, Math.floor(Math.min(...cs.map((c) => c.y)))), ymax = Math.min(MAP_H - 1, Math.ceil(Math.max(...cs.map((c) => c.y))));
  const onScreen = (x, y) => { const a = PX(x + 0.5, y + 0.5), b = PY(x + 0.5, y + 0.5); return a > -HW * 3 && a < VW + HW * 3 && b > -HH * 3 && b < VH + marg; };
  // chão
  for (let cy = Math.floor(ymin / CH); cy <= Math.floor(ymax / CH); cy++) for (let cx = Math.floor(xmin / CH); cx <= Math.floor(xmax / CH); cx++) {
    const x0 = cx * CH, y0 = cy * CH;
    const top = PY(x0, y0), left = PX(x0, y0 + CH), right = PX(x0 + CH, y0), bottom = PY(x0 + CH, y0 + CH);
    if (right < 0 || left > VW || bottom < 0 || top > VH) continue;
    const c = getChunk(cx, cy);
    ctx.drawImage(c.canvas, left - 0.25, top - 0.25, CH * HW * 2 + 0.5, CH * HH * 2 + 0.5);
  }
  // sangue e sombras das árvores no chão
  for (const b of S.blood) {
    if (b[0] < xmin || b[0] > xmax || b[1] < ymin || b[1] > ymax) continue;
    ctx.fillStyle = ['rgba(110,12,10,.6)', 'rgba(80,6,6,.55)', 'rgba(130,22,15,.5)'][b[3]];
    ctx.beginPath(); ctx.ellipse(PX(b[0], b[1]), PY(b[0], b[1]), b[2] * HW * 1.3, b[2] * HH * 1.3, 0, 0, 7); ctx.fill();
  }
  ctx.fillStyle = 'rgba(10,18,8,.28)'; ctx.beginPath();
  for (let y = ymin; y <= ymax; y++) for (let x = xmin; x <= xmax; x++) {
    if (S.tiles[ix(x, y)] !== TL.TREE) continue;
    const tr = treeAt(x, y), ex = PX(x + 0.85 + tr.ox, y + 0.85 + tr.oy), ey = PY(x + 0.85 + tr.ox, y + 0.85 + tr.oy), rx = HW * 1.05 * TREE_SC[tr.si];
    if (ex < -rx || ex > VW + rx || ey < -rx || ey > VH + rx) continue;
    ctx.moveTo(ex + rx, ey); ctx.ellipse(ex, ey, rx, rx * 0.5, 0, 0, Math.PI * 2);
  }
  ctx.fill();
  // construção: fantasma
  if (G.buildSel) {
    const [bx, by] = buildTarget(); const err = canBuild(G.buildSel, bx, by);
    poly([PX(bx, by), PY(bx, by), PX(bx + 1, by), PY(bx + 1, by), PX(bx + 1, by + 1), PY(bx + 1, by + 1), PX(bx, by + 1), PY(bx, by + 1)], err ? 'rgba(220,60,50,.4)' : 'rgba(90,220,120,.4)');
    isoBox(bx + 0.05, by + 0.05, bx + 0.95, by + 0.95, 0, 0.6, err ? 'rgba(220,60,50,.25)' : 'rgba(90,220,120,.25)', null, null);
  }
  // recorte: paredes e telhados na frente do jogador ficam baixos
  const inB = bldAt(Math.floor(p.x), Math.floor(p.y));
  const pd = p.x + p.y, pa = p.x - p.y;
  cutFn = (x, y) => {
    const dd = x + y + 1 - pd; if (dd <= 0.15) return false;
    if (inB >= 0 && S.room[ix(x, y)] - 1 === inB) return true;
    return dd < 5.5 && Math.abs(x - y - pa) < 1.7 + dd * 0.15;
  };
  const roofed = (b) => b >= 0 && b !== inB;
  const hiddenByRoof = (x, y) => { const fx = Math.floor(x), fy = Math.floor(y), b = bldAt(fx, fy); return roofed(b) && !cutFn(fx, fy); };
  // entidades ordenadas por profundidade
  const ents = [];
  frameNo++;
  for (const B of S.bld) {
    if (!roofed(S.bld.indexOf(B)) || B.x > xmax || B.x + B.w < xmin || B.y > ymax || B.y + B.h < ymin) continue;
    let anyCut = false;
    for (let y = B.y; y < B.y + B.h && !anyCut; y++) for (let x = B.x; x < B.x + B.w; x++) if (cutFn(x, y)) { anyCut = true; break; }
    if (!anyCut) { B.whole = frameNo; ents.push({ d: B.x + B.w + B.y + B.h - 1 + 0.5, f: () => drawWholeRoof(B) }); }
  }
  for (const v of S.vehs) {
    if (v.x < xmin - 3 || v.x > xmax + 3 || v.y < ymin - 3 || v.y > ymax + 3) continue;
    if (!G.vis[ix(Math.floor(v.x), Math.floor(v.y))] && !S.seen[ix(Math.floor(v.x), Math.floor(v.y))]) continue;
    if (hiddenByRoof(v.x, v.y)) continue;
    ents.push({ d: v.x + v.y, f: () => drawCar(v) });
  }
  for (const a of S.ani) if (a.x >= xmin && a.x <= xmax && a.y >= ymin && a.y <= ymax && seesAt(a.x, a.y)) ents.push({ d: a.x + a.y, f: () => drawAnimal(a) });
  for (const z of S.zs) {
    if (z.x < xmin || z.x > xmax || z.y < ymin || z.y > ymax || !seesAt(z.x, z.y) || hiddenByRoof(z.x, z.y)) continue;
    const zd = ZT[z.t];
    ents.push({ d: z.x + z.y, f: () => drawPerson(z.x, z.y, 0, z.a, { zombie: 1, body: z.shirt, skin: zd.col, legs: '#3a3a36', hair: z.seed % 3 ? HAIR[z.seed % HAIR.length] : null, down: z.down > 0, scale: z.t === 'brutamontes' ? 1.3 : 1, t: (z.ph || 0) + z.seed, amp: (z.spdNow || 0) / Math.max(0.6, zd.spd * 0.8), lunge: z.lunge || 0, eyes: z.t === 'corredor' ? '#ff3a2a' : null }) });
  }
  for (const n of S.npcs) {
    if (n.dead || n.away || n.inCar || !seesAt(n.x, n.y) || n.x < xmin || n.x > xmax || n.y < ymin || n.y > ymax || hiddenByRoof(n.x, n.y)) continue;
    const w = n.wp && ITEMS[n.wp];
    ents.push({ d: n.x + n.y, f: () => {
      drawPerson(n.x, n.y, 0, n.a, { body: NPC_KINDS[n.kind].col, skin: ['#d9a77a', '#a8754a', '#7a5032', '#e8c4a0'][n.id % 4], hair: HAIR[n.id % HAIR.length], t: n.ph || 0, amp: n.mvT > 0 ? 1 : 0, weapon: !!w, gun: w && w.wp && w.wp.gun, pack: n.kind === 'comerciante' ? '#6a5a3a' : null });
      if (dist(n.x, n.y, p.x, p.y) < 7) { ctx.font = `700 ${Math.max(10, 11 * K)}px 'Roboto Condensed', 'Arial Narrow', sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.75)'; const lb = n.name + (n.st === 'seguir' ? ' ★' : ''); ctx.strokeText(lb, PX(n.x, n.y), PY(n.x, n.y, 2)); ctx.fillStyle = n.hostile ? '#ff8a7a' : '#e8e8e0'; ctx.fillText(lb, PX(n.x, n.y), PY(n.x, n.y, 2)); }
    } });
  }
  if (!p.inCar) {
    const it = p.eq.mao;
    ents.push({ d: pd + 0.01, f: () => drawPerson(p.x, p.y, p.onTower ? 2.05 : 0, p.a, { body: p.hitT > 0 ? '#a33' : PROF_SHIRT[p.prof] || '#556', skin: '#e0b08a', hair: '#2a1d14', pack: p.eq.costas ? '#4a5a3a' : null, t: p.ph || 0, amp: (p.spdNow || 0) / 2.6, atk: p.atkT || 0, weapon: !!it, gun: it && ITEMS[it.k].wp && ITEMS[it.k].wp.gun, down: p.sleeping }) });
  }
  for (const k of Object.keys(S.fires)) {
    const i = +k, fx = i % MAP_W, fy = Math.floor(i / MAP_W);
    if (fx < xmin || fx > xmax || fy < ymin || fy > ymax) continue;
    ents.push({ d: fx + fy + 1.2, f: () => {
      for (let n = 0; n < 5; n++) {
        const ph = t * 7 + n * 1.7 + fx * 3.1 + fy * 1.3, ox = (n % 3 - 1) * 0.28, oy = ((n + 1) % 3 - 1) * 0.28;
        const bx = PX(fx + 0.5 + ox, fy + 0.5 + oy), by = PY(fx + 0.5 + ox, fy + 0.5 + oy);
        const h = HZ * (0.6 + 0.35 * Math.abs(Math.sin(ph)));
        const gr = ctx.createLinearGradient(0, by, 0, by - h); gr.addColorStop(0, 'rgba(255,90,20,.9)'); gr.addColorStop(0.6, 'rgba(255,170,40,.75)'); gr.addColorStop(1, 'rgba(255,230,120,0)');
        ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(bx - HW * 0.22, by); ctx.quadraticCurveTo(bx - HW * 0.1, by - h * 0.6, bx + Math.sin(ph) * HW * 0.05, by - h); ctx.quadraticCurveTo(bx + HW * 0.1, by - h * 0.6, bx + HW * 0.22, by); ctx.fill();
      }
    } });
  }
  ents.sort((a, b) => a.d - b.d);
  // cenário, diagonal por diagonal (de trás para a frente)
  const LM = lampMap(), lampsLit = daylight() < 0.6 && gridPower();
  let ei = 0;
  for (let dsum = xmin + ymin; dsum <= xmax + ymax; dsum++) {
    const td = dsum + 1;
    while (ei < ents.length && ents[ei].d < td) ents[ei++].f();
    const xa = Math.max(xmin, dsum - ymax), xb = Math.min(xmax, dsum - ymin);
    for (let x = xa; x <= xb; x++) {
      const y = dsum - x, i = ix(x, y);
      if (!onScreen(x, y)) continue;
      const tt = S.tiles[i], b = S.room[i] - 1, cut = cutFn(x, y);
      if (tt === TL.WALL || tt === TL.WINDOW || tt === TL.DOOR) { drawWallIso(x, y, tt, S.bld[b] || S.bld[0], cut, roofed(b)); continue; }
      if (roofed(b) && !cut && tt !== TL.BURNT && tt !== TL.RUBBLE) { if (S.bld[b].whole !== frameNo) roofTile(x, y, S.bld[b]); continue; }
      const o = S.objs[i];
      if (o && FURN[o.t] && !FLAT_OBJ.has(o.t) && o.t !== 'arbusto') drawFurniture(o, x, y, cut && (FURN_BOX[o.t] || [0, 0, 0, 0])[3] > 0.9);
      if (tt === TL.TREE) drawTreeSprite(x, y, cut || (Math.abs(x + 0.5 - p.x) < 1.3 && Math.abs(y + 0.5 - p.y) < 1.3));
      else if (LM[i]) drawLamp(x, y, lampsLit);
      else if (tt === TL.GRASS || tt === TL.BUSH) { const dc = decoAt(x, y); if (dc) drawDeco(x, y, dc, cut); }
    }
  }
  while (ei < ents.length) ents[ei++].f();
  // efeitos
  for (const f of G.fx) {
    if (f.k === 'swing') { ctx.strokeStyle = `rgba(255,255,255,${0.6 * (1 - f.t / f.d)})`; ctx.lineWidth = 3; ctx.beginPath(); for (let k = 0; k <= 8; k++) { const an = f.a - 0.9 + k * 0.225, wx = f.x + Math.cos(an) * f.r, wy = f.y + Math.sin(an) * f.r; const sx = PX(wx, wy), sy = PY(wx, wy, 0.9); if (k) ctx.lineTo(sx, sy); else ctx.moveTo(sx, sy); } ctx.stroke(); }
    else if (f.k === 'bang') { ctx.strokeStyle = `rgba(255,220,180,${1 - f.t / f.d})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(PX(f.x, f.y), PY(f.x, f.y, 0.8), HW * (0.3 + f.t * 2), HH * (0.3 + f.t * 2), 0, 0, 7); ctx.stroke(); }
    else if (f.k === 'throw') { const k = f.t / f.d, wx = lerp(f.x0, f.x1, k), wy = lerp(f.y0, f.y1, k); ctx.fillStyle = '#7ad'; ctx.beginPath(); ctx.arc(PX(wx, wy), PY(wx, wy, 1 + Math.sin(k * Math.PI) * 1.5), 4 * K, 0, 7); ctx.fill(); }
  }
  for (const tr of G.tracers) { ctx.strokeStyle = 'rgba(255,240,160,.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(PX(tr.x0, tr.y0), PY(tr.x0, tr.y0, 1.05)); ctx.lineTo(PX(tr.x1, tr.y1), PY(tr.x1, tr.y1, 1.05)); ctx.stroke(); }
  for (const r of G.rings) { const k = r.t / 0.8; ctx.strokeStyle = `rgba(255,255,255,${0.35 * (1 - k)})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(PX(r.x, r.y), PY(r.x, r.y), r.r * HW * 1.414 * k, r.r * HH * 1.414 * k, 0, 0, 7); ctx.stroke(); }
  // névoa de guerra: escurece tudo, menos as colunas dos tiles que o personagem enxerga
  const dl = daylight();
  fctx.setTransform(1, 0, 0, 1, 0, 0); fctx.globalCompositeOperation = 'source-over'; fctx.clearRect(0, 0, fogCv.width, fogCv.height);
  fctx.fillStyle = `rgba(10,11,12,${0.44 + (1 - dl) * 0.2})`; fctx.fillRect(0, 0, fogCv.width, fogCv.height);
  fctx.globalCompositeOperation = 'destination-out'; fctx.setTransform(0.25, 0, 0, 0.25, 0, 0); fctx.fillStyle = '#000'; fctx.beginPath();
  const colH = WALL_H * HZ + HZ * 0.4;
  for (const i of G.visList) {
    const x = i % MAP_W, y = Math.floor(i / MAP_W);
    if (x < xmin - 1 || x > xmax + 1 || y < ymin - 1 || y > ymax + 1) continue;
    const lx = PX(x, y + 1), ly = PY(x, y + 1), bx = PX(x + 1, y + 1), by = PY(x + 1, y + 1), rx = PX(x + 1, y), ry = PY(x + 1, y), tpx = PX(x, y), tpy = PY(x, y);
    fctx.moveTo(lx, ly); fctx.lineTo(bx, by); fctx.lineTo(rx, ry); fctx.lineTo(rx, ry - colH); fctx.lineTo(tpx, tpy - colH); fctx.lineTo(lx, ly - colH); fctx.closePath();
  }
  fctx.fill();
  ctx.drawImage(fogCv, 0, 0, VW, VH);
  // iluminação noturna
  const dark = (1 - dl) * 0.86 + (S.weather.k === 'tempestade' ? 0.15 : S.weather.k === 'chuva' ? 0.08 : 0) * dl;
  const lamps = [];
  if (dark > 0.02) {
    lctx.setTransform(1, 0, 0, 1, 0, 0); lctx.globalCompositeOperation = 'source-over'; lctx.clearRect(0, 0, lightCv.width, lightCv.height);
    lctx.fillStyle = `rgba(4,7,16,${Math.min(0.92, dark)})`; lctx.fillRect(0, 0, lightCv.width, lightCv.height);
    lctx.globalCompositeOperation = 'destination-out';
    const hole = (wx, wy, r, a = 1) => { // r em tiles; achatado como o chão
      const sx = PX(wx, wy) / 2, sy = PY(wx, wy) / 2, R = r * HW * 0.75;
      lctx.save(); lctx.translate(sx, sy); lctx.scale(1, 0.62);
      const g = lctx.createRadialGradient(0, 0, 0, 0, 0, R); g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      lctx.fillStyle = g; lctx.beginPath(); lctx.arc(0, 0, R, 0, 7); lctx.fill(); lctx.restore();
    };
    hole(p.x, p.y, 3.2, 0.75);
    const cone = (wx, wy, a, len, spread) => {
      lctx.beginPath(); lctx.moveTo(PX(wx, wy) / 2, PY(wx, wy) / 2);
      for (let k = 0; k <= 8; k++) { const an = a - spread + (k / 8) * spread * 2, ex = wx + Math.cos(an) * len, ey = wy + Math.sin(an) * len; lctx.lineTo(PX(ex, ey) / 2, PY(ex, ey) / 2); }
      lctx.closePath();
      const g = lctx.createRadialGradient(PX(wx, wy) / 2, PY(wx, wy) / 2, 0, PX(wx, wy) / 2, PY(wx, wy) / 2, len * HW * 0.7); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      lctx.fillStyle = g; lctx.fill();
    };
    if (p.light && !p.inCar) cone(p.x, p.y, p.a, 7, 0.45);
    for (const v of S.vehs) if (v.lights && v.bat > 0 && Math.abs(v.x - G.cam.x) < 30 && Math.abs(v.y - G.cam.y) < 30) cone(v.x + Math.cos(v.a) * 1.1, v.y + Math.sin(v.a) * 1.1, v.a, 8, 0.35);
    for (const k of Object.keys(S.fires)) { const i = +k, fx = i % MAP_W + 0.5, fy = Math.floor(i / MAP_W) + 0.5; if (fx > xmin - 6 && fx < xmax + 6 && fy > ymin - 6 && fy < ymax + 6) hole(fx, fy, 4 + Math.sin(t * 9 + i) * 0.3, 0.9); }
    for (const [k, o] of Object.entries(S.objs)) {
      if (!((o.t === 'fogueira' && o.lit) || (o.t === 'gerador' && o.on))) continue;
      const i = +k, fx = i % MAP_W + 0.5, fy = Math.floor(i / MAP_W) + 0.5; if (fx > xmin - 12 && fx < xmax + 12 && fy > ymin - 12 && fy < ymax + 12) hole(fx, fy, o.t === 'gerador' ? 10 : 4, 0.85);
    }
    if (lampsLit) for (let y = ymin; y <= ymax; y++) for (let x = xmin; x <= xmax; x++) {
      if (!LM[ix(x, y)]) continue;
      let dx = 0, dy = 0; for (const [a, b] of N4) if (tileAt(x + a, y + b) === TL.ROAD) { dx = a; dy = b; }
      const lx = x + 0.5 + dx * 0.4, ly = y + 0.5 + dy * 0.4; lamps.push([lx, ly]); hole(lx, ly, 3.4, 0.7);
    }
    if (dl < 0.5) for (const B of S.bld) {
      if (!B.lit || B.x > xmax || B.x + B.w < xmin || B.y > ymax || B.y + B.h < ymin || !powered(B.x, B.y)) continue;
      lctx.fillStyle = 'rgba(0,0,0,.8)'; lctx.beginPath();
      for (const [a, b] of [[B.x, B.y], [B.x + B.w, B.y], [B.x + B.w, B.y + B.h], [B.x, B.y + B.h]]) lctx.lineTo(PX(a, b) / 2, PY(a, b) / 2);
      lctx.closePath(); lctx.fill();
    }
    ctx.drawImage(lightCv, 0, 0, VW, VH);
    for (const [lx, ly] of lamps) { const sx = PX(lx, ly), sy = PY(lx, ly); const gr = ctx.createRadialGradient(sx, sy, 0, sx, sy, HW * 2.4); gr.addColorStop(0, 'rgba(255,214,140,.2)'); gr.addColorStop(1, 'rgba(255,214,140,0)'); ctx.fillStyle = gr; ctx.fillRect(sx - HW * 2.4, sy - HW * 2.4, HW * 4.8, HW * 4.8); }
  }
  // chuva
  if (S.rain > 0.05) {
    const n = Math.floor(S.rain * 180);
    while (rainDrops.length < n) rainDrops.push([Math.random() * VW, Math.random() * VH, rnd(0.6, 1)]);
    rainDrops.length = n;
    ctx.strokeStyle = 'rgba(180,195,215,.42)'; ctx.lineWidth = 1; ctx.beginPath();
    for (const d of rainDrops) { d[1] += 14 * d[2]; d[0] -= 3 * d[2]; if (d[1] > VH) { d[1] = -10; d[0] = Math.random() * VW; } ctx.moveTo(d[0], d[1]); ctx.lineTo(d[0] + 3, d[1] - 12 * d[2]); }
    ctx.stroke();
    ctx.fillStyle = `rgba(40,50,60,${S.rain * 0.14})`; ctx.fillRect(0, 0, VW, VH);
  }
  // neblina
  if (S.fog > 0.05) {
    const g = ctx.createRadialGradient(VW / 2, VH / 2, HW * 3, VW / 2, VH / 2, Math.max(VW, VH) * 0.6);
    g.addColorStop(0, 'rgba(185,188,190,0)'); g.addColorStop(1, `rgba(185,188,190,${0.75 * S.fog})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
  }
  if (G.flash > 0) { ctx.fillStyle = `rgba(255,250,230,${Math.min(0.6, G.flash * 3)})`; ctx.fillRect(0, 0, VW, VH); }
  if (p.sleeping) { ctx.fillStyle = 'rgba(0,0,10,.55)'; ctx.fillRect(0, 0, VW, VH); }
  // textos flutuantes
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const f of G.floats) {
    ctx.globalAlpha = Math.max(0, 1 - f.t / 1.1);
    ctx.font = `700 ${Math.max(11, 13 * K)}px 'Roboto Condensed', 'Arial Narrow', sans-serif`; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.75)';
    const sx = PX(f.x, f.y), sy = PY(f.x, f.y, 1.9) - f.t * HZ * 0.8;
    ctx.strokeText(String(f.text), sx, sy); ctx.fillStyle = f.col; ctx.fillText(String(f.text), sx, sy);
  }
  ctx.globalAlpha = 1;
  // vinheta de dano
  if (p.hp < 35 || p.hitT > 0) {
    const a = p.hitT > 0 ? 0.45 : (35 - p.hp) / 60;
    const g = ctx.createRadialGradient(VW / 2, VH / 2, Math.min(VW, VH) * 0.3, VW / 2, VH / 2, Math.max(VW, VH) * 0.7);
    g.addColorStop(0, 'rgba(140,0,0,0)'); g.addColorStop(1, `rgba(140,0,0,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
  }
}
function updateFx(dt) {
  const lim = { fx: (f) => f.d, floats: () => 1.1, rings: () => 0.8 };
  for (const [k, f] of Object.entries(lim)) { const a = G[k]; for (let i = a.length - 1; i >= 0; i--) { a[i].t += dt; if (a[i].t >= f(a[i])) a.splice(i, 1); } }
  for (let i = G.tracers.length - 1; i >= 0; i--) { G.tracers[i].t -= dt; if (G.tracers[i].t <= 0) G.tracers.splice(i, 1); }
  G.flash = Math.max(0, G.flash - dt); G.shake = Math.max(0, G.shake - dt * 1.5);
}

/* ---------- mapa (visto de cima) ---------- */
function drawMap(canvas) {
  const g = canvas.getContext('2d'), sc = canvas.width / MAP_W;
  const img = g.createImageData(MAP_W, MAP_H);
  const MC = { [TL.GRASS]: [92, 104, 62], [TL.ROAD]: [82, 82, 80], [TL.WALK]: [140, 136, 126], [TL.DIRT]: [120, 98, 70], [TL.WATER]: [56, 96, 120], [TL.TREE]: [50, 70, 42], [TL.FLOOR]: [160, 146, 122], [TL.WALL]: [60, 55, 50], [TL.DOOR]: [120, 86, 56], [TL.WINDOW]: [130, 160, 175], [TL.FIELD]: [110, 92, 60], [TL.SAND]: [190, 176, 136], [TL.PARK]: [92, 92, 90], [TL.BURNT]: [40, 36, 33], [TL.RUBBLE]: [90, 85, 80], [TL.TILEF]: [160, 146, 122], [TL.BUSH]: [64, 90, 56] };
  for (let i = 0; i < MAP_W * MAP_H; i++) {
    const c = S.seen[i] ? (S.room[i] && S.tiles[i] === TL.FLOOR ? hexRgb(S.bld[S.room[i] - 1].roof) : MC[S.tiles[i]] || [0, 0, 0]) : [18, 19, 17];
    img.data[i * 4] = c[0]; img.data[i * 4 + 1] = c[1]; img.data[i * 4 + 2] = c[2]; img.data[i * 4 + 3] = 255;
  }
  const tmp = document.createElement('canvas'); tmp.width = MAP_W; tmp.height = MAP_H; tmp.getContext('2d').putImageData(img, 0, 0);
  g.imageSmoothingEnabled = false; g.drawImage(tmp, 0, 0, canvas.width, canvas.height);
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `${Math.max(9, sc * 5)}px sans-serif`;
  for (const B of S.bld) {
    if (B.t === 'casa' || B.t === 'abandonada' || !S.seen[ix(B.x + 1, B.y + 1)]) continue;
    const ic = { mercado: '🛒', posto: '⛽', hospital: '🏥', delegacia: '👮', oficina: '🔧', escola: '🏫', igreja: '⛪', fabrica: '🏭', fazenda: '🏡', celeiro: '🌾' }[B.t];
    if (ic) g.fillText(ic, (B.x + B.w / 2) * sc, (B.y + B.h / 2) * sc);
  }
  const p = S.player;
  if (S.base) { g.fillText('📍', S.base.x * sc, S.base.y * sc - 4); }
  for (const n of S.npcs) if (!n.dead && !n.away && (n.met || n.known) && S.seen[ix(Math.floor(n.x), Math.floor(n.y))]) { g.fillStyle = n.hostile ? '#e55' : '#ffd24a'; g.beginPath(); g.arc(n.x * sc, n.y * sc, 3, 0, 7); g.fill(); }
  const radioOn = p.inv.some((i) => i.k === 'radio' && i.c > 0);
  for (const h of S.hordes) if (h.cx && (h.known || radioOn)) { g.fillStyle = 'rgba(220,40,40,.5)'; g.beginPath(); g.arc(h.cx * sc, h.cy * sc, 8, 0, 7); g.fill(); }
  for (const v of S.vehs) if (p.inv.some((i) => i.k === 'chave_carro' && i.kid === v.id)) { g.fillText('🔑', v.x * sc, v.y * sc); }
  g.fillStyle = '#fff'; g.strokeStyle = '#000'; g.lineWidth = 2;
  g.beginPath(); g.arc(p.x * sc, p.y * sc, 4, 0, 7); g.fill(); g.stroke();
}
function hexRgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
