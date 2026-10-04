/* Último Dia — catálogo: itens, móveis, construções, zumbis, veículos e profissões. */
'use strict';

const TILE = 32;            // tamanho base do tile em px
const MAP_W = 150, MAP_H = 150;
const START_MIN = 8 * 60;   // o jogo começa às 08:00 do dia 1
const SAVE_KEY = 'ultimo-dia-v1';

// Tiles do terreno
const TL = { GRASS: 0, ROAD: 1, WALK: 2, DIRT: 3, WATER: 4, TREE: 5, FLOOR: 6, WALL: 7, DOOR: 8, WINDOW: 9, FIELD: 10, SAND: 11, PARK: 12, BURNT: 13, RUBBLE: 14, TILEF: 15, BUSH: 16 };
const SOLID_T = new Set([TL.WATER, TL.TREE, TL.WALL, TL.WINDOW]);
const OPAQUE_T = new Set([TL.WALL, TL.TREE]);
const FLAMMABLE_T = new Set([TL.TREE, TL.FLOOR, TL.FIELD, TL.BUSH, TL.TILEF]);

/* ---------- Itens ----------
   w = peso (kg), v = valor de troca, st = empilhável, sp = horas até ficar velho (podre em 2x)
   food: hun (fome), thi (sede), str (estresse), sick (chance de passar mal)
   wp: arma — dmg, rng (alcance em tiles), cd (s entre golpes), dur (durabilidade), kb (empurrão),
       hits (alvos por golpe), noise, ammo, mag, spread, pel (chumbos), auto, range (armas de fogo)
   tags: ferramentas que o item conta como (martelo, serra, corte, abridor, chave, fenda, pa, isqueiro) */
const ITEMS = {
  // comida
  feijao: { n: 'Feijão enlatado', i: '🥫', w: 0.5, v: 6, cat: 'comida', food: { hun: 30, thi: -4 }, can: 1 },
  sopa: { n: 'Sopa enlatada', i: '🥫', w: 0.5, v: 6, cat: 'comida', food: { hun: 24, thi: 8 }, can: 1 },
  atum: { n: 'Atum em lata', i: '🥫', w: 0.3, v: 6, cat: 'comida', food: { hun: 22, thi: -3 }, can: 1 },
  pessego: { n: 'Pêssego em calda', i: '🥫', w: 0.5, v: 7, cat: 'comida', food: { hun: 16, thi: 10, str: -5 }, can: 1 },
  biscoito: { n: 'Biscoito', i: '🍪', w: 0.2, v: 3, cat: 'comida', food: { hun: 9, thi: -3, str: -3 }, sp: 720 },
  salgadinho: { n: 'Salgadinho', i: '🍿', w: 0.15, v: 3, cat: 'comida', food: { hun: 10, thi: -6, str: -4 }, sp: 720 },
  chocolate: { n: 'Chocolate', i: '🍫', w: 0.1, v: 4, cat: 'comida', food: { hun: 8, str: -12 }, sp: 900 },
  pao: { n: 'Pão', i: '🍞', w: 0.3, v: 3, cat: 'comida', food: { hun: 16 }, sp: 72 },
  maca: { n: 'Maçã', i: '🍎', w: 0.2, v: 2, cat: 'comida', food: { hun: 9, thi: 6 }, sp: 120 },
  banana: { n: 'Banana', i: '🍌', w: 0.2, v: 2, cat: 'comida', food: { hun: 10, thi: 3 }, sp: 72 },
  leite: { n: 'Leite', i: '🥛', w: 1, v: 3, cat: 'comida', food: { hun: 10, thi: 22 }, sp: 48 },
  queijo: { n: 'Queijo', i: '🧀', w: 0.3, v: 4, cat: 'comida', food: { hun: 18, thi: -4 }, sp: 120 },
  carne: { n: 'Carne crua', i: '🥩', w: 0.5, v: 4, cat: 'comida', food: { hun: 12, sick: 0.45 }, sp: 36, cook: 'carne_assada' },
  carne_assada: { n: 'Carne assada', i: '🍖', w: 0.4, v: 6, cat: 'comida', food: { hun: 38, str: -8 }, sp: 60 },
  peixe: { n: 'Peixe cru', i: '🐟', w: 0.5, v: 3, cat: 'comida', food: { hun: 10, sick: 0.4 }, sp: 30, cook: 'peixe_assado' },
  peixe_assado: { n: 'Peixe assado', i: '🍤', w: 0.4, v: 5, cat: 'comida', food: { hun: 30, str: -5 }, sp: 48 },
  batata: { n: 'Batata', i: '🥔', w: 0.3, v: 2, cat: 'comida', food: { hun: 6, sick: 0.1 }, sp: 400, cook: 'batata_assada' },
  batata_assada: { n: 'Batata assada', i: '🥔', w: 0.3, v: 3, cat: 'comida', food: { hun: 20 }, sp: 60 },
  tomate: { n: 'Tomate', i: '🍅', w: 0.2, v: 2, cat: 'comida', food: { hun: 7, thi: 6 }, sp: 120 },
  cenoura: { n: 'Cenoura', i: '🥕', w: 0.2, v: 2, cat: 'comida', food: { hun: 8, thi: 2 }, sp: 200 },
  amora: { n: 'Frutas silvestres', i: '🫐', w: 0.1, v: 1, cat: 'comida', food: { hun: 5, thi: 3 }, sp: 48 },
  milho: { n: 'Espiga de milho', i: '🌽', w: 0.3, v: 2, cat: 'comida', food: { hun: 7 }, sp: 160, cook: 'milho_assado' },
  milho_assado: { n: 'Milho assado', i: '🌽', w: 0.3, v: 3, cat: 'comida', food: { hun: 18 }, sp: 48 },
  refri: { n: 'Refrigerante', i: '🥤', w: 0.4, v: 3, cat: 'bebida', food: { hun: 4, thi: 28, str: -3 } },
  suco: { n: 'Suco de caixinha', i: '🧃', w: 0.3, v: 3, cat: 'bebida', food: { hun: 3, thi: 22 }, sp: 900 },
  garrafa: { n: 'Garrafa d\'água', i: '💧', w: 0.15, v: 2, cat: 'bebida', water: 5 },
  cigarro: { n: 'Maço de cigarros', i: '🚬', w: 0.05, v: 4, cat: 'misc', uses: 10, smoke: 1 },

  // médicos
  bandagem: { n: 'Bandagem', i: '🩹', w: 0.05, v: 4, cat: 'medico', st: 1, med: 'bandagem' },
  trapo: { n: 'Trapos', i: '🧶', w: 0.05, v: 1, cat: 'material', st: 1, med: 'trapo' },
  desinfetante: { n: 'Desinfetante', i: '🧴', w: 0.2, v: 6, cat: 'medico', uses: 6, med: 'desinfetante' },
  analgesico: { n: 'Analgésicos', i: '💊', w: 0.05, v: 6, cat: 'medico', uses: 6, med: 'analgesico' },
  antibiotico: { n: 'Antibióticos', i: '💊', w: 0.05, v: 12, cat: 'medico', uses: 4, med: 'antibiotico' },
  calmante: { n: 'Calmantes', i: '💊', w: 0.05, v: 6, cat: 'medico', uses: 5, med: 'calmante' },
  sutura: { n: 'Kit de sutura', i: '🪡', w: 0.1, v: 10, cat: 'medico', uses: 3, med: 'sutura' },
  tala: { n: 'Tala', i: '🦴', w: 0.3, v: 5, cat: 'medico', med: 'tala' },

  // armas brancas
  faca: { n: 'Faca de caça', i: '🔪', w: 0.4, v: 12, cat: 'arma', wp: { dmg: 20, rng: 0.95, cd: 0.38, dur: 90, kb: 0.15, hits: 1, crit: 0.12 }, tags: ['corte', 'abridor'] },
  faca_cozinha: { n: 'Faca de cozinha', i: '🔪', w: 0.25, v: 6, cat: 'arma', wp: { dmg: 15, rng: 0.9, cd: 0.38, dur: 40, kb: 0.1, hits: 1, crit: 0.1 }, tags: ['corte', 'abridor'] },
  taco: { n: 'Taco de beisebol', i: '🏏', w: 1.1, v: 9, cat: 'arma', wp: { dmg: 24, rng: 1.25, cd: 0.7, dur: 70, kb: 0.7, hits: 2, down: 0.35 } },
  pe_cabra: { n: 'Pé de cabra', i: '⚒️', w: 1.6, v: 12, cat: 'arma', wp: { dmg: 26, rng: 1.15, cd: 0.7, dur: 200, kb: 0.5, hits: 2, down: 0.25 }, tags: ['alavanca'] },
  martelo: { n: 'Martelo', i: '🔨', w: 0.8, v: 9, cat: 'ferramenta', wp: { dmg: 15, rng: 0.95, cd: 0.5, dur: 120, kb: 0.3, hits: 1, down: 0.1 }, tags: ['martelo'] },
  facao: { n: 'Facão', i: '🗡️', w: 1, v: 16, cat: 'arma', wp: { dmg: 32, rng: 1.2, cd: 0.6, dur: 110, kb: 0.3, hits: 2, crit: 0.15 }, tags: ['corte', 'abridor'] },
  machado: { n: 'Machado', i: '🪓', w: 2.2, v: 20, cat: 'arma', wp: { dmg: 44, rng: 1.2, cd: 0.95, dur: 160, kb: 0.6, hits: 3, down: 0.3, crit: 0.1 }, tags: ['machado', 'corte'] },
  lanca: { n: 'Lança improvisada', i: '🦯', w: 1, v: 5, cat: 'arma', wp: { dmg: 22, rng: 1.6, cd: 0.6, dur: 35, kb: 0.2, hits: 1, crit: 0.2 } },

  // armas de fogo
  pistola: { n: 'Pistola 9mm', i: '🔫', w: 1, v: 40, cat: 'arma', wp: { gun: 1, dmg: 34, cd: 0.32, dur: 400, noise: 26, ammo: 'mun9', mag: 15, spread: 0.07, range: 16 } },
  revolver: { n: 'Revólver .38', i: '🔫', w: 1.1, v: 38, cat: 'arma', wp: { gun: 1, dmg: 46, cd: 0.55, dur: 500, noise: 28, ammo: 'mun38', mag: 6, spread: 0.06, range: 16 } },
  espingarda: { n: 'Espingarda', i: '🔫', w: 3.2, v: 55, cat: 'arma', wp: { gun: 1, dmg: 16, cd: 0.9, dur: 300, noise: 38, ammo: 'cartucho', mag: 6, spread: 0.2, pel: 7, range: 9, kb: 0.6 } },
  smg: { n: 'Submetralhadora', i: '🔫', w: 2.6, v: 70, cat: 'arma', wp: { gun: 1, dmg: 24, cd: 0.09, dur: 350, noise: 34, ammo: 'mun9', mag: 30, spread: 0.12, range: 14, auto: 1 } },
  rifle: { n: 'Rifle de caça', i: '🔫', w: 3.8, v: 65, cat: 'arma', wp: { gun: 1, dmg: 95, cd: 1.2, dur: 400, noise: 44, ammo: 'mun308', mag: 5, spread: 0.02, range: 26, pierce: 2 } },
  mun9: { n: 'Munição 9mm', i: '🟡', w: 0.012, v: 0.8, cat: 'municao', st: 1 },
  mun38: { n: 'Munição .38', i: '🟠', w: 0.014, v: 0.8, cat: 'municao', st: 1 },
  cartucho: { n: 'Cartuchos calibre 12', i: '🔴', w: 0.04, v: 1.2, cat: 'municao', st: 1 },
  mun308: { n: 'Munição .308', i: '🟤', w: 0.025, v: 1.6, cat: 'municao', st: 1 },
  molotov: { n: 'Coquetel molotov', i: '🍾', w: 0.6, v: 8, cat: 'arma', throw: 1 },

  // ferramentas
  serra: { n: 'Serrote', i: '🪚', w: 0.8, v: 10, cat: 'ferramenta', tags: ['serra'] },
  chave_fenda: { n: 'Chave de fenda', i: '🪛', w: 0.2, v: 6, cat: 'ferramenta', tags: ['fenda'] },
  chave_inglesa: { n: 'Chave inglesa', i: '🔧', w: 0.6, v: 10, cat: 'ferramenta', tags: ['chave'], wp: { dmg: 12, rng: 0.95, cd: 0.5, dur: 150, kb: 0.3, hits: 1 } },
  abridor: { n: 'Abridor de latas', i: '🥄', w: 0.1, v: 3, cat: 'ferramenta', tags: ['abridor'] },
  isqueiro: { n: 'Isqueiro', i: '🔥', w: 0.05, v: 5, cat: 'ferramenta', uses: 30, tags: ['isqueiro'] },
  fosforos: { n: 'Caixa de fósforos', i: '🔥', w: 0.05, v: 2, cat: 'ferramenta', uses: 10, tags: ['isqueiro'] },
  lanterna: { n: 'Lanterna', i: '🔦', w: 0.4, v: 10, cat: 'ferramenta', charge: 100 },
  pilhas: { n: 'Pilhas', i: '🔋', w: 0.05, v: 3, cat: 'ferramenta', st: 1 },
  pa: { n: 'Pá', i: '⛏️', w: 1.5, v: 8, cat: 'ferramenta', tags: ['pa'], wp: { dmg: 18, rng: 1.2, cd: 0.75, dur: 90, kb: 0.5, hits: 2, down: 0.2 } },
  regador: { n: 'Regador', i: '🚿', w: 0.5, v: 4, cat: 'ferramenta', water: 10 },
  vara: { n: 'Vara de pesca', i: '🎣', w: 0.6, v: 8, cat: 'ferramenta', tags: ['vara'] },
  radio: { n: 'Rádio de pilha', i: '📻', w: 0.6, v: 10, cat: 'ferramenta', charge: 100 },
  galao: { n: 'Galão de gasolina', i: '🛢️', w: 0.6, v: 8, cat: 'ferramenta', fuel: 10 },
  mangueira: { n: 'Mangueira', i: '〰️', w: 0.3, v: 4, cat: 'ferramenta', tags: ['mangueira'] },
  garrafa_vazia: { n: 'Garrafa de vidro', i: '🍾', w: 0.3, v: 1, cat: 'material' },

  // veículos
  bateria: { n: 'Bateria de carro', i: '🔋', w: 8, v: 18, cat: 'veiculo', charge: 100, part: 'bat' },
  pneu: { n: 'Pneu', i: '🛞', w: 6, v: 12, cat: 'veiculo', part: 'pneu' },
  pecas: { n: 'Peças de motor', i: '⚙️', w: 1.5, v: 14, cat: 'veiculo', st: 1 },
  chave_carro: { n: 'Chave de carro', i: '🔑', w: 0.02, v: 6, cat: 'veiculo' },

  // roupas e bolsas
  mochila: { n: 'Mochila escolar', i: '🎒', w: 0.5, v: 12, cat: 'roupa', wear: { slot: 'costas', cap: 10 } },
  mochila_grande: { n: 'Mochila de trilha', i: '🎒', w: 1, v: 25, cat: 'roupa', wear: { slot: 'costas', cap: 18 } },
  bolsa: { n: 'Bolsa de lado', i: '👜', w: 0.4, v: 8, cat: 'roupa', wear: { slot: 'lado', cap: 5 } },
  jaqueta: { n: 'Jaqueta de couro', i: '🧥', w: 1.4, v: 14, cat: 'roupa', wear: { slot: 'tronco', warm: 14, prot: 0.35 } },
  moletom: { n: 'Moletom', i: '👕', w: 0.6, v: 5, cat: 'roupa', wear: { slot: 'tronco', warm: 10, prot: 0.08 } },
  capa_chuva: { n: 'Capa de chuva', i: '🌂', w: 0.4, v: 7, cat: 'roupa', wear: { slot: 'capa', warm: 3, rain: 1 } },
  colete: { n: 'Colete policial', i: '🦺', w: 3, v: 30, cat: 'roupa', wear: { slot: 'colete', prot: 0.45, warm: 4 } },
  capacete: { n: 'Capacete de moto', i: '⛑️', w: 1.2, v: 10, cat: 'roupa', wear: { slot: 'cabeca', prot: 0.2 } },

  // materiais
  tabua: { n: 'Tábua', i: '🪵', w: 1, v: 2, cat: 'material', st: 1 },
  tronco: { n: 'Tronco', i: '🪵', w: 5, v: 3, cat: 'material', st: 1 },
  prego: { n: 'Pregos', i: '📌', w: 0.01, v: 0.15, cat: 'material', st: 1 },
  sucata: { n: 'Sucata de metal', i: '🔩', w: 0.8, v: 2, cat: 'material', st: 1 },
  corda: { n: 'Corda', i: '🪢', w: 0.4, v: 4, cat: 'material', st: 1 },
  lona: { n: 'Lona', i: '⛺', w: 1, v: 5, cat: 'material', st: 1 },
  semente_tomate: { n: 'Sementes de tomate', i: '🌱', w: 0.02, v: 2, cat: 'material', st: 1, seed: 'tomate' },
  semente_cenoura: { n: 'Sementes de cenoura', i: '🌱', w: 0.02, v: 2, cat: 'material', st: 1, seed: 'cenoura' },
  semente_batata: { n: 'Batata-semente', i: '🌱', w: 0.1, v: 2, cat: 'material', st: 1, seed: 'batata' },
  gerador: { n: 'Gerador portátil', i: '⚡', w: 22, v: 60, cat: 'material', place: 'gerador' },

  // leitura
  livro_carp: { n: 'Livro: Marcenaria', i: '📘', w: 0.5, v: 8, cat: 'leitura', book: 'carpintaria' },
  livro_mec: { n: 'Livro: Mecânica', i: '📗', w: 0.5, v: 8, cat: 'leitura', book: 'mecanica' },
  livro_med: { n: 'Livro: Primeiros socorros', i: '📕', w: 0.5, v: 8, cat: 'leitura', book: 'medicina' },
  livro_agro: { n: 'Livro: Horta em casa', i: '📙', w: 0.5, v: 8, cat: 'leitura', book: 'agricultura' },
  livro_pesca: { n: 'Livro: Pesca e caça', i: '📓', w: 0.5, v: 8, cat: 'leitura', book: 'sobrevivencia' },
  revista: { n: 'Revista', i: '📰', w: 0.2, v: 2, cat: 'leitura', read: 15 },
  hq: { n: 'Gibi', i: '📔', w: 0.1, v: 2, cat: 'leitura', read: 20 },
};
for (const [k, d] of Object.entries(ITEMS)) d.k = k;

const CAT_LBL = { comida: 'Comida', bebida: 'Bebida', medico: 'Remédios', arma: 'Armas', municao: 'Munição', ferramenta: 'Ferramentas', veiculo: 'Veículos', roupa: 'Roupas e bolsas', material: 'Materiais', leitura: 'Leitura', misc: 'Outros' };

/* ---------- Móveis e construções ----------
   cont = guarda itens (cap kg), solid = bloqueia, fridge, stove, water, bed, hp (destrutível),
   loot = tabela de saque, wood/nail/scrap = o que rende ao desmontar */
const FURN = {
  geladeira: { n: 'Geladeira', solid: 1, cont: 1, cap: 30, fridge: 1, loot: 'geladeira', col: '#dde4e8', ic: '🧊', scrap: 2 },
  armario: { n: 'Armário de cozinha', solid: 1, cont: 1, cap: 25, loot: 'cozinha', col: '#a87a52', ic: '🗄️', wood: 2, nail: 3 },
  fogao: { n: 'Fogão', solid: 1, stove: 'eletrico', col: '#c9ccd0', ic: '🍳', scrap: 2 },
  pia: { n: 'Pia', solid: 1, water: 1, cont: 1, cap: 8, loot: 'pia', col: '#b8c4cc', ic: '🚰', scrap: 1 },
  cama: { n: 'Cama', solid: 1, bed: 1.0, col: '#7f9cc4', ic: '🛏️', wood: 3, nail: 2, cloth: 2 },
  sofa: { n: 'Sofá', solid: 1, bed: 0.7, col: '#9c5d4a', ic: '🛋️', wood: 2, cloth: 2 },
  guarda_roupa: { n: 'Guarda-roupa', solid: 1, cont: 1, cap: 30, loot: 'roupas', col: '#8b5e3c', ic: '🚪', wood: 3, nail: 4 },
  estante: { n: 'Estante', solid: 1, cont: 1, cap: 20, loot: 'estante', col: '#946746', ic: '📚', wood: 2, nail: 2 },
  banheiro: { n: 'Armário do banheiro', solid: 1, cont: 1, cap: 8, loot: 'banheiro', col: '#e8edf0', ic: '🪞', wood: 1 },
  mesa: { n: 'Mesa', solid: 1, cont: 1, cap: 10, loot: 'mesa', col: '#b58a5c', ic: '🪑', wood: 2, nail: 2 },
  prateleira: { n: 'Prateleira', solid: 1, cont: 1, cap: 40, loot: 'mercado', col: '#c7b49a', ic: '🛒', scrap: 2 },
  balcao: { n: 'Balcão', solid: 1, cont: 1, cap: 20, loot: 'balcao', col: '#8e735a', ic: '🧾', wood: 2, nail: 2 },
  armario_med: { n: 'Armário de remédios', solid: 1, cont: 1, cap: 15, loot: 'hospital', col: '#f1f4f5', ic: '⚕️', scrap: 1 },
  maca: { n: 'Maca', solid: 1, bed: 0.8, col: '#d9e2e6', ic: '🛏️', scrap: 2 },
  armario_armas: { n: 'Armário de armas', solid: 1, cont: 1, cap: 30, loot: 'armas', col: '#4d555c', ic: '🔒', scrap: 3 },
  arquivo: { n: 'Arquivo', solid: 1, cont: 1, cap: 15, loot: 'escritorio', col: '#7d868c', ic: '🗃️', scrap: 2 },
  ferramentas: { n: 'Caixa de ferramentas', solid: 1, cont: 1, cap: 20, loot: 'ferramentas', col: '#c8423a', ic: '🧰', scrap: 2 },
  pecas: { n: 'Prateleira de peças', solid: 1, cont: 1, cap: 40, loot: 'pecas', col: '#6d7378', ic: '⚙️', scrap: 3 },
  caixote: { n: 'Caixote', solid: 1, cont: 1, cap: 25, loot: 'fabrica', col: '#b88b4f', ic: '📦', wood: 2, nail: 2 },
  banco_igreja: { n: 'Banco', solid: 1, col: '#7a5236', ic: '', wood: 2, nail: 2 },
  carteira: { n: 'Carteira escolar', solid: 1, cont: 1, cap: 5, loot: 'escola', col: '#c7a46d', ic: '✏️', wood: 1 },
  lixeira: { n: 'Lixeira', solid: 1, cont: 1, cap: 10, loot: 'lixo', col: '#4f6b4f', ic: '🗑️' },
  bomba: { n: 'Bomba de combustível', solid: 1, pump: 1, col: '#d64a3a', ic: '⛽' },
  feno: { n: 'Fardos de feno', solid: 1, cont: 1, cap: 20, loot: 'celeiro', col: '#d9b45a', ic: '🌾' },
  cadaver: { n: 'Corpo', solid: 0, cont: 1, cap: 20, col: '#5b4a3e', ic: '' },
  bolsa_chao: { n: 'Itens no chão', solid: 0, cont: 1, cap: 999, col: '#7d6b52', ic: '' },
  arbusto: { n: 'Arbusto de frutas', solid: 1, berry: 1, col: '#3f7a3a', ic: '🫐' },

  // construídos pelo jogador
  muro: { n: 'Muro de madeira', solid: 1, build: 1, hp: 260, opaque: 1, col: '#8a5f36', wood: 2, nail: 3 },
  muro_metal: { n: 'Muro de metal', solid: 1, build: 1, hp: 520, opaque: 1, col: '#7f878d', scrap: 4 },
  cerca: { n: 'Cerca', solid: 1, build: 1, hp: 120, col: '#a07445', wood: 1, nail: 1 },
  portao: { n: 'Portão', solid: 1, build: 1, hp: 240, gate: 1, col: '#7a5230', wood: 3, nail: 4 },
  bau: { n: 'Baú', solid: 1, build: 1, cont: 1, cap: 60, hp: 120, col: '#9c6b3c', ic: '🧳', wood: 2, nail: 3 },
  cama_imp: { n: 'Cama improvisada', solid: 1, build: 1, bed: 0.85, hp: 60, col: '#8d8a6a', ic: '🛏️', wood: 2, cloth: 2 },
  fogueira: { n: 'Fogão improvisado', solid: 1, build: 1, stove: 'lenha', hp: 100, col: '#5f5a55', ic: '🔥', scrap: 2 },
  gerador: { n: 'Gerador', solid: 1, build: 1, gen: 1, hp: 150, col: '#e0b030', ic: '⚡' },
  torre: { n: 'Torre de vigia', solid: 0, build: 1, tower: 1, hp: 200, col: '#6f4b2b', ic: '🗼', wood: 4, nail: 6 },
  horta: { n: 'Canteiro', solid: 0, build: 1, garden: 1, col: '#5a3e26', ic: '' },
  coletor: { n: 'Coletor de chuva', solid: 1, build: 1, rain: 1, hp: 80, col: '#4b88c4', ic: '🪣', wood: 2 },
  bancada: { n: 'Bancada de oficina', solid: 1, build: 1, bench: 1, hp: 140, col: '#8a6a4a', ic: '🛠️', wood: 3, scrap: 2 },
};
for (const [k, d] of Object.entries(FURN)) d.k = k;

/* ---------- Tabelas de saque: [item, peso, qMin, qMax] ---------- */
const LOOT = {
  geladeira: { n: [0, 4], t: [['leite', 3], ['queijo', 3], ['carne', 3], ['maca', 2], ['banana', 2], ['pao', 2], ['refri', 3], ['suco', 2], ['tomate', 2], ['cenoura', 2], ['peixe', 1]] },
  cozinha: { n: [0, 4], t: [['feijao', 4], ['sopa', 4], ['atum', 3], ['pessego', 2], ['biscoito', 3], ['salgadinho', 2], ['abridor', 2], ['faca_cozinha', 2], ['fosforos', 2], ['garrafa', 2], ['garrafa_vazia', 2], ['chocolate', 1], ['trapo', 2, 1, 3]] },
  pia: { n: [0, 2], t: [['trapo', 3, 1, 2], ['desinfetante', 1], ['garrafa_vazia', 1]] },
  roupas: { n: [0, 3], t: [['moletom', 4], ['jaqueta', 1], ['capa_chuva', 2], ['mochila', 2], ['bolsa', 2], ['trapo', 4, 1, 4], ['capacete', 1], ['mochila_grande', 0.4]] },
  estante: { n: [0, 3], t: [['revista', 4], ['hq', 3], ['livro_carp', 1], ['livro_mec', 1], ['livro_med', 1], ['livro_agro', 1], ['livro_pesca', 1], ['radio', 1], ['lanterna', 1], ['pilhas', 1, 1, 4]] },
  banheiro: { n: [0, 3], t: [['bandagem', 3, 1, 3], ['analgesico', 3], ['desinfetante', 2], ['calmante', 1], ['antibiotico', 0.5], ['trapo', 1, 1, 2]] },
  mesa: { n: [0, 2], t: [['revista', 2], ['cigarro', 2], ['isqueiro', 1], ['chave_fenda', 1], ['pilhas', 1, 1, 2], ['chave_carro', 1.2], ['lanterna', 0.6], ['biscoito', 1]] },
  mercado: { n: [1, 5], t: [['feijao', 5], ['sopa', 4], ['atum', 4], ['pessego', 3], ['biscoito', 5], ['salgadinho', 5], ['chocolate', 3], ['refri', 5], ['suco', 3], ['garrafa', 3], ['pao', 2], ['abridor', 1], ['fosforos', 1], ['pilhas', 1, 1, 4], ['semente_tomate', 0.5, 2, 5], ['semente_cenoura', 0.5, 2, 5]] },
  balcao: { n: [0, 4], t: [['cigarro', 4], ['isqueiro', 3], ['pilhas', 2, 1, 4], ['chocolate', 2], ['lanterna', 1], ['revista', 1], ['chave_carro', 0.5], ['galao', 1]] },
  hospital: { n: [1, 4], t: [['bandagem', 5, 1, 4], ['desinfetante', 3], ['analgesico', 3], ['antibiotico', 2], ['sutura', 2], ['calmante', 2], ['tala', 2], ['livro_med', 0.5]] },
  armas: { n: [0, 4], t: [['pistola', 2], ['revolver', 1], ['espingarda', 1.5], ['smg', 0.4], ['rifle', 0.5], ['mun9', 4, 8, 30], ['mun38', 2, 6, 18], ['cartucho', 3, 4, 14], ['mun308', 1, 3, 10], ['colete', 1], ['lanterna', 1]] },
  escritorio: { n: [0, 3], t: [['revista', 2], ['chave_carro', 1.5], ['pilhas', 1, 1, 3], ['mun9', 0.5, 4, 12], ['bandagem', 1], ['chocolate', 1]] },
  ferramentas: { n: [1, 3], t: [['martelo', 3], ['serra', 3], ['chave_fenda', 3], ['chave_inglesa', 3], ['prego', 5, 10, 40], ['pe_cabra', 1], ['machado', 0.5], ['mangueira', 1], ['corda', 1, 1, 2]] },
  pecas: { n: [1, 4], t: [['bateria', 2], ['pneu', 3], ['pecas', 3, 1, 3], ['galao', 2], ['mangueira', 1], ['sucata', 2, 1, 4], ['chave_carro', 1], ['chave_inglesa', 1]] },
  fabrica: { n: [1, 4], t: [['sucata', 4, 1, 5], ['tabua', 4, 1, 4], ['prego', 4, 10, 40], ['corda', 2, 1, 2], ['lona', 2], ['pecas', 1], ['galao', 1], ['martelo', 1], ['pe_cabra', 1]] },
  escola: { n: [0, 2], t: [['hq', 3], ['revista', 1], ['chocolate', 2], ['biscoito', 2], ['suco', 2], ['mochila', 1.5], ['livro_agro', 0.5], ['livro_carp', 0.5]] },
  lixo: { n: [0, 2], t: [['garrafa_vazia', 3], ['trapo', 2, 1, 2], ['sucata', 1], ['biscoito', 0.5], ['revista', 1]] },
  celeiro: { n: [1, 4], t: [['semente_tomate', 2, 3, 8], ['semente_cenoura', 2, 3, 8], ['semente_batata', 2, 3, 8], ['pa', 2], ['regador', 2], ['machado', 1.5], ['corda', 1, 1, 2], ['galao', 1.5], ['vara', 1.5], ['espingarda', 0.4], ['cartucho', 0.8, 4, 10], ['tabua', 1, 1, 4], ['prego', 1, 10, 30]] },
  porta_malas: { n: [0, 3], t: [['galao', 2], ['pneu', 1], ['bateria', 0.4], ['mochila', 1], ['garrafa', 1], ['salgadinho', 1], ['chave_inglesa', 1], ['corda', 1], ['lona', 0.6], ['taco', 0.6]] },
  viatura: { n: [1, 3], t: [['espingarda', 1], ['cartucho', 2, 4, 12], ['mun9', 2, 6, 20], ['colete', 0.5], ['lanterna', 1], ['bandagem', 1, 1, 2]] },
  ambulancia: { n: [1, 4], t: [['bandagem', 3, 1, 4], ['desinfetante', 2], ['analgesico', 2], ['antibiotico', 1], ['sutura', 1], ['tala', 1]] },
  zumbi: { n: [0, 2], t: [['chave_carro', 1.4], ['cigarro', 1], ['isqueiro', 1], ['chocolate', 1], ['pilhas', 0.6, 1, 2], ['bandagem', 0.6], ['analgesico', 0.4], ['mun9', 0.3, 3, 8], ['faca_cozinha', 0.3], ['garrafa', 0.5]] },
};

/* ---------- Construções (modo de construção) ----------
   need = itens consumidos, tools = ferramentas exigidas, sk = habilidade mínima, t = segundos */
const RECIPES = [
  { k: 'barricada', n: 'Barricada', i: '🪵', desc: 'Prega tábuas numa porta ou janela. Até 3 camadas.', need: { tabua: 2, prego: 4 }, tools: ['martelo'], sk: ['carpintaria', 0], t: 4, on: 'abertura', noise: 12 },
  { k: 'cerca', n: 'Cerca', i: '🚧', desc: 'Atrasa os zumbis e guia o caminho.', need: { tabua: 2, prego: 2 }, tools: ['martelo'], sk: ['carpintaria', 0], t: 4, noise: 10 },
  { k: 'muro', n: 'Muro de madeira', i: '🧱', desc: 'Parede forte que bloqueia a visão.', need: { tabua: 3, prego: 6 }, tools: ['martelo'], sk: ['carpintaria', 1], t: 6, noise: 14 },
  { k: 'portao', n: 'Portão', i: '🚪', desc: 'Abre e fecha. Zumbis precisam quebrá-lo.', need: { tabua: 4, prego: 8, sucata: 1 }, tools: ['martelo'], sk: ['carpintaria', 2], t: 8, noise: 14 },
  { k: 'muro_metal', n: 'Muro de metal', i: '🛡️', desc: 'O dobro da resistência. Precisa da bancada perto.', need: { sucata: 4, prego: 4 }, tools: ['martelo'], sk: ['carpintaria', 3], t: 9, noise: 18, bench: 1 },
  { k: 'bau', n: 'Baú', i: '🧳', desc: 'Guarda até 60 kg.', need: { tabua: 3, prego: 4 }, tools: ['martelo'], sk: ['carpintaria', 0], t: 5, noise: 8 },
  { k: 'cama_imp', n: 'Cama improvisada', i: '🛏️', desc: 'Dormir no chão é ruim. Isto ajuda.', need: { tabua: 2, prego: 2, trapo: 3 }, tools: ['martelo'], sk: ['carpintaria', 0], t: 5, noise: 6 },
  { k: 'fogueira', n: 'Fogão improvisado', i: '🔥', desc: 'Cozinha e ferve água sem energia. Usa tábuas como lenha.', need: { sucata: 3, tabua: 1 }, tools: [], sk: ['carpintaria', 0], t: 5, noise: 4 },
  { k: 'horta', n: 'Canteiro', i: '🌱', desc: 'Prepare a terra para plantar sementes. Só ao ar livre.', need: {}, tools: ['pa'], sk: ['agricultura', 0], t: 5, noise: 2, outdoor: 1 },
  { k: 'coletor', n: 'Coletor de chuva', i: '🪣', desc: 'Junta água limpa quando chove. Só ao ar livre.', need: { tabua: 2, prego: 2, lona: 1 }, tools: ['martelo'], sk: ['carpintaria', 1], t: 6, noise: 8, outdoor: 1 },
  { k: 'bancada', n: 'Bancada de oficina', i: '🛠️', desc: 'Libera receitas avançadas por perto.', need: { tabua: 4, prego: 6, sucata: 2 }, tools: ['martelo', 'serra'], sk: ['carpintaria', 2], t: 8, noise: 14 },
  { k: 'torre', n: 'Torre de vigia', i: '🗼', desc: 'Lá de cima você enxerga muito mais longe. Só ao ar livre.', need: { tabua: 8, prego: 12, corda: 1 }, tools: ['martelo', 'serra'], sk: ['carpintaria', 3], t: 12, noise: 16, outdoor: 1 },
  { k: 'gerador', n: 'Instalar gerador', i: '⚡', desc: 'Liga geladeiras e luzes por perto. Faz barulho!', need: { gerador: 1 }, tools: ['chave_inglesa'], sk: ['mecanica', 1], t: 6, noise: 6 },
];

/* ---------- Receitas de criação (inventário) ---------- */
const CRAFTS = [
  { k: 'tabuas', n: 'Serrar tronco em tábuas', out: ['tabua', 4], need: { tronco: 1 }, tools: ['serra'], sk: 'carpintaria', xp: 6 },
  { k: 'lanca', n: 'Lança improvisada', out: ['lanca', 1], need: { tabua: 1 }, tools: ['corte'], sk: 'carpintaria', xp: 4 },
  { k: 'bandagem', n: 'Bandagem de trapos', out: ['bandagem', 1], need: { trapo: 2 }, tools: [], sk: 'medicina', xp: 2, needLvl: ['medicina', 1] },
  { k: 'molotov', n: 'Coquetel molotov', out: ['molotov', 1], need: { garrafa_vazia: 1, trapo: 1 }, fuel: 2, tools: [], sk: 'sobrevivencia', xp: 3 },
  { k: 'garrafa', n: 'Garrafa d\'água (vazia)', out: ['garrafa', 1], need: { garrafa_vazia: 1 }, tools: [], empty: 1 },
  { k: 'pecas', n: 'Peças de motor com sucata', out: ['pecas', 1], need: { sucata: 3 }, tools: ['chave'], sk: 'mecanica', xp: 5, bench: 1, needLvl: ['mecanica', 2] },
];

/* ---------- Habilidades ---------- */
const SKILLS = {
  combate: { n: 'Corpo a corpo', i: '🪓', d: 'Dano, crítico e menos cansaço com armas brancas.' },
  tiro: { n: 'Armas de fogo', i: '🎯', d: 'Precisão, recarga e menos dispersão.' },
  carpintaria: { n: 'Construção', i: '🔨', d: 'Libera barricadas reforçadas, muros, portões e torres.' },
  mecanica: { n: 'Mecânica', i: '🔧', d: 'Ligação direta, conserto de motor e troca de peças.' },
  medicina: { n: 'Medicina', i: '🩺', d: 'Curativos melhores, suturas e menos infecção.' },
  agricultura: { n: 'Agricultura', i: '🌱', d: 'Plantas crescem mais rápido e rendem mais.' },
  sobrevivencia: { n: 'Sobrevivência', i: '🎣', d: 'Pesca, caça, coleta e fogo.' },
  furtividade: { n: 'Furtividade', i: '👣', d: 'Menos barulho e menos chance de ser visto.' },
};
const SKILL_XP = [0, 30, 90, 200, 380, 650]; // xp para níveis 1..5

const PROFS = [
  { k: 'policial', n: 'Policial', i: '👮', d: 'Começa com pistola e um pente. Armas de fogo 2.', sk: { tiro: 2, combate: 1 }, items: [['pistola', 1, { ammo: 15 }], ['mun9', 10], ['lanterna', 1]] },
  { k: 'carpinteiro', n: 'Carpinteiro', i: '🧑‍🔧', d: 'Martelo, pregos e tábuas. Construção 2.', sk: { carpintaria: 2, combate: 1 }, items: [['martelo', 1], ['prego', 20], ['tabua', 4]] },
  { k: 'mecanico', n: 'Mecânico', i: '🔧', d: 'Chave inglesa e chave de fenda. Mecânica 2.', sk: { mecanica: 2 }, items: [['chave_inglesa', 1], ['chave_fenda', 1], ['galao', 1, { fuel: 4 }]] },
  { k: 'enfermeira', n: 'Enfermagem', i: '🧑‍⚕️', d: 'Kit de primeiros socorros. Medicina 2.', sk: { medicina: 2 }, items: [['bandagem', 3], ['desinfetante', 1], ['analgesico', 1]] },
  { k: 'agricultor', n: 'Agricultor', i: '🧑‍🌾', d: 'Pá e sementes. Agricultura 2, Sobrevivência 1.', sk: { agricultura: 2, sobrevivencia: 1 }, items: [['pa', 1], ['semente_tomate', 6], ['semente_batata', 6]] },
  { k: 'escoteiro', n: 'Ex-escoteiro', i: '🏕️', d: 'Faca, fósforos e vara de pesca. Sobrevivência 2, Furtividade 1.', sk: { sobrevivencia: 2, furtividade: 1 }, items: [['faca', 1], ['fosforos', 1], ['vara', 1]] },
  { k: 'desempregado', n: 'Desempregado', i: '🧍', d: 'Nada de especial, mas aprende 25% mais rápido.', sk: {}, items: [], learn: 1.25 },
];

/* ---------- Zumbis ---------- */
const ZT = {
  lento: { n: 'Lento', hp: 52, spd: 0.85, dmg: 1, r: 0.3, col: '#7f957a', shirt: ['#5d6b7a', '#7a5d5d', '#6b6b4f', '#4f5f6b', '#806a4e'] },
  recente: { n: 'Recém-infectado', hp: 40, spd: 1.55, dmg: 0.9, r: 0.3, col: '#b9a891', shirt: ['#3f6fa8', '#a83f4f', '#e0e0d0', '#4f8a4f'] },
  corredor: { n: 'Corredor', hp: 46, spd: 3.05, dmg: 1, r: 0.3, col: '#8b8270', shirt: ['#2f2f35', '#5a3030', '#3a4a3a'] },
  brutamontes: { n: 'Brutamontes', hp: 230, spd: 0.75, dmg: 1.8, r: 0.44, col: '#6a7d62', shirt: ['#3a3f45', '#4a3a2f'], breaker: 3 },
};

/* ---------- Veículos ---------- */
const VT = {
  carro: { n: 'Carro', col: ['#b8423a', '#3a6fb8', '#d0d2d4', '#2e3236', '#d8b23a', '#4a7d4a'], len: 2.1, wid: 1.05, spd: 9, fuel: 45, hp: 220, trunk: 30 },
  caminhonete: { n: 'Caminhonete', col: ['#6b4a2f', '#1f3d5c', '#8a8f94', '#7a1f1f'], len: 2.4, wid: 1.15, spd: 8.5, fuel: 70, hp: 320, trunk: 60 },
  moto: { n: 'Moto', col: ['#202020', '#c03030', '#3050c0'], len: 1.2, wid: 0.45, spd: 11, fuel: 14, hp: 90, trunk: 6, moto: 1 },
  caminhao: { n: 'Caminhão', col: ['#e0e0e0', '#c47a2a', '#3a5f8f'], len: 3.2, wid: 1.3, spd: 6.5, fuel: 120, hp: 520, trunk: 120 },
  trator: { n: 'Trator', col: ['#3f8f3a', '#d24a2a'], len: 1.8, wid: 1.2, spd: 4.5, fuel: 50, hp: 380, trunk: 10, strong: 1 },
  ambulancia: { n: 'Ambulância', col: ['#f2f2f2'], len: 2.6, wid: 1.2, spd: 8.5, fuel: 70, hp: 320, trunk: 40, loot: 'ambulancia', siren: 1 },
  viatura: { n: 'Viatura', col: ['#1f2a44'], len: 2.2, wid: 1.05, spd: 10, fuel: 55, hp: 260, trunk: 30, loot: 'viatura', siren: 1 },
};

/* ---------- Prédios ---------- */
const BTYPES = {
  casa: { n: 'Casa', floor: '#b79b7d', roof: ['#8a4a3a', '#6b5a4a', '#4a5a6b', '#7a6a3a'] },
  abandonada: { n: 'Casa abandonada', floor: '#8f7d68', roof: ['#4f4a44'] },
  mercado: { n: 'Mercado', floor: '#d9d6cf', roof: ['#5f6f7a'] },
  posto: { n: 'Posto de combustível', floor: '#d6d2c8', roof: ['#c0392b'] },
  hospital: { n: 'Hospital', floor: '#e6ecee', roof: ['#d0d8dc'] },
  delegacia: { n: 'Delegacia', floor: '#b9c0c6', roof: ['#2f3d55'] },
  oficina: { n: 'Oficina mecânica', floor: '#9a9a96', roof: ['#5a5a58'] },
  escola: { n: 'Escola', floor: '#d6c7a3', roof: ['#9a5a3a'] },
  igreja: { n: 'Igreja', floor: '#c9b89a', roof: ['#6a4a6a'] },
  fabrica: { n: 'Fábrica', floor: '#8f918d', roof: ['#5f6a5f'] },
  fazenda: { n: 'Casa da fazenda', floor: '#b08a62', roof: ['#9a3a2a'] },
  celeiro: { n: 'Celeiro', floor: '#9b7a55', roof: ['#a8322a'] },
};

/* ---------- Plantas da horta (horas para colher) ---------- */
const PLANTS = {
  tomate: { n: 'Tomate', h: 72, out: 'tomate', q: [3, 6], col: '#d9453a' },
  cenoura: { n: 'Cenoura', h: 60, out: 'cenoura', q: [3, 6], col: '#e88a2a' },
  batata: { n: 'Batata', h: 84, out: 'batata', q: [4, 8], col: '#b08a55' },
};

/* ---------- Sobreviventes ---------- */
const NPC_NAMES = ['Joana', 'Marcos', 'Dona Cida', 'Rafael', 'Bia', 'Seu Antônio', 'Lúcia', 'Pedro', 'Tainá', 'Caio', 'Renata', 'Jorge', 'Helena', 'Thiago', 'Vera', 'Diego'];
const NPC_KINDS = {
  comerciante: { n: 'Comerciante', col: '#c79a3a' },
  familia: { n: 'Família', col: '#5a8fc0' },
  solitario: { n: 'Sobrevivente', col: '#7a9a5a' },
  bandido: { n: 'Saqueador', col: '#9a3a3a' },
};
