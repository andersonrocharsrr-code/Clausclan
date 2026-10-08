/* Folhas inferiores (bottom sheets), avisos (toasts) e confirmações. */
import { $ } from '../core/util.js';

let toastTimer = null;

/** Aviso rápido. `action` = { label, fn } opcional (ex.: Desfazer). */
export function toast(msg, action, ms = 3200) {
  document.querySelector('.toast')?.remove();
  clearTimeout(toastTimer);
  const el = document.createElement('div');
  el.className = 'toast';
  el.setAttribute('role', 'status');
  el.innerHTML = `<span>${msg}</span>${action ? `<button type="button">${action.label}</button>` : ''}`;
  document.body.appendChild(el);
  if (action) el.querySelector('button').onclick = () => { action.fn(); hide(); };
  const hide = () => { el.classList.add('out'); setTimeout(() => el.remove(), 260); };
  toastTimer = setTimeout(hide, ms);
}

/**
 * Abre uma folha inferior. `render(close)` devolve o HTML; `mount(el, close)` liga os eventos.
 * Retorna a função de fechar.
 */
export function sheet({ html, mount, label = 'Painel', onClose }) {
  closeSheet(true);
  const scrim = document.createElement('div');
  scrim.className = 'scrim';
  const el = document.createElement('div');
  el.className = 'sheet';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-label', label);
  el.innerHTML = `<div class="grab" aria-hidden="true"></div>${html}`;
  document.body.append(scrim, el);
  document.body.style.overflow = 'hidden';

  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    scrim.classList.add('closing');
    el.classList.add('closing');
    document.body.style.overflow = '';
    removeEventListener('keydown', onKey);
    setTimeout(() => { scrim.remove(); el.remove(); }, 240);
    onClose?.();
  };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  addEventListener('keydown', onKey);
  scrim.onclick = close;

  // Arrastar para baixo fecha.
  let y0 = null;
  el.addEventListener('touchstart', (e) => { if (el.scrollTop <= 0) y0 = e.touches[0].clientY; }, { passive: true });
  el.addEventListener('touchmove', (e) => {
    if (y0 == null) return;
    const dy = e.touches[0].clientY - y0;
    if (dy > 0) el.style.transform = `translate(-50%, ${dy}px)`;
  }, { passive: true });
  el.addEventListener('touchend', (e) => {
    if (y0 == null) return;
    const dy = e.changedTouches[0].clientY - y0;
    y0 = null;
    if (dy > 90) close(); else el.style.transform = '';
  });

  el._close = close;
  mount?.(el, close);
  setTimeout(() => el.querySelector('[autofocus]')?.focus(), 350);
  return close;
}

export function closeSheet(instant) {
  const el = $('.sheet');
  if (!el) return;
  if (instant) { document.querySelectorAll('.sheet, .scrim').forEach((x) => x.remove()); document.body.style.overflow = ''; return; }
  el._close?.();
}

/** Confirmação simples em folha. Resolve true/false. */
export function confirmSheet({ title, text, ok = 'Confirmar', cancel = 'Cancelar', danger = false }) {
  return new Promise((resolve) => {
    let answered = false;
    sheet({
      label: title,
      html: `<h3>${title}</h3>${text ? `<p class="sub">${text}</p>` : ''}
        <div class="sheet-actions"><button class="btn btn-ghost" data-a="no">${cancel}</button><button class="btn ${danger ? 'btn-dark' : 'btn-primary'}" data-a="yes">${ok}</button></div>`,
      mount: (el, close) => {
        el.querySelector('[data-a=yes]').onclick = () => { answered = true; resolve(true); close(); };
        el.querySelector('[data-a=no]').onclick = () => close();
      },
      onClose: () => { if (!answered) resolve(false); },
    });
  });
}
