/*
 * "O que posso fazer com o que tenho?"
 * Compara o que o usuário tem com os ingredientes principais de cada receita (sem contar sal, óleo, água e
 * pimenta, que consideramos de despensa). Prioriza quem usa mais itens que o usuário tem.
 */
import { INGREDIENTS } from '../data/ingredients.js';
import { allRecipes } from './repo.js';
import { norm } from './util.js';

const nameKeys = (id) => {
  const i = INGREDIENTS[id];
  return i ? [i.n, i.p, ...(i.alias || [])].filter(Boolean).map(norm) : [norm(id)];
};

const singular = (w) => w.replace(/(oes|aes)$/, 'ao').replace(/s$/, '');

/**
 * O usuário "tem" o ingrediente da receita quando:
 *  - escolheu exatamente esse ingrediente do catálogo; ou
 *  - escolheu um ingrediente cujo nome é apelido deste (cebola → cebola-roxa); ou
 *  - digitou uma palavra igual ao nome ou a um apelido ("queijo" → muçarela, parmesão, coalho...).
 */
function owns(have, ingId) {
  const keys = nameKeys(ingId);
  return have.some((h) => {
    if (h === ingId) return true;
    const typed = INGREDIENTS[h] ? norm(INGREDIENTS[h].n) : norm(h);
    return keys.includes(typed) || keys.includes(singular(typed));
  });
}

/** Lista de { r, have: [ids], missing: [ids], ratio } ordenada pela melhor combinação. */
export function whatCanICook(have) {
  if (!have.length) return [];
  const out = [];
  for (const r of allRecipes()) {
    const key = r.keyIngredients;
    const got = key.filter((id) => owns(have, id));
    if (!got.length) continue;
    out.push({ r, have: got, missing: key.filter((id) => !got.includes(id)), ratio: got.length / key.length });
  }
  return out.sort((a, b) => b.have.length - a.have.length || b.ratio - a.ratio || b.r.rating - a.r.rating);
}

/** Sugestões para o campo de digitação (catálogo, sem básicos). */
export function suggestIngredients(text, exclude = []) {
  const q = norm(text);
  if (!q) return [];
  const seen = new Set();
  const res = [];
  for (const [id, i] of Object.entries(INGREDIENTS)) {
    if (i.staple || exclude.includes(id)) continue;
    const keys = nameKeys(id);
    const hit = keys.some((k) => k.startsWith(q) || k.split(' ').some((w) => w.startsWith(q)));
    if (hit && !seen.has(i.n)) { seen.add(i.n); res.push(id); }
  }
  return res.slice(0, 8);
}
