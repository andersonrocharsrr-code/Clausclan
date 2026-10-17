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
  let db = { reports: [], cfg: { equipe: '', produto: 'ENXOVAL', vendedores: [], semanas: {}, usarUltimo: false } };
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE));
    if (salvo && Array.isArray(salvo.reports)) db = { reports: salvo.reports, cfg: Object.assign(db.cfg, salvo.cfg) };
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

  $('#btnWhats').addEventListener('click', () => window.open('https://wa.me/?text=' + encodeURIComponent(textoAtual()), '_blank'));
  $('#btnCopiar').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(textoAtual()); toast('Copiado.'); } catch (e) { toast('Não consegui copiar.'); }
  });
  $('#btnCompart').addEventListener('click', async () => {
    try {
      if (SHARE) await SHARE.share({ text: textoAtual(), dialogTitle: 'Mandar relatório da equipe' });
      else if (navigator.share) await navigator.share({ text: textoAtual() });
      else toast('Este navegador não compartilha. Use Copiar.');
    } catch (e) { /* cancelou */ }
  });

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

  // ---------- Ajustes ----------
  function desenharAjustes() {
    $('#cfgEquipe').value = db.cfg.equipe || '';
    $('#cfgProduto').value = db.cfg.produto || '';
    $('#cfgVendedores').value = db.cfg.vendedores.join('\n');
  }
  $('#cfgEquipe').addEventListener('input', (e) => { db.cfg.equipe = e.target.value.trim(); salvar(); topo(); });
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
      if (!confirm(`Restaurar ${dados.reports.length} relatórios? Os de agora serão trocados.`)) return;
      db = { reports: dados.reports, cfg: Object.assign({ equipe: '', produto: 'ENXOVAL', vendedores: [], semanas: {}, usarUltimo: false }, dados.cfg) };
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

  // Botão voltar do Android: fecha a janela aberta, depois volta para Colar, depois minimiza.
  const App = plugin('App');
  if (App) App.addListener('backButton', () => {
    if (dlg.open) { dlg.close(); return; }
    if ($('#aba-colar').hidden) abrirAba('colar'); else App.minimizeApp();
  });

  // Funciona sem internet: no site pelo service worker; no APK os arquivos já vêm dentro dele.
  if (!NATIVE && 'serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
