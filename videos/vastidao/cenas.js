// ================= Cenas: a vastidão do universo (3:49, vertical) — tudo desenhado do zero =================
const L = k => CUTS[k + 1] - CUTS[k];
function tw(k, str) { const a = CUTS[k]; for (const l of LEG) for (const [s, ti] of l.w) if (ti >= a - .05 && s.replace(/[^\wÀ-ÿ-]/g, '') === str.toUpperCase()) return ti - a; return 0 }
const pl = (tl, k, s, sub, o = {}) => placa(tl, 70, o.y || 250, s, o.t0 ?? .2, L(k) + 1, { sub, size: o.size || 76, linha: P.rosa });
const RS = P.rosa, CI = P.ciano;
const grande = (tl, s, y, size, col, t0 = 0) => { const u = eo(ramp(tl, t0, t0 + .35)); if (u <= 0) return; c.save(); c.translate(540, y); c.scale(lerp(1.3, 1, u), lerp(1.3, 1, u)); txt(s, 0, 0, size, col, { align: 'center', a: u }); c.restore() };
function seta(x0, y0, x1, y1, col, lw = 6) { line(x0, y0, x1, y1, col, lw); const a = Math.atan2(y1 - y0, x1 - x0); poly([[x1, y1], [x1 - cos(a - .4) * 26, y1 - sin(a - .4) * 26], [x1 - cos(a + .4) * 26, y1 - sin(a + .4) * 26]], col) }
const S = (k, fn, tr) => shot(CUTS[k], CUTS[k + 1], fn, tr);
// universo observável recortado: anéis do mais perto (centro) ao mais longe (borda brilhante)
function universoBolha(x, y, R, t) { const img = cache('uob', 1200, 1200, () => { const X = 600, q = rng(93); const an = [[1, '#1a1040'], [.86, '#22164e'], [.7, '#2a1c5c'], [.5, '#33226a'], [.3, '#3e2a78']]; an.forEach(([f, col]) => disc(X, X, 560 * f, col));
    c.lineWidth = 2; for (let i = 0; i < 160; i++) { const a = q() * 7, d = 120 + q() * 400, a2 = a + (q() - .5) * .5, d2 = d + (q() - .5) * 80; c.strokeStyle = `rgba(184,168,240,${.25 + q() * .3})`; c.beginPath(); c.moveTo(X + cos(a) * d, X + sin(a) * d); c.lineTo(X + cos(a2) * d2, X + sin(a2) * d2); c.stroke() }
    for (let i = 0; i < 500; i++) { const a = q() * 7, d = 60 + q() * 480, s = 2 + q() * 5; c.fillStyle = [NEB.lav, NEB.cia2, NEB.ros2, NEB.cre][i % 4]; c.save(); c.translate(X + cos(a) * d, X + sin(a) * d); c.rotate(q() * 3); c.fillRect(-s, -s * .4, s * 2, s * .8); c.restore() }
    c.lineWidth = 28; c.strokeStyle = '#ff7a5a'; c.beginPath(); c.arc(X, X, 552, 0, 7); c.stroke(); c.lineWidth = 12; c.strokeStyle = '#ffd27a'; c.beginPath(); c.arc(X, X, 535, 0, 7); c.stroke(); disc(X, X, 14, '#4fa8ff'); disc(X - 3, X - 3, 6, '#9ad8ff') });
  c.save(); c.translate(x, y); c.rotate(t * .02); c.drawImage(img, -R, -R, 2 * R, 2 * R); c.restore(); add(() => glow(x, y, R * 1.15, '255,140,110', .12)) }

// 0 — olhe para o céu à noite
S(0, (tl, t) => { zoomTela(lerp(1.08, 1, ease(ramp(tl, 0, L(0)))), 540, 900, () => { fundo(t); galaxia(780, 520, 220, t, { seed: 2, inc: .45, ang: -.5 }); colinas(1260); pessoaCostas(420, 1500, 1.45) }); pl(tl, 0, 'OLHE PARA CIMA', 'CADA PONTO DE LUZ É UM SOL', { t0: .8 }) });
// 1 — mais estrelas que grãos de areia
S(1, (tl, t) => { fundo(t, { seed: 2 }); const q = rng(5); poly([[0, 1320], [300, 1230], [640, 1280], [1080, 1200], [1080, 1920], [0, 1920]], '#6a3a5a'); poly([[0, 1420], [420, 1330], [1080, 1380], [1080, 1920], [0, 1920]], '#8a4a62'); for (let i = 0; i < 260; i++) { c.fillStyle = i % 3 ? '#c87a7a' : '#ffb08a'; const s = 3 + q() * 5; c.fillRect(q() * W, 1300 + q() * 260, s, s) }
  const u = ramp(tl, .2, 1.5); for (let i = 0; i < 90 * u; i++) { const q2 = rng(i + 9); brilho4(q2() * W, 380 + q2() * 760, 6 + q2() * 12, i % 4 ? NEB.cre : NEB.cia2) }
  grande(tl, 'MAIS ESTRELAS', 520, 96, CI, .3); grande(tl, 'QUE GRÃOS DE AREIA', 610, 60, P.creme, .9); txt('EM TODAS AS PRAIAS DA TERRA', 540, 670, 40, P.lav, { align: 'center', a: ramp(tl, 1.6, 2) }) }, 'nevoa');
// 2 — grande demais para a mente
S(2, (tl, t) => { fundo(t, { seed: 3 }); zoomTela(lerp(1.6, .9, eo(ramp(tl, 0, L(2)))), 540, 880, () => galaxia(540, 880, 480, t, { seed: 4, inc: .7, ang: .4 })); grande(tl, 'GRANDE DEMAIS', 1320, 104, P.creme, .1) }, 'zoom');
// 3 — capítulo 1: a luz leva 8 minutos do Sol até aqui
S(3, (tl, t) => { fundo(t, { seed: 4 }); sol(540, 470, 170, t); terra(540, 1250, 70, t); const t0 = 2.2, u = ramp(tl, t0 + .4, L(3) - 1); feixe(540, 650, 540, 1170, u, '255,210,122'); txt('8 MINUTOS', 600, 920, 72, NEB.ama, { a: ramp(tl, t0 + 1, t0 + 1.4) }); txt('DO SOL ATÉ A TERRA', 600, 975, 36, P.creme, { a: ramp(tl, t0 + 1.2, t0 + 1.6) }); capitulo(tl, 1, CAPS.b) }, 'escuro');
// 4 — 100 mil anos para cruzar a Via Láctea
S(4, (tl, t) => { fundo(t, { seed: 5 }); galaxia(540, 850, 520, t, { seed: 6, inc: .32, ang: -.12, vel: .02 }); feixe(40, 930, 1040, 770, ramp(tl, .2, L(4) - .2)); txt('100.000 ANOS-LUZ', 540, 1180, 74, CI, { align: 'center', a: ramp(tl, .3, .7) }); pl(tl, 4, 'VIA LÁCTEA', null) }, 'desliza');
// 5 — centenas de bilhões de galáxias
S(5, (tl, t) => { fundo(t, { seed: 6 }); const q = rng(55); const n = Math.floor(clamp(tl * 9, 0, 30)); for (let i = 0; i < n; i++) { const x = 80 + q() * 920, y = 380 + q() * 1000, R = 30 + q() * 90; galaxia(x, y, R, t, { seed: (i % 6) + 10, inc: .3 + q() * .6, ang: q() * 3, cores: i % 3 ? [NEB.lav, NEB.v5, NEB.cia2] : [NEB.ros2, NEB.lav, NEB.cre] }) }
  grande(tl, 'CENTENAS DE BILHÕES', 1460 - 120, 76, RS, 1.2); txt('DE GALÁXIAS', 540, 1410, 46, P.creme, { align: 'center', a: ramp(tl, 1.5, 1.9) }) }, 'flash');
// 6 — universo observável: 93 bilhões de anos-luz
S(6, (tl, t) => { fundo(t, { seed: 7 }); zoomTela(lerp(.6, 1, eo(ramp(tl, 0, 2.5))), 540, 880, () => universoBolha(540, 880, 440, t)); txt('VOCÊ ESTÁ AQUI', 600, 830, 30, P.creme, { a: ramp(tl, 1.2, 1.6) }); seta(700, 840, 560, 872, P.creme, 4);
  pl(tl, 6, 'UNIVERSO OBSERVÁVEL', '≈ 93 BILHÕES DE ANOS-LUZ', { size: 68 }) }, 'iris');
// 7 — e além da fronteira?
S(7, (tl, t) => { fundo(t, { seed: 8 }); universoBolha(540, 1700, 1300, t); grande(tl, '?', 760, 360, RS, .1); txt('ALÉM DA FRONTEIRA', 540, 940, 52, P.creme, { align: 'center', a: ramp(tl, .4, .8) }) }, 'zoom');
// 8 — pode ser infinito
S(8, (tl, t) => { c.fillStyle = NEB.v0; c.fillRect(0, 0, W, H); for (let k = 12; k >= 0; k--) { const f = ((k + (t * .6) % 1) / 12), r = 40 + f * f * 1300; c.strokeStyle = k % 2 ? 'rgba(79,216,232,.5)' : 'rgba(255,95,162,.45)'; c.lineWidth = 3 + f * 14; c.beginPath(); for (let i = 0; i <= 6; i++) { const a = i / 6 * PI * 2 + t * .1; i ? c.lineTo(540 + cos(a) * r, 860 + sin(a) * r) : c.moveTo(540 + cos(a) * r, 860 + sin(a) * r) } c.stroke() }
  grande(tl, '∞', 940, 300, P.creme, .2); grande(tl, 'INFINITO?', 1240, 100, CI, .6) }, 'iris');
// 9 — sem borda, sem centro
S(9, (tl, t) => { fundo(t, { seed: 9 }); gradeEspaco(t, 1 + tl * .03); txt('SEM BORDA', 540, 420, 84, P.creme, { align: 'center', a: ramp(tl, .1, .4) }); txt('SEM CENTRO', 540, 520, 84, RS, { align: 'center', a: ramp(tl, .8, 1.1) }) }, 'cortina');
// 10 — uma cópia exata de você
S(10, (tl, t) => { fundo(t, { seed: 10 }); colinas(1300); galaxia(540, 560, 260, t, { seed: 12, inc: .5 }); espelho(t, ramp(tl, tw(10, 'cópia') - .3, tw(10, 'cópia') + .3)); txt('VOCÊ', 300, 1600 - 140, 40, CI, { align: 'center' }); txt('OUTRO VOCÊ?', 780, 1460, 40, RS, { align: 'center', a: ramp(tl, tw(10, 'cópia'), tw(10, 'cópia') + .4) });
  pl(tl, 10, 'UMA CÓPIA DE VOCÊ?', 'HIPÓTESE DE ALGUNS FÍSICOS', { t0: 3.2, size: 68 }) }, 'nevoa');
// 11 — capítulo 2: brutal. −270 °C
S(11, (tl, t) => { fundo(t, { seed: 11 }); const t0 = 2.3, u = ramp(tl, t0, t0 + 2.5); termometro(300, 1150, 600, u); gelo(t, ramp(tl, t0 + 1, t0 + 2)); grande(tl, '−270 °C', 720, 110, CI, t0 + 1.4); txt('O FRIO DO ESPAÇO', 720, 800, 40, P.creme, { align: 'center', a: ramp(tl, t0 + 1.8, t0 + 2.2) }); capitulo(tl, 2, CAPS.e) }, 'escuro');
// 12 — estrelas explodem
S(12, (tl, t) => { fundo(t, { seed: 12, cor: 'quente' }); if (tl < .6) disc(540, 860, 90 - tl * 40, '#ffb07a'); explosao(540, 860, ramp(tl, .5, 3.2), t, 470); grande(tl, 'SUPERNOVA', 1380, 100, NEB.ama, 1) }, 'flash');
// 13 — buracos negros engolem até a luz
S(13, (tl, t) => { fundo(t, { seed: 13 }); buracoNegro(540, 860, 150, t); const u = ramp(tl, .5, 3); feixe(-40, 600, lerp(-40, 520, 1), lerp(600, 850, 1), Math.min(u, .98), '168,242,250'); grande(tl, 'NEM A LUZ ESCAPA', 1380, 76, P.creme, 1.2) }, 'iris');
// 14 — galáxias colidem
S(14, (tl, t) => { fundo(t, { seed: 14 }); const u = ease(ramp(tl, 0, L(14))); galaxia(lerp(300, 470, u), lerp(700, 820, u), 300, t, { seed: 15, inc: .5, ang: .4 }); galaxia(lerp(800, 620, u), lerp(1100, 960, u), 260, t * -1, { seed: 16, inc: .45, ang: -.8, cores: [NEB.ros2, NEB.lav, NEB.cre] }); grande(tl, 'COLISÃO', 1460 - 120, 96, RS, .1) }, 'desliza');
// 15 — um asteroide acabou com os dinossauros
S(15, (tl, t) => { const u = ramp(tl, 0, L(15)); c.fillStyle = bands(0, 0, 0, H, [[.4, '#1a0a26'], [.7, '#3a1430'], [1, '#6a2a2a']]); c.fillRect(0, 0, W, H); const ax = lerp(1000, 520, u), ay = lerp(200, 1050, u);
  for (let i = 0; i < 6; i++) poly([[ax, ay], [ax + 120 + i * 40, ay - 200 - i * 70], [ax + 60 + i * 20, ay - 150 - i * 80]], ['#ff4f7a', '#ff8a5a', '#ffd27a', '#ff8a5a', '#ff4f7a', '#ffd27a'][i]); asteroide(ax, ay, 60, t * 2);
  poly([[0, 1260], [300, 1220], [700, 1250], [1080, 1210], [1080, 1920], [0, 1920]], '#120a1c'); dino(340, 1250, 1.4); dino(760, 1230, .9); add(() => glow(ax, ay, 200, '255,140,90', .4 * u)); grande(tl, 'ADEUS, DINOSSAUROS', 1450 - 120, 64, NEB.ama, .4) }, 'flash');
// 16 — o Sol vai inchar
S(16, (tl, t) => { fundo(t, { seed: 16, cor: 'quente' }); const u = ease(ramp(tl, .3, L(16) - .5)); sol(lerp(540, 380, u), 880, lerp(90, 520, u), t, { cores: ['#c8302a', '#e84a3a', '#ff6a4a', '#ff9a6a', '#ffc89a'] }); terra(900, 880, 40, t); txt('DAQUI A ~5 BILHÕES DE ANOS', 540, 1400 - 60, 44, P.creme, { align: 'center', a: ramp(tl, .5, .9) }); pl(tl, 16, 'GIGANTE VERMELHA', null, { size: 70 }) }, 'nevoa');
// 17 — o que somos nós?
S(17, (tl, t) => { fundo(t, { seed: 17 }); galaxia(540, 700, 620, t, { seed: 18, inc: .6, ang: .3, vel: .015 }); colinas(1340); pessoaCostas(540, 1520, .55 + tl * .02); grande(tl, 'E NÓS?', 1330, 120, P.creme, .4) }, 'zoom');
// 18 — calendário cósmico
S(18, (tl, t) => { c.fillStyle = NEB.v1; c.fillRect(0, 0, W, H); fundo(t, { seed: 18 }); const u = ramp(tl, .2, 2.4), z = eo(ramp(tl, 3.6, 5)); zoomTela(lerp(1, 2.6, z), 840, 1050, () => calendario(240, 420, u, t));
  if (z > .9) { txt('31 DE DEZEMBRO', 540, 1180, 72, P.creme, { align: 'center', a: ramp(tl, 5, 5.4) }); txt('HUMANIDADE: OS ÚLTIMOS MINUTOS', 540, 1260, 44, RS, { align: 'center', a: ramp(tl, 5.6, 6) }) } pl(tl, 18, 'O UNIVERSO EM 1 ANO', null, { size: 68 }) }, 'cortina');
// 19 — pontinho azul
S(19, (tl, t) => { c.fillStyle = '#0b0718'; c.fillRect(0, 0, W, H); pontoAzul(t, ramp(tl, .8, 1.4)); txt('A TERRA', 680, 880, 44, CI, { a: ramp(tl, 1, 1.4) }) }, 'escuro');
// 20 — capítulo 3: como tudo começou?
S(20, (tl, t) => { fundo(t, { seed: 20 }); grande(tl, 'COMO TUDO', 820, 100, P.creme, 2.4); grande(tl, 'COMEÇOU?', 930, 120, RS, 2.7); capitulo(tl, 3, CAPS.h) }, 'escuro');
// 21 — 13,8 bilhões de anos: um estado minúsculo e quentíssimo
S(21, (tl, t) => { c.fillStyle = '#05030c'; c.fillRect(0, 0, W, H); const b = 1 + .15 * sin(t * 6); disc(540, 880, 26 * b, '#fff6e0'); [[70, 'rgba(255,210,122,.35)'], [130, 'rgba(255,95,162,.18)']].forEach(([r, col]) => disc(540, 880, r * b, col)); brilho4(540, 880, 140 * b, '#ffffff', .8);
  pl(tl, 21, 'HÁ 13,8 BILHÕES DE ANOS', null, { size: 64 }); txt('MINÚSCULO E QUENTÍSSIMO', 540, 1200, 52, NEB.ama, { align: 'center', a: ramp(tl, tw(21, 'minúsculo') - .2, tw(21, 'minúsculo') + .2) }) }, 'iris');
// 22 — começou a se expandir
S(22, (tl, t) => { c.fillStyle = '#05030c'; c.fillRect(0, 0, W, H); const u = eo(ramp(tl, 0, L(22))); for (let k = 0; k < 6; k++) { const r = (60 + k * 160) * u; c.strokeStyle = [NEB.cre, NEB.ama, NEB.lar, NEB.ros, NEB.v5, NEB.cia][k]; c.lineWidth = 30 - k * 3; c.beginPath(); c.arc(540, 880, r, 0, 7); c.stroke() } centelha(540, 880, 1 - u * .6, t); grande(tl, 'EXPANSÃO', 1400 - 60, 96, CI, .3) }, 'flash');
// 23 — BIG BANG
S(23, (tl, t) => { c.fillStyle = '#0a0418'; c.fillRect(0, 0, W, H); raios(540, 880, t, 1); explosao(540, 880, ramp(tl, 0, 1.2), t, 600); grande(tl, 'BIG BANG', 900, 190, '#ffffff', .1) }, 'flash');
// 24 — o próprio espaço nascendo e se esticando
S(24, (tl, t) => { fundo(t, { seed: 24 }); gradeEspaco(t, lerp(.55, 1.35, ease(ramp(tl, 0, L(24))))); pl(tl, 24, 'O ESPAÇO SE ESTICA', 'NÃO FOI UMA EXPLOSÃO NO ESPAÇO', { size: 70 }) }, 'cortina');
// 25 — as galáxias se afastam
S(25, (tl, t) => { fundo(t, { seed: 25 }); const u = ramp(tl, 0, L(25)); [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, -1.3], [0, 1.3]].forEach(([dx, dy], i) => { const d = 180 + u * 220; const x = 540 + dx * d, y = 880 + dy * d * .9; galaxia(x, y, 70, t, { seed: 30 + i, inc: .5, ang: i }); seta(540 + dx * (d - 140), 880 + dy * (d - 140) * .9, 540 + dx * (d - 80), 880 + dy * (d - 80) * .9, CI, 5) }); galaxia(540, 880, 80, t, { seed: 29 }); grande(tl, 'AINDA SE AFASTANDO', 1400 - 60, 72, P.creme, .3) }, 'desliza');
// 26 — o eco do começo: radiação cósmica de fundo
S(26, (tl, t) => { c.fillStyle = NEB.v0; c.fillRect(0, 0, W, H); const u = eo(ramp(tl, .2, 1.4)); radiacao(540, 880, 470 * u + 1, t); pl(tl, 26, 'O ECO DO BIG BANG', 'RADIAÇÃO CÓSMICA DE FUNDO', { size: 70 }); txt('VEM DE TODAS AS DIREÇÕES', 540, 1250, 44, CI, { align: 'center', a: ramp(tl, 2.5, 3) }) }, 'iris');
// 27 — capítulo 4: nem todo mundo aceita essa história
S(27, (tl, t) => { fundo(t, { seed: 27 }); const q = rng(3); for (let i = 0; i < 14; i++) txt('?', 80 + q() * 920, 420 + q() * 1000, 60 + q() * 120, i % 2 ? RS : P.lav, { align: 'center', a: ramp(tl, 2.6 + i * .1, 2.9 + i * .1) * .8 }); grande(tl, 'NEM TODO MUNDO ACEITA', 940, 72, P.creme, 2.8); capitulo(tl, 4, CAPS.j) }, 'escuro');
// 28 — "é uma invenção, a verdade está escondida"
S(28, (tl, t) => { c.fillStyle = '#100a1a'; c.fillRect(0, 0, W, H); for (let i = 0; i < 12; i++) c.fillStyle = i % 2 ? '#140e22' : '#100a1a', c.fillRect(0, i * 160, W, 80); pasta(540, 860, 1.4, t); carimbo(tl, 1.2, 'CONFIDENCIAL', 540, 760, 84, VER, -.2); grande(tl, 'UMA INVENÇÃO?', 1340, 84, P.creme, .4); txt('TEORIA DA CONSPIRAÇÃO', 540, 1410, 36, P.lav, { align: 'center', a: ramp(tl, 1.8, 2.2) }) }, 'cortina');
// 29 — vivemos numa simulação?
S(29, (tl, t) => { c.fillStyle = '#04060c'; c.fillRect(0, 0, W, H); simulacao(t, ramp(tl, 0, .6)); grande(tl, 'UMA SIMULAÇÃO?', 1340, 92, CI, .5); txt('CRIADA POR ALGUÉM DE FORA', 540, 1410, 38, P.creme, { align: 'center', a: ramp(tl, 2.5, 3) }) }, 'flash');
// 30 — multiverso
S(30, (tl, t) => { fundo(t, { seed: 30 }); bolhas(t); pl(tl, 30, 'MULTIVERSO', 'NOSSO UNIVERSO: SÓ UMA BOLHA?', { size: 80 }) }, 'nevoa');
// 31 — ciclos eternos
S(31, (tl, t) => { fundo(t, { seed: 31 }); ciclo(540, 880, 380, t); pl(tl, 31, 'CICLOS ETERNOS', 'NASCE, MORRE, RECOMEÇA', { size: 80 }) }, 'iris');
// 32 — nenhuma foi provada
S(32, (tl, t) => { fundo(t, { seed: 32 }); const icon = [[260, 'pasta'], [540, 'sim'], [820, 'bolha']]; icon.forEach(([x, k], i) => { c.save(); c.globalAlpha = ramp(tl, .1 + i * .2, .4 + i * .2); if (k === 'pasta') pasta(x, 820, .4, t); if (k === 'sim') { c.save(); c.translate(x - 540 * .35, 820 - 860 * .35); c.scale(.35, .35); simulacao(0, 1); c.restore() } if (k === 'bolha') { c.save(); c.beginPath(); c.arc(x, 820, 110, 0, 7); c.clip(); c.fillStyle = NEB.v3; c.fillRect(x - 110, 710, 220, 220); galaxia(x, 820, 90, t, { seed: 40 }); c.restore(); c.strokeStyle = NEB.cia2; c.lineWidth = 5; c.beginPath(); c.arc(x, 820, 110, 0, 7); c.stroke() } c.restore() });
  carimbo(tl, 1.4, 'NÃO PROVADO', 540, 820, 110, VER, -.12); grande(tl, 'A CIÊNCIA AINDA', 1220, 64, P.creme, tw(32, 'ciência') - .2); grande(tl, 'NÃO TEM TODAS AS RESPOSTAS', 1300, 56, CI, tw(32, 'respostas') - .3) }, 'cortina');
// 33 — capítulo 5: Georges Lemaître, padre e físico
S(33, (tl, t) => { c.fillStyle = bands(0, 0, 0, H, [[.6, '#1a1230'], [1, '#120c22']]); c.fillRect(0, 0, W, H); quadroNegro(60, 470, 640, 520, t, ramp(tl, 3, 6)); lemaitre(800, 1560, 1.55, t); pl(tl, 33, 'GEORGES LEMAÎTRE', 'PADRE CATÓLICO E FÍSICO · BÉLGICA', { t0: 2.8, size: 70 }); capitulo(tl, 5, CAPS.m) }, 'escuro');
// 34 — ciência e fé
S(34, (tl, t) => { fundo(t, { seed: 34 }); c.save(); c.translate(300, 860); c.lineWidth = 12; for (let k = 0; k < 3; k++) { c.strokeStyle = CI; c.save(); c.rotate(k * PI / 3 + t * .3); c.beginPath(); c.ellipse(0, 0, 160, 60, 0, 0, 7); c.stroke(); c.restore() } disc(0, 0, 26, RS); c.restore();
  c.save(); c.translate(780, 860); poly([[-24, -180], [24, -180], [24, -70], [110, -70], [110, -24], [24, -24], [24, 180], [-24, 180], [-24, -24], [-110, -24], [-110, -70], [-24, -70]], P.creme); poly([[24, -180], [24, 180], [10, 180], [10, -180]], '#c8bce8'); c.restore();
  txt('CIÊNCIA', 300, 1140, 60, CI, { align: 'center', a: ramp(tl, .2, .5) }); txt('FÉ', 780, 1140, 60, P.creme, { align: 'center', a: ramp(tl, .5, .8) }); grande(tl, 'NÃO ERAM INIMIGAS', 1330, 76, RS, 1) }, 'desliza');
// 35 — por que existe alguma coisa, em vez de nada?
S(35, (tl, t) => { c.fillStyle = '#030208'; c.fillRect(0, 0, W, H); const q = rng(35); for (let i = 0; i < 120; i++) { c.fillStyle = `rgba(243,238,252,${.2 + q() * .5 * ramp(tl, 1, 4)})`; c.fillRect(q() * W, q() * H, 2, 2) }
  txt('POR QUE EXISTE', 540, 780, 84, P.creme, { align: 'center', a: ramp(tl, tw(35, 'existe') - .3, tw(35, 'existe')) }); txt('ALGUMA COISA', 540, 880, 84, P.creme, { align: 'center', a: ramp(tl, tw(35, 'alguma') - .2, tw(35, 'alguma') + .1) }); txt('EM VEZ DE NADA?', 540, 1000, 96, RS, { align: 'center', a: ramp(tl, tw(35, 'nada') - .3, tw(35, 'nada')) }) }, 'escuro');
// 36 — para bilhões de pessoas, a resposta é Deus
S(36, (tl, t) => { c.fillStyle = '#06040e'; c.fillRect(0, 0, W, H); const u = ramp(tl, tw(36, 'primeira') - .3, tw(36, 'primeira') + 1); raios(540, 300, t, .3 + .7 * ramp(tl, 0, 1.5), 2600); centelha(540, 300, Math.max(ramp(tl, 0, 1.2) * .5, u), t); colinas(1380); pessoaCostas(540, 1560, 1.1, { borda: '#fff0d0' });
  grande(tl, 'DEUS', 760, 150, '#fff6e0', tw(36, 'deus') - .2); txt('O CRIADOR, PARA BILHÕES DE PESSOAS', 540, 860, 40, P.lav, { align: 'center', a: ramp(tl, tw(36, 'criador') - .2, tw(36, 'criador') + .3) }); txt('A PRIMEIRA LUZ', 540, 1180, 56, NEB.ama, { align: 'center', a: ramp(tl, tw(36, 'primeira') - .2, tw(36, 'primeira') + .3) }) }, 'flash');
// 37 — talvez nunca saibamos tudo
S(37, (tl, t) => { zoomTela(lerp(1, 1.06, tl / L(37)), 540, 900, () => { fundo(t, { seed: 37 }); galaxia(540, 640, 420, t, { seed: 41, inc: .55, ang: -.2 }); colinas(1280); pessoaCostas(540, 1520, 1.2) }); grande(tl, 'IMENSO E BRUTAL', 1220, 72, P.creme, .3) }, 'nevoa');
// 38 — final: de onde viemos?
S(38, (tl, t) => { const z = lerp(1.18, 1, eo(ramp(tl, 0, 8))); zoomTela(z, 540, 1100, () => { fundo(t, { seed: 38 }); galaxia(540, 520, 500, t, { seed: 41, inc: .55, ang: -.2 }); colinas(1280); pessoaCostas(540, 1520, 1.2) });
  grande(tl, 'DE ONDE VIEMOS?', 1180, 100, RS, tw(38, 'viemos') - .2); const f = ramp(tl, L(38) - 4, L(38) - 3.4); if (f > 0) { c.fillStyle = `rgba(9,6,25,${f * .8})`; c.fillRect(0, 0, W, H); txt('A VASTIDÃO', 540, 860, 120, P.creme, { align: 'center', a: f }); txt('DO UNIVERSO', 540, 980, 96, CI, { align: 'center', a: f }) } }, 'nevoa');
