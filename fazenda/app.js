/* Fazenda Aurora — jogo de fazenda (sem build, dados salvos no aparelho). */
'use strict';
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const SAVE_KEY = 'fazenda-aurora-v1';
  const DAY_LEN = 240;           // segundos reais por dia de jogo
  const OFFLINE_MAX = 4 * 3600;  // a fazenda trabalha até 4 h com o app fechado

  /* ================= Catálogo ================= */
  const PRODUCTS = {
    alface: { n: 'Alface', i: '🥬', p: 6, u: 'un' },
    cenoura: { n: 'Cenoura', i: '🥕', p: 7, u: 'kg' },
    milho: { n: 'Milho', i: '🌽', p: 9, u: 'sc' },
    silagem: { n: 'Silagem', i: '🌿', p: 6, u: 't' },
    trigo: { n: 'Trigo', i: '🌾', p: 10, u: 'sc' },
    amendoim: { n: 'Amendoim', i: '🥜', p: 16, u: 'sc' },
    tomate: { n: 'Tomate', i: '🍅', p: 8, u: 'cx' },
    soja: { n: 'Soja', i: '🌱', p: 15, u: 'sc' },
    abobora: { n: 'Abóbora', i: '🎃', p: 22, u: 'un' },
    girassol: { n: 'Girassol', i: '🌻', p: 14, u: 'sc' },
    feijao: { n: 'Feijão', i: '🫘', p: 14, u: 'sc' },
    arroz: { n: 'Arroz', i: '🍚', p: 14, u: 'sc' },
    morango: { n: 'Morango', i: '🍓', p: 28, u: 'cx' },
    cana: { n: 'Cana-de-açúcar', i: '🎋', p: 9, u: 't' },
    algodao: { n: 'Algodão', i: '☁️', p: 24, u: 'fd' },
    cafe: { n: 'Café', i: '☕', p: 40, u: 'sc' },
    ovo: { n: 'Ovos', i: '🥚', p: 2.5, u: 'un' },
    leite: { n: 'Leite', i: '🥛', p: 3, u: 'L' },
    la: { n: 'Lã', i: '🧶', p: 12, u: 'kg' },
    peixe: { n: 'Tilápia', i: '🐟', p: 14, u: 'kg' },
    adubo: { n: 'Adubo orgânico', i: '🪴', p: 5, u: 'sc' },
    racao: { n: 'Ração de grãos', i: '🌰', p: 5, u: 'sc' },
    racaopeixe: { n: 'Ração de peixe', i: '🦐', p: 3, u: 'kg' },
  };

  // t = segundos para crescer, s = custo da semente, y = colheita base, lvl = nível, cv = potência mínima
  // k = forma da planta no mapa, c = cor do fruto, g = cor da folha
  const CROPS = {
    alface: { t: 45, s: 25, y: 10, lvl: 1, cv: 0, k: 'leaf', c: '#9fdc6b', g: '#5fb24a' },
    cenoura: { t: 70, s: 35, y: 12, lvl: 1, cv: 0, k: 'root', c: '#f08a2c', g: '#4f9c3c' },
    milho: { t: 120, s: 60, y: 20, lvl: 1, cv: 50, k: 'stalk', c: '#f6cf3e', g: '#5aa43f' },
    silagem: { t: 140, s: 70, y: 30, lvl: 1, cv: 50, k: 'stalk', c: '#3f9137', g: '#3f8f35', name: 'Milho p/ silagem' },
    trigo: { t: 110, s: 55, y: 18, lvl: 2, cv: 50, k: 'grain', c: '#e8c062', g: '#8fbf55' },
    amendoim: { t: 160, s: 80, y: 16, lvl: 2, cv: 50, k: 'bush', c: '#c99a5b', g: '#4f9b3d' },
    tomate: { t: 100, s: 60, y: 20, lvl: 3, cv: 0, k: 'bush', c: '#e2453a', g: '#3f8a35' },
    soja: { t: 150, s: 90, y: 18, lvl: 3, cv: 110, k: 'bush', c: '#e6c35a', g: '#6aa23e' },
    abobora: { t: 130, s: 60, y: 8, lvl: 4, cv: 0, k: 'vine', c: '#f08a24', g: '#4f9a3c' },
    girassol: { t: 140, s: 70, y: 16, lvl: 4, cv: 50, k: 'flower', c: '#f7c928', g: '#4f9a3c' },
    feijao: { t: 120, s: 70, y: 16, lvl: 5, cv: 50, k: 'bush', c: '#7a3f2a', g: '#58a040' },
    arroz: { t: 170, s: 90, y: 20, lvl: 5, cv: 110, k: 'grain', c: '#efe0a0', g: '#7fbd5a' },
    morango: { t: 180, s: 120, y: 14, lvl: 6, cv: 0, k: 'bush', c: '#ef3f4f', g: '#3f9440' },
    cana: { t: 220, s: 120, y: 40, lvl: 6, cv: 220, k: 'stalk', c: '#b9d36a', g: '#7fb54a' },
    algodao: { t: 240, s: 140, y: 20, lvl: 7, cv: 110, k: 'bush', c: '#ffffff', g: '#5e8f3c' },
    cafe: { t: 300, s: 200, y: 18, lvl: 8, cv: 110, k: 'bush', c: '#c8302c', g: '#2f7a35' },
  };
  const GRAIN_CROPS = ['milho', 'silagem', 'trigo', 'soja', 'arroz', 'feijao', 'amendoim', 'girassol'];

  // feed: grupo de comida, eat = consumo por segundo, pen = cercado
  const ANIMALS = {
    galinha: { n: 'Galinha', pl: 'Galinhas', i: '🐔', price: 50, feed: 'graos', eat: 0.003, pen: 'galinheiro', what: 'Bota 1 ovo a cada ~50 s' },
    porco: { n: 'Porco', pl: 'Porcos', i: '🐖', price: 500, feed: 'graos', eat: 0.012, pen: 'chiqueiro', grow: 600, sell: 1400, what: 'Engorda e vale até R$ 1.400' },
    vaca: { n: 'Vaca', pl: 'Vacas', i: '🐄', price: 3200, feed: 'volumoso', eat: 0.02, pen: 'pasto', what: '6 L de leite a cada 30 s' },
    boi: { n: 'Boi', pl: 'Bois', i: '🐂', price: 2400, feed: 'volumoso', eat: 0.025, pen: 'pasto', grow: 900, sell: 6000, what: 'Engorda e vale até R$ 6.000' },
    cavalo: { n: 'Cavalo', pl: 'Cavalos', i: '🐎', price: 5500, feed: 'volumoso', eat: 0.02, pen: 'pasto', what: 'Passeios a cavalo: R$ 25 a cada 30 s' },
    ovelha: { n: 'Ovelha', pl: 'Ovelhas', i: '🐑', price: 900, feed: 'volumoso', eat: 0.008, pen: 'pasto', what: '2 kg de lã a cada 90 s' },
  };
  const FEEDS = {
    graos: { n: 'Grãos', src: ['racao', 'milho', 'trigo'], txt: 'ração, milho ou trigo' },
    volumoso: { n: 'Silagem', src: ['silagem'], txt: 'silagem' },
    peixe: { n: 'Ração de peixe', src: ['racaopeixe'], txt: 'ração de peixe' },
  };
  const PENS = {
    galinheiro: { n: 'Galinheiro', base: 10, step: 10, cost: 1500 },
    chiqueiro: { n: 'Chiqueiro', base: 4, step: 4, cost: 2500 },
    pasto: { n: 'Pasto', base: 6, step: 4, cost: 4000 },
    tanque: { n: 'Tanque de peixes', base: 60, step: 60, cost: 3000 },
  };
  const MACHINES = {
    brotinho: { n: 'Trator Brotinho', i: '🚜', price: 9000, cv: 50, bonus: 0.10, color: '#e0533d', what: '50 cv · +10% na colheita' },
    lince: { n: 'Trator Lince', i: '🚜', price: 32000, cv: 110, bonus: 0.25, color: '#3f8fd0', what: '110 cv · +25% na colheita' },
    tita: { n: 'Trator Titã', i: '🚜', price: 85000, cv: 220, bonus: 0.40, color: '#2f8a4a', what: '220 cv · +40% na colheita' },
    ceifa: { n: 'Colheitadeira Ceifa', i: '🌾', price: 120000, harvester: true, color: '#e9b52c', what: 'Botão “Colher tudo” e +15% em grãos' },
    orvalho: { n: 'Pulverizador Orvalho', i: '💧', price: 18000, spray: true, color: '#5aa8d6', what: 'Lavouras crescem 20% mais rápido' },
    trilha: { n: 'Quadriciclo Trilha', i: '🏍️', price: 7000, quad: true, color: '#8a5bd0', what: 'Animais produzem 10% mais' },
    boiadeiro: { n: 'Caminhão Boiadeiro', i: '🚚', price: 45000, truck: true, color: '#d9774b', what: 'Vende tudo 10% mais caro' },
  };
  const PLOT_COST = [0, 0, 0, 1500, 3000, 6000, 12000, 20000];
  const WEATHER = {
    sol: { n: 'Sol', i: '☀️', grow: 1 },
    nublado: { n: 'Nublado', i: '⛅', grow: 1 },
    chuva: { n: 'Chuva', i: '🌧️', grow: 1.3 },
  };
  const CLIENTS = [
    ['Padaria Trigo de Ouro', '🥖'], ['Mercadinho da Vila', '🏪'], ['Restaurante Sabor do Campo', '🍽️'],
    ['Feira de Domingo', '🧺'], ['Laticínio Serra Azul', '🧀'], ['Cooperativa Vale Verde', '🤝'],
    ['Sorveteria Nuvem', '🍦'], ['Hotel Fazenda Recanto', '🏨'], ['Doceria da Lia', '🧁'], ['Escola Rural', '🏫'],
  ];

  /* ================= Estado ================= */
  let uid = 1;
  const newId = () => uid++;
  function freshState() {
    const s = {
      v: 1, name: 'Fazenda Aurora', money: 12000, xp: 0, level: 1, time: DAY_LEN * 0.27,
      weather: 'sol', earned: 0, harvests: 0,
      plots: PLOT_COST.map((c, i) => ({ open: i < 3, crop: null, p: 0, fert: false })),
      inv: { silagem: 60, racao: 30, milho: 10, racaopeixe: 30, adubo: 10 },
      pend: { ovo: 4, leite: 0, la: 0 },
      animals: { galinha: [], porco: [], vaca: [], boi: [], cavalo: [], ovelha: [] },
      pens: { galinheiro: 0, chiqueiro: 0, pasto: 0, tanque: 0 },
      fish: [{ id: newId(), n: 20, g: 0.55 }],
      machines: { brotinho: { cond: 1 } },
      mkt: {}, fed: { graos: 1, volumoso: 1, peixe: 1 },
      orders: [], savedAt: Date.now(), uid: 0,
    };
    s.plots[0] = { open: true, crop: 'milho', p: 0.7, fert: false };
    s.plots[1] = { open: true, crop: 'alface', p: 0.96, fert: false };
    const add = (sp, n, g = 0) => { for (let k = 0; k < n; k++) s.animals[sp].push({ id: newId(), g }); };
    add('galinha', 6); add('vaca', 2); add('cavalo', 1); add('porco', 2, 0.4); add('ovelha', 2);
    Object.keys(PRODUCTS).forEach((k) => { s.mkt[k] = { m: 1, prev: 1 }; });
    return s;
  }

  let S;
  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const base = freshState();
        const d = JSON.parse(raw);
        S = Object.assign(base, d);
        ['inv', 'pend', 'pens', 'fed'].forEach((k) => { S[k] = Object.assign(base[k], d[k] || {}); });
        S.animals = Object.assign(freshState().animals, d.animals || {});
        Object.keys(ANIMALS).forEach((k) => { S.animals[k] = S.animals[k] || []; });
        Object.keys(PRODUCTS).forEach((k) => { S.mkt[k] = S.mkt[k] || { m: 1, prev: 1 }; });
        uid = Math.max(S.uid || 0, 1000);
        return true;
      }
    } catch (e) { /* save corrompido: começa de novo */ }
    S = freshState();
    while (S.orders.length < 3) S.orders.push(newOrder());
    return false;
  }
  function save() {
    S.savedAt = Date.now();
    S.uid = uid;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* armazenamento cheio/bloqueado */ }
  }

  /* ================= Utilidades ================= */
  const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  const brl2 = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const money = (v) => brl.format(Math.floor(v));
  const num = (v) => Math.floor(v + 1e-6).toLocaleString('pt-BR');
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const cropName = (id) => CROPS[id].name || PRODUCTS[id].n;
  function dur(sec) {
    sec = Math.max(0, Math.ceil(sec));
    if (sec < 60) return `${sec}s`;
    const m = Math.floor(sec / 60), r = sec % 60;
    return r ? `${m}min ${r}s` : `${m}min`;
  }
  const xpNeed = (l) => Math.round(80 * Math.pow(l, 1.5));
  const owns = (id) => !!S.machines[id];
  const working = (id) => owns(id) && S.machines[id].cond >= 0.15;

  function bestTractor() {
    let best = null;
    Object.keys(S.machines).forEach((id) => {
      const m = MACHINES[id];
      if (m.cv && working(id) && (!best || m.cv > MACHINES[best].cv)) best = id;
    });
    return best;
  }
  const tractorCv = () => (bestTractor() ? MACHINES[bestTractor()].cv : 0);
  function price(id) {
    const m = S.mkt[id] ? S.mkt[id].m : 1;
    return PRODUCTS[id].p * m * (working('boiadeiro') ? 1.1 : 1);
  }
  const penCap = (pen) => PENS[pen].base + PENS[pen].step * S.pens[pen];
  const penCount = (pen) => (pen === 'tanque'
    ? S.fish.reduce((a, f) => a + f.n, 0)
    : Object.keys(ANIMALS).filter((k) => ANIMALS[k].pen === pen).reduce((a, k) => a + S.animals[k].length, 0));
  const growSpeed = () => WEATHER[S.weather].grow * (working('orvalho') ? 1.2 : 1);
  const animalBoost = () => (working('trilha') ? 1.1 : 1);
  function animalValue(sp, a) {
    const d = ANIMALS[sp];
    if (!d.grow) return d.price * 0.6;
    return d.price * 0.6 + (d.sell - d.price * 0.6) * a.g;
  }

  /* ================= Simulação ================= */
  function step(dt) {
    const prevDay = Math.floor(S.time / DAY_LEN);
    S.time += dt;

    // Lavouras
    const gs = growSpeed();
    S.plots.forEach((pl) => {
      if (pl.crop && pl.p < 1) pl.p = Math.min(1, pl.p + (dt / CROPS[pl.crop].t) * gs * (pl.fert ? 1.33 : 1));
    });

    // Alimentação: cada grupo consome do estoque na ordem das fontes
    const need = { graos: 0, volumoso: 0, peixe: 0 };
    Object.keys(ANIMALS).forEach((k) => { need[ANIMALS[k].feed] += S.animals[k].length * ANIMALS[k].eat * dt; });
    need.peixe = S.fish.reduce((a, f) => a + (f.g < 1 ? f.n : 0), 0) * 0.0004 * dt;
    Object.keys(need).forEach((g) => {
      const want = need[g];
      if (want <= 0) { S.fed[g] = 1; return; }
      let left = want;
      FEEDS[g].src.forEach((src) => {
        const take = Math.min(left, S.inv[src] || 0);
        if (take > 0) { S.inv[src] -= take; left -= take; }
      });
      S.fed[g] = clamp(1 - left / want, 0, 1);
    });

    const boost = animalBoost();
    const A = S.animals;
    const fv = S.fed.volumoso, fg = S.fed.graos;
    S.pend.ovo = Math.min(S.pend.ovo + A.galinha.length * dt / 50 * fg * boost, penCap('galinheiro') * 3);
    S.pend.leite = Math.min(S.pend.leite + A.vaca.length * dt * 0.2 * fv * boost, 300);
    S.pend.la = Math.min(S.pend.la + A.ovelha.length * dt * (2 / 90) * fv * boost, 120);
    const horseCash = A.cavalo.length * dt * (25 / 30) * fv * boost;
    if (horseCash > 0) { S.money += horseCash; S.earned += horseCash; }
    A.boi.forEach((a) => { a.g = Math.min(1, a.g + dt / ANIMALS.boi.grow * fv * boost); });
    A.porco.forEach((a) => { a.g = Math.min(1, a.g + dt / ANIMALS.porco.grow * fg * boost); });
    S.fish.forEach((f) => { f.g = Math.min(1, f.g + dt / 480 * S.fed.peixe); });
    const manure = (A.vaca.length + A.boi.length + A.cavalo.length + (A.ovelha.length + A.porco.length) * 0.5) * dt * 0.004;
    S.inv.adubo = (S.inv.adubo || 0) + manure;

    const day = Math.floor(S.time / DAY_LEN);
    if (day !== prevDay) newDay();
  }

  function newDay() {
    Object.keys(S.mkt).forEach((k) => {
      const mk = S.mkt[k];
      mk.prev = mk.m;
      mk.m = clamp(mk.m + rand(-0.14, 0.14) + (1 - mk.m) * 0.25, 0.65, 1.5);
    });
    const r = Math.random();
    S.weather = r < 0.6 ? 'sol' : r < 0.82 ? 'nublado' : 'chuva';
    if (S.orders.length < 3) S.orders.push(newOrder());
    dayChanged = true;
  }
  let dayChanged = false;

  function newOrder() {
    const pool = Object.keys(CROPS).filter((k) => CROPS[k].lvl <= (S ? S.level : 1) && k !== 'silagem');
    if (S && S.animals.galinha.length) pool.push('ovo', 'ovo');
    if (S && S.animals.vaca.length) pool.push('leite', 'leite');
    if (S && S.animals.ovelha.length) pool.push('la');
    if (S && S.fish.length) pool.push('peixe');
    const n = S && S.level >= 2 && Math.random() < 0.6 ? 2 : 1;
    const items = {};
    while (Object.keys(items).length < n) {
      const id = pick(pool);
      if (items[id]) continue;
      const typical = CROPS[id] ? CROPS[id].y : id === 'ovo' ? 24 : id === 'leite' ? 40 : id === 'la' ? 8 : 12;
      items[id] = Math.max(2, Math.round(typical * rand(0.6, 1.3)));
    }
    const worth = Object.keys(items).reduce((a, k) => a + PRODUCTS[k].p * items[k], 0);
    const [who, icon] = pick(CLIENTS);
    return { id: newId(), who, icon, items, reward: Math.round(worth * rand(1.5, 1.9) / 10) * 10, xp: Math.max(5, Math.round(worth / 12)) };
  }

  function gainXp(v) {
    S.xp += v;
    let up = false;
    while (S.xp >= xpNeed(S.level)) { S.xp -= xpNeed(S.level); S.level++; up = true; }
    if (up) {
      const novas = Object.keys(CROPS).filter((k) => CROPS[k].lvl === S.level).map((k) => PRODUCTS[k].i + ' ' + cropName(k));
      toast(`🎉 Nível ${S.level}!${novas.length ? ' Novas sementes: ' + novas.join(', ') : ''}`, 'lvl', 4200);
    }
  }
  function addMoney(v) {
    S.money += v;
    if (v > 0) S.earned += v;
    const chip = $('#moneyChip');
    chip.classList.remove('bump'); void chip.offsetWidth; chip.classList.add('bump');
    setTimeout(() => chip.classList.remove('bump'), 260);
  }

  /* ================= Ações ================= */
  function plant(i, crop, fert) {
    const pl = S.plots[i], c = CROPS[crop];
    if (!pl.open || pl.crop) return;
    if (c.lvl > S.level) return toast(`Libera no nível ${c.lvl}.`, 'bad');
    if (c.cv > tractorCv()) return toast(`Precisa de um trator de ${c.cv} cv ou mais.`, 'bad');
    if (S.money < c.s) return toast('Dinheiro insuficiente para as sementes.', 'bad');
    if (fert && (S.inv.adubo || 0) < 5) fert = false;
    S.money -= c.s;
    if (fert) S.inv.adubo -= 5;
    Object.assign(pl, { crop, p: 0, fert: !!fert });
    wear(0.02);
    gainXp(1);
    toast(`${PRODUCTS[crop].i} ${cropName(crop)} plantado${fert ? ' com adubo' : ''}!`, 'good');
  }
  function harvestYield(i) {
    const pl = S.plots[i], c = CROPS[pl.crop];
    const t = bestTractor();
    let mult = 1 + (t ? MACHINES[t].bonus : 0);
    if (pl.fert) mult *= 1.15;
    if (working('ceifa') && GRAIN_CROPS.includes(pl.crop)) mult *= 1.15;
    return Math.round(c.y * mult);
  }
  function harvest(i, silent) {
    const pl = S.plots[i];
    if (!pl.crop || pl.p < 1) return 0;
    const y = harvestYield(i), crop = pl.crop;
    S.inv[crop] = (S.inv[crop] || 0) + y;
    Object.assign(pl, { crop: null, p: 0, fert: false });
    S.harvests++;
    wear(0.01);
    gainXp(Math.max(2, Math.round(CROPS[crop].s / 12)));
    if (!silent) {
      toast(`${PRODUCTS[crop].i} +${y} ${PRODUCTS[crop].u} de ${cropName(crop)}`, 'good');
      vibrate();
    }
    return { crop, y };
  }
  function wear(v) {
    const t = bestTractor();
    if (!t) return;
    const m = S.machines[t];
    const before = m.cond;
    m.cond = Math.max(0, m.cond - v);
    if (before >= 0.3 && m.cond < 0.3) toast(`🔧 ${MACHINES[t].n} precisa de manutenção.`, 'bad');
  }
  function collect(kind) {
    const v = Math.floor(S.pend[kind]);
    if (v < 1) return 0;
    S.pend[kind] -= v;
    S.inv[kind] = (S.inv[kind] || 0) + v;
    gainXp(Math.max(1, Math.round(v * PRODUCTS[kind].p / 30)));
    vibrate();
    return v;
  }
  function vibrate() { try { navigator.vibrate && navigator.vibrate(12); } catch (e) { /* sem vibração */ } }

  const ACTIONS = {
    'open-zone': (d) => openZone(d.zone),
    'open-plot': (d) => openPlot(+d.i),
    'close-sheet': () => closeSheet(),
    tab: (d) => setTab(d.tab),
    plant: (d) => {
      const fert = $('#fertChk') && $('#fertChk').checked;
      plant(+d.i, d.crop, fert);
      closeSheet();
    },
    harvest: (d) => { harvest(+d.i); if (sheetCtx && sheetCtx.type === 'plot') closeSheet(); },
    'harvest-all': () => {
      const got = {};
      S.plots.forEach((pl, i) => { const r = harvest(i, true); if (r) got[r.crop] = (got[r.crop] || 0) + r.y; });
      const keys = Object.keys(got);
      if (!keys.length) return toast('Nenhuma lavoura pronta.', '');
      vibrate();
      toast('🌾 Colhido: ' + keys.map((k) => `${PRODUCTS[k].i} ${got[k]}`).join('  '), 'good');
    },
    clear: (d) => {
      if (!confirm('Arrancar esta plantação? As sementes serão perdidas.')) return;
      Object.assign(S.plots[+d.i], { crop: null, p: 0, fert: false });
      closeSheet();
    },
    'buy-plot': (d) => {
      const i = +d.i, c = PLOT_COST[i];
      if (S.money < c) return toast('Dinheiro insuficiente.', 'bad');
      S.money -= c; S.plots[i].open = true;
      gainXp(10);
      toast('🗺️ Novo campo liberado!', 'good');
      openPlot(i);
    },
    collect: (d) => {
      const v = collect(d.kind);
      if (v) toast(`${PRODUCTS[d.kind].i} +${v} ${PRODUCTS[d.kind].u} de ${PRODUCTS[d.kind].n.toLowerCase()}`, 'good');
      else toast('Ainda não há nada para recolher.', '');
    },
    'buy-animal': (d) => {
      const sp = d.sp, a = ANIMALS[sp], n = +(d.n || 1);
      if (penCount(a.pen) + n > penCap(a.pen)) return toast(`${PENS[a.pen].n} lotado. Amplie para comprar mais.`, 'bad');
      if (S.money < a.price * n) return toast('Dinheiro insuficiente.', 'bad');
      S.money -= a.price * n;
      for (let k = 0; k < n; k++) S.animals[sp].push({ id: newId(), g: 0 });
      gainXp(Math.max(1, Math.round(a.price * n / 400)));
      toast(`${a.i} ${n > 1 ? n + ' ' + a.pl.toLowerCase() : a.n} na fazenda!`, 'good');
    },
    'sell-animal': (d) => {
      const sp = d.sp, list = S.animals[sp];
      if (!list.length) return;
      // vende o mais pesado primeiro
      let idx = 0;
      list.forEach((a, k) => { if (a.g > list[idx].g) idx = k; });
      const v = animalValue(sp, list[idx]) * (working('boiadeiro') ? 1.1 : 1);
      list.splice(idx, 1);
      addMoney(v);
      gainXp(Math.round(v / 200));
      toast(`${ANIMALS[sp].i} Vendido por ${money(v)}`, 'good');
    },
    'upgrade-pen': (d) => {
      const pen = d.pen, cost = PENS[pen].cost * (S.pens[pen] + 1);
      if (S.money < cost) return toast('Dinheiro insuficiente.', 'bad');
      S.money -= cost; S.pens[pen]++;
      gainXp(15);
      toast(`🔨 ${PENS[pen].n} ampliado: cabem ${penCap(pen)}.`, 'good');
    },
    'buy-fish': () => {
      if (penCount('tanque') + 20 > penCap('tanque')) return toast('Tanque cheio. Amplie para mais alevinos.', 'bad');
      if (S.money < 60) return toast('Dinheiro insuficiente.', 'bad');
      S.money -= 60;
      S.fish.push({ id: newId(), n: 20, g: 0 });
      toast('🐟 20 alevinos soltos no tanque!', 'good');
    },
    'harvest-fish': () => {
      const ready = S.fish.filter((f) => f.g >= 1);
      if (!ready.length) return toast('Os peixes ainda estão crescendo.', '');
      const kg = Math.round(ready.reduce((a, f) => a + f.n, 0) * 0.6);
      S.fish = S.fish.filter((f) => f.g < 1);
      S.inv.peixe = (S.inv.peixe || 0) + kg;
      gainXp(Math.round(kg / 3));
      vibrate();
      toast(`🐟 +${kg} kg de tilápia`, 'good');
    },
    'buy-machine': (d) => {
      const m = MACHINES[d.id];
      if (owns(d.id)) return;
      if (S.money < m.price) return toast('Dinheiro insuficiente.', 'bad');
      S.money -= m.price;
      S.machines[d.id] = { cond: 1 };
      gainXp(Math.round(m.price / 1000));
      toast(`${m.i} ${m.n} chegou na fazenda!`, 'good');
    },
    'sell-machine': (d) => {
      const m = MACHINES[d.id];
      if (!owns(d.id)) return;
      const v = machineValue(d.id);
      if (!confirm(`Vender ${m.n} por ${money(v)}?`)) return;
      delete S.machines[d.id];
      addMoney(v);
      toast(`${m.i} ${m.n} vendido por ${money(v)}.`, 'good');
    },
    repair: (d) => {
      const c = repairCost(d.id);
      if (S.money < c) return toast('Dinheiro insuficiente para a manutenção.', 'bad');
      S.money -= c; S.machines[d.id].cond = 1;
      toast(`🔧 ${MACHINES[d.id].n} revisado e como novo.`, 'good');
    },
    sell: (d) => {
      const id = d.id, have = Math.floor(S.inv[id] || 0);
      const q = d.q === 'all' ? have : Math.min(have, +d.q);
      if (q < 1) return;
      const v = q * price(id);
      S.inv[id] -= q;
      addMoney(v);
      gainXp(Math.max(1, Math.round(v / 60)));
      toast(`${PRODUCTS[id].i} ${q} ${PRODUCTS[id].u} vendidos por ${brl2.format(v)}`, 'good');
    },
    buy: (d) => {
      const id = d.id, q = +d.q, cost = q * buyPrice(id);
      if (S.money < cost) return toast('Dinheiro insuficiente.', 'bad');
      S.money -= cost;
      S.inv[id] = (S.inv[id] || 0) + q;
      toast(`${PRODUCTS[id].i} +${q} ${PRODUCTS[id].u} de ${PRODUCTS[id].n.toLowerCase()}`, 'good');
    },
    deliver: (d) => {
      const o = S.orders.find((x) => x.id === +d.id);
      if (!o) return;
      if (!canDeliver(o)) return toast('Faltam produtos no armazém.', 'bad');
      Object.keys(o.items).forEach((k) => { S.inv[k] -= o.items[k]; });
      S.orders = S.orders.filter((x) => x !== o);
      addMoney(o.reward);
      gainXp(o.xp);
      toast(`${o.icon} Encomenda entregue! +${money(o.reward)}`, 'good');
      setTimeout(() => { S.orders.push(newOrder()); render(); }, 1500);
    },
    'skip-order': (d) => {
      S.orders = S.orders.filter((x) => x.id !== +d.id);
      S.orders.push(newOrder());
    },
    'mkt-seg': (d) => { mktSeg = d.seg; },
    rename: () => {
      const n = prompt('Nome da fazenda:', S.name);
      if (n && n.trim()) S.name = n.trim().slice(0, 28);
    },
    reset: () => {
      if (!confirm('Começar uma fazenda nova? Todo o progresso será apagado.')) return;
      localStorage.removeItem(SAVE_KEY);
      load();
      closeSheet();
      setTab('fazenda');
    },
  };
  const buyPrice = (id) => ({ racao: 6, silagem: 9, racaopeixe: 4, adubo: 10 }[id]);
  const machineValue = (id) => Math.round(MACHINES[id].price * 0.55 * Math.max(0.25, S.machines[id].cond));
  const repairCost = (id) => Math.round(MACHINES[id].price * 0.12 * (1 - S.machines[id].cond));
  const canDeliver = (o) => Object.keys(o.items).every((k) => (S.inv[k] || 0) >= o.items[k]);

  /* ================= Mapa (SVG) ================= */
  const ZONES = {
    sede: { x: 8, y: 8, w: 142, h: 140, n: 'Sede' },
    lavouraA: { x: 165, y: 8, w: 187, h: 140, n: 'Lavoura Norte' },
    lavouraB: { x: 8, y: 166, w: 182, h: 132, n: 'Lavoura Sul' },
    galpao: { x: 206, y: 166, w: 146, h: 132, n: 'Galpão' },
    pasto: { x: 8, y: 316, w: 224, h: 146, n: 'Pasto' },
    chiqueiro: { x: 246, y: 316, w: 106, h: 68, n: 'Chiqueiro' },
    galinheiro: { x: 246, y: 394, w: 106, h: 68, n: 'Galinheiro' },
    tanque: { x: 8, y: 486, w: 178, h: 106, n: 'Tanque' },
    armazem: { x: 206, y: 486, w: 146, h: 106, n: 'Armazém' },
  };
  const PLOTS_XY = [
    [168, 26, 88, 56], [261, 26, 88, 56], [168, 88, 88, 56], [261, 88, 88, 56],
    [11, 184, 86, 54], [100, 184, 86, 54], [11, 241, 86, 54], [100, 241, 86, 54],
  ];
  // áreas onde cada bicho passeia
  const ROAM = {
    pasto: [22, 350, 200, 450], chiqueiro: [258, 352, 336, 380], galinheiro: [292, 420, 344, 458],
  };

  function sign(x, y, text, w) {
    w = w || text.length * 5.6 + 16;
    return `<g class="no-pe" transform="translate(${x - w / 2},${y})">
      <rect x="${w / 2 - 1.2}" y="10" width="2.4" height="7" fill="#7a5233"/>
      <rect width="${w}" height="13" rx="4" fill="#8a5d3b"/>
      <rect y="0" width="${w}" height="11" rx="4" fill="#a8774c"/>
      <text x="${w / 2}" y="8.4" text-anchor="middle" font-size="7.6" font-weight="900" fill="#fff7e6">${text}</text></g>`;
  }
  function tree(x, y, r, c) {
    c = c || '#4c9a3f';
    return `<g transform="translate(${x},${y})">
      <ellipse cx="2" cy="${r * 0.9}" rx="${r}" ry="${r * 0.35}" fill="#000" opacity=".12"/>
      <g class="sway" style="animation-duration:${(4 + Math.random() * 2).toFixed(1)}s">
      <rect x="-1.5" y="${r * 0.2}" width="3" height="${r * 0.7}" rx="1" fill="#7b5233"/>
      <circle r="${r}" fill="${c}"/><circle cx="${-r * 0.3}" cy="${-r * 0.3}" r="${r * 0.55}" fill="#fff" opacity=".14"/>
      <circle cx="${r * 0.35}" cy="${r * 0.2}" r="${r * 0.45}" fill="#000" opacity=".08"/></g></g>`;
  }
  function bush(x, y) {
    return `<g transform="translate(${x},${y})"><circle r="4" fill="#5aa848"/><circle cx="4" cy="1" r="3.4" fill="#4c9a3f"/><circle cx="1" cy="-2" r="1" fill="#f58ab0"/><circle cx="4.5" cy="0" r="1" fill="#fff3a0"/></g>`;
  }

  function scenery() {
    let s = '';
    // grama e textura
    s += `<rect width="360" height="600" fill="url(#grass)"/>`;
    s += `<rect width="360" height="600" fill="url(#tufts)" opacity=".5"/>`;
    // riacho que alimenta o tanque
    s += `<path d="M362,468 C320,488 286,462 246,474 S206,486 186,500 S150,500 140,512" fill="none" stroke="#6fb8de" stroke-width="13" stroke-linecap="round"/>
      <path d="M362,468 C320,488 286,462 246,474 S206,486 186,500 S150,500 140,512" fill="none" stroke="#9fd6f0" stroke-width="6" stroke-linecap="round"/>
      <path class="flow" d="M362,468 C320,488 286,462 246,474 S206,486 186,500 S150,500 140,512" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>`;
    // estradas de terra
    const road = 'M157,0 L157,150 Q157,157 164,157 L360,157 M0,157 L157,157 M198,157 L198,600 M0,307 L360,307';
    s += `<path d="${road}" fill="none" stroke="#c9a874" stroke-width="15" stroke-linejoin="round"/>
      <path d="${road}" fill="none" stroke="#e7cf9c" stroke-width="11" stroke-linejoin="round"/>
      <path d="${road}" fill="none" stroke="#d6b984" stroke-width="1" stroke-dasharray="2 7" stroke-linejoin="round"/>`;
    // ponte sobre o riacho
    s += `<g transform="translate(198,483)"><rect x="-11" y="-12" width="22" height="24" rx="2" fill="#a8774c"/>
      ${[-8, -3, 2, 7].map((y) => `<rect x="-11" y="${y}" width="22" height="2.4" fill="#8a5d3b"/>`).join('')}
      <rect x="-13" y="-13" width="3" height="26" rx="1.5" fill="#7a5233"/><rect x="10" y="-13" width="3" height="26" rx="1.5" fill="#7a5233"/></g>`;

    // --- Sede ---
    s += `<path d="M14,22 Q12,12 24,12 L140,12 Q148,12 148,22 L148,138 Q148,146 138,146 L22,146 Q12,146 14,136 Z" fill="#b6dd86"/>`;
    s += `<path d="M78,146 L78,118 Q78,112 84,112 L140,112" fill="none" stroke="#efe0bd" stroke-width="5" stroke-linecap="round"/>`;
    // casa
    s += `<g transform="translate(46,48)">
      <ellipse cx="30" cy="56" rx="40" ry="7" fill="#000" opacity=".12"/>
      <rect x="2" y="22" width="56" height="34" rx="3" fill="#fbf1dc"/>
      <rect x="2" y="48" width="56" height="8" fill="#e9d9b6"/>
      <path d="M-4,25 L30,-2 L64,25 Z" fill="#d9603f"/><path d="M30,-2 L64,25 L58,25 L30,3 Z" fill="#b84a2f"/>
      <rect x="44" y="0" width="7" height="14" fill="#a0523a"/>
      <g class="smoke" fill="#fff"><circle cx="47.5" cy="-3" r="3"/><circle cx="47.5" cy="-3" r="3"/><circle cx="47.5" cy="-3" r="3"/></g>
      <rect x="25" y="36" width="10" height="20" rx="2" fill="#8a5d3b"/><circle cx="33" cy="47" r=".9" fill="#f2c94c"/>
      <rect class="win" x="9" y="31" width="10" height="9" rx="1.5" fill="#9fd3ee"/><rect class="win" x="41" y="31" width="10" height="9" rx="1.5" fill="#9fd3ee"/>
      <path d="M14,31 V40 M9,35.5 H19 M46,31 V40 M41,35.5 H51" stroke="#fff" stroke-width="1"/>
      <rect x="22" y="56" width="16" height="3" rx="1" fill="#d6c19a"/>
      </g>`;
    // moinho de vento
    s += `<g transform="translate(128,64)">
      <path d="M-6,46 L-2,0 L2,0 L6,46" fill="none" stroke="#9a8a74" stroke-width="2"/>
      <path d="M-5,34 L4,22 M5,34 L-4,22 M-3,14 L3,8" stroke="#9a8a74" stroke-width="1"/>
      <g class="blades"><circle r="2.2" fill="#6b6b6b"/>
      ${[0, 72, 144, 216, 288].map((a) => `<path transform="rotate(${a})" d="M0,0 L-2.2,-15 Q0,-17 2.2,-15 Z" fill="#f4f1ea" stroke="#c9c2b4" stroke-width=".5"/>`).join('')}
      </g><path class="flag" d="M3,-1 L12,-3 L12,3 Z" fill="#d9603f"/></g>`;
    s += tree(28, 34, 11, '#3f8f3a') + tree(24, 104, 9) + tree(132, 128, 7, '#5aa848') + tree(36, 132, 6, '#58a046');
    s += bush(100, 128) + bush(56, 126) + bush(118, 30);
    // varal + horta pequena
    s += `<g transform="translate(18,60)"><rect width="18" height="30" rx="3" fill="#8f6440"/>${[4, 10, 16, 22].map((y) => `<g transform="translate(4,${y})"><circle r="2" fill="#6fbf4a"/><circle cx="7" r="2" fill="#e2453a"/><circle cx="10" r="1.6" fill="#6fbf4a"/></g>`).join('')}</g>`;
    s += sign(79, 6, 'Sede');

    // --- Lavouras (fundo) ---
    s += `<rect x="165" y="14" width="187" height="134" rx="12" fill="#9cc56a"/>`;
    s += `<rect x="8" y="172" width="182" height="126" rx="12" fill="#9cc56a"/>`;
    s += sign(258, 9, 'Lavoura Norte');
    s += sign(99, 167, 'Lavoura Sul');

    // --- Galpão de máquinas ---
    s += `<rect x="206" y="172" width="146" height="126" rx="12" fill="#cfc6b0"/>
      <rect x="212" y="178" width="134" height="114" rx="9" fill="#ddd5c1"/>
      ${[0, 1, 2, 3, 4, 5].map((k) => `<line x1="${222 + k * 22}" y1="252" x2="${222 + k * 22}" y2="290" stroke="#c9bfa8" stroke-width="1"/>`).join('')}
      <g transform="translate(216,186)">
        <ellipse cx="44" cy="58" rx="46" ry="6" fill="#000" opacity=".12"/>
        <path d="M0,58 L0,22 Q44,-8 88,22 L88,58 Z" fill="#7d93a8"/>
        <path d="M0,22 Q44,-8 88,22" fill="none" stroke="#5f768c" stroke-width="3"/>
        ${[16, 30, 44, 58, 72].map((x) => `<path d="M${x},${x === 44 ? 7 : x === 30 || x === 58 ? 10 : 15} L${x},58" stroke="#6b8399" stroke-width="1"/>`).join('')}
        <rect x="26" y="28" width="36" height="30" rx="2" fill="#3c4a57"/>
        <rect x="26" y="28" width="36" height="4" fill="#5f768c"/>
      </g>
      <g transform="translate(318,188)">
        <ellipse cx="2" cy="56" rx="18" ry="5" fill="#000" opacity=".12"/>
        <rect x="-14" y="6" width="28" height="50" rx="3" fill="#e2e2dc"/>
        <rect id="siloFill" x="-14" y="56" width="28" height="0" fill="#7fb54a" opacity=".55"/>
        <path d="M-14,6 Q0,-8 14,6 Z" fill="#c95b3b"/>
        ${[16, 26, 36, 46].map((y) => `<line x1="-14" y1="${y}" x2="14" y2="${y}" stroke="#c8c8c0" stroke-width="1"/>`).join('')}
        <text x="0" y="34" text-anchor="middle" font-size="6" font-weight="900" fill="#8b8b80">SILO</text>
      </g>`;
    s += sign(279, 167, 'Galpão');

    // --- Pasto ---
    s += `<path d="M18,322 L224,322 Q232,322 232,330 L232,452 Q232,462 222,462 L20,462 Q8,462 8,450 L8,334 Q8,322 18,322 Z" fill="#a9d97a"/>`;
    s += `<rect x="12" y="326" width="216" height="132" rx="10" fill="none" stroke="#9a6b43" stroke-width="2" stroke-dasharray="1 0"/>
      <rect x="12" y="326" width="216" height="132" rx="10" fill="none" stroke="#7a5233" stroke-width="4" stroke-dasharray="1.5 11" stroke-linecap="round"/>`;
    s += tree(200, 346, 12, '#3f8f3a');
    s += `<g transform="translate(40,440)"><rect x="-12" y="-4" width="26" height="8" rx="3" fill="#8a5d3b"/><rect x="-10" y="-3" width="22" height="4" rx="2" fill="#7fc3e6"/></g>
      <g transform="translate(176,438)"><circle r="7" fill="#e7c55b"/><circle r="4.5" fill="none" stroke="#c9a23c" stroke-width="1"/><circle cx="12" cy="3" r="5" fill="#e0bb4f"/><circle cx="12" cy="3" r="3" fill="none" stroke="#c9a23c" stroke-width="1"/></g>`;
    s += `${[[70, 345], [120, 420], [150, 360], [90, 448]].map(([x, y]) => `<g transform="translate(${x},${y})" fill="#fff">${[0, 72, 144, 216, 288].map((a) => `<ellipse transform="rotate(${a})" cy="-1.6" rx=".9" ry="1.6"/>`).join('')}<circle r=".9" fill="#f6c945"/></g>`).join('')}`;
    s += sign(120, 316, 'Pasto');

    // --- Chiqueiro ---
    s += `<rect x="246" y="322" width="106" height="62" rx="10" fill="#c79e70"/>
      <ellipse cx="300" cy="364" rx="30" ry="10" fill="#8f6440" opacity=".7"/>
      <ellipse cx="296" cy="362" rx="16" ry="5" fill="#7a5233" opacity=".6"/>
      <g transform="translate(252,330)"><path d="M0,14 L10,4 L20,14 Z" fill="#c95b3b"/><rect x="2" y="13" width="16" height="10" fill="#e9d2a8"/><rect x="7" y="16" width="6" height="7" fill="#6b4a2c"/></g>
      <rect x="248" y="324" width="102" height="58" rx="9" fill="none" stroke="#7a5233" stroke-width="3" stroke-dasharray="1.5 9" stroke-linecap="round"/>`;
    s += sign(299, 316, 'Chiqueiro');

    // --- Galinheiro ---
    s += `<rect x="246" y="400" width="106" height="62" rx="10" fill="#e8d6a8"/>
      ${[...Array(9)].map((_, k) => `<circle cx="${296 + (k % 3) * 14 + (k > 5 ? 4 : 0)}" cy="${424 + Math.floor(k / 3) * 12}" r=".8" fill="#c9a23c"/>`).join('')}
      <g transform="translate(252,408)">
        <ellipse cx="16" cy="34" rx="18" ry="4" fill="#000" opacity=".12"/>
        <path d="M-2,14 L16,0 L34,14 Z" fill="#c95b3b"/><rect x="1" y="13" width="30" height="20" rx="1.5" fill="#f4e7c8"/>
        <path d="M12,33 L12,22 Q16,17 20,22 L20,33 Z" fill="#6b4a2c"/>
        <path d="M14,33 L22,40" stroke="#a8774c" stroke-width="2"/>
        <rect class="win" x="4" y="17" width="5" height="5" rx="1" fill="#9fd3ee"/>
      </g>
      <rect x="248" y="402" width="102" height="58" rx="9" fill="none" stroke="#9a8a74" stroke-width="1.6" stroke-dasharray="3 2"/>`;
    s += sign(299, 394, 'Galinheiro');

    // --- Tanque de peixes ---
    s += `<path d="M30,500 C60,488 120,492 160,504 C190,514 186,560 164,578 C140,596 70,596 40,584 C14,572 6,516 30,500 Z" fill="#5aa8d6"/>
      <path d="M36,506 C64,496 118,500 154,510 C180,520 176,556 158,572 C136,588 74,588 46,578 C24,568 16,520 36,506 Z" fill="url(#water)"/>
      <circle class="ripple" cx="70" cy="540" r="8" fill="none" stroke="#fff" stroke-width="1" opacity=".8"/>
      <circle class="ripple" cx="128" cy="556" r="7" fill="none" stroke="#fff" stroke-width="1" opacity=".8" style="animation-delay:1.8s"/>
      <g transform="translate(150,528)"><circle r="6" fill="#4f9a4a"/><path d="M0,0 L6,-2 L6,2 Z" fill="url(#water)"/></g>
      <g transform="translate(52,566)"><circle r="5" fill="#5aa848"/><path d="M0,0 L5,-2 L5,2 Z" fill="url(#water)"/><circle cx="-2" cy="-2" r="1.6" fill="#f7a6c4"/></g>
      <g transform="translate(14,524)"><rect width="18" height="14" rx="1.5" fill="#a8774c"/><path d="M0,4 H18 M0,9 H18" stroke="#8a5d3b" stroke-width="1"/></g>
      ${tree(176, 586, 7, '#4c9a3f')}
      <g id="fishLayer"></g>`;
    s += sign(96, 486, 'Tanque');

    // --- Armazém + bancada de feira ---
    s += `<rect x="206" y="492" width="146" height="100" rx="12" fill="#cbbf9f"/>
      <g transform="translate(216,500)">
        <ellipse cx="34" cy="62" rx="38" ry="6" fill="#000" opacity=".14"/>
        <path d="M0,22 L34,2 L68,22 L68,62 L0,62 Z" fill="#c4473a"/>
        <path d="M-4,24 L34,0 L72,24" fill="none" stroke="#f4ede0" stroke-width="3" stroke-linejoin="round"/>
        <rect x="18" y="32" width="32" height="30" fill="#a63b30"/>
        <path d="M18,32 L50,62 M50,32 L18,62" stroke="#f4ede0" stroke-width="2"/>
        <rect x="18" y="32" width="32" height="30" fill="none" stroke="#f4ede0" stroke-width="2"/>
        <circle class="win" cx="34" cy="18" r="4" fill="#9fd3ee" stroke="#f4ede0" stroke-width="1.5"/>
      </g>
      <g transform="translate(296,540)">
        <rect x="0" y="10" width="44" height="14" rx="2" fill="#a8774c"/>
        ${[0, 1, 2, 3, 4, 5, 6, 7].map((k) => `<path d="M${k * 5.5},-2 h5.5 v8 q-2.75,3 -5.5,0 Z" fill="${k % 2 ? '#fff' : '#f2b63c'}"/>`).join('')}
        <rect x="1" y="-2" width="2" height="26" fill="#7a5233"/><rect x="41" y="-2" width="2" height="26" fill="#7a5233"/>
        <circle cx="10" cy="9" r="3" fill="#e2453a"/><circle cx="17" cy="9" r="3" fill="#f08a2c"/><circle cx="25" cy="9" r="3" fill="#9fdc6b"/><circle cx="33" cy="9" r="3" fill="#f6cf3e"/>
      </g>`;
    s += sign(279, 486, 'Armazém');
    return s;
  }

  function defs() {
    return `<defs>
      <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd173"/><stop offset="1" stop-color="#8cc463"/></linearGradient>
      <pattern id="tufts" width="22" height="22" patternUnits="userSpaceOnUse">
        <path d="M4,8 l1.5,-3 l1.5,3 M15,18 l1.5,-3 l1.5,3" stroke="#7fb556" stroke-width="1" fill="none"/>
      </pattern>
      <radialGradient id="water" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#a6dcf3"/><stop offset="1" stop-color="#5fb0dc"/></radialGradient>
      <pattern id="soil" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#a67447"/><rect width="8" height="3" fill="#946540"/></pattern>
      <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>
    </defs>`;
  }

  /* --- Plantas --- */
  function plantSVG(id, st) {
    const c = CROPS[id];
    if (st === 0) return `<circle r="1.2" fill="#5a3b22"/><circle cx="2.6" cy="-.6" r=".9" fill="#5a3b22"/>`;
    if (st === 1) {
      return `<path d="M0,0 V-3.5" stroke="#5aa845" stroke-width="1"/>
        <ellipse cx="-1.8" cy="-4" rx="2" ry="1" fill="#7cc35a" transform="rotate(-25 -1.8 -4)"/>
        <ellipse cx="1.8" cy="-4" rx="2" ry="1" fill="#7cc35a" transform="rotate(25 1.8 -4)"/>`;
    }
    const r = st === 3;
    const sc = r ? 1 : 0.72;
    let g = '';
    switch (c.k) {
      case 'leaf':
        g = `<circle cy="-4" r="5" fill="${c.g}"/><circle cy="-4.4" r="3.4" fill="${c.c}"/><circle cy="-4.6" r="1.6" fill="#c9ef9a"/>`;
        break;
      case 'root':
        g = `${[-30, 0, 30].map((a) => `<ellipse transform="rotate(${a})" cy="-5" rx="1.4" ry="5" fill="${c.g}"/>`).join('')}
          ${r ? `<path d="M-2.4,0 L0,3 L2.4,0 Z" fill="${c.c}"/><ellipse cy="0" rx="2.6" ry="1" fill="${c.c}"/>` : ''}`;
        break;
      case 'stalk': {
        const h = id === 'cana' ? 17 : 14;
        g = `<path d="M0,0 V-${h}" stroke="${id === 'cana' ? '#9cb94f' : c.g}" stroke-width="${id === 'cana' ? 2 : 1.4}"/>
          <path d="M0,-5 Q-5,-7 -6,-3 M0,-9 Q5,-11 6,-7 M0,-12 Q-4,-14 -5,-11" stroke="${c.g}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
          ${r && id === 'milho' ? `<ellipse cx="2" cy="-8" rx="1.6" ry="3" fill="${c.c}"/><path d="M0,-${h} l-1.5,-2.5 M0,-${h} l1.5,-2.5" stroke="#d9b65a" stroke-width=".8"/>` : ''}
          ${r && id === 'silagem' ? `<path d="M0,-${h} l-2,-3 M0,-${h} l2,-3 M0,-${h} v-3.5" stroke="#cdbb6a" stroke-width=".8"/>` : ''}
          ${id === 'cana' ? `<path d="M-1,-5 h2 M-1,-10 h2 M-1,-14 h2" stroke="#6f8f35" stroke-width=".6"/>` : ''}`;
        break;
      }
      case 'grain': {
        const col = r ? c.c : c.g;
        g = [-3, 0, 3].map((x) => `<path d="M${x * 0.4},0 Q${x * 0.6},-6 ${x},-11" stroke="${r ? '#cfae5b' : c.g}" stroke-width="1" fill="none"/>
          <ellipse cx="${x}" cy="-12" rx="1.3" ry="3" fill="${col}"/>`).join('');
        break;
      }
      case 'bush': {
        const leaf = id === 'soja' && r ? '#c7b54d' : c.g;
        g = `<circle cx="-2.6" cy="-3.6" r="3.4" fill="${leaf}"/><circle cx="2.6" cy="-3.8" r="3.4" fill="${leaf}"/><circle cy="-6.4" r="3.6" fill="${leaf}"/>
          <circle cx="-1" cy="-7.4" r="1.4" fill="#fff" opacity=".18"/>`;
        if (r && id !== 'soja') {
          const rr = id === 'algodao' ? 1.7 : id === 'cafe' || id === 'feijao' || id === 'amendoim' ? 1 : 1.4;
          g += [[-3, -4], [2.8, -3], [0, -7.2], [-0.6, -2.4]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${rr}" fill="${c.c}"/>`).join('');
        }
        break;
      }
      case 'vine':
        g = `<path d="M-6,-1 Q0,-4 6,-1" stroke="${c.g}" stroke-width="1.2" fill="none"/>
          <circle cx="-5" cy="-3" r="2.4" fill="${c.g}"/><circle cx="5" cy="-3" r="2.4" fill="${c.g}"/>
          ${r ? `<ellipse cy="-2.8" rx="4" ry="3.2" fill="${c.c}"/><path d="M-1.5,-5.6 Q0,-2.8 -1.5,0 M1.5,-5.6 Q0,-2.8 1.5,0" stroke="#d26c12" stroke-width=".6" fill="none"/><rect x="-.5" y="-7.4" width="1" height="2" fill="#5a7a2c"/>` : `<circle cy="-4" r="2.6" fill="${c.g}"/>`}`;
        break;
      case 'flower':
        g = `<path d="M0,0 V-13" stroke="#4f8a35" stroke-width="1.2"/><ellipse cx="-2.6" cy="-6" rx="2.6" ry="1.2" fill="${c.g}"/><ellipse cx="2.6" cy="-8" rx="2.6" ry="1.2" fill="${c.g}"/>
          ${r ? `<circle cy="-14" r="4.6" fill="${c.c}"/><circle cy="-14" r="2.2" fill="#6b4220"/>` : `<circle cy="-13.5" r="2" fill="#8fbf55"/>`}`;
        break;
      default:
        g = `<circle cy="-4" r="4" fill="${c.g}"/>`;
    }
    return `<g transform="scale(${sc})">${g}</g>`;
  }
  const stageOf = (pl) => (!pl.crop ? -1 : pl.p >= 1 ? 3 : pl.p < 0.15 ? 0 : pl.p < 0.5 ? 1 : 2);

  function plotSVG(i) {
    const pl = S.plots[i];
    const [x, y, w, h] = PLOTS_XY[i];
    if (!pl.open) {
      return `<g data-plot="${i}" class="zone-hit">
        <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#b9d98e" stroke="#7fae54" stroke-width="1.4" stroke-dasharray="4 3"/>
        <text x="${x + w / 2}" y="${y + h / 2 - 2}" text-anchor="middle" font-size="12">🔒</text>
        <text x="${x + w / 2}" y="${y + h / 2 + 12}" text-anchor="middle" font-size="8" font-weight="900" fill="#4d7a33">${money(PLOT_COST[i])}</text></g>`;
    }
    const st = stageOf(pl);
    let plants = '';
    if (pl.crop) {
      const cols = 6, rows = 3;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const px = x + (c + 0.5) * (w / cols) + (r % 2 ? 2 : -2);
          const py = y + (r + 0.86) * (h / rows);
          const delay = ((c * 0.37 + r * 0.61) % 2).toFixed(2);
          plants += `<g transform="translate(${px.toFixed(1)},${py.toFixed(1)})"><g class="${st >= 2 ? 'sway' : ''}" style="animation-delay:-${delay}s">${plantSVG(pl.crop, st)}</g></g>`;
        }
      }
    }
    const furrows = [...Array(5)].map((_, k) => `<line x1="${x + 5}" x2="${x + w - 5}" y1="${(y + 8 + k * (h - 14) / 4).toFixed(1)}" y2="${(y + 8 + k * (h - 14) / 4).toFixed(1)}" stroke="#8b5e38" stroke-width="1.4" stroke-linecap="round" opacity=".55"/>`).join('');
    const readyRing = st === 3 ? `<rect class="plot-ready" x="${x - 1.5}" y="${y - 1.5}" width="${w + 3}" height="${h + 3}" rx="9" fill="none" stroke="#fff6c2" stroke-width="2.4"/>` : '';
    const fert = pl.fert ? `<circle cx="${x + 8}" cy="${y + 8}" r="4" fill="#fff" opacity=".85"/><text x="${x + 8}" y="${y + 10.5}" font-size="6" text-anchor="middle">🪴</text>` : '';
    const badge = st === 3 ? bubbleSVG(x + w - 10, y + 2, PRODUCTS[pl.crop].i, `data-plot="${i}"`) : '';
    return `<g data-plot="${i}" class="zone-hit">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="url(#soil)"/>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="none" stroke="#7a5233" stroke-width="1.2" opacity=".5"/>
      ${furrows}${plants}${readyRing}${fert}${badge}</g>`;
  }

  function bubbleSVG(x, y, icon, attrs) {
    return `<g class="bubble" ${attrs}><g transform="translate(${x},${y})">
      <path d="M-9,-9 h18 a3,3 0 0 1 3,3 v12 a3,3 0 0 1 -3,3 h-6 l-3,4 l-3,-4 h-6 a3,3 0 0 1 -3,-3 v-12 a3,3 0 0 1 3,-3 Z" fill="#fff" stroke="#e6dcc8" stroke-width=".8"/>
      <text y="4.2" text-anchor="middle" font-size="11">${icon}</text></g></g>`;
  }

  /* --- Animais --- */
  function animalSVG(sp) {
    const L = (x, h, col, b) => `<rect class="leg${b ? ' b' : ''}" x="${x}" y="${-h}" width="1.7" height="${h}" rx=".8" fill="${col}"/>`;
    switch (sp) {
      case 'vaca':
        return `${L(-6, 4.5, '#3a3a3a')}${L(-3, 4.5, '#3a3a3a', 1)}${L(3, 4.5, '#3a3a3a')}${L(6, 4.5, '#3a3a3a', 1)}
          <g class="body"><path class="tail" d="M-8.4,-8 q-2.4,2 -1.6,5.5" stroke="#3a3a3a" stroke-width="1" fill="none"/>
          <ellipse cy="-7.5" rx="9" ry="4.6" fill="#fdfcf7" stroke="#3a3a3a" stroke-width=".5"/>
          <path d="M-5,-10.5 q3,1 2,4 q-3,1 -4,-2 Z M2,-11 q3,0 3,3 q-2,2 -4,0 Z M-1,-5 q2,-1 3,1 q-1,1.5 -3,0 Z" fill="#3a3a3a"/>
          <ellipse cx="1" cy="-3.2" rx="2" ry="1.2" fill="#f4b3b3"/>
          <g transform="translate(9.5,-9.5)"><ellipse rx="3.1" ry="2.6" fill="#fdfcf7" stroke="#3a3a3a" stroke-width=".5"/><ellipse cx="2" cy="1" rx="1.8" ry="1.4" fill="#f4b3b3"/>
          <circle cx=".4" cy="-.8" r=".55" fill="#222"/><path d="M-1.6,-2.2 l-1,-1.6 M.8,-2.4 l.6,-1.8" stroke="#cdbf9f" stroke-width=".9"/></g></g>`;
      case 'boi':
        return `${L(-6, 4.5, '#5a3820')}${L(-3, 4.5, '#5a3820', 1)}${L(3, 4.5, '#5a3820')}${L(6, 4.5, '#5a3820', 1)}
          <g class="body"><path class="tail" d="M-8.4,-8 q-2.4,2 -1.6,5.5" stroke="#5a3820" stroke-width="1" fill="none"/>
          <ellipse cy="-7.5" rx="9.2" ry="4.9" fill="#a26a3c"/><ellipse cx="4" cy="-11" rx="3" ry="2" fill="#a26a3c"/>
          <g transform="translate(9.5,-9)"><ellipse rx="3.2" ry="2.8" fill="#8a5730"/><ellipse cx="2.2" cy="1" rx="1.6" ry="1.3" fill="#c48a63"/>
          <circle cx=".4" cy="-.8" r=".55" fill="#222"/><path d="M-1.8,-2 q-2,-1.8 -.8,-3.4 M1,-2.4 q2,-1.4 1.6,-3.2" stroke="#f3ead6" stroke-width="1" fill="none" stroke-linecap="round"/></g></g>`;
      case 'cavalo':
        return `${L(-6, 7, '#6b3d1f')}${L(-3.5, 7, '#6b3d1f', 1)}${L(3.5, 7, '#6b3d1f')}${L(6, 7, '#6b3d1f', 1)}
          <g class="body"><path class="tail" d="M-8,-10 q-4,2 -3,8" stroke="#3a2214" stroke-width="2.2" fill="none" stroke-linecap="round"/>
          <ellipse cy="-10" rx="8.4" ry="4" fill="#b8693a"/>
          <path d="M5,-12 L9,-18 L12,-17 L9,-10 Z" fill="#b8693a"/>
          <g transform="translate(11.5,-17.5) rotate(25)"><ellipse rx="4" ry="2" fill="#b8693a"/><circle cx="-.6" cy="-.6" r=".5" fill="#222"/></g>
          <path d="M5,-13 L8.6,-18.8 L10,-18" stroke="#3a2214" stroke-width="1.8" fill="none" stroke-linecap="round"/></g>`;
      case 'ovelha':
        return `${L(-4.5, 4, '#3d3d3d')}${L(-2, 4, '#3d3d3d', 1)}${L(2.5, 4, '#3d3d3d')}${L(5, 4, '#3d3d3d', 1)}
          <g class="body"><g fill="#f7f3ea">${[[-5, -7], [-1.5, -9], [2.5, -8.6], [5, -6.4], [0, -5], [-4, -4.6], [3, -4.6]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.4"/>`).join('')}</g>
          <g transform="translate(8,-8)"><ellipse rx="2.6" ry="2.2" fill="#3d3d3d"/><circle cx=".8" cy="-.6" r=".5" fill="#fff"/><ellipse cx="-1.8" cy="-1.6" rx="1.4" ry=".7" fill="#3d3d3d"/></g></g>`;
      case 'porco':
        return `${L(-4.5, 3.4, '#e48b97')}${L(-2, 3.4, '#e48b97', 1)}${L(2.5, 3.4, '#e48b97')}${L(4.5, 3.4, '#e48b97', 1)}
          <g class="body"><path class="tail" d="M-7,-6 q-2.4,-1 -1.6,-2.6 q1.2,-.8 .2,-2" stroke="#e48b97" stroke-width=".9" fill="none"/>
          <ellipse cy="-6.2" rx="7.2" ry="4.6" fill="#f7b3bd"/>
          <ellipse cx="6.8" cy="-6" rx="1.9" ry="2.1" fill="#ef98a5"/><circle cx="7.1" cy="-6.5" r=".35" fill="#a5525f"/><circle cx="7.1" cy="-5.4" r=".35" fill="#a5525f"/>
          <circle cx="4.4" cy="-8" r=".55" fill="#3a2a2a"/><path d="M2,-10 l1.6,-2.4 l1.4,2.2 Z" fill="#ef98a5"/></g>`;
      case 'galinha':
        return `<path class="leg" d="M-.8,0 v-2.4" stroke="#f0a32c" stroke-width=".8"/><path class="leg b" d="M.8,0 v-2.4" stroke="#f0a32c" stroke-width=".8"/>
          <g class="body"><path d="M-3.6,-5 l-1.8,-2.4 l1,3 Z" fill="#f2efe6"/>
          <ellipse cy="-4.4" rx="3.6" ry="2.6" fill="#fffdf6" stroke="#e2dccb" stroke-width=".4"/>
          <path d="M-1.6,-4.6 q1.4,1.4 2.6,0" stroke="#e2dccb" stroke-width=".5" fill="none"/>
          <g class="peck" style="animation-delay:-${(Math.random() * 1.8).toFixed(2)}s"><g transform="translate(2.8,-6.6)"><circle r="1.7" fill="#fffdf6"/><path d="M-.6,-1.6 q.4,-1 1,-.2 q.6,-.8 .9,.4 Z" fill="#e2453a"/>
          <path d="M1.6,-.2 l1.2,.4 l-1.2,.4 Z" fill="#f0a32c"/><circle cx=".6" cy="-.4" r=".35" fill="#222"/><ellipse cx="1.1" cy=".9" rx=".4" ry=".6" fill="#e2453a"/></g></g></g>`;
      default: return '';
    }
  }

  const animalEls = new Map(); // id -> {el, sp, x, y}
  function renderAnimals() {
    const layer = $('#lyrAnimals');
    if (!layer) return;
    const wanted = [];
    const caps = { galinha: 14, porco: 8, vaca: 8, boi: 8, cavalo: 6, ovelha: 8 };
    Object.keys(ANIMALS).forEach((sp) => S.animals[sp].slice(0, caps[sp]).forEach((a) => wanted.push([sp, a])));
    const keep = new Set(wanted.map(([, a]) => a.id));
    animalEls.forEach((v, id) => { if (!keep.has(id)) { v.el.remove(); animalEls.delete(id); } });
    wanted.forEach(([sp, a]) => {
      if (animalEls.has(a.id)) return;
      const [x0, y0, x1, y1] = ROAM[ANIMALS[sp].pen];
      const x = rand(x0, x1), y = rand(y0, y1);
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'animal');
      g.dataset.zone = ANIMALS[sp].pen;
      g.style.transform = `translate(${x}px, ${y}px)`;
      const grow = ANIMALS[sp].grow ? 0.75 + 0.25 * a.g : 1;
      g.innerHTML = `<ellipse cx="0" cy="0" rx="${sp === 'galinha' ? 3.4 : 8}" ry="${sp === 'galinha' ? 1.1 : 2}" fill="#000" opacity=".14"/><g class="flip"><g transform="scale(${grow.toFixed(2)})">${animalSVG(sp)}</g></g>`;
      layer.appendChild(g);
      const rec = { el: g, sp, x, y, a };
      animalEls.set(a.id, rec);
      setTimeout(() => wander(rec), rand(200, 3000));
    });
    // os de trás aparecem antes (profundidade)
    [...animalEls.values()].sort((p, q) => p.y - q.y).forEach((r) => layer.appendChild(r.el));
  }
  function wander(r) {
    // cada bicho tem um só passeio ativo: se foi redesenhado, o antigo para aqui
    if (animalEls.get(r.a.id) !== r || !r.el.isConnected) return;
    const [x0, y0, x1, y1] = ROAM[ANIMALS[r.sp].pen];
    const hungry = S.fed[ANIMALS[r.sp].feed] < 0.5;
    const far = r.sp === 'galinha' ? 14 : 30;
    const nx = clamp(r.x + rand(-far, far), x0, x1);
    const ny = clamp(r.y + rand(-far / 2, far / 2), y0, y1);
    const dist = Math.hypot(nx - r.x, ny - r.y);
    const speed = r.sp === 'cavalo' ? 14 : r.sp === 'galinha' ? 9 : 7; // px/s
    const t = Math.max(0.6, dist / speed);
    const flip = r.el.querySelector('.flip');
    flip.setAttribute('transform', nx < r.x ? 'scale(-1,1)' : '');
    r.el.style.transitionDuration = `${t}s`;
    r.el.classList.add('walking');
    r.el.style.transform = `translate(${nx.toFixed(1)}px, ${ny.toFixed(1)}px)`;
    r.x = nx; r.y = ny;
    setTimeout(() => {
      r.el.classList.remove('walking');
      setTimeout(() => wander(r), rand(1500, hungry ? 9000 : 5000));
    }, t * 1000);
  }

  function renderFish() {
    const layer = $('#fishLayer');
    if (!layer) return;
    const n = Math.min(9, Math.ceil(S.fish.reduce((a, f) => a + f.n, 0) / 8));
    if (+layer.dataset.n === n) return;
    layer.dataset.n = n;
    let s = '';
    for (let k = 0; k < n; k++) {
      const cx = 92 + rand(-26, 26), cy = 542 + rand(-14, 14), rx = rand(14, 34), ry = rand(6, 14);
      const d = `M${cx - rx},${cy} a${rx},${ry} 0 1,0 ${rx * 2},0 a${rx},${ry} 0 1,0 ${-rx * 2},0`;
      s += `<g opacity=".85"><path d="M-4,0 Q0,-2.2 4,0 Q0,2.2 -4,0 Z M-4,0 L-6.5,-2 L-6.5,2 Z" fill="${pick(['#f08a2c', '#f7b04b', '#e86a3a', '#9aa6b2'])}">
        <animateMotion dur="${rand(9, 18).toFixed(1)}s" repeatCount="indefinite" rotate="auto" path="${d}" begin="-${rand(0, 9).toFixed(1)}s"/></path></g>`;
    }
    layer.innerHTML = s;
  }

  function machinesSVG() {
    // tratores andando pelas estradas; o resto estacionado no galpão
    let s = '';
    const routes = [
      'M198,600 L198,165 Q198,157 190,157 L12,157 L190,157 Q198,157 206,157 L350,157 L206,157 Q198,157 198,165 L198,600',
      'M6,307 L354,307 L6,307',
      'M157,4 L157,150 Q157,157 164,157 L198,157 L198,300 L198,157 L164,157 Q157,157 157,150 L157,4',
    ];
    const vehicles = Object.keys(S.machines);
    let r = 0;
    vehicles.forEach((id, k) => {
      const m = MACHINES[id];
      const moving = m.cv && working(id) && r < routes.length;
      const body = id === 'boiadeiro' ? truckSVG(m.color) : id === 'ceifa' ? harvesterSVG() : id === 'trilha' ? quadSVG(m.color) : id === 'orvalho' ? sprayerSVG() : tractorSVG(m.color, m.cv);
      if (moving) {
        const dur = 70 + r * 17;
        s += `<g class="no-pe">${body.replace('<g>', `<g><animateMotion dur="${dur}s" repeatCount="indefinite" rotate="auto" path="${routes[r]}" begin="-${(k * 13) % dur}s"/>`)}</g>`;
        r++;
      } else {
        const spots = [[260, 262], [232, 280], [290, 282], [320, 262], [240, 252], [300, 250], [330, 284]];
        const [x, y] = spots[k % spots.length];
        s += `<g transform="translate(${x},${y})" data-zone="galpao">${body}</g>`;
      }
    });
    return s;
  }
  function tractorSVG(col, cv) {
    const big = cv >= 220 ? 1.25 : cv >= 110 ? 1.1 : 1;
    return `<g><g transform="scale(${big})">
      <ellipse cx="0" cy="1" rx="10" ry="6" fill="#000" opacity=".15"/>
      <rect x="-9" y="-7.5" width="7" height="3.6" rx="1.2" fill="#2d2d2d"/><rect x="-9" y="3.9" width="7" height="3.6" rx="1.2" fill="#2d2d2d"/>
      <rect x="4" y="-6" width="4.2" height="2.6" rx="1" fill="#2d2d2d"/><rect x="4" y="3.4" width="4.2" height="2.6" rx="1" fill="#2d2d2d"/>
      <rect x="-8" y="-4" width="17" height="8" rx="2.4" fill="${col}"/>
      <rect x="-7" y="-3.4" width="7.4" height="6.8" rx="1.4" fill="#cfe9f6" stroke="#fff" stroke-width=".6"/>
      <rect x="2" y="-2" width="6" height="4" rx="1" fill="#000" opacity=".12"/><circle cx="5" cy="-2.6" r=".8" fill="#555"/></g></g>`;
  }
  function harvesterSVG() {
    return `<g><ellipse cx="0" cy="1" rx="14" ry="8" fill="#000" opacity=".15"/>
      <rect x="9" y="-10" width="5" height="20" rx="1.4" fill="#d9a520"/>${[-7, -3, 1, 5].map((y) => `<line x1="10" x2="13" y1="${y}" y2="${y}" stroke="#a87c12"/>`).join('')}
      <rect x="-10" y="-6" width="19" height="12" rx="2.4" fill="#e9b52c"/><rect x="-1" y="-4" width="6" height="8" rx="1.2" fill="#cfe9f6"/>
      <rect x="-12" y="-1" width="7" height="2" fill="#a87c12"/></g>`;
  }
  function truckSVG(col) {
    return `<g><ellipse cx="0" cy="1" rx="15" ry="6" fill="#000" opacity=".15"/>
      <rect x="-14" y="-5.5" width="20" height="11" rx="1.4" fill="#f4ede0" stroke="#c9bfa8" stroke-width=".6"/>
      ${[-11, -7, -3, 1].map((x) => `<line x1="${x}" x2="${x}" y1="-5" y2="5" stroke="#c9bfa8" stroke-width=".6"/>`).join('')}
      <rect x="6.5" y="-5" width="8" height="10" rx="2" fill="${col}"/><rect x="10.5" y="-4" width="3" height="8" rx="1" fill="#cfe9f6"/></g>`;
  }
  function quadSVG(col) {
    return `<g><ellipse cx="0" cy="1" rx="7" ry="4" fill="#000" opacity=".15"/>
      ${[[-5, -4.6], [-5, 2.6], [3, -4.6], [3, 2.6]].map(([x, y]) => `<rect x="${x}" y="${y}" width="3.6" height="2" rx=".8" fill="#2d2d2d"/>`).join('')}
      <rect x="-5" y="-2.8" width="10" height="5.6" rx="2" fill="${col}"/><circle cx="-1" r="1.8" fill="#333"/></g>`;
  }
  function sprayerSVG() {
    return `<g><ellipse cx="0" cy="1" rx="9" ry="9" fill="#000" opacity=".12"/>
      <rect x="-1" y="-13" width="2" height="26" rx="1" fill="#7a8a96"/><rect x="-7" y="-4.5" width="10" height="9" rx="4.5" fill="#5aa8d6"/>
      <rect x="3" y="-3" width="5" height="6" rx="1" fill="#e0533d"/></g>`;
  }

  function weatherSVG() {
    if (S.weather !== 'chuva') return '';
    let s = '';
    for (let k = 0; k < 46; k++) {
      const x = Math.round(rand(0, 380));
      s += `<line class="raindrop" x1="${x}" y1="0" x2="${x - 2}" y2="7" stroke="#e6f4ff" stroke-width="1" opacity=".7" style="animation-delay:-${rand(0, 0.7).toFixed(2)}s;animation-duration:${rand(0.6, 0.9).toFixed(2)}s"/>`;
    }
    return s;
  }

  function cloudsSVG() {
    const c = (y, scale, dur, delay, op) => `<g class="cloud no-pe" style="animation-duration:${dur}s;animation-delay:-${delay}s">
      <g transform="translate(0,${y + 26}) scale(${scale})" opacity=".12" fill="#21401a"><ellipse rx="30" ry="12"/><ellipse cx="18" cy="-6" rx="18" ry="11"/><ellipse cx="-16" cy="-4" rx="14" ry="9"/></g>
      <g transform="translate(0,${y}) scale(${scale})" fill="#fff" opacity="${op}"><ellipse rx="30" ry="12"/><ellipse cx="18" cy="-6" rx="18" ry="11"/><ellipse cx="-16" cy="-4" rx="14" ry="9"/></g></g>`;
    const op = S.weather === 'sol' ? 0.75 : 0.9;
    let s = c(70, 0.9, 95, 10, op) + c(260, 1.2, 130, 70, op) + c(470, 0.8, 110, 40, op);
    if (S.weather !== 'sol') s += c(180, 1.1, 85, 30, op) + c(380, 1, 120, 90, op);
    s += `<g class="birds no-pe"><path d="M0,0 q3,-3 6,0 q3,-3 6,0" stroke="#3d4b36" stroke-width="1.1" fill="none"/>
      <path transform="translate(10,6)" d="M0,0 q2.4,-2.4 5,0 q2.4,-2.4 5,0" stroke="#3d4b36" stroke-width="1" fill="none"/>
      <path transform="translate(-6,9)" d="M0,0 q2,-2 4,0 q2,-2 4,0" stroke="#3d4b36" stroke-width=".9" fill="none"/></g>`;
    return s;
  }

  function bubblesSVG() {
    let s = '';
    if (S.pend.ovo >= 1) s += bubbleSVG(338, 404, '🥚', 'data-collect="ovo"');
    if (S.pend.leite >= 1) s += bubbleSVG(46, 336, '🥛', 'data-collect="leite"');
    if (S.pend.la >= 1) s += bubbleSVG(70, 336, '🧶', 'data-collect="la"');
    if (S.fish.some((f) => f.g >= 1)) s += bubbleSVG(168, 500, '🐟', 'data-act="harvest-fish"');
    const hungry = [];
    if (S.fed.volumoso < 0.5 && (S.animals.vaca.length + S.animals.boi.length + S.animals.cavalo.length + S.animals.ovelha.length)) hungry.push([150, 334]);
    if (S.fed.graos < 0.5 && S.animals.porco.length) hungry.push([340, 326]);
    if (S.fed.graos < 0.5 && S.animals.galinha.length) hungry.push([268, 438]);
    hungry.forEach(([x, y]) => { s += `<g class="hungry-mark no-pe"><circle cx="${x}" cy="${y}" r="7" fill="#fff"/><text x="${x}" y="${y + 3.4}" font-size="9" text-anchor="middle">🍽️</text></g>`; });
    // ovos no ninho
    const eggs = Math.min(8, Math.floor(S.pend.ovo));
    for (let k = 0; k < eggs; k++) s += `<ellipse class="no-pe" cx="${292 + (k % 4) * 6}" cy="${446 + Math.floor(k / 4) * 5}" rx="1.7" ry="2.2" fill="#fbf3df" stroke="#d9c9a6" stroke-width=".4"/>`;
    return s;
  }

  function mapHTML() {
    return `<div class="map-wrap" id="mapWrap">
      <svg class="map" id="mapSvg" viewBox="0 0 360 600" role="img" aria-label="Mapa animado da fazenda">
        ${defs()}${scenery()}
        <g id="lyrPlots"></g><g id="lyrMachines"></g><g id="lyrAnimals"></g><g id="lyrBubbles"></g>
        <g id="lyrSky">${cloudsSVG()}</g><g id="lyrRain" class="no-pe">${weatherSVG()}</g>
        <rect id="nightLayer" class="night-layer" width="360" height="600" fill="#14204a" opacity="0"/>
      </svg></div>`;
  }

  let mapSig = '';
  function updateMap(force) {
    const svg = $('#mapSvg');
    if (!svg) return;
    const sig = [
      S.plots.map((p) => `${p.open ? 1 : 0}${p.crop || ''}${stageOf(p)}${p.fert ? 'f' : ''}`).join(','),
      Object.keys(S.machines).map((k) => k + working(k)).join(','),
      Math.floor(S.pend.ovo), S.pend.leite >= 1, S.pend.la >= 1, S.fish.some((f) => f.g >= 1),
      S.fed.volumoso < 0.5, S.fed.graos < 0.5, S.weather,
    ].join('|');
    if (sig !== mapSig || force) {
      const weatherChanged = !mapSig || mapSig.split('|').pop() !== S.weather;
      mapSig = sig;
      $('#lyrPlots').innerHTML = S.plots.map((_, i) => plotSVG(i)).join('');
      const mSig = Object.keys(S.machines).map((k) => k + working(k)).join(',');
      const ml = $('#lyrMachines');
      if (ml.dataset.sig !== mSig) { ml.innerHTML = machinesSVG(); ml.dataset.sig = mSig; }
      $('#lyrBubbles').innerHTML = bubblesSVG();
      if (weatherChanged || force) { $('#lyrSky').innerHTML = cloudsSVG(); $('#lyrRain').innerHTML = weatherSVG(); }
    }
    renderAnimals();
    renderFish();
    // silo mostra a silagem guardada
    const fill = clamp((S.inv.silagem || 0) / 300, 0, 1) * 50;
    const sf = $('#siloFill');
    if (sf) { sf.setAttribute('y', 56 - fill); sf.setAttribute('height', fill); }
    // ciclo dia/noite
    const t = (S.time % DAY_LEN) / DAY_LEN; // 0 = meia-noite
    const night = t < 0.22 ? 1 - t / 0.22 * 0.6 : t > 0.8 ? (t - 0.8) / 0.2 : t < 0.27 ? 0.4 - (t - 0.22) / 0.05 * 0.4 : 0;
    $('#nightLayer').setAttribute('opacity', (clamp(night, 0, 1) * 0.42).toFixed(2));
    svg.classList.toggle('night', night > 0.35);
  }

  function svgPoint(svg, e) {
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }
  function zoneAt(p) {
    for (let i = 0; i < PLOTS_XY.length; i++) {
      const [x, y, w, h] = PLOTS_XY[i];
      if (p.x >= x && p.x <= x + w && p.y >= y && p.y <= y + h) return { plot: i };
    }
    for (const k of Object.keys(ZONES)) {
      const z = ZONES[k];
      if (p.x >= z.x - 4 && p.x <= z.x + z.w + 4 && p.y >= z.y - 6 && p.y <= z.y + z.h + 4) return { zone: k };
    }
    return null;
  }
  function floaty(e, text) {
    const wrap = $('#mapWrap');
    if (!wrap) return;
    const r = wrap.getBoundingClientRect();
    const el = document.createElement('div');
    el.className = 'floaty';
    el.textContent = text;
    el.style.left = `${e.clientX - r.left}px`;
    el.style.top = `${e.clientY - r.top}px`;
    wrap.appendChild(el);
    setTimeout(() => el.remove(), 1500);
  }
  function onMapClick(e) {
    const svg = $('#mapSvg');
    const col = e.target.closest('[data-collect]');
    if (col) {
      const v = collect(col.dataset.collect);
      if (v) floaty(e, `+${v} ${PRODUCTS[col.dataset.collect].i}`);
      afterAction();
      return;
    }
    if (e.target.closest('[data-act="harvest-fish"]')) { ACTIONS['harvest-fish'](); afterAction(); return; }
    const pEl = e.target.closest('[data-plot]');
    let hit = pEl ? { plot: +pEl.dataset.plot } : null;
    if (!hit) {
      const zEl = e.target.closest('[data-zone]');
      hit = zEl ? { zone: zEl.dataset.zone } : zoneAt(svgPoint(svg, e));
    }
    if (!hit) return;
    if (hit.plot != null) {
      const pl = S.plots[hit.plot];
      if (pl.crop && pl.p >= 1) { // toque rápido para colher
        const r = harvest(hit.plot, true);
        floaty(e, `+${r.y} ${PRODUCTS[r.crop].i}`);
        vibrate();
        afterAction();
        return;
      }
      openPlot(hit.plot);
    } else if (hit.zone === 'lavouraA' || hit.zone === 'lavouraB') {
      setTab('lavouras');
    } else openZone(hit.zone);
  }

  /* ================= Telas ================= */
  let tab = 'fazenda';
  let mktSeg = 'vender';
  const view = () => $('#view');

  function plotCard(i) {
    const pl = S.plots[i];
    const name = `Campo ${i + 1}`;
    if (!pl.open) {
      return `<div class="card item"><div class="item__ico">🔒</div><div class="item__main"><div class="item__title">${name}</div>
        <div class="item__sub">Terreno disponível para compra</div></div>
        <button class="btn btn--sun btn--sm" data-act="buy-plot" data-i="${i}" ${S.money < PLOT_COST[i] ? 'disabled' : ''}>${money(PLOT_COST[i])}</button></div>`;
    }
    if (!pl.crop) {
      return `<div class="card item"><div class="item__ico item__ico--clay">🟫</div><div class="item__main"><div class="item__title">${name}</div>
        <div class="item__sub">Terra arada, pronta para o plantio</div></div>
        <button class="btn btn--leaf btn--sm" data-act="open-plot" data-i="${i}">Plantar</button></div>`;
    }
    const c = CROPS[pl.crop], ready = pl.p >= 1;
    return `<div class="card"><div class="item"><div class="item__ico item__ico--leaf">${PRODUCTS[pl.crop].i}</div>
      <div class="item__main"><div class="item__title">${name} · ${cropName(pl.crop)} ${pl.fert ? '<span class="pill pill--sun">adubado</span>' : ''}</div>
      <div class="item__sub" data-live="plottxt:${i}">${plotStatus(i)}</div></div>
      ${ready ? `<button class="btn btn--leaf btn--sm" data-act="harvest" data-i="${i}">Colher</button>` : `<button class="btn btn--sm" data-act="open-plot" data-i="${i}">Ver</button>`}</div>
      <div class="bar"><i data-live="plotbar:${i}" style="width:${(pl.p * 100).toFixed(1)}%"></i></div></div>`;
  }
  function plotStatus(i) {
    const pl = S.plots[i];
    if (!pl.crop) return '';
    if (pl.p >= 1) return `Pronto! Rende ~${harvestYield(i)} ${PRODUCTS[pl.crop].u}`;
    const left = (1 - pl.p) * CROPS[pl.crop].t / (growSpeed() * (pl.fert ? 1.33 : 1));
    return `${Math.floor(pl.p * 100)}% · pronto em ${dur(left)}`;
  }

  function speciesCard(sp) {
    const a = ANIMALS[sp], list = S.animals[sp];
    const fed = S.fed[a.feed];
    const full = penCount(a.pen) >= penCap(a.pen);
    let extra = '';
    if (a.grow && list.length) {
      const avg = list.reduce((s, x) => s + x.g, 0) / list.length;
      const best = list.reduce((m, x) => Math.max(m, x.g), 0);
      extra = `<div class="item__sub">Engorda média ${Math.round(avg * 100)}% · o mais pesado vale ${money(animalValue(sp, { g: best }))}</div>
        <div class="bar bar--sun"><i style="width:${(avg * 100).toFixed(0)}%"></i></div>`;
    }
    const feedPill = !list.length ? '' : fed >= 0.99 ? '<span class="pill pill--leaf">alimentados</span>' : fed > 0.3 ? '<span class="pill pill--sun">pouca comida</span>' : '<span class="pill pill--clay">com fome</span>';
    return `<div class="card"><div class="item"><div class="item__ico item__ico--leaf">${a.i}</div>
      <div class="item__main"><div class="item__title">${a.pl} <span class="pill">${list.length}</span> ${feedPill}</div>
      <div class="item__sub">${a.what} · come ${FEEDS[a.feed].txt}</div></div></div>${extra}
      <div class="btn-row">
        <button class="btn btn--leaf btn--sm" data-act="buy-animal" data-sp="${sp}" ${S.money < a.price || full ? 'disabled' : ''}>Comprar ${money(a.price)}</button>
        ${sp === 'galinha' ? `<button class="btn btn--leaf btn--sm" data-act="buy-animal" data-sp="galinha" data-n="5" ${S.money < a.price * 5 || penCount(a.pen) + 5 > penCap(a.pen) ? 'disabled' : ''}>+5 por ${money(a.price * 5)}</button>` : ''}
        <button class="btn btn--clay btn--sm" data-act="sell-animal" data-sp="${sp}" ${list.length ? '' : 'disabled'}>Vender${list.length ? ' ' + money(animalValue(sp, list.reduce((m, x) => (x.g > m.g ? x : m), list[0])) * (working('boiadeiro') ? 1.1 : 1)) : ''}</button>
      </div></div>`;
  }
  function penCard(pen) {
    const cost = PENS[pen].cost * (S.pens[pen] + 1);
    return `<div class="card item"><div class="item__ico item__ico--sun">🔨</div><div class="item__main">
      <div class="item__title">${PENS[pen].n} <span class="pill">${penCount(pen)}/${penCap(pen)}</span></div>
      <div class="item__sub">Ampliar para ${penCap(pen) + PENS[pen].step} vagas</div></div>
      <button class="btn btn--sun btn--sm" data-act="upgrade-pen" data-pen="${pen}" ${S.money < cost ? 'disabled' : ''}>${money(cost)}</button></div>`;
  }
  function collectCard(kind, where) {
    const v = Math.floor(S.pend[kind]);
    return `<div class="card item"><div class="item__ico item__ico--sky">${PRODUCTS[kind].i}</div><div class="item__main">
      <div class="item__title">${PRODUCTS[kind].n} ${where}</div><div class="item__sub" data-live="pend:${kind}">${num(S.pend[kind])} ${PRODUCTS[kind].u} esperando</div></div>
      <button class="btn btn--sky btn--sm" data-act="collect" data-kind="${kind}" ${v < 1 ? 'disabled' : ''}>Recolher</button></div>`;
  }
  function pondCard() {
    const total = penCount('tanque');
    const ready = S.fish.filter((f) => f.g >= 1).reduce((a, f) => a + f.n, 0);
    const growing = S.fish.filter((f) => f.g < 1);
    const avg = growing.length ? growing.reduce((a, f) => a + f.g, 0) / growing.length : 0;
    const fed = S.fed.peixe;
    return `<div class="card"><div class="item"><div class="item__ico item__ico--sky">🐟</div><div class="item__main">
      <div class="item__title">Tilápias <span class="pill">${total}/${penCap('tanque')}</span> ${growing.length ? (fed >= 0.99 ? '<span class="pill pill--leaf">alimentadas</span>' : '<span class="pill pill--clay">sem ração</span>') : ''}</div>
      <div class="item__sub">${ready ? `${ready} prontas para despescar (~${Math.round(ready * 0.6)} kg)` : growing.length ? `Crescendo · ${Math.round(avg * 100)}%` : 'Tanque vazio: solte alevinos'} · comem ração de peixe</div></div></div>
      ${growing.length ? `<div class="bar bar--sky"><i data-live="fish" style="width:${(avg * 100).toFixed(0)}%"></i></div>` : ''}
      <div class="btn-row">
        <button class="btn btn--sky btn--sm" data-act="buy-fish" ${S.money < 60 || total + 20 > penCap('tanque') ? 'disabled' : ''}>20 alevinos · ${money(60)}</button>
        <button class="btn btn--leaf btn--sm" data-act="harvest-fish" ${ready ? '' : 'disabled'}>Despescar</button>
      </div></div>`;
  }
  function feedCard() {
    const row = (g) => {
      const stock = FEEDS[g].src.reduce((a, k) => a + (S.inv[k] || 0), 0);
      let need = 0;
      Object.keys(ANIMALS).forEach((k) => { if (ANIMALS[k].feed === g) need += S.animals[k].length * ANIMALS[k].eat; });
      if (g === 'peixe') need = S.fish.reduce((a, f) => a + (f.g < 1 ? f.n : 0), 0) * 0.0004;
      const days = need ? stock / need / DAY_LEN : Infinity;
      const txt = need ? (days >= 1 ? `dura ~${days.toFixed(1)} dias` : `acaba em ${dur(stock / need)}`) : 'sem consumo';
      return `<div class="item" style="margin-top:8px"><div class="item__main"><div class="item__title" style="font-size:14px">${FEEDS[g].n}</div>
        <div class="item__sub">${num(stock)} em estoque · ${txt}</div></div><span class="pill ${days < 0.5 ? 'pill--clay' : 'pill--leaf'}">${FEEDS[g].txt}</span></div>`;
    };
    return `<div class="card"><div class="item__title">🍽️ Trato dos animais</div>
      <div class="item__sub">Os animais comem sozinhos do armazém. Plante milho/silagem ou compre ração no Mercado.</div>
      ${row('volumoso')}${row('graos')}${row('peixe')}
      <div class="btn-row"><button class="btn btn--sm" data-act="tab" data-tab="mercado">Comprar ração</button></div></div>`;
  }
  function machineCard(id) {
    const m = MACHINES[id];
    if (owns(id)) {
      const cond = S.machines[id].cond;
      return `<div class="card"><div class="item"><div class="item__ico item__ico--leaf" style="color:${m.color}">${m.i}</div>
        <div class="item__main"><div class="item__title">${m.n} ${cond < 0.15 ? '<span class="pill pill--clay">quebrado</span>' : cond < 0.3 ? '<span class="pill pill--sun">revisar</span>' : ''}</div>
        <div class="item__sub">${m.what}</div></div></div>
        <div class="item__sub" style="margin-top:8px">Conservação ${Math.round(cond * 100)}%</div>
        <div class="bar ${cond < 0.3 ? 'bar--sun' : ''}"><i style="width:${(cond * 100).toFixed(0)}%"></i></div>
        <div class="btn-row">
          <button class="btn btn--sky btn--sm" data-act="repair" data-id="${id}" ${cond > 0.98 || S.money < repairCost(id) ? 'disabled' : ''}>Revisar ${cond > 0.98 ? '' : money(repairCost(id))}</button>
          <button class="btn btn--clay btn--sm" data-act="sell-machine" data-id="${id}">Vender ${money(machineValue(id))}</button>
        </div></div>`;
    }
    return `<div class="card item"><div class="item__ico">${m.i}</div><div class="item__main">
      <div class="item__title">${m.n}</div><div class="item__sub">${m.what}</div></div>
      <button class="btn btn--leaf btn--sm" data-act="buy-machine" data-id="${id}" ${S.money < m.price ? 'disabled' : ''}>${money(m.price)}</button></div>`;
  }
  function orderCard(o) {
    const ok = canDeliver(o);
    return `<div class="card"><div class="item"><div class="item__ico item__ico--sun">${o.icon}</div><div class="item__main">
      <div class="item__title">${esc(o.who)}</div><div class="item__sub">Paga ${money(o.reward)} · +${o.xp} XP</div></div></div>
      <div class="order__items">${Object.keys(o.items).map((k) => {
        const have = Math.floor(S.inv[k] || 0), enough = have >= o.items[k];
        return `<span class="pill ${enough ? 'pill--leaf' : ''}">${PRODUCTS[k].i} ${Math.min(have, o.items[k])}/${o.items[k]} ${PRODUCTS[k].n}</span>`;
      }).join('')}</div>
      <div class="btn-row"><button class="btn btn--leaf btn--sm" data-act="deliver" data-id="${o.id}" ${ok ? '' : 'disabled'}>Entregar</button>
      <button class="btn btn--sm" data-act="skip-order" data-id="${o.id}">Recusar</button></div></div>`;
  }
  function trend(id) {
    const mk = S.mkt[id];
    const d = mk.m - mk.prev;
    if (Math.abs(d) < 0.01) return '<span class="pill">estável</span>';
    return d > 0 ? `<span class="pill pill--leaf">▲ ${Math.round(d / mk.prev * 100)}%</span>` : `<span class="pill pill--clay">▼ ${Math.round(-d / mk.prev * 100)}%</span>`;
  }
  function sellRow(id) {
    const have = Math.floor(S.inv[id] || 0);
    const p = PRODUCTS[id];
    return `<div class="card"><div class="item"><div class="item__ico">${p.i}</div><div class="item__main">
      <div class="item__title">${p.n} ${trend(id)}</div><div class="item__sub">${num(have)} ${p.u} no armazém · ${brl2.format(price(id))}/${p.u}</div></div></div>
      <div class="btn-row"><button class="btn btn--sm" data-act="sell" data-id="${id}" data-q="10" ${have < 1 ? 'disabled' : ''}>Vender 10</button>
      <button class="btn btn--leaf btn--sm" data-act="sell" data-id="${id}" data-q="all" ${have < 1 ? 'disabled' : ''}>Vender tudo · ${money(have * price(id))}</button></div></div>`;
  }
  function buyRow(id, what) {
    const p = PRODUCTS[id], bp = buyPrice(id);
    return `<div class="card"><div class="item"><div class="item__ico item__ico--sun">${p.i}</div><div class="item__main">
      <div class="item__title">${p.n}</div><div class="item__sub">${what} · ${brl2.format(bp)}/${p.u} · você tem ${num(S.inv[id] || 0)}</div></div></div>
      <div class="btn-row">${[10, 50, 200].map((q) => `<button class="btn btn--sm ${q === 50 ? 'btn--sun' : ''}" data-act="buy" data-id="${id}" data-q="${q}" ${S.money < q * bp ? 'disabled' : ''}>+${q} · ${money(q * bp)}</button>`).join('')}</div></div>`;
  }

  function viewFarm() {
    const ready = S.plots.filter((p) => p.crop && p.p >= 1).length;
    const animals = Object.keys(ANIMALS).reduce((a, k) => a + S.animals[k].length, 0);
    const zones = S.plots.filter((p) => p.open).length;
    const tip = ready ? ['🧺', `${ready} ${ready > 1 ? 'lavouras prontas' : 'lavoura pronta'}!`, 'Toque no campo brilhando para colher']
      : S.pend.ovo >= 5 ? ['🥚', 'Ovos no ninho', 'Toque no balão do galinheiro para recolher']
        : S.fed.volumoso < 0.5 || S.fed.graos < 0.5 ? ['🍽️', 'Animais com fome', 'Plante silagem e milho ou compre ração no Mercado']
          : ['👆', 'Toque numa área para explorar', `${zones} campos · ${Object.keys(S.machines).length} máquinas · ${animals} animais`];
    return `${mapHTML()}
      <div class="map-tip"><div class="map-tip__icon">${tip[0]}</div><div><b>${tip[1]}</b><span>${tip[2]}</span></div></div>
      <div class="stats">
        <div class="stat"><b>${S.plots.filter((p) => p.crop).length}/${zones}</b><span>campos plantados</span></div>
        <div class="stat"><b>${animals}</b><span>animais</span></div>
        <div class="stat"><b>${money(S.earned).replace('R$', '').trim()}</b><span>R$ ganhos</span></div>
      </div>
      <h3 class="h2">Encomendas <small>pagam acima do mercado</small></h3>
      <div class="stack">${S.orders.length ? S.orders.map(orderCard).join('') : '<div class="card empty">Novas encomendas chegam a cada dia.</div>'}</div>`;
  }
  function viewFields() {
    const ready = S.plots.some((p) => p.crop && p.p >= 1);
    return `<h3 class="h2" style="margin-top:6px">Seus campos <small>${WEATHER[S.weather].i} ${S.weather === 'chuva' ? 'chuva: +30% crescimento' : WEATHER[S.weather].n}</small></h3>
      ${owns('ceifa') ? `<button class="btn btn--leaf btn--block" data-act="harvest-all" ${ready ? '' : 'disabled'} style="margin-bottom:10px">🌾 Colher tudo com a colheitadeira</button>` : ''}
      <div class="stack">${S.plots.map((_, i) => plotCard(i)).join('')}</div>
      <h3 class="h2">Sementes <small>trator atual: ${tractorCv() ? tractorCv() + ' cv' : 'nenhum'}</small></h3>
      <div class="stack">${Object.keys(CROPS).map((k) => {
        const c = CROPS[k];
        const lock = c.lvl > S.level ? `nível ${c.lvl}` : c.cv > tractorCv() ? `trator ${c.cv} cv` : '';
        return `<div class="card item"><div class="item__ico item__ico--leaf">${PRODUCTS[k].i}</div><div class="item__main">
          <div class="item__title">${cropName(k)} ${lock ? `<span class="pill pill--clay">🔒 ${lock}</span>` : ''}</div>
          <div class="item__sub">${dur(c.t)} · semente ${money(c.s)} · colhe ~${c.y} ${PRODUCTS[k].u} (${brl2.format(PRODUCTS[k].p)}/${PRODUCTS[k].u})</div></div></div>`;
      }).join('')}</div>`;
  }
  function viewAnimals() {
    return `<h3 class="h2" style="margin-top:6px">Recolher produção</h3>
      <div class="stack">${collectCard('ovo', 'no galinheiro')}${collectCard('leite', 'no tanque de leite')}${collectCard('la', 'da tosquia')}</div>
      <h3 class="h2">Pasto <small>${penCount('pasto')}/${penCap('pasto')} vagas</small></h3>
      <div class="stack">${['vaca', 'boi', 'cavalo', 'ovelha'].map(speciesCard).join('')}${penCard('pasto')}</div>
      <h3 class="h2">Chiqueiro <small>${penCount('chiqueiro')}/${penCap('chiqueiro')}</small></h3>
      <div class="stack">${speciesCard('porco')}${penCard('chiqueiro')}</div>
      <h3 class="h2">Galinheiro <small>${penCount('galinheiro')}/${penCap('galinheiro')}</small></h3>
      <div class="stack">${speciesCard('galinha')}${penCard('galinheiro')}</div>
      <h3 class="h2">Tanque de peixes</h3>
      <div class="stack">${pondCard()}${penCard('tanque')}</div>
      <h3 class="h2">Comida</h3>
      ${feedCard()}`;
  }
  function viewMachines() {
    const mine = Object.keys(MACHINES).filter(owns);
    const shop = Object.keys(MACHINES).filter((k) => !owns(k));
    return `<h3 class="h2" style="margin-top:6px">Na garagem <small>${mine.length} ${mine.length === 1 ? 'máquina' : 'máquinas'}</small></h3>
      <p class="hint">Tratores maiores liberam lavouras pesadas (soja, arroz, cana) e rendem mais na colheita. Cada uso desgasta um pouco.</p>
      <div class="stack">${mine.length ? mine.map(machineCard).join('') : '<div class="card empty">Nenhuma máquina. Sem trator você só planta hortaliças.</div>'}</div>
      <h3 class="h2">Concessionária</h3>
      <div class="stack">${shop.length ? shop.map(machineCard).join('') : '<div class="card empty">Você já tem todas as máquinas! 🏆</div>'}</div>`;
  }
  function viewMarket() {
    const sellable = Object.keys(PRODUCTS).filter((k) => !['racao', 'racaopeixe'].includes(k) && (S.inv[k] || 0) >= 1);
    return `<div class="seg" role="tablist">
        <button class="${mktSeg === 'vender' ? 'on' : ''}" data-act="mkt-seg" data-seg="vender">Vender</button>
        <button class="${mktSeg === 'comprar' ? 'on' : ''}" data-act="mkt-seg" data-seg="comprar">Comprar</button>
        <button class="${mktSeg === 'encomendas' ? 'on' : ''}" data-act="mkt-seg" data-seg="encomendas">Encomendas</button></div>
      ${mktSeg === 'vender' ? `<p class="hint">Os preços mudam todo dia. ${working('boiadeiro') ? '🚚 Caminhão: +10% em tudo.' : 'Venda quando a seta estiver verde!'}</p>
        <div class="stack">${sellable.length ? sellable.map(sellRow).join('') : '<div class="card empty">Armazém vazio. Colha, recolha ovos e leite para vender.</div>'}</div>` : ''}
      ${mktSeg === 'comprar' ? `<div class="stack">${buyRow('silagem', 'Para vacas, bois, cavalos e ovelhas')}${buyRow('racao', 'Para porcos e galinhas')}${buyRow('racaopeixe', 'Para as tilápias')}${buyRow('adubo', 'Acelera e aumenta a colheita')}</div>` : ''}
      ${mktSeg === 'encomendas' ? `<div class="stack">${S.orders.length ? S.orders.map(orderCard).join('') : '<div class="card empty">Novas encomendas chegam a cada dia.</div>'}</div>` : ''}`;
  }

  function render() {
    const scroll = window.scrollY;
    const v = view();
    if (tab === 'fazenda') {
      // mantém o mapa vivo (animais andando) e só troca o resto
      if (!$('#mapSvg')) { v.innerHTML = viewFarm(); mapSig = ''; animalEls.clear(); }
      else {
        const tmp = document.createElement('div');
        tmp.innerHTML = viewFarm();
        tmp.querySelector('#mapWrap').remove();
        [...v.children].forEach((ch) => { if (ch.id !== 'mapWrap') ch.remove(); });
        v.append(...tmp.children);
      }
      updateMap();
    } else {
      v.innerHTML = { lavouras: viewFields, animais: viewAnimals, maquinas: viewMachines, mercado: viewMarket }[tab]();
      animalEls.clear();
    }
    window.scrollTo(0, scroll);
    renderHeader();
    if (sheetCtx) renderSheet();
  }
  function setTab(t) {
    if (t !== tab) { tab = t; view().innerHTML = ''; window.scrollTo(0, 0); }
    document.querySelectorAll('.tab').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
    closeSheet(true);
    render();
  }
  function renderHeader() {
    $('#farmName').textContent = S.name;
    $('#money').textContent = money(S.money);
    const day = Math.floor(S.time / DAY_LEN) + 1;
    const mins = Math.floor((S.time % DAY_LEN) / DAY_LEN * 1440);
    $('#dayLbl').textContent = `Dia ${day}`;
    $('#clock').textContent = `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(Math.floor(mins % 60 / 10) * 10).padStart(2, '0')}`;
    $('#weather').textContent = `${WEATHER[S.weather].i} ${WEATHER[S.weather].n}`;
    $('#lvlBadge').textContent = S.level;
    $('#xpBar').style.width = `${(S.xp / xpNeed(S.level) * 100).toFixed(1)}%`;
    $('#xpTxt').textContent = `${Math.floor(S.xp)} / ${xpNeed(S.level)} XP`;
  }

  /* ================= Sheet (detalhes de uma área) ================= */
  let sheetCtx = null;
  function openPlot(i) { sheetCtx = { type: 'plot', i }; showSheet(); }
  function openZone(z) { sheetCtx = { type: 'zone', z }; showSheet(); }
  function showSheet() { $('#sheet').hidden = false; renderSheet(); }
  function closeSheet(silent) {
    sheetCtx = null;
    $('#sheet').hidden = true;
    if (!silent) render();
  }
  function renderSheet() {
    if (!sheetCtx) return;
    let title = '', body = '';
    if (sheetCtx.type === 'plot') {
      const i = sheetCtx.i, pl = S.plots[i];
      title = `Campo ${i + 1}`;
      if (!pl.open) {
        body = `<p class="hint">Amplie sua área de plantio. Cada campo novo planta qualquer cultura liberada.</p>
          <button class="btn btn--sun btn--block" data-act="buy-plot" data-i="${i}" ${S.money < PLOT_COST[i] ? 'disabled' : ''}>Comprar terreno · ${money(PLOT_COST[i])}</button>`;
      } else if (!pl.crop) {
        const adubo = Math.floor(S.inv.adubo || 0);
        body = `<label class="toggle"><span>🪴 Adubar (usa 5 sc · cresce 33% mais rápido e +15% colheita)<br><small style="color:var(--muted)">Você tem ${adubo} sc de adubo</small></span>
          <input type="checkbox" id="fertChk" ${adubo >= 5 ? 'checked' : 'disabled'}></label>
          <div class="crop-grid">${Object.keys(CROPS).map((k) => {
            const c = CROPS[k];
            const lock = c.lvl > S.level ? `🔒 Nível ${c.lvl}` : c.cv > tractorCv() ? `🚜 Precisa ${c.cv} cv` : S.money < c.s ? 'Sem dinheiro' : '';
            const est = Math.round(c.y * (1 + (bestTractor() ? MACHINES[bestTractor()].bonus : 0)) * PRODUCTS[k].p * (S.mkt[k] ? S.mkt[k].m : 1));
            return `<button class="crop" data-act="plant" data-i="${i}" data-crop="${k}" ${lock ? 'disabled' : ''}>
              <span class="crop__ico">${PRODUCTS[k].i}</span><span class="crop__name">${cropName(k)}</span>
              <span class="crop__meta">⏱ ${dur(c.t / growSpeed())} · 🌱 ${money(c.s)}</span>
              ${lock ? `<span class="crop__lock">${lock}</span>` : `<span class="crop__meta up">vale ~${money(est)}</span>`}</button>`;
          }).join('')}</div>`;
      } else {
        const ready = pl.p >= 1;
        body = `<div class="card"><div class="item"><div class="item__ico item__ico--leaf">${PRODUCTS[pl.crop].i}</div><div class="item__main">
          <div class="item__title">${cropName(pl.crop)} ${pl.fert ? '<span class="pill pill--sun">adubado</span>' : ''}</div>
          <div class="item__sub" data-live="plottxt:${i}">${plotStatus(i)}</div></div></div>
          <div class="bar"><i data-live="plotbar:${i}" style="width:${(pl.p * 100).toFixed(1)}%"></i></div></div>
          <div style="height:12px"></div>
          ${ready ? `<button class="btn btn--leaf btn--block" data-act="harvest" data-i="${i}">Colher ~${harvestYield(i)} ${PRODUCTS[pl.crop].u}</button>`
            : `<button class="btn btn--clay btn--block" data-act="clear" data-i="${i}">Arrancar plantação</button>`}`;
      }
    } else {
      const z = sheetCtx.z;
      title = ZONES[z] ? ZONES[z].n : '';
      switch (z) {
        case 'sede': {
          const animals = Object.keys(ANIMALS).reduce((a, k) => a + S.animals[k].length, 0);
          title = S.name;
          body = `<div class="stats" style="margin-top:0">
              <div class="stat"><b>${S.level}</b><span>nível</span></div><div class="stat"><b>${S.harvests}</b><span>colheitas</span></div><div class="stat"><b>${animals}</b><span>animais</span></div></div>
            <div style="height:10px"></div>
            <div class="card"><div class="item__title">Total ganho</div><div class="item__sub">${money(S.earned)} desde o começo · clima de hoje: ${WEATHER[S.weather].i} ${WEATHER[S.weather].n}</div></div>
            <h3 class="h2">Como jogar</h3>
            <div class="card item__sub" style="line-height:1.55">🌱 Toque num campo para plantar; quando brilhar, toque de novo para colher.<br>
              🐄 Animais comem sozinhos do armazém: silagem para o pasto, grãos para porcos e galinhas.<br>
              🥚 Balões no mapa mostram ovos, leite e lã para recolher.<br>
              🚜 Tratores maiores liberam culturas pesadas e rendem mais.<br>
              📦 Entregue encomendas para ganhar mais que no mercado.<br>
              ⏳ A fazenda continua trabalhando por até 4 h com o app fechado.</div>
            <div class="btn-row" style="margin-top:14px"><button class="btn" data-act="rename">✏️ Renomear fazenda</button>
            <button class="btn btn--clay" data-act="reset">Recomeçar</button></div>`;
          break;
        }
        case 'galpao':
          body = `<div class="stack">${Object.keys(MACHINES).filter(owns).map(machineCard).join('') || '<div class="card empty">Galpão vazio.</div>'}</div>
            <div style="height:12px"></div><button class="btn btn--leaf btn--block" data-act="tab" data-tab="maquinas">Ir à concessionária</button>
            <h3 class="h2">Silo</h3><div class="card item"><div class="item__ico item__ico--leaf">🌿</div><div class="item__main"><div class="item__title">${num(S.inv.silagem || 0)} t de silagem</div><div class="item__sub">Comida do pasto. Plante “Milho p/ silagem”.</div></div></div>`;
          break;
        case 'pasto':
          body = `<div class="stack">${collectCard('leite', 'das vacas')}${collectCard('la', 'das ovelhas')}${['vaca', 'boi', 'cavalo', 'ovelha'].map(speciesCard).join('')}${penCard('pasto')}</div>`;
          break;
        case 'chiqueiro':
          body = `<div class="stack">${speciesCard('porco')}${penCard('chiqueiro')}</div>`;
          break;
        case 'galinheiro':
          body = `<div class="stack">${collectCard('ovo', 'no ninho')}${speciesCard('galinha')}${penCard('galinheiro')}</div>`;
          break;
        case 'tanque':
          body = `<div class="stack">${pondCard()}${penCard('tanque')}</div>`;
          break;
        case 'armazem': {
          const items = Object.keys(PRODUCTS).filter((k) => (S.inv[k] || 0) >= 1);
          body = `<div class="stack">${items.length ? items.map((k) => `<div class="card item"><div class="item__ico">${PRODUCTS[k].i}</div><div class="item__main"><div class="item__title">${PRODUCTS[k].n}</div>
            <div class="item__sub">${num(S.inv[k])} ${PRODUCTS[k].u} · ${brl2.format(price(k))}/${PRODUCTS[k].u}</div></div></div>`).join('') : '<div class="card empty">Armazém vazio.</div>'}</div>
            <div style="height:12px"></div><button class="btn btn--leaf btn--block" data-act="tab" data-tab="mercado">Vender no mercado</button>`;
          break;
        }
        default: body = '';
      }
    }
    $('#sheetTitle').textContent = title;
    const b = $('#sheetBody');
    const st = b.parentElement.scrollTop;
    b.innerHTML = body;
    b.parentElement.scrollTop = st;
  }

  /* ================= Atualização ao vivo ================= */
  function structSig() {
    return [
      S.plots.map((p) => `${p.crop}${p.p >= 1}`).join(), Math.floor(S.pend.ovo), Math.floor(S.pend.leite / 6), Math.floor(S.pend.la),
      S.fish.map((f) => f.g >= 1).join(), Math.round(S.fed.graos * 4), Math.round(S.fed.volumoso * 4), Math.round(S.fed.peixe * 4),
      S.level, S.weather, S.orders.map((o) => o.id + canDeliver(o)).join(),
      Object.keys(S.machines).map((k) => Math.round(S.machines[k].cond * 50)).join(),
      tab === 'animais' ? S.animals.boi.concat(S.animals.porco).map((a) => Math.round(a.g * 20)).join() : '',
      Math.floor(S.money / (S.money > 20000 ? 1000 : 100)),
    ].join('|');
  }
  let lastSig = '';
  function live() {
    document.querySelectorAll('[data-live]').forEach((el) => {
      const [k, a] = el.dataset.live.split(':');
      if (k === 'plotbar') el.style.width = `${(S.plots[+a].p * 100).toFixed(1)}%`;
      else if (k === 'plottxt') el.textContent = plotStatus(+a);
      else if (k === 'pend') el.textContent = `${num(S.pend[a])} ${PRODUCTS[a].u} esperando`;
    });
    renderHeader();
    const sig = structSig();
    if (sig !== lastSig) {
      lastSig = sig;
      // não redesenha enquanto o jogador está escolhendo uma semente
      if (!(sheetCtx && sheetCtx.type === 'plot' && !S.plots[sheetCtx.i].crop)) render();
    }
    if (tab === 'fazenda') updateMap();
    if (dayChanged) {
      dayChanged = false;
      toast(`🌅 Dia ${Math.floor(S.time / DAY_LEN) + 1} · ${WEATHER[S.weather].i} ${WEATHER[S.weather].n}${S.weather === 'chuva' ? ' — lavouras crescem mais rápido' : ''}. Preços do mercado mudaram.`, '', 3500);
      if (tab === 'fazenda') updateMap(true);
    }
  }
  function afterAction() {
    save();
    lastSig = structSig();
    render();
  }

  function toast(msg, kind, ms) {
    const el = document.createElement('div');
    el.className = `toast${kind ? ' toast--' + kind : ''}`;
    el.textContent = msg;
    const box = $('#toasts');
    box.appendChild(el);
    while (box.children.length > 3) box.firstChild.remove();
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 320); }, ms || 2400);
  }

  /* ================= Início ================= */
  function catchUp() {
    let dt = Math.min(OFFLINE_MAX, Math.max(0, (Date.now() - S.savedAt) / 1000));
    const away = dt;
    while (dt > 0) { const c = Math.min(dt, 20); step(c); dt -= c; }
    return away;
  }

  const existed = load();
  const away = existed ? catchUp() : 0;
  dayChanged = false;

  document.addEventListener('click', (e) => {
    if (e.target.closest('#mapSvg')) { onMapClick(e); return; }
    const b = e.target.closest('[data-act]');
    if (!b || b.disabled) return;
    const fn = ACTIONS[b.dataset.act];
    if (!fn) return;
    fn(b.dataset);
    if (!['close-sheet', 'tab', 'open-zone', 'open-plot'].includes(b.dataset.act)) afterAction();
  });
  document.querySelectorAll('.tab').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); setTab(b.dataset.tab); }));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && sheetCtx) closeSheet(); });

  let lastReal = Date.now();
  setInterval(() => {
    const now = Date.now();
    let dt = Math.min(OFFLINE_MAX, (now - lastReal) / 1000);
    lastReal = now;
    while (dt > 0) { const c = Math.min(dt, 20); step(c); dt -= c; }
  }, 250);
  setInterval(live, 600);
  setInterval(save, 5000);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
  window.addEventListener('pagehide', save);

  setTab('fazenda');
  if (!existed) setTimeout(() => toast('🌾 Bem-vindo à sua fazenda! Toque no campo brilhando para colher a alface.', 'good', 4500), 600);
  else if (away > 90) setTimeout(() => toast(`⏳ Sua fazenda trabalhou por ${dur(away)} enquanto você esteve fora.`, 'good', 4000), 600);
})();
