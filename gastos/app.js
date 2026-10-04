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
    payingRem: null,
    pickedCat: 'alimentacao',
    photo: { data: null, changed: false },
  };

  function load() {
    const empty = {
      expenses: [], reminders: [], budget: 0, theme: 'auto', calcHist: [],
      catBudgets: {}, fixed: [], customCats: [], card: { close: 0, due: 0 },
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
  const money = (cents) => brl.format(cents / 100);
  const signed = (cents) => `${cents < 0 ? '−' : ''}${money(Math.abs(cents))}`;
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
  function compressImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, 1280 / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k);
        c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL('image/jpeg', 0.72));
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
    renderCompare();
    renderInvoices(now);
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
    const compact = (c) => (c >= 100000 ? `${num.format(Math.round(c / 100000) / 10)} mil` : money(c).replace(/,\d\d$/, ''));
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
    if (exp && exp.photo) photos.get(exp.id).then((d) => { if (ui.editingExp === exp.id) setPhoto(d); });
    expAmount._update();
    updateTitle();
    updateInstallments();
    dlgExp.showModal();
    if (!exp && !fixed && !src.amount) expAmount.focus();
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
  const FILLERS = new Set(['no', 'na', 'nos', 'nas', 'de', 'do', 'da', 'dos', 'das', 'em', 'com', 'pelo', 'pela', 'e', 'o', 'a', 'pra', 'para']);

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

  function updateBell() {
    const b = $('#btnNotif');
    b.classList.toggle('is-on', canNotify());
    $('use', b).setAttribute('href', canNotify() ? '#i-bell-on' : '#i-bell');
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
    const bell = $('#btnNotif');
    bell.classList.remove('ring');
    void bell.offsetWidth; // reinicia a animação
    bell.classList.add('ring');
    if (!canNotify()) return;
    const opts = { body, tag, badge: 'icon.svg', requireInteraction: true };
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
    if (action === 'budget') openBudget();
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
        fixed: state.fixed, customCats: state.customCats, card: state.card, photos: pics,
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
  updateBell();
  refreshCatSelects();
  launchFixed();
  render();
  renderCalc();
  calcSplit();
  checkReminders();
  setInterval(checkReminders, CHECK_EVERY_MS);
  // Atualiza "hoje/amanhã", fixos e médias quando o app volta para a tela.
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) { launchFixed(); checkReminders(); render(); }
  });

  // Atalho vindo da tela inicial do celular: ?novo=1
  if (new URLSearchParams(location.search).has('novo')) openExpense();
})();
