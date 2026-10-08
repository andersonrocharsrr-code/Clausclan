/* Início: saudação, busca, categorias, "o que tenho", populares, rápidas, para você, explorar e recentes. */
import { CATEGORIES, TAXONOMY } from '../data/categories.js';
import { popular, quick, allRecipes, getRecipe, byTag } from '../core/repo.js';
import { state, recentHistory } from '../core/store.js';
import { forYou, hasPrefs } from '../core/prefs.js';
import { esc, relTime } from '../core/util.js';
import { recipeCard, recipeRow, sectionHead } from '../ui/components.js';
import { dishArt } from '../ui/art-dishes.js';
import { foodIcon } from '../ui/icons-food.js';
import { icon } from '../ui/icons.js';

const greeting = () => {
  const h = new Date().getHours();
  return h < 5 ? 'Boa noite' : h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
};

function resumeCard() {
  const c = state.cooking;
  const r = c && getRecipe(c.id);
  if (!r) return '';
  const pct = Math.round((c.done.length / r.steps.length) * 100);
  return `<a class="resume-card rise" href="#/cozinhar/${r.id}" aria-label="Continuar ${esc(r.name)}">
    <div class="thumb">${dishArt(r, { label: false })}</div>
    <div class="grow"><small>Continue de onde parou · passo ${c.step + 1} de ${r.steps.length}</small>
      <div style="font-weight:800;font-size:16px;line-height:1.25">${esc(r.name)}</div>
      <div class="bar"><i style="width:${pct}%"></i></div></div>
    <span class="go">${icon('play')}</span></a>`;
}

function explore() {
  return TAXONOMY.map((g) => `<div class="explore-card rise">
    <div class="head"><span class="e">${g.emoji}</span>${g.label}</div>
    <div class="chips">${g.subs.map((s) => {
      if (s.recipe) return getRecipe(s.recipe) ? `<a class="chip" href="#/receita/${s.recipe}">${s.label}</a>` : '';
      const n = byTag(s.tag).length;
      return n ? `<a class="chip" href="#/tag/${s.tag}?t=${encodeURIComponent(s.label)}">${s.label} <small>${n}</small></a>` : `<span class="chip soon" title="Em breve">${s.label} <small>em breve</small></span>`;
    }).join('')}</div></div>`).join('');
}

export default {
  tab: 'home',
  title: 'Início',
  render() {
    const p = state.profile;
    const name = p.name ? `, ${esc(p.name.split(' ')[0])}` : '';
    const recents = recentHistory(6).map((h) => ({ h, r: getRecipe(h.id) })).filter((x) => x.r);
    const mine = hasPrefs(p) ? forYou(p, 6) : [];

    return `
      <header class="hello">
        <div class="grow">
          <p class="hi">${greeting()}${name}! 👋</p>
          <h1 class="h1">O que você quer<br>cozinhar hoje?</h1>
        </div>
        <a class="avatar" href="#/perfil" aria-label="Perfil">${p.photo ? `<img src="${p.photo}" alt="">` : esc((p.name || 'T').charAt(0).toUpperCase())}</a>
      </header>

      <div class="pad" style="margin-top:20px">
        <a class="searchbox" href="#/buscar?focus=1" aria-label="Buscar receitas">
          ${icon('search')}<span style="flex:1;color:var(--ink-3);font-size:15.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Buscar receitas, ingredientes ou pratos...</span>
          <span class="filter-btn" aria-hidden="true">${icon('filter')}</span>
        </a>
      </div>

      ${resumeCard()}

      <div class="section" style="margin-top:24px">
        <div class="hscroll" role="list" aria-label="Categorias">
          ${CATEGORIES.map((c, i) => `<a class="cat rise" style="--i:${i}" role="listitem" href="#/categoria/${c.id}"><span class="bubble" style="--tint:${c.tint}">${c.emoji}</span><span>${c.label}</span></a>`).join('')}
        </div>
      </div>

      <div class="section" style="margin-top:14px">
        ${sectionHead('Receitas populares', 'Ver todas', '#/buscar')}
        <div class="hscroll">${popular(8).map((r, i) => recipeCard(r, i)).join('')}</div>
      </div>

      <a class="pantry-banner rise" href="#/despensa">
        <h3>O que posso fazer com o que tenho?</h3>
        <p>Diga o que tem em casa e veja receitas possíveis.</p>
        <span class="cta">Descobrir receitas ${icon('right')}</span>
        <span class="float" style="right:22px;top:20px">${foodIcon('tomato', 44)}</span>
        <span class="float" style="right:86px;top:74px;animation-delay:-1.3s">${foodIcon('egg', 44)}</span>
        <span class="float" style="right:18px;top:118px;animation-delay:-2.4s">${foodIcon('cheese', 44)}</span>
      </a>

      ${mine.length ? `<div class="section">${sectionHead('Para você', 'Ajustar', '#/perfil')}
        <div class="hscroll">${mine.map((r, i) => recipeCard(r, i)).join('')}</div></div>` : ''}

      <div class="section">
        ${sectionHead('Rápidas para hoje', 'Até 30 min', '#/buscar?time=t30')}
        <div class="list">${quick(30).slice(0, 4).map((r, i) => recipeRow(r, i)).join('')}</div>
      </div>

      ${recents.length ? `<div class="section">${sectionHead('Receitas recentes', 'Histórico', '#/favoritos?aba=recentes')}
        <div class="list">${recents.slice(0, 3).map(({ h, r }, i) => recipeRow(r, i, h.type === 'cook' || h.cookedAt ? `👨‍🍳 Você preparou ${relTime(h.cookedAt || h.at)}` : `👀 Visto ${relTime(h.at)}`)).join('')}</div></div>` : ''}

      <div class="section">
        ${sectionHead('Explorar', `${allRecipes().length} receitas`, '#/buscar')}
        <div class="explore">${explore()}</div>
      </div>
    `;
  },
};
