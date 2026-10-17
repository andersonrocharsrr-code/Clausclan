/* Confirma Nota — monta as mensagens de confirmação de compra e de cobrança (cliente, vendedor, data/valor),
   guarda quem já recebeu e lembra de cobrar a resposta. Funciona no navegador (PWA) e no APK (Capacitor). */
(() => {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const CHAVE = 'confirma.v1';

  const MODELO_CONFIRMACAO = `{saudacao},
{cliente}

Aqui é {atendente}, O motivo do meu contato é SOMENTE para confirmar a sua nota com vendedor {vendedor} no dia {data} *Você poderia nos confirmar  O VALOR DA SUA COMPRA ou me encaminhar uma FOTO da nota, por gentileza*?

*⚠️SUA RESPOSTA É MUITO IMPORTANTE⚠️*`;

  const MODELO_COBRANCA = `{saudacao}, {cliente}

Me chamo {atendente}, Trabalho na empresa {empresa} com o vendedor de enxoval {vendedor} (cama mesa e banho). Verifiquei no sistema uma nota em aberto em seu nome no valor de {valor} tal qual venceu no dia {vencimento}. Necessito de um retorno referente ao pagamento, visto que a nota está em atraso, *seus dados serão encaminhados para o setor jurídico da empresa. Aguardo retorno!*`;

  // Os dois tipos de mensagem: cada um tem sua aba, seu modelo e seus nomes na lista de Contatos.
  const TIPOS = {
    confirmacao: {
      aba: 'nova', chaveModelo: 'modelo', padrao: MODELO_CONFIRMACAO, nome: 'Confirmação',
      pendente: 'Aguardando', resolvida: 'Confirmada', botaoOk: '✅ Respondeu', toastOk: 'Nota confirmada ✅',
      dlgTitulo: 'Confirmar nota', dlgRotulo: 'Valor da compra',
      faltam: [['data', 'Falta a data da nota.']],
    },
    cobranca: {
      aba: 'cobranca', chaveModelo: 'modeloCobranca', padrao: MODELO_COBRANCA, nome: 'Cobrança',
      pendente: 'Em aberto', resolvida: 'Paga', botaoOk: '💵 Pagou', toastOk: 'Pagamento registrado ✅',
      dlgTitulo: 'Registrar pagamento', dlgRotulo: 'Valor pago',
      faltam: [['valor', 'Falta o valor da nota.'], ['vencimento', 'Falta a data do vencimento.']],
    },
  };
  const tipoDe = (c) => (c.tipo === 'cobranca' ? 'cobranca' : 'confirmacao');

  /* ---------------- Dados ---------------- */
  const state = carregar();
  function carregar() {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(CHAVE)); } catch { s = null; }
    s = s && typeof s === 'object' ? s : {};
    s.contatos = Array.isArray(s.contatos) ? s.contatos : [];
    s.ajustes = Object.assign({ atendente: 'Mary', empresa: 'FC ENXOVAIS', modelo: MODELO_CONFIRMACAO, modeloCobranca: MODELO_COBRANCA, lembreteHoras: 4, resumo: '17:00', resumos: null, avisosWeb: {}, vendedores: [], notificacoes: true }, s.ajustes || {});
    if (!Array.isArray(s.ajustes.vendedores)) s.ajustes.vendedores = [];
    // Horários do resumo diário (antes era um só, em "resumo").
    if (!Array.isArray(s.ajustes.resumos)) s.ajustes.resumos = s.ajustes.resumo ? [s.ajustes.resumo] : [];
    // Primeira vez: aproveita os vendedores que já foram usados nas mensagens.
    if (!s.ajustes.vendedores.length) s.ajustes.vendedores = [...new Set(s.contatos.map((c) => c.vendedor).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    // Rascunho de cada aba (a versão anterior só tinha o da confirmação).
    if (!s.rascunhos) s.rascunhos = { confirmacao: s.rascunho || {}, cobranca: {} };
    delete s.rascunho;
    return s;
  }
  function salvar() { try { localStorage.setItem(CHAVE, JSON.stringify(state)); } catch { toast('Não deu para salvar neste aparelho.'); } }

  /* ---------------- Utilidades ---------------- */
  const esc = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const hojeISO = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
  const dataBR = (iso, sep = '.') => (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso.split('-').reverse().join(sep) : '');
  const dinheiro = (n) => (n == null || isNaN(n) ? '' : n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
  const numeroBR = (n) => (n == null || isNaN(n) ? '' : n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  // "16/10/2026 22:33" (sem vírgula entre a data e a hora).
  const quando = (ts) => { const d = new Date(ts); const z = (n) => String(n).padStart(2, '0'); return `${z(d.getDate())}/${z(d.getMonth() + 1)}/${d.getFullYear()} ${z(d.getHours())}:${z(d.getMinutes())}`; };
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
    const valor = typeof c.valor === 'number' ? numeroBR(c.valor) : numeroBR(lerValor(c.valor));
    return (state.ajustes[TIPOS[tipoDe(c)].chaveModelo] || '')
      .replace(/\{saudacao\}/g, saudacao())
      .replace(/\{cliente\}/g, marca(c.cliente, 'nome da cliente'))
      .replace(/\{atendente\}/g, state.ajustes.atendente || 'Mary')
      .replace(/\{empresa\}/g, state.ajustes.empresa || 'FC ENXOVAIS')
      .replace(/\{vendedor\}/g, marca(c.vendedor, 'vendedor'))
      .replace(/\{data\}/g, marca(dataBR(c.data), 'data'))
      .replace(/\{valor\}/g, marca(valor, 'valor'))
      .replace(/\{vencimento\}/g, marca(dataBR(c.vencimento, '/'), 'vencimento'));
  }
  // Prévia parecida com o WhatsApp: *negrito* e campos que faltam em destaque.
  function previaHTML(c) {
    return esc(montar(c, true))
      .replace(/\u0000(.*?)\u0001/g, '<span class="vazio">($1)</span>')
      .replace(/\*([^*\n]+)\*/g, '<b>$1</b>');
  }
  const secao = (tipo) => $(`section[data-tipo="${tipo}"]`);
  const campo = (tipo, nome) => $(`[data-campo="${nome}"]`, secao(tipo));
  function lerForm(tipo) {
    const c = { tipo };
    $$('[data-campo]', secao(tipo)).forEach((el) => { c[el.dataset.campo] = el.value.trim(); });
    return c;
  }
  // Data escrita por cima do campo de data (o texto do próprio Android fica invisível e não marca em azul).
  function mostrarDatas() {
    $$('.data-caixa').forEach((cx) => {
      const v = $('input', cx).value;
      const t = $('.data-texto', cx);
      t.textContent = v ? dataBR(v, '/') : 'dd/mm/aaaa';
      t.classList.toggle('is-vazio', !v);
    });
  }
  function atualizarPrevia(tipo) {
    if (!tipo) { Object.keys(TIPOS).forEach(atualizarPrevia); return; }
    mostrarDatas();
    const c = lerForm(tipo);
    $('.previa', secao(tipo)).innerHTML = previaHTML(c);
    state.rascunhos[tipo] = c; salvar();
  }
  function validar(c) {
    const foco = (n) => campo(c.tipo, n).focus();
    if (!c.cliente) { toast('Falta o nome da cliente.'); foco('cliente'); return false; }
    if (!c.vendedor) { toast(state.ajustes.vendedores.length ? 'Escolha o vendedor.' : 'Cadastre os vendedores em Ajustes.'); foco('vendedor'); return false; }
    for (const [n, msg] of TIPOS[c.tipo].faltam) if (!(n === 'valor' ? lerValor(c.valor) : c[n])) { toast(msg); foco(n); return false; }
    return true;
  }
  function linkWhats(c) { return `https://wa.me/${numeroWhats(c.fone)}?text=${encodeURIComponent(montar(c))}`; }

  // Guarda a cliente na lista (ou atualiza, se já estava pendente com a mesma nota).
  function registrar(f) {
    const c = { ...f, valor: f.tipo === 'cobranca' ? lerValor(f.valor) : null };
    const mesma = (x) => tipoDe(x) === c.tipo && x.status === 'aguardando' && x.cliente.toLowerCase() === c.cliente.toLowerCase() && x.vendedor.toLowerCase() === c.vendedor.toLowerCase()
      && (c.tipo === 'cobranca' ? x.vencimento === c.vencimento && x.valor === c.valor : x.data === c.data);
    let r = state.contatos.find(mesma);
    if (!r) {
      r = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), tipo: c.tipo, status: 'aguardando', criadoEm: Date.now(), envios: 0 };
      state.contatos.unshift(r);
    }
    Object.assign(r, { cliente: c.cliente, vendedor: c.vendedor, fone: c.fone, enviadoEm: Date.now() });
    if (c.tipo === 'cobranca') Object.assign(r, { valor: c.valor, vencimento: c.vencimento });
    else r.data = c.data;
    r.envios = (r.envios || 0) + 1;
    r.mensagem = montar(c);
    salvar();
    agendarLembrete(r);
    agendarResumo();
    renderLista();
    return r;
  }
  function limparForm(tipo) {
    // Vendedor e datas costumam se repetir na sequência: ficam.
    ['cliente', 'fone', 'valor'].forEach((n) => { const el = campo(tipo, n); if (el) el.value = ''; });
    atualizarPrevia(tipo);
    campo(tipo, 'cliente').focus();
  }

  async function copiar(texto) {
    try { await navigator.clipboard.writeText(texto); return true; } catch {
      const t = document.createElement('textarea'); t.value = texto; document.body.appendChild(t); t.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch { ok = false; }
      t.remove(); return ok;
    }
  }

  async function enviar(tipo, como) {
    const c = lerForm(tipo); if (!validar(c)) return;
    const texto = montar(c);
    const aviso = `${c.cliente} ficou como “${TIPOS[tipo].pendente}”.`;
    if (como === 'whats') {
      registrar(c);
      window.open(linkWhats(c), '_blank');
      toast(aviso); limparForm(tipo);
    } else if (como === 'copiar') {
      if (await copiar(texto)) { registrar(c); toast('Mensagem copiada. Cole no WhatsApp.'); limparForm(tipo); }
      else toast('Não deu para copiar.');
    } else {
      try {
        if (SHARE) await SHARE.share({ text: texto, dialogTitle: 'Enviar mensagem' });
        else if (navigator.share) await navigator.share({ text: texto });
        else { await copiar(texto); toast('Mensagem copiada.'); }
        registrar(c); limparForm(tipo);
      } catch (err) { if (!/cancel|abort/i.test(String(err && (err.message || err.name)))) toast('Não deu para compartilhar.'); }
    }
  }

  Object.keys(TIPOS).forEach((tipo) => {
    const sec = secao(tipo);
    $('form', sec).addEventListener('input', () => atualizarPrevia(tipo));
    $('form', sec).addEventListener('submit', (e) => e.preventDefault());
    campo(tipo, 'cliente').addEventListener('blur', (e) => { e.target.value = nomeBonito(e.target.value); atualizarPrevia(tipo); });
    const valor = campo(tipo, 'valor');
    campo(tipo, 'vendedor').addEventListener('change', (e) => {
      if (e.target.value === NOVO) {
        const nome = nomeBonito(prompt('Nome do novo vendedor:') || '');
        if (nome) addVendedor(nome);
        e.target.value = nome && state.ajustes.vendedores.includes(nome) ? nome : '';
      }
      e.target.classList.toggle('is-vazio', !e.target.value);
      mostrarVendedor(tipo);
      atualizarPrevia(tipo);
    });
    $('.vend-btn', sec).addEventListener('click', () => abrirVendedores(tipo));
    $('[data-limpar]', sec).addEventListener('click', () => limparForm(tipo));
    $$('[data-enviar]', sec).forEach((b) => b.addEventListener('click', () => enviar(tipo, b.dataset.enviar)));
  });

  /* ---------------- Voz ---------------- */
  const Cap = window.Capacitor;
  const NATIVE = !!(Cap && Cap.isNativePlatform && Cap.isNativePlatform());
  const plugin = (n) => (NATIVE ? (Cap.Plugins && Cap.Plugins[n]) || (Cap.registerPlugin && Cap.registerPlugin(n)) || null : null);
  const LN = plugin('LocalNotifications');
  const SHARE = plugin('Share');
  const SR_NATIVO = plugin('SpeechRecognition');
  const SR_WEB = window.SpeechRecognition || window.webkitSpeechRecognition || null;

  // Fundo da janela do Android = cor da tela (é o que aparece no espaço do teclado antes de ele surgir).
  // Durante a abertura fica o verde-escuro dela; depois troca, e acompanha o tema claro/escuro.
  const TELA = plugin('Tela');
  function fundoJanela() {
    if (!TELA || document.documentElement.classList.contains('com-intro')) return;
    const cor = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
    if (/^#[0-9a-f]{6}$/i.test(cor)) TELA.fundo({ cor }).catch(() => {});
  }
  if (TELA) {
    new MutationObserver(fundoJanela).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    if (window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener('change', fundoJanela);
    fundoJanela();
  }

  let ouvindo = null; // { botao, parar() }
  function fimOuvir() {
    if (!ouvindo) return;
    ouvindo.botao.classList.remove('is-ouvindo');
    $$('.ouvindo').forEach((el) => { el.hidden = true; });
    ouvindo = null;
  }
  // Telefone falado: "sessenta e oito, nove nove dois um..." ou "68 99212 6985" → "(68) 99212-6985".
  const UNID = { zero: 0, um: 1, uma: 1, dois: 2, duas: 2, tres: 3, quatro: 4, cinco: 5, seis: 6, meia: 6, sete: 7, oito: 8, nove: 9 };
  const DEZ_A_DEZENOVE = { dez: 10, onze: 11, doze: 12, treze: 13, catorze: 14, quatorze: 14, quinze: 15, dezesseis: 16, dezasseis: 16, dezessete: 17, dezoito: 18, dezenove: 19 };
  const DEZENAS = { vinte: 20, trinta: 30, quarenta: 40, cinquenta: 50, sessenta: 60, setenta: 70, oitenta: 80, noventa: 90 };
  // Algarismo falado por extenso, no singular ou no plural ("nove"/"noves", "zero"/"zeros", "uns").
  function digitoPalavra(w) {
    if (!w || /^\d$/.test(w)) return null;
    if (w in UNID) return { d: UNID[w], plural: false };
    if (w === 'uns') return { d: 1, plural: true };
    if (w.endsWith('s') && w.slice(0, -1) in UNID) return { d: UNID[w.slice(0, -1)], plural: true };
    return null;
  }
  const QUANTAS = { dois: 2, duas: 2, tres: 3, quatro: 4, cinco: 5, '2': 2, '3': 3, '4': 4, '5': 5 };
  const DUPLO = { duplo: 2, dupla: 2, triplo: 3, tripla: 3 };
  // Só os 9 do começo do número (logo no início ou depois do DDD): "quatro nove" = 9999,
  // "três noves" = 999, "três vezes nove", "triplo nove". Em outros pontos, "quatro nove" é 4 e 9.
  function repeticao(p, i) {
    const w = p[i];
    const nove = (t) => { const d = digitoPalavra(t); return !!d && d.d === 9; };
    if (w in DUPLO) return nove(p[i + 1]) ? { digito: 9, vezes: DUPLO[w], fim: i + 1 } : null;
    if (!(w in QUANTAS)) return null;
    if (p[i + 1] === 'vezes') return (nove(p[i + 2]) || p[i + 2] === '9') ? { digito: 9, vezes: QUANTAS[w], fim: i + 2 } : null;
    if (nove(p[i + 1])) return { digito: 9, vezes: QUANTAS[w], fim: i + 1 };
    // O reconhecimento costuma escrever "três nove" como "3 9" (ou "39"): também vale como 999 no começo.
    if (/^\d$/.test(w) && p[i + 1] === '9') return { digito: 9, vezes: QUANTAS[w], fim: i + 1, algarismos: true };
    return null;
  }
  function digitosFalados(texto) {
    const p = String(texto || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/(\d)/g, ' $1 ').split(/[^a-z0-9]+/).filter(Boolean);
    let out = '';
    for (let i = 0; i < p.length; i++) {
      const w = p[i];
      // Repetição dos 9 do começo: "quatro nove" = 9999 (só no início ou logo depois do DDD).
      let rep = out.length <= 2 ? repeticao(p, i) : null;
      // "4 9" logo no início pode ser o DDD 49: só repete se depois não vier um celular inteiro (9 dígitos).
      if (rep && rep.algarismos && out.length === 1) rep = null;
      if (rep && rep.algarismos && out.length === 0 && p.slice(rep.fim + 1).filter((t) => /^\d$/.test(t)).length >= 9) rep = null;
      if (rep) { out += String(rep.digito).repeat(rep.vezes); i = rep.fim; continue; }
      if (/^\d$/.test(w)) out += w;
      else if (w in UNID) out += UNID[w];
      else if (digitoPalavra(w)) out += digitoPalavra(w).d; // plural solto ("oitos") vale um algarismo
      else if (w in DEZ_A_DEZENOVE) out += DEZ_A_DEZENOVE[w];
      else if (w in DEZENAS) {
        // "sessenta e oito" = 68; "sessenta" sozinho = 60.
        if (p[i + 1] === 'e' && p[i + 2] in UNID) { out += DEZENAS[w] + UNID[p[i + 2]]; i += 2; }
        else if (p[i + 1] in UNID) { out += DEZENAS[w] + UNID[p[i + 1]]; i += 1; }
        else out += DEZENAS[w];
      }
    }
    return out;
  }
  function foneBonito(d) {
    d = soDigitos(d);
    if (d.length > 11 && d.startsWith('55')) d = d.slice(2);
    if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    if (d.length === 9) return `${d.slice(0, 5)}-${d.slice(5)}`;
    if (d.length === 8) return `${d.slice(0, 4)}-${d.slice(4)}`;
    return d;
  }
  function preencher(id, texto) {
    const el = document.getElementById(id);
    el.value = el.dataset.campo === 'fone' ? foneBonito(digitosFalados(texto)) : nomeBonito(texto);
    const aviso = $('.ouvindo', el.closest('form'));
    if (ouvindo && aviso) aviso.innerHTML = `🎙️ Ouvindo… <q>${esc(texto)}</q>`;
    atualizarPrevia(el.closest('section').dataset.tipo);
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
      if (p.speechRecognition !== 'granted') { toast('Permita o microfone para usar a voz.'); fimOuvir(); return; }
      let parando = false;
      // Vai preenchendo enquanto a pessoa fala: cada pedaço reconhecido já aparece no campo
      // (o Android às vezes corrige uma palavra; mostra sempre a versão mais nova).
      subs.push(await SR_NATIVO.addListener('partialResults', (d) => {
        const t = d && d.matches && d.matches[0] && d.matches[0].trim();
        if (t) { melhor = t; preencher(campo, melhor); }
        if (parando) fimLogo(350);
      }));
      // O Android avisa que parou ANTES da frase final: espera um pouco por ela.
      subs.push(await SR_NATIVO.addListener('listeningState', (d) => { if (d && d.status === 'stopped') { parando = true; fimLogo(1500); } }));
      const r = await SR_NATIVO.start({ language: 'pt-BR', maxResults: 1, partialResults: true, popup: false, prompt: 'Fale agora' });
      if (r && r.matches && r.matches[0]) { melhor = r.matches[0]; terminar(); }
    } catch {
      toast('Não ouvi nada. Toque no microfone e fale de novo.');
      terminar();
    }
  }
  function ouvirWeb(campo, botao) {
    const rec = new SR_WEB();
    rec.lang = 'pt-BR'; rec.interimResults = true; rec.maxAlternatives = 1;
    rec.onresult = (e) => preencher(campo, [...e.results].map((r) => r[0].transcript).join(' '));
    rec.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') toast('Permita o microfone para usar a voz.');
      else if (e.error === 'no-speech') toast('Não ouvi nada. Toque no microfone e fale de novo.');
    };
    rec.onend = fimOuvir;
    ouvindo = { botao, parar: () => rec.stop() };
    try { rec.start(); } catch { fimOuvir(); }
  }
  $$('.mic').forEach((botao) => botao.addEventListener('click', () => {
    if (ouvindo) { const mesmo = ouvindo.botao === botao; ouvindo.parar(); if (mesmo) return; }
    if (!SR_NATIVO && !SR_WEB) { toast('Este navegador não tem ditado por voz. Use o teclado ou o app Android.'); return; }
    botao.classList.add('is-ouvindo');
    const aviso = $('.ouvindo', botao.closest('form'));
    aviso.textContent = '🎙️ Ouvindo… pode falar'; aviso.hidden = false;
    const id = botao.dataset.mic;
    if (SR_NATIVO) ouvirNativo(id, botao); else ouvirWeb(id, botao);
  }));

  /* ---------------- Vendedores ---------------- */
  const NOVO = '__novo';
  // Campo "Nome do vendedor": ao tocar, mostra todos os vendedores cadastrados para escolher.
  // Botão do campo Vendedor mostra o escolhido; a lista abre numa folha de baixo para cima.
  function mostrarVendedor(tipo) {
    const sel = campo(tipo, 'vendedor'); const b = $('.vend-btn', secao(tipo));
    if (!b) return;
    b.textContent = sel.value || (state.ajustes.vendedores.length ? 'Toque para escolher' : 'Nenhum vendedor cadastrado');
    b.classList.toggle('is-vazio', !sel.value);
  }
  let vendTipo = null;
  const IC_OK = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7"/></svg>';
  function listarVendedores() {
    const atual = campo(vendTipo, 'vendedor').value;
    const lista = state.ajustes.vendedores;
    $('#vendOps').innerHTML = lista.length
      ? lista.map((v) => `<button type="button" class="vend-op${v === atual ? ' is-on' : ''}" data-v="${esc(v)}">${avatar(v)}<span>${esc(v)}</span>${v === atual ? IC_OK : ''}</button>`).join('')
      : '<p class="vazia">Nenhum vendedor ainda. Cadastre em Ajustes.</p>';
  }
  function abrirVendedores(tipo) {
    vendTipo = tipo;
    listarVendedores();
    $('#dlgVend').showModal();
    if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
  }
  function escolherVendedor(v) {
    const sel = campo(vendTipo, 'vendedor');
    sel.value = v;
    sel.dispatchEvent(new Event('change', { bubbles: true }));
    $('#dlgVend').close();
  }
  $('#vendOps').addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) escolherVendedor(b.dataset.v); });
  $('#dlgVend .fb__fechar').addEventListener('click', () => $('#dlgVend').close());
  // Tocar fora da folha fecha.
  $('#dlgVend').addEventListener('click', (e) => { if (e.target === $('#dlgVend')) $('#dlgVend').close(); });

  function renderVendedores() {
    const lista = state.ajustes.vendedores;
    Object.keys(TIPOS).forEach((tipo) => {
      const sel = campo(tipo, 'vendedor');
      const atual = sel.value && sel.value !== NOVO ? sel.value : (state.rascunhos[tipo].vendedor || '');
      sel.innerHTML = `<option value="">${lista.length ? 'Toque para escolher o vendedor' : 'Nenhum vendedor cadastrado'}</option>`
        + lista.map((v) => `<option value="${esc(v)}">${esc(v)}</option>`).join('');
      sel.value = lista.includes(atual) ? atual : '';
      sel.classList.toggle('is-vazio', !sel.value);
      mostrarVendedor(tipo);
    });
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
  const filtro = { tipo: 'todos', status: 'aguardando' };

  /* Busca que perdoa erro de digitação: sem acento/maiúscula e, se não achar igual,
     aceita 1 letra trocada, faltando ou sobrando (2 em palavras de 7+ letras). */
  const semAcento = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  function distancia(a, b) {
    if (Math.abs(a.length - b.length) > 2) return 3;
    let ant = Array.from({ length: b.length + 1 }, (_, j) => j);
    for (let i = 1; i <= a.length; i++) {
      const cur = [i];
      for (let j = 1; j <= b.length; j++) cur[j] = Math.min(ant[j] + 1, cur[j - 1] + 1, ant[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      ant = cur;
    }
    return ant[b.length];
  }
  function parecido(q, palavra) {
    if (palavra.includes(q)) return true;
    const tol = q.length >= 7 ? 2 : q.length >= 4 ? 1 : 0;
    if (!tol) return false;
    // Compara com a palavra inteira e com o começo dela (a pessoa pode estar no meio da digitação).
    return [palavra, palavra.slice(0, q.length), palavra.slice(0, q.length + 1)].some((p) => distancia(q, p) <= tol);
  }
  function casaBusca(c, busca, aproximada) {
    const texto = semAcento(`${c.cliente} ${c.vendedor} ${c.fone || ''}`);
    const q = semAcento(busca);
    if (texto.includes(q)) return true;
    const dig = busca.replace(/\D/g, '');
    if (dig.length >= 4 && String(c.fone || '').replace(/\D/g, '').includes(dig)) return true;
    if (!aproximada) return false;
    const palavras = texto.split(/\s+/).filter(Boolean);
    return q.split(/\s+/).filter(Boolean).every((w) => palavras.some((p) => parecido(w, p)));
  }

  function renderLista() {
    const busca = $('#busca').value.trim();
    const noFiltro = (c) => (filtro.tipo === 'todos' || tipoDe(c) === filtro.tipo) && (filtro.status === 'todas' || c.status === filtro.status);
    let itens = state.contatos.filter((c) => noFiltro(c) && (!busca || casaBusca(c, busca, false)));
    // Nada igual ao que foi digitado: mostra os parecidos como sugestão.
    let sugestao = false;
    if (busca && !itens.length) {
      itens = state.contatos.filter((c) => noFiltro(c) && casaBusca(c, busca, true));
      sugestao = itens.length > 0;
    }
    const pendConf = state.contatos.filter((c) => c.status === 'aguardando' && tipoDe(c) === 'confirmacao').length;
    const pendCob = state.contatos.filter((c) => c.status === 'aguardando' && tipoDe(c) === 'cobranca');
    const emAberto = pendCob.reduce((s, c) => s + (c.valor || 0), 0);
    $('#resumo').textContent = `${pendConf} p/ confirmar · ${pendCob.length} cobrança${pendCob.length === 1 ? '' : 's'} em aberto${emAberto ? ` (${dinheiro(emAberto)})` : ''}`;
    // Quadros do topo de Contatos (Aguardando · Em aberto · Resolvidas).
    $('#stPend').textContent = pendConf + pendCob.length;
    $('#stAberto').textContent = emAberto >= 10000 ? `R$ ${Math.round(emAberto / 1000)} mil` : `R$ ${Math.round(emAberto).toLocaleString('pt-BR')}`;
    $('#stOk').textContent = state.contatos.filter((c) => c.status !== 'aguardando').length;
    const pend = pendConf + pendCob.length;
    $('#contaPend').hidden = !pend; $('#contaPend').textContent = pend;

    if (!itens.length) {
      $('#lista').innerHTML = `<p class="vazia">${busca ? `Ninguém encontrado com “${esc(busca)}”.` : filtro.status === 'aguardando' ? 'Nada pendente por aqui. 🎉' : 'Nada por aqui ainda.'}</p>`;
      return;
    }
    // Cada tipo vira um bloco; com mais de 3, os outros ficam recolhidos ("Ver todas… (N)"), como no Caixa.
    const grupos = Object.keys(TIPOS).map((tipo) => [tipo, itens.filter((c) => tipoDe(c) === tipo)]).filter(([, l]) => l.length);
    const aviso = sugestao ? `<p class="sugestao">Não achei “${esc(busca)}”. Talvez seja:</p>` : '';
    $('#lista').innerHTML = aviso + grupos.map(([tipo, lista]) => {
      const aberto = abertos[tipo] || !!busca;
      const nome = GRUPO[tipo];
      const ver = lista.length > LIMITE && !busca
        ? `<button type="button" class="ver" data-ver="${tipo}">${aberto ? `▴ Esconder ${nome.toLowerCase()} (${lista.length})` : `▾ Ver todas as ${nome.toLowerCase()} (${lista.length})`}</button>`
        : '';
      return `
      <div class="grupo">
        <div class="grupo__cab"><h2>${nome}</h2><span class="grupo__n">${lista.length}</span></div>
        ${cartoes(aberto ? lista : lista.slice(0, LIMITE))}
        ${ver}
      </div>`;
    }).join('');
  }
  const LIMITE = 3;
  const GRUPO = { confirmacao: 'Confirmações', cobranca: 'Cobranças' };
  const abertos = { confirmacao: false, cobranca: false };
  // Bolinha com as iniciais, cor fixa por nome.
  const CORES_AV = ['#f97316', '#8b5cf6', '#0ea5e9', '#16a34a', '#e11d48', '#0d9488', '#ca8a04', '#6366f1'];
  function avatar(nome) {
    const p = String(nome || '?').trim().split(/\s+/).filter((w) => w.length > 2 || /^[A-ZÀ-Ú]/.test(w));
    const ini = ((p[0] || '?')[0] + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase();
    let h = 0; for (const ch of String(nome)) h = (h * 31 + ch.charCodeAt(0)) % 997;
    return `<span class="av" style="background:${CORES_AV[h % CORES_AV.length]}">${esc(ini)}</span>`;
  }
  const IC_CHECK = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7"/></svg>';
  const IC_CHAT = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l1.3-3.9A8 8 0 1 1 8 19.1L4 20z"/></svg>';
  const IC_LIXO = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 7h15M9.5 7V4.8h5V7M6.5 7l1 12.2h9L17.5 7M10.3 10.5v5.5M13.7 10.5v5.5"/></svg>';
  function cartoes(itens) {
    return itens.map((c) => {
      const tipo = tipoDe(c); const T = TIPOS[tipo]; const cob = tipo === 'cobranca';
      const valorOk = cob ? c.valorPago : c.valor;
      const pend = c.status === 'aguardando';
      const selo = pend ? (cob ? dinheiro(c.valor) : T.pendente) : `${T.resolvida}${valorOk != null ? ` · ${dinheiro(valorOk)}` : ''}`;
      const info = cob ? `${esc(c.vendedor)} · venceu ${dataBR(c.vencimento, '/')}` : `${esc(c.vendedor)} · nota ${dataBR(c.data)}`;
      const quandoTxt = pend ? `Enviada ${quando(c.enviadoEm)}${c.envios > 1 ? ` (${c.envios}×)` : ''}` : `${T.resolvida} ${quando(c.confirmadoEm)}${c.obs ? ` · ${esc(c.obs)}` : ''}`;
      return `
      <div class="item" data-id="${c.id}">
        <div class="item__topo">
          ${avatar(c.cliente)}
          <span class="item__txt"><span class="item__nome">${esc(c.cliente)}</span><span class="item__info">${info}</span></span>
          <span class="selo selo--${pend ? (cob ? 'aberto' : 'aguardando') : 'confirmada'}">${selo}</span>
        </div>
        <div class="item__info item__quando">${quandoTxt}${c.fone ? ` · ${esc(c.fone)}` : ''}</div>
        <div class="item__acoes">
          ${pend
            ? `<button type="button" class="ac-ok" data-acao="confirmar">${IC_CHECK}${T.botaoOk.replace(/^\S+\s/, '')}</button>
               <a class="ac-whats" data-acao="reenviar" href="${linkWhats(c)}" target="_blank" rel="noopener">${IC_CHAT}Cobrar de novo</a>`
            : `${cob ? '<button type="button" class="ac-ok" data-acao="editar">Editar valor</button>' : ''}
               <button type="button" class="ac-ok" data-acao="reabrir">Voltar p/ ${T.pendente.toLowerCase()}</button>`}
          <button type="button" class="ac-del" data-acao="excluir" aria-label="Excluir">${IC_LIXO}</button>
        </div>
      </div>`;
    }).join('');
  }
  $('#busca').addEventListener('input', renderLista);
  $$('.filtros').forEach((g) => $$('button', g).forEach((b) => b.addEventListener('click', () => {
    filtro[g.dataset.grupo] = b.dataset.filtro;
    $$('button', g).forEach((x) => x.classList.toggle('is-on', x === b));
    renderLista();
  })));
  $('#lista').addEventListener('click', (e) => {
    // Toque no cartão (fora dos botões): abre o resumo do que foi enviado.
    if (!e.target.closest('[data-acao],[data-ver]') && e.target.closest('.item')) {
      const c = state.contatos.find((x) => x.id === e.target.closest('.item').dataset.id);
      if (c) abrirDetalhe(c);
      return;
    }
    const ver = e.target.closest('[data-ver]');
    if (ver) { abertos[ver.dataset.ver] = !abertos[ver.dataset.ver]; renderLista(); return; }
    const alvo = e.target.closest('[data-acao]'); if (!alvo) return;
    const c = state.contatos.find((x) => x.id === alvo.closest('.item').dataset.id); if (!c) return;
    const acao = alvo.dataset.acao;
    if (acao === 'confirmar' || acao === 'editar') abrirValor(c);
    else if (acao === 'reenviar') { c.enviadoEm = Date.now(); c.envios = (c.envios || 0) + 1; c.mensagem = montar(c); salvar(); agendarLembrete(c); setTimeout(renderLista, 300); }
    else if (acao === 'reabrir') { c.status = 'aguardando'; c.enviadoEm = Date.now(); salvar(); agendarLembrete(c); agendarResumo(); renderLista(); }
    else if (acao === 'excluir' && confirm(`Excluir ${c.cliente} da lista?`)) {
      cancelarLembrete(c);
      state.contatos = state.contatos.filter((x) => x !== c); salvar(); agendarResumo(); renderLista();
    }
  });

  let detalhe = null;
  function abrirDetalhe(c) {
    detalhe = c;
    const tipo = tipoDe(c); const T = TIPOS[tipo]; const cob = tipo === 'cobranca';
    $('#detTipo').textContent = T.nome; $('#detTipo').className = `tipo tipo--${tipo}`;
    const valorOk = cob ? c.valorPago : c.valor;
    $('#detSelo').textContent = c.status === 'aguardando' ? T.pendente : `${T.resolvida}${valorOk != null ? ` · ${dinheiro(valorOk)}` : ''}`;
    $('#detSelo').className = `selo selo--${c.status}`;
    $('#detNome').textContent = c.cliente;
    const linhas = [
      ['Vendedor', c.vendedor],
      cob ? ['Valor da nota', dinheiro(c.valor)] : ['Data da nota', dataBR(c.data)],
      cob && ['Venceu em', dataBR(c.vencimento, '/')],
      ['Telefone', c.fone || '—'],
      ['Enviada', `${quando(c.enviadoEm)}${c.envios > 1 ? ` · ${c.envios} envios` : ''}`],
      c.status !== 'aguardando' && [T.resolvida, quando(c.confirmadoEm)],
      c.status !== 'aguardando' && valorOk != null && [cob ? 'Valor pago' : 'Valor da compra', dinheiro(valorOk)],
      c.obs && ['Observação', c.obs],
    ].filter(Boolean);
    $('#detDados').innerHTML = linhas.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('');
    // Contatos antigos não guardaram o texto: remonta com o modelo atual.
    $('#detMsg').innerHTML = esc(c.mensagem || montar(c)).replace(/\*([^*\n]+)\*/g, '<b>$1</b>');
    $('#dlgDetalhe').showModal();
    // Sem contorno de foco no primeiro botão ao abrir pelo toque.
    if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
  }
  $('#detCopiar').addEventListener('click', async () => {
    if (detalhe && await copiar(detalhe.mensagem || montar(detalhe))) toast('Mensagem copiada.');
  });
  $('#dlgDetalhe').addEventListener('close', () => { detalhe = null; });

  let editando = null;
  function abrirValor(c) {
    editando = c;
    const T = TIPOS[tipoDe(c)]; const cob = tipoDe(c) === 'cobranca';
    $('#dlgValorTitulo').textContent = T.dlgTitulo;
    $('#dlgValorRotulo').textContent = T.dlgRotulo;
    $('#dlgValorQuem').textContent = cob
      ? `${c.cliente} · vendedor ${c.vendedor} · ${dinheiro(c.valor)} vencida em ${dataBR(c.vencimento, '/')}`
      : `${c.cliente} · vendedor ${c.vendedor} · ${dataBR(c.data)}`;
    const v = cob ? (c.valorPago != null ? c.valorPago : c.valor) : c.valor;
    $('#dValor').value = v != null ? numeroBR(v) : '';
    $('#dObs').value = c.obs || '';
    $('#dlgValor').showModal();
    setTimeout(() => $('#dValor').focus(), 50);
  }
  $('#dlgValor').addEventListener('close', () => {
    const c = editando; editando = null;
    if (!c || $('#dlgValor').returnValue !== 'ok') return;
    const v = lerValor($('#dValor').value);
    if (tipoDe(c) === 'cobranca') c.valorPago = v; else c.valor = v;
    c.obs = $('#dObs').value.trim();
    if (c.status !== 'confirmada') { c.status = 'confirmada'; c.confirmadoEm = Date.now(); }
    salvar(); cancelarLembrete(c); agendarResumo(); renderLista();
    toast(TIPOS[tipoDe(c)].toastOk);
  });

  /* ---------------- Notificações ---------------- */
  const RESUMO_ID = 900001;
  // Id numérico estável para a notificação de cada contato.
  const idNotif = (c) => { let h = 7; for (const ch of c.id) h = (h * 31 + ch.charCodeAt(0)) % 800000; return h + 1; };

  if (NATIVE && LN) {
    LN.createChannel({ id: 'lembretes', name: 'Lembretes de resposta', description: 'Avisa quando a cliente ainda não respondeu a confirmação ou a cobrança', importance: 4, visibility: 1, vibration: true }).catch(() => {});
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
  // Sino ligado = o usuário quer avisos E o celular permite.
  const avisosLigados = () => state.ajustes.notificacoes !== false;
  async function atualizarSino() {
    const on = avisosLigados() && await temPermissao();
    const b = $('#btnSino');
    b.classList.toggle('is-on', on);
    b.setAttribute('aria-pressed', String(on));
    b.setAttribute('aria-label', on ? 'Desativar notificações' : 'Ativar notificações');
    return on;
  }
  // Desligar: tira todos os avisos já agendados no celular.
  function cancelarTudo() {
    if (!NATIVE || !LN) return;
    LN.getPending().then((r) => {
      const ids = (r && r.notifications || []).map((n) => ({ id: n.id }));
      if (ids.length) return LN.cancel({ notifications: ids });
    }).catch(() => {});
  }

  function agendarLembrete(c) {
    if (!NATIVE || !LN || !avisosLigados()) return;
    const id = idNotif(c);
    const horas = Number(state.ajustes.lembreteHoras) || 0;
    LN.cancel({ notifications: [{ id }] }).catch(() => {}).finally(() => {
      if (!horas || c.status !== 'aguardando') return;
      const at = new Date((c.enviadoEm || Date.now()) + horas * 3600e3);
      if (at <= new Date()) return;
      LN.schedule({ notifications: [{
        id, title: `${c.cliente} ainda não respondeu`,
        body: tipoDe(c) === 'cobranca'
          ? `Cobrança de ${dinheiro(c.valor)} (vendedor ${c.vendedor}). Toque para cobrar de novo.`
          : `Nota com ${c.vendedor} de ${dataBR(c.data)}. Toque para cobrar de novo.`,
        schedule: { at, allowWhileIdle: true }, channelId: 'lembretes', smallIcon: 'ic_stat_confirma', iconColor: '#22c55e', autoCancel: true,
        // Lembrete não precisa ser no minuto exato: assim o Android 12+ nunca abre a tela "Alarmes e lembretes".
        isExactNotification: false,
      }] }).catch(() => {});
    });
  }
  function cancelarLembrete(c) { if (NATIVE && LN) LN.cancel({ notifications: [{ id: idNotif(c) }] }).catch(() => {}); }
  // Resumo diário: um aviso por horário escolhido (até 6), ids RESUMO_ID … RESUMO_ID+5.
  const MAX_HORARIOS = 6;
  function agendarResumo() {
    if (!NATIVE || !LN) return;
    const ids = Array.from({ length: MAX_HORARIOS }, (_, i) => ({ id: RESUMO_ID + 10 + i })).concat({ id: RESUMO_ID });
    LN.cancel({ notifications: ids }).catch(() => {}).finally(() => {
      if (!avisosLigados()) return;
      const pend = state.contatos.filter((c) => c.status === 'aguardando').length;
      if (!pend) return;
      const notifs = state.ajustes.resumos.slice(0, MAX_HORARIOS).map((hm, i) => {
        const [h, m] = String(hm).split(':').map(Number);
        if (isNaN(h)) return null;
        return {
          id: RESUMO_ID + 10 + i, title: `${pend} cliente${pend === 1 ? '' : 's'} sem responder`,
          body: 'Confirmações e cobranças pendentes. Abra o Confirma Nota para cobrar as respostas.',
          schedule: { on: { hour: h, minute: m || 0 }, allowWhileIdle: true }, channelId: 'lembretes', smallIcon: 'ic_stat_confirma', iconColor: '#22c55e', autoCancel: true,
          isExactNotification: false,
        };
      }).filter(Boolean);
      if (notifs.length) LN.schedule({ notifications: notifs }).catch(() => {});
    });
  }
  function reagendarTudo() { state.contatos.forEach(agendarLembrete); agendarResumo(); }

  // No navegador não dá para agendar: ao abrir o app, avisa das que já passaram do prazo.
  function avisosWeb() {
    if (NATIVE || !avisosLigados() || !('Notification' in window) || Notification.permission !== 'granted') return;
    const horas = Number(state.ajustes.lembreteHoras) || 0; if (!horas) return;
    const atrasadas = state.contatos.filter((c) => c.status === 'aguardando' && Date.now() - c.enviadoEm >= horas * 3600e3 && state.ajustes.avisosWeb[c.id] !== c.enviadoEm);
    if (!atrasadas.length) return;
    atrasadas.forEach((c) => { state.ajustes.avisosWeb[c.id] = c.enviadoEm; });
    salvar();
    try { new Notification(`${atrasadas.length} cliente${atrasadas.length === 1 ? '' : 's'} sem responder`, { body: atrasadas.map((c) => c.cliente).join(', '), icon: 'icon.svg' }); } catch { /* sem notificação */ }
  }

  $('#btnSino').addEventListener('click', async () => {
    const b = $('#btnSino');
    if (b.classList.contains('is-on')) {
      state.ajustes.notificacoes = false; salvar(); cancelarTudo();
      await atualizarSino();
      toast('Notificações desativadas');
      return;
    }
    if (!(await pedirPermissao())) { toast('Notificações bloqueadas. Libere nas configurações do celular.'); atualizarSino(); return; }
    state.ajustes.notificacoes = true; salvar(); reagendarTudo();
    await atualizarSino();
    b.classList.remove('toca'); void b.offsetWidth; b.classList.add('toca');
    setTimeout(() => b.classList.remove('toca'), 950);
    toast('Notificações ativadas 🔔');
  });
  $('#btnTesteNotif').addEventListener('click', async () => {
    if (!avisosLigados()) { toast('Ligue o sino 🔔 no topo primeiro.'); return; }
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
  $('#aEmpresa').value = state.ajustes.empresa;
  $('#aLembrete').value = String(state.ajustes.lembreteHoras);
  $('#aAtendente').addEventListener('input', (e) => { state.ajustes.atendente = e.target.value.trim(); salvar(); atualizarPrevia(); atualizarTopo(); });
  $('#aEmpresa').addEventListener('input', (e) => { state.ajustes.empresa = e.target.value.trim(); salvar(); atualizarPrevia(); });
  Object.entries(TIPOS).forEach(([tipo, T]) => {
    const area = $(`[data-modelo="${tipo}"]`);
    area.value = state.ajustes[T.chaveModelo];
    area.addEventListener('input', () => { state.ajustes[T.chaveModelo] = area.value; salvar(); atualizarPrevia(tipo); });
    $(`[data-modelo-padrao="${tipo}"]`).addEventListener('click', () => { state.ajustes[T.chaveModelo] = T.padrao; area.value = T.padrao; salvar(); atualizarPrevia(tipo); toast('Modelo original de volta.'); });
  });
  $('#aLembrete').addEventListener('change', (e) => { state.ajustes.lembreteHoras = Number(e.target.value); salvar(); reagendarTudo(); });
  // Horários do resumo diário: lista com ✕ e "Adicionar horário" (abre o relógio do celular).
  const IC_X = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  function renderHorarios() {
    const l = state.ajustes.resumos;
    $('#horarios').innerHTML = l.length
      ? l.map((hm, i) => `<span class="hora">${esc(hm)}<button type="button" data-tirar="${i}" aria-label="Tirar ${esc(hm)}">${IC_X}</button></span>`).join('')
      : '<span class="dica" style="margin:0">Nenhum horário: resumo desligado.</span>';
    $('.hora-add').hidden = l.length >= MAX_HORARIOS;
  }
  $('#horarios').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tirar]'); if (!b) return;
    state.ajustes.resumos.splice(Number(b.dataset.tirar), 1);
    salvar(); renderHorarios(); agendarResumo();
  });
  $('#aNovoHorario').addEventListener('click', (e) => {
    if (typeof e.target.showPicker !== 'function') return;
    e.preventDefault(); try { e.target.showPicker(); } catch { /* digita */ }
  });
  $('#aNovoHorario').addEventListener('change', (e) => {
    const hm = e.target.value; e.target.value = ''; e.target.blur();
    if (!/^\d{2}:\d{2}$/.test(hm)) return;
    if (state.ajustes.resumos.includes(hm)) { toast(`${hm} já está na lista.`); return; }
    state.ajustes.resumos.push(hm);
    state.ajustes.resumos.sort();
    salvar(); renderHorarios(); agendarResumo();
    toast(`Resumo diário às ${hm} 🔔`);
  });
  renderHorarios();

  $('#btnExportar').addEventListener('click', async () => {
    const json = JSON.stringify({ app: 'confirma', versao: 2, contatos: state.contatos, ajustes: { ...state.ajustes, avisosWeb: undefined } }, null, 2);
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
  const TITULOS = { nova: 'Nova confirmação', cobranca: 'Nova cobrança', lista: 'Seus contatos', ajustes: 'Ajustes' };
  function atualizarTopo() {
    $('#saudacaoTopo').textContent = `${saudacao()}, ${state.ajustes.atendente || 'Mary'}`;
  }
  function abrirAba(nome) {
    $('#tituloTopo').textContent = TITULOS[nome] || 'Confirma Nota';
    atualizarTopo();
    window.scrollTo(0, 0);
    $$('.abas button').forEach((b) => b.classList.toggle('is-on', b.dataset.aba === nome));
    $$('.aba').forEach((s) => { s.hidden = s.id !== `aba-${nome}`; });
    if (nome === 'lista') renderLista();
  }
  $$('.abas button').forEach((b) => b.addEventListener('click', () => abrirAba(b.dataset.aba)));

  if (NATIVE) {
    const App = plugin('App');
    if (App) App.addListener('backButton', () => {
      if ($('#dlgValor').open) { $('#dlgValor').close(); return; }
      if ($('#dlgDetalhe').open) { $('#dlgDetalhe').close(); return; }
      if ($('#dlgVend').open) { $('#dlgVend').close(); return; }
      if (!$('#aba-nova').hidden) App.minimizeApp(); else abrirAba('nova');
    });
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { atualizarTopo(); renderLista(); avisosWeb(); atualizarSino(); } });
  if (!NATIVE && 'serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});

  // Data: tocar em qualquer ponto do campo abre o calendário (em vez de só marcar o dia/mês/ano).
  $$('input[type="date"]').forEach((el) => {
    el.addEventListener('click', (e) => {
      if (typeof el.showPicker !== 'function') return;
      e.preventDefault();
      try { el.showPicker(); } catch { /* sem calendário: fica a digitação normal */ }
    });
    // Depois de escolher, tira o foco: o dia/mês/ano não fica marcado em azul.
    el.addEventListener('change', () => setTimeout(() => el.blur(), 0));
  });

  // Valor como maquininha: começa em 0,00 e os números entram pela direita (2 → 0,02 → 0,21 → 2,15 → 21,50 → 215,00).
  function mascaraDinheiro(el) {
    const dig = el.value.replace(/\D/g, '').replace(/^0+/, '').slice(0, 11);
    el.value = dig ? numeroBR(Number(dig) / 100) : '';
    const fim = el.value.length;
    try { el.setSelectionRange(fim, fim); } catch { /* campo sem cursor */ }
  }
  $$('input[data-mascara="dinheiro"]').forEach((el) => {
    el.addEventListener('input', () => mascaraDinheiro(el));
    el.addEventListener('focus', () => { if (!el.value) { el.value = '0,00'; } const fim = el.value.length; setTimeout(() => { try { el.setSelectionRange(fim, fim); } catch { /* */ } }, 0); });
    el.addEventListener('blur', () => { if (el.value === '0,00') { el.value = ''; el.dispatchEvent(new Event('input', { bubbles: true })); } });
  });

  // Teclado aberto: o campo em que se digita fica no meio da parte visível (não some atrás das abas nem do teclado).
  function mostrarCampo() {
    const el = document.activeElement;
    if (!el || !el.matches('input:not([type="date"]), textarea')) return;
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
  document.addEventListener('focusin', () => setTimeout(mostrarCampo, 350));
  // Teclado aberto: a barra de abas de baixo sai da frente. O teclado é percebido pela tela que encolhe
  // (o Android redimensiona o app), não só pelo foco, para a barra não sumir com o teclado fechado.
  let alturaCheia = window.innerHeight;
  const campoTexto = () => { const el = document.activeElement; return !!el && el.matches('input:not([type="date"]):not([type="file"]), textarea'); };
  function verTeclado() {
    const h = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    if (!campoTexto()) alturaCheia = Math.max(h, window.innerHeight);
    document.documentElement.classList.toggle('digitando', campoTexto() && h < alturaCheia * 0.8);
  }
  window.addEventListener('orientationchange', () => setTimeout(() => { alturaCheia = window.innerHeight; verTeclado(); }, 400));
  (window.visualViewport || window).addEventListener('resize', verTeclado);
  document.addEventListener('focusin', () => setTimeout(verTeclado, 300));
  document.addEventListener('focusout', () => setTimeout(verTeclado, 0));
  if (window.visualViewport) window.visualViewport.addEventListener('resize', () => setTimeout(mostrarCampo, 50));
  else window.addEventListener('resize', () => setTimeout(mostrarCampo, 50));

  // Ao rolar, as abas grudam no topo: uma faixa da cor do fundo cobre a barra de status do Android.
  const marcarRolagem = () => document.documentElement.classList.toggle('rolou', window.scrollY > 8);
  window.addEventListener('scroll', marcarRolagem, { passive: true });
  marcarRolagem();

  /* ---------------- Início ---------------- */
  Object.keys(TIPOS).forEach((tipo) => {
    const r = state.rascunhos[tipo] || {};
    $$('[data-campo]', secao(tipo)).forEach((el) => { if (el.dataset.campo !== 'vendedor') el.value = r[el.dataset.campo] || ''; });
  });
  if (!campo('confirmacao', 'data').value) campo('confirmacao', 'data').value = hojeISO();
  renderVendedores();
  atualizarPrevia();
  atualizarTopo();
  renderLista();
  atualizarSino();
  avisosWeb();
  reagendarTudo();
})();
