'use strict';
// Tocador: a música é o relógio. Cada quadro é desenhado a partir do tempo do áudio.
(() => {
  const $ = id => document.getElementById(id);
  const audio = $('musica'), pos = $('pos'), tempo = $('tempo'), tocar = $('tocar'), capa = $('capa');
  const render = /[?&]render\b/.test(location.search);
  if (render) {   // modo de gravação do vídeo: o script chama T.seek(t) quadro a quadro
    document.body.classList.add('render');
    T.seek(0);
    (document.fonts ? document.fonts.load('700 100px Fredoka').then(() => document.fonts.ready) : Promise.resolve()).then(() => { T.seek(0); window.PRONTO = true; });
    return;
  }
  const fmt = s => floor(s / 60) + ':' + String(floor(s % 60)).padStart(2, '0');
  const floor = Math.floor;
  let base = 0, baseNow = 0, arrastando = false;
  const agora = () => {      // tempo suave: o currentTime do áudio anda aos saltos em alguns celulares
    if (audio.paused) return audio.currentTime;
    const est = base + (performance.now() - baseNow) / 1000;
    if (Math.abs(est - audio.currentTime) > 0.12) { base = audio.currentTime; baseNow = performance.now(); return base; }
    return est;
  };
  const desenha = () => {
    const t = Math.min(agora(), T.DUR);
    T.seek(t);
    if (!arrastando) pos.value = t;
    tempo.textContent = fmt(t) + ' / 2:17';
    tocar.textContent = audio.paused ? '▶' : '⏸';
    requestAnimationFrame(desenha);
  };
  const alterna = () => { if (audio.paused) { if (audio.currentTime >= T.DUR - 0.05) audio.currentTime = 0; audio.play(); capa.style.display = 'none'; } else audio.pause(); };
  audio.addEventListener('playing', () => { base = audio.currentTime; baseNow = performance.now(); });
  audio.addEventListener('seeked', () => { base = audio.currentTime; baseNow = performance.now(); });
  tocar.onclick = alterna; capa.onclick = alterna; $('palco').onclick = alterna;
  $('inicio').onclick = () => { audio.currentTime = 0; audio.play(); capa.style.display = 'none'; };
  pos.oninput = () => { arrastando = true; audio.currentTime = +pos.value; };
  pos.onchange = () => { arrastando = false; };
  $('cheia').onclick = () => { const q = $('quadro'); if (document.fullscreenElement) document.exitFullscreen(); else if (q.requestFullscreen) q.requestFullscreen().then(() => screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape').catch(() => { })).catch(() => { }); };
  document.addEventListener('keydown', e => { if (e.code === 'Space') { e.preventDefault(); alterna(); } });
  const t0 = +(new URLSearchParams(location.search).get('t') || 0); if (t0) audio.currentTime = t0;
  requestAnimationFrame(desenha);
})();
