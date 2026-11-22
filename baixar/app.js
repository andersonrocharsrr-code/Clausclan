/* Salva Vídeo — tela do app. A parte de internet e de salvar na galeria é nativa (plugin "Baixador");
   aqui ficam: ler o link, mostrar o vídeo, baixar o vídeo HD e fazer o MP3 (som do vídeo convertido no celular). */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const Cap = window.Capacitor;
  const NATIVO = !!(Cap && Cap.isNativePlatform && Cap.isNativePlatform());
  const plugin = (n) => (NATIVO ? (Cap.Plugins && Cap.Plugins[n]) || (Cap.registerPlugin && Cap.registerPlugin(n)) || null : null);
  const nat = plugin('Baixador');
  const clip = plugin('Clipboard');
  const appCap = plugin('App');
  const T = window.TikTok;
  const IG = window.Instagram;
  // Link do TikTok ou do Instagram (o app reconhece sozinho de onde é).
  const linkDe = (t) => T.extrairLink(t) || (IG && IG.extrairLink(t)) || null;

  const HIST = 'baixar.historico';
  const CRIADORES = 'baixar.criadores'; // { autor: { nome, avatar } } — foto e nome de quem já teve vídeo baixado
  let info = null;          // vídeo mostrado agora
  let linkAtual = '';       // link (final) do vídeo mostrado
  let ocupado = false;      // baixando/convertendo
  let tarefaId = '';        // para cancelar
  let ultimoPronto = null;  // { uri, mime } para o botão "Abrir"
  // Último link já usado (fica guardado): ao entrar no app com o mesmo link copiado, não carrega de novo.
  const ULTIMO = 'baixar.ultimoLink';
  let ultimoColado = (() => { try { return localStorage.getItem(ULTIMO) || ''; } catch (e) { return ''; } })();
  function marcarColado(link) {
    ultimoColado = link;
    try { localStorage.setItem(ULTIMO, link); } catch (e) {}
  }
  let abaAtual = 'tiktok';   // aba da lista de baixados: 'tiktok' ou 'instagram'
  const redeDe = (it) => it.rede || 'tiktok';

  // ---------- Mensagens ----------

  function estado(txt, tipo) {
    const el = $('estado');
    if (!txt) { el.hidden = true; return; }
    el.hidden = false;
    el.textContent = txt;
    el.className = 'estado' + (tipo ? ' ' + tipo : '');
  }

  function mostrarProgresso(txt, pct) {
    $('progresso').hidden = false;
    $('progTexto').textContent = txt;
    const barra = $('barra').parentElement;
    if (pct == null) barra.classList.add('indef');
    else { barra.classList.remove('indef'); $('barra').style.width = Math.max(2, Math.min(100, pct)) + '%'; }
  }

  function travar(sim) {
    ocupado = sim;
    const espera = !info && !!escolhido;
    $('baixarVideo').disabled = sim || (!info && !espera) || (!!info && info.versoes.length === 0);
    $('baixarAudio').disabled = sim || (!info && !espera) || (!!info && info.versoes.length === 0 && !info.musica);
    $('baixarFotos').disabled = sim;
    $('colar').disabled = sim;
    if (!sim) $('progresso').hidden = true;
  }

  const mb = (n) => (n / 1048576).toFixed(n < 10485760 ? 1 : 0).replace('.', ',') + ' MB';
  const tempo = (s) => Math.floor(s / 60) + ':' + String(Math.round(s % 60)).padStart(2, '0');

  // ---------- Buscar o vídeo ----------

  async function buscar(texto) {
    if (ocupado) return;
    const link = linkDe(texto);
    if (!link) { estado('Isso não parece um link do TikTok nem do Instagram. Copie o link pelo botão Compartilhar.', 'erro'); return; }
    if (!nat) { estado('Abra pelo app no celular Android para baixar.', 'erro'); return; }
    porLink(link);
    escolhido = null;
    $('resultado').hidden = true;
    $('pronto').hidden = true;
    info = null;
    travar(true);
    estado('Procurando o vídeo…', 'carregando');
    try {
      const r = await lerVideo(link);
      info = r.info;
      linkAtual = r.link;
      mostrarVideo();
      estado('');
    } catch (e) {
      estado(e.message || 'Não consegui abrir o vídeo.', 'erro');
    } finally {
      travar(false);
    }
  }

  // Abre a página do TikTok; se não vier o vídeo, tenta pelo número do vídeo e depois pelo tikwm.com.
  // Nunca espera mais de 35 s pelo TikTok (antes podia ficar "Procurando…" para sempre).
  function lerVideo(link) {
    return Promise.race([
      lerVideoSemLimite(link),
      new Promise((_, falha) => setTimeout(() => falha(new Error((IG && IG.ehLink(link) ? 'O Instagram' : 'O TikTok') + ' demorou para responder. Tente de novo.')), IG && IG.ehLink(link) ? 55000 : 35000))
    ]);
  }

  async function lerVideoSemLimite(link) {
    if (IG && IG.ehLink(link)) return lerInstagram(link);
    let final = link;
    let semRede = null;
    let achou = null;
    try {
      const r = await nat.pegar({ url: link });
      final = r.url || link;
      achou = T.lerPagina(r.texto);
      if (!achou) {
        const id = T.idDoLink(final) || T.idDoLink(link);
        if (id) { // também para post de fotos: a página /photo/ não traz as fotos nem a música
          const r2 = await nat.pegar({ url: 'https://www.tiktok.com/@i/video/' + id });
          achou = T.lerPagina(r2.texto);
        }
      }
    } catch (e) { semRede = e; }
    if (!achou) {
      try {
        const r = await nat.pegar({ url: 'https://www.tikwm.com/api/?hd=1&url=' + encodeURIComponent(final) });
        achou = T.lerTikwm(r.texto);
      } catch (e) { semRede = semRede || e; }
    }
    if (!achou) {
      if (semRede) throw new Error('Sem internet ou o TikTok não respondeu. Tente de novo.');
      throw new Error('Não achei o vídeo. Ele pode ser privado, ter sido apagado ou o link está incompleto.');
    }
    return { info: achou, link: final };
  }

  // Instagram: acha o código do post e lê a página pública de incorporar (sem login).
  async function lerInstagram(link) {
    let cod = IG.codigo(link);
    if (!cod) {
      // Link de compartilhar (instagram.com/share/…): abre para descobrir o post.
      try { const r = await nat.pegar({ url: link }); cod = IG.codigo(r.url) || IG.codigo(r.texto); } catch (e) {}
      if (!cod && nat.paginaNavegador) {
        try { const r = await nat.paginaNavegador({ url: link, limite: 15000 }); cod = IG.codigo(r.url) || IG.codigo(r.texto); } catch (e) {}
      }
    }
    if (!cod) throw new Error('Esse link do Instagram não é de um Reels ou post. Copie o link do vídeo.');
    let achou = null;
    let semRede = null;
    for (const u of IG.paginas(cod)) {
      try {
        // Navegador escondido: o Instagram só entrega o post pronto para um navegador de verdade.
        const r = nat.paginaNavegador ? await nat.paginaNavegador({ url: u, limite: 15000 }) : await nat.pegar({ url: u });
        const i = IG.lerPagina(r.texto, cod);
        if (i && (!achou || (achou.foto && !i.foto))) achou = i;
        if (achou && !achou.foto) break;
      } catch (e) { semRede = e; }
    }
    if (!achou) {
      if (semRede) throw new Error('Sem internet ou o Instagram não respondeu. Tente de novo.');
      throw new Error('O Instagram não mostrou este vídeo. Ele pode ser de perfil privado ou pedir login.');
    }
    return { info: achou, link: 'https://www.instagram.com/p/' + cod + '/' };
  }

  function mostrarVideo() {
    $('resultado').hidden = false;
    $('capa').onerror = () => { $('capa').onerror = null; $('capa').src = 'icon.svg'; };
    $('capa').src = info.capa || 'icon.svg';
    $('autor').textContent = info.autor ? '@' + info.autor : (info.nome || 'TikTok');
    $('desc').textContent = info.desc || '';
    const q = T.qualidade(info);
    const partes = [];
    if (info.foto) partes.push('Post de fotos');
    else if (q) partes.push(q);
    if (info.duracao) partes.push(tempo(info.duracao));
    $('detalhes').textContent = partes.join(' · ');
    $('qualVideo').textContent = (q ? q + ' · ' : '') + "sem marca d'água";
    $('baixarVideo').hidden = info.versoes.length === 0;
    const nFotos = (info.fotos || []).length;
    $('baixarFotos').hidden = nFotos === 0;
    $('rotFotos').textContent = nFotos === 1 ? '1 foto' : nFotos + ' fotos';
    $('subAudio').textContent = info.versoes.length ? 'só o som do vídeo' : 'a música do post';
    if (info.foto && info.versoes.length === 0) {
      estado(info.rede === 'instagram' ? 'Este post do Instagram é de foto: só vídeos podem ser baixados.' : 'Post de fotos: baixe as fotos ou a música (MP3).');
    }
    travar(false);
    try { $('resultado').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) {}
  }

  // ---------- Baixar ----------

  let ouvinte = null;
  async function ouvirProgresso(rotulo, peso, base) {
    if (ouvinte) { try { await ouvinte.remove(); } catch (e) {} }
    ouvinte = await nat.addListener('progresso', (p) => {
      if (p.id !== tarefaId) return;
      if (p.total > 0) mostrarProgresso(rotulo + ' ' + mb(p.feito) + ' de ' + mb(p.total), base + (p.feito / p.total) * peso);
      else mostrarProgresso(rotulo + ' ' + mb(p.feito), null);
    });
  }

  // Baixa para a pasta temporária. Se os endereços venceram, lê a página de novo e tenta outra vez.
  async function baixarTemp(enderecos, nome, rotulo, peso, base) {
    tarefaId = 't' + Date.now();
    await ouvirProgresso(rotulo, peso, base);
    mostrarProgresso(rotulo, null);
    try {
      return await nat.baixar({ urls: enderecos(info), nome, id: tarefaId });
    } catch (e) {
      if (eCancelado(e)) throw e;
      mostrarProgresso('Tentando de novo…', null);
      const novo = await lerVideo(linkAtual);
      info = novo.info;
      tarefaId = 't' + Date.now();
      return await nat.baixar({ urls: enderecos(info), nome, id: tarefaId });
    }
  }

  const eCancelado = (e) => e && (e.code === 'CANCELADO' || /cancelado/i.test(e.message || ''));

  async function baixarVideo() {
    if (ocupado || (!info && !escolhido)) return;
    travar(true);
    $('pronto').hidden = true;
    estado('');
    if (!info && !(await esperarEscolhido())) { travar(false); return; }
    const nome = T.nomeArquivo(info, 'mp4');
    try {
      const tmp = await baixarTemp(T.enderecosVideo, nome, 'Baixando vídeo…', 100, 0);
      mostrarProgresso('Salvando na galeria…', 100);
      const r = await nat.publicar({ caminho: tmp.caminho, pasta: 'video', nome, mime: 'video/mp4' });
      concluir('mp4', r, 'video/mp4', tmp.tamanho);
    } catch (e) {
      if (eCancelado(e)) estado('Download cancelado.');
      else estado('Não consegui baixar o vídeo: ' + (e.message || e), 'erro');
    } finally {
      travar(false);
    }
  }

  async function baixarAudio() {
    if (ocupado || (!info && !escolhido)) return;
    travar(true);
    $('pronto').hidden = true;
    estado('');
    if (!info && !(await esperarEscolhido())) { travar(false); return; }
    const nome = T.nomeArquivo(info, 'mp3');
    let caminho = null;
    try {
      if (info.versoes.length) {
        try {
          caminho = await mp3DoVideo(nome);
        } catch (e) {
          if (eCancelado(e)) throw e;
          console.warn('MP3 pelo vídeo falhou, usando o som do TikTok', e);
          caminho = null;
        }
      }
      if (!caminho) {
        if (!info.musica) throw new Error('o TikTok não liberou o som deste vídeo');
        tarefaId = 'm' + Date.now();
        await ouvirProgresso('Baixando áudio…', 100, 0);
        mostrarProgresso('Baixando áudio…', null);
        const tmp = await nat.baixar({ urls: [info.musica.url], nome, id: tarefaId });
        caminho = tmp.caminho;
      }
      mostrarProgresso('Salvando na galeria…', 100);
      const r = await nat.publicar({ caminho, pasta: 'audio', nome, mime: 'audio/mpeg' });
      concluir('mp3', r, 'audio/mpeg');
    } catch (e) {
      if (eCancelado(e)) estado('Download cancelado.');
      else estado('Não consegui fazer o MP3: ' + (e.message || e), 'erro');
    } finally {
      travar(false);
    }
  }

  // Post de fotos: baixa todas as fotos para a galeria (Imagens › Salva Vídeo).
  async function baixarFotos() {
    if (ocupado || !info || !(info.fotos || []).length) return;
    travar(true);
    $('pronto').hidden = true;
    estado('');
    const fotos = info.fotos;
    let primeira = null;
    let ok = 0;
    try {
      for (let n = 0; n < fotos.length; n++) {
        const rotulo = 'Baixando foto ' + (n + 1) + ' de ' + fotos.length + '…';
        mostrarProgresso(rotulo, (n / fotos.length) * 100);
        tarefaId = 'f' + Date.now() + n;
        const nome = T.nomeArquivo(info, 'jpg').replace(/\.jpg$/, '_' + String(n + 1).padStart(2, '0') + '.jpg');
        try {
          const tmp = await nat.baixar({ urls: fotos[n].urls, nome, id: tarefaId });
          const r = await nat.publicar({ caminho: tmp.caminho, pasta: 'foto', nome, mime: 'image/jpeg' });
          if (!primeira) primeira = r;
          ok++;
        } catch (e) {
          if (eCancelado(e)) throw e;
        }
      }
      if (!ok) throw new Error('o TikTok não liberou as fotos');
      concluir('foto', primeira, 'image/jpeg', 0, ok);
      if (ok < fotos.length) estado('Salvei ' + ok + ' de ' + fotos.length + ' fotos; as outras o TikTok não liberou.');
    } catch (e) {
      if (eCancelado(e)) estado('Download cancelado.');
      else estado('Não consegui baixar as fotos: ' + (e.message || e), 'erro');
    } finally {
      travar(false);
    }
  }

  // Baixa o vídeo menor (o som é o mesmo), tira o som e converte em MP3 192 kbps aqui no celular.
  async function mp3DoVideo(nome) {
    const tmp = await baixarTemp(T.enderecosAudio, 'som_' + (info.id || 'video') + '.mp4', 'Baixando…', 50, 0);
    mostrarProgresso('Separando o som…', 52);
    const resp = await fetch(Cap.convertFileSrc(tmp.caminho));
    const dados = await resp.arrayBuffer();
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    let audio;
    try {
      audio = await new Promise((ok, falha) => ctx.decodeAudioData(dados, ok, falha));
    } finally {
      try { ctx.close(); } catch (e) {}
    }
    const canais = [];
    for (let c = 0; c < Math.min(2, audio.numberOfChannels); c++) canais.push(audio.getChannelData(c));
    const partes = await new Promise((ok, falha) => {
      const w = new Worker('mp3-worker.js');
      const parar = () => { w.terminate(); falha(Object.assign(new Error('cancelado'), { code: 'CANCELADO' })); };
      cancelarAtual = parar;
      w.onmessage = (ev) => {
        const m = ev.data;
        if (m.progresso != null) mostrarProgresso('Convertendo em MP3… ' + m.progresso + '%', 55 + m.progresso * 0.4);
        else if (m.pronto) { w.terminate(); ok(m.pronto); }
        else if (m.erro) { w.terminate(); falha(new Error(m.erro)); }
      };
      w.onerror = (e) => { w.terminate(); falha(new Error(e.message || 'erro na conversão')); };
      w.postMessage({ canais, taxa: audio.sampleRate, kbps: 192 });
    }).finally(() => { cancelarAtual = null; });

    // Grava o MP3 em pedaços (o caminho até a parte nativa é por texto).
    mostrarProgresso('Gravando o MP3…', 96);
    const tudo = juntar(partes);
    const PEDACO = 768 * 1024;
    let caminho = null;
    for (let i = 0; i < tudo.length; i += PEDACO) {
      const r = await nat.gravarCache({ nome, base64: emBase64(tudo.subarray(i, i + PEDACO)), anexar: i > 0 });
      caminho = r.caminho;
    }
    if (!caminho) throw new Error('MP3 vazio');
    return caminho;
  }

  let cancelarAtual = null;

  function juntar(partes) {
    let n = 0;
    for (const p of partes) n += p.length;
    const out = new Uint8Array(n);
    let o = 0;
    for (const p of partes) { out.set(p, o); o += p.length; }
    return out;
  }

  function emBase64(bytes) {
    let s = '';
    const B = 0x8000;
    for (let i = 0; i < bytes.length; i += B) s += String.fromCharCode.apply(null, bytes.subarray(i, i + B));
    return btoa(s);
  }

  function concluir(tipo, r, mime, tamanho, qtd) {
    ultimoPronto = { uri: r.uri, mime };
    const pasta = tipo === 'mp4' ? 'Filmes › Salva Vídeo' : tipo === 'foto' ? 'Imagens › Salva Vídeo' : 'Música › Salva Vídeo';
    $('prontoTexto').textContent = '✓ Salvo em ' + pasta;
    $('pronto').hidden = false;
    abaAtual = info.rede || 'tiktok';
    if (info.autor && (info.rede || 'tiktok') === 'tiktok') guardarCriador(info.autor, { nome: info.nome, avatar: info.avatar });
    guardarHistorico({
      tipo, uri: r.uri, mime, rede: info.rede || 'tiktok',
      id: info.id, autor: info.autor, nome: info.nome || '', desc: info.desc,
      quando: Date.now(), tamanho: tamanho || 0, qtd: qtd || 0
    });
  }

  async function abrir(uri, mime) {
    try { await nat.abrir({ uri, mime }); }
    catch (e) { estado('Não consegui abrir. Procure na galeria, pasta "Salva Vídeo".', 'erro'); }
  }

  // ---------- Histórico ----------

  function lerHistorico() {
    try { return JSON.parse(localStorage.getItem(HIST)) || []; } catch (e) { return []; }
  }

  function guardarHistorico(item) {
    const h = lerHistorico();
    h.unshift(item);
    try { localStorage.setItem(HIST, JSON.stringify(h.slice(0, 60))); } catch (e) {}
    desenharHistorico();
    desenharCriadores();
  }

  function desenharHistorico() {
    const todos = lerHistorico();
    const h = todos.filter((it) => redeDe(it) === abaAtual);
    $('nTiktok').textContent = todos.filter((it) => redeDe(it) === 'tiktok').length;
    $('nInstagram').textContent = todos.filter((it) => redeDe(it) === 'instagram').length;
    $('abaTiktok').classList.toggle('aba--on', abaAtual === 'tiktok');
    $('abaInstagram').classList.toggle('aba--on', abaAtual === 'instagram');
    $('abaTiktok').setAttribute('aria-selected', String(abaAtual === 'tiktok'));
    $('abaInstagram').setAttribute('aria-selected', String(abaAtual === 'instagram'));
    const ul = $('lista');
    ul.textContent = '';
    $('vazio').textContent = abaAtual === 'instagram' ? 'Nada baixado do Instagram ainda.' : 'Nada baixado do TikTok ainda.';
    $('vazio').hidden = h.length > 0;
    $('limparHist').hidden = todos.length === 0;
    h.forEach((it) => {
      const li = document.createElement('li');
      const tipo = document.createElement('span');
      tipo.className = 'tipo ' + it.tipo;
      tipo.textContent = it.tipo === 'mp3' ? '♪' : it.tipo === 'foto' ? '▦' : '▶';
      const txt = document.createElement('div');
      txt.className = 'txt';
      const b = document.createElement('b');
      b.textContent = (it.autor ? '@' + it.autor : 'TikTok') + (it.desc ? ' — ' + it.desc : '');
      const s = document.createElement('span');
      const d = new Date(it.quando);
      s.textContent = (it.tipo === 'mp3' ? 'MP3' : it.tipo === 'foto' ? (it.qtd > 1 ? it.qtd + ' fotos' : 'Foto') : 'Vídeo') + ' · ' +
        d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) +
        (it.tamanho ? ' · ' + mb(it.tamanho) : '');
      txt.append(b, s);
      const bt = document.createElement('button');
      bt.className = 'btn btn--sec btn--peq';
      bt.type = 'button';
      bt.textContent = '▶ Abrir';
      bt.addEventListener('click', () => abrir(it.uri, it.mime));
      li.append(tipo, txt, bt);
      ul.append(li);
    });
  }

  // ---------- Criadores recentes ----------

  function lerCriadores() {
    try { return JSON.parse(localStorage.getItem(CRIADORES)) || {}; } catch (e) { return {}; }
  }

  function guardarCriador(autor, dados) {
    const c = lerCriadores();
    const atual = c[autor] || {};
    c[autor] = { nome: dados.nome || atual.nome || '', avatar: dados.avatar || atual.avatar || '' };
    try { localStorage.setItem(CRIADORES, JSON.stringify(c)); } catch (e) {}
  }

  // Foto redonda do criador; sem foto (ou se a foto venceu), mostra a primeira letra.
  function fotoCriador(el, autor, avatar) {
    el.textContent = '';
    const letra = () => { el.textContent = (autor || '?').replace(/^[^a-z0-9]+/i, '').charAt(0).toUpperCase() || '?'; };
    if (!avatar) { letra(); return; }
    const img = document.createElement('img');
    img.alt = '';
    img.referrerPolicy = 'no-referrer';
    img.style.cssText = 'width:100%;height:100%;border-radius:50%;object-fit:cover';
    img.onerror = () => { img.remove(); letra(); };
    img.src = avatar;
    el.append(img);
  }

  function desenharCriadores() {
    const c = lerCriadores();
    const vistos = new Set();
    const autores = [];
    for (const it of lerHistorico()) {
      if (redeDe(it) !== 'tiktok') continue;
      if (it.autor && !vistos.has(it.autor)) { vistos.add(it.autor); autores.push(it.autor); }
    }
    const box = $('listaCriadores');
    box.textContent = '';
    $('criadores').hidden = autores.length === 0;
    autores.slice(0, 20).forEach((autor) => {
      const d = c[autor] || {};
      const bt = document.createElement('button');
      bt.type = 'button';
      bt.className = 'criador';
      const foto = document.createElement('span');
      foto.className = 'criador__foto';
      fotoCriador(foto, autor, d.avatar);
      const nome = document.createElement('span');
      nome.className = 'criador__nome';
      nome.textContent = d.nome || '@' + autor;
      bt.append(foto, nome);
      bt.addEventListener('click', () => abrirPerfil(autor));
      box.append(bt);
    });
  }

  // ---------- Perfil: todos os vídeos do criador ----------

  let perfilAtual = '';
  let perfilLista = [];
  let perfilMax = 60;
  let perfilPedido = '';
  let ouvintePerfil = null;
  const itensGrade = new Map();

  function estadoPerfil(txt, carregando) {
    $('perfilEstado').textContent = txt || '';
    $('perfilEstado').className = 'perfil__estado' + (carregando ? ' carregando' : '');
  }

  async function abrirPerfil(autor) {
    if (!nat) return;
    perfilAtual = autor;
    perfilLista = [];
    perfilMax = 60;
    itensGrade.clear();
    $('grade').textContent = '';
    const d = lerCriadores()[autor] || {};
    $('perfilUsuario').textContent = '@' + autor;
    $('perfilNome').textContent = d.nome || '';
    fotoCriador($('perfilFoto'), autor, d.avatar);
    $('perfil').hidden = false;
    $('perfil').scrollTop = 0;
    document.body.classList.add('travado');
    // Nome, foto e quantidade de vídeos atualizados (a foto do TikTok vence depois de uns dias).
    nat.pegar({ url: 'https://www.tiktok.com/@' + autor }).then((r) => {
      const p = T.lerPerfil(r.texto);
      if (!p || perfilAtual !== autor) return;
      guardarCriador(autor, p);
      $('perfilNome').textContent = p.nome + (p.videos ? ' · ' + p.videos + ' vídeos' : '');
      fotoCriador($('perfilFoto'), autor, p.avatar);
      desenharCriadores();
      if (p.privado) estadoPerfil('Este perfil é privado: o TikTok não mostra os vídeos.');
    }).catch(() => {});
    await carregarRecentes(autor);
    if (perfilAtual === autor) carregarVideosPerfil();
  }

  // Vídeos mais recentes pela página de perfil incorporado (rápida e sem depender do navegador escondido).
  async function carregarRecentes(autor) {
    estadoPerfil('Carregando os vídeos…', true);
    try {
      const r = await nat.pegar({ url: 'https://www.tiktok.com/embed/@' + autor });
      const e = T.lerEmbedPerfil(r.texto);
      if (!e || perfilAtual !== autor) return;
      if (e.perfil.nome && !$('perfilNome').textContent) $('perfilNome').textContent = e.perfil.nome;
      if (e.perfil.avatar && !lerCriadores()[autor]?.avatar) {
        guardarCriador(autor, e.perfil);
        fotoCriador($('perfilFoto'), autor, e.perfil.avatar);
        desenharCriadores();
      }
      T.juntarVideosPerfil(perfilLista, e.videos, autor);
      desenharGrade();
      prepararGrade(); // deixa os vídeos prontos para baixar na hora
    } catch (e) {}
  }

  async function carregarVideosPerfil() {
    const autor = perfilAtual;
    const pedido = 'p' + Date.now();
    perfilPedido = pedido;
    $('maisVideos').hidden = true;
    if (!perfilLista.length) await carregarRecentes(autor);
    if (perfilPedido !== pedido) return;
    const antes = perfilLista.length;
    estadoPerfil(antes ? antes + ' vídeos — procurando mais…' : 'Carregando os vídeos…', true);
    if (ouvintePerfil) { try { await ouvintePerfil.remove(); } catch (e) {} }
    ouvintePerfil = await nat.addListener('perfilItens', (p) => {
      if (p.id !== pedido || perfilPedido !== pedido) return;
      T.juntarVideosPerfil(perfilLista, p.itens, autor);
      desenharGrade();
      if (perfilLista.length) estadoPerfil(perfilLista.length + ' vídeos — procurando mais…', true);
    });
    try {
      // Limite de 65 s: se o navegador escondido travar, a tela não fica carregando para sempre.
      const r = await Promise.race([
        nat.perfilVideos({ usuario: autor, max: perfilMax, id: pedido }),
        new Promise((ok) => setTimeout(() => ok({ itens: [] }), 65000))
      ]);
      if (perfilPedido !== pedido) return;
      T.juntarVideosPerfil(perfilLista, r.itens, autor);
      desenharGrade();
      if (perfilLista.length && perfilLista.length === antes) {
        // Só vieram os recentes: mostra e deixa procurar os mais antigos de novo.
        estadoPerfil('Os ' + perfilLista.length + ' vídeos mais recentes. Toque num vídeo para baixar.');
        $('maisVideos').textContent = 'Procurar vídeos mais antigos';
        $('maisVideos').hidden = false;
      } else if (perfilLista.length) {
        estadoPerfil(perfilLista.length + ' vídeos. Toque num vídeo para baixar.');
        $('maisVideos').textContent = 'Carregar mais vídeos';
        $('maisVideos').hidden = perfilLista.length < perfilMax;
      } else {
        estadoPerfil('O TikTok não mostrou os vídeos agora. Tente de novo daqui a pouco.');
        $('maisVideos').textContent = 'Tentar de novo';
        $('maisVideos').hidden = false;
      }
    } catch (e) {
      if (perfilPedido !== pedido || eCancelado(e)) return;
      if (perfilLista.length) {
        estadoPerfil('Os ' + perfilLista.length + ' vídeos mais recentes. Toque num vídeo para baixar.');
        $('maisVideos').textContent = 'Procurar vídeos mais antigos';
        $('maisVideos').hidden = false;
        return;
      }
      estadoPerfil('Não consegui abrir o perfil. Confira a internet e tente de novo.');
      $('maisVideos').textContent = 'Tentar de novo';
      $('maisVideos').hidden = false;
    }
  }

  function desenharGrade() {
    const grade = $('grade');
    perfilLista.forEach((v) => {
      let bt = itensGrade.get(v.id);
      if (!bt) {
        bt = document.createElement('button');
        bt.type = 'button';
        bt.className = 'grade__item';
        bt.setAttribute('aria-label', 'Vídeo ' + (itensGrade.size + 1));
        bt.addEventListener('click', () => abrirFolha(v));
        if (v.tipo === 'photo') {
          const f = document.createElement('span');
          f.className = 'foto';
          f.textContent = 'Fotos';
          bt.append(f);
        }
        itensGrade.set(v.id, bt);
        grade.append(bt);
      }
      if (v.capa && !bt.querySelector('img')) {
        const img = document.createElement('img');
        img.alt = '';
        img.loading = 'lazy';
        img.referrerPolicy = 'no-referrer';
        img.onerror = () => img.remove();
        img.src = v.capa;
        bt.prepend(img);
      }
      if (v.views && !bt.querySelector('.views')) {
        const s = document.createElement('span');
        s.className = 'views';
        s.textContent = '▶ ' + v.views;
        bt.append(s);
      }
    });
  }

  function fecharPerfil() {
    fecharFolha();
    $('perfil').hidden = true;
    document.body.classList.remove('travado');
    perfilPedido = '';
    perfilAtual = '';
    try { nat && nat.pararPerfil(); } catch (e) {}
  }

  // Folha que sobe de baixo com o vídeo escolhido e os botões Vídeo HD / Áudio MP3.
  // ---------- Vídeo escolhido no perfil: janela na hora, dados preparados por trás ----------

  const preparados = new Map(); // id → Promise<{ info, link }>
  let escolhido = null;         // { v, promessa } do vídeo aberto na janela

  function preparar(v) {
    let p = preparados.get(v.id);
    if (!p) {
      p = lerVideo(v.url);
      preparados.set(v.id, p);
      p.catch(() => preparados.delete(v.id)); // se falhar, tenta de novo da próxima vez
    }
    return p;
  }

  // Prepara os vídeos da grade por trás (3 de cada vez), enquanto o perfil está aberto.
  let filaPreparo = 0;
  async function prepararGrade() {
    const minha = ++filaPreparo;
    const fila = perfilLista.slice(0, 15).filter((v) => v.tipo !== 'photo');
    const trabalhador = async () => {
      while (fila.length) {
        if (minha !== filaPreparo || $('perfil').hidden) return;
        try { await preparar(fila.shift()); } catch (e) {}
      }
    };
    await Promise.all([trabalhador(), trabalhador(), trabalhador()]);
  }

  function abrirFolha(v) {
    $('folhaCorpo').append($('estado'), $('resultado'));
    $('folha').hidden = false;
    if (ocupado) return; // um download ainda está em andamento: mostra ele
    estado('');
    $('pronto').hidden = true;
    info = null;
    escolhido = { v, promessa: preparar(v) };
    // Mostra na hora com o que a grade já sabe.
    $('resultado').hidden = false;
    $('capa').src = v.capa || 'icon.svg';
    $('autor').textContent = '@' + perfilAtual;
    $('desc').textContent = v.desc || '';
    const q = v.qualidade ? v.qualidade.replace(/^(\d+)p$/, (m, n) => (+n >= 1080 ? n + 'p Full HD' : +n >= 720 ? n + 'p HD' : m)) : 'HD';
    $('detalhes').textContent = q + (v.views ? ' · ▶ ' + v.views : '');
    $('qualVideo').textContent = q + " · sem marca d'água";
    $('baixarVideo').hidden = v.tipo === 'photo';
    $('baixarFotos').hidden = true;
    travar(false);
    const meu = escolhido;
    meu.promessa.then((r) => {
      if (escolhido !== meu || ocupado) return;
      info = r.info;
      linkAtual = r.link;
      mostrarVideo();
    }).catch(() => {});
  }

  // Chamado pelos botões quando o vídeo ainda está sendo preparado.
  async function esperarEscolhido() {
    const meu = escolhido;
    if (!meu) return false;
    mostrarProgresso('Preparando o vídeo…', null);
    try {
      const r = await new Promise((ok, falha) => {
        cancelarAtual = () => falha(Object.assign(new Error('cancelado'), { code: 'CANCELADO' }));
        meu.promessa.then(ok, falha);
      }).finally(() => { cancelarAtual = null; });
      if (escolhido !== meu) return false;
      info = r.info;
      linkAtual = r.link;
      return true;
    } catch (e) {
      if (eCancelado(e)) { estado('Cancelado.'); return false; }
      preparados.delete(meu.v.id);
      meu.promessa = preparar(meu.v); // na próxima vez que apertar, tenta de novo
      estado((e && e.message) || 'Não consegui abrir o vídeo. Tente de novo.', 'erro');
      return false;
    }
  }

  function fecharFolha() {
    if ($('folha').hidden) return;
    if (!ocupado) escolhido = null;
    $('folha').hidden = true;
    $('lugarEstado').after($('estado'));
    $('lugarResultado').after($('resultado'));
  }

  // ---------- Abrir o TikTok ----------

  // Abre o app do TikTok (para escolher o vídeo e copiar o link); sem o app, abre o site.
  async function abrirTikTok() {
    try {
      if (nat) { await nat.abrirTikTok(); return; }
    } catch (e) {}
    window.open('https://www.tiktok.com/', '_blank');
  }

  async function abrirInstagram() {
    try {
      if (nat) { await nat.abrirInstagram(); return; }
    } catch (e) {}
    window.open('https://www.instagram.com/', '_blank');
  }

  // ---------- Colar / compartilhar ----------

  async function lerAreaTransferencia() {
    try {
      if (clip) { const r = await clip.read(); return (r && r.value) || ''; }
      if (navigator.clipboard && navigator.clipboard.readText) return await navigator.clipboard.readText();
    } catch (e) {}
    return '';
  }

  function porLink(texto) {
    $('link').value = texto;
    $('limpar').hidden = !texto;
  }

  // Ao voltar para o app com um link do TikTok copiado, cola e busca sozinho.
  async function colarAutomatico() {
    if (ocupado || !$('perfil').hidden) return;
    const t = await lerAreaTransferencia();
    const link = linkDe(t);
    if (!link || link === ultimoColado) return;
    marcarColado(link);
    if (linkDe($('link').value) === link && info) return;
    porLink(link);
    buscar(link);
  }

  async function iniciar() {
    $('soNoApp').hidden = NATIVO;
    desenharHistorico();
    desenharCriadores();
    travar(false);

    $('link').addEventListener('input', () => {
      $('limpar').hidden = !$('link').value;
      // Colou o link direto na caixa (teclado): já procura o vídeo.
      const l = linkDe($('link').value);
      if (l && l !== ultimoColado && /(tiktok|instagram)\.com\/\S{3,}/.test(l)) { marcarColado(l); buscar(l); }
    });
    $('link').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); buscar($('link').value); } });
    $('limpar').addEventListener('click', () => { porLink(''); $('link').focus(); });
    $('abrirTikTok').addEventListener('click', abrirTikTok);
    $('voltarPerfil').addEventListener('click', fecharPerfil);
    $('maisVideos').addEventListener('click', () => {
      if (perfilLista.length >= perfilMax) perfilMax += 60;
      carregarVideosPerfil();
    });
    $('fecharFolha').addEventListener('click', fecharFolha);
    $('folhaFundo').addEventListener('click', fecharFolha);
    $('abaTiktok').addEventListener('click', () => { abaAtual = 'tiktok'; desenharHistorico(); });
    $('abaInstagram').addEventListener('click', () => { abaAtual = 'instagram'; desenharHistorico(); });
    $('abrirInstagram').addEventListener('click', abrirInstagram);
    // Botão "Baixar": pega o link copiado (ou o que já está na caixa) e procura o vídeo.
    $('colar').addEventListener('click', async () => {
      const t = linkDe(await lerAreaTransferencia()) || linkDe($('link').value);
      if (!t) { estado('Nenhum link copiado. No TikTok, toque em Compartilhar → Copiar link.', 'erro'); return; }
      const link = t;
      marcarColado(link);
      porLink(link);
      buscar(link);
    });
    $('baixarVideo').addEventListener('click', baixarVideo);
    $('baixarAudio').addEventListener('click', baixarAudio);
    $('baixarFotos').addEventListener('click', baixarFotos);
    $('cancelar').addEventListener('click', () => {
      if (cancelarAtual) cancelarAtual();
      if (nat && tarefaId) nat.cancelar({ id: tarefaId });
    });
    $('abrirPronto').addEventListener('click', () => ultimoPronto && abrir(ultimoPronto.uri, ultimoPronto.mime));
    $('limparHist').addEventListener('click', () => {
      if (!confirm('Limpar a lista? Os arquivos continuam na galeria.')) return;
      try { localStorage.removeItem(HIST); } catch (e) {}
      desenharHistorico();
      desenharCriadores();
    });

    if (!nat) return;
    // Número da versão no rodapé (para saber se o APK novo já foi instalado).
    if (appCap && appCap.getInfo) appCap.getInfo().then((i) => { $('versao').textContent = 'Salva Vídeo · versão ' + (i.build || i.version); }).catch(() => {});
    try { nat.limparCache(); } catch (e) {}
    // Link que veio pelo "Compartilhar" do TikTok.
    nat.addListener('link', (r) => { if (r && r.texto) { const l = linkDe(r.texto) || r.texto; marcarColado(l); porLink(l); buscar(l); } });
    let veio = null;
    try { veio = (await nat.linkCompartilhado()).texto; } catch (e) {}
    if (veio) {
      const l = linkDe(veio) || veio;
      porLink(l);
      // Mesmo link de antes (ex.: app reaberto): só mostra na caixa, sem procurar de novo.
      if (l !== ultimoColado) { marcarColado(l); buscar(l); }
    } else {
      colarAutomatico();
    }
    if (appCap) {
      appCap.addListener('resume', () => setTimeout(colarAutomatico, 300));
      // Botão voltar do Android: fecha a folha, depois o perfil; na tela principal, sai do app.
      appCap.addListener('backButton', () => {
        if (!$('folha').hidden) fecharFolha();
        else if (!$('perfil').hidden) fecharPerfil();
        else appCap.exitApp();
      });
    }
  }

  iniciar();
})();
