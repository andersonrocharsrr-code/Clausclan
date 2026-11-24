/* Editor de Vídeo — telas. O motor (motor.js) desenha os quadros e grava o MP4; aqui ficam a prévia,
   a linha do tempo, as ferramentas de cada clipe, a colagem, a música e as ferramentas rápidas. */
import {
  FORMATOS, RESOLUCOES, FILTROS, COLAGENS, TRANSICOES, CORES_TEXTO,
  analisarMidia, miniatura, linhaDoTempo, ativosEm, tempoOrigem, fontesDoClipe, desenharQuadro,
  tamanhoSaida, taxaVideo, exportarVideo, maiorResolucao, converter, fotoDoQuadro, tempoTexto, duracaoClipe
} from './motor.js';
import { guardarMidia, lerMidias, apagarMidia, guardarProjeto, lerProjeto } from './armazem.js';

const $ = (id) => document.getElementById(id);
const Cap = window.Capacitor;
const NATIVO = !!(Cap && Cap.isNativePlatform && Cap.isNativePlatform());
const plugin = (n) => (NATIVO ? (Cap.Plugins && Cap.Plugins[n]) || (Cap.registerPlugin && Cap.registerPlugin(n)) || null : null);
const galeria = plugin('Galeria');
const appCap = plugin('App');

// ---------- Estado ----------

const novoProjeto = () => ({ formato: '9:16', fundo: 'desfocado', clipes: [], musica: null, marca: '', fadeIn: false, fadeOut: true });
let projeto = lerProjeto() || novoProjeto();
const midias = new Map(); // id → { id, blob, nome, tipo, dur, w, h, temAudio, url, thumb }
let sel = null;           // id do clipe escolhido
let aba = 'cortar';       // ferramenta aberta no painel do clipe
let tempo = 0;            // posição da prévia (s)
let tocando = false;
let ocupado = false;
let cancelar = false;
const desfazer = [];
let ultimoGrupo = '', ultimoGrupoT = 0;

const uid = () => Math.random().toString(36).slice(2, 10);
const linha = () => linhaDoTempo(projeto, midias);
const clipeSel = () => projeto.clipes.find((c) => c.id === sel) || null;
const fmt = (s) => {
  s = Math.max(0, s || 0);
  const m = Math.floor(s / 60), r = s - m * 60;
  return m + ':' + (r < 10 ? '0' : '') + r.toFixed(1).replace('.', ',');
};

/** Toda mudança passa por aqui: guarda para o "Desfazer", salva e redesenha. */
function mudar(fn, grupo) {
  const agora = Date.now();
  if (!grupo || grupo !== ultimoGrupo || agora - ultimoGrupoT > 1500) {
    desfazer.push(JSON.stringify(projeto));
    if (desfazer.length > 40) desfazer.shift();
  }
  ultimoGrupo = grupo || ''; ultimoGrupoT = agora;
  fn();
  salvar();
  atualizarTudo();
}

function voltar() {
  if (!desfazer.length) return;
  projeto = JSON.parse(desfazer.pop());
  ultimoGrupo = '';
  if (sel && !clipeSel()) sel = null;
  salvar();
  atualizarTudo();
}

let salvarT = 0;
function salvar() {
  clearTimeout(salvarT);
  salvarT = setTimeout(() => {
    guardarProjeto(projeto);
    // Arquivos que não são mais usados saem do aparelho.
    const usados = new Set();
    projeto.clipes.forEach((c) => fontesDoClipe(c).forEach((f) => usados.add(f.midia)));
    if (projeto.musica) usados.add(projeto.musica.midia);
    for (const id of [...midias.keys()]) {
      if (!usados.has(id) && !desfazer.some((d) => d.includes(id))) {
        const m = midias.get(id);
        if (m.url) URL.revokeObjectURL(m.url);
        midias.delete(id);
        apagarMidia(id).catch(() => {});
        soltarPlayer(id);
      }
    }
  }, 400);
}

// ---------- Mensagens ----------

let avisoT = 0;
function aviso(txt, tipo) {
  const el = $('aviso');
  el.textContent = txt;
  el.className = 'toast' + (tipo ? ' ' + tipo : '');
  el.hidden = false;
  clearTimeout(avisoT);
  avisoT = setTimeout(() => { el.hidden = true; }, tipo === 'erro' ? 6000 : 3000);
}

function progresso(txt, p) {
  $('progresso').hidden = false;
  $('progTexto').textContent = txt;
  const b = $('progBarra');
  if (p == null) b.parentElement.classList.add('indef');
  else { b.parentElement.classList.remove('indef'); b.style.width = Math.max(1, Math.min(100, p * 100)) + '%'; }
}
function fimProgresso() { $('progresso').hidden = true; }

/** Cria elemento: h('div', { class: 'x', onclick }, filhos…) */
function h(tag, at, ...filhos) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(at || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.className = v;
    else if (k === 'style') el.style.cssText = v;
    else if (k in el && k !== 'list') el[k] = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const f of filhos.flat()) if (f != null && f !== false) el.append(f.nodeType ? f : document.createTextNode(String(f)));
  return el;
}

// ---------- Escolher arquivos ----------

function escolherArquivos(accept, multiplo) {
  return new Promise((ok) => {
    const inp = h('input', { type: 'file', accept, multiple: !!multiplo, style: 'display:none' });
    inp.addEventListener('change', () => { ok([...inp.files]); inp.remove(); });
    document.body.append(inp);
    inp.click();
  });
}

async function adicionarMidia(file) {
  const info = await analisarMidia(file, file.name);
  if (info.tipo === 'video' && !info.podeLer) throw new Error(`Este celular não consegue ler o vídeo "${file.name}" (${info.codec || 'formato desconhecido'}).`);
  const m = { id: uid(), blob: file, nome: file.name || 'arquivo', ...info };
  m.url = URL.createObjectURL(file);
  midias.set(m.id, m);
  guardarMidia(m).catch(() => aviso('Memória do celular cheia: o projeto pode não ficar guardado.', 'erro'));
  miniatura(file, m.tipo).then((u) => { m.thumb = u; quandoMiniatura(); }).catch(() => {});
  return m;
}

// Miniatura chegou: redesenha a linha do tempo (e o painel, se ninguém estiver mexendo nele).
function quandoMiniatura() {
  desenharLinha();
  const foco = document.activeElement;
  if (!(foco && $('painel').contains(foco) && (foco.tagName === 'INPUT' || foco.tagName === 'TEXTAREA'))) desenharPainel();
}

async function importar(arquivos, onde) {
  if (!arquivos.length) return;
  progresso('Abrindo ' + (arquivos.length > 1 ? arquivos.length + ' arquivos' : 'o arquivo') + '…', null);
  const novos = [];
  try {
    for (const f of arquivos) {
      try {
        const m = await adicionarMidia(f);
        if (m.tipo === 'audio') { aviso('Esse arquivo é só som: use o botão Música.', 'erro'); continue; }
        novos.push(m);
      } catch (e) { aviso(e.message || 'Não consegui abrir ' + f.name, 'erro'); }
    }
  } finally { fimProgresso(); }
  if (!novos.length) return;
  mudar(() => {
    if (!projeto.clipes.length) {
      const m = novos[0];
      projeto.formato = m.w > m.h * 1.15 ? '16:9' : m.h > m.w * 1.15 ? '9:16' : '1:1';
    }
    const clipes = novos.map((m) => m.tipo === 'foto'
      ? { id: uid(), tipo: 'foto', midia: m.id, dur: 3, ajuste: 'ajustar', filtro: 'nenhum', transicao: 'corte' }
      : { id: uid(), tipo: 'video', midia: m.id, ini: 0, fim: m.dur, vel: 1, volume: m.temAudio ? 1 : 0, ajuste: 'ajustar', filtro: 'nenhum', transicao: 'corte' });
    const pos = onde != null ? onde : projeto.clipes.length;
    projeto.clipes.splice(pos, 0, ...clipes);
    sel = clipes[0].id;
    tempo = linha().itens[pos] ? linha().itens[pos].ini + 0.01 : 0;
  });
}

// ---------- Prévia ----------

const tela = $('tela');
const ctxTela = tela.getContext('2d', { alpha: false });
const players = new Map(); // chave → <video>
const fotosPrevia = new Map(); // midia → ImageBitmap
let musicaEl = null;

function player(chave, m) {
  let el = players.get(chave);
  if (el && el.dataset.midia !== m.id) { soltarEl(el); players.delete(chave); el = null; }
  if (!el) {
    el = document.createElement('video');
    el.dataset.midia = m.id;
    el.playsInline = true;
    el.preload = 'auto';
    el.muted = true;
    el.preservesPitch = false; // igual ao vídeo salvo: mais rápido = som mais fino
    el.src = m.url;
    el.addEventListener('seeked', pedirDesenho);
    el.addEventListener('loadeddata', pedirDesenho);
    players.set(chave, el);
  }
  return el;
}
function soltarEl(el) { el.pause(); el.removeAttribute('src'); el.load(); }
function soltarPlayer(midiaId) {
  for (const [k, el] of players) if (el.dataset.midia === midiaId) { soltarEl(el); players.delete(k); }
  const b = fotosPrevia.get(midiaId);
  if (b) { b.close && b.close(); fotosPrevia.delete(midiaId); }
}

function fotoPrevia(m) {
  let b = fotosPrevia.get(m.id);
  if (b === undefined) {
    fotosPrevia.set(m.id, null);
    createImageBitmap(m.blob).then(async (bmp) => {
      const s = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
      let r = bmp;
      if (s < 1) { r = await createImageBitmap(bmp, { resizeWidth: Math.round(bmp.width * s), resizeHeight: Math.round(bmp.height * s) }); bmp.close(); }
      fotosPrevia.set(m.id, r);
      pedirDesenho();
    }).catch(() => {});
    return null;
  }
  return b;
}

/** Imagem de uma fonte na prévia (vídeo no tempo certo ou foto). */
function imagemPrevia(chave, s) {
  const [idC, kS] = chave.split(':');
  const c = projeto.clipes.find((x) => x.id === idC);
  if (!c) return null;
  const k = Number(kS);
  const m = midias.get(k >= 0 ? c.celulas[k] && c.celulas[k].midia : c.midia);
  if (!m) return null;
  if (m.tipo === 'foto') {
    const b = fotoPrevia(m);
    return b ? { img: b, w: b.width, h: b.height } : null;
  }
  const el = player(chave, m);
  if (!tocando && !el.seeking && Math.abs(el.currentTime - s) > 0.03) el.currentTime = s;
  return el.readyState >= 2 && el.videoWidth ? { img: el, w: el.videoWidth, h: el.videoHeight } : null;
}

function ajustarTela() {
  const { w, h } = tamanhoSaida(projeto.formato, 540);
  if (tela.width !== w || tela.height !== h) { tela.width = w; tela.height = h; }
  $('palco').style.aspectRatio = w + ' / ' + h;
}

let desenhoPedido = false;
function pedirDesenho() {
  if (desenhoPedido || tocando) return;
  desenhoPedido = true;
  requestAnimationFrame(() => { desenhoPedido = false; desenhar(); });
}

function desenhar() {
  ajustarTela();
  const l = linha();
  $('vazio').hidden = l.itens.length > 0;
  desenharQuadro(ctxTela, tela.width, tela.height, projeto, l, midias, Math.min(tempo, Math.max(0, l.total - 0.001)), imagemPrevia);
  $('tempo').textContent = fmt(tempo) + ' / ' + fmt(l.total);
  const sc = $('rolar');
  sc.max = Math.max(0.1, l.total);
  if (document.activeElement !== sc) sc.value = tempo;
  marcarAgulha(l);
}

// Tocar: os <video> andam sozinhos e a tela desenha o que eles mostram.
let t0 = 0, base = 0;
function tocar() {
  const l = linha();
  if (!l.itens.length) return;
  if (tempo >= l.total - 0.05) tempo = 0;
  tocando = true;
  base = tempo; t0 = performance.now();
  $('play').textContent = '❚❚';
  $('play').setAttribute('aria-label', 'Pausar');
  requestAnimationFrame(passo);
}

function pausar() {
  tocando = false;
  for (const el of players.values()) el.pause();
  if (musicaEl) musicaEl.pause();
  $('play').textContent = '▶';
  $('play').setAttribute('aria-label', 'Tocar');
  pedirDesenho();
}

function passo() {
  if (!tocando) return;
  const l = linha();
  tempo = base + (performance.now() - t0) / 1000;
  if (tempo >= l.total) { tempo = l.total; pausar(); return; }
  const ativos = new Set();
  for (const a of ativosEm(l, tempo)) {
    for (const f of fontesDoClipe(a.c)) {
      const m = midias.get(f.midia);
      if (!m || m.tipo !== 'video') continue;
      const cel = f.cel >= 0 ? a.c.celulas[f.cel] : null;
      const s = tempoOrigem(a.c, cel, a.local, midias);
      const el = player(f.chave, m);
      ativos.add(el);
      const vol = a.c.tipo === 'video' ? a.c.volume : (cel.som ? (a.c.volume == null ? 1 : a.c.volume) : 0);
      el.muted = !vol;
      el.volume = Math.min(1, vol || 0);
      el.playbackRate = a.c.vel || 1;
      if (el.paused) { if (Math.abs(el.currentTime - s) > 0.05) el.currentTime = s; el.play().catch(() => {}); }
      else if (Math.abs(el.currentTime - s) > 0.35) el.currentTime = s;
    }
  }
  for (const el of players.values()) if (!ativos.has(el) && !el.paused) el.pause();
  tocarMusica();
  desenhar();
  requestAnimationFrame(passo);
}

function tocarMusica() {
  const mu = projeto.musica && midias.get(projeto.musica.midia);
  if (!mu) { if (musicaEl) musicaEl.pause(); return; }
  if (!musicaEl || musicaEl.dataset.midia !== mu.id) {
    if (musicaEl) soltarEl(musicaEl);
    musicaEl = document.createElement('audio');
    musicaEl.dataset.midia = mu.id;
    musicaEl.src = mu.url;
  }
  const dur = mu.dur || 1;
  const ini = projeto.musica.ini || 0;
  const tam = Math.max(0.5, dur - ini);
  if (projeto.musica.repetir === false && tempo > tam) { musicaEl.pause(); return; }
  const s = ini + (tempo % tam);
  musicaEl.volume = Math.min(1, projeto.musica.volume);
  if (musicaEl.paused) { musicaEl.currentTime = s; musicaEl.play().catch(() => {}); }
  else if (Math.abs(musicaEl.currentTime - s) > 0.35) musicaEl.currentTime = s;
}

// ---------- Linha do tempo ----------

const PX_S = 34; // pixels por segundo na linha do tempo (mínimo por clipe abaixo)

function desenharLinha() {
  const caixa = $('clipes');
  caixa.textContent = '';
  const l = linha();
  l.itens.forEach((it) => {
    const c = it.c;
    const fontes = fontesDoClipe(c);
    const m0 = midias.get(fontes[0] && fontes[0].midia);
    const larg = Math.max(64, Math.min(220, it.dur * PX_S));
    const card = h('button', {
      class: 'clipe' + (c.id === sel ? ' sel' : '') + (c.tipo === 'colagem' ? ' colagem' : ''),
      type: 'button', style: `width:${larg}px`,
      onclick: () => { if (tocando) pausar(); sel = c.id === sel ? null : c.id; if (sel) tempo = it.ini + 0.01; atualizarTudo(); }
    });
    if (c.tipo === 'colagem') {
      const g = h('div', { class: 'clipe__grade l' + c.layout });
      (COLAGENS[c.layout] || COLAGENS['2h']).cel.forEach(([x, y, w, hh], k) => {
        const m = c.celulas[k] && midias.get(c.celulas[k].midia);
        g.append(h('span', { style: `left:${x * 100}%;top:${y * 100}%;width:${w * 100}%;height:${hh * 100}%;` + (m && m.thumb ? `background-image:url(${m.thumb})` : '') }));
      });
      card.append(g);
    } else if (m0 && m0.thumb) {
      card.style.backgroundImage = `url(${m0.thumb})`;
    }
    card.append(h('span', { class: 'clipe__dur' }, (c.tipo === 'foto' ? '🖼 ' : c.tipo === 'colagem' ? '▦ ' : '') + it.dur.toFixed(1).replace('.', ',') + 's'));
    if (c.texto && c.texto.txt) card.append(h('span', { class: 'clipe__tag' }, 'T'));
    if ((c.vel || 1) !== 1) card.append(h('span', { class: 'clipe__vel' }, c.vel + '×'));
    caixa.append(card);
    if (c.id === sel) requestAnimationFrame(() => card.scrollIntoView({ block: 'nearest', inline: 'nearest' }));
    if (c.transicao && c.transicao !== 'corte' && it.i < l.itens.length - 1) caixa.append(h('span', { class: 'trans', title: TRANSICOES[c.transicao] }, '⋈'));
  });
  caixa.append(h('button', { class: 'clipe clipe--mais', type: 'button', onclick: () => escolherArquivos('video/*,image/*', true).then((a) => importar(a)) }, '+'));
  // Música embaixo
  const mu = projeto.musica && midias.get(projeto.musica.midia);
  $('faixaMusica').hidden = !mu;
  if (mu) $('faixaMusica').textContent = '♪ ' + mu.nome;
  marcarAgulha(l);
}

function marcarAgulha(l) {
  const ag = $('agulha');
  if (!l.total) { ag.hidden = true; return; }
  // Posição da agulha sobre o clipe em que o tempo está.
  const cards = $('clipes').querySelectorAll('.clipe:not(.clipe--mais)');
  const a = ativosEm(l, Math.min(tempo, l.total - 0.001)).pop();
  if (!a || !cards[a.i]) { ag.hidden = true; return; }
  const card = cards[a.i];
  ag.hidden = false;
  ag.style.left = (card.offsetLeft + card.offsetWidth * Math.min(1, a.local / a.dur)) + 'px';
}

// ---------- Painel do clipe ----------

function abas(c) {
  const l = [];
  if (c.tipo === 'colagem') l.push(['quadros', '▦ Quadros']);
  if (c.tipo === 'video') l.push(['cortar', '✂ Cortar']);
  if (c.tipo !== 'video') l.push(['duracao', '⏱ Duração']);
  if (c.tipo !== 'foto') l.push(['vel', '⏩ Velocidade']);
  if (c.tipo !== 'foto') l.push(['som', '🔊 Som']);
  l.push(['filtro', '🎨 Filtro'], ['texto', 'T Texto']);
  if (c.tipo !== 'colagem') l.push(['girar', '↻ Girar']);
  l.push(['trans', '⋈ Transição'], ['mais', '⋯ Mais']);
  return l;
}

function desenharPainel() {
  const p = $('painel');
  const c = clipeSel();
  p.hidden = !c;
  if (!c) return;
  const lista = abas(c);
  if (!lista.some(([k]) => k === aba)) aba = lista[0][0];
  const barra = h('div', { class: 'ferramentas' }, lista.map(([k, nome]) =>
    h('button', { type: 'button', class: 'ferr' + (k === aba ? ' on' : ''), onclick: () => { aba = k; desenharPainel(); } }, nome)));
  const corpo = h('div', { class: 'ferr-corpo' });
  const fn = { quadros: pQuadros, cortar: pCortar, duracao: pDuracao, vel: pVel, som: pSom, filtro: pFiltro, texto: pTexto, girar: pGirar, trans: pTrans, mais: pMais }[aba];
  fn(c, corpo);
  const rolagem = p.querySelector('.ferramentas');
  const x = rolagem ? rolagem.scrollLeft : 0;
  p.textContent = '';
  p.append(barra, corpo);
  barra.scrollLeft = x;
}

function deslizador(rotulo, min, max, passo, valor, mostrar, aoMudar, grupo) {
  const val = h('b', {}, mostrar(valor));
  const inp = h('input', {
    type: 'range', min, max, step: passo, value: valor,
    oninput: () => { const v = Number(inp.value); val.textContent = mostrar(v); mudar(() => aoMudar(v), grupo || rotulo); }
  });
  return h('label', { class: 'desl' }, h('span', {}, rotulo, ' ', val), inp);
}

function chips(opcoes, atual, aoEscolher, classe) {
  return h('div', { class: 'chips ' + (classe || '') }, opcoes.map(([v, nome]) =>
    h('button', { type: 'button', class: 'chip' + (String(v) === String(atual) ? ' on' : ''), onclick: () => aoEscolher(v) }, nome)));
}

function pCortar(c, el) {
  const m = midias.get(c.midia);
  const d = m ? m.dur : c.fim;
  el.append(
    deslizador('Começa em', 0, d, 0.05, c.ini, fmt, (v) => { c.ini = Math.min(v, c.fim - 0.2); tempo = posClipe(c) + 0.01; }),
    deslizador('Termina em', 0, d, 0.05, c.fim, fmt, (v) => { c.fim = Math.max(v, c.ini + 0.2); tempo = posClipe(c) + duracaoClipe(c, midias) - 0.05; }),
    h('div', { class: 'linha-btn' },
      h('button', { type: 'button', class: 'btn btn--sec', onclick: dividir }, '✂ Dividir no ponto atual'),
      h('button', { type: 'button', class: 'btn btn--sec', onclick: () => mudar(() => { c.ini = 0; c.fim = d; }) }, 'Vídeo inteiro')),
    h('p', { class: 'dica' }, 'Arraste a barra de tempo até o ponto e toque em Dividir para separar em dois pedaços.')
  );
}

function posClipe(c) {
  const it = linha().itens.find((x) => x.c.id === c.id);
  return it ? it.ini : 0;
}

function dividir() {
  const c = clipeSel();
  if (!c) return;
  const l = linha();
  const it = l.itens.find((x) => x.c.id === c.id);
  const local = tempo - it.ini;
  if (local < 0.2 || local > it.dur - 0.2) { aviso('Leve a barra de tempo para o meio do clipe antes de dividir.'); return; }
  mudar(() => {
    const novo = JSON.parse(JSON.stringify(c));
    novo.id = uid();
    if (c.tipo === 'video') {
      const corte = c.ini + local * (c.vel || 1);
      novo.ini = corte; c.fim = corte;
    } else {
      novo.dur = it.dur - local; c.dur = local;
      if (c.tipo === 'colagem') novo.celulas.forEach((cel) => { if (cel) cel.ini = (cel.ini || 0) + local * (c.vel || 1); });
    }
    c.transicao = 'corte';
    projeto.clipes.splice(it.i + 1, 0, novo);
    sel = novo.id;
  });
  aviso('Dividido em dois.');
}

function pDuracao(c, el) {
  if (c.tipo === 'colagem') {
    el.append(h('label', { class: 'check' },
      h('input', { type: 'checkbox', checked: !c.dur, onchange: (e) => mudar(() => { c.dur = e.target.checked ? 0 : Math.round(duracaoClipe(c, midias)); }) }),
      ' Automático (até o vídeo mais longo acabar)'));
    if (c.dur) el.append(deslizador('Duração', 1, 60, 0.5, c.dur, (v) => v.toFixed(1).replace('.', ',') + ' s', (v) => { c.dur = v; }));
    el.append(h('label', { class: 'check' },
      h('input', { type: 'checkbox', checked: c.repetir !== false, onchange: (e) => mudar(() => { c.repetir = e.target.checked; }) }),
      ' Repetir os vídeos mais curtos'));
  } else {
    el.append(deslizador('Duração da foto', 0.5, 20, 0.5, c.dur || 3, (v) => v.toFixed(1).replace('.', ',') + ' s', (v) => { c.dur = v; }));
    el.append(h('label', { class: 'check' },
      h('input', { type: 'checkbox', checked: c.kenBurns !== false, onchange: (e) => mudar(() => { c.kenBurns = e.target.checked; }) }),
      ' Aproximar devagar (movimento)'));
  }
}

function pVel(c, el) {
  el.append(chips([[0.25, '0,25×'], [0.5, '0,5×'], [0.75, '0,75×'], [1, 'Normal'], [1.5, '1,5×'], [2, '2×'], [3, '3×'], [4, '4×']],
    c.vel || 1, (v) => mudar(() => { c.vel = v; })));
  el.append(h('p', { class: 'dica' }, 'Câmera lenta: 0,5× ou menos. Acelerado: 2× ou mais. O som acompanha a velocidade.'));
}

function pSom(c, el) {
  if (c.tipo === 'video') {
    const m = midias.get(c.midia);
    if (m && !m.temAudio) { el.append(h('p', { class: 'dica' }, 'Este vídeo não tem som.')); return; }
    el.append(deslizador('Volume', 0, 2, 0.05, c.volume, (v) => Math.round(v * 100) + '%', (v) => { c.volume = v; }));
    el.append(h('div', { class: 'linha-btn' },
      h('button', { type: 'button', class: 'btn btn--sec', onclick: () => mudar(() => { c.volume = c.volume ? 0 : 1; }) }, c.volume ? '🔇 Tirar o som' : '🔊 Pôr o som'),
      h('button', { type: 'button', class: 'btn btn--sec', onclick: () => mudar(() => projeto.clipes.forEach((x) => { if (x.tipo === 'video') x.volume = 0; })) }, 'Sem som em todos')));
  } else {
    el.append(deslizador('Volume da colagem', 0, 2, 0.05, c.volume == null ? 1 : c.volume, (v) => Math.round(v * 100) + '%', (v) => { c.volume = v; }));
    el.append(h('p', { class: 'dica' }, 'Escolha de quais quadros sai o som na aba ▦ Quadros (🔊).'));
  }
}

function pFiltro(c, el) {
  el.append(chips(Object.entries(FILTROS).map(([k, f]) => [k, f.nome]), c.filtro || 'nenhum', (v) => mudar(() => { c.filtro = v; }), 'chips--filtro'));
  el.append(
    deslizador('Brilho', 50, 150, 1, c.brilho || 100, (v) => v + '%', (v) => { c.brilho = v; }),
    deslizador('Contraste', 50, 150, 1, c.contraste || 100, (v) => v + '%', (v) => { c.contraste = v; }),
    deslizador('Cor (saturação)', 0, 200, 1, c.saturacao == null ? 100 : c.saturacao, (v) => v + '%', (v) => { c.saturacao = v; }),
    h('div', { class: 'linha-btn' },
      h('button', { type: 'button', class: 'btn btn--sec', onclick: () => mudar(() => { c.brilho = 100; c.contraste = 100; c.saturacao = 100; c.filtro = 'nenhum'; }) }, 'Limpar'),
      h('button', { type: 'button', class: 'btn btn--sec', onclick: () => mudar(() => projeto.clipes.forEach((x) => { x.filtro = c.filtro; x.brilho = c.brilho; x.contraste = c.contraste; x.saturacao = c.saturacao; })) }, 'Usar em todos'))
  );
}

function pTexto(c, el) {
  const tx = c.texto || { txt: '', pos: 'baixo', cor: '#ffffff', tam: 7, estilo: 'contorno' };
  const area = h('textarea', {
    rows: 2, placeholder: 'Escreva o texto que aparece neste clipe', value: tx.txt,
    oninput: () => mudar(() => { c.texto = { ...tx, txt: area.value }; tx.txt = area.value; }, 'texto')
  });
  el.append(area,
    chips([['topo', 'Em cima'], ['meio', 'No meio'], ['baixo', 'Embaixo']], tx.pos, (v) => mudar(() => { c.texto = { ...tx, pos: v }; })),
    h('div', { class: 'cores' }, CORES_TEXTO.map((cor) => h('button', {
      type: 'button', class: 'cor' + (tx.cor === cor ? ' on' : ''), style: `background:${cor}`, 'aria-label': 'Cor ' + cor,
      onclick: () => mudar(() => { c.texto = { ...tx, cor }; })
    }))),
    chips([['contorno', 'Contorno'], ['caixa', 'Com fundo']], tx.estilo || 'contorno', (v) => mudar(() => { c.texto = { ...tx, estilo: v }; })),
    deslizador('Tamanho', 3, 16, 0.5, tx.tam || 7, (v) => String(v).replace('.', ','), (v) => { c.texto = { ...tx, tam: v }; tx.tam = v; })
  );
}

function pGirar(c, el) {
  el.append(
    h('div', { class: 'linha-btn' },
      h('button', { type: 'button', class: 'btn btn--sec', onclick: () => mudar(() => { c.girar = ((c.girar || 0) + 90) % 360; }) }, '↻ Girar 90°'),
      h('button', { type: 'button', class: 'btn btn--sec', onclick: () => mudar(() => { c.espelhar = !c.espelhar; }) }, '⇋ Espelhar')),
    h('p', { class: 'rot' }, 'Enquadrar'),
    chips([['ajustar', 'Mostrar inteiro'], ['preencher', 'Preencher a tela']], c.ajuste || 'ajustar', (v) => mudar(() => { c.ajuste = v; })),
    h('p', { class: 'dica' }, 'Mostrar inteiro deixa o vídeo todo na tela e preenche as sobras com o fundo (desfocado, preto ou branco).')
  );
}

function pTrans(c, el) {
  const l = linha();
  const it = l.itens.find((x) => x.c.id === c.id);
  if (!it || it.i === l.itens.length - 1) { el.append(h('p', { class: 'dica' }, 'A transição é a passagem deste clipe para o próximo. Este é o último clipe.')); return; }
  el.append(chips(Object.entries(TRANSICOES), c.transicao || 'corte', (v) => mudar(() => { c.transicao = v; tempo = Math.max(0, it.ini + it.dur - 1); })));
  el.append(h('button', { type: 'button', class: 'btn btn--sec', onclick: () => mudar(() => projeto.clipes.forEach((x) => { x.transicao = c.transicao; })) }, 'Usar em todos'));
}

function pMais(c, el) {
  const i = projeto.clipes.indexOf(c);
  el.append(h('div', { class: 'grade-btn' },
    h('button', { type: 'button', class: 'btn btn--sec', disabled: i === 0, onclick: () => mudar(() => { projeto.clipes.splice(i, 1); projeto.clipes.splice(i - 1, 0, c); }) }, '← Mover'),
    h('button', { type: 'button', class: 'btn btn--sec', disabled: i === projeto.clipes.length - 1, onclick: () => mudar(() => { projeto.clipes.splice(i, 1); projeto.clipes.splice(i + 1, 0, c); }) }, 'Mover →'),
    h('button', { type: 'button', class: 'btn btn--sec', onclick: () => mudar(() => { const n = JSON.parse(JSON.stringify(c)); n.id = uid(); projeto.clipes.splice(i + 1, 0, n); sel = n.id; }) }, '⧉ Duplicar'),
    c.tipo !== 'colagem' ? h('button', { type: 'button', class: 'btn btn--sec', onclick: () => colagemCom(c) }, '▦ Fazer colagem') : null,
    h('button', { type: 'button', class: 'btn btn--perigo', onclick: () => mudar(() => { projeto.clipes.splice(i, 1); sel = null; }) }, '🗑 Apagar clipe')
  ));
}

// ---------- Colagem ----------

function novaColagem(layout, primeiras) {
  const n = COLAGENS[layout].cel.length;
  const celulas = Array.from({ length: n }, (_, k) => primeiras && primeiras[k] ? primeiras[k] : null);
  return { id: uid(), tipo: 'colagem', layout, celulas, dur: 0, vel: 1, volume: 1, borda: 2, cantos: 0, corBorda: '#ffffff', filtro: 'nenhum', transicao: 'corte', repetir: true };
}

function celulaDe(m, som) { return { midia: m.id, ini: 0, som: !!(som && m.temAudio), zoom: 1 }; }

function colagemCom(c) {
  const fontes = fontesDoClipe(c).map((f) => midias.get(f.midia)).filter(Boolean);
  mudar(() => {
    const nova = novaColagem('2h', fontes.map((m, k) => celulaDe(m, k === 0)));
    const i = projeto.clipes.indexOf(c);
    projeto.clipes.splice(i, 1, nova);
    sel = nova.id; aba = 'quadros';
  });
}

function abrirEscolhaLayout(aoEscolher, atual) {
  abrirFolha('Escolha o modelo da colagem', (corpo) => {
    corpo.append(h('div', { class: 'layouts' }, Object.entries(COLAGENS).map(([k, lay]) => {
      const g = h('span', { class: 'layout__mini' }, lay.cel.map(([x, y, w, hh]) => h('i', { style: `left:${x * 100}%;top:${y * 100}%;width:${w * 100}%;height:${hh * 100}%` })));
      return h('button', { type: 'button', class: 'layout' + (k === atual ? ' on' : ''), onclick: () => { fecharFolha(); aoEscolher(k); } }, g, h('small', {}, lay.nome));
    })));
  });
}

async function criarColagem() {
  abrirEscolhaLayout(async (layout) => {
    const n = COLAGENS[layout].cel.length;
    aviso(`Escolha até ${n} vídeos ou fotos para a colagem.`);
    const arqs = (await escolherArquivos('video/*,image/*', true)).slice(0, n);
    const ms = [];
    if (arqs.length) {
      progresso('Abrindo os arquivos…', null);
      try { for (const f of arqs) { try { ms.push(await adicionarMidia(f)); } catch (e) { aviso(e.message, 'erro'); } } } finally { fimProgresso(); }
    }
    mudar(() => {
      if (!projeto.clipes.length) projeto.formato = '9:16';
      const nova = novaColagem(layout, ms.map((m, k) => celulaDe(m, k === 0)));
      projeto.clipes.push(nova);
      sel = nova.id; aba = 'quadros';
      tempo = linha().itens.find((x) => x.c.id === nova.id).ini + 0.01;
    });
  });
}

function pQuadros(c, el) {
  const lay = COLAGENS[c.layout] || COLAGENS['2h'];
  el.append(h('button', { type: 'button', class: 'btn btn--sec', onclick: () => abrirEscolhaLayout((k) => mudar(() => {
    const n = COLAGENS[k].cel.length;
    const velhas = c.celulas.filter(Boolean);
    c.layout = k;
    c.celulas = Array.from({ length: n }, (_, i) => velhas[i] || null);
  }), c.layout) }, '▦ Modelo: ' + lay.nome));
  const lista = h('div', { class: 'celulas' });
  lay.cel.forEach((_, k) => {
    const cel = c.celulas[k];
    const m = cel && midias.get(cel.midia);
    const trocar = async () => {
      const [f] = await escolherArquivos('video/*,image/*', false);
      if (!f) return;
      progresso('Abrindo…', null);
      try {
        const nm = await adicionarMidia(f);
        mudar(() => { c.celulas[k] = celulaDe(nm, !c.celulas.some((x) => x && x.som)); });
      } catch (e) { aviso(e.message, 'erro'); } finally { fimProgresso(); }
    };
    const linhaCel = h('div', { class: 'celula' },
      h('span', { class: 'celula__n' }, k + 1),
      h('button', { type: 'button', class: 'celula__img', style: m && m.thumb ? `background-image:url(${m.thumb})` : '', onclick: trocar }, m ? '' : '+'),
      h('div', { class: 'celula__info' },
        h('small', {}, m ? m.nome : 'Vazio — toque para escolher'),
        m && m.tipo === 'video' ? deslizador('Começa em', 0, Math.max(0.1, m.dur - 0.2), 0.05, cel.ini || 0, fmt, (v) => { cel.ini = v; }, 'cel' + k) : null,
        m ? deslizador('Zoom', 1, 3, 0.05, cel.zoom || 1, (v) => v.toFixed(2).replace('.', ',') + '×', (v) => { cel.zoom = v; }, 'zoom' + k) : null),
      h('div', { class: 'celula__acoes' },
        m && m.temAudio ? h('button', { type: 'button', class: 'mini' + (cel.som ? ' on' : ''), 'aria-label': 'Som deste quadro', onclick: () => mudar(() => { cel.som = !cel.som; }) }, cel.som ? '🔊' : '🔇') : null,
        m ? h('button', { type: 'button', class: 'mini', 'aria-label': 'Girar', onclick: () => mudar(() => { cel.girar = ((cel.girar || 0) + 90) % 360; }) }, '↻') : null,
        m ? h('button', { type: 'button', class: 'mini', 'aria-label': 'Tirar', onclick: () => mudar(() => { c.celulas[k] = null; }) }, '✕') : null)
    );
    lista.append(linhaCel);
  });
  el.append(lista,
    deslizador('Borda', 0, 8, 0.5, c.borda || 0, (v) => String(v).replace('.', ','), (v) => { c.borda = v; }),
    deslizador('Cantos arredondados', 0, 10, 0.5, c.cantos || 0, (v) => String(v).replace('.', ','), (v) => { c.cantos = v; }),
    h('div', { class: 'cores' }, ['#ffffff', '#000000', '#ffd400', '#ff2d92', '#0a84ff', '#1b2033'].map((cor) => h('button', {
      type: 'button', class: 'cor' + (c.corBorda === cor ? ' on' : ''), style: `background:${cor}`, 'aria-label': 'Cor da borda',
      onclick: () => mudar(() => { c.corBorda = cor; })
    })))
  );
}

// ---------- Música ----------

async function escolherMusica() {
  const [f] = await escolherArquivos('audio/*,video/*', false);
  if (!f) return;
  progresso('Abrindo a música…', null);
  try {
    const m = await adicionarMidia(f);
    if (!m.temAudio) throw new Error('Esse arquivo não tem som.');
    mudar(() => { projeto.musica = { midia: m.id, volume: 0.8, ini: 0, repetir: true, sumir: true }; });
    abrirMusica();
  } catch (e) { aviso(e.message, 'erro'); } finally { fimProgresso(); }
}

function abrirMusica() {
  const mu = projeto.musica && midias.get(projeto.musica.midia);
  if (!mu) { escolherMusica(); return; }
  abrirFolha('♪ Música de fundo', (corpo) => {
    const ms = projeto.musica;
    corpo.append(
      h('p', { class: 'nome-arq' }, mu.nome + ' · ' + fmt(mu.dur)),
      deslizador('Volume da música', 0, 1.5, 0.05, ms.volume, (v) => Math.round(v * 100) + '%', (v) => { ms.volume = v; }),
      deslizador('Começar a música em', 0, Math.max(0.1, mu.dur - 1), 0.5, ms.ini || 0, fmt, (v) => { ms.ini = v; }),
      h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: ms.repetir !== false, onchange: (e) => mudar(() => { ms.repetir = e.target.checked; }) }), ' Repetir se a música acabar antes'),
      h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: ms.sumir !== false, onchange: (e) => mudar(() => { ms.sumir = e.target.checked; }) }), ' Abaixar devagar no final'),
      h('div', { class: 'linha-btn' },
        h('button', { type: 'button', class: 'btn btn--sec', onclick: () => { fecharFolha(); escolherMusica(); } }, 'Trocar música'),
        h('button', { type: 'button', class: 'btn btn--perigo', onclick: () => { mudar(() => { projeto.musica = null; }); fecharFolha(); } }, 'Tirar música')),
      h('p', { class: 'dica' }, 'Para abaixar o som dos vídeos, escolha o clipe e use 🔊 Som.')
    );
  });
}

// ---------- Folha (janela de baixo) ----------

function abrirFolha(titulo, montar) {
  const f = $('folha');
  const corpo = $('folhaCorpo');
  $('folhaTitulo').textContent = titulo;
  corpo.textContent = '';
  montar(corpo);
  f.hidden = false;
}
function fecharFolha() { $('folha').hidden = true; }

// ---------- Projeto ----------

function desenharProjeto() {
  $('formatos').replaceChildren(...Object.keys(FORMATOS).map((k) =>
    h('button', { type: 'button', class: 'chip' + (projeto.formato === k ? ' on' : ''), onclick: () => mudar(() => { projeto.formato = k; }) }, k)));
  $('fundos').replaceChildren(...[['desfocado', 'Fundo desfocado'], ['preto', 'Preto'], ['branco', 'Branco']].map(([k, n]) =>
    h('button', { type: 'button', class: 'chip' + (projeto.fundo === k ? ' on' : ''), onclick: () => mudar(() => { projeto.fundo = k; }) }, n)));
  $('desfazer').disabled = !desfazer.length;
  if (document.activeElement !== $('marca')) $('marca').value = projeto.marca || '';
  $('fadeIn').checked = !!projeto.fadeIn;
  $('fadeOut').checked = projeto.fadeOut !== false;
  $('salvarVideo').disabled = !projeto.clipes.length;
  $('salvarFoto').disabled = !projeto.clipes.length;
}

function atualizarTudo() {
  desenharProjeto();
  desenharLinha();
  desenharPainel();
  pedirDesenho();
}

// ---------- Salvar vídeo ----------

let maxLado = null;
async function abrirSalvar() {
  if (tocando) pausar();
  const l = linha();
  if (!l.itens.length) return;
  let lado = Number(localStorage.getItem('editor.lado')) || 1080;
  let fps = Number(localStorage.getItem('editor.fps')) || 30;
  let qual = localStorage.getItem('editor.qual') || 'normal';
  abrirFolha('Salvar vídeo', (corpo) => {
    const info = h('p', { class: 'dica' });
    const resol = h('div');
    const montar = () => {
      const { w, h: hh } = tamanhoSaida(projeto.formato, lado);
      const mb = taxaVideo(w, hh, fps, qual) * l.total / 8 / 1048576 + l.total * 0.024;
      info.textContent = `${w} × ${hh} · ${fps} quadros/s · ${fmt(l.total)} · cerca de ${mb < 10 ? mb.toFixed(1).replace('.', ',') : Math.round(mb)} MB`;
      resol.replaceChildren(
        h('p', { class: 'rot' }, 'Resolução'),
        chips(Object.entries(RESOLUCOES).map(([k, n]) => [k, n + (maxLado && Number(k) > maxLado ? ' ✕' : '')]), lado, (v) => {
          if (maxLado && Number(v) > maxLado) { aviso('Este celular não consegue gravar nessa resolução.', 'erro'); return; }
          lado = Number(v); montar();
        }),
        h('p', { class: 'rot' }, 'Quadros por segundo'),
        chips([[30, '30 (normal)'], [60, '60 (mais liso)']], fps, (v) => { fps = Number(v); montar(); }),
        h('p', { class: 'rot' }, 'Qualidade'),
        chips([['economica', 'Arquivo menor'], ['normal', 'Alta'], ['maxima', 'Máxima']], qual, (v) => { qual = v; montar(); }),
        info);
    };
    montar();
    if (maxLado == null) maiorResolucao(projeto.formato).then((v) => { maxLado = v; if (lado > v) lado = v; montar(); }).catch(() => {});
    corpo.append(resol,
      h('button', { type: 'button', class: 'btn btn--pri', onclick: () => {
        localStorage.setItem('editor.lado', lado); localStorage.setItem('editor.fps', fps); localStorage.setItem('editor.qual', qual);
        fecharFolha(); salvarVideo(lado, fps, qual);
      } }, NATIVO ? '⬇ Salvar na galeria' : '⬇ Baixar o vídeo'),
      h('p', { class: 'dica' }, 'Deixe o app aberto e a tela ligada enquanto salva. Em 4K demora mais.'));
  });
}

async function salvarVideo(lado, fps, qualidade) {
  if (ocupado) return;
  ocupado = true; cancelar = false;
  $('cancelar').hidden = false;
  if (galeria) galeria.telaAcesa({ ligar: true }).catch(() => {});
  progresso('Preparando…', 0);
  try {
    const r = await exportarVideo(projeto, midias, {
      formato: projeto.formato, lado, fps, qualidade, galeria,
      aoProgresso: (p, txt) => progresso(txt, p), cancelado: () => cancelar
    });
    fimProgresso();
    mostrarPronto(r, 'video/mp4', `Vídeo salvo (${r.w}×${r.h})`);
  } catch (e) {
    fimProgresso();
    if (e.cancelado) aviso('Cancelado.');
    else { console.error(e); aviso('Não deu para salvar: ' + (e.message || e), 'erro'); }
  } finally {
    ocupado = false;
    $('cancelar').hidden = true;
    if (galeria) galeria.telaAcesa({ ligar: false }).catch(() => {});
  }
}

function mostrarPronto(r, mime, titulo) {
  abrirFolha('✓ ' + titulo, (corpo) => {
    if (r.uri) {
      corpo.append(h('p', { class: 'dica' }, 'Está na galeria, na pasta ' + (r.pasta || 'Editor de Vídeo') + '.'),
        h('div', { class: 'linha-btn' },
          h('button', { type: 'button', class: 'btn btn--pri', onclick: () => galeria.abrir({ uri: r.uri, mime }).catch((e) => aviso(e.message, 'erro')) }, '▶ Abrir'),
          h('button', { type: 'button', class: 'btn btn--sec', onclick: () => galeria.compartilhar({ uri: r.uri, mime }).catch((e) => aviso(e.message, 'erro')) }, '↗ Compartilhar')));
    } else if (r.blob) {
      const url = URL.createObjectURL(r.blob);
      const nome = r.nome || (mime.startsWith('video') ? 'video.mp4' : mime === 'image/jpeg' ? 'foto.jpg' : mime === 'audio/mpeg' ? 'audio.mp3' : 'audio.m4a');
      corpo.append(h('p', { class: 'dica' }, (r.blob.size / 1048576).toFixed(1).replace('.', ',') + ' MB'),
        h('a', { class: 'btn btn--pri', id: 'baixarArquivo', href: url, download: nome }, '⬇ Baixar ' + nome));
      if (mime.startsWith('video')) corpo.append(h('video', { class: 'previa-final', src: url, controls: true, playsInline: true }));
      if (mime.startsWith('audio')) corpo.append(h('audio', { src: url, controls: true }));
    }
  });
}

async function salvarFoto() {
  if (ocupado) return;
  if (tocando) pausar();
  ocupado = true;
  progresso('Salvando a foto…', null);
  try {
    const lado = Math.min(2160, Number(localStorage.getItem('editor.lado')) || 2160);
    const r = await fotoDoQuadro(projeto, midias, Math.min(tempo, Math.max(0, linha().total - 0.01)), lado, galeria);
    fimProgresso();
    mostrarPronto(r, 'image/jpeg', 'Foto salva');
  } catch (e) {
    fimProgresso();
    aviso('Não deu para salvar a foto: ' + (e.message || e), 'erro');
  } finally { ocupado = false; }
}

// ---------- Ferramentas rápidas (Áudio e conversão) ----------

let ferrArq = null; // { file, info }

async function escolherParaFerramenta() {
  const [f] = await escolherArquivos('video/*,audio/*', false);
  if (!f) return;
  progresso('Abrindo…', null);
  try {
    const info = await analisarMidia(f, f.name);
    ferrArq = { file: f, info, ini: 0, fim: info.dur };
    desenharFerramentas();
  } catch (e) { aviso('Não consegui abrir esse arquivo: ' + (e.message || e), 'erro'); } finally { fimProgresso(); }
}

function desenharFerramentas() {
  const el = $('ferrConteudo');
  el.textContent = '';
  if (!ferrArq) { el.append(h('p', { class: 'dica' }, 'Escolha um vídeo da galeria para extrair o áudio, tirar o som ou mudar a resolução (até 4K).')); return; }
  const { info } = ferrArq;
  el.append(h('p', { class: 'nome-arq' }, ferrArq.file.name + ' · ' + fmt(info.dur) + (info.w ? ` · ${info.w}×${info.h}` : '')));
  // Extrair áudio
  const kbps = Number(localStorage.getItem('editor.kbps')) || 192;
  const cAudio = h('section', { class: 'cartao' }, h('h3', {}, '🎵 Extrair áudio'));
  if (!info.temAudio) cAudio.append(h('p', { class: 'dica' }, 'Esse vídeo não tem som.'));
  else {
    let formato = localStorage.getItem('editor.audioFmt') || 'mp3';
    let taxa = kbps;
    const op = h('div');
    const montar = () => {
      op.replaceChildren(
        chips([['mp3', 'MP3'], ['m4a', 'M4A (som original, sem perder qualidade)']], formato, (v) => { formato = v; localStorage.setItem('editor.audioFmt', v); montar(); }),
        formato === 'mp3' ? chips([[128, '128 kbps'], [192, '192 kbps'], [320, '320 kbps']], taxa, (v) => { taxa = Number(v); localStorage.setItem('editor.kbps', v); montar(); }) : '',
      );
    };
    montar();
    cAudio.append(op,
      deslizadorSimples('Do', 0, info.dur, ferrArq.ini, (v) => { ferrArq.ini = Math.min(v, ferrArq.fim - 0.5); }),
      deslizadorSimples('Até', 0, info.dur, ferrArq.fim, (v) => { ferrArq.fim = Math.max(v, ferrArq.ini + 0.5); }),
      h('button', { type: 'button', class: 'btn btn--pri', onclick: () => rodarFerramenta({ modo: formato, kbps: taxa, ini: ferrArq.ini, fim: ferrArq.fim }, formato === 'mp3' ? 'audio/mpeg' : 'audio/mp4', 'Áudio extraído') }, '🎵 Extrair áudio'));
  }
  el.append(cAudio);
  if (info.temVideo) {
    el.append(h('section', { class: 'cartao' }, h('h3', {}, '🔇 Tirar o som do vídeo'),
      h('p', { class: 'dica' }, 'Salva o mesmo vídeo, na mesma qualidade, sem o áudio. É rápido.'),
      h('button', { type: 'button', class: 'btn btn--sec', disabled: !info.temAudio, onclick: () => rodarFerramenta({ modo: 'semSom' }, 'video/mp4', 'Vídeo sem som salvo') }, 'Tirar o som')));
    let lado = Number(localStorage.getItem('editor.ladoConv')) || 2160;
    const cRes = h('section', { class: 'cartao' }, h('h3', {}, '📺 Mudar a resolução'));
    const ch = h('div');
    const montar = () => ch.replaceChildren(chips([[480, '480p'], [720, '720p'], [1080, '1080p'], [1440, '2K'], [2160, '4K']], lado, (v) => { lado = Number(v); localStorage.setItem('editor.ladoConv', v); montar(); }));
    montar();
    cRes.append(ch, h('p', { class: 'dica' }, 'Menor = arquivo mais leve para mandar no WhatsApp. 4K = vídeo maior para TV e YouTube (não cria detalhes que o vídeo não tem).'),
      h('button', { type: 'button', class: 'btn btn--sec', onclick: () => rodarFerramenta({ modo: 'resolucao', lado }, 'video/mp4', 'Vídeo convertido') }, 'Converter'));
    el.append(cRes);
    el.append(h('section', { class: 'cartao' }, h('h3', {}, '✂ Editar este vídeo'),
      h('button', { type: 'button', class: 'btn btn--sec', onclick: () => { mostrarPagina('editor'); importar([ferrArq.file]); } }, 'Abrir no editor')));
  }
}

function deslizadorSimples(rotulo, min, max, valor, aoMudar) {
  const val = h('b', {}, fmt(valor));
  const inp = h('input', { type: 'range', min, max, step: 0.1, value: valor, oninput: () => { aoMudar(Number(inp.value)); val.textContent = fmt(Number(inp.value)); } });
  return h('label', { class: 'desl' }, h('span', {}, rotulo + ' ', val), inp);
}

async function rodarFerramenta(op, mime, titulo) {
  if (ocupado || !ferrArq) return;
  ocupado = true; cancelar = false;
  $('cancelar').hidden = false;
  if (galeria) galeria.telaAcesa({ ligar: true }).catch(() => {});
  progresso('Começando…', 0);
  try {
    const r = await converter(ferrArq.file, {
      ...op, galeria,
      aoProgresso: (p) => progresso(Math.round(p * 100) + '%', p),
      cancelado: () => cancelar
    });
    fimProgresso();
    mostrarPronto(r, mime, titulo);
  } catch (e) {
    fimProgresso();
    if (e.cancelado) aviso('Cancelado.');
    else { console.error(e); aviso(e.message || String(e), 'erro'); }
  } finally {
    ocupado = false;
    $('cancelar').hidden = true;
    if (galeria) galeria.telaAcesa({ ligar: false }).catch(() => {});
  }
}

// ---------- Páginas ----------

function mostrarPagina(p) {
  if (tocando) pausar();
  $('pgEditor').hidden = p !== 'editor';
  $('pgFerramentas').hidden = p !== 'ferramentas';
  document.querySelectorAll('.aba').forEach((b) => b.classList.toggle('on', b.dataset.pg === p));
  if (p === 'ferramentas') desenharFerramentas();
}

// ---------- Ligações ----------

$('play').addEventListener('click', () => (tocando ? pausar() : tocar()));
$('rolar').addEventListener('input', () => { if (tocando) pausar(); tempo = Number($('rolar').value); pedirDesenho(); });
$('tela').addEventListener('click', () => (tocando ? pausar() : tocar()));
$('addMidia').addEventListener('click', () => escolherArquivos('video/*,image/*', true).then((a) => importar(a)));
$('addColagem').addEventListener('click', criarColagem);
$('addMusica').addEventListener('click', abrirMusica);
$('faixaMusica').addEventListener('click', abrirMusica);
$('desfazer').addEventListener('click', voltar);
$('novo').addEventListener('click', () => {
  if (projeto.clipes.length && !confirm('Começar um projeto novo? O atual será apagado.')) return;
  pausar();
  mudar(() => { projeto = novoProjeto(); sel = null; tempo = 0; });
});
$('salvarVideo').addEventListener('click', abrirSalvar);
$('salvarFoto').addEventListener('click', salvarFoto);
$('folhaFechar').addEventListener('click', fecharFolha);
$('folha').addEventListener('click', (e) => { if (e.target === $('folha')) fecharFolha(); });
$('cancelar').addEventListener('click', () => { cancelar = true; progresso('Cancelando…', null); });
$('ferrEscolher').addEventListener('click', escolherParaFerramenta);
document.querySelectorAll('.aba').forEach((b) => b.addEventListener('click', () => mostrarPagina(b.dataset.pg)));
$('marca').addEventListener('input', () => mudar(() => { projeto.marca = $('marca').value; }, 'marca'));
$('fadeIn').addEventListener('change', () => mudar(() => { projeto.fadeIn = $('fadeIn').checked; }));
$('fadeOut').addEventListener('change', () => mudar(() => { projeto.fadeOut = $('fadeOut').checked; }));

if (appCap) {
  appCap.addListener('backButton', () => {
    if (!$('folha').hidden) fecharFolha();
    else if (!$('pgFerramentas').hidden) mostrarPagina('editor');
    else if (sel) { sel = null; atualizarTudo(); }
    else appCap.minimizeApp();
  });
  appCap.addListener('pause', () => { if (tocando) pausar(); });
}

// ---------- Início ----------

async function iniciar() {
  if (!('VideoEncoder' in window)) $('semWebCodecs').hidden = false;
  if (galeria) galeria.limparTemporarios().catch(() => {});
  try {
    const guardadas = await lerMidias();
    for (const g of guardadas) {
      const m = { ...g, url: URL.createObjectURL(g.blob) };
      midias.set(m.id, m);
      miniatura(m.blob, m.tipo).then((u) => { m.thumb = u; quandoMiniatura(); }).catch(() => {});
    }
  } catch (e) { console.warn('sem IndexedDB', e); }
  // Clipes cujo arquivo sumiu saem do projeto.
  projeto.clipes = projeto.clipes.filter((c) => c.tipo === 'colagem' || midias.has(c.midia));
  projeto.clipes.forEach((c) => { if (c.tipo === 'colagem') c.celulas = c.celulas.map((x) => (x && midias.has(x.midia) ? x : null)); });
  if (projeto.musica && !midias.has(projeto.musica.midia)) projeto.musica = null;
  $('marca').value = projeto.marca || '';
  $('fadeIn').checked = !!projeto.fadeIn;
  $('fadeOut').checked = projeto.fadeOut !== false;
  atualizarTudo();
}

window.addEventListener('resize', () => { marcarAgulha(linha()); });
iniciar();

// Para testes automáticos.
window.__editor = { get projeto() { return projeto; }, midias, importar, exportarVideo, converter, linha, set tempo(v) { tempo = v; pedirDesenho(); } };
