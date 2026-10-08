/* 🧺 "O que posso fazer com o que tenho?" */
import { state, emit } from '../core/store.js';
import { whatCanICook, suggestIngredients } from '../core/pantry.js';
import { addFromRecipe } from '../core/shopping.js';
import { getRecipe } from '../core/repo.js';
import { INGREDIENTS, PANTRY_QUICK } from '../data/ingredients.js';
import { esc, $, norm } from '../core/util.js';
import { emptyState } from '../ui/components.js';
import { dishArt } from '../ui/art-dishes.js';
import { foodIcon } from '../ui/icons-food.js';
import { icon } from '../ui/icons.js';
import { toast } from '../ui/overlay.js';
import { back, go } from '../core/router.js';

const label = (x) => { const n = INGREDIENTS[x]?.n || x; return n.charAt(0).toUpperCase() + n.slice(1); };
const name = (id) => INGREDIENTS[id]?.n || id;

function haveHtml() {
  if (!state.pantry.length) return '';
  return state.pantry.map((x) => `<button class="chip on-brand" data-rm="${esc(x)}">${esc(label(x))} <span class="x">${icon('close')}</span></button>`).join('') +
    '<button class="chip" data-clear-all>Limpar tudo</button>';
}

function quickHtml() {
  const has = state.pantry.map(norm);
  return PANTRY_QUICK.filter((q) => !has.includes(norm(q))).map((q) => `<button class="chip" data-add="${esc(q)}">+ ${esc(label(q))}</button>`).join('');
}

function resultsHtml() {
  if (!state.pantry.length) {
    return emptyState({ emoji: '🧺', title: 'Conte o que tem em casa', text: 'Digite ou toque nos ingredientes acima. Vamos mostrar as receitas que mais aproveitam o que você já tem.' });
  }
  const res = whatCanICook(state.pantry);
  if (!res.length) {
    return emptyState({ emoji: '🤔', title: 'Nenhuma receita com esses ingredientes', text: 'Tente adicionar ingredientes mais comuns, como ovo, arroz, tomate ou cebola.' });
  }
  return `<p class="result-count" style="padding:0"><span>${res.length} receitas possíveis</span><span class="tiny muted">Sal, pimenta, óleo e água não contam</span></p>
    <div style="display:grid;gap:16px;margin-top:8px">${res.map(({ r, have, missing }, i) => {
    const total = have.length + missing.length;
    return `<article class="match rise ${i === 0 && have.length > 1 ? 'best' : ''}" style="--i:${i}">
      <a class="thumb" href="#/receita/${r.id}">${dishArt(r, { label: false })}</a>
      <div class="grow">
        <a href="#/receita/${r.id}" class="name">${r.emoji} ${esc(r.name)}</a>
        <div class="score ${missing.length ? '' : 'full'}">${missing.length ? `Você tem ${have.length} de ${total}` : '✅ Você tem tudo!'}<span class="bar"><i style="width:${(have.length / total) * 100}%"></i></span></div>
        ${missing.length ? `<p class="miss">Falta: <b>${missing.slice(0, 4).map(name).map(esc).join(', ')}${missing.length > 4 ? ` e mais ${missing.length - 4}` : ''}</b></p>
          <button class="add-miss" data-miss="${r.id}">${icon('cart')} Adicionar o que falta</button>` : `<a class="add-miss" href="#/receita/${r.id}">${icon('play')} Ver receita</a>`}
      </div>
    </article>`;
  }).join('')}</div>`;
}

export default {
  tab: 'home',
  title: 'O que tenho',
  render() {
    return `
      <header class="topbar"><button class="icon-btn" data-back aria-label="Voltar">${icon('back')}</button>
        <div class="title"><p class="eyebrow">Geladeira e despensa</p><h1 class="h2">O que posso fazer com o que tenho?</h1></div></header>
      <form class="pantry-input" id="pf" autocomplete="off">
        <label class="searchbox">${icon('search')}<input id="pin" placeholder="Digite um ingrediente (ex.: frango)" aria-label="Ingrediente" enterkeyhint="done">
          <button class="filter-btn" style="background:var(--brand)" aria-label="Adicionar">${icon('plus')}</button></label>
        <div class="suggest" id="psug" hidden style="left:0;right:0;top:66px"></div>
      </form>
      <div class="have" id="have">${haveHtml()}</div>
      <p class="eyebrow" style="padding:18px 20px 8px;color:var(--ink-3)">Toque para adicionar</p>
      <div class="hscroll" id="quick">${quickHtml()}</div>
      <div class="pad" id="pres" style="margin-top:8px">${resultsHtml()}</div>`;
  },
  mount(root) {
    const input = $('#pin', root), sug = $('#psug', root);
    const redraw = () => {
      $('#have', root).innerHTML = haveHtml();
      $('#quick', root).innerHTML = quickHtml();
      $('#pres', root).innerHTML = resultsHtml();
    };
    const add = (x) => {
      x = x.trim();
      if (!x) return;
      if (!state.pantry.some((p) => norm(label(p)) === norm(label(x)))) state.pantry.push(x);
      emit('pantry');
      input.value = '';
      sug.hidden = true;
      redraw();
    };
    $('#pf', root).addEventListener('submit', (e) => {
      e.preventDefault();
      const ids = suggestIngredients(input.value);
      const exact = ids.find((id) => norm(INGREDIENTS[id].n) === norm(input.value));
      add(exact || input.value);
    });
    input.addEventListener('input', () => {
      const ids = suggestIngredients(input.value, state.pantry);
      sug.hidden = !ids.length;
      sug.innerHTML = ids.map((id) => `<button type="button" data-add="${id}">${foodIcon(id, 32)}${esc(label(id))}</button>`).join('');
    });
    input.addEventListener('blur', () => setTimeout(() => { sug.hidden = true; }, 200));

    root.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if ('back' in b.dataset) back();
      else if (b.dataset.add) add(b.dataset.add);
      else if (b.dataset.rm) { state.pantry = state.pantry.filter((x) => x !== b.dataset.rm); emit('pantry'); redraw(); }
      else if ('clearAll' in b.dataset) { state.pantry = []; emit('pantry'); redraw(); }
      else if (b.dataset.miss) {
        const r = getRecipe(b.dataset.miss);
        const miss = whatCanICook(state.pantry).find((x) => x.r.id === r.id)?.missing || [];
        const n = addFromRecipe(r, r.ingredients.filter((x) => miss.includes(x.id)));
        toast(`🛒 ${n} ${n === 1 ? 'item' : 'itens'} na lista`, { label: 'Ver lista', fn: () => go('#/lista') });
      }
    });
  },
};

