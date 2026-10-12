/* Leitura GRATUITA das fotos, feita no próprio celular (Tesseract.js, o mesmo leitor do Nexa Money).
   Serve para o que é IMPRESSO: as notas (cupom térmico) e o cabeçalho da folha CAIXA em branco.
   Letra de mão (pepino extra, folha preenchida) só a IA lê direito. */

// Leitor baixado só no primeiro uso; depois o navegador guarda os arquivos no aparelho.
const TESS = {
  script: 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js',
  workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/worker.min.js',
  corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.1',
  langPath: 'https://cdn.jsdelivr.net/npm/@tesseract.js-data/por@1.0.0/4.0.0',
};

let workerP = null;
let progresso = null;

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
      if (!window.Tesseract) await carregarScript(TESS.script);
      return window.Tesseract.createWorker('por', 1, {
        workerPath: TESS.workerPath, corePath: TESS.corePath, langPath: TESS.langPath,
        logger: (m) => progresso && progresso(m),
      });
    })().catch((e) => { workerP = null; throw e; });
  }
  return workerP;
}

/* ---------- tratar a foto antes de ler ---------- */
// Cinza + limiar adaptativo (cada ponto comparado com a média em volta): tira sombra, fundo e cor do papel.
// Sem isso o leitor se perde com o fundo, o dedo e o papel térmico amarelado.
async function tratar(file, giro = 0, lado = 1800) {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  // Foto grande diminui até `lado`; foto pequena (ex.: comprimida pelo WhatsApp) é ampliada até ~1000 px no lado menor.
  const menor = Math.min(bmp.width, bmp.height), maior = Math.max(bmp.width, bmp.height);
  const k = menor < 1000 ? Math.min(1000 / menor, 4000 / maior) : Math.min(1, lado / maior);
  const w0 = Math.round(bmp.width * k), h0 = Math.round(bmp.height * k);
  const deitado = giro === 90 || giro === 270;
  const w = deitado ? h0 : w0, h = deitado ? w0 : h0;
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const g = cv.getContext('2d', { willReadFrequently: true });
  g.translate(w / 2, h / 2);
  g.rotate((giro * Math.PI) / 180);
  g.imageSmoothingEnabled = true;
  g.imageSmoothingQuality = 'high';
  g.drawImage(bmp, -w0 / 2, -h0 / 2, w0, h0);
  const img = g.getImageData(0, 0, w, h);
  const px = img.data;
  const cinza = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) cinza[i] = 0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2];
  // Soma acumulada para tirar a média de qualquer quadrado em tempo constante.
  const S = new Float64Array((w + 1) * (h + 1));
  for (let y = 1; y <= h; y++) {
    let linha = 0;
    for (let x = 1; x <= w; x++) {
      linha += cinza[(y - 1) * w + (x - 1)];
      S[y * (w + 1) + x] = S[(y - 1) * (w + 1) + x] + linha;
    }
  }
  const r = 25, desc = 12;
  for (let y = 0; y < h; y++) {
    const y1 = Math.max(0, y - r), y2 = Math.min(h, y + r + 1);
    for (let x = 0; x < w; x++) {
      const x1 = Math.max(0, x - r), x2 = Math.min(w, x + r + 1);
      const soma = S[y2 * (w + 1) + x2] - S[y1 * (w + 1) + x2] - S[y2 * (w + 1) + x1] + S[y1 * (w + 1) + x1];
      const media = soma / ((x2 - x1) * (y2 - y1));
      const v = cinza[y * w + x] < media - desc ? 0 : 255;
      const i = (y * w + x) * 4;
      px[i] = px[i + 1] = px[i + 2] = v;
    }
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.putImageData(img, 0, 0);
  return cv;
}

// Última leitura (imagem tratada + texto), para mostrar quando não der certo.
let ultima = null;
export const ultimaLeitura = () => ultima;

async function lerTexto(file, giro, aoProgredir, lado = 1800) {
  const w = await leitor();
  progresso = aoProgredir;
  try {
    const cv = await tratar(file, giro, lado);
    const { data } = await w.recognize(cv);
    ultima = { canvas: cv, texto: data.text };
    return data.text;
  } finally {
    progresso = null;
  }
}

/* ---------- entender o texto ---------- */
const DINHEIRO = /(\d{1,3}(?:\.\d{3})+,\d{2}|\d+,\d{2})(?!\d)/g;
const valorBR = (t) => Number(t.replace(/\./g, '').replace(',', '.'));
// O leitor costuma confundir letras e números parecidos dentro de valores.
const consertarNumeros = (t) => t.replace(/[Oo]/g, '0').replace(/[Il|]/g, '1').replace(/S/g, '5').replace(/Z/g, '2').replace(/B/g, '8');
const semAcento = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '');

// Nota (cupom da empresa): número "N. 000001", cliente (linha antes do CPF), cidade, data do acerto, total,
// valor recebido e a faixa: "quitada com 25%" = notas 25%; "Nota quitada" sem porcentagem = notas 40% e 50%.
export function entenderNota(texto) {
  const linhas = texto.split('\n').map((l) => l.trim()).filter(Boolean);
  const LIN = linhas.map((l) => semAcento(l).toUpperCase());
  const tudo = LIN.join('\n');
  const r = { numero: '', cliente: '', cidade: '', data: '', valor: 0, total: 0, comissao: 0, devolucao: 0, faixa: '', faltou: [] };

  // Número: o "N. 000001" do topo (os números de endereço, "N.876", têm menos dígitos).
  const iAcerto = LIN.findIndex((l) => /DATA DO ACERTO/.test(l));
  const topo = (iAcerto > 0 ? LIN.slice(0, iAcerto) : LIN.slice(0, 6)).join('\n');
  const mNum = topo.match(/\bN\s*[.,º°:]?\s*(\d{5,7})\b/);
  if (mNum) r.numero = mNum[1];

  // Linha do CPF: pela palavra, ou pelo formato 000.000.000-00 (o leitor às vezes perde o "CPF").
  const iCpf = LIN.findIndex((l) => /\bC[PF]F\s*[:;.]/.test(l) || /^.{0,3}PF\s*[:;]\s*\d/.test(l)
    || /\d{3}\s*[.,]\s*\d{3}\s*[.,]\s*\d{3}\s*-\s*\d{2}/.test(l));
  // Cliente: a linha logo acima do CPF que pareça um nome (2+ palavras em maiúsculas); sujeira lida no meio é pulada.
  for (let i = iCpf - 1; i >= Math.max(0, iCpf - 3) && !r.cliente; i--) {
    const m = linhas[i].match(/[A-ZÀ-Ú]{2,}(?:\s+[A-ZÀ-Ú]{2,})+/);
    if (m && /CPF|END|REF|BAIRRO/.test(m[0])) continue;
    if (m) r.cliente = m[0].trim();
  }

  // "Cidade:PORTO ACRE UF:AC" — tolera o rótulo meio apagado ("nydade:") e o "UF" perdido.
  const mCid = tudo.match(/CIDADE\s*[:;.,]?\s*([A-Z0-9 .'-]+?)\s+UF\b/)
    || tudo.match(/(?:C?[I1L]?D?ADE|[A-Z]{1,3}DADE)\s*[:;.,]\s*([A-Z][A-Z .'-]{2,}?)\s*(?:\bUF\b|[)|\]]|$)/m);
  if (mCid) r.cidade = mCid[1].replace(/\s+/g, ' ').trim();

  const depois = iAcerto >= 0 ? LIN.slice(iAcerto, iAcerto + 3).join(' ') : tudo;
  const mData = depois.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  // Ano lido errado (ex.: 2028) é descartado.
  if (mData && Math.abs(Number(mData[3]) - new Date().getFullYear()) <= 1 && Number(mData[2]) >= 1 && Number(mData[2]) <= 12) r.data = `${mData[3]}-${mData[2]}-${mData[1]}`;

  // Valor recebido: "Recebi o valor de R$426,00" ou "Total de pagamentos:426,00" (é o que entra no caixa).
  // O TOTAL da nota fica só para conferir (com devolução, o recebido é menor que o total).
  // Lê o valor que vem depois da palavra-chave, tolerando o que o leitor erra nesses cupons:
  // ponto no lugar da vírgula ("616.08"), espaço ("616, 00") e letras no lugar do zero cortado ("426,9g", "426,9,").
  const valorDe = (re) => {
    for (let i = LIN.length - 1; i >= 0; i--) {
      if (!re.test(LIN[i])) continue;
      const resto = LIN[i].replace(re, ' ').replace(/^[^\d]*?R\s*[$5S]/, ' ');
      const m = resto.match(/(\d{1,3}(?:[.\s]\d{3})+|\d+)\s*[,.]\s*([0-9A-Z]{0,2})/);
      if (!m) continue;
      const inteiro = Number(m[1].replace(/\D/g, ''));
      const cent = (m[2] + '00').slice(0, 2).replace(/[^0-9]/g, '0');
      const v = inteiro + Number(cent) / 100;
      if (Number.isFinite(v) && v > 0) return v;
    }
    return 0;
  };
  // A impressora usa o zero cortado (Ø), que o leitor lê como 8, 9 ou 6: "616,08" é 616,00.
  // Os valores das notas quase nunca têm centavos, então centavos só com esses dígitos viram ,00.
  let acertouCentavos = false;
  const zeroCortado = (v) => {
    if (!v) return v;
    const cent = Math.round((v % 1) * 100);
    const ds = String(cent).padStart(2, '0');
    if (cent && /^[0689]{2}$/.test(ds)) { acertouCentavos = true; return Math.trunc(v); }
    return v;
  };
  const recebi = zeroCortado(valorDe(/RECEB[I1L]\s*[O0]\s*VAL[O0]R/));
  const pagos = zeroCortado(valorDe(/T[O0]TAL DE PAGAMENT/));
  // Quando os dois aparecem e discordam, vale o que tiver a parte inteira igual ao outro… ou o "Recebi".
  r.valor = recebi && pagos && Math.trunc(recebi) !== Math.trunc(pagos)
    ? (r.faltou.push(`"Recebi" (${recebi}) e "Total de pagamentos" (${pagos}) diferentes`), recebi)
    : recebi || pagos;
  // Centavos acertados só pedem conferência quando não deu para comparar o "Recebi" com o "Total de pagamentos".
  if (acertouCentavos && !(recebi && pagos && recebi === pagos)) r.faltou.push('confira os centavos');
  // Achou o valor por só um dos dois: tudo bem, mas vale uma olhada.
  if (r.valor && !(recebi && pagos)) r.faltou.push('valor lido de uma linha só');
  r.total = zeroCortado(valorDe(/^.{0,3}T[O0]TAL\s*R/));
  r.comissao = zeroCortado(valorDe(/T[O0]TAL DE C[O0]M[I1]SS/));
  // "TOTAL DE DEVOLUCOES R$284,00": peças devolvidas; somam no valor da nota para as notas em branco.
  r.devolucao = zeroCortado(valorDe(/T[O0]TAL DE DEV[O0]LU/));
  // Confere com os itens devolvidos ("002 x 142,00 = 284,00"), entre "DEVOLUCOES" e o total: o leitor às vezes
  // troca um dígito no total ("R$784"). Se discordarem, valem os itens e a nota fica para conferir.
  const iDevTot = LIN.findIndex((l) => /T[O0]TAL DE DEV[O0]LU/.test(l));
  const iDev = LIN.findIndex((l, i) => i < iDevTot && /DEV[O0]LU[CÇ]/.test(l));
  if (iDev >= 0) {
    const itensDev = LIN.slice(iDev + 1, iDevTot).map((l) => l.match(/=\s*([\dOSIl.,]+,\s*\d{2})/)).filter(Boolean)
      .map((m) => valorBR(consertarNumeros(m[1]).replace(/\s/g, ''))).filter((v) => v > 0);
    const somaDev = Math.round(itensDev.reduce((a, b) => a + b, 0) * 100) / 100;
    if (somaDev && Math.round(somaDev) !== Math.round(r.devolucao)) {
      if (r.devolucao) r.faltou.push(`devolução lida ${r.devolucao}, os itens somam ${somaDev}: usei ${somaDev}`);
      r.devolucao = somaDev;
    }
  }
  if (!r.valor && r.total) { r.valor = r.total; r.faltou.push('não achei o "Recebi o valor": usei o TOTAL'); }
  if (!r.valor) {
    const itens = LIN.map((l) => l.match(/=\s*([\dOSIl.,]+,\s*\d{2})/)).filter(Boolean)
      .map((m) => valorBR(consertarNumeros(m[1]).replace(/\s/g, ''))).filter((v) => v > 0);
    if (itens.length) {
      r.valor = Math.round(itens.reduce((a, b) => a + b, 0) * 100) / 100;
      r.faltou.push('valor não lido: somei os itens');
    }
  }

  // Faixa: "Nota quitada com 25% de desconto" = 25% (olhar o 25% ANTES do "quitada").
  // "Nota quitada" sem porcentagem = 40% ou 50%, pela comissão (308 de 616 = 50%).
  if (/\b25\s*%/.test(tudo) || /QUITAD.{0,25}DESC[O0]NT/.test(tudo.replace(/\n/g, ' '))) r.faixa = '25';
  else if (/QUITAD/.test(tudo)) {
    const base = r.total || r.valor;
    const p = base && r.comissao ? r.comissao / base : 0;
    r.faixa = p > 0.45 ? '50' : '40';
  }

  if (!r.valor) r.faltou.push('valor');
  if (!r.faixa) r.faltou.push('não achei "25%" nem "Nota quitada" no final');
  r.faltou = [...new Set(r.faltou)];
  return r;
}

// Cabeçalho impresso da folha CAIXA em branco.
export function entenderFolha(texto) {
  const original = semAcento(texto).replace(/[ \t]+/g, ' ');
  const T = original.toUpperCase();
  const pega = (re) => (T.match(re) || [])[1] || '';
  const r = {
    // No texto original o nome impresso vem em maiúsculas; o lixo lido em volta costuma vir misturado.
    nome: ((original.match(/NOME\s*[:;.]?\s*([A-Z]{2,}(?: [A-Z]{2,})*)/) || [])[1] || '').trim(),
    cidade: pega(/CIDADE\s*[:;.]?\s*([A-Z]+(?: [A-Z]+){0,3}?)(?=\s+(?:DATA|SEMANA|\||$)|\n)/).trim(),
    data: '', semana: pega(/SEMANA\s*[:;.]?\s*(\d{1,2})\b/),
    foiCobrar: 0, qtNotas: pega(/NOTAS\s*[:;.]\s*(\d{1,3})\b/), vPep5: 0,
  };
  const mData = T.match(/DATA\s*[:;.]?\s*(\d{2})\/(\d{2})\/(\d{4})/);
  if (mData) r.data = `${mData[3]}-${mData[2]}-${mData[1]}`;
  // Valores impressos: aceita também quando o leitor perde a vírgula e o ponto ("2031800" = 20.318,00).
  const valorImpresso = (re) => {
    const m = T.match(re);
    if (!m) return 0;
    const t = m[1];
    const v = /,\d{2}$/.test(t) ? valorBR(t) : t.replace(/\D/g, '').length >= 3 ? Number(t.replace(/\D/g, '')) / 100 : 0;
    return Number.isFinite(v) ? v : 0;
  };
  r.foiCobrar = valorImpresso(/COBRAR[^\d\n]*?(\d[\d.,]{2,}\d)/);
  r.vPep5 = valorImpresso(/PEP\.?\s*5\s*%[^\d\n]*?(\d[\d.,]{2,}\d)/);
  // O V. pep. 5% é exatamente 5% do foi cobrar: se um dos dois saiu errado, o outro conserta.
  if (r.vPep5 && Math.abs(r.foiCobrar * 0.05 - r.vPep5) > 0.01) r.foiCobrar = Math.round(r.vPep5 * 20 * 100) / 100;
  r.achados = ['semana', 'cidade', 'data', 'foiCobrar', 'qtNotas'].filter((k) => r[k]).length;
  return r;
}

/* ---------- pepino extra ---------- */
// Também é nota impressa, fotografada em 2 partes: o TOPO (número, cliente, cidade) e o FINAL (PAGAMENTOS, cada um
// com data e valor). A cliente pode pagar uma parte no sábado e o resto na terça seguinte, por isso o app guarda
// cada pagamento com a data e só lança o que caiu na semana do caixa.
// Dígitos que a impressora/leitor confundem com o zero cortado (Ø): 0, 6, 8 e 9.
const variantes = (dd) => {
  const out = new Set([dd]);
  const pos = [...dd].map((c, i) => (/[0689]/.test(c) ? i : -1)).filter((i) => i >= 0);
  for (let mask = 1; mask < 1 << pos.length; mask++) {
    let v = [...dd];
    pos.forEach((p, b) => { if (mask & (1 << b)) v[p] = '0'; });
    out.add(v.join(''));
  }
  return [...out];
};
const dataValida = (a, m, d) => { const x = new Date(a, m - 1, d); return x.getMonth() === m - 1 && x.getDate() === d; };
const diasEntre = (a, b) => Math.round((new Date(a + 'T12:00') - new Date(b + 'T12:00')) / 86400000);

// Escolhe a data certa entre a lida e as versões com "zero cortado" corrigido: a que cai na semana do caixa
// (ou a mais perto dela). Ex.: "88/10/26" → 08/10/2026.
function corrigirData(dd, mm, ano, semana) {
  const iso = (d, m) => `${ano}-${m}-${d}`;
  const cands = [];
  for (const d of variantes(dd)) for (const m of variantes(mm)) {
    if (dataValida(ano, Number(m), Number(d))) cands.push(iso(d, m));
  }
  if (!cands.length) return null;
  if (!semana) return cands[0];
  const dist = (x) => (x < semana.ini ? diasEntre(semana.ini, x) : x > semana.fim ? diasEntre(x, semana.fim) : 0);
  const original = iso(dd, mm);
  const ord = cands.sort((a, b) => dist(a) - dist(b) || (a === original ? -1 : b === original ? 1 : 0));
  return ord[0];
}

export function entenderPepino(texto, semana) {
  const nota = entenderNota(texto);
  const LIN = texto.split('\n').map((l) => semAcento(l).toUpperCase().trim()).filter(Boolean);
  const tudo = LIN.join('\n');
  const r = {
    numero: nota.numero, cliente: nota.cliente, cidade: nota.cidade,
    recebi: nota.valor, pagamentos: [],
    topo: /REPRESENTANTE|DATA DO ACERTO|C[PF]F\s*[:;.]|BAIRRO|CIDADE\s*[:;]/.test(tudo),
    // ("Ao efetuar pagamento", no singular, está no topo de toda nota: não conta.)
    fim: /PAGAMENT[O0]S|RECEB[I1L]\s*[O0]\s*VAL|QUITAD/.test(tudo),
  };
  // Linhas de pagamento: "08/10/26 616,00" ou "09/10/2026 R$100,00" (entre "PAGAMENTOS" e "Total de pagamentos").
  const iIni = LIN.findIndex((l) => /^.{0,3}PAGAMENT[O0]S\b/.test(l) && !/T[O0]TAL/.test(l));
  const iFim = LIN.findIndex((l, i) => i > iIni && /T[O0]TAL DE PAGAMENT|RECEB[I1L]/.test(l));
  const faixa = LIN.slice(iIni >= 0 ? iIni : 0, iFim > iIni ? iFim : LIN.length);
  for (const l of faixa) {
    const m = l.match(/(\d{2})\s*[\/.-]\s*(\d{2})\s*[\/.-]\s*(\d{2,4})\s+(?:R\s*[$5S]\s*)?(\d{1,3}(?:[.\s]\d{3})+|\d+)\s*[,.]\s*([0-9A-Z]{0,2})/);
    if (!m) continue;
    let ano = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
    if (Math.abs(ano - new Date().getFullYear()) > 1) ano = new Date().getFullYear(); // "2028" no lugar de "2026"
    const data = corrigirData(m[1], m[2], ano, semana);
    if (!data) continue;
    let v = Number(m[4].replace(/\D/g, '')) + Number((m[5] + '00').slice(0, 2).replace(/[^0-9]/g, '0')) / 100;
    const cent = Math.round((v % 1) * 100);
    if (cent && /^[0689]{2}$/.test(String(cent).padStart(2, '0'))) v = Math.trunc(v); // zero cortado da impressora
    const lida = `${m[1]}/${m[2]}`;
    if (v > 0) r.pagamentos.push({ data, valor: v, ...(lida !== `${data.slice(8, 10)}/${data.slice(5, 7)}` ? { lida } : {}) });
  }
  return r;
}

// Semana do caixa: de segunda a domingo, contando da data da folha (a folha é datada na segunda-feira).
export function semanaDe(dataISO) {
  const d = dataISO ? new Date(dataISO + 'T12:00') : new Date();
  const seg = new Date(d);
  seg.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  const dom = new Date(seg);
  dom.setDate(seg.getDate() + 6);
  const iso = (x) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
  return { ini: iso(seg), fim: iso(dom) };
}

/* ---------- o que o app chama ---------- */
export async function lerPepinoGratis(file, aoProgredir, semana) {
  return entenderPepino(await lerTexto(file, 0, aoProgredir), semana);
}

export async function lerNotaGratis(file, aoProgredir) {
  return entenderNota(await lerTexto(file, 0, aoProgredir));
}

// Palavras impressas na própria folha que o leitor às vezes pega no lugar do valor.
const ROTULOS = /^(VALOR|CIDADE|NOME|DATA|SEMANA|VENDEDORA|CAIXA|NOTAS?|R\$?)\b/;
const VALIDO = {
  nome: (v) => v.length >= 3 && !ROTULOS.test(v),
  cidade: (v) => v.length >= 3 && !ROTULOS.test(v),
  data: (v) => !!v,
  semana: (v) => /^[1-5]$/.test(v),
  qtNotas: (v) => Number(v) > 0 && Number(v) <= 300,
};

// A folha costuma ser fotografada de lado e cada foto "funciona" num giro/tamanho diferente:
// tenta em pé e nos outros giros, em dois tamanhos, e junta campo por campo o que cada tentativa leu certo.
export async function lerFolhaGratis(file, aoProgredir) {
  const junto = { nome: '', cidade: '', data: '', semana: '', foiCobrar: 0, qtNotas: '', vPep5: 0 };
  let melhorLeitura = null, melhorAchados = -1;
  const giros = [0, 270, 90, 180];
  const tentativas = [1800, 2600].flatMap((lado) => giros.map((giro) => ({ lado, giro })));
  const completo = () => junto.nome && junto.data && junto.semana && junto.foiCobrar && junto.qtNotas;
  for (let i = 0; i < tentativas.length && !completo(); i++) {
    const { lado, giro } = tentativas[i];
    const passo = (m) => aoProgredir && aoProgredir({ ...m, tentativa: i + 1, total: tentativas.length });
    const r = entenderFolha(await lerTexto(file, giro, passo, lado));
    Object.keys(VALIDO).forEach((k) => { if (!junto[k] && r[k] && VALIDO[k](r[k])) junto[k] = r[k]; });
    // Foi cobrar: vale o que bate com o V. pep. 5% (entenderFolha já conserta pelo 5% quando dá).
    if (r.foiCobrar > 0 && (!junto.foiCobrar || (r.vPep5 && !junto.vPep5))) { junto.foiCobrar = r.foiCobrar; junto.vPep5 = r.vPep5; }
    if (r.achados > melhorAchados) { melhorAchados = r.achados; melhorLeitura = ultima; }
  }
  ultima = melhorLeitura;
  junto.achados = ['semana', 'cidade', 'data', 'foiCobrar', 'qtNotas', 'nome'].filter((k) => junto[k]).length;
  return junto;
}
// Para testes: o texto cru que o leitor tirou da foto.
export const textoDaFoto = (file, giro = 0) => lerTexto(file, giro, null);
