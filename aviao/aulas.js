/* Aulas interativas: Luzes, Espaço aéreo, Regras do ar, Aerodinâmica avançada e Meteorologia prática.
   Cada aula tem tópicos (figura desenhada aqui + texto + controles) e exercícios. Regras conforme a OACI (Anexo 2 e 11). */
(() => {
'use strict';
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const D2R = Math.PI / 180;
const nf = (v, d = 0) => (Number.isFinite(v) ? v.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d }) : '–');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const svg = (vb, body, label) => `<svg viewBox="${vb}" class="au-svg" role="img" aria-label="${esc(label)}">${body}</svg>`;
const aviaoCima = (x, y, ang, cor = '#e8edf2', s = 1) => `<g transform="translate(${x} ${y}) rotate(${ang}) scale(${s})"><path d="M0 -22 C3 -22 3 -16 3 -12 L3 -4 L22 4 L22 8 L3 4 L2 14 L8 18 L8 21 L0 19 L-8 21 L-8 18 L-2 14 L-3 4 L-22 8 L-22 4 L-3 -4 L-3 -12 C-3 -16 -3 -22 0 -22Z" fill="${cor}"/></g>`;

// ======================================================================
// 1 · LUZES
// ======================================================================
const LUZES_JOGO = [
  { r: 'vem', luzes: [['#ff3b30', 62], ['#34d058', 38]], exp: 'Vermelho à sua direita e verde à sua esquerda: você está vendo o avião de frente. Ele vem na sua direção. Desvie para a direita.' },
  { r: 'dir', luzes: [['#34d058', 50]], exp: 'Só o verde: é a ponta da asa direita dele. O nariz aponta para a sua direita: ele cruza da esquerda para a direita.' },
  { r: 'esq', luzes: [['#ff3b30', 50]], exp: 'Só o vermelho: é a asa esquerda dele. O nariz aponta para a sua esquerda: ele cruza da direita para a esquerda.' },
  { r: 'vai', luzes: [['#ffffff', 50]], exp: 'Só a luz branca da cauda: você está atrás dele. Ele se afasta, no mesmo sentido que você.' },
];
const RESP = { vem: 'Vem na sua direção', dir: 'Cruza para a direita', esq: 'Cruza para a esquerda', vai: 'Se afasta de você' };
const SINAIS = [
  ['verde', 'Verde contínuo', '#34d058', false, 'Autorizado a pousar.', 'Autorizado a decolar.'],
  ['verdei', 'Verde intermitente', '#34d058', true, 'Volte para pousar (a autorização virá depois com verde contínuo).', 'Autorizado a taxiar.'],
  ['verm', 'Vermelho contínuo', '#ff3b30', false, 'Dê passagem a outro avião e continue no circuito.', 'Pare.'],
  ['vermi', 'Vermelho intermitente', '#ff3b30', true, 'Aeródromo impraticável: não pouse.', 'Saia da área de pouso em uso.'],
  ['brancoi', 'Branco intermitente', '#ffffff', true, 'Pouse neste aeródromo e siga para o pátio.', 'Volte ao ponto de partida no aeródromo.'],
  ['piro', 'Pirotécnico vermelho', '#ff3b30', 'piro', 'Apesar de qualquer instrução anterior, não pouse por enquanto.', '–'],
];
const luzes = {
  id: 'luzes', eyebrow: 'Luzes', titulo: 'Luzes do avião e do aeroporto',
  lede: 'À noite, o piloto entende o tráfego e o aeroporto pelas luzes: para que lado vai o outro avião, onde começa e termina a pista e o que a torre está mandando fazer quando o rádio falha.',
  topicos: [
    { t: 'Luzes do avião', html: () => `
      ${svg('0 0 320 300', `<rect width="320" height="300" fill="#0b1220"/>
        <path d="M160 150 L160 20 A130 130 0 0 0 37.8 194.5Z" fill="rgba(255,59,48,.22)"/>
        <path d="M160 150 L160 20 A130 130 0 0 1 282.2 194.5Z" fill="rgba(52,208,88,.22)"/>
        <path d="M160 150 L37.8 194.5 A130 130 0 0 0 282.2 194.5Z" fill="rgba(255,255,255,.12)"/>
        ${aviaoCima(160, 150, 0, '#cfd6dd', 3)}
        <circle cx="94" cy="162" r="5" fill="#ff3b30"/><circle cx="226" cy="162" r="5" fill="#34d058"/><circle cx="160" cy="207" r="5" fill="#fff"/>
        <text x="70" y="70" fill="#ff8a80" font-size="12" font-weight="700">vermelha · 110°</text><text x="190" y="70" fill="#7ee69a" font-size="12" font-weight="700">verde · 110°</text>
        <text x="160" y="268" fill="#fff" font-size="12" font-weight="700" text-anchor="middle">branca · 140° para trás</text>`, 'Setores das luzes de navegação vistos de cima')}
      <ul class="au-list">
        <li><b>Navegação:</b> vermelha na ponta da asa esquerda, verde na direita, branca na cauda. Cada uma só aparece num setor: assim, quem vê sabe de que lado está olhando o avião.</li>
        <li><b>Anticolisão (beacon):</b> vermelha piscando em cima e embaixo da fuselagem. Liga antes de dar partida: avisa que o motor vai girar.</li>
        <li><b>Strobes:</b> brancas, piscam forte nas pontas das asas. Ligam ao entrar na pista.</li>
        <li><b>Pouso e táxi:</b> faróis para iluminar a pista. Os de pouso também ajudam outros aviões a enxergar você.</li>
        <li><b>Logo:</b> iluminam a pintura da cauda.</li>
      </ul>` },
    { t: 'Que avião é esse?', html: () => `<p>É noite. Você vê estas luzes à sua frente. Para onde vai o outro avião?</p>
      <div class="au-noite" id="lzCena"></div>
      <div class="au-opts" id="lzOpts">${Object.entries(RESP).map(([k, v]) => `<button type="button" data-r="${k}">${v}</button>`).join('')}</div>
      <p class="au-fb" id="lzFb" hidden></p><button type="button" class="btn" id="lzNovo">Outro avião</button>`,
      init: (el) => {
        let atual;
        const nova = () => {
          atual = LUZES_JOGO[Math.floor(Math.random() * LUZES_JOGO.length)];
          const pts = atual.luzes.map(([c, x], i) => `<circle cx="${x * 3.2}" cy="${atual.r === 'vem' ? 70 : 70 + i * 2}" r="5" fill="${c}"/><circle cx="${x * 3.2}" cy="70" r="14" fill="${c}" opacity=".18"/>`).join('');
          $('#lzCena', el).innerHTML = svg('0 0 320 140', `<rect width="320" height="140" fill="#05080f"/>${Array.from({ length: 40 }, (_, i) => `<circle cx="${(i * 73) % 320}" cy="${(i * 37) % 120}" r="${i % 3 ? 0.6 : 1}" fill="#fff" opacity=".6"/>`).join('')}${pts}<circle cx="160" cy="62" r="3" fill="#ff3b30" class="au-pisca"/>`, 'Luzes de um avião à noite');
          $('#lzFb', el).hidden = true; $$('#lzOpts button', el).forEach((b) => { b.disabled = false; b.className = ''; });
        };
        $('#lzOpts', el).addEventListener('click', (e) => {
          const b = e.target.closest('[data-r]'); if (!b) return; const ok = b.dataset.r === atual.r;
          $$('#lzOpts button', el).forEach((x) => { x.disabled = true; if (x.dataset.r === atual.r) x.className = 'is-ok'; else if (x === b) x.className = 'is-bad'; });
          const fb = $('#lzFb', el); fb.hidden = false; fb.className = 'au-fb ' + (ok ? 'is-ok' : 'is-bad'); fb.innerHTML = `<b>${ok ? 'Certo!' : 'Não.'}</b> ${atual.exp} A luz vermelha piscando no meio é o beacon.`;
        });
        $('#lzNovo', el).addEventListener('click', nova); nova();
      } },
    { t: 'Luzes da pista', html: () => `<p>A pista vista na aproximação final, à noite. Toque nos nomes para destacar cada grupo de luzes.</p>
      <div class="au-fig" id="lpFig">${svg('0 0 320 300', `<rect width="320" height="300" fill="#05080f"/>
        <g data-k="aprox">${[0, 1, 2, 3, 4].map((i) => `<path d="M${130 - i * 10} ${290 - i * 8} H${190 + i * 10}" stroke="#fff6d0" stroke-width="2" stroke-dasharray="2 4"/>`).join('')}<path d="M160 300 V246" stroke="#fff6d0" stroke-width="2" stroke-dasharray="2 5"/></g>
        <g data-k="cab"><path d="M118 240 H202" stroke="#34d058" stroke-width="3" stroke-dasharray="3 3"/></g>
        <g data-k="borda">${Array.from({ length: 14 }, (_, i) => { const t = i / 14, y = 236 - t * 196, xl = 120 + t * 32, xr = 200 - t * 32; const c = t > 0.72 ? '#ffd23f' : '#fff'; return `<circle cx="${xl}" cy="${y}" r="${2.4 - t}" fill="${c}"/><circle cx="${xr}" cy="${y}" r="${2.4 - t}" fill="${c}"/>`; }).join('')}</g>
        <g data-k="eixo">${Array.from({ length: 18 }, (_, i) => { const t = i / 18, y = 232 - t * 190; const c = t > 0.85 ? '#ff3b30' : t > 0.65 && i % 2 ? '#ff3b30' : '#fff'; return `<circle cx="160" cy="${y}" r="${1.8 - t * 0.9}" fill="${c}"/>`; }).join('')}</g>
        <g data-k="tdz">${[0, 1, 2].map((i) => `<path d="M${140 + i * 1.2} ${222 - i * 18} h10 M${170 - i * 1.2} ${222 - i * 18} h10" stroke="#fff" stroke-width="1.6"/>`).join('')}</g>
        <g data-k="fim"><path d="M152 38 H168" stroke="#ff3b30" stroke-width="3" stroke-dasharray="2 2"/></g>
        <g data-k="papi">${['#fff', '#fff', '#ff3b30', '#ff3b30'].map((c, i) => `<circle cx="${92 + i * 7}" cy="214" r="3" fill="${c}"/>`).join('')}</g>
        <g data-k="taxi"><path d="M202 200 Q240 196 280 186" stroke="#2f6bff" stroke-width="2" stroke-dasharray="1 5"/><path d="M202 210 Q244 206 286 196" stroke="#2f6bff" stroke-width="2" stroke-dasharray="1 5"/><path d="M200 205 Q242 201 283 191" stroke="#34d058" stroke-width="1.6" stroke-dasharray="1 4"/></g>
        <g data-k="farol"><circle cx="270" cy="60" r="4" fill="#fff"/><circle cx="270" cy="60" r="12" fill="#fff" opacity=".15" class="au-pisca"/></g>`, 'Luzes de pista à noite')}</div>
      <div class="au-legend" id="lpLeg">${[['aprox', 'Aproximação', 'brancas, em fileira e barras, levam o olho até a pista'], ['cab', 'Cabeceira', 'verdes: onde a pista começa'], ['borda', 'Bordas', 'brancas; nos últimos 600 m, amarelas'], ['eixo', 'Eixo', 'brancas; depois vermelhas e brancas alternadas e, nos últimos 300 m, só vermelhas'], ['tdz', 'Zona de toque', 'barras brancas onde o avião deve tocar'], ['fim', 'Fim da pista', 'vermelhas: daqui não passa'], ['papi', 'PAPI', 'duas brancas e duas vermelhas = na rampa'], ['taxi', 'Táxi', 'bordas azuis e eixo verde'], ['farol', 'Farol do aeródromo', 'gira e pisca: mostra de longe onde está o aeroporto']].map(([k, n, d]) => `<button type="button" data-k="${k}"><b>${n}</b><span>${d}</span></button>`).join('')}</div>`,
      init: (el) => destaque(el, '#lpFig', '#lpLeg') },
    { t: 'Sinais da torre', html: () => `<p>Se o rádio parar, a torre aponta para o avião uma lanterna forte (a pistola de luz). Escolha o sinal:</p>
      <div class="au-sinais" id="sgPick">${SINAIS.map(([k, n, c]) => `<button type="button" data-s="${k}"><i style="background:${c}"></i>${n}</button>`).join('')}</div>
      <div class="au-sinal" id="sgOut"></div>
      <p class="small">No ar, o piloto confirma balançando as asas (de dia) ou piscando os faróis (à noite). No chão, mexendo os ailerons ou o leme.</p>`,
      init: (el) => {
        const mostra = (k) => { const s = SINAIS.find((x) => x[0] === k);
          $$('#sgPick button', el).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.s === k)));
          $('#sgOut', el).innerHTML = `${svg('0 0 300 90', `<rect width="300" height="90" rx="10" fill="#05080f"/><rect x="20" y="34" width="70" height="22" rx="4" fill="#3a4148"/><rect x="86" y="30" width="18" height="30" rx="4" fill="#2a2f34"/><circle cx="104" cy="45" r="10" fill="${s[2]}" class="${s[3] === true ? 'au-pisca' : ''}"/>${s[3] === 'piro' ? `<path d="M110 45 Q170 0 230 20" stroke="${s[2]}" stroke-width="3" fill="none" stroke-dasharray="4 4"/><circle cx="232" cy="20" r="8" fill="${s[2]}" class="au-pisca"/>` : `<path d="M114 45 L280 25 L280 65Z" fill="${s[2]}" opacity=".18" class="${s[3] ? 'au-pisca' : ''}"/>`}`, s[1])}
            <div class="au-tab"><div><span>Avião em voo</span><b>${s[4]}</b></div><div><span>Avião no solo</span><b>${s[5]}</b></div></div>`; };
        $('#sgPick', el).addEventListener('click', (e) => { const b = e.target.closest('[data-s]'); if (b) mostra(b.dataset.s); });
        mostra('verde');
      } },
  ],
  quiz: [
    ['Você vê, à frente, uma luz verde à sua esquerda e uma vermelha à sua direita. O outro avião:', ['Se afasta', 'Vem na sua direção', 'Cruza para a direita', 'Está parado'], 1, 'Vermelho (asa esquerda dele) do seu lado direito: ele está de frente para você.'],
    ['A luz verde de navegação fica:', ['Na cauda', 'Na ponta da asa esquerda', 'Na ponta da asa direita', 'Embaixo da fuselagem'], 2, 'Verde à direita, vermelha à esquerda, branca atrás.'],
    ['No fim da pista, as luzes do eixo ficam:', ['Verdes', 'Azuis', 'Vermelhas', 'Amarelas'], 2, 'Nos últimos 300 m, o eixo é só vermelho: avisa que a pista está acabando.'],
    ['As luzes azuis marcam:', ['A borda da pista de táxi', 'A cabeceira', 'A zona de toque', 'O fim da pista'], 0, 'Azul nas bordas do táxi; o eixo do táxi é verde.'],
    ['Em voo, sem rádio, a torre mostra verde contínuo. Significa:', ['Volte para pousar', 'Autorizado a pousar', 'Não pouse', 'Siga para o pátio'], 1, 'Verde contínuo em voo: autorizado a pousar. No chão: autorizado a decolar.'],
    ['No solo, você recebe vermelho contínuo. Você deve:', ['Decolar', 'Taxiar', 'Parar', 'Voltar ao pátio'], 2, 'Vermelho contínuo no solo: pare.'],
    ['No PAPI, você vê quatro luzes vermelhas. Você está:', ['Na rampa', 'Alto demais', 'Baixo demais', 'Fora do eixo'], 2, 'Quatro vermelhas: muito baixo. Quatro brancas: muito alto.'],
  ],
};

// ======================================================================
// 2 · ESPAÇO AÉREO
// ======================================================================
const CLASSES = {
  A: ['Só IFR', 'Todos separados de todos', 'Sim, para todos', 'Sim', '–'],
  B: ['IFR e VFR', 'Todos separados de todos', 'Sim, para todos', 'Sim', '–'],
  C: ['IFR e VFR', 'IFR separado de todos; VFR recebe informação sobre outros VFR', 'Sim, para todos', 'Sim', 'VFR: 250 kt abaixo do FL100'],
  D: ['IFR e VFR', 'IFR separado de IFR; o resto recebe informação de tráfego', 'Sim, para todos', 'Sim', '250 kt abaixo do FL100'],
  E: ['IFR e VFR', 'IFR separado de IFR; VFR não é controlado', 'Só IFR', 'IFR sim; VFR não', '250 kt abaixo do FL100'],
  F: ['IFR e VFR', 'IFR recebe assessoramento', 'Não', 'IFR sim', '250 kt abaixo do FL100'],
  G: ['IFR e VFR', 'Só informação de voo, se pedida', 'Não', 'IFR sim', '250 kt abaixo do FL100'],
};
const CAMADAS = [
  ['sup', 'Espaço aéreo superior (exemplo: classe A)', 'Acima do FL245 no Brasil. No exemplo, classe A: só voos IFR, todos controlados e separados.'],
  ['tma', 'Área de controle terminal (TMA), classe C no exemplo', 'Em volta dos aeroportos movimentados, em camadas que sobem com a distância, como um bolo de casamento de cabeça para baixo. Entrar exige autorização.'],
  ['ctr', 'Zona de controle (CTR), classe D no exemplo', 'Vai do chão até a base da TMA, em volta do aeroporto controlado. Para voar VFR ali: teto de pelo menos 1500 ft e visibilidade de 5 km.'],
  ['awy', 'Aerovia (classe E no exemplo)', 'Corredores entre os auxílios de navegação. Voos IFR são controlados; voos VFR podem cruzar sem autorização numa classe E.'],
  ['g', 'Espaço não controlado (classe G)', 'Fora das áreas controladas, perto do chão e longe dos aeroportos grandes. Só há serviço de informação de voo.'],
];
const VMC = [
  ['alto', 'A 10.000 ft ou mais (FL100)', '8 km', '1500 m na horizontal e 1000 ft na vertical'],
  ['medio', 'Abaixo de 10.000 ft e acima de 3000 ft ou 1000 ft sobre o terreno', '5 km', '1500 m na horizontal e 1000 ft na vertical'],
  ['baixoCtl', 'Até 3000 ft ou 1000 ft sobre o terreno · classes A a E', '5 km', '1500 m na horizontal e 1000 ft na vertical'],
  ['baixoG', 'Até 3000 ft ou 1000 ft sobre o terreno · classes F e G', '5 km', 'Fora de nuvens e com o chão à vista'],
];
const espaco = {
  id: 'espaco', eyebrow: 'Espaço aéreo', titulo: 'O céu tem divisões',
  lede: 'O espaço aéreo é dividido em volumes, cada um com uma classe de A a G. A classe diz quem pode voar ali, se precisa de autorização e que serviço o controle dá. O desenho abaixo é um exemplo didático: as classes reais de cada lugar estão nas cartas.',
  topicos: [
    { t: 'As camadas', html: () => `<div class="au-fig" id="eaFig">${svg('0 0 340 250', `<rect width="340" height="250" fill="#0e1a26"/>
        <g data-k="sup"><rect x="0" y="10" width="340" height="40" fill="rgba(240,106,174,.25)" stroke="#f06aae"/><text x="8" y="34" fill="#f06aae" font-size="11" font-weight="700">FL245 ↑ · superior</text></g>
        <g data-k="awy"><rect x="0" y="120" width="340" height="40" fill="rgba(134,172,242,.12)" stroke="#86acf2" stroke-dasharray="4 3"/><text x="8" y="144" fill="#86acf2" font-size="10" font-weight="700">aerovia</text></g>
        <g data-k="tma"><path d="M70 60 H270 V150 H230 V185 H110 V150 H70Z" fill="rgba(95,196,138,.18)" stroke="#5fc48a"/><text x="170" y="80" text-anchor="middle" fill="#5fc48a" font-size="11" font-weight="700">TMA</text></g>
        <g data-k="ctr"><rect x="130" y="185" width="80" height="45" fill="rgba(227,166,74,.25)" stroke="#e3a64a"/><text x="170" y="210" text-anchor="middle" fill="#e3a64a" font-size="11" font-weight="700">CTR</text></g>
        <g data-k="g"><text x="22" y="222" fill="#93a2ae" font-size="11" font-weight="700">G</text><text x="306" y="222" fill="#93a2ae" font-size="11" font-weight="700">G</text><text x="22" y="100" fill="#93a2ae" font-size="10">G</text></g>
        <rect x="0" y="230" width="340" height="20" fill="#1d2b1f"/><path d="M160 230 h20" stroke="#ccc" stroke-width="3"/><text x="170" y="245" text-anchor="middle" fill="#ccc" font-size="9">aeroporto</text>`, 'Corte lateral do espaço aéreo')}</div>
      <div class="au-legend" id="eaLeg">${CAMADAS.map(([k, n, d]) => `<button type="button" data-k="${k}"><b>${n}</b><span>${d}</span></button>`).join('')}</div>`,
      init: (el) => destaque(el, '#eaFig', '#eaLeg') },
    { t: 'As classes', html: () => `<div class="au-seg" id="clPick">${Object.keys(CLASSES).map((k) => `<button type="button" data-c="${k}">${k}</button>`).join('')}</div><div id="clOut"></div>
      <p class="small">Tabela da OACI (Anexo 11). Cada país escolhe quais classes usa. Quanto mais perto do A, mais controle; o G é o mais livre.</p>`,
      init: (el) => {
        const show = (k) => { const c = CLASSES[k]; $$('#clPick button', el).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.c === k)));
          $('#clOut', el).innerHTML = `<div class="au-tab"><div><span>Quem voa</span><b>${c[0]}</b></div><div><span>Separação</span><b>${c[1]}</b></div><div><span>Precisa de autorização</span><b>${c[2]}</b></div><div><span>Rádio obrigatório</span><b>${c[3]}</b></div><div><span>Limite de velocidade</span><b>${c[4]}</b></div></div>`; };
        $('#clPick', el).addEventListener('click', (e) => { const b = e.target.closest('[data-c]'); if (b) show(b.dataset.c); }); show('A');
      } },
    { t: 'Mínimos para VFR', html: () => `<p>Para voar VFR é preciso ver e ser visto. Escolha a altitude:</p>
      <div class="au-seg au-seg--col" id="vmPick">${VMC.map(([k, n]) => `<button type="button" data-v="${k}">${n}</button>`).join('')}</div><div id="vmOut"></div>
      <p class="small">Valores da OACI (Anexo 2). Em aeródromo controlado, o VFR ainda exige teto de 1500 ft e visibilidade de 5 km.</p>`,
      init: (el) => {
        const show = (k) => { const v = VMC.find((x) => x[0] === k); $$('#vmPick button', el).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === k)));
          const livre = k === 'baixoG';
          $('#vmOut', el).innerHTML = `${svg('0 0 320 150', `<rect width="320" height="150" fill="#13212e"/>
            <image href="${cumulus()}" x="176" y="-4" width="140" height="70" preserveAspectRatio="none"/>
            ${aviaoCima(livre ? 160 : 70, livre ? 70 : 100, 90, '#ffd23f', 0.9)}
            ${livre ? '<text x="160" y="110" text-anchor="middle" fill="#ffd23f" font-size="11" font-weight="700">fora de nuvem, chão à vista</text>' : `<path d="M90 100 H196" stroke="#ffd23f" stroke-dasharray="4 3"/><text x="140" y="94" text-anchor="middle" fill="#ffd23f" font-size="11" font-weight="700">1500 m</text><path d="M240 50 V100" stroke="#ffd23f" stroke-dasharray="4 3"/><text x="246" y="80" fill="#ffd23f" font-size="11" font-weight="700">1000 ft</text><path d="M200 100 H290" stroke="rgba(255,255,255,.2)"/>`}
            <rect y="130" width="320" height="20" fill="#1d2b1f"/>`, 'Distâncias mínimas das nuvens')}
            <div class="au-tab"><div><span>Visibilidade de voo</span><b>${v[2]}</b></div><div><span>Distância das nuvens</span><b>${v[3]}</b></div></div>`; };
        $('#vmPick', el).addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) show(b.dataset.v); }); show('alto');
      } },
    { t: 'Áreas especiais', html: () => `${svg('0 0 320 200', `<rect width="320" height="200" fill="#eef0e8"/>
        <circle cx="80" cy="80" r="46" fill="rgba(179,38,30,.12)" stroke="#b3261e" stroke-width="2"/><path d="M80 34 l6 6 m-12 0 l6 -6" stroke="#b3261e"/><text x="80" y="76" text-anchor="middle" fill="#b3261e" font-size="11" font-weight="800">SBP-201</text><text x="80" y="90" text-anchor="middle" fill="#b3261e" font-size="9">PROIBIDA</text>
        <path d="M150 40 h120 v70 h-120Z" fill="rgba(31,79,160,.1)" stroke="#1f4fa0" stroke-width="2" stroke-dasharray="6 3"/><text x="210" y="70" text-anchor="middle" fill="#1f4fa0" font-size="11" font-weight="800">SBR-402</text><text x="210" y="84" text-anchor="middle" fill="#1f4fa0" font-size="9">RESTRITA · GND/FL100</text>
        <path d="M120 140 h150 l-20 46 h-130Z" fill="rgba(227,166,74,.15)" stroke="#a86a00" stroke-width="2" stroke-dasharray="2 3"/><text x="190" y="164" text-anchor="middle" fill="#a86a00" font-size="11" font-weight="800">SBD-305</text><text x="190" y="177" text-anchor="middle" fill="#a86a00" font-size="9">PERIGOSA · tiro de artilharia</text>`, 'Áreas proibida, restrita e perigosa numa carta fictícia')}
      <ul class="au-list">
        <li><b>Proibida (P):</b> ninguém voa ali, a não ser com permissão especial. Ex.: sobre instalações sensíveis.</li>
        <li><b>Restrita (R):</b> o voo depende de condições, como horário ou autorização. Ex.: área de treinamento militar.</li>
        <li><b>Perigosa (D, de "danger"):</b> o voo é permitido, mas há algo perigoso acontecendo: tiro, balões, paraquedistas.</li>
      </ul><p class="small">No Brasil os códigos começam com SB: SBP, SBR e SBD. Os números deste desenho são inventados. Nas cartas, a área traz os limites verticais e o horário de ativação.</p>` },
  ],
  quiz: [
    ['Em qual classe só voam aviões IFR?', ['A', 'C', 'E', 'G'], 0, 'Classe A: só IFR, todos controlados e separados.'],
    ['Na classe E, um voo VFR precisa de autorização para entrar?', ['Sim', 'Não', 'Só à noite', 'Só acima do FL100'], 1, 'Na classe E, só o IFR precisa de autorização. O VFR não é controlado.'],
    ['Abaixo do FL100 na classe D, a velocidade máxima é:', ['200 kt', '250 kt', '300 kt', 'Não há limite'], 1, '250 kt abaixo do FL100 nas classes C (para VFR), D, E, F e G.'],
    ['A 12.000 ft, a visibilidade mínima para VFR é:', ['1500 m', '5 km', '8 km', '10 km'], 2, 'A partir de 10.000 ft (FL100): 8 km de visibilidade.'],
    ['Em uma área perigosa (D), o voo é:', ['Proibido', 'Permitido, com cuidado', 'Só com autorização', 'Só IFR'], 1, 'Na área perigosa o voo é permitido, mas há riscos ativos ali.'],
    ['Para voar VFR numa CTR, o teto mínimo é:', ['500 ft', '1000 ft', '1500 ft', '3000 ft'], 2, 'Aeródromo controlado: teto de 1500 ft e visibilidade de 5 km.'],
  ],
};

// ======================================================================
// 3 · REGRAS DO AR
// ======================================================================
const CENAS_REGRA = [
  ['conv', 'Rotas convergentes', 'Dois aviões na mesma altitude, com rotas que se cruzam. Quem tem o outro à <b>direita</b> dá passagem: desvia para a direita e passa por trás dele.',
    `${aviaoCima(80, 160, 90, '#ffd23f', 1.2)}${aviaoCima(200, 230, 0, '#86acf2', 1.2)}<path d="M100 160 Q150 165 170 200" stroke="#ffd23f" stroke-width="2" fill="none" stroke-dasharray="5 4" marker-end="url(#au-seta)"/><text x="40" y="140" fill="#ffd23f" font-size="11" font-weight="700">desvia (tem o outro à direita)</text><text x="214" y="262" fill="#86acf2" font-size="11" font-weight="700">mantém</text>`],
  ['frente', 'De frente', 'Dois aviões vindo um contra o outro: os <b>dois</b> desviam para a direita.',
    `${aviaoCima(160, 230, 0, '#ffd23f', 1.2)}${aviaoCima(160, 60, 180, '#86acf2', 1.2)}<path d="M168 205 Q185 150 175 110" stroke="#ffd23f" stroke-width="2" fill="none" stroke-dasharray="5 4" marker-end="url(#au-seta)"/><path d="M152 85 Q135 140 145 180" stroke="#86acf2" stroke-width="2" fill="none" stroke-dasharray="5 4" marker-end="url(#au-seta)"/><text x="190" y="160" fill="#ffd23f" font-size="11" font-weight="700">os dois para a direita</text>`],
  ['ultra', 'Ultrapassagem', 'Quem ultrapassa dá passagem e passa pela <b>direita</b> do outro, sem cortar a frente dele.',
    `${aviaoCima(160, 110, 0, '#86acf2', 1.2)}${aviaoCima(160, 250, 0, '#ffd23f', 1.2)}<path d="M168 226 Q200 170 190 90" stroke="#ffd23f" stroke-width="2" fill="none" stroke-dasharray="5 4" marker-end="url(#au-seta)"/><text x="200" y="200" fill="#ffd23f" font-size="11" font-weight="700">ultrapassa pela direita</text>`],
  ['pouso', 'Pouso', 'Avião pousando tem preferência sobre quem está no ar ou no chão. Entre dois pousando, o mais baixo tem a vez, mas não pode cortar a frente de quem já está na final.',
    `<path d="M40 260 H300" stroke="#9aa6b1" stroke-width="10"/>${aviaoCima(120, 200, 100, '#ffd23f', 1.1)}${aviaoCima(220, 120, 100, '#86acf2', 1.1)}<text x="70" y="180" fill="#ffd23f" font-size="11" font-weight="700">mais baixo: pousa primeiro</text>`],
];
const ORDEM = ['Balão', 'Planador', 'Dirigível', 'Avião rebocando', 'Avião e helicóptero'];
function niveis(rumo, ifr) {
  const leste = ((rumo % 360) + 360) % 360 < 180, out = [];
  for (let fl = 30; fl <= 410; fl += 10) { const imp = (fl / 10) % 2 === 1; if (imp === leste) out.push(ifr ? fl : fl + 5); }
  return out.filter((f) => ifr || f <= 195).slice(0, ifr ? 30 : 10);
}
const regras = {
  id: 'regras', eyebrow: 'Regras do ar', titulo: 'Quem passa primeiro',
  lede: 'Como no trânsito, o céu tem regras de preferência, de altitude e de circulação perto dos aeroportos. Elas seguem o Anexo 2 da OACI, que o Brasil adota na ICA 100-12.',
  topicos: [
    { t: 'Quem desvia?', html: () => `<div class="au-seg" id="rgPick">${CENAS_REGRA.map(([k, n]) => `<button type="button" data-g="${k}">${n}</button>`).join('')}</div><div id="rgOut"></div>
      <div class="card au-mini"><span class="label">Ordem de preferência (quem tem mais preferência primeiro)</span><ol class="au-ordem">${ORDEM.map((o) => `<li>${o}</li>`).join('')}</ol><p class="small">Quem manobra com mais dificuldade tem a preferência: o avião a motor desvia de todos os outros.</p></div>`,
      init: (el) => {
        const show = (k) => { const c = CENAS_REGRA.find((x) => x[0] === k); $$('#rgPick button', el).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.g === k)));
          $('#rgOut', el).innerHTML = svg('0 0 320 290', `<defs><marker id="au-seta" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8Z" fill="#ffd23f"/></marker></defs><rect width="320" height="290" fill="#13212e"/>${c[3]}`, c[1]) + `<p>${c[2]}</p>`; };
        $('#rgPick', el).addEventListener('click', (e) => { const b = e.target.closest('[data-g]'); if (b) show(b.dataset.g); }); show('conv');
      } },
    { t: 'Níveis de cruzeiro', html: () => `<p>Para os aviões em sentidos opostos não ficarem na mesma altitude, o nível depende do rumo magnético:</p>
      <div class="au-row"><label class="fv-f"><span>Rumo magnético</span><input id="ncRumo" type="number" inputmode="numeric" value="090"><em>°</em></label>
      <div class="seg seg--sm" id="ncTipo"><button type="button" data-t="ifr" aria-pressed="true">IFR</button><button type="button" data-t="vfr">VFR</button></div></div>
      <div id="ncFig"></div><p class="au-niveis" id="ncOut"></p>
      <p class="small">De 000° a 179°: milhares ímpares (FL030, 050, 070…). De 180° a 359°: pares (FL040, 060…). O VFR usa os mesmos, mais 500 ft (FL035, 055…). Vale acima da altitude de transição, ou acima de 3000 ft sobre o terreno.</p>`,
      init: (el) => {
        let ifr = true;
        const up = () => { const r = parseFloat($('#ncRumo', el).value) || 0, leste = ((r % 360) + 360) % 360 < 180;
          $('#ncFig', el).innerHTML = svg('0 0 300 150', `<rect width="300" height="150" fill="#13212e"/><path d="M150 140 L150 20 A120 120 0 0 1 150 260" fill="none"/>
            <path d="M150 140 L150 20 A120 120 0 0 1 270 140Z" fill="${leste ? 'rgba(240,106,174,.35)' : 'rgba(255,255,255,.06)'}"/><path d="M150 140 L30 140 A120 120 0 0 1 150 20Z" fill="${leste ? 'rgba(255,255,255,.06)' : 'rgba(134,172,242,.35)'}"/>
            <text x="215" y="90" fill="#fff" font-size="11" font-weight="700" text-anchor="middle">000°–179°</text><text x="215" y="106" fill="#fff" font-size="10" text-anchor="middle">ímpares</text>
            <text x="85" y="90" fill="#fff" font-size="11" font-weight="700" text-anchor="middle">180°–359°</text><text x="85" y="106" fill="#fff" font-size="10" text-anchor="middle">pares</text>
            <path d="M150 140 L${150 + Math.sin(r * D2R) * 110} ${140 - Math.cos(r * D2R) * 110}" stroke="#ffd23f" stroke-width="3"/><circle cx="150" cy="140" r="4" fill="#ffd23f"/>`, 'Regra semicircular');
          $('#ncOut', el).innerHTML = `<b>${ifr ? 'IFR' : 'VFR'} no rumo ${String(Math.round(r)).padStart(3, '0')}°:</b> ${niveis(r, ifr).slice(0, 8).map((f) => `FL${String(f).padStart(3, '0')}`).join(' · ')}…`; };
        $('#ncRumo', el).addEventListener('input', up);
        $('#ncTipo', el).addEventListener('click', (e) => { const b = e.target.closest('[data-t]'); if (!b) return; ifr = b.dataset.t === 'ifr'; $$('#ncTipo button', el).forEach((x) => x.setAttribute('aria-pressed', String(x === b))); up(); });
        up();
      } },
    { t: 'Circuito de tráfego', html: () => `<div class="au-fig" id="ctFig">${svg('0 0 320 260', `<rect width="320" height="260" fill="#13212e"/>
        <rect x="90" y="170" width="160" height="12" fill="#5d6873"/><text x="100" y="180" fill="#fff" font-size="9" font-weight="700">09</text><text x="232" y="180" fill="#fff" font-size="9" font-weight="700">27</text>
        <g data-k="dec"><path d="M250 176 H290" stroke="#5fc48a" stroke-width="3" marker-end="url(#au-s2)"/><text x="262" y="200" fill="#5fc48a" font-size="10" font-weight="700">decolagem</text></g>
        <g data-k="trav"><path d="M296 168 V90" stroke="#86acf2" stroke-width="3"/><text x="300" y="130" fill="#86acf2" font-size="10" font-weight="700" transform="rotate(90 300 130)">través</text></g>
        <g data-k="vento"><path d="M290 80 H50" stroke="#ffd23f" stroke-width="3"/><text x="170" y="72" text-anchor="middle" fill="#ffd23f" font-size="11" font-weight="700">perna do vento · 1000 ft</text></g>
        <g data-k="ent"><path d="M150 20 L120 80" stroke="#f06aae" stroke-width="2.5" stroke-dasharray="5 4"/><text x="156" y="28" fill="#f06aae" font-size="10" font-weight="700">entrada a 45°</text></g>
        <g data-k="base"><path d="M44 86 V164" stroke="#e3a64a" stroke-width="3"/><text x="30" y="130" fill="#e3a64a" font-size="10" font-weight="700" transform="rotate(-90 30 130)">base</text></g>
        <g data-k="final"><path d="M48 176 H88" stroke="#ff8a80" stroke-width="3"/><text x="40" y="200" fill="#ff8a80" font-size="10" font-weight="700">final</text></g>
        <defs><marker id="au-s2" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8Z" fill="#5fc48a"/></marker></defs>
        <text x="170" y="240" text-anchor="middle" fill="#93a2ae" font-size="10">circuito padrão: curvas pela esquerda</text>`, 'Circuito de tráfego')}</div>
      <div class="au-legend" id="ctLeg">${[['dec', 'Decolagem', 'Sobe na direção da pista até pelo menos 500 ft antes de curvar.'], ['trav', 'Través', 'Perna perpendicular à pista, ainda subindo.'], ['vento', 'Perna do vento', 'Paralela à pista, no sentido contrário ao do pouso, na altura do circuito: em geral 1000 ft acima do aeródromo para aviões a hélice e 1500 ft para jatos.'], ['ent', 'Entrada', 'Quem chega entra na perna do vento num ângulo de 45°, já na altura do circuito.'], ['base', 'Base', 'Perpendicular de novo: aqui começa a descida e saem os flaps.'], ['final', 'Final', 'Alinhado com a pista até o pouso.']].map(([k, n, d]) => `<button type="button" data-k="${k}"><b>${n}</b><span>${d}</span></button>`).join('')}</div>`,
      init: (el) => destaque(el, '#ctFig', '#ctLeg') },
    { t: 'Alturas mínimas', html: () => `${svg('0 0 320 170', `<rect width="320" height="170" fill="#13212e"/>
        <rect x="20" y="110" width="22" height="40" fill="#5d6873"/><rect x="48" y="90" width="26" height="60" fill="#6b7682"/><rect x="80" y="120" width="20" height="30" fill="#5d6873"/><rect x="106" y="100" width="24" height="50" fill="#6b7682"/>
        <path d="M48 90 V30" stroke="#ffd23f" stroke-dasharray="4 3"/><text x="58" y="55" fill="#ffd23f" font-size="11" font-weight="700">1000 ft acima</text><text x="58" y="68" fill="#ffd23f" font-size="9">do obstáculo mais alto</text>${aviaoCima(70, 26, 90, '#ffd23f', 0.8)}
        <path d="M190 150 V100" stroke="#5fc48a" stroke-dasharray="4 3"/><text x="198" y="125" fill="#5fc48a" font-size="11" font-weight="700">500 ft</text>${aviaoCima(230, 96, 90, '#5fc48a', 0.8)}
        <rect y="150" width="320" height="20" fill="#1d2b1f"/><text x="75" y="164" text-anchor="middle" fill="#ccc" font-size="9">cidade</text><text x="240" y="164" text-anchor="middle" fill="#ccc" font-size="9">campo aberto</text>`, 'Alturas mínimas sobre cidades e campo')}
      <ul class="au-list"><li><b>Sobre cidades ou aglomerações:</b> 1000 ft acima do obstáculo mais alto num raio de 600 m.</li><li><b>Fora delas:</b> 500 ft acima do chão ou da água.</li><li>Exceto na decolagem e no pouso, ou com autorização. A ideia é que, se o motor parar, dê para pousar sem pôr ninguém em risco.</li></ul>` },
  ],
  quiz: [
    ['Dois aviões convergem na mesma altitude. Quem deve desviar?', ['O que está mais rápido', 'O que tem o outro à sua direita', 'O que tem o outro à sua esquerda', 'Os dois'], 1, 'Quem vê o outro à direita dá passagem.'],
    ['Dois aviões de frente um para o outro devem:', ['Subir os dois', 'Desviar para a direita', 'Desviar para a esquerda', 'O menor desvia'], 1, 'De frente: ambos para a direita.'],
    ['Na ultrapassagem, quem ultrapassa passa:', ['Por cima', 'Pela esquerda', 'Pela direita', 'Por baixo'], 2, 'Pela direita, mantendo distância.'],
    ['Quem tem preferência: um avião ou um planador?', ['O avião', 'O planador', 'O mais pesado', 'Quem chegou primeiro'], 1, 'O planador manobra com mais dificuldade e não tem motor: tem a preferência.'],
    ['Voo IFR no rumo magnético 270°. Qual nível é correto?', ['FL070', 'FL080', 'FL075', 'FL085'], 1, '180° a 359°: milhares pares. FL080.'],
    ['Voo VFR no rumo 045°. Qual nível é correto?', ['FL040', 'FL045', 'FL055', 'FL060'], 2, '000° a 179°: ímpares + 500 ft para VFR: FL035, FL055, FL075…'],
    ['A perna paralela à pista, no sentido contrário ao pouso, chama-se:', ['Base', 'Final', 'Perna do vento', 'Través'], 2, 'Perna do vento: na altura do circuito, antes da base.'],
    ['Sobre uma cidade, a altura mínima é:', ['500 ft sobre o chão', '1000 ft sobre o obstáculo mais alto', '1500 ft sobre o chão', '3000 ft'], 1, '1000 ft acima do obstáculo mais alto num raio de 600 m.'],
  ],
};

// ======================================================================
// 4 · AERODINÂMICA AVANÇADA
// ======================================================================
const aero = {
  id: 'aero', eyebrow: 'Aerodinâmica avançada', titulo: 'Curvas, solo e turbulência',
  lede: 'O que acontece com o avião numa curva fechada, perto do chão e atrás de um avião grande. Os números usam o Hangar H-1, o avião fictício do Computador de voo, com estol a 50 kt em voo nivelado.',
  topicos: [
    { t: 'Curva e fator de carga', html: () => `<canvas id="cvCv" class="au-cv" aria-label="Avião em curva visto de trás, com as forças"></canvas>
      <label class="au-sl"><span>Inclinação <b id="cvBo"></b></span><input type="range" id="cvBank" min="0" max="75" value="45"></label>
      <label class="au-sl"><span>Velocidade <b id="cvVo"></b></span><input type="range" id="cvV" min="60" max="160" value="100"></label>
      <div class="au-tab" id="cvOut"></div>
      <p class="small">Numa curva nivelada, a sustentação inclina junto com a asa. Só a parte vertical segura o peso, então a asa precisa gerar mais: o fator de carga é 1 ÷ cos(inclinação). A velocidade de estol sobe com a raiz quadrada do fator de carga.</p>`,
      init: (el) => {
        const up = () => {
          const b = +$('#cvBank', el).value, v = +$('#cvV', el).value, n = 1 / Math.cos(b * D2R), vs = 50 * Math.sqrt(n);
          const vms = v * 0.5144, r = b > 0.5 ? vms * vms / (9.81 * Math.tan(b * D2R)) : Infinity, taxa = b > 0.5 ? (9.81 * Math.tan(b * D2R) / vms) / D2R : 0;
          $('#cvBo', el).textContent = b + '°'; $('#cvVo', el).textContent = v + ' kt';
          cenaCurva($('#cvCv', el), b);
          $('#cvOut', el).innerHTML = `<div><span>Fator de carga</span><b>${nf(n, 2)} g</b></div><div><span>Estol nesta curva</span><b>${nf(vs)} kt</b></div><div><span>Raio da curva</span><b>${Number.isFinite(r) ? nf(r) + ' m' : '–'}</b></div><div><span>Volta de 360°</span><b>${taxa ? nf(360 / taxa) + ' s' : '–'}</b></div>`;
        };
        $('#cvBank', el).addEventListener('input', up); $('#cvV', el).addEventListener('input', up); requestAnimationFrame(up);
      } },
    { t: 'Efeito solo', html: () => `<canvas id="esCv" class="au-cv" aria-label="Avião sobre a pista com os vórtices das pontas das asas"></canvas>
      <label class="au-sl"><span>Altura da asa sobre o chão <b id="esHo"></b></span><input type="range" id="esH" min="5" max="100" value="10"></label>
      <div class="au-tab" id="esOut"></div>
      <p class="small">Perto do chão, os vórtices das pontas das asas não têm espaço para se formar e o fluxo para baixo atrás da asa diminui. O arrasto induzido cai, e o avião parece "flutuar": quem chega rápido demais no pouso vai longe na pista. O efeito é forte abaixo de um quarto da envergadura e quase some a uma envergadura de altura. Valores aproximados dos publicados pela FAA: redução de 47,6% a 1/10 da envergadura, 23,5% a 1/4 e 1,4% a uma envergadura.</p>`,
      init: (el) => {
        const up = () => { const pct = +$('#esH', el).value, red = Math.min(70, 76.2 * Math.exp(-4.71 * pct / 100)), fi = 1 - red / 100;
          $('#esHo', el).textContent = `${pct}% da envergadura`;
          $('#esOut', el).innerHTML = `<div><span>Arrasto induzido</span><b>${nf(fi * 100)}% do normal</b></div><div><span>Redução</span><b>${nf(red)}%</b></div>`; };
        $('#esH', el).addEventListener('input', up); up(); animar($('#esCv', el), () => cenaSolo($('#esCv', el), +$('#esH', el).value));
      } },
    { t: 'Esteira de turbulência', init: (el) => animar($('#etCv', el), () => cenaEsteira($('#etCv', el))), html: () => `<canvas id="etCv" class="au-cv" aria-label="Jato pesado deixando dois vórtices que descem"></canvas>
      <ul class="au-list">
        <li><b>O que é:</b> dois redemoinhos que saem das pontas das asas de todo avião. Nos grandes, são fortes o bastante para virar um avião pequeno.</li>
        <li><b>Piores quando o avião é</b> pesado, lento e está limpo (sem flaps): justamente na decolagem e no pouso.</li>
        <li><b>Categorias:</b> L (leve), M (média), H (pesada, "heavy") e J ("super", como o A380). O controle dá mais tempo de separação atrás dos maiores.</li>
        <li><b>Como evitar:</b> no pouso atrás de um avião grande, fique acima da rampa dele e toque depois do ponto onde ele tocou. Na decolagem, saia do chão antes do ponto onde ele saiu. Vento cruzado fraco pode deixar um vórtice parado sobre a pista.</li>
      </ul>` },
    { t: 'Parafuso', init: (el) => animar($('#pfCv', el), () => cenaParafuso($('#pfCv', el))), html: () => `<canvas id="pfCv" class="au-cv" aria-label="Avião em parafuso descendo em espiral"></canvas>
      <p>O parafuso começa num estol com o avião derrapando: uma asa estola mais fundo, perde mais sustentação e cai, e o avião gira em espiral, descendo, sem sair do estol.</p>
      <div class="card au-mini"><span class="label">Saída padrão (PARE): confira sempre no manual do avião</span><ol class="au-ordem">
        <li><b>P</b>otência: toda reduzida</li><li><b>A</b>ilerons: neutros</li><li><b>R</b>udder (leme): todo contra o giro</li><li><b>E</b>levator (profundor): para a frente, até sair do estol</li></ol>
        <p class="small">Quando o giro para, leme neutro e recupera do mergulho com suavidade, sem puxar demais (para não estolar de novo nem passar do fator de carga).</p></div>` },
  ],
  quiz: [
    ['Numa curva nivelada de 60°, o fator de carga é:', ['1,15 g', '1,41 g', '2 g', '3 g'], 2, '1 ÷ cos 60° = 2: você e o avião "pesam" o dobro.'],
    ['Se o estol é 50 kt em voo nivelado, numa curva de 60° ele passa a ser cerca de:', ['50 kt', '60 kt', '71 kt', '100 kt'], 2, '50 × √2 ≈ 71 kt.'],
    ['Com a mesma inclinação, voando mais rápido, o raio da curva:', ['Diminui', 'Aumenta', 'Não muda', 'Depende do peso'], 1, 'O raio cresce com o quadrado da velocidade.'],
    ['O efeito solo é forte quando a asa está:', ['Acima de 2 envergaduras', 'Abaixo de um quarto da envergadura', 'Só sobre a água', 'Em curva'], 1, 'Abaixo de um quarto da envergadura o arrasto induzido cai bastante; a uma envergadura, quase nada.'],
    ['A esteira de turbulência é pior quando o avião da frente está:', ['Leve e rápido', 'Pesado, lento e sem flaps', 'Em cruzeiro alto', 'Com vento forte'], 1, 'Pesado, lento e limpo: vórtices mais fortes.'],
    ['Pousando atrás de um avião grande, você deve tocar:', ['Antes do ponto onde ele tocou', 'Depois do ponto onde ele tocou', 'No mesmo ponto', 'Tanto faz'], 1, 'Os vórtices param de existir onde ele pousou: toque depois, voando acima da rampa dele.'],
    ['Na saída do parafuso, o leme vai:', ['A favor do giro', 'Neutro', 'Todo contra o giro', 'Para baixo'], 2, 'Leme todo contra o giro para parar a rotação.'],
  ],
};

// ---------- Cenas realistas (canvas) ----------
const R = () => window.Realismo;
function telaCena(cv, LW, LH) {
  const d = Math.min(2, window.devicePixelRatio || 1), w = cv.clientWidth || 340, s = w * d / LW;
  cv.width = Math.round(LW * s); cv.height = Math.round(LH * s); cv.style.height = Math.round(w * LH / LW) + 'px';
  const c = cv.getContext('2d'); c.setTransform(s, 0, 0, s, 0, 0); return { c, s };
}
// Desenha uma nuvem no retângulo (x, y, w, h) da cena; as bolhas vêm em coordenadas da cena
function N(c, s, x, y, w, h, bolhas, o = {}) {
  const W = Math.max(8, Math.round(w * s)), H = Math.max(8, Math.round(h * s));
  const bs = bolhas.map((b) => ({ x: (b.x - x) * s, y: (b.y - y) * s, rx: b.rx * s, ry: b.ry * s, k: b.k }));
  const oo = { ...o, topo: o.topo != null ? (o.topo - y) * s : undefined, base: o.base != null ? (o.base - y) * s : undefined };
  c.drawImage(R().nuvem(W, H, bs, oo), x, y, w, h);
}
function rotulo(c, x, y, txt, cor = '#fff', tam = 13, al = 'left') {
  c.save(); c.font = `700 ${tam}px Inter, system-ui, sans-serif`; c.textAlign = al; c.shadowColor = 'rgba(0,0,0,.75)'; c.shadowBlur = 4; c.fillStyle = cor; c.fillText(txt, x, y); c.restore();
}
function seta(c, x0, y0, x1, y1, cor) {
  c.save(); c.strokeStyle = cor; c.fillStyle = cor; c.lineWidth = 3; c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 3;
  c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); const a = Math.atan2(y1 - y0, x1 - x0);
  c.beginPath(); c.moveTo(x1, y1); c.lineTo(x1 - Math.cos(a - 0.45) * 11, y1 - Math.sin(a - 0.45) * 11); c.lineTo(x1 - Math.cos(a + 0.45) * 11, y1 - Math.sin(a + 0.45) * 11); c.closePath(); c.fill(); c.restore();
}
function cenaFrente(cv, k) {
  const { c, s } = telaCena(cv, 640, 330), chao = 290;
  R().ceu(c, 640, 330, k === 'fria' ? ['#2f4a68', '#6f8cab', '#b8c6d2'] : k === 'quente' ? ['#5b6d80', '#8f9fae', '#c3ccd3'] : ['#3c4b5c', '#7a8999', '#b3bdc6'], chao);
  if (k === 'fria') {
    // Cunha de ar frio entrando por baixo do quente
    const g = c.createLinearGradient(0, 160, 0, chao); g.addColorStop(0, 'rgba(70,120,210,0)'); g.addColorStop(1, 'rgba(70,120,210,.35)');
    c.fillStyle = g; c.beginPath(); c.moveTo(0, 150); c.bezierCurveTo(200, 160, 300, 220, 345, chao); c.lineTo(0, chao); c.closePath(); c.fill();
    N(c, s, 180, 0, 460, 270, [{ x: 365, y: 215, rx: 85, ry: 40 }, { x: 350, y: 172, rx: 72, ry: 50 }, { x: 372, y: 128, rx: 66, ry: 48 }, { x: 368, y: 88, rx: 60, ry: 40 }, { x: 380, y: 58, rx: 70, ry: 26 }, { x: 405, y: 40, rx: 160, ry: 19, k: 1.1 }, { x: 490, y: 44, rx: 90, ry: 13 }, { x: 412, y: 190, rx: 55, ry: 42 }, { x: 318, y: 205, rx: 45, ry: 34 }], { topo: 20, base: 255, amp: 0.55 });
    R().chuva(c, 312, 420, 245, chao, { dens: 0.9 });
    N(c, s, 470, 180, 150, 70, [{ x: 540, y: 220, rx: 50, ry: 22 }, { x: 515, y: 210, rx: 26, ry: 20 }, { x: 560, y: 208, rx: 24, ry: 18 }], { topo: 190, base: 240 });
    R().terreno(c, 640, 330, chao, '#34452f', '#18211a', 2);
    seta(c, 60, 250, 200, 250, '#9cc3ff'); rotulo(c, 40, 238, 'ar frio, pesado', '#cfe1ff');
    seta(c, 500, 270, 445, 205, '#ffb3a8'); rotulo(c, 630, 312, 'ar quente e úmido sobe de repente', '#ffd2cc', 12, 'right');
    rotulo(c, 430, 110, 'cumulonimbus', '#fff', 13);
  } else if (k === 'quente') {
    const g = c.createLinearGradient(0, 120, 0, chao); g.addColorStop(0, 'rgba(70,120,210,0)'); g.addColorStop(1, 'rgba(70,120,210,.3)');
    c.fillStyle = g; c.beginPath(); c.moveTo(110, chao); c.bezierCurveTo(300, 250, 480, 160, 640, 110); c.lineTo(640, chao); c.closePath(); c.fill();
    // Cirrus finos ao longe, altostratus no meio, nimbostratus perto da frente
    N(c, s, 430, 40, 210, 60, [{ x: 520, y: 70, rx: 90, ry: 7 }, { x: 600, y: 60, rx: 50, ry: 5 }], { amp: 0.9, escala: 0.06, alfa: 0.75, sombra: [190, 200, 212] });
    N(c, s, 260, 110, 260, 70, [{ x: 390, y: 140, rx: 125, ry: 16 }, { x: 330, y: 146, rx: 70, ry: 14 }], { topo: 120, base: 165, amp: 0.5, alfa: 0.92 });
    N(c, s, 60, 150, 290, 110, [{ x: 200, y: 205, rx: 140, ry: 34 }, { x: 130, y: 210, rx: 70, ry: 28 }, { x: 270, y: 195, rx: 80, ry: 26 }], { topo: 160, base: 245, amp: 0.45, sombra: [70, 80, 94], baseCor: [52, 58, 68] });
    R().chuva(c, 80, 300, 235, chao, { dens: 0.6, inc: 0.05 });
    R().terreno(c, 640, 330, chao, '#3a4a33', '#1a221a', 5);
    seta(c, 60, 270, 150, 222, '#ffb3a8'); rotulo(c, 20, 312, 'ar quente sobe devagar, numa rampa longa', '#ffd2cc', 12);
    rotulo(c, 520, 36, 'cirrus', '#fff', 12); rotulo(c, 360, 104, 'altostratus', '#fff', 12); rotulo(c, 140, 146, 'nimbostratus', '#fff', 12); rotulo(c, 560, 270, 'ar frio', '#cfe1ff', 12);
  } else if (k === 'oclusa') {
    const g = c.createLinearGradient(0, 150, 0, chao); g.addColorStop(0, 'rgba(70,120,210,0)'); g.addColorStop(1, 'rgba(70,120,210,.32)');
    c.fillStyle = g; c.fillRect(0, 150, 640, chao - 150);
    N(c, s, 90, 20, 480, 250, [{ x: 330, y: 190, rx: 190, ry: 40 }, { x: 300, y: 140, rx: 120, ry: 45 }, { x: 350, y: 95, rx: 70, ry: 50 }, { x: 345, y: 55, rx: 120, ry: 18 }, { x: 220, y: 175, rx: 90, ry: 30 }], { topo: 40, base: 235, amp: 0.5 });
    R().chuva(c, 170, 470, 225, chao, { dens: 0.75, inc: 0.07 });
    R().terreno(c, 640, 330, chao, '#34452f', '#18211a', 8);
    seta(c, 330, 120, 330, 40, '#ffb3a8'); rotulo(c, 345, 24, 'ar quente levantado do chão', '#ffd2cc', 12);
    rotulo(c, 20, 270, 'ar frio', '#cfe1ff', 12); rotulo(c, 560, 270, 'ar frio', '#cfe1ff', 12);
  } else {
    c.fillStyle = 'rgba(70,120,210,.18)'; c.fillRect(0, 170, 320, chao - 170); c.fillStyle = 'rgba(220,90,70,.12)'; c.fillRect(320, 170, 320, chao - 170);
    N(c, s, 20, 130, 600, 110, [{ x: 320, y: 185, rx: 270, ry: 24 }, { x: 160, y: 190, rx: 110, ry: 20 }, { x: 470, y: 180, rx: 110, ry: 20 }], { topo: 160, base: 210, amp: 0.45, sombra: [96, 106, 118] });
    R().chuva(c, 120, 520, 205, chao, { dens: 0.35, inc: 0.02 });
    R().terreno(c, 640, 330, chao, '#3a4a33', '#1a221a', 11);
    rotulo(c, 40, 270, 'ar frio', '#cfe1ff', 12); rotulo(c, 560, 270, 'ar quente', '#ffd2cc', 12); rotulo(c, 320, 130, 'a frente fica parada', '#fff', 12, 'center');
  }
}
// Microexplosão: cena parada desenhada uma vez + partículas e avião animados por cima
function cenaMicro(cv, el) {
  const LW = 640, LH = 360, chao = 318, x0 = 330;
  let fundo = null, sAtual = 0, t0 = 0, voando = false, raf = 0;
  const P = Array.from({ length: 260 }, (_, i) => ({ s: R().hash2(i, 1), i: R().hash2(i, 2) * 2 - 1, v: 0.35 + R().hash2(i, 3) * 0.3 }));
  const rampa = (x) => 112 + (x - 20) / (600) * (chao - 112);
  const desv = (x) => { const u = (x - x0) / 170; return u < -1 ? 0 : u < -0.35 ? -20 * Math.sin((u + 1) / 0.65 * Math.PI / 2) : u < 0.5 ? -20 + (u + 0.35) / 0.85 * 52 : 32 + (u - 0.5) * 12; };
  const linha = (p) => { // ponto na linha de corrente: desce pelo núcleo e se espalha rente ao chão
    const lado = p.i < 0 ? -1 : 1, off = p.i * 46, s = p.s;
    if (s < 0.62) return [x0 + off * (1 + s * 0.3), 150 + s / 0.62 * (chao - 205)];
    const u = (s - 0.62) / 0.38, r = 60 + u * 230;
    return [x0 + off * 1.2 + lado * r * u, chao - 55 + Math.sin(u * Math.PI * 0.5) * 45 - Math.max(0, u - 0.75) * 120];
  };
  const montarFundo = () => {
    const off = document.createElement('canvas'); const { c, s } = telaCena(cv, LW, LH); sAtual = s;
    off.width = cv.width; off.height = cv.height; const o = off.getContext('2d'); o.setTransform(s, 0, 0, s, 0, 0);
    R().ceu(o, LW, LH, ['#1d2a3a', '#4a5b6e', '#8796a4'], chao);
    // Cumulonimbus com bigorna, escuro embaixo
    N(o, s, 40, 0, 600, 190, [{ x: 330, y: 135, rx: 160, ry: 30 }, { x: 322, y: 104, rx: 112, ry: 42 }, { x: 338, y: 72, rx: 92, ry: 38 }, { x: 340, y: 46, rx: 100, ry: 26 }, { x: 345, y: 28, rx: 235, ry: 17, k: 1.1 }, { x: 460, y: 33, rx: 120, ry: 12 }, { x: 225, y: 122, rx: 78, ry: 30 }, { x: 435, y: 126, rx: 78, ry: 28 }],
      { topo: 10, base: 165, amp: 0.55, sombra: [70, 82, 98], baseCor: [36, 42, 52] });
    R().chuva(o, x0 - 62, x0 + 62, 150, chao - 4, { dens: 1, inc: 0, cor: '150,165,185' });
    R().terreno(o, LW, LH, chao, '#3c4733', '#171d15', 4);
    // Poeira levantada pela rajada ao bater no chão
    N(o, s, x0 - 260, chao - 70, 520, 74, [{ x: x0 - 150, y: chao - 18, rx: 95, ry: 20 }, { x: x0 + 150, y: chao - 18, rx: 95, ry: 20 }, { x: x0 - 220, y: chao - 30, rx: 40, ry: 26 }, { x: x0 + 220, y: chao - 30, rx: 40, ry: 26 }],
      { lit: [196, 170, 132], sombra: [104, 86, 64], baseCor: [80, 66, 50], amp: 0.7, alfa: 0.7, topo: chao - 60, base: chao });
    // Pista à direita e a rampa
    o.fillStyle = '#4b5258'; o.fillRect(560, chao - 2, 80, 5); o.setLineDash([6, 5]); o.strokeStyle = 'rgba(120,230,150,.6)'; o.lineWidth = 1.5;
    o.beginPath(); o.moveTo(20, rampa(20)); o.lineTo(600, rampa(600)); o.stroke(); o.setLineDash([]);
    rotulo(o, 24, rampa(20) - 8, 'rampa de 3°', '#bff0cc', 11);
    fundo = off;
  };
  const frame = (t) => {
    if (!document.contains(cv)) return;
    if (!fundo || Math.abs(cv.clientWidth * Math.min(2, window.devicePixelRatio || 1) - cv.width) > 2) montarFundo();
    const c = cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(fundo, 0, 0); c.setTransform(sAtual, 0, 0, sAtual, 0, 0);
    // Partículas da rajada: riscos curtos ao longo das linhas de corrente
    c.lineCap = 'round';
    for (const p of P) { p.s += p.v * 0.006; if (p.s > 1) p.s -= 1;
      const a = linha(p), b = linha({ ...p, s: Math.max(0, p.s - 0.025) }), al = p.s < 0.62 ? 0.55 : 0.55 * (1 - (p.s - 0.62) / 0.38);
      c.strokeStyle = p.s < 0.62 ? `rgba(200,215,235,${al})` : `rgba(210,190,160,${al})`; c.lineWidth = 1.6; c.beginPath(); c.moveTo(b[0], b[1]); c.lineTo(a[0], a[1]); c.stroke(); }
    // Avião e o caminho percorrido
    const p = voando ? Math.min(1, (t - t0) / 7000) : 0, xa = 20 + p * 560;
    const ya = (x) => Math.min(chao - 3, rampa(x) + desv(x));
    c.strokeStyle = 'rgba(255,210,63,.85)'; c.lineWidth = 2; c.beginPath(); for (let x = 20; x <= xa; x += 3) x === 20 ? c.moveTo(x, ya(x)) : c.lineTo(x, ya(x)); c.stroke();
    const ang = Math.atan2(ya(xa + 2) - ya(xa - 2), 4);
    R().jato(c, xa, ya(xa) - 4, 46, ang);
    const u = (xa - x0) / 170, fase = !voando ? 0 : u < -1 ? 0 : u < -0.35 ? 1 : u < 0.35 ? 2 : u < 1.4 ? 3 : 0;
    const txt = $('#mxTxt', el); if (txt) txt.textContent = ['Aproximação normal, na rampa', '1 · Vento de frente: velocidade sobe, avião sobe', '2 · Corrente descendente: avião afunda', '3 · Vento de cauda: velocidade despenca'][fase];
    if (fase) rotulo(c, xa, ya(xa) - 22, ['', '+ velocidade', '↓ afunda', '− velocidade'][fase], fase === 1 ? '#bff0cc' : '#ffb3a8', 12, 'center');
    if (p >= 1) voando = false;
    raf = requestAnimationFrame(frame);
  };
  $('#mxPlay', el).addEventListener('click', () => { voando = true; t0 = performance.now(); });
  raf = requestAnimationFrame(frame);
}
// Cumulus para o desenho dos mínimos VFR (imagem pronta, fundo transparente)
let cumulusURL = '';
function cumulus() {
  if (cumulusURL) return cumulusURL;
  const cv = R().nuvem(300, 150, [{ x: 150, y: 104, rx: 105, ry: 24 }, { x: 125, y: 80, rx: 46, ry: 38 }, { x: 170, y: 66, rx: 50, ry: 44 }, { x: 208, y: 90, rx: 38, ry: 28 }, { x: 92, y: 96, rx: 38, ry: 22 }], { topo: 20, base: 128, amp: 0.55 });
  cumulusURL = cv.toDataURL(); return cumulusURL;
}

// ---------- Cenas da Aerodinâmica avançada ----------
function fundoAereo(cv, LW, LH, hz, seed, nuvens) {
  // Céu, nuvens e o chão visto de cima; fica guardado numa tela fora da página
  const off = document.createElement('canvas'), { s } = telaCena(cv, LW, LH); off.width = cv.width; off.height = cv.height;
  const o = off.getContext('2d'); o.setTransform(s, 0, 0, s, 0, 0);
  R().ceu(o, LW, LH, ['#1f4f86', '#4f86bd', '#a9c6dd', '#dbe6ee'], hz);
  for (const [x, y, w, h, b] of nuvens) N(o, s, x, y, w, h, b, { topo: y + h * 0.2, base: y + h, amp: 0.6 });
  R().campos(o, 0, hz, LW, LH - hz, seed, s);
  const nev = o.createLinearGradient(0, hz - 18, 0, hz + 30); nev.addColorStop(0, 'rgba(220,232,240,0)'); nev.addColorStop(0.4, 'rgba(220,232,240,.7)'); nev.addColorStop(1, 'rgba(220,232,240,0)');
  o.fillStyle = nev; o.fillRect(0, hz - 18, LW, 48);
  return { off, s };
}
function cenaCurva(cv, b) {
  const LW = 640, LH = 380;
  if (!cv._f || cv._w !== cv.clientWidth) { cv._f = fundoAereo(cv, LW, LH, 250, 3, [[30, 60, 200, 80, [{ x: 130, y: 110, rx: 80, ry: 22 }, { x: 110, y: 92, rx: 36, ry: 28 }, { x: 150, y: 86, rx: 40, ry: 32 }]], [430, 120, 190, 70, [{ x: 525, y: 165, rx: 80, ry: 18 }, { x: 510, y: 148, rx: 34, ry: 24 }, { x: 545, y: 145, rx: 30, ry: 22 }]]]); cv._w = cv.clientWidth; }
  const c = cv.getContext('2d'), { off, s } = cv._f; c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(off, 0, 0); c.setTransform(s, 0, 0, s, 0, 0);
  const n = 1 / Math.cos(b * D2R), cx = 320, cy = 175, k = 70, L = Math.min(170, k * n), a = b * D2R;
  R().leveTras(c, cx, cy, 1.45, b);
  // Forças: sustentação inclinada, a parte vertical, a parte que puxa para dentro da curva e o peso
  seta(c, cx, cy, cx - Math.sin(a) * L, cy - Math.cos(a) * L, '#4fe08a');
  c.save(); c.setLineDash([6, 4]); seta(c, cx, cy, cx, cy - k, '#9cc3ff'); if (b > 3) seta(c, cx, cy, cx - Math.tan(a) * k, cy, '#ffb347'); c.restore();
  seta(c, cx, cy, cx, cy + k, '#ff7a6e');
  rotulo(c, Math.max(12, cx - Math.sin(a) * L - 10), Math.max(18, cy - Math.cos(a) * L - 10), `sustentação: ${nf(n, 2)} × o peso`, '#9ff5c1', 13, 'left');
  rotulo(c, cx + 8, cy - k + 4, 'segura o peso', '#cfe1ff', 12);
  if (b > 3) rotulo(c, Math.max(12, cx - Math.tan(a) * k), cy + 22, 'puxa para dentro da curva', '#ffd39a', 12, 'left');
  rotulo(c, cx + 14, cy + k - 4, 'peso', '#ffb3a8', 13);
  // Arco da inclinação
  c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 1.5; c.beginPath(); c.arc(cx, cy, 120, -Math.PI / 2 - a, -Math.PI / 2, false); c.stroke();
  rotulo(c, cx + 14, cy - 122, `${b}°`, '#fff', 14);
}
function cenaSolo(cv, pct) {
  const LW = 640, LH = 360, hz = 120, chao = 340;
  if (!cv._f || cv._w !== cv.clientWidth) {
    const off = document.createElement('canvas'), { s } = telaCena(cv, LW, LH); off.width = cv.width; off.height = cv.height;
    const o = off.getContext('2d'); o.setTransform(s, 0, 0, s, 0, 0);
    R().ceu(o, LW, LH, ['#24364d', '#6a7f96', '#e6b98a', '#f3d2a6'], hz);
    N(o, s, 380, 30, 240, 70, [{ x: 500, y: 78, rx: 100, ry: 14 }, { x: 470, y: 68, rx: 40, ry: 16 }], { topo: 45, base: 92, amp: 0.7, lit: [255, 226, 196], sombra: [120, 104, 112] });
    R().campos(o, 0, hz, LW, LH - hz, 9, s);
    // Pista em perspectiva com faixas e luzes
    const P = (u, v) => [320 + (u - 0.5) * (40 + v * 520), hz + 6 + Math.pow(v, 1.6) * (LH - hz)];
    o.fillStyle = '#3d4247'; o.beginPath(); o.moveTo(...P(0, 0)); o.lineTo(...P(1, 0)); o.lineTo(...P(1, 1)); o.lineTo(...P(0, 1)); o.closePath(); o.fill();
    o.strokeStyle = 'rgba(255,255,255,.85)';
    for (let v = 0.05; v < 1; v += 0.09) { const [x1, y1] = P(0.5, v), [x2, y2] = P(0.5, v + 0.04); o.lineWidth = 0.6 + v * 3; o.beginPath(); o.moveTo(x1, y1); o.lineTo(x2, y2); o.stroke(); }
    for (const u of [0.04, 0.96]) { o.lineWidth = 1.2; o.beginPath(); o.moveTo(...P(u, 0)); o.lineTo(...P(u, 1)); o.stroke(); }
    for (let v = 0.02; v < 1; v += 0.06) for (const u of [-0.02, 1.02]) { const [x, y] = P(u, v); o.fillStyle = 'rgba(255,240,200,.9)'; o.beginPath(); o.arc(x, y, 0.6 + v * 2, 0, 7); o.fill(); }
    const nev = o.createLinearGradient(0, hz - 14, 0, hz + 24); nev.addColorStop(0, 'rgba(243,210,166,0)'); nev.addColorStop(0.45, 'rgba(243,210,166,.75)'); nev.addColorStop(1, 'rgba(243,210,166,0)'); o.fillStyle = nev; o.fillRect(0, hz - 14, LW, 38);
    cv._f = { off, s }; cv._w = cv.clientWidth;
  }
  const c = cv.getContext('2d'), { off, s } = cv._f; c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(off, 0, 0); c.setTransform(s, 0, 0, s, 0, 0);
  const sc = 1.15, span = 226 * sc, h = pct / 100 * span, yAsa = chao - 40 * sc - h, cx = 320;
  // Sombra no chão, mais nítida quanto mais perto
  c.save(); c.globalAlpha = Math.max(0.12, 0.5 - pct / 250); if ('filter' in c) c.filter = `blur(${2 + pct / 8}px)`; c.fillStyle = '#000';
  c.beginPath(); c.ellipse(cx + 10, chao - 6, span * 0.5, 6, 0, 0, 7); c.fill(); c.restore();
  // Vórtices nas pontas: giram (horário à esquerda, anti-horário à direita) e são achatados pelo chão
  const red = Math.min(70, 76.2 * Math.exp(-4.71 * pct / 100)), Rv = 46 * (1 - red / 80), t = performance.now() / 1000;
  for (const kk of [-1, 1]) {
    const tx = cx + kk * span * 0.5, ty = yAsa - 8, ry = Math.min(Rv, Math.max(6, (chao - ty) * 0.75));
    for (let i = 0; i < 90; i++) {
      const r = (0.25 + R().hash2(i, kk + 5) * 0.75), th = R().hash2(i, kk + 9) * 6.283 + kk * -t * (3.2 / (0.3 + r));
      const x = tx + kk * 6 + Math.cos(th) * Rv * r, y = ty + Math.sin(th) * ry * r, x2 = tx + kk * 6 + Math.cos(th + kk * 0.25) * Rv * r, y2 = ty + Math.sin(th + kk * 0.25) * ry * r;
      c.strokeStyle = `rgba(225,238,255,${0.5 * (1 - r * 0.6)})`; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x, y); c.lineTo(x2, y2); c.stroke();
    }
  }
  R().leveTras(c, cx, yAsa, sc, 0, { sol: 1 });
  rotulo(c, 320, 30, red > 30 ? 'vórtices esmagados pelo chão' : red > 8 ? 'vórtices um pouco menores' : 'vórtices livres', '#fff', 14, 'center');
}
function cenaEsteira(cv) {
  const LW = 640, LH = 340, hz = 300;
  if (!cv._f || cv._w !== cv.clientWidth) { cv._f = fundoAereo(cv, LW, LH, hz, 5, [[20, 20, 220, 80, [{ x: 120, y: 70, rx: 90, ry: 18 }, { x: 100, y: 55, rx: 40, ry: 24 }, { x: 140, y: 52, rx: 36, ry: 22 }]], [380, 180, 240, 90, [{ x: 500, y: 238, rx: 100, ry: 20 }, { x: 480, y: 222, rx: 44, ry: 26 }, { x: 525, y: 218, rx: 40, ry: 24 }]]]); cv._w = cv.clientWidth; }
  const c = cv.getContext('2d'), { off, s } = cv._f; c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(off, 0, 0); c.setTransform(s, 0, 0, s, 0, 0);
  const t = performance.now() / 1000, tx = 450, ty = 92;
  // Dois tubos de vórtice saindo das pontas das asas, descendo para trás
  for (const [dz, al] of [[-10, 0.45], [10, 0.8]]) {
    // núcleo do tubo (névoa) e a espiral de partículas em volta
    c.save(); if ('filter' in c) c.filter = 'blur(6px)';
    const g = c.createLinearGradient(tx - 470, 0, tx - 40, 0); g.addColorStop(0, 'rgba(235,242,255,0)'); g.addColorStop(1, `rgba(235,242,255,${0.35 * al})`);
    c.strokeStyle = g; c.lineWidth = 16; c.beginPath(); c.moveTo(tx - 40, ty + 6 + dz * 0.6); c.lineTo(tx - 470, ty + 6 + dz * 0.6 + 120); c.stroke(); c.restore();
    for (let i = 0; i < 900; i++) {
      const u = R().hash2(i, dz + 50), th = u * 80 + t * 6 + R().hash2(i, 7) * 6.283, rad = 6 + u * 18;
      const px = tx - 40 - u * 430, py = ty + 6 + dz * 0.6 + u * 120 + Math.sin(th) * rad, z = Math.cos(th);
      c.fillStyle = `rgba(240,246,255,${al * (1 - u * 0.9) * (0.35 + 0.45 * z)})`; c.beginPath(); c.arc(px + Math.cos(th) * 3, py, 1 + 0.7 * (z + 1) * 0.5, 0, 7); c.fill();
    }
  }
  R().jato(c, tx, ty, 150, -0.05);
  rotulo(c, tx + 10, ty - 30, 'avião pesado (H)', '#fff', 13);
  // Trajetória segura acima e o avião leve em perigo atrás e abaixo
  c.save(); c.setLineDash([8, 6]); c.strokeStyle = 'rgba(120,240,160,.9)'; c.lineWidth = 2; c.beginPath(); c.moveTo(30, 70); c.lineTo(390, 50); c.stroke(); c.restore();
  rotulo(c, 40, 62, 'fique acima da trajetória dele', '#bff0cc', 12);
  R().jato(c, 130, 205, 60, 0.02, '#ffe7a8');
  rotulo(c, 92, 236, 'avião leve: perigo', '#ffb3a8', 12);
  rotulo(c, 330, 250, 'os vórtices descem 300–500 ft/min', '#e2ecff', 12);
}
function cenaParafuso(cv) {
  const LW = 640, LH = 380, hz = 70;
  if (!cv._f || cv._w !== cv.clientWidth) {
    const off = document.createElement('canvas'), { s } = telaCena(cv, LW, LH); off.width = cv.width; off.height = cv.height;
    const o = off.getContext('2d'); o.setTransform(s, 0, 0, s, 0, 0);
    R().ceu(o, LW, LH, ['#3a6fa6', '#9ec0da', '#e3ecf2'], hz); R().campos(o, 0, hz, LW, LH - hz, 13, s);
    const nev = o.createLinearGradient(0, hz - 10, 0, hz + 40); nev.addColorStop(0, 'rgba(227,236,242,0)'); nev.addColorStop(0.3, 'rgba(227,236,242,.8)'); nev.addColorStop(1, 'rgba(227,236,242,0)'); o.fillStyle = nev; o.fillRect(0, hz - 10, LW, 50);
    cv._f = { off, s }; cv._w = cv.clientWidth;
  }
  const c = cv.getContext('2d'), { off, s } = cv._f; c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(off, 0, 0); c.setTransform(s, 0, 0, s, 0, 0);
  // Hélice de descida vista de cima e de lado: o avião gira em torno de um eixo vertical e desce
  const T = (performance.now() / 1000) % 8, pos = (tt) => { const ph = tt * 2.2, y = 70 + tt / 8 * 250; return [320 + Math.cos(ph) * 110, y + Math.sin(ph) * 26, ph]; };
  c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath();
  for (let tt = Math.max(0, T - 3); tt <= T; tt += 0.03) { const [x, y] = pos(tt); tt === Math.max(0, T - 3) ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke();
  const [x, y, ph] = pos(T), esc = 1.0 + T / 8 * 0.8;
  R().leveTopo(c, x, y, esc, (ph * 180 / Math.PI) % 360 + 90, { achatar: 0.62 });
  rotulo(c, 20, 30, 'as duas asas estoladas, uma mais que a outra', '#fff', 13);
  rotulo(c, 20, 48, 'o avião gira e desce em espiral', '#e2ecff', 12);
}
function animar(cv, desenhar) {
  const f = () => { if (!document.contains(cv)) return; desenhar(); requestAnimationFrame(f); };
  requestAnimationFrame(f);
}

// ======================================================================
// 5 · METEOROLOGIA PRÁTICA
// ======================================================================
const FRENTES = {
  fria: ['Frente fria', 'O ar frio, mais pesado, entra por baixo do quente como uma cunha e o empurra para cima de repente. Nuvens de desenvolvimento vertical (cumulus e cumulonimbus), pancadas fortes, trovoadas e turbulência numa faixa estreita. Depois que passa: temperatura cai, vento muda, céu limpa e a visibilidade melhora.', '#1f6fff',
    `<path d="M0 170 L140 170 Q170 170 200 90 L200 170 L320 170" fill="rgba(31,111,255,.25)"/><path d="M190 30 q10 -24 34 -14 q16 -18 38 0 q16 2 16 20 q0 26 -40 30 v40 h-30 v-40 q-34 -10 -18 -36Z" fill="#c9d3dc"/><path d="M215 110 v40 M232 112 v40 M248 110 v40" stroke="#86acf2" stroke-width="2"/><text x="60" y="160" fill="#86acf2" font-size="11" font-weight="700">ar frio →</text><text x="250" y="70" fill="#ffd23f" font-size="11" font-weight="700">CB</text>`],
  quente: ['Frente quente', 'O ar quente, mais leve, sobe devagar por cima do frio numa rampa longa. As nuvens aparecem centenas de quilômetros antes: cirrus, depois altostratus e, perto da frente, nimbostratus e stratus com chuva fraca e contínua, teto baixo e visibilidade ruim por muito tempo.', '#e0352b',
    `<path d="M0 170 L320 170 L320 150 Q160 120 20 40 L0 40Z" fill="rgba(224,53,43,.18)"/><path d="M200 70 q40 -10 110 -6 v10 h-110Z" fill="#c9d3dc"/><path d="M90 120 q60 -14 140 -10 v16 h-140Z" fill="#9aa6b1"/><path d="M110 140 v28 M130 140 v28 M150 140 v28 M170 140 v28" stroke="#86acf2" stroke-width="1.5"/><text x="20" y="160" fill="#ff8a80" font-size="11" font-weight="700">← ar quente sobe devagar</text><text x="230" y="58" fill="#c9d3dc" font-size="10">cirrus</text>`],
  oclusa: ['Frente oclusa', 'A frente fria, mais rápida, alcança a quente e levanta todo o ar quente do chão. Junta o pior das duas: chuva longa e áreas com trovoadas escondidas dentro das camadas de nuvens.', '#8a3ff0',
    `<path d="M0 170 L320 170 L320 120 Q160 60 0 120Z" fill="rgba(138,63,240,.2)"/><path d="M100 60 q20 -20 50 -6 q30 -14 50 6 q20 20 -20 30 h-60 q-40 -10 -20 -30Z" fill="#c9d3dc"/><text x="160" y="150" text-anchor="middle" fill="#c39cff" font-size="11" font-weight="700">ar quente levantado do chão</text>`],
  estac: ['Frente estacionária', 'Nenhum dos dois ar avança: a frente fica parada e o tempo ruim pode durar dias sobre o mesmo lugar.', '#555',
    `<path d="M0 170 L160 170 Q170 120 160 60 L0 60Z" fill="rgba(31,111,255,.2)"/><path d="M160 60 Q170 120 160 170 L320 170 L320 60Z" fill="rgba(224,53,43,.15)"/><path d="M110 50 q40 -10 100 0 v12 h-100Z" fill="#9aa6b1"/><text x="80" y="150" fill="#86acf2" font-size="11" font-weight="700">frio</text><text x="230" y="150" fill="#ff8a80" font-size="11" font-weight="700">quente</text>`],
};
function simboloFrente(tipo) {
  const lin = '<path d="M10 30 H290" stroke="COR" stroke-width="3"/>';
  const tri = (x, c) => `<path d="M${x} 30 l8 -12 l8 12Z" fill="${c}"/>`, sem = (x, c) => `<path d="M${x} 30 a8 8 0 0 1 16 0Z" fill="${c}"/>`;
  const xs = [30, 80, 130, 180, 230];
  if (tipo === 'fria') return lin.replace('COR', '#1f6fff') + xs.map((x) => tri(x, '#1f6fff')).join('');
  if (tipo === 'quente') return lin.replace('COR', '#e0352b') + xs.map((x) => sem(x, '#e0352b')).join('');
  if (tipo === 'oclusa') return lin.replace('COR', '#8a3ff0') + xs.map((x, i) => (i % 2 ? sem(x, '#8a3ff0') : tri(x, '#8a3ff0'))).join('');
  return '<path d="M10 30 H150" stroke="#1f6fff" stroke-width="3"/><path d="M150 30 H290" stroke="#e0352b" stroke-width="3"/>' + tri(60, '#1f6fff') + `<path d="M200 30 a8 8 0 0 0 16 0Z" fill="#e0352b"/>`;
}
const tempo = {
  id: 'tempo', eyebrow: 'Meteorologia prática', titulo: 'Frentes, gelo e cortante de vento',
  lede: 'Os fenômenos que mais derrubam aviões e como o piloto se protege deles: as frentes, o gelo na asa, a cortante de vento perto do chão e a carta que resume o tempo da rota.',
  topicos: [
    { t: 'Frentes', html: () => `<div class="au-seg" id="frPick">${Object.entries(FRENTES).map(([k, f]) => `<button type="button" data-f="${k}">${f[0]}</button>`).join('')}</div><div id="frOut"></div>`,
      init: (el) => {
        const show = (k) => { const f = FRENTES[k]; $$('#frPick button', el).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.f === k)));
          $('#frOut', el).innerHTML = `<canvas class="au-cv" id="frCv" aria-label="Corte de ${f[0]}"></canvas>` +
            `<p><b>Na carta:</b></p>${svg('0 0 300 44', `<rect width="300" height="44" fill="#eef0e8" rx="6"/>${simboloFrente(k)}`, `Símbolo de ${f[0]}`)}<p>${f[1]}</p>`; requestAnimationFrame(() => cenaFrente($('#frCv', el), k)); };
        $('#frPick', el).addEventListener('click', (e) => { const b = e.target.closest('[data-f]'); if (b) show(b.dataset.f); }); show('fria');
      } },
    { t: 'Gelo', html: () => `<p>Gelo se forma quando o avião voa dentro de umidade visível (nuvem ou chuva) com a temperatura perto ou abaixo de 0 °C: as gotas estão super-resfriadas, ainda líquidas abaixo de zero, e congelam ao bater na asa.</p>
      <label class="au-sl"><span>Temperatura do ar <b id="glTo"></b></span><input type="range" id="glT" min="-30" max="10" value="-4"></label>
      <div class="seg seg--sm" id="glUmid"><button type="button" data-u="1" aria-pressed="true">Dentro de nuvem ou chuva</button><button type="button" data-u="0">Ar seco, céu claro</button></div>
      <div id="glOut"></div>
      <ul class="au-list"><li><b>Claro (liso):</b> gotas grandes que escorrem antes de congelar. Pesado, transparente, difícil de tirar. Mais comum entre 0 e −10 °C.</li><li><b>Opaco (escarcha):</b> gotas pequenas que congelam na hora, prendendo ar. Branco e áspero. Mais comum entre −10 e −20 °C.</li><li><b>Chuva congelante:</b> chuva que cai de uma camada quente para uma fria (inversão, comum antes de frentes quentes). É o mais perigoso: saia subindo para o ar quente ou descendo, se o chão permitir.</li></ul>
      <p class="small">O gelo deforma a asa: menos sustentação, mais arrasto e estol numa velocidade maior. Avião sem proteção contra gelo não pode voar em condições de formação de gelo.</p>`,
      init: (el) => {
        let umid = true;
        const up = () => { const t = +$('#glT', el).value; $('#glTo', el).textContent = `${t} °C`;
          let n, cor, txt;
          if (!umid) { n = 'Sem risco'; cor = 'var(--ok)'; txt = 'Sem umidade visível, não há gotas para congelar na asa.'; }
          else if (t > 2) { n = 'Sem risco'; cor = 'var(--ok)'; txt = 'Acima de 0 °C a água não congela (cuidado com o carburador, que gela até com ar quente e úmido).'; }
          else if (t >= -10) { n = 'Risco alto: gelo claro'; cor = 'var(--bad)'; txt = 'A faixa mais perigosa: gotas grandes e super-resfriadas formam gelo liso e pesado.'; }
          else if (t >= -20) { n = 'Risco médio: gelo opaco'; cor = 'var(--warn)'; txt = 'Gotas menores congelam na hora: gelo áspero e branco.'; }
          else { n = 'Risco baixo'; cor = 'var(--ok)'; txt = 'Muito frio: a nuvem é quase toda de cristais de gelo, que não grudam tanto.'; }
          $('#glOut', el).innerHTML = `<p class="au-risco" style="border-color:${cor};color:${cor}"><b>${n}.</b> ${txt}</p>`; };
        $('#glT', el).addEventListener('input', up);
        $('#glUmid', el).addEventListener('click', (e) => { const b = e.target.closest('[data-u]'); if (!b) return; umid = b.dataset.u === '1'; $$('#glUmid button', el).forEach((x) => x.setAttribute('aria-pressed', String(x === b))); up(); });
        up();
      } },
    { t: 'Microexplosão', html: () => `<p>Uma microexplosão é uma coluna de ar que despenca de uma nuvem de tempestade e se espalha ao bater no chão. Na aproximação, o avião passa por três trechos. Toque em <b>Voar</b>:</p>
      <canvas id="mxCv" class="au-cv" aria-label="Avião atravessando uma microexplosão"></canvas>
      <div class="au-row"><button type="button" class="btn" id="mxPlay">Voar</button><span class="au-mx" id="mxTxt"></span></div>
      <ul class="au-list"><li><b>1 · Vento de frente aumenta:</b> a velocidade sobe e o avião sobe acima da rampa. Parece bom, e o piloto tende a reduzir a potência. É a armadilha.</li><li><b>2 · Corrente descendente:</b> o ar empurra o avião para baixo.</li><li><b>3 · Vento de cauda:</b> a velocidade cai de repente, logo depois de ter sido reduzida. O avião afunda abaixo da rampa, perto do chão.</li></ul>
      <p class="small">Saída: potência máxima, nariz para cima até o aviso de estol, sem recolher flaps e trem até ter certeza de que está subindo. Melhor ainda: não entre. Esperar 15 a 20 minutos a tempestade passar resolve.</p>`,
      init: (el) => requestAnimationFrame(() => cenaMicro($('#mxCv', el), el)) },
    { t: 'Carta de tempo significativo', html: () => `<p>A carta SIGWX mostra, para uma faixa de altitudes, onde há tempestades, turbulência, gelo e corrente de jato. Esta é inventada. Toque nos símbolos da legenda:</p>
      <div class="au-fig" id="swFig">${svg('0 0 340 260', `<rect width="340" height="260" fill="#eef0e8"/>
        <path d="M20 30 Q90 10 150 40 T320 60" fill="none" stroke="#c9cfc3" stroke-width="18"/>
        <g data-k="cb"><path d="M40 120 q10 -18 26 -8 q12 -16 28 -4 q18 -8 24 10 q16 8 6 24 q4 18 -16 20 q-8 16 -26 8 q-16 12 -28 -2 q-20 0 -18 -18 q-14 -14 4 -30Z" fill="rgba(179,38,30,.08)" stroke="#b3261e" stroke-width="2"/><text x="82" y="140" text-anchor="middle" fill="#b3261e" font-size="10" font-weight="800">ISOL EMBD CB</text><text x="82" y="152" text-anchor="middle" fill="#b3261e" font-size="9">XXX/FL080</text></g>
        <g data-k="turb"><path d="M180 140 h110 v60 h-110Z" fill="none" stroke="#a86a00" stroke-width="2" stroke-dasharray="6 3"/><path d="M220 166 l8 -12 l8 12 M220 176 l8 -12 l8 12" fill="none" stroke="#a86a00" stroke-width="2"/><text x="246" y="172" fill="#a86a00" font-size="10" font-weight="800">FL240/FL180</text></g>
        <g data-k="gelo"><path d="M200 70 h90 v40 h-90Z" fill="none" stroke="#1f4fa0" stroke-width="2" stroke-dasharray="6 3"/><path d="M208 84 q8 16 16 0 M216 80 v18" fill="none" stroke="#1f4fa0" stroke-width="2"/><text x="236" y="95" fill="#1f4fa0" font-size="10" font-weight="800">MOD · FL150/100</text></g>
        <g data-k="jato"><path d="M20 220 Q120 190 220 210 T330 200" fill="none" stroke="#161616" stroke-width="3"/><path d="M322 194 l10 6 l-10 6Z" fill="#161616"/><text x="120" y="235" fill="#161616" font-size="10" font-weight="800">FL350 · 120 kt</text></g>
        <g data-k="frente"><path d="M10 80 Q60 70 120 90" fill="none" stroke="#1f6fff" stroke-width="3"/>${[20, 50, 80].map((x) => `<path d="M${x} ${78 + (x - 10) * 0.12} l7 -11 l7 10Z" fill="#1f6fff"/>`).join('')}</g>`, 'Carta de tempo significativo fictícia')}</div>
      <div class="au-legend" id="swLeg">${[['cb', 'Cumulonimbus', 'Linha recortada em volta: ISOL (isolados), OCNL (ocasionais), FRQ (frequentes); EMBD = escondidos em outras nuvens. XXX/FL080: do FL080 até acima da carta.'], ['turb', 'Turbulência', 'O chapéu de bruxa: um para moderada, dois para forte. Os números são o topo e a base (FL240 e FL180).'], ['gelo', 'Gelo', 'Um arco com um traço vertical no meio, com a intensidade (MOD = moderado, SEV = forte) e os níveis do topo e da base.'], ['jato', 'Corrente de jato', 'Seta grossa com o nível e a velocidade máxima do vento. Nas cartas reais, a velocidade vem também em barbelas: cada traço vale 10 kt e cada bandeirinha, 50 kt.'], ['frente', 'Frente', 'Os mesmos símbolos das cartas de superfície.']].map(([k, n, d]) => `<button type="button" data-k="${k}"><b>${n}</b><span>${d}</span></button>`).join('')}</div>`,
      init: (el) => destaque(el, '#swFig', '#swLeg') },
  ],
  quiz: [
    ['A frente com triângulos azuis na carta é:', ['Quente', 'Fria', 'Oclusa', 'Estacionária'], 1, 'Triângulos azuis: fria. Semicírculos vermelhos: quente.'],
    ['Qual frente traz chuva fraca e contínua por muito tempo, com teto baixo?', ['Fria', 'Quente', 'Nenhuma', 'Só a oclusa'], 1, 'A frente quente sobe devagar numa rampa longa: nimbostratus e stratus.'],
    ['Trovoadas e pancadas fortes numa faixa estreita são típicas da frente:', ['Fria', 'Quente', 'Estacionária', 'De nenhuma'], 0, 'A frente fria levanta o ar quente de repente: cumulonimbus.'],
    ['A faixa de temperatura mais perigosa para gelo claro é:', ['+5 a 0 °C', '0 a −10 °C', '−20 a −30 °C', 'Abaixo de −40 °C'], 1, 'Entre 0 e −10 °C, com gotas grandes e super-resfriadas.'],
    ['Na microexplosão, o primeiro sinal na aproximação é:', ['Vento de cauda', 'A velocidade aumentar e o avião subir', 'Gelo', 'Turbulência leve'], 1, 'O vento de frente aumenta a velocidade: a armadilha é reduzir a potência.'],
    ['Na carta SIGWX, "EMBD CB" quer dizer:', ['CB isolados', 'CB escondidos dentro de outras nuvens', 'CB dissipando', 'CB acima do FL450'], 1, 'Embedded: escondidos em camadas de nuvens, perigosos para quem voa por instrumentos.'],
  ],
};

// ---------- Destaque de figura + legenda ----------
function destaque(el, fig, leg) {
  const f = $(fig, el), l = $(leg, el);
  l.addEventListener('click', (e) => { const b = e.target.closest('[data-k]'); if (!b) return;
    const on = b.getAttribute('aria-pressed') !== 'true';
    $$('button', l).forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
    $('svg', f).classList.toggle('is-dim', on); $$('[data-k]', f).forEach((g) => g.classList.toggle('is-on', on && g.dataset.k === b.dataset.k)); });
  f.addEventListener('click', (e) => { const g = e.target.closest('[data-k]'); if (g) $(`[data-k="${g.dataset.k}"]`, l)?.click(); });
}

// ---------- Montagem ----------
const AULAS = { luzes, espaco, regras, aero, tempo };
function montar(a) {
  const root = $(`#view-${a.id}`); if (!root || root.dataset.ok) return; root.dataset.ok = '1';
  root.innerHTML = `<div class="view__head"><p class="eyebrow">${a.eyebrow}</p><h1>${a.titulo}</h1><p class="lede">${a.lede}</p></div>
    <div class="au"><div class="seg seg--chips au__pick">${a.topicos.map((t, i) => `<button type="button" data-t="${i}">${t.t}</button>`).join('')}</div>
    <div class="card au__topico" aria-live="polite"></div>
    <div class="card au__quiz"><span class="label">Teste o que aprendeu</span><div class="au-q"></div></div></div>`;
  const pick = $('.au__pick', root), box = $('.au__topico', root);
  const abrir = (i) => { const t = a.topicos[i]; $$('button', pick).forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.t === i)));
    box.innerHTML = `<h2>${t.t}</h2>${t.html()}`; t.init?.(box); };
  pick.addEventListener('click', (e) => { const b = e.target.closest('[data-t]'); if (b) abrir(+b.dataset.t); });
  abrir(0); quiz($('.au-q', root), a.quiz);
}
function quiz(box, qs) {
  let q = 0, ok = 0, resp = false;
  const mostra = () => {
    if (q >= qs.length) { box.innerHTML = `<p class="ct-q__res"><b>${ok} de ${qs.length}</b> ${ok === qs.length ? 'Perfeito!' : 'Revise os tópicos e tente de novo.'}</p><button type="button" class="btn-ghost" data-a="again">Refazer</button>`; return; }
    const [t, ops] = qs[q]; resp = false;
    box.innerHTML = `<p class="small">Pergunta ${q + 1} de ${qs.length}</p><p class="ct-q__t">${esc(t)}</p><div class="ct-q__ops">${ops.map((o, i) => `<button type="button" data-o="${i}">${esc(o)}</button>`).join('')}</div><p class="ct-q__fb" hidden></p><button type="button" class="btn" data-a="next" hidden>Próxima</button>`;
  };
  box.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.a === 'again') { q = 0; ok = 0; return mostra(); }
    if (b.dataset.a === 'next') { q++; return mostra(); }
    if (b.dataset.o === undefined || resp) return; resp = true;
    const [, , certa, ex] = qs[q], i = +b.dataset.o, acerto = i === certa; if (acerto) ok++;
    $$('[data-o]', box).forEach((x) => { x.disabled = true; if (+x.dataset.o === certa) x.classList.add('is-ok'); else if (x === b) x.classList.add('is-bad'); });
    const fb = $('.ct-q__fb', box); fb.hidden = false; fb.className = 'ct-q__fb ' + (acerto ? 'is-ok' : 'is-bad'); fb.innerHTML = `<b>${acerto ? 'Certo.' : 'Não é essa.'}</b> ${esc(ex)}`;
    const nx = $('[data-a="next"]', box); nx.hidden = false; nx.textContent = q === qs.length - 1 ? 'Ver resultado' : 'Próxima';
  });
  mostra();
}
window.Aulas = { start: (id) => AULAS[id] && montar(AULAS[id]), ids: Object.keys(AULAS), niveis };
})();
