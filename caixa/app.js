/* Fechamento de Caixa — faz as contas da folha de caixa e lê notas/folhas pela foto (IA Claude). */
import Anthropic from './vendor/anthropic.js';
import { desenharCaixa } from './folha.js?v=9';
import { lerNotaGratis, lerFolhaGratis, lerPepinoGratis, semanaDe, ultimaLeitura } from './leitor.js?v=21';

const KEY_ATUAL = 'caixa.atual';
const KEY_SALVOS = 'caixa.salvos';
const KEY_API = 'caixa.apiKey';
const KEY_MODO = 'caixa.modoLeitura';
const KEY_REL = 'caixa.relatorio'; // placa, modelo, locadora, km e supervisor: valem para todas as semanas
// Como ler as fotos: 'gratis' (no celular, sem custo, só texto impresso) ou IA Claude (paga, lê letra de mão).
const MODOS = {
  gratis: { nome: 'Gratuita (no celular)' },
  economica: { nome: 'IA econômica', modelo: 'claude-haiku-5-5' },
  precisa: { nome: 'IA mais precisa', modelo: 'claude-opus-5-5' },
};
const modoLeitura = () => (MODOS[ls.get(KEY_MODO, 'gratis')] ? ls.get(KEY_MODO, 'gratis') : 'gratis');

/* ---------- utilidades ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const uid = () => Math.random().toString(36).slice(2, 10);
const brl = (n) => (Number(n) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const R$ = (n) => 'R$ ' + brl(n);
const arred = (n) => Math.round((Number(n) || 0) * 100) / 100;
// Data de hoje no horário do celular (no Acre, depois das 19h o UTC já é o dia seguinte).
const hoje = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

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

// Campos de dinheiro: começam em 0,00 e os números entram pela direita, já com ponto e vírgula
// (6 → 0,06 · 617 → 6,17 · 61700 → 617,00 · 1234567 → 12.345,67).
const SEL_DINHEIRO = '[data-money], #depValor, [data-parc="valorNota"], [data-parc="valor"], [data-parc="devolucao"], [data-rs="avistaValor"], [data-rs="devolValor"]';
const ehDinheiro = (el) => el?.tagName === 'INPUT' && !el.readOnly
  && (el.matches(SEL_DINHEIRO) || (el.dataset.k && ['valor', 'devolucao', 'valorNota', 'devendo'].includes(el.dataset.k)));
function mascaraDinheiro(el) {
  const digitos = el.value.replace(/\D/g, '').replace(/^0+/, '').slice(0, 13);
  el.value = brl(Number(digitos || '0') / 100);
  try { el.setSelectionRange(el.value.length, el.value.length); } catch { /* alguns tipos não deixam */ }
}
// Roda antes dos outros "input" (fase de captura): quem lê o campo já recebe o valor formatado.
document.addEventListener('input', (e) => { if (ehDinheiro(e.target)) mascaraDinheiro(e.target); }, true);
document.addEventListener('focusin', (e) => {
  const el = e.target;
  if (!ehDinheiro(el)) return;
  el.setAttribute('inputmode', 'numeric');
  if (!el.value.trim()) el.value = '0,00';
  setTimeout(() => { try { el.setSelectionRange(el.value.length, el.value.length); } catch { /* */ } }, 0);
}, true);
// Saiu do campo com 0,00: volta a ficar vazio (como antes).
document.addEventListener('focusout', (e) => { const el = e.target; if (ehDinheiro(el) && !numero(el.value)) el.value = ''; }, true);

function toast(msg) {
  const t = $('#toast');
  (document.querySelector('dialog[open]') || document.body).appendChild(t); // visível também com janela aberta
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove('show'), Math.max(3200, msg.length * 70));
}

/* ---------- estado ---------- */
const MONEY = ['foiCobrar', 'antecipados', 'valorPepinos', 'pepinosOutros', 'pepinoParcial',
  'vale', 'ajuda', 'salario', 'mecanica', 'despSupervisor', 'excedido', 'valorDeixado'];
// Despesas do vendedor (campo em branco vale 0, então o salário só entra quando é preenchido).
const DESPESAS = ['ajuda', 'vale', 'salario', 'mecanica', 'despSupervisor', 'excedido'];
const ONDE = { empresa: 'Depto. empresa espécie', banco: 'Depto. banco/TED/trans.', pix: 'Depto. Pix' };
const ONDE_CURTO = { empresa: 'Empresa', banco: 'Banco/TED', pix: 'Pix' };
const NOMES = { ajuda: 'Ajuda de custo', vale: 'Vale adiantado', salario: 'Salário', mecanica: 'Mecânica',
  despSupervisor: 'Despesas supervisor', excedido: 'Excedido da despesa' };
// Campos das listas que são dinheiro.
const K_DINHEIRO = ['valor', 'devolucao', 'valorNota', 'devendo'];
const LISTAS = {
  // Da nota o caixa só precisa do valor recebido (e da faixa, que é a lista onde ela está); o nome ajuda a achar a nota.
  // Devolução: o "TOTAL DE DEVOLUCOES" da nota (lido da foto ou digitado), para as notas em branco.
  notas25: [['cliente', 'Cliente'], ['valor', 'Valor recebido'], ['devolucao', 'Devolução']],
  notas4050: [['cliente', 'Cliente'], ['valor', 'Valor recebido'], ['devolucao', 'Devolução']],
  extras: [['numero', 'Nº'], ['vendedora', 'Vendedora/cliente'], ['cidade', 'Cidade'], ['valor', 'Valor']],
  pila: [['tipo', 'Despesa'], ['valor', 'Valor']],
  depositos: [['data', 'Data', 'date'], ['onde', 'Onde', 'select'], ['valor', 'Valor']],
  outros: [['desc', 'Descrição'], ['valor', 'Valor']],
  // Cada nota antecipada com o nome; o total vai para "Antecipados".
  antecipadas: [['cliente', 'Nome'], ['valor', 'Valor']],
  // Cada pepino parcial com o nome; o total vai para "Pepino parcial".
  // Pepino parcial (aba Relatório): a nota, o que recebeu, o que devolveu e o que ficou devendo, juntos.
  // (o que ficou devendo é calculado e aparece discreto no canto da linha)
  parciais: [['dia', 'Dia', 'date'], ['valorNota', 'Valor da nota'], ['valor', 'Recebido'], ['devolucao', 'Devolução']],
  // Notas feitas (vendas) de cada dia: Ab (abertura) + Rp (reposição) = notas do dia; a soma dos valores é o
  // "Valor deixado" e a das notas, as "Notas deixadas".
  // Cada linha é a nota de uma cliente: Ab (abertura) ou Rp (reposição) e o valor.
  feitas: [['data', 'Dia', 'date'], ['tipo', 'Nota', 'tipo'], ['valor', 'Valor']],
  obs: [['desc', 'Descrição'], ['valor', 'Valor']],
};

function novo() {
  const ultimo = ls.get(KEY_SALVOS, [])[0];
  return {
    id: uid(),
    cidade: ultimo?.cidade || '', nome: ultimo?.nome || '',
    data: hoje(), semana: '',
    foiCobrar: 0, qtNotas: '', qtNotasDeixadas: '', pinos: '',
    antecipados: 0, valorPepinos: 0, pepinosOutros: 0, pepinoParcial: 0,
    notas25: [], notas4050: [], extras: [], pila: [], outros: [], obs: [], depositos: [], antecipadas: [], parciais: [], feitas: [], devendo: [],
    vale: 0, ajuda: 0, salario: 0, mecanica: 0, despSupervisor: 0, excedido: 0,
    valorDeixado: 0, assinatura: ultimo?.assinatura || '',
    // Relatório diário: o que só o vendedor sabe (da semana e de cada dia) e os acumulados de cada dia.
    rel: {}, relDia: {},
  };
}

const soma = (lista) => arred(lista.reduce((t, i) => t + (Number(i.valor) || 0), 0));

// Fechamentos salvos antes de existirem campos novos ganham os valores padrão.
function normalizar(s) {
  const n = { ...novo(), ...s };
  if (!s.depositos) {
    // Versões antigas guardavam o depósito em campos soltos; viram depósitos lançados.
    [['empresa', s.depEspecie], ['banco', s.depBanco], ['pix', s.depPix]].forEach(([onde, v]) => {
      if (Number(v) > 0) n.depositos.push({ id: uid(), data: s.data || hoje(), onde, valor: arred(v) });
    });
  }
  delete n.depEspecie; delete n.depBanco; delete n.depPix; delete n.depTipo;
  // Antes antecipados, valor deixado e notas deixadas eram digitados como total; viram uma linha da lista.
  if (!s.antecipadas && Number(s.antecipados) > 0) n.antecipadas = [{ id: uid(), dia: s.data || hoje(), cliente: '', valor: arred(s.antecipados) }];
  if (!s.parciais && Number(s.pepinoParcial) > 0) n.parciais = [{ id: uid(), dia: s.data || hoje(), cliente: '', valor: arred(s.pepinoParcial) }];
  delete n.diario;
  // Ab e Rp eram digitados na aba Relatório; passam para a linha das notas feitas do mesmo dia.
  (n.feitas || []).forEach((f) => {
    const d = n.relDia?.[f.data];
    if (d && f.ab == null && f.rp == null) { f.ab = d.ab || ''; f.rp = d.rp || ''; }
  });
  // O "ficou devendo" era lançado à parte (antes ainda, digitado uma vez por dia): vira pepino parcial do mesmo dia.
  const devendoAntigo = s.devendo || Object.entries(n.relDia || {})
    .filter(([, d]) => numero(d.parcialQt) || numero(d.parcialValor))
    .map(([data, d]) => ({ data, qtd: d.parcialQt, valor: numero(d.parcialValor) }));
  devendoAntigo.forEach((d) => n.parciais.push({ id: uid(), dia: d.data, cliente: '', valor: 0, devolucao: 0,
    devendo: numero(d.valor), qtd: numero(d.qtd) > 1 ? String(numero(d.qtd)) : '' }));
  n.devendo = [];
  if (!s.feitas && (Number(s.valorDeixado) > 0 || numero(s.qtNotasDeixadas) > 0)) {
    n.feitas = [{ id: uid(), data: s.data || hoje(), qtd: String(s.qtNotasDeixadas || ''), valor: arred(s.valorDeixado) }];
  }
  // "Valor dos pepinos" passou a somar o que ficou devendo nos pepinos parciais; o que já estava digitado
  // além disso vira "outros pepinos".
  if (s.pepinosOutros == null) {
    const devendo = (n.parciais || []).reduce((t, x) => t + numero(x.devendo), 0);
    n.pepinosOutros = Math.max(0, arred(numero(s.valorPepinos) - devendo));
  }
  sincronizar(n);
  return n;
}

// Notas feitas numa linha: Ab + Rp (linhas antigas tinham só a quantidade).
const qtdFeita = (x) => (numero(x.ab) + numero(x.rp)) || numero(x.qtd);

// Antecipados, pepino parcial, valor deixado e notas deixadas saem das listas (a folha e o resumo continuam usando os totais).
function sincronizar(f = st) {
  f.antecipados = soma(f.antecipadas || []);
  f.pepinoParcial = soma(f.parciais || []);
  // Valor dos pepinos = o que ficou devendo nos pepinos parciais + outros pepinos digitados.
  f.valorPepinos = arred((f.parciais || []).reduce((t, x) => t + numero(x.devendo), 0) + numero(f.pepinosOutros));
  f.valorDeixado = soma(f.feitas || []);
  const qt = (f.feitas || []).reduce((t, x) => t + qtdFeita(x), 0);
  f.qtNotasDeixadas = qt ? String(qt) : '';
}

let depOndeEscolhido = false;
let st = normalizar(ls.get(KEY_ATUAL, null) || novo());

// Semana de pagamento = 1ª semana do mês (pela "Semana" da folha, ou pela data se a semana estiver em branco).
// A semana vem impressa na folha CAIXA (lida pela foto da folha em branco). Semana 1 = semana de pagamento.
// Sem a semana, o app não adivinha pela data: devolve null.
function semanaPagamento(s) {
  const sem = String(s.semana || '').replace(/\D/g, '');
  return sem ? sem === '1' : null;
}
// Onde costuma depositar: na semana de pagamento vai para a empresa, nas outras para o banco.
const tipoDeposito = (s) => (semanaPagamento(s) ? 'empresa' : 'banco');


function calcular(s = st) {
  const c = {};
  c.vPep5 = arred(s.foiCobrar * 0.05);
  c.notas25 = soma(s.notas25);
  c.notas4050 = soma(s.notas4050);
  c.extras = soma(s.extras);
  c.antecipados = soma(s.antecipadas || []);
  c.pepinoParcial = soma(s.parciais || []);
  c.valorPepinos = arred((s.parciais || []).reduce((t, x) => t + numero(x.devendo), 0) + numero(s.pepinosOutros));
  c.valorDeixado = soma(s.feitas || []);
  c.recebimento = arred(c.notas25 + c.notas4050 + c.antecipados + c.extras + c.pepinoParcial);
  c.despVendedor = arred(DESPESAS.reduce((t, k) => t + (Number(s[k]) || 0), 0));
  c.pila = soma(s.pila);
  c.outros = soma(s.outros);
  c.obs = soma(s.obs);
  c.despesas = arred(c.despVendedor + c.pila + c.outros + c.obs);
  // O que sobra depois das despesas tem que ser depositado; os depósitos lançados vão abatendo.
  c.aDepositar = arred(c.recebimento - c.despesas);
  c.depositado = soma(s.depositos);
  c.falta = arred(c.aDepositar - c.depositado);
  const porOnde = (o) => soma(s.depositos.filter((d) => d.onde === o));
  c.depEspecie = porOnde('empresa');
  c.depBanco = porOnde('banco');
  c.depPix = porOnde('pix');
  return c;
}

function salvarAtual() { sincronizar(); ls.set(KEY_ATUAL, st); }

/* ---------- tela ---------- */
// A bolinha das notificações (☰) acompanha os lançamentos; só depois que a parte de notificações carregou.
var avisosProntos = false; // eslint-disable-line no-var
function pintarTotais() {
  sincronizar();
  if (avisosProntos) { pintarSino(); agendarDepois(); }
  const c = calcular();
  $$('[data-c]').forEach((el) => {
    const v = c[el.dataset.c];
    el.textContent = R$(v);
    if (el.dataset.c === 'falta') {
      el.classList.toggle('neg', v !== 0);
      el.classList.toggle('pos', v === 0 && c.aDepositar > 0);
    }
  });
  $$('[data-status]').forEach((el) => {
    el.textContent = c.aDepositar < 0 ? `As despesas passaram o recebimento em ${R$(-c.aDepositar)}`
      : c.falta > 0 ? `Falta depositar ${R$(c.falta)}`
        : c.falta < 0 ? `Depositou ${R$(-c.falta)} a mais`
          : c.aDepositar > 0 ? '✓ Tudo depositado' : '';
    el.className = 'status ' + (c.falta === 0 && c.aDepositar > 0 ? 'pos' : 'neg');
  });
  // Sugere onde depositar pela semana, até o vendedor escolher.
  if (!depOndeEscolhido) $$('input[name="depOnde"]').forEach((r) => { r.checked = r.value === tipoDeposito(st); });
  const pag = semanaPagamento(st);
  $('#depDica').textContent = pag === null
    ? 'Semana não identificada: tire a foto da folha em branco (aba Recebimento) ou preencha a Semana.'
    : pag ? `Semana ${st.semana}: semana de pagamento, normalmente o depósito é na empresa.`
      : `Semana ${st.semana}: normalmente o depósito é no banco/transferência.`;
  const d = st.data ? new Date(st.data + 'T12:00').toLocaleDateString('pt-BR') : '';
  // A data fica sempre inteira; se faltar espaço, quem encurta é o nome/cidade.
  const quem = [st.nome, st.cidade].filter(Boolean).join(' · ');
  $('#subtitulo').innerHTML = quem || d ? `<span class="sub__quem">${esc(quem)}</span>${d ? `<span class="sub__data">${quem ? ' · ' : ''}${esc(d)}</span>` : ''}`
    : 'Novo fechamento';
  $('#feitasTotal').textContent = st.feitas.length ? `Total da semana: ${numero(st.qtNotasDeixadas)} nota(s) · ${R$(c.valorDeixado)}` : '';
  pintarRelatorio();
}

function pintarCampos() {
  $$('[data-f]').forEach((el) => {
    const k = el.dataset.f;
    el.value = MONEY.includes(k) ? (st[k] ? brl(st[k]) : '') : (st[k] ?? '');
  });
}

// Os lançamentos ficam recolhidos para a tela ficar limpa: "Ver lançamentos" abre a lista.
const listasAbertas = new Set();
function botaoVer(nome, box) {
  let b = box.previousElementSibling;
  if (!b?.classList.contains('ver-lanc')) {
    b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn btn--ghost ver-lanc';
    b.addEventListener('click', () => {
      if (listasAbertas.has(nome)) listasAbertas.delete(nome); else listasAbertas.add(nome);
      pintarLista(nome);
    });
    box.before(b);
  }
  return b;
}
function abrirLista(nome) { listasAbertas.add(nome); }
// Lista comprida (mais de 3): um "Recolher" discreto no fim, para não ter que subir até o "Esconder".
function botaoRecolher(nome, box) {
  let b = box.nextElementSibling;
  if (!b?.classList.contains('recolher-lanc')) {
    b = document.createElement('button');
    b.type = 'button';
    b.className = 'recolher-lanc';
    b.textContent = '▴ Recolher';
    b.addEventListener('click', () => {
      listasAbertas.delete(nome);
      pintarLista(nome);
      mostrarNoMeio(box.closest('.card') || box.previousElementSibling);
    });
    box.after(b);
  }
  return b;
}

function atualizarVer(nome) {
  const box = $(`[data-lista="${nome}"]`);
  const n = st[nome].length;
  const aberta = listasAbertas.has(nome) || !!rascunhos[nome];
  const conferir = st[nome].filter((x) => x.conferir).length;
  const ver = botaoVer(nome, box);
  ver.hidden = !n;
  ver.setAttribute('aria-expanded', String(aberta));
  ver.textContent = (aberta ? `▴ Esconder lançamentos (${n})` : `▾ Ver lançamentos (${n})`)
    + (conferir ? ` · ⚠ ${conferir} para conferir` : '');
  box.hidden = !aberta || !n;
  botaoRecolher(nome, box).hidden = box.hidden || n <= 3 || !!rascunhos[nome];
}

// Lançamentos ficam travados: só mudam com "Editar" → "✓ Lançar". Sair da linha sem lançar desfaz o que foi digitado.
// Linha nova (+ Digitar) é um rascunho: só entra nas contas quando é lançada.
const rascunhos = {};
// Notas feitas editadas em outro dia: o que foi acrescentado vira um acréscimo daquele dia (o antigo não muda de dia).
const fmtDia = (iso) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : '');
function aplicarEdicao(nome, item, novo) {
  if (nome === 'feitas' && item.data && novo.data === item.data && item.data !== hoje()) {
    const d = { ab: numero(novo.ab) - numero(item.ab), rp: numero(novo.rp) - numero(item.rp), valor: arred(numero(novo.valor) - numero(item.valor)) };
    if (d.ab || d.rp || d.valor) (item.acrescimos ||= []).push({ data: hoje(), ...d });
  }
  Object.assign(item, novo);
}

function linhaLista(nome, item, modo) { // modo: 'travada' | 'editando' | 'rascunho'
  const cols = LISTAS[nome];
  const edita = modo !== 'travada';
  const rasc = { ...item };
  const row = document.createElement('div');
  row.className = 'item' + (item.conferir ? ' item--conferir' : '') + (cols.length === 2 ? ' item--2' : '') + (nome.startsWith('notas') ? ' item--nota' : '')
    + (nome === 'depositos' ? ' item--dep' : '') + (nome === 'feitas' ? ' item--feitas' : '') + (nome === 'parciais' ? ' item--parcial' : '')
    + (edita ? ' item--editando' : ' item--travada');
  const acr = (item.acrescimos || []).map((a) => `+ ${fmtDia(a.data)}: ${[a.ab ? `${a.ab} Ab` : '', a.rp ? `${a.rp} Rp` : '', a.valor ? R$(a.valor) : ''].filter(Boolean).join(' · ')}`);
  // Ab/Rp: no rascunho escolhe; depois de lançada a nota mostra só "1 Ab" (ou "1 Rp") e não muda mais.
  const tipoTxt = (x) => (x.tipo ? `1 ${x.tipo === 'rp' ? 'Rp' : 'Ab'}`
    : [numero(x.ab) ? `${numero(x.ab)} Ab` : '', numero(x.rp) ? `${numero(x.rp)} Rp` : ''].filter(Boolean).join(' · ') || (x.qtd ? `${x.qtd} nota(s)` : '—'));
  const campoTipo = (k) => (modo === 'rascunho'
    ? `<span class="tipo-sel" role="radiogroup">${['ab', 'rp'].map((t) => `<label class="tipo-op"><input type="radio" name="tipo-${item.id}" data-k="${k}" value="${t}" ${item.tipo === t ? 'checked' : ''}><span>${t === 'ab' ? 'Ab' : 'Rp'}</span></label>`).join('')}</span>`
    : `<span class="item__tipoTxt">${tipoTxt(item)}</span>`);
  row.innerHTML = cols.map(([k, rot, tipo]) => tipo === 'tipo' ? `<div class="item__${k}"><span class="item__rot">${rot}</span>${campoTipo(k)}</div>` : `
    <label class="item__${k}">${rot}
      ${tipo === 'select'
        ? `<select data-k="${k}" ${edita ? '' : 'disabled'}>${Object.entries(ONDE_CURTO).map(([v, t]) => `<option value="${v}" ${item[k] === v ? 'selected' : ''}>${t}</option>`).join('')}</select>`
        : `<input data-k="${k}" enterkeyhint="done" ${edita ? '' : 'readonly tabindex="-1"'} ${tipo === 'date' ? 'type="date"' : ''} ${K_DINHEIRO.includes(k) ? 'inputmode="decimal"' : ['qtd', 'ab', 'rp'].includes(k) ? 'inputmode="numeric"' : ''} ${k === 'devolucao' ? 'placeholder="0,00"' : ''} value="${esc(K_DINHEIRO.includes(k) ? (item[k] ? brl(item[k]) : '') : item[k] || '')}">`}
    </label>`).join('') +
    (modo === 'rascunho' ? '' : `<button class="item__del" aria-label="Apagar" title="Apagar">✕</button>`) +
    (modo === 'travada' ? `<button type="button" class="item__editar">Editar</button>` : '') +
    (edita ? `<div class="item__acoes"><button type="button" class="btn btn--primary item__ok">✓ Lançar</button>
      <button type="button" class="btn btn--ghost item__cancelar">${modo === 'rascunho' ? 'Descartar' : 'Cancelar'}</button></div>` : '') +
    (nome.startsWith('notas') && modo === 'travada' ? `<div class="item__extra">${item.faixa ? `<span class="tag">${esc(item.faixa)}%</span>` : ''}
      <button class="item__mover">↕ Mover para ${nome === 'notas25' ? '40% e 50%' : '25%'}</button></div>` : '') +
    (nome === 'parciais' ? `<span class="item__devendo">ficou devendo ${R$(item.devendo)}</span>` : '') +
    (acr.length ? `<p class="item__acr">Lançado em ${fmtDia(item.data)} · ${acr.join(' · ')}</p>` : '') +
    (edita && nome === 'feitas' && modo === 'editando' && item.data !== hoje()
      ? `<p class="item__dica">O valor que você acrescentar entra no relatório de hoje (${fmtDia(hoje())}).</p>` : '') +
    (item.nota ? `<p class="item__nota">⚠ ${esc(item.nota)}</p>` : '');

  const sair = () => pintarLista(nome);
  if (modo === 'travada') {
    row.querySelector('.item__editar').addEventListener('click', () => {
      const nova = linhaLista(nome, item, 'editando');
      row.replaceWith(nova); // o teclado só abre quando a pessoa toca no campo que quer mudar
    });
  } else {
    row.addEventListener('input', (e) => {
      const k = e.target.dataset.k;
      if (!k) return;
      rasc[k] = K_DINHEIRO.includes(k) ? numero(e.target.value) : e.target.value;
      if (k === 'tipo') { rasc.ab = rasc.tipo === 'ab' ? 1 : 0; rasc.rp = rasc.tipo === 'rp' ? 1 : 0; }
      if (nome === 'parciais' && rasc.valorNota) {
        rasc.devendo = devendoCalculado(rasc);
        row.querySelector('.item__devendo').textContent = `ficou devendo ${R$(rasc.devendo)}`;
      }
    });
    row.addEventListener('change', (e) => {
      const k = e.target.dataset.k;
      if (k && K_DINHEIRO.includes(k)) e.target.value = rasc[k] ? brl(rasc[k]) : '';
    });
    const lancar = () => {
      if (nome === 'feitas' && modo === 'rascunho' && !rasc.tipo) { toast('Escolha Ab ou Rp.'); return; }
      document.activeElement?.blur();
      rasc.conferir = false;
      if (modo === 'rascunho') { st[nome].push(rasc); delete rascunhos[nome]; } else aplicarEdicao(nome, item, rasc);
      salvarAtual(); pintarLista(nome); pintarTotais();
      toast(rasc.valor ? `Lançado: ${R$(rasc.valor)} ✓` : 'Lançado ✓');
    };
    const acoes = row.querySelectorAll('.item__ok, .item__cancelar');
    // Sem isso, o toque no botão tira o foco do campo antes do clique.
    acoes.forEach((b) => b.addEventListener('pointerdown', (e) => e.preventDefault()));
    row.querySelector('.item__ok').addEventListener('click', lancar);
    row.querySelector('.item__cancelar').addEventListener('click', () => { if (modo === 'rascunho') delete rascunhos[nome]; sair(); });
    // Enter no último campo lança.
    row.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); lancar(); } });
    // Saiu da linha sem lançar: o que foi digitado some (a linha volta como estava).
    if (modo === 'editando') {
      row.addEventListener('focusout', () => setTimeout(() => {
        if (row.isConnected && !row.contains(document.activeElement)) sair();
      }, 150));
    }
  }
  row.querySelector('.item__mover')?.addEventListener('click', () => {
    const outra = nome === 'notas25' ? 'notas4050' : 'notas25';
    st[nome].splice(st[nome].indexOf(item), 1);
    st[outra].push({ ...item, faixa: outra === 'notas25' ? '25' : (item.faixa === '50' ? '50' : '40') });
    salvarAtual(); pintarLista(nome); pintarLista(outra); pintarTotais();
  });
  row.querySelector('.item__del')?.addEventListener('click', async () => {
    if (!(await perguntarRemover(descreverItem(nome, item)))) return;
    const pos = st[nome].indexOf(item);
    if (pos < 0) return;
    st[nome].splice(pos, 1);
    salvarAtual(); pintarLista(nome); pintarTotais();
    oferecerDesfazer('Lançamento removido', () => {
      st[nome].splice(Math.min(pos, st[nome].length), 0, item);
      abrirLista(nome);
      salvarAtual(); pintarLista(nome); pintarTotais();
    });
  });
  return row;
}

function pintarLista(nome) {
  const box = $(`[data-lista="${nome}"]`);
  const n = st[nome].length + (rascunhos[nome] ? 1 : 0);
  const aberta = listasAbertas.has(nome) || !!rascunhos[nome];
  atualizarVer(nome);
  box.hidden = !aberta || !n;
  box.innerHTML = '';
  if (!n || !aberta) return;
  st[nome].forEach((item) => box.appendChild(linhaLista(nome, item, 'travada')));
  if (rascunhos[nome]) box.appendChild(linhaLista(nome, rascunhos[nome], 'rascunho'));
}

// Remover um lançamento: pergunta antes e, depois, deixa desfazer por 3 segundos.
const NOME_LISTA = { notas25: 'Nota 25%', notas4050: 'Nota 40% e 50%', extras: 'Pepino extra', antecipadas: 'Nota antecipada',
  parciais: 'Pepino parcial', feitas: 'Notas feitas', pila: 'Despesa do Pila', outros: 'Outros', obs: 'OBS', depositos: 'Depósito' };
function descreverItem(nome, item) {
  const v = Number(nome === 'parciais' ? item.valorNota : item.valor) || 0;
  const quem = item.cliente || item.vendedora || item.tipo || item.desc || '';
  return [NOME_LISTA[nome] || 'Lançamento', quem, v ? R$(v) : ''].filter(Boolean).join(' · ');
}
function perguntarRemover(texto) {
  const d = $('#dlgRemover');
  $('#removerTxt').textContent = texto;
  d.returnValue = '';
  d.showModal();
  return new Promise((ok) => d.addEventListener('close', () => ok(d.returnValue === 'sim'), { once: true }));
}
let desfazerAcao = null, desfazerTimer = null;
function oferecerDesfazer(texto, acao) {
  const s = $('#desfazer');
  $('#desfazerTxt').textContent = texto;
  desfazerAcao = acao;
  $('#toast').classList.remove('show');
  s.classList.remove('show'); void s.offsetWidth; s.classList.add('show'); // reinicia a barrinha de 3 s
  clearTimeout(desfazerTimer);
  desfazerTimer = setTimeout(() => { s.classList.remove('show'); desfazerAcao = null; }, 3000);
}
$('#btnDesfazer').addEventListener('click', () => {
  clearTimeout(desfazerTimer);
  $('#desfazer').classList.remove('show');
  const acao = desfazerAcao; desfazerAcao = null;
  if (acao) { acao(); toast('Lançamento de volta ✓'); }
});

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function pintarTudo() {
  depOndeEscolhido = false;
  pintarCampos();
  pintarCamposRel();
  Object.keys(LISTAS).forEach(pintarLista);
  pintarTotais();
}

/* ---------- eventos dos campos ---------- */
// Data da folha mudou: o pepino extra é recalculado pela nova semana (só os pagamentos de segunda a domingo).
function recalcularPepinos() {
  const { ini, fim } = semanaDe(st.data);
  st.extras.forEach((x) => {
    if (x.pagamentos?.length) x.valor = arred(x.pagamentos.filter((p) => p.data >= ini && p.data <= fim).reduce((t, p) => t + p.valor, 0));
  });
  pintarLista('extras');
}

$$('[data-f]').forEach((el) => {
  el.addEventListener('input', () => {
    const k = el.dataset.f;
    st[k] = MONEY.includes(k) ? numero(el.value) : el.value;
    if (k === 'data') { st.dataManualEm = hoje(); recalcularPepinos(); } // mudou à mão: vale só por hoje
    salvarAtual(); pintarTotais();
  });
  if (el.hasAttribute('data-money')) {
    el.addEventListener('blur', () => { el.value = st[el.dataset.f] ? brl(st[el.dataset.f]) : ''; });
  }
});

$$('[data-pila]').forEach((b) => b.addEventListener('click', () => {
  rascunhos.pila = { id: uid(), tipo: b.dataset.pila, valor: 0 };
  abrirLista('pila');
  pintarLista('pila');
  const rows = $$('[data-lista="pila"] .item');
  const ultima = rows[rows.length - 1];
  if (ultima) mostrarNoMeio(ultima); // sem abrir o teclado sozinho
}));

// Depósito só entra quando o vendedor lança: onde + valor + data. Nada é lançado sozinho.
$$('input[name="depOnde"]').forEach((r) => r.addEventListener('change', () => { depOndeEscolhido = true; }));
$('#depData').value = hoje();
$('#btnLancarDep').addEventListener('click', () => {
  const valor = numero($('#depValor').value);
  if (!(valor > 0)) { toast('Digite o valor que você depositou.'); return; }
  const onde = $('input[name="depOnde"]:checked')?.value || tipoDeposito(st);
  st.depositos.push({ id: uid(), data: $('#depData').value || hoje(), onde, valor });
  $('#depValor').value = '';
  salvarAtual(); pintarLista('depositos'); pintarTotais();
  const { falta } = calcular();
  toast(`Depósito de ${R$(valor)} lançado (${ONDE_CURTO[onde]}).` + (falta > 0 ? ` Falta depositar ${R$(falta)}.` : falta === 0 ? ' Tudo depositado ✓' : ` Passou ${R$(-falta)}.`));
});

/* ---------- abas ---------- */
// Cada aba lembra onde parou: ao voltar para ela, a tela fica no mesmo lugar (também depois de atualizar).
let abaAtual = null;
const posicoes = (() => { try { return JSON.parse(sessionStorage.getItem('caixa.posicoes')) || {}; } catch { return {}; } })();
function guardarPosicao() {
  if (!abaAtual) return;
  posicoes[abaAtual] = scrollY;
  try { sessionStorage.setItem('caixa.posicoes', JSON.stringify(posicoes)); } catch {}
}
function abrirAba(nome) {
  if (nome === abaAtual) return;
  guardarPosicao();
  $$('[data-tab]').forEach((el) => { el.hidden = el.dataset.tab !== nome; });
  $$('[data-tabbtn]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tabbtn === nome)));
  try { sessionStorage.setItem('caixa.aba', nome); } catch {}
  abaAtual = nome;
  scrollTo({ top: posicoes[nome] || 0 });
}
$$('[data-tabbtn]').forEach((b) => b.addEventListener('click', () => abrirAba(b.dataset.tabbtn)));
// Botões que levam a outra aba ("Próximo", "Lançar pepino parcial ›"): a tela desliza para o lado até a aba e,
// se o botão aponta um quadro (data-alvo), desce suave até ele, sem selecionar campo nenhum.
const ORDEM_ABAS = ['receb', 'desp', 'dep', 'rel'];
function deslizarPara(aba, depois, { doTopo = false } = {}) {
  const m = $('main');
  const lado = ORDEM_ABAS.indexOf(aba) >= ORDEM_ABAS.indexOf(abaAtual) ? 1 : -1;
  const trocar = () => { abrirAba(aba); if (doTopo) scrollTo({ top: 0 }); }; // com quadro-alvo, desce a partir do topo
  if (!m.animate || matchMedia('(prefers-reduced-motion: reduce)').matches) { trocar(); depois?.(); return; }
  m.animate([{ transform: 'none', opacity: 1 }, { transform: `translateX(${-lado * 70}px)`, opacity: 0 }],
    { duration: 170, easing: 'ease-in' }).onfinish = () => {
    trocar();
    m.animate([{ transform: `translateX(${lado * 70}px)`, opacity: 0 }, { transform: 'none', opacity: 1 }],
      { duration: 230, easing: 'ease-out' }).onfinish = () => depois?.();
  };
}
$$('[data-ir]').forEach((b) => b.addEventListener('click', () => {
  document.activeElement?.blur();
  const alvo = b.dataset.alvo && document.getElementById(b.dataset.alvo);
  deslizarPara(b.dataset.ir, alvo ? () => {
    const topo = $('.topo')?.getBoundingClientRect().bottom || 0;
    scrollTo({ top: alvo.getBoundingClientRect().top + scrollY - topo - 12, behavior: 'smooth' });
  } : null, { doTopo: !!alvo });
}));

$$('[data-add]').forEach((b) => b.addEventListener('click', () => {
  const nome = b.dataset.add;
  abrirLista(nome); // a linha nova aparece aberta para digitar
  rascunhos[nome] = nome === 'feitas' ? { id: uid(), data: hoje(), tipo: '', ab: 0, rp: 0, valor: 0 }
    : { id: uid(), dia: hoje(), valor: 0, cidade: nome.startsWith('notas') || nome === 'extras' ? st.cidade : undefined };
  pintarLista(nome);
  const rows = $$(`[data-lista="${nome}"] .item`);
  const ultima = rows[rows.length - 1];
  // A tela desce suave até o bloco novo no meio da tela; o teclado só abre quando a pessoa toca num campo.
  if (ultima) mostrarNoMeio(ultima);
}));
// Rola a tela para o elemento ficar no meio da parte visível (entre o topo fixo e a barra de totais).
function mostrarNoMeio(el) {
  const topo = $('.topo')?.getBoundingClientRect().bottom || 0;
  const base = innerHeight - ($('.bar')?.offsetHeight || 0);
  const r = el.getBoundingClientRect();
  const livre = base - topo;
  const alvo = r.height < livre ? r.top - topo - (livre - r.height) / 2 : r.top - topo - 12;
  scrollTo({ top: scrollY + alvo, behavior: 'smooth' });
}

/* ---------- janelas ---------- */
// Com uma janela aberta (☰, ⚙, notificações, meta, folha…), a página de trás fica parada.
const travarFundo = () => document.documentElement.classList.toggle('com-janela', !!document.querySelector('dialog[open]'));
new MutationObserver(travarFundo).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'] });

/* ---------- teclado do celular ---------- */
// Enquanto digita: esconde a barra de totais de baixo (ela sobe junto com o teclado e tampa o campo)
// e deixa o campo no meio da tela, logo acima do teclado. "Concluído/Enter" do teclado confirma o campo.
// Só campos que abrem o teclado: data, hora e listas abrem um seletor do Android, e com eles o app não pode
// esconder a barra nem deixar o espaço do teclado (o "voltar" fecha o seletor e o espaço ficava sobrando).
const ehCampo = (el) => el && !el.readOnly && el.matches?.('input:not([type="radio"]):not([type="checkbox"]):not([type="file"])'
  + ':not([type="date"]):not([type="time"]):not([type="datetime-local"]):not([type="month"]):not([type="week"])'
  + ':not([type="color"]):not([type="range"]), textarea');
// Num lançamento aberto (linha nova ou em edição), centraliza a linha inteira na parte visível, entre o topo fixo
// e o teclado, para não ficar cortada; se ela não couber, centraliza só o campo.
function centralizar() {
  const el = document.activeElement;
  if (!ehCampo(el)) return;
  const linha = el.closest('.item--editando');
  const vv = window.visualViewport;
  const altura = vv ? vv.height : innerHeight;
  const topo = $('.topo')?.getBoundingClientRect().bottom || 0;
  const livre = altura - topo;
  if (linha && linha.offsetHeight + 16 <= livre) {
    const r = linha.getBoundingClientRect();
    scrollTo({ top: r.top + scrollY - topo - (livre - r.height) / 2, behavior: 'smooth' });
    return;
  }
  el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
}
document.addEventListener('focusin', (e) => {
  if (!ehCampo(e.target)) return;
  document.documentElement.classList.add('digitando');
  setTimeout(centralizar, 350); // espera o teclado abrir
});
document.addEventListener('focusout', () => {
  setTimeout(() => { if (!ehCampo(document.activeElement)) document.documentElement.classList.remove('digitando'); }, 100);
});
// O "voltar" do Android fecha o teclado mas deixa o campo selecionado: quando a tela volta ao tamanho cheio,
// solta o campo para sumir o espaço do teclado e voltar a barra de totais.
let alturaCheia = window.visualViewport?.height || innerHeight, tecladoAberto = false;
function vigiarTeclado() {
  const vv = window.visualViewport;
  if (!vv) return;
  alturaCheia = Math.max(alturaCheia, vv.height, innerHeight);
  const aberto = vv.height < alturaCheia * 0.8;
  if (tecladoAberto && !aberto && ehCampo(document.activeElement) && document.activeElement.tagName !== 'SELECT') {
    document.activeElement.blur();
  }
  tecladoAberto = aberto;
  if (aberto) setTimeout(centralizar, 50);
}
window.visualViewport?.addEventListener('resize', vigiarTeclado);
addEventListener('orientationchange', () => { alturaCheia = 0; tecladoAberto = false; });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && ehCampo(e.target) && e.target.tagName === 'INPUT') {
    e.preventDefault();
    e.target.blur();
  }
});

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
  required: ['numero', 'cliente', 'cidade', 'faixa', 'valor', 'valor_total', 'devolucao', 'duvida'],
  properties: {
    numero: { type: 'string', description: 'Número da nota, como está escrito' },
    faixa: { type: 'string', enum: ['25', '40', '50', ''], description: 'Faixa em que a nota foi paga, como está marcado na nota; vazio se não der para ver' },
    cliente: { type: 'string', description: 'Nome da cliente / compradora' },
    cidade: { type: 'string' },
    valor: { type: 'number', description: 'Valor pago/quitado, em reais' },
    valor_total: { type: 'number', description: 'Valor total da nota, se aparecer; senão 0' },
    devolucao: { type: 'number', description: 'TOTAL DE DEVOLUCOES da nota, se aparecer; senão 0' },
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

// Pepino extra (nota impressa): a IA devolve também cada pagamento com a data; o app soma só os da semana.
const ITEM_PEPINO = {
  type: 'object', additionalProperties: false,
  required: ['numero', 'cidade', 'valor', 'vendedora', 'pagamentos', 'duvida'],
  properties: {
    numero: { type: 'string' }, cidade: { type: 'string' },
    valor: { type: 'number', description: '"Recebi o valor de R$…" se aparecer; senão 0' },
    vendedora: { type: 'string', description: 'Nome da cliente (linha antes do CPF)' },
    pagamentos: {
      type: 'array', description: 'Cada linha da seção PAGAMENTOS',
      items: {
        type: 'object', additionalProperties: false, required: ['data', 'valor'],
        properties: { data: { type: 'string', description: 'AAAA-MM-DD' }, valor: { type: 'number' } },
      },
    },
    duvida: { type: 'string' },
  },
};
const SCHEMA_EXTRAS = {
  type: 'object', additionalProperties: false, required: ['itens'],
  properties: { itens: { type: 'array', items: ITEM_PEPINO } },
};

const linhaDesc = {
  type: 'object', additionalProperties: false, required: ['desc', 'valor'],
  properties: { desc: { type: 'string' }, valor: { type: 'number' } },
};
const SCHEMA_FOLHA = {
  type: 'object', additionalProperties: false,
  required: ['cidade', 'nome', 'data', 'semana', 'foiCobrar', 'vPep5', 'qtNotas', 'qtNotasDeixadas', 'pinos', 'antecipados',
    'valorPepinos', 'pepinoParcial', 'notas25', 'notas4050', 'depEspecie', 'depPix', 'depBanco', 'vale', 'ajuda', 'salario',
    'mecanica', 'despSupervisor', 'excedido', 'outros', 'obs', 'extras', 'valorDeixado', 'assinatura', 'duvidas'],
  properties: {
    cidade: { type: 'string' }, nome: { type: 'string' },
    data: { type: 'string', description: 'Data no formato AAAA-MM-DD, ou vazio' },
    semana: { type: 'string' }, foiCobrar: { type: 'number' },
    vPep5: { type: 'number', description: 'Valor impresso em V. PEP. 5%, só para conferir; 0 se não tiver' },
    qtNotas: { type: 'string' },
    qtNotasDeixadas: { type: 'string' }, pinos: { type: 'string' },
    antecipados: { type: 'number' }, valorPepinos: { type: 'number' }, pepinoParcial: { type: 'number' },
    notas25: { type: 'number', description: 'Total escrito no campo NOTAS 25%' },
    notas4050: { type: 'number', description: 'Total escrito no campo NOTAS 40% e 50%' },
    depEspecie: { type: 'number' }, depPix: { type: 'number' }, depBanco: { type: 'number' }, salario: { type: 'number', description: 'Salário do vendedor; 0 se não tiver' },
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
    texto: `As fotos são de notas (cupons impressos em impressora térmica) que a empresa entrega às clientes.
Cada nota tem: no topo "N. 117613" (esse é o número da nota; o número grande embaixo dele e o código de barras NÃO são),
Representante, DATA DO ACERTO, nome da cliente (linha antes do CPF), endereço, "Cidade:XXX UF:AC", os itens,
"TOTAL R$616,00" (total da nota), às vezes DEVOLUCOES ou COMISSAO ("TOTAL DE COMISSAO R$308,00"), PAGAMENTOS
("Total de pagamentos:616,00") e no final "Recebi o valor de R$616,00" seguido de:
- "Nota quitada com 25% de desconto…" → faixa "25";
- "Nota quitada." sem porcentagem → faixa "50" se a comissão for metade do TOTAL, "40" se for 40% do TOTAL
  (sem comissão visível, use "40");
- se não der para ver o final, faixa vazia.
Em "valor" coloque o valor RECEBIDO ("Recebi o valor de R$…" ou "Total de pagamentos"), não o TOTAL; o TOTAL vai em
"valor_total"; o "TOTAL DE DEVOLUCOES" (se houver) vai em "devolucao". Liste cada nota que aparece (uma foto pode ter várias; não repita a mesma nota). Para cada uma: número,
cliente, cidade (como está escrita, ex.: RIO BRANCO, PORTO ACRE, CZS, BRASILEIA), faixa, valor, valor_total e devolucao.`,
  },
  extras: {
    schema: SCHEMA_EXTRAS,
    texto: `As fotos são de "pepino extra": notas impressas (cupom térmico) iguais às outras notas da empresa.
Cada foto pode ser só o TOPO da nota (com "N. 117613", nome da cliente antes do CPF, "Cidade:XXX UF"), só o FINAL
(seção PAGAMENTOS com linhas "DD/MM/AA valor", "Total de pagamentos", "Recebi o valor de R$…") ou a nota inteira.
Para cada foto devolva um item: número, cidade, nome da cliente em "vendedora", "valor" = "Recebi o valor" (0 se não
aparecer) e em "pagamentos" cada linha de pagamento com a data (AAAA-MM-DD) e o valor. Campo que não aparece na foto
fica vazio/0/lista vazia. A impressora usa zero cortado (Ø): "88/10/26" é 08/10/2026 e "616,08" é 616,00.`,
  },
  folha: {
    schema: SCHEMA_FOLHA,
    texto: `A foto é uma folha "CAIXA" de fechamento (pode estar em branco ou preenchida à mão; a foto pode estar de lado
ou de cabeça para baixo, leia na orientação certa). Campos da folha:
CIDADE, NOME, DATA, SEMANA, FOI COBRAR R$ (foiCobrar), QT. DE NOTAS (qtNotas), ANTECIPADOS R$, V. PEP. 5% (vPep5),
QT. NOTAS DEIXADAS, Nº DE PINOS, VALOR DOS PEPINOS, PEPINO PARCIAL, PEPINO EXTRA (ignore o total, é calculado),
NOTAS 25% (notas25), NOTAS 40% e 50% (notas4050), RECEBIMENTO (ignore, é calculado), DEPTO. EMPRESA ESPÉCIE (depEspecie),
DEPTO PIX (depPix), DEPTO BANCO/TED/TRANS. (depBanco), VALE ADIANTADO (vale), AJUDA DE CUSTO (ajuda), MECÂNICA,
DESPESAS SUPERVISOR, EXCEDIDO DA DESPESA (excedido), OUTROS e OBS (cada linha escrita vira {desc, valor}; se o valor
estiver entre parênteses, ele é o valor da linha; uma linha de salário do vendedor vai para "salario", não para outros),
VALOR DEIXADO, ASSINATURA VENDEDOR.
À direita há blocos "VENDEDORA:" com colunas Nº, CIDADE, VALOR — são os pepinos extras: cada bloco preenchido vira um item
de "extras" (vendedora = nome escrito depois de VENDEDORA:).
A folha "em branco" já vem com o cabeçalho IMPRESSO (CIDADE, NOME, DATA, SEMANA, FOI COBRAR, QT. DE NOTAS): leia sempre
esses campos impressos, principalmente a SEMANA (só o número). Os campos sem nada escrito ficam vazios/0.`,
  },
};

async function lerFotos(tipo, files) {
  const modo = modoLeitura();
  if (modo === 'gratis') { await lerFotosGratis(tipo, files); return; }
  const api = getCliente();
  if (!api) {
    toast('Para usar a IA, cole a chave em ⚙ (ou volte para a leitura gratuita).');
    abrirConfig();
    return;
  }
  const pedido = PEDIDOS[tipo === 'notas' ? 'notas' : tipo];
  carregando(true);
  progressoSimulado(files.length > 1 ? `A IA está lendo ${files.length} fotos…` : 'A IA está lendo a foto…');
  try {
    const imagens = await Promise.all(files.slice(0, 20).map(prepararFoto));
    const pedidoIA = {
      model: MODOS[modo].modelo,
      max_tokens: 16000,
      output_config: { effort: 'medium', format: { type: 'json_schema', schema: pedido.schema } },
      system: CONTEXTO,
      messages: [{
        role: 'user',
        content: [
          ...imagens.map((data) => ({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data } })),
          { type: 'text', text: pedido.texto },
        ],
      }],
    };
    // Na IA mais precisa, se ela recusar por engano, a própria Anthropic refaz com outro modelo.
    const resp = modo === 'precisa'
      ? await api.beta.messages.create({ ...pedidoIA, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' })
      : await api.messages.create(pedidoIA);
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

/* ---------- leitura gratuita (no celular) ---------- */
const FOLHA_VAZIA = {
  cidade: '', nome: '', data: '', semana: '', foiCobrar: 0, vPep5: 0, qtNotas: '', qtNotasDeixadas: '', pinos: '',
  antecipados: 0, valorPepinos: 0, pepinoParcial: 0, notas25: 0, notas4050: 0, depEspecie: 0, depPix: 0, depBanco: 0,
  vale: 0, ajuda: 0, salario: 0, mecanica: 0, despSupervisor: 0, excedido: 0, outros: [], obs: [], extras: [],
  valorDeixado: 0, assinatura: '', duvidas: '',
};

async function lerFotosGratis(tipo, files) {
  // Porcentagem geral: foto i de n (e, na folha, tentativa t de T) somadas ao progresso da leitura atual.
  const passo = (txt, i = 0, n = 1) => (m) => {
    if (m.status === 'recognizing text') {
      const t = m.total > 1 ? (m.tentativa - 1 + m.progress) / m.total : m.progress;
      progresso({ titulo: txt + (m.tentativa > 1 ? ` (tentativa ${m.tentativa} de ${m.total})` : ''), pct: (i + t) / n, etapa: i });
    } else if (/load|initializ/.test(m.status)) progresso({ titulo: 'Preparando o leitor… (na 1ª vez baixa uns arquivos)' });
  };
  const nome = tipo === 'folha' ? null : tipo === 'extras' ? 'Foto' : 'Nota';
  carregando(true, 'Preparando o leitor…', { etapas: nome ? files.map((_, i) => `${nome} ${i + 1}`) : [] });
  try {
    if (tipo === 'folha') {
      const r = await lerFolhaGratis(files[0], passo('Lendo a folha…'));
      if (!r.achados) { mostrarDiagnostico('a folha'); return; }
      // Folha preenchida à mão não sai na leitura gratuita: só o cabeçalho impresso.
      aplicarFolha({ ...FOLHA_VAZIA, ...r, cidade: r.cidade || '', duvidas: r.achados < 6 ? 'confira os campos do cabeçalho.' : '' });
      salvarAtual(); pintarTotais();
      return;
    }
    if (tipo === 'extras') {
      const msgs = [];
      for (let i = 0; i < files.length; i++) {
        const rot = files.length > 1 ? `Lendo foto ${i + 1} de ${files.length}…` : 'Lendo o pepino extra…';
        msgs.push(aplicarPepino(await lerPepinoGratis(files[i], passo(rot, i, files.length), semanaDe(st.data))));
      }
      toast(msgs.join(' '));
      return;
    }
    let n25 = 0, n4050 = 0, duvidas = 0;
    for (let i = 0; i < files.length; i++) {
      const rot = files.length > 1 ? `Lendo nota ${i + 1} de ${files.length}…` : 'Lendo a nota…';
      const n = await lerNotaGratis(files[i], passo(rot, i, files.length));
      const destino = n.faixa === '40' || n.faixa === '50' ? 'notas4050' : 'notas25';
      destino === 'notas25' ? n25++ : n4050++;
      if (n.faltou.length) duvidas++;
      st[destino].push({
        id: uid(), numero: n.numero, cliente: n.cliente, cidade: n.cidade || st.cidade, valor: n.valor,
        total: n.total || 0, devolucao: n.devolucao || 0, dia: hoje(),
        // Da nota só importam o valor recebido e a faixa: fica amarela só quando um dos dois está em dúvida.
        faixa: n.faixa, conferir: n.faltou.length > 0,
        nota: n.faltou.length ? 'Confira: ' + n.faltou.join(', ') : '',
      });
      pintarLista(destino);
      salvarAtual(); pintarTotais();
    }
    toast(`${files.length} nota(s) lida(s): ${n25} em 25%, ${n4050} em 40/50%.` + (duvidas ? ` ${duvidas} em amarelo para conferir.` : ''));
  } catch (e) {
    console.error(e);
    toast(e.message || 'Não deu para ler a foto.');
  } finally {
    carregando(false);
  }
}

// Quando a leitura gratuita não acha nada: mostra o que o leitor enxergou (para o vendedor mandar print).
function mostrarDiagnostico(oque) {
  const u = ultimaLeitura();
  $('#diagTitulo').textContent = `Não consegui ler ${oque}`;
  $('#diagImg').src = u ? u.canvas.toDataURL('image/jpeg', 0.6) : '';
  $('#diagImg').hidden = !u;
  $('#diagTexto').textContent = u ? (u.texto.trim() || '(nenhum texto)').slice(0, 1200) : '';
  $('#dlgDiag').showModal();
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
        total: arred(n.valor_total || 0), devolucao: arred(n.devolucao || 0), dia: hoje(), faixa: n.faixa, conferir: true,
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
    const msgs = r.itens.map((n) => aplicarPepino({
      numero: n.numero, cliente: n.vendedora, cidade: n.cidade, recebi: n.valor,
      pagamentos: n.pagamentos || [], topo: !!(n.numero || n.vendedora || n.cidade), fim: !!(n.pagamentos?.length || n.valor),
    }));
    toast(msgs.length ? msgs.join(' ') : 'Nada encontrado na foto.');
  } else if (tipo === 'folha') {
    aplicarFolha(r);
  }
  salvarAtual(); pintarTotais();
}

/* ---------- pepino extra: 2 fotos (topo + final) e só o que foi pago na semana ---------- */
const dataBR = (iso) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : '');

// Recebe a leitura de uma foto (topo, final ou a nota inteira) e junta na nota certa:
// foto do topo cria a nota (nº, cidade, cliente) esperando o final; foto do final completa a última nota que espera.
function aplicarPepino(r) {
  const semana = semanaDe(st.data);
  let item = null, msg = '';
  if (r.fim && !r.topo) item = [...st.extras].reverse().find((x) => x.esperaFinal);
  if (!item) {
    item = { id: uid(), dia: hoje(), numero: '', cidade: '', vendedora: '', valor: 0, conferir: true };
    st.extras.push(item);
  }
  if (r.topo) {
    item.temTopo = true;
    item.numero = item.numero || r.numero;
    item.vendedora = item.vendedora || r.cliente;
    if (!item.cidade) { item.cidade = r.cidade || st.cidade; item.cidadeDaFolha = !r.cidade; }
  }
  if (r.fim) {
    item.esperaFinal = false;
    const pagos = r.pagamentos || [];
    const daSemana = pagos.filter((p) => p.data >= semana.ini && p.data <= semana.fim);
    const fora = pagos.filter((p) => !daSemana.includes(p));
    item.pagamentos = pagos;
    item.valor = arred(daSemana.reduce((t, p) => t + p.valor, 0));
    const avisos = [];
    if (!pagos.length && r.recebi) {
      item.valor = arred(r.recebi);
      avisos.push('não li as datas dos pagamentos: usei o "Recebi o valor", confira se é tudo desta semana');
    }
    if (fora.length) avisos.push('fora desta semana, não lançado: ' + fora.map((p) => `${dataBR(p.data)} ${R$(p.valor)}`).join(', '));
    pagos.filter((p) => p.lida).forEach((p) => avisos.push(`data lida "${p.lida}", considerei ${dataBR(p.data)}`));
    if (!item.valor && !avisos.length) avisos.push('nenhum valor lido');
    if (!item.temTopo) avisos.push('falta a foto do topo (nº, cidade e cliente)');
    else {
      const falta = [!item.numero && 'número', !item.vendedora && 'cliente'].filter(Boolean);
      if (falta.length) avisos.push(`não li ${falta.join(' e ')} no topo: digite`);
      if (item.cidadeDaFolha) avisos.push('cidade não lida, usei a da folha');
    }
    item.nota = avisos.join(' · ');
    item.conferir = avisos.length > 0;
    msg = `Pepino${item.numero ? ` nº ${item.numero}` : ''}${item.vendedora ? ` (${item.vendedora})` : ''}: ${R$(item.valor)} desta semana.` + (fora.length ? ` ${fora.length} pagamento(s) de outra semana ficaram de fora.` : '');
  } else {
    item.esperaFinal = true;
    item.conferir = true;
    item.nota = 'falta a foto do final (pagamentos)';
    msg = `Topo lido${item.numero ? ` (nº ${item.numero})` : ''}${item.vendedora ? `: ${item.vendedora}` : ''}. Agora tire a foto do FINAL da nota.`;
  }
  salvarAtual(); pintarLista('extras'); pintarTotais();
  return msg;
}

const itemExtra = (n) => ({
  id: uid(), dia: hoje(), numero: n.numero, cidade: n.cidade, valor: arred(n.valor), vendedora: n.vendedora,
  conferir: true, nota: n.duvida,
});

const soDigitos = (v) => String(v || '').replace(/\D/g, '');
// Tem algo lançado além do cabeçalho impresso?
const temLancamentos = (f) => Object.keys(LISTAS).some((k) => f[k]?.length)
  || MONEY.some((k) => k !== 'foiCobrar' && Number(f[k]) > 0);

function aplicarFolha(r) {
  const temAlgo = Object.entries(r).some(([k, v]) => k !== 'duvidas' && (Array.isArray(v) ? v.length : v));
  if (!temAlgo) {
    toast('Não achei nada na folha. Tente uma foto mais nítida, com a folha inteira.');
    return;
  }
  // Folha de outra semana: guarda o fechamento atual e começa um novo, para não misturar as semanas.
  const outraSemana = (r.semana && st.semana && soDigitos(r.semana) !== soDigitos(st.semana))
    || (/^\d{4}-\d{2}-\d{2}$/.test(r.data) && st.data && r.data !== st.data && soDigitos(r.semana) !== soDigitos(st.semana));
  let aviso = '';
  if (outraSemana) {
    if (temLancamentos(st)) {
      guardar(st);
      aviso = ` O fechamento da semana ${st.semana || 'anterior'} foi salvo em ☰.`;
    }
    st = novo();
  }
  ['cidade', 'nome', 'semana', 'qtNotas', 'qtNotasDeixadas', 'pinos', 'assinatura'].forEach((k) => { if (r[k]) st[k] = r[k]; });
  if (/^\d{4}-\d{2}-\d{2}$/.test(r.data)) st.data = r.data;
  MONEY.forEach((k) => { if (r[k]) st[k] = arred(r[k]); });
  if (r.valorPepinos) st.pepinosOutros = arred(r.valorPepinos); // o valor escrito na folha entra como "outros pepinos"

  const deps = [['empresa', r.depEspecie], ['banco', r.depBanco], ['pix', r.depPix]].filter(([, v]) => v > 0);
  if (deps.length) st.depositos = deps.map(([onde, v]) => ({ id: uid(), data: st.data || hoje(), onde, valor: arred(v), conferir: true }));
  // Na folha só aparece o total das notas; vira uma linha "total da folha" que pode ser trocada pelas notas uma a uma.
  [['notas25', r.notas25], ['notas4050', r.notas4050]].forEach(([k, v]) => {
    if (v) st[k] = [{ id: uid(), numero: '', cliente: 'Total escrito na folha', cidade: st.cidade, valor: arred(v), conferir: true }];
  });
  if (r.extras.length) st.extras = r.extras.map(itemExtra);
  if (r.pepinoParcial) st.parciais = [{ id: uid(), dia: st.data || hoje(), cliente: 'Escrito na folha', valor: arred(r.pepinoParcial), conferir: true }];
  if (r.antecipados) st.antecipadas = [{ id: uid(), dia: st.data || hoje(), cliente: 'Escrito na folha', valor: arred(r.antecipados), conferir: true }];
  if (r.valorDeixado || numero(r.qtNotasDeixadas)) {
    st.feitas = [{ id: uid(), data: st.data || hoje(), qtd: String(r.qtNotasDeixadas || ''), valor: arred(r.valorDeixado), conferir: true }];
  }
  if (r.outros.length) st.outros = r.outros.map((o) => ({ id: uid(), desc: o.desc, valor: arred(o.valor), conferir: true }));
  if (r.obs.length) st.obs = r.obs.map((o) => ({ id: uid(), desc: o.desc, valor: arred(o.valor), conferir: true }));
  pintarTudo();
  const pag = semanaPagamento(st);
  const sem = pag === null ? ' Não achei a semana, preencha à mão.'
    : ` Semana ${st.semana}${pag ? ' (semana de pagamento)' : ''}.`;
  // Confere o "foi cobrar" com o V. PEP. 5% impresso: se não bater, algum dos dois foi lido errado.
  const conf = r.vPep5 && r.foiCobrar && Math.abs(arred(r.foiCobrar * 0.05) - r.vPep5) > 0.01
    ? ` ⚠ Confira o "Foi cobrar": 5% dele dá ${R$(r.foiCobrar * 0.05)}, mas a folha diz ${R$(r.vPep5)}.` : '';
  toast((r.duvidas ? 'Folha lida. Atenção: ' + r.duvidas : 'Folha lida!') + sem + conf + aviso);
}

$$('input[data-ler]').forEach((inp) => inp.addEventListener('change', () => {
  const files = [...inp.files];
  inp.value = '';
  if (files.length) lerFotos(inp.dataset.ler, files);
}));

/* ---------- carregamento: foguete subindo ---------- */
// carregando(true, 'Lendo…', { etapas: ['Nota 1', 'Nota 2'] }) abre; progresso({ pct, titulo, etapa }) atualiza.
// Sem porcentagem de verdade (IA, gerar a folha), a porcentagem anda sozinha até perto de 90% e completa no fim.
let simulacao = null, fechando = null;
function carregando(on, txt, { etapas = [] } = {}) {
  clearInterval(simulacao);
  clearTimeout(fechando);
  simulacao = null;
  if (!on) {
    progresso({ pct: 1 }); // o foguete chega no topo antes de sumir
    fechando = setTimeout(() => { $('#carregando').hidden = true; }, 350);
    return;
  }
  $('#carregando').hidden = false;
  $('#carregandoEtapas').innerHTML = etapas.length > 1 ? etapas.map((t) => `<span>${esc(t)}</span>`).join('') : '';
  progresso({ pct: 0, titulo: txt || 'Carregando…', etapa: 0 });
}
function progresso({ pct, titulo, etapa } = {}) {
  if (titulo) $('#carregandoTxt').textContent = titulo;
  if (pct != null) {
    const p = Math.max(0, Math.min(1, pct));
    $('#foguete').style.setProperty('--p', p);
    $('#carregandoPct').textContent = Math.round(p * 100) + '%';
  }
  if (etapa != null) {
    $$('#carregandoEtapas span').forEach((el, i) => {
      el.classList.toggle('feita', i < etapa);
      el.classList.toggle('atual', i === etapa);
      el.textContent = el.textContent.replace(/ ✓$/, '') + (i < etapa ? ' ✓' : '');
    });
  }
}
// Para o que não informa porcentagem: sobe devagar e nunca passa de 90% antes de terminar.
function progressoSimulado(titulo) {
  let p = 0;
  progresso({ pct: 0, titulo });
  clearInterval(simulacao);
  simulacao = setInterval(() => { p += (0.9 - p) * 0.06; progresso({ pct: p }); }, 200);
}

/* ---------- configurar chave ---------- */
function mostrarChave() {
  $('#campoChave').hidden = $('input[name="modo"]:checked')?.value === 'gratis';
}
$$('input[name="modo"]').forEach((r) => r.addEventListener('change', mostrarChave));
function abrirConfig() {
  $('#apiKey').value = ls.get(KEY_API, '');
  const modo = modoLeitura();
  $$('input[name="modo"]').forEach((r) => { r.checked = r.value === modo; });
  mostrarChave();
  $('#dlgConfig').showModal();
}
$('#btnConfig').addEventListener('click', abrirConfig);
$('#btnSalvarChave').addEventListener('click', () => {
  const modo = $('input[name="modo"]:checked')?.value || 'gratis';
  ls.set(KEY_MODO, modo);
  ls.set(KEY_API, $('#apiKey').value.trim());
  if (modo !== 'gratis' && !$('#apiKey').value.trim()) toast('Sem chave a IA não funciona: cole a chave ou use a leitura gratuita.');
  toast('Chave salva neste aparelho.');
});

/* ---------- salvar / lista / novo ---------- */
function guardar(f) {
  const salvos = ls.get(KEY_SALVOS, []).filter((s) => s.id !== f.id);
  salvos.unshift(structuredClone(f));
  ls.set(KEY_SALVOS, salvos);
}
// Depois de salvar o fechamento, ele se salva sozinho a cada 30 minutos se algo mudou (nota, valor, qualquer coisa).
const KEY_AUTO = 'caixa.autoSalvar';
const AUTO_MIN = 30;
const horaCurta = (t) => new Date(t).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
function pintarAutoSalvo() {
  const a = ls.get(KEY_AUTO, null);
  const el = $('#autoSalvo');
  el.hidden = !(a && a.id === st.id);
  if (!el.hidden) el.textContent = `Salvamento automático a cada ${AUTO_MIN} min quando houver mudança · último às ${horaCurta(a.em)}`;
}
function salvarFechamento() {
  guardar(st);
  ls.set(KEY_AUTO, { id: st.id, em: Date.now(), copia: JSON.stringify(st) });
  pintarAutoSalvo();
  toast('Fechamento salvo. Agora ele se salva sozinho a cada 30 minutos se houver mudança.');
}
$('#btnSalvar').addEventListener('click', salvarFechamento);
function autoSalvar() {
  const a = ls.get(KEY_AUTO, null);
  if (!a || a.id !== st.id || Date.now() - a.em < AUTO_MIN * 60000) return;
  sincronizar();
  const copia = JSON.stringify(st);
  if (copia === a.copia) return; // nada mudou desde o último salvamento
  guardar(st);
  ls.set(KEY_AUTO, { id: st.id, em: Date.now(), copia });
  pintarAutoSalvo();
  toast('Fechamento salvo automaticamente.');
}
setInterval(autoSalvar, 60000);
pintarAutoSalvo();
document.addEventListener('visibilitychange', () => { if (!document.hidden) autoSalvar(); });

$('#btnNovo').addEventListener('click', () => {
  if (!confirm('Começar um fechamento novo? Salve este antes se quiser guardar.')) return;
  st = novo();
  salvarAtual(); pintarTudo(); pintarAutoSalvo();
  scrollTo({ top: 0, behavior: 'smooth' });
});

$('#btnLista').addEventListener('click', () => {
  pintarMeta();
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
    // Um toque sem querer não troca o fechamento: pergunta antes de carregar.
    row.querySelector('.salvo__abrir').addEventListener('click', () => {
      const dlg = $('#dlgCarregar');
      $('#carregarTxt').textContent = `${d} · Semana ${s.semana || '-'} — Recebimento ${R$(c.recebimento)}. `
        + 'O que está na tela agora será trocado por este salvamento.';
      dlg.returnValue = '';
      dlg.onclose = () => {
        if (dlg.returnValue !== 'sim') return;
        st = normalizar(structuredClone(s));
        salvarAtual(); pintarTudo(); pintarAutoSalvo();
        $('#dlgLista').close();
        toast('Salvamento carregado.');
      };
      dlg.showModal();
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

/* ---------- notificações (☰ → 🔔) ---------- */
// Metas da rota e lembretes de cada dia ficam no aparelho e valem para todas as semanas.
const KEY_AVISOS = 'caixa.avisos';
const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
function avisosCfg() {
  const a = ls.get(KEY_AVISOS, {});
  return { metaNotas: a.metaNotas ?? 25, metaValor: a.metaValor ?? 22000, lembretes: a.lembretes || {} };
}
// Quando o parcial foi lançado: guardado no lançamento; os antigos contam do fim do dia em que entraram.
const lancadoEm = (x) => x.criadoEm || (x.dia ? new Date(x.dia + 'T23:59').getTime() : Date.now());
// Pepinos parciais ainda devendo que, no momento "quando", passaram de 24 horas sem resolução.
const parciaisParados = (quando) => (st.parciais || []).filter((x) => numero(x.devendo) > 0 && quando - lancadoEm(x) >= 24 * 3600000);
const textoParcial = (l) => `${l.length} ${l.length > 1 ? 'notas parciais' : 'nota parcial'} sem resolução há mais de 24 horas · `
  + `${R$(l.reduce((t, x) => t + numero(x.devendo), 0))} devendo.`;
// Meta da rota: o que falta de notas feitas (Ab + Rp) e de valor deixado. Quinta e sexta avisam se estiver longe.
function metaRota() {
  const cfg = avisosCfg();
  const feitas = (st.feitas || []).reduce((t, f) => t + qtdFeita(f), 0);
  const faltaNotas = Math.max(0, cfg.metaNotas - feitas);
  const faltaValor = Math.max(0, arred(cfg.metaValor - soma(st.feitas || [])));
  return { faltaNotas, faltaValor,
    texto: `Faltam ${faltaNotas} ${faltaNotas === 1 ? 'nota' : 'notas'} e ${R$(faltaValor)} para ${cfg.metaNotas} notas e ${R$(cfg.metaValor)}.` };
}
const REGRAS_ROTA = [
  { dia: 4, id: 301, tipo: 'meta', icone: '🚩', titulo: 'Vamos fechar essa rota até sexta-feira', vale: (m) => m.faltaNotas > 7 && m.faltaValor > 6000 },
  { dia: 5, id: 302, tipo: 'urgente', icone: '🔥', titulo: 'Quero essa rota fechada hoje', vale: (m) => m.faltaNotas > 4 && m.faltaValor >= 3000 },
];
// Lembrete do dia e meta da rota aparecem a partir das 8h (a mesma hora em que chegam no celular).
const HORA_AVISO = 8;
function notificacoes(agora = new Date()) {
  const cfg = avisosCfg();
  const dia = isoDia(agora);
  const lista = [];
  const manha = agora.getHours() >= HORA_AVISO;
  const lembrete = (cfg.lembretes[agora.getDay()] || '').trim();
  if (lembrete && manha) lista.push({ chave: `lemb-${dia}`, tipo: 'lembrete', icone: '📌', titulo: `Lembrete de ${DIAS_SEMANA[agora.getDay()].toLowerCase()}`, texto: lembrete });
  const parados = parciaisParados(agora);
  if (parados.length) lista.push({ chave: `parc-${dia}`, tipo: 'alerta', icone: '⏰', titulo: 'Vamo receber esses parcial', texto: textoParcial(parados) });
  const m = metaRota();
  REGRAS_ROTA.forEach((r) => { if (manha && agora.getDay() === r.dia && r.vale(m)) lista.push({ ...r, chave: `rota${r.id}-${dia}`, texto: m.texto }); });
  const { dispensadas } = estadoNotif();
  return lista.filter((n) => !dispensadas.includes(n.chave));
}
// O que já foi visto (some a bolinha) e o que foi dispensado (some da lista) valem só para o dia.
const KEY_NOTIF_VISTAS = 'caixa.notifVistas';
const isoDia = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
function estadoNotif() {
  const e = ls.get(KEY_NOTIF_VISTAS, {});
  return e.dia === isoDia(new Date()) ? { dia: e.dia, vistas: e.vistas || [], dispensadas: e.dispensadas || [] }
    : { dia: isoDia(new Date()), vistas: [], dispensadas: [] };
}
function marcarNotif(campo, chaves) {
  const e = estadoNotif();
  e[campo] = [...new Set([...e[campo], ...chaves])];
  ls.set(KEY_NOTIF_VISTAS, e);
}
// Bolinha no ☰ quando há notificação ainda não vista.
function pintarSino() {
  const { vistas } = estadoNotif();
  const qt = notificacoes().filter((n) => !vistas.includes(n.chave)).length;
  $('#sinoPonto').hidden = !qt;
  $('#notifQt').hidden = !qt;
  $('#notifQt').textContent = qt;
}
function pintarListaNotif() {
  const lista = notificacoes();
  const box = $('#listaNotif');
  box.innerHTML = lista.length ? '' : '<p class="vazio">Nenhuma notificação agora. Tudo em dia! ✓</p>';
  lista.forEach((n) => {
    const el = document.createElement('div');
    el.className = `notif notif--${n.tipo}`;
    el.innerHTML = `<span class="notif__icone">${n.icone}</span><div><b>${esc(n.titulo)}</b><p>${esc(n.texto)}</p></div>
      <button type="button" class="notif__fechar" aria-label="Dispensar">✕</button>`;
    el.querySelector('.notif__fechar').addEventListener('click', () => { marcarNotif('dispensadas', [n.chave]); pintarListaNotif(); pintarSino(); });
    box.appendChild(el);
  });
  // Abriu a lista: tudo o que está nela conta como visto.
  marcarNotif('vistas', lista.map((n) => n.chave));
  pintarSino();
}
function pintarNotificacoes() {
  pintarListaNotif();
  const cfg = avisosCfg();
  $('#notifDias').innerHTML = [1, 2, 3, 4, 5, 6, 0].map((d) => `<label>${DIAS_SEMANA[d]}
    <input data-lembrete="${d}" value="${esc(cfg.lembretes[d] || '')}" enterkeyhint="done" autocomplete="off" placeholder="Sem lembrete"></label>`).join('');
}
function salvarAvisos(muda) {
  const a = ls.get(KEY_AVISOS, {});
  muda(a);
  ls.set(KEY_AVISOS, a);
  pintarListaNotif(); pintarSino(); agendarDepois();
}

/* ---------- meta pessoal (☰ → 🎯) ---------- */
// Meta da rota (da empresa): Capital 22 mil e 25 notas, Município 32 mil e 30 notas. A meta pessoal é a do vendedor
// (começa igual à da rota). O app mostra quanto falta deixar e a média por nota para fechar até sexta; no sábado
// e no domingo, se ainda não fechou, recalcula para o dia.
const ROTAS = { capital: { valor: 22000, notas: 25 }, municipio: { valor: 32000, notas: 30 } };
function metaPessoal() {
  const a = ls.get(KEY_AVISOS, {});
  const cfg = avisosCfg();
  return { valor: a.pessoalValor ?? cfg.metaValor, notas: a.pessoalNotas ?? cfg.metaNotas };
}
function calculoMeta(agora = new Date()) {
  const meta = metaPessoal();
  const feitas = (st.feitas || []).reduce((t, f) => t + qtdFeita(f), 0);
  const deixado = soma(st.feitas || []);
  const faltaValor = Math.max(0, arred(meta.valor - deixado));
  const faltaNotas = Math.max(0, meta.notas - feitas);
  const dia = agora.getDay(); // 0 domingo … 6 sábado
  const prazo = dia >= 1 && dia <= 5 ? 'até sexta-feira' : dia === 6 ? 'até sábado (hoje)' : 'até domingo (hoje)';
  const dias = dia >= 1 && dia <= 5 ? 6 - dia : 1; // dias de trabalho que faltam, contando hoje
  return { meta, feitas, deixado, faltaValor, faltaNotas, prazo, dias,
    // Média por nota sem centavos e sempre para mais, no próximo valor par (as notas são preço cheio): 770,80 → 772.
    media: faltaNotas ? Math.ceil(faltaValor / faltaNotas / 2) * 2 : 0 };
}
const notasTxt = (n) => `${n} ${n === 1 ? 'nota' : 'notas'}`;
function pintarMeta() {
  const c = calculoMeta();
  const pct = (v, m) => Math.min(100, m ? Math.round((v / m) * 100) : 0);
  let frase;
  if (!c.faltaValor && !c.faltaNotas) frase = `<p class="meta-frase meta-frase--ok">🎉 Meta pessoal batida! ${R$(c.deixado)} em ${notasTxt(c.feitas)}.</p>`;
  else if (!c.faltaNotas) frase = `<p class="meta-frase">As ${notasTxt(c.meta.notas)} já estão feitas. Falta deixar <b>${R$(c.faltaValor)}</b> para fechar com ${R$(c.meta.valor)} ${c.prazo}.</p>`;
  else if (!c.faltaValor) frase = `<p class="meta-frase">O valor já passou de ${R$(c.meta.valor)}. Faltam <b>${notasTxt(c.faltaNotas)}</b> para fechar com ${notasTxt(c.meta.notas)} ${c.prazo}.</p>`;
  else {
    frase = `<p class="meta-frase">Você precisa deixar <b>${R$(c.faltaValor)}</b> e <b>${notasTxt(c.faltaNotas)}</b> pra fechar com ${R$(c.meta.valor)} e ${notasTxt(c.meta.notas)} ${c.prazo}.</p>
      <p class="meta-media">São <b>${R$(c.media)}</b> de média por nota.</p>`;
    if (c.dias > 1) frase += `<p class="muted small">Em ${c.dias} dias (contando hoje): cerca de ${R$(Math.ceil(c.faltaValor / c.dias))} e ${Math.ceil(c.faltaNotas / c.dias)} ${Math.ceil(c.faltaNotas / c.dias) === 1 ? 'nota' : 'notas'} por dia.</p>`;
  }
  const largura = (v, m) => `${pct(v, m)}%`;
  $('#metaCalc').innerHTML = `${frase}
    <div class="meta-barra"><div class="meta-barra__txt"><span>Valor deixado</span><b>${R$(c.deixado)} de ${R$(c.meta.valor)}</b></div>
      <div class="meta-barra__fundo"><div style="width:${largura(c.deixado, c.meta.valor)}"></div></div></div>
    <div class="meta-barra"><div class="meta-barra__txt"><span>Notas feitas</span><b>${c.feitas} de ${c.meta.notas}</b></div>
      <div class="meta-barra__fundo"><div style="width:${largura(c.feitas, c.meta.notas)}"></div></div></div>`;
  $('#metaResumo').textContent = c.faltaValor || c.faltaNotas ? `faltam ${R$(c.faltaValor)}` : 'batida ✓';
}
function pintarCamposMeta() {
  const m = metaPessoal();
  $('[data-pessoal="valor"]').value = brl(m.valor);
  $('[data-pessoal="notas"]').value = m.notas;
  const cfg = avisosCfg();
  const rota = Object.keys(ROTAS).find((k) => ROTAS[k].valor === cfg.metaValor && ROTAS[k].notas === cfg.metaNotas);
  $$('#metaRota input').forEach((r) => { r.checked = r.value === rota; });
}
function salvarMeta(muda) {
  const a = ls.get(KEY_AVISOS, {});
  muda(a);
  ls.set(KEY_AVISOS, a);
  pintarMeta(); pintarSino(); agendarDepois();
}
$('[data-pessoal="valor"]').addEventListener('input', (e) => salvarMeta((a) => { a.pessoalValor = numero(e.target.value); }));
$('[data-pessoal="notas"]').addEventListener('input', (e) => salvarMeta((a) => { a.pessoalNotas = Math.max(0, Math.round(numero(e.target.value))); }));
$$('#metaRota input').forEach((r) => r.addEventListener('change', () => salvarMeta((a) => {
  a.metaValor = ROTAS[r.value].valor; a.metaNotas = ROTAS[r.value].notas;
})));
$('#btnMeta').addEventListener('click', () => {
  pintarCamposMeta(); pintarMeta();
  $('#dlgLista').close();
  $('#dlgMeta').showModal();
  document.activeElement?.blur(); // abre sem campo selecionado (sem teclado)
});
$('#notifDias').addEventListener('input', (e) => {
  const d = e.target.dataset.lembrete;
  if (d !== undefined) salvarAvisos((a) => { a.lembretes = { ...(a.lembretes || {}), [d]: e.target.value }; });
});
$('#btnNotif').addEventListener('click', () => {
  pintarNotificacoes(); pintarBarra();
  $('#dlgLista').close();
  $('#dlgNotif').showModal();
});
setInterval(pintarSino, 60000); // a virada do dia e as 24 h dos parciais
document.addEventListener('visibilitychange', () => { if (!document.hidden) pintarSino(); });

/* ---------- app Android (APK feito com Capacitor, pasta caixa-android/) ---------- */
// No APK o app roda num WebView sem o Chrome: compartilhar, salvar arquivo e o botão "voltar" usam os plugins.
const Cap = window.Capacitor;
const NATIVO = !!(Cap && Cap.isNativePlatform && Cap.isNativePlatform());
const plugin = (nome) => (NATIVO ? Cap.Plugins?.[nome] || Cap.registerPlugin?.(nome) : null);

const blobBase64 = (blob) => new Promise((ok, erro) => {
  const r = new FileReader();
  r.onload = () => ok(String(r.result).split(',')[1]);
  r.onerror = erro;
  r.readAsDataURL(blob);
});
async function compartilharArquivo(blob, nome) {
  const { uri } = await plugin('Filesystem').writeFile({ path: nome, data: await blobBase64(blob), directory: 'CACHE' });
  await plugin('Share').share({ title: nome, files: [uri], dialogTitle: 'Mandar ou salvar a folha' });
}

if (NATIVO) {
  document.documentElement.classList.add('is-native');
  $('#btnCaixaImprimir').hidden = true; // o WebView do Android não imprime
  // Voltar do Android: fecha a janela aberta, depois volta para a 1ª aba, depois minimiza o app.
  plugin('App')?.addListener('backButton', () => {
    const aberta = [...document.querySelectorAll('dialog[open]')].pop();
    if (aberta) { aberta.close(); return; }
    if ($('[data-tab="receb"]').hidden) { abrirAba('receb'); return; }
    plugin('App').minimizeApp();
  });
}

// Avisos na barra de notificações do celular (só no APK): agendados no Android, chegam com o app fechado.
// São refeitos a cada mudança: lembrete de cada dia às 8h, o parcial 24 h depois de lançado (depois às 9h de
// cada dia enquanto estiver devendo) e a meta da rota na quinta e na sexta às 8h.
const LN = NATIVO ? plugin('LocalNotifications') : null;
const KEY_AVISADO = 'caixa.avisado';
// isExactNotification:false: o Android entrega perto da hora sem pedir a permissão de "alarmes exatos".
const NOTIF_BASE = { channelId: 'avisos', smallIcon: 'ic_stat_caixa', iconColor: '#5b8cff', autoCancel: true, isExactNotification: false };
function proximaHora(h, base = new Date()) {
  const d = new Date(base);
  d.setHours(h, 0, 0, 0);
  if (d <= base) d.setDate(d.getDate() + 1);
  return d;
}
// Avisos no celular só durante o dia (8h às 18h): o que cairia de noite ou de madrugada passa para as 8h seguintes.
const FIM_DO_DIA = 18;
const deDia = (d) => d.getHours() >= HORA_AVISO && d.getHours() < FIM_DO_DIA;
function paraODia(d) {
  if (deDia(d)) return d;
  const r = new Date(d);
  if (r.getHours() >= FIM_DO_DIA) r.setDate(r.getDate() + 1);
  r.setHours(HORA_AVISO, 0, 0, 0);
  return r;
}
async function barraLigada() {
  try { return LN && (await LN.checkPermissions()).display === 'granted'; } catch { return false; }
}
async function agendarAvisos() {
  if (!(await barraLigada())) return;
  try {
    const { notifications: pend } = await LN.getPending();
    const nossos = pend.filter((n) => n.id >= 100 && n.id < 400).map((n) => ({ id: n.id }));
    if (nossos.length) await LN.cancel({ notifications: nossos });
    const agora = new Date();
    const cfg = avisosCfg();
    const lista = [];
    // Lembretes dos próximos 7 dias, cada um às 8h do dia dele (refeitos sempre que o app abre ou muda algo).
    for (let i = 0; i < 8; i++) {
      const at = new Date(agora);
      at.setDate(agora.getDate() + i);
      at.setHours(HORA_AVISO, 0, 0, 0);
      const txt = String(cfg.lembretes[at.getDay()] || '').trim();
      if (!txt || at <= agora) continue;
      lista.push({ ...NOTIF_BASE, id: 100 + i, title: `📌 Lembrete de ${DIAS_SEMANA[at.getDay()].toLowerCase()}`, body: txt,
        schedule: { at, allowWhileIdle: true } });
    }
    const devendo = (st.parciais || []).filter((x) => numero(x.devendo) > 0);
    if (devendo.length) {
      let at = new Date(Math.min(...devendo.map(lancadoEm)) + 24 * 3600000);
      if (at <= agora) at = proximaHora(9, agora);
      at = paraODia(at);
      lista.push({ ...NOTIF_BASE, id: 200, title: '⏰ Vamo receber esses parcial', body: textoParcial(parciaisParados(at)), schedule: { at, allowWhileIdle: true } });
    }
    // Quinta e sexta da semana do fechamento, às 8h. Se já passou das 8h do dia, avisa agora (uma vez no dia).
    const m = metaRota();
    const avisado = ls.get(KEY_AVISADO, {});
    const segunda = new Date(semanaDe(st.data).ini + 'T08:00');
    REGRAS_ROTA.forEach((r) => {
      if (!r.vale(m)) return;
      let at = new Date(segunda);
      at.setDate(segunda.getDate() + r.dia - 1);
      const dia = isoDia(at);
      let id = r.id;
      if (at <= agora) {
        if (dia !== hoje() || avisado[r.id] === dia || !deDia(agora)) return; // de noite não avisa na hora
        at = new Date(Date.now() + 3000);
        id = r.id + 100; // fora da faixa que é cancelada a cada mudança: o aviso de agora não se perde
      }
      avisado[r.id] = dia;
      lista.push({ ...NOTIF_BASE, id, title: `${r.icone} ${r.titulo}`, body: m.texto, schedule: { at, allowWhileIdle: true } });
    });
    ls.set(KEY_AVISADO, avisado);
    if (lista.length) await LN.schedule({ notifications: lista });
  } catch { /* sem permissão ou plugin indisponível: fica só dentro do app */ }
}
let agendarTimer = 0;
function agendarDepois() { if (!LN) return; clearTimeout(agendarTimer); agendarTimer = setTimeout(agendarAvisos, 1500); }
async function pintarBarra() {
  const el = $('#notifBarra');
  if (!LN) { el.hidden = true; return; }
  el.hidden = false;
  const ligada = await barraLigada();
  el.innerHTML = ligada ? '✓ Avisos na barra de notificações do celular ligados.'
    : '<button type="button" class="btn btn--primary" id="btnLigarBarra">Ligar avisos na barra do celular</button>';
  $('#btnLigarBarra')?.addEventListener('click', ligarBarra);
}
async function ligarBarra() {
  try {
    const p = await LN.requestPermissions();
    if (p.display !== 'granted') toast('Sem permissão: libere as notificações do Caixa nas configurações do celular.');
  } catch { /* nada */ }
  pintarBarra(); agendarAvisos();
}
if (LN) {
  LN.createChannel({ id: 'avisos', name: 'Avisos do caixa', description: 'Lembretes do dia, pepino parcial e meta da rota',
    importance: 4, visibility: 1, vibration: true }).catch(() => {});
  // Tocar na notificação abre a lista de notificações do app.
  LN.addListener('localNotificationActionPerformed', () => { pintarNotificacoes(); pintarBarra(); $('#dlgNotif').showModal(); });
  // Na primeira vez pede a permissão (Android 13+ pergunta ao usuário).
  if (!ls.get('caixa.barraPedida', false)) { ls.set('caixa.barraPedida', true); ligarBarra(); } else agendarDepois();
  document.addEventListener('visibilitychange', () => { if (document.hidden) agendarAvisos(); });
}

avisosProntos = true;
pintarSino();

/* ---------- relatório do dia ---------- */
// O relatório separa "do dia" e "total": notas (dia em que a foto foi lida/lançada), pepinos, antecipadas,
// notas feitas e depósitos têm o dia de cada um. O pepino parcial do relatório (quanto a cliente ficou
// devendo) é digitado dia a dia; o total soma os dias.
const REL_MONEY = ['avistaValor', 'devolValor'];

// Valor de face da nota (o TOTAL impresso), para saber quanto ainda está nas notas em branco.
// Pepino parcial: a cliente fica devendo o resto da nota com os 25% de desconto: (nota − devolução) × 0,75 − recebido.
// Ex.: nota 436, devolveu 118, não pagou nada → (436 − 118) × 0,75 = 238,50.
const devendoCalculado = (x) => Math.max(0, arred((numero(x.valorNota) - numero(x.devolucao)) * 0.75 - numero(x.valor)));
// O que a nota parcial tira das notas em branco: o valor da nota; sem ele, devolução + (recebido + devendo) ÷ 0,75.
const valorDaParcial = (x) => numero(x.valorNota)
  || arred(numero(x.devolucao) + (numero(x.valor) + numero(x.devendo)) / 0.75);
const qtdParcial = (x) => numero(x.qtd) || 1;

// Valor da nota que sai das notas em branco. Nota de 25%: o recebido com a comissão da cliente de volta
// (recebe 75%: 426 recebidos = 568), mais o que foi devolvido ("TOTAL DE DEVOLUCOES"): 568 + 284 = 852.
// Nota de 40% e 50% (nota quitada): a cliente paga a nota cheia, então o recebido já é o valor da nota.
// As notas são sempre preço cheio (sem centavos): o valor é arredondado para o real inteiro.
function valorDeFace(n, lista) {
  const valor = Number(n.valor) || 0;
  const pago = lista === 'notas25' ? 0.75 : 1;
  const vendido = Number(n.total) > valor ? Number(n.total) : valor / pago; // TOTAL impresso, quando foi lido
  return Math.round(vendido + (Number(n.devolucao) || 0));
}

// Quanto do pepino extra foi pago no dia: pelas datas dos pagamentos da nota, ou pelo dia em que foi lançado.
function pepinoNoDia(x, dia) {
  if (x.pagamentos?.length) {
    const { ini, fim } = semanaDe(st.data);
    return arred(x.pagamentos.filter((p) => p.data === dia && p.data >= ini && p.data <= fim).reduce((t, p) => t + p.valor, 0));
  }
  return x.dia === dia ? Number(x.valor) || 0 : 0;
}

function relatorio(dia) {
  const c = calcular();
  const g = ls.get(KEY_REL, {});
  const rel = st.rel || {};

  // Os totais contam só até o dia do relatório: o relatório de ontem mostra o total de ontem.
  // (Itens sem dia, de versões antigas, contam em todos.)
  const ate = (d) => !d || d <= dia;
  const qtFeitas = (l) => l.reduce((t, f) => t + qtdFeita(f), 0);
  const somaK = (l, k) => l.reduce((t, f) => t + numero(f[k]), 0);
  // Pepino extra até o dia: pelos pagamentos da semana até o dia, ou pelo dia em que foi lançado.
  const pepinoAte = (x) => {
    if (!x.pagamentos?.length) return ate(x.dia) ? Number(x.valor) || 0 : 0;
    const { ini, fim } = semanaDe(st.data);
    return arred(x.pagamentos.filter((p) => p.data >= ini && p.data <= fim && p.data <= dia).reduce((t, p) => t + p.valor, 0));
  };

  const n25 = st.notas25.filter((n) => n.dia === dia);
  const n4050 = st.notas4050.filter((n) => n.dia === dia);
  const pagas25 = st.notas25.filter((n) => ate(n.dia));
  const pagas4050 = st.notas4050.filter((n) => ate(n.dia));
  const pagas = [...pagas25, ...pagas4050];
  const antecDia = st.antecipadas.filter((a) => a.dia === dia);
  const antecTotal = st.antecipadas.filter((a) => Number(a.valor) > 0 && ate(a.dia));
  // Notas feitas por dia: o lançamento original no dia dele e cada acréscimo no dia em que foi feito.
  const parcelas = st.feitas.flatMap((f) => {
    const ac = f.acrescimos || [];
    const base = { data: f.data, qtd: f.qtd, ab: numero(f.ab) - ac.reduce((t, a) => t + numero(a.ab), 0),
      rp: numero(f.rp) - ac.reduce((t, a) => t + numero(a.rp), 0), valor: arred(numero(f.valor) - ac.reduce((t, a) => t + numero(a.valor), 0)) };
    return [base, ...ac];
  });
  const feitasDia = parcelas.filter((f) => f.data === dia);
  const feitasTotal = parcelas.filter((f) => ate(f.data));
  const pepDia = st.extras.map((x) => pepinoNoDia(x, dia)).filter((v) => v > 0);
  const pepTotal = st.extras.map(pepinoAte).filter((v) => v > 0);
  // Pepino parcial: no relatório vai o que as clientes ficaram devendo; o recebido entra no "Recebido".
  const parcDia = st.parciais.filter((x) => x.dia === dia);
  const parcAte = st.parciais.filter((x) => ate(x.dia));
  const parcPagoTotal = soma(parcAte);
  const parcQtd = (l) => l.reduce((t, x) => t + qtdParcial(x), 0);
  const recebidoDia = arred(soma(n25) + soma(n4050) + pepDia.reduce((t, v) => t + v, 0)
    + soma(antecDia) + soma(parcDia));
  const recebidoTotal = arred(soma(pagas) + pepTotal.reduce((t, v) => t + v, 0) + soma(antecTotal) + parcPagoTotal);
  // Nota com pepino parcial sai das notas em branco e fica no parcial: o que pagou + devolução + o que ficou devendo.
  const emBrancoQt = Math.max(0, (Number(st.qtNotas) || 0) - pagas.length - parcQtd(parcAte));
  const emBrancoValor = Math.max(0, arred(st.foiCobrar - (pagas25.reduce((t, n) => t + valorDeFace(n, 'notas25'), 0)
    + pagas4050.reduce((t, n) => t + valorDeFace(n, 'notas4050'), 0))
    - parcAte.reduce((t, x) => t + valorDaParcial(x), 0)));
  const depDia = st.depositos.filter((d) => d.data === dia);
  const depTotal = soma(st.depositos.filter((d) => ate(d.data)));

  const qt = (n) => String(Math.round(Number(n) || 0)).padStart(2, '0');
  const vl = (v) => (Number(v) ? brl(v) : '00');
  const tx = (v) => String(v ?? '').trim();
  const dataBr = dia ? `${dia.slice(8, 10)}/${dia.slice(5, 7)}/${dia.slice(0, 4)}` : '';
  const semana = soDigitos(st.semana);
  return [
    `Nome: ${tx(st.nome)}`,
    `Placa: ${tx(g.placa)}`,
    `Modelo: ${tx(g.modelo)}`,
    `Locadora: ${tx(g.locadora)}`,
    `Km : ${tx(g.km)}`,
    `Supervisor : ${tx(g.supervisor)}`,
    ' ',
    `Semana do mês: ${semana ? semana + '°' : ''}`,
    `Cidade : ${tx(st.cidade)}`,
    `Data : ${dataBr}`,
    '',
    `Valor a cobrar: ${vl(st.foiCobrar)}`,
    `Notas: ${qt(st.qtNotas)}`,
    'Vlr Max pepino ',
    `5% ${vl(c.vPep5)}`,
    '',
    `Nt Pg do dia : ${qt(n25.length + n4050.length)}`,
    `25%: ${qt(n25.length)}`,
    `40%: ${qt(n4050.length)}`,
    `Nt pg total: ${qt(pagas.length)}`,
    '',
    `Nt antecipada: ${qt(antecTotal.length)}`,
    `Valor: ${vl(soma(antecTotal))}`,
    `Nt avista: ${qt(rel.avistaQt)}`,
    `Valor: ${vl(rel.avistaValor)}`,
    '',
    `Recebido dia: ${vl(recebidoDia)}`,
    `Recebido total: ${vl(recebidoTotal)}`,
    '',
    `Nt parcial dia: ${qt(parcQtd(parcDia))}`,
    `Valor: ${vl(somaK(parcDia, 'devendo'))}`,
    `Nt parcial total: ${qt(parcQtd(parcAte))}`,
    `Valor : ${vl(somaK(parcAte, 'devendo'))}`,
    '',
    `Notas em branco: ${qt(emBrancoQt)}`,
    `Valor: ${vl(emBrancoValor)}`,
    '',
    `Nts feita dia: ${qt(qtFeitas(feitasDia))}`,
    `Ab: ${qt(somaK(feitasDia, 'ab'))} Rp: ${qt(somaK(feitasDia, 'rp'))}`,
    `Valor: ${vl(soma(feitasDia))}`,
    `Notas feitas total: ${qt(qtFeitas(feitasTotal))}`,
    `Valor: ${vl(soma(feitasTotal))}`,
    '',
    `Nt extra resolvido dia: ${qt(pepDia.length)}`,
    `Valor : ${vl(pepDia.reduce((t, v) => t + v, 0))}`,
    `Total resolvido: ${qt(pepTotal.length)}`,
    `Valor: ${vl(pepTotal.reduce((t, v) => t + v, 0))}`,
    '',
    `Devolu total de produts: ${qt(rel.devolQt)}`,
    `Valor: ${vl(rel.devolValor)}`,
    '',
    `Depósito dia: ${vl(soma(depDia.filter((d) => d.onde !== 'pix')))}`,
    `Transferencia: ${vl(soma(depDia.filter((d) => d.onde === 'pix')))}`,
    `Deposito total: ${vl(depTotal)}`,
    // Em mãos: recebido até o dia, menos as despesas da semana e o que já foi depositado.
    `Valor em mãos: ${vl(arred(recebidoTotal - c.despesas - depTotal))}`,
  ].join('\n');
}

const relDia = () => $('#relData').value || hoje();
function pintarRelatorio() {
  const pre = $('#relTexto');
  if (pre) pre.textContent = relatorio(relDia());
}
function pintarCamposRel() {
  const g = ls.get(KEY_REL, {});
  $$('[data-rg]').forEach((el) => { el.value = g[el.dataset.rg] ?? ''; });
  $$('[data-rs]').forEach((el) => {
    const v = (st.rel || {})[el.dataset.rs];
    el.value = REL_MONEY.includes(el.dataset.rs) ? (v ? brl(v) : '') : (v ?? '');
  });
}
$('#relData').value = hoje();
$('#relData').addEventListener('change', () => { pintarCamposRel(); pintarRelatorio(); });
$$('[data-rg]').forEach((el) => el.addEventListener('input', () => {
  const g = ls.get(KEY_REL, {});
  g[el.dataset.rg] = el.value;
  ls.set(KEY_REL, g);
  pintarRelatorio();
}));
$$('[data-rs]').forEach((el) => {
  const k = el.dataset.rs;
  el.addEventListener('input', () => {
    st.rel ||= {};
    st.rel[k] = REL_MONEY.includes(k) ? numero(el.value) : el.value;
    salvarAtual(); pintarRelatorio();
  });
  if (REL_MONEY.includes(k)) el.addEventListener('blur', () => { el.value = st.rel?.[k] ? brl(st.rel[k]) : ''; });
});
// Lançar um pepino parcial no dia do relatório: valor da nota, recebido e devolução. O que ficou devendo
// é calculado com os 25% e aparece discreto no canto.
const campoParc = (k) => $(`[data-parc="${k}"]`);
const lerParc = () => Object.fromEntries(['valorNota', 'valor', 'devolucao'].map((k) => [k, numero(campoParc(k).value)]));
function previaDevendo() {
  const x = lerParc();
  $('#parcDevendo').textContent = x.valorNota ? `ficou devendo ${R$(devendoCalculado(x))}` : '';
}
['valorNota', 'valor', 'devolucao'].forEach((k) => campoParc(k).addEventListener('input', previaDevendo));
$('#btnLancarParcial').addEventListener('click', () => {
  const x = { id: uid(), dia: relDia(), criadoEm: Date.now(), ...lerParc() };
  if (!(x.valorNota > 0)) { toast('Digite o valor da nota.'); return; }
  x.devendo = devendoCalculado(x);
  st.parciais.push(x);
  ['valorNota', 'valor', 'devolucao'].forEach((k) => { campoParc(k).value = ''; });
  previaDevendo();
  document.activeElement?.blur();
  abrirLista('parciais');
  salvarAtual(); pintarLista('parciais'); pintarTotais();
  // Como nas outras listas: a tela desce até o lançamento novo.
  const ult = [...$$('[data-lista="parciais"] .item')].pop();
  if (ult) mostrarNoMeio(ult);
  toast(`Parcial lançado ✓ Ficou devendo ${R$(x.devendo)}.`);
});

async function copiar(txt) {
  try { await navigator.clipboard.writeText(txt); return true; } catch {
    const t = document.createElement('textarea');
    t.value = txt; document.body.appendChild(t); t.select();
    const ok = document.execCommand('copy'); t.remove();
    return ok;
  }
}
$('#btnRelCopiar').addEventListener('click', async () => {
  toast((await copiar(relatorio(relDia()))) ? 'Relatório copiado ✓ Cole no WhatsApp.' : 'Não deu para copiar.');
});
$('#btnRelEnviar').addEventListener('click', () => compartilhar(relatorio(relDia()), 'Mandar relatório'));

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
  L.push('*Despesas*');
  DESPESAS.forEach((k) => { if (st[k]) L.push(`${NOMES[k]}: ${R$(st[k])}`); });
  st.pila.forEach((o) => L.push(`Pila — ${o.tipo || 'despesa'}: ${R$(o.valor)}`));
  st.outros.forEach((o) => L.push(`Outros: ${o.desc || ''} ${R$(o.valor)}`));
  st.obs.forEach((o) => L.push(`OBS: ${o.desc || ''} ${R$(o.valor)}`));
  L.push(`*Total de despesas: ${R$(c.despesas)}*`, '');
  L.push(`Total para depositar: ${R$(c.aDepositar)}`);
  st.depositos.forEach((d) => L.push(`${ONDE[d.onde]}: ${R$(d.valor)}`));
  L.push(c.falta === 0 ? '*✓ Tudo depositado*' : c.falta > 0 ? `*Falta depositar: ${R$(c.falta)}*` : `*Depositou a mais: ${R$(-c.falta)}*`);
  L.push('', `Valor deixado (vendas da semana): ${R$(st.valorDeixado)}`);
  return L.join('\n');
}

async function compartilhar(txt, titulo) {
  if (NATIVO) {
    try { await plugin('Share').share({ text: txt, dialogTitle: titulo }); } catch { /* cancelou */ }
    return;
  }
  if (navigator.share) {
    try { await navigator.share({ text: txt }); return; } catch (e) { if (e.name === 'AbortError') return; }
  }
  open('https://wa.me/?text=' + encodeURIComponent(txt), '_blank');
}
$('#btnWhats').addEventListener('click', () => compartilhar(resumo(), 'Mandar resumo'));

/* ---------- impressão no formato da folha ---------- */
/* ---------- gerar a folha CAIXA da semana (imagem igual à folha impressa) ---------- */
const vazioOu = (v) => (Number(v) ? brl(v) : '');

function dadosCaixa() {
  const c = calcular();
  const d = st.data ? new Date(st.data + 'T12:00').toLocaleDateString('pt-BR') : '';
  const comValor = (desc, v) => `${desc} (${brl(v)})`.trim();
  const outros = [
    ...(st.salario ? [comValor('Salário', st.salario)] : []),
    ...st.pila.filter((o) => o.valor).map((o) => comValor('Pila ' + (o.tipo || 'despesa').toLowerCase(), o.valor)),
    ...st.outros.filter((o) => o.valor).map((o) => comValor(o.desc || 'Outros', o.valor)),
  ];
  // Na folha o OBS é escrito "4.000,00 (Fernando)".
  const obs = st.obs.filter((o) => o.valor).map((o) => `${brl(o.valor)}${o.desc ? ` (${o.desc})` : ''}`);
  // Depósito na folha: o TOTAL a depositar (já depositado + o que falta), num campo só:
  // semana de pagamento → Depto. empresa espécie; outras semanas → Depto. banco/TED. Pix é só controle no app.
  const totalDep = c.aDepositar > 0 ? c.aDepositar : 0;
  const naEmpresa = tipoDeposito(st) === 'empresa';
  // E no OBS continua o aviso do que ainda falta depositar.
  if (c.falta > 0) obs.push(`Falta depositar ${brl(c.falta)}`);
  if (c.falta < 0) obs.push(`Depositou a mais ${brl(-c.falta)}`);
  return {
    nome: st.nome, cidade: st.cidade, data: d, semana: st.semana, foiCobrar: vazioOu(st.foiCobrar),
    qtNotas: st.qtNotas, vPep5: vazioOu(c.vPep5),
    antecipados: vazioOu(st.antecipados), qtNotasDeixadas: st.qtNotasDeixadas, pinos: st.pinos,
    valorPepinos: vazioOu(st.valorPepinos), pepinoParcial: vazioOu(st.pepinoParcial),
    notas25: vazioOu(c.notas25), notas4050: vazioOu(c.notas4050), pepinoExtra: vazioOu(c.extras),
    recebimento: vazioOu(c.recebimento), depEspecie: naEmpresa ? vazioOu(totalDep) : '', depPix: '',
    depBanco: naEmpresa ? '' : vazioOu(totalDep), vale: vazioOu(st.vale), ajuda: vazioOu(st.ajuda), mecanica: vazioOu(st.mecanica),
    despSupervisor: vazioOu(st.despSupervisor), excedido: vazioOu(st.excedido), valorDeixado: vazioOu(st.valorDeixado),
    assinatura: st.assinatura, outros, obs,
    extras: st.extras.map((x) => ({ numero: x.numero || '', cidade: x.cidade || '', valor: vazioOu(x.valor), vendedora: x.vendedora || '' })),
  };
}

// O que ainda pode estar faltando antes de fechar a semana (só avisa, não impede).
function pendencias() {
  const c = calcular();
  const p = [];
  if (!st.semana) p.push('A semana não está preenchida.');
  if (c.falta > 0) p.push(`Ainda falta depositar ${R$(c.falta)}.`);
  if (c.falta < 0) p.push(`Os depósitos passaram ${R$(-c.falta)} do que tinha para depositar.`);
  if (!st.valorDeixado) p.push('O valor deixado está vazio: lance as Notas feitas (aba Recebimento).');
  const conferir = Object.keys(LISTAS).reduce((t, k) => t + st[k].filter((i) => i.conferir).length, 0);
  if (conferir) p.push(`${conferir} item(ns) lido(s) pela foto ainda marcado(s) em amarelo para conferir.`);
  return p;
}

const nomeArquivo = () => `caixa-${(st.nome || 'vendedor').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-semana-${soDigitos(st.semana) || 'x'}.png`;
let imagemCaixa = null;

$('#btnGerar').addEventListener('click', async () => {
  carregando(true);
  progressoSimulado('Gerando a folha do caixa…');
  try {
    imagemCaixa = await desenharCaixa(dadosCaixa());
    const url = URL.createObjectURL(imagemCaixa);
    const img = $('#caixaImg');
    if (img.src) URL.revokeObjectURL(img.src);
    img.src = url;
    const pend = pendencias();
    $('#caixaAvisos').hidden = !pend.length;
    $('#caixaAvisos').innerHTML = pend.length ? '<b>Antes de entregar, confira:</b><ul>' + pend.map((t) => `<li>${esc(t)}</li>`).join('') + '</ul>' : '';
    $('#dlgCaixa').showModal();
  } catch (e) {
    console.error(e);
    toast('Não deu para gerar a folha.');
  } finally {
    carregando(false);
  }
});

$('#btnCaixaEnviar').addEventListener('click', async () => {
  if (!imagemCaixa) return;
  const nome = nomeArquivo();
  try {
    if (NATIVO) { await compartilharArquivo(imagemCaixa, nome); return; }
    const arq = new File([imagemCaixa], nome, { type: 'image/png' });
    if (navigator.canShare?.({ files: [arq] })) { await navigator.share({ files: [arq], title: nome }); return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(imagemCaixa);
    a.download = nome;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  } catch (e) {
    if (e?.name !== 'AbortError' && !/cancel/i.test(String(e?.message))) toast('Não deu para enviar a imagem.');
  }
});

// Aviso rápido e discreto no meio da tela: "✓ Salva".
function avisoSalvo() {
  const el = $('#salvo');
  // Janela aberta (showModal) fica numa camada acima de tudo: o aviso precisa estar dentro dela para aparecer.
  (document.querySelector('dialog[open]') || document.body).appendChild(el);
  el.classList.remove('show');
  void el.offsetWidth; // reinicia a animação se salvar duas vezes seguidas
  el.classList.add('show');
}

// Salvar a imagem da folha: no app Android vai para a galeria (pasta Imagens/Caixa); no site, baixa o arquivo.
$('#btnCaixaGaleria').addEventListener('click', async () => {
  if (!imagemCaixa) return;
  const nome = nomeArquivo();
  try {
    if (NATIVO) {
      const r = await plugin('CaixaNative').salvarNaGaleria({ data: await blobBase64(imagemCaixa), nome });
      avisoSalvo();
      return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(imagemCaixa);
    a.download = nome;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    avisoSalvo();
  } catch (e) {
    toast('Não deu para salvar: ' + (e?.message || 'erro'));
  }
});

$('#btnCaixaImprimir').addEventListener('click', () => {
  $('#folha').innerHTML = `<img src="${$('#caixaImg').src}" alt="">`;
  print();
});

/* ---------- início ---------- */
// Introdução: some sozinha no fim da animação (CSS); um toque pula. Depois sai da página.
const intro = $('#intro');
if (intro) {
  const tirar = () => intro.remove();
  intro.addEventListener('click', () => { intro.classList.add('pular'); setTimeout(tirar, 320); });
  intro.addEventListener('animationend', (e) => { if (e.target === intro) tirar(); });
}
pintarTudo();

// A data acompanha o calendário: ao abrir, ao voltar para o app e na virada do dia. Mudada à mão, vale só
// naquele dia. Numa semana nova a data não pula sozinha (os pepinos são da semana da folha): avisa para
// começar o fechamento novo.
let ultimoHoje = hoje(), avisouSemanaNova = '';
function dataDeHoje() {
  const h = hoje();
  if ($('#relData').value === ultimoHoje && h !== ultimoHoje) { $('#relData').value = h; pintarCamposRel(); }
  ultimoHoje = h;
  if (!st.data || st.data === h || st.dataManualEm === h) { pintarRelatorio(); return; }
  const { ini, fim } = semanaDe(st.data);
  if (h < ini || h > fim) {
    if (avisouSemanaNova !== h && temLancamentos(st)) {
      avisouSemanaNova = h;
      toast('Começou uma semana nova: tire a foto da folha nova ou toque em ＋ Novo fechamento (aba Depósito).');
    }
    return;
  }
  st.data = h;
  salvarAtual(); pintarCampos(); pintarTotais();
}
dataDeHoje();
setInterval(dataDeHoje, 60000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) dataDeHoje(); else guardarPosicao(); });

// Puxar para atualizar: no topo da tela, arrastar para baixo e soltar recarrega o app (os dados ficam salvos).
const puxar = $('#puxar');
const LIMITE = 70;
let puxarY0 = null, puxado = 0;
const podePuxar = () => scrollY <= 0 && !document.querySelector('dialog[open]') && $('#carregando').hidden
  && !$('#intro') && !document.documentElement.classList.contains('digitando');
function soltarPuxar() {
  puxado = 0;
  puxar.classList.remove('pronto');
  puxar.style.transform = '';
  puxar.hidden = true;
}
addEventListener('touchstart', (e) => {
  puxarY0 = e.touches.length === 1 && podePuxar() ? e.touches[0].clientY : null;
}, { passive: true });
addEventListener('touchmove', (e) => {
  if (puxarY0 === null) return;
  const d = e.touches[0].clientY - puxarY0;
  if (d <= 0 || scrollY > 0) { soltarPuxar(); return; }
  puxado = Math.min(d * 0.5, 110);
  puxar.hidden = false;
  puxar.classList.toggle('pronto', puxado >= LIMITE);
  puxar.style.transform = `translate(-50%, ${puxado}px) rotate(${puxado * 4}deg)`;
}, { passive: true });
addEventListener('touchend', () => {
  if (puxarY0 === null) return;
  puxarY0 = null;
  if (puxado < LIMITE) { soltarPuxar(); return; }
  puxar.classList.add('girando');
  salvarAtual(); guardarPosicao();
  try { sessionStorage.setItem('caixa.semIntro', '1'); } catch {}
  setTimeout(() => location.reload(), 450);
});
try { abrirAba(sessionStorage.getItem('caixa.aba') || 'receb'); } catch { abrirAba('receb'); }
// No APK os arquivos já estão dentro do app; o service worker é só para o site.
if (!NATIVO && 'serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
