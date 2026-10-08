/*
 * Lista de compras.
 * Itens vindos de receitas são somados quando o ingrediente e a unidade coincidem
 * ("500 g de carne moída" + "400 g de carne moída" = "900 g de carne moída") e são agrupados por seção do mercado.
 *
 * Item: { key, id?, name, q, u, aisle, checked, from: [recipeId], manual?, at }
 */
import { INGREDIENTS, AISLES } from '../data/ingredients.js';
import { state, emit } from './store.js';
import { describe, scaleQty, UNITS } from './quantity.js';
import { norm, uid } from './util.js';

const itemKey = (id, u) => `${id}|${u}`;

/** Adiciona ingredientes de uma receita (já recalculados pelo fator de porções). Retorna quantos entraram. */
export function addFromRecipe(recipe, entries, factor = 1) {
  let n = 0;
  for (const e of entries) {
    const ing = INGREDIENTS[e.id];
    if (!ing || e.id === 'agua') continue;
    const q = e.q == null ? null : scaleQty(e.q, e.u, factor, ing);
    const key = itemKey(e.id, e.u);
    const cur = state.shopping.find((x) => x.key === key && !x.checked);
    if (cur) {
      if (q != null && cur.q != null && !UNITS[e.u]?.fixed) cur.q = Math.round((cur.q + q) * 100) / 100;
      if (!cur.from.includes(recipe.id)) cur.from.push(recipe.id);
    } else {
      state.shopping.push({ key, id: e.id, name: ing.n, q, u: e.u, aisle: ing.aisle, checked: false, from: [recipe.id], at: Date.now() });
    }
    n++;
  }
  emit('shopping');
  return n;
}

/** Item digitado pelo usuário. Se o nome bater com o catálogo, herda seção e ícone. */
export function addManual(text, qty) {
  const name = text.trim();
  if (!name) return null;
  const nn = norm(name);
  const match = Object.entries(INGREDIENTS).find(([, i]) => norm(i.n) === nn || norm(i.p || '') === nn || (i.alias || []).map(norm).includes(nn));
  const id = match?.[0];
  const item = {
    key: id ? itemKey(id, 'manual') : `m:${uid()}`,
    id: id || null,
    name: match ? match[1].n : name,
    q: qty ? Number(qty) || null : null,
    u: qty ? 'un' : 'gosto',
    aisle: match ? match[1].aisle : guessAisle(nn),
    checked: false, from: [], manual: true, at: Date.now(),
  };
  state.shopping.push(item);
  emit('shopping');
  return item;
}

const GUESS = [
  [/(alface|rucula|fruta|banana|maca|uva|morango|abacaxi|manga|melao|melancia|legume|verdura|pimenta|gengibre|batata doce|repolho|brocolis|espinafre|abobora|beterraba|chuchu|quiabo|jilo|berinjela)/, 'horti'],
  [/(carne|bife|file|frango|peixe|camarao|linguica|salsicha|picanha|alcatra|costela|lombo|peru|atum|sardinha|salmao|bacalhau|hamburguer)/, 'carnes'],
  [/(leite|queijo|iogurte|requeijao|manteiga|margarina|nata|ovo|creme)/, 'laticinios'],
  [/(sal|pimenta|tempero|oregano|cominho|canela|cravo|colorau|curry|caldo)/, 'temperos'],
  [/(arroz|feijao|macarrao|massa|farinha|acucar|cafe|oleo|azeite|molho|biscoito|bolacha|pao|cereal|aveia|fuba|milho|enlatado|lata|vinagre|chocolate)/, 'mercearia'],
];
const guessAisle = (nn) => GUESS.find(([re]) => re.test(nn))?.[1] || 'outros';

export function toggleBought(key) {
  const it = state.shopping.find((x) => x.key === key);
  if (!it) return;
  it.checked = !it.checked;
  emit('shopping');
  return it.checked;
}

export function removeItem(key) {
  const i = state.shopping.findIndex((x) => x.key === key);
  if (i < 0) return null;
  const [it] = state.shopping.splice(i, 1);
  emit('shopping');
  return { it, i };
}

export function restoreItem({ it, i }) {
  state.shopping.splice(i, 0, it);
  emit('shopping');
}

/** Aumenta/diminui a quantidade num passo que faz sentido para a unidade. */
export function stepQty(key, dir) {
  const it = state.shopping.find((x) => x.key === key);
  if (!it) return;
  const u = UNITS[it.u] || UNITS.un;
  if (it.q == null || u.fixed) { it.q = dir > 0 ? 1 : null; if (it.q) it.u = it.u === 'gosto' ? 'un' : it.u; emit('shopping'); return; }
  const step = u.metric ? (it.q >= 1000 ? 250 : it.q >= 200 ? 100 : it.q >= 50 ? 50 : 10) : (u.step && u.step < 1 ? u.step * 2 : 1);
  const next = Math.round((it.q + dir * step) * 100) / 100;
  if (next <= 0) { it.q = null; if (it.u === 'un') it.u = 'gosto'; } else it.q = next;
  emit('shopping');
}

export function clearBought() {
  state.shopping = state.shopping.filter((x) => !x.checked);
  emit('shopping');
}
export function clearAll() { state.shopping = []; emit('shopping'); }

export const itemText = (it) => (it.q == null ? { qty: '', name: it.name } : describe({ id: it.id, name: it.name, q: it.q, u: it.u }, 1));

/** Seções na ordem do mercado, só as que têm itens; comprados vão para o fim de cada seção. */
export function grouped() {
  const groups = {};
  for (const it of state.shopping) (groups[it.aisle] ||= []).push(it);
  return Object.entries(groups)
    .sort((a, b) => (AISLES[a[0]]?.order || 99) - (AISLES[b[0]]?.order || 99))
    .map(([aisle, items]) => ({ aisle, ...AISLES[aisle], items: items.sort((a, b) => a.checked - b.checked || a.at - b.at) }));
}

export function asText() {
  return grouped().map((g) => `${g.emoji} ${g.label}\n` + g.items.map((it) => {
    const t = itemText(it);
    return `${it.checked ? '✓' : '•'} ${t.qty ? `${t.full}` : cap(t.name)}`;
  }).join('\n')).join('\n\n');
}
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export const shoppingCount = () => state.shopping.filter((x) => !x.checked).length;
