/* Leitura GRATUITA da folha CAIXA, feita no próprio celular (Tesseract.js, o mesmo leitor do app Caixa).
   A folha é a imagem que o app Caixa gera (folha.js): o desenho é sempre o mesmo, então cada campo é lido no lugar dele.
   O impresso sai em preto e o preenchido em azul (fonte Caveat); para os campos azuis só a tinta azul vai para o leitor. */
(function (raiz) {
  'use strict';

  // Leitor baixado só no primeiro uso; depois o navegador guarda os arquivos no aparelho.
  const TESS = {
    script: 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js',
    workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/worker.min.js',
    corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.1',
    langPath: 'https://cdn.jsdelivr.net/npm/@tesseract.js-data/por@1.0.0/4.0.0',
  };

  let workerP = null;
  function carregarScript(src) {
    return new Promise((ok, erro) => {
      const el = document.createElement('script');
      el.src = src;
      el.onload = ok;
      el.onerror = () => { el.remove(); erro(new Error('Não deu para baixar o leitor. Precisa de internet na 1ª vez.')); };
      document.head.appendChild(el);
    });
  }
  function leitor() {
    if (!workerP) {
      workerP = (async () => {
        if (!raiz.Tesseract) await carregarScript(TESS.script);
        return raiz.Tesseract.createWorker('por', 1, { workerPath: TESS.workerPath, corePath: TESS.corePath, langPath: TESS.langPath });
      })().catch((e) => { workerP = null; throw e; });
    }
    return workerP;
  }

  /* ---------- desenho da folha (o mesmo de caixa/folha.js) ---------- */
  const W = 1240, X0 = 40, X1 = W - 40, LARG = X1 - X0;
  const x = (f) => X0 + LARG * f;
  const TOPO = 36, H_TIT = 70, H_CAB = 58, H_NOTAS = 76;
  const Y_CAB1 = TOPO + H_TIT, Y_CAB2 = Y_CAB1 + H_CAB, Y_CAB3 = Y_CAB2 + H_CAB, Y_NOTAS = Y_CAB3 + H_CAB;
  const Y_CORPO = Y_NOTAS + H_NOTAS;
  const H_LIN = Math.floor((1754 - 36 - Y_CORPO - 6) / 18);
  const BASE = Y_CORPO + 17 * H_LIN + H_LIN + 6; // linha de baixo da assinatura

  // [campo, x1, y1, x2, y2, tinta, tipo]   tinta: 'preto' (impresso) ou 'azul' (preenchido)   tipo: t (texto), d (data), i (inteiro), m (dinheiro)
  const CAMPOS = [
    ['nome', x(0.5), TOPO, X1, Y_CAB1, 'preto', 't'],
    ['cidade', x(0), Y_CAB1, x(0.25), Y_CAB2, 'preto', 't'],
    ['data', x(0.25), Y_CAB1, x(0.47), Y_CAB2, 'preto', 'd'],
    ['semana', x(0.47), Y_CAB1, x(0.58), Y_CAB2, 'preto', 'i'],
    ['foiCobrar', x(0.7), Y_CAB1, x(0.84), Y_CAB2, 'preto', 'm'],
    ['qtNotas', x(0.84), Y_CAB1, x(1), Y_CAB2, 'preto', 'i'],
    ['antecipados', x(0), Y_CAB2, x(0.25), Y_CAB3, 'azul', 'm'],
    ['qtNotasDeixadas', x(0.5), Y_CAB2, x(0.75), Y_CAB3, 'azul', 'i'],
    ['pinos', x(0.75), Y_CAB2, x(1), Y_CAB3, 'azul', 'i'],
    ['valorPepinos', x(0), Y_CAB3, x(0.5), Y_NOTAS, 'azul', 'm'],
    ['pepinoParcial', x(0.5), Y_CAB3, x(1), Y_NOTAS, 'azul', 'm'],
    ['notas25', x(0), Y_NOTAS + 30, x(0.25), Y_CORPO, 'azul', 'm'],
    ['notas4050', x(0.25), Y_NOTAS + 30, x(0.5), Y_CORPO, 'azul', 'm'],
    ['pepinoExtra', x(0.5), Y_NOTAS, x(1), Y_CORPO, 'azul', 'm'],
    ['recebimento', x(0), Y_CORPO, x(0.5), Y_CORPO + H_LIN, 'azul', 'm'],
    ['valorDeixado', x(0), Y_CORPO + 16 * H_LIN, x(0.5), Y_CORPO + 17 * H_LIN, 'azul', 'm'],
  ];

  /* ---------- achar a folha na imagem ---------- */
  // As linhas pretas da borda atravessam a folha inteira: a 1ª e a última linha (e coluna) assim são as bordas.
  function acharFolha(g, w, h) {
    const px = g.getImageData(0, 0, w, h).data;
    const escuro = (i) => px[i] < 110 && px[i + 1] < 110 && px[i + 2] < 110;
    const linhas = [], colunas = new Int32Array(w);
    for (let y = 0; y < h; y++) {
      let n = 0;
      for (let xx = 0; xx < w; xx++) if (escuro((y * w + xx) * 4)) { n++; colunas[xx]++; }
      linhas.push(n);
    }
    const passaL = (n) => n > w * 0.5, passaC = (n) => n > h * 0.5;
    const topo = linhas.findIndex(passaL);
    let base = -1; for (let y = h - 1; y >= 0; y--) if (passaL(linhas[y])) { base = y; break; }
    const esq = Array.prototype.findIndex.call(colunas, passaC);
    let dir = -1; for (let xx = w - 1; xx >= 0; xx--) if (passaC(colunas[xx])) { dir = xx; break; }
    if (topo < 0 || base <= topo || esq < 0 || dir <= esq) return null;
    // A folha é bem mais alta que larga; se a proporção não bate, não é a folha do app Caixa.
    const prop = (base - topo) / (dir - esq);
    const esperado = (BASE - TOPO) / LARG;
    if (Math.abs(prop - esperado) > 0.15) return null;
    return { topo, base, esq, dir };
  }

  /* ---------- recortar e limpar um campo ---------- */
  function recorte(img, f, [, x1, y1, x2, y2, tinta]) {
    const sx = (f.dir - f.esq) / LARG, sy = (f.base - f.topo) / (BASE - TOPO);
    const pad = 6;
    const ix = Math.round(f.esq + (x1 - X0 + pad) * sx), iy = Math.round(f.topo + (y1 - TOPO + pad) * sy);
    const iw = Math.round((x2 - x1 - 2 * pad) * sx), ih = Math.round((y2 - y1 - 2 * pad) * sy);
    // Amplia para o texto ficar com ~60 px de altura (o leitor acerta mais com letra grande).
    const k = Math.max(1, 70 / ih);
    const cv = document.createElement('canvas');
    cv.width = Math.round(iw * k) + 40; cv.height = Math.round(ih * k) + 40;
    const g = cv.getContext('2d', { willReadFrequently: true });
    g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height);
    g.imageSmoothingQuality = 'high';
    g.drawImage(img, ix, iy, iw, ih, 20, 20, iw * k, ih * k);
    const d = g.getImageData(0, 0, cv.width, cv.height);
    const p = d.data;
    let tinta_ = 0;
    for (let i = 0; i < p.length; i += 4) {
      const r = p[i], gg = p[i + 1], b = p[i + 2];
      const sim = tinta === 'azul' ? b > 90 && b - r > 40 && b - gg > 25 : r < 120 && gg < 120 && b < 140 && !(b - r > 40);
      if (sim) tinta_++;
      p[i] = p[i + 1] = p[i + 2] = sim ? 0 : 255;
    }
    g.putImageData(d, 0, 0);
    return { cv, vazio: tinta_ < 30 };
  }

  /* ---------- entender o que foi lido ---------- */
  // "8.189,00" → 8189 · "8189,00" → 8189 · "818900" (vírgula perdida) → 8189
  function dinheiro(t) {
    const s = String(t).replace(/[^\d.,]/g, '');
    const m = s.match(/(\d[\d.]*)[,.](\d{2})$/);
    if (m) return parseFloat(m[1].replace(/\./g, '') + '.' + m[2]);
    const so = s.replace(/\D/g, '');
    if (so.length >= 3) return parseFloat(so.slice(0, -2) + '.' + so.slice(-2));
    return so ? parseFloat(so) : null;
  }
  function entender(campo, tipo, texto) {
    const t = texto.replace(/\s+/g, ' ').trim();
    const depois = (re) => { const m = t.match(re); return m ? m[1].trim() : t; };
    if (campo === 'nome') return depois(/nome\s*:?\s*(.+)$/i);
    if (campo === 'cidade') return depois(/cidade\s*:?\s*(.+)$/i).replace(/[^A-Za-zÀ-ú ]/g, '').trim();
    if (tipo === 'd') { const m = t.match(/(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{2,4})/); return m ? `${m[1]}/${m[2]}/${m[3]}` : ''; }
    if (tipo === 'i') {
      const resto = t.includes(':') ? t.slice(t.lastIndexOf(':') + 1) : t;
      const m = resto.match(/\d+/g); return m ? parseInt(m[m.length - 1], 10) : null;
    }
    if (tipo === 'm') { const m = t.replace(/r\$/i, ' ').match(/[\d.,\s]{3,}/g); return m ? dinheiro(m[m.length - 1]) : dinheiro(t); }
    return t;
  }

  /* Lê a folha. Devolve { campos: {...}, faltou: [nomes dos campos não lidos] } ou lança erro se não achar a folha. */
  async function lerCaixaGratis(file, aoAvancar) {
    const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
    // Trabalha com a folha perto do tamanho original (1240 px de largura).
    const k = Math.min(3, Math.max(0.5, 1400 / bmp.width));
    const cv = document.createElement('canvas');
    cv.width = Math.round(bmp.width * k); cv.height = Math.round(bmp.height * k);
    const g = cv.getContext('2d', { willReadFrequently: true });
    g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height);
    g.imageSmoothingQuality = 'high';
    g.drawImage(bmp, 0, 0, cv.width, cv.height);
    const f = acharFolha(g, cv.width, cv.height);
    if (!f) throw new Error('Não achei a folha CAIXA nesta imagem. A leitura gratuita lê a imagem que o app Caixa gera (a que vai pelo WhatsApp); para foto de papel, use a IA.');

    const w = await leitor();
    const campos = {};
    const faltou = [];
    for (let i = 0; i < CAMPOS.length; i++) {
      const def = CAMPOS[i];
      const [campo, , , , , tinta, tipo] = def;
      if (aoAvancar) aoAvancar(i / CAMPOS.length);
      const { cv: rc, vazio } = recorte(cv, f, def);
      if (vazio && tinta === 'azul') { campos[campo] = 0; continue; }
      await w.setParameters({
        tessedit_pageseg_mode: '7',
        tessedit_char_whitelist: tinta === 'azul' ? (tipo === 'm' ? '0123456789.,' : '0123456789') : '',
      });
      const { data } = await w.recognize(rc);
      const val = entender(campo, tipo, data.text || '');
      if (val === null || val === '' || (typeof val === 'number' && isNaN(val))) faltou.push(campo);
      campos[campo] = val === null ? (tipo === 't' || tipo === 'd' ? '' : 0) : val;
    }
    if (aoAvancar) aoAvancar(1);
    return { campos, faltou };
  }

  raiz.LeitorCaixa = { lerCaixaGratis, _interno: { CAMPOS, acharFolha, recorte, entender, dinheiro } };
})(window);
