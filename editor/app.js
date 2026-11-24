/* Editor de Vídeo — telas. O motor (motor.js) desenha os quadros e grava o MP4; aqui ficam a prévia,
   a linha do tempo (agulha parada no meio, vídeo correndo por baixo), a barra de ferramentas,
   a colagem, a música e as ferramentas rápidas. */
import {
  FORMATOS, RESOLUCOES, FILTROS, COLAGENS, TRANSICOES, CORES_TEXTO,
  analisarMidia, tiras, linhaDoTempo, ativosEm, tempoOrigem, fontesDoClipe, desenharQuadro,
  tamanhoSaida, taxaVideo, exportarVideo, maiorResolucao, converter, fotoDoQuadro, duracaoClipe
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
const midias = new Map(); // id → { id, blob, nome, tipo, dur, w, h, temAudio, url, thumb, tiras }
let sel = null;           // id do clipe escolhido
let aba = 'cortar';       // ferramenta aberta no painel do clipe
let painelAberto = false;
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
function mudar(fn, grupo) {
  const agora = Date.now();
  if (!grupo || grupo !== ultimoGrupo || agora - ultimoGrupoT > 1500) {
    desfazer.push(JSON.stringify(projeto));
    if (desfazer.length > 40) desfazer.shift();
    refazer.length = 0;
  }
  ultimoGrupo = grupo || ''; ultimoGrupoT = agora;
  fn();
  salvar();
  atualizarTudo();
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
  for (const el of players.values()) el.pause();
  if (musicaEl) musicaEl.pause();
  porIcone('play', 'tocar');
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

// ---------- Linha do tempo (agulha parada no meio) ----------

const PX = 60;   // pixels por segundo
const TILE = 46; // largura de cada miniatura
const meio = () => Math.round($('rolo').clientWidth / 2);

function rolarPara(t) {
  const r = $('rolo');
  const x = Math.round(t * PX);
  if (Math.abs(r.scrollLeft - x) >= 1) r.scrollLeft = x;
}

// O dedo arrasta a linha do tempo: o tempo segue o que está embaixo da agulha.
$('rolo').addEventListener('scroll', () => {
  const t = $('rolo').scrollLeft / PX;
  if (Math.abs(t - tempo) < 1.5 / PX) return; // fomos nós que rolamos
  const l = linha();
  if (tocando) pausar();
  tempo = Math.max(0, Math.min(l.total, t));
  pedirDesenho();
}, { passive: true });
$('rolo').addEventListener('pointerdown', () => { if (tocando) pausar(); });

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
    if (c.id === sel) {
      el.append(h('span', { class: 'alca alca--esq', onpointerdown: (e) => arrastar(e, c, 'esq'), 'aria-label': 'Puxar o começo' }));
      el.append(h('span', { class: 'alca alca--dir', onpointerdown: (e) => arrastar(e, c, 'dir'), 'aria-label': 'Puxar o fim' }));
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
      }, tr !== 'corte' ? '⋈' : '|'));
    }
  });
  // Música
  const tm = $('trilhaMusica');
  tm.textContent = '';
  const mu = projeto.musica && midias.get(projeto.musica.midia);
  if (mu) {
    const dur = projeto.musica.repetir === false ? Math.min(l.total, mu.dur - (projeto.musica.ini || 0)) : l.total;
    tm.append(h('button', { type: 'button', class: 'musica', style: `left:${m0}px;width:${Math.max(40, dur * PX)}px`, onclick: abrirMusica }, '♪ ' + mu.nome));
  } else if (l.itens.length) {
    tm.append(h('button', { type: 'button', class: 'musica-add', style: `left:${m0}px`, onclick: abrirMusica }, '♪ + Adicionar música'));
  }
  $('maisFim').hidden = !l.itens.length;
  document.querySelector('.agulha').hidden = !l.itens.length;
  rolarPara(tempo);
}

function escolherClipe(c, it) {
  if (tocando) pausar();
  if (sel === c.id) { sel = null; painelAberto = false; }
  else {
    sel = c.id;
    if (tempo < it.ini || tempo >= it.ini + it.dur) tempo = it.ini + 0.01;
  }
  atualizarTudo();
}

/** Puxar a alça do clipe escolhido: corta o começo ou o fim arrastando. */
function arrastar(e, c, lado) {
  e.preventDefault();
  e.stopPropagation();
  if (tocando) pausar();
  const x0 = e.clientX;
  const orig = { ini: c.ini, fim: c.fim, dur: duracaoClipe(c, midias) };
  const m = midias.get(c.midia);
  const lim = (v, a, b) => Math.max(a, Math.min(b, v));
  const mover = (ev) => {
    const ds = (ev.clientX - x0) / PX;
    mudar(() => {
      if (c.tipo === 'video') {
        const v = c.vel || 1;
        if (lado === 'dir') c.fim = lim(orig.fim + ds * v, c.ini + 0.2, m ? m.dur : orig.fim);
        else c.ini = lim(orig.ini + ds * v, 0, c.fim - 0.2);
      } else {
        c.dur = Math.round(Math.max(0.5, lado === 'dir' ? orig.dur + ds : orig.dur - ds) * 10) / 10;
      }
    }, 'arrasto');
  };
  const soltar = () => {
    window.removeEventListener('pointermove', mover);
    window.removeEventListener('pointerup', soltar);
    window.removeEventListener('pointercancel', soltar);
    const it = linha().itens.find((x) => x.c.id === c.id);
    if (it) { tempo = lado === 'dir' ? it.ini + it.dur - 0.05 : it.ini + 0.01; atualizarTudo(); }
  };
  window.addEventListener('pointermove', mover);
  window.addEventListener('pointerup', soltar);
  window.addEventListener('pointercancel', soltar);
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
  b.hidden = painelAberto && !!c;
  const itens = [];
  if (!c) {
    itens.push(
      botao('cortar', 'Editar', () => abrirFerramenta(clipeNoTempo(), 'cortar')),
      botao('musica', 'Música', abrirMusica),
      botao('texto', 'Texto', () => abrirFerramenta(clipeNoTempo(), 'texto')),
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
  p.hidden = !(painelAberto && c);
  if (p.hidden) return;
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

function abrirFormato() {
  abrirFolha('Formato e fundo', (corpo) => {
    const montar = () => {
      corpo.replaceChildren(
        h('p', { class: 'rot' }, 'Formato da tela'),
        chips(Object.keys(FORMATOS).map((k) => [k, k + ({ '9:16': ' Stories/Reels', '16:9': ' YouTube', '1:1': ' Quadrado', '4:5': ' Feed' }[k] || '')]),
          projeto.formato, (v) => { mudar(() => { projeto.formato = v; maxLado = null; }); montar(); }),
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

function atualizarTudo() {
  desenharTopo();
  desenharLinha();
  desenharBarra();
  desenharPainel();
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
$('painelOk').addEventListener('click', () => { painelAberto = false; atualizarTudo(); });
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
    else if (painelAberto) { painelAberto = false; atualizarTudo(); }
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
      carregarTiras(m);
    }
  } catch (e) { console.warn('sem IndexedDB', e); }
  // Clipes cujo arquivo sumiu saem do projeto.
  projeto.clipes = projeto.clipes.filter((c) => c.tipo === 'colagem' || midias.has(c.midia));
  projeto.clipes.forEach((c) => { if (c.tipo === 'colagem') c.celulas = c.celulas.map((x) => (x && midias.has(x.midia) ? x : null)); });
  if (projeto.musica && !midias.has(projeto.musica.midia)) projeto.musica = null;
  atualizarTudo();
}

window.addEventListener('resize', () => { desenharLinha(); pedirDesenho(); });
iniciar();

// Para testes automáticos.
window.__editor = { get projeto() { return projeto; }, midias, importar, exportarVideo, converter, linha, get tempo() { return tempo; }, set tempo(v) { tempo = v; pedirDesenho(); } };
