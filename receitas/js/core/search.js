/*
 * Busca inteligente: nome, ingrediente, categoria, tipo de prato e intenções ("rápidas", "fácil", "doce").
 * Cada palavra precisa aparecer em algum lugar (E lógico); o nome pesa mais que ingredientes e descrição.
 * Aceita digitação parcial ("fran" → frango) e plural simples ("bolos" → bolo).
 */
import { allRecipes } from './repo.js';
import { TIME_FILTERS } from '../data/categories.js';
import { norm } from './util.js';
import { conflicts } from './prefs.js';

// Palavras que viram filtro em vez de texto.
const INTENTS = [
  { re: /^(rapid[ao]s?|ligeir[ao]s?|pratic[ao]s?)$/, apply: (r) => r.total <= 30, label: 'até 30 min' },
  { re: /^(facil|faceis|simples)$/, apply: (r) => r.difficulty === 'facil' },
  { re: /^(doce|doces|sobremesas?)$/, apply: (r) => r.cats.includes('sobremesas') },
  { re: /^(salgad[ao]s?)$/, apply: (r) => !r.cats.includes('sobremesas') },
  { re: /^(leves?|saudave(l|is))$/, apply: (r) => r.cats.includes('saudaveis') || r.tags.includes('leve') },
  { re: /^(vegetarian[ao]s?)$/, apply: (r) => !r.has.some((h) => ['carne', 'frango', 'peixe'].includes(h)) },
  { re: /^(forno)$/, apply: (r) => r.tags.includes('forno') || r.steps.some((s) => s.oven) },
];
const STOP = new Set(['de', 'da', 'do', 'das', 'dos', 'com', 'e', 'a', 'o', 'as', 'os', 'para', 'receita', 'receitas', 'prato', 'pratos', 'em', 'no', 'na', 'sem']);

const singular = (w) => (w.length > 4 && w.endsWith('es') ? w.slice(0, -2) : w.length > 3 && w.endsWith('s') ? w.slice(0, -1) : w);

function wordHit(text, w) {
  if (!text) return 0;
  const words = text.split(' ');
  if (words.includes(w)) return 3;
  if (words.some((x) => x.startsWith(w))) return 2;
  const s = singular(w);
  if (s !== w && words.some((x) => x.startsWith(s))) return 2;
  return 0;
}

/**
 * @param {string} query
 * @param {{time?: string, diff?: string[], meals?: string[], cats?: string[], respectPrefs?: boolean, profile?: object}} f
 */
export function search(query, f = {}) {
  const q = norm(query);
  const words = q.split(' ').filter((w) => w && !STOP.has(w));
  const intents = [];
  const terms = [];
  for (const w of words) {
    const it = INTENTS.find((i) => i.re.test(w));
    if (it) intents.push(it); else terms.push(w);
  }

  const timeTest = TIME_FILTERS.find((t) => t.id === f.time)?.test;
  const out = [];
  for (const r of allRecipes()) {
    if (timeTest && !timeTest(r.total)) continue;
    if (f.diff?.length && !f.diff.includes(r.difficulty)) continue;
    if (f.meals?.length && !f.meals.some((m) => r.meals.includes(m))) continue;
    if (f.cats?.length && !f.cats.some((c) => r.cats.includes(c))) continue;
    if (f.respectPrefs && f.profile && conflicts(r, f.profile).length) continue;
    if (!intents.every((i) => i.apply(r))) continue;

    let score = 0;
    let ok = true;
    for (const w of terms) {
      const n = wordHit(r._name, w) * 10;
      const t = wordHit(r._text, w) * 3;
      const g = wordHit(r._ing, w) * 2;
      const s = Math.max(n, t, g);
      if (!s) { ok = false; break; }
      score += n + t + g;
    }
    if (!ok) continue;
    if (terms.length && r._name.includes(terms.join(' '))) score += 25; // frase exata no nome
    score += r.rating; // desempate pela avaliação
    out.push({ r, score, viaIngredient: terms.some((w) => wordHit(r._ing, w) && !wordHit(r._name, w)) });
  }
  out.sort((a, b) => b.score - a.score);
  return out;
}

export const SUGGESTIONS = ['frango', 'bolo de chocolate', 'arroz', 'receitas rápidas', 'sobremesa', 'massas', 'sem forno', 'brasileiras'];
