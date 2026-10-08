/* Lista de receitas de uma categoria da Home (#/categoria/massas) ou de uma subcategoria (#/tag/bolos). */
import { CATEGORIES } from '../data/categories.js';
import { byCategory, byTag } from '../core/repo.js';
import { esc } from '../core/util.js';
import { recipeRow, emptyState } from '../ui/components.js';
import { icon } from '../ui/icons.js';
import { back } from '../core/router.js';

function page({ emoji, title, sub, tint, list }) {
  return `
    <header class="topbar"><button class="icon-btn" data-back aria-label="Voltar">${icon('back')}</button><h1 class="h2 grow">${esc(title)}</h1></header>
    <div class="cat-hero rise" style="--tint:${tint}"><span class="e">${emoji}</span><div><p class="eyebrow">Categoria</p><p>${sub}</p></div></div>
    <div class="section" style="margin-top:20px">
      ${list.length ? `<div class="list">${list.map((r, i) => recipeRow(r, i)).join('')}</div>`
        : emptyState({ emoji, title: 'Em breve por aqui', text: 'Ainda não temos receitas nesta categoria. Novas receitas chegam com as atualizações.', cta: 'Explorar outras receitas', href: '#/buscar' })}
    </div>`;
}

const mount = (root) => { root.querySelector('[data-back]').onclick = () => back(); };

export const categoryScreen = {
  tab: 'home',
  title: ({ params }) => CATEGORIES.find((c) => c.id === params.id)?.label || 'Categoria',
  render({ params }) {
    const c = CATEGORIES.find((x) => x.id === params.id) || { label: params.id, emoji: '🍽️', tint: '#F6E3CF' };
    const list = byCategory(params.id).sort((a, b) => b.rating - a.rating);
    return page({ emoji: c.emoji, title: c.label, tint: c.tint, sub: `${list.length} ${list.length === 1 ? 'receita' : 'receitas'} para você escolher`, list });
  },
  mount,
};

export const tagScreen = {
  tab: 'home',
  title: ({ query }) => query.t || 'Receitas',
  render({ params, query }) {
    const list = byTag(params.tag).sort((a, b) => b.rating - a.rating);
    return page({ emoji: '🍽️', title: query.t || params.tag, tint: '#F6E3CF', sub: `${list.length} ${list.length === 1 ? 'receita' : 'receitas'}`, list });
  },
  mount,
};
