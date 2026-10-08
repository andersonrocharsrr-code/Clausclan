/*
 * Timers da cozinha.
 * Funcionam por horário de término (não por contagem de ticks), então continuam certos com a tela bloqueada,
 * trocando de etapa ou recarregando o app. Vários podem rodar ao mesmo tempo (ex.: massa e bacon).
 *
 * Timer: { id, label, recipeId, step, duration, endsAt, remaining, status: 'idle'|'running'|'paused'|'done' }
 */
import { alarm } from './sound.js';

const KEY = 'tempero:timers';
const timers = new Map();
const listeners = new Set();
let tickHandle = null;

try {
  for (const t of JSON.parse(localStorage.getItem(KEY) || '[]')) timers.set(t.id, t);
} catch { /* sem timers salvos */ }

const persist = () => {
  try { localStorage.setItem(KEY, JSON.stringify([...timers.values()].filter((t) => t.status !== 'idle'))); } catch { /* cheio */ }
};
const notify = () => listeners.forEach((fn) => fn());

export const onTimers = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

export function remaining(t) {
  if (t.status === 'running') return Math.max(0, (t.endsAt - Date.now()) / 1000);
  return t.remaining;
}

export function ensure(id, { label, recipeId, step, duration }) {
  if (!timers.has(id)) timers.set(id, { id, label, recipeId, step, duration, remaining: duration, endsAt: 0, status: 'idle' });
  return timers.get(id);
}

export const get = (id) => timers.get(id);
export const active = () => [...timers.values()].filter((t) => t.status === 'running' || t.status === 'paused' || t.status === 'done');

export function start(id) {
  const t = timers.get(id);
  if (!t) return;
  if (t.status === 'done') t.remaining = t.duration;
  t.endsAt = Date.now() + t.remaining * 1000;
  t.status = 'running';
  persist(); loop(); notify();
}

export function pause(id) {
  const t = timers.get(id);
  if (!t || t.status !== 'running') return;
  t.remaining = remaining(t);
  t.status = 'paused';
  persist(); notify();
}

export function reset(id) {
  const t = timers.get(id);
  if (!t) return;
  t.remaining = t.duration;
  t.status = 'idle';
  t.endsAt = 0;
  persist(); notify();
}

export function add(id, sec) {
  const t = timers.get(id);
  if (!t) return;
  if (t.status === 'running') t.endsAt += sec * 1000;
  else t.remaining = Math.max(0, t.remaining + sec);
  if (t.status === 'done') { t.remaining = sec; t.endsAt = Date.now() + sec * 1000; t.status = 'running'; }
  t.duration = Math.max(t.duration, Math.ceil(remaining(t)));
  persist(); loop(); notify();
}

export function dismiss(id) {
  const t = timers.get(id);
  if (!t) return;
  timers.delete(id);
  persist(); notify();
}

/** Remove timers de uma receita (ao sair do preparo). */
export function clearRecipe(recipeId) {
  for (const t of [...timers.values()]) if (t.recipeId === recipeId) timers.delete(t.id);
  persist(); notify();
}

function loop() {
  if (tickHandle) return;
  tickHandle = setInterval(() => {
    let running = 0;
    for (const t of timers.values()) {
      if (t.status !== 'running') continue;
      if (Date.now() >= t.endsAt) {
        t.status = 'done';
        t.remaining = 0;
        persist();
        alarm(t);
      } else running++;
    }
    notify();
    if (!running) { clearInterval(tickHandle); tickHandle = null; }
  }, 250);
}

if ([...timers.values()].some((t) => t.status === 'running')) loop();
