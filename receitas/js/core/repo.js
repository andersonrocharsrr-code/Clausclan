/*
 * Repositório de receitas.
 * Hoje lê os módulos locais; a interface só usa esta API assíncrona, então trocar a fonte por uma API remota
 * (paginada, com milhares de receitas) não exige mudar telas.
 */
import { INGREDIENTS } from '../data/ingredients.js';
import { CATEGORIES, MEALS, DIFFICULTY } from '../data/categories.js';
import { norm } from './util.js';

let cache = null;
let byId = new Map();

/** Completa cada receita com campos calculados usados em toda a interface. */
function enrich(r) {
  const has = new Set();
  const keyIngredients = [];
  for (const e of r.ingredients) {
    const ing = INGREDIENTS[e.id];
    if (!ing) continue;
    (ing.has || []).forEach((h) => has.add(h));
    if (!ing.staple && !e.optional && !keyIngredients.includes(e.id)) keyIngredients.push(e.id);
  }
  const total = (r.prep || 0) + (r.cook || 0);
  const searchText = norm([
    r.name, r.description, ...(r.tags || []),
    ...(r.cats || []).map((c) => CATEGORIES.find((x) => x.id === c)?.label),
    ...(r.meals || []).map((m) => MEALS[m]?.label),
    DIFFICULTY[r.difficulty]?.label,
  ].join(' '));
  const ingText = norm(r.ingredients.map((e) => {
    const i = INGREDIENTS[e.id];
    return i ? [i.n, i.p, ...(i.alias || [])].join(' ') : '';
  }).join(' '));
  return {
    ...r,
    total,
    has: [...has],
    keyIngredients,
    timers: r.steps.filter((s) => s.timer).length,
    _name: norm(r.name),
    _text: searchText,
    _ing: ingText,
  };
}

export async function loadRecipes() {
  if (cache) return cache;
  const { default: list } = await import('../data/recipes/index.js');
  cache = list.map(enrich);
  byId = new Map(cache.map((r) => [r.id, r]));
  return cache;
}

export const allRecipes = () => cache || [];
export const getRecipe = (id) => byId.get(id) || null;
export const byCategory = (cat) => allRecipes().filter((r) => r.cats.includes(cat));
export const byTag = (tag) => allRecipes().filter((r) => r.tags.includes(tag));
export const byMeal = (meal) => allRecipes().filter((r) => r.meals.includes(meal));
export const popular = (n = 8) => [...allRecipes()].sort((a, b) => b.rating * Math.log(b.reviews) - a.rating * Math.log(a.reviews)).slice(0, n);
export const quick = (max = 30) => allRecipes().filter((r) => r.total <= max).sort((a, b) => a.total - b.total);
