# Formato das receitas

Cada arquivo desta pasta exporta uma lista de receitas. A interface nunca conhece receitas específicas:
tudo é montado a partir destes dados. Depois de editar, rode `node receitas/scripts/check-data.mjs`
para conferir ids, unidades e cenas.

```js
{
  id: 'lasanha-bolonhesa',          // único, usado na URL (#/receita/lasanha-bolonhesa)
  name: 'Lasanha à Bolonhesa',
  emoji: '🍝',
  description: 'Uma ou duas frases.',
  cats: ['massas', 'carnes'],       // categorias da Home (js/data/categories.js → CATEGORIES)
  meals: ['almoco', 'jantar'],      // tipo de refeição (MEALS)
  tags: ['massas', 'forno'],        // busca e subcategorias de "Explorar" (TAXONOMY)
  art: 'lasanha',                   // ilustração do prato pronto (js/ui/art-dishes.js)
  tint: '#F4DCC8',                  // cor de fundo da ilustração
  prep: 20, cook: 50,               // minutos (estimativa)
  wait: 'Geladeira por 6 horas',    // opcional: espera fora do tempo de preparo
  servings: 6, yieldUnit: 'unidades', // rendimento (padrão: porções)
  difficulty: 'facil' | 'medio' | 'dificil',
  rating: 4.9, reviews: 1284,       // avaliação de demonstração
  ingredients: [
    { id: 'carne-moida', q: 500, u: 'g', note: 'opcional', group: 'Molho', optional: false },
    { id: 'sal', q: null, u: 'gosto' },
  ],
  tools: ['panela', 'faca'],        // js/data/tools.js
  steps: [{
    title: 'Doure a carne',
    text: 'Instrução curta e direta.',
    scene: { v: 'pot', a: 'stir', f: 'meat', it: ['carne-moida'] }, // ilustração da etapa
    heat: 'baixo' | 'medio' | 'alto' | 'desligado',
    oven: 200,                      // °C
    timer: 480,                     // segundos: cria o timer da etapa
    wait: '6 horas',                // espera longa (sem timer)
    uses: ['carne-moida'],          // mostra a quantidade (recalculada pelas porções)
    amount: '2 colheres de sopa',   // quantidade em texto livre
    tip: 'Dica', warn: 'Atenção',
  }],
  tips: [], mistakes: [],
  result: 'Como o prato fica pronto.',
  nutrition: { kcal, prot, carb, fat, note }, // estimativa por porção
}
```

## Unidades (`u`)
`g`, `kg`, `ml`, `l`, `xic` (xícara), `cs` (colher de sopa), `cc` (colher de chá), `un`, `dente`, `lata`,
`caixa`, `fatia`, `ramo`, `folha`, `maco` (maço), `pitada`, `gosto` (a gosto, sem quantidade).

## Cenas (`scene`)
- `v` — onde acontece: `board`, `pot`, `pressure`, `pan`, `clay`, `bowl`, `dish`, `mold`, `glasses`,
  `blender`, `colander`, `oven`, `fridge`, `plate`.
- `a` — ação: `chop`, `add`, `pour`, `stir`, `mix`, `whisk`, `boil`, `fry`, `heat`, `mash`, `layer`, `spread`,
  `sprinkle`, `sift`, `blend`, `drain`, `shred`, `roll`, `shape`, `fold`, `marinate`, `preheat`, `bake`, `rest`,
  `chill`, `unmold`, `serve`.
- `f` — o que está dentro (cor e textura): veja `FILLS` em `js/ui/scene.js`.
- `it` — ingredientes que aparecem na cena (ids do catálogo ou ícones de `js/ui/icons-food.js`).
