/* Último Dia — desenho: terreno em blocos cacheados, entidades, luz, clima e efeitos. */
'use strict';

const CH = 16; // tiles por bloco cacheado
const chunks = new Map();
const cv = document.getElementById('game');
const ctx = cv.getContext('2d');
const lightCv = document.createElement('canvas');
const lctx = lightCv.getContext('2d');
let VW = 0, VH = 0, DPR = 1, Z = 32;
G.cam = { x: 0, y: 0 }; G.zoom = 1;

function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  VW = window.innerWidth; VH = window.innerHeight;
  cv.width = Math.round(VW * DPR); cv.height = Math.round(VH * DPR);
  cv.style.width = VW + 'px'; cv.style.height = VH + 'px';
  lightCv.width = Math.ceil(VW / 2); lightCv.height = Math.ceil(VH / 2);
}
window.addEventListener('resize', resize);
resize();

G.chunkDirty = (x, y) => { const k = Math.floor(x / CH) * 100 + Math.floor(y / CH); const c = chunks.get(k); if (c) c.dirty = 1; };
G.chunkDirtyAll = () => { for (const c of chunks.values()) c.dirty = 1; };
G.resetChunks = () => chunks.clear();

/* ---------- cores ---------- */
function hash(x, y) { let h = (x * 374761393 + y * 668265263) ^ (S.seed | 0); h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
const TCOL = {
  [TL.GRASS]: ['#5f8a45', '#638f48', '#5a8442', '#668f4a'], [TL.ROAD]: ['#3d4043', '#3f4245', '#3b3e41'], [TL.WALK]: ['#9a9a92', '#a09f97'],
  [TL.DIRT]: ['#8a6b47', '#8f7049', '#866843'], [TL.WATER]: ['#2f6f9a', '#31739f'], [TL.SAND]: ['#d4c08a', '#cfbb85'], [TL.PARK]: ['#55585b', '#585b5e'],
  [TL.BURNT]: ['#2d2a27', '#33302c', '#282522'], [TL.RUBBLE]: ['#5a5550', '#625c56'], [TL.FIELD]: ['#6e5236', '#735638'],
};

/* ---------- blocos de terreno ---------- */
function getChunk(cx, cy) {
  const k = cx * 100 + cy;
  let c = chunks.get(k);
  if (!c) {
    if (chunks.size > 24) { // descarta o mais antigo
      let old = null, ot = 1e18; for (const [kk, cc] of chunks) if (cc.used < ot) { ot = cc.used; old = kk; }
      chunks.delete(old);
    }
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = CH * TILE;
    c = { canvas, ctx: canvas.getContext('2d'), dirty: 1, used: 0 };
    chunks.set(k, c);
  }
  c.used = performance.now();
  if (c.dirty) { drawChunk(c, cx, cy); c.dirty = 0; }
  return c;
}
function drawChunk(c, cx, cy) {
  const g = c.ctx; g.clearRect(0, 0, CH * TILE, CH * TILE);
  g.textAlign = 'center'; g.textBaseline = 'middle';
  for (let ty = 0; ty < CH; ty++) for (let tx = 0; tx < CH; tx++) {
    const x = cx * CH + tx, y = cy * CH + ty; if (!inb(x, y)) continue;
    drawTile(g, x, y, tx * TILE, ty * TILE);
  }
  for (let ty = 0; ty < CH; ty++) for (let tx = 0; tx < CH; tx++) {
    const x = cx * CH + tx, y = cy * CH + ty; if (!inb(x, y)) continue;
    const o = S.objs[ix(x, y)]; if (o) drawObj(g, o, x, y, tx * TILE, ty * TILE);
  }
}
function floorCol(x, y) {
  const b = bldAt(x, y); if (b < 0) return '#9a8a74';
  return BTYPES[S.bld[b].t].floor;
}
function drawTile(g, x, y, px, py) {
  const t = S.tiles[ix(x, y)], h = hash(x, y), T = TILE;
  const base = (k) => { const a = TCOL[k]; g.fillStyle = a[Math.floor(h * a.length)]; g.fillRect(px, py, T, T); };
  switch (t) {
    case TL.GRASS: case TL.TREE: case TL.BUSH:
      base(TL.GRASS);
      if (h > 0.6) { g.fillStyle = 'rgba(40,70,30,.35)'; for (let k = 0; k < 3; k++) g.fillRect(px + ((h * 97 * (k + 1)) % 28), py + ((h * 53 * (k + 2)) % 28), 2, 4); }
      if (h < 0.05) { g.fillStyle = '#e8d860'; g.fillRect(px + 10, py + 12, 3, 3); }
      if (t === TL.TREE) {
        g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(px + 18, py + 20, 15, 12, 0, 0, 7); g.fill();
        g.fillStyle = h > 0.5 ? '#2f5a2c' : '#35632f'; g.beginPath(); g.arc(px + 16, py + 15, 15, 0, 7); g.fill();
        g.fillStyle = h > 0.5 ? '#3d7337' : '#447b3a'; g.beginPath(); g.arc(px + 13, py + 12, 9, 0, 7); g.fill();
      }
      if (t === TL.BUSH) {
        g.fillStyle = '#2f6a2f'; g.beginPath(); g.arc(px + 16, py + 17, 11, 0, 7); g.fill();
        const s = S.ts[ix(x, y)]; if (!s || !s.f || S.time - s.f > 2880) { g.fillStyle = '#5a3a9a'; for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(px + 9 + ((h * 131 * (k + 1)) % 14), py + 10 + ((h * 71 * (k + 3)) % 13), 2.2, 0, 7); g.fill(); } }
      }
      break;
    case TL.ROAD: {
      base(TL.ROAD);
      const r = (a, b) => tileAt(a, b) === TL.ROAD;
      g.fillStyle = '#d8b84a';
      if (r(x, y - 1) && !r(x, y - 2) && !r(x, y + 1) && r(x - 1, y) && r(x + 1, y) && x % 2 === 0) g.fillRect(px + 4, py - 1, 16, 2);
      if (r(x - 1, y) && !r(x - 2, y) && !r(x + 1, y) && r(x, y - 1) && r(x, y + 1) && y % 2 === 0) g.fillRect(px - 1, py + 4, 2, 16);
      if (h < 0.08) { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(px + 6, py + 8, 10, 6); }
      break;
    }
    case TL.WALK: base(TL.WALK); g.strokeStyle = 'rgba(0,0,0,.12)'; g.strokeRect(px + 0.5, py + 0.5, T - 1, T - 1); break;
    case TL.PARK: base(TL.PARK); if (x % 3 === 0) { g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(px, py + 2, 2, 12); } break;
    case TL.WATER: base(TL.WATER); g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(px + (h * 20 | 0), py + 8 + (h * 14 | 0), 9, 2); break;
    case TL.FIELD: {
      base(TL.FIELD);
      g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(px, py + 6, T, 3); g.fillRect(px, py + 22, T, 3);
      const s = S.ts[ix(x, y)]; const cut = s && s.f && S.time - s.f < 5 * 1440;
      g.fillStyle = cut ? '#7a8a3a' : '#5d9a3a';
      for (const [a, b] of [[6, 4], [18, 4], [12, 20], [26, 20]]) { g.fillRect(px + a, py + b - (cut ? 0 : 6), 3, cut ? 4 : 12); if (!cut) { g.fillStyle = '#e0c040'; g.fillRect(px + a + 2, py + b - 2, 3, 5); g.fillStyle = '#5d9a3a'; } }
      break;
    }
    case TL.SAND: base(TL.SAND); break;
    case TL.DIRT: base(TL.DIRT); break;
    case TL.BURNT: base(TL.BURNT); g.fillStyle = 'rgba(80,70,60,.4)'; g.fillRect(px + (h * 22 | 0), py + (h * 17 | 0), 6, 4); break;
    case TL.RUBBLE: base(TL.RUBBLE); g.fillStyle = '#3a3633'; g.fillRect(px + 4, py + 6, 8, 6); g.fillRect(px + 18, py + 16, 9, 7); break;
    case TL.FLOOR: case TL.TILEF: {
      g.fillStyle = floorCol(x, y); g.fillRect(px, py, T, T);
      const bt = bldAt(x, y) >= 0 ? S.bld[bldAt(x, y)].t : '';
      g.fillStyle = 'rgba(0,0,0,.08)';
      if (['casa', 'abandonada', 'fazenda', 'igreja', 'escola'].includes(bt)) { for (let k = 0; k < 4; k++) g.fillRect(px, py + k * 8 + ((x % 2) * 4), T, 1); }
      else { g.fillRect(px, py, T, 1); g.fillRect(px, py, 1, T); }
      if (bt === 'abandonada' && h < 0.3) { g.fillStyle = 'rgba(60,40,20,.3)'; g.fillRect(px + 5, py + 9, 12, 7); }
      break;
    }
    case TL.WALL: drawWall(g, x, y, px, py); break;
    case TL.DOOR: {
      g.fillStyle = floorCol(x, y); g.fillRect(px, py, T, T);
      const s = S.ts[ix(x, y)] || {};
      const horiz = isWallish(x - 1, y) || isWallish(x + 1, y);
      g.fillStyle = s.broken ? '#4a3626' : '#7a4f2c';
      if (s.broken) { g.fillRect(px + 3, py + 13, 8, 3); g.fillRect(px + 18, py + 17, 9, 3); }
      else if (s.open) { if (horiz) g.fillRect(px + 1, py + 1, 5, T - 2); else g.fillRect(px + 1, py + 1, T - 2, 5); }
      else { if (horiz) { g.fillRect(px, py + 11, T, 10); g.fillStyle = '#d8b04a'; g.fillRect(px + 24, py + 15, 3, 3); } else { g.fillRect(px + 11, py, 10, T); g.fillStyle = '#d8b04a'; g.fillRect(px + 15, py + 24, 3, 3); } }
      if (s.bar) drawPlanks(g, px, py, s.bar, horiz);
      break;
    }
    case TL.WINDOW: {
      drawWall(g, x, y, px, py);
      const s = S.ts[ix(x, y)] || {};
      const horiz = isWallish(x - 1, y) || isWallish(x + 1, y);
      const [gx, gy, gw, gh] = horiz ? [px + 3, py + 11, T - 6, 10] : [px + 11, py + 3, 10, T - 6];
      if (s.broken || s.open) { g.fillStyle = floorCol(x, y); g.fillRect(gx, gy, gw, gh); if (s.glass) { g.fillStyle = 'rgba(190,225,245,.8)'; g.fillRect(gx + 2, gy + 2, 3, 2); g.fillRect(gx + gw - 6, gy + gh - 4, 4, 2); } }
      else { g.fillStyle = '#9cc7e0'; g.fillRect(gx, gy, gw, gh); g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(gx + 2, gy + 2, horiz ? 6 : 3, horiz ? 3 : 6); }
      if (s.bar) drawPlanks(g, px, py, s.bar, horiz);
      break;
    }
  }
}
function isWallish(x, y) { const t = tileAt(x, y); return t === TL.WALL || t === TL.WINDOW || t === TL.DOOR; }
function drawWall(g, x, y, px, py) {
  const b = bldAt(x, y), roof = b >= 0 ? S.bld[b].roof : '#555';
  g.fillStyle = '#2e2a28'; g.fillRect(px, py, TILE, TILE);
  g.fillStyle = shade(roof, -0.25); g.fillRect(px + 2, py + 2, TILE - 4, TILE - 4);
}
function drawPlanks(g, px, py, n, horiz) {
  g.fillStyle = '#a77a45'; g.strokeStyle = '#5a3e1e'; g.lineWidth = 1;
  for (let k = 0; k < n; k++) {
    g.save(); g.translate(px + 16, py + 16); g.rotate((horiz ? 0 : Math.PI / 2) + (k - 1) * 0.35);
    g.fillRect(-17, -3.5, 34, 7); g.strokeRect(-17, -3.5, 34, 7); g.fillStyle = '#555'; g.fillRect(-13, -1, 2, 2); g.fillRect(11, -1, 2, 2); g.fillStyle = '#a77a45';
    g.restore();
  }
}
function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16); let r = n >> 16, gg = (n >> 8) & 255, b = n & 255;
  if (f < 0) { r *= 1 + f; gg *= 1 + f; b *= 1 + f; } else { r += (255 - r) * f; gg += (255 - gg) * f; b += (255 - b) * f; }
  return `rgb(${r | 0},${gg | 0},${b | 0})`;
}
function drawObj(g, o, x, y, px, py) {
  const d = FURN[o.t]; if (!d) return;
  const T = TILE;
  switch (o.t) {
    case 'cadaver': {
      g.save(); g.translate(px + 16, py + 16); g.rotate(o.a || 0);
      g.fillStyle = 'rgba(110,10,10,.55)'; g.beginPath(); g.ellipse(2, 3, 14, 10, 0, 0, 7); g.fill();
      const s = o.big ? 1.3 : 1;
      g.fillStyle = o.shirt || '#555'; g.fillRect(-9 * s, -5 * s, 14 * s, 10 * s);
      g.fillStyle = '#7f8f72'; g.beginPath(); g.arc(9 * s, 0, 4.5 * s, 0, 7); g.fill();
      g.fillRect(-14 * s, -4 * s, 6 * s, 3 * s); g.fillRect(-14 * s, 1 * s, 6 * s, 3 * s);
      g.restore(); return;
    }
    case 'bolsa_chao': g.font = '16px sans-serif'; g.fillText('👜', px + 16, py + 17); return;
    case 'horta': {
      g.fillStyle = '#5a3e26'; g.fillRect(px + 2, py + 2, T - 4, T - 4);
      g.fillStyle = 'rgba(0,0,0,.2)'; for (let k = 0; k < 3; k++) g.fillRect(px + 4, py + 7 + k * 8, T - 8, 2);
      if (o.p) {
        const pl = PLANTS[o.p], f = Math.min(1, o.g / pl.h);
        g.fillStyle = o.rot ? '#6a5a3a' : '#4f9a3a';
        for (const [a, b] of [[9, 9], [22, 9], [9, 22], [22, 22]]) { g.beginPath(); g.arc(px + a, py + b, 2 + f * 5, 0, 7); g.fill(); if (f >= 1 && !o.rot) { g.fillStyle = pl.col; g.beginPath(); g.arc(px + a + 2, py + b + 1, 2.6, 0, 7); g.fill(); g.fillStyle = '#4f9a3a'; } }
      }
      return;
    }
    case 'muro': case 'muro_metal':
      g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(px + 2, py + 4, T, T);
      g.fillStyle = d.col; g.fillRect(px, py, T, T);
      g.fillStyle = 'rgba(0,0,0,.25)'; for (let k = 1; k < 4; k++) g.fillRect(px, py + k * 8, T, 1);
      if (o.t === 'muro_metal') { g.fillStyle = '#9aa2a8'; g.fillRect(px + 3, py + 3, 4, 4); g.fillRect(px + 25, py + 25, 4, 4); }
      return;
    case 'cerca':
      g.fillStyle = d.col; g.fillRect(px, py + 13, T, 3); g.fillRect(px, py + 21, T, 3);
      g.fillStyle = '#6e4b2a'; g.fillRect(px + 3, py + 9, 4, 18); g.fillRect(px + 25, py + 9, 4, 18); return;
    case 'portao':
      g.fillStyle = d.col;
      if (o.open) { g.fillRect(px, py, 5, T); g.fillStyle = '#c9a54a'; g.fillRect(px + 1, py + 14, 3, 4); }
      else { g.fillRect(px, py + 6, T, 20); g.fillStyle = 'rgba(0,0,0,.25)'; for (let k = 1; k < 4; k++) g.fillRect(px + k * 8, py + 6, 1, 20); g.fillStyle = '#c9a54a'; g.fillRect(px + 14, py + 14, 4, 4); }
      return;
    case 'torre':
      g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(px + 4, py + 6, T, T);
      g.fillStyle = d.col; g.fillRect(px, py, 4, T); g.fillRect(px + T - 4, py, 4, T); g.fillRect(px, py, T, 4); g.fillRect(px, py + T - 4, T, 4);
      g.strokeStyle = d.col; g.lineWidth = 2; g.beginPath(); g.moveTo(px, py); g.lineTo(px + T, py + T); g.moveTo(px + T, py); g.lineTo(px, py + T); g.stroke();
      return;
    case 'bomba':
      g.fillStyle = '#c9c9c4'; g.fillRect(px + 4, py + 4, T - 8, T - 8);
      g.fillStyle = d.col; g.fillRect(px + 8, py + 6, T - 16, T - 12); g.fillStyle = '#222'; g.fillRect(px + 11, py + 10, 10, 5);
      return;
    case 'arbusto': return;
  }
  // móveis genéricos
  const inset = d.build ? 2 : 3;
  g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(px + inset + 2, py + inset + 3, T - inset * 2, T - inset * 2);
  g.fillStyle = d.col; g.fillRect(px + inset, py + inset, T - inset * 2, T - inset * 2);
  g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(px + inset, py + inset, T - inset * 2, 3);
  if (d.bed) { g.fillStyle = '#eef0f2'; g.fillRect(px + inset + 2, py + inset + 2, 9, T - inset * 2 - 4); }
  if (o.t === 'fogueira' && o.lit) { g.fillStyle = '#ff9a3a'; g.beginPath(); g.arc(px + 16, py + 16, 6, 0, 7); g.fill(); }
  if (d.ic) { g.font = '15px sans-serif'; g.fillText(d.ic, px + 16, py + 17); }
  if (d.cont && o.items && !o.items.length && !d.build) { g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(px + 22, py + 4, 6, 6); }
}

/* ---------- entidades ---------- */
function drawHuman(x, y, a, o) {
  const s = (o.scale || 1) * Z / TILE;
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(2 * s, 3 * s, 10 * s, 8 * s, 0, 0, 7); ctx.fill();
  ctx.rotate(a);
  if (o.down) {
    ctx.fillStyle = o.body; ctx.fillRect(-12 * s, -6 * s, 18 * s, 12 * s);
    ctx.fillStyle = o.skin; ctx.beginPath(); ctx.arc(10 * s, 0, 5.5 * s, 0, 7); ctx.fill();
    ctx.restore(); return;
  }
  const sw = Math.sin(o.t || 0) * 3 * s;
  // braços
  ctx.fillStyle = o.skin;
  if (o.zombie) { ctx.fillRect(2 * s, -9 * s + sw * 0.3, 11 * s, 3.5 * s); ctx.fillRect(2 * s, 5.5 * s - sw * 0.3, 11 * s, 3.5 * s); }
  else { ctx.fillRect(-2 * s + sw, -10 * s, 7 * s, 3.5 * s); ctx.fillRect(-2 * s - sw, 6.5 * s, 7 * s, 3.5 * s); }
  // corpo
  ctx.fillStyle = o.body; ctx.beginPath(); ctx.ellipse(0, 0, 6.5 * s, 10 * s, 0, 0, 7); ctx.fill();
  if (o.zombie) { ctx.fillStyle = 'rgba(90,10,10,.55)'; ctx.fillRect(-3 * s, -4 * s, 3 * s, 5 * s); }
  // arma
  if (o.weapon) {
    ctx.fillStyle = o.gun ? '#222' : '#8a8a8a';
    if (o.gun) ctx.fillRect(6 * s, 4 * s, 12 * s, 3 * s); else ctx.fillRect(4 * s, 6 * s, 13 * s, 2.5 * s);
  }
  // cabeça
  ctx.fillStyle = o.skin; ctx.beginPath(); ctx.arc(1 * s, 0, 5.5 * s, 0, 7); ctx.fill();
  ctx.fillStyle = o.hair || 'rgba(0,0,0,0)'; ctx.beginPath(); ctx.arc(-0.5 * s, 0, 5 * s, Math.PI * 0.5, Math.PI * 1.5); ctx.fill();
  if (o.zombie && o.eyes) { ctx.fillStyle = o.eyes; ctx.fillRect(4 * s, -2.5 * s, 1.8 * s, 1.8 * s); ctx.fillRect(4 * s, 1 * s, 1.8 * s, 1.8 * s); }
  ctx.restore();
}
function drawVehicle(v, sx, sy) {
  const d = VT[v.t], s = Z;
  ctx.save(); ctx.translate(sx, sy); ctx.rotate(v.a);
  const L = d.len * s, W = d.wid * s;
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(-L / 2 + 3, -W / 2 + 4, L, W);
  // pneus
  ctx.fillStyle = '#151515';
  const tw = Math.max(4, s * 0.22), th = Math.max(3, s * 0.12);
  if (d.moto) { ctx.fillRect(L / 2 - tw, -th / 2, tw, th); ctx.fillRect(-L / 2, -th / 2, tw, th); }
  else for (const [a, b] of [[0.32, -0.5], [0.32, 0.5], [-0.32, -0.5], [-0.32, 0.5]]) ctx.fillRect(a * L - tw / 2, b * W - th / 2, tw, th);
  ctx.fillStyle = v.hp <= 0 ? '#3a3633' : v.col;
  roundRect(-L / 2, -W / 2 + (d.moto ? W * 0.15 : 0), L, d.moto ? W * 0.7 : W, s * 0.18); ctx.fill();
  if (!d.moto) {
    ctx.fillStyle = v.t === 'caminhao' || v.t === 'caminhonete' || v.t === 'ambulancia' ? shade(v.col, -0.12) : shade(v.col, 0.12);
    if (v.t === 'caminhonete') ctx.fillRect(-L / 2 + 3, -W / 2 + 3, L * 0.42, W - 6);
    else if (v.t === 'caminhao') ctx.fillRect(-L / 2 + 2, -W / 2 + 2, L * 0.66, W - 4);
    else ctx.fillRect(-L * 0.22, -W / 2 + 3, L * 0.42, W - 6);
    ctx.fillStyle = v.hp < VT[v.t].hp * 0.3 ? '#6a7a80' : '#22313a';
    const wx = v.t === 'caminhao' ? L * 0.2 : v.t === 'trator' ? -L * 0.05 : L * 0.12;
    ctx.fillRect(wx, -W / 2 + 4, L * 0.12, W - 8);
    if (v.t === 'ambulancia') { ctx.fillStyle = '#d33'; ctx.fillRect(-L * 0.18, -3, L * 0.16, 6); ctx.fillRect(-L * 0.18 + L * 0.05, -W * 0.3, L * 0.06, W * 0.6); }
    if (VT[v.t].siren) { const on = v === S.player.inCar && v.on && Math.floor(performance.now() / 250) % 2; ctx.fillStyle = on ? '#4af' : '#246'; ctx.fillRect(-2, -W / 2 + 4, 5, W / 2 - 4); ctx.fillStyle = on ? '#246' : '#f44'; ctx.fillRect(-2, 0, 5, W / 2 - 4); }
    if (v.t === 'trator') { ctx.fillStyle = '#111'; ctx.fillRect(-L / 2 - 2, -W / 2 - 3, L * 0.4, 5); ctx.fillRect(-L / 2 - 2, W / 2 - 2, L * 0.4, 5); }
  } else { ctx.fillStyle = '#333'; ctx.fillRect(-L * 0.1, -W * 0.4, L * 0.25, W * 0.8); }
  // faróis
  ctx.fillStyle = v.lights || (v.on && daylight() < 0.5) ? '#fff7c0' : '#ccc';
  ctx.fillRect(L / 2 - 3, -W / 2 + 2, 3, 4); ctx.fillRect(L / 2 - 3, W / 2 - 6, 3, 4);
  ctx.fillStyle = '#a22'; ctx.fillRect(-L / 2, -W / 2 + 2, 2, 4); ctx.fillRect(-L / 2, W / 2 - 6, 2, 4);
  ctx.restore();
}
function roundRect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

/* ---------- quadro ---------- */
const PROF_SHIRT = { policial: '#2f4a7a', carpinteiro: '#9a6a3a', mecanico: '#3a5a7a', enfermeira: '#5ab0a0', agricultor: '#7a8a3a', escoteiro: '#5a7a4a', desempregado: '#8a5a7a' };
let rainDrops = [];
function render(now) {
  const p = S.player;
  Z = Math.max(18, Math.min(46, Math.min(VW, VH) / (touchMode ? 15 : 17))) * G.zoom;
  const lead = p.inCar ? 1.2 : 0.4;
  const tx = p.x + Math.cos(p.a) * lead * (p.inCar ? Math.min(1, Math.abs(p.inCar.sp) / 4) : 0), ty = p.y + Math.sin(p.a) * lead * (p.inCar ? Math.min(1, Math.abs(p.inCar.sp) / 4) : 0);
  G.cam.x += (tx - G.cam.x) * 0.15; G.cam.y += (ty - G.cam.y) * 0.15;
  if (Math.abs(G.cam.x - tx) > 10 || Math.abs(G.cam.y - ty) > 10) { G.cam.x = tx; G.cam.y = ty; }
  let shx = 0, shy = 0;
  if (G.shake > 0) { shx = rnd(-1, 1) * G.shake * 8; shy = rnd(-1, 1) * G.shake * 8; }
  const ox = VW / 2 - G.cam.x * Z + shx, oy = VH / 2 - G.cam.y * Z + shy;
  const sx = (x) => x * Z + ox, sy = (y) => y * Z + oy;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.fillStyle = '#0d0f0c'; ctx.fillRect(0, 0, VW, VH);
  ctx.imageSmoothingEnabled = false;
  const x0 = Math.floor((0 - ox) / Z) - 1, y0 = Math.floor((0 - oy) / Z) - 1, x1 = Math.ceil((VW - ox) / Z) + 1, y1 = Math.ceil((VH - oy) / Z) + 1;
  // terreno
  for (let cy = Math.floor(Math.max(0, y0) / CH); cy <= Math.floor(Math.min(MAP_H - 1, y1) / CH); cy++)
    for (let cx = Math.floor(Math.max(0, x0) / CH); cx <= Math.floor(Math.min(MAP_W - 1, x1) / CH); cx++) {
      const c = getChunk(cx, cy);
      ctx.drawImage(c.canvas, Math.round(sx(cx * CH)), Math.round(sy(cy * CH)), Math.ceil(CH * Z) + 1, Math.ceil(CH * Z) + 1);
    }
  ctx.imageSmoothingEnabled = true;
  // sangue
  for (const b of S.blood) {
    if (b[0] < x0 || b[0] > x1 || b[1] < y0 || b[1] > y1) continue;
    ctx.fillStyle = ['rgba(120,10,10,.55)', 'rgba(90,5,5,.5)', 'rgba(140,20,15,.45)'][b[3]];
    ctx.beginPath(); ctx.arc(sx(b[0]), sy(b[1]), b[2] * Z, 0, 7); ctx.fill();
  }
  // construção: fantasma
  if (G.buildSel) {
    const [bx, by] = buildTarget(); const err = canBuild(G.buildSel, bx, by);
    ctx.fillStyle = err ? 'rgba(220,60,50,.35)' : 'rgba(90,220,120,.35)'; ctx.strokeStyle = err ? '#e55' : '#6e6';
    ctx.fillRect(sx(bx), sy(by), Z, Z); ctx.lineWidth = 2; ctx.strokeRect(sx(bx) + 1, sy(by) + 1, Z - 2, Z - 2);
  }
  // veículos
  for (const v of S.vehs) {
    if (v.x < x0 - 2 || v.x > x1 + 2 || v.y < y0 - 2 || v.y > y1 + 2) continue;
    if (!G.vis[ix(Math.floor(v.x), Math.floor(v.y))] && !S.seen[ix(Math.floor(v.x), Math.floor(v.y))]) continue;
    drawVehicle(v, sx(v.x), sy(v.y));
  }
  const t = now / 1000;
  // animais
  for (const a of S.ani) {
    if (a.x < x0 || a.x > x1 || a.y < y0 || a.y > y1 || !seesAt(a.x, a.y)) continue;
    ctx.save(); ctx.translate(sx(a.x), sy(a.y)); ctx.rotate(a.a);
    const s = Z / TILE;
    if (a.t === 'coelho') { ctx.fillStyle = '#9a8060'; ctx.beginPath(); ctx.ellipse(0, 0, 6 * s, 4 * s, 0, 0, 7); ctx.fill(); ctx.fillRect(4 * s, -3 * s, 5 * s, 1.5 * s); ctx.fillRect(4 * s, 1.5 * s, 5 * s, 1.5 * s); ctx.fillStyle = '#eee'; ctx.beginPath(); ctx.arc(-6 * s, 0, 2 * s, 0, 7); ctx.fill(); }
    else { ctx.fillStyle = '#a07a50'; ctx.beginPath(); ctx.ellipse(0, 0, 13 * s, 6 * s, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(13 * s, 0, 4 * s, 0, 7); ctx.fill(); ctx.strokeStyle = '#5a4030'; ctx.lineWidth = 1.5 * s; ctx.beginPath(); ctx.moveTo(14 * s, -2 * s); ctx.lineTo(18 * s, -7 * s); ctx.moveTo(14 * s, 2 * s); ctx.lineTo(18 * s, 7 * s); ctx.stroke(); }
    ctx.restore();
  }
  // zumbis
  for (const z of S.zs) {
    if (z.x < x0 || z.x > x1 || z.y < y0 || z.y > y1 || !seesAt(z.x, z.y)) continue;
    const d = ZT[z.t];
    drawHuman(sx(z.x), sy(z.y), z.a, { zombie: 1, body: z.shirt, skin: d.col, hair: '#3a3a2a', down: z.down > 0, scale: z.t === 'brutamontes' ? 1.45 : 1, t: t * (d.spd * 4) + z.seed, eyes: z.t === 'corredor' ? '#ff3a2a' : z.st === 'chase' ? '#d0d090' : null });
  }
  // sobreviventes
  ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
  for (const n of S.npcs) {
    if (n.dead || n.away || n.inCar || !seesAt(n.x, n.y) || n.x < x0 || n.x > x1 || n.y < y0 || n.y > y1) continue;
    const w = n.wp && ITEMS[n.wp];
    drawHuman(sx(n.x), sy(n.y), n.a, { body: NPC_KINDS[n.kind].col, skin: '#d9a77a', hair: '#3a2a1a', t: t * 6, weapon: !!w, gun: w && w.wp && w.wp.gun });
    if (dist(n.x, n.y, p.x, p.y) < 7) { ctx.font = `700 ${Math.max(10, Z * 0.32)}px Nunito, sans-serif`; ctx.fillStyle = n.hostile ? '#ff8a7a' : '#fff'; ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.lineWidth = 3; const lb = n.name + (n.st === 'seguir' ? ' ★' : ''); ctx.strokeText(lb, sx(n.x), sy(n.y) - Z * 0.45); ctx.fillText(lb, sx(n.x), sy(n.y) - Z * 0.45); }
  }
  // jogador
  if (!p.inCar) {
    const it = p.eq.mao;
    drawHuman(sx(p.x), sy(p.y), p.a, { body: p.hitT > 0 ? '#c44' : PROF_SHIRT[p.prof] || '#556', skin: '#e0b08a', hair: '#2a1d14', t: G.input.moving ? t * (G.input.run ? 14 : 9) : 0, weapon: !!it, gun: it && ITEMS[it.k].wp && ITEMS[it.k].wp.gun, down: p.sleeping });
  }
  // telhados por cima do que não se vê
  const inB = bldAt(Math.floor(p.x), Math.floor(p.y));
  for (let yy = Math.max(0, y0); yy <= Math.min(MAP_H - 1, y1); yy++) for (let xx = Math.max(0, x0); xx <= Math.min(MAP_W - 1, x1); xx++) {
    const i = ix(xx, yy), b = S.room[i] - 1; if (b < 0 || b === inB) continue;
    if (G.vis[i]) continue;
    const tt = S.tiles[i]; if (tt === TL.BURNT || tt === TL.RUBBLE) continue;
    const B = S.bld[b];
    ctx.fillStyle = (xx + yy) % 2 ? B.roof : shade(B.roof, -0.06);
    ctx.fillRect(sx(xx) - 0.5, sy(yy) - 0.5, Z + 1, Z + 1);
    if (yy === B.y || xx === B.x || xx === B.x + B.w - 1 || yy === B.y + B.h - 1) { ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(sx(xx), sy(yy), Z, Z); }
  }
  // fogo
  for (const k of Object.keys(S.fires)) {
    const i = +k, fx = i % MAP_W, fy = Math.floor(i / MAP_W);
    if (fx < x0 || fx > x1 || fy < y0 || fy > y1) continue;
    for (let n = 0; n < 4; n++) {
      const ph = t * 7 + n * 1.7 + fx * 3.1 + fy * 1.3;
      ctx.fillStyle = n % 2 ? 'rgba(255,170,40,.85)' : 'rgba(255,90,20,.8)';
      ctx.beginPath(); ctx.arc(sx(fx + 0.25 + (n % 2) * 0.5), sy(fy + 0.6 - (n > 1 ? 0.3 : 0)) - Math.abs(Math.sin(ph)) * Z * 0.2, Z * (0.22 + 0.08 * Math.sin(ph)), 0, 7); ctx.fill();
    }
  }
  // efeitos
  for (const f of G.fx) {
    if (f.k === 'swing') { ctx.strokeStyle = `rgba(255,255,255,${0.6 * (1 - f.t / f.d)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(sx(f.x), sy(f.y), f.r * Z, f.a - 0.9, f.a + 0.9); ctx.stroke(); }
    else if (f.k === 'bang') { ctx.strokeStyle = `rgba(255,220,180,${1 - f.t / f.d})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(sx(f.x), sy(f.y), Z * (0.3 + f.t * 2), 0, 7); ctx.stroke(); }
    else if (f.k === 'throw') { const k = f.t / f.d; ctx.fillStyle = '#7ad'; ctx.beginPath(); ctx.arc(sx(lerp(f.x0, f.x1, k)), sy(lerp(f.y0, f.y1, k)) - Math.sin(k * Math.PI) * Z, Z * 0.15, 0, 7); ctx.fill(); }
  }
  for (const tr of G.tracers) { ctx.strokeStyle = 'rgba(255,240,160,.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx(tr.x0), sy(tr.y0)); ctx.lineTo(sx(tr.x1), sy(tr.y1)); ctx.stroke(); }
  for (const r of G.rings) { const k = r.t / 0.8; ctx.strokeStyle = `rgba(255,255,255,${0.35 * (1 - k)})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(sx(r.x), sy(r.y), r.r * Z * k, 0, 7); ctx.stroke(); }
  // névoa de guerra (fora da visão)
  const dl = daylight();
  ctx.fillStyle = `rgba(8,10,14,${0.5 + (1 - dl) * 0.2})`;
  for (let yy = Math.max(0, y0); yy <= Math.min(MAP_H - 1, y1); yy++) {
    let run = -1;
    for (let xx = Math.max(0, x0); xx <= Math.min(MAP_W - 1, x1) + 1; xx++) {
      const hidden = xx <= Math.min(MAP_W - 1, x1) && !G.vis[ix(xx, yy)];
      if (hidden && run < 0) run = xx;
      if (!hidden && run >= 0) { ctx.fillRect(sx(run) - 0.5, sy(yy) - 0.5, (xx - run) * Z + 1, Z + 1); run = -1; }
    }
  }
  // iluminação noturna
  const dark = (1 - dl) * 0.86 + (S.weather.k === 'tempestade' ? 0.15 : S.weather.k === 'chuva' ? 0.08 : 0) * dl;
  if (dark > 0.02) {
    lctx.globalCompositeOperation = 'source-over'; lctx.clearRect(0, 0, lightCv.width, lightCv.height);
    lctx.fillStyle = `rgba(4,7,18,${Math.min(0.92, dark)})`; lctx.fillRect(0, 0, lightCv.width, lightCv.height);
    lctx.globalCompositeOperation = 'destination-out';
    const hole = (x, y, r, a = 1) => { const g = lctx.createRadialGradient(x / 2, y / 2, 0, x / 2, y / 2, r / 2); g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(1, 'rgba(0,0,0,0)'); lctx.fillStyle = g; lctx.beginPath(); lctx.arc(x / 2, y / 2, r / 2, 0, 7); lctx.fill(); };
    hole(sx(p.x), sy(p.y), Z * 4.5, 0.75);
    if (p.light && !p.inCar) { // lanterna: cone
      lctx.save(); lctx.translate(sx(p.x) / 2, sy(p.y) / 2); lctx.rotate(p.a);
      const g = lctx.createRadialGradient(0, 0, 0, 0, 0, Z * 6); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      lctx.fillStyle = g; lctx.beginPath(); lctx.moveTo(0, 0); lctx.arc(0, 0, Z * 6, -0.45, 0.45); lctx.closePath(); lctx.fill(); lctx.restore();
    }
    for (const v of S.vehs) if (v.lights && v.bat > 0 && Math.abs(v.x - G.cam.x) < 30 && Math.abs(v.y - G.cam.y) < 30) {
      lctx.save(); lctx.translate(sx(v.x) / 2, sy(v.y) / 2); lctx.rotate(v.a);
      const g = lctx.createRadialGradient(0, 0, 0, 0, 0, Z * 7); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      lctx.fillStyle = g; lctx.beginPath(); lctx.moveTo(0, 0); lctx.arc(0, 0, Z * 7, -0.35, 0.35); lctx.closePath(); lctx.fill(); lctx.restore();
    }
    for (const k of Object.keys(S.fires)) { const i = +k, fx = i % MAP_W + 0.5, fy = Math.floor(i / MAP_W) + 0.5; if (fx > x0 - 6 && fx < x1 + 6 && fy > y0 - 6 && fy < y1 + 6) hole(sx(fx), sy(fy), Z * (4 + Math.sin(t * 9 + i) * 0.3), 0.9); }
    for (const [k, o] of Object.entries(S.objs)) {
      if (!((o.t === 'fogueira' && o.lit) || (o.t === 'gerador' && o.on))) continue;
      const i = +k, fx = i % MAP_W + 0.5, fy = Math.floor(i / MAP_W) + 0.5; if (fx > x0 - 12 && fx < x1 + 12 && fy > y0 - 12 && fy < y1 + 12) hole(sx(fx), sy(fy), Z * (o.t === 'gerador' ? 12 : 4), 0.85);
    }
    // casas com luz
    if (dl < 0.5) for (const [bi, B] of S.bld.entries()) {
      if (!B.lit || B.x > x1 || B.x + B.w < x0 || B.y > y1 || B.y + B.h < y0) continue;
      if (!powered(B.x, B.y)) continue;
      lctx.fillStyle = 'rgba(0,0,0,.8)'; lctx.fillRect(sx(B.x) / 2, sy(B.y) / 2, B.w * Z / 2, B.h * Z / 2);
    }
    ctx.drawImage(lightCv, 0, 0, VW, VH);
    if (dl < 0.5) for (const B of S.bld) { if (!B.lit || B.x > x1 || B.x + B.w < x0 || B.y > y1 || B.y + B.h < y0 || !powered(B.x, B.y)) continue; ctx.fillStyle = 'rgba(255,200,110,.08)'; ctx.fillRect(sx(B.x), sy(B.y), B.w * Z, B.h * Z); }
  }
  // chuva
  if (S.rain > 0.05) {
    const n = Math.floor(S.rain * 180);
    while (rainDrops.length < n) rainDrops.push([Math.random() * VW, Math.random() * VH, rnd(0.6, 1)]);
    rainDrops.length = n;
    ctx.strokeStyle = 'rgba(180,200,230,.45)'; ctx.lineWidth = 1; ctx.beginPath();
    for (const d of rainDrops) { d[1] += 14 * d[2]; d[0] -= 3 * d[2]; if (d[1] > VH) { d[1] = -10; d[0] = Math.random() * VW; } ctx.moveTo(d[0], d[1]); ctx.lineTo(d[0] + 3, d[1] - 12 * d[2]); }
    ctx.stroke();
    ctx.fillStyle = `rgba(40,55,70,${S.rain * 0.12})`; ctx.fillRect(0, 0, VW, VH);
  }
  // neblina
  if (S.fog > 0.05) {
    const g = ctx.createRadialGradient(VW / 2, VH / 2, Z * 3, VW / 2, VH / 2, Math.max(VW, VH) * 0.6);
    g.addColorStop(0, 'rgba(190,195,200,0)'); g.addColorStop(1, `rgba(190,195,200,${0.75 * S.fog})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
  }
  if (G.flash > 0) { ctx.fillStyle = `rgba(255,250,230,${Math.min(0.6, G.flash * 3)})`; ctx.fillRect(0, 0, VW, VH); }
  if (p.sleeping) { ctx.fillStyle = 'rgba(0,0,10,.55)'; ctx.fillRect(0, 0, VW, VH); }
  // textos flutuantes
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const f of G.floats) {
    ctx.globalAlpha = Math.max(0, 1 - f.t / 1.1);
    ctx.font = `800 ${Math.max(11, Z * 0.36)}px Nunito, sans-serif`; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.75)';
    ctx.strokeText(String(f.text), sx(f.x), sy(f.y) - f.t * Z * 0.8); ctx.fillStyle = f.col; ctx.fillText(String(f.text), sx(f.x), sy(f.y) - f.t * Z * 0.8);
  }
  ctx.globalAlpha = 1;
  // vinheta de dano
  if (p.hp < 35 || p.hitT > 0) {
    const a = p.hitT > 0 ? 0.45 : (35 - p.hp) / 60;
    const g = ctx.createRadialGradient(VW / 2, VH / 2, Math.min(VW, VH) * 0.3, VW / 2, VH / 2, Math.max(VW, VH) * 0.7);
    g.addColorStop(0, 'rgba(160,0,0,0)'); g.addColorStop(1, `rgba(160,0,0,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
  }
}
function updateFx(dt) {
  const lim = { fx: (f) => f.d, floats: () => 1.1, rings: () => 0.8 };
  for (const [k, f] of Object.entries(lim)) { const a = G[k]; for (let i = a.length - 1; i >= 0; i--) { a[i].t += dt; if (a[i].t >= f(a[i])) a.splice(i, 1); } }
  for (let i = G.tracers.length - 1; i >= 0; i--) { G.tracers[i].t -= dt; if (G.tracers[i].t <= 0) G.tracers.splice(i, 1); }
  G.flash = Math.max(0, G.flash - dt); G.shake = Math.max(0, G.shake - dt * 1.5);
}
function screenToWorld(x, y) { return { x: (x - VW / 2) / Z + G.cam.x, y: (y - VH / 2) / Z + G.cam.y }; }

/* ---------- mapa ---------- */
function drawMap(canvas) {
  const g = canvas.getContext('2d'), sc = canvas.width / MAP_W;
  const img = g.createImageData(MAP_W, MAP_H);
  const MC = { [TL.GRASS]: [86, 125, 62], [TL.ROAD]: [70, 72, 75], [TL.WALK]: [150, 150, 142], [TL.DIRT]: [138, 107, 71], [TL.WATER]: [47, 111, 154], [TL.TREE]: [40, 80, 38], [TL.FLOOR]: [180, 160, 130], [TL.WALL]: [60, 52, 48], [TL.DOOR]: [140, 90, 50], [TL.WINDOW]: [140, 190, 220], [TL.FIELD]: [120, 100, 50], [TL.SAND]: [212, 192, 138], [TL.PARK]: [90, 92, 95], [TL.BURNT]: [40, 36, 33], [TL.RUBBLE]: [90, 85, 80], [TL.TILEF]: [180, 160, 130], [TL.BUSH]: [60, 110, 60] };
  for (let i = 0; i < MAP_W * MAP_H; i++) {
    const c = S.seen[i] ? (S.room[i] && S.tiles[i] === TL.FLOOR ? hexRgb(S.bld[S.room[i] - 1].roof) : MC[S.tiles[i]] || [0, 0, 0]) : [18, 20, 18];
    img.data[i * 4] = c[0]; img.data[i * 4 + 1] = c[1]; img.data[i * 4 + 2] = c[2]; img.data[i * 4 + 3] = 255;
  }
  const tmp = document.createElement('canvas'); tmp.width = MAP_W; tmp.height = MAP_H; tmp.getContext('2d').putImageData(img, 0, 0);
  g.imageSmoothingEnabled = false; g.drawImage(tmp, 0, 0, canvas.width, canvas.height);
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `${Math.max(9, sc * 5)}px sans-serif`;
  // nomes de lugares já vistos
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
