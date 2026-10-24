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
const caseAt = (x) => (x < -0.05 ? 1.40 : caseIn(x));
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
    txt: 'O ar do núcleo passa primeiro pelo booster: 4 estágios presos no mesmo eixo do fan. Cada estágio tem uma fileira de pás que giram (rotor, as blades) e logo atrás uma fileira de palhetas fixas (estator, as vanes). O rotor acelera o ar e o estator freia esse ar, transformando a velocidade em pressão. Logo depois ficam as válvulas de sangria variável (VBV): em baixa rotação elas abrem e jogam parte do ar no duto do fan, para o compressor não engasgar. Mexa na manete e veja as portinhas abrindo e fechando.',
    facts: [['Estágios', '4'], ['1 estágio', 'Rotor + estator'], ['Eixo', 'N1 (baixa)'], ['VBV', 'Abertas em baixa rotação']] },
  { t: 'Compressor de alta (HPC)', cam: [2.2, 3.9, 0.6], parts: ['hpc'],
    txt: 'São 10 estágios, cada um menor que o anterior, porque o ar ocupa menos espaço quanto mais apertado. O HPC comprime o ar cerca de 23 vezes, e ele sai a mais de 600 °C só por ter sido comprimido. As primeiras fileiras de estator mudam de ângulo (VSV) para o compressor não estolar em baixa rotação. Daqui também sai o ar sangrado (bleed) para pressurizar a cabine e o antigelo.',
    facts: [['Estágios', '10'], ['Compressão', 'cerca de 23 vezes'], ['Eixo', 'N2 (alta)'], ['Bleed', 'Cabine e antigelo']] },
  { t: 'Câmara de combustão', cam: [3.25, 4.65, 0.6], parts: ['comb', 'fuel'],
    txt: 'Na câmara anular TAPS, os injetores soltam o combustível dentro de ar que já entra girando, numa mistura pobre que queima mais limpa e solta menos poluentes (NOx). A chama chega perto de 2.000 °C. Parte do ar do compressor não entra na chama: passa em volta das paredes e as resfria. Na partida, as velas de ignição acendem a mistura.',
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
let gT = 0, step = 0, sel = null, phLP = 0, phHP = 0, time = 0, uiT = 0;
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
    lp: dark ? [150, 178, 220] : [143, 165, 198], hp: dark ? [222, 160, 192] : [198, 152, 176], st: dark ? [120, 132, 142] : [112, 121, 130],
    hot: dark ? [214, 166, 110] : [184, 134, 80], fan: dark ? [120, 132, 144] : [96, 108, 120],
    metal: dark ? ['#7d8993', '#3b4650'] : ['#f6f8f9', '#b4bcc3'], hollow: dark ? '#0f171e' : '#dde3e6',
    bypassBg: dark ? 'rgba(70,120,200,.20)' : 'rgba(79,143,224,.22)', coreBg: dark ? '#1f2a33' : '#bec6cc',
    ramp: dark
      ? [[15, '#5b95ec'], [60, '#62bdf0'], [150, '#5fd6c6'], [400, '#d9d24c'], [700, '#f3a83c'], [1100, '#f06b2e'], [1500, '#ec3b33'], [1950, '#fff0b0']]
      : [[15, '#2456a6'], [60, '#2a83c4'], [150, '#16958a'], [400, '#a8900c'], [700, '#d77814'], [1100, '#d24a1c'], [1500, '#c0221f'], [1950, '#ff7b00']],
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
  if (p.s === 'o') return (x < -0.05 ? 1.40 : x <= FAN_NOZ ? nacOut(x) : 1.27 - 0.02 * (x - FAN_NOZ)) + 0.1 + p.F * 0.6;
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
  mk('b', 380); mk('c', 260); mk('o', 70);
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

// Pás vistas de lado: cada pá está num ângulo φ em volta do eixo. Desenhamos a metade de trás do disco (a da frente foi "cortada").
function drawRow(rw) {
  const ph = rw.kind === 's' ? 0.37 : rw.sp === 'hp' ? phHP : phLP;
  const xc = rw.x + (rw.c || 0.25) / 2, rh = rw.hub(xc), rt = rw.tip(xc);
  const base = rw.fan ? pal.fan : rw.kind === 's' ? pal.st : rw.hot ? pal.hot : rw.sp === 'hp' ? pal.hp : pal.lp;
  const st = rw.fan ? null : rw.st * Math.PI / 180, cs = st == null ? 0 : Math.cos(st), sn = st == null ? 0 : Math.sin(st);
  const list = [];
  for (let j = 0; j < rw.n; j++) {
    const a = ph * (rw.fan ? 1 : 1) + j * 2 * Math.PI / rw.n, s = Math.sin(a);
    if (s < 0) list.push([a, s]);
  }
  list.sort((p, q) => p[1] - q[1]);
  for (const [a, s] of list) {
    const ca = Math.cos(a), le = [], te = [];
    if (rw.fan) {
      // Pá do fan: corda maior e mais torcida na ponta.
      for (let u = 0; u <= 1.001; u += 0.25) {
        const r = lerp(rh, rt, u), c = lerp(0.17, 0.30, u), b = lerp(25, 64, u) * Math.PI / 180, xl = rw.x + lerp(0.03, -0.02, u * u);
        le.push([xl, r * ca]); te.push([xl + c * Math.cos(b), r * ca - c * Math.sin(b) * s]);
      }
    } else {
      for (const r of [rh, rt]) { le.push([rw.x, r * ca]); te.push([rw.x + rw.c * cs, r * ca - rw.c * sn * s]); }
    }
    const f = 0.62 + 0.38 * -s;
    ctx.beginPath();
    const pts = le.concat(te.reverse());
    ctx.moveTo(SX(pts[0][0]), SY(pts[0][1]));
    for (let i = 1; i < pts.length; i++) ctx.lineTo(SX(pts[i][0]), SY(pts[i][1]));
    ctx.closePath();
    ctx.fillStyle = rgb(base, pal.dark ? f : 0.7 + 0.3 * f);
    ctx.fill();
    if (rw.fan || k > 140) { ctx.strokeStyle = rgb(base, pal.dark ? 1.35 : 0.6, 0.9); ctx.lineWidth = rw.fan ? 1 : 0.6; ctx.stroke(); }
    if (rw.fan) { // borda de ataque metálica
      ctx.beginPath(); ctx.moveTo(SX(le[0][0]), SY(le[0][1]));
      for (let i = 1; i < 5; i++) ctx.lineTo(SX(pts[i][0]), SY(pts[i][1]));
      ctx.strokeStyle = pal.dark ? '#c9d3da' : '#9aa6ae'; ctx.lineWidth = 1.4; ctx.stroke();
    }
  }
}
// Discos que prendem cada fileira de pás ao seu eixo (no corte).
function drawDisks() {
  for (const rw of ROWS) {
    if (rw.kind !== 'r') continue;
    const c = rw.fan ? 0.24 : rw.c, xc = rw.x + c / 2, rh = rw.hub(xc) - 0.004, rb = SHAFT[rw.sp] + 0.004;
    const w = rw.fan ? 0.2 : c * 0.8, web = rw.fan ? 0.03 : 0.006, wb = rw.fan ? 0.09 : Math.max(0.03, c * 0.7);
    const pts = [[xc - w / 2, rh], [xc + w / 2, rh], [xc + web, rh - 0.03], [xc + web, rb + 0.035], [xc + wb / 2, rb + 0.012], [xc + wb / 2, rb], [xc - wb / 2, rb], [xc - wb / 2, rb + 0.012], [xc - web, rb + 0.035], [xc - web, rh - 0.03]];
    fillBand(pts, rgb(rw.hot ? pal.hot : pal[rw.sp], pal.dark ? 0.75 : 1, 0.85), null);
  }
  // Eixos
  fillBand(band(0.95, 5.65, K(0), K(SHAFT.lp)), rgb(pal.lp, pal.dark ? 0.85 : 1), pal.ink, 0.6);
  fillBand(band(2.62, 4.42, K(0.12), K(SHAFT.hp)), rgb(pal.hp, pal.dark ? 0.85 : 1), pal.ink, 0.6);
}
function drawCombustor() {
  const fl = 0.35 + 0.65 * sp;
  const liner = (r0, r1) => lin([[3.67, r0], [3.8, r1], [4.06, (r0 + r1) / 2 + (r1 > r0 ? 0 : 0)]]);
  ctx.strokeStyle = pal.dark ? '#a9b4bc' : '#6c7880'; ctx.lineWidth = Math.max(1.2, k * 0.008);
  for (const s of [1, -1]) {
    ctx.beginPath(); // parede externa e interna da câmara
    ctx.moveTo(SX(3.67), SY(0.392 * s)); ctx.quadraticCurveTo(SX(3.85), SY(0.41 * s), SX(4.06), SY(0.395 * s));
    ctx.moveTo(SX(3.67), SY(0.29 * s)); ctx.quadraticCurveTo(SX(3.85), SY(0.272 * s), SX(4.06), SY(0.318 * s));
    ctx.moveTo(SX(3.67), SY(0.392 * s)); ctx.lineTo(SX(3.67), SY(0.362 * s)); // domo
    ctx.moveTo(SX(3.67), SY(0.318 * s)); ctx.lineTo(SX(3.67), SY(0.29 * s));
    ctx.stroke();
    // Chama
    const fx = SX(3.82 + Math.sin(time * 23) * 0.006), fy = SY(0.34 * s), rr = k * (0.07 + 0.03 * fl) * (1 + Math.sin(time * 31 + s) * 0.06);
    const g = ctx.createRadialGradient(fx, fy, 0, fx, fy, rr * 1.6);
    g.addColorStop(0, `rgba(255,240,180,${0.85 * fl})`); g.addColorStop(0.35, `rgba(255,150,40,${0.6 * fl})`); g.addColorStop(1, 'rgba(255,80,20,0)');
    ctx.save(); ctx.translate(fx, fy); ctx.scale(1.7, 0.55); ctx.translate(-fx, -fy);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(fx, fy, rr * 1.6, 0, 7); ctx.fill(); ctx.restore();
    // Injetor: haste que atravessa a carcaça e bico na frente do domo
    ctx.beginPath(); ctx.moveTo(SX(3.6), SY(0.47 * s)); ctx.lineTo(SX(3.63), SY(0.345 * s)); ctx.lineTo(SX(3.668), SY(0.34 * s));
    ctx.strokeStyle = pal.dark ? '#d8c27a' : '#8a6d1c'; ctx.lineWidth = Math.max(2, k * 0.016); ctx.stroke();
    ctx.strokeStyle = pal.dark ? '#a9b4bc' : '#6c7880'; ctx.lineWidth = Math.max(1.2, k * 0.008);
  }
  void liner;
}
// Preenchimento metálico: claro na superfície de fora, mais escuro para dentro (cada metade separada).
function metalBand(pts, rOut, rIn, stroke = pal.ink, lw = 1.2) {
  for (const s of [1, -1]) {
    const g = ctx.createLinearGradient(0, SY(rOut * s), 0, SY(rIn * s));
    g.addColorStop(0, pal.metal[0]); g.addColorStop(1, pal.metal[1]);
    ctx.beginPath(); poly(pts, s); ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke();
  }
}
function drawShellsMetal() {
  // Nacele em corte: boca maciça, carcaça do fan e a pele do capô, com o vão por dentro (onde ficam tubos e a caixa de acessórios).
  fillBand(band(0.7, FAN_NOZ, caseIn, nacOut, 30), pal.hollow);
  metalBand(band(-0.05, 0.75, caseIn, nacOut, 20), 1.6, 1.34);
  metalBand(band(0.72, FAN_NOZ, (x) => nacOut(x) - 0.03, nacOut, 30), 1.62, 1.5);
  metalBand(band(0.72, FAN_NOZ, caseIn, (x) => caseIn(x) + (x < 1.55 ? 0.12 : 0.035), 40), 1.47, 1.3);
  // Tubos (combustível, óleo, ar) no vão de cima
  ctx.strokeStyle = pal.dark ? '#8d99a3' : '#7d8890'; ctx.lineWidth = Math.max(1, k * 0.012);
  for (const [o, a] of [[0.035, 0], [0.065, 0.4]]) {
    ctx.beginPath();
    for (let i = 0; i <= 30; i++) { const x = lerp(1.6, 3.2, i / 30), r = caseIn(x) + 0.035 + o + Math.sin(i * 0.9 + a) * 0.004; i ? ctx.lineTo(SX(x), SY(r)) : ctx.moveTo(SX(x), SY(r)); }
    ctx.stroke();
  }
  drawAgb();
  metalBand(band(SPLIT, CORE_NOZ, outC, cowl, 50), 0.8, 0.42);
  drawVbv();
  // Cone do fan com a espiral pintada
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
  metalBand(band(CORE_NOZ, 6.7, K(0), inC, 16), 0.31, 0);
  metalBand(band(5.48, CORE_NOZ, (x) => inC(x) - 0.03, inC, 6), 0.34, 0.3, pal.ink, 0.8);
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
function drawBearings() {
  for (const [x, sp0] of BRG) {
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
  const buckets = Array.from({ length: 25 }, () => []);
  for (const p of parts) {
    const v = U * velOf(p, p.x);
    p.x += v * dt;
    if (p.s === 'c' && p.x < SPLIT) { /* o ar do núcleo segue a mesma faixa até o divisor */ }
    if (p.x > X1) { p.x = X0 + Math.random() * 0.3; p.side = Math.random() < 0.5 ? 1 : -1; }
    if (!showAir) continue;
    const L = clamp(0.035 * v + 0.01, 0.015, 0.12), xa = p.x - L;
    const sx = SX(p.x);
    if (sx < -20 || sx > W + 20) continue;
    const b = p.s === 'o' ? 24 : lutOf(tempOf(p, p.x));
    buckets[b].push([SX(xa), SY(pathY(p, xa) * p.side), sx, SY(pathY(p, p.x) * p.side), p.x]);
  }
  if (!showAir) return;
  ctx.lineCap = 'round';
  ctx.lineWidth = clamp(k * 0.012, 1.3, 3);
  buckets.forEach((list, i) => {
    if (!list.length) return;
    ctx.strokeStyle = i === 24 ? rgb(hexRgb(pal.dark ? '#93a2ae' : '#586572'), 1, 0.35) : pal.lut[i];
    ctx.beginPath();
    for (const [a, b, c, d, x] of list) { if (x > 7.1) continue; ctx.moveTo(a, b); ctx.lineTo(c, d); }
    ctx.stroke();
    // Os jatos vão sumindo no fim
    ctx.globalAlpha = 0.45; ctx.beginPath();
    for (const [a, b, c, d, x] of list) { if (x <= 7.1) continue; ctx.moveTo(a, b); ctx.lineTo(c, d); }
    ctx.stroke(); ctx.globalAlpha = 1;
  });
}
function highlightIds() { return sel ? [sel] : STEPS[step].parts; }
function drawHighlight() {
  const ids = highlightIds();
  if (!ids.length) return;
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, W, H);
  ids.forEach((id) => PARTS[id].polys.forEach((q) => { if (PARTS[id].only !== -1) poly(q, 1); poly(q, -1); }));
  ctx.fillStyle = pal.dark ? 'rgba(6,10,14,.55)' : 'rgba(230,236,238,.62)';
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
      ctx.fillStyle = it.hl ? pal.hl : pal.ink; ctx.beginPath(); ctx.arc(it.ax, it.ay, 2.5, 0, 7); ctx.fill();
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
// Vista de frente do fan (aparece na etapa do fan).
function drawFront() {
  if (!(step === 2 || sel === 'fan' || sel === 'spinner')) return;
  const R = Math.min(72, H * 0.27, W * 0.15), cx = W - R - 14, cyy = MT + R + 10;
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cyy, R + 6, 0, 7); ctx.fillStyle = pal.panel; ctx.fill(); ctx.strokeStyle = pal.ink; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cyy, R, 0, 7); ctx.fillStyle = pal.duct; ctx.fill(); ctx.clip();
  const hub = R * 0.29;
  for (let j = 0; j < 18; j++) {
    const a0 = -phLP + j * 2 * Math.PI / 18;
    ctx.beginPath();
    for (let i = 0; i <= 6; i++) { const u = i / 6, r = lerp(hub, R, u), a = a0 + 0.55 * u * u; i ? ctx.lineTo(cx + r * Math.cos(a), cyy + r * Math.sin(a)) : ctx.moveTo(cx + r * Math.cos(a), cyy + r * Math.sin(a)); }
    for (let i = 6; i >= 0; i--) { const u = i / 6, r = lerp(hub, R, u), a = a0 + 0.55 * u * u + lerp(0.12, 0.3, u); ctx.lineTo(cx + r * Math.cos(a), cyy + r * Math.sin(a)); }
    ctx.closePath();
    ctx.fillStyle = rgb(pal.fan, pal.dark ? 1.15 : 1); ctx.fill();
    ctx.strokeStyle = pal.dark ? '#c9d3da' : '#9aa6ae'; ctx.lineWidth = 1; ctx.stroke();
  }
  ctx.restore();
  ctx.beginPath(); ctx.arc(cx, cyy, hub, 0, 7); ctx.fillStyle = pal.dark ? '#4a5560' : '#3a434c'; ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 1.5; ctx.beginPath();
  for (let i = 0; i <= 20; i++) { const u = i / 20, a = -phLP + u * 4.2, r = hub * u; i ? ctx.lineTo(cx + r * Math.cos(a), cyy + r * Math.sin(a)) : ctx.moveTo(cx, cyy); }
  ctx.stroke();
  ctx.fillStyle = pal.ink; ctx.font = `600 10.5px ${css('--mono') || 'monospace'}`; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.fillText('DE FRENTE · 18 PÁS', cx, cyy + R + 10);
}

function frame(t) {
  if (!active()) { raf = 0; return; }
  const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t; time += dt;
  sp += clamp(lever - sp, -dt / 4, dt / 6);
  const rot = (0.25 + 1.0 * sp) * 2 * Math.PI * (slow ? 0.25 : 1) * dt;
  phLP += rot; phHP -= rot * 1.6;
  // Câmera desliza até a etapa
  const tg = STEPS[step].cam, e = 1 - Math.exp(-dt * 4);
  cam.x0 += (tg[0] - cam.x0) * e; cam.x1 += (tg[1] - cam.x1) * e; cam.r += (tg[2] - cam.r) * e;
  k = Math.min((W - 16) / (cam.x1 - cam.x0), (H - 2 * MT - 8) / (2 * cam.r));
  ox = W / 2 - k * (cam.x0 + cam.x1) / 2; cy = H / 2;

  ctx.fillStyle = pal.bg; ctx.fillRect(0, 0, W, H);
  // Linha de centro
  ctx.strokeStyle = pal.muted; ctx.globalAlpha = 0.5; ctx.setLineDash([10, 4, 2, 4]); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
  // Fundo dos dutos (o interior do motor, atrás do corte)
  fillBand(band(-0.05, SPLIT, hubIn, caseAt, 30), pal.duct);
  fillBand(band(-0.05, FAN_NOZ, (x) => (x < SPLIT ? hubIn(x) : cowl(x)), caseAt, 40), pal.bypassBg);
  fillBand(band(SPLIT, CORE_NOZ, inC, outC, 60), pal.coreBg);
  fillBand(band(3.62, 4.08, inC, outC, 12), `rgba(232,110,40,${0.18 + 0.25 * sp})`);
  // Brilho do jato quente
  const g = ctx.createLinearGradient(SX(CORE_NOZ), 0, SX(7.4), 0);
  g.addColorStop(0, `rgba(255,120,30,${0.22 * (0.3 + sp)})`); g.addColorStop(1, 'rgba(255,120,30,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.rect(SX(CORE_NOZ), SY(0.55), SX(7.4) - SX(CORE_NOZ), SY(-0.55) - SY(0.55)); ctx.fill();
  drawDisks();
  drawBearings();
  for (const rw of ROWS) {
    // Só a parte das pás que fica dentro do duto aparece (o resto está escondido atrás dos discos e da carcaça).
    const c = rw.fan ? 0.36 : rw.c, xa = rw.x - (rw.fan ? 0.06 : 0.012), xb = rw.x + c + 0.012;
    ctx.save(); ctx.beginPath(); const q = band(xa, xb, rw.hub, rw.tip, 4); poly(q, 1); poly(q, -1); ctx.clip();
    drawRow(rw); ctx.restore();
  }
  drawCombustor();
  drawAir(dt);
  drawShellsMetal();
  strokeProfile(inC, 1.15, CORE_NOZ, pal.ink, 1);
  drawHighlight();
  drawPins();
  drawFront();

  uiT -= dt;
  if (uiT <= 0) { uiT = 0.2; updateUI(); }
  if ((gT -= dt) <= 0) { gT = 1 / 24; drawGallery(); }
  raf = requestAnimationFrame(frame);
}


/* ---------- Peças separadas (galeria) ---------- */
function metalGrad(c, x0, y0, x1, y1, a = pal.metal[0], b = pal.metal[1]) { const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, b); g.addColorStop(0.45, a); g.addColorStop(1, b); return g; }
const PIECES = [
  { id: 'fan', nome: 'Pá do fan', txt: 'Fibra de carbono, borda de ataque metálica e raiz encaixada no disco.', draw(c, w, h) {
    const cx = w / 2;
    c.beginPath(); // aerofólio torcido e enflechado
    c.moveTo(cx - 6, h * 0.8); c.bezierCurveTo(cx - 14, h * 0.55, cx - 30, h * 0.3, cx - 22, h * 0.05);
    c.lineTo(cx + 18, h * 0.08); c.bezierCurveTo(cx + 16, h * 0.35, cx + 10, h * 0.6, cx + 8, h * 0.8); c.closePath();
    c.fillStyle = metalGrad(c, cx - 30, 0, cx + 20, 0, pal.dark ? '#7b8792' : '#5a6672', pal.dark ? '#3c4650' : '#2c343c'); c.fill(); c.strokeStyle = pal.ink; c.lineWidth = 1; c.stroke();
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
  $('#engDots').innerHTML = STEPS.map((_, j) => `<i class="${j === step ? 'on' : ''}"></i>`).join('');
  document.querySelectorAll('#engParts [data-epart], #engGallery [data-epart]').forEach((b) => {
    const id = b.dataset.epart;
    b.setAttribute('aria-pressed', String(sel ? id === sel : s.parts.includes(id)));
  });
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
  dpr = window.devicePixelRatio || 1;
  cv.width = w * dpr; cv.height = h * dpr; cv.style.height = h + 'px';
  ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  W = w; H = h;
  readPal();
  sizeGallery();
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
  cv.addEventListener('click', (e) => {
    const id = hit(e);
    if (id) pickPart(id); else if (sel) showStep(step);
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => readPal());
  showStep(0);
}

window.Motor747 = { init, start, size, refresh: () => pal && readPal() };
})();
