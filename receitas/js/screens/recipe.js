/*
 * Tela da receita, na ordem da experiência:
 * ver o prato → tempo/dificuldade/porções → separar ingredientes → conferir utensílios → começar.
 */
import { getRecipe } from '../core/repo.js';
import { TOOLS } from '../data/tools.js';
import { DIFFICULTY, CATEGORIES } from '../data/categories.js';
import {
  state, isChecked, toggleCheck, setServings, addHistory, startCooking, toggleList, inList, LISTS, isFav,
} from '../core/store.js';
import { addFromRecipe } from '../core/shopping.js';
import { conflicts } from '../core/prefs.js';
import { describe } from '../core/quantity.js';
import { photosOf, urlFor, releaseUrls } from '../core/photos.js';
import { esc, fmtMinutes, fmtRating, fmtDuration, $, $$, vibrate } from '../core/util.js';
import { dishArt } from '../ui/art-dishes.js';
import { yieldLabel, ingIcon, checkSvg, favBtn, reviewsLabel, emptyState } from '../ui/components.js';
import { icon } from '../ui/icons.js';
import { sheet, toast } from '../ui/overlay.js';
import { go, back } from '../core/router.js';

const factorOf = (r) => (state.servings[r.id] || r.servings) / r.servings;

function ingRow(r, e, i, factor) {
  const d = describe(e, factor);
  const on = isChecked(r.id, i);
  return `<button type="button" class="ing ${on ? 'on' : ''}" data-ing="${i}" aria-pressed="${on}">
    ${ingIcon(e.id)}
    <span class="txt">${d.qty ? `<b>${d.qty}</b>${d.joiner}<span class="nm">${esc(d.name)}</span>` : `<span class="nm"><b>${esc(d.name)}</b></span>`}
      ${e.optional ? ' <span class="opt">(opcional)</span>' : ''}${d.note && !e.optional ? `<small>${esc(d.note)}</small>` : d.note && e.optional ? `<small>${esc(d.note.replace(/\s*\(opcional\)/, ''))}</small>` : ''}</span>
    <span class="check">${checkSvg}</span></button>`;
}

function ingredientsHtml(r) {
  const f = factorOf(r);
  let html = '', group = null, open = false;
  r.ingredients.forEach((e, i) => {
    if (e.group !== group) {
      if (open) html += '</div>';
      group = e.group;
      if (group) html += `<p class="ing-group">${esc(group)}</p>`;
      html += '<div class="ings">';
      open = true;
    }
    html += ingRow(r, e, i, f);
  });
  return html + (open ? '</div>' : '');
}

function sepProgress(r) {
  const n = state.checks[r.id]?.length || 0, t = r.ingredients.length;
  return `<span>${n === t ? '✅ Tudo separado!' : `${n} de ${t} separados`}</span><span class="bar"><i style="width:${(n / t) * 100}%"></i></span>`;
}

function journey(r) {
  const n = state.checks[r.id]?.length || 0, all = n === r.ingredients.length;
  const s = (k, cur, done, label, n2) => `<a href="#" data-scroll="${k}" class="${done ? 'done' : cur ? 'cur' : ''}"><span class="n">${done ? '✓' : n2}</span>${label}</a>`;
  return s('b-ings', !all, all, 'Ingredientes', 1) + s('b-tools', all, false, 'Utensílios', 2) + s('b-steps', false, false, 'Preparo', 3);
}

function stepTags(s) {
  const t = [];
  if (s.timer) t.push(`⏱ ${fmtDuration(s.timer)}`);
  if (s.wait) t.push(`⏳ ${s.wait}`);
  if (s.heat && s.heat !== 'desligado') t.push(`🔥 Fogo ${s.heat === 'medio' ? 'médio' : s.heat}`);
  if (s.oven) t.push(`🌡 ${s.oven} °C`);
  if (s.warn) t.push('⚠️ Atenção');
  return t.map((x) => `<span class="mini-tag">${x}</span>`).join('');
}

function listsSheet(r) {
  const body = () => Object.entries(LISTS).filter(([k]) => k !== 'done').map(([k, l]) =>
    `<button class="list-opt ${inList(r.id, k) ? 'on' : ''}" data-list="${k}"><span class="e">${l.emoji}</span>${l.label}<span class="check">${checkSvg}</span></button>`).join('') +
    `<div class="list-opt" style="opacity:.75"><span class="e">✅</span><span>Já fiz<small class="muted tiny" style="display:block;font-weight:600">Entra aqui sozinha quando você concluir a receita</small></span><span class="check" style="${inList(r.id, 'done') ? 'background:var(--herb);box-shadow:none' : ''}">${inList(r.id, 'done') ? checkSvg.replace('<path', '<path style="stroke-dashoffset:0"') : ''}</span></div>`;
  sheet({
    label: 'Salvar receita',
    html: `<h3>Salvar em…</h3><p class="sub">Organize suas receitas do seu jeito.</p><div class="lo" style="margin-top:10px">${body()}</div>`,
    mount: (el) => el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-list]');
      if (!b) return;
      const on = toggleList(r.id, b.dataset.list);
      vibrate(12);
      el.querySelector('.lo').innerHTML = body();
      toast(on ? `Salva em ${LISTS[b.dataset.list].label}` : `Removida de ${LISTS[b.dataset.list].label}`);
    }),
  });
}

async function share(r) {
  const text = `${r.name} — ${fmtMinutes(r.total)}, ${yieldLabel(r)}. Receita no Tempero.`;
  try {
    if (navigator.share) await navigator.share({ title: r.name, text, url: location.href });
    else { await navigator.clipboard.writeText(`${text}\n${location.href}`); toast('Link copiado!'); }
  } catch { /* cancelado */ }
}

export default {
  tab: 'home',
  title: ({ params }) => getRecipe(params.id)?.name || 'Receita',
  render({ params }) {
    const r = getRecipe(params.id);
    if (!r) {
      return `<header class="topbar"><button class="icon-btn" data-back aria-label="Voltar">${icon('back')}</button></header>
        ${emptyState({ emoji: '🍽️', title: 'Receita não encontrada', text: 'Ela pode ter sido removida ou o link está incompleto.', cta: 'Ir para o início', href: '#/' })}`;
    }
    const servings = state.servings[r.id] || r.servings;
    const warn = conflicts(r, state.profile);
    const my = state.ratings[r.id]?.stars;
    const cooking = state.cooking?.id === r.id ? state.cooking : null;
    const nut = r.nutrition;
    return `
      <div class="hero">${dishArt(r, { cls: 'dish-art' })}
        <div class="hero-bar">
          <button class="icon-btn glass" data-back aria-label="Voltar">${icon('back')}</button><span class="sp"></span>
          <button class="icon-btn glass" data-share aria-label="Compartilhar">${icon('share')}</button>
          ${favBtn(r.id, 'icon-btn glass').replace('class="fav', 'style="position:static" class="fav')}
        </div>
      </div>

      <div class="sheet-body">
        <p class="eyebrow">${r.emoji} ${r.cats.map((c) => CATEGORIES.find((x) => x.id === c)?.label).filter(Boolean).slice(0, 2).join(' · ')}</p>
        <h1 class="h1 recipe-title" style="margin-top:6px">${esc(r.name)}</h1>
        <div class="rating-line"><span class="stars">★★★★★</span><b style="color:var(--ink)">${fmtRating(r.rating)}</b><span>· ${reviewsLabel(r)}</span>${my ? `<span>· você deu ${my}★</span>` : ''}</div>
        <p class="desc">${esc(r.description)}</p>

        <div class="stats">
          <div class="stat"><div class="e">⏱</div><b>${fmtMinutes(r.total)}</b><small>Tempo</small></div>
          <div class="stat"><div class="e">👥</div><b id="stat-serv">${servings}</b><small>${r.yieldUnit || 'Porções'}</small></div>
          <div class="stat"><div class="e">🔥</div><b>${DIFFICULTY[r.difficulty].label}</b><small>Nível</small></div>
          <div class="stat"><div class="e">⭐</div><b>${fmtRating(r.rating)}</b><small>Nota</small></div>
        </div>
        <div class="time-split"><span>🔪 Preparo: ${fmtMinutes(r.prep)}</span>${r.cook ? `<span>🍳 Cozimento: ${fmtMinutes(r.cook)}</span>` : '<span>🍳 Sem cozimento</span>'}${r.timers ? `<span>⏲ ${r.timers} timers</span>` : ''}</div>
        ${r.wait ? `<div class="wait-note">⏳ ${esc(r.wait)}</div>` : ''}
        ${warn.length ? `<div class="conflict"><span>⚠️</span><div>${warn.map(esc).join('<br>')}<div class="tiny" style="margin-top:4px;opacity:.8">Com base nas suas preferências do perfil.</div></div></div>` : ''}

        <div class="actions">
          <button class="btn btn-soft" data-lists>${icon('heart')} ${isFav(r.id) ? 'Salva' : 'Favoritar'}</button>
          <button class="btn btn-herb" data-add-all>${icon('cart')} Lista de compras</button>
        </div>

        <nav class="journey" id="journey" aria-label="Etapas da receita">${journey(r)}</nav>

        <section class="block" id="b-ings">
          <div class="block-head"><h2 class="h2">Ingredientes</h2></div>
          <div class="servings">
            <div class="lbl">Rendimento<small id="serv-lbl">${yieldLabel(r, servings)}</small></div>
            <div class="stepper"><button type="button" data-serv="-1" aria-label="Diminuir">−</button><output id="serv-out" aria-live="polite">${servings}</output><button type="button" data-serv="1" aria-label="Aumentar">+</button></div>
          </div>
          <div class="sep-progress" id="sep">${sepProgress(r)}</div>
          <p class="tiny muted" style="margin:0 4px 6px">Toque em cada ingrediente quando ele estiver separado na bancada.</p>
          <div id="ings">${ingredientsHtml(r)}</div>
          <div class="row" style="margin-top:12px;gap:8px">
            <button class="btn btn-ghost btn-block" data-add-all>🛒 Adicionar todos à lista</button>
          </div>
          <button class="link" style="display:block;margin:6px auto 0" data-add-missing>Adicionar só os que não marquei</button>
        </section>

        <section class="block" id="b-tools">
          <div class="block-head"><h2 class="h2">Você vai precisar de</h2></div>
          <div class="tools">${r.tools.map((t, i) => `<div class="tool rise" style="--i:${i}"><span class="e">${TOOLS[t]?.emoji || '🍴'}</span>${esc(TOOLS[t]?.n || t)}</div>`).join('')}</div>
        </section>

        <section class="block" id="b-steps">
          <div class="block-head"><h2 class="h2">Modo de preparo</h2><span class="tiny muted" style="font-weight:700">${r.steps.length} etapas</span></div>
          <div class="steps-prev">${r.steps.map((s, i) => `<button class="sp-item" data-step="${i}"><span class="n">${i + 1}</span><span class="grow"><b>${esc(s.title)}</b><p>${esc(s.text)}</p>${stepTags(s) ? `<span class="tags">${stepTags(s)}</span>` : ''}</span></button>`).join('')}</div>
        </section>

        ${r.tips?.length || r.mistakes?.length ? `<section class="block">
          ${r.tips?.length ? `<div class="note-card tip"><h4>💡 Dicas de preparo</h4><ul>${r.tips.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>` : ''}
          ${r.mistakes?.length ? `<div class="note-card mist"><h4>🚫 Erros comuns</h4><ul>${r.mistakes.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>` : ''}
          <div class="note-card result"><h4>🍽️ Resultado final</h4><p style="font-size:15px">${esc(r.result)}</p></div>
        </section>` : ''}

        ${nut ? `<section class="block">
          <div class="block-head"><h2 class="h2">Informação nutricional</h2></div>
          <div class="nutri"><div class="grid">
            <div><b>${nut.kcal}</b><small>kcal</small></div><div><b>${nut.prot} g</b><small>proteínas</small></div>
            <div><b>${nut.carb} g</b><small>carboidratos</small></div><div><b>${nut.fat} g</b><small>gorduras</small></div></div>
            <p class="disc">${icon('info')}<span>Valores <b>estimados e aproximados</b> por ${{ unidades: 'unidade', fatias: 'fatia', tapiocas: 'tapioca' }[r.yieldUnit] || 'porção'}${nut.note && !/^Por /.test(nut.note) ? ` (${esc(nut.note.replace(/\.$/, '').toLowerCase())})` : ''}, calculados a partir de tabelas gerais de alimentos. Variam conforme marcas e quantidades e não são orientação médica ou nutricional.</span></p>
          </div></section>` : ''}

        <section class="block" id="my-photos-wrap" hidden><div class="block-head"><h2 class="h2">📸 Meus pratos</h2></div><div class="my-photos" id="my-photos"></div></section>
      </div>

      <div class="bottom-cta">
        <button class="btn btn-primary btn-lg" data-start>${icon('play')} ${cooking ? `Continuar do passo ${cooking.step + 1}` : 'Começar receita'}</button>
      </div>`;
  },

  mount(root, { params }) {
    const r = getRecipe(params.id);
    if (!r) { root.querySelector('[data-back]').onclick = () => back(); return; }
    addHistory(r.id, 'view');

    photosOf(r.id).then((list) => {
      if (!list.length) return;
      $('#my-photos-wrap', root).hidden = false;
      $('#my-photos', root).innerHTML = list.map((p) => `<img src="${urlFor(p)}" alt="Foto do seu ${esc(r.name)}">`).join('');
    });

    const refreshIngs = () => {
      $('#ings', root).innerHTML = ingredientsHtml(r);
      $('#sep', root).innerHTML = sepProgress(r);
      $('#journey', root).innerHTML = journey(r);
    };

    root.addEventListener('click', (e) => {
      const b = e.target.closest('button, a[data-scroll]');
      if (!b) return;
      if ('back' in b.dataset) back();
      else if ('share' in b.dataset) share(r);
      else if (b.dataset.ing != null) {
        const on = toggleCheck(r.id, +b.dataset.ing);
        b.classList.toggle('on', on);
        b.setAttribute('aria-pressed', on);
        vibrate(on ? 15 : 0);
        $('#sep', root).innerHTML = sepProgress(r);
        $('#journey', root).innerHTML = journey(r);
        if ((state.checks[r.id]?.length || 0) === r.ingredients.length) toast('✅ Tudo separado! Agora confira os utensílios.');
      } else if (b.dataset.serv) {
        const cur = state.servings[r.id] || r.servings;
        const next = Math.max(1, Math.min(r.yieldUnit ? 200 : 40, cur + +b.dataset.serv * (r.servings >= 20 ? 5 : 1)));
        if (next === cur) return;
        setServings(r.id, next);
        const o = $('#serv-out', root);
        o.textContent = next;
        o.classList.remove('bump'); void o.offsetWidth; o.classList.add('bump');
        $('#serv-lbl', root).textContent = yieldLabel(r, next) + (next !== r.servings ? ` · original: ${r.servings}` : '');
        $('#stat-serv', root).textContent = next;
        refreshIngs();
      } else if ('addAll' in b.dataset) {
        const n = addFromRecipe(r, r.ingredients.filter((x) => !x.optional), factorOf(r));
        toast(`🛒 ${n} ingredientes na lista`, { label: 'Ver lista', fn: () => go('#/lista') });
      } else if ('addMissing' in b.dataset) {
        const miss = r.ingredients.filter((x, i) => !isChecked(r.id, i) && !x.optional);
        if (!miss.length) { toast('Você já marcou todos como separados 🙌'); return; }
        const n = addFromRecipe(r, miss, factorOf(r));
        toast(`🛒 ${n} ingredientes que faltam na lista`, { label: 'Ver lista', fn: () => go('#/lista') });
      } else if ('lists' in b.dataset) listsSheet(r);
      else if (b.dataset.step != null) {
        startCooking(r.id, state.servings[r.id] || r.servings, +b.dataset.step);
        go(`#/cozinhar/${r.id}`);
      } else if ('start' in b.dataset) {
        const c = state.cooking?.id === r.id ? state.cooking : null;
        startCooking(r.id, state.servings[r.id] || r.servings, c ? c.step : 0);
        go(`#/cozinhar/${r.id}`);
      } else if (b.dataset.scroll) {
        e.preventDefault();
        $(`#${b.dataset.scroll}`, root)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    // Botão "Favoritar/Salva" acompanha o coração do topo.
    const syncFav = () => { const b = $('[data-lists]', root); if (b) b.innerHTML = `${icon('heart')} ${isFav(r.id) ? 'Salva' : 'Favoritar'}`; };
    addEventListener('fav-changed', syncFav);
    return () => { removeEventListener('fav-changed', syncFav); releaseUrls(); };
  },
};

