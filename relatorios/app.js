/* Relatórios da Equipe: guarda os relatórios diários dos vendedores e monta o relatório da equipe. */
(function () {
  'use strict';
  const R = window.Relat;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const CHAVE = 'relatorios-equipe-v1';
  const v = (x) => (typeof x === 'number' && !isNaN(x) ? x : 0);
  const brl = R.brl;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  const hojeISO = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
  const dataCurta = (iso) => (iso ? iso.split('-').reverse().slice(0, 2).join('/') : '—');
  const somaDias = (iso, n) => { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  const difDias = (a, b) => Math.round((new Date(a + 'T12:00:00') - new Date(b + 'T12:00:00')) / 864e5);
  // No APK (Capacitor) usa os recursos do Android: compartilhar, salvar arquivo e botão voltar.
  const Cap = window.Capacitor;
  const NATIVE = !!(Cap && Cap.isNativePlatform && Cap.isNativePlatform());
  const plugin = (n) => (NATIVE ? (Cap.Plugins && Cap.Plugins[n]) || (Cap.registerPlugin && Cap.registerPlugin(n)) || null : null);
  const SHARE = plugin('Share');
  const FS = plugin('Filesystem');
  const diaSemana = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' });

  // ---------- Dados ----------
  const CFG_PADRAO = () => ({ equipe: '', produto: 'ENXOVAL', vendedores: [], semanas: {}, semanasCaixa: {}, usarUltimo: false });
  // reports: relatórios diários; caixas: folhas CAIXA (fechamento da semana) de cada vendedor.
  const montarDb = (d) => ({ reports: d.reports || [], caixas: d.caixas || [], cfg: Object.assign(CFG_PADRAO(), d.cfg) });
  let db = montarDb({});
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE));
    if (salvo && Array.isArray(salvo.reports)) db = montarDb(salvo);
  } catch (e) { /* começa vazio */ }
  const salvar = () => { try { localStorage.setItem(CHAVE, JSON.stringify(db)); } catch (e) { toast('Não consegui salvar neste aparelho.'); } };

  // Junta o resultado do leitor com o texto original.
  function novoRelatorio(texto, dataPadrao) {
    const r = R.lerRelatorio(texto);
    delete r.lidos;
    if (!r.data) r.data = dataPadrao;
    r.raw = texto.trim();
    return r;
  }

  const mesmo = (a, b) => norm(a.nome) === norm(b.nome) && a.data === b.data;

  // Relatório anterior do mesmo vendedor, na mesma semana (até 6 dias antes).
  function anteriorDe(r) {
    return db.reports
      .filter((x) => norm(x.nome) === norm(r.nome) && x.data < r.data && difDias(r.data, x.data) <= 6 &&
        (r.semana == null || x.semana == null || x.semana === r.semana))
      .sort((a, b) => (a.data < b.data ? 1 : -1))[0] || null;
  }

  function lembrarVendedor(nome) {
    if (!nome) return;
    if (!db.cfg.vendedores.some((n) => norm(n) === norm(nome))) db.cfg.vendedores.push(nome.trim());
  }

  // ---------- Abas ----------
  function abrirAba(nome) {
    $$('.abas button').forEach((b) => b.classList.toggle('is-on', b.dataset.aba === nome));
    $$('.aba').forEach((s) => (s.hidden = s.id !== 'aba-' + nome));
    if (nome === 'equipe') desenharEquipe();
    if (nome === 'lista') desenharLista();
    if (nome === 'caixas') desenharCaixas();
    if (nome === 'ajustes') desenharAjustes();
    window.scrollTo(0, 0);
  }
  $$('.abas button').forEach((b) => b.addEventListener('click', () => abrirAba(b.dataset.aba)));

  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg; t.hidden = false;
    clearTimeout(toast.t); toast.t = setTimeout(() => (t.hidden = true), 2600);
  }

  // ---------- Colar ----------
  let lidos = [];
  $('#dataPadrao').value = hojeISO();

  $('#btnColarArea').addEventListener('click', async () => {
    try { $('#txtColar').value = await navigator.clipboard.readText(); lerColado(); }
    catch (e) { toast('Não deu para ler a área de transferência. Cole no campo.'); }
  });
  $('#btnLer').addEventListener('click', lerColado);

  function lerColado() {
    const texto = $('#txtColar').value;
    const partes = R.separar(texto);
    lidos = partes.map((p) => novoRelatorio(p, $('#dataPadrao').value || hojeISO()));
    desenharPrevia();
    if (!lidos.length) toast('Não achei nenhum relatório no texto.');
  }

  function desenharPrevia() {
    const el = $('#previa');
    if (!lidos.length) { el.innerHTML = ''; return; }
    el.innerHTML = lidos.map((r, i) => {
      const avisos = R.conferir(r, anteriorDe(r));
      const existe = db.reports.some((x) => mesmo(x, r));
      return `<div class="card">
        <div class="rel">
          <div><div class="rel__nome">${esc(r.nome || 'Sem nome')}${existe ? '<span class="tag tag--velho">substitui</span>' : ''}</div>
          <div class="rel__sub">${dataCurta(r.data)} · ${r.semana ? r.semana + 'ª semana' : 'semana ?'}${r.cidade ? ' · ' + esc(r.cidade) : ''}</div></div>
          <button type="button" class="link link--neg" data-tirar="${i}">Tirar</button>
        </div>
        ${resumoHTML(r)}
        ${avisosHTML(avisos)}
      </div>`;
    }).join('') + `<button type="button" class="btn" id="btnSalvarLidos">Salvar ${lidos.length} relatório${lidos.length > 1 ? 's' : ''}</button>`;
    $$('[data-tirar]', el).forEach((b) => b.addEventListener('click', () => { lidos.splice(+b.dataset.tirar, 1); desenharPrevia(); }));
    $('#btnSalvarLidos').addEventListener('click', salvarLidos);
  }

  function salvarLidos() {
    const semNome = lidos.filter((r) => !r.nome).length;
    if (semNome) { toast('Tem relatório sem nome. Corrija o texto ou tire.'); return; }
    lidos.forEach((r) => {
      const i = db.reports.findIndex((x) => mesmo(x, r));
      if (i >= 0) db.reports[i] = r; else db.reports.push(r);
      lembrarVendedor(r.nome);
      if (!db.cfg.equipe && r.supervisor) db.cfg.equipe = r.supervisor.toLowerCase();
    });
    topo();
    const dia = lidos[0].data;
    toast(`${lidos.length} relatório${lidos.length > 1 ? 's salvos' : ' salvo'}.`);
    lidos = []; $('#txtColar').value = ''; desenharPrevia(); salvar();
    $('#dataEquipe').value = dia;
    abrirAba('equipe');
  }

  function resumoHTML(r) {
    const linhas = [
      ['Valor a cobrar', brl(r.cobrar)], ['Notas', v(r.notas)],
      ['Recebido do dia', brl(r.recebidoDia)], ['Recebido total', brl(r.recebidoTotal)],
      ['Notas pagas (dia / total)', `${v(r.pgDia)} / ${v(r.pgTotal)}`],
      ['Repasse (parciais)', `${v(r.parcialTotal.q)} · ${brl(r.parcialTotal.v)}`],
      ['Notas em branco', `${v(r.branco.q)} · ${brl(r.branco.v)}`],
      ['Pepino extra resolvido', `${v(r.extraTotal.q)} · ${brl(r.extraTotal.v)}`],
      ['Notas feitas (valor deixado)', `${v(r.feitaTotal.q)} · ${brl(r.feitaTotal.v)}`],
      ['Depósito total', brl(r.depositoTotal)], ['Valor em mãos', brl(r.emMaos)],
    ];
    return `<div class="resumo">${linhas.map(([a, b]) => `<span>${a}</span><span>${b}</span>`).join('')}</div>`;
  }

  function avisosHTML(avisos) {
    if (!avisos.length) return '<div class="aviso aviso--ok">✓ As contas do relatório fecham.</div>';
    return `<div class="aviso"><b>Conferir:</b><ul>${avisos.map((a) => `<li>${esc(a)}</li>`).join('')}</ul></div>`;
  }

  // ---------- Equipe (consolidado) ----------
  function ultimaData() {
    return db.reports.reduce((m, r) => (r.data && r.data > m ? r.data : m), '') || hojeISO();
  }
  $('#dataEquipe').value = ultimaData();
  $('#dataEquipe').addEventListener('change', desenharEquipe);
  $('#diaAntes').addEventListener('click', () => { $('#dataEquipe').value = somaDias($('#dataEquipe').value || hojeISO(), -1); desenharEquipe(); });
  $('#diaDepois').addEventListener('click', () => { $('#dataEquipe').value = somaDias($('#dataEquipe').value || hojeISO(), 1); desenharEquipe(); });
  $('#usarUltimo').addEventListener('change', (e) => { db.cfg.usarUltimo = e.target.checked; salvar(); desenharEquipe(); });
  $('#semanaTexto').addEventListener('input', (e) => {
    const d = $('#dataEquipe').value;
    if (e.target.value.trim()) db.cfg.semanas[d] = e.target.value; else delete db.cfg.semanas[d];
    salvar(); desenharTexto();
  });

  const moda = (arr) => {
    const c = {}; let melhor = null;
    arr.forEach((x) => { if (x == null) return; c[x] = (c[x] || 0) + 1; if (melhor == null || c[x] > c[melhor]) melhor = x; });
    return melhor == null ? null : +melhor;
  };

  // Os relatórios que entram no consolidado do dia (e, se marcado, o último da semana de quem não mandou).
  function relatoriosDoDia(d) {
    const doDia = db.reports.filter((r) => r.data === d).sort((a, b) => norm(a.nome).localeCompare(norm(b.nome)));
    const semana = moda(doDia.map((r) => r.semana));
    const faltam = db.cfg.vendedores.filter((n) => !doDia.some((r) => norm(r.nome) === norm(n)));
    const emprestados = [];
    if (db.cfg.usarUltimo) {
      faltam.forEach((n) => {
        const ult = anteriorDe({ nome: n, data: d, semana });
        if (ult) emprestados.push(ult);
      });
    }
    return { doDia, semana, faltam, lista: doDia.concat(emprestados), emprestados };
  }

  let atual = null;

  function desenharEquipe() {
    const d = $('#dataEquipe').value || hojeISO();
    const dados = relatoriosDoDia(d);
    const t = R.consolidar(dados.lista);
    const semanaAuto = R.textoSemana(dados.semana, d);
    $('#semanaTexto').placeholder = semanaAuto;
    $('#semanaTexto').value = db.cfg.semanas[d] || '';
    $('#usarUltimo').checked = !!db.cfg.usarUltimo;
    atual = { d, dados, t, semanaAuto };

    // Quem não mandou
    const faltamReais = dados.faltam.filter((n) => !dados.emprestados.some((r) => norm(r.nome) === norm(n)));
    $('#cardFaltam').hidden = !dados.faltam.length;
    $('#faltam').innerHTML = dados.faltam.map((n) => {
      const emp = dados.emprestados.find((r) => norm(r.nome) === norm(n));
      return esc(n) + (emp ? ` <span class="tag tag--velho">usando ${dataCurta(emp.data)}</span>` : '');
    }).join(', ');

    // Totais
    const tiles = [
      ['Carros', R.dois(t.carros)], ['Vlr. cobrar', brl(t.cobrar)], ['Recebido', brl(t.recebido)],
      ['Repasse', `${R.dois(t.repasseQ)} · ${brl(t.repasseV)}`], ['Notas em branco', R.dois(t.brancoQ)],
      ['Pepino extra', brl(t.extra)], ['Valor deixado', brl(t.deixado)], ['Recebido hoje', brl(t.recebidoDia)],
    ];
    $('#tiles').innerHTML = tiles.map(([a, b]) => `<div class="tile"><small>${a}</small><b>${b}</b></div>`).join('');

    // Tabela por vendedor
    $('#qtVend').textContent = `(${dados.lista.length})`;
    const avisosPorId = new Map();
    dados.lista.forEach((r) => avisosPorId.set(r, R.conferir(r, anteriorDe(r))));
    if (!dados.lista.length) {
      $('#tabela').innerHTML = '<tbody><tr><td class="muted">Nenhum relatório neste dia. Cole na aba Colar.</td></tr></tbody>';
    } else {
      $('#tabela').innerHTML = `<thead><tr><th>Vendedor</th><th>Cobrar</th><th>Recebido</th><th>Repasse</th><th>Branco</th><th>Pep. extra</th><th>Deixado</th></tr></thead>
        <tbody>${dados.lista.map((r, i) => {
          const n = avisosPorId.get(r).length;
          const tag = r.data !== d ? `<span class="tag tag--velho">${dataCurta(r.data)}</span>` : n ? `<span class="tag tag--warn">⚠ ${n}</span>` : '<span class="tag tag--ok">✓</span>';
          return `<tr data-i="${i}"><td>${esc(r.nome)}${tag}</td><td>${brl(r.cobrar)}</td><td>${brl(r.recebidoTotal)}</td>
            <td>${v(r.parcialTotal.q)} · ${brl(r.parcialTotal.v)}</td><td>${v(r.branco.q)}</td><td>${brl(r.extraTotal.v)}</td><td>${brl(r.feitaTotal.v)}</td></tr>`;
        }).join('')}</tbody>
        <tfoot><tr><td>Total</td><td>${brl(t.cobrar)}</td><td>${brl(t.recebido)}</td><td>${R.dois(t.repasseQ)} · ${brl(t.repasseV)}</td><td>${R.dois(t.brancoQ)}</td><td>${brl(t.extra)}</td><td>${brl(t.deixado)}</td></tr></tfoot>`;
      $$('#tabela tbody tr[data-i]').forEach((tr) => tr.addEventListener('click', () => abrirRelatorio(dados.lista[+tr.dataset.i])));
    }

    // Conferência
    const blocos = [];
    dados.lista.forEach((r) => {
      const av = avisosPorId.get(r).slice();
      if (dados.semana != null && r.semana != null && r.semana !== dados.semana) av.unshift(`Está na ${r.semana}ª semana; a equipe está na ${dados.semana}ª.`);
      if (av.length) blocos.push(`<div class="aviso"><b>${esc(r.nome)}</b><ul>${av.map((a) => `<li>${esc(a)}</li>`).join('')}</ul></div>`);
    });
    const repetidos = dados.doDia.filter((r, i, arr) => arr.findIndex((x) => norm(x.nome) === norm(r.nome)) !== i);
    if (repetidos.length) blocos.push(`<div class="aviso aviso--neg">Relatório repetido: ${repetidos.map((r) => esc(r.nome)).join(', ')}.</div>`);
    if (faltamReais.length) blocos.push(`<div class="aviso aviso--neg">Faltam ${faltamReais.length} relatório${faltamReais.length > 1 ? 's' : ''}: ${faltamReais.map(esc).join(', ')}. Os totais ainda não estão completos.</div>`);
    // O valor a cobrar da equipe é o mesmo a semana toda: compara com o dia anterior que tiver relatório.
    const ontem = db.reports.filter((r) => r.data < d && difDias(d, r.data) <= 6).reduce((m, r) => (r.data > m ? r.data : m), '');
    if (ontem && !faltamReais.length) {
      const tAntes = R.consolidar(relatoriosDoDia(ontem).lista);
      const mesmosCarros = tAntes.carros === t.carros;
      if (mesmosCarros && Math.abs(tAntes.cobrar - t.cobrar) > 0.005)
        blocos.push(`<div class="aviso">Vlr. cobrar da equipe mudou desde ${dataCurta(ontem)}: ${brl(tAntes.cobrar)} → ${brl(t.cobrar)}.</div>`);
      if (mesmosCarros && t.recebido + 0.005 < tAntes.recebido)
        blocos.push(`<div class="aviso">Recebido da equipe diminuiu desde ${dataCurta(ontem)}: ${brl(tAntes.recebido)} → ${brl(t.recebido)}.</div>`);
    }
    $('#conferencia').innerHTML = blocos.length ? blocos.join('') : (dados.lista.length ? '<div class="aviso aviso--ok">✓ Tudo confere: as contas de todos os relatórios fecham.</div>' : '<p class="dica">Sem relatórios para conferir.</p>');

    desenharTexto();
    conferirPronto();
  }

  function textoAtual() {
    if (!atual) return '';
    return R.textoEquipe(atual.t, {
      data: atual.d, equipe: db.cfg.equipe, produto: db.cfg.produto,
      semanaTexto: db.cfg.semanas[atual.d] || atual.semanaAuto,
    });
  }
  function desenharTexto() { $('#textoEquipe').textContent = textoAtual(); }

  const mandarWhats = (txt) => window.open('https://wa.me/?text=' + encodeURIComponent(txt), '_blank');
  async function copiar(txt) {
    try { await navigator.clipboard.writeText(txt); toast('Copiado.'); } catch (e) { toast('Não consegui copiar.'); }
  }
  async function compartilhar(txt, tituloDlg) {
    try {
      if (SHARE) await SHARE.share({ text: txt, dialogTitle: tituloDlg });
      else if (navigator.share) await navigator.share({ text: txt });
      else toast('Este navegador não compartilha. Use Copiar.');
    } catch (e) { /* cancelou */ }
  }
  $('#btnWhats').addEventListener('click', () => mandarWhats(textoAtual()));
  $('#btnCopiar').addEventListener('click', () => copiar(textoAtual()));
  $('#btnCompart').addEventListener('click', () => compartilhar(textoAtual(), 'Mandar relatório da equipe'));

  // Compara um relatório da equipe feito à mão com o que o app somou.
  $('#txtConferir').addEventListener('input', conferirPronto);
  function conferirPronto() {
    const txt = $('#txtConferir').value;
    const el = $('#resultadoConferir');
    if (!txt.trim() || !atual) { el.innerHTML = ''; return; }
    const p = R.lerEquipe(txt);
    const t = atual.t;
    const itens = [['Carros', 'carros', false], ['Vlr. cobrar', 'cobrar', true], ['Recebido', 'recebido', true],
      ['Repasse', 'repasseQ', false], ['Valor repasse', 'repasseV', true], ['Notas em branco', 'brancoQ', false],
      ['Pepino extra', 'extra', true], ['Valor deixado', 'deixado', true]];
    let erros = 0;
    const linhas = itens.filter(([, k]) => p[k] != null).map(([nome, k, din]) => {
      const ok = Math.abs(v(p[k]) - v(t[k])) < 0.005;
      if (!ok) erros++;
      const f = (n) => (din ? brl(n) : v(n));
      return `<tr><td>${nome}</td><td>${f(p[k])}</td><td>${f(t[k])}</td><td class="${ok ? 'ok' : 'erro'}">${ok ? '✓' : (din ? brl(v(p[k]) - v(t[k])) : v(p[k]) - v(t[k]))}</td></tr>`;
    });
    if (!linhas.length) { el.innerHTML = '<p class="dica">Não achei os campos do relatório da equipe no texto.</p>'; return; }
    el.innerHTML = `<table class="comp"><thead><tr><th></th><th>Colado</th><th>App</th><th>Dif.</th></tr></thead><tbody>${linhas.join('')}</tbody></table>
      <div class="aviso ${erros ? 'aviso--neg' : 'aviso--ok'}">${erros ? `${erros} linha${erros > 1 ? 's' : ''} não bate${erros > 1 ? 'm' : ''} com a soma dos relatórios.` : '✓ Bate com a soma dos relatórios.'}</div>`;
  }

  // ---------- Relatório de um vendedor ----------
  let aberto = null;
  const dlg = $('#dlg');

  function abrirRelatorio(r) {
    aberto = r;
    $('#dlgTitulo').textContent = `${r.nome} · ${dataCurta(r.data)}`;
    $('#dlgAvisos').innerHTML = avisosHTML(R.conferir(r, anteriorDe(r)));
    $('#dlgResumo').innerHTML = resumoHTML(r);
    $('#dlgTexto').value = r.raw || '';
    $('#dlgDetalhe').open = false;
    dlg.showModal();
  }

  // Limpar: apaga o texto para colar o relatório corrigido no lugar (só troca ao tocar em Salvar).
  $('#dlgLimpar').addEventListener('click', () => {
    $('#dlgTexto').value = '';
    $('#dlgTexto').focus();
  });

  $('#dlgSalvar').addEventListener('click', () => {
    if (!aberto) return;
    const i = db.reports.indexOf(aberto);
    let r = aberto;
    if (!$('#dlgTexto').value.trim()) { toast('Cole o relatório corrigido antes de salvar.'); return; }
    if ($('#dlgTexto').value.trim() !== (aberto.raw || '')) {
      r = novoRelatorio($('#dlgTexto').value, aberto.data);
      if (!r.nome) { toast('O texto ficou sem "Nome:".'); return; }
    }
    if (i >= 0) db.reports[i] = r; else db.reports.push(r);
    // Mudou nome/data no texto e já existia outro igual: fica o editado.
    db.reports = db.reports.filter((x) => x === r || !mesmo(x, r));
    lembrarVendedor(r.nome);
    salvar(); dlg.close(); toast('Salvo.');
    redesenhar();
  });

  $('#dlgExcluir').addEventListener('click', () => {
    if (!aberto || !confirm(`Excluir o relatório de ${aberto.nome} (${dataCurta(aberto.data)})?`)) return;
    db.reports = db.reports.filter((x) => x !== aberto);
    salvar(); dlg.close(); toast('Excluído.');
    redesenhar();
  });

  function redesenhar() {
    const aba = $('.abas button.is-on').dataset.aba;
    if (aba === 'equipe') desenharEquipe();
    if (aba === 'lista') desenharLista();
  }

  // ---------- Lista ----------
  $('#busca').addEventListener('input', desenharLista);
  function desenharLista() {
    const q = norm($('#busca').value);
    const lista = db.reports.filter((r) => !q || norm(r.nome).includes(q))
      .sort((a, b) => (a.data === b.data ? norm(a.nome).localeCompare(norm(b.nome)) : a.data < b.data ? 1 : -1));
    if (!lista.length) { $('#lista').innerHTML = '<p class="dica">Nenhum relatório salvo ainda.</p>'; return; }
    let html = ''; let dia = null;
    lista.forEach((r) => {
      if (r.data !== dia) { dia = r.data; html += `<div class="grupo-dia">${r.data ? diaSemana(r.data) : 'Sem data'}</div>`; }
      const n = R.conferir(r, anteriorDe(r)).length;
      html += `<button type="button" class="item" data-id="${db.reports.indexOf(r)}"><div class="rel">
        <div><div class="rel__nome">${esc(r.nome)}${n ? `<span class="tag tag--warn">⚠ ${n}</span>` : '<span class="tag tag--ok">✓</span>'}</div>
        <div class="rel__sub">${r.semana ? r.semana + 'ª semana' : ''}${r.cidade ? ' · ' + esc(r.cidade) : ''}</div></div>
        <div class="rel__val">Recebido ${brl(r.recebidoTotal)}<br><span class="rel__sub">Deixado ${brl(r.feitaTotal.v)}</span></div>
      </div></button>`;
    });
    $('#lista').innerHTML = html;
    $$('#lista .item').forEach((b) => b.addEventListener('click', () => abrirRelatorio(db.reports[+b.dataset.id])));
  }


  // ---------- Caixas da semana (fechamento) ----------
  // Cada caixa é a folha CAIXA de um vendedor. A semana vai de segunda a domingo, pela data da folha.
  const segundaDe = (iso) => somaDias(iso, -((new Date(iso + 'T12:00:00').getDay() + 6) % 7));
  const titulo = (s) => String(s || '').toLowerCase().replace(/(^|\s)\S/g, (l) => l.toUpperCase());
  const ultimaCaixa = () => db.caixas.reduce((m, c) => (c.data && c.data > m ? c.data : m), '');
  let semanaCx = segundaDe(ultimaCaixa() || hojeISO());
  // Folha sem data entra na semana aberta na tela (hoje, se for a semana de hoje; senão o sábado dela).
  const dataPadraoCx = () => (segundaDe(hojeISO()) === semanaCx ? hojeISO() : somaDias(semanaCx, 5));
  const caixasDaSemana = () => db.caixas.filter((c) => c.data && segundaDe(c.data) === semanaCx)
    .sort((a, b) => norm(a.nome).localeCompare(norm(b.nome)));

  // Guarda um caixa: o mesmo vendedor na mesma semana troca o anterior (os outros vendedores ficam).
  // A tela continua na semana aberta; só vai para a semana do caixa se a aberta estiver vazia.
  // Caixa de outra semana fica guardado lá e entra no aviso "foi para outra semana".
  let foraDaSemana = [];
  function guardarCaixa(c) {
    if (!c.data) c.data = dataPadraoCx();
    const i = db.caixas.findIndex((x) => x !== c && norm(x.nome) === norm(c.nome) && segundaDe(x.data) === segundaDe(c.data));
    if (i >= 0) db.caixas.splice(i, 1);
    if (!db.caixas.includes(c)) db.caixas.push(c);
    lembrarVendedor(c.nome);
    if (!caixasDaSemana().some((x) => x !== c)) semanaCx = segundaDe(c.data);
    if (segundaDe(c.data) !== semanaCx) foraDaSemana.push(c);
  }
  // Aviso dos caixas que entraram em outra semana, com botão para ir até ela.
  function avisarForaDaSemana() {
    const el = $('#cxOutra');
    foraDaSemana = foraDaSemana.filter((c) => db.caixas.includes(c) && segundaDe(c.data) !== semanaCx);
    if (!foraDaSemana.length) { el.hidden = true; return; }
    const semanas = [...new Set(foraDaSemana.map((c) => segundaDe(c.data)))].sort();
    el.hidden = false;
    el.innerHTML = `<b>Foi para outra semana (pela data da folha):</b><ul>${foraDaSemana.map((c) =>
      `<li>${esc(c.nome || 'Sem nome')} · ${dataCurta(c.data)}</li>`).join('')}</ul>` +
      `<p class="dica">Os caixas desta semana continuam aqui. Se a data da folha está errada, abra o caixa naquela semana e corrija a data.</p>` +
      `<div class="botoes">${semanas.map((s) => `<button type="button" class="btn btn--sec btn--peq" data-ir="${s}">Ver semana de ${dataCurta(s)}</button>`).join('')}</div>`;
    $$('[data-ir]', el).forEach((b) => b.addEventListener('click', () => { semanaCx = b.dataset.ir; desenharCaixas(); window.scrollTo(0, 0); }));
  }

  $('#cxAntes').addEventListener('click', () => { semanaCx = somaDias(semanaCx, -7); desenharCaixas(); });
  $('#cxDepois').addEventListener('click', () => { semanaCx = somaDias(semanaCx, 7); desenharCaixas(); });
  $('#cxSemanaTexto').addEventListener('input', (e) => {
    if (e.target.value.trim()) db.cfg.semanasCaixa[semanaCx] = e.target.value; else delete db.cfg.semanasCaixa[semanaCx];
    salvar(); desenharTextoCx();
  });

  let cxAtual = null;
  function desenharCaixas() {
    const lista = caixasDaSemana();
    const t = R.fechamento(lista);
    const data = lista.reduce((m, c) => (c.data > m ? c.data : m), '') || somaDias(semanaCx, 5);
    const semana = (() => { const c = {}; lista.forEach((x) => { if (x.semana) c[x.semana] = (c[x.semana] || 0) + 1; }); return Object.keys(c).sort((a, b) => c[b] - c[a])[0]; })();
    const cidades = {}; lista.forEach((x) => { const k = titulo(x.cidade); if (k) cidades[k] = (cidades[k] || 0) + 1; });
    const cidade = Object.keys(cidades).sort((a, b) => cidades[b] - cidades[a])[0] || '';
    const semanaAuto = R.textoSemana(semana ? +semana : null, data);
    cxAtual = { t, data, cidade, semanaAuto };

    $('#cxSemana').textContent = `Semana de ${dataCurta(semanaCx)} a ${dataCurta(somaDias(semanaCx, 6))}`;
    $('#cxSemanaTexto').placeholder = semanaAuto;
    $('#cxSemanaTexto').value = db.cfg.semanasCaixa[semanaCx] || '';

    const tiles = [
      ['Cobrado', brl(t.cobrado)], ['Recebido', brl(t.recebido)], ['Pipino extra', brl(t.extra)], ['Total', brl(t.total)],
      ['Percentual', R.pct(t.percentual)], ['Pipino', brl(t.pepino)], ['Inadimplência', R.pct(t.inadimplencia)], ['Vlr deixado', brl(t.deixado)],
    ];
    $('#cxTiles').innerHTML = tiles.map(([a, b]) => `<div class="tile"><small>${a}</small><b>${b}</b></div>`).join('');

    const faltam = db.cfg.vendedores.filter((n) => !lista.some((c) => norm(c.nome) === norm(n)));
    $('#cxCardFaltam').hidden = !faltam.length;
    $('#cxFaltam').textContent = faltam.join(', ');

    avisarForaDaSemana();
    $('#cxQt').textContent = `(${lista.length})`;
    if (!lista.length) {
      $('#cxTabela').innerHTML = '<tbody><tr><td class="muted">Nenhum caixa nesta semana. Leia as fotos ou cole o resumo.</td></tr></tbody>';
    } else {
      $('#cxTabela').innerHTML = `<thead><tr><th>Vendedor</th><th>Cobrado</th><th>Recebido</th><th>Pep. extra</th><th>Pipino</th><th>Deixado</th></tr></thead>
        <tbody>${lista.map((c, i) => {
          const n = R.conferirCaixa(c).length;
          return `<tr data-i="${i}"><td>${esc(c.nome || 'Sem nome')}${n ? `<span class="tag tag--warn">⚠ ${n}</span>` : '<span class="tag tag--ok">✓</span>'}</td>
            <td>${brl(c.foiCobrar)}</td><td>${brl(R.recebidoCaixa(c))}</td><td>${brl(c.pepinoExtra)}</td><td>${brl(c.valorPepinos)}</td><td>${brl(c.valorDeixado)}</td></tr>`;
        }).join('')}</tbody>
        <tfoot><tr><td>Total</td><td>${brl(t.cobrado)}</td><td>${brl(t.recebido)}</td><td>${brl(t.extra)}</td><td>${brl(t.pepino)}</td><td>${brl(t.deixado)}</td></tr></tfoot>`;
      $$('#cxTabela tbody tr[data-i]').forEach((tr) => tr.addEventListener('click', () => abrirCaixa(lista[+tr.dataset.i])));
    }

    const blocos = [];
    lista.forEach((c) => {
      const av = R.conferirCaixa(c);
      if (semana && c.semana && String(c.semana) !== String(semana)) av.unshift(`Está na semana ${c.semana}; os outros caixas estão na ${semana}.`);
      if (av.length) blocos.push(`<div class="aviso"><b>${esc(c.nome || 'Sem nome')}</b><ul>${av.map((a) => `<li>${esc(a)}</li>`).join('')}</ul></div>`);
    });
    if (faltam.length) blocos.push(`<div class="aviso aviso--neg">Faltam ${faltam.length} caixa${faltam.length > 1 ? 's' : ''}: ${faltam.map(esc).join(', ')}. O fechamento ainda não está completo.</div>`);
    $('#cxConferencia').innerHTML = blocos.length ? blocos.join('') : (lista.length ? '<div class="aviso aviso--ok">✓ Tudo confere: as contas de todos os caixas fecham.</div>' : '<p class="dica">Sem caixas para conferir.</p>');
    desenharTextoCx();
  }

  function textoCx() {
    if (!cxAtual) return '';
    return R.textoFechamento(cxAtual.t, {
      cidade: cxAtual.cidade, data: cxAtual.data, equipe: db.cfg.equipe, produto: db.cfg.produto,
      semanaTexto: db.cfg.semanasCaixa[semanaCx] || cxAtual.semanaAuto,
    });
  }
  function desenharTextoCx() { $('#cxTexto').textContent = textoCx(); }
  $('#cxWhats').addEventListener('click', () => mandarWhats(textoCx()));
  $('#cxCopiar').addEventListener('click', () => copiar(textoCx()));
  $('#cxCompart').addEventListener('click', () => compartilhar(textoCx(), 'Mandar fechamento da semana'));

  // Colar o "Mandar resumo" do app Fechamento de Caixa (um ou vários).
  $('#cxLerTexto').addEventListener('click', () => {
    const partes = R.separarCaixas($('#cxTxt').value);
    if (!partes.length) { toast('Não achei nenhum resumo de caixa no texto.'); return; }
    const novos = partes.map(R.lerCaixaTexto);
    if (novos.some((c) => !c.nome)) { toast('Tem resumo sem o nome (linha "CAIXA — Nome").'); return; }
    novos.forEach((c) => { c.fonte = 'texto'; guardarCaixa(c); });
    salvar(); $('#cxTxt').value = '';
    toast(`${novos.length} caixa${novos.length > 1 ? 's lidos' : ' lido'}.`);
    desenharCaixas();
  });
  $('#cxManual').addEventListener('click', () => abrirCaixa(Object.assign(R.caixaVazio(), { data: dataPadraoCx() }), true));

  // ---------- Foto do caixa lida pela IA (Claude) ----------
  const KEY_API = 'relatorios.apiKey';
  // A leitura usa só o Claude Haiku (menos de 1 centavo por foto).
  const MODELO_IA = 'claude-haiku-5-5';
  const lsGet = (k, d) => { try { return localStorage.getItem(k) || d; } catch (e) { return d; } };
  const lsSet = (k, val) => { try { localStorage.setItem(k, val); } catch (e) { /* sem armazenamento */ } };

  let SDK = null;
  async function clienteIA() {
    const key = lsGet(KEY_API, '').trim();
    if (!key) return null;
    // O SDK só é carregado quando a IA é usada. O app roda no aparelho do dono, com a chave dele.
    if (!SDK) SDK = (await import('./vendor/anthropic.js')).default;
    return new SDK({ apiKey: key, dangerouslyAllowBrowser: true });
  }

  const n = { type: 'number' };
  const inteiro = { type: 'integer' };
  const SCHEMA_CAIXA = {
    type: 'object', additionalProperties: false,
    required: ['nome', 'cidade', 'data', 'semana', ...R.CAIXA_NUM, 'extrasValores', 'duvidas'],
    properties: {
      nome: { type: 'string' }, cidade: { type: 'string' },
      data: { type: 'string', description: 'dd/mm/aaaa, ou vazio' }, semana: inteiro,
      foiCobrar: n, qtNotas: inteiro, antecipados: n, valorPepinos: n, pinos: inteiro, pepinoParcial: n,
      notas25: n, notas4050: n, pepinoExtra: n, recebimento: n, qtNotasDeixadas: inteiro, valorDeixado: n,
      extrasValores: { type: 'array', items: n, description: 'VALOR de cada bloco VENDEDORA preenchido' },
      duvidas: { type: 'string' },
    },
  };
  const SISTEMA = 'Você lê fotos da folha "CAIXA" (fechamento semanal de um vendedor de enxoval) e devolve os campos pedidos. ' +
    'Os valores em reais vêm no formato brasileiro (8.189,00 = 8189.00); devolva como número. Campo em branco, com dois traços (//), traço ou riscado é vazio: 0 (ou texto vazio).';
  const PEDIDO = `Leia esta folha CAIXA. Pode ser foto da folha de papel preenchida à mão (de lado, torta ou com sombra)
ou a imagem gerada pelo app Caixa. O impresso está em preto e o preenchido à mão em azul.
Campos: NOME (nome), CIDADE (cidade), DATA (data, dd/mm/aaaa), SEMANA (semana, só o número), FOI COBRAR (foiCobrar),
QT. DE NOTAS (qtNotas), ANTECIPADOS (antecipados), VALOR DOS PEPINOS (valorPepinos), Nº DE PINOS (pinos),
PEPINO PARCIAL (pepinoParcial), NOTAS 25% (notas25), NOTAS 40% e 50% (notas4050), PEPINO EXTRA (pepinoExtra: o total ao lado
do título; se não houver, a soma dos VALOR dos blocos "VENDEDORA"), RECEBIMENTO (recebimento), QT.NOTAS DEIXADAS
(qtNotasDeixadas), VALOR DEIXADO (valorDeixado). Ignore depósitos e despesas.
Em extrasValores, o VALOR de cada bloco "VENDEDORA" preenchido (Nº | CIDADE | VALOR), na ordem; nenhum = lista vazia.
Campo em branco ou com "//" (dois traços), "-" ou riscado: é vazio, devolva 0 e NÃO coloque em "duvidas".
A 1ª imagem é a folha inteira; as outras são ZOOMS (pedaços ampliados) da mesma folha: use os zooms para ler cada dígito com
certeza e a folha inteira para saber de que campo é cada número.
CONFIRA ANTES DE RESPONDER, a folha fecha assim:
- RECEBIMENTO = NOTAS 25% + NOTAS 40% e 50% + ANTECIPADOS + PEPINO PARCIAL + PEPINO EXTRA
- PEPINO EXTRA = soma dos VALOR dos blocos VENDEDORA
- V. PEP. 5% = 5% do FOI COBRAR
Se uma conta não bater, olhe de novo os dígitos nos zooms (na letra de mão confunde-se 1 e 7, 3 e 8, 4 e 9, 0 e 6, 5 e 6, 1 e 4)
e escolha a leitura que faz a conta fechar, desde que ela combine com o que está escrito. Nunca invente número.
Em "duvidas" diga, em poucas palavras, só o que ficou difícil de ler ou a conta que não fechou; se leu tudo bem, deixe vazio.`;

  // A foto vai inteira e em 4 zooms (quadrantes com sobra nas bordas), cada um com até 1568 px no lado maior
  // (o tamanho que a IA enxerga sem diminuir). Um pouco mais de contraste e cor deixa a tinta azul mais nítida.
  const LADO_IA = 1568;
  async function prepararFotos(file) {
    const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const recorte = (sx, sy, sw, sh) => {
      const k = Math.min(2.5, LADO_IA / Math.max(sw, sh));
      const cv = document.createElement('canvas');
      cv.width = Math.round(sw * k); cv.height = Math.round(sh * k);
      const g = cv.getContext('2d');
      g.filter = 'contrast(1.25) saturate(1.3)';
      g.imageSmoothingQuality = 'high';
      g.drawImage(bmp, sx, sy, sw, sh, 0, 0, cv.width, cv.height);
      return cv.toDataURL('image/jpeg', 0.9).split(',')[1];
    };
    const W = bmp.width, H = bmp.height, sobra = 0.12;
    const fotos = [{ rot: 'Folha inteira', data: recorte(0, 0, W, H) }];
    const nomes = [['canto de cima à esquerda', 'canto de cima à direita'], ['canto de baixo à esquerda', 'canto de baixo à direita']];
    for (let lin = 0; lin < 2; lin++) {
      for (let col = 0; col < 2; col++) {
        const x0 = Math.max(0, (col * 0.5 - sobra) * W), y0 = Math.max(0, (lin * 0.5 - sobra) * H);
        const x1 = Math.min(W, ((col + 1) * 0.5 + sobra) * W), y1 = Math.min(H, ((lin + 1) * 0.5 + sobra) * H);
        fotos.push({ rot: `Zoom: ${nomes[lin][col]} da foto`, data: recorte(x0, y0, x1 - x0, y1 - y0) });
      }
    }
    return fotos;
  }

  // esforco: 'medium' na 1ª leitura; 'high' quando relê porque as contas não fecharam (o Haiku pensa mais).
  async function lerFotoIA(api, fotos, esforco) {
    const pedido = {
      model: MODELO_IA,
      max_tokens: 16000,
      output_config: { effort: esforco, format: { type: 'json_schema', schema: SCHEMA_CAIXA } },
      system: SISTEMA,
      messages: [{ role: 'user', content: [
        ...fotos.flatMap((f) => [{ type: 'text', text: f.rot + ':' }, { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: f.data } }]),
        { type: 'text', text: PEDIDO },
      ] }],
    };
    const resp = await api.messages.create(pedido);
    if (resp.stop_reason === 'refusal') throw new Error('A IA não quis ler esta foto. Tente outra foto.');
    if (resp.stop_reason === 'max_tokens') throw new Error('A leitura ficou grande demais. Tente de novo.');
    const txt = (resp.content.find((b) => b.type === 'text') || {}).text;
    if (!txt) throw new Error('A IA não devolveu nada. Tente de novo.');
    const lido = JSON.parse(txt);
    const c = Object.assign(R.caixaVazio(), lido);
    c.data = R.dataISO(lido.data) || null;
    c.semana = lido.semana || null;
    c.fonte = 'foto';
    c.extrasValores = Array.isArray(lido.extrasValores) ? lido.extrasValores.filter((x) => typeof x === 'number') : [];
    // Campo em branco ou com "//" não é dúvida: tira esses pedaços do aviso.
    c.duvidas = String(c.duvidas || '').split(/[;.]\s*/)
      .filter((p) => p.trim() && !/\/\/|em branco|vazio|traço|traco|riscad/i.test(p)).join('. ');
    return c;
  }

  function erroIA(e) {
    if (SDK && e instanceof SDK.AuthenticationError) return 'Chave da API inválida. Confira em Ajustes.';
    if (SDK && e instanceof SDK.PermissionDeniedError) return 'Essa chave não tem permissão. Confira em Ajustes.';
    if (SDK && e instanceof SDK.RateLimitError) return 'Muitas leituras seguidas. Espere um pouco e tente de novo.';
    if (SDK && e instanceof SDK.APIConnectionError) return 'Sem internet para a IA. Tente de novo com internet.';
    if (SDK && e instanceof SDK.APIError) return 'A IA deu erro. Tente de novo daqui a pouco.';
    return e && e.message ? e.message : 'Não deu para ler a foto.';
  }

  $('#cxFotoBtn').addEventListener('click', async () => {
    if (!lsGet(KEY_API, '').trim()) { toast('Para ler fotos, cole a chave da API em Ajustes.'); abrirAba('ajustes'); return; }
    $('#cxFoto').click();
  });
  $('#cxFoto').addEventListener('change', async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    const status = $('#cxStatus');
    let ok = 0;
    const erros = [];
    try {
      const api = await clienteIA();
      for (let i = 0; i < files.length; i++) {
        status.hidden = false;
        status.textContent = files.length > 1 ? `A IA está lendo a foto ${i + 1} de ${files.length}…` : 'A IA está lendo a foto…';
        try {
          const fotos = await prepararFotos(files[i]);
          let c = await lerFotoIA(api, fotos, 'medium');
          // Conta da folha não fechou: o Haiku lê de novo com mais atenção e fica a leitura que fecha.
          if (R.contasCaixa(c).length) {
            status.textContent = `As contas não fecharam: conferindo a foto ${files.length > 1 ? i + 1 + ' ' : ''}de novo…`;
            const c2 = await lerFotoIA(api, fotos, 'high');
            if (R.contasCaixa(c2).length <= R.contasCaixa(c).length) c = c2;
          }
          if (!c.nome) c.nome = `Sem nome ${i + 1}`;
          guardarCaixa(c); ok++;
          salvar(); desenharCaixas();
        } catch (err) {
          console.error(err);
          erros.push(`Foto ${i + 1}: ${erroIA(err)}`);
          if (SDK && (err instanceof SDK.AuthenticationError || err instanceof SDK.APIConnectionError)) break;
        }
      }
    } catch (err) {
      erros.push(erroIA(err));
    }
    status.hidden = true;
    if (erros.length) {
      $('#cxErros').hidden = false;
      $('#cxErros').innerHTML = `<b>Não deu para ler:</b><ul>${erros.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
    } else $('#cxErros').hidden = true;
    if (ok) toast(`${ok} caixa${ok > 1 ? 's lidos' : ' lido'}. Confira os valores.`);
  });

  // ---------- Conferir / corrigir um caixa ----------
  const CAMPOS_CX = [
    ['nome', 'Nome', 't'], ['cidade', 'Cidade', 't'], ['data', 'Data', 'd'], ['semana', 'Semana', 'i'],
    ['foiCobrar', 'Foi cobrar', 'm'], ['qtNotas', 'Qt. de notas', 'i'], ['notas25', 'Notas 25%', 'm'], ['notas4050', 'Notas 40% e 50%', 'm'],
    ['antecipados', 'Antecipados', 'm'], ['pepinoParcial', 'Pepino parcial', 'm'], ['pepinoExtra', 'Pepino extra', 'm'],
    ['recebimento', 'Recebimento', 'm'], ['valorPepinos', 'Valor dos pepinos', 'm'], ['pinos', 'Nº de pinos', 'i'],
    ['qtNotasDeixadas', 'Qt. notas deixadas', 'i'], ['valorDeixado', 'Valor deixado', 'm'],
  ];
  $('#cxCampos').innerHTML = CAMPOS_CX.map(([k, rot, tipo]) => `<label class="linha-campo">${rot}
    <input data-cx="${k}" ${tipo === 'd' ? 'type="date"' : tipo === 'm' ? 'inputmode="decimal" placeholder="0,00"' : tipo === 'i' ? 'inputmode="numeric" placeholder="0"' : ''}></label>`).join('');
  let cxAberto = null;
  let cxNovo = false;
  const dlgCx = $('#dlgCaixa');

  function abrirCaixa(c, novo) {
    cxAberto = c; cxNovo = !!novo;
    $('#dlgCxTitulo').textContent = novo ? 'Caixa novo' : `${c.nome || 'Sem nome'} · ${dataCurta(c.data)}`;
    $('#dlgCxAvisos').innerHTML = novo ? '' : (() => {
      const av = R.conferirCaixa(c);
      return av.length ? `<div class="aviso"><b>Conferir:</b><ul>${av.map((a) => `<li>${esc(a)}</li>`).join('')}</ul></div>` : '<div class="aviso aviso--ok">✓ As contas do caixa fecham.</div>';
    })();
    CAMPOS_CX.forEach(([k, , tipo]) => {
      const el = $(`[data-cx="${k}"]`);
      const val = c[k];
      el.value = tipo === 'm' ? (v(val) ? brl(val) : '') : tipo === 'i' ? (v(val) ? String(val) : '') : (val || '');
    });
    $('#dlgCxExcluir').hidden = !!novo;
    contaCx();
    dlgCx.showModal();
  }

  // Lê o formulário num caixa (sem guardar).
  function formCx(c) {
    CAMPOS_CX.forEach(([k, , tipo]) => {
      const val = $(`[data-cx="${k}"]`).value.trim();
      if (tipo === 'm') c[k] = R.numero(val) || 0;
      else if (tipo === 'i') c[k] = val ? Math.round(R.numero(val) || 0) : (k === 'semana' ? null : 0);
      else c[k] = val || (k === 'data' ? null : '');
    });
    return c;
  }
  // Conta na hora, enquanto digita: o recebimento em branco é a soma das partes.
  function contaCx() {
    const c = formCx(R.caixaVazio());
    const partes = v(c.notas25) + v(c.notas4050) + v(c.antecipados) + v(c.pepinoParcial) + v(c.pepinoExtra);
    $('#dlgCxConta').innerHTML = `Recebimento ${v(c.recebimento) ? '' : '(soma das partes) '}<b>${brl(v(c.recebimento) || partes)}</b>` +
      ` · Recebido sem o pepino extra <b>${brl(R.recebidoCaixa(c))}</b>`;
  }
  $('#cxCampos').addEventListener('input', contaCx);

  $('#dlgCxSalvar').addEventListener('click', () => {
    const c = formCx(cxAberto);
    if (!c.nome) { toast('Coloque o nome do vendedor.'); return; }
    // Salvo à mão = valores conferidos por quem salvou: limpa as dúvidas e os blocos lidos da foto.
    c.duvidas = '';
    c.extrasValores = [];
    guardarCaixa(c);
    salvar(); dlgCx.close(); toast('Caixa salvo.');
    desenharCaixas();
  });
  $('#dlgCxExcluir').addEventListener('click', () => {
    if (!cxAberto || !confirm(`Excluir o caixa de ${cxAberto.nome || 'sem nome'}?`)) return;
    db.caixas = db.caixas.filter((x) => x !== cxAberto);
    salvar(); dlgCx.close(); toast('Excluído.');
    desenharCaixas();
  });

  // ---------- Ajustes ----------
  function desenharAjustes() {
    $('#cfgApiKey').value = lsGet(KEY_API, '');
    $('#cfgEquipe').value = db.cfg.equipe || '';
    $('#cfgProduto').value = db.cfg.produto || '';
    $('#cfgVendedores').value = db.cfg.vendedores.join('\n');
  }
  $('#cfgEquipe').addEventListener('input', (e) => { db.cfg.equipe = e.target.value.trim(); salvar(); topo(); });
  $('#cfgApiKey').addEventListener('change', (e) => { lsSet(KEY_API, e.target.value.trim()); toast(e.target.value.trim() ? 'Chave salva.' : 'Chave apagada.'); });
  $('#cfgProduto').addEventListener('input', (e) => { db.cfg.produto = e.target.value.trim(); salvar(); });
  $('#cfgVendedores').addEventListener('change', (e) => {
    db.cfg.vendedores = e.target.value.split('\n').map((s) => s.trim()).filter(Boolean)
      .filter((n, i, arr) => arr.findIndex((x) => norm(x) === norm(n)) === i);
    salvar(); desenharAjustes();
  });

  $('#btnExportar').addEventListener('click', async () => {
    const nome = `relatorios-equipe-${hojeISO()}.json`;
    const json = JSON.stringify(db, null, 2);
    if (NATIVE && FS && SHARE) {
      // No APK: grava o arquivo e abre o compartilhar (Google Drive, WhatsApp, Arquivos…).
      try {
        const { uri } = await FS.writeFile({ path: nome, data: json, directory: 'CACHE', encoding: 'utf8' });
        await SHARE.share({ title: nome, files: [uri], dialogTitle: 'Guardar o backup' });
      } catch (e) {
        if (!/cancel|abort/i.test(String(e && (e.message || e.name)))) toast('Não deu para gerar o backup.');
      }
      return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    a.download = nome;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  $('#btnImportar').addEventListener('click', () => $('#arqImportar').click());
  $('#arqImportar').addEventListener('change', async (e) => {
    const arq = e.target.files[0];
    if (!arq) return;
    try {
      const dados = JSON.parse(await arq.text());
      if (!Array.isArray(dados.reports)) throw new Error('formato');
      if (!confirm(`Restaurar ${dados.reports.length} relatórios e ${(dados.caixas || []).length} caixas? Os de agora serão trocados.`)) return;
      db = montarDb(dados);
      salvar(); desenharAjustes(); topo(); toast('Backup restaurado.');
    } catch (err) { toast('Arquivo de backup inválido.'); }
    e.target.value = '';
  });
  $('#btnApagarTudo').addEventListener('click', () => {
    if (!db.reports.length || !confirm(`Apagar os ${db.reports.length} relatórios? Isso não tem volta.`)) return;
    db.reports = []; db.cfg.semanas = {}; salvar(); toast('Relatórios apagados.');
  });

  function topo() { $('#topoEquipe').textContent = db.cfg.equipe ? `Equipe ${db.cfg.equipe}` : 'Equipe'; }
  topo();

  // Teclado aberto: o campo em que se digita vai para o meio da parte visível (nunca atrás das abas
  // nem do teclado). O texto grande (colar relatórios) fica com o topo logo abaixo das abas.
  const campoTexto = (el) => !!el && el.matches('input:not([type="date"]):not([type="file"]):not([type="checkbox"]), textarea');
  function mostrarCampo() {
    const el = document.activeElement;
    if (!campoTexto(el)) return;
    const visivel = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    const alto = el.getBoundingClientRect().height > visivel * 0.45;
    el.scrollIntoView({ block: alto ? 'start' : 'center', behavior: 'smooth' });
  }
  document.addEventListener('focusin', () => setTimeout(mostrarCampo, 350));
  (window.visualViewport || window).addEventListener('resize', () => setTimeout(mostrarCampo, 50));

  // Ao rolar, as abas grudam no topo: uma faixa da cor do fundo cobre a barra de status do Android.
  const marcarRolagem = () => document.documentElement.classList.toggle('rolou', window.scrollY > 8);
  window.addEventListener('scroll', marcarRolagem, { passive: true });
  marcarRolagem();

  // Data: tocar em qualquer ponto do campo abre o calendário (em vez de marcar só o dia, o mês ou o ano).
  document.addEventListener('click', (e) => {
    const el = e.target;
    if (!el.matches || !el.matches('input[type="date"]') || typeof el.showPicker !== 'function') return;
    e.preventDefault();
    try { el.showPicker(); } catch (err) { /* sem calendário: fica a digitação normal */ }
  });

  // Botão voltar do Android: fecha a janela aberta, depois volta para Colar, depois minimiza.
  const App = plugin('App');
  if (App) App.addListener('backButton', () => {
    if (dlg.open) { dlg.close(); return; }
    if (dlgCx.open) { dlgCx.close(); return; }
    if ($('#aba-colar').hidden) abrirAba('colar'); else App.minimizeApp();
  });

  // Funciona sem internet: no site pelo service worker; no APK os arquivos já vêm dentro dele.
  if (!NATIVE && 'serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
