/* Confirma Nota — monta a mensagem de confirmação de nota (cliente, vendedor, data),
   guarda quem já recebeu e lembra de cobrar a resposta. Funciona no navegador (PWA) e no APK (Capacitor). */
(() => {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const CHAVE = 'confirma.v1';

  const MODELO_PADRAO = `{saudacao},
{cliente}

Aqui é {atendente}, O motivo do meu contato é SOMENTE para confirmar a sua nota com vendedor {vendedor} no dia {data} *Você poderia nos confirmar  O VALOR DA SUA COMPRA ou me encaminhar uma FOTO da nota, por gentileza*?

*⚠️SUA RESPOSTA É MUITO IMPORTANTE⚠️*`;

  /* ---------------- Dados ---------------- */
  const state = carregar();
  function carregar() {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(CHAVE)); } catch { s = null; }
    s = s && typeof s === 'object' ? s : {};
    s.contatos = Array.isArray(s.contatos) ? s.contatos : [];
    s.ajustes = Object.assign({ atendente: 'Mary', modelo: MODELO_PADRAO, lembreteHoras: 4, resumo: '17:00', avisosWeb: {}, vendedores: [] }, s.ajustes || {});
    if (!Array.isArray(s.ajustes.vendedores)) s.ajustes.vendedores = [];
    // Primeira vez: aproveita os vendedores que já foram usados nas mensagens.
    if (!s.ajustes.vendedores.length) s.ajustes.vendedores = [...new Set(s.contatos.map((c) => c.vendedor).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    s.rascunho = s.rascunho || {};
    return s;
  }
  function salvar() { try { localStorage.setItem(CHAVE, JSON.stringify(state)); } catch { toast('Não deu para salvar neste aparelho.'); } }

  /* ---------------- Utilidades ---------------- */
  const esc = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const hojeISO = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
  const dataBR = (iso) => (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso.split('-').reverse().join('.') : '');
  const dinheiro = (n) => (n == null || isNaN(n) ? '' : n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
  const quando = (ts) => new Date(ts).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  function lerValor(t) {
    let s = String(t || '').replace(/[^\d,.-]/g, '');
    if (!s) return null;
    if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
    else if (/\.\d{3}$/.test(s)) s = s.replace(/\./g, '');
    const n = parseFloat(s);
    return isNaN(n) ? null : Math.round(n * 100) / 100;
  }
  // "maria da silva" → "Maria da Silva"
  const MINUSC = new Set(['da', 'de', 'do', 'das', 'dos', 'e']);
  function nomeBonito(t) {
    return String(t || '').trim().replace(/\s+/g, ' ').split(' ')
      .map((p, i) => (i > 0 && MINUSC.has(p.toLowerCase()) ? p.toLowerCase() : p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()))
      .join(' ');
  }
  function saudacao(d = new Date()) { const h = d.getHours(); return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'; }
  function soDigitos(t) { return String(t || '').replace(/\D/g, ''); }
  function numeroWhats(fone) {
    const d = soDigitos(fone);
    return d.length === 10 || d.length === 11 ? `55${d}` : d;
  }
  let toastT = null;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg; el.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(() => { el.hidden = true; }, 2800);
  }

  /* ---------------- Mensagem ---------------- */
  function montar(c, comMarcas = false) {
    const marca = (v, nome) => (v ? v : comMarcas ? `\u0000${nome}\u0001` : `(${nome})`);
    return state.ajustes.modelo
      .replace(/\{saudacao\}/g, saudacao())
      .replace(/\{cliente\}/g, marca(c.cliente, 'nome da cliente'))
      .replace(/\{atendente\}/g, state.ajustes.atendente || 'Mary')
      .replace(/\{vendedor\}/g, marca(c.vendedor, 'vendedor'))
      .replace(/\{data\}/g, marca(dataBR(c.data), 'data'));
  }
  // Prévia parecida com o WhatsApp: *negrito* e campos que faltam em destaque.
  function previaHTML(c) {
    return esc(montar(c, true))
      .replace(/\u0000(.*?)\u0001/g, '<span class="vazio">($1)</span>')
      .replace(/\*([^*\n]+)\*/g, '<b>$1</b>');
  }
  function lerForm() {
    return { cliente: $('#fCliente').value.trim(), vendedor: $('#fVendedor').value.trim(), data: $('#fData').value, fone: $('#fFone').value.trim() };
  }
  function atualizarPrevia() {
    const c = lerForm();
    $('#previa').innerHTML = previaHTML(c);
    state.rascunho = c; salvar();
  }
  function validar(c) {
    if (!c.cliente) { toast('Falta o nome da cliente.'); $('#fCliente').focus(); return false; }
    if (!c.vendedor) { toast(state.ajustes.vendedores.length ? 'Escolha o vendedor.' : 'Cadastre os vendedores em Ajustes.'); $('#fVendedor').focus(); return false; }
    if (!c.data) { toast('Falta a data da nota.'); $('#fData').focus(); return false; }
    return true;
  }
  function linkWhats(c) { return `https://wa.me/${numeroWhats(c.fone)}?text=${encodeURIComponent(montar(c))}`; }

  // Guarda a cliente na lista (ou atualiza, se já estava aguardando a mesma nota).
  function registrar(c) {
    let r = state.contatos.find((x) => x.status === 'aguardando' && x.cliente.toLowerCase() === c.cliente.toLowerCase() && x.vendedor.toLowerCase() === c.vendedor.toLowerCase() && x.data === c.data);
    if (!r) {
      r = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), status: 'aguardando', criadoEm: Date.now(), envios: 0 };
      state.contatos.unshift(r);
    }
    Object.assign(r, { cliente: c.cliente, vendedor: c.vendedor, data: c.data, fone: c.fone, enviadoEm: Date.now() });
    r.envios = (r.envios || 0) + 1;
    salvar();
    agendarLembrete(r);
    agendarResumo();
    renderLista();
    return r;
  }
  function limparForm() {
    $('#fCliente').value = ''; $('#fFone').value = '';
    // Vendedor e data costumam se repetir na sequência: ficam.
    atualizarPrevia();
    $('#fCliente').focus();
  }

  async function copiar(texto) {
    try { await navigator.clipboard.writeText(texto); return true; } catch {
      const t = document.createElement('textarea'); t.value = texto; document.body.appendChild(t); t.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch { ok = false; }
      t.remove(); return ok;
    }
  }

  $('#form').addEventListener('input', atualizarPrevia);
  $('#form').addEventListener('submit', (e) => e.preventDefault());
  $('#fCliente').addEventListener('blur', (e) => { e.target.value = nomeBonito(e.target.value); atualizarPrevia(); });
  $('#fVendedor').addEventListener('change', (e) => {
    if (e.target.value === NOVO) {
      const nome = nomeBonito(prompt('Nome do novo vendedor:') || '');
      if (nome) addVendedor(nome);
      e.target.value = nome && state.ajustes.vendedores.includes(nome) ? nome : '';
    }
    e.target.classList.toggle('is-vazio', !e.target.value);
    atualizarPrevia();
  });
  $('#btnLimpar').addEventListener('click', limparForm);
  $('#btnWhats').addEventListener('click', () => {
    const c = lerForm(); if (!validar(c)) return;
    registrar(c);
    window.open(linkWhats(c), '_blank');
    toast(`${c.cliente} ficou como “Aguardando”.`);
    limparForm();
  });
  $('#btnCopiar').addEventListener('click', async () => {
    const c = lerForm(); if (!validar(c)) return;
    if (await copiar(montar(c))) { registrar(c); toast('Mensagem copiada. Cole no WhatsApp.'); limparForm(); }
    else toast('Não deu para copiar.');
  });
  $('#btnCompartilhar').addEventListener('click', async () => {
    const c = lerForm(); if (!validar(c)) return;
    const texto = montar(c);
    try {
      if (SHARE) await SHARE.share({ text: texto, dialogTitle: 'Enviar mensagem' });
      else if (navigator.share) await navigator.share({ text: texto });
      else { await copiar(texto); toast('Mensagem copiada.'); }
      registrar(c); limparForm();
    } catch (err) { if (!/cancel|abort/i.test(String(err && (err.message || err.name)))) toast('Não deu para compartilhar.'); }
  });

  /* ---------------- Voz ---------------- */
  const Cap = window.Capacitor;
  const NATIVE = !!(Cap && Cap.isNativePlatform && Cap.isNativePlatform());
  const plugin = (n) => (NATIVE ? (Cap.Plugins && Cap.Plugins[n]) || (Cap.registerPlugin && Cap.registerPlugin(n)) || null : null);
  const LN = plugin('LocalNotifications');
  const SHARE = plugin('Share');
  const SR_NATIVO = plugin('SpeechRecognition');
  const SR_WEB = window.SpeechRecognition || window.webkitSpeechRecognition || null;

  let ouvindo = null; // { botao, parar() }
  function fimOuvir() {
    if (!ouvindo) return;
    ouvindo.botao.classList.remove('is-ouvindo');
    $('#ouvindo').hidden = true;
    ouvindo = null;
  }
  function preencher(campo, texto) {
    const el = document.getElementById(campo);
    el.value = nomeBonito(texto);
    atualizarPrevia();
  }
  async function ouvirNativo(campo, botao) {
    let melhor = '';
    const subs = [];
    let fimT = null;
    const terminar = () => { clearTimeout(fimT); subs.forEach((s) => s.remove()); if (melhor) preencher(campo, melhor); fimOuvir(); };
    const fimLogo = (ms) => { clearTimeout(fimT); fimT = setTimeout(terminar, ms); };
    ouvindo = { botao, parar: () => { SR_NATIVO.stop().catch(() => {}); fimLogo(1000); } };
    try {
      let p = await SR_NATIVO.checkPermissions();
      if (p.speechRecognition !== 'granted') p = await SR_NATIVO.requestPermissions();
      if (p.speechRecognition !== 'granted') { toast('Permita o microfone para falar o nome.'); fimOuvir(); return; }
      let parando = false;
      subs.push(await SR_NATIVO.addListener('partialResults', (d) => {
        const t = d && d.matches && d.matches[0];
        if (t && t.trim().length >= melhor.length) melhor = t.trim();
        if (melhor) preencher(campo, melhor);
        if (parando) fimLogo(350);
      }));
      // O Android avisa que parou ANTES da frase final: espera um pouco por ela.
      subs.push(await SR_NATIVO.addListener('listeningState', (d) => { if (d && d.status === 'stopped') { parando = true; fimLogo(1500); } }));
      const r = await SR_NATIVO.start({ language: 'pt-BR', maxResults: 1, partialResults: true, popup: false });
      if (r && r.matches && r.matches[0]) { melhor = r.matches[0]; terminar(); }
    } catch {
      toast('Não ouvi nada. Toque no 🎤 e fale de novo.');
      terminar();
    }
  }
  function ouvirWeb(campo, botao) {
    const rec = new SR_WEB();
    rec.lang = 'pt-BR'; rec.interimResults = true; rec.maxAlternatives = 1;
    rec.onresult = (e) => preencher(campo, [...e.results].map((r) => r[0].transcript).join(' '));
    rec.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') toast('Permita o microfone para falar o nome.');
      else if (e.error === 'no-speech') toast('Não ouvi nada. Toque no 🎤 e fale de novo.');
    };
    rec.onend = fimOuvir;
    ouvindo = { botao, parar: () => rec.stop() };
    try { rec.start(); } catch { fimOuvir(); }
  }
  $$('.mic').forEach((botao) => botao.addEventListener('click', () => {
    if (ouvindo) { const mesmo = ouvindo.botao === botao; ouvindo.parar(); if (mesmo) return; }
    if (!SR_NATIVO && !SR_WEB) { toast('Este navegador não tem ditado por voz. Use o teclado ou o app Android.'); return; }
    botao.classList.add('is-ouvindo');
    $('#ouvindo').hidden = false;
    const campo = botao.dataset.mic;
    if (SR_NATIVO) ouvirNativo(campo, botao); else ouvirWeb(campo, botao);
  }));

  /* ---------------- Vendedores ---------------- */
  const NOVO = '__novo';
  // Campo "Nome do vendedor": ao tocar, mostra todos os vendedores cadastrados para escolher.
  function renderVendedores() {
    const sel = $('#fVendedor');
    const atual = sel.value && sel.value !== NOVO ? sel.value : (state.rascunho.vendedor || '');
    const lista = state.ajustes.vendedores;
    sel.innerHTML = `<option value="">${lista.length ? 'Toque para escolher o vendedor' : 'Nenhum vendedor cadastrado'}</option>`
      + lista.map((v) => `<option value="${esc(v)}">${esc(v)}</option>`).join('')
      + `<option value="${NOVO}">➕ Cadastrar novo vendedor…</option>`;
    sel.value = lista.includes(atual) ? atual : '';
    sel.classList.toggle('is-vazio', !sel.value);
    $('#listaVend').innerHTML = lista.length
      ? lista.map((v, i) => `<li><span>${esc(v)}</span><button type="button" data-del="${i}" aria-label="Remover ${esc(v)}">🗑️</button></li>`).join('')
      : '<li class="vazia">Nenhum vendedor ainda. Adicione acima.</li>';
  }
  function addVendedor(nome) {
    nome = nomeBonito(nome);
    if (!nome) return false;
    if (state.ajustes.vendedores.some((v) => v.toLowerCase() === nome.toLowerCase())) { toast(`${nome} já está na lista.`); return false; }
    state.ajustes.vendedores.push(nome);
    state.ajustes.vendedores.sort((a, b) => a.localeCompare(b, 'pt-BR'));
    salvar(); renderVendedores();
    return true;
  }
  $('#btnAddVendedor').addEventListener('click', () => {
    const el = $('#aNovoVendedor');
    if (!el.value.trim()) { el.focus(); return; }
    if (addVendedor(el.value)) { toast('Vendedor adicionado.'); el.value = ''; }
    el.focus();
  });
  $('#aNovoVendedor').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); $('#btnAddVendedor').click(); } });
  $('#listaVend').addEventListener('click', (e) => {
    const b = e.target.closest('[data-del]'); if (!b) return;
    const nome = state.ajustes.vendedores[Number(b.dataset.del)];
    if (!nome || !confirm(`Remover ${nome} da lista de vendedores?`)) return;
    state.ajustes.vendedores = state.ajustes.vendedores.filter((v) => v !== nome);
    salvar(); renderVendedores(); atualizarPrevia();
  });

  /* ---------------- Contatos (gestão) ---------------- */
  let filtro = 'aguardando';
  function renderLista() {
    const busca = $('#busca').value.trim().toLowerCase();
    const itens = state.contatos.filter((c) => (filtro === 'todas' || c.status === filtro) && (!busca || `${c.cliente} ${c.vendedor}`.toLowerCase().includes(busca)));
    const pend = state.contatos.filter((c) => c.status === 'aguardando').length;
    const conf = state.contatos.filter((c) => c.status === 'confirmada');
    const total = conf.reduce((s, c) => s + (c.valor || 0), 0);
    $('#resumo').textContent = `${pend} aguardando · ${conf.length} confirmada${conf.length === 1 ? '' : 's'}${total ? ` · ${dinheiro(total)}` : ''}`;
    $('#contaPend').hidden = !pend; $('#contaPend').textContent = pend;

    if (!itens.length) {
      $('#lista').innerHTML = `<p class="vazia">${filtro === 'aguardando' ? 'Ninguém aguardando resposta. 🎉' : 'Nada por aqui ainda.'}</p>`;
      return;
    }
    $('#lista').innerHTML = itens.map((c) => `
      <div class="item" data-id="${c.id}">
        <div class="item__topo">
          <span class="item__nome">${esc(c.cliente)}</span>
          <span class="selo selo--${c.status}">${c.status === 'aguardando' ? 'Aguardando' : `Confirmada${c.valor != null ? ` · ${dinheiro(c.valor)}` : ''}`}</span>
        </div>
        <div class="item__info">Vendedor ${esc(c.vendedor)} · nota de ${dataBR(c.data)}${c.fone ? ` · ${esc(c.fone)}` : ''}</div>
        <div class="item__info">${c.status === 'aguardando' ? `Enviada ${quando(c.enviadoEm)}${c.envios > 1 ? ` (${c.envios}×)` : ''}` : `Confirmada ${quando(c.confirmadoEm)}${c.obs ? ` · ${esc(c.obs)}` : ''}`}</div>
        <div class="item__acoes">
          ${c.status === 'aguardando'
            ? `<button type="button" data-acao="confirmar">✅ Respondeu</button>
               <a class="is-whats" data-acao="reenviar" href="${linkWhats(c)}" target="_blank" rel="noopener">Cobrar de novo</a>`
            : `<button type="button" data-acao="editar">Editar valor</button>
               <button type="button" data-acao="reabrir">Voltar p/ aguardando</button>`}
          <button type="button" class="is-del" data-acao="excluir" aria-label="Excluir">🗑️</button>
        </div>
      </div>`).join('');
  }
  $('#busca').addEventListener('input', renderLista);
  $$('.filtros button').forEach((b) => b.addEventListener('click', () => {
    filtro = b.dataset.filtro;
    $$('.filtros button').forEach((x) => x.classList.toggle('is-on', x === b));
    renderLista();
  }));
  $('#lista').addEventListener('click', (e) => {
    const alvo = e.target.closest('[data-acao]'); if (!alvo) return;
    const c = state.contatos.find((x) => x.id === alvo.closest('.item').dataset.id); if (!c) return;
    const acao = alvo.dataset.acao;
    if (acao === 'confirmar' || acao === 'editar') abrirValor(c);
    else if (acao === 'reenviar') { c.enviadoEm = Date.now(); c.envios = (c.envios || 0) + 1; salvar(); agendarLembrete(c); setTimeout(renderLista, 300); }
    else if (acao === 'reabrir') { c.status = 'aguardando'; c.enviadoEm = Date.now(); salvar(); agendarLembrete(c); agendarResumo(); renderLista(); }
    else if (acao === 'excluir' && confirm(`Excluir ${c.cliente} da lista?`)) {
      cancelarLembrete(c);
      state.contatos = state.contatos.filter((x) => x !== c); salvar(); agendarResumo(); renderLista();
    }
  });

  let editando = null;
  function abrirValor(c) {
    editando = c;
    $('#dlgValorQuem').textContent = `${c.cliente} · vendedor ${c.vendedor} · ${dataBR(c.data)}`;
    $('#dValor').value = c.valor != null ? c.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '';
    $('#dObs').value = c.obs || '';
    $('#dlgValor').showModal();
    setTimeout(() => $('#dValor').focus(), 50);
  }
  $('#dlgValor').addEventListener('close', () => {
    const c = editando; editando = null;
    if (!c || $('#dlgValor').returnValue !== 'ok') return;
    c.valor = lerValor($('#dValor').value);
    c.obs = $('#dObs').value.trim();
    if (c.status !== 'confirmada') { c.status = 'confirmada'; c.confirmadoEm = Date.now(); }
    salvar(); cancelarLembrete(c); agendarResumo(); renderLista();
    toast('Nota confirmada ✅');
  });

  /* ---------------- Notificações ---------------- */
  const RESUMO_ID = 900001;
  // Id numérico estável para a notificação de cada contato.
  const idNotif = (c) => { let h = 7; for (const ch of c.id) h = (h * 31 + ch.charCodeAt(0)) % 800000; return h + 1; };

  if (NATIVE && LN) {
    LN.createChannel({ id: 'lembretes', name: 'Lembretes de resposta', description: 'Avisa quando a cliente ainda não confirmou a nota', importance: 4, visibility: 1, vibration: true }).catch(() => {});
    LN.addListener('localNotificationActionPerformed', () => abrirAba('lista'));
  }
  async function pedirPermissao() {
    if (NATIVE && LN) {
      try { let p = await LN.checkPermissions(); if (p.display !== 'granted') p = await LN.requestPermissions(); return p.display === 'granted'; } catch { return false; }
    }
    if (!('Notification' in window)) { toast('Este navegador não mostra notificações.'); return false; }
    if (Notification.permission === 'granted') return true;
    return (await Notification.requestPermission()) === 'granted';
  }
  async function temPermissao() {
    if (NATIVE && LN) { try { return (await LN.checkPermissions()).display === 'granted'; } catch { return false; } }
    return 'Notification' in window && Notification.permission === 'granted';
  }
  async function atualizarSino() { $('#btnSino').classList.toggle('is-on', await temPermissao()); }

  function agendarLembrete(c) {
    if (!NATIVE || !LN) return;
    const id = idNotif(c);
    const horas = Number(state.ajustes.lembreteHoras) || 0;
    LN.cancel({ notifications: [{ id }] }).catch(() => {}).finally(() => {
      if (!horas || c.status !== 'aguardando') return;
      const at = new Date((c.enviadoEm || Date.now()) + horas * 3600e3);
      if (at <= new Date()) return;
      LN.schedule({ notifications: [{
        id, title: `${c.cliente} ainda não respondeu`,
        body: `Nota com ${c.vendedor} de ${dataBR(c.data)}. Toque para cobrar de novo.`,
        schedule: { at, allowWhileIdle: true }, channelId: 'lembretes', smallIcon: 'ic_stat_confirma', iconColor: '#22c55e', autoCancel: true,
      }] }).catch(() => {});
    });
  }
  function cancelarLembrete(c) { if (NATIVE && LN) LN.cancel({ notifications: [{ id: idNotif(c) }] }).catch(() => {}); }
  function agendarResumo() {
    if (!NATIVE || !LN) return;
    LN.cancel({ notifications: [{ id: RESUMO_ID }] }).catch(() => {}).finally(() => {
      const [h, m] = String(state.ajustes.resumo || '').split(':').map(Number);
      const pend = state.contatos.filter((c) => c.status === 'aguardando').length;
      if (isNaN(h) || !pend) return;
      LN.schedule({ notifications: [{
        id: RESUMO_ID, title: `${pend} cliente${pend === 1 ? '' : 's'} sem confirmar a nota`,
        body: 'Abra o Confirma Nota para cobrar as respostas.',
        schedule: { on: { hour: h, minute: m || 0 }, allowWhileIdle: true }, channelId: 'lembretes', smallIcon: 'ic_stat_confirma', iconColor: '#22c55e', autoCancel: true,
      }] }).catch(() => {});
    });
  }
  function reagendarTudo() { state.contatos.forEach(agendarLembrete); agendarResumo(); }

  // No navegador não dá para agendar: ao abrir o app, avisa das que já passaram do prazo.
  function avisosWeb() {
    if (NATIVE || !('Notification' in window) || Notification.permission !== 'granted') return;
    const horas = Number(state.ajustes.lembreteHoras) || 0; if (!horas) return;
    const atrasadas = state.contatos.filter((c) => c.status === 'aguardando' && Date.now() - c.enviadoEm >= horas * 3600e3 && state.ajustes.avisosWeb[c.id] !== c.enviadoEm);
    if (!atrasadas.length) return;
    atrasadas.forEach((c) => { state.ajustes.avisosWeb[c.id] = c.enviadoEm; });
    salvar();
    try { new Notification(`${atrasadas.length} cliente${atrasadas.length === 1 ? '' : 's'} sem responder`, { body: atrasadas.map((c) => c.cliente).join(', '), icon: 'icon.svg' }); } catch { /* sem notificação */ }
  }

  $('#btnSino').addEventListener('click', async () => {
    if (await pedirPermissao()) { toast('Notificações ativadas 🔔'); reagendarTudo(); }
    else toast('Notificações bloqueadas. Libere nas configurações do celular.');
    atualizarSino();
  });
  $('#btnTesteNotif').addEventListener('click', async () => {
    if (!(await pedirPermissao())) { toast('Ative as notificações primeiro.'); return; }
    if (NATIVE && LN) {
      LN.schedule({ notifications: [{ id: 900002, title: 'Confirma Nota', body: 'As notificações estão funcionando ✅', schedule: { at: new Date(Date.now() + 3000), allowWhileIdle: true }, channelId: 'lembretes', smallIcon: 'ic_stat_confirma', iconColor: '#22c55e' }] })
        .then(() => toast('A notificação chega em 3 segundos.')).catch(() => toast('Não deu para notificar.'));
    } else {
      try { new Notification('Confirma Nota', { body: 'As notificações estão funcionando ✅', icon: 'icon.svg' }); } catch { toast('Não deu para notificar.'); }
    }
    atualizarSino();
  });

  /* ---------------- Ajustes ---------------- */
  $('#aAtendente').value = state.ajustes.atendente;
  $('#aModelo').value = state.ajustes.modelo;
  $('#aLembrete').value = String(state.ajustes.lembreteHoras);
  $('#aResumo').value = state.ajustes.resumo;
  $('#aAtendente').addEventListener('input', (e) => { state.ajustes.atendente = e.target.value.trim(); salvar(); atualizarPrevia(); });
  $('#aModelo').addEventListener('input', (e) => { state.ajustes.modelo = e.target.value; salvar(); atualizarPrevia(); });
  $('#btnModeloPadrao').addEventListener('click', () => { state.ajustes.modelo = MODELO_PADRAO; $('#aModelo').value = MODELO_PADRAO; salvar(); atualizarPrevia(); toast('Modelo original de volta.'); });
  $('#aLembrete').addEventListener('change', (e) => { state.ajustes.lembreteHoras = Number(e.target.value); salvar(); reagendarTudo(); });
  $('#aResumo').addEventListener('change', (e) => { state.ajustes.resumo = e.target.value; salvar(); agendarResumo(); });

  $('#btnExportar').addEventListener('click', async () => {
    const json = JSON.stringify({ app: 'confirma', versao: 1, contatos: state.contatos, ajustes: { ...state.ajustes, avisosWeb: undefined } }, null, 2);
    const nome = `confirma-nota-${hojeISO()}.json`;
    if (SHARE) {
      // No APK o arquivo vai pelo "Compartilhar" (Drive, WhatsApp, e-mail…).
      try { await SHARE.share({ title: nome, text: json, dialogTitle: 'Salvar backup' }); } catch { /* cancelado */ }
      return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    a.download = nome; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  });
  $('#fImportar').addEventListener('change', async (e) => {
    const f = e.target.files[0]; e.target.value = '';
    if (!f) return;
    try {
      const d = JSON.parse(await f.text());
      if (!Array.isArray(d.contatos)) throw new Error('formato');
      const ids = new Set(state.contatos.map((c) => c.id));
      const novos = d.contatos.filter((c) => c && c.id && !ids.has(c.id));
      state.contatos = [...novos, ...state.contatos].sort((a, b) => (b.enviadoEm || 0) - (a.enviadoEm || 0));
      if (d.ajustes && Array.isArray(d.ajustes.vendedores)) d.ajustes.vendedores.forEach((v) => { if (v && !state.ajustes.vendedores.includes(v)) state.ajustes.vendedores.push(v); });
      state.ajustes.vendedores.sort((x, y) => x.localeCompare(y, 'pt-BR'));
      salvar(); reagendarTudo(); renderLista(); renderVendedores();
      toast(`${novos.length} contato${novos.length === 1 ? '' : 's'} importado${novos.length === 1 ? '' : 's'}.`);
    } catch { toast('Arquivo inválido.'); }
  });

  /* ---------------- Abas ---------------- */
  function abrirAba(nome) {
    $$('.abas button').forEach((b) => b.classList.toggle('is-on', b.dataset.aba === nome));
    $$('.aba').forEach((s) => { s.hidden = s.id !== `aba-${nome}`; });
    if (nome === 'lista') renderLista();
  }
  $$('.abas button').forEach((b) => b.addEventListener('click', () => abrirAba(b.dataset.aba)));

  if (NATIVE) {
    const App = plugin('App');
    if (App) App.addListener('backButton', () => {
      if ($('#dlgValor').open) { $('#dlgValor').close(); return; }
      if (!$('#aba-nova').hidden) App.minimizeApp(); else abrirAba('nova');
    });
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { renderLista(); avisosWeb(); atualizarSino(); } });
  if (!NATIVE && 'serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});

  /* ---------------- Início ---------------- */
  const r = state.rascunho;
  $('#fCliente').value = r.cliente || '';
  renderVendedores();
  $('#fData').value = r.data || hojeISO();
  $('#fFone').value = r.fone || '';
  atualizarPrevia();
  renderLista();
  atualizarSino();
  avisosWeb();
  reagendarTudo();
})();
