/* ❤️ Minhas receitas: Favoritas, Quero fazer, Já fiz e Recentes (histórico). */
import { state, listIds, recentHistory, on } from '../core/store.js';
import { getRecipe } from '../core/repo.js';
import { esc, relTime, $ } from '../core/util.js';
import { recipeTile, emptyState } from '../ui/components.js';
import { dishArt } from '../ui/art-dishes.js';

const TABS = [
  { id: 'favoritas', list: 'fav', label: 'Favoritas', empty: { emoji: '❤️', title: 'Nenhuma favorita ainda', text: 'Toque no coração de uma receita para guardá-la aqui.' } },
  { id: 'quero', list: 'want', label: 'Quero fazer', empty: { emoji: '🔖', title: 'Sua lista de desejos está vazia', text: 'Na receita, toque em “Favoritar” e escolha “Quero fazer”.' } },
  { id: 'feitas', list: 'done', label: 'Já fiz', empty: { emoji: '👨‍🍳', title: 'Nenhuma receita concluída', text: 'Quando você terminar uma receita no modo passo a passo, ela aparece aqui.' } },
  { id: 'recentes', list: null, label: 'Recentes', empty: { emoji: '🕘', title: 'Nada por aqui ainda', text: 'As receitas que você abrir ou preparar aparecem aqui.' } },
];

function historyHtml() {
  const rows = recentHistory(30).map((h) => ({ h, r: getRecipe(h.id) })).filter((x) => x.r);
  if (!rows.length) return emptyState({ ...TABS[3].empty, cta: 'Explorar receitas', href: '#/buscar' });
  return `<div class="list">${rows.map(({ h, r }, i) => {
    const cooked = h.cookedAt;
    const text = cooked ? `Você preparou <b>${esc(r.name)}</b> ${relTime(cooked)}.` : `Você viu <b>${esc(r.name)}</b> ${relTime(h.at)}.`;
    return `<a class="hist rise" style="--i:${i}" href="#/receita/${r.id}"><span class="thumb">${dishArt(r, { label: false })}</span><span class="t grow">${cooked ? '👨‍🍳 ' : '👀 '}${text}</span></a>`;
  }).join('')}</div>`;
}

function content(tab) {
  if (!tab.list) return historyHtml();
  const ids = listIds(tab.list).filter(getRecipe);
  if (!ids.length) return emptyState({ ...tab.empty, cta: 'Descobrir receitas', href: '#/' });
  return `<div class="grid2">${ids.map((id, i) => recipeTile(getRecipe(id), i)).join('')}</div>`;
}

const count = (t) => (t.list ? listIds(t.list).filter(getRecipe).length : 0);

export default {
  tab: 'favorites',
  title: 'Minhas receitas',
  render({ query }) {
    const tab = TABS.find((t) => t.id === query.aba) || TABS[0];
    return `
      <header class="topbar"><div class="title"><p class="eyebrow">Coleção</p><h1 class="h1">❤️ Minhas receitas</h1></div></header>
      <div class="seg" role="tablist">${TABS.map((t) => `<button role="tab" aria-selected="${t === tab}" class="${t === tab ? 'on' : ''}" data-tab="${t.id}">${t.label}${t.list && count(t) ? ` <small>${count(t)}</small>` : ''}</button>`).join('')}</div>
      <div id="fav-body" style="margin-top:18px">${content(tab)}</div>`;
  },
  mount(root, { query }) {
    let tab = TABS.find((t) => t.id === query.aba) || TABS[0];
    const redraw = () => {
      root.querySelectorAll('[data-tab]').forEach((b) => {
        const t = TABS.find((x) => x.id === b.dataset.tab);
        b.classList.toggle('on', t === tab);
        b.setAttribute('aria-selected', t === tab);
        b.innerHTML = `${t.label}${t.list && count(t) ? ` <small>${count(t)}</small>` : ''}`;
      });
      $('#fav-body', root).innerHTML = content(tab);
    };
    root.addEventListener('click', (e) => {
      const b = e.target.closest('[data-tab]');
      if (!b) return;
      tab = TABS.find((t) => t.id === b.dataset.tab);
      history.replaceState(null, '', `#/favoritos?aba=${tab.id}`);
      redraw();
    });
    // Desfavoritar aqui some com o card na hora.
    return on('favorites', () => setTimeout(redraw, 350));
  },
};
