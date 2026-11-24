/* Editor de Vídeo — motor: monta a linha do tempo, desenha cada quadro (vídeo, foto, colagem, texto, filtro,
   transição), mistura o som e grava o MP4 (até 4K) com o WebCodecs do aparelho (via mediabunny). */
import {
  Input, ALL_FORMATS, BlobSource, CanvasSink, AudioBufferSink,
  Output, Mp4OutputFormat, Mp3OutputFormat, BufferTarget, StreamTarget,
  CanvasSource, AudioBufferSource, Conversion, canEncodeVideo, canEncodeAudio
} from 'mediabunny';

// ---------- Formatos, filtros, colagens ----------

export const FORMATOS = {
  '9:16': [9, 16], '16:9': [16, 9], '1:1': [1, 1], '4:5': [4, 5], '3:4': [3, 4]
};

export const RESOLUCOES = { 720: '720p', 1080: '1080p (Full HD)', 1440: '2K', 2160: '4K' };

/** Tamanho do vídeo final: o lado menor é a resolução escolhida (4K vertical = 2160 × 3840). */
export function tamanhoSaida(formato, lado) {
  const [a, b] = FORMATOS[formato] || FORMATOS['9:16'];
  const par = (n) => Math.max(2, Math.round(n / 2) * 2);
  return a <= b ? { w: par(lado), h: par(lado * b / a) } : { w: par(lado * a / b), h: par(lado) };
}

export const FILTROS = {
  nenhum: { nome: 'Normal', css: '' },
  vivo: { nome: 'Vivo', css: 'saturate(1.45) contrast(1.08)' },
  quente: { nome: 'Quente', css: 'sepia(.28) saturate(1.3) brightness(1.03)' },
  frio: { nome: 'Frio', css: 'hue-rotate(-14deg) saturate(1.08) brightness(1.02)' },
  pb: { nome: 'P&B', css: 'grayscale(1) contrast(1.12)' },
  sepia: { nome: 'Sépia', css: 'sepia(.85) contrast(1.05)' },
  vintage: { nome: 'Antigo', css: 'sepia(.45) contrast(.9) brightness(1.06) saturate(.75)' },
  drama: { nome: 'Drama', css: 'contrast(1.38) saturate(.82) brightness(.95)' },
  claro: { nome: 'Claro', css: 'brightness(1.18) contrast(.95)' },
  noite: { nome: 'Noite', css: 'brightness(.78) contrast(1.2) saturate(.9) hue-rotate(8deg)' }
};

/** Filtro completo do clipe: filtro escolhido + ajustes de brilho/contraste/saturação. */
export function cssFiltro(c) {
  const p = [];
  const f = FILTROS[c.filtro] && FILTROS[c.filtro].css;
  if (f) p.push(f);
  if (c.brilho != null && c.brilho !== 100) p.push(`brightness(${c.brilho / 100})`);
  if (c.contraste != null && c.contraste !== 100) p.push(`contrast(${c.contraste / 100})`);
  if (c.saturacao != null && c.saturacao !== 100) p.push(`saturate(${c.saturacao / 100})`);
  return p.length ? p.join(' ') : 'none';
}

// Retângulos de cada quadro da colagem, em frações da tela (x, y, largura, altura).
export const COLAGENS = {
  '2h': { nome: 'Lado a lado', cel: [[0, 0, .5, 1], [.5, 0, .5, 1]] },
  '2v': { nome: 'Em cima e embaixo', cel: [[0, 0, 1, .5], [0, .5, 1, .5]] },
  '3v': { nome: '3 faixas', cel: [[0, 0, 1, 1 / 3], [0, 1 / 3, 1, 1 / 3], [0, 2 / 3, 1, 1 / 3]] },
  '3h': { nome: '3 colunas', cel: [[0, 0, 1 / 3, 1], [1 / 3, 0, 1 / 3, 1], [2 / 3, 0, 1 / 3, 1]] },
  '3a': { nome: '1 em cima, 2 embaixo', cel: [[0, 0, 1, .5], [0, .5, .5, .5], [.5, .5, .5, .5]] },
  '3b': { nome: '1 grande e 2 do lado', cel: [[0, 0, .5, 1], [.5, 0, .5, .5], [.5, .5, .5, .5]] },
  '4g': { nome: 'Grade 2 × 2', cel: [[0, 0, .5, .5], [.5, 0, .5, .5], [0, .5, .5, .5], [.5, .5, .5, .5]] },
  '6g': { nome: 'Grade 2 × 3', cel: [[0, 0, .5, 1 / 3], [.5, 0, .5, 1 / 3], [0, 1 / 3, .5, 1 / 3], [.5, 1 / 3, .5, 1 / 3], [0, 2 / 3, .5, 1 / 3], [.5, 2 / 3, .5, 1 / 3]] },
  'pip': { nome: 'Tela cheia + janelinha', cel: [[0, 0, 1, 1], [.56, .04, .4, .3]] }
};

export const TRANSICOES = { corte: 'Corte seco', dissolver: 'Dissolver', preto: 'Escurecer', deslizar: 'Deslizar', zoom: 'Zoom' };
export const DUR_TRANSICAO = 0.6;

// ---------- Mídias (arquivos escolhidos) ----------

/** Lê as informações de um vídeo/áudio/foto. */
export async function analisarMidia(blob, nome) {
  const tipoArq = blob.type || '';
  if (tipoArq.startsWith('image/') || /\.(jpe?g|png|webp|gif|heic|avif)$/i.test(nome || '')) {
    const bmp = await createImageBitmap(blob);
    const info = { tipo: 'foto', w: bmp.width, h: bmp.height, dur: 0, temAudio: false, temVideo: true };
    bmp.close();
    return info;
  }
  const input = new Input({ source: new BlobSource(blob), formats: ALL_FORMATS });
  try {
    const vt = await input.getPrimaryVideoTrack();
    const at = await input.getPrimaryAudioTrack();
    if (!vt && !at) throw new Error('Arquivo sem vídeo e sem som');
    const dur = await input.computeDuration();
    const info = {
      tipo: vt ? 'video' : 'audio', dur,
      w: vt ? vt.displayWidth : 0, h: vt ? vt.displayHeight : 0,
      temAudio: !!at, temVideo: !!vt,
      codec: vt ? vt.codec : at.codec,
      podeLer: vt ? await vt.canDecode() : await at.canDecode()
    };
    if (at) info.audioPodeLer = await at.canDecode();
    return info;
  } finally {
    input.dispose && input.dispose();
  }
}

/** Miniatura (JPEG pequeno) de um vídeo ou foto. */
export async function miniatura(blob, tipo, tempo) {
  let canvas;
  if (tipo === 'foto') {
    const bmp = await createImageBitmap(blob);
    canvas = new OffscreenCanvas(120, 120);
    const ctx = canvas.getContext('2d');
    const s = Math.max(120 / bmp.width, 120 / bmp.height);
    ctx.drawImage(bmp, (120 - bmp.width * s) / 2, (120 - bmp.height * s) / 2, bmp.width * s, bmp.height * s);
    bmp.close();
  } else {
    const input = new Input({ source: new BlobSource(blob), formats: ALL_FORMATS });
    try {
      const vt = await input.getPrimaryVideoTrack();
      if (!vt || !(await vt.canDecode())) return null;
      const sink = new CanvasSink(vt, { width: 120, height: 120, fit: 'cover' });
      const r = (await sink.getCanvas(tempo || 0)) || (await sink.getCanvas(await vt.getFirstTimestamp()));
      if (!r) return null;
      canvas = r.canvas;
    } finally {
      input.dispose && input.dispose();
    }
  }
  const b = canvas.convertToBlob ? await canvas.convertToBlob({ type: 'image/jpeg', quality: .7 })
    : await new Promise((ok) => canvas.toBlob(ok, 'image/jpeg', .7));
  return URL.createObjectURL(b);
}

async function canvasParaUrl(canvas) {
  const b = canvas.convertToBlob ? await canvas.convertToBlob({ type: 'image/jpeg', quality: .65 })
    : await new Promise((ok) => canvas.toBlob(ok, 'image/jpeg', .65));
  return URL.createObjectURL(b);
}

/** Tira de miniaturas para a linha do tempo: [{ t, url }] ao longo do vídeo (até ~30). */
export async function tiras(blob, tipo, dur) {
  if (tipo === 'foto') {
    const u = await miniatura(blob, 'foto');
    return u ? [{ t: 0, url: u }] : [];
  }
  const input = new Input({ source: new BlobSource(blob), formats: ALL_FORMATS });
  try {
    const vt = await input.getPrimaryVideoTrack();
    if (!vt || !(await vt.canDecode())) return [];
    const ini = await vt.getFirstTimestamp();
    const passo = Math.max(0.5, (dur || 1) / 30);
    const ts = [];
    for (let t = ini; t < (dur || 1) - 0.05 || ts.length === 0; t += passo) ts.push(t);
    const sink = new CanvasSink(vt, { width: 72, height: 100, fit: 'cover' });
    const r = [];
    for await (const wc of sink.canvasesAtTimestamps(ts)) {
      if (wc) r.push({ t: wc.timestamp, url: await canvasParaUrl(wc.canvas) });
    }
    return r;
  } finally {
    input.dispose && input.dispose();
  }
}

// ---------- Linha do tempo ----------

/** Duração própria de um clipe (sem contar transições). */
export function duracaoClipe(c, midias) {
  if (c.tipo === 'video') return Math.max(0.1, (c.fim - c.ini) / (c.vel || 1));
  if (c.tipo === 'foto') return Math.max(0.5, c.dur || 3);
  if (c.tipo === 'colagem') {
    if (c.dur) return c.dur;
    let d = 0;
    for (const cel of c.celulas) {
      const m = cel && midias.get(cel.midia);
      if (m && m.tipo === 'video') d = Math.max(d, (m.dur - (cel.ini || 0)) / (c.vel || 1));
    }
    return Math.max(1, d || 5);
  }
  return 1;
}

/**
 * Posição de cada clipe no vídeo final. Dissolver/deslizar/zoom sobrepõem o fim de um clipe ao começo do próximo.
 * Devolve { itens: [{ c, i, ini, dur, sobreEntrada, sobreSaida }], total }.
 */
export function linhaDoTempo(projeto, midias) {
  const itens = [];
  let t = 0;
  projeto.clipes.forEach((c, i) => {
    const dur = duracaoClipe(c, midias);
    const ant = itens[i - 1];
    let entrada = 0;
    if (ant && sobrepoe(ant.c.transicao)) {
      entrada = Math.min(DUR_TRANSICAO, ant.dur / 2, dur / 2);
      t -= entrada;
      ant.sobreSaida = entrada;
    }
    itens.push({ c, i, ini: t, dur, sobreEntrada: entrada, sobreSaida: 0 });
    t += dur;
  });
  return { itens, total: Math.max(0, t) };
}

const sobrepoe = (tr) => tr === 'dissolver' || tr === 'deslizar' || tr === 'zoom';

/** Tempo dentro do arquivo de origem (em segundos) para um tempo local do clipe. */
export function tempoOrigem(c, cel, local, midias) {
  const vel = c.vel || 1;
  if (c.tipo === 'video') return Math.min(c.fim, c.ini + local * vel);
  const m = midias.get(cel.midia);
  const ini = cel.ini || 0;
  let s = ini + local * vel;
  if (m && m.dur && s >= m.dur - 0.02) {
    const tam = m.dur - ini;
    s = c.repetir !== false && tam > 0.3 ? ini + ((s - ini) % tam) : m.dur - 0.02;
  }
  return s;
}

/** Fontes de imagem que um clipe usa: [{ chave, midia, cel (índice ou -1) }]. */
export function fontesDoClipe(c) {
  if (c.tipo === 'colagem') {
    return c.celulas.map((cel, k) => cel && cel.midia ? { chave: c.id + ':' + k, midia: cel.midia, cel: k } : null).filter(Boolean);
  }
  return [{ chave: c.id + ':-1', midia: c.midia, cel: -1 }];
}

/** Clipes visíveis num tempo t, com o quanto aparecem (para as transições). */
export function ativosEm(linha, t) {
  const r = [];
  for (const it of linha.itens) {
    if (t < it.ini || t >= it.ini + it.dur) continue;
    r.push({ ...it, local: t - it.ini });
  }
  if (!r.length && linha.itens.length && t >= linha.total) {
    const u = linha.itens[linha.itens.length - 1];
    r.push({ ...u, local: Math.max(0, u.dur - 0.001) });
  }
  return r;
}

// ---------- Desenho de um quadro ----------

let tmpBlur = null;

/** Fundo desfocado barato: desenha pequeno e estica (fica borrado sem custo). */
function fundoDesfocado(ctx, img, iw, ih, x, y, w, h, filtro) {
  if (!tmpBlur) tmpBlur = new OffscreenCanvas(48, 48);
  const tw = 48, th = Math.max(8, Math.round(48 * h / w));
  tmpBlur.width = tw; tmpBlur.height = th;
  const t = tmpBlur.getContext('2d');
  const s = Math.max(tw / iw, th / ih);
  t.filter = filtro && filtro !== 'none' ? filtro : 'none';
  t.drawImage(img, (tw - iw * s) / 2, (th - ih * s) / 2, iw * s, ih * s);
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(tmpBlur, x, y, w, h);
  ctx.fillStyle = 'rgba(0,0,0,.28)';
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

/** Desenha uma imagem num retângulo: preencher (corta as sobras) ou ajustar (mostra inteira). */
function desenharMidia(ctx, img, iw, ih, x, y, w, h, o) {
  if (!img || !iw || !ih) return;
  const giro = ((o.girar || 0) % 360 + 360) % 360;
  const deitado = giro === 90 || giro === 270;
  const ew = deitado ? ih : iw, eh = deitado ? iw : ih;
  const ajustar = o.ajuste === 'ajustar';
  const zoom = o.zoom || 1;
  let s = (ajustar ? Math.min(w / ew, h / eh) : Math.max(w / ew, h / eh)) * zoom;
  ctx.save();
  ctx.beginPath();
  if (o.raio && ctx.roundRect) ctx.roundRect(x, y, w, h, o.raio); else ctx.rect(x, y, w, h);
  ctx.clip();
  if (ajustar && o.fundo !== 'nenhum') {
    if (o.fundo === 'desfocado') fundoDesfocado(ctx, img, iw, ih, x, y, w, h, o.filtro);
    else { ctx.fillStyle = o.fundo === 'branco' ? '#fff' : '#000'; ctx.fillRect(x, y, w, h); }
  }
  ctx.translate(x + w / 2 + (o.desloc ? o.desloc * w : 0), y + h / 2);
  if (giro) ctx.rotate(giro * Math.PI / 180);
  if (o.espelhar) ctx.scale(-1, 1);
  ctx.filter = o.filtro || 'none';
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, -iw * s / 2, -ih * s / 2, iw * s, ih * s);
  ctx.restore();
}

/** Quebra o texto em linhas que cabem na largura. */
function quebrar(ctx, txt, larg) {
  const linhas = [];
  for (const par of String(txt).split('\n')) {
    let atual = '';
    for (const p of par.split(/\s+/)) {
      const tenta = atual ? atual + ' ' + p : p;
      if (atual && ctx.measureText(tenta).width > larg) { linhas.push(atual); atual = p; } else atual = tenta;
    }
    linhas.push(atual);
  }
  return linhas;
}

export const CORES_TEXTO = ['#ffffff', '#ffd400', '#ff3b30', '#34c759', '#0a84ff', '#000000', '#ff2d92'];

function desenharTexto(ctx, W, H, tx, alfa) {
  if (!tx || !tx.txt || !tx.txt.trim()) return;
  const base = Math.min(W, H);
  const tam = Math.round(base * (tx.tam || 7) / 100);
  ctx.save();
  ctx.globalAlpha = alfa;
  ctx.font = `800 ${tam}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const linhas = quebrar(ctx, tx.txt, W * 0.86);
  const alt = tam * 1.22;
  const bloco = alt * linhas.length;
  let y0 = tx.pos === 'topo' ? H * 0.1 : tx.pos === 'meio' ? (H - bloco) / 2 : H * 0.9 - bloco;
  const cor = tx.cor || '#ffffff';
  linhas.forEach((l, k) => {
    const y = y0 + alt * k + alt / 2;
    if (tx.estilo === 'caixa') {
      const lw = ctx.measureText(l).width;
      ctx.fillStyle = cor === '#000000' ? 'rgba(255,255,255,.9)' : 'rgba(0,0,0,.62)';
      const pad = tam * 0.28;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(W / 2 - lw / 2 - pad, y - alt / 2, lw + pad * 2, alt, tam * 0.2);
      else ctx.rect(W / 2 - lw / 2 - pad, y - alt / 2, lw + pad * 2, alt);
      ctx.fill();
    } else {
      ctx.lineJoin = 'round';
      ctx.lineWidth = Math.max(2, tam * 0.14);
      ctx.strokeStyle = cor === '#000000' ? '#ffffff' : 'rgba(0,0,0,.85)';
      ctx.strokeText(l, W / 2, y);
    }
    ctx.fillStyle = cor;
    ctx.fillText(l, W / 2, y);
  });
  ctx.restore();
}

/**
 * Desenha o quadro do tempo t. `imagem(chave, tempoOrigem)` devolve { img, w, h } ou null.
 * Usado igual na prévia (com <video>) e ao salvar (com os quadros decodificados).
 */
export function desenharQuadro(ctx, W, H, projeto, linha, midias, t, imagem) {
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.filter = 'none';
  ctx.fillStyle = projeto.fundo === 'branco' ? '#fff' : '#000';
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
  const ativos = ativosEm(linha, t);
  for (const a of ativos) {
    const c = a.c;
    let alfa = 1, desloc = 0, zoom = 1;
    // Entrada: transição do clipe anterior.
    if (a.sobreEntrada && a.local < a.sobreEntrada) {
      const p = a.local / a.sobreEntrada;
      const tr = linha.itens[a.i - 1].c.transicao;
      if (tr === 'dissolver') alfa = p;
      else if (tr === 'deslizar') desloc = 1 - easing(p);
      else if (tr === 'zoom') { alfa = p; zoom = 1.25 - 0.25 * easing(p); }
    }
    const ant = linha.itens[a.i - 1];
    if (ant && ant.c.transicao === 'preto' && a.local < DUR_TRANSICAO / 2) alfa *= a.local / (DUR_TRANSICAO / 2);
    if (c.transicao === 'preto' && a.i < linha.itens.length - 1 && a.dur - a.local < DUR_TRANSICAO / 2) {
      alfa *= Math.max(0, (a.dur - a.local) / (DUR_TRANSICAO / 2));
    }
    if (projeto.fadeIn && a.i === 0 && a.local < 0.8) alfa *= a.local / 0.8;
    if (projeto.fadeOut && a.i === linha.itens.length - 1 && a.dur - a.local < 0.8) alfa *= Math.max(0, (a.dur - a.local) / 0.8);
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alfa));
    const filtro = cssFiltro(c);
    if (c.tipo === 'colagem') {
      const lay = COLAGENS[c.layout] || COLAGENS['2h'];
      const g = (c.borda || 0) * Math.min(W, H) / 200;
      const raio = (c.cantos || 0) * Math.min(W, H) / 200;
      if (g > 0 || c.corBorda) {
        ctx.fillStyle = c.corBorda || '#ffffff';
        if (g > 0) ctx.fillRect(0, 0, W, H);
      }
      lay.cel.forEach(([fx, fy, fw, fh], k) => {
        const cel = c.celulas[k];
        const x = fx * W + (fx === 0 ? g : g / 2);
        const y = fy * H + (fy === 0 ? g : g / 2);
        const x2 = (fx + fw) * W - (fx + fw >= 0.999 ? g : g / 2);
        const y2 = (fy + fh) * H - (fy + fh >= 0.999 ? g : g / 2);
        const w = x2 - x, h = y2 - y;
        if (!cel || !cel.midia) {
          ctx.fillStyle = '#1b2033';
          ctx.fillRect(x, y, w, h);
          return;
        }
        const im = imagem(c.id + ':' + k, tempoOrigem(c, cel, a.local, midias));
        if (im) desenharMidia(ctx, im.img, im.w, im.h, x + desloc * W, y, w, h, {
          filtro, raio, zoom: (cel.zoom || 1) * zoom, girar: cel.girar, espelhar: cel.espelhar, ajuste: 'preencher'
        });
      });
    } else {
      const s = c.tipo === 'video' ? tempoOrigem(c, null, a.local, midias) : 0;
      const im = imagem(c.id + ':-1', s);
      let zf = zoom;
      if (c.tipo === 'foto' && c.kenBurns !== false) zf *= 1 + 0.08 * (a.local / a.dur); // foto vai aproximando devagar
      if (im) desenharMidia(ctx, im.img, im.w, im.h, desloc * W, 0, W, H, {
        filtro, ajuste: c.ajuste, fundo: projeto.fundo, girar: c.girar, espelhar: c.espelhar, zoom: zf
      });
    }
    ctx.restore();
    desenharTexto(ctx, W, H, c.texto, Math.max(0, Math.min(1, alfa)));
  }
  if (projeto.marca && projeto.marca.trim()) {
    ctx.save();
    const tam = Math.round(Math.min(W, H) * 0.032);
    ctx.font = `700 ${tam}px system-ui, sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.globalAlpha = 0.75;
    ctx.lineWidth = Math.max(2, tam * 0.15);
    ctx.strokeStyle = 'rgba(0,0,0,.7)';
    ctx.strokeText(projeto.marca, W - tam, H - tam);
    ctx.fillStyle = '#fff';
    ctx.fillText(projeto.marca, W - tam, H - tam);
    ctx.restore();
  }
}

const easing = (p) => 1 - Math.pow(1 - p, 3);

// ---------- Som ----------

/** Lê o som de um trecho de um arquivo como um AudioBuffer só. */
async function lerAudio(blob, ini, fim, ctxAudio) {
  const input = new Input({ source: new BlobSource(blob), formats: ALL_FORMATS });
  try {
    const at = await input.getPrimaryAudioTrack();
    if (!at || !(await at.canDecode())) return null;
    const sink = new AudioBufferSink(at);
    const partes = [];
    let taxa = 0, canais = 0, total = 0, inicio = null;
    for await (const { buffer, timestamp } of sink.buffers(ini, fim)) {
      if (inicio == null) inicio = timestamp;
      taxa = buffer.sampleRate; canais = Math.max(canais, buffer.numberOfChannels);
      partes.push({ buffer, timestamp });
      total = Math.max(total, Math.round((timestamp - inicio) * taxa) + buffer.length);
    }
    if (!partes.length) return null;
    const out = ctxAudio.createBuffer(Math.min(2, canais), total, taxa);
    for (const { buffer, timestamp } of partes) {
      const off = Math.round((timestamp - inicio) * taxa);
      for (let ch = 0; ch < out.numberOfChannels; ch++) {
        const src = buffer.getChannelData(Math.min(ch, buffer.numberOfChannels - 1));
        out.getChannelData(ch).set(src.subarray(0, Math.min(src.length, total - off)), off);
      }
    }
    return { buffer: out, inicio };
  } finally {
    input.dispose && input.dispose();
  }
}

/** Mistura todo o som do projeto (som dos vídeos + música) num AudioBuffer. */
export async function mixarAudio(projeto, linha, midias, aoProgresso) {
  const taxa = 48000;
  const total = Math.max(0.1, linha.total);
  const ctx = new OfflineAudioContext(2, Math.ceil(total * taxa), taxa);
  let algum = false;
  const fontes = [];
  for (const it of linha.itens) {
    const c = it.c;
    const vel = c.vel || 1;
    if (c.tipo === 'video') {
      if (!c.volume) continue;
      fontes.push({ it, midia: c.midia, ini: c.ini, fim: c.fim, vel, vol: c.volume, repetir: false });
    } else if (c.tipo === 'colagem') {
      c.celulas.forEach((cel) => {
        if (!cel || !cel.midia || !cel.som) return;
        const m = midias.get(cel.midia);
        if (!m || !m.temAudio) return;
        fontes.push({ it, midia: cel.midia, ini: cel.ini || 0, fim: m.dur, vel, vol: (c.volume == null ? 1 : c.volume), repetir: c.repetir !== false });
      });
    }
  }
  let n = 0;
  for (const f of fontes) {
    aoProgresso && aoProgresso(n++ / (fontes.length + 1));
    const m = midias.get(f.midia);
    if (!m || !m.temAudio) continue;
    const a = await lerAudio(m.blob, f.ini, f.fim, ctx);
    if (!a) continue;
    algum = true;
    const { it } = f;
    const g = ctx.createGain();
    g.connect(ctx.destination);
    const ini = it.ini, fimIt = it.ini + it.dur;
    // Volume com as transições (o som cruza junto com a imagem).
    g.gain.setValueAtTime(it.sobreEntrada ? 0 : f.vol, ini);
    if (it.sobreEntrada) g.gain.linearRampToValueAtTime(f.vol, ini + it.sobreEntrada);
    if (it.sobreSaida) {
      g.gain.setValueAtTime(f.vol, fimIt - it.sobreSaida);
      g.gain.linearRampToValueAtTime(0, fimIt);
    }
    const tocar = (quando, offset) => {
      const s = ctx.createBufferSource();
      s.buffer = a.buffer;
      s.playbackRate.value = f.vel;
      s.connect(g);
      s.start(quando, Math.max(0, offset));
      s.stop(fimIt);
    };
    const comeco = Math.max(0, f.ini - a.inicio);
    tocar(ini + Math.max(0, a.inicio - f.ini) / f.vel, comeco);
    if (f.repetir) {
      const tam = (a.buffer.duration - comeco) / f.vel;
      for (let q = ini + tam; tam > 0.3 && q < fimIt; q += tam) tocar(q, comeco);
    }
  }
  // Música de fundo
  const mus = projeto.musica && midias.get(projeto.musica.midia);
  if (mus && projeto.musica.volume > 0) {
    aoProgresso && aoProgresso(fontes.length / (fontes.length + 1));
    const a = await lerAudio(mus.blob, projeto.musica.ini || 0, Infinity, ctx);
    if (a) {
      algum = true;
      const g = ctx.createGain();
      const vol = projeto.musica.volume;
      g.gain.setValueAtTime(vol, 0);
      if (projeto.musica.sumir !== false && total > 3) {
        g.gain.setValueAtTime(vol, total - 2);
        g.gain.linearRampToValueAtTime(0, total);
      }
      g.connect(ctx.destination);
      const tam = a.buffer.duration;
      for (let q = 0; q < total; q += tam) {
        const s = ctx.createBufferSource();
        s.buffer = a.buffer;
        s.connect(g);
        s.start(q);
        if (projeto.musica.repetir === false) break;
      }
    }
  }
  if (!algum) return null;
  return await ctx.startRendering();
}

// ---------- Saída (arquivo) ----------

/**
 * Destino do arquivo: no celular grava em pedaços pela parte nativa (Galeria); no navegador, em memória.
 * Devolve { target, concluir(nome, mime, tipo) → { uri } | { blob }, descartar() }.
 */
export async function criarDestino(galeria) {
  if (!galeria) {
    const target = new BufferTarget();
    return {
      target,
      concluir: async (nome, mime) => ({ blob: new Blob([target.buffer], { type: mime }) }),
      descartar: async () => {}
    };
  }
  const { id } = await galeria.criar();
  const writable = new WritableStream({
    async write(chunk) {
      const dados = await paraBase64(chunk.data);
      await galeria.escrever({ id, pos: chunk.position, dados });
    }
  });
  return {
    target: new StreamTarget(writable, { chunked: true, chunkSize: 4 * 1024 * 1024 }),
    concluir: (nome, mime, tipo) => galeria.concluir({ id, nome, mime, tipo }),
    descartar: () => galeria.descartar({ id }).catch(() => {})
  };
}

function paraBase64(u8) {
  return new Promise((ok, falha) => {
    const fr = new FileReader();
    fr.onload = () => { const s = fr.result; ok(s.slice(s.indexOf(',') + 1)); };
    fr.onerror = () => falha(fr.error);
    fr.readAsDataURL(new Blob([u8]));
  });
}

/** Taxa de bits do vídeo (bits/s) pela resolução, quadros por segundo e qualidade. */
export function taxaVideo(w, h, fps, qualidade) {
  const px = w * h;
  let base = px >= 3840 * 2160 * 0.9 ? 40e6 : px >= 2560 * 1440 * 0.9 ? 20e6 : px >= 1920 * 1080 * 0.9 ? 12e6 : 6e6;
  if (px < 1920 * 1080 * 0.9 && px < 1280 * 720 * 1.1) base = 6e6;
  if (fps > 30) base *= 1.5;
  return Math.round(base * ({ economica: 0.55, normal: 1, maxima: 1.6 }[qualidade] || 1));
}

/**
 * Escolhe o codec que o aparelho consegue gravar nesse tamanho.
 * Se o celular só grava 4K "deitado", grava deitado e marca para girar (vídeo vertical continua vertical).
 */
export async function escolherCodec(w, h, bitrate) {
  for (const codec of ['avc', 'hevc']) {
    if (await canEncodeVideo(codec, { width: w, height: h, bitrate })) return { codec, w, h, girar: 0 };
    if (w !== h && await canEncodeVideo(codec, { width: h, height: w, bitrate })) return { codec, w: h, h: w, girar: 90 };
  }
  return null;
}

/** Maior resolução (lado menor) que o aparelho consegue gravar nesse formato. */
export async function maiorResolucao(formato) {
  for (const lado of [2160, 1440, 1080, 720]) {
    const { w, h } = tamanhoSaida(formato, lado);
    if (await escolherCodec(w, h, taxaVideo(w, h, 30, 'normal'))) return lado;
  }
  return 720;
}

/**
 * Grava o projeto como MP4.
 * op: { formato, lado, fps, qualidade, galeria, nome, aoProgresso(p, texto), cancelado() }
 */
export async function exportarVideo(projeto, midias, op) {
  const linha = linhaDoTempo(projeto, midias);
  if (!linha.itens.length) throw new Error('Coloque pelo menos um vídeo ou foto.');
  const { w: W, h: H } = tamanhoSaida(op.formato || projeto.formato, op.lado);
  const fps = op.fps || 30;
  const bitrate = taxaVideo(W, H, fps, op.qualidade);
  const esc = await escolherCodec(W, H, bitrate);
  if (!esc) throw new Error(`Este celular não consegue gravar vídeo em ${W}×${H}. Escolha uma resolução menor.`);
  const prog = op.aoProgresso || (() => {});
  const cancelado = op.cancelado || (() => false);

  // 1) Som
  prog(0, 'Preparando o som…');
  const audio = await mixarAudio(projeto, linha, midias, (p) => prog(p * 0.04, 'Preparando o som…'));
  if (cancelado()) throw new Cancelado();

  // 2) Saída
  const destino = await criarDestino(op.galeria);
  let output = null;
  try {
    output = new Output({ format: new Mp4OutputFormat({ fastStart: op.galeria ? false : 'in-memory' }), target: destino.target });
    const quadro = new OffscreenCanvas(W, H);
    const ctx = quadro.getContext('2d', { alpha: false });
    let telaCodec = quadro;
    let ctxGiro = null;
    if (esc.girar) {
      telaCodec = new OffscreenCanvas(esc.w, esc.h);
      ctxGiro = telaCodec.getContext('2d', { alpha: false });
    }
    const videoSrc = new CanvasSource(telaCodec, { codec: esc.codec, bitrate, keyFrameInterval: 1 });
    output.addVideoTrack(videoSrc, { frameRate: fps, rotation: esc.girar || 0 });
    let audioSrc = null;
    if (audio) {
      const ac = (await canEncodeAudio('aac', { numberOfChannels: 2, sampleRate: 48000, bitrate: 192000 })) ? 'aac' : 'opus';
      audioSrc = new AudioBufferSource({ codec: ac, bitrate: 192000 });
      output.addAudioTrack(audioSrc);
    }
    await output.start();
    if (audioSrc) { await audioSrc.add(audio); audioSrc.close(); }

    // 3) Quadros: cada fonte (vídeo/célula) decodifica só os quadros que serão usados, em ordem.
    const nq = Math.max(1, Math.round(linha.total * fps));
    const pedidos = new Map(); // chave → [tempos]
    for (let k = 0; k < nq; k++) {
      const t = k / fps;
      for (const a of ativosEm(linha, t)) {
        for (const f of fontesDoClipe(a.c)) {
          const m = midias.get(f.midia);
          if (!m || m.tipo !== 'video') continue;
          const cel = f.cel >= 0 ? a.c.celulas[f.cel] : null;
          if (!pedidos.has(f.chave)) pedidos.set(f.chave, []);
          pedidos.get(f.chave).push(tempoOrigem(a.c, cel, a.local, midias));
        }
      }
    }
    const leitores = new Map();
    const entradas = [];
    const maxLado = Math.max(W, H);
    for (const [chave, tempos] of pedidos) {
      const [idClipe, celS] = chave.split(':');
      const c = projeto.clipes.find((x) => x.id === idClipe);
      const k = Number(celS);
      const m = midias.get(k >= 0 ? c.celulas[k].midia : c.midia);
      const input = new Input({ source: new BlobSource(m.blob), formats: ALL_FORMATS });
      entradas.push(input);
      const vt = await input.getPrimaryVideoTrack();
      if (!vt || !(await vt.canDecode())) throw new Error(`Este celular não consegue ler o vídeo "${m.nome}".`);
      // Não precisa decodificar maior que a saída (economiza memória em 4K).
      const esc2 = Math.min(1, maxLado / Math.max(vt.displayWidth, vt.displayHeight));
      const sink = new CanvasSink(vt, {
        width: Math.max(2, Math.round(vt.displayWidth * esc2)), height: Math.max(2, Math.round(vt.displayHeight * esc2)),
        fit: 'fill', poolSize: 2
      });
      leitores.set(chave, { it: sink.canvasesAtTimestamps(tempos)[Symbol.asyncIterator](), ultimo: null });
    }
    const fotos = new Map();
    for (const c of projeto.clipes) {
      for (const f of fontesDoClipe(c)) {
        const m = midias.get(f.midia);
        if (m && m.tipo === 'foto' && !fotos.has(f.midia)) fotos.set(f.midia, await bitmapFoto(m.blob, maxLado));
      }
    }

    const atuais = new Map();
    const imagem = (chave, s) => {
      const r = atuais.get(chave);
      if (r) return r;
      const id = chave.split(':');
      const c = projeto.clipes.find((x) => x.id === id[0]);
      const k = Number(id[1]);
      const mid = k >= 0 ? c.celulas[k] && c.celulas[k].midia : c.midia;
      const b = fotos.get(mid);
      return b ? { img: b, w: b.width, h: b.height } : null;
    };
    const inicio = performance.now();
    for (let k = 0; k < nq; k++) {
      if (cancelado()) throw new Cancelado();
      const t = k / fps;
      atuais.clear();
      for (const a of ativosEm(linha, t)) {
        for (const f of fontesDoClipe(a.c)) {
          const l = leitores.get(f.chave);
          if (!l) continue;
          const r = await l.it.next();
          const wc = r.done ? null : r.value;
          if (wc) l.ultimo = { img: wc.canvas, w: wc.canvas.width, h: wc.canvas.height };
          if (l.ultimo) atuais.set(f.chave, l.ultimo);
        }
      }
      desenharQuadro(ctx, W, H, projeto, linha, midias, t, imagem);
      if (ctxGiro) {
        ctxGiro.setTransform(0, -1, 1, 0, 0, W); // gira 90° para a esquerda (o player gira de volta)
        ctxGiro.drawImage(quadro, 0, 0);
      }
      await videoSrc.add(t, 1 / fps);
      if (k % 5 === 0) {
        const p = (k + 1) / nq;
        const passou = (performance.now() - inicio) / 1000;
        const falta = p > 0.02 ? passou / p - passou : null;
        prog(0.05 + p * 0.93, `Gravando ${Math.round(p * 100)}%` + (falta != null ? ` · falta ${tempoTexto(falta)}` : ''));
      }
    }
    for (const l of leitores.values()) l.it.return && (await l.it.return());
    for (const b of fotos.values()) b.close && b.close();
    videoSrc.close();
    prog(0.99, 'Finalizando o arquivo…');
    await output.finalize();
    for (const i of entradas) i.dispose && i.dispose();
    const r = await destino.concluir(op.nome || nomeArquivo('video', 'mp4'), 'video/mp4', 'video');
    return { ...r, w: esc.girar ? esc.h : esc.w, h: esc.girar ? esc.w : esc.h, codec: esc.codec, total: linha.total };
  } catch (e) {
    try { output && output.state !== 'finalized' && (await output.cancel()); } catch (x) {}
    await destino.descartar();
    throw e;
  }
}

export class Cancelado extends Error {
  constructor() { super('Cancelado'); this.cancelado = true; }
}

async function bitmapFoto(blob, maxLado) {
  const b = await createImageBitmap(blob);
  const s = Math.min(1, maxLado * 1.1 / Math.max(b.width, b.height));
  if (s >= 1) return b;
  const r = await createImageBitmap(b, { resizeWidth: Math.round(b.width * s), resizeHeight: Math.round(b.height * s), resizeQuality: 'high' });
  b.close();
  return r;
}

export function tempoTexto(s) {
  s = Math.max(0, Math.round(s));
  if (s < 60) return s + ' s';
  return Math.floor(s / 60) + ' min ' + String(s % 60).padStart(2, '0') + ' s';
}

export function nomeArquivo(prefixo, ext) {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${prefixo}_${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}.${ext}`;
}

// ---------- Ferramentas rápidas (um arquivo só) ----------

let mp3Pronto = null;
async function prepararMp3() {
  if (!mp3Pronto) {
    mp3Pronto = (async () => {
      if (await canEncodeAudio('mp3')) return;
      const { registerMp3Encoder } = await import('./vendor/mediabunny-mp3-encoder.min.mjs');
      registerMp3Encoder();
    })();
  }
  return mp3Pronto;
}

/**
 * Converte um arquivo: extrair áudio (MP3/M4A), tirar o som, ou mudar a resolução.
 * op: { modo: 'mp3' | 'm4a' | 'semSom' | 'resolucao', ini, fim, kbps, lado, galeria, aoProgresso, cancelado }
 */
export async function converter(blob, op) {
  const input = new Input({ source: new BlobSource(blob), formats: ALL_FORMATS });
  const destino = await criarDestino(op.galeria);
  let conv = null;
  try {
    const trim = {};
    if (op.ini > 0) trim.start = op.ini;
    if (op.fim != null && isFinite(op.fim)) trim.end = op.fim;
    let format, video, audio, nome, mime, tipo;
    if (op.modo === 'mp3') {
      await prepararMp3();
      format = new Mp3OutputFormat();
      video = { discard: true };
      audio = { codec: 'mp3', bitrate: (op.kbps || 192) * 1000, sampleRate: 44100 };
      nome = nomeArquivo('audio', 'mp3'); mime = 'audio/mpeg'; tipo = 'audio';
    } else if (op.modo === 'm4a') {
      format = new Mp4OutputFormat({ fastStart: op.galeria ? false : 'in-memory' });
      video = { discard: true };
      audio = {};
      nome = nomeArquivo('audio', 'm4a'); mime = 'audio/mp4'; tipo = 'audio';
    } else if (op.modo === 'semSom') {
      format = new Mp4OutputFormat({ fastStart: op.galeria ? false : 'in-memory' });
      audio = { discard: true };
      video = {};
      nome = nomeArquivo('sem_som', 'mp4'); mime = 'video/mp4'; tipo = 'video';
    } else {
      const vt = await input.getPrimaryVideoTrack();
      if (!vt) throw new Error('Esse arquivo não tem vídeo.');
      const dw = vt.displayWidth, dh = vt.displayHeight;
      const s = op.lado / Math.min(dw, dh);
      let w = Math.round(dw * s / 2) * 2, h = Math.round(dh * s / 2) * 2;
      const bitrate = taxaVideo(w, h, 30, op.qualidade || 'normal');
      let codec = 'avc';
      let ok = await canEncodeVideo('avc', { width: w, height: h, bitrate });
      if (!ok && await canEncodeVideo('hevc', { width: w, height: h, bitrate })) { codec = 'hevc'; ok = true; }
      if (!ok) throw new Error(`Este celular não consegue gravar vídeo em ${w}×${h}.`);
      format = new Mp4OutputFormat({ fastStart: op.galeria ? false : 'in-memory' });
      video = { width: w, height: h, fit: 'contain', codec, bitrate, forceTranscode: true };
      audio = {};
      nome = nomeArquivo('video_' + (op.lado >= 2160 ? '4k' : op.lado + 'p'), 'mp4'); mime = 'video/mp4'; tipo = 'video';
    }
    const output = new Output({ format, target: destino.target });
    conv = await Conversion.init({ input, output, video, audio, trim: Object.keys(trim).length ? trim : undefined, showWarnings: false });
    if (!conv.isValid) {
      const motivo = (conv.discardedTracks || []).map((d) => d.reason).join(', ');
      throw new Error(op.modo === 'mp3' || op.modo === 'm4a'
        ? 'Esse vídeo não tem som (ou o som não pode ser lido neste celular).'
        : 'Não consegui converter esse arquivo' + (motivo ? ' (' + motivo + ')' : '') + '.');
    }
    conv.onProgress = (p) => op.aoProgresso && op.aoProgresso(p);
    const vigia = setInterval(() => { if (op.cancelado && op.cancelado()) conv.cancel(); }, 250);
    try { await conv.execute(); } finally { clearInterval(vigia); }
    if (op.cancelado && op.cancelado()) throw new Cancelado();
    const r = await destino.concluir(nome, mime, tipo);
    return { ...r, nome, mime, tipo };
  } catch (e) {
    await destino.descartar();
    if (op.cancelado && op.cancelado()) throw new Cancelado();
    throw e;
  } finally {
    input.dispose && input.dispose();
  }
}

/** Foto do quadro atual (JPEG) na resolução escolhida. */
export async function fotoDoQuadro(projeto, midias, t, lado, galeria) {
  const linha = linhaDoTempo(projeto, midias);
  const { w: W, h: H } = tamanhoSaida(projeto.formato, lado);
  const tela = new OffscreenCanvas(W, H);
  const ctx = tela.getContext('2d', { alpha: false });
  const imgs = new Map();
  const entradas = [];
  try {
    for (const a of ativosEm(linha, t)) {
      for (const f of fontesDoClipe(a.c)) {
        const m = midias.get(f.midia);
        if (!m) continue;
        if (m.tipo === 'foto') {
          const b = await bitmapFoto(m.blob, Math.max(W, H));
          imgs.set(f.chave, { img: b, w: b.width, h: b.height });
        } else if (m.tipo === 'video') {
          const input = new Input({ source: new BlobSource(m.blob), formats: ALL_FORMATS });
          entradas.push(input);
          const vt = await input.getPrimaryVideoTrack();
          if (!vt) continue;
          const cel = f.cel >= 0 ? a.c.celulas[f.cel] : null;
          const r = await new CanvasSink(vt).getCanvas(tempoOrigem(a.c, cel, a.local, midias));
          if (r) imgs.set(f.chave, { img: r.canvas, w: r.canvas.width, h: r.canvas.height });
        }
      }
    }
    desenharQuadro(ctx, W, H, projeto, linha, midias, t, (chave) => imgs.get(chave) || null);
    const blob = await tela.convertToBlob({ type: 'image/jpeg', quality: 0.95 });
    const nome = nomeArquivo('foto', 'jpg');
    if (!galeria) return { blob, nome };
    const dados = await paraBase64(new Uint8Array(await blob.arrayBuffer()));
    const { id } = await galeria.criar();
    await galeria.escrever({ id, pos: 0, dados });
    return { ...(await galeria.concluir({ id, nome, mime: 'image/jpeg', tipo: 'foto' })), nome };
  } finally {
    for (const i of entradas) i.dispose && i.dispose();
    for (const v of imgs.values()) v.img.close && v.img.close();
  }
}
