/* Lê o texto do relatório diário do vendedor (do jeito que vem no WhatsApp) e monta o consolidado da equipe.
   Sem dependências: roda no navegador (window.Relat) e no Node (require) para os testes. */
(function (raiz) {
  'use strict';

  // Campos de dinheiro: só valor. Campos de contagem: só quantidade.
  // Campos "q+v": a quantidade vem na linha do campo e o valor na linha "Valor:" logo abaixo.
  const DINHEIRO = ['cobrar', 'recebidoDia', 'recebidoTotal', 'depositoDia', 'transferencia', 'depositoTotal', 'emMaos'];
  const CONTAGEM = ['notas', 'pgDia', 'p25', 'p40', 'pgTotal', 'ab', 'rp', 'km'];
  const QV = ['antecipada', 'avista', 'parcialDia', 'parcialTotal', 'branco', 'feitaDia', 'feitaTotal',
    'extraDia', 'extraTotal', 'devolucao'];
  const TEXTO = ['nome', 'placa', 'modelo', 'locadora', 'supervisor', 'cidade'];

  // A ordem importa: as regras mais específicas vêm antes ("notas em branco" antes de "notas").
  const REGRAS = [
    [/^nome/, 'nome'], [/^placa/, 'placa'], [/^modelo/, 'modelo'], [/^locadora/, 'locadora'],
    [/^km\b/, 'km'], [/^superv/, 'supervisor'], [/^semana/, 'semana'], [/^cidade/, 'cidade'], [/^data/, 'data'],
    [/cobrar/, 'cobrar'],
    [/pepino|pipino/, null], // "Vlr Max pepino 5%": é calculado, não precisa ler
    [/^25/, 'p25'], [/^(40|50)/, 'p40'],
    [/(pg|pag).*dia/, 'pgDia'], [/(pg|pag).*total/, 'pgTotal'],
    [/antecip/, 'antecipada'], [/vista/, 'avista'],
    [/receb.*dia/, 'recebidoDia'], [/receb.*total/, 'recebidoTotal'],
    [/parcia.*dia/, 'parcialDia'], [/parcia.*total/, 'parcialTotal'],
    [/branc/, 'branco'],
    [/feita.*dia/, 'feitaDia'], [/feita.*total/, 'feitaTotal'],
    [/extra.*dia|resolvido.*dia/, 'extraDia'], [/total.*resolvido|resolvido.*total|extra.*total/, 'extraTotal'],
    [/devol/, 'devolucao'],
    [/transf/, 'transferencia'], [/deposito.*dia|dep.*dia/, 'depositoDia'], [/deposito.*total|dep.*total/, 'depositoTotal'],
    [/maos/, 'emMaos'],
    [/^ab$/, 'ab'], [/^rp$/, 'rp'],
    [/^(notas|nts|nt|qt.*notas|n.*notas)$/, 'notas'],
  ];

  const semAcento = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '');
  const chave = (s) => semAcento(s).toLowerCase().replace(/[^a-z0-9%]+/g, ' ').trim();
  const limpa = (s) => String(s).replace(/[*_~]/g, '').replace(/ /g, ' ');

  // "1.015,90" → 1015.9 · "00" → 0 · "R$ 9.001,75" → 9001.75 · "210.75" → 210.75
  function numero(txt) {
    if (txt == null) return null;
    let s = String(txt).replace(/r\$/i, '').replace(/\s/g, '');
    const m = s.match(/-?[\d.,]+/);
    if (!m) return null;
    s = m[0];
    if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
    else if (/\.\d{3}(\.|$)/.test(s)) s = s.replace(/\./g, ''); // "65.380" é milhar
    const n = parseFloat(s);
    return isNaN(n) ? null : n;
  }

  // "16/10/2026" ou "16/10/26" → "2026-10-16"
  function dataISO(txt) {
    const m = String(txt || '').match(/(\d{1,2})\s*[/.-]\s*(\d{1,2})(?:\s*[/.-]\s*(\d{2,4}))?/);
    if (!m) return null;
    let ano = m[3] ? parseInt(m[3], 10) : new Date().getFullYear();
    if (ano < 100) ano += 2000;
    const d = String(parseInt(m[1], 10)).padStart(2, '0');
    const me = String(parseInt(m[2], 10)).padStart(2, '0');
    return `${ano}-${me}-${d}`;
  }

  function vazio() {
    const r = { semana: null, data: null };
    TEXTO.forEach((k) => (r[k] = ''));
    DINHEIRO.concat(CONTAGEM).forEach((k) => (r[k] = null));
    QV.forEach((k) => (r[k] = { q: null, v: null }));
    r.lidos = [];
    return r;
  }

  function atribui(r, campo, valor) {
    if (!campo) return;
    if (campo === 'data') r.data = dataISO(valor);
    else if (campo === 'semana') r.semana = numero(valor);
    else if (TEXTO.includes(campo)) r[campo] = valor.trim();
    else if (QV.includes(campo)) r[campo].q = numero(valor);
    else r[campo] = numero(valor);
    r.lidos.push(campo);
  }

  // Lê um relatório. Linhas "Valor:" sem nome de campo ficam com o campo anterior.
  function lerRelatorio(texto) {
    const r = vazio();
    let ultimo = null;
    limpa(texto).split(/\r?\n/).forEach((linha) => {
      linha = linha.trim();
      if (!linha) return;
      // "Ab: 01 Rp: 01" (duas coisas na mesma linha)
      const abrp = linha.match(/^ab\s*:?\s*(\d+)\s*[,;/-]?\s*rp\s*:?\s*(\d+)/i);
      if (abrp) { atribui(r, 'ab', abrp[1]); atribui(r, 'rp', abrp[2]); return; }
      const i = linha.indexOf(':');
      if (i < 0) return;
      const k = chave(linha.slice(0, i));
      const v = linha.slice(i + 1).trim();
      if (/^(valor|vlr|vl)$/.test(k)) {
        if (ultimo && QV.includes(ultimo)) { r[ultimo].v = numero(v); r.lidos.push(ultimo + '.v'); }
        return;
      }
      const regra = REGRAS.find(([re]) => re.test(k));
      if (!regra) return;
      atribui(r, regra[1], v);
      if (regra[1]) ultimo = regra[1];
    });
    return r;
  }

  // Vários relatórios colados juntos: cada "Nome:" começa um novo.
  function separar(texto) {
    const linhas = limpa(texto).split(/\r?\n/);
    const partes = [];
    let atual = [];
    let temNome = false;
    linhas.forEach((l) => {
      if (/^\s*nome\s*:/i.test(l)) {
        if (temNome) { partes.push(atual.join('\n')); atual = []; }
        temNome = true;
      }
      atual.push(l);
    });
    if (atual.join('').trim()) partes.push(atual.join('\n'));
    return partes.filter((p) => /:/.test(p));
  }

  const v = (x) => (typeof x === 'number' && !isNaN(x) ? x : 0);
  const centavos = (a, b) => Math.abs(v(a) - v(b)) < 0.005;
  const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const brl = (n) => v(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const dois = (n) => String(Math.round(v(n))).padStart(2, '0');

  /* Conferência de um relatório: as contas de dentro dele e, se houver, contra o relatório anterior
     do mesmo vendedor na mesma semana (total de hoje = total de ontem + o do dia). */
  function conferir(r, anterior) {
    const av = [];
    const falta = [];
    if (!r.nome) falta.push('nome');
    if (r.cobrar == null) falta.push('valor a cobrar');
    if (r.recebidoTotal == null) falta.push('recebido total');
    if (r.feitaTotal.v == null) falta.push('valor das notas feitas total');
    if (falta.length) av.push(`Não achei: ${falta.join(', ')}.`);

    if (r.pgDia != null && (r.p25 != null || r.p40 != null) && v(r.p25) + v(r.p40) !== v(r.pgDia))
      av.push(`Notas pagas do dia (${v(r.pgDia)}) ≠ 25% (${v(r.p25)}) + 40% (${v(r.p40)}).`);
    if (r.feitaDia.q != null && (r.ab != null || r.rp != null) && v(r.ab) + v(r.rp) !== v(r.feitaDia.q))
      av.push(`Notas feitas do dia (${v(r.feitaDia.q)}) ≠ Ab (${v(r.ab)}) + Rp (${v(r.rp)}).`);
    if (r.notas != null && r.pgTotal != null && r.branco.q != null) {
      const soma = v(r.pgTotal) + v(r.parcialTotal.q) + v(r.branco.q);
      if (soma !== v(r.notas))
        av.push(`Notas não fecham: pagas (${v(r.pgTotal)}) + parciais (${v(r.parcialTotal.q)}) + em branco (${v(r.branco.q)}) = ${soma}, mas são ${v(r.notas)} notas.`);
    }
    [['recebidoDia', 'recebidoTotal', 'Recebido'], ['pgDia', 'pgTotal', 'Notas pagas']].forEach(([d, t, nome]) => {
      if (r[d] != null && r[t] != null && v(r[d]) > v(r[t]) + 0.005) av.push(`${nome} do dia é maior que o total.`);
    });

    if (anterior) {
      const dt = anterior.data ? anterior.data.split('-').reverse().slice(0, 2).join('/') : 'anterior';
      const cadeia = (nome, totalHoje, totalAntes, doDia, din) => {
        if (totalHoje == null || totalAntes == null || doDia == null) return;
        const esperado = v(totalAntes) + v(doDia);
        if (din ? !centavos(totalHoje, esperado) : v(totalHoje) !== esperado)
          av.push(`${nome}: total ${din ? brl(totalHoje) : totalHoje}, mas ${dt} era ${din ? brl(totalAntes) : totalAntes} + ${din ? brl(doDia) : doDia} do dia = ${din ? brl(esperado) : esperado}.`);
      };
      cadeia('Recebido', r.recebidoTotal, anterior.recebidoTotal, r.recebidoDia, true);
      cadeia('Notas pagas', r.pgTotal, anterior.pgTotal, r.pgDia, false);
      cadeia('Notas feitas', r.feitaTotal.q, anterior.feitaTotal.q, r.feitaDia.q, false);
      cadeia('Valor das notas feitas', r.feitaTotal.v, anterior.feitaTotal.v, r.feitaDia.v, true);
      cadeia('Pepino extra resolvido', r.extraTotal.v, anterior.extraTotal.v, r.extraDia.v, true);
      if (r.cobrar != null && anterior.cobrar != null && !centavos(r.cobrar, anterior.cobrar))
        av.push(`Valor a cobrar mudou na semana: ${brl(anterior.cobrar)} (${dt}) → ${brl(r.cobrar)}.`);
      if (r.notas != null && anterior.notas != null && r.notas !== anterior.notas)
        av.push(`Quantidade de notas mudou na semana: ${anterior.notas} (${dt}) → ${r.notas}.`);
    }
    return av;
  }

  /* Soma os relatórios da equipe. Repasse = notas parciais ("Nt parcial total" e o valor). */
  function consolidar(lista) {
    const t = { carros: lista.length, cobrar: 0, recebido: 0, repasseQ: 0, repasseV: 0, brancoQ: 0, brancoV: 0,
      extra: 0, deixado: 0, feitas: 0, recebidoDia: 0, pgTotal: 0, notas: 0, emMaos: 0, depositoTotal: 0 };
    lista.forEach((r) => {
      t.cobrar += v(r.cobrar);
      t.recebido += v(r.recebidoTotal);
      t.repasseQ += v(r.parcialTotal.q);
      t.repasseV += v(r.parcialTotal.v);
      t.brancoQ += v(r.branco.q);
      t.brancoV += v(r.branco.v);
      t.extra += v(r.extraTotal.v);
      t.deixado += v(r.feitaTotal.v);
      t.feitas += v(r.feitaTotal.q);
      t.recebidoDia += v(r.recebidoDia);
      t.pgTotal += v(r.pgTotal);
      t.notas += v(r.notas);
      t.emMaos += v(r.emMaos);
      t.depositoTotal += v(r.depositoTotal);
    });
    Object.keys(t).forEach((k) => (t[k] = Math.round(t[k] * 100) / 100));
    return t;
  }

  // "1ª semana Outubro"
  function textoSemana(semana, iso) {
    const mes = iso ? MESES[parseInt(iso.slice(5, 7), 10) - 1] : '';
    return `${semana ? semana + 'ª ' : ''}semana ${mes}`.trim();
  }

  // O relatório da equipe, no mesmo modelo que vai para o grupo.
  function textoEquipe(t, o) {
    const [a, m, d] = (o.data || '').split('-');
    return [
      '*Relatório diário*',
      `*${d}/${m}/${(a || '').slice(2)}*`,
      `*${(o.produto || 'ENXOVAL').toUpperCase()} (${dois(t.carros)}) carros*`,
      `*( Equipe ${o.equipe || ''})*`,
      '',
      o.semanaTexto || '',
      '',
      `Vlr.  Cobrar : ${brl(t.cobrar)}`,
      '',
      `Recebido : ${brl(t.recebido)}`,
      '',
      `Repasse  : ${dois(t.repasseQ)}`,
      '',
      `Valor repasse : ${brl(t.repasseV)}`,
      '',
      `Nts branco  : ${dois(t.brancoQ)}`,
      '',
      `Pipino extra : ${brl(t.extra)}`,
      '',
      `Valor deixado : ${brl(t.deixado)}`,
    ].join('\n');
  }

  /* Lê um relatório da equipe já pronto (para conferir com o que o app somou). */
  function lerEquipe(texto) {
    const r = {};
    limpa(texto).split(/\r?\n/).forEach((linha) => {
      const i = linha.indexOf(':');
      const carros = linha.match(/\((\d+)\)\s*carros/i);
      if (carros) r.carros = parseInt(carros[1], 10);
      if (i < 0) return;
      const k = chave(linha.slice(0, i));
      const n = numero(linha.slice(i + 1));
      if (/cobrar/.test(k)) r.cobrar = n;
      else if (/^receb/.test(k)) r.recebido = n;
      else if (/valor.*repasse/.test(k)) r.repasseV = n;
      else if (/repasse/.test(k)) r.repasseQ = n;
      else if (/branc/.test(k)) r.brancoQ = n;
      else if (/pepino|pipino|extra/.test(k)) r.extra = n;
      else if (/deixado/.test(k)) r.deixado = n;
    });
    return r;
  }

  const api = { lerRelatorio, separar, conferir, consolidar, textoEquipe, textoSemana, lerEquipe, numero, dataISO, brl, dois, MESES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else raiz.Relat = api;
})(typeof window !== 'undefined' ? window : globalThis);
