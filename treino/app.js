/* Fibrafit — treinador visual de musculação. Tudo fica salvo no aparelho (localStorage). */
(() => {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const store = (fn) => { try { return fn(); } catch { return null; } };
  const { GROUPS, EQUIPS, LIB } = window.KDATA;

  /* ================================================================
     Plano automático (objetivo × dias × nível)
     ================================================================ */
  const GOALS = {
    massa: { label: 'Ganho de massa muscular', short: 'Ganho de massa', dot: '#3b82f6', comp: '6-10', acc: '10-12', restC: 120, restA: 75, int: 'Intensidade moderada a alta' },
    forca: { label: 'Força', short: 'Força', dot: '#22c55e', comp: '4-6', acc: '8-10', restC: 180, restA: 90, int: 'Intensidade alta' },
    cond: { label: 'Condicionamento', short: 'Condicionamento', dot: '#f97316', comp: '12-15', acc: '15', restC: 60, restA: 45, int: 'Intensidade moderada · ritmo acelerado' },
    manut: { label: 'Manutenção', short: 'Manutenção', dot: '#d1d5db', comp: '8-12', acc: '10-12', restC: 90, restA: 60, int: 'Intensidade moderada' },
  };
  const LEVELS = {
    ini: { label: 'Iniciante', desc: 'Treino há menos de 6 meses ou estou voltando agora', n: 5, setsC: 3, setsA: 3, plank: '30' },
    int: { label: 'Intermediário', desc: 'Treino com regularidade há 6 meses a 2 anos', n: 6, setsC: 4, setsA: 3, plank: '45' },
    adv: { label: 'Avançado', desc: 'Treino há mais de 2 anos e domino a técnica', n: 7, setsC: 4, setsA: 3, plank: '60' },
  };
  // Dias de treino: listas em ordem de prioridade (o nível corta do fim).
  const DAYS = {
    fbA: ['agachamento', 'supino-reto', 'remada-curvada', 'desenvolvimento-halter', 'stiff', 'rosca-direta', 'triceps-corda', 'prancha'],
    fbB: ['leg-press', 'supino-inclinado-halter', 'puxada-frente', 'elevacao-lateral', 'mesa-flexora', 'elevacao-pelvica', 'abdominal-supra'],
    fbC: ['agachamento-goblet', 'supino-reto-halter', 'remada-baixa', 'desenvolvimento-maquina', 'terra-romeno', 'rosca-martelo', 'triceps-pulley'],
    push: ['supino-reto', 'supino-inclinado-halter', 'desenvolvimento-halter', 'crossover', 'elevacao-lateral', 'triceps-corda', 'triceps-frances'],
    pull: ['barra-fixa', 'remada-curvada', 'remada-baixa', 'face-pull', 'rosca-direta', 'rosca-martelo', 'encolhimento'],
    legs: ['agachamento', 'leg-press', 'terra-romeno', 'cadeira-extensora', 'mesa-flexora', 'elevacao-pelvica', 'panturrilha-pe'],
    pushB: ['supino-inclinado', 'desenvolvimento-barra', 'supino-reto-halter', 'peck-deck', 'elevacao-lateral', 'paralelas', 'triceps-testa'],
    pullB: ['puxada-frente', 'remada-unilateral', 'remada-maquina', 'pulldown', 'face-pull', 'rosca-alternada', 'rosca-scott'],
    legsB: ['agachamento-bulgaro', 'leg-press', 'stiff', 'cadeira-flexora', 'cadeira-extensora', 'panturrilha-sentado', 'elevacao-pernas'],
    upA: ['supino-reto', 'remada-curvada', 'desenvolvimento-halter', 'puxada-frente', 'elevacao-lateral', 'rosca-direta', 'triceps-corda'],
    upB: ['supino-inclinado-halter', 'remada-unilateral', 'desenvolvimento-maquina', 'pulldown', 'face-pull', 'rosca-martelo', 'triceps-testa'],
    lowA: ['agachamento', 'stiff', 'leg-press', 'mesa-flexora', 'cadeira-extensora', 'panturrilha-pe', 'prancha'],
    lowB: ['levantamento-terra', 'elevacao-pelvica', 'afundo', 'cadeira-flexora', 'cadeira-abdutora', 'panturrilha-sentado', 'elevacao-pernas'],
  };
  const SPLITS = { 2: ['fbA', 'fbB'], 3: ['push', 'pull', 'legs'], 3.1: ['fbA', 'fbB', 'fbC'], 4: ['upA', 'lowA', 'upB', 'lowB'], 5: ['push', 'pull', 'legs', 'upB', 'lowB'], 6: ['push', 'pull', 'legs', 'pushB', 'pullB', 'legsB'] };
  // Para quem está começando: versões mais fáceis de aprender.
  const EASY = { agachamento: 'agachamento-goblet', 'barra-fixa': 'puxada-frente', 'remada-curvada': 'remada-baixa', 'levantamento-terra': 'terra-romeno', 'desenvolvimento-barra': 'desenvolvimento-maquina', paralelas: 'supino-maquina', 'agachamento-bulgaro': 'afundo' };

  function buildPlan(p) {
    const g = GOALS[p.goal], lv = LEVELS[p.level];
    const split = SPLITS[p.days === 3 && p.level === 'ini' ? 3.1 : p.days];
    return split.map((key, d) => {
      let ids = DAYS[key].map((id) => (p.level === 'ini' && EASY[id] ? EASY[id] : id));
      ids = [...new Set(ids)].slice(0, lv.n);
      const items = ids.map((id) => {
        const e = ex(id);
        let sets = e.c ? lv.setsC : lv.setsA;
        if (p.goal === 'manut') sets = Math.max(2, sets - 1);
        let reps = e.c ? g.comp : g.acc;
        let rest = e.c ? g.restC : g.restA;
        if (e.kind === 't') { reps = lv.plank; rest = 45; sets = 3; }
        else if (e.group === 'Abdômen' || e.group === 'Panturrilha') { reps = '12-15'; rest = 45; }
        return { ex: id, sets, reps, rest };
      });
      if (g === GOALS.cond) items.push({ ex: d % 2 ? 'bicicleta' : 'esteira', sets: 1, reps: '600', rest: 0 });
      return { id: uid(), plan: true, name: `Treino ${String.fromCharCode(65 + d)}`, intensity: g.int, items };
    });
  }

  /* ================================================================
     Estado
     ================================================================ */
  const KEY = 'fibrafit-v1';
  const blank = () => ({
    v: 2, profile: null, exercises: [], routines: [], workouts: [], active: null, body: [], seen: {},
    settings: { theme: 'auto', rest: 90, sound: true, notify: true },
  });
  let state = blank();
  const loaded = store(() => JSON.parse(localStorage.getItem(KEY))) || store(() => JSON.parse(localStorage.getItem('fibra-v1'))) || store(() => JSON.parse(localStorage.getItem('kinora-v1'))) || store(() => JSON.parse(localStorage.getItem('forja-v1')));
  if (loaded && loaded.workouts) state = { ...blank(), ...loaded, v: 2, settings: { ...blank().settings, ...(loaded.settings || {}) } };
  const save = () => store(() => localStorage.setItem(KEY, JSON.stringify(state)));
  const goal = () => (state.profile ? state.profile.days : 3);

  const ui = { tab: 'inicio', liveOpen: false, libGroup: '', libQ: '', progEx: '', treinos: 'plano', meas: 'kg', onb: null };

  const exMap = () => { const m = new Map(LIB.map((e) => [e.id, e])); state.exercises.forEach((e) => m.set(e.id, e)); return m; };
  let EXM = exMap();
  const ex = (id) => EXM.get(id) || { id, name: 'Exercício removido', group: 'Outro', equip: 'Outro', kind: 'w', steps: [], errors: [] };
  const allEx = () => [...EXM.values()];

  /* ---------------- Formatação ---------------- */
  const nf1 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });
  const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
  const kg = (n) => `${nf1.format(n)} kg`;
  const bigKg = (n) => (n >= 10000 ? `${nf1.format(n / 1000)} t` : kg(Math.round(n)));
  const fDay = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
  const fDate = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  const fShort = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' });
  const fMonth = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });
  const fTime = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const clock = (ms) => {
    const s = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
    return h ? `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}` : `${m}:${String(ss).padStart(2, '0')}`;
  };
  const dur = (ms) => { const m = Math.round(ms / 60000); return m >= 60 ? `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}` : `${m} min`; };
  const secTxt = (s) => (s >= 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : `${s}s`);
  const repsTxt = (e, reps) => (e.kind === 't' ? (Number(reps) >= 120 ? `${Math.round(Number(reps) / 60)} min` : `${reps}s`) : `${reps} reps`);
  const parseNum = (v) => { const n = parseFloat(String(v ?? '').replace(',', '.')); return Number.isFinite(n) ? n : null; };
  const dayKey = (d) => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
  const weekStart = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const initials = (name) => (name || '?').split(/\s+/).filter((w) => w.length > 2).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || (name || '?').slice(0, 2).toUpperCase();
  const firstName = () => ((state.profile && state.profile.name) || '').trim().split(/\s+/)[0] || '';

  /* ---------------- Cálculos ---------------- */
  const e1rm = (w, r) => (!w || !r ? 0 : r === 1 ? w : w * (1 + r / 30)); // 1RM estimado (Epley)
  const counts = (s) => s.done && s.t !== 'w';
  const setVol = (s) => (counts(s) ? (s.w || 0) * (s.r || 0) : 0);
  const workoutVol = (w) => w.items.reduce((a, i) => (ex(i.ex).kind === 't' ? a : a + i.sets.reduce((b, s) => b + setVol(s), 0)), 0);
  const workoutSets = (w) => w.items.reduce((a, i) => a + i.sets.filter(counts).length, 0);
  const sorted = () => [...state.workouts].sort((a, b) => b.start - a.start);

  function bests(skipId, beforeTs = Infinity) {
    const m = {};
    for (const w of state.workouts) {
      if (w.id === skipId || w.start >= beforeTs) continue;
      for (const i of w.items) {
        const b = m[i.ex] || (m[i.ex] = { e1rm: 0, w: 0, r: 0 });
        for (const s of i.sets) {
          if (!counts(s)) continue;
          b.e1rm = Math.max(b.e1rm, e1rm(s.w, s.r)); b.w = Math.max(b.w, s.w || 0); b.r = Math.max(b.r, s.r || 0);
        }
      }
    }
    return m;
  }
  function lastSets(exId, skipId) {
    for (const w of sorted()) {
      if (w.id === skipId) continue;
      const i = w.items.find((x) => x.ex === exId);
      if (i) return i.sets.filter((s) => s.done);
    }
    return [];
  }
  // Semanas seguidas com pelo menos um treino (a semana atual conta se já treinou).
  function activeWeeks() {
    const set = new Set(state.workouts.map((w) => weekStart(w.start).getTime()));
    let wk = weekStart(Date.now());
    if (!set.has(wk.getTime())) wk = addDays(wk, -7);
    let n = 0;
    while (set.has(wk.getTime())) { n++; wk = addDays(wk, -7); }
    return n;
  }
  // Quanto a carga subiu desde o começo (média dos exercícios com 2+ sessões).
  function loadGain() {
    const by = {};
    [...state.workouts].sort((a, b) => a.start - b.start).forEach((w) => w.items.forEach((i) => {
      if (ex(i.ex).kind !== 'w') return;
      const top = Math.max(0, ...i.sets.filter(counts).map((s) => e1rm(s.w, s.r)));
      if (top > 0) (by[i.ex] = by[i.ex] || []).push(top);
    }));
    const r = Object.values(by).filter((a) => a.length >= 2).map((a) => a[a.length - 1] / a[0] - 1);
    return r.length ? Math.round((r.reduce((x, y) => x + y, 0) / r.length) * 100) : null;
  }

  /* ---------------- Ficha: grupos, tempo e intensidade ---------------- */
  const LEGS = ['Quadríceps', 'Posterior', 'Glúteos', 'Panturrilha'];
  const nSets = (i) => (Array.isArray(i.sets) ? i.sets.length : Number(i.sets) || 1);
  function groupsLabel(items) {
    const c = {};
    items.forEach((i) => {
      const g0 = ex(i.ex).group;
      if (g0 === 'Abdômen' || g0 === 'Cardio') return;
      const g = LEGS.includes(g0) ? 'Pernas' : g0;
      c[g] = (c[g] || 0) + nSets(i);
    });
    const list = Object.entries(c).sort((a, b) => b[1] - a[1]);
    if (!list.length) return items.length ? ex(items[0].ex).group : 'Treino livre';
    const tot = list.reduce((a, [, n]) => a + n, 0);
    const main = list.filter(([, n]) => n / tot >= 0.15);
    if (main.length >= 4) return 'Corpo inteiro';
    const order = ['Peito', 'Costas', 'Ombros', 'Pernas', 'Bíceps', 'Tríceps'];
    return (main.length ? main : list.slice(0, 1)).slice(0, 3).map(([g]) => g).sort((a, b) => order.indexOf(a) - order.indexOf(b)).join(' + ');
  }
  function estMin(items) {
    let s = 300;
    items.forEach((i) => {
      const e = ex(i.ex);
      const reps = parseNum(String(i.reps || '10').split('-').pop()) || 10;
      const work = e.kind === 't' ? reps : reps * 3.5;
      const n = Number(i.sets) || 3;
      s += n * work + Math.max(0, n - 1) * (Number(i.rest) || 0) + 60;
    });
    return Math.max(10, Math.round(s / 300) * 5);
  }
  function intensity(r) {
    if (r.intensity) return r.intensity;
    const reps = r.items.map((i) => parseNum(String(i.reps || '10').split('-')[0]) || 10);
    const avg = reps.reduce((a, b) => a + b, 0) / (reps.length || 1);
    return avg <= 6 ? 'Intensidade alta' : avg >= 12 ? 'Intensidade moderada · ritmo acelerado' : 'Intensidade moderada';
  }
  function nextRoutine() {
    if (!state.routines.length) return null;
    const last = sorted().find((w) => w.routineId && state.routines.some((r) => r.id === w.routineId));
    if (!last) return state.routines[0];
    const idx = state.routines.findIndex((r) => r.id === last.routineId);
    return state.routines[(idx + 1) % state.routines.length];
  }

  /* ---------------- Aviso rápido e tema ---------------- */
  let toastT;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600);
  }
  function applyTheme() {
    const t = state.settings.theme;
    if (t === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t);
  }

  /* ---------------- Ícones ---------------- */
  const I = {
    play: '<svg viewBox="0 0 24 24"><path d="M7 4.5v15a1 1 0 0 0 1.5.9l12-7.5a1 1 0 0 0 0-1.8l-12-7.5A1 1 0 0 0 7 4.5Z"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    dots: '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/></svg>',
    up: '<svg viewBox="0 0 24 24"><path d="m6 15 6-6 6 6"/></svg>',
    down: '<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>',
    x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    trophy: '<svg viewBox="0 0 24 24" style="width:13px;height:13px"><path d="M8 4h8v5a4 4 0 0 1-8 0V4ZM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8"/></svg>',
  };

  /* ---------------- Imagem do exercício ----------------
     Se o exercício tiver uma mídia licenciada (campo "media": GIF, WebP ou vídeo), ela é usada.
     Senão, a figura animada desenhada pelo app (anim.js). */
  const isVideo = (u) => /\.(mp4|webm)(\?|$)/i.test(u || '');
  function vis(e, cls = '', k = 0.6) {
    if (e.media) return isVideo(e.media) ? `<video class="kmedia ${cls}" src="${esc(e.media)}" muted playsinline loop autoplay></video>` : `<img class="kmedia ${cls}" src="${esc(e.media)}" alt="" loading="lazy">`;
    if (e.anim && window.Kfig.has(e.anim)) return window.Kfig.svg(e.anim, k, { cls: `thumb ${cls}` });
    return `<div class="nofig ${cls}">${initials(e.name)}</div>`;
  }
  function mountPlayer(el, e, opt = {}) {
    if (e.media) {
      el.innerHTML = vis(e);
      const v = $('video', el);
      return { setSlow: (on) => { if (v) v.playbackRate = on ? 0.4 : 1; }, pause: () => v && v.pause(), play: () => v && v.play(), show: () => {}, media: true, canSlow: !!v };
    }
    if (e.anim && window.Kfig.has(e.anim)) return window.Kfig.mount(el, e.anim, { label: `Animação: ${e.name}`, ...opt });
    el.innerHTML = `<div class="nofig" style="aspect-ratio:6/5">${initials(e.name)}</div>`;
    return null;
  }

  /* ================================================================
     Abas
     ================================================================ */
  const TABS = { inicio: 'Fibrafit', treinos: 'Treinos', exercicios: 'Exercícios', evolucao: 'Evolução', perfil: 'Perfil' };
  function setTab(tab) {
    ui.tab = tab;
    $$('.tab').forEach((b) => b.setAttribute('aria-current', b.dataset.tab === tab ? 'page' : 'false'));
    render();
    window.scrollTo({ top: 0 });
  }
  $$('.tab').forEach((b) => b.addEventListener('click', () => setTab(b.dataset.tab)));
  $('#btnProfile').addEventListener('click', () => setTab('perfil'));

  function render() {
    const v = $('#view');
    $('#topTitle').textContent = TABS[ui.tab];
    $('#topSub').textContent = ui.tab === 'inicio' ? 'Seu treinador visual' : '';
    $('#btnProfile').textContent = initials(firstName() || 'F').slice(0, 1);
    if (ui.tab === 'inicio') v.innerHTML = viewInicio();
    else if (ui.tab === 'treinos') v.innerHTML = viewTreinos();
    else if (ui.tab === 'exercicios') v.innerHTML = viewExercicios();
    else if (ui.tab === 'evolucao') { v.innerHTML = viewEvolucao(); mountCharts(); }
    else v.innerHTML = viewPerfil();
    updateResume();
  }

  /* ---------------- Início ---------------- */
  const totalSets = (r) => r.items.reduce((a, i) => a + Number(i.sets || 0), 0);
  function routineCard(r, opts = {}) {
    return `<div class="card routine">
      <div class="routine__body">
        <div class="routine__name">${esc(r.name)} ${opts.next ? '<span class="tag">PRÓXIMO</span>' : ''}</div>
        <div class="routine__groups">${esc(groupsLabel(r.items))}</div>
        <div class="routine__meta"><span>${r.items.length} exercícios</span><span>~${estMin(r.items)} min</span><span>${totalSets(r)} séries</span></div>
        <div class="routine__figs">${r.items.slice(0, 5).map((i) => vis(ex(i.ex))).join('')}</div>
      </div>
      <div class="routine__actions">
        <button class="play" type="button" data-act="start" data-id="${r.id}" aria-label="Começar ${esc(r.name)}">${I.play}</button>
        <button class="mini-btn" type="button" data-act="edit-routine" data-id="${r.id}">Editar</button>
      </div>
    </div>`;
  }
  function viewInicio() {
    const name = firstName();
    const ws = weekStart(Date.now());
    const week = state.workouts.filter((w) => w.start >= ws.getTime());
    const days = new Set(week.map((w) => dayKey(w.start)));
    const today = dayKey(Date.now());
    const doneToday = state.workouts.filter((w) => dayKey(w.start) === today);
    const r = nextRoutine();
    const gain = loadGain();
    let card;
    if (state.active) {
      card = `<section class="today"><div class="today__tag">● TREINO EM ANDAMENTO</div><div class="today__name">${esc(state.active.name)}</div>
        <div class="today__meta"><span>${state.active.items.length} exercícios</span><span>${workoutSets({ items: state.active.items })} séries feitas</span></div>
        <button class="btn btn--primary btn--block btn--lg" style="margin-top:16px" data-act="open-live">CONTINUAR TREINO</button></section>`;
    } else if (doneToday.length) {
      const w = doneToday[doneToday.length - 1];
      card = `<section class="today today--done"><div class="today__tag">✓ TREINO DE HOJE CONCLUÍDO</div><div class="today__name">${esc(w.name)}</div>
        <div class="today__meta"><span>${dur(w.end - w.start)}</span><span>${bigKg(workoutVol(w))} de volume</span><span>${workoutSets(w)} séries</span></div>
        ${r ? `<div class="today__int">Próximo: ${esc(r.name)} · ${esc(groupsLabel(r.items))}</div>` : ''}
        <button class="today__swap" data-act="workout" data-id="${w.id}">Ver detalhes do treino ›</button></section>`;
    } else if (r) {
      card = `<section class="today">
        <div class="today__tag">TREINO DO DIA</div>
        <div class="today__name">${esc(r.name)}</div>
        <div class="today__groups">${esc(groupsLabel(r.items))}</div>
        <div class="today__meta"><span>${r.items.length} exercícios</span><span>•</span><span>~${estMin(r.items)} minutos</span><span>•</span><span>${totalSets(r)} séries</span></div>
        <div class="today__int">🔥 ${esc(intensity(r))}</div>
        <div class="today__figs">${r.items.slice(0, 4).map((i) => `<div class="today__fig">${vis(ex(i.ex))}</div>`).join('')}</div>
        <button class="btn btn--primary btn--block btn--lg" data-act="start" data-id="${r.id}">▶ COMEÇAR TREINO</button>
        ${state.routines.length > 1 ? '<button class="today__swap" data-act="swap-today">Trocar treino</button>' : ''}
      </section>`;
    } else {
      card = `<section class="today"><div class="today__tag">VAMOS COMEÇAR</div><div class="today__name">Monte seu plano</div>
        <p style="opacity:.8;margin-top:6px">Responda 4 perguntas e o Fibrafit sugere uma rotina para você.</p>
        <button class="btn btn--primary btn--block btn--lg" style="margin-top:16px" data-act="onboard">Montar meu plano</button></section>`;
    }
    const labels = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
    const dayHtml = labels.map((l, i) => {
      const k = dayKey(addDays(ws, i));
      return `<div class="week__d ${days.has(k) ? 'done' : ''} ${k === today ? 'is-today' : ''}">${l}<i>${days.has(k) ? I.check : ''}</i></div>`;
    }).join('');
    // Um exercício para aprender: o próximo do treino cujo guia a pessoa ainda não viu.
    const learnId = (r && r.items.map((i) => i.ex).find((id) => !state.seen[id] && ex(id).steps?.length)) || LIB[new Date().getDate() % LIB.length].id;
    const le = ex(learnId);
    return `
      <div class="hello"><h2>Olá${name ? `, ${esc(name)}` : ''} 👋</h2><p>${state.active ? 'Seu treino está esperando.' : doneToday.length ? 'Mandou bem hoje. Descanse e volte amanhã.' : 'Pronto para o treino de hoje?'}</p></div>
      ${card}
      <div class="sec-title"><h2>Esta semana</h2><span class="fine">${week.length} de ${goal()} treinos</span></div>
      <div class="card"><div class="week"><div class="week__days">${dayHtml}</div></div></div>
      <div class="sec-title"><h2>Sua evolução</h2><button class="link" data-tab-go="evolucao">Ver tudo</button></div>
      <div class="stats3">
        <div class="stat3"><span class="e">🏋️</span><b>${state.workouts.length}</b><span>treinos</span></div>
        <div class="stat3"><span class="e">🔥</span><b>${activeWeeks()}</b><span>semanas seguidas</span></div>
        <div class="stat3"><span class="e">📈</span><b>${gain === null ? '—' : `${gain >= 0 ? '+' : ''}${gain}%`}</b><span>carga média</span></div>
      </div>
      <div class="sec-title"><h2>Aprenda a técnica</h2></div>
      <button class="card learn" data-act="guide" data-id="${le.id}">
        <span class="learn__fig">${vis(le)}</span>
        <span class="learn__body"><small>COMO FAZER</small><b>${esc(le.name)}</b><span>Veja o movimento, o passo a passo e os erros a evitar.</span></span>
      </button>`;
  }

  /* ---------------- Treinos (plano + histórico) ---------------- */
  function viewTreinos() {
    const p = state.profile;
    const seg = `<div class="seg"><button data-seg="plano" aria-pressed="${ui.treinos === 'plano'}">Meu plano</button><button data-seg="historico" aria-pressed="${ui.treinos === 'historico'}">Histórico</button></div>`;
    if (ui.treinos === 'historico') return seg + viewHistorico();
    const next = nextRoutine();
    const head = p ? `<div class="card plan-chip"><span class="choice__dot" style="background:${GOALS[p.goal].dot}"></span><div class="plan-chip__body"><b>${esc(GOALS[p.goal].short)}</b><span>${p.days}× por semana · ${LEVELS[p.level].label}</span></div><button class="btn btn--sm" data-act="onboard-redo">Ajustar</button></div>`
      : '<div class="card plan-chip"><div class="plan-chip__body"><b>Sem plano ainda</b><span>Responda 4 perguntas e receba uma rotina sugerida.</span></div><button class="btn btn--primary btn--sm" data-act="onboard">Montar</button></div>';
    const list = state.routines.map((r) => routineCard(r, { next: next && r.id === next.id && state.workouts.length })).join('');
    return `${seg}${head}
      <div class="sec-title"><h2>Fichas</h2><div><button class="link" data-act="templates">Modelos</button> · <button class="link" data-act="new-routine">+ Nova</button></div></div>
      ${list || '<div class="card empty"><b>Nenhuma ficha</b>Monte seu plano, use um modelo ou crie a sua.</div>'}
      <button class="btn btn--soft btn--block" data-act="start-empty">+ Começar treino livre</button>`;
  }
  function workoutCard(w, prs) {
    const lines = w.items.slice(0, 5).map((i) => {
      const done = i.sets.filter((s) => s.done);
      const best = done.filter((s) => s.t !== 'w').sort((a, b) => e1rm(b.w, b.r) - e1rm(a.w, a.r))[0];
      const k = ex(i.ex).kind;
      return `<div>${done.length}× ${esc(ex(i.ex).name)} ${best ? `<span>· ${k === 't' ? secTxt(best.r) : `${best.w ? nf1.format(best.w) + ' kg × ' : ''}${best.r}`}</span>` : ''}</div>`;
    }).join('');
    const more = w.items.length > 5 ? `<div><span>+ ${w.items.length - 5} exercícios</span></div>` : '';
    return `<button class="card hist" type="button" data-act="workout" data-id="${w.id}">
      <div class="hist__top"><span class="hist__name">${esc(w.name)}</span><span class="hist__date">${fDay.format(w.start)}</span></div>
      <div class="hist__stats"><span><b>${dur(w.end - w.start)}</b></span><span><b>${bigKg(workoutVol(w))}</b> volume</span><span><b>${workoutSets(w)}</b> séries</span>${prs ? `<span class="badge-pr">${I.trophy} ${prs} recorde${prs > 1 ? 's' : ''}</span>` : ''}</div>
      <div class="hist__ex">${lines}${more}</div></button>`;
  }
  function prCounts() {
    const best = {}, out = {};
    [...state.workouts].sort((a, b) => a.start - b.start).forEach((w) => {
      let n = 0;
      for (const i of w.items) {
        const top = Math.max(0, ...i.sets.filter(counts).map((s) => e1rm(s.w, s.r)));
        if (best[i.ex] !== undefined && top > best[i.ex] && ex(i.ex).kind !== 't') n++;
        best[i.ex] = Math.max(best[i.ex] ?? 0, top);
      }
      out[w.id] = n;
    });
    return out;
  }
  function viewHistorico() {
    const list = sorted();
    if (!list.length) return '<div class="card empty"><b>Nenhum treino registrado</b>Quando você finalizar um treino, ele aparece aqui.</div>';
    const prs = prCounts();
    let html = '', month = '';
    for (const w of list) {
      const m = fMonth.format(w.start);
      if (m !== month) { const n = list.filter((x) => fMonth.format(x.start) === m).length; html += `<div class="month">${m} · ${n} treino${n > 1 ? 's' : ''}</div>`; month = m; }
      html += workoutCard(w, prs[w.id]);
    }
    return html;
  }
  const setText = (e, s) => (e.kind === 't' ? `${s.w ? `${nf1.format(s.w)} kg · ` : ''}${secTxt(s.r || 0)}` : e.kind === 'bw' ? `${s.r} reps${s.w ? ` · +${nf1.format(s.w)} kg` : ''}` : `${nf1.format(s.w || 0)} kg × ${s.r}`);
  function openWorkout(id) {
    const w = state.workouts.find((x) => x.id === id);
    if (!w) return;
    const prev = bests(w.id, w.start);
    showInfo(w.name, `
      <div class="stat-grid"><div class="stat"><small>Duração</small><b>${dur(w.end - w.start)}</b></div><div class="stat"><small>Volume</small><b>${bigKg(workoutVol(w))}</b></div><div class="stat"><small>Séries</small><b>${workoutSets(w)}</b></div></div>
      <p class="fine">${fDay.format(w.start)} · ${fTime.format(w.start)}–${fTime.format(w.end)}</p>
      ${w.items.map((i) => {
        const e = ex(i.ex);
        let n = 0;
        return `<div class="detail-ex"><h3>${esc(e.name)}</h3>${i.note ? `<p class="fine" style="margin:-2px 0 6px">${esc(i.note)}</p>` : ''}
          <div class="detail-sets">${i.sets.filter((s) => s.done).map((s) => {
            const lbl = s.t === 'w' ? 'A' : s.t === 'd' ? 'D' : String(++n);
            const pr = counts(s) && e.kind !== 't' && prev[i.ex] && e1rm(s.w, s.r) > prev[i.ex].e1rm;
            return `<span class="k">${lbl}</span><span>${setText(e, s)}${pr ? ' <span class="pr-tag">PR</span>' : ''}</span><span class="e">${e.kind === 'w' && s.r ? `1RM ≈ ${nf0.format(e1rm(s.w, s.r))}` : ''}</span>`;
          }).join('')}</div></div>`;
      }).join('')}
      <div class="actions"><button type="button" class="btn btn--soft" data-act="repeat" data-id="${w.id}">Repetir treino</button><button type="button" class="btn" data-act="save-as-routine" data-id="${w.id}">Salvar como ficha</button></div>
      <button type="button" class="btn btn--danger-ghost btn--block" data-act="delete-workout" data-id="${w.id}">Excluir treino</button>`);
  }
  function showInfo(title, html) {
    $('#infoTitle').textContent = title;
    $('#infoBody').innerHTML = html;
    const d = $('#dlgInfo');
    if (!d.open) d.showModal();
    $('#infoBody').parentElement.scrollTop = 0;
  }

  /* ---------------- Exercícios ---------------- */
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  function viewExercicios() {
    return `<div class="lib-head">
      <div class="search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input type="search" id="libQ" placeholder="Buscar entre ${allEx().length} exercícios" value="${esc(ui.libQ)}" autocomplete="off"></div>
      <div class="chips">${['', ...GROUPS].map((g) => `<button type="button" class="chip" data-act="lib-group" data-g="${g}" aria-pressed="${ui.libGroup === g}">${g || 'Todos'}</button>`).join('')}</div>
    </div>
    <div id="libList">${libList()}</div>
    <button class="btn btn--soft btn--block" style="margin-top:16px" data-act="new-ex">+ Criar exercício</button>`;
  }
  function libList() {
    const q = norm(ui.libQ.trim());
    const list = allEx().filter((e) => (!ui.libGroup || e.group === ui.libGroup) && (!q || norm(e.name).includes(q)));
    let html = '';
    for (const g of GROUPS) {
      const items = list.filter((e) => e.group === g);
      if (!items.length) continue;
      html += `<div class="lib-group">${g}</div><div class="ex-grid">${items.map((e) => `<button class="ex-tile" type="button" data-act="guide" data-id="${e.id}">${vis(e)}<span class="ex-tile__b"><b>${esc(e.name)}</b><span>${esc(e.equip)}</span></span></button>`).join('')}</div>`;
    }
    return html || '<div class="empty"><b>Nada encontrado</b>Crie esse exercício no botão abaixo.</div>';
  }

  /* ---------------- Guia do exercício ---------------- */
  let guidePlayer = null;
  function legendHtml(e) {
    if (!e.anim || !window.Kfig.has(e.anim) || e.media) return '';
    const k = window.Kfig.kinds(e.anim);
    const items = ['<span class="l-hl"><i></i><em>Músculos trabalhados</em></span>'];
    if (k.has('path')) items.push('<span class="l-ok"><i></i><em>Movimento correto</em></span>');
    if (k.has('limit')) items.push('<span class="l-bad"><i></i><em>Não ultrapasse esta linha</em></span>');
    if (k.has('core')) items.push('<span class="l-warn"><i></i><em>Mantenha o abdômen estabilizado</em></span>');
    if (k.has('pin')) items.push('<span class="l-ok">◯ <em>Ponto fixo: não mexa</em></span>');
    return `<div class="legend">${items.join('')}</div>`;
  }
  function exHistory(id) {
    return [...state.workouts].sort((a, b) => a.start - b.start).map((w) => ({ w, i: w.items.find((x) => x.ex === id) })).filter((x) => x.i && x.i.sets.some(counts));
  }
  // Tabela "Semana · Carga · Reps" com a melhor série de cada semana.
  function weekTable(id) {
    const e = ex(id);
    const hist = exHistory(id);
    if (!hist.length) return '';
    const weeks = new Map();
    hist.forEach(({ w, i }) => {
      const k = weekStart(w.start).getTime();
      const ss = i.sets.filter(counts);
      const score = (s) => (e.kind === 'w' ? e1rm(s.w, s.r) : s.r);
      const top = ss.reduce((m, s) => (score(s) > score(m) ? s : m), ss[0]);
      const cur = weeks.get(k);
      if (!cur || score(top) > cur.score) weeks.set(k, { s: top, score: score(top) });
    });
    const first = [...weeks.keys()][0];
    const rows = [...weeks.entries()].map(([k, v]) => ({ n: Math.round((k - first) / (7 * 864e5)) + 1, ...v }));
    return `<table class="wk-table"><thead><tr><th>Semana</th><th>${e.kind === 't' ? 'Tempo' : e.kind === 'bw' ? 'Extra' : 'Carga'}</th><th>${e.kind === 't' ? '' : 'Reps'}</th></tr></thead><tbody>
      ${rows.slice(-8).map((r, k, arr) => {
        const up = k > 0 && r.score > arr[k - 1].score;
        return `<tr><td>${r.n}</td><td class="${up ? 'up' : ''}">${e.kind === 't' ? secTxt(r.s.r) : `${nf1.format(r.s.w || 0)} kg`}${up ? ' ▲' : ''}</td><td>${e.kind === 't' ? '' : r.s.r}</td></tr>`;
      }).join('')}</tbody></table>`;
  }
  function openGuide(id) {
    const e = ex(id);
    const hist = exHistory(id);
    const b = bests()[id];
    const custom = state.exercises.some((x) => x.id === id);
    const mus = (e.mus || e.group).split(' · ');
    $('#guideTitle').textContent = e.name;
    $('#guideBody').innerHTML = `
      <div class="player"><div id="gPlayer"></div><span class="player__phase" id="gPhase">Posição inicial</span><span class="player__slow" id="gSlowTag" hidden>CÂMERA LENTA</span></div>
      <div class="player__ctl">
        <button type="button" class="btn btn--dark" id="gSlow">▶ Ver movimento em câmera lenta</button>
        <button type="button" class="btn" id="gPause">Pausar</button>
      </div>
      <div class="player__ctl" id="gPoses"><button type="button" class="btn btn--sm" data-pose="0">Posição inicial</button><button type="button" class="btn btn--sm" data-pose="1">Posição final</button></div>
      ${legendHtml(e)}
      <div class="muscles">${mus.map((m) => `<span>${esc(m)}</span>`).join('')}</div>
      ${e.steps?.length ? `<div class="guide-sec"><h3>Como executar</h3><ol class="steps">${e.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></div>` : ''}
      ${e.errors?.length ? `<div class="guide-sec"><h3>⚠️ Evite estes erros</h3><ul class="errors">${e.errors.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></div>` : ''}
      ${hist.length ? `<div class="guide-sec"><h3>Sua evolução</h3>
        <div class="stat-grid">${e.kind === 'w' ? `<div class="stat"><small>1RM estimado</small><b>${nf1.format(b.e1rm)}<em>kg</em></b></div>` : `<div class="stat"><small>${e.kind === 't' ? 'Maior tempo' : 'Mais reps'}</small><b>${e.kind === 't' ? secTxt(b.r) : b.r}</b></div>`}
          <div class="stat"><small>Maior carga</small><b>${nf1.format(b.w)}<em>kg</em></b></div><div class="stat"><small>Sessões</small><b>${hist.length}</b></div></div>
        <div class="chart" data-chart="ex" data-id="${id}" style="margin:14px 0 6px"></div>${weekTable(id)}</div>` : ''}
      ${custom ? `<button type="button" class="btn btn--danger-ghost btn--block" data-act="delete-ex" data-id="${id}">Excluir exercício</button>` : ''}
      <p class="disclaimer">Orientação geral de execução. Se sentir dor, pare. Com lesões ou limitações, procure um profissional.</p>`;
    const d = $('#dlgGuide');
    if (!d.open) d.showModal();
    $('#guideInner').scrollTop = 0;
    const phases = ['Posição inicial', 'Movimento', 'Posição final', 'Retorno'];
    guidePlayer = mountPlayer($('#gPlayer'), e, { onPhase: (ph) => { const t = $('#gPhase'); if (t) t.textContent = phases[ph]; } });
    if (!guidePlayer || guidePlayer.media) {
      $('#gPoses').hidden = true; $('#gPhase').hidden = true;
      if (!guidePlayer || !guidePlayer.canSlow) { $('#gSlow').hidden = true; $('#gPause').hidden = true; }
    }
    mountCharts($('#guideBody'));
  }
  $('#guideBody').addEventListener('click', (ev) => {
    const p = guidePlayer;
    if (!p) return;
    if (ev.target.closest('#gSlow')) {
      p.slow = !p.slow; p.setSlow(p.slow); p.play();
      $('#gSlow').textContent = p.slow ? '⏩ Velocidade normal' : '▶ Ver movimento em câmera lenta';
      $('#gSlowTag').hidden = !p.slow; $('#gPause').textContent = 'Pausar';
    } else if (ev.target.closest('#gPause')) {
      if (p.paused) { p.play(); $('#gPause').textContent = 'Pausar'; } else { p.pause(); $('#gPause').textContent = 'Continuar'; }
    } else if (ev.target.closest('[data-pose]')) {
      const k = +ev.target.closest('[data-pose]').dataset.pose;
      p.show(k); $('#gPause').textContent = 'Continuar';
      $('#gPhase').textContent = k ? 'Posição final' : 'Posição inicial';
    }
  });
  $('#dlgGuide').addEventListener('close', () => { if (guidePlayer && guidePlayer.destroy) guidePlayer.destroy(); guidePlayer = null; $('#guideBody').innerHTML = ''; });

  /* ---------------- Evolução ---------------- */
  const MEAS = [['kg', 'Peso', 'kg'], ['cintura', 'Cintura', 'cm'], ['quadril', 'Quadril', 'cm'], ['peito', 'Peito', 'cm'], ['braco', 'Braço', 'cm'], ['coxa', 'Coxa', 'cm'], ['gordura', 'Gordura', '%']];
  function viewEvolucao() {
    const now = Date.now();
    const ws = weekStart(now).getTime(), prevWs = addDays(ws, -7).getTime();
    const weekVol = state.workouts.filter((w) => w.start >= ws).reduce((a, w) => a + workoutVol(w), 0);
    const prevVol = state.workouts.filter((w) => w.start >= prevWs && w.start < ws).reduce((a, w) => a + workoutVol(w), 0);
    const delta = prevVol ? Math.round(((weekVol - prevVol) / prevVol) * 100) : null;
    const gain = loadGain();
    const totalTime = state.workouts.reduce((a, w) => a + (w.end - w.start), 0);
    const days = new Set(state.workouts.map((w) => dayKey(w.start)));
    const start = addDays(weekStart(now), -77);
    let heat = '';
    for (let c = 0; c < 12; c++) {
      heat += '<div class="heat__col">';
      for (let r = 0; r < 7; r++) { const d = addDays(start, c * 7 + r); heat += `<i class="${d.getTime() > now ? 'fut' : days.has(dayKey(d)) ? 'on' : ''}" title="${fShort.format(d)}"></i>`; }
      heat += '</div>';
    }
    const since = now - 30 * 864e5;
    const byGroup = {};
    state.workouts.filter((w) => w.start >= since).forEach((w) => w.items.forEach((i) => { const g = ex(i.ex).group; byGroup[g] = (byGroup[g] || 0) + i.sets.filter(counts).length; }));
    const groups = Object.entries(byGroup).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);
    const gmax = Math.max(1, ...groups.map(([, n]) => n));
    const used = [...new Set(state.workouts.flatMap((w) => w.items.filter((i) => i.sets.some(counts)).map((i) => i.ex)))].map(ex).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    if (!used.some((e) => e.id === ui.progEx)) ui.progEx = used[0]?.id || '';
    const b = bests();
    const records = Object.entries(b).filter(([id, v]) => ex(id).kind === 'w' && v.e1rm > 0).sort((x, y) => y[1].e1rm - x[1].e1rm).slice(0, 6);
    const body = [...state.body].sort((x, y) => x.d.localeCompare(y.d));
    const mk = MEAS.find((m) => m[0] === ui.meas) || MEAS[0];
    const latest = {}, firstV = {};
    body.forEach((e) => MEAS.forEach(([k]) => { if (e[k] != null) { latest[k] = e[k]; if (firstV[k] == null) firstV[k] = e[k]; } }));
    const diff = latest[mk[0]] != null ? latest[mk[0]] - firstV[mk[0]] : 0;
    return `
      <div class="kpis" style="margin-top:6px">
        <div class="kpi"><small>Treinos</small><b>${state.workouts.length}</b><span>${activeWeeks()} semanas seguidas</span></div>
        <div class="kpi"><small>Carga média</small><b>${gain === null ? '—' : `${gain >= 0 ? '+' : ''}${gain}<em>%</em>`}</b><span>desde o primeiro treino</span></div>
        <div class="kpi"><small>Volume na semana</small><b>${bigKg(weekVol)}</b><span>${delta === null ? 'semana passada: —' : `${delta >= 0 ? '▲' : '▼'} ${Math.abs(delta)}% vs. semana passada`}</span></div>
        <div class="kpi"><small>Tempo treinando</small><b>${Math.round(totalTime / 3600000)}<em>h</em></b><span>${state.workouts.length ? `média ${dur(totalTime / state.workouts.length)}` : 'nenhum treino'}</span></div>
      </div>
      <div class="sec-title"><h2>Evolução por exercício</h2></div>
      <div class="card">${used.length ? `<select class="select-ex" id="progEx">${used.map((e) => `<option value="${e.id}" ${e.id === ui.progEx ? 'selected' : ''}>${esc(e.name)}</option>`).join('')}</select>
        <div class="chart" data-chart="ex" data-id="${ui.progEx}"></div><div style="margin-top:10px">${weekTable(ui.progEx)}</div>` : '<div class="chart-empty">Seus exercícios aparecem aqui depois do primeiro treino.</div>'}</div>
      <div class="sec-title"><h2>Recordes pessoais</h2></div>
      <div class="card">${records.length ? `<ul class="pr-list">${records.map(([id, v]) => `<li><span>${esc(ex(id).name)}</span><b>${kg(Math.round(v.w * 10) / 10)} · 1RM ≈ ${nf0.format(v.e1rm)}</b></li>`).join('')}</ul>` : '<div class="chart-empty">Seus recordes aparecem aqui.</div>'}</div>
      <div class="sec-title"><h2>Frequência semanal</h2></div>
      <div class="card"><div class="heat">${heat}</div><div class="heat-leg"><span>12 semanas atrás</span><span>hoje</span></div></div>
      <div class="sec-title"><h2>Volume por semana</h2></div>
      <div class="card"><div class="chart" data-chart="weekvol"></div></div>
      <div class="sec-title"><h2>Séries por grupo · 30 dias</h2></div>
      <div class="card">${groups.length ? `<div class="hbars">${groups.map(([g, n]) => `<div class="hbar"><span>${g}</span><div class="hbar__track"><div class="hbar__fill" style="width:${(n / gmax) * 100}%"></div></div><b>${n}</b></div>`).join('')}</div>` : '<div class="chart-empty">Treine para ver como as séries se dividem entre os músculos.</div>'}</div>
      <div class="sec-title"><h2>Medidas corporais</h2></div>
      <div class="card">
        <div class="mchips">${MEAS.map(([k, l]) => `<button type="button" class="chip" data-meas="${k}" aria-pressed="${ui.meas === k}">${l}${latest[k] != null ? ` · ${nf1.format(latest[k])}` : ''}</button>`).join('')}</div>
        <div class="chart" data-chart="body"></div>
        ${diff ? `<p class="fine" style="margin-top:8px">${mk[1]}: ${nf1.format(firstV[mk[0]])} → ${nf1.format(latest[mk[0]])} ${mk[2]} (${diff > 0 ? '+' : ''}${nf1.format(diff)})</p>` : ''}
        <form id="bodyForm"><div class="measure-grid">${MEAS.map(([k, l, u]) => `<label>${l} (${u})<input name="${k}" inputmode="decimal" placeholder="${latest[k] != null ? nf1.format(latest[k]) : '—'}"></label>`).join('')}</div>
          <button class="btn btn--primary btn--block" type="submit" style="margin-top:12px">Salvar medidas de hoje</button></form>
      </div>`;
  }

  /* ---------------- Gráficos (SVG, com dica ao tocar) ---------------- */
  function niceMax(v) {
    if (v <= 0) return 1;
    const p = 10 ** Math.floor(Math.log10(v));
    for (const m of [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * p >= v) return m * p;
    return 10 * p;
  }
  function chartSvg(type, pts, fmt, opts = {}) {
    const W = 320, H = 170, L = 40, R = 8, T = 10, B = 24;
    const pw = W - L - R, ph = H - T - B;
    const ys = pts.map((p) => p.y);
    let lo = opts.zero ? 0 : Math.min(...ys), hi = Math.max(...ys);
    if (!opts.zero) { const pad = (hi - lo) * 0.15 || hi * 0.05 || 1; lo = Math.max(0, lo - pad); hi += pad; }
    hi = opts.zero ? niceMax(hi) : hi;
    const step = (hi - lo) / 4;
    const y = (v) => T + ph - ((v - lo) / (hi - lo || 1)) * ph;
    const n = pts.length, bw = pw / n;
    const x = (i) => (type === 'bar' ? L + bw * i + bw / 2 : L + (n === 1 ? pw / 2 : (pw * i) / (n - 1)));
    let g = '<g class="grid">', ax = '<g class="axis">';
    for (let k = 0; k <= 4; k++) { const v = lo + step * k; g += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/>`; ax += `<text x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${fmt.axis(v)}</text>`; }
    const every = Math.ceil(n / 6);
    pts.forEach((p, i) => { if (i % every === 0 || i === n - 1) ax += `<text x="${x(i)}" y="${H - 6}" text-anchor="middle">${esc(p.label)}</text>`; });
    g += '</g>'; ax += '</g>';
    let marks;
    if (type === 'bar') {
      const w = Math.min(28, bw - 6);
      marks = pts.map((p, i) => {
        const top = y(p.y), base = y(lo), h = Math.max(0, base - top), r = Math.min(4, h, w / 2), x0 = x(i) - w / 2;
        return h > 0 ? `<path class="bar ${p.dim ? 'dim' : ''}" d="M${x0},${base}V${top + r}Q${x0},${top} ${x0 + r},${top}H${x0 + w - r}Q${x0 + w},${top} ${x0 + w},${top + r}V${base}Z"/>` : '';
      }).join('');
    } else {
      const d = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i)},${y(p.y)}`).join('');
      marks = `<path class="area" d="${d}L${x(n - 1)},${y(lo)}L${x(0)},${y(lo)}Z"/><path class="ln" d="${d}"/>`;
      marks += n <= 24 ? pts.map((p, i) => `<circle class="dot" cx="${x(i)}" cy="${y(p.y)}" r="4"/>`).join('') : `<circle class="dot" cx="${x(n - 1)}" cy="${y(pts[n - 1].y)}" r="4"/>`;
    }
    const hits = pts.map((p, i) => { const hw = type === 'bar' ? bw : n === 1 ? pw : pw / (n - 1); return `<rect class="hit" data-i="${i}" x="${x(i) - hw / 2}" y="${T}" width="${hw}" height="${ph + B}"/>`; }).join('');
    return { svg: `<svg viewBox="0 0 ${W} ${H}" role="img">${g}${ax}${marks}<line class="xh" y1="${T}" y2="${T + ph}" x1="0" x2="0" visibility="hidden"/>${hits}</svg>`, x, y, W };
  }
  function drawChart(el, type, pts, fmt, opts) {
    if (!pts.length) { el.innerHTML = `<div class="chart-empty">${opts.empty}</div>`; return; }
    const c = chartSvg(type, pts, fmt, opts);
    el.innerHTML = c.svg + '<div class="tip" hidden></div>';
    el.setAttribute('aria-label', opts.label || '');
    const svg = $('svg', el), tip = $('.tip', el), xh = $('.xh', el);
    const show = (i) => {
      const p = pts[i], scale = svg.getBoundingClientRect().width / c.W;
      tip.innerHTML = `${esc(fmt.tip(p.y))}<small>${esc(p.sub || p.label)}</small>`;
      tip.style.left = `${c.x(i) * scale}px`; tip.style.top = `${c.y(p.y) * scale}px`; tip.hidden = false;
      if (type !== 'bar') { xh.setAttribute('x1', c.x(i)); xh.setAttribute('x2', c.x(i)); xh.setAttribute('visibility', 'visible'); }
    };
    $$('.hit', el).forEach((h) => { h.addEventListener('pointerenter', () => show(+h.dataset.i)); h.addEventListener('pointerdown', () => show(+h.dataset.i)); });
    svg.addEventListener('pointerleave', () => { tip.hidden = true; xh.setAttribute('visibility', 'hidden'); });
  }
  function mountCharts(root = $('#view')) {
    $$('[data-chart]', root).forEach((el) => {
      const kind = el.dataset.chart;
      if (kind === 'weekvol') {
        const ws = weekStart(Date.now());
        const pts = [];
        for (let k = 7; k >= 0; k--) {
          const a = addDays(ws, -7 * k).getTime(), b = addDays(ws, -7 * (k - 1)).getTime();
          const v = state.workouts.filter((w) => w.start >= a && w.start < b).reduce((s, w) => s + workoutVol(w), 0);
          pts.push({ label: fShort.format(a), y: Math.round(v), sub: k === 0 ? 'esta semana (em andamento)' : `semana de ${fShort.format(a)}`, dim: k === 0 });
        }
        if (!pts.some((p) => p.y)) pts.length = 0;
        drawChart(el, 'bar', pts, { axis: (v) => (v >= 1000 ? `${nf1.format(v / 1000)}t` : nf0.format(v)), tip: (v) => bigKg(v) }, { zero: true, empty: 'Seu volume semanal (carga × repetições) aparece aqui.', label: 'Volume por semana' });
      } else if (kind === 'body') {
        const mk = MEAS.find((m) => m[0] === ui.meas) || MEAS[0];
        const pts = [...state.body].filter((b) => b[mk[0]] != null).sort((a, b) => a.d.localeCompare(b.d)).slice(-30)
          .map((b) => ({ label: fShort.format(new Date(b.d + 'T12:00')), y: b[mk[0]], sub: fDate.format(new Date(b.d + 'T12:00')) }));
        drawChart(el, 'line', pts, { axis: (v) => nf1.format(v), tip: (v) => `${nf1.format(v)} ${mk[2]}` }, { empty: `Registre ${mk[1].toLowerCase()} para acompanhar a evolução.`, label: mk[1] });
      } else if (kind === 'ex') {
        const e = ex(el.dataset.id);
        const pts = exHistory(e.id).slice(-30).map(({ w, i }) => {
          const ss = i.sets.filter(counts);
          const y = e.kind === 'w' ? Math.max(...ss.map((s) => e1rm(s.w, s.r))) : Math.max(...ss.map((s) => s.r || 0));
          return { label: fShort.format(w.start), y: Math.round(y * 10) / 10, sub: fDay.format(w.start) };
        });
        const f = e.kind === 'w' ? { axis: (v) => nf0.format(v), tip: (v) => `1RM ≈ ${kg(v)}` } : e.kind === 't' ? { axis: (v) => secTxt(Math.round(v)), tip: (v) => secTxt(Math.round(v)) } : { axis: (v) => nf0.format(v), tip: (v) => `${nf0.format(v)} reps` };
        drawChart(el, 'line', pts, f, { empty: 'Sem registros ainda.', label: `Evolução: ${e.name}` });
      }
    });
  }

  /* ---------------- Perfil ---------------- */
  function viewPerfil() {
    const p = state.profile;
    const s = state.settings;
    const opt = (arr, v) => arr.map(([val, l]) => `<option value="${val}" ${String(val) === String(v) ? 'selected' : ''}>${l}</option>`).join('');
    return `
      <div class="card me"><span class="avatar" style="display:grid;place-items:center">${esc(initials(firstName() || 'F').slice(0, 1))}</span><div><b>${esc((p && p.name) || 'Você')}</b><span>${state.workouts.length} treinos${p ? ` · desde ${fShort.format(p.createdAt || Date.now())}` : ''}</span></div></div>
      <div class="sec-title"><h2>Meu plano</h2></div>
      <div class="set-group">
        ${p ? `<div class="set-row"><span>Objetivo</span><span class="val">${esc(GOALS[p.goal].label)}</span></div>
        <div class="set-row"><span>Dias por semana</span><span class="val">${p.days}</span></div>
        <div class="set-row"><span>Nível</span><span class="val">${LEVELS[p.level].label}</span></div>` : '<div class="set-row"><span>Nenhum plano ainda</span></div>'}
        <button class="set-row set-row--btn" data-act="${p ? 'onboard-redo' : 'onboard'}">${p ? 'Refazer meu plano' : 'Montar meu plano'}<span class="val">›</span></button>
      </div>
      <div class="sec-title"><h2>Preferências</h2></div>
      <div class="set-group">
        <label class="set-row"><span>Tema</span><select data-set="theme">${opt([['auto', 'Automático'], ['light', 'Claro'], ['dark', 'Escuro']], s.theme)}</select></label>
        <label class="set-row"><span>Descanso padrão<small>para exercícios adicionados no treino</small></span><select data-set="rest">${opt([30, 45, 60, 75, 90, 120, 150, 180, 240].map((v) => [v, secTxt(v)]), s.rest)}</select></label>
        <label class="set-row"><span>Som e vibração no fim do descanso</span><input type="checkbox" class="switch" data-set="sound" ${s.sound ? 'checked' : ''}></label>
        <label class="set-row"><span>Aviso no fim do descanso<small>no app Android chega mesmo com a tela bloqueada</small></span><input type="checkbox" class="switch" data-set="notify" ${s.notify ? 'checked' : ''}></label>
      </div>
      <div class="sec-title"><h2>Seus dados</h2></div>
      <div class="set-group">
        <button class="set-row set-row--btn" data-act="export">Fazer backup (.json)</button>
        <button class="set-row set-row--btn" data-act="import">Restaurar backup</button>
        <button class="set-row set-row--btn" data-act="csv">Exportar treinos para planilha (.csv)</button>
        <button class="set-row set-row--btn set-row--danger" data-act="wipe">Apagar todos os dados</button>
      </div>
      <p class="disclaimer"><b>Aviso de saúde.</b> O Fibrafit oferece orientações gerais de treino e técnica. Ele não é uma prescrição médica e não substitui a avaliação de um médico ou de um profissional de educação física. A quantidade ideal de séries, cargas e descanso depende da sua experiência, objetivo, recuperação e técnica. Se você tem lesões, dores, doenças, está gestante ou tem qualquer limitação, procure orientação profissional antes de treinar. Pare o exercício se sentir dor.</p>
      <p class="fine" style="text-align:center;margin-top:14px">Fibrafit · seus dados ficam só neste aparelho</p>`;
  }

  /* ================================================================
     Primeiro acesso: monta o plano
     ================================================================ */
  const ONB = ['welcome', 'name', 'goal', 'days', 'level', 'health', 'done'];
  const GOAL_DESC = { massa: 'Músculos maiores: 6 a 12 repetições', forca: 'Levantar mais peso: poucas repetições, descanso longo', cond: 'Fôlego e resistência: ritmo acelerado', manut: 'Manter a forma com menos volume' };
  let onbPlayer = null;
  function openOnboarding(redo) {
    const p = state.profile || {};
    ui.onb = { step: redo ? 1 : 0, redo, data: { name: p.name || '', goal: p.goal || '', days: p.days || 0, level: p.level || '', ok: !!p.ok }, plan: null };
    $('#onb').hidden = false;
    document.body.style.overflow = 'hidden';
    renderOnb();
  }
  function closeOnboarding() {
    $('#onb').hidden = true;
    document.body.style.overflow = '';
    if (onbPlayer && onbPlayer.destroy) onbPlayer.destroy();
    ui.onb = null;
    render();
  }
  function renderOnb() {
    const o = ui.onb, d = o.data, step = ONB[o.step];
    $('#onbFill').style.width = `${(o.step / (ONB.length - 1)) * 100}%`;
    $('#onbBack').style.visibility = o.step > (o.redo ? 1 : 0) && step !== 'done' ? 'visible' : 'hidden';
    $('#onbSkip').hidden = !(o.redo || state.workouts.length || state.routines.length);
    $('#onbSkip').textContent = 'Fechar';
    let html = '', ok = true, label = 'Continuar';
    if (step === 'welcome') {
      html = `<div class="welcome"><div id="onbFig"></div><h2>Fibrafit</h2><p class="lead">Seu treinador visual de musculação no bolso.</p>
        <div class="pillars"><div><b>O que fazer</b>Treino do dia pronto</div><div><b>Como fazer</b>Movimento animado e passo a passo</div><div><b>Quanto fazer</b>Séries, repetições e carga</div><div><b>Quando descansar</b>Cronômetro entre as séries</div></div></div>`;
      label = 'Começar';
    } else if (step === 'name') {
      html = `<h2>Como podemos te chamar?</h2><p class="lead">Só para deixar o app com a sua cara.</p><input class="big-input" id="onbName" maxlength="30" placeholder="Seu nome" value="${esc(d.name)}" autocomplete="given-name">`;
    } else if (step === 'goal') {
      html = `<h2>Qual é seu objetivo?</h2><p class="lead">Isso define repetições, séries e descanso.</p><div class="choices">${Object.entries(GOALS).map(([k, g]) => `<button type="button" class="choice" data-goal="${k}" aria-pressed="${d.goal === k}"><span class="choice__dot" style="background:${g.dot}"></span><span><b>${g.label}</b><span>${GOAL_DESC[k]}</span></span></button>`).join('')}</div>`;
      ok = !!d.goal;
    } else if (step === 'days') {
      const split = { 2: 'Corpo inteiro em 2 treinos (A/B).', 3: d.level === 'ini' ? 'Corpo inteiro em 3 treinos (A/B/C).' : 'Empurrar, puxar e pernas.', 4: 'Superior e inferior, 2× cada.', 5: 'Empurrar, puxar, pernas + superior e inferior.', 6: 'Empurrar, puxar e pernas, 2× cada.' };
      html = `<h2>Quantos dias por semana você consegue treinar?</h2><p class="lead">Seja realista: constância vale mais que intensidade.</p><div class="days">${[2, 3, 4, 5, 6].map((n) => `<button type="button" class="day" data-days="${n}" aria-pressed="${d.days === n}">${n}</button>`).join('')}</div>
        <p class="fine" style="margin-top:14px">${d.days ? split[d.days] : ''}</p>`;
      ok = !!d.days;
    } else if (step === 'level') {
      html = `<h2>Qual seu nível?</h2><p class="lead">Quem está começando recebe exercícios mais fáceis de aprender.</p><div class="choices">${Object.entries(LEVELS).map(([k, l], i) => `<button type="button" class="choice" data-level="${k}" aria-pressed="${d.level === k}"><span class="choice__ico">${['🌱', '💪', '🏆'][i]}</span><span><b>${l.label}</b><span>${l.desc}</span></span></button>`).join('')}</div>`;
      ok = !!d.level;
    } else if (step === 'health') {
      html = `<h2>Antes de começar</h2><div class="health">O Fibrafit monta uma <b>sugestão de rotina</b> com orientações gerais. Não é uma prescrição médica e não garante que um número de séries sirva para todo mundo: o ideal depende da sua experiência, recuperação e técnica.
        <ul><li>Tem lesão, dor, doença, está gestante ou tem alguma limitação? Procure um médico ou profissional de educação física antes.</li><li>Comece leve e aprenda a técnica antes de aumentar a carga.</li><li>Sentiu dor? Pare o exercício.</li></ul></div>
        <label class="check"><input type="checkbox" id="onbOk" ${d.ok ? 'checked' : ''}> Entendi e vou treinar com responsabilidade.</label>`;
      ok = d.ok; label = 'Montar meu plano';
    } else if (step === 'done') {
      o.plan = o.plan || buildPlan(d);
      html = `<h2>Seu plano está pronto${d.name.trim() ? `, ${esc(d.name.trim().split(' ')[0])}` : ''}! 🎯</h2><p class="lead">${esc(GOALS[d.goal].label)} · ${d.days}× por semana · ${LEVELS[d.level].label}</p>
        <div style="margin-top:18px">${o.plan.map((r) => `<div class="card routine"><div class="routine__body"><div class="routine__name">${esc(r.name)}</div><div class="routine__groups">${esc(groupsLabel(r.items))}</div><div class="routine__meta"><span>${r.items.length} exercícios</span><span>~${estMin(r.items)} min</span><span>🔥 ${esc(r.intensity.replace('Intensidade ', ''))}</span></div><div class="routine__figs">${r.items.slice(0, 5).map((i) => vis(ex(i.ex))).join('')}</div></div></div>`).join('')}</div>
        <p class="fine">Você pode trocar exercícios, séries e repetições a qualquer momento em Treinos.</p>`;
      label = 'Ver meu treino de hoje';
    }
    $('#onbBody').innerHTML = html;
    $('#onbBody').scrollTop = 0;
    $('#onbNext').textContent = label;
    $('#onbNext').disabled = !ok;
    if (step === 'welcome') onbPlayer = window.Kfig.mount($('#onbFig'), { m: 'squat' }, { marks: false });
    if (step === 'name') setTimeout(() => $('#onbName') && $('#onbName').focus(), 100);
  }
  $('#onbBody').addEventListener('click', (ev) => {
    const o = ui.onb;
    const b = ev.target.closest('[data-goal],[data-days],[data-level]');
    if (!b) return;
    if (b.dataset.goal) o.data.goal = b.dataset.goal;
    if (b.dataset.days) o.data.days = +b.dataset.days;
    if (b.dataset.level) o.data.level = b.dataset.level;
    o.plan = null;
    renderOnb();
  });
  $('#onbBody').addEventListener('input', (ev) => { if (ev.target.id === 'onbName') ui.onb.data.name = ev.target.value; });
  $('#onbBody').addEventListener('change', (ev) => { if (ev.target.id === 'onbOk') { ui.onb.data.ok = ev.target.checked; $('#onbNext').disabled = !ev.target.checked; } });
  $('#onbBody').addEventListener('keydown', (ev) => { if (ev.key === 'Enter' && ev.target.id === 'onbName') $('#onbNext').click(); });
  $('#onbBack').addEventListener('click', () => { if (ui.onb.step > 0) { ui.onb.step--; renderOnb(); } });
  $('#onbSkip').addEventListener('click', closeOnboarding);
  $('#onbNext').addEventListener('click', () => {
    const o = ui.onb;
    if (ONB[o.step] === 'done') {
      const d = o.data;
      state.profile = { name: d.name.trim(), goal: d.goal, days: d.days, level: d.level, ok: true, createdAt: state.profile?.createdAt || Date.now() };
      state.routines = [...o.plan, ...state.routines.filter((r) => !r.plan)];
      save();
      closeOnboarding();
      setTab('inicio');
      return;
    }
    if (onbPlayer && onbPlayer.destroy) { onbPlayer.destroy(); onbPlayer = null; }
    o.step++;
    renderOnb();
  });

  /* ================================================================
     Treino guiado: um exercício por vez
     ================================================================ */
  const newSet = (t = 'n') => ({ w: '', r: '', t, done: false });
  let liveBests = {};
  let livePlayer = null;

  function startWorkout(routine, fromWorkout) {
    if (state.active && !confirm('Já existe um treino em andamento. Descartar e começar outro?')) { openLive(); return; }
    const src = routine ? routine.items.map((i) => ({ ex: i.ex, n: Number(i.sets) || 3, reps: i.reps, rest: Number(i.rest ?? state.settings.rest) }))
      : fromWorkout ? fromWorkout.items.map((i) => ({ ex: i.ex, n: i.sets.filter((s) => s.done).length || 1, reps: i.target || '', rest: i.rest ?? state.settings.rest })) : [];
    state.active = {
      id: uid(),
      name: routine ? `${routine.name} — ${groupsLabel(routine.items)}` : fromWorkout ? fromWorkout.name : 'Treino livre',
      routineId: routine ? routine.id : fromWorkout ? fromWorkout.routineId || null : null,
      start: Date.now(), cur: 0, restEnd: 0, restTotal: 0, restNext: null,
      items: src.map((s) => ({ ex: s.ex, target: s.reps, rest: s.rest, note: '', sets: Array.from({ length: s.n }, () => newSet()) })),
    };
    save();
    openLive();
    if (!state.active.items.length) setTimeout(() => openPicker('live'), 250);
  }
  function openLive() {
    if (!state.active) return;
    liveBests = bests();
    ui.liveOpen = true;
    $('#live').hidden = false;
    $('#liveName').value = state.active.name;
    document.body.style.overflow = 'hidden';
    if (state.active.restNext) renderRestNext();
    renderLive();
    updateResume();
    wakeLock(true);
  }
  function closeLive() {
    ui.liveOpen = false;
    $('#live').hidden = true;
    document.body.style.overflow = '';
    closeMenu();
    if (livePlayer && livePlayer.destroy) livePlayer.destroy();
    livePlayer = null;
    render();
    wakeLock(false);
  }
  const curSet = (item) => item.sets.findIndex((s) => !s.done);
  const kgStep = (e) => (['Halteres', 'Kettlebell'].includes(e.equip) ? 1 : 2.5);
  function prevText(e, p) {
    if (!p) return '—';
    if (e.kind === 't') return secTxt(p.r || 0);
    if (e.kind === 'bw') return p.w ? `+${nf1.format(p.w)}×${p.r}` : `${p.r}`;
    return `${nf1.format(p.w || 0)}×${p.r}`;
  }
  // Valores sugeridos: o que fez da última vez nessa série, ou a série anterior de hoje, ou a meta.
  function placeholders(item, si) {
    const p = lastSets(item.ex)[si];
    const prevSet = item.sets[si - 1];
    const w = p && p.w ? p.w : prevSet && prevSet.done && prevSet.w ? prevSet.w : '';
    const r = p ? p.r : (String(item.target || '').split('-').pop() || '');
    return { w: w === '' ? '' : nf1.format(w), r: String(r) };
  }
  function renderLive() {
    const a = state.active;
    if (!a) return;
    if (a.cur >= a.items.length) a.cur = Math.max(0, a.items.length - 1);
    $('#liveProg').innerHTML = a.items.map((it, k) => `<i class="${k === a.cur ? 'cur' : ''}"><b style="width:${it.sets.length ? (it.sets.filter((s) => s.done).length / it.sets.length) * 100 : 0}%"></b></i>`).join('');
    $('#livePos').textContent = a.items.length ? `${a.cur + 1} de ${a.items.length}` : 'Lista';
    $('#livePrev').disabled = a.cur <= 0;
    $('#liveNext').disabled = a.cur >= a.items.length - 1;
    const body = $('#liveBody');
    if (livePlayer && livePlayer.destroy) livePlayer.destroy();
    livePlayer = null;
    if (!a.items.length) {
      body.innerHTML = '<div class="empty"><b>Treino vazio</b>Adicione os exercícios de hoje.</div><button type="button" class="btn btn--primary btn--block" data-act="add-ex-live">+ Adicionar exercício</button>';
      updateLiveMeta();
      return;
    }
    const item = a.items[a.cur], e = ex(item.ex);
    const si = curSet(item);
    const allDone = a.items.every((it) => it.sets.length && it.sets.every((s) => s.done));
    const unit = e.kind === 't' ? 'seg' : 'reps';
    let setcard;
    if (si >= 0) {
      const s = item.sets[si];
      const ph = placeholders(item, si);
      const last = lastSets(item.ex)[si];
      setcard = `<div class="setcard">
        <div class="setcard__top"><div class="setcard__n">Série ${si + 1}<small>/${item.sets.length}</small>${s.t === 'w' ? ' <span class="pr-tag" style="background:var(--warn)">AQUECIMENTO</span>' : ''}</div>
          <div class="setcard__last">${last ? `Última vez<br><b>${setText(e, last)}</b>` : item.target ? `Meta<br><b>${esc(repsTxt(e, item.target))}</b>` : ''}</div></div>
        <div class="steppers">
          <div class="stepper"><label>${e.kind === 'w' ? 'Carga (kg)' : 'Carga extra (kg)'}</label><div class="stepper__row"><button type="button" data-step="w" data-d="-1" aria-label="Menos carga">−</button><input data-sf="w" inputmode="decimal" value="${s.w === '' ? '' : esc(String(s.w).replace('.', ','))}" placeholder="${esc(ph.w || '0')}" aria-label="Carga"><button type="button" data-step="w" data-d="1" aria-label="Mais carga">+</button></div></div>
          <div class="stepper"><label>${e.kind === 't' ? 'Segundos' : 'Repetições'}</label><div class="stepper__row"><button type="button" data-step="r" data-d="-1" aria-label="Menos">−</button><input data-sf="r" inputmode="numeric" value="${esc(s.r)}" placeholder="${esc(ph.r)}" aria-label="${e.kind === 't' ? 'Segundos' : 'Repetições'}"><button type="button" data-step="r" data-d="1" aria-label="Mais">+</button></div></div>
        </div>
        ${e.kind === 't' ? `<button type="button" class="btn btn--soft btn--block timer-btn" data-act="hold" id="holdBtn">${hold ? `⏱ ${secTxt(Math.max(0, Math.ceil((hold.end - Date.now()) / 1000)))} · toque para parar` : '⏱ Iniciar cronômetro'}</button>` : ''}
        <button type="button" class="btn btn--primary btn--block btn--lg" data-act="done-set">✓ SÉRIE CONCLUÍDA</button>
      </div>`;
    } else {
      const nextIdx = a.items.findIndex((it, k) => k !== a.cur && it.sets.some((x) => !x.done));
      setcard = `<div class="done-banner">${I.check} Exercício concluído</div>
        ${allDone ? '<button type="button" class="btn btn--primary btn--block btn--lg" style="margin-top:12px" data-act="finish">🏁 FINALIZAR TREINO</button>'
          : nextIdx >= 0 ? `<button type="button" class="btn btn--primary btn--block btn--lg" style="margin-top:12px" data-act="goto" data-i="${nextIdx}">PRÓXIMO EXERCÍCIO →</button>` : ''}`;
    }
    const prev = lastSets(item.ex);
    let n = 0;
    const rows = item.sets.map((s, k) => {
      const lbl = s.t === 'w' ? 'A' : s.t === 'd' ? 'D' : String(++n);
      const pr = s.done && counts(s) && e.kind !== 't' && liveBests[item.ex] && e1rm(s.w, s.r) > liveBests[item.ex].e1rm && isTopSet(item, k);
      const ph = placeholders(item, k);
      return `<tr class="${s.done ? 'done' : k === si ? 'cur' : ''}" data-s="${k}">
        <td><button type="button" class="set-n ${s.t}" data-act="set-type" title="Toque para mudar: normal, aquecimento (A), drop (D)">${lbl}</button></td>
        <td><button type="button" class="prev" data-act="copy-prev">${prevText(e, prev[k])}</button></td>
        <td><input data-f="w" inputmode="decimal" value="${s.w === '' ? '' : esc(String(s.w).replace('.', ','))}" placeholder="${esc(ph.w)}" aria-label="Carga em kg"></td>
        <td><input data-f="r" inputmode="numeric" value="${esc(s.r)}" placeholder="${esc(ph.r)}" aria-label="${e.kind === 't' ? 'Segundos' : 'Repetições'}">${pr ? '<span class="pr-tag">PR</span>' : ''}</td>
        <td><button type="button" class="chk" data-act="check" aria-label="Concluir série" aria-pressed="${s.done}">${I.check}</button></td></tr>`;
    }).join('');
    body.innerHTML = `
      <div class="player"><div id="lvAnim"></div><span class="player__slow" id="lvSlowTag" hidden>CÂMERA LENTA</span></div>
      <div class="player__ctl"><button type="button" class="btn btn--sm" data-act="lv-slow" id="lvSlow">▶ Câmera lenta</button><button type="button" class="btn btn--sm" data-act="guide" data-id="${e.id}">Guia completo</button></div>
      <div class="lv-head"><h2>${esc(e.name)}</h2><button type="button" class="icon-btn" data-act="ex-menu" aria-label="Opções do exercício">${I.dots}</button></div>
      <p class="lv-target"><b>${item.sets.length} séries × ${item.target ? esc(repsTxt(e, item.target)) : unit}</b> · descanso ${item.rest ? secTxt(item.rest) : 'livre'}</p>
      ${item.note || item.editNote ? `<textarea class="note" data-act="note" rows="1" placeholder="Anotação (banco, pegada, regulagem…)">${esc(item.note)}</textarea>` : ''}
      ${setcard}
      ${e.steps?.length ? `<details class="fold" ${state.seen[e.id] ? '' : 'open'}><summary>Como executar</summary><ol class="steps">${e.steps.map((x) => `<li>${esc(x)}</li>`).join('')}</ol></details>` : ''}
      ${e.errors?.length ? `<details class="fold"><summary>⚠️ Evite estes erros</summary><ul class="errors">${e.errors.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></details>` : ''}
      <details class="fold" open><summary>Séries</summary>
        <table class="sets"><thead><tr><th>Série</th><th>Anterior</th><th>${e.kind === 'w' ? 'kg' : '+kg'}</th><th>${unit}</th><th></th></tr></thead><tbody>${rows}</tbody></table>
        <button type="button" class="add-set" data-act="add-set">+ Série</button>
      </details>`;
    livePlayer = mountPlayer($('#lvAnim'), e);
    if (!livePlayer || (livePlayer.media && !livePlayer.canSlow)) $('#lvSlow').hidden = true;
    updateLiveMeta();
  }
  function isTopSet(item, si) {
    const v = e1rm(item.sets[si].w, item.sets[si].r);
    return item.sets.every((s, k) => k === si || !counts(s) || e1rm(s.w, s.r) < v || (e1rm(s.w, s.r) === v && k > si));
  }
  function updateLiveMeta() {
    const a = state.active;
    if (!a) return;
    $('#liveVol').textContent = bigKg(workoutVol(a));
    const n = workoutSets(a);
    $('#liveSets').textContent = `${n} série${n === 1 ? '' : 's'}`;
  }
  // Edição dos campos sem redesenhar a tela (mantém o teclado aberto).
  $('#liveBody').addEventListener('input', (ev) => {
    const a = state.active, t = ev.target;
    const item = a.items[a.cur];
    if (t.matches('textarea[data-act="note"]')) { item.note = t.value; save(); return; }
    let s, f;
    if (t.dataset.sf) { s = item.sets[curSet(item)]; f = t.dataset.sf; } else if (t.dataset.f) { s = item.sets[+t.closest('tr').dataset.s]; f = t.dataset.f; }
    if (!s) return;
    if (f === 'w') s.w = t.value.trim() === '' ? '' : (parseNum(t.value) ?? '');
    else s.r = t.value.trim() === '' ? '' : Math.max(0, Math.round(parseNum(t.value) ?? 0));
    save();
    if (s.done) updateLiveMeta();
  });
  $('#liveName').addEventListener('input', (ev) => { if (state.active) { state.active.name = ev.target.value; save(); } });

  function completeSet(si) {
    const a = state.active, item = a.items[a.cur], s = item.sets[si], e = ex(item.ex);
    const ph = placeholders(item, si);
    if (s.w === '') s.w = parseNum(ph.w) ?? 0;
    if (s.r === '') s.r = Math.round(parseNum(ph.r) ?? 0);
    if (!s.r) { toast(e.kind === 't' ? 'Informe o tempo em segundos.' : 'Informe as repetições.'); return; }
    s.done = true; s.at = Date.now();
    vibrate(20);
    hold = null;
    startRest(a.cur, si);
    save();
    renderLive();
  }
  function liveAction(act, el) {
    const a = state.active;
    const item = a.items[a.cur];
    const tr = el.closest('tr[data-s]');
    if (act === 'done-set') completeSet(curSet(item));
    else if (act === 'check') {
      const si = +tr.dataset.s;
      if (item.sets[si].done) { item.sets[si].done = false; save(); renderLive(); } else completeSet(si);
    } else if (act === 'set-type') {
      const s = item.sets[+tr.dataset.s];
      s.t = s.t === 'n' ? 'w' : s.t === 'w' ? 'd' : 'n';
      toast(s.t === 'w' ? 'Série de aquecimento (não conta no volume)' : s.t === 'd' ? 'Drop set' : 'Série normal');
      save(); renderLive();
    } else if (act === 'copy-prev') {
      const p = lastSets(item.ex)[+tr.dataset.s];
      if (!p) return;
      const s = item.sets[+tr.dataset.s]; s.w = p.w || 0; s.r = p.r;
      save(); renderLive();
    } else if (act === 'add-set') {
      const last = item.sets[item.sets.length - 1];
      const s = newSet(last && last.t === 'd' ? 'd' : 'n');
      if (last && last.done) { s.w = last.w; s.r = last.r; }
      item.sets.push(s); save(); renderLive();
    } else if (act === 'goto') { a.cur = +el.dataset.i; save(); renderLive(); $('#liveBody').scrollTop = 0; }
    else if (act === 'finish') finishWorkout();
    else if (act === 'ex-menu') openExMenu(el);
    else if (act === 'add-ex-live') openPicker('live');
    else if (act === 'guide') openGuide(el.dataset.id);
    else if (act === 'hold') toggleHold();
    else if (act === 'lv-slow' && livePlayer) {
      livePlayer.slow = !livePlayer.slow; livePlayer.setSlow(livePlayer.slow);
      el.textContent = livePlayer.slow ? '⏩ Normal' : '▶ Câmera lenta';
      $('#lvSlowTag').hidden = !livePlayer.slow;
    }
  }
  // Botões − / + da série atual.
  $('#liveBody').addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-step]');
    if (!b) return;
    const a = state.active, item = a.items[a.cur], e = ex(item.ex);
    const si = curSet(item);
    if (si < 0) return;
    const s = item.sets[si], ph = placeholders(item, si), d = +b.dataset.d;
    if (b.dataset.step === 'w') {
      const base = s.w === '' ? (parseNum(ph.w) ?? 0) : s.w;
      s.w = Math.max(0, Math.round((base + d * kgStep(e)) * 10) / 10);
      $('[data-sf="w"]').value = String(s.w).replace('.', ',');
    } else {
      const base = s.r === '' ? (parseNum(ph.r) ?? 0) : s.r;
      s.r = Math.max(0, base + d * (e.kind === 't' ? 5 : 1));
      $('[data-sf="r"]').value = s.r;
    }
    save();
  });

  /* Cronômetro para exercícios de tempo (prancha, cardio) */
  let hold = null;
  function toggleHold() {
    const a = state.active, item = a.items[a.cur], si = curSet(item);
    if (hold) { item.sets[si].r = Math.max(1, Math.round((Date.now() - hold.start) / 1000)); hold = null; save(); renderLive(); return; }
    const total = Number(item.sets[si].r) || Number(placeholders(item, si).r) || 30;
    hold = { start: Date.now(), end: Date.now() + total * 1000, total, si };
    const btn = $('#holdBtn');
    if (btn) btn.textContent = `⏱ ${secTxt(total)} · toque para parar`;
  }
  function holdTick() {
    if (!hold || !state.active) return;
    const btn = $('#holdBtn');
    const left = Math.ceil((hold.end - Date.now()) / 1000);
    if (btn) btn.textContent = `⏱ ${secTxt(Math.max(0, left))} · toque para parar`;
    if (left <= 0) {
      const item = state.active.items[state.active.cur], si = hold.si;
      item.sets[si].r = hold.total;
      hold = null;
      if (state.settings.sound) { beep(); vibrate([200, 100, 200]); }
      if (curSet(item) === si) completeSet(si);
    }
  }

  /* Menu do exercício */
  let menuEl = null;
  function closeMenu() { if (menuEl) { menuEl.remove(); menuEl = null; } }
  function openExMenu(btn) {
    closeMenu();
    const a = state.active, ii = a.cur, item = a.items[ii];
    const m = document.createElement('div');
    m.className = 'menu-pop';
    m.innerHTML = `
      <button data-m="note">${item.note ? 'Editar anotação' : 'Adicionar anotação'}</button>
      <button data-m="rest">Descanso: ${item.rest ? secTxt(item.rest) : 'livre'}</button>
      <button data-m="del-set" ${item.sets.length ? '' : 'disabled'}>Remover última série</button>
      ${ii > 0 ? '<button data-m="up">Mover para antes</button>' : ''}
      ${ii < a.items.length - 1 ? '<button data-m="down">Mover para depois</button>' : ''}
      <button data-m="swap">Trocar exercício</button>
      <button data-m="add">Adicionar exercício</button>
      <button data-m="remove" class="danger">Remover exercício</button>`;
    const host = $('#liveBody');
    host.appendChild(m);
    const r = btn.getBoundingClientRect(), hr = host.getBoundingClientRect();
    m.style.top = `${r.bottom - hr.top + host.scrollTop + 4}px`;
    m.style.right = `${hr.right - r.right}px`;
    menuEl = m;
    m.addEventListener('click', (ev) => {
      const b = ev.target.closest('button[data-m]');
      if (!b) return;
      ev.stopPropagation();
      const k = b.dataset.m;
      closeMenu();
      if (k === 'note') { item.editNote = true; renderLive(); const ta = $('#liveBody textarea'); if (ta) ta.focus(); return; }
      if (k === 'rest') {
        const opts = [0, 30, 45, 60, 75, 90, 120, 150, 180, 240, 300];
        item.rest = opts[(opts.indexOf(item.rest) + 1) % opts.length];
        toast(item.rest ? `Descanso: ${secTxt(item.rest)}` : 'Sem descanso automático');
      } else if (k === 'del-set') item.sets.pop();
      else if (k === 'up') { [a.items[ii - 1], a.items[ii]] = [a.items[ii], a.items[ii - 1]]; a.cur--; }
      else if (k === 'down') { [a.items[ii + 1], a.items[ii]] = [a.items[ii], a.items[ii + 1]]; a.cur++; }
      else if (k === 'swap') { openPicker('swap', ii); return; }
      else if (k === 'add') { openPicker('live'); return; }
      else if (k === 'remove') {
        if (item.sets.some((s) => s.done) && !confirm(`Remover ${ex(item.ex).name} e as séries feitas?`)) return;
        a.items.splice(ii, 1);
      }
      save(); renderLive();
    });
  }
  document.addEventListener('pointerdown', (ev) => { if (menuEl && !menuEl.contains(ev.target) && !ev.target.closest('[data-act="ex-menu"]')) closeMenu(); });

  function openOverview() {
    const a = state.active;
    showInfo('Exercícios do treino', `${a.items.map((it, k) => {
      const e = ex(it.ex), d = it.sets.filter((s) => s.done).length;
      return `<button type="button" class="ov-item ${k === a.cur ? 'cur' : ''}" data-act="ov-go" data-i="${k}">${vis(e)}<span><b>${esc(e.name)}</b><span>${d}/${it.sets.length} séries${it.target ? ` · ${esc(repsTxt(e, it.target))}` : ''}</span></span>${d && d === it.sets.length ? '<span class="ok">✓</span>' : ''}</button>`;
    }).join('')}<button type="button" class="btn btn--soft btn--block" style="margin-top:10px" data-act="ov-add">+ Adicionar exercício</button>
      <button type="button" class="btn btn--danger-ghost btn--block" data-act="discard">Descartar treino</button>`);
  }
  $('#livePrev').addEventListener('click', () => { const a = state.active; if (a.cur > 0) { a.cur--; save(); renderLive(); $('#liveBody').scrollTop = 0; } });
  $('#liveNext').addEventListener('click', () => { const a = state.active; if (a.cur < a.items.length - 1) { a.cur++; save(); renderLive(); $('#liveBody').scrollTop = 0; } });
  $('#liveList').addEventListener('click', openOverview);

  /* ---------------- Descanso ---------------- */
  let restAlerted = false;
  function nextAfter(ii, si) {
    const a = state.active, item = a.items[ii];
    let k = item.sets.findIndex((s, j) => j > si && !s.done);
    if (k < 0) k = item.sets.findIndex((s) => !s.done);
    if (k >= 0) return { ii, si: k };
    for (let j = 1; j < a.items.length; j++) {
      const i2 = (ii + j) % a.items.length;
      const s2 = a.items[i2].sets.findIndex((s) => !s.done);
      if (s2 >= 0) return { ii: i2, si: s2 };
    }
    return null;
  }
  function startRest(ii, si) {
    const a = state.active, item = a.items[ii];
    const nx = nextAfter(ii, si);
    if (!nx) { stopRest(); return; }
    if (!item.rest) { stopRest(); if (nx.ii !== ii) a.cur = nx.ii; return; }
    a.restEnd = Date.now() + item.rest * 1000;
    a.restTotal = item.rest;
    a.restNext = nx;
    restAlerted = false;
    renderRestNext();
    scheduleRestNote();
    tick();
  }
  function renderRestNext() {
    const a = state.active, nx = a.restNext;
    if (!nx || !a.items[nx.ii]) return;
    const it = a.items[nx.ii], e = ex(it.ex), s = it.sets[nx.si];
    const ph = placeholders(it, nx.si);
    const w = s.w !== '' ? s.w : parseNum(ph.w), r = s.r !== '' ? s.r : ph.r;
    const same = nx.ii === a.cur;
    $('#restNext').innerHTML = `${vis(e)}<span><small>${same ? 'PRÓXIMA SÉRIE' : 'PRÓXIMO EXERCÍCIO'}</small><b>Série ${nx.si + 1}/${it.sets.length} · ${esc(e.name)}</b><span>${e.kind === 't' ? secTxt(Number(r) || 0) : `${w ? `${nf1.format(w)} kg × ` : ''}${r || '—'} reps`}</span></span>`;
    $('#restGo').textContent = same ? 'PRÓXIMA SÉRIE →' : 'PRÓXIMO EXERCÍCIO →';
  }
  function adjustRest(d) {
    const a = state.active;
    if (!a || !a.restEnd) return;
    a.restEnd = Math.max(Date.now() + 1000, a.restEnd + d * 1000);
    a.restTotal = Math.max(a.restTotal + d, 1);
    restAlerted = false;
    scheduleRestNote();
    tick();
  }
  function endRest() {
    const a = state.active;
    const moved = a && a.restNext && a.restNext.ii !== a.cur;
    if (moved) a.cur = a.restNext.ii;
    stopRest();
    renderLive();
    if (moved) $('#liveBody').scrollTop = 0;
  }
  function stopRest() {
    if (state.active) { state.active.restEnd = 0; state.active.restNext = null; save(); }
    $('#rest').hidden = true;
    cancelRestNote();
  }
  function tick() {
    holdTick();
    const a = state.active;
    if (!a) return;
    const now = Date.now();
    const t = clock(now - a.start);
    $('#liveClock').textContent = t;
    $('#resumeTime').textContent = t;
    const rest = $('#rest');
    if (a.restEnd) {
      const left = a.restEnd - now, over = left <= 0;
      rest.hidden = !ui.liveOpen;
      rest.classList.toggle('over', over);
      $('#restTime').textContent = clock(Math.max(0, left) + 999);
      $('#restRing').style.strokeDashoffset = String(553 * (1 - Math.max(0, Math.min(1, left / (a.restTotal * 1000)))));
      $('#restLabel').textContent = over ? '✅ DESCANSO CONCLUÍDO' : '⏱️ DESCANSO';
      $('#restMsg').textContent = over ? 'Bora! Hora da próxima série 💪' : 'Recupere-se para a próxima série.';
      $('#restBreath').textContent = over ? 'Vamos lá' : (now / 1000) % 8 < 4 ? 'Inspire…' : 'Expire…';
      if (over && !restAlerted) { restAlerted = true; restDone(); }
      $('#resumeName').textContent = over ? 'Descanso acabou · próxima série' : `Descanso · ${clock(left + 999)}`;
    } else {
      rest.hidden = true;
      $('#resumeName').textContent = a.name || 'Treino';
    }
  }
  setInterval(tick, 500);
  function updateResume() {
    const show = !!state.active && !ui.liveOpen;
    $('#resumeBar').hidden = !show;
    $('.app').classList.toggle('has-resume', show);
    tick();
  }
  let audio;
  function beep() {
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === 'suspended') audio.resume();
      [0, 0.22, 0.44].forEach((t, k) => {
        const o = audio.createOscillator(), g = audio.createGain();
        o.type = 'sine'; o.frequency.value = k === 2 ? 1320 : 880;
        g.gain.setValueAtTime(0.0001, audio.currentTime + t);
        g.gain.exponentialRampToValueAtTime(0.35, audio.currentTime + t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + t + 0.18);
        o.connect(g).connect(audio.destination); o.start(audio.currentTime + t); o.stop(audio.currentTime + t + 0.2);
      });
    } catch { /* sem som */ }
  }
  const vibrate = (p) => { try { navigator.vibrate && navigator.vibrate(p); } catch { /* sem vibração */ } };
  function restText() {
    const a = state.active, nx = a && a.restNext;
    return nx && a.items[nx.ii] ? `Próxima: série ${nx.si + 1} de ${ex(a.items[nx.ii].ex).name}` : 'Hora da próxima série';
  }
  function restDone() {
    if (state.settings.sound) { beep(); vibrate([200, 100, 200]); }
    if (!NATIVE && document.hidden && state.settings.notify && 'Notification' in window && Notification.permission === 'granted') {
      const opts = { body: restText(), icon: 'icon-192.png', tag: 'descanso', renotify: true };
      navigator.serviceWorker?.getRegistration().then((r) => (r ? r.showNotification('Descanso acabou 💪', opts) : new Notification('Descanso acabou 💪', opts))).catch(() => {});
    }
  }
  $('#rest').addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-rest]');
    if (!b) return;
    if (b.dataset.rest === 'skip') endRest(); else adjustRest(Number(b.dataset.rest));
  });

  /* ---------------- Finalizar ---------------- */
  function finishWorkout() {
    const a = state.active;
    const doneSets = a.items.reduce((n, i) => n + i.sets.filter((s) => s.done).length, 0);
    if (!doneSets) {
      if (confirm('Nenhuma série foi concluída. Descartar o treino?')) { stopRest(); state.active = null; save(); closeLive(); }
      return;
    }
    const pending = a.items.reduce((n, i) => n + i.sets.filter((s) => !s.done).length, 0);
    if (pending && !confirm(`${pending} série${pending > 1 ? 's' : ''} não ${pending > 1 ? 'foram feitas e serão descartadas' : 'foi feita e será descartada'}. Finalizar mesmo assim?`)) return;
    const before = bests();
    const w = {
      id: a.id, name: (a.name || '').trim() || 'Treino', routineId: a.routineId, start: a.start, end: Date.now(),
      items: a.items.map((i) => ({ ex: i.ex, rest: i.rest, target: i.target, note: (i.note || '').trim(), sets: i.sets.filter((s) => s.done).map((s) => ({ w: Number(s.w) || 0, r: Number(s.r) || 0, t: s.t, done: true })) })).filter((i) => i.sets.length),
    };
    w.items.forEach((i) => { state.seen[i.ex] = 1; });
    state.workouts.push(w);
    state.active = null;
    stopRest();
    save();
    closeLive();
    showSummary(w, before);
  }
  function showSummary(w, before) {
    const prs = [];
    for (const i of w.items) {
      const e = ex(i.ex), b = before[i.ex];
      if (!b || e.kind === 't') continue;
      const ss = i.sets.filter(counts);
      const top = ss.reduce((m, s) => (e1rm(s.w, s.r) > e1rm(m.w, m.r) ? s : m), { w: 0, r: 0 });
      const maxW = Math.max(0, ...ss.map((s) => s.w));
      if (e.kind === 'w' && e1rm(top.w, top.r) > b.e1rm) prs.push([e.name, `1RM ≈ ${kg(Math.round(e1rm(top.w, top.r) * 10) / 10)}`]);
      else if (maxW > b.w) prs.push([e.name, `carga ${kg(maxW)}`]);
      else if (e.kind === 'bw' && Math.max(0, ...ss.map((s) => s.r)) > b.r) prs.push([e.name, `${Math.max(...ss.map((s) => s.r))} reps`]);
    }
    const n = state.workouts.length;
    const routine = state.routines.find((r) => r.id === w.routineId);
    const changed = routine && (routine.items.length !== w.items.length || routine.items.some((ri, k) => !w.items[k] || w.items[k].ex !== ri.ex || Number(ri.sets) !== w.items[k].sets.filter((s) => s.t !== 'w').length));
    const ws = weekStart(Date.now()).getTime();
    const k = state.workouts.filter((x) => x.start >= ws).length;
    const msg = k >= goal() ? (k === goal() ? 'Meta da semana batida! 🎯' : `${k} treinos nesta semana.`) : `Faltam ${goal() - k} para a meta da semana.`;
    showInfo(w.name, `
      <div class="celebrate"><div class="celebrate__ico">${prs.length ? '🏆' : '💪'}</div><h3>${prs.length ? 'Treino com recorde!' : 'Treino concluído!'}</h3><p>Esse foi seu ${n}º treino. ${msg}</p></div>
      <div class="stat-grid"><div class="stat"><small>Duração</small><b>${dur(w.end - w.start)}</b></div><div class="stat"><small>Volume</small><b>${bigKg(workoutVol(w))}</b></div><div class="stat"><small>Séries</small><b>${workoutSets(w)}</b></div></div>
      ${prs.length ? `<div class="sec-title" style="margin-top:8px"><h2>Recordes</h2></div><ul class="pr-list">${prs.map(([x, y]) => `<li><span>${esc(x)}</span><b>${esc(y)}</b></li>`).join('')}</ul>` : ''}
      <div class="actions">
        ${changed ? `<button type="button" class="btn btn--soft" data-act="update-routine" data-id="${w.id}">Atualizar a ficha com este treino</button>` : ''}
        ${!routine ? `<button type="button" class="btn btn--soft" data-act="save-as-routine" data-id="${w.id}">Salvar como ficha</button>` : ''}
        <button type="button" class="btn btn--primary" onclick="this.closest('dialog').close()">Fechar</button>
      </div>`);
  }
  function routineFromWorkout(w) {
    return w.items.map((i) => {
      const sets = i.sets.filter((s) => s.t !== 'w');
      const reps = sets.length ? Math.round(sets.reduce((a, s) => a + s.r, 0) / sets.length) : 10;
      return { ex: i.ex, sets: Math.max(1, sets.length), reps: i.target || String(reps), rest: i.rest ?? state.settings.rest };
    });
  }

  /* ================================================================
     Escolher exercícios, criar exercício, fichas
     ================================================================ */
  const pick = { mode: 'live', sel: [], group: '', idx: -1 };
  function openPicker(mode, idx = -1) {
    pick.mode = mode; pick.sel = []; pick.group = ''; pick.idx = idx;
    $('#pickQ').value = '';
    $('#dlgPick h2').textContent = mode === 'swap' ? 'Trocar exercício' : 'Adicionar exercícios';
    renderPicker();
    $('#dlgPick').showModal();
  }
  function renderPicker() {
    const q = norm($('#pickQ').value.trim());
    $('#pickGroups').innerHTML = ['', ...GROUPS].map((g) => `<button type="button" class="chip" data-g="${g}" aria-pressed="${pick.group === g}">${g || 'Todos'}</button>`).join('');
    const recent = [...new Set(sorted().flatMap((w) => w.items.map((i) => i.ex)))];
    const list = allEx().filter((e) => (!pick.group || e.group === pick.group) && (!q || norm(e.name).includes(q))).sort((a, b) => {
      const ra = recent.indexOf(a.id), rb = recent.indexOf(b.id);
      if (!q && !pick.group && (ra >= 0 || rb >= 0)) return (ra < 0 ? 1e9 : ra) - (rb < 0 ? 1e9 : rb);
      return GROUPS.indexOf(a.group) - GROUPS.indexOf(b.group) || a.name.localeCompare(b.name, 'pt-BR');
    });
    $('#pickList').innerHTML = list.map((e) => `<button type="button" class="pick ${pick.sel.includes(e.id) ? 'sel' : ''}" data-id="${e.id}">${vis(e)}
      <span class="pick__body"><span class="pick__name">${esc(e.name)}</span><br><span class="pick__sub">${esc(e.group)} · ${esc(e.equip)}</span></span><span class="pick__chk">${I.check}</span></button>`).join('') || '<div class="empty"><b>Nada encontrado</b>Toque em “Criar exercício”.</div>';
    const ok = $('#pickOk');
    ok.disabled = !pick.sel.length;
    ok.textContent = pick.sel.length > 1 ? `Adicionar ${pick.sel.length}` : pick.mode === 'swap' ? 'Trocar' : 'Adicionar';
  }
  $('#pickQ').addEventListener('input', renderPicker);
  $('#pickGroups').addEventListener('click', (ev) => { const b = ev.target.closest('.chip'); if (b) { pick.group = b.dataset.g; renderPicker(); } });
  $('#pickList').addEventListener('click', (ev) => {
    const b = ev.target.closest('.pick');
    if (!b) return;
    const id = b.dataset.id;
    pick.sel = pick.mode === 'swap' ? [id] : pick.sel.includes(id) ? pick.sel.filter((x) => x !== id) : [...pick.sel, id];
    renderPicker();
  });
  $('#pickOk').addEventListener('click', () => {
    const ids = pick.sel;
    $('#dlgPick').close();
    const a = state.active;
    if (pick.mode === 'live' && a) {
      const at = a.items.length;
      ids.forEach((id) => a.items.push({ ex: id, target: ex(id).kind === 't' ? '30' : '10', rest: state.settings.rest, note: '', sets: [newSet(), newSet(), newSet()] }));
      a.cur = at;
      save(); renderLive();
    } else if (pick.mode === 'swap' && a) {
      const item = a.items[pick.idx];
      item.ex = ids[0];
      item.sets.forEach((s) => { if (!s.done) { s.w = ''; s.r = ''; } });
      save(); renderLive();
    } else if (pick.mode === 'routine') {
      ids.forEach((id) => rt.items.push({ ex: id, sets: 3, reps: ex(id).kind === 't' ? '30' : '10', rest: state.settings.rest }));
      renderRoutineItems();
    }
  });
  $('#pickNew').addEventListener('click', () => openNewEx(true));

  let newExFromPicker = false;
  function openNewEx(fromPicker) {
    newExFromPicker = fromPicker;
    $('#exName').value = fromPicker ? $('#pickQ').value.trim() : '';
    $('#exGroup').innerHTML = GROUPS.map((g) => `<option ${g === (pick.group || ui.libGroup) ? 'selected' : ''}>${g}</option>`).join('');
    $('#exEquip').innerHTML = EQUIPS.map((g) => `<option>${g}</option>`).join('');
    $('#dlgEx').showModal();
  }
  $('#exForm').addEventListener('submit', (ev) => {
    const name = $('#exName').value.trim();
    if (!name) { ev.preventDefault(); return; }
    const group = $('#exGroup').value, equip = $('#exEquip').value;
    const e = { id: `u-${uid()}`, name, group, equip, kind: group === 'Cardio' ? 't' : equip === 'Peso corporal' ? 'bw' : 'w', steps: [], errors: [] };
    state.exercises.push(e);
    EXM = exMap();
    save();
    toast('Exercício criado');
    if (newExFromPicker) {
      if (pick.mode === 'swap') pick.sel = [e.id]; else pick.sel.push(e.id);
      $('#pickQ').value = ''; pick.group = '';
      renderPicker();
    } else render();
  });

  let rt = null;
  function openRoutine(id) {
    const r = state.routines.find((x) => x.id === id);
    rt = r ? JSON.parse(JSON.stringify(r)) : { id: null, name: '', items: [] };
    $('#rtTitle').textContent = r ? 'Editar ficha' : 'Nova ficha';
    $('#rtName').value = rt.name;
    $('#rtDelete').hidden = !r;
    renderRoutineItems();
    $('#dlgRoutine').showModal();
  }
  function renderRoutineItems() {
    const restOpts = [0, 30, 45, 60, 75, 90, 120, 150, 180, 240, 300];
    $('#rtItems').innerHTML = rt.items.map((i, k) => {
      const e = ex(i.ex);
      return `<div class="rt-item" data-k="${k}">
        <div class="rt-item__head"><span class="rt-item__name">${k + 1}. ${esc(e.name)}</span>
          <button type="button" class="rt-item__ctl" data-rt="up" aria-label="Subir" ${k ? '' : 'disabled'}>${I.up}</button>
          <button type="button" class="rt-item__ctl" data-rt="down" aria-label="Descer" ${k < rt.items.length - 1 ? '' : 'disabled'}>${I.down}</button>
          <button type="button" class="rt-item__ctl" data-rt="del" aria-label="Remover">${I.x}</button></div>
        <div class="rt-item__grid">
          <label>Séries<input data-f="sets" inputmode="numeric" value="${esc(i.sets)}"></label>
          <label>${e.kind === 't' ? 'Segundos' : 'Reps'}<input data-f="reps" value="${esc(i.reps)}" placeholder="8-12"></label>
          <label>Descanso<select data-f="rest">${restOpts.map((s) => `<option value="${s}" ${Number(i.rest) === s ? 'selected' : ''}>${s ? secTxt(s) : 'sem'}</option>`).join('')}</select></label>
        </div></div>`;
    }).join('') || '<div class="empty" style="padding:16px">Adicione os exercícios desta ficha.</div>';
  }
  $('#rtItems').addEventListener('input', (ev) => {
    const f = ev.target.dataset.f;
    if (!f) return;
    const i = rt.items[+ev.target.closest('.rt-item').dataset.k];
    i[f] = f === 'sets' ? Math.max(1, Math.min(20, parseInt(ev.target.value, 10) || 1)) : f === 'rest' ? Number(ev.target.value) : ev.target.value.trim();
  });
  $('#rtItems').addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-rt]');
    if (!b) return;
    const k = +b.closest('.rt-item').dataset.k, a = rt.items;
    if (b.dataset.rt === 'up') [a[k - 1], a[k]] = [a[k], a[k - 1]];
    else if (b.dataset.rt === 'down') [a[k + 1], a[k]] = [a[k], a[k + 1]];
    else a.splice(k, 1);
    renderRoutineItems();
  });
  $('#rtAdd').addEventListener('click', () => openPicker('routine'));
  $('#rtSave').addEventListener('click', () => {
    rt.name = $('#rtName').value.trim() || `Treino ${String.fromCharCode(65 + (state.routines.length % 26))}`;
    if (!rt.items.length) { toast('Adicione pelo menos um exercício.'); return; }
    delete rt.intensity;
    if (rt.id) state.routines[state.routines.findIndex((r) => r.id === rt.id)] = rt;
    else { rt.id = uid(); state.routines.push(rt); }
    save(); $('#dlgRoutine').close(); toast('Ficha salva'); render();
  });
  $('#rtDelete').addEventListener('click', () => {
    if (!confirm(`Excluir a ficha “${rt.name}”? Os treinos já feitos continuam no histórico.`)) return;
    state.routines = state.routines.filter((r) => r.id !== rt.id);
    save(); $('#dlgRoutine').close(); render();
  });
  // Modelos prontos: as mesmas divisões que o plano automático usa.
  const TEMPLATES = [
    { name: 'Corpo inteiro A/B', desc: '2 a 3 dias por semana', days: ['fbA', 'fbB'] },
    { name: 'Corpo inteiro A/B/C', desc: '3 dias por semana', days: ['fbA', 'fbB', 'fbC'] },
    { name: 'Empurrar / Puxar / Pernas', desc: '3 ou 6 dias por semana', days: ['push', 'pull', 'legs'] },
    { name: 'Superior / Inferior', desc: '4 dias por semana', days: ['upA', 'lowA', 'upB', 'lowB'] },
  ];
  function openTemplates() {
    showInfo('Modelos de ficha', `<p class="fine" style="margin-top:-4px">Escolha um ponto de partida (6 exercícios, 3–4 séries). Depois ajuste do seu jeito.</p>
      ${TEMPLATES.map((t, k) => `<button type="button" class="card hist" data-act="use-template" data-k="${k}" style="background:var(--surface-2);box-shadow:none;margin-top:10px">
        <div class="hist__top"><span class="hist__name">${esc(t.name)}</span><span class="hist__date">${t.days.length} fichas</span></div><div class="hist__stats">${esc(t.desc)}</div>
        <div class="hist__ex">${t.days.map((d) => `<div>${esc(groupsLabel(DAYS[d].map((id) => ({ ex: id, sets: 3 }))))} <span>· 6 exercícios</span></div>`).join('')}</div></button>`).join('')}`);
  }

  /* ================================================================
     Cliques gerais
     ================================================================ */
  document.addEventListener('click', (ev) => {
    const go = ev.target.closest('[data-tab-go]');
    if (go) { setTab(go.dataset.tabGo); return; }
    const segB = ev.target.closest('[data-seg]');
    if (segB) { ui.treinos = segB.dataset.seg; render(); return; }
    const m = ev.target.closest('[data-meas]');
    if (m) { ui.meas = m.dataset.meas; render(); return; }
    const el = ev.target.closest('[data-act]');
    if (!el) return;
    const act = el.dataset.act, id = el.dataset.id;
    if (el.closest('#liveBody')) { liveAction(act, el); return; }
    switch (act) {
      case 'start': if ($('#dlgInfo').open) $('#dlgInfo').close(); startWorkout(state.routines.find((r) => r.id === id)); break;
      case 'start-empty': startWorkout(null); break;
      case 'open-live': openLive(); break;
      case 'swap-today': showInfo('Escolha o treino', state.routines.map((r) => routineCard(r)).join('')); break;
      case 'edit-routine': if ($('#dlgInfo').open) $('#dlgInfo').close(); openRoutine(id); break;
      case 'new-routine': openRoutine(null); break;
      case 'templates': openTemplates(); break;
      case 'use-template': {
        const t = TEMPLATES[+el.dataset.k];
        const g = GOALS.massa;
        t.days.forEach((d, i) => state.routines.push({
          id: uid(), name: `Treino ${String.fromCharCode(65 + i)}`,
          items: DAYS[d].slice(0, 6).map((exId) => { const e = ex(exId); return { ex: exId, sets: e.c ? 4 : 3, reps: e.kind === 't' ? '45' : e.c ? g.comp : g.acc, rest: e.kind === 't' ? 45 : e.c ? g.restC : g.restA }; }),
        }));
        save(); $('#dlgInfo').close(); toast(`Fichas adicionadas: ${t.name}`); ui.treinos = 'plano'; setTab('treinos');
        break;
      }
      case 'workout': openWorkout(id); break;
      case 'repeat': {
        const w = state.workouts.find((x) => x.id === id);
        $('#dlgInfo').close();
        const r = state.routines.find((x) => x.id === w.routineId);
        startWorkout(r || null, r ? null : w);
        break;
      }
      case 'save-as-routine': {
        const w = state.workouts.find((x) => x.id === id);
        const r = { id: uid(), name: w.name, items: routineFromWorkout(w) };
        state.routines.push(r); w.routineId = r.id;
        save(); $('#dlgInfo').close(); toast('Ficha criada a partir do treino'); render();
        break;
      }
      case 'update-routine': {
        const w = state.workouts.find((x) => x.id === id);
        const r = state.routines.find((x) => x.id === w.routineId);
        if (r) { r.items = routineFromWorkout(w); save(); toast('Ficha atualizada'); render(); }
        $('#dlgInfo').close();
        break;
      }
      case 'delete-workout':
        if (!confirm('Excluir este treino do histórico?')) return;
        state.workouts = state.workouts.filter((w) => w.id !== id);
        save(); $('#dlgInfo').close(); render();
        break;
      case 'guide': openGuide(id); break;
      case 'new-ex': openNewEx(false); break;
      case 'delete-ex':
        if (state.workouts.some((w) => w.items.some((i) => i.ex === id)) || state.routines.some((r) => r.items.some((i) => i.ex === id))) { toast('Esse exercício está em treinos ou fichas e não pode ser excluído.'); return; }
        if (!confirm('Excluir este exercício?')) return;
        state.exercises = state.exercises.filter((e) => e.id !== id);
        EXM = exMap(); save(); $('#dlgGuide').close(); render();
        break;
      case 'lib-group': ui.libGroup = el.dataset.g; render(); break;
      case 'onboard': openOnboarding(false); break;
      case 'onboard-redo': openOnboarding(true); break;
      case 'ov-go': state.active.cur = +el.dataset.i; save(); $('#dlgInfo').close(); renderLive(); $('#liveBody').scrollTop = 0; break;
      case 'ov-add': $('#dlgInfo').close(); openPicker('live'); break;
      case 'discard':
        if (!confirm('Descartar este treino? Nada será salvo.')) return;
        $('#dlgInfo').close(); stopRest(); state.active = null; save(); closeLive();
        break;
      case 'export': saveFile(`fibrafit-backup-${dayKey(Date.now())}.json`, JSON.stringify({ app: 'fibrafit', ...state }, null, 1), 'application/json'); break;
      case 'import': $('#stFile').click(); break;
      case 'csv': exportCsv(); break;
      case 'wipe': wipe(); break;
      default: break;
    }
  });
  $('#view').addEventListener('input', (ev) => {
    if (ev.target.id === 'libQ') { ui.libQ = ev.target.value; $('#libList').innerHTML = libList(); }
  });
  $('#view').addEventListener('change', async (ev) => {
    const t = ev.target;
    if (t.id === 'progEx') { ui.progEx = t.value; render(); return; }
    const k = t.dataset.set;
    if (!k) return;
    if (k === 'theme') { state.settings.theme = t.value; applyTheme(); }
    else if (k === 'rest') state.settings.rest = Number(t.value);
    else if (k === 'sound') { state.settings.sound = t.checked; if (t.checked) beep(); }
    else if (k === 'notify') {
      state.settings.notify = t.checked;
      if (t.checked && !(await askNotify())) { t.checked = false; state.settings.notify = false; toast('Permita as notificações nas configurações do aparelho.'); }
    }
    save();
  });
  $('#view').addEventListener('submit', (ev) => {
    if (ev.target.id !== 'bodyForm') return;
    ev.preventDefault();
    const fd = new FormData(ev.target);
    const d = dayKey(Date.now());
    const entry = state.body.find((b) => b.d === d) || { d };
    let any = false;
    for (const [k] of MEAS) {
      const v = parseNum(fd.get(k));
      if (v == null) continue;
      if (v <= 0 || v > 400) { toast('Confira os valores informados.'); return; }
      entry[k] = Math.round(v * 10) / 10; any = true;
    }
    if (!any) { toast('Preencha pelo menos uma medida.'); return; }
    if (!state.body.includes(entry)) state.body.push(entry);
    save(); toast('Medidas salvas'); render();
  });
  $('#liveMin').addEventListener('click', closeLive);
  $('#liveFinish').addEventListener('click', finishWorkout);
  $('#resumeBar').addEventListener('click', openLive);

  /* ---------------- Backup ---------------- */
  async function saveFile(name, text, mime) {
    if (NATIVE && FS && SHARE) {
      try {
        const r = await FS.writeFile({ path: name, data: text, directory: 'CACHE', encoding: 'utf8' });
        await SHARE.share({ title: name, files: [r.uri] });
      } catch (err) { if (!String(err && err.message).toLowerCase().includes('cancel')) toast('Não consegui salvar o arquivo.'); }
      return;
    }
    const url = URL.createObjectURL(new Blob([text], { type: mime }));
    const a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  $('#stFile').addEventListener('change', async (e) => {
    const f = e.target.files[0];
    e.target.value = '';
    if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      if (!['fibrafit', 'fibra', 'kinora', 'forja'].includes(data.app) || !Array.isArray(data.workouts)) throw new Error('arquivo');
      if (!confirm(`Restaurar backup com ${data.workouts.length} treinos e ${(data.routines || []).length} fichas? Os dados atuais serão substituídos.`)) return;
      delete data.app;
      state = { ...blank(), ...data, v: 2, settings: { ...blank().settings, ...(data.settings || {}) } };
      EXM = exMap(); save(); applyTheme(); toast('Backup restaurado'); render();
    } catch { toast('Esse arquivo não é um backup do Fibrafit.'); }
  });
  function exportCsv() {
    const rows = [['data', 'treino', 'exercicio', 'grupo', 'serie', 'tipo', 'carga_kg', 'reps_ou_seg', '1rm_estimado']];
    [...state.workouts].sort((a, b) => a.start - b.start).forEach((w) => w.items.forEach((i) => {
      const e = ex(i.ex);
      i.sets.forEach((s, k) => rows.push([new Date(w.start).toISOString().slice(0, 16).replace('T', ' '), w.name, e.name, e.group, k + 1, s.t === 'w' ? 'aquecimento' : s.t === 'd' ? 'drop' : 'normal', String(s.w).replace('.', ','), s.r, e.kind === 'w' ? String(Math.round(e1rm(s.w, s.r) * 10) / 10).replace('.', ',') : '']));
    }));
    saveFile(`fibrafit-treinos-${dayKey(Date.now())}.csv`, '﻿' + rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n'), 'text/csv');
  }
  function wipe() {
    if (!confirm('Apagar TODOS os treinos, fichas, medidas e o seu plano? Isso não pode ser desfeito.')) return;
    if (!confirm('Tem certeza? Faça um backup antes, se quiser guardar.')) return;
    stopRest();
    state = blank(); EXM = exMap(); save(); applyTheme();
    if (ui.liveOpen) closeLive();
    render();
    openOnboarding(false);
  }

  /* ================================================================
     App nativo (APK feito com Capacitor) e PWA
     ================================================================ */
  const Cap = window.Capacitor;
  const NATIVE = !!(Cap && Cap.isNativePlatform && Cap.isNativePlatform());
  const plugin = (name) => (NATIVE ? (Cap.Plugins && Cap.Plugins[name]) || (Cap.registerPlugin && Cap.registerPlugin(name)) || null : null);
  const LN = plugin('LocalNotifications');
  const FS = plugin('Filesystem');
  const SHARE = plugin('Share');
  const KNATIVE = plugin('FibrafitNative');
  const REST_NOTE = 4201;
  if (NATIVE) {
    document.documentElement.classList.add('is-native');
    if (LN) {
      LN.createChannel({ id: 'descanso', name: 'Fim do descanso', description: 'Avisa quando o descanso entre as séries acaba', importance: 4, visibility: 1, vibration: true }).catch(() => {});
      LN.addListener('localNotificationActionPerformed', () => { if (state.active) openLive(); });
    }
    const AppPlugin = plugin('App');
    if (AppPlugin) {
      // Botão "voltar" do Android: fecha menus e janelas, minimiza o treino, volta para o Início, depois minimiza o app.
      AppPlugin.addListener('backButton', () => {
        if (menuEl) { closeMenu(); return; }
        const open = [...document.querySelectorAll('dialog[open]')];
        if (open.length) { open[open.length - 1].close(); return; }
        if (ui.onb) { if (ui.onb.step > (ui.onb.redo ? 1 : 0)) { ui.onb.step--; renderOnb(); } else if (state.profile) closeOnboarding(); else AppPlugin.minimizeApp(); return; }
        if (ui.liveOpen) { closeLive(); return; }
        if (ui.tab !== 'inicio') { setTab('inicio'); return; }
        AppPlugin.minimizeApp();
      });
    }
  }
  async function askNotify() {
    if (NATIVE && LN) {
      try { let p = await LN.checkPermissions(); if (p.display !== 'granted') p = await LN.requestPermissions(); return p.display === 'granted'; } catch { return false; }
    }
    if (!('Notification' in window)) { toast('Este navegador não mostra notificações.'); return false; }
    if (Notification.permission === 'granted') return true;
    return (await Notification.requestPermission()) === 'granted';
  }
  // No app nativo o aviso é agendado no Android: toca mesmo com a tela bloqueada.
  function scheduleRestNote() {
    save();
    if (!NATIVE || !LN || !state.settings.notify || !state.active?.restEnd) return;
    LN.cancel({ notifications: [{ id: REST_NOTE }] }).catch(() => {}).finally(() => {
      LN.schedule({ notifications: [{ id: REST_NOTE, title: 'Descanso acabou 💪', body: restText(), schedule: { at: new Date(state.active.restEnd), allowWhileIdle: true }, channelId: 'descanso', smallIcon: 'ic_stat_fibrafit', iconColor: '#7cc400', autoCancel: true }] }).catch(() => {});
    });
  }
  function cancelRestNote() { if (NATIVE && LN) LN.cancel({ notifications: [{ id: REST_NOTE }] }).catch(() => {}); }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) return;
    if (ui.liveOpen) wakeLock(true);
    if (NATIVE && LN && state.active && state.active.restEnd && state.active.restEnd <= Date.now()) Promise.resolve().then(() => LN.removeAllDeliveredNotifications()).catch(() => {});
  });
  // Tela sempre acesa durante o treino.
  let lock = null;
  async function wakeLock(on) {
    if (KNATIVE) { KNATIVE.keepAwake({ on }).catch(() => {}); return; }
    try {
      if (on && 'wakeLock' in navigator && !lock && document.visibilityState === 'visible') { lock = await navigator.wakeLock.request('screen'); lock.addEventListener('release', () => { lock = null; }); }
      else if (!on && lock) { await lock.release(); lock = null; }
    } catch { lock = null; }
  }
  if (!NATIVE && 'serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});

  /* ---------------- Abertura animada ---------------- */
  const splash = $('#splash');
  if (splash) {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let gone = false;
    const hide = () => {
      if (gone) return;
      gone = true;
      splash.classList.add('out');
      setTimeout(() => splash.remove(), 760);
    };
    const t = setTimeout(hide, reduce ? 700 : 3500);
    splash.addEventListener('click', () => { clearTimeout(t); hide(); });
  }

  /* ---------------- Início ---------------- */
  applyTheme();
  setTab('inicio');
  if (!state.profile && !state.workouts.length && !state.routines.length) openOnboarding(false);
  else if (state.active) openLive();
})();
