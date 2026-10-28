/* Desastres aéreos: os acidentes da história da aviação, contados com cuidado e com o que se aprendeu
   com cada um. Cada acidente tem ficha, relato, linha do tempo ligada ao mapa da rota e um esquema da falha. */
(() => {
'use strict';
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- Ilustrações do JAL 123 ---------- */
// Mapa esquemático da região de Tóquio (fora de escala), viewBox 360x240
const JAL123_ROTA = 'M296 128 C286 150 268 176 240 190 C226 196 214 184 206 168 C198 150 202 126 214 112 C228 98 250 96 256 108 C262 122 238 128 222 118 C206 108 196 92 188 78 C180 64 166 56 150 48';
function mapaJal123() {
  return `<svg viewBox="0 0 360 240" role="img" aria-label="Mapa esquemático da rota do voo JAL 123">
    <rect width="360" height="240" class="hs-fill-water"/>
    <path d="M0 0 H360 V112 L330 118 L306 112 L300 126 L310 140 L296 150 L282 162 L262 166 L246 174 L232 168 L222 182 L216 214 L208 212 L200 186 L190 176 L176 182 L150 186 L110 196 L60 206 L0 214Z" class="hs-fill-ground"/>
    <path d="M170 150 L156 132 L164 124 L176 124 L184 132Z" class="hs-fill-mount"/><path d="M164 124 L170 118 L176 124 L172 127 L168 125Z" class="hs-fill-snow"/>
    <text x="146" y="158" class="dz-map-t">Monte Fuji</text>
    <circle cx="296" cy="128" r="4" class="hs-fill-accent"/><text x="300" y="146" class="dz-map-t" text-anchor="middle">Haneda (Tóquio)</text>
    <circle cx="265" cy="100" r="3" class="hs-fill-blue"/><text x="272" y="98" class="dz-map-t">Base de Yokota</text>
    <text x="250" y="212" class="dz-map-t">Baía de Sagami</text><text x="196" y="230" class="dz-map-t">Península de Izu</text>
    <text x="64" y="26" class="dz-map-t">Gunma (montanhas)</text>
    <path d="M30 222 L40 230" class="hs-line"/><text x="12" y="236" class="dz-map-s">Esquema fora de escala</text>
    <path d="${JAL123_ROTA}" class="dz-route-bg"/>
    <path id="dzPath" d="${JAL123_ROTA}" class="dz-route"/>
    <g id="dzMarks"></g>
    <path d="M144 42 l6 6 l6 -6 M144 54 l6 -6 l6 6" class="dz-x"/><text x="100" y="40" class="dz-map-t dz-map-crash">Cume Osutaka</text>
    <g id="dzPlane"><circle r="9" class="dz-plane-halo"/><path d="M0 -7 L2 -2 L8 1 L8 3 L2 2 L1.5 6 L4 8 L4 9 L0 8 L-4 9 L-4 8 L-1.5 6 L-2 2 L-8 3 L-8 1 L-2 -2Z" class="dz-plane"/></g>
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

/* ---------- Os acidentes ---------- */
const ACIDENTES = [
  {
    id: 'jal123', ano: 1985, data: '12 de agosto de 1985', titulo: 'Japan Air Lines 123', sub: 'O pior acidente com um único avião da história',
    resumo: 'Um Boeing 747 perdeu o estabilizador vertical e todos os comandos hidráulicos. A tripulação lutou por 32 minutos, só com os motores, antes de cair nas montanhas de Gunma.',
    ficha: [['Avião', 'Boeing 747SR-46'], ['Matrícula', 'JA8119'], ['Rota', 'Tóquio (Haneda) → Osaka (Itami)'], ['Local', 'Cume Osutaka, Gunma, Japão'],
      ['A bordo', '524 (509 passageiros e 15 tripulantes)'], ['Mortos', '520'], ['Sobreviventes', '4'], ['Causa', 'Reparo malfeito na antepara de pressão traseira']],
    numeros: [['524', 'a bordo'], ['520', 'mortos'], ['4', 'sobreviventes'], ['32 min', 'de luta sem comandos']],
    secoes: [
      { t: 'O voo', p: ['Era fim de tarde de 12 de agosto de 1985, véspera do Obon, o feriado em que os japoneses visitam a família. O voo 123 da Japan Air Lines ia de Tóquio a Osaka, uma ponte aérea curta, de cerca de uma hora. O Boeing 747 estava quase lotado: 509 passageiros e 15 tripulantes.',
        'Na cabine, o primeiro-oficial Yutaka Sasaki, em treinamento para comandante, pilotava do assento da esquerda. O comandante Masami Takahama, instrutor, estava na direita. O engenheiro de voo era Hiroshi Fukuda. O avião decolou de Haneda às 18h12.'] },
      { t: 'O estrondo', p: ['Às 18h24, subindo a cerca de 24.000 pés (7.300 m) sobre a baía de Sagami, houve um estrondo na parte de trás do avião. A cabine se encheu de névoa, sinal de descompressão, e as máscaras de oxigênio caíram.',
        'A antepara de pressão traseira, a parede em forma de cúpula que fecha a cabine pressurizada na cauda, tinha se rompido. O ar pressurizado da cabine invadiu a cauda, que não foi feita para aguentar essa pressão, e arrancou a maior parte do estabilizador vertical.',
        'Pior: as linhas dos quatro sistemas hidráulicos do 747 passavam pela cauda. Todas foram rompidas, e o fluido vazou em poucos minutos. Sem hidráulico, o manche, os pedais e os comandos de voo não respondiam mais.'] },
      { t: '32 minutos sem comandos', p: ['Sem deriva e sem comandos, o avião entrou em oscilações violentas: subia e descia em ondas (fugoide) e balançava de um lado para o outro, o chamado dutch roll.',
        'A tripulação acionou o código de emergência 7700, pediu para voltar a Haneda e tentou controlar o avião usando só a potência dos quatro motores: mais potência para subir, menos para descer, diferença entre os lados para virar. Era uma técnica que nenhum manual ensinava.',
        'Por volta das 18h40, baixaram o trem de pouso pelo sistema alternativo, por gravidade, e isso ajudou a amortecer as oscilações. A base aérea americana de Yokota se ofereceu para recebê-los. Mas o avião continuava praticamente incontrolável e foi sendo levado para as montanhas.',
        'A gravação da cabine registrou a luta até o fim. Em certo momento, o comandante disse: "Isto pode não ter jeito". Mesmo assim, os três continuaram tentando até o último segundo.'] },
      { t: 'A queda', p: ['Às 18h56, depois de 32 minutos, o 747 bateu numa crista perto do Cume Osutaka, na província de Gunma, a cerca de 100 km de Tóquio, e pegou fogo.',
        'Durante a descida, alguns passageiros escreveram bilhetes de despedida para a família. Muitos foram encontrados nos destroços e se tornaram um dos símbolos da tragédia. Entre as vítimas estava o cantor Kyu Sakamoto, de "Ue o Muite Arukō", conhecida no mundo como "Sukiyaki".'] },
      { t: 'O resgate que demorou', p: ['Cerca de 20 minutos depois da queda, um avião C-130 da Força Aérea americana, da base de Yokota, localizou os destroços em chamas e informou a posição. Um helicóptero americano chegou a ser mandado, mas a ajuda não foi aceita, e as equipes japonesas só chegaram ao local na manhã seguinte, mais de 12 horas depois.',
        'Foram encontradas quatro sobreviventes, todas mulheres: entre elas uma comissária da própria JAL que viajava de folga e uma menina de 12 anos. Elas contaram que ouviram outras pessoas vivas durante a noite. Médicos disseram depois que mais gente poderia ter sobrevivido se o resgate tivesse chegado antes.'] },
      { t: 'A causa', p: ['Sete anos antes, em 2 de junho de 1978, esse mesmo avião bateu a cauda na pista ao pousar em Osaka, e a antepara traseira foi danificada. O reparo foi feito por técnicos da própria Boeing.',
        'A emenda deveria ser feita com uma placa de reforço inteira, presa por duas fileiras de rebites. Foi feita com duas placas separadas, e num trecho a junção ficou segura por uma fileira só. A peça passou a ter só cerca de 70% da resistência à fadiga prevista.',
        'A cada voo, a cabine era pressurizada e despressurizada, e pequenas rachaduras foram crescendo, escondidas, por mais de 12.000 voos. Em 12 de agosto de 1985, a antepara cedeu. A Boeing reconheceu o erro no reparo.'] },
    ],
    linha: [['18:12', 'Decolagem de Haneda, Tóquio.', 0], ['18:24', 'Estrondo a cerca de 24.000 pés: a antepara traseira se rompe e o avião perde a deriva e os quatro sistemas hidráulicos.', .24],
      ['18:25', 'Código 7700 de emergência. A tripulação pede para voltar a Haneda.', .36], ['18:40', 'O trem de pouso é baixado por gravidade e ajuda a amortecer as oscilações.', .58],
      ['18:47', 'A base de Yokota oferece pouso, mas o avião segue quase sem controle rumo às montanhas.', .76], ['18:56', 'Queda perto do Cume Osutaka, em Gunma.', 1]],
    falha: 'Ponto de partida: a antepara rompida deixou o ar pressurizado da cabine invadir a cauda. A pressão arrancou a deriva e cortou as quatro linhas hidráulicas de uma vez.',
    mudou: ['A Boeing modificou o 747: instalou uma tampa que impede o ar da cabine de entrar na cauda se a antepara falhar e válvulas que seguram o fluido hidráulico se as linhas da cauda forem cortadas.',
      'Reparos estruturais passaram a ser vistos como pontos críticos de inspeção, verificados de novo ao longo da vida do avião.',
      'Pesquisas sobre como controlar um avião só com os motores ganharam força, como o projeto PCA da NASA, nos anos 1990.',
      'Em 2006 a JAL abriu o Centro de Promoção da Segurança, em Tóquio, onde a antepara rompida e partes do avião são mostradas a todos os funcionários.'],
    memoria: 'Todo dia 12 de agosto, familiares das vítimas sobem a trilha até o Cume Osutaka para lembrar os 520 que morreram. A JAL deixou de usar o número 123 nos seus voos.',
    fontes: [['Wikipedia: Japan Air Lines Flight 123', 'https://en.wikipedia.org/wiki/Japan_Air_Lines_Flight_123'], ['Britannica: Japan Airlines flight 123', 'https://www.britannica.com/event/Mount-Osutaka-airline-disaster'],
      ['Nippon.com: Japan’s Deadliest Air Disaster', 'https://www.nippon.com/en/guide-to-japan/cs00019/'], ['Admiral Cloudberg: Fire on the Mountain', 'https://admiralcloudberg.medium.com/fire-on-the-mountain-the-crash-of-japan-airlines-flight-123-dadebd321224']],
    mapa: mapaJal123, esquema: falhaJal123,
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
  $('#dzStory').innerHTML = a.secoes.map((s, i) => `<section class="dz-sec"><h3><span>${String(i + 1).padStart(2, '0')}</span>${esc(s.t)}</h3>${s.p.map((p) => `<p>${esc(p)}</p>`).join('')}</section>`).join('');
  $('#dzMap').innerHTML = a.mapa();
  $('#dzFail').innerHTML = a.esquema();
  $('#dzFailTxt').textContent = a.falha;
  $('#dzChanged').innerHTML = a.mudou.map((m) => `<li>${esc(m)}</li>`).join('');
  $('#dzMemory').textContent = a.memoria;
  $('#dzSrc').innerHTML = a.fontes.map(([n, u]) => `<a href="${u}" target="_blank" rel="noopener">${esc(n)}</a>`).join(' · ');
  // Marcas dos eventos sobre a rota
  const path = $('#dzPath'), L = path.getTotalLength();
  $('#dzMarks').innerHTML = a.linha.map(([h, , f], i) => { const p = path.getPointAtLength(L * f); return `<g class="dz-mark" data-i="${i}"><circle cx="${p.x}" cy="${p.y}" r="3.2"/></g>`; }).join('');
  $('#dzLine').innerHTML = a.linha.map(([h, t], i) => `<li><button type="button" data-i="${i}"><b>${h}</b><span>${esc(t)}</span></button></li>`).join('');
  irPara(a.linha.length - 1, false);
}

// Move o avião no mapa até o evento i da linha do tempo
function irPara(i, animar = true) {
  passo = i;
  const a = atual, path = $('#dzPath'), L = path.getTotalLength(), plane = $('#dzPlane');
  const alvo = a.linha[i][2], de = animar ? (Number(plane.dataset.f) || 0) : alvo;
  cancelAnimationFrame(tocando);
  const t0 = performance.now(), dur = animar ? 900 + Math.abs(alvo - de) * 1800 : 0;
  const frame = (now) => {
    const k = dur ? Math.min(1, (now - t0) / dur) : 1, e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, f = de + (alvo - de) * e;
    const p = path.getPointAtLength(L * f), q = path.getPointAtLength(Math.min(L, L * f + 1)), r = path.getPointAtLength(Math.max(0, L * f - 1));
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

function init() {
  if (!$('#dzList')) return;
  lista();
  $('#dzList').addEventListener('click', (e) => { const b = e.target.closest('[data-dz]'); if (!b) return; atual = ACIDENTES.find((a) => a.id === b.dataset.dz) || atual; lista(); mostrar(); $('#dzCase').scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  $('#dzLine').addEventListener('click', (e) => { const b = e.target.closest('button[data-i]'); if (b) { clearTimeout(auto); irPara(+b.dataset.i); } });
  $('#dzPlay').addEventListener('click', reproduzir);
}
let pronto = false;
function start() { if (!pronto) { pronto = true; mostrar(); } }
window.Desastres = { init, start };
})();
