/* Utilidades pequenas, sem dependências. */

export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => [...el.querySelectorAll(s)];

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Minúsculas, sem acentos e espaços extras — base de toda comparação de texto. */
export const norm = (s) =>
  String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export function debounce(fn, ms) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/** 70 → "1h 10min"; 45 → "45 min" */
export function fmtMinutes(m) {
  if (!m) return '0 min';
  const h = Math.floor(m / 60), r = Math.round(m % 60);
  if (!h) return `${r} min`;
  return r ? `${h}h ${String(r).padStart(2, '0')}min` : `${h}h`;
}

/** segundos → "10:00" ou "1:05:00" */
export function fmtClock(sec) {
  sec = Math.max(0, Math.ceil(sec));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  const mm = String(m).padStart(h ? 2 : 2, '0'), ss = String(s).padStart(2, '0');
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** segundos → "8 minutos", "30 segundos", "1 h 30 min" */
export function fmtDuration(sec) {
  if (sec < 60) return `${sec} segundos`;
  const m = Math.round(sec / 60);
  if (m < 60) return m === 1 ? '1 minuto' : `${m} minutos`;
  const h = Math.floor(m / 60), r = m % 60;
  return r ? `${h} h ${r} min` : `${h} ${h === 1 ? 'hora' : 'horas'}`;
}

export function relTime(ts, now = Date.now()) {
  const d = Math.round((now - ts) / 1000);
  if (d < 60) return 'agora mesmo';
  const m = Math.round(d / 60);
  if (m < 60) return `há ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `há ${h} ${h === 1 ? 'hora' : 'horas'}`;
  const days = Math.round(h / 24);
  if (days === 1) return 'ontem';
  if (days < 30) return `há ${days} dias`;
  const mo = Math.round(days / 30);
  return mo < 12 ? `há ${mo} ${mo === 1 ? 'mês' : 'meses'}` : `há ${Math.round(mo / 12)} ano(s)`;
}

export const fmtNumber = (n) => n.toLocaleString('pt-BR');
export const fmtRating = (n) => n.toFixed(1).replace('.', ',');

/** Gerador pseudoaleatório com semente (ilustrações estáveis entre renderizações). */
export function seeded(seed) {
  let s = typeof seed === 'number' ? seed : [...String(seed)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function vibrate(p) { try { navigator.vibrate?.(p); } catch { /* sem suporte */ } }
