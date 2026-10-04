/* Minhas Contas — contas a pagar e cobranças a receber, com lembretes.
   Os dados ficam salvos no próprio navegador (localStorage). */
(() => {
  'use strict';

  const STORE_KEY = 'minhas-contas:v1';
  const CHECK_EVERY_MS = 20 * 1000;
  const DAY = 24 * 60 * 60 * 1000;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const fmtDate = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
  const fmtShort = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' });

  const REPEAT_LABEL = { weekly: 'semanal', monthly: 'mensal', yearly: 'anual' };

  /* ---------------- Estado ---------------- */
  let items = load();
  const ui = { type: 'all', status: 'open', search: '', editingId: null };

  function load() {
    try {
      const data = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(items));
    } catch {
      toast('Não foi possível salvar no navegador. Verifique se o modo anônimo está desligado.');
    }
  }

  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  /* ---------------- Datas ---------------- */
  const pad = (n) => String(n).padStart(2, '0');
  const toLocalISO = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  // "2026-10-04T09:00" é interpretado como horário local.
  const dueDate = (it) => new Date(it.due);
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const daysBetween = (a, b) => Math.round((startOfDay(b) - startOfDay(a)) / DAY);
  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();

  function nextDue(it) {
    const d = dueDate(it);
    if (it.repeat === 'weekly') {
      d.setDate(d.getDate() + 7);
    } else if (it.repeat === 'monthly' || it.repeat === 'yearly') {
      const day = it.anchorDay || d.getDate();
      let y = d.getFullYear();
      let m = d.getMonth() + (it.repeat === 'monthly' ? 1 : 12);
      y += Math.floor(m / 12);
      m %= 12;
      d.setFullYear(y, m, Math.min(day, daysInMonth(y, m)));
    }
    return toLocalISO(d);
  }

  function relativeLabel(it, now = new Date()) {
    const d = dueDate(it);
    const diff = daysBetween(now, d);
    const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    if (diff === 0) return d < now ? `Venceu hoje às ${time}` : `Vence hoje às ${time}`;
    if (diff === 1) return `Vence amanhã às ${time}`;
    if (diff === -1) return 'Venceu ontem';
    if (diff < 0) return `Vencido há ${-diff} dias`;
    return `Em ${diff} dias`;
  }

  /* ---------------- Valores ---------------- */
  function parseAmount(str) {
    let s = String(str).replace(/[R$\s]/g, '');
    if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
    const n = Number(s);
    return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : NaN;
  }
  const money = (cents) => brl.format(cents / 100);
  const amountInput = (cents) => (cents / 100).toFixed(2).replace('.', ',');

  const esc = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------------- Renderização ---------------- */
  function isLate(it, now) { return !it.paidAt && dueDate(it) < now; }

  function matches(it, now) {
    if (ui.type !== 'all' && it.type !== ui.type) return false;
    if (ui.search) {
      const hay = `${it.title} ${it.person || ''} ${it.category || ''} ${it.notes || ''}`.toLowerCase();
      if (!hay.includes(ui.search)) return false;
    }
    switch (ui.status) {
      case 'open': return !it.paidAt;
      case 'late': return isLate(it, now);
      case 'week': return !it.paidAt && dueDate(it) - now <= 7 * DAY;
      case 'paid': return !!it.paidAt;
      default: return true;
    }
  }

  function groupOf(it, now) {
    if (it.paidAt) return 'Pagos / recebidos';
    const diff = daysBetween(now, dueDate(it));
    if (dueDate(it) < now) return 'Vencidos';
    if (diff === 0) return 'Hoje';
    if (diff <= 7) return 'Próximos 7 dias';
    if (diff <= 31) return 'Este mês';
    return 'Mais tarde';
  }
  const GROUP_ORDER = ['Vencidos', 'Hoje', 'Próximos 7 dias', 'Este mês', 'Mais tarde', 'Pagos / recebidos'];

  function render() {
    const now = new Date();

    let pay = 0, recv = 0, late = 0;
    for (const it of items) {
      if (it.paidAt) continue;
      if (it.type === 'pagar') pay += it.amount; else recv += it.amount;
      if (isLate(it, now)) late++;
    }
    $('#sumPay').textContent = money(pay);
    $('#sumRecv').textContent = money(recv);
    $('#sumLate').textContent = String(late);
    $('#sumBal').textContent = money(recv - pay);

    const visible = items.filter((it) => matches(it, now));
    const groups = new Map(GROUP_ORDER.map((g) => [g, []]));
    for (const it of visible) groups.get(groupOf(it, now)).push(it);

    const html = [];
    for (const [name, list] of groups) {
      if (!list.length) continue;
      list.sort((a, b) => name === 'Pagos / recebidos'
        ? new Date(b.paidAt) - new Date(a.paidAt)
        : dueDate(a) - dueDate(b));
      html.push(`<div class="group"><h3>${name} · ${list.length}</h3><div class="group__items">`);
      for (const it of list) html.push(itemHTML(it, now));
      html.push('</div></div>');
    }
    $('#list').innerHTML = html.join('');
    $('#empty').hidden = visible.length > 0;

    $('#cats').innerHTML = [...new Set(items.map((i) => i.category).filter(Boolean))]
      .sort().map((c) => `<option value="${esc(c)}">`).join('');
  }

  function itemHTML(it, now) {
    const d = dueDate(it);
    let badge;
    if (it.paidAt) {
      badge = `<span class="badge badge--paid">${it.type === 'pagar' ? 'Pago' : 'Recebido'} em ${fmtShort.format(new Date(it.paidAt))}</span>`;
    } else if (d < now) {
      badge = `<span class="badge badge--late">${relativeLabel(it, now)}</span>`;
    } else if (d - now < 3 * DAY) {
      badge = `<span class="badge badge--soon">${relativeLabel(it, now)}</span>`;
    } else {
      badge = `<span class="badge">${relativeLabel(it, now)}</span>`;
    }
    const meta = [
      `📅 ${fmtDate.format(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`,
      it.person && `👤 ${esc(it.person)}`,
      it.category && `🏷️ ${esc(it.category)}`,
      it.repeat !== 'none' && `🔁 ${REPEAT_LABEL[it.repeat]}`,
      it.remind >= 0 && !it.paidAt && `🔔 ${remindLabel(it.remind)}`,
    ].filter(Boolean).map((m) => `<span>${m}</span>`).join('');
    const action = it.paidAt
      ? `<button type="button" class="btn btn--ghost btn--sm" data-undo="${it.id}">Desfazer</button>`
      : `<button type="button" class="btn btn--primary btn--sm" data-pay="${it.id}">${it.type === 'pagar' ? 'Paguei' : 'Recebi'}</button>`;
    return `
      <article class="item item--${it.type}${it.paidAt ? ' is-paid' : ''}" data-id="${it.id}" tabindex="0">
        <span class="item__bar"></span>
        <div class="item__main">
          <div class="item__title">${esc(it.title)}</div>
          <div class="item__meta">${meta}</div>
        </div>
        <div class="item__side">
          <span class="item__amount">${it.type === 'pagar' ? '−' : '+'} ${money(it.amount)}</span>
          ${badge}
          ${action}
        </div>
      </article>`;
  }

  function remindLabel(min) {
    if (min === 0) return 'no horário';
    if (min < 60) return `${min} min antes`;
    if (min < 1440) return `${min / 60} h antes`;
    if (min === 10080) return '1 semana antes';
    const d = min / 1440;
    return `${d} dia${d > 1 ? 's' : ''} antes`;
  }

  /* ---------------- Formulário ---------------- */
  const dlg = $('#dlg');
  const form = $('#form');

  function openForm(it) {
    ui.editingId = it ? it.id : null;
    form.reset();
    $('#dlgTitle').textContent = it ? 'Editar' : 'Nova conta ou cobrança';
    $('#btnDelete').hidden = !it;
    const f = form.elements;
    if (it) {
      f.type.value = it.type;
      f.title.value = it.title;
      f.amount.value = amountInput(it.amount);
      f.category.value = it.category || '';
      f.person.value = it.person || '';
      f.date.value = it.due.slice(0, 10);
      f.time.value = it.due.slice(11, 16);
      f.remind.value = String(it.remind);
      f.repeat.value = it.repeat;
      f.notes.value = it.notes || '';
    } else {
      f.type.value = ui.type === 'receber' ? 'receber' : 'pagar';
      f.date.value = toLocalISO(new Date()).slice(0, 10);
    }
    dlg.showModal();
    f.title.focus();
  }

  form.addEventListener('submit', (e) => {
    const f = form.elements;
    const amount = parseAmount(f.amount.value);
    if (Number.isNaN(amount)) {
      e.preventDefault();
      f.amount.setCustomValidity('Informe um valor válido, ex.: 150,90');
      f.amount.reportValidity();
      return;
    }
    const due = `${f.date.value}T${f.time.value || '09:00'}`;
    const data = {
      type: f.type.value,
      title: f.title.value.trim(),
      amount,
      category: f.category.value.trim(),
      person: f.person.value.trim(),
      due,
      remind: Number(f.remind.value),
      repeat: f.repeat.value,
      notes: f.notes.value.trim(),
    };
    const existing = items.find((i) => i.id === ui.editingId);
    if (existing) {
      // Se mudou a data ou o aviso, o lembrete volta a valer.
      if (existing.due !== data.due || existing.remind !== data.remind) {
        data.notifiedRemind = false;
        data.notifiedDue = false;
      }
      if (existing.due !== data.due) data.anchorDay = Number(f.date.value.slice(8, 10));
      Object.assign(existing, data);
      toast('Alterações salvas.');
    } else {
      items.push({
        id: uid(), ...data, anchorDay: Number(f.date.value.slice(8, 10)),
        paidAt: null, notifiedRemind: false, notifiedDue: false, createdAt: new Date().toISOString(),
      });
      const askPermission = data.remind >= 0 && 'Notification' in window && Notification.permission === 'default';
      toast(askPermission ? 'Salvo! Toque em 🔔 no topo para ativar os avisos no celular/computador.' : 'Salvo!');
    }
    save();
    render();
    checkReminders();
  });

  form.elements.amount.addEventListener('input', (e) => e.target.setCustomValidity(''));
  $('#btnCancel').addEventListener('click', () => dlg.close());
  $('#btnDelete').addEventListener('click', () => {
    const it = items.find((i) => i.id === ui.editingId);
    if (!it || !confirm(`Excluir "${it.title}"?`)) return;
    items = items.filter((i) => i.id !== it.id);
    save();
    dlg.close();
    render();
    toast('Excluído.');
  });

  /* ---------------- Pagar / desfazer ---------------- */
  function markPaid(id) {
    const it = items.find((i) => i.id === id);
    if (!it) return;
    it.paidAt = new Date().toISOString();
    let msg = it.type === 'pagar' ? `"${it.title}" marcada como paga.` : `"${it.title}" marcada como recebida.`;
    if (it.repeat !== 'none') {
      const next = {
        ...it, id: uid(), due: nextDue(it), paidAt: null,
        notifiedRemind: false, notifiedDue: false, createdAt: new Date().toISOString(),
      };
      it.nextId = next.id;
      items.push(next);
      msg += ` Próximo vencimento: ${fmtDate.format(dueDate(next)).replace(/\.$/, '')}.`;
    }
    save();
    render();
    toast(msg);
  }

  function undoPaid(id) {
    const it = items.find((i) => i.id === id);
    if (!it) return;
    // Remove a próxima ocorrência gerada automaticamente, se ainda não foi paga.
    if (it.nextId) {
      const next = items.find((i) => i.id === it.nextId);
      if (next && !next.paidAt) items = items.filter((i) => i.id !== next.id);
      delete it.nextId;
    }
    it.paidAt = null;
    save();
    render();
  }

  $('#list').addEventListener('click', (e) => {
    const pay = e.target.closest('[data-pay]');
    if (pay) return markPaid(pay.dataset.pay);
    const undo = e.target.closest('[data-undo]');
    if (undo) return undoPaid(undo.dataset.undo);
    const card = e.target.closest('.item');
    if (card) openForm(items.find((i) => i.id === card.dataset.id));
  });
  $('#list').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.classList.contains('item')) {
      openForm(items.find((i) => i.id === e.target.dataset.id));
    }
  });

  /* ---------------- Filtros ---------------- */
  $$('.toolbar .seg__btn').forEach((b) => b.addEventListener('click', () => {
    $$('.toolbar .seg__btn').forEach((x) => x.classList.toggle('is-active', x === b));
    ui.type = b.dataset.type;
    render();
  }));
  $('#fStatus').addEventListener('change', (e) => { ui.status = e.target.value; render(); });
  $('#fSearch').addEventListener('input', (e) => { ui.search = e.target.value.trim().toLowerCase(); render(); });
  $('#btnAdd').addEventListener('click', () => openForm(null));

  /* ---------------- Lembretes ---------------- */
  let swReg = null;
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').then((r) => { swReg = r; }).catch(() => {});
  }

  const canNotify = () => 'Notification' in window && Notification.permission === 'granted';

  function updateNotifButton() {
    const btn = $('#btnNotif');
    if (!('Notification' in window)) {
      btn.innerHTML = '🔕<span> Sem suporte</span>';
      btn.title = 'Este navegador não suporta notificações. Use "Exportar para calendário".';
      btn.disabled = true;
    } else if (Notification.permission === 'granted') {
      btn.innerHTML = '🔔<span> Lembretes ativos</span>';
      btn.title = 'Enviar uma notificação de teste';
    } else if (Notification.permission === 'denied') {
      btn.innerHTML = '🔕<span> Bloqueado</span>';
      btn.title = 'As notificações foram bloqueadas nas configurações do navegador.';
    }
  }

  $('#btnNotif').addEventListener('click', async () => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      notify('Teste de lembrete', 'Os lembretes estão funcionando 👍', 'teste');
      return;
    }
    if (Notification.permission === 'denied') {
      toast('As notificações estão bloqueadas. Libere nas configurações do site (ícone de cadeado na barra de endereço).');
      return;
    }
    const p = await Notification.requestPermission();
    updateNotifButton();
    if (p === 'granted') {
      notify('Lembretes ativados', 'Você será avisado(a) dos vencimentos enquanto o app estiver aberto.', 'teste');
      checkReminders();
    }
  });

  async function notify(title, body, tag) {
    beep();
    toast(`<strong>${esc(title)}</strong><br>${esc(body)}`, { html: true, sticky: true });
    if (!canNotify()) return;
    const opts = { body, tag, icon: 'icon.svg', badge: 'icon.svg', renotify: true, requireInteraction: true };
    try {
      const reg = swReg || (navigator.serviceWorker && (await navigator.serviceWorker.getRegistration()));
      if (reg) return await reg.showNotification(title, opts);
      new Notification(title, opts);
    } catch {
      try { new Notification(title, opts); } catch { /* sem suporte */ }
    }
  }

  let audioCtx = null;
  function beep() {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const t = audioCtx.currentTime;
      [0, 0.18].forEach((delay) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.frequency.value = 880;
        g.gain.setValueAtTime(0.0001, t + delay);
        g.gain.exponentialRampToValueAtTime(0.2, t + delay + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + delay + 0.15);
        o.connect(g).connect(audioCtx.destination);
        o.start(t + delay);
        o.stop(t + delay + 0.16);
      });
    } catch { /* áudio indisponível */ }
  }

  function checkReminders() {
    const now = new Date();
    const due = [];
    for (const it of items) {
      if (it.paidAt || it.remind < 0) continue;
      const d = dueDate(it);
      const verb = it.type === 'pagar' ? 'Pagar' : 'Receber';
      const who = it.person ? ` — ${it.person}` : '';
      if (!it.notifiedRemind && it.remind > 0 && now >= d - it.remind * 60000 && now < d) {
        it.notifiedRemind = true;
        due.push([`⏰ ${verb}: ${it.title}`, `${money(it.amount)}${who} · ${relativeLabel(it, now)}`, it.id + ':r']);
      }
      if (!it.notifiedDue && now >= d) {
        it.notifiedDue = true;
        it.notifiedRemind = true;
        const late = now - d > 60 * 60 * 1000;
        due.push([`${late ? '⚠️' : '⏰'} ${verb}: ${it.title}`, `${money(it.amount)}${who} · ${relativeLabel(it, now)}`, it.id + ':d']);
      }
    }
    if (!due.length) return;
    save();
    render();
    if (due.length > 3) {
      notify(`Você tem ${due.length} lembretes`, due.map((d) => d[0].replace(/^\S+ /, '')).join('\n'), 'resumo');
    } else {
      due.forEach(([t, b, tag]) => notify(t, b, tag));
    }
  }

  /* ---------------- Toasts ---------------- */
  function toast(msg, { html = false, sticky = false } = {}) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `<div class="toast__body"></div><button type="button" aria-label="Fechar">×</button>`;
    el.firstChild[html ? 'innerHTML' : 'textContent'] = msg;
    el.lastChild.addEventListener('click', () => el.remove());
    const box = $('#toasts');
    box.append(el);
    while (box.children.length > 4) box.firstChild.remove();
    if (!sticky) setTimeout(() => el.remove(), 4000);
  }

  /* ---------------- Menu: backup e calendário ---------------- */
  const menu = $('#menu');
  const btnMenu = $('#btnMenu');
  btnMenu.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.hidden = !menu.hidden;
    btnMenu.setAttribute('aria-expanded', String(!menu.hidden));
  });
  document.addEventListener('click', () => { menu.hidden = true; btnMenu.setAttribute('aria-expanded', 'false'); });

  menu.addEventListener('click', (e) => {
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (action === 'export-json') {
      download(`minhas-contas-${toLocalISO(new Date()).slice(0, 10)}.json`, JSON.stringify(items, null, 2), 'application/json');
    } else if (action === 'import-json') {
      $('#fileImport').click();
    } else if (action === 'export-ics') {
      const open = items.filter((i) => !i.paidAt);
      if (!open.length) return toast('Não há itens pendentes para exportar.');
      download('minhas-contas.ics', buildICS(open), 'text/calendar');
      toast('Abra o arquivo .ics para adicionar os lembretes ao calendário do celular ou do Google Agenda.');
    } else if (action === 'clear-paid') {
      const n = items.filter((i) => i.paidAt).length;
      if (!n) return toast('Não há itens pagos.');
      if (!confirm(`Apagar ${n} item(ns) pago(s)/recebido(s)?`)) return;
      items = items.filter((i) => !i.paidAt);
      save();
      render();
    }
  });

  $('#fileImport').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!Array.isArray(data) || !data.every((d) => d && d.id && d.title && d.due && d.type)) throw new Error();
      if (!confirm(`Restaurar ${data.length} item(ns)? Os dados atuais serão substituídos.`)) return;
      items = data;
      save();
      render();
      toast('Backup restaurado.');
    } catch {
      toast('Arquivo inválido. Escolha um backup gerado por este app.');
    }
  });

  function download(name, content, type) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const a = Object.assign(document.createElement('a'), { href: url, download: name });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function buildICS(list) {
    const icsText = (s) => String(s).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/[,;]/g, (c) => '\\' + c);
    const icsDate = (iso) => iso.replace(/[-:]/g, '') + '00';
    const fold = (line) => line.match(/.{1,73}/g).join('\r\n ');
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const rrule = { weekly: 'FREQ=WEEKLY', monthly: 'FREQ=MONTHLY', yearly: 'FREQ=YEARLY' };
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Minhas Contas//PT-BR', 'CALSCALE:GREGORIAN'];
    for (const it of list) {
      const end = new Date(dueDate(it).getTime() + 30 * 60000);
      const verb = it.type === 'pagar' ? 'Pagar' : 'Receber';
      const desc = [money(it.amount), it.person, it.category, it.notes].filter(Boolean).join('\n');
      lines.push(
        'BEGIN:VEVENT',
        `UID:${it.id}@minhas-contas`,
        `DTSTAMP:${stamp}`,
        `DTSTART:${icsDate(it.due)}`,
        `DTEND:${icsDate(toLocalISO(end))}`,
        `SUMMARY:${icsText(`${verb}: ${it.title} (${money(it.amount)})`)}`,
        `DESCRIPTION:${icsText(desc)}`,
      );
      if (rrule[it.repeat]) lines.push(`RRULE:${rrule[it.repeat]}`);
      if (it.remind >= 0) {
        lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${icsText(`${verb}: ${it.title}`)}`,
          `TRIGGER:-PT${it.remind}M`, 'END:VALARM');
      }
      lines.push('END:VEVENT');
    }
    lines.push('END:VCALENDAR');
    return lines.map(fold).join('\r\n') + '\r\n';
  }

  /* ---------------- Início ---------------- */
  updateNotifButton();
  render();
  checkReminders();
  setInterval(() => { checkReminders(); render(); }, CHECK_EVERY_MS);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) { checkReminders(); render(); }
  });
  // Outra aba alterou os dados.
  window.addEventListener('storage', (e) => {
    if (e.key === STORE_KEY) { items = load(); render(); }
  });
})();
