/* Último Dia — mundo: gerador de mapa, estado do jogo, salvar/carregar e consultas de tile. */
'use strict';

/* ---------- utilidades ---------- */
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const dist2 = (ax, ay, bx, by) => (ax - bx) * (ax - bx) + (ay - by) * (ay - by);
const dist = (ax, ay, bx, by) => Math.sqrt(dist2(ax, ay, bx, by));
function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
let R = Math.random; // trocado pelo gerador com semente durante a geração
const rnd = (a, b) => a + R() * (b - a);
const rint = (a, b) => Math.floor(a + R() * (b - a + 1));
const pick = (arr) => arr[Math.floor(R() * arr.length)];
const chance = (p) => R() < p;
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function wpick(list) { // [[valor, peso], ...]
  let tot = 0; for (const e of list) tot += e[1];
  let r = R() * tot;
  for (const e of list) { r -= e[1]; if (r <= 0) return e; }
  return list[list.length - 1];
}
function valueNoise(seed) {
  const rr = mulberry(seed); const g = new Float32Array(64 * 64);
  for (let i = 0; i < g.length; i++) g[i] = rr();
  const at = (x, y) => g[((y & 63) << 6) | (x & 63)];
  const sm = (t) => t * t * (3 - 2 * t);
  const n1 = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = sm(x - xi), yf = sm(y - yi);
    return lerp(lerp(at(xi, yi), at(xi + 1, yi), xf), lerp(at(xi, yi + 1), at(xi + 1, yi + 1), xf), yf);
  };
  return (x, y) => n1(x / 14, y / 14) * 0.6 + n1(x / 6 + 17, y / 6 + 9) * 0.3 + n1(x / 2.5 + 3, y / 2.5 + 41) * 0.1;
}

/* ---------- estado ---------- */
let S = null;
const ix = (x, y) => y * MAP_W + x;
const inb = (x, y) => x >= 0 && y >= 0 && x < MAP_W && y < MAP_H;
const tileAt = (x, y) => (inb(x, y) ? S.tiles[ix(x, y)] : TL.TREE);
const objAt = (x, y) => (inb(x, y) ? S.objs[ix(x, y)] : null);
const tsAt = (x, y) => S.ts[ix(x, y)];
const bldAt = (x, y) => (inb(x, y) ? S.room[ix(x, y)] - 1 : -1);
const isInside = (x, y) => bldAt(Math.floor(x), Math.floor(y)) >= 0 && tileAt(Math.floor(x), Math.floor(y)) !== TL.DOOR;

function newItem(k, opts = {}) {
  const d = ITEMS[k]; const it = { k };
  if (d.st) it.q = opts.q || 1;
  if (d.sp) it.t = opts.t != null ? opts.t : 0; // idade em horas
  if (d.uses) it.u = opts.u != null ? opts.u : d.uses;
  if (d.water) it.w = opts.w != null ? opts.w : (k === 'garrafa' ? rint(0, d.water) : 0);
  if (d.fuel) it.f = opts.fuel != null ? opts.fuel : rint(0, 4);
  if (d.charge) it.c = opts.c != null ? opts.c : rint(30, 100);
  if (d.wp && !d.wp.gun) it.d = opts.d != null ? opts.d : d.wp.dur * rnd(0.5, 1);
  if (d.wp && d.wp.gun) { it.a = opts.ammo != null ? opts.ammo : (chance(0.5) ? rint(0, d.wp.mag) : 0); it.d = d.wp.dur * rnd(0.6, 1); }
  if (opts.kid != null) it.kid = opts.kid;
  return it;
}

function rollLoot(tableKey, mult = 1) {
  const tb = LOOT[tableKey]; if (!tb) return [];
  const out = [];
  let n = rint(tb.n[0], tb.n[1]);
  n = Math.round(n * mult);
  for (let i = 0; i < n; i++) {
    const e = wpick(tb.t); const k = e[0];
    if (ITEMS[k].st) addTo(out, newItem(k, { q: rint(e[2] || 1, e[3] || 1) }));
    else out.push(newItem(k, ITEMS[k].sp ? { t: rnd(0, ITEMS[k].sp * 0.4) } : {}));
  }
  return out;
}

// junta pilhas iguais
function addTo(list, it) {
  if (ITEMS[it.k].st) {
    const same = list.find((o) => o.k === it.k);
    if (same) { same.q += it.q; return same; }
  }
  list.push(it); return it;
}

/* ---------- geração ---------- */
function genWorld(seed, prof) {
  R = mulberry(seed);
  const tiles = new Uint8Array(MAP_W * MAP_H);
  const room = new Int16Array(MAP_W * MAP_H);
  S = {
    v: 1, seed, time: START_MIN, tiles, room, seen: new Uint8Array(MAP_W * MAP_H),
    bld: [], ts: {}, objs: {}, zs: [], npcs: [], vehs: [], hordes: [], fires: {}, blood: [],
    nid: 1, ani: [], weather: { k: 'sol', until: START_MIN + 360, wet: 0 }, rain: 0, fog: 0,
    powerOff: rint(3, 6) * 24 * 60 + rint(0, 23) * 60, waterOff: rint(5, 9) * 24 * 60 + rint(0, 23) * 60,
    stats: { kills: 0, made: 0, start: START_MIN }, events: [], radioLog: [], flags: {},
    nextHorde: START_MIN + 30 * 60, nextRaid: START_MIN + 4 * 24 * 60, notes: [],
  };
  const noise = valueNoise(seed + 7);
  const set = (x, y, t) => { if (inb(x, y)) tiles[ix(x, y)] = t; };
  const fill = (x0, y0, w, h, t) => { for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) set(x, y, t); };

  // terreno base: grama e floresta
  for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) {
    const n = noise(x, y);
    const inTown = x > 24 && x < 118 && y > 24 && y < 118;
    let t = TL.GRASS;
    if (!inTown && n > 0.56) t = TL.TREE;
    else if (!inTown && n > 0.52 && chance(0.35)) t = TL.TREE;
    else if (!inTown && n > 0.47 && chance(0.04)) t = TL.BUSH;
    else if (inTown && chance(0.012)) t = TL.TREE;
    else if (chance(0.02)) t = TL.DIRT;
    tiles[ix(x, y)] = t;
  }
  // borda do mapa: mata fechada
  for (let i = 0; i < MAP_W; i++) for (let b = 0; b < 3; b++) { set(i, b, TL.TREE); set(i, MAP_H - 1 - b, TL.TREE); set(b, i, TL.TREE); set(MAP_W - 1 - b, i, TL.TREE); }

  // lago
  const lakes = [[rint(12, 20), rint(118, 130), rint(7, 10), rint(5, 8)], [rint(124, 134), rint(14, 22), rint(6, 9), rint(5, 7)]];
  for (const [cx, cy, rx, ry] of lakes) {
    for (let y = cy - ry - 2; y <= cy + ry + 2; y++) for (let x = cx - rx - 2; x <= cx + rx + 2; x++) {
      const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 + (noise(x * 3, y * 3) - 0.5) * 0.5;
      if (d < 1) set(x, y, TL.WATER); else if (d < 1.5 && tileAt(x, y) !== TL.WATER) set(x, y, TL.SAND);
    }
  }

  // estradas da cidade
  const RL = [30, 50, 70, 90, 110];
  for (const r of RL) { fill(30, r, 82, 2, TL.ROAD); fill(r, 30, 2, 82, TL.ROAD); }
  // rodovias que saem da cidade
  fill(3, 70, MAP_W - 6, 2, TL.ROAD); fill(70, 3, 2, MAP_H - 6, TL.ROAD);

  // quarteirões
  const blocks = [];
  for (let by = 0; by < 4; by++) for (let bx = 0; bx < 4; bx++) blocks.push({ x: RL[bx] + 2, y: RL[by] + 2, w: 18, h: 18 });
  for (const b of blocks) { fill(b.x, b.y, b.w, b.h, TL.WALK); fill(b.x + 1, b.y + 1, b.w - 2, b.h - 2, TL.GRASS); }
  shuffle(blocks);
  const fulls = ['hospital', 'escola', 'fabrica'];
  const halves = ['mercado', 'mercado', 'posto', 'posto', 'delegacia', 'oficina', 'igreja'];
  let bi = 0;
  for (const t of fulls) bigBuilding(blocks[bi++], t);
  // meio quarteirão especial + meio residencial
  while (halves.length) {
    const b = blocks[bi++];
    const top = { x: b.x + 1, y: b.y + 1, w: 16, h: 8, side: 'n' }, bot = { x: b.x + 1, y: b.y + 9, w: 16, h: 8, side: 's' };
    midBuilding(top, halves.pop());
    if (halves.length) midBuilding(bot, halves.pop()); else houseRow(bot);
  }
  // praça
  const park = blocks[bi++];
  for (let y = park.y + 1; y < park.y + park.h - 1; y++) for (let x = park.x + 1; x < park.x + park.w - 1; x++) {
    if (chance(0.12)) set(x, y, TL.TREE); else if (chance(0.03)) set(x, y, TL.BUSH);
  }
  fill(park.x + 8, park.y + 1, 2, 16, TL.WALK); fill(park.x + 1, park.y + 8, 16, 2, TL.WALK);
  // resto: casas
  for (; bi < blocks.length; bi++) {
    const b = blocks[bi];
    houseRow({ x: b.x + 1, y: b.y + 1, w: 16, h: 8, side: 'n' });
    houseRow({ x: b.x + 1, y: b.y + 9, w: 16, h: 8, side: 's' });
  }
  // casas na beira das rodovias
  const rural = [[8, 62, 's'], [118, 62, 's'], [128, 73, 'n'], [96, 120, 'w'], [62, 124, 'e'], [62, 10, 'e'], [73, 20, 'w'], [73, 132, 'w'], [22, 73, 'n']];
  for (const [x, y, side] of rural) {
    const w = 7, h = 6;
    clearArea(x - 1, y - 1, w + 2, h + 2);
    house(x, y, w, h, side, chance(0.25) ? 'abandonada' : 'casa');
  }
  // fazendas
  farm(5, 14, 's'); farm(118, 96, 'n');
  // estradas de terra até as fazendas
  fill(27, 22, 2, 48, TL.DIRT); fill(140, 72, 2, 22, TL.DIRT); fill(112, 110, 6, 2, TL.DIRT);

  // veículos parados nas ruas
  for (let i = 0; i < 26; i++) {
    for (let tries = 0; tries < 40; tries++) {
      const r = pick(RL), along = rint(32, 110), horiz = chance(0.5);
      const x = horiz ? along : r + 0.5 + (chance(0.5) ? 0 : 1), y = horiz ? r + 0.5 + (chance(0.5) ? 0 : 1) : along;
      if (tileAt(Math.floor(x), Math.floor(y)) !== TL.ROAD) continue;
      if (S.vehs.some((v) => dist2(v.x, v.y, x, y) < 16)) continue;
      addVehicle(pick(['carro', 'carro', 'carro', 'caminhonete', 'moto', 'caminhao']), x + 0.5, y, horiz ? (chance(0.5) ? 0 : Math.PI) : (chance(0.5) ? Math.PI / 2 : -Math.PI / 2) + rnd(-0.3, 0.3));
      break;
    }
  }

  // árvores e arbustos espalhados pelas áreas verdes (quintais, praças, beira de estrada e campo)
  const greenOk = (x, y) => {
    for (let b = -1; b <= 1; b++) for (let a = -1; a <= 1; a++) {
      const t = tileAt(x + a, y + b); if (t !== TL.GRASS && t !== TL.TREE && t !== TL.BUSH && t !== TL.WALK) return false;
      if (S.objs[ix(x + a, y + b)] || S.room[ix(x + a, y + b)]) return false;
    }
    for (let b = -2; b <= 2; b++) for (let a = -2; a <= 2; a++) if (tileAt(x + a, y + b) === TL.DOOR) return false;
    return !S.vehs.some((v) => dist2(v.x, v.y, x + 0.5, y + 0.5) < 6);
  };
  for (let y = 4; y < MAP_H - 4; y++) for (let x = 4; x < MAP_W - 4; x++) {
    if (tiles[ix(x, y)] !== TL.GRASS || !greenOk(x, y)) continue;
    const town = x > 30 && x < 112 && y > 30 && y < 112;
    const r = R();
    const street = town && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => tileAt(x + a, y + b) === TL.WALK);
    if (r < (street ? ((x + y) % 3 === 0 ? 0.35 : 0) : town ? 0.06 : 0.022)) tiles[ix(x, y)] = TL.TREE;
    else if (!town && r < 0.032) tiles[ix(x, y)] = TL.BUSH;
  }

  // sobreviventes
  const homes = shuffle(S.bld.map((b, i) => i).filter((i) => ['casa', 'igreja', 'fazenda', 'escola'].includes(S.bld[i].t)));
  const kinds = ['comerciante', 'comerciante', 'familia', 'familia', 'solitario', 'solitario', 'bandido', 'bandido'];
  const names = shuffle(NPC_NAMES.slice());
  // bandidos dividem a mesma casa
  let banditHome = -1;
  for (const kind of kinds) {
    let h = homes.pop();
    if (kind === 'bandido') { if (banditHome < 0) banditHome = h; else { homes.push(h); h = banditHome; } }
    addNpc(kind, h, names.pop());
  }

  // zumbis
  for (const [i, b] of S.bld.entries()) {
    if (S.npcs.some((n) => n.home === i)) continue;
    const mult = { hospital: 10, escola: 9, mercado: 5, fabrica: 6, delegacia: 4, igreja: 5, abandonada: 3, posto: 2 }[b.t] || 1.2;
    const n = Math.floor(rnd(0, 1.6) * mult);
    for (let k = 0; k < n; k++) {
      const p = randomFloor(i); if (p) addZombie(p[0] + 0.5, p[1] + 0.5, null, true);
    }
  }
  for (let k = 0; k < 340; k++) {
    let x, y;
    if (chance(0.78)) { x = rint(30, 112); y = rint(30, 112); } else { x = rint(4, MAP_W - 5); y = rint(4, MAP_H - 5); }
    if (isSolid(x, y) || bldAt(x, y) >= 0) continue;
    addZombie(x + 0.5, y + 0.5);
  }

  // jogador: casa inicial
  const startB = shuffle(S.bld.map((b, i) => i).filter((i) => S.bld[i].t === 'casa' && !S.npcs.some((n) => n.home === i) && S.bld[i].x > 30 && S.bld[i].x < 110))[0];
  const b = S.bld[startB];
  S.zs = S.zs.filter((z) => dist2(z.x, z.y, b.x + b.w / 2, b.y + b.h / 2) > 14 * 14);
  const sp = randomFloor(startB) || [b.x + 2, b.y + 2];
  S.player = newPlayer(sp[0] + 0.5, sp[1] + 0.5, prof);
  S.startHome = startB;
  R = Math.random;
  return S;

  /* --- construtores locais --- */
  function clearArea(x0, y0, w, h) { for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) if (inb(x, y) && tiles[ix(x, y)] !== TL.ROAD) tiles[ix(x, y)] = TL.GRASS; }

  function building(x, y, w, h, t, doorSide, opt = {}) {
    const id = S.bld.length;
    const bd = BTYPES[t];
    const B = { x, y, w, h, t, roof: pick(bd.roof), n: bd.n, lit: chance(0.5) ? 1 : 0 };
    S.bld.push(B);
    for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) {
      const edge = xx === x || yy === y || xx === x + w - 1 || yy === y + h - 1;
      tiles[ix(xx, yy)] = edge ? TL.WALL : (opt.tile ? opt.tile : TL.FLOOR);
      room[ix(xx, yy)] = id + 1;
    }
    // janelas
    const winEvery = opt.win || 3;
    for (let xx = x + 2; xx < x + w - 2; xx += winEvery) { addWin(xx, y, t); addWin(xx, y + h - 1, t); }
    for (let yy = y + 2; yy < y + h - 2; yy += winEvery) { addWin(x, yy, t); addWin(x + w - 1, yy, t); }
    // portas
    const doors = [];
    const doorAt = (side, off) => {
      let dx, dy;
      if (side === 'n') { dx = x + off; dy = y; } else if (side === 's') { dx = x + off; dy = y + h - 1; }
      else if (side === 'w') { dx = x; dy = y + off; } else { dx = x + w - 1; dy = y + off; }
      tiles[ix(dx, dy)] = TL.DOOR;
      S.ts[ix(dx, dy)] = { hp: 220, open: 0, bar: 0, lock: t === 'abandonada' ? 0 : (chance(0.3) ? 1 : 0) };
      doors.push([dx, dy]);
    };
    const mid = (doorSide === 'n' || doorSide === 's') ? Math.floor(w / 2) : Math.floor(h / 2);
    doorAt(doorSide, mid);
    if (opt.wide) doorAt(doorSide, mid + 1);
    if (opt.back) doorAt({ n: 's', s: 'n', w: 'e', e: 'w' }[doorSide], (doorSide === 'n' || doorSide === 's') ? 1 + rint(1, w - 3) : 1 + rint(1, h - 3));
    B.doors = doors;
    return id;
  }
  function addWin(x, y, t) {
    if (tiles[ix(x, y)] !== TL.WALL) return;
    tiles[ix(x, y)] = TL.WINDOW;
    const broken = t === 'abandonada' ? chance(0.6) : chance(0.05);
    S.ts[ix(x, y)] = { hp: 40, broken: broken ? 1 : 0, bar: t === 'abandonada' && !broken && chance(0.4) ? 1 : 0, bhp: 0, open: 0 };
    if (S.ts[ix(x, y)].bar) S.ts[ix(x, y)].bhp = BAR_HP;
  }
  function freeSpots(id, n) {
    // tiles internos encostados numa parede, longe das portas
    const B = S.bld[id]; const out = [];
    for (let yy = B.y + 1; yy < B.y + B.h - 1; yy++) for (let xx = B.x + 1; xx < B.x + B.w - 1; xx++) {
      if (tiles[ix(xx, yy)] === TL.WALL || S.objs[ix(xx, yy)]) continue;
      const nearWall = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, c]) => [TL.WALL, TL.WINDOW].includes(tiles[ix(xx + a, yy + c)]));
      let nearDoor = false;
      for (let a = -1; a <= 1; a++) for (let c = -1; c <= 1; c++) if (tiles[ix(xx + a, yy + c)] === TL.DOOR || (S.objs[ix(xx + a, yy + c)] && S.objs[ix(xx + a, yy + c)].gap)) nearDoor = true;
      if (nearWall && !nearDoor) out.push([xx, yy]);
    }
    return shuffle(out).slice(0, n);
  }
  function put(x, y, k, extra) { S.objs[ix(x, y)] = Object.assign({ t: k }, extra || {}); }
  function furnish(id, list) {
    const spots = freeSpots(id, list.length);
    list.forEach((k, i) => { if (spots[i]) put(spots[i][0], spots[i][1], k); });
  }

  function house(x, y, w, h, side, t = 'casa') {
    const id = building(x, y, w, h, t, side, { back: chance(0.5) });
    const base = ['geladeira', 'armario', 'fogao', 'pia', 'cama', 'guarda_roupa', 'sofa', 'estante', 'banheiro', 'mesa'];
    if (w * h > 48) base.push('cama', 'armario', 'lixeira');
    furnish(id, t === 'abandonada' ? shuffle(base).slice(0, 6) : base);
    if (chance(0.45)) { // carro na garagem/frente
      const fx = side === 'n' ? x + 1 : side === 's' ? x + 1 : side === 'w' ? x - 2 : x + w + 1;
      const fy = side === 'n' ? y - 1.2 : side === 's' ? y + h + 0.2 : y + 1;
      if (inb(Math.floor(fx), Math.floor(fy)) && !isSolidRaw(Math.floor(fx), Math.floor(fy))) addVehicle(pick(['carro', 'carro', 'caminhonete', 'moto']), fx + 0.6, fy + 0.5, side === 'n' || side === 's' ? 0 : Math.PI / 2);
    }
    return id;
  }
  function houseRow(a) {
    for (let i = 0; i < 2; i++) {
      const w = 7, h = rint(6, 7);
      const lx = a.x + i * 8 + (8 - w) / 2 | 0;
      const ly = a.side === 'n' ? a.y + 1 : a.y + a.h - h - 1;
      house(lx, ly, w, h, a.side, chance(0.15) ? 'abandonada' : 'casa');
      // cerquinha no quintal
      if (h < 7 && chance(0.3)) for (let xx = a.x + i * 8; xx < a.x + i * 8 + 8; xx++) { const yy = a.side === 'n' ? a.y + a.h - 1 : a.y; if (!isSolidRaw(xx, yy)) put(xx, yy, 'cerca', { hp: 80 }); }
    }
  }
  function midBuilding(a, t) {
    if (t === 'posto') {
      const sx = a.x + 9, sw = 7, sh = 5, sy = a.side === 'n' ? a.y + 1 : a.y + a.h - sh - 1;
      const id = building(sx, sy, sw, sh, 'posto', a.side, { win: 2 });
      furnish(id, ['balcao', 'prateleira', 'prateleira', 'geladeira', 'lixeira']);
      fill(a.x, a.y, 9, a.h, TL.PARK);
      const py = a.side === 'n' ? a.y + 2 : a.y + a.h - 3;
      put(a.x + 3, py, 'bomba', { fuel: rint(60, 200) }); put(a.x + 6, py, 'bomba', { fuel: rint(60, 200) });
      if (chance(0.7)) addVehicle(pick(['carro', 'caminhonete', 'caminhao']), a.x + 4.5, py + (a.side === 'n' ? 2.5 : -1.5), 0);
      return;
    }
    const w = t === 'oficina' ? 11 : 14, h = 7;
    const x0 = a.x + 1, y0 = a.side === 'n' ? a.y : a.y + a.h - h;
    const id = building(x0, y0, w, h, t, a.side, { wide: t === 'oficina' || t === 'mercado', back: true, win: t === 'mercado' ? 2 : 3 });
    if (t === 'mercado') {
      for (let xx = x0 + 2; xx < x0 + w - 2; xx += 1) for (const yy of [y0 + 2, y0 + 4]) if ((xx - x0) % 4 !== 0) put(xx, yy, 'prateleira');
      furnish(id, ['geladeira', 'geladeira', 'geladeira', 'balcao', 'lixeira']);
    } else if (t === 'delegacia') { furnish(id, ['armario_armas', 'armario_armas', 'arquivo', 'arquivo', 'mesa', 'mesa', 'banheiro', 'balcao']); addVehicle('viatura', x0 + w + 1.4, y0 + 3.5, Math.PI / 2); }
    else if (t === 'oficina') { furnish(id, ['ferramentas', 'ferramentas', 'pecas', 'pecas', 'pecas', 'mesa', 'lixeira']); addVehicle(pick(['carro', 'caminhonete']), x0 + w / 2 + 0.5, y0 + 3.5, 0, true); if (a.x + 14 < a.x + a.w) addVehicle('carro', a.x + 14.8, y0 + 3.5, Math.PI / 2, true); }
    else if (t === 'igreja') {
      for (let yy = y0 + 2; yy < y0 + h - 2; yy++) for (const xx of [x0 + 3, x0 + 4, x0 + 5, x0 + 8, x0 + 9, x0 + 10]) if (yy !== y0 + 3) put(xx, yy, 'banco_igreja');
      furnish(id, ['caixote', 'caixote', 'estante', 'mesa']);
    }
  }
  function bigBuilding(b, t) {
    const x0 = b.x + 1, y0 = b.y + 1;
    if (t === 'hospital') {
      const id = building(x0, y0, 16, 12, 'hospital', 'n', { wide: true, back: true, win: 2 });
      // divisórias com passagem
      for (let xx = x0 + 1; xx < x0 + 15; xx++) if (xx !== x0 + 4 && xx !== x0 + 11) { tiles[ix(xx, y0 + 6)] = TL.WALL; }
      S.objs[ix(x0 + 4, y0 + 6)] = { t: '_gap', gap: 1 }; S.objs[ix(x0 + 11, y0 + 6)] = { t: '_gap', gap: 1 };
      furnish(id, ['maca', 'maca', 'maca', 'maca', 'maca', 'armario_med', 'armario_med', 'armario_med', 'armario_med', 'balcao', 'banheiro', 'geladeira', 'mesa', 'arquivo']);
      delete S.objs[ix(x0 + 4, y0 + 6)]; delete S.objs[ix(x0 + 11, y0 + 6)];
      fill(b.x + 1, b.y + 13, 16, 4, TL.PARK);
      addVehicle('ambulancia', b.x + 4, b.y + 15, 0); if (chance(0.6)) addVehicle('ambulancia', b.x + 10, b.y + 15, 0);
      addVehicle('carro', b.x + 14.5, b.y + 15, 0);
    } else if (t === 'escola') {
      const id = building(x0, y0, 16, 11, 'escola', 's', { wide: true, back: true, win: 2 });
      for (let yy = y0 + 2; yy < y0 + 8; yy += 2) for (let xx = x0 + 2; xx < x0 + 11; xx += 2) put(xx, yy, 'carteira');
      furnish(id, ['estante', 'estante', 'geladeira', 'armario', 'armario', 'mesa', 'lixeira', 'banheiro']);
      fill(b.x + 1, b.y + 13, 16, 4, TL.PARK);
      addVehicle('carro', b.x + 4, b.y + 15, 0); addVehicle('caminhao', b.x + 11, b.y + 15, 0);
    } else {
      const id = building(x0, y0, 16, 13, 'fabrica', 'w', { wide: true, back: true, win: 4 });
      for (let yy = y0 + 2; yy < y0 + 11; yy += 3) for (let xx = x0 + 4; xx < x0 + 13; xx++) if ((xx - x0) % 4 !== 0) put(xx, yy, 'caixote');
      furnish(id, ['pecas', 'pecas', 'ferramentas', 'ferramentas', 'arquivo', 'mesa', 'caixote', 'caixote']);
      S.objs[ix(x0 + 14, y0 + 11)] = { t: 'caixote', items: [newItem('gerador'), ...rollLoot('fabrica')] };
      addVehicle('caminhao', b.x + 9, b.y + 16, 0);
    }
  }
  function farm(x, y, side) {
    clearArea(x - 2, y - 3, 27, 23);
    house(x, y, 8, 7, side, 'fazenda');
    const cid = building(x + 12, y, 10, 8, 'celeiro', side, { wide: true, win: 4, tile: TL.DIRT });
    furnish(cid, ['feno', 'feno', 'feno', 'ferramentas', 'caixote', 'feno']);
    const fy = y + 10;
    for (let yy = fy; yy < fy + 9; yy++) for (let xx = x; xx < x + 22; xx++) tiles[ix(xx, yy)] = TL.FIELD;
    addVehicle('trator', x + 23.5, y + 5, Math.PI / 2);
    addVehicle('caminhonete', x + 10, y - 1.5, 0);
  }
}

function isSolidRaw(x, y) { const t = tileAt(x, y); return SOLID_T.has(t) || t === TL.DOOR; }

function randomFloor(bi) {
  const B = S.bld[bi];
  for (let k = 0; k < 40; k++) {
    const x = rint(B.x + 1, B.x + B.w - 2), y = rint(B.y + 1, B.y + B.h - 2);
    if (!isSolid(x, y)) return [x, y];
  }
  return null;
}

/* ---------- entidades ---------- */
function newPlayer(x, y, profKey) {
  const prof = PROFS.find((p) => p.k === profKey) || PROFS[0];
  const sk = {}; for (const k of Object.keys(SKILLS)) sk[k] = { l: prof.sk[k] || 0, xp: SKILL_XP[prof.sk[k] || 0] };
  const inv = [newItem('garrafa', { w: 5 }), newItem('biscoito'), newItem('isqueiro')];
  for (const [k, q, o] of prof.items) {
    if (ITEMS[k].st) addTo(inv, newItem(k, { q })); else inv.push(newItem(k, Object.assign({ c: 100, d: ITEMS[k].wp ? ITEMS[k].wp.dur : undefined }, o || {})));
  }
  const p = {
    x, y, a: Math.PI / 2, r: 0.3, prof: prof.k, learn: prof.learn || 1,
    hp: 100, hun: 85, thi: 85, ene: 90, sta: 100, temp: 50, str: 15, fear: 0, pain: 0, sick: 0, bore: 0,
    wet: 0, wounds: [], knox: 0, knoxT: 0, woundInf: 0, inv, eq: { mao: null, costas: null, lado: null, tronco: null, capa: null, colete: null, cabeca: null },
    sk, light: 0, run: 0, sneak: 0, atkCd: 0, action: null, sleeping: 0, inCar: null, onTower: 0, kills: 0, knownCars: {},
  };
  const w = inv.find((i) => ITEMS[i.k].wp && !ITEMS[i.k].tags);
  if (w) p.eq.mao = w;
  else { const t = inv.find((i) => ITEMS[i.k].wp); if (t) p.eq.mao = t; }
  return p;
}

function addZombie(x, y, type, inside) {
  if (!type) type = wpick([['lento', 70], ['recente', 15], ['corredor', 7], ['brutamontes', 2.5]])[0];
  const d = ZT[type];
  const z = { id: S.nid++, x, y, t: type, hp: d.hp * rnd(0.85, 1.15), a: rnd(0, 6.28), st: 'idle', tx: x, ty: y, cd: 0, stun: 0, down: 0,
    shirt: pick(d.shirt), seed: Math.floor(R() * 1000), inside: inside ? 1 : 0, think: R(), hid: 0 };
  S.zs.push(z); return z;
}

function addVehicle(type, x, y, a, inShop) {
  const d = VT[type];
  const v = { id: S.nid++, t: type, x, y, a, sp: 0, col: pick(d.col),
    fuel: chance(0.35) ? 0 : rnd(0.05, 0.6) * d.fuel, bat: chance(0.3) ? rint(0, 8) : rint(25, 100),
    tires: [0, 0, 0, 0].map(() => (chance(0.12) ? 0 : rint(40, 100))), eng: inShop ? rint(5, 40) : rint(35, 100), hp: d.hp * rnd(0.5, 1),
    key: chance(0.18) ? 1 : 0, hot: 0, on: 0, lights: 0, trunk: null, alarm: chance(0.3) ? 1 : 0, alarmT: 0 };
  if (d.moto) v.tires = v.tires.slice(0, 2);
  if (type === 'trator') { v.key = 1; v.fuel = rnd(0.2, 0.6) * d.fuel; }
  S.vehs.push(v);
  // às vezes a chave está numa casa por perto
  return v;
}

function addNpc(kind, home, name) {
  const p = randomFloor(home) || [S.bld[home].x + 2, S.bld[home].y + 2];
  const npc = { id: S.nid++, kind, name, home, x: p[0] + 0.5, y: p[1] + 0.5, a: 0, hp: 100, trust: kind === 'bandido' ? -40 : rint(0, 20),
    inv: [], credit: 0, st: 'casa', tx: p[0] + 0.5, ty: p[1] + 0.5, cd: 0, hunger: 100, quest: null, met: 0, dead: 0, hostile: kind === 'bandido' ? 1 : 0,
    wp: kind === 'bandido' ? pick(['taco', 'faca', 'pistola', 'pe_cabra']) : pick(['faca_cozinha', 'taco', 'martelo', null]), ammo: 12 };
  if (kind === 'comerciante') {
    npc.inv = [...rollLoot('mercado', 1.5), ...rollLoot('ferramentas'), ...rollLoot('hospital'), ...rollLoot('armas', 0.6)];
  } else if (kind === 'familia') {
    npc.size = rint(2, 4);
    npc.quest = { need: pick(['antibiotico', 'analgesico', 'bandagem', 'feijao']), q: 1, reward: rollLoot('cozinha', 1.6).concat(rollLoot('mercado')), done: 0 };
    if (npc.quest.need === 'bandagem' || npc.quest.need === 'feijao') npc.quest.q = 3;
  } else if (kind === 'solitario') {
    npc.inv = rollLoot('cozinha');
  } else {
    npc.inv = rollLoot('armas', 0.8).concat(rollLoot('mercado'));
  }
  S.npcs.push(npc);
  return npc;
}

/* ---------- consultas de colisão/visão ---------- */
function isSolid(x, y, who) {
  if (!inb(x, y)) return true;
  const i = ix(x, y), t = S.tiles[i];
  if (t === TL.WATER || t === TL.TREE || t === TL.WALL) return true;
  if (t === TL.DOOR) { const s = S.ts[i]; if (s && !s.open) return true; if (s && s.bar) return true; }
  if (t === TL.WINDOW) { const s = S.ts[i]; if (!s || s.bar || !(s.broken || s.open)) return true; if (who !== 'climb') return true; }
  const o = S.objs[i];
  if (o) { const d = FURN[o.t]; if (d && d.solid && !(d.gate && o.open)) return true; }
  return false;
}
function isOpaque(x, y) {
  if (!inb(x, y)) return true;
  const i = ix(x, y), t = S.tiles[i];
  if (t === TL.WALL || t === TL.TREE) return true;
  if (t === TL.DOOR) { const s = S.ts[i]; return !s || !s.open || !!s.bar; }
  if (t === TL.WINDOW) { const s = S.ts[i]; return !!(s && s.bar >= 2); }
  const o = S.objs[i]; if (o && FURN[o.t] && FURN[o.t].opaque) return true;
  return false;
}
// algo que um zumbi pode quebrar neste tile (porta, janela, barricada, construção)
function breakable(x, y) {
  if (!inb(x, y)) return null;
  const i = ix(x, y), t = S.tiles[i];
  if (t === TL.DOOR) { const s = S.ts[i]; if (s && (!s.open || s.bar)) return { kind: 'door', i }; }
  if (t === TL.WINDOW) { const s = S.ts[i]; if (s && (s.bar || !(s.broken || s.open))) return { kind: 'win', i }; }
  const o = S.objs[i]; if (o && FURN[o.t] && FURN[o.t].build && FURN[o.t].solid && !(FURN[o.t].gate && o.open)) return { kind: 'obj', i };
  return null;
}

function los(x0, y0, x1, y1) {
  // linha de visão entre dois pontos (em tiles)
  let x = Math.floor(x0), y = Math.floor(y0); const tx = Math.floor(x1), ty = Math.floor(y1);
  const dx = Math.abs(tx - x), dy = Math.abs(ty - y), sx = x < tx ? 1 : -1, sy = y < ty ? 1 : -1;
  let err = dx - dy, n = 0;
  while (!(x === tx && y === ty) && n++ < 80) {
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x += sx; }
    if (e2 < dx) { err += dx; y += sy; }
    if (x === tx && y === ty) break;
    if (isOpaque(x, y)) return false;
  }
  return true;
}

/* ---------- salvar / carregar ---------- */
function b64(u8) { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); }
function unb64(s, Ctor) { const bin = atob(s); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return Ctor === Int16Array ? new Int16Array(u.buffer) : u; }
function saveGame() {
  if (!S || S.dead) return;
  try {
    const out = Object.assign({}, S, { tiles: b64(S.tiles), room: b64(new Uint8Array(S.room.buffer)), seen: b64(S.seen), player: Object.assign({}, S.player, { inCar: S.player.inCar ? S.player.inCar.id : null }) });
    out.player.eq = {}; for (const [k, v] of Object.entries(S.player.eq)) out.player.eq[k] = v ? S.player.inv.indexOf(v) : -1;
    delete out.player.action;
    localStorage.setItem(SAVE_KEY, JSON.stringify(out));
  } catch (e) { /* armazenamento cheio ou bloqueado */ }
}
function loadGame() {
  let raw; try { raw = localStorage.getItem(SAVE_KEY); } catch (e) { return null; }
  if (!raw) return null;
  try {
    const d = JSON.parse(raw);
    d.tiles = unb64(d.tiles); d.room = unb64(d.room, Int16Array); d.seen = unb64(d.seen);
    const eq = d.player.eq; d.player.eq = {};
    for (const [k, v] of Object.entries(eq)) d.player.eq[k] = v >= 0 ? d.player.inv[v] : null;
    d.player.inCar = d.player.inCar ? d.vehs.find((v) => v.id === d.player.inCar) || null : null;
    d.player.action = null; d.player.sleeping = 0;
    return d;
  } catch (e) { return null; }
}
function hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } }
function deleteSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ok */ } }
