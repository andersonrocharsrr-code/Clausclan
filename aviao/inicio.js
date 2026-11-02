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
    ['meteo', '<img src="assets/meteo-radar.webp" alt="">', 'Meteorologia', 'Nuvens e radar'],
    ['radio', '<img src="assets/radio-gns430.webp" alt="">', 'Rádio', radioFeitas ? `${radioFeitas} conversas feitas` : 'Fale com a torre'],
  ].map(([tab, fig, t, s]) => `<a class="in-tile" href="#${tab}" data-tab="${tab}"><span class="in-tile__fig">${fig}</span><b>${t}</b><span>${esc(s)}</span></a>`).join('');
  // As outras seções, que não estão na barra de baixo nem nos blocos de cima
  $('#inMais').innerHTML = MAIS.map(([tab, t, s, p]) => `<a class="in-row" href="#${tab}" data-tab="${tab}"><span class="in-row__ico"><svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg></span><span class="in-row__t"><b>${t}</b><span>${s}</span></span><span class="in-row__go" aria-hidden="true">›</span></a>`).join('');
}
const MAIS = [
  ['pecas', 'Peças do avião', 'Toque nas peças, raio-X e as vistas do 747', '<path d="M3 13 L10 11 L13 4 H15 L14 11 L21 12 V14 L14 14 L13 20 H11 L10 15 L3 15Z"/>'],
  ['cartas', 'Cartas aeronáuticas', 'Aprenda a ler o diagrama, a aproximação e a saída', '<path d="M4 5 L9 3 L15 5 L20 3 V19 L15 21 L9 19 L4 21Z"/><path d="M9 3 V19 M15 5 V21"/>'],
  ['glossario', 'Glossário', 'Os termos em português e em inglês', '<path d="M5 4 H17 A2 2 0 0 1 19 6 V20 H7 A2 2 0 0 1 5 18Z"/><path d="M5 18 A2 2 0 0 1 7 16 H19"/><path d="M9 8 H15 M9 11 H13"/>'],
  ['catalogo', 'Catálogo 747', 'As categorias de peças do 747-8', '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>'],
];

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
