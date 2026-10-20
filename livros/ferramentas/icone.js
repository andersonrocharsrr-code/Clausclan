// Peças do ícone (viewBox 0 0 100 100), reaproveitadas em todos os tamanhos.
const DEFS = (p) => `
 <radialGradient id="${p}bg" cx="28%" cy="18%" r="95%"><stop offset="0" stop-color="#7b5cf0"/><stop offset=".45" stop-color="#3b2483"/><stop offset="1" stop-color="#140c2e"/></radialGradient>
 <radialGradient id="${p}glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffc56b" stop-opacity=".55"/><stop offset="1" stop-color="#ffc56b" stop-opacity="0"/></radialGradient>
 <linearGradient id="${p}pl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3d6"/><stop offset="1" stop-color="#f6c477"/></linearGradient>
 <linearGradient id="${p}pr" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe4ad"/><stop offset="1" stop-color="#ee9d52"/></linearGradient>
 <linearGradient id="${p}cv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ec8fae"/><stop offset="1" stop-color="#b9507a"/></linearGradient>
 <linearGradient id="${p}wv" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8af0df"/><stop offset="1" stop-color="#3fb8d6"/></linearGradient>
 <filter id="${p}soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.6"/></filter>`;
const BG = (p) => {
  const stars = [[16, 18, .9], [80, 14, .7], [88, 30, .5], [12, 44, .5], [70, 24, .45], [24, 84, .4], [86, 82, .35], [60, 10, .5]]
    .map(([x, y, o]) => `<circle cx="${x}" cy="${y}" r="${(o * 1.3).toFixed(2)}" fill="#fff" opacity="${o}"/>`).join('');
  return `<rect width="100" height="100" fill="url(#${p}bg)"/>${stars}`;
};
const FG = (p) => `<g transform="translate(-3 0)">
 <circle cx="45" cy="56" r="34" fill="url(#${p}glow)"/>
 <!-- capa -->
 <path d="M14 38 C26 33 38 34 45 40 C52 34 64 33 76 38 L76 76 C64 72 52 73 45 79 C38 73 26 72 14 76 Z" fill="url(#${p}cv)"/>
 <!-- páginas -->
 <path d="M17 35 C28 31 39 32 45 38 L45 75 C39 70 28 69 17 72 Z" fill="url(#${p}pl)"/>
 <path d="M73 35 C62 31 51 32 45 38 L45 75 C51 70 62 69 73 72 Z" fill="url(#${p}pr)"/>
 <path d="M45 38 L45 75" stroke="#c9763a" stroke-width="1.2" opacity=".55"/>
 <g stroke="#c98a4a" stroke-width="1.6" stroke-linecap="round" opacity=".45" fill="none">
  <path d="M23 45 C29 43.5 34 43.5 39 45"/><path d="M23 51 C29 49.5 34 49.5 39 51"/><path d="M23 57 C29 55.5 34 55.5 39 57"/><path d="M23 63 C28 61.7 32 61.7 35 62.6"/>
  <path d="M51 45 C56 43.5 61 43.5 67 45"/><path d="M51 51 C56 49.5 61 49.5 67 51"/>
 </g>
 <!-- ondas de som -->
 <g fill="none" stroke-linecap="round">
  <path d="M80 47 C84 51 84 59 80 63" stroke="#7ff0dc" stroke-width="5" opacity=".5" filter="url(#${p}soft)"/>
  <path d="M86 41 C93 49 93 61 86 69" stroke="#7ff0dc" stroke-width="5" opacity=".4" filter="url(#${p}soft)"/>
  <path d="M80 47 C84 51 84 59 80 63" stroke="url(#${p}wv)" stroke-width="4.2"/>
  <path d="M86 41 C93 49 93 61 86 69" stroke="url(#${p}wv)" stroke-width="4.2"/>
 </g>
 <!-- brilho -->
 <path d="M58 15 L60.2 21.8 L67 24 L60.2 26.2 L58 33 L55.8 26.2 L49 24 L55.8 21.8 Z" fill="#ffd98a"/>
 <circle cx="58" cy="24" r="7" fill="#ffd98a" opacity=".35" filter="url(#${p}soft)"/></g>`;
// ícone completo; rx = canto arredondado (0 para quadrado)
const full = (p, rx = 22) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs>${DEFS(p)}<clipPath id="${p}c"><rect width="100" height="100" rx="${rx}"/></clipPath></defs><g clip-path="url(#${p}c)">${BG(p)}${FG(p)}</g></svg>`;
module.exports = { DEFS, BG, FG, full };
// frente do ícone adaptativo do Android: o desenho encolhido para caber na área segura
const fore = (p) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs>${DEFS(p)}</defs><g transform="translate(50 50) scale(.66) translate(-50 -50)">${FG(p)}</g></svg>`;
const back = (p) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs>${DEFS(p)}</defs>${BG(p)}</svg>`;
// ícone "maskable": fundo inteiro e desenho dentro do círculo seguro
const maskable = (p) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs>${DEFS(p)}</defs>${BG(p)}<g transform="translate(50 50) scale(.8) translate(-50 -50)">${FG(p)}</g></svg>`;
module.exports.fore = fore; module.exports.back = back; module.exports.maskable = maskable;
