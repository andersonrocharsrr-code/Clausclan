/* Último Dia — desenho: terreno em blocos cacheados, entidades, luz, clima e efeitos (a arte fica em art.js). */
'use strict';

const CH = 12; // tiles por bloco cacheado
const chunks = new Map();
const cv = document.getElementById('game');
const ctx = cv.getContext('2d');
const lightCv = document.createElement('canvas');
const lctx = lightCv.getContext('2d');
let VW = 0, VH = 0, DPR = 1, Z = 32, RES = 1;
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

G.chunkDirty = (x, y) => {
  // o tile e os vizinhos (sombras, meio-fio e cantos dependem deles)
  for (const [a, b] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) { const c = chunks.get(Math.floor((x + a) / CH) * 100 + Math.floor((y + b) / CH)); if (c) c.dirty = 1; }
};
G.chunkDirtyAll = () => { for (const c of chunks.values()) c.dirty = 1; };
G.resetChunks = () => { chunks.clear(); G.resetRoofs(); };

/* ---------- blocos de terreno ---------- */
function getChunk(cx, cy) {
  const k = cx * 100 + cy;
  let c = chunks.get(k);
  if (!c) {
    if (chunks.size > 30) { // descarta o mais antigo
      let old = null, ot = 1e18; for (const [kk, cc] of chunks) if (cc.used < ot) { ot = cc.used; old = kk; }
      chunks.delete(old);
    }
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = Math.ceil(CH * TILE * RES);
    c = { canvas, ctx: canvas.getContext('2d'), dirty: 1, used: 0 };
    chunks.set(k, c);
  }
  c.used = performance.now();
  if (c.dirty) { drawChunk(c, cx, cy); c.dirty = 0; }
  return c;
}
function drawChunk(c, cx, cy) {
  const g = c.ctx; g.setTransform(RES, 0, 0, RES, 0, 0); g.clearRect(0, 0, CH * TILE, CH * TILE);
  for (let ty = 0; ty < CH; ty++) for (let tx = 0; tx < CH; tx++) {
    const x = cx * CH + tx, y = cy * CH + ty; if (!inb(x, y)) continue;
    drawTile(g, x, y, tx * TILE, ty * TILE);
  }
  for (let ty = 0; ty < CH; ty++) for (let tx = 0; tx < CH; tx++) {
    const x = cx * CH + tx, y = cy * CH + ty; if (!inb(x, y)) continue;
    const o = S.objs[ix(x, y)]; if (o) drawObj(g, o, x, y, tx * TILE, ty * TILE);
  }
}

/* ---------- quadro ---------- */
const PROF_SHIRT = { policial: '#2f4a7a', carpinteiro: '#9a6a3a', mecanico: '#3a5a7a', enfermeira: '#5ab0a0', agricultor: '#7a8a3a', escoteiro: '#5a7a4a', desempregado: '#8a5a7a' };
let rainDrops = [];
function render(now) {
  const p = S.player;
  Z = Math.max(18, Math.min(46, Math.min(VW, VH) / (touchMode ? 15 : 17))) * G.zoom;
  // resolução dos blocos acompanha o zoom e a tela (nítido no celular)
  const want = clamp(Math.round(Z * DPR / TILE * 2) / 2, 1, 2);
  if (want !== RES) { RES = want; chunks.clear(); G.resetRoofs(); }
  if (treeRes !== RES) buildTreeSprites(RES);
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
  ctx.imageSmoothingEnabled = true;
  const x0 = Math.floor((0 - ox) / Z) - 1, y0 = Math.floor((0 - oy) / Z) - 1, x1 = Math.ceil((VW - ox) / Z) + 1, y1 = Math.ceil((VH - oy) / Z) + 1;
  // terreno
  for (let cy = Math.floor(Math.max(0, y0) / CH); cy <= Math.floor(Math.min(MAP_H - 1, y1) / CH); cy++)
    for (let cx = Math.floor(Math.max(0, x0) / CH); cx <= Math.floor(Math.min(MAP_W - 1, x1) / CH); cx++) {
      const c = getChunk(cx, cy);
      ctx.drawImage(c.canvas, Math.round(sx(cx * CH)), Math.round(sy(cy * CH)), Math.ceil(CH * Z) + 1, Math.ceil(CH * Z) + 1);
    }
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
  // árvores: sombras no chão (as copas vêm depois das pessoas)
  const trees = [];
  for (let yy = Math.max(0, y0 - 1); yy <= Math.min(MAP_H - 1, y1 + 1); yy++) for (let xx = Math.max(0, x0 - 1); xx <= Math.min(MAP_W - 1, x1 + 1); xx++) {
    if (S.tiles[ix(xx, yy)] !== TL.TREE) continue;
    const tr = treeAt(xx, yy); tr.x = xx + 0.5 + tr.ox; tr.y = yy + 0.5 + tr.oy; trees.push(tr);
  }
  ctx.fillStyle = 'rgba(8,20,8,.3)';
  ctx.beginPath();
  for (const tr of trees) { const ex = sx(tr.x + 0.3 * tr.s), ey = sy(tr.y + 0.35 * tr.s), rx = Z * 0.95 * tr.s; ctx.moveTo(ex + rx, ey); ctx.ellipse(ex, ey, rx, Z * 0.8 * tr.s, 0, 0, Math.PI * 2); }
  ctx.fill();
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
    drawHuman(sx(z.x), sy(z.y), z.a, { zombie: 1, body: z.shirt, skin: d.col, hair: z.seed % 3 ? HAIR[z.seed % HAIR.length] : null, down: z.down > 0, scale: z.t === 'brutamontes' ? 1.45 : 1, t: t * (d.spd * 4) + z.seed, eyes: z.t === 'corredor' ? '#ff3a2a' : z.st === 'chase' ? '#d0d090' : null });
  }
  // sobreviventes
  ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
  for (const n of S.npcs) {
    if (n.dead || n.away || n.inCar || !seesAt(n.x, n.y) || n.x < x0 || n.x > x1 || n.y < y0 || n.y > y1) continue;
    const w = n.wp && ITEMS[n.wp];
    drawHuman(sx(n.x), sy(n.y), n.a, { body: NPC_KINDS[n.kind].col, skin: ['#d9a77a', '#a8754a', '#7a5032', '#e8c4a0'][n.id % 4], hair: HAIR[n.id % HAIR.length], t: t * 6, weapon: !!w, gun: w && w.wp && w.wp.gun, pack: n.kind === 'comerciante' ? '#6a5a3a' : null });
    if (dist(n.x, n.y, p.x, p.y) < 7) { ctx.font = `700 ${Math.max(10, Z * 0.32)}px Nunito, sans-serif`; ctx.fillStyle = n.hostile ? '#ff8a7a' : '#fff'; ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.lineWidth = 3; const lb = n.name + (n.st === 'seguir' ? ' ★' : ''); ctx.strokeText(lb, sx(n.x), sy(n.y) - Z * 0.45); ctx.fillText(lb, sx(n.x), sy(n.y) - Z * 0.45); }
  }
  // jogador
  if (!p.inCar) {
    const it = p.eq.mao;
    drawHuman(sx(p.x), sy(p.y), p.a, { body: p.hitT > 0 ? '#c44' : PROF_SHIRT[p.prof] || '#556', skin: '#e0b08a', hair: '#2a1d14', pack: p.eq.costas ? '#4a5a3a' : null, t: G.input.moving ? t * (G.input.run ? 14 : 9) : 0, weapon: !!it, gun: it && ITEMS[it.k].wp && ITEMS[it.k].wp.gun, down: p.sleeping });
  }
  // telhados por cima do que não se vê (desenho do prédio inteiro, recortado por tile)
  const inB = bldAt(Math.floor(p.x), Math.floor(p.y));
  const roofHere = (i) => { const b = S.room[i] - 1; if (b < 0 || b === inB) return -1; if (G.vis[i] && dist2(i % MAP_W + 0.5, Math.floor(i / MAP_W) + 0.5, p.x, p.y) < 49) return -1; const tt = S.tiles[i]; return tt === TL.BURNT || tt === TL.RUBBLE ? -1 : b; };
  for (let yy = Math.max(0, y0); yy <= Math.min(MAP_H - 1, y1); yy++) {
    let xx = Math.max(0, x0); const xe = Math.min(MAP_W - 1, x1);
    while (xx <= xe) {
      const b = roofHere(ix(xx, yy)); if (b < 0) { xx++; continue; }
      let e = xx; while (e + 1 <= xe && roofHere(ix(e + 1, yy)) === b) e++;
      const B = S.bld[b], rc = roofCanvas(b, RES), k = TILE * RES;
      ctx.drawImage(rc, (xx - B.x) * k, (yy - B.y) * k, (e - xx + 1) * k, k, sx(xx) - 0.3, sy(yy) - 0.3, (e - xx + 1) * Z + 0.6, Z + 0.6);
      xx = e + 1;
    }
  }
  // copas das árvores (ficam transparentes quando o jogador passa embaixo)
  for (const tr of trees) {
    const spr = treeSprites[tr.k][tr.v], sz = Z * 2.4 * tr.s;
    const near = dist2(tr.x, tr.y, p.x, p.y) < 1.6 * 1.6 && !p.inCar;
    if (near) ctx.globalAlpha = 0.45;
    ctx.drawImage(spr, sx(tr.x) - sz / 2, sy(tr.y) - sz / 2, sz, sz);
    if (near) ctx.globalAlpha = 1;
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
      const hidden = xx <= Math.min(MAP_W - 1, x1) && !G.vis[ix(xx, yy)] && roofHere(ix(xx, yy)) < 0;
      if (hidden && run < 0) run = xx;
      if (!hidden && run >= 0) { const ya = Math.round(sy(yy)), xa = Math.round(sx(run)); ctx.fillRect(xa, ya, Math.round(sx(xx)) - xa, Math.round(sy(yy + 1)) - ya); run = -1; }
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
    // postes de rua (enquanto houver energia)
    const lamps = [];
    if (dl < 0.6 && gridPower()) {
      const LM = lampMap();
      for (let yy = Math.max(0, y0 - 3); yy <= Math.min(MAP_H - 1, y1 + 3); yy++) for (let xx = Math.max(0, x0 - 3); xx <= Math.min(MAP_W - 1, x1 + 3); xx++) {
        if (!LM[ix(xx, yy)]) continue;
        let dx = 0, dy = 0; for (const [a, b] of N4) if (tileAt(xx + a, yy + b) === TL.ROAD) { dx = a; dy = b; }
        const lx = xx + 0.5 + dx * 0.375, ly = yy + 0.5 + dy * 0.375; lamps.push([lx, ly]); hole(sx(lx), sy(ly), Z * 3.8, 0.7);
      }
    }
    // casas com luz
    if (dl < 0.5) for (const [bi, B] of S.bld.entries()) {
      if (!B.lit || B.x > x1 || B.x + B.w < x0 || B.y > y1 || B.y + B.h < y0) continue;
      if (!powered(B.x, B.y)) continue;
      lctx.fillStyle = 'rgba(0,0,0,.8)'; lctx.fillRect(sx(B.x) / 2, sy(B.y) / 2, B.w * Z / 2, B.h * Z / 2);
    }
    ctx.drawImage(lightCv, 0, 0, VW, VH);
    for (const [lx, ly] of lamps) { const gr = ctx.createRadialGradient(sx(lx), sy(ly), 0, sx(lx), sy(ly), Z * 2.6); gr.addColorStop(0, 'rgba(255,214,140,.22)'); gr.addColorStop(1, 'rgba(255,214,140,0)'); ctx.fillStyle = gr; ctx.fillRect(sx(lx) - Z * 2.6, sy(ly) - Z * 2.6, Z * 5.2, Z * 5.2); }
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
