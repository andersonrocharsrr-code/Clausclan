/*
 * Categorias e taxonomia.
 * As receitas apontam para estas chaves (campos `cats`, `meals` e `tags`); nada aqui conhece receitas específicas,
 * a não ser os atalhos de "Receitas brasileiras", que levam direto ao prato.
 */

/** Categorias da Home (chips horizontais). */
export const CATEGORIES = [
  { id: 'massas', label: 'Massas', emoji: '🍝', tint: '#F6E3CF' },
  { id: 'frango', label: 'Frango', emoji: '🍗', tint: '#F8E6C9' },
  { id: 'carnes', label: 'Carnes', emoji: '🥩', tint: '#F4DAD3' },
  { id: 'peixes', label: 'Peixes', emoji: '🐟', tint: '#DCEAF0' },
  { id: 'saudaveis', label: 'Saudáveis', emoji: '🥗', tint: '#E1EEDC' },
  { id: 'sobremesas', label: 'Sobremesas', emoji: '🍰', tint: '#F6DEE3' },
  { id: 'paes', label: 'Pães', emoji: '🥖', tint: '#F3E5CC' },
  { id: 'lanches', label: 'Lanches', emoji: '🍕', tint: '#F7E0CF' },
  { id: 'brasileiras', label: 'Brasileiras', emoji: '🍚', tint: '#E3ECD6' },
  { id: 'sopas', label: 'Sopas', emoji: '🍲', tint: '#F4E2CF' },
];

/** Tipo de refeição (filtro "Categoria" da busca e taxonomia). */
export const MEALS = {
  cafe: { label: 'Café da manhã', emoji: '☕' },
  almoco: { label: 'Almoço', emoji: '🍛' },
  jantar: { label: 'Jantar', emoji: '🌙' },
  lanche: { label: 'Lanches', emoji: '🥪' },
  sobremesa: { label: 'Sobremesa', emoji: '🍮' },
};

export const DIFFICULTY = {
  facil: { label: 'Fácil', level: 1 },
  medio: { label: 'Médio', level: 2 },
  dificil: { label: 'Difícil', level: 3 },
};

export const TIME_FILTERS = [
  { id: 't15', label: 'Até 15 min', test: (m) => m <= 15 },
  { id: 't30', label: 'Até 30 min', test: (m) => m <= 30 },
  { id: 't60', label: 'Até 1 hora', test: (m) => m <= 60 },
  { id: 't60p', label: 'Mais de 1 hora', test: (m) => m > 60 },
];

/**
 * Estrutura "Explorar": refeição → subcategorias.
 * Cada subcategoria filtra por `tag` (ou abre uma receita com `recipe`). Se nenhuma receita bater, aparece "Em breve" —
 * basta cadastrar receitas com a tag para a seção se preencher sozinha.
 */
export const TAXONOMY = [
  {
    id: 'cafe', label: 'Café da manhã', emoji: '☕',
    subs: [
      { label: 'Omeletes', tag: 'omeletes' }, { label: 'Panquecas', tag: 'panquecas' },
      { label: 'Tapiocas', tag: 'tapiocas' }, { label: 'Pães', tag: 'paes' }, { label: 'Bolos', tag: 'bolos' },
    ],
  },
  {
    id: 'almoco', label: 'Almoço', emoji: '🍛',
    subs: [
      { label: 'Arroz', tag: 'arroz' }, { label: 'Feijão', tag: 'feijao' }, { label: 'Carnes', tag: 'carnes' },
      { label: 'Frango', tag: 'frango' }, { label: 'Peixes', tag: 'peixes' }, { label: 'Massas', tag: 'massas' },
    ],
  },
  {
    id: 'jantar', label: 'Jantar', emoji: '🌙',
    subs: [
      { label: 'Sopas', tag: 'sopas' }, { label: 'Massas', tag: 'massas' },
      { label: 'Lanches', tag: 'lanches' }, { label: 'Saladas', tag: 'saladas' },
    ],
  },
  {
    id: 'sobremesa', label: 'Sobremesas', emoji: '🍮',
    subs: [
      { label: 'Bolos', tag: 'bolos' }, { label: 'Tortas doces', tag: 'tortas-doces' }, { label: 'Pudins', tag: 'pudins' },
      { label: 'Mousses', tag: 'mousses' }, { label: 'Doces', tag: 'doces' },
    ],
  },
  {
    id: 'brasileiras', label: 'Receitas brasileiras', emoji: '🇧🇷',
    subs: [
      { label: 'Feijoada', recipe: 'feijoada' }, { label: 'Moqueca', recipe: 'moqueca-peixe' },
      { label: 'Escondidinho', recipe: 'escondidinho-carne' }, { label: 'Baião de dois', recipe: 'baiao-de-dois' },
      { label: 'Pão de queijo', recipe: 'pao-de-queijo' }, { label: 'Brigadeiro', recipe: 'brigadeiro' },
      { label: 'Carne de panela', tag: 'carne-de-panela' },
    ],
  },
];

/** Preferências alimentares e restrições: o que cada uma exclui (marcas `has` dos ingredientes). */
export const DIETS = {
  vegetariana: { label: 'Vegetariana', emoji: '🥕', excludes: ['carne', 'frango', 'peixe'] },
  vegana: { label: 'Vegana', emoji: '🌱', excludes: ['carne', 'frango', 'peixe', 'lactose', 'ovo'] },
  saudavel: { label: 'Mais leve', emoji: '🥗', prefersTag: 'leve' },
  pratica: { label: 'Prática', emoji: '⚡', prefersMaxTime: 30 },
};

export const RESTRICTIONS = {
  'sem-lactose': { label: 'Sem lactose', excludes: ['lactose'] },
  'sem-gluten': { label: 'Sem glúten', excludes: ['gluten'] },
  'sem-ovo': { label: 'Sem ovo', excludes: ['ovo'] },
  'sem-porco': { label: 'Sem carne de porco', excludes: ['porco'] },
  'sem-peixe': { label: 'Sem peixes', excludes: ['peixe'] },
};

export const HAS_LABEL = {
  carne: 'carne', porco: 'carne de porco', frango: 'frango', peixe: 'peixe',
  lactose: 'lactose', gluten: 'glúten', ovo: 'ovo',
};

export const LEVELS = {
  iniciante: { label: 'Iniciante', desc: 'Estou começando agora' },
  intermediario: { label: 'Intermediário', desc: 'Cozinho com alguma frequência' },
  avancado: { label: 'Avançado', desc: 'Me viro bem na cozinha' },
};

export const TIME_AVAILABLE = {
  15: 'Até 15 min', 30: 'Até 30 min', 60: 'Até 1 hora', 0: 'Sem pressa',
};
