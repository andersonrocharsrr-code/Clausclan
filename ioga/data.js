/* Sereno — posturas, práticas guiadas e exercícios de respiração.
   Figura (campo f): ângulos em graus no sistema do SVG (0 = frente/direita, 90 = baixo, -90 = cima).
   t = tronco (do quadril ao pescoço), h = cabeça, c = curvatura da coluna,
   a/b = braço da frente/de trás [braço, antebraço], l/r = perna da frente/de trás [coxa, canela].
   Um membro também pode ser {x, y, k}: o app dobra a junta (k = lado da dobra) para a mão/pé
   alcançar o ponto (x, y), medido a partir do quadril. fl/fr = ângulo do pé (opcional). */
'use strict';

const POSES = [
  {
    id: 'montanha', nome: 'Montanha', sans: 'Tadasana', tipo: 'em pé', nivel: 1, foco: ['postura'],
    ben: 'Organiza a postura e a consciência do corpo. É a base de todas as posturas em pé.',
    passos: [
      'Pés paralelos, na largura do quadril, com o peso dividido entre calcanhares e dedos.',
      'Joelhos destravados, coxas ativas e cóccix apontando para o chão.',
      'Ombros longe das orelhas e braços soltos ao lado do corpo.',
      'Cresça pelo topo da cabeça e respire pelo nariz.',
    ],
    cuidado: 'Não trave os joelhos.',
    dica: 'Cresça pelo topo da cabeça e solte os ombros.',
    f: { t: -90, h: -90, a: [94, 91], b: [86, 89], l: [91, 90], r: [89, 90] },
  },
  {
    id: 'bracos', nome: 'Braços para o alto', sans: 'Urdhva Hastasana', tipo: 'em pé', nivel: 1, foco: ['ombros', 'postura'],
    ben: 'Alonga as laterais do tronco e abre o peito.',
    passos: [
      'Comece na Montanha.',
      'Inspire e leve os braços para o alto, palmas voltadas uma para a outra.',
      'Mantenha os ombros baixos e as costelas para dentro.',
    ],
    cuidado: 'Com dor no ombro, abra mais os braços (em V).',
    dica: 'Braços ao alto sem subir os ombros.',
    f: { t: -91, h: -100, a: [-82, -86], b: [-96, -93], l: [91, 90], r: [89, 90] },
  },
  {
    id: 'flexao', nome: 'Flexão à frente em pé', sans: 'Uttanasana', tipo: 'em pé', nivel: 1, foco: ['pernas', 'costas', 'relaxar'],
    ben: 'Alonga a parte de trás das pernas e as costas e acalma a mente.',
    passos: [
      'Da Montanha, expire e dobre o corpo a partir do quadril.',
      'Dobre os joelhos o quanto precisar e segure os cotovelos ou as canelas.',
      'Deixe a cabeça e o pescoço pesarem.',
      'Para subir, dobre os joelhos e volte devagar, vértebra por vértebra.',
    ],
    cuidado: 'Com dor lombar, pressão alta ou tontura, desça só até a metade.',
    dica: 'Deixe a cabeça pesar e dobre os joelhos se precisar.',
    f: { t: 60, h: 84, c: 6, a: { x: 22, y: 62, k: 1 }, b: { x: 18, y: 64, k: 1 }, l: [89, 92], r: [88, 92] },
  },
  {
    id: 'meia', nome: 'Meia flexão', sans: 'Ardha Uttanasana', tipo: 'em pé', nivel: 1, foco: ['costas', 'pernas'],
    ben: 'Fortalece as costas e prepara a coluna para as flexões.',
    passos: [
      'Da Flexão à frente, apoie as mãos nas canelas.',
      'Inspire e alongue as costas para a frente, como uma mesa.',
      'Olhe para o chão um pouco à frente dos pés.',
    ],
    cuidado: 'Dobre os joelhos se as costas arredondarem.',
    dica: 'Costas longas, olhar à frente, mãos nas canelas.',
    f: { t: 14, h: 20, a: [104, 96], b: [102, 94], l: [92, 90], r: [89, 90] },
  },
  {
    id: 'avanco', nome: 'Avanço baixo', sans: 'Anjaneyasana', tipo: 'em pé', nivel: 1, foco: ['quadril', 'pernas'], lados: true,
    ben: 'Abre a frente do quadril e fortalece as pernas. Ótimo para quem passa o dia sentado.',
    passos: [
      'Dê um passo largo à frente e apoie o joelho de trás no chão.',
      'Joelho da frente alinhado sobre o tornozelo.',
      'Deixe o quadril descer e leve os braços para o alto.',
    ],
    cuidado: 'Coloque uma toalha dobrada sob o joelho de trás.',
    dica: 'Joelho da frente sobre o tornozelo, quadril descendo.',
    f: { t: -86, h: -95, a: [-80, -84], b: [-92, -90], l: [2, 90], r: [112, 176], fr: 182 },
  },
  {
    id: 'prancha', nome: 'Prancha', sans: 'Phalakasana', tipo: 'apoio', nivel: 2, foco: ['core', 'braços'],
    ben: 'Fortalece abdômen, braços, ombros e pernas.',
    passos: [
      'Mãos sob os ombros, dedos bem abertos.',
      'Leve os pés para trás até o corpo ficar em linha reta.',
      'Abdômen firme e calcanhares empurrando para trás.',
    ],
    cuidado: 'Se cansar, apoie os joelhos no chão. Com dor no punho, apoie os antebraços.',
    dica: 'Corpo em linha reta, abdômen firme, empurre o chão.',
    f: { t: -24, h: -18, a: [90, 90], b: [88, 90], l: [156, 156], r: [155, 156], fl: 80, fr: 80 },
  },
  {
    id: 'cachorro', nome: 'Cachorro olhando para baixo', sans: 'Adho Mukha Svanasana', tipo: 'apoio', nivel: 1, foco: ['pernas', 'costas', 'ombros'],
    ben: 'Alonga a parte de trás das pernas, panturrilhas e costas, e fortalece braços e ombros.',
    passos: [
      'Comece em quatro apoios.',
      'Dobre os dedos dos pés e leve o quadril para cima e para trás.',
      'Empurre o chão com as mãos e alongue as costas.',
      'Os calcanhares não precisam tocar o chão; dobre os joelhos se precisar.',
    ],
    cuidado: 'Com dor no punho, apoie os antebraços no chão (Golfinho).',
    dica: 'Empurre o chão e leve o quadril para cima e para trás.',
    f: { t: 48, h: 72, a: [48, 49], b: [46, 48], l: [101, 101], r: [99, 100], fl: 20, fr: 20 },
  },
  {
    id: 'cobra', nome: 'Cobra', sans: 'Bhujangasana', tipo: 'deitada', nivel: 1, foco: ['costas', 'peito'],
    ben: 'Fortalece a musculatura das costas e abre o peito.',
    passos: [
      'Deite de barriga para baixo, mãos ao lado do peito.',
      'Peitos dos pés no chão e pernas juntas.',
      'Inspire e suba o peito usando as costas, sem jogar o peso nas mãos.',
      'Cotovelos perto do corpo e ombros longe das orelhas.',
    ],
    cuidado: 'Suba só até onde não sentir dor na lombar.',
    dica: 'Peito à frente, ombros longe das orelhas.',
    f: { t: -32, h: -40, c: -4, a: { x: 34, y: 4, k: 1 }, b: { x: 30, y: 4, k: 1 }, l: [178, 180], r: [177, 180], fl: 182, fr: 182 },
  },
  {
    id: 'caocima', nome: 'Cachorro olhando para cima', sans: 'Urdhva Mukha Svanasana', tipo: 'apoio', nivel: 2, foco: ['costas', 'peito', 'braços'],
    ben: 'Abre o peito e os ombros e fortalece braços e costas.',
    passos: [
      'Deite de barriga para baixo, mãos ao lado da cintura.',
      'Estique os braços e tire as coxas do chão.',
      'Apoie só as mãos e os peitos dos pés.',
    ],
    cuidado: 'Se incomodar a lombar ou os punhos, faça a Cobra.',
    dica: 'Braços esticados, coxas fora do chão, peito aberto.',
    f: { t: -62, h: -55, c: -6, a: [92, 90], b: [90, 90], l: [174, 178], r: [173, 178], fl: 182, fr: 182 },
  },
  {
    id: 'crianca', nome: 'Postura da criança', sans: 'Balasana', tipo: 'sentada', nivel: 1, foco: ['relaxar', 'costas'],
    ben: 'Descansa o corpo, alonga as costas e acalma a respiração.',
    passos: [
      'Ajoelhe e sente sobre os calcanhares.',
      'Abra os joelhos se for mais confortável.',
      'Leve o tronco à frente e apoie a testa no chão.',
      'Braços à frente ou ao lado do corpo.',
    ],
    cuidado: 'Com dor no joelho, coloque uma almofada entre a coxa e a panturrilha.',
    dica: 'Solte o peso do corpo e respire nas costas.',
    f: { olhos: 'fechados', t: 14, h: 20, c: 8, a: [6, 2], b: [8, 3], l: [38, 182], r: [36, 182], fl: 182, fr: 182 },
  },
  {
    id: 'mesa', nome: 'Quatro apoios', sans: 'Bharmanasana', tipo: 'apoio', nivel: 1, foco: ['costas', 'postura'],
    ben: 'Posição neutra para começar o Gato e a Vaca e para entrar em outras posturas.',
    passos: [
      'Mãos sob os ombros e joelhos sob o quadril.',
      'Costas retas, do quadril até o topo da cabeça.',
      'Olhar para o chão.',
    ],
    cuidado: 'Coloque uma toalha sob os joelhos se o chão for duro.',
    dica: 'Mãos sob os ombros, joelhos sob o quadril.',
    f: { t: -6, h: 10, a: [90, 90], b: [88, 90], l: [90, 180], r: [92, 180], fl: 182, fr: 182 },
  },
  {
    id: 'gato', nome: 'Gato', sans: 'Marjaryasana', tipo: 'apoio', nivel: 1, foco: ['costas'],
    ben: 'Movimenta a coluna e solta a tensão das costas e do pescoço.',
    passos: [
      'Comece em quatro apoios.',
      'Expire e arredonde as costas, empurrando o chão.',
      'Leve o queixo em direção ao peito e olhe para o umbigo.',
    ],
    cuidado: 'Movimente devagar, no ritmo da respiração.',
    dica: 'Expire, arredonde as costas e olhe para o umbigo.',
    f: { t: -6, h: 95, c: 13, a: [90, 90], b: [88, 90], l: [90, 180], r: [92, 180], fl: 182, fr: 182 },
  },
  {
    id: 'vaca', nome: 'Vaca', sans: 'Bitilasana', tipo: 'apoio', nivel: 1, foco: ['costas', 'peito'],
    ben: 'Abre o peito e movimenta a coluna na direção oposta ao Gato.',
    passos: [
      'Comece em quatro apoios.',
      'Inspire, deixe a barriga descer e abra o peito.',
      'Olhe levemente para a frente, sem apertar o pescoço.',
    ],
    cuidado: 'Não force a lombar; o movimento vem do peito.',
    dica: 'Inspire, deixe a barriga descer e abra o peito.',
    f: { t: -6, h: -45, c: -9, a: [90, 90], b: [88, 90], l: [90, 180], r: [92, 180], fl: 182, fr: 182 },
  },
  {
    id: 'guerreiro1', nome: 'Guerreiro I', sans: 'Virabhadrasana I', tipo: 'em pé', nivel: 2, foco: ['pernas', 'quadril'], lados: true,
    ben: 'Fortalece as pernas e abre o peito e a frente do quadril.',
    passos: [
      'Dê um passo largo para trás, pé de trás virado levemente para fora.',
      'Dobre o joelho da frente até ficar sobre o tornozelo.',
      'Quadril virado para a frente e braços para o alto.',
    ],
    cuidado: 'Diminua o passo se o joelho da frente passar da ponta do pé.',
    dica: 'Joelho da frente dobrado, braços para o alto, quadril para a frente.',
    f: { t: -88, h: -96, a: [-80, -84], b: [-94, -92], l: [18, 92], r: [140, 140], fr: 60 },
  },
  {
    id: 'guerreiro2', nome: 'Guerreiro II', sans: 'Virabhadrasana II', tipo: 'em pé', nivel: 2, foco: ['pernas', 'quadril', 'ombros'], lados: true,
    ben: 'Fortalece pernas e ombros, abre o quadril e melhora a resistência.',
    passos: [
      'Abra bem as pernas, pé da frente apontando para a frente e o de trás para o lado.',
      'Dobre o joelho da frente sobre o tornozelo.',
      'Braços abertos na altura dos ombros e olhar sobre a mão da frente.',
    ],
    cuidado: 'Mantenha o joelho da frente apontando para o segundo dedo do pé.',
    dica: 'Braços abertos na altura dos ombros, olhar sobre a mão da frente.',
    f: { t: -90, h: -84, a: [0, 0], b: [180, 180], l: [12, 92], r: [143, 143], fr: 60 },
  },
  {
    id: 'guerreiro3', nome: 'Guerreiro III', sans: 'Virabhadrasana III', tipo: 'equilíbrio', nivel: 3, foco: ['equilíbrio', 'pernas', 'core'], lados: true,
    ben: 'Desafia o equilíbrio e fortalece pernas, glúteos e abdômen.',
    passos: [
      'Da Montanha, passe o peso para uma perna.',
      'Incline o tronco à frente enquanto a outra perna sobe para trás.',
      'Corpo como um T: braços, tronco e perna de trás na mesma linha.',
    ],
    cuidado: 'Apoie as mãos numa parede ou cadeira se precisar.',
    dica: 'Corpo como um T, quadril nivelado.',
    f: { t: -4, h: 0, a: [-2, -2], b: [0, 0], l: [91, 90], r: [178, 178], fr: 90 },
  },
  {
    id: 'triangulo', nome: 'Triângulo', sans: 'Trikonasana', tipo: 'em pé', nivel: 2, foco: ['pernas', 'quadril', 'costas'], lados: true,
    ben: 'Alonga as pernas e as laterais do tronco e abre o peito.',
    passos: [
      'Pernas bem abertas e esticadas, pé da frente apontando para a frente.',
      'Estique o tronco sobre a perna da frente e desça a mão até a canela.',
      'A outra mão sobe em direção ao teto; olhe para ela.',
    ],
    cuidado: 'Apoie a mão mais alto na perna (nunca sobre o joelho) se precisar.',
    dica: 'Tronco longo sobre a perna da frente, peito aberto.',
    f: { t: -22, h: -58, a: { x: 38, y: 34, k: 1 }, b: [-92, -92], l: [46, 46], r: [132, 132], fl: -44, fr: 42 },
  },
  {
    id: 'arvore', nome: 'Árvore', sans: 'Vrksasana', tipo: 'equilíbrio', nivel: 1, foco: ['equilíbrio', 'postura'], lados: true,
    ben: 'Melhora o equilíbrio, a concentração e fortalece tornozelos e pernas.',
    passos: [
      'Passe o peso para uma perna.',
      'Apoie a sola do outro pé no tornozelo, na canela ou na coxa.',
      'Mãos unidas no peito ou braços para o alto.',
      'Fixe o olhar num ponto parado.',
    ],
    cuidado: 'Apoie o pé abaixo ou acima do joelho, nunca sobre ele.',
    dica: 'Fixe o olhar num ponto parado e cresça.',
    f: { t: -90, h: -90, a: [-72, -112], b: [-108, -68], l: [24, 162], r: [90, 90], fl: 100 },
  },
  {
    id: 'cadeira', nome: 'Cadeira', sans: 'Utkatasana', tipo: 'em pé', nivel: 2, foco: ['pernas', 'core'],
    ben: 'Fortalece coxas, glúteos e abdômen e aquece o corpo.',
    passos: [
      'Pés juntos ou na largura do quadril.',
      'Dobre os joelhos e leve o quadril para trás, como se fosse sentar.',
      'Braços para o alto, ao lado das orelhas.',
      'Peso nos calcanhares.',
    ],
    cuidado: 'Com dor no joelho, dobre menos.',
    dica: 'Quadril para trás como quem vai sentar, peso nos calcanhares.',
    f: { t: -58, h: -62, a: [-58, -60], b: [-62, -64], l: [30, 112], r: [28, 112] },
  },
  {
    id: 'inclinacao', nome: 'Inclinação lateral', sans: 'Parsva Tadasana', tipo: 'em pé', nivel: 1, foco: ['costas', 'ombros'], lados: true,
    ben: 'Alonga as laterais do corpo e solta a respiração.',
    passos: [
      'Em pé, pés na largura do quadril.',
      'Inspire e leve os braços para o alto.',
      'Expire e incline o tronco para um lado, sem girar.',
    ],
    cuidado: 'Incline só até onde respirar com conforto.',
    dica: 'Cresça antes de inclinar e respire na lateral do corpo.',
    f: { t: -72, h: -66, a: [-42, -18], b: [-62, -28], l: [92, 90], r: [86, 90] },
  },
  {
    id: 'sentado', nome: 'Sentado fácil', sans: 'Sukhasana', tipo: 'sentada', nivel: 1, foco: ['relaxar', 'postura'],
    ben: 'Postura para respirar, meditar e começar ou terminar a prática.',
    passos: [
      'Sente com as pernas cruzadas.',
      'Se precisar, sente sobre uma almofada para o quadril ficar acima dos joelhos.',
      'Mãos sobre os joelhos e coluna alongada.',
    ],
    cuidado: 'Troque o cruzamento das pernas de vez em quando.',
    dica: 'Coluna alongada, ombros soltos, respiração tranquila.',
    f: { t: -90, h: -90, a: { x: 32, y: 2, k: -1 }, b: { x: 28, y: 3, k: -1 }, l: [8, 172], r: [14, 176], fl: 120, fr: 120 },
  },
  {
    id: 'torcao', nome: 'Torção sentada', sans: 'Parivrtta Sukhasana', tipo: 'sentada', nivel: 1, foco: ['costas', 'relaxar'], lados: true,
    ben: 'Solta a coluna e as costas.',
    passos: [
      'Sente de pernas cruzadas.',
      'Inspire e cresça. Expire e gire o tronco para um lado.',
      'Uma mão no joelho oposto, a outra no chão atrás do corpo.',
    ],
    cuidado: 'Gire a partir do peito, sem forçar o pescoço.',
    dica: 'Cresça na inspiração e gire um pouco mais na expiração.',
    f: { t: -90, h: -92, face: 182, a: { x: 30, y: 2, k: -1 }, b: { x: -24, y: 6, k: 1 }, l: [8, 172], r: [14, 176], fl: 120, fr: 120 },
  },
  {
    id: 'pinca', nome: 'Pinça sentada', sans: 'Paschimottanasana', tipo: 'sentada', nivel: 1, foco: ['pernas', 'costas', 'relaxar'],
    ben: 'Alonga a parte de trás das pernas e as costas e acalma.',
    passos: [
      'Sente com as pernas esticadas à frente.',
      'Inspire e cresça; expire e incline o tronco à frente a partir do quadril.',
      'Segure as canelas, os pés ou uma faixa.',
    ],
    cuidado: 'Dobre os joelhos se a lombar arredondar demais.',
    dica: 'Incline a partir do quadril e solte o pescoço.',
    f: { t: -26, h: -14, c: 5, a: { x: 66, y: -2, k: 1 }, b: { x: 62, y: -1, k: 1 }, l: [0, 0], r: [2, 0], fl: -80, fr: -80 },
  },
  {
    id: 'borboleta', nome: 'Borboleta', sans: 'Baddha Konasana', tipo: 'sentada', nivel: 1, foco: ['quadril'],
    ben: 'Abre o quadril e alonga a parte interna das coxas.',
    passos: [
      'Sente e junte as solas dos pés.',
      'Deixe os joelhos caírem para os lados.',
      'Segure os pés e cresça pela coluna.',
    ],
    cuidado: 'Coloque almofadas sob os joelhos se eles ficarem muito altos.',
    dica: 'Joelhos pesados, coluna alongada.',
    f: { t: -90, h: -90, a: { x: 6, y: 6, k: -1 }, b: { x: -6, y: 6, k: 1 }, l: [8, 168], r: [172, 12], fl: 90, fr: 90 },
  },
  {
    id: 'barco', nome: 'Barco', sans: 'Navasana', tipo: 'sentada', nivel: 2, foco: ['core'],
    ben: 'Fortalece o abdômen e os flexores do quadril e melhora o equilíbrio.',
    passos: [
      'Sente com os joelhos dobrados e pés no chão.',
      'Incline o tronco para trás com a coluna reta.',
      'Tire os pés do chão. Se der, estique as pernas.',
      'Braços à frente, paralelos ao chão.',
    ],
    cuidado: 'Comece com os joelhos dobrados; não deixe a lombar afundar.',
    dica: 'Peito aberto, coluna reta, respire.',
    f: { t: -122, h: -112, a: [-8, -6], b: [-4, -4], l: [-42, -42], r: [-40, -40], fl: -120, fr: -120 },
  },
  {
    id: 'pombo', nome: 'Pombo', sans: 'Eka Pada Rajakapotasana', tipo: 'sentada', nivel: 2, foco: ['quadril'], lados: true,
    ben: 'Alonga glúteos e quadril profundamente. Bom para quem corre ou fica muito sentado.',
    passos: [
      'Em quatro apoios, leve um joelho para a frente, atrás do punho do mesmo lado.',
      'Estique a outra perna para trás.',
      'Apoie as mãos ao lado do quadril e cresça. Se quiser, desça o tronco.',
    ],
    cuidado: 'Com dor no joelho, faça a versão deitada (tornozelo sobre o joelho oposto).',
    dica: 'Quadril reto e respiração lenta.',
    f: { t: -84, h: -88, a: { x: 14, y: 6, k: -1 }, b: { x: -8, y: 6, k: 1 }, l: [8, 172], r: [174, 180], fl: 120, fr: 182 },
  },
  {
    id: 'ponte', nome: 'Ponte', sans: 'Setu Bandhasana', tipo: 'deitada', nivel: 1, foco: ['costas', 'pernas', 'peito'],
    ben: 'Fortalece glúteos e costas e abre o peito.',
    passos: [
      'Deite de barriga para cima, joelhos dobrados e pés no chão.',
      'Braços ao lado do corpo.',
      'Inspire e suba o quadril, empurrando os pés no chão.',
      'Desça devagar, vértebra por vértebra.',
    ],
    cuidado: 'Não vire a cabeça enquanto estiver na postura.',
    dica: 'Empurre os pés no chão e suba o quadril.',
    f: { t: 150, h: 178, c: -5, a: [8, 2], b: [6, 1], l: [-6, 96], r: [-4, 96] },
  },
  {
    id: 'joelhos', nome: 'Joelhos ao peito', sans: 'Apanasana', tipo: 'deitada', nivel: 1, foco: ['costas', 'relaxar'],
    ben: 'Alivia a lombar e relaxa o abdômen.',
    passos: [
      'Deite de barriga para cima.',
      'Abrace os joelhos e traga-os em direção ao peito.',
      'Se quiser, balance de um lado para o outro.',
    ],
    cuidado: 'Mantenha a cabeça apoiada no chão.',
    dica: 'Abrace os joelhos e solte a lombar no chão.',
    f: { olhos: 'fechados', t: 180, h: 180, a: { x: -18, y: -32, k: -1 }, b: { x: -16, y: -30, k: -1 }, l: [-118, -8], r: [-114, -6], fl: -100, fr: -100 },
  },
  {
    id: 'parede', nome: 'Pernas na parede', sans: 'Viparita Karani', tipo: 'deitada', nivel: 1, foco: ['relaxar', 'pernas'],
    ben: 'Descansa as pernas, acalma e ajuda a relaxar antes de dormir.',
    passos: [
      'Sente de lado, encostado na parede.',
      'Deite de barriga para cima e suba as pernas pela parede.',
      'Braços soltos ao lado do corpo e olhos fechados.',
    ],
    cuidado: 'Com glaucoma ou pressão alta sem controle, converse com seu médico antes.',
    dica: 'Pernas soltas, ombros pesados, respire devagar.',
    f: { olhos: 'fechados', t: 180, h: 180, a: [172, 176], b: [174, 178], l: [-90, -90], r: [-92, -92], fl: 0, fr: 0 },
  },
  {
    id: 'savasana', nome: 'Relaxamento final', sans: 'Savasana', tipo: 'deitada', nivel: 1, foco: ['relaxar'],
    ben: 'Integra a prática, reduz a tensão e acalma o sistema nervoso.',
    passos: [
      'Deite de barriga para cima, pernas e braços soltos.',
      'Palmas para cima e olhos fechados.',
      'Solte o controle da respiração e relaxe parte por parte do corpo.',
    ],
    cuidado: 'Coloque uma almofada sob os joelhos se a lombar incomodar.',
    dica: 'Solte o peso do corpo no chão. Não há nada para fazer agora.',
    f: { olhos: 'fechados', t: 180, h: 180, a: [6, 2], b: [4, 1], l: [1, 0], r: [3, 0], fl: -70, fr: -60 },
  },
];

// Uma rodada da Saudação ao Sol, guiada pela respiração.
const SOL = [
  ['montanha', 5, 'Expire, mãos juntas no peito'],
  ['bracos', 5, 'Inspire, braços ao alto'],
  ['flexao', 5, 'Expire, desça à frente'],
  ['meia', 4, 'Inspire, alongue as costas'],
  ['prancha', 6, 'Expire, leve os pés para trás'],
  ['cobra', 6, 'Inspire, abra o peito'],
  ['cachorro', 18, 'Expire e fique por três respirações'],
  ['meia', 5, 'Inspire, caminhe até as mãos e olhe à frente'],
  ['flexao', 5, 'Expire, solte'],
  ['bracos', 5, 'Inspire, suba com os braços ao alto'],
  ['montanha', 5, 'Expire, mãos ao peito'],
];
const repetir = (n, arr) => Array.from({ length: n }, () => arr).flat();
const GATOVACA = (n, s) => repetir(n, [['gato', s, 'Expire, arredonde as costas'], ['vaca', s, 'Inspire, abra o peito']]);

const PROGRAMS = [
  {
    id: 'primeiros', nome: 'Primeiros passos', nivel: 1, tag: 'Iniciante', cor: '#7fa98b',
    desc: 'Conheça as posturas básicas com calma, uma de cada vez. Ideal para a primeira semana.',
    itens: [
      ['sentado', 40, 'Respire fundo pelo nariz e chegue ao momento'], ['mesa', 25], ...GATOVACA(3, 8),
      ['crianca', 40], ['cachorro', 35], ['cobra', 25], ['crianca', 30], ['montanha', 30], ['bracos', 20],
      ['flexao', 30], ['meia', 15], ['montanha', 20], ['savasana', 90],
    ],
  },
  {
    id: 'sol', nome: 'Saudação ao Sol', nivel: 2, tag: 'Energia', cor: '#d98f5f', flow: true,
    desc: 'Sequência clássica em movimento, um passo por respiração. Aquece o corpo inteiro e desperta.',
    itens: [
      ['montanha', 20, 'Feche os olhos e perceba a respiração'], ...repetir(4, SOL),
      ['crianca', 40, 'Descanse e deixe a respiração voltar ao normal'], ['savasana', 60, 'Solte o corpo no chão'],
    ],
  },
  {
    id: 'despertar', nome: 'Despertar suave', nivel: 1, tag: 'Manhã', cor: '#e2b45b',
    desc: 'Acorde o corpo sem pressa: coluna, quadril e pernas, para começar o dia com disposição.',
    itens: [
      ['sentado', 40, 'Respire fundo e espreguice por dentro'], ['mesa', 15], ...GATOVACA(3, 7),
      ['cachorro', 35], ['avanco', 30], ['flexao', 30], ['bracos', 20], ['inclinacao', 20], ['cadeira', 25],
      ['montanha', 30, 'Perceba o corpo desperto'],
    ],
  },
  {
    id: 'costas', nome: 'Costas leves', nivel: 1, tag: 'Coluna', cor: '#6f9bb8',
    desc: 'Movimentos suaves para soltar a lombar, o meio das costas e o pescoço.',
    itens: [
      ['crianca', 50], ['mesa', 15], ...GATOVACA(4, 8), ['cobra', 25], ['crianca', 30], ['cobra', 25],
      ['crianca', 30], ['ponte', 30], ['joelhos', 40], ['ponte', 30], ['joelhos', 30], ['savasana', 120],
    ],
  },
  {
    id: 'quadril', nome: 'Quadril livre', nivel: 1, tag: 'Flexibilidade', cor: '#a787b8',
    desc: 'Abre o quadril e alonga as pernas. Bom para quem passa muito tempo sentado.',
    itens: [
      ['sentado', 40], ['borboleta', 60], ['mesa', 15], ['avanco', 40], ['cachorro', 30], ['pombo', 50],
      ['crianca', 40], ['pinca', 60], ['joelhos', 30], ['savasana', 60],
    ],
  },
  {
    id: 'forca', nome: 'Força e equilíbrio', nivel: 2, tag: 'Força', cor: '#c4685a',
    desc: 'Posturas em pé e de equilíbrio para fortalecer pernas e abdômen e melhorar a estabilidade.',
    itens: [
      ['montanha', 20], ['cadeira', 30], ['guerreiro1', 30], ['guerreiro2', 30], ['triangulo', 30],
      ['arvore', 30], ['guerreiro3', 20], ['prancha', 30], ['cachorro', 30], ['barco', 25], ['crianca', 40],
      ['barco', 25], ['ponte', 30], ['savasana', 90],
    ],
  },
  {
    id: 'dormir', nome: 'Antes de dormir', nivel: 1, tag: 'Relaxar', cor: '#5f6fa8',
    desc: 'Posturas lentas e no chão para desacelerar, soltar o corpo e preparar o sono.',
    itens: [
      ['sentado', 60, 'Respire devagar, soltando o ar mais longo do que puxa'], ['torcao', 30], ['borboleta', 60],
      ['pinca', 60], ['crianca', 60], ['joelhos', 45], ['parede', 120], ['savasana', 120, 'Deixe o corpo pesar. Pode dormir se quiser.'],
    ],
  },
  {
    id: 'pausa', nome: 'Pausa de 5 minutos', nivel: 1, tag: 'Trabalho', cor: '#5aa59a',
    desc: 'Para levantar da cadeira, alongar e voltar com a cabeça leve. Só precisa de um pequeno espaço.',
    itens: [
      ['montanha', 20], ['bracos', 20], ['inclinacao', 20], ['flexao', 30], ['meia', 15], ['cadeira', 20],
      ['arvore', 20], ['montanha', 30, 'Respire fundo e volte com calma'],
    ],
  },
];

const BREATHS = [
  {
    id: 'coerente', nome: 'Respiração coerente', cor: '#7fa98b', fases: [['in', 5], ['out', 5]],
    desc: 'Cinco segundos para entrar e cinco para sair. Equilibra e acalma.',
  },
  {
    id: 'longa', nome: 'Expiração longa', cor: '#6f9bb8', fases: [['in', 4], ['out', 6]],
    desc: 'Solte o ar mais devagar do que puxa. Ajuda nos momentos de ansiedade.',
  },
  {
    id: 'quadrada', nome: 'Respiração quadrada', cor: '#d98f5f', fases: [['in', 4], ['hold', 4], ['out', 4], ['hold', 4]],
    desc: 'Inspire, segure, expire e segure, quatro segundos cada. Ajuda a focar.',
  },
  {
    id: '478', nome: '4-7-8 para relaxar', cor: '#5f6fa8', fases: [['in', 4], ['hold', 7], ['out', 8]],
    desc: 'Inspire em 4, segure em 7, solte em 8. Bom antes de dormir.',
  },
];

const GOALS = [
  { id: 'calma', nome: 'Menos estresse e sono melhor', emoji: '🌙', progs: ['dormir', 'costas', 'primeiros'] },
  { id: 'flex', nome: 'Mais flexibilidade', emoji: '🌿', progs: ['quadril', 'despertar', 'primeiros'] },
  { id: 'costas', nome: 'Aliviar as costas', emoji: '🪷', progs: ['costas', 'pausa', 'quadril'] },
  { id: 'forca', nome: 'Força e equilíbrio', emoji: '🔥', progs: ['forca', 'sol', 'despertar'] },
  { id: 'energia', nome: 'Mais energia no dia', emoji: '☀️', progs: ['despertar', 'sol', 'pausa'] },
];

const TIPS = [
  'Pratique com o estômago leve: espere cerca de duas horas depois de uma refeição grande.',
  'Respire pelo nariz. Se a respiração ficar curta, você está indo além do necessário.',
  'Desconforto de alongamento é normal; dor aguda ou formigamento não. Volte um passo.',
  'Dez minutos todos os dias valem mais do que uma hora uma vez por semana.',
  'Use o que tiver em casa: uma almofada vira apoio, uma toalha vira faixa.',
  'Dobrar os joelhos nas flexões protege a lombar e não diminui o benefício.',
  'Na Árvore e no Guerreiro III, olhe para um ponto parado: isso ajuda o equilíbrio.',
  'Não pule o relaxamento final. É nele que o corpo absorve a prática.',
  'Se um lado do corpo for mais rígido, comece por ele.',
  'Pratique descalço, num tapete ou numa superfície que não escorregue.',
];

// Expressão de cada postura: -1 concentrada, 0 neutra, 1 sorrindo (o padrão é um meio-sorriso).
const EXPRESSAO = {
  prancha: -1, cadeira: -1, guerreiro1: -0.8, guerreiro2: -0.8, guerreiro3: -1, barco: -1, caocima: -0.6,
  triangulo: -0.5, arvore: -0.6, avanco: -0.3, ponte: -0.2,
  savasana: 1, crianca: 1, parede: 1, joelhos: 1, sentado: 0.8, borboleta: 0.8, torcao: 0.6, pinca: 0.6, montanha: 0.6,
};
for (const p of POSES) if (EXPRESSAO[p.id] != null) p.f.ex = EXPRESSAO[p.id];

// Opções de aparência da pessoa (Perfil).
const LOOKS = {
  pele: [['p1', '#f2cdb0', 'Muito clara'], ['p2', '#e6b48f', 'Clara'], ['p3', '#d9a07a', 'Média'], ['p4', '#b07a55', 'Morena'], ['p5', '#7d5137', 'Negra']],
  cabelo: [['c1', '#3b2a22', 'Castanho escuro'], ['c2', '#18120f', 'Preto'], ['c3', '#80522e', 'Castanho claro'], ['c4', '#caa05a', 'Loiro'], ['c5', '#a8472b', 'Ruivo'], ['c6', '#a19d97', 'Grisalho']],
  estilo: [['coque', 'Coque'], ['rabo', 'Rabo de cavalo'], ['curto', 'Curto'], ['solto', 'Solto']],
  roupa: [['r1', '#c8663f', 'Terracota'], ['r2', '#5e8f6e', 'Verde'], ['r3', '#4f6fa8', 'Azul'], ['r4', '#8d6bb0', 'Lilás'], ['r5', '#d3a13b', 'Mostarda'], ['r6', '#d8708a', 'Rosa']],
  calca: [['k1', '#2f4a3e', 'Verde-escuro'], ['k2', '#2a2a2c', 'Preta'], ['k3', '#2b3a5c', 'Azul-marinho'], ['k4', '#5d636b', 'Cinza'], ['k5', '#6b2e3a', 'Vinho']],
};
