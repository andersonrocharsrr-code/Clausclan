// ================= Cenas: Leônidas, o rei de Esparta (3:03, vertical) =================
const L = k => CUTS[k + 1] - CUTS[k];
const zoomTela = (z, cx, cy, fn) => { c.save(); c.translate(cx, cy); c.scale(z, z); c.translate(-cx, -cy); fn(); c.restore() };
// hora (relativa à cena k) em que a palavra é dita
function tw(k, str) { const a = CUTS[k]; for (const l of LEG) for (const [s, ti] of l.w) if (ti >= a - .05 && s.replace(/[^\wÀ-ÿ-]/g, '') === str) return ti - a; return 0 }
function fundo(rgb = '185,138,62', base = P.noite0) { c.fillStyle = base; c.fillRect(0, 0, W, H); glow(W / 2, 860, 950, rgb, .4) }
function rotulo(x, y, x2, y2, str, u, lado = 1) { if (u <= 0) return; c.save(); c.globalAlpha = u; c.strokeStyle = P.bronze2; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y); c.lineTo(lerp(x, x2, eo(u)), lerp(y, y2, eo(u))); c.stroke(); disc(x, y, 7, P.bronze2); const w = largura(str, 40) + 30; rr(lado > 0 ? x2 : x2 - w, y2 - 34, w, 52, 8, 'rgba(20,10,8,.85)'); txt(str, lado > 0 ? x2 + 15 : x2 - 15, y2 + 6, 40, P.creme, { align: lado > 0 ? 'left' : 'right', sh: 0 }); c.restore() }
function chao(y, c1, c2) { c.fillStyle = c1; c.fillRect(0, y, W, H - y); c.fillStyle = c2; c.fillRect(0, y, W, 14) }
const cap = (k, n, key, tl) => capitulo(tl, n, CAPS[key]);
const SIMB = ['L', 'clava', 'olho', 'estrela', 'tridente'];

// 0 — 480 a.C.: o maior império do mundo marcha contra a Grécia
shot(CUTS[0], CUTS[1], (tl, t) => {
  zoomTela(lerp(1, 1.08, ramp(tl, 0, L(0))), 540, 1000, () => { ceu(t, 'sangue', { sy: 860, sr: 120 }); montes(1000, [[260, '#3a1a1a', '#2a1010', 31]]); chao(980, '#3a2216', '#4a2a1a'); exercitoLonge(t, 1000, 1240, 9, { band: '#c8a040' }) });
  for (let k = 0; k < 5; k++) persa(((tl * 70 + k * 260) % 1400) - 200, 1560, .78, t, { dir: true, passo: tl * .9 + k * .3, roupa: k % 2 ? '#6a3a7a' : '#7a2a3a', roupa0: k % 2 ? '#4a2456' : '#561a26' });
  placa(tl, 70, 250, '480 a.C.', .4, L(0) + 1, { sub: 'O IMPÉRIO PERSA AVANÇA', size: 90 });
});
// 1 — um desfiladeiro entre a montanha e o mar
shot(CUTS[1], CUTS[2], (tl, t) => { zoomTela(lerp(1.0, 1.25, ease(ramp(tl, 0, L(1)))), 470, 1000, () => termopilas(t)) }, 'zoom');
// 2 — Leônidas, rei de Esparta (título)
shot(CUTS[2], CUTS[3], (tl, t) => {
  fundo('163,25,27'); glow(540, 1000, 600, '233,194,122', .25); hoplitaFrente(560, 1360, 1.6, t, { escudo: 'lado', crista: 'trans' });
  const u = eo(ramp(tl, .2, .8)); rom('LEÔNIDAS', 540, 330 + (1 - u) * 30, 132, P.bronze2, { a: u }); c.save(); c.beginPath(); c.rect(540 - 360 * u, 360, 720 * u, 40); c.clip(); meandro(180, 368, 720, 22, P.bronze); c.restore(); rom('REI DE ESPARTA', 540, 460, 50, P.creme, { w: 700, a: ramp(tl, .7, 1.1), ls: 10 });
}, 'flash');
// 3 — capítulo 1, Esparta: o menino sai de casa aos 7 anos
shot(CUTS[3], CUTS[4], (tl, t) => {
  esparta(t); mae(260, 1330, 1.1); menino(lerp(380, 700, ease(ramp(tl, 1.6, L(3)))), 1340, 1.25, t, { passo: tl * .8, escudo: false }); hoplitaPerfil(lerp(560, 900, ease(ramp(tl, 1.6, L(3)))), 1350, .78, t, { passo: tl * .6, escudo: false });
  placa(tl, 70, 300, 'AGOGÊ', 2.0, L(3) + 1, { sub: 'A PARTIR DOS 7 ANOS', size: 90 }); cap(3, 1, 'b', tl);
}, 'escuro');
// 4 — luta, fome, frio e disciplina
shot(CUTS[4], CUTS[5], (tl, t) => {
  ceu(t, 'noite', { sx: 820, sy: 420, sr: 70 }); montes(1060, [[520, '#3a4250', '#2a303a', 41]], { neve: true }); chao(1040, '#d8d4cc', '#efece6');
  for (let k = 0; k < 5; k++) menino(120 + k * 110, 1240, .8, t, { parado: true, vara: k % 2 === 0, escudo: false });
  const lu = sin(t * 4) * 16; menino(640 + lu, 1380, 1.3, t, { passo: tl, }); menino(880 - lu, 1380, 1.3, t, { esq: true, passo: tl + .5 });
  const q = rng(4); for (let i = 0; i < 90; i++) { const x = (q() * W + t * 30) % W, y = (q() * H + t * (60 + q() * 60)) % H; disc(x, y, 2 + q() * 3, 'rgba(250,250,255,.7)') }
  ['LUTA', 'FOME', 'FRIO', 'DISCIPLINA'].forEach((s, i) => { const t0 = tw(4, s === 'DISCIPLINA' ? 'DISCIPLINA' : s); rom(s, 540, 330 + i * 110, i === 3 ? 92 : 84, i === 3 ? P.bronze2 : P.creme, { a: ramp(tl, t0 - .1, t0 + .2) }) });
}, 'cortina');
// 5 — o hoplita: escudo, lança, capacete, capa
shot(CUTS[5], CUTS[6], (tl, t) => {
  fundo('185,138,62'); zoomTela(lerp(1, 1.05, ramp(tl, 0, L(5))), 440, 1000, () => hoplitaFrente(440, 1330, 1.55, t, { escudo: 'lado', crista: 'long' }));
  rotulo(640, 960, 760, 860, 'ESCUDO (ÁSPIS)', ramp(tl, tw(5, 'ESCUDO') - .1, tw(5, 'ESCUDO') + .4));
  rotulo(316, 480, 140, 420, 'LANÇA', ramp(tl, tw(5, 'LANÇA') - .1, tw(5, 'LANÇA') + .4), -1);
  rotulo(470, 720, 700, 620, 'CAPACETE CORÍNTIO', ramp(tl, tw(5, 'CAPACETE') - .1, tw(5, 'CAPACETE') + .4));
  rotulo(300, 1180, 160, 1100, 'CAPA', ramp(tl, tw(5, 'CAPA') - .1, tw(5, 'CAPA') + .4), -1);
  rotulo(490, 1230, 720, 1200, 'GREVAS DE BRONZE', ramp(tl, tw(5, 'CAPA') + .7, tw(5, 'CAPA') + 1.1));
  placa(tl, 70, 250, 'HOPLITA', .1, L(5) + 1, { size: 86 });
}, 'poeira');
// 6 — Leônidas não deveria ser rei: tinha irmãos mais velhos
shot(CUTS[6], CUTS[7], (tl, t) => {
  fundo('120,40,30'); const bustos = [[230, 'CLEÔMENES', .55, 'brightness(.8) saturate(.7)'], [540, 'DORIEU', .55, 'brightness(.75) saturate(.6) hue-rotate(10deg)'], [850, 'LEÔNIDAS', .55, 'none']];
  bustos.forEach(([x, nome, s, f], i) => { const u = eo(ramp(tl, .3 + i * .5, .8 + i * .5)), ok = i === 2 && tl > 4; c.save(); c.globalAlpha = u; rr(x - 150, 640, 300, 520, 16, '#2a1410'); c.strokeStyle = ok ? P.bronze2 : '#6e4a1e'; c.lineWidth = ok ? 8 : 5; c.beginPath(); c.roundRect(x - 150, 640, 300, 520, 16); c.stroke(); c.save(); c.beginPath(); c.roundRect(x - 150, 640, 300, 520, 16); c.clip(); c.filter = f; c.translate(x, 900); c.scale(s, s); leonidasRosto(t); c.restore(); txt(nome, x, 1230, 46, ok ? P.bronze2 : P.creme, { align: 'center' }); c.restore() });
  const u0 = ramp(tl, 2.0, 2.4); if (u0 > 0) { rom('MAIS VELHOS', 385, 560, 50, P.creme, { a: u0, w: 700 }); line(130, 590, 640, 590, `rgba(233,194,122,${u0})`, 4) } if (tl > 4) add(() => glow(850, 900, 300, '233,194,122', .25 * ramp(tl, 4, 4.6)));
  placa(tl, 70, 250, 'O TERCEIRO FILHO', .2, L(6) + 1, { sub: 'DO REI ANAXÂNDRIDAS II', size: 70 });
}, 'iris');
// 7 — com a morte de Cleômenes, Leônidas assume o trono
shot(CUTS[7], CUTS[8], (tl, t) => { zoomTela(1.15, 540, 900, () => esparta(t, { ceu: 'aurora' })); c.fillStyle = 'rgba(20,8,6,.45)'; c.fillRect(0, 0, W, H); c.save(); c.translate(540, 1020); const z = lerp(1.7, 1.85, ramp(tl, 0, L(7))); c.scale(z, z); leonidasRosto(t); c.restore(); placa(tl, 70, 280, 'REI DE ESPARTA', .2, L(7) + 1, { sub: 'POR VOLTA DE 489 a.C.', size: 76 }) }, 'cortina');
// 8 — casou com Gorgo, famosa pela inteligência
shot(CUTS[8], CUTS[9], (tl, t) => { fundo('95,184,184', '#0c1818'); c.save(); c.translate(540, 1020); const z = lerp(1.7, 1.85, ramp(tl, 0, L(8))); c.scale(z, z); gorgoRosto(t); c.restore(); placa(tl, 70, 280, 'GORGO', .2, L(8) + 1, { sub: 'RAINHA DE ESPARTA', size: 90 }) }, 'desliza');
// 9 — capítulo 2, o Império: Xerxes no trono, em Persépolis
shot(CUTS[9], CUTS[10], (tl, t) => {
  c.fillStyle = lg(0, 0, 0, H, [[0, '#24101a'], [.6, '#4a2a2a'], [1, '#2a1a14']]); c.fillRect(0, 0, W, H); for (const x of [90, 300, 780, 990]) colunaPersa(x, 1400, 980, 1); rr(0, 1360, W, 600, 0, '#3a2418'); for (let k = 0; k < 12; k++) rr(k * 92, 1360, 88, 16, 2, '#5a3a24');
  c.fillStyle = 'rgba(163,25,27,.55)'; c.fillRect(380, 300, 320, 1060); for (let k = 0; k < 8; k++) disc(540, 360 + k * 130, 10, 'rgba(233,194,122,.6)');
  zoomTela(lerp(1, 1.06, ramp(tl, 0, L(9))), 540, 1100, () => { xerxes(540, 1380, 1.3, t); persa(170, 1420, .85, t, { dir: true, parado: true, roupa: '#c8a040', roupa0: '#9a7a2a', faixa: '#6a3a7a' }); persa(910, 1420, .85, t, { parado: true, roupa: '#c8a040', roupa0: '#9a7a2a', faixa: '#6a3a7a' }) });
  placa(tl, 70, 230, 'XERXES I', 2.0, L(9) + 1, { sub: 'REI DOS REIS DA PÉRSIA', size: 84 }); cap(9, 2, 'd', tl);
}, 'escuro');
// 10 — atravessa o Helesponto por pontes de barcos
shot(CUTS[10], CUTS[11], (tl, t) => {
  ceu(t, 'aurora', { sx: 820, sy: 520, hz: 760 }); montes(760, [[120, '#4a3a3a', '#3a2a2a', 51]]); mar(740, t, { brilho: 820 });
  const N = 22, ponto = p => [lerp(-120, 1250, p), lerp(1500, 780, Math.pow(p, .8)), lerp(1.1, .18, Math.pow(p, .6))];
  for (let k = N; k >= 0; k--) { const [x, y, s] = ponto(k / N); c.save(); c.translate(x, y); c.scale(s, s); el(0, 30, 70, 160, '#2a1c14', -1.05); el(-6, 20, 56, 140, '#4a3424', -1.05); c.restore() }
  c.strokeStyle = '#c8a46a'; c.lineCap = 'butt'; for (let k = 0; k < N; k++) { const [x1, y1, s1] = ponto(k / N), [x2, y2, s2] = ponto((k + 1) / N); c.lineWidth = 46 * s1; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke() }
  for (let k = 0; k < 16; k++) { const p = ((k / 16) + tl * .03) % 1, [x, y, s] = ponto(p); persa(x, y + 4, s * .3, t, { dir: true, passo: tl + k * .37, aljava: false, escudo: false }) }
  placa(tl, 70, 250, 'HELESPONTO', .2, L(10) + 1, { sub: 'PONTES FEITAS DE BARCOS', size: 84 });
}, 'zoom');
// 11 — capítulo 3, Termópilas: o plano no mapa
shot(CUTS[11], CUTS[12], (tl, t) => {
  c.fillStyle = P.noite0; c.fillRect(0, 0, W, H); mapaGrecia(t, { persia: true, tl, pulsa: 'termopilas', marcas: [['termopilas', 'TERMÓPILAS', P.carmim, 3.4], ['esparta', 'ESPARTA', P.bronze, 2.2], ['atenas', 'ATENAS', P.bronze, 2.6]], dir: { termopilas: -24 } });
  setaMapa([[26.4, 40.6], [25.2, 40.9], [23.6, 40.6], [22.9, 40.1], [22.6, 39.3], [22.62, 38.95]], ease(ramp(tl, 2.2, 5.2)), P.carmim, 14);
  setaMapa([[26.0, 40.0], [24.8, 39.8], [23.8, 39.4], [23.3, 39.1]], ease(ramp(tl, 2.8, 5.6)), '#7a4a6a', 10);
  placa(tl, 70, 250, 'O PLANO', 2.0, L(11) + 1, { sub: 'GANHAR TEMPO', size: 84 }); cap(11, 3, 'e', tl);
}, 'escuro');
// 12 — uma passagem estreita entre a montanha e o mar
shot(CUTS[12], CUTS[13], (tl, t) => {
  ceu(t, 'aurora', { sx: 860, sy: 640, hz: 1000 }); mar(1000, t, { brilho: 860 });
  c.fillStyle = '#d8bc84'; c.beginPath(); c.moveTo(380, 1000); c.lineTo(700, 1000); c.lineTo(1080, H); c.lineTo(0, H); c.fill(); c.fillStyle = '#c8a46a'; c.beginPath(); c.moveTo(380, 1000); c.lineTo(520, 1000); c.lineTo(360, H); c.lineTo(0, H); c.fill();
  c.fillStyle = '#4a3420'; c.beginPath(); c.moveTo(0, 0); c.lineTo(300, 0); c.lineTo(420, 700); c.lineTo(400, 1010); c.lineTo(0, H); c.fill(); c.fillStyle = '#6e5232'; c.beginPath(); c.moveTo(300, 0); c.lineTo(420, 700); c.lineTo(400, 1010); c.lineTo(330, 1010); c.lineTo(250, 0); c.fill(); for (let k = 0; k < 9; k++) line(40 + k * 30, 100 + k * 90, 260 + k * 20, 140 + k * 100, 'rgba(0,0,0,.18)', 6);
  for (let k = 0; k < 4; k++) { const ph = (t * .35 + k * .25) % 1; pill(560 + k * 30 + ph * 40, 1060 - ph * 160, 60 + ph * 120, 26, `rgba(245,240,230,${.45 * (1 - ph)})`) }
  for (let k = 0; k < 7; k++) hoplitaFrente(470 + k * 44, 1130, .17, t, { escudo: 'frente', lanca: true });
  const u = ramp(tl, tw(12, 'estreita') - .2, tw(12, 'estreita') + .3); if (u > 0) { c.save(); c.globalAlpha = u; line(440, 1200, 760, 1200, P.bronze2, 6); poly([[430, 1200], [460, 1184], [460, 1216]], P.bronze2); poly([[770, 1200], [740, 1184], [740, 1216]], P.bronze2); txt('PASSAGEM ESTREITA', 600, 1270, 46, P.creme, { align: 'center' }); c.restore() }
  placa(tl, 70, 250, 'PORTÕES QUENTES', .2, L(12) + 1, { sub: 'FONTES DE ÁGUA QUENTE', size: 76 });
}, 'cortina');
// 13 — Esparta em festa religiosa (Carneia)
shot(CUTS[13], CUTS[14], (tl, t) => { esparta(t, { ceu: 'noite', fogo: true }); c.fillStyle = 'rgba(20,10,30,.3)'; c.fillRect(0, 0, W, H); fogo(260, 1250, 1.1, t); fogo(820, 1250, 1.1, t + 2); placa(tl, 70, 250, 'FESTA DE CARNEIA', .2, L(13) + 1, { sub: 'EM HONRA DE APOLO', size: 76 }) }, 'flash');
// 14 — Leônidas parte com 300 espartanos
shot(CUTS[14], CUTS[15], (tl, t) => {
  ceu(t, 'dia', { sx: 220, sy: 520 }); montes(1020, [[420, '#8a8a72', '#6e6e58', 61], [260, '#6a7a4a', '#55623a', 62]]); chao(1000, '#b89a62', '#c8aa72');
  for (const [y, s, n] of [[1110, .4, 9], [1260, .58, 7], [1460, .82, 5]]) for (let k = 0; k < n; k++) { const sp = W / (n - 1.5), x = ((k * sp + tl * 90 * s) % (W + sp)) - sp / 2; hoplitaPerfil(x, y, s, t, { passo: tl * 1.1 + k * .5 + s, crista: k === 2 && s > .8 ? true : undefined }) }
  const u = eo(ramp(tl, .4, .9)); rom('300', 540, 470, 230, P.bronze2, { a: u }); rom('ESPARTANOS', 540, 560, 60, P.creme, { w: 700, a: ramp(tl, .8, 1.2), ls: 10 });
  txt('TODOS COM FILHOS VIVOS', 540, 650, 44, '#f2e2b8', { align: 'center', a: ramp(tl, tw(14, 'filhos') - .1, tw(14, 'filhos') + .3) });
}, 'zoom');
// 15 — cerca de 7 mil gregos de outras cidades se juntam
shot(CUTS[15], CUTS[16], (tl, t) => {
  ceu(t, 'aurora', { sx: 820, sy: 560 }); montes(1020, [[380, '#5a4636', '#46342a', 71]]); chao(1000, '#a8844e', '#b89462');
  for (const [y, s, n, cap0] of [[1150, .45, 8, '#5a6a8a'], [1330, .62, 6, '#3a5a3a'], [1530, .85, 5, P.carmim]]) for (let k = 0; k < n; k++) { const sp = W / (n - 1.5), x = ((k * sp + tl * 80 * s) % (W + sp)) - sp / 2; hoplitaPerfil(x, y, s, t, { passo: tl + k * .4, sym: SIMB[(k + Math.round(y)) % 5], capa: cap0, capa0: 'rgba(0,0,0,.3)' }) }
  rom('+ 7.000', 540, 470, 150, P.bronze2, { a: eo(ramp(tl, .3, .7)) }); rom('GREGOS DE OUTRAS CIDADES', 540, 550, 48, P.creme, { w: 700, a: ramp(tl, .6, 1), ls: 4 });
}, 'desliza');
// 16 — Xerxes manda um recado: entreguem as armas
shot(CUTS[16], CUTS[17], (tl, t) => {
  termopilasChao(t); for (let k = 0; k < 4; k++) hoplitaPerfil(120 + k * 70, 1460 - k * 20, .85 - k * .08, t, { parado: true, lanca: 'marcha' });
  persa(800, 1460, .95, t, { parado: true, escudo: false, roupa: '#c8a040', roupa0: '#9a7a2a', faixa: '#6a3a7a' }); c.save(); c.translate(800, 1460); c.scale(-.95, .95); rr(-60, -280, 70, 14, 7, '#efe6d4'); c.restore();
  const u = eo(ramp(tl, .5, .9)); if (u > 0) { c.save(); c.globalAlpha = u; rr(140, 360, 800, 200, 30, 'rgba(239,230,212,.95)'); poly([[700, 556], [780, 640], [760, 556]], 'rgba(239,230,212,.95)'); rom('ENTREGUEM', 540, 450, 84, P.carmim0); rom('AS ARMAS', 540, 530, 70, P.tinta); c.restore() }
}, 'poeira');
// 17 — Môlon labé: venha pegá-las
shot(CUTS[17], CUTS[18], (tl, t) => {
  fundo('163,25,27', '#0e0606'); c.save(); c.translate(540, 1000); const z = lerp(5.6, 6.2, ramp(tl, 0, L(17))); c.scale(z, z); corintioFrente({ crista: 'trans', olhoCor: '#4a3020' }); c.restore();
  const u = eo(ramp(tl, tw(17, 'Môlon') - .1, tw(17, 'Môlon') + .3)); rom('ΜΟΛΩΝ ΛΑΒΕ', 540, 230, 56, P.bronze, { a: u, w: 700 }); c.save(); c.translate(540, 360); c.scale(lerp(1.3, 1, u), lerp(1.3, 1, u)); rom('MOLON LABE', 0, 0, 120, P.bronze2, { a: u }); c.restore();
  rom('VENHA PEGÁ-LAS', 540, 450, 56, P.creme, { w: 700, a: ramp(tl, tw(17, 'Venha') - .1, tw(17, 'Venha') + .3) });
}, 'flash');
// 18 — as flechas cobririam o sol
shot(CUTS[18], CUTS[19], (tl, t) => {
  const d = ease(ramp(tl, .3, L(18))); ceu(t, 'dia', { sx: 540, sy: 560, sr: 130 }); flechas(t, Math.round(60 + 900 * d), 1.2, { vel: .35, cor: `rgba(30,16,10,${.6 + .3 * d})` }); c.fillStyle = `rgba(20,10,6,${.55 * d})`; c.fillRect(0, 0, W, H);
  montes(1300, [[240, '#3a2a1e', '#2a1e14', 81]]); chao(1280, '#2a1e14', '#3a2a1e'); for (let k = 0; k < 9; k++) hoplitaFrente(80 + k * 115, 1500, .42, t, { escudo: 'frente' });
}, 'cortina');
// 19 — Melhor. Lutaremos à sombra.
shot(CUTS[19], CUTS[20], (tl, t) => {
  ceu(t, 'dia', { sx: 540, sy: 560, sr: 130 }); flechas(t, 900, 1.2, { vel: .35 }); c.fillStyle = 'rgba(20,10,6,.6)'; c.fillRect(0, 0, W, H); chao(1280, '#2a1e14', '#3a2a1e');
  c.save(); c.translate(560, 1560); c.scale(1.05, 1.05); hoplitaFrente(0, 0, 1, t, { escudo: 'lado', crista: 'long' }); c.restore();
  rom('LUTAREMOS', 540, 380, 104, P.creme, { a: eo(ramp(tl, tw(19, 'Lutaremos') - .1, tw(19, 'Lutaremos') + .25)) }); rom('À SOMBRA', 540, 490, 104, P.bronze2, { a: eo(ramp(tl, tw(19, 'sombra') - .3, tw(19, 'sombra') + .1)) });
  txt('— DIENEKES', 880, 560, 40, '#e6d6bc', { align: 'right', a: ramp(tl, .2, .5) });
}, 'escuro');
// 20 — os persas atacam em ondas
shot(CUTS[20], CUTS[21], (tl, t) => {
  termopilasChao(t, 'sangue'); flechas(t, 120, .9, { vel: .6, dir: 1 });
  for (const [y, s, n] of [[1150, .45, 7], [1320, .62, 5], [1540, .88, 4]]) for (let k = 0; k < n; k++) { const sp = W / (n - 1), x = ((k * sp + tl * 260 * s) % (W + sp)) - sp; persa(x, y, s, t, { dir: true, lanca: 'ataque', passo: tl * 2 + k * .3, roupa: k % 2 ? '#6a3a7a' : '#7a2a3a', roupa0: k % 2 ? '#4a2456' : '#561a26' }) }
  placa(tl, 70, 250, 'EM ONDAS', .1, L(20) + 1, { size: 90 });
}, 'desliza');
// 21 — a falange: escudo colado em escudo, lanças para a frente
shot(CUTS[21], CUTS[22], (tl, t) => {
  fundo('163,25,27', '#120808'); c.fillStyle = '#2a1a12'; c.fillRect(0, 1100, W, H);
  const fila = (y, s, n, off) => { for (let k = 0; k < n; k++) { const x = off + k * 200 * s, st = sin(t * 3 + k) * 6; dory(x - 70 * s, y - 260 * s, lerp(x, 540, .25) + st, y + 520 * s, 8 * s); c.save(); c.translate(x, y - 190 * s); c.scale(1.6 * s, 1.6 * s); corintioFrente({ crista: 'long' }); c.restore(); aspis(x, y, 125 * s, { sym: SIMB[k % 2 ? 0 : 0] }) } };
  zoomTela(lerp(1, 1.12, ease(ramp(tl, 0, L(21)))), 540, 1000, () => { fila(820, .55, 10, 30); fila(1000, .75, 7, -20); fila(1250, 1.05, 5, -40) });
  placa(tl, 70, 250, 'A FALANGE', .2, L(21) + 1, { sub: 'ESCUDO COLADO EM ESCUDO', size: 86 });
}, 'zoom');
// 22 — os Imortais, a tropa de elite de Xerxes
shot(CUTS[22], CUTS[23], (tl, t) => {
  ceu(t, 'bronze', { sx: 300, sy: 760 }); montes(1060, [[300, '#3a2418', '#2a1a10', 91]]); chao(1040, '#5a3a24', '#6a4a2e');
  for (const [y, s, n] of [[1160, .48, 7], [1340, .66, 5], [1580, .95, 4]]) for (let k = 0; k < n; k++) { const sp = W / (n - 1), x = ((k * sp + tl * 70 * s) % (W + sp)) - sp / 2; persa(x, y, s, t, { dir: true, passo: tl * .9 + k * .3, roupa: '#e9dfc8', roupa0: '#c8bca2', faixa: '#6a3a7a', turbante: '#c8a040', turbante0: '#9a7a2a' }) }
  placa(tl, 70, 250, 'OS IMORTAIS', .2, L(22) + 1, { sub: 'A ELITE DE XERXES', size: 86 });
}, 'iris');
// 23 — também foram barrados
shot(CUTS[23], CUTS[24], (tl, t) => {
  fundo('163,25,27', '#140808'); chao(1300, '#2a1a12', '#3a2418'); const e = (sin(t * 9) + 1) / 2;
  hoplitaPerfil(300, 1560, 1.05, t, { lanca: 'ataque', estoca: e, parado: true, crista: true }); hoplitaPerfil(160, 1530, .9, t, { lanca: 'ataque', estoca: 1 - e, parado: true });
  persa(830 + e * 20, 1560, 1.0, t, { lanca: 'ataque', estoca: 1 - e, parado: true, roupa: '#e9dfc8', roupa0: '#c8bca2', turbante: '#c8a040' });
  const u = eo(ramp(tl, .3, .6)); c.save(); c.translate(540, 430); c.scale(lerp(1.6, 1, u), lerp(1.6, 1, u)); rom('BARRADOS', 0, 0, 130, P.bronze2, { a: u }); c.restore();
}, 'flash');
// 24 — a traição: Efialtes mostra o caminho pelas montanhas
shot(CUTS[24], CUTS[25], (tl, t) => {
  ceu(t, 'noite', { sx: 820, sy: 360, sr: 70 }); montes(1500, [[1100, '#1a1a24', '#121218', 101], [700, '#24222e', '#18161e', 102]]);
  c.strokeStyle = 'rgba(200,170,120,.25)'; c.lineWidth = 10; c.setLineDash([20, 14]); c.beginPath(); c.moveTo(1000, 1500); c.lineTo(700, 1300); c.lineTo(900, 1100); c.lineTo(500, 920); c.lineTo(760, 760); c.lineTo(380, 620); c.stroke(); c.setLineDash([]);
  const path = [[1000, 1500], [700, 1300], [900, 1100], [500, 920], [760, 760], [380, 620]], pos = u => { const f = u * (path.length - 1), i = Math.min(path.length - 2, Math.floor(f)), k = f - i; return [lerp(path[i][0], path[i + 1][0], k), lerp(path[i][1], path[i + 1][1], k)] };
  for (let k = 0; k < 18; k++) { const u = clamp(tl * .09 + .02 - k * .03), [x, y] = pos(u); if (u <= 0) continue; const s = lerp(.5, .2, u); persa(x, y, s, t, { dir: true, passo: tl + k * .3, escudo: false }); c.save(); c.translate(x + 20 * s, y - 420 * s); fogo(0, 0, .3 * s * 3, t + k); c.restore() }
  const [ex, ey] = pos(clamp(tl * .09 + .06)), se = lerp(.55, .2, clamp(tl * .09 + .06)); c.save(); c.translate(ex, ey); c.scale(se, se); bezPoly([[-40, -320], [-56, 0], [50, 0], [40, -320], [0, -350]], '#4a3a2a'); bezPoly([[-32, -330], [-30, -400, 0, -410], [30, -400, 32, -330]], '#3a2c1e'); el(6, -360, 18, 22, P.pele); c.restore();
  placa(tl, 70, 250, 'EFIALTES', .4, L(24) + 1, { sub: 'O CAMINHO PELAS MONTANHAS', size: 90 });
}, 'escuro');
// 25 — os gregos seriam cercados (esquema visto de cima)
shot(CUTS[25], CUTS[26], (tl, t) => {
  c.fillStyle = P.noite0; c.fillRect(0, 0, W, H); c.save(); c.beginPath(); c.rect(0, 380, W, 940); c.clip(); mar(380, t, { c1: '#2f7a80', c2: '#1e5a63' });
  c.fillStyle = '#d8bc84'; c.beginPath(); c.moveTo(380, 380); c.lineTo(660, 380); c.quadraticCurveTo(600, 860, 680, 1320); c.lineTo(380, 1320); c.fill();
  c.fillStyle = '#6e5232'; c.beginPath(); c.moveTo(0, 380); c.lineTo(420, 380); c.quadraticCurveTo(470, 860, 430, 1320); c.lineTo(0, 1320); c.fill();
  for (let k = 0; k < 7; k++) { c.strokeStyle = `rgba(30,18,8,${.25 + k * .05})`; c.lineWidth = 4; c.beginPath(); c.ellipse(200, 850, 190 - k * 24, 440 - k * 56, 0, 0, 7); c.stroke() }
  c.restore(); rom('MONTANHA', 200, 860, 40, P.creme, { w: 700 }); rom('MAR', 880, 860, 44, P.creme, { w: 700 });
  rr(450, 820, 170, 70, 10, P.carmim); txt('GREGOS', 535, 868, 38, '#fff', { align: 'center', sh: 0 });
  rr(440, 470, 190, 90, 10, '#6a3a7a'); txt('PERSAS', 535, 528, 40, '#fff', { align: 'center', sh: 0 });
  setaMapa([[470, 570], [330, 640], [230, 860], [300, 1060], [520, 1000]], ease(ramp(tl, .1, 1.9)), '#b05aa0', 16, true);
  c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(0, 370, W, 12); c.fillRect(0, 1316, W, 12); meandro(40, 396, 1000, 20, 'rgba(233,194,122,.6)'); meandro(40, 1284, 1000, 20, 'rgba(233,194,122,.6)');
  rom('CERCADOS', 540, 300, 120, P.carmim, { a: eo(ramp(tl, tw(25, 'cercados') - .2, tw(25, 'cercados') + .2)) });
}, 'zoom');
// 26 — Leônidas manda os aliados embora; ficam os 300, téspios e tebanos
shot(CUTS[26], CUTS[27], (tl, t) => {
  ceu(t, 'aurora', { sx: 240, sy: 760 }); montes(1060, [[320, '#4a3a2e', '#3a2c22', 111]]); chao(1040, '#9a7a4e', '#aa8a5e');
  for (let k = 0; k < 8; k++) hoplitaPerfil(lerp(560, -200, ramp(tl, 0, L(26)) * .8) + k * 60, 1180 + (k % 3) * 20, .36, t, { esq: true, passo: tl + k * .3, sym: SIMB[1 + k % 4], capa: '#5a6a8a' });
  for (let k = 0; k < 4; k++) hoplitaPerfil(640 + k * 120, 1560 - k * 10, .95 - k * .06, t, { esq: true, parado: true, lanca: 'marcha', crista: true });
  ['300 ESPARTANOS', '700 TÉSPIOS', '400 TEBANOS'].forEach((s, i) => { const t0 = tw(26, i ? (i === 1 ? 'téspios' : 'tebanos') : 'trezentos'); rom(s, 540, 380 + i * 90, 64, i ? P.creme : P.bronze2, { a: ramp(tl, t0 - .1, t0 + .3), w: 700 }) });
}, 'cortina');
// 27 — no terceiro dia, lutaram até o fim
shot(CUTS[27], CUTS[28], (tl, t) => {
  ceu(t, 'sangue', { sx: 760, sy: 760, sr: 140 }); flechas(t, 500, 1.1, { vel: .5, cor: 'rgba(20,6,4,.85)' }); c.fillStyle = '#2a120e'; c.beginPath(); c.moveTo(0, 1500); c.quadraticCurveTo(540, 900, W, 1500); c.lineTo(W, H); c.lineTo(0, H); c.fill(); c.fillStyle = '#3a1a12'; c.beginPath(); c.moveTo(540, 1190); c.quadraticCurveTo(800, 1250, W, 1500); c.lineTo(W, H); c.lineTo(540, H); c.fill();
  for (let k = 0; k < 9; k++) { const a = PI + k / 8 * PI, x = 540 + cos(a) * 300, y = 1260 + sin(a) * -60 + Math.abs(k - 4) * 20; hoplitaFrente(x, y + 80, .42, t, { escudo: 'frente', crista: k === 4 ? 'trans' : 'long' }) }
  placa(tl, 70, 250, 'O TERCEIRO DIA', .2, L(27) + 1, { size: 84 });
}, 'escuro');
// 28 — Leônidas caiu (sem violência: capacete, escudo e capa no chão)
shot(CUTS[28], CUTS[29], (tl, t) => {
  fundo('233,150,80', '#1a0a06'); add(() => { for (let k = 0; k < 5; k++) { c.fillStyle = `rgba(255,200,130,${.05 + .02 * sin(t + k)})`; c.beginPath(); c.moveTo(300 + k * 120, 0); c.lineTo(380 + k * 120, 0); c.lineTo(560 + k * 40, 1300); c.lineTo(520 + k * 40, 1300); c.fill() } });
  zoomTela(lerp(1, 1.12, ease(ramp(tl, 0, L(28)))), 540, 1250, () => { c.fillStyle = '#3a2216'; c.fillRect(0, 1240, W, H); bezPoly([[160, 1330], [420, 1240], [760, 1270], [960, 1360], [700, 1400], [300, 1400]], P.carmim0); bezPoly([[200, 1330], [420, 1260], [620, 1280], [500, 1380], [300, 1390]], P.carmim);
    c.save(); c.translate(720, 1290); c.scale(1, .38); aspis(0, 0, 200, { sym: 'L' }); c.restore(); dory(120, 1400, 520, 1330, 9); c.save(); c.translate(430, 1230); c.rotate(-.35); c.scale(2.4, 2.4); corintioPerfil({ crista: true, barba: 'rgba(0,0,0,0)' }); c.restore() });
  rom('LEÔNIDAS', 540, 420, 110, P.bronze2, { a: ramp(tl, .6, 1.2) }); rom('c. 540 – 480 a.C.', 540, 500, 46, P.creme, { w: 700, a: ramp(tl, 1.0, 1.4) });
}, 'poeira');
// 29 — capítulo 4, o legado: os persas passaram
shot(CUTS[29], CUTS[30], (tl, t) => {
  termopilasChao(t, 'bronze'); for (const [y, s, n] of [[1150, .42, 8], [1320, .6, 6], [1540, .85, 4]]) for (let k = 0; k < n; k++) { const sp = W / (n - 1), x = ((k * sp + tl * 60 * s) % (W + sp)) - sp / 2; persa(x, y, s, t, { dir: true, passo: tl * .8 + k * .3 }) }
  placa(tl, 70, 250, 'OS PERSAS PASSAM', 2.0, L(29) + 1, { size: 80 }); cap(29, 4, 'k', tl);
}, 'escuro');
// 30 — Salamina: a vitória no mar
shot(CUTS[30], CUTS[31], (tl, t) => { ceu(t, 'dia', { sx: 860, sy: 520, hz: 900 }); montes(900, [[160, '#6a7a5a', '#55623a', 121]]); mar(880, t); trirreme(lerp(80, 300, ease(ramp(tl, 0, L(30)))), 1200, 1.0, t, { vela: true, simbolo: true }); trirreme(900, 1080, .65, t, { esq: true, casco: '#3a1a2a', vela: true }); trirreme(lerp(1250, 980, ramp(tl, 0, L(30))), 1500, 1.2, t, { esq: true, casco: '#3a1a2a' }); placa(tl, 70, 250, 'SALAMINA', .1, L(30) + 1, { sub: '480 a.C. · NO MAR', size: 90 }) }, 'desliza');
// 31 — Plateias: a vitória em terra
shot(CUTS[31], CUTS[32], (tl, t) => { ceu(t, 'aurora', { sx: 540, sy: 860 }); montes(1060, [[300, '#5a4a3a', '#46382a', 131]]); chao(1040, '#8a7a4a', '#9a8a5a'); for (const [y, s, n] of [[1160, .38, 9], [1320, .55, 7], [1560, .8, 5]]) for (let k = 0; k < n; k++) hoplitaFrente(60 + k * (W - 120) / (n - 1), y, s, t, { escudo: 'frente', sym: SIMB[k % 5] }); placa(tl, 70, 250, 'PLATEIAS', .1, L(31) + 1, { sub: '479 a.C. · EM TERRA', size: 90 }) }, 'flash');
// 32 — Xerxes nunca conquistou a Grécia
shot(CUTS[32], CUTS[33], (tl, t) => {
  c.fillStyle = P.noite0; c.fillRect(0, 0, W, H); mapaGrecia(t, { persia: true }); const g = ramp(tl, .2, 1.4); for (const k of ['continente', 'peloponeso', 'eubeia']) { c.save(); c.globalAlpha = g * .55; poly(TERRAS[k].map(p => GEO(...p)), P.bronze2); c.restore() }
  setaMapa([[23.4, 39.3], [24.6, 39.9], [26.2, 40.3]], ease(ramp(tl, .4, 2.6)), '#7a4a6a', 14); rom('A GRÉCIA', 540, 230, 96, P.bronze2, { a: g }); rom('RESISTIU', 540, 330, 96, P.creme, { a: ramp(tl, .6, 1.4) });
}, 'iris');
// 33 — o poeta Simônides escreveu
shot(CUTS[33], CUTS[34], (tl, t) => { termopilasChao(t, 'aurora', true); lapide(540, 1440, .9); placa(tl, 70, 250, 'SIMÔNIDES', .2, L(33) + 1, { sub: 'O EPITÁFIO DOS ESPARTANOS', size: 90 }) }, 'cortina');
// 34 — o epitáfio na pedra
shot(CUTS[34], CUTS[35], (tl, t) => {
  c.fillStyle = '#2a1a12'; c.fillRect(0, 0, W, H); zoomTela(1, 540, 1000, () => lapide(540, 1560, 1.55)); add(() => glow(300, 500, 700, '255,200,130', .12));
  const linhas = ['ESTRANGEIRO,', 'VÁ DIZER', 'AOS ESPARTANOS', 'QUE AQUI JAZEMOS,', 'OBEDIENTES', 'ÀS SUAS LEIS.'], ch = ['Estrangeiro', 'dizer', 'espartanos', 'jazemos', 'obedientes', 'leis'];
  linhas.forEach((s, i) => { const t0 = tw(34, ch[i]), u = ramp(tl, t0 - .15, t0 + .35); if (u <= 0) return; c.save(); c.globalAlpha = u; const y = 820 + i * 92; rom(s, 543, y + 3, 66, 'rgba(255,240,220,.35)', { sh: 0, w: 700 }); rom(s, 540, y, 66, '#3a2c20', { sh: 0, w: 700 }); c.restore() });
}, 'zoom');
// 35 — hoje, uma estátua de Leônidas guarda o desfiladeiro
shot(CUTS[35], CUTS[36], (tl, t) => {
  ceu(t, 'aurora', { sx: 820, sy: 900, sr: 120 }); montes(1200, [[520, '#4a3a2e', '#3a2c22', 141]]); chao(1500, '#5a4a36', '#6a5a42');
  rr(330, 1180, 420, 340, 6, '#d8ccb4'); rr(540, 1180, 210, 340, 6, '#b8ac94'); rr(300, 1150, 480, 40, 6, '#e8dcc4'); rr(300, 1500, 480, 40, 6, '#c8bca4');
  c.save(); c.filter = 'sepia(1) saturate(1.6) hue-rotate(-12deg) brightness(.72) contrast(1.15)'; hoplitaFrente(540, 1160, 1.18, t, { escudo: 'lado', crista: 'trans' }); c.restore(); add(() => glow(420, 700, 300, '255,200,130', .15));
  placa(tl, 70, 250, 'TERMÓPILAS, HOJE', .2, L(35) + 1, { sub: 'MONUMENTO A LEÔNIDAS', size: 80 });
}, 'escuro');
// 36 — duas palavras: Môlon labé (final)
shot(CUTS[36], CUTS[37], (tl, t) => {
  ceu(t, 'aurora', { sx: 820, sy: 900, sr: 120 }); c.save(); c.translate(540, 1300); const z = lerp(1.0, 1.25, ease(ramp(tl, 0, L(36)))); c.scale(z, z); c.translate(-540, -1300);
  rr(250, 1180, 580, 420, 6, '#d8ccb4'); rr(540, 1180, 290, 420, 6, '#b8ac94'); rr(220, 1150, 640, 44, 6, '#e8dcc4'); rom('ΜΟΛΩΝ ΛΑΒΕ', 540, 1330, 84, '#4a3a28', { sh: 0, w: 700 });
  c.save(); c.filter = 'sepia(1) saturate(1.6) hue-rotate(-12deg) brightness(.72) contrast(1.15)'; hoplitaFrente(540, 1160, 1.18, t, { escudo: 'lado', crista: 'trans' }); c.restore(); c.restore();
  const f = ramp(tl, 3.2, 4.0); if (f > 0) { c.fillStyle = `rgba(14,6,4,${.75 * f})`; c.fillRect(0, 0, W, H); rom('LEÔNIDAS', 540, 760, 140, P.bronze2, { a: f }); c.save(); c.globalAlpha = f; meandro(180, 800, 720, 26, P.bronze); c.restore(); rom('MOLON LABE', 540, 930, 80, P.creme, { a: ramp(tl, 3.6, 4.3), w: 700 }) }
}, 'cortina');

// chão das Termópilas visto de perto (montanha à esquerda, mar à direita)
function termopilasChao(t, tipo = 'aurora', semMar) {
  ceu(t, tipo, { sx: 820, sy: 760, hz: 1080 }); if (!semMar) mar(1060, t, {}); else { c.fillStyle = '#5a4630'; c.fillRect(0, 1060, W, H) }
  c.fillStyle = '#c8a46a'; c.fillRect(0, 1100, W, H); c.fillStyle = '#b8945a'; c.fillRect(0, 1100, W, 18);
  c.fillStyle = '#3e2e1c'; c.beginPath(); c.moveTo(0, 0); c.lineTo(160, 0); c.lineTo(260, 700); c.lineTo(200, 1120); c.lineTo(0, 1180); c.fill(); c.fillStyle = '#5a4630'; c.beginPath(); c.moveTo(160, 0); c.lineTo(260, 700); c.lineTo(200, 1120); c.lineTo(150, 1120); c.lineTo(110, 0); c.fill();
}
