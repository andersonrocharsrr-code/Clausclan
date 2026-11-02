/* Navegação por instrumentos: simulador com mapa visto de cima e quatro instrumentos (VOR/CDI, HSI, ADF e ILS),
   comandos de proa, OBS e razão de descida, e missões com verificação automática. Tudo desenhado no app. */
(() => {
'use strict';
const $ = (s) => document.querySelector(s);
const D2R = Math.PI / 180;
const n360 = (a) => ((a % 360) + 360) % 360;
const n180 = (a) => { a = n360(a); return a > 180 ? a - 360 : a; };
const rumo = (a) => String(Math.round(n360(a)) || 360).padStart(3, '0');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ---------- Missões ----------
// Estação em (0, 0). Coordenadas em NM: x para leste, y para norte. Para simplificar, norte magnético = verdadeiro.
const MISSOES = [
  { id: 'livre', nome: 'Voo livre', modo: 'cdi', start: { x: -10, y: -8, hdg: 45, obs: 90 },
    brief: 'Voe à vontade. Gire o OBS e veja a agulha e a bandeira TO/FROM mudarem conforme a posição do avião no mapa.' },
  { id: 'r060', nome: 'Afastar na radial 060', modo: 'cdi', start: { x: -6, y: -12, hdg: 360, obs: 360 },
    brief: 'Coloque 060 no OBS e intercepte a radial 060, se afastando do VOR (bandeira FROM). Dica: com a agulha toda para um lado, curve uns 45° para o lado da agulha.',
    ok: (s) => s.obs === 60 && s.from && Math.abs(s.dev) < 2 && Math.abs(n180(s.hdg - 60)) < 15 },
  { id: 'r270', nome: 'Ir ao VOR pela radial 270', modo: 'hsi', start: { x: -22, y: 8, hdg: 180, obs: 360 },
    brief: 'Você está a oeste do VOR. Coloque 090 no curso e siga para a estação pela radial 270 (bandeira TO). No HSI, a seta do curso e a barra mostram onde está a linha.',
    ok: (s) => s.obs === 90 && !s.from && Math.abs(s.dev) < 2 && Math.abs(n180(s.hdg - 90)) < 15 },
  { id: 'ndb', nome: 'ADF: direto para o NDB', modo: 'adf', start: { x: 12, y: -14, hdg: 270, obs: 0 },
    brief: 'Curve até a agulha do ADF ficar apontada para o nariz (0°): aí o avião está indo direto para o NDB.',
    ok: (s) => Math.abs(s.rel) < 4 },
  { id: 'qdm', nome: 'ADF: interceptar o QDM 360', modo: 'adf', start: { x: -7, y: -15, hdg: 90, obs: 0 },
    brief: 'Chegue ao NDB vindo do sul, voando 360° com a agulha no nariz. Proa do avião + marcação relativa = rumo para a estação (QDM): quando der 360 e você estiver voando 360, está na linha.',
    ok: (s) => Math.abs(n180(s.qdm - 360)) < 3 && Math.abs(n180(s.hdg - 360)) < 10 },
  { id: 'ils', nome: 'ILS até os mínimos', modo: 'ils', start: { x: -11, y: 2.2, hdg: 120, obs: 90, alt: 2600 },
    brief: 'Pista 09 (curso 090°). Intercepte o localizador, nivelado a 2600 ft. Quando a rampa (losango da direita) chegar ao centro, comece a descer: cerca de 600 ft/min a 120 kt. Chegue a 200 ft com as duas agulhas a menos de dois pontos do centro.',
    ok: (s) => Math.abs(s.loc) < 0.4 && Math.abs(s.gs) < 0.4 },
];

// ---------- Estado ----------
let M = MISSOES[0], st = null, raf = 0, last = 0, okT = 0, fim = '', mapa = true, active = () => false;
const TAS = 120, ACEL = 15; // nós; o tempo corre 15 vezes mais rápido para o voo não demorar
function reset() {
  const s = M.start; fim = ''; okT = 0;
  st = { x: s.x, y: s.y, hdg: s.hdg, alvo: s.hdg, obs: s.obs, alt: s.alt || 3000, vs: 0, trilha: [] };
  $('#nvBrief').textContent = M.brief;
  $('#nvStatus').textContent = ''; $('#nvStatus').className = 'nv-status';
  document.querySelectorAll('#nvModo [data-m]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.m === M.modo)));
  $('#nvVs').hidden = M.modo !== 'ils'; $('#nvObsBox').hidden = M.modo === 'adf';
  ler();
}

// Leituras dos instrumentos a partir da posição
function leituras() {
  const { x, y, hdg, obs, alt } = st;
  const radial = n360(Math.atan2(x, y) / D2R), dist = Math.hypot(x, y);
  const d = n180(radial - obs), from = Math.abs(d) <= 90;
  const dev = from ? -d : n180(radial - (obs + 180)); // + = a linha está à direita
  const brg = n360(radial + 180), rel = n180(brg - hdg), qdm = n360(hdg + rel);
  // ILS: localizador na ponta da pista (1,2 NM a leste da cabeceira), rampa de 3° a partir da cabeceira
  const locAng = Math.atan2(y, 1.2 - x) / D2R; // ângulo visto da antena; + = avião ao norte do eixo
  const loc = clamp(locAng / 2.5, -1.2, 1.2); // + = eixo à direita (1 = fundo de escala, 2,5°)
  const ftDist = Math.max(0.01, -x) * 6076, gsAng = Math.atan2(alt, ftDist) / D2R;
  const gs = clamp((3 - gsAng) / 0.7, -1.2, 1.2); // + = rampa acima do avião (1 = fundo de escala, 0,7°)
  return { radial, dist, from, dev: clamp(dev, -12, 12), rawDev: dev, brg, rel, qdm, loc, gs, hdg, obs, alt, cone: dist < 0.6, flag: Math.abs(d) > 80 && Math.abs(d) < 100 };
}
let L = null;
function ler() { L = leituras(); }

// ---------- Simulação ----------
function passo(dt) {
  const s = st, t = dt * ACEL;
  const dif = n180(s.alvo - s.hdg), taxa = 3 * t; // curva padrão: 3° por segundo
  s.hdg = Math.abs(dif) <= taxa ? s.alvo : n360(s.hdg + Math.sign(dif) * taxa);
  const v = TAS / 3600 * t;
  s.x += Math.sin(s.hdg * D2R) * v; s.y += Math.cos(s.hdg * D2R) * v;
  if (M.modo === 'ils') s.alt = Math.max(0, s.alt + s.vs / 60 * t);
  if (!s.trilha.length || Math.hypot(s.x - s.trilha.at(-1)[0], s.y - s.trilha.at(-1)[1]) > 0.3) { s.trilha.push([s.x, s.y]); if (s.trilha.length > 400) s.trilha.shift(); }
  ler();
  // Missão
  if (M.ok && !fim) {
    const cond = M.ok({ ...L, obs: Math.round(n360(s.obs)), hdg: s.hdg, alt: s.alt });
    if (M.id === 'ils') { if (s.alt <= 200 || s.x > -0.3) fim = cond && s.alt <= 200 ? 'ok' : 'bad'; }
    else { okT = cond ? okT + dt : 0; if (okT > 2.5) fim = 'ok'; }
    if (Math.hypot(s.x, s.y) > 45) fim = 'bad';
    if (fim) mostrarFim();
  }
}
function mostrarFim() {
  const el = $('#nvStatus');
  el.className = 'nv-status ' + (fim === 'ok' ? 'is-ok' : 'is-bad');
  el.textContent = fim === 'ok' ? 'Missão cumprida! Os instrumentos mostram que o avião está exatamente onde devia.' :
    M.id === 'ils' ? 'Chegou aos mínimos fora do eixo ou da rampa: arremeta e tente de novo.' : 'O avião se afastou demais. Tente de novo.';
}

// ---------- Desenho ----------
function prep(cv) {
  const d = Math.min(2, window.devicePixelRatio || 1), w = cv.clientWidth || 300, h = cv.clientHeight || w;
  if (cv.width !== Math.round(w * d)) { cv.width = Math.round(w * d); cv.height = Math.round(h * d); }
  const c = cv.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0); return { c, w, h };
}
const COR = { fundo: '#0b1117', linha: '#2a3742', branco: '#f2f5f7', mag: '#f06aae', verde: '#5fc48a', ciano: '#56d0e8', amar: '#ffd23f', cinza: '#7b8a96' };
function desenharMapa() {
  const { c, w, h } = prep($('#nvMapa'));
  c.fillStyle = COR.fundo; c.fillRect(0, 0, w, h);
  if (!mapa) { c.fillStyle = COR.cinza; c.font = '600 13px system-ui'; c.textAlign = 'center'; c.fillText('Mapa escondido: voe só pelos instrumentos', w / 2, h / 2); return; }
  const ils = M.modo === 'ils', esc = (ils ? Math.min(w, h) / 30 : Math.min(w, h) / 64), cx = ils ? w * 0.72 : w / 2, cy = h / 2;
  const P = (x, y) => [cx + x * esc, cy - y * esc];
  // Grade de 5 NM
  c.strokeStyle = 'rgba(255,255,255,.05)'; c.lineWidth = 1;
  for (let g = -60; g <= 60; g += 5) { const [a] = P(g, 0), [, b] = P(0, g); c.beginPath(); c.moveTo(a, 0); c.lineTo(a, h); c.moveTo(0, b); c.lineTo(w, b); c.stroke(); }
  if (ils) {
    // Pista 09 e o eixo do localizador
    const [x0, y0] = P(0, 0), [x1] = P(1.2, 0);
    c.strokeStyle = 'rgba(86,208,232,.5)'; c.setLineDash([6, 5]); c.beginPath(); c.moveTo(x0, y0); c.lineTo(0, y0); c.stroke(); c.setLineDash([]);
    c.fillStyle = '#9aa6b1'; c.fillRect(x0, y0 - 3, x1 - x0, 6);
    c.fillStyle = COR.cinza; c.font = '600 11px system-ui'; c.fillText('RWY 09', x0, y0 + 18);
  } else {
    // Linha do curso selecionado (radial) e a estação
    if (M.modo !== 'adf') {
      const o = st.obs * D2R, [sx, sy] = P(0, 0), R = 80;
      c.strokeStyle = 'rgba(240,106,174,.55)'; c.setLineDash([6, 5]); c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(sx - Math.sin(o) * R * esc, sy + Math.cos(o) * R * esc); c.lineTo(sx + Math.sin(o) * R * esc, sy - Math.cos(o) * R * esc); c.stroke(); c.setLineDash([]);
      const [lx, ly] = P(Math.sin(o) * 22, Math.cos(o) * 22);
      c.fillStyle = COR.mag; c.font = '700 11px system-ui'; c.textAlign = 'center'; c.fillText(`R-${rumo(st.obs)}`, lx, ly);
    }
    const [sx, sy] = P(0, 0);
    c.strokeStyle = M.modo === 'adf' ? COR.amar : COR.ciano; c.lineWidth = 1.6;
    if (M.modo === 'adf') { for (let r = 3; r <= 9; r += 3) { c.beginPath(); c.arc(sx, sy, r, 0, 7); c.stroke(); } }
    else { c.beginPath(); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; c[i ? 'lineTo' : 'moveTo'](sx + Math.cos(a) * 8, sy + Math.sin(a) * 8); } c.closePath(); c.stroke(); c.beginPath(); c.arc(sx, sy, 1.5, 0, 7); c.stroke(); }
    c.fillStyle = c.strokeStyle; c.font = '700 11px system-ui'; c.textAlign = 'left'; c.fillText(M.modo === 'adf' ? 'NDB' : 'VOR', sx + 12, sy + 4);
  }
  // Trilha e avião
  c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1.2; c.beginPath();
  st.trilha.forEach(([x, y], i) => { const [a, b] = P(x, y); c[i ? 'lineTo' : 'moveTo'](a, b); }); c.stroke();
  const [ax, ay] = P(st.x, st.y);
  c.save(); c.translate(ax, ay); c.rotate(st.hdg * D2R); c.fillStyle = COR.amar;
  c.beginPath(); c.moveTo(0, -9); c.lineTo(2, -2); c.lineTo(9, 2); c.lineTo(2, 2); c.lineTo(1.5, 6); c.lineTo(4, 8); c.lineTo(-4, 8); c.lineTo(-1.5, 6); c.lineTo(-2, 2); c.lineTo(-9, 2); c.lineTo(-2, -2); c.closePath(); c.fill(); c.restore();
  c.fillStyle = COR.cinza; c.font = '600 10px system-ui'; c.textAlign = 'left'; c.fillText('N ↑   grade de 5 NM', 8, h - 8);
}
function rosa(c, cx, cy, R, hdg, rotar) {
  // Rosa dos ventos: gira com a proa (HSI e ADF de cartão móvel) ou fica parada com o norte em cima
  c.save(); c.translate(cx, cy); if (rotar) c.rotate(-hdg * D2R);
  c.strokeStyle = COR.branco; c.fillStyle = COR.branco; c.textAlign = 'center'; c.textBaseline = 'middle';
  for (let a = 0; a < 360; a += 5) {
    const L = a % 30 === 0 ? 11 : a % 10 === 0 ? 8 : 5; c.lineWidth = a % 10 === 0 ? 1.6 : 1;
    c.beginPath(); c.moveTo(Math.sin(a * D2R) * R, -Math.cos(a * D2R) * R); c.lineTo(Math.sin(a * D2R) * (R - L), -Math.cos(a * D2R) * (R - L)); c.stroke();
    if (a % 30 === 0) { c.save(); c.translate(Math.sin(a * D2R) * (R - 21), -Math.cos(a * D2R) * (R - 21)); c.rotate(a * D2R); c.font = `700 ${a % 90 ? 12 : 14}px system-ui`; c.fillText(a % 90 ? String(a / 10) : 'NESW'[a / 90], 0, 0); c.restore(); }
  }
  c.restore();
}
function moldura(c, w, h) {
  const R = Math.min(w, h) / 2 - 4, cx = w / 2, cy = h / 2;
  c.fillStyle = '#1b232b'; c.fillRect(0, 0, w, h);
  c.fillStyle = '#05080b'; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.fill();
  c.strokeStyle = '#3a4652'; c.lineWidth = 3; c.stroke();
  return { R: R - 6, cx, cy };
}
function pontos(c, cx, cy, esp, vertical) {
  c.strokeStyle = COR.branco; c.lineWidth = 1.5;
  for (let i = -5; i <= 5; i++) { if (!i) continue; const p = i * esp; c.beginPath(); c.arc(vertical ? cx : cx + p, vertical ? cy + p : cy, 3, 0, 7); c.stroke(); }
}
function desenharInstrumento() {
  const { c, w, h } = prep($('#nvInst')), { R, cx, cy } = moldura(c, w, h), m = M.modo;
  if (m === 'cdi') {
    // OBS: o curso selecionado fica no topo (a rosa gira com o botão)
    c.save(); c.translate(cx, cy); c.rotate(-st.obs * D2R); rosa(c, 0, 0, R, 0, false); c.restore();
    c.fillStyle = '#05080b'; c.beginPath(); c.arc(cx, cy, R - 30, 0, 7); c.fill();
    c.fillStyle = COR.amar; c.beginPath(); c.moveTo(cx, cy - R + 1); c.lineTo(cx - 6, cy - R - 8); c.lineTo(cx + 6, cy - R - 8); c.closePath(); c.fill();
    const esp = (R - 40) / 5.5; pontos(c, cx, cy + 22, esp, false);
    // Agulha: 2° por ponto, 10° de fundo de escala
    const off = L.cone ? Math.sin(performance.now() / 300) * 3 : clamp(L.dev / 2, -5, 5);
    c.strokeStyle = COR.branco; c.lineWidth = 3.5; c.beginPath(); c.moveTo(cx + off * esp, cy - R * 0.55); c.lineTo(cx + off * esp, cy + R * 0.6); c.stroke();
    c.beginPath(); c.arc(cx, cy + 22, 6, 0, 7); c.stroke();
    // Bandeira TO/FROM
    const txt = L.cone || L.flag ? 'OFF' : L.from ? 'FROM' : 'TO';
    c.fillStyle = txt === 'OFF' ? '#d9342b' : '#e9edf0'; c.fillRect(cx + 16, cy - 30, 46, 20);
    c.fillStyle = txt === 'OFF' ? '#fff' : '#111'; c.font = '800 12px system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, cx + 39, cy - 20);
    c.fillStyle = COR.amar; c.font = '800 13px system-ui'; c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.fillText(`OBS ${rumo(st.obs)}`, 8, h - 10);
  } else if (m === 'hsi') {
    rosa(c, cx, cy, R, st.hdg, true);
    c.fillStyle = COR.amar; c.beginPath(); c.moveTo(cx, cy - R + 1); c.lineTo(cx - 6, cy - R - 8); c.lineTo(cx + 6, cy - R - 8); c.closePath(); c.fill();
    c.save(); c.translate(cx, cy); c.rotate((st.obs - st.hdg) * D2R);
    const esp = (R - 44) / 5.5; pontos(c, 0, 0, esp, false);
    c.strokeStyle = COR.mag; c.fillStyle = COR.mag; c.lineWidth = 4;
    c.beginPath(); c.moveTo(0, -R + 26); c.lineTo(0, -R * 0.45); c.moveTo(0, R * 0.45); c.lineTo(0, R - 26); c.stroke();
    c.beginPath(); c.moveTo(0, -R + 20); c.lineTo(-7, -R + 32); c.lineTo(7, -R + 32); c.closePath(); c.fill();
    const off = L.cone ? 0 : clamp(L.dev / 2, -5, 5) * esp;
    c.beginPath(); c.moveTo(off, -R * 0.42); c.lineTo(off, R * 0.42); c.stroke();
    // TO/FROM: triângulo apontando para a estação
    c.fillStyle = COR.branco; const tf = L.from ? 1 : -1; c.beginPath(); c.moveTo(18, tf * 22); c.lineTo(12, tf * 12); c.lineTo(24, tf * 12); c.closePath(); c.fill();
    c.restore();
    c.save(); c.translate(cx, cy); c.fillStyle = COR.amar;
    c.beginPath(); c.moveTo(0, -12); c.lineTo(3, 0); c.lineTo(12, 4); c.lineTo(3, 5); c.lineTo(2, 10); c.lineTo(-2, 10); c.lineTo(-3, 5); c.lineTo(-12, 4); c.lineTo(-3, 0); c.closePath(); c.fill(); c.restore();
    c.fillStyle = COR.mag; c.font = '800 13px system-ui'; c.textAlign = 'left'; c.fillText(`CRS ${rumo(st.obs)}`, 8, 18);
    c.fillStyle = COR.branco; c.textAlign = 'right'; c.fillText(`HDG ${rumo(st.hdg)}`, w - 8, 18);
    c.textAlign = 'left'; c.fillStyle = COR.cinza; c.font = '700 12px system-ui'; c.fillText(L.cone ? '' : L.from ? 'FROM' : 'TO', 8, h - 10);
  } else if (m === 'adf') {
    // ADF de cartão fixo: 0 sempre no nariz, a agulha mostra a marcação relativa
    rosa(c, cx, cy, R, 0, false);
    c.save(); c.translate(cx, cy); c.rotate(L.rel * D2R); c.strokeStyle = COR.amar; c.fillStyle = COR.amar; c.lineWidth = 4;
    c.beginPath(); c.moveTo(0, R * 0.62); c.lineTo(0, -R * 0.62); c.stroke();
    c.beginPath(); c.moveTo(0, -R * 0.78); c.lineTo(-9, -R * 0.6); c.lineTo(9, -R * 0.6); c.closePath(); c.fill(); c.restore();
    c.fillStyle = COR.branco; c.beginPath(); c.arc(cx, cy, 5, 0, 7); c.fill();
    c.fillStyle = COR.cinza; c.font = '700 12px system-ui'; c.textAlign = 'left'; c.fillText('ADF · cartão fixo', 8, 18);
    c.textAlign = 'right'; c.fillStyle = COR.branco; c.fillText(`MR ${rumo(L.rel)}`, w - 8, 18);
  } else {
    // ILS: agulha vertical = localizador (2,5° de fundo de escala); horizontal = rampa (0,7°)
    rosa(c, cx, cy, R, st.hdg, true);
    c.fillStyle = 'rgba(5,8,11,.85)'; c.beginPath(); c.arc(cx, cy, R - 26, 0, 7); c.fill();
    const esp = (R - 40) / 5.5;
    pontos(c, cx, cy, esp, false); pontos(c, cx, cy, esp, true);
    c.strokeStyle = COR.verde; c.lineWidth = 4;
    const lx = cx + clamp(L.loc, -1, 1) * 5 * esp, gy = cy - clamp(L.gs, -1, 1) * 5 * esp, len = R * 0.55;
    c.beginPath(); c.moveTo(lx, cy - len); c.lineTo(lx, cy + len); c.stroke();
    c.beginPath(); c.moveTo(cx - len, gy); c.lineTo(cx + len, gy); c.stroke();
    c.strokeStyle = COR.amar; c.lineWidth = 3; c.beginPath(); c.moveTo(cx - 22, cy); c.lineTo(cx - 7, cy); c.moveTo(cx + 7, cy); c.lineTo(cx + 22, cy); c.stroke();
    c.font = '800 13px system-ui'; c.fillStyle = COR.verde; c.textAlign = 'left'; c.fillText('ILS 090°', 8, 18);
    c.fillStyle = COR.branco; c.textAlign = 'right'; c.fillText(`${Math.round(st.alt)} ft`, w - 8, 18);
    c.fillText(`${st.vs > 0 ? '+' : ''}${st.vs} ft/min`, w - 8, h - 10);
    c.textAlign = 'left'; c.fillText(`${Math.max(0, -st.x).toFixed(1)} NM`, 8, h - 10);
  }
}
function painel() {
  $('#nvHdg').textContent = rumo(st.alvo);
  $('#nvObs').textContent = rumo(st.obs);
  $('#nvLeit').innerHTML = M.modo === 'adf'
    ? `<span>Proa <b>${rumo(st.hdg)}</b></span><span>Relativa <b>${rumo(L.rel)}</b></span><span>Para o NDB <b>${rumo(L.qdm)}</b></span><span>Distância <b>${L.dist.toFixed(1)} NM</b></span>`
    : M.modo === 'ils'
      ? `<span>Proa <b>${rumo(st.hdg)}</b></span><span>Altitude <b>${Math.round(st.alt)} ft</b></span><span>Rampa a <b>${Math.round(Math.max(0, -st.x) * 318)} ft</b></span><span>Cabeceira <b>${Math.max(0, -st.x).toFixed(1)} NM</b></span>`
      : `<span>Proa <b>${rumo(st.hdg)}</b></span><span>Radial atual <b>${rumo(L.radial)}</b></span><span>Distância <b>${L.dist.toFixed(1)} NM</b></span><span>Desvio <b>${L.cone ? '–' : Math.abs(L.rawDev).toFixed(0) + '°'}</b></span>`;
  $('#nvExpl').innerHTML = EXPL[M.modo];
}
const EXPL = {
  cdi: '<b>VOR e CDI.</b> O VOR transmite 360 radiais, como raios de uma roda. Gire o OBS para escolher uma. A agulha mostra para que lado está a linha: cada ponto é 2°, e a agulha toda para um lado é 10° ou mais. TO quer dizer que seguir aquele curso leva <i>para</i> a estação; FROM, que afasta dela. Regra de ouro: com TO/FROM e o curso parecidos com a proa, voe <i>em direção</i> à agulha.',
  hsi: '<b>HSI.</b> É o VOR montado sobre uma bússola que gira com o avião. A seta rosa é o curso e a barra do meio é a linha: o desenho mostra de cima onde ela está em relação ao avião. Por isso é muito mais fácil de ler que o CDI.',
  adf: '<b>ADF e NDB.</b> A agulha aponta sempre para a estação. O 0 é o nariz: com a agulha no 0, o avião vai direto para o NDB. Proa + marcação relativa (MR) = rumo para a estação (QDM). Com vento, o avião vai derivando e a agulha sai do nariz aos poucos.',
  ils: '<b>ILS.</b> A agulha vertical é o localizador (esquerda e direita) e a horizontal é a rampa de 3° (subir e descer). Cada ponto do localizador vale 0,5° e o da rampa cerca de 0,14°: muito mais sensível que o VOR. Voe em direção às agulhas, com correções pequenas.',
};
function frame(t) {
  if (!active()) { raf = 0; return; }
  const dt = Math.min(0.1, (t - (last || t)) / 1000); last = t;
  if (!fim) passo(dt);
  desenharMapa(); desenharInstrumento(); painel();
  raf = requestAnimationFrame(frame);
}
function start() { if (!st) reset(); if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
let pronto = false;
function init(opts) {
  if (!$('#nvMapa') || pronto) return; pronto = true; active = opts?.active || (() => !$('#view-nav').hidden);
  $('#nvMis').innerHTML = MISSOES.map((m, i) => `<option value="${i}">${i ? `Missão ${i} · ` : ''}${m.nome}</option>`).join('');
  $('#nvMis').addEventListener('change', (e) => { M = MISSOES[+e.target.value]; reset(); });
  $('#nvModo').addEventListener('click', (e) => { const b = e.target.closest('[data-m]'); if (!b || M.id !== 'livre') return; M = { ...M, modo: b.dataset.m }; $('#nvVs').hidden = M.modo !== 'ils'; $('#nvObsBox').hidden = M.modo === 'adf'; if (M.modo === 'ils') { st.x = -11; st.y = 2.2; st.hdg = st.alvo = 120; st.alt = 2600; st.trilha = []; } document.querySelectorAll('#nvModo [data-m]').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); });
  $('#nvCtl').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b || !st) return;
    if (b.dataset.h) st.alvo = n360(st.alvo + +b.dataset.h);
    if (b.dataset.o) st.obs = n360(Math.round(st.obs) + +b.dataset.o);
    if (b.dataset.v !== undefined) { st.vs = +b.dataset.v; document.querySelectorAll('#nvVs [data-v]').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); }
    if (b.id === 'nvReset') reset();
    if (b.id === 'nvMapaBtn') { mapa = !mapa; b.textContent = mapa ? 'Esconder o mapa' : 'Mostrar o mapa'; }
  });
  reset();
}
window.Nav = { init, start, leituras: () => leituras(), _st: () => st };
})();
