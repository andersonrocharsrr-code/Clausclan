/* Modo história: como William Boeing começou na aviação, em capítulos com ilustrações animadas. */
(() => {
'use strict';
const $ = (s) => document.querySelector(s);

/* ---------- Peças das ilustrações (viewBox 320x180) ---------- */
const water = (y = 150) => `<g class="hs-water"><path d="M0 ${y} Q20 ${y - 4} 40 ${y} T80 ${y} T120 ${y} T160 ${y} T200 ${y} T240 ${y} T280 ${y} T320 ${y} V180 H0Z" class="hs-fill-water"/><path class="hs-wave" d="M-40 ${y + 10} q10 -3 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0"/></g>`;
const ground = (y = 150) => `<path d="M0 ${y} H320 V180 H0Z" class="hs-fill-ground"/>`;
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
const barn = (x, y) => `<g><path d="M${x} ${y} V${y - 34} L${x + 30} ${y - 52} L${x + 60} ${y - 34} V${y}Z" class="hs-fill-barn"/><path d="M${x + 22} ${y} V${y - 22} H${x + 38} V${y}" class="hs-line-w"/><path d="M${x + 22} ${y - 22} L${x + 38} ${y} M${x + 38} ${y - 22} L${x + 22} ${y}" class="hs-line-w"/></g>`;
const flag = (x, y, d = 0) => `<g><path d="M${x} ${y} V${y - 26}" class="hs-line"/><path class="hs-flag" style="animation-delay:${d}s;transform-origin:${x}px ${y - 22}px" d="M${x} ${y - 26} h14 l-3 4 l3 4 h-14z"/></g>`;

/* ---------- Capítulos ---------- */
const CAPS = [
  { ano: '1881', lugar: 'Detroit, Michigan', titulo: 'Nasce William Edward Boeing',
    texto: 'William Edward Boeing nasceu em 1º de outubro de 1881. O pai, Wilhelm Böing, era um imigrante alemão que fez fortuna com madeira e minério de ferro. A mãe, Marie Ortmann, era austríaca. Quando William tinha 8 anos, o pai morreu.',
    sabia: 'O sobrenome da família era Böing. Wilhelm mudou a grafia para Boeing ao se estabelecer nos Estados Unidos.',
    cena: () => `${ground(150)}<g class="hs-rise">${[[20, 70], [52, 92], [80, 60], [118, 84], [150, 66], [190, 90], [222, 72], [258, 88], [286, 62]].map(([x, y], i) => `<rect x="${x}" y="${y}" width="${26 + (i % 2) * 6}" height="${150 - y}" class="hs-fill-city"/>${[0, 1, 2, 3].map((k) => `<rect x="${x + 5}" y="${y + 8 + k * 14}" width="5" height="6" class="hs-win" style="animation-delay:${(i * 3 + k) * 0.13}s"/>`).join('')}`).join('')}</g>
      <rect x="90" y="40" width="7" height="22" class="hs-fill-ink"/><g class="hs-smoke"><circle cx="94" cy="34" r="5"/><circle cx="99" cy="24" r="7"/><circle cx="106" cy="12" r="9"/></g>
      <rect x="232" y="50" width="7" height="24" class="hs-fill-ink"/><g class="hs-smoke" style="animation-delay:1s"><circle cx="236" cy="44" r="5"/><circle cx="241" cy="34" r="7"/><circle cx="248" cy="22" r="9"/></g>` },
  { ano: '1903', lugar: 'Suíça e Yale', titulo: 'Estudos e uma escolha',
    texto: 'Estudou na Suíça e depois na Escola Científica Sheffield, da Universidade Yale, onde fez engenharia. Saiu sem terminar o curso, por volta de 1903, para seguir o ramo da família: a madeira.',
    sabia: 'Na Suíça, Boeing estudou na cidade de Vevey, às margens do lago Léman.',
    cena: () => `${ground(150)}<path d="M120 150 V70 H200 V150Z" class="hs-fill-city"/><path d="M146 70 V38 H174 V70" class="hs-fill-city"/><path d="M146 38 L160 20 L174 38Z" class="hs-fill-ink"/>
      ${[0, 1, 2].map((k) => `<path d="M${132 + k * 22} 150 V112 a8 8 0 0 1 16 0 V150" class="hs-fill-paper"/>`).join('')}<circle cx="160" cy="52" r="7" class="hs-fill-paper"/><path d="M160 52 L160 47 M160 52 L164 54" class="hs-line hs-clock"/>
      <g class="hs-bob"><rect x="30" y="112" width="46" height="8" class="hs-fill-accent"/><rect x="34" y="104" width="40" height="8" class="hs-fill-blue"/><rect x="28" y="96" width="44" height="8" class="hs-fill-ink"/></g>
      <g class="hs-bob" style="animation-delay:.6s"><path d="M240 120 l30 -10 l30 10 l-30 10z" class="hs-fill-ink"/><path d="M252 124 v10 q18 8 36 0 v-10" class="hs-fill-ink"/><path d="M296 121 v16" class="hs-line-accent"/></g>` },
  { ano: '1908', lugar: 'Grays Harbor e Seattle', titulo: 'O negócio da madeira',
    texto: 'No estado de Washington, comprou florestas em Grays Harbor e prosperou vendendo madeira. Mudou-se para Seattle, onde em 1910 comprou um estaleiro às margens do rio Duwamish. Aquele galpão viraria a primeira fábrica de aviões dele.',
    sabia: 'O galpão do estaleiro ficou conhecido como Red Barn (Celeiro Vermelho). Ele existe até hoje no Museum of Flight, em Seattle.',
    cena: () => `${mountain()}${water(140)}${tree(26, 140, 1.1)}${tree(54, 140, .8)}${tree(80, 140, 1.2)}${tree(106, 140, .9)}
      <g class="hs-float"><rect x="150" y="136" width="70" height="6" rx="3" class="hs-fill-log"/><rect x="176" y="130" width="60" height="6" rx="3" class="hs-fill-log"/></g>${barn(250, 140)}` },
  { ano: '1910', lugar: 'Los Angeles', titulo: 'O dia em que não voou',
    texto: 'Em janeiro de 1910, Boeing foi ao primeiro grande encontro aéreo dos Estados Unidos, no campo de Dominguez. Pediu uma carona a quase todos os pilotos. Só o francês Louis Paulhan aceitou, mas foi embora antes de levá-lo. Boeing voltou para casa sem voar e com uma ideia fixa.',
    sabia: 'No encontro de Dominguez, Paulhan bateu o recorde de altitude da época: pouco mais de 1.200 metros.',
    cena: () => `${sun(268, 36)}${cloud(60, 36, 1, 0)}${cloud(200, 54, .8, 3)}${ground(148)}
      <path d="M10 148 V126 H150 V148" class="hs-fill-city"/><path d="M10 126 L20 116 H140 L150 126" class="hs-fill-ink"/>${[30, 60, 90, 120].map((x, i) => flag(x, 116, i * .3)).join('')}
      ${Array.from({ length: 22 }, (_, i) => `<circle cx="${18 + i * 6}" cy="${140 - (i % 3) * 3}" r="2.4" class="hs-fill-ink hs-cheer" style="animation-delay:${(i % 5) * .15}s"/>`).join('')}
      <g class="hs-fly-arc">${biplane(1)}</g>` },
  { ano: '1914', lugar: 'Seattle', titulo: 'O primeiro voo',
    texto: 'Com o amigo Conrad Westervelt, engenheiro da Marinha americana, Boeing finalmente voou: um passeio num hidroavião Curtiss sobre as águas de Seattle. Os dois acharam o avião frágil e mal feito. E chegaram a uma conclusão: dava para construir um melhor.',
    sabia: 'O piloto do passeio foi o aviador Terah Maroney, que fazia voos de exibição pela região.',
    cena: () => `${mountain()}${cloud(70, 40, 1, 1)}${water(146)}<g class="hs-takeoff">${seaplane(1)}</g>` },
  { ano: '1915', lugar: 'Los Angeles', titulo: 'Aprendendo a voar',
    texto: 'Boeing fez aulas de voo numa escola em Los Angeles e comprou o próprio hidroavião, um Martin TA. Conta-se que, quando o Martin foi danificado e as peças demorariam meses para chegar, ele decidiu: os próximos aviões seriam feitos em Seattle.',
    sabia: 'Para construir o novo avião, Boeing montou um hangar às margens do Lake Union, em Seattle.',
    cena: () => `${water(150)}<g transform="translate(110 132)">${seaplane(1)}</g>
      <g class="hs-spin" style="transform-origin:236px 92px"><path d="M236 72 a20 20 0 1 1 -1 0 M236 66 v8 M236 110 v8 M216 92 h-8 M264 92 h-8" class="hs-line-accent"/></g>
      <g class="hs-bob"><path d="M226 92 l6 6 l20 -20 a8 8 0 0 0 -6 -6 l-20 20z" class="hs-fill-ink"/></g>
      <g class="hs-draw-in"><path d="M30 40 H120 M30 40 V100 M30 100 H120 M30 70 H90" class="hs-draft"/><path d="M50 52 H100 M50 88 H110" class="hs-draft"/></g>` },
  { ano: '1916', lugar: 'Lake Union, Seattle', titulo: 'Nasce o B&W',
    texto: 'Boeing e Westervelt projetaram o B&W, um hidroavião biplano com as iniciais dos dois. Em 15 de junho de 1916, o próprio Boeing levou o primeiro deles ao ar sobre o Lake Union. Um mês depois, em 15 de julho, fundou a Pacific Aero Products Co.',
    sabia: 'Foram construídos dois B&W, apelidados de Bluebill e Mallard, nomes de patos.',
    cena: () => `${sun(60, 40)}${mountain()}${water(146)}${barn(16, 146)}<g class="hs-takeoff">${seaplane(1.1, 'hs-fill-paper2')}</g>
      <text x="236" y="40" class="hs-tag">B&amp;W</text>` },
  { ano: '1917', lugar: 'Seattle', titulo: 'Boeing Airplane Company',
    texto: 'Em 1917 a empresa passou a se chamar Boeing Airplane Company. Os Estados Unidos entraram na Primeira Guerra Mundial e a Marinha precisava treinar pilotos: encomendou 50 hidroaviões de treinamento Model C. Foi o primeiro grande sucesso da fábrica.',
    sabia: 'O Model C foi o primeiro avião da Boeing fabricado em série.',
    cena: () => `${water(150)}${barn(240, 150)}${[0, 1, 2].map((i) => `<g class="hs-line-up" style="animation-delay:${i * .5}s"><g transform="translate(${60 + i * 62} ${136 - i * 2}) scale(.7)">${seaplane(1)}</g></g>`).join('')}
      <text x="30" y="40" class="hs-tag hs-count">50 × MODEL C</text>` },
  { ano: '1919', lugar: 'Vancouver → Seattle', titulo: 'O primeiro correio aéreo internacional',
    texto: 'Em 3 de março de 1919, Boeing e o piloto Eddie Hubbard voaram de Seattle a Vancouver, no Canadá, num Model C. Na volta trouxeram um malote com 60 cartas: o primeiro correio aéreo internacional da América do Norte.',
    sabia: 'Depois disso, Hubbard criou uma linha de correio entre Seattle e Victoria, no Canadá, com aviões da Boeing.',
    cena: () => `${cloud(80, 44, 1.1, 0)}${cloud(230, 30, .9, 2)}${water(156)}<path d="M160 20 V156" class="hs-border"/><text x="164" y="30" class="hs-small">EUA</text><text x="120" y="30" class="hs-small">CANADÁ</text>
      <g class="hs-fly-mail"><g>${seaplane(.9)}</g><g class="hs-bob"><path d="M-6 16 h14 l2 12 h-18z" class="hs-fill-mail"/><text x="1" y="25" class="hs-mini">MAIL</text></g></g>` },
  { ano: '1927', lugar: 'São Francisco → Chicago', titulo: 'De carteiro a companhia aérea',
    texto: 'A Boeing Air Transport ganhou o contrato do correio aéreo entre São Francisco e Chicago. Voava com o Model 40A, que levava as cartas e até dois passageiros numa pequena cabine. Em 1929 o grupo virou a United Aircraft and Transport Corporation.',
    sabia: 'A parte aérea desse grupo deu origem à United Airlines, que existe até hoje.',
    cena: () => `${ground(150)}<path d="M20 150 L60 90 L90 120 L130 70 L170 150Z" class="hs-fill-mount"/><path d="M30 60 C 110 20, 210 110, 300 50" class="hs-route"/><circle cx="30" cy="60" r="5" class="hs-fill-accent"/><circle cx="300" cy="50" r="5" class="hs-fill-accent"/>
      <text x="14" y="80" class="hs-small">SÃO FRANCISCO</text><text x="262" y="72" class="hs-small">CHICAGO</text>
      <g>${biplane(.55)}<animateMotion dur="6s" repeatCount="indefinite" rotate="auto" path="M30 60 C 110 20, 210 110, 300 50"/></g>` },
  { ano: '1934', lugar: 'Seattle', titulo: 'O grupo é dividido',
    texto: 'Uma nova lei do correio aéreo, de 1934, proibiu que a mesma empresa fabricasse aviões e operasse linhas aéreas. O grupo foi separado em três: United Air Lines, Boeing Airplane Company e United Aircraft. Boeing vendeu suas ações e se aposentou da aviação.',
    sabia: 'No mesmo ano, Boeing recebeu a Medalha Daniel Guggenheim, um dos maiores prêmios da aviação, pelas suas contribuições ao setor.',
    cena: () => `<g class="hs-split"><rect x="130" y="60" width="60" height="60" rx="6" class="hs-fill-ink"/></g>${['United Air Lines', 'Boeing Airplane', 'United Aircraft'].map((n, i) => `<g class="hs-piece" style="--dx:${(i - 1) * 96}px;animation-delay:${.4 + i * .2}s"><rect x="114" y="64" width="92" height="40" rx="6" class="${i === 1 ? 'hs-fill-accent' : 'hs-fill-blue'}"/><text x="160" y="89" class="hs-pill">${n}</text></g>`).join('')}
      <g class="hs-medal"><circle cx="160" cy="148" r="16" class="hs-sun"/><path d="M150 132 l-6 -20 M170 132 l6 -20" class="hs-line-accent"/></g>` },
  { ano: '1956', lugar: 'Seattle', titulo: 'O legado',
    texto: 'William Boeing morreu em 28 de setembro de 1956, a bordo do seu iate, dias antes de completar 75 anos. A empresa que ele fundou num galpão de estaleiro continuou crescendo e, em 1969, colocou no ar o primeiro 747, o "Jumbo" que você explora aqui no app.',
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
  $('#hsYear').textContent = c.ano;
  $('#hsPlace').textContent = c.lugar;
  $('#hsTitle').textContent = c.titulo;
  $('#hsText').textContent = c.texto;
  $('#hsFact').textContent = c.sabia;
  $('#hsScene').innerHTML = `<svg viewBox="0 0 320 180" role="img" aria-label="Ilustração: ${c.titulo}"><rect width="320" height="180" class="hs-sky"/>${c.cena()}</svg>`;
  $('#hsCount').textContent = `Capítulo ${cap + 1} de ${CAPS.length}`;
  $('#hsPrev').disabled = cap === 0;
  $('#hsNext').textContent = cap === CAPS.length - 1 ? 'Recomeçar' : 'Próximo capítulo';
  document.querySelectorAll('#hsLine button').forEach((b, i) => {
    b.classList.toggle('is-done', i < cap);
    if (i === cap) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
  });
  $('#hsLine').style.setProperty('--hs-p', CAPS.length > 1 ? cap / (CAPS.length - 1) : 0);
}
function ir(i) { const d = Math.sign(i - cap); cap = (i + CAPS.length) % CAPS.length; render(d || 1); }

function init() {
  if (!$('#hsCard')) return;
  $('#hsLine').innerHTML = CAPS.map((c, i) => `<button type="button" aria-label="Capítulo ${i + 1}: ${c.ano}, ${c.titulo}"><span>${c.ano}</span></button>`).join('');
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
