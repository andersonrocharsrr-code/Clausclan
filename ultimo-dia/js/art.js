/* Último Dia — arte: terreno, pisos, paredes, móveis, telhados, árvores, postes, veículos e pessoas.
   Tudo desenhado com Canvas 2D em unidades de tile (TILE = 32), sem imagens externas. */
'use strict';

const T = TILE;
function hash(x, y) { let h = (x * 374761393 + y * 668265263) ^ (S.seed | 0); h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
const hk = (x, y, k) => hash(x * 31 + k * 977, y * 17 + k * 541);
const rgbCache = {};
function rgbOf(hex) { return rgbCache[hex] || (rgbCache[hex] = [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]); }
function mixc(a, b, t) { const A = rgbOf(a), B = rgbOf(b); t = clamp(t, 0, 1); return `rgb(${(A[0] + (B[0] - A[0]) * t) | 0},${(A[1] + (B[1] - A[1]) * t) | 0},${(A[2] + (B[2] - A[2]) * t) | 0})`; }
const shadeCache = new Map();
function shade(hex, f) {
  const key = hex + f; let out = shadeCache.get(key); if (out) return out;
  if (hex[0] !== '#') return hex;
  const [r0, g0, b0] = rgbOf(hex); let r = r0, gg = g0, b = b0;
  if (f < 0) { r *= 1 + f; gg *= 1 + f; b *= 1 + f; } else { r += (255 - r) * f; gg += (255 - gg) * f; b += (255 - b) * f; }
  out = `rgb(${r | 0},${gg | 0},${b | 0})`;
  if (shadeCache.size < 4000) shadeCache.set(key, out);
  return out;
}
// ruído suave (varia devagar de um tile para o outro, sem costuras)
function blob(x, y) {
  const s = (S.seed % 997) * 0.013;
  return 0.5 + 0.25 * Math.sin(x * 0.23 + s) * Math.cos(y * 0.19 - s) + 0.25 * Math.sin((x - y) * 0.11 + s * 2);
}
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function circ(g, x, y, r) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
const RLS = [30, 50, 70, 90, 110];
const onRoadLine = (v) => RLS.some((r) => v === r || v === r + 1);
const inTown = (x, y) => x >= 30 && x < 112 && y >= 30 && y < 112;
const isWallish = (x, y) => { const t = tileAt(x, y); return t === TL.WALL || t === TL.WINDOW || t === TL.DOOR; };
const N4 = [[0, -1], [1, 0], [0, 1], [-1, 0]];

/* ---------- postes de luz ---------- */
function isLamp(x, y) {
  if (tileAt(x, y) !== TL.WALK) return false;
  if (tileAt(x, y - 1) === TL.ROAD || tileAt(x, y + 1) === TL.ROAD) return x % 6 === 2;
  if (tileAt(x - 1, y) === TL.ROAD || tileAt(x + 1, y) === TL.ROAD) return y % 6 === 2;
  return false;
}
G.lampKey = -1; G.lampMap = null;
function lampMap() {
  if (G.lampKey !== S.seed) { G.lampKey = S.seed; G.lampMap = new Uint8Array(MAP_W * MAP_H); for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) if (isLamp(x, y)) G.lampMap[ix(x, y)] = 1; }
  return G.lampMap;
}

/* ---------- prédios: paredes e pisos ---------- */
const HOUSE_WALLS = ['#d9cdb8', '#c7d3c0', '#e0c7a6', '#b9c7d4', '#d8b8ae', '#e6dfcf', '#c9b9d0'];
function wallCol(B) {
  if (!B.wc) B.wc = { casa: HOUSE_WALLS[Math.floor(hk(B.x, B.y, 3) * HOUSE_WALLS.length)], abandonada: '#9c9384', fazenda: '#e3d6bd', celeiro: '#a3402f', igreja: '#efe9dc', hospital: '#e7ebea', delegacia: '#c9c4b6', mercado: '#d6d0c3', posto: '#dedbd3', escola: '#d9b98a', oficina: '#aaa59b', fabrica: '#8f918c' }[B.t] || '#bbb';
  return B.wc;
}
const FLOOR = { casa: 'wood', abandonada: 'wood', fazenda: 'wood', igreja: 'wood', escola: 'wood', mercado: 'tile', posto: 'tile', hospital: 'tile', delegacia: 'tile', oficina: 'concrete', fabrica: 'concrete', celeiro: 'dirt' };
const FLOOR_COL = { casa: ['#a8825b', '#bf9a6e'], abandonada: ['#7d6a52', '#8f7a5f'], fazenda: ['#a0774d', '#b88d5f'], igreja: ['#8f5f3e', '#a8714a'], escola: ['#c4a273', '#d6b789'], mercado: ['#d9d6cd', '#cfcbc0'], posto: ['#dcd8cf', '#cdc8bd'], hospital: ['#e2ebea', '#d3dfde'], delegacia: ['#c2c8cc', '#b3babf'], oficina: ['#9c9d98', '#8e8f8a'], fabrica: ['#93958f', '#868883'], celeiro: ['#8a6c47', '#7d603e'] };
function drawFloor(g, x, y, px, py) {
  const b = bldAt(x, y), B = b >= 0 ? S.bld[b] : null, t = B ? B.t : 'casa';
  const kind = FLOOR[t] || 'wood', [c1, c2] = FLOOR_COL[t] || FLOOR_COL.casa;
  if (kind === 'wood') {
    for (let r = 0; r < 4; r++) {
      const h = hk(x, y * 4 + r, 1);
      g.fillStyle = mixc(c1, c2, h); g.fillRect(px, py + r * 8, T, 8);
      g.fillStyle = 'rgba(0,0,0,.16)'; g.fillRect(px, py + r * 8 + 7, T, 1);
      const j = Math.floor(hk(x, y * 4 + r, 2) * 30); g.fillRect(px + j, py + r * 8, 1, 7);
      g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(px, py + r * 8, T, 1);
    }
  } else if (kind === 'tile') {
    for (let a = 0; a < 2; a++) for (let c = 0; c < 2; c++) { g.fillStyle = (a + c + x + y) % 2 ? c1 : c2; g.fillRect(px + a * 16, py + c * 16, 16, 16); }
    g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(px, py, T, 1); g.fillRect(px, py + 16, T, 1); g.fillRect(px, py, 1, T); g.fillRect(px + 16, py, 1, T);
  } else if (kind === 'concrete') {
    g.fillStyle = mixc(c1, c2, blob(x * 1.7, y * 1.7)); g.fillRect(px, py, T, T);
    if (hk(x, y, 3) < 0.25) { g.fillStyle = 'rgba(40,30,20,.18)'; g.beginPath(); g.ellipse(px + 8 + hk(x, y, 4) * 16, py + 10 + hk(x, y, 5) * 12, 7, 4, hk(x, y, 6) * 3, 0, 7); g.fill(); }
    g.fillStyle = 'rgba(0,0,0,.07)'; if (x % 3 === 0) g.fillRect(px, py, 1, T); if (y % 3 === 0) g.fillRect(px, py, T, 1);
  } else {
    g.fillStyle = mixc(c1, c2, hk(x, y, 1)); g.fillRect(px, py, T, T);
    g.strokeStyle = 'rgba(220,190,90,.55)'; g.lineWidth = 1; g.beginPath();
    for (let k = 0; k < 6; k++) { const a = px + hk(x, y, k + 10) * 28, b2 = py + hk(x, y, k + 20) * 28, an = hk(x, y, k + 30) * 3; g.moveTo(a, b2); g.lineTo(a + Math.cos(an) * 6, b2 + Math.sin(an) * 6); }
    g.stroke();
  }
  if (t === 'abandonada') {
    if (hk(x, y, 7) < 0.4) { g.fillStyle = 'rgba(50,35,20,.3)'; g.beginPath(); g.ellipse(px + 6 + hk(x, y, 8) * 20, py + 6 + hk(x, y, 9) * 20, 9, 5, hk(x, y, 10) * 3, 0, 7); g.fill(); }
    if (hk(x, y, 11) < 0.25) { g.fillStyle = '#5a4a3a'; g.fillRect(px + hk(x, y, 12) * 24, py + hk(x, y, 13) * 24, 6, 2); g.fillRect(px + hk(x, y, 14) * 26, py + hk(x, y, 15) * 26, 3, 3); }
  }
  // sombra junto às paredes (oclusão)
  for (const [dx, dy] of N4) {
    if (!isWallish(x + dx, y + dy)) continue;
    const gr = dx ? g.createLinearGradient(dx > 0 ? px + T : px, 0, dx > 0 ? px + T - 7 : px + 7, 0) : g.createLinearGradient(0, dy > 0 ? py + T : py, 0, dy > 0 ? py + T - 7 : py + 7);
    gr.addColorStop(0, 'rgba(0,0,0,.28)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(px, py, T, T);
  }
}
function drawWallTile(g, x, y, px, py) {
  const b = bldAt(x, y), B = b >= 0 ? S.bld[b] : null, c = B ? wallCol(B) : '#aaa';
  g.fillStyle = c; g.fillRect(px, py, T, T);
  if (B && (B.t === 'casa' || B.t === 'fazenda' || B.t === 'abandonada')) { g.fillStyle = 'rgba(0,0,0,.07)'; for (let k = 5; k < T; k += 6) g.fillRect(px, py + k, T, 1); }
  else if (B && B.t === 'celeiro') { g.fillStyle = 'rgba(0,0,0,.14)'; for (let k = 4; k < T; k += 6) g.fillRect(px + k, py, 1, T); }
  else { g.fillStyle = 'rgba(0,0,0,.06)'; g.fillRect(px + (y % 2) * 16, py + 15, 1, 16); g.fillRect(px, py + 15, T, 1); }
  g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(px, py, T, 2); g.fillRect(px, py, 2, T);
  g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(px, py + T - 2, T, 2); g.fillRect(px + T - 2, py, 2, T);
  // contorno do lado de fora
  g.fillStyle = 'rgba(30,25,20,.55)';
  for (const [dx, dy] of N4) {
    const nb = bldAt(x + dx, y + dy);
    if (nb >= 0) continue;
    if (dy < 0) g.fillRect(px, py, T, 2); if (dy > 0) g.fillRect(px, py + T - 2, T, 2);
    if (dx < 0) g.fillRect(px, py, 2, T); if (dx > 0) g.fillRect(px + T - 2, py, 2, T);
  }
}
function drawPlanks(g, px, py, n, horiz) {
  for (let k = 0; k < n; k++) {
    g.save(); g.translate(px + 16, py + 16); g.rotate((horiz ? 0 : Math.PI / 2) + (k - 1) * 0.32);
    g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(-17, -2.5, 34, 7);
    g.fillStyle = k % 2 ? '#a77a45' : '#b88b52'; g.fillRect(-17, -3.5, 34, 7);
    g.fillStyle = 'rgba(80,50,20,.35)'; g.fillRect(-17, -1, 34, 1);
    g.fillStyle = '#4a4a4a'; g.fillRect(-14, -1.2, 2, 2); g.fillRect(12, -1.2, 2, 2);
    g.restore();
  }
}
function drawWindow(g, x, y, px, py) {
  drawWallTile(g, x, y, px, py);
  const s = S.ts[ix(x, y)] || {};
  const horiz = isWallish(x - 1, y) || isWallish(x + 1, y);
  const [fx, fy, fw, fh] = horiz ? [px + 3, py + 9, T - 6, 14] : [px + 9, py + 3, 14, T - 6];
  g.fillStyle = '#efece4'; g.fillRect(fx, fy, fw, fh);
  const [gx, gy, gw, gh] = [fx + 2, fy + 2, fw - 4, fh - 4];
  if (s.broken || s.open) {
    g.fillStyle = '#2a2723'; g.fillRect(gx, gy, gw, gh);
    if (s.open && !s.broken) { g.fillStyle = 'rgba(160,205,230,.8)'; if (horiz) g.fillRect(gx, gy, gw / 2, gh); else g.fillRect(gx, gy, gw, gh / 2); }
    if (s.glass) { g.fillStyle = 'rgba(200,230,245,.85)'; g.beginPath(); g.moveTo(gx, gy); g.lineTo(gx + 5, gy); g.lineTo(gx, gy + 5); g.fill(); g.beginPath(); g.moveTo(gx + gw, gy + gh); g.lineTo(gx + gw - 6, gy + gh); g.lineTo(gx + gw, gy + gh - 4); g.fill(); }
  } else {
    const gr = g.createLinearGradient(gx, gy, gx + gw, gy + gh); gr.addColorStop(0, '#b9dcef'); gr.addColorStop(1, '#6c9fbf');
    g.fillStyle = gr; g.fillRect(gx, gy, gw, gh);
    g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath();
    if (horiz) { g.moveTo(gx + 4, gy + gh); g.lineTo(gx + 8, gy); g.lineTo(gx + 11, gy); g.lineTo(gx + 7, gy + gh); } else { g.moveTo(gx, gy + 8); g.lineTo(gx + gw, gy + 4); g.lineTo(gx + gw, gy + 7); g.lineTo(gx, gy + 11); }
    g.fill();
    g.fillStyle = '#efece4'; if (horiz) g.fillRect(gx + gw / 2 - 1, gy, 2, gh); else g.fillRect(gx, gy + gh / 2 - 1, gw, 2);
  }
  if (s.bar) drawPlanks(g, px, py, s.bar, horiz);
}
function drawDoor(g, x, y, px, py) {
  drawFloor(g, x, y, px, py);
  const s = S.ts[ix(x, y)] || {};
  const horiz = isWallish(x - 1, y) || isWallish(x + 1, y);
  g.save(); g.translate(px + 16, py + 16); if (!horiz) g.rotate(Math.PI / 2);
  // batentes
  g.fillStyle = '#5a4532'; g.fillRect(-16, -6, 3, 12); g.fillRect(13, -6, 3, 12);
  if (s.broken) {
    g.fillStyle = '#6b4a2c'; g.save(); g.rotate(0.5); g.fillRect(-12, -2, 10, 4); g.restore(); g.save(); g.rotate(-0.3); g.fillRect(2, 3, 11, 3); g.restore();
  } else if (s.open) {
    g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(-12, -14, 5, 26);
    g.fillStyle = '#8a5a32'; g.fillRect(-13, -15, 4, 26);
  } else {
    g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(-13, -3, 27, 8);
    g.fillStyle = '#8a5a32'; g.fillRect(-13, -4, 26, 8);
    g.fillStyle = '#9c6a3d'; g.fillRect(-11, -3, 10, 6); g.fillRect(1, -3, 10, 6);
    g.fillStyle = '#e0c060'; circ(g, 9, 0, 1.6);
  }
  g.restore();
  if (s.bar) drawPlanks(g, px, py, s.bar, horiz);
}

/* ---------- terreno ---------- */
// grama contínua: a cor vem de um ruído suave avaliado em 4x4 pontos por tile, então não há borda entre tiles
function grassNoise(x, y) { return blob(x, y) * 0.6 + blob(x * 2.7 + 13.1, y * 2.7 + 7.3) * 0.4; }
function dryNoise(x, y) { return blob(x * 0.6 + 41.7, y * 0.6 + 19.3); }
function grassCol(x, y) {
  const n = grassNoise(x, y), d = clamp((dryNoise(x, y) - 0.55) * 3, 0, 1);
  const base = mixRgb(rgbOf('#58623a'), rgbOf('#747b48'), n);
  return mixRgb(base, rgbOf('#857e4c'), d * 0.55);
}
function mixRgb(a, b, t) { t = clamp(t, 0, 1); return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
const rgbStr = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const GROUND_EDGE = { [TL.DIRT]: '#7d6142', [TL.SAND]: '#d2bf8a', [TL.FIELD]: '#6e5236', [TL.BURNT]: '#2b2825' };
function drawGrass(g, x, y, px, py) {
  for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) {
    g.fillStyle = rgbStr(grassCol(x + (i + 0.5) / 4, y + (j + 0.5) / 4));
    g.fillRect(px + i * 8 - 0.3, py + j * 8 - 0.3, 8.6, 8.6);
  }
  // terra, areia e plantação vizinhas invadem a grama com borda suave e irregular
  for (const [dx, dy] of N4) {
    const c = GROUND_EDGE[tileAt(x + dx, y + dy)]; if (!c) continue;
    const gr = dx ? g.createLinearGradient(dx > 0 ? px + T : px, 0, dx > 0 ? px + T - 13 : px + 13, 0) : g.createLinearGradient(0, dy > 0 ? py + T : py, 0, dy > 0 ? py + T - 13 : py + 13);
    gr.addColorStop(0, rgbStr(rgbOf(c), 0.85)); gr.addColorStop(0.5, rgbStr(rgbOf(c), 0.3)); gr.addColorStop(1, rgbStr(rgbOf(c), 0));
    g.fillStyle = gr; g.fillRect(px, py, T, T);
  }
  // tufos e folhinhas (podem passar da borda do tile)
  for (let k = 0; k < 9; k++) {
    const a = px + hk(x, y, k + 5) * 32, b = py + hk(x, y, k + 15) * 32;
    g.fillStyle = k % 3 ? 'rgba(38,48,22,.32)' : 'rgba(178,176,112,.28)';
    g.fillRect(a, b, 1, 3); g.fillRect(a + 1.5, b - 1, 1, 3); g.fillRect(a - 1.2, b + 0.5, 1, 2.5);
  }
  if (hk(x, y, 30) < 0.03) { g.fillStyle = ['#e8d870', '#ecece4', '#c878a0'][Math.floor(hk(x, y, 31) * 3)]; for (let k = 0; k < 3; k++) circ(g, px + 6 + hk(x, y, 32 + k) * 20, py + 6 + hk(x, y, 40 + k) * 20, 1.3); }
}
// terra solta no meio da grama vira uma mancha redonda, não um quadrado
function drawDirtPatch(g, x, y, px, py) {
  drawGrass(g, x, y, px, py);
  const cx = px + 16 + (hk(x, y, 3) - 0.5) * 8, cy = py + 16 + (hk(x, y, 4) - 0.5) * 8, r = 11 + hk(x, y, 5) * 6;
  const gr = g.createRadialGradient(cx, cy, 2, cx, cy, r);
  gr.addColorStop(0, 'rgba(122,94,62,.85)'); gr.addColorStop(0.6, 'rgba(122,94,62,.5)'); gr.addColorStop(1, 'rgba(122,94,62,0)');
  g.fillStyle = gr; g.beginPath(); g.ellipse(cx, cy, r, r * (0.7 + hk(x, y, 6) * 0.3), hk(x, y, 7) * 3, 0, 7); g.fill();
  for (let k = 0; k < 4; k++) { g.fillStyle = 'rgba(70,50,30,.45)'; circ(g, cx + (hk(x, y, k + 9) - 0.5) * r, cy + (hk(x, y, k + 19) - 0.5) * r, 1.2); }
}
function drawRoad(g, x, y, px, py) {
  g.fillStyle = mixc('#35383b', '#45484b', hk(x, y, 1) * 0.4 + blob(x * 2, y * 2) * 0.6); g.fillRect(px, py, T, T);
  for (let k = 0; k < 10; k++) { g.fillStyle = k % 2 ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.18)'; g.fillRect(px + hk(x, y, k + 3) * 31, py + hk(x, y, k + 13) * 31, 1, 1); }
  const r = (a, b) => tileAt(a, b) === TL.ROAD;
  if (hk(x, y, 23) < 0.06) { g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1; g.beginPath(); let a = px + hk(x, y, 24) * 30, b = py + 2; g.moveTo(a, b); for (let k = 0; k < 4; k++) { a += (hk(x, y, 25 + k) - 0.5) * 10; b += 7; g.lineTo(a, b); } g.stroke(); }
  if (hk(x, y, 29) < 0.05) { g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(px + 16, py + 16, 9, 5, hk(x, y, 30) * 3, 0, 7); g.fill(); }
  const town = inTown(x, y);
  const cross = town && ((onRoadLine(x) && !onRoadLine(y) && (onRoadLine(y + 1) || onRoadLine(y - 1))) || (onRoadLine(y) && !onRoadLine(x) && (onRoadLine(x + 1) || onRoadLine(x - 1))));
  if (cross) {
    g.fillStyle = 'rgba(235,235,225,.85)';
    if (onRoadLine(x)) for (let k = 2; k < T; k += 8) g.fillRect(px + k, py + 3, 4, T - 6);
    else for (let k = 2; k < T; k += 8) g.fillRect(px + 3, py + k, T - 6, 4);
    return;
  }
  g.fillStyle = '#d6b444';
  if (r(x, y - 1) && !r(x, y - 2) && !r(x, y + 1) && r(x - 1, y) && r(x + 1, y) && x % 2 === 0) g.fillRect(px + 4, py - 1, 16, 2);
  if (r(x - 1, y) && !r(x - 2, y) && !r(x + 1, y) && r(x, y - 1) && r(x, y + 1) && y % 2 === 0) g.fillRect(px - 1, py + 4, 2, 16);
  if (!town) { // faixas brancas nas bordas da rodovia
    g.fillStyle = 'rgba(230,230,220,.7)';
    if (!r(x, y - 1) && r(x - 1, y) && r(x + 1, y)) g.fillRect(px, py + 2, T, 2);
    if (!r(x, y + 1) && r(x - 1, y) && r(x + 1, y)) g.fillRect(px, py + T - 4, T, 2);
    if (!r(x - 1, y) && r(x, y - 1) && r(x, y + 1)) g.fillRect(px + 2, py, 2, T);
    if (!r(x + 1, y) && r(x, y - 1) && r(x, y + 1)) g.fillRect(px + T - 4, py, 2, T);
  }
  if (town && hk(x, y, 31) < 0.012) { g.fillStyle = '#2b2d2f'; circ(g, px + 16, py + 16, 6); g.strokeStyle = '#55585a'; g.lineWidth = 1.5; g.beginPath(); g.arc(px + 16, py + 16, 6, 0, 7); g.stroke(); }
}
function drawWalk(g, x, y, px, py) {
  g.fillStyle = mixc('#9d9c95', '#adaca4', hk(x, y, 1)); g.fillRect(px, py, T, T);
  for (let a = 0; a < 2; a++) for (let c = 0; c < 2; c++) if (hk(x * 2 + a, y * 2 + c, 2) < 0.25) { g.fillStyle = 'rgba(0,0,0,.06)'; g.fillRect(px + a * 16, py + c * 16, 16, 16); }
  g.fillStyle = 'rgba(0,0,0,.14)'; g.fillRect(px, py, T, 1); g.fillRect(px, py, 1, T); g.fillRect(px, py + 16, T, 1); g.fillRect(px + 16, py, 1, T);
  // meio-fio
  for (const [dx, dy] of N4) {
    if (tileAt(x + dx, y + dy) !== TL.ROAD) continue;
    g.fillStyle = '#c8c7bf';
    if (dy < 0) g.fillRect(px, py, T, 4); if (dy > 0) g.fillRect(px, py + T - 4, T, 4);
    if (dx < 0) g.fillRect(px, py, 4, T); if (dx > 0) g.fillRect(px + T - 4, py, 4, T);
    g.fillStyle = 'rgba(0,0,0,.35)';
    if (dy < 0) g.fillRect(px, py, T, 1); if (dy > 0) g.fillRect(px, py + T - 1, T, 1);
    if (dx < 0) g.fillRect(px, py, 1, T); if (dx > 0) g.fillRect(px + T - 1, py, 1, T);
  }
  if (!isLamp(x, y) && hk(x, y, 9) < 0.025 && N4.some(([dx, dy]) => tileAt(x + dx, y + dy) === TL.ROAD)) {
    g.fillStyle = 'rgba(0,0,0,.3)'; circ(g, px + 17, py + 18, 5);
    g.fillStyle = '#c0362a'; circ(g, px + 16, py + 16, 5); g.fillStyle = '#e05a48'; circ(g, px + 15, py + 15, 2.5); g.fillStyle = '#8a2a20'; g.fillRect(px + 10, py + 15, 12, 2);
  }
}
function drawLampPost(g, x, y, px, py) {
  let dx = 0, dy = 0; for (const [a, b] of N4) if (tileAt(x + a, y + b) === TL.ROAD) { dx = a; dy = b; }
  const cx = px + 16 - dx * 8, cy = py + 16 - dy * 8;
  g.fillStyle = 'rgba(0,0,0,.3)'; circ(g, cx + 2, cy + 2, 4);
  g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 3; g.beginPath(); g.moveTo(cx + 3, cy + 3); g.lineTo(cx + dx * 20 + 3, cy + dy * 20 + 3); g.stroke();
  g.strokeStyle = '#4a4e52'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + dx * 20, cy + dy * 20); g.stroke();
  g.fillStyle = '#5a5f63'; circ(g, cx, cy, 3.5);
  g.fillStyle = '#3d4246'; rr(g, cx + dx * 20 - 4, cy + dy * 20 - 4, 8, 8, 2); g.fill();
  g.fillStyle = '#f2e6b0'; circ(g, cx + dx * 20, cy + dy * 20, 2.2);
}
function drawWater(g, x, y, px, py) {
  let shore = 0; for (let a = -2; a <= 2; a++) for (let b = -2; b <= 2; b++) if (tileAt(x + a, y + b) !== TL.WATER) shore++;
  g.fillStyle = mixc('#245f88', '#4b8fb4', shore / 10); g.fillRect(px, py, T, T);
  g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(px + hk(x, y, 1) * 20, py + 6 + hk(x, y, 2) * 18, 10, 1.5);
  for (const [dx, dy] of N4) {
    if (tileAt(x + dx, y + dy) === TL.WATER) continue;
    g.fillStyle = 'rgba(225,240,250,.55)';
    if (dy < 0) g.fillRect(px, py, T, 3); if (dy > 0) g.fillRect(px, py + T - 3, T, 3);
    if (dx < 0) g.fillRect(px, py, 3, T); if (dx > 0) g.fillRect(px + T - 3, py, 3, T);
  }
}
function drawField(g, x, y, px, py) {
  g.fillStyle = mixc('#6a4e32', '#7a5a3a', hk(x, y, 1)); g.fillRect(px, py, T, T);
  g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(px, py + 7, T, 3); g.fillRect(px, py + 23, T, 3);
  g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(px, py + 5, T, 1); g.fillRect(px, py + 21, T, 1);
  const s = S.ts[ix(x, y)]; const cut = s && s.f && S.time - s.f < 5 * 1440;
  for (const [a, b] of [[7, 6], [21, 6], [13, 22], [27, 22]]) {
    const cx = px + a, cy = py + b;
    g.strokeStyle = cut ? '#8a8a3a' : '#4f8f34'; g.lineWidth = 1.6; g.beginPath();
    const L = cut ? 3 : 7;
    for (let k = 0; k < 4; k++) { const an = k * 1.57 + hk(x, y, a + k) * 0.6; g.moveTo(cx, cy); g.lineTo(cx + Math.cos(an) * L, cy + Math.sin(an) * L); }
    g.stroke();
    if (!cut) { g.fillStyle = '#e2c24a'; g.beginPath(); g.ellipse(cx + 2, cy + 1, 1.8, 3.2, 0.5, 0, 7); g.fill(); }
  }
}
function drawBush(g, x, y, px, py) { drawGrass(g, x, y, px, py); }
function drawTreeBase(g, x, y, px, py) {
  drawGrass(g, x, y, px, py);
  // folhas caídas embaixo da copa
  for (let k = 0; k < 6; k++) { g.fillStyle = k % 2 ? 'rgba(90,72,40,.35)' : 'rgba(60,70,34,.35)'; g.fillRect(px + 4 + hk(x, y, k + 50) * 24, py + 4 + hk(x, y, k + 60) * 24, 3, 2); }
}
// sombra que os prédios projetam (sol a noroeste)
function groundShadow(g, x, y, px, py) {
  const wb = (a, b) => S.room[ix(a, b)] > 0 && isWallish(a, b);
  const W = inb(x - 1, y) && wb(x - 1, y), N = inb(x, y - 1) && wb(x, y - 1), NW = inb(x - 1, y - 1) && wb(x - 1, y - 1);
  if (!W && !N && !NW) return;
  g.fillStyle = 'rgba(10,20,10,.28)';
  if (W) g.fillRect(px, py, 9, T); if (N) g.fillRect(px + (W ? 9 : 0), py, T - (W ? 9 : 0), 9);
  if (NW && !W && !N) g.fillRect(px, py, 9, 9);
}
function drawTile(g, x, y, px, py) {
  const t = S.tiles[ix(x, y)];
  switch (t) {
    case TL.GRASS: drawGrass(g, x, y, px, py); break;
    case TL.TREE: drawTreeBase(g, x, y, px, py); break;
    case TL.BUSH: drawBush(g, x, y, px, py); break;
    case TL.ROAD: drawRoad(g, x, y, px, py); break;
    case TL.WALK: drawWalk(g, x, y, px, py); break;
    case TL.PARK:
      g.fillStyle = mixc('#45484b', '#515457', hk(x, y, 1)); g.fillRect(px, py, T, T);
      for (let k = 0; k < 6; k++) { g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(px + hk(x, y, k + 2) * 31, py + hk(x, y, k + 8) * 31, 1, 1); }
      if (x % 3 === 0) { g.fillStyle = 'rgba(240,240,230,.75)'; g.fillRect(px, py + 2, 2, 18); }
      break;
    case TL.WATER: drawWater(g, x, y, px, py); break;
    case TL.FIELD: drawField(g, x, y, px, py); break;
    case TL.SAND:
      g.fillStyle = mixc('#cfbb84', '#ddca96', hk(x, y, 1)); g.fillRect(px, py, T, T);
      g.strokeStyle = 'rgba(150,120,70,.25)'; g.lineWidth = 1; g.beginPath(); g.arc(px + 10, py + 30, 10, 4.2, 5.2); g.arc(px + 26, py + 14, 9, 4.2, 5.2); g.stroke();
      break;
    case TL.DIRT: {
      if (!N4.some(([dx, dy]) => tileAt(x + dx, y + dy) === TL.DIRT)) { drawDirtPatch(g, x, y, px, py); break; }
      g.fillStyle = mixc('#7a5d3e', '#8d6e4a', hk(x, y, 1) * 0.5 + blob(x, y) * 0.5); g.fillRect(px, py, T, T);
      for (let k = 0; k < 5; k++) { g.fillStyle = k % 2 ? 'rgba(60,40,20,.4)' : 'rgba(200,170,120,.3)'; circ(g, px + hk(x, y, k + 2) * 30, py + hk(x, y, k + 9) * 30, 1.3); }
      const h = tileAt(x - 1, y) === TL.DIRT || tileAt(x + 1, y) === TL.DIRT, v = tileAt(x, y - 1) === TL.DIRT || tileAt(x, y + 1) === TL.DIRT;
      g.fillStyle = 'rgba(50,35,20,.22)';
      if (h && !v) { g.fillRect(px, py + 9, T, 3); g.fillRect(px, py + 21, T, 3); } else if (v && !h) { g.fillRect(px + 9, py, 3, T); g.fillRect(px + 21, py, 3, T); }
      break;
    }
    case TL.BURNT:
      g.fillStyle = mixc('#25221f', '#33302c', hk(x, y, 1)); g.fillRect(px, py, T, T);
      for (let k = 0; k < 5; k++) { g.fillStyle = k % 2 ? 'rgba(120,115,105,.35)' : 'rgba(0,0,0,.4)'; circ(g, px + hk(x, y, k + 2) * 30, py + hk(x, y, k + 9) * 30, 1.5 + hk(x, y, k + 20) * 2); }
      break;
    case TL.RUBBLE:
      g.fillStyle = '#5c5751'; g.fillRect(px, py, T, T);
      for (let k = 0; k < 6; k++) { g.fillStyle = k % 2 ? '#7a746c' : '#3e3a36'; g.save(); g.translate(px + hk(x, y, k + 2) * 28 + 2, py + hk(x, y, k + 9) * 28 + 2); g.rotate(hk(x, y, k) * 3); g.fillRect(-4, -3, 8, 6); g.restore(); }
      break;
    case TL.FLOOR: case TL.TILEF: drawFloor(g, x, y, px, py); break;
    case TL.WALL: drawWallTile(g, x, y, px, py); break;
    case TL.DOOR: drawDoor(g, x, y, px, py); break;
    case TL.WINDOW: drawWindow(g, x, y, px, py); break;
  }
  if (S.room[ix(x, y)] === 0 && t !== TL.WATER) groundShadow(g, x, y, px, py);
}

/* ---------- móveis e construções ---------- */
const BLANKETS = ['#c0504d', '#4f81bd', '#9bbb59', '#8064a2', '#e3a23a', '#4bacc6'];
const PRODUCTS = ['#d9534f', '#f0ad4e', '#5bc0de', '#5cb85c', '#e8e8e0', '#9b59b6', '#f7d358'];
function wallSide(x, y) { // lado (ângulo) da parede mais próxima: os móveis encostam nela
  if (isWallish(x, y - 1)) return 0; if (isWallish(x + 1, y)) return Math.PI / 2; if (isWallish(x, y + 1)) return Math.PI; if (isWallish(x - 1, y)) return -Math.PI / 2;
  return 0;
}
function shadowBox(g, x, y, w, h, r = 2) { if (NOSHADOW) return; g.fillStyle = 'rgba(0,0,0,.28)'; rr(g, x + 2, y + 3, w, h, r); g.fill(); }
function box(g, x, y, w, h, c, r = 2) { shadowBox(g, x, y, w, h, r); g.fillStyle = c; rr(g, x, y, w, h, r); g.fill(); g.fillStyle = 'rgba(255,255,255,.16)'; g.fillRect(x + 1, y + 1, w - 2, 2); g.fillStyle = 'rgba(0,0,0,.14)'; g.fillRect(x + 1, y + h - 2, w - 2, 2); }
const FURN_ART = {
  geladeira(g) { box(g, -11, -14, 22, 24, '#e8edf0'); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(-11, -3, 22, 1); g.fillStyle = '#9aa4aa'; g.fillRect(7, -11, 2, 6); g.fillRect(7, 0, 2, 7); },
  armario(g, h) { box(g, -15, -15, 30, 20, '#9a7048'); g.fillStyle = '#d8d2c4'; g.fillRect(-15, -15, 30, 9); g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(0, -6, 1, 11); g.fillStyle = '#d8c070'; g.fillRect(-3, 0, 2, 2); g.fillRect(2, 0, 2, 2); if (h > 0.5) { g.fillStyle = '#c0504d'; circ(g, -8, -11, 2.5); } },
  fogao(g) { box(g, -13, -15, 26, 24, '#c9cdd1'); g.fillStyle = '#2a2c2e'; for (const [a, b] of [[-6, -9], [6, -9], [-6, 1], [6, 1]]) { circ(g, a, b, 4); g.fillStyle = '#555'; circ(g, a, b, 2); g.fillStyle = '#2a2c2e'; } },
  pia(g) { box(g, -15, -15, 30, 20, '#d8dcdf'); g.fillStyle = '#9fb0ba'; rr(g, -9, -11, 18, 12, 4); g.fill(); g.fillStyle = '#7f909a'; rr(g, -7, -9, 14, 8, 3); g.fill(); g.fillStyle = '#b8bec2'; g.fillRect(-1, -15, 2, 5); },
  cama(g, h) {
    box(g, -12, -15, 24, 30, '#7a5534', 3); g.fillStyle = '#f1efe8'; g.fillRect(-10, -13, 20, 26);
    g.fillStyle = '#ffffff'; rr(g, -8, -12, 16, 6, 2); g.fill();
    const c = BLANKETS[Math.floor(h * BLANKETS.length)]; g.fillStyle = c; g.fillRect(-10, -3, 20, 16); g.fillStyle = shade(c, 0.25); g.fillRect(-10, -3, 20, 3); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(-2, 0, 1, 13);
  },
  sofa(g, h) {
    const c = ['#8b4a3d', '#4a5a7a', '#5a6b4a', '#7a6a5a'][Math.floor(h * 4)];
    box(g, -15, -12, 30, 22, shade(c, -0.15), 4); g.fillStyle = c; g.fillRect(-15, -12, 30, 7); g.fillRect(-15, -12, 5, 22); g.fillRect(10, -12, 5, 22);
    g.fillStyle = shade(c, 0.15); g.fillRect(-10, -5, 9.5, 13); g.fillRect(0.5, -5, 9.5, 13); g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(-0.5, -5, 1, 13);
  },
  guarda_roupa(g) { box(g, -15, -15, 30, 17, '#6f4a2e'); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(-0.5, -15, 1, 17); g.fillStyle = '#d8c070'; g.fillRect(-4, -7, 2, 3); g.fillRect(2, -7, 2, 3); g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(-13, -13, 11, 13); g.fillRect(2, -13, 11, 13); },
  estante(g, h) { box(g, -15, -15, 30, 12, '#7a5236'); for (let k = 0; k < 9; k++) { g.fillStyle = PRODUCTS[Math.floor(hk(k, h * 100, 1) * PRODUCTS.length)]; g.fillRect(-13 + k * 3, -14, 2.4, 9); } },
  banheiro(g) { // vaso sanitário + armarinho
    shadowBox(g, -7, -15, 14, 7); g.fillStyle = '#f2f4f5'; rr(g, -7, -15, 14, 7, 2); g.fill();
    g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(1, 1, 8, 10, 0, 0, 7); g.fill(); g.fillStyle = '#f7f9fa'; g.beginPath(); g.ellipse(0, 0, 8, 10, 0, 0, 7); g.fill();
    g.fillStyle = '#c7d6dd'; g.beginPath(); g.ellipse(0, 1, 5, 7, 0, 0, 7); g.fill();
  },
  mesa(g, h) {
    g.fillStyle = '#6b4a30'; for (const [a, b] of [[-14, -4], [10, -4], [-4, -15], [-4, 10]]) { shadowBox(g, a, b, 5, 8); g.fillRect(a, b, a === -4 ? 8 : 4, a === -4 ? 4 : 8); }
    box(g, -10, -10, 20, 20, '#a87a4f', 3); g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(-8, -3, 16, 1); if (h > 0.6) { g.fillStyle = '#eee'; circ(g, 3, -2, 3); }
  },
  prateleira(g, h) { box(g, -14, -12, 28, 24, '#8d9095'); for (let r = 0; r < 3; r++) for (let k = 0; k < 6; k++) { g.fillStyle = PRODUCTS[Math.floor(hk(k + r * 7, h * 1000, 2) * PRODUCTS.length)]; g.fillRect(-12 + k * 4.2, -10 + r * 7.5, 3.4, 5.5); } },
  balcao(g) { box(g, -15, -12, 30, 18, '#7d5f45'); g.fillStyle = '#c9b89a'; g.fillRect(-15, -12, 30, 6); g.fillStyle = '#2b2f33'; rr(g, 3, -11, 9, 8, 1); g.fill(); g.fillStyle = '#5ac8e8'; g.fillRect(4, -10, 7, 3); },
  armario_med(g) { box(g, -14, -15, 28, 14, '#f1f4f5'); g.fillStyle = '#2fa860'; g.fillRect(-2, -13, 4, 10); g.fillRect(-5, -10, 10, 4); g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(-0.5, -15, 1, 14); },
  maca(g) { box(g, -10, -15, 20, 30, '#a7b2b8', 3); g.fillStyle = '#cfe6ee'; g.fillRect(-8, -13, 16, 26); g.fillStyle = '#fff'; rr(g, -7, -12, 14, 5, 2); g.fill(); g.fillStyle = '#9ab'; g.fillRect(-8, 2, 16, 2); },
  armario_armas(g) { box(g, -14, -15, 28, 15, '#454c52'); g.fillStyle = '#e0b030'; for (let k = -12; k < 14; k += 6) g.fillRect(k, -3, 3, 2); g.fillStyle = '#aaa'; circ(g, 0, -8, 2.5); g.fillStyle = '#333'; g.fillRect(-0.5, -9, 1, 2); },
  arquivo(g) { box(g, -10, -15, 20, 18, '#7d868c'); g.fillStyle = 'rgba(0,0,0,.25)'; for (let k = -10; k < 3; k += 6) g.fillRect(-10, k, 20, 1); g.fillStyle = '#c8c8c8'; for (let k = -12; k < 3; k += 6) g.fillRect(-3, k, 6, 1.5); },
  ferramentas(g) { box(g, -14, -14, 28, 14, '#7a5a3a'); box(g, -9, -11, 16, 8, '#c8392f'); g.fillStyle = '#333'; g.fillRect(-4, -12, 6, 2); g.fillStyle = '#bbb'; g.fillRect(9, -12, 2, 9); },
  pecas(g) { box(g, -15, -15, 30, 18, '#5d6266'); g.fillStyle = '#1d1f20'; circ(g, -8, -6, 6); circ(g, 6, -6, 6); g.fillStyle = '#4a4d50'; circ(g, -8, -6, 2.5); circ(g, 6, -6, 2.5); g.fillStyle = '#c8a040'; g.fillRect(-2, -14, 6, 4); },
  caixote(g) { box(g, -12, -12, 24, 24, '#b88b4f', 1); g.strokeStyle = '#7f5a2e'; g.lineWidth = 2; g.strokeRect(-11, -11, 22, 22); g.beginPath(); g.moveTo(-11, -11); g.lineTo(11, 11); g.stroke(); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(-11, -4, 22, 1); g.fillRect(-11, 4, 22, 1); },
  banco_igreja(g) { box(g, -16, -6, 32, 12, '#7a5236', 1); g.fillStyle = '#5e3e28'; g.fillRect(-16, -6, 32, 4); },
  carteira(g) { box(g, -9, -12, 18, 10, '#c7a46d'); g.fillStyle = '#4a5a6a'; rr(g, -5, 2, 10, 8, 2); g.fill(); g.fillStyle = '#fff'; g.fillRect(-5, -10, 6, 5); },
  lixeira(g) { g.fillStyle = 'rgba(0,0,0,.3)'; circ(g, 2, 3, 9); g.fillStyle = '#3d6b46'; circ(g, 0, 0, 9); g.fillStyle = '#4f8a5a'; circ(g, -1, -1, 7); g.fillStyle = '#2f5537'; g.fillRect(-6, -1, 12, 2); },
  bomba(g) { box(g, -14, -9, 28, 18, '#b7b7b2', 3); box(g, -6, -7, 12, 14, '#d64a3a'); g.fillStyle = '#222'; g.fillRect(-4, -5, 8, 4); g.strokeStyle = '#222'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(6, 2); g.quadraticCurveTo(12, 6, 9, 10); g.stroke(); },
  feno(g) { box(g, -13, -11, 26, 22, '#d9b45a', 3); g.strokeStyle = 'rgba(140,100,40,.6)'; g.lineWidth = 1; g.beginPath(); for (let k = -9; k < 10; k += 3) { g.moveTo(-12, k); g.lineTo(12, k + 1); } g.stroke(); g.fillStyle = '#8a5a2a'; g.fillRect(-6, -11, 2, 22); g.fillRect(5, -11, 2, 22); },
  muro(g) { g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(-14, -14, 32, 32); g.fillStyle = '#8a5f36'; g.fillRect(-16, -16, 32, 32); for (let k = -16; k < 16; k += 6) { g.fillStyle = hk(k, 3, 1) > 0.5 ? '#94693f' : '#7d5530'; g.fillRect(k, -16, 5, 32); } g.fillStyle = '#5a3e22'; g.fillRect(-16, -9, 32, 3); g.fillRect(-16, 6, 32, 3); },
  muro_metal(g) { g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(-14, -14, 32, 32); g.fillStyle = '#7f878d'; g.fillRect(-16, -16, 32, 32); for (let k = -16; k < 16; k += 4) { g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(k, -16, 1.5, 32); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(k + 2, -16, 1.5, 32); } g.fillStyle = '#a55a2a'; g.fillRect(-10, 6, 6, 3); },
  cerca(g, h, o, x, y) {
    const hz = !(isFence(x, y - 1) || isFence(x, y + 1)) || isFence(x - 1, y) || isFence(x + 1, y);
    if (!hz) g.rotate(Math.PI / 2);
    g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(-16, -1, 32, 6);
    g.fillStyle = '#b08250'; g.fillRect(-16, -5, 32, 3); g.fillRect(-16, 2, 32, 3);
    g.fillStyle = '#7d5a35'; for (const k of [-12, 0, 12]) g.fillRect(k - 2, -7, 4, 14);
  },
  portao(g, h, o) {
    if (o.open) { g.fillStyle = '#7a5230'; g.fillRect(-16, -16, 5, 30); g.fillStyle = '#c9a54a'; g.fillRect(-15, -2, 3, 4); return; }
    g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(-14, -6, 32, 16); g.fillStyle = '#7a5230'; g.fillRect(-16, -8, 32, 16);
    g.fillStyle = 'rgba(0,0,0,.25)'; for (let k = -12; k < 16; k += 6) g.fillRect(k, -8, 1, 16); g.strokeStyle = '#5a3a1e'; g.lineWidth = 2; g.beginPath(); g.moveTo(-15, 7); g.lineTo(15, -7); g.stroke();
    g.fillStyle = '#555'; g.fillRect(-16, -6, 3, 3); g.fillRect(-16, 3, 3, 3);
  },
  bau(g) { box(g, -12, -9, 24, 18, '#8a5a30', 3); g.fillStyle = '#5a5a5a'; g.fillRect(-12, -2, 24, 2.5); g.fillRect(-7, -9, 2.5, 18); g.fillRect(5, -9, 2.5, 18); g.fillStyle = '#d8b040'; g.fillRect(-1.5, -3, 3, 4); },
  cama_imp(g) { box(g, -12, -15, 24, 30, '#a08250', 1); g.fillStyle = 'rgba(0,0,0,.2)'; for (let k = -12; k < 15; k += 6) g.fillRect(-12, k, 24, 1); g.fillStyle = '#6a7a5a'; g.fillRect(-10, -6, 20, 19); g.fillStyle = '#d8d2c0'; rr(g, -8, -13, 16, 6, 2); g.fill(); },
  fogueira(g, h, o) {
    g.fillStyle = 'rgba(0,0,0,.3)'; circ(g, 2, 3, 13);
    for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2; g.fillStyle = k % 2 ? '#7b7570' : '#5f5a55'; circ(g, Math.cos(a) * 10, Math.sin(a) * 10, 4); }
    g.fillStyle = '#3a2a1a'; g.fillRect(-7, -2, 14, 4); g.fillRect(-2, -7, 4, 14);
    if (o.lit) { g.fillStyle = '#ff8a2a'; circ(g, 0, 0, 5); g.fillStyle = '#ffd060'; circ(g, -1, -1, 2.5); } else { g.fillStyle = '#2a2420'; circ(g, 0, 0, 4); }
  },
  gerador(g, h, o) { box(g, -13, -10, 26, 20, '#e0b030', 3); g.fillStyle = '#2a2a2a'; for (let k = -8; k < 9; k += 4) g.fillRect(k, -6, 2, 12); g.fillStyle = o.on ? '#5f5' : '#a33'; circ(g, 9, -6, 2); g.fillStyle = '#222'; g.fillRect(-13, 8, 5, 4); g.fillRect(8, 8, 5, 4); },
  torre(g) {
    g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(-12, -10, 32, 32);
    g.fillStyle = '#6f4b2b'; for (const [a, b] of [[-16, -16], [12, -16], [-16, 12], [12, 12]]) g.fillRect(a, b, 4, 4);
    g.fillStyle = '#9a7048'; g.fillRect(-14, -14, 28, 28); g.fillStyle = 'rgba(0,0,0,.18)'; for (let k = -14; k < 14; k += 5) g.fillRect(-14, k, 28, 1);
    g.strokeStyle = '#5a3c20'; g.lineWidth = 2.5; g.strokeRect(-14, -14, 28, 28); g.fillStyle = '#4a3218'; g.fillRect(-3, 10, 6, 6);
  },
  coletor(g, h, o) { g.fillStyle = 'rgba(0,0,0,.3)'; circ(g, 2, 3, 12); g.fillStyle = '#3f78b0'; circ(g, 0, 0, 12); g.fillStyle = '#2d5a88'; circ(g, 0, 0, 9); g.fillStyle = (o.water || 0) > 2 ? '#6fb4e0' : '#22405e'; circ(g, 0, 0, 7); g.strokeStyle = '#5d8fc0'; g.lineWidth = 1.5; g.beginPath(); g.arc(0, 0, 12, 0, 7); g.stroke(); },
  bancada(g) { box(g, -15, -12, 30, 20, '#a07a4f', 2); g.fillStyle = '#6a4a2a'; g.fillRect(-15, 4, 30, 4); g.fillStyle = '#555c62'; g.fillRect(-13, -10, 7, 6); g.fillStyle = '#c33'; g.fillRect(2, -8, 9, 2); g.fillStyle = '#bbb'; g.fillRect(4, -3, 8, 2); },
  cadaver(g, h, o) {
    const s = o.big ? 1.3 : 1;
    g.rotate(o.a || 0);
    g.fillStyle = 'rgba(100,8,8,.55)'; g.beginPath(); g.ellipse(2, 3, 15, 11, 0.3, 0, 7); g.fill();
    g.fillStyle = '#3a3530'; g.fillRect(-15 * s, -4 * s, 8 * s, 3.5 * s); g.fillRect(-15 * s, 1 * s, 8 * s, 3.5 * s);
    g.fillStyle = o.shirt || '#555'; rr(g, -8 * s, -6 * s, 13 * s, 12 * s, 3 * s); g.fill();
    g.fillStyle = 'rgba(80,0,0,.45)'; circ(g, -2 * s, 1 * s, 3 * s);
    g.fillStyle = '#7f8f72'; circ(g, 9 * s, 0, 4.8 * s); g.fillRect(-2 * s, -10 * s, 3 * s, 6 * s); g.fillRect(2 * s, 5 * s, 6 * s, 3 * s);
  },
  bolsa_chao(g) { g.rotate(0.4); shadowBox(g, -9, -5, 18, 10, 4); g.fillStyle = '#5a6a4a'; rr(g, -9, -5, 18, 10, 4); g.fill(); g.fillStyle = '#3d4a32'; g.fillRect(-9, -1, 18, 2); g.strokeStyle = '#2d3524'; g.lineWidth = 1.5; g.beginPath(); g.arc(0, -5, 4, Math.PI, 0); g.stroke(); },
  horta(g, h, o) {
    g.fillStyle = '#4a3220'; g.fillRect(-15, -15, 30, 30); g.fillStyle = '#5c3e26'; for (let k = -12; k < 15; k += 8) g.fillRect(-14, k, 28, 4);
    g.strokeStyle = '#7a5a3a'; g.lineWidth = 2; g.strokeRect(-15, -15, 30, 30);
    if (!o.p) return;
    const pl = PLANTS[o.p], f = Math.min(1, o.g / pl.h);
    for (const [a, b] of [[-8, -9], [7, -9], [-8, 7], [7, 7]]) {
      g.strokeStyle = o.rot ? '#6a5a3a' : '#3f8f34'; g.lineWidth = 1.6; g.beginPath();
      const L = 2 + f * 6; for (let k = 0; k < 5; k++) { const an = k * 1.26; g.moveTo(a, b); g.lineTo(a + Math.cos(an) * L, b + Math.sin(an) * L); } g.stroke();
      if (f >= 1 && !o.rot) { g.fillStyle = pl.col; circ(g, a + 2, b + 2, 2.8); }
    }
  },
};
function isFence(x, y) { const o = objAt(x, y); return !!(o && (o.t === 'cerca' || o.t === 'muro' || o.t === 'muro_metal' || o.t === 'portao')); }
const NO_ROT = new Set(['cadaver', 'bolsa_chao', 'horta', 'muro', 'muro_metal', 'cerca', 'torre', 'lixeira', 'coletor', 'fogueira', 'banco_igreja', 'carteira', 'prateleira', 'caixote', 'feno', 'bomba']);
function drawObj(g, o, x, y, px, py) {
  const d = FURN[o.t]; if (!d || o.t === 'arbusto') return;
  const art = FURN_ART[o.t];
  g.save(); g.translate(px + 16, py + 16);
  if (art) {
    if (!NO_ROT.has(o.t)) g.rotate(wallSide(x, y));
    art(g, hk(x, y, 77), o, x, y);
  } else {
    box(g, -13, -13, 26, 26, d.col);
    if (d.ic) { g.font = '15px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(d.ic, 0, 1); }
  }
  g.restore();
  if (d.cont && o.items && !o.items.length && !d.build && o.t !== 'cadaver') { g.fillStyle = 'rgba(0,0,0,.4)'; circ(g, px + 26, py + 6, 2.5); }
}

/* ---------- telhados (um desenho por prédio, guardado em cache) ---------- */
const roofCache = new Map();
G.resetRoofs = () => roofCache.clear();
function roofCanvas(bi, res) {
  const key = bi * 10 + res * 2;
  let c = roofCache.get(key);
  if (c) { c.used = performance.now(); return c.cv; }
  if (roofCache.size > 40) { let old = null, ot = 1e18; for (const [k, v] of roofCache) if (v.used < ot) { ot = v.used; old = k; } roofCache.delete(old); }
  const B = S.bld[bi], cv2 = document.createElement('canvas');
  cv2.width = Math.ceil(B.w * T * res); cv2.height = Math.ceil(B.h * T * res);
  const g = cv2.getContext('2d'); g.scale(res, res);
  drawRoof(g, B, bi);
  roofCache.set(key, { cv: cv2, used: performance.now() });
  return cv2;
}
const FLAT = new Set(['mercado', 'posto', 'hospital', 'delegacia', 'oficina', 'escola', 'fabrica']);
function drawRoof(g, B, bi) {
  const W = B.w * T, H = B.h * T, R = (k) => hk(B.x * 7 + k, B.y * 3 + bi, 5);
  if (FLAT.has(B.t)) return flatRoof(g, B, W, H, R);
  const base = B.t === 'celeiro' ? '#a8322a' : B.roof;
  const hz = W >= H, inset = Math.min(W, H) / 2;
  const faces = hz ? [
    [[0, 0], [W, 0], [W - inset, H / 2], [inset, H / 2], -0.18, 'h'],
    [[0, H], [W, H], [W - inset, H / 2], [inset, H / 2], 0.1, 'h'],
    [[0, 0], [inset, H / 2], [0, H], null, -0.04, 'v'],
    [[W, 0], [W - inset, H / 2], [W, H], null, -0.26, 'v'],
  ] : [
    [[0, 0], [0, H], [W / 2, H - inset], [W / 2, inset], -0.04, 'v'],
    [[W, 0], [W, H], [W / 2, H - inset], [W / 2, inset], -0.26, 'v'],
    [[0, 0], [W, 0], [W / 2, inset], null, -0.18, 'h'],
    [[0, H], [W, H], [W / 2, H - inset], null, 0.1, 'h'],
  ];
  for (const f of faces) {
    const pts = f.slice(0, 4).filter(Boolean);
    g.save(); g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) g.lineTo(p[0], p[1]); g.closePath();
    g.fillStyle = shade(base, f[4]); g.fill(); g.clip();
    // telhas
    if (B.t === 'celeiro') { g.fillStyle = 'rgba(0,0,0,.18)'; if (f[5] === 'h') for (let k = 0; k < W; k += 6) g.fillRect(k, 0, 1.5, H); else for (let k = 0; k < H; k += 6) g.fillRect(0, k, W, 1.5); }
    else {
      g.fillStyle = 'rgba(0,0,0,.16)';
      if (f[5] === 'h') for (let k = 0, row = 0; k < H; k += 5, row++) { g.fillRect(0, k, W, 1); for (let j = (row % 2) * 4; j < W; j += 8) g.fillRect(j, k, 1, 5); }
      else for (let k = 0, row = 0; k < W; k += 5, row++) { g.fillRect(k, 0, 1, H); for (let j = (row % 2) * 4; j < H; j += 8) g.fillRect(k, j, 5, 1); }
    }
    g.restore();
  }
  // cumeeira e espigões
  g.strokeStyle = shade(base, -0.4); g.lineWidth = 2.5; g.beginPath();
  if (hz) { g.moveTo(inset, H / 2); g.lineTo(W - inset, H / 2); g.moveTo(0, 0); g.lineTo(inset, H / 2); g.lineTo(0, H); g.moveTo(W, 0); g.lineTo(W - inset, H / 2); g.lineTo(W, H); }
  else { g.moveTo(W / 2, inset); g.lineTo(W / 2, H - inset); g.moveTo(0, 0); g.lineTo(W / 2, inset); g.lineTo(W, 0); g.moveTo(0, H); g.lineTo(W / 2, H - inset); g.lineTo(W, H); }
  g.stroke();
  if (B.t === 'celeiro') { g.strokeStyle = '#efe6d6'; g.lineWidth = 2; g.beginPath(); if (hz) { g.moveTo(inset, H / 2); g.lineTo(W - inset, H / 2); } else { g.moveTo(W / 2, inset); g.lineTo(W / 2, H - inset); } g.stroke(); }
  g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 2; g.strokeRect(1, 1, W - 2, H - 2);
  // chaminé
  if ((B.t === 'casa' || B.t === 'fazenda') && R(1) > 0.3) {
    const cx = hz ? W * (0.3 + R(2) * 0.4) : W * 0.68, cy = hz ? H * 0.68 : H * (0.3 + R(2) * 0.4);
    g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(cx + 3, cy + 3, 11, 11);
    g.fillStyle = '#8a4b3a'; g.fillRect(cx, cy, 11, 11); g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(cx, cy + 4, 11, 1); g.fillRect(cx, cy + 8, 11, 1);
    g.fillStyle = '#2a2220'; g.fillRect(cx + 3, cy + 3, 5, 5);
  }
  // casa abandonada: buracos e musgo
  if (B.t === 'abandonada') {
    for (let k = 0; k < 3; k++) {
      const hx = W * (0.2 + R(10 + k) * 0.6), hy = H * (0.2 + R(20 + k) * 0.6);
      g.fillStyle = '#1e1a16'; g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx + 12, hy + 3); g.lineTo(hx + 9, hy + 13); g.lineTo(hx - 2, hy + 10); g.closePath(); g.fill();
      g.strokeStyle = '#5a3e26'; g.lineWidth = 2; g.beginPath(); g.moveTo(hx - 1, hy + 5); g.lineTo(hx + 12, hy + 7); g.stroke();
    }
    for (let k = 0; k < 8; k++) { g.fillStyle = 'rgba(80,110,50,.45)'; circ(g, W * R(40 + k), H * R(50 + k), 3 + R(60 + k) * 4); }
  }
  // igreja: torre com cruz
  if (B.t === 'igreja') {
    const s = Math.min(W, H) * 0.45, tx = hz ? 4 : (W - s) / 2, ty = hz ? (H - s) / 2 : 4;
    g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(tx + 4, ty + 4, s, s);
    g.fillStyle = '#e8e2d4'; g.fillRect(tx, ty, s, s);
    const c = shade(base, -0.1); g.fillStyle = c; g.beginPath(); g.moveTo(tx, ty); g.lineTo(tx + s, ty); g.lineTo(tx + s / 2, ty + s / 2); g.fill();
    g.fillStyle = shade(base, -0.3); g.beginPath(); g.moveTo(tx + s, ty); g.lineTo(tx + s, ty + s); g.lineTo(tx + s / 2, ty + s / 2); g.fill();
    g.fillStyle = shade(base, 0.1); g.beginPath(); g.moveTo(tx, ty + s); g.lineTo(tx + s, ty + s); g.lineTo(tx + s / 2, ty + s / 2); g.fill();
    g.fillStyle = '#e8c860'; g.fillRect(tx + s / 2 - 1.5, ty + s / 2 - 7, 3, 14); g.fillRect(tx + s / 2 - 5, ty + s / 2 - 3, 10, 3);
  }
}
function flatRoof(g, B, W, H, R) {
  const base = { hospital: '#d9dedd', mercado: '#a7a8a2', posto: '#b5b3ad', delegacia: '#9fa3a3', oficina: '#8f918c', escola: '#b0a58f', fabrica: '#7f827e' }[B.t];
  g.fillStyle = base; g.fillRect(0, 0, W, H);
  for (let k = 0; k < W * H / 60; k++) { g.fillStyle = k % 2 ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.08)'; g.fillRect(R(k * 2 + 100) * W, R(k * 2 + 101) * H, 1.5, 1.5); }
  // mureta
  g.strokeStyle = shade(base, 0.25); g.lineWidth = 5; g.strokeRect(2.5, 2.5, W - 5, H - 5);
  g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 2; g.strokeRect(6, 6, W - 12, H - 12);
  g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 1.5; g.strokeRect(0.75, 0.75, W - 1.5, H - 1.5);
  const ac = (x, y) => {
    g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(x + 3, y + 3, 22, 16);
    g.fillStyle = '#c9cccd'; g.fillRect(x, y, 22, 16); g.fillStyle = '#8d9295'; circ(g, x + 7, y + 8, 5.5); g.fillStyle = '#5d6265'; circ(g, x + 7, y + 8, 2);
    g.fillStyle = 'rgba(0,0,0,.2)'; for (let k = 0; k < 4; k++) g.fillRect(x + 14, y + 3 + k * 3, 6, 1);
  };
  const sign = (txt, bg, fg) => {
    const fs = Math.min(H * 0.28, W / (txt.length * 0.72));
    g.font = `900 ${fs}px Nunito, Arial Black, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    const tw = g.measureText(txt).width + fs * 0.8;
    g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(W / 2 - tw / 2 + 3, H * 0.3 - fs * 0.7 + 3, tw, fs * 1.4);
    g.fillStyle = bg; g.fillRect(W / 2 - tw / 2, H * 0.3 - fs * 0.7, tw, fs * 1.4);
    g.fillStyle = fg; g.fillText(txt, W / 2, H * 0.3 + fs * 0.05);
  };
  if (B.t === 'hospital') {
    const r = Math.min(W, H) * 0.22, cx = W * 0.7, cy = H * 0.62;
    g.fillStyle = '#5c6466'; circ(g, cx, cy, r); g.strokeStyle = '#f2d14a'; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, r - 4, 0, 7); g.stroke();
    g.fillStyle = '#fff'; g.font = `900 ${r}px Nunito, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('H', cx, cy + 1);
    const c = Math.min(W, H) * 0.18, ccx = W * 0.25, ccy = H * 0.6;
    g.fillStyle = '#fff'; g.fillRect(ccx - c, ccy - c, c * 2, c * 2); g.fillStyle = '#d7332a'; g.fillRect(ccx - c * 0.25, ccy - c * 0.8, c * 0.5, c * 1.6); g.fillRect(ccx - c * 0.8, ccy - c * 0.25, c * 1.6, c * 0.5);
    ac(W * 0.42, H * 0.12); ac(W * 0.55, H * 0.12);
  } else if (B.t === 'fabrica') {
    g.fillStyle = 'rgba(130,170,190,.75)'; for (let k = 0; k < 3; k++) { const y = H * (0.2 + k * 0.25); g.fillRect(W * 0.12, y, W * 0.5, 8); g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(W * 0.12, y + 7, W * 0.5, 1); g.fillStyle = 'rgba(130,170,190,.75)'; }
    for (const [cx, cy] of [[W * 0.8, H * 0.3], [W * 0.8, H * 0.65]]) { g.fillStyle = 'rgba(0,0,0,.35)'; circ(g, cx + 5, cy + 5, 14); g.fillStyle = '#7a5040'; circ(g, cx, cy, 14); g.fillStyle = '#5a3a30'; circ(g, cx, cy, 10); g.fillStyle = '#151210'; circ(g, cx, cy, 7); }
  } else {
    const txt = { mercado: ['MERCADO', '#2e7d4f', '#fff'], delegacia: ['POLÍCIA', '#1f3d7a', '#fff'], escola: ['ESCOLA', '#e0a82e', '#2a2a2a'], oficina: ['OFICINA', '#d0682a', '#fff'], posto: ['POSTO', '#c0392b', '#fff'] }[B.t];
    if (txt) sign(...txt);
    const n = Math.max(1, Math.floor(W * H / 9000));
    for (let k = 0; k < n; k++) ac(10 + R(k + 3) * (W - 40), H * 0.55 + R(k + 9) * (H * 0.4 - 22));
    for (let k = 0; k < 3; k++) { g.fillStyle = '#6f7476'; circ(g, 12 + R(k + 30) * (W - 24), 12 + R(k + 40) * (H - 24), 3); g.fillStyle = '#3d4244'; circ(g, 12 + R(k + 30) * (W - 24), 12 + R(k + 40) * (H - 24), 1.5); }
    if (B.t === 'delegacia') { g.strokeStyle = '#666'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(W - 14, 12); g.lineTo(W - 14, 30); g.stroke(); g.fillStyle = '#d33'; circ(g, W - 14, 12, 2.5); }
  }
}

/* ---------- árvores em pé (sprites pré-desenhados) ---------- */
// 0-2 folhosas, 3-4 pinheiros, 5 outono, 6 seca
const ISO_TREES = [
  ['leaf', '#2f3d22', '#4a5a30', '#6e7a45'], ['leaf', '#34401f', '#55602e', '#7d8648'], ['leaf', '#2c3a27', '#44553a', '#677a55'],
  ['pine', '#1f2e22', '#2f4230', '#4a5f47'], ['pine', '#243224', '#364a35', '#55684f'], ['leaf', '#5a2e1c', '#8a4a26', '#b8743a'], ['bare'],
];
const ISO_TREE_FOOT = 8, ISO_TREE_W = 132, ISO_TREE_H = 196; // em px de escala 1
const TREE_SC = [0.88, 1, 1.12]; // tamanhos de árvore
let isoTrees = null, isoTreeRes = 0;
function buildIsoTrees(res) {
  isoTreeRes = res; isoTrees = [];
  buildIsoDeco(res);
  const W = ISO_TREE_W, H = ISO_TREE_H;
  for (const [kind, c1, c2, c3] of ISO_TREES) {
    const vars = [];
    for (let v = 0; v < 2; v++) for (let si = 0; si < 3; si++) {
      const sc = TREE_SC[si], cv2 = document.createElement('canvas'); cv2.width = Math.ceil(W * res * sc); cv2.height = Math.ceil(H * res * sc); cv2.sc = sc;
      const g = cv2.getContext('2d'); g.scale(res * sc, res * sc); g.translate(W / 2, H - ISO_TREE_FOOT);
      const rnd2 = mulberry(v * 131 + kind.length * 17 + (c2 ? c2.charCodeAt(3) : 7));
      const trunk = (h, w) => {
        const gr = g.createLinearGradient(-w, 0, w, 0); gr.addColorStop(0, '#6a5440'); gr.addColorStop(1, '#3a2c20');
        g.fillStyle = gr; g.beginPath(); g.moveTo(-w, 0); g.lineTo(-w * 0.55, -h); g.lineTo(w * 0.55, -h); g.lineTo(w, 0); g.closePath(); g.fill();
      };
      const branch = (x, y, a, len, w, depth) => {
        if (depth <= 0 || len < 4) return;
        const ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len;
        g.strokeStyle = '#3e3024'; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.lineTo(ex, ey); g.stroke();
        branch(ex, ey, a - 0.35 - rnd2() * 0.3, len * 0.72, w * 0.68, depth - 1);
        branch(ex, ey, a + 0.35 + rnd2() * 0.3, len * 0.72, w * 0.68, depth - 1);
      };
      if (kind === 'bare') {
        trunk(70, 5);
        branch(0, -60, -Math.PI / 2 - 0.25, 34, 4, 5); branch(0, -50, -Math.PI / 2 + 0.4, 28, 3.2, 4);
      } else if (kind === 'pine') {
        trunk(34, 4.5);
        for (let k = 0; k < 5; k++) {
          const yb = -24 - k * 30, wd = 46 - k * 8, ht = 52;
          g.fillStyle = c1; g.beginPath(); g.moveTo(-wd, yb); g.lineTo(0, yb - ht); g.lineTo(wd, yb); g.closePath(); g.fill();
          g.fillStyle = c2; g.beginPath(); g.moveTo(-wd * 0.95, yb - 2); g.lineTo(0, yb - ht); g.lineTo(wd * 0.15, yb - 4); g.closePath(); g.fill();
          g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.moveTo(wd * 0.15, yb - 4); g.lineTo(0, yb - ht); g.lineTo(wd, yb); g.closePath(); g.fill();
          g.fillStyle = c3; for (let j = 0; j < 4; j++) { g.beginPath(); g.arc(-wd * 0.5 + rnd2() * wd * 0.5, yb - 8 - rnd2() * ht * 0.4, 2.5, 0, 7); g.fill(); }
        }
      } else {
        trunk(78, 6);
        branch(0, -66, -Math.PI / 2 - 0.5, 22, 3.5, 2); branch(0, -60, -Math.PI / 2 + 0.55, 20, 3, 2);
        const cy = -112;
        g.fillStyle = c1; g.beginPath(); g.ellipse(0, cy, 50, 46, 0, 0, 7); g.fill();
        for (let k = 0; k < 18; k++) {
          const an = rnd2() * Math.PI * 2, rr2 = Math.sqrt(rnd2()) * 38, bx = Math.cos(an) * rr2, by = cy + Math.sin(an) * rr2 * 0.9;
          const lit = clamp(0.5 - (bx + by - cy) / 90, 0, 1);
          const gr = g.createRadialGradient(bx - 5, by - 6, 1, bx, by, 18);
          gr.addColorStop(0, lit > 0.5 ? c3 : c2); gr.addColorStop(1, c1);
          g.fillStyle = gr; g.beginPath(); g.arc(bx, by, 12 + rnd2() * 9, 0, 7); g.fill();
        }
        for (let k = 0; k < 26; k++) { g.fillStyle = k % 3 ? 'rgba(230,230,190,.13)' : 'rgba(0,0,0,.16)'; g.beginPath(); g.arc((rnd2() - 0.5) * 84, cy + (rnd2() - 0.5) * 76, 2 + rnd2() * 3, 0, 7); g.fill(); }
      }
      (vars[v] = vars[v] || []).push(cv2);
    }
    isoTrees.push(vars);
  }
}
// arbustos, capim alto e flores: só enfeite (não bloqueiam), sorteados por tile
const DECO_W = 64, DECO_H = 56, DECO_FOOT = 6;
let isoDeco = null;
function buildIsoDeco(res) {
  isoDeco = {};
  const kinds = {
    arbusto: [['#2f3d22', '#4a5a30', '#6e7a45'], ['#34401f', '#55602e', '#7d8648'], ['#2c3a27', '#44553a', '#677a55']],
    frutas: [['#2f3d22', '#45602f', '#6a8a48']],
    capim: [['#5a5a30', '#7a7642', '#a09a5a'], ['#4a5530', '#66703e', '#8a925a']],
    flores: [['#3a4a28', '#56653a', '#e2d06a'], ['#3a4a28', '#56653a', '#d890b0'], ['#3a4a28', '#56653a', '#e8e8e0']],
    samambaia: [['#2a3a22', '#3e5530', '#5f7a45']],
  };
  for (const [kind, pals] of Object.entries(kinds)) {
    isoDeco[kind] = pals.map(([c1, c2, c3], v) => {
      const cv2 = document.createElement('canvas'); cv2.width = Math.ceil(DECO_W * res); cv2.height = Math.ceil(DECO_H * res);
      const g = cv2.getContext('2d'); g.scale(res, res); g.translate(DECO_W / 2, DECO_H - DECO_FOOT);
      const r2 = mulberry(v * 53 + kind.length * 7);
      g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.ellipse(2, 1, 17, 6, 0, 0, 7); g.fill();
      if (kind === 'arbusto' || kind === 'frutas') {
        for (let k = 0; k < 11; k++) {
          const a = r2() * Math.PI, rx = Math.cos(a) * 14 * r2(), ry = -12 - Math.sin(a) * 12 * r2();
          const gr = g.createRadialGradient(rx - 3, ry - 4, 1, rx, ry, 11); gr.addColorStop(0, k > 6 ? c3 : c2); gr.addColorStop(1, c1);
          g.fillStyle = gr; g.beginPath(); g.arc(rx, ry, 8 + r2() * 5, 0, 7); g.fill();
        }
        if (kind === 'frutas') for (let k = 0; k < 9; k++) { g.fillStyle = k % 2 ? '#3d2a7a' : '#6a4ab0'; g.beginPath(); g.arc((r2() - 0.5) * 26, -8 - r2() * 20, 1.8, 0, 7); g.fill(); }
      } else if (kind === 'capim') {
        g.lineCap = 'round';
        for (let k = 0; k < 22; k++) { const bx = (r2() - 0.5) * 22, h = 12 + r2() * 16, lean = (r2() - 0.5) * 12; g.strokeStyle = [c1, c2, c3][k % 3]; g.lineWidth = 1.4; g.beginPath(); g.moveTo(bx, 0); g.quadraticCurveTo(bx + lean * 0.3, -h * 0.6, bx + lean, -h); g.stroke(); }
      } else if (kind === 'flores') {
        g.lineCap = 'round';
        for (let k = 0; k < 14; k++) { const bx = (r2() - 0.5) * 20, h = 7 + r2() * 9; g.strokeStyle = k % 2 ? c1 : c2; g.lineWidth = 1.6; g.beginPath(); g.moveTo(bx, 0); g.lineTo(bx + (r2() - 0.5) * 6, -h); g.stroke(); }
        for (let k = 0; k < 9; k++) { g.fillStyle = c3; g.beginPath(); g.arc((r2() - 0.5) * 22, -9 - r2() * 9, 2, 0, 7); g.fill(); }
      } else {
        g.lineCap = 'round';
        for (let k = 0; k < 9; k++) {
          const a = -Math.PI / 2 + (k / 8 - 0.5) * 2.6, L = 14 + r2() * 8, ex = Math.cos(a) * L, ey = Math.sin(a) * L * 0.8 - 2;
          g.strokeStyle = k % 2 ? c2 : c3; g.lineWidth = 2.2; g.beginPath(); g.moveTo(0, -1); g.quadraticCurveTo(ex * 0.5, ey * 0.9 - 4, ex, ey); g.stroke();
        }
      }
      return cv2;
    });
  }
}
function decoAt(x, y) {
  const t = S.tiles[ix(x, y)];
  if (t === TL.BUSH) return { k: 'frutas', v: 0 };
  if (t !== TL.GRASS || S.room[ix(x, y)] || S.objs[ix(x, y)]) return null;
  const h = hk(x, y, 61);
  let p = inTown(x, y) ? 0.045 : 0.09;
  if (p < 0.09 && N4.some(([a, b]) => tileAt(x + a, y + b) === TL.DOOR)) return null;
  if (!inTown(x, y) && (tileAt(x + 2, y) === TL.TREE || tileAt(x - 2, y) === TL.TREE || tileAt(x, y + 2) === TL.TREE || tileAt(x, y - 2) === TL.TREE)) p = 0.16;
  if (h > p) return null;
  const r = hk(x, y, 62), k = r < 0.34 ? 'arbusto' : r < 0.62 ? 'capim' : r < 0.84 ? 'flores' : 'samambaia';
  return { k, v: Math.floor(hk(x, y, 63) * isoDeco[k].length), ox: (hk(x, y, 64) - 0.5) * 0.5, oy: (hk(x, y, 65) - 0.5) * 0.5 };
}
function treeAt(x, y) {
  const k = hk(x, y, 11) < 0.04 ? 5 : hk(x, y, 15) < 0.07 ? 6 : Math.floor(hk(x, y, 9) * 5);
  return { k, v: Math.floor(hk(x, y, 12) * 2), si: Math.floor(hk(x, y, 8) * 3), ox: (hk(x, y, 13) - 0.5) * 0.3, oy: (hk(x, y, 14) - 0.5) * 0.3 };
}

/* ---------- pessoas ---------- */
const HAIR = ['#2a1d14', '#4a3020', '#7a5030', '#b89a60', '#1a1a1a', '#7a4a2a', '#8a8a86'];
