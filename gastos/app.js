/* Meus Gastos — controle de gastos e entradas com orçamento, limites por categoria,
   fixos automáticos, lançamento rápido, faturas do cartão, comprovantes e lembretes.
   Os dados ficam salvos no próprio navegador (localStorage; fotos no IndexedDB). */
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

  /* ---------------- Categorias ---------------- */
  const OUT_CATS = [
    { id: 'alimentacao', name: 'Alimentação', color: '#f97316' },
    { id: 'mercado', name: 'Mercado', color: '#22c55e' },
    { id: 'transporte', name: 'Transporte', color: '#3b82f6' },
    { id: 'moradia', name: 'Moradia', color: '#8b5cf6' },
    { id: 'contas', name: 'Contas', color: '#eab308' },
    { id: 'saude', name: 'Saúde', color: '#ef4444' },
    { id: 'lazer', name: 'Lazer', color: '#ec4899' },
    { id: 'compras', name: 'Compras', color: '#14b8a6' },
    { id: 'educacao', name: 'Educação', color: '#6366f1' },
    { id: 'outros', name: 'Outros', color: '#64748b' },
  ].map((c) => ({ ...c, kind: 'out', icon: `c-${c.id}` }));

  const IN_CATS = [
    { id: 'salario', name: 'Salário', color: '#10b981' },
    { id: 'freela', name: 'Freelance', color: '#06b6d4' },
    { id: 'vendas', name: 'Vendas', color: '#f59e0b' },
    { id: 'invest', name: 'Investimentos', color: '#8b5cf6' },
    { id: 'ganhos', name: 'Outros ganhos', color: '#64748b' },
  ].map((c) => ({ ...c, kind: 'in', icon: `c-${c.id}` }));

  const CUSTOM_COLORS = ['#6d5dfc', '#ec4899', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#ef4444', '#a16207', '#64748b'];
  const CUSTOM_ICONS = ['x-star', 'x-pet', 'x-baby', 'x-gift', 'x-plane', 'x-fit', 'x-phone', 'x-shirt', 'x-tool', 'x-coffee',
    'x-music', 'x-church', 'c-moradia', 'c-transporte', 'c-saude', 'c-educacao', 'c-compras', 'c-salario', 'c-vendas', 'c-ganhos'];

  const REPEAT_LABEL = { weekly: 'semanal', monthly: 'mensal', yearly: 'anual' };

  /* ---------------- Estado ---------------- */
  const state = load();
  const ui = {
    view: 'resumo',
    month: monthKey(new Date()),
    search: '',
    cat: 'all',
    kindFilter: 'all',
    kind: 'out',
    editingExp: null,
    editingFixed: null,
    editingRem: null,
    editingGoal: null,
    movingGoal: null,
    moveKind: 'in',
    editingDebt: null,
    payingDebt: null,
    debtDir: 'in',
    showPaid: false,
    showAllRecur: false,
    dayMode: 'cal',
    calSel: null,
    scanToken: null,
    image: null,
    payingRem: null,
    pickedCat: 'alimentacao',
    photo: { data: null, changed: false },
  };

  function load() {
    const empty = {
      expenses: [], reminders: [], budget: 0, theme: 'auto', calcHist: [],
      catBudgets: {}, fixed: [], customCats: [], card: { close: 0, due: 0 }, goals: [], debts: [], notifyOn: true, notifyTested: false,
      privacy: false, pixKey: '', daily: { on: false, time: '21:00', last: '' },
    };
    try {
      const data = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
      if (!data || typeof data !== 'object') return empty;
      return normalize(data, empty);
    } catch {
      return empty;
    }
  }

  function normalize(data, base) {
    const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});
    const card = obj(data.card);
    return {
      ...base,
      expenses: Array.isArray(data.expenses) ? data.expenses : [],
      reminders: Array.isArray(data.reminders) ? data.reminders : [],
      budget: Number(data.budget) || 0,
      theme: ['light', 'dark'].includes(data.theme) ? data.theme : (base.theme || 'auto'),
      calcHist: Array.isArray(data.calcHist) ? data.calcHist.slice(0, 8) : (base.calcHist || []),
      catBudgets: obj(data.catBudgets),
      fixed: Array.isArray(data.fixed) ? data.fixed : [],
      customCats: Array.isArray(data.customCats) ? data.customCats : [],
      card: { close: Number(card.close) || 0, due: Number(card.due) || 0 },
      goals: Array.isArray(data.goals) ? data.goals : [],
      debts: Array.isArray(data.debts) ? data.debts : [],
      notifyOn: data.notifyOn !== false,
      notifyTested: !!data.notifyTested,
      privacy: !!data.privacy,
      pixKey: typeof data.pixKey === 'string' ? data.pixKey : (base.pixKey || ''),
      daily: { on: false, time: '21:00', last: '', ...(data.daily && typeof data.daily === 'object' ? data.daily : base.daily || {}) },
    };
  }

  function save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch {
      toast('Não foi possível salvar no navegador. Verifique se o modo anônimo está desligado.');
    }
  }

  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  const catList = (kind) => [...(kind === 'in' ? IN_CATS : OUT_CATS), ...state.customCats.filter((c) => c.kind === kind)];
  function catOf(id, kind = 'out') {
    return OUT_CATS.find((c) => c.id === id) || IN_CATS.find((c) => c.id === id)
      || state.customCats.find((c) => c.id === id)
      || (kind === 'in' ? IN_CATS[IN_CATS.length - 1] : OUT_CATS[OUT_CATS.length - 1]);
  }
  const kindOf = (e) => (e.kind === 'in' ? 'in' : 'out');
  const isIn = (e) => e.kind === 'in';
  const isOut = (e) => e.kind !== 'in';
  const sum = (list) => list.reduce((s, e) => s + e.amount, 0);

  /* ---------------- Datas ---------------- */
  function pad(n) { return String(n).padStart(2, '0'); }
  function monthKey(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; }
  const dateISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const toLocalISO = (d) => `${dateISO(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const parseDay = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const daysBetween = (a, b) => Math.round((startOfDay(b) - startOfDay(a)) / DAY);
  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const monthDate = (key) => { const [y, m] = key.split('-').map(Number); return new Date(y, m - 1, 1); };

  function shiftMonth(key, delta) {
    const [y, m] = key.split('-').map(Number);
    return monthKey(new Date(y, m - 1 + delta, 1));
  }

  // Dia "day" do mês "key", ajustado para meses mais curtos (31 → 30/28).
  function dayInMonth(key, day) {
    const [y, m] = key.split('-').map(Number);
    return `${key}-${pad(Math.min(day, daysInMonth(y, m - 1)))}`;
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
  // Modo privacidade: a tela mostra "R$ •••". Mensagens, recibos e relatórios usam o valor real (withReal).
  let revealMoney = 0;
  const realMoney = (cents) => brl.format(cents / 100);
  const money = (cents) => (state.privacy && !revealMoney ? 'R$ •••' : realMoney(cents));
  const withReal = (fn) => { revealMoney++; try { return fn(); } finally { revealMoney--; } };
  const signed = (cents) => (state.privacy && !revealMoney ? money(0) : `${cents < 0 ? '−' : ''}${money(Math.abs(cents))}`);
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
  const ico = (id) => `<svg class="ic"><use href="#${id}"/></svg>`;
  const catIcon = (c) => `<span class="cat-ic" style="--c:${c.color}">${ico(c.icon)}</span>`;
  const shortMonth = (key) => fmtShortMonth.format(monthDate(key)).replace('.', '');

  // Anima barras/gráficos: começam zerados e crescem no próximo quadro.
  function animateIn(root) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      $$('[data-w]', root).forEach((el) => { el.style.width = el.dataset.w; });
      $$('[data-h]', root).forEach((el) => { el.style.height = el.dataset.h; });
      $$('[data-d]', root).forEach((el) => { el.setAttribute('stroke-dasharray', el.dataset.d); });
    }));
  }

  const esc = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------------- Fotos (IndexedDB) ---------------- */
  const photos = (() => {
    let dbp = null;
    const open = () => dbp || (dbp = new Promise((resolve, reject) => {
      const req = indexedDB.open('meus-gastos-fotos', 1);
      req.onupgradeneeded = () => req.result.createObjectStore('fotos');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    }));
    const run = async (mode, fn) => {
      const db = await open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('fotos', mode);
        const req = fn(tx.objectStore('fotos'));
        tx.oncomplete = () => resolve(req && req.result);
        tx.onerror = () => reject(tx.error);
      });
    };
    return {
      get: (id) => run('readonly', (s) => s.get(id)).catch(() => null),
      put: (id, data) => run('readwrite', (s) => s.put(data, id)),
      del: (id) => run('readwrite', (s) => s.delete(id)).catch(() => {}),
    };
  })();

  // Reduz a foto (máx. 1280 px, JPEG) para caber bem no aparelho.
  function compressImage(file, max = 1280, quality = 0.72) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k);
        c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('imagem')); };
      img.src = url;
    });
  }

  /* ---------------- Fixos automáticos ---------------- */
  // Lança os fixos de cada mês quando chega o dia (inclusive meses em que o app ficou fechado).
  function runFixed(now = new Date()) {
    const today = dateISO(now);
    const current = monthKey(now);
    let added = 0;
    for (const f of state.fixed) {
      let m = f.last ? shiftMonth(f.last, 1) : f.from;
      while (m <= current) {
        const date = dayInMonth(m, f.day);
        if (date > today) break;
        state.expenses.push({
          id: uid(), kind: f.kind, title: f.title, amount: f.amount, cat: f.cat,
          method: f.method || '', notes: '', date, createdAt: Date.now() + added, fixedId: f.id,
        });
        f.last = m;
        added++;
        m = shiftMonth(m, 1);
      }
    }
    if (added) save();
    return added;
  }

  /* ---------------- Cartão de crédito ---------------- */
  const cardReady = () => state.card.close > 0 && state.card.due > 0;
  // Mês de fechamento da fatura em que a compra entra.
  const invoiceKey = (date) => (Number(date.slice(8, 10)) > state.card.close ? shiftMonth(date.slice(0, 7), 1) : date.slice(0, 7));
  function invoiceDue(key) {
    const dueKey = state.card.due > state.card.close ? key : shiftMonth(key, 1);
    return parseDay(dayInMonth(dueKey, state.card.due));
  }

  /* ---------------- Navegação ---------------- */
  function setView(view) {
    ui.view = view;
    $$('.view').forEach((v) => v.classList.toggle('is-active', v.id === `view-${view}`));
    $$('.tab').forEach((t) => t.classList.toggle('is-active', t.dataset.view === view));
    $('#btnAdd').setAttribute('aria-label', view === 'lembretes' ? 'Novo lembrete' : 'Novo lançamento');
    window.scrollTo({ top: 0 });
  }

  $$('.tab').forEach((t) => t.addEventListener('click', () => setView(t.dataset.view)));
  $$('[data-goto]').forEach((b) => b.addEventListener('click', () => setView(b.dataset.goto)));

  $('#prevMonth').addEventListener('click', () => { ui.month = shiftMonth(ui.month, -1); render(); });
  $('#nextMonth').addEventListener('click', () => { ui.month = shiftMonth(ui.month, 1); render(); });
  $('#monthLabel').addEventListener('click', () => { ui.month = monthKey(new Date()); render(); });

  /* ---------------- Renderização ---------------- */
  const inMonth = (key) => (e) => e.date.startsWith(key);
  const monthOut = (key) => state.expenses.filter((e) => isOut(e) && e.date.startsWith(key));
  const monthIn = (key) => state.expenses.filter((e) => isIn(e) && e.date.startsWith(key));

  function render() {
    $('#monthLabel').textContent = cap(fmtMonth.format(monthDate(ui.month)));
    renderSummary();
    renderExpenses();
    renderReminders();
  }

  function renderSummary() {
    const now = new Date();
    const [y, m] = ui.month.split('-').map(Number);
    const dim = daysInMonth(y, m - 1);
    const list = monthOut(ui.month);
    const total = sum(list);
    const income = sum(monthIn(ui.month));
    const prevKey = shiftMonth(ui.month, -1);
    const prevTotal = sum(monthOut(prevKey));

    const current = ui.month === monthKey(now);
    const past = ui.month < monthKey(now);
    const elapsed = current ? now.getDate() : past ? dim : 0;
    const left = current ? dim - now.getDate() + 1 : past ? 0 : dim;

    $('#sumMonth').textContent = money(total);
    $('#heroLabel').textContent = `Gasto em ${fmtMonthName.format(monthDate(ui.month))}`;
    $('#flowIn').textContent = money(income);
    $('#flowOut').textContent = money(total);
    $('#flowBal').textContent = signed(income - total);

    const cmp = $('#sumCmp');
    if (prevTotal > 0) {
      const diff = Math.round(((total - prevTotal) / prevTotal) * 100);
      const prevName = fmtMonthName.format(monthDate(prevKey));
      cmp.innerHTML = diff === 0
        ? `Igual a ${prevName}`
        : `${ico(diff > 0 ? 'i-up' : 'i-down')}${Math.abs(diff)}% vs. ${prevName}`;
      cmp.hidden = false;
    } else {
      cmp.hidden = true;
    }

    // Orçamento
    const bar = $('#budgetBar');
    const note = $('#budgetNote');
    const budget = state.budget;
    if (budget > 0) {
      const pct = total / budget;
      $('#budgetBox').hidden = false;
      bar.classList.toggle('warn', pct >= 0.8 && pct < 1);
      bar.classList.toggle('over', pct >= 1);
      bar.firstElementChild.style.width = `${Math.min(100, pct * 100)}%`;
      $('#budgetUsed').textContent = `${Math.round(pct * 100)}% usado`;
      $('#budgetOf').textContent = `de ${money(budget)}`;
      const rest = budget - total;
      if (rest < 0) {
        note.innerHTML = `Você passou <strong>${money(-rest)}</strong> do orçamento.`;
      } else if (current) {
        note.innerHTML = `Restam <strong>${money(rest)}</strong> — dá para gastar até ` +
          `<strong>${money(Math.floor(rest / left))}/dia</strong> nos próximos ${left} dia${left > 1 ? 's' : ''}.`;
      } else if (past) {
        note.innerHTML = `Mês fechado com <strong>${money(rest)}</strong> de sobra.`;
      } else {
        note.innerHTML = `Você poderá gastar <strong>${money(Math.floor(rest / dim))}/dia</strong> neste mês.`;
      }
    } else {
      $('#budgetBox').hidden = true;
      note.innerHTML = 'Defina um <strong>orçamento</strong> e o app calcula quanto você ainda pode gastar por dia.';
    }

    // Números automáticos
    const avg = elapsed ? Math.round(total / elapsed) : 0;
    const proj = current ? projection(list, elapsed, dim) : total;
    $('#statAvg').textContent = elapsed ? money(avg) : '—';
    $('#statProj').textContent = money(proj);
    $('#statProj').previousElementSibling.textContent = current ? 'Projeção do mês' : 'Total do mês';
    const max = list.reduce((a, e) => (!a || e.amount > a.amount ? e : a), null);
    $('#statMax').textContent = max ? money(max.amount) : '—';
    $('#statMax').title = max ? max.title : '';
    $('#statCount').textContent = String(list.length);

    renderInsights({ list, total, income, prevKey, current, elapsed, proj });
    renderCategories(list, total);
    renderDaily(list, y, m, dim, now, current);
    renderCalendar(list, y, m, dim, now, current);
    renderCompare();
    renderInvoices(now);
    renderGoals(now);
    renderForecast(now);
    renderRecurring(now);
    renderDebts(now);
    animateIn($('#view-resumo'));

    // Próximos lembretes
    const next = [...state.reminders].sort((a, b) => new Date(a.due) - new Date(b.due)).slice(0, 3);
    $('#nextReminders').innerHTML = next.length
      ? next.map((r) => {
        const st = remStatus(r, now);
        const d = new Date(r.due);
        return `
          <div class="mini">
            ${catIcon(catOf(r.cat))}
            <div class="mini__main">
              <div class="mini__title">${esc(r.title)}</div>
              <div class="mini__sub">${fmtDM.format(d)} · ${pad(d.getHours())}:${pad(d.getMinutes())}${r.amount != null ? ` · ${money(r.amount)}` : ''}</div>
            </div>
            <span class="tag ${st.cls}">${st.label}</span>
          </div>`;
      }).join('')
      : '<p class="empty-sm">Nenhum lembrete. Crie um para não esquecer aluguel, cartão, internet…</p>';
  }

  // Projeção do mês: fixos e parcelas contam uma vez; só o gasto do dia a dia segue o ritmo diário.
  function projection(list, elapsed, dim) {
    const once = (e) => e.fixedId || e.group;
    const known = sum(list.filter(once));
    const daily = sum(list.filter((e) => !once(e)));
    const pendingFixed = sum(state.fixed.filter((f) => f.kind !== 'in' && f.from <= ui.month && (f.last || '') < ui.month));
    return known + pendingFixed + Math.round((daily / Math.max(1, elapsed)) * dim);
  }

  // Frases automáticas sobre o mês.
  function renderInsights({ list, total, income, prevKey, current, elapsed, proj }) {
    const out = [];
    const prevName = fmtMonthName.format(monthDate(prevKey));
    const byCat = (arr) => arr.reduce((m, e) => m.set(e.cat, (m.get(e.cat) || 0) + e.amount), new Map());
    const cur = byCat(list);
    const prev = byCat(monthOut(prevKey));

    // Maior variação de categoria vs. mês anterior
    let best = null;
    for (const [id, v] of cur) {
      const p = prev.get(id) || 0;
      if (!p || Math.abs(v - p) < 2000) continue;
      const pct = Math.round(((v - p) / p) * 100);
      if (!best || Math.abs(pct) > Math.abs(best.pct)) best = { id, pct };
    }
    if (best) {
      const name = catOf(best.id).name;
      out.push(best.pct > 0
        ? { tone: 'bad', icon: 'i-up', html: `Você gastou <strong>${best.pct}% a mais</strong> com ${name} que em ${prevName}.` }
        : { tone: 'good', icon: 'i-down', html: `Você gastou <strong>${-best.pct}% a menos</strong> com ${name} que em ${prevName}.` });
    }

    // Limites por categoria estourados
    for (const [id, lim] of Object.entries(state.catBudgets)) {
      const v = cur.get(id) || 0;
      if (lim > 0 && v > lim) {
        out.push({ tone: 'bad', icon: 'i-target', html: `<strong>${catOf(id).name}</strong> passou do limite em <strong>${money(v - lim)}</strong>.` });
      }
    }

    // Projeção vs. orçamento
    if (current && state.budget > 0 && proj > state.budget && total <= state.budget) {
      out.push({ tone: 'warn', icon: 'i-flag', html: `No ritmo atual, você vai passar <strong>${money(proj - state.budget)}</strong> do orçamento.` });
    }

    // Quanto sobrou do que entrou
    if (income > 0) {
      const saved = income - total;
      out.push(saved >= 0
        ? { tone: 'good', icon: 'i-wallet', html: `Você guardou <strong>${Math.round((saved / income) * 100)}%</strong> do que entrou (${money(saved)}).` }
        : { tone: 'bad', icon: 'i-wallet', html: `Você gastou <strong>${money(-saved)}</strong> a mais do que entrou.` });
    }

    // Fim de semana
    if (list.length >= 5 && total > 0) {
      const wk = sum(list.filter((e) => [0, 6].includes(parseDay(e.date).getDay())));
      const pct = Math.round((wk / total) * 100);
      if (pct >= 35) out.push({ tone: 'neutral', icon: 'i-calendar', html: `<strong>${pct}%</strong> dos gastos foram no fim de semana.` });
    }

    // Dias sem gastar
    if (elapsed >= 5) {
      const days = new Set(list.map((e) => Number(e.date.slice(8, 10))));
      let free = 0;
      for (let d = 1; d <= elapsed; d++) if (!days.has(d)) free++;
      if (free >= 3) out.push({ tone: 'good', icon: 'i-check', html: `Você ficou <strong>${free} dias</strong> sem gastar nada${current ? ' este mês' : ''}.` });
    }

    // Dia mais caro
    if (list.length >= 3) {
      const per = list.reduce((m, e) => m.set(e.date, (m.get(e.date) || 0) + e.amount), new Map());
      const [d, v] = [...per].sort((a, b) => b[1] - a[1])[0];
      out.push({ tone: 'neutral', icon: 'i-activity', html: `Seu dia mais caro foi <strong>${fmtDM.format(parseDay(d))}</strong>, com ${money(v)}.` });
    }

    $('#insightsPanel').hidden = !out.length;
    $('#insights').innerHTML = out.slice(0, 4).map((i) => `
      <div class="insight ${i.tone}">
        <span class="insight__ic">${ico(i.icon)}</span>
        <p>${i.html}</p>
      </div>`).join('');
  }

  // Gráfico de rosca + legenda com barras (e limites por categoria).
  function renderCategories(list, total) {
    const byCat = new Map();
    for (const e of list) byCat.set(e.cat, (byCat.get(e.cat) || 0) + e.amount);
    for (const [id, lim] of Object.entries(state.catBudgets)) if (lim > 0 && !byCat.has(id)) byCat.set(id, 0);
    const rows = [...byCat].sort((a, b) => b[1] - a[1]);
    const spent = rows.filter(([, v]) => v > 0);
    const donut = $('#donut');

    if (!rows.length) {
      donut.hidden = true;
      $('#catBreakdown').innerHTML = '<p class="empty-sm">Sem gastos neste mês. Toque em <strong>+</strong> para lançar.</p>';
      return;
    }

    if (spent.length) {
      const R = 70;
      const C = 2 * Math.PI * R;
      const GAP = spent.length > 1 ? 18 : 0; // espaço entre fatias (compensa a ponta arredondada)
      let offset = 0;
      const arcs = spent.map(([id, v]) => {
        const frac = v / total;
        const len = spent.length > 1 ? Math.max(frac * C - GAP, 0.1) : C;
        const arc = `<circle cx="90" cy="90" r="${R}" stroke="${catOf(id).color}" stroke-dasharray="0 ${C}"
          data-d="${len} ${C}" stroke-dashoffset="${-offset}"${spent.length > 1 ? '' : ' stroke-linecap="butt"'}><title>${esc(catOf(id).name)}</title></circle>`;
        offset += frac * C;
        return arc;
      }).join('');
      donut.hidden = false;
      donut.innerHTML = `
        <svg viewBox="0 0 180 180" aria-hidden="true">
          <circle class="donut__track" cx="90" cy="90" r="${R}"/>
          ${arcs}
        </svg>
        <div class="donut__center"><small>Total</small><strong>${money(total)}</strong></div>`;
    } else {
      donut.hidden = true;
    }

    $('#catBreakdown').innerHTML = rows.map(([id, v]) => {
      const c = catOf(id);
      const pct = total ? (v / total) * 100 : 0;
      const lim = state.catBudgets[id] || 0;
      let cls = '';
      let limitLine = '';
      let barW = pct;
      if (lim > 0) {
        const used = v / lim;
        barW = Math.min(100, used * 100);
        cls = used >= 1 ? ' is-over' : used >= 0.8 ? ' is-warn' : '';
        limitLine = `<div class="leg__limit">${money(v)} de ${money(lim)} · ${used >= 1 ? `passou ${money(v - lim)}` : `restam ${money(lim - v)}`}</div>`;
      }
      return `
        <div class="leg__row${cls}" style="--c:${c.color}">
          ${catIcon(c)}
          <div class="leg__main">
            <div class="leg__top"><span class="leg__name">${esc(c.name)}</span><span class="leg__val">${money(v)}</span></div>
            <div class="leg__bar">
              <div class="leg__track"><span data-w="${barW}%"></span></div>
              <span class="leg__pct">${lim > 0 ? Math.round((v / lim) * 100) : Math.round(pct)}%</span>
            </div>
            ${limitLine}
          </div>
        </div>`;
    }).join('');
  }

  // Colunas com o total de cada dia do mês.
  function renderDaily(list, y, m, dim, now, current) {
    const perDay = new Array(dim).fill(0);
    for (const e of list) perDay[Number(e.date.slice(8, 10)) - 1] += e.amount;
    const max = Math.max(...perDay);
    const today = current ? now.getDate() : 0;
    const isFuture = (day) => (current ? day > today : ui.month > monthKey(now));
    $('#daily').innerHTML = perDay.map((v, i) => {
      const day = i + 1;
      const cls = ['daily__col', v && 'has', day === today && 'today', isFuture(day) && 'future'].filter(Boolean).join(' ');
      const h = max ? (v / max) * 100 : 0;
      return `<div class="${cls}" title="${pad(day)}/${pad(m)}: ${money(v)}"><span style="height:0" data-h="${h}%"></span></div>`;
    }).join('');
    const ticks = [1, 8, 15, 22, dim];
    $('#dailyAxis').innerHTML = ticks.map((d) => `<span>${d}</span>`).join('');
    const peak = perDay.indexOf(max) + 1;
    $('#dailySub').textContent = current
      ? `Hoje: ${money(perDay[today - 1])}`
      : max ? `Maior: dia ${peak}` : '';
  }

  // Saídas x entradas dos últimos 6 meses (até o mês aberto).
  function renderCompare() {
    const months = Array.from({ length: 6 }, (_, i) => shiftMonth(ui.month, i - 5));
    const data = months.map((k) => ({ k, out: sum(monthOut(k)), in: sum(monthIn(k)) }));
    const max = Math.max(1, ...data.map((d) => Math.max(d.out, d.in)));
    const compact = (c) => (state.privacy ? '•••' : c >= 100000 ? `${num.format(Math.round(c / 100000) / 10)} mil` : money(c).replace(/,\d\d$/, ''));
    $('#compare').innerHTML = data.map((d) => `
      <div class="cmp${d.k === ui.month ? ' is-sel' : ''}" title="${cap(fmtMonth.format(monthDate(d.k)))}: saídas ${money(d.out)} · entradas ${money(d.in)}">
        <div class="cmp__bars">
          <span class="cmp__out" data-h="${(d.out / max) * 100}%"></span>
          <span class="cmp__in" data-h="${(d.in / max) * 100}%"></span>
        </div>
        <span class="cmp__label">${shortMonth(d.k)}</span>
        <span class="cmp__val">${d.out ? compact(d.out) : '—'}</span>
      </div>`).join('');
  }

  // Faturas do cartão: soma das compras no crédito (e parcelas) por fatura.
  function renderInvoices(now) {
    const credit = state.expenses.filter((e) => isOut(e) && e.method === 'Crédito');
    const panel = $('#cardPanel');
    panel.hidden = !credit.length && !cardReady();
    if (panel.hidden) return;
    if (!cardReady()) {
      $('#invoices').innerHTML = `<p class="empty-sm">Informe o dia de <strong>fechamento</strong> e de <strong>vencimento</strong> do cartão para ver quanto vem em cada fatura.</p>
        <button type="button" class="btn btn--soft btn--block" data-card-setup>${ico('i-card')}Configurar cartão</button>`;
      return;
    }
    const totals = credit.reduce((m, e) => { const k = invoiceKey(e.date); return m.set(k, (m.get(k) || 0) + e.amount); }, new Map());
    const open = invoiceKey(dateISO(now));
    const keys = [shiftMonth(open, -1), open, shiftMonth(open, 1), shiftMonth(open, 2)];
    const today = startOfDay(now);
    const rows = keys.map((k, i) => {
      const due = invoiceDue(k);
      const value = totals.get(k) || 0;
      if (i === 0 && (due < today || !value)) return '';
      if (i > 1 && !value) return '';
      const status = i === 0 ? 'Fechada' : i === 1 ? 'Aberta' : 'Próxima';
      return `
        <div class="invoice${i === 1 ? ' is-open' : ''}">
          <span class="invoice__ic">${ico('i-card')}</span>
          <div class="invoice__main">
            <div class="invoice__title">Fatura de ${fmtMonthName.format(due)}</div>
            <div class="invoice__sub"><span class="invoice__tag">${status}</span>Vence ${fmtDM.format(due)}${i === 1 ? ` · fecha dia ${state.card.close}` : ''}</div>
          </div>
          <span class="invoice__val">${money(value)}</span>
        </div>`;
    }).join('');
    $('#invoices').innerHTML = rows;
  }

  function renderExpenses() {
    const monthList = state.expenses.filter(inMonth(ui.month));
    const kindList = monthList.filter((e) => ui.kindFilter === 'all' || kindOf(e) === ui.kindFilter);
    // Chips de categoria (só as que aparecem no mês)
    const usedIds = [...new Set(kindList.map((e) => e.cat))];
    const used = usedIds.map((id) => catOf(id, kindOf(kindList.find((e) => e.cat === id))));
    if (ui.cat !== 'all' && !usedIds.includes(ui.cat)) ui.cat = 'all';
    $('#fCats').innerHTML = [`<button type="button" class="chip${ui.cat === 'all' ? ' is-active' : ''}" data-cat="all">Todas</button>`]
      .concat(used.map((c) => `<button type="button" class="chip${ui.cat === c.id ? ' is-active' : ''}" data-cat="${c.id}" style="--c:${c.color}">${ico(c.icon)}${esc(c.name)}</button>`))
      .join('');
    $$('#fKind .seg__btn').forEach((b) => b.classList.toggle('is-active', b.dataset.kind === ui.kindFilter));

    const fixedOut = state.fixed.filter((f) => f.kind !== 'in');
    $('#fixedLinkSub').textContent = state.fixed.length
      ? `${state.fixed.length} fixo${state.fixed.length > 1 ? 's' : ''} · ${money(sum(fixedOut))}/mês em gastos`
      : 'Aluguel, internet, salário… lançados sozinhos';

    const q = ui.search;
    const list = kindList
      .filter((e) => ui.cat === 'all' || e.cat === ui.cat)
      .filter((e) => !q || `${e.title} ${e.notes || ''} ${catOf(e.cat, kindOf(e)).name} ${e.method}`.toLowerCase().includes(q))
      .sort((a, b) => (b.date === a.date ? (b.createdAt || 0) - (a.createdAt || 0) : b.date.localeCompare(a.date)));

    const days = new Map();
    for (const e of list) {
      if (!days.has(e.date)) days.set(e.date, []);
      days.get(e.date).push(e);
    }
    const today = dateISO(new Date());
    const yesterday = dateISO(addDays(new Date(), -1));
    const html = [];
    for (const [date, items] of days) {
      const label = date === today ? 'Hoje' : date === yesterday ? 'Ontem' : cap(fmtDay.format(parseDay(date)));
      const outs = sum(items.filter(isOut));
      const ins = sum(items.filter(isIn));
      html.push(`<div class="day"><h3><span>${label}</span><span>${ins ? `<span class="day__in">+${money(ins)}</span>` : ''}${outs ? money(outs) : ''}</span></h3><div class="day__items">`);
      for (const e of items) {
        const c = catOf(e.cat, kindOf(e));
        const meta = [esc(c.name), isOut(e) && e.method, e.inst && `parcela ${e.inst}`, e.notes && esc(e.notes)].filter(Boolean).join(' · ');
        const flags = [e.fixedId && ico('i-repeat'), e.photo && ico('i-clip')].filter(Boolean).join('');
        html.push(`
          <button type="button" class="exp" data-id="${e.id}">
            ${catIcon(c)}
            <span class="exp__main">
              <span class="exp__title">${esc(e.title)}${flags ? `<span class="exp__flags">${flags}</span>` : ''}</span>
              <span class="exp__meta">${meta}</span>
            </span>
            <span class="exp__val${isIn(e) ? ' is-in' : ''}">${isIn(e) ? '+' : ''}${money(e.amount)}</span>
          </button>`);
      }
      html.push('</div></div>');
    }
    $('#expList').innerHTML = html.join('');
    $('#expEmpty').hidden = list.length > 0;
    $('#expEmpty').innerHTML = monthList.length
      ? 'Nada encontrado com esse filtro.'
      : 'Nenhum lançamento neste mês ainda.<br>Toque em <strong>+</strong> para lançar o primeiro.';
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
        `${ico('i-clock')}${pad(d.getHours())}:${pad(d.getMinutes())}`,
        r.repeat !== 'none' && `${ico('i-repeat')}${REPEAT_LABEL[r.repeat]}`,
        `${ico('i-bell')}${remindLabel(r.remind)}`,
      ].filter(Boolean).map((x) => `<span>${x}</span>`).join('');
      return `
        <article class="rem is-${st.state}" data-id="${r.id}" tabindex="0">
          <div class="rem__date"><b>${d.getDate()}</b><small>${fmtShortMonth.format(d).replace('.', '')}</small></div>
          <div class="rem__main">
            <div class="rem__title">${esc(r.title)}</div>
            <div class="rem__meta">${meta}</div>
            <span class="tag ${st.cls}">${st.label}</span>
          </div>
          <div class="rem__side">
            <span class="rem__val">${r.amount != null ? money(r.amount) : ''}</span>
            <button type="button" class="btn btn--primary btn--sm" data-pay="${r.id}">${ico('i-check')}Paguei</button>
          </div>
        </article>`;
    }).join('');
    $('#remEmpty').hidden = list.length > 0;

    const due = list.filter((r) => remStatus(r, now).state !== 'ok' && daysBetween(now, new Date(r.due)) <= 1).length;
    $('#remBadge').hidden = !due;
    $('#remBadge').textContent = String(due);
    $('#btnNotif .dot').hidden = !due;
  }

  /* ---------------- Filtros ---------------- */
  $('#fSearch').addEventListener('input', (e) => { ui.search = e.target.value.trim().toLowerCase(); renderExpenses(); });
  $('#fCats').addEventListener('click', (e) => {
    const b = e.target.closest('[data-cat]');
    if (!b) return;
    ui.cat = b.dataset.cat;
    renderExpenses();
  });
  $('#fKind').addEventListener('click', (e) => {
    const b = e.target.closest('[data-kind]');
    if (!b) return;
    ui.kindFilter = b.dataset.kind;
    renderExpenses();
  });

  /* ---------------- Diálogos (genérico) ---------------- */
  $$('dialog').forEach((dlg) => {
    dlg.addEventListener('click', (e) => {
      if (e.target === dlg || e.target.closest('[data-close]')) dlg.close();
    });
  });

  /* ---------------- Lançamentos: criação ---------------- */
  function splitCents(total, n) {
    const base = Math.floor(total / n);
    const extra = total - base * n;
    return Array.from({ length: n }, (_, i) => base + (i < extra ? 1 : 0));
  }

  // Cria o lançamento (ou as parcelas). Devolve os itens criados.
  function createEntries(data, installments = 1, { fixed = false } = {}) {
    const n = data.kind === 'in' ? 1 : installments;
    const parts = splitCents(data.amount, n);
    const group = n > 1 ? uid() : undefined;
    const first = parseDay(data.date);
    const created = parts.map((cents, i) => ({
      ...data,
      id: uid(),
      amount: cents,
      date: dateISO(addMonths(first, i)),
      createdAt: Date.now() + i,
      ...(group && { group, inst: `${i + 1}/${n}` }),
    }));
    if (fixed && n === 1) {
      const f = {
        id: uid(), kind: data.kind, title: data.title, amount: data.amount, cat: data.cat,
        method: data.method, day: first.getDate(), from: data.date.slice(0, 7), last: data.date.slice(0, 7),
      };
      state.fixed.push(f);
      created[0].fixedId = f.id;
    }
    state.expenses.push(...created);
    return created;
  }

  // Aviso quando um gasto faz a categoria (ou o mês) passar de 80% / 100% do limite.
  function limitWarning(entry) {
    if (entry.kind === 'in') return '';
    const key = entry.date.slice(0, 7);
    const list = monthOut(key);
    const check = (spent, limit, name) => {
      if (!limit) return '';
      const before = spent - entry.amount;
      if (before < limit && spent >= limit) return `${name} passou do limite (${money(spent)} de ${money(limit)})`;
      if (before < limit * 0.8 && spent >= limit * 0.8) return `${name} já usou ${Math.round((spent / limit) * 100)}% do limite`;
      return '';
    };
    return check(sum(list.filter((e) => e.cat === entry.cat)), state.catBudgets[entry.cat], catOf(entry.cat).name)
      || check(sum(list), state.budget, 'O orçamento do mês');
  }

  function undoCreated(created) {
    const ids = new Set(created.map((x) => x.id));
    state.expenses = state.expenses.filter((x) => !ids.has(x.id));
    const fixedId = created[0] && created[0].fixedId;
    if (fixedId) state.fixed = state.fixed.filter((f) => f.id !== fixedId);
    created.forEach((x) => x.photo && photos.del(x.id));
    save();
    render();
  }

  /* ---------------- Formulário de lançamento ---------------- */
  const dlgExp = $('#dlgExp');
  const formExp = $('#formExp');
  const expAmount = $('#expAmount');
  bindLiveAmount(expAmount, $('#expAmountOut'));

  function renderCatPick() {
    $('#catPick').innerHTML = catList(ui.kind).map((c) =>
      `<button type="button" class="cat-opt" data-cat="${c.id}" style="--c:${c.color}">${catIcon(c)}${esc(c.name)}</button>`).join('')
      + `<button type="button" class="cat-opt cat-opt--new" data-newcat>${catIcon({ color: 'var(--muted)', icon: 'i-plus' })}Nova</button>`;
    pickCat(ui.pickedCat);
  }
  $('#catPick').addEventListener('click', (e) => {
    if (e.target.closest('[data-newcat]')) { openCats(true); return; }
    const b = e.target.closest('[data-cat]');
    if (b) pickCat(b.dataset.cat);
  });
  function pickCat(id) {
    const list = catList(ui.kind);
    ui.pickedCat = list.some((c) => c.id === id) ? id : list[0].id;
    $$('#catPick .cat-opt').forEach((b) => b.classList.toggle('is-active', b.dataset.cat === ui.pickedCat));
  }

  function setKind(kind) {
    ui.kind = kind;
    $$('#expKind .seg__btn').forEach((b) => b.classList.toggle('is-active', b.dataset.kind === kind));
    $('#methodWrap').hidden = kind === 'in';
    $('#fixedHint').textContent = kind === 'in'
      ? 'Ex.: salário — entra sozinho todo mês, no mesmo dia'
      : 'Ex.: aluguel, internet — lança sozinho todo mês, no mesmo dia';
    updateTitle();
    renderCatPick();
    updateInstallments();
  }
  $('#expKind').addEventListener('click', (e) => {
    const b = e.target.closest('[data-kind]');
    if (b && !ui.editingExp && !ui.editingFixed) setKind(b.dataset.kind);
  });

  function updateTitle() {
    const word = ui.kind === 'in' ? 'entrada' : 'gasto';
    $('#dlgExpTitle').textContent = ui.editingFixed
      ? `Editar ${word} fixo`
      : ui.editingExp ? `Editar ${word}` : ui.kind === 'in' ? 'Nova entrada' : 'Novo gasto';
  }

  $('#expInst').innerHTML = Array.from({ length: 24 }, (_, i) =>
    `<option value="${i + 1}">${i === 0 ? 'À vista' : `${i + 1}x`}</option>`).join('');

  function updateInstallments() {
    const credit = ui.kind === 'out' && formExp.method.value === 'Crédito' && !ui.editingExp && !ui.editingFixed && !formExp.fixed.checked;
    $('#instWrap').hidden = !credit;
    const n = Number(formExp.installments.value);
    const total = readAmount(expAmount);
    $('#instHint').textContent = credit && n > 1 && Number.isFinite(total) && total > 0
      ? `${n}x de ${money(splitCents(total, n)[0])} — uma parcela lançada em cada mês`
      : '';
  }
  formExp.method.addEventListener('change', updateInstallments);
  formExp.installments.addEventListener('change', updateInstallments);
  formExp.fixed.addEventListener('change', updateInstallments);
  expAmount.addEventListener('input', updateInstallments);

  function defaultDateForMonth() {
    const now = new Date();
    if (ui.month === monthKey(now)) return dateISO(now);
    return `${ui.month}-01`;
  }

  // Abre o formulário: novo (preset), edição de lançamento (exp) ou edição de fixo (fixed).
  function openExpense(exp = null, preset = {}, fixed = null) {
    ui.editingExp = exp ? exp.id : null;
    ui.editingFixed = fixed ? fixed.id : null;
    formExp.reset();
    const src = exp || fixed || preset;
    ui.pickedCat = src.cat || (src.kind === 'in' ? 'salario' : 'alimentacao');
    setKind(src.kind === 'in' ? 'in' : 'out');
    $('#expKind').hidden = !!(exp || fixed);
    $('#expDelete').hidden = !(exp || fixed);
    $('#expDelete').textContent = fixed ? 'Parar de repetir' : 'Excluir';
    expAmount.value = src.amount != null ? amountInput(src.amount) : '';
    formExp.title.value = src.title || '';
    formExp.date.value = fixed ? dayInMonth(monthKey(new Date()), fixed.day) : (src.date || defaultDateForMonth());
    formExp.method.value = src.method || 'Pix';
    formExp.notes.value = src.notes || '';
    formExp.installments.value = String(src.inst && !exp ? src.inst : 1);
    formExp.fixed.checked = !!preset.fixed;
    $('#fixedWrap').hidden = !!(exp || fixed);
    $('#photoBox').hidden = !!fixed;
    setPhoto(null);
    ui.scanToken = null;
    $('#scanStatus').hidden = true;
    if (exp && exp.photo) photos.get(exp.id).then((d) => { if (ui.editingExp === exp.id) setPhoto(d); });
    expAmount._update();
    updateTitle();
    updateInstallments();
    dlgExp.showModal();
    if (!exp && !fixed && !src.amount && !preset.scan) expAmount.focus();
  }

  dlgExp.addEventListener('close', () => { ui.payingRem = null; ui.editingFixed = null; });

  formExp.addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = readAmount(expAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast('Informe um valor válido (ex.: 25,90 ou 12+8,50).');
      expAmount.focus();
      return;
    }
    const data = {
      kind: ui.kind,
      title: formExp.title.value.trim(),
      amount,
      cat: ui.pickedCat,
      date: formExp.date.value,
      method: ui.kind === 'in' ? '' : formExp.method.value,
      notes: formExp.notes.value.trim(),
    };
    if (!data.title || !data.date) return;

    let msg;
    let created = null;
    if (ui.editingFixed) {
      const f = state.fixed.find((x) => x.id === ui.editingFixed);
      Object.assign(f, { title: data.title, amount, cat: data.cat, method: data.method, day: parseDay(data.date).getDate() });
      msg = 'Fixo atualizado. Vale a partir do próximo lançamento.';
    } else if (ui.editingExp) {
      const exp = state.expenses.find((x) => x.id === ui.editingExp);
      Object.assign(exp, data);
      if (ui.photo.changed) await storePhoto(exp, ui.photo.data);
      msg = data.kind === 'in' ? 'Entrada atualizada.' : 'Gasto atualizado.';
    } else {
      const n = data.method === 'Crédito' ? Number(formExp.installments.value) : 1;
      created = createEntries(data, n, { fixed: formExp.fixed.checked });
      if (ui.photo.data) await storePhoto(created[0], ui.photo.data);
      const warn = limitWarning(created[0]);
      if (ui.payingRem) {
        advanceReminder(ui.payingRem);
      } else {
        msg = data.kind === 'in'
          ? `Entrada de ${money(amount)} lançada${formExp.fixed.checked ? ' — repete todo mês' : ''}.`
          : n > 1 ? `Lançado em ${n}x de ${money(created[0].amount)}.`
            : `Gasto de ${money(amount)} lançado${formExp.fixed.checked ? ' — repete todo mês' : ''}.`;
      }
      if (warn) msg = `⚠ ${warn}.`;
      // Mostra o mês do lançamento, para não parecer que sumiu.
      ui.month = data.date.slice(0, 7);
    }
    save();
    dlgExp.close();
    render();
    if (dlgFixed.open) renderFixedList();
    if (msg) {
      if (created) toast(msg, 'Desfazer', () => undoCreated(created));
      else toast(msg);
    }
  });

  $('#expDelete').addEventListener('click', () => {
    if (ui.editingFixed) {
      const f = state.fixed.find((x) => x.id === ui.editingFixed);
      dlgExp.close();
      removeFixed(f);
      return;
    }
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
    // A foto só é apagada de vez se o usuário não desfizer.
    const timer = setTimeout(() => removed.forEach((x) => x.photo && photos.del(x.id)), 6500);
    toast(removed.length > 1 ? `${removed.length} parcelas excluídas.` : 'Lançamento excluído.', 'Desfazer', () => {
      clearTimeout(timer);
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

  /* ---------------- Comprovante (foto) ---------------- */
  function setPhoto(data, changed = false) {
    ui.photo = { data, changed };
    $('#photoThumb').hidden = !data;
    $('#photoRemove').hidden = !data;
    $('#photoImg').src = data || '';
    $('#photoAddLabel').textContent = data ? 'Trocar foto' : 'Adicionar foto';
  }

  async function storePhoto(exp, data) {
    try {
      if (data) { await photos.put(exp.id, data); exp.photo = true; } else { await photos.del(exp.id); delete exp.photo; }
    } catch {
      toast('Não foi possível guardar a foto neste navegador.');
    }
  }

  $('#photoInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      setPhoto(await compressImage(file), true);
    } catch {
      toast('Não foi possível abrir essa imagem.');
    }
  });
  $('#photoRemove').addEventListener('click', () => setPhoto(null, true));
  $('#photoThumb').addEventListener('click', () => {
    $('#photoFull').src = ui.photo.data;
    $('#dlgPhoto').showModal();
  });

  /* ---------------- Lançamento rápido ---------------- */
  const strip = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const KEYWORDS = {
    alimentacao: 'almoco almocos jantar janta lanche lanches restaurante ifood pizza hamburguer burger cafe padaria lanchonete acai sorvete bar cerveja delivery marmita comida pastel churrasco',
    mercado: 'mercado supermercado feira hortifruti acougue atacadao carrefour assai compras-mercado sacolao',
    transporte: 'uber taxi gasolina combustivel etanol estacionamento onibus metro pedagio passagem posto oficina',
    moradia: 'aluguel condominio iptu reforma moveis casa',
    contas: 'luz energia agua internet telefone celular gas netflix spotify assinatura conta streaming',
    saude: 'farmacia remedio medico consulta dentista exame academia hospital',
    lazer: 'cinema show viagem passeio jogo game festa ingresso balada',
    compras: 'roupa roupas sapato tenis loja shopping presente amazon shopee eletronico',
    educacao: 'curso escola faculdade livro livros mensalidade material apostila',
    salario: 'salario adiantamento holerite pagamento-salario',
    freela: 'freela freelance job bico projeto',
    vendas: 'venda vendas vendi',
    invest: 'rendimento rendimentos dividendos juros cdb investimento',
    ganhos: 'reembolso recebi ganhei presente-recebido',
  };
  const KEYMAP = new Map();
  for (const [cat, words] of Object.entries(KEYWORDS)) for (const w of words.split(' ')) KEYMAP.set(w, cat);
  const IN_WORDS = new Set(['recebi', 'salario', 'freela', 'freelance', 'venda', 'vendi', 'ganhei', 'rendimento', 'rendimentos', 'dividendos', 'reembolso', 'holerite']);
  const METHODS = { pix: 'Pix', debito: 'Débito', credito: 'Crédito', cartao: 'Crédito', dinheiro: 'Dinheiro', boleto: 'Boleto' };
  const WEEKDAYS = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
  const FILLERS = new Set(['no', 'na', 'nos', 'nas', 'de', 'do', 'da', 'dos', 'das', 'em', 'com', 'pelo', 'pela', 'e', 'o', 'a', 'pra', 'para',
    'gastei', 'paguei', 'comprei', 'foi', 'um', 'uma', 'reais', 'real']);

  function parseQuick(text) {
    const now = new Date();
    let s = ` ${text.trim()} `;
    let kind = 'out';
    let date = dateISO(now);
    let method = null;
    let inst = 1;
    let amount = null;
    if (/^\s*\+/.test(s)) { kind = 'in'; s = s.replace(/^\s*\+/, ' '); }
    // Data no formato 10/03 ou 10/03/2026
    s = s.replace(/\s(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?(?=\s)/, (m0, d, mo, y) => {
      const yy = y ? (y.length === 2 ? 2000 + Number(y) : Number(y)) : now.getFullYear();
      const dt = new Date(yy, mo - 1, d);
      if (dt.getMonth() !== mo - 1) return m0;
      date = dateISO(dt);
      return ' ';
    });
    // Parcelas: 3x
    s = s.replace(/\s(\d{1,2})\s?x(?=\s)/i, (m0, n) => { inst = Math.min(24, Math.max(1, Number(n))); method = 'Crédito'; return ' '; });
    // Valor (aceita contas: 12+8,50)
    s = s.replace(/\s(?:r\$\s?)?(\d[\d.,]*(?:\s?[+*/-]\s?\d[\d.,]*)*)(?=\s)/i, (m0, ex) => {
      const v = safeEval(ex);
      if (amount == null && Number.isFinite(v) && v > 0) { amount = toCents(v); return ' '; }
      return m0;
    });

    const words = [];
    for (const w of s.split(/\s+/).filter(Boolean)) {
      const k = strip(w).replace(/[^a-z0-9]/g, '');
      if (k === 'hoje') { date = dateISO(now); continue; }
      if (k === 'ontem') { date = dateISO(addDays(now, -1)); continue; }
      if (k === 'anteontem') { date = dateISO(addDays(now, -2)); continue; }
      const wd = WEEKDAYS.indexOf(k.replace(/feira$/, ''));
      if (wd >= 0) { date = dateISO(addDays(now, -((now.getDay() - wd + 7) % 7))); continue; }
      if (METHODS[k]) { method = method || METHODS[k]; continue; }
      if (IN_WORDS.has(k)) kind = 'in';
      words.push(w);
    }
    while (words.length && FILLERS.has(strip(words[0]))) words.shift();
    while (words.length && FILLERS.has(strip(words[words.length - 1]))) words.pop();

    // Categoria: palavras-chave ou nome de categoria personalizada
    const cats = catList(kind);
    let cat = null;
    for (const w of words) {
      const k = strip(w).replace(/[^a-z0-9]/g, '');
      const custom = cats.find((c) => strip(c.name) === k);
      const byKey = KEYMAP.get(k);
      if (custom) { cat = custom.id; break; }
      if (byKey && cats.some((c) => c.id === byKey)) { cat = byKey; break; }
    }
    cat = cat || (kind === 'in' ? 'ganhos' : 'outros');
    const title = words.length ? cap(words.join(' ')) : catOf(cat, kind).name;
    return { kind, amount, title, cat, date, method: kind === 'in' ? '' : (method || 'Pix'), inst: kind === 'in' ? 1 : inst, notes: '' };
  }

  const quickInput = $('#quickInput');
  function dateLabel(iso) {
    const today = dateISO(new Date());
    if (iso === today) return 'Hoje';
    if (iso === dateISO(addDays(new Date(), -1))) return 'Ontem';
    return cap(fmtDay.format(parseDay(iso)));
  }
  function renderQuickPreview() {
    const box = $('#quickPreview');
    const text = quickInput.value.trim();
    if (!text) { box.hidden = true; return; }
    const q = parseQuick(text);
    box.hidden = false;
    if (q.amount == null) {
      box.innerHTML = `<span class="qp__hint">Inclua o valor, ex.: <strong>mercado 89,90</strong> · <strong>uber 23,50 ontem</strong> · <strong>+3500 salário</strong></span>`;
      return;
    }
    const c = catOf(q.cat, q.kind);
    const meta = [c.name, dateLabel(q.date), q.method, q.inst > 1 && `${q.inst}x`].filter(Boolean).join(' · ');
    box.innerHTML = `
      ${catIcon(c)}
      <div class="qp__main"><div class="qp__title">${esc(q.title)}</div><div class="qp__meta">${esc(meta)}</div></div>
      <span class="qp__val${q.kind === 'in' ? ' is-in' : ''}">${q.kind === 'in' ? '+' : ''}${money(q.amount)}</span>
      <button type="button" class="qp__edit" id="quickEdit" aria-label="Ajustar antes de lançar">${ico('i-edit')}</button>`;
  }
  quickInput.addEventListener('input', renderQuickPreview);
  $('#quickPreview').addEventListener('click', (e) => {
    if (!e.target.closest('#quickEdit')) return;
    const q = parseQuick(quickInput.value);
    openExpense(null, { ...q, inst: q.inst });
    quickInput.value = '';
    renderQuickPreview();
  });
  $('#quickForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!quickInput.value.trim()) { quickInput.focus(); return; }
    const q = parseQuick(quickInput.value);
    if (q.amount == null) { toast('Inclua o valor, ex.: "mercado 89,90".'); return; }
    const { inst, ...data } = q;
    const created = createEntries(data, inst);
    const warn = limitWarning(created[0]);
    save();
    ui.month = data.date.slice(0, 7);
    quickInput.value = '';
    renderQuickPreview();
    render();
    const what = data.kind === 'in' ? 'Entrada' : 'Gasto';
    toast(warn ? `⚠ ${warn}.` : `${what} lançado: ${data.title} · ${money(data.amount)}${inst > 1 ? ` em ${inst}x` : ''}.`,
      'Desfazer', () => undoCreated(created));
  });

  /* ---------------- Fixos: lista ---------------- */
  const dlgFixed = $('#dlgFixed');
  function renderFixedList() {
    const list = [...state.fixed].sort((a, b) => (a.kind === b.kind ? a.day - b.day : a.kind === 'in' ? -1 : 1));
    $('#fixedList').innerHTML = list.length
      ? list.map((f) => {
        const c = catOf(f.cat, f.kind);
        return `
          <div class="fixed-item" data-id="${f.id}" role="button" tabindex="0">
            ${catIcon(c)}
            <span class="fixed-item__main"><strong>${esc(f.title)}</strong><small>Todo dia ${f.day} · ${esc(c.name)}${f.method ? ` · ${f.method}` : ''}</small></span>
            <span class="fixed-item__val${f.kind === 'in' ? ' is-in' : ''}">${f.kind === 'in' ? '+' : ''}${money(f.amount)}</span>
            <button type="button" class="del" data-del="${f.id}" aria-label="Parar de repetir">${ico('i-trash')}</button>
          </div>`;
      }).join('')
      : '<p class="empty-sm">Nenhum fixo ainda. Ao lançar um gasto ou entrada, ligue <strong>“Repetir todo mês”</strong> — ou use os botões abaixo.</p>';
  }
  function openFixed() { renderFixedList(); dlgFixed.showModal(); }
  function removeFixed(f) {
    if (!f) return;
    state.fixed = state.fixed.filter((x) => x !== f);
    save();
    render();
    if (dlgFixed.open) renderFixedList();
    toast(`"${f.title}" não vai mais repetir. Os lançamentos já feitos continuam.`, 'Desfazer', () => {
      state.fixed.push(f);
      save();
      render();
      if (dlgFixed.open) renderFixedList();
    });
  }
  $('#fixedList').addEventListener('click', (e) => {
    const del = e.target.closest('[data-del]');
    if (del) { removeFixed(state.fixed.find((f) => f.id === del.dataset.del)); return; }
    const item = e.target.closest('.fixed-item');
    if (item) openExpense(null, {}, state.fixed.find((f) => f.id === item.dataset.id));
  });
  $('#fixedNewOut').addEventListener('click', () => openExpense(null, { kind: 'out', fixed: true, cat: 'moradia' }));
  $('#fixedNewIn').addEventListener('click', () => openExpense(null, { kind: 'in', fixed: true, cat: 'salario', title: 'Salário' }));
  $('#fixedLink').addEventListener('click', openFixed);

  /* ---------------- Categorias personalizadas ---------------- */
  const dlgCats = $('#dlgCats');
  const formCat = $('#formCat');
  const newCat = { kind: 'out', color: CUSTOM_COLORS[0], icon: CUSTOM_ICONS[0], fromExpense: false };

  $('#newCatColors').innerHTML = CUSTOM_COLORS.map((c) =>
    `<button type="button" class="swatch" data-color="${c}" style="--c:${c}" aria-label="Cor ${c}"></button>`).join('');
  $('#newCatIcons').innerHTML = CUSTOM_ICONS.map((i) =>
    `<button type="button" class="icon-opt" data-icon="${i}" aria-label="Ícone">${ico(i)}</button>`).join('');

  function renderNewCat() {
    $$('#newCatColors .swatch').forEach((b) => b.classList.toggle('is-active', b.dataset.color === newCat.color));
    $$('#newCatIcons .icon-opt').forEach((b) => b.classList.toggle('is-active', b.dataset.icon === newCat.icon));
    $('#newCatIcons').style.setProperty('--c', newCat.color);
    $$('#newCatKind .seg__btn').forEach((b) => b.classList.toggle('is-active', b.dataset.kind === newCat.kind));
    const prev = $('#newCatPreview');
    prev.style.setProperty('--c', newCat.color);
    prev.innerHTML = ico(newCat.icon);
  }
  function renderCustomCats() {
    $('#customCatList').innerHTML = state.customCats.length
      ? state.customCats.map((c) => `
        <div class="fixed-item">
          ${catIcon(c)}
          <span class="fixed-item__main"><strong>${esc(c.name)}</strong><small>${c.kind === 'in' ? 'Para entradas' : 'Para gastos'}</small></span>
          <button type="button" class="del" data-delcat="${c.id}" aria-label="Excluir categoria">${ico('i-trash')}</button>
        </div>`).join('')
      : '<p class="empty-sm">Crie categorias suas, como <strong>Pet</strong>, <strong>Filhos</strong> ou <strong>Viagem</strong>.</p>';
  }
  function openCats(fromExpense = false) {
    newCat.fromExpense = fromExpense;
    newCat.kind = fromExpense ? ui.kind : 'out';
    formCat.reset();
    renderNewCat();
    renderCustomCats();
    dlgCats.showModal();
  }
  $('#newCatColors').addEventListener('click', (e) => { const b = e.target.closest('[data-color]'); if (b) { newCat.color = b.dataset.color; renderNewCat(); } });
  $('#newCatIcons').addEventListener('click', (e) => { const b = e.target.closest('[data-icon]'); if (b) { newCat.icon = b.dataset.icon; renderNewCat(); } });
  $('#newCatKind').addEventListener('click', (e) => { const b = e.target.closest('[data-kind]'); if (b) { newCat.kind = b.dataset.kind; renderNewCat(); } });
  formCat.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#newCatName').value.trim();
    if (!name) return;
    if (catList(newCat.kind).some((c) => strip(c.name) === strip(name))) { toast('Já existe uma categoria com esse nome.'); return; }
    const c = { id: `u${uid()}`, name: cap(name), color: newCat.color, icon: newCat.icon, kind: newCat.kind };
    state.customCats.push(c);
    save();
    refreshCatSelects();
    render();
    if (newCat.fromExpense && dlgExp.open) {
      if (ui.kind !== c.kind) setKind(c.kind);
      ui.pickedCat = c.id;
      renderCatPick();
      dlgCats.close();
    } else {
      formCat.reset();
      renderCustomCats();
    }
    toast(`Categoria "${c.name}" criada.`);
  });
  $('#customCatList').addEventListener('click', (e) => {
    const b = e.target.closest('[data-delcat]');
    if (!b) return;
    const c = state.customCats.find((x) => x.id === b.dataset.delcat);
    const uses = state.expenses.filter((x) => x.cat === c.id).length;
    if (uses && !confirm(`"${c.name}" tem ${uses} lançamento(s). Eles passam a aparecer como "${c.kind === 'in' ? 'Outros ganhos' : 'Outros'}". Excluir mesmo assim?`)) return;
    state.customCats = state.customCats.filter((x) => x !== c);
    delete state.catBudgets[c.id];
    save();
    refreshCatSelects();
    renderCustomCats();
    render();
  });

  /* ---------------- Lembretes ---------------- */
  const dlgRem = $('#dlgRem');
  const formRem = $('#formRem');
  const remAmount = $('#remAmount');
  bindLiveAmount(remAmount, $('#remAmountOut'), { optional: true });
  function refreshCatSelects() {
    const v = $('#remCat').value;
    $('#remCat').innerHTML = catList('out').map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('');
    if (v) $('#remCat').value = v;
    if (dlgExp.open) renderCatPick();
  }

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
      formRem.date.value = dateISO(addDays(new Date(), 3));
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
    if ('Notification' in window && Notification.permission === 'default' && state.notifyOn) await enableAlerts();
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
    openExpense(null, { kind: 'out', title: rem.title, amount: rem.amount ?? undefined, cat: rem.cat, date: dateISO(new Date()), method: 'Pix' });
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
  // Lembretes ligados = navegador permite E o usuário deixou o sino ligado no app.
  const alertsOn = () => canNotify() && state.notifyOn;

  function updateBell() {
    const b = $('#btnNotif');
    const on = alertsOn();
    b.classList.toggle('is-on', on);
    $('use', b).setAttribute('href', on ? '#i-bell-on' : canNotify() ? '#i-bell-off' : '#i-bell');
    b.title = on ? 'Lembretes ligados — toque para desligar' : 'Lembretes desligados — toque para ligar';
    b.setAttribute('aria-label', on ? 'Desligar lembretes' : 'Ligar lembretes');
    b.setAttribute('aria-pressed', String(on));
  }

  // Anima o sino: "ring" balança; "on" adiciona ondas e o "pulo" ao ligar; "off" encolhe ao desligar.
  let ringTimer = null;
  function ringBell(mode = 'ring') {
    const b = $('#btnNotif');
    b.classList.remove('is-ringing', 'is-activating', 'is-deactivating');
    void b.offsetWidth; // reinicia a animação
    if (mode === 'off') b.classList.add('is-deactivating');
    else b.classList.add('is-ringing');
    if (mode === 'on') b.classList.add('is-activating');
    clearTimeout(ringTimer);
    ringTimer = setTimeout(() => b.classList.remove('is-ringing', 'is-activating', 'is-deactivating'), 1700);
  }

  const getReg = async () => swReg || (navigator.serviceWorker && (await navigator.serviceWorker.getRegistration().catch(() => null)));

  // Liga os lembretes (pede permissão ao navegador na primeira vez).
  async function enableAlerts() {
    if (!('Notification' in window)) {
      toast('Este navegador não suporta notificações. Use “Lembretes p/ calendário” no menu ⋯.');
      return;
    }
    if (Notification.permission === 'denied') {
      toast('As notificações estão bloqueadas. Libere nas configurações do celular para o app Meus Gastos.');
      return;
    }
    if (Notification.permission === 'default') {
      const p = await Notification.requestPermission();
      if (p !== 'granted') { updateBell(); return; }
    }
    state.notifyOn = true;
    const first = !state.notifyTested;
    state.notifyTested = true;
    save();
    updateBell();
    ringBell('on');
    beep();
    toast('Lembretes ligados 🔔 Você será avisado no horário escolhido.');
    // Só na primeira vez: um aviso de exemplo, que some sozinho.
    if (first) notify('Meus Gastos', 'Pronto! Os lembretes vão aparecer assim.', 'teste', { quiet: true });
  }

  function disableAlerts() {
    state.notifyOn = false;
    save();
    updateBell();
    ringBell('off');
    toast('Lembretes desligados. Toque no sino para ligar de novo.');
  }

  const toggleAlerts = () => (alertsOn() ? disableAlerts() : enableAlerts());

  $('#btnNotif').addEventListener('click', toggleAlerts);

  async function notify(title, body, tag, { quiet = false, vibrate = null, url = '' } = {}) {
    if (!quiet) {
      ringBell();
      if (state.notifyOn) beep();
      // Com o app aberto, vibra o celular na hora também.
      if (vibrate && state.notifyOn && navigator.vibrate && document.visibilityState === 'visible') navigator.vibrate(vibrate);
    }
    // A notificação fica na barra até o usuário limpar (o app nunca apaga sozinho).
    if (!alertsOn()) return;
    const opts = { body, tag, icon: 'icon-192.png', badge: 'badge-96.png', renotify: false, vibrate: vibrate || [80, 40, 80], data: { url } };
    try {
      const reg = await getReg();
      if (reg) {
        await reg.showNotification(title, opts);
        return;
      }
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

  /* ---------------- Metas de economia ---------------- */
  const goalSaved = (g) => g.moves.reduce((t, mv) => t + mv.amount, 0);
  const RING_C = 2 * Math.PI * 26;
  const ring = (pct, inner) => `
    <span class="ring"><svg viewBox="0 0 60 60" aria-hidden="true">
      <circle class="ring__track" cx="30" cy="30" r="26"/>
      <circle class="ring__bar" cx="30" cy="30" r="26" stroke-dasharray="0 ${RING_C}" data-d="${Math.max(0.01, (pct / 100) * RING_C)} ${RING_C}"/>
    </svg><span class="ring__in">${inner}</span></span>`;

  // Quanto falta e quanto guardar por mês para chegar no prazo.
  function goalPlan(g, now = new Date()) {
    const saved = goalSaved(g);
    const left = Math.max(0, g.target - saved);
    const pct = g.target ? Math.min(100, (saved / g.target) * 100) : 0;
    const base = { saved, left, pct, done: left === 0, late: false };
    if (!left) return { ...base, text: 'Meta concluída! 🎉' };
    if (!g.deadline) return { ...base, text: `Faltam <strong>${money(left)}</strong>` };
    const d = parseDay(g.deadline);
    if (d < startOfDay(now)) return { ...base, late: true, text: `O prazo passou · faltam ${money(left)}` };
    const diff = (d.getFullYear() - now.getFullYear()) * 12 + d.getMonth() - now.getMonth();
    const months = Math.max(1, diff + (d.getDate() >= now.getDate() ? 1 : 0));
    // O que já foi guardado neste mês conta para a parcela deste mês.
    const thisMonth = Math.max(0, g.moves.filter((mv) => !mv.start && mv.date.startsWith(monthKey(now))).reduce((t, mv) => t + mv.amount, 0));
    const per = Math.ceil((left + thisMonth) / months);
    const until = months <= 1 ? `até ${fmtDM.format(d)}` : `até ${fmtMonthName.format(d)}${d.getFullYear() !== now.getFullYear() ? ` de ${d.getFullYear()}` : ''}`;
    return { ...base, per, text: `Guarde <strong>${money(per)}${months > 1 ? '/mês' : ''}</strong> ${until}` };
  }

  function renderGoals(now) {
    const list = [...state.goals].map((g) => ({ g, plan: goalPlan(g, now) }))
      .sort((a, b) => (a.plan.done - b.plan.done) || (a.g.deadline || '9999').localeCompare(b.g.deadline || '9999'));
    $('#goals').innerHTML = list.length
      ? list.map(({ g, plan }) => `
        <button type="button" class="goal${plan.done ? ' is-done' : ''}${plan.late ? ' is-late' : ''}" data-goal="${g.id}" style="--c:${g.color}">
          ${ring(plan.pct, ico(g.icon))}
          <span class="goal__main">
            <span class="goal__name"><span>${esc(g.name)}</span></span>
            <span class="goal__nums">${money(plan.saved)} <small>de ${money(g.target)}</small></span>
            <span class="goal__sub">${plan.text}</span>
          </span>
          <span class="goal__pct">${Math.floor(plan.pct)}%</span>
        </button>`).join('')
      : `<div class="goals__empty"><p class="empty-sm">Junte dinheiro para algo especial: viagem, reserva de emergência, celular novo…</p>
          <button type="button" class="btn btn--soft btn--sm" data-newgoal>${ico('i-plus')}Criar</button></div>`;
  }

  // Criar / editar
  const dlgGoal = $('#dlgGoal');
  const formGoal = $('#formGoal');
  const goalStyle = { color: CUSTOM_COLORS[7], icon: 'x-plane' };
  bindLiveAmount($('#goalTarget'), $('#goalTargetOut'));
  bindLiveAmount($('#goalStart'), $('#goalStartOut'), { optional: true });
  $('#goalColors').innerHTML = CUSTOM_COLORS.map((c) =>
    `<button type="button" class="swatch" data-color="${c}" style="--c:${c}" aria-label="Cor ${c}"></button>`).join('');
  $('#goalIcons').innerHTML = ['x-plane', 'i-piggy', 'x-star', 'c-moradia', 'c-transporte', 'x-phone', 'x-gift', 'c-educacao', 'x-baby', 'x-pet',
    'c-saude', 'x-fit', 'x-music', 'c-compras', 'c-invest', 'c-ganhos'].map((i) =>
    `<button type="button" class="icon-opt" data-icon="${i}" aria-label="Ícone">${ico(i)}</button>`).join('');

  function renderGoalStyle() {
    $$('#goalColors .swatch').forEach((b) => b.classList.toggle('is-active', b.dataset.color === goalStyle.color));
    $$('#goalIcons .icon-opt').forEach((b) => b.classList.toggle('is-active', b.dataset.icon === goalStyle.icon));
    $('#goalIcons').style.setProperty('--c', goalStyle.color);
    const prev = $('#goalPreview');
    prev.style.setProperty('--c', goalStyle.color);
    prev.innerHTML = ico(goalStyle.icon);
  }
  $('#goalColors').addEventListener('click', (e) => { const b = e.target.closest('[data-color]'); if (b) { goalStyle.color = b.dataset.color; renderGoalStyle(); } });
  $('#goalIcons').addEventListener('click', (e) => { const b = e.target.closest('[data-icon]'); if (b) { goalStyle.icon = b.dataset.icon; renderGoalStyle(); } });

  function openGoal(goal = null) {
    ui.editingGoal = goal ? goal.id : null;
    formGoal.reset();
    $('#dlgGoalTitle').textContent = goal ? 'Editar meta' : 'Nova meta';
    $('#goalDelete').hidden = !goal;
    $('#goalStartWrap').hidden = !!goal;
    goalStyle.color = goal ? goal.color : CUSTOM_COLORS[7];
    goalStyle.icon = goal ? goal.icon : 'x-plane';
    if (goal) {
      formGoal.name.value = goal.name;
      $('#goalTarget').value = amountInput(goal.target);
      formGoal.deadline.value = goal.deadline || '';
    }
    $('#goalTarget')._update();
    $('#goalStart')._update();
    renderGoalStyle();
    dlgGoal.showModal();
  }
  $('#btnNewGoal').addEventListener('click', () => openGoal());
  $('#goals').addEventListener('click', (e) => {
    if (e.target.closest('[data-newgoal]')) { openGoal(); return; }
    const b = e.target.closest('[data-goal]');
    if (b) openMove(state.goals.find((g) => g.id === b.dataset.goal));
  });

  formGoal.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = formGoal.name.value.trim();
    const target = readAmount($('#goalTarget'));
    const start = readAmount($('#goalStart'));
    if (!name) return;
    if (!Number.isFinite(target) || target <= 0) { toast('Informe quanto quer juntar.'); return; }
    if (Number.isNaN(start)) { toast('Valor inválido em "Já tenho guardado".'); return; }
    const data = { name: cap(name), target, deadline: formGoal.deadline.value || '', color: goalStyle.color, icon: goalStyle.icon };
    if (ui.editingGoal) {
      Object.assign(state.goals.find((g) => g.id === ui.editingGoal), data);
      toast('Meta atualizada.');
    } else {
      const g = { id: uid(), ...data, moves: [], createdAt: Date.now() };
      if (start > 0) g.moves.push({ id: uid(), date: dateISO(new Date()), amount: start, start: true });
      state.goals.push(g);
      const plan = goalPlan(g);
      toast(plan.per ? `Meta criada! Guarde ${money(plan.per)} por mês para chegar lá.` : 'Meta criada!');
    }
    save();
    dlgGoal.close();
    if (dlgMove.open) renderMove();
    renderSummary();
  });

  $('#goalDelete').addEventListener('click', () => {
    const g = state.goals.find((x) => x.id === ui.editingGoal);
    if (!g || !confirm(`Excluir a meta "${g.name}"?`)) return;
    state.goals = state.goals.filter((x) => x !== g);
    save();
    dlgGoal.close();
    if (dlgMove.open) dlgMove.close();
    renderSummary();
    toast('Meta excluída.', 'Desfazer', () => { state.goals.push(g); save(); renderSummary(); });
  });

  // Guardar / retirar
  const dlgMove = $('#dlgGoalMove');
  const formMove = $('#formMove');
  const moveAmount = $('#moveAmount');
  bindLiveAmount(moveAmount, $('#moveAmountOut'));

  function setMoveKind(kind) {
    ui.moveKind = kind;
    $$('#moveKind .seg__btn').forEach((b) => b.classList.toggle('is-active', b.dataset.kind === kind));
    $('#moveHint').textContent = kind === 'in' ? 'Quanto você guardou agora' : 'Quanto você tirou da meta';
    $('#moveSubmit').textContent = kind === 'in' ? 'Guardar' : 'Retirar';
  }
  $('#moveKind').addEventListener('click', (e) => { const b = e.target.closest('[data-kind]'); if (b) setMoveKind(b.dataset.kind); });

  function renderMove() {
    const g = state.goals.find((x) => x.id === ui.movingGoal);
    if (!g) return;
    const plan = goalPlan(g);
    $('#moveTitle').textContent = g.name;
    const hero = $('#moveHero');
    hero.style.setProperty('--c', g.color);
    hero.innerHTML = `
      ${ring(plan.pct, `${Math.floor(plan.pct)}%`)}
      <span class="goal__main${plan.done ? ' is-done' : ''}">
        <span class="goal__nums">${money(plan.saved)}</span>
        <span class="goal__sub">de ${money(g.target)}${g.deadline ? ` · até ${fmtDM.format(parseDay(g.deadline))}/${g.deadline.slice(0, 4)}` : ''}</span>
        <span class="goal__sub">${plan.text}</span>
      </span>`;
    const moves = [...g.moves].reverse().slice(0, 6);
    $('#moveHist').innerHTML = moves.length
      ? `<span class="label">Últimas movimentações</span>` + moves.map((mv) => `
        <div class="goal-hist__row"><span>${fmtDM.format(parseDay(mv.date))}/${mv.date.slice(0, 4)}</span>
          <b class="${mv.amount >= 0 ? 'is-in' : 'is-out'}">${mv.amount >= 0 ? '+' : '−'}${money(Math.abs(mv.amount))}</b></div>`).join('')
      : '';
    animateIn(hero);
  }

  function openMove(g) {
    if (!g) return;
    ui.movingGoal = g.id;
    formMove.reset();
    setMoveKind('in');
    const plan = goalPlan(g);
    if (plan.per && !plan.done) moveAmount.value = amountInput(plan.per);
    moveAmount._update();
    renderMove();
    dlgMove.showModal();
  }
  $('#moveEdit').addEventListener('click', () => openGoal(state.goals.find((x) => x.id === ui.movingGoal)));

  formMove.addEventListener('submit', (e) => {
    e.preventDefault();
    const g = state.goals.find((x) => x.id === ui.movingGoal);
    const amount = readAmount(moveAmount);
    if (!g) return;
    if (!Number.isFinite(amount) || amount <= 0) { toast('Informe um valor válido.'); return; }
    const before = goalSaved(g);
    if (ui.moveKind === 'out' && amount > before) { toast(`Você tem só ${money(before)} guardado nesta meta.`); return; }
    g.moves.push({ id: uid(), date: dateISO(new Date()), amount: ui.moveKind === 'in' ? amount : -amount });
    save();
    dlgMove.close();
    renderSummary();
    const plan = goalPlan(g);
    if (before < g.target && plan.done) {
      celebrate();
      toast(`🎉 Parabéns! Você completou a meta "${g.name}"!`);
    } else {
      toast(ui.moveKind === 'in' ? `Guardado! Faltam ${money(plan.left)} para "${g.name}".` : `Retirado. Faltam ${money(plan.left)} para "${g.name}".`);
    }
  });

  function celebrate() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const box = document.createElement('div');
    box.className = 'confetti';
    const colors = ['#7c6cff', '#9b3cf0', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4'];
    box.innerHTML = Array.from({ length: 70 }, () => {
      const left = Math.random() * 100;
      const style = `left:${left}%;background:${colors[Math.floor(Math.random() * colors.length)]};` +
        `--dx:${(Math.random() - 0.5) * 160}px;--rot:${Math.round(Math.random() * 720)}deg;animation-delay:${Math.random() * 0.4}s`;
      return `<i style="${style}"></i>`;
    }).join('');
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 2600);
  }

  /* ---------------- Lançar por voz ---------------- */
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec = null;
  // "30 reais e 50 centavos" → "30,50"; tira palavras como "reais" que atrapalham a leitura.
  function speechToText(t) {
    return t.toLowerCase()
      .replace(/(\d+)\s*(?:reais|real)\s*e\s*(\d{1,2})\s*centavos?/g, (m, r, c) => `${r},${c.padStart(2, '0')}`)
      .replace(/(\d+)\s*centavos?/g, (m, c) => `0,${c.padStart(2, '0')}`)
      .replace(/r\$\s*/g, '')
      .replace(/(^|\s)(reais|real|contos?|pilas?)(?=\s|$)/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }
  $('#quickMic').addEventListener('click', () => {
    if (rec) { rec.stop(); return; }
    if (!SpeechRec) {
      quickInput.focus();
      toast('Este navegador não tem ditado no app. Use o 🎤 do teclado do celular e fale o gasto.');
      return;
    }
    const mic = $('#quickMic');
    const field = $('.quick__field');
    const placeholder = quickInput.placeholder;
    const stopUI = () => {
      mic.classList.remove('is-listening');
      field.classList.remove('is-listening');
      quickInput.placeholder = placeholder;
    };
    let heard = '';
    rec = new SpeechRec();
    rec.lang = 'pt-BR';
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      heard = speechToText([...e.results].map((r) => r[0].transcript).join(' '));
      quickInput.value = heard;
      renderQuickPreview();
    };
    rec.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') toast('Permita o uso do microfone para falar o gasto.');
      else if (e.error === 'no-speech') toast('Não ouvi nada. Toque no 🎤 e fale de novo.');
      else if (e.error === 'network') toast('O ditado precisa de internet.');
    };
    rec.onend = () => {
      stopUI();
      rec = null;
      if (heard && parseQuick(heard).amount != null) toast('Confira a prévia e toque em ➜ para lançar.');
    };
    try {
      rec.start();
      mic.classList.add('is-listening');
      field.classList.add('is-listening');
      quickInput.value = '';
      renderQuickPreview();
      quickInput.placeholder = 'Ouvindo… ex.: "gastei 30 reais no mercado"';
    } catch {
      rec = null;
      stopUI();
      toast('Não foi possível usar o microfone agora.');
    }
  });

  /* ---------------- Ler comprovante pela foto ---------------- */
  // Leitor de texto (Tesseract.js) carregado só quando usado; os dados ficam guardados no aparelho depois.
  const TESS = {
    script: 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js',
    workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/worker.min.js',
    corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.1',
    langPath: 'https://cdn.jsdelivr.net/gh/naptha/tessdata@gh-pages/4.0.0_fast',
  };
  let ocrWorkerP = null;
  let ocrProgress = null;
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const el = document.createElement('script');
      el.src = src;
      el.onload = resolve;
      el.onerror = () => { el.remove(); reject(new Error('script')); };
      document.head.appendChild(el);
    });
  }
  function getOCR() {
    if (!ocrWorkerP) {
      ocrWorkerP = (async () => {
        if (!window.Tesseract) await loadScript(TESS.script);
        return window.Tesseract.createWorker('por', 1, {
          workerPath: TESS.workerPath, corePath: TESS.corePath, langPath: TESS.langPath,
          logger: (m) => ocrProgress && ocrProgress(m),
        });
      })().catch((err) => { ocrWorkerP = null; throw err; });
    }
    return ocrWorkerP;
  }

  const MONEY_RE = /(\d{1,3}(?:\.\d{3})+,\d{2}|\d+[.,]\d{2})(?!\d)/g;
  function moneyToCents(raw) {
    let t = raw;
    if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
    return Math.round(parseFloat(t) * 100);
  }
  const RECEIPT_CATS = [
    [/SUPERMERC|MERCADO|ATACAD|HORTIFRUT|ACOUGUE|SACOLAO|ASSAI|CARREFOUR/, 'mercado'],
    [/FARMA|DROGA|DROGARIA/, 'saude'],
    [/POSTO|COMBUST|GASOLINA|ETANOL|DIESEL/, 'transporte'],
    [/RESTAUR|LANCHON|PADARIA|PIZZ|HAMBURG|BURGER|CAFE|SORVET|ACAI|BAR\b/, 'alimentacao'],
    [/MAGAZINE|LOJA|CALCAD|MODA|ROUPA/, 'compras'],
    [/ENERGIA|SANEAMENTO|AGUA|TELEFON|INTERNET/, 'contas'],
  ];
  // Procura o total, a data e o nome da loja no texto lido do cupom.
  function parseReceipt(text) {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    const upper = lines.map((l) => strip(l).toUpperCase());
    const amounts = (l) => [...l.matchAll(MONEY_RE)].map((m) => moneyToCents(m[1])).filter((v) => v > 0 && v < 5000000);
    const BAD = /TROCO|DINHEIRO|RECEBID|CPF|CNPJ|DESCONTO|ACRESC|TRIBUT|IMPOSTO|LEI 12|QTD|QUANT|ITENS|SUBTOTAL|SUB TOTAL/;
    const KEYS = [/VALOR A PAGAR/, /TOTAL A PAGAR/, /VALOR TOTAL/, /TOTAL GERAL/, /\bTOTAL\b/, /VALOR PAGO/, /\bPAGO\b/];
    let amount = null;
    for (const key of KEYS) {
      for (let i = 0; i < upper.length && amount == null; i++) {
        if (!key.test(upper[i]) || BAD.test(upper[i])) continue;
        const here = amounts(lines[i]);
        const next = i + 1 < lines.length && !BAD.test(upper[i + 1]) ? amounts(lines[i + 1]) : [];
        const found = here.length ? here : next;
        if (found.length) amount = found[found.length - 1];
      }
      if (amount != null) break;
    }
    if (amount == null) {
      const all = lines.flatMap((l, i) => (BAD.test(upper[i]) ? [] : amounts(l)));
      if (all.length) amount = Math.max(...all);
    }
    let date = null;
    const today = startOfDay(new Date());
    for (const m of text.matchAll(/(\d{2})[/.-](\d{2})[/.-](\d{4}|\d{2})(?!\d)/g)) {
      const y = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
      const d = new Date(y, Number(m[2]) - 1, Number(m[1]));
      if (d.getMonth() === Number(m[2]) - 1 && d <= today && today - d < 730 * DAY) { date = dateISO(d); break; }
    }
    const SKIP = /CNPJ|CPF|CUPOM|NOTA|DOCUMENTO|EXTRATO|\bSAT\b|NFC|NF-E|ENDERE|\bRUA\b|\bAV\b|AVENIDA|CEP|\bIE\b|DANFE|CONSUMIDOR|FISCAL|ELETRONIC|TEL|FONE/;
    let title = null;
    for (let i = 0; i < Math.min(lines.length, 6); i++) {
      const letters = (lines[i].match(/[A-Za-zÀ-ÿ]/g) || []).length;
      if (letters >= 4 && letters / lines[i].length > 0.55 && !SKIP.test(upper[i])) {
        title = lines[i].toLowerCase().replace(/[^\p{L}\p{N}&\s.-]/gu, '').replace(/\s+/g, ' ').trim()
          .replace(/(^|\s)\p{L}/gu, (c) => c.toUpperCase()).slice(0, 32);
        break;
      }
    }
    const all = upper.join(' ');
    const catHit = RECEIPT_CATS.find(([re]) => re.test(all));
    return { amount, date, title, cat: catHit ? catHit[1] : null };
  }

  $('#quickScan').addEventListener('click', () => $('#scanInput').click());
  $('#scanInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    let photo;
    let big;
    try {
      [photo, big] = await Promise.all([compressImage(file), compressImage(file, 2000, 0.92)]);
    } catch {
      toast('Não foi possível abrir essa imagem.');
      return;
    }
    openExpense(null, { kind: 'out', scan: true });
    setPhoto(photo, true);
    scanReceipt(big);
  });

  async function scanReceipt(dataUrl) {
    const box = $('#scanStatus');
    const txt = $('#scanText');
    const token = {};
    ui.scanToken = token;
    box.hidden = false;
    box.className = 'scan-status';
    txt.textContent = 'Preparando o leitor… (na 1ª vez demora um pouco)';
    ocrProgress = (m) => {
      if (ui.scanToken !== token) return;
      if (m.status === 'recognizing text') txt.textContent = `Lendo comprovante… ${Math.round(m.progress * 100)}%`;
    };
    try {
      const worker = await getOCR();
      const { data } = await worker.recognize(dataUrl);
      if (ui.scanToken !== token || !dlgExp.open) return;
      const r = parseReceipt(data.text || '');
      const filled = [];
      if (r.amount && !expAmount.value.trim()) {
        expAmount.value = amountInput(r.amount);
        expAmount._update();
        updateInstallments();
        filled.push('valor');
      }
      if (r.date) { formExp.date.value = r.date; filled.push('data'); }
      if (r.title && !formExp.title.value.trim()) { formExp.title.value = r.title; filled.push('loja'); }
      if (r.cat) pickCat(r.cat);
      const ok = filled.includes('valor');
      box.classList.add(ok ? 'is-done' : 'is-fail');
      txt.textContent = ok ? `Li: ${filled.join(', ')}. Confira antes de salvar.` : 'Não achei o total na foto. Digite o valor.';
      if (!ok) expAmount.focus();
    } catch {
      if (ui.scanToken !== token) return;
      box.classList.add('is-fail');
      txt.textContent = 'Não foi possível ler agora (a 1ª leitura precisa de internet). Digite o valor.';
    }
  }

  /* ---------------- Quem me deve / a quem devo ---------------- */
  const debtPaid = (d) => d.payments.reduce((t, p) => t + p.amount, 0);
  const debtLeft = (d) => Math.max(0, d.amount - debtPaid(d));
  const AVATAR_COLORS = ['#6d5dfc', '#ec4899', '#f97316', '#14b8a6', '#3b82f6', '#8b5cf6', '#22c55e', '#eab308'];
  const avatarColor = (name) => AVATAR_COLORS[[...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % AVATAR_COLORS.length];
  const initials = (name) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const avatar = (name) => `<span class="avatar" style="--c:${avatarColor(name)}">${esc(initials(name))}</span>`;

  // Modelos de mensagem. {nome}, {valor}, {motivo} e {data} são trocados pelos dados do registro.
  const MSG_TEMPLATES = {
    in: [
      ['Amigável', 'Oi, {nome}! Tudo bem? 😊 Passando para lembrar daquele valor de {valor} ({motivo}). Quando puder, me manda por Pix. Obrigado!'],
      ['Direta', 'Oi, {nome}! O pagamento de {valor} ({motivo}) estava combinado para {data}. Consegue me enviar hoje?'],
      ['Formal', 'Olá, {nome}. Lembramos que o valor de {valor} ({motivo}) tem vencimento em {data}. Por favor, realize o pagamento. Obrigado.'],
      ['Curta', '{nome}, lembrete: {valor} ({motivo}) 🙂'],
    ],
    out: [
      ['Amigável', 'Oi, {nome}! Não esqueci dos {valor} ({motivo}) que te devo. Logo te pago! 😊'],
      ['Combinar data', 'Oi, {nome}! Sobre os {valor} ({motivo}): consigo te pagar em {data}, tudo bem?'],
      ['Já paguei', 'Oi, {nome}! Acabei de te enviar {valor} ({motivo}). Confere aí, por favor 🙂'],
    ],
  };
  const isTemplate = (txt) => Object.values(MSG_TEMPLATES).some((list) => list.some(([, t]) => t === txt));
  function fillMsg(tpl, d) {
    return withReal(() => fillMsgRaw(tpl, d));
  }
  function fillMsgRaw(tpl, d) {
    const first = cap((d.person || '').trim().split(/\s+/)[0] || 'tudo bem');
    const left = d.payments ? debtLeft(d) : d.amount || 0;
    const date = d.due ? fmtDM.format(parseDay(d.due)) : 'o combinado';
    return tpl
      .replace(/\s*\(\{motivo\}\)/g, d.desc ? ` (${d.desc})` : '')
      .replace(/\{nome\}/g, first)
      .replace(/\{valor\}/g, money(left))
      .replace(/\{motivo\}/g, d.desc || 'o combinado')
      .replace(/\{data\}/g, date)
      .replace(/\{pix\}/g, state.pixKey || '(chave Pix)');
  }
  // Mensagem final: se você tem chave Pix e a mensagem não usa {pix}, ela vai no fim (só para quem te deve).
  function buildMessage(tpl, d) {
    let msg = fillMsg(tpl, d);
    if (state.pixKey && d.dir === 'in' && !tpl.includes('{pix}')) msg += `\n\nChave Pix: ${state.pixKey}`;
    return msg;
  }
  function waLink(d) {
    const digits = (d.phone || '').replace(/\D/g, '');
    const num = digits.length === 10 || digits.length === 11 ? `55${digits}` : digits;
    const msg = buildMessage(d.message || MSG_TEMPLATES[d.dir][0][1], d);
    return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
  }

  // Linha de um registro do "Quem me deve" (usada no painel e na ficha da pessoa).
  function debtRow(d, now = new Date()) {
    const today = dateISO(now);
    const left = debtLeft(d);
    const late = left > 0 && d.due && d.due < today;
    const sub = [d.desc && esc(d.desc),
      left === 0 ? 'quitado' : d.due ? `${d.notify ? `<span class="debt__bell">${ico('i-bell')}</span>` : ''}${late ? 'atrasado desde' : 'combinado p/'} ${fmtDM.format(parseDay(d.due))}` : fmtDM.format(parseDay(d.date)),
      left > 0 && left < d.amount && `falta ${money(left)} de ${money(d.amount)}`].filter(Boolean).join(' · ');
    return `
      <div class="debt${left === 0 ? ' is-paid' : ''}" data-debt="${d.id}" role="button" tabindex="0">
        ${avatar(d.person)}
        <span class="debt__main"><strong>${esc(d.person)}</strong><small class="${late ? 'is-late' : ''}">${sub}</small></span>
        <span class="debt__val is-${d.dir}">${d.dir === 'in' ? '+' : '−'}${money(left || d.amount)}</span>
        ${d.dir === 'in' && left > 0 ? `<a class="debt__wa" href="${waLink(d)}" target="_blank" rel="noopener" aria-label="Cobrar ${esc(d.person)} no WhatsApp">${ico('i-chat')}</a>` : ''}
      </div>`;
  }

  function renderDebts(now = new Date()) {
    const open = state.debts.filter((d) => debtLeft(d) > 0);
    const paid = state.debts.filter((d) => debtLeft(d) === 0);
    const owedToMe = sum(open.filter((d) => d.dir === 'in').map((d) => ({ amount: debtLeft(d) })));
    const iOwe = sum(open.filter((d) => d.dir === 'out').map((d) => ({ amount: debtLeft(d) })));
    $('#debtSum').innerHTML = state.debts.length
      ? `<div class="is-in"><span class="label">Me devem</span><strong>${money(owedToMe)}</strong></div>
         <div class="is-out"><span class="label">Eu devo</span><strong>${money(iOwe)}</strong></div>`
      : '';
    const row = (d) => debtRow(d, now);
    const sorted = [...open].sort((a, b) => (a.due || a.date).localeCompare(b.due || b.date));
    $('#debts').innerHTML = (sorted.length
      ? sorted.map(row).join('')
      : `<div class="goals__empty"><p class="empty-sm">${state.debts.length ? 'Tudo quitado! 🎉' : 'Registre empréstimos e contas divididas para não esquecer quem te deve (e a quem você deve).'}</p>
          <button type="button" class="btn btn--soft btn--sm" data-newdebt>${ico('i-plus')}Registrar</button></div>`)
      + (paid.length ? `<button type="button" class="debts__more" data-togglepaid>${ui.showPaid ? 'Esconder' : 'Ver'} quitados (${paid.length})</button>` : '')
      + (ui.showPaid ? paid.map(row).join('') : '');
  }

  const dlgDebt = $('#dlgDebt');
  const formDebt = $('#formDebt');
  const debtAmount = $('#debtAmount');
  bindLiveAmount(debtAmount, $('#debtAmountOut'));
  const debtMsg = $('#debtMsg');
  function setDebtDir(dir) {
    ui.debtDir = dir;
    $$('#debtDir .seg__btn').forEach((b) => b.classList.toggle('is-active', b.dataset.dir === dir));
    // Troca a mensagem para o modelo do outro lado, se ainda não foi personalizada.
    if (!debtMsg.value.trim() || isTemplate(debtMsg.value)) debtMsg.value = MSG_TEMPLATES[dir][0][1];
    $('#debtNotifyHint').textContent = dir === 'in'
      ? 'Notificação com vibração no dia em que a pessoa combinou de pagar'
      : 'Notificação com vibração no dia em que você combinou de pagar';
    renderMsgTools();
  }
  function draftDebt() {
    return {
      dir: ui.debtDir, person: formDebt.person.value, desc: formDebt.desc.value.trim(),
      amount: Number.isFinite(readAmount(debtAmount)) ? readAmount(debtAmount) : 0, due: formDebt.due.value,
    };
  }
  function renderMsgTools() {
    const txt = debtMsg.value;
    $('#msgTemplates').innerHTML = MSG_TEMPLATES[ui.debtDir].map(([name, t], i) =>
      `<button type="button" class="chip${t === txt ? ' is-active' : ''}" data-tpl="${i}">${name}</button>`).join('');
    $('#debtMsgPreview').textContent = buildMessage(txt || MSG_TEMPLATES[ui.debtDir][0][1], draftDebt());
  }
  $('#msgTemplates').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tpl]');
    if (!b) return;
    debtMsg.value = MSG_TEMPLATES[ui.debtDir][Number(b.dataset.tpl)][1];
    renderMsgTools();
  });
  $('#msgVars').addEventListener('click', (e) => {
    const b = e.target.closest('[data-var]');
    if (!b) return;
    const start = debtMsg.selectionStart ?? debtMsg.value.length;
    const end = debtMsg.selectionEnd ?? start;
    debtMsg.value = debtMsg.value.slice(0, start) + b.dataset.var + debtMsg.value.slice(end);
    debtMsg.focus();
    debtMsg.setSelectionRange(start + b.dataset.var.length, start + b.dataset.var.length);
    renderMsgTools();
  });
  formDebt.addEventListener('input', renderMsgTools);
  $('#pixKey').addEventListener('change', () => { state.pixKey = $('#pixKey').value.trim(); save(); renderMsgTools(); });
  $('#pixKey').addEventListener('input', () => { state.pixKey = $('#pixKey').value.trim(); renderMsgTools(); });
  const syncNotify = () => { $('#debtTimeWrap').hidden = !$('#debtNotify').checked; };
  $('#debtNotify').addEventListener('change', () => {
    syncNotify();
    if ($('#debtNotify').checked && !formDebt.due.value) toast('Escolha a data combinada para receber o aviso.');
  });
  $('#debtDir').addEventListener('click', (e) => { const b = e.target.closest('[data-dir]'); if (b) setDebtDir(b.dataset.dir); });

  function openDebt(debt = null, preset = {}) {
    ui.editingDebt = debt ? debt.id : null;
    formDebt.reset();
    const src = debt || preset;
    $('#dlgDebtTitle').textContent = debt ? 'Editar registro' : 'Novo registro';
    $('#debtDelete').hidden = !debt;
    setDebtDir(src.dir || 'in');
    formDebt.person.value = src.person || '';
    formDebt.phone.value = src.phone || '';
    debtAmount.value = src.amount ? amountInput(src.amount) : '';
    formDebt.desc.value = src.desc || '';
    formDebt.date.value = src.date || dateISO(new Date());
    formDebt.due.value = src.due || '';
    $('#debtNotify').checked = !!src.notify;
    formDebt.notifyTime.value = src.notifyTime || '09:00';
    debtMsg.value = src.message || MSG_TEMPLATES[src.dir || 'in'][0][1];
    $('#pixKey').value = state.pixKey;
    syncNotify();
    debtAmount._update();
    renderMsgTools();
    dlgDebt.showModal();
    if (!src.person) formDebt.person.focus();
  }
  $('#btnNewDebt').addEventListener('click', () => openDebt());

  formDebt.addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = readAmount(debtAmount);
    const person = formDebt.person.value.trim();
    if (!person) return;
    if (!Number.isFinite(amount) || amount <= 0) { toast('Informe o valor.'); return; }
    const notifyOn = $('#debtNotify').checked;
    if (notifyOn && !formDebt.due.value) { toast('Escolha a data combinada para receber o aviso.'); formDebt.due.focus(); return; }
    const message = debtMsg.value.trim();
    const data = {
      dir: ui.debtDir, person: person.replace(/(^|\s)\p{L}/gu, (c) => c.toUpperCase()), phone: formDebt.phone.value.trim(), amount,
      desc: formDebt.desc.value.trim(), date: formDebt.date.value || dateISO(new Date()), due: formDebt.due.value || '',
      notify: notifyOn, notifyTime: formDebt.notifyTime.value || '09:00',
      message: message && message !== MSG_TEMPLATES[ui.debtDir][0][1] ? message : '',
    };
    let d;
    if (ui.editingDebt) {
      d = state.debts.find((x) => x.id === ui.editingDebt);
      if (d.due !== data.due || d.notifyTime !== data.notifyTime || !d.notify) d.notifiedFor = '';
      Object.assign(d, data);
      toast('Registro atualizado.');
    } else {
      d = { id: uid(), ...data, payments: [], createdAt: Date.now(), notifiedFor: '' };
      state.debts.push(d);
      toast(data.dir === 'in' ? `${data.person} te deve ${money(amount)}.` : `Você deve ${money(amount)} a ${data.person}.`);
    }
    // Data combinada já passada no momento do cadastro: não dispara aviso antigo.
    if (d.due && d.due < dateISO(new Date())) d.notifiedFor = d.due;
    save();
    dlgDebt.close();
    if (dlgDebtPay.open) renderDebtPay();
    renderDebts();
    if (notifyOn && !alertsOn()) enableAlerts();
    checkDebts();
  });

  // Avisos do "Quem me deve": no dia combinado (no horário escolhido) ou, se o app estava fechado, como "em atraso".
  // 3 ou mais cobranças no mesmo dia viram uma notificação só.
  const DEBT_VIBRATE = [300, 120, 300, 120, 500];
  function checkDebts(now = new Date()) {
    const today = dateISO(now);
    const hm = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const pending = state.debts.filter((d) => d.notify && d.due && debtLeft(d) > 0 && d.notifiedFor !== d.due
      && (d.due < today || (d.due === today && hm >= (d.notifyTime || '09:00'))));
    if (!pending.length) return;
    pending.forEach((d) => { d.notifiedFor = d.due; });
    save();
    const line = (d) => `${d.person} — ${money(debtLeft(d))}${d.desc ? ` (${d.desc})` : ''}`;
    const groups = [
      { list: pending.filter((d) => d.due === today), when: 'hoje' },
      { list: pending.filter((d) => d.due < today), when: 'atraso' },
    ];
    for (const { list, when } of groups) {
      if (!list.length) continue;
      if (list.length >= 3) {
        const title = when === 'hoje' ? `${list.length} cobranças marcadas para hoje` : `${list.length} cobranças em atraso`;
        notify(title, list.map(line).join('\n'), `debts-${when}-${today}`, { vibrate: DEBT_VIBRATE });
        toast(`🔔 ${title}`);
        continue;
      }
      for (const d of list) {
        const date = fmtDM.format(parseDay(d.due));
        const title = when === 'hoje'
          ? (d.dir === 'in' ? `Hoje: ${d.person} combinou de te pagar` : `Hoje: pagar ${d.person}`)
          : (d.dir === 'in' ? `Em atraso: ${d.person}` : `Em atraso: você deve a ${d.person}`);
        const body = `${money(debtLeft(d))}${d.desc ? ` · ${d.desc}` : ''} · combinado para ${when === 'hoje' ? 'hoje' : date}`;
        notify(title, body, `debt-${d.id}`, { vibrate: DEBT_VIBRATE });
        toast(`🔔 ${title} — ${money(debtLeft(d))}`);
      }
    }
    renderDebts(now);
  }

  $('#debtDelete').addEventListener('click', () => {
    const d = state.debts.find((x) => x.id === ui.editingDebt);
    if (!d || !confirm(`Excluir o registro de ${d.person}?`)) return;
    state.debts = state.debts.filter((x) => x !== d);
    save();
    dlgDebt.close();
    if (dlgDebtPay.open) dlgDebtPay.close();
    renderDebts();
    toast('Registro excluído.', 'Desfazer', () => { state.debts.push(d); save(); renderDebts(); });
  });

  const dlgDebtPay = $('#dlgDebtPay');
  const formDebtPay = $('#formDebtPay');
  const payAmount = $('#payAmount');
  bindLiveAmount(payAmount, $('#payAmountOut'));

  function renderDebtPay() {
    const d = state.debts.find((x) => x.id === ui.payingDebt);
    if (!d) return;
    const left = debtLeft(d);
    $('#payTitle').textContent = d.dir === 'in' ? `${d.person} te deve` : `Você deve a ${d.person}`;
    $('#payHero').innerHTML = `
      ${avatar(d.person)}
      <span class="goal__main">
        <span class="goal__nums">${left ? money(left) : 'Quitado ✔'}</span>
        <span class="goal__sub">${left && left < d.amount ? `falta de ${money(d.amount)}` : `total ${money(d.amount)}`}${d.desc ? ` · ${esc(d.desc)}` : ''}</span>
        <span class="goal__sub">${d.due ? `Combinado para ${fmtDM.format(parseDay(d.due))}` : `Desde ${fmtDM.format(parseDay(d.date))}`}</span>
      </span>`;
    const wa = $('#payWhats');
    wa.hidden = !left;
    wa.href = waLink(d);
    wa.lastChild.textContent = d.dir === 'in' ? 'Cobrar no WhatsApp' : 'Avisar no WhatsApp';
    $('#payAmountWrap').hidden = !left;
    $('#paySubmit').hidden = !left;
    $('#payHint').textContent = d.dir === 'in' ? 'Quanto recebeu' : 'Quanto pagou';
    $('#paySubmit').textContent = d.dir === 'in' ? 'Recebi' : 'Paguei';
    $('#payReceipt').hidden = !d.payments.length;
    const hist = [...d.payments].reverse().slice(0, 6);
    $('#payHist').innerHTML = hist.length
      ? '<span class="label">Pagamentos</span>' + hist.map((p) => `
        <div class="goal-hist__row"><span>${fmtDM.format(parseDay(p.date))}/${p.date.slice(0, 4)}</span><b class="is-in">${money(p.amount)}</b></div>`).join('')
      : '';
  }
  function openDebtPay(d) {
    if (!d) return;
    ui.payingDebt = d.id;
    formDebtPay.reset();
    payAmount.value = debtLeft(d) ? amountInput(debtLeft(d)) : '';
    payAmount._update();
    renderDebtPay();
    dlgDebtPay.showModal();
  }
  $('#payEdit').addEventListener('click', () => openDebt(state.debts.find((x) => x.id === ui.payingDebt)));
  formDebtPay.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = state.debts.find((x) => x.id === ui.payingDebt);
    const amount = readAmount(payAmount);
    if (!d) return;
    if (!Number.isFinite(amount) || amount <= 0) { toast('Informe um valor válido.'); return; }
    const value = Math.min(amount, debtLeft(d));
    d.payments.push({ id: uid(), date: dateISO(new Date()), amount: value });
    save();
    dlgDebtPay.close();
    renderDebts();
    if ($('#dlgPerson').open) openPerson(d.person);
    const left = debtLeft(d);
    if (!left) {
      if (d.dir === 'in') celebrate();
      toast(d.dir === 'in' ? `${d.person} quitou tudo! 🎉` : `Dívida com ${d.person} quitada! 🎉`, 'Recibo', () => openReceipt(d));
    } else {
      toast(`Registrado. Falta ${money(left)}.`, 'Recibo', () => openReceipt(d));
    }
  });

  $('#debts').addEventListener('click', (e) => {
    if (e.target.closest('.debt__wa')) return; // o link do WhatsApp abre sozinho
    if (e.target.closest('[data-newdebt]')) { openDebt(); return; }
    if (e.target.closest('[data-togglepaid]')) { ui.showPaid = !ui.showPaid; renderDebts(); return; }
    const item = e.target.closest('[data-debt]');
    if (item) openDebtPay(state.debts.find((d) => d.id === item.dataset.debt));
  });
  $('#debts').addEventListener('keydown', (e) => {
    const item = e.target.closest('[data-debt]');
    if (item && e.key === 'Enter') openDebtPay(state.debts.find((d) => d.id === item.dataset.debt));
  });
  $('#spDebt').addEventListener('click', () => {
    const each = calcSplit();
    if (!each) { toast('Informe o total da conta.'); return; }
    openDebt(null, { dir: 'in', amount: each, desc: 'Conta dividida' });
  });

  /* ---------------- Calendário do mês ---------------- */
  const shortCents = (c) => (c >= 100000 ? `${num.format(Math.round(c / 10000) / 10)} mil` : num.format(Math.round(c / 100)));
  const heat = (level) => {
    const l = Math.min(level, 1.5) / 1.5;
    return `hsl(${Math.round(140 - 140 * l)} 78% 48% / ${(0.2 + 0.45 * Math.min(1, level)).toFixed(2)})`;
  };
  function renderCalendar(list, y, m, dim, now, current) {
    const per = new Array(dim).fill(0);
    for (const e of list) per[Number(e.date.slice(8, 10)) - 1] += e.amount;
    const incomeDays = new Set(monthIn(ui.month).map((e) => Number(e.date.slice(8, 10))));
    const byBudget = state.budget > 0;
    const ref = byBudget ? state.budget / dim : Math.max(1, ...per);
    const first = new Date(y, m - 1, 1).getDay();
    const today = current ? now.getDate() : 0;
    const future = (d) => (current ? d > today : ui.month > monthKey(now));
    if (ui.calSel && !ui.calSel.startsWith(ui.month)) ui.calSel = null;
    const cells = [];
    for (let i = 0; i < first; i++) cells.push('<span class="cal__blank"></span>');
    for (let d = 1; d <= dim; d++) {
      const v = per[d - 1];
      const iso = `${ui.month}-${pad(d)}`;
      const cls = ['cal__cell', v && 'has', d === today && 'is-today', future(d) && 'is-future', ui.calSel === iso && 'is-sel'].filter(Boolean).join(' ');
      cells.push(`<button type="button" class="${cls}" data-day="${iso}" style="${v ? `--heat:${heat(v / ref)}` : ''}" aria-label="Dia ${d}: ${money(v)}">
        <b>${d}</b><small>${v && !state.privacy ? shortCents(v) : ''}</small>${incomeDays.has(d) ? '<i class="cal__in"></i>' : ''}</button>`);
    }
    $('#cal').innerHTML = cells.join('');
    $('#calLegend').innerHTML = byBudget
      ? `<i style="background:${heat(0.3)}"></i>abaixo de ${money(Math.round(ref))}/dia <i style="background:${heat(1.4)}"></i>acima`
      : `menos <i style="background:${heat(0.15)}"></i><i style="background:${heat(0.6)}"></i><i style="background:${heat(1)}"></i><i style="background:${heat(1.5)}"></i> mais`;
    renderCalDay();
  }
  function renderCalDay() {
    const box = $('#calDay');
    if (!ui.calSel) { box.hidden = true; return; }
    const items = state.expenses.filter((e) => e.date === ui.calSel)
      .sort((a, b) => (kindOf(a) === kindOf(b) ? b.amount - a.amount : isIn(a) ? 1 : -1));
    const outs = sum(items.filter(isOut));
    box.hidden = false;
    box.innerHTML = `<h3><span>${dateLabel(ui.calSel)}</span><span>${money(outs)}</span></h3>` + (items.length
      ? items.map((e) => {
        const c = catOf(e.cat, kindOf(e));
        return `<button type="button" class="exp" data-id="${e.id}">${catIcon(c)}
          <span class="exp__main"><span class="exp__title">${esc(e.title)}</span><span class="exp__meta">${esc(c.name)}${isOut(e) && e.method ? ` · ${e.method}` : ''}</span></span>
          <span class="exp__val${isIn(e) ? ' is-in' : ''}">${isIn(e) ? '+' : ''}${money(e.amount)}</span></button>`;
      }).join('')
      : '<p class="empty-sm">Nenhum gasto neste dia. 👏</p>');
  }
  $('#cal').addEventListener('click', (e) => {
    const b = e.target.closest('[data-day]');
    if (!b) return;
    ui.calSel = ui.calSel === b.dataset.day ? null : b.dataset.day;
    $$('#cal .cal__cell').forEach((c) => c.classList.toggle('is-sel', c.dataset.day === ui.calSel));
    renderCalDay();
  });
  $('#calDay').addEventListener('click', (e) => {
    const b = e.target.closest('.exp');
    if (b) openExpense(state.expenses.find((x) => x.id === b.dataset.id));
  });
  $('#dayMode').addEventListener('click', (e) => {
    const b = e.target.closest('[data-mode]');
    if (!b) return;
    ui.dayMode = b.dataset.mode;
    $$('#dayMode .seg__btn').forEach((x) => x.classList.toggle('is-active', x === b));
    $('#calWrap').hidden = ui.dayMode !== 'cal';
    $('#barsWrap').hidden = ui.dayMode !== 'bars';
    if (ui.dayMode === 'bars') animateIn($('#barsWrap'));
  });

  /* ---------------- Relatório do mês (imagem / PDF) ---------------- */
  const REPORT_W = 1080;
  function buildReport() {
    return withReal(drawReport);
  }
  function drawReport() {
    const P = 64;
    const c = document.createElement('canvas');
    c.width = REPORT_W;
    c.height = 4200;
    const ctx = c.getContext('2d');
    const F = (w, s) => `${w} ${s}px Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
    const rr = (x, yy, w, h, r) => { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, yy, w, h, r) : ctx.rect(x, yy, w, h); };
    const text = (t, x, yy, font, color, align = 'left', maxW = 0) => {
      ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align;
      let s = String(t);
      if (maxW) while (ctx.measureText(s).width > maxW && s.length > 1) s = s.slice(0, -2) + '…';
      ctx.fillText(s, x, yy);
    };
    // Diminui a fonte até o texto caber (em vez de cortar com "…").
    const fit = (t, x, yy, weight, size, color, maxW, align = 'left') => {
      let px = size;
      ctx.font = F(weight, px);
      while (px > 18 && ctx.measureText(t).width > maxW) { px -= 1; ctx.font = F(weight, px); }
      text(t, x, yy, F(weight, px), color, align);
    };
    const C = { bg: '#f5f6fa', card: '#ffffff', text: '#10131a', muted: '#6b7280', line: '#e8eaf0', good: '#10b981', bad: '#ef4444', track: '#eef0f5' };
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, c.width, c.height);

    const [y0, m0] = ui.month.split('-').map(Number);
    const outs = monthOut(ui.month);
    const total = sum(outs);
    const income = sum(monthIn(ui.month));
    const prevTotal = sum(monthOut(shiftMonth(ui.month, -1)));

    // Cabeçalho em degradê
    const g = ctx.createLinearGradient(0, 0, REPORT_W, 470);
    g.addColorStop(0, '#7c6cff'); g.addColorStop(0.5, '#5b4cf0'); g.addColorStop(1, '#9b3cf0');
    ctx.fillStyle = g;
    rr(0, 0, REPORT_W, 470, [0, 0, 48, 48]); ctx.fill();
    text('MEUS GASTOS', P, 92, F(700, 28), 'rgba(255,255,255,.8)');
    text(cap(fmtMonth.format(new Date(y0, m0 - 1, 1))), P, 150, F(800, 46), '#fff');
    text('Gasto no mês', P, 232, F(500, 32), 'rgba(255,255,255,.88)');
    text(money(total), P, 338, F(800, 104), '#fff');
    if (prevTotal > 0) {
      const diff = Math.round(((total - prevTotal) / prevTotal) * 100);
      text(diff === 0 ? `Igual ao mês anterior (${money(prevTotal)})` : `${diff > 0 ? '▲' : '▼'} ${Math.abs(diff)}% em relação ao mês anterior (${money(prevTotal)})`, P, 404, F(600, 28), 'rgba(255,255,255,.9)');
    }
    let y = 520;

    // Entradas / Saídas / Saldo
    const cw = (REPORT_W - 2 * P - 48) / 3;
    [['Entradas', money(income), C.good], ['Saídas', money(total), C.text], ['Saldo', signed(income - total), income - total >= 0 ? C.good : C.bad]]
      .forEach(([label, val, color], i) => {
        const x = P + i * (cw + 24);
        ctx.fillStyle = C.card; rr(x, y, cw, 150, 28); ctx.fill();
        text(label, x + 28, y + 56, F(500, 27), C.muted);
        fit(val, x + 28, y + 112, 800, 38, color, cw - 52);
      });
    y += 150 + 44;

    // Orçamento
    if (state.budget > 0) {
      const pct = total / state.budget;
      ctx.fillStyle = C.card; rr(P, y, REPORT_W - 2 * P, 150, 28); ctx.fill();
      text(`Orçamento: ${Math.round(pct * 100)}% usado`, P + 32, y + 58, F(700, 32), C.text);
      text(`de ${money(state.budget)}`, REPORT_W - P - 32, y + 58, F(500, 28), C.muted, 'right');
      ctx.fillStyle = C.track; rr(P + 32, y + 92, REPORT_W - 2 * P - 64, 22, 11); ctx.fill();
      ctx.fillStyle = pct >= 1 ? C.bad : pct >= 0.8 ? '#f59e0b' : '#6d5dfc';
      rr(P + 32, y + 92, Math.max(22, (REPORT_W - 2 * P - 64) * Math.min(1, pct)), 22, 11); ctx.fill();
      y += 150 + 44;
    }

    // Por categoria
    const byCat = [...outs.reduce((mp, e) => mp.set(e.cat, (mp.get(e.cat) || 0) + e.amount), new Map())].sort((a, b) => b[1] - a[1]).slice(0, 7);
    if (byCat.length) {
      const h = 90 + byCat.length * 92;
      ctx.fillStyle = C.card; rr(P, y, REPORT_W - 2 * P, h, 28); ctx.fill();
      text('Por categoria', P + 32, y + 64, F(800, 36), C.text);
      const top = byCat[0][1];
      byCat.forEach(([id, v], i) => {
        const cat = catOf(id);
        const yy = y + 130 + i * 92;
        ctx.fillStyle = cat.color; ctx.beginPath(); ctx.arc(P + 46, yy - 10, 12, 0, Math.PI * 2); ctx.fill();
        text(cat.name, P + 74, yy, F(600, 30), C.text, 'left', 460);
        text(`${money(v)}  ·  ${total ? Math.round((v / total) * 100) : 0}%`, REPORT_W - P - 32, yy, F(700, 30), C.text, 'right');
        ctx.fillStyle = C.track; rr(P + 74, yy + 20, REPORT_W - 2 * P - 106, 14, 7); ctx.fill();
        ctx.fillStyle = cat.color; rr(P + 74, yy + 20, Math.max(14, (REPORT_W - 2 * P - 106) * (v / top)), 14, 7); ctx.fill();
      });
      y += h + 44;
    }

    // Maiores gastos
    const biggest = [...outs].sort((a, b) => b.amount - a.amount).slice(0, 5);
    if (biggest.length) {
      const h = 90 + biggest.length * 76;
      ctx.fillStyle = C.card; rr(P, y, REPORT_W - 2 * P, h, 28); ctx.fill();
      text('Maiores gastos', P + 32, y + 64, F(800, 36), C.text);
      biggest.forEach((e, i) => {
        const yy = y + 134 + i * 76;
        text(fmtDM.format(parseDay(e.date)), P + 32, yy, F(500, 28), C.muted);
        text(e.title, P + 140, yy, F(600, 30), C.text, 'left', 520);
        text(money(e.amount), REPORT_W - P - 32, yy, F(700, 30), C.text, 'right');
      });
      y += h + 44;
    }

    // Metas
    const goals = state.goals.slice(0, 3);
    if (goals.length) {
      const h = 90 + goals.length * 96;
      ctx.fillStyle = C.card; rr(P, y, REPORT_W - 2 * P, h, 28); ctx.fill();
      text('Metas', P + 32, y + 64, F(800, 36), C.text);
      goals.forEach((gl, i) => {
        const plan = goalPlan(gl);
        const yy = y + 130 + i * 96;
        text(gl.name, P + 32, yy, F(600, 30), C.text, 'left', 520);
        text(`${money(plan.saved)} de ${money(gl.target)} · ${Math.floor(plan.pct)}%`, REPORT_W - P - 32, yy, F(600, 27), C.muted, 'right');
        ctx.fillStyle = C.track; rr(P + 32, yy + 22, REPORT_W - 2 * P - 64, 14, 7); ctx.fill();
        ctx.fillStyle = gl.color; rr(P + 32, yy + 22, Math.max(14, (REPORT_W - 2 * P - 64) * plan.pct / 100), 14, 7); ctx.fill();
      });
      y += h + 44;
    }

    if (!outs.length && !income) {
      text('Nenhum lançamento neste mês.', REPORT_W / 2, y + 40, F(600, 32), C.muted, 'center');
      y += 100;
    }
    text(`Gerado pelo app Meus Gastos em ${fmtDM.format(new Date())}/${new Date().getFullYear()}`, REPORT_W / 2, y + 30, F(500, 26), C.muted, 'center');
    y += 80;

    const out = document.createElement('canvas');
    out.width = REPORT_W;
    out.height = Math.ceil(y);
    out.getContext('2d').drawImage(c, 0, 0);
    return out;
  }

  // PDF de uma página com a imagem do relatório (feito à mão, sem biblioteca).
  function imagePdf(jpegDataUrl, wPx, hPx) {
    const bin = atob(jpegDataUrl.split(',')[1]);
    const img = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) img[i] = bin.charCodeAt(i);
    const W = 595.28;
    const H = +((W * hPx) / wPx).toFixed(2);
    const enc = new TextEncoder();
    const parts = [];
    const offsets = [];
    let len = 0;
    const push = (x) => { const b = typeof x === 'string' ? enc.encode(x) : x; parts.push(b); len += b.length; };
    const obj = (n, body) => { offsets[n] = len; push(`${n} 0 obj\n`); body(); push('\nendobj\n'); };
    push('%PDF-1.4\n');
    obj(1, () => push('<< /Type /Catalog /Pages 2 0 R >>'));
    obj(2, () => push('<< /Type /Pages /Kids [3 0 R] /Count 1 >>'));
    obj(3, () => push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`));
    obj(4, () => {
      push(`<< /Type /XObject /Subtype /Image /Width ${wPx} /Height ${hPx} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${img.length} >>\nstream\n`);
      push(img);
      push('\nendstream');
    });
    const content = `q ${W} 0 0 ${H} 0 0 cm /Im0 Do Q`;
    obj(5, () => push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`));
    const xref = len;
    push(`xref\n0 6\n0000000000 65535 f \n${[1, 2, 3, 4, 5].map((n) => `${String(offsets[n]).padStart(10, '0')} 00000 n \n`).join('')}`
      + `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
    return new Blob(parts, { type: 'application/pdf' });
  }

  function downloadBlob(blob, name) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  // Diálogo genérico para compartilhar uma imagem (relatório, recibo) ou baixar como PDF.
  const canvasBlob = (cv, type, q) => new Promise((resolve) => cv.toBlob(resolve, type, q));
  function openImage({ canvas, title, name, text }) {
    ui.image = { canvas, name, text };
    $('#reportTitle').textContent = title;
    $('#reportImg').src = canvas.toDataURL('image/png');
    $('#dlgReport').showModal();
  }
  async function openReport() {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    openImage({
      canvas: buildReport(), title: 'Relatório do mês', name: `meus-gastos-${ui.month}`,
      text: `Meus gastos de ${fmtMonth.format(monthDate(ui.month))}`,
    });
  }
  $('#btnReport').addEventListener('click', openReport);
  $('#reportShare').addEventListener('click', async () => {
    const { canvas, name, text } = ui.image;
    const blob = await canvasBlob(canvas, 'image/png');
    const file = new File([blob], `${name}.png`, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Meus Gastos', text });
      } catch (err) {
        if (err.name !== 'AbortError') { downloadBlob(blob, file.name); toast('Imagem salva. Agora é só enviar.'); }
      }
    } else {
      downloadBlob(blob, file.name);
      toast('Imagem salva nos downloads. Agora é só enviar.');
    }
  });
  $('#reportPng').addEventListener('click', async () => {
    downloadBlob(await canvasBlob(ui.image.canvas, 'image/png'), `${ui.image.name}.png`);
    toast('Imagem salva nos downloads.');
  });
  $('#reportPdf').addEventListener('click', () => {
    const { canvas, name } = ui.image;
    downloadBlob(imagePdf(canvas.toDataURL('image/jpeg', 0.92), canvas.width, canvas.height), `${name}.pdf`);
    toast('PDF salvo nos downloads.');
  });

  /* ---------------- Modo privacidade ---------------- */
  function applyPrivacy() {
    const b = $('#btnPrivacy');
    b.classList.toggle('is-on', state.privacy);
    $('use', b).setAttribute('href', state.privacy ? '#i-eye-off' : '#i-eye');
    b.title = state.privacy ? 'Mostrar valores' : 'Esconder valores';
    b.setAttribute('aria-label', b.title);
    b.setAttribute('aria-pressed', String(state.privacy));
  }
  $('#btnPrivacy').addEventListener('click', () => {
    state.privacy = !state.privacy;
    save();
    applyPrivacy();
    render();
    toast(state.privacy ? 'Valores escondidos 👁 Toque de novo para mostrar.' : 'Valores visíveis.');
  });

  /* ---------------- Recibo de pagamento ---------------- */
  function wrapLines(ctx, txt, maxW) {
    const words = txt.split(' ');
    const lines = [];
    let line = '';
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
    }
    if (line) lines.push(line);
    return lines;
  }
  function buildReceipt(d) {
    return withReal(() => {
      const W = 1080;
      const P = 72;
      const c = document.createElement('canvas');
      c.width = W;
      c.height = 2600;
      const ctx = c.getContext('2d');
      const F = (w, sz) => `${w} ${sz}px Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
      const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); };
      const text = (t, x, y, font, color, align = 'left') => { ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(t, x, y); };
      const paid = debtPaid(d);
      const left = debtLeft(d);
      const done = left === 0;
      ctx.fillStyle = '#f5f6fa';
      ctx.fillRect(0, 0, W, c.height);
      const g = ctx.createLinearGradient(0, 0, W, 420);
      g.addColorStop(0, '#7c6cff'); g.addColorStop(0.5, '#5b4cf0'); g.addColorStop(1, '#9b3cf0');
      ctx.fillStyle = g;
      rr(0, 0, W, 420, [0, 0, 48, 48]); ctx.fill();
      text('RECIBO', P, 104, F(800, 34), 'rgba(255,255,255,.85)');
      text(realMoney(paid), P, 230, F(800, 104), '#fff');
      const tag = done ? '✔ Quitado' : 'Pagamento parcial';
      ctx.font = F(700, 30);
      ctx.fillStyle = 'rgba(255,255,255,.2)';
      rr(P, 280, ctx.measureText(tag).width + 56, 64, 32); ctx.fill();
      text(tag, P + 28, 324, F(700, 30), '#fff');
      let y = 480;
      ctx.fillStyle = '#ffffff';
      const verb = d.dir === 'in' ? `Recebi de ${d.person}` : `Paguei a ${d.person}`;
      const sentence = `${verb} a quantia de ${realMoney(paid)}${d.desc ? `, referente a ${d.desc}` : ''}${done ? ', quitando o valor combinado.' : `. Ainda falta ${realMoney(left)} de ${realMoney(d.amount)}.`}`;
      ctx.font = F(500, 36);
      const lines = wrapLines(ctx, sentence, W - 2 * P - 64);
      const boxH = 80 + lines.length * 54;
      rr(P, y, W - 2 * P, boxH, 28); ctx.fill();
      lines.forEach((ln, i) => text(ln, P + 32, y + 72 + i * 54, F(500, 36), '#10131a'));
      y += boxH + 40;
      if (d.payments.length) {
        const h = 96 + d.payments.length * 70;
        ctx.fillStyle = '#ffffff';
        rr(P, y, W - 2 * P, h, 28); ctx.fill();
        text('Pagamentos', P + 32, y + 64, F(800, 34), '#10131a');
        d.payments.forEach((pay, i) => {
          const yy = y + 134 + i * 70;
          text(`${fmtDM.format(parseDay(pay.date))}/${pay.date.slice(0, 4)}`, P + 32, yy, F(500, 30), '#6b7280');
          text(realMoney(pay.amount), W - P - 32, yy, F(700, 32), '#10b981', 'right');
        });
        y += h + 40;
      }
      const now = new Date();
      text(`Emitido em ${fmtDM.format(now)}/${now.getFullYear()} pelo app Meus Gastos`, W / 2, y + 30, F(500, 26), '#6b7280', 'center');
      y += 80;
      const out = document.createElement('canvas');
      out.width = W;
      out.height = Math.ceil(y);
      out.getContext('2d').drawImage(c, 0, 0);
      return out;
    });
  }
  async function openReceipt(d) {
    if (!d || !d.payments.length) { toast('Ainda não há pagamento registrado.'); return; }
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    const slug = strip(d.person).replace(/[^a-z0-9]+/g, '-');
    openImage({
      canvas: buildReceipt(d), title: 'Recibo', name: `recibo-${slug}`,
      text: d.dir === 'in' ? `Recibo de ${d.person}` : `Comprovante de pagamento para ${d.person}`,
    });
  }
  $('#payReceipt').addEventListener('click', () => openReceipt(state.debts.find((x) => x.id === ui.payingDebt)));

  /* ---------------- Ficha da pessoa ---------------- */
  const personKey = (name) => strip(name || '').trim().replace(/\s+/g, ' ');
  function openPerson(name) {
    const key = personKey(name);
    const list = state.debts.filter((d) => personKey(d.person) === key).sort((a, b) => b.date.localeCompare(a.date));
    if (!list.length) return;
    const p = list[0];
    const today = dateISO(new Date());
    const ins = list.filter((d) => d.dir === 'in');
    const outs = list.filter((d) => d.dir === 'out');
    const owes = ins.reduce((t, d) => t + debtLeft(d), 0);
    const paidBack = ins.reduce((t, d) => t + debtPaid(d), 0);
    const iOwe = outs.reduce((t, d) => t + debtLeft(d), 0);
    // Pontualidade: cobranças com data combinada já quitadas, pagas até a data?
    const judged = ins.filter((d) => d.due && debtLeft(d) === 0 && d.payments.length);
    const onTime = judged.filter((d) => d.payments[d.payments.length - 1].date <= d.due).length;
    const lateNow = ins.filter((d) => d.due && debtLeft(d) > 0 && d.due < today).length;
    let badge;
    if (judged.length) {
      const ratio = onTime / judged.length;
      badge = `<span class="person-badge ${ratio >= 0.75 ? 'good' : ratio < 0.5 ? 'bad' : 'neutral'}">Pagou em dia ${onTime} de ${judged.length} vez${judged.length > 1 ? 'es' : ''}</span>`;
    } else {
      badge = '<span class="person-badge neutral">Sem histórico de prazos ainda</span>';
    }
    if (lateNow) badge += ` <span class="person-badge bad">${lateNow} em atraso agora</span>`;
    const since = list[list.length - 1].date;
    $('#personTitle').textContent = p.person;
    $('#personHero').innerHTML = `
      ${avatar(p.person)}
      <span class="goal__main">
        <span class="goal__nums">${esc(p.person)}</span>
        <span class="goal__sub">${list.length} registro${list.length > 1 ? 's' : ''} · desde ${fmtDM.format(parseDay(since))}/${since.slice(0, 4)}${p.phone ? ` · ${esc(p.phone)}` : ''}</span>
        <span>${badge}</span>
      </span>`;
    $('#personStats').innerHTML = `
      <div class="is-in"><span class="label">Te deve</span><strong>${money(owes)}</strong></div>
      <div><span class="label">Já te pagou</span><strong>${money(paidBack)}</strong></div>
      <div class="is-out"><span class="label">Você deve</span><strong>${money(iOwe)}</strong></div>`;
    $('#personList').innerHTML = list.map((d) => debtRow(d)).join('');
    ui.personName = p.person;
    ui.personPhone = p.phone || '';
    if (!$('#dlgPerson').open) $('#dlgPerson').showModal();
  }
  $('#payPerson').addEventListener('click', () => {
    const d = state.debts.find((x) => x.id === ui.payingDebt);
    if (d) openPerson(d.person);
  });
  $('#personList').addEventListener('click', (e) => {
    if (e.target.closest('.debt__wa')) return;
    const item = e.target.closest('[data-debt]');
    if (item) openDebtPay(state.debts.find((d) => d.id === item.dataset.debt));
  });
  $('#personNew').addEventListener('click', () => openDebt(null, { dir: 'in', person: ui.personName, phone: ui.personPhone }));

  /* ---------------- Lembrete diário de lançar ---------------- */
  const dlgDaily = $('#dlgDaily');
  const formDaily = $('#formDaily');
  function openDaily() {
    formDaily.on.checked = !!state.daily.on;
    formDaily.time.value = state.daily.time || '21:00';
    dlgDaily.showModal();
  }
  formDaily.addEventListener('submit', (e) => {
    e.preventDefault();
    const now = new Date();
    const time = formDaily.time.value || '21:00';
    const on = formDaily.on.checked;
    // Se o horário de hoje já passou, começa a avisar a partir de amanhã.
    const last = on && `${pad(now.getHours())}:${pad(now.getMinutes())}` >= time ? dateISO(now) : '';
    state.daily = { on, time, last };
    save();
    dlgDaily.close();
    toast(on ? `Pronto! Todo dia às ${time} o app vai perguntar dos seus gastos.` : 'Lembrete diário desligado.');
    if (on && !alertsOn()) enableAlerts();
  });
  function checkDaily(now = new Date()) {
    if (!state.daily.on) return;
    const today = dateISO(now);
    if (state.daily.last === today || `${pad(now.getHours())}:${pad(now.getMinutes())}` < (state.daily.time || '21:00')) return;
    state.daily.last = today;
    save();
    const todays = state.expenses.filter((e) => isOut(e) && e.date === today);
    const body = todays.length
      ? `Hoje você lançou ${todays.length} gasto${todays.length > 1 ? 's' : ''} (${money(sum(todays))}). Faltou algum? Toque para lançar.`
      : 'Nenhum gasto lançado hoje. Toque para lançar rapidinho.';
    notify('Você lançou seus gastos de hoje?', body, 'daily', { url: './?acao=rapido' });
    toast('📝 Você lançou seus gastos de hoje?', 'Lançar', () => { setView('resumo'); quickInput.focus(); });
  }

  /* ---------------- Atalhos do ícone (segurar o ícone do app) ---------------- */
  const LAUNCH = {
    voz: { icon: 'i-mic', title: 'Falar gasto', text: 'Toque no botão e fale, por exemplo: “gastei 30 reais no mercado”.', go: 'Começar a falar', run: () => $('#quickMic').click() },
    foto: { icon: 'i-scan', title: 'Ler comprovante', text: 'Tire uma foto do cupom e o app preenche o valor, a data e a loja.', go: 'Abrir câmera / galeria', run: () => $('#scanInput').click() },
  };
  // Microfone e câmera só abrem depois de um toque, por isso o atalho mostra um botão grande.
  function openLaunch(kind) {
    const l = LAUNCH[kind];
    $('#launchIcon').innerHTML = ico(l.icon);
    $('#launchTitle').textContent = l.title;
    $('#launchText').textContent = l.text;
    $('#launchGo').textContent = l.go;
    $('#launchGo').onclick = () => { $('#dlgLaunch').close(); l.run(); };
    $('#dlgLaunch').showModal();
  }

  /* ---------------- Previsão do saldo no fim do mês ---------------- */
  // Saldo de hoje + o que ainda vai entrar/sair (fixos, contas dos lembretes, cobranças com data no mês)
  // − o gasto do dia a dia estimado para os dias que faltam. Compras no crédito já contam na data da compra.
  function forecastMonth(now = new Date()) {
    const [y, m] = ui.month.split('-').map(Number);
    const dim = daysInMonth(y, m - 1);
    const day = now.getDate();
    const daysLeft = dim - day;
    const monthEnd = `${ui.month}-${pad(dim)}`;
    const outs = monthOut(ui.month);
    const received = sum(monthIn(ui.month));
    const spent = sum(outs);
    const key = (t) => strip(t || '').replace(/\s+/g, ' ').trim();

    const pendingFixed = state.fixed.filter((f) => f.from <= ui.month && (f.last || '') < ui.month);
    const fixedIn = pendingFixed.filter((f) => f.kind === 'in');
    const fixedOut = pendingFixed.filter((f) => f.kind !== 'in');

    // Contas dos lembretes até o fim do mês (inclui repetições semanais), sem contar o que já é fixo.
    const fixedNames = new Set(state.fixed.map((f) => key(f.title)));
    const bills = [];
    for (const r of state.reminders) {
      if (r.amount == null || fixedNames.has(key(r.title))) continue;
      let due = r.due;
      for (let i = 0; i < 6 && due.slice(0, 10) <= monthEnd; i++) {
        bills.push(r.amount);
        if (r.repeat === 'none') break;
        due = nextDue({ ...r, due });
      }
    }
    const openDebts = state.debts.filter((d) => debtLeft(d) > 0 && d.due && d.due <= monthEnd);
    const debtIn = openDebts.filter((d) => d.dir === 'in');
    const debtOut = openDebts.filter((d) => d.dir === 'out');

    // Ritmo do dia a dia: fixos (inclusive gastos com o mesmo nome de um fixo) e parcelas ficam de fora.
    // No começo do mês usa o mês anterior.
    const once = (e) => e.fixedId || e.group || fixedNames.has(key(e.title));
    const dailySoFar = sum(outs.filter((e) => !once(e)));
    let perDay = day ? dailySoFar / day : 0;
    if (day < 5) {
      const pk = shiftMonth(ui.month, -1);
      const [py, pm] = pk.split('-').map(Number);
      const prevAvg = sum(monthOut(pk).filter((e) => !once(e))) / daysInMonth(py, pm - 1);
      if (prevAvg > 0) perDay = prevAvg;
    }
    const left = (list) => list.reduce((t, d) => t + debtLeft(d), 0);
    const parts = {
      received, spent,
      fixedIn: sum(fixedIn), fixedInN: fixedIn.length,
      fixedOut: sum(fixedOut), fixedOutN: fixedOut.length,
      bills: bills.reduce((t, v) => t + v, 0), billsN: bills.length,
      debtIn: left(debtIn), debtInN: debtIn.length,
      debtOut: left(debtOut), debtOutN: debtOut.length,
      perDay: Math.round(perDay), daysLeft, dailyEst: Math.round(perDay * daysLeft), monthEnd,
    };
    parts.now = received - spent;
    parts.free = parts.now + parts.fixedIn + parts.debtIn - parts.fixedOut - parts.bills - parts.debtOut;
    parts.end = parts.free - parts.dailyEst;
    return parts;
  }

  function renderForecast(now = new Date()) {
    const panel = $('#forecastPanel');
    panel.hidden = ui.month !== monthKey(now);
    if (panel.hidden) return;
    const f = forecastMonth(now);
    if (!f.received && !f.fixedIn && !f.spent) {
      $('#forecast').innerHTML = '<p class="empty-sm">Lance suas <strong>entradas</strong> (salário, vendas…) para ver com quanto você deve terminar o mês.</p>';
      return;
    }
    const row = (icon, label, note, value, kind) => (value ? `
      <div class="fc-row">${ico(icon)}<span>${label}${note ? ` <small>${note}</small>` : ''}</span>
        <b class="${kind}">${kind === 'in' ? '+' : '−'}${money(value)}</b></div>` : '');
    const n = (k, one, many) => (k === 1 ? `1 ${one}` : `${k} ${many}`);
    const endDate = fmtDM.format(parseDay(f.monthEnd));
    let tip;
    if (f.end >= 0) {
      tip = `<p class="fc-tip good">Você deve terminar o mês com <strong>${signed(f.end)}</strong> de folga.${f.daysLeft ? ` Para fechar no zero, o limite seria ${money(Math.floor(f.free / f.daysLeft))}/dia.` : ''}</p>`;
    } else if (f.free > 0 && f.daysLeft) {
      tip = `<p class="fc-tip bad">No ritmo atual o mês fecha no vermelho. Para não ficar negativo, gaste até <strong>${money(Math.floor(f.free / f.daysLeft))}/dia</strong> nos próximos ${f.daysLeft} dias.</p>`;
    } else {
      tip = `<p class="fc-tip bad">Mesmo sem gastar mais nada, faltam <strong>${money(-f.free)}</strong> para fechar o mês no zero.</p>`;
    }
    $('#forecast').innerHTML = `
      <div class="fc-top">
        <div><span class="label">Saldo previsto em ${endDate}</span><div class="fc-value ${f.end >= 0 ? 'good' : 'bad'}">${signed(f.end)}</div></div>
        <div class="fc-now">Saldo hoje<strong>${signed(f.now)}</strong></div>
      </div>
      <div class="fc-rows">
        ${row('i-in', 'Entradas já recebidas', '', f.received, 'in')}
        ${row('i-out', 'Saídas já feitas', '', f.spent, 'out')}
        ${row('i-repeat', 'Fixos a receber', n(f.fixedInN, 'item', 'itens'), f.fixedIn, 'in')}
        ${row('i-repeat', 'Fixos a pagar', n(f.fixedOutN, 'item', 'itens'), f.fixedOut, 'out')}
        ${row('i-calendar', 'Contas dos lembretes', n(f.billsN, 'conta', 'contas'), f.bills, 'out')}
        ${row('i-hand', 'Cobranças a receber', n(f.debtInN, 'pessoa', 'pessoas'), f.debtIn, 'in')}
        ${row('i-hand', 'Cobranças a pagar', n(f.debtOutN, 'pessoa', 'pessoas'), f.debtOut, 'out')}
        ${row('i-activity', 'Dia a dia estimado', `${money(f.perDay)}/dia × ${f.daysLeft} dias`, f.dailyEst, 'out')}
      </div>
      ${tip}`;
  }

  /* ---------------- Assinaturas e gastos que se repetem ---------------- */
  const SUBS_RE = /netflix|spotify|prime|disney|hbo|\bmax\b|globoplay|youtube|deezer|apple|icloud|google one|paramount|crunchyroll|academia|smart ?fit|gympass|wellhub|internet|celular|plano|assinatura|claro|vivo|\btim\b|streaming/;
  // Procura nos últimos 6 meses o que aparece uma vez por mês, com valor parecido (ou que já é fixo).
  function findRecurring(now = new Date()) {
    const months = Array.from({ length: 6 }, (_, i) => shiftMonth(monthKey(now), -i));
    const norm = (t) => strip(t || '').replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();
    const groups = new Map();
    // Gastos com o mesmo nome de um fixo contam junto com ele (ex.: depois de "Tornar fixo").
    const fixedByTitle = new Map(state.fixed.filter((f) => f.kind !== 'in').map((f) => [norm(f.title), f]));
    for (const e of state.expenses) {
      if (!isOut(e) || e.group || !months.includes(e.date.slice(0, 7))) continue;
      const linked = (e.fixedId && state.fixed.find((f) => f.id === e.fixedId)) || fixedByTitle.get(norm(e.title));
      const k = linked ? `f:${linked.id}` : norm(e.title);
      if (!k) continue;
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(e);
    }
    const out = [];
    for (const [k, list] of groups) {
      const fixed = k.startsWith('f:') ? state.fixed.find((f) => `f:${f.id}` === k) : null;
      list.sort((a, b) => a.date.localeCompare(b.date));
      const byMonth = new Map();
      for (const e of list) byMonth.set(e.date.slice(0, 7), (byMonth.get(e.date.slice(0, 7)) || 0) + e.amount);
      const vals = [...byMonth.values()];
      if (!fixed) {
        if (vals.length < 2 || list.length !== vals.length) continue; // precisa de 2+ meses e 1 vez por mês
        const sorted = [...vals].sort((a, b) => a - b);
        const med = sorted[Math.floor(sorted.length / 2)];
        if (vals.some((v) => Math.abs(v - med) > med * 0.35)) continue; // valores muito diferentes: não é assinatura
      }
      const last = list[list.length - 1];
      const monthly = fixed ? fixed.amount : vals[vals.length - 1];
      const prev = vals.length >= 2 ? vals[vals.length - 2] : 0;
      const up = prev && monthly > prev * 1.05 ? Math.round(((monthly - prev) / prev) * 100) : 0;
      const title = fixed ? fixed.title : last.title;
      out.push({
        key: k, title, cat: fixed ? fixed.cat : last.cat, monthly, months: vals.length, fixed: !!fixed,
        isSub: SUBS_RE.test(norm(title)), up, day: fixed ? fixed.day : Number(last.date.slice(8, 10)),
        method: last.method, lastMonth: last.date.slice(0, 7),
      });
    }
    // Fixos que ainda não foram lançados nenhuma vez também contam.
    for (const f of state.fixed) {
      if (f.kind === 'in' || groups.has(`f:${f.id}`)) continue;
      out.push({ key: `f:${f.id}`, title: f.title, cat: f.cat, monthly: f.amount, months: 0, fixed: true,
        isSub: SUBS_RE.test(norm(f.title)), up: 0, day: f.day, method: f.method, lastMonth: f.last || '' });
    }
    return out.sort((a, b) => b.monthly - a.monthly);
  }

  let recurCache = [];
  function renderRecurring(now = new Date()) {
    const list = findRecurring(now);
    recurCache = list;
    $('#recurPanel').hidden = !list.length;
    if (!list.length) return;
    const total = list.reduce((t, r) => t + r.monthly, 0);
    $('#recurSub').textContent = `${list.length} ${list.length > 1 ? 'itens' : 'item'}`;
    $('#recurSum').innerHTML = `
      <div><span class="label">Por mês</span><strong>${money(total)}</strong></div>
      <div><span class="label">Por ano</span><strong>${money(total * 12)}</strong></div>`;
    const shown = ui.showAllRecur ? list : list.slice(0, 6);
    $('#recur').innerHTML = shown.map((r, i) => {
      const tags = [
        r.isSub && '<span class="recur-tag sub">Assinatura</span>',
        r.up && `<span class="recur-tag up">↑ ${r.up}% mais caro</span>`,
        r.fixed ? '<span class="recur-tag fixed">Fixo</span>' : `<button type="button" class="recur-fix" data-fix="${i}">Tornar fixo</button>`,
      ].filter(Boolean).join('');
      const seen = r.fixed ? `todo dia ${r.day}` : `${r.months} dos últimos 6 meses · por volta do dia ${r.day}`;
      return `
        <div class="recur-item">
          ${catIcon(catOf(r.cat))}
          <div class="recur-item__main">
            <strong>${esc(r.title)}</strong>
            <small>${seen}</small>
            <div class="recur-tags">${tags}</div>
          </div>
          <div class="recur-item__side">
            <span class="recur-item__val">${money(r.monthly)}</span>
            <small class="panel__sub">${money(r.monthly * 12)}/ano</small>
          </div>
        </div>`;
    }).join('') + (list.length > 6
      ? `<button type="button" class="debts__more" data-recur-all>${ui.showAllRecur ? 'Mostrar menos' : `Ver todos (${list.length})`}</button>` : '');
  }
  $('#recur').addEventListener('click', (e) => {
    if (e.target.closest('[data-recur-all]')) { ui.showAllRecur = !ui.showAllRecur; renderRecurring(); return; }
    const b = e.target.closest('[data-fix]');
    if (!b) return;
    const r = (ui.showAllRecur ? recurCache : recurCache.slice(0, 6))[Number(b.dataset.fix)];
    if (!r) return;
    // Vira fixo a partir do próximo mês (o deste mês já foi lançado).
    state.fixed.push({
      id: uid(), kind: 'out', title: r.title, amount: r.monthly, cat: r.cat, method: r.method || 'Pix',
      day: r.day, from: r.lastMonth, last: r.lastMonth,
    });
    save();
    render();
    toast(`"${r.title}" agora é fixo: será lançado sozinho todo dia ${r.day}.`);
  });

  /* ---------------- Orçamento e limites ---------------- */
  const dlgBudget = $('#dlgBudget');
  const budgetInput = $('#budgetInput');
  bindLiveAmount(budgetInput, $('#budgetOut'), { optional: true });

  function openBudget() {
    budgetInput.value = state.budget ? amountInput(state.budget) : '';
    budgetInput._update();
    $('#limitList').innerHTML = catList('out').map((c) => `
      <label class="limit-row">
        ${catIcon(c)}<span>${esc(c.name)}</span>
        <input inputmode="decimal" data-limit="${c.id}" placeholder="Sem limite" autocomplete="off"
          value="${state.catBudgets[c.id] ? amountInput(state.catBudgets[c.id]) : ''}">
      </label>`).join('');
    dlgBudget.showModal();
  }
  $('#btnBudget').addEventListener('click', openBudget);
  $('#btnLimits').addEventListener('click', openBudget);
  $('#formBudget').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = readAmount(budgetInput);
    if (Number.isNaN(v)) { toast('Valor inválido no orçamento do mês.'); return; }
    const limits = {};
    for (const inp of $$('[data-limit]')) {
      if (!inp.value.trim()) continue;
      const lv = safeEval(inp.value);
      if (!Number.isFinite(lv) || lv < 0) { toast('Algum limite está com valor inválido.'); inp.focus(); return; }
      if (lv > 0) limits[inp.dataset.limit] = toCents(lv);
    }
    state.budget = v || 0;
    state.catBudgets = limits;
    save();
    dlgBudget.close();
    renderSummary();
    const n = Object.keys(limits).length;
    toast(`Orçamento salvo${n ? ` · ${n} limite${n > 1 ? 's' : ''} por categoria` : ''}.`);
  });
  $('#budgetClear').addEventListener('click', () => {
    state.budget = 0;
    state.catBudgets = {};
    save();
    dlgBudget.close();
    renderSummary();
    toast('Orçamento e limites removidos.');
  });

  /* ---------------- Cartão ---------------- */
  const dlgCard = $('#dlgCard');
  const formCard = $('#formCard');
  function openCard() {
    formCard.close.value = state.card.close || '';
    formCard.due.value = state.card.due || '';
    dlgCard.showModal();
  }
  $('#btnCard').addEventListener('click', openCard);
  $('#invoices').addEventListener('click', (e) => { if (e.target.closest('[data-card-setup]')) openCard(); });
  formCard.addEventListener('submit', (e) => {
    e.preventDefault();
    const close = Math.floor(Number(formCard.close.value));
    const due = Math.floor(Number(formCard.due.value));
    if (!(close >= 1 && close <= 31 && due >= 1 && due <= 31)) { toast('Use dias entre 1 e 31.'); return; }
    state.card = { close, due };
    save();
    dlgCard.close();
    renderSummary();
    toast('Cartão configurado. As faturas aparecem no Resumo.');
  });

  /* ---------------- Calculadora ---------------- */
  let calc = '';
  const PRETTY = { '*': '×', '/': '÷', '-': '−' };
  const prettify = (s) => s.replace(/[*/-]/g, (c) => PRETTY[c]);

  function calcValue() {
    if (!calc) return 0;
    // Ignora um operador solto no final enquanto o usuário digita.
    return safeEval(calc.replace(/[+\-*/]+$/, ''));
  }

  function renderCalc() {
    $('#calcExpr').textContent = calc ? prettify(calc) : '\u00a0';
    const v = calcValue();
    const out = $('#calcResult');
    out.textContent = Number.isFinite(v) ? num.format(Math.round(v * 1e8) / 1e8) : '…';
    // Diminui a fonte quando o número fica comprido, para caber sem quebrar.
    out.classList.toggle('is-long', out.textContent.length > 9 && out.textContent.length <= 13);
    out.classList.toggle('is-xlong', out.textContent.length > 13);
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

  // Teclas: o dedo encostando só marca a tecla; o valor entra ao SOLTAR em cima dela.
  // Se o dedo se mover (para rolar a tela) ou o toque for cancelado, nada é digitado.
  const calcKeys = $('#calcKeys');
  const MOVE_TOLERANCE = 10; // px que o dedo pode "tremer" sem cancelar o toque
  let touch = null; // { b, id, x, y, repeated }
  let holdTimer = null;
  let holdRepeat = null;
  let lastPointer = 0;
  const stopHold = () => { clearTimeout(holdTimer); clearInterval(holdRepeat); holdTimer = holdRepeat = null; };
  function endTouch() {
    stopHold();
    if (touch) touch.b.classList.remove('is-pressed');
    touch = null;
  }
  calcKeys.addEventListener('pointerdown', (e) => {
    const b = e.target.closest('[data-k]');
    if (!b || e.button > 0) return;
    endTouch();
    touch = { b, id: e.pointerId, x: e.clientX, y: e.clientY, repeated: false };
    b.classList.add('is-pressed');
    // Segurar o ⌫ (sem mover o dedo) apaga em sequência.
    if (b.dataset.k === 'back') {
      holdTimer = setTimeout(() => {
        if (!touch || touch.b !== b) return;
        touch.repeated = true;
        press('back');
        holdRepeat = setInterval(() => (calc ? press('back') : stopHold()), 70);
      }, 450);
    }
  });
  calcKeys.addEventListener('pointermove', (e) => {
    if (!touch || e.pointerId !== touch.id) return;
    if (Math.hypot(e.clientX - touch.x, e.clientY - touch.y) > MOVE_TOLERANCE) endTouch();
  });
  calcKeys.addEventListener('pointerup', (e) => {
    if (!touch || e.pointerId !== touch.id) return;
    const { b, repeated, x, y } = touch;
    const under = document.elementFromPoint(e.clientX, e.clientY);
    const sameKey = under && under.closest('[data-k]') === b;
    const still = Math.hypot(e.clientX - x, e.clientY - y) <= MOVE_TOLERANCE;
    endTouch();
    lastPointer = Date.now();
    if (!sameKey || !still || repeated) return;
    press(b.dataset.k);
    b.classList.add('is-pressed');
    setTimeout(() => b.classList.remove('is-pressed'), 90);
    if (navigator.vibrate) navigator.vibrate(6);
  });
  // Rolagem da tela, outro dedo ou saída do botão cancelam o toque.
  ['pointercancel', 'pointerleave'].forEach((ev) => calcKeys.addEventListener(ev, (e) => {
    if (touch && e.pointerId === touch.id) endTouch();
  }));
  // Teclado / leitor de tela (Enter/Espaço). O "click" que o navegador gera logo após o toque é ignorado,
  // senão cada tecla contaria duas vezes.
  calcKeys.addEventListener('click', (e) => {
    const b = e.target.closest('[data-k]');
    if (b && Date.now() - lastPointer > 600) press(b.dataset.k);
  });

  // Tela cheia
  const calcPanel = $('#calcPanel');
  const isCalcFull = () => calcPanel.classList.contains('is-full');
  function setCalcFull(on) {
    calcPanel.classList.toggle('is-full', on);
    document.body.classList.toggle('calc-full-open', on);
    $('#calcFull use').setAttribute('href', on ? '#i-shrink' : '#i-expand');
    $('#calcFull').setAttribute('aria-label', on ? 'Sair da tela cheia' : 'Abrir em tela cheia');
    $('#calcFull').title = on ? 'Sair da tela cheia' : 'Tela cheia';
  }
  function openCalcFull() {
    if (isCalcFull()) return;
    setCalcFull(true);
    // O botão "voltar" do celular fecha a tela cheia em vez de sair do app.
    history.pushState({ calcFull: true }, '');
  }
  function closeCalcFull() {
    if (!isCalcFull()) return;
    if (history.state && history.state.calcFull) history.back();
    else setCalcFull(false);
  }
  $('#calcFull').addEventListener('click', () => (isCalcFull() ? closeCalcFull() : openCalcFull()));
  window.addEventListener('popstate', () => { if (isCalcFull()) setCalcFull(false); });

  $('#calcHist').addEventListener('click', (e) => {
    const b = e.target.closest('[data-h]');
    if (!b) return;
    calc = String(state.calcHist[Number(b.dataset.h)].result).replace('.', ',');
    renderCalc();
  });

  document.addEventListener('keydown', (e) => {
    if (ui.view !== 'calc' || document.querySelector('dialog[open]')) return;
    if (e.target.matches('input, select, textarea') || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Escape' && isCalcFull()) { e.preventDefault(); closeCalcFull(); return; }
    const map = { Enter: '=', '=': '=', Backspace: 'back', Escape: 'C', Delete: 'C', '.': ',', x: '*', X: '*' };
    const k = map[e.key] || (/^[0-9+\-*/(),%]$/.test(e.key) ? e.key : null);
    if (!k) return;
    e.preventDefault();
    press(k);
  });

  $('#calcUse').addEventListener('click', () => {
    const v = calcValue();
    if (!Number.isFinite(v) || v <= 0) { toast('Faça uma conta com resultado positivo primeiro.'); return; }
    openExpense(null, { kind: 'out', amount: toCents(v) });
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
    openExpense(null, { kind: 'out', amount: each, title: 'Conta dividida', cat: 'alimentacao' });
  });

  /* ---------------- Botão + ---------------- */
  $('#btnAdd').addEventListener('click', () => {
    if (ui.view === 'lembretes') openReminder();
    else openExpense(null, { kind: ui.kindFilter === 'in' && ui.view === 'gastos' ? 'in' : 'out' });
  });

  /* ---------------- Tema ---------------- */
  const THEME_ICON = { auto: '#i-auto', light: '#i-sun', dark: '#i-moon' };
  const THEME_LABEL = { auto: 'automático', light: 'claro', dark: 'escuro' };
  function applyTheme() {
    if (state.theme === 'auto') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = state.theme;
    $('#btnTheme use').setAttribute('href', THEME_ICON[state.theme]);
    // Mantém o navegador sem "escurecer à força" as cores do app.
    $('#metaScheme').content = state.theme === 'auto' ? 'light dark' : state.theme;
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

  menu.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-action]');
    if (!b) return;
    menu.hidden = true;
    const action = b.dataset.action;
    if (action === 'install') installApp();
    else if (action === 'budget') openBudget();
    else if (action === 'goal') openGoal();
    else if (action === 'report') openReport();
    else if (action === 'daily') openDaily();
    else if (action === 'fixed') openFixed();
    else if (action === 'cats') openCats();
    else if (action === 'card') openCard();
    else if (action === 'export-csv') exportCSV();
    else if (action === 'export-ics') {
      if (!state.reminders.length) { toast('Nenhum lembrete para exportar.'); return; }
      download('lembretes-gastos.ics', buildICS(), 'text/calendar');
      toast('Abra o arquivo .ics para adicionar os lembretes ao calendário do celular.');
    } else if (action === 'export-json') {
      const pics = {};
      for (const x of state.expenses.filter((y) => y.photo)) {
        const d = await photos.get(x.id);
        if (d) pics[x.id] = d;
      }
      const data = {
        app: 'meus-gastos', version: 2, exportedAt: new Date().toISOString(),
        expenses: state.expenses, reminders: state.reminders, budget: state.budget, catBudgets: state.catBudgets,
        fixed: state.fixed, customCats: state.customCats, card: state.card, goals: state.goals, debts: state.debts, pixKey: state.pixKey, daily: state.daily, photos: pics,
      };
      download(`meus-gastos-backup-${dateISO(new Date())}.json`, JSON.stringify(data), 'application/json');
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
      if (!confirm(`Restaurar ${data.expenses.length} lançamentos e ${data.reminders.length} lembretes?\nOs dados atuais serão substituídos.`)) return;
      Object.assign(state, normalize(data, state));
      state.reminders.forEach((r) => markPastAlerts(r));
      const pics = data.photos && typeof data.photos === 'object' ? data.photos : {};
      for (const [id, d] of Object.entries(pics)) if (typeof d === 'string' && d.startsWith('data:image/')) await photos.put(id, d).catch(() => {});
      save();
      refreshCatSelects();
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
    if (!list.length) { toast('Nenhum lançamento neste mês para exportar.'); return; }
    const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = [['Data', 'Tipo', 'Descrição', 'Categoria', 'Pagamento', 'Parcela', 'Valor', 'Observação']];
    for (const e of list) {
      rows.push([fmtDM.format(parseDay(e.date)) + '/' + e.date.slice(0, 4), isIn(e) ? 'Entrada' : 'Saída', e.title,
        catOf(e.cat, kindOf(e)).name, e.method || '', e.inst || '', amountInput(e.amount), e.notes || '']);
    }
    const outs = sum(list.filter(isOut));
    const ins = sum(list.filter(isIn));
    rows.push(['', '', 'TOTAL SAÍDAS', '', '', '', amountInput(outs), '']);
    rows.push(['', '', 'TOTAL ENTRADAS', '', '', '', amountInput(ins), '']);
    rows.push(['', '', 'SALDO', '', '', '', amountInput(ins - outs), '']);
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

  /* ---------------- Instalar como app ---------------- */
  let installEvent = null;
  const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  function updateInstallItem() { $('#menuInstall').hidden = isStandalone(); }
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvent = e; updateInstallItem(); });
  window.addEventListener('appinstalled', () => {
    installEvent = null;
    updateInstallItem();
    toast('App instalado! Procure o ícone "Meus Gastos" na tela inicial.');
  });

  async function installApp() {
    if (installEvent) {
      installEvent.prompt();
      const { outcome } = await installEvent.userChoice;
      installEvent = null;
      if (outcome === 'accepted') toast('Instalando… o ícone aparece na tela inicial.');
      return;
    }
    // Sem o aviso automático do navegador: mostra o passo a passo.
    const share = '<svg class="ic"><use href="#i-upload"/></svg>';
    const steps = isIOS()
      ? ['Abra este endereço no <strong>Safari</strong>.',
        `Toque em <strong>Compartilhar</strong> ${share} na barra de baixo.`,
        'Escolha <strong>“Adicionar à Tela de Início”</strong> e toque em <strong>Adicionar</strong>.']
      : /samsungbrowser/i.test(navigator.userAgent)
        ? ['Toque no menu <strong>☰</strong> (três linhas) do Samsung Internet.',
          'Escolha <strong>“Adicionar página a”</strong> → <strong>“Tela inicial”</strong> (ou “Instalar app”, se aparecer).',
          'Confirme em <strong>Adicionar</strong>.']
        : ['Toque no menu <strong>⋮</strong> do navegador (Chrome).',
          'Escolha <strong>“Instalar app”</strong> ou <strong>“Adicionar à tela inicial”</strong>.',
          'Confirme em <strong>Instalar</strong>.'];
    $('#installSteps').innerHTML = steps.concat('Pronto: abra pelo ícone <strong>Meus Gastos</strong> — ele abre em tela cheia, como um app.')
      .map((t) => `<li><span>${t}</span></li>`).join('');
    $('#dlgInstall').showModal();
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
  function launchFixed() {
    const n = runFixed();
    if (n) toast(`${n} lançamento${n > 1 ? 's' : ''} fixo${n > 1 ? 's' : ''} adicionado${n > 1 ? 's' : ''} automaticamente.`);
    return n;
  }

  applyTheme();
  applyPrivacy();
  updateBell();
  updateInstallItem();
  refreshCatSelects();
  launchFixed();
  render();
  renderCalc();
  calcSplit();
  checkReminders();
  checkDebts();
  checkDaily();
  setInterval(() => { checkReminders(); checkDebts(); checkDaily(); }, CHECK_EVERY_MS);
  // Atualiza "hoje/amanhã", fixos e médias quando o app volta para a tela.
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) { launchFixed(); checkReminders(); checkDebts(); checkDaily(); render(); }
  });

  // Atalho vindo da tela inicial do celular: ?novo=1
  // Atalhos do ícone e notificações abrem o app com ?novo=1 ou ?acao=...
  const params = new URLSearchParams(location.search);
  const acao = params.get('acao');
  if (params.has('novo') || acao) history.replaceState(null, '', location.pathname);
  if (params.has('novo')) openExpense();
  else if (acao === 'cobranca') openDebt();
  else if (acao === 'rapido') setTimeout(() => quickInput.focus(), 300);
  else if (LAUNCH[acao]) openLaunch(acao);
})();
