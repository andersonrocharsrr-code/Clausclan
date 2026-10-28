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
/* ---------- Os acidentes ---------- */
const ACIDENTES = [
  {
    id: 'jal123', ano: 1985, data: '12 de agosto de 1985', titulo: 'Japan Air Lines 123', sub: 'O pior acidente com um único avião da história',
    resumo: 'Um Boeing 747 lotado perde a cauda e todos os comandos sobre o Japão. Por 32 minutos, três pilotos tentam o impossível: voar só com os motores, enquanto o avião sobe, despenca e balança sem parar.',
    ficha: [['Avião', 'Boeing 747SR-46'], ['Matrícula', 'JA8119'], ['Rota', 'Tóquio (Haneda) → Osaka (Itami)'], ['Local', 'Cume Osutaka, Gunma, Japão'],
      ['A bordo', '524 (509 passageiros e 15 tripulantes)'], ['Mortos', '520'], ['Sobreviventes', '4'], ['Causa', 'Reparo malfeito na antepara de pressão traseira']],
    numeros: [['524', 'a bordo'], ['520', 'mortos'], ['4', 'sobreviventes'], ['32 min', 'de luta sem comandos']],
    secoes: [
      { t: 'Véspera do Obon', p: ['Segunda-feira, 12 de agosto de 1985. Fazia calor em Tóquio, aquele calor úmido de fim de verão, e o Japão inteiro estava pegando a estrada para o Obon, o feriado em que as famílias voltam às cidades natais para visitar os pais e honrar os antepassados. Trens lotados, estradas paradas, aeroportos cheios.',
        'No saguão de Haneda, a fila do balcão da Japan Air Lines misturava gente de todo tipo: executivos de terno que tinham emendado o trabalho com a folga, mães com crianças pequenas no colo, avós voltando de uma visita aos netos, estudantes carregando sacolas de presentes. No Japão, quem viaja leva sempre uma lembrancinha da cidade de onde vem, o omiyage, e muitas mãos seguravam caixinhas embrulhadas com capricho.',
        'O voo 123 para Osaka era uma das rotas mais curtas e comuns do país, cerca de uma hora no ar. Uma ponte aérea. Para muita gente, mais rápida e mais confortável que o trem-bala naquela véspera de feriado. O avião estava praticamente lotado: 509 passageiros.',
        'Era um Boeing 747SR, a versão de "curto alcance" feita para o Japão, reforçada para decolar e pousar muitas vezes por dia. Aquele, o JA8119, já tinha mais de 18.000 voos. Na cabine, três homens experientes: o primeiro-oficial Yutaka Sasaki, em treinamento para comandante, pilotava do assento da esquerda; ao lado dele, o comandante Masami Takahama, instrutor, com mais de 12.000 horas de voo; atrás, o engenheiro de voo Hiroshi Fukuda.'] },
      { t: 'Rumo ao pôr do sol', p: ['O embarque terminou com algum atraso. As portas se fecharam, os comissários mostraram como usar o cinto e as máscaras de oxigênio, como fazem em todo voo, e muita gente nem prestou atenção. Era só mais uma viagem.',
        'Às 18h12, com 12 minutos de atraso, o 747 acelerou na pista de Haneda e subiu sobre a baía de Tóquio. Lá embaixo, os navios pareciam brinquedos e a cidade começava a acender as primeiras luzes. O avião fez a curva para o oeste, na direção do sol, que já estava baixo no horizonte e pintava as janelas de laranja.',
        'Quem estava do lado direito talvez tenha visto, ao longe, a silhueta do monte Fuji contra o céu do entardecer. Crianças grudavam o rosto nas janelas. Casais conversavam sobre os planos para o feriado. Alguns passageiros já cochilavam, cansados do dia, outros folheavam a revista de bordo. O ronco dos quatro motores era constante e tranquilizador.',
        'Na cabine de comando, a rotina de sempre: recolher o trem de pouso, recolher os flapes, conferir o checklist depois da decolagem, conversar com o controle de Tóquio, pedir para subir mais. Tudo normal. Lá atrás, os comissários se levantaram e começaram a preparar os carrinhos do serviço de bordo. Em menos de uma hora todos estariam em Osaka, a tempo do jantar com a família.'] },
      { t: '18h24: o estrondo', p: ['Doze minutos depois da decolagem, o avião ainda subia, a cerca de 24.000 pés (7.300 m) sobre a baía de Sagami, ao sul de Tóquio. Então, às 18h24, veio um estrondo seco, vindo de trás.',
        'Em um instante a cabine se encheu de uma névoa branca. Não era fumaça: quando a pressão cai de repente, o ar esfria e a umidade vira neblina. Os ouvidos doeram, papéis voaram e as máscaras amarelas de oxigênio caíram do teto. Uma voz gravada começou a repetir, em japonês e em inglês, que era uma emergência.',
        'Lá atrás, a antepara de pressão traseira, a "tampa" em forma de cúpula que fecha a cabine na cauda, tinha se partido. O ar da cabine, mais pressurizado que o ar lá fora, explodiu para dentro da cauda, que não era feita para aguentar aquilo. Em frações de segundo, a maior parte do estabilizador vertical, a grande barbatana da cauda, foi arrancada e caiu no mar.'] },
      { t: 'Na cabine de passageiros', p: ['Os comissários correram pelos corredores ajudando as pessoas a colocar as máscaras, mostrando como apertar o cinto e como se curvar para a frente, a posição de impacto. Muita gente achou que era um susto que ia passar. O avião, afinal, continuava voando.',
        'Mas logo o 747 começou a se mexer de um jeito que ninguém ali tinha sentido: balançava de um lado para o outro e subia e descia em ondas longas, como um barco num mar agitado. Segundo uma das sobreviventes, uma comissária da JAL que viajava de folga, uma parte do teto perto dos banheiros do fundo tinha se aberto.',
        'Um passageiro chegou a fotografar a cabine com as máscaras penduradas e as pessoas sentadas, assustadas mas quietas. As fotos foram encontradas anos depois, no filme da câmera dele, e estão entre as imagens mais impressionantes da história da aviação.'] },
      { t: '"Uncontrollable"', p: ['Na cabine de comando, os alarmes tocavam. Os pilotos primeiro pensaram que uma das portas do fundo tinha se aberto. Acionaram o código 7700 de emergência e pediram ao controle de Tóquio para voltar a Haneda.',
        'Foi então que o engenheiro de voo leu os mostradores e deu a pior notícia possível: a pressão hidráulica estava caindo. Os quatro sistemas hidráulicos do 747, os "músculos" que movem os lemes, os ailerons e os profundores, tinham as linhas passando pela cauda. Todas foram cortadas, e o fluido vazou em poucos minutos.',
        'O comandante girava o manche e nada acontecia. O avião simplesmente não obedecia. Quando o controlador pediu para virarem, a resposta pelo rádio foi uma palavra só: "Uncontrollable". Incontrolável.',
        'Percebendo a situação, o controlador fez algo raro: liberou a tripulação para falar em japonês em vez do inglês padrão da aviação, para que eles não perdessem nenhum segundo traduzindo. Os outros aviões foram afastados da frequência.',
        'A investigação observou depois que os pilotos não colocaram as próprias máscaras de oxigênio. A 24.000 pés, a falta de ar pode ter atrapalhado o raciocínio nos primeiros minutos, justamente os mais críticos.'] },
      { t: 'A montanha-russa: fugoide e dutch roll', p: ['Sem a deriva e sem comandos, o 747 entrou em dois movimentos que normalmente o próprio avião e os pilotos corrigem sem que ninguém perceba.',
        'O primeiro foi a fugoide. Funciona como uma gangorra entre altura e velocidade: o nariz sobe, o avião ganha altura mas perde velocidade; com menos velocidade, as asas sustentam menos e o nariz cai; descendo, ele ganha velocidade, a sustentação volta e o nariz sobe de novo. O ciclo se repete, e cada onda pode levar mais de um minuto. Num avião normal, os profundores amortecem isso. No JAL 123, sem hidráulico, ninguém conseguia parar a gangorra. Por dentro, era como estar num elevador que sobe e despenca sem parar.',
        'O segundo foi o dutch roll: o avião guinava para um lado, inclinava as asas, guinava para o outro, num balanço em forma de "S" deitado. Quem amortece esse movimento é justamente o estabilizador vertical, e ele não existia mais.',
        'Os dois movimentos juntos faziam o avião subir, cair e balançar ao mesmo tempo. Para os passageiros, eram 30 minutos de enjoo, medo e incerteza.'] },
      { t: 'Pilotando com os motores', p: ['Sem nenhum comando, sobrava uma única ferramenta: os quatro motores. A tripulação começou a mexer nas manetes de um jeito que nenhum manual ensinava. Mais potência para o nariz subir, menos potência para descer, mais força de um lado que do outro para tentar virar.',
        'Funcionou, em parte. Era como dirigir um carro sem volante, usando só o acelerador e a diferença de força entre as rodas. Às 18h40, baixaram o trem de pouso pelo sistema alternativo, que solta as rodas pela gravidade. O arrasto das rodas ajudou a amortecer as oscilações e deixou o avião um pouco mais estável.',
        'A base aérea americana de Yokota, a oeste de Tóquio, avisou que estava pronta para recebê-los. Mas fazer um 747 sem comandos acertar uma pista era quase impossível, e o avião foi sendo levado para o noroeste, em direção às montanhas de Gunma.'] },
      { t: 'Os últimos minutos', p: ['O avião perdeu milhares de pés numa descida longa e chegou perto de montanhas mais altas que ele. Com os motores no máximo, a tripulação conseguiu fazê-lo subir de novo. Na gravação da cabine, ouve-se o comandante repetindo para levantar o nariz, a voz cada vez mais tensa.',
        'Em certo momento ele disse: "Isto pode não ter jeito". Mesmo assim, os três não pararam. Ajustavam as manetes, liam os instrumentos e trocavam informações até o último segundo.',
        'Nos minutos finais, o alarme de proximidade do solo começou a gritar "pull up", "pull up". Às 18h56, depois de 32 minutos sem comandos, a ponta da asa direita tocou as árvores de uma crista, o avião virou e bateu no terreno perto do Cume Osutaka, na província de Gunma, a cerca de 100 km de Tóquio. Ele se partiu e pegou fogo.'] },
      { t: 'Bilhetes de despedida', p: ['Durante aquela meia hora, alguns passageiros entenderam o que estava acontecendo e escreveram mensagens para quem ficava. Em agendas, cartões e no verso de envelopes, com a letra tremida pelo balanço do avião.',
        'Um pai escreveu aos filhos pedindo que fossem bons e cuidassem da mãe. Outros só deixaram "obrigado" e "adeus". Os bilhetes foram encontrados nos destroços e entregues às famílias. Até hoje são lembrados no Japão como o retrato mais humano da tragédia.',
        'Entre as 520 vítimas estava Kyu Sakamoto, cantor de "Ue o Muite Arukō", a música conhecida no mundo como "Sukiyaki", que em 1963 chegou ao primeiro lugar nos Estados Unidos.'] },
      { t: 'A noite na montanha', p: ['Cerca de 20 minutos depois da queda, a tripulação de um avião C-130 da Força Aérea americana, da base de Yokota, viu os destroços em chamas na encosta e passou a posição. Um helicóptero americano chegou a ser mandado, mas a ajuda não foi aceita. As equipes japonesas só chegaram ao local na manhã seguinte, mais de 12 horas depois.',
        'Lá encontraram quatro sobreviventes, todas mulheres, entre elas a comissária de folga e uma menina de 12 anos. Elas contaram que, durante a noite, ouviram outras pessoas vivas chamando e gemendo nos destroços, vozes que foram se calando até o amanhecer. Médicos disseram depois que mais gente poderia ter sido salva se o resgate tivesse chegado antes.'] },
      { t: 'Um erro de sete anos antes', p: ['Em 2 de junho de 1978, sete anos antes, o JA8119 bateu a cauda na pista ao pousar em Osaka, e a antepara traseira foi danificada. O conserto foi feito por uma equipe da própria Boeing.',
        'Para unir a parte velha à nova, a emenda deveria usar uma placa de reforço inteira, presa por duas fileiras de rebites. Foi feita com duas placas separadas, e num trecho a junção ficou presa por uma fileira só. A peça passou a ter só cerca de 70% da resistência à fadiga prevista. E, escondido dentro da cauda, o erro não aparecia nas inspeções comuns.',
        'A cada voo a cabine era pressurizada e despressurizada, como um balão que enche e esvazia. Pequenas rachaduras foram crescendo em volta dos rebites, voo após voo, por mais de 12.000 voos. Em 12 de agosto de 1985, a antepara cedeu. A Boeing reconheceu o erro no reparo.'] },
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
  $('#dzToc').innerHTML = a.secoes.map((s, i) => `<li><button type="button" data-cap="${i + 1}"><span>${String(i + 1).padStart(2, '0')}</span>${esc(s.t)}</button></li>`).join('');
  const palavras = a.secoes.reduce((n, s) => n + s.p.join(' ').split(/\s+/).length, 0);
  $('#dzReadInfo').textContent = `${a.secoes.length} capítulos · cerca de ${Math.max(1, Math.round(palavras / 200))} minutos de leitura`;
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


/* ---------- Leitura em tela cheia, como um livro ---------- */
let pag = 0, virando = false;
const paginas = () => atual.secoes.length + 2; // capa + capítulos + fim
function paginaHtml(i) {
  const a = atual, n = a.secoes.length;
  if (i === 0) return `<div class="dzr-cover"><span class="label">Desastres aéreos · ${esc(a.data)}</span><h2 id="dzrTitle">${esc(a.titulo)}</h2><p class="dzr-cover__sub">${esc(a.sub)}</p><p>${esc(a.resumo)}</p><p class="small">Em memória das ${esc(a.numeros[1][0])} pessoas que morreram.</p><p class="dzr-hint">Toque em Próxima ou arraste a página para o lado para começar.</p></div>`;
  if (i === n + 1) return `<div class="dzr-end"><span class="label">Fim do relato</span><h2>${esc(a.titulo)}</h2><p>${esc(a.memoria)}</p><button type="button" class="btn" data-fim>Ver o que falhou e o que mudou</button></div>`;
  const s = a.secoes[i - 1];
  return `<span class="dzr-num">Capítulo ${String(i).padStart(2, '0')}</span><h2>${esc(s.t)}</h2>${s.p.map((p) => `<p>${esc(p)}</p>`).join('')}<span class="dzr-folio">${i}</span>`;
}
function novaPagina(i) {
  const d = document.createElement('article');
  d.className = 'dzr-page' + (i === 0 ? ' is-cover' : '');
  d.innerHTML = `<div class="dzr-page__in">${paginaHtml(i)}</div>`;
  d.querySelector('[data-fim]')?.addEventListener('click', () => fechar(true));
  return d;
}
function atualizarBarra() {
  const n = paginas();
  $('#dzrCount').textContent = pag === 0 ? 'Capa' : pag === n - 1 ? 'Fim' : `Capítulo ${pag} de ${n - 2}`;
  $('#dzrBar').style.width = `${(pag / (n - 1)) * 100}%`;
  $('#dzrPrev').disabled = pag === 0;
  $('#dzrNext').hidden = pag === n - 1;
}
// Virada de página como papel de verdade: a folha dobra numa linha que anda da direita para a lombada.
// Do lado esquerdo da dobra fica a frente da folha; o pedaço que já virou aparece espelhado (o verso),
// com o brilho curvo da "barriga" do papel, e a folha joga sombra na página de baixo.
function montarDobra(st, conteudo, scroll) {
  const W = st.clientWidth, H = st.clientHeight;
  const camada = (cls, html = '') => { const d = document.createElement('div'); d.className = cls; d.style.width = W + 'px'; d.style.height = H + 'px'; d.innerHTML = html; return d; };
  const corpo = `<div class="dzr-page__in dzr-page__in--flat" style="transform:translateY(${-scroll}px)">${conteudo}</div>`;
  const sombra = camada('dzr-fold-cast');
  const frente = camada('dzr-fold-front', corpo + '<i class="dzr-fold-shade"></i>');
  const verso = camada('dzr-fold-back', `<div class="dzr-fold-ghost">${corpo}</div><i class="dzr-fold-shade"></i>`);
  const hl = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--fold-hl')) || .5;
  return { W, H, hl, sombra, frente, verso };
}
function desenharDobra(d, p) {
  const { W, H } = d;
  // linha da dobra: anda de W até 0; inclina um pouco (o canto de baixo vai na frente), como quem vira pela ponta
  const xf = W * (1 - p), incl = W * 0.14 * Math.sin(Math.PI * p);
  const xt = xf + incl, xb = xf - incl;
  const poli = (pts) => `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(',')})`;
  d.frente.style.clipPath = poli([[0, 0], [xt, 0], [xb, H], [0, H]]);
  const direita = poli([[xt, 0], [W + 2, 0], [W + 2, H], [xb, H]]);
  d.sombra.style.clipPath = direita;
  d.verso.style.clipPath = direita;
  // espelha o pedaço da direita sobre a linha da dobra
  const ux0 = xb - xt, uy0 = H, n = Math.hypot(ux0, uy0), ux = ux0 / n, uy = uy0 / n;
  const a = ux * ux - uy * uy, b = 2 * ux * uy, c = b, dd = uy * uy - ux * ux;
  const e = xt - (a * xt + c * 0), f = 0 - (b * xt + dd * 0);
  d.verso.style.transform = `matrix(${a},${b},${c},${dd},${e},${f})`;
  // luz e sombra: o verso tem o brilho da curva junto da dobra e escurece para a ponta;
  // a frente escurece um pouco antes da dobra (o relevo); a página de baixo recebe a sombra
  const fold = ((xt + xb) / 2) / W * 100, larg = Math.max(1, 100 - fold);
  const ang = 90 - Math.atan2(xt - xb, H) * 180 / Math.PI;
  const hl = d.hl;
  d.verso.querySelector('.dzr-fold-shade').style.background = `linear-gradient(${ang}deg, rgba(0,0,0,0) ${fold}%, rgba(255,255,255,${hl}) ${fold + larg * .06}%, rgba(255,255,255,${hl * .22}) ${fold + larg * .3}%, rgba(0,0,0,.10) ${fold + larg * .75}%, rgba(0,0,0,.22) 100%)`;
  d.frente.querySelector('.dzr-fold-shade').style.background = `linear-gradient(${ang}deg, rgba(0,0,0,0) ${Math.max(0, fold - 14)}%, rgba(0,0,0,.10) ${Math.max(0, fold - 4)}%, rgba(0,0,0,.24) ${fold}%, rgba(0,0,0,0) ${fold + .1}%)`;
  const forca = Math.sin(Math.PI * Math.min(1, p * 1.2)) * .5;
  d.sombra.style.background = `linear-gradient(${ang}deg, rgba(0,0,0,0) ${fold}%, rgba(0,0,0,${forca}) ${fold + .2}%, rgba(0,0,0,0) ${fold + 22}%)`;
}
function animarDobra(d, dir, dur, fim) {
  const ease = (k) => k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
  const t0 = performance.now();
  const passo = (now) => {
    const k = Math.min(1, (now - t0) / dur), p = dir > 0 ? ease(k) : 1 - ease(k);
    desenharDobra(d, p);
    if (k < 1) requestAnimationFrame(passo); else fim();
  };
  requestAnimationFrame(passo);
}
function virar(dir) {
  const alvo = pag + dir;
  if (virando || alvo < 0 || alvo >= paginas()) return;
  const st = $('#dzrStage'), velha = st.querySelector('.dzr-page'), nova = novaPagina(alvo);
  const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
  pag = alvo; atualizarBarra();
  if (reduz || !velha) { st.innerHTML = ''; st.appendChild(nova); return; }
  virando = true;
  let d;
  if (dir > 0) {
    // a página atual dobra e vira, revelando a próxima por baixo
    const inn = velha.querySelector('.dzr-page__in');
    d = montarDobra(st, inn.innerHTML, inn.scrollTop);
    st.innerHTML = ''; st.append(nova, d.sombra, d.frente, d.verso);
  } else {
    // a folha anterior volta, desdobrando por cima da página atual
    d = montarDobra(st, nova.querySelector('.dzr-page__in').innerHTML, 0);
    st.append(d.sombra, d.frente, d.verso);
  }
  desenharDobra(d, dir > 0 ? 0 : 1);
  animarDobra(d, dir, 950, () => {
    st.innerHTML = ''; st.appendChild(nova);
    virando = false;
  });
}
function abrir(i = 0) {
  pag = i;
  const r = $('#dzReader'), st = $('#dzrStage');
  st.innerHTML = ''; st.appendChild(novaPagina(pag));
  r.hidden = false; document.documentElement.classList.add('dzr-open');
  atualizarBarra();
  try { history.pushState({ dzr: 1 }, ''); } catch {}
  $('#dzrNext').focus({ preventScroll: true });
}
function fechar(irParaFalha = false, doHistorico = false) {
  const r = $('#dzReader');
  if (r.hidden) return;
  r.hidden = true; document.documentElement.classList.remove('dzr-open');
  if (!doHistorico) { try { if (history.state?.dzr) history.back(); } catch {} }
  const alvo = irParaFalha ? $('#dzFailBox') : $('#dzReadBtn');
  setTimeout(() => alvo?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
}
function initLeitor() {
  $('#dzReadBtn').addEventListener('click', () => abrir(0));
  $('#dzToc').addEventListener('click', (e) => { const b = e.target.closest('[data-cap]'); if (b) abrir(+b.dataset.cap); });
  $('#dzrNext').addEventListener('click', () => virar(1));
  $('#dzrPrev').addEventListener('click', () => virar(-1));
  $('#dzrClose').addEventListener('click', () => fechar());
  window.addEventListener('popstate', () => fechar(false, true));
  document.addEventListener('keydown', (e) => {
    if ($('#dzReader').hidden) return;
    if (e.key === 'ArrowRight') virar(1); else if (e.key === 'ArrowLeft') virar(-1); else if (e.key === 'Escape') fechar();
  });
  let sx = null, sy = null;
  const st = $('#dzrStage');
  st.addEventListener('pointerdown', (e) => { sx = e.clientX; sy = e.clientY; });
  st.addEventListener('pointerup', (e) => { if (sx === null) return; const dx = e.clientX - sx, dy = e.clientY - sy; sx = null; if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) virar(dx < 0 ? 1 : -1); });
}
function init() {
  if (!$('#dzList')) return;
  lista();
  $('#dzList').addEventListener('click', (e) => { const b = e.target.closest('[data-dz]'); if (!b) return; atual = ACIDENTES.find((a) => a.id === b.dataset.dz) || atual; lista(); mostrar(); $('#dzCase').scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  $('#dzLine').addEventListener('click', (e) => { const b = e.target.closest('button[data-i]'); if (b) { clearTimeout(auto); irPara(+b.dataset.i); } });
  $('#dzPlay').addEventListener('click', reproduzir);
  initLeitor();
}
let pronto = false;
function start() { if (!pronto) { pronto = true; mostrar(); } }
window.Desastres = { init, start };
})();
