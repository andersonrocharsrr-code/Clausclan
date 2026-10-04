/* Meus Gastos — controle de gastos com orçamento, calculadora automática e lembretes.
   Os dados ficam salvos no próprio navegador (localStorage). */
(() => {
  'use strict';

  const STORE_KEY = 'meus-gastos:v1';
  const CHECK_EVERY_MS = 20 * 1000;
  const MIN = 60 * 1000;
  const DAY = 24 * 60 * MIN;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const num = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 8 });
  const fmtMonth = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });
  const fmtMonthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' });
  const fmtDay = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
  const fmtShortMonth = new Intl.DateTimeFormat('pt-BR', { month: 'short' });
  const fmtDM = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' });

  const CATS = [
    { id: 'alimentacao', name: 'Alimentação', icon: '🍽️', color: '#f97316' },
    { id: 'mercado', name: 'Mercado', icon: '🛒', color: '#22c55e' },
    { id: 'transporte', name: 'Transporte', icon: '🚗', color: '#3b82f6' },
    { id: 'moradia', name: 'Moradia', icon: '🏠', color: '#8b5cf6' },
    { id: 'contas', name: 'Contas', icon: '💡', color: '#eab308' },
    { id: 'saude', name: 'Saúde', icon: '💊', color: '#ef4444' },
    { id: 'lazer', name: 'Lazer', icon: '🎉', color: '#ec4899' },
    { id: 'compras', name: 'Compras', icon: '🛍️', color: '#14b8a6' },
    { id: 'educacao', name: 'Educação', icon: '📚', color: '#6366f1' },
    { id: 'outros', name: 'Outros', icon: '📦', color: '#64748b' },
  ];
  const CAT = Object.fromEntries(CATS.map((c) => [c.id, c]));
  const catOf = (id) => CAT[id] || CAT.outros;

  const REPEAT_LABEL = { weekly: 'semanal', monthly: 'mensal', yearly: 'anual' };

  /* ---------------- Estado ---------------- */
  const state = load();
  const ui = {
    view: 'resumo',
    month: monthKey(new Date()),
    search: '',
    cat: 'all',
    editingExp: null,
    editingRem: null,
    payingRem: null,
    pickedCat: 'alimentacao',
  };

  function load() {
    const empty = { expenses: [], reminders: [], budget: 0, theme: 'auto', calcHist: [] };
    try {
      const data = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
      if (!data || typeof data !== 'object') return empty;
      return {
        expenses: Array.isArray(data.expenses) ? data.expenses : [],
        reminders: Array.isArray(data.reminders) ? data.reminders : [],
        budget: Number(data.budget) || 0,
        theme: ['light', 'dark'].includes(data.theme) ? data.theme : 'auto',
        calcHist: Array.isArray(data.calcHist) ? data.calcHist.slice(0, 8) : [],
      };
    } catch {
      return empty;
    }
  }

  function save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch {
      toast('Não foi possível salvar no navegador. Verifique se o modo anônimo está desligado.');
    }
  }

  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  /* ---------------- Datas ---------------- */
  function pad(n) { return String(n).padStart(2, '0'); }
  function monthKey(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; }
  const dateISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const toLocalISO = (d) => `${dateISO(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const parseDay = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const daysBetween = (a, b) => Math.round((startOfDay(b) - startOfDay(a)) / DAY);
  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();

  function shiftMonth(key, delta) {
    const [y, m] = key.split('-').map(Number);
    return monthKey(new Date(y, m - 1 + delta, 1));
  }

  // Soma meses mantendo o dia (31/01 + 1 mês = 28 ou 29/02).
  function addMonths(d, n, anchorDay = d.getDate()) {
    let y = d.getFullYear();
    let m = d.getMonth() + n;
    y += Math.floor(m / 12);
    m = ((m % 12) + 12) % 12;
    const out = new Date(d);
    out.setFullYear(y, m, Math.min(anchorDay, daysInMonth(y, m)));
    return out;
  }

  function nextDue(rem) {
    const d = new Date(rem.due);
    if (rem.repeat === 'weekly') d.setDate(d.getDate() + 7);
    else if (rem.repeat === 'monthly') return toLocalISO(addMonths(d, 1, rem.anchorDay));
    else if (rem.repeat === 'yearly') return toLocalISO(addMonths(d, 12, rem.anchorDay));
    return toLocalISO(d);
  }

  /* ---------------- Calculadora (sem eval) ----------------
     Aceita números no formato brasileiro (1.234,56 ou 12,5) e também 12.5.
     Operadores: + − × ÷ ( ) e % (100+10% = 110; 200×15% = 30). */
  function tokenize(src) {
    const s = String(src).replace(/R\$/gi, '').replace(/\s+/g, '')
      .replace(/[x×]/gi, '*').replace(/÷/g, '/').replace(/[−–]/g, '-');
    const tokens = [];
    let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (/[0-9.,]/.test(c)) {
        let j = i;
        while (j < s.length && /[0-9.,]/.test(s[j])) j++;
        tokens.push({ t: 'n', v: toNumber(s.slice(i, j)) });
        i = j;
      } else if ('+-*/()%'.includes(c)) {
        tokens.push({ t: c });
        i++;
      } else {
        throw new Error('caractere inválido');
      }
    }
    return tokens;
  }

  function toNumber(raw) {
    let s = raw;
    if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
    else if ((s.match(/\./g) || []).length > 1 || /^\d{1,3}\.\d{3}$/.test(s)) s = s.replace(/\./g, '');
    if (s === '' || s === '.' || (s.match(/[.,]/g) || []).length > 1) throw new Error('número inválido');
    return Number(s);
  }

  function evaluate(src) {
    const tokens = tokenize(src);
    if (!tokens.length) return NaN;
    let pos = 0;
    const peek = () => tokens[pos] && tokens[pos].t;

    function expr() {
      let acc = term();
      if (acc.pct) acc = { v: acc.v / 100 };
      while (peek() === '+' || peek() === '-') {
        const op = tokens[pos++].t;
        const r = term();
        const v = r.pct ? (acc.v * r.v) / 100 : r.v;
        acc = { v: op === '+' ? acc.v + v : acc.v - v };
      }
      return acc;
    }
    function term() {
      let acc = factor();
      while (peek() === '*' || peek() === '/') {
        const op = tokens[pos++].t;
        const r = factor();
        const left = acc.pct ? acc.v / 100 : acc.v;
        const right = r.pct ? r.v / 100 : r.v;
        acc = { v: op === '*' ? left * right : left / right };
      }
      return acc;
    }
    function factor() {
      const t = peek();
      if (t === '-' || t === '+') { pos++; const f = factor(); return { v: t === '-' ? -f.v : f.v, pct: f.pct }; }
      let v;
      if (t === 'n') v = tokens[pos++].v;
      else if (t === '(') {
        pos++;
        v = expr().v;
        if (peek() === ')') pos++; // parêntese final pode ficar aberto enquanto digita
        else if (pos < tokens.length) throw new Error('parêntese');
      } else throw new Error('expressão incompleta');
      if (peek() === '%') { pos++; return { v, pct: true }; }
      return { v };
    }

    const out = expr();
    if (pos !== tokens.length) throw new Error('sobrou algo');
    return out.v;
  }

  function safeEval(src) {
    try {
      const v = evaluate(src);
      return Number.isFinite(v) ? v : NaN;
    } catch {
      return NaN;
    }
  }

  const toCents = (v) => Math.round(v * 100);
  const money = (cents) => brl.format(cents / 100);
  const amountInput = (cents) => (cents / 100).toFixed(2).replace('.', ',');
  const isExpression = (s) => /[+\-*/x×÷%()]/i.test(String(s).replace(/^\s*-/, ''));

  // Mostra o resultado ao vivo embaixo de um campo de valor.
  function bindLiveAmount(input, output, { optional = false } = {}) {
    const update = () => {
      const raw = input.value.trim();
      output.classList.remove('err');
      if (!raw) { output.textContent = ''; return; }
      const v = safeEval(raw);
      if (!Number.isFinite(v)) { output.textContent = 'Conta incompleta'; output.classList.add('err'); return; }
      if (v < 0) { output.textContent = 'O valor não pode ser negativo'; output.classList.add('err'); return; }
      output.textContent = isExpression(raw) ? `= ${money(toCents(v))}` : money(toCents(v));
    };
    input.addEventListener('input', update);
    input.addEventListener('blur', () => {
      const v = safeEval(input.value);
      if (input.value.trim() && Number.isFinite(v) && v >= 0) input.value = amountInput(toCents(v));
      update();
    });
    input._update = update;
    input._optional = optional;
    return update;
  }

  function readAmount(input) {
    const raw = input.value.trim();
    if (!raw) return input._optional ? null : NaN;
    const v = safeEval(raw);
    return Number.isFinite(v) && v >= 0 ? toCents(v) : NaN;
  }

  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  const esc = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------------- Navegação ---------------- */
  function setView(view) {
    ui.view = view;
    $$('.view').forEach((v) => v.classList.toggle('is-active', v.id === `view-${view}`));
    $$('.tab').forEach((t) => t.classList.toggle('is-active', t.dataset.view === view));
    $('#btnAdd').setAttribute('aria-label', view === 'lembretes' ? 'Novo lembrete' : 'Novo gasto');
    window.scrollTo({ top: 0 });
  }

  $$('.tab').forEach((t) => t.addEventListener('click', () => setView(t.dataset.view)));
  $$('[data-goto]').forEach((b) => b.addEventListener('click', () => setView(b.dataset.goto)));

  $('#prevMonth').addEventListener('click', () => { ui.month = shiftMonth(ui.month, -1); render(); });
  $('#nextMonth').addEventListener('click', () => { ui.month = shiftMonth(ui.month, 1); render(); });
  $('#monthLabel').addEventListener('click', () => { ui.month = monthKey(new Date()); render(); });

  /* ---------------- Renderização ---------------- */
  const inMonth = (key) => (e) => e.date.startsWith(key);

  function render() {
    const [y, m] = ui.month.split('-').map(Number);
    $('#monthLabel').textContent = cap(fmtMonth.format(new Date(y, m - 1, 1)));
    renderSummary();
    renderExpenses();
    renderReminders();
  }

  function renderSummary() {
    const now = new Date();
    const [y, m] = ui.month.split('-').map(Number);
    const dim = daysInMonth(y, m - 1);
    const list = state.expenses.filter(inMonth(ui.month));
    const total = list.reduce((s, e) => s + e.amount, 0);
    const prevKey = shiftMonth(ui.month, -1);
    const prevTotal = state.expenses.filter(inMonth(prevKey)).reduce((s, e) => s + e.amount, 0);

    const current = ui.month === monthKey(now);
    const past = ui.month < monthKey(now);
    const elapsed = current ? now.getDate() : past ? dim : 0;
    const left = current ? dim - now.getDate() + 1 : past ? 0 : dim;

    $('#sumMonth').textContent = money(total);

    const cmp = $('#sumCmp');
    cmp.className = 'hero__cmp';
    if (prevTotal > 0) {
      const diff = Math.round(((total - prevTotal) / prevTotal) * 100);
      const prevName = fmtMonthName.format(new Date(y, m - 2, 1));
      cmp.textContent = diff === 0
        ? `Igual a ${prevName}`
        : `${diff > 0 ? '▲' : '▼'} ${Math.abs(diff)}% em relação a ${prevName}`;
      if (diff !== 0) cmp.classList.add(diff > 0 ? 'up' : 'down');
    } else {
      cmp.textContent = '';
    }

    // Orçamento
    const bar = $('#budgetBar');
    const note = $('#budgetNote');
    const budget = state.budget;
    if (budget > 0) {
      const pct = total / budget;
      bar.hidden = false;
      bar.classList.toggle('warn', pct >= 0.8 && pct < 1);
      bar.classList.toggle('over', pct >= 1);
      bar.firstElementChild.style.width = `${Math.min(100, pct * 100)}%`;
      const rest = budget - total;
      if (rest < 0) {
        note.innerHTML = `Você passou <strong>${money(-rest)}</strong> do orçamento de ${money(budget)}.`;
      } else if (current) {
        note.innerHTML = `Restam <strong>${money(rest)}</strong> de ${money(budget)} — dá para gastar até ` +
          `<strong>${money(Math.floor(rest / left))}</strong> por dia nos próximos ${left} dia${left > 1 ? 's' : ''}.`;
      } else if (past) {
        note.innerHTML = `Mês fechado com <strong>${money(rest)}</strong> de sobra no orçamento de ${money(budget)}.`;
      } else {
        note.innerHTML = `Orçamento de ${money(budget)} — <strong>${money(Math.floor(rest / dim))}</strong> por dia.`;
      }
    } else {
      bar.hidden = true;
      note.innerHTML = 'Defina um <strong>orçamento</strong> e o app calcula quanto você ainda pode gastar por dia.';
    }

    // Números automáticos
    const avg = elapsed ? Math.round(total / elapsed) : 0;
    $('#statAvg').textContent = elapsed ? money(avg) : '—';
    $('#statProj').textContent = current ? money(avg * dim) : money(total);
    $('#statProj').previousElementSibling.textContent = current ? 'Projeção do mês' : 'Total do mês';
    const max = list.reduce((a, e) => (!a || e.amount > a.amount ? e : a), null);
    $('#statMax').textContent = max ? money(max.amount) : '—';
    $('#statMax').title = max ? max.title : '';
    $('#statCount').textContent = String(list.length);

    // Categorias
    const byCat = new Map();
    for (const e of list) byCat.set(e.cat, (byCat.get(e.cat) || 0) + e.amount);
    const rows = [...byCat].sort((a, b) => b[1] - a[1]);
    const top = rows.length ? rows[0][1] : 0;
    $('#catBreakdown').innerHTML = rows.length
      ? rows.map(([id, v]) => {
        const c = catOf(id);
        const pct = total ? Math.round((v / total) * 100) : 0;
        return `
          <div class="bar">
            <div class="bar__top">
              <span class="bar__icon" style="background:${c.color}22">${c.icon}</span>
              <span class="bar__name">${c.name}<small>${pct}%</small></span>
              <span class="bar__val">${money(v)}</span>
            </div>
            <div class="bar__track"><span style="width:${(v / top) * 100}%;background:${c.color}"></span></div>
          </div>`;
      }).join('')
      : '<p class="empty-sm">Sem gastos neste mês. Toque em <strong>+</strong> para lançar.</p>';

    // Próximos lembretes
    const next = [...state.reminders].sort((a, b) => new Date(a.due) - new Date(b.due)).slice(0, 3);
    $('#nextReminders').innerHTML = next.length
      ? next.map((r) => {
        const st = remStatus(r, now);
        return `
          <div class="mini">
            <span class="bar__icon" style="background:${catOf(r.cat).color}22">${catOf(r.cat).icon}</span>
            <span class="mini__title">${esc(r.title)}</span>
            <span class="tag ${st.cls}">${st.label}</span>
          </div>`;
      }).join('')
      : '<p class="empty-sm">Nenhum lembrete. Crie um para não esquecer aluguel, cartão, internet…</p>';
  }

  function renderExpenses() {
    // Chips de categoria (só as que aparecem no mês)
    const monthList = state.expenses.filter(inMonth(ui.month));
    const used = CATS.filter((c) => monthList.some((e) => e.cat === c.id));
    if (ui.cat !== 'all' && !used.some((c) => c.id === ui.cat)) ui.cat = 'all';
    $('#fCats').innerHTML = [`<button type="button" class="chip${ui.cat === 'all' ? ' is-active' : ''}" data-cat="all">Todas</button>`]
      .concat(used.map((c) => `<button type="button" class="chip${ui.cat === c.id ? ' is-active' : ''}" data-cat="${c.id}">${c.icon} ${c.name}</button>`))
      .join('');

    const q = ui.search;
    const list = monthList
      .filter((e) => ui.cat === 'all' || e.cat === ui.cat)
      .filter((e) => !q || `${e.title} ${e.notes || ''} ${catOf(e.cat).name} ${e.method}`.toLowerCase().includes(q))
      .sort((a, b) => (b.date === a.date ? (b.createdAt || 0) - (a.createdAt || 0) : b.date.localeCompare(a.date)));

    const days = new Map();
    for (const e of list) {
      if (!days.has(e.date)) days.set(e.date, []);
      days.get(e.date).push(e);
    }
    const today = dateISO(new Date());
    const yesterday = dateISO(new Date(Date.now() - DAY));
    const html = [];
    for (const [date, items] of days) {
      const label = date === today ? 'Hoje' : date === yesterday ? 'Ontem' : cap(fmtDay.format(parseDay(date)));
      const sum = items.reduce((s, e) => s + e.amount, 0);
      html.push(`<div class="day"><h3><span>${label}</span><span>${money(sum)}</span></h3><div class="day__items">`);
      for (const e of items) {
        const c = catOf(e.cat);
        const meta = [c.name, e.method, e.inst && `parcela ${e.inst}`, e.notes && esc(e.notes)].filter(Boolean).join(' · ');
        html.push(`
          <button type="button" class="exp" data-id="${e.id}">
            <span class="exp__icon" style="background:${c.color}22">${c.icon}</span>
            <span class="exp__main">
              <span class="exp__title">${esc(e.title)}</span>
              <span class="exp__meta">${meta}</span>
            </span>
            <span class="exp__val">${money(e.amount)}</span>
          </button>`);
      }
      html.push('</div></div>');
    }
    $('#expList').innerHTML = html.join('');
    $('#expEmpty').hidden = list.length > 0;
    $('#expEmpty').innerHTML = monthList.length
      ? 'Nenhum gasto encontrado com esse filtro.'
      : 'Nenhum gasto neste mês ainda.<br>Toque em <strong>+</strong> para lançar o primeiro.';
  }

  function remStatus(r, now = new Date()) {
    const d = new Date(r.due);
    const diff = daysBetween(now, d);
    const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    if (d < now) {
      if (diff === 0) return { label: `Venceu hoje ${time}`, cls: 'tag--late', state: 'late' };
      return { label: diff === -1 ? 'Venceu ontem' : `Atrasado ${-diff} dias`, cls: 'tag--late', state: 'late' };
    }
    if (diff === 0) return { label: `Hoje ${time}`, cls: 'tag--soon', state: 'soon' };
    if (diff === 1) return { label: `Amanhã ${time}`, cls: 'tag--soon', state: 'soon' };
    if (diff <= 3) return { label: `Em ${diff} dias`, cls: 'tag--soon', state: 'soon' };
    return { label: `Em ${diff} dias`, cls: '', state: 'ok' };
  }

  function remindLabel(min) {
    if (min === 0) return 'no horário';
    if (min < 1440) return `${min / 60} h antes`;
    if (min === 10080) return '1 semana antes';
    const d = min / 1440;
    return `${d} dia${d > 1 ? 's' : ''} antes`;
  }

  function renderReminders() {
    const now = new Date();
    const list = [...state.reminders].sort((a, b) => new Date(a.due) - new Date(b.due));
    $('#remList').innerHTML = list.map((r) => {
      const d = new Date(r.due);
      const st = remStatus(r, now);
      const meta = [
        `${pad(d.getHours())}:${pad(d.getMinutes())}`,
        r.repeat !== 'none' && `🔁 ${REPEAT_LABEL[r.repeat]}`,
        `🔔 ${remindLabel(r.remind)}`,
      ].filter(Boolean).join(' · ');
      return `
        <article class="rem is-${st.state}" data-id="${r.id}" tabindex="0">
          <div class="rem__date"><b>${d.getDate()}</b><small>${fmtShortMonth.format(d).replace('.', '')}</small></div>
          <div class="rem__main">
            <div class="rem__title">${catOf(r.cat).icon} ${esc(r.title)}</div>
            <div class="rem__meta">${meta}</div>
            <span class="tag ${st.cls}">${st.label}</span>
          </div>
          <div class="rem__side">
            <span class="rem__val">${r.amount != null ? money(r.amount) : ''}</span>
            <button type="button" class="btn btn--primary btn--sm" data-pay="${r.id}">Paguei</button>
          </div>
        </article>`;
    }).join('');
    $('#remEmpty').hidden = list.length > 0;

    const due = list.filter((r) => remStatus(r, now).state !== 'ok' && daysBetween(now, new Date(r.due)) <= 1).length;
    $('#remBadge').hidden = !due;
    $('#remBadge').textContent = String(due);
  }

  /* ---------------- Filtros ---------------- */
  $('#fSearch').addEventListener('input', (e) => { ui.search = e.target.value.trim().toLowerCase(); renderExpenses(); });
  $('#fCats').addEventListener('click', (e) => {
    const b = e.target.closest('[data-cat]');
    if (!b) return;
    ui.cat = b.dataset.cat;
    renderExpenses();
  });

  /* ---------------- Diálogos (genérico) ---------------- */
  $$('dialog').forEach((dlg) => {
    dlg.addEventListener('click', (e) => {
      if (e.target === dlg || e.target.closest('[data-close]')) dlg.close();
    });
  });

  /* ---------------- Gasto: formulário ---------------- */
  const dlgExp = $('#dlgExp');
  const formExp = $('#formExp');
  const expAmount = $('#expAmount');
  bindLiveAmount(expAmount, $('#expAmountOut'));

  $('#catPick').innerHTML = CATS.map((c) =>
    `<button type="button" class="cat-opt" data-cat="${c.id}"><span>${c.icon}</span>${c.name}</button>`).join('');
  $('#catPick').addEventListener('click', (e) => {
    const b = e.target.closest('[data-cat]');
    if (b) pickCat(b.dataset.cat);
  });
  function pickCat(id) {
    ui.pickedCat = id;
    $$('#catPick .cat-opt').forEach((b) => b.classList.toggle('is-active', b.dataset.cat === id));
  }

  $('#expInst').innerHTML = Array.from({ length: 24 }, (_, i) =>
    `<option value="${i + 1}">${i === 0 ? 'À vista' : `${i + 1}x`}</option>`).join('');

  function splitCents(total, n) {
    const base = Math.floor(total / n);
    const extra = total - base * n;
    return Array.from({ length: n }, (_, i) => base + (i < extra ? 1 : 0));
  }

  function updateInstallments() {
    const credit = formExp.method.value === 'Crédito' && !ui.editingExp;
    $('#instWrap').hidden = !credit;
    const n = Number(formExp.installments.value);
    const total = readAmount(expAmount);
    $('#instHint').textContent = credit && n > 1 && Number.isFinite(total) && total > 0
      ? `${n}x de ${money(splitCents(total, n)[0])} — uma parcela lançada em cada mês`
      : '';
  }
  formExp.method.addEventListener('change', updateInstallments);
  formExp.installments.addEventListener('change', updateInstallments);
  expAmount.addEventListener('input', updateInstallments);

  function defaultDateForMonth() {
    const now = new Date();
    if (ui.month === monthKey(now)) return dateISO(now);
    return `${ui.month}-01`;
  }

  function openExpense(exp = null, preset = {}) {
    ui.editingExp = exp ? exp.id : null;
    formExp.reset();
    $('#dlgExpTitle').textContent = exp ? 'Editar gasto' : 'Novo gasto';
    $('#expDelete').hidden = !exp;
    const src = exp || preset;
    expAmount.value = src.amount != null ? amountInput(src.amount) : '';
    formExp.title.value = src.title || '';
    formExp.date.value = src.date || defaultDateForMonth();
    formExp.method.value = src.method || 'Pix';
    formExp.notes.value = src.notes || '';
    formExp.installments.value = '1';
    pickCat(src.cat || 'alimentacao');
    expAmount._update();
    updateInstallments();
    dlgExp.showModal();
    if (!exp && !src.amount) expAmount.focus();
  }

  dlgExp.addEventListener('close', () => { ui.payingRem = null; });

  formExp.addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = readAmount(expAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast('Informe um valor válido (ex.: 25,90 ou 12+8,50).');
      expAmount.focus();
      return;
    }
    const data = {
      title: formExp.title.value.trim(),
      amount,
      cat: ui.pickedCat,
      date: formExp.date.value,
      method: formExp.method.value,
      notes: formExp.notes.value.trim(),
    };
    if (!data.title || !data.date) return;

    if (ui.editingExp) {
      const exp = state.expenses.find((x) => x.id === ui.editingExp);
      Object.assign(exp, data);
      toast('Gasto atualizado.');
    } else {
      const n = data.method === 'Crédito' ? Number(formExp.installments.value) : 1;
      const parts = splitCents(amount, n);
      const group = n > 1 ? uid() : undefined;
      const first = parseDay(data.date);
      parts.forEach((cents, i) => {
        state.expenses.push({
          ...data,
          id: uid(),
          amount: cents,
          date: dateISO(addMonths(first, i)),
          createdAt: Date.now() + i,
          ...(group && { group, inst: `${i + 1}/${n}` }),
        });
      });
      if (ui.payingRem) {
        advanceReminder(ui.payingRem);
      } else {
        toast(n > 1 ? `Lançado em ${n}x de ${money(parts[0])}.` : `Gasto de ${money(amount)} lançado.`);
      }
      // Mostra o mês do lançamento, para não parecer que sumiu.
      ui.month = data.date.slice(0, 7);
    }
    save();
    dlgExp.close();
    render();
  });

  $('#expDelete').addEventListener('click', () => {
    const exp = state.expenses.find((x) => x.id === ui.editingExp);
    if (!exp) return;
    let removed = [exp];
    if (exp.group) {
      const all = state.expenses.filter((x) => x.group === exp.group);
      if (all.length > 1 && confirm(`Excluir também as outras ${all.length - 1} parcelas desta compra?\n\nOK = todas · Cancelar = só esta`)) {
        removed = all;
      }
    }
    const ids = new Set(removed.map((x) => x.id));
    state.expenses = state.expenses.filter((x) => !ids.has(x.id));
    save();
    dlgExp.close();
    render();
    toast(removed.length > 1 ? `${removed.length} parcelas excluídas.` : 'Gasto excluído.', 'Desfazer', () => {
      state.expenses.push(...removed);
      save();
      render();
    });
  });

  $('#expList').addEventListener('click', (e) => {
    const b = e.target.closest('.exp');
    if (!b) return;
    const exp = state.expenses.find((x) => x.id === b.dataset.id);
    if (exp) openExpense(exp);
  });

  /* ---------------- Lembretes ---------------- */
  const dlgRem = $('#dlgRem');
  const formRem = $('#formRem');
  const remAmount = $('#remAmount');
  bindLiveAmount(remAmount, $('#remAmountOut'), { optional: true });
  $('#remCat').innerHTML = CATS.map((c) => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');

  function openReminder(rem = null) {
    ui.editingRem = rem ? rem.id : null;
    formRem.reset();
    $('#dlgRemTitle').textContent = rem ? 'Editar lembrete' : 'Novo lembrete';
    $('#remDelete').hidden = !rem;
    if (rem) {
      const [date, time] = rem.due.split('T');
      formRem.title.value = rem.title;
      remAmount.value = rem.amount != null ? amountInput(rem.amount) : '';
      formRem.category.value = rem.cat;
      formRem.date.value = date;
      formRem.time.value = time;
      formRem.remind.value = String(rem.remind);
      formRem.repeat.value = rem.repeat;
    } else {
      const d = new Date(Date.now() + 3 * DAY);
      formRem.date.value = dateISO(d);
      formRem.category.value = 'contas';
    }
    remAmount._update();
    dlgRem.showModal();
  }

  // Marca como já avisado tudo o que ficou no passado, para não disparar alertas antigos.
  function markPastAlerts(rem, now = Date.now()) {
    const due = new Date(rem.due).getTime();
    if (due - rem.remind * MIN <= now) rem.firedPre = rem.due;
    if (due <= now) rem.firedAt = rem.due;
  }

  formRem.addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = readAmount(remAmount);
    if (Number.isNaN(amount)) {
      toast('Valor inválido. Deixe em branco se ainda não souber.');
      return;
    }
    const due = `${formRem.date.value}T${formRem.time.value}`;
    const data = {
      title: formRem.title.value.trim(),
      amount,
      cat: formRem.category.value,
      due,
      anchorDay: parseDay(formRem.date.value).getDate(),
      remind: Number(formRem.remind.value),
      repeat: formRem.repeat.value,
    };
    if (!data.title) return;
    let rem;
    if (ui.editingRem) {
      rem = state.reminders.find((x) => x.id === ui.editingRem);
      const changedTime = rem.due !== data.due || rem.remind !== data.remind;
      Object.assign(rem, data);
      if (changedTime) { rem.firedPre = ''; rem.firedAt = ''; }
    } else {
      rem = { id: uid(), ...data, firedPre: '', firedAt: '' };
      state.reminders.push(rem);
    }
    markPastAlerts(rem);
    save();
    dlgRem.close();
    render();
    toast(ui.editingRem ? 'Lembrete atualizado.' : 'Lembrete criado.');
    if ('Notification' in window && Notification.permission === 'default') await askNotify();
  });

  $('#remDelete').addEventListener('click', () => {
    const rem = state.reminders.find((x) => x.id === ui.editingRem);
    if (!rem) return;
    state.reminders = state.reminders.filter((x) => x !== rem);
    save();
    dlgRem.close();
    render();
    toast('Lembrete excluído.', 'Desfazer', () => { state.reminders.push(rem); save(); render(); });
  });

  $('#remList').addEventListener('click', (e) => {
    const pay = e.target.closest('[data-pay]');
    const card = e.target.closest('.rem');
    if (!card) return;
    const rem = state.reminders.find((x) => x.id === card.dataset.id);
    if (!rem) return;
    if (pay) payReminder(rem);
    else openReminder(rem);
  });
  $('#remList').addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || !e.target.classList.contains('rem')) return;
    const rem = state.reminders.find((x) => x.id === e.target.dataset.id);
    if (rem) openReminder(rem);
  });

  // "Paguei": abre o gasto já preenchido; ao salvar, o lembrete avança (ou some, se não repete).
  function payReminder(rem) {
    openExpense(null, { title: rem.title, amount: rem.amount ?? undefined, cat: rem.cat, date: dateISO(new Date()), method: 'Pix' });
    ui.payingRem = rem.id;
  }

  function advanceReminder(id) {
    const rem = state.reminders.find((x) => x.id === id);
    if (!rem) return;
    if (rem.repeat === 'none') {
      state.reminders = state.reminders.filter((x) => x !== rem);
      toast('Pago e lançado nos gastos. Lembrete concluído ✔');
      return;
    }
    rem.due = nextDue(rem);
    rem.firedPre = '';
    rem.firedAt = '';
    markPastAlerts(rem);
    toast(`Pago e lançado! Próximo lembrete: ${fmtDM.format(new Date(rem.due))}.`);
  }

  $('#btnAddRem').addEventListener('click', () => openReminder());

  /* ---------------- Notificações ---------------- */
  let swReg = null;
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').then((r) => { swReg = r; }).catch(() => {});
  }

  const canNotify = () => 'Notification' in window && Notification.permission === 'granted';

  function updateBell() {
    const b = $('#btnNotif');
    b.classList.toggle('is-on', canNotify());
    b.title = canNotify() ? 'Lembretes ativados' : 'Ativar lembretes';
  }

  async function askNotify() {
    if (!('Notification' in window)) {
      toast('Este navegador não suporta notificações. Use “Lembretes p/ calendário” no menu ⋯.');
      return;
    }
    if (Notification.permission === 'denied') {
      toast('As notificações estão bloqueadas. Libere nas configurações do navegador para este site.');
      return;
    }
    if (Notification.permission === 'default') {
      const p = await Notification.requestPermission();
      updateBell();
      if (p !== 'granted') return;
    }
    toast('Lembretes ativados 🔔 Você será avisado no horário escolhido.');
    notify('Meus Gastos', 'Pronto! Os lembretes vão aparecer assim.', 'teste');
  }

  $('#btnNotif').addEventListener('click', askNotify);

  async function notify(title, body, tag) {
    beep();
    if (!canNotify()) return;
    const opts = { body, tag, icon: 'icon.svg', badge: 'icon.svg', requireInteraction: true };
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
      [880, 1175].forEach((f, i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t + i * 0.18);
        g.gain.exponentialRampToValueAtTime(0.2, t + i * 0.18 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.18 + 0.16);
        o.connect(g).connect(audioCtx.destination);
        o.start(t + i * 0.18);
        o.stop(t + i * 0.18 + 0.17);
      });
    } catch { /* sem áudio */ }
  }

  function checkReminders() {
    const now = Date.now();
    let changed = false;
    for (const r of state.reminders) {
      const due = new Date(r.due).getTime();
      const value = r.amount != null ? ` (${money(r.amount)})` : '';
      if (r.firedAt !== r.due && due <= now) {
        r.firedAt = r.due;
        r.firedPre = r.due;
        changed = true;
        notify(`Vence agora: ${r.title}`, `Hoje às ${r.due.slice(11)}${value}. Toque para abrir.`, r.id);
        toast(`🔔 Vence agora: ${r.title}${value}`);
      } else if (r.remind > 0 && r.firedPre !== r.due && due - r.remind * MIN <= now) {
        r.firedPre = r.due;
        changed = true;
        const when = remStatus(r).label.toLowerCase();
        notify(`Lembrete: ${r.title}`, `Vence ${when}${value}.`, r.id);
        toast(`🔔 ${r.title} vence ${when}${value}`);
      }
    }
    if (changed) { save(); renderReminders(); }
  }

  /* ---------------- Orçamento ---------------- */
  const dlgBudget = $('#dlgBudget');
  const budgetInput = $('#budgetInput');
  bindLiveAmount(budgetInput, $('#budgetOut'), { optional: true });

  function openBudget() {
    budgetInput.value = state.budget ? amountInput(state.budget) : '';
    budgetInput._update();
    dlgBudget.showModal();
    budgetInput.focus();
  }
  $('#btnBudget').addEventListener('click', openBudget);
  $('#formBudget').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = readAmount(budgetInput);
    if (Number.isNaN(v)) { toast('Valor inválido.'); return; }
    state.budget = v || 0;
    save();
    dlgBudget.close();
    renderSummary();
    toast(state.budget ? `Orçamento de ${money(state.budget)} por mês definido.` : 'Orçamento removido.');
  });
  $('#budgetClear').addEventListener('click', () => {
    state.budget = 0;
    save();
    dlgBudget.close();
    renderSummary();
    toast('Orçamento removido.');
  });

  /* ---------------- Calculadora ---------------- */
  let calc = '';
  const PRETTY = { '*': '×', '/': '÷', '-': '−' };
  const prettify = (s) => s.replace(/[*/-]/g, (c) => PRETTY[c]);

  function calcValue() {
    if (!calc) return 0;
    // Ignora um operador solto no final enquanto o usuário digita.
    const v = safeEval(calc.replace(/[+\-*/]+$/, ''));
    return v;
  }

  function renderCalc() {
    $('#calcExpr').textContent = calc ? prettify(calc) : '\u00a0';
    const v = calcValue();
    $('#calcResult').textContent = Number.isFinite(v) ? num.format(Math.round(v * 1e8) / 1e8) : '…';
    $('#calcHist').innerHTML = state.calcHist.map((h, i) =>
      `<button type="button" data-h="${i}"><span>${esc(prettify(h.expr))}</span><b>= ${num.format(h.result)}</b></button>`).join('');
  }

  function press(k) {
    if (k === 'C') calc = '';
    else if (k === 'back') calc = calc.slice(0, -1);
    else if (k === '=') {
      const v = calcValue();
      if (calc && Number.isFinite(v) && isExpression(calc)) {
        const result = Math.round(v * 1e8) / 1e8;
        state.calcHist.unshift({ expr: calc, result });
        state.calcHist = state.calcHist.slice(0, 6);
        save();
        calc = String(result).replace('.', ',');
      }
    } else if ('+-*/'.includes(k)) {
      if (!calc && k !== '-') calc = '0';
      calc = calc.replace(/[+\-*/]$/, '') + k;
    } else {
      calc += k;
    }
    renderCalc();
  }

  $('#calcKeys').addEventListener('click', (e) => {
    const b = e.target.closest('[data-k]');
    if (b) press(b.dataset.k);
  });

  $('#calcHist').addEventListener('click', (e) => {
    const b = e.target.closest('[data-h]');
    if (!b) return;
    calc = String(state.calcHist[Number(b.dataset.h)].result).replace('.', ',');
    renderCalc();
  });

  document.addEventListener('keydown', (e) => {
    if (ui.view !== 'calc' || document.querySelector('dialog[open]')) return;
    if (e.target.matches('input, select, textarea') || e.ctrlKey || e.metaKey || e.altKey) return;
    const map = { Enter: '=', '=': '=', Backspace: 'back', Escape: 'C', Delete: 'C', '.': ',', x: '*', X: '*' };
    const k = map[e.key] || (/^[0-9+\-*/(),%]$/.test(e.key) ? e.key : null);
    if (!k) return;
    e.preventDefault();
    press(k);
  });

  $('#calcUse').addEventListener('click', () => {
    const v = calcValue();
    if (!Number.isFinite(v) || v <= 0) { toast('Faça uma conta com resultado positivo primeiro.'); return; }
    openExpense(null, { amount: toCents(v) });
  });

  // Dividir a conta
  const spTotal = $('#spTotal');
  function calcSplit() {
    const total = safeEval(spTotal.value || '0');
    const people = Math.max(1, Math.floor(Number($('#spPeople').value) || 1));
    const tip = Math.max(0, Number($('#spTip').value) || 0);
    const ok = Number.isFinite(total) && total >= 0;
    const withTip = ok ? toCents(total * (1 + tip / 100)) : 0;
    const each = Math.ceil(withTip / people);
    $('#spOutTotal').textContent = ok ? money(withTip) : '—';
    $('#spOutEach').textContent = ok ? money(each) : '—';
    return each;
  }
  ['#spTotal', '#spPeople', '#spTip'].forEach((s) => $(s).addEventListener('input', calcSplit));
  $('#spUse').addEventListener('click', () => {
    const each = calcSplit();
    if (!each) { toast('Informe o total da conta.'); return; }
    openExpense(null, { amount: each, title: 'Conta dividida', cat: 'alimentacao' });
  });

  /* ---------------- Botão + ---------------- */
  $('#btnAdd').addEventListener('click', () => {
    if (ui.view === 'lembretes') openReminder();
    else openExpense();
  });

  /* ---------------- Tema ---------------- */
  const THEME_ICON = { auto: '🌓', light: '☀️', dark: '🌙' };
  const THEME_LABEL = { auto: 'automático', light: 'claro', dark: 'escuro' };
  function applyTheme() {
    if (state.theme === 'auto') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = state.theme;
    $('#btnTheme').textContent = THEME_ICON[state.theme];
  }
  $('#btnTheme').addEventListener('click', () => {
    state.theme = { auto: 'light', light: 'dark', dark: 'auto' }[state.theme];
    applyTheme();
    save();
    toast(`Tema ${THEME_LABEL[state.theme]}.`);
  });

  /* ---------------- Menu ---------------- */
  const menu = $('#menu');
  const btnMenu = $('#btnMenu');
  btnMenu.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.hidden = !menu.hidden;
    btnMenu.setAttribute('aria-expanded', String(!menu.hidden));
  });
  document.addEventListener('click', (e) => {
    if (!menu.hidden && !menu.contains(e.target)) { menu.hidden = true; btnMenu.setAttribute('aria-expanded', 'false'); }
  });

  menu.addEventListener('click', (e) => {
    const b = e.target.closest('[data-action]');
    if (!b) return;
    menu.hidden = true;
    const action = b.dataset.action;
    if (action === 'budget') openBudget();
    else if (action === 'export-csv') exportCSV();
    else if (action === 'export-ics') {
      if (!state.reminders.length) { toast('Nenhum lembrete para exportar.'); return; }
      download('lembretes-gastos.ics', buildICS(), 'text/calendar');
      toast('Abra o arquivo .ics para adicionar os lembretes ao calendário do celular.');
    } else if (action === 'export-json') {
      const data = { app: 'meus-gastos', version: 1, exportedAt: new Date().toISOString(),
        expenses: state.expenses, reminders: state.reminders, budget: state.budget };
      download(`meus-gastos-backup-${dateISO(new Date())}.json`, JSON.stringify(data, null, 2), 'application/json');
    } else if (action === 'import-json') {
      $('#fileImport').click();
    }
  });

  $('#fileImport').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!data || !Array.isArray(data.expenses) || !Array.isArray(data.reminders)) throw new Error('formato');
      const valid = data.expenses.every((x) => x && typeof x.amount === 'number' && /^\d{4}-\d{2}-\d{2}$/.test(x.date));
      if (!valid) throw new Error('formato');
      if (!confirm(`Restaurar ${data.expenses.length} gastos e ${data.reminders.length} lembretes?\nOs dados atuais serão substituídos.`)) return;
      state.expenses = data.expenses;
      state.reminders = data.reminders;
      state.budget = Number(data.budget) || 0;
      state.reminders.forEach((r) => markPastAlerts(r));
      save();
      render();
      toast('Backup restaurado.');
    } catch {
      toast('Arquivo inválido. Escolha um backup .json gerado por este app.');
    }
  });

  function download(name, text, type) {
    const blob = new Blob([text], { type: `${type};charset=utf-8` });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function exportCSV() {
    const list = state.expenses.filter(inMonth(ui.month)).sort((a, b) => a.date.localeCompare(b.date));
    if (!list.length) { toast('Nenhum gasto neste mês para exportar.'); return; }
    const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = [['Data', 'Descrição', 'Categoria', 'Pagamento', 'Parcela', 'Valor', 'Observação']];
    for (const e of list) {
      rows.push([fmtDM.format(parseDay(e.date)) + '/' + e.date.slice(0, 4), e.title, catOf(e.cat).name,
        e.method, e.inst || '', amountInput(e.amount), e.notes || '']);
    }
    rows.push(['', 'TOTAL', '', '', '', amountInput(list.reduce((s, e) => s + e.amount, 0)), '']);
    // ";" e BOM para abrir certinho no Excel em português.
    download(`gastos-${ui.month}.csv`, '\ufeff' + rows.map((r) => r.map(cell).join(';')).join('\r\n'), 'text/csv');
  }

  function buildICS() {
    const icsText = (s) => String(s).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/[,;]/g, (c) => '\\' + c);
    const icsDate = (iso) => iso.replace(/[-:]/g, '') + '00';
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const RRULE = { weekly: 'FREQ=WEEKLY', monthly: 'FREQ=MONTHLY', yearly: 'FREQ=YEARLY' };
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Meus Gastos//PT-BR', 'CALSCALE:GREGORIAN'];
    for (const r of state.reminders) {
      const end = new Date(new Date(r.due).getTime() + 30 * MIN);
      const title = `Pagar: ${r.title}${r.amount != null ? ` (${money(r.amount)})` : ''}`;
      lines.push('BEGIN:VEVENT', `UID:${r.id}@meus-gastos`, `DTSTAMP:${stamp}`,
        `DTSTART:${icsDate(r.due)}`, `DTEND:${icsDate(toLocalISO(end))}`, `SUMMARY:${icsText(title)}`);
      if (RRULE[r.repeat]) lines.push(`RRULE:${RRULE[r.repeat]}`);
      lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${icsText(title)}`, `TRIGGER:-PT${r.remind}M`, 'END:VALARM');
      lines.push('END:VEVENT');
    }
    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  }

  /* ---------------- Toast ---------------- */
  let toastTimer = null;
  function toast(msg, actionLabel, action) {
    const el = $('#toast');
    el.innerHTML = `<span>${esc(msg)}</span>`;
    if (actionLabel) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = actionLabel;
      b.addEventListener('click', () => { el.hidden = true; action(); });
      el.appendChild(b);
    }
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, actionLabel ? 6000 : 3800);
  }

  /* ---------------- Início ---------------- */
  applyTheme();
  updateBell();
  render();
  renderCalc();
  calcSplit();
  checkReminders();
  setInterval(checkReminders, CHECK_EVERY_MS);
  // Atualiza "hoje/amanhã" e a média diária quando o app volta para a tela.
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) { checkReminders(); render(); }
  });

  // Atalho vindo da tela inicial do celular: ?novo=1
  if (new URLSearchParams(location.search).has('novo')) openExpense();
})();
