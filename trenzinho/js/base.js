'use strict';
// Base: utilidades de SVG, matemática, ritmo e paleta.
const T = window.T = { W: 1920, H: 1080, DUR: 137.28, BEAT: 0.4594, BEAT0: 3.72, RAIL: 800 };
const NS = 'http://www.w3.org/2000/svg';
T.el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
T.g = (parent, html, attrs) => { const e = T.el('g', attrs || {}, parent); if (html) e.innerHTML = html; return e; };
let uidN = 0; T.uid = p => (p || 'u') + (++uidN);

const { sin, cos, PI, abs, floor, min, max, atan, sqrt } = Math;
T.clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
T.lerp = (a, b, u) => a + (b - a) * u;
T.ramp = (t, a, b) => T.clamp((t - a) / (b - a));
T.sm = u => u * u * (3 - 2 * u);                       // suaviza entrada e saída
T.smr = (t, a, b) => T.sm(T.ramp(t, a, b));
T.back = u => { const c = 1.9; const v = u - 1; return 1 + (c + 1) * v * v * v + c * v * v; }; // passa do ponto e volta
T.bump = (t, t0, d) => (t > t0 && t < t0 + d) ? sin(PI * (t - t0) / d) : 0;   // sobe e desce
T.pop = (t, t0, d) => T.back(T.ramp(t, t0, t0 + d));
T.rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let r = Math.imul(seed ^ seed >>> 15, 1 | seed); r = r + Math.imul(r ^ r >>> 7, 61 | r) ^ r; return ((r ^ r >>> 14) >>> 0) / 4294967296; };
// Quadros-chave: [[t, v], ...] com transição suave entre eles.
T.kf = keys => t => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t < keys[i][0]) { const a = keys[i - 1], b = keys[i]; return T.lerp(a[1], b[1], T.sm((t - a[0]) / (b[0] - a[0]))); }
  return keys[keys.length - 1][1];
};
T.beat = t => (t - T.BEAT0) / T.BEAT;                  // posição em batidas
T.bounce = t => abs(sin(PI * T.beat(t)));              // pulo a cada batida
T.swing = (t, n = 2) => sin(2 * PI * T.beat(t) / n);   // balanço a cada n batidas

// Boca: abre nas sílabas cantadas.
T.sing = (t, off = 0) => {
  const L = window.LETRA; t -= off;
  let lo = 0, hi = L.length - 1;
  while (lo < hi) { const m = (lo + hi + 1) >> 1; if (L[m][0] <= t) lo = m; else hi = m - 1; }
  const w = L[lo]; if (t < w[0] || t > w[1] + 0.06) return 0;
  const d = Math.max(w[1] - w[0], 0.12), n = Math.max(1, Math.round(d / 0.24));
  return 0.35 + 0.65 * abs(sin(PI * n * (t - w[0]) / d + 0.5));
};

T.C = {
  coral: '#F0665A', coralD: '#D24C45', coralL: '#F78A7B', gold: '#F7C245', goldD: '#E0A52B', goldL: '#FCDB7A',
  sky: '#6EC3EE', skyD: '#3F97CE', skyL: '#A5DCF7', green: '#3DB57C', greenD: '#2A9364', greenL: '#6FD29E',
  orange: '#F58F3C', lilac: '#B79AE0', lilacD: '#9478C7', lilacL: '#D3C0F0', cream: '#FFF4DD', creamD: '#F0DFBE',
  brown: '#7A5238', brownD: '#5E3D29', brownL: '#A47550', ink: '#2E3A59', blue: '#3F8FD9', blueD: '#2E6FB3', blueL: '#6AB0EC',
  pink: '#F7A8B8', white: '#FFFFFF'
};
T.setT = (e, s) => e.setAttribute('transform', s);
T.show = (e, on) => { const v = on ? '' : 'none'; if (e.style.display !== v) e.style.display = v; };
T.op = (e, o) => { e.style.opacity = o; };

// Balanço de árvores e flores: elementos com data-sw="x,y,amplitude".
T.collectSways = root => [...root.querySelectorAll('[data-sw]')].map((e, i) => { const [x, y, a] = e.getAttribute('data-sw').split(',').map(Number); return { e, x, y, a, ph: i * 1.7 }; });
T.runSways = (list, t, k = 1) => { for (const s of list) s.e.setAttribute('transform', `rotate(${(s.a * k * sin(t * 1.7 + s.ph)).toFixed(2)} ${s.x} ${s.y})`); };
// Camada que se repete: conteúdo + cópias à esquerda e à direita.
T.tile = (parent, W, html) => { const id = T.uid('t'); const g = T.el('g', {}, parent); let u = ''; for (let k = -1; k * W < 1920 + W; k++) if (k) u += `<use href="#${id}" x="${k * W}"/>`; g.innerHTML = `<g id="${id}">${html}</g>${u}`; g._W = W; return g; };
T.scrollTile = (g, off) => { const W = g._W; let o = off % W; if (o < 0) o += W; T.setT(g, `translate(${(-o).toFixed(1)},0)`); };
