// ===== As 49 cenas (índice = posição em CUTS) =====
const S = (i, fn) => shot(CUTS[i], CUTS[i + 1], fn);
const capIdx = {}; CAPT.forEach(([t0, n, tit]) => capIdx[CUTS.indexOf(t0)] = [n, tit]);
// cartão de capítulo: moeda girando, moldura dourada e o título escrito à máquina
function cartao(i) { const [n, tit] = capIdx[i]; S(i, (tl, t) => { R(0, 0, PW, PH, '#120e1e'); for (let y = 0; y < PH; y += 4) R(0, y, PW, 1, '#18132a'); estrelas(t); moldura(P.our2); R(6, 6, PW - 12, 1, P.our3); R(6, PH - 7, PW - 12, 1, P.our3);
  moeda(90, 120, 22, { giro: cos(t * 3), relevo: 'cifrao' }); brilhos(t, 90, 120, 30, 8);
  txt(maquina('CAPÍTULO ' + n, tl, .1, 18), 540, 1080, 46, P.ama); txt(maquina(tit, tl, .45, 24), 540, 1190, tit.length > 18 ? 52 : 66, P.bra); R(50, 210, floor(80 * ease(ramp(tl, .3, .9))), 1, P.our) }) }

// 0 — hoje: café pago com o celular
S(0, (tl, t) => { R(0, 0, PW, PH, '#2a1e1a'); for (let y = 0; y < 150; y += 6) R(0, y, PW, 3, '#33251f'); R(0, 150, PW, 8, '#5a3a24'); R(0, 158, PW, 100, '#7a4e2e'); for (let x = 0; x < PW; x += 12) R(x, 158, 1, 100, '#6a4226');
  R(20, 40, 50, 30, '#1a1414'); txt('CAFÉ', 270, 380, 30, P.ama); R(110, 30, 50, 60, '#3a2a22'); for (let k = 0; k < 4; k++) R(114, 36 + k * 13, 42, 9, ['#c84a3a', '#e8a040', '#5a9a4a', '#3a78d8'][k]);
  sp('cafe', 40, 132, 3); const u = ease(ramp(tl, .6, 1.4)); sp('cel', lerp(150, 112, u), lerp(200, 118, u), 4); R(118, 118 + 30, 18, 0, '#fff');
  if (tl > 1.5) { const b = ramp(tl, 1.5, 1.9); disco(126, 132, floor(6 + b * 14), b < 1 ? 'rgba(90,220,160,.35)' : 'rgba(90,220,160,.15)'); if (tl > 1.8) { R(118, 128, 16, 8, '#2aca8a'); linha(121, 132, 124, 135, '#fff'); linha(124, 135, 131, 128, '#fff') } }
  R(96, 150, 50, 6, '#2a2a30'); R(100, 140, 42, 10, '#3a3a44'); R(104, 143, 20, 4, '#5af0a0');
  grande(tl, 'PAGO!', 1240, 60, '#5af0a0', 1.9) });
// 1 — milhares de anos atrás: sem dinheiro nenhum
S(1, (tl, t) => { faixas(0, 190, ['#e8905a', '#f0a868', '#f8c080', '#fcd8a0']); sol(130, 150, 14); montanhas(190, '#9a6a5a', 4, 40); montanhas(200, '#7a5048', 9, 26); chao(200, '#8a6a3a', '#7a5a30', 2);
  casinha(20, 228, 22, 14, '#b08050', '#7a5a30'); casinha(140, 232, 24, 16, '#a87848', '#6a4a28'); for (let i = 0; i < 5; i++) { const fx = 90 + sin(t * 8 + i) * 2, fy = 236 - i * 3 - (t * 10 % 3); px(fx, fy, i < 2 ? P.ama : '#ff8a30') } R(86, 238, 9, 2, '#5a3a20');
  pessoa(70, 248, { t, roupa: '#a8784a', calca: '#8a5a30', cab: '#2a1a10' }); pessoa(112, 250, { t, roupa: '#b88a5a', calca: '#7a4a28', flip: true, cab: '#1a1008', barba: true }); sp('ovelha', 30, 250, 1); sp('ovelha', 130, 255, 1, true);
  placa(tl, 'HÁ MILHARES DE ANOS', 'SEM DINHEIRO NENHUM', { t0: .2 }) });
// 2 — título
S(2, (tl, t) => { R(0, 0, PW, PH, '#140f22'); estrelas(t); chuvaMoedas(t, 26, 4); R(20, 120, 140, 70, 'rgba(20,15,34,.85)'); moldura(P.our2);
  txt(maquina('A HISTÓRIA', tl, .1, 18), 540, 860, 74, P.bra); txt(maquina('DO DINHEIRO', tl, .6, 18), 540, 980, 88, P.ama); txt('COMO ELE MUDOU O MUNDO', 540, 1080, 28, P.cre, { a: ramp(tl, 1.3, 1.6) }) });

// --- capítulo 1: a troca ---
cartao(3);
// 4 — escambo: peixe por trigo, ovelha por ferramentas
S(4, (tl, t) => { ceuDia(); nuvem(20 + t * 3 % 200, 30, 2); nuvem(120 - t * 2 % 200, 60); montanhas(170, '#6a9a6a', 3, 30); chao(170, '#7ab050', '#6a9a44', 5); R(0, 190, PW, 30, '#c8a868'); for (let i = 0; i < 30; i++) px((i * 37) % 180, 192 + (i * 13) % 26, '#b09058');
  const u = ease(ramp(tl, .8, 2.2)); pessoa(50, 240, { t, roupa: '#4a7ab0', calca: '#3a4a6a', braco: 'frente' }); pessoa(130, 240, { t, roupa: '#b07a3a', calca: '#6a4a28', braco: 'frente', flip: true, barba: true });
  sp('peixe', lerp(58, 108, u), 222 - sin(u * PI) * 14, 2); sp('saco', lerp(114, 64, u), 214 - sin(u * PI) * 14, 2, true);
  const v = ramp(tl, 2.6, 3); if (v > 0) { sp('ovelha', 20, 262, 2); sp('saco', 136, 258, 1); R(130, 266, 14, 2, '#8a8a9a'); R(128, 262, 3, 7, '#6a4a28'); txt('⇄', 540, 1530, 0, P.bra) }
  placa(tl, 'PEIXE POR TRIGO', null, { t0: .4, size: 48 }); txt('OVELHA POR FERRAMENTAS', 540, 330, 30, P.bra, { a: v }) });
// 5 — ESCAMBO
S(5, (tl, t) => { faixas(0, PH, ['#2a1e40', '#3a2a58', '#4a3a6a']); estrelas(t, 120); const itens = ['peixe', 'saco', 'ovelha', 'sal', 'concha', 'vaca'];
  itens.forEach((n, i) => { const a = i / itens.length * 2 * PI + t * .8, x = 90 + cos(a) * 60, y = 160 + sin(a) * 50; sp(n, x - 8, y - 6, 2) }); disco(90, 160, 20, '#5a4a8a'); disco(90, 160, 18, '#6a5aa0'); linha(78, 155, 102, 155, P.ama, 2); linha(98, 151, 102, 155, P.ama, 2); linha(78, 165, 102, 165, P.ama, 2); linha(78, 165, 82, 169, P.ama, 2);
  grande(tl, 'ESCAMBO', 300, 100, P.ama, .2); txt('TROCAR UMA COISA POR OUTRA', 540, 400, 28, P.bra, { a: ramp(tl, .6, .9) }) });
// 6 — o problema: o agricultor não quer peixe
S(6, (tl, t) => { ceuDia(['#5a6a9a', '#6a7aaa', '#8a9ac0', '#a8b8d0']); montanhas(170, '#5a7a6a', 6, 26); chao(170, '#6a9a4a', '#5a8a40', 7);
  pessoa(50, 240, { t, roupa: '#4a7ab0', calca: '#3a4a6a', braco: 'frente' }); sp('peixe', 58, 222, 2); pessoa(130, 240, { t, roupa: '#b07a3a', calca: '#6a4a28', flip: true, barba: true, braco: tl > 2 ? 'cima' : null });
  // balões de pensamento
  const v1 = ramp(tl, .3, .6); if (v1 > 0) { elipse(50, 160, 20, 14, '#f4f4f8'); disco(52, 182, 3, '#f4f4f8'); disco(50, 190, 2, '#f4f4f8'); sp('saco', 42, 150, 2) }
  const v2 = ramp(tl, 1.3, 1.6); if (v2 > 0) { elipse(132, 160, 20, 14, '#f4f4f8'); disco(130, 182, 3, '#f4f4f8'); disco(132, 190, 2, '#f4f4f8'); sp('vaca', 118, 152, 2) }
  if (tl > 2.4) { const b = floor(tl * 4) % 2 ? P.ver : '#ff6070'; linha(74, 200, 106, 232, b, 3); linha(106, 200, 74, 232, b, 3) }
  placa(tl, 'O PROBLEMA', 'CADA UM QUER UMA COISA DIFERENTE', { t0: .2, size2: 24 }); grande(tl, 'SEM TROCA!', 1320, 64, P.ver, 2.5) });
// 7 — coisas que todo mundo aceitava
S(7, (tl, t) => { R(0, 0, PW, PH, '#2a2034'); for (let y = 0; y < PH; y += 8) R(0, y, PW, 4, '#30263c');
  [['vaca', 'GADO', 30, 100], ['saco', 'GRÃOS', 120, 100], ['concha', 'CONCHAS', 30, 190], ['sal', 'SAL', 120, 190]].forEach(([n, nome, x, y], i) => { const v = ease(ramp(tl, .2 + i * .45, .5 + i * .45)); if (v <= 0) return; R(x - 4, y - 4, 44, 52, '#3a2e4a'); R(x - 4, y - 4, 44, 1, P.our2); R(x - 4, y + 47, 44, 1, P.our2); const e = n === 'vaca' ? 2 : n === 'concha' ? 5 : 3; sp(n, x + 18 - larg(SP[n][0]) * e / 2, y + 8 - (1 - v) * 10, e); txt(nome, (x + 18) * K, (y + 60) * K, 26, P.ama, { a: v }) });
  placa(tl, 'O QUE TODO MUNDO ACEITAVA', null, { t0: .1, size: 40 }) });
// 8 — pecus → pecuniário
S(8, (tl, t) => { faixas(0, 180, ['#c86a3a', '#d88a4a', '#e8a868']); chao(180, '#8a9a4a', '#7a8a40', 8); for (let i = 0; i < 4; i++) sp('vaca', 10 + i * 40 + sin(t + i) * 2, 196 + (i % 2) * 14, 2, i % 2 === 1);
  txt(maquina('PECUS', tl, .3, 12), 540, 340, 84, P.ama); txt('= GADO, EM LATIM', 540, 420, 30, P.bra, { a: ramp(tl, .7, 1) }); 
  const v = ramp(tl, 1.6, 2); if (v > 0) { R(30, 92, 120, 1, P.our); txt('PECUNIÁRIO', 540, 640, 60, P.cre, { a: v }); txt('RELATIVO A DINHEIRO', 540, 700, 26, P.bra, { a: v }) } });
// 9 — sal → salário
S(9, (tl, t) => { faixas(0, 200, ['#6a8ac8', '#8aa8d8', '#a8c4e8']); R(0, 200, PW, 120, '#c8b088'); templo(10, 200, 70, 40, '#e8e0d0'); for (let i = 0; i < 3; i++) R(100 + i * 25, 160, 16, 40, '#d8c8a8');
  pessoa(110, 268, { t, roupa: '#b02a2a', calca: '#8a6a40', chapeu: 'capacete', braco: 'frente', cinto: '#c8a050' }); sp('sal', 118, 250, 2); pessoa(60, 268, { t, roupa: '#e8e0d0', calca: '#d8d0c0', longo: 1, flip: false, cab: '#6a6a6a' });
  txt(maquina('SAL → SALÁRIO', tl, .4, 14), 540, 330, 64, P.ama); txt('SEGUNDO A TRADIÇÃO', 540, 400, 28, P.bra, { a: ramp(tl, 1, 1.3) }); txt('(É UMA HISTÓRIA ANTIGA, DISCUTIDA PELOS HISTORIADORES)', 540, 1450, 18, P.cre, { a: ramp(tl, 2, 2.3), max: 1000 }) });

// --- capítulo 2: as primeiras contas ---
cartao(10);
// 11 — Mesopotâmia: templo guardando cevada e prata
S(11, (tl, t) => { faixas(0, 210, ['#e8a050', '#f0b868', '#f8d090', '#fce4b0']); sol(40, 60, 10); chao(210, '#d8b070', '#c8a060', 11); zigurate(90, 210, 1.4); palmeira(16, 214); palmeira(166, 218);
  for (let i = 0; i < 5; i++) sp('saco', 20 + i * 12, 238, 1); for (let i = 0; i < 4; i++) sp('barra', 110 + (i % 2) * 11, 240 - floor(i / 2) * 4, 1);
  pessoa(70, 262, { t, roupa: '#e8dcc0', calca: '#c8b890', longo: 1, cab: '#1a1008', barba: true, chapeu: 'turbante' });
  placa(tl, 'MESOPOTÂMIA', 'CERCA DE 5.000 ANOS ATRÁS', { t0: .2 }); txt('CEVADA', 300, 1500, 26, P.cre, { a: ramp(tl, 1, 1.3) }); txt('PRATA', 780, 1500, 26, P.cre, { a: ramp(tl, 1.2, 1.5) }) });
// 12 — dívidas anotadas em tabuletas de barro
S(12, (tl, t) => { R(0, 0, PW, PH, '#4a3020'); for (let y = 0; y < PH; y += 10) R(0, y, PW, 5, '#523424'); R(0, 220, PW, 100, '#6a4428');
  const tb = ['bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb']; R(40, 70, 100, 140, '#8a5a30'); R(43, 73, 94, 134, '#c08a50'); R(43, 73, 94, 2, '#d8a468');
  const n = floor(clamp((tl - .3) * 14, 0, 60)); for (let k = 0; k < n; k++) { const lx = 50 + (k % 10) * 8, ly = 82 + floor(k / 10) * 20; R(lx, ly, 4, 1, '#6a4020'); R(lx + 1, ly + 1, 1, 4, '#6a4020'); if (k % 3 === 0) R(lx + 2, ly + 2, 3, 1, '#6a4020') }
  const k = n % 10, lx = 50 + k * 8, ly = 82 + floor(n / 10) * 20; linha(lx + 3, ly, lx + 26, ly - 30, '#c8a878', 2); pessoa(150, 300, { t, roupa: '#e8dcc0', calca: '#c8b890', longo: 1, flip: true, braco: 'frente', cab: '#1a1008', barba: true });
  placa(tl, 'TABULETAS DE BARRO', 'QUEM DEVIA O QUÊ', { t0: .2, y: 1400 }) });
// 13 — o siclo: peso de prata
S(13, (tl, t) => { R(0, 0, PW, PH, '#2a2030'); for (let y = 0; y < PH; y += 8) R(0, y, PW, 4, '#2e2436'); const a = .25 * cos(min(tl * 1.5, PI)) * (1 - ramp(tl, 2, 3));
  balanca(90, 230, a, (x, y) => { for (let i = 0; i < 3; i++) R(x - 6 + i * 4, y - 3, 3, 3, P.pra) }, (x, y) => sp('saco', x - 4, y - 9, 1));
  moeda(140, 110, 12, Object.assign({ giro: cos(t * 2) }, PRATA)); grande(tl, 'SICLO', 300, 90, P.pra, .2); txt('UM PESO DE PRATA (CERCA DE 8 G)', 540, 390, 30, P.bra, { a: ramp(tl, .6, .9) }); txt('DAVA PREÇO ÀS COISAS', 540, 1460, 30, P.ama, { a: ramp(tl, 1.4, 1.7) }) });
// 14 — a escrita nasceu (em parte) das contas
S(14, (tl, t) => { R(0, 0, PW, PH, '#3a2618'); const fases = [['|||| ||', 'CONTAGEM'], ['𒀭 𒈗 𒆠', 'SÍMBOLOS'], ['ESCRITA', 'ESCRITA']]; R(30, 90, 120, 120, '#c08a50'); R(33, 93, 114, 114, '#d09a60');
  for (let r2 = 0; r2 < 8; r2++) for (let c2 = 0; c2 < 12; c2++) { if (r2 * 12 + c2 > (tl - .2) * 30) continue; const x = 38 + c2 * 9, y = 100 + r2 * 13, k = (r2 * 5 + c2 * 3) % 4; R(x, y, 5, 1, '#7a4a24'); if (k) R(x + 1, y, 1, 4, '#7a4a24'); if (k === 2) R(x + 3, y + 2, 3, 1, '#7a4a24'); if (k === 3) linha(x, y + 4, x + 4, y + 1, '#7a4a24') }
  placa(tl, 'A ESCRITA', 'NASCEU, EM PARTE, PARA FAZER CONTAS', { t0: .3, size2: 24 }); txt('ESCRITA CUNEIFORME', 540, 1400, 30, P.cre, { a: ramp(tl, 1.2, 1.5) }) });

// --- capítulo 3: as moedas ---
cartao(15);
// 16 — reino da Lídia (Turquia), ~600 a.C.
S(16, (tl, t) => { const map = mapa(0, 60, 180, 160, 10, 50, 50, 25, ['#24448e', '#2a54a8', '#c8a868', '#b09058']); const [lx, ly] = map(28.5, 38.5); const b = floor(tl * 3) % 2;
  if (tl > .6) { disco(lx, ly, 5 + b, 'rgba(255,210,58,.5)'); disco(lx, ly, 3, P.ama) } txt('LÍDIA', lx * K, (ly - 12) * K, 34, P.bra, { a: ramp(tl, .7, 1) }); txt('(HOJE, TURQUIA)', lx * K, (ly + 18) * K, 22, P.cre, { a: ramp(tl, 1.2, 1.5) });
  placa(tl, 'REINO DA LÍDIA', 'POR VOLTA DE 600 A.C.', { t0: .2 }); moldura(P.our3) });
// 17 — as primeiras moedas: electro, com leão
S(17, (tl, t) => { R(0, 0, PW, PH, '#1c1426'); estrelas(t); const g = tl < 1.5 ? cos(tl * 6) : 1; moeda(90, 150, 46, Object.assign({ giro: g, relevo: 'leao', rel: '#f8e8a0' }, ELECTRO)); brilhos(t, 90, 150, 56, 10);
  grande(tl, 'ELECTRO', 1260, 66, ELECTRO.c1, 1.0); txt('OURO + PRATA', 540, 1340, 32, P.bra, { a: ramp(tl, 1.6, 1.9) }); placa(tl, 'AS PRIMEIRAS MOEDAS', null, { t0: .1, size: 48 }) });
// 18 — não precisava pesar: bastava contar
S(18, (tl, t) => { R(0, 0, PW, PH, '#2a2034'); balanca(50, 170, .2, (x, y) => R(x - 5, y - 4, 10, 4, P.pra2), null); if (tl > .5) { linha(22, 120, 78, 176, P.ver, 3); linha(78, 120, 22, 176, P.ver, 3) }
  const n = min(5, floor(max(0, tl - 1) * 2.4)); for (let i = 0; i < n; i++) { moeda(130, 176 - i * 5, 12, ELECTRO); } for (let i = 0; i < n; i++) txt(String(i + 1), (100 + (i % 3) * 30) * K, 1250 + floor(i / 3) * 80, 54, P.ama);
  txt('PESAR', 300, 1180, 40, P.bra); txt('CONTAR', 780, 1180, 40, P.ama, { a: ramp(tl, .9, 1.2) }) });
// 19 — dracma grego e denário romano
S(19, (tl, t) => { faixas(0, PH, ['#1c2a4a', '#24345a', '#2c3e6a']); const u = ease(ramp(tl, .2, .9)), v = ease(ramp(tl, 1.4, 2.1));
  moeda(50, lerp(-40, 140, u), 30, Object.assign({ giro: cos(t * 1.5) * .3 + .7, relevo: 'coruja' }, PRATA)); moeda(130, lerp(-40, 170, v), 30, Object.assign({ giro: cos(t * 1.5 + 1) * .3 + .7, relevo: 'perfil' }, PRATA));
  txt('DRACMA', 300, 1180, 48, P.ama, { a: u }); txt('GRÉCIA', 300, 1240, 26, P.bra, { a: u }); txt('DENÁRIO', 780, 1360, 48, P.ama, { a: v }); txt('ROMA', 780, 1420, 26, P.bra, { a: v }); placa(tl, 'A IDEIA SE ESPALHOU', null, { t0: .1, size: 46 }) });
// 20 — Juno Moneta: a casa da moeda de Roma
S(20, (tl, t) => { faixas(0, 200, ['#c8784a', '#d89058', '#e8a870']); R(0, 200, PW, 120, '#b8a888'); for (let x = 0; x < PW; x += 8) R(x, 200, 1, 120, '#a89878'); templo(20, 200, 140, 64, '#ece4d4', '#b0a898');
  const bate = (floor(t * 3) % 2); pessoa(60, 270, { t, roupa: '#8a6a4a', calca: '#5a4a3a', braco: bate ? 'cima' : 'frente', barba: true }); R(66, bate ? 240 : 252, 6, 3, '#5a5a6a'); R(68, 258, 10, 4, '#3a3a44'); if (!bate) { brilhos(t, 72, 256, 5, 4) }
  for (let i = 0; i < 6; i++) moeda(110 + (i % 3) * 10, 268 - floor(i / 3) * 5, 4, PRATA);
  txt(maquina('JUNO MONETA', tl, .3, 14), 540, 300, 60, P.ama); txt('MONETA → MOEDA', 540, 380, 34, P.bra, { a: ramp(tl, 1.2, 1.5) }) });
// 21 — China: moedas redondas com furo quadrado, num cordão
S(21, (tl, t) => { R(0, 0, PW, PH, '#3a1418'); for (let y = 0; y < PH; y += 6) R(0, y, PW, 3, '#421a1e'); R(0, 0, PW, 14, '#8a1a1a'); R(0, 14, PW, 2, P.our);
  linha(20, 70, 160, 250, '#c8a060', 2); const n = floor(clamp(tl * 6, 0, 14)); for (let i = 0; i < n; i++) { const u = i / 13; moeda(lerp(26, 154, u), lerp(78, 242, u), 9, Object.assign({ relevo: 'furo', fundo: '#3a1418' }, BRONZE)) }
  moeda(50, 200, 22, Object.assign({ relevo: 'furo', fundo: '#3a1418', giro: cos(t * 2) }, BRONZE)); placa(tl, 'CHINA', 'MOEDAS COM FURO, PARA O CORDÃO', { t0: .2, size2: 26 }) });

// --- capítulo 4: o papel-moeda ---
cartao(22);
// 23 — carregar moedas era pesado
S(23, (tl, t) => { faixas(0, 190, ['#d8a060', '#e8b878', '#f0d098']); montanhas(190, '#a87858', 12, 30); chao(190, '#c89868', '#b88858', 13); casinha(130, 220, 30, 20, '#c8a070', '#8a3a2a');
  const x = lerp(-10, 90, tl / L(23)); pessoa(x, 262, { t, anda: true, roupa: '#3a5a8a', calca: '#2a3a5a', braco: 'ambos', chapeu: 'gorro', chapCor: '#1a1a3a' }); for (let i = 0; i < 3; i++) { R(x - 10 + i * 7, 226 - (i % 2) * 4, 8, 9, '#8a6a40'); moeda(x - 6 + i * 7, 226 - (i % 2) * 4, 2, BRONZE) }
  if (floor(t * 2) % 2) { px(x + 6, 238, '#8ac8f0'); px(x + 7, 240, '#8ac8f0') } grande(tl, 'PESADO!', 300, 70, P.ama, .6) });
// 24 — a China cria o papel-moeda
S(24, (tl, t) => { R(0, 0, PW, PH, '#2a1414'); for (let y = 0; y < PH; y += 6) R(0, y, PW, 3, '#321a1a'); const u = ease(ramp(tl, .3, 1.4)), h = floor(150 * u);
  R(50, 70, 80, h, '#e8d8b0'); R(52, 72, 76, max(0, h - 4), '#f4e8c8'); if (h > 40) { R(60, 80, 60, 2, '#8a1a1a'); for (let k = 0; k < 6; k++) R(66 + k * 9, 92, 5, 18, '#3a2a1a'); } if (h > 100) { for (let k = 0; k < 3; k++) moeda(70 + k * 20, 130, 5, Object.assign({ relevo: 'furo', fundo: '#f4e8c8' }, BRONZE)); R(80, 160, 20, 20, '#c02020'); R(83, 163, 14, 14, '#e84040') }
  R(46, 66, 88, 5, '#6a3a1a'); R(46, 70 + h, 88, 5, '#6a3a1a'); placa(tl, 'PAPEL-MOEDA', 'CHINA · HÁ QUASE MIL ANOS', { t0: .3, y: 1370 }) });
// 25 — Marco Polo espantado
S(25, (tl, t) => { R(0, 0, PW, PH, '#5a2020'); R(0, 200, PW, 120, '#7a5030'); for (let i = 0; i < 6; i++) R(i * 34, 40, 8, 160, '#8a2a20'); R(0, 40, PW, 8, '#c8a040');
  pessoa(120, 270, { t, roupa: '#c8a040', calca: '#8a2a20', chapeu: 'coroa', flip: true, braco: 'frente', barba: true, longo: 1 }); cedula(78, 230, 26, 14, { c1: '#c8b080', c2: '#f4e8c8', c3: '#8a1a1a' });
  pessoa(50, 270, { t, roupa: '#3a5a2a', calca: '#5a3a20', chapeu: 'boina', chapCor: '#6a1a1a', barba: true, braco: tl > 1 ? 'ambos' : null });
  if (tl > 1) { const b = floor(tl * 4) % 2; R(48, 226 - b, 3, 8, P.ama); R(48, 236 - b, 3, 3, P.ama) } txt('MARCO POLO', 300, 1110, 30, P.bra, { a: ramp(tl, .3, .6) }); txt('KUBLAI KHAN', 720, 1110, 26, P.cre, { a: ramp(tl, .5, .8) });
  grande(tl, 'PAPEL VALENDO OURO?!', 330, 48, P.ama, 1.2) });
// 26 — imprimir demais: inflação
S(26, (tl, t) => { R(0, 0, PW, PH, '#1c1a24'); R(10, 150, 60, 70, '#5a5a6a'); R(14, 154, 52, 30, '#3a3a48'); R(20, 190, 40, 30, '#6a6a7a'); const sobe = floor(t * 6) % 2; R(20, 140 - sobe * 4, 40, 10, '#4a4a58');
  for (let i = 0; i < 10; i++) { const f = ((tl * 1.2 + i * .13) % 1); cedula(60 + f * 120, 190 - sin(f * PI) * 60 + i * 2, 20, 10, { c1: '#c8b080', c2: '#f4e8c8', c3: '#8a1a1a' }) }
  const u = ramp(tl, 1.2, L(26) - .3); R(110, 70, 2, 90, P.bra); R(110, 158, 60, 2, P.bra); let ly = 150; for (let i = 0; i < 50 * u; i++) { const ny = 150 - (i / 50) ** 2.4 * 80; linha(112 + i, ly, 113 + i, ny, P.ver, 2); ly = ny }
  txt('PREÇOS', 840, 400, 30, P.ver, { a: ramp(tl, 1.2, 1.5) }); grande(tl, 'INFLAÇÃO', 1360, 76, P.ver, L(26) - 1.4) });

// --- capítulo 5: os bancos ---
cartao(27);
// 27+1 — cambistas no banco de madeira (banca)
S(28, (tl, t) => { faixas(0, 150, ['#6ab0e8', '#8ac4f0', '#acd8f8']); for (let i = 0; i < 6; i++) { const h = 60 + (i * 37) % 40; R(i * 32, 150 - h, 30, h, ['#e8b878', '#d89a60', '#f0c890', '#c8885a'][i % 4]); for (let k = 0; k < 3; k++) R(i * 32 + 5 + k * 8, 160 - h, 4, 6, '#3a2a2a') } R(0, 150, PW, 170, '#c8a878'); for (let i = 0; i < 40; i++) R((i * 47) % 180, 150 + (i * 29) % 170, 6, 3, '#b89868');
  R(40, 222, 100, 6, '#8a5a2a'); R(40, 228, 100, 2, '#5a3a1a'); R(46, 230, 4, 22, '#6a4020'); R(130, 230, 4, 22, '#6a4020'); R(40, 220, 100, 2, '#a87040');
  pessoa(90, 222, { t, roupa: '#8a1a2a', calca: '#3a2a4a', chapeu: 'boina', chapCor: '#2a1a3a', braco: 'frente' }); for (let i = 0; i < 8; i++) moeda(60 + (i % 4) * 7, 218 - floor(i / 4) * 3, 3, i % 2 ? PRATA : {}); sp('barra', 112, 214, 1);
  pessoa(30, 262, { t, roupa: '#3a6a3a', calca: '#5a3a20', flip: false }); pessoa(150, 266, { t, roupa: '#6a4a8a', calca: '#3a2a3a', flip: true });
  txt(maquina('BANCA', tl, .4, 12), 540, 280, 78, P.ama); txt('BANCO DE MADEIRA → BANCO', 540, 350, 30, P.bra, { a: ramp(tl, 1.1, 1.4) }); txt('ITÁLIA', 540, 1450, 30, P.cre, { a: ramp(tl, .3, .6) }) });
// 29 — os Médici emprestam a reis e papas
S(29, (tl, t) => { R(0, 0, PW, PH, '#3a1e1e'); for (let x = 0; x < PW; x += 20) R(x, 0, 10, 220, '#42241f'); R(0, 220, PW, 100, '#5a3a28'); for (let x = 0; x < PW; x += 12) R(x, 220, 6, 100, '#64422e');
  disco(90, 140, 26, P.our); disco(90, 140, 24, '#e8c040'); [[0, -12], [-10, -4], [10, -4], [-8, 8], [8, 8], [0, 14]].forEach(([dx, dy], i) => disco(90 + dx, 140 + dy, 4, i ? P.ver : '#3a5ad8'));
  pessoa(50, 280, { t, roupa: '#6a1a2a', calca: '#2a1a2a', chapeu: 'boina', chapCor: '#3a0a1a', braco: 'frente', longo: 1 }); const u = ease(ramp(tl, 1, 2.2)); for (let i = 0; i < 3; i++) moeda(lerp(64, 116, u) + i * 4, 258 - sin(u * PI) * 20, 4);
  pessoa(130, 280, { t, roupa: '#8a2a8a', calca: '#3a1a3a', chapeu: 'coroa', flip: true, braco: 'frente', barba: true, longo: 1 }); txt('OS MÉDICI', 540, 260, 54, P.ama, { a: ramp(tl, .2, .5) }); txt('FLORENÇA', 540, 330, 28, P.bra, { a: ramp(tl, .4, .7) });
  txt('EMPRÉSTIMOS A REIS E PAPAS', 540, 1460, 28, P.cre, { a: ramp(tl, 1.4, 1.7) }) });
// 30 — cartas de crédito: Florença → Londres
S(30, (tl, t) => { const map = mapa(0, 50, 180, 200, -12, 18, 56, 40, ['#24448e', '#2a54a8', '#8ab060', '#6a9a50']); const [fx, fy] = map(11.25, 43.77), [lx, ly] = map(-0.12, 51.5);
  disco(fx, fy, 3, P.ama); disco(lx, ly, 3, P.ama); txt('FLORENÇA', fx * K, (fy + 14) * K, 28, P.bra); txt('LONDRES', lx * K, (ly - 8) * K, 28, P.bra);
  const u = ease(ramp(tl, .8, 2.8)); linha(fx, fy, lerp(fx, lx, u), lerp(fy, ly, u), P.ama, 1, 3); if (u > 0 && u < 1) sp('carta', lerp(fx, lx, u) - 5, lerp(fy, ly, u) - 10 - sin(u * PI) * 10, 1);
  if (tl < 1) { moeda(fx + 10, fy - 6, 4); moeda(fx + 14, fy - 4, 4) } if (u >= 1) { moeda(lx + 10, ly - 6, 4); moeda(lx + 14, ly - 4, 4); brilhos(t, lx + 12, ly - 5, 8, 4) }
  placa(tl, 'CARTA DE CRÉDITO', 'O OURO NÃO VIAJA, SÓ O PAPEL', { t0: .2, size2: 26 }) });

// --- capítulo 6: a prata que rodou o mundo ---
cartao(31);
// 32 — Potosí: a montanha de prata
S(32, (tl, t) => { faixas(0, 200, ['#4a6ab0', '#6a8ac8', '#8aaad8', '#b0c8e8']); nuvem(30, 40, 2); for (let x = 0; x < PW; x++) { const h = 150 - abs(x - 90) * 1.5; if (h > 0) { R(x, 220 - h, 1, h, x < 90 ? '#b0503a' : '#8a3a2a'); if ((x * 7) % 11 === 0) R(x, 220 - h + 8, 1, 3, '#d8dce8') } } R(80, 70, 20, 6, '#e8ecf4');
  chao(220, '#8a6a4a', '#7a5a3a', 14); for (let i = 0; i < 6; i++) R(60 + i * 12, 150 + (i % 2) * 20, 5, 7, '#1a1010'); casinha(10, 250, 22, 14, '#d8c8a8'); casinha(150, 252, 24, 14, '#e8d8b8');
  placa(tl, 'POTOSÍ', 'BOLÍVIA · A MONTANHA DE PRATA', { t0: .2, size2: 26 }); moeda(140, 290, 12, Object.assign({ giro: cos(t * 2), relevo: 'perfil' }, PRATA)); txt('PESO DE OITO', 600, 1500, 34, P.ama, { a: ramp(tl, 1.8, 2.1), align: 'right' }) });
// 33 — a primeira moeda global: rotas
S(33, (tl, t) => { const map = mapa(0, 70, 180, 150, -120, 150, 65, -45); const pts = [[-65.7, -19.6], [-80, 25], [-6, 37], [-77, 18], [121, 14], [120, 30]]; const xy = pts.map(([a, b]) => map(a, b));
  const rotas = [[0, 1], [1, 2], [3, 4], [4, 5]]; rotas.forEach(([a, b], i) => { const u = ease(ramp(tl, .3 + i * .8, 1.1 + i * .8)); if (u <= 0) return; const [x0, y0] = xy[a], [x1, y1] = xy[b]; linha(x0, y0, lerp(x0, x1, u), lerp(y0, y1, u), P.pra, 1, 3); if (u < 1) sp('navio', lerp(x0, x1, u) - 7, lerp(y0, y1, u) - 10, 1); else moeda(x1, y1, 3, PRATA) });
  disco(xy[0][0], xy[0][1], 3, P.pra); txt('AMÉRICA', 360, 1200, 24, P.bra, { a: ramp(tl, .3, .6) }); txt('EUROPA', 560, 560, 24, P.bra, { a: ramp(tl, 1.2, 1.5) }); txt('CHINA', 960, 640, 24, P.bra, { a: ramp(tl, 2.8, 3.1) });
  placa(tl, 'A PRIMEIRA MOEDA GLOBAL', null, { t0: .1, size: 44 }) });
// 34 — o custo: trabalho forçado nas minas
S(34, (tl, t) => { R(0, 0, PW, PH, '#120c0c'); for (let y = 40; y < 300; y += 3) R(0, y, PW, 1, y % 6 ? '#1a1212' : '#140e0e'); for (let i = 0; i < 8; i++) R(i * 24 + 6, 40, 4, 260, '#2a1c14');
  const luz = .5 + .5 * sin(t * 7) * .2; disco(90, 150, 40, `rgba(255,170,60,${.1 * luz + .05})`); disco(90, 150, 20, `rgba(255,190,80,${.1 + .05 * luz})`); R(88, 140, 4, 6, '#ffb040');
  for (let i = 0; i < 3; i++) { const bate = floor(t * 2.5 + i) % 2; pessoa(50 + i * 40, 250, { t, roupa: '#6a4a3a', calca: '#3a2a20', pele: '#a8704a', pele2: '#7a4a2a', cab: '#0a0808', braco: bate ? 'cima' : 'frente', flip: i === 2 }) }
  placa(tl, 'A UM CUSTO TERRÍVEL', 'INDÍGENAS FORÇADOS A TRABALHAR', { t0: .3, size: 46, size2: 26 }) });

// --- capítulo 7: a confiança ---
cartao(35);
// 36 — trocar papel por ouro
S(36, (tl, t) => { R(0, 0, PW, PH, '#2a2a34'); R(20, 60, 140, 190, '#4a4a58'); R(24, 64, 132, 182, '#3a3a46'); for (let i = 0; i < 4; i++) disco(150, 100 + i * 40, 2, '#8a8a9a');
  for (let r2 = 0; r2 < 5; r2++) for (let c2 = 0; c2 < 4 - (r2 % 2); c2++) sp('barra', 34 + c2 * 26 + (r2 % 2) * 13, 220 - r2 * 6, 2); brilhos(t, 80, 200, 30, 8);
  const u = ease(ramp(tl, .5, 1.5)); cedula(lerp(-40, 40, u), 90, 40, 20, {}); txt('1 NOTA = OURO', 540, 330, 54, P.ama, { a: ramp(tl, .3, .6) }); txt('O PAPEL ERA UMA PROMESSA', 540, 1460, 28, P.bra, { a: ramp(tl, 1.4, 1.7) }) });
// 37 — 1944: o dólar preso ao ouro
S(37, (tl, t) => { faixas(0, PH, ['#0e2a1a', '#123222', '#163a28']); cedula(30, 110, 120, 56, { c1: '#2a6a3a', c2: '#8ac89a', c3: '#123a20', txt: 1 }); txt('$', 300, 830, 90, '#0e3a1e'); for (let i = 0; i < 3; i++) sp('barra', 50 + i * 30, 220, 2);
  linha(90, 166, 90, 214, P.ama, 2, 2); txt(maquina('1944', tl, .2, 8), 540, 300, 96, P.ama); txt('O DÓLAR VIRA A BASE DO MUNDO', 540, 380, 30, P.bra, { a: ramp(tl, .8, 1.1) }); txt('PRESO AO OURO', 540, 1460, 32, P.ama, { a: ramp(tl, 1.6, 1.9) }) });
// 38 — 1971: a corrente se rompe
S(38, (tl, t) => { R(0, 0, PW, PH, '#1a1420'); cedula(20, 100, 60, 30, { c1: '#2a6a3a', c2: '#8ac89a', c3: '#123a20' }); sp('barra', 120, 106, 3); const quebra = tl > 1.2, d = quebra ? min(20, (tl - 1.2) * 30) : 0;
  for (let i = 0; i < 6; i++) { const x = 82 + i * 6 + (i < 3 ? -d : d), y = 116 + (i < 3 ? d * .4 : d * .6); elipse(x, y, 3, 2, P.pra2); elipse(x, y, 2, 1, '#1a1420') } if (quebra && tl < 1.6) { disco(100, 116, 8, '#fff8c0') }
  txt(maquina('1971', tl, .2, 8), 540, 300, 96, P.ama); txt('FIM DA TROCA POR OURO', 540, 380, 30, P.bra, { a: ramp(tl, 1.3, 1.6) }) });
// 39 — desde então: vale porque confiamos
S(39, (tl, t) => { R(0, 0, PW, PH, '#24182a'); const b = 1 + .08 * sin(t * 4); for (let j = -14; j <= 14; j++) for (let i = -16; i <= 16; i++) { const x = i / 14 / b, y = -j / 14 / b; if ((x * x + y * y - 1) ** 3 - x * x * y * y * y < 0) px(90 + i, 120 + j, (i + j) % 5 ? '#e84060' : '#ff6080') }
  pessoa(60, 250, { t, roupa: '#3a6ab0', calca: '#2a3a5a', braco: 'frente' }); pessoa(120, 250, { t, roupa: '#b05a3a', calca: '#5a3a2a', braco: 'frente', flip: true }); cedula(76, 226, 28, 14, {});
  grande(tl, 'CONFIANÇA', 1300, 80, P.ama, .5) });
// 40 — quando a confiança acaba, o dinheiro derrete
S(40, (tl, t) => { R(0, 0, PW, PH, '#2a1414'); const m = ramp(tl, .4, L(40)); cedula(40, 100 + m * 20, 100, floor(50 * (1 - m * .6)), { c1: '#2a6a3a', c2: '#8ac89a', c3: '#123a20' });
  for (let i = 0; i < 12; i++) { const x = 44 + i * 8, h = floor(m * (20 + (i * 37) % 50)); R(x, 150 + m * 20 - 10, 5, h, '#2a6a3a'); disco(x + 2, 150 + m * 20 - 10 + h, 3, '#3a8a4a') } R(20, 260, 140, 4, '#3a8a4a');
  grande(tl, 'O DINHEIRO DERRETE', 330, 54, P.ver, .5) });
// 41 — o Brasil teve nove moedas
S(41, (tl, t) => { faixas(0, PH, ['#0e3a24', '#124428', '#164e2e']); R(0, 0, PW, 10, '#f0c020'); R(0, 10, PW, 3, '#2a5ad8');
  const nomes = ['RÉIS', 'CRUZEIRO', 'CRUZEIRO NOVO', 'CRUZEIRO', 'CRUZADO', 'CRUZADO NOVO', 'CRUZEIRO', 'CRUZEIRO REAL', 'REAL']; nomes.forEach((n, i) => { const v = ramp(tl, .2 + i * .3, .4 + i * .3); txt(`${i + 1}. ${n}`, 540, 420 + i * 92, i === 8 ? 52 : 40, i === 8 ? P.ama : P.bra, { a: v }); if (v > 0 && i < 8 && tl > .5 + (i + 1) * .3) txt('—', 540, 420 + i * 92 - 12, 0, P.ver) });
  txt('O BRASIL TEVE 9 MOEDAS', 540, 300, 50, P.ama) });
// 42 — março de 1990: mais de 80% num mês
S(42, (tl, t) => { R(0, 0, PW, PH, '#e8e4dc'); for (let k = 0; k < 3; k++) { R(10, 90 + k * 55, 160, 4, '#8a8a9a'); for (let i = 0; i < 7; i++) R(16 + i * 22, 66 + k * 55, 16, 24, ['#e84040', '#3a78d8', '#f0c020', '#3caa50'][(i + k) % 4]) }
  const preco = floor(100 * 1.8 ** min(6, tl * 1.4)); R(46, 214, 88, 32, '#f4f060'); R(46, 214, 88, 2, '#c8c040'); txt('R$ ' + preco.toLocaleString('pt-BR'), 540, 1410, 44, '#1a1a1a', { max: 500 }); pessoa(150, 300, { t, roupa: '#e84040', calca: '#3a3a5a', flip: true, braco: floor(t * 4) % 2 ? 'frente' : null });
  txt('MARÇO DE 1990', 540, 190, 40, '#1a1a2a'); grande(tl, '+80% EM 1 MÊS', 330, 56, P.ver, .6) });
// 43 — Plano Real, 1994
S(43, (tl, t) => { faixas(0, PH, ['#123a6a', '#16447a', '#1a4e8a']); const u = ease(ramp(tl, .2, 1)); cedula(30, lerp(300, 100, u), 120, 60, { c1: '#3a7ab0', c2: '#a8d0f0', c3: '#1a3a6a' });
  // beija-flor da nota de 1 real
  const bx = 120, by = lerp(300, 100, u) + 22; R(bx, by, 8, 3, '#2aa070'); px(bx + 8, by + 1, '#3a3a3a'); px(bx + 9, by + 1, '#3a3a3a'); R(bx + 2, by - 3 + (floor(t * 12) % 2) * 2, 4, 2, '#5ad0a0');
  txt('PLANO REAL', 540, 280, 64, P.ama, { a: ramp(tl, .6, .9) }); txt('1994', 540, 360, 44, P.bra, { a: ramp(tl, .8, 1.1) }); brilhos(t, 90, 130, 60, 8) });

// --- capítulo 8: o dinheiro digital ---
cartao(44);
// 45 — números em computadores
S(45, (tl, t) => { R(0, 0, PW, PH, '#06120c'); const q = rng(9); for (let c2 = 0; c2 < 30; c2++) { const sp2 = 20 + q() * 40, ox = c2 * 6; for (let k = 0; k < 14; k++) { const y = ((t * sp2 + q() * 300 + k * 8) % 340) - 20; px(ox, y, k === 13 ? '#c0ffd0' : k > 9 ? '#3aca6a' : '#1a6a3a'); px(ox + 1, y + 1, k > 9 ? '#2a9a4a' : '#124a2a') } }
  for (let i = 0; i < 3; i++) { R(30 + i * 44, 120, 36, 100, '#1a2a2a'); for (let k = 0; k < 8; k++) { R(34 + i * 44, 126 + k * 12, 28, 8, '#243838'); px(58 + i * 44, 129 + k * 12, floor(t * 6 + k + i) % 3 ? '#3aff7a' : '#1a4a2a') } }
  txt('R$ 1.000.000,00', 540, 300, 56, '#5aff8a'); txt('A MAIOR PARTE DO DINHEIRO', 540, 1380, 32, P.bra, { a: ramp(tl, .6, .9) }); txt('SÃO SÓ NÚMEROS', 540, 1440, 32, P.ama, { a: ramp(tl, 1, 1.3) }) });
// 46 — cartões, bitcoin (2009) e Pix (2020)
S(46, (tl, t) => { R(0, 0, PW, PH, '#141a2a'); for (let y = 0; y < PH; y += 6) R(0, y, PW, 2, '#18203a'); const it = [['CARTÕES', 0], ['BITCOIN · 2009', 1.2], ['PIX · 2020', 2.6]];
  const v0 = ramp(tl, .1, .5), v1 = ramp(tl, 1.3, 1.7), v2 = ramp(tl, 2.7, 3.1);
  if (v0 > 0) sp('cartao', 66, 70 - (1 - v0) * 20, 4); if (v1 > 0) moeda(90, 160, 20, { giro: cos(t * 2), relevo: 'b', c1: '#f8a830', c2: '#e88a10', c3: '#8a4a08', rel: '#fff0d0' });
  if (v2 > 0) { const x = 90, y = 250, r = 18; for (let j = -r; j <= r; j++) { const w = r - abs(j); R(x - w, y + j, 2 * w + 1, 1, '#32bcad') } for (let j = -10; j <= 10; j++) { const w = 10 - abs(j); R(x - w, y + j, 2 * w + 1, 1, '#1a8a7e') } R(x - 2, y - 2, 5, 5, '#e8fff8') }
  txt('CARTÕES', 540, 600, 34, P.bra, { a: v0 }); txt('BITCOIN · 2009', 540, 1140, 34, '#f8a830', { a: v1 }); txt('PIX · 2020', 540, 1500 - 120 + 40, 40, '#5ae0d0', { a: v2 }) });
// 47 — das conchas ao celular
S(47, (tl, t) => { faixas(0, PH, ['#2a1e40', '#33264c', '#3c2e58']); const fases = [['concha', 'CONCHAS'], ['sal', 'SAL'], [null, 'MOEDAS'], ['nota', 'PAPEL'], ['cartao', 'CARTÃO'], ['cel', 'CELULAR']];
  fases.forEach(([n, nome], i) => { const v = ramp(tl, .1 + i * .45, .3 + i * .45); if (v <= 0) return; const x = 30 + (i % 3) * 60, y = 80 + floor(i / 3) * 100; R(x - 22, y - 22, 44, 44, '#4a3a6a'); R(x - 22, y - 22, 44, 1, P.our2); if (n) { const e = n === 'cel' || n === 'cartao' || n === 'nota' ? 2 : 3; sp(n, x - larg(SP[n][0]) * e / 2, y - SP[n][0].length * e / 2, e) } else moeda(x, y, 12, { relevo: 'leao' }); txt(nome, x * K, (y + 34) * K, 24, P.ama, { a: v }); if (i < 5 && i % 3 !== 2) txt('→', (x + 30) * K, (y + 4) * K, 0, P.bra) });
  placa(tl, 'MUDOU DE FORMA', 'MAS É A MESMA COISA', { t0: 2.9, y: 1380 }) });
// 48 — final: um acordo
S(48, (tl, t) => { R(0, 0, PW, PH, '#120e1e'); estrelas(t); chuvaMoedas(t * .6, 14, 8); const b = 1 + .05 * sin(t * 3);
  pessoa(56, 230, { t, roupa: '#3a6ab0', calca: '#2a3a5a', braco: 'frente' }); pessoa(124, 230, { t, roupa: '#b05a3a', calca: '#5a3a2a', braco: 'frente', flip: true }); sp('cel', 84, 202, 2); brilhos(t, 90, 210, 16, 6);
  txt('UM ACORDO', 540, 420, 80 * b, P.ama); txt('SÓ VALE PORQUE', 540, 520, 34, P.bra, { a: ramp(tl, 2.2, 2.5) }); txt('ACREDITAMOS NELE', 540, 580, 34, P.bra, { a: ramp(tl, 2.6, 2.9) });
  txt('A HISTÓRIA DO DINHEIRO', 540, 1460, 30, P.cre, { a: ramp(tl, L(48) - 2.5, L(48) - 2) }) });
