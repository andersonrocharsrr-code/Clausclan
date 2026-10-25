/* Motor GEnx-2B do 747-8 em corte: o ar entrando, o fan, o bypass, os compressores, a câmara e as turbinas.
   Medidas em metros (x ao longo do eixo, a partir da boca da nacele; r = raio). Valores de desempenho aproximados. */
(() => {
const $ = (s) => document.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const nf = (v, d = 0) => v.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });

// Perfis: lin = retas entre os pontos; smooth = curva suave (Hermite) passando pelos pontos.
function lin(p) {
  return (x) => {
    if (x <= p[0][0]) return p[0][1];
    for (let i = 1; i < p.length; i++) if (x <= p[i][0]) { const [x0, y0] = p[i - 1], [x1, y1] = p[i]; return y0 + (y1 - y0) * (x - x0) / (x1 - x0); }
    return p[p.length - 1][1];
  };
}
function smooth(p) {
  const n = p.length, m = p.map((_, i) => {
    const a = p[Math.max(0, i - 1)], b = p[Math.min(n - 1, i + 1)];
    return (b[1] - a[1]) / (b[0] - a[0]);
  });
  return (x) => {
    if (x <= p[0][0]) return p[0][1];
    for (let i = 1; i < n; i++) if (x <= p[i][0]) {
      const [x0, y0] = p[i - 1], [x1, y1] = p[i], h = x1 - x0, t = (x - x0) / h, t2 = t * t, t3 = t2 * t;
      return (2 * t3 - 3 * t2 + 1) * y0 + (t3 - 2 * t2 + t) * h * m[i - 1] + (-2 * t3 + 3 * t2) * y1 + (t3 - t2) * h * m[i];
    }
    return p[n - 1][1];
  };
}

/* ---------- Geometria ---------- */
const nacOut = smooth([[-0.05, 1.40], [0.0, 1.47], [0.12, 1.535], [0.4, 1.585], [1.0, 1.61], [1.8, 1.60], [2.6, 1.53], [3.2, 1.42], [3.7, 1.27]]);
const caseIn = smooth([[-0.05, 1.40], [0.05, 1.352], [0.4, 1.336], [0.85, 1.34], [1.2, 1.345], [2.0, 1.33], [2.8, 1.28], [3.7, 1.235]]);
const spin = smooth([[0.12, 0], [0.2, 0.07], [0.4, 0.18], [0.65, 0.30], [0.88, 0.37], [1.15, 0.40]]);
const cowl = smooth([[1.28, 0.69], [1.4, 0.735], [1.7, 0.78], [2.3, 0.80], [3.0, 0.80], [3.7, 0.76], [4.6, 0.68], [5.4, 0.60], [5.8, 0.52]]);
const outC = lin([[1.28, 0.69], [1.42, 0.645], [2.02, 0.60], [2.3, 0.50], [2.55, 0.44], [2.65, 0.425], [3.58, 0.365], [3.7, 0.42], [4.05, 0.425], [4.1, 0.40], [4.45, 0.44], [5.45, 0.55], [5.8, 0.50]]);
const inC = lin([[1.15, 0.40], [1.42, 0.44], [2.02, 0.48], [2.3, 0.40], [2.55, 0.32], [2.65, 0.30], [3.58, 0.305], [3.7, 0.26], [4.05, 0.26], [4.1, 0.31], [4.45, 0.315], [5.45, 0.34], [5.8, 0.31], [6.7, 0.0]]);
const hubIn = (x) => (x < 0.12 ? 0 : x < 1.15 ? spin(x) : inC(x));
const caseAt = (x) => (x < -0.05 ? 1.40 + 0.42 * clamp((-0.05 - x) / 0.85, 0, 1) ** 1.5 : caseIn(x));
const SPLIT = 1.28, FAN_NOZ = 3.7, CORE_NOZ = 5.8, X0 = -0.9, X1 = 7.6;
const FSPLIT = (0.69 - hubIn(SPLIT)) / (caseAt(SPLIT) - hubIn(SPLIT));

// Fileiras de pás. r = rotor (gira), s = estator (palhetas fixas). sp = eixo (lp = N1, hp = N2).
const ROWS = [];
const row = (o) => ROWS.push({ n: 28, st: 40, ...o });
row({ part: 'fan', kind: 'r', sp: 'lp', x: 0.86, n: 18, fan: true, hub: hubIn, tip: (x) => caseIn(x) - 0.008 });
row({ part: 'ogv', kind: 's', x: 1.86, c: 0.2, n: 26, st: -12, hub: cowl, tip: caseIn });
for (let i = 0; i < 4; i++) {
  row({ part: 'lpc', kind: 'r', sp: 'lp', x: 1.45 + i * 0.14, c: 0.055, n: 26, st: 45, hub: inC, tip: outC });
  row({ part: 'lpc', kind: 's', x: 1.52 + i * 0.14, c: 0.05, n: 30, st: -35, hub: inC, tip: outC });
}
for (let i = 0; i < 10; i++) {
  row({ part: 'hpc', kind: 'r', sp: 'hp', x: 2.67 + i * 0.092, c: 0.04, n: 30, st: -45, hub: inC, tip: outC });
  row({ part: 'hpc', kind: 's', x: 2.715 + i * 0.092, c: 0.035, n: 34, st: 35, hub: inC, tip: outC });
}
for (let i = 0; i < 2; i++) {
  row({ part: 'hpt', kind: 's', hot: 1, x: 4.10 + i * 0.17, c: 0.06, n: 24, st: 50, hub: inC, tip: outC });
  row({ part: 'hpt', kind: 'r', hot: 1, sp: 'hp', x: 4.18 + i * 0.17, c: 0.06, n: 30, st: -55, hub: inC, tip: outC });
}
for (let i = 0; i < 6; i++) {
  row({ part: 'lpt', kind: 's', hot: 0.6, x: 4.47 + i * 0.163, c: 0.06, n: 26, st: -40, hub: inC, tip: outC });
  row({ part: 'lpt', kind: 'r', hot: 0.6, sp: 'lp', x: 4.55 + i * 0.163, c: 0.065, n: 30, st: 45, hub: inC, tip: outC });
}
row({ part: 'nozzle', kind: 's', x: 5.5, c: 0.12, n: 12, st: 0, hub: inC, tip: outC });
const SHAFT = { lp: 0.075, hp: 0.17 };

/* ---------- Peças e etapas ---------- */
const band = (x0, x1, lo, hi, n = 16) => {
  const top = [], bot = [];
  for (let i = 0; i <= n; i++) { const x = lerp(x0, x1, i / n); top.push([x, hi(x)]); bot.push([x, lo(x)]); }
  return top.concat(bot.reverse());
};
const K = (v) => () => v;
const BRG = [[1.08, 'lp'], [2.56, 'hp'], [4.5, 'lp'], [5.56, 'lp']]; // mancais: posição e eixo
const brgR = (s) => SHAFT[s] + 0.028;
const box = (x0, x1, r0, r1) => [[x0, r1], [x1, r1], [x1, r0], [x0, r0]];
const AGB = [1.62, 2.42]; // caixa de acessórios, embaixo da carcaça do fan
const agbLo = (x) => caseIn(x) + 0.125, agbHi = (x) => nacOut(x) - 0.035;
const PARTS = {
  inlet: { nome: 'Entrada de ar', at: [0.06, 1.47], polys: [band(-0.05, 0.75, caseIn, nacOut)] },
  spinner: { nome: 'Cone do fan (spinner)', at: [0.45, 0.12], polys: [band(0.12, 0.92, K(0), spin)] },
  fan: { nome: 'Pás do fan (fan blades)', at: [0.98, 0.95], polys: [band(0.80, 1.18, hubIn, caseIn)] },
  fancase: { nome: 'Carcaça do fan', at: [1.2, 1.5], polys: [band(0.72, 1.55, caseIn, (x) => caseIn(x) + 0.12)] },
  splitter: { nome: 'Divisor de fluxo', at: [1.36, 0.69], polys: [band(1.28, 1.75, outC, cowl)] },
  ogv: { nome: 'Palhetas guia (OGV)', at: [1.96, 1.12], polys: [band(1.82, 2.1, cowl, caseIn)] },
  bypass: { nome: 'Duto do fan (bypass)', at: [2.9, 1.04], polys: [band(1.28, 3.7, cowl, caseIn)] },
  lpc: { nome: 'Compressor de baixa (booster)', at: [1.72, -0.54], polys: [band(1.42, 2.04, inC, outC)] },
  vbv: { nome: 'Válvulas de sangria (VBV)', at: [2.17, -0.62], polys: [band(2.04, 2.3, outC, cowl)] },
  hpc: { nome: 'Compressor de alta (HPC)', at: [3.1, -0.35], polys: [band(2.62, 3.6, inC, outC)] },
  fuel: { nome: 'Injetor de combustível', at: [3.64, -0.38], polys: [band(3.58, 3.71, K(0.325), K(0.43))] },
  comb: { nome: 'Câmara de combustão', at: [3.88, -0.33], polys: [band(3.6, 4.08, inC, outC)] },
  hpt: { nome: 'Turbina de alta (HPT)', at: [4.27, -0.36], polys: [band(4.08, 4.46, inC, outC)] },
  lpt: { nome: 'Turbina de baixa (LPT)', at: [4.98, -0.44], polys: [band(4.46, 5.48, inC, outC)] },
  hpshaft: { nome: 'Eixo de alta (N2)', at: [3.3, -0.145], polys: [band(2.6, 4.45, K(0.115), K(0.17))] },
  lpshaft: { nome: 'Eixo de baixa (N1)', at: [5.2, -0.04], polys: [band(0.95, 5.6, K(0), K(0.075))] },
  mancal: { nome: 'Mancais (rolamentos)', at: [4.5, -0.103], polys: BRG.map(([x, s]) => box(x - 0.045, x + 0.045, brgR(s) - 0.035, brgR(s) + 0.035)) },
  agb: { nome: 'Caixa de acessórios', only: -1, at: [2.05, -1.47], polys: [band(AGB[0], AGB[1], agbLo, agbHi)] },
  nozzle: { nome: 'Bocal e cone de escape', at: [6.15, -0.28], polys: [band(5.45, 6.75, K(0), (x) => (x <= 5.8 ? cowl(x) : 0.52))] },
};
Object.values(PARTS).forEach((p, i) => { p.n = i + 1; });
// Ordem para o toque no desenho: as peças menores primeiro.
const HIT = ['mancal', 'agb', 'vbv', 'fuel', 'splitter', 'ogv', 'spinner', 'fan', 'lpc', 'hpc', 'comb', 'hpt', 'lpt', 'hpshaft', 'lpshaft', 'nozzle', 'inlet', 'fancase', 'bypass'];

const STEPS = [
  { t: 'O caminho do ar', cam: [X0, X1 - 0.2, 1.75], parts: [],
    txt: 'O GEnx-2B é um turbofan de dois eixos. O ar entra pela frente e o fan empurra a maior parte dele por fora do motor (bypass). Uma parte menor entra no núcleo, onde é comprimida, misturada com combustível, queimada e solta pelas turbinas, que giram o fan e os compressores. Passe as etapas para seguir o ar do começo ao fim.',
    facts: [['Empuxo máximo', '296 kN · 66.500 lbf'], ['Diâmetro do fan', '2,67 m'], ['Bypass', '8 : 1'], ['Compressão total', 'cerca de 44 vezes']] },
  { t: 'Entrada de ar', cam: [-0.7, 1.9, 1.75], parts: ['inlet', 'spinner'],
    txt: 'A boca da nacele (inlet) leva o ar até o fan de forma lisa e uniforme, mesmo com o avião inclinado ou com vento de lado. A borda é aquecida com ar quente do próprio motor para não juntar gelo, e as paredes têm painéis acústicos que absorvem parte do barulho. O cone no centro (spinner) gira com o fan e guia o ar para as pás.',
    facts: [['Antigelo', 'Ar quente do motor'], ['Paredes', 'Painéis acústicos'], ['Spinner', 'Gira com o fan']] },
  { t: 'Fan e pás do fan', cam: [-0.25, 2.1, 1.75], parts: ['fan', 'fancase'],
    txt: 'O fan é a primeira e maior roda de pás: 18 pás (fan blades) de fibra de carbono, com a borda de ataque metálica para aguentar impactos. Cada pá é torcida, quase de frente perto do centro e bem inclinada na ponta, porque a ponta anda muito mais rápido. Na decolagem as pontas passam da velocidade do som. A carcaça em volta, também de compósito, segura qualquer pedaço caso uma pá se solte.',
    facts: [['Pás', '18, de fibra de carbono'], ['Diâmetro', '2,67 m'], ['Empuxo', 'A maior parte vem do fan'], ['Eixo', 'N1 (baixa)']] },
  { t: 'Divisor e duto do fan (bypass)', cam: [0.5, 4.7, 1.75], parts: ['splitter', 'ogv', 'bypass'],
    txt: 'Logo atrás do fan, o divisor separa o ar em dois caminhos. Cerca de 8 partes vão por fora, pelo duto do fan, para cada parte que entra no núcleo. O fan deixa o ar girando; as palhetas guia (OGV) endireitam esse fluxo para ele sair reto pela traseira, o que dá mais empuxo. É nesse duto que fica o reversor, que desvia o ar do fan para a frente no pouso.',
    facts: [['Bypass', '8 : 1'], ['OGV', 'Palhetas fixas'], ['Reversor', 'No fim do duto']] },
  { t: 'Compressor de baixa (booster)', cam: [1.1, 2.85, 0.9], parts: ['lpc', 'vbv'],
    txt: 'O ar do núcleo passa primeiro pelo booster: 4 estágios presos no mesmo eixo do fan. Cada estágio tem uma fileira de pás que giram (rotor, as blades) e logo atrás uma fileira de palhetas fixas (estator, as vanes). O rotor acelera o ar e o estator freia esse ar, transformando a velocidade em pressão. Logo depois ficam as válvulas de sangria variável (VBV): em baixa rotação elas abrem e jogam parte do ar no duto do fan, para o compressor não engasgar. Mexa na manete e veja as portinhas abrindo e fechando. Logo abaixo, em Seções em detalhe, o booster aparece de perto.',
    facts: [['Estágios', '4'], ['1 estágio', 'Rotor + estator'], ['Eixo', 'N1 (baixa)'], ['VBV', 'Abertas em baixa rotação']] },
  { t: 'Compressor de alta (HPC)', cam: [2.2, 3.9, 0.6], parts: ['hpc'],
    txt: 'São 10 estágios, cada um menor que o anterior, porque o ar ocupa menos espaço quanto mais apertado. O HPC comprime o ar cerca de 23 vezes, e ele sai a mais de 600 °C só por ter sido comprimido. As primeiras fileiras de estator mudam de ângulo (VSV) para o compressor não estolar em baixa rotação. Daqui também sai o ar sangrado (bleed) para pressurizar a cabine e o antigelo. Veja de perto em Seções em detalhe, logo abaixo.',
    facts: [['Estágios', '10'], ['Compressão', 'cerca de 23 vezes'], ['Eixo', 'N2 (alta)'], ['Bleed', 'Cabine e antigelo']] },
  { t: 'Câmara de combustão', cam: [3.25, 4.65, 0.6], parts: ['comb', 'fuel'],
    txt: 'Na câmara anular TAPS, os injetores soltam o combustível dentro de ar que já entra girando, numa mistura pobre que queima mais limpa e solta menos poluentes (NOx). A chama chega perto de 2.000 °C. Parte do ar do compressor não entra na chama: passa em volta das paredes e as resfria. Na partida, as velas de ignição acendem a mistura. A câmara aparece em detalhe logo abaixo, em Seções em detalhe.',
    facts: [['Tipo', 'Anular TAPS'], ['Chama', 'cerca de 2.000 °C'], ['Ignição', 'Velas, na partida']] },
  { t: 'Turbina de alta (HPT)', cam: [3.75, 5.0, 0.65], parts: ['hpt'],
    txt: 'Os gases quentes batem nas pás da turbina de alta, 2 estágios, que giram o compressor de alta pelo eixo N2. O gás é mais quente que o ponto de fusão do metal, então as pás são de liga de níquel de cristal único, ocas, com furinhos que soltam ar mais frio e formam uma película protetora em volta delas.',
    facts: [['Estágios', '2'], ['Eixo', 'N2 (alta)'], ['Pás', 'Níquel, refrigeradas']] },
  { t: 'Turbina de baixa (LPT)', cam: [4.05, 6.0, 0.75], parts: ['lpt'],
    txt: 'Depois vêm os 6 estágios da turbina de baixa, cada vez maiores porque o gás vai se expandindo. Ela gira o fan e o booster pelo eixo N1. Algumas fileiras usam pás de titânio-alumínio, bem mais leves. A temperatura dos gases nesta região é o EGT que o piloto acompanha no EICAS.',
    facts: [['Estágios', '6'], ['Eixo', 'N1 (baixa)'], ['No EICAS', 'EGT']] },
  { t: 'Eixos, mancais e caixa de acessórios', cam: [0.4, 6.0, 1.7], parts: ['lpshaft', 'hpshaft', 'mancal', 'agb'],
    txt: 'São dois eixos, um dentro do outro. O de baixa (N1, por dentro) liga o fan e o booster à turbina de baixa. O de alta (N2, por fora) liga o compressor de alta à turbina de alta. No GEnx eles giram em sentidos contrários: veja as pás de cada eixo passando em direções opostas. O N1 é o número que o piloto usa para ajustar o empuxo. Os eixos giram apoiados em mancais de rolamento banhados em óleo. Um eixo inclinado tira força do N2 e leva até a caixa de acessórios, embaixo do fan, que move as bombas de combustível, de óleo e hidráulica e o gerador elétrico.',
    facts: [['N1', 'Fan + booster + LPT'], ['N2', 'HPC + HPT'], ['Sentido', 'Contrários'], ['Acessórios', 'Bombas e gerador']] },
  { t: 'Escape: os dois jatos', cam: [4.4, 7.6, 1.45], parts: ['nozzle'],
    txt: 'Os dois fluxos saem separados: o ar do fan, frio e em enorme quantidade, pela borda da nacele; os gases do núcleo, quentes, pelo bocal em volta do cone de escape. Empurrar toda essa massa de ar para trás faz o motor ser empurrado para a frente, como diz a terceira lei de Newton. Isso é o empuxo.',
    facts: [['Jato do fan', 'Frio · maior parte'], ['Jato do núcleo', 'Quente · parte menor'], ['Empuxo', 'Ação e reação']] },
];
const PART_STEP = { inlet: 1, spinner: 1, fan: 2, fancase: 2, splitter: 3, ogv: 3, bypass: 3, lpc: 4, vbv: 4, hpc: 5, fuel: 6, comb: 6, hpt: 7, lpt: 8, lpshaft: 9, hpshaft: 9, mancal: 9, agb: 9, nozzle: 10 };

// Estações do ar na decolagem (valores aproximados, ao nível do mar): [nome, °C, atm, etapa]
const STA = [
  ['Entrada', 15, 1, 1],
  ['Depois do fan', 55, 1.6, 3],
  ['Depois do booster', 110, 2, 4],
  ['Saída do compressor de alta', 640, 44, 5],
  ['Chama na câmara', 1950, 42, 6],
  ['Entre as turbinas (EGT)', 'egt', 9, 8],
  ['Escape do núcleo', 560, 1.1, 10],
];

/* ---------- Estado ---------- */
let cv, ctx, W = 0, H = 0, dpr = 1, raf = 0, last = 0, active = () => false;
let lever = 0.8, sp = 0.8, slow = false, showAir = true;
const vis = { main: true, fan: false, sec: false };
let airFade = 1, gT = 0, step = 0, sel = null, phLP = 0, phHP = 0, time = 0, uiT = 0;
const cam = { x0: STEPS[0].cam[0], x1: STEPS[0].cam[1], r: STEPS[0].cam[2] };
let k = 1, ox = 0, cy = 0, pal = null, parts = [];
const MT = 30; // faixa das etiquetas em cima e embaixo
const SX = (x) => ox + x * k, SY = (y) => cy - y * k;

const n1 = () => 25 + 75 * Math.pow(sp, 0.55);
const n2 = () => 64 + 36 * Math.pow(sp, 0.6);
const egt = () => 380 + 560 * Math.pow(sp, 1.4);

function readPal() {
  const dark = ((c) => { const n = parseInt(c.replace('#', '').padEnd(6, '0').slice(0, 6), 16); return ((n >> 16) + (n >> 8 & 255) + (n & 255)) / 3 < 100; })(css('--tunnel') || '#e6ecee');
  pal = {
    dark, bg: css('--tunnel'), duct: css('--shade'), shell: css('--plane'), ink: css('--ink'), muted: css('--muted'), hl: css('--magenta'), panel: css('--panel'),
    lp: [196, 208, 224], hp: [232, 220, 198], st: [128, 134, 140], hot: [232, 206, 166], fan: [176, 184, 192],
    cut: dark ? '#3cc4ff' : '#1fa3dc', outAir: dark ? '#9fb1c0' : '#5d6c79',
    shell4: dark ? ['#a4afb8', '#5f6a74', '#8f9ba5', '#3a444e'] : ['#ffffff', '#c7ced4', '#eef1f3', '#97a0a8'],
    disk: dark ? ['#c9ced2', '#8e959b', '#4a525a'] : ['#f2f0ea', '#c8c4b8', '#7e7a70'],
    shaftLp: ['#2f353b', '#f5f7f8', '#a3acb3', '#d9dee1', '#30363c'],
    shaftHp: ['#3b3a34', '#f3efe4', '#b4ad9c', '#5d584c'],
    lip: dark ? ['#4b545c', '#c9d0d5', '#8e979e', '#d7dcdf', '#7d868d'] : ['#7f888f', '#f4f6f7', '#c3c9cd', '#eef0f2', '#b1b8bd'],
    ductB: ['#1d3048', '#0d1824'], ductC: ['#141c25', '#0a0f15'],
    metal: dark ? ['#7d8993', '#3b4650'] : ['#f6f8f9', '#b4bcc3'], hollow: dark ? '#0f171e' : '#dde3e6',
    bypassBg: dark ? 'rgba(70,120,200,.20)' : 'rgba(79,143,224,.22)', coreBg: dark ? '#1f2a33' : '#bec6cc',
    // O interior do motor é escuro, então o ar usa cores vivas nos dois temas.
    ramp: [[15, '#62a0ff'], [60, '#6cc8ff'], [150, '#5fe0cf'], [400, '#ecdc4c'], [700, '#ffa62e'], [1100, '#ff6a1e'], [1500, '#ff3a26'], [1950, '#fff2a8']],
  };
  pal.lut = [];
  for (let i = 0; i < 24; i++) pal.lut.push(rampColor(15 + i / 23 * 1935));
}
function hexRgb(h) { const n = parseInt(h.replace('#', ''), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function rampColor(t) {
  const r = pal.ramp;
  for (let i = 1; i < r.length; i++) if (t <= r[i][0]) {
    const a = hexRgb(r[i - 1][1]), b = hexRgb(r[i][1]), u = (t - r[i - 1][0]) / (r[i][0] - r[i - 1][0]);
    return `rgb(${a.map((v, j) => Math.round(lerp(v, b[j], u))).join(',')})`;
  }
  return r[r.length - 1][1];
}
const lutOf = (t) => clamp(Math.round((t - 15) / 1935 * 23), 0, 23);
const rgb = (c, f = 1, a = 1) => `rgba(${Math.round(c[0] * f)},${Math.round(c[1] * f)},${Math.round(c[2] * f)},${a})`;

/* ---------- Ar (partículas) ---------- */
const TC = lin([[1.0, 15], [SPLIT, 55], [2.02, 110], [2.65, 115], [3.58, 640], [3.66, 660], [3.8, 1950], [4.05, 1550], [4.45, 1000], [5.45, 560], [7.6, 480]]);
const VC = lin([[SPLIT, 1.0], [2.0, 0.85], [2.6, 0.8], [3.58, 0.62], [3.8, 0.55], [4.1, 0.75], [4.45, 1.0], [5.45, 1.3], [6.2, 1.9]]);
const VB = lin([[0.9, 1.0], [1.3, 1.05], [3.4, 1.1], [4.0, 1.55]]);
const VI = lin([[X0, 0.8], [0.85, 1.0]]);
const tScale = () => 0.4 + 0.6 * sp;
function pathY(p, x) {
  if (p.s === 'o') return (x < -0.05 ? caseAt(x) + 0.05 : x <= FAN_NOZ ? nacOut(x) : 1.27 - 0.02 * (x - FAN_NOZ)) + 0.1 + p.F * 0.6;
  if (x < SPLIT) return lerp(hubIn(x), caseAt(x), p.F);
  if (p.s === 'c') {
    if (x <= CORE_NOZ) return lerp(inC(x), outC(x), p.f);
    return lerp(x < 6.7 ? inC(x) : 0, 0.50 + 0.05 * (x - CORE_NOZ), p.f);
  }
  if (x <= FAN_NOZ) return lerp(cowl(x), caseIn(x), p.f);
  const lo = x < CORE_NOZ ? cowl(x) : 0.52 + 0.05 * (x - CORE_NOZ);
  return lerp(lo, Math.max(lo + 0.22, 1.235 - 0.09 * (x - FAN_NOZ)), p.f);
}
const velOf = (p, x) => (p.s === 'o' ? 1 : x < SPLIT ? VI(x) : p.s === 'c' ? VC(x) : VB(x));
const tempOf = (p, x) => (p.s === 'o' || x < 0.9 ? 15 : p.s === 'b' ? 15 + 40 * tScale() * clamp((x - 0.9) / 0.3, 0, 1) : 15 + (TC(x) - 15) * tScale());
function makeParts() {
  parts = [];
  const mk = (s, n) => {
    for (let i = 0; i < n; i++) {
      const f = 0.05 + Math.random() * 0.9;
      const F = s === 'c' ? FSPLIT * f : s === 'b' ? FSPLIT + (1 - FSPLIT) * f : Math.random();
      parts.push({ s, f, F, side: Math.random() < 0.5 ? 1 : -1, x: X0 + Math.random() * (X1 - X0) });
    }
  };
  // O núcleo recebe mais pontos que a proporção real (8 : 1) só para dar para ver o ar lá dentro.
  mk('b', 470); mk('c', 320); mk('o', 90);
}

/* ---------- Desenho ---------- */
function poly(pts, sign) {
  ctx.moveTo(SX(pts[0][0]), SY(pts[0][1] * sign));
  for (let i = 1; i < pts.length; i++) ctx.lineTo(SX(pts[i][0]), SY(pts[i][1] * sign));
  ctx.closePath();
}
function fillBand(pts, fill, stroke, lw = 1) {
  ctx.beginPath(); poly(pts, 1); poly(pts, -1);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}
function strokeProfile(fn, x0, x1, color, lw) {
  ctx.strokeStyle = color; ctx.lineWidth = lw;
  for (const s of [1, -1]) {
    ctx.beginPath();
    for (let i = 0; i <= 40; i++) { const x = lerp(x0, x1, i / 40); i ? ctx.lineTo(SX(x), SY(fn(x) * s)) : ctx.moveTo(SX(x), SY(fn(x) * s)); }
    ctx.stroke();
  }
}

// Luz vinda de cima, da esquerda e da frente do desenho; o reflexo usa o meio do caminho entre a luz e quem olha.
const D2R = Math.PI / 180;
const unit = (v) => { const n = Math.hypot(...v); return v.map((c) => c / n); };
const LIGHT = unit([-0.35, 0.55, 0.76]), HALF = unit([LIGHT[0], LIGHT[1], LIGHT[2] + 1]);
// Cor de uma pá: parte difusa (metal) + brilho especular (cromado), conforme o ângulo da pá em relação à luz.
function shade(base, beta, a, spk, gloss, amb = 0.16) {
  const sb = Math.sin(beta), cb = Math.cos(beta), n0 = -sb, n1 = -cb * Math.sin(a), n2 = cb * Math.cos(a);
  const d = Math.abs(n0 * LIGHT[0] + n1 * LIGHT[1] + n2 * LIGHT[2]);
  const s = Math.pow(Math.abs(n0 * HALF[0] + n1 * HALF[1] + n2 * HALF[2]), gloss) * spk;
  const f = amb + (1 - amb) * d, w = 255 * s;
  return [Math.min(255, base[0] * f + w), Math.min(255, base[1] * f + w), Math.min(255, base[2] * f + w), s];
}
// Gradiente "cromado": faixas claras e escuras alternadas, como metal polido refletindo o ambiente.
function chrome(c, x0, y0, x1, y1, stops) {
  const g = c.createLinearGradient(x0, y0, x1, y1);
  stops.forEach((col, i) => g.addColorStop(i / (stops.length - 1), col));
  return g;
}

// Pás vistas de lado: cada pá está num ângulo φ em volta do eixo. Como nos cortes de fábrica, só a carcaça é cortada:
// as pás aparecem inteiras, das de trás para as da frente.
function drawRow(rw) {
  const ph = rw.kind === 's' ? 0.37 : rw.sp === 'hp' ? phHP : phLP;
  const xc = rw.x + (rw.c || 0.25) / 2, rh = rw.hub(xc), rt = rw.tip(xc);
  const base = rw.fan ? pal.fan : rw.part === 'hpt' && rw.kind === 's' && rw.x < 4.12 ? [230, 80, 70] : rw.kind === 's' ? pal.st : rw.hot ? pal.hot : rw.sp === 'hp' ? pal.hp : pal.lp;
  const st = (rw.fan ? 48 : rw.st) * D2R, cs = Math.cos(st), sn = Math.sin(st);
  const gloss = rw.kind === 's' ? 10 : rw.fan ? 12 : 26, spk = rw.kind === 's' ? 0.3 : rw.fan ? 1.1 : 0.8, amb = rw.fan ? 0.42 : 0.2;
  const list = [];
  const cmax = rw.fan ? 0.42 : rw.c;
  for (let j = 0; j < rw.n; j++) {
    const a = ph + j * 2 * Math.PI / rw.n, s = Math.sin(a);
    // Pula as pás que ficam inteiras fora do duto (escondidas pelos discos e pela carcaça).
    if (Math.abs(Math.cos(a)) * rt + cmax * Math.abs(sn * s) < rh) continue;
    list.push([a, s]);
  }
  list.sort((p, q) => p[1] - q[1]);
  const outline = rw.fan || k > 70;
  for (const [a, s] of list) {
    const ca = Math.cos(a), le = [], te = [];
    if (rw.fan) {
      // Pá do fan: corda maior e mais torcida na ponta.
      for (let u = 0; u <= 1.001; u += 0.2) {
        const r = lerp(rh, rt, u), c = lerp(0.22, 0.42, u), b = lerp(30, 58, u) * D2R, xl = rw.x + lerp(0.03, -0.02, u * u);
        le.push([xl, r * ca]); te.push([xl + c * Math.cos(b), r * ca - c * Math.sin(b) * s]);
      }
    } else {
      for (const r of [rh, (rh + rt) / 2, rt]) {
        const bow = r === rt || r === rh ? 0 : rw.c * 0.12; // leve curvatura do perfil
        le.push([rw.x + bow, r * ca]); te.push([rw.x + rw.c * cs + bow, r * ca - rw.c * sn * s]);
      }
    }
    const [R, G, B, spec] = shade(base, st, a, spk, gloss, amb);
    const pts = le.concat(te.slice().reverse());
    ctx.beginPath();
    ctx.moveTo(SX(pts[0][0]), SY(pts[0][1]));
    for (let i = 1; i < pts.length; i++) ctx.lineTo(SX(pts[i][0]), SY(pts[i][1]));
    ctx.closePath();
    ctx.fillStyle = `rgb(${R | 0},${G | 0},${B | 0})`;
    ctx.fill();
    if (outline) { ctx.strokeStyle = 'rgba(4,6,8,.85)'; ctx.lineWidth = rw.fan ? 1 : 0.6; ctx.stroke(); }
    if (rw.fan || (k > 110 && rw.kind === 'r')) {
      // Borda de ataque: um fio cromado que acende quando a pá passa de frente para a luz.
      ctx.beginPath(); ctx.moveTo(SX(le[0][0]), SY(le[0][1]));
      for (let i = 1; i < le.length; i++) ctx.lineTo(SX(le[i][0]), SY(le[i][1]));
      ctx.strokeStyle = `rgba(255,255,255,${clamp(0.25 + spec * 1.4, 0, 0.95)})`; ctx.lineWidth = rw.fan ? 1.6 : 0.8; ctx.stroke();
    }
  }
}
// Discos que prendem cada fileira de pás ao seu eixo (no corte). Cada módulo desenha os seus.
function drawDisks(pick) {
  for (const s of [1, -1]) {
    ctx.beginPath();
    let any = false;
    for (const rw of ROWS) {
      if (rw.kind !== 'r' || !pick(rw)) continue;
      any = true;
      const c = rw.fan ? 0.24 : rw.c, xc = rw.x + c / 2, rh = rw.hub(xc) - 0.004, rb = SHAFT[rw.sp] + 0.004;
      const w = rw.fan ? 0.2 : c * 0.8, web = rw.fan ? 0.03 : 0.006, wb = rw.fan ? 0.09 : Math.max(0.03, c * 0.7);
      poly([[xc - w / 2, rh], [xc + w / 2, rh], [xc + web, rh - 0.03], [xc + web, rb + 0.035], [xc + wb / 2, rb + 0.012], [xc + wb / 2, rb], [xc - wb / 2, rb], [xc - wb / 2, rb + 0.012], [xc - web, rb + 0.035], [xc - web, rh - 0.03]], s);
    }
    if (!any) return;
    ctx.fillStyle = chrome(ctx, 0, SY(0.62 * s), 0, SY(0.05 * s), pal.disk); ctx.fill();
    ctx.strokeStyle = 'rgba(4,6,8,.55)'; ctx.lineWidth = 0.6; ctx.stroke();
  }
}
// Eixos como cilindros polidos: o de baixa (N1) inteiro e o de alta (N2), um tubo em volta dele.
function drawShaftLp() {
  ctx.beginPath(); poly(band(0.95, 5.65, K(-SHAFT.lp), K(SHAFT.lp), 2), 1);
  ctx.fillStyle = chrome(ctx, 0, SY(SHAFT.lp), 0, SY(-SHAFT.lp), pal.shaftLp); ctx.fill(); ctx.strokeStyle = pal.cut; ctx.lineWidth = 1; ctx.stroke();
}
function drawShaftHp() {
  for (const s of [1, -1]) {
    ctx.beginPath(); poly(band(2.62, 4.42, K(0.12), K(SHAFT.hp), 2), s);
    ctx.fillStyle = chrome(ctx, 0, SY(SHAFT.hp * s), 0, SY(0.12 * s), pal.shaftHp); ctx.fill(); ctx.strokeStyle = pal.cut; ctx.lineWidth = 1; ctx.stroke();
  }
}
/* ---------- Módulos: o motor se separa como na manutenção ---------- */
// Deslocamento de cada módulo (em metros) com o motor totalmente separado.
const MOD = { inlet: -1.6, fan: -0.85, case: 0, core: 0.95, lpt: 2.0 };
const MOD_NAMES = [['inlet', 'Entrada de ar', 0.35], ['fan', 'Fan', 0.95], ['case', 'Carcaça do fan', 2.3], ['core', 'Núcleo', 3.4], ['lpt', 'Turbina de baixa', 5.6]];
const EXP_CAM = [-2.5, 9.9, 1.75];
let ex = 0, exT = 0;
const off = (m) => MOD[m] * ex;
function G(m, fn) { const d = off(m); if (!d) { fn(); return; } ctx.save(); ctx.translate(d * k, 0); fn(); ctx.restore(); }
const rowMod = (rw) => (rw.fan ? 'fan' : rw.part === 'ogv' ? 'case' : rw.part === 'lpt' || rw.part === 'nozzle' ? 'lpt' : 'core');
const linerOut = lin([[3.67, 0.392], [3.85, 0.408], [4.06, 0.395]]), linerIn = lin([[3.67, 0.29], [3.85, 0.274], [4.06, 0.318]]);
function drawCombustor() {
  const fl = 0.35 + 0.65 * sp;
  for (const s of [1, -1]) {
    // Interior da câmara escuro, e a chama acesa por dentro: azul no injetor, violeta, laranja, amarelo e quase branca no meio.
    ctx.save();
    ctx.beginPath(); poly(band(3.67, 4.06, linerIn, linerOut, 12), s); ctx.fillStyle = '#0a0d24'; ctx.fill(); ctx.clip();
    ctx.globalCompositeOperation = 'lighter';
    const tongues = 9;
    for (let j = 0; j < tongues; j++) {
      const u = j / (tongues - 1), w = Math.sin(time * (13 + j * 4.3) + j * 2.1 + s * 1.3) * 0.5 + 0.5, w2 = Math.sin(time * (21 + j * 3.1) + j) * 0.5 + 0.5;
      const fx = SX(3.69 + u * 0.36 + (w - 0.5) * 0.02), fy = SY((0.343 + (w2 - 0.5) * 0.03 * (0.4 + u)) * s);
      const rr = k * (0.035 + 0.04 * fl) * (0.7 + 0.6 * Math.sin(u * Math.PI)) * (0.8 + 0.35 * w);
      const core = u < 0.18 ? [90, 110, 255] : u < 0.35 ? [190, 90, 255] : u < 0.75 ? [255, 236, 170] : [255, 190, 60];
      const rim = u < 0.18 ? [40, 30, 200] : u < 0.35 ? [150, 40, 220] : u < 0.75 ? [255, 120, 20] : [240, 70, 20];
      const g = ctx.createRadialGradient(fx, fy, 0, fx, fy, rr);
      g.addColorStop(0, `rgba(${core.join(',')},${0.95 * fl})`);
      g.addColorStop(0.45, `rgba(${rim.join(',')},${0.6 * fl})`);
      g.addColorStop(1, `rgba(${rim.join(',')},0)`);
      ctx.save(); ctx.translate(fx, fy); ctx.scale(1.9, 0.75); ctx.translate(-fx, -fy);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(fx, fy, rr, 0, 7); ctx.fill(); ctx.restore();
    }
    ctx.restore();
    // Paredes da câmara (com o corte em azul) e o domo
    ctx.beginPath(); poly(band(3.67, 4.06, linerIn, linerOut, 12), s);
    ctx.strokeStyle = pal.cut; ctx.lineWidth = Math.max(1.2, k * 0.009); ctx.stroke();
    // Injetor: haste que atravessa a carcaça e bico na frente do domo
    ctx.beginPath(); ctx.moveTo(SX(3.6), SY(0.47 * s)); ctx.lineTo(SX(3.63), SY(0.345 * s)); ctx.lineTo(SX(3.668), SY(0.34 * s));
    ctx.strokeStyle = pal.dark ? '#c9d0d6' : '#8c959c'; ctx.lineWidth = Math.max(2.2, k * 0.018); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = Math.max(0.8, k * 0.005); ctx.stroke();
    // Turbilhonador (swirler) no domo, onde o injetor solta o combustível
    ctx.fillStyle = chrome(ctx, 0, SY(0.36 * s), 0, SY(0.33 * s), pal.shaftLp);
    ctx.beginPath(); ctx.rect(SX(3.648), SY(0.358 * s), 0.024 * k, 0.026 * k * s); ctx.fill(); ctx.strokeStyle = '#0b0e11'; ctx.lineWidth = 0.6; ctx.stroke();
  }
}
// Preenchimento metálico em corte: metal polido e a borda do corte em azul.
function metalBand(pts, rOut, rIn, stroke = pal.cut, lw = 1.5) {
  for (const s of [1, -1]) {
    ctx.beginPath(); poly(pts, s); ctx.fillStyle = chrome(ctx, 0, SY(rOut * s), 0, SY(rIn * s), pal.shell4); ctx.fill();
    ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke();
  }
}
function drawShellsMetal() {
  // Nacele em corte: boca maciça, carcaça do fan e a pele do capô, com o vão por dentro (onde ficam tubos e a caixa de acessórios).
  G('case', () => {
    fillBand(band(0.7, FAN_NOZ, caseIn, nacOut, 30), pal.hollow);
    metalBand(band(0.72, FAN_NOZ, (x) => nacOut(x) - 0.03, nacOut, 30), 1.62, 1.5);
    metalBand(band(0.72, FAN_NOZ, caseIn, (x) => caseIn(x) + (x < 1.55 ? 0.12 : 0.035), 40), 1.47, 1.3);
    ctx.strokeStyle = pal.dark ? '#8d99a3' : '#7d8890'; ctx.lineWidth = Math.max(1, k * 0.012);
    for (const [o, a] of [[0.035, 0], [0.065, 0.4]]) {
      ctx.beginPath();
      for (let i = 0; i <= 30; i++) { const x = lerp(1.6, 3.2, i / 30), r = caseIn(x) + 0.035 + o + Math.sin(i * 0.9 + a) * 0.004; i ? ctx.lineTo(SX(x), SY(r)) : ctx.moveTo(SX(x), SY(r)); }
      ctx.stroke();
    }
    drawAgb();
  });
  G('inlet', () => metalBand(band(-0.05, 0.75, caseIn, nacOut, 20), 1.6, 1.34));
  // Carenagem do núcleo: uma peça só com o motor montado; separada em duas quando os módulos saem
  const hot = (a, b) => {
    for (const s of [1, -1]) {
      ctx.beginPath(); poly(band(a, b, outC, (x) => outC(x) + 0.045, 14), s);
      ctx.fillStyle = `rgba(214,52,44,${0.75 + 0.2 * sp})`; ctx.fill(); ctx.strokeStyle = pal.cut; ctx.lineWidth = 1.2; ctx.stroke();
    }
  };
  if (ex < 0.002) {
    metalBand(band(SPLIT, CORE_NOZ, outC, cowl, 50), 0.8, 0.42);
    hot(4.06, 5.5);
  } else {
    G('core', () => { metalBand(band(SPLIT, 4.46, outC, cowl, 40), 0.8, 0.42); hot(4.06, 4.46); });
    G('lpt', () => { metalBand(band(4.46, CORE_NOZ, outC, cowl, 20), 0.7, 0.42); hot(4.46, 5.5); });
  }
  G('core', drawVbv);
  // Cone do fan com a espiral pintada
  G('fan', () => {
    for (const s of [1, -1]) {
      const g = ctx.createLinearGradient(0, SY(0.4 * s), 0, SY(0));
      g.addColorStop(0, pal.dark ? '#5d6973' : '#4b555e'); g.addColorStop(1, pal.dark ? '#2c353d' : '#20262c');
      ctx.beginPath(); poly(band(0.12, 0.95, K(0), spin, 16), s); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = pal.ink; ctx.lineWidth = 1; ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = Math.max(1.2, k * 0.012);
    for (const s of [1, -1]) {
      const u = (Math.sin(phLP) * 0.5 + 0.5);
      ctx.beginPath(); ctx.moveTo(SX(0.14), SY(0)); ctx.quadraticCurveTo(SX(0.35), SY(spin(0.35) * u * s), SX(0.7), SY(spin(0.7) * (1 - u) * s)); ctx.stroke();
    }
  });
  G('lpt', () => {
    metalBand(band(CORE_NOZ, 6.7, K(0), inC, 16), 0.31, 0);
    metalBand(band(5.48, CORE_NOZ, (x) => inC(x) - 0.03, inC, 6), 0.34, 0.3, pal.ink, 0.8);
  });
}
function drawModLabels() {
  if (ex < 0.05) return;
  ctx.save(); ctx.globalAlpha = clamp((ex - 0.05) * 2, 0, 1);
  ctx.font = `600 11.5px ${css('--mono') || 'monospace'}`; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
  // Etiquetas em cima (fan, núcleo, turbina) e embaixo (entrada, carcaça), espalhadas para não se sobreporem
  for (const top of [true, false]) {
    const list = MOD_NAMES.filter(([m]) => (m === 'inlet' || m === 'case') !== top).map(([m, nome, x]) => ({ m, nome, ax: SX(x + off(m)), w: ctx.measureText(nome).width + 18 }));
    let pos = 4; list.forEach((it) => { it.x = Math.max(it.ax - it.w / 2, pos); pos = it.x + it.w + 6; });
    let lim = W - 4; for (let i = list.length - 1; i >= 0; i--) { list[i].x = Math.min(list[i].x, lim - list[i].w); lim = list[i].x - 6; }
    const y = top ? 16 : H - 16;
    for (const it of list) {
      const cx = it.x + it.w / 2;
      ctx.strokeStyle = pal.hl; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx, y + (top ? 10 : -10)); ctx.lineTo(it.ax, SY(top ? 1.3 : -1.3)); ctx.stroke();
      ctx.fillStyle = pal.panel; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(it.x, y - 10, it.w, 20, 10) : ctx.rect(it.x, y - 10, it.w, 20); ctx.fill(); ctx.stroke();
      ctx.fillStyle = pal.ink; ctx.fillText(it.nome, cx, y + 0.5);
    }
  }
  ctx.restore();
}

/* ---------- Setas de ar, como no vídeo da GE: azul passa por fora, verde entra no núcleo ---------- */
function flowArrow(pts, rgbCol, alpha, w) {
  if (pts.length < 2 || alpha < 0.02) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const path = () => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(SX(x), SY(y)) : ctx.moveTo(SX(x), SY(y)))); };
  path(); ctx.strokeStyle = `rgba(${rgbCol},.45)`; ctx.lineWidth = w; ctx.stroke();
  path(); ctx.strokeStyle = `rgba(${rgbCol},.95)`; ctx.lineWidth = Math.max(1.5, w * 0.28); ctx.setLineDash([w * 1.2, w * 1.6]); ctx.lineDashOffset = -time * w * 6; ctx.stroke(); ctx.setLineDash([]);
  // Bolinha no começo e ponta de flecha no fim
  const [x0, y0] = pts[0], [xa, ya] = pts[pts.length - 2], [xb, yb] = pts[pts.length - 1];
  ctx.fillStyle = `rgba(${rgbCol},1)`; ctx.beginPath(); ctx.arc(SX(x0), SY(y0), w * 0.45, 0, 7); ctx.fill();
  const a = Math.atan2(SY(yb) - SY(ya), SX(xb) - SX(xa)), hx = SX(xb), hy = SY(yb), L = w * 1.5;
  ctx.beginPath(); ctx.moveTo(hx + Math.cos(a) * L * 0.4, hy + Math.sin(a) * L * 0.4);
  ctx.lineTo(hx + Math.cos(a + 2.5) * L, hy + Math.sin(a + 2.5) * L); ctx.lineTo(hx + Math.cos(a - 2.5) * L, hy + Math.sin(a - 2.5) * L); ctx.closePath(); ctx.fill();
  ctx.restore();
}
let arrowA = 0;
function drawFlowArrows(dt) {
  const want = (step === 3 || step === 4) && !sel && ex < 0.05 ? 1 : 0;
  arrowA += (want - arrowA) * (1 - Math.exp(-dt * 3));
  if (arrowA < 0.02) return;
  const w = clamp(k * 0.035, 5, 14), lane = (s, F, f, xa, xb, n = 40) => {
    const p = { s, F, f, side: 1 }, out = [];
    for (let i = 0; i <= n; i++) { const x = lerp(xa, xb, i / n); out.push([x, pathY(p, x)]); }
    return out;
  };
  flowArrow(lane('b', FSPLIT + (1 - FSPLIT) * 0.8, 0.8, -0.6, 4.2), '150,200,255', arrowA, w);
  flowArrow(lane('b', FSPLIT + (1 - FSPLIT) * 0.35, 0.35, -0.6, 4.0), '150,200,255', arrowA, w);
  // Verde: o ar do núcleo; quando as VBV abrem, parte dele sobe para o duto do fan
  const core = lane('c', FSPLIT * 0.5, 0.5, -0.6, 2.06, 34), vbv = clamp(1 - sp * 1.6, 0, 1);
  if (vbv > 0.15) {
    for (let i = 1; i <= 12; i++) { const u = i / 12, x = 2.06 + u * 0.35, y = lerp(outC(2.06) - 0.03, 1.0, Math.sin(u * Math.PI / 2)); core.push([x + u * u * 0.3, y]); }
  } else { for (let i = 1; i <= 12; i++) { const x = 2.06 + i * 0.06; core.push([x, pathY({ s: 'c', f: 0.5, F: 0, side: 1 }, x)]); } }
  flowArrow(core, '150,230,120', arrowA, w);
}

/* ---------- Cartões de informação (como os do vídeo) ---------- */
const CALLOUTS = {
  5: ['Compressor de alta', 'recorde de compressão: 23 : 1'],
  6: ['Câmara TAPS', 'variação de temperatura na saída 205 °C menor'],
  8: ['Controle ativo de folga', 'ar do fan esfria a carcaça da turbina'],
};
// y negativo: o cartão fica apoiado embaixo, com a borda de baixo em -y.
function drawCallout(c, x, y, lines, alpha, maxW) {
  if (alpha < 0.02) return;
  c.save(); c.globalAlpha = alpha;
  c.font = `600 12.5px ${css('--body') || 'sans-serif'}`;
  const w = Math.min(maxW, Math.max(...lines.map((l) => c.measureText(l).width)) + 28), lh = 17, h = 26 + lines.length * lh;
  const yy = (y < 0 ? -y - h : y) + (1 - alpha) * 8;
  c.shadowColor = 'rgba(0,0,0,.25)'; c.shadowBlur = 10; c.shadowOffsetY = 3;
  c.fillStyle = '#fbfbf9'; c.beginPath(); c.rect(x, yy, w, h); c.fill();
  c.shadowColor = 'transparent';
  c.strokeStyle = '#2a3036'; c.lineWidth = 1; c.stroke();
  // Faixa listrada no canto, como nos cartões do vídeo
  c.save(); c.beginPath(); c.rect(x + 10, yy + 6, 46, 9); c.clip(); c.fillStyle = '#2a3036'; c.fillRect(x + 10, yy + 6, 46, 9);
  c.strokeStyle = '#fbfbf9'; c.lineWidth = 2.2; for (let i = -2; i < 10; i++) { c.beginPath(); c.moveTo(x + 10 + i * 7, yy + 15); c.lineTo(x + 18 + i * 7, yy + 6); c.stroke(); }
  c.restore();
  c.fillStyle = '#2a3036'; c.textAlign = 'left'; c.textBaseline = 'top';
  lines.forEach((l, i) => { c.font = `${i ? 500 : 700} 12.5px ${css('--body') || 'sans-serif'}`; c.fillText(l, x + 12, yy + 22 + i * lh, w - 22); });
  c.restore();
}
let calloutA = 0, calloutStep = -1;
function drawMainCallout(dt) {
  const want = CALLOUTS[step] && !sel && ex < 0.05 ? 1 : 0;
  if (CALLOUTS[step] && calloutStep !== step) { calloutStep = step; calloutA = 0; }
  calloutA += (want - calloutA) * (1 - Math.exp(-dt * 3));
  if (CALLOUTS[calloutStep] && W >= 560) drawCallout(ctx, 10, -(H - MT - 8), CALLOUTS[calloutStep], calloutA, W * 0.6);
}
function drawAgb() {
  // Só embaixo: a caixa, as engrenagens e o eixo inclinado que vem do N2.
  const s = -1, x0 = AGB[0], x1 = AGB[1];
  ctx.beginPath(); poly(band(x0, x1, agbLo, agbHi, 10), s);
  const g = ctx.createLinearGradient(0, SY(-1.45), 0, SY(-1.58)); g.addColorStop(0, pal.metal[0]); g.addColorStop(1, pal.metal[1]);
  ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = pal.ink; ctx.lineWidth = 1; ctx.stroke();
  const rr = (agbHi(2) - agbLo(2)) * 0.32;
  [1.75, 1.95, 2.13, 2.3].forEach((x, i) => {
    const r = rr * (i % 2 ? 0.75 : 1), gy = (agbLo(x) + agbHi(x)) / 2;
    ctx.save(); ctx.translate(SX(x), SY(gy * s)); ctx.rotate((i % 2 ? -1 : 1) * phHP * 0.5);
    ctx.beginPath();
    for (let t = 0; t < 24; t++) { const a = t / 24 * Math.PI * 2, R = r * k * (t % 2 ? 0.82 : 1); ctx.lineTo(R * Math.cos(a), R * Math.sin(a)); }
    ctx.closePath(); ctx.fillStyle = pal.dark ? '#a3aeb7' : '#8a959e'; ctx.fill(); ctx.strokeStyle = pal.ink; ctx.lineWidth = 0.6; ctx.stroke();
    ctx.restore();
  });
  // Eixo inclinado (do núcleo até a caixa, atravessando o duto do fan)
  ctx.strokeStyle = pal.dark ? '#a3aeb7' : '#6f7a83'; ctx.lineWidth = Math.max(1.5, k * 0.025);
  ctx.beginPath(); ctx.moveTo(SX(2.36), SY(-0.47)); ctx.lineTo(SX(2.08), SY(-agbLo(2.08))); ctx.stroke();
}
function drawVbv() {
  // Portinhas na parede entre o booster e o compressor de alta: abrem em baixa rotação.
  const open = clamp(1 - sp * 1.6, 0, 1) * 0.9;
  for (const s of [1, -1]) {
    const x = 2.1, r0 = outC(x), L = 0.12;
    ctx.save(); ctx.translate(SX(x), SY(r0 * s)); ctx.rotate(-s * open);
    ctx.fillStyle = pal.dark ? '#d8c27a' : '#a07c1c'; ctx.fillRect(0, -1.5 * s, L * k, 3 * s);
    ctx.restore();
  }
}
function drawBearings(pick = () => true) {
  for (const [x, sp0] of BRG) {
    if (!pick(x)) continue;
    const r = brgR(sp0);
    for (const s of [1, -1]) {
      ctx.fillStyle = pal.dark ? '#59646e' : '#9aa4ac'; ctx.strokeStyle = pal.ink; ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.rect(SX(x - 0.04), SY((r + 0.032) * s), 0.08 * k, 0.012 * k * s); ctx.rect(SX(x - 0.04), SY((r - 0.02) * s), 0.08 * k, 0.012 * k * s); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(SX(x), SY(r * s), 0.016 * k, 0, 7); ctx.fillStyle = pal.dark ? '#e4e9ed' : '#f4f6f7'; ctx.fill(); ctx.stroke();
      // Suporte do mancal até a parede do núcleo
      ctx.beginPath(); ctx.moveTo(SX(x), SY((r + 0.032) * s)); ctx.lineTo(SX(x + 0.07), SY(inC(x + 0.07) * s)); ctx.lineWidth = Math.max(1, k * 0.008); ctx.strokeStyle = pal.dark ? '#7d8993' : '#7d8890'; ctx.stroke();
    }
  }
}
function drawAir(dt) {
  const U = (0.3 + 1.4 * sp) * (slow ? 0.3 : 1);
  // Três baldes de transparência por cor: o rastro de cada partícula vai sumindo da cabeça para a cauda.
  const buckets = Array.from({ length: 25 * 3 * 2 }, () => []);
  const lvA = [0.16, 0.42, 0.95];
  for (const p of parts) {
    const v = U * velOf(p, p.x);
    p.x += v * dt;
    if (p.x > X1) { p.x = X0 + Math.random() * 0.3; p.side = Math.random() < 0.5 ? 1 : -1; }
    if (!showAir) continue;
    const sx = SX(p.x);
    if (sx < -60 || sx > W + 60) continue;
    const L = clamp(0.12 * v + 0.035, 0.05, 0.34);
    const ci = p.s === 'o' ? 24 : lutOf(tempOf(p, p.x));
    let px = p.x - L, py = airY(p, px);
    for (let lv = 0; lv < 3; lv++) {
      const nx = p.x - L * (2 - lv) / 3, ny = airY(p, nx);
      buckets[(ci * 3 + lv) * 2 + (p.x > 7.0 ? 1 : 0)].push(SX(px), SY(py), SX(nx), SY(ny));
      px = nx; py = ny;
    }
  }
  if (!showAir || airFade < 0.02) return;
  ctx.lineCap = 'butt';
  const lw = clamp(k * 0.0095, 1.1, 2.6);
  // Gases quentes: um halo largo por baixo, mais forte quanto mais quente.
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 9; i < 24; i++) {
    const l = buckets[(i * 3 + 2) * 2]; if (!l.length) continue;
    ctx.strokeStyle = pal.lut[i]; ctx.globalAlpha = (0.1 + 0.22 * (i - 9) / 14) * airFade; ctx.lineWidth = lw * 4;
    ctx.beginPath(); for (let j = 0; j < l.length; j += 4) { ctx.moveTo(l[j], l[j + 1]); ctx.lineTo(l[j + 2], l[j + 3]); } ctx.stroke();
  }
  ctx.restore();
  for (let i = 0; i < 25; i++) for (let lv = 0; lv < 3; lv++) {
    ctx.strokeStyle = i === 24 ? pal.outAir : pal.lut[i];
    ctx.lineWidth = i >= 9 && i !== 24 ? lw * 1.3 : lw;
    for (let far = 0; far < 2; far++) {
      const q = buckets[(i * 3 + lv) * 2 + far]; if (!q.length) continue;
      ctx.globalAlpha = lvA[lv] * (far ? 0.4 : 1) * (i === 24 ? 0.45 : 1) * airFade;
      ctx.beginPath();
      for (let j = 0; j < q.length; j += 4) { ctx.moveTo(q[j], q[j + 1]); ctx.lineTo(q[j + 2], q[j + 3]); }
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}
// Caminho do ar com um leve ondular nos jatos, onde o ar de dentro se mistura com o de fora.
function airY(p, x) {
  let y = pathY(p, x);
  const x0 = p.s === 'c' ? CORE_NOZ : p.s === 'b' ? FAN_NOZ : 99;
  if (x > x0) y += Math.sin(time * 5 + x * 7 + p.F * 40) * 0.018 * Math.min(1, (x - x0) / 1.2);
  return y * p.side;
}
function highlightIds() { return sel ? [sel] : STEPS[step].parts; }
function drawHighlight() {
  const ids = highlightIds();
  if (!ids.length) return;
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, W, H);
  ids.forEach((id) => PARTS[id].polys.forEach((q) => { if (PARTS[id].only !== -1) poly(q, 1); poly(q, -1); }));
  ctx.fillStyle = pal.dark ? 'rgba(4,7,10,.6)' : 'rgba(12,16,20,.45)';
  ctx.fill('evenodd');
  ctx.beginPath(); ids.forEach((id) => PARTS[id].polys.forEach((q) => { if (PARTS[id].only !== -1) poly(q, 1); poly(q, -1); }));
  ctx.strokeStyle = pal.hl; ctx.lineWidth = 2; ctx.setLineDash([6, 4]); ctx.lineDashOffset = -time * 20; ctx.stroke();
  ctx.restore();
}
function drawPins() {
  const ids = new Set(highlightIds());
  const rows = { top: [], bot: [] };
  ctx.font = `600 11px ${css('--mono') || 'monospace'}`;
  for (const [id, p] of Object.entries(PARTS)) {
    const ax = SX(p.at[0]), ay = SY(p.at[1]);
    if (ax < 6 || ax > W - 6 || ay < MT || ay > H - MT) continue;
    const hl = ids.has(id), label = hl ? p.nome : '', lw = hl ? ctx.measureText(label).width + 14 : 0;
    rows[p.at[1] > 0 ? 'top' : 'bot'].push({ id, p, ax, ay, hl, label, w: 20 + (lw ? lw + 4 : 0) });
  }
  for (const [key, list] of Object.entries(rows)) {
    if (!list.length) continue;
    list.sort((a, b) => a.ax - b.ax);
    const total = list.reduce((s, it) => s + it.w + 4, 0);
    if (total > W - 8) list.forEach((it) => { it.label = ''; it.w = 20; });
    // Espalha as etiquetas para não se sobreporem.
    let pos = 4;
    list.forEach((it) => { it.x = Math.max(it.ax - 10, pos); pos = it.x + it.w + 4; });
    let lim = W - 4;
    for (let i = list.length - 1; i >= 0; i--) { const it = list[i]; it.x = Math.min(it.x, lim - it.w); lim = it.x - 4; }
    const y = key === 'top' ? 15 : H - 15;
    for (const it of list) {
      const bx = it.x + 10;
      ctx.strokeStyle = it.hl ? pal.hl : pal.muted; ctx.globalAlpha = it.hl ? 1 : 0.7; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(bx, y + (key === 'top' ? 9 : -9)); ctx.lineTo(it.ax, it.ay); ctx.stroke();
      ctx.fillStyle = it.hl ? pal.hl : '#ffffff'; ctx.beginPath(); ctx.arc(it.ax, it.ay, 3, 0, 7); ctx.fill(); ctx.strokeStyle = it.hl ? pal.panel : '#11161b'; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.arc(bx, y, 9.5, 0, 7);
      ctx.fillStyle = it.hl ? pal.hl : pal.panel; ctx.fill(); ctx.strokeStyle = it.hl ? pal.hl : pal.ink; ctx.stroke();
      ctx.fillStyle = it.hl ? pal.panel : pal.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(it.p.n, bx, y + 0.5);
      if (it.label) {
        const lx = it.x + 22, lw = it.w - 24;
        ctx.fillStyle = pal.panel; ctx.strokeStyle = pal.hl;
        ctx.beginPath(); ctx.roundRect ? ctx.roundRect(lx, y - 10, lw, 20, 10) : ctx.rect(lx, y - 10, lw, 20); ctx.fill(); ctx.stroke();
        ctx.fillStyle = pal.ink; ctx.textAlign = 'left'; ctx.fillText(it.label, lx + 7, y + 0.5);
      }
    }
  }
}
// Fan visto de frente, como na foto: pás cromadas e curvas, vãos pretos, spinner preto com a espiral branca.
const fanAir = Array.from({ length: 70 }, () => ({ a: Math.random() * 7, r: 1.05 + Math.random() * 0.75, v: 0.5 + Math.random() * 0.6 }));
const LIGHT_ANG = -2.25; // luz vindo de cima, à esquerda
function drawFanFront(c, cx, cy0, R, o = {}) {
  const rh = R * 0.3, n = 18, rotv = (0.25 + 1.0 * sp) * (slow ? 0.25 : 1);
  // Boca da nacele (lábio polido)
  if (o.lip) {
    const lip = c.createRadialGradient(cx, cy0, R * 0.96, cx, cy0, R * 1.2);
    pal.lip.forEach((col, i) => lip.addColorStop(i / (pal.lip.length - 1), col));
    c.beginPath(); c.arc(cx, cy0, R * 1.2, 0, 7); c.fillStyle = lip; c.fill();
    const sh = c.createLinearGradient(cx - R, cy0 - R, cx + R, cy0 + R);
    sh.addColorStop(0, 'rgba(255,255,255,.35)'); sh.addColorStop(0.5, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(0,0,0,.28)');
    c.fillStyle = sh; c.fill();
  }
  c.save();
  c.beginPath(); c.arc(cx, cy0, R, 0, 7); c.clip();
  const bg = c.createRadialGradient(cx, cy0, rh, cx, cy0, R);
  bg.addColorStop(0, '#010203'); bg.addColorStop(0.75, '#07090b'); bg.addColorStop(1, '#1d2226');
  c.fillStyle = bg; c.fillRect(cx - R, cy0 - R, 2 * R, 2 * R);
  const blade = (a0, alpha) => {
    const P = [], Q = [];
    for (let i = 0; i <= 10; i++) {
      const u = i / 10, r = lerp(rh * 0.97, R * 0.99, u), a = a0 + 0.62 * Math.pow(u, 1.35), wv = lerp(0.1, 0.21, u);
      P.push([cx + r * Math.cos(a), cy0 + r * Math.sin(a)]);
      Q.push([cx + r * Math.cos(a + wv), cy0 + r * Math.sin(a + wv)]);
    }
    // O brilho depende de onde a pá está: as que passam do lado da luz acendem, as do outro lado ficam escuras.
    const am = a0 + 0.3, cl = Math.cos(am - LIGHT_ANG), lit = 0.5 + 0.5 * cl, lit2 = Math.max(0, cl) ** 6;
    const mr = lerp(rh, R, 0.55), ma = a0 + 0.62 * Math.pow(0.55, 1.35);
    const g = c.createLinearGradient(cx + mr * Math.cos(ma), cy0 + mr * Math.sin(ma), cx + mr * Math.cos(ma + 0.18), cy0 + mr * Math.sin(ma + 0.18));
    const hi = Math.round(140 + 115 * lit), sp2 = Math.min(255, hi + 60 * lit2), mid = Math.round(60 + 90 * lit);
    g.addColorStop(0, `rgba(${hi},${hi},${Math.min(255, hi + 6)},${alpha})`);
    g.addColorStop(0.2, `rgba(${sp2},${sp2},${sp2},${alpha})`);
    g.addColorStop(0.55, `rgba(${mid},${mid + 4},${mid + 8},${alpha})`);
    g.addColorStop(1, `rgba(10,12,14,${alpha})`);
    c.beginPath(); c.moveTo(...P[0]); P.forEach((q) => c.lineTo(...q)); Q.slice().reverse().forEach((q) => c.lineTo(...q)); c.closePath();
    c.fillStyle = g; c.fill();
    if (alpha > 0.9) {
      c.strokeStyle = 'rgba(0,0,0,.9)'; c.lineWidth = Math.max(0.8, R * 0.008); c.stroke();
      c.beginPath(); c.moveTo(...P[0]); P.forEach((q) => c.lineTo(...q));
      c.strokeStyle = `rgba(255,255,255,${0.3 + 0.65 * lit2})`; c.lineWidth = Math.max(1, R * 0.012); c.stroke();
    }
  };
  const ph = -phLP, blur = slow ? 0 : clamp(rotv - 0.35, 0, 1);
  for (let j = 0; j < n; j++) {
    const a0 = ph + j * 2 * Math.PI / n;
    // Rastro do movimento quando o fan gira rápido
    if (blur > 0.05) { blade(a0 + 0.09 * blur, 0.2 * blur); blade(a0 + 0.045 * blur, 0.32 * blur); }
    blade(a0, 1);
  }
  // Anel azul da carcaça do fan (revestimento interno), como no vídeo
  c.beginPath(); c.arc(cx, cy0, R * 0.99, 0, 7); c.strokeStyle = '#2f6fd8'; c.lineWidth = R * 0.03; c.stroke();
  c.restore();
  if (o.lip) { c.beginPath(); c.arc(cx, cy0, R * 1.03, 0, 7); c.strokeStyle = '#0b0d0f'; c.lineWidth = R * 0.05; c.stroke(); }
  // Spinner preto brilhante, parafusos em volta e a espiral branca (avisa a equipe no chão que o motor está girando)
  const sg = c.createRadialGradient(cx - rh * 0.35, cy0 - rh * 0.4, rh * 0.05, cx, cy0, rh);
  sg.addColorStop(0, '#5c636a'); sg.addColorStop(0.35, '#1d2125'); sg.addColorStop(1, '#050607');
  c.beginPath(); c.arc(cx, cy0, rh, 0, 7); c.fillStyle = sg; c.fill(); c.strokeStyle = '#3a4046'; c.lineWidth = Math.max(1, R * 0.01); c.stroke();
  c.fillStyle = '#6b737a';
  for (let i = 0; i < 28; i++) { const a = ph + i / 28 * Math.PI * 2; c.beginPath(); c.arc(cx + Math.cos(a) * rh * 0.9, cy0 + Math.sin(a) * rh * 0.9, Math.max(0.7, R * 0.006), 0, 7); c.fill(); }
  c.beginPath();
  for (let i = 0; i <= 40; i++) { const t = i / 40, rr = rh * (0.06 + 0.52 * t), a = ph + t * Math.PI * 2.3; i ? c.lineTo(cx + rr * Math.cos(a), cy0 + rr * Math.sin(a)) : c.moveTo(cx + rr * Math.cos(a), cy0 + rr * Math.sin(a)); }
  c.strokeStyle = '#f3f2ec'; c.lineWidth = Math.max(1.5, rh * 0.13); c.lineCap = 'round'; c.stroke();
  // Ar sendo puxado para dentro da boca
  if (o.air && showAir) {
    c.lineCap = 'round'; c.lineWidth = Math.max(1, R * 0.008);
    for (const q of fanAir) {
      q.r -= q.v * (0.35 + sp) * (slow ? 0.3 : 1) * 0.06; q.a += 0.002;
      if (q.r < 1.0) { q.r = 1.45 + Math.random() * 0.45; q.a = Math.random() * 7; }
      const r1 = q.r * R, r0 = (q.r + 0.12) * R, al = clamp((1.6 - q.r) * 1.4, 0, 0.6) * clamp((q.r - 1.0) * 8, 0, 1);
      c.strokeStyle = pal.dark ? `rgba(170,205,255,${al})` : `rgba(60,100,160,${al})`;
      c.beginPath(); c.moveTo(cx + r0 * Math.cos(q.a), cy0 + r0 * Math.sin(q.a)); c.lineTo(cx + r1 * Math.cos(q.a), cy0 + r1 * Math.sin(q.a)); c.stroke();
    }
  }
}
// Vista de frente pequena dentro do corte (etapas da entrada e do fan).
function drawFront() {
  if (!((step === 1 || step === 2) && !sel || sel === 'fan' || sel === 'spinner')) return;
  const R = Math.min(72, H * 0.27, W * 0.15), cx = W - R - 14, cyy = MT + R + 10;
  ctx.beginPath(); ctx.arc(cx, cyy, R + 5, 0, 7); ctx.fillStyle = pal.panel; ctx.fill(); ctx.strokeStyle = pal.ink; ctx.lineWidth = 2; ctx.stroke();
  drawFanFront(ctx, cx, cyy, R * 0.84, { lip: true });
  ctx.fillStyle = pal.ink; ctx.font = `600 10.5px ${css('--mono') || 'monospace'}`; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.fillText('DE FRENTE · 18 PÁS', cx, cyy + R + 10);
}
// Cartão grande do fan de frente
let fcv = null, fctx = null, FW = 0, FH = 0;
function drawFanCard() {
  if (!fctx) return;
  fctx.fillStyle = pal.bg; fctx.fillRect(0, 0, FW, FH);
  const R = Math.min(FW, FH) * 0.385;
  drawFanFront(fctx, FW / 2, FH / 2, R, { lip: true, air: true });
  fctx.fillStyle = pal.ink; fctx.font = `600 12px ${css('--mono') || 'monospace'}`; fctx.textAlign = 'left'; fctx.textBaseline = 'top';
  fctx.fillText(`N1 ${nf(n1(), 1)} %`, 12, 10);
  drawCallout(fctx, 10, -(FH - 8), ['Pás e carcaça de compósito', '159 kg a menos que em metal'], 1, FW * 0.75);
}

function frame(t) {
  if (!active()) { raf = 0; return; }
  const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t; time += dt;
  sp += clamp(lever - sp, -dt / 4, dt / 6);
  const rot = (0.25 + 1.0 * sp) * 2 * Math.PI * (slow ? 0.25 : 1) * dt;
  phLP += rot; phHP -= rot * 1.6;
  // Câmera desliza até a etapa
  ex += (exT - ex) * (1 - Math.exp(-dt * 2.2)); if (Math.abs(ex - exT) < 0.002) ex = exT;
  const tg = STEPS[step].cam.map((v, i) => lerp(v, EXP_CAM[i], ex)), e = 1 - Math.exp(-dt * 4);
  cam.x0 += (tg[0] - cam.x0) * e; cam.x1 += (tg[1] - cam.x1) * e; cam.r += (tg[2] - cam.r) * e;
  k = Math.min((W - 16) / (cam.x1 - cam.x0), (H - 2 * MT - 8) / (2 * cam.r));
  ox = W / 2 - k * (cam.x0 + cam.x1) / 2; cy = H / 2;

  if (vis.main) {
  ctx.fillStyle = pal.bg; ctx.fillRect(0, 0, W, H);
  // Linha de centro
  ctx.strokeStyle = pal.muted; ctx.globalAlpha = 0.5; ctx.setLineDash([10, 4, 2, 4]); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
  // Fundo dos dutos (o interior do motor, atrás do corte): some quando os módulos se separam
  const fade = 1 - clamp(ex * 3, 0, 1);
  if (fade > 0.01) {
    ctx.globalAlpha = fade;
    for (const s of [1, -1]) {
      ctx.beginPath(); poly(band(-0.05, FAN_NOZ, (x) => (x < SPLIT ? hubIn(x) : cowl(x)), caseAt, 40), s);
      ctx.fillStyle = chrome(ctx, 0, SY(1.35 * s), 0, SY(0.4 * s), pal.ductB); ctx.fill();
      ctx.beginPath(); poly(band(SPLIT, CORE_NOZ, inC, outC, 60), s);
      ctx.fillStyle = chrome(ctx, 0, SY(0.65 * s), 0, SY(0.28 * s), pal.ductC); ctx.fill();
    }
    const hq = 0.35 + 0.65 * sp, hg = ctx.createLinearGradient(SX(3.62), 0, SX(CORE_NOZ), 0);
    hg.addColorStop(0, `rgba(255,120,20,${0.35 * hq})`); hg.addColorStop(0.18, `rgba(255,70,20,${0.6 * hq})`);
    hg.addColorStop(0.4, `rgba(255,90,20,${0.4 * hq})`); hg.addColorStop(1, `rgba(255,140,40,${0.15 * hq})`);
    fillBand(band(3.62, CORE_NOZ, inC, outC, 40), hg);
    // Brilho do jato quente
    const g = ctx.createLinearGradient(SX(CORE_NOZ), 0, SX(7.6), 0);
    g.addColorStop(0, `rgba(255,110,30,${0.4 * (0.3 + sp)})`); g.addColorStop(0.5, `rgba(255,120,40,${0.15 * (0.3 + sp)})`); g.addColorStop(1, 'rgba(255,120,30,0)');
    ctx.fillStyle = g; ctx.beginPath();
    ctx.moveTo(SX(CORE_NOZ), SY(0.5)); ctx.quadraticCurveTo(SX(6.8), SY(0.62), SX(7.6), SY(0.78)); ctx.lineTo(SX(7.6), SY(-0.78)); ctx.quadraticCurveTo(SX(6.8), SY(-0.62), SX(CORE_NOZ), SY(-0.5)); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
  }
  G('fan', () => drawDisks((rw) => rw.fan));
  G('core', () => { drawDisks((rw) => !rw.fan && rw.part !== 'lpt'); drawShaftHp(); drawBearings((x) => x < 4.46); });
  G('lpt', () => { drawDisks((rw) => rw.part === 'lpt'); drawShaftLp(); drawBearings((x) => x >= 4.46); });
  for (const rw of ROWS) {
    // Só a parte das pás que fica dentro do duto aparece (o resto está escondido atrás dos discos e da carcaça).
    const c = rw.fan ? 0.36 : rw.c, xa = rw.x - (rw.fan ? 0.06 : 0.012), xb = rw.x + c + 0.012;
    G(rowMod(rw), () => { ctx.save(); ctx.beginPath(); const q = band(xa, xb, rw.hub, rw.tip, 4); poly(q, 1); poly(q, -1); ctx.clip(); drawRow(rw); ctx.restore(); });
  }
  G('core', drawCombustor);
  airFade = fade;
  drawAir(dt);
  drawShellsMetal();
  if (fade > 0.01) { ctx.globalAlpha = fade; strokeProfile(inC, 1.15, CORE_NOZ, pal.cut, 1.4); ctx.globalAlpha = 1; }
  if (ex < 0.05) {
    drawHighlight();
    drawFlowArrows(dt);
    drawPins();
    drawFront();
    drawMainCallout(dt);
  } else { arrowA = 0; calloutA = 0; }
  drawModLabels();
  }

  uiT -= dt;
  if (uiT <= 0) { uiT = 0.2; updateUI(); }
  if ((gT -= dt) <= 0) { gT = 1 / 24; drawGallery(); }
  if (vis.fan) drawFanCard();
  if (vis.sec) drawSection(dt);
  raf = requestAnimationFrame(frame);
}


/* ---------- Peças separadas (galeria) ---------- */
// Metal polido: faixas claras e escuras, como cromado refletindo o ambiente.
function metalGrad(c, x0, y0, x1, y1, a = '#f7f9fa', b = pal.dark ? '#3a444d' : '#7d8790') { const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, b); g.addColorStop(0.25, a); g.addColorStop(0.45, b); g.addColorStop(0.7, a); g.addColorStop(1, b); return g; }
const PIECES = [
  { id: 'fan', nome: 'Pá do fan', txt: 'Fibra de carbono, borda de ataque metálica e raiz encaixada no disco.', draw(c, w, h) {
    const cx = w / 2;
    c.beginPath(); // aerofólio torcido e enflechado
    c.moveTo(cx - 6, h * 0.8); c.bezierCurveTo(cx - 14, h * 0.55, cx - 30, h * 0.3, cx - 22, h * 0.05);
    c.lineTo(cx + 18, h * 0.08); c.bezierCurveTo(cx + 16, h * 0.35, cx + 10, h * 0.6, cx + 8, h * 0.8); c.closePath();
    c.fillStyle = metalGrad(c, cx - 30, 0, cx + 20, 0, '#eef2f5', '#22282e'); c.fill(); c.strokeStyle = '#0b0e11'; c.lineWidth = 1.2; c.stroke();
    c.beginPath(); c.moveTo(cx - 6, h * 0.8); c.bezierCurveTo(cx - 14, h * 0.55, cx - 30, h * 0.3, cx - 22, h * 0.05);
    c.strokeStyle = pal.dark ? '#dfe5ea' : '#c4ccd2'; c.lineWidth = 3; c.stroke();
    c.fillStyle = metalGrad(c, cx - 16, 0, cx + 16, 0); // plataforma e raiz em rabo de andorinha
    c.fillRect(cx - 15, h * 0.8, 30, 5); c.strokeStyle = pal.ink; c.lineWidth = 1; c.strokeRect(cx - 15, h * 0.8, 30, 5);
    c.beginPath(); c.moveTo(cx - 7, h * 0.8 + 5); c.lineTo(cx - 11, h * 0.96); c.lineTo(cx + 11, h * 0.96); c.lineTo(cx + 7, h * 0.8 + 5); c.closePath(); c.fill(); c.stroke();
  } },
  { id: 'hpc', nome: 'Rotor do compressor', txt: 'Estágios presos num tambor; cada fileira é menor que a anterior.', draw(c, w, h, t) {
    const y = h / 2, x0 = w * 0.14, x1 = w * 0.86;
    c.fillStyle = metalGrad(c, 0, y - 16, 0, y + 16); c.fillRect(x0 - 16, y - 5, x1 - x0 + 32, 10); c.strokeStyle = pal.ink; c.strokeRect(x0 - 16, y - 5, x1 - x0 + 32, 10);
    c.beginPath(); c.moveTo(x0, y - 16); c.lineTo(x1, y - 11); c.lineTo(x1, y + 11); c.lineTo(x0, y + 16); c.closePath(); c.fillStyle = metalGrad(c, 0, y - 16, 0, y + 16); c.fill(); c.stroke();
    for (let i = 0; i < 7; i++) {
      const x = lerp(x0 + 4, x1 - 6, i / 6), R = lerp(h * 0.44, h * 0.27, i / 6), r0 = lerp(16, 11, i / 6);
      for (let j = 0; j < 14; j++) {
        const a = t * (1.2) + j / 14 * Math.PI * 2, s = Math.sin(a); if (s > 0) continue;
        const ya = Math.cos(a);
        c.beginPath(); c.moveTo(x, y - ya * r0); c.lineTo(x, y - ya * R); c.lineTo(x + 5, y - ya * R + 3 * s); c.lineTo(x + 5, y - ya * r0 + 3 * s); c.closePath();
        c.fillStyle = rgb(pal.hp, 0.75 + 0.25 * -s); c.fill(); c.strokeStyle = pal.ink; c.lineWidth = 0.4; c.stroke();
      }
    }
  } },
  { id: 'fuel', nome: 'Injetor de combustível', txt: 'Haste com flange presa na carcaça; o bico gira o ar e pulveriza o querosene.', draw(c, w, h) {
    const x = w * 0.42;
    c.fillStyle = metalGrad(c, x - 24, 0, x + 24, 0); c.strokeStyle = pal.ink; c.lineWidth = 1;
    c.fillRect(x - 22, h * 0.1, 44, 8); c.strokeRect(x - 22, h * 0.1, 44, 8);
    c.fillStyle = metalGrad(c, x - 6, 0, x + 6, 0); c.fillRect(x - 5, h * 0.1 + 8, 10, h * 0.45); c.strokeRect(x - 5, h * 0.1 + 8, 10, h * 0.45);
    const yb = h * 0.62;
    c.fillStyle = metalGrad(c, 0, yb - 12, 0, yb + 12); c.beginPath(); c.rect(x - 5, yb - 10, 46, 20); c.fill(); c.stroke();
    for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(x + 14 + i * 7, yb - 10); c.lineTo(x + 18 + i * 7, yb + 10); c.stroke(); }
    c.fillStyle = pal.dark ? '#d8c27a' : '#a07c1c'; c.beginPath(); c.arc(x + 43, yb, 4, 0, 7); c.fill();
    c.strokeStyle = 'rgba(240,140,40,.8)'; c.lineWidth = 1.2;
    for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(x + 47, yb); c.lineTo(x + 66, yb + i * 6); c.stroke(); }
  } },
  { id: 'comb', nome: 'Câmara anular', txt: 'Um anel inteiro em volta do eixo, com paredes cheias de furinhos de resfriamento.', draw(c, w, h, t) {
    const cx = w / 2, cy = h * 0.52, R = Math.min(w * 0.34, h * 0.42);
    c.save(); c.translate(cx, cy); c.scale(1, 0.85);
    c.beginPath(); c.arc(0, 0, R, 0, 7); c.arc(0, 0, R * 0.55, 0, 7, true); c.fillStyle = metalGrad(c, -R, -R, R, R); c.fill('evenodd'); c.strokeStyle = pal.ink; c.lineWidth = 1; c.stroke();
    c.beginPath(); c.arc(0, 0, R * 0.9, 0, 7); c.arc(0, 0, R * 0.65, 0, 7, true);
    const g = c.createRadialGradient(0, 0, R * 0.6, 0, 0, R * 0.9); g.addColorStop(0, 'rgba(240,110,30,.9)'); g.addColorStop(0.5, `rgba(255,190,60,${0.75 + 0.2 * Math.sin(t * 9)})`); g.addColorStop(1, 'rgba(230,90,30,.9)');
    c.fillStyle = g; c.fill('evenodd');
    c.fillStyle = pal.dark ? '#3b4650' : '#6c7880';
    for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2; c.beginPath(); c.arc(Math.cos(a) * R * 0.775, Math.sin(a) * R * 0.775, 2.2, 0, 7); c.fill(); }
    c.restore();
  } },
  { id: 'hpt', nome: 'Pá da turbina de alta', txt: 'Níquel de cristal único, oca, com furos que soltam ar de resfriamento.', draw(c, w, h) {
    const cx = w / 2;
    c.beginPath(); c.moveTo(cx - 14, h * 0.62); c.bezierCurveTo(cx - 22, h * 0.4, cx - 18, h * 0.2, cx - 12, h * 0.08); c.lineTo(cx + 14, h * 0.1); c.bezierCurveTo(cx + 18, h * 0.3, cx + 16, h * 0.48, cx + 12, h * 0.62); c.closePath();
    c.fillStyle = metalGrad(c, cx - 22, 0, cx + 18, 0, pal.dark ? '#e0b98a' : '#d0a670', pal.dark ? '#8f6a45' : '#8a6338'); c.fill(); c.strokeStyle = pal.ink; c.lineWidth = 1; c.stroke();
    c.fillStyle = pal.dark ? '#2b241c' : '#3a2c1c';
    for (let i = 0; i < 7; i++) { const yy = lerp(h * 0.14, h * 0.56, i / 6); c.beginPath(); c.arc(cx - 15 + Math.sin(i) * 1.5, yy, 1.4, 0, 7); c.fill(); c.beginPath(); c.arc(cx - 6, yy + 3, 1.1, 0, 7); c.fill(); }
    c.fillStyle = metalGrad(c, cx - 22, 0, cx + 22, 0, pal.dark ? '#cfb08a' : '#c09a6a', pal.dark ? '#7e5f40' : '#7a5834');
    c.fillRect(cx - 20, h * 0.62, 40, 6); c.strokeRect(cx - 20, h * 0.62, 40, 6);
    c.beginPath(); c.moveTo(cx - 9, h * 0.62 + 6); // raiz em "pinheiro"
    for (let i = 0; i < 3; i++) { const y0 = h * 0.62 + 6 + i * 8; c.lineTo(cx - 13 + i * 1.5, y0 + 4); c.lineTo(cx - 8 + i * 1.5, y0 + 8); }
    c.lineTo(cx + 8 - 4.5, h * 0.62 + 30);
    for (let i = 2; i >= 0; i--) { const y0 = h * 0.62 + 6 + i * 8; c.lineTo(cx + 8 - i * 1.5, y0 + 8); c.lineTo(cx + 13 - i * 1.5, y0 + 4); }
    c.lineTo(cx + 9, h * 0.62 + 6); c.closePath(); c.fill(); c.stroke();
  } },
  { id: 'lpt', nome: 'Estágio da turbina de baixa', txt: 'Disco com dezenas de pás em volta, preso no eixo N1.', draw(c, w, h, t) {
    const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.46, a0 = t * 0.8;
    for (let j = 0; j < 44; j++) {
      const a = a0 + j / 44 * Math.PI * 2;
      c.beginPath(); c.moveTo(cx + Math.cos(a) * R * 0.62, cy + Math.sin(a) * R * 0.62); c.lineTo(cx + Math.cos(a + 0.05) * R, cy + Math.sin(a + 0.05) * R); c.lineTo(cx + Math.cos(a + 0.12) * R, cy + Math.sin(a + 0.12) * R); c.lineTo(cx + Math.cos(a + 0.09) * R * 0.62, cy + Math.sin(a + 0.09) * R * 0.62); c.closePath();
      c.fillStyle = rgb(pal.hot, 0.8 + 0.2 * Math.cos(a)); c.fill(); c.strokeStyle = pal.ink; c.lineWidth = 0.4; c.stroke();
    }
    c.beginPath(); c.arc(cx, cy, R * 0.63, 0, 7); c.fillStyle = metalGrad(c, cx - R, cy - R, cx + R, cy + R); c.fill(); c.strokeStyle = pal.ink; c.lineWidth = 1; c.stroke();
    c.beginPath(); c.arc(cx, cy, R * 0.22, 0, 7); c.fillStyle = rgb(pal.lp); c.fill(); c.stroke();
    c.fillStyle = pal.ink; for (let i = 0; i < 10; i++) { const a = a0 + i / 10 * Math.PI * 2; c.beginPath(); c.arc(cx + Math.cos(a) * R * 0.34, cy + Math.sin(a) * R * 0.34, 1.6, 0, 7); c.fill(); }
  } },
  { id: 'mancal', nome: 'Mancal de rolamento', txt: 'Esferas ou rolos entre dois anéis, banhados em óleo, seguram o eixo girando.', draw(c, w, h, t) {
    const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.44;
    c.beginPath(); c.arc(cx, cy, R, 0, 7); c.arc(cx, cy, R * 0.78, 0, 7, true); c.fillStyle = metalGrad(c, cx - R, cy - R, cx + R, cy + R); c.fill('evenodd'); c.strokeStyle = pal.ink; c.lineWidth = 1; c.stroke();
    c.beginPath(); c.arc(cx, cy, R * 0.52, 0, 7); c.arc(cx, cy, R * 0.34, 0, 7, true); c.fill('evenodd'); c.stroke();
    for (let i = 0; i < 12; i++) { const a = t * 0.5 + i / 12 * Math.PI * 2; c.beginPath(); c.arc(cx + Math.cos(a) * R * 0.65, cy + Math.sin(a) * R * 0.65, R * 0.11, 0, 7); c.fillStyle = metalGrad(c, cx - 5, cy - 5, cx + 5, cy + 5); c.fill(); c.stroke(); }
    c.beginPath(); c.arc(cx, cy, R * 0.3, 0, 7); c.fillStyle = rgb(pal.lp); c.fill(); c.stroke();
  } },
];
let gal = [];
function buildGallery() {
  const box = $('#engGallery');
  if (!box) return;
  box.innerHTML = PIECES.map((p) => `<button type="button" class="eng__piece" data-epart="${p.id}" aria-pressed="false"><canvas></canvas><b>${p.nome}</b><span>${p.txt}</span></button>`).join('');
  box.addEventListener('click', (e) => { const b = e.target.closest('[data-epart]'); if (b) pickPart(b.dataset.epart); });
  gal = [...box.querySelectorAll('canvas')].map((cvs, i) => ({ cvs, p: PIECES[i] }));
}
function sizeGallery() {
  for (const g of gal) {
    const w = g.cvs.clientWidth || 140, hh = 110;
    g.cvs.width = w * dpr; g.cvs.height = hh * dpr; g.w = w; g.h = hh;
    g.c = g.cvs.getContext('2d'); g.c.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
}
function drawGallery() {
  for (const g of gal) {
    if (!g.c) continue;
    g.c.clearRect(0, 0, g.w, g.h);
    g.c.lineJoin = 'round';
    g.p.draw(g.c, g.w, g.h, time * (slow ? 0.25 : 1) * (0.3 + sp));
  }
}

/* ---------- Seções em detalhe: compressor de baixa, compressor de alta e câmara de combustão ---------- */
// Close-ups sem a carcaça da frente: o tambor gira e as pás aparecem inteiras, com o ar passando entre elas.
let scv = null, sctx = null, SW = 0, SH = 0, sec = 'lpc', secCallA = 0;
const ST = { k: 1, ox: 0, oy: 0 };
const sX = (x) => ST.ox + x * ST.k, sY = (y) => ST.oy - y * ST.k;
const SMT = 34, SMB = 46; // faixas de cima (etiquetas) e de baixo (pressão)
const SECS = {
  lpc: {
    x0: 1.37, x1: 2.34, y0: 0.26, y1: 0.92, parts: ['lpc'], callout: ['Booster de 4 estágios', 'verde: ar do núcleo · azul: ar do fan'], t: 'Compressor de baixa (booster)', temp: [55, 110], pres: [1.6, 2], sp: 'lp',
    txt: 'Visto de perto e sem a carcaça da frente. O tambor gira junto com o fan (eixo N1) e leva 4 fileiras de pás (rotor). Entre elas ficam as palhetas fixas, presas na carcaça (estator). Repare no ar: o rotor empurra e faz o ar girar, o estator endireita esse giro e transforma a velocidade em pressão. No fim, as válvulas VBV abrem em baixa rotação e soltam o excesso de ar para o duto do fan.',
    facts: [['Estágios', '4'], ['Eixo', 'N1 (baixa)'], ['Pressão', 'cerca de 1,6 → 2 atm'], ['VBV', 'Abertas em baixa rotação']],
    pins: [['Pás do rotor (giram)', 1.62, 0.5], ['Palhetas do estator (fixas)', 1.73, 0.62], ['Tambor do rotor', 1.85, 0.36], ['Carcaça (cortada)', 1.5, 0.66], ['Válvula de sangria (VBV)', 2.12, 0.6], ['Ar vindo do fan', 1.4, 0.55]],
  },
  hpc: {
    x0: 2.6, x1: 3.62, y0: 0.1, y1: 0.56, parts: ['hpc'], callout: ['Compressor de alta', 'recorde de compressão: 23 : 1'], t: 'Compressor de alta (HPC)', temp: [115, 640], pres: [2, 44], sp: 'hp',
    txt: 'São 10 estágios no eixo N2, que gira mais rápido e no sentido contrário do N1. As pás ficam menores a cada estágio porque o ar, mais apertado, ocupa menos espaço. As primeiras fileiras de estator são variáveis (VSV): um anel na carcaça gira todas as palhetas juntas, fechando em baixa rotação e abrindo em alta. Mexa na manete e veja as alavancas mudarem de ângulo. O ar sai a cerca de 44 atm e mais de 600 °C.',
    facts: [['Estágios', '10'], ['Eixo', 'N2 (alta)'], ['Pressão', 'cerca de 2 → 44 atm'], ['VSV', 'Primeiras fileiras']],
    pins: [['Pás do rotor (giram)', 2.95, 0.36], ['Palhetas do estator (fixas)', 3.2, 0.38], ['VSV: anel e alavancas', 2.76, 0.47], ['Tambor do rotor', 3.05, 0.15], ['Carcaça (cortada)', 3.4, 0.4], ['Saída para a câmara', 3.58, 0.34]],
  },
  comb: {
    x0: 3.5, x1: 4.3, y0: 0.215, y1: 0.53, callout: ['Câmara TAPS', 'variação de temperatura na saída 205 °C menor'], t: 'Câmara de combustão', temp: [640, 1500], pres: [44, 42], sp: 'hp',
    txt: 'O ar chega do compressor de alta a cerca de 44 atm e mais de 600 °C e desacelera no difusor. Uma parte entra pelo turbilhonador (swirler), que faz o ar girar e mistura o querosene que sai do injetor. A chama passa de azul a amarelo e branco, perto de 2.000 °C. O resto do ar passa por fora do revestimento, resfria as paredes pelos furinhos e entra pelos furos de diluição para baixar a temperatura antes da turbina. Na saída, as palhetas guia (em vermelho) apontam o gás para as pás da turbina de alta.',
    facts: [['Entrada', 'cerca de 600 °C e 44 atm'], ['Chama', 'perto de 2.000 °C'], ['Saída', 'cerca de 1.500 °C'], ['Ignição', 'Velas, na partida']],
    pins: [['Injetor de combustível', 3.6, 0.44], ['Turbilhonador (swirler)', 3.68, 0.355], ['Revestimento da câmara', 3.92, 0.414], ['Furos de diluição', 3.87, 0.288], ['Vela de ignição', 3.86, 0.44], ['Ar do compressor', 3.54, 0.33], ['Palhetas guia da turbina', 4.1, 0.37], ['Pás da turbina de alta', 4.19, 0.34]],
  },
  turb: {
    x0: 4.05, x1: 5.56, y0: 0.15, y1: 0.8, parts: ['hpt', 'lpt'], callout: ['Controle ativo de folga', 'ar do fan esfria a carcaça da turbina'], t: 'Turbinas de alta e de baixa', temp: [1500, 560], pres: [42, 1.1], sp: 'lp',
    txt: 'Os gases quentes saem da câmara e passam primeiro pela turbina de alta: 2 estágios que giram o compressor de alta (eixo N2). Depois vem a turbina de baixa: 6 estágios, cada vez maiores, que giram o fan e o booster (eixo N1). Cada fileira de palhetas fixas acelera e vira o gás, e cada fileira de pás tira energia dele, por isso a pressão e a temperatura caem a cada estágio. Em volta da carcaça ficam os tubos azuis do controle ativo de folga (ACC): eles sopram ar frio do fan na carcaça, que encolhe um pouco e deixa as pontas das pás bem perto da parede. Menos ar escapa pela folga, e o motor gasta menos combustível.',
    facts: [['Turbina de alta', '2 estágios · N2'], ['Turbina de baixa', '6 estágios · N1'], ['Pressão', 'cerca de 42 → 1 atm'], ['ACC', 'Ar do fan na carcaça']],
    pins: [['Palhetas guia (NGV)', 4.11, 0.37], ['Pás da turbina de alta', 4.21, 0.36], ['Pás da turbina de baixa', 4.96, 0.47], ['Discos e tambor', 4.8, 0.24], ['Tubos do controle de folga (ACC)', 4.95, 0.62], ['Carcaça quente', 4.6, 0.5]],
  },
};
// Geometria da câmara em detalhe
const CB = {
  out: lin([[3.5, 0.368], [3.6, 0.44], [4.1, 0.452], [4.3, 0.45]]),
  inn: lin([[3.5, 0.303], [3.6, 0.262], [4.1, 0.25], [4.3, 0.28]]),
  linO: smooth([[3.69, 0.396], [3.8, 0.414], [3.95, 0.415], [4.065, 0.4]]),
  linI: smooth([[3.69, 0.302], [3.8, 0.286], [3.95, 0.287], [4.065, 0.316]]),
  gasO: lin([[4.06, 0.402], [4.3, 0.43]]), gasI: lin([[4.06, 0.314], [4.3, 0.314]]),
};
function sPoly(c, pts) { c.moveTo(sX(pts[0][0]), sY(pts[0][1])); for (let i = 1; i < pts.length; i++) c.lineTo(sX(pts[i][0]), sY(pts[i][1])); c.closePath(); }
function sFill(c, pts, fill, stroke, lw = 1.5) { c.beginPath(); sPoly(c, pts); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.stroke(); } }

// Uma fileira de pás no close-up. side = -1: metade de trás (aparece acima do tambor); +1: metade da frente (por cima do tambor).
function secRow(c, rw, ph, side, stAdd = 0, color = null) {
  const xc = rw.x + rw.c / 2, rh = rw.hub(xc), rt = rw.tip(xc);
  const base = color || (rw.part === 'hpt' && rw.kind === 's' && rw.x < 4.12 ? [230, 80, 70] : rw.kind === 's' ? pal.st : rw.hot ? pal.hot : rw.sp === 'hp' ? pal.hp : pal.lp);
  const st = (rw.st + stAdd) * D2R, cs = Math.cos(st), sn = Math.sin(st);
  const list = [], n = Math.round(rw.n * (rw.part === 'lpc' || rw.part === 'hpc' ? 3 : rw.part === 'hpt' || rw.part === 'lpt' ? 2.2 : 1));
  for (let j = 0; j < n; j++) {
    const a = (rw.kind === 's' ? 0.37 : ph) + j * 2 * Math.PI / n, s = Math.sin(a);
    if ((side > 0) !== (s > 0) || Math.cos(a) < -0.1) continue;
    list.push([a, s]);
  }
  list.sort((p, q) => p[1] - q[1]);
  const spk = rw.kind === 's' ? 0.35 : 0.85, gloss = rw.kind === 's' ? 10 : 22;
  for (const [a, s] of list) {
    const ca = Math.cos(a), le = [], te = [];
    for (const u of [0, 0.5, 1]) {
      const r = lerp(rh, rt, u), bow = u === 0.5 ? rw.c * 0.14 : 0, cc = rw.c * (1 - 0.15 * u);
      le.push([rw.x + bow, r * ca]); te.push([rw.x + cc * cs + bow, r * ca - cc * sn * s]);
    }
    const [R, G, B, spec] = shade(base, st, a, spk, gloss, side > 0 ? 0.58 : 0.4);
    c.beginPath(); c.moveTo(sX(le[0][0]), sY(le[0][1]));
    for (const q of le.slice(1)) c.lineTo(sX(q[0]), sY(q[1]));
    for (const q of te.slice().reverse()) c.lineTo(sX(q[0]), sY(q[1]));
    c.closePath();
    if (side > 0) {
      // Face lisa: clara na borda de ataque, mais escura na de fuga (como as pás cor de marfim do vídeo)
      const g = c.createLinearGradient(sX(le[1][0]), sY(le[1][1]), sX(te[1][0]), sY(te[1][1]));
      g.addColorStop(0, `rgb(${Math.min(255, R + 38) | 0},${Math.min(255, G + 36) | 0},${Math.min(255, B + 30) | 0})`);
      g.addColorStop(0.4, `rgb(${R | 0},${G | 0},${B | 0})`); g.addColorStop(1, `rgb(${R * 0.62 | 0},${G * 0.6 | 0},${B * 0.56 | 0})`);
      c.fillStyle = g; c.fill();
      c.strokeStyle = 'rgba(40,36,30,.22)'; c.lineWidth = 0.5; c.stroke();
    } else {
      c.fillStyle = `rgb(${R | 0},${G | 0},${B | 0})`; c.fill();
      c.strokeStyle = 'rgba(4,6,8,.8)'; c.lineWidth = 0.8; c.stroke();
    }
    if (rw.kind === 'r') {
      c.beginPath(); c.moveTo(sX(le[0][0]), sY(le[0][1])); for (const q of le.slice(1)) c.lineTo(sX(q[0]), sY(q[1]));
      c.strokeStyle = `rgba(255,255,255,${clamp(0.2 + spec * 1.5, 0, 0.95)})`; c.lineWidth = 1.2; c.stroke();
    }
  }
}
// Ar no close-up do compressor: anda em hélice; cada rotor faz o ar girar e cada estator endireita.
let secAir = [], swirlTab = null, swirlId = '';
function buildSwirl(id) {
  const S = SECS[id], rows = ROWS.filter((r) => S.parts.includes(r.part)), N = 300, tab = new Float32Array(N + 1);
  let acc = 0;
  for (let i = 0; i <= N; i++) {
    const x = lerp(S.x0, S.x1, i / N), dx = (S.x1 - S.x0) / N;
    for (const rw of rows) {
      if (x < rw.x || x >= rw.x + rw.c) continue;
      const dir = rw.sp === 'hp' || (rw.kind === 's' && rw.part === 'hpc') ? -1 : 1, turb = rw.part === 'hpt' || rw.part === 'lpt' ? -1 : 1;
      acc += (rw.kind === 'r' ? 0.14 : -0.14) * dir * turb * dx / rw.c;
    }
    tab[i] = acc;
  }
  swirlTab = tab; swirlId = id;
  secAir = Array.from({ length: 300 }, () => ({ x: lerp(S.x0, S.x1, Math.random()), f: 0.08 + Math.random() * 0.84, th: Math.random() * Math.PI * 2 }));
}
function swirlAt(id, x) { const S = SECS[id], i = clamp(Math.round((x - S.x0) / (S.x1 - S.x0) * 300), 0, 300); return swirlTab[i]; }
function airPos(id, p, x) {
  const r = lerp(inC(x) + 0.006, outC(x) - 0.006, p.f), th = p.th + swirlAt(id, x);
  return [r * Math.cos(th), r * Math.sin(th), r];
}
function secAirDraw(c, id, dt, near) {
  const S = SECS[id], U = (0.1 + 0.3 * sp) * (slow ? 0.3 : 1);
  const lw = clamp(ST.k * 0.004, 1.2, 2.6);
  c.lineCap = 'round';
  for (const p of secAir) {
    if (near) { p.x += U * dt; if (p.x > S.x1) { p.x = S.x0; p.th = Math.random() * Math.PI * 2; } }
    const L = 0.06, hx = p.x, [y, z] = airPos(id, p, hx);
    const vis = (z > 0) === near && y > 0 && (z > 0 || y > inC(hx));
    if (!vis) continue;
    const tf = (hx - S.x0) / (S.x1 - S.x0), T = lerp(S.temp[0], S.temp[1], tf) * (0.4 + 0.6 * tScale());
    c.strokeStyle = pal.lut[lutOf(T)];
    let [py] = airPos(id, p, hx - L), px = hx - L;
    for (let lv = 0; lv < 3; lv++) {
      const nx = hx - L * (2 - lv) / 3, [ny] = airPos(id, p, nx);
      c.globalAlpha = [0.18, 0.45, 0.95][lv] * (near ? 1 : 0.55);
      c.lineWidth = near ? lw : lw * 0.8;
      c.beginPath(); c.moveTo(sX(px), sY(py)); c.lineTo(sX(nx), sY(ny)); c.stroke();
      px = nx; py = ny;
    }
  }
  c.globalAlpha = 1;
}
// Tambor do rotor visto de lado: cilindro polido, mais claro onde a luz bate.
function drumGrad(c, rMax) {
  const g = c.createLinearGradient(0, sY(0), 0, sY(rMax));
  for (let i = 0; i <= 6; i++) {
    const u = i / 6, ny = u, nz = Math.sqrt(Math.max(0, 1 - u * u));
    const d = Math.max(0, ny * LIGHT[1] + nz * LIGHT[2]), sp2 = Math.pow(Math.max(0, ny * HALF[1] + nz * HALF[2]), 18);
    const v = clamp(0.25 + 0.7 * d, 0, 1), w = 255 * sp2 * 0.6;
    g.addColorStop(u, `rgb(${Math.min(255, 232 * v + w) | 0},${Math.min(255, 226 * v + w) | 0},${Math.min(255, 212 * v + w) | 0})`);
  }
  return g;
}
function secCompressor(c, id, dt) {
  const S = SECS[id], rows = ROWS.filter((r) => S.parts.includes(r.part)), phOf = (rw) => (rw.sp === 'hp' ? phHP : phLP), turb = id === 'turb';
  if (swirlId !== id) buildSwirl(id);
  const vsv = id === 'hpc' ? -22 * (1 - sp) : 0; // VSV: fecham em baixa rotação
  const casing = (x) => outC(x) + 0.05;
  // Duto (fundo escuro), metade de trás das fileiras e o ar de trás
  c.beginPath(); sPoly(c, band(S.x0, S.x1, inC, outC, 40)); c.fillStyle = chrome(c, 0, sY(0.7), 0, sY(0.25), pal.ductC); c.fill();
  c.save(); c.beginPath(); sPoly(c, band(S.x0, S.x1, inC, outC, 40)); c.clip();
  let si = 0;
  for (const rw of rows) { secRow(c, rw, phOf(rw), -1, rw.kind === 's' && si++ < 4 ? vsv : 0); }
  secAirDraw(c, id, dt, false);
  c.restore();
  // Tambor com as emendas dos discos e parafusos
  const rMax = Math.max(...rows.map((r) => r.hub(r.x)));
  c.beginPath(); sPoly(c, band(S.x0, S.x1, K(0), inC, 40)); c.fillStyle = drumGrad(c, rMax); c.fill();
  c.strokeStyle = pal.cut; c.lineWidth = 1.2; c.stroke();
  for (const rw of rows) {
    if (rw.kind !== 'r') continue;
    const x = rw.x + rw.c * 0.5, h0 = inC(x);
    c.strokeStyle = 'rgba(60,56,48,.45)'; c.lineWidth = Math.max(1, ST.k * 0.004);
    c.beginPath(); c.moveTo(sX(x + rw.c * 0.7), sY(0)); c.lineTo(sX(x + rw.c * 0.7), sY(h0)); c.stroke();
    c.fillStyle = 'rgba(70,66,58,.55)';
    for (let b = 0; b < 6; b++) { const yy = h0 * (0.12 + b * 0.15); c.beginPath(); c.arc(sX(x + rw.c * 0.7 + 0.008), sY(yy), Math.max(1, ST.k * 0.0035), 0, 7); c.fill(); }
  }
  // Metade da frente das pás do rotor, por cima do tambor, e o ar da frente
  c.save(); c.beginPath(); sPoly(c, band(S.x0, S.x1, K(-0.05), outC, 40)); c.clip();
  for (const rw of rows) if (rw.kind === 'r') secRow(c, rw, phOf(rw), 1);
  secAirDraw(c, id, dt, true);
  c.restore();
  // Carcaça cortada (com a borda azul do corte)
  c.beginPath(); sPoly(c, band(S.x0, S.x1, outC, casing, 40));
  c.fillStyle = turb ? chrome(c, 0, sY(0.62), 0, sY(0.4), ['#ff9d84', '#d6362e', '#8f2019']) : chrome(c, 0, sY(0.8), 0, sY(0.3), pal.shell4);
  c.fill(); c.strokeStyle = pal.cut; c.lineWidth = 2; c.stroke();
  if (turb) {
    // Controle ativo de folga: tubos azuis em volta da carcaça soprando ar frio do fan
    for (const [xa, xb] of [[4.14, 4.42], [4.58, 5.42]]) {
      const top = (x) => casing(x) + 0.045;
      c.beginPath(); sPoly(c, band(xa, xb, (x) => casing(x) + 0.018, top, 12));
      c.fillStyle = 'rgba(90,170,255,.45)'; c.fill(); c.strokeStyle = 'rgba(160,210,255,.9)'; c.lineWidth = 1.5; c.stroke();
      c.strokeStyle = 'rgba(150,205,255,.85)'; c.lineWidth = Math.max(2, ST.k * 0.004); c.lineCap = 'round';
      for (let x = xa + 0.04; x < xb - 0.02; x += 0.08) {
        for (let j = 0; j < 2; j++) {
          const u = (time * 1.3 + j * 0.5 + x * 3) % 1, y = casing(x) + 0.016 - u * 0.012;
          c.globalAlpha = 1 - u; c.beginPath(); c.moveTo(sX(x - 0.012), sY(y + 0.008)); c.lineTo(sX(x), sY(y)); c.lineTo(sX(x + 0.012), sY(y + 0.008)); c.stroke();
        }
      }
      c.globalAlpha = 1;
      // Tubo que traz o ar do fan
      const xm = (xa + xb) / 2;
      c.fillStyle = 'rgba(90,170,255,.4)'; c.fillRect(sX(xm - 0.018), sY(S.y1 + 0.05), 0.036 * ST.k, (S.y1 + 0.05 - top(xm)) * ST.k);
    }
  } else if (id === 'lpc') {
    // Carenagem do núcleo por cima e a porta da VBV
    c.beginPath(); sPoly(c, band(S.x0, S.x1, cowl, K(0.95), 20)); c.fillStyle = chrome(c, 0, sY(0.95), 0, sY(0.75), pal.ductB); c.fill();
    c.beginPath(); sPoly(c, band(S.x0, S.x1, (x) => cowl(x) - 0.025, cowl, 30));
    c.fillStyle = chrome(c, 0, sY(0.82), 0, sY(0.7), pal.shell4); c.fill(); c.strokeStyle = pal.cut; c.lineWidth = 1.5; c.stroke();
    const open = clamp(1 - sp * 1.6, 0, 1) * 0.9, x = 2.1, r0 = outC(x);
    c.save(); c.translate(sX(x), sY(r0 + 0.02)); c.rotate(-open);
    c.fillStyle = '#c99a2e'; c.fillRect(0, -4, 0.13 * ST.k, 8); c.strokeStyle = '#0b0e11'; c.lineWidth = 1; c.strokeRect(0, -4, 0.13 * ST.k, 8);
    c.restore();
    if (open > 0.05) { // ar saindo pela VBV
      c.strokeStyle = pal.lut[2]; c.lineWidth = 2;
      for (let i = 0; i < 5; i++) { const u = (time * 0.8 + i / 5) % 1; c.globalAlpha = (1 - u) * open; c.beginPath(); c.moveTo(sX(x + 0.02 + u * 0.05), sY(r0 + 0.04 + u * 0.12)); c.lineTo(sX(x + 0.04 + u * 0.06), sY(r0 + 0.07 + u * 0.14)); c.stroke(); }
      c.globalAlpha = 1;
    }
    const sa = (pts, col, w) => {
      c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
      const path = () => { c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(sX(x), sY(y)) : c.moveTo(sX(x), sY(y)))); };
      path(); c.strokeStyle = `rgba(${col},.4)`; c.lineWidth = w; c.stroke();
      path(); c.strokeStyle = `rgba(${col},.95)`; c.lineWidth = w * 0.28; c.setLineDash([w * 1.2, w * 1.6]); c.lineDashOffset = -time * w * 6; c.stroke(); c.setLineDash([]);
      const [xa, ya] = pts[pts.length - 2], [xb, yb] = pts[pts.length - 1], a = Math.atan2(sY(yb) - sY(ya), sX(xb) - sX(xa)), L = w * 1.5;
      c.fillStyle = `rgba(${col},1)`; c.beginPath(); c.moveTo(sX(xb) + Math.cos(a) * L * 0.4, sY(yb) + Math.sin(a) * L * 0.4);
      c.lineTo(sX(xb) + Math.cos(a + 2.5) * L, sY(yb) + Math.sin(a + 2.5) * L); c.lineTo(sX(xb) + Math.cos(a - 2.5) * L, sY(yb) + Math.sin(a - 2.5) * L); c.closePath(); c.fill();
      c.restore();
    };
    const w = clamp(ST.k * 0.022, 6, 16), mid = (x) => lerp(inC(x), outC(x), 0.62), green = [];
    for (let i = 0; i <= 24; i++) { const x = lerp(S.x0 + 0.02, 2.06, i / 24); green.push([x, mid(x)]); }
    if (open > 0.15) for (let i = 1; i <= 10; i++) { const u = i / 10; green.push([2.06 + u * 0.12, lerp(mid(2.06), cowl(2.2) + 0.06, Math.sin(u * Math.PI / 2))]); }
    else for (let i = 1; i <= 10; i++) { const x = 2.06 + i * 0.026; green.push([x, mid(x)]); }
    sa(green, '150,230,120', w);
    const blue = []; for (let i = 0; i <= 20; i++) { const x = lerp(S.x0 + 0.02, S.x1 - 0.04, i / 20); blue.push([x, cowl(x) + 0.05]); }
    sa(blue, '150,200,255', w);
  } else {
    // VSV: anéis de comando e alavancas em cima da carcaça, que giram com a manete
    const st = rows.filter((r) => r.kind === 's').slice(0, 4);
    for (const rw of st) {
      const x = rw.x + rw.c / 2, top = casing(x);
      c.fillStyle = chrome(c, 0, sY(top + 0.03), 0, sY(top), pal.shaftHp); c.fillRect(sX(x - 0.012), sY(top + 0.028), 0.024 * ST.k, 0.028 * ST.k);
      c.strokeStyle = '#0b0e11'; c.lineWidth = 0.8; c.strokeRect(sX(x - 0.012), sY(top + 0.028), 0.024 * ST.k, 0.028 * ST.k);
      const ang = (vsv - 10) * D2R * 1.6;
      c.save(); c.translate(sX(x), sY(top + 0.028)); c.rotate(ang);
      c.strokeStyle = '#d6dde2'; c.lineWidth = Math.max(2, ST.k * 0.006); c.lineCap = 'round';
      c.beginPath(); c.moveTo(0, 0); c.lineTo(0.035 * ST.k, -0.012 * ST.k); c.stroke(); c.restore();
    }
    const y0 = casing(2.7) + 0.045;
    c.strokeStyle = '#9aa4ac'; c.lineWidth = Math.max(2, ST.k * 0.007); c.beginPath(); c.moveTo(sX(2.68), sY(y0)); c.lineTo(sX(3.0), sY(casing(3.0) + 0.045)); c.stroke();
  }
}

// Chama feita de "manchas" de luz pré-desenhadas (mais leve que gradiente a cada quadro).
const FLAME_COLS = [[[110, 130, 255], [40, 30, 200]], [[190, 100, 255], [120, 30, 210]], [[255, 250, 210], [255, 200, 60]], [[255, 236, 120], [255, 140, 20]], [[255, 170, 60], [235, 70, 20]], [[255, 110, 40], [200, 40, 20]]];
let flameSpr = null;
function flameSprites() {
  flameSpr = FLAME_COLS.map(([a, b]) => {
    const cv2 = document.createElement('canvas'); cv2.width = cv2.height = 64;
    const g2 = cv2.getContext('2d'), gr = g2.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, `rgba(${a.join(',')},.9)`); gr.addColorStop(0.45, `rgba(${b.join(',')},.5)`); gr.addColorStop(1, `rgba(${b.join(',')},0)`);
    g2.fillStyle = gr; g2.fillRect(0, 0, 64, 64); return cv2;
  });
}
let flames = [], combAir = [];
// Caminhos do ar em volta da câmara: por fora e por dentro do revestimento, com entrada pelos furos de diluição.
const CPATH = [
  { col: 'cold', pts: [[3.5, 0.352], [3.6, 0.392], [3.72, 0.425], [3.95, 0.43], [4.04, 0.418], [4.07, 0.395], [4.3, 0.4]] },
  { col: 'cold', pts: [[3.5, 0.345], [3.6, 0.385], [3.75, 0.425], [3.87, 0.426], [3.875, 0.405], [3.93, 0.37], [4.07, 0.365], [4.3, 0.37]], dil: 3.875 },
  { col: 'cold', pts: [[3.5, 0.31], [3.6, 0.285], [3.75, 0.27], [3.95, 0.27], [4.04, 0.29], [4.07, 0.322], [4.3, 0.322]] },
  { col: 'cold', pts: [[3.5, 0.315], [3.6, 0.29], [3.8, 0.272], [3.97, 0.272], [3.975, 0.292], [4.02, 0.33], [4.07, 0.345], [4.3, 0.345]], dil: 3.975 },
  { col: 'swirl', pts: [[3.5, 0.335], [3.6, 0.345], [3.67, 0.35]] },
].map((p) => { let L = 0; const seg = p.pts.map((q, i) => (i ? (L += Math.hypot(q[0] - p.pts[i - 1][0], q[1] - p.pts[i - 1][1])) : 0)); return { ...p, seg, L }; });
function pathAt(P, d) {
  for (let i = 1; i < P.pts.length; i++) if (d <= P.seg[i]) { const u = (d - P.seg[i - 1]) / (P.seg[i] - P.seg[i - 1]); return [lerp(P.pts[i - 1][0], P.pts[i][0], u), lerp(P.pts[i - 1][1], P.pts[i][1], u)]; }
  return P.pts[P.pts.length - 1];
}
function secCombustor(c, dt) {
  if (!flameSpr) flameSprites();
  const U = (0.12 + 0.3 * sp) * (slow ? 0.3 : 1), fl = 0.35 + 0.65 * sp;
  // Fundo: o ar do compressor (azul) ocupa a carcaça toda
  c.beginPath(); sPoly(c, band(3.5, 4.3, CB.inn, CB.out, 30)); c.fillStyle = 'rgba(40,80,200,.35)'; c.fill();
  c.fillStyle = 'rgba(8,14,30,.55)'; c.fill();
  // Gás quente na saída (até a turbina)
  c.beginPath(); sPoly(c, band(4.06, 4.3, CB.gasI, CB.gasO, 10));
  const hg = c.createLinearGradient(sX(4.06), 0, sX(4.3), 0); hg.addColorStop(0, `rgba(255,120,30,${0.6 * fl})`); hg.addColorStop(1, `rgba(255,90,30,${0.35 * fl})`);
  c.fillStyle = hg; c.fill();
  // Interior do revestimento (escuro) e a chama
  const liner = band(3.69, 4.065, CB.linI, CB.linO, 24);
  c.save(); c.beginPath(); sPoly(c, liner); c.fillStyle = '#0a0d24'; c.fill(); c.clip();
  c.globalCompositeOperation = 'lighter';
  const want = 170;
  while (flames.length < want) flames.push({ x: 3.7, y: 0.35 + (Math.random() - 0.5) * 0.02, vx: 0.4 + Math.random() * 0.5, vy: (Math.random() - 0.5) * 0.7, life: Math.random() });
  for (const f of flames) {
    f.life += dt * U * 2.6 * (0.7 + 0.6 * Math.random());
    f.x = lerp(3.7, 4.07, f.life);
    f.vy += (Math.random() - 0.5) * 2.2 * dt; f.vy *= 0.96;
    f.y = clamp(f.y + f.vy * dt * 0.05, CB.linI(f.x) + 0.01, CB.linO(f.x) - 0.01);
    if (f.life >= 1) { f.life = 0; f.x = 3.7; f.y = 0.35 + (Math.random() - 0.5) * 0.02; f.vy = (Math.random() - 0.5) * 0.9; }
    const u = f.life, ci = u < 0.08 ? 0 : u < 0.18 ? 1 : u < 0.45 ? 2 : u < 0.65 ? 3 : u < 0.85 ? 4 : 5;
    const size = ST.k * (0.02 + 0.042 * Math.sin(Math.min(1, u * 1.4) * Math.PI * 0.9)) * (0.6 + 0.6 * fl);
    c.globalAlpha = (u < 0.05 ? u / 0.05 : 1) * (u > 0.9 ? (1 - u) / 0.1 : 1) * (ci === 2 ? 0.13 : ci === 3 ? 0.22 : 0.3) * fl;
    c.drawImage(flameSpr[ci], sX(f.x) - size, sY(f.y) - size * 0.7, size * 2, size * 1.4);
  }
  // Turbilhão: o ar sai do swirler girando e a chama amarela gira junto
  c.globalAlpha = 0.5 * fl; c.lineCap = 'round';
  const vx = sX(3.75), vy = sY(0.35), vr = 0.04 * ST.k, rot = time * (3 + 6 * sp) * (slow ? 0.3 : 1);
  for (let arm = 0; arm < 3; arm++) {
    c.beginPath();
    for (let i = 0; i <= 24; i++) { const t2 = i / 24, r = vr * t2, a = rot + arm * 2.094 + t2 * 3.2; i ? c.lineTo(vx + r * Math.cos(a) * 1.25, vy + r * Math.sin(a) * 0.8) : c.moveTo(vx, vy); }
    c.strokeStyle = 'rgba(255,220,70,.9)'; c.lineWidth = Math.max(2, ST.k * 0.007); c.stroke();
  }
  c.restore(); c.globalAlpha = 1;
  // Carcaças externa e interna (cortadas, borda azul)
  c.beginPath(); sPoly(c, band(3.5, 4.3, CB.out, (x) => CB.out(x) + 0.03, 20)); c.fillStyle = chrome(c, 0, sY(0.48), 0, sY(0.44), pal.shell4); c.fill(); c.strokeStyle = pal.cut; c.lineWidth = 2; c.stroke();
  c.beginPath(); sPoly(c, band(3.5, 4.3, (x) => CB.inn(x) - 0.03, CB.inn, 20)); c.fillStyle = chrome(c, 0, sY(0.26), 0, sY(0.22), pal.shell4); c.fill(); c.strokeStyle = pal.cut; c.lineWidth = 2; c.stroke();
  // Paredes do revestimento com furinhos de resfriamento e furos de diluição
  for (const fn of [CB.linO, CB.linI]) {
    c.beginPath(); for (let i = 0; i <= 30; i++) { const x = lerp(3.69, 4.065, i / 30); i ? c.lineTo(sX(x), sY(fn(x))) : c.moveTo(sX(x), sY(fn(x))); }
    c.strokeStyle = '#c9d0d5'; c.lineWidth = Math.max(3, ST.k * 0.007); c.stroke();
    c.strokeStyle = pal.cut; c.lineWidth = 1; c.stroke();
    c.fillStyle = '#20262c';
    for (let x = 3.72; x < 4.05; x += 0.016) { c.beginPath(); c.arc(sX(x), sY(fn(x)), Math.max(0.8, ST.k * 0.0016), 0, 7); c.fill(); }
  }
  for (const [x, fn] of [[3.875, CB.linO], [3.975, CB.linI]]) { c.fillStyle = '#0a0d24'; c.beginPath(); c.ellipse(sX(x), sY(fn(x)), ST.k * 0.009, ST.k * 0.006, 0, 0, 7); c.fill(); c.strokeStyle = pal.cut; c.lineWidth = 1; c.stroke(); }
  // Domo (capuz) na frente do revestimento
  c.strokeStyle = '#c9d0d5'; c.lineWidth = Math.max(3, ST.k * 0.007);
  c.beginPath(); c.moveTo(sX(3.69), sY(0.396)); c.quadraticCurveTo(sX(3.64), sY(0.392), sX(3.645), sY(0.372)); c.stroke();
  c.beginPath(); c.moveTo(sX(3.69), sY(0.302)); c.quadraticCurveTo(sX(3.64), sY(0.306), sX(3.645), sY(0.328)); c.stroke();
  // Ar do compressor: passa por fora e por dentro do revestimento, entra pelos furos e pelo turbilhonador
  c.lineCap = 'round';
  while (combAir.length < 240) combAir.push({ p: (Math.random() * CPATH.length) | 0, d: Math.random() * 0.9 });
  for (const a of combAir) {
    const P = CPATH[a.p]; a.d += U * dt * 0.9;
    if (a.d > P.L) { a.d = 0; a.p = (Math.random() * CPATH.length) | 0; }
    const [x, y] = pathAt(P, a.d), [x0, y0] = pathAt(P, Math.max(0, a.d - 0.04));
    const hot = x > 4.07 || (P.dil && x > P.dil + 0.01);
    // Azul = ar do compressor (bem mais frio que a chama); laranja = depois de misturar com o gás quente
    c.strokeStyle = hot ? pal.lut[16] : P.col === 'swirl' ? pal.lut[3] : pal.lut[1];
    c.globalAlpha = 0.9; c.lineWidth = clamp(ST.k * 0.0035, 1.2, 2.6);
    c.beginPath(); c.moveTo(sX(x0), sY(y0)); c.lineTo(sX(x), sY(y)); c.stroke();
  }
  c.globalAlpha = 1;
  // Injetor: flange fora da carcaça, haste dobrada e o turbilhonador com as fendas
  c.fillStyle = chrome(c, sX(3.565), 0, sX(3.635), 0, pal.shaftLp); c.strokeStyle = '#0b0e11'; c.lineWidth = 1;
  c.fillRect(sX(3.565), sY(0.495), 0.07 * ST.k, 0.016 * ST.k); c.strokeRect(sX(3.565), sY(0.495), 0.07 * ST.k, 0.016 * ST.k);
  c.beginPath(); c.moveTo(sX(3.6), sY(0.48)); c.lineTo(sX(3.6), sY(0.385)); c.quadraticCurveTo(sX(3.6), sY(0.35), sX(3.64), sY(0.35));
  c.strokeStyle = '#0b0e11'; c.lineWidth = 0.024 * ST.k + 2; c.stroke();
  c.strokeStyle = chrome(c, sX(3.588), 0, sX(3.612), 0, pal.shaftLp); c.lineWidth = 0.024 * ST.k; c.stroke();
  c.fillStyle = chrome(c, 0, sY(0.37), 0, sY(0.33), pal.shell4); c.strokeStyle = '#0b0e11'; c.lineWidth = 1;
  c.fillRect(sX(3.64), sY(0.369), 0.05 * ST.k, 0.038 * ST.k); c.strokeRect(sX(3.64), sY(0.369), 0.05 * ST.k, 0.038 * ST.k);
  c.strokeStyle = 'rgba(20,24,28,.8)'; c.lineWidth = 1;
  for (let i = 1; i < 9; i++) { const x = 3.64 + i * 0.0055; c.beginPath(); c.moveTo(sX(x), sY(0.367)); c.lineTo(sX(x + 0.003), sY(0.333)); c.stroke(); }
  // Spray de combustível saindo do bico
  c.strokeStyle = 'rgba(255,220,120,.7)';
  for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(sX(3.692), sY(0.35)); c.lineTo(sX(3.72), sY(0.35 + i * 0.006 + Math.sin(time * 30 + i) * 0.002)); c.stroke(); }
  // Vela de ignição
  c.fillStyle = chrome(c, sX(3.852), 0, sX(3.868), 0, pal.shaftLp); c.fillRect(sX(3.852), sY(0.5), 0.016 * ST.k, (0.5 - 0.416) * ST.k);
  c.strokeStyle = '#0b0e11'; c.strokeRect(sX(3.852), sY(0.5), 0.016 * ST.k, (0.5 - 0.416) * ST.k);
  // Palhetas guia da turbina (vermelhas) e a primeira fileira de pás da turbina de alta (girando)
  const ngv = { x: 4.075, c: 0.06, n: 24, st: 50, kind: 's', hub: CB.gasI, tip: CB.gasO };
  const hpt = { x: 4.16, c: 0.055, n: 30, st: -55, kind: 'r', sp: 'hp', hot: 1, hub: CB.gasI, tip: CB.gasO };
  c.save(); c.beginPath(); sPoly(c, band(4.07, 4.3, CB.gasI, CB.gasO, 6)); c.clip();
  secRow(c, ngv, 0, -1, 0, [230, 80, 70]); secRow(c, ngv, 0, 1, 0, [230, 80, 70]);
  secRow(c, hpt, phHP, -1); secRow(c, hpt, phHP, 1);
  c.restore();
}
function secPins(c, S) {
  c.font = `600 11px ${css('--mono') || 'monospace'}`;
  const list = S.pins.map(([nome, x, y], i) => ({ n: i + 1, nome, ax: sX(x), ay: sY(y) })).sort((a, b) => a.ax - b.ax);
  let pos = 4; list.forEach((it) => { it.x = Math.max(it.ax - 10, pos); pos = it.x + 24; });
  let lim = SW - 4; for (let i = list.length - 1; i >= 0; i--) { list[i].x = Math.min(list[i].x, lim - 20); lim = list[i].x - 4; }
  for (const it of list) {
    const bx = it.x + 10, by = 16;
    c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 1; c.beginPath(); c.moveTo(bx, by + 9); c.lineTo(it.ax, it.ay); c.stroke();
    c.fillStyle = '#ffffff'; c.beginPath(); c.arc(it.ax, it.ay, 3.2, 0, 7); c.fill(); c.strokeStyle = '#11161b'; c.lineWidth = 1.2; c.stroke();
    c.beginPath(); c.arc(bx, by, 9.5, 0, 7); c.fillStyle = pal.hl; c.fill(); c.strokeStyle = pal.panel; c.stroke();
    c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(it.n, bx, by + 0.5);
  }
}
function secPressure(c, S) {
  // Faixa de baixo: como a pressão e a temperatura sobem ao longo da seção
  const y = SH - 12, x0 = sX(S.x0) + 6, x1 = sX(S.x1) - 6, q = tScale(), pq = 0.08 + 0.92 * Math.pow(sp, 1.6);
  const P = (v) => 1 + (v - 1) * pq, T = (v) => 15 + (v - 15) * q;
  const g = c.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, rampColor(T(S.temp[0]))); g.addColorStop(1, rampColor(T(S.temp[1])));
  c.fillStyle = g; c.fillRect(x0, y - 3, x1 - x0, 6);
  c.font = `600 11px ${css('--mono') || 'monospace'}`; c.fillStyle = pal.ink; c.textBaseline = 'middle';
  const fmtP = (v) => nf(v, v < 10 ? 1 : 0);
  c.textAlign = 'left'; c.fillText(`${fmtP(P(S.pres[0]))} atm · ${nf(Math.round(T(S.temp[0]) / 5) * 5)} °C`, x0, y - 13);
  c.textAlign = 'right'; c.fillText(`${fmtP(P(S.pres[1]))} atm · ${nf(Math.round(T(S.temp[1]) / 5) * 5)} °C`, x1, y - 13);
}
function drawSection(dt) {
  if (!sctx) return;
  const c = sctx, S = SECS[sec];
  ST.k = Math.min((SW - 24) / (S.x1 - S.x0), (SH - SMT - SMB) / (S.y1 - S.y0));
  ST.ox = SW / 2 - ST.k * (S.x0 + S.x1) / 2; ST.oy = SMT + (SH - SMT - SMB) / 2 + ST.k * (S.y0 + S.y1) / 2;
  c.fillStyle = pal.dark ? '#0b1117' : '#1a2128'; c.fillRect(0, 0, SW, SH);
  c.save(); c.beginPath(); c.rect(0, SMT - 4, SW, SH - SMT - SMB + 8); c.clip();
  if (sec === 'comb') secCombustor(c, dt); else secCompressor(c, sec, dt);
  c.restore();
  secPins(c, S);
  c.fillStyle = '#e9eef2'; secPressureDark(c, S);
  secCallA = Math.min(1, secCallA + dt * 2);
  if (S.callout && SW >= 560) drawCallout(c, 10, -(SH - SMB - 6), S.callout, secCallA, SW * 0.62);
}
function secPressureDark(c, S) { const ink = pal.ink; pal.ink = '#e9eef2'; secPressure(c, S); pal.ink = ink; }
// A altura do canvas acompanha a seção, para o desenho ocupar a largura toda sem sobrar faixa vazia.
function sizeSec() {
  scv = $('#engSec');
  if (!scv) return;
  const S = SECS[sec];
  SW = scv.clientWidth || 600;
  SH = Math.round(clamp((SW - 24) / (S.x1 - S.x0) * (S.y1 - S.y0) + SMT + SMB, 260, 470));
  scv.width = SW * dpr; scv.height = SH * dpr; scv.style.height = SH + 'px';
  sctx = scv.getContext('2d'); sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
function setSec(id) {
  if (!SECS[id] || !scv) return;
  if (sec !== id) secCallA = 0;
  sec = id;
  if (W) sizeSec();
  const S = SECS[id];
  document.querySelectorAll('#secSeg [data-sec]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.sec === id)));
  $('#secTitle').textContent = S.t;
  $('#secText').textContent = S.txt;
  $('#secFacts').innerHTML = S.facts.map(([a, b]) => `<div><span class="label">${a}</span><b>${b}</b></div>`).join('');
  $('#secList').innerHTML = S.pins.map(([n]) => `<li>${n}</li>`).join('');
  const note = $('#secNote'); if (note) { note.hidden = !S.callout; note.innerHTML = S.callout ? `<b>${S.callout[0]}</b> ${S.callout[1]}` : ''; }
}

/* ---------- Interface ---------- */
function updateUI() {
  const N1 = n1(), N2 = n2(), E = egt(), T = 296 * (0.05 + 0.95 * Math.pow(sp, 1.5));
  $('#engN1').textContent = nf(N1, 1) + ' %';
  $('#engN2').textContent = nf(N2, 1) + ' %';
  $('#engEgt').textContent = nf(Math.round(E)) + ' °C';
  $('#engThrust').textContent = nf(Math.round(T)) + ' kN';
  $('#engLbf').textContent = nf(Math.round(T * 224.8 / 100) * 100) + ' lbf';
  $('#engFlow').textContent = '≈ ' + nf(Math.round(1100 * (0.22 + 0.78 * sp) / 10) * 10) + ' kg/s';
  const q = tScale(), pq = 0.08 + 0.92 * Math.pow(sp, 1.6);
  $('#engSta').innerHTML = STA.map(([nome, tc, pa, st]) => {
    const T0 = tc === 'egt' ? E : 15 + (tc - 15) * q, P0 = 1 + (pa - 1) * pq;
    return `<div class="${st === step ? 'is-on' : ''}"><i style="background:${rampColor(Math.min(1950, T0))}"></i><span>${nome}</span><b>${nf(Math.round(T0 / 5) * 5)} °C</b><b>${nf(P0, P0 < 10 ? 1 : 0)} atm</b></div>`;
  }).join('');
}
function showStep(i, keepSel) {
  step = (i + STEPS.length) % STEPS.length;
  if (!keepSel) sel = null;
  const s = STEPS[step];
  $('#engCount').textContent = `${step + 1} / ${STEPS.length}`;
  $('#engTitle').textContent = sel ? PARTS[sel].nome : s.t;
  $('#engText').textContent = s.txt;
  $('#engFacts').innerHTML = s.facts.map(([a, b]) => `<div><span class="label">${a}</span><b>${b}</b></div>`).join('');
  const note = $('#engNote'), co = CALLOUTS[step];
  if (note) { note.hidden = !co; note.innerHTML = co ? `<b>${co[0]}</b> ${co[1]}` : ''; }
  $('#engDots').innerHTML = STEPS.map((_, j) => `<i class="${j === step ? 'on' : ''}"></i>`).join('');
  document.querySelectorAll('#engParts [data-epart], #engGallery [data-epart]').forEach((b) => {
    const id = b.dataset.epart;
    b.setAttribute('aria-pressed', String(sel ? id === sel : s.parts.includes(id)));
  });
  const sid = { 4: 'lpc', 5: 'hpc', 6: 'comb', 7: 'turb', 8: 'turb' }[step];
  if (sid && sid !== sec) setSec(sid);
  uiT = 0;
}
function pickPart(id) {
  sel = id;
  showStep(PART_STEP[id], true);
}
function hit(e) {
  const r = cv.getBoundingClientRect(), x = (e.clientX - r.left - ox) / k, y = Math.abs((cy - (e.clientY - r.top)) / k);
  const below = e.clientY - r.top > cy;
  for (const id of HIT) {
    if (PARTS[id].only === -1 && !below) continue;
    for (const p of PARTS[id].polys) {
      let inside = false;
      for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
        if ((p[i][1] > y) !== (p[j][1] > y) && x < (p[j][0] - p[i][0]) * (y - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0]) inside = !inside;
      }
      if (inside) return id;
    }
  }
  return null;
}
function size() {
  if (!cv) return;
  const w = cv.clientWidth || 700, h = Math.round(clamp(w * 0.56, 300, 520));
  dpr = Math.min(2, window.devicePixelRatio || 1); // mais que 2x pesa muito no celular sem ganho visível
  cv.width = w * dpr; cv.height = h * dpr; cv.style.height = h + 'px';
  ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  W = w; H = h;
  readPal();
  sizeGallery();
  fcv = $('#engFan');
  if (fcv) {
    FW = fcv.clientWidth || 320; FH = Math.round(clamp(FW * 0.8, 260, 420));
    fcv.width = FW * dpr; fcv.height = FH * dpr; fcv.style.height = FH + 'px';
    fctx = fcv.getContext('2d'); fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  sizeSec();
}
function start() {
  size();
  if (!raf) { last = 0; raf = requestAnimationFrame(frame); }
}
function init(opts) {
  cv = $('#engCv');
  if (!cv) return;
  active = opts.active;
  makeParts();
  buildGallery();
  $('#engParts').innerHTML = Object.entries(PARTS).map(([id, p]) => `<button type="button" class="chip" data-epart="${id}" aria-pressed="false"><b>${p.n}</b> ${p.nome}</button>`).join('');
  $('#engParts').addEventListener('click', (e) => { const b = e.target.closest('[data-epart]'); if (b) pickPart(b.dataset.epart); });
  $('#engPrev').addEventListener('click', () => showStep(step - 1));
  $('#engNext').addEventListener('click', () => showStep(step + 1));
  const thr = $('#engThr'), out = $('#engThrO');
  const setThr = () => { lever = thr.value / 100; out.textContent = lever < 0.02 ? 'IDLE' : lever > 0.98 ? 'TOGA' : Math.round(lever * 100) + '%'; };
  thr.addEventListener('input', setThr); setThr(); sp = lever;
  $('#engSlow').addEventListener('change', (e) => { slow = e.target.checked; });
  $('#engAir').addEventListener('change', (e) => { showAir = e.target.checked; });
  $('#engExplode')?.addEventListener('change', (e) => { exT = e.target.checked ? 1 : 0; });
  cv.addEventListener('click', (e) => {
    if (ex > 0.05) return;
    const id = hit(e);
    if (id) pickPart(id); else if (sel) showStep(step);
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => readPal());
  scv = $('#engSec');
  $('#secSeg')?.addEventListener('click', (e) => { const b = e.target.closest('[data-sec]'); if (b) setSec(b.dataset.sec); });
  setSec('lpc');
  // Só desenha o que está na tela (poupa bateria e deixa a animação mais leve).
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((en) => { vis[en.target.dataset.vis] = en.isIntersecting; }));
    [['#engCv', 'main'], ['#engFan', 'fan'], ['#engSec', 'sec']].forEach(([s, key]) => { const el = $(s); if (el) { el.dataset.vis = key; io.observe(el); } });
  } else { vis.fan = vis.sec = true; }
  showStep(0);
}

window.Motor747 = { init, start, size, refresh: () => pal && readPal() };
})();
