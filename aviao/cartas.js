/* Cartas aeronáuticas: um aeródromo fictício (XHSA · Serra Azul) com três cartas desenhadas do zero,
   um passo a passo que destaca cada parte da carta e exercícios de leitura. Nada aqui copia cartas reais. */
(() => {
'use strict';
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Medidas do aeródromo, usadas pelas três cartas
// Declinação magnética 21° W: rumo magnético 093° = 072° verdadeiro. As cartas são orientadas pelo norte verdadeiro.
const ROT = -18; // 090° verdadeiro na tela - 072° verdadeiro da pista

// ---------- Peças de desenho ----------
const T = (x, y, s, o = {}) => `<text x="${x}" y="${y}"${o.a ? ` text-anchor="${o.a}"` : ''}${o.s ? ` font-size="${o.s}"` : ''}${o.w ? ` font-weight="${o.w}"` : ''}${o.c ? ` fill="${o.c}"` : ''}${o.t ? ` transform="${o.t}"` : ''}>${s}</text>`;
const fixo = (x, y, cheio = true) => `<path d="M${x} ${y - 5.5} L${x + 5} ${y + 3.5} L${x - 5} ${y + 3.5}Z" ${cheio ? 'class="ct-k"' : 'class="ct-o"'}/>`;
const vor = (x, y) => `<path d="M${x - 6} ${y} L${x - 3} ${y - 5.2} L${x + 3} ${y - 5.2} L${x + 6} ${y} L${x + 3} ${y + 5.2} L${x - 3} ${y + 5.2}Z" class="ct-o"/><circle cx="${x}" cy="${y}" r="1.3" class="ct-k"/>`;
const caixa = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="ct-box"/>`;
const pico = (x, y, alt) => `<path d="M${x - 4} ${y + 3} L${x} ${y - 4} L${x + 4} ${y + 3}Z" class="ct-k"/>${T(x + 6, y + 3, alt, { s: 8.5, w: 600 })}`;
const rodape = (y) => `<g>${caixa(4, y, 352, 16)}${T(180, y + 11, 'AERÓDROMO FICTÍCIO · HANGAR ESCOLA · NÃO USAR PARA NAVEGAÇÃO', { a: 'middle', s: 7.5, w: 700, c: '#b3261e' })}</g>`;

// ---------- 1 · Diagrama do aeródromo (ADC) ----------
function adc() {
  const g = (k, s) => `<g data-k="${k}">${s}</g>`;
  const R = `transform="translate(0 -38) rotate(${ROT} 180 245)"`;
  return `<svg viewBox="0 0 360 470" class="ct-svg" role="img" aria-label="Diagrama do aeródromo fictício de Serra Azul">
<rect width="360" height="470" class="ct-paper"/>
${g('cab', `${caixa(4, 4, 352, 42)}${T(12, 24, 'XHSA', { s: 17, w: 800 })}${T(12, 38, 'SERRA AZUL', { s: 9, w: 600 })}${T(180, 22, 'DIAGRAMA DO AERÓDROMO', { a: 'middle', s: 9.5, w: 700 })}${T(180, 35, 'ADC', { a: 'middle', s: 9, w: 600 })}${T(348, 22, 'AD ELEV', { a: 'end', s: 8 })}${T(348, 36, '2150 FT', { a: 'end', s: 11, w: 800 })}`)}
${g('freq', `${caixa(4, 48, 352, 22)}${T(14, 62.5, 'ATIS 127.650', { s: 9, w: 700 })}${T(130, 62.5, 'TWR 118.300', { s: 9, w: 700 })}${T(246, 62.5, 'GND 121.850', { s: 9, w: 700 })}`)}
${caixa(4, 72, 352, 334)}
${g('norte', `<path d="M30 92 L35 108 L30 104 L25 108Z" class="ct-k"/>${T(30, 88, 'N', { a: 'middle', s: 9, w: 800 })}${T(30, 120, 'VAR 21°W', { a: 'middle', s: 7.5, w: 600 })}`)}
${g('pista', `<g ${R}><rect x="40" y="238" width="280" height="14" class="ct-rwy"/><path d="M48 245 H312" class="ct-cl"/>
  ${T(58, 249, '09', { s: 9, w: 800, c: '#fff' })}${T(302, 249, '27', { a: 'end', s: 9, w: 800, c: '#fff' })}
  ${T(180, 232, '2400 x 45 m · ASPH', { a: 'middle', s: 8.5, w: 700 })}
  ${T(40, 228, '093°', { s: 8.5, w: 700 })}${T(320, 228, '273°', { a: 'end', s: 8.5, w: 700 })}</g>`)}
${g('elev', `<g ${R}>${T(76, 266, 'THR 09 ELEV 2143', { s: 7 })}${T(286, 266, 'THR 27 ELEV 2150', { a: 'end', s: 7 })}</g>`)}
${g('taxi', `<g ${R}><rect x="62" y="282" width="236" height="7" class="ct-twy"/>
  <rect x="62" y="252" width="7" height="34" class="ct-twy"/><rect x="291" y="252" width="7" height="34" class="ct-twy"/><rect x="176" y="252" width="7" height="58" class="ct-twy"/>
  ${T(120, 300, 'A', { s: 9, w: 800 })}${T(52, 276, 'A1', { a: 'end', s: 8, w: 700 })}${T(308, 276, 'A2', { s: 8, w: 700 })}${T(188, 276, 'B', { s: 8.5, w: 800 })}</g>`)}
${g('espera', `<g ${R}><path d="M60 262 h11 M60 265 h11 M289 262 h11 M289 265 h11 M174 262 h11 M174 265 h11" class="ct-hold"/></g>`)}
${g('patio', `<g ${R}><rect x="136" y="310" width="88" height="34" class="ct-apron"/>${T(180, 330, 'PÁTIO', { a: 'middle', s: 8, w: 700 })}</g>`)}
${g('twr', `<g ${R}><rect x="142" y="350" width="40" height="14" class="ct-bld"/>${T(162, 360, 'TPS', { a: 'middle', s: 7.5, w: 700 })}
  <rect x="190" y="350" width="26" height="14" class="ct-bld"/>${T(203, 360, 'HGR', { a: 'middle', s: 7, w: 700 })}
  <circle cx="232" cy="330" r="5" class="ct-o"/><path d="M232 325 V335 M227 330 H237" class="ct-line"/>${T(240, 333, 'TWR', { s: 7.5, w: 700 })}
  <rect x="112" y="318" width="18" height="10" class="ct-bld"/>${T(121, 339, 'COMB', { a: 'middle', s: 6.5, w: 700 })}</g>`)}
${g('biruta', `<g ${R}><path d="M96 220 v-10 l12 2 l-1 4 l-11 0" class="ct-o"/>${T(90, 205, 'BIRUTA', { s: 6.5, w: 600 })}</g>`)}
${g('escala', `<path d="M260 392 h80 M260 388 v8 M300 389 v6 M340 388 v8" class="ct-line"/>${T(260, 386, '0', { a: 'middle', s: 7 })}${T(340, 386, '500 m', { a: 'middle', s: 7 })}`)}
${g('dados', `${caixa(4, 408, 352, 42)}${T(12, 421, 'RWY 09/27 · 2400 x 45 m · ASPH · PCN 48/F/B/X/T', { s: 8.5, w: 700 })}${T(12, 433, 'RWY 09: luzes de aproximação (ALS) · PAPI 3,0° à esquerda', { s: 8 })}${T(12, 445, 'RWY 27: PAPI 3,0° à esquerda · Operação 24 h', { s: 8 })}`)}
${rodape(452)}
</svg>`;
}

// ---------- 2 · Carta de aproximação ILS Z RWY 09 (IAC) ----------
// Planta: 13 px por NM, cabeceira em (306, 214), curso final 072° verdadeiro (093° magnético)
const U = [Math.sin(72 * Math.PI / 180), -Math.cos(72 * Math.PI / 180)];
const P = (d) => [306 - U[0] * 13 * d, 214 - U[1] * 13 * d].map((v) => Math.round(v * 10) / 10);
function iac() {
  const g = (k, s) => `<g data-k="${k}">${s}</g>`;
  const [x16, y16] = P(16), [x10, y10] = P(10), [x6, y6] = P(6), [xt, yt] = P(0);
  // Perfil: x de 34 (D16) a 306 (cabeceira) = 17 px por NM; altitude de 2000 a 6500 ft
  const X = (d) => 306 - d * 17, Y = (ft) => 472 - (ft - 2000) / 4500 * 92;
  return `<svg viewBox="0 0 360 640" class="ct-svg" role="img" aria-label="Carta de aproximação ILS Z para a pista 09 de Serra Azul, fictícia">
<rect width="360" height="640" class="ct-paper"/>
${g('cab', `${caixa(4, 4, 352, 42)}${T(12, 21, 'XHSA · SERRA AZUL', { s: 10, w: 800 })}${T(12, 36, 'IAC · CARTA DE APROXIMAÇÃO', { s: 8, w: 600 })}${T(348, 23, 'ILS Z RWY 09', { a: 'end', s: 15, w: 800 })}${T(348, 37, 'CAT A B C D', { a: 'end', s: 8, w: 600 })}`)}
${g('freq', `${caixa(4, 48, 352, 20)}${T(12, 61.5, 'ATIS 127.650', { s: 8.5, w: 700 })}${T(108, 61.5, 'SERRA APP 119.150', { s: 8.5, w: 700 })}${T(238, 61.5, 'TWR 118.300', { s: 8.5, w: 700 })}`)}
${g('loc', `${caixa(4, 70, 118, 30)}${T(12, 82, 'LOC/DME', { s: 7.5 })}${T(12, 95, 'ISAZ 109.30', { s: 10, w: 800 })}`)}
${g('crs', `${caixa(124, 70, 112, 30)}${T(132, 82, 'CURSO FINAL', { s: 7.5 })}${T(132, 95, '093°', { s: 11, w: 800 })}`)}
${g('gs', `${caixa(238, 70, 118, 30)}${T(246, 82, 'ELEV CABECEIRA', { s: 7.5 })}${T(246, 95, 'THR 2143 FT', { s: 10, w: 800 })}`)}
${caixa(4, 102, 352, 252)}
${g('msa', `<circle cx="46" cy="146" r="30" class="ct-o"/>${T(46, 141, 'MSA', { a: 'middle', s: 7.5, w: 700 })}${T(46, 154, '7800', { a: 'middle', s: 11, w: 800 })}${T(46, 186, '25 NM SAZ', { a: 'middle', s: 7, w: 600 })}`)}
${g('relevo', `${pico(150, 150, '5900')}${pico(150, 300, '3610')}${T(116, 136, 'SERRA AZUL', { s: 7, w: 600, c: '#6b4b1f' })}`)}
${g('vor', `${vor(262, 286)}${caixa(190, 300, 62, 22)}${T(221, 310, 'SAZ 113.70', { a: 'middle', s: 7.5, w: 700 })}${T(221, 319, 'VOR/DME', { a: 'middle', s: 6.5 })}`)}
${g('espera', `<g transform="rotate(${ROT} 262 286)"><path d="M262 286 H316 A12 12 0 0 0 316 262 H262 A12 12 0 0 0 262 286" class="ct-route"/><path d="M292 286 l-6 -3 v6Z" class="ct-k"/>${T(292, 297, '273°', { a: 'middle', s: 7.5, w: 700 })}${T(292, 257, '6000', { a: 'middle', s: 7.5, w: 700 })}</g>`)}
${g('crs', `<path d="M${x16} ${y16} L${xt} ${yt}" class="ct-final"/>${T(P(13)[0], P(13)[1] - 6, '093°', { a: 'middle', s: 9, w: 800, t: `rotate(${ROT} ${P(13)[0]} ${P(13)[1] - 6})` })}`)}
${g('iaf', `${fixo(x16, y16)}${T(x16 - 4, y16 + 16, 'PIRAU', { a: 'middle', s: 8.5, w: 800 })}${T(x16 - 4, y16 + 26, 'IAF · D16.0', { a: 'middle', s: 7 })}`)}
${g('if', `${fixo(x10, y10)}${T(x10, y10 + 16, 'LOBAR', { a: 'middle', s: 8.5, w: 800 })}${T(x10, y10 + 26, 'IF · D10.0', { a: 'middle', s: 7 })}`)}
${g('faf', `${fixo(x6, y6)}${T(x6, y6 - 22, 'MURIX', { a: 'middle', s: 8.5, w: 800 })}${T(x6, y6 - 12, 'FAF · D6.0', { a: 'middle', s: 7 })}`)}
${g('pista', `<g transform="rotate(${ROT} ${xt} ${yt})"><rect x="${xt}" y="${yt - 3}" width="30" height="6" class="ct-rwy"/></g>${T(xt + 6, yt + 18, 'RWY 09', { s: 7.5, w: 700 })}`)}
${g('arrt', `<path d="M${xt + 28} ${yt - 9} L340 196 Q356 210 350 240 Q342 276 272 286" class="ct-miss"/><path d="M272 286 l7 -4 l-1 7Z" class="ct-k"/>`)}
${g('escala', `<path d="M268 340 h65 M268 336 v8 M333 336 v8" class="ct-line"/>${T(300, 334, '5 NM', { a: 'middle', s: 7 })}${T(16, 344, 'N ↑', { s: 8, w: 800 })}`)}
${caixa(4, 356, 352, 132)}
${g('perfil', `<path d="M${X(16)} ${Y(6000)} L${X(10)} ${Y(4100)} L${X(6)} ${Y(4100)}" class="ct-final"/>
  ${T(X(16) + 6, Y(6000) - 6, '6000', { s: 8.5, w: 800 })}${T(X(10), Y(4100) - 6, '4100', { a: 'middle', s: 8.5, w: 800 })}
  ${T((X(16) + X(10)) / 2, 480, '6.0 NM', { a: 'middle', s: 7.5 })}${T((X(10) + X(6)) / 2, 480, '4.0 NM', { a: 'middle', s: 7.5 })}${T((X(6) + X(0)) / 2, 480, '6.0 NM', { a: 'middle', s: 7.5 })}
  ${T(X(16) - 4, 369, 'PIRAU D16', { s: 7, w: 700 })}${T(X(10), 369, 'LOBAR D10', { a: 'middle', s: 7, w: 700 })}${T(X(6), 369, 'MURIX D6', { a: 'middle', s: 7, w: 700 })}
  <path d="M${X(16)} 373 V474 M${X(10)} 373 V474 M${X(6)} 373 V474" class="ct-thin"/><path d="M10 474 H350" class="ct-line"/>`)}
${g('gs', `<path d="M${X(6)} ${Y(4100)} L${X(0)} ${Y(2193)}" class="ct-final"/><path d="M${X(6) - 4} ${Y(4100) - 4} l8 8 m0 -8 l-8 8" class="ct-line"/>${T(X(3.2), Y(3150) - 8, 'GS 3,0°', { a: 'middle', s: 8.5, w: 800, t: `rotate(17 ${X(3.2)} ${Y(3150) - 8})` })}`)}
${g('gs', `<rect x="${X(0)}" y="${Y(2143)}" width="34" height="5" class="ct-rwy"/>${T(X(0) + 2, Y(2143) - 6, 'TCH 50', { s: 7, w: 700 })}${T(X(0) + 2, Y(2143) + 13, 'THR 2143', { s: 7 })}`)}
${g('da', `<path d="M${X(1.1) - 10} ${Y(2343)} H${X(0)}" class="ct-dash"/>${T(X(1.1) - 12, Y(2343) - 6, 'DA 2343', { a: 'end', s: 7.5, w: 800, c: '#b3261e' })}`)}
${g('arrt', `<path d="M${X(0) + 30} ${Y(2193) - 6} Q${X(0) + 40} ${Y(2700)} ${X(0) + 42} ${Y(3600)}" class="ct-miss"/><path d="M${X(0) + 42} ${Y(3600) - 6} l-3.5 7 h7Z" class="ct-k"/>`)}
${g('razao', `${caixa(222, 380, 128, 34)}${T(228, 391, 'GS (kt)', { s: 7, w: 700 })}${T(228, 408, 'ft/min', { s: 7, w: 700 })}${[90, 100, 120, 140].map((v, i) => T(284 + i * 18, 391, v, { a: 'middle', s: 7.5 }) + T(284 + i * 18, 408, Math.round(v * 5.3 / 10) * 10, { a: 'middle', s: 7.5, w: 700 })).join('')}`)}
${g('min', `${caixa(4, 490, 352, 74)}${T(12, 502, 'MÍNIMOS', { s: 8, w: 800 })}${['A', 'B', 'C', 'D'].map((c, i) => T(150 + i * 54, 502, c, { a: 'middle', s: 8, w: 800 })).join('')}
  <path d="M8 506 H352" class="ct-thin"/>
  ${T(12, 518, 'ILS · DA (DH)', { s: 7.5, w: 700 })}${T(231, 518, '2343 (200) · VIS 800 m', { a: 'middle', s: 8, w: 800 })}
  ${T(12, 534, 'LOC · MDA (MDH)', { s: 7.5, w: 700 })}${T(231, 534, '2600 (457) · VIS 1500 m', { a: 'middle', s: 8, w: 700 })}
  ${T(12, 550, 'CIRCULAR', { s: 7.5, w: 700 })}${[['2900', '1600'], ['2900', '1600'], ['3100', '2400'], ['3200', '3600']].map(([a, v], i) => T(150 + i * 54, 550, a, { a: 'middle', s: 7.5, w: 700 }) + T(150 + i * 54, 559, v + ' m', { a: 'middle', s: 6.5 })).join('')}`)}
${g('arrt', `${caixa(4, 566, 352, 52)}${T(12, 578, 'ARREMETIDA', { s: 8, w: 800 })}${T(12, 591, 'Subir no rumo 093° até 3500 ft, curva à DIREITA', { s: 8 })}${T(12, 603, 'direto ao SAZ subindo para 6000 ft e aguardar', { s: 8 })}${T(12, 614, 'na espera (aproximação 273°, curvas pela direita).', { s: 8 })}`)}
${rodape(620)}
</svg>`;
}

// ---------- 3 · Carta de saída (SID) BOLEX 1A ----------
function sid() {
  const g = (k, s) => `<g data-k="${k}">${s}</g>`;
  // Pista com centro em (110, 250); VOR SAZ ao sul, em (150, 322); BOLEX na radial 100 (079° verdadeiro), D18 a 8 px por NM
  const r = (79 * Math.PI) / 180, vx = 150, vy = 322, bx = Math.round(vx + Math.sin(r) * 144), by = Math.round(vy - Math.cos(r) * 144);
  const ex = 110 + Math.cos(18 * Math.PI / 180) * 34, ey = 250 - Math.sin(18 * Math.PI / 180) * 34; // fim da pista 09
  const cx = ex + Math.cos(18 * Math.PI / 180) * 40, cy = ey - Math.sin(18 * Math.PI / 180) * 40; // 3000 ft: começa a curva
  const ix = cx + 62, iy = vy - Math.cos(r) / Math.sin(r) * (ix - vx); // ponto onde intercepta a radial
  return `<svg viewBox="0 0 360 520" class="ct-svg" role="img" aria-label="Carta de saída BOLEX 1A da pista 09 de Serra Azul, fictícia">
<rect width="360" height="520" class="ct-paper"/>
${g('cab', `${caixa(4, 4, 352, 42)}${T(12, 21, 'XHSA · SERRA AZUL', { s: 10, w: 800 })}${T(12, 36, 'SID · SAÍDA PADRÃO POR INSTRUMENTOS', { s: 8, w: 600 })}${T(348, 23, 'BOLEX 1A', { a: 'end', s: 15, w: 800 })}${T(348, 37, 'RWY 09', { a: 'end', s: 8.5, w: 700 })}`)}
${g('freq', `${caixa(4, 48, 236, 20)}${T(12, 61.5, 'TWR 118.300', { s: 8.5, w: 700 })}${T(104, 61.5, 'Após decolar: SERRA APP 119.150', { s: 8, w: 700 })}`)}
${g('ta', `${caixa(242, 48, 114, 20)}${T(250, 61.5, 'ALT TRANSIÇÃO 6000 FT', { s: 7.5, w: 800 })}`)}
${caixa(4, 70, 352, 300)}
${g('msa', `<circle cx="46" cy="114" r="30" class="ct-o"/>${T(46, 109, 'MSA', { a: 'middle', s: 7.5, w: 700 })}${T(46, 122, '7800', { a: 'middle', s: 11, w: 800 })}${T(46, 154, '25 NM SAZ', { a: 'middle', s: 7, w: 600 })}`)}
${g('relevo', `${pico(118, 168, '5900')}${pico(214, 182, '4420')}${T(84, 156, 'SERRA AZUL', { s: 7, w: 600, c: '#6b4b1f' })}`)}
${g('vor', `${vor(vx, vy)}${caixa(vx - 31, vy + 10, 62, 22)}${T(vx, vy + 20, 'SAZ 113.70', { a: 'middle', s: 7.5, w: 700 })}${T(vx, vy + 29, 'VOR/DME', { a: 'middle', s: 6.5 })}`)}
${g('pista', `<g transform="rotate(${ROT} 110 250)"><rect x="76" y="247" width="68" height="6" class="ct-rwy"/></g>${T(70, 276, 'RWY 09', { s: 7.5, w: 700 })}${T(70, 286, 'XHSA', { s: 7 })}`)}
${g('rota', `<path d="M${ex.toFixed(1)} ${ey.toFixed(1)} L${cx.toFixed(1)} ${cy.toFixed(1)} Q${(cx + 30).toFixed(1)} ${(cy - 6).toFixed(1)} ${ix.toFixed(1)} ${iy.toFixed(1)} L${bx} ${by}" class="ct-final"/>
  ${T(((ex + cx) / 2).toFixed(1), ((ey + cy) / 2 - 7).toFixed(1), '093°', { a: 'middle', s: 8.5, w: 800, t: `rotate(${ROT} ${((ex + cx) / 2).toFixed(1)} ${((ey + cy) / 2 - 7).toFixed(1)})` })}
  ${T((cx + 4).toFixed(1), (cy - 10).toFixed(1), '3000', { s: 7.5, w: 700 })}
  ${T((cx + 36).toFixed(1), (cy + 16).toFixed(1), 'curva à direita', { s: 7, w: 700 })}`)}
${g('radial', `<path d="M${vx} ${vy} L${ix.toFixed(1)} ${iy.toFixed(1)}" class="ct-dash2"/>${T(((vx + ix) / 2).toFixed(1), ((vy + iy) / 2 + 13).toFixed(1), 'R-100', { a: 'middle', s: 8.5, w: 800, t: `rotate(-11 ${((vx + ix) / 2).toFixed(1)} ${((vy + iy) / 2 + 13).toFixed(1)})` })}`)}
${g('fixo', `${fixo(bx, by)}${T(bx - 2, by + 17, 'BOLEX', { a: 'middle', s: 9, w: 800 })}${T(bx - 2, by + 27, 'D18 SAZ', { a: 'middle', s: 7 })}`)}
${g('alt', `<path d="M${bx - 22} ${by - 30} H${bx + 14}" class="ct-line"/>${T(bx - 4, by - 33, 'FL070', { a: 'middle', s: 8.5, w: 800 })}`)}
${g('escala', `<path d="M268 356 h40 M268 352 v8 M308 352 v8" class="ct-line"/>${T(288, 350, '5 NM', { a: 'middle', s: 7 })}${T(16, 362, 'N ↑', { s: 8, w: 800 })}`)}
${g('txt', `${caixa(4, 372, 352, 62)}${T(12, 384, 'SAÍDA', { s: 8, w: 800 })}${T(12, 397, 'Subir no rumo 093° até 3000 ft, curva à DIREITA para', { s: 8 })}${T(12, 409, 'interceptar a radial 100 do SAZ até BOLEX. Cruzar BOLEX', { s: 8 })}${T(12, 421, 'no FL070 ou acima. Subir para o FL070 e aguardar', { s: 8 })}${T(12, 431, 'autorização para níveis mais altos.', { s: 8 })}`)}
${g('grad', `${caixa(4, 436, 352, 64)}${T(12, 448, 'GRADIENTE MÍNIMO DE SUBIDA: 5,5% ATÉ 4500 FT (por causa do relevo)', { s: 7.5, w: 800 })}
  ${T(12, 464, 'GS (kt)', { s: 7.5, w: 700 })}${T(12, 480, 'ft/min', { s: 7.5, w: 700 })}${[80, 100, 120, 140, 160].map((v, i) => T(100 + i * 52, 464, v, { a: 'middle', s: 8 }) + T(100 + i * 52, 480, Math.round(v * 5.5 * 1.0127), { a: 'middle', s: 8, w: 800 })).join('')}
  ${T(12, 494, 'Por NM voado o avião precisa subir pelo menos 334 ft.', { s: 7.5 })}`)}
${rodape(502)}
</svg>`;
}

// ---------- Passo a passo e exercícios ----------
const CARTAS = [
  { id: 'adc', nome: 'Aeródromo', sigla: 'ADC', svg: adc,
    passos: [
      ['cab', 'O cabeçalho', 'Toda carta começa dizendo de onde ela é. XHSA é o código do aeródromo (fictício: os códigos reais no Brasil começam com S). À direita, a elevação do aeródromo: 2150 ft acima do nível do mar, o ponto mais alto das pistas.'],
      ['freq', 'As frequências', 'ATIS é a gravação com vento, pista em uso e ajuste do altímetro: ouve-se primeiro. GND (Solo) autoriza o táxi. TWR (Torre) autoriza entrar na pista, decolar e pousar.'],
      ['norte', 'O norte e a declinação', 'As cartas são desenhadas pelo norte verdadeiro, mas a bússola aponta o norte magnético. Aqui a diferença (declinação) é de 21° para oeste. Por isso a pista 09, de rumo magnético 093°, aparece inclinada: no mapa ela aponta para 072° verdadeiro.'],
      ['pista', 'A pista', 'O número da pista é o rumo magnético arredondado e dividido por 10: quem decola da 09 vai para 093°; da 27, para 273°. São a mesma faixa de asfalto, usada em sentidos opostos. Ela tem 2400 m de comprimento por 45 m de largura, de asfalto (ASPH).'],
      ['elev', 'A elevação das cabeceiras', 'Cada cabeceira tem a sua elevação. A 09 está a 2143 ft e a 27 a 2150 ft: a pista sobe 7 ft de uma ponta à outra. Na aproximação, a altura sobre a pista é medida a partir da cabeceira.'],
      ['taxi', 'As pistas de táxi', 'A taxiway A corre paralela à pista. A1 e A2 ligam as pontas, e B liga o meio da pista ao pátio. As letras são ditas no alfabeto fonético: "táxi via Bravo e Alfa".'],
      ['espera', 'As linhas de espera', 'Antes de cada entrada da pista há uma posição de espera (no chão, duas linhas contínuas e duas tracejadas). Sem autorização da Torre, o avião para ali e não entra na pista.'],
      ['patio', 'Pátio e edifícios', 'O pátio é onde os aviões estacionam. TPS é o terminal de passageiros, HGR o hangar, COMB o posto de combustível e TWR a torre de controle.'],
      ['dados', 'Os dados da pista', 'PCN diz quanto peso o pavimento aguenta. ALS são as luzes de aproximação e PAPI as quatro luzes ao lado da pista que mostram se o avião está na rampa: duas brancas e duas vermelhas é o certo.'],
    ],
    perguntas: [
      ['Em qual frequência você pede autorização para o táxi?', ['118.300', '121.850', '127.650', '119.150'], 1, 'Táxi é com o Solo (GND), 121.850. A Torre só entra quando o avião chega perto da pista.', 'freq'],
      ['Qual o comprimento da pista?', ['45 m', '2150 m', '2400 m', '2143 m'], 2, '2400 x 45 m: o primeiro número é o comprimento, o segundo a largura.', 'pista'],
      ['Decolando da pista 27, a bússola vai mostrar mais ou menos:', ['270°', '273°', '093°', '252°'], 1, 'A pista 27 tem rumo magnético 273°, o oposto de 093° (093 + 180).', 'pista'],
      ['Por que a pista aparece inclinada no diagrama?', ['Erro de desenho', 'A carta usa o norte verdadeiro e a declinação é 21° W', 'Por causa do vento', 'Porque a pista sobe'], 1, '093° magnético menos 21° de declinação oeste dá 072° verdadeiro, que é a direção desenhada.', 'norte'],
      ['Saindo do pátio pela B, onde você para antes da pista?', ['No meio da B', 'Na linha de espera', 'Na pista, no eixo', 'Na taxiway A'], 1, 'Sem autorização, o avião para na posição de espera, antes de entrar na pista.', 'espera'],
      ['Qual a elevação do aeródromo?', ['2143 ft', '2150 ft', '2400 ft', '1500 ft'], 1, 'A elevação do aeródromo é a do ponto mais alto das pistas: 2150 ft, na cabeceira 27.', 'cab'],
    ] },
  { id: 'iac', nome: 'Aproximação ILS', sigla: 'IAC', svg: iac,
    passos: [
      ['cab', 'O cabeçalho', 'ILS Z RWY 09: um procedimento de pouso por instrumentos para a pista 09. A letra Z diferencia procedimentos parecidos para a mesma pista. CAT A B C D são as categorias de avião, pela velocidade de aproximação.'],
      ['freq', 'As frequências na ordem de uso', 'Primeiro o ATIS, depois o Controle de Aproximação (APP), que traz o avião até o procedimento, e por fim a Torre, para o pouso.'],
      ['loc', 'O localizador', 'O ILS tem duas partes: o localizador, que guia para a esquerda e para a direita, e a rampa (glide slope), que guia para cima e para baixo. Sintoniza-se 109.30 e confere-se o código ISAZ em Morse.'],
      ['crs', 'O curso final', 'O curso do localizador, 093°, é colocado no instrumento (CRS). É o mesmo rumo da pista 09.'],
      ['msa', 'Altitude mínima de setor', 'Num raio de 25 NM do VOR SAZ, voar a 7800 ft garante pelo menos 1000 ft acima de qualquer obstáculo. É a altitude de segurança para emergências.'],
      ['relevo', 'O relevo', 'Os triângulos com números são picos: a Serra Azul chega a 5900 ft ao norte. É por isso que o procedimento começa a 6000 ft e a MSA é tão alta.'],
      ['iaf', 'Aproximação inicial (IAF)', 'PIRAU, a 16 NM da cabeceira (D16.0 no DME do ILS), é onde o procedimento começa. O triângulo cheio indica um ponto de notificação obrigatória.'],
      ['if', 'Aproximação intermediária (IF)', 'Em LOBAR, a 10 NM, o avião já está alinhado com a pista e nivelado a 4100 ft, reduzindo e configurando flaps.'],
      ['faf', 'Aproximação final (FAF)', 'Em MURIX, a 6 NM, o avião encontra a rampa e começa a descida final. Conferir 4100 ft no altímetro é a prova de que o ILS está certo.'],
      ['perfil', 'O perfil', 'O desenho de lado mostra as altitudes: 6000 ft em PIRAU, descida para 4100 ft até LOBAR, nivelado até MURIX. Os números embaixo são as distâncias entre os pontos.'],
      ['gs', 'A rampa de 3°', 'Uma rampa de 3° perde cerca de 318 ft por NM. De MURIX (4100 ft) até a cabeceira são 6 NM: 6 x 318 = 1908 ft, chegando a 50 ft sobre a cabeceira (TCH).'],
      ['razao', 'Razão de descida', 'Quanto mais rápido, maior a razão de descida para ficar na mesma rampa. Uma regra prática: velocidade no solo x 5,3. A 120 kt, cerca de 640 ft/min.'],
      ['da', 'Altitude de decisão (DA)', 'A 2343 ft (200 ft acima da cabeceira), o piloto precisa ver as luzes ou a pista. Se não vir, arremete na hora.'],
      ['min', 'Os mínimos', 'Além da DA, a visibilidade mínima é 800 m. Se o glide slope falhar, só o localizador vale, com mínimos mais altos (MDA 2600 ft). Circular para outra pista exige ainda mais.'],
      ['arrt', 'A arremetida', 'Se não pousar, o caminho já está escrito: subir em 093° até 3500 ft, curva à direita direto ao SAZ, subindo para 6000 ft, e entrar na espera. Na planta, o tracejado mostra o mesmo caminho.'],
      ['espera', 'A espera', 'O circuito oval sobre o SAZ é a espera: o avião voa em volta, a 6000 ft, até o controle dar nova instrução. A perna de aproximação é 273°, com curvas pela direita.'],
    ],
    perguntas: [
      ['Qual frequência sintonizar no NAV para o ILS?', ['113.70', '109.30', '119.150', '118.300'], 1, 'O ILS é o ISAZ, em 109.30. O 113.70 é o VOR SAZ, usado na arremetida.', 'loc'],
      ['Qual curso colocar no instrumento?', ['072°', '093°', '273°', '100°'], 1, 'O curso final é 093°. O 072° é o rumo verdadeiro, que não se usa no instrumento.', 'crs'],
      ['A que altitude você cruza MURIX?', ['6000 ft', '5000 ft', '4100 ft', '2343 ft'], 2, 'MURIX é o FAF, a 4100 ft. Dali o avião desce na rampa.', 'faf'],
      ['Qual a altitude de decisão do ILS?', ['2143 ft', '2343 ft', '2600 ft', '200 ft'], 1, 'DA 2343 ft. O 200 entre parênteses é a mesma coisa em altura acima da cabeceira.', 'da'],
      ['A 120 kt, qual a razão de descida na rampa?', ['480 ft/min', '530 ft/min', '640 ft/min', '740 ft/min'], 2, 'A tabela mostra cerca de 640 ft/min para 120 kt.', 'razao'],
      ['Na DA você não vê a pista. Qual é o primeiro passo?', ['Descer mais um pouco', 'Subir no rumo 093° até 3500 ft', 'Curva à esquerda para o SAZ', 'Ir direto para a espera'], 1, 'Arremetida: primeiro subir em frente, no 093°, até 3500 ft. Só depois a curva à direita para o SAZ.', 'arrt'],
      ['Qual a altitude mínima de setor?', ['5900 ft', '6000 ft', '7800 ft', '2150 ft'], 2, 'MSA 7800 ft num raio de 25 NM do SAZ.', 'msa'],
    ] },
  { id: 'sid', nome: 'Saída SID', sigla: 'SID', svg: sid,
    passos: [
      ['cab', 'O cabeçalho', 'SID é a saída padrão por instrumentos: um caminho pronto da pista até a rota. O nome vem do ponto onde ela termina, BOLEX, e do número da versão: BOLEX 1A, só para a pista 09.'],
      ['freq', 'Frequências', 'Decola-se com a Torre e, logo depois, chama-se o Controle de Aproximação (SERRA APP), que acompanha a subida no radar.'],
      ['ta', 'Altitude de transição', 'Até 6000 ft o altímetro usa o ajuste local (QNH) e fala-se em altitude. Acima, todos ajustam 1013 hPa e falam em nível de voo: FL070 é 7000 ft no padrão.'],
      ['pista', 'O começo', 'A saída começa na pista 09. A seta do caminho sai da ponta da pista, no rumo da decolagem.'],
      ['rota', 'Rumo inicial', 'Após decolar, manter 093° até 3000 ft. Só então começa a curva: subir primeiro afasta o avião do chão antes de virar.'],
      ['radial', 'A radial', 'A radial 100 do SAZ é a linha que sai do VOR no rumo magnético 100°. O VOR fica ao sul da pista: a curva à direita leva o avião até a radial, e ele segue por ela se afastando do VOR.'],
      ['fixo', 'O ponto final', 'BOLEX fica na radial 100, a 18 NM do SAZ (D18 no DME). É ali que a SID termina e começa a rota.'],
      ['alt', 'Restrição de altitude', 'O traço embaixo do FL070 quer dizer "no FL070 ou acima". Traço em cima seria "no máximo"; em cima e embaixo, "exatamente".'],
      ['relevo', 'Por que subir rápido', 'Há picos de 4420 e 5900 ft perto da saída. Por isso a carta exige um gradiente mínimo de subida.'],
      ['grad', 'O gradiente de subida', '5,5% quer dizer subir pelo menos 334 ft por milha voada. Em ft/min depende da velocidade: a 120 kt são 668 ft/min. O piloto confere antes de decolar se o avião consegue, com o peso e a temperatura do dia.'],
      ['msa', 'MSA', 'A mesma MSA da aproximação: 7800 ft garante separação de obstáculos num raio de 25 NM do SAZ.'],
    ],
    perguntas: [
      ['Até qual altitude se mantém o rumo 093° depois de decolar?', ['3000 ft', '4500 ft', '6000 ft', 'FL070'], 0, 'Manter 093° até 3000 ft, depois curvar.', 'rota'],
      ['Para que lado é a curva depois dos 3000 ft?', ['Esquerda', 'Direita', 'Não há curva', 'Depende do vento'], 1, 'Curva à DIREITA para interceptar a radial 100.', 'txt'],
      ['Qual radial do SAZ a saída segue até BOLEX?', ['R-093', 'R-100', 'R-273', 'R-072'], 1, 'Radial 100, se afastando do VOR SAZ.', 'radial'],
      ['Como se cruza BOLEX?', ['Exatamente no FL070', 'No FL070 ou acima', 'No máximo no FL070', 'A 6000 ft'], 1, 'O traço embaixo do número quer dizer "ou acima".', 'alt'],
      ['A 120 kt, qual razão de subida mínima garante 5,5%?', ['557 ft/min', '668 ft/min', '780 ft/min', '446 ft/min'], 1, '5,5% a 120 kt são 668 ft/min, como na tabela.', 'grad'],
      ['Subindo, a partir de que altitude você ajusta 1013 hPa?', ['3000 ft', '4500 ft', '6000 ft', '7800 ft'], 2, 'Na altitude de transição, 6000 ft. Acima dela usa-se nível de voo.', 'ta'],
    ] },
];

// ---------- Interface ----------
let atual = CARTAS[0], passo = 0, q = 0, acertos = 0, respondida = false, zoom = false, pronto = false;

function marcar(k) {
  const svg = $('#ctChart svg'); if (!svg) return;
  svg.classList.toggle('is-dim', !!k);
  svg.querySelectorAll('[data-k]').forEach((el) => el.classList.toggle('is-on', el.dataset.k === k));
  // No modo ampliado, rola até a parte destacada
  if (k && zoom) {
    const el = svg.querySelector(`[data-k="${k}"]`), box = $('#ctChart');
    if (el) { const r = el.getBoundingClientRect(), b = box.getBoundingClientRect(); box.scrollBy({ left: r.left + r.width / 2 - (b.left + b.width / 2), behavior: 'smooth' }); }
  }
}
function mostrarPasso() {
  const [k, t, p] = atual.passos[passo];
  $('#ctStepN').textContent = `${passo + 1} de ${atual.passos.length}`;
  $('#ctStepT').textContent = t; $('#ctStepP').textContent = p;
  $('#ctPrev').disabled = passo === 0; $('#ctNext').disabled = passo === atual.passos.length - 1;
  $('#ctDots').innerHTML = atual.passos.map((_, i) => `<i${i === passo ? ' class="on"' : ''}></i>`).join('');
  marcar(k);
}
function mostrarPergunta() {
  const box = $('#ctQuiz');
  if (q >= atual.perguntas.length) {
    box.innerHTML = `<p class="ct-q__res"><b>${acertos} de ${atual.perguntas.length}</b> ${acertos === atual.perguntas.length ? 'Leitura perfeita!' : acertos >= atual.perguntas.length - 2 ? 'Muito bem: revise as que errou no passo a passo.' : 'Volte ao passo a passo e tente de novo.'}</p><button type="button" class="btn-ghost" id="ctAgain">Refazer os exercícios</button>`;
    $('#ctAgain').onclick = () => { q = 0; acertos = 0; mostrarPergunta(); };
    return;
  }
  const [txt, ops] = atual.perguntas[q]; respondida = false;
  box.innerHTML = `<p class="small">Pergunta ${q + 1} de ${atual.perguntas.length}</p><p class="ct-q__t">${esc(txt)}</p>
    <div class="ct-q__ops">${ops.map((o, i) => `<button type="button" data-o="${i}">${esc(o)}</button>`).join('')}</div>
    <p class="ct-q__fb" id="ctFb" hidden></p><button type="button" class="btn" id="ctQNext" hidden>Próxima</button>`;
}
function responder(i) {
  if (respondida) return; respondida = true;
  const [, , certa, expl, k] = atual.perguntas[q], ok = i === certa;
  if (ok) acertos++;
  document.querySelectorAll('#ctQuiz [data-o]').forEach((b) => { const n = +b.dataset.o; b.disabled = true; if (n === certa) b.classList.add('is-ok'); else if (n === i) b.classList.add('is-bad'); });
  const fb = $('#ctFb'); fb.hidden = false; fb.className = 'ct-q__fb ' + (ok ? 'is-ok' : 'is-bad'); fb.innerHTML = `<b>${ok ? 'Certo.' : 'Não é essa.'}</b> ${esc(expl)}`;
  $('#ctQNext').hidden = false; $('#ctQNext').textContent = q === atual.perguntas.length - 1 ? 'Ver resultado' : 'Próxima';
  marcar(k);
}
function abrir(id) {
  atual = CARTAS.find((c) => c.id === id) || CARTAS[0]; passo = 0; q = 0; acertos = 0;
  document.querySelectorAll('#ctPick [data-c]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.c === atual.id)));
  $('#ctChart').innerHTML = atual.svg();
  $('#ctTitle').textContent = { adc: 'Diagrama do aeródromo', iac: 'Aproximação ILS Z RWY 09', sid: 'Saída BOLEX 1A' }[atual.id];
  mostrarPasso(); mostrarPergunta();
}
function init() {
  if (!$('#ctChart') || pronto) return; pronto = true;
  $('#ctPick').innerHTML = CARTAS.map((c) => `<button type="button" data-c="${c.id}" aria-pressed="false"><b>${c.sigla}</b><span>${c.nome}</span></button>`).join('');
  $('#ctPick').addEventListener('click', (e) => { const b = e.target.closest('[data-c]'); if (b) abrir(b.dataset.c); });
  $('#ctPrev').addEventListener('click', () => { if (passo > 0) { passo--; mostrarPasso(); } });
  $('#ctNext').addEventListener('click', () => { if (passo < atual.passos.length - 1) { passo++; mostrarPasso(); } });
  $('#ctZoom').addEventListener('click', () => { zoom = !zoom; $('#ctChart').classList.toggle('is-zoom', zoom); $('#ctZoom').textContent = zoom ? 'Reduzir' : 'Ampliar'; mostrarPasso(); });
  $('#ctQuiz').addEventListener('click', (e) => {
    const b = e.target.closest('[data-o]'); if (b) return responder(+b.dataset.o);
    if (e.target.id === 'ctQNext') { q++; mostrarPergunta(); mostrarPasso(); }
  });
  // Tocar numa parte da carta mostra a explicação dela
  $('#ctChart').addEventListener('click', (e) => {
    const el = e.target.closest('[data-k]'); if (!el) return;
    const i = atual.passos.findIndex(([k]) => k === el.dataset.k); if (i >= 0) { passo = i; mostrarPasso(); }
  });
  abrir('adc');
}
window.Cartas = { init, start: init };
})();
