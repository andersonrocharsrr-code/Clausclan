/*
 * Modo "Cozinhar agora": uma etapa por vez, com ilustração animada, indicadores (tempo, fogo, forno, quantidade),
 * timer integrado, dicas e alertas, barra de progresso e navegação própria (botões grandes, arrastar e setas).
 */
import { getRecipe } from '../core/repo.js';
import { state, startCooking, setCookingStep, clearCooking, markCooked, isChecked, toggleCheck } from '../core/store.js';
import * as T from '../core/timer.js';
import { describe } from '../core/quantity.js';
import { unlockAudio, askNotifications } from '../core/sound.js';
import { esc, fmtClock, fmtDuration, $, vibrate } from '../core/util.js';
import { stepScene } from '../ui/scene.js';
import { ingIcon, checkSvg } from '../ui/components.js';
import { icon } from '../ui/icons.js';
import { sheet, confirmSheet, closeSheet } from '../ui/overlay.js';
import { go } from '../core/router.js';

const HEAT = { baixo: ['Fogo baixo', 1], medio: ['Fogo médio', 2], alto: ['Fogo alto', 3], desligado: ['Fogo desligado', 0] };
const RING = 2 * Math.PI * 46;

const timerId = (r, i) => `${r.id}:${i}`;

function indicators(r, s) {
  const out = [];
  if (s.timer) out.push(`<span class="ind time"><span class="e">⏱</span>${fmtDuration(s.timer)}</span>`);
  if (s.wait) out.push(`<span class="ind wait"><span class="e">⏳</span>${esc(s.wait)}</span>`);
  if (s.heat) {
    const [label, n] = HEAT[s.heat];
    out.push(`<span class="ind heat"><span class="e">🔥</span>${label}<span class="flames" aria-hidden="true">${[1, 2, 3].map((k) => `<i class="${k <= n ? 'on' : ''}"></i>`).join('')}</span></span>`);
  }
  if (s.oven) out.push(`<span class="ind oven"><span class="e">🌡</span>Forno a ${s.oven} °C</span>`);
  if (s.amount) out.push(`<span class="ind qty"><span class="e">🥄</span>${esc(s.amount)}</span>`);
  return out.length ? `<div class="indicators">${out.join('')}</div>` : '';
}

function uses(r, s, factor) {
  if (!s.uses?.length) return '';
  const rows = s.uses.map((id) => r.ingredients.find((e) => e.id === id)).filter(Boolean).map((e) => {
    const d = describe(e, factor);
    return `<div class="use">${ingIcon(e.id, 40)}<span>${d.qty ? `<b>${d.qty}</b>${d.joiner}${esc(d.name)}` : `<b>${esc(d.name)}</b>`}</span></div>`;
  });
  return `<p class="eyebrow" style="margin-top:20px;color:var(--ink-3)">🥄 Nesta etapa</p><div class="uses">${rows.join('')}</div>`;
}

function timerCard(r, i, s) {
  if (!s.timer) return '';
  const t = T.ensure(timerId(r, i), { label: s.title, recipeId: r.id, step: i, duration: s.timer });
  const rem = T.remaining(t);
  const pct = t.duration ? rem / t.duration : 0;
  const ctrls = {
    idle: `<button class="btn btn-primary" data-t="start">${icon('play')} Iniciar</button>`,
    running: `<button class="btn btn-ghost" data-t="pause">${icon('pause')} Pausar</button><button class="btn btn-ghost" data-t="plus">+1 min</button>`,
    paused: `<button class="btn btn-primary" data-t="start">${icon('play')} Continuar</button><button class="btn btn-ghost" data-t="reset">${icon('refresh')} Reiniciar</button>`,
    done: `<button class="btn btn-primary" data-next>Próxima etapa →</button><button class="btn btn-ghost" data-t="plus">+1 min</button>`,
  }[t.status];
  const head = { idle: 'Timer da etapa', running: 'Contando…', paused: 'Pausado', done: '🔔 Tempo concluído!' }[t.status];
  return `<div class="timer ${t.status}" id="timer" role="timer" aria-live="off">
    <div class="ring"><svg viewBox="0 0 108 108"><circle class="bg" cx="54" cy="54" r="46"/><circle class="fg" cx="54" cy="54" r="46" stroke-dasharray="${RING}" stroke-dashoffset="${RING * (1 - pct)}"/></svg><div class="clock" id="tclock">${fmtClock(rem)}</div></div>
    <div class="side"><small>${head}</small><div class="lbl">${t.status === 'done' ? 'Pode seguir para a próxima etapa.' : `${esc(s.title)} · ${fmtDuration(s.timer)}`}</div><div class="ctrls">${ctrls}</div></div>
  </div>`;
}

function stepHtml(r, i, factor) {
  const s = r.steps[i];
  return `
    <div class="scene-card">${stepScene(s, r)}<span class="step-badge">${i + 1}/${r.steps.length}</span></div>
    <h2 class="display step-title">${esc(s.title)}</h2>
    <p class="step-text">${esc(s.text)}</p>
    ${indicators(r, s)}
    ${timerCard(r, i, s)}
    ${s.warn ? `<div class="callout warn" role="alert"><span class="e">⚠️</span><div><b>Cuidado</b>${esc(s.warn)}</div></div>` : ''}
    ${s.tip ? `<div class="callout tip"><span class="e">💡</span><div><b>Dica</b>${esc(s.tip)}</div></div>` : ''}
    ${uses(r, s, factor)}`;
}

function progressHtml(r) {
  const done = state.cooking?.done.length || 0, total = r.steps.length;
  const pct = Math.round((done / total) * 100);
  return `<div class="track" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${done}"><i style="width:${pct}%"></i></div>
    <div class="lbl"><span><b>${done} de ${total}</b> etapas concluídas</span><span>${pct}%</span></div>`;
}

const dotsHtml = (r) => r.steps.map((_, k) => `<button type="button" aria-label="Ir para o passo ${k + 1}" data-go-step="${k}" class="${k === state.cooking.step ? 'cur' : state.cooking.done.includes(k) ? 'done' : ''}"></button>`).join('');

function ingredientsSheet(r, factor) {
  const body = () => r.ingredients.map((e, i) => {
    const d = describe(e, factor);
    const on = isChecked(r.id, i);
    return `<button type="button" class="ing ${on ? 'on' : ''}" data-ing="${i}" style="border-radius:16px">${ingIcon(e.id)}<span class="txt">${d.qty ? `<b>${d.qty}</b>${d.joiner}<span class="nm">${esc(d.name)}</span>` : `<span class="nm"><b>${esc(d.name)}</b></span>`}${d.note ? `<small>${esc(d.note)}</small>` : ''}</span><span class="check">${checkSvg}</span></button>`;
  }).join('');
  sheet({
    label: 'Ingredientes',
    html: `<h3>Ingredientes</h3><p class="sub">Para ${state.cooking.servings} ${r.yieldUnit || 'porções'}. Toque para marcar o que já foi usado.</p><div class="ings" style="margin-top:14px">${body()}</div>`,
    mount: (el) => el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-ing]');
      if (!b) return;
      const on = toggleCheck(r.id, +b.dataset.ing);
      b.classList.toggle('on', on);
    }),
  });
}

function stepsSheet(r, jump) {
  sheet({
    label: 'Etapas',
    html: `<h3>Etapas</h3><p class="sub">Toque para ir direto a uma etapa.</p><div style="margin-top:10px">${r.steps.map((s, k) =>
      `<button class="step-jump ${k === state.cooking.step ? 'cur' : state.cooking.done.includes(k) ? 'done' : ''}" data-jump="${k}"><span class="n">${state.cooking.done.includes(k) && k !== state.cooking.step ? '✓' : k + 1}</span><span class="grow"><b>${esc(s.title)}</b>${s.timer ? `<span class="tiny muted"> · ⏱ ${fmtDuration(s.timer)}</span>` : ''}</span></button>`).join('')}</div>`,
    mount: (el, close) => el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-jump]');
      if (b) { close(); jump(+b.dataset.jump); }
    }),
  });
}

export default {
  fullscreen: true,
  title: ({ params }) => `Cozinhando: ${getRecipe(params.id)?.name || ''}`,
  render({ params, query }) {
    const r = getRecipe(params.id);
    if (!r) return '<div class="empty"><h3>Receita não encontrada</h3><a class="btn btn-primary" href="#/">Início</a></div>';
    if (state.cooking?.id !== r.id) startCooking(r.id, state.servings[r.id] || r.servings, 0);
    if (query.passo != null) setCookingStep(Math.min(r.steps.length - 1, Math.max(0, +query.passo)));
    const i = state.cooking.step;
    const factor = state.cooking.servings / r.servings;
    return `<div class="cook">
      <header class="cook-top">
        <button class="icon-btn" data-exit aria-label="Sair do modo de preparo">${icon('close')}</button>
        <button class="title" data-steps aria-label="Ver todas as etapas"><small id="step-of">Passo ${i + 1} de ${r.steps.length}</small><b>${esc(r.name)}</b></button>
        <button class="icon-btn" data-ings aria-label="Ingredientes">${icon('ingredients')}</button>
      </header>
      <div class="progress" id="prog">${progressHtml(r)}</div>
      <div class="dots" id="dots">${dotsHtml(r)}</div>
      <main class="cook-main" id="cook-main"><div class="step-wrap" id="step">${stepHtml(r, i, factor)}</div></main>
      <nav class="cook-nav">
        <button class="btn btn-ghost" data-prev ${i === 0 ? 'disabled' : ''}>← Anterior</button>
        <button class="btn btn-primary" data-next id="next-btn">${i === r.steps.length - 1 ? 'Concluir 🎉' : 'Próximo →'}</button>
      </nav>
    </div>`;
  },

  mount(root, { params }) {
    const r = getRecipe(params.id);
    if (!r) return;
    const factor = state.cooking.servings / r.servings;
    let wake = null;

    const show = (i, dir) => {
      const cur = state.cooking.step;
      if (i < 0 || i >= r.steps.length) return;
      setCookingStep(i, dir > 0 ? cur : null);
      const el = $('#step', root);
      el.innerHTML = stepHtml(r, i, factor);
      el.classList.remove('in-next', 'in-prev'); void el.offsetWidth;
      el.classList.add(dir >= 0 ? 'in-next' : 'in-prev');
      $('#step-of', root).textContent = `Passo ${i + 1} de ${r.steps.length}`;
      $('#prog', root).innerHTML = progressHtml(r);
      $('#dots', root).innerHTML = dotsHtml(r);
      $('[data-prev]', root).disabled = i === 0;
      $('#next-btn', root).textContent = i === r.steps.length - 1 ? 'Concluir 🎉' : 'Próximo →';
      history.replaceState(null, '', `#/cozinhar/${r.id}`);
      scrollTo({ top: 0, behavior: 'smooth' });
      vibrate(10);
    };

    const finish = () => {
      setCookingStep(state.cooking.step, state.cooking.step);
      const took = Math.round((Date.now() - state.cooking.startedAt) / 60000);
      sessionStorage.setItem('tempero:took', String(took));
      markCooked(r.id);
      T.clearRecipe(r.id);
      clearCooking();
      go(`#/pronto/${r.id}`, true);
    };

    const next = () => {
      const i = state.cooking.step;
      if (i === r.steps.length - 1) finish(); else show(i + 1, 1);
    };
    const prev = () => show(state.cooking.step - 1, -1);

    const exit = async () => {
      const running = T.active().some((t) => t.recipeId === r.id && t.status === 'running');
      const ok = await confirmSheet({
        title: 'Pausar o preparo?',
        text: `Seu progresso fica salvo no passo ${state.cooking.step + 1}. ${running ? 'Os timers continuam contando.' : ''} Você pode continuar depois pela receita ou pelo Início.`,
        ok: 'Sair', cancel: 'Continuar cozinhando',
      });
      if (ok) go(`#/receita/${r.id}`);
    };

    root.addEventListener('click', (e) => {
      unlockAudio();
      const b = e.target.closest('button');
      if (!b) return;
      const tid = timerId(r, state.cooking.step);
      if ('next' in b.dataset) next();
      else if ('prev' in b.dataset) prev();
      else if ('exit' in b.dataset) exit();
      else if ('ings' in b.dataset) ingredientsSheet(r, factor);
      else if ('steps' in b.dataset) stepsSheet(r, (k) => show(k, k >= state.cooking.step ? 1 : -1));
      else if (b.dataset.goStep != null) { const k = +b.dataset.goStep; show(k, k >= state.cooking.step ? 1 : -1); }
      else if (b.dataset.t) {
        const a = b.dataset.t;
        if (a === 'start') { T.start(tid); askNotifications(); }
        else if (a === 'pause') T.pause(tid);
        else if (a === 'reset') T.reset(tid);
        else if (a === 'plus') T.add(tid, 60);
        vibrate(12);
      }
    });

    // Timer: atualiza o relógio a cada tique e o cartão inteiro quando muda de estado.
    let lastStatus = null;
    const offTimers = T.onTimers(() => {
      const s = r.steps[state.cooking?.step];
      if (!s?.timer) return;
      const t = T.get(timerId(r, state.cooking.step));
      const card = $('#timer', root);
      if (!t || !card) return;
      if (t.status !== lastStatus || !card.classList.contains(t.status)) {
        lastStatus = t.status;
        card.outerHTML = timerCard(r, state.cooking.step, s);
        return;
      }
      const rem = T.remaining(t);
      $('#tclock', root).textContent = fmtClock(rem);
      card.querySelector('.fg').style.strokeDashoffset = RING * (1 - rem / t.duration);
    });

    // Gestos: arrastar para os lados troca de etapa.
    let x0 = null, y0 = null;
    const main = $('#cook-main', root);
    main.addEventListener('touchstart', (e) => { if (e.target.closest('.timer')) return; x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    main.addEventListener('touchend', (e) => {
      if (x0 == null) return;
      const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      x0 = null;
      if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx < 0 && state.cooking.step < r.steps.length - 1) next();
        else if (dx > 0) prev();
      }
    });
    const onKey = (e) => {
      if (document.querySelector('.sheet')) return;
      if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === ' ' && r.steps[state.cooking.step].timer) {
        e.preventDefault();
        const t = T.get(timerId(r, state.cooking.step));
        if (t?.status === 'running') T.pause(t.id); else if (t) T.start(t.id);
      }
    };
    addEventListener('keydown', onKey);

    // Tela sempre acesa enquanto cozinha (quando o aparelho permite).
    const lock = async () => {
      if (!state.profile.wake || !('wakeLock' in navigator) || document.visibilityState !== 'visible') return;
      try { wake = await navigator.wakeLock.request('screen'); } catch { wake = null; }
    };
    const onVis = () => { if (document.visibilityState === 'visible') lock(); };
    lock();
    document.addEventListener('visibilitychange', onVis);

    return () => {
      offTimers();
      removeEventListener('keydown', onKey);
      document.removeEventListener('visibilitychange', onVis);
      wake?.release?.().catch(() => {});
      closeSheet(true);
    };
  },
};
