/* Salva Vídeo: lê o link e a página do vídeo e devolve os endereços do arquivo SEM marca d'água.
   O TikTok guarda os dados do vídeo num JSON dentro da página (__UNIVERSAL_DATA_FOR_REHYDRATION__);
   a lista "bitrateInfo" traz as qualidades (540p, 720p, 1080p…) e o "playAddr" é o vídeo sem a marca.
   Se a página não vier (bloqueio, captcha), o app usa o serviço tikwm.com como reserva.
   Funciona no app (window.TikTok) e no Node (testes). */
(function (raiz) {
  'use strict';

  // Primeiro link do TikTok no texto (o TikTok compartilha "Veja este vídeo… https://vm.tiktok.com/XXXX/").
  function extrairLink(texto) {
    if (!texto) return null;
    const m = String(texto).match(/https?:\/\/(?:[\w-]+\.)*tiktok\.com\/[^\s"'<>]*/i);
    if (m) return m[0].replace(/[).,;!]+$/, '');
    // Colou sem o "https://".
    const s = String(texto).match(/(?:^|\s)((?:[\w-]+\.)*tiktok\.com\/[^\s"'<>]*)/i);
    return s ? 'https://' + s[1].replace(/[).,;!]+$/, '') : null;
  }

  // Número do vídeo no link completo (…/video/7312345678901234567 ou …/v/7312….html ou ?item_id=…).
  function idDoLink(url) {
    if (!url) return null;
    const m = String(url).match(/\/(?:video|photo|v)\/(\d{8,25})/) || String(url).match(/[?&](?:item_id|share_item_id|aweme_id)=(\d{8,25})/);
    return m ? m[1] : null;
  }

  function ehFoto(url) { return /\/photo\/\d/.test(String(url || '')); }

  function lerJsonDaPagina(html) {
    const m = String(html || '').match(/<script[^>]+id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/);
    if (!m) return null;
    try { return JSON.parse(m[1]); } catch (e) { return null; }
  }

  function nomeCodec(c) {
    c = String(c || '').toLowerCase();
    if (c.includes('265') || c.includes('hev') || c.includes('bytevc1')) return 'h265';
    if (c.includes('264')) return 'h264';
    return c || '';
  }

  // Ordem das qualidades: a maior resolução primeiro; empatou, a de mais qualidade (bitrate).
  function ordenar(lista) {
    return lista.slice().sort((a, b) => (b.altura - a.altura) || (b.bitrate - a.bitrate));
  }

  // Dados do vídeo a partir do HTML da página do TikTok. Devolve null se a página não tiver o vídeo.
  function lerPagina(html) {
    const d = lerJsonDaPagina(html);
    const esc = d && d.__DEFAULT_SCOPE__;
    if (!esc) return null;
    const det = esc['webapp.video-detail'] || esc['webapp.reflow.video.detail'];
    const it = det && det.itemInfo && det.itemInfo.itemStruct;
    if (!it || !it.id) return null;
    return deItem(it);
  }

  function deItem(it) {
    const v = it.video || {};
    const versoes = [];
    for (const b of v.bitrateInfo || []) {
      const p = b.PlayAddr || {};
      const urls = (p.UrlList || []).filter(Boolean);
      if (!urls.length) continue;
      versoes.push({
        urls,
        altura: +p.Height || 0,
        largura: +p.Width || 0,
        bitrate: +b.Bitrate || 0,
        codec: nomeCodec(b.CodecType),
        tamanho: +p.DataSize || 0,
        nome: b.GearName || ''
      });
    }
    if (v.playAddr) {
      versoes.push({ urls: [v.playAddr], altura: +v.height || 0, largura: +v.width || 0, bitrate: 0, codec: '', tamanho: 0, nome: 'playAddr' });
    }
    const autor = it.author || {};
    const mus = it.music || {};
    const fotos = (it.imagePost && it.imagePost.images) || [];
    return {
      fonte: 'tiktok',
      id: String(it.id),
      autor: autor.uniqueId || '',
      nome: autor.nickname || '',
      avatar: autor.avatarThumb || autor.avatarMedium || autor.avatarLarger || '',
      desc: it.desc || '',
      capa: v.cover || v.originCover || v.dynamicCover || '',
      duracao: +v.duration || 0,
      foto: fotos.length > 0,
      versoes: ordenar(versoes),
      musica: mus.playUrl ? { url: mus.playUrl, titulo: mus.title || '', autor: mus.authorName || '' } : null
    };
  }

  // Resposta do tikwm.com (https://www.tikwm.com/api/?url=…&hd=1), usado quando a página não vem.
  function lerTikwm(json) {
    const r = typeof json === 'string' ? (() => { try { return JSON.parse(json); } catch (e) { return null; } })() : json;
    if (!r || r.code !== 0 || !r.data) return null;
    const d = r.data;
    const abs = (u) => (!u ? '' : /^https?:/.test(u) ? u : 'https://www.tikwm.com' + u);
    const versoes = [];
    if (d.hdplay) versoes.push({ urls: [abs(d.hdplay)], altura: 1, largura: 0, bitrate: 2, codec: '', tamanho: +d.hd_size || 0, nome: 'hd' });
    if (d.play) versoes.push({ urls: [abs(d.play)], altura: 0, largura: 0, bitrate: 1, codec: '', tamanho: +d.size || 0, nome: 'play' });
    const a = d.author || {};
    const mi = d.music_info || {};
    return {
      fonte: 'tikwm',
      id: String(d.id || ''),
      autor: a.unique_id || '',
      nome: a.nickname || '',
      avatar: abs(a.avatar),
      desc: d.title || '',
      capa: abs(d.origin_cover || d.cover),
      duracao: +d.duration || 0,
      foto: Array.isArray(d.images) && d.images.length > 0,
      versoes: ordenar(versoes),
      musica: d.music ? { url: abs(d.music), titulo: mi.title || '', autor: mi.author || '' } : null
    };
  }

  // Texto da qualidade para mostrar: "720p HD", "1080p Full HD", "540p".
  function qualidade(info) {
    const v = info && info.versoes && info.versoes[0];
    if (!v) return '';
    if (info.fonte === 'tikwm') return 'HD';
    const lado = Math.min(v.altura || 0, v.largura || v.altura || 0) || v.altura;
    if (!lado) return '';
    if (lado >= 1080) return lado + 'p Full HD';
    if (lado >= 720) return lado + 'p HD';
    return lado + 'p';
  }

  // Todos os endereços para tentar, do melhor para o pior (se um falhar, o próximo).
  function enderecosVideo(info) {
    const vistos = new Set();
    const lista = [];
    for (const v of info.versoes) for (const u of v.urls) if (!vistos.has(u)) { vistos.add(u); lista.push(u); }
    return lista;
  }

  // Para o MP3 só importa o som: pega a versão menor (baixa mais rápido; o áudio é o mesmo).
  function enderecosAudio(info) {
    const vs = info.versoes.slice().sort((a, b) => (a.tamanho || 9e15) - (b.tamanho || 9e15));
    const vistos = new Set();
    const lista = [];
    for (const v of vs) for (const u of v.urls) if (!vistos.has(u)) { vistos.add(u); lista.push(u); }
    return lista;
  }

  // Nome de arquivo seguro: "tiktok_autor_7312….mp4".
  function nomeArquivo(info, ext) {
    const autor = String(info.autor || 'video').replace(/[^\w.-]+/g, '').slice(0, 30) || 'video';
    return (info.rede || 'tiktok') + '_' + autor + '_' + (info.id || Date.now()) + '.' + ext;
  }

  // Dados do perfil (página https://www.tiktok.com/@usuario): nome, foto e quantos vídeos tem.
  function lerPerfil(html) {
    const d = lerJsonDaPagina(html);
    const esc = d && d.__DEFAULT_SCOPE__;
    const ui = esc && esc['webapp.user-detail'] && esc['webapp.user-detail'].userInfo;
    const u = ui && ui.user;
    if (!u || !u.uniqueId) return null;
    const st = ui.stats || ui.statsV2 || {};
    return {
      autor: u.uniqueId,
      nome: u.nickname || '',
      avatar: u.avatarMedium || u.avatarThumb || u.avatarLarger || '',
      videos: +st.videoCount || 0,
      privado: !!u.privateAccount
    };
  }

  // Visualizações no jeito do TikTok: 624, 16,3 mil, 1,2 mi.
  function contagem(n) {
    n = +n || 0;
    const f = (v) => v.toFixed(v < 10 ? 1 : 0).replace('.', ',').replace(/,0$/, '');
    if (n >= 1e6) return f(n / 1e6) + ' mi';
    if (n >= 1e3) return f(n / 1e3) + ' mil';
    return String(n);
  }

  // Página de perfil incorporado (https://www.tiktok.com/embed/@usuario): é pública, vem pronta do servidor
  // e traz os vídeos mais recentes do perfil (uns 10), com capa e visualizações.
  function lerEmbedPerfil(html) {
    const m = String(html || '').match(/<script[^>]+id="__FRONTITY_CONNECT_STATE__"[^>]*>([\s\S]*?)<\/script>/);
    if (!m) return null;
    let d;
    try { d = JSON.parse(m[1]); } catch (e) { return null; }
    const dados = d && d.source && d.source.data;
    if (!dados) return null;
    const chave = Object.keys(dados).find((k) => /^\/embed\/@/.test(k) && dados[k] && dados[k].videoList);
    if (!chave) return null;
    const pg = dados[chave];
    const u = pg.userInfo || {};
    const autor = u.uniqueId || chave.replace(/^\/embed\/@/, '');
    return {
      perfil: { autor, nome: u.nickname || '', avatar: u.avatarThumbUrl || '' },
      videos: (pg.videoList || []).filter((v) => v && v.id).map((v) => ({
        id: String(v.id),
        url: 'https://www.tiktok.com/@' + (v.authorUniqueId || autor) + '/video/' + v.id,
        tipo: 'video',
        capa: v.coverUrl || v.originCoverUrl || '',
        views: v.playCount != null ? contagem(v.playCount) : '',
        desc: v.desc || '',
        qualidade: v.ratio || ''
      }))
    };
  }

  // Junta a lista de vídeos lida da página do perfil (sem repetir; guarda a capa quando ela aparece).
  function juntarVideosPerfil(lista, novos, usuario) {
    const porId = new Map(lista.map((v) => [v.id, v]));
    const dono = String(usuario || '').toLowerCase();
    for (const n of novos || []) {
      if (!n || !n.id) continue;
      if (dono && n.url && !String(n.url).toLowerCase().includes('/@' + dono + '/')) continue;
      const v = porId.get(n.id);
      if (v) { for (const k of ['capa', 'views', 'desc', 'qualidade']) if (n[k] && !v[k]) v[k] = n[k]; }
      else { const novo = { id: n.id, url: n.url, tipo: n.tipo || 'video', capa: n.capa || '', views: n.views || '', desc: n.desc || '', qualidade: n.qualidade || '' }; porId.set(n.id, novo); lista.push(novo); }
    }
    return lista;
  }

  const API = { lerEmbedPerfil, contagem, lerPerfil, juntarVideosPerfil, extrairLink, idDoLink, ehFoto, lerPagina, lerTikwm, qualidade, enderecosVideo, enderecosAudio, nomeArquivo };
  if (typeof module === 'object' && module.exports) module.exports = API;
  raiz.TikTok = API;
})(typeof window !== 'undefined' ? window : globalThis);
