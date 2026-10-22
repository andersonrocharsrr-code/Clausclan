/* Calhamaço — introdução ao abrir o app.
   Roda antes do resto (é o primeiro script do <body>), então o livro fechado já está na tela no primeiro quadro.
   A animação (capa abre, folhas viram, linhas se escrevem, nome aparece) só começa quando o app avisa que a
   estante está pronta (introPronta) e a fonte do nome carregou; assim o celular não pula quadros.
   Toque em qualquer lugar para pular. O menu da estante permite rever ou desligar (localStorage 'calh-intro'). */
(function () {
  const INTRO_MS = 3250;
  let pronta = null;
  const prontaP = new Promise((r) => { pronta = r; });
  window.introPronta = () => pronta();

  function showIntro(ready = Promise.resolve()) {
    document.querySelectorAll('.intro').forEach((x) => x.remove());
    const el = document.createElement('div'); el.className = 'intro'; el.setAttribute('role', 'presentation');
    const nome = 'Calhamaço';
    el.innerHTML = `<div class="in-wrap">
      <div class="in-stage"><div class="in-book">
        <div class="in-page"><i class="in-cap"></i><i class="in-orn">✦ ❦ ✦</i>
          <p><b class="in-drop"></b>${[92, 84, 96, 70, 100, 88, 94, 60].map((w, i) => `<i class="ln" style="--w:${w}%;--d:${(1.4 + i * .11).toFixed(2)}s"></i>`).join('')}</p>
          <i class="in-pen"></i><i class="in-ribbon"></i></div>
        ${[0, 1, 2].map((i) => `<div class="in-leaf" style="--i:${i}"></div>`).join('')}
        <div class="in-cover"><div class="in-front"><span class="in-frame"><b>C</b><i>✦ ✦ ✦</i></span></div><div class="in-inside"><i>❦</i></div></div>
      </div><div class="in-shadow"></div></div>
      <h1 class="in-name" aria-label="${nome}">${[...nome].map((c, i) => `<span style="--d:${(1.1 + i * .05).toFixed(2)}s">${c}</span>`).join('')}</h1>
      <svg class="in-swash" viewBox="0 0 220 18" aria-hidden="true"><path d="M4 12 C 50 2, 90 18, 130 9 S 196 4, 216 10"/></svg>
      <p class="in-tag">escreva o seu livro</p>
    </div><button class="in-skip">Pular</button>`;
    document.body.appendChild(el);
    let done = false;
    const finish = () => { if (done) return; done = true; el.classList.add('out'); setTimeout(() => el.remove(), 650); };
    el.addEventListener('click', finish);
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const fontes = document.fonts ? document.fonts.load('600 44px Fraunces').catch(() => {}) : null;
    Promise.race([Promise.all([ready, fontes]), wait(1500)])
      .then(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
      .then(() => { if (done) return; el.classList.add('go'); return wait(INTRO_MS); })
      .then(() => ready).then(finish, finish);
  }
  window.showIntro = showIntro;

  let on = true;
  try { on = JSON.parse(localStorage.getItem('calh-intro') ?? 'true') !== false; } catch (e) { /* sem acesso: mostra */ }
  if (on && !matchMedia('(prefers-reduced-motion: reduce)').matches) showIntro(prontaP);
})();
