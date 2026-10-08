/*
 * Estado do usuário, salvo no aparelho (localStorage).
 * Módulos de domínio (favoritos, histórico, lista, perfil...) leem e gravam por aqui e avisam a interface
 * por eventos ('favorites', 'shopping', 'history', 'profile', 'cooking', 'ratings').
 */
const KEY = 'tempero:v1';

const DEFAULT = () => ({
  favorites: {},        // { recipeId: { lists: ['fav','want'], at } }
  cooked: {},           // { recipeId: [timestamps] }
  history: [],          // [{ id, at, type: 'view' | 'cook' }]  (mais recente primeiro)
  ratings: {},          // { recipeId: { stars, at } }
  shopping: [],         // ver core/shopping.js
  checks: {},           // ingredientes já separados: { recipeId: [índices] }
  servings: {},         // porções escolhidas por receita
  cooking: null,        // receita em andamento: { id, step, servings, startedAt, done: [índices] }
  pantry: [],           // ingredientes informados em "o que tenho"
  searches: [],         // buscas recentes
  profile: {
    name: '', photo: '', diets: [], restrictions: [], dislikes: [], level: 'iniciante', time: 0,
    sound: true, wake: true, onboarded: false,
  },
});

function read() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!raw) return DEFAULT();
    const d = DEFAULT();
    return { ...d, ...raw, profile: { ...d.profile, ...(raw.profile || {}) } };
  } catch {
    return DEFAULT();
  }
}

export const state = read();

let saveTimer = null;
export function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flush, 120);
}
export function flush() {
  clearTimeout(saveTimer);
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { console.warn('Não foi possível salvar', e); }
}
addEventListener('pagehide', flush);

const listeners = new Map();
export function on(topic, fn) {
  if (!listeners.has(topic)) listeners.set(topic, new Set());
  listeners.get(topic).add(fn);
  return () => listeners.get(topic).delete(fn);
}
export function emit(topic, data) {
  save();
  listeners.get(topic)?.forEach((fn) => fn(data));
  listeners.get('*')?.forEach((fn) => fn(topic, data));
}

export function resetAll() {
  const d = DEFAULT();
  Object.keys(state).forEach((k) => delete state[k]);
  Object.assign(state, d);
  flush();
  emit('*');
}

/* ---------------- Favoritos e coleções ---------------- */
export const LISTS = {
  fav: { label: 'Favoritas', emoji: '❤️' },
  want: { label: 'Quero fazer', emoji: '🔖' },
  done: { label: 'Já fiz', emoji: '✅' },
};

export const isFav = (id) => !!state.favorites[id]?.lists.includes('fav');
export const inList = (id, list) => list === 'done' ? !!state.cooked[id]?.length : !!state.favorites[id]?.lists.includes(list);

export function toggleList(id, list, force) {
  const cur = state.favorites[id] || { lists: [], at: Date.now() };
  const has = cur.lists.includes(list);
  const want = force ?? !has;
  if (want && !has) cur.lists.push(list);
  if (!want && has) cur.lists = cur.lists.filter((l) => l !== list);
  cur.at = Date.now();
  if (cur.lists.length) state.favorites[id] = cur; else delete state.favorites[id];
  emit('favorites', id);
  return want;
}
export const toggleFav = (id) => toggleList(id, 'fav');

export function listIds(list) {
  if (list === 'done') {
    return Object.entries(state.cooked).filter(([, v]) => v.length).sort((a, b) => b[1].at(-1) - a[1].at(-1)).map(([k]) => k);
  }
  return Object.entries(state.favorites).filter(([, v]) => v.lists.includes(list)).sort((a, b) => b[1].at - a[1].at).map(([k]) => k);
}

/* ---------------- Histórico ---------------- */
export function addHistory(id, type = 'view') {
  state.history = [{ id, at: Date.now(), type }, ...state.history.filter((h) => !(h.id === id && (h.type === type || type === 'cook')))].slice(0, 60);
  emit('history', id);
}

/** Uma linha por receita, com a interação mais recente (preparar tem prioridade sobre ver). */
export function recentHistory(limit = 20) {
  const seen = new Map();
  for (const h of state.history) {
    if (!seen.has(h.id)) seen.set(h.id, h);
  }
  return [...seen.values()].slice(0, limit).map((h) => {
    const cookedAt = state.cooked[h.id]?.at(-1);
    return { ...h, cookedAt };
  });
}

export function markCooked(id) {
  (state.cooked[id] ||= []).push(Date.now());
  addHistory(id, 'cook');
  emit('cooked', id);
}

/* ---------------- Avaliações ---------------- */
export function rate(id, stars) {
  state.ratings[id] = { stars, at: Date.now() };
  emit('ratings', id);
}

/* ---------------- Ingredientes separados e porções ---------------- */
export function toggleCheck(id, idx) {
  const arr = state.checks[id] || [];
  const i = arr.indexOf(idx);
  if (i >= 0) arr.splice(i, 1); else arr.push(idx);
  state.checks[id] = arr;
  emit('checks', id);
  return i < 0;
}
export const isChecked = (id, idx) => !!state.checks[id]?.includes(idx);
export function setServings(id, n) { state.servings[id] = n; emit('servings', id); }

/* ---------------- Preparo em andamento ---------------- */
export function startCooking(id, servings, step = 0) {
  const keep = state.cooking?.id === id ? state.cooking : null;
  state.cooking = { id, step, servings, startedAt: keep?.startedAt || Date.now(), done: keep?.done || [] };
  emit('cooking');
}
export function setCookingStep(step, completed) {
  if (!state.cooking) return;
  state.cooking.step = step;
  if (completed != null && !state.cooking.done.includes(completed)) state.cooking.done.push(completed);
  emit('cooking');
}
export function clearCooking() { state.cooking = null; emit('cooking'); }

/* ---------------- Buscas recentes ---------------- */
export function addSearch(q) {
  q = q.trim();
  if (q.length < 2) return;
  state.searches = [q, ...state.searches.filter((s) => s.toLowerCase() !== q.toLowerCase())].slice(0, 8);
  emit('searches');
}
export function clearSearches() { state.searches = []; emit('searches'); }

/* ---------------- Perfil ---------------- */
export function setProfile(patch) { Object.assign(state.profile, patch); emit('profile'); }
