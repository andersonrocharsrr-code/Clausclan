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
    <mask id="dzReveal" maskUnits="userSpaceOnUse" x="0" y="0" width="1493" height="2000"><path id="dzRevealPath" d="${JAL123_ROTA}" fill="none" stroke="#fff" stroke-width="40" stroke-linecap="round" stroke-linejoin="round"/></mask>
    <path id="dzPath" d="${JAL123_ROTA}" class="dz-route"/>
    <path d="${JAL123_ROTA}" class="dz-route-dash" mask="url(#dzReveal)"/>
    <g class="dz-labels">
      <text x="1150" y="1010" text-anchor="middle">Haneda</text><text x="1150" y="1048" text-anchor="middle" class="dz-lbl-s">(Tóquio)</text>
      <text x="1470" y="1380" text-anchor="end" class="dz-lbl-w">Baía de Tóquio</text>
      <text x="820" y="1680" text-anchor="middle" class="dz-lbl-w">Baía de Sagami</text>
      <text x="440" y="1760" text-anchor="middle">Península de Izu</text>
      <text x="250" y="1230" text-anchor="middle">Monte Fuji</text>
      <circle cx="706" cy="842" r="12" class="dz-dot"/><text x="690" y="855" text-anchor="end">Base de Yokota</text>
      <text x="300" y="480" text-anchor="middle">Montanhas de Gunma</text>
      <text x="240" y="170" text-anchor="middle">Cume Osutaka</text>
    </g>
    <g id="dzMarks"></g>
    <path d="M206 196 l48 48 M254 196 l-48 48" class="dz-x"/>
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
/* ---------- Ilustrações do AF 447 ---------- */
// A330 de lado, nariz para a direita: dois motores, sem a corcova do 747
const a330 = (cls = 'hs-fill-paper2') => `<g><path d="M-70 4 C-60 -5 -40 -6 -10 -6 H40 C52 -6 58 -2 62 4 C58 8 50 10 40 10 H-60 C-66 10 -70 8 -70 4Z" class="${cls}"/>
  <path d="M-6 6 L-30 24 H-20 L12 6Z" class="hs-fill-ink"/><rect x="-16" y="10" width="18" height="7" rx="3.5" class="hs-fill-metal"/><path d="M-58 -2 L-70 -26 H-62 L-46 -5Z" class="hs-fill-blue"/><path d="M-63 -14 L-66 -20 H-63 L-60 -14Z" class="hs-fill-accent"/><path d="M-60 6 L-76 12 H-68 L-50 6Z" class="hs-fill-ink"/>
  ${[-40, -28, -16, -4, 8, 20, 32].map((x) => `<rect x="${x}" y="-2" width="5" height="4" rx="1" class="hs-fill-ink"/>`).join('')}<path d="M50 -1 h6 l3 3 h-9z" class="hs-fill-ink"/></g>`;
// Rota sobre a imagem de satélite do Atlântico Sul (coordenadas da imagem, 1157x1359)
const AF447_ROTA = 'M235 1226 L555 569 L600 479';
const AVIAO_A330 = `<g class="dz-plane">
  <path d="M0 -34 C3.4 -34 4.6 -27 4.6 -20 L4.6 22 L3 31 L0 34 L-3 31 L-4.6 22 L-4.6 -20 C-4.6 -27 -3.4 -34 0 -34Z"/>
  <path d="M4.6 -6 L36 13 L36 17 L4.6 8Z M-4.6 -6 L-36 13 L-36 17 L-4.6 8Z"/>
  <path d="M3 22 L15 30 L15 33 L3 30Z M-3 22 L-15 30 L-15 33 L-3 30Z"/>
  <rect x="12" y="1" width="4.6" height="10" rx="2.3"/><rect x="-16.6" y="1" width="4.6" height="10" rx="2.3"/></g>`;
function mapaAf447() {
  // Nuvens da tempestade: um aglomerado de células de trovoada desfocadas em volta da última posição
  const celulas = [[0, 0, 120], [-110, -40, 80], [100, -70, 95], [130, 60, 85], [-60, 90, 75], [30, -150, 70], [-170, 50, 55], [190, -10, 60], [50, 140, 60], [-30, -90, 65]]
    .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#dzStorm)"/>`).join('');
  return `<svg viewBox="0 0 1157 1359" role="img" aria-label="Mapa da rota do voo AF 447 sobre o Atlântico Sul" class="dz-map--af">
    <defs><filter id="dzShadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="7" dy="10" stdDeviation="4" flood-color="#000" flood-opacity=".55"/></filter>
      <filter id="dzBlur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14"/></filter>
      <radialGradient id="dzStorm"><stop offset="0" stop-color="#fff" stop-opacity=".8"/><stop offset=".6" stop-color="#e6edf5" stop-opacity=".45"/><stop offset="1" stop-color="#e6edf5" stop-opacity="0"/></radialGradient></defs>
    <image href="assets/af447-mapa.webp" x="0" y="0" width="1157" height="1359" preserveAspectRatio="xMidYMid slice"/>
    <path d="M0 528 H1157" class="dz-eq"/>
    <g transform="translate(640 455)"><g class="dz-storm-drift"><g filter="url(#dzBlur)">${celulas}</g></g>
      ${[[-60, -40], [70, -90], [90, 60], [-110, 70], [10, 20]].map(([x, y], i) => `<path d="M${x} ${y} l-14 30 h16 l-12 30" class="dz-bolt" style="animation-delay:${i * .8}s"/>`).join('')}</g>
    <mask id="dzReveal" maskUnits="userSpaceOnUse" x="0" y="0" width="1157" height="1359"><path id="dzRevealPath" d="${AF447_ROTA}" fill="none" stroke="#fff" stroke-width="40" stroke-linecap="round" stroke-linejoin="round"/></mask>
    <path d="M600 479 L630 420 L766 0" class="dz-route-plan"/>
    <path id="dzPath" d="${AF447_ROTA}" class="dz-route"/>
    <path d="${AF447_ROTA}" class="dz-route-dash" mask="url(#dzReveal)"/>
    <g class="dz-labels">
      <circle cx="235" cy="1226" r="11" class="dz-dot"/><text x="262" y="1222">Rio de Janeiro</text><text x="262" y="1256" class="dz-lbl-s">(Galeão)</text>
      <circle cx="490" cy="773" r="8" class="dz-dot"/><text x="470" y="785" text-anchor="end">Recife</text>
      <circle cx="480" cy="706" r="8" class="dz-dot"/><text x="460" y="718" text-anchor="end">Natal</text>
      <circle cx="567" cy="646" r="7" class="dz-dot"/><text x="586" y="658">Fernando de Noronha</text>
      <text x="572" y="582" class="dz-lbl-s">INTOL</text>
      <circle cx="630" cy="420" r="7" class="dz-dot"/><text x="648" y="420" class="dz-lbl-s">TASIL</text>
      <text x="580" y="470" text-anchor="end" class="dz-lbl-s">Última posição</text>
      <circle cx="1021" cy="88" r="9" class="dz-dot"/><text x="1005" y="132" text-anchor="end">Dakar</text>
      <text x="1005" y="170" text-anchor="end" class="dz-lbl-s">rota prevista até Paris</text>
      <text x="300" y="900" text-anchor="middle" class="dz-lbl-big">BRASIL</text>
      <text x="880" y="900" text-anchor="middle" class="dz-lbl-w">Oceano Atlântico</text>
      <text x="1145" y="516" text-anchor="end" class="dz-lbl-s dz-lbl-w">Linha do Equador</text>
      <text x="870" y="262" text-anchor="middle" class="dz-lbl-s dz-lbl-w">tempestades da Zona de</text><text x="870" y="292" text-anchor="middle" class="dz-lbl-s dz-lbl-w">Convergência Intertropical</text>
    </g>
    <g id="dzMarks"></g>
    <path d="M584 463 l32 32 M616 463 l-32 32" class="dz-x"/>
    <g id="dzPlane"><circle r="34" class="dz-plane-halo"/><g transform="scale(1.05)" filter="url(#dzShadow)">${AVIAO_A330}</g></g>
    <text x="20" y="1340" class="dz-map-note">Rota aproximada</text>
  </svg>`;
}
// As sondas pitot no nariz do A330 entupidas por cristais de gelo: a velocidade indicada despenca
// Sonda pitot real (lado do copiloto) com as animações por cima:
// a foto da sonda congelada aparecendo aos poucos e a velocidade caindo. A ponta do tubo fica em (400, 163) na foto (600x567).
const PITOT_FOTO = 'assets/af447-pitot.webp', PITOT_GELO = 'assets/af447-pitot-gelo.webp';
function pitotFoto(w, h, y0, extra = '') {
  const k = 600 / w, tx = 400 / k, ty = (163 - y0) / k;
  const foto = (src, cls = '') => `<image href="${src}" x="0" y="${-y0 / k}" width="${w}" height="${567 / k}" preserveAspectRatio="none"${cls ? ` class="${cls}"` : ''}/>`;
  // A foto normal e a foto da mesma sonda congelada se alternam no ritmo da queda da velocidade
  return `${foto(PITOT_FOTO)}${foto(PITOT_GELO, 'pt-frozen')}
    <rect width="${w}" height="${h}" class="pt-night"/>
    <ellipse cx="${tx - 26}" cy="${ty}" rx="30" ry="6" class="pt-heat"/>
    <g class="pt-call"><path d="M${tx + 4} ${ty - 6} L${tx + 26} ${ty - 30} H${tx + 70}" class="pt-call-l"/><text x="${tx + 28}" y="${ty - 34}" class="pt-call-t">entrada de ar</text></g>
    ${extra}`;
}
function falhaAf447() {
  return `<svg viewBox="0 0 360 160" role="img" aria-label="Esquema da falha: cristais de gelo entopem a sonda pitot, a velocidade indicada cai e o piloto automático se desliga">
    ${pitotFoto(360, 160, 40, `<rect x="8" y="8" width="104" height="34" rx="5" class="pt-chip"/><text x="15" y="21" class="dz-spd-l">VELOCIDADE</text>
      <text x="104" y="36" text-anchor="end" class="dz-spd pt-spd-a">275 nós</text><text x="104" y="36" text-anchor="end" class="dz-spd dz-spd--b pt-spd-b">60 nós</text>
      <text x="300" y="146" text-anchor="middle" class="dz-apoff pt-apoff">AP OFF</text>
      <rect x="8" y="136" width="262" height="17" rx="4" class="pt-chip"/><text x="14" y="148" class="dz-map-t" style="fill:#e9eef5">3 sondas pitot · cristais de gelo · cerca de 1 minuto</text>`)}
  </svg>`;
}
// O estol: o nariz aponta para cima, mas o avião cai; o ângulo entre os dois passa de 40°
function estolAf447() {
  // Foto do A330 de nariz para cima (imagem ilustrativa) com as setas do estol por cima. Centro do avião em (179, 84)
  return `<svg viewBox="0 0 360 196" role="img" aria-label="Estol: o nariz do avião aponta para cima enquanto ele cai, com ângulo de ataque acima de 40 graus">
    <image href="assets/af447-estol-diagrama.webp" x="0" y="0" width="360" height="196" preserveAspectRatio="xMidYMid slice"/>
    <rect width="360" height="196" class="es-dim"/>
    <path d="M179 84 L336 48" class="es-nose"/>
    <path d="M227.8 72.9 A50 50 0 0 1 220 112.7" class="es-arc"/>
    <g class="es-path"><path d="M179 84 L253 136" class="es-vec"/><path d="M239.7 134 L253 136 L246.6 124.2" class="es-vec"/></g>
    <text x="10" y="18" class="es-t">a asa perde a sustentação</text>
    <text x="350" y="30" text-anchor="end" class="es-t">nariz para cima (~15°)</text>
    <text x="232" y="98" class="es-t es-red">ângulo de ataque &gt; 40°</text>
    <text x="350" y="150" text-anchor="end" class="es-t">trajetória: para baixo</text>
    <text x="10" y="186" class="es-s">queda de cerca de 10.000 pés por minuto</text>
    <text x="350" y="188" text-anchor="end" class="es-ilus">imagem ilustrativa</text>
  </svg>`;
}
/* ---------- Ilustrações do MH370 ---------- */
// Mapa sobre imagem de satélite do Sudeste Asiático e do Oceano Índico (784x1366). A imagem tem a curvatura da Terra,
// então os pontos foram medidos nela, um a um, e não calculados por latitude e longitude
// 7º arco: pontos a cerca de 44° do satélite Inmarsat (sobre 64,5°L, no equador), já na posição da imagem
const MH_ARCO_IMG = [[474, 628], [454, 694], [421, 804], [373, 914], [307, 1024], [210, 1134], [128, 1200]];
const MH_ARCO = [[-12, 107.4], [-15, 106.3], [-20, 104.5], [-25, 101.9], [-30, 98.3], [-35, 93], [-38, 88.5]];
const imgPts = (l) => l.map((p) => p.join(' ')).join(' L');
// Rota: Kuala Lumpur → IGARI → volta sobre a península → Penang → último radar → trajeto estimado até o 7º arco
const MH370_ROTA = 'M340 280 L392 151 C384 152 370 160 355 172 C340 186 322 200 307 205 L226 166 C190 150 150 180 140 240 C130 330 170 600 190 800 C200 950 205 1050 210 1134';
function mapaMh370() {
  return `<svg viewBox="0 0 784 1366" role="img" aria-label="Mapa do voo MH370: de Kuala Lumpur ao ponto IGARI, a volta sobre a Malásia e o trajeto estimado até o sul do Oceano Índico" class="dz-map--mh">
    <defs><filter id="dzShadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="6" dy="9" stdDeviation="4" flood-color="#000" flood-opacity=".55"/></filter></defs>
    <image href="assets/mh370-mapa.webp" x="0" y="0" width="784" height="1366" preserveAspectRatio="xMidYMid slice"/>
    <path d="M0 350 H784" class="dz-eq"/>
    <path d="M${imgPts(MH_ARCO_IMG)}" class="mh-arc"/>
    <path d="M${imgPts(MH_ARCO_IMG.slice(3, 7))}" class="mh-search"/>
    <path d="M392 151 L470 0" class="dz-route-plan"/>
    <mask id="dzReveal" maskUnits="userSpaceOnUse" x="0" y="0" width="784" height="1366"><path id="dzRevealPath" d="${MH370_ROTA}" fill="none" stroke="#fff" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/></mask>
    <path id="dzPath" d="${MH370_ROTA}" class="dz-route"/>
    <path d="${MH370_ROTA}" class="dz-route-dash" mask="url(#dzReveal)"/>
    <g class="dz-labels">
      <circle cx="340" cy="280" r="7" class="dz-dot"/><text x="352" y="300">Kuala Lumpur</text>
      <circle cx="307" cy="205" r="6" class="dz-dot"/><text x="296" y="226" text-anchor="end">Penang</text>
      <text x="404" y="156" class="dz-lbl-s">IGARI</text>
      <text x="222" y="150" text-anchor="end" class="dz-lbl-s">último radar</text>
      <text x="480" y="24" class="dz-lbl-s">rota planejada até Pequim</text>
      <text x="500" y="200" text-anchor="middle" class="dz-lbl-w">Mar da China</text><text x="500" y="226" text-anchor="middle" class="dz-lbl-w">Meridional</text>
      <text x="30" y="110" class="dz-lbl-s dz-lbl-w">Mar de Andamão</text>
      <text x="300" y="380" text-anchor="middle" class="dz-lbl-big" transform="rotate(-52 300 380)">SUMATRA</text>
      <text x="520" y="590" text-anchor="middle" class="dz-lbl-big">JAVA</text>
      <text x="612" y="412" text-anchor="middle" class="dz-lbl-big">BORNÉU</text>
      <text x="700" y="960" text-anchor="middle" class="dz-lbl-big">AUSTRÁLIA</text>
      <circle cx="626" cy="1045" r="6" class="dz-dot"/><text x="612" y="1050" text-anchor="end">Perth</text>
      <text x="360" y="700" text-anchor="middle" class="dz-lbl-w">Oceano Índico</text>
      <text x="774" y="340" text-anchor="end" class="dz-lbl-s dz-lbl-w">Linha do Equador</text>
      <text x="436" y="810" class="dz-lbl-s mh-arc-t">7º arco</text>
      <text x="296" y="1090" class="dz-lbl-s">áreas já vasculhadas</text>
      <text x="24" y="470" class="dz-lbl-s">trajeto estimado</text><text x="24" y="494" class="dz-lbl-s">(dados de satélite)</text>
    </g>
    <g id="dzMarks"></g>
    <g id="dzPlane"><circle r="28" class="dz-plane-halo"/><g transform="scale(.85)" filter="url(#dzShadow)">${AVIAO_A330}</g></g>
    <text x="16" y="1352" class="dz-map-note">Rota aproximada · o local da queda nunca foi encontrado</text>
  </svg>`;
}
// O que falhou: o rastreamento. Sobrou só o "aperto de mão" de hora em hora com um satélite, que dava a distância e não a direção
function falhaMh370() {
  const aneis = [60, 78, 96, 114, 132, 150, 168];
  return `<svg viewBox="0 0 360 170" role="img" aria-label="Esquema: o satélite Inmarsat só media a distância até o avião, formando arcos; o último deles é o 7º arco">
    <rect width="360" height="170" class="px-night"/>
    <defs><clipPath id="mhClip"><rect x="0" y="40" width="360" height="130"/></clipPath></defs>
    <g clip-path="url(#mhClip)">${aneis.map((r, i) => `<circle cx="180" cy="-10" r="${r}" class="mh-ring${i === 6 ? ' mh-ring--7' : ''}" style="animation-delay:${i * .35}s"/>`).join('')}</g>
    <g transform="translate(180 18)"><rect x="-8" y="-6" width="16" height="12" rx="2" class="mh-sat"/><rect x="-34" y="-3" width="22" height="6" class="mh-panel"/><rect x="12" y="-3" width="22" height="6" class="mh-panel"/></g>
    <text x="196" y="14" class="dz-map-t" style="fill:#e9eef5">satélite Inmarsat</text>
    <g transform="translate(276 128) rotate(-125) scale(.28)" class="mh-plane-dim">${AVIAO_A330}</g>
    <text x="354" y="150" text-anchor="end" class="dz-map-t dz-map-crash">7º arco · 08:19</text>
    <rect x="6" y="48" width="122" height="46" rx="4" class="pt-chip"/><text x="12" y="61" class="dz-map-t" style="fill:#e9eef5">transponder: desligado</text>
    <text x="12" y="75" class="dz-map-t" style="fill:#e9eef5">ACARS: em silêncio</text>
    <text x="12" y="89" class="dz-map-t" style="fill:#e9eef5">radar: fora de alcance</text>
    <rect x="6" y="152" width="214" height="13" rx="3" class="pt-chip"/><text x="12" y="161" class="dz-map-s" style="fill:#cfd8de">7 "apertos de mão" entre 02:25 e 08:19 · só a distância</text>
  </svg>`;
}
// A deriva dos destroços: as correntes do Índico levaram as peças do 7º arco até a África. 4 px por grau, de 30°L a 120°L
const MI = (lat, lon) => [Math.round((lon - 30) * 4), Math.round(-lat * 4)];
const miPts = (l) => l.map(([a, b]) => MI(a, b).join(' ')).join(' L');
function derivaMh370() {
  const achados = [[[-21.1, 55.5], 'Reunião · flaperon (2015)'], [[-5.2, 39.8], 'Tanzânia'], [[-22, 35.3], 'Moçambique'], [[-20.2, 57.5], 'Maurício'], [[-17, 49.9], 'Madagascar']];
  return `<svg viewBox="0 0 360 180" role="img" aria-label="Deriva dos destroços: correntes do Oceano Índico levaram peças do MH370 para Reunião, Madagascar, Moçambique, Tanzânia e Maurício">
    <rect width="360" height="180" class="mh-sea"/>
    <path d="M${miPts([[0, 42.5], [-5, 39.3], [-10, 40.3], [-15, 40.7], [-20, 35], [-25, 33], [-30, 31], [-34, 26], [-36, 20]])} L0 180 L0 0Z" class="mh-land"/>
    <path d="M${miPts([[-12, 49.3], [-16, 50], [-25, 47], [-25.5, 45], [-21, 43.5], [-16, 44.5]])}Z" class="mh-land"/>
    <path d="M${miPts([[-19.5, 120], [-20.3, 118.8], [-21.8, 114.2], [-26.5, 113.3], [-32, 115.7], [-35, 117.5], [-35, 120]])} L360 180 L360 70Z" class="mh-land"/>
    <path d="M${miPts([[0, 99], [-3, 101.5], [-5.9, 104.6], [-5.8, 106.2], [-3, 106], [0, 104]])}Z" class="mh-land"/>
    <path d="M${miPts(MH_ARCO)}" class="mh-arc" style="stroke-width:2"/>
    ${[['M250 142 C200 160 150 140 104 92', 0], ['M280 118 C230 110 170 96 120 84', .8], ['M262 130 C210 150 120 150 82 120', 1.6], ['M290 104 C240 70 150 50 50 24', 2.4]].map(([d, t]) => `<path d="${d}" class="mh-drift" style="animation-delay:${t}s"/>`).join('')}
    ${achados.map(([[la, lo], n], i) => { const [x, y] = MI(la, lo); return `<circle cx="${x}" cy="${y}" r="3" class="mh-find"/><text x="${x + 5}" y="${y + (i === 3 ? 9 : -4)}" class="dz-map-t" style="fill:#e9eef5">${n}</text>`; }).join('')}
    <text x="300" y="60" class="dz-map-t mh-arc-t">7º arco</text>
    <text x="320" y="170" text-anchor="end" class="dz-map-t" style="fill:#e9eef5">Austrália</text>
    <text x="10" y="172" class="dz-map-s" style="fill:#cfd8de">as correntes levaram as peças para oeste, por meses</text>
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
  // AF 447
  galeao: () => `<rect width="320" height="180" class="px-night"/>${[[24, 18], [70, 30], [140, 12], [200, 26], [292, 16]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="1.3" class="px-star" style="animation-delay:${i * .3}s"/>`).join('')}
    <path d="M150 140 C160 84 176 70 190 76 C200 82 204 110 212 140Z M200 140 C210 108 222 100 232 108 C240 116 244 128 248 140Z" class="px-ridge-n"/><path d="M30 140 C50 96 74 86 96 96 C110 104 118 120 126 140Z" class="px-ridge-n"/>
    <path d="M70 86 v-14 M64 78 h12" class="px-cristo"/>
    ${water(150)}${Array.from({ length: 26 }, (_, i) => `<circle cx="${8 + i * 12}" cy="${144 - (i % 3) * 3}" r="1.6" class="px-lights" style="animation-delay:${(i % 5) * .3}s"/>`).join('')}
    <g transform="translate(250 60) rotate(-8) scale(.55)">${a330()}</g><circle cx="284" cy="56" r="2" class="px-nav"/>`,
  decolagemRio: () => `<rect width="320" height="180" class="px-night"/>${water(140)}${Array.from({ length: 30 }, (_, i) => `<circle cx="${i * 11}" cy="${136 - (i % 4) * 2}" r="1.4" class="px-lights" style="animation-delay:${(i % 6) * .25}s"/>`).join('')}
    <circle cx="270" cy="34" r="12" class="px-moon"/><g class="px-climb">${a330()}<circle cx="-68" cy="2" r="2" class="px-nav"/></g>`,
  oceano: () => `<rect width="320" height="180" class="px-night"/>${[[20, 20], [60, 44], [110, 16], [170, 38], [230, 12], [300, 40], [260, 60]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="1.3" class="px-star" style="animation-delay:${i * .3}s"/>`).join('')}
    <circle cx="66" cy="34" r="10" class="px-moon"/><path d="M0 150 H320 V180 H0Z" class="px-sea"/><path d="M40 156 h30 M120 162 h44 M210 154 h24 M260 166 h40" class="px-glint"/>
    ${cloud(250, 120, 1.6, 0)}<g class="px-cruise"><g transform="scale(.55)">${a330()}</g><circle cx="-38" cy="1" r="1.6" class="px-nav"/></g>`,
  tempestade: () => `<rect width="320" height="180" class="px-night"/><path d="M0 150 H320 V180 H0Z" class="px-sea"/>
    <g class="px-cb"><ellipse cx="200" cy="96" rx="110" ry="46"/><ellipse cx="230" cy="58" rx="70" ry="36"/><ellipse cx="170" cy="66" rx="58" ry="30"/><path d="M120 46 Q220 0 320 40 V60 H120Z"/></g>
    <path d="M214 80 l-12 24 h12 l-10 26" class="px-bolt"/><path d="M262 64 l-8 16 h8 l-6 18" class="px-bolt" style="animation-delay:1.3s"/>
    <g class="px-rain">${Array.from({ length: 14 }, (_, i) => `<path d="M${130 + i * 12} ${120 + (i % 3) * 6} l-4 12" class="hs-line-w"/>`).join('')}</g>
    <g transform="translate(70 92) scale(.5)">${a330()}</g><text x="70" y="128" text-anchor="middle" class="px-gtxt">CURVA DE 12° À ESQUERDA</text>`,
  cabineNoite: () => `<rect width="320" height="180" class="px-cabin"/><path d="M0 20 H320" class="hs-line"/>
    ${[0, 1, 2, 3, 4].map((r) => [0, 1, 2, 3, 4, 5].map((c) => `<g transform="translate(${20 + c * 52 + r * 4} ${70 + r * 18})"><rect x="0" y="0" width="36" height="34" rx="6" class="px-seat"/><circle cx="${18 + ((c + r) % 3 - 1) * 4}" cy="-3" r="7" class="hs-fill-ink"/></g>`).join('')).join('')}
    <rect width="320" height="180" class="px-dim"/>${[50, 154, 258].map((x, i) => `<circle cx="${x}" cy="26" r="3" class="px-lamp" style="animation-delay:${i * .4}s"/>`).join('')}
    <g class="hs-shake" style="transform-origin:160px 90px"><text x="160" y="16" class="px-gtxt">TURBULÊNCIA À FRENTE</text></g>`,
  pitot: () => pitotFoto(320, 180, 20, `<rect x="8" y="8" width="92" height="30" rx="5" class="pt-chip"/><text x="14" y="19" class="dz-spd-l">VELOCIDADE</text>
    <text x="94" y="33" text-anchor="end" class="dz-spd pt-spd-a" style="font-size:12px">275 nós</text><text x="94" y="33" text-anchor="end" class="dz-spd dz-spd--b pt-spd-b" style="font-size:12px">60 nós</text>
    <rect x="8" y="156" width="150" height="18" rx="4" class="pt-chip"/><text x="83" y="168" class="px-gtxt">CRISTAIS DE GELO · -40 °C</text>`),
  alarme: () => `<rect width="320" height="180" class="px-panel"/><rect x="40" y="22" width="150" height="120" rx="6" class="px-gauge"/>
    <path d="M40 82 H190" class="px-horizon"/><rect x="48" y="30" width="30" height="104" class="px-tape"/>
    <text x="63" y="86" text-anchor="middle" class="dz-spd dz-spd--a" style="font-size:10px">275</text><text x="63" y="86" text-anchor="middle" class="dz-spd dz-spd--b" style="font-size:10px">60</text>
    <text x="255" y="50" text-anchor="middle" class="dz-apoff">AP OFF</text><text x="255" y="78" text-anchor="middle" class="px-amber">ALTN LAW</text>
    <text x="255" y="112" text-anchor="middle" class="px-pullup">STALL</text><text x="160" y="168" class="px-gtxt">23:10 · O PILOTO AUTOMÁTICO SE DESLIGA</text>`,
  subida: () => `${cloud(60, 140, 1.2, 0)}${cloud(240, 150, 1, 1)}<g transform="translate(160 96) rotate(-16) scale(1.05)">${a330()}</g>
    <path d="M250 150 V40 M240 52 l10 -14 l10 14" class="hs-line-accent"/><text x="250" y="30" text-anchor="middle" class="dz-map-t">38.000 pés</text>
    <text x="250" y="166" text-anchor="middle" class="dz-map-s">subindo 7.000 pés por minuto</text>`,
  estol: () => `${cloud(70, 40, 1, 0)}${cloud(260, 70, .9, 1)}<g class="px-fall"><g transform="translate(160 70) rotate(-15)">${a330()}</g></g>
    <path d="M40 30 V150 M30 138 l10 14 l10 -14" class="hs-line-accent"/><text x="240" y="168" text-anchor="middle" class="px-pullup" style="font-size:12px">STALL STALL</text>`,
  // Foto dos dois manches laterais (imagem ilustrativa) com as informações por cima: cada piloto manda o avião para um lado
  manches: () => `<rect width="320" height="180" fill="#6d747c"/><image href="assets/af447-manches.webp" x="57" y="-91.4" width="206.4" height="367.7" preserveAspectRatio="none"/>
    <rect x="0" y="0" width="60" height="180" class="mn-side"/><rect x="260" y="0" width="60" height="180" class="mn-side"/>
    <text x="30" y="80" class="mn-name">ROBERT</text><text x="30" y="92" class="mn-sub">ESQUERDA</text><text x="30" y="104" class="mn-sub">empurra</text>
    <text x="290" y="80" class="mn-name">BONIN</text><text x="290" y="92" class="mn-sub">DIREITA</text><text x="290" y="104" class="mn-sub">puxa</text>
    <g class="mn-push"><path d="M84 92 V60 M78 68 l6 -9 l6 9" class="mn-arrow"/></g>
    <g class="mn-pull"><path d="M236 60 V92 M230 84 l6 9 l6 -9" class="mn-arrow mn-arrow--b"/></g>
    <circle cx="135.8" cy="26.1" r="6" class="mn-prio"/>
    <rect x="104" y="4" width="112" height="17" rx="4" class="pt-chip"/><text x="160" y="16.5" text-anchor="middle" class="px-pullup mn-dual">DUAL INPUT</text>
    <rect x="86" y="156" width="148" height="18" rx="4" class="pt-chip"/><text x="160" y="168" class="px-gtxt">CADA UM SÓ SENTE O SEU</text>
    <text x="316" y="176" text-anchor="end" class="mn-ilus">imagem ilustrativa</text>`,
  queda: () => `<rect width="320" height="180" class="px-night"/><path d="M0 150 H320 V180 H0Z" class="px-sea"/>
    <g class="px-fall"><g transform="translate(160 64) rotate(-16) scale(.9)">${a330()}</g></g>
    <text x="160" y="28" text-anchor="middle" class="px-pullup" style="font-size:13px">SINK RATE · PULL UP</text>`,
  painelParis: () => `<rect width="320" height="180" class="px-panel"/><rect x="20" y="24" width="280" height="130" rx="4" class="px-board"/>
    <text x="34" y="44" class="px-btxt">ARRIVÉES · CHARLES DE GAULLE</text>
    ${[['· · ·', '· · · · · ·', '· · ·'], ['AF 447', 'RIO DE JANEIRO', 'RETARDÉ'], ['· · ·', '· · · · · ·', '· · ·'], ['· · ·', '· · · · · ·', '· · ·']].map(([v, c, s], i) => `<g class="${i === 1 ? 'px-hl' : ''}"><text x="34" y="${70 + i * 22}" class="px-btxt">${v}</text><text x="96" y="${70 + i * 22}" class="px-btxt">${c}</text><text x="286" y="${70 + i * 22}" text-anchor="end" class="px-btxt">${s}</text></g>`).join('')}
    <text x="160" y="172" class="px-gtxt">PARIS · MANHÃ DE 1º DE JUNHO</text>`,
  busca: () => `<rect width="320" height="180" class="px-dusk"/>${water(120)}
    <g class="hs-float"><path d="M60 124 L76 92 H92 L84 124Z" class="px-finw"/><path d="M78 98 L82 92 H86 L80 104Z" class="hs-fill-blue"/><path d="M76 108 L80 100 H84 L78 112Z" class="hs-fill-accent"/></g>
    ${[[130, 128], [160, 132], [190, 126]].map(([x, y], i) => `<rect x="${x}" y="${y}" width="${10 + i * 4}" height="4" rx="1" class="hs-fill-paper hs-float" style="animation-delay:${i * .4}s"/>`).join('')}
    <g transform="translate(250 112)"><path d="M-40 0 H40 L30 14 H-30Z" class="px-ship"/><rect x="-14" y="-16" width="26" height="16" class="px-ship"/><path d="M0 -16 V-30" class="hs-line"/></g>
    <g class="px-cruise"><g transform="scale(.35)">${jumbo(false, 'px-c130')}</g></g>`,
  fundo: () => `<rect width="320" height="180" class="px-deep"/><path d="M0 160 C60 150 120 166 180 156 S280 150 320 160 V180 H0Z" class="px-floor"/>
    ${[[60, 156, 30, 8], [130, 160, 18, 6], [210, 154, 40, 10]].map(([x, y, w, h]) => `<rect x="${x}" y="${y - h}" width="${w}" height="${h}" rx="2" class="hs-fill-metal"/>`).join('')}
    <g class="px-auv"><path d="M120 70 L80 150 H200 Z" class="px-beam"/><rect x="96" y="60" width="54" height="14" rx="7" class="px-orange"/><path d="M96 67 l-10 -6 v12z" class="px-orange"/></g>
    <text x="262" y="24" class="px-gtxt">3.900 METROS</text>`,
  caixas: () => `<rect width="320" height="180" class="px-deep"/>${[[70, 'FDR', 'DADOS'], [190, 'CVR', 'VOZES']].map(([x, n, l], i) => `<g class="hs-bob" style="animation-delay:${i * .5}s"><rect x="${x}" y="54" width="70" height="52" rx="6" class="px-orange"/><rect x="${x}" y="54" width="70" height="12" rx="4" class="px-stripe"/><circle cx="${x + 56}" cy="92" r="7" class="hs-fill-ink"/><text x="${x + 28}" y="92" text-anchor="middle" class="px-btxt" style="fill:#1b1b1b">${n}</text><text x="${x + 35}" y="126" text-anchor="middle" class="px-gtxt">${l}</text></g>`).join('')}
    ${[40, 150, 280].map((x, i) => `<circle cx="${x}" cy="150" r="3" class="px-bubble" style="animation-delay:${i * .6}s"/>`).join('')}<text x="160" y="168" class="px-gtxt">MAIO DE 2011 · 23 MESES NO FUNDO DO MAR</text>`,
  relatorio: () => `<rect width="320" height="180" class="px-paperbg"/><g transform="rotate(-4 160 90)"><rect x="96" y="12" width="128" height="140" rx="3" class="px-note"/>
    <text x="110" y="32" class="px-btxt" style="fill:#1b2630">RELATÓRIO FINAL</text>${[48, 60, 72, 84, 96, 108, 120, 132].map((y, i) => `<path d="M110 ${y} H${i % 3 === 2 ? 180 : 210}" class="${i === 3 || i === 4 ? 'px-hlline' : 'px-ink'}"/>`).join('')}</g>
    <text x="160" y="176" class="px-gtxt px-gtxt--ink">5 DE JULHO DE 2012</text>`,
  sondas: () => `<rect width="320" height="180" class="px-panel"/>${[[70, 'THALES AA', 1], [160, 'THALES AA', 1], [250, 'GOODRICH', 0]].map(([x, n, ruim]) => `<g><path d="M${x} 50 V100 H${x - 36}" class="px-probe"/><circle cx="${x - 36}" cy="100" r="4" class="hs-fill-metal"/><text x="${x - 8}" y="130" text-anchor="middle" class="px-gtxt">${n}</text>${ruim ? `<path d="M${x - 40} 76 l40 40 M${x} 76 l-40 40" class="px-xred"/>` : ''}</g>`).join('')}
    <text x="160" y="164" class="px-gtxt">DEPOIS DO ACIDENTE, A TROCA VIROU OBRIGATÓRIA</text>`,
  tribunal: () => `<rect width="320" height="180" class="px-paperbg"/><path d="M160 30 V150 M120 150 H200 M90 50 H230" class="px-scale"/>
    <g class="px-tilt" style="transform-origin:160px 50px"><path d="M90 50 l-20 40 h40z M230 50 l-20 40 h40z" class="px-scale"/><path d="M70 90 a20 8 0 0 0 40 0 M210 90 a20 8 0 0 0 40 0" class="px-scale"/></g>
    <text x="160" y="172" class="px-gtxt px-gtxt--ink">PARIS · 2023: ABSOLVIDAS · 2026: CONDENADAS</text>`,
  // MH370
  klia: () => `<rect width="320" height="180" class="px-night"/>${ground(150)}<rect x="0" y="70" width="320" height="80" class="mh-terminal"/>
    ${Array.from({ length: 14 }, (_, i) => `<rect x="${8 + i * 22}" y="80" width="16" height="44" class="hs-win" style="animation-delay:${i * .15}s"/>`).join('')}
    <path d="M0 70 Q160 40 320 70" class="mh-roof"/>${[40, 70, 100, 200, 230].map((x, i) => person(x, 146, i % 2 === 1, i % 2 ? 'hs-fill-blue' : 'hs-fill-ink', i * .2)).join('')}
    <g transform="translate(150 150) scale(.5)">${a330()}</g><text x="314" y="20" text-anchor="end" class="px-gtxt" style="text-anchor:end">KLIA · 7 DE MARÇO, NOITE</text>`,
  decolagemKL: () => `<rect width="320" height="180" class="px-night"/>${[[30, 20], [90, 36], [170, 14], [230, 30], [290, 18]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="1.3" class="px-star" style="animation-delay:${i * .3}s"/>`).join('')}
    <g class="mh-towers"><path d="M56 160 V96 l5 -14 l5 14 V160Z M80 160 V96 l5 -14 l5 14 V160Z"/><rect x="66" y="118" width="14" height="4"/><path d="M61 82 V70 M85 82 V70" class="mh-spire"/></g>
    <path d="M0 160 H320 V180 H0Z" class="px-sea"/>${Array.from({ length: 28 }, (_, i) => `<circle cx="${i * 12}" cy="${156 - (i % 4) * 2}" r="1.3" class="px-lights" style="animation-delay:${(i % 6) * .25}s"/>`).join('')}
    <g class="px-climb">${a330()}<circle cx="-68" cy="2" r="2" class="px-nav"/></g>`,
  // Foto da cabine de passageiros de fundo (imagem ilustrativa), com a última mensagem por cima
  boaNoite: () => `<image href="assets/mh370-cinto.webp" x="0" y="0" width="320" height="180" preserveAspectRatio="xMidYMid slice"/><rect width="320" height="180" class="mh-dimfoto"/>
    <rect x="34" y="52" width="252" height="62" rx="8" class="pt-chip"/>
    ${[0, 1, 2].map((i) => `<path d="M${52 + i * 8} 92 a${10 + i * 9} ${10 + i * 9} 0 0 1 0 ${-(20 + i * 18) / 2}" class="mh-wave" style="animation-delay:${i * .3}s"/>`).join('')}
    <text x="168" y="78" text-anchor="middle" class="mh-radio">"GOOD NIGHT,</text><text x="168" y="96" text-anchor="middle" class="mh-radio">MALAYSIAN THREE SEVEN ZERO"</text>
    <rect x="86" y="150" width="148" height="18" rx="4" class="pt-chip"/><text x="160" y="162" class="px-gtxt">01:19:30 · A ÚLTIMA VOZ</text>
    <text x="314" y="12" text-anchor="end" class="mn-ilus">imagem ilustrativa</text>`,
  igari: () => `<rect width="320" height="180" class="px-panel"/><circle cx="160" cy="90" r="74" class="mh-scope"/>${[24, 48, 72].map((r) => `<circle cx="160" cy="90" r="${r}" class="mh-scope-l"/>`).join('')}<path d="M86 90 H234 M160 16 V164" class="mh-scope-l"/>
    <g class="mh-sweep" style="transform-origin:160px 90px"><path d="M160 90 L160 16 A74 74 0 0 1 212 38Z" class="mh-sweep-f"/></g>
    <g class="mh-blip"><circle cx="196" cy="58" r="3.4" class="mh-dot"/><text x="203" y="52" class="mh-tag">MH370</text><text x="203" y="62" class="mh-tag">FL350</text></g>
    <text x="160" y="176" class="px-gtxt">01:21:13 · O SINAL DO TRANSPONDER SOME</text>`,
  // Foto de satélite da península da Malásia (imagem 1912x1076, desenhada em escala) com a volta do MH370 se desenhando por cima
  curva: () => `<image href="assets/mh370-peninsula.webp" x="0" y="0" width="320" height="180" preserveAspectRatio="xMidYMid slice"/>
    <g transform="scale(.16736)">
      <path d="M1070 705 L1300 270 C1250 250 1100 262 1000 320 C930 362 900 410 882 440 C840 420 760 340 700 262" class="cv-shadow"/>
      <path d="M1070 705 L1300 270 C1250 250 1100 262 1000 320 C930 362 900 410 882 440 C840 420 760 340 700 262" class="cv-path" pathLength="100"/>
      <circle cx="1070" cy="705" r="16" class="cv-dot"/><circle cx="1300" cy="270" r="18" class="cv-igari"/><circle cx="885" cy="412" r="14" class="cv-dot"/><circle cx="700" cy="262" r="16" class="cv-last"/>
      <text x="1100" y="740" class="cv-t">KUALA LUMPUR</text><text x="1335" y="262" class="cv-t">IGARI · 01:21</text>
      <text x="850" y="405" text-anchor="end" class="cv-t">PENANG · 01:52</text><text x="680" y="225" text-anchor="end" class="cv-t">ÚLTIMO RADAR · 02:22</text>
    </g>
    <rect x="94" y="160" width="222" height="16" rx="4" class="pt-chip"/><text x="205" y="171" class="px-gtxt">A VOLTA SOBRE A MALÁSIA · ROTA APROXIMADA</text>`,
  ultimoEco: () => `<rect width="320" height="180" class="px-panel"/><circle cx="160" cy="90" r="74" class="mh-scope"/>${[24, 48, 72].map((r) => `<circle cx="160" cy="90" r="${r}" class="mh-scope-l"/>`).join('')}
    <g class="mh-sweep" style="transform-origin:160px 90px"><path d="M160 90 L160 16 A74 74 0 0 1 212 38Z" class="mh-sweep-f"/></g>
    ${[[180, 120], [168, 104], [150, 92], [134, 78], [118, 66]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="2.6" class="mh-dot" style="opacity:${.25 + i * .15}"/>`).join('')}<g class="mh-blip"><circle cx="104" cy="56" r="3.4" class="mh-dot"/></g>
    <text x="160" y="176" class="px-gtxt">02:22 · O ÚLTIMO ECO NO RADAR MILITAR</text>`,
  satelite: () => `<rect width="320" height="180" class="px-night"/>${[[20, 20], [60, 50], [280, 30], [250, 60], [300, 90]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="1.2" class="px-star" style="animation-delay:${i * .3}s"/>`).join('')}
    <path d="M-40 200 Q160 110 360 200Z" class="mh-earth"/>
    <g transform="translate(160 40)"><rect x="-10" y="-8" width="20" height="16" rx="3" class="mh-sat"/><rect x="-44" y="-4" width="30" height="8" class="mh-panel"/><rect x="14" y="-4" width="30" height="8" class="mh-panel"/></g>
    ${[0, 1, 2].map((i) => `<circle cx="160" cy="40" r="20" class="mh-ping" style="animation-delay:${i}s"/>`).join('')}
    <g transform="translate(236 128) rotate(-20) scale(.34)">${a330()}</g>
    <text x="160" y="176" class="px-gtxt">UM "APERTO DE MÃO" POR HORA</text>`,
  // Foto de satélite do sul do Índico (imagem ilustrativa) com os arcos do satélite e o último sinal por cima
  arco7: () => `<image href="assets/mh370-oceano.webp" x="0" y="0" width="320" height="180" preserveAspectRatio="xMidYMid slice"/><rect width="320" height="180" class="mh-dimfoto"/>
    ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<path d="M${-20 + i * 26} 180 A${200 + i * 20} ${200 + i * 20} 0 0 1 ${120 + i * 34} 0" class="mh-ring${i === 6 ? ' mh-ring--7' : ''}"/>`).join('')}
    <g class="mh-fade"><g transform="translate(188 92) rotate(200) scale(.32)">${AVIAO_A330}</g></g>
    <rect x="96" y="10" width="128" height="17" rx="4" class="pt-chip"/><text x="160" y="22" class="px-gtxt" style="fill:#ff8a7a">08:19 · O ÚLTIMO SINAL</text>
    <rect x="70" y="160" width="180" height="17" rx="4" class="pt-chip"/><text x="160" y="172" class="px-gtxt">7º ARCO · SUL DO OCEANO ÍNDICO</text>
    <text x="312" y="100" text-anchor="end" class="mh-ausl">AUSTRÁLIA</text>
    <text x="314" y="154" text-anchor="end" class="mn-ilus">imagem ilustrativa</text>`,
  buscaMar: () => `<rect width="320" height="180" class="px-dusk"/>${water(120)}
    <g transform="translate(90 112)"><path d="M-40 0 H40 L30 14 H-30Z" class="px-ship"/><rect x="-14" y="-16" width="26" height="16" class="px-ship"/></g>
    <g transform="translate(240 116) scale(.8)"><path d="M-40 0 H40 L30 14 H-30Z" class="px-ship"/><rect x="-14" y="-16" width="26" height="16" class="px-ship"/></g>
    <g class="px-cruise"><g transform="scale(.4)">${a330('px-c130')}</g></g><text x="160" y="22" class="px-gtxt" style="fill:#1b2630">26 PAÍSES NA BUSCA</text>`,
  anuncio: () => `<rect width="320" height="180" class="px-panel"/><rect x="110" y="96" width="100" height="70" rx="4" class="mh-podium"/>
    ${[120, 140, 160, 180, 200].map((x, i) => `<path d="M${x} 96 L${150 + (i - 2) * 4} 78" class="mh-mic"/><circle cx="${150 + (i - 2) * 4}" cy="76" r="3" class="mh-mic-h"/>`).join('')}
    ${[30, 60, 260, 290].map((x, i) => `<circle cx="${x}" cy="${40 + (i % 2) * 20}" r="4" class="mh-flash" style="animation-delay:${i * .5}s"/>`).join('')}
    <text x="160" y="30" class="px-gtxt">24 DE MARÇO DE 2014</text><text x="160" y="134" class="px-gtxt">"SUL DO OCEANO ÍNDICO"</text>`,
  pinger: () => `<rect width="320" height="180" class="px-deep"/>${[0, 1, 2].map((i) => `<circle cx="80" cy="120" r="10" class="mh-ping" style="animation-delay:${i * .9}s"/>`).join('')}
    <g transform="translate(220 70)"><path d="M-40 0 H40 L30 14 H-30Z" class="px-ship"/></g><path d="M220 84 C220 100 200 110 180 118" class="mh-cable"/>
    <g transform="translate(172 116)"><rect x="-12" y="-4" width="24" height="8" rx="4" class="px-orange"/></g>
    <text x="80" y="150" class="px-gtxt">SINAL?</text><text x="160" y="176" class="px-gtxt">ABRIL DE 2014 · NÃO ERA O MH370</text>`,
  sonarMar: () => `<rect width="320" height="180" class="px-deep"/><path d="M0 150 C60 140 120 158 180 146 S280 140 320 150 V180 H0Z" class="px-floor"/>
    <g transform="translate(60 24)"><path d="M-40 0 H40 L30 14 H-30Z" class="px-ship"/></g><path d="M70 38 C110 60 150 90 180 110" class="mh-cable"/>
    <g class="mh-tow"><rect x="172" y="104" width="22" height="8" rx="4" class="px-orange"/><path d="M183 112 L130 150 H236Z" class="mh-sonar"/></g>
    ${Array.from({ length: 8 }, (_, i) => `<path d="M${10 + i * 38} 166 h30" class="mh-stripe"/>`).join('')}<text x="160" y="176" class="px-gtxt">120.000 KM² DE FUNDO DO MAR</text>`,
  flaperon: () => `<rect width="320" height="180" class="px-dusk"/><path d="M0 110 Q80 102 160 110 T320 108 V180 H0Z" class="hs-fill-water"/><path d="M0 132 Q100 124 200 134 T320 130 V180 H0Z" class="mh-sand"/>
    <g transform="rotate(-6 160 140)"><path d="M100 140 L230 132 L236 146 L104 154Z" class="px-finw"/><path d="M104 150 L232 142" class="hs-line"/></g>
    <path class="hs-wave" d="M-40 124 q10 -3 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0"/>
    <text x="160" y="24" class="px-gtxt" style="fill:#1b2630">ILHA DA REUNIÃO · 29 DE JULHO DE 2015</text>`,
  oceanInfinity: () => `<rect width="320" height="180" class="px-deep"/><rect width="320" height="60" class="mh-sea"/>
    <g transform="translate(160 54)"><path d="M-60 0 H60 L46 16 H-46Z" class="px-ship"/><rect x="-24" y="-18" width="44" height="18" class="px-ship"/></g>
    ${[60, 130, 200, 270].map((x, i) => `<g class="px-auv" style="animation-delay:${i * .6}s"><rect x="${x - 14}" y="${110 + (i % 2) * 14}" width="28" height="8" rx="4" class="px-orange"/><path d="M${x} ${118 + (i % 2) * 14} L${x - 22} 170 H${x + 22}Z" class="px-beam"/></g>`).join('')}
    <text x="160" y="16" class="px-gtxt">"SE NÃO ACHAR, NÃO COBRA"</text>`,
  relatorioMy: () => `<rect width="320" height="180" class="px-paperbg"/><g transform="rotate(-4 160 90)"><rect x="96" y="12" width="128" height="140" rx="3" class="px-note"/>
    <text x="110" y="32" class="px-btxt" style="fill:#1b2630">RELATÓRIO · MH370</text>${[48, 60, 72, 84, 96, 108, 120, 132].map((y, i) => `<path d="M110 ${y} H${i % 3 === 2 ? 180 : 210}" class="${i === 3 ? 'px-hlline' : 'px-ink'}"/>`).join('')}</g>
    <text x="160" y="176" class="px-gtxt px-gtxt--ink">30 DE JULHO DE 2018 · CAUSA: INDETERMINADA</text>`,
  rastreio: () => `<rect width="320" height="180" class="px-night"/><path d="M-40 200 Q160 120 360 200Z" class="mh-earth"/>
    <g transform="translate(160 36)"><rect x="-10" y="-8" width="20" height="16" rx="3" class="mh-sat"/><rect x="-44" y="-4" width="30" height="8" class="mh-panel"/><rect x="14" y="-4" width="30" height="8" class="mh-panel"/></g>
    <g transform="translate(160 112)">${[0, 1].map((i) => `<circle r="12" class="mh-ping" style="animation-delay:${i * 1.2}s"/>`).join('')}<g transform="rotate(90) scale(.3)">${AVIAO_A330}</g></g>
    <path d="M160 100 L160 52" class="mh-link"/><text x="160" y="176" class="px-gtxt">POSIÇÃO A CADA 15 MINUTOS · OU A CADA MINUTO EM PERIGO</text>`,
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
  { t: "Véspera do Obon", foto: { src: "assets/jal123-haneda.webp", legenda: "Passageiros no terminal de Haneda olhando um 747 da Japan Air Lines ao pôr do sol (imagem ilustrativa)" }, parte: 0, hora: "17:40", lugar: "Aeroporto de Haneda, Tóquio", sabia: "O Obon acontece em meados de agosto e é uma das épocas de maior movimento nos trens, estradas e aeroportos do Japão.", cena: CENAS.haneda,
    p: ["Segunda-feira, 12 de agosto de 1985. Fazia calor em Tóquio, aquele calor úmido de fim de verão, e o Japão inteiro estava pegando a estrada para o Obon, o feriado em que as famílias voltam às cidades natais para visitar os pais e honrar os antepassados. Trens lotados, estradas paradas, aeroportos cheios.", "No saguão de Haneda, a fila do balcão da Japan Air Lines misturava gente de todo tipo: executivos de terno que tinham emendado o trabalho com a folga, mães com crianças pequenas no colo, avós voltando de uma visita aos netos, estudantes carregando sacolas de presentes. No Japão, quem viaja leva sempre uma lembrancinha da cidade de onde vem, o omiyage, e muitas mãos seguravam caixinhas embrulhadas com capricho.", "O voo 123 para Osaka era uma das rotas mais curtas e comuns do país, cerca de uma hora no ar. Uma ponte aérea. Para muita gente, mais rápida e mais confortável que o trem-bala naquela véspera de feriado. O avião estava praticamente lotado: 509 passageiros.", "Era um Boeing 747SR, a versão de \"curto alcance\" feita para o Japão, reforçada para decolar e pousar muitas vezes por dia. Aquele, o JA8119, já tinha mais de 18.000 voos. Na cabine, três homens experientes: o primeiro-oficial Yutaka Sasaki, em treinamento para comandante, pilotava do assento da esquerda; ao lado dele, o comandante Masami Takahama, instrutor, com mais de 12.000 horas de voo; atrás, o engenheiro de voo Hiroshi Fukuda."] },
  { t: "Rumo ao pôr do sol", foto: { src: "assets/jal123-decolagem.webp", legenda: "Um 747 da Japan Air Lines subindo sobre a baía de Tóquio ao entardecer, com o monte Fuji ao fundo (imagem ilustrativa)" }, parte: 0, hora: "18:12", lugar: "Sobre a baía de Tóquio", sabia: "O 747SR tinha mais assentos que o 747 comum: era feito para as rotas curtas e lotadas dentro do Japão.", cena: CENAS.decolagem,
    p: ["O embarque terminou com algum atraso. As portas se fecharam, os comissários mostraram como usar o cinto e as máscaras de oxigênio, como fazem em todo voo, e muita gente nem prestou atenção. Era só mais uma viagem.", "Às 18:12, com 12 minutos de atraso, o 747 acelerou na pista de Haneda e subiu sobre a baía de Tóquio. Lá embaixo, os navios pareciam brinquedos e a cidade começava a acender as primeiras luzes. O avião fez a curva para o oeste, na direção do sol, que já estava baixo no horizonte e pintava as janelas de laranja.", "Quem estava do lado direito talvez tenha visto, ao longe, a silhueta do monte Fuji contra o céu do entardecer. Crianças grudavam o rosto nas janelas. Casais conversavam sobre os planos para o feriado. Alguns passageiros já cochilavam, cansados do dia, outros folheavam a revista de bordo. O ronco dos quatro motores era constante e tranquilizador.", "Na cabine de comando, a rotina de sempre: recolher o trem de pouso, recolher os flapes, conferir o checklist depois da decolagem, conversar com o controle de Tóquio, pedir para subir mais. Tudo normal. Lá atrás, os comissários se levantaram e começaram a preparar os carrinhos do serviço de bordo. Em menos de uma hora todos estariam em Osaka, a tempo do jantar com a família."] },
  { t: "18:24: o estrondo", foto: { src: "assets/jal123-cauda.webp", legenda: "Recriação do 747 logo depois do estrondo, com a maior parte do estabilizador vertical arrancada (imagem ilustrativa)" }, parte: 1, hora: "18:24", lugar: "Baía de Sagami, 24.000 pés", sabia: "A névoa da descompressão é condensação: o ar da cabine se expande, esfria de repente e a umidade vira neblina.", cena: CENAS.estrondo,
    p: ["Doze minutos depois da decolagem, o avião ainda subia, a cerca de 24.000 pés (7.300 m) sobre a baía de Sagami, ao sul de Tóquio. Então, às 18:24, veio um estrondo seco, vindo de trás.", "Em um instante a cabine se encheu de uma névoa branca. Não era fumaça: quando a pressão cai de repente, o ar esfria e a umidade vira neblina. Os ouvidos doeram, papéis voaram e as máscaras amarelas de oxigênio caíram do teto. Uma voz gravada começou a repetir, em japonês e em inglês, que era uma emergência.", "Lá atrás, a antepara de pressão traseira, a \"tampa\" em forma de cúpula que fecha a cabine na cauda, tinha se partido. O ar da cabine, mais pressurizado que o ar lá fora, explodiu para dentro da cauda, que não era feita para aguentar aquilo. Em frações de segundo, a maior parte do estabilizador vertical, a grande barbatana da cauda, foi arrancada e caiu no mar."] },
  { t: "Na cabine de passageiros", foto: { src: "assets/jal123-cabine.webp", legenda: "Foto real tirada por um passageiro dentro do voo 123, minutos depois da descompressão: as máscaras de oxigênio caídas e uma comissária no corredor. A câmera foi encontrada depois nos destroços." }, parte: 1, hora: "18:25", lugar: "Cabine de passageiros", sabia: "As máscaras de oxigênio dos passageiros duram poucos minutos, o tempo de o avião descer a uma altitude onde se respira sem ajuda.", cena: CENAS.cabine,
    p: ["Os comissários correram pelos corredores ajudando as pessoas a colocar as máscaras, mostrando como apertar o cinto e como se curvar para a frente, a posição de impacto. Muita gente achou que era um susto que ia passar. O avião, afinal, continuava voando.", "Mas logo o 747 começou a se mexer de um jeito que ninguém ali tinha sentido: balançava de um lado para o outro e subia e descia em ondas longas, como um barco num mar agitado. Segundo uma das sobreviventes, uma comissária da JAL que viajava de folga, uma parte do teto perto dos banheiros do fundo tinha se aberto.", "Um passageiro chegou a fotografar a cabine com as máscaras penduradas e as pessoas sentadas, assustadas mas quietas. As fotos foram encontradas anos depois, no filme da câmera dele, e estão entre as imagens mais impressionantes da história da aviação."] },
  { t: "\"Uncontrollable\"", foto: { src: "assets/jal123-hidraulico.webp", legenda: "Painel do sistema hidráulico de um 747 clássico, no posto do engenheiro de voo, com os quatro sistemas sem pressão (imagem ilustrativa)" }, parte: 1, hora: "18:27", lugar: "Cabine de comando", sabia: "7700 é o código universal de emergência do transponder: no radar, o avião passa a aparecer destacado para todos os controladores.", cena: CENAS.painel,
    p: ["Na cabine de comando, os alarmes tocavam. Os pilotos primeiro pensaram que uma das portas do fundo tinha se aberto. Acionaram o código 7700 de emergência e pediram ao controle de Tóquio para voltar a Haneda.", "Foi então que o engenheiro de voo leu os mostradores e deu a pior notícia possível: a pressão hidráulica estava caindo. Os quatro sistemas hidráulicos do 747, os \"músculos\" que movem os lemes, os ailerons e os profundores, tinham as linhas passando pela cauda. Todas foram cortadas, e o fluido vazou em poucos minutos.", "O comandante girava o manche e nada acontecia. O avião simplesmente não obedecia. Quando o controlador pediu para virarem, a resposta pelo rádio foi uma palavra só: \"Uncontrollable\". Incontrolável.", "Percebendo a situação, o controlador fez algo raro: liberou a tripulação para falar em japonês em vez do inglês padrão da aviação, para que eles não perdessem nenhum segundo traduzindo. Os outros aviões foram afastados da frequência.", "A investigação observou depois que os pilotos não colocaram as próprias máscaras de oxigênio. A 24.000 pés, a falta de ar pode ter atrapalhado o raciocínio nos primeiros minutos, justamente os mais críticos."] },
  { t: "A montanha-russa: fugoide e dutch roll", parte: 2, hora: "18:30", lugar: "Sobre a península de Izu", sabia: "Num avião normal, a fugoide é tão lenta e suave que o piloto corrige sem perceber. O que tornou o JAL 123 terrível foi não haver comandos para amortecê-la.", cena: CENAS.fugoide,
    p: ["Sem a deriva e sem comandos, o 747 entrou em dois movimentos que normalmente o próprio avião e os pilotos corrigem sem que ninguém perceba.", "O primeiro foi a fugoide. Funciona como uma gangorra entre altura e velocidade: o nariz sobe, o avião ganha altura mas perde velocidade; com menos velocidade, as asas sustentam menos e o nariz cai; descendo, ele ganha velocidade, a sustentação volta e o nariz sobe de novo. O ciclo se repete, e cada onda pode levar mais de um minuto. Num avião normal, os profundores amortecem isso. No JAL 123, sem hidráulico, ninguém conseguia parar a gangorra. Por dentro, era como estar num elevador que sobe e despenca sem parar.", "O segundo foi o dutch roll: o avião guinava para um lado, inclinava as asas, guinava para o outro, num balanço em forma de \"S\" deitado. Quem amortece esse movimento é justamente o estabilizador vertical, e ele não existia mais.", "Os dois movimentos juntos faziam o avião subir, cair e balançar ao mesmo tempo. Para os passageiros, eram 30 minutos de enjoo, medo e incerteza."] },
  { t: "Pilotando com os motores", foto: { src: "assets/jal123-manetes.webp", legenda: "As quatro manetes de um 747 clássico: sem hidráulico, eram o único controle que restava aos pilotos (imagem ilustrativa)" }, parte: 2, hora: "18:40", lugar: "Rumo ao norte, sobre Yamanashi", sabia: "Em 1989, a tripulação do voo United 232, em Sioux City, nos Estados Unidos, também perdeu todo o hidráulico e usou só os motores para chegar a uma pista.", cena: CENAS.manetes,
    p: ["Sem nenhum comando, sobrava uma única ferramenta: os quatro motores. A tripulação começou a mexer nas manetes de um jeito que nenhum manual ensinava. Mais potência para o nariz subir, menos potência para descer, mais força de um lado que do outro para tentar virar.", "Funcionou, em parte. Era como dirigir um carro sem volante, usando só o acelerador e a diferença de força entre as rodas. Às 18:40, baixaram o trem de pouso pelo sistema alternativo, que solta as rodas pela gravidade. O arrasto das rodas ajudou a amortecer as oscilações e deixou o avião um pouco mais estável.", "A base aérea americana de Yokota, a oeste de Tóquio, avisou que estava pronta para recebê-los. Mas fazer um 747 sem comandos acertar uma pista era quase impossível, e o avião foi sendo levado para o noroeste, em direção às montanhas de Gunma."] },
  { t: "Os últimos minutos", foto: { src: "assets/jal123-montanhas.webp", legenda: "Recriação de um 747 em descida descontrolada sobre as montanhas, ao anoitecer (imagem ilustrativa)" }, parte: 2, hora: "18:56", lugar: "Montanhas de Gunma", sabia: "O GPWS, o sistema de alerta de proximidade do solo, avisa com voz e luz quando o avião está perigosamente perto do terreno.", cena: CENAS.montanhas,
    p: ["O avião perdeu milhares de pés numa descida longa e chegou perto de montanhas mais altas que ele. Com os motores no máximo, a tripulação conseguiu fazê-lo subir de novo. Na gravação da cabine, ouve-se o comandante repetindo para levantar o nariz, a voz cada vez mais tensa.", "Em certo momento ele disse: \"Isto pode não ter jeito\". Mesmo assim, os três não pararam. Ajustavam as manetes, liam os instrumentos e trocavam informações até o último segundo.", "Nos minutos finais, o alarme de proximidade do solo começou a gritar \"pull up\", \"pull up\". Às 18:56, depois de 32 minutos sem comandos, a ponta da asa direita tocou as árvores de uma crista, o avião virou e bateu no terreno perto do Cume Osutaka, na província de Gunma, a cerca de 100 km de Tóquio. Ele se partiu e pegou fogo."] },
  { t: "Bilhetes de despedida", foto: { src: "assets/jal123-bilhete.webp", legenda: "Página da agenda de um passageiro, com uma mensagem de despedida à família escrita durante a descida" }, parte: 3, hora: "18:56", lugar: "Os bilhetes", sabia: "Os bilhetes escritos durante a descida foram entregues às famílias e se tornaram um dos símbolos da memória do voo 123 no Japão.", cena: CENAS.bilhetes,
    p: ["Durante aquela meia hora, alguns passageiros entenderam o que estava acontecendo e escreveram mensagens para quem ficava. Em agendas, cartões e no verso de envelopes, com a letra tremida pelo balanço do avião.", "Um pai escreveu aos filhos pedindo que fossem bons e cuidassem da mãe. Outros só deixaram \"obrigado\" e \"adeus\". Os bilhetes foram encontrados nos destroços e entregues às famílias. Até hoje são lembrados no Japão como o retrato mais humano da tragédia.", "Entre as 520 vítimas estava Kyu Sakamoto, cantor de \"Ue o Muite Arukō\", a música conhecida no mundo como \"Sukiyaki\", que em 1963 chegou ao primeiro lugar nos Estados Unidos."] },
  { t: "A noite na montanha", foto: { src: "assets/jal123-c130.webp", legenda: "Recriação da vista da cabine de um avião de busca sobre o fogo na encosta, naquela noite (imagem ilustrativa)" }, parte: 3, hora: "19:15", lugar: "Cume Osutaka, Gunma", sabia: "O local do acidente fica numa área de montanha, sem estrada: as equipes tiveram de chegar pela floresta, em terreno muito íngreme.", cena: CENAS.noite,
    p: ["Cerca de 20 minutos depois da queda, a tripulação de um avião C-130 da Força Aérea americana, da base de Yokota, viu os destroços em chamas na encosta e passou a posição. Um helicóptero americano chegou a ser mandado, mas a ajuda não foi aceita. As equipes japonesas só chegaram ao local na manhã seguinte, mais de 12 horas depois.", "Lá encontraram quatro sobreviventes, todas mulheres, entre elas a comissária de folga e uma menina de 12 anos. Elas contaram que, durante a noite, ouviram outras pessoas vivas chamando e gemendo nos destroços, vozes que foram se calando até o amanhecer. Médicos disseram depois que mais gente poderia ter sido salva se o resgate tivesse chegado antes."] },
  { t: "A investigação", foto: { src: "assets/jal123-deriva.webp", legenda: "Recriação de um pedaço do estabilizador vertical boiando no mar, como os que foram achados na baía de Sagami (imagem ilustrativa)" }, parte: 4, hora: "1985–87", lugar: "Comissão de investigação", sabia: "O NTSB, que participou da investigação, é a agência americana que investiga acidentes de avião, trem, navio e estrada.", cena: CENAS.lupa,
    p: ["A investigação ficou a cargo da Comissão de Investigação de Acidentes Aeronáuticos do Japão, com a participação do NTSB, a agência americana de segurança nos transportes, e de engenheiros da Boeing.", "Partes da cauda foram encontradas boiando na baía de Sagami, exatamente por onde o avião passava às 18:24. Era a prova de que o problema tinha começado lá atrás, em pleno voo, e não na queda.", "Nos destroços, os investigadores examinaram a antepara traseira de perto, com lupas e microscópios. Ao longo de uma emenda, encontraram rachaduras de fadiga que tinham crescido aos poucos, voo após voo, em volta dos furos dos rebites. Seguindo essas marcas, chegaram a um conserto feito sete anos antes.", "O relatório final, publicado em junho de 1987, concluiu que a antepara cedeu por causa de um reparo malfeito em 1978. A Boeing assumiu a responsabilidade pelo erro."] },
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
    cauda: 'assets/cauda-jal.webp', mapaImg: 'assets/jal123-mapa.webp', mapa: mapaJal123, esquema: falhaJal123, fugoide: fugoideJal123,
    fuso: 'Linha do tempo · horário de Tóquio, alguns aproximados', fugoideTit: 'A fugoide: subindo e descendo sem controle',
    fugoideTxt: 'Sem os profundores, cada subida custava velocidade e cada descida a devolvia. O 747 ficou preso nessa gangorra, subindo e descendo centenas de metros por vez, enquanto o dutch roll o balançava de lado.',
  },
  {
    id: 'af447', ano: 2009, data: '31 de maio de 2009 (1º de junho em Paris)', titulo: 'Air France 447', sub: 'O voo Rio–Paris que caiu no meio do Atlântico',
    resumo: 'Um Airbus A330 moderno, três pilotos experientes e um avião sem nenhum defeito grave. Uma pane de um minuto nos medidores de velocidade, no meio de uma noite de tempestades, vira 4 minutos e 23 segundos de confusão que terminam no mar.',
    ficha: [['Avião', 'Airbus A330-203'], ['Matrícula', 'F-GZCP'], ['Rota', 'Rio de Janeiro (Galeão) → Paris (Charles de Gaulle)'], ['Local', 'Oceano Atlântico, perto da linha do Equador, a cerca de 1.100 km de Natal'],
      ['A bordo', '228 (216 passageiros e 12 tripulantes)'], ['Mortos', '228'], ['Sobreviventes', 'Nenhum'], ['Causa', 'Sondas pitot congeladas e um estol que a tripulação não reconheceu']],
    numeros: [['228', 'a bordo'], ['228', 'mortos'], ['0', 'sobreviventes'], ['4 min 23 s', 'do alarme ao mar']],
    fuso: 'Linha do tempo · horário de Brasília (UTC−3)',
    partes: ['Antes do voo', 'A noite sobre o oceano', '4 minutos e 23 segundos', 'A busca', 'Causas e consequências'],
    secoes: [
  { t: "O último voo de domingo", foto: { src: "assets/af447-galeao.webp", legenda: "Um A330 da Air France no pátio do Galeão ao entardecer, com as montanhas do Rio ao fundo (imagem ilustrativa)" }, parte: 0, hora: "Fim de tarde", lugar: "Aeroporto do Galeão, Rio de Janeiro", sabia: "O AF 447 saía do Rio todas as noites e chegava a Paris na manhã seguinte. Era um voo noturno típico: jantar, luzes apagadas e quase onze horas de viagem.", cena: CENAS.galeao,
    p: ["Domingo, 31 de maio de 2009. Fim de tarde no Rio de Janeiro, o céu já escuro e o ar ainda morno de outono. No saguão do Galeão, a fila do balcão da Air France para Paris tinha de tudo: executivos voltando para a Europa depois de uma semana de reuniões, casais encerrando as férias, famílias inteiras, estudantes, gente que ia visitar parentes.", "Eram 216 passageiros de 32 países, a maioria franceses, brasileiros e alemães. Havia 126 homens, 82 mulheres, sete crianças e um bebê. Entre eles estavam o príncipe Pedro Luís de Orléans e Bragança, de 26 anos, da antiga família imperial brasileira, e o maestro Silvio Barbato.", "Também ia a bordo a esposa de um dos pilotos. Era comum: familiares de tripulantes aproveitavam lugares livres para acompanhar a viagem.", "Para quase todos, era só mais um voo noturno. Jantar, um filme, dormir um pouco e acordar sobre a Europa, com o café da manhã."] },
  { t: "Decolagem do Galeão", foto: { src: "assets/af447-decolagem.webp", legenda: "Um A330 da Air France decolando à noite no Rio de Janeiro (imagem ilustrativa)" }, parte: 0, hora: "19:29", lugar: "Rio de Janeiro", sabia: "Em voos longos, a lei exige três pilotos. Eles se revezam: enquanto dois ficam nos comandos, o terceiro descansa numa pequena cabine com beliche, logo atrás da cabine de comando.", cena: CENAS.decolagemRio,
    p: ["O avião era um Airbus A330-203 de matrícula F-GZCP, entregue à Air France em 2005. Moderno, com comandos eletrônicos (o famoso fly-by-wire) e sem nenhum defeito registrado que impedisse o voo.", "Na cabine iam três pilotos. O comandante Marc Dubois, de 58 anos, tinha quase 11.000 horas de voo e muita experiência em rotas para a América do Sul. O copiloto David Robert, de 37, tinha cerca de 6.500 horas. O mais novo, Pierre-Cédric Bonin, de 32, tinha perto de 3.000.", "Às 19:29, o A330 decolou com 228 pessoas a bordo. Pelas janelas do lado direito, a cidade virou um tapete de luzes: a orla, os morros, a baía de Guanabara. Em poucos minutos, só restava o escuro.", "O avião subiu até 35.000 pés (cerca de 10.700 metros) e apontou para o nordeste, seguindo a costa do Brasil rumo a Natal. Na cabine de passageiros, os comissários começaram a servir o jantar."] },
  { t: "Para além do radar", foto: { src: "assets/af447-lua.webp", legenda: "Um A330 sobre o Atlântico à noite, entre nuvens, a caminho da linha do Equador (imagem ilustrativa)" }, parte: 1, hora: "22:35", lugar: "Sobre o Atlântico, perto do ponto INTOL", sabia: "Sobre o meio do oceano não há radar. Os aviões informam a posição pelo rádio de alta frequência ou por mensagens de dados, e o controle acompanha esses relatos.", cena: CENAS.oceano,
    p: ["Três horas depois, o avião deixou a costa brasileira para trás. Às 22:33 passou pelo ponto INTOL, e às 22:35 fez o último contato com o controle de Recife, o Atlântico. Dali em diante, ficaria fora do alcance dos radares, numa faixa de oceano sem nada embaixo além de água.", "O próximo contato seria com o controle de Dakar, no Senegal, do outro lado do oceano. Esse contato nunca aconteceu.", "Na cabine de passageiros, o jantar já tinha sido recolhido e as luzes foram baixadas. Muitos dormiam, encolhidos sob os cobertores; outros assistiam a filmes nas telinhas dos encostos.", "Lá na frente, os pilotos conversavam sobre o que vinha pela frente: a Zona de Convergência Intertropical, a faixa perto da linha do Equador onde os ventos dos dois hemisférios se encontram e formam tempestades enormes, com nuvens que sobem mais alto do que os aviões voam. Comentaram que o ar estava mais quente que o normal, o que impedia o avião de subir para uma altitude acima do mau tempo."] },
  { t: "O comandante vai descansar", foto: { src: "assets/af447-tempestade.webp", legenda: "Recriação do A330 contornando uma tempestade da Zona de Convergência Intertropical (imagem ilustrativa)", tag: "Curva de 12° à esquerda" }, parte: 1, hora: "23:01", lugar: "Atlântico, perto da linha do Equador", sabia: "Os relatórios mostram que, ao sair, o comandante não disse com clareza quem ficaria no comando. Bonin pilotava, mas Robert era o mais experiente dos dois.", cena: CENAS.tempestade,
    p: ["Às 23:01, o comandante Dubois levantou-se para o seu turno de descanso, como estava previsto. David Robert, que tinha descansado antes, assumiu a cadeira da esquerda. Bonin continuou na da direita, pilotando.", "O comandante saiu sem dar instruções detalhadas sobre a tempestade à frente nem deixar claro quem decidia o quê. Era uma passagem rotineira, numa noite que parecia rotineira.", "Minutos depois, o avião entrou nas nuvens. Começou a balançar. Os pilotos sentiram um cheiro diferente, como de eletricidade, e notaram que lá fora o ar estava estranhamente quente. Às 23:06, Bonin avisou os comissários de que iam entrar numa área de turbulência.", "Robert olhou o radar meteorológico e sugeriu desviar. Às 23:08, o avião fez uma curva de 12 graus para a esquerda, contornando a pior parte. Também reduziram um pouco a velocidade, como se faz em turbulência. Tudo estava sob controle. Faltavam dois minutos."] },
  { t: "23:10: os velocímetros enlouquecem", parte: 2, hora: "23:10", lugar: "35.000 pés, dentro das nuvens", sabia: "A sonda pitot é um tubinho no nariz do avião que mede a pressão do ar que entra nele. Dessa pressão sai a velocidade. Se o tubo entope, a velocidade mostrada fica errada.", cena: CENAS.pitot,
    p: ["A 35.000 pés, a temperatura lá fora era de mais de 40 graus abaixo de zero. Dentro das nuvens de tempestade, o ar estava cheio de minúsculos cristais de gelo. Eles começaram a se acumular dentro das sondas pitot, os tubinhos que medem a velocidade.", "Às 23:10:05 seg, as sondas entupiram. Em segundos, a velocidade mostrada nos painéis despencou de cerca de 275 nós para perto de 60. Os computadores perceberam que os números não faziam sentido. O piloto automático se desligou com um alarme, e logo depois o controle automático dos motores também.", "Bonin pôs a mão no manche lateral e disse: “Eu tenho os comandos.” Robert respondeu: “Ok.”", "O avião estava perfeito. Os motores funcionavam, as asas estavam intactas, a altitude e a atitude (a posição do nariz) continuavam sendo mostradas corretamente. Só a velocidade estava errada, e só por um tempo. Bastava manter o nariz na mesma posição e esperar o gelo derreter. Mas ninguém na cabine estava esperando por aquilo."] },
  { t: "O nariz para cima", foto: { src: "assets/af447-painel.webp", legenda: "Recriação do painel do A330 quando o piloto automático se desligou: AP OFF, lei alternada e alarme de estol (imagem ilustrativa)" }, parte: 2, hora: "23:10", lugar: "Subindo de 35.000 para 38.000 pés", sabia: "Sem o piloto automático e com a velocidade inválida, o A330 entra em \"lei alternada\": muitas proteções automáticas que impedem o avião de passar dos limites deixam de funcionar.", cena: CENAS.alarme,
    p: ["Na turbulência, o avião inclinou para a direita. Bonin corrigiu com o manche, mas exagerou nos movimentos, para um lado e para o outro. E puxou o manche para trás. O nariz subiu.", "Dois avisos curtos soaram na cabine, uma voz sintética dizendo “STALL, STALL” (estol, em inglês). Duraram um instante e pararam. Robert leu os alarmes no painel: “Perdemos as velocidades... lei alternada.”", "O avião começou a subir rápido, a 7.000 pés por minuto. Robert percebeu: “Olha a velocidade... Você está subindo. Desce, desce!” Bonin baixou um pouco o nariz, mas não o suficiente. O avião continuou subindo e perdendo velocidade, como uma bola jogada para o alto.", "Robert apertou várias vezes a campainha que chama o comandante. “Ele vem ou não vem?”, perguntou, nervoso. Em menos de um minuto, o gelo derreteu e as velocidades voltaram ao normal. O problema que tinha começado tudo já não existia. Mas o avião agora estava indo para um problema muito maior."] },
  { t: "O estol", foto: { src: "assets/af447-estol.webp", legenda: "Recriação do A330 com o nariz para cima, perto dos 38.000 pés, já sem velocidade para continuar voando (imagem ilustrativa)", tag: "STALL · STALL" }, parte: 2, hora: "23:10:51 seg", lugar: "38.000 pés", sabia: "Estol é quando a asa inclina demais em relação ao vento e o ar se descola dela. A asa deixa de sustentar o avião, não importa quanta força os motores façam.", cena: CENAS.estol,
    p: ["Perto dos 38.000 pés, o ar é rarefeito e o avião não tem mais velocidade para continuar subindo. Às 23:10:51 seg, o alarme de estol voltou. Desta vez não parou: tocou sem interrupção por 54 segundos.", "O avião tremia inteiro, um chacoalhar que os pilotos chamam de buffet: o ar se descolando das asas. Bonin fez o que tinha aprendido para uma situação perto do chão: motores na potência máxima e nariz para cima. A 38.000 pés, isso não funciona. Sem velocidade, a asa simplesmente não sustenta.", "O A330 parou de voar e começou a cair. O nariz continuava apontado para cima, a cerca de 15 graus, mas o avião descia quase reto, de barriga, a uma velocidade que chegou a 10.000 pés por minuto, mais de 180 km/h para baixo. O ângulo entre a asa e o vento passou de 40 graus.", "Era noite fechada, dentro das nuvens. Não havia horizonte lá fora para mostrar o que estava acontecendo. Nos painéis, os números de altitude giravam para baixo cada vez mais rápido."] },
  { t: "“O que vocês estão fazendo?”", foto: { src: "assets/af447-cabine.webp", legenda: "Cabine de passageiros no escuro (imagem ilustrativa). Nenhum aviso foi dado aos passageiros, e as máscaras de oxigênio não caíram: a cabine continuou pressurizada até o fim." }, parte: 2, hora: "23:11:42 seg", lugar: "Caindo, abaixo de 35.000 pés", sabia: "Quando a velocidade medida fica abaixo de 60 nós, os computadores do A330 a consideram inválida e o alarme de estol se cala, justamente quando o estol está pior.", cena: CENAS.cabineNoite,
    p: ["Às 23:11:42 seg, o comandante Dubois entrou na cabine. Tinha passado só um minuto e meio desde o desligamento do piloto automático. “O que vocês estão fazendo?”, perguntou.", "“Perdemos o controle do avião, não estamos entendendo nada, já tentamos de tudo”, respondeu Robert. O comandante sentou-se na cadeira de trás, atrás dos dois, olhando os instrumentos. Não reassumiu os comandos.", "Os painéis mostravam um quadro confuso. O avião caía, mas o nariz estava alto. A velocidade era tão baixa que os computadores passaram a considerá-la inválida, e o alarme de estol parou de tocar. Quando Bonin empurrava o manche para a frente, o certo a fazer, a velocidade subia, voltava a ser válida e o alarme tocava de novo. Era como se o avião punisse a manobra certa.", "Na cabine de passageiros, ninguém recebeu nenhum aviso. Não há gravação de lá. Pelos dados, o avião sacudia como numa turbulência forte, inclinado para trás, balançando de um lado para o outro. As máscaras de oxigênio não caíram, porque a cabine continuava pressurizada. Talvez muitos nem tenham entendido que o avião estava caindo."] },
  { t: "Dois manches, duas ordens", parte: 2, hora: "23:13:40 seg", lugar: "Menos de 10.000 pés acima do mar", sabia: "Nos Airbus, os dois manches laterais não são ligados entre si: um piloto não sente o que o outro está fazendo. Se os dois mexem ao mesmo tempo, os comandos se somam e soa o alarme \"DUAL INPUT\".", cena: CENAS.manches,
    p: ["Durante quase três minutos, os três tentaram entender o que estava acontecendo. Falavam de altitude, de potência, de inclinação. Ninguém disse a palavra estol.", "Às 23:13:40 seg, Bonin disse a frase que mudaria tudo, se tivesse vindo antes: “Mas eu estou com o manche todo para trás faz tempo!”", "O comandante reagiu na hora: “Não, não, não, não suba!” Robert: “Então desce. Me dá os comandos, os comandos para mim!” Robert apertou o botão que dá prioridade ao manche dele e empurrou o nariz para baixo. Pela primeira vez, a saída estava sendo tentada.", "Mas já era tarde. A essa altura, para sair do estol, o avião precisaria baixar muito o nariz e mergulhar, ganhando velocidade, e não havia mais altura para isso. Segundos depois, Bonin voltou a puxar o manche, e o alarme \"DUAL INPUT\" soou: cada um mandava o avião para um lado."] },
  { t: "Os últimos segundos", foto: { src: "assets/af447-queda.webp", legenda: "Recriação do A330 nos últimos segundos, de nariz para cima e caindo em direção ao mar (imagem ilustrativa)", tag: "SINK RATE · PULL UP" }, parte: 2, hora: "23:14:28 seg", lugar: "Oceano Atlântico", sabia: "As falas dos pilotos foram gravadas em francês pelo gravador de voz da cabine (CVR) e publicadas pelo BEA, o órgão francês de investigação. As frases aqui estão traduzidas.", cena: CENAS.queda,
    p: ["O alarme de proximidade do solo começou a gritar: “SINK RATE, PULL UP” (descida rápida, puxe para cima). O avião estava a cerca de 2.000 pés do mar, que ninguém via no escuro.", "“Vamos bater!”, disse Bonin. “Não é possível! Mas o que está acontecendo?”", "As últimas palavras gravadas foram do comandante, lendo o instrumento: “Dez graus de atitude.”", "Às 23:14:28 seg, o A330 bateu de barriga na água, com o nariz 16 graus para cima, a uma velocidade de cerca de 200 km/h para baixo. Essa é a velocidade vertical: a cada minuto, o avião descia quase 11.000 pés, mais de 3 quilômetros. Ao mesmo tempo, ele também andava para a frente, a cerca de 198 km/h. Essa é a velocidade horizontal. Ou seja, o avião não mergulhou de bico: caiu quase deitado, descendo tão rápido quanto avançava. O impacto foi violento demais para qualquer um sobreviver. Desde que o piloto automático desligou, tinham passado 4 minutos e 23 segundos. Todas as 228 pessoas a bordo morreram."] },
  { t: "O avião que não chegou", foto: { src: "assets/af447-painel-voos.webp", legenda: "Painel de voos com o AF 447 para Paris marcado como atrasado (imagem ilustrativa)" }, parte: 3, hora: "1º de junho", lugar: "Dakar, Paris e Rio de Janeiro", sabia: "Entre 23:10 e 23:14, o avião mandou sozinho 24 mensagens automáticas de manutenção (ACARS) para a Air France. Elas foram as primeiras pistas do que tinha falhado.", cena: CENAS.painelParis,
    p: ["O controle de Dakar esperava o contato do AF 447, que não veio. No começo, achou-se que fosse só um problema de rádio, algo que acontece sobre o oceano. As horas passaram, e o avião nunca chegou ao espaço aéreo seguinte.", "Na manhã de 1º de junho, em Paris, o painel de chegadas do aeroporto Charles de Gaulle mostrava o voo de Rio como atrasado. Parentes e amigos esperavam no saguão. Até que funcionários da Air France os levaram para uma sala reservada. No Rio, cenas parecidas aconteciam no Galeão.", "Nos computadores da Air France havia uma sequência de mensagens automáticas que o avião tinha enviado nos seus últimos minutos: velocidades incoerentes, piloto automático desligado, proteções perdidas. A última chegou às 23:14.", "O presidente francês, Nicolas Sarkozy, foi ao aeroporto encontrar as famílias. No Brasil, a Força Aérea e a Marinha começaram a varrer o oceano perto da linha do Equador."] },
  { t: "Destroços no Atlântico", foto: { src: "assets/af447-deriva.webp", legenda: "Militares da Marinha do Brasil recolhem do mar o estabilizador vertical do AF 447, em junho de 2009. Foto divulgada pelas Forças Armadas brasileiras." }, parte: 3, hora: "Junho de 2009", lugar: "Oceano Atlântico, perto da linha do Equador", sabia: "O estabilizador vertical, a cauda do avião, foi achado boiando quase inteiro. Ele foi uma das provas de que o A330 caiu inteiro, de barriga, e não se partiu no ar.", cena: CENAS.busca,
    p: ["Em 2 de junho, um avião da Força Aérea Brasileira avistou os primeiros destroços boiando no mar, a centenas de quilômetros da costa. Nos dias seguintes, navios da Marinha do Brasil e da França recolheram pedaços do avião, poltronas, bagagens e coletes salva-vidas que nunca foram usados.", "Em 6 de junho foram encontrados os primeiros corpos. Ao todo, 50 vítimas foram resgatadas naquele mês. As autópsias e os destroços indicavam que o avião bateu de barriga, com enorme força vertical.", "O que faltava eram as caixas-pretas. Elas tinham afundado com o resto do avião, num fundo de oceano montanhoso, a quase 4.000 metros de profundidade. Os sinalizadores que ajudam a encontrá-las têm bateria para cerca de 30 dias.", "Os 30 dias passaram. Submarino, navios com sonar e robôs procuraram em vão. Sem as caixas-pretas, ninguém podia dizer com certeza o que tinha acontecido."] },
  { t: "Quase dois anos no escuro", foto: { src: "assets/af447-fundo.webp", legenda: "Recriação de um robô submarino iluminando destroços do AF 447 no fundo do Atlântico, a quase 4.000 metros (imagem ilustrativa; os dados na tela não são de uma gravação real)" }, parte: 3, hora: "2009–2011", lugar: "Fundo do Atlântico, 3.900 metros", sabia: "Os robôs REMUS 6000, usados para achar o avião, são do Instituto Oceanográfico Woods Hole, dos Estados Unidos. Eles vasculham o fundo do mar sozinhos, por horas, com sonar.", cena: CENAS.fundo,
    p: ["Por quase dois anos, o AF 447 foi um mistério. Houve três campanhas de busca no fundo do mar, sem sucesso. Surgiram teorias de todo tipo, de bomba a raio. As famílias viviam sem respostas.", "Em 2011 começou a quarta busca, com robôs submarinos autônomos que varriam o fundo com sonar. Em abril, depois de uma semana de trabalho, um deles encontrou um campo de destroços a cerca de 3.900 metros de profundidade: motores, pedaços da fuselagem, o trem de pouso.", "Em 1º de maio, um robô controlado de um navio francês trouxe à superfície o gravador de dados de voo. No dia seguinte, o gravador de voz da cabine. Depois de 23 meses a 3.900 metros de profundidade, as memórias estavam intactas.", "Naquela campanha, mais 104 corpos foram retirados do fundo do mar. Outras 74 vítimas nunca foram recuperadas e continuam no Atlântico."] },
  { t: "O que as caixas-pretas contaram", foto: { src: "assets/af447-relatorio.webp", legenda: "O relatório final do BEA sobre o AF 447, publicado em 5 de julho de 2012 (imagem ilustrativa)" }, parte: 4, hora: "2011–2012", lugar: "BEA, Paris", sabia: "Uma das descobertas que mais chocaram os investigadores: em nenhum momento dos últimos minutos alguém na cabine disse que o avião estava em estol.", cena: CENAS.relatorio,
    p: ["Em 5 de julho de 2012, o BEA, órgão francês de investigação de acidentes aéreos, publicou o relatório final. A conclusão foi dura: não houve uma única causa, e sim uma corrente de falhas.", "Primeiro elo: as sondas pitot congelaram por cerca de um minuto, e o piloto automático se desligou. Segundo: o piloto fez movimentos exagerados e puxou o nariz para cima, sem que a tripulação aplicasse o procedimento de velocidade não confiável, que mandava manter a posição do nariz e a potência.", "Terceiro: os pilotos não perceberam a aproximação do estol, não reconheceram o estol quando ele aconteceu e por isso nunca fizeram a manobra de recuperação, que é baixar o nariz. O alarme que parava e voltava, a falta de um indicador de ângulo de ataque e os manches que não se sentem um ao outro ajudaram a confundir.", "E havia algo mais profundo: os pilotos eram treinados quase só para voar com a automação ligada. Quase nenhum treino ensinava a pilotar à mão, na altitude de cruzeiro, um avião que de repente fica sem as suas proteções. O comandante, ao sair, também não deixou claro quem mandava. Pilotos competentes, num avião sem defeito grave, se perderam em quatro minutos."] },
  { t: "As sondas que já davam problema", foto: { src: "assets/af447-sondas.webp", legenda: "Duas sondas Thales AA, como as do F-GZCP, ao lado de uma sonda Goodrich. Depois do acidente, a troca virou obrigatória (imagem ilustrativa)" }, parte: 4, hora: "2007–2009", lugar: "Airbus, Air France e EASA", sabia: "A EASA é a agência de segurança da aviação da União Europeia, equivalente à ANAC no Brasil e à FAA nos Estados Unidos.", cena: CENAS.sondas,
    p: ["O congelamento das sondas não era novidade. Antes do acidente, vários aviões A330 e A340 já tinham tido perdas de velocidade parecidas ao atravessar tempestades em grande altitude. Em todos esses casos, as tripulações conseguiram manter o avião sob controle.", "O F-GZCP usava sondas do modelo Thales AA. A Airbus tinha recomendado um modelo mais novo, mas sem tornar a troca obrigatória. A Air France, preocupada com os casos, tinha começado a substituí-las. As primeiras peças novas chegaram poucos dias antes do acidente, e o avião do AF 447 ainda não as tinha recebido.", "Depois do acidente, a EASA tornou obrigatório trocar as sondas Thales AA nos A330 e A340 e instalar modelos mais resistentes ao gelo.", "Para o BEA, as sondas foram o gatilho, mas não a causa da queda. Um minuto de velocidade errada não deveria derrubar um avião. O que derrubou foi o que aconteceu depois."] },
  { t: "Na Justiça", foto: { src: "assets/af447-tribunal.webp", legenda: "Fachada de um tribunal na França (imagem ilustrativa). O julgamento de apelação foi no Tribunal de Apelação de Paris, no Palácio da Justiça.", tag: "2023: absolvidas · 2026: condenadas" }, parte: 4, hora: "2009–2026", lugar: "Tribunais de Paris", sabia: "Na França, empresas podem responder criminalmente por um acidente. A multa de 225.000 euros era a pena máxima prevista para esse crime.", cena: CENAS.tribunal,
    p: ["Famílias das vítimas, reunidas em associações na França e no Brasil, lutaram por anos para que alguém fosse responsabilizado. A Airbus e a Air France foram acusadas de homicídio culposo, sem intenção de matar.", "Em 2019, os juízes de instrução arquivaram o caso. As famílias recorreram, e em 2021 a Justiça mandou as duas empresas a julgamento. Em abril de 2023, depois de um julgamento de dois meses, elas foram absolvidas: o tribunal apontou falhas da Airbus e da Air France, mas disse que não era possível provar com certeza que elas causaram o acidente.", "A promotoria recorreu. Em 21 de maio de 2026, o Tribunal de Apelação de Paris inverteu a decisão e condenou a Airbus e a Air France por homicídio culposo, com multa de 225.000 euros cada uma.", "Para muitas famílias, o valor foi simbólico, poucos minutos de faturamento das duas empresas. As duas anunciaram recurso ao Tribunal de Cassação, a última instância, que não julga de novo os fatos, só se a lei foi bem aplicada. Dezessete anos depois, o caso ainda não terminou."] },
    ],
    linha: [['19:29', 'Decolagem do Galeão, Rio de Janeiro, com 228 pessoas a bordo.', [235, 1226]], ['22:35', 'Último contato por rádio com o controle de Recife, perto do ponto INTOL. Dali em diante, sem radar.', [555, 569]],
      ['23:01', 'O comandante sai para descansar. O avião se aproxima das tempestades perto da linha do Equador.', [578, 525]], ['23:10', 'As sondas pitot congelam, o piloto automático se desliga e o avião sobe até entrar em estol.', [593, 495]],
      ['23:14', 'Queda no Atlântico, 4 minutos e 23 segundos depois do desligamento do piloto automático.', [600, 479]]],
    falha: 'Ponto de partida: cristais de gelo entupiram as sondas pitot por cerca de um minuto. A velocidade mostrada despencou, o piloto automático se desligou e o avião ficou nas mãos dos pilotos, sem as proteções de sempre.',
    mudou: ['A EASA tornou obrigatória a troca das sondas pitot Thales AA nos A330 e A340 por modelos mais resistentes ao gelo.',
      'O treinamento mudou no mundo inteiro: a recuperação de estol passou a priorizar baixar o nariz, mesmo perdendo altura, e o treino de prevenção e recuperação de atitudes anormais (UPRT) virou obrigatório na Europa e nos Estados Unidos.',
      'Os pilotos passaram a treinar mais o voo manual em grande altitude e o procedimento de velocidade não confiável.',
      'Os sinalizadores das caixas-pretas passaram a ter bateria para 90 dias, em vez de 30, e a OACI criou regras para que aviões em apuros sobre o oceano transmitam sua posição automaticamente.'],
    memoria: 'Em Paris, um memorial no cemitério Père-Lachaise lembra as 228 vítimas. No Brasil e na França, as associações de famílias mantêm viva a memória do voo e seguem acompanhando o processo na Justiça.',
    fontes: [['BEA: relatório final do AF 447 (2012)', 'https://bea.aero/en/investigation-reports/notified-events/detail/accident-to-the-airbus-a330-203-registered-f-gzcp-and-operated-by-air-france-occurred-on-06-01-2009-in-the-atlantic-ocean/'],
      ['Wikipedia: Air France Flight 447', 'https://en.wikipedia.org/wiki/Air_France_Flight_447'], ['Al Jazeera: condenação em 2026', 'https://www.aljazeera.com/news/2026/5/21/french-court-finds-airbus-air-france-guilty-of-manslaughter-in-2009-crash'],
      ['CNN: a transcrição da cabine', 'https://www.cnn.com/2011/10/14/world/americas/af447-transcript']],
    cauda: 'assets/cauda-af.webp', mapaImg: 'assets/af447-mapa.webp', mapa: mapaAf447, esquema: falhaAf447, fugoide: estolAf447,
    fugoideTit: 'O estol: nariz para cima, avião caindo',
    fugoideTxt: 'O nariz apontava para cima, o que dava a sensação de que o avião subia. Na verdade, ele caía quase reto, de barriga. Para sair do estol era preciso fazer o contrário do que parecia certo: baixar o nariz, mergulhar e ganhar velocidade.',
  },
  {
    id: 'mh370', ano: 2014, data: '8 de março de 2014', titulo: 'Malaysia Airlines MH370', sub: 'O avião que desapareceu',
    resumo: 'Um Boeing 777 sai de Kuala Lumpur para Pequim com 239 pessoas. Quarenta minutos depois, some dos radares, dá meia-volta no escuro e voa por mais de seis horas sem falar com ninguém. Até hoje, ninguém sabe exatamente por quê, nem onde ele está.',
    ficha: [['Avião', 'Boeing 777-200ER'], ['Matrícula', '9M-MRO'], ['Rota', 'Kuala Lumpur → Pequim'], ['Local', 'Desconhecido · provavelmente no sul do Oceano Índico'],
      ['A bordo', '239 (227 passageiros e 12 tripulantes)'], ['Mortos', '239 (presumidos)'], ['Sobreviventes', 'Nenhum'], ['Causa', 'Desconhecida']],
    numeros: [['239', 'a bordo'], ['239', 'mortos'], ['0', 'sobreviventes'], ['7 h 37 min', 'da decolagem ao último sinal']],
    fuso: 'Linha do tempo · horário da Malásia (UTC+8)',
    partes: ['Antes do voo', 'Silêncio no radar', 'Sete horas no escuro', 'A maior busca da história', 'O que se sabe e o que mudou'],
    secoes: [
  { t: "Uma noite em Kuala Lumpur", foto: { src: "assets/mh370-klia.webp", legenda: "Um Boeing 777 da Malaysia Airlines no pátio do aeroporto de Kuala Lumpur, à noite (imagem ilustrativa)" }, parte: 0, hora: "7 de março", lugar: "Aeroporto Internacional de Kuala Lumpur", sabia: "O MH370 era um voo noturno: sairia de Kuala Lumpur pouco depois da meia-noite e chegaria a Pequim às 06:30, depois de cerca de seis horas de viagem.", cena: CENAS.klia,
    p: ["Sexta-feira, 7 de março de 2014, fim de noite no aeroporto de Kuala Lumpur, na Malásia. No portão do voo MH370 da Malaysia Airlines, com destino a Pequim, as pessoas se acomodavam nas cadeiras para esperar o embarque, marcado para pouco depois da meia-noite.", "Eram 227 passageiros, a maioria chineses: 153, entre eles um bebê. Havia também 38 malaios e gente de mais de uma dezena de outros países. Um grupo de artistas chineses, calígrafos e pintores, voltava de uma exposição na Malásia. Vinte funcionários de uma mesma empresa de tecnologia viajavam a trabalho.", "Havia casais em lua de mel, famílias com crianças pequenas, gente voltando para casa depois das férias. Entre os passageiros, dois jovens iranianos viajavam com passaportes roubados. Mais tarde, a polícia concluiu que eles só queriam chegar à Europa para pedir refúgio, sem ligação com terrorismo.", "Os 12 tripulantes eram todos malaios. Para quase todos a bordo, era só mais um voo noturno: embarcar, dormir e acordar em Pequim."] },
  { t: "Rumo a Pequim", foto: { src: "assets/mh370-decolagem.webp", legenda: "Recriação do 9M-MRO decolando de Kuala Lumpur (imagem ilustrativa)" }, parte: 0, hora: "00:42", lugar: "Kuala Lumpur", sabia: "O 9M-MRO estava na Malaysia Airlines desde 2002. O Boeing 777 era considerado um dos aviões mais seguros do mundo e, até 2013, nunca tinha tido um acidente com mortes.", cena: CENAS.decolagemKL,
    p: ["O avião era um Boeing 777-200ER, de matrícula 9M-MRO, com dois grandes motores e capacidade para voar mais de 14 horas sem parar. Naquela noite, ele levava combustível para cerca de sete horas e meia de voo, o normal para uma viagem até Pequim com reserva.", "No comando estava Zaharie Ahmad Shah, de 53 anos, piloto da Malaysia Airlines desde 1981, com 18.365 horas de voo. Ao lado dele, o copiloto Fariq Abdul Hamid, de 27 anos, com 2.763 horas, que estava na empresa desde 2007.", "Às 00:42 de 8 de março, o MH370 decolou. Pelas janelas, as luzes de Kuala Lumpur e as Torres Petronas foram ficando para trás. O avião apontou para o nordeste, rumo ao Mar da China Meridional e ao Vietnã.", "À 01:01, chegou aos 35.000 pés, a altitude de cruzeiro. À 01:07, o sistema de mensagens automáticas do avião, o ACARS, mandou um relatório de rotina para a empresa. Seria o último."] },
  { t: "“Boa noite”", parte: 1, hora: "01:19:30 seg", lugar: "Mar da China Meridional", sabia: "Na passagem de um controle para outro, o piloto troca a frequência do rádio e se apresenta ao próximo controlador. É uma das tarefas mais rotineiras de um voo.", cena: CENAS.boaNoite,
    p: ["O avião se aproximava do ponto IGARI, no meio do mar, entre a Malásia e o Vietnã. Ali terminava a área do controle de Kuala Lumpur e começava a do controle de Ho Chi Minh, no Vietnã.", "À 01:19, o controlador de Kuala Lumpur fez a passagem de rotina: mandou o MH370 chamar Ho Chi Minh na frequência 120,9 e se despediu com um boa-noite.", "Da cabine, uma voz calma respondeu, em inglês: “Good night, Malaysian three seven zero.” Boa noite, Malaysian três sete zero.", "Foram as últimas palavras ouvidas do MH370. O avião nunca chamou o controle de Ho Chi Minh."] },
  { t: "O ponto IGARI", foto: { src: "assets/mh370-radar.webp", legenda: "Telas de um centro de controle (imagem ilustrativa). Sem o transponder, o MH370 sumiu das telas do controle civil", tag: "01:21:13 · o sinal do transponder some" }, parte: 1, hora: "01:21:13 seg", lugar: "Perto do ponto IGARI", sabia: "O transponder é o aparelho que responde ao radar dos controladores com a identificação, a altitude e a velocidade do avião. Sem ele, o avião vira só um ponto sem nome, e só os radares militares conseguem vê-lo.", cena: CENAS.igari,
    p: ["Menos de dois minutos depois, à 01:21:13 seg, o sinal do transponder do MH370 desapareceu das telas de controle, logo depois de o avião passar pelo ponto IGARI. A etiqueta com o nome do voo simplesmente sumiu do radar.", "Ninguém deu o alarme na hora. Em Ho Chi Minh, o controle esperava o contato do avião, que não veio. Só à 01:38 os vietnamitas ligaram para Kuala Lumpur perguntando pelo MH370.", "Seguiram-se horas de confusão. Os controladores dos dois países trocavam ligações, a empresa chegou a informar que o avião parecia estar sobre o Camboja, e um avião da própria Malaysia Airlines que passava pela região tentou chamar o MH370 pelo rádio. O piloto disse ter ouvido apenas chiado e algo parecido com um murmúrio.", "O centro de busca e salvamento só foi acionado às 05:30, mais de quatro horas depois do sumiço. O relatório oficial apontaria, anos depois, falhas dos controles de tráfego aéreo nessa noite."] },
  { t: "A volta no escuro", parte: 1, hora: "01:22", lugar: "Sobre a península da Malásia", sabia: "O radar militar é um radar primário: ele enxerga o eco de qualquer objeto grande no céu, com ou sem transponder, mas não sabe quem é.", cena: CENAS.curva,
    p: ["Enquanto os controles procuravam o avião, os radares militares da Malásia registravam um eco sem identificação. Logo depois do ponto IGARI, o MH370 fez uma curva fechada para a esquerda e deu meia-volta, para o sudoeste.", "O avião atravessou de volta a península da Malásia, passou perto de Kota Bharu e seguiu em direção à ilha de Penang, na costa oeste. Por volta da 01:52, passou ao sul de Penang, a cidade natal do comandante.", "Os militares viram o eco, mas não reagiram. Consideraram que era um avião civil, sem ameaça, e ninguém mandou caças para olhar de perto.", "A investigação concluiria que a curva muito provavelmente foi feita com o avião sendo pilotado à mão, e não pelo piloto automático. Quem pilotava, e por quê, continua sem resposta."] },
  { t: "O último eco", foto: { src: "assets/mh370-ultimo-eco.webp", legenda: "Recriação de uma tela de radar (imagem ilustrativa). No radar militar, o MH370 era só um eco sem nome: sem o transponder, não aparecia identificação, altitude nem velocidade.", tag: "02:22 · o último eco no radar militar" }, parte: 1, hora: "02:22", lugar: "Mar de Andamão", sabia: "Depois de Penang, o avião seguiu pelo Estreito de Malaca, uma das rotas de navios mais movimentadas do mundo, entre a Malásia e a ilha de Sumatra.", cena: CENAS.ultimoEco,
    p: ["Depois de Penang, o eco seguiu para o noroeste, sobre o Estreito de Malaca, em direção ao Mar de Andamão. O avião continuava em silêncio: sem rádio, sem transponder, sem mensagens.", "Às 02:22, o radar militar registrou o último eco do MH370, cerca de 200 milhas náuticas a noroeste de Penang. Depois disso, o avião saiu do alcance de todos os radares.", "Ninguém sabe o que acontecia lá dentro. Não se sabe se os passageiros perceberam a mudança de rumo, se estavam dormindo, se estavam conscientes. Nenhum telefone, nenhuma mensagem, nenhum pedido de socorro saiu do avião.", "Para o mundo, o MH370 tinha desaparecido. Mas ainda havia alguém escutando."] },
  { t: "O satélite que continuou ouvindo", foto: { src: "assets/mh370-satelite.webp", legenda: "Recriação de um satélite da Inmarsat em órbita sobre a Terra (imagem ilustrativa)", tag: "Um “aperto de mão” por hora" }, parte: 2, hora: "02:25", lugar: "Algum lugar sobre o Oceano Índico", sabia: "Os dados do MH370 foram analisados pela empresa britânica Inmarsat. Foi a primeira vez que esse tipo de sinal foi usado para tentar descobrir a rota de um avião.", cena: CENAS.satelite,
    p: ["Às 02:25, três minutos depois do último eco no radar, o terminal de comunicação por satélite do avião voltou a se conectar sozinho. Ele tinha sido desligado e religado, por um motivo que ninguém sabe explicar.", "O avião estava ligado a um satélite da empresa Inmarsat, parado sobre o Oceano Índico. A cada hora, mais ou menos, a estação em terra mandava um sinal perguntando se o avião ainda estava lá, e o terminal respondia sozinho. Era só um “aperto de mão”, sem posição, sem mensagem.", "Às 02:39 e às 07:13, a Malaysia Airlines ligou para o avião por esse satélite. O telefone tocou na cabine e ninguém atendeu.", "Mas os apertos de mão guardavam uma pista. Pelo tempo que o sinal levava para ir e voltar, dava para saber a que distância o avião estava do satélite. Cada resposta virava um arco sobre o mapa: o avião estava em algum ponto daquela linha."] },
  { t: "08:19", parte: 2, hora: "08:19", lugar: "Sul do Oceano Índico", sabia: "Pela análise de pequenas variações na frequência do sinal, os especialistas concluíram que o avião voou para o sul, e não para o norte, em direção à Ásia Central.", cena: CENAS.arco7,
    p: ["Às 06:30, o MH370 deveria pousar em Pequim. No aeroporto, famílias esperavam no saguão de desembarque. O painel mostrava o voo como atrasado. Às 07:24, a Malaysia Airlines anunciou que tinha perdido o contato com o avião.", "Enquanto isso, o 777 seguia voando sozinho, para o sul, sobre o oceano, havia horas. Às 08:11, respondeu a mais um aperto de mão.", "Às 08:19, o terminal mandou um último sinal, incompleto. Os especialistas acreditam que foi o momento em que o combustível acabou e os motores pararam: sem energia, o sistema reiniciou e tentou se conectar uma última vez. Esse sinal deu origem ao famoso 7º arco.", "Às 09:15, o satélite chamou de novo. Não houve resposta. O MH370 tinha caído em algum ponto do sul do Oceano Índico, um dos lugares mais remotos e profundos do planeta, quase sete horas e meia depois da decolagem."] },
  { t: "Procurando no lugar errado", foto: { src: "assets/mh370-busca.webp", legenda: "Recriação de navios e aviões de vários países na busca pelo MH370 (imagem ilustrativa)", tag: "26 países na busca" }, parte: 3, hora: "Março de 2014", lugar: "Mar da China Meridional", sabia: "Quatro meses depois, em julho de 2014, outro avião da Malaysia Airlines, o MH17, foi derrubado por um míssil sobre a Ucrânia, com 298 pessoas a bordo.", cena: CENAS.buscaMar,
    p: ["Nos primeiros dias, navios e aviões de vários países procuraram o MH370 no Mar da China Meridional, onde ele tinha sumido do radar civil. Manchas de óleo e objetos boiando foram examinados. Nada era do avião.", "Só alguns dias depois os militares malaios revelaram que tinham visto o eco voltando sobre a península. A busca se espalhou pelo Estreito de Malaca e pelo Mar de Andamão. Chegou a envolver 26 países.", "Em Pequim, as famílias passavam os dias num hotel, esperando notícias que não chegavam. As informações desencontradas do governo malaio e da empresa provocaram revolta.", "Em 15 de março, o primeiro-ministro da Malásia, Najib Razak, anunciou que as comunicações do avião tinham sido desligadas de forma deliberada e que ele tinha voado por horas depois de sumir do radar."] },
  { t: "“No sul do Oceano Índico”", parte: 3, hora: "24 de março", lugar: "Kuala Lumpur", sabia: "Em janeiro de 2015, as autoridades da Malásia declararam oficialmente o desaparecimento do MH370 um acidente, e todos a bordo foram considerados mortos.", cena: CENAS.anuncio,
    p: ["Com a análise dos sinais do satélite, a Inmarsat e os investigadores britânicos concluíram que o avião tinha voado para o sul até ficar sem combustível, longe de qualquer pista de pouso.", "Em 24 de março de 2014, Najib Razak foi à televisão e anunciou: o voo MH370 terminou no sul do Oceano Índico. Pouco antes, a Malaysia Airlines tinha mandado mensagens de texto a parte das famílias dizendo que não havia sobreviventes.", "A notícia, e a forma como foi dada, causou desespero e raiva. Em Pequim, familiares protestaram em frente à embaixada da Malásia. Muitos não aceitaram a conclusão sem nenhum destroço como prova.", "A busca mudou de lugar: milhares de quilômetros ao sul, a oeste da Austrália, que passou a coordenar a operação."] },
  { t: "Os sinais que não eram", foto: { src: "assets/mh370-bluefin.webp", legenda: "O robô submarino Bluefin-21 sendo baixado ao mar do navio australiano Ocean Shield, durante a busca pelo MH370 em abril de 2014. Foto divulgada pela Marinha dos Estados Unidos.", tag: "Abril de 2014 · o robô Bluefin-21" }, parte: 3, hora: "Abril de 2014", lugar: "Oceano Índico, a oeste de Perth", sabia: "As caixas-pretas têm um sinalizador que emite batidas sonoras debaixo d'água por cerca de 30 dias, até a bateria acabar.", cena: CENAS.pinger,
    p: ["No começo de abril, o navio australiano Ocean Shield, arrastando um detector de sinais, captou batidas que pareciam vir dos sinalizadores das caixas-pretas. A notícia correu o mundo: parecia que o avião tinha sido encontrado.", "Um pequeno submarino robô, o Bluefin-21, mergulhou repetidas vezes para vasculhar o fundo naquela área. Não encontrou nada.", "Mais tarde, os investigadores concluíram que os sinais não vinham do MH370. As baterias dos sinalizadores acabaram sem que ninguém chegasse perto do avião.", "A busca na superfície, com aviões e navios de vários países, foi encerrada no fim de abril de 2014. Não se achou nem um pedaço do avião boiando."] },
  { t: "120 mil quilômetros quadrados", parte: 3, hora: "2014–2017", lugar: "Fundo do Oceano Índico", sabia: "Durante a busca, os navios encontraram por acaso dois navios naufragados no século 19, a milhares de metros de profundidade.", cena: CENAS.sonarMar,
    p: ["Em outubro de 2014 começou a busca no fundo do mar, coordenada pela Austrália, com dinheiro da Malásia, da Austrália e da China. Navios arrastavam sonares bem perto do fundo, a 4.000 ou 5.000 metros de profundidade, numa área onde o mar é dos mais bravos do mundo.", "Antes, foi preciso mapear o fundo do oceano naquela região, que era praticamente desconhecido: montanhas, vales e penhascos submarinos que ninguém tinha visto.", "Por quase três anos, os navios vasculharam faixa por faixa uma área de 120.000 km² ao longo do 7º arco, uma área maior que o estado de Pernambuco. Custou cerca de 200 milhões de dólares australianos.", "Em 17 de janeiro de 2017, a busca foi suspensa. O MH370 não estava ali."] },
  { t: "Uma peça na praia", parte: 3, hora: "29 de julho de 2015", lugar: "Ilha da Reunião, Oceano Índico", sabia: "O flaperon é uma superfície móvel na parte de trás da asa que funciona ao mesmo tempo como flap, para voar devagar, e como aileron, para inclinar o avião.", cena: CENAS.flaperon,
    p: ["Em 29 de julho de 2015, funcionários que limpavam uma praia da Ilha da Reunião, território francês perto de Madagascar, encontraram uma peça de avião coberta de cracas. Era um flaperon, uma parte da asa de um Boeing 777.", "Os investigadores franceses compararam os números de série e confirmaram: a peça era do MH370. Era a primeira prova física de que o avião tinha caído no Oceano Índico, quase 4.000 km a oeste do 7º arco, levada pelas correntes durante mais de um ano.", "Nos anos seguintes, outros pedaços apareceram em praias de Moçambique, da Tanzânia, de Madagascar, de Maurício e da África do Sul, muitos achados por voluntários. Três foram confirmados como do 9M-MRO e vários outros foram considerados quase certamente dele.", "As peças mostraram que o avião se partiu ao cair no mar. Mas não diziam exatamente onde."] },
  { t: "Se não achar, não cobra", parte: 3, hora: "2018–2026", lugar: "Sul do Oceano Índico", sabia: "Nos contratos da Ocean Infinity, a empresa só recebe se encontrar o avião. O valor combinado com a Malásia em 2025 era de 70 milhões de dólares.", cena: CENAS.oceanInfinity,
    p: ["Em 2018, a empresa de exploração do fundo do mar Ocean Infinity propôs à Malásia um acordo diferente: faria a busca por conta própria e só seria paga se encontrasse o avião. Com vários robôs submarinos trabalhando ao mesmo tempo, vasculhou mais de 100.000 km² em poucos meses, ao norte da área anterior. Não encontrou nada.", "Em 2025, onze anos depois do desaparecimento, a Malásia assinou um novo contrato com a empresa, numa nova área considerada provável. As buscas começaram no início de 2025, foram interrompidas pelo mau tempo e recomeçaram no fim de dezembro.", "Em 23 de janeiro de 2026, o navio deixou a área. Em 8 de março de 2026, no 12º aniversário do desaparecimento, a empresa anunciou que tinha vasculhado cerca de metade da área combinada, sem encontrar o avião. “Ele não está onde procuramos”, disse o diretor da empresa.", "Em junho de 2026, o governo da Malásia prorrogou o contrato por mais um ano. A busca pelo MH370 continua."] },
  { t: "O que o relatório disse", parte: 4, hora: "30 de julho de 2018", lugar: "Kuala Lumpur", sabia: "A investigação de segurança segue as regras internacionais da aviação: o objetivo é evitar novos acidentes, e não apontar culpados.", cena: CENAS.relatorioMy,
    p: ["Em 30 de julho de 2018, a equipe de investigação da Malásia publicou o relatório de segurança sobre o MH370. A conclusão principal: não foi possível determinar a causa real do desaparecimento.", "O relatório disse que a meia-volta muito provavelmente foi feita com o avião sendo pilotado à mão, que não havia sinal de pane que explicasse a mudança de rota e que não dava para descartar a interferência de uma terceira pessoa. Também não encontrou nada de anormal na vida, na saúde ou no treinamento dos pilotos.", "Investigações paralelas tinham levantado pontos como os dados apagados do simulador de voo caseiro do comandante, com uma rota simulada para o sul do Índico, e a carga, que incluía baterias de lítio. Nenhum desses pontos foi considerado prova do que aconteceu.", "O relatório criticou os controles de tráfego aéreo de Kuala Lumpur e de Ho Chi Minh pela demora em agir naquela noite e fez 19 recomendações de segurança. Para muitas famílias, foi uma decepção: depois de quatro anos, nenhuma resposta."] },
  { t: "O que mudou", parte: 4, hora: "2014–2026", lugar: "No mundo inteiro", sabia: "As famílias das vítimas se organizaram em grupos como o Voice370 e, até hoje, cobram que a busca continue.", cena: CENAS.rastreio,
    p: ["O MH370 mostrou que, em 2014, um avião de passageiros moderno podia simplesmente sumir. Sobre os oceanos, longe dos radares, ninguém sabia com certeza onde cada avião estava.", "Depois do desaparecimento, a OACI, a organização da aviação civil da ONU, criou novas regras: as empresas passaram a ter de acompanhar a posição dos aviões sobre o oceano pelo menos a cada 15 minutos, e os aviões novos precisam transmitir a posição sozinhos, a cada minuto, quando estão em perigo.", "As caixas-pretas também mudaram: os sinalizadores passaram a ter bateria para 90 dias, em vez de 30, e o gravador de voz dos aviões novos passou a guardar 25 horas de conversa, e não só as últimas duas.", "Mais de doze anos depois, o MH370 continua sendo o maior mistério da aviação moderna. Para as famílias das 239 pessoas a bordo, a espera ainda não terminou."] },
    ],
    linha: [['00:42', 'Decolagem de Kuala Lumpur rumo a Pequim, com 239 pessoas a bordo.', [340, 280]], ['01:19', 'Última voz: “Good night, Malaysian three seven zero.”', [386, 163]],
      ['01:21', 'Perto do ponto IGARI, o transponder some e o avião desaparece do radar civil.', [392, 151]], ['01:52', 'Depois de dar meia-volta, o avião passa ao sul de Penang, visto só pelo radar militar.', [307, 205]],
      ['02:22', 'Último eco no radar militar, sobre o Mar de Andamão.', [226, 166]], ['08:19', 'Último sinal ao satélite, no 7º arco, no sul do Oceano Índico. O local exato nunca foi encontrado.', [210, 1134]]],
    falha: 'Não se sabe o que levou ao desvio. O que falhou com certeza foi o rastreamento: o transponder e o ACARS pararam de transmitir, o avião saiu do alcance dos radares e só sobrou um sinal automático de hora em hora com um satélite, que dava a distância, mas não a direção.',
    mudou: ['A OACI passou a exigir que as empresas acompanhem a posição dos aviões sobre o oceano pelo menos a cada 15 minutos.',
      'Aviões novos precisam transmitir sozinhos a posição, a cada minuto, quando estão em perigo.',
      'Os sinalizadores das caixas-pretas passaram a durar 90 dias, e o gravador de voz dos aviões novos passou a guardar 25 horas.',
      'Os procedimentos entre controles de tráfego aéreo de países vizinhos foram revistos, para que o alerta de um avião sumido seja dado bem mais rápido.'],
    memoria: 'Todo dia 8 de março, famílias na China, na Malásia e em outros países se reúnem para lembrar as 239 pessoas do MH370 e pedir que a busca continue.',
    fontes: [['Wikipedia: Malaysia Airlines Flight 370', 'https://en.wikipedia.org/wiki/Malaysia_Airlines_Flight_370'], ['Australian Aviation: relatório de 2018', 'https://australianaviation.com.au/?p=63677'],
      ['Malay Mail: fim da busca de 2026', 'https://www.malaymail.com/news/malaysia/2026/03/09/ocean-infinity-ends-latest-mh370-hunt-after-151-days-at-sea-mapping-140000-sq-km-with-no-new-clues/211959'],
      ['The Vibes: contrato prorrogado em 2026', 'https://www.thevibes.com/articles/news/124469/govt-extends-mh370-search-contract-with-ocean-infinity-for-another-year'], ['ATSB: destroços do MH370', 'https://atsb.gov.au/node/690']],
    cauda: 'assets/cauda-mh.webp', mapaImg: 'assets/mh370-mapa.webp', mapa: mapaMh370, esquema: falhaMh370, fugoide: derivaMh370,
    fugoideTit: 'A deriva: como os destroços chegaram à África',
    fugoideTxt: 'Se o avião caiu perto do 7º arco, as correntes do Oceano Índico, que giram no sentido anti-horário, levariam os destroços para oeste. Foi o que aconteceu: mais de um ano depois, pedaços começaram a aparecer na Ilha da Reunião e no litoral leste da África.',
  },
];

/* ---------- Tela ---------- */
let atual = ACIDENTES[0], passo = ACIDENTES[0].linha.length - 1, tocando = 0;

// Seletor de acidentes: fechado, mostra só o acidente escolhido; ao tocar, abre a lista (que rola quando houver muitos)
function cartao(a, extra = '') {
  return `${a.cauda ? `<img class="dz-item__fin" src="${a.cauda}" alt="" draggable="false">` : ''}<span class="dz-item__year">${a.ano}</span><b>${esc(a.titulo)}</b><span>${esc(a.sub)}</span><i>${a.numeros[1][0]} mortos · ${a.numeros[2][0] === '0' ? 'nenhum sobrevivente' : a.numeros[2][0] + ' sobreviventes'}</i>${extra}`;
}
function lista() {
  $('#dzPickBtn').innerHTML = cartao(atual);
  // A lista mostra só os outros acidentes: o escolhido já está no cartão de cima
  $('#dzList').innerHTML = [...ACIDENTES].filter((a) => a !== atual).sort((x, y) => x.ano - y.ano).map((a) => `<button type="button" class="dz-item" role="option" data-dz="${a.id}" aria-selected="${a === atual}">${cartao(a)}</button>`).join('')
    + '<p class="dz-soon small">Novos acidentes serão adicionados aqui, dos primeiros anos da aviação até hoje.</p>';
}
function abrirLista(abrir) {
  $('#dzList').hidden = !abrir;
  $('#dzPickBtn').setAttribute('aria-expanded', String(abrir)); $('#dzPickToggle').setAttribute('aria-expanded', String(abrir));
  $('#dzPick').classList.toggle('is-open', abrir);
}

function mostrar() {
  const a = atual;
  $('#dzTitle').textContent = a.titulo;
  $('#dzDate').textContent = a.data;
  $('#dzSub').textContent = a.resumo;
  $('#dzNums').innerHTML = a.numeros.map(([n, l]) => `<div><b>${esc(n)}</b><span>${esc(l)}</span></div>`).join('');
  $('#dzFicha').innerHTML = a.ficha.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
  cap = 0; montarCapitulos();
  $('#dzFail').innerHTML = a.esquema();
  $('#dzFailTxt').textContent = a.falha;
  $('#dzPhugBox').hidden = !a.fugoide;
  if (a.fugoide) { $('#dzPhug').innerHTML = a.fugoide(); $('#dzPhugTit').textContent = a.fugoideTit; $('#dzPhugTxt').textContent = a.fugoideTxt; }
  $('#dzFuso').textContent = a.fuso;
  $('#dzChanged').innerHTML = a.mudou.map((m) => `<li>${esc(m)}</li>`).join('');
  $('#dzMemory').textContent = a.memoria;
  $('#dzSrc').innerHTML = a.fontes.map(([n, u]) => `<a href="${u}" target="_blank" rel="noopener">${esc(n)}</a>`).join(' · ');
  $('#dzLine').innerHTML = a.linha.map(([h, t], i) => `<li><button type="button" data-i="${i}"><b>${h}</b><span>${esc(t)}</span></button></li>`).join('');
  // O mapa só entra quando a imagem de satélite já está decodificada, para não aparecer vazio e depois "piscar"
  if (!a.mapaImg || pronta[a.mapaImg] === true) montarMapa(a);
  else { $('#dzMap').classList.add('is-loading'); carregar(a.mapaImg).then(() => { if (atual === a) montarMapa(a); }); }
}

// Imagens já baixadas e decodificadas; ficam guardadas para a troca de acidente ser instantânea
const pronta = {};
function carregar(src) {
  if (!src) return Promise.resolve();
  if (!pronta[src]) {
    const im = new Image(); im.decoding = 'async'; im.src = src;
    pronta[src] = im.decode().catch(() => {}).then(() => { pronta[src] = true; imgsGuardadas.push(im); });
  }
  return pronta[src] === true ? Promise.resolve() : pronta[src];
}
const imgsGuardadas = [];
function montarMapa(a) {
  $('#dzMap').innerHTML = a.mapa();
  $('#dzMap').classList.remove('is-loading');
  // Marcas dos eventos sobre a rota (as posições são calculadas uma vez só por acidente)
  const path = $('#dzPath'), L = path.getTotalLength();
  if (!a.fr) a.fr = a.linha.map(([, , v]) => fracDe(path, v));
  $('#dzMarks').innerHTML = a.fr.map((f, i) => { const p = path.getPointAtLength(L * f); return `<g class="dz-mark" data-i="${i}"><circle cx="${p.x}" cy="${p.y}" r="15"/></g>`; }).join('');
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
  if (!atual.fr || !$('#dzPath')) return;
  const a = atual, path = $('#dzPath'), L = path.getTotalLength(), plane = $('#dzPlane');
  const alvo = a.fr[i], de = animar ? (Number(plane.dataset.f) || 0) : alvo;
  cancelAnimationFrame(tocando);
  const t0 = performance.now(), dur = animar ? 900 + Math.abs(alvo - de) * 1800 : 0;
  const frame = (now) => {
    const k = dur ? Math.min(1, (now - t0) / dur) : 1, e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, f = de + (alvo - de) * e;
    const p = path.getPointAtLength(L * f), q = path.getPointAtLength(Math.min(L, L * f + 6)), r = path.getPointAtLength(Math.max(0, L * f - 6));
    const ang = Math.atan2(q.y - r.y, q.x - r.x) * 180 / Math.PI + 90;
    plane.setAttribute('transform', `translate(${p.x} ${p.y}) rotate(${ang})`); plane.dataset.f = f;
    const rv = $('#dzRevealPath'); if (rv) rv.style.strokeDasharray = `${L * f} ${L + 100}`;
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
  $('#dzhScene').innerHTML = c.foto
    ? `<figure class="hs-photo"><div class="hs-photo__frame"><img src="${c.foto.src}" alt="${esc(c.foto.legenda)}" draggable="false">${c.foto.tag ? `<span class="hs-photo__tag">${esc(c.foto.tag)}</span>` : ''}</div><figcaption>${esc(c.foto.legenda)}</figcaption></figure>`
    : `<svg viewBox="0 0 320 180" role="img" aria-label="Ilustração: ${esc(c.t)}"><rect width="320" height="180" class="hs-sky"/>${c.cena()}</svg>`;
  $('#dzhPrev').disabled = cap === 0;
  $('#dzhNext').textContent = cap === a.secoes.length - 1 ? 'Ver o que falhou e o que mudou' : 'Próximo capítulo';
  document.querySelectorAll('#dzhParts button').forEach((b, i) => b.setAttribute('aria-pressed', String(i === c.parte)));
  document.querySelectorAll('#dzhLine button').forEach((b, i) => {
    b.classList.toggle('is-done', i < cap);
    if (i === cap) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
  });
  $('#dzhLine').style.setProperty('--hs-p', a.secoes.length > 1 ? cap / (a.secoes.length - 1) : 0);
}
// Rola a página para que o elemento (a linha de pontinhos, ou o começo do acidente) fique logo abaixo do cabeçalho fixo
function rolarAteLinha(el, folga = 16) {
  const cab = document.querySelector('.top')?.getBoundingClientRect().bottom || 0;
  const y = el.getBoundingClientRect().top + window.scrollY - cab - folga;
  if (Math.abs(y - window.scrollY) > 4) window.scrollTo({ top: y, behavior: 'smooth' });
}
function irCap(i) {
  const n = atual.secoes.length;
  if (i < 0 || i >= n) return;
  const d = Math.sign(i - cap); cap = i; capitulo(d || 1);
  rolarAteLinha($('#dzhLine'));
}
function initCap() {
  $('#dzhParts').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) irCap(atual.secoes.findIndex((c) => c.parte === [...b.parentNode.children].indexOf(b))); });
  $('#dzhLine').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) irCap([...b.parentNode.children].indexOf(b)); });
  $('#dzhPrev').addEventListener('click', () => irCap(cap - 1));
  $('#dzhNext').addEventListener('click', () => { if (cap === atual.secoes.length - 1) rolarAteLinha($('#dzFailBox')); else irCap(cap + 1); });
  let sx = null;
  const sc = $('#dzhScene');
  sc.addEventListener('pointerdown', (e) => { sx = e.clientX; });
  sc.addEventListener('pointerup', (e) => { if (sx === null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 50) irCap(cap + (dx < 0 ? 1 : -1)); });
}
function init() {
  if (!$('#dzList')) return;
  lista();
  $('#dzPickBtn').addEventListener('click', (e) => { e.stopPropagation(); abrirLista($('#dzList').hidden); });
  $('#dzPickToggle').addEventListener('click', (e) => { e.stopPropagation(); abrirLista($('#dzList').hidden); });
  $('#dzList').addEventListener('click', (e) => {
    const b = e.target.closest('[data-dz]'); if (!b) return;
    const novo = ACIDENTES.find((a) => a.id === b.dataset.dz) || atual;
    abrirLista(false);
    if (novo !== atual) { atual = novo; lista(); mostrar(); }
    rolarAteLinha($('#dzCase'), 8);
  });
  document.addEventListener('click', (e) => { if (!$('#dzList').hidden && !e.target.closest('#dzPick')) abrirLista(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#dzList').hidden) { abrirLista(false); $('#dzPickBtn').focus(); } });
  $('#dzLine').addEventListener('click', (e) => { const b = e.target.closest('button[data-i]'); if (b) { clearTimeout(auto); irPara(+b.dataset.i); } });
  $('#dzPlay').addEventListener('click', reproduzir);
  initCap();
}
let pronto = false;
function start() {
  if (pronto) return;
  pronto = true;
  // Baixa já os mapas e as caudas de todos os acidentes, para a troca entre eles não ter espera
  ACIDENTES.forEach((a) => { carregar(a.mapaImg); carregar(a.cauda); });
  carregar(PITOT_FOTO); carregar(PITOT_GELO);
  mostrar();
}
window.Desastres = { init, start };
})();
