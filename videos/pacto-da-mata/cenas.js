// ================= O PACTO DA MATA — 10 min — cenas na ordem do roteiro =================
// Tempos das falas em tempos.js (S = início, E = fim, P(k,'frase') = hora de uma frase). Cada shot(t0, t1, fn).
const TX = 110, TY = 170, MOON = [1420, 210, 64];
const fig = (pk, fn, a) => banho(PAL[pk].banho, a ?? PAL[pk].banhoA, fn);
const preto = a => { if (a > 0) { c.fillStyle = `rgba(0,0,0,${clamp(a)})`; c.fillRect(0, 0, W, H) } };
const fade = (tl, d, i = .6, o = .6) => preto(Math.max(1 - ramp(tl, 0, i), ramp(tl, d - o, d)));
const NOITE = (extra = {}) => Object.assign({ pk: 'noite', ceu: { estrelas: 1, lua: MOON, nuvens: 5 }, nevoa: .7, vagalumes: .8, raios: [1200, -120, .28, 6, .55] }, extra);
const fala = (k, t) => bocaFala(k, t);
const cut = list => { for (let i = 0; i < list.length - 1; i++) if (list[i][1]) shot(list[i][0], list[i + 1][0], list[i][1]) };
// close de rosto com fundo de mata desfocada (névoa e manchas de luz)
function fundoClose(pk, t, seed = 1, o = {}) {
  const p = PAL[pk]; c.fillStyle = lg(0, 0, 0, H, [[0, mix(p.mid, p.haze, .25)], [1, p.near]]); c.fillRect(0, 0, W, H);
  const q = rng(seed); for (let i = 0; i < 26; i++) { const x = q() * W, y = q() * H * .8, r = 60 + q() * 180; glow(x + sin(t * .2 + i) * 10, y, r, i % 3 ? shade(hex2rgb(p.folhas[2]), 1.1) : p.luz, (i % 3 ? .25 : .1) * (o.luz ?? 1)) }
  for (let i = 0; i < 6; i++) { const x = q() * W, w = 60 + q() * 120, a = .22 + q() * .2; c.fillStyle = lg(x - w, 0, x + w, 0, [[0, 'rgba(0,0,0,0)'], [.5, `rgba(0,0,0,${a})`], [1, 'rgba(0,0,0,0)']]); c.fillRect(x - w, 0, w * 2, H) }
  neblina(H * .6, 500, .4, t, p.fog, 10, seed * 100);
}

// ======================= CAPÍTULO 1 — O HOMEM QUE NUNCA ERRAVA =======================
shot(0, 3.6, (tl) => chapter(tl, 1, 'O HOMEM QUE NUNCA ERRAVA', 3.6));
// voo sobre as copas, à noite, até a samaúma; título
shot(3.6, S.n02 - .2, (tl, t, d) => {
  const u = ease(ramp(tl, 0, d)); const p = PAL.noite;
  ceu(p, { hy: 620, estrelas: 1, lua: [1400, 190 + u * 60, 70], nuvens: 6, t });
  const cam = (par) => { const s = 1 + u * .5 * par; c.save(); c.translate(W / 2, 640); c.scale(s, s); c.translate(-W / 2, -640 - u * 220 * par) };
  cam(.2); c.drawImage(camFundo('noite', 11, 640), -400, 0); c.restore();
  neblina(600, 300, .7, t, p.fog, 6, 100);
  cam(.6); c.drawImage(camFundo('noite', 12, 860), -400, 0); c.restore();
  neblina(860, 340, .6, t, p.fog, 12, 300);
  cam(1.1); c.drawImage(camFundo('noite', 13, 1100), -400, 0); c.restore();
  raios(1300, -60, .35, 5, .5, p.luz, t, 3);
  const a = Math.min(ramp(tl, .4, 1.6), 1 - ramp(tl, 5.6, 6.6));
  label(W / 2, 470, 'O PACTO DA MATA', { size: 170, align: 'center', a }); label(W / 2, 545, 'O ÚLTIMO CAÇADOR · UMA LENDA AMAZÔNICA', { size: 46, align: 'center', col: OURO, a: a * ramp(tl, 1.2, 2.2), w: 600, ls: 8 });
  preto(1 - ramp(tl, 0, 1.4));
});
// a câmera desce: Firmino na trilha, afastando os cipós com o cano
shot(S.n02 - .2, S.n04 - .3, (tl, t, d) => {
  const z = lerp(1.08, 1, ease(ramp(tl, 0, 3)));
  mata(tl, t, NOITE({ seed: 3, trilha: { curva: 40 }, px: tl * 14, z, dy: lerp(-160, 0, ease(ramp(tl, 0, 3.2))), meio: (tl2, t2) => {
    const x = lerp(380, 1020, tl / d), f = t2 * 5.2;
    fig('noite', () => firmino(x, 905, 430, { arma: 'baixo', anda: 1, fase: f, levanta: .25 + .15 * sin(t2 * 1.3) }));
    c.strokeStyle = '#0a1a14'; c.lineWidth = 5; c.beginPath(); c.moveTo(x + 230, 540); c.quadraticCurveTo(x + 150 - Math.max(0, 1 - Math.abs(tl % 3 - 1.5)) * 40, 700, x + 170, 790); c.stroke();
  } }));
  typeText(tl, TX, TY, 'FIRMINO', .3, P('n03', 'Era caçador') - S.n02 + .8, { sub: 'CAÇADOR DESDE MENINO' });
});
// close: a ambição
shot(S.n04 - .3, S.n05 - .3, (tl, t, d) => {
  fundoClose('noite', t, 4, { luz: .7 }); const z = lerp(3.0, 3.35, tl / d);
  fig('noite', () => at(960, 600, z, () => rostoFirmino({ olharX: .3 + .2 * sin(tl * .7), raiva: .3 })), .35);
  add(() => glow(1400, 200, 700, '170,200,230', .12));
});
// plano aberto: a lua, a trilha; ele para; ao longe, junto da árvore gigante, o vulto
shot(S.n05 - .3, S.d01 - .2, (tl, t, d) => {
  const stop = ramp(tl, 3.2, 4.4), olhos = ramp(tl, d - 2.6, d - 1.2);
  mata(tl, t, NOITE({ seed: 5, trilha: { curva: -60 }, px: tl * 10 * (1 - stop), samauma: .7, meio: (tl2, t2) => {
    tronco(1430, 760, 150, 900, { esc: '#05100e', med: '#0e2420', luz: '#24403a', lx: -1, raiz: 1.6, musgo: '#1a3a2a', rim: '150,190,210' }, rng(9));
    homemPreto(1330, 790, 260, t2, { olhos, cabeca: .2 });
    fig('noite', () => firmino(lerp(420, 640, ease(ramp(tl, 0, 4.4))), 940, 400, { arma: 'baixo', anda: 1 - stop, fase: t2 * 5.2, medo: stop * .4 }));
  } }));
});
// "Boa noite, Firmino."
shot(S.d01 - .2, S.f01 - .25, (tl, t) => {
  mata(tl, t, NOITE({ seed: 6, z: 1.05 + tl * .01, vagalumes: .4, raios: 0, meio: (tl2, t2) => {
    tronco(1150, 1100, 260, 1300, { esc: '#04100c', med: '#0c221e', luz: '#22403a', lx: -1, raiz: 1.8, musgo: '#1a3a2a', rim: '150,190,210' }, rng(9));
    homemPreto(900, 1000, 720, t2, { olhos: 1, cabeca: .3, sorriso: .2 });
  } }));
});
// Firmino ergue a espingarda, assustado
shot(S.f01 - .25, S.d02 - .25, (tl, t) => {
  mata(tl, t, NOITE({ seed: 7, trilha: { curva: 0 }, z: 1.15, meio: (tl2, t2) => {
    const up = eo(ramp(tl, 0, .6));
    fig('noite', () => firmino(780, 1080, 820, up > .5 ? { arma: 'mira', medo: .8, boca: fala('f01', t2), sobe: 0 } : { arma: 'baixo', levanta: up * 2, medo: .8, boca: fala('f01', t2) }));
  } }));
});
// por cima do ombro: Firmino em primeiro plano, o homem de preto falando ao fundo
shot(S.d02 - .25, S.f02 - .25, (tl, t, d) => {
  mata(tl, t, NOITE({ seed: 8, trilha: { curva: 80 }, z: 1 + tl * .006, meio: (tl2, t2) => {
    tronco(1300, 800, 140, 900, { esc: '#05100e', med: '#0e2420', luz: '#24403a', lx: -1, raiz: 1.4, musgo: '#1a3a2a', rim: '150,190,210' }, rng(9));
    homemPreto(1200, 830, 330, t2, { olhos: 1, cabeca: .35, vento: .4 });
  }, perto: (tl2, t2) => { fig('noite', () => firmino(120, 1700, 1500, { arma: 'mira', medo: .5 }), .62) } }));
});
// close: "E o que você tem a ver com isso?"
shot(S.f02 - .25, S.d03 - .25, (tl, t) => { fundoClose('noite', t, 9, { luz: .6 }); fig('noite', () => at(960, 610, 3.2, () => rostoFirmino({ raiva: .6, medo: .2, boca: fala('f02', t), vermelho: .5 })), .3) });
// o homem de preto levanta a cabeça; os olhos se acendem
shot(S.d03 - .25, P('d03', 'Capivara,') - .3, (tl, t, d) => {
  fundoClose('noite', t, 10, { luz: .3 }); const up = ease(ramp(tl, .2, d - .4));
  at(960, 600 + up * 10, 3.3, () => rostoPreto(t, { olhos: lerp(.5, 1.15, up), cabeca: up, sorriso: .15 }));
});
// os bichos que ele oferece aparecem na névoa, um a um
shot(P('d03', 'Capivara,') - .3, S.f03 - .25, (tl, t, d) => {
  const p = PAL.noite; ceu(p, { hy: 900, estrelas: .5, t }); c.drawImage(camFundo('noite', 14, 760), -400 - tl * 6, 0); neblina(700, 600, .9, t, p.fog, 8, 9); c.fillStyle = lg(0, 760, 0, H, [[0, '#0a1a1c'], [1, '#030808']]); c.fillRect(0, 760, W, H);
  const vis = [['capivara', 'Capivara,', 560, 870], ['anta', 'anta,', 1400, 860], ['veado', 'veado,', 300, 930], ['queixada', 'porco-do-mato...', 1640, 940], ['onca', 'onça', 1020, 780]];
  vis.forEach(([b, w, x, y], i) => { const a = ramp(t, P('d03', w) - .1, P('d03', w) + .7) * (i === 4 ? 1 : .85 - ramp(tl, d - 1.5, d) * .4); if (a <= 0) return; c.save(); c.globalAlpha = a * .55; at(x + (i % 2 ? -1 : 1) * (t - P('d03', w)) * 12, y, i === 4 ? 2.2 : 1.8, () => ({ capivara, anta, veado, queixada, onca })[b](t, { anda: .25, fase: t * 2 + i })); c.restore(); add(() => glow(x, y - 100, 260, '255,60,30', .12 * a)) });
  homemPreto(960, 1000, 440, t, { olhos: 1.1, cabeca: .6, sorriso: .4, vento: .3 });
  neblina(980, 380, .8, t, p.fog, 16, 3);
});
// "E o que você quer em troca?"
shot(S.f03 - .25, S.d04 - .25, (tl, t) => { fundoClose('noite', t, 11, { luz: .6 }); fig('noite', () => at(960, 610, 3.1 + tl * .05, () => rostoFirmino({ medo: .3, olharY: -.2, boca: fala('f03', t), vermelho: .6 })), .3) });
// os dois frente a frente
shot(S.d04 - .25, P('f04', 'Está', -2.2) - .1, (tl, t, d) => {
  mata(tl, t, NOITE({ seed: 12, trilha: { curva: 20 }, z: 1 + tl * .012, meio: (tl2, t2) => {
    tronco(1500, 900, 200, 1100, { esc: '#05100e', med: '#0e2420', luz: '#24403a', lx: -1, raiz: 1.6, musgo: '#1a3a2a', rim: '150,190,210' }, rng(19));
    homemPreto(1260, 960, 560, t2, { olhos: 1, cabeca: .4, sorriso: .35, vento: .3 });
    fig('noite', () => firmino(560, 960, 480, { arma: 'baixo', levanta: .1, medo: .2 }));
  } }));
});
// ele olha nos olhos... depois para a espingarda: "Está feito."
shot(P('f04', 'Está', -2.2) - .1, S.f04 - .9, (tl, t) => { fundoClose('noite', t, 13, { luz: .5 }); fig('noite', () => at(960, 610, 3.6, () => rostoFirmino({ olharY: tl > .9 ? .8 : 0, vermelho: 1 - ramp(tl, .8, 1.1) })), .3) });
shot(S.f04 - .9, S.d05 - .25, (tl, t) => {
  fundoClose('noite', t, 14, { luz: .5 });
  fig('noite', () => at(1000, 560, 16, () => { seg(-16, 40, -11, 22, 9, 8, '#9c845c'); seg(-11, 22, -.5, 1.6, 6, 5, PELE_F.pele); seg(30, 40, 24, 22, 9, 8, '#7c6a4a'); seg(24, 22, 14, 2, 6, 5, PELE_F.sombra); espingarda({ brilho: ramp(tl, .4, 1.6) * .25 }); maoLado(14, 1.4, 0, { pele: PELE_F.sombra, sombra: '#6a422a', luz: PELE_F.pele }, 1.5); maoLado(-.5, 1, 0, PELE_F, 1.6) }, -.08), .3);
});
// o vento gira as folhas; relâmpago; ele some
shot(S.d05 - .25, S.n06 - .3, (tl, t, d) => {
  const tR = d - 1.4, foi = tl > tR + .08;
  mata(tl, t, NOITE({ seed: 12, trilha: { curva: 20 }, z: 1.08, vento: 3, raios: 0, meio: (tl2, t2) => {
    tronco(1500, 900, 200, 1100, { esc: '#05100e', med: '#0e2420', luz: '#24403a', lx: -1, raiz: 1.6, musgo: '#1a3a2a', rim: '150,190,210' }, rng(19));
    if (!foi) homemPreto(1260, 960, 560, t2, { olhos: 1.2, cabeca: .6, sorriso: .5, vento: 1.4 });
    fig('noite', () => firmino(560, 960, 480, { arma: 'baixo', levanta: .1, medo: .5 }));
  }, perto: (tl2, t2) => redemoinho(t2, 960, 760, 90, ramp(tl, .2, 1.5) * (foi ? .4 : 1)) }));
  relampago(tl, tR, 1250);
});
// sozinho: o pacto estava feito
shot(S.n06 - .3, S.n07 - .9, (tl, t, d) => {
  const u = ease(ramp(tl, 3.5, d));
  mata(tl, t, NOITE({ seed: 12, trilha: { curva: 20 }, z: lerp(1.08, 1, u), dy: u * 420, ceu: { estrelas: 1, lua: [1420, 210 - u * 150, 64], nuvens: 5 }, meio: (tl2, t2) => {
    tronco(1500, 900, 200, 1100, { esc: '#05100e', med: '#0e2420', luz: '#24403a', lx: -1, raiz: 1.6, musgo: '#1a3a2a', rim: '150,190,210' }, rng(19));
    fig('noite', () => firmino(560, 960, 480, { arma: 'baixo', levanta: .1, medo: .2, brilho: .2 * (1 - ramp(tl, 2, 4)) }));
  } }));
  fade(tl, d, .01, .9);
});

// ---- cena 2: o caçador de Seu Anselmo ----
const CEU_DIA = { sol: [1500, 160], nuvens: 4 };
const seringal = (tl, t, o = {}) => mata(tl, t, Object.assign({ pk: 'manha', seed: 21, hy: 640, troncos: 0, frente: 0, cipos: 0, folhas: 0, nevoa: .5, ceu: CEU_DIA, raios: [1300, -100, -.25, 5, .5] }, o));
shot(S.n07 - .9, P('n07', 'Seu Anselmo,') - .3, (tl, t, d) => {
  seringal(tl, t, { px: tl * 6, meio: (tl2, t2) => {
    barracao(1250, 820, 820, PAL.manha, t2, {});
    for (const [x, s] of [[150, 1], [420, .8]]) seringueira(x, 860, 60 * s, 600 * s, PAL.manha, x);
    seringueiro(1650, 830, 170, t2, { anda: 1, ph: 1 });
    const x = lerp(-120, 760, ease(ramp(tl, 0, d)));
    firmino(x, 940, 330, { arma: 'ombro', anda: 1, fase: t2 * 5 });
    carga(capivara, x, 940, 330, t2);
  } });
  typeText(tl, TX, TY, 'O SERINGAL', .4, d - .3, { sub: 'NA MANHÃ SEGUINTE' });
  fade(tl, d, .8, .01);
});
shot(P('n07', 'Seu Anselmo,') - .3, S.a01 - .2, (tl, t, d) => {
  seringal(tl, t, { z: 1.4, px: 260, meio: (tl2, t2) => { barracao(1250, 820, 820, PAL.manha, t2, {}); anselmo(1130, 1005, 400, t2, { braco: 'cintura', sorriso: ramp(tl, 2, 4) * .6, olhar: -1 }) } });
  typeText(tl, TX, TY, 'SEU ANSELMO', .3, d - .3, { sub: 'DONO DO BARRACÃO' });
});
// diálogo na frente do barracão
function frenteBarracao(tl, t, o) {
  seringal(tl, t, { z: 1.25, px: 120, meio: (tl2, t2) => {
    barracao(1300, 780, 900, PAL.manha, t2, { rede: 0 });
    anselmo(1240, 1010, 520, t2, Object.assign({ olhar: -1 }, o.a));
    at(880, 1022, 2.6, () => { c.save(); c.scale(1, -1); capivara(t2, { anda: 0 }); c.restore() }, PI);
    firmino(560, 1030, 560, Object.assign({ arma: 'mao' }, o.f));
  } });
}
shot(S.a01 - .2, S.a02 - .25, (tl, t) => frenteBarracao(tl, t, { a: { boca: fala('a01', t), sorriso: .5, braco: 'aponta' }, f: { boca: fala('f05', t) } }));
shot(S.a02 - .25, S.f06 - .25, (tl, t) => { fundoClose('manha', t, 22); at(960, 610, 3.2 + tl * .03, () => closeAnselmo(t, { boca: fala('a02', t), sorriso: .6 })) });
shot(S.f06 - .25, S.n08 - .3, (tl, t) => { fundoClose('manha', t, 23); at(960, 620, 3.2, () => rostoFirmino({ sorriso: .7, boca: fala('f06', t), olharX: .3 })) });
// montagem das caçadas
shot(S.n08 - .3, P('n08', 'Firmino entrava') - .2, (tl, t, d) => {
  mata(tl, t, { pk: 'amanhecer', seed: 24, trilha: { curva: 160 }, px: tl * 20, ceu: { sol: [1500, 520] }, raios: [1400, -100, -.3, 8, .9], meio: (tl2, t2) => {
    for (const [x, s] of [[300, 1.1], [1500, 1]]) seringueira(x, 900, 80 * s, 900 * s, PAL.amanhecer, x);
    fig('amanhecer', () => firmino(lerp(500, 1300, tl / d), 950, 380, { arma: 'ombro', anda: 1, fase: t2 * 5 }));
  } });
  typeText(tl, TX, TY, 'OS DIAS PASSARAM', .3, d - .3, {});
});
shot(P('n08', 'Firmino entrava') - .2, S.n09 - .3, (tl, t, d) => {
  mata(tl, t, { pk: 'manha', seed: 25, trilha: { curva: -120 }, px: -tl * 18, raios: [600, -100, .25, 6, .7], meio: (tl2, t2) => {
    const x = lerp(1500, 600, tl / d); fig('manha', () => { firmino(x, 960, 400, { arma: 'ombro', anda: 1, fase: t2 * 5 }, true); carga(capivara, x, 960, 400, t2, true) });
  } });
});
shot(S.n09 - .3, P('n09', 'Se queria uma anta,') - .25, (tl, t, d) => {
  mata(tl, t, { pk: 'manha', seed: 26, nevoa: 1.3, px: tl * 8, meio: (tl2, t2) => {
    at(1180 - tl * 30, 900, 3, () => veado(t2, { anda: .15, fase: t2 * 1.4 }));
    fig('manha', () => firmino(420, 980, 460, { arma: 'mira' }));
  } });
});
shot(P('n09', 'Se queria uma anta,') - .25, P('n09', 'Se procurava') - .25, (tl, t, d) => {
  mata(tl, t, { pk: 'manha', seed: 27, agua: { y: 80, h: 300 }, px: tl * 10, meio: (tl2, t2) => {
    at(1050 + tl * 40, 900, 3.2, () => anta(t2, { anda: .5, fase: t2 * 3 }));
    for (let i = 0; i < 5; i++) pill(1040 + tl * 40 + i * 60 - 120, 905 + (i % 2) * 6, 80 + sin(t2 * 3 + i) * 10, 3, 'rgba(255,255,255,.3)');
    fig('manha', () => firmino(360, 1000, 480, { arma: 'baixo', levanta: .3 }));
  } });
});
shot(P('n09', 'Se procurava') - .25, S.n10 - .3, (tl, t, d) => {
  mata(tl, t, { pk: 'manha', seed: 28, trilha: { curva: 0 }, lama: 1, z: 1.1 + tl * .02, meio: (tl2, t2) => {
    pegadas(560, 980, 9, 110, 'porco', ramp(tl, 0, 1), 3); pegadas(620, 1030, 8, 120, 'porco', ramp(tl, .3, 1.3), 4);
    for (let i = 0; i < 6; i++) { const ph = i * .7; c.save(); c.globalAlpha = .9; at(1300 + i * 110 + tl * 30 - (i % 2) * 60, 760 + (i % 3) * 14, 1.3, () => queixada(t2, { anda: .5, fase: t2 * 5 + ph })); c.restore() }
  } });
});
shot(S.n10 - .3, P('n10', 'O dinheiro') - .2, (tl, t, d) => {
  mata(tl, t, { pk: 'chuva', seed: 29, trilha: { curva: 60 }, chuva: 1, nevoa: .9, raios: 0, px: tl * 12, meio: (tl2, t2) => {
    const x = lerp(300, 1250, tl / d); fig('chuva', () => { firmino(x, 960, 420, { arma: 'ombro', anda: 1, fase: t2 * 5 }); carga(veado, x, 960, 420, t2) });
  } });
});
shot(P('n10', 'O dinheiro') - .2, P('n10', 'Seu nome') - .2, (tl, t, d) => {
  fundoClose('manha', t, 30, { luz: 1.2 });
  at(760, 1120, 9, () => { seg(-30, 30, 10, -20, 24, 20, '#ece6d8'); seg(10, -20, 26, -36, 14, 11, PELE_A.pele) });
  const n = Math.min(6, 1 + Math.floor(tl * 2.2)); notas(1000, 640 - n * 6, 3.4, n, -.12);
  at(1300, 1150, 9, () => { seg(40, 30, 0, -24, 24, 20, '#9c845c'); seg(0, -24, -12, -40, 13, 11, PELE_F.pele); ell(-14, -44, 9, 7, 0, PELE_F.pele) });
  label(W - 140, 300, 'R$', { size: 120, align: 'right', col: OURO, a: ramp(tl, .2, .8) });
});
shot(P('n10', 'Seu nome') - .2, S.n11 - .3, (tl, t, d) => {
  seringal(tl, t, { z: 1.15, meio: (tl2, t2) => {
    barracao(1350, 800, 860, PAL.manha, t2, {});
    for (let i = 0; i < 5; i++) seringueiro(260 + i * 150, 960 + (i % 2) * 20, 230, t2, { roupa: ['#7a6a50', '#6a5a4a', '#8a7a5a', '#5a6a5a', '#7a5a4a'][i], chapeu: i % 2 ? '#a89060' : '#c8b070' });
    firmino(1080, 1010, 480, { arma: 'ombro', inclina: -.03 });
  } });
});
shot(S.n11 - .3, S.a03 - 2.2, (tl, t, d) => {
  const vinha = ramp(t, P('n11', 'Vinha') - .3, P('n11', 'Vinha') + .6);
  seringal(tl, t, { pk: 'noite', ceu: { estrelas: 1, lua: MOON, nuvens: 4 }, troncos: 1, raios: 0, z: 1.1 + tl * .015, meio: (tl2, t2) => {
    barracao(1200, 820, 860, PAL.noite, t2, { noite: 1, fumaca: 0 });
    lamparina(980, 680, 2.2, t2, 1);
    fig('noite', () => firmino(820, 690, 330, { arma: 'mao' }, true), .25);
    for (const k of [-1, 1]) { const x = 260 + k * 14, y = 660, ol = .5 + vinha * .8; add(() => { glow(x, y, 30 * ol, '255,40,20', .5 * ol); glow(x, y, 8 * ol, '255,150,90', .9 * ol) }) }
  } });
  void d;
});

// ---- cena 3: a ganância (fim de tarde, banco de madeira) ----
function bancoTarde(tl, t, o = {}) {
  mata(tl, t, { pk: 'tarde', seed: 31, hy: 660, troncos: 0, frente: 0, cipos: 0, folhas: 0, ceu: { sol: [1650, 560], nuvens: 4 }, raios: [1500, -100, -.4, 6, .8], z: o.z || 1.2, px: o.px || 0, meio: (tl2, t2) => {
    barracao(980, 760, 1300, PAL.tarde, t2, { rede: 1, fumaca: 0 });
    c.fillStyle = '#3a2412'; c.fillRect(560, 900, 380, 22); c.fillRect(580, 920, 16, 90); c.fillRect(900, 920, 16, 90);
    for (let i = 0; i < 5; i++) cartucho(840 + i * 22, 896, 1.5, -.1 + i * .05);
    lamparina(920, 898, 1.4, t2, .5);
    fig('tarde', () => firmino(720, 1010, 470, { arma: 'colo', sentado: 1, boca: o.fb ? o.fb(t2) : 0, cabeca: .05 }));
    anselmo(1240, 1030, 520, t2, Object.assign({ olhar: -1, braco: 'cintura' }, o.a || {}));
  } });
}
shot(S.a03 - 2.2, S.a04 - .25, (tl, t) => bancoTarde(tl, t, { a: { boca: fala('a03', t), sorriso: .4 }, fb: t2 => fala('f07', t2) }));
shot(S.a04 - .25, S.f08 - .25, (tl, t) => { fundoClose('tarde', t, 32); at(960, 610, 3.2, () => closeAnselmo(t, { boca: fala('a04', t), preocupado: 1 })) });
shot(S.f08 - .25, S.n12 - .3, (tl, t) => { fundoClose('tarde', t, 33); at(960, 620, 3.2 + tl * .05, () => rostoFirmino({ sorriso: .9 + .1 * sin(tl * 9), boca: fala('f08', t) * .8, olharX: -.2 })) });
shot(S.n12 - .3, S.n13 - .3, (tl, t, d) => {
  mata(tl, t, { pk: 'tarde', seed: 34, trilha: { curva: 140 }, px: tl * 16, ceu: { sol: [1600, 600] }, raios: [1500, -100, -.35, 8, 1], meio: (tl2, t2) => {
    fig('tarde', () => firmino(lerp(400, 1100, tl / d), 960, 420, { arma: 'ombro', anda: 1, fase: t2 * 4.6, inclina: -.04 }));
  } });
});
shot(S.n13 - .3, S.a05 - 6.2, (tl, t, d) => {
  const p = PAL.crepusculo; ceu(p, { hy: 700, sol: [1500, 650], nuvens: 5, t });
  const s = 1 + tl * .008; c.save(); c.translate(W / 2, 700); c.scale(s, s); c.translate(-W / 2, -700);
  c.drawImage(camFundo('crepusculo', 35, 760), -400, 40); neblina(800, 300, .6, t, p.fog, 6, 9); c.drawImage(camFundo('crepusculo', 36, 980), -400, 40);
  c.restore();
  c.fillStyle = '#060506'; c.beginPath(); c.moveTo(0, 860); c.quadraticCurveTo(500, 800, 900, 830); c.lineTo(1100, 860); c.lineTo(1100, H); c.lineTo(0, H); c.fill();
  banho('rgba(10,7,9,1)', .9, () => firmino(560, 836, 360, { arma: 'ombro', inclina: -.05 }), 'rgba(236,128,72,.08)');
  preto(ramp(tl, d - 4.6, d - 1.2));
});
shot(S.a05 - 6.2 + 0, S.a05 - .4, (tl, t, d) => chapter(tl, 2, 'O DIA EM QUE A FLORESTA CORREU', d));

// ======================= CAPÍTULO 2 — O DIA EM QUE A FLORESTA CORREU =======================
// ---- cena 4: a última grande caçada (amanhecer dourado no barracão) ----
function varandaAmanhecer(tl, t, o) {
  mata(tl, t, { pk: 'amanhecer', seed: 41, hy: 660, troncos: 0, frente: 0, cipos: 0, folhas: 0, nevoa: .8, ceu: { sol: [1650, 520], nuvens: 3 }, raios: [1600, -100, -.45, 7, 1], z: 1.25, px: 100, meio: (tl2, t2) => {
    barracao(1000, 780, 1100, PAL.amanhecer, t2, { fumaca: 1 });
    fig('amanhecer', () => { firmino(620, 1030, 540, Object.assign({ arma: 'mao' }, o.f)); anselmo(1260, 1030, 520, t2, Object.assign({ olhar: -1, braco: 'baixo' }, o.a)) });
  } });
}
shot(S.a05 - .4, S.a06 - .25, (tl, t) => varandaAmanhecer(tl, t, { a: { boca: fala('a05', t) }, f: { boca: fala('f09', t), cabeca: -.04 } }));
shot(S.a06 - .25, S.f10 - .2, (tl, t) => { fundoClose('amanhecer', t, 42); at(960, 610, 3.2, () => closeAnselmo(t, { boca: fala('a06', t), preocupado: .8 })) });
shot(S.f10 - .2, S.a07 - .25, (tl, t) => { fundoClose('amanhecer', t, 43); at(960, 620, 3.2, () => rostoFirmino({ raiva: .2, boca: fala('f10', t), olharX: -.3 })) });
shot(S.a07 - .25, S.f11 - .2, (tl, t) => { fundoClose('amanhecer', t, 42); at(960, 610, 3.3, () => closeAnselmo(t, { boca: fala('a07', t), preocupado: 1, olharX: .3 })) });
shot(S.f11 - .2, S.n14 - .3, (tl, t) => { fundoClose('amanhecer', t, 43); at(960, 620, 3.2 + tl * .06, () => rostoFirmino({ sorriso: .8, boca: fala('f11', t) })) });
// cartuchos na bolsa de couro; e ele entra na mata
shot(S.n14 - .3, P('n14', 'Levava') + 3.4, (tl, t, d) => {
  fundoClose('amanhecer', t, 44, { luz: 1.3 });
  at(960, 760, 6, () => { c.fillStyle = lg(0, -60, 0, 60, [[0, '#8a5a30'], [1, '#4a2c14']]); c.beginPath(); c.roundRect(-80, -40, 160, 110, 14); c.fill(); c.fillStyle = '#5a3418'; c.beginPath(); c.roundRect(-84, -46, 168, 44, 10); c.fill(); c.fillStyle = '#c8a050'; c.fillRect(-6, -10, 12, 14); c.fillStyle = '#1a0e06'; c.fillRect(-70, -50, 140, 6) }, 0);
  for (let i = 0; i < 4; i++) { const u = ease(ramp(tl, .4 + i * .7, 1.1 + i * .7)); cartucho(860 + i * 70, lerp(380, 690, u), 4.6, PI / 2 + (i - 1.5) * .1) }
  at(1000 + sin(tl * 3) * 6, lerp(240, 380, ease(ramp(tl, 0, 2.6 % d))), 5, () => { seg(30, -60, 6, -10, 10, 8, '#cdb68a'); ell(2, -4, 8, 7, 0, PELE_F.pele) });
});
shot(P('n14', 'Levava') + 3.4, S.n15 - .3, (tl, t, d) => {
  mata(tl, t, { pk: 'amanhecer', seed: 45, trilha: { curva: 80 }, ceu: { sol: [960, 560] }, raios: [960, -100, 0, 9, 1.1], z: 1 + tl * .02, meio: (tl2, t2) => {
    const u = tl / d; fig('amanhecer', () => banho('rgba(20,14,8,1)', .55 * u, () => firmino(lerp(980, 1010, u), lerp(1060, 800, u), lerp(520, 230, u), { arma: 'ombro', anda: 1, fase: t2 * 5 }, true)));
  } });
});
// a floresta estava diferente: pássaros inquietos, um ruído distante
shot(S.n15 - .3, S.n16 - 1.6, (tl, t, d) => {
  const tp = P('n15', 'Os pássaros') - S.n15 + .3, tr = P('n15', 'ruído') - S.n15 + .3;
  mata(tl, t, { pk: 'manha', seed: 46, trilha: { curva: 40 }, nevoa: 1, px: tl * 10, vento: 1 + ramp(tl, tr, tr + 1) * 2, raios: [600, -100, .25, 6, .5], meio: (tl2, t2) => {
    fig('manha', () => firmino(lerp(500, 900, tl / d), 980, 440, { arma: 'baixo', anda: 1 - ramp(tl, tr, tr + 1) * .8, fase: t2 * 4.4, cabeca: ramp(tl, tr, tr + 1) * -.15, medo: ramp(tl, tr, tr + 1) * .3 }));
  } });
  revoada(tl, tp, 34, 1100, 360, 5); revoada(tl, tp + .6, 20, 600, 300, 6);
  c.save(); treme(ramp(tl, tr, tr + .4) * (1 - ramp(tl, tr + 1.5, tr + 3)) * 3, t); c.restore();
});

// ---- cena 5: a correria dos animais ----
// botas esmagando folhas secas
shot(S.n16 - 1.6, P('n16', 'Uma capivara') - .3, (tl, t, d) => {
  mata(tl, t, { pk: 'manha', seed: 47, trilha: { curva: 0 }, hy: 520, px: tl * 160, cipos: 0, raios: 0, nevoa: .4, meio: (tl2, t2) => {
    fig('manha', () => firmino(760 + tl * 160 * .75, 1010, 2600, { arma: 'nenhuma', anda: 1 - ramp(tl, d - 1.3, d - .6), fase: t2 * 4 }));
    const q = rng(4); for (let i = 0; i < 26; i++) { const ph = (t2 * 1.2 + q()) % 1; folha(600 + tl * 120 + q() * 600, 1040 - ph * 80 - sin(ph * PI) * 60, 26, q() * 6 + t2 * 3, 9, ['#8a5a2a', '#a8742e', '#6a4a20'][i % 3]) }
  } });
});
shot(P('n16', 'Uma capivara') - .3, S.n17 - .3, (tl, t, d) => {
  mata(tl, t, { pk: 'manha', seed: 48, trilha: { curva: 0 }, z: 1.1, vento: 2, meio: (tl2, t2) => {
    const u = ramp(tl, .2, 1.8); at(lerp(-200, 2200, u), 990, 4.6, () => capivara(t2, { fase: t2 * 16 }));
    poeira(t2, lerp(-200, 2200, u) - 100, 980, u > 0 && u < 1 ? 1 : 0, '150,140,110');
    fig('manha', () => firmino(1500, 1000, 520, { arma: 'baixo', medo: ramp(tl, 1, 2) * .5, cabeca: -.05 }, true));
  } });
});
shot(S.n17 - .3, P('n17', 'quando um macaco') - .2, (tl, t) => { fundoClose('manha', t, 49); at(960, 620, 3.2, () => rostoFirmino({ medo: .3, olharX: -.6 + tl * .2 })) });
shot(P('n17', 'quando um macaco') - .2, S.n18 - .3, (tl, t, d) => {
  const p = PAL.manha; ceu(p, { hy: 1100, t, sol: [1600, 120] }); c.drawImage(camFundo('manha', 50, 1180), -400, -300);
  c.save(); c.translate(W / 2, H / 2); c.rotate(-.06); c.translate(-W / 2, -H / 2);
  galho(-50, 520, 860, 470, 26, '#3a2a1a', p.folhas); galho(1060, 360, 1980, 300, 22, '#3a2a1a', p.folhas);
  const u = ramp(tl, .4, 2.0); const x = lerp(760, 1180, u), y = lerp(440, 300, u) - sin(u * PI) * 140; at(x, y, 4.2, () => macaco(t, { salto: u }), lerp(-.4, .2, u));
  if (tl > 2.0) { const v = ramp(tl, 2.0, 3.6); at(lerp(1180, 2100, v), 300 - sin(v * PI * 3) * 40, 4.2, () => macaco(t, { salto: (v * 3) % 1 })) }
  c.restore(); cipos(t, 51, 9, [p.near, p.folhas[1]], { vento: 3 }); raios(1500, -100, -.3, 5, .6, p.luz, t, 5);
});
// a vara de queixadas
shot(S.n18 - .3, S.n19 - .3, (tl, t, d) => {
  mata(tl, t, { pk: 'manha', seed: 52, trilha: { curva: -40 }, vento: 2.5, z: 1.05, meio: (tl2, t2) => {
    const q = rng(6), N = 22; const L = [];
    for (let i = 0; i < N; i++) { const t0 = q() * (d - 1.6), x = lerp(-300, 2300, ramp(tl, t0, t0 + 1.6 + q() * .4)), y = 880 + q() * 200, s = lerp(2.2, 3.6, (y - 880) / 200); if (x > -250 && x < 2250) L.push([y, x, s, i]) }
    L.sort((a, b) => a[0] - b[0]).forEach(([y, x, s, i]) => { at(x, y, s, () => queixada(t2, { fase: t2 * 15 + i })); poeira(t2, x - 60, y, .5, '150,140,110', i) });
  } });
});
// ele recua; o medo
shot(S.n19 - .3, P('n19', 'Mas o que veio') - .25, (tl, t, d) => {
  mata(tl, t, { pk: 'manha', seed: 53, trilha: { curva: 0 }, z: 1.15, vento: 2, meio: (tl2, t2) => {
    const u = ease(ramp(tl, .2, 1.4)); fig('manha', () => firmino(lerp(1100, 980, u), 1020, 560, { arma: 'baixo', anda: u < 1 ? .5 : 0, fase: -t2 * 5, medo: .7, levanta: .3 }, true));
  } });
});
shot(P('n19', 'Mas o que veio') - .25, S.n20 - .3, (tl, t, d) => { fundoClose('manha', t, 54, { luz: .7 }); at(960, 620, lerp(3.2, 3.8, ease(tl / d)), () => rostoFirmino({ medo: 1, suor: 1, olharX: .5 })) });
// a onça-pintada em disparada (a câmera acompanha)
shot(S.n20 - .3, S.n21 - .3, (tl, t, d) => {
  const lento = ramp(tl, d - 3.4, d - 2.6) * (1 - ramp(tl, d - 1.2, d - .4)), vel = lerp(1, .35, lento); let px = -400; for (let u = 0; u < tl; u += 1 / 30) px += 900 / 30 * lerp(1, .35, ramp(u, d - 3.4, d - 2.6) * (1 - ramp(u, d - 1.2, d - .4)));
  mata(tl, t, { pk: 'manha', seed: 55, trilha: { curva: 0 }, hy: 640, px, cipos: 6, vento: 2, nevoa: .5, raios: [800, -100, .2, 6, .6], meio: (tl2, t2) => {
    const x = lerp(-300, 900, ease(ramp(tl, 0, 1.6))) + px * .75; at(x, 980 + sin(t2 * 9 * vel) * 6, 5.2, () => onca(t2, { fase: px / 100 + 3 }));
    poeira(t2, x - 260, 975, 1, '150,140,110', 9);
  } });
  typeText(tl, TX, TY, 'ONÇA-PINTADA', 1.6, d - .4, { sub: 'ESTAVA FUGINDO' });
});
shot(S.n21 - .3, S.n22 - .3, (tl, t) => { fundoClose('manha', t, 56, { luz: .8 }); at(960 - tl * 30, 620, 3.4, () => rostoFirmino({ medo: .9, olharX: -1 + tl * .5, suor: 1 })) });
// a anta atravessa a clareira; o chão treme
shot(S.n22 - .3, S.n23 - .3, (tl, t, d) => {
  const pass = ramp(tl, 1.2, 4.6); c.save(); treme(Math.sin(pass * PI) * 7, t);
  mata(tl, t, { pk: 'manha', seed: 57, hy: 660, z: 1.08, vento: 2.5, raios: [1300, -100, -.25, 6, .7], meio: (tl2, t2) => {
    const x = lerp(-500, 2400, pass); at(x, 1010, 5.4, () => anta(t2, { fase: t2 * 8 })); poeira(t2, x - 300, 1000, pass > 0 && pass < 1 ? 1 : 0, '140,120,90', 4);
    redemoinho(t2, x, 950, 40, pass > 0 && pass < 1 ? .9 : 0, 13, ['#8a5a2a', '#a8742e', '#5a6a2a']);
  } });
  c.restore();
});
// as araras cruzam o céu
shot(S.n23 - .3, S.n24 - .3, (tl, t, d) => {
  const p = PAL.manha; ceu(p, { hy: 900, t, sol: [1500, 200], nuvens: 3 });
  c.drawImage(camFundo('manha', 58, 1000), -400 - tl * 20, 140); neblina(1000, 300, .5, t, p.fog, 10, 4);
  const q = rng(8); for (let i = 0; i < 34; i++) { const t0 = q() * 3.5, sp = 380 + q() * 260, y = 160 + q() * 520 + sin(t * 2 + i) * 14, s = .9 + q() * 1.9, x = -200 + (tl - t0) * sp * (1 + s * .3); if (x > -200 && x < 2200) at(x, y, s, () => arara(t + i * .37, { tipo: i % 3 ? 'vermelha' : 'caninde', fase: t * (8 + q() * 3) + i })) }
  c.save(); c.translate(0, -60); c.drawImage(camFrente('manha', 58), -400 - tl * 40, 0); c.restore(); cipos(t, 59, 6, [p.near], { vento: 2.5 });
});
// toda a mata fugindo
shot(S.n24 - .3, S.f12 - 9.0, (tl, t, d) => {
  const z = lerp(1.25, 1, ease(ramp(tl, 0, d)));
  mata(tl, t, { pk: 'manha', seed: 60, hy: 640, z, vento: 4, nevoa: .7, raios: [1200, -100, -.2, 7, .6], atras: (tl2, t2) => { const q = rng(3); for (let i = 0; i < 22; i++) { const t0 = q() * 8, x = lerp(-200, 2300, ramp(tl, t0, t0 + 3)); at(x, 730 + q() * 40, .9, () => [capivara, queixada, veado, anta][i % 4](t2, { fase: t2 * 12 + i })) } },
    meio: (tl2, t2) => { const q = rng(4); for (let i = 0; i < 26; i++) { const t0 = q() * 8.5, x = lerp(-300, 2300, ramp(tl, t0, t0 + 2)); at(x, 900 + q() * 120, 1.8 + q(), () => [queixada, capivara, queixada, veado, onca, anta][i % 6](t2, { fase: t2 * 13 + i })) } } });
  const q = rng(9); for (let i = 0; i < 18; i++) { const x = -200 + ((tl * (300 + q() * 300) + q() * 2200) % 2400), y = 120 + q() * 300; at(x, y, .8 + q(), () => arara(t + i, { tipo: i % 2 ? 'vermelha' : 'caninde' })) }
  revoada(tl, .3, 30, 900, 300, 12); revoada(tl, 3, 26, 1300, 260, 13);
  preto(ramp(tl, d - .5, d) * .0);
});
// silêncio de repente; o indígena passa correndo com o jabuti nas costas
shot(S.f12 - 9.0, S.f12 - .25, (tl, t, d) => {
  const tC = 2.0, lentoF = u => ramp(u, tC + 1.1, tC + 1.5) * (1 - ramp(u, tC + 2.7, tC + 3.1)), olhar = lentoF(tl);
  let x = 2050, fz = 0; for (let u = tC; u < tl; u += 1 / 30) { const k = 1 - .78 * lentoF(u); x -= 430 / 30 * k; fz += 10 / 30 * k }
  mata(tl, t, { pk: 'manha', seed: 61, trilha: { curva: 20 }, vento: .2, nevoa: .8, z: 1.12, raios: [700, -100, .2, 6, .5], meio: (tl2, t2) => {
    if (tl > tC && x > -300) fig('manha', () => indigena(x, 960, 440, t2, { fase: fz, anda: 1, olhar: olhar * .6 }, true));
    fig('manha', () => firmino(420, 1040, 580, { arma: 'baixo', medo: .6 + olhar * .3, cabeca: olhar * .04 }));
  }, perto: (tl2, t2) => { const q = rng(2); for (let i = 0; i < 6; i++) folha(1900 + q() * 200, 900 + q() * 160, 220, PI + .3 + q() * .6 + (tl > tC + 4.6 ? sin(t2 * 9) * .08 * (1 - ramp(tl, tC + 5.4, tC + 6.2)) : 0), 48, '#0c2416', 'rgba(255,255,255,.04)') } });
});
shot(S.f12 - .25, S.n25 - .3, (tl, t) => { fundoClose('manha', t, 62, { luz: .6 }); at(960, 620, 3.5, () => rostoFirmino({ medo: .8, boca: fala('f12', t) * .6, olharX: -.4 })) });
// a lembrança em câmera lenta: o indígena, o jabuti no aturá, o olhar
shot(S.n25 - .3, S.n26 - .3, (tl, t, d) => {
  fundoClose('manha', t * .3, 63, { luz: .9 });
  c.save(); c.filter = 'sepia(.35) saturate(.8)';
  const u = tl / d; fig('manha', () => indigena(lerp(1250, 700, u), 1250, 1250, t, { fase: t * 2.2, anda: .8, olhar: .5 }, true));
  c.restore(); c.filter = 'none';
  neblina(900, 500, .5, t, PAL.manha.fog, 6, 7);
});
shot(S.n26 - .3, S.n27 - 2.4, (tl, t, d) => {
  const u = ease(ramp(tl, 0, d));
  mata(tl, t, { pk: 'manha', seed: 64, trilha: { curva: 0 }, hy: 760, z: lerp(1, 1.5, u), fy: 900, vento: .1, nevoa: 1, raios: [960, -100, 0, 7, .5], samauma: .5, meio: (tl2, t2) => {
    fig('manha', () => firmino(960, 1000, 200, { arma: 'baixo', medo: .8, cabeca: sin(tl2 * .9) * .1 }));
  } });
  preto(ramp(tl, d - 1.6, d) * .85);
});
// ---- cena 6: o silêncio ----
shot(S.n27 - 2.4, S.n28 - .3, (tl, t, d) => {
  const resp = sin(tl * 2.6) * .5 + .5, chama = ramp(t, S.f13 - .2, S.f13 + .3);
  mata(tl, t, { pk: 'manha', seed: 65, trilha: { curva: 0 }, vento: 0, nevoa: 1.1, z: 1.1 + tl * .008, px: sin(tl * .2) * 60, raios: [1100, -100, -.15, 6, .4], meio: (tl2, t2) => {
    fig('manha', () => firmino(860 + ramp(tl, d - 2, d) * 60, 1040 + resp * 2, 600, { arma: 'baixo', anda: ramp(tl, d - 2, d - 1.6) * (1 - ramp(tl, d - .6, d)) * .6, fase: t2 * 4, medo: .6, cabeca: chama * -.08 + sin(tl2 * .7) * .05, boca: fala('f13', t2) }));
  } });
});
shot(S.n28 - .3, P('n28', 'Não havia movimento') - .25, (tl, t, d) => {
  const p = PAL.manha; ceu(p, { hy: 1100, t, sol: [1500, 140] }); c.drawImage(camFundo('manha', 66, 1100), -400 - tl * 8, -260); neblina(600, 500, .6, t, p.fog, 2, 4);
  galho(-50, 560, 900, 520, 26, '#3a2a1a', p.folhas); galho(1000, 420, 1980, 380, 22, '#3a2a1a', p.folhas); galho(200, 220, 1100, 260, 18, '#3a2a1a', p.folhas);
  cipos(t, 67, 8, [p.near, p.folhas[1]], { vento: 0 });
});
shot(P('n28', 'Não havia movimento') - .25, P('n28', 'Era como se') - .25, (tl, t) => {
  mata(tl, t, { pk: 'manha', seed: 68, hy: 560, z: 1.3, vento: 0, nevoa: .9, raios: 0, troncos: 0 });
  const q = rng(5); for (let i = 0; i < 30; i++) bromelia(q() * W, 880 + q() * 200, 140 + q() * 80, ['#1e4a2a', '#2e5e34', '#b8342a'], q);
});
shot(P('n28', 'Era como se') - .25, S.n29 - .3, (tl, t, d) => {
  mata(tl, t, { pk: 'manha', seed: 69, hy: 700, z: lerp(1, 1.12, tl / d), vento: 0, nevoa: 1.3, samauma: .45, raios: [960, -100, 0, 8, .45] });
});
shot(S.n29 - .3, S.n30 - 5.8, (tl, t, d) => {
  const z = lerp(2.6, 3.6, ease(ramp(tl, 0, d - 1)));
  fundoClose('manha', t, 70, { luz: .4 });
  const atras = ramp(tl, d - 5, d - 3);
  if (atras > 0) add(() => { for (const k of [-1, 1]) glow(1560 + k * 10, 330, 14, '255,40,20', .5 * atras * (1 - ramp(tl, d - 1.6, d - 1))) });
  at(860, 640, z, () => rostoFirmino({ medo: 1, suor: 1, olharX: .7 }));
  preto(ramp(tl, d - 1.6, d - .4));
});
shot(S.n30 - 5.8, S.n30 - .4, (tl, t, d) => chapter(tl, 3, 'O ÚLTIMO RASTRO DE FIRMINO', d));

// ======================= CAPÍTULO 3 — O ÚLTIMO RASTRO DE FIRMINO =======================
shot(S.n30 - .4, S.n31 - .3, (tl, t, d) => {
  mata(tl, t, { pk: 'manha', seed: 71, trilha: { curva: 100 }, px: tl * 14, raios: [1300, -100, -.25, 6, .7], meio: (tl2, t2) => {
    fig('manha', () => firmino(lerp(380, 1150, tl / d), 990, 450, { arma: 'ombro', anda: 1, fase: t2 * 4.4, medo: .35, cabeca: sin(tl2 * .8) * .08 }));
  } });
  typeText(tl, TX, TY, 'DIAS DEPOIS', .3, 4.5, {});
});
shot(S.n31 - .3, S.n32 - .3, (tl, t, d) => {
  mata(tl, t, { pk: 'manha', seed: 72, trilha: { curva: 0 }, hy: 300, lama: 1, cipos: 0, troncos: 0, raios: 0, z: 1.2, meio: (tl2, t2) => { pegadas(380, 840, 7, 190, 'anta', 1, 8) } });
  at(1500 - ease(ramp(tl, 0, 2)) * 200, 820, 9, () => { seg(30, -40, 6, -6, 10, 9, '#cdb68a'); seg(6, -6, 0, 0, 6, 5.4, PELE_F.pele); ell(-1, 1, 4.4, 3, .3, PELE_F.pele); for (let k = 0; k < 4; k++) seg(-2, 1.4 + k * .4, -6.4 + k * .3, 3.4 + k * .6, 1.4, 1.2, PELE_F.pele) });
});
shot(S.n32 - .3, P('n32', 'E, quanto') - .25, (tl, t, d) => {
  mata(tl, t, { pk: 'manha', seed: 73, trilha: { curva: 0 }, lama: 1, z: 1.1, nevoa: 1, raios: [900, -100, .1, 6, .5], meio: (tl2, t2) => {
    pegadas(780, 1060, 5, -60, 'anta', 1 - ramp(tl, 0, 1) * 0, 3);
    for (let i = 0; i < 9; i++) samambaia(500 + i * 110, 820, 170, '#1a3a24', rng(i + 3));
    fig('manha', () => firmino(1300, 1050, 560, { arma: 'baixo', medo: .4, cabeca: -.06 }, true));
  } });
});
shot(P('n32', 'E, quanto') - .25, S.n33 - 2.4, (tl, t, d) => {
  mata(tl, t, { pk: 'manha', seed: 74, hy: 680, z: lerp(1.15, 1, tl / d), nevoa: 1.2, raios: [1200, -100, -.2, 6, .5], meio: (tl2, t2) => {
    const q = rng(2); for (let i = 0; i < 5; i++) { const x = 1500 + (tl * 60 + i * 40) % 600, y = 420 + i * 12; c.save(); c.globalAlpha = 1 - ramp(tl, 2, d - .5); at(x, y, .45, () => arara(t + i, { tipo: 'vermelha' })); c.restore() }
    fig('manha', () => firmino(620, 1040, 600, { arma: 'baixo', medo: .3, cabeca: lerp(-.12, .14, ramp(tl, 0, d - 2)) }));
  } });
});
// ---- cena 8: a floresta não responde ----
shot(S.n33 - 2.4, P('n33', 'Depois,') - .2, (tl, t, d) => {
  mata(tl, t, { pk: 'manha', seed: 75, trilha: { curva: 90 }, ceu: { sol: [1500, 200] }, raios: [1400, -100, -.3, 8, 1], meio: (tl2, t2) => fig('manha', () => firmino(lerp(600, 1000, tl / d), 980, 420, { arma: 'ombro', anda: 1, fase: t2 * 4.4 })) });
});
shot(P('n33', 'Depois,') - .2, P('n33', 'E mais') - .2, (tl, t, d) => {
  mata(tl, t, { pk: 'chuva', seed: 76, trilha: { curva: -60 }, chuva: 1.2, raios: 0, nevoa: 1, meio: (tl2, t2) => fig('chuva', () => firmino(lerp(1300, 900, tl / d), 980, 440, { arma: 'ombro', anda: 1, fase: t2 * 4.4 }, true)) });
});
shot(P('n33', 'E mais') - .2, S.n34 - .3, (tl, t, d) => {
  mata(tl, t, { pk: 'tarde', seed: 77, agua: { y: 120, h: 340 }, raios: [1500, -100, -.4, 6, .9], meio: (tl2, t2) => fig('tarde', () => firmino(560, 820, 300, { arma: 'colo', sentado: 1 })) });
});
// horas à beira do igarapé (a luz passa)
shot(S.n34 - .3, P('n34', 'Seguiu pegadas') - .25, (tl, t, d) => {
  const u = tl / d, pk = u < .5 ? 'manha' : 'tarde';
  mata(tl, t, { pk, seed: 78, agua: { y: 140, h: 360 }, nevoa: .7, raios: [lerp(400, 1600, u), -100, lerp(.3, -.4, u), 6, .8], meio: (tl2, t2) => {
    fig(pk, () => firmino(700, 840, 330, { arma: 'colo', sentado: 1, cabeca: sin(tl2 * .3) * .05 }));
    for (let i = 0; i < 6; i++) pill(1100 + i * 90 + sin(t2 + i) * 30, 860 + i * 18, 120, 3, 'rgba(255,255,255,.25)');
  } });
  preto(Math.abs(u - .5) < .03 ? .6 : 0);
});
shot(P('n34', 'Seguiu pegadas') - .25, S.n35 - .3, (tl, t, d) => {
  mata(tl, t, { pk: 'manha', seed: 79, trilha: { curva: 0 }, lama: 1, nevoa: 1, z: 1.08, meio: (tl2, t2) => {
    pegadas(400, 1060, 6, 140, 'porco', 1, 5);
    fig('manha', () => firmino(lerp(500, 1300, tl / d), 1050, 520, { arma: 'baixo', anda: 1, fase: t2 * 3.6, medo: .5, cabeca: .1 }));
  } });
  preto(ramp(tl, d - .8, d) * .3);
});
shot(S.n35 - .3, S.n36 - .3, (tl, t, d) => {
  const u = ease(ramp(tl, 0, d));
  mata(tl, t, { pk: 'manha', seed: 80, hy: 720, z: lerp(1.4, 1, u), nevoa: .9, samauma: .6, raios: [960, -100, 0, 9, .9], atras: (tl2, t2) => { at(1500, 760, .7, () => veado(t2, { anda: .2, fase: t2 * 2 })); at(400, 770, .6, () => anta(t2, { anda: .1, fase: t2 })); for (let i = 0; i < 5; i++) at(700 + i * 160 + tl * 20, 300 + i * 20, .4, () => arara(t + i, {})) }, meio: (tl2, t2) => {
    fig('manha', () => firmino(960, 1000, 210, { arma: 'ombro', medo: .3 }));
  } });
});
shot(S.n36 - .3, P('n36', 'Aquele homem') - .25, (tl, t, d) => {
  mata(tl, t, { pk: 'chuva', seed: 81, trilha: { curva: 50 }, nevoa: 1.2, raios: 0, px: tl * 8, meio: (tl2, t2) => fig('chuva', () => firmino(lerp(500, 1100, tl / d), 1000, 470, { arma: 'ombro', anda: .8, fase: t2 * 3.4, idade: .8, medo: .3, inclina: .06 })) });
});
shot(P('n36', 'Aquele homem') - .25, S.a08 - 2.0, (tl, t, d) => { fundoClose('chuva', t, 82, { luz: .5 }); at(960, 620, lerp(3.1, 3.5, tl / d), () => rostoFirmino({ idade: 1, medo: .5, olharY: .4 })) });
// de volta ao barracão, de mãos vazias
shot(S.a08 - 2.0, S.a09 - .25, (tl, t, d) => {
  seringal(tl, t, { pk: 'tarde', ceu: { sol: [1650, 560], nuvens: 4 }, raios: [1500, -100, -.4, 6, .8], z: 1.2, meio: (tl2, t2) => {
    barracao(1250, 790, 900, PAL.tarde, t2, {});
    fig('tarde', () => { anselmo(1200, 1010, 500, t2, { boca: fala('a08', t2), olhar: -1, preocupado: ramp(tl, 1, 2) }); firmino(lerp(80, 600, ease(ramp(tl, 0, 2.6))), 1030, 540, { arma: 'mao', anda: 1 - ramp(tl, 2.2, 2.6), fase: t2 * 3.6, idade: .9, inclina: .06 }) });
  } });
});
shot(S.a09 - .25, S.f14 - .25, (tl, t) => { fundoClose('tarde', t, 83); at(960, 610, 3.3, () => closeAnselmo(t, { boca: fala('a09', t), preocupado: 1 })) });
shot(S.f14 - .25, S.a10 - .2, (tl, t) => { fundoClose('tarde', t, 84, { luz: .6 }); at(960, 620, 3.3, () => rostoFirmino({ idade: 1, medo: .4, olharY: .5, boca: fala('f14', t) })) });
shot(S.a10 - .2, S.f15 - .25, (tl, t) => { fundoClose('tarde', t, 83); at(960, 610, 3.3, () => closeAnselmo(t, { boca: fala('a10', t), preocupado: 1 })) });
shot(S.f15 - .25, E.f15 + .9, (tl, t) => { fundoClose('tarde', t, 84, { luz: .5 }); at(960, 620, 3.3 + tl * .05, () => rostoFirmino({ idade: 1, medo: .6, olharY: .7, boca: fala('f15', t) })) });
// ---- cena 9: o desaparecimento ----
shot(E.f15 + .9, E.f15 + 4.1, (tl, t, d) => {
  const p = PAL.noite; ceu(p, { hy: 1000, estrelas: 1, lua: [960, 480, 90 + tl * 6], nuvens: 7, t: t * 3 }); fade(tl, d, 1.2, .01);
});
shot(E.f15 + 4.1, E.f15 + 8.9, (tl, t, d) => {
  const u = ease(ramp(tl, 0, d)), luz = 1 - ramp(tl, 1.5, d);
  mata(tl, t, NOITE({ seed: 91, trilha: { curva: 0 }, ceu: { estrelas: 1, lua: [1500, 220, 64], luaA: .4 + luz * .6, nuvens: 5 }, raios: [1200, -120, .28, 6, .5 * luz], z: 1 + u * .1, meio: (tl2, t2) => {
    fig('noite', () => firmino(lerp(960, 975, u), lerp(1080, 820, u), lerp(520, 260, u), { arma: 'mao', anda: 1, fase: t2 * 3.4, idade: 1, inclina: .06 }, true), .5 + (1 - luz) * .3);
  } }));
  preto((1 - luz) * .35);
});
shot(E.f15 + 8.9, E.f15 + 11.7, (tl, t, d) => {
  const stop = ramp(tl, 1.2, 1.8);
  mata(tl, t, NOITE({ seed: 92, trilha: { curva: 0 }, ceu: { estrelas: .6, lua: MOON, luaA: .3, nuvens: 6 }, raios: 0, vagalumes: .3, px: tl * 30 * (1 - stop), meio: (tl2, t2) => {
    banho('rgba(4,8,10,1)', .9, () => firmino(lerp(600, 820, ease(ramp(tl, 0, 1.8))), 1000, 520, { arma: 'mao', anda: 1 - stop, fase: t2 * 3.4, idade: 1, cabeca: stop * .05 }), 'rgba(150,190,210,.05)');
  } }));
  preto(.3);
});
shot(E.f15 + 11.7, E.f15 + 13.6, (tl, t, d) => { fundoClose('noite', t, 93, { luz: .25 }); fig('noite', () => at(960, 640, 3.6 + tl * .2, () => rostoFirmino({ idade: 1, medo: .7, olharX: .2, vermelho: ramp(tl, .3, 1.2) })), .55) });
shot(E.f15 + 13.6, S.n37 - .3, (tl, t, d) => {
  const some = ramp(tl, 1.6, 2.0);
  mata(tl, t, NOITE({ seed: 94, trilha: { curva: -40 }, ceu: { estrelas: .6, lua: MOON, luaA: .3, nuvens: 6 }, raios: 0, vagalumes: .2, z: 1.05, meio: (tl2, t2) => {
    if (some < 1) { c.save(); c.globalAlpha = 1 - some; homemPreto(1080, 760, 170, t2, { olhos: 1.2, cabeca: .3 }); c.restore() }
  } }));
  preto(.25);
});
shot(S.n37 - .3, S.n38 - .3, (tl, t, d) => {
  mata(tl, t, NOITE({ seed: 94, trilha: { curva: -40 }, ceu: { estrelas: .6, lua: MOON, luaA: .5, nuvens: 6 }, raios: [1200, -120, .28, 5, .4], vagalumes: .4, z: 1.05 + tl * .015, nevoa: 1 }));
  preto(.15);
});
shot(S.n38 - .3, P('n38', 'Os seringueiros') - .25, (tl, t, d) => {
  seringal(tl, t, { pk: 'tarde', ceu: { sol: [1650, 560], nuvens: 4 }, raios: [1500, -100, -.4, 6, .8], z: 1.35, px: 300, meio: (tl2, t2) => { barracao(1250, 790, 900, PAL.tarde, t2, {}); fig('tarde', () => anselmo(1100, 1010, 520, t2, { olhar: -1, preocupado: 1, braco: 'cintura' })) } });
  typeText(tl, TX, TY, 'SEU ANSELMO ESPEROU', .3, d - .3, { sub: 'DURANTE DIAS' });
});
shot(P('n38', 'Os seringueiros') - .25, S.n39 - .3, (tl, t, d) => {
  mata(tl, t, { pk: 'manha', seed: 95, agua: { y: 100, h: 300 }, nevoa: 1, px: tl * 18, meio: (tl2, t2) => {
    for (let i = 0; i < 4; i++) fig('manha', () => seringueiro(300 + i * 330 + tl * 40, 860 + (i % 2) * 40, 300, t2, { anda: 1, ph: i, facao: 1, roupa: ['#7a6a50', '#5a6a5a', '#8a7a5a', '#6a5a4a'][i] }));
  } });
});
shot(S.n39 - .3, P('n39', 'Nem sequer') - .25, (tl, t, d) => {
  mata(tl, t, NOITE({ seed: 96, trilha: { curva: 30 }, ceu: { estrelas: .5, lua: MOON, nuvens: 6 }, raios: 0, vagalumes: 0, px: tl * 14, meio: (tl2, t2) => {
    for (let i = 0; i < 3; i++) seringueiro(400 + i * 420 + tl * 30, 900 + (i % 2) * 50, 320, t2, { anda: 1, ph: i * 2, lampiao: 1, roupa: '#3a3a30', pele: '#5a4030', chapeu: '#3a3424' });
  } }));
});
shot(P('n39', 'Nem sequer') - .25, S.n40 - .3, (tl, t, d) => {
  mata(tl, t, { pk: 'manha', seed: 97, trilha: { curva: 0 }, hy: 300, troncos: 0, cipos: 0, raios: [900, -100, .1, 5, .5], px: tl * 40, z: 1.2 });
});
shot(S.n40 - .3, P('n40', 'Há quem') - .25, (tl, t, d) => {
  mata(tl, t, NOITE({ seed: 98, hy: 720, samauma: .5, ceu: { estrelas: 1, lua: MOON, nuvens: 8 }, nevoa: 1.4, z: 1 + tl * .02, raios: [1200, -120, .28, 7, .5] }));
});
shot(P('n40', 'Há quem') - .25, P('n40', 'Outros acreditam') - .25, (tl, t, d) => {
  mata(tl, t, NOITE({ seed: 99, trilha: { curva: 0 }, nevoa: 1.5, raios: 0, vagalumes: 0, z: 1.08, meio: (tl2, t2) => { c.save(); c.globalAlpha = ramp(tl, .5, 2.4) * .85; homemPreto(960, 820, 300, t2, { olhos: 1, cabeca: .2 }); c.restore() } }));
  preto(.2);
});
shot(P('n40', 'Outros acreditam') - .25, S.n41 - .3, (tl, t, d) => {
  const u = ease(ramp(tl, 0, d));
  mata(tl, t, { pk: 'crepusculo', seed: 100, trilha: { curva: 0 }, ceu: { sol: [960, 640] }, raios: [960, -100, 0, 7, .5], nevoa: .9, meio: (tl2, t2) => { const q = rng(3); for (let i = 0; i < 26; i++) { const x = q() * W, len = 300 + q() * 500; c.strokeStyle = '#0a0d0a'; c.lineWidth = 5 + q() * 6; c.beginPath(); c.moveTo(x, -20); c.quadraticCurveTo(x + (q() - .5) * 200, len * u * .5, x + (q() - .5) * 120, -20 + len * u * (.6 + q() * .6)); c.stroke() } } });
  const q = rng(4); for (let i = 0; i < 30; i++) { const sd = q() < .5 ? -1 : 1, s = u * (.6 + q() * .7); folha(sd < 0 ? -40 + q() * 300 * u : W + 40 - q() * 300 * u, 200 + q() * 900, 300 * s, sd < 0 ? -.3 + q() * .6 : PI - .3 + q() * .6, 70 * s, '#050806', 'rgba(255,255,255,.03)') }
});
shot(S.n41 - .3, S.n42 - .3, (tl, t, d) => {
  const tp = P('n41', 'passos') - S.n41 + .3; let tr = 0; for (let k = 0; k < 8; k++) { const ts = tp + k * .9; if (tl > ts) tr += Math.max(0, 1 - (tl - ts) * 5) }
  c.save(); treme(tr * 5, t);
  mata(tl, t, NOITE({ seed: 101, trilha: { curva: -30 }, ceu: { estrelas: 1, lua: [960, 200, 80], nuvens: 4 }, nevoa: 1.3, vagalumes: 0, raios: [960, -120, 0, 7, .6], z: 1.05 + tl * .01 }));
  c.restore();
});
shot(S.n42 - .3, P('n42', 'Seus olhos') - .25, (tl, t, d) => {
  mata(tl, t, NOITE({ seed: 102, trilha: { curva: 0 }, ceu: { estrelas: 1, lua: [960, 200, 80], nuvens: 4 }, nevoa: 1.2, vagalumes: 0, raios: [960, -120, 0, 7, .7], z: 1 + tl * .03, meio: (tl2, t2) => homemPreto(960, 860, 360, t2, { olhos: ramp(tl, .4, 1.4), cabeca: .2 }) }));
});
shot(P('n42', 'Seus olhos') - .25, P('n42', 'E, quando') - .25, (tl, t, d) => { c.fillStyle = '#020405'; c.fillRect(0, 0, W, H); at(960, 640, 5.2, () => rostoPreto(t, { olhos: lerp(.8, 1.2, tl / d), cabeca: .1 })) });
shot(P('n42', 'E, quando') - .25, S.d06 - .3, (tl, t, d) => {
  mata(tl, t, NOITE({ seed: 102, trilha: { curva: 0 }, ceu: { estrelas: 1, lua: [960, 200, 80], nuvens: 4 }, nevoa: 1.2, vagalumes: 0, raios: [960, -120, 0, 7, .7], z: lerp(1.1, 1.5, tl / d), fy: 700, meio: (tl2, t2) => homemPreto(960, 860, 360, t2, { olhos: 1, cabeca: .3, sorriso: .2 }) }));
});
shot(S.d06 - .3, E.d06 + .7, (tl, t, d) => { fundoClose('noite', t, 103, { luz: .2 }); at(960, 600, 3.5 + tl * .12, () => rostoPreto(t, { olhos: 1.25, cabeca: .5, sorriso: .5, boca: fala('d06', t) })) });
// final: a câmera sobe sobre as copas; a lua; o título
shot(E.d06 + .7, DUR, (tl, t, d) => {
  const u = ease(ramp(tl, 0, 6.5)), p = PAL.noite;
  ceu(p, { hy: 620, estrelas: 1, lua: [960, lerp(420, 260, u), 80], nuvens: 7, t });
  const cam = (par) => { const s = 1 + (1 - u) * .5 * par; c.save(); c.translate(W / 2, 640); c.scale(s, s); c.translate(-W / 2, -640 + u * 260 * par) };
  cam(.2); c.drawImage(camFundo('noite', 11, 640), -400, 0); c.restore(); neblina(600, 300, .7, t, p.fog, 6, 100);
  cam(.6); c.drawImage(camFundo('noite', 12, 860), -400, 0); c.restore(); neblina(860, 340, .6, t, p.fog, 12, 300);
  cam(1.1); c.drawImage(camFundo('noite', 13, 1100), -400, 0); c.restore();
  at(lerp(-100, 2100, ramp(tl, 1.2, 5.5)), 380, .7, () => arara(t, { tipo: 'vermelha' }));
  preto(ramp(tl, 5.6, 7.4) * .9);
  const a = ramp(tl, 7.2, 8.4); label(W / 2, 500, 'O PACTO DA MATA', { size: 170, align: 'center', a });
  label(W / 2, 590, 'ALGUMAS DÍVIDAS NÃO SÃO PAGAS COM DINHEIRO.', { size: 50, align: 'center', col: OURO, a: ramp(tl, 8.8, 10), w: 600, ls: 5 });
  label(W / 2, 760, 'FIM', { size: 44, align: 'center', col: '#c8c0a8', a: ramp(tl, 10.6, 11.4), w: 600, ls: 14 });
});
