/* Busca: texto livre + filtros de tempo, dificuldade e categoria. */
import { search, SUGGESTIONS } from '../core/search.js';
import { allRecipes } from '../core/repo.js';
import { state, addSearch, clearSearches } from '../core/store.js';
import { TIME_FILTERS, DIFFICULTY, MEALS, CATEGORIES } from '../data/categories.js';
import { esc, debounce, $ } from '../core/util.js';
import { recipeTile, emptyState, skeletonRows } from '../ui/components.js';
import { sheet } from '../ui/overlay.js';
import { icon } from '../ui/icons.js';
import { back } from '../core/router.js';

let F = { q: '', time: '', diff: [], meals: [], cats: [], respectPrefs: false };

const activeCount = () => (F.time ? 1 : 0) + F.diff.length + F.meals.length + F.cats.length + (F.respectPrefs ? 1 : 0);

function syncUrl() {
  const p = new URLSearchParams();
  if (F.q) p.set('q', F.q);
  if (F.time) p.set('time', F.time);
  if (F.diff.length) p.set('diff', F.diff.join(','));
  if (F.meals.length) p.set('meal', F.meals.join(','));
  if (F.cats.length) p.set('cat', F.cats.join(','));
  const qs = p.toString();
  history.replaceState(null, '', `#/buscar${qs ? `?${qs}` : ''}`);
}

function quickChips() {
  const chip = (label, on, attrs) => `<button type="button" class="chip ${on ? 'on' : ''}" ${attrs}>${label}</button>`;
  return [
    ...TIME_FILTERS.slice(0, 3).map((t) => chip(`⏱ ${t.label}`, F.time === t.id, `data-time="${t.id}"`)),
    ...Object.entries(DIFFICULTY).map(([k, d]) => chip(d.label, F.diff.includes(k), `data-diff="${k}"`)),
    ...Object.entries(MEALS).map(([k, m]) => chip(`${m.emoji} ${m.label}`, F.meals.includes(k), `data-meal="${k}"`)),
  ].join('');
}

function idle() {
  const recent = state.searches;
  return `
    ${recent.length ? `<div class="section-head" style="margin-top:22px"><h2 class="h3">Buscas recentes</h2><button class="link" data-clear-recent>Limpar</button></div>
      <div class="chips pad">${recent.map((s) => `<button class="chip" data-suggest="${esc(s)}">${icon('history')} ${esc(s)}</button>`).join('')}</div>` : ''}
    <div class="section-head" style="margin-top:22px"><h2 class="h3">Experimente buscar</h2></div>
    <div class="chips pad">${SUGGESTIONS.map((s) => `<button class="chip" data-suggest="${s}">${s}</button>`).join('')}</div>
    <div class="section-head" style="margin-top:26px"><h2 class="h3">Todas as receitas</h2></div>
    <div class="grid2">${[...allRecipes()].sort((a, b) => b.rating - a.rating).map((r, i) => recipeTile(r, i)).join('')}</div>`;
}

function results() {
  const hasQuery = F.q.trim() || activeCount();
  if (!hasQuery) return idle();
  const res = search(F.q, { ...F, profile: state.profile });
  if (!res.length) {
    return emptyState({
      emoji: '🔎', title: 'Nenhuma receita encontrada',
      text: activeCount() ? 'Tente remover alguns filtros ou buscar por outro ingrediente.' : `Não achamos nada para “${esc(F.q)}”. Que tal buscar por um ingrediente, como “frango” ou “arroz”?`,
      cta: activeCount() ? 'Limpar filtros' : null, action: 'clear-filters',
    });
  }
  return `<div class="result-count"><span>${res.length} ${res.length === 1 ? 'receita' : 'receitas'}</span>${res.some((x) => x.viaIngredient) ? '<span class="tiny muted">inclui receitas com o ingrediente</span>' : ''}</div>
    <div class="grid2">${res.map(({ r }, i) => recipeTile(r, i)).join('')}</div>`;
}

function filtersSheet(onApply) {
  const draft = JSON.parse(JSON.stringify(F));
  const body = () => `
    <h3>Filtros</h3><p class="sub">Combine como quiser. Os resultados aparecem na hora.</p>
    <div class="group-lbl">⏱ Tempo</div>
    <div class="chips">${TIME_FILTERS.map((t) => `<button class="chip ${draft.time === t.id ? 'on' : ''}" data-ft="${t.id}">${t.label}</button>`).join('')}</div>
    <div class="group-lbl">🔥 Dificuldade</div>
    <div class="chips">${Object.entries(DIFFICULTY).map(([k, d]) => `<button class="chip ${draft.diff.includes(k) ? 'on' : ''}" data-fd="${k}">${d.label}</button>`).join('')}</div>
    <div class="group-lbl">🍽 Refeição</div>
    <div class="chips">${Object.entries(MEALS).map(([k, m]) => `<button class="chip ${draft.meals.includes(k) ? 'on' : ''}" data-fm="${k}">${m.emoji} ${m.label}</button>`).join('')}</div>
    <div class="group-lbl">🗂 Categoria</div>
    <div class="chips">${CATEGORIES.map((c) => `<button class="chip ${draft.cats.includes(c.id) ? 'on' : ''}" data-fc="${c.id}">${c.emoji} ${c.label}</button>`).join('')}</div>
    <div class="group-lbl">👤 Perfil</div>
    <button class="setting" style="width:100%;text-align:left" data-fp><span class="t">Respeitar minhas preferências<small>Esconde receitas com restrições ou ingredientes que você não curte</small></span><span class="switch ${draft.respectPrefs ? 'on' : ''}"></span></button>
    <div class="sheet-actions"><button class="btn btn-ghost" data-reset>Limpar</button><button class="btn btn-primary" data-apply>Ver resultados</button></div>`;
  sheet({
    label: 'Filtros', html: `<div class="fs">${body()}</div>`,
    mount: (el, close) => {
      el.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        const tog = (arr, v) => (arr.includes(v) ? arr.splice(arr.indexOf(v), 1) : arr.push(v));
        if (b.dataset.ft) draft.time = draft.time === b.dataset.ft ? '' : b.dataset.ft;
        else if (b.dataset.fd) tog(draft.diff, b.dataset.fd);
        else if (b.dataset.fm) tog(draft.meals, b.dataset.fm);
        else if (b.dataset.fc) tog(draft.cats, b.dataset.fc);
        else if ('fp' in b.dataset) draft.respectPrefs = !draft.respectPrefs;
        else if ('reset' in b.dataset) Object.assign(draft, { time: '', diff: [], meals: [], cats: [], respectPrefs: false });
        else if ('apply' in b.dataset) { Object.assign(F, draft); close(); onApply(); return; }
        else return;
        el.querySelector('.fs').innerHTML = body();
      });
    },
  });
}

export default {
  tab: 'search',
  title: 'Buscar',
  render({ query }) {
    F = {
      q: query.q || '', time: query.time || '', respectPrefs: false,
      diff: query.diff ? query.diff.split(',') : [], meals: query.meal ? query.meal.split(',') : [], cats: query.cat ? query.cat.split(',') : [],
    };
    return `
      <header class="topbar sticky" style="flex-direction:column;align-items:stretch;gap:12px">
        <div class="row"><button class="icon-btn flat" data-back aria-label="Voltar">${icon('back')}</button><h1 class="h2 grow">Buscar</h1></div>
        <label class="searchbox" style="box-shadow:var(--sh-1)">${icon('search')}
          <input id="q" type="search" enterkeyhint="search" autocomplete="off" placeholder="Receitas, ingredientes ou pratos..." value="${esc(F.q)}" aria-label="Buscar">
          <button type="button" class="clear" data-clear aria-label="Limpar busca" ${F.q ? '' : 'hidden'}>${icon('close')}</button>
          <button type="button" class="filter-btn" data-filters aria-label="Filtros">${icon('filter')}<span class="badge" ${activeCount() ? '' : 'hidden'}>${activeCount()}</span></button>
        </label>
      </header>
      <div class="hscroll" id="quick" style="padding-top:2px">${quickChips()}</div>
      <div id="results">${results()}</div>`;
  },
  mount(root, { query }) {
    const input = $('#q', root);
    const out = $('#results', root);
    const refresh = (skeleton) => {
      syncUrl();
      $('#quick', root).innerHTML = quickChips();
      const b = $('.badge', root);
      b.textContent = activeCount();
      b.hidden = !activeCount();
      $('[data-clear]', root).hidden = !F.q;
      if (skeleton) out.innerHTML = skeletonRows(3);
      else out.innerHTML = results();
    };
    const run = debounce(() => refresh(false), 220);
    input.addEventListener('input', () => { F.q = input.value; if (F.q.trim()) refresh(true); run(); });
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { addSearch(input.value); input.blur(); } });
    input.addEventListener('change', () => addSearch(input.value));
    if (query.focus) setTimeout(() => input.focus(), 250);

    root.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      const tog = (arr, v) => (arr.includes(v) ? arr.splice(arr.indexOf(v), 1) : arr.push(v));
      if ('back' in b.dataset) back();
      else if ('clear' in b.dataset) { input.value = F.q = ''; refresh(); input.focus(); }
      else if ('filters' in b.dataset) filtersSheet(() => refresh());
      else if (b.dataset.time) { F.time = F.time === b.dataset.time ? '' : b.dataset.time; refresh(); }
      else if (b.dataset.diff) { tog(F.diff, b.dataset.diff); refresh(); }
      else if (b.dataset.meal) { tog(F.meals, b.dataset.meal); refresh(); }
      else if (b.dataset.suggest) { input.value = F.q = b.dataset.suggest; addSearch(F.q); refresh(); }
      else if ('clearRecent' in b.dataset) { clearSearches(); refresh(); }
      else if (b.dataset.action === 'clear-filters') { Object.assign(F, { time: '', diff: [], meals: [], cats: [], respectPrefs: false }); refresh(); }
    });
  },
};
