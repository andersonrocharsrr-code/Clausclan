/* Hangar Escola: explorador de peças, trilha de lições, cockpit e túnel de vento. */
(() => {
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const fmt = (n, d = 0) => n.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

/* ---------------- Dados: peças ---------------- */
const PARTS = {
  helice: {
    nome: 'Hélice', sistema: 'Propulsão',
    onde: 'Na frente do nariz, presa ao eixo do motor.',
    funcao: 'Transforma a potência do motor em tração, a força que puxa o avião para frente.',
    como: 'Cada pá é uma pequena asa girando. A face da frente tem pressão menor que a de trás, e essa diferença puxa o avião. No Cessna 172 a hélice é de passo fixo: o ângulo das pás não muda em voo.',
    manut: 'No pré-voo, passe a mão pelo bordo de ataque procurando entalhes. Um entalhe pequeno concentra esforço e pode virar uma trinca por fadiga; é lixado pelo mecânico dentro de limites do manual.',
    curio: 'A ponta da pá gira muito mais rápido que o centro. A 2.700 RPM, a ponta de uma hélice de 1,9 m passa de 950 km/h.',
    spec: [['Diâmetro', '1,93 m'], ['Pás', '2'], ['RPM máx.', '2.700']],
  },
  motor: {
    nome: 'Motor', sistema: 'Propulsão',
    onde: 'Dentro da carenagem (capô) do nariz, à frente da parede de fogo.',
    funcao: 'Gera a potência que gira a hélice e também aciona alternador, bomba de vácuo e magnetos.',
    como: 'Motor a pistão de 4 cilindros opostos, refrigerado a ar, ciclo de 4 tempos: admissão, compressão, combustão e escape. A ignição vem de dois magnetos independentes, que geram faísca sozinhos, sem precisar da bateria.',
    manut: 'Troca de óleo a cada 50 horas, inspeção de 100 horas e anual. O motor tem um TBO (tempo entre revisões gerais) de cerca de 2.000 horas.',
    curio: 'Antes da decolagem, o piloto testa cada magneto separadamente. A queda de RPM com um só magneto mostra se as velas estão boas.',
    spec: [['Modelo', 'Lycoming IO-360'], ['Potência', '180 hp'], ['Cilindros', '4']],
  },
  cabine: {
    nome: 'Cabine (cockpit)', sistema: 'Comandos de voo',
    onde: 'Na parte da frente da fuselagem, sob a asa.',
    funcao: 'É onde ficam os pilotos, o painel de instrumentos e todos os comandos.',
    como: 'O manche move para frente e para trás (profundor) e gira para os lados (ailerons). Os pedais movem o leme e, apertando a ponta, os freios. A manete preta controla a potência e a vermelha, a mistura de combustível.',
    manut: 'Verificar cintos, fixação dos bancos, para-brisa sem trincas e os instrumentos com indicação correta antes da partida.',
    curio: 'O banco do comandante fica à esquerda. Em helicópteros, quase sempre é à direita.',
    spec: [['Assentos', '4'], ['Instrumentos', '6 básicos'], ['Comandos', 'duplos']],
  },
  fuselagem: {
    nome: 'Fuselagem', sistema: 'Estrutura',
    onde: 'O corpo do avião, do motor até a cauda.',
    funcao: 'Liga asas, cauda, motor e trem de pouso, e carrega pessoas e bagagem.',
    como: 'Estrutura semimonocoque: cavernas (anéis) e longarinas formam o esqueleto, e a chapa de alumínio rebitada ajuda a suportar a carga.',
    manut: 'Procurar rebites soltos (deixam uma mancha escura em volta, o "rebite fumando"), amassados e corrosão, principalmente na parte de baixo.',
    curio: 'A pele de alumínio de um avião leve tem menos de 1 mm de espessura em muitos pontos.',
    spec: [['Comprimento', '8,28 m'], ['Material', 'Alumínio 2024'], ['Tipo', 'Semimonocoque']],
  },
  asa: {
    nome: 'Asa', sistema: 'Estrutura',
    onde: 'Em cima da fuselagem (asa alta), presa por montantes.',
    funcao: 'Gera a sustentação que mantém o avião no ar. Também guarda os tanques de combustível.',
    como: 'O perfil da asa é curvado e inclinado em relação ao vento. O ar que passa por cima acelera e a pressão cai; embaixo a pressão fica maior. Essa diferença empurra a asa para cima.',
    manut: 'Verificar bordo de ataque sem amassados, pontas de asa, montantes e tampas dos tanques bem fechadas.',
    curio: 'Gelo de poucos milímetros no bordo de ataque já muda o perfil e reduz bastante a sustentação.',
    spec: [['Envergadura', '11,0 m'], ['Área (S)', '16,2 m²'], ['Perfil', 'NACA 2412']],
    ver: 'lab',
  },
  aileron: {
    nome: 'Ailerons', sistema: 'Comandos de voo',
    onde: 'No bordo de fuga (parte de trás) perto das pontas das asas.',
    funcao: 'Controlam a rolagem: inclinar o avião para a esquerda ou para a direita, em torno do eixo longitudinal.',
    como: 'Movem-se em sentidos opostos. Manche para a esquerda: aileron esquerdo sobe e o direito desce. A asa direita ganha sustentação, a esquerda perde, e o avião inclina para a esquerda.',
    manut: 'No pré-voo, mover o aileron com a mão, conferir folgas, dobradiças e o movimento livre até os batentes.',
    curio: 'O aileron que desce gera mais arrasto e puxa o nariz para o lado contrário da curva. Isso é a guinada adversa, corrigida com o pedal.',
    spec: [['Eixo', 'Longitudinal'], ['Movimento', 'Rolagem'], ['Comando', 'Manche lateral']],
    ver: 'cockpit',
  },
  flap: {
    nome: 'Flaps', sistema: 'Hipersustentação',
    onde: 'No bordo de fuga, entre a fuselagem e os ailerons.',
    funcao: 'Aumentam a sustentação e o arrasto para voar mais devagar com segurança na decolagem e no pouso.',
    como: 'Ao descer, o flap aumenta a curvatura da asa. A asa gera mais sustentação na mesma velocidade, e a velocidade de estol cai. O arrasto extra deixa a rampa de aproximação mais íngreme.',
    manut: 'Conferir trilhos, roletes e o motor elétrico dos flaps. Os dois lados precisam descer igual; flap assimétrico faz o avião rolar.',
    curio: 'Só se baixa flap abaixo da VFE (arco branco no velocímetro). No Cessna 172S, 110 kt para 10° e 85 kt para mais que isso.',
    spec: [['Posições', '0°·10°·20°·30°'], ['VFE', '85 kt'], ['Estol c/ flap', '40 kt']],
    ver: 'cockpit',
  },
  estabh: {
    nome: 'Estabilizador horizontal', sistema: 'Empenagem',
    onde: 'Na cauda, a "asinha" horizontal.',
    funcao: 'Dá estabilidade em arfagem: faz o nariz voltar sozinho para a posição de equilíbrio.',
    como: 'O centro de gravidade fica à frente do ponto onde a asa sustenta, então o nariz tende a cair. O estabilizador gera uma pequena força para baixo que equilibra essa tendência.',
    manut: 'Verificar fixação na fuselagem, amassados e o compensador (trim) do profundor.',
    curio: 'Por isso carregar o avião com muito peso atrás é perigoso: com o CG muito para trás, o avião fica instável em arfagem.',
    spec: [['Eixo', 'Lateral'], ['Função', 'Estabilidade'], ['Par', 'Profundor']],
  },
  profundor: {
    nome: 'Profundor', sistema: 'Comandos de voo',
    onde: 'Atrás do estabilizador horizontal.',
    funcao: 'Controla a arfagem: subir ou baixar o nariz, em torno do eixo lateral.',
    como: 'Puxar o manche faz o profundor subir. O vento empurra a cauda para baixo e o nariz sobe. Empurrar faz o contrário. O compensador (trim) mantém a posição sem o piloto precisar segurar força.',
    manut: 'Mover pela mão para cima e para baixo, conferir cabos, dobradiças e o compensador.',
    curio: 'Na prática, o profundor controla o ângulo de ataque, e com ele a velocidade. A potência controla se o avião sobe ou desce.',
    spec: [['Eixo', 'Lateral'], ['Movimento', 'Arfagem'], ['Comando', 'Manche frente/trás']],
    ver: 'cockpit',
  },
  estabv: {
    nome: 'Estabilizador vertical (deriva)', sistema: 'Empenagem',
    onde: 'Na cauda, a parte vertical.',
    funcao: 'Dá estabilidade direcional: mantém o nariz apontado para o vento, como as penas de uma flecha.',
    como: 'Se o avião derrapa para um lado, o vento bate na lateral da deriva e empurra a cauda de volta, alinhando o nariz.',
    manut: 'Verificar a fixação, a luz de navegação branca na ponta e antenas.',
    curio: 'Em muitos aviões, a deriva leva a antena do rádio VHF e o farol rotativo anticolisão.',
    spec: [['Eixo', 'Vertical'], ['Função', 'Estabilidade'], ['Par', 'Leme']],
  },
  leme: {
    nome: 'Leme de direção', sistema: 'Comandos de voo',
    onde: 'Atrás do estabilizador vertical.',
    funcao: 'Controla a guinada: mover o nariz para a esquerda ou para a direita, em torno do eixo vertical.',
    como: 'Pedal direito: o leme vai para a direita, a cauda vai para a esquerda e o nariz guina para a direita. Em voo, o leme coordena as curvas. Quem faz o avião curvar é a inclinação das asas.',
    manut: 'Conferir batentes, cabos e o movimento livre. No solo, os pedais também giram a roda do nariz.',
    curio: 'Em pouso com vento cruzado, o piloto usa leme e aileron em sentidos contrários para alinhar o avião à pista.',
    spec: [['Eixo', 'Vertical'], ['Movimento', 'Guinada'], ['Comando', 'Pedais']],
    ver: 'cockpit',
  },
  trem: {
    nome: 'Trem de pouso', sistema: 'Pouso',
    onde: 'Uma roda no nariz e duas sob a fuselagem.',
    funcao: 'Suporta o avião no solo, absorve o impacto do pouso e permite taxiar e frear.',
    como: 'Triciclo fixo. As rodas principais têm pernas de mola de aço; a do nariz tem um amortecedor de óleo e ar, chamado óleo-pneumático. Os freios são acionados pela ponta dos pedais.',
    manut: 'Calibrar pneus, procurar desgaste e cortes, conferir a extensão do amortecedor do nariz e vazamento de fluido de freio.',
    curio: 'Aviões maiores recolhem o trem em voo para reduzir o arrasto. O Cessna 172 é de trem fixo, mais simples e barato de manter.',
    spec: [['Tipo', 'Triciclo fixo'], ['Rodas', '3'], ['Freios', 'Disco hidráulico']],
  },
  pitot: {
    nome: 'Tubo de pitot', sistema: 'Instrumentos',
    onde: 'Sob a asa esquerda, apontado para frente.',
    funcao: 'Capta a pressão do ar de frente (pressão de impacto) para o velocímetro.',
    como: 'O velocímetro compara a pressão do pitot com a pressão estática (do ar parado). Quanto maior a diferença, maior a velocidade indicada.',
    manut: 'Retirar a capa protetora antes do voo e conferir se o furo está livre. Um inseto ou gelo dentro dele deixa o velocímetro errado.',
    curio: 'Aviões que voam em nuvens têm pitot com aquecimento elétrico para evitar gelo.',
    spec: [['Alimenta', 'Velocímetro'], ['Medida', 'Pressão total'], ['Lado', 'Asa esquerda']],
  },
  luzes: {
    nome: 'Luzes de navegação', sistema: 'Elétrico',
    onde: 'Vermelha na ponta da asa esquerda, verde na direita e branca na cauda.',
    funcao: 'Mostram aos outros pilotos para que lado o avião está indo, à noite.',
    como: 'Se você vê verde à esquerda e vermelho à direita, o avião vem na sua direção. Ver só a branca significa que ele se afasta.',
    manut: 'Testar todas as luzes no pré-voo noturno. Lâmpada queimada impede o voo noturno.',
    curio: 'O mesmo padrão de cores é usado em navios: vermelho a bombordo (esquerda) e verde a boreste (direita).',
    spec: [['Esquerda', 'Vermelha'], ['Direita', 'Verde'], ['Cauda', 'Branca']],
  },
};
const PART_ORDER = ['asa', 'aileron', 'flap', 'profundor', 'estabh', 'leme', 'estabv', 'fuselagem', 'cabine', 'motor', 'helice', 'trem', 'pitot', 'luzes'];

/* ---------------- Dados: lições ---------------- */
const LESSONS = [
  {
    t: 'Anatomia do avião', s: 'As cinco grandes partes',
    p: [
      'Todo avião se divide em cinco grandes conjuntos: <b>fuselagem</b> (o corpo), <b>asas</b> (geram sustentação), <b>empenagem</b> (a cauda), <b>trem de pouso</b> e <b>grupo motopropulsor</b> (motor e hélice).',
      'A empenagem reúne o estabilizador horizontal com o profundor e o estabilizador vertical com o leme. Os estabilizadores dão estabilidade; as partes móveis dão controle.',
    ],
    ex: 'No pré-voo do Cessna 172, o piloto dá a volta no avião nessa ordem: cabine, asa esquerda, nariz, asa direita e cauda.',
    q: 'Quais peças formam a empenagem?',
    o: ['Asas, flaps e ailerons', 'Estabilizadores, profundor e leme', 'Motor, hélice e capô', 'Rodas e amortecedores'], c: 1,
    why: 'Empenagem é o conjunto da cauda: estabilizador horizontal + profundor e estabilizador vertical + leme.',
    ver: ['pecas', 'Ver as peças no avião'],
  },
  {
    t: 'As quatro forças', s: 'Sustentação, peso, tração e arrasto',
    p: [
      'Quatro forças agem no avião o tempo todo. <b>Sustentação</b> empurra para cima e <b>peso</b> puxa para baixo. <b>Tração</b> puxa para frente e <b>arrasto</b> segura para trás.',
      'Em voo reto, nivelado e com velocidade constante, as forças estão em equilíbrio: sustentação igual ao peso e tração igual ao arrasto. Para subir, o piloto adiciona potência; para acelerar, a tração precisa superar o arrasto.',
    ],
    ex: 'Um Cessna 172 com 1.100 kg em cruzeiro precisa de cerca de 1.100 kgf de sustentação. A tração de cerca de 150 kgf vence o arrasto.',
    q: 'Em voo reto e nivelado, com velocidade constante, a sustentação é…',
    o: ['Maior que o peso', 'Igual ao peso', 'Menor que o peso', 'Igual à tração'], c: 1,
    why: 'Sem subir nem descer, as forças verticais se anulam: sustentação = peso.',
  },
  {
    t: 'Como a asa sustenta', s: 'Pressão, velocidade e ângulo de ataque',
    p: [
      'A asa desvia o ar para baixo e acelera o ar por cima dela. Ar mais rápido tem pressão menor (Bernoulli), e o ar empurrado para baixo empurra a asa para cima (Newton). As duas explicações descrevem o mesmo fenômeno.',
      'A fórmula é <span class="mono">L = ½·ρ·V²·S·C<sub>L</sub></span>. A velocidade entra ao quadrado: dobrar a velocidade multiplica a sustentação por 4. O C<sub>L</sub> cresce com o <b>ângulo de ataque</b>, o ângulo entre a asa e o vento, até uns 16°. Passando disso, o ar descola da asa e acontece o <b>estol</b>.',
    ],
    ex: 'Estol não tem a ver com o motor parar. É a asa perdendo sustentação por ângulo de ataque alto demais. A recuperação é baixar o nariz.',
    q: 'Se a velocidade dobrar, mantendo o resto igual, a sustentação fica…',
    o: ['Igual', '2 vezes maior', '4 vezes maior', 'Pela metade'], c: 2,
    why: 'A velocidade está ao quadrado na fórmula: 2² = 4.',
    ver: ['lab', 'Testar no túnel de vento'],
  },
  {
    t: 'Eixos e comandos', s: 'Rolagem, arfagem e guinada',
    p: [
      'O avião gira em torno de três eixos que passam pelo centro de gravidade. <b>Longitudinal</b> (do nariz à cauda): rolagem, feita pelos ailerons. <b>Lateral</b> (de ponta a ponta da asa): arfagem, feita pelo profundor. <b>Vertical</b>: guinada, feita pelo leme.',
      'No cockpit: manche para os lados mexe os ailerons, manche para frente e para trás mexe o profundor e os pedais mexem o leme.',
    ],
    ex: 'Para fazer uma curva à direita: manche para a direita até a inclinação desejada, um pouco de pedal direito para centralizar a bolinha e um pouco de manche para trás para não perder altura.',
    q: 'O que acontece ao pisar no pedal direito em voo?',
    o: ['O avião rola para a direita', 'O nariz guina para a direita', 'O nariz sobe', 'O flap desce'], c: 1,
    why: 'Pedal direito move o leme para a direita, e o nariz guina para a direita em torno do eixo vertical.',
    ver: ['cockpit', 'Praticar no cockpit'],
  },
  {
    t: 'O motor a pistão', s: 'Quatro tempos e dois magnetos',
    p: [
      'Cada cilindro trabalha em quatro tempos: <b>admissão</b> (entra mistura de ar e combustível), <b>compressão</b>, <b>combustão</b> (a faísca empurra o pistão) e <b>escape</b>.',
      'A ignição vem de dois magnetos, cada um com seu jogo de velas. Se um falhar, o outro mantém o motor funcionando. A manete de mistura ajusta a proporção de combustível: em altitude o ar é menos denso e a mistura precisa ser empobrecida.',
    ],
    ex: 'Em dias úmidos, o carburador pode formar gelo mesmo com 20 °C lá fora. Sinal: queda de RPM. A solução é puxar o aquecimento do carburador.',
    q: 'Por que o motor de avião tem dois magnetos?',
    o: ['Para gastar menos combustível', 'Para ter redundância e queima melhor', 'Para carregar a bateria', 'Para girar a hélice mais rápido'], c: 1,
    why: 'São dois sistemas de ignição independentes: se um falha, o motor continua, e duas faíscas por cilindro queimam a mistura melhor.',
    ver: ['pecas', 'Ver o motor'],
  },
  {
    t: 'Os seis instrumentos', s: 'O "six pack" do painel',
    p: [
      'Na linha de cima: <b>velocímetro</b>, <b>horizonte artificial</b> e <b>altímetro</b>. Na de baixo: <b>coordenador de curva</b>, <b>indicador de proa</b> (giro direcional) e <b>climb</b> (velocidade vertical).',
      'Três funcionam por pressão (sistema pitot-estático): velocímetro, altímetro e climb. Três funcionam por giroscópio: horizonte, proa e coordenador de curva.',
    ],
    ex: 'Se o tubo de pitot entupir, só o velocímetro erra. Se a tomada estática entupir, os três instrumentos de pressão erram.',
    q: 'Qual instrumento depende do tubo de pitot?',
    o: ['Altímetro', 'Velocímetro', 'Horizonte artificial', 'Indicador de proa'], c: 1,
    why: 'Só o velocímetro usa a pressão de impacto do pitot. Altímetro e climb usam apenas a pressão estática.',
    ver: ['cockpit', 'Ver os instrumentos'],
  },
  {
    t: 'Manutenção e pré-voo', s: 'Inspeção, drenos e cadernetas',
    p: [
      'Antes de todo voo, o piloto faz a inspeção externa seguindo o checklist: superfícies de comando, combustível, óleo, pneus, hélice, pitot e luzes.',
      'O mecânico faz as inspeções programadas: a cada 50 horas (óleo), 100 horas e anual. Tudo é registrado nas cadernetas de célula, motor e hélice. No Brasil, a inspeção anual de manutenção é a IAM.',
    ],
    ex: 'Drenar combustível: em cada dreno, recolher uma amostra num copinho transparente. Água fica no fundo, em bolhas. Drenar até sair só combustível azul (AVGAS 100LL).',
    q: 'Por que drenar combustível no pré-voo?',
    o: ['Para medir a quantidade', 'Para achar água ou sujeira no tanque', 'Para esfriar o motor', 'Para aliviar peso'], c: 1,
    why: 'Água é mais densa que a gasolina e se acumula no ponto mais baixo. No motor, ela causa falha.',
  },
  {
    t: 'Fases do voo', s: 'Do táxi ao pouso',
    p: [
      '<b>Táxi</b> com os pedais. <b>Decolagem</b>: potência máxima, rotação a 55 kt. <b>Subida</b> na Vy de 74 kt (melhor razão de subida). <b>Cruzeiro</b> por volta de 120 kt. <b>Descida</b> reduzindo potência.',
      '<b>Aproximação</b> com flaps a uns 65 kt, alinhado com a pista. Perto do chão vem o <b>arredondamento</b> (flare): o piloto puxa o manche aos poucos para tocar primeiro com as rodas principais, devagar.',
    ],
    ex: 'Se a aproximação não estiver estabilizada, o piloto arremete: potência máxima, nariz na atitude de subida e recolhe os flaps aos poucos.',
    q: 'O que é o arredondamento (flare)?',
    o: ['Curva para entrar na pista', 'Puxar o manche perto do chão para tocar devagar', 'Baixar os flaps', 'Reduzir para marcha lenta no cruzeiro'], c: 1,
    why: 'No flare o piloto levanta o nariz pouco antes do toque, reduzindo a razão de descida para pousar suave nas rodas principais.',
    ver: ['cockpit', 'Treinar a aproximação'],
  },
];

/* ---------------- Dados: glossário ---------------- */
const GLOSS = [
  ['Ângulo de ataque', 'angle of attack', 'Ângulo entre a corda da asa e o vento relativo. Passando do ângulo crítico, ocorre o estol.'],
  ['Arfagem', 'pitch', 'Movimento do nariz para cima e para baixo, em torno do eixo lateral.'],
  ['Rolagem', 'roll', 'Inclinação das asas para um lado, em torno do eixo longitudinal.'],
  ['Guinada', 'yaw', 'Movimento do nariz para a esquerda ou direita, em torno do eixo vertical.'],
  ['Estol', 'stall', 'Perda de sustentação quando o ar descola da asa por ângulo de ataque alto demais.'],
  ['Sustentação', 'lift', 'Força aerodinâmica perpendicular ao vento relativo, gerada principalmente pelas asas.'],
  ['Arrasto', 'drag', 'Força que se opõe ao movimento do avião através do ar.'],
  ['Tração', 'thrust', 'Força que move o avião para frente, gerada pela hélice ou pela turbina.'],
  ['Bordo de ataque', 'leading edge', 'A borda da frente da asa, que encontra o ar primeiro.'],
  ['Bordo de fuga', 'trailing edge', 'A borda de trás da asa, onde ficam flaps e ailerons.'],
  ['Corda', 'chord', 'Linha reta do bordo de ataque ao bordo de fuga de um perfil.'],
  ['Envergadura', 'wingspan', 'Distância de uma ponta de asa à outra.'],
  ['Empenagem', 'empennage', 'Conjunto da cauda: estabilizadores, profundor e leme.'],
  ['Compensador', 'trim tab', 'Pequena superfície que alivia a força no manche e mantém a atitude.'],
  ['Manete', 'throttle', 'Alavanca que controla a potência do motor.'],
  ['Mistura', 'mixture', 'Comando que ajusta a proporção entre ar e combustível.'],
  ['Magneto', 'magneto', 'Gerador que produz a faísca das velas sem depender da bateria.'],
  ['Proa', 'heading', 'Direção para onde o nariz aponta, em graus magnéticos.'],
  ['Nó', 'knot (kt)', 'Unidade de velocidade: uma milha náutica por hora, 1,852 km/h.'],
  ['Pé', 'foot (ft)', 'Unidade de altitude: 0,3048 m. 1.000 ft são cerca de 305 m.'],
  ['VFE', 'max flap extended speed', 'Velocidade máxima com flaps baixados. Topo do arco branco no velocímetro.'],
  ['Vy', 'best rate of climb', 'Velocidade de melhor razão de subida: mais altura em menos tempo.'],
  ['Arremetida', 'go-around', 'Interromper o pouso e subir de novo para tentar outra aproximação.'],
  ['Arredondamento', 'flare', 'Levantar o nariz pouco antes do toque para pousar suave.'],
  ['Pré-voo', 'preflight', 'Inspeção da aeronave seguindo o checklist antes de cada voo.'],
  ['CG', 'center of gravity', 'Centro de gravidade: ponto onde o peso do avião se concentra.'],
  ['APU', 'auxiliary power unit', 'Pequena turbina na cauda dos jatos que gera energia e ar comprimido com os motores desligados.'],
  ['Slat', 'slat', 'Superfície no bordo de ataque que desliza para frente e atrasa o estol.'],
  ['Spoiler', 'spoiler', 'Painel em cima da asa que sobe para frear o avião e reduzir a sustentação.'],
  ['Winglet', 'winglet', 'Ponta de asa curvada para cima que reduz o arrasto induzido.'],
  ['Turbofan', 'turbofan', 'Motor a jato com um fan grande na frente; a maior parte do ar passa por fora do núcleo.'],
  ['Fly-by-wire', 'fly-by-wire', 'Comandos elétricos: o manche manda sinais a computadores, que movem as superfícies.'],
  ['Sidestick', 'sidestick', 'Manche lateral, pequeno, usado nos aviões fly-by-wire da Airbus e da Embraer.'],
  ['Enflechamento', 'sweep', 'Inclinação da asa para trás, que permite voar mais perto da velocidade do som.'],
];

/* ---------------- Abas ---------------- */
const TABS = ['pecas', 'escola', 'cockpit', 'lab', 'glossario', 'catalogo'];
let current = null;
function showTab(id, push) {
  if (typeof hideHint === 'function') hideHint();
  if (!TABS.includes(id)) id = 'pecas';
  current = id;
  $$('.view').forEach((v) => { v.hidden = v.dataset.view !== id; });
  $$('.tab').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.tab === id)));
  if (push) { try { history.replaceState(null, '', '#' + id); } catch {} }
  if (id === 'cockpit') { sizeGauges(); startSim(); }
  if (id === 'lab') { sizeTunnel(); startTunnel(); }
  window.scrollTo({ top: 0 });
}
document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-tab]');
  if (!a) return;
  e.preventDefault();
  if (a.dataset.ck && CK[a.dataset.ck] && a.dataset.ck !== ck) setCockpit(a.dataset.ck);
  showTab(a.dataset.tab, true);
});

/* ---------------- A · Explorador ---------------- */
// O Cessna é desenhado à mão no HTML; os jatos vêm de avioes.js, gerados a partir das medidas reais.
const CRAFTS = {
  c172: {
    id: 'c172', nome: 'Cessna 172', sub: 'Treinamento · 4 lugares', parts: PARTS, order: PART_ORDER,
    lede: 'O Cessna 172 é o avião de treinamento mais fabricado da história. Ligue o raio‑X para ver combustível, cabos de comando e fiação.',
    specs: { fab: 'Cessna (EUA)', voo: '1955', env: '11,00 m', comp: '8,28 m', alt: '2,72 m', pmd: '1.157 kg', mot: '1 × Lycoming IO-360 (180 hp)', pax: '3 + piloto', cru: '124 kt · 230 km/h', alc: '1.180 km', teto: '14.000 ft' },
  },
};
(window.HangarJets ? HangarJets.list : []).forEach((a) => { CRAFTS[a.id] = { ...a, parts: HangarJets.parts(a), order: HangarJets.order(a) }; });
const SPEC_ROWS = [['fab', 'Fabricante'], ['voo', 'Primeiro voo'], ['env', 'Envergadura'], ['comp', 'Comprimento'], ['alt', 'Altura'], ['pmd', 'Peso máx. de decolagem'], ['mot', 'Motores'], ['pax', 'Passageiros'], ['cru', 'Cruzeiro'], ['alc', 'Alcance'], ['teto', 'Teto']];
let craft = 'c172', selPart = null, planeView = 'top';
const cur = () => CRAFTS[craft];
const holder = () => (craft === 'c172' ? $('#c172Views') : $('#jetViews'));

function renderChips() {
  const c = cur();
  $('#partChips').innerHTML = c.order.map((k) =>
    `<button type="button" class="chip" data-chip="${k}" aria-pressed="false">${c.parts[k].nome.replace(/ \(.*\)/, '')}</button>`).join('');
}
function renderCrafts() {
  $('#craftList').innerHTML = Object.values(CRAFTS).map((c) =>
    `<button type="button" class="craft" data-craft="${c.id}" aria-pressed="${c.id === craft}"><b>${c.nome}</b><span>${c.sub}</span></button>`).join('');
  const sp = cur().specs;
  $('#craftSpecs').innerHTML = [['env', 'Envergadura'], ['comp', 'Comprimento'], ['pmd', 'Peso máx.'], ['pax', 'Passageiros'], ['cru', 'Cruzeiro'], ['mot', 'Motores']]
    .map(([k, t]) => `<div><span class="label">${t}</span><b>${sp[k]}</b></div>`).join('');
  const list = Object.values(CRAFTS);
  $('#compareTable').innerHTML = `<thead><tr><th></th>${list.map((c) => `<th class="${c.id === craft ? 'is-cur' : ''}">${c.nome}</th>`).join('')}</tr></thead>
    <tbody>${SPEC_ROWS.map(([k, t]) => `<tr><th scope="row">${t}</th>${list.map((c) => `<td class="${c.id === craft ? 'is-cur' : ''}">${c.specs[k]}</td>`).join('')}</tr>`).join('')}</tbody>`;
}
function setCraft(id) {
  if (!CRAFTS[id]) return;
  craft = id;
  const c = cur();
  $('#c172Views').hidden = id !== 'c172';
  $('#jetViews').hidden = id === 'c172';
  if (id !== 'c172') $('#jetViews').innerHTML = HangarJets.top(c) + HangarJets.side(c) + HangarJets.front(c) + HangarJets.engine(c) + HangarJets.gear(c);
  $('#craftLede').textContent = c.lede;
  $('#frontBtn').hidden = id !== 'b747';
  $('#engineBtn').hidden = id !== 'b747';
  $('#gearBtn').hidden = id !== 'b747';
  if (id !== 'b747' && ['front', 'engine', 'gear'].includes(planeView)) planeView = 'top';
  renderCrafts(); renderChips();
  applyXray(); setPlaneView(planeView);
  selectPart(c.parts[selPart] ? selPart : 'asa');
}
function selectPart(id, open) {
  const p = cur().parts[id];
  if (!p) return;
  selPart = id;
  // No 747, os slats abrem a vista frontal; motor e trem abrem as vistas detalhadas. Peça que não aparece na vista atual: volta para a de cima.
  const detail = craft === 'b747' && { motor: 'engine', trem: 'gear' }[p.pai || id];
  if (craft === 'b747' && id === 'slat') setPlaneView('front');
  else if (detail) setPlaneView(detail);
  else if (planeView !== 'top' && !holder().querySelector(`[data-pv="${planeView}"] [data-part="${id}"]`)) setPlaneView('top');
  $$('.part', holder()).forEach((g) => g.classList.toggle('is-sel', g.dataset.part === id));
  $$('.chip', $('#partChips')).forEach((ch) => ch.setAttribute('aria-pressed', String(ch.dataset.chip === (p.pai || id))));
  const subs = Object.entries(cur().parts).filter(([, v]) => v.pai === id);
  $('#partInfo').innerHTML = `
    ${p.pai ? `<button type="button" class="link-btn" data-sub="${p.pai}">← ${cur().parts[p.pai].nome}</button>` : ''}
    <div><span class="part-info__tag">${p.sistema}</span> <span class="small">${cur().nome}</span></div>
    <h2>${p.nome}</h2>
    <div class="spec">${p.spec.map(([k, v]) => `<div><span class="label">${k}</span><b>${v}</b></div>`).join('')}</div>
    <dl class="facts">
      <div><dt>Onde fica</dt><dd>${p.onde}</dd></div>
      <div><dt>Para que serve</dt><dd>${p.funcao}</dd></div>
      <div><dt>Como funciona</dt><dd>${p.como}</dd></div>
      <div><dt>Manutenção</dt><dd>${p.manut}</dd></div>
    </dl>
    <p class="tip"><b>Curiosidade.</b> ${p.curio}</p>
    ${subs.length ? `<div class="subparts"><span class="label">Partes no desenho</span><div class="chips">${subs.map(([k, v]) => `<button type="button" class="chip" data-sub="${k}"><b>${v.num}</b> ${v.nome}</button>`).join('')}</div></div>` : ''}
    ${p.ver ? `<button type="button" class="link-btn" data-tab="${p.ver}" data-ck="${craft}">${p.ver === 'lab' ? 'Ver a asa no túnel de vento' : 'Ver em ação no cockpit'} →</button>` : ''}`;
  if (open) showHint();
}

/* No celular a ficha fica embaixo do desenho: ao tocar numa peça, uma seta no canto avisa para descer a tela. */
const hintMQ = window.matchMedia('(max-width: 900px)');
let hintObs = null;
function showHint() {
  if (!hintMQ.matches) return;
  const r = $('#partInfo').getBoundingClientRect();
  if (r.top < innerHeight - 120) return;           // a ficha já está aparecendo
  $('#scrollHint').hidden = false;
  if (!hintObs && 'IntersectionObserver' in window) {
    hintObs = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) hideHint(); }, { rootMargin: '0px 0px -120px 0px' });
    hintObs.observe($('#partInfo'));
  }
}
function hideHint() { $('#scrollHint').hidden = true; }
$('#scrollHint').addEventListener('click', () => {
  hideHint();
  $('#partInfo').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
});
hintMQ.addEventListener?.('change', () => { if (!hintMQ.matches) hideHint(); });
function setPlaneView(v) {
  planeView = v;
  $$('[data-pv]', holder()).forEach((svg) => svg.toggleAttribute('hidden', svg.dataset.pv !== v));
  $('#xrayLabel').hidden = v !== 'top';
  $$('#viewSeg button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.pview === v)));
}
function applyXray() {
  const on = $('#xrayToggle').checked;
  $$('.xray', holder()).forEach((x) => x.toggleAttribute('hidden', !on));
  $$('.airframe', holder()).forEach((x) => x.classList.toggle('is-xray', on));
}
$('#viewSeg').addEventListener('click', (e) => {
  const b = e.target.closest('[data-pview]');
  if (b) setPlaneView(b.dataset.pview);
});
$('#craftList').addEventListener('click', (e) => {
  const b = e.target.closest('[data-craft]');
  if (b) setCraft(b.dataset.craft);
});
const planeCard = $('.plane-card');
planeCard.addEventListener('click', (e) => {
  const g = e.target.closest('svg [data-part]');
  if (g) selectPart(g.dataset.part, true);
});
planeCard.addEventListener('keydown', (e) => {
  const g = e.target.closest('svg [data-part]');
  if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); selectPart(g.dataset.part, true); }
});
$('#partInfo').addEventListener('click', (e) => {
  const b = e.target.closest('[data-sub]');
  if (b) selectPart(b.dataset.sub, true);
});
$('#partChips').addEventListener('click', (e) => {
  const c = e.target.closest('[data-chip]');
  if (c) selectPart(c.dataset.chip, true);
});
$('#xrayToggle').addEventListener('change', applyXray);

/* ---------------- B · Escola ---------------- */
let done = store.get('hangar-done', []);
let lessonIdx = store.get('hangar-lesson', 0);
function renderProgress() {
  $('#progressTxt').textContent = `${done.length}/${LESSONS.length} lições`;
  $('#progressBar').style.width = (done.length / LESSONS.length * 100) + '%';
}
function renderModules() {
  $('#moduleList').innerHTML = LESSONS.map((l, i) => `
    <li><button type="button" class="mod${done.includes(i) ? ' is-done' : ''}" data-mod="${i}" aria-current="${i === lessonIdx}">
      <span class="mod__n">${done.includes(i) ? '✓' : i + 1}</span>
      <span class="mod__t">${l.t}<span class="mod__s">${l.s}</span></span>
    </button></li>`).join('');
}
function renderLesson() {
  const l = LESSONS[lessonIdx];
  $('#lesson').innerHTML = `
    <p class="eyebrow">Módulo ${lessonIdx + 1} de ${LESSONS.length}</p>
    <h2>${l.t}</h2>
    <div class="lesson__body">${l.p.map((t) => `<p>${t}</p>`).join('')}</div>
    <div class="example"><span class="label">Exemplo prático</span><p>${l.ex}</p></div>
    ${l.ver ? `<button type="button" class="link-btn" data-tab="${l.ver[0]}">${l.ver[1]} →</button>` : ''}
    <div class="quiz">
      <span class="label">Pergunta</span>
      <p class="quiz__q">${l.q}</p>
      <div class="opts">${l.o.map((o, i) => `<button type="button" class="opt" data-opt="${i}">${o}</button>`).join('')}</div>
      <p class="feedback" id="feedback" aria-live="polite"></p>
    </div>
    <div class="lesson__nav">
      <button type="button" class="btn-ghost" data-step="-1" ${lessonIdx === 0 ? 'disabled' : ''}>← Anterior</button>
      <button type="button" class="btn" data-step="1" ${lessonIdx === LESSONS.length - 1 ? 'disabled' : ''}>Próximo módulo →</button>
    </div>`;
}
function goLesson(i) {
  lessonIdx = clamp(i, 0, LESSONS.length - 1);
  store.set('hangar-lesson', lessonIdx);
  renderModules(); renderLesson();
}
$('#moduleList').addEventListener('click', (e) => {
  const b = e.target.closest('[data-mod]');
  if (b) goLesson(+b.dataset.mod);
});
$('#lesson').addEventListener('click', (e) => {
  const s = e.target.closest('[data-step]');
  if (s) { goLesson(lessonIdx + +s.dataset.step); return; }
  const o = e.target.closest('[data-opt]');
  if (!o) return;
  const l = LESSONS[lessonIdx];
  const right = +o.dataset.opt === l.c;
  $$('.opt', $('#lesson')).forEach((b) => b.classList.remove('is-right', 'is-wrong'));
  o.classList.add(right ? 'is-right' : 'is-wrong');
  const fb = $('#feedback');
  fb.className = 'feedback ' + (right ? 'ok' : 'bad');
  fb.textContent = right ? `Certo! ${l.why}` : 'Ainda não. Releia o texto e tente outra opção.';
  if (right && !done.includes(lessonIdx)) {
    done.push(lessonIdx); store.set('hangar-done', done); renderProgress(); renderModules();
  }
});

/* ---------------- C · Cockpit ---------------- */
const sim = { pitch: 2, bank: 0, hdg: 90, alt: 3000, spd: 100, fpm: 0, turn: 0, ball: 0, stalled: false };
const ctl = { elev: 0, ail: 0, rud: 0, thr: 0.6, flaps: 0, sb: 0, gearDown: 1 };
const SCN = {
  cruzeiro: { s: { pitch: 2, bank: 0, alt: 4500, spd: 110 }, c: { elev: 0, ail: 0, rud: 0, thr: 0.65, flaps: 0 } },
  pouso: { s: { pitch: 0, bank: 0, alt: 1000, spd: 68 }, c: { elev: 0, ail: 0, rud: 0, thr: 0.25, flaps: 30 } },
  estol: { s: { pitch: 8, bank: 0, alt: 5000, spd: 62 }, c: { elev: 0.8, ail: 0, rud: 0, thr: 0, flaps: 0 } },
};
function syncControls() {
  $('#cElev').value = Math.round(ctl.elev * 100);
  $('#cAil').value = Math.round(ctl.ail * 100);
  $('#cRud').value = Math.round(ctl.rud * 100);
  $('#cThr').value = Math.round(ctl.thr * 100);
  $('#cSb').value = Math.round(ctl.sb * 100);
  $$('#flapSeg button').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.flap === ctl.flaps)));
  $$('#gearSeg button').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.gear === ctl.gearDown)));
  readControls();
}
function readControls() {
  ctl.elev = $('#cElev').value / 100;
  ctl.ail = $('#cAil').value / 100;
  ctl.rud = $('#cRud').value / 100;
  ctl.thr = $('#cThr').value / 100;
  ctl.sb = $('#cSb').value / 100;
  $('#oElev').textContent = signed($('#cElev').value);
  $('#oAil').textContent = signed($('#cAil').value);
  $('#oRud').textContent = signed($('#cRud').value);
  $('#oThr').textContent = C().n1 ? `N1 ${fmt(C().n1(), 0)}%` : $('#cThr').value + '%';
  $('#oSb').textContent = $('#cSb').value + '%';
  if (C().trimText) $('#oTrim').textContent = C().trimText();
}
const signed = (v) => (v > 0 ? '+' : '') + v;
['#cElev', '#cAil', '#cRud', '#cThr', '#cSb'].forEach((s) => $(s).addEventListener('input', readControls));
$('#flapSeg').addEventListener('click', (e) => {
  const b = e.target.closest('[data-flap]');
  if (!b) return;
  ctl.flaps = +b.dataset.flap; syncControls();
});
$('#gearSeg').addEventListener('click', (e) => {
  const b = e.target.closest('[data-gear]');
  if (!b) return;
  ctl.gearDown = +b.dataset.gear; syncControls();
});
$('#trimBtn').addEventListener('click', () => { if (C().trim) { C().trim(); syncControls(); } });
$('#centerBtn').addEventListener('click', () => { ctl.elev = 0; ctl.ail = 0; ctl.rud = 0; syncControls(); });
$('#scnSeg').addEventListener('click', (e) => {
  const b = e.target.closest('[data-scn]');
  if (!b) return;
  C().start(b.dataset.scn); syncControls(); explain();
});

const stallSpeed = () => (48 - ctl.flaps * 0.27) / Math.sqrt(Math.max(0.3, Math.cos(sim.bank * Math.PI / 180)));
function step(dt) {
  const vs = stallSpeed();
  if (!sim.stalled && sim.spd < vs && sim.alt > 0) sim.stalled = true;
  if (sim.stalled && sim.spd > vs + 6 && ctl.elev < 0.3) sim.stalled = false;
  const targetPitch = sim.stalled ? -10 : 2 + ctl.elev * 14;
  sim.pitch += (targetPitch - sim.pitch) * dt * (sim.stalled ? 0.9 : 1.2);
  sim.bank += (ctl.ail * 45 - sim.bank) * dt * 0.8;
  if (sim.stalled) sim.bank += Math.sin(performance.now() / 300) * dt * 6;
  const veq = 42 + ctl.thr * 95 - sim.pitch * 3.2 - ctl.flaps * 0.55;
  sim.spd = clamp(sim.spd + (veq - sim.spd) * dt * 0.35, 0, 175);
  let fpm = sim.spd * 1.6878 * Math.sin((sim.pitch - 2) * Math.PI / 180) * 60 + (ctl.thr - 0.6) * 900 - ctl.flaps * 6;
  if (sim.stalled) fpm = Math.min(fpm, -1400);
  sim.fpm += (fpm - sim.fpm) * dt * 1.5;
  sim.alt = clamp(sim.alt + sim.fpm / 60 * dt, 0, 18000);
  if (sim.alt === 0 && sim.fpm < 0) sim.fpm = 0;
  sim.turn = sim.spd > 5 ? 1091 * Math.tan(sim.bank * Math.PI / 180) / sim.spd + ctl.rud * 2.5 : 0;
  sim.hdg = (sim.hdg + sim.turn * dt + 360) % 360;
  sim.ball += (clamp(sim.bank / 45 * 0.5 - ctl.rud * 0.8, -1, 1) - sim.ball) * dt * 3;
}

let gctx, gW = 0, gH = 0, gCols = 3;
function sizeC172(w) { gCols = w < 460 ? 2 : 3; return Math.round(w / gCols * (6 / gCols) * 1.02); }
function sizeGauges() {
  const cv = $('#gauges');
  const w = cv.clientWidth || 600;
  const dpr = window.devicePixelRatio || 1;
  gW = w; gH = C().size(w);
  cv.width = w * dpr; cv.height = gH * dpr; cv.style.height = gH + 'px';
  gctx = cv.getContext('2d');
  gctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
const D2R = Math.PI / 180;
function bezel(c, r, title) {
  c.save();
  c.fillStyle = '#0a0f13'; c.beginPath(); c.arc(0, 0, r + 4, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#121a20'; c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#8796a2'; c.font = `500 ${Math.max(9, r * 0.11)}px "IBM Plex Mono", monospace`; c.textAlign = 'center';
  c.fillText(title, 0, r + 4 + Math.max(12, r * 0.16));
  c.restore();
}
function ticks(c, r, from, to, n, len, color, width) {
  c.strokeStyle = color; c.lineWidth = width;
  for (let i = 0; i <= n; i++) {
    const a = (from + (to - from) * i / n - 90) * D2R;
    c.beginPath(); c.moveTo(Math.cos(a) * r, Math.sin(a) * r); c.lineTo(Math.cos(a) * (r - len), Math.sin(a) * (r - len)); c.stroke();
  }
}
function needle(c, ang, len, w, color) {
  c.save(); c.rotate(ang * D2R); c.fillStyle = color;
  c.beginPath(); c.moveTo(-w, 0); c.lineTo(0, -len); c.lineTo(w, 0); c.lineTo(0, len * 0.15); c.closePath(); c.fill(); c.restore();
}
function label(c, txt, x, y, size, color) {
  c.fillStyle = color; c.font = `500 ${size}px "IBM Plex Mono", monospace`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, x, y);
}
function arcBand(c, r, a0, a1, color, w) {
  c.strokeStyle = color; c.lineWidth = w; c.beginPath(); c.arc(0, 0, r, (a0 - 90) * D2R, (a1 - 90) * D2R); c.stroke();
}
const ASI = (kt) => -150 + clamp(kt, 0, 200) / 200 * 300;
function drawAirspeed(c, r) {
  bezel(c, r, 'VELOCÍMETRO · kt');
  arcBand(c, r * 0.86, ASI(40), ASI(85), '#e8edf0', r * 0.06);
  arcBand(c, r * 0.78, ASI(48), ASI(129), '#3fae5c', r * 0.07);
  arcBand(c, r * 0.78, ASI(129), ASI(163), '#e2b33c', r * 0.07);
  c.save(); c.rotate(ASI(163) * D2R); c.fillStyle = '#e0473c'; c.fillRect(-1.5, -r * 0.95, 3, r * 0.2); c.restore();
  ticks(c, r * 0.95, -150, 150, 20, r * 0.1, '#e8edf0', 1.4);
  for (let k = 0; k <= 200; k += 40) { const a = (ASI(k) - 90) * D2R; label(c, k, Math.cos(a) * r * 0.62, Math.sin(a) * r * 0.62, r * 0.13, '#e8edf0'); }
  needle(c, ASI(sim.spd), r * 0.85, r * 0.05, '#ffffff');
  label(c, fmt(sim.spd), 0, r * 0.35, r * 0.15, '#f06aae');
}
function drawAttitude(c, r) {
  bezel(c, r, 'HORIZONTE ARTIFICIAL');
  c.save(); c.beginPath(); c.arc(0, 0, r * 0.92, 0, Math.PI * 2); c.clip();
  c.rotate(-sim.bank * D2R);
  const k = r / 25;
  c.translate(0, sim.pitch * k);
  c.fillStyle = '#3f7fc4'; c.fillRect(-r * 2, -r * 3, r * 4, r * 3);
  c.fillStyle = '#8a5a32'; c.fillRect(-r * 2, 0, r * 4, r * 3);
  c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.moveTo(-r * 2, 0); c.lineTo(r * 2, 0); c.stroke();
  c.lineWidth = 1.3;
  for (let p = -20; p <= 20; p += 5) {
    if (!p) continue;
    const w = p % 10 ? r * 0.15 : r * 0.3;
    c.beginPath(); c.moveTo(-w, -p * k); c.lineTo(w, -p * k); c.stroke();
    if (!(p % 10)) label(c, Math.abs(p), w + r * 0.12, -p * k, r * 0.1, '#fff');
  }
  c.restore();
  c.save(); c.rotate(-sim.bank * D2R); c.strokeStyle = '#fff'; c.lineWidth = 1.5;
  [-60, -45, -30, -20, -10, 10, 20, 30, 45, 60].forEach((a) => {
    c.save(); c.rotate(a * D2R); c.beginPath(); c.moveTo(0, -r * 0.92); c.lineTo(0, -r * (Math.abs(a) % 30 ? 0.84 : 0.8)); c.stroke(); c.restore();
  });
  c.restore();
  c.fillStyle = '#ffb000';
  c.beginPath(); c.moveTo(0, -r * 0.8); c.lineTo(-r * 0.06, -r * 0.7); c.lineTo(r * 0.06, -r * 0.7); c.fill();
  c.fillRect(-r * 0.55, -2, r * 0.32, 4); c.fillRect(r * 0.23, -2, r * 0.32, 4);
  c.beginPath(); c.arc(0, 0, 4, 0, Math.PI * 2); c.fill();
}
function drawAltimeter(c, r) {
  bezel(c, r, 'ALTÍMETRO · ft');
  ticks(c, r * 0.95, 0, 360, 50, r * 0.08, '#e8edf0', 1.2);
  ticks(c, r * 0.95, 0, 360, 10, r * 0.15, '#e8edf0', 2);
  for (let i = 0; i < 10; i++) { const a = (i * 36 - 90) * D2R; label(c, i, Math.cos(a) * r * 0.66, Math.sin(a) * r * 0.66, r * 0.16, '#e8edf0'); }
  needle(c, (sim.alt % 10000) / 10000 * 360, r * 0.5, r * 0.07, '#cfd6db');
  needle(c, (sim.alt % 1000) / 1000 * 360, r * 0.85, r * 0.045, '#ffffff');
  c.fillStyle = '#0a0f13'; c.fillRect(-r * 0.34, r * 0.36, r * 0.68, r * 0.2);
  label(c, fmt(Math.round(sim.alt / 10) * 10) + ' ft', 0, r * 0.46, r * 0.12, '#f06aae');
}
function drawTurn(c, r) {
  bezel(c, r, 'COORDENADOR DE CURVA');
  c.strokeStyle = '#e8edf0'; c.lineWidth = 2;
  [-20, 0, 20].forEach((a) => { c.save(); c.rotate((a + 90) * D2R); c.beginPath(); c.moveTo(r * 0.62, 0); c.lineTo(r * 0.8, 0); c.stroke(); c.restore(); });
  [-20, 20].forEach((a) => { c.save(); c.rotate((a - 90) * D2R); c.beginPath(); c.moveTo(r * 0.62, 0); c.lineTo(r * 0.8, 0); c.stroke(); c.restore(); });
  label(c, 'E', -r * 0.68, r * 0.4, r * 0.12, '#e8edf0'); label(c, 'D', r * 0.68, r * 0.4, r * 0.12, '#e8edf0');
  label(c, '2 MIN', 0, -r * 0.45, r * 0.1, '#8796a2');
  c.save(); c.rotate(clamp(sim.turn / 3 * 20, -40, 40) * D2R); c.fillStyle = '#fff';
  c.fillRect(-r * 0.62, -2.5, r * 1.24, 5); c.beginPath(); c.arc(0, 0, r * 0.1, 0, Math.PI * 2); c.fill(); c.fillRect(-2, -r * 0.24, 4, r * 0.18);
  c.restore();
  const tw = r * 0.9, th = r * 0.16, ty = r * 0.5;
  c.fillStyle = '#25313a'; c.beginPath(); c.roundRect ? c.roundRect(-tw / 2, ty, tw, th, th / 2) : c.rect(-tw / 2, ty, tw, th); c.fill();
  c.strokeStyle = '#8796a2'; c.lineWidth = 1.2; c.beginPath();
  c.moveTo(-th * 0.6, ty); c.lineTo(-th * 0.6, ty + th); c.moveTo(th * 0.6, ty); c.lineTo(th * 0.6, ty + th); c.stroke();
  c.fillStyle = '#0a0f13'; c.beginPath(); c.arc(sim.ball * (tw / 2 - th / 2), ty + th / 2, th * 0.42, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#e8edf0'; c.stroke();
}
function drawHeading(c, r) {
  bezel(c, r, 'INDICADOR DE PROA');
  c.save(); c.rotate(-sim.hdg * D2R);
  for (let a = 0; a < 360; a += 5) {
    c.save(); c.rotate(a * D2R); c.strokeStyle = '#e8edf0'; c.lineWidth = a % 30 ? 1 : 2;
    c.beginPath(); c.moveTo(0, -r * 0.92); c.lineTo(0, -r * (a % 10 ? 0.86 : 0.8)); c.stroke();
    if (!(a % 30)) {
      const t = { 0: 'N', 90: 'E', 180: 'S', 270: 'W' }[a] || String(a / 10);
      label(c, t, 0, -r * 0.66, r * (t.length === 1 && isNaN(t) ? 0.17 : 0.12), isNaN(t) ? '#f06aae' : '#e8edf0');
    }
    c.restore();
  }
  c.restore();
  c.fillStyle = '#ffb000';
  c.beginPath(); c.moveTo(0, -r * 0.3); c.lineTo(-r * 0.2, r * 0.2); c.lineTo(0, r * 0.1); c.lineTo(r * 0.2, r * 0.2); c.closePath(); c.fill();
  c.fillRect(-1.5, -r * 0.98, 3, r * 0.12);
  label(c, String(Math.round(sim.hdg) % 360).padStart(3, '0') + '°', 0, r * 0.45, r * 0.13, '#f06aae');
}
const VSI = (f) => -90 + clamp(f, -2000, 2000) / 2000 * 170;
function drawVsi(c, r) {
  bezel(c, r, 'CLIMB · ft/min');
  ticks(c, r * 0.95, -260, 80, 20, r * 0.1, '#e8edf0', 1.3);
  [-2000, -1000, 0, 1000, 2000].forEach((f) => { const a = (VSI(f) - 90) * D2R; label(c, Math.abs(f / 100) || 0, Math.cos(a) * r * 0.64, Math.sin(a) * r * 0.64, r * 0.14, '#e8edf0'); });
  label(c, '↑ SOBE', r * 0.05, -r * 0.3, r * 0.1, '#8796a2'); label(c, '↓ DESCE', r * 0.05, r * 0.3, r * 0.1, '#8796a2');
  needle(c, VSI(sim.fpm), r * 0.85, r * 0.05, '#ffffff');
}
const GAUGES = [drawAirspeed, drawAttitude, drawAltimeter, drawTurn, drawHeading, drawVsi];
function drawPanel() {
  const c = gctx; if (!c) return;
  c.clearRect(0, 0, gW, gH);
  const cw = gW / gCols, rows = 6 / gCols, ch = gH / rows;
  const r = Math.min(cw, ch) * 0.38;
  GAUGES.forEach((fn, i) => {
    const col = i % gCols, row = Math.floor(i / gCols);
    c.save(); c.translate(col * cw + cw / 2, row * ch + ch / 2 - r * 0.08); fn(c, r); c.restore();
  });
}
function drawMinis() {
  $('#sideGroup').setAttribute('transform', `rotate(${(-sim.pitch).toFixed(2)} 180 64)`);
  $('#sideElev').setAttribute('transform', `rotate(${(ctl.elev * 25).toFixed(1)} 43 62.5)`);
  // Hélice: a pá gira (encurta e alonga) dentro do disco, mais rápido com mais potência.
  propAng = (propAng + 20 + ctl.thr * 40) % 360;
  const len = 30 * Math.cos(propAng * D2R);
  $('#sideBlade').setAttribute('d', `M287.5 ${(70 - len).toFixed(1)} L287.5 ${(70 + len).toFixed(1)}`);
  $('#rearGroup').setAttribute('transform', `rotate(${sim.bank.toFixed(2)} 150 64)`);
  const dl = -ctl.ail * 8, dr = ctl.ail * 8;
  $('#ailL').setAttribute('d', `M22 40.6 L72 42.9 L72 ${(42.9 - dl).toFixed(1)} L22 ${(40.6 - dl).toFixed(1)} Z`);
  $('#ailR').setAttribute('d', `M228 42.9 L278 40.6 L278 ${(40.6 - dr).toFixed(1)} L228 ${(42.9 - dr).toFixed(1)} Z`);
  $('#rudR').setAttribute('transform', `translate(${(ctl.rud * 5).toFixed(1)} 0)`);
}
let propAng = 0;
let lastExplain = '';
function explainC172() {
  const L = [];
  const vs = Math.round(stallSpeed());
  if (sim.stalled) L.push(['warn', `ESTOL. O ângulo de ataque passou do limite e a asa perdeu sustentação. Recupere: empurre o manche, aplique potência e nivele as asas.`]);
  else if (sim.spd < vs + 8) L.push(['warn', `Velocidade perto do estol (${vs} kt nesta configuração). Baixe o nariz ou aumente a potência.`]);
  if (ctl.elev > 0.08) L.push(['', 'Manche puxado: o profundor sobe, o vento empurra a cauda para baixo e o nariz sobe. A velocidade cai.']);
  else if (ctl.elev < -0.08) L.push(['', 'Manche empurrado: o profundor desce, a cauda sobe e o nariz desce. O avião ganha velocidade.']);
  if (Math.abs(ctl.ail) > 0.08) {
    const d = ctl.ail > 0 ? 'direita' : 'esquerda', o = ctl.ail > 0 ? 'esquerda' : 'direita';
    L.push(['', `Manche à ${d}: o aileron da ${d} sobe e o da ${o} desce. A asa ${o} ganha sustentação e o avião inclina para a ${d}.`]);
  }
  if (Math.abs(sim.bank) > 5) L.push(['', `Inclinado ${fmt(Math.abs(sim.bank))}°: parte da sustentação puxa o avião para o lado e ele curva ${fmt(Math.abs(sim.turn), 1)}°/s. A curva padrão é 3°/s (360° em 2 min).`]);
  if (Math.abs(ctl.rud) > 0.08) L.push(['', `Pedal ${ctl.rud > 0 ? 'direito' : 'esquerdo'}: o leme desvia o ar e o nariz guina para a ${ctl.rud > 0 ? 'direita' : 'esquerda'}.`]);
  if (Math.abs(sim.ball) > 0.25) L.push(['', `A bolinha do coordenador está para a ${sim.ball > 0 ? 'direita' : 'esquerda'}: a curva está descoordenada. Pise no pedal do lado da bola.`]);
  if (ctl.flaps) L.push(['', `Flaps em ${ctl.flaps}°: mais sustentação e mais arrasto. O estol cai para cerca de ${vs} kt, bom para pousar devagar.`]);
  if (ctl.thr > 0.85) L.push(['', 'Potência alta: mais tração. Com o nariz na mesma posição, o avião sobe.']);
  else if (ctl.thr < 0.2) L.push(['', 'Potência reduzida: menos tração. Para manter a velocidade, o avião precisa descer.']);
  if (!L.length) L.push(['', 'Comandos neutros: o avião está compensado e voa reto. Mexa num comando para ver o efeito.']);
  return L;
}
function explain() {
  const html = C().explain().map(([c, t]) => `<li class="${c}">${t}</li>`).join('');
  if (html !== lastExplain) { $('#explainList').innerHTML = html; lastExplain = html; }
  const w = C().warn();
  $('#stallWarn').hidden = !w;
  if (w) $('#stallWarn').textContent = w;
  if (C().trimText) $('#oTrim').textContent = C().trimText();
  if (C().n1) $('#oThr').textContent = `N1 ${fmt(C().n1(), 0)}%`;
}

/* Cockpit de cada avião: o Cessna usa as funções acima; o 747-8 vem de cockpit747.js. */
const CK = {
  c172: {
    id: 'c172', nome: 'Cessna 172', sub: 'Seis instrumentos analógicos', jet: false,
    lede: 'Mexa no manche, nos pedais, na manete e nos flaps. Veja as superfícies de comando se moverem e os seis instrumentos básicos reagirem.',
    flaps: [0, 10, 20, 30], flapLabel: (f) => f + '°', scenarios: [['cruzeiro', 'Cruzeiro'], ['pouso', 'Aproximação'], ['estol', 'Estol']], defaultScenario: 'cruzeiro',
    thr: ['Manete de potência', 'Marcha lenta', 'Potência máxima'], panelLabel: 'Painel com os seis instrumentos básicos',
    start(id) { const sc = SCN[id]; Object.assign(sim, sc.s, { stalled: false }); Object.assign(ctl, sc.c); },
    step, size: sizeC172, draw: () => drawPanel(), minis: () => drawMinis(), explain: explainC172,
    warn: () => (sim.stalled ? 'ESTOL · ALARME SONORO' : ''),
  },
};
if (window.Cockpit747) {
  CK.b747 = Object.assign(Cockpit747.create(ctl), {
    nome: 'Boeing 747-8', sub: 'Telas de voo (glass cockpit)', jet: true,
    lede: 'Telas de voo de verdade: PFD com a atitude e as fitas de velocidade e altitude, ND com a rota e EICAS com os quatro motores. Decole, cruze, faça a aproximação na rampa de 3° e pouse.',
    thr: ['Manetes (4 motores)', 'Marcha lenta (IDLE)', 'Decolagem (TOGA)'], panelLabel: 'Telas PFD, ND e EICAS do 747-8',
  });
}
let ck = 'c172';
function C() { return CK[ck]; }
function setCockpit(id) {
  if (!CK[id]) return;
  ck = id;
  const c = C();
  $$('#ckList [data-ck]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.ck === id)));
  $('#ckLede').textContent = c.lede;
  $('#scnSeg').innerHTML = c.scenarios.map(([k, t]) => `<button type="button" data-scn="${k}">${t}</button>`).join('');
  $('#flapSeg').innerHTML = c.flaps.map((f) => `<button type="button" data-flap="${f}">${c.flapLabel(f)}</button>`).join('');
  $('#lThr').textContent = c.thr[0]; $('#eThr0').textContent = c.thr[1]; $('#eThr1').textContent = c.thr[2];
  $('#ctlJet').hidden = !c.jet;
  $('#viewsC172').hidden = id !== 'c172';
  $('#viewsJet').hidden = id === 'c172';
  if (c.jet) $('#viewsJet').innerHTML = c.minisHTML;
  $('#gauges').setAttribute('aria-label', c.panelLabel);
  c.start(c.defaultScenario);
  lastExplain = '';
  syncControls(); sizeGauges(); explain();
}
$('#ckList').innerHTML = Object.values(CK).map((c) => `<button type="button" class="craft" data-ck="${c.id}" aria-pressed="false"><b>${c.nome}</b><span>${c.sub}</span></button>`).join('');
$('#ckList').addEventListener('click', (e) => {
  const b = e.target.closest('[data-ck]');
  if (b) setCockpit(b.dataset.ck);
});
let simRaf = 0, simLast = 0, simTick = 0;
function simLoop(t) {
  if (current !== 'cockpit') { simRaf = 0; return; }
  const dt = Math.min(0.05, (t - (simLast || t)) / 1000); simLast = t;
  const c = C();
  c.step(dt);
  if (gctx) { gctx.clearRect(0, 0, gW, gH); c.draw(gctx, gW, gH); }
  c.minis($('#viewsJet'));
  if ((simTick += dt) > 0.25) { simTick = 0; explain(); }
  simRaf = requestAnimationFrame(simLoop);
}
function startSim() { if (!simRaf) { simLast = 0; explain(); simRaf = requestAnimationFrame(simLoop); } }

/* ---------------- D · Túnel de vento (fluxo de Joukowski) ---------------- */
const MU = [-0.09, 0.1];
const RAD = Math.hypot(1 - MU[0], MU[1]);
const BETA = Math.asin(MU[1] / RAD);
const cmul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const cdiv = (a, b) => { const d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; };
const csqrt = (a) => { const r = Math.hypot(a[0], a[1]); let im = Math.sqrt(Math.max(0, (r - a[0]) / 2)); if (a[1] < 0) im = -im; return [Math.sqrt((r + a[0]) / 2), im]; };
const lab = { aoa: 5, kt: 100, alt: 0, flaps: 0 };
// Flaps em graus (0–30): somam curvatura (mais C_L), adiantam o estol e somam arrasto.
const critOf = (f) => 15.5 - f * 0.08;
function clOf(a, f) {
  const a0 = 2 + f * 0.13, crit = critOf(f), slope = 0.095;
  const peak = slope * (crit + a0);
  return a <= crit ? slope * (a + a0) : Math.max(0.6, peak - 0.09 * (a - crit) - 0.012 * (a - crit) ** 2);
}
const isStalled = () => lab.aoa > critOf(lab.flaps);
// Arrasto: parasita + induzido (k·C_L²) + flaps + separação no estol.
function cdOf(a, f) {
  const cl = clOf(a, f), over = Math.max(0, a - critOf(f));
  return 0.027 + 0.053 * cl * cl + f * 0.0022 + 0.03 * over + 0.004 * over * over;
}
const HINGE = [1.0, 0.12];
const flapRot = (x, y, deg) => {
  const r = -deg * D2R, dx = x - HINGE[0], dy = y - HINGE[1];
  return [HINGE[0] + dx * Math.cos(r) - dy * Math.sin(r), HINGE[1] + dx * Math.sin(r) + dy * Math.cos(r)];
};
function flowVel(x, y) {
  const al = lab.aoa * D2R, ca = Math.cos(al), sa = Math.sin(al);
  const z = [x * ca - y * sa, x * sa + y * ca];
  const s = csqrt([z[0] * z[0] - z[1] * z[1] - 4, 2 * z[0] * z[1]]);
  const z1 = [(z[0] + s[0]) / 2, (z[1] + s[1]) / 2], z2 = [(z[0] - s[0]) / 2, (z[1] - s[1]) / 2];
  const d1 = Math.hypot(z1[0] - MU[0], z1[1] - MU[1]), d2 = Math.hypot(z2[0] - MU[0], z2[1] - MU[1]);
  const zeta = d1 >= d2 ? z1 : z2, dz = Math.max(d1, d2);
  if (dz < RAD * 1.005) return null;
  const zp = [zeta[0] - MU[0], zeta[1] - MU[1]];
  let gam = 4 * Math.PI * RAD * Math.sin(al + BETA + lab.flaps * 0.13 * D2R);
  if (isStalled()) gam *= 0.75;
  const t1 = [Math.cos(al), -Math.sin(al)];
  const t2 = cdiv([RAD * RAD * Math.cos(al), RAD * RAD * Math.sin(al)], cmul(zp, zp));
  const X = cdiv([gam / (2 * Math.PI), 0], zp);
  const W = [t1[0] - t2[0] - X[1], t1[1] - t2[1] + X[0]];
  const den = [1 - cdiv([1, 0], cmul(zeta, zeta))[0], -cdiv([1, 0], cmul(zeta, zeta))[1]];
  const dw = cdiv(W, den);
  let u = dw[0], v = -dw[1];
  const m = Math.hypot(u, v); if (m > 2.6) { u *= 2.6 / m; v *= 2.6 / m; }
  return [u * ca + v * sa, -u * sa + v * ca];
}
let tctx, tW = 0, tH = 0, tS = 1, tCx = 0, tCy = 0, parts = [], foil = [];
function buildFoil() {
  foil = [];
  const al = lab.aoa * D2R, ca = Math.cos(al), sa = Math.sin(al);
  for (let i = 0; i <= 140; i++) {
    const th = i / 140 * Math.PI * 2;
    const ze = [MU[0] + RAD * Math.cos(th), MU[1] + RAD * Math.sin(th)];
    const inv = cdiv([1, 0], ze);
    let zx = ze[0] + inv[0], zy = ze[1] + inv[1];
    if (lab.flaps && zx > HINGE[0]) [zx, zy] = flapRot(zx, zy, lab.flaps);
    foil.push([zx * ca + zy * sa, -zx * sa + zy * ca]);
  }
}
function sizeTunnel() {
  const cv = $('#tunnel');
  const w = cv.clientWidth || 700, h = Math.round(Math.max(260, w * 0.56));
  const dpr = window.devicePixelRatio || 1;
  cv.width = w * dpr; cv.height = h * dpr; cv.style.height = h + 'px';
  tctx = cv.getContext('2d'); tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  tW = w; tH = h; tS = Math.min(w / 7.2, h / 3.6); tCx = w * 0.5; tCy = h * 0.54;
  tctx.fillStyle = css('--tunnel'); tctx.fillRect(0, 0, w, h);
  const N = Math.round(clamp(w * 0.9, 300, 900));
  parts = Array.from({ length: N }, () => spawn(true));
}
const xMin = () => -tCx / tS - 0.2, xMax = () => (tW - tCx) / tS + 0.2;
function spawn(anywhere) {
  const half = tH / 2 / tS;
  return { x: anywhere ? xMin() + Math.random() * (xMax() - xMin()) : xMin(), y: (Math.random() * 2 - 1) * half * 1.05, age: 0 };
}
function hexRgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map((c) => c + c).join(''); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
let colSlow = [36, 86, 166], colFast = [168, 25, 106], colBg = '#e6ecee', colInk = '#15202a', colLift = '#2c7a4d', colDrag = '#b0701a', colPanel = '#fff';
function readColors() {
  try { colSlow = hexRgb(css('--blue')); colFast = hexRgb(css('--magenta')); } catch {}
  colBg = css('--tunnel'); colInk = css('--ink'); colLift = css('--ok'); colDrag = css('--warn'); colPanel = css('--plane');
  if (tctx) { tctx.fillStyle = colBg; tctx.fillRect(0, 0, tW, tH); }
}
const P = (x, y) => [tCx + x * tS, tCy - y * tS];
function arrow(c, x0, y0, x1, y1, color, w) {
  c.strokeStyle = color; c.fillStyle = color; c.lineWidth = w;
  c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
  const a = Math.atan2(y1 - y0, x1 - x0), h = 9 + w;
  c.beginPath(); c.moveTo(x1, y1); c.lineTo(x1 - h * Math.cos(a - 0.4), y1 - h * Math.sin(a - 0.4)); c.lineTo(x1 - h * Math.cos(a + 0.4), y1 - h * Math.sin(a + 0.4)); c.fill();
}
let tunRaf = 0, tunLast = 0;
function tunnelFrame(t) {
  if (current !== 'lab') { tunRaf = 0; return; }
  const dt = Math.min(0.04, (t - (tunLast || t)) / 1000); tunLast = t;
  const c = tctx;
  c.globalAlpha = 0.14; c.fillStyle = colBg; c.fillRect(0, 0, tW, tH); c.globalAlpha = 1;
  const k = (0.5 + lab.kt / 160 * 1.6) * dt;
  const stall = isStalled(), fl = lab.flaps, al = lab.aoa * D2R;
  c.lineWidth = 1.4; c.lineCap = 'round';
  for (const p of parts) {
    let v = flowVel(p.x, p.y);
    if (!v) { Object.assign(p, spawn(false)); continue; }
    const lx = p.x * Math.cos(al) - p.y * Math.sin(al), ly = p.x * Math.sin(al) + p.y * Math.cos(al);
    if (fl && lx > HINGE[0] - 0.05 && lx < 2.4) {
      const [ox, oy] = flapRot(lx, ly, -fl), d = ox - HINGE[0];
      if (d > -0.05 && d < 1.05 && Math.abs(oy - 0.12 * (1 - d)) < 0.1 * (1 - d) + 0.04) { Object.assign(p, spawn(false)); continue; }
    }
    if (fl && lx > 1.5 && lx < 5 && ly < 0.3 && ly > -0.5 - fl / 30) {
      const sev = fl / 30;
      v = [v[0] * (1 - 0.3 * sev) + (Math.random() - 0.5) * 0.9 * sev, v[1] - 0.25 * sev + (Math.random() - 0.5) * 0.9 * sev];
    }
    if (stall) {
      if (lx > -0.6 && ly > 0 && ly < 1.9 && lx < 4.5) {
        const sev = clamp((lab.aoa - 14) / 6, 0.4, 1);
        v = [v[0] * (1 - 0.65 * sev) + (Math.random() - 0.5) * 2.2 * sev, v[1] * 0.4 + (Math.random() - 0.5) * 2.2 * sev];
      }
    }
    const nx = p.x + v[0] * k, ny = p.y + v[1] * k;
    const sp = clamp((Math.hypot(v[0], v[1]) - 0.55) / 1.0, 0, 1);
    const col = colSlow.map((s, i) => Math.round(s + (colFast[i] - s) * sp));
    const a = P(p.x, p.y), b = P(nx, ny);
    c.strokeStyle = `rgb(${col[0]},${col[1]},${col[2]})`;
    c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
    p.x = nx; p.y = ny; p.age += dt;
    if (p.x > xMax() || Math.abs(p.y) > tH / tS || p.age > 14) Object.assign(p, spawn(false));
  }
  c.fillStyle = colPanel; c.strokeStyle = colInk; c.lineWidth = 1.6;
  c.beginPath(); foil.forEach(([x, y], i) => { const q = P(x, y); i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); }); c.closePath(); c.fill(); c.stroke();
  const cl = clOf(lab.aoa, lab.flaps);
  const base = P(-0.3, 0.15);
  arrow(c, base[0], base[1], base[0], base[1] - clamp(cl, 0, 2.2) * tS * 0.55, colLift, 3);
  c.fillStyle = colLift; c.font = '600 12px "IBM Plex Mono", monospace'; c.textAlign = 'left';
  c.fillText('SUSTENTAÇÃO', base[0] + 8, base[1] - clamp(cl, 0, 2.2) * tS * 0.55 + 4);
  const te = P(foil[0][0], foil[0][1]), dl = clamp(cdOf(lab.aoa, lab.flaps), 0, 0.5) * tS * 5;
  arrow(c, te[0] + 6, te[1], te[0] + 6 + Math.max(14, dl), te[1], colDrag, 3);
  c.fillStyle = colDrag; c.font = '600 12px "IBM Plex Mono", monospace';
  c.fillText('ARRASTO', te[0] + 12, te[1] + 18);
  arrow(c, 14, 22, 70, 22, colInk, 2);
  c.fillStyle = colInk; c.font = '500 11px "IBM Plex Mono", monospace'; c.fillText('VENTO RELATIVO', 78, 26);
  if (stall) { c.fillStyle = css('--bad'); c.font = '600 13px "IBM Plex Mono", monospace'; c.fillText('ESTOL: FLUXO DESCOLADO', 14, tH - 16); }
  tunRaf = requestAnimationFrame(tunnelFrame);
}
function startTunnel() { if (!tunRaf) { tunLast = 0; readColors(); updateLab(); tunRaf = requestAnimationFrame(tunnelFrame); } }

const MTOW = 1157, AREA = 16.2;
function updateLab() {
  lab.aoa = +$('#lAoa').value; lab.kt = +$('#lSpd').value; lab.alt = +$('#lAlt').value; 
  $('#oAoa').textContent = fmt(lab.aoa, lab.aoa % 1 ? 1 : 0) + '°';
  $('#oSpd').textContent = lab.kt + ' kt';
  $('#oAlt').textContent = fmt(lab.alt) + ' ft';
  const rho = 1.225 * Math.pow(1 - 2.25577e-5 * lab.alt * 0.3048, 4.2559);
  const v = lab.kt * 0.514444, cl = clOf(lab.aoa, lab.flaps);
  const q = 0.5 * rho * v * v * AREA / 9.80665;
  const kgf = q * cl, cd = cdOf(lab.aoa, lab.flaps), drag = q * cd, drag0 = q * cdOf(lab.aoa, 0);
  $('#rDrag').textContent = fmt(drag) + ' kgf';
  $('#rLd').textContent = fmt(cl / cd, 1);
  $('#dragMsg').textContent = lab.flaps
    ? `Flaps em ${lab.flaps}°: o arrasto é ${fmt((drag / drag0 - 1) * 100)}% maior que sem flaps. Isso freia o avião e deixa a descida mais íngreme na aproximação para pouso.`
    : 'Sem flaps: arrasto menor, bom para subir e voar em cruzeiro. Baixe os flaps para ver a diferença.';
  $('#rCl').textContent = fmt(cl, 2);
  $('#rRho').textContent = fmt(rho, 3) + ' kg/m³';
  $('#rLift').textContent = fmt(Math.max(0, kgf)) + ' kgf';
  const max = MTOW * 2;
  $('#liftBar').style.width = clamp(kgf / max * 100, 0, 100) + '%';
  $('#liftBar').style.background = kgf >= MTOW ? 'var(--ok)' : 'var(--warn)';
  $('#mtowMark').style.left = (MTOW / max * 100) + '%';
  let msg;
  if (isStalled()) msg = 'Asa em estol: o ar descolou da parte de cima e a sustentação caiu. Diminua o ângulo de ataque.';
  else if (kgf >= MTOW) msg = `Sustenta um Cessna 172 carregado (${fmt(MTOW)} kg). A linha preta marca esse peso.`;
  else msg = `Falta sustentação para ${fmt(MTOW)} kg: o avião desceria. Aumente a velocidade ou o ângulo de ataque.`;
  $('#liftMsg').textContent = msg;
  buildFoil(); drawClChart();
}
['#lAoa', '#lSpd', '#lAlt'].forEach((s) => $(s).addEventListener('input', updateLab));
$('#labFlapSeg').addEventListener('click', (e) => {
  const b = e.target.closest('[data-lflap]');
  if (!b) return;
  lab.flaps = +b.dataset.lflap;
  $$('#labFlapSeg button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  updateLab();
});
function drawClChart() {
  const W = 300, H = 170, l = 34, r = 10, t = 12, b = 28;
  const xs = (a) => l + (a + 5) / 25 * (W - l - r), ys = (cl) => t + (2.2 - cl) / 2.4 * (H - t - b);
  let g = '';
  const crit = critOf(lab.flaps);
  g += `<rect class="stallzone" x="${xs(crit)}" y="${t}" width="${xs(20) - xs(crit)}" height="${H - t - b}"/>`;
  for (let cl = 0; cl <= 2; cl += 0.5) g += `<line class="axis" x1="${l}" x2="${W - r}" y1="${ys(cl)}" y2="${ys(cl)}"/><text class="tick" x="${l - 6}" y="${ys(cl) + 3}" text-anchor="end">${fmt(cl, 1)}</text>`;
  for (let a = -5; a <= 20; a += 5) g += `<text class="tick" x="${xs(a)}" y="${H - b + 14}" text-anchor="middle">${a}°</text>`;
  g += `<text class="tick" x="${W - r}" y="${H - 2}" text-anchor="end">ângulo de ataque</text><text class="tick" x="${l}" y="${t - 2}">C L</text>`;
  g += `<text class="tick" x="${xs(crit) + 4}" y="${t + 12}">estol</text>`;
  let d = '';
  for (let a = -5; a <= 20; a += 0.5) d += (a === -5 ? 'M' : 'L') + xs(a).toFixed(1) + ' ' + ys(clOf(a, lab.flaps)).toFixed(1);
  g += `<path class="curve" d="${d}"/><circle class="dot" cx="${xs(lab.aoa)}" cy="${ys(clOf(lab.aoa, lab.flaps))}" r="6"/>`;
  $('#clChart').innerHTML = g;
}

/* ---------------- E · Glossário ---------------- */
function renderGloss(q = '') {
  const n = q.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const list = GLOSS.filter((g) => !n || g.join(' ').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(n));
  $('#glossList').innerHTML = list.length
    ? list.map(([t, en, d]) => `<div><dt>${t}<span>${en}</span></dt><dd>${d}</dd></div>`).join('')
    : '<p class="small">Nenhum termo encontrado. Tente outra palavra.</p>';
}
$('#glossSearch').addEventListener('input', (e) => renderGloss(e.target.value));

/* ---------------- F · Catálogo 747 ---------------- */
const CAT = window.Catalogo747;
const esc = (t) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fold = (t) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
function hl(text, q) {
  if (!q) return esc(text);
  const i = fold(text).indexOf(q);
  return i < 0 ? esc(text) : esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + q.length)) + '</mark>' + esc(text.slice(i + q.length));
}
function renderCatalog(qRaw = '') {
  if (!CAT) return;
  const q = fold(qRaw.trim());
  let hits = 0;
  const html = CAT.secoes.map((sec, si) => {
    const itens = q ? sec.itens.filter((it) => fold(it.nome + ' ' + it.funcao).includes(q)) : sec.itens;
    if (!itens.length) return '';
    hits += itens.length;
    const first = sec.itens[0].n, last = sec.itens[sec.itens.length - 1].n;
    return `<details class="cat-sec" id="cat-${sec.id}" ${q || si === 0 ? 'open' : ''}>
      <summary><span class="n">${first}–${last}</span><span><h3>${sec.titulo}</h3><span class="small">${q ? `${itens.length} de ${sec.itens.length} itens` : `${sec.itens.length} itens`}</span></span></summary>
      <div class="cat-body">
        ${sec.intro && !q ? `<p>${sec.intro}</p>` : ''}
        <table><thead><tr><th>Nº</th><th>Peça ou componente</th><th>Para que serve</th></tr></thead>
        <tbody>${itens.map((it) => `<tr><td class="num">${it.n}</td><td class="nome">${hl(it.nome, q)}</td><td>${hl(it.funcao, q)}</td></tr>`).join('')}</tbody></table>
        ${sec.extra && !q ? `<p><b>${sec.extraTitulo}</b></p><ul class="cat-extra">${sec.extra.map((e) => `<li>${e}</li>`).join('')}</ul>` : ''}
        ${sec.nota && !q ? `<p class="tip">${sec.nota}</p>` : ''}
        ${sec.parte ? `<button type="button" class="link-btn" data-open747="${sec.parte}">Ver no desenho do 747-8 →</button>` : ''}
      </div>
    </details>`;
  }).join('');
  $('#catList').innerHTML = html || '<p class="small">Nenhuma peça encontrada. Tente outra palavra.</p>';
  $('#catCount').textContent = q ? `${hits} ${hits === 1 ? 'peça encontrada' : 'peças encontradas'} de ${CAT.total}.` : `${CAT.total} categorias em ${CAT.secoes.length} sistemas.`;
}
if (CAT) {
  $('#catIndex').innerHTML = CAT.secoes.map((sec) => `<button type="button" class="chip" data-cat="${sec.id}">${sec.titulo}<b>${sec.itens.length}</b></button>`).join('');
  $('#catRefs').innerHTML = CAT.referencias.map(([t, d, u]) => `<li><a href="${u}" target="_blank" rel="noopener">${t}</a> <span class="small">${d}</span></li>`).join('');
  $('#catSearch').addEventListener('input', (e) => renderCatalog(e.target.value));
  $('#catIndex').addEventListener('click', (e) => {
    const b = e.target.closest('[data-cat]');
    if (!b) return;
    if ($('#catSearch').value) { $('#catSearch').value = ''; renderCatalog(); }
    const d = $('#cat-' + b.dataset.cat);
    d.open = true;
    d.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  });
  renderCatalog();
}
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-open747]');
  if (!b) return;
  showTab('pecas', true);
  setCraft('b747');
  selectPart(b.dataset.open747, true);
});

/* ---------------- Início ---------------- */
let resizeT;
window.addEventListener('resize', () => {
  clearTimeout(resizeT);
  resizeT = setTimeout(() => { if (current === 'cockpit') sizeGauges(); if (current === 'lab') { sizeTunnel(); buildFoil(); } }, 150);
});
window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', readColors);
new MutationObserver(readColors).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
window.addEventListener('hashchange', () => showTab(location.hash.slice(1)));

// No APK (Capacitor): margens da barra de status e botão voltar do Android.
const Cap = window.Capacitor;
const NATIVE = !!(Cap && Cap.isNativePlatform && Cap.isNativePlatform());
if (NATIVE) {
  document.documentElement.classList.add('native');
  const AppPlugin = (Cap.Plugins && Cap.Plugins.App) || (Cap.registerPlugin && Cap.registerPlugin('App'));
  // Voltar: volta para a vista de cima, depois para a primeira aba, depois minimiza.
  AppPlugin?.addListener('backButton', () => {
    hideHint();
    if (current === 'pecas' && planeView !== 'top') { setPlaneView('top'); return; }
    if (current !== 'pecas') { showTab('pecas', true); return; }
    AppPlugin.minimizeApp();
  });
}

selPart = 'aileron'; setCraft('c172');
renderProgress(); renderModules(); renderLesson();
setCockpit('c172'); updateLab(); renderGloss();
showTab(location.hash.slice(1) || 'pecas');
})();
