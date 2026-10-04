/* Último Dia — simulação: tempo, clima, necessidades, ferimentos, combate, zumbis, veículos, sobreviventes e eventos. */
'use strict';

const G = {
  speed: 1, paused: false, vis: new Uint8Array(MAP_W * MAP_H), visList: [], sightR: 20,
  flow: null, flowOX: 0, flowOY: 0, flowT: 0, flowKey: -1,
  rings: [], fx: [], floats: [], tracers: [], flash: 0, shake: 0,
  acc: { hour: 0, coarse: 0, noise: 0, vis: 0, fire: 0, think: 0 },
  input: { mv: { x: 0, y: 0 }, kbd: false, run: false, sneak: false, attack: false, aimAt: null },
  onSay: null, onDialog: null, onDeath: null, interactCache: null,
};
const FR = 30, FS = FR * 2 + 1, INF = 1e9;
G.flow = new Int32Array(FS * FS);

/* ---------- tempo e ambiente ---------- */
const dayOf = (t = S.time) => Math.floor(t / 1440) + 1;
const hourOf = (t = S.time) => (t / 60) % 24;
function clockStr(t = S.time) { const h = Math.floor(hourOf(t)), m = Math.floor(t % 60); return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`; }
function daylight(t = S.time) {
  const h = hourOf(t);
  if (h >= 7 && h < 18) return 1;
  if (h >= 6 && h < 7) return h - 6;
  if (h >= 18 && h < 19.5) return 1 - (h - 18) / 1.5;
  return 0;
}
function ambientTemp() {
  const h = hourOf();
  let t = 17 - (dayOf() - 1) * 0.3 + 6 * Math.cos(((h - 15) / 24) * Math.PI * 2);
  if (S.weather.k === 'chuva') t -= 3; if (S.weather.k === 'tempestade') t -= 5; if (S.weather.k === 'neblina') t -= 1;
  return t;
}
const gridPower = () => S.time < S.powerOff;
const waterOn = () => S.time < S.waterOff;
let genCache = { t: -1, list: [] };
function genNear(x, y) {
  const t = Math.floor(S.time);
  if (genCache.t !== t) {
    genCache = { t, list: [] };
    for (const [k, o] of Object.entries(S.objs)) if (o.t === 'gerador' && o.on && o.fuel > 0) genCache.list.push([+k % MAP_W, Math.floor(+k / MAP_W)]);
  }
  for (const [gx, gy] of genCache.list) if (dist2(gx, gy, x, y) < 14 * 14) return true;
  return false;
}
const powered = (x, y) => gridPower() || genNear(x, y);

const WEATHER = { sol: '☀️ Sol', nublado: '☁️ Nublado', chuva: '🌧️ Chuva', tempestade: '⛈️ Tempestade', neblina: '🌫️ Neblina' };
function updateWeather() {
  if (S.time < S.weather.until) return;
  const h = hourOf();
  let k = wpick([['sol', 38], ['nublado', 26], ['chuva', 18], ['tempestade', 7], ['neblina', h < 9 || h > 20 ? 18 : 4]])[0];
  if (k === S.weather.k && chance(0.5)) k = 'nublado';
  S.weather = { k, until: S.time + rint(2, 9) * 60 };
}

/* ---------- mensagens e efeitos ---------- */
function say(msg, kind) { if (G.onSay) G.onSay(msg, kind); }
function float(x, y, text, col) { G.floats.push({ x, y, text, col: col || '#fff', t: 0 }); }
function broadcast(msg) {
  S.radioLog.unshift({ t: S.time, msg }); S.radioLog.length = Math.min(S.radioLog.length, 30);
  const r = S.player.inv.find((i) => i.k === 'radio');
  if (r && (r.c || 0) > 0) say('📻 ' + msg, 'radio');
}
function dirName(dx, dy) {
  const a = Math.atan2(dy, dx), n = ['leste', 'sudeste', 'sul', 'sudoeste', 'oeste', 'noroeste', 'norte', 'nordeste'];
  return n[(Math.round(a / (Math.PI / 4)) + 8) % 8];
}
function placeName(x, y) {
  let best = null, bd = 1e9;
  for (const b of S.bld) { const d = dist2(b.x + b.w / 2, b.y + b.h / 2, x, y); if (d < bd) { bd = d; best = b; } }
  return best && bd < 400 ? (best.n === 'Casa' ? 'uma casa' : best.n.toLowerCase()) : 'a mata';
}

/* ---------- barulho ---------- */
function makeNoise(x, y, r, ring = true) {
  if (ring && r >= 6) G.rings.push({ x, y, r, t: 0 });
  const r2 = r * r, srcIn = isInside(x, y);
  for (const z of S.zs) {
    const d2 = dist2(z.x, z.y, x, y); if (d2 > r2) continue;
    if (z.st === 'chase' && z.seeT > 0) continue;
    if (z.inside !== srcIn && d2 > r2 * 0.45) continue; // paredes abafam
    z.st = 'hunt'; z.tx = x + rnd(-1.5, 1.5); z.ty = y + rnd(-1.5, 1.5); z.huntT = 25 + rnd(0, 20);
  }
  const p = S.player;
  if (p.sleeping && dist2(p.x, p.y, x, y) < r2 * 0.6 && r >= 6) wake('Um barulho te acordou!');
}

/* ---------- habilidades ---------- */
const lvl = (k) => S.player.sk[k].l;
function addXP(k, n) {
  const s = S.player.sk[k]; if (!s || s.l >= 5) return;
  s.xp += n * S.player.learn;
  while (s.l < 5 && s.xp >= SKILL_XP[s.l + 1]) { s.l++; say(`${SKILLS[k].i} ${SKILLS[k].n} subiu para o nível ${s.l}!`, 'good'); }
}

/* ---------- inventário ---------- */
function itemW(it) {
  const d = ITEMS[it.k];
  let w = d.w * (it.q || 1);
  if (it.w) w += it.w * 0.2; if (it.f) w += it.f * 0.75;
  return w;
}
const listW = (l) => l.reduce((s, it) => s + itemW(it), 0);
function capacity() {
  const p = S.player; let c = 12;
  for (const it of Object.values(p.eq)) if (it && ITEMS[it.k].wear && ITEMS[it.k].wear.cap) c += ITEMS[it.k].wear.cap;
  return c;
}
function hasTag(tag) {
  return S.player.inv.find((it) => { const d = ITEMS[it.k]; return d.tags && d.tags.includes(tag) && (d.uses ? it.u > 0 : true); });
}
const countItem = (k, list = S.player.inv) => list.reduce((s, it) => s + (it.k === k ? (it.q || 1) : 0), 0);
function takeItem(k, q = 1, list = S.player.inv) {
  for (let i = list.length - 1; i >= 0 && q > 0; i--) {
    const it = list[i]; if (it.k !== k) continue;
    if (it.q) { const t = Math.min(it.q, q); it.q -= t; q -= t; if (it.q <= 0) removeItem(it, list); }
    else { removeItem(it, list); q--; }
  }
}
function removeItem(it, list = S.player.inv) {
  const i = list.indexOf(it); if (i >= 0) list.splice(i, 1);
  if (list === S.player.inv) for (const [k, v] of Object.entries(S.player.eq)) if (v === it) S.player.eq[k] = null;
}
function giveItem(it) { addTo(S.player.inv, it); }
function fresh(it) {
  const d = ITEMS[it.k]; if (!d.sp) return 0;
  return it.t < d.sp ? 0 : it.t < d.sp * 2 ? 1 : 2;
}
const FRESH_LBL = ['', 'velho', 'estragado'];
function itemName(it) {
  const d = ITEMS[it.k]; let n = d.n;
  if (it.q > 1) n += ` (${it.q})`;
  if (d.sp && fresh(it)) n += ` · ${FRESH_LBL[fresh(it)]}`;
  if (d.water) n = it.w > 0 ? `${d.n} ${it.w}/${d.water}${it.dirty ? ' · suja' : ''}` : `${d.n} (vazia)`;
  if (d.fuel) n = `${d.n} ${Math.round(it.f)}/${d.fuel} L`;
  if (d.charge != null && it.c != null) n += ` · ${Math.round(it.c)}%`;
  if (d.uses && it.u != null) n += ` · ${it.u}x`;
  if (d.wp && d.wp.gun) n += ` · ${it.a}/${d.wp.mag}`;
  if (it.k === 'chave_carro' && it.kid) { const v = S.vehs.find((v) => v.id === it.kid); if (v) n = `Chave: ${VT[v.t].n.toLowerCase()} ${colorName(v.col)}`; }
  if (d.book && it.read) n += ' · lido';
  return n;
}
function colorName(c) {
  return { '#b8423a': 'vermelho', '#3a6fb8': 'azul', '#d0d2d4': 'prata', '#2e3236': 'preto', '#d8b23a': 'amarelo', '#4a7d4a': 'verde', '#6b4a2f': 'marrom', '#1f3d5c': 'azul-escuro', '#8a8f94': 'cinza', '#7a1f1f': 'vinho', '#202020': 'preta', '#c03030': 'vermelha', '#3050c0': 'azul', '#e0e0e0': 'branco', '#c47a2a': 'laranja', '#3a5f8f': 'azul', '#3f8f3a': 'verde', '#d24a2a': 'vermelho', '#f2f2f2': 'branca', '#1f2a44': '' }[c] || '';
}
function invOver() { return listW(S.player.inv) > capacity(); }

/* ---------- comer, beber, remédios ---------- */
function canOpen(it) { return !ITEMS[it.k].can || hasTag('abridor'); }
function eat(it) {
  const p = S.player, d = ITEMS[it.k];
  if (d.can && !canOpen(it)) { say('Preciso de um abridor de latas ou uma faca.'); return false; }
  const f = fresh(it), mult = [1, 0.6, 0.3][f];
  p.hun = clamp(p.hun + (d.food.hun || 0) * mult, 0, 100);
  p.thi = clamp(p.thi + (d.food.thi || 0), 0, 100);
  p.str = clamp(p.str + (d.food.str || 0), 0, 100);
  const sick = (d.food.sick || 0) + [0, 0.12, 0.6][f];
  if (chance(sick)) { p.sick = clamp(p.sick + 35, 0, 100); say('Isso não caiu bem...', 'bad'); }
  else if (f === 0 && (d.food.str || 0) < 0) say('Gostoso.');
  if (d.can && !hasTag('abridor')) {/* nunca chega aqui */}
  removeItem(it);
  if (d.can && chance(0.5)) {/* lata vazia descartada */}
  return true;
}
function drinkFrom(it) {
  const p = S.player; if (!it.w) return false;
  it.w--; p.thi = clamp(p.thi + 22, 0, 100);
  if (it.dirty && chance(0.55)) { p.sick = clamp(p.sick + 40, 0, 100); say('A água estava contaminada...', 'bad'); }
  if (it.w <= 0) it.dirty = 0;
  return true;
}
function addWound(k, opts = {}) {
  const p = S.player;
  const H = { arranhao: 600, corte: 2000, mordida: 2800, tiro: 3600, queimadura: 2400, fratura: 7000, vidro: 900 };
  const w = { k, bl: k === 'queimadura' || k === 'fratura' ? 0 : 1, band: 0, dis: 0, h: H[k], inf: 0, sut: 0, dirtyT: 0, t: S.time };
  if (opts.glass) w.glass = 1;
  p.wounds.push(w);
  return w;
}
const WOUND_LBL = { arranhao: 'Arranhão', corte: 'Corte profundo', mordida: 'Mordida', tiro: 'Ferimento de bala', queimadura: 'Queimadura', fratura: 'Fratura', vidro: 'Corte de vidro' };
const WOUND_PAIN = { arranhao: 8, corte: 20, mordida: 28, tiro: 34, queimadura: 24, fratura: 40, vidro: 12 };
function treat(w, how) {
  const p = S.player, med = lvl('medicina');
  if (how === 'bandagem' || how === 'trapo') {
    if (!countItem(how)) return say('Você não tem ' + ITEMS[how].n.toLowerCase() + '.');
    takeItem(how);
    w.band = 1; w.bl = 0; w.bandT = S.time; w.rag = how === 'trapo' ? 1 : 0;
    if (!w.dis && w.k !== 'fratura' && chance(Math.max(0.05, (how === 'trapo' ? 0.45 : 0.25) - med * 0.05))) w.infAt = S.time + rint(4, 10) * 60;
    addXP('medicina', 3); say('Ferimento enfaixado.');
  } else if (how === 'desinfetante') {
    const it = p.inv.find((i) => i.k === 'desinfetante' && i.u > 0); if (!it) return say('Sem desinfetante.');
    it.u--; if (it.u <= 0) removeItem(it);
    w.dis = 1; w.infAt = 0; p.pain = clamp(p.pain + 6, 0, 100); addXP('medicina', 2); say('Ardeu, mas está limpo.');
  } else if (how === 'sutura') {
    if (med < 1) return say('Preciso saber mais de medicina (nível 1).');
    const it = p.inv.find((i) => i.k === 'sutura' && i.u > 0); if (!it) return say('Sem kit de sutura.');
    it.u--; if (it.u <= 0) removeItem(it);
    w.sut = 1; w.bl = 0; w.h *= 0.45; addXP('medicina', 6); say('Ponto a ponto... feito.');
  } else if (how === 'tala') {
    if (!countItem('tala')) return say('Sem tala.');
    takeItem('tala'); w.band = 1; w.h *= 0.6; addXP('medicina', 3); say('Tala colocada.');
  } else if (how === 'vidro') {
    w.glass = 0; p.pain = clamp(p.pain + 5, 0, 100); say('Você tirou os cacos de vidro.');
  }
}
function useMed(it) {
  const p = S.player, d = ITEMS[it.k];
  if (d.med === 'analgesico') { p.painKill = S.time + 300; say('A dor vai passar.'); }
  else if (d.med === 'antibiotico') { p.abUntil = S.time + 1440; say('Tomando antibióticos.'); }
  else if (d.med === 'calmante') { p.str = clamp(p.str - 30, 0, 100); p.fear = clamp(p.fear - 40, 0, 100); p.ene = clamp(p.ene - 8, 0, 100); say('Mais calmo agora.'); }
  else return false;
  it.u--; if (it.u <= 0) removeItem(it);
  return true;
}
function smoke(it) {
  const p = S.player;
  if (!hasTag('isqueiro')) return say('Preciso de fogo.');
  const l = hasTag('isqueiro'); l.u--; if (l.u <= 0) removeItem(l);
  p.str = clamp(p.str - 18, 0, 100); p.hp = clamp(p.hp - 1, 0, 100);
  it.u--; if (it.u <= 0) removeItem(it);
  say('Uma tragada para acalmar os nervos.');
}

/* ---------- jogador ---------- */
function wake(msg) { const p = S.player; if (!p.sleeping) return; p.sleeping = 0; G.speed = 1; if (msg) say(msg, 'bad'); }
function protection() {
  let pr = 0; for (const it of Object.values(S.player.eq)) if (it && ITEMS[it.k].wear && ITEMS[it.k].wear.prot) pr += ITEMS[it.k].wear.prot;
  return Math.min(pr, 0.75);
}
function warmth() {
  let w = 0; for (const it of Object.values(S.player.eq)) if (it && ITEMS[it.k].wear && ITEMS[it.k].wear.warm) w += ITEMS[it.k].wear.warm;
  return w / 2;
}
function nearFire(x, y, r = 3) {
  for (let yy = Math.floor(y - r); yy <= y + r; yy++) for (let xx = Math.floor(x - r); xx <= x + r; xx++) {
    if (!inb(xx, yy)) continue;
    const i = ix(xx, yy); if (S.fires[i]) return true;
    const o = S.objs[i]; if (o && o.t === 'fogueira' && o.fuel > 0) return true;
  }
  return false;
}
function hurtPlayer(dmg, cause) {
  const p = S.player; p.hp -= dmg; G.shake = Math.min(0.4, G.shake + dmg / 40); p.hitT = 0.3;
  if (p.sleeping) wake('Você acordou com dor!');
  if (p.action) cancelAction();
  if (p.hp <= 0) die(cause);
}
function die(cause) {
  if (S.dead) return;
  S.dead = cause; S.player.hp = 0;
  deleteSave();
  if (G.onDeath) G.onDeath(cause);
}

function updateNeeds(gm) {
  const p = S.player;
  const sleeping = p.sleeping;
  const amb = ambientTemp(), inside = isInside(p.x, p.y) || p.inCar;
  // fome, sede, sono
  p.hun = clamp(p.hun - gm * (sleeping ? 0.04 : 0.075), 0, 100);
  p.thi = clamp(p.thi - gm * (sleeping ? 0.04 : 0.08) * (p.temp > 65 ? 1.6 : 1), 0, 100);
  if (sleeping) p.ene = clamp(p.ene + gm * 0.2 * p.sleepQ, 0, 100);
  else p.ene = clamp(p.ene - gm * (p.run && G.input.moving ? 0.1 : 0.065), 0, 100);
  // molhado
  const raining = S.rain > 0.2 && !inside && !(p.eq.capa);
  if (raining) p.wet = clamp(p.wet + gm * 1.5 * S.rain, 0, 100);
  else p.wet = clamp(p.wet - gm * (nearFire(p.x, p.y) ? 3 : inside ? 0.6 : 0.3), 0, 100);
  // temperatura
  let feel = amb + warmth() - p.wet * 0.1 + (inside ? 6 : 0) + (nearFire(p.x, p.y) ? 14 : 0) + (p.sleeping ? 3 : 0);
  if (p.knoxT > 1500) feel += 8; // febre
  const tgt = feel < 16 ? 50 - (16 - feel) * 3.5 : feel > 29 ? 50 + (feel - 29) * 4 : 50;
  p.temp += (clamp(tgt, 0, 100) - p.temp) * Math.min(1, 0.02 * gm);
  // estresse
  const seen = G.seenZ || 0;
  p.str = clamp(p.str + gm * (seen * 0.02 + (p.hun < 15 ? 0.03 : 0) + (p.pain > 40 ? 0.03 : 0) + (p.knox && p.knoxT > 1500 ? 0.05 : 0) - (sleeping ? 0.08 : 0.025)), 0, 100);
  // dor
  let pain = 0; for (const w of p.wounds) pain += WOUND_PAIN[w.k] * (w.inf ? 1.5 : 1) * (w.band ? 0.7 : 1);
  if (p.painKill > S.time) pain *= 0.3;
  p.pain += (clamp(pain, 0, 100) - p.pain) * Math.min(1, 0.1 * gm);
  // enjoo
  if (p.sick > 0) { p.sick = clamp(p.sick - gm * 0.06, 0, 100); if (p.sick > 50) { p.hp -= gm * 0.03; p.hun = clamp(p.hun - gm * 0.05, 0, 100); } }
  // ferimentos
  let regen = p.hun > 25 && p.thi > 25 && p.temp > 25 && p.temp < 80 ? (sleeping ? 0.07 : 0.03) : 0;
  for (let i = p.wounds.length - 1; i >= 0; i--) {
    const w = p.wounds[i];
    if (w.bl) { p.hp -= gm * (w.k === 'arranhao' ? 0.025 : w.k === 'tiro' ? 0.12 : 0.07); regen = 0; }
    if (w.glass && !p.sleeping && G.input.moving) p.hp -= gm * 0.01;
    if (w.infAt && S.time > w.infAt && !w.dis) { w.inf = 1; w.infAt = 0; say('Um ferimento infeccionou!', 'bad'); }
    if (w.band && !w.dirty && S.time - w.bandT > 1080) { w.dirty = 1; if (!w.dis && chance(0.3)) w.infAt = S.time + 240; }
    if (w.inf) {
      if (p.abUntil > S.time) { if (chance(gm * 0.004)) { w.inf = 0; say('A infecção está cedendo.', 'good'); } }
      else p.hp -= gm * 0.012;
    }
    if (!w.bl && !w.inf && (w.band || w.sut || w.k === 'arranhao')) w.h -= gm * (sleeping ? 1.6 : 1) * (1 + lvl('medicina') * 0.06);
    if (w.h <= 0) { p.wounds.splice(i, 1); say(`${WOUND_LBL[w.k]} cicatrizou.`, 'good'); }
  }
  // zumbificação
  if (p.knox) {
    p.knoxT += gm; regen = 0;
    if (p.knoxT > 1500 && !p.knoxMsg) { p.knoxMsg = 1; say('Você está com febre e enjoo... A mordida.', 'bad'); }
    if (p.knoxT > 1500) p.hp -= gm * (0.015 + (p.knoxT - 1500) / 120000);
  }
  // fome/sede/frio extremos
  if (p.hun <= 0) p.hp -= gm * 0.05; if (p.thi <= 0) p.hp -= gm * 0.07;
  if (p.temp < 18) p.hp -= gm * 0.04; if (p.temp > 88) p.hp -= gm * 0.04;
  if (p.ene <= 0 && !sleeping) { startSleep(0.5, true); }
  p.hp = clamp(p.hp + regen * gm, 0, 100);
  // lanterna
  if (p.light) {
    const l = p.inv.find((i) => i.k === 'lanterna' && i.c > 0);
    if (!l) { p.light = 0; say('A lanterna apagou. Sem pilhas.'); } else l.c = Math.max(0, l.c - gm * 0.025);
  }
  const radio = p.inv.find((i) => i.k === 'radio'); if (radio && radio.c > 0) radio.c = Math.max(0, radio.c - gm * 0.004);
  if (p.hp <= 0) die(p.knox && p.knoxT > 1500 ? 'zumbi' : p.thi <= 0 ? 'sede' : p.hun <= 0 ? 'fome' : p.temp < 18 ? 'frio' : p.wounds.some((w) => w.bl) ? 'sangue' : 'ferimentos');
}

function startSleep(q, forced) {
  const p = S.player;
  if (!forced) {
    if (p.ene > 75) return say('Não estou com sono.');
    if (G.seenZ > 0 || S.zs.some((z) => z.st === 'chase' && dist2(z.x, z.y, p.x, p.y) < 144)) return say('Não dá para dormir com zumbis por perto!', 'bad');
    if (p.pain > 60) return say('A dor não me deixa dormir.');
  } else say('Você desmaiou de cansaço...', 'bad');
  p.sleeping = 1; p.sleepQ = q * (p.str > 70 ? 0.7 : 1); G.speed = 40; cancelAction();
}

/* ---------- ações demoradas ---------- */
function startAction(l, d, fn, opts = {}) {
  const p = S.player;
  if (p.action) cancelAction();
  p.action = Object.assign({ l, t: 0, d, fn, nt: 0 }, opts);
}
function cancelAction() { const p = S.player; if (p.action) { if (p.action.onCancel) p.action.onCancel(); p.action = null; } }
function updateAction(dt) {
  const p = S.player, a = p.action; if (!a) return;
  a.t += dt;
  if (a.noise) { a.nt -= dt; if (a.nt <= 0) { a.nt = 1.2; makeNoise(p.x, p.y, a.noise); } }
  if (a.t >= a.d) { p.action = null; a.fn(); G.interactCache = null; }
}

/* ---------- movimento e colisão ---------- */
function blockedAt(x, y, r, who) {
  const x0 = Math.floor(x - r), x1 = Math.floor(x + r), y0 = Math.floor(y - r), y1 = Math.floor(y + r);
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (isSolid(tx, ty, who)) return true;
  return false;
}
function vehAt(x, y, r, skip) {
  for (const v of S.vehs) {
    if (v === skip || Math.abs(v.x - x) > 3 || Math.abs(v.y - y) > 3) continue;
    const d = VT[v.t], c = Math.cos(-v.a), s = Math.sin(-v.a);
    const lx = (x - v.x) * c - (y - v.y) * s, ly = (x - v.x) * s + (y - v.y) * c;
    if (Math.abs(lx) < d.len / 2 + r && Math.abs(ly) < d.wid / 2 + r) return v;
  }
  return null;
}
function moveEnt(e, dx, dy, who) {
  let moved = false;
  const skip = e === S.player ? S.player.inCar : null;
  if (dx) { const nx = e.x + dx; if (!blockedAt(nx, e.y, e.r, who) && !vehAt(nx, e.y, e.r, skip)) { e.x = nx; moved = true; } }
  if (dy) { const ny = e.y + dy; if (!blockedAt(e.x, ny, e.r, who) && !vehAt(e.x, ny, e.r, skip)) { e.y = ny; moved = true; } }
  return moved;
}
// dá para andar em linha reta de um ponto ao outro?
function clearLine(x0, y0, x1, y1) {
  const d = dist(x0, y0, x1, y1), n = Math.ceil(d / 0.3);
  for (let k = 1; k < n; k++) { const x = lerp(x0, x1, k / n), y = lerp(y0, y1, k / n); if (isSolid(Math.floor(x), Math.floor(y), 'climb')) return false; }
  return true;
}
const angDiff = (a, b) => { let d = a - b; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; };

function updatePlayer(dt) {
  const p = S.player;
  p.atkCd = Math.max(0, p.atkCd - dt); p.hitT = Math.max(0, (p.hitT || 0) - dt);
  if (p.sleeping) { if (p.ene >= 99.5) { wake(); say('Você acordou descansado.', 'good'); } return; }
  if (p.inCar) { drive(dt); return; }
  const mv = G.input.mv, mag = Math.min(1, Math.hypot(mv.x, mv.y));
  G.input.moving = mag > 0.1;
  const tile = tileAt(Math.floor(p.x), Math.floor(p.y));
  if (G.input.moving) {
    if (p.action && !p.action.move) cancelAction();
    let spd = 2.6;
    const running = G.input.run && p.sta > 1 && !G.input.sneak;
    if (running) { spd = 4.3; p.sta = Math.max(0, p.sta - dt * (invOver() ? 22 : 13)); }
    if (G.input.sneak) spd = 1.5;
    if (invOver()) spd *= 0.65;
    if (p.pain > 50) spd *= 0.85; if (p.hp < 30) spd *= 0.85; if (p.ene < 10) spd *= 0.8;
    if (p.wounds.some((w) => w.k === 'fratura' && !w.band)) spd *= 0.6;
    if (tile === TL.WINDOW) spd *= 0.4;
    if (tile === TL.FIELD || tile === TL.SAND) spd *= 0.85;
    const vx = (mv.x / Math.max(mag, 1e-6)) * mag * spd * dt, vy = (mv.y / Math.max(mag, 1e-6)) * mag * spd * dt;
    const wasWin = tile === TL.WINDOW;
    moveEnt(p, vx, vy, 'climb');
    if (!G.input.aimAt) p.a = Math.atan2(mv.y, mv.x);
    // cacos de vidro
    const nt = tileAt(Math.floor(p.x), Math.floor(p.y));
    if (nt === TL.WINDOW && !wasWin) {
      const s = tsAt(Math.floor(p.x), Math.floor(p.y));
      if (s && s.glass && chance(0.4)) { addWound('vidro', { glass: 1 }); hurtPlayer(5, 'sangue'); say('Você se cortou nos cacos da janela!', 'bad'); }
    }
    // barulho dos passos
    G.acc.noise -= dt;
    if (G.acc.noise <= 0) { G.acc.noise = 0.6; const r = running ? 7 : G.input.sneak ? 0 : 2.5 - lvl('furtividade') * 0.3; if (r > 0) makeNoise(p.x, p.y, r, false); if (G.input.sneak) addXP('furtividade', 0.15); }
    if (!running) p.sta = Math.min(100, p.sta + dt * 7);
  } else p.sta = Math.min(100, p.sta + dt * (p.ene < 15 ? 5 : 11));
  if (G.input.aimAt) p.a = Math.atan2(G.input.aimAt.y - p.y, G.input.aimAt.x - p.x);
  if (G.input.attack) attack();
  // torre de vigia
  const o = objAt(Math.floor(p.x), Math.floor(p.y));
  p.onTower = o && o.t === 'torre' ? 1 : 0;
  updateAction(dt);
}

/* ---------- combate ---------- */
function weapon() { const it = S.player.eq.mao; return it && ITEMS[it.k].wp ? it : null; }
function targetsNear(x, y, r) {
  const out = [];
  for (const z of S.zs) if (Math.abs(z.x - x) < r + 1 && Math.abs(z.y - y) < r + 1) out.push(z);
  for (const n of S.npcs) if (!n.dead && n.hostile && Math.abs(n.x - x) < r + 1 && Math.abs(n.y - y) < r + 1) out.push(n);
  for (const a of S.ani) if (Math.abs(a.x - x) < r + 1 && Math.abs(a.y - y) < r + 1) out.push(a);
  return out;
}
function autoAim(range) {
  // no toque: mira no alvo visível mais próximo à frente
  if (G.input.aimAt) return;
  const p = S.player; let best = null, bs = 1e9;
  for (const z of targetsNear(p.x, p.y, range)) {
    const d = dist(z.x, z.y, p.x, p.y); if (d > range) continue;
    if (!G.vis[ix(Math.floor(z.x), Math.floor(z.y))]) continue;
    const ad = Math.abs(angDiff(Math.atan2(z.y - p.y, z.x - p.x), p.a));
    if (ad > (G.input.moving ? 1.2 : 2.2)) continue;
    const sc = d + ad * 1.5; if (sc < bs) { bs = sc; best = z; }
  }
  if (best) p.a = Math.atan2(best.y - p.y, best.x - p.x);
}
function attack() {
  const p = S.player;
  if (p.atkCd > 0 || p.sleeping || p.inCar) return;
  const it = weapon(), d = it ? ITEMS[it.k].wp : null;
  if (p.action) cancelAction();
  if (d && d.gun) {
    autoAim(d.range);
    if (!it.a) { p.atkCd = 0.4; makeNoise(p.x, p.y, 2, false); say('Sem munição! Recarregue.'); G.input.attack = false; return; }
    shoot(it, d);
    if (!d.auto) G.input.attack = false;
    return;
  }
  if (it && ITEMS[it.k].throw) { G.input.attack = false; throwMolotov(it); return; }
  const wp = d || { dmg: 3, rng: 0.85, cd: 0.6, kb: 0.8, hits: 2, down: 0.15, shove: 1 };
  autoAim(wp.rng + 1.5);
  const sk = lvl('combate');
  const tired = p.sta < 15;
  p.atkCd = wp.cd * (tired ? 1.5 : 1) * (1 - sk * 0.04);
  p.sta = Math.max(0, p.sta - (6 + (it ? ITEMS[it.k].w * 3 : 0)) * (1 - sk * 0.06));
  G.fx.push({ k: 'swing', x: p.x, y: p.y, a: p.a, r: wp.rng + 0.3, t: 0, d: 0.18 });
  const cands = targetsNear(p.x, p.y, wp.rng + 0.6).filter((z) => {
    const dd = dist(z.x, z.y, p.x, p.y); if (dd > wp.rng + (z.r || 0.3)) return false;
    return Math.abs(angDiff(Math.atan2(z.y - p.y, z.x - p.x), p.a)) < 1.0 || dd < 0.45;
  }).sort((a, b) => dist2(a.x, a.y, p.x, p.y) - dist2(b.x, b.y, p.x, p.y)).slice(0, wp.hits);
  if (!cands.length) {
    // acerta porta, janela ou barricada à frente
    const tx = Math.floor(p.x + Math.cos(p.a) * 0.9), ty = Math.floor(p.y + Math.sin(p.a) * 0.9);
    const t = tileAt(tx, ty), s = tsAt(tx, ty);
    if (t === TL.WINDOW && s && !s.broken && !s.bar && !s.open) { breakWindow(tx, ty); }
    else if (t === TL.DOOR && s && !s.open && it) { s.hp -= wp.dmg * 0.6; makeNoise(tx + 0.5, ty + 0.5, 9); float(tx + 0.5, ty + 0.3, 'pou!', '#ddd'); if (s.hp <= 0) { s.open = 1; s.broken = 1; s.lock = 0; say('A porta cedeu.'); } }
    return;
  }
  makeNoise(p.x, p.y, 4, false);
  for (const z of cands) {
    let dmg = wp.dmg * (0.85 + sk * 0.08) * (tired ? 0.6 : 1) * rnd(0.85, 1.15);
    if (z.down > 0) dmg *= 2;
    const crit = chance((wp.crit || 0) + sk * 0.03 + (z.st !== 'chase' ? 0.2 : 0));
    if (crit && !wp.shove) dmg *= 3;
    hitTarget(z, dmg, wp.kb * (1 + sk * 0.05), chance((wp.down || 0) + sk * 0.03), crit);
    if (it) {
      it.d -= chance(sk * 0.08) ? 0 : 1;
      if (it.d <= 0) { say(`${ITEMS[it.k].n} quebrou!`, 'bad'); removeItem(it); break; }
    }
  }
  addXP('combate', 0.8);
}
function hitTarget(z, dmg, kb, down, crit) {
  const p = S.player;
  if (z.kind) { hurtNpc(z, dmg, true); return; }
  const a = Math.atan2(z.y - p.y, z.x - p.x);
  z.hp -= dmg;
  moveEnt(z, Math.cos(a) * kb * 0.7, Math.sin(a) * kb * 0.7, 'climb');
  if (ZT[z.t]) { // zumbi
    z.stun = 0.35 + kb * 0.3; if (down) z.down = 2.6;
    if (z.st !== 'chase') { z.st = 'chase'; z.seeT = 6; }
    addBlood(z.x, z.y, 1);
    float(z.x, z.y - 0.5, crit ? 'CRÍTICO' : Math.round(dmg), crit ? '#ffd24a' : '#ff8a7a');
    if (z.hp <= 0) killZombie(z);
  } else { // animal
    if (z.hp <= 0) killAnimal(z); else z.flee = 4;
  }
}
function killZombie(z) {
  const i = S.zs.indexOf(z); if (i < 0) return;
  S.zs.splice(i, 1); S.stats.kills++; S.player.kills++;
  addBlood(z.x, z.y, 3);
  addXP(S.player.eq.mao && ITEMS[S.player.eq.mao.k].wp && ITEMS[S.player.eq.mao.k].wp.gun ? 'tiro' : 'combate', 3);
  dropCorpse(z.x, z.y, rollLoot('zumbi'), z);
}
function dropCorpse(x, y, items, z) {
  const tx = Math.floor(x), ty = Math.floor(y);
  for (const [a, b] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1]]) {
    const xx = tx + a, yy = ty + b; if (!inb(xx, yy) || isSolid(xx, yy)) continue;
    const o = S.objs[ix(xx, yy)];
    if (o && (o.t === 'cadaver' || o.t === 'bolsa_chao')) { o.items.push(...items); o.n = (o.n || 1) + 1; return; }
    if (o) continue;
    S.objs[ix(xx, yy)] = { t: 'cadaver', items, exp: S.time + 4 * 1440, shirt: z ? z.shirt : '#555', a: rnd(0, 6.28), big: z && z.t === 'brutamontes' ? 1 : 0 };
    G.chunkDirty(xx, yy); return;
  }
}
function dropBag(x, y, items) {
  if (!items.length) return;
  const tx = Math.floor(x), ty = Math.floor(y);
  for (const [a, b] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]]) {
    const xx = tx + a, yy = ty + b; if (!inb(xx, yy)) continue;
    const o = S.objs[ix(xx, yy)];
    if (o && (o.t === 'bolsa_chao' || o.t === 'cadaver')) { o.items.push(...items); return o; }
    if (o || isSolid(xx, yy)) continue;
    S.objs[ix(xx, yy)] = { t: 'bolsa_chao', items };
    G.chunkDirty(xx, yy); return S.objs[ix(xx, yy)];
  }
  return null;
}
function addBlood(x, y, n) {
  for (let k = 0; k < n; k++) S.blood.push([x + rnd(-0.4, 0.4), y + rnd(-0.4, 0.4), rnd(0.1, 0.28), Math.floor(rnd(0, 3))]);
  if (S.blood.length > 500) S.blood.splice(0, S.blood.length - 500);
}
function breakWindow(x, y) {
  const s = tsAt(x, y); if (!s) return;
  s.broken = 1; s.glass = 1; s.open = 0;
  makeNoise(x + 0.5, y + 0.5, 11);
  float(x + 0.5, y + 0.3, 'CRASH', '#cfe8ff');
  G.chunkDirty(x, y);
}
function shoot(it, d) {
  const p = S.player, sk = lvl('tiro');
  it.a--; p.atkCd = d.cd * (1 - sk * 0.05);
  it.d -= 1; if (it.d <= 0) { say(`${ITEMS[it.k].n} emperrou de vez!`, 'bad'); removeItem(it); }
  makeNoise(p.x, p.y, d.noise);
  G.flash = 0.06; G.shake = Math.min(0.5, G.shake + (d.pel ? 0.25 : 0.12));
  const spread = d.spread * (1.7 - sk * 0.17) * (1 + p.fear / 120 + p.pain / 160) * (G.input.moving ? 1.4 : 1);
  const pellets = d.pel || 1;
  const near = targetsNear(p.x, p.y, d.range);
  for (let k = 0; k < pellets; k++) {
    const ang = p.a + (R() + R() - 1) * spread;
    const dx = Math.cos(ang), dy = Math.sin(ang);
    let pierce = d.pierce || 1, t = 0.4; const hit = new Set();
    for (; t < d.range; t += 0.12) {
      const x = p.x + dx * t, y = p.y + dy * t, tx = Math.floor(x), ty = Math.floor(y);
      const tt = tileAt(tx, ty);
      if (tt === TL.WINDOW) { const s = tsAt(tx, ty); if (s && !s.broken && !s.open && !s.bar) breakWindow(tx, ty); else if (s && s.bar) break; }
      else if (isOpaque(tx, ty) || tt === TL.WALL) break;
      let stop = false;
      for (const z of near) {
        if (hit.has(z) || dist2(z.x, z.y, x, y) > (z.r || 0.3) ** 2 * 1.3) continue;
        hit.add(z);
        let dmg = d.dmg * rnd(0.85, 1.15) * (d.pel && t > 5 ? 0.6 : 1);
        const crit = chance(0.06 + sk * 0.04);
        if (crit) dmg *= 2.5;
        hitTarget(z, dmg, d.kb || 0.25, false, crit);
        addXP('tiro', 1);
        if (--pierce <= 0) { stop = true; break; }
      }
      if (stop) break;
    }
    G.tracers.push({ x0: p.x + dx * 0.4, y0: p.y + dy * 0.4, x1: p.x + dx * t, y1: p.y + dy * t, t: 0.07 });
  }
}
function reload() {
  const p = S.player, it = weapon(); if (!it) return;
  const d = ITEMS[it.k].wp; if (!d.gun) return;
  if (it.a >= d.mag) return say('Arma já carregada.');
  const have = countItem(d.ammo); if (!have) return say(`Sem ${ITEMS[d.ammo].n.toLowerCase()}.`);
  const tm = (d.pel ? 0.5 * (d.mag - it.a) : 1.6) * (1 - lvl('tiro') * 0.08);
  startAction('Recarregando', tm, () => {
    const n = Math.min(d.mag - it.a, countItem(d.ammo)); takeItem(d.ammo, n); it.a += n; addXP('tiro', 0.5);
  }, { move: 1 });
}
function throwMolotov(it) {
  const p = S.player;
  const l = hasTag('isqueiro'); if (!l) return say('Preciso de fogo para acender o molotov.');
  l.u--; if (l.u <= 0) removeItem(l);
  removeItem(it);
  let t = 1; const dx = Math.cos(p.a), dy = Math.sin(p.a);
  for (; t < 7; t += 0.2) if (isSolid(Math.floor(p.x + dx * t), Math.floor(p.y + dy * t))) { t -= 0.3; break; }
  const x = p.x + dx * t, y = p.y + dy * t;
  G.fx.push({ k: 'throw', x0: p.x, y0: p.y, x1: x, y1: y, t: 0, d: 0.35 });
  setTimeoutGame(0.35, () => {
    makeNoise(x, y, 10);
    for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) if (a === 0 || b === 0 || chance(0.5)) igniteTile(Math.floor(x) + a, Math.floor(y) + b, true);
  });
  addXP('sobrevivencia', 1);
}
const timers = [];
function setTimeoutGame(s, fn) { timers.push({ t: s, fn }); }

/* ---------- fogo ---------- */
function igniteTile(x, y, force) {
  if (!inb(x, y)) return;
  const i = ix(x, y), t = S.tiles[i];
  if (S.fires[i] || t === TL.WATER) return;
  if (!force && !(FLAMMABLE_T.has(t) || S.objs[i] || t === TL.DOOR || t === TL.WINDOW)) return;
  if (Object.keys(S.fires).length > 350) return;
  S.fires[i] = rnd(18, 35);
}
function updateFires(dt) {
  G.acc.fire += dt; if (G.acc.fire < 0.5) return;
  const step = G.acc.fire; G.acc.fire = 0;
  const p = S.player;
  for (const k of Object.keys(S.fires)) {
    const i = +k, x = i % MAP_W, y = Math.floor(i / MAP_W);
    S.fires[k] -= step * (1 + S.rain * 3);
    if (S.fires[k] <= 0) {
      delete S.fires[k];
      const t = S.tiles[i];
      if (t === TL.TREE || t === TL.BUSH || t === TL.FIELD || t === TL.GRASS) S.tiles[i] = TL.BURNT;
      else if (t === TL.FLOOR || t === TL.TILEF) S.tiles[i] = TL.BURNT;
      else if (t === TL.DOOR || t === TL.WINDOW) { S.tiles[i] = TL.RUBBLE; delete S.ts[i]; }
      const o = S.objs[i]; if (o && o.t !== 'bomba') delete S.objs[i];
      G.chunkDirty(x, y); continue;
    }
    if (S.rain < 0.5) for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      if (!chance(0.07 * step)) continue;
      const xx = x + a, yy = y + b; if (!inb(xx, yy)) continue;
      const j = ix(xx, yy), tt = S.tiles[j];
      if (FLAMMABLE_T.has(tt) || (S.objs[j] && FURN[S.objs[j].t] && FURN[S.objs[j].t].k !== 'bomba') || tt === TL.DOOR || (tt === TL.GRASS && chance(0.15))) igniteTile(xx, yy);
      if (S.objs[j] && S.objs[j].t === 'bomba' && chance(0.3)) explode(xx, yy);
    }
    // queima quem está no fogo
    if (Math.floor(p.x) === x && Math.floor(p.y) === y && !p.inCar) { hurtPlayer(6 * step, 'fogo'); if (chance(0.3 * step)) addWound('queimadura'); }
    for (const z of S.zs) if (Math.floor(z.x) === x && Math.floor(z.y) === y) { z.hp -= 18 * step; if (z.hp <= 0) killZombie(z); }
  }
}
function explode(x, y) {
  const o = S.objs[ix(x, y)]; if (o) delete S.objs[ix(x, y)];
  makeNoise(x, y, 40); G.flash = 0.25; G.shake = 0.6;
  for (let a = -2; a <= 2; a++) for (let b = -2; b <= 2; b++) igniteTile(x + a, y + b, true);
  const p = S.player; if (dist2(p.x, p.y, x, y) < 9) hurtPlayer(40, 'explosão');
  for (const z of S.zs.slice()) if (dist2(z.x, z.y, x, y) < 9) { z.hp -= 120; if (z.hp <= 0) killZombie(z); }
}

/* ---------- campo de fluxo (zumbis contornam paredes e quebram portas) ---------- */
const heap = { k: [], v: [] };
function hpush(k, v) { const H = heap; H.k.push(k); H.v.push(v); let i = H.k.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (H.k[p] <= H.k[i]) break; [H.k[p], H.k[i]] = [H.k[i], H.k[p]]; [H.v[p], H.v[i]] = [H.v[i], H.v[p]]; i = p; } }
function hpop() {
  const H = heap, top = H.v[0], lk = H.k.pop(), lv = H.v.pop();
  if (H.k.length) { H.k[0] = lk; H.v[0] = lv; let i = 0; for (;;) { const l = i * 2 + 1, r = l + 1; let m = i; if (l < H.k.length && H.k[l] < H.k[m]) m = l; if (r < H.k.length && H.k[r] < H.k[m]) m = r; if (m === i) break; [H.k[m], H.k[i]] = [H.k[i], H.k[m]]; [H.v[m], H.v[i]] = [H.v[i], H.v[m]]; i = m; } }
  return top;
}
function stepCost(x, y) {
  if (!inb(x, y)) return -1;
  const i = ix(x, y), t = S.tiles[i];
  if (t === TL.WATER || t === TL.TREE || t === TL.WALL) return -1;
  const br = breakable(x, y);
  if (br) {
    if (br.kind === 'door') { const s = S.ts[i]; return 40 + (s.bar || 0) * 50; }
    if (br.kind === 'win') { const s = S.ts[i]; return 30 + (s.bar || 0) * 50; }
    return 30 + (S.objs[i].hp || 100) / 3;
  }
  if (t === TL.WINDOW) return 22;
  const o = S.objs[i]; if (o && FURN[o.t] && FURN[o.t].solid && !(FURN[o.t].gate && o.open)) return -1;
  return 10;
}
function buildFlow() {
  const p = S.player, px = Math.floor(p.x), py = Math.floor(p.y);
  G.flowOX = px - FR; G.flowOY = py - FR; G.flow.fill(INF);
  heap.k.length = 0; heap.v.length = 0;
  const si = FR * FS + FR; G.flow[si] = 0; hpush(0, si);
  while (heap.k.length) {
    const c0 = heap.k[0], i = hpop(); if (c0 > G.flow[i]) continue;
    const lx = i % FS, ly = (i / FS) | 0, wx = lx + G.flowOX, wy = ly + G.flowOY;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = lx + dx, ny = ly + dy; if (nx < 0 || ny < 0 || nx >= FS || ny >= FS) continue;
      const c = stepCost(wx + dx, wy + dy); if (c < 0) continue;
      if (dx && dy && (stepCost(wx + dx, wy) !== 10 || stepCost(wx, wy + dy) !== 10)) continue;
      const nc = c0 + (dx && dy ? Math.round(c * 1.4) : c), ni = ny * FS + nx;
      if (nc < G.flow[ni]) { G.flow[ni] = nc; hpush(nc, ni); }
    }
  }
}
function flowAt(x, y) {
  const lx = x - G.flowOX, ly = y - G.flowOY;
  if (lx < 0 || ly < 0 || lx >= FS || ly >= FS) return INF;
  return G.flow[ly * FS + lx];
}

/* ---------- zumbis ---------- */
function zSight(z) {
  const p = S.player;
  let r = G.sightR * 0.5 + 2;
  if (p.inCar && p.inCar.on) r += 4;
  if (G.input.sneak) r *= 0.55 - lvl('furtividade') * 0.04;
  if (p.light || (p.inCar && p.inCar.lights)) r = Math.max(r, 12);
  return Math.max(2.5, r);
}
function zombieSees(z, tx, ty, r) {
  const d2 = dist2(z.x, z.y, tx, ty); if (d2 > r * r) return false;
  if (d2 > 6 && Math.abs(angDiff(Math.atan2(ty - z.y, tx - z.x), z.a)) > 1.9) return false;
  return los(z.x, z.y, tx, ty);
}
function hitObstacle(z, br) {
  const i = br.i, x = i % MAP_W, y = Math.floor(i / MAP_W);
  const dmg = 9 * (ZT[z.t].breaker || 1) * rnd(0.7, 1.3);
  z.cd = 1.3;
  if (br.kind === 'obj') {
    const o = S.objs[i]; o.hp = (o.hp || FURN[o.t].hp || 100) - dmg;
    if (o.hp <= 0) { delete S.objs[i]; if (o.items && o.items.length) dropBag(x, y, o.items); say(`Os zumbis derrubaram: ${FURN[o.t].n.toLowerCase()}!`, 'bad'); G.chunkDirty(x, y); }
  } else {
    const s = S.ts[i];
    if (s.bar) { s.bhp = (s.bhp || 80) - dmg; if (s.bhp <= 0) { s.bar--; s.bhp = s.bar ? 80 : 0; G.chunkDirty(x, y); if (dist2(x, y, S.player.x, S.player.y) < 400) say('Uma barricada caiu!', 'bad'); } }
    else if (br.kind === 'win') { breakWindow(x, y); }
    else { s.hp -= dmg; if (s.hp <= 0) { s.open = 1; s.broken = 1; s.lock = 0; G.chunkDirty(x, y); if (dist2(x, y, S.player.x, S.player.y) < 400) say('Os zumbis arrombaram uma porta!', 'bad'); } }
  }
  if (chance(0.5)) makeNoise(x + 0.5, y + 0.5, 6, false);
  G.fx.push({ k: 'bang', x: x + 0.5, y: y + 0.5, t: 0, d: 0.25 });
}
function zombieAttack(z) {
  const p = S.player, d = ZT[z.t];
  z.cd = 1.25;
  if (p.inCar) {
    const v = p.inCar; v.hp -= 4 * d.dmg;
    if (v.hp < VT[v.t].hp * 0.25 && chance(0.15)) { say('Eles quebraram o vidro!', 'bad'); woundFromZombie(z, 1); }
    return;
  }
  if (p.sleeping) wake('Um zumbi te atacou enquanto dormia!');
  const adj = S.zs.filter((o) => dist2(o.x, o.y, p.x, p.y) < 1.4 && !o.down).length;
  if (!chance(0.42 + (adj - 1) * 0.1 + (p.fear > 70 ? 0.05 : 0) - (G.input.moving && G.input.run ? 0.15 : 0))) { float(p.x, p.y - 0.6, 'esquivou', '#cfd'); return; }
  woundFromZombie(z, adj);
}
function woundFromZombie(z, adj) {
  const p = S.player, d = ZT[z.t];
  p.fear = clamp(p.fear + 18, 0, 100); p.str = clamp(p.str + 4, 0, 100);
  if (adj >= 4 && chance(0.3)) { say('A multidão te derrubou...', 'bad'); hurtPlayer(200, 'devorado'); return; }
  const r = R();
  const k = r < 0.1 * (adj > 2 ? 1.8 : 1) ? 'mordida' : r < 0.42 ? 'corte' : 'arranhao';
  if (chance(protection() * (k === 'mordida' ? 0.8 : 1))) { float(p.x, p.y - 0.6, 'a roupa protegeu', '#cde'); hurtPlayer(2 * d.dmg, 'ferimentos'); return; }
  addWound(k);
  const inf = { mordida: 1, corte: 0.25, arranhao: 0.07 }[k];
  if (chance(inf) && !p.knox) { p.knox = 1; p.knoxT = 0; }
  say(k === 'mordida' ? 'Você foi MORDIDO!' : k === 'corte' ? 'Um zumbi rasgou sua pele!' : 'Você levou um arranhão.', 'bad');
  float(p.x, p.y - 0.6, WOUND_LBL[k], '#ff6a5a');
  addBlood(p.x, p.y, 1);
  hurtPlayer({ arranhao: 5, corte: 9, mordida: 14 }[k] * d.dmg, 'ferimentos');
}
const zgrid = new Map();
function rebuildZGrid() {
  zgrid.clear();
  for (const z of S.zs) { const k = (Math.floor(z.x / 2) << 8) | Math.floor(z.y / 2); let a = zgrid.get(k); if (!a) zgrid.set(k, a = []); a.push(z); }
}
function updateZombies(dt) {
  const p = S.player;
  G.acc.coarse += dt; const coarse = G.acc.coarse >= 1; if (coarse) G.acc.coarse = 0;
  G.acc.think += dt; const think = G.acc.think >= 0.25; if (think) G.acc.think = 0;
  const sightR = zSight();
  let seen = 0;
  for (let n = S.zs.length - 1; n >= 0; n--) {
    const z = S.zs[n]; if (!z) continue;
    const zd = ZT[z.t];
    z.r = zd.r;
    const d2p = dist2(z.x, z.y, p.x, p.y);
    if (d2p > 45 * 45) { if (coarse) coarseZombie(z); continue; }
    if (z.down > 0) { z.down -= dt; continue; }
    if (z.stun > 0) { z.stun -= dt; continue; }
    z.cd -= dt;
    if (z.seeT > 0) z.seeT -= dt;
    // percepção
    if (think && !S.dead) {
      if (!p.sleeping || d2p < 16) {
        if (zombieSees(z, p.x, p.y, sightR)) { z.st = 'chase'; z.seeT = 7; z.tx = p.x; z.ty = p.y; z.tgt = null; }
      } else if (d2p < 9 && los(z.x, z.y, p.x, p.y)) { z.st = 'chase'; z.seeT = 5; }
      // sobreviventes por perto
      if (z.st !== 'chase') for (const npc of S.npcs) {
        if (npc.dead || npc.away || Math.abs(npc.x - z.x) > 9 || Math.abs(npc.y - z.y) > 9) continue;
        if (zombieSees(z, npc.x, npc.y, 8)) { z.st = 'npc'; z.tgt = npc.id; z.seeT = 6; break; }
      }
    }
    if (G.vis[ix(Math.floor(z.x), Math.floor(z.y))] && d2p < 100) seen++;
    let spd = zd.spd * (tileAt(Math.floor(z.x), Math.floor(z.y)) === TL.WINDOW ? 0.3 : 1) * (z.t === 'corredor' && daylight() > 0.5 ? 0.8 : 1);
    let gx = 0, gy = 0;
    if (z.st === 'chase') {
      const d = Math.sqrt(d2p);
      if (z.seeT <= 0 && d > 3) { z.st = 'hunt'; z.huntT = 15; }
      else {
        z.tx = p.x; z.ty = p.y;
        if (d < 0.62 + zd.r + (p.inCar ? VT[p.inCar.t].wid / 2 : 0)) { if (z.cd <= 0) zombieAttack(z); z.a = Math.atan2(p.y - z.y, p.x - z.x); continue; }
        const zx = Math.floor(z.x), zy = Math.floor(z.y);
        const here = flowAt(zx, zy);
        if (here < INF && !p.inCar && !(d < 5 && clearLine(z.x, z.y, p.x, p.y))) {
          let best = here, bx = 0, by = 0;
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { if (!dx && !dy) continue; const f = flowAt(zx + dx, zy + dy); if (f < best) { best = f; bx = dx; by = dy; } }
          if (bx || by) {
            const br = breakable(zx + bx, zy + by);
            if (br && !(tileAt(zx + bx, zy + by) === TL.WINDOW && S.ts[ix(zx + bx, zy + by)].broken && !S.ts[ix(zx + bx, zy + by)].bar)) {
              if (z.cd <= 0) hitObstacle(z, br); z.a = Math.atan2(by, bx); continue;
            }
            gx = zx + bx + 0.5 - z.x; gy = zy + by + 0.5 - z.y;
          } else { gx = p.x - z.x; gy = p.y - z.y; }
        } else { gx = p.x - z.x; gy = p.y - z.y; }
      }
    }
    if (z.st === 'npc') {
      const npc = S.npcs.find((o) => o.id === z.tgt);
      if (!npc || npc.dead || z.seeT <= 0) z.st = 'idle';
      else {
        const d = dist(z.x, z.y, npc.x, npc.y);
        if (d < 0.9) { if (z.cd <= 0) { z.cd = 1.3; hurtNpc(npc, 9 * zd.dmg, false); } continue; }
        gx = npc.x - z.x; gy = npc.y - z.y;
      }
    }
    if (z.st === 'hunt') {
      z.huntT -= dt;
      gx = z.tx - z.x; gy = z.ty - z.y;
      if (gx * gx + gy * gy < 0.5 || z.huntT <= 0) { z.st = 'idle'; z.inside = isInside(z.x, z.y) ? 1 : 0; }
      spd *= 0.85;
    }
    if (z.st === 'idle') {
      if (z.hid) { const h = S.hordes.find((o) => o.id === z.hid); if (h) { gx = h.tx + z.ox - z.x; gy = h.ty + z.oy - z.y; if (gx * gx + gy * gy < 4) { gx = gy = 0; } spd *= 0.5; } }
      if (!gx && !gy) {
        z.wt = (z.wt || 0) - dt;
        if (z.wt <= 0) { z.wt = rnd(2, 7); z.wa = chance(0.5) ? null : rnd(0, 6.28); }
        if (z.wa != null) { gx = Math.cos(z.wa); gy = Math.sin(z.wa); spd *= 0.3; }
      }
    }
    if (gx || gy) {
      const l = Math.hypot(gx, gy) || 1;
      const mx = (gx / l) * spd * dt, my = (gy / l) * spd * dt;
      const wasIn = z.inside && bldAt(Math.floor(z.x), Math.floor(z.y)) >= 0;
      const ox = z.x, oy = z.y;
      const moved = moveEnt(z, mx, my, 'climb');
      // zumbis "de dentro" não saem sozinhos ao vaguear
      if (z.st === 'idle' && wasIn && bldAt(Math.floor(z.x), Math.floor(z.y)) < 0) { z.x = ox; z.y = oy; z.wa = rnd(0, 6.28); }
      if (!moved && z.st === 'idle') z.wa = rnd(0, 6.28);
      if (!moved && (z.st === 'hunt' || z.st === 'chase')) {
        // empacou: tenta quebrar o que está no caminho
        const tx = Math.floor(z.x + (gx / l) * 0.7), ty = Math.floor(z.y + (gy / l) * 0.7);
        const br = breakable(tx, ty); if (br && z.cd <= 0) hitObstacle(z, br);
        else if (z.st === 'hunt' && chance(0.02)) z.st = 'idle';
      }
      z.a = Math.atan2(gy, gx);
    }
    // separação
    const k = (Math.floor(z.x / 2) << 8) | Math.floor(z.y / 2);
    const cell = zgrid.get(k);
    if (cell) for (const o of cell) {
      if (o === z) continue;
      const dx = z.x - o.x, dy = z.y - o.y, dd = dx * dx + dy * dy, mn = z.r + o.r;
      if (dd > 0.0001 && dd < mn * mn) { const f = (mn - Math.sqrt(dd)) * 0.5 / Math.sqrt(dd); moveEnt(z, dx * f, dy * f, 'climb'); }
    }
  }
  G.seenZ = seen;
}
function coarseZombie(z) {
  // fora da área ativa: movimento lento e barato (hordas migram, outros vagam)
  if (z.hid) {
    const h = S.hordes.find((o) => o.id === z.hid);
    if (h) {
      const gx = h.tx + z.ox - z.x, gy = h.ty + z.oy - z.y, l = Math.hypot(gx, gy);
      if (l > 1.5) { z.r = ZT[z.t].r; if (!moveEnt(z, (gx / l) * 0.8, (gy / l) * 0.8, 'climb')) { moveEnt(z, rnd(-1, 1), rnd(-1, 1), 'climb'); } }
      return;
    }
    z.hid = 0;
  }
  if (z.st === 'hunt') {
    const gx = z.tx - z.x, gy = z.ty - z.y, l = Math.hypot(gx, gy);
    if (l < 1) z.st = 'idle'; else { z.r = ZT[z.t].r; moveEnt(z, (gx / l) * 0.8, (gy / l) * 0.8, 'climb'); }
    return;
  }
  if (!z.inside && chance(0.1)) { z.r = ZT[z.t].r; moveEnt(z, rnd(-1, 1), rnd(-1, 1)); }
}

/* ---------- veículos ---------- */
function hasKey(v) { return v.key || v.hot || S.player.inv.some((i) => i.k === 'chave_carro' && i.kid === v.id); }
function enterVehicle(v) {
  const p = S.player;
  p.inCar = v; p.x = v.x; p.y = v.y; cancelAction();
  if (!hasKey(v) && v.alarm) { v.alarm = 0; v.alarmT = 25; say('O ALARME DISPAROU!', 'bad'); }
  say(hasKey(v) ? `Você entrou: ${VT[v.t].n}.` : `${VT[v.t].n}: sem chave. Procure a chave ou faça ligação direta.`);
}
function exitVehicle() {
  const p = S.player, v = p.inCar; if (!v) return;
  if (Math.abs(v.sp) > 1.5) return say('Pare o veículo primeiro.');
  const d = VT[v.t];
  for (const side of [-1, 1, 0]) {
    const a = side ? v.a + side * Math.PI / 2 : v.a + Math.PI, off = side ? d.wid / 2 + 0.45 : d.len / 2 + 0.45;
    const x = v.x + Math.cos(a) * off, y = v.y + Math.sin(a) * off;
    if (!blockedAt(x, y, p.r) && !vehAt(x, y, p.r, null)) { p.x = x; p.y = y; p.inCar = null; v.sp = 0; return; }
  }
  say('Não há espaço para sair!');
}
function startEngine() {
  const p = S.player, v = p.inCar; if (!v) return;
  if (v.on) { v.on = 0; return say('Motor desligado.'); }
  if (!hasKey(v)) return say('Sem a chave. Tente ligação direta (Mecânica 1 + chave de fenda).');
  if (v.bat < 12) { makeNoise(v.x, v.y, 3); return say('Clic... clic... A bateria está fraca.', 'bad'); }
  v.bat -= 3;
  if (v.eng <= 0) return say('O motor está destruído.', 'bad');
  if (v.fuel <= 0) { makeNoise(v.x, v.y, 6); return say('O motor gira mas não pega. Tanque vazio.', 'bad'); }
  if (v.eng < 25 && chance(0.5)) { makeNoise(v.x, v.y, 8); return say('O motor engasgou. Tente de novo.'); }
  v.on = 1; makeNoise(v.x, v.y, 10); say('Vrrrum! Motor ligado.', 'good');
}
function hotwire() {
  const p = S.player, v = p.inCar; if (!v) return;
  if (lvl('mecanica') < 1) return say('Preciso de Mecânica nível 1 para ligação direta.');
  if (!hasTag('fenda')) return say('Preciso de uma chave de fenda.');
  startAction('Ligação direta', 7 - lvl('mecanica'), () => {
    if (chance(0.35 + lvl('mecanica') * 0.13)) { v.hot = 1; addXP('mecanica', 6); say('Fios cruzados. Agora é só dar a partida.', 'good'); }
    else { addXP('mecanica', 2); makeNoise(v.x, v.y, 5); say('Faísca... não deu. Tente de novo.'); if (v.alarm) { v.alarm = 0; v.alarmT = 25; say('O ALARME DISPAROU!', 'bad'); } }
  });
}
function drive(dt) {
  const p = S.player, v = p.inCar, d = VT[v.t];
  updateAction(dt);
  const mv = G.input.mv, mag = Math.min(1, Math.hypot(mv.x, mv.y));
  let thr = 0, steer = 0;
  if (G.input.kbd) { thr = -mv.y; steer = mv.x; }
  else if (mag > 0.15) {
    const ta = Math.atan2(mv.y, mv.x), diff = angDiff(ta, v.a);
    if (Math.abs(diff) > 2.3 && v.sp < 1) { thr = -mag; steer = -clamp(angDiff(ta, v.a + Math.PI) * 2, -1, 1); }
    else { thr = mag * (Math.abs(diff) > 1.3 ? 0.35 : 1); steer = clamp(diff * 2, -1, 1); }
  }
  const run = v.on && v.fuel > 0 && v.eng > 0;
  if (v.on && v.fuel <= 0) { v.on = 0; say('Acabou a gasolina!', 'bad'); }
  const flat = v.tires.filter((t) => t <= 0).length;
  const surf = { [TL.ROAD]: 1, [TL.PARK]: 1, [TL.WALK]: 0.95, [TL.DIRT]: 0.8, [TL.GRASS]: 0.65, [TL.FIELD]: 0.5, [TL.SAND]: 0.45, [TL.BURNT]: 0.6, [TL.RUBBLE]: 0.4 }[tileAt(Math.floor(v.x), Math.floor(v.y))] || 0.5;
  const maxS = d.spd * (0.45 + 0.55 * v.eng / 100) * (1 - flat * 0.22) * (d.strong ? 1 : surf);
  if (run && thr) {
    if (Math.sign(thr) !== Math.sign(v.sp) && Math.abs(v.sp) > 0.3) v.sp *= 1 - dt * 3.5;
    else v.sp += thr * (thr > 0 ? 5.5 : 3.5) * dt;
  }
  v.sp *= 1 - dt * (thr && run ? 0.25 : 1.2);
  v.sp = clamp(v.sp, -maxS * 0.4, maxS);
  if (Math.abs(v.sp) < 0.03 && !thr) v.sp = 0;
  v.a += steer * dt * 2.3 * clamp(v.sp / 3.5, -1, 1) * (d.moto ? 1.25 : 1);
  if (flat) v.a += flat * 0.05 * dt * v.sp;
  // tenta mover
  const nx = v.x + Math.cos(v.a) * v.sp * dt, ny = v.y + Math.sin(v.a) * v.sp * dt;
  if (vehHits(v, nx, ny)) {
    const s = Math.abs(v.sp);
    if (s > 3) {
      v.hp -= s * 3; v.eng = Math.max(0, v.eng - s * 0.9); makeNoise(v.x, v.y, 12); G.shake = 0.4;
      say('Batida!', 'bad');
      if (s > 7.5) { hurtPlayer(s * 1.8, 'acidente'); if (chance(0.3) && !d.moto) addWound('fratura'); if (d.moto) addWound('corte'); }
    }
    v.sp *= -0.25;
  } else { v.x = nx; v.y = ny; }
  // atropelar zumbis
  for (const z of S.zs.slice()) {
    if (Math.abs(z.x - v.x) > 2.5 || Math.abs(z.y - v.y) > 2.5) continue;
    const c = Math.cos(-v.a), s = Math.sin(-v.a), lx = (z.x - v.x) * c - (z.y - v.y) * s, ly = (z.x - v.x) * s + (z.y - v.y) * c;
    if (Math.abs(lx) < d.len / 2 + z.r && Math.abs(ly) < d.wid / 2 + z.r) {
      const sp = Math.abs(v.sp);
      if (sp > 1.6) {
        z.hp -= sp * 11; z.down = 2.5; v.hp -= 2 * (d.strong ? 0.3 : 1); v.sp *= d.strong ? 0.97 : 0.85; addBlood(z.x, z.y, 2);
        if (z.hp <= 0) killZombie(z);
      }
      const push = Math.sign(ly || 1) * 0.12; moveEnt(z, -Math.sin(v.a) * push, Math.cos(v.a) * push, 'climb');
    }
  }
  if (v.hp <= 0) { v.hp = 0; v.eng = 0; v.on = 0; v.sp = 0; say('O veículo está destruído!', 'bad'); }
  // consumo, bateria, barulho
  if (v.on) {
    v.fuel = Math.max(0, v.fuel - (Math.abs(v.sp) * 0.006 + 0.0015) * dt * (d.fuel / 45));
    v.bat = Math.min(100, v.bat + dt * 0.4);
    v.nt = (v.nt || 0) - dt; if (v.nt <= 0) { v.nt = 1; makeNoise(v.x, v.y, 8 + Math.abs(v.sp) * 1.1, false); }
  } else if (v.lights) { v.bat = Math.max(0, v.bat - dt * 0.05); if (v.bat <= 0) v.lights = 0; }
  p.x = v.x; p.y = v.y; p.a = v.a;
}
function vehCorners(v, x, y) {
  const d = VT[v.t], c = Math.cos(v.a), s = Math.sin(v.a), out = [];
  for (const [l, w] of [[0.5, 0.5], [0.5, -0.5], [-0.5, 0.5], [-0.5, -0.5], [0.5, 0], [-0.5, 0], [0, 0.5], [0, -0.5]]) {
    out.push([x + c * l * d.len - s * w * d.wid, y + s * l * d.len + c * w * d.wid]);
  }
  return out;
}
function vehHits(v, x, y) {
  for (const [cx, cy] of vehCorners(v, x, y)) if (isSolid(Math.floor(cx), Math.floor(cy))) return true;
  for (const o of S.vehs) {
    if (o === v || Math.abs(o.x - x) > 4 || Math.abs(o.y - y) > 4) continue;
    for (const [cx, cy] of vehCorners(v, x, y)) if (vehAt(cx, cy, 0.05, v) === o) return true;
  }
  return false;
}
function updateVehicles(dt) {
  for (const v of S.vehs) {
    if (v.alarmT > 0) { v.alarmT -= dt; v.an = (v.an || 0) - dt; if (v.an <= 0) { v.an = 2; makeNoise(v.x, v.y, 28); } }
    if (v !== S.player.inCar && v.on) { v.fuel = Math.max(0, v.fuel - 0.0015 * dt); if (v.fuel <= 0) v.on = 0; }
  }
}

/* ---------- sobreviventes ---------- */
function hurtNpc(n, dmg, byPlayer) {
  n.hp -= dmg; addBlood(n.x, n.y, 1); float(n.x, n.y - 0.6, Math.round(dmg), '#ffb08a');
  if (byPlayer) { n.hostile = 1; n.trust -= 50; n.st = n.hp < 35 ? 'fuga' : 'ataque'; }
  if (n.hp <= 0) killNpc(n, byPlayer ? 'player' : 'zumbi');
}
function killNpc(n, by) {
  if (n.dead) return;
  n.dead = 1;
  const items = n.inv.splice(0); if (n.wp) items.push(newItem(n.wp));
  dropCorpse(n.x, n.y, items, { shirt: NPC_KINDS[n.kind].col });
  if (by === 'zumbi') {
    if (dist(n.x, n.y, S.player.x, S.player.y) < 30) say(`${n.name} foi pego pelos zumbis...`, 'bad');
    const x = n.x, y = n.y;
    S.events.push({ at: S.time + rint(20, 60), k: 'reanimar', x, y, name: n.name });
  } else if (n.kind === 'bandido') say(`${n.name} (saqueador) caiu.`);
  else say(`Você matou ${n.name}.`, 'bad');
}
function npcAttack(n, target) {
  n.cd = n.wp && ITEMS[n.wp] && ITEMS[n.wp].wp && ITEMS[n.wp].wp.gun ? 1.4 : 1.0;
  const gun = n.wp && ITEMS[n.wp].wp && ITEMS[n.wp].wp.gun;
  if (gun) {
    makeNoise(n.x, n.y, ITEMS[n.wp].wp.noise);
    G.tracers.push({ x0: n.x, y0: n.y, x1: target.x + rnd(-0.4, 0.4), y1: target.y + rnd(-0.4, 0.4), t: 0.07 });
    n.ammo--;
    if (!chance(target === S.player ? 0.42 : 0.6)) return;
  } else if (dist(n.x, n.y, target.x, target.y) > 1.1) return;
  if (target === S.player) {
    if (S.player.inCar) { S.player.inCar.hp -= 8; return; }
    const k = gun ? 'tiro' : chance(0.6) ? 'corte' : 'arranhao';
    if (!chance(protection())) addWound(k);
    say(`${n.name} te acertou!`, 'bad');
    hurtPlayer(gun ? 16 : 9, 'saqueadores');
  } else {
    const dmg = (n.wp ? (ITEMS[n.wp].wp ? ITEMS[n.wp].wp.dmg : 10) : 8) * rnd(0.7, 1.1) * (gun ? 1 : 0.9);
    target.hp -= dmg; addBlood(target.x, target.y, 1); target.stun = 0.4;
    if (target.hp <= 0) { if (target.t) { const i = S.zs.indexOf(target); if (i >= 0) { S.zs.splice(i, 1); dropCorpse(target.x, target.y, rollLoot('zumbi'), target); } } else if (target.kind) killNpc(target, 'npc'); }
  }
}
function npcMove(n, gx, gy, spd, dt) {
  const l = Math.hypot(gx, gy); if (l < 0.05) return;
  n.r = 0.3; n.a = Math.atan2(gy, gx);
  if (!moveEnt(n, (gx / l) * spd * dt, (gy / l) * spd * dt, 'climb')) {
    // tenta desviar
    const side = n.id % 2 ? 1 : -1;
    moveEnt(n, (-gy / l) * side * spd * dt, (gx / l) * side * spd * dt, 'climb');
  }
}
class Heap {
  constructor() { this.k = []; this.v = []; }
  get size() { return this.k.length; }
  push(k, v) { const K = this.k, V = this.v; K.push(k); V.push(v); let i = K.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (K[p] <= K[i]) break; [K[p], K[i]] = [K[i], K[p]]; [V[p], V[i]] = [V[i], V[p]]; i = p; } }
  pop() {
    const K = this.k, V = this.v, top = V[0], lk = K.pop(), lv = V.pop();
    if (K.length) { K[0] = lk; V[0] = lv; let i = 0; for (;;) { const l = i * 2 + 1, r = l + 1; let m = i; if (l < K.length && K[l] < K[m]) m = l; if (r < K.length && K[r] < K[m]) m = r; if (m === i) break; [K[m], K[i]] = [K[i], K[m]]; [V[m], V[i]] = [V[i], V[m]]; i = m; } }
    return top;
  }
}
function npcPassable(x, y) {
  if (!isSolid(x, y, 'climb')) return true;
  if (tileAt(x, y) === TL.DOOR) { const s = S.ts[ix(x, y)]; return !!s && !s.lock && !s.bar; }
  const o = S.objs[ix(x, y)]; return !!(o && FURN[o.t] && FURN[o.t].gate);
}
function astar(sx, sy, tx, ty, max = 3000) {
  if (!inb(tx, ty)) return null;
  const H = new Heap(), g = new Map(), came = new Map(), s0 = ix(sx, sy), goal = ix(tx, ty);
  g.set(s0, 0); H.push(0, s0); let n = 0;
  while (H.size && n++ < max) {
    const c = H.pop(); if (c === goal) break;
    const cx = c % MAP_W, cy = Math.floor(c / MAP_W), gc = g.get(c);
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = cx + dx, ny = cy + dy;
      if (!inb(nx, ny) || !(npcPassable(nx, ny) || ix(nx, ny) === goal)) continue;
      if (dx && dy && (!npcPassable(cx + dx, cy) || !npcPassable(cx, cy + dy))) continue;
      const ni = ix(nx, ny), ng = gc + (dx && dy ? 1.41 : 1);
      if (g.has(ni) && g.get(ni) <= ng) continue;
      g.set(ni, ng); came.set(ni, c); H.push(ng + Math.hypot(tx - nx, ty - ny), ni);
    }
  }
  if (!came.has(goal)) return null;
  const path = []; let c = goal;
  while (c !== s0) { path.push([c % MAP_W, Math.floor(c / MAP_W)]); c = came.get(c); }
  return path.reverse();
}
function npcGo(n, tx, ty, spd, dt) {
  n.pathT = (n.pathT || 0) - dt;
  if (dist(n.x, n.y, tx, ty) < 4 && clearLine(n.x, n.y, tx, ty)) { n.path = null; npcMove(n, tx - n.x, ty - n.y, spd, dt); return; }
  const key = Math.floor(tx) * 1000 + Math.floor(ty);
  if (!n.path || n.pathKey !== key || n.pathT <= 0) { n.pathKey = key; n.pathT = 3; n.path = astar(Math.floor(n.x), Math.floor(n.y), Math.floor(tx), Math.floor(ty)) || []; }
  if (!n.path.length) { npcMove(n, tx - n.x, ty - n.y, spd, dt); return; }
  const [px, py] = n.path[0];
  if (dist(n.x, n.y, px + 0.5, py + 0.5) < 0.4) { n.path.shift(); return; }
  if (tileAt(px, py) === TL.DOOR) { const s = S.ts[ix(px, py)]; if (s && !s.open && !s.lock && !s.bar) { s.open = 1; G.chunkDirty(px, py); } }
  const o = S.objs[ix(px, py)]; if (o && FURN[o.t] && FURN[o.t].gate && !o.open) { o.open = 1; G.chunkDirty(px, py); }
  npcMove(n, px + 0.5 - n.x, py + 0.5 - n.y, spd, dt);
}
function updateNpcs(dt) {
  const p = S.player;
  for (const n of S.npcs) {
    if (n.dead || n.away) continue;
    n.cd -= dt;
    const dp = dist(n.x, n.y, p.x, p.y);
    if (dp > 50 && n.st !== 'seguir') continue;
    // zumbi mais próximo
    let zt = null, zd = 1e9;
    for (const z of S.zs) { if (Math.abs(z.x - n.x) > 6 || Math.abs(z.y - n.y) > 6) continue; const d = dist(z.x, z.y, n.x, n.y); if (d < zd) { zd = d; zt = z; } }
    const armed = !!n.wp;
    if (n.hostile && n.st !== 'fuga') {
      if (n.st !== 'ataque' && dp < 8 && !p.sleeping && los(n.x, n.y, p.x, p.y)) {
        if (!n.demandT || S.time - n.demandT > 1440) { n.demandT = S.time; if (G.onDialog) G.onDialog(n, 'assalto'); }
        else n.st = 'ataque';
      }
      if (n.st === 'ataque') {
        if (dp > 22) n.st = n.raid ? 'raid' : 'casa';
        else {
          const gun = armed && ITEMS[n.wp].wp && ITEMS[n.wp].wp.gun && n.ammo > 0;
          if (gun && dp < 7 && los(n.x, n.y, p.x, p.y)) { if (n.cd <= 0) npcAttack(n, p); n.a = Math.atan2(p.y - n.y, p.x - n.x); }
          else if (dp < 1) { if (n.cd <= 0) npcAttack(n, p); }
          else npcGo(n, p.x, p.y, 3.2, dt);
        }
        if (n.hp < 30) n.st = 'fuga';
        continue;
      }
    }
    if (n.st === 'fuga') { npcMove(n, n.x - p.x, n.y - p.y, 3.6, dt); if (dp > 25) { n.st = 'casa'; n.hostile = n.kind === 'bandido' ? 1 : n.hostile; } continue; }
    // luta ou foge de zumbis
    if (zt && zd < 4.5) {
      if (armed && n.hp > 35) { if (zd < 1.05) { if (n.cd <= 0) npcAttack(n, zt); } else npcMove(n, zt.x - n.x, zt.y - n.y, 2.8, dt); }
      else npcMove(n, n.x - zt.x, n.y - zt.y, 3.2, dt);
      continue;
    }
    if (n.st === 'seguir') {
      if (dp > 60) { n.x = p.x - 1; n.y = p.y; }
      if (p.inCar) { n.x = p.x; n.y = p.y; n.inCar = 1; continue; }
      if (n.inCar) { n.inCar = 0; const ok = !blockedAt(p.x + 0.8, p.y, 0.3); n.x = p.x + (ok ? 0.8 : -0.8); n.y = p.y; }
      if (dp > 2.2) npcGo(n, p.x, p.y, dp > 5 ? 4 : 2.7, dt);
      continue;
    }
    if (n.st === 'vindo' || n.st === 'raid') {
      const tx = n.st === 'raid' ? n.tx : S.base.x, ty = n.st === 'raid' ? n.ty : S.base.y;
      if (dist(n.x, n.y, tx, ty) > 2.5) npcGo(n, tx, ty, 2.4, dt);
      else if (n.st === 'vindo') n.st = 'esperando';
      else if (n.st === 'raid') { // destrói algo da base
        if (n.cd <= 0) { n.cd = 1.5; const br = findBaseTarget(n); if (br) hitObstacle({ t: 'brutamontes', x: n.x, y: n.y }, br); }
      }
      if (n.st === 'raid' && dp < 9 && los(n.x, n.y, p.x, p.y)) n.st = 'ataque';
      continue;
    }
    if (n.st === 'esperando') { if (dp < 4 && G.onDialog && !n.asked) { n.asked = 1; G.onDialog(n, 'chegada'); } continue; }
    if (n.st === 'guardar' || n.st === 'base') {
      const hx = n.gx != null ? n.gx : S.base ? S.base.x : n.x, hy = n.gy != null ? n.gy : S.base ? S.base.y : n.y;
      n.wt = (n.wt || 0) - dt;
      if (n.wt <= 0) { n.wt = rnd(4, 9); n.tx = hx + rnd(-3, 3); n.ty = hy + rnd(-3, 3); if (isSolid(Math.floor(n.tx), Math.floor(n.ty))) { n.tx = hx; n.ty = hy; } }
      if (dist(n.x, n.y, n.tx, n.ty) > 0.5) npcGo(n, n.tx, n.ty, dist(n.x, n.y, hx, hy) > 8 ? 2.6 : 1.2, dt);
      continue;
    }
    // em casa: anda devagar pelos cômodos
    n.wt = (n.wt || 0) - dt;
    if (n.wt <= 0) { n.wt = rnd(3, 9); const f = randomFloor(n.home); if (f) { n.tx = f[0] + 0.5; n.ty = f[1] + 0.5; } }
    if (dist(n.x, n.y, n.tx, n.ty) > 0.4) npcGo(n, n.tx, n.ty, bldAt(Math.floor(n.x), Math.floor(n.y)) === n.home ? 1.1 : 2.4, dt);
  }
}
function findBaseTarget(n) {
  for (let r = 1; r <= 2; r++) for (let a = -r; a <= r; a++) for (let b = -r; b <= r; b++) {
    const br = breakable(Math.floor(n.x) + a, Math.floor(n.y) + b); if (br) return br;
  }
  return null;
}

/* ---------- animais ---------- */
function spawnAnimals(n) {
  for (let k = 0; k < n * 60 && S.ani.length < 30; k++) {
    const x = rint(5, MAP_W - 6), y = rint(5, MAP_H - 6);
    if (isSolid(x, y) || bldAt(x, y) >= 0) continue;
    let trees = 0; for (let a = -2; a <= 2; a++) for (let b = -2; b <= 2; b++) if (tileAt(x + a, y + b) === TL.TREE) trees++;
    if (trees < 5) continue;
    const t = chance(0.75) ? 'coelho' : 'veado';
    S.ani.push({ id: S.nid++, t, x: x + 0.5, y: y + 0.5, a: 0, hp: t === 'coelho' ? 8 : 60, r: t === 'coelho' ? 0.2 : 0.38, flee: 0 });
  }
}
function updateAnimals(dt) {
  const p = S.player;
  for (const a of S.ani) {
    const d2 = dist2(a.x, a.y, p.x, p.y); if (d2 > 40 * 40) continue;
    const scare = (G.input.sneak ? 3 : 6.5) - lvl('sobrevivencia') * 0.4;
    if (d2 < scare * scare && !p.sleeping) a.flee = 3;
    let gx = 0, gy = 0, spd = 0.6;
    if (a.flee > 0) { a.flee -= dt; gx = a.x - p.x; gy = a.y - p.y; spd = a.t === 'coelho' ? 4.2 : 4.6; }
    else { a.wt = (a.wt || 0) - dt; if (a.wt <= 0) { a.wt = rnd(1, 5); a.wa = chance(0.4) ? null : rnd(0, 6.28); } if (a.wa != null) { gx = Math.cos(a.wa); gy = Math.sin(a.wa); } }
    if (gx || gy) { const l = Math.hypot(gx, gy); if (!moveEnt(a, (gx / l) * spd * dt, (gy / l) * spd * dt)) a.wa = rnd(0, 6.28); a.a = Math.atan2(gy, gx); }
  }
}
function killAnimal(a) {
  S.ani.splice(S.ani.indexOf(a), 1);
  const items = [newItem('carne')]; if (a.t === 'veado') items.push(newItem('carne'), newItem('carne'), newItem('carne'));
  addBlood(a.x, a.y, 2); dropBag(a.x, a.y, items); addXP('sobrevivencia', a.t === 'veado' ? 10 : 4);
  say(a.t === 'veado' ? 'Você abateu um veado. Carne para dias!' : 'Você pegou um coelho.', 'good');
}

/* ---------- contêineres ---------- */
function containerItems(o, x, y) {
  if (o.items) return o.items;
  const d = FURN[o.t];
  const b = bldAt(x, y), bt = b >= 0 ? S.bld[b].t : null;
  const mult = bt === 'abandonada' ? 0.5 : 1;
  o.items = d.loot ? rollLoot(d.loot, mult) : [];
  // comida da geladeira estragou enquanto ninguém olhava
  const hrs = (S.time - START_MIN) / 60;
  for (const it of o.items) if (ITEMS[it.k].sp) {
    if (d.fridge) { const on = Math.min(hrs, Math.max(0, (S.powerOff - START_MIN) / 60)); it.t += on * 0.25 + (hrs - on); }
    else it.t += hrs;
  }
  // chaves de carro apontam para um veículo próximo
  for (const it of o.items) if (it.k === 'chave_carro' && !it.kid) assignKey(it, x, y);
  return o.items;
}
function assignKey(it, x, y) {
  let best = null, bd = 1e9;
  for (const v of S.vehs) { if (v.key || v.keyed || v.t === 'trator') continue; const d = dist2(v.x, v.y, x, y); if (d < bd) { bd = d; best = v; } }
  if (best) { best.keyed = 1; it.kid = best.id; }
}
function trunkItems(v) {
  if (!v.trunk) { v.trunk = rollLoot(VT[v.t].loot || 'porta_malas'); for (const it of v.trunk) if (it.k === 'chave_carro') it.kid = v.id; }
  return v.trunk;
}

/* ---------- interação contextual ---------- */
function interactions() {
  const p = S.player; const out = [];
  if (p.inCar) return { name: VT[p.inCar.t].n, opts: carOpts(p.inCar) };
  if (p.sleeping) return { name: 'Dormindo', opts: [{ l: 'Acordar', fn: () => wake() }] };
  // candidatos: vizinhança 3x3, preferindo o que está à frente
  let best = null, bs = 1e9;
  const fx = p.x + Math.cos(p.a) * 0.55, fy = p.y + Math.sin(p.a) * 0.55;
  const consider = (kind, ref, x, y, extra = 0) => {
    const s = dist(fx, fy, x, y) + extra; if (s < bs) { bs = s; best = { kind, ref, x, y }; }
  };
  for (let yy = Math.floor(p.y) - 1; yy <= Math.floor(p.y) + 1; yy++) for (let xx = Math.floor(p.x) - 1; xx <= Math.floor(p.x) + 1; xx++) {
    if (!inb(xx, yy)) continue;
    const i = ix(xx, yy), t = S.tiles[i], o = S.objs[i];
    if (dist(p.x, p.y, xx + 0.5, yy + 0.5) > 1.6) continue;
    if (o && FURN[o.t]) consider('obj', o, xx + 0.5, yy + 0.5, o.t === 'horta' || o.t === 'torre' ? 0.1 : 0);
    else if (t === TL.DOOR || t === TL.WINDOW) consider('tile', t, xx + 0.5, yy + 0.5);
    else if (t === TL.TREE && hasTag('machado')) consider('tree', t, xx + 0.5, yy + 0.5, 0.3);
    else if (t === TL.BUSH) consider('bush', t, xx + 0.5, yy + 0.5);
    else if (t === TL.FIELD) consider('field', t, xx + 0.5, yy + 0.5, 0.6);
    else if (t === TL.WATER) consider('water', t, xx + 0.5, yy + 0.5, 0.2);
  }
  for (const n of S.npcs) if (!n.dead && !n.away && dist(n.x, n.y, p.x, p.y) < 1.8) consider('npc', n, n.x, n.y, -0.5);
  for (const v of S.vehs) if (vehAt(p.x + Math.cos(p.a) * 0.7, p.y + Math.sin(p.a) * 0.7, 0.35, null) === v || vehAt(p.x, p.y, 0.6, null) === v) consider('veh', v, v.x, v.y, 0.4);
  if (!best) {
    const tower = objAt(Math.floor(p.x), Math.floor(p.y));
    if (tower && tower.t === 'torre') return { name: 'Torre de vigia', opts: [{ l: 'Você está na torre: enxerga mais longe', fn: () => {} }] };
    return null;
  }
  const tx = Math.floor(best.x), ty = Math.floor(best.y);
  if (best.kind === 'veh') return { name: VT[best.ref.t].n, opts: vehOpts(best.ref) };
  if (best.kind === 'npc') return { name: best.ref.name, opts: [{ l: 'Conversar', fn: () => G.onDialog && G.onDialog(best.ref, 'falar') }] };
  if (best.kind === 'tile') return tileOpts(tx, ty);
  if (best.kind === 'obj') return objOpts(best.ref, tx, ty);
  if (best.kind === 'tree') return { name: 'Árvore', opts: [{ l: 'Cortar árvore', fn: () => chop(tx, ty) }] };
  if (best.kind === 'bush') return { name: 'Arbusto', opts: [{ l: 'Colher frutas', fn: () => forage(tx, ty) }] };
  if (best.kind === 'field') return { name: 'Plantação de milho', opts: [{ l: 'Colher milho', fn: () => harvestField(tx, ty) }] };
  if (best.kind === 'water') {
    const o = [];
    if (hasTag('vara')) o.push({ l: 'Pescar', fn: fish });
    o.push({ l: 'Encher garrafas (água suja)', fn: () => fillBottles(true) });
    o.push({ l: 'Beber do lago', fn: () => { p.thi = clamp(p.thi + 30, 0, 100); if (chance(0.6)) { p.sick = clamp(p.sick + 40, 0, 100); say('Essa água não era boa...', 'bad'); } else say('Água gelada.'); } });
    return { name: 'Lago', opts: o };
  }
  return null;
}
function tileOpts(x, y) {
  const t = tileAt(x, y), s = tsAt(x, y) || {}, o = [];
  const tool = hasTag('alavanca') || hasTag('martelo');
  if (t === TL.DOOR) {
    if (s.bar) { if (tool) o.push({ l: `Remover barricada (${s.bar})`, fn: () => unbar(x, y) }); }
    else if (s.broken) o.push({ l: 'Porta arrombada', fn: () => {} });
    else if (s.open) o.push({ l: 'Fechar porta', fn: () => { if (blockedEntityAt(x, y)) return say('Tem algo no caminho.'); s.open = 0; makeNoise(x + 0.5, y + 0.5, 3, false); G.chunkDirty(x, y); } });
    else if (s.lock) {
      o.push({ l: 'Porta trancada', fn: () => say('Trancada. Arrombe com um pé de cabra, ou entre pela janela.') });
      if (hasTag('alavanca')) o.push({ l: 'Arrombar com pé de cabra', fn: () => startAction('Arrombando', 3.5, () => { s.lock = 0; s.open = 1; makeNoise(x + 0.5, y + 0.5, 8); G.chunkDirty(x, y); say('Porta aberta.'); }, { noise: 4 }) });
    } else o.push({ l: 'Abrir porta', fn: () => { s.open = 1; makeNoise(x + 0.5, y + 0.5, 3, false); G.chunkDirty(x, y); } });
  } else if (t === TL.WINDOW) {
    if (s.bar) { if (tool) o.push({ l: `Remover barricada (${s.bar})`, fn: () => unbar(x, y) }); else o.push({ l: 'Janela com barricada', fn: () => say('Preciso de martelo ou pé de cabra para tirar as tábuas.') }); }
    else if (s.broken) {
      if (s.glass) o.push({ l: 'Tirar cacos de vidro', fn: () => startAction('Tirando cacos', 2, () => { s.glass = 0; }) });
      o.push({ l: 'Pular a janela', fn: () => say('Ande através da janela para pular.') });
    } else if (s.open) o.push({ l: 'Fechar janela', fn: () => { s.open = 0; G.chunkDirty(x, y); } });
    else {
      o.push({ l: 'Abrir janela', fn: () => { if (s.stuck == null) s.stuck = chance(0.3) ? 1 : 0; if (s.stuck) say('Emperrada. Dá para quebrar o vidro.'); else { s.open = 1; G.chunkDirty(x, y); } } });
      o.push({ l: 'Quebrar o vidro', fn: () => breakWindow(x, y) });
    }
  }
  return { name: t === TL.DOOR ? 'Porta' : 'Janela', opts: o };
}
function blockedEntityAt(x, y) {
  const p = S.player; if (Math.floor(p.x) === x && Math.floor(p.y) === y) return true;
  return S.zs.some((z) => Math.floor(z.x) === x && Math.floor(z.y) === y);
}
function unbar(x, y) {
  const s = tsAt(x, y);
  startAction('Removendo tábuas', 3, () => { s.bar--; s.bhp = s.bar ? 80 : 0; giveItem(newItem('tabua', { q: chance(0.6) ? 2 : 1 })); if (chance(0.5)) giveItem(newItem('prego', { q: 2 })); G.chunkDirty(x, y); }, { noise: 5 });
}
function objOpts(o, x, y) {
  const d = FURN[o.t], p = S.player, out = [];
  if (d.cont) out.push({ l: o.t === 'cadaver' ? 'Revistar corpo' : o.t === 'bolsa_chao' ? 'Ver itens' : `Abrir ${d.n.toLowerCase()}`, fn: () => G.onContainer && G.onContainer({ o, x, y }) });
  if (d.bed) out.push({ l: 'Dormir', fn: () => startSleep(d.bed) });
  if (d.water) {
    if (waterOn()) { out.push({ l: 'Beber da torneira', fn: () => { p.thi = 100; say('Água fresca.'); } }); out.push({ l: 'Encher garrafas', fn: () => fillBottles(false) }); }
    else out.push({ l: 'Torneira seca', fn: () => say('A água foi cortada. Procure rios, chuva ou garrafas.') });
  }
  if (d.stove) {
    const ok = d.stove === 'eletrico' ? powered(x, y) : o.fuel > 0;
    if (d.stove === 'lenha') {
      if (countItem('tabua') || countItem('tronco')) out.push({ l: `Pôr lenha (${Math.round((o.fuel || 0) / 60)} h de fogo)`, fn: () => addFuel(o) });
    }
    if (ok) { out.push({ l: 'Cozinhar alimentos crus', fn: () => cook() }); out.push({ l: 'Ferver a água das garrafas', fn: () => boil() }); }
    else if (d.stove === 'eletrico') out.push({ l: 'Fogão sem energia', fn: () => say('Sem eletricidade. Construa um fogão improvisado.') });
  }
  if (d.pump) {
    out.push({ l: `Encher galão${powered(x, y) ? '' : ' (sem energia)'}`, fn: () => pumpFuel(o, x, y) });
  }
  if (d.berry || o.t === 'arbusto') out.push({ l: 'Colher frutas', fn: () => forage(x, y) });
  if (d.gen) {
    out.push({ l: o.on ? 'Desligar gerador' : 'Ligar gerador', fn: () => { if (!o.on && !(o.fuel > 0)) return say('Gerador sem combustível.'); o.on = o.on ? 0 : 1; say(o.on ? 'O gerador ronca alto.' : 'Gerador desligado.'); } });
    out.push({ l: `Abastecer (${Math.round(o.fuel || 0)} L)`, fn: () => { const g = p.inv.find((i) => i.k === 'galao' && i.f > 0); if (!g) return say('Sem galão com gasolina.'); const n = Math.min(g.f, 20 - (o.fuel || 0)); g.f -= n; o.fuel = (o.fuel || 0) + n; say(`+${Math.round(n)} L no gerador.`); } });
  }
  if (d.garden) gardenOpts(o, out);
  if (d.rain) {
    out.push({ l: `Beber (${Math.round(o.water || 0)} L)`, fn: () => { if ((o.water || 0) < 1) return say('Está vazio.'); o.water--; p.thi = clamp(p.thi + 30, 0, 100); } });
    out.push({ l: 'Encher garrafas', fn: () => { let n = 0; for (const it of p.inv) if (it.k === 'garrafa' || it.k === 'regador') while ((it.w || 0) < ITEMS[it.k].water && o.water >= 1) { it.w = (it.w || 0) + 1; it.dirty = 0; o.water--; n++; } say(n ? 'Garrafas cheias.' : 'Sem água ou sem garrafas.'); } });
  }
  if (d.bench) out.push({ l: 'Usar bancada', fn: () => G.onCraft && G.onCraft(true) });
  if (d.gate) out.push({ l: o.open ? 'Fechar portão' : 'Abrir portão', fn: () => { if (o.open && blockedEntityAt(x, y)) return say('Tem algo no caminho.'); o.open = o.open ? 0 : 1; makeNoise(x + 0.5, y + 0.5, 3, false); G.chunkDirty(x, y); } });
  if (d.tower) out.push({ l: 'Subir na torre', fn: () => { p.x = x + 0.5; p.y = y + 0.5; say('Lá de cima dá para ver longe.'); } });
  // desmontar
  if (!['cadaver', 'bolsa_chao', 'bomba', 'arbusto'].includes(o.t) && (d.wood || d.scrap || d.cloth)) {
    const tool = (d.wood && (hasTag('martelo') || hasTag('serra'))) || (d.scrap && hasTag('chave'));
    if (tool) out.push({ l: 'Desmontar', fn: () => dismantle(o, x, y) });
  }
  return { name: o.t === 'cadaver' ? (o.n > 1 ? `${o.n} corpos` : 'Corpo') : d.n, opts: out };
}
function dismantle(o, x, y) {
  const d = FURN[o.t];
  startAction('Desmontando', 4 - lvl('carpintaria') * 0.4, () => {
    if (o.items && o.items.length) dropBag(x, y, o.items.splice(0));
    delete S.objs[ix(x, y)];
    const got = [];
    if (d.wood && (hasTag('martelo') || hasTag('serra'))) { const q = Math.max(1, d.wood - (chance(0.4 - lvl('carpintaria') * 0.08) ? 1 : 0)); giveItem(newItem('tabua', { q })); got.push(`${q} tábua(s)`); }
    if (d.nail && hasTag('martelo')) { const q = Math.max(1, Math.round(d.nail * rnd(0.5, 1))); giveItem(newItem('prego', { q })); got.push(`${q} prego(s)`); }
    if (d.scrap && hasTag('chave')) { giveItem(newItem('sucata', { q: d.scrap })); got.push(`${d.scrap} sucata`); }
    if (d.cloth) { giveItem(newItem('trapo', { q: d.cloth })); got.push(`${d.cloth} trapos`); }
    if (o.t === 'gerador') giveItem(newItem('gerador'));
    addXP('carpintaria', 3); G.chunkDirty(x, y);
    say('Desmontado: ' + (got.join(', ') || 'nada útil') + '.');
  }, { noise: 7 });
}
function vehOpts(v) {
  const out = [{ l: 'Entrar', fn: () => enterVehicle(v) }, { l: 'Porta-malas', fn: () => G.onContainer && G.onContainer({ v }) }, { l: 'Mecânica e peças', fn: () => G.onVehicle && G.onVehicle(v) }];
  return out;
}
function carOpts(v) {
  const out = [];
  out.push({ l: v.on ? 'Desligar motor' : 'Ligar motor', fn: startEngine });
  if (!hasKey(v)) out.push({ l: 'Ligação direta', fn: hotwire });
  out.push({ l: v.lights ? 'Apagar faróis' : 'Acender faróis', fn: () => { v.lights = v.lights ? 0 : 1; } });
  if (VT[v.t].siren) out.push({ l: 'Ligar sirene (atrai zumbis!)', fn: () => { makeNoise(v.x, v.y, 45); say('UIIIUUUIII!'); } });
  out.push({ l: 'Buzinar', fn: () => { makeNoise(v.x, v.y, 22); say('BIIIP!'); } });
  out.push({ l: 'Sair', fn: exitVehicle });
  return out;
}

/* ---------- coleta, pesca, cozinha ---------- */
function chop(x, y) {
  startAction('Cortando árvore', Math.max(3, 8 - lvl('sobrevivencia') * 0.6 - lvl('carpintaria') * 0.4), () => {
    S.tiles[ix(x, y)] = TL.GRASS; G.chunkDirty(x, y);
    const q = rint(1, 2); giveItem(newItem('tronco', { q })); addXP('sobrevivencia', 3); addXP('carpintaria', 1);
    const ax = hasTag('machado'); if (ax && ax.d != null) { ax.d -= 2; if (ax.d <= 0) { say('O machado quebrou!', 'bad'); removeItem(ax); } }
    say(`+${q} tronco(s). Use um serrote para virar tábuas.`);
  }, { noise: 9 });
}
function forage(x, y) {
  const i = ix(x, y); const s = S.ts[i] || (S.ts[i] = {});
  if (s.f && S.time - s.f < 2 * 1440) return say('Já colhi tudo aqui. Volte em uns dias.');
  startAction('Colhendo', 2.5, () => { s.f = S.time; const q = rint(1, 3) + Math.floor(lvl('sobrevivencia') / 2); for (let k = 0; k < q; k++) giveItem(newItem('amora')); addXP('sobrevivencia', 2); say(`+${q} frutas silvestres.`); });
}
function harvestField(x, y) {
  const i = ix(x, y); const s = S.ts[i] || (S.ts[i] = {});
  if (s.f && S.time - s.f < 5 * 1440) return say('Esse pé já foi colhido.');
  startAction('Colhendo milho', 2, () => { s.f = S.time; const q = rint(0, 2); for (let k = 0; k < q; k++) giveItem(newItem('milho')); addXP('agricultura', 1); say(q ? `+${q} espiga(s) de milho.` : 'Nada aproveitável neste pé.'); G.chunkDirty(x, y); });
}
function fish() {
  startAction('Pescando', rnd(6, 12), () => {
    if (chance(0.3 + lvl('sobrevivencia') * 0.1)) { giveItem(newItem('peixe')); addXP('sobrevivencia', 5); say('Pegou um peixe!', 'good'); }
    else { addXP('sobrevivencia', 1); say('Nada mordeu a isca.'); }
  }, { move: 0 });
}
function fillBottles(dirty) {
  let n = 0;
  for (const it of S.player.inv) if ((it.k === 'garrafa' || it.k === 'regador') && (it.w || 0) < ITEMS[it.k].water) { it.w = ITEMS[it.k].water; if (dirty) it.dirty = 1; else it.dirty = 0; n++; }
  say(n ? (dirty ? 'Garrafas cheias de água do lago (ferva antes de beber).' : 'Garrafas cheias.') : 'Você não tem garrafas vazias.');
}
function addFuel(o) {
  if (countItem('tabua')) { takeItem('tabua'); o.fuel = (o.fuel || 0) + 60; }
  else if (countItem('tronco')) { takeItem('tronco'); o.fuel = (o.fuel || 0) + 180; }
  if (!o.lit) {
    const l = hasTag('isqueiro'); if (!l) return say('Lenha colocada, mas preciso de fogo para acender.');
    l.u--; if (l.u <= 0) removeItem(l);
  }
  o.lit = 1; say('O fogo está aceso.');
}
function cook() {
  const raw = S.player.inv.filter((i) => ITEMS[i.k].cook);
  if (!raw.length) return say('Nada cru para cozinhar.');
  startAction('Cozinhando', 3 + raw.length, () => {
    for (const it of raw) { const k = ITEMS[it.k].cook; removeItem(it); giveItem(newItem(k)); }
    addXP('sobrevivencia', raw.length); say('Comida pronta!', 'good');
  });
}
function boil() {
  const b = S.player.inv.filter((i) => i.dirty);
  if (!b.length) return say('Nenhuma garrafa com água suja.');
  startAction('Fervendo água', 4, () => { for (const it of b) it.dirty = 0; say('Água fervida e segura.', 'good'); });
}
function pumpFuel(o, x, y) {
  if (!powered(x, y)) return say('A bomba precisa de eletricidade. Um gerador por perto resolve.');
  if (o.fuel <= 0) return say('Esta bomba secou.');
  const p = S.player;
  const v = S.vehs.find((v) => dist(v.x, v.y, x + 0.5, y + 0.5) < 3.5);
  const g = p.inv.find((i) => i.k === 'galao' && i.f < ITEMS.galao.fuel);
  if (!v && !g) return say('Traga um galão ou estacione um veículo perto da bomba.');
  startAction('Abastecendo', 3, () => {
    if (v && v.fuel < VT[v.t].fuel - 1) { const n = Math.min(o.fuel, VT[v.t].fuel - v.fuel); v.fuel += n; o.fuel -= n; say(`${VT[v.t].n}: +${Math.round(n)} L.`, 'good'); }
    else if (g) { const n = Math.min(o.fuel, ITEMS.galao.fuel - g.f); g.f += n; o.fuel -= n; say(`Galão: +${Math.round(n)} L.`, 'good'); }
    else say('Tanque cheio.');
  });
}

/* ---------- horta ---------- */
function gardenOpts(o, out) {
  const p = S.player;
  if (!o.p) {
    for (const [k, pl] of Object.entries(PLANTS)) {
      const seedK = Object.keys(ITEMS).find((s) => ITEMS[s].seed === k);
      if (countItem(seedK)) out.push({ l: `Plantar ${pl.n.toLowerCase()}`, fn: () => { takeItem(seedK, 1); o.p = k; o.g = 0; o.wat = S.time; o.pt = S.time; addXP('agricultura', 2); say(`${pl.n} plantado. Regue todo dia (ou deixe a chuva regar).`); G.chunkDirty(...gxy(o)); } });
    }
    if (!out.length) out.push({ l: 'Canteiro vazio', fn: () => say('Encontre sementes para plantar.') });
    return;
  }
  const pl = PLANTS[o.p];
  const ready = o.g >= pl.h * (1 - lvl('agricultura') * 0.06);
  if (o.rot) out.push({ l: 'Limpar planta morta', fn: () => { o.p = null; o.rot = 0; G.chunkDirty(...gxy(o)); } });
  else if (ready) out.push({ l: `Colher ${pl.n.toLowerCase()}`, fn: () => { const q = rint(pl.q[0], pl.q[1]) + lvl('agricultura'); for (let k = 0; k < q; k++) giveItem(newItem(pl.out)); if (chance(0.5 + lvl('agricultura') * 0.1)) giveItem(newItem(Object.keys(ITEMS).find((s) => ITEMS[s].seed === o.p), { q: rint(1, 3) })); o.p = null; addXP('agricultura', 8); say(`Colheita: ${q} ${pl.n.toLowerCase()}(s)!`, 'good'); G.chunkDirty(...gxy(o)); } });
  else out.push({ l: `${pl.n}: ${Math.floor(o.g / pl.h * 100)}% · ${S.time - o.wat < 1800 ? 'regado' : 'precisa de água'}`, fn: () => {} });
  const can = p.inv.find((i) => (i.k === 'regador' || i.k === 'garrafa') && i.w > 0);
  if (!o.rot) out.push({ l: 'Regar', fn: () => { if (!can) return say('Sem água no regador ou garrafa.'); can.w--; o.wat = S.time; addXP('agricultura', 1); say('Regado.'); } });
}
function gxy(o) { for (const [k, v] of Object.entries(S.objs)) if (v === o) return [(+k) % MAP_W, Math.floor(+k / MAP_W)]; return [0, 0]; }

/* ---------- construção ---------- */
function buildTarget() {
  const p = S.player;
  return [Math.floor(p.x + Math.cos(p.a) * 1.0), Math.floor(p.y + Math.sin(p.a) * 1.0)];
}
function canBuild(r, x, y) {
  const p = S.player;
  for (const t of r.tools) if (!hasTag(t)) return `Falta ferramenta: ${toolName(t)}.`;
  if (lvl(r.sk[0]) < r.sk[1]) return `Precisa de ${SKILLS[r.sk[0]].n} ${r.sk[1]}.`;
  for (const [k, q] of Object.entries(r.need)) if (countItem(k) < q) return `Falta: ${q}× ${ITEMS[k].n}.`;
  if (r.bench && !nearObj(p.x, p.y, 'bancada', 4)) return 'Precisa estar perto de uma bancada.';
  if (x == null) return null;
  const t = tileAt(x, y), i = ix(x, y);
  if (r.on === 'abertura') {
    if (t !== TL.DOOR && t !== TL.WINDOW) return 'Mire numa porta ou janela.';
    const s = S.ts[i]; if (s.bar >= 3) return 'Já tem 3 camadas.';
    if (t === TL.DOOR && s.open && !s.broken) return 'Feche a porta antes.';
    if (blockedEntityAt(x, y)) return 'Tem algo no caminho.';
    return null;
  }
  if (S.objs[i] || isSolid(x, y) || t === TL.DOOR || t === TL.WINDOW || t === TL.ROAD && r.k === 'horta') return 'Lugar ocupado.';
  if (blockedEntityAt(x, y) || vehAt(x + 0.5, y + 0.5, 0.4, null)) return 'Tem algo no caminho.';
  if (r.outdoor && bldAt(x, y) >= 0) return 'Isso precisa ser ao ar livre.';
  return null;
}
function nearObj(x, y, t, r) {
  for (let yy = Math.floor(y - r); yy <= y + r; yy++) for (let xx = Math.floor(x - r); xx <= x + r; xx++) { const o = objAt(xx, yy); if (o && o.t === t) return o; }
  return null;
}
function toolName(t) { return { martelo: 'martelo', serra: 'serrote', pa: 'pá', chave: 'chave inglesa', corte: 'faca ou facão', fenda: 'chave de fenda', alavanca: 'pé de cabra', isqueiro: 'isqueiro', machado: 'machado' }[t] || t; }
function build(r) {
  const [x, y] = buildTarget();
  const err = canBuild(r, x, y); if (err) return say(err);
  startAction(`Construindo: ${r.n}`, r.t * (1 - lvl('carpintaria') * 0.07), () => {
    const err2 = canBuild(r, x, y); if (err2) return say(err2);
    for (const [k, q] of Object.entries(r.need)) takeItem(k, q);
    const i = ix(x, y);
    if (r.on === 'abertura') { const s = S.ts[i]; s.bar = (s.bar || 0) + 1; s.bhp = 80 + lvl('carpintaria') * 15; s.open = 0; }
    else {
      const o = { t: r.k, hp: (FURN[r.k].hp || 100) * (1 + lvl('carpintaria') * 0.1) };
      if (r.k === 'bau') o.items = [];
      if (r.k === 'horta') { o.p = null; S.tiles[i] = TL.DIRT; }
      if (r.k === 'gerador') o.fuel = 0;
      S.objs[i] = o;
      if (!S.base || dist(S.base.x, S.base.y, x, y) > 25) { S.base = { x: x + 0.5, y: y + 0.5 }; say('📍 Sua base agora fica aqui.', 'good'); }
    }
    addXP(r.sk[0], 4 + r.t * 0.6); S.stats.made++;
    G.chunkDirty(x, y); say(`${r.n}: pronto!`, 'good');
  }, { noise: r.noise });
}
function craft(c) {
  for (const t of c.tools) if (!hasTag(t)) return say(`Falta ferramenta: ${toolName(t)}.`);
  if (c.needLvl && lvl(c.needLvl[0]) < c.needLvl[1]) return say(`Precisa de ${SKILLS[c.needLvl[0]].n} ${c.needLvl[1]}.`);
  for (const [k, q] of Object.entries(c.need)) if (countItem(k) < q) return say(`Falta: ${q}× ${ITEMS[k].n}.`);
  if (c.bench && !nearObj(S.player.x, S.player.y, 'bancada', 4)) return say('Precisa estar perto de uma bancada.');
  let galao = null;
  if (c.fuel) { galao = S.player.inv.find((i) => i.k === 'galao' && i.f >= c.fuel); if (!galao) return say(`Precisa de ${c.fuel} L de gasolina num galão.`); }
  for (const [k, q] of Object.entries(c.need)) takeItem(k, q);
  if (galao) galao.f -= c.fuel;
  const [k, q] = c.out;
  if (ITEMS[k].st) giveItem(newItem(k, { q })); else for (let n = 0; n < q; n++) giveItem(newItem(k, c.empty ? { w: 0 } : { d: ITEMS[k].wp ? ITEMS[k].wp.dur : undefined }));
  if (c.sk) addXP(c.sk, c.xp || 2);
  say(`Feito: ${ITEMS[k].n}.`, 'good');
}

/* ---------- leitura ---------- */
function read(it) {
  const d = ITEMS[it.k];
  if (d.book) {
    if (it.read) return say('Já li este livro.');
    startAction(`Lendo: ${d.n}`, 10, () => {
      const s = S.player.sk[d.book]; const gain = s.l >= 5 ? 0 : (SKILL_XP[s.l + 1] - SKILL_XP[s.l]) * 0.7;
      it.read = 1; addXP(d.book, gain / S.player.learn); S.player.str = clamp(S.player.str - 10, 0, 100);
      say(`Você aprendeu bastante sobre ${SKILLS[d.book].n.toLowerCase()}.`, 'good');
    });
  } else startAction(`Lendo: ${d.n}`, 5, () => { S.player.str = clamp(S.player.str - d.read, 0, 100); removeItem(it); say('Distraiu um pouco a cabeça.'); });
}

/* ---------- visão (sombra projetada) ---------- */
const OCT = [[1, 0, 0, 1], [0, 1, 1, 0], [0, -1, 1, 0], [-1, 0, 0, 1], [-1, 0, 0, -1], [0, -1, -1, 0], [0, 1, -1, 0], [1, 0, 0, -1]];
function markVis(x, y) { if (!inb(x, y)) return; const i = ix(x, y); if (!G.vis[i]) { G.vis[i] = 1; G.visList.push(i); S.seen[i] = 1; } }
function castLight(cx, cy, row, start, end, r, xx, xy, yx, yy) {
  if (start < end) return;
  let newStart = 0;
  for (let j = row; j <= r; j++) {
    let dx = -j - 1; const dy = -j; let blocked = false;
    while (dx <= 0) {
      dx++;
      const X = cx + dx * xx + dy * xy, Y = cy + dx * yx + dy * yy;
      const lS = (dx - 0.5) / (dy + 0.5), rS = (dx + 0.5) / (dy - 0.5);
      if (start < rS) continue; else if (end > lS) break;
      if (dx * dx + dy * dy <= r * r) markVis(X, Y);
      if (blocked) {
        if (isOpaque(X, Y)) { newStart = rS; continue; } else { blocked = false; start = newStart; }
      } else if (isOpaque(X, Y) && j < r) { blocked = true; castLight(cx, cy, j + 1, start, lS, r, xx, xy, yx, yy); newStart = rS; }
    }
    if (blocked) break;
  }
}
function computeVis() {
  for (const i of G.visList) G.vis[i] = 0; G.visList.length = 0;
  const p = S.player, px = Math.floor(p.x), py = Math.floor(p.y);
  const dl = daylight();
  let sr = lerp(5.5, 24, dl);
  if (S.fog > 0.3) sr = Math.min(sr, lerp(sr, 7, S.fog));
  if (S.rain > 0.5) sr *= 0.85;
  if (p.light) sr = Math.max(sr, 11);
  if (p.inCar && p.inCar.lights) sr = Math.max(sr, 13);
  if (p.onTower) sr += 12;
  G.sightR = sr;
  const R2 = Math.ceil(Math.min(34, Math.max(sr, 26) + (p.onTower ? 8 : 0)));
  markVis(px, py);
  for (const [a, b, c, d] of OCT) castLight(px, py, 1, 1, 0, R2, a, b, c, d);
  // na torre, enxerga por cima dos muros
  if (p.onTower) for (let y = py - 10; y <= py + 10; y++) for (let x = px - 10; x <= px + 10; x++) if (dist2(x, y, px, py) < 100) markVis(x, y);
}
// a entidade nesse ponto é visível ao jogador (visão + luz)?
function seesAt(x, y) {
  const i = ix(Math.floor(x), Math.floor(y)); if (!G.vis[i]) return false;
  const p = S.player; if (dist2(x, y, p.x, p.y) <= G.sightR * G.sightR) return true;
  return litAt(Math.floor(x), Math.floor(y));
}
function litAt(x, y) {
  const b = bldAt(x, y);
  if (b >= 0 && daylight() < 0.5 && S.bld[b].lit && powered(x, y)) return true;
  for (let a = -3; a <= 3; a++) for (let c = -3; c <= 3; c++) if (S.fires[ix(x + a, y + c)]) return true;
  return false;
}

/* ---------- eventos do mundo ---------- */
function hourly() {
  const p = S.player;
  updateWeather();
  // envelhecimento da comida
  const age = (list, f) => { for (const it of list) if (ITEMS[it.k].sp) it.t += f; };
  age(p.inv, 1);
  for (const [k, o] of Object.entries(S.objs)) {
    if (!o.items) continue;
    const i = +k, d = FURN[o.t];
    age(o.items, d && d.fridge && powered(i % MAP_W, Math.floor(i / MAP_W)) ? 0.25 : 1);
    if ((o.t === 'cadaver' || o.t === 'bolsa_chao') && o.exp && S.time > o.exp) { delete S.objs[k]; G.chunkDirty(i % MAP_W, Math.floor(i / MAP_W)); }
    if (o.t === 'bolsa_chao' && !o.items.length) { delete S.objs[k]; G.chunkDirty(i % MAP_W, Math.floor(i / MAP_W)); }
  }
  for (const v of S.vehs) if (v.trunk) age(v.trunk, 1);
  for (const n of S.npcs) age(n.inv, 1);
  // horta, coletor, gerador, fogão
  for (const [k, o] of Object.entries(S.objs)) {
    if (o.t === 'horta' && o.p) {
      if (S.rain > 0.3) o.wat = S.time;
      if (S.time - o.wat < 1800) o.g += 1 + lvl('agricultura') * 0.05;
      const pl = PLANTS[o.p];
      if (o.g > pl.h + 96) { o.rot = 1; }
      if (S.time - o.wat > 4 * 1440) o.rot = 1;
      const i = +k; G.chunkDirty(i % MAP_W, Math.floor(i / MAP_W));
    }
    if (o.t === 'coletor' && S.rain > 0.2) o.water = Math.min(40, (o.water || 0) + 4 * S.rain);
    if (o.t === 'gerador' && o.on) { o.fuel = Math.max(0, (o.fuel || 0) - 1); const i = +k; makeNoise(i % MAP_W, Math.floor(i / MAP_W), 13); if (o.fuel <= 0) { o.on = 0; say('O gerador ficou sem combustível.', 'bad'); } }
    if (o.t === 'fogueira' && o.lit) { o.fuel = Math.max(0, (o.fuel || 0) - 60); if (o.fuel <= 0) o.lit = 0; }
  }
  // avisos de energia e água
  if (!S.flags.pw1 && S.time > S.powerOff - 20 * 60) { S.flags.pw1 = 1; broadcast('Companhia elétrica: equipes abandonaram as usinas. Cortes de energia esperados nas próximas horas.'); }
  if (!S.flags.pw2 && S.time > S.powerOff) { S.flags.pw2 = 1; say('💡 A energia acabou. As geladeiras vão esquentar.', 'bad'); G.chunkDirtyAll(); }
  if (!S.flags.wt1 && S.time > S.waterOff - 20 * 60) { S.flags.wt1 = 1; broadcast('Abastecimento de água comprometido. Encham garrafas e baldes.'); }
  if (!S.flags.wt2 && S.time > S.waterOff) { S.flags.wt2 = 1; say('🚱 A água das torneiras parou.', 'bad'); }
  // hordas
  if (S.time > S.nextHorde) spawnHorde();
  for (const h of S.hordes) {
    const mem = S.zs.filter((z) => z.hid === h.id);
    if (!mem.length) { h.dead = 1; continue; }
    const cx = mem.reduce((s, z) => s + z.x, 0) / mem.length, cy = mem.reduce((s, z) => s + z.y, 0) / mem.length;
    h.cx = cx; h.cy = cy; h.n = mem.length;
    if (dist(cx, cy, h.tx, h.ty) < 6) {
      h.wait = (h.wait || 0) + 1;
      if (h.wait > rint(4, 10)) { h.wait = 0; const t = hordeTarget(); h.tx = t[0]; h.ty = t[1]; if (chance(0.5)) broadcast(`A horda perto de ${placeName(cx, cy)} está se movendo para o ${dirName(h.tx - cx, h.ty - cy)}.`); }
    }
  }
  S.hordes = S.hordes.filter((h) => !h.dead);
  // ataque de saqueadores à base
  const h = hourOf();
  if (S.base && dayOf() >= 4 && (h >= 22 || h < 3) && S.time > S.nextRaid) {
    S.nextRaid = S.time + rint(2, 4) * 1440;
    if (chance(0.45 + dayOf() * 0.02)) raid();
  }
  // eventos agendados
  for (const e of S.events.slice()) if (S.time >= e.at) { S.events.splice(S.events.indexOf(e), 1); runEvent(e); }
  // chegada da família
  for (const n of S.npcs) if (n.arriveAt && S.time > n.arriveAt && !n.dead) familyArrives(n);
  // pedido de socorro com prazo
  for (const n of S.npcs) if (n.help && !n.dead) {
    const near = S.zs.filter((z) => dist2(z.x, z.y, n.x, n.y) < 64).length;
    if (near <= 1 && dist(p.x, p.y, n.x, n.y) < 15) { n.help = 0; n.trust += 40; say(`${n.name}: "Você salvou a gente! Obrigado!"`, 'good'); const gift = rollLoot('cozinha', 1.5).concat(rollLoot('banheiro')); for (const it of gift) giveItem(it); }
    else if (S.time > n.help) { n.help = 0; if (near >= 2) { n.away = 0; killNpc(n, 'zumbi'); } }
  }
  if (hourOf() < 1) daily();
  saveGame();
}
function daily() {
  const day = dayOf();
  if (S.flags.lastDay === day) return; S.flags.lastDay = day;
  say(`☀️ Dia ${day}. Você sobreviveu mais uma noite.`, 'good');
  // novos zumbis chegam pelas estradas
  const n = Math.min(10 + day * 2, 40);
  if (S.zs.length < 750) for (let k = 0; k < n; k++) { const e = edgePoint(); const z = addZombie(e[0], e[1]); z.st = 'hunt'; z.tx = rint(35, 110); z.ty = rint(35, 110); z.huntT = 1e9; }
  spawnAnimals(3);
  // sobreviventes: comida, destino, comércio
  for (const npc of S.npcs) {
    if (npc.dead || npc.away) continue;
    if (npc.kind === 'comerciante' && day % 3 === 0) npc.inv.push(...rollLoot('mercado'), ...rollLoot(pick(['hospital', 'ferramentas', 'armas', 'pecas'])));
    if (npc.st === 'seguir' || npc.st === 'base' || npc.st === 'guardar') {
      // moradores comem da base
      const ate = npc.st === 'seguir' ? eatFrom(npc.inv) : baseFood();
      if (!ate) { npc.trust -= 25; say(`${npc.name} está com fome.`, 'bad'); if (npc.trust < -10) { npc.st = 'casa'; npc.away = 1; say(`${npc.name} foi embora do grupo por falta de comida.`, 'bad'); } }
      else if (npc.st === 'base' && chance(0.5)) { const chest = baseChest(); if (chest) { chest.items.push(...rollLoot(pick(['cozinha', 'mercado', 'lixo']))); say(`${npc.name} trouxe suprimentos para a base.`, 'good'); } }
      continue;
    }
    // destino de quem vive sozinho no mundo
    const zs = S.zs.filter((z) => dist2(z.x, z.y, npc.x, npc.y) < 100).length;
    if (dist(npc.x, npc.y, S.player.x, S.player.y) > 40 && chance(0.03 + zs * 0.015)) killNpc(npc, 'zumbi');
  }
  // pedido de socorro
  if (day >= 2 && chance(0.45)) helpRequest();
  // incêndio
  if (day >= 3 && chance(0.18)) {
    const b = pick(S.bld); const x = b.x + 2, y = b.y + 2;
    if (dist(x, y, S.player.x, S.player.y) > 20 && !(S.base && dist(x, y, S.base.x, S.base.y) < 20)) { igniteTile(x, y, true); igniteTile(x + 1, y, true); broadcast(`Fumaça vista perto de ${placeName(x, y)}, ao ${dirName(x - S.player.x, y - S.player.y)}.`); }
  }
  if (day === 2) broadcast('Autoridades pedem que a população fique em casa. Evitem barulho: eles seguem o som.');
}
function eatFrom(list) { const f = list.find((i) => ITEMS[i.k].food && fresh(i) < 2); if (f) { list.splice(list.indexOf(f), 1); return true; } return false; }
function baseChests() {
  if (!S.base) return [];
  const out = [];
  for (const [k, o] of Object.entries(S.objs)) { if (!o.items || !FURN[o.t] || !FURN[o.t].cont || o.t === 'cadaver' || o.t === 'bolsa_chao') continue; const i = +k; if (dist2(i % MAP_W, Math.floor(i / MAP_W), S.base.x, S.base.y) < 15 * 15) out.push(o); }
  return out;
}
function baseChest() { return baseChests().find((o) => o.t === 'bau') || baseChests()[0]; }
function baseFood() { for (const c of baseChests()) if (eatFrom(c.items)) return true; return false; }
function edgePoint() {
  return pick([[5, 70.5 + rnd(-1, 1)], [MAP_W - 5, 70.5 + rnd(-1, 1)], [70.5 + rnd(-1, 1), 5], [70.5 + rnd(-1, 1), MAP_H - 5]]);
}
function hordeTarget() {
  if (S.base && chance(0.3)) return [S.base.x + rnd(-6, 6), S.base.y + rnd(-6, 6)];
  if (chance(0.3)) return [S.player.x + rnd(-15, 15), S.player.y + rnd(-15, 15)];
  return [rint(34, 108), rint(34, 108)];
}
function spawnHorde() {
  S.nextHorde = S.time + Math.max(18, 48 - dayOf() * 2) * 60 * rnd(0.8, 1.2);
  if (S.zs.length > 800) return;
  const e = edgePoint(), t = hordeTarget();
  const h = { id: S.nid++, tx: t[0], ty: t[1] };
  const n = Math.min(14 + dayOf() * 3, 50);
  for (let k = 0; k < n; k++) {
    const z = addZombie(clamp(e[0] + rnd(-3, 3), 4, MAP_W - 5), clamp(e[1] + rnd(-3, 3), 4, MAP_H - 5));
    if (blockedAt(z.x, z.y, 0.3)) { z.x = e[0]; z.y = e[1]; }
    z.hid = h.id; z.ox = rnd(-4, 4); z.oy = rnd(-4, 4);
  }
  S.hordes.push(h);
  broadcast(`Uma horda de uns ${n} infectados foi vista entrando pelo ${dirName(e[0] - 75, e[1] - 75)} da cidade.`);
}
function helpRequest() {
  const cand = S.npcs.filter((n) => !n.dead && !n.away && !n.help && ['familia', 'solitario', 'comerciante'].includes(n.kind) && n.st === 'casa');
  if (!cand.length) return;
  const n = pick(cand), b = S.bld[n.home];
  const k = rint(5, 9);
  for (let i = 0; i < k; i++) {
    const a = rnd(0, 6.28), r = Math.max(b.w, b.h) / 2 + rnd(1, 3);
    const x = b.x + b.w / 2 + Math.cos(a) * r, y = b.y + b.h / 2 + Math.sin(a) * r;
    if (blockedAt(x, y, 0.3)) continue;
    const z = addZombie(x, y); z.st = 'hunt'; z.tx = n.x; z.ty = n.y; z.huntT = 1e9;
  }
  n.help = S.time + 14 * 60;
  const p = S.player, d = dist(p.x, p.y, n.x, n.y);
  if (d < 45) say(`🗣️ Você ouve gritos de socorro vindo do ${dirName(n.x - p.x, n.y - p.y)}!`, 'bad');
  else broadcast(`Pedido de socorro: alguém está cercado perto de ${placeName(n.x, n.y)}, ao ${dirName(n.x - p.x, n.y - p.y)}.`);
  n.known = 1;
}
function raid() {
  const p = S.player;
  if (dist(p.x, p.y, S.base.x, S.base.y) < 30) {
    const n = rint(2, 3);
    for (let k = 0; k < n; k++) {
      for (let t = 0; t < 30; t++) {
        const a = rnd(0, 6.28), x = S.base.x + Math.cos(a) * 20, y = S.base.y + Math.sin(a) * 20;
        if (!inb(Math.floor(x), Math.floor(y)) || blockedAt(x, y, 0.3) || G.vis[ix(Math.floor(x), Math.floor(y))]) continue;
        const b = addNpc('bandido', S.startHome, pick(['Lobo', 'Navalha', 'Corvo', 'Pitbull', 'Sombra', 'Ferrugem']));
        b.x = x; b.y = y; b.st = 'raid'; b.raid = 1; b.tx = S.base.x; b.ty = S.base.y; b.demandT = S.time; b.home = S.startHome;
        break;
      }
    }
    say('⚠️ Você ouve vozes e passos lá fora... Saqueadores!', 'bad');
  } else {
    const stolen = [];
    for (const c of baseChests()) { for (const it of c.items.slice()) if (chance(0.35)) { c.items.splice(c.items.indexOf(it), 1); stolen.push(ITEMS[it.k].n); } }
    for (const [k, o] of Object.entries(S.objs)) { const i = +k; if (FURN[o.t] && FURN[o.t].build && FURN[o.t].solid && dist2(i % MAP_W, Math.floor(i / MAP_W), S.base.x, S.base.y) < 200 && chance(0.2)) o.hp = (o.hp || 100) * 0.5; }
    if (stolen.length) S.notes.push(`Saqueadores passaram pela base enquanto você estava fora e levaram: ${[...new Set(stolen)].slice(0, 8).join(', ')}.`);
  }
}
function familyArrives(n) {
  const p = S.player;
  const target = S.base || { x: p.x, y: p.y };
  if (dist(p.x, p.y, target.x, target.y) > 30) return; // esperam o jogador estar por perto
  n.arriveAt = 0;
  for (let t = 0; t < 40; t++) {
    const a = rnd(0, 6.28), x = target.x + Math.cos(a) * 14, y = target.y + Math.sin(a) * 14;
    if (!inb(Math.floor(x), Math.floor(y)) || blockedAt(x, y, 0.3)) continue;
    n.x = x; n.y = y; break;
  }
  if (!S.base) S.base = { x: p.x, y: p.y };
  n.st = 'vindo'; n.asked = 0;
  say(`👨‍👩‍👧 Alguém está vindo na sua direção... É ${n.name} com a família!`);
}
function runEvent(e) {
  if (e.k === 'virou_bandido') {
    const n = S.npcs.find((o) => o.id === e.id);
    if (!n || n.dead) return;
    const homes = S.bld.map((b, i) => i).filter((i) => S.bld[i].t === 'casa' || S.bld[i].t === 'abandonada');
    n.kind = 'bandido'; n.hostile = 1; n.away = 0; n.st = 'casa'; n.trust = -40; n.home = pick(homes); n.wp = n.wp || 'faca'; n.demandT = 0;
    const f = randomFloor(n.home); if (f) { n.x = f[0] + 0.5; n.y = f[1] + 0.5; }
    broadcast('Cuidado: há relatos de um grupo saqueando casas na cidade.');
    return;
  }
  if (e.k === 'reanimar') {
    const z = addZombie(e.x, e.y, 'recente'); z.st = 'idle';
    if (dist(e.x, e.y, S.player.x, S.player.y) < 15) say(`${e.name} se levantou... mas não é mais ${e.name}.`, 'bad');
  }
}

/* ---------- passo principal ---------- */
function step(dt) {
  if (S.dead) return;
  S.time += dt; // 1 s real = 1 min de jogo
  const p = S.player;
  // clima suave
  const rk = S.weather.k, rainT = rk === 'chuva' ? 0.6 : rk === 'tempestade' ? 1 : 0, fogT = rk === 'neblina' ? 1 : 0;
  S.rain += (rainT - S.rain) * Math.min(1, dt * 0.05); S.fog += (fogT - S.fog) * Math.min(1, dt * 0.05);
  if (rk === 'tempestade' && chance(dt * 0.02)) {
    G.flash = 0.18; const a = rnd(0, 6.28), x = p.x + Math.cos(a) * rnd(10, 30), y = p.y + Math.sin(a) * rnd(10, 30);
    makeNoise(x, y, 16, false);
    if (chance(0.06)) igniteTile(Math.floor(x), Math.floor(y));
  }
  for (let k = timers.length - 1; k >= 0; k--) { timers[k].t -= dt; if (timers[k].t <= 0) { const f = timers[k].fn; timers.splice(k, 1); f(); } }
  updateNeeds(dt);
  updatePlayer(dt);
  // fluxo dos zumbis
  G.flowT -= dt;
  const key = Math.floor(p.x) * 1000 + Math.floor(p.y);
  if (G.flowT <= 0 || (key !== G.flowKey && G.flowT < 0.45)) { buildFlow(); G.flowT = 0.6; G.flowKey = key; }
  rebuildZGrid();
  updateZombies(dt);
  updateNpcs(dt);
  updateAnimals(dt);
  updateVehicles(dt);
  updateFires(dt);
  // fear
  p.fear = clamp(p.fear + ((G.seenZ || 0) * 9 - lvl('combate') * 4 - p.fear) * Math.min(1, dt * 0.15), 0, 100);
  G.acc.hour += dt; if (G.acc.hour >= 60) { G.acc.hour -= 60; hourly(); }
}
