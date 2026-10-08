/* Aviso de fim de timer: som, vibração e notificação (quando o app está em segundo plano). */
import { state } from './store.js';
import { vibrate } from './util.js';

let ctx = null;
/** O navegador só libera áudio depois de um toque; chame isto em qualquer clique. */
export function unlockAudio() {
  try {
    ctx ||= new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
  } catch { /* sem áudio */ }
}

function chime() {
  if (!ctx || !state.profile.sound) return;
  const now = ctx.currentTime;
  [0, 0.28, 0.56, 1.1, 1.38, 1.66].forEach((t, i) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = i % 3 === 2 ? 1318.5 : 987.8;
    g.gain.setValueAtTime(0.0001, now + t);
    g.gain.exponentialRampToValueAtTime(0.25, now + t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.25);
    o.connect(g).connect(ctx.destination);
    o.start(now + t);
    o.stop(now + t + 0.3);
  });
}

export function alarm(t) {
  chime();
  vibrate([300, 120, 300, 120, 600]);
  if (document.visibilityState === 'hidden' && 'Notification' in window && Notification.permission === 'granted') {
    const opts = { body: `${t.label} — pode seguir para a próxima etapa.`, icon: 'icon-192.png', tag: t.id, renotify: true };
    navigator.serviceWorker?.getRegistration().then((reg) => reg ? reg.showNotification('🔔 Tempo concluído!', opts) : new Notification('🔔 Tempo concluído!', opts)).catch(() => {});
  }
  window.dispatchEvent(new CustomEvent('timer-done', { detail: t }));
}

export async function askNotifications() {
  if (!('Notification' in window) || Notification.permission !== 'default') return;
  try { await Notification.requestPermission(); } catch { /* ignorado */ }
}
