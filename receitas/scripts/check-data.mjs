// Confere as receitas: ids únicos, ingredientes/utensílios/categorias existentes, unidades, cenas e quantidades.
// Uso: node receitas/scripts/check-data.mjs
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { default: recipes } = await import('../js/data/recipes/index.js');
const { INGREDIENTS, AISLES } = await import('../js/data/ingredients.js');
const { TOOLS } = await import('../js/data/tools.js');
const { CATEGORIES, MEALS, DIFFICULTY } = await import('../js/data/categories.js');
const { UNITS } = await import('../js/core/quantity.js');

// scene.js e art-dishes.js usam DOM só em tempo de execução; aqui lemos as chaves pelo texto.
const sceneSrc = readFileSync(join(root, 'js/ui/scene.js'), 'utf8');
const artSrc = readFileSync(join(root, 'js/ui/art-dishes.js'), 'utf8');
const iconSrc = readFileSync(join(root, 'js/ui/icons-food.js'), 'utf8');
const FILLS = new Set([...sceneSrc.slice(sceneSrc.indexOf('export const FILLS'), sceneSrc.indexOf('const fillOf')).matchAll(/^\s{2}(\w+):/gm)].map((m) => m[1]));
const VESSELS = new Set([...sceneSrc.slice(sceneSrc.indexOf('const VESSELS'), sceneSrc.indexOf('/* ---------- cenas especiais')).matchAll(/^\s{2}(\w+):/gm)].map((m) => m[1]));
const ACTIONS = new Set([...sceneSrc.matchAll(/case '(\w+)':/g)].map((m) => m[1]).concat(['preheat', 'bake', 'chill', 'blend']));
const ARTS = new Set([...artSrc.slice(artSrc.indexOf('const ART = {'), artSrc.indexOf('function defs')).matchAll(/^\s{2}(\w+)\(id, rnd\)/gm)].map((m) => m[1]));
const ICONS = new Set([...iconSrc.slice(iconSrc.indexOf('export const FOOD_ICONS'), iconSrc.indexOf('/** Ícone de um')).matchAll(/^\s{2}(\w+):/gm)].map((m) => m[1]));

const errors = [];
const err = (r, msg) => errors.push(`${r?.id || '?'}: ${msg}`);
const ids = new Set();

for (const [id, i] of Object.entries(INGREDIENTS)) {
  if (!AISLES[i.aisle]) errors.push(`ingrediente ${id}: seção "${i.aisle}" não existe`);
  if (!ICONS.has(i.icon)) errors.push(`ingrediente ${id}: ícone "${i.icon}" não existe`);
}

for (const r of recipes) {
  if (ids.has(r.id)) err(r, 'id repetido');
  ids.add(r.id);
  for (const k of ['name', 'description', 'art', 'result']) if (!r[k]) err(r, `falta "${k}"`);
  if (!ARTS.has(r.art)) err(r, `ilustração "${r.art}" não existe`);
  if (!DIFFICULTY[r.difficulty]) err(r, `dificuldade "${r.difficulty}"`);
  if (!(r.servings > 0)) err(r, 'porções inválidas');
  if (!(r.prep >= 0 && r.cook >= 0)) err(r, 'tempos inválidos');
  r.cats.forEach((c) => CATEGORIES.some((x) => x.id === c) || err(r, `categoria "${c}"`));
  r.meals.forEach((m) => MEALS[m] || err(r, `refeição "${m}"`));
  r.tools.forEach((t) => TOOLS[t] || err(r, `utensílio "${t}"`));
  r.ingredients.forEach((e) => {
    if (!INGREDIENTS[e.id]) err(r, `ingrediente "${e.id}"`);
    if (!UNITS[e.u]) err(r, `unidade "${e.u}" (${e.id})`);
    if (e.u !== 'gosto' && e.q == null) err(r, `quantidade faltando (${e.id})`);
  });
  if (!r.steps?.length) err(r, 'sem etapas');
  r.steps.forEach((s, n) => {
    const where = `etapa ${n + 1}`;
    if (!s.title || !s.text) err(r, `${where}: título/texto`);
    const sc = s.scene;
    if (!sc) { err(r, `${where}: sem cena`); return; }
    if (!VESSELS.has(sc.v)) err(r, `${where}: utensílio de cena "${sc.v}"`);
    if (!ACTIONS.has(sc.a)) err(r, `${where}: ação "${sc.a}"`);
    if (sc.f && !FILLS.has(sc.f)) err(r, `${where}: conteúdo "${sc.f}"`);
    (sc.it || []).forEach((k) => (INGREDIENTS[k] || ICONS.has(k)) || err(r, `${where}: item de cena "${k}"`));
    (s.uses || []).forEach((u) => r.ingredients.some((e) => e.id === u) || err(r, `${where}: usa "${u}", que não está nos ingredientes`));
    if (s.heat && !['baixo', 'medio', 'alto', 'desligado'].includes(s.heat)) err(r, `${where}: fogo "${s.heat}"`);
    if (s.timer && !(s.timer > 0 && s.timer <= 4 * 3600)) err(r, `${where}: timer fora do intervalo`);
  });
}

// O service worker precisa listar todos os módulos para o app abrir offline.
const sw = readFileSync(join(root, 'sw.js'), 'utf8');
const walk = (d) => readdirSync(join(root, d), { withFileTypes: true }).flatMap((f) => (f.isDirectory() ? walk(`${d}/${f.name}`) : [`${d}/${f.name}`]));
for (const f of [...walk('js'), ...walk('css')]) if (/\.(js|css)$/.test(f) && !sw.includes(`'${f}'`)) errors.push(`sw.js: falta '${f}' na lista de arquivos offline`);

if (errors.length) {
  console.error(`✗ ${errors.length} problema(s):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`✓ ${recipes.length} receitas, ${recipes.reduce((a, r) => a + r.steps.length, 0)} etapas, ${Object.keys(INGREDIENTS).length} ingredientes — tudo certo.`);
