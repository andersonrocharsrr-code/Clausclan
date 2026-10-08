/* 👤 Perfil: minha cozinha (números), meus pratos, preferências alimentares e ajustes. */
import { state, setProfile, listIds, resetAll, flush } from '../core/store.js';
import { DIETS, RESTRICTIONS, LEVELS, TIME_AVAILABLE } from '../data/categories.js';
import { INGREDIENTS } from '../data/ingredients.js';
import { suggestIngredients } from '../core/pantry.js';
import { allPhotos, urlFor, releaseUrls, shrink, clearPhotos } from '../core/photos.js';
import { getRecipe } from '../core/repo.js';
import { esc, $ } from '../core/util.js';
import { foodIcon } from '../ui/icons-food.js';
import { icon } from '../ui/icons.js';
import { toast, confirmSheet } from '../ui/overlay.js';
import { askNotifications } from '../core/sound.js';

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function stats() {
  const fav = listIds('fav').length;
  const cooked = Object.values(state.cooked).reduce((a, v) => a + v.length, 0);
  const rated = Object.keys(state.ratings).length;
  return `<div class="k"><div class="e">❤️</div><b>${fav}</b><small>Receitas favoritas</small></div>
    <div class="k"><div class="e">👨‍🍳</div><b>${cooked}</b><small>Receitas preparadas</small></div>
    <div class="k"><div class="e">⭐</div><b>${rated}</b><small>Avaliações feitas</small></div>`;
}

function prefsHtml() {
  const p = state.profile;
  const chips = (obj, key, sel) => Object.entries(obj).map(([k, v]) => `<button class="chip ${sel.includes(k) ? 'on' : ''}" data-${key}="${k}">${v.emoji ? `${v.emoji} ` : ''}${v.label}</button>`).join('');
  return `
    <div class="pref"><h4>🥗 Preferências alimentares</h4><p>Usadas para sugerir receitas “Para você” na Início.</p><div class="chips">${chips(DIETS, 'diet', p.diets)}</div></div>
    <div class="pref"><h4>🚫 Restrições alimentares</h4><p>Receitas com esses itens recebem um aviso e podem ser escondidas na busca.</p><div class="chips">${chips(RESTRICTIONS, 'restr', p.restrictions)}</div></div>
    <div class="pref"><h4>🙅 Ingredientes que não gosto</h4><p>Avisamos quando uma receita leva algum deles.</p>
      <div class="chips" id="dislikes">${p.dislikes.map((id) => `<button class="chip on" data-undislike="${id}">${esc(cap(INGREDIENTS[id]?.n || id))} <span class="x">${icon('close')}</span></button>`).join('')}</div>
      <div style="position:relative;margin-top:10px"><label class="searchbox" style="min-height:48px;box-shadow:none;border:1.5px solid var(--line)">${icon('plus')}<input id="dis-in" placeholder="Adicionar ingrediente" aria-label="Ingrediente que não gosta" style="height:46px"></label>
      <div class="suggest" id="dis-sug" hidden style="left:0;right:0;top:54px"></div></div></div>
    <div class="pref"><h4>👩‍🍳 Nível de experiência</h4><p>Ajuda a priorizar receitas no seu ritmo.</p><div class="opt-list">${Object.entries(LEVELS).map(([k, l]) => `<button class="opt ${p.level === k ? 'on' : ''}" data-level="${k}"><span class="radio"></span><span><b>${l.label}</b><small>${l.desc}</small></span></button>`).join('')}</div></div>
    <div class="pref"><h4>⏱ Tempo disponível para cozinhar</h4><p>No dia a dia, quanto tempo você costuma ter?</p><div class="chips">${Object.entries(TIME_AVAILABLE).map(([k, l]) => `<button class="chip ${String(p.time) === k ? 'on' : ''}" data-time="${k}">${l}</button>`).join('')}</div></div>`;
}

function settingsHtml() {
  const p = state.profile;
  const perm = 'Notification' in window ? Notification.permission : 'unsupported';
  return `<div class="pref"><h4>⚙️ Ajustes</h4>
    <button class="setting" style="width:100%;text-align:left" data-toggle="sound"><span class="t">Som do timer<small>Toca um aviso quando o tempo acaba</small></span><span class="switch ${p.sound ? 'on' : ''}"></span></button>
    <button class="setting" style="width:100%;text-align:left" data-toggle="wake"><span class="t">Manter a tela acesa<small>Enquanto você estiver no modo passo a passo</small></span><span class="switch ${p.wake ? 'on' : ''}"></span></button>
    <button class="setting" style="width:100%;text-align:left" data-notif ${perm === 'unsupported' ? 'disabled' : ''}><span class="t">Avisos com o app em segundo plano<small>${perm === 'granted' ? 'Ativados' : perm === 'denied' ? 'Bloqueados nas configurações do navegador' : perm === 'unsupported' ? 'Não disponível neste navegador' : 'Toque para permitir'}</small></span><span class="switch ${perm === 'granted' ? 'on' : ''}"></span></button>
    <a class="setting" href="#/favoritos?aba=recentes"><span class="t">🕘 Histórico de receitas<small>Últimas receitas vistas e preparadas</small></span>${icon('right')}</a>
    <button class="setting" style="width:100%;text-align:left" data-export><span class="t">💾 Fazer backup<small>Baixa um arquivo com seus dados</small></span>${icon('right')}</button>
    <label class="setting" style="cursor:pointer"><span class="t">📂 Restaurar backup<small>Usa um arquivo salvo antes</small></span>${icon('right')}<input type="file" accept="application/json,.json" hidden data-import></label>
    <button class="setting" style="width:100%;text-align:left;color:var(--danger)" data-reset><span class="t">🗑️ Apagar meus dados<small>Favoritos, lista, histórico e preferências</small></span></button></div>`;
}

export default {
  tab: 'profile',
  title: 'Perfil',
  render() {
    const p = state.profile;
    return `
      <header class="topbar"><div class="title"><p class="eyebrow">Sua conta</p><h1 class="h1">Perfil</h1></div></header>
      <section class="profile-card rise">
        <label class="avatar" style="cursor:pointer" aria-label="Trocar foto">${p.photo ? `<img src="${p.photo}" alt="Sua foto">` : esc([...(p.name || '🙂')][0].toUpperCase())}
          <span class="cam">${icon('camera')}</span><input type="file" accept="image/*" hidden data-avatar></label>
        <input class="name-in" id="pname" value="${esc(p.name)}" placeholder="Seu nome" aria-label="Seu nome" maxlength="40">
        <span class="lvl">${LEVELS[p.level]?.label || 'Iniciante'} na cozinha</span>
      </section>
      <h2 class="h2" style="padding:24px 20px 0">Minha cozinha</h2>
      <div class="kitchen" id="kitchen">${stats()}</div>
      <section class="pref" id="gal-wrap" hidden><h4>📸 Meus pratos</h4><p>Fotos que você tirou ao concluir receitas.</p><div class="gallery" id="gal"></div></section>
      <h2 class="h2" style="padding:24px 20px 0">Preferências</h2>
      <div id="prefs">${prefsHtml()}</div>
      <div id="settings">${settingsHtml()}</div>
      <p class="disclaimer">Tempero · Do primeiro ingrediente ao prato pronto.<br>Tempos e informações nutricionais são estimativas. Siga sempre as orientações de segurança dos seus utensílios.
        Seus dados ficam salvos somente neste aparelho.</p>`;
  },
  mount(root) {
    const p = state.profile;
    allPhotos().then((list) => {
      if (!list.length) return;
      $('#gal-wrap', root).hidden = false;
      $('#gal', root).innerHTML = list.slice(0, 12).map((ph) => `<a href="#/receita/${ph.recipeId}"><img src="${urlFor(ph)}" alt="${esc(getRecipe(ph.recipeId)?.name || 'Prato')}"></a>`).join('');
    });

    const name = $('#pname', root);
    name.addEventListener('change', () => { setProfile({ name: name.value.trim() }); toast('Nome salvo'); });
    name.addEventListener('keydown', (e) => { if (e.key === 'Enter') name.blur(); });

    $('[data-avatar]', root).addEventListener('change', async (e) => {
      const f = e.target.files?.[0];
      if (!f) return;
      const blob = await shrink(f, 256);
      const reader = new FileReader();
      reader.onload = () => {
        setProfile({ photo: reader.result });
        root.querySelector('.profile-card .avatar').innerHTML = `<img src="${reader.result}" alt="Sua foto"><span class="cam">${icon('camera')}</span><input type="file" accept="image/*" hidden data-avatar>`;
        toast('📸 Foto atualizada');
      };
      reader.readAsDataURL(blob);
    });

    const redrawPrefs = () => { $('#prefs', root).innerHTML = prefsHtml(); bindDislike(); };
    const bindDislike = () => {
      const inp = $('#dis-in', root), sug = $('#dis-sug', root);
      inp.addEventListener('input', () => {
        const ids = suggestIngredients(inp.value, p.dislikes);
        sug.hidden = !ids.length;
        sug.innerHTML = ids.map((id) => `<button type="button" data-dislike="${id}">${foodIcon(id, 32)}${esc(cap(INGREDIENTS[id].n))}</button>`).join('');
      });
      inp.addEventListener('blur', () => setTimeout(() => { sug.hidden = true; }, 200));
    };
    bindDislike();

    root.addEventListener('click', async (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      const tog = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
      if (b.dataset.diet) { setProfile({ diets: tog(p.diets, b.dataset.diet) }); redrawPrefs(); }
      else if (b.dataset.restr) { setProfile({ restrictions: tog(p.restrictions, b.dataset.restr) }); redrawPrefs(); }
      else if (b.dataset.dislike) { setProfile({ dislikes: [...p.dislikes, b.dataset.dislike] }); redrawPrefs(); }
      else if (b.dataset.undislike) { setProfile({ dislikes: p.dislikes.filter((x) => x !== b.dataset.undislike) }); redrawPrefs(); }
      else if (b.dataset.level) { setProfile({ level: b.dataset.level }); redrawPrefs(); root.querySelector('.lvl').textContent = `${LEVELS[p.level].label} na cozinha`; }
      else if (b.dataset.time != null) { setProfile({ time: +b.dataset.time }); redrawPrefs(); }
      else if (b.dataset.toggle) { setProfile({ [b.dataset.toggle]: !p[b.dataset.toggle] }); b.querySelector('.switch').classList.toggle('on', p[b.dataset.toggle]); }
      else if ('notif' in b.dataset) { await askNotifications(); $('#settings', root).innerHTML = settingsHtml(); }
      else if ('export' in b.dataset) {
        flush();
        const blob = new Blob([localStorage.getItem('tempero:v1') || '{}'], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `tempero-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      } else if ('reset' in b.dataset) {
        if (await confirmSheet({ title: 'Apagar todos os seus dados?', text: 'Favoritos, lista de compras, histórico, fotos e preferências serão removidos deste aparelho.', ok: 'Apagar tudo', danger: true })) {
          resetAll();
          await clearPhotos();
          localStorage.removeItem('tempero:timers');
          location.hash = '#/';
          location.reload();
        }
      }
    });

    root.querySelector('[data-import]').addEventListener('change', async (e) => {
      const f = e.target.files?.[0];
      if (!f) return;
      try {
        const data = JSON.parse(await f.text());
        if (!data || typeof data !== 'object' || !('favorites' in data)) throw new Error('arquivo inválido');
        localStorage.setItem('tempero:v1', JSON.stringify(data));
        toast('Backup restaurado');
        setTimeout(() => location.reload(), 600);
      } catch { toast('Esse arquivo não é um backup do Tempero.'); }
    });

    return releaseUrls;
  },
};
