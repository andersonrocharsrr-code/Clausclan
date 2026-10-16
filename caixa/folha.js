/* Desenha a folha "CAIXA" do jeito da folha impressa da empresa, já preenchida com os dados da semana.
   O que vem impresso na folha (cidade, data, semana, foi cobrar, qt. de notas, V. pep. 5%) sai em preto;
   o que o vendedor preenche sai em azul, com letra de mão (fonte Caveat, fonts/caveat-600.woff2). */

const W = 1240, H = 1754;            // folha A4 em pé (150 dpi)
const X0 = 40, X1 = W - 40, LARG = X1 - X0;
const AZUL = '#1f3a9e';
const ROTULO = '600 19px Arial, Helvetica, sans-serif';
const IMPRESSO = '700 21px Arial, Helvetica, sans-serif';
const MAO = 'Caveat, "Segoe Print", cursive';

let fonteMao = null;
function carregarFonte() {
  if (!fonteMao) {
    const f = new FontFace('Caveat', 'url(fonts/caveat-600.woff2)', { weight: '600' });
    fonteMao = f.load().then((ok) => { document.fonts.add(ok); }).catch(() => {});
  }
  return fonteMao;
}

const x = (frac) => X0 + LARG * frac;

/* dados: {
     nome, cidade, data, semana, foiCobrar, qtNotas, vPep5,         ← impressos
     antecipados, qtNotasDeixadas, pinos, valorPepinos, pepinoParcial,
     notas25, notas4050, pepinoExtra, recebimento, depEspecie, depPix, depBanco,
     vale, ajuda, mecanica, despSupervisor, excedido, valorDeixado, assinatura,  ← textos já formatados ('' = vazio)
     outros: [texto], obs: [texto], extras: [{numero, cidade, valor, vendedora}] } */
export async function desenharCaixa(d) {
  await carregarFonte();
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  g.fillStyle = '#fff';
  g.fillRect(0, 0, W, H);
  g.strokeStyle = '#111';
  g.lineWidth = 2;
  g.textBaseline = 'middle';

  const caixa = (x1, y1, x2, y2) => g.strokeRect(x1, y1, x2 - x1, y2 - y1);
  const linhaV = (xx, y1, y2) => { g.beginPath(); g.moveTo(xx, y1); g.lineTo(xx, y2); g.stroke(); };
  // Texto que diminui até caber na largura disponível.
  const texto = (t, xx, y, larg, { fonte = ROTULO, cor = '#111', centro = false, px } = {}) => {
    t = String(t ?? '');
    if (!t) return xx;
    let tam = px || 0;
    const montar = () => (tam ? `600 ${tam}px ${MAO}` : fonte);
    g.font = montar();
    while (tam > 16 && g.measureText(t).width > larg) { tam -= 1; g.font = montar(); }
    if (!tam && g.measureText(t).width > larg) {
      const base = parseInt(fonte.match(/(\d+)px/)[1], 10);
      for (let p = base - 1; p >= 12 && g.measureText(t).width > larg; p--) g.font = fonte.replace(/\d+px/, p + 'px');
    }
    g.fillStyle = cor;
    const w = Math.min(g.measureText(t).width, larg);
    const xi = centro ? xx + (larg - w) / 2 : xx;
    g.fillText(t, xi, y, larg);
    return xi + w;
  };
  // Rótulo impresso seguido do valor escrito à mão.
  const campo = (rotulo, valor, x1, x2, yMeio, { impresso = false } = {}) => {
    // O rótulo usa no máximo 70% da célula, para sempre sobrar lugar para o valor.
    const fim = texto(rotulo, x1 + 10, yMeio, (x2 - x1 - 20) * 0.7);
    if (impresso) texto(valor, fim + 6, yMeio, x2 - fim - 16, { fonte: IMPRESSO });
    else texto(valor, fim + 8, yMeio + 2, x2 - fim - 18, { cor: AZUL, px: 34 });
  };
  const mao = (valor, x1, x2, yMeio, centro = false) => texto(valor, x1 + 8, yMeio + 2, x2 - x1 - 16, { cor: AZUL, px: 34, centro });

  /* ---- título ---- */
  let y = 36;
  const hTit = 70;
  caixa(X0, y, X1, y + hTit);
  g.font = '700 38px Arial, Helvetica, sans-serif';
  g.fillStyle = '#111';
  const tw = g.measureText('CAIXA').width;
  g.fillText('CAIXA', x(0.25) - tw / 2, y + hTit / 2);
  g.fillRect(x(0.25) - tw / 2, y + hTit / 2 + 20, tw, 3);
  texto('NOME:' + (d.nome || ''), x(0.5), y + hTit / 2, LARG / 2, { fonte: '700 38px Arial, Helvetica, sans-serif', centro: true });
  y += hTit;

  /* ---- cabeçalho ---- */
  const hCab = 58;
  // Linha 1
  caixa(X0, y, X1, y + hCab);
  [0.25, 0.47, 0.58, 0.7, 0.74, 0.84].forEach((f) => linhaV(x(f), y, y + hCab));
  let ym = y + hCab / 2;
  campo('CIDADE:', d.cidade, x(0), x(0.25), ym, { impresso: true });
  campo('DATA:', d.data, x(0.25), x(0.47), ym, { impresso: true });
  campo('SEMANA:', d.semana, x(0.47), x(0.58), ym, { impresso: true });
  texto('FOI COBRAR:', x(0.58) + 10, ym, x(0.7) - x(0.58) - 20);
  texto('R$', x(0.7) + 8, ym, x(0.74) - x(0.7) - 12, { fonte: IMPRESSO });
  texto(d.foiCobrar, x(0.74) + 8, ym, x(0.84) - x(0.74) - 14, { fonte: IMPRESSO });
  campo('QT. DE NOTAS:', d.qtNotas, x(0.84), x(1), ym, { impresso: true });
  y += hCab;
  // Linha 2
  caixa(X0, y, X1, y + hCab);
  [0.25, 0.38, 0.42, 0.5, 0.75].forEach((f) => linhaV(x(f), y, y + hCab));
  ym = y + hCab / 2;
  campo('ANTECIPADOS:R$', d.antecipados, x(0), x(0.25), ym);
  texto('V. PEP. 5%:', x(0.25) + 10, ym, x(0.38) - x(0.25) - 20);
  texto('R$', x(0.38) + 8, ym, x(0.42) - x(0.38) - 12, { fonte: IMPRESSO });
  texto(d.vPep5, x(0.42) + 6, ym, x(0.5) - x(0.42) - 10, { fonte: IMPRESSO });
  campo('QT.NOTAS DEIXADAS:', d.qtNotasDeixadas, x(0.5), x(0.75), ym);
  campo('Nº DE PINOS:', d.pinos, x(0.75), x(1), ym);
  y += hCab;
  // Linha 3
  caixa(X0, y, X1, y + hCab);
  linhaV(x(0.5), y, y + hCab);
  ym = y + hCab / 2;
  campo('VALOR DOS PEPINOS:R$', d.valorPepinos, x(0), x(0.5), ym);
  campo('PEPINO PARCIAL:R$', d.pepinoParcial, x(0.5), x(1), ym);
  y += hCab;
  // Linha 4: notas e pepino extra (rótulo em cima, valor embaixo)
  const hNotas = 76;
  caixa(X0, y, X1, y + hNotas);
  [0.25, 0.5].forEach((f) => linhaV(x(f), y, y + hNotas));
  texto('NOTAS 25%:', x(0) + 10, y + 18, x(0.25) - x(0) - 20);
  texto('R$', x(0) + 10, y + 52, 40);
  mao(d.notas25, x(0) + 40, x(0.25), y + 50);
  texto('NOTAS 40% e 50%', x(0.25) + 10, y + 18, x(0.5) - x(0.25) - 20);
  texto(':R$', x(0.25) + 10, y + 52, 40);
  mao(d.notas4050, x(0.25) + 44, x(0.5), y + 50);
  const fimPep = texto('PEPINO EXTRA R$', x(0.5) + 150, y + hNotas / 2, 220);
  mao(d.pepinoExtra, fimPep + 4, x(1) - 40, y + hNotas / 2);
  y += hNotas;

  /* ---- corpo: rótulos à esquerda, blocos de pepino extra à direita ---- */
  const ROTULOS = [
    ['RECEBIMENTO:R$', d.recebimento, true], ['DEPTO. EMPRESA ESPECIE:R$', d.depEspecie], ['DEPTO PIX:R$', d.depPix],
    ['DEPTO BANCO/TED/TRANS.:R$', d.depBanco], ['VALE ADIANTADO:R$', d.vale], ['AJUDA DE CUSTO:R$', d.ajuda],
    ['MECANICA:R$', d.mecanica], ['DESPESAS SUPERVISOR:R$', d.despSupervisor], ['EXCEDIDO DA DESPESA:R$', d.excedido],
    ['OUTROS:R$', ''], ['', ''], ['', ''], ['OBS:R$', ''], ['', ''], ['', ''], ['', ''],
    ['VALOR DEIXADO:R$', d.valorDeixado, false, true],
  ];
  const yCorpo = y;
  // As linhas do corpo crescem para a folha ocupar a página inteira, como a impressa.
  const hLin = Math.floor((H - 36 - yCorpo - 6 - (d.extras.length > 10 ? 50 : 0)) / (ROTULOS.length + 1));
  // Outros (3 linhas) e OBS (4 linhas): se tiver mais itens que linhas, junta na mesma linha.
  const distribuir = (itens, n) => {
    if (itens.length <= n) return Array.from({ length: n }, (_, i) => itens[i] || '');
    const por = Math.ceil(itens.length / n);
    return Array.from({ length: n }, (_, i) => itens.slice(i * por, i * por + por).join(' · '));
  };
  const outros = distribuir(d.outros, 3);
  const obs = distribuir(d.obs, 4);

  ROTULOS.forEach(([rot, val, negrito, grande], i) => {
    const yy = yCorpo + i * hLin;
    caixa(X0, yy, x(0.5), yy + hLin);
    const ym2 = yy + hLin / 2;
    const fonte = grande ? '600 26px Arial, Helvetica, sans-serif' : negrito ? '700 20px Arial, Helvetica, sans-serif' : ROTULO;
    const fim = texto(rot, X0 + 10, ym2, x(0.5) - X0 - 20, { fonte });
    if (val) mao(val, fim, x(0.5), ym2);
    if (i >= 9 && i <= 11) mao(outros[i - 9], i === 9 ? fim : X0 + 40, x(0.5), ym2);
    if (i >= 12 && i <= 15) mao(obs[i - 12], i === 12 ? fim : X0 + 40, x(0.5), ym2);
  });

  // Blocos de pepino extra: Nº | CIDADE | VALOR, a linha com os dados e VENDEDORA:, em duas colunas.
  // Cada coluna tem 5 blocos completos (o 6º fica sem a linha VENDEDORA, então não é usado).
  const BLOCOS = 5;
  const colunas = [[0.5, 0.75], [0.75, 1]];
  const sub = [0.3, 0.62]; // divisões Nº | CIDADE | VALOR dentro da coluna
  colunas.forEach(([a, b]) => {
    const xa = x(a), xb = x(b), lc = xb - xa;
    const xs = sub.map((f) => xa + lc * f);
    for (let i = 0; i < ROTULOS.length; i++) {
      const yy = yCorpo + i * hLin, ym3 = yy + hLin / 2;
      caixa(xa, yy, xb, yy + hLin);
      const tipo = i % 3;
      const bloco = Math.floor(i / 3);
      const item = bloco < BLOCOS ? d.extras[bloco + (a === 0.5 ? 0 : BLOCOS)] : null;
      if (tipo === 0) {
        xs.forEach((xx) => linhaV(xx, yy, yy + hLin));
        texto('Nº', xa, ym3, xs[0] - xa, { centro: true });
        texto('CIDADE', xs[0], ym3, xs[1] - xs[0], { centro: true });
        texto('VALOR', xs[1], ym3, xb - xs[1], { centro: true });
      } else if (tipo === 1) {
        xs.forEach((xx) => linhaV(xx, yy, yy + hLin));
        if (item) {
          texto(item.numero, xa + 4, ym3 + 2, xs[0] - xa - 8, { cor: AZUL, px: 28, centro: true });
          texto(item.cidade, xs[0] + 4, ym3 + 2, xs[1] - xs[0] - 8, { cor: AZUL, px: 30, centro: true });
          texto(item.valor, xs[1] + 4, ym3 + 2, xb - xs[1] - 8, { cor: AZUL, px: 30, centro: true });
        }
      } else {
        const fim = texto('VENDEDORA:', xa + 8, ym3, lc - 16);
        if (item) texto(item.vendedora, fim + 6, ym3 + 2, xb - fim - 14, { cor: AZUL, px: 30 });
      }
    }
  });
  y = yCorpo + ROTULOS.length * hLin;

  // Pepinos extras que não couberam nos blocos vão numa linha embaixo.
  const sobra = d.extras.slice(BLOCOS * 2);

  /* ---- assinatura ---- */
  caixa(X0, y, X1, y + hLin + 6);
  const fimAss = texto('ASSINATURA VENDEDOR:', X0 + 10, y + (hLin + 6) / 2, 400, { fonte: '600 26px Arial, Helvetica, sans-serif' });
  texto(d.assinatura, fimAss + 12, y + (hLin + 6) / 2 + 2, X1 - fimAss - 30, { cor: AZUL, px: 40 });
  y += hLin + 6;
  if (sobra.length) {
    texto('Pepino extra (continuação): ' + sobra.map((s) => `${s.numero} ${s.cidade} ${s.valor} ${s.vendedora}`.trim()).join(' · '),
      X0, y + 28, LARG, { cor: AZUL, px: 28 });
  }

  return new Promise((ok) => cv.toBlob(ok, 'image/png'));
}
