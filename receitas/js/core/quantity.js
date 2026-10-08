/*
 * Quantidades: recálculo por porções e texto legível ("500 g de carne moída", "1 ½ xícara de farinha").
 * Usado na receita, no modo cozinhar e na lista de compras.
 */
import { INGREDIENTS } from '../data/ingredients.js';

/** Unidades: singular, plural, como arredondar e se a quantidade pode crescer com as porções. */
export const UNITS = {
  g: { s: 'g', p: 'g', metric: true },
  kg: { s: 'kg', p: 'kg', metric: true },
  ml: { s: 'ml', p: 'ml', metric: true },
  l: { s: 'litro', p: 'litros', step: 0.25 },
  xic: { s: 'xícara', p: 'xícaras', step: 0.25 },
  cs: { s: 'colher de sopa', p: 'colheres de sopa', step: 0.5 },
  cc: { s: 'colher de chá', p: 'colheres de chá', step: 0.25 },
  un: { s: '', p: '', step: 0.5 },
  dente: { s: 'dente', p: 'dentes', step: 1 },
  lata: { s: 'lata', p: 'latas', step: 0.5 },
  caixa: { s: 'caixa', p: 'caixas', step: 0.5 },
  fatia: { s: 'fatia', p: 'fatias', step: 1 },
  ramo: { s: 'ramo', p: 'ramos', step: 1 },
  folha: { s: '', p: '', step: 1 },
  maco: { s: 'maço', p: 'maços', step: 0.5 },
  pitada: { s: 'pitada', p: 'pitadas', fixed: true },
  gosto: { s: '', p: '', fixed: true },
};

const FRAC = { 0.25: '¼', 0.5: '½', 0.75: '¾' };

/** 1.5 → "1 ½"; 0.25 → "¼"; 3 → "3"; 2.4 → "2,4" */
export function fmtQty(q) {
  const whole = Math.floor(q + 1e-9), rest = Math.round((q - whole) * 100) / 100;
  if (FRAC[rest]) return whole ? `${whole} ${FRAC[rest]}` : FRAC[rest];
  if (!rest) return String(whole);
  return String(Math.round(q * 10) / 10).replace('.', ',');
}

/** Recalcula uma quantidade e arredonda para algo que dá para medir na cozinha. */
export function scaleQty(q, u, factor, ing) {
  if (q == null) return null;
  const unit = UNITS[u] || UNITS.un;
  if (unit.fixed) return q;
  let v = q * factor;
  if (unit.metric) {
    if (v >= 100) v = Math.round(v);
    else if (v >= 10) v = Math.round(v);
    else v = Math.round(v * 10) / 10;
    return v;
  }
  if (ing?.whole || unit.step === 1) return Math.max(1, Math.round(v));
  const st = unit.step || 0.5;
  return Math.max(st, Math.round(v / st) * st);
}

/** Converte g→kg e ml→l quando fica grande. */
function metricText(q, u) {
  if (u === 'g' && q >= 1000) return `${String(Math.round(q / 10) / 100).replace('.', ',')} kg`;
  if (u === 'ml' && q >= 1000) return `${String(Math.round(q / 10) / 100).replace('.', ',')} l`;
  if (u === 'kg' && q < 1) return `${Math.round(q * 1000)} g`;
  return `${String(q).replace('.', ',')} ${u}`;
}

export const ingName = (id, plural = false) => {
  const i = INGREDIENTS[id];
  if (!i) return id;
  return plural && i.p ? i.p : i.n;
};

/**
 * Partes do texto de um ingrediente, para a interface poder destacar a quantidade.
 *   { qty: '500 g', name: 'carne moída', note: 'picada', full: '500 g de carne moída' }
 */
export function describe(entry, factor = 1) {
  const ing = INGREDIENTS[entry.id] || { n: entry.name || entry.id };
  const name0 = entry.name || ing.n;
  const q = scaleQty(entry.q, entry.u, factor, ing);
  const unit = UNITS[entry.u] || UNITS.un;
  let qty = '', name = name0;

  if (entry.u === 'gosto' || q == null) {
    qty = '';
    name = `${cap(name0)} a gosto`;
  } else if (unit.metric) {
    qty = metricText(q, entry.u);
  } else if (entry.u === 'un') {
    qty = fmtQty(q);
    name = q > 1 && ing.p ? ing.p : name0;
  } else if (entry.u === 'folha') {
    qty = fmtQty(q);
    name = q > 1 && ing.p ? ing.p : name0;
  } else {
    qty = `${fmtQty(q)} ${q > 1 ? unit.p : unit.s}`;
  }

  const joiner = qty && entry.u !== 'un' && entry.u !== 'folha' ? ' de ' : ' ';
  const full = qty ? `${qty}${joiner}${name}` : name;
  return { qty, joiner: qty ? joiner : '', name, note: entry.note || '', full, q };
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
export { cap };
