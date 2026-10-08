/*
 * Cenas das etapas: ilustração animada do que fazer, montada a partir de `step.scene`:
 *   v  utensílio (onde acontece)    a  ação    f  o que está dentro    it  ingredientes que aparecem
 * Mais `step.heat` (chamas no fogão) e `step.oven` (temperatura no painel do forno).
 * A mesma gramática serve para qualquer receita, então as ilustrações ficam consistentes entre elas.
 */
import { foodIconInner, iconKey } from './icons-food.js';
import { seeded } from '../core/util.js';

let uidN = 0;
const CX = 180;

/* ---------- conteúdos: cor base, pedacinhos e textura ---------- */
export const FILLS = {
  empty: { base: '#4F4B48', bits: [], tex: 'smooth' },
  oil: { base: '#5A5450', bits: ['#E9C04A'], tex: 'shimmer' },
  butter: { base: '#F2D46E', bits: ['#FFF3C4', '#E8BE4A'], tex: 'foam' },
  onion: { base: '#E9CF96', bits: ['#F8EDCF', '#D9B26B', '#F3E1B6'], tex: 'chunks' },
  meat: { base: '#7E3F2D', bits: ['#5E2C1F', '#A0583F', '#B96A4B'], tex: 'crumbs' },
  meatSauce: { base: '#A8361F', bits: ['#6E2618', '#C9533A', '#8A3A24'], tex: 'crumbs' },
  sauce: { base: '#C23D26', bits: ['#DA5A40', '#A52F1C'], tex: 'smooth' },
  sauceChunky: { base: '#CF5236', bits: ['#F0D39A', '#A93A26', '#E86A4C'], tex: 'chunks' },
  chicken: { base: '#D9A26B', bits: ['#F2D6AE', '#E6BE8A', '#C1834C'], tex: 'cubes' },
  chickenShred: { base: '#E3C08F', bits: ['#F3DCB7', '#CFA06B'], tex: 'strands' },
  chickenFilling: { base: '#E8C891', bits: ['#7DB458', '#F2C94C', '#F3DCB7', '#D9533A'], tex: 'chunks' },
  strogonoffBase: { base: '#C9763F', bits: ['#F2D6AE', '#B48C6A', '#E39A60'], tex: 'cubes' },
  strogonoff: { base: '#E5A274', bits: ['#F4DBB8', '#B48C6A', '#F1C7A2'], tex: 'cubes' },
  marinade: { base: '#C9923F', bits: ['#F4EEE4', '#B5401F', '#86B342'], tex: 'chunks' },
  riceMix: { base: '#F1E3C2', bits: ['#7DB458', '#F2C94C', '#EFA59C', '#FFFFFF'], tex: 'grains' },
  riceRaw: { base: '#ECE4D4', bits: ['#FFFFFF', '#D9CFBD'], tex: 'grains' },
  riceBeans: { base: '#B99470', bits: ['#7E5034', '#E6CFAE', '#F4E3B6'], tex: 'grains' },
  water: { base: '#9CCBE6', bits: ['#D9EEF8'], tex: 'liquid' },
  milk: { base: '#F7F3EA', bits: ['#FFFFFF', '#E9C04A'], tex: 'liquid' },
  broth: { base: '#E9AE55', bits: ['#EE8434', '#F3DCA4', '#7FAF4A', '#FFE6A8'], tex: 'chunks' },
  juice: { base: '#F2BE33', bits: ['#F8DA74'], tex: 'liquid' },
  dressing: { base: '#E3CB6D', bits: ['#F6E7A8', '#9FA43A'], tex: 'liquid' },
  pasta: { base: '#A9D1E8', bits: ['#F2D27A', '#E7BF57'], tex: 'strands' },
  carbonara: { base: '#EBC765', bits: ['#F6DE92', '#B8503F', '#2E2622'], tex: 'strands' },
  bacon: { base: '#8E3A2B', bits: ['#C9614F', '#F0C9BC', '#A44A38'], tex: 'cubes' },
  sausage: { base: '#7A3324', bits: ['#D9846D', '#A9432E', '#F3C9B9'], tex: 'rounds' },
  eggCream: { base: '#F3CF5E', bits: ['#F8E39A', '#2E2622'], tex: 'smooth' },
  egg: { base: '#F6D65E', bits: ['#FFF4C4', '#E8B93A'], tex: 'smooth' },
  batter: { base: '#EFD7A2', bits: ['#F7E8C6'], tex: 'smooth' },
  batterChoc: { base: '#5A2F1E', bits: ['#7A4430'], tex: 'smooth' },
  custard: { base: '#F2D78A', bits: ['#F8E8B6'], tex: 'smooth' },
  caramel: { base: '#C2741C', bits: ['#E39A3A', '#A55E14'], tex: 'glossy' },
  brigadeiro: { base: '#4A2414', bits: ['#6A3A24', '#3A1A0E'], tex: 'glossy' },
  sprinkles: { base: '#3A1F12', bits: ['#26110A', '#5A3020'], tex: 'grains' },
  mousse: { base: '#F5E29A', bits: ['#FBF0C4'], tex: 'smooth' },
  passionSauce: { base: '#F0A02A', bits: ['#2D2116', '#F8C35A'], tex: 'seeds' },
  puree: { base: '#F1D592', bits: ['#F8E7B9', '#E3BD6C'], tex: 'smooth' },
  dough: { base: '#F2E7D0', bits: ['#FBF6EA', '#E3D4B6'], tex: 'lumpy' },
  doughCheese: { base: '#F1E1B9', bits: ['#F2C94C', '#FBF3DD'], tex: 'lumpy' },
  beans: { base: '#2E1F1C', bits: ['#4A3433', '#5E4141', '#A6402B'], tex: 'beans' },
  beansLight: { base: '#8E6A4B', bits: ['#C9A47F', '#B08661', '#DCC09E'], tex: 'beans' },
  coalho: { base: '#5A5450', bits: ['#F3E2B4', '#D99A3E'], tex: 'cubes' },
  kale: { base: '#3E6E35', bits: ['#5A9B47', '#2F5A28', '#8EBF77'], tex: 'strands' },
  fish: { base: '#E8D3C3', bits: ['#F8EFE6', '#E7D3C1'], tex: 'cubes' },
  moquecaRaw: { base: '#D8B48C', bits: ['#F4EEF2', '#E1503A', '#F2C230', '#F8EFE6'], tex: 'rings' },
  moqueca: { base: '#E2642A', bits: ['#F8EFE6', '#D93A26', '#F2C230', '#4E8C3E'], tex: 'rings' },
  tapiocaFlour: { base: '#F5F2EC', bits: ['#FFFFFF', '#E7E0D4'], tex: 'powder' },
  tapioca: { base: '#F4F1EA', bits: ['#E7E0D4', '#FFFFFF'], tex: 'powder' },
  salad: { base: '#E8DDC2', bits: ['#E8C98D', '#E1503A', '#3F7A3A', '#9B4A7C', '#6BAA52'], tex: 'chunks' },
  chickpeas: { base: '#D9BD85', bits: ['#E8C98D', '#C9A35F'], tex: 'beans' },
  veggies: { base: '#E7C890', bits: ['#EE8434', '#F3DCA4', '#E8C38A'], tex: 'cubes' },
  crepe: { base: '#4F4B48', bits: ['#F2D79E'], tex: 'crepe' },
  gratin: { base: '#E3A63E', bits: ['#A4621F', '#C98A2E', '#F6CB66'], tex: 'spots' },
  pie: { base: '#E7AE4B', bits: ['#C98A2E', '#F7D178'], tex: 'spots' },
  pieRaw: { base: '#EFD7A2', bits: ['#E3C08F', '#7DB458', '#F2C94C'], tex: 'chunks' },
  lasagna: { base: '#C9432C', bits: ['#F2D488', '#F6DB8A', '#F0A6A0'], tex: 'layers' },
  panqueca: { base: '#C9432C', bits: ['#EFD3A2', '#F6DB8A'], tex: 'rolls' },
  cake: { base: '#4A2618', bits: ['#6E3A23'], tex: 'dome' },
  flan: { base: '#F2D18C', bits: ['#C9781F'], tex: 'flan' },
  chickenRaw: { base: '#E9E0D2', bits: [], tex: 'chickenRaw' },
  chickenGolden: { base: '#E9E0D2', bits: [], tex: 'chickenGolden' },
  brigadeiroBalls: { base: '#F4EAE0', bits: [], tex: 'balls', ball: '#3B1D10' },
  doughBalls: { base: '#F4EAE0', bits: [], tex: 'balls', ball: '#F2E7D0' },
  paoQueijo: { base: '#4F4B48', bits: [], tex: 'balls', ball: '#EFC26E' },
};

const fillOf = (f) => FILLS[f] || FILLS.onion;

/** Superfície do conteúdo dentro de uma elipse (cx, cy, rx, ry). */
function surface(id, f, cx, cy, rx, ry, rnd, extra = {}) {
  const F = fillOf(f);
  const clip = `${id}c${(rnd() * 1e6) | 0}`;
  let inner = `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${F.base}"/>`;
  const bits = F.bits;
  const pick = (i) => bits[i % bits.length];
  const sc = (n, fn) => { let o = ''; for (let i = 0; i < n; i++) { const a = rnd() * 6.283, d = Math.sqrt(rnd()); o += fn(cx + Math.cos(a) * d * rx, cy + Math.sin(a) * d * ry, i); } return o; };
  const tex = F.tex;
  if (tex === 'chunks') inner += sc(40, (x, y, i) => `<rect x="${(x - 3).toFixed(1)}" y="${(y - 2).toFixed(1)}" width="6" height="4" rx="1.5" fill="${pick(i)}"/>`);
  else if (tex === 'crumbs') inner += sc(70, (x, y, i) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1.6 + rnd() * 1.8).toFixed(1)}" fill="${pick(i)}"/>`);
  else if (tex === 'cubes') inner += sc(18, (x, y, i) => `<rect x="${(x - 6).toFixed(1)}" y="${(y - 4).toFixed(1)}" width="12" height="8" rx="3" fill="${pick(i)}"/>`);
  else if (tex === 'grains') inner += sc(110, (x, y, i) => `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="2.6" ry="1.1" fill="${pick(i)}" transform="rotate(${(rnd() * 180) | 0} ${x.toFixed(1)} ${y.toFixed(1)})"/>`);
  else if (tex === 'beans') inner += sc(60, (x, y, i) => `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="3.6" ry="2.4" fill="${pick(i)}"/>`);
  else if (tex === 'strands') inner += sc(26, (x, y, i) => `<path d="M${(x - 9).toFixed(1)} ${y.toFixed(1)}q9 ${(rnd() * 8 - 4).toFixed(1)} 18 0" stroke="${pick(i)}" stroke-width="3" fill="none" stroke-linecap="round"/>`);
  else if (tex === 'rounds') inner += sc(14, (x, y, i) => `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="7" ry="4.5" fill="${pick(i)}"/>`);
  else if (tex === 'rings') inner += sc(14, (x, y, i) => `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="8" ry="4" fill="none" stroke="${pick(i)}" stroke-width="3"/>`);
  else if (tex === 'seeds') inner += sc(40, (x, y, i) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.6" fill="${pick(i)}"/>`);
  else if (tex === 'spots') inner += sc(16, (x, y, i) => `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(4 + rnd() * 6).toFixed(1)}" ry="${(2 + rnd() * 3).toFixed(1)}" fill="${pick(i)}" opacity=".6"/>`);
  else if (tex === 'powder') inner += sc(60, (x, y, i) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.2" fill="${pick(i)}"/>`);
  else if (tex === 'lumpy') inner += sc(10, (x, y, i) => `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="10" ry="4" fill="${pick(i)}" opacity=".8"/>`);
  else if (tex === 'foam') inner += sc(20, (x, y, i) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1.5 + rnd() * 2.5).toFixed(1)}" fill="${pick(i)}" opacity=".9"/>`);
  else if (tex === 'shimmer') inner += `<ellipse cx="${cx}" cy="${cy}" rx="${rx * 0.7}" ry="${ry * 0.6}" fill="#E9C04A" opacity=".55"/><path class="s-shimmer" d="M${cx - rx * 0.4} ${cy}q${rx * 0.2} -4 ${rx * 0.4} 0t${rx * 0.4} 0" stroke="#FFF2B8" stroke-width="2" fill="none" opacity=".8"/>`;
  else if (tex === 'liquid') inner += `<ellipse cx="${cx - rx * 0.25}" cy="${cy - ry * 0.25}" rx="${rx * 0.45}" ry="${ry * 0.3}" fill="${bits[0]}" opacity=".55"/>`;
  else if (tex === 'glossy' || tex === 'smooth') inner += `<ellipse cx="${cx - rx * 0.3}" cy="${cy - ry * 0.3}" rx="${rx * 0.35}" ry="${ry * 0.25}" fill="#fff" opacity=".18"/>`;
  else if (tex === 'crepe') inner += `<ellipse cx="${cx}" cy="${cy}" rx="${rx * 0.85}" ry="${ry * 0.82}" fill="#F2D79E"/><ellipse cx="${cx - 10}" cy="${cy - 2}" rx="${rx * 0.4}" ry="${ry * 0.3}" fill="#E6BF72" opacity=".5"/>`;
  else if (tex === 'layers') inner += sc(10, (x, y, i) => `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="9" ry="4" fill="${pick(i)}"/>`);
  else if (tex === 'rolls') inner += [...Array(4)].map((_, i) => `<rect x="${cx - rx + 8}" y="${cy - ry + 3 + i * (ry * 2 - 6) / 4}" width="${rx * 2 - 16}" height="${(ry * 2 - 10) / 4}" rx="5" fill="#EFD3A2"/>`).join('') + `<ellipse cx="${cx}" cy="${cy}" rx="${rx * 0.45}" ry="${ry * 0.8}" fill="#C9432C" opacity=".9"/>`;
  else if (tex === 'dome') inner += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#5E3220"/><ellipse cx="${cx - 12}" cy="${cy - 3}" rx="${rx * 0.4}" ry="${ry * 0.35}" fill="#7A4430" opacity=".6"/>`;
  else if (tex === 'flan') inner += `<ellipse cx="${cx}" cy="${cy}" rx="${rx * 0.95}" ry="${ry * 0.95}" fill="#C9781F"/><ellipse cx="${cx}" cy="${cy}" rx="${rx * 0.3}" ry="${ry * 0.3}" fill="#F2D18C"/>`;
  return `<clipPath id="${clip}"><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/></clipPath><g clip-path="url(#${clip})">${inner}${extra.after || ''}</g>`;
}

/* ---------- pecinhas ---------- */
const item = (key, x, y, s = 1, cls = '', style = '') =>
  `<g transform="translate(${x} ${y})"><g class="${cls}" style="${style}"><g transform="scale(${s})">${foodIconInner(key)}</g></g></g>`;

const flames = (x, y, n) => {
  if (!n) return '';
  const xs = n === 1 ? [0] : n === 2 ? [-26, 26] : [-36, 0, 36];
  return xs.map((dx, i) => `<g transform="translate(${x + dx} ${y})"><path class="s-flame" style="animation-delay:${i * 0.17}s" d="M0 0c-8-4-8-14-2-22 1 6 4 8 6 8 2-4 1-8 0-12 8 6 10 16 6 22-2 3-6 4-10 4z" fill="#F08A2C"/>
    <path class="s-flame" style="animation-delay:${i * 0.17 + 0.1}s" d="M0 0c-4-2-4-8-1-12 2 4 4 4 4 2 3 3 3 8 1 10z" fill="#FFD25A"/></g>`).join('');
};

function stove(level) {
  const n = { baixo: 1, medio: 2, alto: 3 }[level] || 0;
  return `<rect x="60" y="203" width="240" height="10" rx="4" fill="#3A3633"/><rect x="80" y="196" width="200" height="8" rx="3" fill="#57514C"/>
    ${flames(CX, 200, n)}`;
}

const steam = (x, y, n = 3, w = 60) => [...Array(n)].map((_, i) => `<path class="s-steam" style="animation-delay:${(i * 0.7).toFixed(1)}s" d="M${x - w / 2 + (i * w) / Math.max(1, n - 1)} ${y}c-6-8 6-14 0-22s6-14 0-22" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-linecap="round" opacity=".0"/>`).join('');

const bubbles = (cx, cy, rx, n = 7, color = '#FFFFFF') => [...Array(n)].map((_, i) => {
  const x = cx - rx * 0.8 + (i * rx * 1.6) / (n - 1);
  return `<circle class="s-bubble" style="animation-delay:${(i * 0.37) % 1.6}s" cx="${x.toFixed(1)}" cy="${cy + ((i % 3) - 1) * 3}" r="${3 + (i % 3)}" fill="none" stroke="${color}" stroke-width="2"/>`;
}).join('');

const swirl = (cx, cy, rx, ry) => `<g class="s-swirl"><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="18 14" stroke-linecap="round" opacity=".85"/></g>`;

const woodSpoon = (x, y, r = -20) => `<g transform="translate(${x} ${y})"><g class="s-stir"><g transform="rotate(${r})"><rect x="-4" y="-110" width="8" height="96" rx="4" fill="#C9965F"/><ellipse cx="0" cy="-8" rx="11" ry="16" fill="#D6A56C"/><ellipse cx="-3" cy="-12" rx="4" ry="7" fill="#E7C08D" opacity=".7"/></g></g></g>`;

const whisk = (x, y) => `<g transform="translate(${x} ${y})"><g class="s-whisk"><g transform="rotate(-18)"><rect x="-4" y="-112" width="8" height="46" rx="4" fill="#C8553D"/>
  ${[-14, -7, 0, 7, 14].map((dx) => `<path d="M0 -68C${dx * 1.6} -50 ${dx * 1.6} -10 0 -2" stroke="#B9B3AA" stroke-width="2.2" fill="none"/>`).join('')}</g></g></g>`;

const spatula = (x, y, cls = 's-spread') => `<g transform="translate(${x} ${y})"><g class="${cls}"><g transform="rotate(-35)"><rect x="-3.5" y="-96" width="7" height="70" rx="3.5" fill="#2E2A27"/><rect x="-16" y="-30" width="32" height="28" rx="6" fill="#B9B3AA"/></g></g></g>`;

const knife = (x, y) => `<g transform="translate(${x} ${y})"><g class="s-chop"><path d="M-6 -2h70c6 0 8-6 2-10l-56-30c-8-4-16 2-16 10z" fill="#D9DDE1"/><path d="M-6 -2h70c6 0 8-6 2-10" fill="none" stroke="#AEB4BA" stroke-width="2"/>
  <rect x="-48" y="-12" width="44" height="12" rx="5" fill="#3A3330"/><circle cx="-38" cy="-6" r="1.8" fill="#9C948C"/><circle cx="-20" cy="-6" r="1.8" fill="#9C948C"/></g></g>`;

const arrowDown = (x, y) => `<g class="s-nudge"><path d="M${x} ${y}v22m-8-8 8 8 8-8" stroke="#C8603F" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;

const clock = (x, y, r = 20) => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="#fff" stroke="#C8603F" stroke-width="3"/><path d="M0 0v-${r * 0.6}" stroke="#2B201A" stroke-width="2.6" stroke-linecap="round"/>
  <path class="s-tick" d="M0 0h${r * 0.5}" stroke="#C8603F" stroke-width="2.6" stroke-linecap="round"/><circle r="2.5" fill="#2B201A"/></g>`;

/* ---------- utensílios (desenho + onde fica a superfície do conteúdo) ---------- */
const VESSELS = {
  pot: { surf: [CX, 120, 66, 14], draw: (inside) => `
    <rect x="98" y="114" width="20" height="10" rx="5" fill="#8E9499"/><rect x="242" y="114" width="20" height="10" rx="5" fill="#8E9499"/>
    <path d="M110 120v62c0 10 8 16 18 16h104c10 0 18-6 18-16v-62z" fill="url(#ID-steel)"/>
    <ellipse cx="${CX}" cy="120" rx="72" ry="17" fill="#3E3B39"/>${inside}
    <ellipse cx="${CX}" cy="120" rx="72" ry="17" fill="none" stroke="#C9CED3" stroke-width="3"/>
    <path d="M120 140v40" stroke="#fff" stroke-width="5" opacity=".25" stroke-linecap="round"/>` },
  pressure: { surf: null, draw: () => `
    <rect x="236" y="124" width="70" height="10" rx="5" fill="#2E2A27"/><rect x="54" y="124" width="70" height="10" rx="5" fill="#2E2A27"/>
    <path d="M114 124v58c0 10 8 16 18 16h96c10 0 18-6 18-16v-58z" fill="url(#ID-steel)"/>
    <path d="M110 126c0-18 30-30 70-30s70 12 70 30z" fill="#D5DADF"/><ellipse cx="${CX}" cy="126" rx="70" ry="10" fill="#B9BFC5"/>
    <rect x="173" y="78" width="14" height="20" rx="4" fill="#3A3633"/><circle cx="${CX}" cy="76" r="6" fill="#57514C"/>
    <path d="M124 146v34" stroke="#fff" stroke-width="5" opacity=".25" stroke-linecap="round"/>` },
  pan: { surf: [CX, 152, 76, 16], draw: (inside) => `
    <rect x="260" y="148" width="86" height="11" rx="5.5" fill="#2E2A27" transform="rotate(-6 260 150)"/>
    <path d="M96 152c4 26 22 38 84 38s80-12 84-38z" fill="#2F2B29"/>
    <ellipse cx="${CX}" cy="152" rx="84" ry="20" fill="#3A3633"/>${inside}
    <ellipse cx="${CX}" cy="152" rx="84" ry="20" fill="none" stroke="#5A5450" stroke-width="3"/>` },
  clay: { surf: [CX, 140, 82, 18], draw: (inside) => `
    <rect x="70" y="134" width="22" height="12" rx="6" fill="#3A2B25"/><rect x="268" y="134" width="22" height="12" rx="6" fill="#3A2B25"/>
    <path d="M88 140c2 34 26 52 92 52s90-18 92-52z" fill="#4A3730"/>
    <ellipse cx="${CX}" cy="140" rx="92" ry="22" fill="#2E211C"/>${inside}
    <ellipse cx="${CX}" cy="140" rx="92" ry="22" fill="none" stroke="#5E463C" stroke-width="4"/>` },
  bowl: { surf: [CX, 136, 66, 14], draw: (inside) => `
    <path d="M106 136c0 38 30 62 74 62s74-24 74-62z" fill="#F4EEE6"/><path d="M118 150c6 24 26 38 50 42" stroke="#fff" stroke-width="6" opacity=".6" fill="none" stroke-linecap="round"/>
    <path d="M106 136c0 38 30 62 74 62s74-24 74-62" fill="none" stroke="#DCD2C4" stroke-width="2"/>
    <ellipse cx="${CX}" cy="136" rx="74" ry="17" fill="#E6DED2"/>${inside}
    <ellipse cx="${CX}" cy="136" rx="74" ry="17" fill="none" stroke="#DCD2C4" stroke-width="3"/>` },
  dish: { surf: [CX, 146, 78, 20], draw: (inside, f) => `
    <path d="M88 146v30c0 10 8 18 18 18h148c10 0 18-8 18-18v-30z" fill="${f === 'riceMix' || f === 'gratin' ? '#2F5D62' : '#F2EBE1'}"/>
    <rect x="88" y="124" width="184" height="46" rx="20" fill="${f === 'riceMix' || f === 'gratin' ? '#3C6F75' : '#FBF7F1'}"/>${inside}
    <rect x="88" y="124" width="184" height="46" rx="20" fill="none" stroke="${f === 'riceMix' || f === 'gratin' ? '#2A5257' : '#E2D8CA'}" stroke-width="3"/>
    <path d="M100 182h160" stroke="#fff" stroke-width="3" opacity=".3" stroke-linecap="round"/>` },
  mold: { surf: [CX, 140, 64, 15], draw: (inside) => `
    <path d="M110 140v40c0 8 30 14 70 14s70-6 70-14v-40z" fill="url(#ID-steel)"/>
    <ellipse cx="${CX}" cy="140" rx="70" ry="18" fill="#4A4643"/>${inside}
    <ellipse cx="${CX}" cy="138" rx="12" ry="4" fill="#C9CED3"/><rect x="168" y="124" width="24" height="16" fill="#B9BFC5"/><ellipse cx="${CX}" cy="124" rx="12" ry="4" fill="#DDE1E5"/>
    <ellipse cx="${CX}" cy="140" rx="70" ry="18" fill="none" stroke="#C9CED3" stroke-width="3"/>` },
  plate: { surf: [CX, 160, 62, 14], draw: (inside) => `
    <ellipse cx="${CX}" cy="172" rx="100" ry="26" fill="#E6DED2"/><ellipse cx="${CX}" cy="166" rx="100" ry="26" fill="#FBF9F6"/>
    <ellipse cx="${CX}" cy="166" rx="74" ry="18" fill="#F3EEE7"/>${inside}` },
  board: { surf: null, draw: () => `
    <rect x="64" y="160" width="232" height="34" rx="14" fill="#B98552"/>
    <rect x="64" y="150" width="232" height="34" rx="14" fill="#D6A56C"/><circle cx="280" cy="166" r="6" fill="#B98552"/>
    <path d="M80 158h170M90 170h150" stroke="#C8925A" stroke-width="2" opacity=".6"/>` },
  colander: { surf: [CX, 128, 60, 13], draw: (inside) => `
    <path d="M110 128c0 30 30 50 70 50s70-20 70-50z" fill="#E8EDF0"/>
    ${[...Array(14)].map((_, i) => `<circle cx="${128 + (i % 7) * 17}" cy="${148 + Math.floor(i / 7) * 14}" r="2.6" fill="#B9C3C9"/>`).join('')}
    <ellipse cx="${CX}" cy="128" rx="70" ry="16" fill="#C9D3D9"/>${inside}<ellipse cx="${CX}" cy="128" rx="70" ry="16" fill="none" stroke="#DDE4E8" stroke-width="3"/>
    <rect x="96" y="122" width="16" height="9" rx="4.5" fill="#B9C3C9"/><rect x="248" y="122" width="16" height="9" rx="4.5" fill="#B9C3C9"/>
    ${[0, 1, 2, 3].map((i) => `<path class="s-drip" style="animation-delay:${i * 0.35}s" d="M${150 + i * 20} 182c-3 5-3 8 0 9 3-1 3-4 0-9z" fill="#7FB6DA"/>`).join('')}` },
  glasses: { surf: null, draw: () => '' },
  blender: { surf: null, draw: () => '' },
  oven: { surf: null, draw: () => '' },
  fridge: { surf: null, draw: () => '' },
};

/* ---------- cenas especiais ---------- */
function blenderScene(id, f, rnd, items) {
  const F = fillOf(f);
  return `<g class="s-shake">
    <path d="M140 200h80l-6-34h-68z" fill="#2E2A27"/><rect x="146" y="176" width="68" height="10" rx="3" fill="#4A4542"/><circle cx="${CX}" cy="190" r="4" fill="#C8603F"/>
    <path d="M140 52h80l-10 116h-60z" fill="#EAF2F6" opacity=".55"/>
    <path d="M143 96h74l-7 72h-60z" fill="${F.base}"/>
    <g class="s-spin" style="transform-origin:${CX}px 132px"><path d="M${CX} 132c-14-10-26-4-30 6M${CX} 132c14 10 26 4 30-6" stroke="${F.bits[0] || '#fff'}" stroke-width="4" fill="none" opacity=".7" stroke-linecap="round"/></g>
    <path d="M140 52h80l-10 116h-60z" fill="none" stroke="#C9D6DD" stroke-width="3"/><rect x="134" y="42" width="92" height="12" rx="5" fill="#2E2A27"/>
    <path d="M150 62l-6 80" stroke="#fff" stroke-width="5" opacity=".6" stroke-linecap="round"/></g>
    ${items.slice(0, 3).map((k, i) => item(k, 262 + (i % 2) * 34, 70 + i * 46, 0.85)).join('')}`;
}

function ovenScene(id, step, f, rnd, action) {
  const temp = step.oven ? `${step.oven}°` : '';
  const hot = action !== 'preheat' || true;
  const F = fillOf(f);
  let top = surface(id, f, CX, 151, 52, 9, rnd);
  if (F.tex === 'balls') top = `<rect x="122" y="140" width="116" height="22" rx="8" fill="#3A3633"/>${[...Array(5)].map((_, i) => `<circle cx="${136 + i * 22}" cy="144" r="10" fill="${F.ball}"/><circle cx="${133 + i * 22}" cy="140" r="3" fill="#fff" opacity=".25"/>`).join('')}`;
  if (F.tex === 'chickenRaw' || F.tex === 'chickenGolden') top = `${surface(id, 'veggies', CX, 151, 52, 9, rnd)}<g transform="translate(0 -6)">${chicken(F.tex === 'chickenGolden', 150).replace('translate(180 150)', 'translate(180 150) scale(.55)')}</g>`;
  const dish = f && action !== 'preheat' ? `<g transform="translate(0 6)"><path d="M120 150v18c0 6 4 10 10 10h100c6 0 10-4 10-10v-18z" fill="#F2EBE1"/>
    <rect x="120" y="138" width="120" height="26" rx="10" fill="#FBF7F1"/>${top}</g>` : '';
  return `<rect x="66" y="22" width="228" height="190" rx="14" fill="#2E2A27"/><rect x="66" y="22" width="228" height="36" rx="14" fill="#3E3936"/>
    <rect x="78" y="32" width="64" height="18" rx="5" fill="#141210"/><text x="110" y="46" text-anchor="middle" font-family="Plus Jakarta Sans, system-ui, sans-serif" font-size="14" font-weight="800" fill="#FF9B54">${temp}</text>
    ${[0, 1, 2].map((i) => `<circle cx="${190 + i * 34}" cy="41" r="9" fill="#57514C"/><rect x="${188 + i * 34}" y="33" width="4" height="9" rx="2" fill="#B9B3AA"/>`).join('')}
    <rect x="86" y="70" width="188" height="122" rx="10" fill="#1E1B19"/>
    <rect class="${hot ? 's-glow' : ''}" x="92" y="76" width="176" height="110" rx="8" fill="url(#ID-ovenglow)"/>
    <path d="M100 86h160" stroke="#FF7A3D" stroke-width="3" stroke-linecap="round" class="s-glow"/>
    <path d="M100 178h160" stroke="#FF7A3D" stroke-width="3" stroke-linecap="round" class="s-glow"/>
    <path d="M100 170h160" stroke="#8C847C" stroke-width="2"/>${dish}
    <rect x="86" y="70" width="188" height="122" rx="10" fill="none" stroke="#57514C" stroke-width="4"/><path d="M98 84l30-6" stroke="#fff" stroke-width="5" opacity=".08" stroke-linecap="round"/>
    <rect x="120" y="198" width="120" height="7" rx="3.5" fill="#B9B3AA"/>
    ${action === 'preheat' ? `<g transform="translate(312 76)"><rect x="-7" y="-36" width="14" height="60" rx="7" fill="#fff" stroke="#E2D8CA" stroke-width="2"/><rect class="s-thermo" x="-3" y="-30" width="6" height="52" rx="3" fill="#E1503A"/><circle cy="28" r="10" fill="#E1503A"/></g>` : ''}`;
}

function fridgeScene(id, f, rnd, items = []) {
  return `<rect x="96" y="18" width="168" height="196" rx="14" fill="#EEF3F6"/><rect x="96" y="18" width="168" height="196" rx="14" fill="none" stroke="#D3DDE3" stroke-width="3"/>
    <rect x="108" y="30" width="144" height="172" rx="8" fill="#DCEAF2"/>
    <path d="M108 96h144M108 150h144" stroke="#BFD3DF" stroke-width="4"/>
    <g transform="translate(0 -6)"><path d="M132 138v10c0 4 4 6 8 6h80c4 0 8-2 8-6v-10z" fill="#F2EBE1"/><rect x="132" y="128" width="96" height="18" rx="8" fill="#FBF7F1"/>${surface(id, f, CX, 137, 42, 6, rnd)}${items[0] ? item(items[0], CX, 126, 0.6) : ''}</g>
    <g transform="translate(${CX} 64)" class="s-snow"><g stroke="#7FB6DA" stroke-width="3" stroke-linecap="round">${[0, 60, 120].map((r) => `<path d="M0-18v36M-6-12l6 6 6-6M-6 12l6-6 6 6" transform="rotate(${r})"/>`).join('')}</g></g>
    ${[0, 1, 2].map((i) => `<path class="s-steam s-cold" style="animation-delay:${i * 0.8}s" d="M${130 + i * 48} 196c-6-6 6-10 0-16s6-10 0-16" stroke="#C9E3F1" stroke-width="4" fill="none" stroke-linecap="round" opacity="0"/>`).join('')}
    <rect x="272" y="40" width="8" height="70" rx="4" fill="#C9D3D9" opacity=".5"/>`;
}

function glassesScene(id, f, rnd, action) {
  const F = fillOf(f);
  return [118, 180, 242].map((x, i) => `<g>
    <path d="M${x - 26} 92h52l-6 96c0 6-4 10-10 10h-20c-6 0-10-4-10-10z" fill="#F3F8FA" opacity=".85"/>
    <path class="${action === 'pour' ? 's-rise' : ''}" style="animation-delay:${i * 0.4}s; transform-origin:${x}px 196px" d="M${x - 23} 130h46l-4 58c0 5-3 8-8 8h-22c-5 0-8-3-8-8z" fill="${F.base}"/>
    ${action === 'serve' ? `<ellipse cx="${x}" cy="130" rx="23" ry="6" fill="#F2A52B"/>${[0, 1, 2, 3, 4].map((k) => `<circle cx="${x - 12 + k * 6}" cy="${129 + (k % 2) * 2}" r="1.6" fill="#2D2116"/>`).join('')}` : ''}
    <path d="M${x - 26} 92h52l-6 96c0 6-4 10-10 10h-20c-6 0-10-4-10-10z" fill="none" stroke="#C9D6DD" stroke-width="2.5"/>
    <path d="M${x - 18} 102l3 70" stroke="#fff" stroke-width="4" opacity=".7" stroke-linecap="round"/></g>`).join('');
}

/* ---------- ações sobre o utensílio ---------- */
function overlay(id, sc, step, rnd, surf, items) {
  const a = sc.a;
  const [sx, sy, srx, sry] = surf || [CX, 150, 70, 15];
  const it = items;
  switch (a) {
    case 'chop': {
      const main = it[0] || 'onion';
      const pieces = [...Array(8)].map((_, i) => `<g transform="translate(${196 + (i % 4) * 16} ${158 + Math.floor(i / 4) * 12})"><g transform="scale(.28)">${foodIconInner(main)}</g></g>`).join('');
      return `${item(main, 128, 140, 1.25)}${pieces}${it[1] ? item(it[1], 300, 96, 0.8, 's-float') : ''}${it[2] ? item(it[2], 60, 96, 0.8, 's-float', 'animation-delay:.6s') : ''}${knife(150, 136)}`;
    }
    case 'add':
    case 'sprinkle':
    case 'sift': {
      const drops = it.slice(0, 3).map((k, i) => item(k, sx - 40 + i * 40, sy - 70, 0.8, 's-drop', `animation-delay:${i * 0.5}s`)).join('');
      if (a === 'add') return `${drops}${arrowDown(sx + 92, sy - 64)}`;
      const shakerKey = it[0] || 'salt';
      const tool = a === 'sift'
        ? `<g transform="translate(${sx} ${sy - 74})"><g class="s-sieve"><ellipse rx="44" ry="11" fill="#C9D3D9"/><ellipse rx="40" ry="9" fill="url(#ID-mesh)"/><rect x="40" y="-4" width="56" height="8" rx="4" fill="#2E2A27"/></g></g>`
        : item(shakerKey, sx + 24, sy - 80, 1, 's-shake-tilt');
      const color = a === 'sift' ? '#F7F4EE' : ({ grated: '#F3D46F', cheese: '#F3D46F', herbs: '#5E9B4C', bakingPowder: '#FFFFFF', tapiocaBag: '#FFFFFF', sprinkles: '#3A1F12' }[iconKey(shakerKey)] || '#F3D46F');
      const parts = [...Array(14)].map((_, i) => `<circle class="s-fall" style="animation-delay:${((i * 0.13) % 1.2).toFixed(2)}s" cx="${sx - 26 + (i * 4) % 52}" cy="${sy - 54}" r="${a === 'sift' ? 1.8 : 2.4}" fill="${color}"/>`).join('');
      return `${parts}${tool}`;
    }
    case 'pour': {
      const src = it[0] || 'water';
      const k = iconKey(src);
      const liquid = { sauce: '#C9432C', milk: '#F7F3EA', cream: '#F8F3E8', condensed: '#F3E7C9', coconutMilk: '#F7F3EA', dende: '#E2621E', water: '#9CCBE6', batter: '#EFD7A2', batterChoc: '#5A2F1E', custard: '#F2D78A', caramel: '#C2741C', mousse: '#F5E29A', beans: '#2E1F1C', beansLight: '#8E6A4B', oliveOil: '#C9B33A' }[k] || fillOf(sc.f).base;
      const top = Math.max(sy - 92, 44);
      return `<path class="s-stream" d="M${sx + 50} ${top + 18}C${sx + 30} ${top + 34} ${sx + 12} ${sy - 30} ${sx + 6} ${sy - 2}" stroke="${liquid}" stroke-width="9" fill="none" stroke-linecap="round" stroke-dasharray="14 8"/>
        <g transform="translate(${sx + 70} ${top})"><g class="s-tilt"><g transform="rotate(-55) scale(1.35)">${foodIconInner(src)}</g></g></g>
        ${it[1] ? item(it[1], 300, 70, 0.8, 's-float') : ''}<ellipse class="s-ripple" cx="${sx + 6}" cy="${sy}" rx="18" ry="5" fill="none" stroke="#fff" stroke-width="2"/>`;
    }
    case 'stir':
    case 'mix':
      return `${swirl(sx, sy, srx * 0.55, sry * 0.55)}${woodSpoon(sx + 10, sy + 2, -18)}${it.slice(0, 2).map((k, i) => item(k, 302 - i * 244, 72, 0.75, 's-float', `animation-delay:${i * 0.6}s`)).join('')}`;
    case 'whisk':
      return `${swirl(sx, sy, srx * 0.55, sry * 0.55)}${whisk(sx + 6, sy + 2)}${it.slice(0, 2).map((k, i) => item(k, 302 - i * 244, 74, 0.8, 's-float', `animation-delay:${i * 0.6}s`)).join('')}`;
    case 'boil':
      return `${surf ? bubbles(sx, sy, srx * 0.7) : ''}${steam(sx, sy - 24, 3, 70)}${it.slice(0, 2).map((k, i) => item(k, sx - 22 + i * 44, sy - 6, 0.6, 's-bob', `animation-delay:${i * 0.5}s`)).join('')}`;
    case 'fry':
      return `${[...Array(7)].map((_, i) => `<circle class="s-pop" style="animation-delay:${(i * 0.23).toFixed(2)}s" cx="${sx - 50 + i * 16}" cy="${sy - 6}" r="2.4" fill="#F7D774"/>`).join('')}${steam(sx, sy - 20, 2, 60)}${woodSpoon(sx + 18, sy + 2, -24)}`;
    case 'heat':
      return `${steam(sx, sy - 18, 2, 50)}<g transform="translate(${sx + 96} ${sy - 74})">${heatBadge()}</g>`;
    case 'mash':
      return `<g transform="translate(${sx} ${sy})"><g class="s-mash"><rect x="-4" y="-110" width="8" height="80" rx="4" fill="#C9965F"/><path d="M-30 -30h60v6h-60z" fill="#B9B3AA"/>${[-20, -8, 4, 16].map((x) => `<rect x="${x}" y="-30" width="4" height="22" rx="2" fill="#B9B3AA"/>`).join('')}<rect x="-30" y="-10" width="60" height="6" rx="3" fill="#B9B3AA"/></g></g>`;
    case 'layer':
      return `${it.slice(0, 3).map((k, i) => item(k, sx - 60 + i * 60, sy - 66, 0.85, 's-drop', `animation-delay:${i * 0.6}s`)).join('')}`;
    case 'spread':
      return spatula(sx + 6, sy + 4);
    case 'shred':
      return `<g transform="translate(${sx} ${sy - 4})"><g class="s-shred-l">${forkTool(-14, -6, -25)}</g><g class="s-shred-r">${forkTool(14, -6, 25)}</g></g>`;
    case 'roll':
      if (sc.v === 'bowl') return `${[0, 1].map((i) => `<g transform="translate(${sx - 20 + i * 36} ${sy - 4})"><g class="s-roll"><circle r="13" fill="#3B1D10"/><circle cx="-4" cy="-4" r="3" fill="#fff" opacity=".15"/>${[...Array(8)].map((_, k) => `<rect x="${-9 + (k * 5) % 18}" y="${-8 + (k * 7) % 16}" width="4" height="1.5" fill="#26110A"/>`).join('')}</g></g>`).join('')}`;
      return `<g transform="translate(${CX} 150)"><ellipse cx="-30" cy="0" rx="58" ry="14" fill="#F2D79E"/><ellipse cx="-50" cy="-2" rx="22" ry="7" fill="#8C4A35"/>
        <g class="s-roll" style="transform-origin:42px -6px"><rect x="30" y="-20" width="26" height="28" rx="13" fill="#EFD3A2"/><path d="M36 -12a8 8 0 1 0 14 0" stroke="#D9B26B" stroke-width="2" fill="none"/></g>
        <path class="s-nudge-x" d="M-10 -32c20-12 40-10 52 4" stroke="#C8603F" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M36 -34l6 6-8 2" stroke="#C8603F" stroke-width="3" fill="none" stroke-linecap="round"/></g>`;
    case 'shape': {
      const F = fillOf(sc.f);
      const balls = [...Array(8)].map((_, i) => `<circle class="s-appear" style="animation-delay:${i * 0.35}s" cx="${104 + (i % 4) * 30}" cy="${156 + Math.floor(i / 4) * 18}" r="10" fill="${F.ball || '#F2E7D0'}"/>`).join('');
      return `${balls}<g transform="translate(262 140)"><g class="s-roll"><circle r="18" fill="${F.ball || '#F2E7D0'}"/><circle cx="-6" cy="-6" r="5" fill="#fff" opacity=".2"/></g></g>
        <path d="M232 112a34 30 0 1 1 60 6" stroke="#C8603F" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="6 6" class="s-dash"/>`;
    }
    case 'fold':
      return `<g transform="translate(${sx} ${sy})"><g class="s-fold"><path d="M-62 0a62 13 0 0 0 124 0z" fill="${fillOf(sc.f).base === '#F4F1EA' ? '#FBF8F2' : '#F8DE7A'}" stroke="#E8B93A" stroke-width="1.5"/></g></g>${spatula(sx - 40, sy + 2, 's-flip')}`;
    case 'marinate':
      return `${it.slice(0, 2).map((k, i) => item(k, sx - 20 + i * 40, sy - 4, 0.7)).join('')}<g transform="translate(${sx + 104} ${sy - 74})">${clock(0, 0)}</g>`;
    case 'rest':
      return `${steam(sx, sy - 22, 3, 60)}<g transform="translate(${sx + 104} ${sy - 84})">${clock(0, 0)}</g>`;
    case 'serve':
      return `${[...Array(5)].map((_, i) => `<path class="s-twinkle" style="animation-delay:${i * 0.4}s" d="M${90 + i * 46} ${70 + (i % 2) * 22}l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#F2B84B"/>`).join('')}`;
    case 'unmold':
      return `<g transform="translate(${CX} 120)"><g class="s-flipover"><path d="M-56 -16v28c0 6 24 10 56 10s56-4 56-10v-28z" fill="url(#ID-steel)"/><ellipse cy="-16" rx="56" ry="12" fill="#C9CED3"/></g></g>
        <path d="M268 74a40 40 0 0 1 0 60" stroke="#C8603F" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M262 130l6 6 6-8" stroke="#C8603F" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    case 'drain':
      return steam(sx, sy - 22, 3, 70);
    default:
      return '';
  }
}

const forkTool = (x, y, r) => `<g transform="translate(${x} ${y}) rotate(${r})"><rect x="-2.5" y="-84" width="5" height="56" rx="2.5" fill="#B9B3AA"/><path d="M-8-30h16v10c0 5-3 8-8 8s-8-3-8-8z" fill="#B9B3AA"/>${[-7, -2.5, 2].map((dx) => `<rect x="${dx}" y="-12" width="3" height="16" rx="1.5" fill="#B9B3AA"/>`).join('')}</g>`;

const heatBadge = () => `<circle r="22" fill="#FFF3E6"/><path class="s-flame" d="M0 12c-9-4-10-14-3-22 1 6 4 8 6 8 2-4 1-8 0-12 8 6 11 16 7 22-2 3-6 4-10 4z" fill="#F08A2C"/>`;

function plateFood(id, f, rnd) {
  const F = fillOf(f);
  if (F.tex === 'balls') {
    return [...Array(7)].map((_, i) => `<circle cx="${132 + (i % 4) * 30 + (i > 3 ? 15 : 0)}" cy="${160 - (i > 3 ? 12 : 0)}" r="13" fill="${F.ball}"/><circle cx="${128 + (i % 4) * 30 + (i > 3 ? 15 : 0)}" cy="${155 - (i > 3 ? 12 : 0)}" r="4" fill="#fff" opacity=".2"/>`).join('');
  }
  if (F.tex === 'flan') {
    return `<path d="M128 166v-26c0-10 24-16 52-16s52 6 52 16v26z" fill="#F2D18C"/><ellipse cx="${CX}" cy="140" rx="52" ry="13" fill="#C9781F"/><ellipse cx="${CX}" cy="140" rx="13" ry="4" fill="#F6F1EA"/>
      <path d="M140 146c0 10 2 16 4 20M218 146c0 8-2 14-4 20" stroke="#C9781F" stroke-width="5" stroke-linecap="round"/><ellipse cx="${CX}" cy="168" rx="70" ry="10" fill="#C9781F" opacity=".5"/>`;
  }
  if (F.tex === 'chickenGolden' || F.tex === 'chickenRaw') return chicken(F.tex === 'chickenGolden', 150);
  if (F.tex === 'dome') return `<path d="M120 166v-30c0-10 26-18 60-18s60 8 60 18v30z" fill="#4A2618"/><ellipse cx="${CX}" cy="136" rx="60" ry="15" fill="#5E3220"/><path d="M124 140c4 14 0 20 4 24M232 140c-4 12 0 18-4 24" stroke="#3A1C11" stroke-width="5" stroke-linecap="round"/>`;
  return `<path d="M120 164c4-26 30-38 60-38s56 12 60 38z" fill="${F.base}"/>${surface(id, f, CX, 150, 56, 18, rnd)}`;
}

const chicken = (golden, y) => `<g transform="translate(${CX} ${y})">
  <ellipse cx="-44" cy="8" rx="20" ry="12" fill="${golden ? '#C8742E' : '#EFC4AB'}" transform="rotate(-20 -44 8)"/><ellipse cx="44" cy="8" rx="20" ry="12" fill="${golden ? '#C8742E' : '#EFC4AB'}" transform="rotate(20 44 8)"/>
  <circle cx="-60" cy="14" r="6" fill="#F4E6D3"/><circle cx="60" cy="14" r="6" fill="#F4E6D3"/>
  <ellipse cx="0" cy="-4" rx="52" ry="30" fill="${golden ? '#D58A3C' : '#F2CBB2'}"/><ellipse cx="-12" cy="-14" rx="22" ry="10" fill="#fff" opacity="${golden ? 0.2 : 0.3}"/>
  ${golden ? '<g fill="#2E2622" opacity=".6"><circle cx="-10" cy="-6" r="1.4"/><circle cx="14" cy="-12" r="1.4"/><circle cx="4" cy="6" r="1.4"/><circle cx="-24" cy="2" r="1.4"/></g>' : ''}</g>`;

/** Gera a cena da etapa. */
export function stepScene(step, recipe) {
  const sc = step.scene || { v: 'board', a: 'chop', it: [] };
  const id = `s${(uidN++).toString(36)}`;
  const rnd = seeded(`${recipe?.id}-${step.title}`);
  const items = (sc.it || []).filter(Boolean);
  const V = VESSELS[sc.v] || VESSELS.pot;
  let body = '';

  if (sc.v === 'oven') body = ovenScene(id, step, sc.f, rnd, sc.a);
  else if (sc.v === 'fridge') body = fridgeScene(id, sc.f, rnd, items);
  else if (sc.v === 'blender') body = blenderScene(id, sc.f, rnd, items);
  else if (sc.v === 'glasses') body = glassesScene(id, sc.f, rnd, sc.a) + (sc.a === 'pour' ? overlay(id, { ...sc, a: 'pour', it: items.length ? items : ['mousse'] }, step, rnd, [180, 120, 30, 6], items.length ? items : ['mousse']) : overlay(id, sc, step, rnd, [180, 120, 30, 6], items));
  else {
    const surf = V.surf;
    let inside = '';
    if (sc.v === 'plate') inside = plateFood(id, sc.f, rnd);
    else if (sc.v === 'dish' && (sc.f === 'chickenRaw' || sc.f === 'chickenGolden')) {
      inside = `${surface(id, 'veggies', ...surf, rnd)}${chicken(sc.f === 'chickenGolden', 140).replace('translate(180 140)', 'translate(180 140) scale(.8)')}`;
    } else if (sc.v === 'dish' && sc.a === 'layer' && sc.f !== 'chickenRaw') {
      inside = `<rect x="98" y="132" width="164" height="30" rx="14" fill="#EFE6D8"/>${[0, 1, 2, 3].map((i) => `<rect class="s-stack" style="animation-delay:${i * 0.6}s" x="102" y="${150 - i * 6}" width="156" height="7" rx="3.5" fill="${['#C9432C', '#F2D488', '#F0A6A0', '#F6DB8A'][i % 4]}"/>`).join('')}`;
    } else if (surf && sc.f) {
      const extra = sc.v === 'dish' && sc.a === 'spread' ? {} : {};
      inside = surface(id, sc.f, ...surf, rnd, extra);
    }
    body = (step.heat && ['pot', 'pan', 'clay', 'pressure'].includes(sc.v) ? stove(step.heat) : '') + V.draw(inside, sc.f) + overlay(id, sc, step, rnd, surf, items);
    if (sc.v === 'pressure' && sc.a === 'boil') body += steam(CX, 62, 1, 0) + items.slice(0, 3).map((k, i) => item(k, 64 + i * 36, 62, 0.65, 's-float', `animation-delay:${i * 0.5}s`)).join('');
  }

  const counter = sc.v === 'oven' || sc.v === 'fridge' ? '' : '<rect x="0" y="196" width="360" height="44" fill="#E6D6C2"/><rect x="0" y="196" width="360" height="5" fill="#D9C6AE"/>';
  return `<svg class="scene" viewBox="0 0 360 240" role="img" aria-label="Ilustração da etapa: ${step.title.replace(/"/g, '')}">
    <defs>
      <linearGradient id="${id}-steel" x1="0" x2="1"><stop offset="0" stop-color="#AEB5BB"/><stop offset=".35" stop-color="#E3E7EA"/><stop offset="1" stop-color="#9AA1A8"/></linearGradient>
      <radialGradient id="${id}-ovenglow" cx=".5" cy=".5" r=".7"><stop offset="0" stop-color="#FF9A4A" stop-opacity=".55"/><stop offset="1" stop-color="#3A1A0A" stop-opacity=".2"/></radialGradient>
      <pattern id="${id}-mesh" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M0 0h5v5" fill="none" stroke="#9AA6AE" stroke-width="1"/></pattern>
      <pattern id="${id}-tile" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0v40" fill="none" stroke="#EADCCB" stroke-width="1.5"/></pattern>
    </defs>
    <rect width="360" height="240" fill="#FBF3EA"/><rect width="360" height="196" fill="url(#${id}-tile)"/>${counter}
    ${body.replaceAll('ID-', `${id}-`)}
  </svg>`;
}
