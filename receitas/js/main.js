/* Tempero — inicialização: carrega as receitas, registra as telas e liga o que é global (abas, favoritos, timers). */
import { loadRecipes, getRecipe } from './core/repo.js';
import { route, start, setOnChange, currentRoute, go } from './core/router.js';
import { state, toggleFav, isFav, on } from './core/store.js';
import { shoppingCount } from './core/shopping.js';
import * as T from './core/timer.js';
import { unlockAudio } from './core/sound.js';
import { fmtClock, esc, $, $$, vibrate } from './core/util.js';
import { toast } from './ui/overlay.js';

route('/', () => import('./screens/home.js').then((m) => m.default));
route('/buscar', () => import('./screens/search.js').then((m) => m.default));
route('/categoria/:id', () => import('./screens/category.js').then((m) => m.categoryScreen));
route('/tag/:tag', () => import('./screens/category.js').then((m) => m.tagScreen));
route('/receita/:id', () => import('./screens/recipe.js').then((m) => m.default));
route('/cozinhar/:id', () => import('./screens/cook.js').then((m) => m.default));
route('/pronto/:id', () => import('./screens/done.js').then((m) => m.default));
route('/favoritos', () => import('./screens/favorites.js').then((m) => m.default));
route('/lista', () => import('./screens/shopping.js').then((m) => m.default));
route('/perfil', () => import('./screens/profile.js').then((m) => m.default));
route('/despensa', () => import('./screens/pantry.js').then((m) => m.default));

/* ---------- barra de abas ---------- */
function updateTabs(cur) {
  const bar = $('#tabbar');
  bar.classList.toggle('hidden', !!cur?.screen.fullscreen);
  $$('.tab', bar).forEach((t) => {
    const onTab = t.dataset.tab === cur?.screen.tab;
    t.classList.toggle('on', onTab);
    if (onTab) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current');
  });
  const n = shoppingCount();
  const badge = $('#cart-badge');
  badge.textContent = n > 99 ? '99+' : n;
  badge.hidden = !n;
}
on('shopping', () => updateTabs(currentRoute()));

/* ---------- favoritar em qualquer card ---------- */
document.addEventListener('click', (e) => {
  unlockAudio();
  const b = e.target.closest('[data-fav]');
  if (!b) return;
  e.preventDefault();
  e.stopPropagation();
  const id = b.dataset.fav;
  const onFav = toggleFav(id);
  vibrate(onFav ? [10, 30, 10] : 8);
  $$(`[data-fav="${CSS.escape(id)}"]`).forEach((x) => {
    x.classList.toggle('on', onFav);
    x.setAttribute('aria-pressed', onFav);
    x.setAttribute('aria-label', onFav ? 'Remover dos favoritos' : 'Favoritar');
    x.classList.remove('pop'); void x.offsetWidth; x.classList.add('pop');
  });
  dispatchEvent(new CustomEvent('fav-changed', { detail: id }));
  toast(onFav ? `❤️ ${esc(getRecipe(id)?.name || 'Receita')} salva nas favoritas` : 'Removida das favoritas', onFav ? { label: 'Ver', fn: () => go('#/favoritos') } : null, 2200);
}, true);

/* ---------- pílula de timer fora da etapa ---------- */
function timerPill() {
  const cur = currentRoute();
  const list = T.active();
  let el = $('.timer-pill');
  // Na própria etapa do timer, o cartão grande já mostra tudo.
  const visible = list.filter((t) => !(cur?.path?.startsWith('/cozinhar/') && state.cooking?.id === t.recipeId && state.cooking?.step === t.step));
  if (!visible.length) { el?.remove(); return; }
  const t = visible.find((x) => x.status === 'done') || visible.sort((a, b) => T.remaining(a) - T.remaining(b))[0];
  if (!el) {
    el = document.createElement('div');
    el.className = 'timer-pill';
    el.setAttribute('role', 'status');
    document.body.appendChild(el);
    el.addEventListener('click', () => {
      const id = el.dataset.id;
      const tt = T.get(id);
      if (!tt) return;
      if (tt.status === 'done' && !getRecipe(tt.recipeId)) { T.dismiss(id); return; }
      if (state.cooking?.id === tt.recipeId) state.cooking.step = tt.step;
      go(`#/cozinhar/${tt.recipeId}?passo=${tt.step}`);
    });
  }
  el.dataset.id = t.id;
  el.classList.toggle('done', t.status === 'done');
  const more = visible.length > 1 ? ` +${visible.length - 1}` : '';
  el.innerHTML = t.status === 'done'
    ? `<span>🔔</span><span class="lb">${esc(t.label)} — tempo concluído!</span><span class="go">Ver</span>`
    : `<span>${t.status === 'paused' ? '⏸' : '⏱'}</span><span class="t">${fmtClock(T.remaining(t))}</span><span class="lb">${esc(t.label)}${more}</span><span class="go">Abrir</span>`;
}
T.onTimers(timerPill);
addEventListener('timer-done', (e) => {
  const cur = currentRoute();
  const t = e.detail;
  const onStep = cur?.path?.startsWith('/cozinhar/') && state.cooking?.step === t.step && state.cooking?.id === t.recipeId;
  if (!onStep) toast(`🔔 Tempo concluído: ${esc(t.label)}`, { label: 'Ver', fn: () => go(`#/cozinhar/${t.recipeId}?passo=${t.step}`) }, 6000);
});

setOnChange((cur) => { updateTabs(cur); timerPill(); });

/* ---------- partida ---------- */
(async () => {
  const t0 = performance.now();
  try {
    await loadRecipes();
  } catch (e) {
    console.error(e);
    $('#view').innerHTML = '<div class="empty"><div class="art">😕</div><h3>Não foi possível carregar as receitas</h3><p>Verifique a conexão e tente de novo.</p><button class="btn btn-primary" onclick="location.reload()">Tentar de novo</button></div>';
  }
  await start();
  // Splash curto: só o suficiente para a animação da marca não piscar.
  setTimeout(() => $('#splash')?.classList.add('gone'), Math.max(0, 650 - (performance.now() - t0)));
  setTimeout(() => $('#splash')?.remove(), 1400);
})();

if ('serviceWorker' in navigator && location.protocol !== 'file:' && !window.Capacitor) {
  addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

// Recupera o estado de favorito quando a página volta do cache do navegador.
addEventListener('pageshow', (e) => {
  if (!e.persisted) return;
  $$('[data-fav]').forEach((x) => x.classList.toggle('on', isFav(x.dataset.fav)));
});
