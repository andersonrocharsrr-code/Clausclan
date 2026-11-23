// ================= Cenas: E se Marte e Vênus fossem habitáveis? (3:49, vertical) =================
const L = k => CUTS[k + 1] - CUTS[k];
function tw(k, str) { const a = CUTS[k]; for (const l of LEG) for (const [s, ti] of l.w) if (ti >= a - .05 && s.replace(/[^\wÀ-ÿ-]/g, '') === str.toUpperCase()) return ti - a; return 0 }
const pl = (tl, k, s, sub, o = {}) => placa(tl, 70, o.y || 250, s, o.t0 ?? .2, L(k) + 1, { sub, size: o.size || 76, linha: P.rosa });
const AG = PL.acc2, LI = PL.acc1, DO = PL.hl;
const grande = (tl, s, y, size, col, t0 = 0) => { const u = eo(ramp(tl, t0, t0 + .35)); if (u <= 0) return; c.save(); c.translate(540, y); c.scale(lerp(1.3, 1, u), lerp(1.3, 1, u)); txt(s, 0, 0, size, col, { align: 'center', a: u }); c.restore() };
const S = (k, fn, tr) => shot(CUTS[k], CUTS[k + 1], fn, tr);
function seta(x0, y0, x1, y1, col, lw = 6) { line(x0, y0, x1, y1, col, lw); const a = Math.atan2(y1 - y0, x1 - x0); poly([[x1, y1], [x1 - cos(a - .4) * 26, y1 - sin(a - .4) * 26], [x1 - cos(a + .4) * 26, y1 - sin(a + .4) * 26]], col) }
function lente(x, y, r, fn) { c.save(); c.beginPath(); c.arc(x, y, r, 0, 7); c.clip(); fn(); c.restore(); c.lineWidth = 10; c.strokeStyle = '#c8d0d8'; c.beginPath(); c.arc(x, y, r, 0, 7); c.stroke() }

// 0 — olhar o céu à noite
S(0, (tl, t) => { zoomTela(lerp(1.06, 1, tl / L(0)), 540, 900, () => { fundo(t); disc(300, 520, 9, '#fff6d8'); add(() => glow(300, 520, 60, '255,240,200', .5)); disc(760, 380, 6, '#ff9a6a'); add(() => glow(760, 380, 40, '255,150,110', .5)); paisagemTerra(t, { noite: true, cidade: false });
  humano(540, 1470, 1.3, { roupa: '#2a5a7a', t }) }); txt('VÊNUS', 300, 600, 38, PL.cre, { align: 'center', a: ramp(tl, 1, 1.5) }); txt('MARTE', 760, 450, 38, '#ffb090', { align: 'center', a: ramp(tl, 1.5, 2) }) });
// 1 — cidades, florestas e seres vivos olhando de volta
S(1, (tl, t) => { fundo(t, { seed: 2 }); planetaVivo(300, 760, 230, t, 'venus'); planetaVivo(780, 1120, 200, t, 'marte', { luzes: true }); txt('VIVOS?', 540, 1300, 96, AG, { align: 'center', a: ramp(tl, 1.5, 2) }) }, 'nevoa');
// 2 — E se...?
S(2, (tl, t) => { fundo(t, { seed: 3 }); planetaVivo(250, 1050, 140, t, 'venus'); planetaVivo(540, 1100, 170, t, 'terra'); planetaVivo(840, 1060, 120, t, 'marte'); grande(tl, 'E SE...', 620, 150, PL.cre, .2); txt('MARTE E VÊNUS FOSSEM HABITÁVEIS?', 540, 740, 50, AG, { align: 'center', a: ramp(tl, 1, 1.5) }) }, 'flash');
// 3 — capítulo 1: três planetas nasceram quase juntos
S(3, (tl, t) => { fundo(t, { seed: 4 }); const u = ramp(tl, 2.3, L(3)); sol(540, 860, 90, t); c.save(); c.translate(540, 860); c.scale(1, .35); for (let k = 0; k < 6; k++) { c.strokeStyle = `rgba(255,200,140,${.25 - k * .03})`; c.lineWidth = 40; c.beginPath(); c.arc(0, 0, 220 + k * 70, 0, 7); c.stroke() } c.restore();
  [[260, 'venus'], [360, 'terra'], [480, 'marte']].forEach(([r, k], i) => { const a = t * (.4 - i * .1) + i * 2; planetaMorto(540 + cos(a) * r, 860 + sin(a) * r * .35, 26 + i * 4, 'proto') }); txt('4,5 BILHÕES DE ANOS', 540, 1240, 56, DO, { align: 'center', a: ramp(tl, 3, 3.5) }); capitulo(tl, 1, CAPS.b) }, 'escuro');
// 4 — Marte jovem tinha rios
S(4, (tl, t) => { fundo(t, { seed: 5 }); planetaVivo(540, 860, 360, t, 'marte'); pl(tl, 4, 'MARTE JOVEM', 'RIOS E TALVEZ UM OCEANO') }, 'iris');
// 5 — Vênus pode ter tido mares
S(5, (tl, t) => { fundo(t, { seed: 6 }); const u = ramp(tl, 1.2, 2.6); planetaVivo(540, 860, 360, t, 'venus'); c.save(); c.globalAlpha = u; planetaMorto(540, 860, 362, 'venus'); c.restore(); add(() => glow(540, 860, 500, '255,140,60', .35 * u)); pl(tl, 5, 'VÊNUS', 'MARES... E DEPOIS UM FORNO') }, 'desliza');
// 6 — três mundos vivos
S(6, (tl, t) => { fundo(t, { seed: 7 }); planetaVivo(260, 700, 150, t, 'venus'); planetaVivo(540, 1000, 180, t, 'terra'); planetaVivo(820, 700, 130, t, 'marte'); grande(tl, 'TRÊS MUNDOS VIVOS', 1360, 76, AG, .4) }, 'cortina');
// 7 — o Sistema Solar com três mundos azuis
S(7, (tl, t) => { fundo(t, { seed: 8 }); orbitas(540, 880, t, { vivos: true }); pl(tl, 7, 'TRÊS MUNDOS AZUIS', null, { size: 70 }) }, 'zoom');
// 8 — À noite: Vênus mais forte e Marte com luzes de cidades no telescópio
S(8, (tl, t) => { fundo(t, { seed: 9 }); paisagemTerra(t, { noite: true, cidade: true }); disc(240, 420, 14, '#fff8e0'); add(() => glow(240, 420, 120, '255,240,200', .7)); brilho4(240, 420, 70, '#ffffff', .8); disc(700, 300, 7, '#ff9a6a');
  const u = ramp(tl, 1.5, 2.2); if (u > 0) { c.save(); c.globalAlpha = u; lente(760, 760, 220, () => { c.fillStyle = '#020806'; c.fillRect(540, 540, 440, 440); planetaVivo(760, 760, 170, t, 'marte', { luzes: true, giro: 300 }) }); line(700, 310, 640, 560, 'rgba(255,255,255,.4)', 3); c.restore() }
  txt('VÊNUS BRILHANTE', 240, 520, 36, PL.cre, { align: 'center', a: ramp(tl, .5, 1) }); txt('LUZES DE CIDADES EM MARTE', 760, 1040, 34, DO, { align: 'center', a: ramp(tl, 2.2, 2.6) }) }, 'nevoa');
// 9 — capítulo 2: Marte. Gravidade de 38%
S(9, (tl, t) => { fundo(t, { seed: 10 }); planetaVivo(380, 860, 260, t, 'marte'); planetaVivo(820, 860, 130, t, 'terra'); txt('MARTE', 380, 1190, 50, '#ffb090', { align: 'center', a: ramp(tl, 2.5, 3) }); txt('TERRA', 820, 1060, 40, PL.cre, { align: 'center', a: ramp(tl, 2.5, 3) });
  grande(tl, 'GRAVIDADE: 38%', 1380, 80, AG, tw(9, 'gravidade') - .2); capitulo(tl, 2, CAPS.d) }, 'escuro');
// 10 — vida alta e leve: árvores gigantes, animais de pernas longas
S(10, (tl, t) => { paisagemMarte(t); for (let i = 0; i < 2; i++) { const x = 300 + i * 420 + sin(t * .5 + i) * 30; c.save(); c.translate(x, 1330); poly([[-6, 0], [-4, -260], [4, -260], [6, 0]], '#8a4a2a'); poly([[40, 0], [42, -260], [50, -260], [52, 0]], '#6a3a20'); el(24, -280, 70, 30, '#c86a3a'); poly([[60, -290], [120, -420], [134, -416], [80, -280]], '#c86a3a'); el(132, -432, 22, 14, '#d8784a'); c.restore() } pl(tl, 10, 'VIDA ALTA E LEVE', 'ÁRVORES GIGANTES · PERNAS LONGAS', { size: 68 }) }, 'cortina');
// 11 — pessoas que pulariam quase três vezes mais alto
S(11, (tl, t) => { paisagemMarte(t, { arvores: false }); const ph = (tl * .9) % 1, pulo = Math.sin(ph * PI) * 520; marciano(680, 1420 - pulo, 1.0, { t, braco: 'cima' }); humano(300, 1420 - Math.sin(ph * PI) * 190, 1.1, { t, capacete: false });
  txt('TERRA', 300, 1480, 36, PL.cre, { align: 'center' }); txt('MARTE: ~3×', 680, 1480, 36, DO, { align: 'center' }); line(860, 1420, 860, 1420 - 520, 'rgba(255,255,255,.4)', 4); grande(tl, 'QUASE 3× MAIS ALTO', 360, 76, AG, .3) }, 'flash');
// 12 — o dia em Marte: 24 h 39 min
S(12, (tl, t) => { fundo(t, { seed: 12 }); c.save(); c.translate(540, 820); disc(0, 0, 300, '#e8f0ec'); disc(0, 0, 280, '#0a1a14'); for (let i = 0; i < 12; i++) { const a = i / 12 * PI * 2; c.fillStyle = PL.cre; c.save(); c.rotate(a); c.fillRect(-5, -270, 10, 34); c.restore() } const a1 = t * .8, a2 = t * .07; c.save(); c.rotate(a1); c.fillStyle = AG; c.fillRect(-5, -240, 10, 240); c.restore(); c.save(); c.rotate(a2); c.fillStyle = LI; c.fillRect(-8, -160, 16, 160); c.restore(); disc(0, 0, 18, DO); c.restore();
  grande(tl, '24 H 39 MIN', 1300, 100, DO, .3); pl(tl, 12, 'UM DIA EM MARTE', null, { size: 70 }) }, 'iris');
// 13 — o ano marciano: 687 dias
S(13, (tl, t) => { fundo(t, { seed: 13 }); const pos = orbitas(540, 860, t, { ang: { venus: t * .5, terra: t * .9, marte: t * .48 } }); txt('TERRA: 365 DIAS', 540, 1360, 50, PL.cre, { align: 'center', a: ramp(tl, .3, .7) }); txt('MARTE: 687 DIAS', 540, 1440, 60, '#ffb090', { align: 'center', a: ramp(tl, 1, 1.4) }) }, 'zoom');
// 14 — um marciano de 10 anos teria quase 19 anos da Terra
S(14, (tl, t) => { fundo(t, { seed: 14 }); bolo(300, 1000, 1.2, 10, '#d8784a'); bolo(780, 1000, 1.2, 19, '#4a8ad8'); for (let i = 0; i < 10; i++) { const fx = 220 + i * 18, b = sin(t * 12 + i) * 3; rr(fx - 3, 820, 6, 50, 2, '#f4f0ff'); el(fx, 812 + b, 6, 10, '#ffd36a') }
  txt('ANOS DE MARTE', 300, 1120, 40, '#ffb090', { align: 'center' }); txt('ANOS DA TERRA', 780, 1120, 40, '#9ad0ff', { align: 'center', a: ramp(tl, 1, 1.4) }); grande(tl, '=', 1000 - 60, 120, PL.cre, .6) }, 'desliza');
// 15 — duas luas: Fobos e Deimos
S(15, (tl, t) => { paisagemMarte(t, { luas: false }); const fx = lerp(-100, 1180, (tl / L(15)) * .9); disc(fx, 420, 80, '#b8a898'); disc(fx + 14, 410, 70, '#d0c0b0'); [[-20, -10, 14], [24, 20, 10], [-30, 30, 8]].forEach(([a, b, r]) => disc(fx + a, 420 + b, r, '#a09080')); disc(300, 260, 26, '#e0d0c0');
  txt('FOBOS', fx, 540, 46, PL.cre, { align: 'center', a: ramp(tl, .3, .7) }); txt('DEIMOS', 300, 330, 36, PL.cre, { align: 'center', a: ramp(tl, .8, 1.2) }); pl(tl, 15, 'DUAS LUAS', null, { y: 680, size: 70 }) }, 'nevoa');
// 16 — capítulo 3: Vênus, quase do tamanho da Terra
S(16, (tl, t) => { fundo(t, { seed: 16 }); planetaVivo(360, 880, 250, t, 'venus'); planetaVivo(800, 880, 240, t, 'terra'); txt('VÊNUS', 360, 1210, 50, '#f4e8b0', { align: 'center', a: ramp(tl, 2.5, 3) }); txt('TERRA', 800, 1210, 50, '#9ad0ff', { align: 'center', a: ramp(tl, 2.5, 3) });
  grande(tl, 'GRAVIDADE: 90%', 1380, 80, AG, tw(16, 'gravidade') - .2); capitulo(tl, 3, CAPS.f) }, 'escuro');
// 17 — mundo quente: florestas densas, nuvens grossas e chuva forte
S(17, (tl, t) => { paisagemVenus(t, { chuva: true, solX: 540, solY: 260 }); pl(tl, 17, 'UMA ESTUFA VIVA', 'FLORESTAS · NUVENS · CHUVA', { size: 70 }) }, 'cortina');
// 18 — criaturas que voam devagar no ar pesado
S(18, (tl, t) => { paisagemVenus(t, { sol: false }); for (let i = 0; i < 4; i++) arraia(((t * 40 + i * 330) % 1400) - 160, 420 + i * 170 + sin(t + i) * 30, .8 + i * .15, t + i, i % 2 ? '#c8a8ff' : '#e8b0d8'); grande(tl, 'VOANDO NO AR PESADO', 1400, 64, LI, .5) }, 'iris');
// 19 — um dia em Vênus é mais longo que um ano
S(19, (tl, t) => { fundo(t, { seed: 19 }); const u = ramp(tl, .3, 2), v = ramp(tl, 1.2, 2.8); rr(120, 700, 840 * 243 / 243 * u, 90, 14, LI); rr(120, 950, 840 * 225 / 243 * v, 90, 14, AG); txt('1 DIA: 243 DIAS DA TERRA', 120, 680, 44, PL.cre, { a: u }); txt('1 ANO: 225 DIAS DA TERRA', 120, 930, 44, PL.cre, { a: v });
  grande(tl, 'O DIA É MAIOR QUE O ANO', 1300, 64, DO, 2.6) }, 'flash');
// 20 — o Sol nasce no oeste e leva meses para cruzar o céu
S(20, (tl, t) => { paisagemVenus(t, { sol: false }); const u = tl / L(20) * .25; const sx = lerp(980, 100, u), sy = 700 - Math.sin(u * PI) * 400; disc(sx, sy, 70, 'rgba(255,240,200,.6)'); disc(sx, sy, 46, '#fff6d8'); c.setLineDash([20, 20]); c.strokeStyle = 'rgba(255,240,200,.5)'; c.lineWidth = 4; c.beginPath(); c.moveTo(980, 700); c.quadraticCurveTo(540, -100, 100, 700); c.stroke(); c.setLineDash([]);
  txt('OESTE', 980, 780, 40, DO, { align: 'center' }); txt('LESTE', 100, 780, 40, PL.cre, { align: 'center' }); pl(tl, 20, 'O SOL NASCE NO OESTE', 'E DEMORA MESES NO CÉU', { size: 64 }) }, 'nevoa');
// 21 — um venusiano vive tardes que duram semanas
S(21, (tl, t) => { paisagemVenus(t, { solX: 860, solY: 520 }); c.fillStyle = 'rgba(255,150,80,.18)'; c.fillRect(0, 0, W, H); line(200, 1150, 200, 1450, '#6a4a2a', 10); line(880, 1150, 880, 1450, '#6a4a2a', 10); c.strokeStyle = '#e8b84a'; c.lineWidth = 16; c.beginPath(); c.moveTo(200, 1200); c.quadraticCurveTo(540, 1400, 880, 1200); c.stroke(); venusiano(540, 1330, .9, { t }); grande(tl, 'TARDES DE SEMANAS', 1240, 72, DO, .3) }, 'cortina');
// 22 — capítulo 4: a viagem. Foguete partindo
S(22, (tl, t) => { paisagemTerra(t, { cidade: false }); const u = ramp(tl, 2.3, L(22)); foguete(540, lerp(1150, -400, u * u), 1.3, t); for (let i = 0; i < 10; i++) { const q = rng(i + 1); el(540 + (q() - .5) * 400 * u, 1300, 60 + q() * 60, 40, `rgba(240,240,250,${.7 * (1 - u * .5)})`) } capitulo(tl, 4, CAPS.h) }, 'escuro');
// 23 — 5 meses até Vênus, 6 a 9 até Marte
S(23, (tl, t) => { fundo(t, { seed: 23 }); const pos = orbitas(540, 860, t, { ang: { venus: 2.6, terra: 0, marte: 1.2 } }); const u = ramp(tl, .4, 2.5), v = ramp(tl, 2, 4.5);
  c.setLineDash([16, 14]); c.lineWidth = 5; c.strokeStyle = LI; c.beginPath(); c.arc(540, 860, 250, 0, 2.6 * u); c.stroke(); c.strokeStyle = AG; c.beginPath(); c.arc(540, 860, 370, 0, -1.2 * v + 0, true); c.stroke(); c.setLineDash([]);
  txt('VÊNUS: ~5 MESES', 540, 1380, 54, LI, { align: 'center', a: u }); txt('MARTE: 6 A 9 MESES', 540, 1460, 54, AG, { align: 'center', a: v }) }, 'iris');
// 24 — janelas de lançamento
S(24, (tl, t) => { fundo(t, { seed: 24 }); const u = ease(ramp(tl, 0, L(24) * .7)); orbitas(540, 860, t, { ang: { venus: 2.6 - u * .5, terra: -u * .9, marte: -u * .45 } }); if (u > .95) { c.strokeStyle = DO; c.lineWidth = 6; c.setLineDash([10, 10]); c.beginPath(); c.arc(540, 860, 470, -1.2, -.2); c.stroke(); c.setLineDash([]) } pl(tl, 24, 'JANELA DE LANÇAMENTO', 'QUANDO OS PLANETAS SE APROXIMAM', { size: 64 }) }, 'zoom');
// 25 — turista em Marte: cada passo vira um salto
S(25, (tl, t) => { paisagemMarte(t); const ph = (tl * .8) % 1, x = lerp(150, 950, (tl / L(25))), h = Math.sin(ph * PI) * 260; humano(x, 1450 - h, 1, { capacete: true, roupa: '#e8ecf2', t }); grande(tl, 'CADA PASSO, UM SALTO', 360, 70, AG, .3) }, 'flash');
// 26 — cidades para gente alta e duas luas
S(26, (tl, t) => { paisagemMarte(t, { arvores: false }); cidadeMarte(t); marciano(300, 1470, .8, { t }); marciano(820, 1470, .75, { t, flip: true, roupa: '#2a5a6a' }); humano(560, 1470, .8, { roupa: '#e8ecf2', capacete: true, t }); pl(tl, 26, 'CIDADES MARCIANAS', null, { size: 70 }) }, 'cortina');
// 27 — uma ligação para casa: 3 a 22 minutos
S(27, (tl, t) => { fundo(t, { seed: 27 }); planetaVivo(240, 1180, 130, t, 'marte', { luzes: true }); planetaVivo(840, 520, 150, t, 'terra'); sinal(300, 1090, 780, 610, (tl * .35) % 1, t); grande(tl, '3 A 22 MINUTOS', 1290, 80, DO, .6); txt('PARA A MENSAGEM CHEGAR', 540, 1360, 40, PL.cre, { align: 'center', a: ramp(tl, 1, 1.4) }) }, 'nevoa');
// 28 — em Vênus: calor úmido de estufa
S(28, (tl, t) => { paisagemVenus(t, { solX: 540, solY: 300 }); humano(540, 1490, 1.2, { roupa: '#f0f0f4', t, suor: true }); txt('40 °C E ÚMIDO?', 540, 1180, 64, DO, { align: 'center', a: ramp(tl, .5, 1) }); pl(tl, 28, 'UMA ESTUFA GIGANTE', null, { size: 70 }) }, 'desliza');
// 29 — florestas sem fim e um Sol que quase não se mexe
S(29, (tl, t) => { zoomTela(lerp(1, 1.12, tl / L(29)), 540, 900, () => paisagemVenus(t, { solX: 540, solY: 400 })); arraia(((t * 30) % 1400) - 200, 700, 1, t); grande(tl, 'O SOL QUASE PARADO', 1380, 70, DO, tw(29, 'sol') - .2) }, 'iris');
// 30 — capítulo 5: eles aqui. Nave marciana chegando
S(30, (tl, t) => { paisagemTerra(t, { cidade: true }); const u = ease(ramp(tl, 2, L(30))); naveMarciana(lerp(1300, 540, u), lerp(200, 800, u), 1.1, t); capitulo(tl, 5, CAPS.k) }, 'escuro');
// 31 — um marciano se sentiria quase 3× mais pesado
S(31, (tl, t) => { paisagemTerra(t, { cidade: true }); const u = ramp(tl, .8, 2); marciano(540, 1380 + u * 10, .95, { t }); balanca(540, 1400, 1.3, (60 + u * 98).toFixed(0) + ' KG', u); grande(tl, 'QUASE 3× MAIS PESADO', 360, 72, DO, 1.4) }, 'flash');
// 32 — andaria devagar, com uma roupa robótica
S(32, (tl, t) => { paisagemTerra(t, { cidade: true }); marciano(lerp(200, 700, tl / L(32)), 1470, 1, { t, anda: true, exo: true }); pl(tl, 32, 'ROUPA ROBÓTICA', 'PARA AJUDAR AS PERNAS', { size: 70 }) }, 'cortina');
// 33 — o venusiano estranharia os dias curtos
S(33, (tl, t) => { const ciclo = (tl * .8) % 1, dia = sin(ciclo * PI); paisagemTerra(t, { noite: dia < .3 }); const sx = lerp(-60, 1140, ciclo), sy = 700 - dia * 500; disc(sx, sy, 60, dia > .3 ? '#fff6c8' : '#e8e8f0'); venusiano(540, 1470, 1, { t }); txt('?!', 640, 1180, 90, DO, { a: ramp(tl, .5, .8) }); pl(tl, 33, 'DIAS CURTOS DEMAIS', null, { size: 70 }) }, 'nevoa');
// 34 — sentiria frio e se encantaria com a neve
S(34, (tl, t) => { ceuFaixas(['#8aa8c8', '#b8cce0', '#e0eaf4'], 1300); c.fillStyle = '#f4f8ff'; c.fillRect(0, 1280, W, H - 1280); poly([[0, 1280], [300, 1180], [620, 1260], [1080, 1160], [1080, 1300], [0, 1300]], '#e8f0f8'); neve(t); venusiano(540, 1490, 1.1, { t, cachecol: true, frio: true }); grande(tl, 'NEVE!', 400, 130, '#ffffff', tw(34, 'neve') - .2) }, 'iris');
// 35 — comércio, estudantes, campeonatos, casamentos interplanetários
S(35, (tl, t) => { paisagemTerra(t, { cidade: false }); bandeira(200, 1250, '#2f6fd8', '#4caa5a', t); bandeira(470, 1250, '#c8603a', '#7a1e3a', t); bandeira(740, 1250, '#e8b84a', '#3ab89a', t);
  humano(260, 1490, .8, { t, roupa: '#c83a4a' }); marciano(540, 1490, .62, { t, braco: 'aceno' }); venusiano(820, 1490, .75, { t, roupa: '#5a8ad8' });
  const itens = ['COMÉRCIO', 'INTERCÂMBIO', 'CAMPEONATOS', 'CASAMENTOS'], k = Math.min(3, Math.floor(tl / (L(35) / 4.2))); txt(itens[k], 540, 420, 80, AG, { align: 'center' }); txt('ENTRE PLANETAS', 540, 500, 44, PL.cre, { align: 'center' }) }, 'desliza');
// 36 — discussões sobre quem tem o melhor planeta
S(36, (tl, t) => { fundo(t, { seed: 36 }); humano(220, 1470, .9, { t, braco: Math.floor(t * 2) % 2 ? 'cima' : null }); marciano(540, 1470, .7, { t, braco: Math.floor(t * 2 + 1) % 2 ? 'cima' : null }); venusiano(860, 1470, .85, { t });
  const falas = [['A TERRA!', 220, 1030], ['MARTE!', 540, 1100], ['VÊNUS!', 860, 1100]]; falas.forEach(([s2, x, y], i) => { const a = ramp(tl, .3 + i * .5, .6 + i * .5); if (a <= 0) return; c.save(); c.globalAlpha = a; rr(x - 120, y - 70, 240, 90, 30, '#f2fff8'); poly([[x - 20, y + 20], [x + 10, y + 20], [x - 10, y + 50]], '#f2fff8'); txt(s2, x, y - 8, 46, '#0a2820', { align: 'center', sh: 0 }); c.restore() });
  grande(tl, 'QUEM TEM O MELHOR PLANETA?', 400, 60, DO, .2) }, 'flash');
// 37 — na vida real: deserto gelado e inferno de 460 °C
S(37, (tl, t) => { fundo(t, { seed: 37 }); planetaMorto(300, 800, 200, 'marte'); planetaMorto(780, 800, 220, 'venus'); add(() => glow(780, 800, 320, '255,150,60', .3));
  txt('MARTE: −60 °C', 300, 1100, 48, '#9ad0ff', { align: 'center', a: ramp(tl, .5, .9) }); txt('VÊNUS: 460 °C', 780, 1100, 48, '#ff8a4a', { align: 'center', a: ramp(tl, 1.4, 1.8) }); pl(tl, 37, 'NA VIDA REAL', null, { size: 76 }) }, 'escuro');
// 38 — a Terra é o único lugar conhecido com vida
S(38, (tl, t) => { fundo(t, { seed: 38 }); planetaVivo(540, 860, 330, t, 'terra'); grande(tl, 'O ÚNICO LAR QUE TEMOS', 1380, 72, AG, tw(38, 'cuidar') - .2) }, 'iris');
// 39 — pelo menos, por enquanto
S(39, (tl, t) => { fundo(t, { seed: 39 }); const z = lerp(1.15, 1, eo(ramp(tl, 0, 3))); zoomTela(z, 540, 900, () => { planetaVivo(540, 900, 200, t, 'terra'); planetaVivo(200, 640, 70, t, 'venus', { giro: 0 }); planetaVivo(880, 1180, 60, t, 'marte', { giro: 0 }) });
  grande(tl, 'POR ENQUANTO...', 1380, 90, DO, .3); const f = ramp(tl, L(39) - 3.2, L(39) - 2.6); if (f > 0) { c.fillStyle = `rgba(2,10,8,${f * .75})`; c.fillRect(0, 0, W, H); txt('E SE...', 540, 860, 150, PL.cre, { align: 'center', a: f }); txt('MARTE E VÊNUS FOSSEM HABITÁVEIS?', 540, 980, 50, AG, { align: 'center', a: f }) } }, 'nevoa');
