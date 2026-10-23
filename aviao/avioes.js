/* Hangar Escola: jatos comerciais. Os desenhos (vista superior e lateral) são gerados a partir das medidas
   reais de cada avião, em metros, então as proporções batem com o avião de verdade. Valores aproximados. */
(() => {
'use strict';

const D2R = Math.PI / 180;
const f = (n) => (Math.round(n * 10) / 10).toString();

const JETS = [
  {
    id: 'b737', nome: 'Boeing 737-800', sub: 'Jato de corredor único · 189 lugares',
    lede: 'O 737 é o jato comercial mais vendido da história: mais de 11 mil entregues desde 1967. A versão -800, da família Next Generation, é a mais comum nas companhias brasileiras.',
    specs: { fab: 'Boeing (EUA)', voo: '1997', env: '35,79 m', comp: '39,47 m', alt: '12,55 m', pmd: '79.016 kg', mot: '2 × CFM56-7B', pax: '162 a 189', cru: 'Mach 0,785 · 842 km/h', alc: '5.400 km', teto: '41.000 ft' },
    L: 39.47, span: 35.79, D: 3.76, H: 12.55, noseLen: 4.6, tailLen: 10.5,
    wingX: 14.2, sweep: 25, rootChord: 7.3, tipChord: 1.25, kink: 0.33, wingletType: 'blended', wingletH: 2.44,
    hc: 3.35, engY: 4.9, nacLen: 4.8, nacD: 2.05, nacFwd: 2.8, engBottom: 0.46,
    stabX: 33.2, stabSpan: 14.35, stabSweep: 30, stabRoot: 4.2, stabTip: 1.4,
    finX: 29.2, finSweep: 35, finRoot: 6.4, finTip: 1.7,
    noseGearX: 4.3, mainX: 19.9, mainY: 2.86, wheelR: 0.56, coreLen: 1.2, flatInlet: true, comando: 'Manche', telas: '6', livery: { title: 'HANGAR', reg: 'PT-APR' },
    doors: [4.9, 33.6], exits: [16.3, 17.3],
    asa: { area: '124,6 m²', comb: '26.000 L', enfl: '25°' },
    motor: { nome: 'CFM56-7B', empuxo: '121 kN', bpr: '5,1 : 1', curio: 'Como o 737 é baixo, o motor fica muito perto do chão. Por isso a entrada de ar tem a parte de baixo achatada, o famoso formato de "bochecha de hamster".' },
    cockpit: 'Dois pilotos com manche convencional (yoke) e seis telas grandes. Os comandos são hidráulicos e o manche se liga às superfícies por cabos.',
    winglet: 'Winglet "blended", que se curva para cima numa transição suave. Reduz o vórtice da ponta da asa e economiza cerca de 4% de combustível.',
    trem: 'As rodas principais recolhem para dentro da fuselagem e ficam sem portas: dá para ver os pneus por baixo do avião em voo.',
  },
  {
    id: 'a320', nome: 'Airbus A320neo', sub: 'Jato de corredor único · 194 lugares',
    lede: 'O A320 foi o primeiro avião comercial com comandos fly-by-wire digitais: o sidestick manda sinais elétricos para computadores, que movem as superfícies. "neo" significa new engine option, motores novos mais econômicos.',
    specs: { fab: 'Airbus (Europa)', voo: '2014', env: '35,80 m', comp: '37,57 m', alt: '11,76 m', pmd: '79.000 kg', mot: '2 × LEAP-1A ou PW1100G', pax: '150 a 194', cru: 'Mach 0,78 · 830 km/h', alc: '6.300 km', teto: '39.800 ft' },
    L: 37.57, span: 35.8, D: 3.95, H: 11.76, noseLen: 4.7, tailLen: 9.6,
    wingX: 13.1, sweep: 25, rootChord: 7.0, tipChord: 1.5, kink: 0.33, wingletType: 'sharklet', wingletH: 2.43,
    hc: 3.3, engY: 5.75, nacLen: 5.4, nacD: 2.45, nacFwd: 2.5, engBottom: 0.6,
    stabX: 32.0, stabSpan: 12.45, stabSweep: 29, stabRoot: 3.9, stabTip: 1.3,
    finX: 28.0, finSweep: 34, finRoot: 5.8, finTip: 1.9,
    noseGearX: 5.1, mainX: 17.8, mainY: 3.8, wheelR: 0.6, coreLen: 1.7, comando: 'Sidestick', telas: '6',
    doors: [4.9, 32.0], exits: [15.4, 16.2],
    asa: { area: '122,6 m²', comb: '26.700 L', enfl: '25°' },
    motor: { nome: 'CFM LEAP-1A ou PW1100G', empuxo: '120 kN', bpr: '11 : 1', curio: 'O fan do LEAP-1A tem pás de material composto tecido em 3D, mais leves e resistentes que as de titânio.' },
    cockpit: 'Dois pilotos com sidestick, uma alavanca lateral como de videogame, e fly-by-wire: computadores protegem o avião contra estol e manobras exageradas.',
    winglet: 'Sharklet, uma ponta de asa curvada para cima, mais alta e reta que o winglet do 737. Economiza cerca de 3,5% de combustível.',
    trem: 'Trem retrátil com duas rodas em cada perna. As principais recolhem para dentro da fuselagem e ficam fechadas por portas.',
  },
  {
    id: 'e195', nome: 'Embraer E195-E2', sub: 'Jato regional brasileiro · 146 lugares',
    lede: 'Fabricado pela Embraer em São José dos Campos (SP), é o maior avião comercial já feito no Brasil. A asa é longa e fina, de alto alongamento, e os motores PW1900G são turbofans com caixa de redução.',
    specs: { fab: 'Embraer (Brasil)', voo: '2017', env: '35,12 m', comp: '41,50 m', alt: '10,90 m', pmd: '61.500 kg', mot: '2 × PW1900G', pax: '120 a 146', cru: 'Mach 0,78 · 830 km/h', alc: '4.800 km', teto: '41.000 ft' },
    L: 41.5, span: 35.12, D: 3.01, H: 10.9, noseLen: 4.0, tailLen: 9.2,
    wingX: 16.9, sweep: 23, rootChord: 6.2, tipChord: 1.25, kink: 0.3, wingletType: null, wingletH: 0,
    hc: 2.75, engY: 5.6, nacLen: 5.3, nacD: 2.3, nacFwd: 2.5, engBottom: 0.55,
    stabX: 35.6, stabSpan: 12.1, stabSweep: 30, stabRoot: 3.6, stabTip: 1.3,
    finX: 31.4, finSweep: 38, finRoot: 5.5, finTip: 1.8,
    noseGearX: 3.4, mainX: 21.0, mainY: 3.0, wheelR: 0.55, coreLen: 1.6, comando: 'Sidestick', telas: '5',
    doors: [4.3, 36.0], exits: [19.0],
    asa: { area: '103 m²', comb: '17.000 L', enfl: '23°' },
    motor: { nome: 'Pratt & Whitney PW1900G', empuxo: '102 kN', bpr: '12 : 1', curio: 'É um turbofan "geared": uma caixa de engrenagens deixa o fan girar mais devagar que a turbina. Isso reduz o ruído em até 75% e o consumo em cerca de 17% em relação à geração anterior.' },
    cockpit: 'Dois pilotos com sidestick e fly-by-wire de malha fechada: o computador corrige o voo continuamente, o que deixou a cauda e o estabilizador menores e mais leves.',
    winglet: null,
    trem: 'Trem retrátil com duas rodas em cada perna. A asa longa e fina dispensou winglets: o alongamento alto já reduz o arrasto induzido.',
  },
  {
    id: 'b747', nome: 'Boeing 747-8', sub: 'Jumbo de dois andares · 410 lugares',
    lede: 'A "Rainha dos Céus". O 747-8 é a versão mais nova e maior do 747: andar superior alongado, asa nova com pontas inclinadas para trás e quatro motores GEnx-2B. Existe para passageiros (747-8I) e cargueiro (747-8F), com porta de carga no nariz. Veja também a aba Catálogo 747, com 295 categorias de peças.',
    specs: { fab: 'Boeing (EUA)', voo: '2010 (8F) · 2011 (8I)', env: '68,40 m', comp: '76,30 m', alt: '19,40 m', pmd: '447.700 kg', mot: '4 × GEnx-2B67', pax: 'cerca de 410', cru: 'Mach 0,855 · 920 km/h', alc: '14.300 km', teto: '43.100 ft' },
    L: 76.3, span: 68.4, D: 6.5, H: 19.4, noseLen: 7.0, tailLen: 16,
    wingX: 26.5, sweep: 37.5, rootChord: 15.5, tipChord: 3.4, kink: 0.3, wingletType: null, wingletH: 0, raked: true,
    hc: 5.0, engines: [{ y: 12.4, bottom: 1.3 }, { y: 21.2, bottom: 2.5 }], nacLen: 7.2, nacD: 3.25, nacFwd: 3.8, coreLen: 2.2,
    stabX: 63.0, stabSpan: 22.2, stabSweep: 37, stabRoot: 10.5, stabTip: 3.0,
    finX: 59.0, finSweep: 47, finRoot: 13.5, finTip: 4.5,
    noseGearX: 6.5, mains: [{ x: 33.5, y: 5.6, bogie: true }, { x: 36.8, y: 1.9, bogie: true }], wheelR: 0.63,
    hump: { end: 30.5, top: 9.9 }, cockpitWin: [[8.8, 9.55], [6.6, 9.3], [6.0, 8.85], [8.8, 8.95]],
    doors: [7.0, 17.0, 33.0, 45.5, 57.0], exits: [], comando: 'Manche', telas: '6', rodas: '18',
    asa: { area: '554 m²', comb: '238.600 L', enfl: '37,5°' },
    motor: { nome: 'GE GEnx-2B67', empuxo: '296 kN', bpr: '8 : 1', curio: 'O GEnx-2B é uma versão do motor do Boeing 787 feita para o 747-8. As pás do fan e a carcaça são de fibra de carbono, mais leves que as de titânio.' },
    cockpit: 'Dois pilotos com manche convencional (coluna de controle), telas PFD, ND e EICAS e o FMS. A cabine de comando fica no andar superior, no "corcunda" do 747.',
    winglet: null,
    trem: 'São 18 rodas: 2 no nariz e 16 em quatro pernas principais, duas sob as asas e duas sob a fuselagem. As pernas da fuselagem também viram nas curvas apertadas no solo.',
  },
];

/* ---------- Fichas das peças dos jatos ---------- */
function parts(a) {
  const p = {
    cabine: {
      nome: 'Cabine de comando', sistema: 'Comandos de voo',
      onde: 'No nariz, atrás do radome (a ponta do nariz que guarda o radar meteorológico).',
      funcao: 'É onde ficam os dois pilotos, as telas de voo e os computadores de navegação.',
      como: a.cockpit,
      manut: 'Testes dos sistemas a cada voo pela própria tripulação; os computadores registram falhas para a manutenção ler depois.',
      curio: 'O piloto automático pode fazer quase todo o voo, inclusive o pouso em neblina (pouso automático CAT III).',
      spec: [['Pilotos', '2'], ['Telas', a.telas], ['Comando', a.comando]],
    },
    fuselagem: {
      nome: 'Fuselagem', sistema: 'Estrutura',
      onde: 'O tubo do nariz até a cauda.',
      funcao: `Leva ${a.specs.pax} passageiros e carga no porão, embaixo do piso.`,
      como: 'É pressurizada: em cruzeiro, lá fora o ar é rarefeito, mas dentro a pressão equivale a uns 2.400 m de altitude. Cada voo infla e desinfla a fuselagem um pouco, um ciclo de pressurização.',
      manut: 'Os ciclos de pressurização causam fadiga no metal. As inspeções pesadas (C-check, a cada 2 anos) procuram trincas e corrosão painel por painel.',
      curio: 'As janelas são ovais e não quadradas porque cantos retos concentram esforço e podem trincar com a pressurização.',
      spec: [['Diâmetro', f(a.D).replace('.', ',') + ' m'], ['Comprimento', a.specs.comp], ['Passageiros', a.specs.pax]],
    },
    asa: {
      nome: 'Asa', sistema: 'Estrutura',
      onde: 'Asa baixa, presa embaixo da fuselagem, com enflechamento (inclinada para trás).',
      funcao: 'Gera sustentação e guarda quase todo o combustível do avião.',
      como: `O enflechamento de ${a.asa.enfl} atrasa os efeitos de compressibilidade do ar perto da velocidade do som, permitindo voar a quase Mach 0,8.`,
      manut: 'Inspeção do bordo de ataque (batida de pássaro e granizo), dos trilhos dos flaps e slats e vazamentos nos tanques.',
      curio: 'Em voo, a ponta da asa sobe mais de um metro por causa da sustentação. A asa é feita para dobrar.',
      spec: [['Envergadura', a.specs.env], ['Área', a.asa.area], ['Combustível', a.asa.comb]],
    },
    aileron: {
      nome: 'Ailerons', sistema: 'Comandos de voo',
      onde: 'No bordo de fuga, perto da ponta de cada asa.',
      funcao: 'Controlam a rolagem, junto com os spoilers.',
      como: 'Movidos por atuadores hidráulicos. Em velocidade alta, os spoilers fazem boa parte do trabalho para não torcer a asa.',
      manut: 'Verificar atuadores hidráulicos, folgas e as dobradiças.',
      curio: 'Os jatos têm três sistemas hidráulicos independentes para que os comandos funcionem mesmo com uma falha.',
      spec: [['Eixo', 'Longitudinal'], ['Acionamento', 'Hidráulico'], ['Ajuda', 'Spoilers']],
      ver: 'cockpit',
    },
    flap: {
      nome: 'Flaps', sistema: 'Hipersustentação',
      onde: 'No bordo de fuga, da fuselagem até os ailerons.',
      funcao: 'Aumentam a área e a curvatura da asa para decolar e pousar devagar.',
      como: 'São flaps do tipo Fowler: deslizam para trás em trilhos e descem, abrindo fendas por onde o ar acelera e cola na asa.',
      manut: 'Lubrificar e inspecionar trilhos, roletes e os atuadores. Os carenados embaixo da asa ("canoas") cobrem os trilhos.',
      curio: 'Com flaps e slats abertos, a velocidade de estol cai de uns 230 km/h para cerca de 200 km/h ou menos.',
      spec: [['Tipo', 'Fowler'], ['Posições', '5 a 7'], ['Uso', 'Pouso e decolagem']],
      ver: 'lab',
    },
    slat: {
      nome: 'Slats', sistema: 'Hipersustentação',
      onde: 'No bordo de ataque, a frente da asa.',
      funcao: 'Deixam a asa voar com ângulo de ataque maior sem estolar.',
      como: 'O slat desliza para frente e para baixo, abrindo uma fenda. O ar de baixo passa pela fenda e energiza o fluxo em cima da asa, atrasando o descolamento.',
      manut: 'Verificar trilhos, vedação e o sistema de degelo do bordo de ataque.',
      curio: 'Slats e flaps juntos quase dobram o coeficiente de sustentação máximo da asa.',
      spec: [['Posição', 'Bordo de ataque'], ['Efeito', 'Atrasa o estol'], ['Uso', 'Pouso e decolagem']],
    },
    spoiler: {
      nome: 'Spoilers', sistema: 'Comandos de voo',
      onde: 'Painéis em cima da asa, à frente dos flaps.',
      funcao: 'Em voo, ajudam a rolar e servem de freio aerodinâmico. No pouso, sobem todos de uma vez.',
      como: 'Ao subir, "estragam" o fluxo de ar em cima da asa: a sustentação cai e o arrasto sobe. No toque, isso joga o peso do avião nas rodas e os freios ficam muito mais eficazes.',
      manut: 'Testar o armamento automático (speedbrake armado) e os atuadores.',
      curio: 'Na descida, o piloto usa a alavanca de speedbrake para descer mais rápido sem ganhar velocidade.',
      spec: [['Em voo', 'Freio e rolagem'], ['No solo', 'Ground spoiler'], ['Comando', 'Speedbrake']],
    },
    motor: {
      nome: 'Motores turbofan', sistema: 'Propulsão',
      onde: 'Pendurados embaixo das asas por pilones.',
      funcao: 'Geram a tração e também eletricidade, pressão hidráulica e ar quente para a cabine.',
      como: `O fan grande na frente empurra muito ar por fora do núcleo (o "bypass"); é dali que vem a maior parte do empuxo. No núcleo, o ar é comprimido, queima com querosene e gira a turbina, que move o fan. Razão de bypass: ${a.motor.bpr}.`,
      manut: 'Inspeção boroscópica (uma câmera dentro do motor) para ver as pás. No pouso, o reversor de empuxo desvia o ar para frente e ajuda a frear.',
      curio: a.motor.curio,
      spec: [['Modelo', a.motor.nome], ['Empuxo', a.motor.empuxo + ' cada'], ['Bypass', a.motor.bpr]],
    },
    estabh: {
      nome: 'Estabilizador horizontal', sistema: 'Empenagem',
      onde: 'Na cauda, as duas asinhas horizontais.',
      funcao: 'Dá estabilidade em arfagem e serve de compensador.',
      como: 'Nos jatos, o estabilizador inteiro se move um pouco (estabilizador compensável). É assim que o piloto ou o piloto automático compensam o avião conforme a velocidade e o peso mudam.',
      manut: 'Inspecionar o fuso (jackscrew) que move o estabilizador: precisa de lubrificação e medição de desgaste.',
      curio: 'Antes da decolagem, o piloto ajusta o compensador conforme o peso e o centro de gravidade calculados.',
      spec: [['Envergadura', f(a.stabSpan).replace('.', ',') + ' m'], ['Tipo', 'Compensável'], ['Par', 'Profundor']],
    },
    profundor: {
      nome: 'Profundor', sistema: 'Comandos de voo',
      onde: 'Atrás do estabilizador horizontal.',
      funcao: 'Controla a arfagem: subir ou baixar o nariz.',
      como: 'Puxar o manche (ou o sidestick) sobe o profundor e o nariz sobe. Acionado por atuadores hidráulicos.',
      manut: 'Verificar atuadores e as balanças de massa contra vibração (flutter).',
      curio: 'Na rotação da decolagem, o piloto puxa suave a cerca de 3° por segundo para não arrastar a cauda na pista.',
      spec: [['Eixo', 'Lateral'], ['Movimento', 'Arfagem'], ['Acionamento', 'Hidráulico']],
      ver: 'cockpit',
    },
    estabv: {
      nome: 'Estabilizador vertical', sistema: 'Empenagem',
      onde: 'A grande deriva da cauda.',
      funcao: 'Dá estabilidade direcional e precisa segurar o avião se um motor falhar.',
      como: 'Com um motor parado, o outro puxa o avião de lado. A deriva e o leme são dimensionados para compensar isso na decolagem.',
      manut: 'Inspeção estrutural das fixações e luzes do logotipo.',
      curio: `A cauda é a parte mais alta: ${a.specs.alt} do chão até o topo.`,
      spec: [['Altura total', a.specs.alt], ['Função', 'Estabilidade'], ['Par', 'Leme']],
    },
    leme: {
      nome: 'Leme de direção', sistema: 'Comandos de voo',
      onde: 'Atrás da deriva.',
      funcao: 'Controla a guinada, movido pelos pedais.',
      como: 'Um amortecedor de guinada (yaw damper) mexe no leme sozinho para cancelar o balanço lateral, chamado dutch roll.',
      manut: 'Verificar atuadores (com redundância) e limitadores de curso em alta velocidade.',
      curio: 'Em pouso com vento cruzado, o piloto alinha o nariz com a pista usando o leme pouco antes de tocar.',
      spec: [['Eixo', 'Vertical'], ['Movimento', 'Guinada'], ['Automático', 'Yaw damper']],
      ver: 'cockpit',
    },
    trem: {
      nome: 'Trem de pouso', sistema: 'Pouso',
      onde: 'Uma perna no nariz e duas sob a raiz das asas. Recolhe depois da decolagem.',
      funcao: 'Suporta o avião no solo, amortece o pouso e freia.',
      como: a.trem + ' Os freios de disco têm sistema antiderrapante, como o ABS de um carro, e autobrake.',
      manut: 'Pressão dos pneus todo dia (com nitrogênio), desgaste dos freios por pinos indicadores e revisão geral do trem a cada cerca de 10 anos.',
      curio: 'O pneu de um jato aguenta mais de 300 km/h no toque e é cheio de nitrogênio, que não pega fogo e varia menos com a temperatura.',
      spec: [['Rodas', a.rodas || '6'], ['Tipo', 'Retrátil'], ['Freios', 'Disco + antiderrapante']],
    },
    apu: {
      nome: 'APU', sistema: 'Elétrico',
      onde: 'Na ponta da cauda (a saída de ar é o furinho atrás).',
      funcao: 'Uma pequena turbina que gera eletricidade e ar comprimido com os motores desligados.',
      como: 'No portão, a APU liga o ar-condicionado e as luzes. O ar comprimido dela gira os motores principais para dar a partida.',
      manut: 'Inspeção de óleo e horas de uso; algumas companhias usam energia do aeroporto para economizar a APU.',
      curio: 'APU quer dizer Auxiliary Power Unit, unidade auxiliar de potência. O barulho agudo que se ouve no embarque costuma ser ela.',
      spec: [['Tipo', 'Turbina'], ['Gera', 'Energia + ar'], ['Uso', 'Solo e partida']],
    },
    pitot: {
      nome: 'Tubos de pitot', sistema: 'Instrumentos',
      onde: 'Nas laterais do nariz, abaixo das janelas do cockpit.',
      funcao: 'Medem a pressão do ar de impacto para calcular a velocidade.',
      como: 'São três tubos independentes, com aquecimento elétrico. Os computadores comparam as três medidas e descartam a que discordar.',
      manut: 'Capas protetoras no solo e testes de aquecimento. Um inseto dentro do tubo já causou acidentes.',
      curio: 'Em 2009, gelo nos pitots de um A330 da Air France deu leituras falsas de velocidade e contribuiu para o acidente do voo 447.',
      spec: [['Quantidade', '3'], ['Aquecido', 'Sim'], ['Alimenta', 'Velocímetros']],
    },
    luzes: {
      nome: 'Luzes externas', sistema: 'Elétrico',
      onde: 'Navegação nas pontas das asas e na cauda; beacon vermelho em cima e embaixo da fuselagem.',
      funcao: 'Mostram a posição e a direção do avião e avisam que os motores estão ligados.',
      como: 'Vermelha à esquerda, verde à direita, branca atrás. O beacon pisca vermelho quando os motores vão ligar: sinal para o pessoal de solo se afastar. Os strobes brancos piscam na pista e em voo.',
      manut: 'Teste no pré-voo e troca de lâmpadas (hoje quase todas LED).',
      curio: 'Os faróis de pouso ficam na raiz das asas e são ligados abaixo de 10.000 ft para outros aviões e pássaros verem o avião.',
      spec: [['Esquerda', 'Vermelha'], ['Direita', 'Verde'], ['Beacon', 'Vermelho']],
    },
  };
  if (a.wingletType) {
    const bl = a.wingletType === 'blended';
    p.winglet = {
      nome: bl ? 'Winglets' : 'Sharklets', sistema: 'Aerodinâmica',
      onde: 'Na ponta de cada asa, curvados para cima.',
      funcao: 'Reduzem o arrasto induzido, o arrasto causado pelo redemoinho (vórtice) da ponta da asa.',
      como: a.winglet,
      manut: 'Inspecionar a fixação, a luz de navegação e danos de colisão no solo.',
      curio: 'O ar de baixo da asa, com pressão maior, tenta passar para cima pela ponta e forma um redemoinho. O winglet atrapalha esse redemoinho.',
      spec: [['Altura', f(a.wingletH).replace('.', ',') + ' m'], ['Economia', bl ? '~4%' : '~3,5%'], ['Tipo', bl ? 'Blended' : 'Sharklet']],
    };
  }
  return p;
}
const ORDER = ['asa', 'aileron', 'flap', 'slat', 'spoiler', 'winglet', 'motor', 'profundor', 'estabh', 'leme', 'estabv', 'fuselagem', 'cabine', 'trem', 'apu', 'pitot', 'luzes'];

JETS.forEach((a) => {
  a.engines = a.engines || [{ y: a.engY, bottom: a.engBottom }];
  a.engY = a.engines[0].y;
  a.mains = a.mains || [{ x: a.mainX, y: a.mainY }];
});

/* ---------- Geometria comum ---------- */
function geo(a) {
  const r = a.D / 2;
  const s = a.span / 2 - (a.wingletType ? 0.35 : 0);
  const tn = Math.tan(a.sweep * D2R);
  const leAt = (e) => a.wingX + (e - r) * tn;
  const eK = r + a.kink * (s - r);
  const rootTE = a.wingX + a.rootChord;
  const kinkTE = rootTE + (eK - r) * Math.tan(3 * D2R);
  const tipLE = leAt(s), tipTE = tipLE + a.tipChord;
  const teAt = (e) => (e <= eK ? rootTE + (e - r) * Math.tan(3 * D2R) : kinkTE + (e - eK) / (s - eK) * (tipTE - kinkTE));
  const at = (e, fr) => leAt(e) + fr * (teAt(e) - leAt(e));
  return { r, s, tn, leAt, eK, rootTE, kinkTE, tipLE, tipTE, teAt, at, e2: r + 0.72 * (s - r), e3: r + 0.95 * (s - r) };
}
const part = (id, label, inner) => `<g class="part" data-part="${id}" tabindex="0" role="button" aria-label="${label}">${inner}</g>`;

/* ---------- Vista superior ---------- */
function top(a) {
  const g = geo(a);
  const k = Math.min(500 / a.span, 418 / a.L);
  const cx = 300, y0 = 46;
  const X = (e) => f(cx + e * k), Y = (m) => f(y0 + m * k);
  const pt = (e, m, sd) => `${X(sd * e)} ${Y(m)}`;
  const poly = (pts) => [1, -1].map((sd) => 'M' + pts.map(([e, m]) => pt(e, m, sd)).join(' L') + ' Z').join(' ');
  const band = (e1, e2, fa, fb) => poly([[e1, g.at(e1, fa)], [e2, g.at(e2, fa)], [e2, g.at(e2, fb)], [e1, g.at(e1, fb)]]);
  const { r, s } = g, w = r, nL = a.noseLen, tL = a.tailLen, L = a.L;
  const fus = `M${cx} ${Y(0)} C${X(w * 0.5)} ${Y(0)} ${X(w)} ${Y(nL * 0.5)} ${X(w)} ${Y(nL)} L${X(w)} ${Y(L - tL)} C${X(w)} ${Y(L - tL * 0.45)} ${X(w * 0.32)} ${Y(L - 0.6)} ${X(w * 0.16)} ${Y(L)} L${X(-w * 0.16)} ${Y(L)} C${X(-w * 0.32)} ${Y(L - 0.6)} ${X(-w)} ${Y(L - tL * 0.45)} ${X(-w)} ${Y(L - tL)} L${X(-w)} ${Y(nL)} C${X(-w)} ${Y(nL * 0.5)} ${X(-w * 0.5)} ${Y(0)} ${cx} ${Y(0)} Z`;
  const wing = a.raked
    ? poly([[r, a.wingX], [s - 3, g.leAt(s - 3)], [s, g.tipTE - 0.5], [s, g.tipTE], [g.eK, g.kinkTE], [r, g.rootTE]])
    : poly([[r, a.wingX], [s - 0.15, g.tipLE - 0.05], [s, g.tipLE + 0.25], [s, g.tipTE], [g.eK, g.kinkTE], [r, g.rootTE]]);
  // Motor: a parte de trás fica escondida embaixo da asa.
  const nw = a.nacD / 2, nfOf = (e) => g.leAt(e) - a.nacFwd, nf = nfOf(a.engY);
  const nac = a.engines.map(({ y: e }) => [1, -1].map((sd) => {
    const c = cx + sd * e * k, n0 = nfOf(e), x1 = f(c - nw * k), x2 = f(c + nw * k), yA = Y(n0), yB = Y(n0 + a.nacLen);
    return `<path d="M${x1} ${Y(n0 + 0.4)} Q${x1} ${yA} ${f(c)} ${yA} Q${x2} ${yA} ${x2} ${Y(n0 + 0.4)} L${f(c + nw * 0.8 * k)} ${yB} L${f(c - nw * 0.8 * k)} ${yB} Z"/><ellipse class="inlet" cx="${f(c)}" cy="${Y(n0 + 0.12)}" rx="${f(nw * k * 0.8)}" ry="${f(0.25 * k)}"/>`;
  }).join('')).join('');
  const rS = r * 0.38, ss = a.stabSpan / 2, tS = Math.tan(a.stabSweep * D2R);
  const sTipLE = a.stabX + (ss - rS) * tS;
  const sAt = (e, fr) => { const le = a.stabX + (e - rS) * tS, te = a.stabX + a.stabRoot + (e - rS) / (ss - rS) * (sTipLE + a.stabTip - a.stabX - a.stabRoot); return le + fr * (te - le); };
  const stab = poly([[rS, sAt(rS, 0)], [ss - 0.2, sAt(ss - 0.2, 0)], [ss, sAt(ss, 0.2)], [ss, sAt(ss, 0.68)], [rS, sAt(rS, 0.68)]]);
  const elev = poly([[rS + 0.2, sAt(rS + 0.2, 0.7)], [ss, sAt(ss, 0.7)], [ss, sAt(ss, 1)], [rS + 0.2, sAt(rS + 0.2, 1)]]);
  const ft = Math.max(0.24, 3 / k);
  const fin = `M${X(0)} ${Y(a.finX)} L${X(ft)} ${Y(a.finX + a.finRoot * 0.4)} L${X(ft)} ${Y(a.finX + a.finRoot * 0.72)} L${X(-ft)} ${Y(a.finX + a.finRoot * 0.72)} L${X(-ft)} ${Y(a.finX + a.finRoot * 0.4)} Z`;
  const rud = `M${X(ft)} ${Y(a.finX + a.finRoot * 0.74)} L${X(ft * 0.7)} ${Y(L + 0.4)} L${X(-ft * 0.7)} ${Y(L + 0.4)} L${X(-ft)} ${Y(a.finX + a.finRoot * 0.74)} Z`;
  const glass = `M${X(-w * 0.42)} ${Y(nL * 0.36)} L${X(w * 0.42)} ${Y(nL * 0.36)} L${X(w * 0.74)} ${Y(nL * 0.7)} L${X(-w * 0.74)} ${Y(nL * 0.7)} Z`;
  const wl = a.wingletType ? poly([[s - 0.05, g.tipLE + 0.3], [s + 0.4, g.tipLE + 1.1], [s + 0.45, g.tipTE + 0.15], [s, g.tipTE]]) : '';
  const hid = (e, m, we, he) => `<rect class="hidden-part" x="${X(e - we / 2)}" y="${Y(m - he / 2)}" width="${f(we * k)}" height="${f(he * k)}" rx="2"/>`;
  const tank = poly([[r + 0.3, g.at(r + 0.3, 0.15)], [g.e2, g.at(g.e2, 0.15)], [g.e2, g.at(g.e2, 0.6)], [r + 0.3, g.at(r + 0.3, 0.6)]]);
  const midW = a.wingX + 2.4;
  const dimY = 488;
  return `
<svg class="plane" data-pv="top" viewBox="0 0 600 540" role="group" aria-label="${a.nome} visto de cima">
  <defs>
    <linearGradient id="jShadeT" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" style="stop-color:var(--shade)"/><stop offset=".35" style="stop-color:var(--plane)"/>
      <stop offset=".65" style="stop-color:var(--plane)"/><stop offset="1" style="stop-color:var(--shade)"/>
    </linearGradient>
    <pattern id="jGridT" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" class="grid-line"/></pattern>
  </defs>
  <rect width="600" height="540" fill="url(#jGridT)"/>
  <g class="airframe">
    ${part('trem', 'Trem de pouso', hid(0, a.noseGearX, 0.7, 1.3) + a.mains.map((m) => hid(m.y, m.x, 1.3, m.bogie ? 2.6 : 1.7) + hid(-m.y, m.x, 1.3, m.bogie ? 2.6 : 1.7)).join(''))}
    ${part('motor', 'Motores', nac)}
    ${part('asa', 'Asa', `<path d="${wing}"/>`)}
    ${part('slat', 'Slats', `<path d="${band(r + 0.9, a.engY - 1.3, 0, 0.11)} ${band(a.engY + 1.3, s - 0.4, 0, 0.11)}"/>`)}
    ${part('spoiler', 'Spoilers', `<path d="${band(r + 0.6, g.e2, 0.56, 0.7)}"/>`)}
    ${part('flap', 'Flaps', `<path d="${band(r + 0.25, g.eK, 0.72, 1)} ${band(g.eK + 0.15, g.e2, 0.74, 1)}"/>`)}
    ${part('aileron', 'Ailerons', `<path d="${band(g.e2 + 0.15, g.e3, 0.75, 1)}"/>`)}
    ${wl ? part('winglet', 'Winglets', `<path d="${wl}"/>`) : ''}
    ${part('estabh', 'Estabilizador horizontal', `<path d="${stab}"/>`)}
    ${part('profundor', 'Profundor', `<path d="${elev}"/>`)}
    ${part('fuselagem', 'Fuselagem', `<path class="jskin-t" d="${fus}"/>`)}
    ${part('estabv', 'Estabilizador vertical', `<rect class="hit" fill="transparent" x="${X(-1.4)}" y="${Y(a.finX)}" width="${f(2.8 * k)}" height="${f(a.finRoot * 0.72 * k)}"/><path class="${a.livery ? 'livery-fin' : ''}" d="${fin}"/>`)}
    ${part('leme', 'Leme de direção', `<rect class="hit" fill="transparent" x="${X(-1.4)}" y="${Y(a.finX + a.finRoot * 0.74)}" width="${f(2.8 * k)}" height="${f((L + 0.4 - a.finX - a.finRoot * 0.74) * k)}"/><path class="${a.livery ? 'livery-fin' : ''}" d="${rud}"/>`)}
    ${part('cabine', 'Cabine de comando', `<path class="jglass" d="${glass}"/>`)}
    ${part('apu', 'APU', `<rect class="hit" fill="transparent" x="${X(-1.2)}" y="${Y(L - 0.4)}" width="${f(2.4 * k)}" height="${f(1.6 * k)}"/><circle class="apu-dot" cx="${cx}" cy="${Y(L + 0.15)}" r="${f(Math.max(2.2, 0.25 * k))}"/>`)}
    ${part('pitot', 'Tubos de pitot', `<rect class="hit" fill="transparent" x="${X(-w - 1.2)}" y="${Y(nL * 0.45)}" width="${f((2 * w + 2.4) * k)}" height="${f(1.2 * k)}"/><path class="strut" d="M${X(w)} ${Y(nL * 0.6)} L${X(w + 0.55)} ${Y(nL * 0.66)} M${X(-w)} ${Y(nL * 0.6)} L${X(-w - 0.55)} ${Y(nL * 0.66)}"/>`)}
    ${part('luzes', 'Luzes externas', `<rect class="hit" fill="transparent" x="${X(-s - 1.4)}" y="${Y(g.tipLE - 0.6)}" width="${f(2.4 * k)}" height="${f(2.4 * k)}"/><rect class="hit" fill="transparent" x="${X(s - 1)}" y="${Y(g.tipLE - 0.6)}" width="${f(2.4 * k)}" height="${f(2.4 * k)}"/><circle class="nav-red" cx="${X(-s)}" cy="${Y(g.tipLE + 0.6)}" r="4"/><circle class="nav-green" cx="${X(s)}" cy="${Y(g.tipLE + 0.6)}" r="4"/><circle class="beacon" cx="${cx}" cy="${Y(midW)}" r="3.2"/>`)}
    <g class="deco" aria-hidden="true">
      <path class="panel" d="M${X(-w)} ${Y(nL)} L${X(w)} ${Y(nL)} M${X(-w)} ${Y(L - tL)} L${X(w)} ${Y(L - tL)}"/>
      <path class="panel" d="${[0.25, 0.5, 0.75].map((t) => { const e = r + 0.6 + t * (g.e2 - r - 0.6); return `M${X(e)} ${Y(g.at(e, 0.56))} L${X(e)} ${Y(g.at(e, 0.7))} M${X(-e)} ${Y(g.at(e, 0.56))} L${X(-e)} ${Y(g.at(e, 0.7))}`; }).join(' ')}"/>
      <path class="hidden-line" d="${a.engines.map(({ y: e }) => `M${X(e)} ${Y(g.leAt(e))} L${X(e)} ${Y(nfOf(e) + a.nacLen)} M${X(-e)} ${Y(g.leAt(e))} L${X(-e)} ${Y(nfOf(e) + a.nacLen)}`).join(' ')}"/>
    </g>
  </g>
  <g class="xray" hidden>
    <path class="x-tank" d="${tank}"/>
    <rect class="x-tank" x="${X(-w * 0.8)}" y="${Y(a.wingX + 0.6)}" width="${f(1.6 * w * k)}" height="${f((a.rootChord - 1.6) * k)}" rx="4"/>
    <path class="x-fuel" d="${a.engines.map(({ y: e }) => [1, -1].map((sd) => `M${X(0)} ${Y(midW)} L${X(sd * e)} ${Y(g.leAt(e) + 1)} L${X(sd * e)} ${Y(nfOf(e) + 1)}`).join(' ')).join(' ')}"/>
    <path class="x-cable" d="M${X(0)} ${Y(nL * 0.6)} L${X(0)} ${Y(a.stabX + 1)} L${X(0)} ${Y(L - 0.6)} M${X(0)} ${Y(midW + 1.5)} L${X(g.e2 + 1)} ${Y(g.at(g.e2 + 1, 0.8))} L${X(g.e3 - 1)} ${Y(g.at(g.e3 - 1, 0.8))} M${X(0)} ${Y(midW + 1.5)} L${X(-g.e2 - 1)} ${Y(g.at(g.e2 + 1, 0.8))} L${X(-g.e3 + 1)} ${Y(g.at(g.e3 - 1, 0.8))} M${X(0)} ${Y(a.stabX + 1)} L${X(ss - 0.8)} ${Y(sAt(ss - 0.8, 0.75))} M${X(0)} ${Y(a.stabX + 1)} L${X(-ss + 0.8)} ${Y(sAt(ss - 0.8, 0.75))}"/>
    <path class="x-elec" d="M${X(0)} ${Y(nL + 0.8)} L${X(0)} ${Y(midW - 0.5)} L${X(s)} ${Y(g.tipLE + 0.6)} M${X(0)} ${Y(midW - 0.5)} L${X(-s)} ${Y(g.tipLE + 0.6)} M${X(0)} ${Y(midW - 0.5)} L${X(0)} ${Y(L)} ${a.engines.map(({ y: e }) => `M${X(0)} ${Y(midW - 0.5)} L${X(e)} ${Y(nfOf(e) + 2)} M${X(0)} ${Y(midW - 0.5)} L${X(-e)} ${Y(nfOf(e) + 2)}`).join(' ')}"/>
    <rect class="x-batt" x="${X(-0.6)}" y="${Y(nL + 0.4)}" width="${f(1.2 * k)}" height="${f(0.8 * k)}" rx="2"/>
    <g class="x-legend mono">
      <rect x="14" y="26" width="168" height="58" rx="6"/>
      <path class="x-fuel" d="M26 42 H52"/><text x="60" y="46">Combustível</text>
      <path class="x-cable" d="M26 58 H52"/><text x="60" y="62">Comandos (hidráulica)</text>
      <path class="x-elec" d="M26 74 H52"/><text x="60" y="78">Elétrica</text>
    </g>
  </g>
  <g class="dim mono" aria-hidden="true">
    <path d="M${X(-a.span / 2)} ${dimY} L${X(a.span / 2)} ${dimY} M${X(-a.span / 2)} ${dimY - 8} L${X(-a.span / 2)} ${dimY + 8} M${X(a.span / 2)} ${dimY - 8} L${X(a.span / 2)} ${dimY + 8}"/>
    <text x="300" y="${dimY + 20}" text-anchor="middle">ENVERGADURA ${a.specs.env}</text>
    <path d="M588 ${Y(0)} L588 ${Y(L)} M580 ${Y(0)} L596 ${Y(0)} M580 ${Y(L)} L596 ${Y(L)}"/>
    <text x="0" y="0" text-anchor="middle" transform="translate(582 ${Y(L * 0.8)}) rotate(-90)">COMPRIMENTO ${a.specs.comp}</text>
  </g>
  <text class="nose-tag mono" x="300" y="18" text-anchor="middle">PROA ↑</text>
</svg>`;
}

/* ---------- 747-8: prancha em leve perspectiva (nariz à esquerda), desenhada à mão ---------- */
function side747(a) {
  const ovals = (x1, x2, yy, skip = []) => {
    let o = '';
    for (let xx = x1; xx <= x2; xx += 17) if (!skip.some(([s1, s2]) => xx > s1 && xx < s2)) o += `<ellipse class="bp-win" cx="${xx}" cy="${yy}" rx="4.2" ry="6.5"/>`;
    return o;
  };
  const door = (x0, y0, w, h) => `<rect class="bp-door" x="${x0}" y="${y0}" width="${w}" height="${h}" rx="6"/><rect class="bp-door" x="${x0 + w * 0.32}" y="${y0 + 10}" width="${w * 0.36}" height="${h * 0.22}" rx="3"/><path class="bp-door" d="M${x0 + w * 0.3} ${y0 + h * 0.55} h${w * 0.4}"/>`;
  const wheel = (cx, cy, rr = 21) => `<circle class="tire" cx="${cx}" cy="${cy}" r="${rr}"/><circle class="hub" cx="${cx}" cy="${cy}" r="${rr * 0.42}"/>`;
  const bogie = (xs, top, cy) => `<path class="strut" d="M${xs[1]} ${top} L${xs[1]} ${cy - 18} M${xs[0]} ${cy - 18} L${xs[xs.length - 1]} ${cy - 18}"/>` + xs.map((cx) => wheel(cx, cy)).join('');
  const engine = (cx, cy, rx, ry, rear, far) => `
    <path class="strut${far ? ' bp-far' : ''}" d="M${cx + 30} ${cy - ry + 6} L${cx + 90} ${cy - ry - 22}"/>
    <path class="${far ? 'bp-far' : ''}" d="M${cx} ${cy - ry} C${cx + 60} ${cy - ry - 4} ${rear - 40} ${cy - ry + 6} ${rear} ${cy - ry * 0.7} L${rear + 18} ${cy - ry * 0.35} L${rear + 18} ${cy + ry * 0.3} L${rear} ${cy + ry * 0.6} C${rear - 40} ${cy + ry} ${cx + 60} ${cy + ry} ${cx} ${cy + ry} Z"/>
    <path class="seam" d="M${(cx + rear) / 2 + 20} ${cy - ry + 2} L${(cx + rear) / 2 + 20} ${cy + ry - 4}"/>
    <ellipse class="bp-lip" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/>
    <ellipse class="inlet" cx="${cx + 4}" cy="${cy}" rx="${rx * 0.62}" ry="${ry * 0.68}"/>
    <circle class="hub" cx="${cx + 6}" cy="${cy}" r="${ry * 0.14}"/>`;
  const fus = 'M157 840 C157 800 190 756 262 728 C304 712 342 698 402 694 L700 692 C782 694 842 714 902 720 L1420 722 C1500 722 1560 714 1610 704 L1702 734 C1714 750 1714 778 1702 792 C1640 850 1560 878 1480 898 L700 958 C450 960 300 952 232 926 C182 906 157 876 157 840 Z';
  return `
<svg class="plane plane--side plane--bp" data-pv="side" viewBox="120 360 1860 760" role="group" aria-label="${a.nome} visto de lado, em leve perspectiva" hidden>
  <defs><pattern id="bpGrid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" class="grid-line"/></pattern></defs>
  <rect x="120" y="360" width="1860" height="760" fill="url(#bpGrid)"/>
  ${part('motor', 'Motores', engine(860, 930, 26, 34, 960, true) + engine(1330, 918, 24, 30, 1420, true))}
  ${part('estabv', 'Estabilizador vertical', '<path d="M1428 724 C1470 712 1502 690 1522 660 L1662 412 L1714 411 L1672 706 L1606 718 Z"/>')}
  ${part('leme', 'Leme de direção', '<path d="M1714 411 L1746 408 L1724 556 L1704 708 L1672 706 Z"/>')}
  ${part('trem', 'Trem de pouso', `<path class="strut" d="M338 948 L338 984"/>${wheel(326, 1006, 22)}${wheel(358, 1006, 22)}` + bogie([772, 797, 822, 847], 950, 1004) + bogie([928, 953, 978], 940, 1004) + bogie([1030, 1055, 1080, 1105, 1130], 930, 1006))}
  ${part('fuselagem', 'Fuselagem', `<path d="${fus}"/><path d="M690 948 C700 905 760 888 860 880 L960 914 C900 940 800 962 700 962 Z"/>`)}
  <g class="side-deco" aria-hidden="true">
    ${ovals(450, 760, 736, [[548, 600]])}
    ${ovals(232, 412, 832)}${ovals(520, 732, 830)}${ovals(836, 978, 830, [[880, 905]])}${ovals(1042, 1218, 828)}${ovals(1286, 1478, 826)}
    ${door(440, 800, 30, 66)}${door(746, 800, 28, 64)}${door(998, 797, 26, 62)}${door(1229, 796, 25, 60)}${door(1498, 794, 21, 56)}${door(552, 700, 34, 54)}
    <path class="ant" d="M562 694 L568 676 L574 676 L572 694 Z M1206 722 L1212 706 L1218 706 L1216 722 Z M600 958 L606 974 L612 974 L610 958 Z"/>
    <path class="s-line" d="M210 905 C200 880 202 820 216 800"/>
    <text class="liv-reg" x="1360" y="802" style="font-size:18px">PT-APR</text>
  </g>
  ${part('cabine', 'Cabine de comando', '<path class="jglass" d="M262 744 L282 726 L312 723 L306 744 Z"/><path class="jglass" d="M314 744 L320 724 L346 725 L351 744 Z"/>')}
  ${part('asa', 'Asa', '<path d="M700 940 C720 900 784 880 864 872 L1862 830 L1868 860 L1240 886 L944 916 C864 926 764 944 700 940 Z"/>')}
  ${part('flap', 'Flaps', '<path d="M1250 886 Q1286 934 1338 930 L1332 882 Z M1420 878 Q1452 918 1494 916 L1490 873 Z M1590 870 Q1614 900 1646 900 L1644 866 Z"/>')}
  ${part('motor', 'Motores', engine(1086, 940, 42, 56, 1226, false) + engine(1508, 928, 40, 52, 1656, false))}
  ${part('estabh', 'Estabilizador horizontal', '<path d="M1556 776 C1572 762 1622 754 1702 750 L1880 736 L1876 744 L1704 786 C1640 796 1580 796 1562 790 Z"/>')}
  ${part('profundor', 'Profundor', '<path d="M1704 786 L1876 744 L1872 752 L1708 798 Z"/>')}
  ${part('apu', 'APU', '<rect class="hit" fill="transparent" x="1686" y="740" width="40" height="50"/><ellipse class="apu-dot" cx="1704" cy="764" rx="4" ry="9"/>')}
  ${part('pitot', 'Tubos de pitot', '<rect class="hit" fill="transparent" x="300" y="846" width="50" height="34"/><path class="strut" d="M322 858 l10 3 M326 872 l9 2"/>')}
  ${part('luzes', 'Luzes externas', '<circle class="beacon" cx="902" cy="718" r="6"/><circle class="beacon" cx="760" cy="960" r="6"/><circle class="nav-red" cx="1864" cy="844" r="7"/><circle class="nav-white" cx="1712" cy="772" r="5"/>')}
  <g class="dim mono" aria-hidden="true">
    <path d="M164 1074 L1866 1074 M164 1058 L164 1090 M1866 1058 L1866 1090"/>
    <text x="1015" y="1112" text-anchor="middle" style="font-size:28px">COMPRIMENTO ${a.specs.comp}</text>
    <path d="M1944 406 L1944 1022 M1926 406 L1962 406 M1926 1022 L1962 1022"/>
    <text x="0" y="0" text-anchor="middle" transform="translate(1928 714) rotate(-90)" style="font-size:28px">ALTURA ${a.specs.alt}</text>
    <text x="170" y="400" style="font-size:24px">← PROA</text>
  </g>
</svg>`;
}

/* ---------- Vista lateral ---------- */
function side(a) {
  if (a.id === 'b747') return side747(a);
  const g = geo(a);
  const k = Math.min(500 / a.L, 186 / a.H);
  const G = 246, xN = 40 + a.L * k;
  const x = (m) => f(xN - m * k), y = (h) => f(G - h * k);
  const { r, s } = g, hc = a.hc, D = a.D, nL = a.noseLen, tL = a.tailLen, L = a.L;
  const hT = hc + r, hB = hc - r;

  // Fuselagem: nariz afilado, para-brisa inclinado e cauda subindo até a saída da APU.
  const hu = a.hump;
  const crown = hu
    ? `L${x(hu.end + 3)} ${y(hT)} C${x(hu.end)} ${y(hT)} ${x(hu.end - 1)} ${y(hu.top)} ${x(hu.end - 4)} ${y(hu.top)} L${x(nL * 1.6)} ${y(hu.top)} C${x(nL * 0.7)} ${y(hu.top)} ${x(nL * 0.2)} ${y(hc + 0.1 * D)} ${x(0)} ${y(hc - 0.1 * D)}`
    : `L${x(nL * 1.5)} ${y(hT)} C${x(nL * 0.62)} ${y(hT)} ${x(nL * 0.2)} ${y(hc + 0.14 * D)} ${x(0)} ${y(hc - 0.12 * D)}`;
  const fus = `M${x(L)} ${y(hc + 0.18 * D)} L${x(L - tL * 0.55)} ${y(hT)} ${crown} C${x(0.03)} ${y(hc - 0.34 * D)} ${x(nL * 0.35)} ${y(hB)} ${x(nL * 1.2)} ${y(hB)} L${x(L - tL)} ${y(hB)} Q${x(L - tL * 0.3)} ${y(hB)} ${x(L)} ${y(hc + 0.02 * D)} Z`;
  const fairing = `M${x(a.wingX - 2.5)} ${y(hB + 0.05)} C${x(a.wingX - 0.5)} ${y(hB - 0.26 * D)} ${x(g.rootTE + 0.5)} ${y(hB - 0.26 * D)} ${x(g.rootTE + 3)} ${y(hB + 0.05)} Z`;
  const cw = a.cockpitWin || [[nL * 0.95, hc + 0.36 * D], [nL * 0.55, hc + 0.29 * D], [nL * 0.45, hc + 0.16 * D], [nL * 0.95, hc + 0.2 * D]];
  const glass = 'M' + cw.map(([m, h]) => `${x(m)} ${y(h)}`).join(' L') + ' Z';
  const mull = [0.35, 0.68].map((t) => { const m1 = cw[0][0] + t * (cw[1][0] - cw[0][0]), h1 = cw[0][1] + t * (cw[1][1] - cw[0][1]); const m2 = cw[3][0] + t * (cw[2][0] - cw[3][0]), h2 = cw[3][1] + t * (cw[2][1] - cw[3][1]); return `M${x(m1)} ${y(h1)} L${x(m2)} ${y(h2)}`; }).join(' ');

  // Asa: vista quase de perfil, subindo para a ponta por causa do diedro.
  const t6 = Math.tan(6 * D2R);
  const hW = hc - 0.42 * D, hTip = hW + (s - r) * t6;
  const wing = `M${x(a.wingX)} ${y(hW + 0.1)} L${x(g.tipLE)} ${y(hTip + 0.15)} L${x(g.tipTE)} ${y(hTip)} L${x(g.rootTE)} ${y(hW - 0.2)} Z`;
  // "Canoas": carenagens dos trilhos dos flaps, penduradas embaixo da asa.
  const canoes = [0.28, 0.5, 0.72].map((t) => { const e = r + t * (s - r), m = g.at(e, 0.9), h = hW + (e - r) * t6 - 0.05; return `M${x(m - 1.7)} ${y(h)} Q${x(m - 0.2)} ${y(h - 0.6)} ${x(m + 1.5)} ${y(h - 0.05)} Z`; }).join(' ');
  const wh = a.wingletH;
  const wl = a.wingletType === 'blended'
    ? `M${x(g.tipLE + 0.1)} ${y(hTip + 0.15)} Q${x(g.tipLE + 0.35)} ${y(hTip + wh * 0.45)} ${x(g.tipLE + 1.3)} ${y(hTip + wh)} L${x(g.tipLE + 1.95)} ${y(hTip + wh)} Q${x(g.tipTE + 0.05)} ${y(hTip + 0.6)} ${x(g.tipTE)} ${y(hTip)} Z`
    : a.wingletType === 'sharklet'
      ? `M${x(g.tipLE + 0.05)} ${y(hTip + 0.15)} Q${x(g.tipLE + 0.25)} ${y(hTip + 0.7)} ${x(g.tipLE + 0.9)} ${y(hTip + wh)} L${x(g.tipLE + 1.6)} ${y(hTip + wh)} Q${x(g.tipTE)} ${y(hTip + 0.9)} ${x(g.tipTE)} ${y(hTip)} Z` : '';

  // Motores: capô do fan, saída do núcleo e cone; pilone até a asa. O de fora fica por cima (mais perto de quem olha).
  const engine = ({ y: e, bottom: hb }) => {
    const nd = a.nacD, nl = a.nacLen, cl = a.coreLen || 1.4;
    const sF = g.leAt(e) - a.nacFwd, sC = sF + nl, ht = hb + nd;
    const hWe = hW + (e - r) * t6, hp = Math.max(hWe, ht - 0.2) + 0.25;
    const pylon = `M${x(sF + nl * 0.3)} ${y(ht - 0.3)} L${x(sC + cl * 0.4)} ${y(ht - 0.5)} L${x(sC + cl + 0.6)} ${y(hp)} L${x(sF + nl * 0.45)} ${y(hp + 0.35)} Z`;
    const lipB = hb + (a.flatInlet ? nd * 0.1 : 0.05);
    const cowl = `M${x(sF)} ${y(ht - 0.06 * nd)} Q${x(sF + 0.25)} ${y(ht)} ${x(sF + nl * 0.25)} ${y(ht)} L${x(sC)} ${y(ht - 0.12 * nd)} L${x(sC)} ${y(hb + 0.16 * nd)} L${x(sF + nl * 0.3)} ${y(hb)} Q${x(sF + 0.3)} ${y(hb)} ${x(sF)} ${y(lipB)} Z`;
    const core = `M${x(sC - 0.1)} ${y(ht - 0.24 * nd)} L${x(sC + cl)} ${y(ht - 0.32 * nd)} L${x(sC + cl)} ${y(hb + 0.32 * nd)} L${x(sC - 0.1)} ${y(hb + 0.26 * nd)} Z`;
    const plug = `M${x(sC + cl)} ${y(ht - 0.37 * nd)} L${x(sC + cl + nd * 0.45)} ${y(hb + nd * 0.5)} L${x(sC + cl)} ${y(hb + 0.37 * nd)} Z`;
    const seams = `M${x(sF + nl * 0.42)} ${y(ht - 0.02)} L${x(sF + nl * 0.42)} ${y(hb + 0.04)} M${x(sF + nl * 0.68)} ${y(ht - 0.06 * nd)} L${x(sF + nl * 0.68)} ${y(hb + 0.08 * nd)}`;
    const lip = `<ellipse class="inlet" cx="${x(sF - 0.05)}" cy="${y((ht + lipB) / 2)}" rx="${f(0.14 * k)}" ry="${f((ht - lipB) * k * 0.47)}"/>`;
    return `<path class="jskin-s" d="${pylon}"/><path class="cone" d="${core}"/><path class="cone" d="${plug}"/><path class="jskin-s" d="${cowl}"/><path class="seam" d="${seams}"/>${lip}`;
  };
  const engines = [...a.engines].sort((p, q) => p.y - q.y).map(engine).join('');

  const rS = r * 0.38, ss = a.stabSpan / 2, tS = Math.tan(a.stabSweep * D2R);
  const hs = hc + 0.12 * D, hsT = hs + (ss - rS) * Math.tan(7 * D2R);
  const sTipLE = a.stabX + (ss - rS) * tS;
  const stab = `M${x(a.stabX)} ${y(hs + 0.12)} L${x(sTipLE)} ${y(hsT + 0.12)} L${x(sTipLE + a.stabTip * 0.68)} ${y(hsT - 0.05)} L${x(a.stabX + a.stabRoot * 0.68)} ${y(hs - 0.18)} Z`;
  const elev = `M${x(a.stabX + a.stabRoot * 0.7)} ${y(hs - 0.18)} L${x(sTipLE + a.stabTip * 0.7)} ${y(hsT - 0.05)} L${x(sTipLE + a.stabTip)} ${y(hsT - 0.1)} L${x(a.stabX + a.stabRoot)} ${y(hs - 0.24)} Z`;

  // Deriva com a "barbatana dorsal" que se curva para dentro da fuselagem.
  const tF = Math.tan(a.finSweep * D2R);
  const fTipLE = a.finX + (a.H - hT) * tF, hFil = hT + D * 0.2;
  const fin = `M${x(a.finX - D * 0.9)} ${y(hT)} Q${x(a.finX - 0.2)} ${y(hT + 0.05)} ${x(a.finX + (hFil - hT) * tF)} ${y(hFil)} L${x(fTipLE)} ${y(a.H)} L${x(fTipLE + a.finTip * 0.68)} ${y(a.H)} L${x(a.finX + a.finRoot * 0.68)} ${y(hc)} L${x(a.finX - D * 0.9)} ${y(hc)} Z`;
  const rud = `M${x(fTipLE + a.finTip * 0.7)} ${y(a.H - 0.05)} L${x(fTipLE + a.finTip)} ${y(a.H - 0.15)} L${x(L + 0.25)} ${y(hc + r * 0.5)} L${x(a.finX + a.finRoot * 0.7)} ${y(hc + r * 0.5)} Z`;

  // Pintura (só no 737): cauda laranja com arcos cinza, nome na fuselagem e matrícula.
  const lv = a.livery, finCls = lv ? 'livery-fin' : 'jskin-s';
  const livTail = lv ? `<clipPath id="tailClip"><path d="${fin} ${rud}"/></clipPath><g class="livery" clip-path="url(#tailClip)" aria-hidden="true">
    <circle class="liv-grey" cx="${x(a.finX + a.finRoot * 0.12)}" cy="${y(hT + 1.1)}" r="${f(3.6 * k)}"/>
    <circle class="liv-light" cx="${x(a.finX + a.finRoot * 0.02)}" cy="${y(hT + 1.5)}" r="${f(2.4 * k)}"/>
    <path class="liv-grey" d="M${x(a.finX - D * 0.9)} ${y(hT)} L${x(a.finX + (hFil - hT) * tF + 0.4)} ${y(hFil + 0.3)} L${x(a.finX + a.finRoot * 0.75)} ${y(hT)} Z"/></g>` : '';
  const livTitle = lv ? `<text class="liv-title" x="${x(13.4)}" y="${y(hc - 0.22 * D)}" textLength="${f(7.2 * k)}" lengthAdjust="spacingAndGlyphs" style="font-size:${f(0.5 * D * k)}px">${lv.title}</text><text class="liv-reg" x="${x(L - tL * 0.62)}" y="${y(hc - 0.02 * D)}" style="font-size:${f(0.16 * D * k)}px">${lv.reg}</text>` : '';

  // Trem: perna e rodas (truque de 4 rodas no 747 mostra duas de lado).
  const wr = a.wheelR, nr = wr * 0.7;
  const wheel = (m, rad) => `<circle class="tire" cx="${x(m)}" cy="${y(rad)}" r="${f(rad * k)}"/><circle class="hub" cx="${x(m)}" cy="${y(rad)}" r="${f(rad * k * 0.38)}"/>`;
  const gear = a.mains.map((mg) => `<path class="strut" d="M${x(mg.x)} ${y(hB + 0.2)} L${x(mg.x)} ${y(wr)}${mg.bogie ? ` M${x(mg.x - 0.85)} ${y(wr)} L${x(mg.x + 0.85)} ${y(wr)}` : ''}"/>` + (mg.bogie ? wheel(mg.x - 0.85, wr) + wheel(mg.x + 0.85, wr) : wheel(mg.x + 0.3, wr))).join('')
    + `<path class="strut" d="M${x(a.noseGearX)} ${y(hB + 0.3)} L${x(a.noseGearX)} ${y(nr)}"/>${wheel(a.noseGearX, nr)}`;

  // Detalhes: janelas, portas, saídas sobre a asa, antenas e faixa.
  const doorsM = a.doors || [], exitsM = a.exits || [];
  const blocked = (m) => doorsM.some((d) => m > d - 0.25 && m < d + 1.15) || exitsM.some((e) => m > e - 0.1 && m < e + 0.7);
  const winRow = (m1, m2, h) => {
    let out = '';
    for (let m = m2; m <= m1; m += 0.53) {
      if (!blocked(m)) out += `<rect class="win" x="${x(m + 0.26)}" y="${y(h + 0.22)}" width="${f(0.26 * k)}" height="${f(0.42 * k)}" rx="${f(0.1 * k)}"/>`;
    }
    return out;
  };
  const wy = hc + 0.13 * D;
  const rows = winRow(L - tL - 0.4, nL + 2.4, wy) + (hu ? winRow(hu.end - 4.5, nL * 1.75, hu.top - 0.95) : '');
  const door = (m) => `<rect class="door" x="${x(m + 0.9)}" y="${y(hc + 0.3 * D)}" width="${f(0.9 * k)}" height="${f(0.5 * D * k)}" rx="2"/><rect class="win" x="${x(m + 0.6)}" y="${y(hc + 0.22 * D)}" width="${f(0.3 * k)}" height="${f(0.12 * D * k)}" rx="1"/><path class="door" d="M${x(m + 0.62)} ${y(hc + 0.02 * D)} L${x(m + 0.3)} ${y(hc + 0.02 * D)}"/>`;
  const exit = (m) => `<rect class="door" x="${x(m + 0.6)}" y="${y(hc + 0.25 * D)}" width="${f(0.6 * k)}" height="${f(0.3 * D * k)}" rx="2"/>`;
  const cargo = (m) => `<rect class="door" x="${x(m + 1.3)}" y="${y(hc - 0.14 * D)}" width="${f(1.3 * k)}" height="${f(0.27 * D * k)}" rx="2"/><path class="door" d="M${x(m + 1.05)} ${y(hc - 0.3 * D)} L${x(m + 0.25)} ${y(hc - 0.3 * D)}"/>`;
  const ant = (m, top) => `<path class="ant" d="M${x(m)} ${y(top ? hT : hB)} L${x(m + 0.5)} ${y(top ? hT + 0.55 : hB - 0.55)} L${x(m + 0.7)} ${y(top ? hT + 0.55 : hB - 0.55)} L${x(m + 0.6)} ${y(top ? hT : hB)} Z"/>`;
  const stripe = `M${x(L - tL * 0.35)} ${y(hc + 0.02 * D)} L${x(nL * 0.62)} ${y(hc + 0.02 * D)} L${x(nL * 0.55)} ${y(hc - 0.05 * D)} L${x(L - tL * 0.25)} ${y(hc - 0.05 * D)} Z`;
  const topAnt = hu ? hu.end - 6 : a.wingX - 4;

  return `
<svg class="plane plane--side" data-pv="side" viewBox="0 0 600 290" role="group" aria-label="${a.nome} visto de lado" hidden>
  <defs>
    <linearGradient id="jShadeS" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" style="stop-color:var(--plane)"/><stop offset=".55" style="stop-color:var(--plane)"/><stop offset="1" style="stop-color:var(--shade)"/>
    </linearGradient>
    <pattern id="jGridS" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" class="grid-line"/></pattern>
  </defs>
  <rect width="600" height="290" fill="url(#jGridS)"/>
  <rect class="side-ground" x="0" y="${G}" width="600" height="6"/>
  ${part('estabv', 'Estabilizador vertical', `<path class="${finCls}" d="${fin}"/>`)}
  ${part('leme', 'Leme de direção', `<path class="${finCls}" d="${rud}"/>`)}
  ${livTail}
  ${part('trem', 'Trem de pouso', gear)}
  ${part('fuselagem', 'Fuselagem', `<path class="jskin-s" d="${fus}"/><path class="jskin-s" d="${fairing}"/>`)}
  <g class="side-deco" aria-hidden="true">
    ${lv ? '' : `<path class="s-stripe" d="${stripe}"/>`}
    ${rows}${doorsM.map(door).join('')}${exitsM.map(exit).join('')}${cargo(a.wingX - 4.2)}${cargo(g.rootTE + 3.2)}${livTitle}
    ${ant(topAnt, true)}${ant(nL + 3, true)}${ant(nL + 5, false)}
    <path class="s-line" d="M${x(nL * 0.42)} ${y(hc - 0.16 * D)} Q${x(nL * 0.3)} ${y(hc - 0.02 * D)} ${x(nL * 0.42)} ${y(hc + 0.12 * D)}"/>
  </g>
  ${part('cabine', 'Cabine de comando', `<path class="jglass" d="${glass}"/><path class="seam" d="${mull}"/>`)}
  ${part('asa', 'Asa', `<path class="wing-s" d="${wing}"/>`)}
  ${part('flap', 'Flaps', `<path class="jskin-s" d="${canoes}"/>`)}
  ${wl ? part('winglet', 'Winglets', `<path class="jskin-s" d="${wl}"/>`) : ''}
  ${part('motor', 'Motores', engines)}
  ${part('estabh', 'Estabilizador horizontal', `<path class="jskin-s" d="${stab}"/>`)}
  ${part('profundor', 'Profundor', `<path d="${elev}"/>`)}
  ${part('apu', 'APU', `<rect class="hit" fill="transparent" x="${x(L + 0.5)}" y="${y(hc + 0.5 * D)}" width="${f(1.4 * k)}" height="${f(0.7 * D * k)}"/><rect class="apu-dot" x="${x(L + 0.2)}" y="${y(hc + 0.16 * D)}" width="${f(0.35 * k)}" height="${f(0.13 * D * k)}" rx="1"/>`)}
  ${part('pitot', 'Tubos de pitot', `<rect class="hit" fill="transparent" x="${x(nL * 0.75)}" y="${y(hc + 0.12 * D)}" width="${f(nL * 0.4 * k)}" height="${f(0.3 * D * k)}"/><path class="strut" d="M${x(nL * 0.6)} ${y(hc + 0.02 * D)} L${x(nL * 0.52)} ${y(hc + 0.02 * D)}"/>`)}
  ${part('luzes', 'Luzes externas', `<circle class="beacon" cx="${x(a.wingX + 2)}" cy="${y(hT + 0.1)}" r="3"/><circle class="nav-green" cx="${x(a.wingletType ? g.tipLE + 1.6 : g.tipTE - 0.3)}" cy="${y(a.wingletType ? hTip + wh - 0.1 : hTip + 0.1)}" r="3"/><circle class="nav-white" cx="${x(L + 0.1)}" cy="${y(hc + 0.1 * D)}" r="2.2"/>`)}
  <g class="dim mono" aria-hidden="true">
    <path d="M${x(L)} 268 L${x(0)} 268 M${x(L)} 260 L${x(L)} 276 M${x(0)} 260 L${x(0)} 276"/>
    <text x="${f((+x(L) + +x(0)) / 2)}" y="284" text-anchor="middle">COMPRIMENTO ${a.specs.comp}</text>
    <path d="M572 ${y(a.H)} L572 ${G} M564 ${y(a.H)} L580 ${y(a.H)} M564 ${G} L580 ${G}"/>
    <text x="0" y="0" text-anchor="middle" transform="translate(566 ${f((+y(a.H) + G) / 2)}) rotate(-90)">ALTURA ${a.specs.alt}</text>
    <text x="560" y="20" text-anchor="end">PROA →</text>
  </g>
</svg>`;
}

window.HangarJets = {
  list: JETS,
  parts,
  order: (a) => ORDER.filter((id) => id !== 'winglet' || a.wingletType),
  top, side,
};
})();
