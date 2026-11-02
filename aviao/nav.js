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
// ---------- Instrumentos no estilo dos mecânicos de painel (caixa, aro, vidro, botões) ----------
function caixa(c, w) {
  // Caixa quadrada de metal com 4 parafusos
  const g = c.createLinearGradient(0, 0, 0, w); g.addColorStop(0, '#34393e'); g.addColorStop(1, '#1b1e21');
  c.fillStyle = '#0d0f11'; c.fillRect(0, 0, w, w);
  c.fillStyle = g; c.beginPath(); c.roundRect ? c.roundRect(2, 2, w - 4, w - 4, w * 0.06) : c.rect(2, 2, w - 4, w - 4); c.fill();
  for (const [x, y] of [[0.075, 0.075], [0.925, 0.075], [0.075, 0.925], [0.925, 0.925]]) {
    const px = x * w, py = y * w, r = w * 0.028, sg = c.createRadialGradient(px - r * 0.3, py - r * 0.3, 0, px, py, r);
    sg.addColorStop(0, '#8a9097'); sg.addColorStop(1, '#3b4045'); c.fillStyle = sg; c.beginPath(); c.arc(px, py, r, 0, 7); c.fill();
    c.strokeStyle = '#1a1c1e'; c.lineWidth = r * 0.3; c.beginPath(); c.moveTo(px - r * 0.7, py - r * 0.35); c.lineTo(px + r * 0.7, py + r * 0.35); c.stroke();
  }
  // Aro e mostrador
  const cx = w / 2, cy = w / 2, Rb = w * 0.425, R = Rb - w * 0.028;
  const ag = c.createLinearGradient(0, cy - Rb, 0, cy + Rb); ag.addColorStop(0, '#53595f'); ag.addColorStop(0.5, '#202326'); ag.addColorStop(1, '#0c0d0e');
  c.fillStyle = ag; c.beginPath(); c.arc(cx, cy, Rb, 0, 7); c.fill();
  const fg = c.createRadialGradient(cx, cy - R * 0.3, R * 0.1, cx, cy, R); fg.addColorStop(0, '#1b1d1f'); fg.addColorStop(1, '#060607');
  c.fillStyle = fg; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.fill();
  return { cx, cy, R };
}
function vidro(c, cx, cy, R) {
  // Reflexo do vidro e sombra interna do aro
  c.save(); c.beginPath(); c.arc(cx, cy, R, 0, 7); c.clip();
  const sh = c.createRadialGradient(cx, cy, R * 0.82, cx, cy, R); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.55)');
  c.fillStyle = sh; c.fillRect(cx - R, cy - R, R * 2, R * 2);
  const gl = c.createLinearGradient(cx - R, cy - R, cx + R * 0.2, cy + R * 0.2); gl.addColorStop(0, 'rgba(255,255,255,.13)'); gl.addColorStop(0.45, 'rgba(255,255,255,.04)'); gl.addColorStop(0.46, 'rgba(255,255,255,0)');
  c.fillStyle = gl; c.beginPath(); c.ellipse(cx - R * 0.25, cy - R * 0.35, R * 0.95, R * 0.6, -0.6, 0, 7); c.fill();
  c.restore();
}
function botao(c, x, y, r, rotulo, icone) {
  // Botão serrilhado
  c.save(); c.translate(x, y);
  c.fillStyle = '#0a0b0c'; c.beginPath(); c.arc(0, 0, r * 1.08, 0, 7); c.fill();
  const g = c.createRadialGradient(-r * 0.3, -r * 0.35, 0, 0, 0, r); g.addColorStop(0, '#4a4f55'); g.addColorStop(1, '#151719');
  c.fillStyle = g; c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill();
  c.strokeStyle = 'rgba(0,0,0,.6)'; c.lineWidth = 1;
  for (let a = 0; a < 360; a += 12) { c.beginPath(); c.moveTo(Math.cos(a * D2R) * r * 0.78, Math.sin(a * D2R) * r * 0.78); c.lineTo(Math.cos(a * D2R) * r, Math.sin(a * D2R) * r); c.stroke(); }
  if (icone) { c.fillStyle = icone; c.beginPath(); c.moveTo(0, -r * 0.45); c.lineTo(-r * 0.28, r * 0.25); c.lineTo(r * 0.28, r * 0.25); c.closePath(); c.fill(); }
  c.restore();
  c.fillStyle = '#d9dde0'; c.font = `700 ${Math.round(r * 0.55)}px system-ui`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(rotulo, x, y - r * 1.55);
}
function cartao(c, cx, cy, R, giro, fonte) {
  // Rosa dos ventos: marcas a cada 5°, números a cada 30° (N 3 6 E 12 15 S 21 24 W 30 33)
  c.save(); c.translate(cx, cy); c.rotate(-giro * D2R);
  c.strokeStyle = '#f4f4f0'; c.fillStyle = '#f4f4f0'; c.textAlign = 'center'; c.textBaseline = 'middle';
  for (let a = 0; a < 360; a += 5) {
    const L = a % 10 ? R * 0.06 : R * 0.11; c.lineWidth = a % 10 ? 1 : 1.8;
    c.beginPath(); c.moveTo(Math.sin(a * D2R) * R, -Math.cos(a * D2R) * R); c.lineTo(Math.sin(a * D2R) * (R - L), -Math.cos(a * D2R) * (R - L)); c.stroke();
    if (a % 30 === 0) {
      c.save(); c.translate(Math.sin(a * D2R) * (R * 0.75), -Math.cos(a * D2R) * (R * 0.75)); c.rotate(a * D2R);
      c.font = `700 ${Math.round(fonte * (a % 90 ? 0.9 : 1.08))}px "Barlow Condensed", "Arial Narrow", system-ui`; c.fillText(a % 90 ? String(a / 10) : 'NESW'[a / 90], 0, 0); c.restore();
    }
  }
  c.restore();
}
function indice(c, cx, cy, R, cor = '#ff8a1f') {
  // Marca fixa no topo (lubber) e as marcas de 45° no aro
  c.fillStyle = cor; c.beginPath(); c.moveTo(cx, cy - R + R * 0.12); c.lineTo(cx - R * 0.06, cy - R - R * 0.02); c.lineTo(cx + R * 0.06, cy - R - R * 0.02); c.closePath(); c.fill();
}
function bandeira(c, x, y, w, h, txt) {
  // Bandeira de alarme listrada vermelha e branca
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  c.fillStyle = '#e8e8e2'; c.fillRect(x, y, w, h); c.fillStyle = '#d12a20';
  for (let i = -h; i < w + h; i += 10) { c.beginPath(); c.moveTo(x + i, y + h); c.lineTo(x + i + 5, y + h); c.lineTo(x + i + 5 + h, y); c.lineTo(x + i + h, y); c.closePath(); c.fill(); }
  c.restore();
  c.fillStyle = '#111'; c.font = `900 ${Math.round(h * 0.62)}px system-ui`; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.strokeStyle = '#e8e8e2'; c.lineWidth = 3; c.strokeText(txt, x + w / 2, y + h / 2 + 0.5); c.fillText(txt, x + w / 2, y + h / 2 + 0.5);
}
function agulha(c, x0, y0, x1, y1, larg, cor = '#f4f4f0') {
  // Agulha com sombra, como as mecânicas
  c.save(); c.lineCap = 'round';
  c.strokeStyle = 'rgba(0,0,0,.55)'; c.lineWidth = larg + 2; c.beginPath(); c.moveTo(x0 + 2, y0 + 2); c.lineTo(x1 + 2, y1 + 2); c.stroke();
  c.strokeStyle = cor; c.lineWidth = larg; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); c.restore();
}
function pontos(c, cx, cy, esp, n, vertical, r) {
  c.strokeStyle = '#f4f4f0'; c.lineWidth = 1.6;
  for (let i = -n; i <= n; i++) { if (!i) continue; c.beginPath(); c.arc(vertical ? cx : cx + i * esp, vertical ? cy + i * esp : cy, r, 0, 7); c.stroke(); }
}
function toFrom(c, x, y, s, from, off) {
  // Janela TO/FROM do CDI
  c.fillStyle = '#000'; c.fillRect(x - s * 1.3, y - s * 0.75, s * 2.6, s * 1.5);
  c.strokeStyle = '#3a3f44'; c.lineWidth = 1; c.strokeRect(x - s * 1.3, y - s * 0.75, s * 2.6, s * 1.5);
  if (off) return;
  c.fillStyle = '#f4f4f0'; c.font = `800 ${Math.round(s * 0.95)}px system-ui`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(from ? 'FR' : 'TO', x, y + 1);
}
function desenharInstrumento() {
  const cv = $('#nvInst'), { c, w } = prep(cv), { cx, cy, R } = caixa(c, w), m = M.modo, f = R * 0.15;
  const kr = w * 0.062, k1 = [w * 0.105, w * 0.895], k2 = [w * 0.895, w * 0.895];
  if (m === 'cdi' || m === 'ils') {
    // CDI/ILS com cartão de curso que gira pelo OBS; agulha presa no alto; no ILS, a da rampa presa à esquerda
    cartao(c, cx, cy, R * 0.98, st.obs, f); indice(c, cx, cy, R * 0.98, '#f4f4f0');
    c.fillStyle = '#f4f4f0'; c.beginPath(); c.moveTo(cx, cy + R * 0.86); c.lineTo(cx - R * 0.05, cy + R * 0.98); c.lineTo(cx + R * 0.05, cy + R * 0.98); c.closePath(); c.fill();
    c.fillStyle = '#060607'; c.beginPath(); c.arc(cx, cy, R * 0.6, 0, 7); c.fill();
    const esp = R * 0.1; pontos(c, cx, cy, esp, 5, false, R * 0.028);
    c.strokeStyle = '#f4f4f0'; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, R * 0.06, 0, 7); c.stroke();
    if (m === 'ils') pontos(c, cx, cy, esp, 5, true, R * 0.028);
    const sem = L.cone || L.flag;
    const dotsL = m === 'ils' ? clamp(L.loc, -1, 1) * 5 : (L.cone ? Math.sin(performance.now() / 300) * 3 : sem ? 0 : clamp(L.dev / 2, -5, 5));
    const piv = cy - R * 2.6, ang = Math.atan2(dotsL * esp, cy - piv);
    agulha(c, cx + Math.sin(ang) * (cy - piv - R * 0.58), piv + Math.cos(ang) * (cy - piv - R * 0.58), cx + Math.sin(ang) * (cy - piv + R * 0.55), piv + Math.cos(ang) * (cy - piv + R * 0.55), R * 0.035);
    if (m === 'ils') {
      const dotsG = clamp(L.gs, -1, 1) * 5, px = cx - R * 2.6, a2 = Math.atan2(-dotsG * esp, cx - px);
      agulha(c, px + Math.cos(a2) * (cx - px - R * 0.55), cy + Math.sin(a2) * (cx - px - R * 0.55), px + Math.cos(a2) * (cx - px + R * 0.55), cy + Math.sin(a2) * (cx - px + R * 0.55), R * 0.035);
    } else toFrom(c, cx + R * 0.32, cy - R * 0.28, R * 0.1, L.from, sem);
    if (sem && m === 'cdi') bandeira(c, cx - R * 0.5, cy - R * 0.36, R * 0.34, R * 0.13, 'NAV');
    if (m === 'ils' && Math.max(0, -st.x) < 0.3) bandeira(c, cx + R * 0.26, cy + R * 0.2, R * 0.28, R * 0.12, 'GS');
    vidro(c, cx, cy, R); botao(c, k1[0], k1[1], kr, 'OBS');
  } else if (m === 'hsi') {
    // HSI mecânico: cartão gira com a proa, marcador de proa laranja, seta de curso amarela, barra de desvio (5° por ponto)
    cartao(c, cx, cy, R * 0.98, st.hdg, f);
    c.fillStyle = '#f4f4f0'; for (let a = 45; a < 360; a += 45) { if (a === 180) continue; c.save(); c.translate(cx, cy); c.rotate(a * D2R); c.beginPath(); c.moveTo(0, -R * 1.0); c.lineTo(-R * 0.03, -R * 1.07); c.lineTo(R * 0.03, -R * 1.07); c.closePath(); c.fill(); c.restore(); }
    indice(c, cx, cy, R * 0.98);
    c.save(); c.translate(cx, cy); c.rotate((st.alvo - st.hdg) * D2R); c.fillStyle = '#ff8a1f';
    c.fillRect(-R * 0.09, -R * 0.99, R * 0.05, R * 0.08); c.fillRect(R * 0.04, -R * 0.99, R * 0.05, R * 0.08); c.restore();
    c.save(); c.translate(cx, cy); c.rotate((st.obs - st.hdg) * D2R);
    const esp = R * 0.17; pontos(c, 0, 0, esp, 2, false, R * 0.035);
    const amar = '#ffd400';
    c.fillStyle = amar; c.beginPath(); c.moveTo(0, -R * 0.86); c.lineTo(-R * 0.07, -R * 0.68); c.lineTo(-R * 0.025, -R * 0.68); c.lineTo(-R * 0.025, -R * 0.42); c.lineTo(R * 0.025, -R * 0.42); c.lineTo(R * 0.025, -R * 0.68); c.lineTo(R * 0.07, -R * 0.68); c.closePath(); c.fill();
    c.fillRect(-R * 0.025, R * 0.42, R * 0.05, R * 0.42);
    const off = L.cone ? 0 : clamp(L.dev / 5, -2.4, 2.4) * esp;
    c.fillStyle = 'rgba(0,0,0,.5)'; c.fillRect(off - R * 0.025 + 2, -R * 0.4 + 2, R * 0.05, R * 0.8);
    c.fillStyle = amar; c.fillRect(off - R * 0.025, -R * 0.4, R * 0.05, R * 0.8);
    if (!L.cone && !L.flag) { c.fillStyle = '#f4f4f0'; const s = L.from ? 1 : -1; c.beginPath(); c.moveTo(R * 0.28, -s * R * 0.3); c.lineTo(R * 0.2, -s * R * 0.18); c.lineTo(R * 0.36, -s * R * 0.18); c.closePath(); c.fill(); }
    c.restore();
    if (L.cone || L.flag) bandeira(c, cx - R * 0.55, cy - R * 0.32, R * 0.3, R * 0.12, 'NAV');
    // Avião fixo no centro
    c.save(); c.translate(cx, cy); c.fillStyle = '#ff8a1f'; c.strokeStyle = '#000'; c.lineWidth = 1; const a = R * 0.012;
    c.beginPath(); c.moveTo(0, -18 * a); c.lineTo(2 * a, -6 * a); c.lineTo(14 * a, 0); c.lineTo(14 * a, 3 * a); c.lineTo(2 * a, 2 * a); c.lineTo(1.5 * a, 10 * a); c.lineTo(6 * a, 13 * a); c.lineTo(6 * a, 15 * a); c.lineTo(-6 * a, 15 * a); c.lineTo(-6 * a, 13 * a); c.lineTo(-1.5 * a, 10 * a); c.lineTo(-2 * a, 2 * a); c.lineTo(-14 * a, 3 * a); c.lineTo(-14 * a, 0); c.lineTo(-2 * a, -6 * a); c.closePath(); c.fill(); c.stroke(); c.restore();
    vidro(c, cx, cy, R); botao(c, k1[0], k1[1], kr, 'HDG', '#ff8a1f'); botao(c, k2[0], k2[1], kr, 'CRS', '#ffd400');
  } else {
    // ADF de cartão fixo (0 no nariz): agulha amarela com ponta de seta e cauda
    cartao(c, cx, cy, R * 0.98, 0, f); indice(c, cx, cy, R * 0.98);
    c.save(); c.translate(cx, cy); c.rotate(L.rel * D2R);
    c.fillStyle = 'rgba(0,0,0,.5)'; c.beginPath(); c.moveTo(2, -R * 0.82 + 2); c.lineTo(-R * 0.07 + 2, -R * 0.6 + 2); c.lineTo(R * 0.07 + 2, -R * 0.6 + 2); c.closePath(); c.fill();
    agulha(c, 0, -R * 0.62, 0, R * 0.7, R * 0.04, '#ffd400');
    c.fillStyle = '#ffd400'; c.beginPath(); c.moveTo(0, -R * 0.84); c.lineTo(-R * 0.08, -R * 0.6); c.lineTo(R * 0.08, -R * 0.6); c.closePath(); c.fill();
    c.fillStyle = '#ffd400'; c.beginPath(); c.moveTo(0, R * 0.62); c.lineTo(-R * 0.06, R * 0.78); c.lineTo(0, R * 0.72); c.lineTo(R * 0.06, R * 0.78); c.closePath(); c.fill();
    c.restore();
    const hg = c.createRadialGradient(cx - 2, cy - 2, 0, cx, cy, R * 0.07); hg.addColorStop(0, '#9aa0a6'); hg.addColorStop(1, '#2a2d30');
    c.fillStyle = hg; c.beginPath(); c.arc(cx, cy, R * 0.07, 0, 7); c.fill();
    c.fillStyle = '#c8ccd0'; c.font = `700 ${Math.round(R * 0.09)}px system-ui`; c.textAlign = 'center'; c.fillText('ADF', cx, cy + R * 0.3);
    vidro(c, cx, cy, R); botao(c, k1[0], k1[1], kr, 'HDG');
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
  cdi: '<b>VOR e CDI.</b> O VOR transmite 360 radiais, como raios de uma roda. Gire o botão OBS para escolher uma: o curso aparece no alto do cartão. A janela mostra TO ou FR, e a bandeira NAV aparece quando o sinal não serve. A agulha mostra para que lado está a linha: cada ponto é 2°, e a agulha toda para um lado é 10° ou mais. TO quer dizer que seguir aquele curso leva <i>para</i> a estação; FROM, que afasta dela. Regra de ouro: com TO/FROM e o curso parecidos com a proa, voe <i>em direção</i> à agulha.',
  hsi: '<b>HSI.</b> É o VOR montado sobre uma bússola que gira com o avião. A seta amarela é o curso escolhido no botão CRS e a barra do meio é a linha: o desenho mostra de cima onde ela está em relação ao avião. Aqui cada ponto vale 5°. O marcador laranja é a proa escolhida no botão HDG. O triângulo branco aponta para a estação (TO) ou para longe dela (FROM).',
  adf: '<b>ADF e NDB.</b> A agulha aponta sempre para a estação. O 0 é o nariz: com a agulha no 0, o avião vai direto para o NDB. Proa + marcação relativa (MR) = rumo para a estação (QDM). Com vento, o avião vai derivando e a agulha sai do nariz aos poucos.',
  ils: '<b>ILS.</b> A agulha vertical, presa no alto, é o localizador (esquerda e direita); a horizontal, presa à esquerda, é a rampa de 3° (subir e descer). Cada ponto do localizador vale 0,5° e o da rampa cerca de 0,14°: muito mais sensível que o VOR. Voe em direção às agulhas, com correções pequenas.',
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
