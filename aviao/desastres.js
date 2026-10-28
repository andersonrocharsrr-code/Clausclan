/* Desastres aéreos: os acidentes da história da aviação, contados com cuidado e com o que se aprendeu
   com cada um. Cada acidente tem ficha, relato, linha do tempo ligada ao mapa da rota e um esquema da falha. */
(() => {
'use strict';
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- Ilustrações do JAL 123 ---------- */
// Mapa esquemático da região de Tóquio (fora de escala), viewBox 360x240
// Mapa da rota sobre imagem de satélite da região de Tóquio (coordenadas da imagem, 1493x2000)
const JAL123_ROTA = 'M1210 1068 C1200 1200 1120 1400 1010 1500 C920 1575 830 1598 755 1595 C660 1590 590 1550 545 1470 C505 1400 488 1340 490 1290 C492 1180 560 1020 668 898 C720 860 830 840 905 848 C960 856 975 910 940 960 C900 1005 820 1010 760 985 C700 960 670 930 660 880 C640 770 610 640 560 520 C510 410 420 320 330 270 L272 238';
// Avião visto de cima (747: quatro motores, asa enflechada), nariz para cima
const AVIAO_TOPO = `<g class="dz-plane">
  <path d="M0 -34 C3.6 -34 5 -27 5 -20 L5 22 L3 31 L0 34 L-3 31 L-5 22 L-5 -20 C-5 -27 -3.6 -34 0 -34Z"/>
  <path d="M5 -6 L36 12 L36 17 L5 8Z M-5 -6 L-36 12 L-36 17 L-5 8Z"/>
  <path d="M3 22 L15 30 L15 33 L3 30Z M-3 22 L-15 30 L-15 33 L-3 30Z"/>
  <rect x="11" y="0" width="4" height="9" rx="2"/><rect x="22" y="6" width="4" height="9" rx="2"/><rect x="-15" y="0" width="4" height="9" rx="2"/><rect x="-26" y="6" width="4" height="9" rx="2"/>
  <path d="M-2.6 -27 C-1.5 -30 1.5 -30 2.6 -27 L2.6 -16 L-2.6 -16Z" class="dz-plane-hump"/></g>`;
function mapaJal123() {
  return `<svg viewBox="0 0 1493 2000" role="img" aria-label="Mapa da rota do voo JAL 123 sobre a região de Tóquio">
    <defs><filter id="dzGlow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <filter id="dzShadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="10" dy="14" stdDeviation="6" flood-color="#000" flood-opacity=".55"/></filter></defs>
    <image href="assets/jal123-mapa.webp" x="0" y="0" width="1493" height="2000" preserveAspectRatio="xMidYMid slice"/>
    <path id="dzPath" d="${JAL123_ROTA}" class="dz-route" filter="url(#dzGlow)"/>
    <g id="dzMarks"></g>
    <g id="dzPlane"><circle r="62" class="dz-plane-halo"/><g transform="scale(1.9)" filter="url(#dzShadow)">${AVIAO_TOPO}</g></g>
  </svg>`;
}
// Esquema do 747 de lado: antepara de pressão traseira, estabilizador vertical e as quatro linhas hidráulicas
function falhaJal123() {
  return `<svg viewBox="0 0 360 160" role="img" aria-label="Esquema da falha: a antepara traseira se rompe, o ar pressurizado arranca a deriva e corta as quatro linhas hidráulicas">
    <rect width="360" height="160" class="hs-sky"/>
    <g class="dz-jet">
      <path d="M14 104 C16 92 30 86 52 84 L64 70 C76 62 96 62 104 74 L300 76 C318 76 330 80 340 92 L344 104 C330 112 312 114 296 114 H40 C26 114 16 110 14 104Z" class="hs-fill-paper2"/>
      <path d="M150 100 L120 140 H138 L196 100Z" class="hs-fill-metal"/>
      <path d="M302 78 L320 66 H332 L322 80Z" class="hs-fill-metal"/>
      ${[70, 84, 98, 112, 126, 140, 154, 168, 182, 196, 210, 224, 238, 252, 266].map((x) => `<rect x="${x}" y="86" width="6" height="5" rx="1.5" class="hs-fill-ink"/>`).join('')}
      <path d="M56 84 C58 78 62 74 68 72 L74 80 Z" class="hs-fill-ink"/>
      <g class="dz-fin"><path d="M296 78 L314 10 H338 L330 78Z" class="hs-fill-metal"/><path d="M314 10 H338" class="hs-line-accent"/></g>
      <path d="M296 78 L301 60 L326 60 L330 78Z" class="hs-fill-metal"/>
      <path d="M284 80 C292 86 292 108 284 112" class="dz-bulk"/>
      ${['#e5322d', '#2fbf4a', '#2456a6', '#f2b33a'].map((c, i) => `<path d="M90 ${96 + i * 3} H300 L${312 + i * 3} ${60 - i * 6}" class="dz-hyd" style="stroke:${c}"/>`).join('')}
      <g class="dz-air">${[0, 1, 2].map((i) => `<path d="M${250 + i * 10} ${98 - i * 4} h18 l-4 -3 m4 3 l-4 3" class="dz-arrow" style="animation-delay:${i * .12}s"/>`).join('')}</g>
      <g class="dz-crack"><path d="M286 88 l4 4 l-3 4 l4 4" class="dz-crack-l"/></g>
    </g>
    <text x="352" y="132" class="dz-map-t" text-anchor="end">Antepara de pressão traseira</text><path d="M284 112 V124" class="hs-line"/>
    <text x="300" y="22" class="dz-map-t" text-anchor="end">Estabilizador vertical (deriva)</text>
    <text x="60" y="152" class="dz-map-t">4 sistemas hidráulicos passavam pela cauda</text>
  </svg>`;
}

// A fugoide: o avião troca altura por velocidade em ondas longas que ninguém consegue amortecer
function fugoideJal123() {
  const onda = 'M10 80 C40 30 70 30 100 80 S160 130 190 80 S250 30 280 80 S340 130 370 80';
  return `<svg viewBox="0 0 360 150" role="img" aria-label="Oscilação fugoide: o avião sobe perdendo velocidade e desce ganhando velocidade, em ondas">
    <rect width="360" height="150" class="hs-sky"/>
    <path d="M0 80 H360" class="dz-axis"/><text x="6" y="74" class="dz-map-s">altitude média</text>
    <path d="${onda}" class="dz-wave"/>
    <text x="40" y="22" class="dz-map-t">sobe: perde velocidade</text><text x="148" y="142" class="dz-map-t">desce: ganha velocidade</text>
    <path d="M55 26 v10 M175 128 v-10" class="hs-line-accent"/>
    <g><path d="M0 -6 L2 -2 L8 1 L8 3 L2 2 L1.5 6 L4 8 L4 9 L0 8 L-4 9 L-4 8 L-1.5 6 L-2 2 L-8 3 L-8 1 L-2 -2Z" transform="rotate(90)" class="dz-plane"/>
      <animateMotion dur="7s" repeatCount="indefinite" rotate="auto" path="${onda}"/></g>
  </svg>`;
}
/* ---------- Ilustrações dos capítulos (viewBox 320x180) ---------- */
const water = (y = 150) => `<g class="hs-water"><path d="M0 ${y} Q20 ${y - 4} 40 ${y} T80 ${y} T120 ${y} T160 ${y} T200 ${y} T240 ${y} T280 ${y} T320 ${y} V180 H0Z" class="hs-fill-water"/><path class="hs-wave" d="M-40 ${y + 10} q10 -3 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0"/></g>`;
const ground = (y = 150) => `<path d="M0 ${y} H320 V180 H0Z" class="hs-fill-ground"/>`;
const mountain = () => `<path d="M150 150 L205 70 L218 82 L232 64 L300 150Z" class="hs-fill-mount"/><path d="M205 70 L218 82 L232 64 L246 84 L236 80 L224 92 L212 84 L196 84Z" class="hs-fill-snow"/>`;
const sun = (x = 262, y = 40) => `<circle cx="${x}" cy="${y}" r="16" class="hs-sun"/>`;
const cloud = (x, y, s = 1, d = 0) => `<g class="hs-drift" style="animation-delay:${d}s"><ellipse cx="${x}" cy="${y}" rx="${22 * s}" ry="${7 * s}" class="hs-cloud"/><ellipse cx="${x + 8 * s}" cy="${y - 6 * s}" rx="${12 * s}" ry="${8 * s}" class="hs-cloud"/></g>`;
const person = (x, y, dress = false, cls = 'hs-fill-ink', d = 0) => `<g class="hs-bob" style="animation-delay:${d}s"><circle cx="${x}" cy="${y - 30}" r="5" class="${cls}"/>${dress ? `<path d="M${x - 5} ${y - 24} H${x + 5} L${x + 10} ${y} H${x - 10}Z" class="${cls}"/>` : `<rect x="${x - 5}" y="${y - 24}" width="10" height="16" rx="3" class="${cls}"/><path d="M${x - 3} ${y - 8} V${y} M${x + 3} ${y - 8} V${y}" class="hs-line-b"/>`}</g>`;
// 747 de lado (nariz à direita); semCauda = depois de perder o estabilizador vertical
const jumbo = (semCauda = false, cls = 'hs-fill-paper2') => `<g><path d="M-70 4 C-60 -6 -40 -8 -10 -8 H40 C52 -8 58 -2 62 4 C58 8 50 10 40 10 H-60 C-66 10 -70 8 -70 4Z" class="${cls}"/><path d="M28 -8 C34 -16 46 -16 54 -4" class="${cls}"/>
  <path d="M-6 6 L-34 26 H-22 L14 6Z" class="hs-fill-ink"/>${semCauda ? '<path d="M-60 -2 L-63 -8 H-57 L-52 -4Z" class="hs-fill-accent"/>' : '<path d="M-58 -2 L-70 -24 H-62 L-46 -6Z" class="hs-fill-accent"/>'}<path d="M-60 6 L-76 12 H-68 L-50 6Z" class="hs-fill-ink"/>
  ${[-40, -28, -16, -4, 8, 20].map((x) => `<rect x="${x}" y="-3" width="5" height="4" rx="1" class="hs-fill-ink"/>`).join('')}</g>`;
const mascara = (x, y, d) => `<g class="px-mask" style="animation-delay:${d}s;transform-origin:${x}px 20px"><path d="M${x} 20 V${y}" class="px-tube"/><path d="M${x - 6} ${y} h12 l-2 9 h-8z" class="px-maskcup"/></g>`;
const ONDA = 'M-10 90 C20 40 50 40 80 90 S140 140 170 90 S230 40 260 90 S320 140 350 90';
const CENAS = {
  haneda: () => `${sun(272, 70)}${cloud(70, 40, 1, 0)}${ground(150)}<rect x="10" y="88" width="180" height="62" class="hs-fill-city"/>${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="${18 + i * 21}" y="98" width="14" height="22" class="hs-win" style="animation-delay:${i * .2}s"/>`).join('')}
    ${[30, 52, 74, 100, 124, 150].map((x, i) => person(x, 150, i % 2 === 1, i % 3 === 0 ? 'hs-fill-ink' : i % 3 === 1 ? 'hs-fill-blue' : 'hs-fill-accent', i * .2)).join('')}
    <g transform="translate(262 126) scale(.75)">${jumbo()}</g>`,
  decolagem: () => `<rect width="320" height="180" class="px-dusk"/>${sun(250, 118)}${mountain()}${water(150)}${cloud(60, 44, 1, 0)}<g class="px-climb">${jumbo()}</g>`,
  estrondo: () => `${cloud(60, 40, 1, 0)}${cloud(250, 150, .9, 2)}<g transform="translate(170 96) scale(1.25)">${jumbo(true)}
    <g class="px-boom"><circle cx="-60" cy="-2" r="14" class="px-burst"/>${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<path d="M${-60 + Math.cos(a * Math.PI / 180) * 16} ${-2 + Math.sin(a * Math.PI / 180) * 16} l${Math.cos(a * Math.PI / 180) * 8} ${Math.sin(a * Math.PI / 180) * 8}" class="hs-line-accent"/>`).join('')}</g>
    <g class="px-finoff"><path d="M-58 -6 L-70 -24 H-62 L-50 -6Z" class="hs-fill-accent"/></g></g>`,
  cabine: () => `<rect width="320" height="180" class="px-cabin"/><path d="M0 20 H320" class="hs-line"/>
    ${[0, 1, 2, 3, 4].map((r) => [0, 1, 2, 3, 4, 5].map((c) => `<g transform="translate(${20 + c * 52 + r * 4} ${70 + r * 18})"><rect x="0" y="0" width="36" height="34" rx="6" class="px-seat"/><circle cx="18" cy="-4" r="7" class="hs-fill-ink"/></g>`).join('')).join('')}
    ${[38, 90, 142, 194, 246, 298].map((x, i) => mascara(x, 52 + (i % 2) * 6, i * .15)).join('')}<g class="px-fog">${cloud(80, 60, 2, 0)}${cloud(220, 90, 2.2, 1)}</g>`,
  painel: () => `<rect width="320" height="180" class="px-panel"/>${[[60, 'HYD 1'], [130, 'HYD 2'], [200, 'HYD 3'], [270, 'HYD 4']].map(([x, n], i) => `<g><circle cx="${x}" cy="80" r="26" class="px-gauge"/><path d="M${x - 18} 98 A26 26 0 1 1 ${x + 18} 98" class="px-arc"/><g class="px-needle" style="transform-origin:${x}px 80px;animation-delay:${i * .25}s"><path d="M${x} 80 L${x} 58" class="px-needle-l"/></g><circle cx="${x}" cy="80" r="3" class="hs-fill-paper"/><text x="${x}" y="124" class="px-gtxt">${n}</text></g>`).join('')}
    ${[40, 90, 140, 190, 240].map((x, i) => `<rect x="${x}" y="146" width="34" height="12" rx="2" class="px-warn" style="animation-delay:${i * .3}s"/>`).join('')}<text x="160" y="24" class="px-radio">"UNCONTROLLABLE"</text>`,
  fugoide: () => `${cloud(70, 30, 1, 0)}${cloud(240, 160, .8, 2)}<path d="M0 90 H320" class="dz-axis"/><path d="${ONDA}" class="dz-wave"/>
    <text x="40" y="34" class="dz-map-t">sobe: perde velocidade</text><text x="150" y="150" class="dz-map-t">desce: ganha velocidade</text>
    <g><g transform="scale(.5)">${jumbo(true, 'hs-fill-ink')}</g><animateMotion dur="6s" repeatCount="indefinite" rotate="auto" path="${ONDA}"/></g>`,
  manetes: () => `<rect width="320" height="180" class="px-panel"/><rect x="90" y="40" width="140" height="110" rx="10" class="px-pedestal"/>
    ${[0, 1, 2, 3].map((i) => `<g class="px-lever" style="animation-delay:${[0, .6, .3, .9][i]}s"><rect x="${112 + i * 28}" y="60" width="8" height="60" rx="3" class="hs-fill-ink"/><rect x="${104 + i * 28}" y="54" width="24" height="12" rx="4" class="px-knob"/></g>`).join('')}
    <text x="160" y="168" class="px-gtxt">OS QUATRO MOTORES · ÚNICO CONTROLE</text>`,
  montanhas: () => `<rect width="320" height="180" class="px-dusk"/><path d="M0 180 L0 120 L40 90 L80 120 L120 70 L170 110 L210 60 L260 108 L300 80 L320 96 V180Z" class="px-ridge"/>
    <g class="hs-shake"><g transform="translate(150 70) scale(.7)">${jumbo(true)}</g></g><text x="246" y="28" class="px-pullup">PULL UP</text>`,
  bilhetes: () => `<rect width="320" height="180" class="px-paperbg"/>${[[50, 40, -8], [140, 60, 5], [230, 36, -3]].map(([x, y, r], i) => `<g class="hs-bob" style="animation-delay:${i * .5}s"><g transform="translate(${x} ${y}) rotate(${r})"><rect width="70" height="90" rx="3" class="px-note"/>${[16, 28, 40, 52, 64].map((yy) => `<path d="M10 ${yy} q12 -3 24 0 t26 0" class="px-ink"/>`).join('')}</g></g>`).join('')}`,
  noite: () => `<rect width="320" height="180" class="px-night"/>${[[30, 20], [90, 36], [150, 14], [210, 30], [280, 18], [250, 50]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="1.4" class="px-star" style="animation-delay:${i * .3}s"/>`).join('')}
    <path d="M0 180 L0 130 L60 100 L110 126 L170 84 L230 120 L280 100 L320 112 V180Z" class="px-ridge-n"/><g class="px-fire"><ellipse cx="170" cy="92" rx="14" ry="7" class="px-glow"/><path d="M164 92 q4 -12 6 -2 q3 -10 6 2z" class="px-flame"/></g>
    <g><g transform="scale(.32)">${jumbo(false, 'px-c130')}</g><animateMotion dur="9s" repeatCount="indefinite" rotate="auto" path="M170 40 a80 22 0 1 1 -1 0"/></g><text x="12" y="170" class="px-gtxt" style="text-anchor:start">C-130 DA BASE DE YOKOTA</text>`,
  lupa: () => `${water(150)}<g class="hs-float"><path d="M30 146 L44 112 H60 L52 146Z" class="hs-fill-accent"/></g><text x="22" y="104" class="dz-map-t">pedaço da cauda no mar</text>
    <circle cx="210" cy="78" r="64" class="px-dome"/>${Array.from({ length: 9 }, (_, i) => `<circle cx="${170 + i * 10}" cy="78" r="2" class="hs-fill-ink"/>`).join('')}
    <path d="M182 78 l-5 9 l4 6 l-5 8 M202 78 l4 -8 l-3 -6 l4 -7 M222 78 l-3 9 l5 5" class="px-crack"/>
    <g class="px-scan"><circle cx="196" cy="80" r="26" class="px-lens"/><path d="M214 98 L240 124" class="px-handle"/></g>`,
  emenda: () => `<circle cx="160" cy="90" r="74" class="px-dome"/>${Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return `<path d="M160 90 L${160 + 74 * Math.cos(a)} ${90 + 74 * Math.sin(a)}" class="px-rib"/>`; }).join('')}
    <rect x="100" y="104" width="54" height="18" class="px-plate"/><rect x="156" y="104" width="54" height="18" class="px-plate"/>
    ${Array.from({ length: 13 }, (_, i) => `<circle cx="${104 + i * 8.5}" cy="113" r="1.8" class="hs-fill-ink"/>`).join('')}
    <path d="M118 113 l-6 10 l4 6 l-5 9" class="px-crack"/><path d="M190 113 l5 -9 l-3 -6 l5 -8" class="px-crack" style="animation-delay:.6s"/>
    <text x="160" y="176" class="px-gtxt px-gtxt--ink">PLACA CORTADA EM DUAS · 1 FILEIRA DE REBITES, NÃO 2</text>`,
  memoria: () => `<rect width="320" height="180" class="px-dusk"/><path d="M0 180 L0 120 L70 80 L130 110 L190 70 L250 104 L320 86 V180Z" class="px-ridge"/>
    <path d="M40 180 C90 150 140 140 180 120 S240 100 270 96" class="px-trail"/>
    ${[[70, 160], [110, 146], [150, 132], [190, 118], [228, 106], [262, 98]].map(([x, y], i) => `<g><rect x="${x - 4}" y="${y - 12}" width="8" height="12" rx="2" class="px-lantern"/><circle cx="${x}" cy="${y - 6}" r="5" class="px-lamp" style="animation-delay:${i * .25}s"/></g>`).join('')}
    <text x="160" y="24" class="px-gtxt px-gtxt--ink">520 VIDAS · 12 DE AGOSTO DE 1985</text>`,
};
/* ---------- Os acidentes ---------- */
const ACIDENTES = [
  {
    id: 'jal123', ano: 1985, data: '12 de agosto de 1985', titulo: 'Japan Air Lines 123', sub: 'O pior acidente com um único avião da história',
    resumo: 'Um Boeing 747 lotado perde a cauda e todos os comandos sobre o Japão. Por 32 minutos, três pilotos tentam o impossível: voar só com os motores, enquanto o avião sobe, despenca e balança sem parar.',
    ficha: [['Avião', 'Boeing 747SR-46'], ['Matrícula', 'JA8119'], ['Rota', 'Tóquio (Haneda) → Osaka (Itami)'], ['Local', 'Cume Osutaka, Gunma, Japão'],
      ['A bordo', '524 (509 passageiros e 15 tripulantes)'], ['Mortos', '520'], ['Sobreviventes', '4'], ['Causa', 'Reparo malfeito na antepara de pressão traseira']],
    numeros: [['524', 'a bordo'], ['520', 'mortos'], ['4', 'sobreviventes'], ['32 min', 'de luta sem comandos']],
    partes: ['Antes do voo', 'A emergência', '32 minutos', 'Depois', 'Causas e consequências'],
    secoes: [
  { t: "Véspera do Obon", parte: 0, hora: "17h40", lugar: "Aeroporto de Haneda, Tóquio", sabia: "O Obon acontece em meados de agosto e é uma das épocas de maior movimento nos trens, estradas e aeroportos do Japão.", cena: CENAS.haneda,
    p: ["Segunda-feira, 12 de agosto de 1985. Fazia calor em Tóquio, aquele calor úmido de fim de verão, e o Japão inteiro estava pegando a estrada para o Obon, o feriado em que as famílias voltam às cidades natais para visitar os pais e honrar os antepassados. Trens lotados, estradas paradas, aeroportos cheios.", "No saguão de Haneda, a fila do balcão da Japan Air Lines misturava gente de todo tipo: executivos de terno que tinham emendado o trabalho com a folga, mães com crianças pequenas no colo, avós voltando de uma visita aos netos, estudantes carregando sacolas de presentes. No Japão, quem viaja leva sempre uma lembrancinha da cidade de onde vem, o omiyage, e muitas mãos seguravam caixinhas embrulhadas com capricho.", "O voo 123 para Osaka era uma das rotas mais curtas e comuns do país, cerca de uma hora no ar. Uma ponte aérea. Para muita gente, mais rápida e mais confortável que o trem-bala naquela véspera de feriado. O avião estava praticamente lotado: 509 passageiros.", "Era um Boeing 747SR, a versão de \"curto alcance\" feita para o Japão, reforçada para decolar e pousar muitas vezes por dia. Aquele, o JA8119, já tinha mais de 18.000 voos. Na cabine, três homens experientes: o primeiro-oficial Yutaka Sasaki, em treinamento para comandante, pilotava do assento da esquerda; ao lado dele, o comandante Masami Takahama, instrutor, com mais de 12.000 horas de voo; atrás, o engenheiro de voo Hiroshi Fukuda."] },
  { t: "Rumo ao pôr do sol", parte: 0, hora: "18h12", lugar: "Sobre a baía de Tóquio", sabia: "O 747SR tinha mais assentos que o 747 comum: era feito para as rotas curtas e lotadas dentro do Japão.", cena: CENAS.decolagem,
    p: ["O embarque terminou com algum atraso. As portas se fecharam, os comissários mostraram como usar o cinto e as máscaras de oxigênio, como fazem em todo voo, e muita gente nem prestou atenção. Era só mais uma viagem.", "Às 18h12, com 12 minutos de atraso, o 747 acelerou na pista de Haneda e subiu sobre a baía de Tóquio. Lá embaixo, os navios pareciam brinquedos e a cidade começava a acender as primeiras luzes. O avião fez a curva para o oeste, na direção do sol, que já estava baixo no horizonte e pintava as janelas de laranja.", "Quem estava do lado direito talvez tenha visto, ao longe, a silhueta do monte Fuji contra o céu do entardecer. Crianças grudavam o rosto nas janelas. Casais conversavam sobre os planos para o feriado. Alguns passageiros já cochilavam, cansados do dia, outros folheavam a revista de bordo. O ronco dos quatro motores era constante e tranquilizador.", "Na cabine de comando, a rotina de sempre: recolher o trem de pouso, recolher os flapes, conferir o checklist depois da decolagem, conversar com o controle de Tóquio, pedir para subir mais. Tudo normal. Lá atrás, os comissários se levantaram e começaram a preparar os carrinhos do serviço de bordo. Em menos de uma hora todos estariam em Osaka, a tempo do jantar com a família."] },
  { t: "18h24: o estrondo", parte: 1, hora: "18h24", lugar: "Baía de Sagami, 24.000 pés", sabia: "A névoa da descompressão é condensação: o ar da cabine se expande, esfria de repente e a umidade vira neblina.", cena: CENAS.estrondo,
    p: ["Doze minutos depois da decolagem, o avião ainda subia, a cerca de 24.000 pés (7.300 m) sobre a baía de Sagami, ao sul de Tóquio. Então, às 18h24, veio um estrondo seco, vindo de trás.", "Em um instante a cabine se encheu de uma névoa branca. Não era fumaça: quando a pressão cai de repente, o ar esfria e a umidade vira neblina. Os ouvidos doeram, papéis voaram e as máscaras amarelas de oxigênio caíram do teto. Uma voz gravada começou a repetir, em japonês e em inglês, que era uma emergência.", "Lá atrás, a antepara de pressão traseira, a \"tampa\" em forma de cúpula que fecha a cabine na cauda, tinha se partido. O ar da cabine, mais pressurizado que o ar lá fora, explodiu para dentro da cauda, que não era feita para aguentar aquilo. Em frações de segundo, a maior parte do estabilizador vertical, a grande barbatana da cauda, foi arrancada e caiu no mar."] },
  { t: "Na cabine de passageiros", parte: 1, hora: "18h25", lugar: "Cabine de passageiros", sabia: "As máscaras de oxigênio dos passageiros duram poucos minutos, o tempo de o avião descer a uma altitude onde se respira sem ajuda.", cena: CENAS.cabine,
    p: ["Os comissários correram pelos corredores ajudando as pessoas a colocar as máscaras, mostrando como apertar o cinto e como se curvar para a frente, a posição de impacto. Muita gente achou que era um susto que ia passar. O avião, afinal, continuava voando.", "Mas logo o 747 começou a se mexer de um jeito que ninguém ali tinha sentido: balançava de um lado para o outro e subia e descia em ondas longas, como um barco num mar agitado. Segundo uma das sobreviventes, uma comissária da JAL que viajava de folga, uma parte do teto perto dos banheiros do fundo tinha se aberto.", "Um passageiro chegou a fotografar a cabine com as máscaras penduradas e as pessoas sentadas, assustadas mas quietas. As fotos foram encontradas anos depois, no filme da câmera dele, e estão entre as imagens mais impressionantes da história da aviação."] },
  { t: "\"Uncontrollable\"", parte: 1, hora: "18h27", lugar: "Cabine de comando", sabia: "7700 é o código universal de emergência do transponder: no radar, o avião passa a aparecer destacado para todos os controladores.", cena: CENAS.painel,
    p: ["Na cabine de comando, os alarmes tocavam. Os pilotos primeiro pensaram que uma das portas do fundo tinha se aberto. Acionaram o código 7700 de emergência e pediram ao controle de Tóquio para voltar a Haneda.", "Foi então que o engenheiro de voo leu os mostradores e deu a pior notícia possível: a pressão hidráulica estava caindo. Os quatro sistemas hidráulicos do 747, os \"músculos\" que movem os lemes, os ailerons e os profundores, tinham as linhas passando pela cauda. Todas foram cortadas, e o fluido vazou em poucos minutos.", "O comandante girava o manche e nada acontecia. O avião simplesmente não obedecia. Quando o controlador pediu para virarem, a resposta pelo rádio foi uma palavra só: \"Uncontrollable\". Incontrolável.", "Percebendo a situação, o controlador fez algo raro: liberou a tripulação para falar em japonês em vez do inglês padrão da aviação, para que eles não perdessem nenhum segundo traduzindo. Os outros aviões foram afastados da frequência.", "A investigação observou depois que os pilotos não colocaram as próprias máscaras de oxigênio. A 24.000 pés, a falta de ar pode ter atrapalhado o raciocínio nos primeiros minutos, justamente os mais críticos."] },
  { t: "A montanha-russa: fugoide e dutch roll", parte: 2, hora: "18h30", lugar: "Sobre a península de Izu", sabia: "Num avião normal, a fugoide é tão lenta e suave que o piloto corrige sem perceber. O que tornou o JAL 123 terrível foi não haver comandos para amortecê-la.", cena: CENAS.fugoide,
    p: ["Sem a deriva e sem comandos, o 747 entrou em dois movimentos que normalmente o próprio avião e os pilotos corrigem sem que ninguém perceba.", "O primeiro foi a fugoide. Funciona como uma gangorra entre altura e velocidade: o nariz sobe, o avião ganha altura mas perde velocidade; com menos velocidade, as asas sustentam menos e o nariz cai; descendo, ele ganha velocidade, a sustentação volta e o nariz sobe de novo. O ciclo se repete, e cada onda pode levar mais de um minuto. Num avião normal, os profundores amortecem isso. No JAL 123, sem hidráulico, ninguém conseguia parar a gangorra. Por dentro, era como estar num elevador que sobe e despenca sem parar.", "O segundo foi o dutch roll: o avião guinava para um lado, inclinava as asas, guinava para o outro, num balanço em forma de \"S\" deitado. Quem amortece esse movimento é justamente o estabilizador vertical, e ele não existia mais.", "Os dois movimentos juntos faziam o avião subir, cair e balançar ao mesmo tempo. Para os passageiros, eram 30 minutos de enjoo, medo e incerteza."] },
  { t: "Pilotando com os motores", parte: 2, hora: "18h40", lugar: "Rumo ao norte, sobre Yamanashi", sabia: "Em 1989, a tripulação do voo United 232, em Sioux City, nos Estados Unidos, também perdeu todo o hidráulico e usou só os motores para chegar a uma pista.", cena: CENAS.manetes,
    p: ["Sem nenhum comando, sobrava uma única ferramenta: os quatro motores. A tripulação começou a mexer nas manetes de um jeito que nenhum manual ensinava. Mais potência para o nariz subir, menos potência para descer, mais força de um lado que do outro para tentar virar.", "Funcionou, em parte. Era como dirigir um carro sem volante, usando só o acelerador e a diferença de força entre as rodas. Às 18h40, baixaram o trem de pouso pelo sistema alternativo, que solta as rodas pela gravidade. O arrasto das rodas ajudou a amortecer as oscilações e deixou o avião um pouco mais estável.", "A base aérea americana de Yokota, a oeste de Tóquio, avisou que estava pronta para recebê-los. Mas fazer um 747 sem comandos acertar uma pista era quase impossível, e o avião foi sendo levado para o noroeste, em direção às montanhas de Gunma."] },
  { t: "Os últimos minutos", parte: 2, hora: "18h56", lugar: "Montanhas de Gunma", sabia: "O GPWS, o sistema de alerta de proximidade do solo, avisa com voz e luz quando o avião está perigosamente perto do terreno.", cena: CENAS.montanhas,
    p: ["O avião perdeu milhares de pés numa descida longa e chegou perto de montanhas mais altas que ele. Com os motores no máximo, a tripulação conseguiu fazê-lo subir de novo. Na gravação da cabine, ouve-se o comandante repetindo para levantar o nariz, a voz cada vez mais tensa.", "Em certo momento ele disse: \"Isto pode não ter jeito\". Mesmo assim, os três não pararam. Ajustavam as manetes, liam os instrumentos e trocavam informações até o último segundo.", "Nos minutos finais, o alarme de proximidade do solo começou a gritar \"pull up\", \"pull up\". Às 18h56, depois de 32 minutos sem comandos, a ponta da asa direita tocou as árvores de uma crista, o avião virou e bateu no terreno perto do Cume Osutaka, na província de Gunma, a cerca de 100 km de Tóquio. Ele se partiu e pegou fogo."] },
  { t: "Bilhetes de despedida", parte: 3, hora: "18h56", lugar: "Os bilhetes", sabia: "Os bilhetes escritos durante a descida foram entregues às famílias e se tornaram um dos símbolos da memória do voo 123 no Japão.", cena: CENAS.bilhetes,
    p: ["Durante aquela meia hora, alguns passageiros entenderam o que estava acontecendo e escreveram mensagens para quem ficava. Em agendas, cartões e no verso de envelopes, com a letra tremida pelo balanço do avião.", "Um pai escreveu aos filhos pedindo que fossem bons e cuidassem da mãe. Outros só deixaram \"obrigado\" e \"adeus\". Os bilhetes foram encontrados nos destroços e entregues às famílias. Até hoje são lembrados no Japão como o retrato mais humano da tragédia.", "Entre as 520 vítimas estava Kyu Sakamoto, cantor de \"Ue o Muite Arukō\", a música conhecida no mundo como \"Sukiyaki\", que em 1963 chegou ao primeiro lugar nos Estados Unidos."] },
  { t: "A noite na montanha", parte: 3, hora: "19h15", lugar: "Cume Osutaka, Gunma", sabia: "O local do acidente fica numa área de montanha, sem estrada: as equipes tiveram de chegar pela floresta, em terreno muito íngreme.", cena: CENAS.noite,
    p: ["Cerca de 20 minutos depois da queda, a tripulação de um avião C-130 da Força Aérea americana, da base de Yokota, viu os destroços em chamas na encosta e passou a posição. Um helicóptero americano chegou a ser mandado, mas a ajuda não foi aceita. As equipes japonesas só chegaram ao local na manhã seguinte, mais de 12 horas depois.", "Lá encontraram quatro sobreviventes, todas mulheres, entre elas a comissária de folga e uma menina de 12 anos. Elas contaram que, durante a noite, ouviram outras pessoas vivas chamando e gemendo nos destroços, vozes que foram se calando até o amanhecer. Médicos disseram depois que mais gente poderia ter sido salva se o resgate tivesse chegado antes."] },
  { t: "A investigação", parte: 4, hora: "1985–87", lugar: "Comissão de investigação", sabia: "O NTSB, que participou da investigação, é a agência americana que investiga acidentes de avião, trem, navio e estrada.", cena: CENAS.lupa,
    p: ["A investigação ficou a cargo da Comissão de Investigação de Acidentes Aeronáuticos do Japão, com a participação do NTSB, a agência americana de segurança nos transportes, e de engenheiros da Boeing.", "Partes da cauda foram encontradas boiando na baía de Sagami, exatamente por onde o avião passava às 18h24. Era a prova de que o problema tinha começado lá atrás, em pleno voo, e não na queda.", "Nos destroços, os investigadores examinaram a antepara traseira de perto, com lupas e microscópios. Ao longo de uma emenda, encontraram rachaduras de fadiga que tinham crescido aos poucos, voo após voo, em volta dos furos dos rebites. Seguindo essas marcas, chegaram a um conserto feito sete anos antes.", "O relatório final, publicado em junho de 1987, concluiu que a antepara cedeu por causa de um reparo malfeito em 1978. A Boeing assumiu a responsabilidade pelo erro."] },
  { t: "O improviso de 1978", parte: 4, hora: "1978", lugar: "Aeroporto de Osaka", sabia: "A antepara traseira fecha a cabine pressurizada como a tampa de uma garrafa térmica. A cada voo, ela é empurrada pela pressão e relaxa de novo no pouso.", cena: CENAS.emenda,
    p: ["Em 2 de junho de 1978, o JA8119 bateu a cauda na pista ao pousar em Osaka. A traseira da fuselagem e a antepara de pressão foram danificadas. Para consertar, a JAL contratou uma equipe de reparo de emergência da própria Boeing, aquelas que viajam para colocar um avião danificado de volta em serviço.", "A equipe trocou a metade de baixo da antepara. Mas a peça nova não ficou bem alinhada com a parte antiga: num trecho, as fileiras de rebites ficavam perto demais da borda da chapa. Para fazer a emenda caber, cortaram a placa de reforço em duas. Foi um improviso, uma \"gambiarra\" fora das instruções de reparo.", "Com isso, num trecho a junção ficou presa por uma fileira só de rebites, quando deviam ser duas. A peça passou a ter cerca de 70% da resistência à fadiga prevista. E, como as placas sobrepostas escondiam o defeito, as inspeções da JAL nunca o encontraram.", "Muita gente atribui o improviso à pressa de devolver o avião ao serviço, já que um 747 parado no chão custa caro todos os dias. A investigação oficial, porém, não chegou a essa conclusão: ela apontou o corte da placa, mas não o motivo da pressa. O que se sabe é que o erro ficou ali, escondido, por mais de 12.000 voos."] },
  { t: "As consequências", parte: 4, hora: "1985", lugar: "Tóquio", sabia: "Desde 2006, funcionários da JAL visitam o Centro de Promoção da Segurança, onde estão a antepara rompida e partes do JA8119, para nunca esquecer o que aconteceu.", cena: CENAS.memoria,
    p: ["O presidente da Japan Air Lines, Yasumoto Takagi, assumiu publicamente a responsabilidade, pediu perdão às famílias, visitou parentes das vítimas e renunciou ao cargo poucas semanas depois do acidente.", "O peso da tragédia caiu também sobre quem cuidava da manutenção. Hiroo Tominaga, gerente de manutenção da JAL, tirou a própria vida e deixou um bilhete dizendo que se redimia com a morte. O reparo de 1978 em si tinha sido feito pela equipe da Boeing, não por ele.", "A Boeing reconheceu que o erro era dela. A JAL pagou indenizações e \"dinheiro de condolências\" às famílias, como manda a tradição japonesa.", "O voo 123 mudou a forma como a aviação trata um conserto na estrutura: ele passou a ser visto como uma peça nova do avião, que precisa ser conferida e acompanhada pelo resto da vida dele."] },
    ],
    linha: [['18:12', 'Decolagem de Haneda, Tóquio.', [1210, 1068]], ['18:24', 'Estrondo a cerca de 24.000 pés sobre a baía de Sagami: a antepara traseira se rompe e o avião perde a deriva e os quatro sistemas hidráulicos.', [755, 1595]],
      ['18:25', 'Código 7700 de emergência. A tripulação pede para voltar a Haneda.', [640, 1580]], ['18:40', 'O trem de pouso é baixado por gravidade e ajuda a amortecer as oscilações.', [490, 1290]],
      ['18:47', 'A base de Yokota oferece pouso, mas o avião, quase sem controle, dá uma volta e segue rumo às montanhas.', [668, 898]], ['18:56', 'Queda perto do Cume Osutaka, em Gunma.', [272, 238]]],
    falha: 'Ponto de partida: a antepara rompida deixou o ar pressurizado da cabine invadir a cauda. A pressão arrancou a deriva e cortou as quatro linhas hidráulicas de uma vez.',
    mudou: ['A Boeing modificou o 747: instalou uma tampa que impede o ar da cabine de entrar na cauda se a antepara falhar e válvulas que seguram o fluido hidráulico se as linhas da cauda forem cortadas.',
      'Reparos estruturais passaram a ser vistos como pontos críticos de inspeção, verificados de novo ao longo da vida do avião.',
      'Pesquisas sobre como controlar um avião só com os motores ganharam força, como o projeto PCA da NASA, nos anos 1990.',
      'Em 2006 a JAL abriu o Centro de Promoção da Segurança, em Tóquio, onde a antepara rompida e partes do avião são mostradas a todos os funcionários.'],
    memoria: 'Todo dia 12 de agosto, familiares das vítimas sobem a trilha até o Cume Osutaka para lembrar os 520 que morreram. A JAL deixou de usar o número 123 nos seus voos.',
    fontes: [['Wikipedia: Japan Air Lines Flight 123', 'https://en.wikipedia.org/wiki/Japan_Air_Lines_Flight_123'], ['Britannica: Japan Airlines flight 123', 'https://www.britannica.com/event/Mount-Osutaka-airline-disaster'],
      ['Nippon.com: Japan’s Deadliest Air Disaster', 'https://www.nippon.com/en/guide-to-japan/cs00019/'], ['Admiral Cloudberg: Fire on the Mountain', 'https://admiralcloudberg.medium.com/fire-on-the-mountain-the-crash-of-japan-airlines-flight-123-dadebd321224']],
    mapa: mapaJal123, esquema: falhaJal123, fugoide: fugoideJal123,
    fugoideTxt: 'Sem os profundores, cada subida custava velocidade e cada descida a devolvia. O 747 ficou preso nessa gangorra, subindo e descendo centenas de metros por vez, enquanto o dutch roll o balançava de lado.',
  },
];

/* ---------- Tela ---------- */
let atual = ACIDENTES[0], passo = ACIDENTES[0].linha.length - 1, tocando = 0;

function lista() {
  $('#dzList').innerHTML = ACIDENTES.map((a) => `<button type="button" class="dz-item" data-dz="${a.id}" aria-pressed="${a === atual}">
      <span class="dz-item__year">${a.ano}</span><b>${esc(a.titulo)}</b><span>${esc(a.sub)}</span><i>${a.numeros[1][0]} mortos · ${a.numeros[2][0]} sobreviventes</i></button>`).join('')
    + '<p class="dz-soon small">Novos acidentes serão adicionados aqui, dos primeiros anos da aviação até hoje.</p>';
}

function mostrar() {
  const a = atual;
  $('#dzTitle').textContent = a.titulo;
  $('#dzDate').textContent = a.data;
  $('#dzSub').textContent = a.resumo;
  $('#dzNums').innerHTML = a.numeros.map(([n, l]) => `<div><b>${esc(n)}</b><span>${esc(l)}</span></div>`).join('');
  $('#dzFicha').innerHTML = a.ficha.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
  cap = 0; montarCapitulos();
  $('#dzMap').innerHTML = a.mapa();
  $('#dzFail').innerHTML = a.esquema();
  $('#dzFailTxt').textContent = a.falha;
  $('#dzPhugBox').hidden = !a.fugoide;
  if (a.fugoide) { $('#dzPhug').innerHTML = a.fugoide(); $('#dzPhugTxt').textContent = a.fugoideTxt; }
  $('#dzChanged').innerHTML = a.mudou.map((m) => `<li>${esc(m)}</li>`).join('');
  $('#dzMemory').textContent = a.memoria;
  $('#dzSrc').innerHTML = a.fontes.map(([n, u]) => `<a href="${u}" target="_blank" rel="noopener">${esc(n)}</a>`).join(' · ');
  // Marcas dos eventos sobre a rota
  const path = $('#dzPath'), L = path.getTotalLength();
  a.fr = a.linha.map(([, , v]) => fracDe(path, v));
  $('#dzMarks').innerHTML = a.fr.map((f, i) => { const p = path.getPointAtLength(L * f); return `<g class="dz-mark" data-i="${i}"><circle cx="${p.x}" cy="${p.y}" r="16"/></g>`; }).join('');
  $('#dzLine').innerHTML = a.linha.map(([h, t], i) => `<li><button type="button" data-i="${i}"><b>${h}</b><span>${esc(t)}</span></button></li>`).join('');
  irPara(a.linha.length - 1, false);
}

// Move o avião no mapa até o evento i da linha do tempo
// Posição de um evento ao longo da rota (0 a 1): número pronto ou o ponto [x, y] mais próximo do traçado
function fracDe(path, v) {
  if (typeof v === 'number') return v;
  const L = path.getTotalLength(); let melhor = 0, dmin = Infinity;
  for (let k = 0; k <= 600; k++) { const q = path.getPointAtLength(L * k / 600), d = (q.x - v[0]) ** 2 + (q.y - v[1]) ** 2; if (d < dmin) { dmin = d; melhor = k / 600; } }
  return melhor;
}
function irPara(i, animar = true) {
  passo = i;
  const a = atual, path = $('#dzPath'), L = path.getTotalLength(), plane = $('#dzPlane');
  const alvo = a.fr[i], de = animar ? (Number(plane.dataset.f) || 0) : alvo;
  cancelAnimationFrame(tocando);
  const t0 = performance.now(), dur = animar ? 900 + Math.abs(alvo - de) * 1800 : 0;
  const frame = (now) => {
    const k = dur ? Math.min(1, (now - t0) / dur) : 1, e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, f = de + (alvo - de) * e;
    const p = path.getPointAtLength(L * f), q = path.getPointAtLength(Math.min(L, L * f + 6)), r = path.getPointAtLength(Math.max(0, L * f - 6));
    const ang = Math.atan2(q.y - r.y, q.x - r.x) * 180 / Math.PI + 90;
    plane.setAttribute('transform', `translate(${p.x} ${p.y}) rotate(${ang})`); plane.dataset.f = f;
    path.style.strokeDasharray = `${L * f} ${L}`;
    if (k < 1) tocando = requestAnimationFrame(frame);
  };
  tocando = requestAnimationFrame(frame);
  document.querySelectorAll('#dzLine button').forEach((b, j) => { b.classList.toggle('is-past', j < i); if (j === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
  document.querySelectorAll('#dzMarks .dz-mark').forEach((m, j) => m.classList.toggle('is-on', j <= i));
  $('#dzPlay').textContent = i === a.linha.length - 1 ? 'Reproduzir o voo' : 'Próximo evento';
}

let auto = 0;
function reproduzir() {
  clearTimeout(auto);
  const n = atual.linha.length;
  if (passo === n - 1) { irPara(0); auto = setTimeout(seguir, 2600); } else seguir();
}
function seguir() {
  clearTimeout(auto);
  if (passo < atual.linha.length - 1) { irPara(passo + 1); if (passo < atual.linha.length - 1) auto = setTimeout(seguir, 3200); }
}


/* ---------- O relato em capítulos, como no Modo história ---------- */
let cap = 0;
function montarCapitulos() {
  const a = atual;
  $('#dzhParts').innerHTML = a.partes.map((p, i) => `<button type="button" aria-pressed="false"><b>${i + 1}</b>${esc(p)}</button>`).join('');
  $('#dzhLine').innerHTML = a.secoes.map((c, i) => `<button type="button" aria-label="Capítulo ${i + 1}: ${esc(c.hora)}, ${esc(c.t)}"><span>${esc(c.hora)}</span></button>`).join('');
  $('#dzhLine').style.gridTemplateColumns = `repeat(${a.secoes.length}, minmax(0, 1fr))`;
  capitulo(0);
}
function capitulo(dir = 0) {
  const a = atual, c = a.secoes[cap], card = $('#dzhCard');
  card.classList.remove('is-next', 'is-prev'); void card.offsetWidth;
  if (dir) card.classList.add(dir > 0 ? 'is-next' : 'is-prev');
  $('#dzhPart').textContent = `Parte ${c.parte + 1} · ${a.partes[c.parte]}`;
  $('#dzhCount').textContent = `Capítulo ${cap + 1} de ${a.secoes.length}`;
  $('#dzhYear').textContent = c.hora;
  $('#dzhPlace').textContent = c.lugar;
  $('#dzhTitle').textContent = c.t;
  $('#dzhText').innerHTML = c.p.map((p) => `<p>${esc(p)}</p>`).join('');
  $('#dzhFact').textContent = c.sabia;
  $('#dzhScene').innerHTML = `<svg viewBox="0 0 320 180" role="img" aria-label="Ilustração: ${esc(c.t)}"><rect width="320" height="180" class="hs-sky"/>${c.cena()}</svg>`;
  $('#dzhPrev').disabled = cap === 0;
  $('#dzhNext').textContent = cap === a.secoes.length - 1 ? 'Ver o que falhou e o que mudou' : 'Próximo capítulo';
  document.querySelectorAll('#dzhParts button').forEach((b, i) => b.setAttribute('aria-pressed', String(i === c.parte)));
  document.querySelectorAll('#dzhLine button').forEach((b, i) => {
    b.classList.toggle('is-done', i < cap);
    if (i === cap) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
  });
  $('#dzhLine').style.setProperty('--hs-p', a.secoes.length > 1 ? cap / (a.secoes.length - 1) : 0);
}
function irCap(i) {
  const n = atual.secoes.length;
  if (i < 0 || i >= n) return;
  const d = Math.sign(i - cap); cap = i; capitulo(d || 1);
  const topo = $('#dzhCard').getBoundingClientRect().top;
  if (topo < 0) $('#dzhCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function initCap() {
  $('#dzhParts').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) irCap(atual.secoes.findIndex((c) => c.parte === [...b.parentNode.children].indexOf(b))); });
  $('#dzhLine').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) irCap([...b.parentNode.children].indexOf(b)); });
  $('#dzhPrev').addEventListener('click', () => irCap(cap - 1));
  $('#dzhNext').addEventListener('click', () => { if (cap === atual.secoes.length - 1) $('#dzFailBox').scrollIntoView({ behavior: 'smooth', block: 'start' }); else irCap(cap + 1); });
  let sx = null;
  const sc = $('#dzhScene');
  sc.addEventListener('pointerdown', (e) => { sx = e.clientX; });
  sc.addEventListener('pointerup', (e) => { if (sx === null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 50) irCap(cap + (dx < 0 ? 1 : -1)); });
}
function init() {
  if (!$('#dzList')) return;
  lista();
  $('#dzList').addEventListener('click', (e) => { const b = e.target.closest('[data-dz]'); if (!b) return; atual = ACIDENTES.find((a) => a.id === b.dataset.dz) || atual; lista(); mostrar(); $('#dzCase').scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  $('#dzLine').addEventListener('click', (e) => { const b = e.target.closest('button[data-i]'); if (b) { clearTimeout(auto); irPara(+b.dataset.i); } });
  $('#dzPlay').addEventListener('click', reproduzir);
  initCap();
}
let pronto = false;
function start() { if (!pronto) { pronto = true; mostrar(); } }
window.Desastres = { init, start };
})();
