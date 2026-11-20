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
  let abaAtual = 'mp4';      // aba da lista: 'mp4' (vídeos) ou 'mp3' (áudios)

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
    $('baixarVideo').disabled = sim || !info || info.versoes.length === 0;
    $('baixarAudio').disabled = sim || !info || (info.versoes.length === 0 && !info.musica);
    $('colar').disabled = sim;
    if (!sim) $('progresso').hidden = true;
  }

  const mb = (n) => (n / 1048576).toFixed(n < 10485760 ? 1 : 0).replace('.', ',') + ' MB';
  const tempo = (s) => Math.floor(s / 60) + ':' + String(Math.round(s % 60)).padStart(2, '0');

  // ---------- Buscar o vídeo ----------

  async function buscar(texto) {
    if (ocupado) return;
    const link = T.extrairLink(texto);
    if (!link) { estado('Isso não parece um link do TikTok. Copie o link pelo botão Compartilhar do TikTok.', 'erro'); return; }
    if (!nat) { estado('Abra pelo app no celular Android para baixar.', 'erro'); return; }
    porLink(link);
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
  async function lerVideo(link) {
    let final = link;
    let semRede = null;
    let achou = null;
    try {
      const r = await nat.pegar({ url: link });
      final = r.url || link;
      achou = T.lerPagina(r.texto);
      if (!achou) {
        const id = T.idDoLink(final) || T.idDoLink(link);
        if (id && !T.ehFoto(final)) {
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

  function mostrarVideo() {
    $('resultado').hidden = false;
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
    if (info.foto && info.versoes.length === 0) estado('Este post é de fotos: dá para baixar só o áudio (MP3).');
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
    if (!info || ocupado) return;
    travar(true);
    $('pronto').hidden = true;
    estado('');
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
    if (!info || ocupado) return;
    travar(true);
    $('pronto').hidden = true;
    estado('');
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

  function concluir(tipo, r, mime, tamanho) {
    ultimoPronto = { uri: r.uri, mime };
    const pasta = tipo === 'mp4' ? 'Filmes › Salva Vídeo' : 'Música › Salva Vídeo';
    $('prontoTexto').textContent = '✓ Salvo em ' + pasta;
    $('pronto').hidden = false;
    abaAtual = tipo;
    if (info.autor) guardarCriador(info.autor, { nome: info.nome, avatar: info.avatar });
    guardarHistorico({
      tipo, uri: r.uri, mime,
      id: info.id, autor: info.autor, nome: info.nome || '', desc: info.desc,
      quando: Date.now(), tamanho: tamanho || 0
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
    const h = todos.filter((it) => (abaAtual === 'mp3' ? it.tipo === 'mp3' : it.tipo !== 'mp3'));
    $('nVideos').textContent = todos.length - todos.filter((it) => it.tipo === 'mp3').length;
    $('nAudios').textContent = todos.filter((it) => it.tipo === 'mp3').length;
    $('abaVideos').classList.toggle('aba--on', abaAtual !== 'mp3');
    $('abaAudios').classList.toggle('aba--on', abaAtual === 'mp3');
    $('abaVideos').setAttribute('aria-selected', String(abaAtual !== 'mp3'));
    $('abaAudios').setAttribute('aria-selected', String(abaAtual === 'mp3'));
    const ul = $('lista');
    ul.textContent = '';
    $('vazio').textContent = abaAtual === 'mp3' ? 'Nenhum áudio baixado ainda.' : 'Nenhum vídeo baixado ainda.';
    $('vazio').hidden = h.length > 0;
    $('limparHist').hidden = todos.length === 0;
    h.forEach((it) => {
      const li = document.createElement('li');
      const tipo = document.createElement('span');
      tipo.className = 'tipo ' + it.tipo;
      tipo.textContent = it.tipo === 'mp3' ? '♪' : '▶';
      const txt = document.createElement('div');
      txt.className = 'txt';
      const b = document.createElement('b');
      b.textContent = (it.autor ? '@' + it.autor : 'TikTok') + (it.desc ? ' — ' + it.desc : '');
      const s = document.createElement('span');
      const d = new Date(it.quando);
      s.textContent = (it.tipo === 'mp3' ? 'MP3' : 'Vídeo') + ' · ' +
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
    carregarVideosPerfil();
  }

  async function carregarVideosPerfil() {
    const autor = perfilAtual;
    const pedido = 'p' + Date.now();
    perfilPedido = pedido;
    $('maisVideos').hidden = true;
    estadoPerfil(perfilLista.length ? 'Carregando mais vídeos…' : 'Carregando os vídeos…', true);
    if (ouvintePerfil) { try { await ouvintePerfil.remove(); } catch (e) {} }
    ouvintePerfil = await nat.addListener('perfilItens', (p) => {
      if (p.id !== pedido || perfilPedido !== pedido) return;
      T.juntarVideosPerfil(perfilLista, p.itens, autor);
      desenharGrade();
      if (perfilLista.length) estadoPerfil(perfilLista.length + ' vídeos — carregando…', true);
    });
    try {
      const r = await nat.perfilVideos({ usuario: autor, max: perfilMax, id: pedido });
      if (perfilPedido !== pedido) return;
      T.juntarVideosPerfil(perfilLista, r.itens, autor);
      desenharGrade();
      if (perfilLista.length) {
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
        bt.addEventListener('click', () => abrirFolha(v.url));
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
  function abrirFolha(url) {
    $('folhaCorpo').append($('estado'), $('resultado'));
    $('folha').hidden = false;
    buscar(url);
  }

  function fecharFolha() {
    if ($('folha').hidden) return;
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
    const link = T.extrairLink(t);
    if (!link || link === ultimoColado) return;
    marcarColado(link);
    if (T.extrairLink($('link').value) === link && info) return;
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
      const l = T.extrairLink($('link').value);
      if (l && l !== ultimoColado && /tiktok\.com\/\S{3,}/.test(l)) { marcarColado(l); buscar(l); }
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
    $('abaVideos').addEventListener('click', () => { abaAtual = 'mp4'; desenharHistorico(); });
    $('abaAudios').addEventListener('click', () => { abaAtual = 'mp3'; desenharHistorico(); });
    // Botão "Baixar": pega o link copiado (ou o que já está na caixa) e procura o vídeo.
    $('colar').addEventListener('click', async () => {
      const t = T.extrairLink(await lerAreaTransferencia()) || T.extrairLink($('link').value);
      if (!t) { estado('Nenhum link copiado. No TikTok, toque em Compartilhar → Copiar link.', 'erro'); return; }
      const link = t;
      marcarColado(link);
      porLink(link);
      buscar(link);
    });
    $('baixarVideo').addEventListener('click', baixarVideo);
    $('baixarAudio').addEventListener('click', baixarAudio);
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
    try { nat.limparCache(); } catch (e) {}
    // Link que veio pelo "Compartilhar" do TikTok.
    nat.addListener('link', (r) => { if (r && r.texto) { const l = T.extrairLink(r.texto) || r.texto; marcarColado(l); porLink(l); buscar(l); } });
    let veio = null;
    try { veio = (await nat.linkCompartilhado()).texto; } catch (e) {}
    if (veio) {
      const l = T.extrairLink(veio) || veio;
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
