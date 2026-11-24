/* Editor de Vídeo — telas. O motor (motor.js) desenha os quadros e grava o MP4; aqui ficam a prévia,
   a linha do tempo (agulha parada no meio, vídeo correndo por baixo), a barra de ferramentas,
   a colagem, a música e as ferramentas rápidas. */
import {
  FORMATOS, RESOLUCOES, FILTROS, COLAGENS, TRANSICOES, CORES_TEXTO,
  analisarMidia, tiras, linhaDoTempo, ativosEm, tempoOrigem, fontesDoClipe, desenharQuadro,
  tamanhoSaida, taxaVideo, exportarVideo, maiorResolucao, converter, fotoDoQuadro, duracaoClipe,
  audioDaFala, agruparLegendas, trocarTextoLegenda, ESTILO_LEGENDA
} from './motor.js';
import { guardarMidia, lerMidias, apagarMidia, guardarProjeto, lerProjeto } from './armazem.js';

const $ = (id) => document.getElementById(id);
const Cap = window.Capacitor;
const NATIVO = !!(Cap && Cap.isNativePlatform && Cap.isNativePlatform());
const plugin = (n) => (NATIVO ? (Cap.Plugins && Cap.Plugins[n]) || (Cap.registerPlugin && Cap.registerPlugin(n)) || null : null);
const galeria = plugin('Galeria');
const appCap = plugin('App');

// ---------- Estado ----------

const novoProjeto = () => ({ formato: '9:16', fundo: 'desfocado', clipes: [], audios: [], sumirMusica: true, marca: '', fadeIn: false, fadeOut: true });
let projeto = lerProjeto() || novoProjeto();
const midias = new Map(); // id → { id, blob, nome, tipo, dur, w, h, temAudio, url, thumb, tiras }
let sel = null;           // id do clipe escolhido
let selAudio = null;      // id do trecho de música escolhido (faixa verde)
let aba = 'cortar';       // ferramenta aberta no painel do clipe
let painelAberto = false;
let painelGeral = null;   // painel que não é de um clipe (ex.: 'legendas')
let tempo = 0;            // posição da prévia (s)
let tocando = false;
let ocupado = false;
let cancelar = false;
const desfazer = [];
const refazer = [];
let ultimoGrupo = '', ultimoGrupoT = 0;

const uid = () => Math.random().toString(36).slice(2, 10);
const linha = () => linhaDoTempo(projeto, midias);
const clipeSel = () => projeto.clipes.find((c) => c.id === sel) || null;
const audioSel = () => (projeto.audios || []).find((a) => a.id === selAudio) || null;
const durTrecho = (a) => Math.max(0, a.fim - a.ini);
const fmt = (s) => {
  s = Math.max(0, s || 0);
  const m = Math.floor(s / 60), r = s - m * 60;
  return m + ':' + (r < 10 ? '0' : '') + r.toFixed(1).replace('.', ',');
};
const mmss = (s) => {
  s = Math.max(0, Math.floor(s || 0));
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
};

/** Toda mudança passa por aqui: guarda para o "Desfazer", salva e redesenha. */
function mudar(fn, grupo, op) {
  const agora = Date.now();
  if (!grupo || grupo !== ultimoGrupo || agora - ultimoGrupoT > 1500) {
    desfazer.push(JSON.stringify(projeto));
    if (desfazer.length > 40) desfazer.shift();
    refazer.length = 0;
  }
  ultimoGrupo = grupo || ''; ultimoGrupoT = agora;
  fn();
  salvar();
  atualizarTudo(op);
}

function voltar() {
  if (!desfazer.length) return;
  refazer.push(JSON.stringify(projeto));
  projeto = JSON.parse(desfazer.pop());
  depoisDeTrocar();
}

function avancar() {
  if (!refazer.length) return;
  desfazer.push(JSON.stringify(projeto));
  projeto = JSON.parse(refazer.pop());
  depoisDeTrocar();
}

function depoisDeTrocar() {
  ultimoGrupo = '';
  if (sel && !clipeSel()) { sel = null; painelAberto = false; }
  if (selAudio && !audioSel()) { selAudio = null; painelAberto = false; }
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
    (projeto.audios || []).forEach((a) => usados.add(a.midia));
    for (const id of [...midias.keys()]) {
      if (!usados.has(id) && !desfazer.some((d) => d.includes(id)) && !refazer.some((d) => d.includes(id))) {
        const m = midias.get(id);
        if (m.url) URL.revokeObjectURL(m.url);
        midias.delete(id);
        apagarMidia(id).catch(() => {});
        soltarPlayer(id);
      }
    }
  }, 400);
}

// ---------- Ícones (desenhos próprios do app) ----------

const IC = {
  novo: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M12 11v6M9 14h6"/>',
  ajuda: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6"/><path d="M12 17h.01"/>',
  tocar: '<path d="M7 4.5v15l13-7.5z" fill="currentColor" stroke="none"/>',
  pausar: '<rect x="6" y="4.5" width="4" height="15" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="4.5" width="4" height="15" rx="1" fill="currentColor" stroke="none"/>',
  cheia: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  encolher: '<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>',
  desfazer: '<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>',
  refazer: '<path d="m15 14 5-5-5-5"/><path d="M20 9H9a5 5 0 0 0 0 10h3"/>',
  cortar: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M8.2 8.2 20 20M8.2 15.8 20 4"/>',
  musica: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
  texto: '<path d="M5 7V4h14v3M12 4v16M9 20h6"/>',
  colagem: '<rect x="3" y="3" width="8" height="18" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/>',
  filtro: '<circle cx="9" cy="9" r="5.5"/><circle cx="15" cy="9" r="5.5"/><circle cx="12" cy="15" r="5.5"/>',
  formato: '<rect x="6" y="3" width="12" height="18" rx="2"/><path d="M3 8v8M21 8v8"/>',
  conversor: '<path d="M3 12h1M7 8v8M11 5v14M15 9v6M19 11v2"/>',
  foto: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  volta: '<path d="m15 5-7 7 7 7"/>',
  dividir: '<path d="M12 3v18"/><path d="M8 7H5v10h3M16 7h3v10h-3"/>',
  vel: '<path d="M4 17a8 8 0 1 1 16 0"/><path d="m12 17 4-5"/>',
  som: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',
  girar: '<path d="M20 12a8 8 0 1 1-2.3-5.7"/><path d="M20 4v5h-5"/>',
  trans: '<path d="M3 5l8 7-8 7zM21 5l-8 7 8 7z"/>',
  duplicar: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  apagar: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  duracao: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M10 2h4"/>',
  mudo: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="m17 9 5 6M22 9l-5 6"/>',
  legenda: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M7 11h3M12.5 11H17M7 15h10"/>',
  mais: '<circle cx="5" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="19" cy="12" r="1.4" fill="currentColor"/>'
};

function icone(nome) {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '0 0 24 24');
  s.setAttribute('fill', 'none');
  s.setAttribute('stroke', 'currentColor');
  s.setAttribute('stroke-width', '1.7');
  s.setAttribute('stroke-linecap', 'round');
  s.setAttribute('stroke-linejoin', 'round');
  s.setAttribute('class', 'ic');
  s.setAttribute('aria-hidden', 'true');
  s.innerHTML = IC[nome] || '';
  return s;
}
const porIcone = (id, nome) => $(id).replaceChildren(icone(nome));

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
  carregarTiras(m);
  return m;
}

function carregarTiras(m) {
  if (m.tipo === 'audio') return;
  tiras(m.blob, m.tipo, m.dur).then((l) => {
    m.tiras = l;
    m.thumb = l[0] && l[0].url;
    quandoMiniatura();
  }).catch(() => {});
}

// Miniaturas chegaram: redesenha a linha do tempo (e o painel, se ninguém estiver mexendo nele).
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
const audiosEl = new Map(); // id do trecho → <audio>

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
    el.addEventListener('loadeddata', () => { el.dataset.teveQuadro = '1'; pedirDesenho(); });
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
  // Enquanto procura o quadro novo, o <video> continua mostrando o anterior (não fica preto).
  return el.videoWidth && (el.readyState >= 2 || el.dataset.teveQuadro) ? { img: el, w: el.videoWidth, h: el.videoHeight } : null;
}

function ajustarTela() {
  const { w, h } = tamanhoSaida(projeto.formato, 540);
  if (tela.width !== w || tela.height !== h) { tela.width = w; tela.height = h; }
  // Ocupa o maior espaço possível do palco mantendo o formato.
  const p = $('palco');
  const aw = p.clientWidth - 24, ah = p.clientHeight - 8;
  if (aw > 0 && ah > 0) {
    const s = Math.min(aw / w, ah / h);
    tela.style.width = Math.floor(w * s) + 'px';
    tela.style.height = Math.floor(h * s) + 'px';
  }
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
  $('tempo').innerHTML = '<b>' + mmss(tempo) + '</b> / ' + mmss(l.total);
  rolarPara(tempo);
}

// Tocar: os <video> andam sozinhos e a tela desenha o que eles mostram.
let t0 = 0, base = 0;
let pararEm = null; // para sozinho neste tempo (ver a transição)
function tocar() {
  const l = linha();
  if (!l.itens.length) return;
  if (tempo >= l.total - 0.05) tempo = 0;
  tocando = true;
  base = tempo; t0 = performance.now();
  porIcone('play', 'pausar');
  $('play').setAttribute('aria-label', 'Pausar');
  requestAnimationFrame(passo);
}

function pausar() {
  tocando = false;
  pararEm = null;
  for (const el of players.values()) el.pause();
  for (const el of audiosEl.values()) el.pause();
  porIcone('play', 'tocar');
  $('play').setAttribute('aria-label', 'Tocar');
  pedirDesenho();
}

function passo() {
  if (!tocando) return;
  const l = linha();
  tempo = base + (performance.now() - t0) / 1000;
  if (tempo >= l.total) { tempo = l.total; pararEm = null; pausar(); return; }
  if (pararEm != null && tempo >= pararEm) { pararEm = null; pausar(); return; }
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
  const ativos = new Set();
  for (const a of projeto.audios || []) {
    const mu = midias.get(a.midia);
    if (!mu || tempo < a.pos || tempo >= a.pos + durTrecho(a)) continue;
    let el = audiosEl.get(a.id);
    if (!el || el.dataset.midia !== mu.id) {
      if (el) soltarEl(el);
      el = document.createElement('audio');
      el.dataset.midia = mu.id;
      el.src = mu.url;
      audiosEl.set(a.id, el);
    }
    ativos.add(a.id);
    const s = a.ini + (tempo - a.pos);
    let vol = a.volume;
    const l = linha();
    if (projeto.sumirMusica !== false && l.total > 3 && tempo > l.total - 2) vol *= Math.max(0, (l.total - tempo) / 2);
    el.volume = Math.max(0, Math.min(1, vol));
    if (el.paused) { el.currentTime = s; el.play().catch(() => {}); }
    else if (Math.abs(el.currentTime - s) > 0.35) el.currentTime = s;
  }
  for (const [id, el] of audiosEl) {
    if (!ativos.has(id) && !el.paused) el.pause();
    if (!(projeto.audios || []).some((a) => a.id === id)) { soltarEl(el); audiosEl.delete(id); }
  }
}

// ---------- Linha do tempo (agulha parada no meio) ----------

const PX = 60;   // pixels por segundo
const TILE = 46; // largura de cada miniatura
const meio = () => Math.round($('rolo').clientWidth / 2);

function rolarPara(t) {
  if (arrasto) return; // durante o arraste da alça quem manda na rolagem é o dedo
  const r = $('rolo');
  const x = Math.round(t * PX);
  if (Math.abs(r.scrollLeft - x) >= 1) { ultimaRolagem = x; r.scrollLeft = x; }
}
let ultimaRolagem = -1; // última rolagem feita pelo app (não pelo dedo)

// O dedo arrasta a linha do tempo: o tempo segue o que está embaixo da agulha.
$('rolo').addEventListener('scroll', () => {
  if (arrasto) return; // no arraste da alça a prévia mostra o ponto do corte
  const x = $('rolo').scrollLeft;
  const t = x / PX;
  if (Math.abs(t - tempo) < 1.5 / PX || Math.abs(x - ultimaRolagem) < 1.5) return; // fomos nós que rolamos
  const l = linha();
  if (tocando) pausar();
  tempo = Math.max(0, Math.min(l.total, t));
  pedirDesenho();
}, { passive: true });
$('rolo').addEventListener('pointerdown', () => { if (tocando) pausar(); });
// Segurar o dedo parado na linha do tempo não abre o menu do toque longo do Android.
$('linha').addEventListener('contextmenu', (e) => e.preventDefault());

function tiraMaisPerto(m, s) {
  if (!m || !m.tiras || !m.tiras.length) return m && m.thumb;
  let melhor = m.tiras[0];
  for (const x of m.tiras) if (Math.abs(x.t - s) < Math.abs(melhor.t - s)) melhor = x;
  return melhor.url;
}

function desenharLinha() {
  const l = linha();
  const m0 = meio();
  $('conteudo').style.width = (l.total * PX + m0 * 2) + 'px';
  // Durante o arraste da alça, só estica/encolhe o pedaço puxado: refazer a faixa trocaria a alça
  // que está embaixo do dedo e o celular perderia o toque.
  if (arrasto && arrasto.el && arrasto.el.isConnected) {
    const cx = arrasto.alvo.caixa();
    if (cx) {
      arrasto.el.style.left = (m0 + cx.left) + 'px';
      arrasto.el.style.width = cx.width + 'px';
      const rot = arrasto.el.querySelector('.clipe__rot');
      if (rot && cx.dur != null) rot.textContent = cx.dur.toFixed(1).replace('.', ',') + 's';
    }
    return;
  }
  // Régua
  const regua = $('regua');
  regua.textContent = '';
  const passo = l.total > 240 ? 10 : l.total > 90 ? 5 : l.total > 40 ? 2 : 1;
  for (let s = 0; s <= l.total + 0.001; s += passo) {
    regua.append(h('span', { style: `left:${m0 + s * PX}px` }, mmss(s)));
    if (s + passo / 2 <= l.total) regua.append(h('i', { style: `left:${m0 + (s + passo / 2) * PX}px` }));
  }
  // Clipes
  const trilha = $('trilha');
  trilha.textContent = '';
  l.itens.forEach((it) => {
    const c = it.c;
    const larg = Math.max(10, it.dur * PX - 2);
    const el = h('div', {
      class: 'clipe' + (c.id === sel ? ' sel' : ''), role: 'button', tabindex: 0,
      style: `left:${m0 + it.ini * PX + 1}px;width:${larg}px;z-index:${c.id === sel ? 3 : 1}`,
      onclick: () => escolherClipe(c, it)
    });
    const n = Math.ceil(larg / TILE);
    const fontes = fontesDoClipe(c);
    for (let k = 0; k < n; k++) {
      if (c.tipo === 'colagem') {
        const t = h('span', { class: 'ladrilho' });
        (COLAGENS[c.layout] || COLAGENS['2h']).cel.forEach(([x, y, w, hh], q) => {
          const m = c.celulas[q] && midias.get(c.celulas[q].midia);
          t.append(h('i', { style: `left:${x * 100}%;top:${y * 100}%;width:${w * 100}%;height:${hh * 100}%;` + (m && m.thumb ? `background-image:url(${m.thumb})` : '') }));
        });
        el.append(t);
      } else {
        const m = midias.get(fontes[0] && fontes[0].midia);
        const local = Math.min(it.dur, (k * TILE + TILE / 2) / PX);
        const url = c.tipo === 'video' ? tiraMaisPerto(m, tempoOrigem(c, null, local, midias)) : m && m.thumb;
        el.append(url ? h('img', { src: url, alt: '', draggable: false }) : h('span', { class: 'ladrilho', style: 'background:#2a2c34' }));
      }
    }
    el.append(h('span', { class: 'clipe__rot' }, it.dur.toFixed(1).replace('.', ',') + 's'));
    const extras = [(c.vel || 1) !== 1 ? c.vel + '×' : '', c.texto && c.texto.txt ? 'T' : '', c.tipo === 'colagem' ? '▦' : ''].filter(Boolean).join(' ');
    if (extras) el.append(h('span', { class: 'clipe__rot clipe__rot--dir' }, extras));
    // Som ligado/desligado, discreto no começo do vídeo.
    const mv = c.tipo === 'video' && midias.get(c.midia);
    if (mv && mv.temAudio) {
      el.append(h('button', {
        type: 'button', class: 'som-clipe' + (c.volume ? '' : ' mudo'), 'aria-label': c.volume ? 'Tirar o som deste vídeo' : 'Pôr o som deste vídeo',
        onpointerdown: (e) => e.stopPropagation(),
        onclick: (e) => {
          e.stopPropagation();
          mudar(() => { if (c.volume) { c.volAntes = c.volume; c.volume = 0; } else c.volume = c.volAntes || 1; });
          aviso(c.volume ? 'Som do vídeo ligado.' : 'Som do vídeo desligado.');
        }
      }, icone(c.volume ? 'som' : 'mudo')));
    }
    if (c.id === sel) {
      el.append(h('span', { class: 'alca alca--esq', onpointerdown: (e) => arrastar(e, alvoClipe(c, 'esq')), 'aria-label': 'Puxar o começo' }));
      el.append(h('span', { class: 'alca alca--dir', onpointerdown: (e) => arrastar(e, alvoClipe(c, 'dir')), 'aria-label': 'Puxar o fim' }));
    }
    trilha.append(el);
    // Junção com o próximo: toque para escolher a transição.
    const vizinhoSel = c.id === sel || (l.itens[it.i + 1] && l.itens[it.i + 1].c.id === sel);
    if (it.i < l.itens.length - 1 && !vizinhoSel) {
      const tr = c.transicao || 'corte';
      trilha.append(h('button', {
        type: 'button', class: 'junta' + (tr !== 'corte' ? ' on' : ''), title: TRANSICOES[tr],
        style: `left:${m0 + (it.ini + it.dur - it.sobreSaida / 2) * PX}px`,
        onclick: () => abrirFerramenta(c, 'trans')
      }, SIMBOLO_TRANS[tr] || '⋈'));
    }
  });
  // Música: cada trecho na faixa verde (toque para escolher, alças para cortar)
  const tm = $('trilhaMusica');
  tm.textContent = '';
  for (const a of projeto.audios || []) {
    const mu = midias.get(a.midia);
    if (!mu) continue;
    const eSel = a.id === selAudio;
    const el = h('div', {
      class: 'musica' + (eSel ? ' sel' : ''), role: 'button', tabindex: 0,
      style: `left:${m0 + a.pos * PX}px;width:${Math.max(12, durTrecho(a) * PX - 2)}px`,
      onclick: () => escolherAudio(a)
    }, h('span', { class: 'musica__nome' }, '♪ ' + mu.nome));
    if (eSel) {
      el.append(h('span', { class: 'alca alca--esq', onpointerdown: (e) => arrastar(e, alvoAudio(a, 'esq')), 'aria-label': 'Puxar o começo da música' }));
      el.append(h('span', { class: 'alca alca--dir', onpointerdown: (e) => arrastar(e, alvoAudio(a, 'dir')), 'aria-label': 'Puxar o fim da música' }));
    }
    tm.append(el);
  }
  if (!(projeto.audios || []).length && l.itens.length) {
    tm.append(h('button', { type: 'button', class: 'musica-add', style: `left:${m0}px`, onclick: escolherMusica }, '♪ + Adicionar música'));
  }
  $('maisFim').hidden = !l.itens.length;
  document.querySelector('.agulha').hidden = !l.itens.length;
  rolarPara(tempo);
}

function escolherClipe(c, it) {
  if (tocando) pausar();
  painelGeral = null;
  selAudio = null;
  if (sel === c.id) { sel = null; painelAberto = false; }
  else {
    sel = c.id;
    if (tempo < it.ini || tempo >= it.ini + it.dur) tempo = it.ini + 0.01;
  }
  atualizarTudo();
}

/**
 * Puxar a alça do clipe escolhido: segura e arrasta para cortar o começo ou o fim.
 * Com o dedo perto da beirada, a linha do tempo corre sozinha (mais rápido quanto mais no canto)
 * e continua cortando enquanto o dedo estiver na tela, até chegar no limite do vídeo.
 */
let arrasto = null;
const BEIRA = 72;      // largura da faixa da beirada que faz correr (px)
const VEL_MAX = 900;   // velocidade máxima da corrida (px/s)

/** O que a alça corta: um clipe de vídeo/foto. */
function alvoClipe(c, lado) {
  const orig = { ini: c.ini, fim: c.fim, dur: duracaoClipe(c, midias) };
  const m = midias.get(c.midia);
  const lim = (v, x, y) => Math.max(x, Math.min(y, v));
  const it = () => linha().itens.find((x) => x.c.id === c.id);
  return {
    aplicar(ds) {
      if (c.tipo === 'video') {
        const v = c.vel || 1;
        if (lado === 'dir') {
          const max = m ? m.dur : orig.fim;
          c.fim = lim(orig.fim + ds * v, c.ini + 0.2, max);
          return ds < 0 ? c.fim <= c.ini + 0.2 + 1e-6 : c.fim >= max - 1e-6;
        }
        c.ini = lim(orig.ini + ds * v, 0, c.fim - 0.2);
        return ds < 0 ? c.ini <= 1e-6 : c.ini >= c.fim - 0.2 - 1e-6;
      }
      const d = lado === 'dir' ? orig.dur + ds : orig.dur - ds;
      c.dur = Math.round(Math.max(0.5, Math.min(120, d)) * 10) / 10;
      return c.dur <= 0.5 || c.dur >= 120;
    },
    tempo() { const x = it(); return x ? (lado === 'dir' ? x.ini + x.dur - 0.03 : x.ini + 0.01) : tempo; },
    caixa() { const x = it(); return x ? { left: x.ini * PX + 1, width: Math.max(10, x.dur * PX - 2), dur: x.dur } : null; }
  };
}

/** O que a alça corta: um trecho de música da faixa verde. */
function alvoAudio(a, lado) {
  const orig = { pos: a.pos, ini: a.ini, fim: a.fim };
  const m = midias.get(a.midia);
  const max = m ? m.dur : orig.fim;
  const lim = (v, x, y) => Math.max(x, Math.min(y, v));
  return {
    aplicar(ds) {
      if (lado === 'dir') {
        a.fim = lim(orig.fim + ds, a.ini + 0.3, max);
        return ds < 0 ? a.fim <= a.ini + 0.3 + 1e-6 : a.fim >= max - 1e-6;
      }
      // Começo: o trecho continua no mesmo lugar da música, só começa mais tarde (ou mais cedo).
      const d = lim(ds, Math.max(-orig.ini, -orig.pos), orig.fim - 0.3 - orig.ini);
      a.ini = orig.ini + d;
      a.pos = orig.pos + d;
      return ds < 0 ? d <= Math.max(-orig.ini, -orig.pos) + 1e-6 : d >= orig.fim - 0.3 - orig.ini - 1e-6;
    },
    tempo() { return lado === 'dir' ? a.pos + durTrecho(a) - 0.03 : a.pos + 0.01; },
    caixa() { return { left: a.pos * PX, width: Math.max(12, durTrecho(a) * PX - 2) }; }
  };
}

function arrastar(e, alvo) {
  e.preventDefault();
  e.stopPropagation();
  if (tocando) pausar();
  if (arrasto) return;
  const rolo = $('rolo');
  const alca = e.currentTarget;
  const toque = e.pointerType === 'touch';
  try { alca.setPointerCapture(e.pointerId); } catch (x) {}
  const xConteudo = (cx) => rolo.scrollLeft + cx - rolo.getBoundingClientRect().left;
  arrasto = { alvo, id: e.pointerId, x: e.clientX, x0: xConteudo(e.clientX), t: performance.now(), xConteudo, el: alca.parentElement };
  const pegar = (x) => { if (!arrasto) return; arrasto.x = x; arrasto.travado = 0; aplicarArrasto(); };
  // No celular segue o próprio toque do dedo (não é cancelado pelo Android); no mouse, o ponteiro.
  const moverP = (ev) => { if (!toque && arrasto && ev.pointerId === arrasto.id) pegar(ev.clientX); };
  const moverT = (ev) => { if (ev.cancelable) ev.preventDefault(); const t = ev.touches[0]; if (t) pegar(t.clientX); };
  const soltar = (ev) => {
    if (!arrasto) return;
    if (ev && ev.type.startsWith('pointer') && (toque || ev.pointerId !== arrasto.id)) return;
    if (ev && ev.type === 'touchend' && ev.touches.length) return;
    try { alca.releasePointerCapture(arrasto.id); } catch (x) {}
    arrasto = null;
    window.removeEventListener('pointermove', moverP);
    window.removeEventListener('pointerup', soltar);
    window.removeEventListener('pointercancel', soltar);
    alca.removeEventListener('touchmove', moverT);
    alca.removeEventListener('touchend', soltar);
    alca.removeEventListener('touchcancel', soltar);
    tempo = Math.max(0, alvo.tempo());
    atualizarTudo();
  };
  window.addEventListener('pointermove', moverP);
  window.addEventListener('pointerup', soltar);
  window.addEventListener('pointercancel', soltar);
  if (toque) {
    // O toque fica preso na alça: por isso a alça NÃO é refeita durante o arraste (ver desenharLinha).
    alca.addEventListener('touchmove', moverT, { passive: false });
    alca.addEventListener('touchend', soltar);
    alca.addEventListener('touchcancel', soltar);
  }
  requestAnimationFrame(correrNaBeira);
}

/** Corta conforme a posição do dedo dentro da linha do tempo. Devolve true se chegou no limite. */
function aplicarArrasto() {
  const a = arrasto;
  if (!a) return true;
  const ds = (a.xConteudo(a.x) - a.x0) / PX;
  let noLimite = false;
  mudar(() => { noLimite = a.alvo.aplicar(ds); }, 'arrasto');
  // A prévia mostra o ponto exato onde está cortando.
  tempo = Math.max(0, a.alvo.tempo());
  pedirDesenho();
  return noLimite;
}

function correrNaBeira(agora) {
  const a = arrasto;
  if (!a) return;
  const dt = Math.min(0.05, (agora - a.t) / 1000);
  a.t = agora;
  const rolo = $('rolo');
  const r = rolo.getBoundingClientRect();
  let v = 0;
  const dEsq = a.x - r.left, dDir = r.right - a.x;
  if (dEsq < BEIRA) v = -VEL_MAX * Math.pow(Math.min(1, (BEIRA - dEsq) / BEIRA), 1.6);
  else if (dDir < BEIRA) v = VEL_MAX * Math.pow(Math.min(1, (BEIRA - dDir) / BEIRA), 1.6);
  if (v && Math.sign(v) !== a.travado) {
    const antes = rolo.scrollLeft;
    rolo.scrollLeft = antes + v * dt;
    if (rolo.scrollLeft !== antes) {
      // Chegou no limite do vídeo: fica no limite e a linha do tempo para de correr para esse lado.
      if (aplicarArrasto()) a.travado = Math.sign(v);
      pedirDesenho();
    }
  }
  requestAnimationFrame(correrNaBeira);
}

// ---------- Barra de ferramentas ----------

const NOMES = {
  quadros: ['colagem', 'Quadros'], cortar: ['cortar', 'Cortar'], duracao: ['duracao', 'Duração'], vel: ['vel', 'Velocidade'],
  som: ['som', 'Volume'], filtro: ['filtro', 'Filtros'], texto: ['texto', 'Texto'], girar: ['girar', 'Girar'],
  trans: ['trans', 'Transição'], mais: ['mais', 'Mais']
};

function abas(c) {
  const l = [];
  if (c.tipo === 'colagem') l.push('quadros');
  l.push(c.tipo === 'video' ? 'cortar' : 'duracao');
  if (c.tipo !== 'foto') l.push('vel', 'som');
  l.push('filtro', 'texto');
  if (c.tipo !== 'colagem') l.push('girar');
  l.push('trans', 'mais');
  return l;
}

function clipeNoTempo() {
  const l = linha();
  const a = ativosEm(l, Math.min(tempo, Math.max(0, l.total - 0.001))).pop();
  return a ? a.c : null;
}

function abrirFerramenta(c, qual) {
  if (!c) { aviso('Coloque um vídeo ou foto primeiro.'); return; }
  if (tocando) pausar();
  sel = c.id;
  aba = qual;
  painelAberto = true;
  painelGeral = null;
  selAudio = null;
  const it = linha().itens.find((x) => x.c.id === c.id);
  if (it && (tempo < it.ini || tempo >= it.ini + it.dur)) tempo = it.ini + 0.01;
  atualizarTudo();
}

function botao(ic, nome, acao, classe) {
  return h('button', { type: 'button', class: 'ferr' + (classe ? ' ' + classe : ''), onclick: acao }, icone(ic), nome);
}

function desenharBarra() {
  const b = $('barra');
  const c = clipeSel();
  const au = audioSel();
  b.hidden = painelAberto && (!!c || !!painelGeral || !!au);
  const itens = [];
  if (au) {
    itens.push(botao('volta', '', () => { selAudio = null; painelAberto = false; atualizarTudo(); }, 'ferr--volta'));
    itens.push(botao('dividir', 'Dividir', dividirAudio));
    itens.push(botao('som', 'Volume', () => { painelAberto = true; atualizarTudo(); }));
    itens.push(botao('musica', 'Trocar', () => trocarMusica(au)));
    itens.push(botao('duplicar', 'Duplicar', () => mudar(() => {
      const n = { ...au, id: uid(), pos: au.pos + durTrecho(au) };
      projeto.audios.push(n); selAudio = n.id;
    })));
    itens.push(botao('apagar', 'Apagar', () => mudar(() => {
      projeto.audios = projeto.audios.filter((x) => x.id !== au.id); selAudio = null; painelAberto = false;
    }), 'ferr--perigo'));
  } else if (!c) {
    itens.push(
      botao('cortar', 'Editar', () => abrirFerramenta(clipeNoTempo(), 'cortar')),
      botao('musica', 'Música', escolherMusica),
      botao('texto', 'Texto', () => abrirFerramenta(clipeNoTempo(), 'texto')),
      botao('legenda', 'Legendas', abrirLegendas),
      botao('colagem', 'Colagem', criarColagem),
      botao('filtro', 'Filtros', () => abrirFerramenta(clipeNoTempo(), 'filtro')),
      botao('formato', 'Formato', abrirFormato),
      botao('foto', 'Foto', salvarFoto),
      botao('conversor', 'Áudio', () => mostrarPagina('ferramentas'))
    );
  } else {
    itens.push(botao('volta', '', () => { sel = null; painelAberto = false; atualizarTudo(); }, 'ferr--volta'));
    itens.push(botao('dividir', 'Dividir', dividir));
    for (const k of abas(c)) itens.push(botao(NOMES[k][0], NOMES[k][1], () => abrirFerramenta(c, k)));
    itens.push(botao('duplicar', 'Duplicar', () => mudar(() => {
      const i = projeto.clipes.indexOf(c);
      const n = JSON.parse(JSON.stringify(c)); n.id = uid();
      projeto.clipes.splice(i + 1, 0, n); sel = n.id;
    })));
    itens.push(botao('apagar', 'Apagar', () => mudar(() => {
      projeto.clipes.splice(projeto.clipes.indexOf(c), 1); sel = null; painelAberto = false;
    }), 'ferr--perigo'));
  }
  const x = b.scrollLeft;
  b.replaceChildren(...itens);
  b.scrollLeft = x;
}

// ---------- Painel de uma ferramenta ----------

function desenharPainel() {
  const p = $('painel');
  const c = clipeSel();
  if (painelAberto && !c && painelGeral) {
    p.hidden = false;
    $('painelTitulo').textContent = 'Legendas automáticas';
    const corpo = $('painelCorpo');
    const y = corpo.scrollTop;
    corpo.textContent = '';
    pLegendas(corpo);
    corpo.scrollTop = y;
    return;
  }
  const au = audioSel();
  if (painelAberto && au) {
    p.hidden = false;
    $('painelTitulo').textContent = 'Volume da música';
    const corpo = $('painelCorpo');
    corpo.textContent = '';
    const mu = midias.get(au.midia);
    corpo.append(
      h('p', { class: 'nome-arq' }, '♪ ' + (mu ? mu.nome : '') + ' · ' + fmt(durTrecho(au))),
      deslizador('Volume deste trecho', 0, 1.5, 0.05, au.volume, (v) => Math.round(v * 100) + '%', (v) => { au.volume = v; }),
      h('button', { type: 'button', class: 'btn btn--sec', onclick: () => mudar(() => projeto.audios.forEach((x) => { x.volume = au.volume; })) }, 'Usar este volume em toda a música'),
      h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: projeto.sumirMusica !== false, onchange: (e) => mudar(() => { projeto.sumirMusica = e.target.checked; }) }), ' Abaixar a música devagar no final do vídeo'),
      h('p', { class: 'dica' }, 'Para abaixar o som dos vídeos, toque no 🔊 no começo de cada vídeo, ou escolha o vídeo e use Volume.')
    );
    return;
  }
  p.hidden = !(painelAberto && c);
  if (p.hidden) { $('painelCorpo').textContent = ''; return; } // limpa (e para as animações das telinhas)
  const lista = abas(c);
  if (!lista.includes(aba)) aba = lista[0];
  $('painelTitulo').textContent = NOMES[aba][1];
  const corpo = $('painelCorpo');
  const y = corpo.scrollTop;
  corpo.textContent = '';
  const fn = { quadros: pQuadros, cortar: pCortar, duracao: pDuracao, vel: pVel, som: pSom, filtro: pFiltro, texto: pTexto, girar: pGirar, trans: pTrans, mais: pMais }[aba];
  fn(c, corpo);
  corpo.scrollTop = y;
}

function deslizador(rotulo, min, max, passo, valor, mostrar, aoMudar, grupo) {
  const val = h('b', {}, mostrar(valor));
  const inp = h('input', {
    type: 'range', min, max, step: passo, value: valor,
    oninput: () => { const v = Number(inp.value); val.textContent = mostrar(v); mudar(() => aoMudar(v), grupo || rotulo, { semPainel: true }); }
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
    h('p', { class: 'dica' }, 'Arraste a faixa até a linha branca ficar no ponto e toque em Dividir. Ou puxe as alças amarelas nas pontas.')
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
  if (local < 0.2 || local > it.dur - 0.2) { aviso('Leve a linha branca para o meio do pedaço antes de dividir.'); return; }
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

// Velocidade: barra de arrastar (escala que dá o mesmo espaço para lento e rápido) com os pontos marcados.
const VELOC_MIN = 0.25, VELOC_MAX = 2; // no máximo 2× (pedido do Anderson)
const PONTOS_VEL = [0.25, 0.5, 0.75, 1, 1.5, 2];
const velParaPos = (v) => Math.log(v / VELOC_MIN) / Math.log(VELOC_MAX / VELOC_MIN);  // 0…1
const posParaVel = (p) => VELOC_MIN * Math.pow(VELOC_MAX / VELOC_MIN, p);
const textoVel = (v) => (v === 1 ? 'Normal (1×)' : String(Math.round(v * 100) / 100).replace('.', ',') + '×');

function pVel(c, el) {
  const val = h('b', { class: 'vel-valor' }, textoVel(c.vel || 1));
  const inp = h('input', { type: 'range', class: 'vel-barra', min: 0, max: 1000, step: 1, value: Math.round(velParaPos(c.vel || 1) * 1000), 'aria-label': 'Velocidade' });
  const trilho = h('div', { class: 'vel-trilho' }, h('span', { class: 'vel-cheio' }));
  // 100% = largura do trilho (já sem as pontas da bolinha)
  const encher = () => { trilho.firstChild.style.width = `calc(12px + 100% * ${Number(inp.value) / 1000})`; };
  const aplicar = (v) => {
    inp.value = Math.round(velParaPos(v) * 1000);
    encher();
    val.textContent = textoVel(v);
    pontos.querySelectorAll('.vel-ponto').forEach((b) => b.classList.toggle('on', Number(b.dataset.v) === v));
    mudar(() => { c.vel = v; }, 'vel', { semPainel: true });
  };
  inp.addEventListener('input', () => {
    const p = Number(inp.value) / 1000;
    let v = Math.round(posParaVel(p) * 100) / 100;
    // Perto de um ponto, gruda nele.
    for (const pt of PONTOS_VEL) if (Math.abs(velParaPos(pt) - p) < 0.025) v = pt;
    aplicar(v);
  });
  const pontos = h('div', { class: 'vel-pontos' }, PONTOS_VEL.map((pt) => h('button', {
    type: 'button', class: 'vel-ponto' + (pt === (c.vel || 1) ? ' on' : ''), 'data-v': pt,
    style: `left: calc(12px + (100% - 24px) * ${velParaPos(pt).toFixed(4)})`,
    onclick: () => aplicar(pt)
  }, h('i'), h('small', {}, String(pt).replace('.', ',') + '×'))));
  el.append(
    h('div', { class: 'vel-topo' }, h('span', {}, 'Lento'), val, h('span', {}, 'Rápido')),
    h('div', { class: 'vel-caixa' }, trilho, pontos, inp),
    h('p', { class: 'dica' }, 'Arraste a barra ou toque num ponto. O som acompanha a velocidade.')
  );
  encher();
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
    oninput: () => mudar(() => { c.texto = { ...tx, txt: area.value }; tx.txt = area.value; }, 'texto', { semPainel: true })
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

const SIMBOLO_TRANS = {
  corte: '|', dissolver: '◐', preto: '●', branco: '○', deslizar: '⇠', deslizarDir: '⇢', subir: '⇡', empurrar: '⇇',
  zoom: '⊕', zoomFora: '⊖', cortina: '▌', cortinaCima: '▄', circulo: '◯', persiana: '▥', desfoque: '◌', girar: '↻'
};

/**
 * Telinhas quadradas do painel de transições: cada uma toca a animação da sua transição sem parar
 * (quadro "A" passando para "B"), desenhada pelo próprio motor — igual ao que sai no vídeo.
 */
const TELINHA = 56;            // tamanho na tela (px)
const CICLO = 2.2;             // segundos de cada volta: 0,5 s de "A", 1,2 s de passagem (em câmera lenta) e 0,5 s de "B"
const telinhas = new Set();    // { canvas, k }
let telinhasRodando = false;
let quadrosAB = null;

// Foto de amostra das telinhas (enviada pelo Anderson): o pôr do sol passando para a asa do avião.
const fotosAmostra = ['amostra-a.jpg', 'amostra-b.jpg'].map((src) => {
  const im = new Image();
  im.onload = () => { quadrosAB = null; }; // refaz os quadros quando a foto chegar
  im.src = src;
  return im;
});

function quadrosDeAmostra(n) {
  if (quadrosAB && quadrosAB.n === n) return quadrosAB;
  const cria = (im, cor) => {
    const c = document.createElement('canvas'); c.width = n; c.height = n;
    const x = c.getContext('2d');
    if (im.complete && im.naturalWidth) x.drawImage(im, 0, 0, n, n);
    else { x.fillStyle = cor; x.fillRect(0, 0, n, n); }
    return c;
  };
  quadrosAB = { n, A: cria(fotosAmostra[0], '#f59e0b'), B: cria(fotosAmostra[1], '#1e3a8a') };
  return quadrosAB;
}

function cenaTelinha(k) {
  const ms = new Map([['a', { tipo: 'foto', w: 1, h: 1 }], ['b', { tipo: 'foto', w: 1, h: 1 }]]);
  const pr = { formato: '1:1', fundo: 'preto', clipes: [
    { id: 'x1', tipo: 'foto', midia: 'a', dur: 3, ajuste: 'preencher', kenBurns: false, filtro: 'nenhum', transicao: k },
    { id: 'x2', tipo: 'foto', midia: 'b', dur: 3, ajuste: 'preencher', kenBurns: false, filtro: 'nenhum', transicao: 'corte' }] };
  return { pr, ms, l: linhaDoTempo(pr, ms) };
}

function telinhaTransicao(k) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const n = Math.round(TELINHA * dpr);
  const canvas = h('canvas', { class: 'trans-op__tela', width: n, height: n, 'aria-hidden': 'true' });
  canvas.style.width = canvas.style.height = TELINHA + 'px';
  telinhas.add({ canvas, k, n, cena: cenaTelinha(k) });
  if (!telinhasRodando) { telinhasRodando = true; requestAnimationFrame(rodarTelinhas); }
  return canvas;
}

function rodarTelinhas(agora) {
  for (const tl of telinhas) if (!tl.canvas.isConnected) telinhas.delete(tl);
  if (!telinhas.size) { telinhasRodando = false; return; }
  const fase = (agora / 1000) % CICLO;
  for (const tl of telinhas) {
    const { pr, ms, l } = tl.cena;
    const ab = quadrosDeAmostra(tl.n);
    // Trecho da passagem no tempo do vídeo de amostra (o clipe "A" acaba em 3 s).
    const so = l.itens[0].sobreSaida;
    const ta = so ? 3 - so : 3 - 0.3, tb = so ? 3 : 3 + 0.3;
    const t = fase < 0.5 ? ta - 0.01 : fase < 1.7 ? ta + (fase - 0.5) / 1.2 * (tb - ta) : tb + 0.01;
    const ctx = tl.canvas.getContext('2d');
    if (tl.k === 'corte') {
      ctx.drawImage(fase < 1.1 ? ab.A : ab.B, 0, 0);
      continue;
    }
    desenharQuadro(ctx, tl.n, tl.n, pr, l, ms, t, (ch) => ({ img: ch.startsWith('x1') ? ab.A : ab.B, w: tl.n, h: tl.n }));
  }
  requestAnimationFrame(rodarTelinhas);
}

/** Toca só o pedaço da passagem para ver a transição. */
function verTransicao(c) {
  const it = linha().itens.find((x) => x.c.id === c.id);
  if (!it) return;
  if (tocando) pausar();
  tempo = Math.max(it.ini, it.ini + it.dur - (it.sobreSaida || 0) - 0.8);
  pararEm = it.ini + it.dur + 0.9;
  tocar();
}

function pTrans(c, el) {
  const l = linha();
  const it = l.itens.find((x) => x.c.id === c.id);
  if (!it || it.i === l.itens.length - 1) { el.append(h('p', { class: 'dica' }, 'A transição é a passagem deste clipe para o próximo. Este é o último clipe.')); return; }
  const atual = c.transicao || 'corte';
  el.append(h('div', { class: 'trans-grade' }, Object.entries(TRANSICOES).map(([k, nome]) => h('button', {
    type: 'button', class: 'trans-op' + (k === atual ? ' on' : ''),
    onclick: () => { mudar(() => { c.transicao = k; }); if (k !== 'corte') verTransicao(c); }
  }, telinhaTransicao(k), h('small', {}, nome)))));
  el.append(h('div', { class: 'linha-btn' },
    h('button', { type: 'button', class: 'btn btn--sec', onclick: () => verTransicao(c) }, '▶ Ver de novo'),
    h('button', { type: 'button', class: 'btn btn--sec', onclick: () => mudar(() => projeto.clipes.forEach((x) => { x.transicao = c.transicao; })) }, 'Usar em todos')));
  el.append(h('button', { type: 'button', class: 'btn btn--sec', onclick: () => {
    const lista = Object.keys(TRANSICOES).filter((k) => k !== 'corte');
    mudar(() => projeto.clipes.forEach((x) => { x.transicao = lista[Math.floor(Math.random() * lista.length)]; }));
    aviso('Uma transição diferente em cada passagem.');
  } }, '🎲 Sortear em todos'));
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
    sel = nova.id; aba = 'quadros'; painelAberto = true;
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
      sel = nova.id; aba = 'quadros'; painelAberto = true;
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

/** Trechos que cobrem o vídeo a partir de "pos", repetindo a música se ela for mais curta. */
function trechosCobrindo(m, pos, iniMus, volume, repetir) {
  const total = Math.max(linha().total, 1);
  const r = [];
  let p = pos;
  do {
    const fim = Math.min(m.dur, iniMus + Math.max(0.3, total - p));
    r.push({ id: uid(), midia: m.id, pos: p, ini: iniMus, fim, volume });
    p += fim - iniMus;
  } while (repetir && p < total - 0.3 && m.dur - iniMus > 1);
  return r;
}

async function escolherMusica() {
  const [f] = await escolherArquivos('audio/*,video/*', false);
  if (!f) return;
  progresso('Abrindo a música…', null);
  try {
    const m = await adicionarMidia(f);
    if (!m.temAudio) throw new Error('Esse arquivo não tem som.');
    const l = linha();
    const pos = (projeto.audios || []).length && tempo < l.total - 0.5 ? tempo : 0;
    const novos = trechosCobrindo(m, pos, 0, 0.8, true);
    mudar(() => {
      projeto.audios = (projeto.audios || []).concat(novos);
      sel = null; selAudio = novos[0].id; painelAberto = false; painelGeral = null;
    });
    aviso('Música colocada. Toque na faixa verde para cortar, dividir ou mudar o volume.');
  } catch (e) { aviso(e.message, 'erro'); } finally { fimProgresso(); }
}

async function trocarMusica(au) {
  const [f] = await escolherArquivos('audio/*,video/*', false);
  if (!f) return;
  progresso('Abrindo a música…', null);
  try {
    const m = await adicionarMidia(f);
    if (!m.temAudio) throw new Error('Esse arquivo não tem som.');
    mudar(() => { au.midia = m.id; au.ini = 0; au.fim = Math.min(m.dur, durTrecho(au)); });
  } catch (e) { aviso(e.message, 'erro'); } finally { fimProgresso(); }
}

function escolherAudio(a) {
  if (tocando) pausar();
  if (selAudio === a.id) { selAudio = null; painelAberto = false; }
  else {
    selAudio = a.id; sel = null; painelGeral = null; painelAberto = false;
    if (tempo < a.pos || tempo >= a.pos + durTrecho(a)) tempo = a.pos + 0.01;
  }
  atualizarTudo();
}

function dividirAudio() {
  const a = audioSel();
  if (!a) return;
  const local = tempo - a.pos;
  if (local < 0.2 || local > durTrecho(a) - 0.2) { aviso('Leve a linha branca para o meio da música antes de dividir.'); return; }
  mudar(() => {
    const corte = a.ini + local;
    const novo = { ...a, id: uid(), ini: corte, pos: a.pos + local };
    a.fim = corte;
    projeto.audios.splice(projeto.audios.indexOf(a) + 1, 0, novo);
    selAudio = novo.id;
  });
  aviso('Música dividida em duas.');
}

/** Projetos antigos tinham uma música só ("musica"): vira trechos na faixa verde. */
function migrarMusica() {
  if (!projeto.audios) projeto.audios = [];
  const mu = projeto.musica;
  if (mu) {
    const m = midias.get(mu.midia);
    if (m) projeto.audios = projeto.audios.concat(trechosCobrindo(m, 0, mu.ini || 0, mu.volume == null ? 0.8 : mu.volume, mu.repetir !== false));
    if (mu.sumir === false) projeto.sumirMusica = false;
    delete projeto.musica;
  }
  projeto.audios = projeto.audios.filter((a) => midias.has(a.midia));
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

// ---------- Legendas automáticas (fala → texto, palavra por palavra) ----------

function abrirLegendas() {
  if (!projeto.clipes.length) { aviso('Coloque um vídeo primeiro.'); return; }
  if (tocando) pausar();
  sel = null;
  painelGeral = 'legendas';
  painelAberto = true;
  atualizarTudo();
}

let trabalhador = null;
function transcrever(audio) {
  return new Promise((ok, falha) => {
    if (!trabalhador) trabalhador = new Worker(new URL('./legenda-worker.js', import.meta.url), { type: 'module' });
    const t0 = Date.now();
    let ouvindo = false;
    const vigia = setInterval(() => {
      if (cancelar) {
        clearInterval(vigia);
        trabalhador.terminate(); trabalhador = null;
        const e = new Error('Cancelado'); e.cancelado = true; falha(e);
      } else if (ouvindo) progresso('Ouvindo a fala… ' + mmss((Date.now() - t0) / 1000), null);
    }, 500);
    trabalhador.onmessage = ({ data }) => {
      if (data.tipo === 'baixando') {
        const mb = (n) => Math.round(n / 1048576);
        progresso(`Baixando o reconhecedor de voz (só na 1ª vez)… ${mb(data.feito)} de ${mb(data.total) || '~80'} MB`, data.total ? data.feito / data.total : null);
      } else if (data.tipo === 'ouvindo') { ouvindo = true; progresso('Ouvindo a fala…', null); }
      else if (data.tipo === 'pronto') { clearInterval(vigia); ok(data.palavras); }
      else if (data.tipo === 'erro') {
        clearInterval(vigia);
        falha(new Error(/fetch|network|internet/i.test(data.msg)
          ? 'Sem internet para baixar o reconhecedor de voz. Ele só precisa de internet na primeira vez.'
          : data.msg));
      }
    };
    trabalhador.onerror = (e) => { clearInterval(vigia); falha(new Error(e.message || 'O reconhecedor de voz parou.')); };
    trabalhador.postMessage({ tipo: 'transcrever', audio, idioma: 'portuguese' }, [audio.buffer]);
  });
}

async function gerarLegendas() {
  if (ocupado) return;
  if (tocando) pausar();
  ocupado = true; cancelar = false;
  $('cancelar').hidden = false;
  if (galeria) galeria.telaAcesa({ ligar: true }).catch(() => {});
  progresso('Separando a fala dos vídeos…', null);
  try {
    const som = await audioDaFala(projeto, midias);
    if (!som) throw new Error('Os vídeos estão sem som (ou com o volume zerado).');
    const palavras = await transcrever(new Float32Array(som));
    if (!palavras.length) throw new Error('Não ouvi nenhuma fala nos vídeos.');
    const itens = agruparLegendas(palavras);
    mudar(() => {
      projeto.legendas = { itens, estilo: { ...ESTILO_LEGENDA, ...((projeto.legendas && projeto.legendas.estilo) || {}) } };
    });
    fimProgresso();
    aviso(`Pronto: ${itens.length} legendas. Toque numa frase para corrigir.`);
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

function pLegendas(el) {
  const leg = projeto.legendas;
  if (!leg || !leg.itens || !leg.itens.length) {
    el.append(
      h('p', { class: 'dica' }, 'O app ouve a fala dos vídeos e escreve a legenda sozinho, com a palavra falada em destaque.'),
      h('button', { type: 'button', class: 'btn btn--preto', onclick: gerarLegendas }, '🎙 Gerar legendas da fala'),
      h('p', { class: 'dica' }, 'Na primeira vez baixa o reconhecedor de voz (cerca de 80 MB, precisa de internet). Depois funciona sem internet. A música de fundo não entra.')
    );
    return;
  }
  const e = { ...ESTILO_LEGENDA, ...(leg.estilo || {}) };
  const est = (mud) => mudar(() => { leg.estilo = { ...e, ...mud }; });
  el.append(
    chips([['baixo', 'Embaixo'], ['meio', 'No meio'], ['topo', 'Em cima']], e.pos, (v) => est({ pos: v })),
    h('p', { class: 'rot' }, 'Cor da palavra falada'),
    h('div', { class: 'cores' }, ['#ffd400', '#34c759', '#ff2d92', '#0a84ff', '#ff3b30', '#ffffff'].map((cor) => h('button', {
      type: 'button', class: 'cor' + (e.destaque === cor ? ' on' : ''), style: `background:${cor}`, 'aria-label': 'Cor de destaque',
      onclick: () => est({ destaque: cor })
    }))),
    chips([[true, 'MAIÚSCULAS'], [false, 'Normal']], e.maiusculas, (v) => est({ maiusculas: v === true || v === 'true' })),
    chips([[false, 'Contorno'], [true, 'Com fundo']], e.fundo, (v) => est({ fundo: v === true || v === 'true' })),
    deslizador('Tamanho', 3, 12, 0.5, e.tam, (v) => String(v).replace('.', ','), (v) => { leg.estilo = { ...e, tam: v }; }, 'tamLeg'),
    h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: !!leg.oculta, onchange: (ev) => mudar(() => { leg.oculta = ev.target.checked; }) }), ' Esconder as legendas'),
    h('p', { class: 'rot' }, 'Frases (toque para corrigir o texto)')
  );
  const lista = h('div', { class: 'legendas' });
  leg.itens.forEach((it, i) => {
    const ini = it.palavras[0].t0;
    const campo = h('input', {
      type: 'text', value: it.palavras.map((w) => w.p).join(' '),
      onfocus: () => { tempo = ini + 0.01; pedirDesenho(); },
      onchange: () => mudar(() => { if (!trocarTextoLegenda(it, campo.value)) leg.itens.splice(i, 1); })
    });
    lista.append(h('div', { class: 'legenda-linha' },
      h('button', { type: 'button', class: 'legenda-tempo', onclick: () => { tempo = ini + 0.01; pedirDesenho(); } }, mmss(ini)),
      campo,
      h('button', { type: 'button', class: 'mini', 'aria-label': 'Apagar frase', onclick: () => mudar(() => { leg.itens.splice(i, 1); }) }, '✕')));
  });
  el.append(lista,
    h('div', { class: 'linha-btn' },
      h('button', { type: 'button', class: 'btn btn--sec', onclick: gerarLegendas }, '↻ Gerar de novo'),
      h('button', { type: 'button', class: 'btn btn--perigo', onclick: () => mudar(() => { projeto.legendas = null; }) }, 'Apagar legendas')),
    h('p', { class: 'dica' }, 'Se mudar os cortes dos vídeos depois, toque em Gerar de novo para acertar o tempo.'));
}

// ---------- Projeto ----------

const LISTA_FORMATOS = [
  ['original', 'Original', 'do 1º vídeo'], ['9:16', '9:16', 'TikTok · Reels'], ['16:9', '16:9', 'YouTube'],
  ['1:1', '1:1', 'Quadrado'], ['4:5', '4:5', 'Feed Instagram'], ['3:4', '3:4', 'Retrato'], ['4:3', '4:3', 'TV antiga'],
  ['2:3', '2:3', 'Pinterest'], ['21:9', '21:9', 'Cinema'], ['2:1', '2:1', 'Panorâmico'], ['5:4', '5:4', 'Foto']
];

/** Tamanho do 1º vídeo/foto, para o formato "Original". */
function formatoOriginal() {
  const c = projeto.clipes[0];
  const f = c && fontesDoClipe(c)[0];
  const m = f && midias.get(f.midia);
  if (!m || !m.w || !m.h) return null;
  const mdc = (x, y) => (y ? mdc(y, x % y) : x);
  const d = mdc(Math.round(m.w), Math.round(m.h));
  return Math.round(m.w) / d + ':' + Math.round(m.h) / d;
}

function listaFormatos(depois) {
  const orig = formatoOriginal();
  return h('div', { class: 'formatos-rolo' }, LISTA_FORMATOS.map(([k, nome, uso]) => {
    const proporcao = k === 'original' ? orig : k;
    if (!proporcao) return null;
    const [a, b] = proporcao.split(':').map(Number);
    const s = 40 / Math.max(a, b);
    const on = k === 'original' ? projeto.formatoNome === 'original' : projeto.formatoNome !== 'original' && projeto.formato === k;
    return h('button', {
      type: 'button', class: 'fmt' + (on ? ' on' : ''),
      onclick: () => { mudar(() => { projeto.formato = proporcao; projeto.formatoNome = k === 'original' ? 'original' : ''; maxLado = null; }); depois(); }
    },
    h('span', { class: 'fmt__caixa' }, h('span', { class: 'fmt__ret', style: `width:${Math.round(a * s)}px;height:${Math.round(b * s)}px` })),
    h('b', {}, nome), h('small', {}, uso));
  }));
}

function abrirFormato() {
  abrirFolha('Formato e fundo', (corpo) => {
    const montar = () => {
      corpo.replaceChildren(
        h('p', { class: 'rot' }, 'Formato da tela (arraste para o lado para ver todos)'),
        listaFormatos(() => montar()),
        h('p', { class: 'rot' }, 'Sobras da tela (quando o vídeo não preenche)'),
        chips([['desfocado', 'Desfocado'], ['preto', 'Preto'], ['branco', 'Branco']], projeto.fundo, (v) => { mudar(() => { projeto.fundo = v; }); montar(); }),
        h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: !!projeto.fadeIn, onchange: (e) => mudar(() => { projeto.fadeIn = e.target.checked; }) }), ' Começar clareando (do preto)'),
        h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: projeto.fadeOut !== false, onchange: (e) => mudar(() => { projeto.fadeOut = e.target.checked; }) }), ' Terminar escurecendo'),
        h('label', { class: 'desl' }, h('span', {}, 'Assinatura no canto (opcional)'),
          h('input', { type: 'text', maxLength: 40, placeholder: 'Ex.: @seuperfil', value: projeto.marca || '', oninput: (e) => mudar(() => { projeto.marca = e.target.value; }, 'marca') }))
      );
    };
    montar();
  });
}

function abrirAjuda() {
  abrirFolha('Como usar', (corpo) => {
    corpo.append(h('ul', { class: 'ajuda' },
      h('li', {}, h('b', {}, 'Arraste a faixa de fotos'), ' para andar pelo vídeo. A linha branca no meio é onde você está.'),
      h('li', {}, h('b', {}, 'Toque num pedaço'), ' para escolher. As alças amarelas nas pontas cortam o começo e o fim.'),
      h('li', {}, h('b', {}, 'Dividir'), ' separa o pedaço no ponto da linha branca.'),
      h('li', {}, h('b', {}, 'Quadradinho entre os pedaços'), ' escolhe a passagem (dissolver, escurecer…).'),
      h('li', {}, h('b', {}, '＋'), ' no canto põe mais vídeos e fotos no fim.'),
      h('li', {}, h('b', {}, 'Salvar'), ' grava na galeria. Toque em ', h('b', {}, '1080p ▾'), ' para escolher 4K, 60 quadros e qualidade.')
    ));
  });
}

function desenharTopo() {
  $('desfazer').disabled = !desfazer.length;
  $('refazer').disabled = !refazer.length;
  $('salvarVideo').disabled = !projeto.clipes.length;
  const lado = Number(localStorage.getItem('editor.lado')) || 2160;
  $('qualidade').firstChild.textContent = ({ 720: '720p', 1080: '1080p', 1440: '2K', 2160: '4K' }[lado] || '4K') + ' ';
}

/** op.semPainel: não refaz o painel (o controle que o dedo está mexendo continua o mesmo). */
function atualizarTudo(op) {
  desenharTopo();
  desenharLinha();
  desenharBarra();
  if (!(op && op.semPainel)) desenharPainel();
  pedirDesenho();
}

// ---------- Salvar vídeo ----------

let maxLado = null;

async function abrirSalvar() {
  if (tocando) pausar();
  const l = linha();
  if (!l.itens.length) return;
  let lado = Number(localStorage.getItem('editor.lado')) || 2160;
  let fps = Number(localStorage.getItem('editor.fps')) || 30;
  let qual = localStorage.getItem('editor.qual') || 'normal';
  abrirFolha('Salvar vídeo (até 4K)', (corpo) => {
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
      h('button', { type: 'button', class: 'btn btn--preto', onclick: () => {
        localStorage.setItem('editor.lado', lado); localStorage.setItem('editor.fps', fps); localStorage.setItem('editor.qual', qual);
        fecharFolha(); desenharTopo(); salvarVideo(lado, fps, qual);
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
  $('pgFerramentas').hidden = p !== 'ferramentas';
  if (p === 'ferramentas') desenharFerramentas();
}

function alternarTelaCheia() {
  const on = document.querySelector('.app').classList.toggle('tela-cheia');
  porIcone('telaCheia', on ? 'encolher' : 'cheia');
  pedirDesenho();
  setTimeout(() => { desenharLinha(); pedirDesenho(); }, 50);
}

// ---------- Ligações ----------

porIcone('novo', 'novo');
porIcone('ajuda', 'ajuda');
porIcone('play', 'tocar');
porIcone('telaCheia', 'cheia');
porIcone('desfazer', 'desfazer');
porIcone('refazer', 'refazer');
porIcone('ferrFechar', 'volta');

const adicionar = () => escolherArquivos('video/*,image/*', true).then((a) => importar(a));
$('play').addEventListener('click', () => (tocando ? pausar() : tocar()));
$('tela').addEventListener('click', () => (tocando ? pausar() : tocar()));
$('comecar').addEventListener('click', adicionar);
$('comecarColagem').addEventListener('click', criarColagem);
$('maisFim').addEventListener('click', adicionar);
$('desfazer').addEventListener('click', voltar);
$('refazer').addEventListener('click', avancar);
$('telaCheia').addEventListener('click', alternarTelaCheia);
$('ajuda').addEventListener('click', abrirAjuda);
$('novo').addEventListener('click', () => {
  if (projeto.clipes.length && !confirm('Começar um projeto novo? O atual será apagado.')) return;
  pausar();
  mudar(() => { projeto = novoProjeto(); sel = null; painelAberto = false; tempo = 0; });
});
$('salvarVideo').addEventListener('click', abrirSalvar);
$('qualidade').addEventListener('click', abrirSalvar);
$('painelOk').addEventListener('click', () => { painelAberto = false; painelGeral = null; atualizarTudo(); });
$('folhaFechar').addEventListener('click', fecharFolha);
$('folha').addEventListener('click', (e) => { if (e.target === $('folha')) fecharFolha(); });
$('cancelar').addEventListener('click', () => { cancelar = true; progresso('Cancelando…', null); });
$('ferrEscolher').addEventListener('click', escolherParaFerramenta);
$('ferrFechar').addEventListener('click', () => mostrarPagina('editor'));

if (appCap) {
  appCap.addListener('backButton', () => {
    if (!$('folha').hidden) fecharFolha();
    else if (!$('pgFerramentas').hidden) mostrarPagina('editor');
    else if (document.querySelector('.app.tela-cheia')) alternarTelaCheia();
    else if (painelAberto) { painelAberto = false; painelGeral = null; atualizarTudo(); }
    else if (sel || selAudio) { sel = null; selAudio = null; atualizarTudo(); }
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
      carregarTiras(m);
    }
  } catch (e) { console.warn('sem IndexedDB', e); }
  // Clipes cujo arquivo sumiu saem do projeto.
  projeto.clipes = projeto.clipes.filter((c) => c.tipo === 'colagem' || midias.has(c.midia));
  projeto.clipes.forEach((c) => { if (c.tipo === 'colagem') c.celulas = c.celulas.map((x) => (x && midias.has(x.midia) ? x : null)); });
  migrarMusica();
  projeto.clipes.forEach((c) => { if ((c.vel || 1) > 2) c.vel = 2; }); // velocidade máxima agora é 2×
  atualizarTudo();
}

window.addEventListener('resize', () => { desenharLinha(); pedirDesenho(); });
iniciar();

// Para testes automáticos.
window.__editor = { get projeto() { return projeto; }, midias, importar, exportarVideo, converter, linha, get tempo() { return tempo; }, set tempo(v) { tempo = v; pedirDesenho(); } };
