/*
 * Componentes de interface reutilizáveis (HTML em texto).
 * Interações usam atributos e um único ouvinte global (js/main.js):
 *   data-go="#/receita/id"   navega        data-fav="id"   favorita (atualiza todos os botões da receita)
 */
import { esc, fmtMinutes, fmtRating, fmtNumber } from '../core/util.js';
import { DIFFICULTY } from '../data/categories.js';
import { isFav } from '../core/store.js';
import { dishArt } from './art-dishes.js';
import { icon } from './icons.js';
import { foodIcon } from './icons-food.js';

export const yieldLabel = (r, n = r.servings) => `${n} ${r.yieldUnit ? r.yieldUnit : n === 1 ? 'porção' : 'porções'}`;

export function diffDots(d) {
  const lv = DIFFICULTY[d]?.level || 1;
  return `<span class="diff" title="Dificuldade: ${DIFFICULTY[d]?.label}">${[1, 2, 3].map((i) => `<i class="${i <= lv ? 'on' : ''}"></i>`).join('')} ${DIFFICULTY[d]?.label}</span>`;
}

export const favBtn = (id, extra = '') =>
  `<button type="button" class="fav ${isFav(id) ? 'on' : ''} ${extra}" data-fav="${id}" aria-pressed="${isFav(id)}" aria-label="${isFav(id) ? 'Remover dos favoritos' : 'Favoritar'}">${icon('heart', '')}</button>`;

/** Card grande (carrossel "Receitas populares"). */
export function recipeCard(r, i = 0, wide = false) {
  return `<article class="rcard ${wide ? 'wide' : ''} rise" style="--i:${i}">
    <a href="#/receita/${r.id}" class="art" aria-label="${esc(r.name)}">${dishArt(r)}</a>
    <span class="pill"><span class="star">★</span> ${fmtRating(r.rating)}</span>
    ${favBtn(r.id)}
    <a href="#/receita/${r.id}" class="body">
      <h3 class="name">${esc(r.name)}</h3>
      <div class="meta"><span>${icon('clock')} ${fmtMinutes(r.total)}</span><span>${icon('users')} ${yieldLabel(r)}</span>${diffDots(r.difficulty)}</div>
    </a>
  </article>`;
}

/** Card em grade (2 colunas). */
export function recipeTile(r, i = 0) {
  return `<article class="tile rise" style="--i:${i}">
    <a href="#/receita/${r.id}" class="art" aria-label="${esc(r.name)}">${dishArt(r, { label: false })}</a>
    ${favBtn(r.id)}
    <a href="#/receita/${r.id}" class="body">
      <h3 class="name">${esc(r.name)}</h3>
      <div class="meta"><span><span class="star">★</span> ${fmtRating(r.rating)}</span><span>${icon('clock')} ${fmtMinutes(r.total)}</span></div>
    </a>
  </article>`;
}

/** Linha compacta (listas). `sub` substitui a linha de metadados. */
export function recipeRow(r, i = 0, sub = '') {
  return `<article class="rrow rise" style="--i:${i}">
    <a href="#/receita/${r.id}" class="thumb" aria-hidden="true" tabindex="-1">${dishArt(r, { label: false })}</a>
    <a href="#/receita/${r.id}" class="grow">
      <h3 class="name">${esc(r.name)}</h3>
      ${sub ? `<p class="sub">${sub}</p>` : ''}
      <div class="meta"><span><span class="star">★</span> ${fmtRating(r.rating)}</span><span>${icon('clock')} ${fmtMinutes(r.total)}</span>${diffDots(r.difficulty)}</div>
    </a>
    ${favBtn(r.id)}
  </article>`;
}

export function emptyState({ emoji, title, text, cta, href, action }) {
  return `<div class="empty rise"><div class="art" aria-hidden="true">${emoji}</div><h3>${title}</h3><p>${text}</p>
    ${cta ? (href ? `<a class="btn btn-primary" href="${href}">${cta}</a>` : `<button class="btn btn-primary" type="button" data-action="${action}">${cta}</button>`) : ''}</div>`;
}

export const sectionHead = (title, link, href) =>
  `<div class="section-head"><h2 class="h2">${title}</h2>${link ? `<a class="link" href="${href}">${link}</a>` : ''}</div>`;

export function skeletonRows(n = 3) {
  return `<div class="list">${[...Array(n)].map(() => `<div class="rrow"><div class="thumb skel"></div><div class="grow"><div class="skel" style="height:16px;width:70%"></div><div class="skel" style="height:12px;width:45%;margin-top:10px"></div></div></div>`).join('')}</div>`;
}

export const ingIcon = (id, size = 42) => foodIcon(id, size);

export const checkSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';

export const reviewsLabel = (r) => `${fmtNumber(r.reviews)} avaliações`;
