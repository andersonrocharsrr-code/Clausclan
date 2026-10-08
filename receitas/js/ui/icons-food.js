/*
 * Ícones de ingredientes, desenhados em SVG num quadro de -24 a 24.
 * Mesma linguagem visual em listas, lista de compras e cenas das etapas.
 */
import { INGREDIENTS } from '../data/ingredients.js';

const hl = (x, y, rx, ry, r = 0) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${r} ${x} ${y})" fill="#fff" opacity=".35"/>`;
const bottle = (body, cap, label, lbl2 = '#fff') => `
  <rect x="-7" y="-20" width="6" height="7" rx="1.5" fill="${cap}" transform="translate(4 0)"/>
  <path d="M-3 -13h6l3 6v24a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3v-24z" fill="${body}" transform="translate(0 0)"/>
  <rect x="-6" y="-1" width="12" height="9" rx="1.5" fill="${label}"/><rect x="-4" y="2" width="8" height="1.6" rx=".8" fill="${lbl2}" opacity=".8"/>
  ${hl(-3.5, -4, 1.2, 6)}`;
const shaker = (c) => `
  <path d="M-9 -8h18v22a5 5 0 0 1-5 5h-8a5 5 0 0 1-5-5z" fill="${c}"/>
  <path d="M-10 -14h20v6h-20z" fill="#D9D4CC"/><path d="M-10 -14h20v2h-20z" fill="#C7C1B8"/>
  <circle cx="-4" cy="-11" r="1" fill="#8F877C"/><circle cx="0" cy="-11" r="1" fill="#8F877C"/><circle cx="4" cy="-11" r="1" fill="#8F877C"/>
  ${hl(-5, 3, 1.5, 7)}`;
const can = (c, band, txt = '#fff') => `
  <rect x="-12" y="-14" width="24" height="30" rx="3" fill="${c}"/>
  <ellipse cx="0" cy="-14" rx="12" ry="3" fill="#D7D9DC"/><ellipse cx="0" cy="-14" rx="9" ry="2" fill="#BFC3C8"/>
  <rect x="-12" y="-4" width="24" height="10" fill="${band}"/><rect x="-7" y="0" width="14" height="2" rx="1" fill="${txt}" opacity=".9"/>
  <ellipse cx="0" cy="16" rx="12" ry="3" fill="${c}"/>${hl(-7, 2, 1.6, 10)}`;
const bowlOf = (fill, bits = '') => `
  <path d="M-19 -2h38a19 17 0 0 1-38 0z" fill="#F2EDE6"/><path d="M-19 -2h38a19 17 0 0 1-38 0z" fill="none" stroke="#DDD4C8" stroke-width="1.5"/>
  <ellipse cx="0" cy="-3" rx="17" ry="7" fill="${fill}"/>${bits}
  <path d="M-12 8a16 14 0 0 0 24 0" fill="none" stroke="#fff" stroke-width="2" opacity=".5"/>`;
const dots = (n, color, rx, ry, area, r = 1.6, seed = 3) => {
  let s = seed, out = '';
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < n; i++) {
    const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd());
    out += `<ellipse cx="${(Math.cos(a) * d * rx + area[0]).toFixed(1)}" cy="${(Math.sin(a) * d * ry + area[1]).toFixed(1)}" rx="${r}" ry="${r * 0.8}" fill="${color}"/>`;
  }
  return out;
};
const leaf = (x, y, r, c = '#5E9B4C', s = 1) => `<path d="M0 0c4-6 12-6 16 0-4 6-12 6-16 0z" fill="${c}" transform="translate(${x} ${y}) rotate(${r}) scale(${s})"/>`;

export const FOOD_ICONS = {
  onion: `<path d="M0-21c2 4 2 6 1 8 9 2 15 9 15 17 0 9-7 15-16 15S-16 13-16 4c0-8 6-15 15-17-1-2-1-4 1-8z" fill="#E8C38A"/>
    <path d="M-6-9c-4 6-4 18 2 26M6-9c4 6 4 18-2 26M0-12v31" stroke="#C99558" stroke-width="1.4" fill="none" opacity=".7"/>${hl(-8, 0, 2.5, 7, 20)}
    <path d="M-3 19c1 2 5 2 6 0" stroke="#A97B46" stroke-width="1.5" fill="none"/>`,
  redOnion: `<path d="M0-21c2 4 2 6 1 8 9 2 15 9 15 17 0 9-7 15-16 15S-16 13-16 4c0-8 6-15 15-17-1-2-1-4 1-8z" fill="#9B4A7C"/>
    <path d="M-6-9c-4 6-4 18 2 26M6-9c4 6 4 18-2 26M0-12v31" stroke="#6E2E59" stroke-width="1.4" fill="none" opacity=".6"/>${hl(-8, 0, 2.5, 7, 20)}`,
  garlic: `<path d="M0-20c1 5 3 7 3 9 9 3 14 10 14 17 0 9-8 13-17 13S-17 15-17 6c0-7 5-14 14-17 0-2 2-4 3-9z" fill="#F6F0E6"/>
    <path d="M-5-9c-5 6-5 17 0 24M5-9c5 6 5 17 0 24M0-10v25" stroke="#D8CBB6" stroke-width="1.5" fill="none"/>
    <path d="M-1-20h3l-1 4z" fill="#C8B79C"/>${hl(-9, 2, 2.5, 6, 15)}`,
  tomato: `<circle cx="0" cy="3" r="17" fill="#E1503A"/><path d="M-17 3a17 17 0 0 0 34 0" fill="#C93F2C" opacity=".35"/>
    <path d="M0-12l3 5 6-2-4 5 5 3-6 0-1 5-3-4-3 4-1-5-6 0 5-3-4-5 6 2z" fill="#5E9B4C"/><path d="M0-12v-6" stroke="#4E8240" stroke-width="2.4" stroke-linecap="round"/>${hl(-8, -3, 3, 5, 30)}`,
  meat: `<path d="M-19 10c0-12 8-22 19-22s19 10 19 22c0 4-3 6-6 6h-26c-3 0-6-2-6-6z" fill="#C55048"/>
    ${dots(26, '#9C3832', 15, 9, [0, 2], 1.8, 5)}${dots(14, '#EFC3B6', 14, 8, [0, 1], 1.3, 11)}`,
  chicken: `<path d="M-18 4c0-11 10-18 20-17 10 1 16 7 16 14 0 8-8 13-18 14s-18-3-18-11z" fill="#F2C3AC"/>
    <path d="M-12 2c6-4 14-5 22-2M-10 8c7-3 14-3 20 0" stroke="#DCA088" stroke-width="1.4" fill="none"/>${hl(-6, -4, 5, 2.5, -10)}`,
  chickenWhole: `<ellipse cx="0" cy="4" rx="16" ry="13" fill="#F1C7AE"/><ellipse cx="-14" cy="12" rx="6" ry="4" fill="#ECBDA2" transform="rotate(-30 -14 12)"/>
    <ellipse cx="14" cy="12" rx="6" ry="4" fill="#ECBDA2" transform="rotate(30 14 12)"/><circle cx="-18" cy="15" r="2.5" fill="#F7E6D8"/><circle cx="18" cy="15" r="2.5" fill="#F7E6D8"/>${hl(-5, -1, 6, 3)}`,
  egg: `<path d="M0-19c9 0 15 13 15 22S8 19 0 19-15 12-15 3-9-19 0-19z" fill="#FBF5EA"/><path d="M0-19c9 0 15 13 15 22S8 19 0 19" fill="#EDE2D0" opacity=".6"/>${hl(-6, -6, 2.5, 6, 15)}`,
  cheese: `<path d="M-19 12l4-22 24-6 10 10v18z" fill="#F4C443"/><path d="M-15-10l24-6 10 10-29 6z" fill="#F8D66D"/>
    <circle cx="-8" cy="4" r="3" fill="#DFA62A"/><circle cx="6" cy="8" r="2.2" fill="#DFA62A"/><circle cx="10" cy="-1" r="2.6" fill="#DFA62A"/>`,
  grated: `<path d="M-18 14c2-10 8-18 18-18s16 8 18 18z" fill="#F3D46F"/>
    ${[...Array(12)].map((_, i) => `<path d="M${-14 + i * 2.5} ${12 - (i % 3) * 3}q3-6 6-3" stroke="#E2B33F" stroke-width="1.6" fill="none" stroke-linecap="round"/>`).join('')}`,
  coalho: `<path d="M-18 6h36" stroke="#B38653" stroke-width="2.5" stroke-linecap="round"/><rect x="-14" y="-3" width="12" height="12" rx="2.5" fill="#F3E2B4"/>
    <rect x="2" y="-3" width="12" height="12" rx="2.5" fill="#F3E2B4"/><path d="M-14 6h12M2 6h12" stroke="#D9A44D" stroke-width="3" opacity=".7"/>`,
  milk: `<path d="M-11-10l5-9h12l5 9z" fill="#5D8FCB"/><rect x="-11" y="-10" width="22" height="30" rx="2" fill="#F8F7F3"/>
    <rect x="-11" y="2" width="22" height="9" fill="#5D8FCB"/><rect x="-6" y="5" width="12" height="2" rx="1" fill="#fff"/>${hl(-7, -2, 1.5, 7)}`,
  cream: `<rect x="-15" y="-9" width="30" height="20" rx="3" fill="#F7F2E9"/><rect x="-15" y="-9" width="30" height="6" rx="3" fill="#D9534F"/>
    <rect x="-9" y="2" width="18" height="2" rx="1" fill="#C9BFAE"/>${hl(-10, 3, 1.5, 4)}`,
  requeijao: `<path d="M-13-6h26l-2 22a3 3 0 0 1-3 3h-16a3 3 0 0 1-3-3z" fill="#EFF3F6"/><rect x="-14" y="-12" width="28" height="7" rx="2.5" fill="#3D7CC4"/>
    <rect x="-8" y="3" width="16" height="7" rx="2" fill="#3D7CC4" opacity=".85"/>${hl(-8, 3, 1.5, 7)}`,
  condensed: can('#F4F1EA', '#2F5E9E'),
  butter: `<path d="M-19 4l8-10h28l-6 10z" fill="#F7DB7C"/><path d="M-19 4h30v9h-30z" fill="#F1CB57"/><path d="M11 4l6-10v9l-6 10z" fill="#E4B940"/>
    <path d="M-22 13h44" stroke="#DCD3C4" stroke-width="3" stroke-linecap="round"/>`,
  flour: `<path d="M-14-12c4 3 24 3 28 0l3 28a4 4 0 0 1-4 4h-26a4 4 0 0 1-4-4z" fill="#F1E8D8"/><path d="M-12-16c6 4 18 4 24 0l2 4c-6 3-22 3-28 0z" fill="#DCCDB4"/>
    <ellipse cx="0" cy="5" rx="8" ry="6" fill="#E6D3A9"/><path d="M-4 5h8M0 1v8" stroke="#C9A96B" stroke-width="1.5"/>`,
  sugar: bowlOf('#FFFFFF', `${dots(12, '#E9E4DA', 13, 5, [0, -3], 1.1, 4)}<path d="M-10-4q10-9 20 0" fill="#fff"/>`),
  cocoa: `<rect x="-12" y="-16" width="24" height="34" rx="2.5" fill="#6D3B23"/><rect x="-12" y="-16" width="24" height="8" fill="#8A4E2F"/>
    <circle cx="0" cy="5" r="6" fill="#C98A5A"/><rect x="-7" y="13" width="14" height="2" rx="1" fill="#E9C7A5"/>${hl(-8, 0, 1.4, 8)}`,
  pastaSheet: `<path d="M-18-10q3-3 6 0t6 0 6 0 6 0 6 0 6 0v20q-3 3-6 0t-6 0-6 0-6 0-6 0-6 0z" fill="#F2D488"/>
    <path d="M-14-4h28M-14 4h28" stroke="#E0BA62" stroke-width="1.2" opacity=".7"/>`,
  spaghetti: `${[...Array(9)].map((_, i) => `<path d="M${-8 + i * 2} -19l${(i - 4) * 1.2} 38" stroke="${i % 2 ? '#EBC867' : '#F3D682'}" stroke-width="2" stroke-linecap="round"/>`).join('')}
    <rect x="-11" y="-2" width="22" height="6" rx="2" fill="#C8553D"/>`,
  rice: bowlOf('#FFFFFF', `${dots(22, '#EEE9DF', 14, 5, [0, -3], 1.2, 2)}`),
  beans: bowlOf('#3B2A2A', `${dots(20, '#5B4141', 14, 5, [0, -3], 1.7, 6)}`),
  beansLight: bowlOf('#B79170', `${dots(20, '#D8B898', 14, 5, [0, -3], 1.7, 6)}`),
  chickpea: `${[[-8, 4], [6, 6], [-1, -5], [10, -4], [-11, -6]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#E8C98D"/><path d="M${x - 3} ${y - 3}q3 3 0 7" stroke="#C9A35F" stroke-width="1.2" fill="none"/>`).join('')}`,
  potato: `<ellipse cx="0" cy="2" rx="18" ry="13" fill="#C99A5B" transform="rotate(-12)"/><ellipse cx="-2" cy="-1" rx="15" ry="9" fill="#D8AE73" transform="rotate(-12)"/>
    <circle cx="-7" cy="-2" r="1.3" fill="#9E7240"/><circle cx="6" cy="4" r="1.3" fill="#9E7240"/><circle cx="8" cy="-5" r="1.1" fill="#9E7240"/>`,
  cassava: `<path d="M-20 6c6-10 26-18 36-16 4 1 5 6 2 9-8 8-26 14-36 11-3-1-4-2-2-4z" fill="#8B5A35"/>
    <ellipse cx="16" cy="-5" rx="4" ry="5.5" fill="#F4EEDD" transform="rotate(-25 16 -5)"/><path d="M-10 6l4-3M0 2l4-3" stroke="#6E4428" stroke-width="1.3"/>`,
  carrot: `<path d="M-4-12l8 0c3 0 4 3 3 6l-6 26c-1 3-3 3-4 0l-5-26c-1-3 1-6 4-6z" fill="#EE8434"/>
    <path d="M-5-4h6M-3 4h5M-2 11h4" stroke="#D16A22" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M0-12c-4-6-8-7-10-6M0-12c0-6 1-9 3-10M0-12c4-5 8-6 10-4" stroke="#5E9B4C" stroke-width="2.4" stroke-linecap="round" fill="none"/>`,
  zucchini: `<path d="M-20 10c4-8 26-22 36-20 4 1 4 5 1 8-8 8-26 17-35 16-3-1-3-2-2-4z" fill="#5C8E3E"/>
    <path d="M-14 8c8-4 18-11 26-15" stroke="#86B565" stroke-width="2" opacity=".7"/><rect x="14" y="-14" width="5" height="5" rx="1.5" fill="#6E8B3D" transform="rotate(30 16 -11)"/>`,
  greenBeans: `${[-8, 0, 8].map((x, i) => `<path d="M${x - 6} 16c2-12 6-26 10-32" stroke="${i % 2 ? '#6FA24A' : '#5C9440'}" stroke-width="5" stroke-linecap="round" fill="none"/>`).join('')}`,
  pepper: `<path d="M-15-4c0-8 6-11 15-11s15 3 15 11c0 14-6 22-15 22S-15 10-15-4z" fill="#D7402F"/>
    <path d="M0-15c0 8 0 24 0 32" stroke="#B5301F" stroke-width="1.5" opacity=".6"/><path d="M0-15c0-4 2-6 5-7" stroke="#4E8240" stroke-width="3" stroke-linecap="round" fill="none"/>${hl(-8, -3, 2.5, 6)}`,
  herbs: `<path d="M0 20V-2M0 20l-8-16M0 20l8-15" stroke="#4E8240" stroke-width="1.6" fill="none"/>
    ${leaf(-1, -2, -100, '#5E9B4C', 0.9)}${leaf(-8, 4, -130, '#6FAF59', 0.8)}${leaf(8, 5, -50, '#6FAF59', 0.8)}${leaf(-3, -10, -80, '#7BBB63', 0.7)}${leaf(3, -6, -60, '#5E9B4C', 0.7)}`,
  chives: `${[-6, -2, 2, 6].map((x, i) => `<path d="M${x} 20c0-14 ${i - 2} -28 ${(i - 1.5) * 3} -38" stroke="#5E9B4C" stroke-width="2.4" stroke-linecap="round" fill="none"/>`).join('')}`,
  basil: `${leaf(-14, 6, -40, '#4C8C3C', 1.2)}${leaf(0, 4, -100, '#5EA048', 1.3)}${leaf(2, 8, -10, '#4C8C3C', 1.1)}`,
  rosemary: `<path d="M-14 18L14-18" stroke="#6B5B3C" stroke-width="1.6"/>${[...Array(8)].map((_, i) => `<path d="M${-12 + i * 3.4} ${15 - i * 4.4}l-6-3M${-12 + i * 3.4} ${15 - i * 4.4}l5 4" stroke="#4E7A50" stroke-width="2.2" stroke-linecap="round"/>`).join('')}`,
  kale: `<path d="M0 20C-16 14-20-6-8-18c4 2 6 0 8-2 2 2 4 4 8 2 12 12 8 32-8 38z" fill="#3E7B3A"/><path d="M0 20V-16M0 0l-8-6M0 8l8-6M0-8l6-5" stroke="#8EBF77" stroke-width="1.5" fill="none"/>`,
  orange: `<circle cx="0" cy="3" r="17" fill="#F29A2E"/>${dots(14, '#E0841A', 13, 13, [0, 3], 0.9, 8)}${hl(-7, -3, 3, 5, 30)}${leaf(1, -13, -60, '#5E9B4C', 0.7)}`,
  lemon: `<ellipse cx="0" cy="2" rx="17" ry="13" fill="#86B342"/><path d="M15 -2l5-2-2 5z" fill="#6E9935"/>${hl(-6, -3, 4, 2.5, -15)}`,
  cucumber: `<path d="M-20 8c4-8 26-20 36-18 4 1 4 5 1 8-8 8-26 16-35 15-3-1-3-3-2-5z" fill="#3F7A3A"/>${dots(10, '#A5CC86', 14, 4, [-2, 0], 0.8, 9)}`,
  mushroom: `<path d="M-18 0c0-10 8-16 18-16s18 6 18 16z" fill="#C8A27C"/><path d="M-18 0h36c0 3-2 4-5 4h-26c-3 0-5-1-5-4z" fill="#EBDDC8"/>
    <path d="M-6 4h12l2 14h-16z" fill="#F2E8DA"/>${hl(-7, -8, 4, 2, -20)}`,
  passionfruit: `<circle cx="0" cy="2" r="17" fill="#E8C13A"/><circle cx="0" cy="2" r="12" fill="#F2A72E"/>${dots(14, '#2D2116', 9, 9, [0, 2], 1.3, 3)}
    <circle cx="0" cy="2" r="12" fill="none" stroke="#F9E9B8" stroke-width="2"/>`,
  bacon: `<path d="M-18-8q6-5 12 0t12 0 12 0v8q-6-5-12 0t-12 0-12 0z" fill="#D46A5C"/><path d="M-18 0q6-5 12 0t12 0 12 0v4q-6-5-12 0t-12 0-12 0z" fill="#F4D6CB"/>
    <path d="M-18 4q6-5 12 0t12 0 12 0v8q-6-5-12 0t-12 0-12 0z" fill="#C6584A"/>`,
  ham: `<circle cx="0" cy="2" r="17" fill="#F0A6A0"/><circle cx="0" cy="2" r="17" fill="none" stroke="#F7D5CF" stroke-width="3"/><path d="M-6-4c4 2 8 6 8 12" stroke="#E58C86" stroke-width="2" fill="none"/>`,
  sausage: `<path d="M-18 6c2-14 18-22 32-14" stroke="#A9432E" stroke-width="11" stroke-linecap="round" fill="none"/>
    <ellipse cx="-2" cy="14" rx="7" ry="5" fill="#D9846D"/>${dots(6, '#F3C9B9', 5, 3, [-2, 14], 0.9, 4)}<ellipse cx="11" cy="15" rx="6" ry="4.5" fill="#D9846D"/>`,
  dryMeat: `<path d="M-17 8l-2-12c6-6 22-8 34-2l3 12c-10 8-26 9-35 2z" fill="#8E2E2A"/>${dots(10, '#F7F1EA', 14, 6, [0, 2], 1, 2)}<path d="M-12-2c8-3 16-3 24 0" stroke="#B5524A" stroke-width="2"/>`,
  ribs: `<path d="M-18-10h36v22h-36z" rx="4" fill="#C9614F"/>${[-11, -3, 5, 13].map((x) => `<rect x="${x - 2}" y="-14" width="4" height="30" rx="2" fill="#F5E8DA"/>`).join('')}`,
  fish: `<path d="M-20 4c4-10 16-14 28-12 6 1 10 4 12 8-2 4-6 8-12 9-12 2-24-1-28-5z" fill="#F4E2D6"/>
    <path d="M-12-2c2 3 2 7 0 10M-4-5c2 4 2 10 0 14M4-6c2 4 2 11 0 15" stroke="#E2C2B0" stroke-width="1.4" fill="none"/>${hl(-2, -5, 8, 1.5)}`,
  sauce: `<rect x="-12" y="-14" width="24" height="32" rx="3" fill="#D5412F"/><rect x="-12" y="-2" width="24" height="10" fill="#F5E5CF"/>
    <circle cx="0" cy="3" r="3.5" fill="#D5412F"/><rect x="-6" y="-19" width="12" height="6" rx="1.5" fill="#3E7B3A"/>${hl(-7, -7, 1.5, 5)}`,
  corn: can('#F5D04A', '#3E7B3A'),
  peas: can('#7DB458', '#2F6A30'),
  tapiocaBag: `<path d="M-14-14h28l2 32h-32z" fill="#F7F4EE"/><path d="M-14-14h28v6h-28z" fill="#E28B3C"/><ellipse cx="0" cy="5" rx="7" ry="5" fill="#EDE6D9"/>`,
  sprinkles: `<path d="M-18 14c2-10 8-18 18-18s16 8 18 18z" fill="#5B3420"/>${[...Array(16)].map((_, i) => `<rect x="${-13 + (i * 7) % 26}" y="${-1 + ((i * 5) % 12)}" width="3.5" height="1.4" rx=".7" fill="#3A1F12" transform="rotate(${i * 37} ${-13 + (i * 7) % 26} ${-1 + ((i * 5) % 12)})"/>`).join('')}`,
  bakingPowder: can('#F2EFE8', '#C8443A'),
  coconutMilk: bottle('#F7F3EA', '#6B4B2E', '#7A5536'),
  chips: `<path d="M-14-16h28l2 34h-32z" fill="#F2C230"/><path d="M-14-16h28v5h-28z" fill="#D44A2C"/>
    ${[...Array(7)].map((_, i) => `<path d="M${-8 + i * 2.6} ${10 - (i % 2) * 3}l${(i % 3) - 1} -10" stroke="#C88A12" stroke-width="1.6" stroke-linecap="round"/>`).join('')}`,
  ketchup: `<path d="M-9-10h18l2 26a4 4 0 0 1-4 4h-14a4 4 0 0 1-4-4z" fill="#D2382A"/><path d="M-4-18h8l3 8h-14z" fill="#F4F0E8"/>${hl(-5, 2, 1.5, 7)}`,
  mustard: `<path d="M-9-10h18l2 26a4 4 0 0 1-4 4h-14a4 4 0 0 1-4-4z" fill="#EAB928"/><path d="M-4-18h8l3 8h-14z" fill="#C9431F"/>${hl(-5, 2, 1.5, 7)}`,
  oliveOil: bottle('#9FA43A', '#3E4E25', '#F3EAD3', '#6B7A35'),
  dende: bottle('#E2621E', '#7B3517', '#F6E2C4', '#B5431A'),
  oil: bottle('#F2CB4B', '#D99A21', '#F7EFD8', '#D99A21'),
  bayLeaf: `${leaf(-16, 6, -25, '#6E8B3D', 1.9)}<path d="M-14 5c10-4 18-8 26-13" stroke="#A9BF79" stroke-width="1.2" fill="none"/>`,
  paprika: shaker('#C2412B'),
  oregano: shaker('#6E8B3D'),
  salt: shaker('#F4F1EB'),
  blackPepper: `<path d="M-8-6h16l-2 24h-12z" fill="#3D3631"/><path d="M-6-18h12l2 12h-16z" fill="#5A504A"/><circle cx="0" cy="-20" r="3" fill="#3D3631"/>${hl(-4, 4, 1.3, 7)}`,
  water: `<path d="M-12-16h24l-3 32a3 3 0 0 1-3 3h-12a3 3 0 0 1-3-3z" fill="#DCEEF7" opacity=".9"/><path d="M-11-4h22l-2 20a3 3 0 0 1-3 3h-12a3 3 0 0 1-3-3z" fill="#7FB6DA"/>${hl(-7, 0, 1.4, 9)}`,
  batter: bowlOf('#F1D9A3'),
  batterChoc: bowlOf('#5A3020'),
  custard: `<path d="M-12-12h22l3 4-3 2v22a3 3 0 0 1-3 3h-16a3 3 0 0 1-3-3z" fill="#EDF2F4" opacity=".9"/><path d="M-12 0h19v16a3 3 0 0 1-3 3h-13a3 3 0 0 1-3-3z" fill="#F3D98E"/>`,
  caramel: `<path d="M-16-2h32v10a8 8 0 0 1-8 8h-16a8 8 0 0 1-8-8z" fill="#8F969C"/><ellipse cx="0" cy="-2" rx="16" ry="4" fill="#C77B22"/><path d="M16 2h8" stroke="#3D3631" stroke-width="3.5" stroke-linecap="round"/>`,
  mousse: `<path d="M-12-12h22l3 4-3 2v22a3 3 0 0 1-3 3h-16a3 3 0 0 1-3-3z" fill="#EDF2F4" opacity=".9"/><path d="M-12-2h19v18a3 3 0 0 1-3 3h-13a3 3 0 0 1-3-3z" fill="#F6E39A"/>`,
};

/** Ícone de um ingrediente do catálogo (ou chave direta de FOOD_ICONS). */
export function iconKey(idOrKey) {
  return INGREDIENTS[idOrKey]?.icon || (FOOD_ICONS[idOrKey] ? idOrKey : 'flour');
}

export function foodIcon(idOrKey, size = 40, cls = 'fi') {
  const k = iconKey(idOrKey);
  return `<svg class="${cls}" viewBox="-24 -24 48 48" width="${size}" height="${size}" aria-hidden="true">${FOOD_ICONS[k]}</svg>`;
}

/** Só o conteúdo, para encaixar dentro de outro SVG. */
export const foodIconInner = (idOrKey) => FOOD_ICONS[iconKey(idOrKey)];
