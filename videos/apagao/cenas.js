// ================= Cenas: o boato do apagão de 17 de novembro (2:10, vertical) =================
// Primeira metade: o boato e as "pistas" que o formaram. Segunda metade: por que é falso.
const L = k => CUTS[k + 1] - CUTS[k];
const zoomTela = (z, cx, cy, fn) => { c.save(); c.translate(cx, cy); c.scale(z, z); c.translate(-cx, -cy); fn(); c.restore() };
function fundoEscuro(rgb = '19,35,61') { c.fillStyle = P.noite0; c.fillRect(0, 0, W, H); glow(W / 2, 820, 900, rgb, .55) }
function alertaPost(x0, y0, w, h) { c.fillStyle = lg(0, y0, 0, y0 + h, [[0, '#3a0d16'], [1, '#14060a']]); c.fillRect(x0, y0, w, h); poly([[x0 + w / 2, y0 + 26], [x0 + w / 2 + 70, y0 + 150], [x0 + w / 2 - 70, y0 + 150]], P.verm); txt('!', x0 + w / 2, y0 + 140, 90, '#fff', { align: 'center', sh: 0 }); txt('APAGÃO MUNDIAL', x0 + w / 2, y0 + 192, 30, P.luz, { align: 'center', sh: 0, ls: 3 }) }
function telaDesenho(w, h, t) { c.fillStyle = lg(0, 0, 0, h, [[0, '#f2c14e'], [.6, '#f6d97a'], [1, '#e9a83a']]); c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(255,255,255,.75)'; for (const [x, y, s] of [[90, 80, 1], [330, 60, .8], [430, 120, .6]]) { pill(x + (t * 12 % 60), y, 150 * s, 44 * s, 'rgba(255,255,255,.8)'); pill(x + 30 + (t * 12 % 60), y - 20 * s, 100 * s, 40 * s, 'rgba(255,255,255,.8)') } c.fillStyle = '#7a8a6a'; c.fillRect(0, h * .74, w, h * .26); poly([[w * .3, h * .74], [w * .3, h * .5], [w * .5, h * .34], [w * .7, h * .5], [w * .7, h * .74]], '#e8b8d0'); poly([[w * .26, h * .52], [w * .5, h * .3], [w * .74, h * .52]], '#8a5a3a'); c.fillStyle = '#6aa0d0'; c.fillRect(w * .36, h * .56, 50, 40); c.fillRect(w * .56, h * .56, 50, 40); c.fillStyle = '#5a3a26'; c.fillRect(w * .47, h * .6, 34, 66) }
function postGoogle(y, t, o = {}) { post(y, { nome: 'Google (?)', hora: 'conta atribuída', av: '#5a6476', linhas: ['ASSISTA AOS ÚLTIMOS', 'SEGUNDOS DO EPISÓDIO'], imgCor: '#2a2210', img: (x0, y0, w, h) => { c.save(); c.translate(x0, y0); c.beginPath(); c.rect(0, 0, w, h); c.clip(); telaDesenho(w, h, t); poly([[w / 2 - 30, h / 2 - 40], [w / 2 + 44, h / 2], [w / 2 - 30, h / 2 + 40]], 'rgba(255,255,255,.9)'); c.restore() }, likes: '820 mil', shares: '310 mil', ...o }) }
function lupa(x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = 'rgba(69,212,255,.15)'; c.beginPath(); c.arc(0, 0, 90, 0, 7); c.fill(); c.strokeStyle = '#e8f0ff'; c.lineWidth = 18; c.beginPath(); c.arc(0, 0, 90, 0, 7); c.stroke(); c.lineCap = 'round'; c.lineWidth = 30; line(64, 64, 170, 170, '#c8a040', 30); c.restore() }

// 0 — terça-feira, 17 de novembro
shot(CUTS[0], CUTS[1], (tl, t) => { zoomTela(lerp(1, 1.08, ramp(tl, 0, L(0))), 540, 800, () => { ceu(t); cidade(t) }); calendario(540, 760, 1.1, 17, { circulo: ease(ramp(tl, .9, 2.4)) }) });
// 1 — nas redes sociais, o aviso se espalhou
shot(CUTS[1], CUTS[2], (tl, t) => {
  fundoEscuro('47,90,134'); const sc = ease(ramp(tl, .3, L(1))) * 560;
  celular(540, 820, 1, () => { c.save(); c.translate(0, -sc); post(20, {}); post(560, { nome: 'noticias_urgentes', linhas: ['SEM LUZ, SEM INTERNET', 'POR ATÉ 90 DIAS'], av: '#a0402a', likes: '2,3 mi', shares: '900 mil' }); post(1100, { nome: 'fim_dos_tempos', linhas: ['PREPARE SEU KIT', 'DIA 17/11'] }); c.restore() });
  const bolhas = [['⚠ APAGÃO MUNDIAL', 180, 470, .8], ['17 DE NOVEMBRO', 860, 640, 1.6], ['SEM ENERGIA!', 200, 1000, 2.4], ['90 DIAS?!', 880, 1150, 3.2], ['COMPARTILHE', 230, 1260, 4.0]];
  bolhas.forEach(([s, x, y, t0]) => { const u = eo(ramp(tl, t0, t0 + .3)); if (u <= 0) return; c.save(); c.translate(x, y + sin(t * 2 + x) * 8); c.scale(u, u); const w = largura(s, 40) + 50; rr(-w / 2, -40, w, 76, 38, s.includes('⚠') ? P.verm : P.ambar); txt(s, 0, 14, 40, P.tinta, { align: 'center', sh: 0 }); c.restore() });
  placa(tl, 70, 200, 'NAS REDES SOCIAIS', .2, L(1) + 1, { size: 70 });
}, 'desliza');
// 2 — sem luz, sem internet, sem celular (a cidade apagando)
shot(CUTS[2], CUTS[3], (tl, t) => {
  const luz = (i, x) => 1 - ramp(tl, .3 + x / W * 1.8, .6 + x / W * 1.8); ceu(t, { estrelas: 1 }); cidade(t, { luz });
  rr(90, 420, 900, 260, 40, 'rgba(6,11,22,.8)');
  [[icLampada, 240, .0], [icWifi, 540, .75], [icCel, 840, 1.5]].forEach(([f, x, t0]) => { const off = tl > t0 + .4; f(x, 560, 1, !off); riscado(x, 550, 100, ramp(tl, t0 + .2, t0 + .5)) });
}, 'apagao');
// 3 — por até noventa dias
shot(CUTS[3], CUTS[4], (tl, t) => { fundoEscuro('120,20,30'); globo(540, 980, 330, t, { apaga: ramp(tl, 0, 1.6) }); txt('ATÉ', 540, 420, 80, P.creme, { align: 'center', a: ramp(tl, 0, .2) }); const u = eo(ramp(tl, .1, .5)); c.save(); c.translate(540, 600); c.scale(lerp(1.6, 1, u), lerp(1.6, 1, u)); txt('90 DIAS', 0, 0, 210, P.ambar, { align: 'center', a: u }); c.restore() }, 'flash');
// 4 — milhões de visualizações
shot(CUTS[4], CUTS[5], (tl, t) => {
  fundoEscuro('47,90,134');
  for (let k = 0; k < 9; k++) { const cx = 200 + (k % 3) * 340, cy = 560 + Math.floor(k / 3) * 330, u = eo(ramp(tl, k * .12, k * .12 + .4)); if (u <= 0) continue; c.save(); c.globalAlpha = u; celular(cx, cy + (1 - u) * 80, .3, () => { c.fillStyle = '#141e33'; c.fillRect(0, 0, 440, 900); alertaPost(20, 260, 400, 300); txt('▶ ' + fmt((k + 1) * 137000 + Math.floor(tl * 91000)), 30, 700, 46, '#e6ecf5', { sh: 0 }) }, { rot: (k % 2 ? .06 : -.06) }); c.restore() }
  const q = rng(12); for (let i = 0; i < 26; i++) { const ph = (tl * .5 + q()) % 1, x = q() * W; txt('♥', x, 1500 - ph * 1200, 50 + q() * 40, '#ff6b7d', { a: (1 - ph) * .9, sh: 0 }) }
  titulo(tl, 'MILHÕES', 540, 300, 150, P.ambar, .2); titulo(tl, 'DE VISUALIZAÇÕES', 540, 380, 64, P.creme, .4);
}, 'glitch');
// 5 — kit de sobrevivência
shot(CUTS[5], CUTS[6], (tl, t) => { fundoEscuro('120,80,30'); c.fillStyle = '#2a1d14'; c.fillRect(0, 1180, W, 200); c.fillStyle = '#3a2a1e'; c.fillRect(0, 1180, W, 24); kit(540, 900, 1.15, t, tl * 4.2); placa(tl, 70, 250, 'KIT DE SOBREVIVÊNCIA', .1, L(5) + 1, { size: 66 }) }, 'cortina');
// 6 — pista 1: o desenho animado
shot(CUTS[6], CUTS[7], (tl, t) => { fundoEscuro('242,193,78'); zoomTela(lerp(1, 1.1, ease(ramp(tl, 0, L(6)))), 540, 900, () => tv(500, 960, 1.05, t, (w, h) => telaDesenho(w, h, t))); pista(tl, 1, 'O DESENHO'); placa(tl, 70, 300, 'OS SIMPSONS', 2.7, L(6) + 1, { sub: 'EPISÓDIO DE 2023' }) }, 'zoom');
// 7 — o diário da Lisa: 17 de novembro e uma tempestade
shot(CUTS[7], CUTS[8], (tl, t) => { fundoEscuro('242,193,78'); zoomTela(lerp(1, 1.12, ease(ramp(tl, 0, L(7)))), 540, 760, () => diario(560, 900, 1.0, t, ramp(tl, .4, 5.4))); placa(tl, 70, 250, 'O DIÁRIO DA LISA', .2, L(7) + 1, { sub: 'CENA DESTACADA NAS REDES', size: 66 }) }, 'iris');
// 8 — a postagem atribuída ao Google
shot(CUTS[8], CUTS[9], (tl, t) => { fundoEscuro('69,212,255'); celular(540, 860, .95, () => postGoogle(150, t), { rot: -.03 }); placa(tl, 70, 250, 'POSTAGEM', .2, L(8) + 1, { sub: 'ATRIBUÍDA AO GOOGLE', size: 70 }) }, 'desliza');
// 9 — pista 2: Estados Unidos
shot(CUTS[9], CUTS[10], (tl, t) => { ceu(t, { lx: 260, ly: 560 }); c.fillStyle = '#0a1220'; c.fillRect(0, 1300, W, H); torre(540, 1300, .9, t); pista(tl, 2, 'ESTADOS UNIDOS') }, 'cortina');
// 10 — teste nacional do sistema de alerta de emergência
shot(CUTS[10], CUTS[11], (tl, t) => {
  ceu(t, { lua: false }); c.fillStyle = '#0a1220'; c.fillRect(0, 1300, W, H); torre(880, 1300, .55, t, { rgb: AMB });
  calendario(250, 600, .42, 17, { circulo: 1 });
  const vib = Math.floor(tl * 3) % 2 === 0 && tl > .6; celular(560 + (vib ? sin(t * 90) * 5 : 0), 940, .78, () => { c.fillStyle = '#101826'; c.fillRect(0, 0, 440, 900); rr(20, 260, 400, 330, 26, '#e8ecf2'); rr(20, 260, 400, 90, 26, P.verm); txt('ALERTA DE EMERGÊNCIA', 220, 318, 34, '#fff', { align: 'center', sh: 0 }); txt('ISTO É UM TESTE.', 220, 420, 46, P.tinta, { align: 'center', sh: 0 }); txt('NENHUMA AÇÃO', 220, 480, 34, '#5a6476', { align: 'center', sh: 0, w: 600 }); txt('É NECESSÁRIA.', 220, 520, 34, '#5a6476', { align: 'center', sh: 0, w: 600 }) }, { vibra: vib });
  placa(tl, 70, 250, 'TESTE NACIONAL', .2, L(10) + 1, { sub: 'ALERTA DE EMERGÊNCIA', size: 70 });
}, 'flash');
// 11 — pista 3: Brasil, kit de 72 horas
shot(CUTS[11], CUTS[12], (tl, t) => { fundoEscuro('230,120,30'); c.fillStyle = '#1d2a40'; c.fillRect(0, 1240, W, 160); kit(470, 1010, .85, t, (tl - .6) * 3); relogio72(820, 640, 120, ease(ramp(tl, 2.6, 5.6))); pista(tl, 3, 'BRASIL'); placa(tl, 70, 280, 'DEFESA CIVIL', 2.8, L(11) + 1, { sub: 'ÁGUA · COMIDA · REMÉDIOS', size: 70 }) }, 'glitch');
// 12 — os 90 dias: plano militar americano
shot(CUTS[12], CUTS[13], (tl, t) => { ceu(t, { lx: 860, ly: 520 }); baseMilitar(t); bateria(540, 820, .95, ease(ramp(tl, 1.6, 5.2))); titulo(tl, '?', 540, 650, 160, P.ambar, 0, { fim: 1.6 }); placa(tl, 70, 250, 'PLANO MILITAR', 1.4, L(12) + 1, { sub: 'BASES SEM ENERGIA DE FORA', size: 70 }) }, 'cortina');
// 13 — junte tudo: nasceu o boato
shot(CUTS[13], CUTS[14], (tl, t) => {
  fundoEscuro('120,20,30'); const u = ease(ramp(tl, .2, 1.6)), m = ramp(tl, 1.6, 2.0);
  const cards = [[200, 520, k => tv(0, 0, .26, t, (w, h) => telaDesenho(w, h, t))], [880, 520, k => torre(0, 170, .3, t)], [200, 1180, k => kit(0, -40, .45, t)], [880, 1180, k => bateria(0, 0, .5, .8)]];
  cards.forEach(([x, y, f], i) => { const cx = lerp(x, 540, u), cy = lerp(y, 820, u), s = lerp(1, .5, u); c.save(); c.globalAlpha = 1 - m; c.translate(cx, cy); c.rotate((i - 1.5) * .08 * (1 - u)); c.scale(s, s); rr(-180, -200, 360, 400, 26, '#13233d'); c.strokeStyle = P.ambar; c.lineWidth = 6; c.beginPath(); c.roundRect(-180, -200, 360, 400, 26); c.stroke(); c.save(); c.beginPath(); c.roundRect(-180, -200, 360, 400, 26); c.clip(); f(); c.restore(); c.restore() });
  if (m > 0) { const pis = (Math.floor(t * 14) % 4 === 0) ? .4 : 1; add(() => glow(540, 820, 520, VER, .5 * m * pis)); c.save(); c.translate(540, 820); c.scale(lerp(1.6, 1, eo(m)), lerp(1.6, 1, eo(m))); txt('APAGÃO', 0, -20, 200, P.creme, { align: 'center', a: m * pis }); txt('MUNDIAL', 0, 150, 160, P.verm, { align: 'center', a: m * pis }); c.restore(); titulo(tl, 'NASCEU O BOATO', 540, 1180, 70, P.ambar, 2.3) }
}, 'zoom');
// 14 — só que nada disso é verdade
shot(CUTS[14], CUTS[15], (tl, t) => { fundoEscuro('90,10,20'); titulo(tl, 'SÓ QUE...', 540, 560, 130, P.creme, 0); carimbo(tl, 1.0, 'FALSO', 540, 860, 210); titulo(tl, 'VAMOS POR PARTES', 540, 1180, 74, P.ambar, 2.0) }, 'apagao');
// 15 — o episódio não fala de 2026 nem de apagão
shot(CUTS[15], CUTS[16], (tl, t) => {
  fundoEscuro('61,220,132'); tv(520, 800, .75, t, (w, h) => telaDesenho(w, h, t)); pista(tl, 1, 'O DESENHO', true);
  [['FALA EM 2026?', 1.2], ['APAGÃO MUNDIAL?', 3.0]].forEach(([s, t0], k) => { const u = eo(ramp(tl, t0, t0 + .3)); if (u <= 0) return; const y = 1130 + k * 120; c.save(); c.globalAlpha = u; rr(110, y - 60, 860, 100, 20, 'rgba(10,15,26,.85)'); txt(s, 150, y + 12, 60, P.creme, { sh: 0 }); txt('NÃO', 880, y + 12, 60, P.verm, { align: 'right', sh: 0 }); marca(930, y - 10, 60, false, ramp(tl, t0 + .3, t0 + .6)); c.restore() });
}, 'glitch');
// 16 — a postagem era falsa
shot(CUTS[16], CUTS[17], (tl, t) => { fundoEscuro('69,212,255'); celular(540, 860, .95, () => postGoogle(150, t), { rot: -.03 }); carimbo(tl, .5, 'FALSA', 540, 820, 190) }, 'flash');
// 17 — o teste americano é de rotina, exigido por lei
shot(CUTS[17], CUTS[18], (tl, t) => { ceu(t, { lx: 260, ly: 560 }); c.fillStyle = '#0a1220'; c.fillRect(0, 1300, W, H); torre(540, 1300, .8, t); pista(tl, 2, 'O TESTE', true); placa(tl, 70, 300, 'TESTE DE ROTINA', 2.7, L(17) + 1, { sub: 'EXIGIDO POR LEI', size: 70 }) }, 'cortina');
// 18 — não desliga a energia nem a internet
shot(CUTS[18], CUTS[19], (tl, t) => {
  ceu(t); cidade(t);
  rr(90, 360, 900, 420, 40, 'rgba(6,11,22,.82)'); titulo(tl, 'O TESTE NÃO DESLIGA', 540, 450, 66, P.creme, .1);
  [[icLampada, 330, 'ENERGIA', 1.0], [icWifi, 750, 'INTERNET', 2.4]].forEach(([f, x, s, t0]) => { f(x, 600, .8, true); txt(s, x, 740, 44, P.creme, { align: 'center' }); marca(x + 110, 520, 70, true, ramp(tl, t0, t0 + .4)) });
}, 'iris');
// 19 — o kit é prevenção contra enchentes e temporais
shot(CUTS[19], CUTS[20], (tl, t) => { ceu(t, { lua: false, estrelas: .2 }); c.fillStyle = 'rgba(30,40,60,.6)'; c.fillRect(0, 0, W, H); if (Math.floor(t * 3) % 7 === 0) { c.fillStyle = 'rgba(220,230,255,.25)'; c.fillRect(0, 0, W, H) } casa(540, 1200, 1.4, 1); agua(lerp(1330, 1200, ease(ramp(tl, 0, L(19)))), t); chuva(t, 160, .55); pista(tl, 3, 'O KIT', true); placa(tl, 70, 300, 'PREVENÇÃO', 2.7, L(19) + 1, { sub: 'ENCHENTES E TEMPORAIS', size: 72 }) }, 'desliza');
// 20 — a Defesa Civil Nacional foi direta
shot(CUTS[20], CUTS[21], (tl, t) => {
  fundoEscuro('230,120,30'); const u = eo(ramp(tl, 0, .4)); c.save(); c.globalAlpha = u; c.translate(0, (1 - u) * 60);
  rr(80, 400, 920, 840, 36, P.creme); rr(80, 400, 920, 120, 36, P.ambar); c.fillStyle = P.ambar; c.fillRect(80, 470, 920, 50);
  txt('DEFESA CIVIL NACIONAL', 540, 482, 56, P.tinta, { align: 'center', sh: 0, ls: 4 }); txt('“', 150, 720, 260, '#d8cdb4', { sh: 0 });
  ['NÃO HÁ EVIDÊNCIAS', 'DE UM APAGÃO NO', 'DIA 17 DE NOVEMBRO'].forEach((s, k) => { const t0 = 1.2 + k * 1.0, n = Math.floor(s.length * ramp(tl, t0, t0 + .7)); txt(s.slice(0, n), 540, 720 + k * 120, 92, k === 0 ? P.verm : P.tinta, { align: 'center', sh: 0 }) });
  txt('— NOTA OFICIAL', 920, 1170, 40, '#5a6476', { align: 'right', sh: 0, w: 600, a: ramp(tl, 4.4, 4.8) }); c.restore();
}, 'flash');
// 21 — o ONS não anunciou nenhum desligamento
shot(CUTS[21], CUTS[22], (tl, t) => {
  c.fillStyle = '#060b16'; c.fillRect(0, 0, W, H); rr(60, 300, 960, 860, 24, '#0b1526'); c.strokeStyle = '#2f5a86'; c.lineWidth = 8; c.beginPath(); c.roundRect(60, 300, 960, 860, 24); c.stroke();
  for (let k = 0; k < 9; k++) line(80, 340 + k * 96, 1000, 340 + k * 96, 'rgba(69,212,255,.06)', 2);
  mapaBrasil(540, 740, 640, t); txt('SISTEMA INTERLIGADO NACIONAL', 540, 1110, 36, P.ciano, { align: 'center', ls: 4, w: 600 });
  c.fillStyle = '#101a2c'; c.fillRect(0, 1240, W, 300); for (let k = 0; k < 3; k++) { rr(100 + k * 320, 1180, 240, 140, 10, '#1a2438'); rr(116 + k * 320, 1194, 208, 112, 6, k === 1 ? '#13404a' : '#132a4a'); for (let j = 0; j < 4; j++) rr(130 + k * 320, 1212 + j * 22, 60 + ((j * 37 + k * 13) % 110), 8, 4, k === 1 ? P.verde : P.ciano) }
  for (let k = 0; k < 3; k++) operador(220 + k * 320, 1560, 1.1, ['#2f5a86', '#3a4660', '#2a4a6a'][k]);
  placa(tl, 70, 200, 'ONS', .2, L(21) + 1, { sub: 'NENHUM DESLIGAMENTO ANUNCIADO', size: 76 });
}, 'zoom');
// 22 — cada país tem a sua rede
shot(CUTS[22], CUTS[23], (tl, t) => { fundoEscuro('69,212,255'); globo(540, 900, 380, t, { cores: ['#2a6a4a', '#8a6a2a', '#2a4a8a', '#7a3a4a', '#5a3a8a'] }); titulo(tl, 'CADA PAÍS,', 540, 380, 90, P.creme, .1); titulo(tl, 'SUA PRÓPRIA REDE', 540, 470, 80, P.ambar, .3) }, 'glitch');
// 23 — desligar o planeta inteiro é praticamente impossível
shot(CUTS[23], CUTS[24], (tl, t) => {
  fundoEscuro('47,90,134'); globo(540, 760, 330, t);
  const sw = ramp(tl, .8, 1.3) * (1 - ramp(tl, 2.0, 2.4)); c.save(); c.translate(860, 1180); rr(-80, -130, 160, 260, 26, '#cfd8e6'); rr(-50, -100, 100, 200, 16, '#1a2438'); rr(-40, lerp(-90, 0, sw), 80, 90, 12, sw > .5 ? P.verm : P.verde); c.restore();
  carimbo(tl, 2.2, 'IMPOSSÍVEL', 430, 1190, 110, VER, -.08);
}, 'iris');
// 24 — o dia 17 chegou e passou
shot(CUTS[24], CUTS[25], (tl, t) => { ceu(t); cidade(t); const vira = tl > 1.0; calendario(540, 760, 1.1, vira ? 18 : 17, { sem: vira ? 'QUARTA-FEIRA' : 'TERÇA-FEIRA', cor: vira ? P.verde : P.verm }); folhaVoando(540, 760, 1.1, ramp(tl, 1.0, 2.2), 17) }, 'cortina');
// 25 — as luzes continuaram acesas
shot(CUTS[25], CUTS[26], (tl, t) => { zoomTela(lerp(1.15, 1, ease(ramp(tl, 0, L(25)))), 540, 1000, () => { ceu(t); cidade(t, { seed: 5 }); for (let k = 0; k < 6; k++) { const x = ((t * (120 + k * 30) + k * 260) % (W + 200)) - 100; disc(x, 1420 + (k % 2) * 60, 10, k % 2 ? P.verm : P.luz) } }); add(() => glow(540, 1000, 900, AMB, .12)) }, 'flash');
// 26 — antes de compartilhar, confira a fonte
shot(CUTS[26], CUTS[27], (tl, t) => {
  fundoEscuro('61,220,132'); celular(540, 900, .85, () => { post(150, {}); rr(40, 760, 360, 80, 40, P.ambar); txt('↗ COMPARTILHAR', 220, 812, 36, P.tinta, { align: 'center', sh: 0 }) });
  const u = ease(ramp(tl, .3, 2.2)); lupa(lerp(860, 600, u), lerp(1200, 820, u) + sin(t * 3) * 10, .9);
  const f = ramp(tl, 2.6, 3.0); if (f > 0) { c.fillStyle = `rgba(6,11,22,${.8 * f})`; c.fillRect(0, 0, W, H); titulo(tl, 'CONFIRA', 540, 760, 170, P.creme, 2.7); titulo(tl, 'A FONTE', 540, 930, 170, P.ambar, 2.9); marca(540, 1130, 140, true, ramp(tl, 3.2, 3.8)) }
}, 'desliza');
