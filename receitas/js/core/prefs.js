/*
 * Preferências do usuário aplicadas às receitas: restrições, dietas, ingredientes que não gosta e tempo disponível.
 */
import { DIETS, RESTRICTIONS, HAS_LABEL } from '../data/categories.js';
import { INGREDIENTS } from '../data/ingredients.js';
import { allRecipes } from './repo.js';

/** Motivos pelos quais a receita não combina com o perfil (lista vazia = combina). */
export function conflicts(r, profile) {
  const out = [];
  const excluded = new Map();
  for (const d of profile.diets || []) (DIETS[d]?.excludes || []).forEach((h) => excluded.set(h, DIETS[d].label));
  for (const x of profile.restrictions || []) (RESTRICTIONS[x]?.excludes || []).forEach((h) => excluded.set(h, RESTRICTIONS[x].label));
  for (const h of r.has) if (excluded.has(h)) out.push(`Contém ${HAS_LABEL[h]} (${excluded.get(h)})`);
  for (const id of profile.dislikes || []) {
    if (r.ingredients.some((e) => e.id === id && !e.optional)) out.push(`Leva ${INGREDIENTS[id]?.n || id}, que você não curte`);
  }
  return [...new Set(out)];
}

/** Recomendações para a Home, respeitando o perfil e priorizando o que ele indica. */
export function forYou(profile, n = 6) {
  const list = allRecipes().filter((r) => !conflicts(r, profile).length);
  const maxTime = profile.time || Math.min(...(profile.diets || []).map((d) => DIETS[d]?.prefersMaxTime || Infinity));
  const lightTag = (profile.diets || []).some((d) => DIETS[d]?.prefersTag);
  const levelMax = { iniciante: 1, intermediario: 2, avancado: 3 }[profile.level] || 3;
  const diff = { facil: 1, medio: 2, dificil: 3 };
  const score = (r) =>
    r.rating +
    (Number.isFinite(maxTime) && maxTime > 0 && r.total <= maxTime ? 2 : 0) +
    (lightTag && (r.tags.includes('leve') || r.cats.includes('saudaveis')) ? 1.5 : 0) +
    (diff[r.difficulty] <= levelMax ? 1 : -1);
  return list.sort((a, b) => score(b) - score(a)).slice(0, n);
}

export const hasPrefs = (p) => !!(p.diets?.length || p.restrictions?.length || p.dislikes?.length || p.time);
