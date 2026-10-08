/* Lista de compras organizada por seção do mercado. */
import { state, on } from '../core/store.js';
import * as S from '../core/shopping.js';
import { suggestIngredients } from '../core/pantry.js';
import { getRecipe } from '../core/repo.js';
import { INGREDIENTS } from '../data/ingredients.js';
import { esc, $, vibrate } from '../core/util.js';
import { emptyState, checkSvg } from '../ui/components.js';
import { foodIcon } from '../ui/icons-food.js';
import { icon } from '../ui/icons.js';
import { sheet, toast, confirmSheet } from '../ui/overlay.js';

let editing = null;

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function itemHtml(it) {
  const t = S.itemText(it);
  const from = it.from.map((id) => getRecipe(id)?.name).filter(Boolean);
  const sub = it.manual ? 'Adicionado por você' : from.join(' · ');
  return `<div class="sitem-wrap" data-key="${esc(it.key)}">
    <div class="sitem ${it.checked ? 'on' : ''}">
      <button type="button" class="check" data-buy aria-label="${it.checked ? 'Desmarcar' : 'Marcar como comprado'}" aria-pressed="${it.checked}">${checkSvg}</button>
      ${it.id ? foodIcon(it.id, 38) : `<span class="fi" style="width:38px;height:38px;display:grid;place-items:center;font-size:22px">🛍️</span>`}
      <button type="button" class="txt" data-edit style="text-align:left">
        <div class="nm">${esc(cap(t.name))}</div>${sub ? `<small>${esc(sub)}</small>` : ''}
      </button>
      ${t.qty ? `<span class="q">${esc(t.qty)}</span>` : ''}
      <button type="button" class="more" data-edit aria-label="Editar quantidade">${icon('edit')}</button>
    </div>
    ${editing === it.key ? `<div class="sitem-edit"><div class="stepper"><button type="button" data-q="-1" aria-label="Menos">−</button><output>${t.qty || '—'}</output><button type="button" data-q="1" aria-label="Mais">+</button></div>
      <button type="button" class="del" data-del>${icon('trash')} Excluir</button></div>` : ''}
  </div>`;
}

function listHtml() {
  if (!state.shopping.length) {
    return emptyState({ emoji: '🛒', title: 'Sua lista está vazia', text: 'Abra uma receita e toque em “Adicionar ingredientes à lista”, ou adicione itens manualmente acima.', cta: 'Encontrar receitas', href: '#/buscar' });
  }
  const total = state.shopping.length, bought = state.shopping.filter((x) => x.checked).length;
  return `<div class="shop-progress rise"><div class="row"><b class="grow">${bought === total ? '🎉 Tudo comprado!' : `${bought} de ${total} comprados`}</b>
      ${bought ? '<button class="link" data-clear-bought>Limpar comprados</button>' : ''}</div><div class="bar"><i style="width:${(bought / total) * 100}%"></i></div></div>
    ${S.grouped().map((g) => `<section class="aisle rise"><div class="aisle-head"><span class="e">${g.emoji}</span>${g.label}<small>${g.items.filter((x) => !x.checked).length} itens</small></div>
      <div class="items">${g.items.map(itemHtml).join('')}</div></section>`).join('')}`;
}

function menu() {
  sheet({
    label: 'Opções da lista',
    html: `<h3>Lista de compras</h3><div style="margin-top:10px">
      <button class="list-opt" data-m="share"><span class="e">📤</span>Compartilhar lista</button>
      <button class="list-opt" data-m="copy"><span class="e">📋</span>Copiar como texto</button>
      <button class="list-opt" data-m="bought"><span class="e">✅</span>Remover itens comprados</button>
      <button class="list-opt" data-m="all" style="color:var(--danger)"><span class="e">🗑️</span>Esvaziar a lista</button></div>`,
    mount: (el, close) => el.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-m]');
      if (!b) return;
      close();
      const m = b.dataset.m;
      if (m === 'share' || m === 'copy') {
        const text = `🛒 Lista de compras\n\n${S.asText()}`;
        try {
          if (m === 'share' && navigator.share) await navigator.share({ title: 'Lista de compras', text });
          else { await navigator.clipboard.writeText(text); toast('📋 Lista copiada'); }
        } catch { /* cancelado */ }
      } else if (m === 'bought') S.clearBought();
      else if (m === 'all' && await confirmSheet({ title: 'Esvaziar a lista?', text: 'Todos os itens serão removidos.', ok: 'Esvaziar', danger: true })) S.clearAll();
    }),
  });
}

export default {
  tab: 'shopping',
  title: 'Lista de compras',
  render() {
    editing = null;
    return `
      <header class="topbar"><div class="title"><p class="eyebrow">Mercado</p><h1 class="h1">Lista de compras</h1></div>
        <button class="icon-btn" data-menu aria-label="Opções">${icon('more')}</button></header>
      <form class="add-row" id="add" autocomplete="off">
        <label class="field"><input id="add-name" placeholder="Adicionar item (ex.: tomate)" aria-label="Novo item" enterkeyhint="done"><input id="add-qty" class="qty" inputmode="decimal" placeholder="Qtd" aria-label="Quantidade"></label>
        <button class="btn btn-primary" aria-label="Adicionar">${icon('plus')}</button>
        <div class="suggest" id="sugg" hidden></div>
      </form>
      <div id="shop">${listHtml()}</div>`;
  },
  mount(root) {
    const box = $('#shop', root);
    const redraw = () => { box.innerHTML = listHtml(); };
    const off = on('shopping', redraw);
    const name = $('#add-name', root), qty = $('#add-qty', root), sugg = $('#sugg', root);

    const add = (text) => {
      const it = S.addManual(text, qty.value);
      if (!it) return;
      name.value = qty.value = '';
      sugg.hidden = true;
      toast(`“${cap(it.name)}” adicionado em ${it.aisle === 'outros' ? 'Outros' : 'sua lista'}`);
      vibrate(10);
    };
    $('#add', root).addEventListener('submit', (e) => { e.preventDefault(); add(name.value); });
    name.addEventListener('input', () => {
      const ids = suggestIngredients(name.value);
      sugg.hidden = !ids.length;
      sugg.innerHTML = ids.map((id) => `<button type="button" data-sug="${esc(INGREDIENTS[id].n)}">${foodIcon(id, 32)}${esc(cap(INGREDIENTS[id].n))}</button>`).join('');
    });
    name.addEventListener('blur', () => setTimeout(() => { sugg.hidden = true; }, 200));

    root.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.sug) { add(b.dataset.sug); return; }
      if ('menu' in b.dataset) { menu(); return; }
      if ('clearBought' in b.dataset) { S.clearBought(); return; }
      const key = b.closest('[data-key]')?.dataset.key;
      if (!key) return;
      if ('buy' in b.dataset) { const on2 = S.toggleBought(key); vibrate(on2 ? 15 : 0); }
      else if ('edit' in b.dataset) { editing = editing === key ? null : key; redraw(); }
      else if (b.dataset.q) S.stepQty(key, +b.dataset.q);
      else if ('del' in b.dataset) {
        const removed = S.removeItem(key);
        editing = null;
        if (removed) toast(`“${cap(removed.it.name)}” excluído`, { label: 'Desfazer', fn: () => S.restoreItem(removed) });
      }
    });
    return off;
  },
};
