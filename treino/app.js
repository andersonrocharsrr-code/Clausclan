/* Forja — app de musculação. Tudo fica salvo no aparelho (localStorage). */
(() => {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const store = (fn) => { try { return fn(); } catch { return null; } };

  /* ---------------- Biblioteca de exercícios ---------------- */
  const GROUPS = ['Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Antebraço', 'Quadríceps', 'Posterior', 'Glúteos', 'Panturrilha', 'Abdômen', 'Cardio'];
  const EQUIPS = ['Barra', 'Halteres', 'Máquina', 'Polia', 'Peso corporal', 'Smith', 'Kettlebell', 'Elástico', 'Outro'];
  // kind: w = carga × repetições · bw = peso corporal (carga extra opcional) · t = tempo em segundos
  const LIB = [
    ['supino-reto', 'Supino reto', 'Peito', 'Barra'],
    ['supino-inclinado', 'Supino inclinado', 'Peito', 'Barra'],
    ['supino-declinado', 'Supino declinado', 'Peito', 'Barra'],
    ['supino-reto-halter', 'Supino reto com halteres', 'Peito', 'Halteres'],
    ['supino-inclinado-halter', 'Supino inclinado com halteres', 'Peito', 'Halteres'],
    ['supino-maquina', 'Supino na máquina', 'Peito', 'Máquina'],
    ['crucifixo-halter', 'Crucifixo com halteres', 'Peito', 'Halteres'],
    ['peck-deck', 'Voador (peck deck)', 'Peito', 'Máquina'],
    ['crossover', 'Crossover', 'Peito', 'Polia'],
    ['flexao', 'Flexão de braço', 'Peito', 'Peso corporal', 'bw'],
    ['paralelas', 'Paralelas', 'Peito', 'Peso corporal', 'bw'],
    ['barra-fixa', 'Barra fixa', 'Costas', 'Peso corporal', 'bw'],
    ['puxada-frente', 'Puxada frontal', 'Costas', 'Polia'],
    ['puxada-triangulo', 'Puxada com triângulo', 'Costas', 'Polia'],
    ['pulldown', 'Pulldown braço reto', 'Costas', 'Polia'],
    ['remada-curvada', 'Remada curvada', 'Costas', 'Barra'],
    ['remada-unilateral', 'Remada unilateral (serrote)', 'Costas', 'Halteres'],
    ['remada-baixa', 'Remada baixa', 'Costas', 'Polia'],
    ['remada-cavalinho', 'Remada cavalinho', 'Costas', 'Barra'],
    ['remada-maquina', 'Remada na máquina', 'Costas', 'Máquina'],
    ['levantamento-terra', 'Levantamento terra', 'Costas', 'Barra'],
    ['hiperextensao', 'Hiperextensão lombar', 'Costas', 'Peso corporal', 'bw'],
    ['desenvolvimento-barra', 'Desenvolvimento com barra', 'Ombros', 'Barra'],
    ['desenvolvimento-halter', 'Desenvolvimento com halteres', 'Ombros', 'Halteres'],
    ['desenvolvimento-maquina', 'Desenvolvimento na máquina', 'Ombros', 'Máquina'],
    ['elevacao-lateral', 'Elevação lateral', 'Ombros', 'Halteres'],
    ['elevacao-lateral-polia', 'Elevação lateral na polia', 'Ombros', 'Polia'],
    ['elevacao-frontal', 'Elevação frontal', 'Ombros', 'Halteres'],
    ['crucifixo-inverso', 'Crucifixo inverso', 'Ombros', 'Halteres'],
    ['face-pull', 'Face pull', 'Ombros', 'Polia'],
    ['remada-alta', 'Remada alta', 'Ombros', 'Barra'],
    ['encolhimento', 'Encolhimento (trapézio)', 'Ombros', 'Halteres'],
    ['rosca-direta', 'Rosca direta', 'Bíceps', 'Barra'],
    ['rosca-alternada', 'Rosca alternada', 'Bíceps', 'Halteres'],
    ['rosca-martelo', 'Rosca martelo', 'Bíceps', 'Halteres'],
    ['rosca-scott', 'Rosca Scott', 'Bíceps', 'Barra'],
    ['rosca-concentrada', 'Rosca concentrada', 'Bíceps', 'Halteres'],
    ['rosca-inclinada', 'Rosca inclinada', 'Bíceps', 'Halteres'],
    ['rosca-polia', 'Rosca na polia', 'Bíceps', 'Polia'],
    ['triceps-corda', 'Tríceps corda', 'Tríceps', 'Polia'],
    ['triceps-pulley', 'Tríceps pulley (barra)', 'Tríceps', 'Polia'],
    ['triceps-testa', 'Tríceps testa', 'Tríceps', 'Barra'],
    ['triceps-frances', 'Tríceps francês', 'Tríceps', 'Halteres'],
    ['triceps-coice', 'Tríceps coice', 'Tríceps', 'Halteres'],
    ['supino-fechado', 'Supino fechado', 'Tríceps', 'Barra'],
    ['mergulho-banco', 'Mergulho no banco', 'Tríceps', 'Peso corporal', 'bw'],
    ['rosca-punho', 'Rosca de punho', 'Antebraço', 'Barra'],
    ['rosca-inversa', 'Rosca inversa', 'Antebraço', 'Barra'],
    ['agachamento', 'Agachamento livre', 'Quadríceps', 'Barra'],
    ['agachamento-smith', 'Agachamento no Smith', 'Quadríceps', 'Smith'],
    ['agachamento-goblet', 'Agachamento goblet', 'Quadríceps', 'Kettlebell'],
    ['agachamento-bulgaro', 'Agachamento búlgaro', 'Quadríceps', 'Halteres'],
    ['leg-press', 'Leg press 45°', 'Quadríceps', 'Máquina'],
    ['hack', 'Hack', 'Quadríceps', 'Máquina'],
    ['cadeira-extensora', 'Cadeira extensora', 'Quadríceps', 'Máquina'],
    ['afundo', 'Afundo', 'Quadríceps', 'Halteres'],
    ['passada', 'Passada', 'Quadríceps', 'Halteres'],
    ['stiff', 'Stiff', 'Posterior', 'Barra'],
    ['terra-romeno', 'Levantamento terra romeno', 'Posterior', 'Barra'],
    ['mesa-flexora', 'Mesa flexora', 'Posterior', 'Máquina'],
    ['cadeira-flexora', 'Cadeira flexora', 'Posterior', 'Máquina'],
    ['good-morning', 'Good morning', 'Posterior', 'Barra'],
    ['elevacao-pelvica', 'Elevação pélvica', 'Glúteos', 'Barra'],
    ['gluteo-polia', 'Glúteo na polia (coice)', 'Glúteos', 'Polia'],
    ['cadeira-abdutora', 'Cadeira abdutora', 'Glúteos', 'Máquina'],
    ['cadeira-adutora', 'Cadeira adutora', 'Glúteos', 'Máquina'],
    ['ponte', 'Ponte de glúteo', 'Glúteos', 'Peso corporal', 'bw'],
    ['panturrilha-pe', 'Panturrilha em pé', 'Panturrilha', 'Máquina'],
    ['panturrilha-sentado', 'Panturrilha sentado', 'Panturrilha', 'Máquina'],
    ['panturrilha-leg', 'Panturrilha no leg press', 'Panturrilha', 'Máquina'],
    ['abdominal-supra', 'Abdominal supra', 'Abdômen', 'Peso corporal', 'bw'],
    ['abdominal-infra', 'Abdominal infra', 'Abdômen', 'Peso corporal', 'bw'],
    ['elevacao-pernas', 'Elevação de pernas', 'Abdômen', 'Peso corporal', 'bw'],
    ['abdominal-polia', 'Abdominal na polia', 'Abdômen', 'Polia'],
    ['roda-abdominal', 'Roda abdominal', 'Abdômen', 'Peso corporal', 'bw'],
    ['prancha', 'Prancha', 'Abdômen', 'Peso corporal', 't'],
    ['prancha-lateral', 'Prancha lateral', 'Abdômen', 'Peso corporal', 't'],
    ['esteira', 'Esteira', 'Cardio', 'Outro', 't'],
    ['bicicleta', 'Bicicleta', 'Cardio', 'Outro', 't'],
    ['eliptico', 'Elíptico', 'Cardio', 'Outro', 't'],
    ['escada', 'Escada', 'Cardio', 'Outro', 't'],
    ['corda', 'Pular corda', 'Cardio', 'Outro', 't'],
    ['remo-ergometro', 'Remo ergômetro', 'Cardio', 'Outro', 't'],
  ].map(([id, name, group, equip, kind]) => ({ id, name, group, equip, kind: kind || 'w' }));

  /* ---------------- Modelos de ficha ---------------- */
  const it = (ex, sets, reps, rest) => ({ ex, sets, reps, rest });
  const TEMPLATES = [
    {
      name: 'Full body (iniciante)', desc: '1 ficha para o corpo todo, 2–3× por semana',
      routines: [
        { name: 'Full body', items: [it('agachamento', 3, '10', 120), it('supino-reto', 3, '10', 90), it('puxada-frente', 3, '10', 90), it('desenvolvimento-halter', 3, '12', 75), it('stiff', 3, '10', 90), it('rosca-direta', 2, '12', 60), it('triceps-corda', 2, '12', 60), it('prancha', 3, '30', 45)] },
      ],
    },
    {
      name: 'ABC', desc: '3 fichas: peito/ombro/tríceps, costas/bíceps, pernas',
      routines: [
        { name: 'Treino A — Peito, ombro e tríceps', items: [it('supino-reto', 4, '8-10', 120), it('supino-inclinado-halter', 3, '10', 90), it('crossover', 3, '12', 60), it('desenvolvimento-halter', 3, '10', 90), it('elevacao-lateral', 3, '12-15', 60), it('triceps-corda', 3, '12', 60), it('triceps-testa', 3, '10', 60)] },
        { name: 'Treino B — Costas e bíceps', items: [it('puxada-frente', 4, '8-10', 90), it('remada-curvada', 4, '8-10', 120), it('remada-unilateral', 3, '10', 75), it('pulldown', 3, '12', 60), it('face-pull', 3, '15', 60), it('rosca-direta', 3, '10', 60), it('rosca-martelo', 3, '12', 60)] },
        { name: 'Treino C — Pernas', items: [it('agachamento', 4, '8', 150), it('leg-press', 4, '10-12', 120), it('cadeira-extensora', 3, '12-15', 60), it('stiff', 3, '10', 90), it('mesa-flexora', 3, '12', 60), it('elevacao-pelvica', 3, '10', 90), it('panturrilha-pe', 4, '15', 45)] },
      ],
    },
    {
      name: 'Push / Pull / Legs', desc: '3 fichas por movimento, ótimo para 3 ou 6 dias',
      routines: [
        { name: 'Push — Empurrar', items: [it('supino-reto', 4, '6-8', 150), it('desenvolvimento-barra', 3, '8', 120), it('supino-inclinado-halter', 3, '10', 90), it('elevacao-lateral', 4, '12-15', 60), it('paralelas', 3, '10', 90), it('triceps-corda', 3, '12', 60)] },
        { name: 'Pull — Puxar', items: [it('levantamento-terra', 3, '5', 180), it('barra-fixa', 4, '8', 120), it('remada-baixa', 3, '10', 90), it('face-pull', 3, '15', 60), it('rosca-direta', 3, '10', 60), it('rosca-martelo', 3, '12', 60)] },
        { name: 'Legs — Pernas', items: [it('agachamento', 4, '6-8', 180), it('terra-romeno', 3, '8-10', 120), it('leg-press', 3, '12', 90), it('cadeira-flexora', 3, '12', 60), it('agachamento-bulgaro', 3, '10', 75), it('panturrilha-sentado', 4, '15', 45), it('elevacao-pernas', 3, '12', 45)] },
      ],
    },
    {
      name: 'Superior / Inferior', desc: '2 fichas alternadas, 4 dias por semana',
      routines: [
        { name: 'Superior', items: [it('supino-reto', 4, '8', 120), it('remada-curvada', 4, '8', 120), it('desenvolvimento-halter', 3, '10', 90), it('puxada-frente', 3, '10', 90), it('elevacao-lateral', 3, '15', 60), it('rosca-alternada', 3, '12', 60), it('triceps-pulley', 3, '12', 60)] },
        { name: 'Inferior', items: [it('agachamento', 4, '8', 150), it('stiff', 4, '10', 120), it('leg-press', 3, '12', 90), it('cadeira-extensora', 3, '15', 60), it('mesa-flexora', 3, '12', 60), it('panturrilha-pe', 4, '15', 45), it('abdominal-polia', 3, '15', 45)] },
      ],
    },
  ];

  /* ---------------- Estado ---------------- */
  const KEY = 'forja-v1';
  const blank = () => ({
    v: 1,
    exercises: [], // exercícios criados pelo usuário
    routines: [],
    workouts: [],
    active: null,
    body: [],
    settings: { theme: 'auto', rest: 90, goal: 4, sound: true, notify: true },
  });
  let state = blank();
  const loaded = store(() => JSON.parse(localStorage.getItem(KEY)));
  if (loaded && loaded.v === 1) state = { ...blank(), ...loaded, settings: { ...blank().settings, ...(loaded.settings || {}) } };
  const save = () => store(() => localStorage.setItem(KEY, JSON.stringify(state)));

  const ui = { tab: 'treinar', liveOpen: false, libGroup: '', libQ: '', progEx: '' };

  const exMap = () => {
    const m = new Map(LIB.map((e) => [e.id, e]));
    state.exercises.forEach((e) => m.set(e.id, e));
    return m;
  };
  let EXM = exMap();
  const ex = (id) => EXM.get(id) || { id, name: 'Exercício removido', group: 'Outro', equip: 'Outro', kind: 'w' };
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
  const dur = (ms) => {
    const m = Math.round(ms / 60000);
    return m >= 60 ? `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}` : `${m} min`;
  };
  const secTxt = (s) => (s >= 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : `${s}s`);
  const parseNum = (v) => {
    const n = parseFloat(String(v ?? '').replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  };
  const dayKey = (d) => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
  const weekStart = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

  /* ---------------- Cálculos ---------------- */
  // 1RM estimado (fórmula de Epley).
  const e1rm = (w, r) => (!w || !r ? 0 : r === 1 ? w : w * (1 + r / 30));
  const counts = (s) => s.done && s.t !== 'w';
  const setVol = (s) => (counts(s) ? (s.w || 0) * (s.r || 0) : 0);
  const workoutVol = (w) => w.items.reduce((a, i) => (ex(i.ex).kind === 't' ? a : a + i.sets.reduce((b, s) => b + setVol(s), 0)), 0);
  const workoutSets = (w) => w.items.reduce((a, i) => a + i.sets.filter(counts).length, 0);
  const sorted = () => [...state.workouts].sort((a, b) => b.start - a.start);

  // Melhores marcas de cada exercício no histórico (sem o treino "skip").
  function bests(skipId, beforeTs = Infinity) {
    const m = {};
    for (const w of state.workouts) {
      if (w.id === skipId || w.start >= beforeTs) continue;
      for (const i of w.items) {
        const b = m[i.ex] || (m[i.ex] = { e1rm: 0, w: 0, r: 0, vol: 0 });
        for (const s of i.sets) {
          if (!counts(s)) continue;
          b.e1rm = Math.max(b.e1rm, e1rm(s.w, s.r));
          b.w = Math.max(b.w, s.w || 0);
          b.r = Math.max(b.r, s.r || 0);
          b.vol = Math.max(b.vol, (s.w || 0) * (s.r || 0));
        }
      }
    }
    return m;
  }
  // Séries da última vez que o exercício foi feito.
  function lastSets(exId, skipId) {
    for (const w of sorted()) {
      if (w.id === skipId) continue;
      const i = w.items.find((x) => x.ex === exId);
      if (i) return i.sets.filter((s) => s.done);
    }
    return [];
  }
  // Semanas seguidas batendo a meta (a semana atual conta só se já bateu).
  function weekStreak() {
    const goal = state.settings.goal;
    const byWeek = {};
    state.workouts.forEach((w) => { const k = weekStart(w.start).getTime(); byWeek[k] = (byWeek[k] || 0) + 1; });
    let n = 0;
    let wk = weekStart(Date.now());
    if ((byWeek[wk.getTime()] || 0) >= goal) n++;
    wk = addDays(wk, -7);
    while ((byWeek[wk.getTime()] || 0) >= goal) { n++; wk = addDays(wk, -7); }
    return n;
  }

  /* ---------------- Aviso rápido ---------------- */
  let toastT;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove('show'), 2600);
  }

  /* ---------------- Tema ---------------- */
  function applyTheme() {
    const t = state.settings.theme;
    if (t === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', t);
  }

  /* ---------------- Ícones ---------------- */
  const I = {
    play: '<svg viewBox="0 0 24 24"><path d="M7 4.5v15a1 1 0 0 0 1.5.9l12-7.5a1 1 0 0 0 0-1.8l-12-7.5A1 1 0 0 0 7 4.5Z"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    dots: '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/></svg>',
    up: '<svg viewBox="0 0 24 24"><path d="m6 15 6-6 6 6"/></svg>',
    down: '<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>',
    x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    go: '<svg viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg>',
    trophy: '<svg viewBox="0 0 24 24" style="width:13px;height:13px"><path d="M8 4h8v5a4 4 0 0 1-8 0V4ZM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8"/></svg>',
  };
  const initials = (name) => name.split(/\s+/).filter((w) => w.length > 2).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || name.slice(0, 2).toUpperCase();

  /* ================================================================
     Abas
     ================================================================ */
  function setTab(tab) {
    ui.tab = tab;
    $$('.tab').forEach((b) => b.setAttribute('aria-current', b.dataset.tab === tab ? 'page' : 'false'));
    render();
    window.scrollTo({ top: 0 });
  }
  $$('.tab').forEach((b) => b.addEventListener('click', () => setTab(b.dataset.tab)));

  function render() {
    const v = $('#view');
    const subs = { treinar: 'Bora treinar', historico: 'Seus treinos', progresso: 'Sua evolução', exercicios: 'Biblioteca' };
    $('#topSub').textContent = subs[ui.tab];
    if (ui.tab === 'treinar') v.innerHTML = viewTreinar();
    else if (ui.tab === 'historico') v.innerHTML = viewHistorico();
    else if (ui.tab === 'progresso') { v.innerHTML = viewProgresso(); mountCharts(); }
    else v.innerHTML = viewExercicios();
    updateResume();
  }

  /* ---------------- Treinar ---------------- */
  function nextRoutineId() {
    if (!state.routines.length) return null;
    const last = sorted().find((w) => w.routineId && state.routines.some((r) => r.id === w.routineId));
    if (!last) return state.routines[0].id;
    const idx = state.routines.findIndex((r) => r.id === last.routineId);
    return state.routines[(idx + 1) % state.routines.length].id;
  }

  function viewTreinar() {
    const ws = weekStart(Date.now());
    const week = state.workouts.filter((w) => w.start >= ws.getTime());
    const goal = state.settings.goal;
    const days = new Set(week.map((w) => dayKey(w.start)));
    const today = dayKey(Date.now());
    const labels = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
    const dayHtml = labels.map((l, i) => {
      const k = dayKey(addDays(ws, i));
      return `<div class="hero__day ${days.has(k) ? 'done' : ''} ${k === today ? 'today' : ''}">${l}<i>${days.has(k) ? I.check : ''}</i></div>`;
    }).join('');
    const vol = week.reduce((a, w) => a + workoutVol(w), 0);
    const streak = weekStreak();
    const nextId = nextRoutineId();

    const routines = state.routines.map((r) => {
      const names = r.items.map((i) => ex(i.ex).name).join(' · ');
      const sets = r.items.reduce((a, i) => a + Number(i.sets || 0), 0);
      const last = sorted().find((w) => w.routineId === r.id);
      return `<div class="card routine">
        <div class="routine__body">
          <div class="routine__name">${esc(r.name)}${r.id === nextId && state.workouts.length ? ' <span class="pr-tag" style="background:var(--accent)">PRÓXIMO</span>' : ''}</div>
          <div class="routine__ex">${esc(names) || 'Sem exercícios'}</div>
          <div class="routine__meta">${r.items.length} exercícios · ${sets} séries${last ? ` · último: ${fShort.format(last.start)}` : ''}</div>
        </div>
        <div class="routine__actions">
          <button class="play" type="button" data-act="start" data-id="${r.id}" aria-label="Iniciar ${esc(r.name)}">${I.play}</button>
          <button class="mini-btn" type="button" data-act="edit-routine" data-id="${r.id}">Editar</button>
        </div>
      </div>`;
    }).join('');

    return `
      <section class="hero">
        <div class="hero__label">Esta semana</div>
        <div class="hero__big">${week.length}<small> / ${goal} treinos</small></div>
        <div class="hero__days">${dayHtml}</div>
        <div class="hero__stats">
          <div><b>${streak}</b>${streak === 1 ? 'semana na meta' : 'semanas na meta'}</div>
          <div><b>${bigKg(vol)}</b>volume na semana</div>
          <div><b>${state.workouts.length}</b>treinos no total</div>
        </div>
      </section>
      ${state.active ? `<button class="btn btn--primary btn--block" style="margin-top:12px" data-act="open-live">Continuar treino em andamento</button>`
        : `<button class="btn btn--soft btn--block" style="margin-top:12px" data-act="start-empty">+ Começar treino livre</button>`}
      <div class="sec-title"><h2>Minhas fichas</h2><div><button class="link" data-act="templates">Modelos</button> · <button class="link" data-act="new-routine">+ Nova</button></div></div>
      ${routines || `<div class="card empty"><b>Nenhuma ficha ainda</b>Crie sua ficha de treino ou comece com um modelo pronto.
        <div class="row-btns"><button class="btn btn--primary" data-act="templates">Usar modelo</button><button class="btn" data-act="new-routine">Criar ficha</button></div></div>`}
    `;
  }

  /* ---------------- Histórico ---------------- */
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
      <div class="hist__ex">${lines}${more}</div>
    </button>`;
  }
  // Quantos recordes cada treino bateu (comparando só com os treinos anteriores a ele).
  function prCounts() {
    const best = {};
    const out = {};
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
    if (!list.length) return `<div class="card empty" style="margin-top:8px"><b>Nenhum treino registrado</b>Quando você finalizar um treino, ele aparece aqui.</div>`;
    const prs = prCounts();
    let html = '';
    let month = '';
    for (const w of list) {
      const m = fMonth.format(w.start);
      if (m !== month) {
        const n = list.filter((x) => fMonth.format(x.start) === m).length;
        html += `<div class="month">${m} · ${n} treino${n > 1 ? 's' : ''}</div>`;
        month = m;
      }
      html += workoutCard(w, prs[w.id]);
    }
    return html;
  }

  function openWorkout(id) {
    const w = state.workouts.find((x) => x.id === id);
    if (!w) return;
    const prev = bests(w.id, w.start);
    const body = `
      <div class="stat-grid">
        <div class="stat"><small>Duração</small><b>${dur(w.end - w.start)}</b></div>
        <div class="stat"><small>Volume</small><b>${bigKg(workoutVol(w))}</b></div>
        <div class="stat"><small>Séries</small><b>${workoutSets(w)}</b></div>
      </div>
      <p class="fine" style="text-align:left">${fDay.format(w.start)} · ${fTime.format(w.start)}–${fTime.format(w.end)}</p>
      ${w.items.map((i) => {
        const e = ex(i.ex);
        let n = 0;
        return `<div class="detail-ex"><h3>${esc(e.name)}</h3>
          ${i.note ? `<p class="fine" style="text-align:left;margin:-2px 0 6px">${esc(i.note)}</p>` : ''}
          <div class="detail-sets">${i.sets.filter((s) => s.done).map((s) => {
            const lbl = s.t === 'w' ? 'A' : s.t === 'd' ? 'D' : String(++n);
            const pr = counts(s) && e.kind !== 't' && prev[i.ex] && e1rm(s.w, s.r) > prev[i.ex].e1rm;
            return `<span class="k">${lbl}</span><span>${setText(e, s)}${pr ? ' <span class="pr-tag">PR</span>' : ''}</span><span class="e">${e.kind === 'w' && s.r ? `1RM ≈ ${nf0.format(e1rm(s.w, s.r))}` : ''}</span>`;
          }).join('')}</div></div>`;
      }).join('')}
      ${w.note ? `<p>${esc(w.note)}</p>` : ''}
      <div class="actions">
        <button type="button" class="btn btn--soft" data-act="repeat" data-id="${w.id}">Repetir treino</button>
        <button type="button" class="btn" data-act="save-as-routine" data-id="${w.id}">Salvar como ficha</button>
      </div>
      <button type="button" class="btn btn--danger-ghost btn--block" data-act="delete-workout" data-id="${w.id}">Excluir treino</button>`;
    showInfo(w.name, body);
  }
  const setText = (e, s) => (e.kind === 't' ? `${s.w ? `${nf1.format(s.w)} kg · ` : ''}${secTxt(s.r || 0)}` : e.kind === 'bw' ? `${s.r} reps${s.w ? ` · +${nf1.format(s.w)} kg` : ''}` : `${nf1.format(s.w || 0)} kg × ${s.r}`);

  function showInfo(title, html) {
    $('#infoTitle').textContent = title;
    $('#infoBody').innerHTML = html;
    const d = $('#dlgInfo');
    if (!d.open) d.showModal();
    $('#infoBody').parentElement.scrollTop = 0;
  }

  /* ---------------- Exercícios ---------------- */
  function viewExercicios() {
    let html = `<div class="lib-head">
      <div class="search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input type="search" id="libQ" placeholder="Buscar entre ${allEx().length} exercícios" value="${esc(ui.libQ)}" autocomplete="off"></div>
      <div class="chips" style="margin:0 -16px">${['', ...GROUPS].map((g) => `<button type="button" class="chip" data-act="lib-group" data-g="${g}" aria-pressed="${ui.libGroup === g}">${g || 'Todos'}</button>`).join('')}</div>
    </div>
    <button class="btn btn--soft btn--block" data-act="new-ex">+ Criar exercício</button>
    <div id="libList">${libList()}</div>`;
    return html;
  }
  function libList() {
    const q = ui.libQ.trim().toLowerCase();
    const list = allEx().filter((e) => (!ui.libGroup || e.group === ui.libGroup) && (!q || norm(e.name).includes(norm(q))));
    const usage = {};
    state.workouts.forEach((w) => w.items.forEach((i) => { usage[i.ex] = (usage[i.ex] || 0) + 1; }));
    let html = '';
    for (const g of GROUPS) {
      const items = list.filter((e) => e.group === g);
      if (!items.length) continue;
      html += `<div class="lib-group">${g}</div>`;
      html += items.map((e) => `<button class="pick" type="button" data-act="ex-detail" data-id="${e.id}" style="width:100%">
        <span class="pick__ico">${initials(e.name)}</span>
        <span class="pick__body"><span class="pick__name">${esc(e.name)}</span><br><span class="pick__sub">${esc(e.equip)}${usage[e.id] ? ` · feito ${usage[e.id]}×` : ''}${state.exercises.includes(e) ? ' · criado por você' : ''}</span></span>
        <span class="pick__go">${I.go}</span></button>`).join('');
    }
    if (!list.length) html += `<div class="empty"><b>Nada encontrado</b>Crie esse exercício no botão acima.</div>`;
    return html;
  }
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  function exHistory(id) {
    return [...state.workouts].sort((a, b) => a.start - b.start)
      .map((w) => ({ w, i: w.items.find((x) => x.ex === id) }))
      .filter((x) => x.i && x.i.sets.some(counts));
  }
  function openExercise(id) {
    const e = ex(id);
    const hist = exHistory(id);
    const b = bests()[id];
    const custom = state.exercises.some((x) => x.id === id);
    let body = `<p class="fine" style="text-align:left;margin-top:-6px">${esc(e.group)} · ${esc(e.equip)}</p>`;
    if (!hist.length) {
      body += `<div class="empty"><b>Ainda sem registros</b>Faça esse exercício num treino para ver sua evolução.</div>`;
    } else {
      body += e.kind === 't'
        ? `<div class="stat-grid"><div class="stat"><small>Maior tempo</small><b>${secTxt(b.r)}</b></div><div class="stat"><small>Sessões</small><b>${hist.length}</b></div><div class="stat"><small>Última</small><b>${fShort.format(hist[hist.length - 1].w.start)}</b></div></div>`
        : `<div class="stat-grid">
          ${e.kind === 'w' ? `<div class="stat"><small>1RM estimado</small><b>${nf1.format(b.e1rm)}<em>kg</em></b></div>` : `<div class="stat"><small>Mais reps</small><b>${b.r}</b></div>`}
          <div class="stat"><small>Maior carga</small><b>${nf1.format(b.w)}<em>kg</em></b></div>
          <div class="stat"><small>Sessões</small><b>${hist.length}</b></div>
        </div>`;
      body += `<div class="card" style="margin:12px 0 0;box-shadow:none;background:var(--surface-2)"><div class="chart-head"><h3>${e.kind === 'w' ? '1RM estimado' : e.kind === 't' ? 'Maior tempo' : 'Mais repetições'}</h3><span>por treino</span></div><div class="chart" data-chart="ex" data-id="${id}"></div></div>`;
      body += `<div class="sec-title" style="margin-top:16px"><h2>Últimas sessões</h2></div>`;
      body += hist.slice(-6).reverse().map(({ w, i }) => `<div class="detail-ex"><h3 style="font-weight:600">${fDay.format(w.start)} <span class="fine">· ${esc(w.name)}</span></h3>
        <div class="detail-sets">${i.sets.filter(counts).map((s, n) => `<span class="k">${n + 1}</span><span>${setText(e, s)}</span><span class="e">${e.kind === 'w' ? `1RM ≈ ${nf0.format(e1rm(s.w, s.r))}` : ''}</span>`).join('')}</div></div>`).join('');
    }
    if (custom) body += `<button type="button" class="btn btn--danger-ghost btn--block" data-act="delete-ex" data-id="${id}">Excluir exercício</button>`;
    showInfo(e.name, body);
    mountCharts($('#infoBody'));
  }

  /* ---------------- Progresso ---------------- */
  function viewProgresso() {
    const now = Date.now();
    const ws = weekStart(now).getTime();
    const prevWs = addDays(ws, -7).getTime();
    const weekVol = state.workouts.filter((w) => w.start >= ws).reduce((a, w) => a + workoutVol(w), 0);
    const prevVol = state.workouts.filter((w) => w.start >= prevWs && w.start < ws).reduce((a, w) => a + workoutVol(w), 0);
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
    const monthN = state.workouts.filter((w) => w.start >= monthStart.getTime()).length;
    const totalTime = state.workouts.reduce((a, w) => a + (w.end - w.start), 0);
    const delta = prevVol ? Math.round(((weekVol - prevVol) / prevVol) * 100) : null;

    // Mapa de calor: 12 semanas, segunda a domingo.
    const days = new Set(state.workouts.map((w) => dayKey(w.start)));
    const start = addDays(weekStart(now), -77);
    let heat = '';
    for (let c = 0; c < 12; c++) {
      heat += '<div class="heat__col">';
      for (let r = 0; r < 7; r++) {
        const d = addDays(start, c * 7 + r);
        const fut = d.getTime() > now;
        heat += `<i class="${fut ? 'fut' : days.has(dayKey(d)) ? 'on' : ''}" title="${fShort.format(d)}"></i>`;
      }
      heat += '</div>';
    }

    // Séries por grupo muscular nos últimos 30 dias.
    const since = now - 30 * 864e5;
    const byGroup = {};
    state.workouts.filter((w) => w.start >= since).forEach((w) => w.items.forEach((i) => {
      const g = ex(i.ex).group;
      byGroup[g] = (byGroup[g] || 0) + i.sets.filter(counts).length;
    }));
    const groups = Object.entries(byGroup).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);
    const gmax = Math.max(1, ...groups.map(([, n]) => n));

    const used = [...new Set(state.workouts.flatMap((w) => w.items.filter((i) => i.sets.some(counts)).map((i) => i.ex)))]
      .map(ex).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    if (!used.some((e) => e.id === ui.progEx)) ui.progEx = used[0]?.id || '';
    const body = [...state.body].sort((a, b) => a.d.localeCompare(b.d));
    const lastBody = body[body.length - 1];

    return `
      <div class="kpis" style="margin-top:6px">
        <div class="kpi"><small>Treinos no mês</small><b>${monthN}</b><span>${state.workouts.length} no total</span></div>
        <div class="kpi"><small>Volume na semana</small><b>${bigKg(weekVol)}</b><span>${delta === null ? 'semana passada: —' : `${delta >= 0 ? '▲' : '▼'} ${Math.abs(delta)}% vs. semana passada`}</span></div>
        <div class="kpi"><small>Semanas na meta</small><b>${weekStreak()}</b><span>meta: ${state.settings.goal} treinos/semana</span></div>
        <div class="kpi"><small>Tempo treinando</small><b>${Math.round(totalTime / 3600000)}<em>h</em></b><span>${state.workouts.length ? `média ${dur(totalTime / state.workouts.length)}` : 'nenhum treino'}</span></div>
      </div>

      <div class="sec-title"><h2>Frequência</h2></div>
      <div class="card"><div class="heat">${heat}</div><div class="heat-leg"><span>12 semanas atrás</span><span>hoje</span></div></div>

      <div class="sec-title"><h2>Volume por semana</h2></div>
      <div class="card"><div class="chart" data-chart="weekvol"></div></div>

      <div class="sec-title"><h2>Séries por grupo · 30 dias</h2></div>
      <div class="card">${groups.length ? `<div class="hbars">${groups.map(([g, n]) => `<div class="hbar"><span>${g}</span><div class="hbar__track"><div class="hbar__fill" style="width:${(n / gmax) * 100}%"></div></div><b>${n}</b></div>`).join('')}</div>` : '<div class="chart-empty">Treine para ver como as séries se dividem entre os músculos.</div>'}</div>

      <div class="sec-title"><h2>Evolução por exercício</h2></div>
      <div class="card">${used.length ? `<select class="select-ex" id="progEx">${used.map((e) => `<option value="${e.id}" ${e.id === ui.progEx ? 'selected' : ''}>${esc(e.name)}</option>`).join('')}</select>
        <div class="chart" data-chart="ex" data-id="${ui.progEx}"></div>
        <button class="link" data-act="ex-detail" data-id="${ui.progEx}">Ver recordes e sessões ›</button>` : '<div class="chart-empty">Seus exercícios aparecem aqui depois do primeiro treino.</div>'}</div>

      <div class="sec-title"><h2>Peso corporal</h2>${lastBody ? `<span class="fine">${nf1.format(lastBody.kg)} kg em ${fShort.format(new Date(lastBody.d + 'T12:00'))}</span>` : ''}</div>
      <div class="card">
        <div class="chart" data-chart="body"></div>
        <form class="inline-form" id="bodyForm">
          <input id="bodyKg" inputmode="decimal" placeholder="Seu peso hoje (kg)" aria-label="Peso corporal em kg">
          <button class="btn btn--primary" type="submit">Salvar</button>
        </form>
      </div>
    `;
  }

  /* ---------------- Gráficos (SVG simples, com dica ao tocar) ---------------- */
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
    const n = pts.length;
    const bw = pw / n;
    const x = (i) => (type === 'bar' ? L + bw * i + bw / 2 : L + (n === 1 ? pw / 2 : (pw * i) / (n - 1)));
    let g = '<g class="grid">';
    let ax = '<g class="axis">';
    for (let k = 0; k <= 4; k++) {
      const v = lo + step * k;
      g += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/>`;
      ax += `<text x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${fmt.axis(v)}</text>`;
    }
    const lblEvery = Math.ceil(n / 6);
    pts.forEach((p, i) => { if (i % lblEvery === 0 || i === n - 1) ax += `<text x="${x(i)}" y="${H - 6}" text-anchor="middle">${esc(p.label)}</text>`; });
    g += '</g>'; ax += '</g>';
    let marks = '';
    if (type === 'bar') {
      const w = Math.min(28, bw - 6);
      marks = pts.map((p, i) => {
        const top = y(p.y), base = y(lo), h = Math.max(0, base - top);
        const r = Math.min(4, h, w / 2);
        // Barra com cantos de cima arredondados, presa na base.
        const x0 = x(i) - w / 2;
        return h > 0 ? `<path class="bar ${p.dim ? 'dim' : ''}" d="M${x0},${base}V${top + r}Q${x0},${top} ${x0 + r},${top}H${x0 + w - r}Q${x0 + w},${top} ${x0 + w},${top + r}V${base}Z"/>` : '';
      }).join('');
    } else {
      const d = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i)},${y(p.y)}`).join('');
      marks = `<path class="area" d="${d}L${x(n - 1)},${y(lo)}L${x(0)},${y(lo)}Z"/><path class="ln" d="${d}"/>`;
      if (n <= 24) marks += pts.map((p, i) => `<circle class="dot" cx="${x(i)}" cy="${y(p.y)}" r="4"/>`).join('');
      else marks += `<circle class="dot" cx="${x(n - 1)}" cy="${y(pts[n - 1].y)}" r="4"/>`;
    }
    const hits = pts.map((p, i) => {
      const hw = type === 'bar' ? bw : n === 1 ? pw : pw / (n - 1);
      return `<rect class="hit" data-i="${i}" x="${x(i) - hw / 2}" y="${T}" width="${hw}" height="${ph + B}"/>`;
    }).join('');
    return { svg: `<svg viewBox="0 0 ${W} ${H}" role="img">${g}${ax}${marks}<line class="xh" y1="${T}" y2="${T + ph}" x1="0" x2="0" visibility="hidden"/>${hits}</svg>`, x, y, W };
  }
  function drawChart(el, type, pts, fmt, opts) {
    if (!pts.length) { el.innerHTML = `<div class="chart-empty">${opts.empty}</div>`; return; }
    const c = chartSvg(type, pts, fmt, opts);
    el.innerHTML = c.svg + '<div class="tip" hidden></div>';
    el.setAttribute('aria-label', opts.label || '');
    const svg = $('svg', el), tip = $('.tip', el), xh = $('.xh', el);
    const show = (i) => {
      const p = pts[i];
      const scale = svg.getBoundingClientRect().width / c.W;
      tip.innerHTML = `${esc(fmt.tip(p.y))}<small>${esc(p.sub || p.label)}</small>`;
      tip.style.left = `${c.x(i) * scale}px`;
      tip.style.top = `${c.y(p.y) * scale}px`;
      tip.hidden = false;
      if (type !== 'bar') { xh.setAttribute('x1', c.x(i)); xh.setAttribute('x2', c.x(i)); xh.setAttribute('visibility', 'visible'); }
    };
    const hide = () => { tip.hidden = true; xh.setAttribute('visibility', 'hidden'); };
    $$('.hit', el).forEach((h) => {
      h.addEventListener('pointerenter', () => show(+h.dataset.i));
      h.addEventListener('pointerdown', () => show(+h.dataset.i));
    });
    svg.addEventListener('pointerleave', hide);
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
          pts.push({ label: fShort.format(a), y: Math.round(v), sub: k === 0 ? 'esta semana' : `semana de ${fShort.format(a)}`, dim: k === 0 });
        }
        if (!pts.some((p) => p.y)) pts.length = 0;
        drawChart(el, 'bar', pts, { axis: (v) => (v >= 1000 ? `${nf1.format(v / 1000)}t` : nf0.format(v)), tip: (v) => bigKg(v) }, { zero: true, empty: 'Seu volume semanal (carga × repetições) aparece aqui.', label: 'Volume por semana' });
      } else if (kind === 'body') {
        const pts = [...state.body].sort((a, b) => a.d.localeCompare(b.d)).slice(-30).map((b) => ({ label: fShort.format(new Date(b.d + 'T12:00')), y: b.kg, sub: fDate.format(new Date(b.d + 'T12:00')) }));
        drawChart(el, 'line', pts, { axis: (v) => nf1.format(v), tip: (v) => kg(v) }, { empty: 'Registre seu peso para acompanhar a evolução.', label: 'Peso corporal' });
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

  /* ================================================================
     Treino em andamento
     ================================================================ */
  let liveBests = {};
  function newSet(t = 'n') { return { w: '', r: '', t, done: false }; }

  function startWorkout(routine, fromWorkout) {
    if (state.active) {
      if (!confirm('Já existe um treino em andamento. Descartar e começar outro?')) { openLive(); return; }
    }
    const items = [];
    const src = routine ? routine.items.map((i) => ({ ex: i.ex, n: Number(i.sets) || 3, reps: i.reps, rest: Number(i.rest) || state.settings.rest }))
      : fromWorkout ? fromWorkout.items.map((i) => ({ ex: i.ex, n: i.sets.filter((s) => s.done).length || 1, reps: '', rest: i.rest || state.settings.rest }))
        : [];
    for (const s of src) items.push({ ex: s.ex, target: s.reps, rest: s.rest, note: '', sets: Array.from({ length: s.n }, () => newSet()) });
    state.active = {
      id: uid(),
      name: routine ? routine.name : fromWorkout ? fromWorkout.name : `Treino de ${new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(new Date())}`,
      routineId: routine ? routine.id : fromWorkout ? fromWorkout.routineId || null : null,
      start: Date.now(),
      items,
      restEnd: 0,
      restTotal: 0,
    };
    save();
    openLive();
    if (!items.length) setTimeout(() => openPicker('live'), 250);
  }

  function openLive() {
    if (!state.active) return;
    liveBests = bests();
    ui.liveOpen = true;
    $('#live').hidden = false;
    $('#liveName').value = state.active.name;
    document.body.style.overflow = 'hidden';
    renderLive();
    updateResume();
    wakeLock(true);
  }
  function closeLive() {
    ui.liveOpen = false;
    $('#live').hidden = true;
    document.body.style.overflow = '';
    closeMenu();
    render();
    wakeLock(false);
  }

  function prevText(e, p) {
    if (!p) return '—';
    if (e.kind === 't') return secTxt(p.r || 0);
    if (e.kind === 'bw') return p.w ? `+${nf1.format(p.w)}×${p.r}` : `${p.r}`;
    return `${nf1.format(p.w || 0)}×${p.r}`;
  }
  function renderLive() {
    const a = state.active;
    if (!a) return;
    const body = $('#liveBody');
    const top = body.scrollTop;
    body.innerHTML = a.items.map((item, ii) => {
      const e = ex(item.ex);
      const prev = lastSets(item.ex);
      let n = 0;
      const rows = item.sets.map((s, si) => {
        const lbl = s.t === 'w' ? 'A' : s.t === 'd' ? 'D' : String(++n);
        const p = prev[si];
        const phW = p && p.w ? nf1.format(p.w) : '';
        const phR = p ? String(p.r) : (item.target || '').split('-').pop() || '';
        const pr = s.done && counts(s) && e.kind !== 't' && liveBests[item.ex] && e1rm(s.w, s.r) > liveBests[item.ex].e1rm && isTopSet(item, si);
        return `<tr class="${s.done ? 'done' : ''}" data-i="${ii}" data-s="${si}">
          <td><button type="button" class="set-n ${s.t}" data-act="set-type" title="Toque para mudar: normal, aquecimento (A), drop (D)">${lbl}</button></td>
          <td><button type="button" class="prev" data-act="copy-prev">${prevText(e, p)}</button></td>
          <td><input data-f="w" inputmode="decimal" enterkeyhint="next" value="${s.w === '' ? '' : esc(String(s.w).replace('.', ','))}" placeholder="${esc(phW)}" aria-label="Carga em kg"></td>
          <td><input data-f="r" inputmode="numeric" enterkeyhint="done" value="${esc(s.r)}" placeholder="${esc(phR)}" aria-label="${e.kind === 't' ? 'Segundos' : 'Repetições'}">${pr ? '<span class="pr-tag">PR</span>' : ''}</td>
          <td><button type="button" class="chk" data-act="check" aria-label="Concluir série" aria-pressed="${s.done}">${I.check}</button></td>
        </tr>`;
      }).join('');
      return `<div class="ex-card" data-i="${ii}">
        <div class="ex-card__head">
          <button type="button" class="ex-card__name" data-act="ex-detail" data-id="${e.id}">${esc(e.name)}
            <span class="ex-card__sub">${item.target ? `Meta: ${esc(item.target)} ${e.kind === 't' ? 's' : 'reps'} · ` : ''}descanso ${secTxt(item.rest)}</span></button>
          <button type="button" class="icon-btn ex-card__menu" data-act="ex-menu" aria-label="Opções do exercício">${I.dots}</button>
        </div>
        ${item.note || item.editNote ? `<textarea class="ex-note" data-act="note" rows="1" placeholder="Anotação (banco, pegada, regulagem…)">${esc(item.note)}</textarea>` : ''}
        <table class="sets"><thead><tr><th>Série</th><th>Anterior</th><th>${e.kind === 'bw' || e.kind === 't' ? '+kg' : 'kg'}</th><th>${e.kind === 't' ? 'seg' : 'reps'}</th><th></th></tr></thead><tbody>${rows}</tbody></table>
        <button type="button" class="add-set" data-act="add-set">+ Série</button>
      </div>`;
    }).join('') + `
      <button type="button" class="btn btn--soft btn--block" data-act="add-ex-live">+ Adicionar exercício</button>
      <button type="button" class="btn btn--danger-ghost btn--block" style="margin-top:8px" data-act="discard">Descartar treino</button>`;
    body.scrollTop = top;
    updateLiveMeta();
  }
  // O selo PR fica só na melhor série do exercício neste treino.
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

  // Edição dos campos sem redesenhar (mantém o teclado aberto).
  $('#liveBody').addEventListener('input', (ev) => {
    const a = state.active;
    const t = ev.target;
    if (t.matches('textarea[data-act="note"]')) {
      a.items[+t.closest('.ex-card').dataset.i].note = t.value;
      save();
      return;
    }
    const tr = t.closest('tr[data-i]');
    if (!tr || !t.dataset.f) return;
    const s = a.items[+tr.dataset.i].sets[+tr.dataset.s];
    if (t.dataset.f === 'w') s.w = t.value.trim() === '' ? '' : (parseNum(t.value) ?? '');
    else s.r = t.value.trim() === '' ? '' : Math.max(0, Math.round(parseNum(t.value) ?? 0));
    save();
    if (s.done) updateLiveMeta();
  });
  $('#liveBody').addEventListener('keydown', (ev) => {
    if (ev.key !== 'Enter' || !ev.target.dataset.f) return;
    ev.preventDefault();
    const tr = ev.target.closest('tr');
    if (ev.target.dataset.f === 'w') $('input[data-f="r"]', tr).focus();
    else { ev.target.blur(); $('[data-act="check"]', tr).click(); }
  });
  $('#liveName').addEventListener('input', (ev) => { if (state.active) { state.active.name = ev.target.value; save(); } });

  function toggleSet(ii, si) {
    const a = state.active;
    const item = a.items[ii];
    const s = item.sets[si];
    const e = ex(item.ex);
    if (!s.done) {
      const tr = $(`tr[data-i="${ii}"][data-s="${si}"]`);
      const wIn = $('input[data-f="w"]', tr), rIn = $('input[data-f="r"]', tr);
      if (s.w === '' && wIn.placeholder !== '') s.w = parseNum(wIn.placeholder) ?? 0;
      if (s.w === '') s.w = 0;
      if (s.r === '' && rIn.placeholder !== '') s.r = Math.round(parseNum(rIn.placeholder) ?? 0);
      if (!s.r) { toast(e.kind === 't' ? 'Informe o tempo em segundos.' : 'Informe as repetições.'); rIn.focus(); return; }
      s.done = true;
      s.at = Date.now();
      startRest(item.rest, e.name, item, si);
      vibrate(20);
    } else {
      s.done = false;
    }
    save();
    renderLive();
  }

  function liveAction(act, el) {
    const a = state.active;
    const card = el.closest('.ex-card');
    const tr = el.closest('tr[data-i]');
    const ii = card ? +card.dataset.i : tr ? +tr.dataset.i : -1;
    if (act === 'check') toggleSet(+tr.dataset.i, +tr.dataset.s);
    else if (act === 'set-type') {
      const s = a.items[+tr.dataset.i].sets[+tr.dataset.s];
      s.t = s.t === 'n' ? 'w' : s.t === 'w' ? 'd' : 'n';
      toast(s.t === 'w' ? 'Série de aquecimento (não conta no volume)' : s.t === 'd' ? 'Drop set' : 'Série normal');
      save(); renderLive();
    } else if (act === 'copy-prev') {
      const item = a.items[+tr.dataset.i];
      const p = lastSets(item.ex)[+tr.dataset.s];
      if (!p) return;
      const s = item.sets[+tr.dataset.s];
      s.w = p.w || 0; s.r = p.r;
      save(); renderLive();
    } else if (act === 'add-set') {
      const item = a.items[ii];
      const last = item.sets[item.sets.length - 1];
      const s = newSet(last && last.t === 'd' ? 'd' : 'n');
      if (last && last.done) { s.w = last.w; s.r = last.r; }
      item.sets.push(s);
      save(); renderLive();
    } else if (act === 'ex-menu') openExMenu(el, ii);
    else if (act === 'add-ex-live') openPicker('live');
    else if (act === 'discard') {
      if (!confirm('Descartar este treino? Nada será salvo.')) return;
      stopRest();
      state.active = null;
      save();
      closeLive();
    } else if (act === 'ex-detail') openExercise(el.dataset.id);
  }

  /* Menu de opções do exercício */
  let menuEl = null;
  function closeMenu() { if (menuEl) { menuEl.remove(); menuEl = null; } }
  function openExMenu(btn, ii) {
    closeMenu();
    const a = state.active;
    const item = a.items[ii];
    const m = document.createElement('div');
    m.className = 'menu-pop';
    m.innerHTML = `
      <button data-m="note">${item.note ? 'Editar anotação' : 'Adicionar anotação'}</button>
      <button data-m="rest">Descanso: ${secTxt(item.rest)}</button>
      <button data-m="del-set" ${item.sets.length ? '' : 'disabled'}>Remover última série</button>
      ${ii > 0 ? '<button data-m="up">Mover para cima</button>' : ''}
      ${ii < a.items.length - 1 ? '<button data-m="down">Mover para baixo</button>' : ''}
      <button data-m="swap">Trocar exercício</button>
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
      if (k === 'note') {
        item.editNote = true;
        renderLive();
        const ta = $(`.ex-card[data-i="${ii}"] textarea`);
        if (ta) ta.focus();
        return;
      }
      if (k === 'rest') {
        const opts = [0, 30, 45, 60, 75, 90, 120, 150, 180, 240, 300];
        const idx = opts.indexOf(item.rest);
        item.rest = opts[(idx + 1) % opts.length];
        toast(item.rest ? `Descanso: ${secTxt(item.rest)}` : 'Sem descanso automático');
      } else if (k === 'del-set') item.sets.pop();
      else if (k === 'up') [a.items[ii - 1], a.items[ii]] = [a.items[ii], a.items[ii - 1]];
      else if (k === 'down') [a.items[ii + 1], a.items[ii]] = [a.items[ii], a.items[ii + 1]];
      else if (k === 'swap') { openPicker('swap', ii); return; }
      else if (k === 'remove') {
        if (item.sets.some((s) => s.done) && !confirm(`Remover ${ex(item.ex).name} e as séries feitas?`)) return;
        a.items.splice(ii, 1);
      }
      save(); renderLive();
    });
  }
  document.addEventListener('pointerdown', (ev) => { if (menuEl && !menuEl.contains(ev.target) && !ev.target.closest('[data-act="ex-menu"]')) closeMenu(); });

  /* Relógio do treino e descanso */
  let restAlerted = false;
  let restCtx = '';
  function startRest(sec, exName, item, si) {
    const a = state.active;
    if (!sec) return;
    // Só descansa se ainda houver série depois desta (ou outro exercício a seguir).
    const moreHere = item.sets.slice(si + 1).some((s) => !s.done);
    const moreAfter = a.items.slice(a.items.indexOf(item) + 1).some((i) => i.sets.some((s) => !s.done));
    if (!moreHere && !moreAfter) { stopRest(); return; }
    a.restEnd = Date.now() + sec * 1000;
    a.restTotal = sec;
    restAlerted = false;
    const nextName = moreHere ? exName : ex(a.items.slice(a.items.indexOf(item) + 1).find((i) => i.sets.some((s) => !s.done)).ex).name;
    restCtx = nextName;
    scheduleRestNote();
    tick();
  }
  function adjustRest(d) {
    const a = state.active;
    if (!a || !a.restEnd) return;
    a.restEnd = Math.max(Date.now() + 1000, a.restEnd + d * 1000);
    a.restTotal = Math.max(a.restTotal + d, 1);
    restAlerted = false;
    save();
    scheduleRestNote();
    tick();
  }
  function stopRest() {
    if (state.active) { state.active.restEnd = 0; save(); }
    $('#rest').hidden = true;
    cancelRestNote();
  }
  function tick() {
    const a = state.active;
    if (!a) return;
    const now = Date.now();
    const t = clock(now - a.start);
    $('#liveClock').textContent = t;
    $('#resumeTime').textContent = t;
    const rest = $('#rest');
    if (a.restEnd) {
      const left = a.restEnd - now;
      rest.hidden = !ui.liveOpen;
      rest.classList.toggle('over', left <= 0);
      $('#restTime').textContent = clock(Math.max(0, left) + 999);
      $('#restFill').style.width = `${Math.max(0, Math.min(1, left / (a.restTotal * 1000))) * 100}%`;
      if (left <= 0 && !restAlerted) {
        restAlerted = true;
        restDone();
      }
      if (left < -4000) stopRest();
      $('#resumeName').textContent = left > 0 ? `Descanso · ${clock(left + 999)}` : a.name || 'Treino';
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

  /* Som, vibração e aviso no fim do descanso */
  let audio;
  function beep() {
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === 'suspended') audio.resume();
      [0, 0.22, 0.44].forEach((t, k) => {
        const o = audio.createOscillator(), g = audio.createGain();
        o.type = 'sine';
        o.frequency.value = k === 2 ? 1320 : 880;
        g.gain.setValueAtTime(0.0001, audio.currentTime + t);
        g.gain.exponentialRampToValueAtTime(0.35, audio.currentTime + t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + t + 0.18);
        o.connect(g).connect(audio.destination);
        o.start(audio.currentTime + t);
        o.stop(audio.currentTime + t + 0.2);
      });
    } catch { /* sem som */ }
  }
  const vibrate = (p) => { try { navigator.vibrate && navigator.vibrate(p); } catch { /* sem vibração */ } };
  function restDone() {
    if (state.settings.sound) { beep(); vibrate([200, 100, 200]); }
    if (!NATIVE && document.hidden && state.settings.notify && 'Notification' in window && Notification.permission === 'granted') {
      const opts = { body: `Próxima série: ${restCtx}`, icon: 'icon-192.png', tag: 'descanso', renotify: true };
      navigator.serviceWorker?.getRegistration().then((r) => (r ? r.showNotification('Descanso acabou 💪', opts) : new Notification('Descanso acabou 💪', opts))).catch(() => {});
    }
  }

  /* ================================================================
     Finalizar treino
     ================================================================ */
  function finishWorkout() {
    const a = state.active;
    const doneSets = a.items.reduce((n, i) => n + i.sets.filter((s) => s.done).length, 0);
    if (!doneSets) {
      if (confirm('Nenhuma série foi concluída. Descartar o treino?')) { stopRest(); state.active = null; save(); closeLive(); }
      return;
    }
    const pending = a.items.reduce((n, i) => n + i.sets.filter((s) => !s.done).length, 0);
    if (pending && !confirm(`${pending} série${pending > 1 ? 's' : ''} não ${pending > 1 ? 'foram marcadas' : 'foi marcada'} e ${pending > 1 ? 'serão descartadas' : 'será descartada'}. Finalizar mesmo assim?`)) return;
    const before = bests();
    const w = {
      id: a.id,
      name: (a.name || '').trim() || 'Treino',
      routineId: a.routineId,
      start: a.start,
      end: Date.now(),
      items: a.items.map((i) => ({ ex: i.ex, rest: i.rest, target: i.target, note: (i.note || '').trim(), sets: i.sets.filter((s) => s.done).map((s) => ({ w: Number(s.w) || 0, r: Number(s.r) || 0, t: s.t, done: true })) }))
        .filter((i) => i.sets.length),
    };
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
      const e = ex(i.ex);
      const b = before[i.ex];
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
    const body = `
      <div class="celebrate"><div class="celebrate__ico">${prs.length ? '🏆' : '💪'}</div><h3>${prs.length ? 'Treino com recorde!' : 'Treino concluído!'}</h3><p>Esse foi seu ${n}º treino. ${weekMsg()}</p></div>
      <div class="stat-grid">
        <div class="stat"><small>Duração</small><b>${dur(w.end - w.start)}</b></div>
        <div class="stat"><small>Volume</small><b>${bigKg(workoutVol(w))}</b></div>
        <div class="stat"><small>Séries</small><b>${workoutSets(w)}</b></div>
      </div>
      ${prs.length ? `<div class="sec-title" style="margin-top:8px"><h2>Recordes</h2></div><ul class="pr-list">${prs.map(([a, b]) => `<li><span>${esc(a)}</span><b>${esc(b)}</b></li>`).join('')}</ul>` : ''}
      <div class="actions">
        ${changed ? `<button type="button" class="btn btn--soft" data-act="update-routine" data-id="${w.id}">Atualizar a ficha com este treino</button>` : ''}
        ${!routine ? `<button type="button" class="btn btn--soft" data-act="save-as-routine" data-id="${w.id}">Salvar como ficha</button>` : ''}
        <button type="button" class="btn btn--primary" onclick="this.closest('dialog').close()">Fechar</button>
      </div>`;
    showInfo(w.name, body);
  }
  function weekMsg() {
    const ws = weekStart(Date.now()).getTime();
    const k = state.workouts.filter((w) => w.start >= ws).length;
    const g = state.settings.goal;
    return k >= g ? (k === g ? 'Meta da semana batida! 🎯' : `${k} treinos nesta semana.`) : `Faltam ${g - k} para a meta da semana.`;
  }
  function routineFromWorkout(w) {
    return w.items.map((i) => {
      const sets = i.sets.filter((s) => s.t !== 'w');
      const reps = sets.length ? Math.round(sets.reduce((a, s) => a + s.r, 0) / sets.length) : 10;
      return { ex: i.ex, sets: Math.max(1, sets.length), reps: i.target || String(reps), rest: i.rest || state.settings.rest };
    });
  }

  /* ================================================================
     Escolher exercícios
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
    let list = allEx().filter((e) => (!pick.group || e.group === pick.group) && (!q || norm(e.name).includes(q)));
    // Os mais usados primeiro.
    list = list.sort((a, b) => {
      const ra = recent.indexOf(a.id), rb = recent.indexOf(b.id);
      if (!q && !pick.group && (ra >= 0 || rb >= 0)) return (ra < 0 ? 1e9 : ra) - (rb < 0 ? 1e9 : rb);
      return GROUPS.indexOf(a.group) - GROUPS.indexOf(b.group) || a.name.localeCompare(b.name, 'pt-BR');
    });
    $('#pickList').innerHTML = list.map((e) => `<button type="button" class="pick ${pick.sel.includes(e.id) ? 'sel' : ''}" data-id="${e.id}">
      <span class="pick__ico">${initials(e.name)}</span>
      <span class="pick__body"><span class="pick__name">${esc(e.name)}</span><br><span class="pick__sub">${esc(e.group)} · ${esc(e.equip)}</span></span>
      <span class="pick__chk">${I.check}</span></button>`).join('') || '<div class="empty"><b>Nada encontrado</b>Toque em “Criar exercício”.</div>';
    const ok = $('#pickOk');
    ok.disabled = !pick.sel.length;
    ok.textContent = pick.sel.length > 1 ? `Adicionar ${pick.sel.length}` : pick.mode === 'swap' ? 'Trocar' : 'Adicionar';
  }
  $('#pickQ').addEventListener('input', renderPicker);
  $('#pickGroups').addEventListener('click', (ev) => {
    const b = ev.target.closest('.chip');
    if (!b) return;
    pick.group = b.dataset.g;
    renderPicker();
  });
  $('#pickList').addEventListener('click', (ev) => {
    const b = ev.target.closest('.pick');
    if (!b) return;
    const id = b.dataset.id;
    if (pick.mode === 'swap') pick.sel = [id];
    else pick.sel = pick.sel.includes(id) ? pick.sel.filter((x) => x !== id) : [...pick.sel, id];
    renderPicker();
  });
  $('#pickOk').addEventListener('click', () => {
    const ids = pick.sel;
    $('#dlgPick').close();
    if (pick.mode === 'live' && state.active) {
      ids.forEach((id) => state.active.items.push({ ex: id, target: '', rest: state.settings.rest, note: '', sets: [newSet(), newSet(), newSet()] }));
      save(); renderLive();
      setTimeout(() => { const b = $('#liveBody'); b.scrollTo({ top: b.scrollHeight, behavior: 'smooth' }); }, 50);
    } else if (pick.mode === 'swap' && state.active) {
      const item = state.active.items[pick.idx];
      item.ex = ids[0];
      item.sets.forEach((s) => { if (!s.done) { s.w = ''; s.r = ''; } });
      save(); renderLive();
    } else if (pick.mode === 'routine') {
      ids.forEach((id) => rt.items.push({ ex: id, sets: 3, reps: ex(id).kind === 't' ? '30' : '10', rest: state.settings.rest }));
      renderRoutineItems();
    }
  });
  $('#pickNew').addEventListener('click', () => openNewEx(true));

  /* Novo exercício */
  let newExFromPicker = false;
  function openNewEx(fromPicker) {
    newExFromPicker = fromPicker;
    $('#exName').value = fromPicker ? $('#pickQ').value.trim() : '';
    $('#exGroup').innerHTML = GROUPS.map((g) => `<option ${g === (pick.group || ui.libGroup) ? 'selected' : ''}>${g}</option>`).join('');
    $('#exEquip').innerHTML = EQUIPS.map((g) => `<option>${g}</option>`).join('');
    $('#dlgEx').showModal();
  }
  $('#exForm').addEventListener('submit', (ev) => {
    if (ev.submitter && ev.submitter.value === 'cancel') return;
    const name = $('#exName').value.trim();
    if (!name) { ev.preventDefault(); return; }
    const group = $('#exGroup').value, equip = $('#exEquip').value;
    const e = { id: `u-${uid()}`, name, group, equip, kind: group === 'Cardio' ? 't' : equip === 'Peso corporal' ? 'bw' : 'w' };
    state.exercises.push(e);
    EXM = exMap();
    save();
    toast('Exercício criado');
    if (newExFromPicker) {
      if (pick.mode === 'swap') pick.sel = [e.id]; else pick.sel.push(e.id);
      $('#pickQ').value = '';
      pick.group = '';
      renderPicker();
    } else render();
  });

  /* ================================================================
     Fichas
     ================================================================ */
  let rt = null; // ficha em edição
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
        <div class="rt-item__head">
          <span class="rt-item__name">${k + 1}. ${esc(e.name)}</span>
          <button type="button" class="rt-item__ctl" data-rt="up" aria-label="Subir" ${k ? '' : 'disabled'}>${I.up}</button>
          <button type="button" class="rt-item__ctl" data-rt="down" aria-label="Descer" ${k < rt.items.length - 1 ? '' : 'disabled'}>${I.down}</button>
          <button type="button" class="rt-item__ctl" data-rt="del" aria-label="Remover">${I.x}</button>
        </div>
        <div class="rt-item__grid">
          <label>Séries<input data-f="sets" inputmode="numeric" value="${esc(i.sets)}"></label>
          <label>${e.kind === 't' ? 'Segundos' : 'Reps'}<input data-f="reps" value="${esc(i.reps)}" placeholder="8-12"></label>
          <label>Descanso<select data-f="rest">${restOpts.map((s) => `<option value="${s}" ${Number(i.rest) === s ? 'selected' : ''}>${s ? secTxt(s) : 'sem'}</option>`).join('')}</select></label>
        </div>
      </div>`;
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
    const k = +b.closest('.rt-item').dataset.k;
    const a = rt.items;
    if (b.dataset.rt === 'up') [a[k - 1], a[k]] = [a[k], a[k - 1]];
    else if (b.dataset.rt === 'down') [a[k + 1], a[k]] = [a[k], a[k + 1]];
    else a.splice(k, 1);
    renderRoutineItems();
  });
  $('#rtAdd').addEventListener('click', () => openPicker('routine'));
  $('#rtSave').addEventListener('click', () => {
    rt.name = $('#rtName').value.trim() || `Treino ${String.fromCharCode(65 + state.routines.length % 26)}`;
    if (!rt.items.length) { toast('Adicione pelo menos um exercício.'); return; }
    if (rt.id) state.routines[state.routines.findIndex((r) => r.id === rt.id)] = rt;
    else { rt.id = uid(); state.routines.push(rt); }
    save();
    $('#dlgRoutine').close();
    toast('Ficha salva');
    render();
  });
  $('#rtDelete').addEventListener('click', () => {
    if (!confirm(`Excluir a ficha “${rt.name}”? Os treinos já feitos continuam no histórico.`)) return;
    state.routines = state.routines.filter((r) => r.id !== rt.id);
    save();
    $('#dlgRoutine').close();
    render();
  });

  function openTemplates() {
    showInfo('Modelos de ficha', `<p class="fine" style="text-align:left;margin-top:-4px">Escolha um ponto de partida. Depois você ajusta séries, repetições e exercícios do seu jeito.</p>
      ${TEMPLATES.map((t, k) => `<button type="button" class="card hist" data-act="use-template" data-k="${k}" style="background:var(--surface-2);box-shadow:none">
        <div class="hist__top"><span class="hist__name">${esc(t.name)}</span><span class="hist__date">${t.routines.length} ficha${t.routines.length > 1 ? 's' : ''}</span></div>
        <div class="hist__stats">${esc(t.desc)}</div>
        <div class="hist__ex">${t.routines.map((r) => `<div>${esc(r.name)} <span>· ${r.items.length} exercícios</span></div>`).join('')}</div>
      </button>`).join('')}`);
  }

  /* ================================================================
     Cliques gerais
     ================================================================ */
  document.addEventListener('click', (ev) => {
    const el = ev.target.closest('[data-act]');
    if (!el) return;
    const act = el.dataset.act;
    const id = el.dataset.id;
    if (el.closest('#liveBody')) { liveAction(act, el); return; }
    switch (act) {
      case 'start': startWorkout(state.routines.find((r) => r.id === id)); break;
      case 'start-empty': startWorkout(null); break;
      case 'open-live': openLive(); break;
      case 'edit-routine': openRoutine(id); break;
      case 'new-routine': openRoutine(null); break;
      case 'templates': openTemplates(); break;
      case 'use-template': {
        const t = TEMPLATES[+el.dataset.k];
        t.routines.forEach((r) => state.routines.push({ id: uid(), name: r.name, items: r.items.map((i) => ({ ...i })) }));
        save();
        $('#dlgInfo').close();
        toast(`${t.routines.length > 1 ? 'Fichas adicionadas' : 'Ficha adicionada'}: ${t.name}`);
        setTab('treinar');
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
        state.routines.push(r);
        w.routineId = r.id;
        save();
        $('#dlgInfo').close();
        toast('Ficha criada a partir do treino');
        render();
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
        save();
        $('#dlgInfo').close();
        render();
        break;
      case 'ex-detail': openExercise(id); break;
      case 'new-ex': openNewEx(false); break;
      case 'delete-ex':
        if (state.workouts.some((w) => w.items.some((i) => i.ex === id)) || state.routines.some((r) => r.items.some((i) => i.ex === id))) {
          toast('Esse exercício está em treinos ou fichas e não pode ser excluído.');
          return;
        }
        if (!confirm('Excluir este exercício?')) return;
        state.exercises = state.exercises.filter((e) => e.id !== id);
        EXM = exMap();
        save();
        $('#dlgInfo').close();
        render();
        break;
      case 'lib-group': ui.libGroup = el.dataset.g; render(); break;
      default: break;
    }
  });
  $('#view').addEventListener('input', (ev) => {
    if (ev.target.id === 'libQ') {
      ui.libQ = ev.target.value;
      $('#libList').innerHTML = libList();
    }
  });
  $('#view').addEventListener('change', (ev) => {
    if (ev.target.id === 'progEx') { ui.progEx = ev.target.value; render(); }
  });
  $('#view').addEventListener('submit', (ev) => {
    if (ev.target.id !== 'bodyForm') return;
    ev.preventDefault();
    const v = parseNum($('#bodyKg').value);
    if (!v || v < 20 || v > 400) { toast('Informe um peso válido em kg.'); return; }
    const d = dayKey(Date.now());
    state.body = state.body.filter((b) => b.d !== d);
    state.body.push({ d, kg: Math.round(v * 10) / 10 });
    save();
    toast('Peso salvo');
    render();
  });

  $('#liveMin').addEventListener('click', closeLive);
  $('#liveFinish').addEventListener('click', finishWorkout);
  $('#resumeBar').addEventListener('click', openLive);
  $('#rest').addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-rest]');
    if (!b) return;
    if (b.dataset.rest === 'skip') stopRest();
    else adjustRest(Number(b.dataset.rest));
  });

  /* ================================================================
     Ajustes, backup
     ================================================================ */
  function openSettings() {
    const s = state.settings;
    $('#stTheme').value = s.theme;
    $('#stRest').innerHTML = [30, 45, 60, 75, 90, 120, 150, 180, 240].map((v) => `<option value="${v}" ${v === s.rest ? 'selected' : ''}>${secTxt(v)}</option>`).join('');
    $('#stGoal').innerHTML = [1, 2, 3, 4, 5, 6, 7].map((v) => `<option value="${v}" ${v === s.goal ? 'selected' : ''}>${v}×</option>`).join('');
    $('#stSound').checked = s.sound;
    $('#stNotify').checked = s.notify;
    $('#dlgSettings').showModal();
  }
  $('#btnMenu').addEventListener('click', openSettings);
  $('#stTheme').addEventListener('change', (e) => { state.settings.theme = e.target.value; applyTheme(); save(); });
  $('#stRest').addEventListener('change', (e) => { state.settings.rest = Number(e.target.value); save(); });
  $('#stGoal').addEventListener('change', (e) => { state.settings.goal = Number(e.target.value); save(); render(); });
  $('#stSound').addEventListener('change', (e) => { state.settings.sound = e.target.checked; save(); if (e.target.checked) beep(); });
  $('#stNotify').addEventListener('change', async (e) => {
    state.settings.notify = e.target.checked;
    save();
    if (e.target.checked && !(await askNotify())) {
      e.target.checked = false;
      state.settings.notify = false;
      save();
      toast('Permita as notificações nas configurações do aparelho.');
    }
  });

  async function saveFile(name, text, mime) {
    if (NATIVE && FS && SHARE) {
      try {
        const r = await FS.writeFile({ path: name, data: text, directory: 'CACHE', encoding: 'utf8' });
        await SHARE.share({ title: name, files: [r.uri] });
        return;
      } catch (err) {
        if (String(err && err.message).toLowerCase().includes('cancel')) return;
        toast('Não consegui salvar o arquivo.');
        return;
      }
    }
    const url = URL.createObjectURL(new Blob([text], { type: mime }));
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  $('#stExport').addEventListener('click', () => {
    saveFile(`forja-backup-${dayKey(Date.now())}.json`, JSON.stringify({ app: 'forja', ...state }, null, 1), 'application/json');
  });
  $('#stImport').addEventListener('click', () => $('#stFile').click());
  $('#stFile').addEventListener('change', async (e) => {
    const f = e.target.files[0];
    e.target.value = '';
    if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      if (data.app !== 'forja' || !Array.isArray(data.workouts)) throw new Error('arquivo');
      if (!confirm(`Restaurar backup com ${data.workouts.length} treinos e ${(data.routines || []).length} fichas? Os dados atuais serão substituídos.`)) return;
      delete data.app;
      state = { ...blank(), ...data, settings: { ...blank().settings, ...(data.settings || {}) } };
      EXM = exMap();
      save();
      applyTheme();
      $('#dlgSettings').close();
      toast('Backup restaurado');
      render();
    } catch {
      toast('Esse arquivo não é um backup do Forja.');
    }
  });
  $('#stCsv').addEventListener('click', () => {
    const rows = [['data', 'treino', 'exercicio', 'grupo', 'serie', 'tipo', 'carga_kg', 'reps_ou_seg', '1rm_estimado']];
    [...state.workouts].sort((a, b) => a.start - b.start).forEach((w) => w.items.forEach((i) => {
      const e = ex(i.ex);
      i.sets.forEach((s, k) => rows.push([new Date(w.start).toISOString().slice(0, 16).replace('T', ' '), w.name, e.name, e.group, k + 1, s.t === 'w' ? 'aquecimento' : s.t === 'd' ? 'drop' : 'normal', String(s.w).replace('.', ','), s.r, e.kind === 'w' ? String(Math.round(e1rm(s.w, s.r) * 10) / 10).replace('.', ',') : '']));
    }));
    const csv = '﻿' + rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
    saveFile(`forja-treinos-${dayKey(Date.now())}.csv`, csv, 'text/csv');
  });
  $('#stWipe').addEventListener('click', () => {
    if (!confirm('Apagar TODOS os treinos, fichas e registros? Isso não pode ser desfeito.')) return;
    if (!confirm('Tem certeza? Faça um backup antes, se quiser guardar.')) return;
    stopRest();
    state = blank();
    EXM = exMap();
    save();
    applyTheme();
    $('#dlgSettings').close();
    if (ui.liveOpen) closeLive();
    render();
  });

  /* ================================================================
     App nativo (APK feito com Capacitor) e PWA
     ================================================================ */
  const Cap = window.Capacitor;
  const NATIVE = !!(Cap && Cap.isNativePlatform && Cap.isNativePlatform());
  const plugin = (name) => (NATIVE ? (Cap.Plugins && Cap.Plugins[name]) || (Cap.registerPlugin && Cap.registerPlugin(name)) || null : null);
  const LN = plugin('LocalNotifications');
  const FS = plugin('Filesystem');
  const SHARE = plugin('Share');
  const FORJA = plugin('ForjaNative');
  const REST_NOTE = 4201;

  if (NATIVE) {
    document.documentElement.classList.add('is-native');
    if (LN) {
      LN.createChannel({ id: 'descanso', name: 'Fim do descanso', description: 'Avisa quando o descanso entre as séries acaba', importance: 4, visibility: 1, vibration: true }).catch(() => {});
      LN.addListener('localNotificationActionPerformed', () => { if (state.active) openLive(); });
    }
    const AppPlugin = plugin('App');
    if (AppPlugin) {
      // Botão "voltar" do Android: fecha menus e janelas, minimiza o treino, volta para Treinar, depois minimiza o app.
      AppPlugin.addListener('backButton', () => {
        if (menuEl) { closeMenu(); return; }
        const open = [...document.querySelectorAll('dialog[open]')];
        if (open.length) { open[open.length - 1].close(); return; }
        if (ui.liveOpen) { closeLive(); return; }
        if (ui.tab !== 'treinar') { setTab('treinar'); return; }
        AppPlugin.minimizeApp();
      });
    }
  }
  async function askNotify() {
    if (NATIVE && LN) {
      try {
        let p = await LN.checkPermissions();
        if (p.display !== 'granted') p = await LN.requestPermissions();
        return p.display === 'granted';
      } catch { return false; }
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
      LN.schedule({ notifications: [{
        id: REST_NOTE, title: 'Descanso acabou 💪', body: `Próxima série: ${restCtx}`,
        schedule: { at: new Date(state.active.restEnd), allowWhileIdle: true },
        channelId: 'descanso', smallIcon: 'ic_stat_forja', iconColor: '#e8521c', autoCancel: true,
      }] }).catch(() => {});
    });
  }
  function cancelRestNote() {
    if (NATIVE && LN) LN.cancel({ notifications: [{ id: REST_NOTE }] }).catch(() => {});
  }
  // Quando o app volta para a frente, o aviso agendado não precisa mais aparecer.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) return;
    if (ui.liveOpen) wakeLock(true);
    if (NATIVE && LN && state.active && state.active.restEnd && state.active.restEnd <= Date.now()) Promise.resolve().then(() => LN.removeAllDeliveredNotifications()).catch(() => {});
  });

  // Tela sempre acesa durante o treino.
  let lock = null;
  async function wakeLock(on) {
    if (FORJA) { FORJA.keepAwake({ on }).catch(() => {}); return; }
    try {
      if (on && 'wakeLock' in navigator && !lock && document.visibilityState === 'visible') {
        lock = await navigator.wakeLock.request('screen');
        lock.addEventListener('release', () => { lock = null; });
      } else if (!on && lock) { await lock.release(); lock = null; }
    } catch { lock = null; }
  }

  if (!NATIVE && 'serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  /* ---------------- Início ---------------- */
  applyTheme();
  setTab('treinar');
  if (state.active) {
    // Volta direto para o treino que estava aberto.
    openLive();
  }
})();
