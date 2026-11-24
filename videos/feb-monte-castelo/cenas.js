// ===== As 35 cenas (índice = posição em CUTS). Cortes rápidos; o cursor "VOCÊ" interage em várias delas. =====
const SH = [], S = (i, fn) => SH[i] = fn, L = i => CUTS[i + 1] - CUTS[i];
function tw(k, palavra) { const p = palavra.toUpperCase(); for (const g of LEG) for (const [w, t] of g.w) if (w.replace(/[^\wÀ-ÿ-]/g, '') === p && t >= CUTS[k] - .05) return t - CUTS[k]; return 0 }
const ITmapa = (s = 52, lon0 = 12.4, lat0 = 42.2, cy = 820) => mapa(540, cy, s, lon0, lat0, [[EUROPA, '#2A3344'], [ITALIA, K.terra], [SICILIA, K.terra], [SARDENHA, K.terra]]);
const ATLmapa = (s = 6.2) => mapa(560, 860, s, -15, 12, [[SULAMERICA, '#7E5D33'], [AFRICA, '#2A3344'], [EUROPA, '#2A3344'], [BRASIL, K.terra]]);

// 0 — abertura: O BRASIL NA SEGUNDA GUERRA
S(0, (tl, t) => { papel(t); bandeira(390, 520, 300, t * 3); rot(tl, .1, 'POUCA GENTE SABE', 540, 420, K.tinta2);
  sobe(tl, .45, 'O BRASIL', 540, 1040, 150, K.tinta, {serif: 1}); sobe(tl, .7, 'na Segunda Guerra', 540, 1180, 104, K.verde, {serif: 1}); rot(tl, 1.2, '1942 — 1945', 540, 1270, K.tinta2, 34) });
// 1 — venceu uma das batalhas mais difíceis da Itália
S(1, (tl, t) => { const P = ITmapa(70, 11.5, 43.3, 760); const [x, y] = P(LUGAR.castelo); pino(x, y, tl / .3, K.verde, tl * .9); const [ax, ay] = caminho(tl, [[0, 900, 1300], [.4, x + 6, y + 4]]); cursor(ax, ay, tl, [1.0], {t0: .1});
  if (tl > 1.0) { cartao(x - 220, y - 250, 440, 160, stepR(tl - 1.0, 20, .85)); txt('MONTE CASTELO', x, y - 175, 46, K.tinta, {a: clamp((tl - 1.15) / .2)}); txt('ITÁLIA · 1945', x, y - 125, 28, K.verde, {w: 700, ls: 6, a: clamp((tl - 1.25) / .2)}) } });
// 2 — capítulo: 1942
S(2, (tl, t) => { papel(t); sobe(tl, .05, '1942', 540, 900, 300, K.tinta, {serif: 1}); rot(tl, .4, 'O ATLÂNTICO', 540, 1000, K.verde, 34); const u = out((tl - .5) / .6); c.fillStyle = K.mar; c.fillRect(0, 1120, W, 300 * u); for (let i = 0; i < 6; i++) { const x = ((tl * 60 + i * 200) % 1300) - 100; linha(x, 1180 + i * 30, x + 80, 1180 + i * 30, 'rgba(31,63,143,.25)', 5) } });
// 3 — submarinos alemães afundam navios brasileiros na nossa costa
S(3, (tl, t) => { c.fillStyle = K.mar; c.fillRect(0, 0, W, H); c.fillStyle = '#141C29'; c.fillRect(0, 900, W, 1020); for (let i = 0; i < 10; i++) linha((i * 137 + tl * 40) % W, 880 + (i % 3) * 8, (i * 137 + tl * 40) % W + 70, 880 + (i % 3) * 8, 'rgba(255,255,255,.7)', 5);
  const afunda = out((tl - 1.2) / 1.6); navio(560, 880 + afunda * 260, 1.4, afunda * .45, K.tinta, {t: tl}); if (tl > 1.15) { const f = clamp((tl - 1.15) / .25), g2 = c.createRadialGradient(600, 860 + afunda * 200, 0, 600, 860 + afunda * 200, 260); g2.addColorStop(0, `rgba(255,170,80,${.75 * f * (1 - afunda * .6)})`); g2.addColorStop(1, 'rgba(255,120,60,0)'); c.fillStyle = g2; c.fillRect(300, 600, 600, 600) } submarino(lerp(1300, 760, out(tl / 1.0)), 1160, 1.2); for (let i = 0; i < 8; i++) { const f = (tl * 1.4 + i / 8) % 1; if (tl > 1.2) disc(560 + sin(i * 3) * 80, 1040 - f * 160, 6 + f * 6, `rgba(255,255,255,${1 - f})`) }
  rot(tl, .2, 'COSTA BRASILEIRA · AGOSTO DE 1942', 540, 360, K.tinta2, 28); sobe(tl, .5, 'Navios afundados', 540, 480, 90, K.tinta, {serif: 1}) });
// 4 — centenas de pessoas morreram (contador)
S(4, (tl, t) => { papel(t); const n = Math.round(600 * out(tl / 1.6)); txt(`+${fmt(n)}`, 540, 900, 260, K.vermelho, {serif: 1}); rot(tl, .2, 'MORTOS SÓ EM AGOSTO DE 1942', 540, 1010, K.tinta2, 30);
  for (let i = 0; i < 6; i++) { const u = stepR(tl - .3 - i * .12, 22, .8); if (u > 0) { c.save(); c.globalAlpha = u; navio(170 + i * 148, 1250 + (1 - u) * 40, .38, .15, K.tinta2); c.restore() } } rot(tl, 1.1, '6 NAVIOS EM 5 DIAS', 540, 1360, K.tinta, 30) });
// 5 — o Brasil declarou guerra (o cursor assina; carimbo)
S(5, (tl, t) => { papel(t); cartao(150, 420, 780, 940, stepR(tl, 18, .9)); txt('ESTADOS UNIDOS DO BRASIL', 540, 540, 30, K.tinta2, {w: 700, ls: 5}); linha(260, 580, 820, 580, K.papel2, 3); txt('Declaração', 540, 700, 92, K.tinta, {serif: 1}); txt('de Guerra', 540, 790, 92, K.tinta, {serif: 1}); txt('22 de agosto de 1942', 540, 870, 36, K.tinta2, {w: 500});
  for (let i = 0; i < 5; i++) rr(240, 940 + i * 44, 600 - (i % 2) * 120, 12, 6, K.papel2);
  const u = clamp((tl - .5) / 1.0), [ax, ay] = caminho(tl, [[0, 950, 1500], [.2, 330, 1240]]); c.strokeStyle = K.azul; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); for (let k = 0; k <= 40 * u; k++) { const x = 330 + k * 9, y = 1240 + sin(k * .7) * 18 - k * .8; k ? c.lineTo(x, y) : c.moveTo(x, y) } c.stroke();
  const [sx, sy] = u > 0 && u < 1 ? [330 + 40 * u * 9, 1240 + sin(40 * u * .7) * 18 - 40 * u * .8] : [ax, ay]; cursor(sx, sy, tl, [.5], {t0: .05}); carimbo(tl, 1.7, 'GUERRA', 690, 1240, 70, K.vermelho, -.18) });
// 6 — "mais fácil uma cobra fumar"
S(6, (tl, t) => { papel(t); rot(tl, .1, 'O QUE DIZIAM NA ÉPOCA', 540, 420, K.tinta2); cobra(540, 880, 1.9, t, 0); sobe(tl, .5, '"Mais fácil uma', 540, 1340, 70, K.tinta, {serif: 1}); sobe(tl, .75, 'cobra fumar..."', 540, 1430, 70, K.tinta, {serif: 1}) });
// 7 — a cobra fumou (o cursor acende o cachimbo)
S(7, (tl, t) => { papel(t); const [ax, ay] = caminho(tl, [[0, 950, 1400], [.1, 720, 862]]); cursor(ax, ay, tl, [.45]); cobra(540, 880, 1.9, t, clamp((tl - .45) / .3)); if (tl > .45) disc(716, 852, 18 * stepR(tl - .45, 30, .6), '#FF8A2A'); carimbo(tl, .9, 'A COBRA FUMOU', 540, 1380, 74, K.verde, -.08) });
// 8 — mais de 25 mil brasileiros da FEB
S(8, (tl, t) => { papel(t); const n = 25834 * out(tl / 2.2); txt(fmt(n), 540, 560, 210, K.verde, {serif: 1}); rot(tl, .2, 'PRACINHAS DA FORÇA EXPEDICIONÁRIA', 540, 650, K.tinta2, 30);
  for (let i = 0; i < 150; i++) { const r = Math.floor(i / 15), col = i % 15, u = stepR(tl - .2 - (r * 15 + col) * .012, 24, .8); if (u > 0) { c.save(); c.globalAlpha = u; iconeSoldado(120 + col * 60, 840 + r * 66 + (1 - u) * 20, .32, i < 150 * min(1, tl / 2.2) ? K.tinta : K.cinza, false); c.restore() } } rot(tl, 1.3, 'CADA FIGURA ≈ 170 SOLDADOS', 540, 1560 - 120, K.tinta2, 26) });
// 9 — partiram para a Itália (rota Rio → Nápoles)
S(9, (tl, t) => { const P = ATLmapa(6.2), a = P(LUGAR.rio), b = P(LUGAR.napoles), u = io(tl / (L(9) - .3)); pino(...a, 1, K.verde); pino(...b, (tl - .2) / .3, K.tinta, tl);
  c.setLineDash([16, 14]); c.strokeStyle = K.verde; c.lineWidth = 6; c.beginPath(); const cx = (a[0] + b[0]) / 2 + 220, cy = (a[1] + b[1]) / 2; for (let k = 0; k <= 60 * u; k++) { const s = k / 60, x = (1 - s) ** 2 * a[0] + 2 * (1 - s) * s * cx + s * s * b[0], y = (1 - s) ** 2 * a[1] + 2 * (1 - s) * s * cy + s * s * b[1]; k ? c.lineTo(x, y) : c.moveTo(x, y) } c.stroke(); c.setLineDash([]);
  const s = u, nx = (1 - s) ** 2 * a[0] + 2 * (1 - s) * s * cx + s * s * b[0], ny = (1 - s) ** 2 * a[1] + 2 * (1 - s) * s * cy + s * s * b[1]; navio(nx, ny, .22, 0, K.tinta); txt('RIO', a[0] - 60, a[1] + 10, 30, K.tinta, {w: 800}); txt('NÁPOLES', b[0] + 10, b[1] - 34, 30, K.tinta, {w: 800}) });
// 10 — julho de 1944 (calendário)
S(10, (tl, t) => { papel(t); cartao(240, 520, 600, 640, stepR(tl, 18, .85)); rr(240, 520, 600, 130, 28, K.verde); txt('JULHO', 540, 610, 64, '#141820', {ls: 10});
  for (let i = 0; i < 31; i++) { const x = 300 + (i % 7) * 80, y = 720 + Math.floor(i / 7) * 80, on = i === 15; if (on) disc(x + 20, y - 14, 34 * stepR(tl - .8, 24, .6), K.verde); txt(String(i + 1), x + 20, y, 32, on && tl > .8 ? '#141820' : K.tinta2, {w: 600}) } sobe(tl, .3, '1944', 540, 1330, 120, K.tinta, {serif: 1}) });
// 11 — desembarcaram em Nápoles
S(11, (tl, t) => { const P = ITmapa(64, 13.6, 41.6, 800), [x, y] = P(LUGAR.napoles); pino(x, y, tl / .3, K.verde, tl); const [ax, ay] = caminho(tl, [[0, 200, 1400], [.3, x + 6, y + 4]]); cursor(ax, ay, tl, [.85]); if (tl > .85) { cartao(x - 380, y - 260, 380, 150, stepR(tl - .85, 20, .85)); txt('NÁPOLES', x - 190, y - 190, 44, K.tinta, {a: clamp((tl - 1) / .2)}); txt('16 · JUL · 1944', x - 190, y - 142, 26, K.verde, {w: 700, ls: 4, a: clamp((tl - 1.1) / .2)}) } });
// 12 — juntaram-se ao 5º Exército americano (organograma)
S(12, (tl, t) => { papel(t); const box = (x, y, w, s1, s2, u, col) => { cartao(x - w / 2, y - 70, w, 140, u, col); if (u > .5) { txt(s1, x, y - 6, 40, col === K.verde ? '#141820' : K.tinta, {a: (u - .5) * 2}); txt(s2, x, y + 40, 24, col === K.verde ? 'rgba(20,24,32,.8)' : K.tinta2, {w: 600, ls: 3, a: (u - .5) * 2}) } };
  box(540, 520, 560, '5º EXÉRCITO', 'ESTADOS UNIDOS', stepR(tl, 18, .85), '#1E2635'); const l = out((tl - .3) / .3); linha(540, 590, 540, 590 + 200 * l, K.tinta2, 4); box(540, 860, 560, 'IV CORPO', 'EUA', stepR(tl - .35, 18, .85), '#1E2635'); linha(540, 930, 540, 930 + 200 * out((tl - .7) / .3), K.tinta2, 4);
  box(540, 1200, 640, 'FEB', 'FORÇA EXPEDICIONÁRIA BRASILEIRA', stepR(tl - .8, 18, .85), K.verde); cursor(...caminho(tl, [[0, 950, 1500], [.9, 760, 1220]]), tl, [1.4], {t0: .6}) });
// 13 — general Mascarenhas de Moraes
S(13, (tl, t) => { papel(t); cartao(220, 420, 640, 860, stepR(tl, 18, .85)); c.save(); c.beginPath(); c.roundRect(220, 420, 640, 500, 18); c.clip(); general(540, 700, 1.05); c.restore(); txt('ILUSTRAÇÃO', 820, 900, 20, K.tinta2, {w: 600, al: 'right', ls: 3});
  txt('GENERAL', 540, 950, 30, K.tinta2, {w: 700, ls: 8}); sobe(tl, .3, 'Mascarenhas', 540, 1050, 84, K.tinta, {serif: 1}); sobe(tl, .5, 'de Moraes', 540, 1140, 84, K.tinta, {serif: 1}); rot(tl, .8, 'COMANDANTE DA FEB', 540, 1220, K.verde, 28) });
// 14 — capítulo MONTE CASTELO: as montanhas
S(14, (tl, t) => { papel(t); apeninos(t, 1250, 1); const u = out(tl / 1.2); montanha(220, 1300, 700, 420 * u, '#36404F'); montanha(880, 1300, 760, 480 * u, '#36404F'); montanha(540, 1300, 820, 640 * u, K.terra, .9); c.fillStyle = '#151B27'; c.fillRect(0, 1300, W, 620);
  sobe(tl, .5, 'Monte Castelo', 540, 450, 120, K.tinta, {serif: 1}); rot(tl, .9, 'APENINOS · NORTE DA ITÁLIA · 977 M', 540, 530, K.verde, 28) });
// 15 — posição alemã lá no alto
S(15, (tl, t) => { papel(t); apeninos(t, 1250, 1); montanha(540, 1300, 900, 700, K.terra, .9); c.fillStyle = '#151B27'; c.fillRect(0, 1300, W, 620); const u = stepR(tl - .2, 22, .7); rr(500, 560 - 30 * u, 80, 36, 8, K.cinza); rr(492, 552 - 30 * u, 96, 12, 6, '#7A848C'); carimbo(tl, .5, 'POSIÇÃO ALEMÃ', 540, 470, 44, K.vermelho, 0) });
// 16 — com visão de todo o vale (o cursor arrasta o "campo de visão")
S(16, (tl, t) => { papel(t); apeninos(t, 1250, 1); c.fillStyle = '#1F2734'; c.fillRect(0, 1180, W, 740); montanha(540, 1180, 820, 560, K.terra, .9); const u = io(tl / 1.4), ang = lerp(.2, 1.2, u);
  c.fillStyle = 'rgba(198,47,47,.18)'; c.beginPath(); c.moveTo(540, 620); c.lineTo(540 - 900 * sin(ang), 620 + 1100 * cos(ang * .35)); c.lineTo(540 + 900 * sin(ang), 620 + 1100 * cos(ang * .35)); c.closePath(); c.fill();
  for (let i = 0; i < 9; i++) { const x = 100 + i * 110, vis = abs(x - 540) < 900 * sin(ang) * .9; iconeSoldado(x, 1460, .4, vis ? K.vermelho : K.tinta2, false) } cursor(540 + 900 * sin(ang) * .6, 1240, tl, [], {t0: 0}); rot(tl, .3, 'ELES VIAM TUDO', 540, 420, K.vermelho, 34) });
// 17 — ataques em novembro e dezembro
S(17, (tl, t) => { papel(t); apeninos(t, 1250, 1); montanha(540, 1300, 900, 620, K.terra, .9); c.fillStyle = '#151B27'; c.fillRect(0, 1300, W, 620); const at = [['24 NOV', 200], ['25 NOV', 380], ['29 NOV', 700], ['12 DEZ', 880]];
  at.forEach(([d, x], i) => { const u = io((tl - .2 - i * .45) / .5); if (u <= 0) return; const ey = lerp(1500, 900, u); linha(x, 1500, lerp(x, 540, u * .6), ey, K.verde, 10); txt(d, x, 1570, 30, K.tinta, {w: 800}); if (u >= 1) xis(lerp(x, 540, .6), ey, 30, (tl - .7 - i * .45) / .25) }) });
// 18 — na neve, frio abaixo de zero
S(18, (tl, t) => { papel(t); const q = rng(4); for (let i = 0; i < 160; i++) { const x = (q() * W + sin(t + i) * 20), y = (q() * H + t * (80 + q() * 80)) % H; disc(x, y, 3 + q() * 5, '#C9D6DE') }
  rr(470, 520, 140, 620, 70, '#fff'); rr(470, 520, 140, 620, 70, 'rgba(20,33,46,.08)'); const nivel = lerp(600, 980, out(tl / 1.2)); rr(515, nivel, 50, 1090 - nivel, 25, K.azul); disc(540, 1110, 60, K.azul); for (let i = 0; i < 8; i++) rr(620, 580 + i * 60, 40, 5, 2, K.tinta2); linha(460, 900, 640, 900, K.vermelho, 4); txt('0 °C', 700, 910, 34, K.vermelho, {al: 'left'});
  sobe(tl, .5, 'abaixo de zero', 540, 1340, 90, K.azul, {serif: 1}) });
// 19 — muitos nunca tinham visto neve
S(19, (tl, t) => { papel(t); const q = rng(8); for (let i = 0; i < 140; i++) disc((q() * W), (q() * H + t * 90) % H, 3 + q() * 4, '#C9D6DE'); c.fillStyle = K.neve; c.fillRect(0, 1250, W, 670); for (let i = 2; i >= 0; i--) pracinha(300 + i * 250, 1330 - i * 30, 1.35 - i * .18, {pose: 'neve', t: t + i, flip: i === 2}); rot(tl, .3, 'PRIMEIRO INVERNO DA VIDA', 540, 460, K.azul, 32) });
// 20 — todos os ataques falharam
S(20, (tl, t) => { papel(t); ['NOV', 'NOV', 'NOV', 'DEZ'].forEach((m, i) => { const x = 200 + i * 230, u = stepR(tl - i * .1, 22, .8); cartao(x - 90, 760, 180, 220, u); txt(m, x, 900, 44, K.tinta, {a: u}); xis(x, 870, 60, (tl - .4 - i * .12) / .25) }); sobe(tl, .2, 'Quatro ataques', 540, 600, 90, K.tinta, {serif: 1}); rot(tl, .9, 'NENHUM CHEGOU AO TOPO', 540, 1120, K.vermelho, 32) });
// 21 — capítulo A VITÓRIA: 21 de fevereiro de 1945
S(21, (tl, t) => { papel(t); sobe(tl, .05, '21', 540, 880, 360, K.verde, {serif: 1}); sobe(tl, .3, 'de fevereiro de 1945', 540, 1010, 74, K.tinta, {serif: 1}); rot(tl, .6, 'OPERAÇÃO ENCORE', 540, 1090, K.tinta2, 30) });
// 22 — horas subindo a encosta sob fogo (o cursor arrasta a tropa morro acima)
S(22, (tl, t) => { papel(t); apeninos(t, 1250, 1); const pts = montanha(540, 1450, 1000, 900, '#4B5566', .9); c.fillStyle = '#151B27'; c.fillRect(0, 1450, W, 470); const u = io(tl / (L(22) - .3)), px = lerp(120, 540, u), py = lerp(1440, 560, u);
  c.setLineDash([14, 12]); linha(120, 1440, 540, 560, 'rgba(20,33,46,.35)', 5); c.setLineDash([]); linha(120, 1440, px, py, K.verde, 10); for (let i = 0; i < 5; i++) { const f = clamp(u - i * .04); pracinha(lerp(120, 540, f), lerp(1440, 560, f), .42, {pose: 'sobe', t: tl * 1.6 + i}) }
  for (let i = 0; i < 6; i++) { const f = (tl * 2 + i / 6) % 1; disc(540 + sin(i * 2) * 60, 560 + f * 300, 5, `rgba(198,47,47,${1 - f})`) } cursor(px + 30, py + 20, tl, [.1], {t0: 0}); const horas = Math.round(lerp(5, 17, u)); txt(`${String(horas).padStart(2, '0')}:${u < 1 ? '00' : '50'}`, 880, 420, 90, K.tinta, {serif: 1}); rot(tl, .2, 'HORÁRIO', 880, 330, K.tinta2, 26) });
// 23 — os pracinhas tomaram o topo (bandeira)
S(23, (tl, t) => { papel(t); apeninos(t, 1250, 1); montanha(540, 1450, 1000, 820, K.terra, .9); c.fillStyle = '#151B27'; c.fillRect(0, 1450, W, 470); const u = stepR(tl - .2, 14, .7); linha(540, 630, 540, 630 - 260 * u, '#5A3A1C', 10); if (u > .5) bandeira(546, 380 + (1 - u) * 260, 240, t * 4);
  pracinha(400, 760, .62, {t}); pracinha(690, 770, .6, {t, flip: true}); pracinha(548, 700, .66, {pose: 'bandeira', t}); rot(tl, .5, '17H50 · TOPO CONQUISTADO', 540, 1580 - 160, K.verde, 30) });
// 24 — Monte Castelo era brasileiro
S(24, (tl, t) => { papel(t); sobe(tl, .05, 'Monte Castelo', 540, 820, 130, K.tinta, {serif: 1}); carimbo(tl, .45, 'CONQUISTADO', 540, 1000, 80, K.verde, -.06); bandeira(410, 1130, 260, t * 3) });
// 25 — Senta a Pua (FAB)
S(25, (tl, t) => { papel(t); for (let i = 0; i < 3; i++) { const x = lerp(-300, 1400, (tl / L(25)) + i * .08), y = 620 + i * 210; linha(x - 520, y + 10, x - 200, y + 10, 'rgba(240,212,138,.18)', 5); caca(x, y, 1.6 - i * .3, {t: tl + i * .3, ang: -.05, num: ['A1', 'B4', 'D5'][i], bombas: i === 1}) } sobe(tl, .3, 'Senta a Pua!', 540, 1260, 120, K.verde, {serif: 1}); rot(tl, .7, '1º GRUPO DE AVIAÇÃO DE CAÇA · FAB', 540, 1340, K.tinta2, 26) });
// 26 — pontes, trens e depósitos (o cursor marca os alvos)
S(26, (tl, t) => { papel(t); const alvos = [['PONTES', 260, 680], ['TRENS', 820, 900], ['DEPÓSITOS', 360, 1160]]; const [ax, ay] = caminho(tl, [[0, 900, 1500], [.2, 260, 680], [1.1, 820, 900], [2.0, 360, 1160]]);
  alvos.forEach(([s, x, y], i) => { const tc = .45 + i * .9; cartao(x - 170, y - 90, 340, 180, stepR(tl - i * .1, 20, .85)); txt(s, x, y + 16, 46, K.tinta); xis(x + 130, y - 70, 26, (tl - tc) / .25, K.verde) }); cursor(ax, ay, tl, [.45, 1.35, 2.25]) });
// 27 — em terra: Castelnuovo e Montese
S(27, (tl, t) => { papel(t); apeninos(t, 1300, 1); const pl = [['MONTE CASTELO', '21 FEV', 300, 900, K.verde], ['CASTELNUOVO', '5 MAR', 560, 1010, K.tinta], ['MONTESE', '14 ABR', 800, 860, K.vermelho]]; c.setLineDash([12, 12]); c.strokeStyle = 'rgba(217,179,90,.6)'; c.lineWidth = 5; c.beginPath(); c.moveTo(300, 900); c.lineTo(300 + (560 - 300) * clamp((tl - .3) / .4), 900 + 110 * clamp((tl - .3) / .4)); if (tl > .75) c.lineTo(560 + 240 * clamp((tl - .75) / .4), 1010 - 150 * clamp((tl - .75) / .4)); c.stroke(); c.setLineDash([]);
  pl.forEach(([n, d, x, y, col], i) => { pino(x, y, (tl - i * .4) / .3, col, i === 2 ? tl : 0); if (tl > i * .4 + .15) { const u = stepR(tl - i * .4 - .15, 20, .85); cartao(x - 150, y - 210, 300, 130, u); txt(n, x, y - 150, 40, K.tinta, {a: u}); txt(d, x, y - 108, 30, col, {w: 700, ls: 4, a: u}) } }); rot(tl, .1, 'AVANÇO DA FEB · 1945', 540, 380, K.tinta2, 30) });
// 28 — Montese, a batalha mais sangrenta
S(28, (tl, t) => { papel(t); sobe(tl, .05, 'Montese', 540, 820, 170, K.tinta, {serif: 1}); rot(tl, .35, '14 DE ABRIL DE 1945', 540, 920, K.tinta2, 30); carimbo(tl, .7, 'A MAIS SANGRENTA', 540, 1090, 64, K.vermelho, -.1) });
// 29 — Fornovo
S(29, (tl, t) => { const P = ITmapa(140, 10.2, 44.6, 860), [x, y] = P(LUGAR.fornovo); pino(x, y, tl / .25, K.verde, tl * 1.5); txt('FORNOVO', x, y - 50, 44, K.tinta) });
// 30 — uma divisão alemã inteira se rende (bandeira branca)
S(30, (tl, t) => { papel(t); for (let i = 11; i >= 0; i--) { const x = 180 + (i % 4) * 240 + (Math.floor(i / 4) % 2) * 60, y = 1000 + Math.floor(i / 4) * 170, f = stepR(tl - .3 - i * .05, 22, .8); alemao(x, y + 120, .55 - Math.floor(i / 4) * .03, {rende: f > .5, flip: i % 2 === 1}) } rot(tl, .1, '148ª DIVISÃO ALEMÃ', 540, 480, K.tinta2, 32); sobe(tl, .3, 'se rendeu', 540, 620, 100, K.tinta, {serif: 1}) });
// 31 — cerca de 15 mil prisioneiros
S(31, (tl, t) => { papel(t); txt(fmt(15000 * out(tl / 1.4)), 540, 900, 240, K.verde, {serif: 1}); rot(tl, .2, 'PRISIONEIROS · 28-29 ABR 1945', 540, 1000, K.tinta2, 30) });
// 32 — cerca de 450 pracinhas não voltaram (memorial)
S(32, (tl, t) => { papel(t); for (let i = 0; i < 450; i++) { const col = i % 25, r = Math.floor(i / 25), u = clamp((tl - .2) * 160 - i); if (u <= 0) continue; const x = 140 + col * 33, y = 560 + r * 44; c.globalAlpha = u; rr(x - 2, y - 14, 4, 26, 1, K.tinta2); rr(x - 9, y - 8, 18, 4, 1, K.tinta2) } c.globalAlpha = 1;
  txt(`${Math.round(clamp((tl - .2) * 160, 0, 450))}`, 540, 470, 110, K.tinta, {serif: 1}); rot(tl, 2.6, 'NÃO VOLTARAM PARA CASA', 540, 1440, K.tinta, 32) });
// 33 — o Brasil saiu da guerra com uma vitória
S(33, (tl, t) => { papel(t); bandeira(320, 520, 440, t * 3); sobe(tl, .3, 'Uma vitória', 540, 1080, 120, K.tinta, {serif: 1}); sobe(tl, .55, 'que ninguém esperava', 540, 1190, 74, K.verde, {serif: 1}) });
// 34 — final: A cobra fumou (o cursor entrega a medalha)
S(34, (tl, t) => { papel(t); cobra(460, 840, 1.7, t, 1); const u = stepR(tl - .6, 18, .7); if (u > 0) { c.save(); c.translate(810, 1120); c.scale(u, u); disc(0, 0, 70, K.amarelo); disc(0, 0, 52, '#E2A90E'); txt('FEB', 0, 16, 46, K.tinta); c.restore(); linha(810, 1050, 810, 980, K.verde, 18) }
  cursor(...caminho(tl, [[0, 1000, 1600], [.3, 830, 1150]]), tl, [.6]); sobe(tl, .9, 'A cobra fumou.', 540, 1400, 110, K.tinta, {serif: 1}); txt('BRASIL NA 2ª GUERRA · 1942 — 1945', 540, 1480, 26, K.tinta2, {w: 700, ls: 5, a: clamp((tl - 1.4) / .3)}) });

// ---------- cartões de capítulo (por cima do início da cena) ----------
function capitulo(i, tl) { const tit = CAPT[i]; if (!tit) return; const u = 1 - clamp((tl - .8) / .22); if (u <= 0) return; c.save(); c.globalAlpha = u; c.fillStyle = '#0D1118'; c.fillRect(0, 0, W, H); const gl = c.createRadialGradient(540, 900, 0, 540, 900, 600); gl.addColorStop(0, 'rgba(217,179,90,.16)'); gl.addColorStop(1, 'rgba(217,179,90,0)'); c.fillStyle = gl; c.fillRect(0, 0, W, H);
  const n = Object.keys(CAPT).indexOf(String(i)) + 1, s2 = stepR(tl, 22, .9); txt('CAPÍTULO ' + n, 540, 840, 40, '#D9B35A', {w: 600, ls: 14}); c.fillStyle = '#D9B35A'; c.fillRect(540 - 220 * s2, 868, 440 * s2, 4); c.save(); c.beginPath(); c.rect(0, 890, W, 200); c.clip(); txt(tit, 540, 1010 + (1 - s2) * 120, 110, '#F3E6C4', {ls: 3}); c.restore(); c.restore() }
// ---------- legenda palavra por palavra (pílula branca, palavra-chave em verde) ----------
function legenda(t) { const g = LEG.find(g => t >= g.t0 && t < g.t1); if (!g) return; const sz = 64, ps = g.w.map(w => w[0].toUpperCase()); c.font = `800 ${sz}px Fira`; c.letterSpacing = '1px'; const esp = c.measureText(' ').width * 1.5 + 8, larguras = ps.map(p => c.measureText(p).width), tot = larguras.reduce((a, b) => a + b, 0) + esp * (ps.length - 1);
  const gl = c.createLinearGradient(0, 1560, 0, 1800); gl.addColorStop(0, 'rgba(8,10,16,0)'); gl.addColorStop(.5, 'rgba(8,10,16,.6)'); gl.addColorStop(1, 'rgba(8,10,16,0)'); c.fillStyle = gl; c.fillRect(0, 1560, W, 240); const y = 1700; let x = 540 - tot / 2;
  ps.forEach((p, i) => { const dito = t >= g.w[i][1], u = clamp((t - g.w[i][1]) / .08); c.save(); c.shadowColor = 'rgba(0,0,0,.7)'; c.shadowBlur = 12; c.fillStyle = !dito ? 'rgba(243,230,196,.35)' : i === g.dest ? '#D9B35A' : '#F3E6C4'; c.textAlign = 'left'; c.translate(x + larguras[i] / 2, y); const sc = dito ? 1 + (1 - u) * .18 : 1; c.scale(sc, sc); c.fillText(p, -larguras[i] / 2, 0); c.restore(); x += larguras[i] + esp }) }
// ---------- seek(t) ----------
window.seek = async (t) => { const i = max(0, CUTS.findIndex((a, k) => t >= a && t < CUTS[k + 1])), tl = t - CUTS[i]; c.save();
  // corte rápido com "empurrão": a cena nova entra 40 px deslocada e assenta em 0,18 s
  const e = 1 - out(tl / .18); c.translate(e * 40 * (i % 2 ? -1 : 1), 0); (SH[i] || (() => papel(t)))(tl, t); c.restore(); const vg = c.createRadialGradient(540, 860, 500, 540, 900, 1250); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.5)'); c.fillStyle = vg; c.fillRect(0, 0, W, H); capitulo(i, tl); legenda(t); const q = rng(Math.floor(t * 12) + 1), ox = q() * 512 | 0, oy = q() * 512 | 0; for (let x = -ox; x < W; x += 512) for (let y = -oy; y < H; y += 512) c.drawImage(GRAO, x, y);
  const f = max(1 - clamp(t / .25), clamp((t - (DUR - .5)) / .5)); if (f > 0) { c.fillStyle = `rgba(0,0,0,${f})`; c.fillRect(0, 0, W, H) } };
window.DUR = DUR;
(async () => { await DISTINTIVO.decode(); await document.fonts.load('800 40px Fira'); await document.fonts.load('600 40px Fira'); await document.fonts.ready; window.READY = true;
  if (location.search.includes('render')) return; const cv = document.getElementById('c'); cv.style.height = '100vh'; let t0 = performance.now(); (function loop(now) { seek(((now - t0) / 1000) % DUR); requestAnimationFrame(loop) })(t0) })();
