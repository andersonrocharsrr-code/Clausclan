/* Computador de voo: triângulo de vento, vento na pista, combustível, peso e balanceamento do avião
   fictício Hangar H-1, altitude-densidade, conversões e exercícios. Tudo é cálculo; nada depende de manuais de fabricantes. */
(() => {
'use strict';
const $ = (s) => document.querySelector(s);
const D2R = Math.PI / 180;
const nf = (v, d = 0) => (Number.isFinite(v) ? v.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d }) : '–');
const rumo = (v) => String(Math.round(((v % 360) + 360) % 360) || 360).padStart(3, '0') + '°';
const num = (id) => { const v = parseFloat(String($(id).value).replace(',', '.')); return Number.isFinite(v) ? v : NaN; };
const hm = (h) => { if (!Number.isFinite(h) || h < 0) return '–'; const m = Math.round(h * 60); return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')} min`; };

// ---------- Triângulo de vento ----------
function triangulo(curso, tas, wdir, wvel) {
  const a = (wdir - curso) * D2R, s = wvel * Math.sin(a) / tas;
  if (Math.abs(s) > 1) return null; // vento mais forte que a velocidade do avião na lateral
  const wca = Math.asin(s) / D2R, gs = tas * Math.cos(wca * D2R) - wvel * Math.cos(a);
  return { wca, proa: curso + wca, gs };
}
function desenhoVento(curso, tas, wdir, wvel, r) {
  // Vetores em escala: proa x TAS (ar), vento (para onde sopra) e o resultado, que segue o curso com a GS
  const k = 150 / Math.max(tas, 1), ox = 190, oy = 196;
  const v = (ang, mag) => [Math.sin(ang * D2R) * mag * k, -Math.cos(ang * D2R) * mag * k];
  // Gira tudo para o curso apontar para cima
  const rot = (p) => { const c = Math.cos(-curso * D2R), s = Math.sin(-curso * D2R); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; };
  const H = rot(v(r.proa, tas)), W = rot(v(wdir + 180, wvel)), G = rot(v(curso, r.gs));
  const P = (p) => `${(ox + p[0]).toFixed(1)} ${(oy + p[1]).toFixed(1)}`;
  const seta = (a, b, cls) => { const ang = Math.atan2(b[1] - a[1], b[0] - a[0]); const t = [b[0] - Math.cos(ang - 0.4) * 9, b[1] - Math.sin(ang - 0.4) * 9], u = [b[0] - Math.cos(ang + 0.4) * 9, b[1] - Math.sin(ang + 0.4) * 9];
    return `<path d="M${P(a)} L${P(b)}" class="${cls}"/><path d="M${P(b)} L${P(t)} L${P(u)}Z" class="${cls} fv-head"/>`; };
  const meio = (a, b, dx = 0, dy = 0) => `${(ox + (a[0] + b[0]) / 2 + dx).toFixed(1)}" y="${(oy + (a[1] + b[1]) / 2 + dy).toFixed(1)}`;
  return `<svg viewBox="0 0 300 210" class="fv-svg" role="img" aria-label="Triângulo de vento">
    <path d="M190 200 V12" class="fv-guide"/><text x="196" y="18" class="fv-small">curso ${rumo(curso)}</text>
    ${seta([0, 0], H, 'fv-air')}${seta(H, G, 'fv-wind')}${seta([0, 0], G, 'fv-gnd')}
    <g class="fv-lbl"><text x="8" y="168" class="fv-air-t">● proa ${rumo(r.proa)} · ${nf(tas)} kt</text><text x="8" y="184" class="fv-wind-t">● vento ${nf(wvel)} kt</text><text x="8" y="200" class="fv-gnd-t">● GS ${nf(r.gs)} kt no curso</text></g>
  </svg>`;
}

// ---------- Hangar H-1 (avião fictício de 4 lugares) ----------
const H1 = { vazio: 720, bVazio: 0.95, mtow: 1150, tanque: 150, kgL: 0.72, consumo: 34, tas: 110,
  est: [['frente', 'Piloto e passageiro da frente', 0.94, 200], ['tras', 'Passageiros de trás', 1.85, 200], ['comb', 'Combustível', 1.22, 150 * 0.72], ['bag', 'Bagagem', 2.45, 50]],
  // Envelope: [braço (m), peso (kg)]
  env: [[0.89, 700], [0.89, 900], [0.98, 1150], [1.20, 1150], [1.20, 700]] };
function limiteDianteiro(p) { return p <= 900 ? 0.89 : 0.89 + (p - 900) / 250 * 0.09; }
function balanco(frente, tras, litros, bag) {
  const comb = litros * H1.kgL;
  const itens = [['Peso vazio', H1.vazio, H1.bVazio], ['Frente', frente, 0.94], ['Trás', tras, 1.85], ['Combustível', comb, 1.22], ['Bagagem', bag, 2.45]];
  const peso = itens.reduce((s, i) => s + i[1], 0), mom = itens.reduce((s, i) => s + i[1] * i[2], 0), cg = mom / peso;
  const prob = [];
  if (peso > H1.mtow) prob.push(`${nf(peso - H1.mtow)} kg acima do peso máximo`);
  if (cg < limiteDianteiro(peso)) prob.push('CG à frente do limite: o nariz fica pesado');
  if (cg > 1.20) prob.push('CG atrás do limite: o avião fica instável');
  if (bag > 50) prob.push('bagagem acima de 50 kg');
  if (litros > H1.tanque) prob.push('combustível acima da capacidade do tanque');
  return { itens, peso, mom, cg, prob };
}
function desenhoEnvelope(b) {
  const X = (m) => 40 + (m - 0.85) / 0.4 * 240, Y = (kg) => 190 - (kg - 650) / 600 * 170;
  const poly = H1.env.map(([m, kg]) => `${X(m).toFixed(1)},${Y(kg).toFixed(1)}`).join(' ');
  const ok = !b.prob.length, px = X(Math.min(1.25, Math.max(0.85, b.cg))), py = Y(Math.min(1250, Math.max(650, b.peso)));
  const ticksX = [0.9, 1.0, 1.1, 1.2].map((m) => `<path d="M${X(m)} 190 v4" class="fv-axis"/><text x="${X(m)}" y="204" text-anchor="middle" class="fv-small">${nf(m, 2)}</text>`).join('');
  const ticksY = [700, 900, 1100].map((kg) => `<path d="M36 ${Y(kg)} h4" class="fv-axis"/><text x="33" y="${Y(kg) + 3}" text-anchor="end" class="fv-small">${kg}</text>`).join('');
  return `<svg viewBox="0 0 300 212" class="fv-svg" role="img" aria-label="Envelope de peso e centro de gravidade">
    <path d="M40 20 V190 H284" class="fv-axis"/>${ticksX}${ticksY}
    <polygon points="${poly}" class="fv-env"/>
    <path d="M40 ${Y(H1.mtow)} H284" class="fv-lim"/><text x="282" y="${Y(H1.mtow) - 4}" text-anchor="end" class="fv-small">peso máximo ${H1.mtow} kg</text>
    <circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="6" class="${ok ? 'fv-pt-ok' : 'fv-pt-bad'}"/>
    <text x="162" y="${Y(780)}" text-anchor="middle" class="fv-small">dentro dos limites</text>
    <text x="160" y="16" text-anchor="middle" class="fv-small">peso (kg) x posição do CG (m)</text>
  </svg>`;
}

// ---------- Exercícios ----------
const EXS = [
  { q: 'Curso 090°, vento de 040° com 20 kt, TAS 100 kt. Qual a proa, em graus?', r: () => triangulo(90, 100, 40, 20).proa, tol: 2,
    sol: 'O vento vem da esquerda e da frente, então a proa vai para a esquerda: correção de cerca de 9°, proa 081°.', calc: 'vento' },
  { q: 'No mesmo voo (curso 090°, vento 040°/20, TAS 100), qual a velocidade no solo (GS), em kt?', r: () => triangulo(90, 100, 40, 20).gs, tol: 2,
    sol: 'Parte do vento é de frente: a GS cai para cerca de 86 kt.', calc: 'vento' },
  { q: 'Pista 09 (090°), vento 130° com 20 kt. Qual o vento cruzado, em kt?', r: () => 20 * Math.sin(40 * D2R), tol: 1,
    sol: '40° de diferença: 20 x sen 40° ≈ 13 kt de través. Regra prática: 40° ≈ 2/3 do vento.', calc: 'pista' },
  { q: 'Voo de 180 NM com GS 120 kt e consumo de 34 L/h, VFR de dia. Quantos litros no mínimo, com a reserva?', r: () => 1.5 * 34 + 0.5 * 34, tol: 2,
    sol: '180 / 120 = 1,5 h de voo: 51 L. Reserva VFR diurna de 30 min: 17 L. Total: 68 L (sem contar o táxi).', calc: 'comb' },
  { q: 'Elevação 3000 ft, QNH 1003 hPa, temperatura 30 °C. Qual a altitude-densidade, em ft (arredonde)?', r: () => { const pa = 3000 + (1013 - 1003) * 30; return pa + 120 * (30 - (15 - 2 * pa / 1000)); }, tol: 150,
    sol: 'Altitude-pressão: 3000 + 10 x 30 = 3300 ft. ISA ali: 15 - 6,6 = 8,4 °C. Diferença: 21,6 °C x 120 = 2592 ft. Altitude-densidade ≈ 5900 ft.', calc: 'dens' },
  { q: 'H-1 com 160 kg na frente, 0 atrás, 100 L de combustível e 20 kg de bagagem. Qual o CG, em metros (2 casas)?', r: () => balanco(160, 0, 100, 20).cg, tol: 0.01,
    sol: 'Peso total 972 kg e momento 971,2 kg·m: CG = 971,2 / 972 ≈ 1,00 m. Dentro dos limites (de 0,92 a 1,20 m nesse peso).', calc: 'peso' },
];
let ex = 0;
function mostrarEx() {
  const e = EXS[ex];
  $('#fvExN').textContent = `Exercício ${ex + 1} de ${EXS.length}`;
  $('#fvExQ').textContent = e.q; $('#fvExIn').value = ''; $('#fvExFb').hidden = true;
  $('#fvExPrev').disabled = ex === 0; $('#fvExNext').disabled = ex === EXS.length - 1;
}
function conferir() {
  const e = EXS[ex], v = num('#fvExIn'), certo = e.r(), ok = Math.abs(v - certo) <= e.tol, fb = $('#fvExFb');
  fb.hidden = false; fb.className = 'fv-fb ' + (ok ? 'is-ok' : 'is-bad');
  fb.innerHTML = Number.isNaN(v) ? 'Digite um número.' : `<b>${ok ? 'Certo!' : `Resposta: ${nf(certo, e.tol < 0.1 ? 2 : 0)}.`}</b> ${e.sol}`;
}

// ---------- Interface ----------
function calcular() {
  // Vento
  const c = num('#fvCurso'), t = num('#fvTas'), wd = num('#fvWd'), wv = num('#fvWv'), r = triangulo(c, t, wd, wv);
  if (r && t > 0) {
    const lado = r.wca > 0.5 ? "à direita" : "à esquerda";
    $('#fvVentoRes').innerHTML = `<div><span>Correção ${Math.abs(r.wca) > 0.5 ? lado : ''}</span><b>${nf(Math.abs(r.wca))}°</b></div><div><span>Proa</span><b>${rumo(r.proa)}</b></div><div><span>Velocidade no solo</span><b>${nf(r.gs)} kt</b></div>`;
    $('#fvVentoSvg').innerHTML = desenhoVento(c, t, wd, wv, r);
  } else { $('#fvVentoRes').innerHTML = '<p class="small">O vento lateral é mais forte que a velocidade do avião: não há proa possível.</p>'; $('#fvVentoSvg').innerHTML = ''; }
  // Vento na pista
  const pista = num('#fvPista') * 10, pd = num('#fvPwd'), pv = num('#fvPwv'), ang = (pd - pista) * D2R;
  const frente = pv * Math.cos(ang), trav = pv * Math.sin(ang);
  $('#fvPistaRes').innerHTML = `<div><span>${frente >= 0 ? 'De frente' : 'De cauda'}</span><b>${nf(Math.abs(frente))} kt</b></div><div><span>Través ${trav >= 0 ? '(da direita)' : '(da esquerda)'}</span><b>${nf(Math.abs(trav))} kt</b></div>
    <p class="small fv-note">${Math.abs(trav) > 15 ? 'Acima de 15 kt de través: limite demonstrado do H-1. Procure outra pista.' : frente < -0.5 ? 'Vento de cauda aumenta a corrida: prefira a cabeceira oposta.' : 'Dentro do limite de 15 kt de través do H-1.'}</p>`;
  // Combustível
  const dist = num('#fvDist'), gs = num('#fvGs'), cons = num('#fvCons'), tipo = $('#fvTipo').value, alt = num('#fvAlt');
  const hViagem = dist / gs, lViagem = hViagem * cons, hAlt = tipo === 'ifr' ? alt / gs : 0, lAlt = hAlt * cons;
  const minRes = tipo === 'dia' ? 30 : 45, lRes = minRes / 60 * cons, taxi = 5, total = lViagem + lAlt + lRes + taxi;
  $('#fvAltWrap').hidden = tipo !== 'ifr';
  $('#fvCombRes').innerHTML = `<table class="fv-tab"><tr><td>Táxi e decolagem</td><td>${nf(taxi)} L</td></tr>
    <tr><td>Viagem (${hm(hViagem)})</td><td>${nf(lViagem)} L</td></tr>
    ${tipo === 'ifr' ? `<tr><td>Até a alternativa (${hm(hAlt)})</td><td>${nf(lAlt)} L</td></tr>` : ''}
    <tr><td>Reserva (${minRes} min)</td><td>${nf(lRes)} L</td></tr>
    <tr class="fv-tot"><td>Mínimo a bordo</td><td>${nf(total)} L · ${nf(total * H1.kgL)} kg</td></tr></table>
    <p class="small fv-note ${total > H1.tanque ? 'is-bad' : ''}">${total > H1.tanque ? `Não cabe: o tanque do H-1 leva ${H1.tanque} L. Planeje uma parada para abastecer.` : `Cabe no tanque do H-1 (${H1.tanque} L), sobrando ${nf(H1.tanque - total)} L.`}</p>`;
  // Peso e balanceamento
  const b = balanco(num('#fvFrente'), num('#fvTras'), num('#fvLitros'), num('#fvBag'));
  $('#fvPesoRes').innerHTML = `<table class="fv-tab"><tr><th>Item</th><th>kg</th><th>braço</th><th>momento</th></tr>${b.itens.map(([n, kg, br]) => `<tr><td>${n}</td><td>${nf(kg)}</td><td>${nf(br, 2)}</td><td>${nf(kg * br, 1)}</td></tr>`).join('')}
    <tr class="fv-tot"><td>Total</td><td>${nf(b.peso)}</td><td>${nf(b.cg, 3)}</td><td>${nf(b.mom, 1)}</td></tr></table>
    <p class="fv-status ${b.prob.length ? 'is-bad' : 'is-ok'}">${b.prob.length ? 'Fora dos limites: ' + b.prob.join('; ') + '.' : `Dentro dos limites. CG em ${nf(b.cg, 3)} m, peso ${nf(b.peso)} kg.`}</p>`;
  $('#fvPesoSvg').innerHTML = desenhoEnvelope(b);
  // Altitude-densidade
  const el = num('#fvElev'), qnh = num('#fvQnh'), oat = num('#fvOat'), pa = el + (1013 - qnh) * 30, isa = 15 - 2 * pa / 1000, da = pa + 120 * (oat - isa);
  const corrida = 280 * (1 + 0.1 * Math.max(0, da) / 1000);
  $('#fvDensRes').innerHTML = `<div><span>Altitude-pressão</span><b>${nf(pa)} ft</b></div><div><span>Temperatura ISA</span><b>${nf(isa, 1)} °C</b></div><div><span>Altitude-densidade</span><b>${nf(da)} ft</b></div>
    <p class="small fv-note">O avião se comporta como se estivesse a ${nf(Math.round(da / 100) * 100)} ft. Corrida de decolagem do H-1 no peso máximo: cerca de ${nf(Math.round(corrida / 10) * 10)} m (280 m ao nível do mar; regra prática: +10% a cada 1000 ft de altitude-densidade).</p>`;
}
const CONV = [['kt', 'km/h', 1.852], ['NM', 'km', 1.852], ['ft', 'm', 0.3048], ['L', 'gal (EUA)', 1 / 3.785], ['kg', 'lb', 2.2046], ['hPa', 'inHg', 1 / 33.8639]];
function converter() {
  const v = num('#fvConvV'), i = +$('#fvConvU').value, [a, b, k] = CONV[i];
  $('#fvConvRes').innerHTML = Number.isNaN(v) ? '' : `<b>${nf(v, 2)} ${a}</b> = <b>${nf(v * k, 2)} ${b}</b> · <b>${nf(v, 2)} ${b}</b> = <b>${nf(v / k, 2)} ${a}</b>`;
  const c = num('#fvTempC'); $('#fvTempRes').textContent = Number.isNaN(c) ? '' : `${nf(c, 1)} °C = ${nf(c * 9 / 5 + 32, 1)} °F`;
}
let pronto = false;
function init() {
  if (!$('#fvCurso') || pronto) return; pronto = true;
  $('#view-plano').addEventListener('input', (e) => { if (e.target.closest('.fv-conv')) converter(); else if (!e.target.closest('.fv-ex')) calcular(); });
  $('#fvTipo').addEventListener('change', calcular);
  $('#fvConvU').innerHTML = CONV.map(([a, b], i) => `<option value="${i}">${a} ↔ ${b}</option>`).join('');
  $('#fvConvU').addEventListener('change', converter);
  $('#fvLevar').addEventListener('click', () => {
    const tipo = $('#fvTipo').value, cons = num('#fvCons'), gs = num('#fvGs');
    const total = num('#fvDist') / gs * cons + (tipo === 'ifr' ? num('#fvAlt') / gs * cons : 0) + (tipo === 'dia' ? 0.5 : 0.75) * cons + 5;
    $('#fvLitros').value = Math.min(H1.tanque, Math.ceil(total)); calcular();
    $('#fvPesoCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  $('#fvExOk').addEventListener('click', conferir);
  $('#fvExIn').addEventListener('keydown', (e) => { if (e.key === 'Enter') conferir(); });
  $('#fvExPrev').addEventListener('click', () => { if (ex > 0) { ex--; mostrarEx(); } });
  $('#fvExNext').addEventListener('click', () => { if (ex < EXS.length - 1) { ex++; mostrarEx(); } });
  $('#fvExIr').addEventListener('click', () => { const id = { vento: 'fvVentoCard', pista: 'fvPistaCard', comb: 'fvCombCard', dens: 'fvDensCard', peso: 'fvPesoCard' }[EXS[ex].calc]; $('#' + id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  calcular(); converter(); mostrarEx();
}
window.Plano = { init, start: init, triangulo, balanco };
})();
