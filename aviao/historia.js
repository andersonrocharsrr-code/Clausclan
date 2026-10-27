/* Modo história: como William Boeing começou na aviação, do estaleiro ao escândalo do correio aéreo,
   em partes e capítulos com ilustrações animadas. */
(() => {
'use strict';
const $ = (s) => document.querySelector(s);

/* ---------- Peças das ilustrações (viewBox 320x180) ---------- */
const water = (y = 150) => `<g class="hs-water"><path d="M0 ${y} Q20 ${y - 4} 40 ${y} T80 ${y} T120 ${y} T160 ${y} T200 ${y} T240 ${y} T280 ${y} T320 ${y} V180 H0Z" class="hs-fill-water"/><path class="hs-wave" d="M-40 ${y + 10} q10 -3 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0"/></g>`;
const ground = (y = 150) => `<path d="M0 ${y} H320 V180 H0Z" class="hs-fill-ground"/>`;
const floor = (y = 150) => `<path d="M0 ${y} H320 V180 H0Z" class="hs-fill-floor"/>`;
const tree = (x, y, s = 1) => `<g class="hs-sway" style="transform-origin:${x}px ${y}px"><path d="M${x} ${y - 46 * s} L${x + 13 * s} ${y - 18 * s} H${x + 6 * s} L${x + 17 * s} ${y} H${x - 17 * s} L${x - 6 * s} ${y - 18 * s} H${x - 13 * s}Z" class="hs-fill-tree"/><rect x="${x - 2 * s}" y="${y}" width="${4 * s}" height="${7 * s}" class="hs-fill-ink"/></g>`;
const mountain = () => `<path d="M150 150 L205 70 L218 82 L232 64 L300 150Z" class="hs-fill-mount"/><path d="M205 70 L218 82 L232 64 L246 84 L236 80 L224 92 L212 84 L196 84Z" class="hs-fill-snow"/>`;
const sun = (x = 262, y = 40) => `<circle cx="${x}" cy="${y}" r="16" class="hs-sun"/>`;
const cloud = (x, y, s = 1, d = 0) => `<g class="hs-drift" style="animation-delay:${d}s"><ellipse cx="${x}" cy="${y}" rx="${22 * s}" ry="${7 * s}" class="hs-cloud"/><ellipse cx="${x + 8 * s}" cy="${y - 6 * s}" rx="${12 * s}" ry="${8 * s}" class="hs-cloud"/></g>`;
// Biplano de 1910 (tipo Farman): asas duplas, montantes, cauda em treliça
const biplane = (s = 1) => `<g transform="scale(${s})"><rect x="-34" y="-10" width="68" height="3" rx="1" class="hs-fill-ink"/><rect x="-34" y="4" width="68" height="3" rx="1" class="hs-fill-ink"/>
  <path d="M-28 -7 V4 M-14 -7 V4 M14 -7 V4 M28 -7 V4 M-6 -7 V4 M6 -7 V4" class="hs-line"/><path d="M-4 -1 H-44 M-4 2 H-44" class="hs-line"/><rect x="-54" y="-5" width="12" height="9" class="hs-fill-ink"/>
  <rect x="2" y="-3" width="10" height="5" class="hs-fill-accent"/><g class="hs-prop"><path d="M14 -6 V8" class="hs-line-b"/></g></g>`;
// Hidroavião dos anos 1910: asa dupla, fuselagem e um flutuador grande
const seaplane = (s = 1, col = 'hs-fill-ink') => `<g transform="scale(${s})"><rect x="-36" y="-14" width="72" height="3" rx="1" class="${col}"/><rect x="-36" y="-2" width="72" height="3" rx="1" class="${col}"/>
  <path d="M-26 -11 V-2 M26 -11 V-2 M-12 -11 V-2 M12 -11 V-2" class="hs-line"/><path d="M-30 2 H24 L30 -4 L-34 -4Z" class="${col}"/><path d="M-30 -4 L-42 -12 V-2Z" class="${col}"/>
  <path d="M-16 1 V10 M10 1 V10" class="hs-line"/><path d="M-26 10 H22 Q30 10 30 14 H-22Z" class="hs-fill-accent"/><g class="hs-prop"><path d="M32 -9 V5" class="hs-line-b"/></g></g>`;
// Biplano de correio dos anos 1920/30, de lado
const mailplane = (s = 1, col = 'hs-fill-ink') => `<g transform="scale(${s})"><rect x="-30" y="-16" width="60" height="3" rx="1" class="${col}"/><rect x="-26" y="-2" width="52" height="3" rx="1" class="${col}"/>
  <path d="M-20 -13 V-2 M20 -13 V-2" class="hs-line"/><path d="M-42 -4 C-30 -8 20 -9 30 -6 L32 2 C20 4 -30 4 -42 0Z" class="${col}"/><path d="M-42 -4 L-48 -14 H-42 L-36 -6Z" class="${col}"/>
  <path d="M-4 2 L-8 10 M6 2 L10 10" class="hs-line"/><circle cx="-8" cy="11" r="3" class="hs-fill-ink"/><circle cx="10" cy="11" r="3" class="hs-fill-ink"/><g class="hs-prop"><path d="M34 -9 V5" class="hs-line-b"/></g></g>`;
const barn = (x, y) => `<g><path d="M${x} ${y} V${y - 34} L${x + 30} ${y - 52} L${x + 60} ${y - 34} V${y}Z" class="hs-fill-barn"/><path d="M${x + 22} ${y} V${y - 22} H${x + 38} V${y}" class="hs-line-w"/><path d="M${x + 22} ${y - 22} L${x + 38} ${y} M${x + 38} ${y - 22} L${x + 22} ${y}" class="hs-line-w"/></g>`;
const flag = (x, y, d = 0) => `<g><path d="M${x} ${y} V${y - 26}" class="hs-line"/><path class="hs-flag" style="animation-delay:${d}s;transform-origin:${x}px ${y - 22}px" d="M${x} ${y - 26} h14 l-3 4 l3 4 h-14z"/></g>`;
// Pessoa simples: cabeça e corpo; vestido para as costureiras
const person = (x, y, dress = false, cls = 'hs-fill-ink', d = 0) => `<g class="hs-bob" style="animation-delay:${d}s"><circle cx="${x}" cy="${y - 30}" r="5" class="${cls}"/>${dress ? `<path d="M${x - 5} ${y - 24} H${x + 5} L${x + 10} ${y} H${x - 10}Z" class="${cls}"/>` : `<rect x="${x - 5}" y="${y - 24}" width="10" height="16" rx="3" class="${cls}"/><path d="M${x - 3} ${y - 8} V${y} M${x + 3} ${y - 8} V${y}" class="hs-line-b"/>`}</g>`;
const capitol = (x, y) => `<g><path d="M${x - 70} ${y} V${y - 30} H${x + 70} V${y}Z" class="hs-fill-city"/>${[-56, -36, -16, 4, 24, 44].map((d) => `<rect x="${x + d}" y="${y - 28}" width="6" height="28" class="hs-fill-paper"/>`).join('')}
  <path d="M${x - 30} ${y - 30} V${y - 44} H${x + 30} V${y - 30}" class="hs-fill-city"/><path d="M${x - 26} ${y - 44} A26 26 0 0 1 ${x + 26} ${y - 44}Z" class="hs-fill-city"/><path d="M${x} ${y - 70} V${y - 80}" class="hs-line-b"/></g>`;

/* ---------- As partes e os capítulos ---------- */
const PARTES = ['Origens', 'O sonho de voar', 'A fábrica', 'O correio aéreo', 'O escândalo do correio aéreo', 'Legado'];
const CAPS = [
  /* ---- 1 · Origens ---- */
  { parte: 0, ano: '1881', lugar: 'Detroit, Michigan', titulo: 'Nasce William Edward Boeing',
    texto: ['William Edward Boeing nasceu em 1º de outubro de 1881. O pai, Wilhelm Böing, era um imigrante alemão que chegou aos Estados Unidos sem dinheiro e fez fortuna com terras de madeira e minas de ferro. A mãe, Marie Ortmann, era austríaca.',
      'Quando William tinha 8 anos, o pai morreu. O menino cresceu numa família rica, mas aprendeu cedo que terra, madeira e trabalho podiam virar um império.'],
    sabia: 'O sobrenome da família era Böing. Wilhelm mudou a grafia para Boeing ao se estabelecer nos Estados Unidos.',
    foto: { src: 'assets/historia-1881.webp', legenda: 'Rua comercial de uma cidade americana no fim do século 19, como a Detroit em que Boeing nasceu (imagem ilustrativa)' },
    cena: () => `${ground(150)}<g class="hs-rise">${[[20, 70], [52, 92], [80, 60], [118, 84], [150, 66], [190, 90], [222, 72], [258, 88], [286, 62]].map(([x, y], i) => `<rect x="${x}" y="${y}" width="${26 + (i % 2) * 6}" height="${150 - y}" class="hs-fill-city"/>${[0, 1, 2, 3].map((k) => `<rect x="${x + 5}" y="${y + 8 + k * 14}" width="5" height="6" class="hs-win" style="animation-delay:${(i * 3 + k) * 0.13}s"/>`).join('')}`).join('')}</g>
      <rect x="90" y="40" width="7" height="22" class="hs-fill-ink"/><g class="hs-smoke"><circle cx="94" cy="34" r="5"/><circle cx="99" cy="24" r="7"/><circle cx="106" cy="12" r="9"/></g>
      <rect x="232" y="50" width="7" height="24" class="hs-fill-ink"/><g class="hs-smoke" style="animation-delay:1s"><circle cx="236" cy="44" r="5"/><circle cx="241" cy="34" r="7"/><circle cx="248" cy="22" r="9"/></g>` },
  { parte: 0, ano: '1903', lugar: 'Suíça e Yale', titulo: 'Estudos e uma escolha',
    texto: ['A mãe se casou de novo, e William não se dava bem com o padrasto. Ainda menino, foi mandado para um internato na Suíça: o Institution Sillig, em Vevey, às margens do lago Léman, com os Alpes ao fundo. Lá ganhou o jeito formal e reservado que manteve a vida toda.',
      'De volta aos Estados Unidos, entrou na Escola Científica Sheffield, da Universidade Yale, onde estudou engenharia.',
      'Por volta de 1903, saiu sem terminar o curso e foi para o Noroeste dos Estados Unidos seguir o ramo da família: a madeira.'],
    sabia: 'O arquivo do Museum of Flight guarda uma foto de 1894 do jovem Boeing com os colegas do Institution Sillig. O banqueiro J. P. Morgan tinha estudado na mesma escola cerca de 30 anos antes.',
    foto: { src: 'assets/historia-vevey.webp', legenda: 'Um internato à beira do lago Léman, em Vevey, na Suíça, como o Institution Sillig onde Boeing estudou (imagem ilustrativa)' },
    cena: () => `${ground(150)}<path d="M120 150 V70 H200 V150Z" class="hs-fill-city"/><path d="M146 70 V38 H174 V70" class="hs-fill-city"/><path d="M146 38 L160 20 L174 38Z" class="hs-fill-ink"/>
      ${[0, 1, 2].map((k) => `<path d="M${132 + k * 22} 150 V112 a8 8 0 0 1 16 0 V150" class="hs-fill-paper"/>`).join('')}<circle cx="160" cy="52" r="7" class="hs-fill-paper"/><path d="M160 52 L160 47 M160 52 L164 54" class="hs-line hs-clock"/>
      <g class="hs-bob"><rect x="30" y="112" width="46" height="8" class="hs-fill-accent"/><rect x="34" y="104" width="40" height="8" class="hs-fill-blue"/><rect x="28" y="96" width="44" height="8" class="hs-fill-ink"/></g>
      <g class="hs-bob" style="animation-delay:.6s"><path d="M240 120 l30 -10 l30 10 l-30 10z" class="hs-fill-ink"/><path d="M252 124 v10 q18 8 36 0 v-10" class="hs-fill-ink"/><path d="M296 121 v16" class="hs-line-accent"/></g>` },
  { parte: 0, ano: '1910', lugar: 'Grays Harbor e Seattle', titulo: 'Madeira, Seattle e um estaleiro',
    texto: ['No estado de Washington, comprou florestas em Grays Harbor e prosperou vendendo madeira. Depois se mudou para Seattle.',
      'Em 1910 comprou o estaleiro Heath, às margens do rio Duwamish, onde estava sendo construído o seu iate. Ninguém imaginava, mas aquele galpão de madeira seria a primeira fábrica de aviões da Boeing.'],
    sabia: 'O galpão ficou conhecido como Red Barn (Celeiro Vermelho). Ele foi preservado e hoje faz parte do Museum of Flight, em Seattle.',
    cena: () => `${mountain()}${water(140)}${tree(26, 140, 1.1)}${tree(54, 140, .8)}${tree(80, 140, 1.2)}${tree(106, 140, .9)}
      <g class="hs-float"><rect x="150" y="136" width="70" height="6" rx="3" class="hs-fill-log"/><rect x="176" y="130" width="60" height="6" rx="3" class="hs-fill-log"/></g>${barn(250, 140)}` },

  /* ---- 2 · O sonho de voar ---- */
  { parte: 1, ano: '1910', lugar: 'Los Angeles', titulo: 'O dia em que não voou',
    texto: ['Em janeiro de 1910, Boeing foi ao primeiro grande encontro aéreo dos Estados Unidos, no campo de Dominguez, perto de Los Angeles. Multidões viram aviões e balões de perto pela primeira vez.',
      'Ele pediu carona a quase todos os pilotos. Só o francês Louis Paulhan aceitou, mas foi embora antes de levá-lo. Boeing voltou para casa sem voar e com uma ideia fixa.'],
    sabia: 'No encontro de Dominguez, Paulhan bateu o recorde de altitude da época: pouco mais de 1.200 metros.',
    cena: () => `${sun(268, 36)}${cloud(60, 36, 1, 0)}${cloud(200, 54, .8, 3)}${ground(148)}
      <path d="M10 148 V126 H150 V148" class="hs-fill-city"/><path d="M10 126 L20 116 H140 L150 126" class="hs-fill-ink"/>${[30, 60, 90, 120].map((x, i) => flag(x, 116, i * .3)).join('')}
      ${Array.from({ length: 22 }, (_, i) => `<circle cx="${18 + i * 6}" cy="${140 - (i % 3) * 3}" r="2.4" class="hs-fill-ink hs-cheer" style="animation-delay:${(i % 5) * .15}s"/>`).join('')}
      <g class="hs-fly-arc">${biplane(1)}</g>` },
  { parte: 1, ano: '1914', lugar: 'Seattle', titulo: 'O primeiro voo',
    texto: ['Com o amigo Conrad Westervelt, engenheiro da Marinha americana, Boeing finalmente voou: um passeio num hidroavião Curtiss sobre as águas de Seattle.',
      'Depois do voo, os dois examinaram o avião de perto. Acharam a estrutura frágil e mal resolvida. E chegaram a uma conclusão: dava para construir um melhor.'],
    sabia: 'O passeio foi com um aviador que fazia voos de exibição pela região, cobrando dos curiosos que queriam conhecer o céu.',
    cena: () => `${mountain()}${cloud(70, 40, 1, 1)}${water(146)}<g class="hs-takeoff">${seaplane(1)}</g>` },
  { parte: 1, ano: '1915', lugar: 'Los Angeles e Seattle', titulo: 'Aprendendo a voar',
    texto: ['Boeing fez aulas de voo numa escola em Los Angeles e comprou o próprio hidroavião, um Martin TA, levado de volta para Seattle.',
      'Conta-se que, quando o Martin foi danificado e as peças de reposição demorariam meses para chegar, ele tomou uma decisão: os próximos aviões seriam projetados e feitos em Seattle.'],
    sabia: 'Para construir o novo avião, Boeing montou um hangar às margens do Lake Union, em Seattle.',
    cena: () => `${water(150)}<g transform="translate(110 132)">${seaplane(1)}</g>
      <g class="hs-spin" style="transform-origin:236px 92px"><path d="M236 72 a20 20 0 1 1 -1 0 M236 66 v8 M236 110 v8 M216 92 h-8 M264 92 h-8" class="hs-line-accent"/></g>
      <g class="hs-bob"><path d="M226 92 l6 6 l20 -20 a8 8 0 0 0 -6 -6 l-20 20z" class="hs-fill-ink"/></g>
      <g class="hs-draw-in"><path d="M30 40 H120 M30 40 V100 M30 100 H120 M30 70 H90" class="hs-draft"/><path d="M50 52 H100 M50 88 H110" class="hs-draft"/></g>` },

  /* ---- 3 · A fábrica ---- */
  { parte: 2, ano: '1916', lugar: 'Lake Union, Seattle', titulo: 'Nasce o B&W',
    texto: ['Boeing e Westervelt projetaram o B&W, um hidroavião biplano com as iniciais dos dois. Em 15 de junho de 1916, o próprio Boeing levou o primeiro deles ao ar sobre o Lake Union.',
      'Um mês depois, em 15 de julho de 1916, fundou a Pacific Aero Products Co., a empresa que viraria a Boeing.'],
    sabia: 'Foram construídos dois B&W, apelidados de Bluebill e Mallard, nomes de patos.',
    cena: () => `${sun(60, 40)}${mountain()}${water(146)}${barn(16, 146)}<g class="hs-takeoff">${seaplane(1.1, 'hs-fill-paper2')}</g>
      <text x="236" y="40" class="hs-tag">B&amp;W</text>` },
  { parte: 2, ano: '1916', lugar: 'Seattle', titulo: 'Asas de tecido, feitas por costureiras',
    texto: ['Os primeiros aviões da Boeing eram de madeira e pano. Marceneiros montavam a estrutura das asas, com longarinas e nervuras de madeira. Depois, costureiras cobriam tudo com tecido, principalmente linho.',
      'Elas cortavam o pano no formato certo, uniam as partes na máquina de costura e costuravam o tecido à estrutura. Em seguida, o tecido recebia várias demãos de um verniz chamado dope, que o deixava esticado, firme e impermeável, como a pele de um tambor.',
      'Depois da encomenda da Marinha, em 1917, a empresa contratou muitas costureiras para cobrir asas e superfícies de comando. Segundo um livro sobre as mulheres da Boeing, por volta de 1918 elas eram quase um quarto dos funcionários.'],
    sabia: 'Segundo historiadores da empresa, uma das primeiras foi Rosie Farrar, contratada em 1916 para costurar as asas de linho dos hidroaviões B&W. Passar a trabalhar na máquina de costura era visto como uma promoção.',
    cena: () => `${floor(150)}
      <g><rect x="40" y="70" width="240" height="40" rx="3" class="hs-fill-wood"/>${[60, 84, 108, 132, 156, 180, 204, 228, 252].map((x) => `<path d="M${x} 72 V108" class="hs-rib"/>`).join('')}
        <rect x="40" y="70" width="240" height="40" rx="3" class="hs-linen"/><path class="hs-stitch" d="M44 90 H276"/></g>
      <path d="M40 110 V150 M280 110 V150" class="hs-line-b"/>
      <g transform="translate(150 132)"><path d="M-22 0 V-16 H18 V-8 H6 V0Z" class="hs-fill-ink"/><g class="hs-needle"><path d="M10 -8 V2" class="hs-line-b"/></g><circle cx="-14" cy="-10" r="4" class="hs-fill-accent"/></g>
      ${person(70, 150, true, 'hs-fill-ink', 0)}${person(250, 150, true, 'hs-fill-accent', .5)}${person(108, 150, true, 'hs-fill-blue', .9)}` },
  { parte: 2, ano: '1917', lugar: 'Seattle', titulo: 'Boeing Airplane Company e o Model C',
    texto: ['Em 1917 a empresa passou a se chamar Boeing Airplane Company, e o Red Barn virou de vez a fábrica de aviões.',
      'Os Estados Unidos entraram na Primeira Guerra Mundial e a Marinha precisava treinar pilotos. Encomendou 50 hidroaviões de treinamento Model C, o primeiro grande pedido e o primeiro sucesso da Boeing.'],
    sabia: 'O Model C foi o primeiro avião da Boeing fabricado em série.',
    cena: () => `${water(150)}${barn(240, 150)}${[0, 1, 2].map((i) => `<g class="hs-line-up" style="animation-delay:${i * .5}s"><g transform="translate(${60 + i * 62} ${136 - i * 2}) scale(.7)">${seaplane(1)}</g></g>`).join('')}
      <text x="30" y="40" class="hs-tag hs-count">50 × MODEL C</text>` },
  { parte: 2, ano: '1919', lugar: 'Seattle', titulo: 'Móveis e barcos para sobreviver',
    texto: ['Quando a guerra acabou, em novembro de 1918, as encomendas militares pararam e o mercado ficou cheio de aviões que sobraram da guerra. Quase ninguém queria comprar avião novo.',
      'Para não fechar as portas nem demitir a equipe, a Boeing usou as mesmas oficinas de madeira para fabricar móveis e pequenos barcos. Boeing chegou a pôr dinheiro do próprio bolso para manter a empresa viva até os aviões voltarem a vender.'],
    sabia: 'A experiência com barcos não era à toa: a fábrica tinha nascido num estaleiro, e os primeiros aviões Boeing eram hidroaviões.',
    cena: () => `${floor(150)}<g class="hs-line-up"><path d="M40 150 V110 H76 V150 M40 126 H76 M40 138 H76" class="hs-fill-wood hs-line"/><path d="M44 110 V96 M72 110 V96 M44 96 H72" class="hs-line-b"/></g>
      <g class="hs-line-up" style="animation-delay:.4s"><rect x="100" y="100" width="56" height="50" rx="2" class="hs-fill-wood"/><path d="M104 116 H152 M104 132 H152" class="hs-line"/><circle cx="128" cy="108" r="2" class="hs-fill-ink"/><circle cx="128" cy="124" r="2" class="hs-fill-ink"/><circle cx="128" cy="140" r="2" class="hs-fill-ink"/></g>
      <g class="hs-float"><path d="M190 132 H300 L290 148 H204Z" class="hs-fill-wood"/><path d="M236 132 V100 L270 128Z" class="hs-fill-paper2"/></g>` },

  /* ---- 4 · O correio aéreo ---- */
  { parte: 3, ano: '1919', lugar: 'Seattle → Vancouver', titulo: 'O primeiro correio aéreo internacional',
    texto: ['Em 3 de março de 1919, Boeing e o piloto Eddie Hubbard voaram de Seattle a Vancouver, no Canadá, num Model C.',
      'Na volta trouxeram um malote com 60 cartas: o primeiro correio aéreo internacional da América do Norte. Boeing percebeu ali o futuro: aviões não serviam só para a guerra, serviam para levar coisas e pessoas.'],
    sabia: 'Depois disso, Hubbard criou uma linha de correio entre Seattle e Victoria, no Canadá, com aviões da Boeing.',
    cena: () => `${cloud(80, 44, 1.1, 0)}${cloud(230, 30, .9, 2)}${water(156)}<path d="M160 20 V156" class="hs-border"/><text x="164" y="30" class="hs-small">EUA</text><text x="120" y="30" class="hs-small">CANADÁ</text>
      <g class="hs-fly-mail"><g>${seaplane(.9)}</g><g class="hs-bob"><path d="M-6 16 h14 l2 12 h-18z" class="hs-fill-mail"/><text x="1" y="25" class="hs-mini">MAIL</text></g></g>` },
  { parte: 3, ano: '1927', lugar: 'São Francisco → Chicago', titulo: 'De fabricante a companhia aérea',
    texto: ['O governo americano passou a contratar empresas privadas para levar o correio aéreo. A Boeing disputou a rota entre São Francisco e Chicago com um preço muito baixo. Os concorrentes acharam que ela ia quebrar.',
      'Boeing criou a Boeing Air Transport e o Model 40A, um biplano feito para a rota: levava as cartas e, numa pequena cabine, até dois passageiros. Deu certo, e a empresa lucrou já no primeiro ano.'],
    sabia: 'O Model 40A usava o motor radial Wasp, da Pratt & Whitney: mais leve que os motores refrigerados a água da época, sobrava peso para a carga paga.',
    cena: () => `${ground(150)}<path d="M20 150 L60 90 L90 120 L130 70 L170 150Z" class="hs-fill-mount"/><path d="M30 60 C 110 20, 210 110, 300 50" class="hs-route"/><circle cx="30" cy="60" r="5" class="hs-fill-accent"/><circle cx="300" cy="50" r="5" class="hs-fill-accent"/>
      <text x="14" y="80" class="hs-small">SÃO FRANCISCO</text><text x="262" y="72" class="hs-small">CHICAGO</text>
      <g>${mailplane(.5)}<animateMotion dur="6s" repeatCount="indefinite" rotate="auto" path="M30 60 C 110 20, 210 110, 300 50"/></g>` },
  { parte: 3, ano: '1929', lugar: 'Estados Unidos', titulo: 'Um gigante da aviação',
    texto: ['Em 1929, Boeing e Frederick Rentschler, da Pratt & Whitney, juntaram várias empresas num só grupo: a United Aircraft and Transport Corporation.',
      'Ele reunia fábricas de aviões (Boeing, Sikorsky, Chance Vought), de motores (Pratt & Whitney), de hélices (Hamilton Standard) e companhias aéreas. Em 1931, as linhas aéreas do grupo passaram a operar com o nome United Air Lines.',
      'O grupo fazia o avião, o motor, a hélice e ainda voava com eles. Para uns, era eficiência. Para outros, poder demais nas mãos de uma só empresa.'],
    sabia: 'Juntando a fabricação e o transporte, o grupo controlava todas as etapas: do projeto do avião à venda da passagem.',
    cena: () => { const N = [['Boeing', 40, 30], ['Pratt &amp; Whitney', 160, 24], ['Hamilton Std.', 280, 30], ['Sikorsky', 40, 150], ['Chance Vought', 160, 158], ['Linhas aéreas', 280, 150]];
      return N.map(([, x, y], i) => `<path d="M160 90 L${x} ${y}" class="hs-link" style="animation-delay:${.2 + i * .15}s"/>`).join('')
        + `<g class="hs-hub"><rect x="104" y="72" width="112" height="36" rx="8" class="hs-fill-accent"/><text x="160" y="87" class="hs-pill">United Aircraft</text><text x="160" y="99" class="hs-pill">and Transport</text></g>`
        + N.map(([n, x, y], i) => `<g class="hs-node" style="animation-delay:${.4 + i * .15}s"><rect x="${x - 40}" y="${y - 10}" width="80" height="20" rx="5" class="hs-fill-blue"/><text x="${x}" y="${y + 3}" class="hs-pill">${n}</text></g>`).join(''); } },
  { parte: 3, ano: '1933', lugar: 'Seattle', titulo: 'Boeing 247, o primeiro avião comercial moderno',
    texto: ['Em 1933, a Boeing lançou o 247: todo de metal, monoplano, com dois motores e trem de pouso que recolhia em voo. Levava 10 passageiros e cruzava os Estados Unidos muito mais rápido que os aviões da época.',
      'As primeiras 60 unidades foram reservadas para a United, do próprio grupo. As outras companhias tiveram de esperar. A TWA, sem conseguir comprar o 247, encomendou um avião novo à Douglas, que deu origem ao famoso DC-3.'],
    sabia: 'A fila do 247 virou um dos argumentos de quem acusava o grupo de Boeing de monopólio.',
    cena: () => `${cloud(60, 40, 1, 0)}${cloud(230, 60, .8, 2)}
      <g class="hs-cruise"><path d="M-60 2 C-50 -6 -20 -7 40 -5 C52 -4 58 0 60 3 C56 6 50 7 40 7 H-56Z" class="hs-fill-metal"/><path d="M-6 3 L-20 30 H-8 L14 3Z" class="hs-fill-metal"/><path d="M-6 3 L-20 -24 H-8 L14 3Z" class="hs-fill-metal" opacity=".7"/>
        <rect x="-12" y="14" width="16" height="7" rx="3" class="hs-fill-ink"/><rect x="-12" y="-15" width="16" height="7" rx="3" class="hs-fill-ink" opacity=".7"/><path d="M-54 0 L-64 -14 H-58 L-46 -2Z" class="hs-fill-metal"/>
        ${[-36, -26, -16, -6, 4, 14].map((x) => `<rect x="${x}" y="-3" width="5" height="3" rx="1" class="hs-fill-ink"/>`).join('')}</g>
      <text x="236" y="160" class="hs-tag">247</text>` },

  /* ---- 5 · O escândalo do correio aéreo ---- */
  { parte: 4, ano: '1930', lugar: 'Washington, D.C.', titulo: 'As "conferências dos despojos"',
    texto: ['Em 1930, uma lei deu ao chefe dos Correios do governo Hoover, Walter Folger Brown, poder para redesenhar as rotas do correio aéreo.',
      'Brown queria poucas companhias grandes e fortes, capazes de levar passageiros, e não dezenas de empresas pequenas. Ele se reuniu com os donos das maiores companhias para dividir as rotas entre elas. As pequenas ficaram de fora.',
      'Essas reuniões ficaram conhecidas como "conferências dos despojos" (spoils conferences). Anos depois, elas seriam o centro de um escândalo.'],
    sabia: 'O plano de Brown ajudou a criar as grandes companhias que dominaram a aviação americana por décadas.',
    cena: () => `${floor(150)}<rect x="60" y="100" width="200" height="10" rx="2" class="hs-fill-wood"/><path d="M80 110 V150 M240 110 V150" class="hs-line-b"/>
      <g class="hs-map"><path d="M90 40 L130 34 L190 38 L236 44 L240 74 L200 84 L150 82 L100 76Z" class="hs-fill-paper"/>
        <path d="M100 58 L150 52 L200 62 L232 54" class="hs-route"/><path d="M110 70 L160 66 L226 70" class="hs-route" style="stroke:var(--blue)"/></g>
      ${person(76, 100, false, 'hs-fill-ink', 0)}${person(120, 100, false, 'hs-fill-blue', .3)}${person(200, 100, false, 'hs-fill-ink', .6)}${person(244, 100, false, 'hs-fill-accent', .9)}
      <g class="hs-papers"><rect x="140" y="92" width="16" height="8" class="hs-fill-paper"/><rect x="162" y="90" width="16" height="10" class="hs-fill-paper"/></g>` },
  { parte: 4, ano: '1934', lugar: 'Senado dos EUA', titulo: 'A investigação no Senado',
    texto: ['Em 1933, já no governo de Franklin Roosevelt, uma comissão do Senado chefiada por Hugo Black começou a investigar como as rotas tinham sido divididas. A acusação: as grandes companhias teriam sido favorecidas pelo governo e lucrado demais com isso.',
      'O grupo de Boeing, que fabricava os aviões, os motores e ainda era dono da maior rede aérea, virou o alvo principal. Boeing aceitou depor. Foi interrogado por horas e atacado pessoalmente por alguns parlamentares, que o retrataram como alguém que enriqueceu com dinheiro público.',
      'Ele se sentia injustiçado: tinha arriscado o próprio dinheiro quando quase ninguém acreditava na aviação, e a sua empresa ganhava as rotas porque era eficiente. A investigação não provou nenhuma ilegalidade de Brown nem dos empresários. Mesmo assim, Boeing saiu da audiência profundamente amargurado.'],
    sabia: 'Não foi um julgamento num tribunal: foi uma investigação do Senado. Boeing nunca foi condenado por corrupção.',
    cena: () => `${sun(276, 34)}${ground(150)}${capitol(160, 150)}
      <g class="hs-ask"><rect x="18" y="30" width="78" height="30" rx="8" class="hs-fill-paper"/><text x="57" y="49" class="hs-q">?  ?  ?</text></g>
      <g class="hs-ask" style="animation-delay:1.2s"><rect x="226" y="62" width="78" height="30" rx="8" class="hs-fill-paper"/><text x="265" y="81" class="hs-q">$ ? $</text></g>` },
  { parte: 4, ano: '1934', lugar: 'Estados Unidos', titulo: 'O Exército assume o correio',
    texto: ['Em fevereiro de 1934, Roosevelt cancelou todos os contratos do correio aéreo e mandou o Corpo Aéreo do Exército levar as cartas.',
      'Os pilotos militares eram corajosos, mas não tinham experiência em voar à noite e com mau tempo nas rotas do correio, e os aviões não eram feitos para isso. Era um dos invernos mais duros em anos. Em poucas semanas vieram dezenas de acidentes.',
      'Em cerca de três meses houve mais de 60 acidentes e 13 militares morreram, segundo os registros mais citados. O aviador Eddie Rickenbacker, herói da Primeira Guerra, chamou aquilo de "assassinato legalizado". A partir de maio, o correio voltou aos poucos às companhias privadas.'],
    sabia: 'O fracasso mostrou o quanto as companhias privadas, como a de Boeing, tinham aprendido sobre voar com regularidade, à noite e com mau tempo.',
    cena: () => `<rect width="320" height="180" class="hs-storm"/><g class="hs-flash"><path d="M220 20 L206 60 H218 L200 104 L236 52 H222 L236 20Z" class="hs-bolt"/></g>
      ${Array.from({ length: 30 }, (_, i) => `<path d="M${(i * 37) % 320} ${(i * 53) % 150} l-6 14" class="hs-rain" style="animation-delay:${(i % 7) * .12}s"/>`).join('')}
      <g class="hs-shake"><g transform="translate(120 96)">${mailplane(1, 'hs-fill-paper2')}</g></g><text x="18" y="168" class="hs-small" style="fill:#fff">ARMY AIR CORPS · 1934</text>` },
  { parte: 4, ano: '1934', lugar: 'Seattle', titulo: 'A lei que separou tudo',
    texto: ['Em junho de 1934 veio a nova lei do correio aéreo. Ela proibiu que uma mesma empresa fabricasse aviões e operasse linhas aéreas, e barrou dos novos contratos os executivos que participaram das "conferências dos despojos".',
      'O grupo de Boeing foi dividido em três: United Air Lines, Boeing Airplane Company e United Aircraft. As rotas voltaram às companhias privadas, muitas delas as mesmas de antes, só que com nomes novos para poderem concorrer.',
      'Quando o correio aéreo voltou para as empresas experientes, Boeing já estava de fora. Ele vendeu as suas ações e se afastou da indústria que tinha ajudado a criar.'],
    sabia: 'Foi por causa dessa lei que várias companhias mudaram de nome em 1934. A American Airways, por exemplo, virou American Airlines.',
    cena: () => `<g class="hs-split"><rect x="130" y="60" width="60" height="60" rx="6" class="hs-fill-ink"/></g>${['United Air Lines', 'Boeing Airplane', 'United Aircraft'].map((n, i) => `<g class="hs-piece" style="--dx:${(i - 1) * 96}px;animation-delay:${.4 + i * .2}s"><rect x="114" y="64" width="92" height="40" rx="6" class="${i === 1 ? 'hs-fill-accent' : 'hs-fill-blue'}"/><text x="160" y="89" class="hs-pill">${n}</text></g>`).join('')}
      <g class="hs-walk">${person(0, 160, false, 'hs-fill-ink')}</g>` },

  /* ---- 6 · Legado ---- */
  { parte: 5, ano: '1934', lugar: 'Nova York', titulo: 'A Medalha Guggenheim',
    texto: ['No mesmo ano em que deixou a aviação, Boeing recebeu a Medalha Daniel Guggenheim, um dos prêmios mais importantes do setor, pelo trabalho pioneiro na fabricação de aviões e no transporte aéreo.',
      'Fora da aviação, dedicou-se à criação de cavalos, aos negócios de imóveis e ao seu iate. Os aviões, porém, continuavam a levar o seu nome.'],
    sabia: 'O primeiro a receber a Medalha Guggenheim, em 1929, foi Orville Wright, um dos irmãos que fizeram o primeiro voo motorizado.',
    cena: () => `${cloud(70, 40, 1, 0)}${cloud(240, 30, .8, 2)}<g class="hs-medal"><path d="M146 40 L136 10 H154 L160 34 L166 10 H184 L174 40" class="hs-fill-accent"/><circle cx="160" cy="80" r="34" class="hs-sun"/><circle cx="160" cy="80" r="24" class="hs-gold"/><text x="160" y="85" class="hs-pill" style="fill:var(--ink)">1934</text></g>
      <g class="hs-spark">${[[110, 60], [214, 70], [130, 120], [196, 122]].map(([x, y]) => `<path d="M${x} ${y - 6} V${y + 6} M${x - 6} ${y} H${x + 6}" class="hs-line-accent"/>`).join('')}</g>` },
  { parte: 5, ano: '1956', lugar: 'Seattle', titulo: 'O legado',
    texto: ['William Boeing morreu em 28 de setembro de 1956, a bordo do seu iate, dias antes de completar 75 anos.',
      'A empresa que ele fundou num galpão de estaleiro continuou crescendo. Em 1969, colocou no ar o primeiro 747, o "Jumbo" que você explora aqui no app.'],
    sabia: 'Uma frase atribuída a ele resume tudo: "Não deixemos passar nenhum avanço no voo e nos equipamentos de voo."',
    cena: () => `${sun(250, 44)}${cloud(80, 50, 1, 0)}${cloud(190, 30, .8, 2)}
      <g class="hs-jumbo"><g transform="scale(1.5)"><path d="M-70 4 C-60 -6 -40 -8 -10 -8 H40 C52 -8 58 -2 62 4 C58 8 50 10 40 10 H-60 C-66 10 -70 8 -70 4Z" class="hs-fill-paper2"/><path d="M28 -8 C34 -16 46 -16 54 -4" class="hs-fill-paper2"/>
        <path d="M-6 6 L-34 26 H-22 L14 6Z" class="hs-fill-ink"/><path d="M-58 -2 L-70 -24 H-62 L-46 -6Z" class="hs-fill-accent"/><path d="M-60 6 L-76 12 H-68 L-50 6Z" class="hs-fill-ink"/>
        ${[-40, -28, -16, -4, 8, 20].map((x) => `<rect x="${x}" y="-3" width="5" height="4" rx="1" class="hs-fill-ink"/>`).join('')}</g></g>
      ${ground(160)}<g class="hs-ghost">${barn(240, 160)}</g>` },
];

/* ---------- Tela ---------- */
let cap = 0;
function render(dir = 0) {
  const c = CAPS[cap];
  const card = $('#hsCard');
  card.classList.remove('is-next', 'is-prev'); void card.offsetWidth;
  if (dir) card.classList.add(dir > 0 ? 'is-next' : 'is-prev');
  $('#hsPart').textContent = `Parte ${c.parte + 1} · ${PARTES[c.parte]}`;
  $('#hsYear').textContent = c.ano;
  $('#hsPlace').textContent = c.lugar;
  $('#hsTitle').textContent = c.titulo;
  const tx = $('#hsText'); tx.innerHTML = '';
  c.texto.forEach((t) => { const p = document.createElement('p'); p.textContent = t; tx.appendChild(p); });
  $('#hsFact').textContent = c.sabia;
  $('#hsScene').innerHTML = c.foto
    ? `<figure class="hs-photo"><div class="hs-photo__frame"><img src="${c.foto.src}" alt="${c.foto.legenda}" draggable="false"></div><figcaption>${c.foto.legenda}</figcaption></figure>`
    : `<svg viewBox="0 0 320 180" role="img" aria-label="Ilustração: ${c.titulo}"><rect width="320" height="180" class="hs-sky"/>${c.cena()}</svg>`;
  $('#hsCount').textContent = `Capítulo ${cap + 1} de ${CAPS.length}`;
  $('#hsPrev').disabled = cap === 0;
  $('#hsNext').textContent = cap === CAPS.length - 1 ? 'Recomeçar' : 'Próximo capítulo';
  document.querySelectorAll('#hsParts button').forEach((b, i) => b.setAttribute('aria-pressed', String(i === c.parte)));
  document.querySelectorAll('#hsLine button').forEach((b, i) => {
    b.classList.toggle('is-done', i < cap);
    if (i === cap) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
  });
  $('#hsLine').style.setProperty('--hs-p', CAPS.length > 1 ? cap / (CAPS.length - 1) : 0);
}
function ir(i) { const d = Math.sign(i - cap); cap = (i + CAPS.length) % CAPS.length; render(d || 1); }

function init() {
  if (!$('#hsCard')) return;
  $('#hsParts').innerHTML = PARTES.map((p, i) => `<button type="button" aria-pressed="false"><b>${i + 1}</b>${p}</button>`).join('');
  $('#hsParts').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) ir(CAPS.findIndex((c) => c.parte === [...b.parentNode.children].indexOf(b))); });
  $('#hsLine').innerHTML = CAPS.map((c, i) => `<button type="button" aria-label="Capítulo ${i + 1}: ${c.ano}, ${c.titulo}"><span>${c.ano}</span></button>`).join('');
  $('#hsLine').style.gridTemplateColumns = `repeat(${CAPS.length}, minmax(0, 1fr))`;
  $('#hsLine').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) ir([...b.parentNode.children].indexOf(b)); });
  $('#hsPrev').addEventListener('click', () => cap > 0 && ir(cap - 1));
  $('#hsNext').addEventListener('click', () => ir(cap === CAPS.length - 1 ? 0 : cap + 1));
  // Arrastar a ilustração para o lado troca de capítulo
  let sx = null;
  const sc = $('#hsScene');
  sc.addEventListener('pointerdown', (e) => { sx = e.clientX; });
  sc.addEventListener('pointerup', (e) => { if (sx === null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 50) { if (dx < 0 && cap < CAPS.length - 1) ir(cap + 1); else if (dx > 0 && cap > 0) ir(cap - 1); } });
  document.addEventListener('keydown', (e) => {
    if ($('#view-historia')?.hidden || /INPUT|TEXTAREA/.test(document.activeElement?.tagName)) return;
    if (e.key === 'ArrowRight' && cap < CAPS.length - 1) ir(cap + 1);
    if (e.key === 'ArrowLeft' && cap > 0) ir(cap - 1);
  });
  render();
}
function start() { render(); }
window.Historia = { init, start };
})();
