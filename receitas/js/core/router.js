/*
 * Roteador por hash (#/receita/lasanha-bolonhesa?porcoes=4).
 * Cada tela é um módulo { tab, fullscreen, title, render(ctx) → html, mount(root, ctx) → cleanup? }.
 * Guarda a posição de rolagem de cada endereço para o "voltar" cair onde o usuário estava.
 */
const routes = [];
let current = null;
let cleanup = null;
const stack = [];
const scrolls = new Map();
let onChange = () => {};

export function route(pattern, load) {
  const keys = [];
  const re = new RegExp('^' + pattern.replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '/?$');
  routes.push({ re, keys, load });
}

export function parse(hash = location.hash) {
  const raw = hash.replace(/^#/, '') || '/';
  const [path, qs] = raw.split('?');
  for (const r of routes) {
    const m = path.match(r.re);
    if (m) {
      const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
      return { r, path, params, query: Object.fromEntries(new URLSearchParams(qs || '')) };
    }
  }
  return null;
}

export const go = (hash, replace = false) => {
  if (replace) { history.replaceState(null, '', hash); render(); } else location.hash = hash;
};
export const back = (fallback = '#/') => {
  if (stack.length > 1) history.back(); else go(fallback, true);
};
export const currentRoute = () => current;
export const setOnChange = (fn) => { onChange = fn; };

export async function render() {
  let view = document.getElementById('view');
  const hash = location.hash || '#/';
  const ctx = parse(hash) || parse('#/');
  const isBack = stack.length > 1 && stack[stack.length - 2] === hash;
  if (current) scrolls.set(current.hash, scrollY);
  if (isBack) stack.pop(); else if (stack.at(-1) !== hash) stack.push(hash);
  if (stack.length > 50) stack.shift();

  const screen = await ctx.r.load();
  try { cleanup?.(); } catch (e) { console.error(e); }
  cleanup = null;
  current = { ...ctx, hash, screen };

  // Elemento novo a cada tela: os ouvintes da tela anterior vão embora junto.
  const fresh = view.cloneNode(false);
  view.replaceWith(fresh);
  view = fresh;
  view.className = `view${screen.fullscreen ? ' no-tabs' : ''}`;
  document.body.classList.toggle('no-tabs-page', !!screen.fullscreen);
  view.innerHTML = await screen.render(ctx);
  void view.offsetWidth;
  view.classList.add(isBack ? 'enter-back' : 'enter');
  scrollTo(0, isBack ? scrolls.get(hash) || 0 : 0);
  if (screen.title) document.title = `${typeof screen.title === 'function' ? screen.title(ctx) : screen.title} · Tempero`;
  cleanup = screen.mount?.(view, ctx) || null;
  onChange(current);
}

export function start() {
  addEventListener('hashchange', render);
  return render();
}
