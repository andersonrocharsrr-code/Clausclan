/* Último Dia — laço principal. */
'use strict';

let last = performance.now(), visT = 0, saveT = 0;
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (S && UI.playing) {
    inputFrame();
    if (!G.paused && !S.dead) {
      const total = dt * G.speed, n = Math.max(1, Math.ceil(total / 0.05));
      for (let k = 0; k < n && !S.dead; k++) step(total / n);
    }
    visT -= dt; if (visT <= 0) { visT = 0.08; computeVis(); }
    updateFx(dt);
    audioFrame(dt);
    render(now);
    UI.hud(dt);
    saveT += dt; if (saveT > 30) { saveT = 0; saveGame(); }
  }
  requestAnimationFrame(frame);
}
document.addEventListener('visibilitychange', () => { if (document.hidden && S && UI.playing) saveGame(); });
window.addEventListener('pagehide', () => { if (S && UI.playing) saveGame(); });
UI.start();
requestAnimationFrame(frame);
