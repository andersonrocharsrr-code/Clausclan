/* Último Dia — controles: teclado + mouse no computador, joystick e botões no celular. */
'use strict';

const keys = new Set();
const touchMode = matchMedia('(pointer: coarse)').matches;
G.mouse = null; // posição do mouse na tela (para mirar)
document.body.classList.toggle('touch', touchMode);

function updateMoveFromKeys() {
  let x = 0, y = 0;
  if (keys.has('KeyA') || keys.has('ArrowLeft')) x--;
  if (keys.has('KeyD') || keys.has('ArrowRight')) x++;
  if (keys.has('KeyW') || keys.has('ArrowUp')) y--;
  if (keys.has('KeyS') || keys.has('ArrowDown')) y++;
  if (x || y || G.input.kbd) { const l = Math.hypot(x, y) || 1; G.input.smv = { x: x / l, y: y / l }; G.input.mv = screenDirToWorld(x / l, y / l); G.input.kbd = true; }
}
window.addEventListener('keydown', (e) => {
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
  if (!S || S.dead || !UI.playing) return;
  if (e.code === 'Escape') { if (UI.panelOpen()) UI.closePanel(); else if (G.buildSel) UI.cancelBuild(); else UI.openMenu(); e.preventDefault(); return; }
  if (UI.panelOpen()) { if (e.code === 'Tab' || e.code === 'KeyI') { UI.closePanel(); e.preventDefault(); } return; }
  keys.add(e.code);
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Tab'].includes(e.code)) e.preventDefault();
  updateMoveFromKeys();
  if (e.repeat) return;
  switch (e.code) {
    case 'ShiftLeft': case 'ShiftRight': G.input.run = true; break;
    case 'KeyC': case 'ControlLeft': G.input.sneak = !G.input.sneak; UI.refreshButtons(); break;
    case 'Space': if (G.buildSel) UI.confirmBuild(); else G.input.attack = true; break;
    case 'KeyE': UI.interact(); break;
    case 'KeyI': case 'Tab': UI.openInventory(); break;
    case 'KeyB': UI.openBuild(); break;
    case 'KeyM': UI.openMap(); break;
    case 'KeyH': UI.openHealth(); break;
    case 'KeyK': UI.openSkills(); break;
    case 'KeyR': reload(); break;
    case 'KeyF': UI.toggleLight(); break;
    case 'KeyZ': UI.sleepHere(); break;
    case 'Equal': case 'NumpadAdd': zoomBy(1.15); break;
    case 'Minus': case 'NumpadSubtract': zoomBy(1 / 1.15); break;
  }
});
window.addEventListener('keyup', (e) => {
  keys.delete(e.code);
  if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') G.input.run = false;
  if (e.code === 'Space') G.input.attack = false;
  updateMoveFromKeys();
  if (!keys.size && G.input.kbd) { G.input.mv = { x: 0, y: 0 }; G.input.smv = { x: 0, y: 0 }; }
});
window.addEventListener('blur', () => { keys.clear(); G.input.mv = { x: 0, y: 0 }; G.input.attack = false; G.input.run = false; });

/* ---------- mouse ---------- */
cv.addEventListener('mousemove', (e) => { if (!touchMode) G.mouse = { x: e.clientX, y: e.clientY }; });
cv.addEventListener('mouseleave', () => { G.mouse = null; });
cv.addEventListener('mousedown', (e) => {
  if (touchMode || !S || UI.panelOpen()) return;
  if (e.button === 0) { if (G.buildSel) UI.confirmBuild(); else G.input.attack = true; }
  if (e.button === 2) UI.interact();
});
window.addEventListener('mouseup', (e) => { if (e.button === 0) G.input.attack = false; });
cv.addEventListener('contextmenu', (e) => e.preventDefault());
function zoomBy(f) { G.zoom = clamp(G.zoom * f, 0.45, 2.4); }
cv.addEventListener('wheel', (e) => { zoomBy(e.deltaY > 0 ? 0.9 : 1.1); e.preventDefault(); }, { passive: false });

/* ---------- joystick de toque ---------- */
const joy = document.getElementById('joy'), knob = document.getElementById('joyKnob');
let joyId = null, joyO = null;
const JR = 52;
function joyStart(e) {
  if (joyId !== null || !S || UI.panelOpen()) return;
  // modo construção: tocar perto do jogador aponta o local
  if (G.buildSel && e.clientX > VW * 0.42) {
    const w = screenToWorld(e.clientX, e.clientY); S.player.a = Math.atan2(Math.floor(w.y) + 0.5 - S.player.y, Math.floor(w.x) + 0.5 - S.player.x); return;
  }
  if (e.clientX > VW * 0.5) return;
  joyId = e.pointerId; joyO = { x: e.clientX, y: e.clientY };
  joy.style.left = (joyO.x - 62) + 'px'; joy.style.top = (joyO.y - 62) + 'px'; joy.classList.add('on');
  G.input.kbd = false;
  joyMove(e);
}
function joyMove(e) {
  if (e.pointerId !== joyId) return;
  let dx = e.clientX - joyO.x, dy = e.clientY - joyO.y; const l = Math.hypot(dx, dy);
  if (l > JR) { dx *= JR / l; dy *= JR / l; }
  knob.style.transform = `translate(${dx}px, ${dy}px)`;
  const m = Math.min(1, l / JR);
  G.input.mv = m < 0.15 ? { x: 0, y: 0 } : screenDirToWorld((dx / (Math.hypot(dx, dy) || 1)) * m, (dy / (Math.hypot(dx, dy) || 1)) * m);
  // empurrar até a borda = correr
  G.input.runJoy = m > 0.97;
}
function joyEnd(e) {
  if (e.pointerId !== joyId) return;
  joyId = null; G.input.mv = { x: 0, y: 0 }; G.input.runJoy = false;
  knob.style.transform = ''; joy.classList.remove('on');
}
const pinch = new Map(); let pinchD = 0;
function pinchDist() { const a = [...pinch.values()]; return a.length >= 2 ? Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y) : 0; }
cv.addEventListener('pointerdown', (e) => {
  if (e.pointerType === 'mouse') return;
  if (e.clientX > VW * 0.5 || joyId !== null) { pinch.set(e.pointerId, { x: e.clientX, y: e.clientY }); pinchD = pinchDist(); if (pinch.size >= 2) return; }
  joyStart(e);
});
window.addEventListener('pointermove', (e) => {
  if (e.pointerType === 'mouse') return;
  if (pinch.has(e.pointerId)) { pinch.set(e.pointerId, { x: e.clientX, y: e.clientY }); const d = pinchDist(); if (d && pinchD) { zoomBy(d / pinchD); pinchD = d; } return; }
  joyMove(e);
});
const pEnd = (e) => { if (e.pointerType === 'mouse') return; pinch.delete(e.pointerId); pinchD = pinchDist(); joyEnd(e); };
window.addEventListener('pointerup', pEnd);
window.addEventListener('pointercancel', pEnd);

/* ---------- botões da tela ---------- */
function holdBtn(el, on, off) {
  el.addEventListener('pointerdown', (e) => { e.preventDefault(); el.setPointerCapture(e.pointerId); on(); });
  el.addEventListener('pointerup', (e) => { e.preventDefault(); off && off(); });
  el.addEventListener('pointercancel', () => off && off());
  el.addEventListener('lostpointercapture', () => off && off());
}
function inputFrame() {
  // mira do mouse convertida para o mundo a cada quadro
  G.input.aimAt = !touchMode && G.mouse && S && !S.player.inCar ? screenToWorld(G.mouse.x, G.mouse.y, 0.9) : null;
  if (touchMode) G.input.run = G.input.runToggle || G.input.runJoy;
}
