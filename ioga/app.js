/* Sereno — ioga em casa. Tudo fica salvo neste aparelho (localStorage). */
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const POSE = Object.fromEntries(POSES.map((p) => [p.id, p]));
const PROG = Object.fromEntries(PROGRAMS.map((p) => [p.id, p]));
const BR = Object.fromEntries(BREATHS.map((b) => [b.id, b]));
const GOAL = Object.fromEntries(GOALS.map((g) => [g.id, g]));
const NIVEL = { 1: 'Iniciante', 2: 'Intermediário', 3: 'Avançado' };
const MOODS = ['😣', '😕', '😐', '🙂', '😌'];
const TRANS = 5; // segundos para entrar em cada postura (fora das sequências em fluxo)
const ICON = {
  play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
  pause: '<svg viewBox="0 0 24 24"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>',
  voiceOn: '<svg viewBox="0 0 24 24"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>',
  voiceOff: '<svg viewBox="0 0 24 24"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="m16 9.5 5 5M21 9.5l-5 5"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M5 7h14M10 7V4.5h4V7M7 7l1 13h8l1-13"/></svg>',
};

/* ---------------- Dados salvos ---------------- */
const KEY = 'sereno-v1';
const DEFAULT = () => ({ v: 1, profile: null, settings: { voz: true, som: true, tema: 'auto', prep: 10 }, hist: [] });
let S = load();
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && s.v === 1) return { ...DEFAULT(), ...s, settings: { ...DEFAULT().settings, ...s.settings } };
  } catch { /* sem armazenamento: começa do zero */ }
  return DEFAULT();
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { toast('Não foi possível salvar neste aparelho.'); } }

/* ---------------- Datas e contas ---------------- */
const pad = (n) => String(n).padStart(2, '0');
const dkey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const fromKey = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const SEM = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const fmtClock = (s) => { s = Math.max(0, Math.ceil(s)); return s >= 60 ? `${Math.floor(s / 60)}:${pad(s % 60)}` : String(s); };
const fmtMin = (s) => `${Math.max(1, Math.round(s / 60))} min`;

function expand(itens) {
  const out = [];
  for (const [id, secs, cue] of itens) {
    if (POSE[id].lados) { out.push({ id, secs, cue, side: 'd' }, { id, secs, cue, side: 'e' }); }
    else out.push({ id, secs, cue });
  }
  return out;
}
function progSecs(p) {
  const st = expand(p.itens);
  return st.reduce((s, x) => s + x.secs, 0) + (p.flow ? 0 : TRANS * (st.length - 1)) + S.settings.prep;
}
const minutesOn = (k) => S.hist.filter((h) => h.d === k).reduce((s, h) => s + h.secs, 0) / 60;
function streak() {
  const set = new Set(S.hist.map((h) => h.d));
  let d = new Date();
  if (!set.has(dkey(d))) d = addDays(d, -1);
  let n = 0;
  while (set.has(dkey(d))) { n++; d = addDays(d, -1); }
  return n;
}
function bestStreak() {
  const days = [...new Set(S.hist.map((h) => h.d))].sort();
  let best = 0, run = 0, prev = null;
  for (const k of days) {
    run = prev && dkey(addDays(fromKey(prev), 1)) === k ? run + 1 : 1;
    best = Math.max(best, run); prev = k;
  }
  return best;
}
function weekDays() {
  const today = new Date();
  const mon = addDays(today, -((today.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => addDays(mon, i));
}

// Prática recomendada: pelo objetivo e pelo tempo disponível, mudando a cada dia. À noite, sugere relaxar.
function recommend() {
  const pr = S.profile || {};
  const hour = new Date().getHours();
  if (hour >= 20 || hour < 4) return PROG.dormir;
  let list = (GOAL[pr.goal] || GOALS[0]).progs.map((id) => PROG[id]);
  if (pr.level === 1 && !S.hist.length) return PROG.primeiros;
  if (pr.level === 1) list = list.filter((p) => p.nivel === 1).concat(PROG.primeiros);
  const fit = list.filter((p) => progSecs(p) / 60 <= (pr.mins || 15) + 4);
  const pool = fit.length ? fit : list;
  const dayIdx = Math.floor(Date.now() / 864e5);
  return pool[dayIdx % pool.length];
}

/* ---------------- Som, voz e tela acesa ---------------- */
let ac = null;
function audio() {
  if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; } }
  if (ac.state === 'suspended') ac.resume();
  return ac;
}
// Sino suave (sintetizado na hora, sem arquivo de áudio).
function bell(strong) {
  if (!S.settings.som) return;
  const a = audio(); if (!a) return;
  const t = a.currentTime, dur = strong ? 4.5 : 2.8;
  [[523.25, 0.16], [1046.5 * 1.004, 0.05], [1569.8 * 0.997, 0.025], [784, 0.03]].forEach(([f, g]) => {
    const o = a.createOscillator(), v = a.createGain();
    o.type = 'sine'; o.frequency.value = f;
    v.gain.setValueAtTime(0.0001, t);
    v.gain.exponentialRampToValueAtTime(g * (strong ? 1.3 : 1), t + 0.015);
    v.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(v).connect(a.destination); o.start(t); o.stop(t + dur + 0.1);
  });
}
let voice = null;
function pickVoice() {
  if (!('speechSynthesis' in window)) return;
  const vs = speechSynthesis.getVoices();
  voice = vs.find((v) => /pt[-_]BR/i.test(v.lang)) || vs.find((v) => /^pt/i.test(v.lang)) || null;
}
if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.addEventListener?.('voiceschanged', pickVoice); }
function speak(txt) {
  if (!S.settings.voz || !('speechSynthesis' in window) || !txt) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(txt);
    u.lang = 'pt-BR'; if (voice) u.voice = voice; u.rate = 0.92;
    speechSynthesis.speak(u);
  } catch { /* sem voz neste aparelho */ }
}
const hush = () => { try { speechSynthesis.cancel(); } catch { /* nada */ } };
let lock = null;
async function keepAwake(on) {
  try {
    if (on && 'wakeLock' in navigator && !lock) { lock = await navigator.wakeLock.request('screen'); lock.addEventListener('release', () => { lock = null; }); }
    if (!on && lock) { await lock.release(); lock = null; }
  } catch { lock = null; }
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && (P || B)) keepAwake(true); });

/* ---------------- Interface geral ---------------- */
let toastT = 0;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2600);
}
function applyTheme() {
  const t = S.settings.tema;
  if (t === 'auto') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = t;
}
const mini = (id, mir) => `<span class="mini">${Fig.svg(POSE[id].f, mir, 'fig--mini')}</span>`;

let tab = 'inicio';
let poseFilter = 'todas', poseQ = '', progFilter = 'todas';
const SUB = { inicio: 'Ioga em casa', praticas: 'Práticas guiadas', posturas: `${POSES.length} posturas explicadas`, respirar: 'Respiração guiada', progresso: 'Seu progresso', perfil: 'Perfil e ajustes' };
function go(t) {
  tab = t;
  $$('.tab').forEach((b) => b.classList.toggle('on', b.dataset.tab === t));
  $('#topSub').textContent = SUB[t];
  render();
  window.scrollTo(0, 0);
}
function render() {
  $('#view').innerHTML = VIEWS[tab]();
  const name = S.profile?.name?.trim();
  $('#btnProfile').textContent = name ? name[0].toUpperCase() : 'S';
}

/* ---------------- Início ---------------- */
function vInicio() {
  const pr = S.profile || {};
  const h = new Date().getHours();
  const saud = h < 5 ? 'Boa noite' : h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  const rec = recommend();
  const ids = [...new Set(rec.itens.map((i) => i[0]))].slice(0, 5);
  const days = weekDays(), today = dkey();
  const wkMin = days.reduce((s, d) => s + minutesOn(dkey(d)), 0);
  const st = streak();
  const date0 = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const date = date0[0].toUpperCase() + date0.slice(1);
  const evening = h >= 18 || h < 4;
  const quick = [
    { act: 'breath', id: 'coerente', min: 3, e: '🌬️', c: '#7fa98b', t: 'Respirar 3 minutos', s: 'Respiração coerente para acalmar' },
    evening
      ? { act: 'start', id: 'dormir', e: '🌙', c: '#5f6fa8', t: 'Antes de dormir', s: `${fmtMin(progSecs(PROG.dormir))} no chão, bem devagar` }
      : { act: 'start', id: 'pausa', e: '🪑', c: '#5aa59a', t: 'Pausa de 5 minutos', s: 'Alongar e voltar com a cabeça leve' },
    { act: 'breath', id: 'longa', min: 1, e: '🫧', c: '#6f9bb8', t: 'Um minuto de calma', s: 'Expiração longa, para momentos de ansiedade' },
  ];
  return `
  <section class="hello"><p class="hello__date">${esc(date)}</p><h2>${saud}${pr.name ? ', ' + esc(pr.name) : ''}</h2></section>
  <article class="hero" style="--c:${rec.cor}">
    <p class="eyebrow">Sua prática de hoje</p>
    <h3>${rec.nome}</h3>
    <p class="hero__meta">${fmtMin(progSecs(rec))} · ${NIVEL[rec.nivel]} · ${rec.tag}</p>
    <div class="strip">${ids.map((id) => mini(id)).join('')}</div>
    <div class="hero__btns">
      <button class="btn btn--primary btn--lg" data-act="start" data-id="${rec.id}">Começar</button>
      <button class="btn btn--ghost btn--lg" data-act="prog" data-id="${rec.id}">Ver posturas</button>
    </div>
  </article>
  <section class="stats">
    <div class="card stat"><strong>${st}</strong><span>${st === 1 ? 'dia seguido' : 'dias seguidos'}</span></div>
    <div class="card stat"><strong>${Math.round(wkMin)}</strong><span>min na semana</span></div>
    <div class="card stat"><strong>${S.hist.length}</strong><span>${S.hist.length === 1 ? 'prática' : 'práticas'}</span></div>
  </section>
  <section class="card week" aria-label="Esta semana">
    ${days.map((d) => { const k = dkey(d); return `<div class="day${minutesOn(k) > 0 ? ' on' : ''}${k === today ? ' today' : ''}"><i></i>${SEM[d.getDay()]}</div>`; }).join('')}
  </section>
  <h3 class="sec-title">Para agora</h3>
  <div class="quick">
    ${quick.map((q) => `<button class="card qcard" style="--c:${q.c}" data-act="${q.act}" data-id="${q.id}"${q.min ? ` data-min="${q.min}"` : ''}>
      <span class="qcard__ico">${q.e}</span><span><strong>${q.t}</strong><small>${q.s}</small></span><span class="qcard__go">›</span></button>`).join('')}
  </div>
  <article class="tip"><p class="eyebrow">Dica do dia</p><p>${TIPS[Math.floor(Date.now() / 864e5) % TIPS.length]}</p></article>`;
}

/* ---------------- Práticas ---------------- */
function vPraticas() {
  const tags = ['todas', ...new Set(PROGRAMS.map((p) => p.tag))];
  const list = PROGRAMS.filter((p) => progFilter === 'todas' || p.tag === progFilter);
  return `
  <div class="chips">${tags.map((t) => `<button class="chip${t === progFilter ? ' on' : ''}" data-act="pfilter" data-id="${t}">${t === 'todas' ? 'Todas' : t}</button>`).join('')}</div>
  <div class="plist">
  ${list.map((p) => {
    const st = expand(p.itens);
    const peak = p.itens.find(([id]) => !['montanha', 'sentado', 'mesa', 'crianca'].includes(id))?.[0] || p.itens[0][0];
    return `<button class="card pcard" style="--c:${p.cor}" data-act="prog" data-id="${p.id}">
      <div><h3>${p.nome}</h3><p>${p.desc}</p>
      <div class="meta"><span class="pill pill--c">${fmtMin(progSecs(p))}</span><span class="pill">${NIVEL[p.nivel]}</span><span class="pill">${st.length} posturas</span>${p.flow ? '<span class="pill">Em fluxo</span>' : ''}</div></div>
      <div class="fig-wrap">${Fig.svg(POSE[peak].f, false, 'fig--mini')}</div>
    </button>`;
  }).join('')}
  </div>`;
}

function openProg(id) {
  const p = PROG[id], st = expand(p.itens);
  openSheet(p.nome, `
    <p class="muted">${p.desc}</p>
    <div class="meta" style="--c:${p.cor};margin:12px 0 4px"><span class="pill pill--c">${fmtMin(progSecs(p))}</span><span class="pill">${NIVEL[p.nivel]}</span><span class="pill">${p.tag}</span>${p.flow ? '<span class="pill">Em fluxo: um movimento por respiração</span>' : ''}</div>
    <h4>Sequência</h4>
    <div class="seq">${st.map((s) => {
      const ps = POSE[s.id];
      return `<button class="seq__row" data-act="pose" data-id="${s.id}">${mini(s.id, s.side === 'e')}
        <span><strong>${ps.nome}</strong><small>${s.side ? (s.side === 'd' ? 'Lado direito' : 'Lado esquerdo') : ps.sans}</small></span>
        <time>${fmtClock(s.secs)}${s.secs < 60 ? ' s' : ''}</time></button>`;
    }).join('')}</div>
    <div class="sheet__foot"><button class="btn btn--primary btn--block btn--lg" data-act="start" data-id="${p.id}">Começar prática</button></div>`);
}

/* ---------------- Posturas ---------------- */
const TIPOS = ['todas', 'em pé', 'equilíbrio', 'apoio', 'sentada', 'deitada'];
const TIPO_NOME = { todas: 'Todas', 'em pé': 'Em pé', 'equilíbrio': 'Equilíbrio', apoio: 'No apoio', sentada: 'Sentadas', deitada: 'Deitadas' };
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
function poseList() {
  const q = norm(poseQ.trim());
  const list = POSES.filter((p) => (poseFilter === 'todas' || p.tipo === poseFilter) && (!q || norm(`${p.nome} ${p.sans} ${p.foco.join(' ')}`).includes(q)));
  if (!list.length) return '<p class="empty">Nenhuma postura encontrada.</p>';
  return `<div class="pgrid">${list.map((p) => `<button class="card posecard" data-act="pose" data-id="${p.id}">
    <div class="stage">${Fig.svg(p.f)}</div><strong>${p.nome}</strong><small>${p.sans}</small></button>`).join('')}</div>`;
}
function vPosturas() {
  return `
  <label class="search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
    <input type="search" id="poseQ" placeholder="Buscar postura, nome em sânscrito ou parte do corpo" value="${esc(poseQ)}" autocomplete="off" aria-label="Buscar postura"></label>
  <div class="chips">${TIPOS.map((t) => `<button class="chip${t === poseFilter ? ' on' : ''}" data-act="tfilter" data-id="${t}">${TIPO_NOME[t]}</button>`).join('')}</div>
  <div id="poseList">${poseList()}</div>`;
}

let sheetFig = null;
function openPose(id) {
  const p = POSE[id];
  const base = { 'em pé': 'montanha', 'equilíbrio': 'montanha', apoio: 'mesa', sentada: 'sentado', deitada: 'savasana' }[p.tipo];
  openSheet(p.nome, `
    <p class="sub">${p.sans} · ${NIVEL[p.nivel]}</p>
    <div class="stage-lg"><div id="sheetFig"></div></div>
    <div class="side-toggle">${p.lados ? '<button class="btn btn--sm btn--ghost" data-act="mirror">Ver o outro lado</button>' : '<button class="btn btn--sm btn--ghost" data-act="replay">Ver de novo</button>'}</div>
    <p style="margin-top:14px">${p.ben}</p>
    <h4>Como fazer</h4>
    <ol class="steps">${p.passos.map((s) => `<li>${s}</li>`).join('')}</ol>
    <div class="warn"><strong>Cuidado:</strong> ${p.cuidado}</div>
    <div class="sheet__foot"><button class="btn btn--primary btn--block btn--lg" data-act="try" data-id="${p.id}">Praticar 1 minuto</button></div>`);
  sheetFig = Fig.mount($('#sheetFig'), 'fig--breathe');
  sheetFig.set(POSE[base].f);
  sheetFig.mir = false; sheetFig.pose = p; sheetFig.base = base;
  setTimeout(() => sheetFig?.to(p.f, false, 1400), 350);
}

/* ---------------- Respirar ---------------- */
const FASE = { in: 'Inspire', out: 'Expire', hold: 'Segure' };
function vRespirar() {
  return `
  <p class="muted" style="margin:6px 2px 14px">Escolha um exercício e um tempo. Acompanhe o círculo: ele cresce quando você inspira e diminui quando expira.</p>
  ${BREATHS.map((b) => `<article class="card bcard" style="--c:${b.cor}">
    <div class="bcard__head"><span class="bcard__dot"></span><div><h3>${b.nome}</h3><span class="rhythm">${b.fases.map(([k, s]) => `${FASE[k]} ${s}s`).join(' · ')}</span></div></div>
    <p>${b.desc}</p>
    <div class="bcard__btns">${[1, 3, 5].map((m) => `<button class="btn btn--soft btn--sm" data-act="breath" data-id="${b.id}" data-min="${m}">${m} min</button>`).join('')}</div>
  </article>`).join('')}
  <p class="note">Se sentir tontura ou falta de ar, pare e volte a respirar normalmente.</p>`;
}

/* ---------------- Progresso ---------------- */
function vProgresso() {
  const total = S.hist.reduce((s, h) => s + h.secs, 0);
  const days = weekDays(), today = dkey();
  const mins = days.map((d) => minutesOn(dkey(d)));
  const max = Math.max(10, ...mins);
  // Calendário: as últimas 5 semanas, de segunda a domingo.
  const start = addDays(days[0], -28);
  const cal = Array.from({ length: 35 }, (_, i) => addDays(start, i));
  const lvl = (m) => (m <= 0 ? '' : m < 10 ? 'l1' : m < 20 ? 'l2' : 'l3');
  const hist = [...S.hist].sort((a, b) => b.ts - a.ts);
  return `
  <div class="grid2">
    <div class="card stat"><strong>${S.hist.length}</strong><span>práticas</span></div>
    <div class="card stat"><strong>${Math.round(total / 60)}</strong><span>min no total</span></div>
    <div class="card stat"><strong>${streak()}</strong><span>dias seguidos agora</span></div>
    <div class="card stat"><strong>${bestStreak()}</strong><span>maior sequência</span></div>
  </div>
  <h3 class="sec-title">Esta semana</h3>
  <div class="card bars" aria-label="Minutos por dia nesta semana">
    ${days.map((d, i) => `<div class="bar">${mins[i] ? `<b>${Math.round(mins[i])}</b>` : ''}<i class="${mins[i] ? '' : 'zero'}" style="height:${Math.max(4, (mins[i] / max) * 90)}px"></i>${SEM[d.getDay()]}</div>`).join('')}
  </div>
  <h3 class="sec-title">Últimas 5 semanas</h3>
  <div class="card cal">
    ${['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((s) => `<b>${s}</b>`).join('')}
    ${cal.map((d) => { const k = dkey(d); return `<span class="${lvl(minutesOn(k))}${k === today ? ' today' : ''}${k > today ? ' fut' : ''}" title="${d.toLocaleDateString('pt-BR')}"></span>`; }).join('')}
  </div>
  <h3 class="sec-title">Histórico</h3>
  ${hist.length ? `<div class="hist">${hist.slice(0, 60).map((h) => `<div class="card hrow">
    <span class="hrow__ico">${h.humor != null ? MOODS[h.humor] : h.tipo === 'resp' ? '🌬️' : '🧘'}</span>
    <span><strong>${esc(h.nome)}</strong><small>${fromKey(h.d).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })} · ${fmtMin(h.secs)}${h.poses ? ` · ${h.poses} posturas` : ''}</small></span>
    <button class="icon-btn" data-act="delhist" data-id="${h.id}" aria-label="Apagar do histórico">${ICON.trash}</button></div>`).join('')}</div>`
    : '<p class="empty">Suas práticas vão aparecer aqui.<br>Que tal começar com uma de 5 minutos?</p>'}`;
}

/* ---------------- Perfil ---------------- */
function vPerfil() {
  const pr = S.profile || {}, st = S.settings;
  const sel = (id, opts, val) => `<select id="${id}">${opts.map(([v, t]) => `<option value="${v}"${String(v) === String(val) ? ' selected' : ''}>${t}</option>`).join('')}</select>`;
  const sw = (id, on) => `<label class="switch"><input type="checkbox" id="${id}"${on ? ' checked' : ''}><i></i></label>`;
  return `
  <h3 class="sec-title" style="margin-top:8px">Você</h3>
  <div class="card group">
    <label class="field" style="margin:12px 0"><span>Seu nome</span><input id="pfName" type="text" maxlength="30" value="${esc(pr.name || '')}" placeholder="Como quer ser chamado"></label>
    <div class="row"><span>Objetivo</span>${sel('pfGoal', GOALS.map((g) => [g.id, g.nome]), pr.goal)}</div>
    <div class="row"><span>Nível</span>${sel('pfLevel', [[1, 'Iniciante'], [2, 'Intermediário'], [3, 'Avançado']], pr.level || 1)}</div>
    <div class="row"><span>Tempo por dia</span>${sel('pfMins', [[5, '5 min'], [10, '10 min'], [15, '15 min'], [20, '20 min ou mais']], pr.mins || 10)}</div>
  </div>
  <h3 class="sec-title">Prática</h3>
  <div class="card group">
    <div class="row"><span>Guia por voz<small>Fala o nome de cada postura e a dica</small></span>${sw('stVoz', st.voz)}</div>
    <div class="row"><span>Sino<small>Toca ao começar cada postura e ao terminar</small></span>${sw('stSom', st.som)}</div>
    <div class="row"><span>Tempo para se preparar</span>${sel('stPrep', [[5, '5 s'], [10, '10 s'], [15, '15 s']], st.prep)}</div>
    <div class="row"><span>Tema</span>${sel('stTema', [['auto', 'Automático'], ['light', 'Claro'], ['dark', 'Escuro']], st.tema)}</div>
  </div>
  <h3 class="sec-title">Seus dados</h3>
  <div class="card group">
    <p class="muted" style="padding-top:12px;font-size:13.5px">Tudo fica salvo só neste aparelho. Faça um backup de vez em quando.</p>
    <div class="btns">
      <button class="btn btn--soft btn--sm" data-act="export">Salvar backup</button>
      <button class="btn btn--ghost btn--sm" data-act="import">Restaurar backup</button>
      <button class="btn btn--danger btn--sm" data-act="reset">Apagar tudo</button>
    </div>
  </div>
  <p class="note" style="margin-top:6px">O Sereno traz orientações gerais de ioga e não substitui um profissional de saúde. Se estiver grávida, tiver lesões, pressão alta ou outra condição, converse com seu médico antes. Respeite seus limites: desconforto de alongamento é normal, dor não.</p>`;
}

const VIEWS = { inicio: vInicio, praticas: vPraticas, posturas: vPosturas, respirar: vRespirar, progresso: vProgresso, perfil: vPerfil };

/* ---------------- Folha de detalhes ---------------- */
function openSheet(title, html) {
  const d = $('#sheet');
  $('#sheetTitle').textContent = title;
  $('#sheetBody').innerHTML = html;
  if (!d.open) d.showModal();
  d.querySelector('.sheet__inner').scrollTop = 0;
  d.scrollTop = 0;
}
function closeSheet() { const d = $('#sheet'); if (d.open) d.close(); }
$('#sheet').addEventListener('close', () => { sheetFig?.stop(); sheetFig = null; });
$('#sheet').addEventListener('click', (e) => { if (e.target === e.currentTarget) closeSheet(); });
$('#sheetClose').addEventListener('click', closeSheet);

/* ---------------- Prática guiada ---------------- */
let P = null, playFig = null, timer = 0;
function startSession(cfg) {
  closeSheet();
  audio(); // libera o som (precisa de um toque do usuário)
  P = { ...cfg, i: 0, phase: 'prep', left: 0, total: 1, end: 0, paused: false, active: 0, last: performance.now(), poses: new Set(), started: Date.now() };
  const play = $('#play');
  play.hidden = false; play.classList.remove('paused');
  $('#playBody').hidden = false; $('#playCtrl').hidden = false; $('#playDone').hidden = true;
  $('#playName').textContent = cfg.nome;
  paintVoice();
  playFig = Fig.mount($('#playFig'), 'fig--breathe');
  const s0 = P.steps[0];
  const base = POSE[s0.id].tipo === 'deitada' ? 'savasana' : ['sentada', 'apoio'].includes(POSE[s0.id].tipo) ? 'sentado' : 'montanha';
  playFig.set(POSE[base].f);
  keepAwake(true);
  document.body.style.overflow = 'hidden';
  enter(0);
  clearInterval(timer);
  timer = setInterval(tick, 200);
}
function startProg(id) {
  const p = PROG[id];
  startSession({ ref: id, nome: p.nome, flow: !!p.flow, steps: expand(p.itens) });
}
function enter(i, skipPrep) {
  P.i = i;
  const s = P.steps[i], ps = POSE[s.id];
  const prep = i === 0 ? S.settings.prep : P.flow ? 0 : TRANS;
  playFig.to(ps.f, s.side === 'e', P.flow ? 800 : 1500);
  if (prep > 0 && !skipPrep) {
    phase('prep', prep);
    const lado = s.side ? `, lado ${s.side === 'd' ? 'direito' : 'esquerdo'}` : '';
    speak(i === 0 ? `Vamos começar. ${ps.nome}${lado}. ${s.cue || ps.dica}` : `${ps.nome}${lado}. ${s.cue || ps.dica}`);
  } else {
    phase('pose', s.secs);
    if (P.flow) speak(s.cue || ps.nome);
    else speak(`${ps.nome}. ${s.cue || ps.dica}`);
  }
}
function phase(name, secs) {
  P.phase = name; P.total = secs; P.left = secs; P.end = performance.now() + secs * 1000;
  if (name === 'pose') {
    P.poses.add(P.steps[P.i].id);
    if (!P.flow || P.i === 0) bell();
  }
  paint();
}
function tick() {
  if (!P || P.phase === 'done') return;
  const now = performance.now();
  if (!P.paused) P.active += (now - P.last) / 1000;
  P.last = now;
  if (P.paused) return;
  P.left = (P.end - now) / 1000;
  if (P.left <= 0) {
    if (P.phase === 'prep') phase('pose', P.steps[P.i].secs);
    else if (P.i + 1 < P.steps.length) enter(P.i + 1);
    else return finish();
  }
  paint();
}
function paint() {
  const s = P.steps[P.i], ps = POSE[s.id], n = P.steps.length;
  const ph = $('#playPhase');
  if (P.phase === 'prep') { ph.textContent = P.i === 0 ? 'Prepare-se' : 'Entre na postura'; ph.classList.add('warm'); }
  else { ph.textContent = s.side ? `Lado ${s.side === 'd' ? 'direito' : 'esquerdo'}` : P.flow ? 'Siga a respiração' : 'Mantenha e respire'; ph.classList.remove('warm'); }
  $('#playPose').textContent = ps.nome;
  $('#playSans').textContent = ps.sans;
  $('#playCue').textContent = s.cue || ps.dica;
  $('#playTime').textContent = fmtClock(P.left);
  $('#playRing').style.strokeDashoffset = String(276.5 * (1 - Math.max(0, P.left) / P.total));
  $('#playRing').style.stroke = P.phase === 'prep' ? 'var(--warm)' : '';
  const nx = P.steps[P.i + 1];
  $('#playNext').textContent = nx ? `A seguir: ${POSE[nx.id].nome}${nx.side ? ` (${nx.side === 'd' ? 'direito' : 'esquerdo'})` : ''}` : 'Última postura';
  const done = P.i + (P.phase === 'pose' ? 1 - Math.max(0, P.left) / P.total : 0);
  $('#playBar').style.width = `${(done / n) * 100}%`;
  const rest = P.steps.slice(P.i + 1).reduce((t, x) => t + x.secs + (P.flow ? 0 : TRANS), 0) + Math.max(0, P.left) + (P.phase === 'prep' ? s.secs : 0);
  $('#playMeta').textContent = `${P.i + 1} de ${n} · faltam ${fmtMin(rest)}`;
  $('#playPause').innerHTML = P.paused ? ICON.play : ICON.pause;
  $('#playPause').setAttribute('aria-label', P.paused ? 'Continuar' : 'Pausar');
}
function paintVoice() {
  const b = $('#playVoice');
  b.innerHTML = S.settings.voz ? ICON.voiceOn : ICON.voiceOff;
  b.setAttribute('aria-pressed', String(S.settings.voz));
}
function togglePause() {
  if (!P || P.phase === 'done') return;
  P.paused = !P.paused;
  if (P.paused) { P.left = (P.end - performance.now()) / 1000; hush(); }
  else P.end = performance.now() + P.left * 1000;
  $('#play').classList.toggle('paused', P.paused);
  paint();
}
function skip() {
  if (!P || P.phase === 'done') return;
  if (P.phase === 'prep') phase('pose', P.steps[P.i].secs);
  else if (P.i + 1 < P.steps.length) enter(P.i + 1);
  else finish();
  if (P.paused) { P.left = P.total; }
}
function back() {
  if (!P || P.phase === 'done') return;
  const spent = P.total - P.left;
  if (P.phase === 'pose' && spent > 3) enter(P.i, true);
  else enter(Math.max(0, P.i - 1), true);
  if (P.paused) P.left = P.total;
}
function finish() {
  P.phase = 'done';
  hush(); bell(true);
  keepAwake(false);
  const secs = Math.round(P.active);
  setTimeout(() => speak('Prática concluída. Muito bem.'), 600);
  $('#playBody').hidden = true; $('#playCtrl').hidden = true;
  const d = $('#playDone'); d.hidden = false;
  d.innerHTML = `
    <div class="done__badge">${ICON.check}</div>
    <h2>Prática concluída</h2>
    <p class="muted" style="margin-top:6px">${esc(P.nome)}</p>
    <div class="done__stats"><div><strong>${fmtMin(secs)}</strong><span>de prática</span></div><div><strong>${P.poses.size}</strong><span>posturas</span></div></div>
    <p><strong>Como você está se sentindo?</strong></p>
    <div class="moods">${MOODS.map((m, i) => `<button class="mood" data-mood="${i}" aria-label="Humor ${i + 1} de 5">${m}</button>`).join('')}</div>
    <button class="btn btn--primary btn--block btn--lg" id="doneSave">Salvar e sair</button>`;
  let mood = null;
  $$('.mood', d).forEach((b) => b.addEventListener('click', () => {
    mood = Number(b.dataset.mood);
    $$('.mood', d).forEach((x) => x.classList.toggle('on', x === b));
  }));
  $('#doneSave').addEventListener('click', () => { record(secs, mood); closePlay(); });
}
function record(secs, mood) {
  S.hist.push({ id: Date.now().toString(36), d: dkey(), ts: Date.now(), tipo: 'pratica', ref: P.ref, nome: P.nome, secs, poses: P.poses.size, humor: mood });
  save();
  const st = streak();
  toast(st > 1 ? `Prática salva. ${st} dias seguidos!` : 'Prática salva. Até amanhã!');
}
function closePlay() {
  clearInterval(timer); hush(); keepAwake(false);
  playFig?.stop(); playFig = null; P = null;
  $('#play').hidden = true;
  document.body.style.overflow = '';
  go(tab === 'perfil' ? 'inicio' : tab);
}
$('#playClose').addEventListener('click', () => {
  if (!P) return;
  if (P.phase === 'done') { $('#doneSave').click(); return; }
  const secs = Math.round(P.active);
  if (secs >= 60) {
    if (!confirm(`Encerrar a prática? Os ${fmtMin(secs)} que você já fez serão salvos.`)) return;
    record(secs, null);
  } else if (secs > 10 && !confirm('Encerrar a prática?')) return;
  closePlay();
});
$('#playPause').addEventListener('click', togglePause);
$('#playSkip').addEventListener('click', skip);
$('#playPrev').addEventListener('click', back);
$('#playVoice').addEventListener('click', () => {
  S.settings.voz = !S.settings.voz; save(); paintVoice();
  if (!S.settings.voz) hush();
  toast(S.settings.voz ? 'Guia por voz ligado' : 'Guia por voz desligado');
});

/* ---------------- Respiração guiada ---------------- */
let B = null, bTimer = 0;
function startBreath(id, min) {
  const ex = BR[id];
  audio();
  const now = performance.now();
  B = { ex, min, i: 0, start: now + 3000, end: now + 3000 + min * 60e3, pEnd: now + 3000, kind: null };
  const el = $('#breath'); el.hidden = false; el.style.setProperty('--c', ex.cor);
  $('#brName').textContent = ex.nome;
  $('#brEnd').hidden = true;
  $('#brPhase').textContent = 'Prepare-se'; $('#brCount').textContent = '';
  $('#brHint').textContent = 'Sente-se confortável, solte os ombros e, se quiser, feche os olhos.';
  const orb = $('#brOrb'); orb.style.transition = 'transform 2.5s ease-in-out'; orb.style.transform = 'scale(.55)';
  document.body.style.overflow = 'hidden';
  keepAwake(true);
  speak('Prepare-se. Sente-se confortável.');
  clearInterval(bTimer);
  bTimer = setInterval(bTick, 100);
}
function bNext() {
  const f = B.ex.fases, [kind, secs] = f[B.i % f.length];
  B.i++; B.kind = kind; B.pEnd = performance.now() + secs * 1000;
  const orb = $('#brOrb');
  orb.style.transition = `transform ${secs}s ${kind === 'hold' ? 'linear' : 'ease-in-out'}`;
  if (kind === 'in') orb.style.transform = 'scale(1)';
  if (kind === 'out') orb.style.transform = 'scale(.55)';
  $('#brPhase').textContent = FASE[kind];
  $('#brHint').textContent = { in: 'Puxe o ar pelo nariz, enchendo a barriga.', out: 'Solte o ar devagar, sem pressa.', hold: 'Segure o ar, com o corpo relaxado.' }[kind];
  speak(FASE[kind]);
}
function bTick() {
  if (!B) return;
  const now = performance.now();
  if (now < B.start) { $('#brCount').textContent = String(Math.ceil((B.start - now) / 1000)); $('#brLeft').textContent = `${B.min} min`; return; }
  if (now >= B.pEnd) {
    // Termina sempre no fim de um ciclo completo.
    if (now >= B.end && B.i % B.ex.fases.length === 0) return bFinish(true);
    bNext();
  }
  $('#brCount').textContent = String(Math.ceil((B.pEnd - now) / 1000));
  $('#brLeft').textContent = `faltam ${fmtClock(Math.max(0, (B.end - now) / 1000))}`;
}
function bFinish(complete) {
  clearInterval(bTimer);
  const secs = Math.round(Math.max(0, Math.min(performance.now(), B.end + 20000) - B.start) / 1000);
  hush();
  if (secs >= 30) {
    S.hist.push({ id: Date.now().toString(36), d: dkey(), ts: Date.now(), tipo: 'resp', ref: B.ex.id, nome: B.ex.nome, secs, poses: 0, humor: null });
    save();
  }
  if (!complete) return bClose(secs >= 30 ? 'Respiração salva.' : '');
  bell(true);
  setTimeout(() => speak('Muito bem. Volte a respirar normalmente.'), 500);
  const e = $('#brEnd'); e.hidden = false;
  e.innerHTML = `<div class="done__badge">${ICON.check}</div><h2>Pronto</h2><p>${fmtMin(secs)} de ${esc(B.ex.nome.toLowerCase())}. Perceba como o corpo está agora.</p>
    <button class="btn btn--primary btn--block btn--lg" id="brOk">Concluir</button>`;
  $('#brOk').addEventListener('click', () => bClose('Respiração salva.'));
}
function bClose(msg) {
  clearInterval(bTimer); hush(); keepAwake(false); B = null;
  $('#breath').hidden = true;
  document.body.style.overflow = '';
  render();
  if (msg) toast(msg);
}
$('#brClose').addEventListener('click', () => { if (!B) return; if (!$('#brEnd').hidden) return bClose('Respiração salva.'); bFinish(false); });

/* ---------------- Primeiro acesso ---------------- */
let onbStep = 0;
const onbData = { name: '', goal: null, level: null, mins: null };
const ONB = [
  () => ({
    html: `<div class="onb__hero">${Fig.svg(POSE.arvore.f, false, 'fig--breathe')}</div>
      <h2>Bem-vindo ao Sereno</h2>
      <p>Práticas de ioga guiadas para fazer em casa: posturas explicadas, um timer que conduz você e exercícios de respiração.</p>
      <p class="note">Antes de começar: o Sereno traz orientações gerais e não substitui um profissional de saúde. Se estiver grávida, tiver lesões, pressão alta ou outra condição, converse com seu médico. Respeite seus limites.</p>`,
    ok: () => true, btn: 'Entendi, vamos lá',
  }),
  () => ({
    html: `<h2>Como podemos te chamar?</h2><p>Opcional. Usamos só para te cumprimentar.</p>
      <label class="field"><span>Seu nome</span><input id="onbName" type="text" maxlength="30" autocomplete="given-name" value="${esc(onbData.name)}"></label>`,
    ok: () => true,
  }),
  () => ({
    html: `<h2>O que você busca na ioga?</h2><p>Vamos sugerir práticas para isso.</p>
      <div class="opts">${GOALS.map((g) => `<button class="opt${onbData.goal === g.id ? ' on' : ''}" data-k="goal" data-v="${g.id}"><span class="opt__e">${g.emoji}</span>${g.nome}</button>`).join('')}</div>`,
    ok: () => !!onbData.goal,
  }),
  () => ({
    html: `<h2>Qual é a sua experiência?</h2><p>Ajuda a escolher a intensidade.</p>
      <div class="opts">${[[1, '🌱', 'Nunca pratiquei ou faz tempo', 'Vamos começar pelo básico'], [2, '🌿', 'Pratico de vez em quando', 'Conheço as posturas principais'], [3, '🌳', 'Pratico com frequência', 'Quero desafios']].map(([v, e, t, s]) => `<button class="opt${onbData.level === v ? ' on' : ''}" data-k="level" data-v="${v}"><span class="opt__e">${e}</span><span>${t}<small>${s}</small></span></button>`).join('')}</div>`,
    ok: () => !!onbData.level,
  }),
  () => ({
    html: `<h2>Quanto tempo por dia?</h2><p>Pouco tempo todo dia funciona melhor do que muito tempo de vez em quando.</p>
      <div class="opts">${[[5, '5 minutos'], [10, '10 minutos'], [15, '15 minutos'], [20, '20 minutos ou mais']].map(([v, t]) => `<button class="opt${onbData.mins === v ? ' on' : ''}" data-k="mins" data-v="${v}"><span class="opt__e">⏱️</span>${t}</button>`).join('')}</div>`,
    ok: () => !!onbData.mins, btn: 'Montar minha rotina',
  }),
];
function onbRender() {
  const st = ONB[onbStep]();
  $('#onbBody').innerHTML = st.html;
  $('#onbFill').style.width = `${((onbStep + 1) / ONB.length) * 100}%`;
  $('#onbBack').style.visibility = onbStep ? 'visible' : 'hidden';
  $('#onbNext').textContent = st.btn || 'Continuar';
  $('#onbNext').disabled = !st.ok();
  $('#onbName')?.addEventListener('input', (e) => { onbData.name = e.target.value; });
  $$('.opt', $('#onbBody')).forEach((b) => b.addEventListener('click', () => {
    const v = b.dataset.v; onbData[b.dataset.k] = b.dataset.k === 'goal' ? v : Number(v);
    onbRender();
  }));
}
function onbDone() {
  S.profile = { name: onbData.name.trim(), goal: onbData.goal || 'calma', level: onbData.level || 1, mins: onbData.mins || 10 };
  save();
  $('#onb').hidden = true;
  go('inicio');
}
$('#onbNext').addEventListener('click', () => { if (onbStep < ONB.length - 1) { onbStep++; onbRender(); } else onbDone(); });
$('#onbBack').addEventListener('click', () => { if (onbStep) { onbStep--; onbRender(); } });
$('#onbSkip').addEventListener('click', onbDone);

/* ---------------- Ações (cliques) ---------------- */
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const { act, id } = el.dataset;
  switch (act) {
    case 'start': startProg(id); break;
    case 'prog': openProg(id); break;
    case 'pose': openPose(id); break;
    case 'try': {
      const p = POSE[id];
      startSession({ ref: 'pose:' + id, nome: p.nome, flow: false, steps: p.lados ? [{ id, secs: 30, side: 'd' }, { id, secs: 30, side: 'e' }] : [{ id, secs: 60 }] });
      break;
    }
    case 'mirror':
      if (sheetFig) { sheetFig.mir = !sheetFig.mir; sheetFig.to(sheetFig.pose.f, sheetFig.mir, 1200); el.textContent = sheetFig.mir ? 'Ver o primeiro lado' : 'Ver o outro lado'; }
      break;
    case 'replay':
      if (sheetFig) { sheetFig.to(POSE[sheetFig.base].f, false, 900); setTimeout(() => sheetFig?.to(sheetFig.pose.f, false, 1400), 1000); }
      break;
    case 'breath': startBreath(id, Number(el.dataset.min || 3)); break;
    case 'pfilter': progFilter = id; render(); break;
    case 'tfilter': poseFilter = id; render(); break;
    case 'delhist':
      if (confirm('Apagar esta prática do histórico?')) { S.hist = S.hist.filter((h) => h.id !== id); save(); render(); }
      break;
    case 'export': exportData(); break;
    case 'import': $('#fileIn').click(); break;
    case 'reset':
      if (confirm('Apagar todo o histórico e as preferências deste aparelho? Isso não pode ser desfeito.')) {
        try { localStorage.removeItem(KEY); } catch { /* nada */ }
        S = DEFAULT(); applyTheme(); showOnb();
      }
      break;
  }
});
$$('.tab').forEach((b) => b.addEventListener('click', () => go(b.dataset.tab)));
$('#btnProfile').addEventListener('click', () => go('perfil'));

// Busca de posturas (atualiza só a lista, para não perder o foco do campo).
document.addEventListener('input', (e) => {
  if (e.target.id === 'poseQ') { poseQ = e.target.value; $('#poseList').innerHTML = poseList(); }
  if (e.target.id === 'pfName') { S.profile = { ...(S.profile || {}), name: e.target.value.trim() }; save(); $('#btnProfile').textContent = (S.profile.name[0] || 'S').toUpperCase(); }
});
document.addEventListener('change', (e) => {
  const t = e.target, pr = S.profile || (S.profile = {});
  const map = {
    pfGoal: () => { pr.goal = t.value; }, pfLevel: () => { pr.level = Number(t.value); }, pfMins: () => { pr.mins = Number(t.value); },
    stVoz: () => { S.settings.voz = t.checked; }, stSom: () => { S.settings.som = t.checked; if (t.checked) { audio(); bell(); } },
    stPrep: () => { S.settings.prep = Number(t.value); }, stTema: () => { S.settings.tema = t.value; applyTheme(); },
  };
  if (map[t.id]) { map[t.id](); save(); toast('Salvo'); }
});

/* ---------------- Backup ---------------- */
function exportData() {
  const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `sereno-backup-${dkey()}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  toast('Backup salvo na pasta de downloads');
}
$('#fileIn').addEventListener('change', async (e) => {
  const f = e.target.files[0]; e.target.value = '';
  if (!f) return;
  try {
    const d = JSON.parse(await f.text());
    if (d?.v !== 1 || !Array.isArray(d.hist)) throw new Error('formato');
    if (!confirm(`Restaurar o backup com ${d.hist.length} práticas? Os dados atuais deste aparelho serão substituídos.`)) return;
    S = { ...DEFAULT(), ...d, settings: { ...DEFAULT().settings, ...d.settings } };
    save(); applyTheme(); go('inicio'); toast('Backup restaurado');
  } catch { toast('Esse arquivo não é um backup do Sereno.'); }
});

/* ---------------- Início do app ---------------- */
function showOnb() {
  onbStep = 0; Object.assign(onbData, { name: '', goal: null, level: null, mins: null });
  $('#onb').hidden = false; onbRender();
}
applyTheme();
go('inicio');
if (!S.profile) showOnb();
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => { /* sem modo offline */ });
}
