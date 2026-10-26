/* Rádio: conversas de treino com o Solo, a Torre e o Controle, no solo, em voo e em emergências, no padrão
   da fraseologia do DECEA (em português) e da OACI (em inglês). Aeródromo, frequências e matrícula são fictícios. */
(() => {
'use strict';
const $ = (s) => document.querySelector(s);
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- As conversas ----------
   atc: fala do controle. pil: fala do piloto; com "op" vira escolha (a primeira opção é a certa, a ordem é sorteada).
   luz: sinal luminoso da torre (falha de rádio). nota: o que acontece entre uma fala e outra. */
const SOLO = 'SOLO 121.9', TWR = 'TORRE 118.1', APP = 'CONTROLE 119.5';
const GRUPOS = [['solo', 'No solo'], ['voo', 'Em voo'], ['emg', 'Emergências']];
const CONVERSAS = [
  /* ---------------- No solo ---------------- */
  { id: 'partida', grupo: 'solo', titulo: 'Partida e táxi', desc: 'Pedir o acionamento do motor e o táxi até a pista.',
    inicio: 'Você está no Cessna 172 PR-HGE, no hangar 3, com o checklist antes da partida feito e o rádio no Solo em 121.9.',
    fases: ['Acionamento', 'Táxi'],
    passos: [
      { quem: 'pil', fase: 0, freq: SOLO, op: [
        { pt: 'Solo Hangar, PR-HGE, Cessna 172 no hangar 3, voo local visual, solicita acionamento.', en: 'Hangar Ground, PR-HGE, Cessna 172 at hangar 3, local VFR flight, request start up.',
          por: 'Chamada inicial completa: estação chamada, indicativo, tipo de avião, onde você está e o pedido.' },
        { pt: 'Solo, PR-HGE, vou ligar o motor.', en: 'Ground, PR-HGE, starting the engine.',
          por: 'Você avisa em vez de pedir, e faltou dizer onde está. No aeródromo controlado, o acionamento é solicitado.' },
        { pt: 'Bom dia, Solo! Tudo bem? Aqui é o PR-HGE.', en: 'Good morning, Ground! How are you? This is PR-HGE.',
          por: 'Cumprimento não substitui a mensagem. Diga logo quem é, onde está e o que quer: o rádio é dividido com todos.' },
      ] },
      { quem: 'atc', fase: 0, freq: SOLO, pt: 'PR-HGE, Solo Hangar, autorizado acionamento, ajuste 1017.', en: 'PR-HGE, Hangar Ground, start up approved, QNH 1017.' },
      { quem: 'pil', fase: 0, freq: SOLO, op: [
        { pt: 'Autorizado acionamento, ajuste 1017, PR-HGE.', en: 'Start up approved, QNH 1017, PR-HGE.',
          por: 'Certo: a autorização e o ajuste do altímetro voltam, com o indicativo no fim.' },
        { pt: 'Ciente, PR-HGE.', en: 'Roger, PR-HGE.',
          por: 'Faltou o ajuste do altímetro. Ele sempre se repete, para garantir que o número foi entendido.' },
        { pt: 'Ajuste 1070, PR-HGE.', en: 'QNH 1070, PR-HGE.',
          por: 'Número errado: é 1017. Um ajuste de altímetro errado põe o avião em outra altitude.' },
      ] },
      { nota: 'Motor ligado, checklist depois da partida feito.' },
      { quem: 'pil', fase: 1, freq: SOLO, op: [
        { pt: 'Solo Hangar, PR-HGE, acionado, solicita táxi.', en: 'Hangar Ground, PR-HGE, request taxi.',
          por: 'Curto e completo: o Solo já sabe onde você está, então basta pedir o táxi.' },
        { pt: 'Solo Hangar, PR-HGE, taxiando para a pista.', en: 'Hangar Ground, PR-HGE, taxiing to the runway.',
          por: 'Nunca comece a taxiar sem autorização. Você pede e espera a instrução.' },
        { pt: 'Solo Hangar, PR-HGE, motor ligado, aguardo.', en: 'Hangar Ground, PR-HGE, engine running, standing by.',
          por: 'Faltou o pedido. O Solo não sabe que você quer taxiar.' },
      ] },
      { quem: 'atc', fase: 1, freq: SOLO, pt: 'PR-HGE, táxi para o ponto de espera da pista 27 via Alfa, transponder 4521.', en: 'PR-HGE, taxi to holding point runway 27 via Alpha, squawk 4521.' },
      { quem: 'pil', fase: 1, freq: SOLO, op: [
        { pt: 'Táxi para o ponto de espera da pista 27 via Alfa, transponder 4521, PR-HGE.', en: 'Taxi to holding point runway 27 via Alpha, squawk 4521, PR-HGE.',
          por: 'Rota de táxi, pista e código do transponder: tudo cotejado.' },
        { pt: 'Táxi via Alfa, PR-HGE.', en: 'Taxi via Alpha, PR-HGE.',
          por: 'Faltaram a pista (27) e o código do transponder (4521).' },
        { pt: 'Ciente, taxiando, PR-HGE.', en: 'Roger, taxiing, PR-HGE.',
          por: '"Ciente" não serve para instrução de táxi: a rota e o limite (o ponto de espera da pista 27) precisam voltar.' },
      ] },
    ] },

  { id: 'cruzar', grupo: 'solo', titulo: 'Cruzar uma pista', desc: 'Aguardar antes de uma pista no caminho e cruzar só com autorização.',
    inicio: 'O caminho até a pista 27 cruza a pista 18. Você está taxiando pela Alfa, no Solo em 121.9.',
    fases: ['Táxi', 'Cruzamento'],
    passos: [
      { quem: 'atc', fase: 0, freq: SOLO, pt: 'PR-HGE, prossiga pela Alfa e aguarde antes da pista 18.', en: 'PR-HGE, continue via Alpha, hold short of runway 18.' },
      { quem: 'pil', fase: 0, freq: SOLO, op: [
        { pt: 'Prosseguindo pela Alfa, aguardo antes da pista 18, PR-HGE.', en: 'Continuing via Alpha, holding short of runway 18, PR-HGE.',
          por: 'Toda instrução de aguardar antes de uma pista é cotejada com a pista. É a principal barreira contra a incursão em pista.' },
        { pt: 'Prosseguindo pela Alfa, PR-HGE.', en: 'Continuing via Alpha, PR-HGE.',
          por: 'Faltou o mais importante: "aguardo antes da pista 18". Se você não repete, o controle não sabe se entendeu.' },
        { pt: 'Ciente, PR-HGE.', en: 'Roger, PR-HGE.',
          por: 'Aguardar antes de uma pista nunca se responde só com "ciente".' },
      ] },
      { nota: 'Você para na faixa amarela antes da pista 18. Um avião pousa na 18 bem na sua frente.' },
      { quem: 'atc', fase: 1, freq: SOLO, pt: 'PR-HGE, cruze a pista 18, prossiga para o ponto de espera da pista 27.', en: 'PR-HGE, cross runway 18, continue to holding point runway 27.' },
      { quem: 'pil', fase: 1, freq: SOLO, op: [
        { pt: 'Cruzando a pista 18, prosseguindo para o ponto de espera da pista 27, PR-HGE.', en: 'Crossing runway 18, continuing to holding point runway 27, PR-HGE.',
          por: 'Autorização para cruzar se coteja sempre com o número da pista.' },
        { pt: 'Cruzando, PR-HGE.', en: 'Crossing, PR-HGE.',
          por: 'Cruzando qual pista? Num aeródromo com várias pistas, o número evita cruzar a errada.' },
        { pt: 'Já cruzei a pista 18, PR-HGE.', en: 'Already crossed runway 18, PR-HGE.',
          por: 'Você não pode cruzar antes da autorização. Primeiro ouve, coteja e só então cruza.' },
      ] },
      { quem: 'pil', fase: 1, freq: SOLO, op: [
        { pt: 'Solo Hangar, PR-HGE, pista 18 livre.', en: 'Hangar Ground, PR-HGE, runway 18 vacated.',
          por: 'Avisar que livrou a pista deixa o controle liberar o próximo pouso ou decolagem com segurança.' },
        { pt: 'Solo Hangar, PR-HGE, na pista 18.', en: 'Hangar Ground, PR-HGE, on runway 18.',
          por: 'Você já cruzou. Dizer que ainda está na pista seguraria todos os pousos à toa.' },
        { pt: 'Solo Hangar, PR-HGE, e agora?', en: 'Hangar Ground, PR-HGE, what now?',
          por: 'Você já tem a instrução: seguir para o ponto de espera da pista 27. Reporte a posição.' },
      ] },
    ] },

  /* ---------------- Em voo ---------------- */
  { id: 'circuito', grupo: 'voo', titulo: 'Voo completo no circuito', desc: 'Do hangar ao pouso: táxi, decolagem, circuito de tráfego e pouso.',
    inicio: 'Você está no Cessna 172 PR-HGE, no hangar 3, com o motor ligado e o rádio no Solo em 121.9. Chame o Solo para pedir o táxi.',
    fases: ['Táxi', 'Decolagem', 'Circuito', 'Pouso'],
    passos: [
      { quem: 'pil', fase: 0, freq: SOLO, op: [
        { pt: 'Solo Hangar, PR-HGE, Cessna 172 no hangar 3, voo local visual, solicita instruções para táxi.', en: 'Hangar Ground, PR-HGE, Cessna 172 at hangar 3, local VFR flight, request taxi.',
          por: 'Chamada inicial completa: a estação que você chama, o seu indicativo, onde você está e o que quer.' },
        { pt: 'Oi, Solo, aqui é o PR-HGE. Já posso ir para a pista?', en: 'Hi Ground, this is PR-HGE. Can I go to the runway now?',
          por: 'No rádio não se conversa de forma informal. A chamada segue a ordem: estação chamada, indicativo, posição e pedido.' },
        { pt: 'PR-HGE solicita táxi.', en: 'PR-HGE, request taxi.',
          por: 'Faltou chamar a estação (Solo Hangar) e dizer onde você está. Sem a posição, o Solo não sabe por onde mandar você.' },
      ] },
      { quem: 'atc', fase: 0, freq: SOLO, pt: 'PR-HGE, Solo Hangar, pista 27, vento 260 graus, 8 nós, ajuste 1017, táxi para o ponto de espera da pista 27 via Alfa, transponder 4521.',
        en: 'PR-HGE, Hangar Ground, runway 27, wind 260 degrees 8 knots, QNH 1017, taxi to holding point runway 27 via Alpha, squawk 4521.' },
      { quem: 'pil', fase: 0, freq: SOLO, op: [
        { pt: 'Pista 27, ajuste 1017, táxi para o ponto de espera da pista 27 via Alfa, transponder 4521, PR-HGE.', en: 'Runway 27, QNH 1017, taxi to holding point runway 27 via Alpha, squawk 4521, PR-HGE.',
          por: 'Cotejamento certo: pista, ajuste do altímetro, rota de táxi e código do transponder voltam para o Solo. O vento não precisa ser repetido.' },
        { pt: 'Ciente, PR-HGE.', en: 'Roger, PR-HGE.',
          por: '"Ciente" não basta. Instrução de táxi, pista, ajuste do altímetro e código do transponder sempre têm de ser cotejados, ou seja, repetidos.' },
        { pt: 'Pista 27, táxi via Alfa, PR-HGE.', en: 'Runway 27, taxi via Alpha, PR-HGE.',
          por: 'Faltaram o ajuste do altímetro (1017) e o código do transponder (4521). Os dois sempre se repetem.' },
      ] },
      { quem: 'atc', fase: 0, freq: SOLO, pt: 'PR-HGE, chame a Torre Hangar em 118.1.', en: 'PR-HGE, contact Hangar Tower 118.1.' },
      { quem: 'pil', fase: 0, freq: SOLO, pt: 'Torre 118.1, PR-HGE.', en: 'Tower 118.1, PR-HGE.' },
      { quem: 'pil', fase: 1, freq: TWR, op: [
        { pt: 'Torre Hangar, PR-HGE, no ponto de espera da pista 27, pronto para decolagem.', en: 'Hangar Tower, PR-HGE, holding point runway 27, ready for departure.',
          por: 'Você diz onde está e que está pronto. Quem decide a hora de entrar na pista é a Torre.' },
        { pt: 'Torre Hangar, PR-HGE, entrando na pista 27 para decolar.', en: 'Hangar Tower, PR-HGE, entering runway 27 for takeoff.',
          por: 'Nunca entre na pista sem autorização. Entrar por conta própria é incursão em pista, uma das maiores causas de acidente no solo.' },
        { pt: 'Torre Hangar, PR-HGE, pronto.', en: 'Hangar Tower, PR-HGE, ready.',
          por: 'Pronto onde? Faltou a posição: no ponto de espera da pista 27.' },
      ] },
      { quem: 'atc', fase: 1, freq: TWR, pt: 'PR-HGE, pista 27, vento 250 graus, 7 nós, autorizado decolar.', en: 'PR-HGE, runway 27, wind 250 degrees 7 knots, cleared for takeoff.' },
      { quem: 'pil', fase: 1, freq: TWR, op: [
        { pt: 'Autorizado decolar pista 27, PR-HGE.', en: 'Cleared for takeoff runway 27, PR-HGE.',
          por: 'Autorização de decolagem se coteja sempre junto com a pista. Assim ninguém decola da pista errada.' },
        { pt: 'Decolando, PR-HGE.', en: 'Taking off, PR-HGE.',
          por: 'Faltaram a autorização e a pista. Repetir a pista é a última barreira contra decolar da pista errada.' },
        { pt: 'Ciente, PR-HGE.', en: 'Roger, PR-HGE.',
          por: 'Autorização para entrar, decolar ou pousar numa pista nunca se responde só com "ciente": repita a autorização e a pista.' },
      ] },
      { quem: 'pil', fase: 2, freq: TWR, op: [
        { pt: 'Torre Hangar, PR-HGE, perna do vento, pista 27.', en: 'Hangar Tower, PR-HGE, downwind runway 27.',
          por: 'Reporte de posição no circuito: indicativo, a perna em que você está e a pista.' },
        { pt: 'Torre Hangar, PR-HGE, voando paralelo à pista.', en: 'Hangar Tower, PR-HGE, flying parallel to the runway.',
          por: 'Use o nome da perna: perna do vento. Assim a Torre e os outros aviões do circuito sabem exatamente onde você está.' },
        { pt: 'Torre Hangar, PR-HGE, na final, pista 27.', en: 'Hangar Tower, PR-HGE, final runway 27.',
          por: 'Posição errada: você está na perna do vento. Ainda faltam a perna base e a final.' },
      ] },
      { quem: 'atc', fase: 2, freq: TWR, pt: 'PR-HGE, reporte na perna base.', en: 'PR-HGE, report base.' },
      { quem: 'pil', fase: 2, freq: TWR, pt: 'Ciente, PR-HGE.', en: 'Wilco, PR-HGE.' },
      { quem: 'pil', fase: 2, freq: TWR, op: [
        { pt: 'PR-HGE, perna base, pista 27.', en: 'PR-HGE, base runway 27.',
          por: 'Reporte certo. Na perna base a Torre confere a sequência e libera o pouso.' },
        { pt: 'PR-HGE, curvando.', en: 'PR-HGE, turning.',
          por: 'Curvando para onde? Diga a posição: perna base, pista 27.' },
        { pt: 'PR-HGE, perna base. Posso pousar?', en: 'PR-HGE, base. Can I land?',
          por: 'Não se pede pouso em forma de pergunta. Reporte a posição; a autorização de pouso vem da Torre.' },
      ] },
      { quem: 'atc', fase: 3, freq: TWR, pt: 'PR-HGE, pista 27, vento 260 graus, 8 nós, autorizado pouso.', en: 'PR-HGE, runway 27, wind 260 degrees 8 knots, cleared to land.' },
      { quem: 'pil', fase: 3, freq: TWR, op: [
        { pt: 'Autorizado pouso pista 27, PR-HGE.', en: 'Cleared to land runway 27, PR-HGE.', por: 'Igual à decolagem: repita a autorização e a pista.' },
        { pt: 'Pousando, PR-HGE.', en: 'Landing, PR-HGE.', por: 'Faltaram a autorização e a pista.' },
        { pt: 'Pista 27, PR-HGE.', en: 'Runway 27, PR-HGE.', por: 'Faltou mostrar que você entendeu a autorização: "autorizado pouso".' },
      ] },
      { quem: 'atc', fase: 3, freq: TWR, pt: 'PR-HGE, livre a pista pela próxima à direita e chame o Solo em 121.9.', en: 'PR-HGE, vacate right at the next taxiway, contact Ground 121.9.' },
      { quem: 'pil', fase: 3, freq: TWR, op: [
        { pt: 'Livrando à direita, Solo 121.9, PR-HGE.', en: 'Vacating right, Ground 121.9, PR-HGE.',
          por: 'Troca de frequência sempre se coteja com o número. Assim você não se perde no rádio.' },
        { pt: 'Ciente, PR-HGE.', en: 'Roger, PR-HGE.',
          por: 'Faltou repetir a frequência nova. Se você errar a frequência, ninguém mais escuta você.' },
        { pt: 'Livrando à direita, Solo 112.9, PR-HGE.', en: 'Vacating right, Ground 112.9, PR-HGE.',
          por: 'A frequência foi repetida errada: é 121.9, não 112.9. O cotejamento existe para pegar esse tipo de erro.' },
      ] },
    ] },

  { id: 'chegada', grupo: 'voo', titulo: 'Chegada e toque e arremetida', desc: 'Chamar a Torre de fora, entrar no circuito, seguir outro avião e treinar pouso.',
    inicio: 'Você volta de um voo de navegação: 10 milhas ao norte do aeródromo, a 3.500 pés, já na frequência da Torre.',
    fases: ['Chamada', 'Circuito', 'Final'],
    passos: [
      { quem: 'pil', fase: 0, freq: TWR, op: [
        { pt: 'Torre Hangar, PR-HGE, 10 milhas ao norte, 3.500 pés, para pouso.', en: 'Hangar Tower, PR-HGE, 10 miles north, 3,500 feet, for landing.',
          por: 'Chegada completa: onde você está, a altitude e a intenção.' },
        { pt: 'Torre Hangar, PR-HGE, chegando.', en: 'Hangar Tower, PR-HGE, inbound.',
          por: 'Chegando de onde e a que altitude? Sem posição a Torre não consegue encaixar você no tráfego.' },
        { pt: 'Torre Hangar, PR-HGE, sobre a cidade, quero pousar.', en: 'Hangar Tower, PR-HGE, over the city, want to land.',
          por: 'Posição vaga e sem altitude. Use distância e direção do aeródromo, ou um ponto de notificação conhecido.' },
      ] },
      { quem: 'atc', fase: 0, freq: TWR, pt: 'PR-HGE, Torre Hangar, pista 27, vento 260 graus, 8 nós, ajuste 1017, ingresse na perna do vento da pista 27.',
        en: 'PR-HGE, Hangar Tower, runway 27, wind 260 degrees 8 knots, QNH 1017, join downwind runway 27.' },
      { quem: 'pil', fase: 0, freq: TWR, op: [
        { pt: 'Pista 27, ajuste 1017, ingressando na perna do vento, PR-HGE.', en: 'Runway 27, QNH 1017, joining downwind, PR-HGE.',
          por: 'Pista, ajuste do altímetro e a instrução de ingresso voltam. O vento não.' },
        { pt: 'Vento 260 graus, 8 nós, PR-HGE.', en: 'Wind 260 degrees 8 knots, PR-HGE.',
          por: 'Você repetiu justo o que não precisava e deixou de fora a pista, o ajuste e a instrução.' },
        { pt: 'Ingressando, PR-HGE.', en: 'Joining, PR-HGE.',
          por: 'Faltaram a pista e o ajuste do altímetro.' },
      ] },
      { quem: 'pil', fase: 1, freq: TWR, op: [
        { pt: 'Torre Hangar, PR-HGE, perna do vento, pista 27, solicita toque e arremetida.', en: 'Hangar Tower, PR-HGE, downwind runway 27, request touch and go.',
          por: 'Posição mais o pedido: a Torre sabe que você vai tocar e decolar de novo.' },
        { pt: 'Torre Hangar, PR-HGE, perna do vento, pista 27.', en: 'Hangar Tower, PR-HGE, downwind runway 27.',
          por: 'O reporte está certo, mas você quer treinar toque e arremetida: é preciso pedir.' },
        { pt: 'Torre Hangar, PR-HGE, vou só encostar na pista.', en: 'Hangar Tower, PR-HGE, will just touch the runway.',
          por: 'Use o termo padrão: "toque e arremetida".' },
      ] },
      { quem: 'atc', fase: 1, freq: TWR, pt: 'PR-HGE, número 2, siga o Cessna na perna base.', en: 'PR-HGE, number 2, follow the Cessna on base.' },
      { quem: 'pil', fase: 1, freq: TWR, op: [
        { pt: 'Número 2, Cessna à vista, PR-HGE.', en: 'Number 2, Cessna in sight, PR-HGE.',
          por: 'Você confirma a sequência e que está vendo o avião da frente.' },
        { pt: 'Número 2, PR-HGE.', en: 'Number 2, PR-HGE.',
          por: 'Faltou dizer se você vê o Cessna. Se não estiver vendo, diga "procurando o tráfego".' },
        { pt: 'Número 1, PR-HGE.', en: 'Number 1, PR-HGE.',
          por: 'Você é o número 2. Achar que é o primeiro faz você fechar a curva em cima do outro avião.' },
      ] },
      { quem: 'atc', fase: 2, freq: TWR, pt: 'PR-HGE, pista 27, vento 260 graus, 8 nós, autorizado toque e arremetida.', en: 'PR-HGE, runway 27, wind 260 degrees 8 knots, cleared touch and go.' },
      { quem: 'pil', fase: 2, freq: TWR, op: [
        { pt: 'Autorizado toque e arremetida pista 27, PR-HGE.', en: 'Cleared touch and go runway 27, PR-HGE.',
          por: 'A autorização e a pista voltam, como em todo pouso.' },
        { pt: 'Autorizado pouso, PR-HGE.', en: 'Cleared to land, PR-HGE.',
          por: 'Não foi isso que a Torre disse: a autorização é para toque e arremetida, na pista 27.' },
        { pt: 'Ciente, PR-HGE.', en: 'Roger, PR-HGE.',
          por: 'Autorização de pista nunca se responde só com "ciente".' },
      ] },
    ] },

  { id: 'arremetida', grupo: 'voo', titulo: 'Arremetida', desc: 'A Torre manda arremeter porque a pista não está livre.',
    inicio: 'Você está na final curta da pista 27, já autorizado a pousar. Um avião que acabou de pousar ainda não saiu da pista.',
    fases: ['Final', 'Arremetida', 'Novo circuito'],
    passos: [
      { quem: 'atc', fase: 0, freq: TWR, pt: 'PR-HGE, arremeta, aeronave na pista.', en: 'PR-HGE, go around, aircraft on the runway.' },
      { quem: 'pil', fase: 1, freq: TWR, op: [
        { pt: 'Arremetendo, PR-HGE.', en: 'Going around, PR-HGE.',
          por: 'Arremeta na hora e confirme curto. Potência máxima, atitude de subida e flape aos poucos.' },
        { pt: 'Torre, já estou quase no chão, posso pousar?', en: 'Tower, I am almost on the ground, can I land?',
          por: 'Ordem de arremeter não se discute: há um avião na pista. Arremeta e pergunte depois, se precisar.' },
        { pt: 'Ciente, PR-HGE.', en: 'Roger, PR-HGE.',
          por: 'Diga o que está fazendo: "arremetendo". "Ciente" não mostra que você vai arremeter.' },
      ] },
      { quem: 'atc', fase: 1, freq: TWR, pt: 'PR-HGE, suba em frente para 1.500 pés e reingresse na perna do vento da pista 27.', en: 'PR-HGE, climb straight ahead to 1,500 feet, rejoin downwind runway 27.' },
      { quem: 'pil', fase: 1, freq: TWR, op: [
        { pt: 'Em frente para 1.500 pés, reingressando na perna do vento da pista 27, PR-HGE.', en: 'Straight ahead to 1,500 feet, rejoining downwind runway 27, PR-HGE.',
          por: 'Altitude e trajetória sempre se cotejam.' },
        { pt: 'Subindo, PR-HGE.', en: 'Climbing, PR-HGE.',
          por: 'Subindo para quanto e para onde? Faltaram a altitude (1.500 pés) e a perna do vento.' },
        { pt: 'Em frente para 5.000 pés, PR-HGE.', en: 'Straight ahead to 5,000 feet, PR-HGE.',
          por: 'Altitude errada: é 1.500 pés. É para pegar esse erro que existe o cotejamento.' },
      ] },
      { quem: 'pil', fase: 2, freq: TWR, op: [
        { pt: 'Torre Hangar, PR-HGE, perna do vento, pista 27.', en: 'Hangar Tower, PR-HGE, downwind runway 27.',
          por: 'De volta ao circuito, reporte a posição como sempre.' },
        { pt: 'Torre Hangar, PR-HGE, e agora, pouso onde?', en: 'Hangar Tower, PR-HGE, where do I land now?',
          por: 'Você já sabe a pista. Reporte a posição e aguarde a autorização.' },
        { pt: 'Torre Hangar, PR-HGE, pousando na pista 27.', en: 'Hangar Tower, PR-HGE, landing runway 27.',
          por: 'A autorização de pouso anterior acabou com a arremetida. Precisa de uma nova.' },
      ] },
      { quem: 'atc', fase: 2, freq: TWR, pt: 'PR-HGE, número 1, reporte na perna base.', en: 'PR-HGE, number 1, report base.' },
    ] },

  { id: 'desvio', grupo: 'voo', titulo: 'Desvio de mau tempo', desc: 'Pedir ao Controle para sair da rota e contornar uma área de chuva forte.',
    inicio: 'Em rota a 5.500 pés, no Controle em 119.5. O radar mostra uma célula vermelha bem na sua rota, 15 milhas à frente.',
    fases: ['Pedido', 'Desvio', 'Retorno'],
    passos: [
      { quem: 'pil', fase: 0, freq: APP, op: [
        { pt: 'Controle Hangar, PR-HGE, solicita desvio de 10 milhas à direita da rota devido a mau tempo.', en: 'Hangar Control, PR-HGE, request deviation 10 miles right of track due to weather.',
          por: 'Diga para que lado, quanto e por quê. O controle precisa disso para separar você dos outros.' },
        { pt: 'Controle Hangar, PR-HGE, desviando de uma nuvem.', en: 'Hangar Control, PR-HGE, deviating around a cloud.',
          por: 'Em espaço controlado você pede antes de sair da rota, e diz para que lado e quanto.' },
        { pt: 'Controle Hangar, PR-HGE, vou atravessar a chuva para não atrasar.', en: 'Hangar Control, PR-HGE, will fly through the rain to save time.',
          por: 'Nunca entre num eco vermelho. A regra é desviar pelo menos 20 milhas de células fortes.' },
      ] },
      { quem: 'atc', fase: 1, freq: APP, pt: 'PR-HGE, desvio de até 10 milhas à direita da rota autorizado, reporte de volta na rota.', en: 'PR-HGE, deviation up to 10 miles right of track approved, report back on track.' },
      { quem: 'pil', fase: 1, freq: APP, op: [
        { pt: 'Desvio de até 10 milhas à direita autorizado, reportarei de volta na rota, PR-HGE.', en: 'Deviation up to 10 miles right approved, will report back on track, PR-HGE.',
          por: 'O limite do desvio e o lado voltam, além do que você vai reportar.' },
        { pt: 'Desviando, PR-HGE.', en: 'Deviating, PR-HGE.',
          por: 'Faltaram o lado e o limite: até 10 milhas à direita.' },
        { pt: 'Desvio de 10 milhas à esquerda, PR-HGE.', en: '10 miles left, PR-HGE.',
          por: 'Lado errado: o desvio autorizado é à direita.' },
      ] },
      { nota: 'Vinte minutos depois a célula ficou para trás e você volta para a rota.' },
      { quem: 'pil', fase: 2, freq: APP, op: [
        { pt: 'Controle Hangar, PR-HGE, de volta na rota.', en: 'Hangar Control, PR-HGE, back on track.',
          por: 'Você cumpre o que prometeu: reporta de volta na rota.' },
        { pt: 'Controle Hangar, PR-HGE, tudo certo por aqui.', en: 'Hangar Control, PR-HGE, all good here.',
          por: 'Informal e sem a informação que o controle pediu: diga "de volta na rota".' },
        { pt: '(Não fala nada: o controle vê no radar.)', en: '(Say nothing: Control can see it on radar.)',
          por: 'O controle pediu o reporte. Tudo que é pedido precisa ser reportado.' },
      ] },
    ] },

  /* ---------------- Emergências ---------------- */
  { id: 'mayday', grupo: 'emg', titulo: 'Falha de motor (MAYDAY)', desc: 'O motor para em voo. Declarar emergência e planar até a pista.',
    inicio: 'Você está 5 milhas ao norte, a 2.500 pés, quando o motor para. Você já voou o avião primeiro: velocidade de melhor planeio, checklist de falha de motor. O aeródromo está ao alcance. Agora é a vez do rádio.',
    fases: ['Declarar', 'Instruções', 'Pouso'],
    passos: [
      { quem: 'pil', fase: 0, freq: TWR, op: [
        { pt: 'MAYDAY, MAYDAY, MAYDAY, Torre Hangar, PR-HGE, falha de motor, 5 milhas ao norte, 2.500 pés, planando para pouso na pista 27, 2 pessoas a bordo.',
          en: 'MAYDAY, MAYDAY, MAYDAY, Hangar Tower, PR-HGE, engine failure, 5 miles north, 2,500 feet, gliding to land runway 27, 2 persons on board.',
          por: 'Mensagem completa: MAYDAY três vezes, estação, indicativo, o problema, posição, altitude, intenção e pessoas a bordo.' },
        { pt: 'Torre, socorro, o motor parou!', en: 'Tower, help, the engine stopped!',
          por: 'Sem MAYDAY, sem indicativo e sem posição. O controle não sabe quem é nem onde você está.' },
        { pt: 'PAN PAN, PAN PAN, PAN PAN, Torre Hangar, PR-HGE, falha de motor, 5 milhas ao norte, 2.500 pés.', en: 'PAN PAN, PAN PAN, PAN PAN, Hangar Tower, PR-HGE, engine failure, 5 miles north, 2,500 feet.',
          por: 'Motor parado num monomotor é perigo grave e iminente: é MAYDAY, não PAN PAN.' },
      ] },
      { quem: 'atc', fase: 1, freq: TWR, pt: 'PR-HGE, Torre Hangar, ciente MAYDAY. Pista 27 livre, vento 260 graus, 8 nós, autorizado pouso. Transponder 7700.',
        en: 'PR-HGE, Hangar Tower, roger MAYDAY. Runway 27 clear, wind 260 degrees 8 knots, cleared to land. Squawk 7700.' },
      { quem: 'pil', fase: 1, freq: TWR, op: [
        { pt: 'Autorizado pouso pista 27, transponder 7700, PR-HGE.', en: 'Cleared to land runway 27, squawk 7700, PR-HGE.',
          por: 'Mesmo na emergência, a autorização, a pista e o código voltam. Curto: o resto da atenção é para voar.' },
        { pt: 'Ciente, PR-HGE.', en: 'Roger, PR-HGE.',
          por: 'Faltaram a autorização de pouso, a pista e o código 7700.' },
        { pt: 'Transponder 7500, PR-HGE.', en: 'Squawk 7500, PR-HGE.',
          por: 'Código errado e grave: 7500 é interferência ilícita (sequestro). Emergência é 7700.' },
      ] },
      { nota: 'A Torre pede silêncio a todas as outras aeronaves e aciona o serviço de salvamento.' },
      { quem: 'atc', fase: 2, freq: TWR, pt: 'Todas as estações, Torre Hangar, silêncio na frequência, emergência em andamento.', en: 'All stations, Hangar Tower, stop transmitting, MAYDAY.' },
      { nota: 'Você pousa planando na pista 27 e para o avião. Os bombeiros já estão ao lado da pista.' },
      { quem: 'pil', fase: 2, freq: TWR, op: [
        { pt: 'Torre Hangar, PR-HGE, pousado, 2 pessoas a bordo sem ferimentos, avião parado na pista 27.', en: 'Hangar Tower, PR-HGE, landed, 2 persons on board, no injuries, stopped on runway 27.',
          por: 'Informe que pousou, como estão as pessoas e onde o avião ficou. A pista está bloqueada até ele ser retirado.' },
        { pt: 'Torre Hangar, PR-HGE, deu tudo certo, obrigado!', en: 'Hangar Tower, PR-HGE, all fine, thanks!',
          por: 'Faltaram as informações que o controle e os bombeiros precisam: pessoas a bordo e onde o avião está.' },
        { pt: '(Desliga tudo e sai sem avisar.)', en: '(Shut down and leave without a word.)',
          por: 'A Torre precisa saber que vocês estão bem e onde o avião ficou antes de liberar a pista.' },
      ] },
    ] },

  { id: 'panpan', grupo: 'emg', titulo: 'Passageiro passando mal (PAN PAN)', desc: 'Urgência sem perigo imediato para o avião: pedir prioridade para pousar.',
    inicio: 'Voo local a 3.000 pés, 8 milhas ao sul. O passageiro ao seu lado sente forte dor no peito. O avião está perfeito.',
    fases: ['Declarar', 'Prioridade'],
    passos: [
      { quem: 'pil', fase: 0, freq: TWR, op: [
        { pt: 'PAN PAN, PAN PAN, PAN PAN, Torre Hangar, PR-HGE, passageiro passando mal, 8 milhas ao sul, 3.000 pés, solicita prioridade para pouso e ambulância.',
          en: 'PAN PAN, PAN PAN, PAN PAN, Hangar Tower, PR-HGE, sick passenger, 8 miles south, 3,000 feet, request priority landing and ambulance.',
          por: 'É urgência: alguém precisa de ajuda, mas o avião voa bem. PAN PAN três vezes e o pedido claro.' },
        { pt: 'MAYDAY, MAYDAY, MAYDAY, Torre Hangar, PR-HGE, passageiro passando mal.', en: 'MAYDAY, MAYDAY, MAYDAY, Hangar Tower, PR-HGE, sick passenger.',
          por: 'O avião não corre perigo imediato, então o nível certo é urgência (PAN PAN). E faltaram posição, altitude e pedido.' },
        { pt: 'Torre Hangar, PR-HGE, posso pousar logo? Meu amigo não está bem.', en: 'Hangar Tower, PR-HGE, can I land soon? My friend is not well.',
          por: 'Sem PAN PAN o controle pode não dar prioridade. Declare a urgência.' },
      ] },
      { quem: 'atc', fase: 1, freq: TWR, pt: 'PR-HGE, Torre Hangar, ciente PAN PAN. Prossiga direto para a final da pista 27, número 1. Ambulância acionada.',
        en: 'PR-HGE, Hangar Tower, roger PAN PAN. Proceed direct to final runway 27, number 1. Ambulance on its way.' },
      { quem: 'pil', fase: 1, freq: TWR, op: [
        { pt: 'Direto para a final da pista 27, número 1, PR-HGE.', en: 'Direct to final runway 27, number 1, PR-HGE.',
          por: 'A instrução, a pista e a sequência voltam.' },
        { pt: 'Obrigado, Torre!', en: 'Thank you, Tower!',
          por: 'Agradecer não confirma a instrução. Repita o que foi pedido e o indicativo.' },
        { pt: 'Direto para a pista 09, PR-HGE.', en: 'Direct to runway 09, PR-HGE.',
          por: 'Pista errada: é a 27. Na pressa da urgência é quando mais se erra, por isso o cotejamento.' },
      ] },
      { quem: 'atc', fase: 1, freq: TWR, pt: 'PR-HGE, pista 27, vento 260 graus, 8 nós, autorizado pouso.', en: 'PR-HGE, runway 27, wind 260 degrees 8 knots, cleared to land.' },
      { quem: 'pil', fase: 1, freq: TWR, pt: 'Autorizado pouso pista 27, PR-HGE.', en: 'Cleared to land runway 27, PR-HGE.' },
    ] },

  { id: 'semradio', grupo: 'emg', titulo: 'Rádio mudo: sinais luminosos', desc: 'O rádio parou. Código 7600 e as luzes que a Torre usa para falar com você.',
    inicio: 'Na volta para o aeródromo, o rádio para de funcionar: ninguém responde e você não ouve nada. Ainda falta entrar no circuito.',
    fases: ['Transponder', 'Luzes', 'Pouso'],
    passos: [
      { quem: 'pil', fase: 0, freq: 'TRANSPONDER', op: [
        { pt: 'Transponder 7600.', en: 'Squawk 7600.', por: '7600 avisa o controle, na tela do radar, que você está sem comunicação.' },
        { pt: 'Transponder 7700.', en: 'Squawk 7700.', por: '7700 é emergência geral. Para falha de rádio o código próprio é 7600.' },
        { pt: 'Transponder 7500.', en: 'Squawk 7500.', por: '7500 é interferência ilícita (sequestro). Nunca use por engano.' },
      ] },
      { nota: 'Você entra no circuito e olha para a torre. Ela aponta um holofote para o seu avião.' },
      { luz: 'verde', pisca: true, pt: 'Luz verde piscando, vinda da torre.', en: 'Flashing green light from the tower.' },
      { quem: 'pil', fase: 1, freq: 'O QUE SIGNIFICA', op: [
        { pt: 'Regresse para pousar: a autorização vem depois.', en: 'Return for landing: clearance will follow.', por: 'Verde piscando em voo: volte para pousar e aguarde a luz verde contínua.' },
        { pt: 'Autorizado pousar agora.', en: 'Cleared to land now.', por: 'Quem autoriza o pouso é a luz verde contínua, não a piscando.' },
        { pt: 'Aeródromo fechado: não pouse.', en: 'Airport unsafe: do not land.', por: 'Esse é o vermelho piscando.' },
      ] },
      { nota: 'Para mostrar que entendeu, de dia, você balança as asas.' },
      { luz: 'vermelho', pisca: false, pt: 'Luz vermelha contínua.', en: 'Steady red light.' },
      { quem: 'pil', fase: 1, freq: 'O QUE SIGNIFICA', op: [
        { pt: 'Dê passagem a outro avião e continue circulando.', en: 'Give way to other aircraft and continue circling.', por: 'Vermelho contínuo em voo: há outro tráfego. Continue no circuito.' },
        { pt: 'Pouse imediatamente.', en: 'Land immediately.', por: 'Vermelho nunca autoriza. Pousar agora poderia ser em cima de outro avião.' },
        { pt: 'Vá para outro aeródromo.', en: 'Divert to another airport.', por: 'Isso não é o que o vermelho contínuo diz. Ele só pede para dar passagem e circular.' },
      ] },
      { luz: 'verde', pisca: false, pt: 'Luz verde contínua.', en: 'Steady green light.' },
      { quem: 'pil', fase: 2, freq: 'O QUE SIGNIFICA', op: [
        { pt: 'Autorizado pousar.', en: 'Cleared to land.', por: 'Verde contínuo em voo é a autorização de pouso.' },
        { pt: 'Continue circulando.', en: 'Continue circling.', por: 'Continuar circulando é o vermelho contínuo.' },
        { pt: 'Pouse e vá para o pátio.', en: 'Land and proceed to the apron.', por: 'Esse é o branco piscando.' },
      ] },
      { quem: 'pil', fase: 2, freq: 'COMO RESPONDER', op: [
        { pt: 'De dia, balanço as asas.', en: 'By day, rock the wings.', por: 'É o jeito padrão de dizer "entendi" sem rádio, de dia. À noite, pisque o farol de pouso ou as luzes de navegação.' },
        { pt: 'Ligo o transponder em 7700.', en: 'Squawk 7700.', por: 'O código não responde à luz. De dia se balança as asas.' },
        { pt: 'Faço um voo rasante sobre a torre.', en: 'Make a low pass over the tower.', por: 'Perigoso e desnecessário. Balançar as asas basta.' },
      ] },
    ] },
];

/* ---------- Alfabeto e números ---------- */
const ALFA = [['A', 'Alfa', 'ÁL-fa'], ['B', 'Bravo', 'BRA-vo'], ['C', 'Charlie', 'TCHAR-li'], ['D', 'Delta', 'DÉL-ta'], ['E', 'Echo', 'É-co'], ['F', 'Foxtrot', 'FÓKS-trot'],
  ['G', 'Golf', 'GÓLF'], ['H', 'Hotel', 'rô-TÉL'], ['I', 'India', 'ÍN-dia'], ['J', 'Juliett', 'DJÚ-li-ét'], ['K', 'Kilo', 'QUÍ-lo'], ['L', 'Lima', 'LÍ-ma'], ['M', 'Mike', 'MÁIK'],
  ['N', 'November', 'no-VÉM-ber'], ['O', 'Oscar', 'ÓS-car'], ['P', 'Papa', 'pa-PÁ'], ['Q', 'Quebec', 'que-BÉK'], ['R', 'Romeo', 'RÔ-mi-o'], ['S', 'Sierra', 'si-É-ra'],
  ['T', 'Tango', 'TÂN-go'], ['U', 'Uniform', 'IÚ-ni-form'], ['V', 'Victor', 'VÍC-tor'], ['W', 'Whiskey', 'UÍS-qui'], ['X', 'X-ray', 'ÉKS-rei'], ['Y', 'Yankee', 'IÂN-qui'], ['Z', 'Zulu', 'ZÚ-lu']];
const NUM_PT = ['zero', 'uno', 'dois', 'três', 'quatro', 'cinco', 'meia', 'sete', 'oito', 'nove'];
const NUM_EN = ['zero', 'one', 'two', 'tree', 'four', 'fife', 'six', 'seven', 'eight', 'niner'];
const MIL_PT = ['', 'mil', 'dois mil', 'três mil', 'quatro mil', 'cinco mil', 'seis mil', 'sete mil', 'oito mil', 'nove mil', 'dez mil'];
const CEM_PT = ['', 'cem', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];
const MIL_EN = ['', 'one', 'two', 'tree', 'four', 'fife', 'six', 'seven', 'eight', 'niner', 'one zero'];

// Como se fala: matrícula soletrada, altitudes em milhares e centenas, o resto dígito por dígito
function falaDe(txt, l) {
  const dig = (s) => s.split('').map((d) => (l === 'pt' ? NUM_PT : NUM_EN)[+d]).join(' ');
  return txt
    .replace(/PR-HGE/g, 'Papa Romeo Hotel Golf Echo')
    .replace(l === 'pt' ? /\b(\d{1,2})\.(\d)00(?= pés)/g : /\b(\d{1,2}),(\d)00(?= feet)/g, (m, a, b) => {
      if (l === 'pt') return MIL_PT[+a] + (+b ? ' e ' + CEM_PT[+b] : '');
      return MIL_EN[+a] + ' thousand' + (+b ? ' ' + NUM_EN[+b] + ' hundred' : '');
    })
    .replace(/\b(\d+)\.(\d+)\b/g, (m, a, b) => `${dig(a)} decimal ${dig(b)}`)
    .replace(/\b\d+\b/g, dig);
}

/* ---------- Estado ---------- */
let lang = 'pt', conv = CONVERSAS[2], passo = 0, erros = 0, escolhas = 0, timer = 0, voz = false;
let feitas = new Set();
try { feitas = new Set(JSON.parse(localStorage.getItem('rdFeitas') || '[]')); } catch {}
const salvar = () => { try { localStorage.setItem('rdFeitas', JSON.stringify([...feitas])); } catch {} };

function canSpeak() { try { return !!window.speechSynthesis && speechSynthesis.getVoices().length > 0; } catch { return false; } }
function falar(txt) {
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(txt);
    u.lang = lang === 'pt' ? 'pt-BR' : 'en-US'; u.rate = 1.05;
    const v = speechSynthesis.getVoices().find((x) => x.lang.replace('_', '-').startsWith(u.lang.slice(0, 2)));
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  } catch {}
}

const log = () => $('#rdLog');
function rolar() { const l = log(); l.scrollTop = l.scrollHeight; }
function nota(t) { const p = document.createElement('p'); p.className = 'rd-note'; p.textContent = t; log().appendChild(p); rolar(); }

function msg(l, extra = '') {
  const atc = l.quem === 'atc', txt = l[lang], fala = atc ? falaDe(txt, lang) : '';
  const [who, freq = ''] = l.freq.split(/ (?=[\d])/);
  const d = document.createElement('div');
  d.className = `rd-msg rd-msg--${atc ? 'atc' : 'pil'}`;
  d.innerHTML = `<span class="rd-msg__who">${atc ? esc(who) : 'Você'} <i>${esc(atc ? freq : (freq || who))}</i></span>`
    + `<p>${esc(txt)}</p>`
    + (fala && fala !== txt ? `<span class="rd-msg__fala">Fala: ${esc(fala)}</span>` : '')
    + (atc && voz ? '<button type="button" class="rd-msg__play">Ouvir</button>' : '') + extra;
  d.querySelector('.rd-msg__play')?.addEventListener('click', () => falar(fala));
  log().appendChild(d); rolar();
}

function luz(l) {
  const d = document.createElement('div');
  d.className = 'rd-msg rd-msg--atc rd-light';
  d.innerHTML = `<span class="rd-msg__who">Torre <i>sinal luminoso</i></span><div class="rd-light__row"><span class="rd-lamp rd-lamp--${l.luz}${l.pisca ? ' is-blink' : ''}" aria-hidden="true"></span><p>${esc(l[lang])}</p></div>`;
  log().appendChild(d); rolar();
}

function fases(f) {
  $('#rdFases').style.gridTemplateColumns = `repeat(${conv.fases.length}, minmax(0, 1fr))`;
  $('#rdFases').innerHTML = conv.fases.map((n, i) => `<li class="${i < f ? 'is-done' : i === f ? 'is-now' : ''}">${n}</li>`).join('');
}

function avancar() {
  clearTimeout(timer);
  const opts = $('#rdOpts');
  opts.innerHTML = '';
  const P = conv.passos;
  if (passo >= P.length) return fim();
  const l = P[passo];
  if (l.fase !== undefined) fases(l.fase);
  if (!l.op) {
    timer = setTimeout(() => {
      if (l.nota) nota(l.nota); else if (l.luz) luz(l); else msg(l);
      passo++; avancar();
    }, l.quem === 'atc' || l.luz ? 750 : 500);
    return;
  }
  // Vez do piloto: três respostas, uma certa
  const ord = l.op.map((o, i) => ({ o, i })).sort(() => Math.random() - 0.5);
  let errou = false;
  opts.innerHTML = `<span class="label">${/SIGNIFICA|RESPONDER|TRANSPONDER/.test(l.freq) ? 'Sua vez: o que você faz?' : 'Sua vez: o que você responde?'}</span>`;
  ord.forEach(({ o, i }) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'rd-opt'; b.textContent = o[lang];
    b.addEventListener('click', () => {
      if (i === 0) {
        escolhas++; if (errou) erros++;
        msg({ quem: 'pil', freq: l.freq, pt: o.pt, en: o.en }, `<span class="rd-msg__ok">${esc(o.por)}</span>`);
        passo++; avancar();
      } else {
        errou = true;
        b.disabled = true; b.classList.add('is-wrong');
        $('#rdFb').hidden = false;
        $('#rdFb').innerHTML = `<b>Não é bem assim.</b> ${esc(o.por)}`;
      }
    });
    opts.appendChild(b);
  });
  $('#rdFb').hidden = true;
}

function fim() {
  fases(conv.fases.length);
  const certas = escolhas - erros;
  feitas.add(conv.id); salvar(); lista();
  const prox = CONVERSAS[(CONVERSAS.indexOf(conv) + 1) % CONVERSAS.length];
  $('#rdOpts').innerHTML = `<div class="rd-end"><b>Conversa concluída.</b> Você acertou de primeira ${certas} de ${escolhas} respostas.`
    + (erros ? ' Repita até acertar todas: a fraseologia vira hábito com a repetição.' : ' Fraseologia de piloto de verdade!')
    + `</div><button type="button" class="btn-ghost rd-next">Próxima: ${esc(prox.titulo)}</button>`;
  $('#rdOpts .rd-next').addEventListener('click', () => escolher(prox.id, true));
  $('#rdFb').hidden = true;
}

function reiniciar() {
  clearTimeout(timer);
  try { speechSynthesis?.cancel(); } catch {}
  passo = 0; erros = 0; escolhas = 0;
  $('#rdTitle').textContent = conv.titulo;
  $('#rdKicker').textContent = `${GRUPOS.find((g) => g[0] === conv.grupo)[1]} · PR-HGE`;
  log().innerHTML = '';
  nota(conv.inicio);
  fases(0);
  avancar();
}

/* ---------- Lista das conversas ---------- */
function lista() {
  $('#rdPick').innerHTML = GRUPOS.map(([g, nome]) => {
    const cs = CONVERSAS.filter((c) => c.grupo === g);
    return `<div class="rd-group rd-group--${g}"><h3>${nome}</h3><div class="rd-group__list">`
      + cs.map((c) => `<button type="button" class="rd-pick" data-conv="${c.id}" aria-pressed="${c === conv}">`
        + `<b>${esc(c.titulo)}${feitas.has(c.id) ? '<span class="rd-pick__done" title="Concluída">Feita</span>' : ''}</b><span>${esc(c.desc)}</span></button>`).join('')
      + '</div></div>';
  }).join('');
  $('#rdCount').textContent = `${feitas.size} de ${CONVERSAS.length} concluídas`;
}
function escolher(id, rolarAte) {
  const c = CONVERSAS.find((x) => x.id === id);
  if (!c) return;
  conv = c; lista(); reiniciar();
  if (rolarAte) $('#rdSim').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
}

/* ---------- Soletrar ---------- */
function soletrar() {
  const s = $('#rdSpell').value.toUpperCase();
  const nums = lang === 'pt' ? NUM_PT : NUM_EN;
  const out = [];
  for (const ch of s) {
    const a = ALFA.find((x) => x[0] === ch);
    if (a) out.push(a[1]);
    else if (/[0-9]/.test(ch)) out.push(nums[+ch]);
    else if (ch === '.' || ch === ',') out.push('decimal');
  }
  $('#rdSpellOut').textContent = out.length ? out.join(' ') : '…';
}

function tabelas() {
  $('#rdAlfa').innerHTML = ALFA.map(([l, w, p]) => `<div><b>${l}</b><span>${w}</span><i>${p}</i></div>`).join('');
  $('#rdNums').innerHTML = NUM_PT.map((n, i) => `<div><b>${i}</b><span>${n}</span><i>${NUM_EN[i]}</i></div>`).join('');
}

function setLang(l) {
  lang = l;
  document.querySelectorAll('#rdLang [data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === l)));
  soletrar();
  reiniciar();
}

let pronto = false;
function init() {
  if (!$('#rdLog')) return;
  tabelas(); lista();
  $('#rdPick').addEventListener('click', (e) => { const b = e.target.closest('[data-conv]'); if (b) escolher(b.dataset.conv, true); });
  $('#rdLang').addEventListener('click', (e) => { const b = e.target.closest('[data-lang]'); if (b && b.dataset.lang !== lang) setLang(b.dataset.lang); });
  $('#rdAgain').addEventListener('click', reiniciar);
  $('#rdSpell').addEventListener('input', soletrar);
  voz = canSpeak();
  try { speechSynthesis?.addEventListener?.('voiceschanged', () => { voz = canSpeak(); }); } catch {}
  soletrar();
}
// Começa a conversa quando a aba abre (e não reinicia se você voltar para ela no meio)
function start() {
  if (!pronto) { pronto = true; reiniciar(); }
}
window.Radio = { init, start };
})();
