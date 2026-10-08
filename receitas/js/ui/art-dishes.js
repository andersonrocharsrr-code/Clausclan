/*
 * Ilustrações dos pratos prontos, vistos de cima (flat lay), em SVG gerado.
 * Cada receita escolhe um desenho pela chave `art`. Tudo é vetorial: leve, nítido e funciona offline.
 */
import { seeded } from '../core/util.js';

let uidN = 0;

/* ---------- peças reutilizáveis ---------- */
const shadow = (id, cx, cy, rx, ry) => `<ellipse cx="${cx + 8}" cy="${cy + 12}" rx="${rx}" ry="${ry}" fill="url(#${id}sh)"/>`;

function scatter(rnd, n, cx, cy, rx, ry, draw) {
  let out = '';
  for (let i = 0; i < n; i++) {
    const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd());
    out += draw(cx + Math.cos(a) * d * rx, cy + Math.sin(a) * d * ry, i, rnd);
  }
  return out;
}
const leaf = (x, y, r, s = 1, c = '#5E9B4C', vein = '#8CC26F') =>
  `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${r.toFixed(0)}) scale(${s})"><path d="M0 0c6-8 18-8 24 0-6 8-18 8-24 0z" fill="${c}"/><path d="M2 0h20" stroke="${vein}" stroke-width="1" opacity=".8"/></g>`;
const parsley = (rnd, n, cx, cy, rx, ry) => scatter(rnd, n, cx, cy, rx, ry, (x, y, i, r) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1.4 + r() * 1.6).toFixed(1)}" fill="${i % 2 ? '#4E8C3E' : '#6BAA52'}"/>`);
const pepper = (rnd, n, cx, cy, rx, ry) => scatter(rnd, n, cx, cy, rx, ry, (x, y) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.1" fill="#2E2622" opacity=".75"/>`);

function plate(cx, cy, r, c = '#FBF9F6', rim = '#EEE6DB') {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}"/><circle cx="${cx}" cy="${cy}" r="${r - 2}" fill="none" stroke="${rim}" stroke-width="2"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.78}" fill="#F6F1EA"/><circle cx="${cx}" cy="${cy}" r="${r * 0.78}" fill="none" stroke="#EDE5D9" stroke-width="1.5"/>`;
}
function bowl(cx, cy, r, c = '#FBF9F6', inner = '#F3EDE4') {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}"/><circle cx="${cx}" cy="${cy}" r="${r - 9}" fill="${inner}"/>
    <circle cx="${cx}" cy="${cy}" r="${r - 1.5}" fill="none" stroke="#EAE1D4" stroke-width="2"/>`;
}
function dishRect(x, y, w, h, c = '#C4643F', inner = '#B4532F', rx = 26) {
  return `<rect x="${x - 16}" y="${y + h / 2 - 16}" width="${w + 32}" height="32" rx="14" fill="${c}"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${c}"/>
    <rect x="${x + 10}" y="${y + 10}" width="${w - 20}" height="${h - 20}" rx="${rx - 8}" fill="${inner}"/>`;
}
function napkin(x, y, r, c1 = '#F4EADC', c2 = '#D9C3A6') {
  return `<g transform="translate(${x} ${y}) rotate(${r})"><rect x="-55" y="-70" width="110" height="140" rx="6" fill="${c1}"/>
    ${[-40, -28, 28, 40].map((v) => `<rect x="${v}" y="-70" width="4" height="140" fill="${c2}" opacity=".7"/>`).join('')}</g>`;
}
const fork = (x, y, r, c = '#B9B3AA') => `<g transform="translate(${x} ${y}) rotate(${r})" fill="${c}"><rect x="-3" y="0" width="6" height="70" rx="3"/>
  <path d="M-9-30h18v22c0 6-4 9-9 9s-9-3-9-9z"/><rect x="-8" y="-52" width="3" height="26" rx="1.5"/><rect x="-2.5" y="-52" width="3" height="26" rx="1.5"/><rect x="3" y="-52" width="3" height="26" rx="1.5"/></g>`;
const spoon = (x, y, r, c = '#B9B3AA') => `<g transform="translate(${x} ${y}) rotate(${r})" fill="${c}"><rect x="-3" y="0" width="6" height="70" rx="3"/><ellipse cx="0" cy="-20" rx="12" ry="20"/></g>`;
const woodSpoon = (x, y, r) => `<g transform="translate(${x} ${y}) rotate(${r})"><rect x="-4" y="0" width="8" height="80" rx="4" fill="#C9965F"/><ellipse cx="0" cy="-18" rx="14" ry="20" fill="#D6A56C"/><ellipse cx="-3" cy="-22" rx="5" ry="9" fill="#E4BC88" opacity=".6"/></g>`;
const lemonSlice = (x, y, r = 16, c = '#F2C94C', pulp = '#F8DF7E') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/><circle cx="${x}" cy="${y}" r="${r - 3}" fill="${pulp}"/>
  ${[...Array(8)].map((_, i) => `<path d="M${x} ${y}L${(x + Math.cos(i * Math.PI / 4) * (r - 4)).toFixed(1)} ${(y + Math.sin(i * Math.PI / 4) * (r - 4)).toFixed(1)}" stroke="${c}" stroke-width="1.2"/>`).join('')}`;

/* ---------- desenhos dos pratos ---------- */
const ART = {
  lasanha(id, rnd) {
    const top = `url(#${id}gold)`;
    return `${napkin(330, 230, 18)}${fork(70, 210, -20)}${shadow(id, 200, 150, 150, 95)}
      ${dishRect(70, 70, 260, 165, '#F7F3EE', '#E9E0D2', 28)}
      <rect x="84" y="84" width="232" height="137" rx="18" fill="#C9472F"/>
      <rect x="88" y="86" width="224" height="131" rx="16" fill="${top}"/>
      ${scatter(rnd, 30, 200, 150, 105, 58, (x, y, i, r) => `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(4 + r() * 9).toFixed(1)}" ry="${(3 + r() * 6).toFixed(1)}" fill="${i % 3 ? '#C98A2E' : '#A4621F'}" opacity="${(0.35 + r() * 0.4).toFixed(2)}"/>`)}
      ${scatter(rnd, 10, 200, 150, 100, 55, (x, y) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="#C9472F" opacity=".55"/>`)}
      <rect x="226" y="140" width="72" height="68" rx="6" fill="#E9E0D2"/>
      <path d="M226 146h72M226 160h72M226 174h72" stroke="#D8C9B2" stroke-width="1.5" opacity=".7"/>
      <path d="M226 140h72v8c-12 6-22-2-36 4s-24 0-36-2z" fill="#C9472F" opacity=".75"/>
      ${leaf(140, 110, -30, 1.1)}${leaf(156, 104, 40, 0.9, '#4C8C3C')}${leaf(120, 182, 10, 0.8)}`;
  },

  strogonoff(id, rnd) {
    return `${napkin(70, 230, -14)}${fork(345, 160, 12)}${shadow(id, 200, 150, 122, 122)}${plate(200, 150, 122)}
      <path d="M128 112c18-30 58-32 74-6 10 16 6 54-10 70-22 22-62 14-72-12-6-16-4-38 8-52z" fill="#FFFEFB"/>
      ${scatter(rnd, 70, 152, 145, 38, 44, (x, y, i, r) => `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="3.2" ry="1.4" transform="rotate(${(r() * 180).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="#EAE4D9"/>`)}
      <path d="M196 92c34-16 86 6 92 52 4 34-20 66-56 70-30 4-50-16-48-40 2-20 0-28-6-44-4-12 4-32 18-38z" fill="url(#${id}cream)"/>
      ${scatter(rnd, 13, 238, 150, 38, 46, (x, y, i, r) => `<rect x="${(x - 9).toFixed(1)}" y="${(y - 8).toFixed(1)}" width="18" height="15" rx="5" fill="#F2D6AE" transform="rotate(${(r() * 60 - 30).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/><rect x="${(x - 7).toFixed(1)}" y="${(y - 7).toFixed(1)}" width="10" height="4" rx="2" fill="#FFF3DF" opacity=".7" transform="rotate(${(r() * 60 - 30).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`)}
      ${scatter(rnd, 6, 240, 150, 36, 40, (x, y) => `<path d="M${(x - 8).toFixed(1)} ${y.toFixed(1)}a8 7 0 0 1 16 0z" fill="#B48C6A"/><rect x="${(x - 2).toFixed(1)}" y="${y.toFixed(1)}" width="4" height="5" fill="#D9C2A6"/>`)}
      ${scatter(rnd, 45, 160, 92, 40, 12, (x, y, i, r) => `<path d="M${x.toFixed(1)} ${y.toFixed(1)}l${(r() * 10 - 5).toFixed(1)} ${(r() * 6 - 3).toFixed(1)}" stroke="${i % 2 ? '#F1C232' : '#E3A91F'}" stroke-width="2.2" stroke-linecap="round"/>`)}
      ${parsley(rnd, 12, 245, 150, 30, 40)}`;
  },

  frangoAssado(id, rnd) {
    return `${napkin(340, 70, 25, '#EFE5D7')}${shadow(id, 200, 152, 170, 105)}
      <ellipse cx="200" cy="152" rx="172" ry="112" fill="#F8F4EE"/><ellipse cx="200" cy="152" rx="150" ry="94" fill="#EFE7DC"/>
      ${scatter(rnd, 11, 200, 160, 128, 76, (x, y, i, r) => (Math.hypot((x - 200) / 70, (y - 150) / 52) < 1 ? '' : `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(14 + r() * 5).toFixed(1)}" ry="${(11 + r() * 4).toFixed(1)}" fill="url(#${id}potato)" transform="rotate(${(r() * 180).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`))}
      <ellipse cx="148" cy="196" rx="24" ry="14" fill="url(#${id}roast)" transform="rotate(30 148 196)"/><ellipse cx="252" cy="196" rx="24" ry="14" fill="url(#${id}roast)" transform="rotate(-30 252 196)"/>
      <circle cx="132" cy="206" r="7" fill="#F4E6D3"/><circle cx="268" cy="206" r="7" fill="#F4E6D3"/>
      <ellipse cx="200" cy="148" rx="66" ry="52" fill="url(#${id}roast)"/>
      <ellipse cx="136" cy="128" rx="18" ry="10" fill="url(#${id}roast)" transform="rotate(-40 136 128)"/><ellipse cx="264" cy="128" rx="18" ry="10" fill="url(#${id}roast)" transform="rotate(40 264 128)"/>
      <path d="M200 102c0 30 0 60 0 92" stroke="#8C4517" stroke-width="2" opacity=".35"/>
      <ellipse cx="180" cy="130" rx="22" ry="12" fill="#FFE2A8" opacity=".35" transform="rotate(-20 180 130)"/>
      ${pepper(rnd, 26, 200, 150, 55, 42)}
      ${lemonSlice(96, 96, 15)}${lemonSlice(306, 216, 15)}
      <g stroke="#3F6B41" stroke-width="2.2" stroke-linecap="round">${[...Array(9)].map((_, i) => `<path d="M${280 + i * 7} ${88 + i * 4}l-6-6M${280 + i * 7} ${88 + i * 4}l6-4"/>`).join('')}</g><path d="M276 84l62 36" stroke="#6B5B3C" stroke-width="1.6"/>`;
  },

  arrozForno(id, rnd) {
    return `${napkin(70, 70, -20)}${spoon(340, 190, 25)}${shadow(id, 200, 150, 150, 95)}
      ${dishRect(70, 70, 260, 165, '#2F5D62', '#264D52', 28)}
      <rect x="84" y="84" width="232" height="137" rx="18" fill="url(#${id}gold)"/>
      ${scatter(rnd, 34, 200, 152, 108, 60, (x, y, i, r) => `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(5 + r() * 9).toFixed(1)}" ry="${(3 + r() * 6).toFixed(1)}" fill="${i % 3 ? '#C98A2E' : '#A4621F'}" opacity="${(0.3 + r() * 0.45).toFixed(2)}"/>`)}
      <path d="M96 196c20-22 54-26 74-8 12 12 10 28-6 34H104c-10-4-14-14-8-26z" fill="#F9F3E6"/>
      ${scatter(rnd, 40, 132, 204, 32, 13, (x, y, i, r) => `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="3" ry="1.3" transform="rotate(${(r() * 180).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="#E6DCCB"/>`)}
      ${scatter(rnd, 9, 132, 204, 30, 11, (x, y, i) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.4" fill="${i % 2 ? '#7DB458' : '#F2C94C'}"/>`)}
      ${scatter(rnd, 5, 132, 204, 30, 11, (x, y) => `<rect x="${(x - 4).toFixed(1)}" y="${(y - 3).toFixed(1)}" width="8" height="6" rx="1.5" fill="#EFA59C"/>`)}
      ${parsley(rnd, 22, 220, 130, 85, 40)}`;
  },

  carbonara(id, rnd) {
    let strands = '';
    for (let i = 0; i < 26; i++) {
      const r1 = 22 + rnd() * 64, a = rnd() * Math.PI * 2, sweep = 1.4 + rnd() * 2.2;
      const x1 = 200 + Math.cos(a) * r1, y1 = 150 + Math.sin(a) * r1;
      const x2 = 200 + Math.cos(a + sweep) * r1, y2 = 150 + Math.sin(a + sweep) * r1;
      strands += `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)}A${r1.toFixed(1)} ${r1.toFixed(1)} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="${i % 3 ? '#F1D27C' : '#E6BD5A'}" stroke-width="5.5" fill="none" stroke-linecap="round"/>`;
    }
    return `${napkin(330, 240, 30, '#EAF0F2', '#9CB6C4')}${fork(68, 160, -15)}${shadow(id, 200, 150, 122, 122)}${plate(200, 150, 122)}
      <circle cx="200" cy="150" r="88" fill="#EDCB76"/>${strands}
      ${scatter(rnd, 16, 200, 150, 70, 70, (x, y, i, r) => `<rect x="${(x - 6).toFixed(1)}" y="${(y - 4).toFixed(1)}" width="12" height="8" rx="2.5" fill="${i % 2 ? '#B8503F' : '#CF6A55'}" transform="rotate(${(r() * 90).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`)}
      ${scatter(rnd, 14, 200, 150, 70, 70, (x, y, i, r) => `<path d="M${x.toFixed(1)} ${y.toFixed(1)}l8 2-6 5z" fill="#FFF6DA" transform="rotate(${(r() * 360).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`)}
      ${pepper(rnd, 60, 200, 150, 80, 80)}`;
  },

  panqueca(id, rnd) {
    const rolls = [0, 1, 2, 3].map((i) => {
      const y = 92 + i * 34;
      return `<rect x="92" y="${y}" width="216" height="30" rx="15" fill="#EFD3A2"/><rect x="92" y="${y + 4}" width="216" height="8" rx="4" fill="#F7E3BD" opacity=".7"/>`;
    }).join('');
    return `${napkin(335, 70, 20, '#F3E9E0', '#C8553D')}${fork(60, 200, -12)}${shadow(id, 200, 150, 150, 95)}
      ${dishRect(70, 70, 260, 165, '#F7F3EE', '#E9E0D2', 28)}${rolls}
      <path d="M150 90c30-6 70-4 100 2 10 30 8 80-4 116-30 6-66 6-96 0-8-36-10-84 0-118z" fill="#C9432C" opacity=".92"/>
      ${scatter(rnd, 14, 200, 150, 40, 52, (x, y, i, r) => `<path d="M${x.toFixed(1)} ${y.toFixed(1)}c6-4 14-4 20 2" stroke="#F6DB8A" stroke-width="${(4 + r() * 3).toFixed(1)}" fill="none" stroke-linecap="round"/>`)}
      ${leaf(186, 120, -20, 1)}${leaf(210, 150, 160, 0.9, '#4C8C3C')}${leaf(190, 186, 20, 0.9)}`;
  },

  feijoada(id, rnd) {
    return `${shadow(id, 160, 150, 118, 118)}
      <circle cx="160" cy="150" r="118" fill="#A9583A"/><circle cx="160" cy="150" r="104" fill="#8C4428"/><circle cx="160" cy="150" r="100" fill="#2E1F1C"/>
      ${scatter(rnd, 120, 160, 150, 94, 94, (x, y, i, r) => `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="5" ry="3.4" transform="rotate(${(r() * 180).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${i % 3 ? '#3E2A27' : '#55393A'}"/>`)}
      ${scatter(rnd, 7, 160, 150, 70, 70, (x, y) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="12" fill="#A6402B"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9" fill="#D88B73"/><circle cx="${(x - 3).toFixed(1)}" cy="${(y - 2).toFixed(1)}" r="1.4" fill="#F5D2C3"/><circle cx="${(x + 3).toFixed(1)}" cy="${(y + 2).toFixed(1)}" r="1.4" fill="#F5D2C3"/>`)}
      ${scatter(rnd, 5, 160, 150, 60, 60, (x, y, i, r) => `<rect x="${(x - 14).toFixed(1)}" y="${(y - 9).toFixed(1)}" width="28" height="18" rx="6" fill="#7A2F24" transform="rotate(${(r() * 90).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`)}
      <path d="M70 120a100 100 0 0 1 60-62" stroke="#fff" stroke-width="5" opacity=".12" fill="none" stroke-linecap="round"/>
      ${plate(318, 92, 58)}
      ${scatter(rnd, 34, 318, 92, 34, 34, (x, y, i, r) => `<path d="M${x.toFixed(1)} ${y.toFixed(1)}l${(r() * 14 - 7).toFixed(1)} ${(r() * 8 - 4).toFixed(1)}" stroke="${i % 2 ? '#3E7B3A' : '#5A9B47'}" stroke-width="2.6" stroke-linecap="round"/>`)}
      ${lemonSlice(312, 230, 24, '#EE8A2A', '#F6B055')}${lemonSlice(352, 196, 17, '#EE8A2A', '#F6B055')}`;
  },

  escondidinho(id, rnd) {
    return `${napkin(70, 230, -20, '#EFE7DC', '#B5482F')}${spoon(340, 70, 210)}${shadow(id, 200, 150, 125, 125)}
      <circle cx="200" cy="150" r="124" fill="#C4643F"/><circle cx="200" cy="150" r="112" fill="url(#${id}puree)"/>
      ${scatter(rnd, 46, 200, 150, 104, 104, (x, y, i, r) => `<path d="M${(x - 8).toFixed(1)} ${y.toFixed(1)}q8-${(6 + r() * 6).toFixed(1)} 16 0" stroke="${i % 3 ? '#C68A3A' : '#A86D2A'}" stroke-width="${(2 + r() * 2.5).toFixed(1)}" fill="none" stroke-linecap="round" opacity="${(0.4 + r() * 0.5).toFixed(2)}"/>`)}
      <path d="M214 158c26-6 64 0 80 18-6 30-32 52-62 56-20-12-30-46-18-74z" fill="#7A3E26"/>
      ${scatter(rnd, 28, 252, 196, 30, 28, (x, y, i) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.6" fill="${i % 2 ? '#5C2A18' : '#9A5133'}"/>`)}
      ${scatter(rnd, 5, 252, 196, 26, 22, (x, y) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.6" fill="#D2442E"/>`)}
      ${parsley(rnd, 14, 180, 120, 60, 40)}`;
  },

  boloChocolate(id, rnd) {
    return `${napkin(70, 70, -12, '#F4E9E4', '#D98C8C')}${fork(345, 200, 20)}${shadow(id, 200, 150, 130, 130)}
      <circle cx="200" cy="150" r="130" fill="#F7F3EE"/><circle cx="200" cy="150" r="126" fill="none" stroke="#E9E1D6" stroke-width="2"/>
      <circle cx="200" cy="150" r="104" fill="#4A2618"/><circle cx="200" cy="150" r="98" fill="url(#${id}ganache)"/>
      <circle cx="200" cy="150" r="22" fill="#F7F3EE"/><circle cx="200" cy="150" r="22" fill="none" stroke="#3A1C11" stroke-width="4"/>
      ${scatter(rnd, 60, 200, 150, 90, 90, (x, y, i, r) => (Math.hypot(x - 200, y - 150) < 28 ? '' : `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="5" height="1.8" rx=".9" fill="${i % 4 ? '#2B140C' : '#F3E4D3'}" transform="rotate(${(r() * 180).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`))}
      <path d="M140 90a90 90 0 0 1 60-30" stroke="#fff" stroke-width="5" fill="none" opacity=".18" stroke-linecap="round"/>
      <path d="M200 150L286 104A98 98 0 0 1 298 150z" fill="#F7F3EE"/>
      <path d="M200 150L286 104A98 98 0 0 1 298 150z" fill="#EFE8DE"/>
      <g transform="translate(30 -22)"><ellipse cx="262" cy="136" rx="40" ry="22" fill="#000" opacity=".1"/><path d="M200 150L286 104A98 98 0 0 1 298 150z" fill="url(#${id}ganache)"/><path d="M200 150H298" stroke="#8A5236" stroke-width="7"/><path d="M200 150H298" stroke="#C99A72" stroke-width="2" stroke-dasharray="3 5"/><path d="M286 104A98 98 0 0 1 298 150" stroke="#2F150B" stroke-width="6" fill="none"/></g>`;
  },

  pudim(id, rnd) {
    return `${napkin(340, 230, 20, '#EEF1F3', '#A7BCC9')}${spoon(62, 170, -20)}${shadow(id, 200, 150, 134, 134)}
      <circle cx="200" cy="150" r="134" fill="#FBF9F6"/><circle cx="200" cy="150" r="130" fill="none" stroke="#EEE6DB" stroke-width="2"/>
      <circle cx="200" cy="150" r="118" fill="#C67A21" opacity=".55"/><path d="M90 160c10 30 30 40 50 46 30 8 70 6 96-6" stroke="#D88E2E" stroke-width="9" fill="none" opacity=".5"/>
      <circle cx="200" cy="150" r="96" fill="#F2D18C"/><circle cx="200" cy="150" r="88" fill="url(#${id}caramel)"/>
      <circle cx="200" cy="150" r="28" fill="#F2D18C"/><circle cx="200" cy="150" r="24" fill="#C67A21" opacity=".6"/><circle cx="200" cy="150" r="20" fill="#F6F1EA"/>
      ${scatter(rnd, 10, 200, 150, 70, 70, (x, y) => (Math.hypot(x - 200, y - 150) < 34 ? '' : `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.6" fill="#8F4E12" opacity=".5"/>`))}
      <path d="M128 112a80 80 0 0 1 50-36" stroke="#FFE7B8" stroke-width="7" fill="none" opacity=".55" stroke-linecap="round"/>`;
  },

  brigadeiro(id, rnd) {
    const pos = [[200, 150], [140, 120], [260, 120], [140, 186], [260, 186], [200, 86], [200, 214]];
    return `${napkin(70, 240, -20, '#F6E8EC', '#D893A5')}${shadow(id, 200, 150, 140, 125)}
      <rect x="60" y="22" width="280" height="256" rx="40" fill="#E9DACC"/><rect x="70" y="32" width="260" height="236" rx="32" fill="#F4EAE0"/>
      ${pos.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="33" fill="#C9A7E0"/>
        ${[...Array(16)].map((_, i) => `<path d="M${x} ${y}L${(x + Math.cos(i * Math.PI / 8) * 33).toFixed(1)} ${(y + Math.sin(i * Math.PI / 8) * 33).toFixed(1)}" stroke="#B48BCF" stroke-width="1.4"/>`).join('')}
        <circle cx="${x}" cy="${y}" r="25" fill="#3B1D10"/>
        ${scatter(rnd, 34, x, y, 21, 21, (sx, sy, i, r) => `<rect x="${sx.toFixed(1)}" y="${sy.toFixed(1)}" width="4.4" height="1.6" rx=".8" fill="${i % 3 ? '#26110A' : '#5A3020'}" transform="rotate(${(r() * 180).toFixed(0)} ${sx.toFixed(1)} ${sy.toFixed(1)})"/>`)}
        <ellipse cx="${x - 8}" cy="${y - 9}" rx="7" ry="4" fill="#fff" opacity=".18" transform="rotate(-30 ${x - 8} ${y - 9})"/>`).join('')}`;
  },

  tortaFrango(id, rnd) {
    return `${napkin(70, 70, -14)}${fork(345, 200, 20)}${shadow(id, 200, 150, 150, 98)}
      ${dishRect(66, 66, 268, 170, '#F7F3EE', '#E9E0D2', 26)}
      <rect x="80" y="80" width="240" height="142" rx="16" fill="url(#${id}crust)"/>
      ${scatter(rnd, 22, 200, 150, 110, 60, (x, y, i, r) => `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(6 + r() * 10).toFixed(1)}" ry="${(4 + r() * 6).toFixed(1)}" fill="#B8742A" opacity="${(0.2 + r() * 0.35).toFixed(2)}"/>`)}
      <rect x="232" y="146" width="70" height="62" rx="4" fill="#F6EBD3"/>
      ${scatter(rnd, 16, 266, 176, 28, 24, (x, y, i, r) => `<path d="M${x.toFixed(1)} ${y.toFixed(1)}l${(r() * 10 - 5).toFixed(1)} ${(r() * 6 - 3).toFixed(1)}" stroke="#E7CFA3" stroke-width="3.2" stroke-linecap="round"/>`)}
      ${scatter(rnd, 12, 266, 176, 28, 24, (x, y, i) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.8" fill="${i % 2 ? '#7DB458' : '#F2C94C'}"/>`)}
      <path d="M232 146h70" stroke="#D9A04D" stroke-width="6"/>
      ${pepper(rnd, 10, 160, 130, 60, 30)}${parsley(rnd, 10, 160, 130, 60, 36)}`;
  },

  omelete(id, rnd) {
    return `${napkin(330, 70, 18, '#EAF0E6', '#9DBB8E')}${fork(62, 180, -10)}${shadow(id, 200, 150, 122, 122)}${plate(200, 150, 122)}
      <path d="M118 156c0-50 40-86 90-86s88 36 88 86c-16 10-150 10-178 0z" fill="url(#${id}omelet)"/>
      <path d="M118 156c28 10 162 10 178 0" stroke="#E3B033" stroke-width="5" fill="none"/>
      ${scatter(rnd, 12, 206, 118, 62, 30, (x, y, i, r) => `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(4 + r() * 7).toFixed(1)}" ry="${(3 + r() * 4).toFixed(1)}" fill="#D8A12E" opacity=".35"/>`)}
      <path d="M150 156c10 10 30 12 40 4" stroke="#F7E6A7" stroke-width="6" stroke-linecap="round" fill="none"/>
      ${[[150, 205], [190, 214], [230, 208]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="16" fill="#E1503A"/><circle cx="${x}" cy="${y}" r="11" fill="#EE7A62"/>${[0, 1, 2].map((k) => `<circle cx="${x + Math.cos(k * 2.1) * 6}" cy="${y + Math.sin(k * 2.1) * 6}" r="2.4" fill="#F7C8A0"/>`).join('')}`).join('')}
      ${scatter(rnd, 30, 210, 110, 70, 30, (x, y, i, r) => `<path d="M${x.toFixed(1)} ${y.toFixed(1)}l${(r() * 6 - 3).toFixed(1)} 4" stroke="#4E8C3E" stroke-width="2.4" stroke-linecap="round"/>`)}`;
  },

  baiao(id, rnd) {
    return `${napkin(335, 230, 25, '#F1E6D3', '#C08A4A')}${woodSpoon(70, 200, -40)}${shadow(id, 200, 150, 128, 128)}
      <circle cx="200" cy="150" r="128" fill="#3B3633"/><circle cx="200" cy="150" r="114" fill="#2A2624"/><rect x="316" y="140" width="80" height="20" rx="10" fill="#2A2624"/>
      <circle cx="200" cy="150" r="108" fill="#C9A47F"/>
      ${scatter(rnd, 180, 200, 150, 104, 104, (x, y, i, r) => `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="3.6" ry="1.5" transform="rotate(${(r() * 180).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${i % 4 ? '#B88F69' : '#E0C7A7'}"/>`)}
      ${scatter(rnd, 46, 200, 150, 98, 98, (x, y, i, r) => `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="5" ry="3.2" transform="rotate(${(r() * 180).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${i % 2 ? '#8A5A3C' : '#A06C48'}"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1" fill="#2B1B12"/>`)}
      ${scatter(rnd, 12, 200, 150, 80, 80, (x, y, i, r) => `<rect x="${(x - 8).toFixed(1)}" y="${(y - 8).toFixed(1)}" width="16" height="16" rx="3" fill="#F4E3B6" transform="rotate(${(r() * 60).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/><rect x="${(x - 8).toFixed(1)}" y="${(y + 2).toFixed(1)}" width="16" height="6" rx="2" fill="#D99A3E" opacity=".8" transform="rotate(${(r() * 60).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`)}
      ${scatter(rnd, 10, 200, 150, 80, 80, (x, y) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6" fill="#A9432E"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="#D9846D"/>`)}
      ${scatter(rnd, 9, 200, 150, 90, 90, (x, y, i, r) => leaf(x, y, r() * 360, 0.55, '#4E8C3E'))}`;
  },

  mousse(id, rnd) {
    const glass = (x, y, r) => `${shadow(id, x, y, r, r)}<circle cx="${x}" cy="${y}" r="${r}" fill="#F3F7F8" opacity=".95"/><circle cx="${x}" cy="${y}" r="${r - 4}" fill="#F7E7A4"/>
      <circle cx="${x}" cy="${y}" r="${r * 0.55}" fill="#F2A52B"/>${scatter(rnd, 14, x, y, r * 0.48, r * 0.48, (sx, sy) => `<ellipse cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" rx="2.4" ry="1.8" fill="#2D2116"/>`)}
      <circle cx="${x}" cy="${y}" r="${r - 1}" fill="none" stroke="#DCE5E8" stroke-width="2.5"/><path d="M${x - r * 0.7} ${y - r * 0.4}a${r * 0.8} ${r * 0.8} 0 0 1 ${r * 0.5} -${r * 0.45}" stroke="#fff" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>`;
    return `${napkin(330, 230, -10, '#F7F0D6', '#E3B94A')}${glass(132, 118, 72)}${glass(268, 188, 72)}
      ${leaf(150, 50, -40, 1, '#4C8C3C')}${leaf(285, 120, 30, 0.9)}
      <circle cx="320" cy="70" r="30" fill="#E8C13A"/><circle cx="320" cy="70" r="22" fill="#F2A72E"/>${scatter(rnd, 16, 320, 70, 18, 18, (x, y) => `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="2.2" ry="1.7" fill="#2D2116"/>`)}<circle cx="320" cy="70" r="22" fill="none" stroke="#F9E9B8" stroke-width="3"/>`;
  },

  moqueca(id, rnd) {
    return `${napkin(330, 236, 20, '#F2E7D4', '#2F6A30')}${shadow(id, 200, 150, 132, 132)}
      <rect x="2" y="138" width="60" height="26" rx="12" fill="#3A2B25"/><rect x="338" y="138" width="60" height="26" rx="12" fill="#3A2B25"/>
      <circle cx="200" cy="150" r="140" fill="#4A3730"/><circle cx="200" cy="150" r="126" fill="#3A2B25"/><circle cx="200" cy="150" r="120" fill="url(#${id}moq)"/>
      ${scatter(rnd, 7, 200, 150, 66, 66, (x, y, i, r) => `<path d="M${(x - 22).toFixed(1)} ${y.toFixed(1)}c4-12 40-14 44 0-4 12-40 14-44 0z" fill="#F8EFE6" transform="rotate(${(r() * 180).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/><path d="M${(x - 10).toFixed(1)} ${(y - 6).toFixed(1)}c2 4 2 8 0 12M${(x + 4).toFixed(1)} ${(y - 7).toFixed(1)}c2 4 2 10 0 14" stroke="#E7D3C1" stroke-width="1.5" fill="none" transform="rotate(${(r() * 180).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`)}
      ${scatter(rnd, 6, 200, 150, 96, 96, (x, y) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="15" fill="#D93A26"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="11" fill="#EE6A4C"/>${[0, 1, 2].map((k) => `<circle cx="${(x + Math.cos(k * 2.1) * 6).toFixed(1)}" cy="${(y + Math.sin(k * 2.1) * 6).toFixed(1)}" r="2.4" fill="#F7C8A0"/>`).join('')}`)}
      ${scatter(rnd, 7, 200, 150, 96, 96, (x, y, i) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="13" fill="none" stroke="${i % 2 ? '#F2C230' : '#D7402F'}" stroke-width="4.5"/>`)}
      ${scatter(rnd, 6, 200, 150, 96, 96, (x, y) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="14" fill="none" stroke="#F4EEF2" stroke-width="2.5" opacity=".9"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9" fill="none" stroke="#EADBE6" stroke-width="2"/>`)}
      ${scatter(rnd, 14, 200, 150, 100, 100, (x, y, i, r) => leaf(x, y, r() * 360, 0.55, i % 2 ? '#4E8C3E' : '#6BAA52'))}
      ${scatter(rnd, 16, 200, 150, 104, 104, (x, y, i, r) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(2 + r() * 3).toFixed(1)}" fill="#F7A23B" opacity=".55"/>`)}`;
  },

  paoQueijo(id, rnd) {
    const balls = [[200, 150], [150, 110], [250, 110], [130, 170], [270, 170], [200, 88], [200, 212], [160, 220], [240, 220], [158, 64], [244, 64]];
    return `${shadow(id, 200, 150, 140, 140)}
      <circle cx="200" cy="150" r="140" fill="#B98A55"/>
      ${[...Array(18)].map((_, i) => `<circle cx="200" cy="150" r="${140 - i * 1.4}" fill="none" stroke="${i % 2 ? '#A97A47' : '#C99A62'}" stroke-width="1.2" stroke-dasharray="8 6" transform="rotate(${i * 9} 200 150)"/>`).join('')}
      <circle cx="200" cy="150" r="114" fill="#F3EBDD"/>
      <path d="M90 150l220-60v120z" fill="#E7D3BD" opacity=".55"/>${[0, 1, 2, 3].map((k) => `<path d="M${120 + k * 50} ${130 - k * 14}l0 ${50 + k * 14}" stroke="#C8553D" stroke-width="3" opacity=".35"/>`).join('')}
      ${balls.map(([x, y], i) => `<circle cx="${x + 4}" cy="${y + 6}" r="29" fill="#000" opacity=".08"/><circle cx="${x}" cy="${y}" r="28" fill="url(#${id}pq)"/>
        <path d="M${x - 12} ${y - 4}c6-6 16-6 22 0M${x - 6} ${y + 6}c4-3 10-3 14 2" stroke="#E9C477" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".9"/>
        ${scatter(rnd, 5, x, y, 18, 18, (sx, sy) => `<ellipse cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" rx="3" ry="2" fill="#C98A33" opacity=".45"/>`)}<ellipse cx="${x - 9}" cy="${y - 11}" rx="8" ry="4" fill="#fff" opacity="${i % 2 ? 0.25 : 0.18}" transform="rotate(-30 ${x - 9} ${y - 11})"/>`).join('')}`;
  },

  sopa(id, rnd) {
    return `${napkin(330, 236, 20, '#F1E9DC', '#C9A86B')}${spoon(58, 150, -30)}${shadow(id, 200, 150, 122, 122)}${bowl(200, 150, 122)}
      <circle cx="200" cy="150" r="104" fill="url(#${id}broth)"/>
      ${scatter(rnd, 12, 200, 150, 82, 82, (x, y) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="11" fill="#EE8434"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" fill="#F5A35A"/>`)}
      ${scatter(rnd, 11, 200, 150, 82, 82, (x, y, i, r) => `<rect x="${(x - 8).toFixed(1)}" y="${(y - 8).toFixed(1)}" width="16" height="16" rx="3.5" fill="#F3DCA4" transform="rotate(${(r() * 70).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`)}
      ${scatter(rnd, 8, 200, 150, 82, 82, (x, y, i, r) => `<rect x="${(x - 7).toFixed(1)}" y="${(y - 7).toFixed(1)}" width="14" height="14" rx="3" fill="#B7CF83" transform="rotate(${(r() * 70).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/><rect x="${(x - 7).toFixed(1)}" y="${(y - 7).toFixed(1)}" width="14" height="4" fill="#5C8E3E" transform="rotate(${(r() * 70).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`)}
      ${scatter(rnd, 9, 200, 150, 82, 82, (x, y, i, r) => `<path d="M${(x - 10).toFixed(1)} ${y.toFixed(1)}h20" stroke="#5C9440" stroke-width="6" stroke-linecap="round" transform="rotate(${(r() * 180).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`)}
      ${scatter(rnd, 20, 200, 150, 90, 90, (x, y, i, r) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(2 + r() * 3).toFixed(1)}" fill="#FFE6A8" opacity=".6"/>`)}
      ${parsley(rnd, 26, 200, 150, 80, 80)}`;
  },

  saladaGrao(id, rnd) {
    return `${napkin(70, 70, -18, '#EAF0E6', '#7BA05B')}${fork(345, 196, 22)}${shadow(id, 200, 150, 124, 124)}${bowl(200, 150, 124, '#F7F5F1', '#EFEDE6')}
      <circle cx="200" cy="150" r="106" fill="#EAE2CC"/>
      ${scatter(rnd, 44, 200, 150, 96, 96, (x, y) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="8" fill="#E8C98D"/><path d="M${(x - 3).toFixed(1)} ${(y - 4).toFixed(1)}q4 3 0 8" stroke="#C9A35F" stroke-width="1.3" fill="none"/>`)}
      ${scatter(rnd, 10, 200, 150, 88, 88, (x, y) => `<path d="M${(x - 10).toFixed(1)} ${y.toFixed(1)}a10 10 0 0 1 20 0z" fill="#E1503A"/><path d="M${(x - 7).toFixed(1)} ${y.toFixed(1)}a7 7 0 0 1 14 0z" fill="#F07A62"/>`)}
      ${scatter(rnd, 10, 200, 150, 88, 88, (x, y) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="11" fill="#3F7A3A"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="8.5" fill="#D9EBC1"/>${[0, 1, 2].map((k) => `<circle cx="${(x + Math.cos(k * 2.1) * 3.5).toFixed(1)}" cy="${(y + Math.sin(k * 2.1) * 3.5).toFixed(1)}" r="1.4" fill="#A5C982"/>`).join('')}`)}
      ${scatter(rnd, 9, 200, 150, 88, 88, (x, y, i, r) => `<path d="M${(x - 10).toFixed(1)} ${y.toFixed(1)}a10 6 0 0 1 20 0" stroke="#9B4A7C" stroke-width="3" fill="none" transform="rotate(${(r() * 180).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`)}
      ${parsley(rnd, 40, 200, 150, 92, 92)}`;
  },

  tapioca(id, rnd) {
    return `${napkin(330, 70, 20, '#F3E9DA', '#E28B3C')}${fork(60, 190, -16)}${shadow(id, 200, 150, 124, 124)}${plate(200, 150, 124)}
      <path d="M100 160a100 100 0 0 1 200 0c-10 8-50 14-100 14s-90-6-100-14z" fill="#F7F4EE"/>
      ${scatter(rnd, 60, 200, 110, 88, 46, (x, y, i, r) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1 + r() * 1.6).toFixed(1)}" fill="#E7E0D4"/>`)}
      <path d="M118 166c20 4 50 12 82 12s62-8 82-12c-6 10-14 16-20 18-20 4-40 6-62 6s-44-2-62-6c-8-2-14-8-20-18z" fill="#F1C843"/>
      <path d="M140 172c14 6 30 8 46 8" stroke="#F1A3A0" stroke-width="7" stroke-linecap="round"/><path d="M214 178c16 0 30-3 42-8" stroke="#F1A3A0" stroke-width="7" stroke-linecap="round"/>
      <path d="M100 160c10 8 50 14 100 14s90-6 100-14" stroke="#E9E2D6" stroke-width="3" fill="none"/>
      ${scatter(rnd, 16, 200, 120, 70, 30, (x, y) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.4" fill="#6E8B3D"/>`)}
      ${[[156, 222], [200, 230], [244, 222]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="13" fill="#E1503A"/><circle cx="${x}" cy="${y}" r="9" fill="#EE7A62"/>`).join('')}`;
  },
};

/** Gradientes compartilhados (cada SVG tem ids próprios, para não colidir na mesma página). */
function defs(id) {
  return `<defs>
    <radialGradient id="${id}sh"><stop offset="0" stop-color="#5A3A22" stop-opacity=".28"/><stop offset="1" stop-color="#5A3A22" stop-opacity="0"/></radialGradient>
    <radialGradient id="${id}gold" cx=".45" cy=".4" r=".8"><stop offset="0" stop-color="#F6CB66"/><stop offset=".7" stop-color="#E5A93F"/><stop offset="1" stop-color="#C98A2E"/></radialGradient>
    <radialGradient id="${id}cream" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#F1C49B"/><stop offset="1" stop-color="#DE9A6C"/></radialGradient>
    <radialGradient id="${id}roast" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#E7A453"/><stop offset=".6" stop-color="#C8742E"/><stop offset="1" stop-color="#9C5320"/></radialGradient>
    <radialGradient id="${id}potato" cx=".35" cy=".35"><stop offset="0" stop-color="#F6D486"/><stop offset="1" stop-color="#D9A04D"/></radialGradient>
    <radialGradient id="${id}puree" cx=".45" cy=".4" r=".8"><stop offset="0" stop-color="#F7DE9C"/><stop offset=".75" stop-color="#EBC071"/><stop offset="1" stop-color="#CF9446"/></radialGradient>
    <radialGradient id="${id}ganache" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#6E3A23"/><stop offset="1" stop-color="#3D1D10"/></radialGradient>
    <radialGradient id="${id}caramel" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#E9A443"/><stop offset=".7" stop-color="#C9781F"/><stop offset="1" stop-color="#A55E14"/></radialGradient>
    <radialGradient id="${id}crust" cx=".4" cy=".35" r=".85"><stop offset="0" stop-color="#F7D178"/><stop offset=".7" stop-color="#E7AE4B"/><stop offset="1" stop-color="#C98A2E"/></radialGradient>
    <radialGradient id="${id}omelet" cx=".45" cy=".6" r=".8"><stop offset="0" stop-color="#FBE38A"/><stop offset="1" stop-color="#F0C24A"/></radialGradient>
    <radialGradient id="${id}moq" cx=".45" cy=".4" r=".8"><stop offset="0" stop-color="#F59A47"/><stop offset=".8" stop-color="#E2642A"/><stop offset="1" stop-color="#C64F1E"/></radialGradient>
    <radialGradient id="${id}pq" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#FBE3A6"/><stop offset=".65" stop-color="#EFC26E"/><stop offset="1" stop-color="#D49A45"/></radialGradient>
    <radialGradient id="${id}broth" cx=".45" cy=".4" r=".8"><stop offset="0" stop-color="#F6C878"/><stop offset="1" stop-color="#E3A24E"/></radialGradient>
    <pattern id="${id}linen" width="14" height="14" patternUnits="userSpaceOnUse"><path d="M0 14L14 0" stroke="#000" stroke-opacity=".035" stroke-width="2"/></pattern>
  </defs>`;
}

/**
 * SVG do prato pronto.
 * @param {object} r receita (usa r.art, r.tint, r.id)
 * @param {{cls?: string, label?: boolean}} o
 */
export function dishArt(r, o = {}) {
  const id = `d${(uidN++).toString(36)}`;
  const draw = ART[r.art] || ART.sopa;
  const rnd = seeded(r.id);
  return `<svg class="${o.cls || 'dish-art'}" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${o.label === false ? '' : `Ilustração: ${r.name}`}">
    ${defs(id)}<rect width="400" height="300" fill="${r.tint || '#F4E6D6'}"/><rect width="400" height="300" fill="url(#${id}linen)"/>
    ${draw(id, rnd)}</svg>`;
}

export const ART_KEYS = Object.keys(ART);
