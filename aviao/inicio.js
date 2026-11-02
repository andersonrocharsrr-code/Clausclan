/* Tela inicial: saudação, "Continue lendo" com o ponto em que a pessoa parou e atalhos para as seções principais. */
(() => {
'use strict';
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ler = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };

function saudacao() {
  const h = new Date().getHours();
  return h < 5 ? 'Boa noite' : h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
}

// O que mostrar em "Continue lendo": o último capítulo aberto ou, na primeira vez, uma sugestão
function continuar() {
  const l = ler('hgLeitura', null);
  if (l && l.id) return { ...l, rotulo: l.tipo === 'historia' ? 'Continue lendo · Modo história' : 'Continue lendo · Desastres aéreos' };
  return { tipo: 'historia', id: 'douglas', cap: 0, total: 24, titulo: 'Donald Douglas: da barbearia ao DC-3', foto: 'assets/douglas-partida.webp', rotulo: 'Comece por aqui · Modo história' };
}

function render() {
  const c = continuar();
  const n = c.cap + 1, pct = Math.round(n / c.total * 100);
  const dz = window.Desastres?.resumo?.() || { total: 0 };
  const hs = window.Historia?.resumo?.() || { nomes: [], capa: '' };
  const licoes = ($('#progressTxt')?.textContent || '').replace(' lições', '');
  const radioFeitas = ler('rdFeitas', []).length;
  $('#inHello').textContent = saudacao();
  $('#inCont').innerHTML = `
    ${c.foto ? `<img src="${esc(c.foto)}" alt="" draggable="false">` : ''}
    <div class="in-cont__t"><span class="in-k">${esc(c.rotulo)}</span><b>${esc(c.titulo)}</b>
      <div class="in-prog"><span class="in-prog__bar"><i style="width:${pct}%"></i></span>cap. ${n} de ${c.total}</div></div>`;
  $('#inCont').dataset.tipo = c.tipo; $('#inCont').dataset.id = c.id; $('#inCont').dataset.cap = c.cap;
  $('#inGrid').innerHTML = [
    ['desastres', `<img src="${esc(dz.foto || '')}" alt="">`, 'Desastres aéreos', `${dz.total} acidentes`],
    ['historia', `<img src="${esc(hs.capa || '')}" alt="">`, 'Histórias', hs.nomes.join(' · ')],
    ['escola', '<span class="in-ico">A</span>', 'Escola de voo', `${licoes} lições`],
    ['radio', '<span class="in-ico"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M5 5a10 10 0 0 0 0 14M19 5a10 10 0 0 1 0 14"/></svg></span>', 'Rádio', radioFeitas ? `${radioFeitas} conversas feitas` : 'Fale com a torre'],
  ].map(([tab, fig, t, s]) => `<a class="in-tile" href="#${tab}" data-tab="${tab}"><span class="in-tile__fig">${fig}</span><b>${t}</b><span>${esc(s)}</span></a>`).join('');
}

function init() {
  if (!$('#inCont')) return;
  $('#inCont').addEventListener('click', () => {
    const { tipo, id, cap } = $('#inCont').dataset;
    location.hash = tipo === 'historia' ? 'historia' : 'desastres';
    setTimeout(() => (tipo === 'historia' ? window.Historia : window.Desastres)?.abrir(id, +cap), 0);
  });
}
window.Inicio = { init, start: render };
})();
