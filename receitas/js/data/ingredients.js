/*
 * Catálogo de ingredientes.
 * Cada receita referencia ingredientes por id; daqui saem nome/plural, seção do mercado (lista de compras),
 * ícone (ilustração), apelidos de busca e marcações usadas pelas preferências alimentares.
 *
 *   n      nome no singular          p      plural (opcional)
 *   aisle  seção do mercado (ver AISLES)
 *   icon   chave do desenho em js/ui/icons-food.js
 *   alias  outras palavras que encontram este ingrediente ("queijo" encontra muçarela, parmesão...)
 *   has    contém: carne, porco, frango, peixe, lactose, gluten, ovo
 *   staple básico de despensa (sal, óleo, água): não conta no "o que posso fazer com o que tenho?"
 *   whole  quantidade sempre inteira ao recalcular porções (ovos, dentes de alho)
 *   g      gênero do nome ('f' = feminino), para textos como "picada"
 */
export const AISLES = {
  horti: { label: 'Hortifruti', emoji: '🥬', order: 1 },
  carnes: { label: 'Carnes e peixes', emoji: '🥩', order: 2 },
  laticinios: { label: 'Laticínios e ovos', emoji: '🥛', order: 3 },
  mercearia: { label: 'Mercearia', emoji: '🛒', order: 4 },
  temperos: { label: 'Temperos', emoji: '🧂', order: 5 },
  outros: { label: 'Outros', emoji: '📦', order: 6 },
};

export const INGREDIENTS = {
  // Carnes e peixes
  'carne-moida': { n: 'carne moída', aisle: 'carnes', icon: 'meat', alias: ['carne', 'patinho', 'acem'], has: ['carne'], g: 'f' },
  'frango-peito': { n: 'peito de frango', aisle: 'carnes', icon: 'chicken', alias: ['frango', 'file de frango'], has: ['frango'] },
  'frango-inteiro': { n: 'frango inteiro', aisle: 'carnes', icon: 'chickenWhole', alias: ['frango'], has: ['frango'] },
  bacon: { n: 'bacon', aisle: 'carnes', icon: 'bacon', alias: ['toucinho'], has: ['carne', 'porco'] },
  presunto: { n: 'presunto', aisle: 'carnes', icon: 'ham', has: ['carne', 'porco'] },
  calabresa: { n: 'linguiça calabresa', aisle: 'carnes', icon: 'sausage', alias: ['linguica', 'calabresa'], has: ['carne', 'porco'], g: 'f' },
  paio: { n: 'paio', aisle: 'carnes', icon: 'sausage', alias: ['linguica'], has: ['carne', 'porco'] },
  'carne-seca': { n: 'carne-seca', aisle: 'carnes', icon: 'dryMeat', alias: ['carne', 'charque', 'jabá'], has: ['carne'], g: 'f' },
  costelinha: { n: 'costelinha suína', aisle: 'carnes', icon: 'ribs', alias: ['costela', 'porco'], has: ['carne', 'porco'], g: 'f' },
  peixe: { n: 'filé de peixe branco', p: 'filés de peixe branco', aisle: 'carnes', icon: 'fish', alias: ['peixe', 'robalo', 'pescada', 'tilapia', 'cação'], has: ['peixe'] },

  // Hortifruti
  cebola: { n: 'cebola', p: 'cebolas', aisle: 'horti', icon: 'onion', g: 'f' },
  'cebola-roxa': { n: 'cebola-roxa', p: 'cebolas-roxas', aisle: 'horti', icon: 'redOnion', alias: ['cebola'], g: 'f' },
  alho: { n: 'alho', aisle: 'horti', icon: 'garlic' },
  tomate: { n: 'tomate', p: 'tomates', aisle: 'horti', icon: 'tomato' },
  batata: { n: 'batata', p: 'batatas', aisle: 'horti', icon: 'potato', g: 'f' },
  mandioca: { n: 'mandioca', aisle: 'horti', icon: 'cassava', alias: ['aipim', 'macaxeira'], g: 'f' },
  cenoura: { n: 'cenoura', p: 'cenouras', aisle: 'horti', icon: 'carrot', g: 'f' },
  abobrinha: { n: 'abobrinha', p: 'abobrinhas', aisle: 'horti', icon: 'zucchini', g: 'f' },
  vagem: { n: 'vagem', aisle: 'horti', icon: 'greenBeans', g: 'f' },
  pimentao: { n: 'pimentão', p: 'pimentões', aisle: 'horti', icon: 'pepper' },
  'cheiro-verde': { n: 'cheiro-verde', aisle: 'horti', icon: 'herbs', alias: ['salsinha', 'cebolinha'] },
  coentro: { n: 'coentro', aisle: 'horti', icon: 'herbs' },
  salsinha: { n: 'salsinha', aisle: 'horti', icon: 'herbs', alias: ['salsa'], g: 'f' },
  cebolinha: { n: 'cebolinha', aisle: 'horti', icon: 'chives', g: 'f' },
  manjericao: { n: 'manjericão', aisle: 'horti', icon: 'basil' },
  alecrim: { n: 'alecrim', aisle: 'horti', icon: 'rosemary' },
  couve: { n: 'couve', aisle: 'horti', icon: 'kale', g: 'f' },
  laranja: { n: 'laranja', p: 'laranjas', aisle: 'horti', icon: 'orange', g: 'f' },
  limao: { n: 'limão', p: 'limões', aisle: 'horti', icon: 'lemon' },
  pepino: { n: 'pepino', p: 'pepinos', aisle: 'horti', icon: 'cucumber' },
  cogumelo: { n: 'cogumelo champignon', p: 'cogumelos champignon', aisle: 'horti', icon: 'mushroom', alias: ['champignon'] },
  maracuja: { n: 'maracujá', p: 'maracujás', aisle: 'horti', icon: 'passionfruit' },

  // Laticínios e ovos
  ovo: { n: 'ovo', p: 'ovos', aisle: 'laticinios', icon: 'egg', has: ['ovo'], whole: true },
  leite: { n: 'leite', aisle: 'laticinios', icon: 'milk', has: ['lactose'] },
  'creme-de-leite': { n: 'creme de leite', aisle: 'laticinios', icon: 'cream', alias: ['nata'], has: ['lactose'] },
  'leite-condensado': { n: 'leite condensado', aisle: 'laticinios', icon: 'condensed', has: ['lactose'] },
  manteiga: { n: 'manteiga', aisle: 'laticinios', icon: 'butter', has: ['lactose'], g: 'f' },
  mucarela: { n: 'muçarela', aisle: 'laticinios', icon: 'cheese', alias: ['queijo', 'mussarela', 'mozarela'], has: ['lactose'], g: 'f' },
  parmesao: { n: 'queijo parmesão ralado', aisle: 'laticinios', icon: 'grated', alias: ['queijo', 'parmesao'], has: ['lactose'] },
  'queijo-coalho': { n: 'queijo coalho', aisle: 'laticinios', icon: 'coalho', alias: ['queijo'], has: ['lactose'] },
  'queijo-meia-cura': { n: 'queijo meia-cura ralado', aisle: 'laticinios', icon: 'grated', alias: ['queijo', 'queijo minas'], has: ['lactose'] },
  requeijao: { n: 'requeijão cremoso', aisle: 'laticinios', icon: 'requeijao', alias: ['requeijao', 'queijo cremoso'], has: ['lactose'] },

  // Mercearia
  arroz: { n: 'arroz branco', aisle: 'mercearia', icon: 'rice', alias: ['arroz'] },
  'feijao-preto': { n: 'feijão-preto', aisle: 'mercearia', icon: 'beans', alias: ['feijao'] },
  'feijao-corda': { n: 'feijão-de-corda', aisle: 'mercearia', icon: 'beansLight', alias: ['feijao', 'feijao fradinho'] },
  'grao-de-bico': { n: 'grão-de-bico cozido', aisle: 'mercearia', icon: 'chickpea', alias: ['grao de bico'] },
  'massa-lasanha': { n: 'massa para lasanha pré-cozida', aisle: 'mercearia', icon: 'pastaSheet', alias: ['massa', 'lasanha', 'macarrao'], has: ['gluten'], g: 'f' },
  espaguete: { n: 'espaguete', aisle: 'mercearia', icon: 'spaghetti', alias: ['macarrao', 'massa', 'spaghetti'], has: ['gluten'] },
  'molho-tomate': { n: 'molho de tomate', aisle: 'mercearia', icon: 'sauce', alias: ['molho'] },
  milho: { n: 'milho verde em conserva', aisle: 'mercearia', icon: 'corn', alias: ['milho'] },
  ervilha: { n: 'ervilha em conserva', aisle: 'mercearia', icon: 'peas', alias: ['ervilha'], g: 'f' },
  farinha: { n: 'farinha de trigo', aisle: 'mercearia', icon: 'flour', alias: ['farinha', 'trigo'], has: ['gluten'], g: 'f' },
  polvilho: { n: 'polvilho azedo', aisle: 'mercearia', icon: 'flour', alias: ['polvilho', 'fecula'] },
  'goma-tapioca': { n: 'goma de tapioca', aisle: 'mercearia', icon: 'tapiocaBag', alias: ['tapioca', 'goma'], g: 'f' },
  acucar: { n: 'açúcar', aisle: 'mercearia', icon: 'sugar' },
  'chocolate-po': { n: 'chocolate em pó', aisle: 'mercearia', icon: 'cocoa', alias: ['chocolate', 'cacau', 'achocolatado'] },
  granulado: { n: 'chocolate granulado', aisle: 'mercearia', icon: 'sprinkles', alias: ['granulado', 'chocolate'] },
  fermento: { n: 'fermento químico em pó', aisle: 'mercearia', icon: 'bakingPowder', alias: ['fermento'] },
  'leite-coco': { n: 'leite de coco', aisle: 'mercearia', icon: 'coconutMilk', alias: ['coco'] },
  'batata-palha': { n: 'batata palha', aisle: 'mercearia', icon: 'chips', g: 'f' },
  ketchup: { n: 'ketchup', aisle: 'mercearia', icon: 'ketchup' },
  mostarda: { n: 'mostarda', aisle: 'mercearia', icon: 'mustard', g: 'f' },
  azeite: { n: 'azeite de oliva', aisle: 'mercearia', icon: 'oliveOil', alias: ['azeite'] },
  dende: { n: 'azeite de dendê', aisle: 'mercearia', icon: 'dende', alias: ['dende'] },

  // Temperos
  louro: { n: 'folha de louro', p: 'folhas de louro', aisle: 'temperos', icon: 'bayLeaf', alias: ['louro'], g: 'f' },
  paprica: { n: 'páprica defumada', aisle: 'temperos', icon: 'paprika', alias: ['paprica'], g: 'f' },
  oregano: { n: 'orégano', aisle: 'temperos', icon: 'oregano' },
  'noz-moscada': { n: 'noz-moscada', aisle: 'temperos', icon: 'blackPepper', g: 'f' },

  // Básicos da despensa (não contam no "o que tenho")
  sal: { n: 'sal', aisle: 'temperos', icon: 'salt', staple: true },
  pimenta: { n: 'pimenta-do-reino', aisle: 'temperos', icon: 'blackPepper', alias: ['pimenta'], staple: true, g: 'f' },
  oleo: { n: 'óleo', aisle: 'mercearia', icon: 'oil', staple: true },
  agua: { n: 'água', aisle: 'outros', icon: 'water', staple: true, g: 'f' },
};

/** Atalhos na tela "O que posso fazer com o que tenho?" (palavras genéricas, casam com nomes e apelidos). */
export const PANTRY_QUICK = [
  'frango', 'arroz', 'tomate', 'queijo', 'ovo', 'carne moída', 'cebola', 'batata',
  'leite', 'leite condensado', 'creme de leite', 'farinha de trigo', 'feijão', 'macarrão', 'bacon', 'cenoura',
];
