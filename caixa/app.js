/* Fechamento de Caixa — faz as contas da folha de caixa e lê notas/folhas pela foto (IA Claude). */
import Anthropic from './vendor/anthropic.js';

const KEY_ATUAL = 'caixa.atual';
const KEY_SALVOS = 'caixa.salvos';
const KEY_API = 'caixa.apiKey';
const MODELO = 'claude-opus-5-5';

/* ---------- utilidades ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const uid = () => Math.random().toString(36).slice(2, 10);
const brl = (n) => (Number(n) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const R$ = (n) => 'R$ ' + brl(n);
const arred = (n) => Math.round((Number(n) || 0) * 100) / 100;

const ls = {
  get(k, def) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch { return def; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { toast('Não deu para salvar neste aparelho.'); } },
};

// Aceita "1.329,75", "1329.75", "1329,75" e somas como "130+151,50".
function numero(txt) {
  if (typeof txt === 'number') return txt;
  const s = String(txt ?? '').replace(/[R$\s]/g, '');
  if (!s) return 0;
  return arred(s.split('+').reduce((t, p) => {
    let v = p;
    if (v.includes(',')) v = v.replace(/\./g, '').replace(',', '.');
    else if (/^\d{1,3}(\.\d{3})+$/.test(v)) v = v.replace(/\./g, '');
    const n = parseFloat(v);
    return t + (isNaN(n) ? 0 : n);
  }, 0));
}

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove('show'), 3200);
}

/* ---------- estado ---------- */
const MONEY = ['foiCobrar', 'antecipados', 'valorPepinos', 'pepinoParcial', 'depEspecie', 'depPix', 'depBanco',
  'vale', 'ajuda', 'mecanica', 'despSupervisor', 'excedido', 'valorDeixado'];
const SAIDAS = ['depEspecie', 'depPix', 'depBanco', 'vale', 'ajuda', 'mecanica', 'despSupervisor', 'excedido'];
const LISTAS = {
  notas25: [['numero', 'Nº'], ['cliente', 'Cliente'], ['cidade', 'Cidade'], ['valor', 'Valor']],
  notas4050: [['numero', 'Nº'], ['cliente', 'Cliente'], ['cidade', 'Cidade'], ['valor', 'Valor']],
  extras: [['numero', 'Nº'], ['vendedora', 'Vendedora/cliente'], ['cidade', 'Cidade'], ['valor', 'Valor']],
  outros: [['desc', 'Descrição'], ['valor', 'Valor']],
  obs: [['desc', 'Descrição'], ['valor', 'Valor']],
};

function novo() {
  const ultimo = ls.get(KEY_SALVOS, [])[0];
  return {
    id: uid(),
    cidade: ultimo?.cidade || '', nome: ultimo?.nome || '',
    data: new Date().toISOString().slice(0, 10), semana: '',
    foiCobrar: 0, qtNotas: '', qtNotasDeixadas: '', pinos: '',
    antecipados: 0, valorPepinos: 0, pepinoParcial: 0,
    notas25: [], notas4050: [], extras: [], outros: [], obs: [],
    depEspecie: 0, depPix: 0, depBanco: 0, vale: 0, ajuda: 0, mecanica: 0, despSupervisor: 0, excedido: 0,
    valorDeixado: 0, assinatura: ultimo?.assinatura || '',
  };
}

let st = ls.get(KEY_ATUAL, null) || novo();

const soma = (lista) => arred(lista.reduce((t, i) => t + (Number(i.valor) || 0), 0));

function calcular(s = st) {
  const c = {};
  c.vPep5 = arred(s.foiCobrar * 0.05);
  c.notas25 = soma(s.notas25);
  c.notas4050 = soma(s.notas4050);
  c.extras = soma(s.extras);
  c.recebimento = arred(c.notas25 + c.notas4050 + s.antecipados + c.extras + s.pepinoParcial);
  c.outros = soma(s.outros);
  c.obs = soma(s.obs);
  c.saidas = arred(SAIDAS.reduce((t, k) => t + (Number(s[k]) || 0), 0) + c.outros + c.obs);
  c.diferenca = arred(c.recebimento - c.saidas);
  return c;
}

function salvarAtual() { ls.set(KEY_ATUAL, st); }

/* ---------- tela ---------- */
function pintarTotais() {
  const c = calcular();
  $$('[data-c]').forEach((el) => {
    const v = c[el.dataset.c];
    el.textContent = R$(v);
    el.classList.toggle('neg', el.dataset.c === 'diferenca' && v !== 0);
    el.classList.toggle('pos', el.dataset.c === 'diferenca' && v === 0);
  });
  // O caixa fecha quando tudo que foi recebido está lançado em depósitos e despesas.
  const dif = c.diferenca;
  $$('[data-status]').forEach((el) => {
    el.textContent = dif === 0 ? '✓ Caixa fechado'
      : dif > 0 ? `Falta lançar ${R$(dif)}` : `Lançou ${R$(-dif)} a mais`;
    el.className = 'status ' + (dif === 0 ? 'pos' : 'neg');
  });
  const d = st.data ? new Date(st.data + 'T12:00').toLocaleDateString('pt-BR') : '';
  $('#subtitulo').textContent = [st.nome, st.cidade, d].filter(Boolean).join(' · ') || 'Novo fechamento';
}

function pintarCampos() {
  $$('[data-f]').forEach((el) => {
    const k = el.dataset.f;
    el.value = MONEY.includes(k) ? (st[k] ? brl(st[k]) : '') : (st[k] ?? '');
  });
}

function pintarLista(nome) {
  const box = $(`[data-lista="${nome}"]`);
  const cols = LISTAS[nome];
  box.innerHTML = '';
  if (!st[nome].length) {
    box.innerHTML = '<p class="vazio">Nada lançado ainda.</p>';
    return;
  }
  st[nome].forEach((item, i) => {
    const row = document.createElement('div');
    row.className = 'item' + (item.conferir ? ' item--conferir' : '') + (cols.length === 2 ? ' item--2' : '');
    row.innerHTML = cols.map(([k, rot]) => `
      <label class="item__${k}">${rot}
        <input data-k="${k}" ${k === 'valor' ? 'inputmode="decimal"' : ''} value="${esc(k === 'valor' ? (item.valor ? brl(item.valor) : '') : item[k] || '')}">
      </label>`).join('') +
      `<button class="item__del" aria-label="Apagar" title="Apagar">✕</button>` +
      (nome.startsWith('notas') ? `<div class="item__extra">${item.faixa ? `<span class="tag">${esc(item.faixa)}%</span>` : ''}
        <button class="item__mover">↕ Mover para ${nome === 'notas25' ? '40% e 50%' : '25%'}</button></div>` : '') +
      (item.nota ? `<p class="item__nota">⚠ ${esc(item.nota)}</p>` : '');
    row.addEventListener('change', (e) => {
      const k = e.target.dataset.k;
      if (!k) return;
      item[k] = k === 'valor' ? numero(e.target.value) : e.target.value.trim();
      if (k === 'valor') e.target.value = item.valor ? brl(item.valor) : '';
      item.conferir = false;
      row.classList.remove('item--conferir');
      salvarAtual(); pintarTotais();
    });
    row.querySelector('.item__mover')?.addEventListener('click', () => {
      const outra = nome === 'notas25' ? 'notas4050' : 'notas25';
      st[nome].splice(i, 1);
      st[outra].push({ ...item, faixa: outra === 'notas25' ? '25' : (item.faixa === '50' ? '50' : '40') });
      salvarAtual(); pintarLista(nome); pintarLista(outra); pintarTotais();
    });
    row.querySelector('.item__del').addEventListener('click', () => {
      st[nome].splice(i, 1);
      salvarAtual(); pintarLista(nome); pintarTotais();
    });
    box.appendChild(row);
  });
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function pintarTudo() {
  pintarCampos();
  Object.keys(LISTAS).forEach(pintarLista);
  pintarTotais();
}

/* ---------- eventos dos campos ---------- */
$$('[data-f]').forEach((el) => {
  el.addEventListener('input', () => {
    const k = el.dataset.f;
    st[k] = MONEY.includes(k) ? numero(el.value) : el.value;
    salvarAtual(); pintarTotais();
  });
  if (el.hasAttribute('data-money')) {
    el.addEventListener('blur', () => { el.value = st[el.dataset.f] ? brl(st[el.dataset.f]) : ''; });
  }
});

$$('[data-add]').forEach((b) => b.addEventListener('click', () => {
  const nome = b.dataset.add;
  st[nome].push({ id: uid(), valor: 0, cidade: nome.startsWith('notas') || nome === 'extras' ? st.cidade : undefined });
  salvarAtual(); pintarLista(nome);
  const rows = $$(`[data-lista="${nome}"] .item`);
  rows[rows.length - 1]?.querySelector('input')?.focus();
}));

/* ---------- leitura por foto (IA) ---------- */
let cliente = null;
function getCliente() {
  const key = ls.get(KEY_API, '');
  if (!key) return null;
  if (!cliente || cliente.apiKey !== key) {
    // O app roda só no aparelho do próprio dono, com a chave dele; por isso a chamada sai direto do navegador.
    cliente = new Anthropic({ apiKey: key, dangerouslyAllowBrowser: true });
  }
  return cliente;
}

// Diminui a foto (celular tira fotos enormes) e devolve base64 JPEG.
async function prepararFoto(file) {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const max = 1800;
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const cv = document.createElement('canvas');
  cv.width = Math.round(bmp.width * k);
  cv.height = Math.round(bmp.height * k);
  cv.getContext('2d').drawImage(bmp, 0, 0, cv.width, cv.height);
  return cv.toDataURL('image/jpeg', 0.85).split(',')[1];
}

const ITEM_NOTA = {
  type: 'object', additionalProperties: false,
  required: ['numero', 'cliente', 'cidade', 'faixa', 'valor', 'valor_total', 'duvida'],
  properties: {
    numero: { type: 'string', description: 'Número da nota, como está escrito' },
    faixa: { type: 'string', enum: ['25', '40', '50', ''], description: 'Faixa em que a nota foi paga, como está marcado na nota; vazio se não der para ver' },
    cliente: { type: 'string', description: 'Nome da cliente / compradora' },
    cidade: { type: 'string' },
    valor: { type: 'number', description: 'Valor pago/quitado, em reais' },
    valor_total: { type: 'number', description: 'Valor total da nota, se aparecer; senão 0' },
    duvida: { type: 'string', description: 'O que ficou ilegível ou duvidoso; vazio se tudo claro' },
  },
};

const SCHEMA_NOTAS = {
  type: 'object', additionalProperties: false, required: ['notas'],
  properties: { notas: { type: 'array', items: ITEM_NOTA } },
};

const ITEM_EXTRA = {
  type: 'object', additionalProperties: false, required: ['numero', 'cidade', 'valor', 'vendedora', 'duvida'],
  properties: {
    numero: { type: 'string' }, cidade: { type: 'string' }, valor: { type: 'number' },
    vendedora: { type: 'string', description: 'Nome da vendedora/cliente escrito na linha' },
    duvida: { type: 'string' },
  },
};

const SCHEMA_EXTRAS = {
  type: 'object', additionalProperties: false, required: ['itens'],
  properties: { itens: { type: 'array', items: ITEM_EXTRA } },
};

const linhaDesc = {
  type: 'object', additionalProperties: false, required: ['desc', 'valor'],
  properties: { desc: { type: 'string' }, valor: { type: 'number' } },
};
const SCHEMA_FOLHA = {
  type: 'object', additionalProperties: false,
  required: ['cidade', 'nome', 'data', 'semana', 'foiCobrar', 'qtNotas', 'qtNotasDeixadas', 'pinos', 'antecipados',
    'valorPepinos', 'pepinoParcial', 'notas25', 'notas4050', 'depEspecie', 'depPix', 'depBanco', 'vale', 'ajuda',
    'mecanica', 'despSupervisor', 'excedido', 'outros', 'obs', 'extras', 'valorDeixado', 'assinatura', 'duvidas'],
  properties: {
    cidade: { type: 'string' }, nome: { type: 'string' },
    data: { type: 'string', description: 'Data no formato AAAA-MM-DD, ou vazio' },
    semana: { type: 'string' }, foiCobrar: { type: 'number' }, qtNotas: { type: 'string' },
    qtNotasDeixadas: { type: 'string' }, pinos: { type: 'string' },
    antecipados: { type: 'number' }, valorPepinos: { type: 'number' }, pepinoParcial: { type: 'number' },
    notas25: { type: 'number', description: 'Total escrito no campo NOTAS 25%' },
    notas4050: { type: 'number', description: 'Total escrito no campo NOTAS 40% e 50%' },
    depEspecie: { type: 'number' }, depPix: { type: 'number' }, depBanco: { type: 'number' },
    vale: { type: 'number' }, ajuda: { type: 'number' }, mecanica: { type: 'number' },
    despSupervisor: { type: 'number' }, excedido: { type: 'number' },
    outros: { type: 'array', items: linhaDesc }, obs: { type: 'array', items: linhaDesc },
    extras: { type: 'array', items: ITEM_EXTRA },
    valorDeixado: { type: 'number' }, assinatura: { type: 'string' },
    duvidas: { type: 'string', description: 'Campos ilegíveis ou duvidosos; vazio se tudo claro' },
  },
};

const CONTEXTO = `Você ajuda um vendedor/cobrador de vendas a prazo no Brasil a fazer o fechamento de caixa semanal.
Os documentos são fotos de papéis, muitas vezes escritos à mão. Valores estão em reais no formato brasileiro
(1.329,75 = mil trezentos e vinte e nove reais e setenta e cinco centavos); devolva os números com ponto decimal (1329.75).
Copie números de nota e nomes exatamente como estão escritos. Nunca invente: campo vazio ou ilegível vira "" ou 0,
e você explica a dúvida no campo de dúvida.`;

const PEDIDOS = {
  notas: {
    schema: SCHEMA_NOTAS,
    texto: `As fotos são de notas quitadas. Cada nota mostra se foi paga nos 25%, nos 40% ou nos 50% — leia essa marca
e devolva em "faixa" ("25", "40" ou "50"; vazio se não der para ver). Liste cada nota que aparece (uma foto pode ter várias
notas; não repita a mesma nota se aparecer em duas fotos). Para cada uma: número, nome da cliente, cidade, faixa e o valor pago.
Se a nota mostrar o valor total e o valor pago, ponha o pago em "valor" e o total em "valor_total".`,
  },
  extras: {
    schema: SCHEMA_EXTRAS,
    texto: `As fotos são de "pepino extra" (cobranças extras). Para cada lançamento: número, cidade, valor e o nome
da vendedora/cliente. Não repita o mesmo lançamento se ele aparecer em duas fotos.`,
  },
  folha: {
    schema: SCHEMA_FOLHA,
    texto: `A foto é uma folha "CAIXA" de fechamento (pode estar em branco ou preenchida à mão). Campos da folha:
CIDADE, NOME, DATA, SEMANA, FOI COBRAR R$ (foiCobrar), QT. DE NOTAS (qtNotas), ANTECIPADOS R$, V. PEP. 5% (ignore, é calculado),
QT. NOTAS DEIXADAS, Nº DE PINOS, VALOR DOS PEPINOS, PEPINO PARCIAL, PEPINO EXTRA (ignore o total, é calculado),
NOTAS 25% (notas25), NOTAS 40% e 50% (notas4050), RECEBIMENTO (ignore, é calculado), DEPTO. EMPRESA ESPÉCIE (depEspecie),
DEPTO PIX (depPix), DEPTO BANCO/TED/TRANS. (depBanco), VALE ADIANTADO (vale), AJUDA DE CUSTO (ajuda), MECÂNICA,
DESPESAS SUPERVISOR, EXCEDIDO DA DESPESA (excedido), OUTROS e OBS (cada linha escrita vira {desc, valor}; se o valor
estiver entre parênteses, ele é o valor da linha), VALOR DEIXADO, ASSINATURA VENDEDOR.
À direita há blocos "VENDEDORA:" com colunas Nº, CIDADE, VALOR — são os pepinos extras: cada bloco preenchido vira um item
de "extras" (vendedora = nome escrito depois de VENDEDORA:). Se a folha estiver em branco, devolva tudo vazio/0.`,
  },
};

async function lerFotos(tipo, files) {
  const api = getCliente();
  if (!api) {
    toast('Configure a chave da IA primeiro.');
    abrirConfig();
    return;
  }
  const pedido = PEDIDOS[tipo];
  carregando(true, files.length > 1 ? `Lendo ${files.length} fotos…` : 'Lendo a foto…');
  try {
    const imagens = await Promise.all(files.slice(0, 20).map(prepararFoto));
    const resp = await api.beta.messages.create({
      model: MODELO,
      max_tokens: 16000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'medium', format: { type: 'json_schema', schema: pedido.schema } },
      system: CONTEXTO,
      messages: [{
        role: 'user',
        content: [
          ...imagens.map((data) => ({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data } })),
          { type: 'text', text: pedido.texto },
        ],
      }],
    });
    if (resp.stop_reason === 'refusal') throw new Error('A IA não quis ler esta foto. Tente outra foto.');
    if (resp.stop_reason === 'max_tokens') throw new Error('Fotos demais de uma vez. Mande menos fotos por vez.');
    const txt = resp.content.find((b) => b.type === 'text')?.text;
    if (!txt) throw new Error('A IA não devolveu nada. Tente de novo.');
    aplicar(tipo, JSON.parse(txt));
  } catch (e) {
    console.error(e);
    toast(mensagemErro(e));
  } finally {
    carregando(false);
  }
}

function mensagemErro(e) {
  if (e instanceof Anthropic.AuthenticationError) return 'Chave da IA inválida. Confira em ⚙.';
  if (e instanceof Anthropic.PermissionDeniedError) return 'Essa chave não tem permissão. Confira em ⚙.';
  if (e instanceof Anthropic.RateLimitError) return 'Muitas leituras seguidas. Espere um pouco e tente de novo.';
  if (e instanceof Anthropic.APIConnectionError) return 'Sem internet. A leitura por foto precisa de conexão.';
  if (e instanceof Anthropic.APIError) return 'Erro na IA (' + (e.status || '?') + '). Tente de novo.';
  return e.message || 'Não deu para ler a foto.';
}

function aplicar(tipo, r) {
  if (tipo === 'notas') {
    let n25 = 0, n4050 = 0, semFaixa = 0;
    r.notas.forEach((n) => {
      const destino = n.faixa === '40' || n.faixa === '50' ? 'notas4050' : 'notas25';
      if (!n.faixa) semFaixa++;
      destino === 'notas25' ? n25++ : n4050++;
      st[destino].push({
        id: uid(), numero: n.numero, cliente: n.cliente, cidade: n.cidade || st.cidade, valor: arred(n.valor),
        faixa: n.faixa, conferir: true,
        nota: [n.faixa ? '' : 'não deu para ver se foi 25% ou 40/50% — confira', n.duvida,
          n.valor_total && n.valor_total !== n.valor ? `total da nota ${R$(n.valor_total)}` : '']
          .filter(Boolean).join(' · '),
      });
    });
    pintarLista('notas25'); pintarLista('notas4050');
    toast(r.notas.length
      ? `${r.notas.length} nota(s): ${n25} em 25%, ${n4050} em 40/50%.` + (semFaixa ? ` ${semFaixa} sem faixa, confira!` : ' Confira!')
      : 'Nenhuma nota encontrada na foto.');
  } else if (tipo === 'extras') {
    const novos = r.itens.map(itemExtra);
    st.extras.push(...novos);
    pintarLista('extras');
    toast(novos.length ? `${novos.length} pepino(s) extra lido(s). Confira!` : 'Nada encontrado na foto.');
  } else if (tipo === 'folha') {
    aplicarFolha(r);
  }
  salvarAtual(); pintarTotais();
}

const itemExtra = (n) => ({
  id: uid(), numero: n.numero, cidade: n.cidade, valor: arred(n.valor), vendedora: n.vendedora,
  conferir: true, nota: n.duvida,
});

function aplicarFolha(r) {
  const temAlgo = Object.entries(r).some(([k, v]) => k !== 'duvidas' && (Array.isArray(v) ? v.length : v));
  if (!temAlgo) {
    toast('Folha em branco reconhecida. Preencha os campos aqui no app.');
    return;
  }
  ['cidade', 'nome', 'semana', 'qtNotas', 'qtNotasDeixadas', 'pinos', 'assinatura'].forEach((k) => { if (r[k]) st[k] = r[k]; });
  if (/^\d{4}-\d{2}-\d{2}$/.test(r.data)) st.data = r.data;
  MONEY.forEach((k) => { if (r[k]) st[k] = arred(r[k]); });
  // Na folha só aparece o total das notas; vira uma linha "total da folha" que pode ser trocada pelas notas uma a uma.
  [['notas25', r.notas25], ['notas4050', r.notas4050]].forEach(([k, v]) => {
    if (v) st[k] = [{ id: uid(), numero: '', cliente: 'Total escrito na folha', cidade: st.cidade, valor: arred(v), conferir: true }];
  });
  if (r.extras.length) st.extras = r.extras.map(itemExtra);
  if (r.outros.length) st.outros = r.outros.map((o) => ({ id: uid(), desc: o.desc, valor: arred(o.valor), conferir: true }));
  if (r.obs.length) st.obs = r.obs.map((o) => ({ id: uid(), desc: o.desc, valor: arred(o.valor), conferir: true }));
  pintarTudo();
  toast(r.duvidas ? 'Folha lida. Atenção: ' + r.duvidas : 'Folha lida! Confira os campos marcados.');
}

$$('input[data-ler]').forEach((inp) => inp.addEventListener('change', () => {
  const files = [...inp.files];
  inp.value = '';
  if (files.length) lerFotos(inp.dataset.ler, files);
}));

function carregando(on, txt) {
  $('#carregando').hidden = !on;
  if (txt) $('#carregandoTxt').textContent = txt;
}

/* ---------- configurar chave ---------- */
function abrirConfig() {
  $('#apiKey').value = ls.get(KEY_API, '');
  $('#dlgConfig').showModal();
}
$('#btnConfig').addEventListener('click', abrirConfig);
$('#btnSalvarChave').addEventListener('click', () => {
  ls.set(KEY_API, $('#apiKey').value.trim());
  toast('Chave salva neste aparelho.');
});

/* ---------- salvar / lista / novo ---------- */
function salvarFechamento() {
  const salvos = ls.get(KEY_SALVOS, []).filter((s) => s.id !== st.id);
  salvos.unshift(structuredClone(st));
  ls.set(KEY_SALVOS, salvos);
  toast('Fechamento salvo.');
}
$('#btnSalvar').addEventListener('click', salvarFechamento);

$('#btnNovo').addEventListener('click', () => {
  if (!confirm('Começar um fechamento novo? Salve este antes se quiser guardar.')) return;
  st = novo();
  salvarAtual(); pintarTudo();
  scrollTo({ top: 0, behavior: 'smooth' });
});

$('#btnLista').addEventListener('click', () => {
  const salvos = ls.get(KEY_SALVOS, []);
  const box = $('#listaSalvos');
  box.innerHTML = salvos.length ? '' : '<p class="vazio">Nenhum fechamento salvo.</p>';
  salvos.forEach((s) => {
    const c = calcular(s);
    const d = s.data ? new Date(s.data + 'T12:00').toLocaleDateString('pt-BR') : '';
    const row = document.createElement('div');
    row.className = 'salvo';
    row.innerHTML = `<button type="button" class="salvo__abrir">
        <b>${esc(d)} · Semana ${esc(s.semana || '-')}</b>
        <span>${esc(s.nome)} · ${esc(s.cidade)} — Recebimento ${R$(c.recebimento)}</span>
      </button>
      <button type="button" class="item__del" aria-label="Apagar">✕</button>`;
    row.querySelector('.salvo__abrir').addEventListener('click', () => {
      st = structuredClone(s);
      salvarAtual(); pintarTudo();
      $('#dlgLista').close();
    });
    row.querySelector('.item__del').addEventListener('click', () => {
      if (!confirm('Apagar este fechamento salvo?')) return;
      ls.set(KEY_SALVOS, ls.get(KEY_SALVOS, []).filter((x) => x.id !== s.id));
      row.remove();
    });
    box.appendChild(row);
  });
  $('#dlgLista').showModal();
});

/* ---------- resumo para WhatsApp ---------- */
function resumo() {
  const c = calcular();
  const d = st.data ? new Date(st.data + 'T12:00').toLocaleDateString('pt-BR') : '';
  const L = [];
  L.push(`*CAIXA — ${st.nome || ''}*`, `${st.cidade || ''} · ${d} · Semana ${st.semana || '-'}`, '');
  L.push(`Foi cobrar: ${R$(st.foiCobrar)} (${st.qtNotas || 0} notas)`);
  L.push(`V. pep. 5%: ${R$(c.vPep5)}`);
  L.push(`Notas deixadas: ${st.qtNotasDeixadas || 0} · Pinos: ${st.pinos || 0}`);
  L.push(`Antecipados: ${R$(st.antecipados)}`);
  if (st.valorPepinos) L.push(`Valor dos pepinos: ${R$(st.valorPepinos)}`);
  if (st.pepinoParcial) L.push(`Pepino parcial: ${R$(st.pepinoParcial)}`);
  L.push('', `Notas 25%: ${R$(c.notas25)} (${st.notas25.length})`, `Notas 40% e 50%: ${R$(c.notas4050)} (${st.notas4050.length})`);
  L.push(`Pepino extra: ${R$(c.extras)}`);
  st.extras.forEach((x) => L.push(`  • ${x.numero || ''} ${x.cidade || ''} ${x.vendedora || ''} — ${R$(x.valor)}`));
  L.push('', `*Recebimento: ${R$(c.recebimento)}*`, '');
  const nomes = { depEspecie: 'Depto. espécie', depPix: 'Depto. Pix', depBanco: 'Depto. banco', vale: 'Vale adiantado',
    ajuda: 'Ajuda de custo', mecanica: 'Mecânica', despSupervisor: 'Desp. supervisor', excedido: 'Excedido da despesa' };
  SAIDAS.forEach((k) => { if (st[k]) L.push(`${nomes[k]}: ${R$(st[k])}`); });
  st.outros.forEach((o) => L.push(`Outros: ${o.desc || ''} ${R$(o.valor)}`));
  st.obs.forEach((o) => L.push(`OBS: ${o.desc || ''} ${R$(o.valor)}`));
  L.push('', `Valor deixado (vendas da semana): ${R$(st.valorDeixado)}`);
  return L.join('\n');
}

$('#btnWhats').addEventListener('click', async () => {
  const txt = resumo();
  if (navigator.share) {
    try { await navigator.share({ text: txt }); return; } catch (e) { if (e.name === 'AbortError') return; }
  }
  open('https://wa.me/?text=' + encodeURIComponent(txt), '_blank');
});

/* ---------- impressão no formato da folha ---------- */
function montarFolha() {
  const c = calcular();
  const d = st.data ? new Date(st.data + 'T12:00').toLocaleDateString('pt-BR') : '';
  const lin = (rot, v) => `<tr><th>${rot}</th><td>${v}</td></tr>`;
  const tab = (titulo, itens, cols) => `<h3>${titulo}</h3><table class="folha__lista"><tr>${cols.map(([, r]) => `<th>${r}</th>`).join('')}</tr>
    ${itens.map((i) => `<tr>${cols.map(([k]) => `<td>${k === 'valor' ? brl(i.valor) : esc(i[k] || '')}</td>`).join('')}</tr>`).join('')}</table>`;
  $('#folha').innerHTML = `
    <h2>CAIXA — NOME: ${esc(st.nome)}</h2>
    <table>
      ${lin('Cidade', esc(st.cidade))}${lin('Data', d)}${lin('Semana', esc(st.semana))}
      ${lin('Foi cobrar', R$(st.foiCobrar) + ' · Qt. de notas: ' + esc(st.qtNotas))}
      ${lin('Antecipados', R$(st.antecipados))}${lin('V. pep. 5%', R$(c.vPep5))}
      ${lin('Qt. notas deixadas', esc(st.qtNotasDeixadas))}${lin('Nº de pinos', esc(st.pinos))}
      ${lin('Valor dos pepinos', R$(st.valorPepinos))}${lin('Pepino parcial', R$(st.pepinoParcial))}
      ${lin('Pepino extra', R$(c.extras))}
      ${lin('Notas 25%', R$(c.notas25))}${lin('Notas 40% e 50%', R$(c.notas4050))}
      ${lin('<b>Recebimento</b>', '<b>' + R$(c.recebimento) + '</b>')}
      ${lin('Depto. empresa espécie', R$(st.depEspecie))}${lin('Depto. Pix', R$(st.depPix))}
      ${lin('Depto. banco/TED/trans.', R$(st.depBanco))}${lin('Vale adiantado', R$(st.vale))}
      ${lin('Ajuda de custo', R$(st.ajuda))}${lin('Mecânica', R$(st.mecanica))}
      ${lin('Despesas supervisor', R$(st.despSupervisor))}${lin('Excedido da despesa', R$(st.excedido))}
      ${st.outros.map((o) => lin('Outros', esc(o.desc || '') + ' ' + R$(o.valor))).join('')}
      ${st.obs.map((o) => lin('OBS', esc(o.desc || '') + ' ' + R$(o.valor))).join('')}
      ${lin('<b>Valor deixado (vendas da semana)</b>', '<b>' + R$(st.valorDeixado) + '</b>')}
      ${lin('Assinatura vendedor', esc(st.assinatura))}
    </table>
    ${st.extras.length ? tab('Pepino extra', st.extras, LISTAS.extras) : ''}
    ${st.notas25.length ? tab('Notas 25%', st.notas25, LISTAS.notas25) : ''}
    ${st.notas4050.length ? tab('Notas 40% e 50%', st.notas4050, LISTAS.notas4050) : ''}`;
}
$('#btnImprimir').addEventListener('click', () => { montarFolha(); print(); });

/* ---------- início ---------- */
pintarTudo();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
