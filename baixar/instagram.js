/* Salva Vídeo — Instagram: lê o link (Reels, post, IGTV) e a página pública do post e devolve o
   endereço do vídeo, no mesmo formato do tiktok.js (para o app baixar e fazer o MP3 do mesmo jeito).
   Sem login: só posts de perfis públicos. Primeiro tenta a página de "incorporar" do post
   (/p/CODIGO/embed/captioned/), que é pública; depois a própria página do post.
   Funciona no app (window.Instagram) e no Node (testes). */
(function (raiz) {
  'use strict';

  // Primeiro link do Instagram no texto (o Instagram compartilha "https://www.instagram.com/reel/XXXX/?igsh=…").
  function extrairLink(texto) {
    if (!texto) return null;
    const m = String(texto).match(/https?:\/\/(?:[\w-]+\.)*(?:instagram\.com|instagr\.am)\/[^\s"'<>]*/i);
    if (m) return m[0].replace(/[).,;!]+$/, '');
    const s = String(texto).match(/(?:^|\s)((?:www\.)?instagram\.com\/[^\s"'<>]*)/i);
    return s ? 'https://' + s[1].replace(/[).,;!]+$/, '') : null;
  }

  const ehLink = (url) => /(?:^|\/\/|\.)(?:instagram\.com|instagr\.am)\//i.test(String(url || ''));

  // Código do post: instagram.com/reel/ABC123/, /reels/ABC123/, /p/ABC123/, /tv/ABC123/.
  function codigo(url) {
    const m = String(url || '').match(/\/(?:reels?|p|tv)\/([A-Za-z0-9_-]{5,})/);
    return m ? m[1] : null;
  }

  // Tira os escapes de JSON (às vezes duplos: o JSON vem dentro de um texto JSON).
  function limpar(s) {
    return String(s || '')
      .replace(/\\+u0026/g, '&')
      .replace(/\\+u003[dD]/g, '=')
      .replace(/\\+\//g, '/')
      .replace(/\\+"/g, '"')
      .replace(/&amp;/g, '&');
  }

  // Valor de uma chave JSON no meio do HTML, com ou sem escapes: "chave":"valor" ou \"chave\":\"valor\".
  function campo(html, chave) {
    const re = new RegExp('\\\\*"' + chave + '\\\\*"\\s*:\\s*\\\\*"((?:[^"\\\\]|\\\\(?!"))*)\\\\*"');
    const m = String(html).match(re);
    return m ? limpar(m[1]) : '';
  }

  // Lê a página do post (ou a de incorporar). Devolve null se não achar nada do post.
  function lerPagina(html, cod) {
    const s = String(html || '');
    let video = campo(s, 'video_url');
    if (!video) {
      // Formato novo: "video_versions":[{"type":101,"url":"https://…mp4…",…}]
      const m = s.match(/\\*"video_versions\\*"\s*:\s*\[\s*\{[\s\S]{0,400}?\\*"url\\*"\s*:\s*\\*"((?:[^"\\]|\\(?!"))*)\\*"/);
      if (m) video = limpar(m[1]);
    }
    if (!video) {
      const og = s.match(/<meta[^>]+property="og:video(?::secure_url)?"[^>]+content="([^"]+)"/i);
      if (og) video = limpar(og[1]);
    }
    let capa = campo(s, 'display_url') || campo(s, 'thumbnail_src');
    if (!capa) {
      const im = s.match(/class="EmbeddedMediaImage"[^>]*src="([^"]+)"/) || s.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i);
      if (im) capa = limpar(im[1]);
    }
    let autor = campo(s, 'username');
    if (!autor) {
      const u = s.match(/class="UsernameText"[^>]*>([^<]+)</);
      if (u) autor = u[1].trim();
    }
    if (!video && !capa) return null;
    const altura = +((s.match(/\\*"dimensions\\*"\s*:\s*\{[^}]*?\\*"height\\*"\s*:\s*(\d+)/) || [])[1] || 0);
    const largura = +((s.match(/\\*"dimensions\\*"\s*:\s*\{[^}]*?\\*"width\\*"\s*:\s*(\d+)/) || [])[1] || 0);
    let desc = '';
    const leg = s.match(/class="Caption"[^>]*>([\s\S]*?)<div class="CaptionComments/);
    if (leg) desc = leg[1].replace(/<a[^>]*class="CaptionUsername"[^>]*>[\s\S]*?<\/a>/, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!desc) desc = campo(s, 'text').slice(0, 300);
    const dur = +((s.match(/\\*"video_duration\\*"\s*:\s*([\d.]+)/) || [])[1] || 0);
    return {
      fonte: 'instagram',
      rede: 'instagram',
      id: cod || '',
      autor: autor || '',
      nome: '',
      avatar: limpar(campo(s, 'profile_pic_url')),
      desc,
      capa,
      duracao: Math.round(dur),
      foto: !video,
      versoes: video ? [{ urls: [video], altura, largura, bitrate: 0, codec: '', tamanho: 0, nome: 'instagram' }] : [],
      musica: null
    };
  }

  // Endereços para tentar, do mais provável ao menos provável.
  function paginas(cod) {
    return [
      'https://www.instagram.com/p/' + cod + '/embed/captioned/',
      'https://www.instagram.com/reel/' + cod + '/embed/captioned/',
      'https://www.instagram.com/p/' + cod + '/'
    ];
  }

  const API = { extrairLink, ehLink, codigo, lerPagina, paginas, limpar };
  if (typeof module === 'object' && module.exports) module.exports = API;
  raiz.Instagram = API;
})(typeof window !== 'undefined' ? window : globalThis);
