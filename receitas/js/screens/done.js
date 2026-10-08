/* "Receita concluída!": comemoração, prato pronto e próximos passos (favoritar, foto, avaliar, refazer). */
import { getRecipe } from '../core/repo.js';
import { state, isFav, toggleFav, rate, startCooking } from '../core/store.js';
import { addPhoto } from '../core/photos.js';
import { esc, fmtMinutes, prefersReducedMotion, vibrate } from '../core/util.js';
import { dishArt } from '../ui/art-dishes.js';
import { sheet, toast } from '../ui/overlay.js';
import { go } from '../core/router.js';

function confetti(root) {
  if (prefersReducedMotion()) return;
  const box = document.createElement('div');
  box.className = 'confetti';
  const colors = ['#C8603F', '#E3A93B', '#5E8B67', '#E58A5F', '#F2C94C', '#4D86B0'];
  for (let i = 0; i < 70; i++) {
    const c = document.createElement('i');
    c.style.left = `${Math.random() * 100}%`;
    c.style.background = colors[i % colors.length];
    c.style.animationDuration = `${2.2 + Math.random() * 2}s`;
    c.style.animationDelay = `${Math.random() * 0.8}s`;
    c.style.transform = `rotate(${Math.random() * 360}deg)`;
    if (i % 3 === 0) c.style.borderRadius = '50%';
    box.appendChild(c);
  }
  root.querySelector('.done-screen').prepend(box);
  setTimeout(() => box.remove(), 5200);
}

function rateSheet(r, onDone) {
  let stars = state.ratings[r.id]?.stars || 0;
  const labels = ['', 'Não gostei', 'Poderia ser melhor', 'Boa', 'Muito boa!', 'Perfeita! 🤩'];
  const body = () => `<div class="stars-input" role="radiogroup" aria-label="Nota">${[1, 2, 3, 4, 5].map((n) => `<button class="${n <= stars ? 'on' : ''}" data-s="${n}" role="radio" aria-checked="${n === stars}" aria-label="${n} estrelas">★</button>`).join('')}</div>
    <p style="text-align:center;font-weight:750;min-height:24px">${labels[stars]}</p>`;
  sheet({
    label: 'Avaliar receita',
    html: `<h3 style="text-align:center">Como ficou?</h3><p class="sub" style="text-align:center">Sua avaliação de ${esc(r.name)}</p><div id="st">${body()}</div>
      <div class="sheet-actions"><button class="btn btn-primary" data-save disabled>Salvar avaliação</button></div>`,
    mount: (el, close) => el.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.s) { stars = +b.dataset.s; vibrate(10); el.querySelector('#st').innerHTML = body(); el.querySelector('[data-save]').disabled = false; }
      if ('save' in b.dataset) { rate(r.id, stars); close(); toast('⭐ Obrigado pela avaliação!'); onDone(); }
    }),
  });
}

export default {
  fullscreen: true,
  title: 'Receita concluída',
  render({ params }) {
    const r = getRecipe(params.id);
    if (!r) return '<div class="empty"><h3>Receita não encontrada</h3><a class="btn btn-primary" href="#/">Início</a></div>';
    const took = +(sessionStorage.getItem('tempero:took') || 0);
    const times = state.cooked[r.id]?.length || 1;
    const my = state.ratings[r.id]?.stars;
    return `<div class="done-screen">
      <p class="eyebrow" style="animation:rise .5s both">Do primeiro ingrediente ao prato pronto</p>
      <div class="art-circle">${dishArt(r)}</div>
      <h1 class="h1 big">🎉 Receita concluída!</h1>
      <p class="lead">Sua receita está pronta! ${esc(r.result)}</p>
      <div class="stats-done">${took ? `<span>⏱ ${fmtMinutes(took)} de preparo</span>` : ''}<span>👨‍🍳 ${times === 1 ? 'Primeira vez!' : `${times}ª vez que você faz`}</span><span>✅ ${r.steps.length} etapas</span></div>

      <div class="done-actions">
        <button class="act ${isFav(r.id) ? 'on' : ''}" data-fav-done><span class="e">❤️</span>${isFav(r.id) ? 'Favoritada' : 'Favoritar'}<small>Guarde para fazer de novo</small></button>
        <label class="act" style="cursor:pointer"><span class="e">📸</span>Adicionar foto<small>do meu prato</small><input type="file" accept="image/*" capture="environment" hidden data-photo></label>
        <button class="act ${my ? 'on' : ''}" data-rate><span class="e">⭐</span>${my ? `Você deu ${my}★` : 'Avaliar receita'}<small>Conte como ficou</small></button>
        <button class="act" data-again><span class="e">🔄</span>Fazer novamente<small>Começar do passo 1</small></button>
        <a class="act" href="#/receita/${r.id}"><span class="e">🛒</span>Ver ingredientes<small>e adicionar à lista</small></a>
        <a class="act" href="#/"><span class="e">🏠</span>Voltar ao início<small>Escolher outra receita</small></a>
      </div>
      <div id="photo-prev" style="margin-top:18px"></div>
    </div>`;
  },
  mount(root, { params }) {
    const r = getRecipe(params.id);
    if (!r) return;
    confetti(root);
    vibrate([40, 60, 40, 60, 120]);

    root.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if ('favDone' in b.dataset) {
        const on = toggleFav(r.id);
        b.classList.toggle('on', on);
        b.childNodes[1].textContent = on ? 'Favoritada' : 'Favoritar';
        toast(on ? '❤️ Salva nas favoritas' : 'Removida das favoritas');
      } else if ('rate' in b.dataset) rateSheet(r, () => { b.classList.add('on'); b.childNodes[1].textContent = `Você deu ${state.ratings[r.id].stars}★`; });
      else if ('again' in b.dataset) { startCooking(r.id, state.servings[r.id] || r.servings, 0); state.cooking.done = []; state.cooking.startedAt = Date.now(); go(`#/cozinhar/${r.id}`); }
    });

    root.querySelector('[data-photo]').addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const rec = await addPhoto(r.id, file);
        const url = URL.createObjectURL(rec.blob);
        root.querySelector('#photo-prev').innerHTML = `<img src="${url}" alt="Foto do seu prato" style="width:100%;border-radius:24px;box-shadow:var(--sh-2);animation:rise .5s both">`;
        toast('📸 Foto salva em Meus pratos');
      } catch {
        toast('Não foi possível salvar a foto neste aparelho.');
      }
    });
  },
};
