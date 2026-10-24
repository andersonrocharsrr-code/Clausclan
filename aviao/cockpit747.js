/* Hangar Escola: cockpit do Boeing 747-8.
   Modelo de voo de massa pontual (unidades SI) afinado com números do 747-8 a 350 t: cruzeiro Mach 0,85 a 37.000 ft,
   aproximação a 155 kt com flaps 30, rotação a ~158 kt com flaps 20 e estol limpo perto de 165 kt.
   Telas no estilo Boeing: PFD (voo), ND (navegação) e EICAS (motores e alertas). Números aproximados, para estudo. */
(() => {
'use strict';

const D2R = Math.PI / 180, KT = 0.514444, FT = 0.3048, NM = 1852, G = 9.81;
const P = {
  m: 350000, S: 554, CLa: 0.095, a0: -2.5, CLmax: 1.40, cd0: 0.017, k: 0.043,
  T0: 4 * 296000, gearCD: 0.020, sbCD: 0.035, sbCL: 0.30, incid: 0,   // incid: ângulo da asa com o avião parado no chão
  // posição: [ganho de sustentação, arrasto]
  flaps: { 0: [0, 0], 1: [0.25, 0.003], 5: [0.45, 0.008], 10: [0.62, 0.015], 20: [0.85, 0.025], 25: [1.0, 0.040], 30: [1.15, 0.060] },
  vfe: { 0: 365, 1: 285, 5: 265, 10: 245, 20: 230, 25: 205, 30: 180 },
  vmo: 365, mmo: 0.90, vlo: 270, v1: 150, vr: 158, v2: 168, vref: 152,
};
const DET = [0, 1, 5, 10, 20, 25, 30];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const isa = (h) => {
  const T = Math.max(216.65, 288.15 - 0.0065 * h);
  const rho = h < 11000 ? 1.225 * Math.pow(T / 288.15, 4.2559) : 0.3639 * Math.exp(-(h - 11000) / 6341.6);
  return { rho, a: Math.sqrt(1.4 * 287 * T), T };
};
function flapAt(f) {
  let i = 0; while (i < DET.length - 2 && f > DET[i + 1]) i++;
  const lo = DET[i], hi = DET[i + 1], t = clamp((f - lo) / (hi - lo), 0, 1);
  return P.flaps[lo].map((v, j) => v + (P.flaps[hi][j] - v) * t);
}
function aero(s, sb) {
  const [dCL, dCD] = flapAt(s.flap);
  // os flaps deslocam a curva de sustentação: a mesma sustentação sai com menos ângulo de ataque
  const a0 = P.a0 - 0.6 * dCL / P.CLa;
  const clmax = P.CLmax + dCL * 0.95;
  const acrit = a0 + clmax / P.CLa;
  let CL = P.CLa * (s.alpha - a0), over = 0;
  if (s.alpha > acrit) { over = s.alpha - acrit; CL = Math.max(0.4, clmax - 0.07 * over - 0.004 * over * over); }
  CL -= P.sbCL * sb * (CL > 0.3 ? 1 : 0);
  // efeito solo: perto da pista (menos de meia envergadura) a asa sustenta mais e o arrasto induzido cai
  const ge = s.h < 34 ? Math.pow(1 - Math.max(0, s.h) / 34, 2) : 0;
  CL *= 1 + 0.12 * ge;
  const CD = P.cd0 + dCD + P.gearCD * s.gear + P.sbCD * sb + P.k * (1 - 0.45 * ge) * CL * CL + 0.02 * over;
  return { CL, CD, acrit, clmax };
}
const thrustFrac = (sp) => 0.03 + 0.97 * Math.pow(clamp(sp, 0, 1), 1.4);
const thrust = (sp, rho, M) => P.T0 * thrustFrac(sp) * Math.pow(rho / 1.225, 0.75) * (1 - 0.25 * M);
const n1Of = (sp) => 25 + 77 * Math.pow(clamp(sp, 0, 1), 0.55);
// velocidade de estol na configuração atual (a inclinação aumenta o fator de carga)
function stallIas(flap, phi) {
  const clmax = P.CLmax + flapAt(flap)[0] * 0.95;
  return Math.sqrt(2 * P.m * G / (1.225 * P.S * clmax * Math.max(0.3, Math.cos(phi * D2R)))) / KT;
}

/* ---------- equilíbrio para começar um cenário já estabilizado ---------- */
function trimState(hft, ias, gammaDeg, flap, gear) {
  const h = hft * FT, { rho, a } = isa(h);
  const V = ias * KT / Math.sqrt(rho / 1.225), q = 0.5 * rho * V * V, g = gammaDeg * D2R;
  const s = { h, V, gamma: g, phi: 0, flap, gear, alpha: 3 };
  let sp = 0.5;
  for (let i = 0; i < 80; i++) {
    const A = aero(s, 0);
    const T = thrust(sp, rho, V / a);
    s.alpha += ((P.m * G * Math.cos(g) - T * Math.sin(s.alpha * D2R)) / (q * P.S) - A.CL) / P.CLa * 0.8;
    const f = (q * P.S * A.CD + P.m * G * Math.sin(g)) / (P.T0 * Math.pow(rho / 1.225, 0.75) * (1 - 0.25 * V / a));
    sp = Math.pow(Math.max(0, (f - 0.03) / 0.97), 1 / 1.4);
  }
  return { h, V, gamma: g, alpha: s.alpha, theta: gammaDeg + s.alpha, thr: clamp(sp, 0, 1) };
}

const SCENARIOS = [
  ['decolagem', 'Decolagem'],
  ['cruzeiro', 'Cruzeiro'],
  ['aproximacao', 'Aproximação'],
  ['estol', 'Estol'],
];
const RANGE = { decolagem: 10, cruzeiro: 40, aproximacao: 20, estol: 20 };
// vento de cada cenário: [de onde vem (graus), nós]. Na aproximação e na decolagem é de frente (pista 09).
const WIND = { decolagem: [90, 10], cruzeiro: [250, 85], aproximacao: [90, 14], estol: [300, 35] };
// rota no ND: fixos ao longo da linha da pista 09 (x em milhas a leste da cabeceira)
const WPTS = [['ARARA', -60], ['BRAVO', -25], ['RW09', 0], ['TAPIR', 30], ['URUBU', 90], ['VESPA', 170], ['XAXIM', 260]];
const VOR = { id: 'ESC', x: -6, y: 2 };

function create(ctl) {
  let s = {};
  let sc = 'cruzeiro';
  let msg = null;          // mensagem temporária (pouso, cauda na pista)
  let iasPrev = 0, trend = 0, airborneOnce = false;
  let demo = null, demoH = 0, demoT = 0, thrI = 0, v1Said = false;
  let fail = null;   // pane em treino (ver FAILS)   // piloto de demonstração (ver pilot())

  function start(id) {
    sc = id;
    msg = null;
    const base = { phi: 0, psi: 90, x: -30, y: 0, ground: false, stalled: false, tailstrike: false, touch: 0, airH: 9999 };
    if (id === 'decolagem') {
      s = { ...base, h: 0, V: 0, gamma: 0, alpha: P.incid, theta: 0, flap: 20, gear: 1, ground: true, x: 0.05, fuel: 150, spool: 0.05, ttrim: 0 };
      Object.assign(ctl, { elev: 0, ail: 0, rud: 0, thr: 1, flaps: 20, sb: 0, gearDown: 1 });
      airborneOnce = false;
    } else if (id === 'cruzeiro') {
      const t = trimState(37000, 260, 0, 0, 0);
      s = { ...base, ...t, flap: 0, gear: 0, fuel: 110, spool: t.thr, ttrim: t.theta };
      Object.assign(ctl, { elev: 0, ail: 0, rud: 0, thr: t.thr, flaps: 0, sb: 0, gearDown: 0 });
      airborneOnce = true;
    } else if (id === 'aproximacao') {
      const t = trimState(2500, 155, -3, 30, 1);
      const dist = (2500 - 50) / 318;
      s = { ...base, ...t, flap: 30, gear: 1, fuel: 25, spool: t.thr, ttrim: t.theta, x: -dist, y: 0 };
      Object.assign(ctl, { elev: 0, ail: 0, rud: 0, thr: t.thr, flaps: 30, sb: 0, gearDown: 1 });
      airborneOnce = true;
    } else {
      const t = trimState(10000, 185, 0, 0, 0);
      s = { ...base, ...t, flap: 0, gear: 0, fuel: 60, spool: 0.05, ttrim: t.theta };
      Object.assign(ctl, { elev: 0.3, ail: 0, rud: 0, thr: 0, flaps: 0, sb: 0, gearDown: 0 });
      airborneOnce = true;
    }
    iasPrev = ias(); trend = 0; s.fuel0 = s.fuel;
    // decolagem, aproximação e estol começam com o piloto de demonstração voando; cruzeiro fica nivelado
    demo = { decolagem: 'roll', aproximacao: 'app', estol: 'entry' }[id] || null;
    fail = null; s.eng = [1, 1, 1, 1];
    demoH = s.h; demoT = 0; thrI = ctl.thr; v1Said = false;
  }

  /* ---------- piloto de demonstração ----------
     Voa o cenário sozinho e mexe nos mesmos comandos que o aluno (os controles da tela acompanham),
     até o aluno tocar em qualquer comando. */
  const DEMO = {
    roll: 'manetes em TOGA, acelerando na pista até a velocidade de rotação',
    rotate: 'VR: puxando o manche, o nariz sobe uns 3° por segundo',
    climb: 'subindo com o nariz alto; trem e flaps recolhidos aos poucos',
    app: 'na rampa de 3° com o nariz um pouco acima do horizonte',
    flare: 'arredondamento: perto da pista o nariz sobe e a cauda baixa para tocar primeiro com o trem principal',
    rollout: 'no chão: manetes em marcha lenta, spoilers de solo, freio automático e o nariz baixando',
    entry: 'motores em marcha lenta e o manche puxado para manter a altitude: a velocidade cai e o nariz sobe',
    stall: 'estol: a asa perdeu sustentação e o nariz cai sozinho',
    recover: 'recuperação: manche à frente para baixar o ângulo de ataque e potência máxima',
    pullout: 'saindo do mergulho: o nariz volta aos poucos para o horizonte',
    hold: 'mantendo altitude, rumo e velocidade',
    emerg: 'descida de emergência: manetes em IDLE, speedbrake todo e nariz baixo, até 10.000 ft',
  };
  // manche leva o nariz à atitude tt (graus); com trim > 0 o compensador vai aliviando o manche (°/s)
  function flyTheta(tt, dt, trim = 0) {
    s.fdPitch = tt;
    s.ttrim += clamp(tt - s.ttrim, -1, 1) * trim * dt;
    ctl.elev = clamp((tt - s.ttrim) / 12, -1, 1);
  }
  // atitude para seguir a trajetória gc (graus): ângulo de ataque atual + trajetória desejada + correção,
  // sem passar de 2° abaixo do ângulo de estol (a não ser no cenário de estol, que quer chegar lá)
  const flyGamma = (gc, dt, max, trim = 0.4, protect = true) => {
    let tt = clamp(s.alpha + gc + 0.6 * (gc - s.gamma / D2R), -6, max);
    if (protect && s.A) tt = Math.min(tt, s.gamma / D2R + s.A.acrit - 2);
    flyTheta(tt, dt, trim);
  };
  function endDemo(txt) {
    demo = null; s.ttrim = s.theta; ctl.elev = 0;
    msg = { t: 12, cls: '', txt };
  }
  function pilot(dt) {
    const k = ias(), hf = hft(), vs = fpm();
    if (demo === 'roll' || demo === 'rotate' || demo === 'climb') {
      ctl.thr = hf > 1000 ? 0.92 : 1;
      if (s.ground && demo !== 'climb') {
        if (k >= P.vr) demo = 'rotate';
        flyTheta(demo === 'rotate' ? 9 : 0, dt);
      } else {
        demo = 'climb';
        if (vs > 300 && s.h > 10) ctl.gearDown = 0;
        // até 1000 ft sobe a V2 + 10; depois baixa um pouco o nariz para acelerar até 250 kt
        const vt = hf > 1000 ? Math.min(250, k + 12) : P.v2 + 10;
        flyGamma(clamp(6 + (k - vt) * 0.25, 0, 9), dt, 17, 0.25);
        if (hf > 1000) ctl.flaps = k > 230 ? 0 : k > 215 ? 1 : k > 200 ? 5 : k > 185 ? 10 : 20;
        if (hf > 4000) endDemo('Fim da demonstração: o 747 decolou, recolheu o trem e os flaps e está subindo. Agora os comandos são seus.');
      }
    } else if (demo === 'app' || demo === 'flare' || demo === 'rollout') {
      if (!s.ground) {
        if (hf > 45 && demo === 'app') {
          const gs = 50 + Math.max(0, -s.x) * 318;   // altura da rampa de 3° (318 ft por milha)
          flyGamma(-3 + clamp((gs - hf) / 120, -2, 2), dt, 8);
          thrI = clamp(thrI + 0.004 * (157 - k) * dt, 0, 1);
          ctl.thr = clamp(thrI + 0.05 * (157 - k) - 0.04 * trend, 0, 1);
        } else {
          demo = 'flare';
          const vc = Math.max(-750, -hf * 16 - 120);   // razão de descida desejada (ft/min), cai até ~120 no toque
          flyGamma(Math.asin(clamp(vc * FT / 60 / s.V, -0.2, 0.2)) / D2R, dt, 8, 0);
          if (hf < 30) ctl.thr = 0;
        }
      } else {
        demo = 'rollout'; ctl.thr = 0;
        flyTheta(Math.max(0, s.theta - 1.5), dt);
        if (s.V < 1) endDemo('Fim da demonstração: pouso feito e o avião parou na pista. Agora os comandos são seus.');
      }
    } else if (demo === 'hold' || demo === 'emerg') {
      // cruzeiro (ou nivelado depois da descida): mantém altitude, rumo 090 e a velocidade
      ctl.ail = clamp((((90 - s.psi + 540) % 360) - 180) * 0.03, -0.5, 0.5);
      if (demo === 'emerg') {
        ctl.thr = 0; ctl.sb = 1;
        flyGamma(clamp(-5 - (330 - k) * 0.12, -12, -1.5), dt, 10, 0.3);
        if (hf < 10600) { demo = 'hold'; demoH = 10000 * FT; ctl.sb = 0; thrI = 0.55; }
      } else {
        flyGamma(clamp((demoH - s.h) / 45, -2.5, 2.5), dt, 12, 0.3);
        const vt = hf < 11000 && fail && fail.id === 'despress' ? 280 : 260;
        thrI = clamp(thrI + 0.004 * (vt - k) * dt, 0, 1); ctl.thr = clamp(thrI + 0.05 * (vt - k) - 0.04 * trend, 0, 1);
      }
    } else if (demo) {
      const vs1 = stallIas(s.flap, s.phi), acrit = s.A ? s.A.acrit : 15;
      if (demo === 'entry') {
        ctl.thr = 0;
        flyGamma(clamp((demoH - s.h) / 40, -1, 1), dt, 22, 0, false);
        if (s.stalled) { demo = 'stall'; demoT = 0; }
      } else if (demo === 'stall') {
        if ((demoT += dt) > 2.5) demo = 'recover';   // segura uns segundos para mostrar o estol
      } else if (demo === 'recover') {
        ctl.thr = 1; flyTheta(Math.min(s.theta, -2), dt);
        if (!s.stalled && s.alpha < acrit - 3 && k > vs1 + 15) demo = 'pullout';
      } else {
        ctl.thr = 1; flyGamma(clamp((k - vs1 - 45) * 0.2, -6, 3), dt, 12, 0.3);
        if (vs > 0 && k > vs1 + 35) endDemo('Fim da demonstração: estol recuperado. Lembre: baixar o nariz primeiro, depois potência. Agora os comandos são seus.');
      }
    }
  }
  /* ---------- panes para treinar ----------
     Cada pane tem o cenário, o que acontece com o avião e o checklist (como no QRH do 747). Em "demonstração"
     o piloto faz tudo sozinho; em "treinar" o aluno voa e toca nos itens do checklist. */
  // potência de cada motor: 1 = normal, 0 = parado (ou cortado); manete em IDLE no motor com fogo ≈ 0
  const engPow = (i) => (!s.eng || s.eng[i] ? (fail && fail.idle[i] ? 0.05 : 1) : 0);
  const engFrac = () => (engPow(0) + engPow(1) + engPow(2) + engPow(3)) / 4;
  // guinada (°/s) quando os motores de um lado empurram mais: os de fora têm braço maior
  const yawAsym = () => (engPow(0) * 1 + engPow(1) * 0.6 - engPow(2) * 0.6 - engPow(3) * 1) * thrustFrac(s.spool) * 0.5;
  const FAILS = {
    motor: { scn: 'decolagem', title: 'Falha do motor 1 depois do V1',
      intro: 'Logo depois do V1 o motor 1 (o de fora, na asa esquerda) para. Os outros três empurram mais à direita e o nariz guina para a esquerda.',
      steps: [
        { t: 'Passou de V1: continue a decolagem. Não há mais pista para parar.', done: () => fail.on && !s.ground },
        { t: 'Pé no pedal do lado do motor bom (direito) para manter a reta: "pé morto, motor morto".', done: () => fail.on && ctl.rud > 0.15 },
        { t: 'Em VR, rode e suba na V2, com uns 12° de nariz.', done: () => fail.on && hft() > 50 },
        { t: 'Razão de subida positiva: trem em cima.', act: 'Trem em cima', fn: () => { ctl.gearDown = 0; }, done: () => fail.on && ctl.gearDown === 0 },
        { t: 'A 1.000 ft: manete 1 em IDLE e FUEL CONTROL 1 em CUTOFF.', act: 'FUEL CONTROL 1: CUTOFF', fn: () => { fail.cut[0] = true; }, done: () => fail.cut[0] },
      ] },
    fogo: { scn: 'cruzeiro', title: 'Fogo no motor 2',
      intro: 'No cruzeiro, o detector de fogo do motor 2 dispara: alarme, luz vermelha na alavanca de fogo e FIRE ENG 2 no EICAS.',
      steps: [
        { t: 'FIRE ENG 2: confirme qual é o motor antes de mexer em qualquer coisa.', done: () => fail.on },
        { t: 'Manete do motor 2 em IDLE.', act: 'Manete 2: IDLE', fn: () => { fail.idle[1] = true; }, done: () => fail.idle[1] },
        { t: 'FUEL CONTROL 2 em CUTOFF: corta o combustível do motor.', act: 'FUEL CONTROL 2: CUTOFF', fn: () => { fail.cut[1] = true; s.eng[1] = 0; }, done: () => fail.cut[1] },
        { t: 'Puxar a alavanca de fogo do motor 2: isola ar, combustível e hidráulica dele.', act: 'Puxar a alavanca de fogo 2', fn: () => { fail.handle = true; }, done: () => fail.handle },
        { t: 'Girar a alavanca para disparar a garrafa extintora.', act: 'Disparar a garrafa', fn: () => { if (!fail.handle) { msg = { t: 6, cls: 'warn', txt: 'Primeiro puxe a alavanca de fogo: só depois dá para girar e disparar a garrafa.' }; return false; } fail.bottle = true; fail.outT = fail.t + 3; return true; }, done: () => fail.bottle },
        { t: 'Fogo apagado: siga com três motores e planeje o pouso no aeroporto mais próximo.', done: () => fail.bottle && !fail.fire },
      ] },
    despress: { scn: 'cruzeiro', title: 'Despressurização',
      intro: 'A 37.000 ft o ar da cabine começa a escapar e a altitude da cabine sobe rápido. Acima de 10.000 ft aparece CABIN ALTITUDE: sem oxigênio, a consciência dura poucos segundos lá em cima.',
      steps: [
        { t: 'CABIN ALTITUDE: a cabine passou de 10.000 ft.', done: () => fail.on && s.cab > 10000 },
        { t: 'Máscaras de oxigênio da tripulação: colocar.', act: 'Colocar as máscaras', fn: () => { fail.masks = true; }, done: () => fail.masks },
        { t: 'Descida de emergência: manetes em IDLE e speedbrake todo.', act: 'IDLE e speedbrake', fn: () => { ctl.thr = 0; ctl.sb = 1; }, done: () => fail.on && ctl.thr < 0.08 && ctl.sb > 0.9 },
        { t: 'Nariz para baixo, perto de 330 kt, até 10.000 ft (onde dá para respirar).', done: () => fail.on && hft() < 10600 },
        { t: 'A 10.000 ft: recolher o speedbrake, nivelar e acelerar.', act: 'Recolher o speedbrake', fn: () => { ctl.sb = 0; }, done: () => fail.on && hft() < 11000 && ctl.sb < 0.1 },
      ] },
    trem: { scn: 'aproximacao', title: 'Trem não baixa',
      intro: 'Na aproximação a alavanca do trem vai para DOWN, mas o trem para no meio do caminho e não trava: GEAR DISAGREE.',
      steps: [
        { t: 'Alavanca do trem em DOWN.', act: 'Trem: DOWN', fn: () => { ctl.gearDown = 1; }, done: () => ctl.gearDown === 1 },
        { t: 'GEAR DISAGREE: o trem não travou embaixo.', done: () => ctl.gearDown && fail.gt > 12 },
        { t: 'ALTN GEAR EXTEND: a extensão alternativa solta as travas e o trem desce pelo próprio peso (mais devagar).', act: 'ALTN GEAR EXTEND', fn: () => { fail.altn = true; }, done: () => fail.altn },
        { t: 'GEAR DOWN em verde: continue a aproximação e pouse.', done: () => s.gear >= 0.99 },
      ] },
  };
  function startFail(id, mode) {
    const F = FAILS[id]; if (!F) return;
    start(F.scn);
    fail = { id, mode, t: 0, on: false, done: F.steps.map(() => false), cut: [false, false, false, false], idle: [false, false, false, false], gt: 0, fire: false, depress: false, complete: false };
    if (mode === 'solo') demo = null;
    else if (F.scn === 'cruzeiro') { demo = 'hold'; demoH = s.h; thrI = ctl.thr; }
    if (id === 'trem') { s.gear = 0; ctl.gearDown = 0; fail.on = true; }
    msg = { t: 8, cls: '', txt: mode === 'solo' ? 'Treino: voe o avião e siga o checklist da pane quando ela aparecer.' : 'Demonstração: observe o piloto e o checklist sendo feitos.' };
  }
  function failAct(i) {
    if (!fail) return;
    const st = FAILS[fail.id].steps[i];
    if (!st || !st.fn || fail.done[i]) return;
    if (st.fn() !== false) fail.done[i] = true;
  }
  function failStep(dt, k) {
    const F = FAILS[fail.id], hf = hft();
    fail.t += dt;
    if (ctl.gearDown) fail.gt += dt; else fail.gt = 0;
    // a pane acontece
    if (!fail.on) {
      if (fail.id === 'motor' && s.ground && k >= P.v1 + 3) { fail.on = true; s.eng[0] = 0; }
      if ((fail.id === 'fogo' || fail.id === 'despress') && fail.t > 5) { fail.on = true; if (fail.id === 'fogo') fail.fire = true; else fail.depress = true; fail.tOn = fail.t; }
    }
    if (fail.fire && fail.bottle && fail.t > fail.outT) { fail.fire = false; msg = { t: 8, cls: '', txt: 'Fogo apagado: a luz da alavanca de fogo do motor 2 apagou.' }; }
    // na demonstração o piloto faz o checklist
    if (fail.mode === 'demo' && fail.on) {
      const after = fail.t - (fail.tOn || 0), act = (i) => failAct(i);
      if (fail.id === 'motor') {
        ctl.rud = clamp(-yawAsym() / 0.6 + (((90 - s.psi + 540) % 360) - 180) * 0.4, -1, 1);
        if (hf > 1000) act(4);
      } else if (fail.id === 'fogo') {
        if (after > 3) act(1); if (after > 5) act(2); if (after > 7) act(3); if (after > 9) act(4);
      } else if (fail.id === 'despress') {
        if (after > 2) act(1);
        if (after > 4 && !fail.done[2]) { act(2); demo = 'emerg'; }
        if (demo === 'hold' && fail.done[2] && hf < 11000) act(4);
      } else if (fail.id === 'trem') {
        if (fail.t > 3) act(0);
        if (fail.gt > 18) act(2);
      }
    }
    F.steps.forEach((st, i) => { if (!fail.done[i] && !st.act && st.done()) fail.done[i] = true; });
    F.steps.forEach((st, i) => { if (!fail.done[i] && st.act && st.done()) fail.done[i] = true; });
    if (!fail.complete && fail.done.every(Boolean)) { fail.complete = true; msg = { t: 12, cls: '', txt: `Checklist completo: ${F.title.toLowerCase()} resolvida.` }; }
  }
  function failState() {
    if (!fail) return null;
    const F = FAILS[fail.id];
    return { id: fail.id, mode: fail.mode, title: F.title, intro: F.intro, on: fail.on, complete: fail.complete, steps: F.steps.map((st, i) => ({ t: st.t, act: st.act || '', done: fail.done[i] })) };
  }
  function takeover() {
    if (!demo) return;
    demo = null;
    msg = { t: 6, cls: '', txt: 'Você assumiu os comandos: o piloto de demonstração saiu.' };
  }
  const atm = () => isa(Math.max(0, s.h));
  const ias = () => s.V * Math.sqrt(atm().rho / 1.225) / KT;
  const mach = () => s.V / atm().a;
  const fpm = () => s.V * Math.sin(s.gamma) / FT * 60;
  const hft = () => s.h / FT;

  function step(dt) {
    const { rho, a } = atm();
    const V = s.V, q = 0.5 * rho * V * V, M = V / a, W = P.m * G;
    const kias = V * Math.sqrt(rho / 1.225) / KT;
    if (demo) pilot(dt);
    if (fail) failStep(dt, kias);
    // V1 na corrida de decolagem: a voz avisa no instante em que a velocidade chega a V1
    if (sc === 'decolagem' && s.ground && !v1Said && kias >= P.v1) {
      v1Said = true; say('v1', 'V one');
      msg = { t: 6, cls: '', txt: `V1 (${P.v1} kt): a partir daqui a decolagem continua mesmo se um motor falhar; não há mais pista para parar.` };
    }
    // os motores a jato demoram alguns segundos para acelerar (spool)
    s.spool += (ctl.thr - s.spool) * dt * 0.35;
    s.flap += Math.sign(ctl.flaps - s.flap) * Math.min(Math.abs(ctl.flaps - s.flap), 3 * dt);
    {
      const stuck = fail && fail.id === 'trem' && !fail.altn && ctl.gearDown;
      const tgt = stuck ? Math.min(ctl.gearDown, 0.35) : ctl.gearDown, rate = fail && fail.altn ? dt / 25 : dt / 10;
      s.gear += Math.sign(tgt - s.gear) * Math.min(Math.abs(tgt - s.gear), rate);
    }
    s.phi += ((s.ground ? 0 : ctl.ail * 50) - s.phi) * dt * 0.45;
    bankAlert();
    // depois do pouso, com as manetes em marcha lenta, os spoilers de solo sobem sozinhos
    s.groundSb = s.ground && airborneOnce && ctl.thr < 0.08 ? 1 : 0;
    const sb = Math.max(ctl.sb, s.groundSb);
    // manche = atitude do nariz em relação ao compensador; o 747 gira o nariz no máximo uns 3°/s
    let tcmd = s.ttrim + ctl.elev * 12;
    if (s.ground) tcmd = clamp(tcmd, 0, 16) * clamp((kias - 120) / 40, 0, 1);
    s.theta += clamp((tcmd - s.theta) * 0.9 * dt, -3 * dt, 3 * dt);
    if (s.ground) {
      s.theta = Math.max(0, s.theta); s.gamma = 0; s.alpha = s.theta + P.incid;
      const A = aero(s, sb), L = q * P.S * A.CL, D = q * P.S * A.CD, T = thrust(s.spool, rho, M) * engFrac();
      const mu = ctl.thr < 0.08 && V > 1 ? 0.25 : 0.015;   // em marcha lenta no solo: freio automático
      s.V = Math.max(0, V + ((T - D - mu * Math.max(0, W - L)) / P.m) * dt);
      if (s.theta > 11 && !s.tailstrike) { s.tailstrike = true; msg = { t: 8, cls: 'warn', txt: 'TAIL STRIKE: com o nariz acima de 11° no solo, a cauda do 747 encosta na pista. Puxe o manche mais devagar na rotação.' }; }
      if (L > W) { s.ground = false; s.gamma = 0.0005; s.airH = 0; airborneOnce = true; }
      s.h = 0; s.stalled = false; s.A = A;
      // no chão o leme e a roda do nariz viram o avião; um motor parado puxa para o lado dele
      const gk = clamp(s.V / 40, 0, 1);
      s.psi = (s.psi + (yawAsym() + ctl.rud * 0.6) * gk * dt + 360) % 360;
    } else {
      s.alpha = s.theta - s.gamma / D2R;
      let A = aero(s, sb);
      if (s.alpha > A.acrit) s.stalled = true; else if (s.alpha < A.acrit - 1) s.stalled = false;
      // em estol o nariz cai sozinho (o vento empurra a cauda para cima); o manche puxado só atrasa isso
      if (s.alpha > A.acrit) { s.theta -= (s.alpha - A.acrit + 1.5) * 1.1 * dt; s.alpha = s.theta - s.gamma / D2R; A = aero(s, sb); }
      const L = q * P.S * A.CL, D = q * P.S * A.CD, T = thrust(s.spool, rho, M) * engFrac(), al = s.alpha * D2R;
      s.V = Math.max(40, V + ((T * Math.cos(al) - D) / P.m - G * Math.sin(s.gamma)) * dt);
      s.gamma += ((L * Math.cos(s.phi * D2R) + T * Math.sin(al) - W * Math.cos(s.gamma)) / (P.m * V)) * dt;
      s.psi = (s.psi + (L * Math.sin(s.phi * D2R) / (P.m * V * Math.cos(s.gamma))) / D2R * dt + ctl.rud * 0.6 * dt + yawAsym() * dt + 360) % 360;
      s.h += V * Math.sin(s.gamma) * dt;
      s.airH = Math.max(s.airH || 0, s.h / FT);
      s.A = A;
      if (s.h <= 0) touchdown();
    }
    // vento: cresce do chão (calmo) até ~1000 ft e soma com a velocidade do ar para dar a velocidade no solo
    const [wd, wk] = WIND[sc] || [0, 0], wf = Math.sqrt(clamp(s.h / 300, 0, 1)), wto = (wd + 180) * D2R;
    s.wdir = wd; s.wspd = wk * wf;
    const va = s.V * Math.cos(s.gamma);
    const ve = va * Math.sin(s.psi * D2R) + s.wspd * KT * Math.sin(wto), vn = va * Math.cos(s.psi * D2R) + s.wspd * KT * Math.cos(wto);
    s.gs = Math.hypot(ve, vn);
    s.trk = s.gs > 1 ? (Math.atan2(ve, vn) / D2R + 360) % 360 : s.psi;
    s.x += ve * dt / NM;
    s.y += vn * dt / NM;
    s.fuel = Math.max(0, s.fuel - 4 * ffEngine() * dt / 3600 / 1000);
    const ctgt = Math.max(50, Math.min(8000, hft() * 0.2));
    if (s.cab == null) s.cab = ctgt;
    if (fail && fail.depress) s.cabRate = s.cab < hft() ? clamp((hft() - s.cab) * 2, 0, 3000) : (hft() - s.cab) * 2;
    else s.cabRate = clamp((ctgt - s.cab) * 1.2, -750, 500);
    s.cab += s.cabRate / 60 * dt;
    s.ball = clamp(-ctl.rud * 0.7 + ctl.ail * 0.15 - yawAsym() * 1.4, -1, 1);
    const now = ias();
    trend += ((now - iasPrev) / Math.max(dt, 1e-3) - trend) * Math.min(1, dt * 1.5);
    iasPrev = now;
    if (msg && (msg.t -= dt) <= 0) msg = null;
  }
  // alerta do EGPWS do 747-8: ao passar de 35°, 40° e 45° de inclinação a voz diz "BANK ANGLE, BANK ANGLE"
  // e, no PFD, o ponteiro de inclinação e o indicador de derrapagem ficam âmbar
  let bankStep = 0;
  function bankAlert() {
    const b = Math.abs(s.phi), step = b > 45 ? 3 : b > 40 ? 2 : b > 35 ? 1 : 0;
    if (step > bankStep && !s.ground) say('bank', 'Bank angle, bank angle');
    if (step > bankStep || b < 30) bankStep = step;
  }
  // vozes gravadas da cabine real (o WebView do Android não tem síntese de voz): "bank angle" e o "V1" da decolagem.
  // O celular só deixa tocar áudio depois de um toque: no primeiro toque na página cada áudio é destravado tocando-o mudo.
  const VOICES = { bank: 'assets/bank-angle.mp3', v1: 'assets/v1.mp3' };
  const voices = {};
  if (typeof Audio !== 'undefined' && typeof document !== 'undefined') {
    Object.entries(VOICES).forEach(([k, src]) => { voices[k] = new Audio(src); voices[k].preload = 'auto'; });
    const unlock = () => {
      let pending = 0;
      Object.values(voices).forEach((a) => {
        a.muted = true; pending++;
        const p = a.play();
        const done = () => { a.pause(); a.currentTime = 0; a.muted = false; if (--pending === 0) ['pointerdown', 'touchend', 'keydown'].forEach((e) => document.removeEventListener(e, unlock, true)); };
        if (p && p.then) p.then(done).catch(() => { a.muted = false; }); else done();
      });
    };
    ['pointerdown', 'touchend', 'keydown'].forEach((e) => document.addEventListener(e, unlock, true));
  }
  function say(key, t) {
    const speak = () => {
      try {
        const sp = window.speechSynthesis; if (!sp) return;
        const u = new SpeechSynthesisUtterance(t); u.lang = 'en-US'; u.rate = 1.05; sp.speak(u);
      } catch (e) { /* sem voz neste aparelho */ }
    };
    const a = voices[key];
    if (!a) return speak();
    if (!a.paused && !a.ended && !a.muted) return;   // ainda falando: não corta a frase
    a.muted = false; a.currentTime = 0;
    const p = a.play();
    if (p && p.catch) p.catch(speak);
  }
  function touchdown() {
    const v = fpm();
    s.touch = v; s.h = 0; s.ground = true; s.gamma = 0;
    if ((s.airH || 0) < 15) return;   // só encostou logo depois de sair do chão: não é um pouso
    const onRwy = sc === 'aproximacao' && s.x > -0.02 && s.x < 2.2 && Math.abs(s.y) < 0.03;
    const q = -v < 360 ? ['', 'Pouso suave'] : -v < 600 ? ['', 'Pouso firme'] : -v < 1000 ? ['warn', 'Pouso duro'] : ['warn', 'Pouso muito duro: num avião real, o trem e a estrutura seriam inspecionados'];
    const where = sc === 'aproximacao' ? (onRwy ? 'na pista' : 'fora da pista') : 'longe de qualquer aeroporto';
    msg = { t: 10, cls: q[0] || (onRwy ? '' : 'warn'), txt: `${q[1]} (${Math.round(-v)} ft/min), ${where}. Com as manetes em marcha lenta, os spoilers de solo sobem e o freio automático para o avião.` };
  }
  const ffEngine = () => (700 + 9000 * Math.pow(clamp(s.spool, 0, 1), 1.6) * Math.pow(atm().rho / 1.225, 0.7));
  function trim() { s.ttrim = s.theta; ctl.elev = 0; }

  /* ---------- telas ---------- */
  const F = (size, w = 500) => `${w} ${size}px "IBM Plex Mono", ui-monospace, monospace`;
  const FS = (size, w = 600) => `${w} ${size}px "IBM Plex Sans", "Segoe UI", system-ui, sans-serif`;
  const COL = { white: '#f2f5f7', green: '#3be36c', magenta: '#f03bd9', cyan: '#4fd7ff', amber: '#ffb000', red: '#ff3b30', gray: '#5a6168', sky: '#2c74c9', ground: '#8a5730' };
  function txt(c, t, x, y, font, color, align = 'center', base = 'middle') { c.font = font; c.fillStyle = color; c.textAlign = align; c.textBaseline = base; c.fillText(t, x, y); }
  function rr(c, x, y, w, h, r) { c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h); }
  function frame(c, x, y, w, h, title) {
    c.fillStyle = '#05080a'; rr(c, x, y, w, h, 10); c.fill();
    c.strokeStyle = '#2b333a'; c.lineWidth = 2; rr(c, x + 1, y + 1, w - 2, h - 2, 10); c.stroke();
    txt(c, title, x + w / 2, y + h - 9, F(Math.max(8, w * 0.032)), '#7d8a95');
  }
  function barber(c, x, y, w, h) {
    c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
    c.fillStyle = '#000'; c.fillRect(x, y, w, h); c.fillStyle = COL.red;
    for (let k = -w * 2; k < h + w * 2; k += w * 1.4) { c.beginPath(); c.moveTo(x, y + k); c.lineTo(x + w, y + k - w * 0.7); c.lineTo(x + w, y + k); c.lineTo(x, y + k + w * 0.7); c.fill(); }
    c.restore();
  }
  function rwy() { return { x: 0, y: 0, hdg: 90, len: 2.2, name: 'PISTA 09' }; }
  function rwyGeom() {
    const r = rwy(), dx = r.x - s.x, dy = r.y - s.y;
    const dist = Math.hypot(dx, dy);
    const brg = (Math.atan2(dx, dy) / D2R + 360) % 360;
    let loc = ((brg - r.hdg + 540) % 360) - 180;   // ângulo entre a direção da pista e a direção até ela
    const ahead = Math.cos((brg - r.hdg) * D2R) > 0;
    return { dist, brg, loc, ahead, gsDev: hft() - (dist * 318 + 50) };
  }

  /* modos do piloto automático (FMA): [manetes, rolagem, arfagem] e o estado do AFDS embaixo.
     Com o piloto de demonstração voando aparece CMD (ou LAND 3 na aproximação final); sem ele, FD. */
  function fma() {
    const hf = hft();
    let m;
    if (sc === 'decolagem') m = s.ground ? ['THR REF', 'TO/GA', 'TO/GA'] : hf < 1000 ? ['THR REF', 'LNAV', 'TO/GA'] : ['THR REF', 'LNAV', 'VNAV SPD'];
    else if (sc === 'cruzeiro') m = ['SPD', 'LNAV', 'VNAV PTH'];
    else if (sc === 'aproximacao') m = s.ground ? ['IDLE', 'ROLLOUT', ''] : demo === 'flare' ? ['IDLE', 'LOC', 'FLARE'] : ['SPD', 'LOC', 'G/S'];
    else m = demo === 'entry' ? ['HOLD', 'HDG HOLD', 'ALT'] : demo ? ['THR', 'HDG HOLD', 'FLCH SPD'] : ['', 'HDG HOLD', ''];
    const st = !demo ? 'FD' : sc === 'aproximacao' && hf < 1500 ? 'LAND 3' : 'CMD';
    return { m, st };
  }
  let fmaPrev = ['', '', '', ''], fmaT = [0, 0, 0, 0];
  // velocidade e altitude selecionadas no painel do piloto automático (MCP), em magenta no PFD
  function mcp() {
    const hf = hft();
    if (sc === 'decolagem') return { spd: hf < 1000 ? P.v2 + 10 : 250, alt: 13000, hdg: 90 };
    if (sc === 'cruzeiro') return { spd: 260, alt: 37000, hdg: 90 };
    if (sc === 'aproximacao') return { spd: 157, alt: 3000, hdg: 90 };
    return { spd: 180, alt: 10000, hdg: 90 };
  }
  // velocidades de manobra de cada posição de flap (referência VREF 30 + margem), mostradas na fita
  const FLAP_SPD = { 0: ['UP', 80], 1: ['1', 60], 5: ['5', 40], 10: ['10', 30], 20: ['20', 20], 25: ['25', 10] };
  function drawPFD(c, x, y, w, h) {
    frame(c, x, y, w, h, 'PFD · TELA DE VOO PRINCIPAL');
    const kias = ias(), alt = hft(), vs = fpm();
    const cx = x + w * 0.45, cy = y + h * 0.45, aw = w * 0.42, ah = h * 0.5;
    // atitude
    c.save(); rr(c, cx - aw / 2, cy - ah / 2, aw, ah, 8); c.clip();
    c.translate(cx, cy); c.rotate(-s.phi * D2R);
    const ppd = ah / 36;
    c.translate(0, s.theta * ppd);
    c.fillStyle = COL.sky; c.fillRect(-aw * 2, -ah * 4, aw * 4, ah * 4);
    c.fillStyle = COL.ground; c.fillRect(-aw * 2, 0, aw * 4, ah * 4);
    c.strokeStyle = COL.white; c.lineWidth = 2; c.beginPath(); c.moveTo(-aw * 2, 0); c.lineTo(aw * 2, 0); c.stroke();
    c.lineWidth = 1.4;
    for (let p = -30; p <= 30; p += 2.5) {
      if (!p) continue;
      const len = p % 10 === 0 ? aw * 0.26 : p % 5 === 0 ? aw * 0.14 : aw * 0.06, yy = -p * ppd;
      c.beginPath(); c.moveTo(-len / 2, yy); c.lineTo(len / 2, yy); c.stroke();
      if (p % 10 === 0) { txt(c, Math.abs(p), -len / 2 - 4, yy, F(ah * 0.055), COL.white, 'right'); txt(c, Math.abs(p), len / 2 + 4, yy, F(ah * 0.055), COL.white, 'left'); }
    }
    c.restore();
    // escala de inclinação
    c.save(); c.translate(cx, cy);
    const R = ah * 0.46;
    c.strokeStyle = COL.white; c.lineWidth = 1.5;
    [-60, -45, -30, -20, -10, 10, 20, 30, 45, 60].forEach((b) => { const an = (b - 90) * D2R, l = Math.abs(b) % 30 === 0 ? 10 : 6; c.beginPath(); c.moveTo(Math.cos(an) * R, Math.sin(an) * R); c.lineTo(Math.cos(an) * (R + l), Math.sin(an) * (R + l)); c.stroke(); });
    c.fillStyle = COL.white; c.beginPath(); c.moveTo(0, -R); c.lineTo(-6, -R - 10); c.lineTo(6, -R - 10); c.closePath(); c.fill();
    c.rotate(-s.phi * D2R);
    // acima de 35° o ponteiro e o indicador de derrapagem ficam âmbar e cheios (como no 747-8)
    const bankOver = Math.abs(s.phi) > 35;
    c.fillStyle = bankOver ? COL.amber : COL.white; c.strokeStyle = c.fillStyle; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(0, -R + 1); c.lineTo(-6, -R + 11); c.lineTo(6, -R + 11); c.closePath(); c.fill();
    const bx = (s.ball || 0) * 9;
    c.beginPath(); c.moveTo(bx - 7, -R + 13); c.lineTo(bx + 7, -R + 13); c.lineTo(bx + 8, -R + 17); c.lineTo(bx - 8, -R + 17); c.closePath();
    if (bankOver) c.fill(); else c.stroke();
    c.restore();
    // barras do diretor de voo (magenta): a horizontal mostra a atitude pedida, a vertical a inclinação pedida
    {
      const pd = demo && s.fdPitch != null ? clamp((s.fdPitch - s.theta) * ppd, -ah * 0.35, ah * 0.35) : 0;
      const rd = clamp(-s.phi * aw * 0.006, -aw * 0.3, aw * 0.3);
      c.save(); c.translate(cx, cy); c.strokeStyle = COL.magenta; c.lineWidth = 3;
      c.beginPath(); c.moveTo(-aw * 0.28, -pd); c.lineTo(aw * 0.28, -pd); c.moveTo(rd, -ah * 0.3); c.lineTo(rd, ah * 0.3); c.stroke(); c.restore();
    }
    if (sc === 'aproximacao') { const g0 = rwyGeom(); [['IESC/090°', COL.white], [`DME ${g0.dist.toFixed(1)}`, COL.white], ['ILS', COL.green]].forEach(([t, col], k) => txt(c, t, cx - aw / 2 - w * 0.02, y + h * 0.125 + k * h * 0.03, F(h * 0.026, 600), col, 'left')); }
    else txt(c, 'FMC', cx - aw / 2 - w * 0.02, y + h * 0.13, F(h * 0.032, 600), COL.white, 'left');
    // símbolo do avião (fixo)
    c.save(); c.translate(cx, cy);
    c.fillStyle = '#000'; c.strokeStyle = COL.white; c.lineWidth = 1.6;
    const wl = aw * 0.24, wo = aw * 0.12;
    [[-1], [1]].forEach(([sd]) => { c.beginPath(); c.moveTo(sd * wo, -3); c.lineTo(sd * (wo + wl), -3); c.lineTo(sd * (wo + wl), 3); c.lineTo(sd * (wo + 7), 3); c.lineTo(sd * (wo + 7), 12); c.lineTo(sd * wo, 12); c.closePath(); c.fill(); c.stroke(); });
    c.fillRect(-4, -4, 8, 8); c.strokeRect(-4, -4, 8, 8);
    c.restore();
    // altitude-rádio e indicação da rampa
    // altitude-rádio: grande, embaixo no centro da atitude (âmbar abaixo dos mínimos)
    if (alt < 2500 && !s.ground) {
      const ra = alt > 500 ? Math.round(alt / 10) * 10 : Math.round(alt), rw2 = aw * 0.26, rh2 = ah * 0.1, ry = cy + ah / 2 - rh2 - ah * 0.15;
      c.fillStyle = '#000'; c.fillRect(cx - rw2 / 2, ry, rw2, rh2);
      txt(c, String(ra), cx, ry + rh2 / 2 + 1, F(ah * 0.085, 600), sc === 'aproximacao' && alt < 200 ? COL.amber : COL.white);
    }
    if (sc === 'aproximacao') {
      const g = rwyGeom();
      if (g.ahead && g.dist < 25) {
        const gsx = cx + aw / 2 - 12, gsy = cy, sp = ah * 0.09;
        c.fillStyle = COL.white; for (let i = -2; i <= 2; i++) if (i) { c.beginPath(); c.arc(gsx, gsy + i * sp, 3, 0, Math.PI * 2); c.stroke(); }
        const dev = clamp(-g.gsDev / Math.max(60, g.dist * 120), -2.4, 2.4);   // ~1 ponto = 0,35°
        c.fillStyle = COL.magenta; c.beginPath(); c.moveTo(gsx, gsy - dev * sp - 7); c.lineTo(gsx + 5, gsy - dev * sp); c.lineTo(gsx, gsy - dev * sp + 7); c.lineTo(gsx - 5, gsy - dev * sp); c.fill();
        const lx = cx, ly = cy + ah / 2 - 12, lsp = aw * 0.09;
        for (let i = -2; i <= 2; i++) if (i) { c.beginPath(); c.arc(lx + i * lsp, ly, 3, 0, Math.PI * 2); c.stroke(); }
        const ldev = clamp(-g.loc / 1.2, -2.4, 2.4);
        c.beginPath(); c.moveTo(lx + ldev * lsp - 7, ly); c.lineTo(lx + ldev * lsp, ly - 5); c.lineTo(lx + ldev * lsp + 7, ly); c.lineTo(lx + ldev * lsp, ly + 5); c.fill();
      }
    }
    // fita de velocidade
    const tx = x + w * 0.035, tw = w * 0.135, th = ah * 1.12, ty = cy - th / 2, ppk = th / 120;
    c.save(); c.beginPath(); c.rect(tx, ty, tw, th); c.clip();
    c.fillStyle = COL.gray; c.fillRect(tx, ty, tw, th);
    const vy = (v) => cy - (v - kias) * ppk;
    const vs1 = stallIas(s.flap, s.phi);
    barber(c, tx + tw - 7, vy(9999), 7, vy(P.vmo) - vy(9999));
    if (!s.ground) {   // a faixa de estol só aparece em voo
      barber(c, tx + tw - 7, vy(vs1 * 1.02), 7, vy(0) - vy(vs1 * 1.02));
      c.fillStyle = COL.amber; c.fillRect(tx + tw - 4, vy(vs1 * 1.15), 4, vy(vs1 * 1.02) - vy(vs1 * 1.15));
    }
    c.strokeStyle = COL.white; c.lineWidth = 1.5;
    for (let v = Math.floor((kias - 60) / 10) * 10; v <= kias + 60; v += 10) {
      if (v < 30) continue;
      c.beginPath(); c.moveTo(tx + tw - 9, vy(v)); c.lineTo(tx + tw - 16, vy(v)); c.stroke();
      if (v % 20 === 0) txt(c, v, tx + tw - 19, vy(v), F(th * 0.055), COL.white, 'right');
    }
    const bug = (v, t) => { c.strokeStyle = COL.green; c.beginPath(); c.moveTo(tx + tw - 7, vy(v)); c.lineTo(tx + tw, vy(v)); c.stroke(); txt(c, t, tx + tw - 2, vy(v) - 6, F(th * 0.04, 600), COL.green, 'right'); };
    if (sc === 'decolagem' && kias < 230) { bug(P.v1, 'V1'); bug(P.vr, 'VR'); bug(P.v2, 'V2'); }
    if (sc === 'aproximacao') bug(P.vref, 'REF');
    // velocidades de manobra: a da posição atual e a da próxima acima (só em voo)
    if (!s.ground) {
      const dets = [0, 1, 5, 10, 20, 25], cur = ctl.flaps, nxt = dets.filter((d) => d < cur).pop();
      [cur, nxt].forEach((d) => { if (d == null || !FLAP_SPD[d]) return; const v = P.vref + FLAP_SPD[d][1]; c.strokeStyle = COL.green; c.lineWidth = 1.5; c.beginPath(); c.moveTo(tx + tw - 7, vy(v)); c.lineTo(tx + tw, vy(v)); c.stroke(); txt(c, FLAP_SPD[d][0], tx + tw - 9, vy(v), F(th * 0.042, 600), COL.green, 'right'); });
    }
    // marcador da velocidade selecionada (magenta, preso na borda da fita se estiver fora)
    { const yv = clamp(vy(mcp().spd), ty + 4, ty + th - 4); c.strokeStyle = COL.magenta; c.lineWidth = 2; c.beginPath(); c.moveTo(tx + tw, yv - 6); c.lineTo(tx + tw - 8, yv - 6); c.lineTo(tx + tw - 8, yv + 6); c.lineTo(tx + tw, yv + 6); c.moveTo(tx + tw - 8, yv); c.lineTo(tx + tw - 3, yv); c.stroke(); }
    // vetor de tendência: onde a velocidade estará em 10 s
    const tv = clamp(trend * 10, -60, 60);
    if (Math.abs(tv) > 2) { c.strokeStyle = COL.green; c.lineWidth = 2; c.beginPath(); c.moveTo(tx + tw - 22, cy); c.lineTo(tx + tw - 22, vy(kias + tv)); c.stroke(); }
    c.restore();
    c.fillStyle = '#000'; c.strokeStyle = COL.white; c.lineWidth = 1.6; rr(c, tx - 2, cy - th * 0.05, tw - 2, th * 0.1, 3); c.fill(); c.stroke();
    txt(c, Math.max(0, Math.round(kias)), tx + tw * 0.48, cy + 1, F(th * 0.075, 600), kias < vs1 * 1.05 && !s.ground ? COL.amber : COL.white);
    const mc = mach();
    if (mc > 0.4) txt(c, mc.toFixed(3).slice(1), tx + tw / 2, ty + th + h * 0.04, F(h * 0.04, 600), COL.white);
    else if (sc === 'aproximacao') txt(c, `30/${P.vref}`, tx + tw / 2, ty + th + h * 0.04, F(h * 0.034, 600), COL.green);
    // fita de altitude
    const ax = cx + aw / 2 + w * 0.03, awd = w * 0.16, ppf = th / 1000;
    const ay = (a) => cy - (a - alt) * ppf;
    c.save(); c.beginPath(); c.rect(ax, ty, awd, th); c.clip();
    c.fillStyle = COL.gray; c.fillRect(ax, ty, awd, th);
    if (alt < 600) { c.fillStyle = COL.amber; c.fillRect(ax, ay(0), 5, th); }
    c.strokeStyle = COL.white; c.lineWidth = 1.5;
    for (let a = Math.floor((alt - 500) / 100) * 100; a <= alt + 500; a += 100) {
      if (a < 0) continue;
      c.beginPath(); c.moveTo(ax, ay(a)); c.lineTo(ax + 7, ay(a)); c.stroke();
      if (a % 200 === 0) txt(c, a, ax + 10, ay(a), F(th * 0.05), COL.white, 'left');
    }
    { const ya = clamp(ay(mcp().alt), ty + 4, ty + th - 4); c.strokeStyle = COL.magenta; c.lineWidth = 2; c.beginPath(); c.moveTo(ax, ya - 7); c.lineTo(ax + 9, ya - 7); c.lineTo(ax + 9, ya + 7); c.lineTo(ax, ya + 7); c.moveTo(ax + 2, ya); c.lineTo(ax + 8, ya); c.stroke(); }
    c.restore();
    c.fillStyle = '#000'; c.strokeStyle = COL.white; rr(c, ax + 3, cy - th * 0.055, awd + 4, th * 0.11, 3); c.fill(); c.stroke();
    const a10 = Math.max(0, Math.round(alt / 20) * 20);
    txt(c, Math.floor(a10 / 1000), ax + awd * 0.46, cy + 1, F(th * 0.085, 600), COL.white, 'right');
    txt(c, String(a10 % 1000).padStart(3, '0'), ax + awd * 0.48, cy + 2, F(th * 0.06, 600), COL.white, 'left');
    txt(c, alt > 18000 ? 'STD' : '1013 HPA', ax + awd / 2, ty + th + h * 0.04, F(h * 0.035, 600), COL.green);
    // velocidade vertical
    const vx = x + w * 0.9, vwd = w * 0.06, vh = th * 0.86;
    const vmap = (f) => { const a = Math.abs(f), k = a <= 1000 ? a / 1000 * 0.42 : a <= 2000 ? 0.42 + (a - 1000) / 1000 * 0.2 : 0.62 + (Math.min(a, 6000) - 2000) / 4000 * 0.38; return Math.sign(f) * k * vh / 2; };
    c.fillStyle = COL.gray; c.beginPath(); c.moveTo(vx, cy - vh / 2); c.lineTo(vx + vwd * 0.6, cy - vh / 2); c.lineTo(vx + vwd, cy - vh * 0.15); c.lineTo(vx + vwd, cy + vh * 0.15); c.lineTo(vx + vwd * 0.6, cy + vh / 2); c.lineTo(vx, cy + vh / 2); c.fill();
    [1000, 2000, 6000].forEach((f) => [1, -1].forEach((sd) => { c.strokeStyle = COL.white; c.beginPath(); c.moveTo(vx, cy - sd * vmap(f)); c.lineTo(vx + 5, cy - sd * vmap(f)); c.stroke(); txt(c, f / 1000, vx + 7, cy - sd * vmap(f), F(vh * 0.05), COL.white, 'left'); }));
    c.save(); c.beginPath(); c.rect(vx, cy - vh / 2, vwd, vh); c.clip();
    c.strokeStyle = COL.white; c.lineWidth = 2.5; c.beginPath(); c.moveTo(vx + vwd * 1.8, cy); c.lineTo(vx + 2, cy - vmap(vs)); c.stroke();
    c.restore();
    if (Math.abs(vs) > 400) txt(c, Math.round(Math.abs(vs) / 50) * 50, vx + vwd * 0.5, vs > 0 ? cy - vh / 2 - h * 0.025 : cy + vh / 2 + h * 0.025, F(h * 0.034, 600), COL.white);
    // rosa de proa
    c.save(); c.beginPath(); c.rect(x + 4, y + h * 0.8, w - 8, h * 0.13); c.clip();
    const rr2 = h * 0.24, rcx = cx, rcy = y + h * 0.8 + rr2 + h * 0.03;
    c.fillStyle = COL.gray; c.beginPath(); c.arc(rcx, rcy, rr2, 0, Math.PI * 2); c.fill();
    c.translate(rcx, rcy); c.rotate(-s.psi * D2R); c.strokeStyle = COL.white; c.lineWidth = 1.3;
    for (let d = 0; d < 360; d += 5) { c.save(); c.rotate(d * D2R); c.beginPath(); c.moveTo(0, -rr2); c.lineTo(0, -rr2 + (d % 10 ? 5 : 9)); c.stroke(); if (d % 30 === 0) txt(c, d / 10, 0, -rr2 + 18, F(h * 0.034, 600), COL.white); c.restore(); }
    c.save(); c.rotate(mcp().hdg * D2R); c.strokeStyle = COL.magenta; c.lineWidth = 2; c.beginPath(); c.moveTo(-7, -rr2 - 1); c.lineTo(-7, -rr2 + 6); c.lineTo(-3, -rr2 + 6); c.lineTo(0, -rr2 + 2); c.lineTo(3, -rr2 + 6); c.lineTo(7, -rr2 + 6); c.lineTo(7, -rr2 - 1); c.stroke(); c.restore();
    c.restore();
    c.fillStyle = '#000'; c.strokeStyle = COL.white; rr(c, cx - w * 0.055, y + h * 0.79, w * 0.11, h * 0.05, 3); c.fill(); c.stroke();
    txt(c, String(Math.round(s.psi) % 360).padStart(3, '0'), cx, y + h * 0.815, F(h * 0.036, 600), COL.white);
    txt(c, 'MAG', cx + w * 0.065, y + h * 0.815, F(h * 0.028, 600), COL.green, 'left');
    txt(c, `${String(mcp().hdg).padStart(3, '0')}H`, cx - w * 0.065, y + h * 0.815, F(h * 0.03, 600), COL.magenta, 'right');
    // FMA: três colunas (manetes | rolagem | arfagem); um modo novo ganha uma caixa branca por 10 s
    const { m, st } = fma(), now = Date.now(), fcw = aw * 1.25 / 3, fx0 = cx - fcw * 1.5, fyy = y + h * 0.055;
    c.fillStyle = '#3c434a'; c.fillRect(fx0, y + h * 0.022, fcw * 3, h * 0.066);
    c.strokeStyle = '#8b959d'; c.lineWidth = 1.2; c.strokeRect(fx0, y + h * 0.022, fcw * 3, h * 0.066);
    [1, 2].forEach((k) => { c.beginPath(); c.moveTo(fx0 + fcw * k, y + h * 0.022); c.lineTo(fx0 + fcw * k, y + h * 0.088); c.stroke(); });
    m.concat(st).forEach((t, k) => {
      if (t !== fmaPrev[k]) { fmaPrev[k] = t; fmaT[k] = now; }
      const fxk = k < 3 ? fx0 + fcw * (k + 0.5) : cx, fyk = k < 3 ? fyy : cy - ah / 2 - h * 0.035, fsz = k < 3 ? h * 0.034 : h * 0.036;
      if (!t) return;
      txt(c, t, fxk, fyk, F(fsz, 600), COL.green);
      if (now - fmaT[k] < 10000 && k < 3) { c.font = F(fsz, 600); const tw2 = c.measureText(t).width + 8; c.strokeStyle = COL.white; c.lineWidth = 1.2; c.strokeRect(fxk - tw2 / 2, fyk - fsz * 0.7, tw2, fsz * 1.4); }
    });
    // velocidade e altitude selecionadas (magenta) em cima das fitas
    const sel = mcp();
    txt(c, String(sel.spd), tx + tw / 2, ty - h * 0.03, F(h * 0.042, 600), COL.magenta);
    txt(c, String(sel.alt), ax + awd / 2 + 2, ty - h * 0.03, F(h * 0.042, 600), COL.magenta);
    // GS no canto de baixo à esquerda
    txt(c, `GS ${Math.round((s.gs == null ? s.V : s.gs) / KT)}`, x + 10, y + h * 0.87, F(h * 0.036, 600), COL.white, 'left');
    // mínimos (BARO) na aproximação: ficam âmbar abaixo deles
    if (sc === 'aproximacao') {
      txt(c, 'BARO', cx + aw / 2, y + h * 0.13, F(h * 0.028, 600), COL.green, 'right');
      txt(c, '200', cx + aw / 2, y + h * 0.13 + h * 0.034, F(h * 0.034, 600), alt < 200 && !s.ground ? COL.amber : COL.green, 'right');
    }
  }

  // estrela de fixo (4 pontas)
  function fix(c, px, py, r, col) {
    c.strokeStyle = col; c.lineWidth = 1.4; c.beginPath();
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr2 = i % 2 ? r * 0.3 : r; c.lineTo(px + Math.sin(a) * rr2, py - Math.cos(a) * rr2); }
    c.closePath(); c.stroke();
  }
  // ND no modo MAP com a trajetória para cima (TRK), como no 747-8
  function drawND(c, x, y, w, h) {
    frame(c, x, y, w, h, 'ND · NAVEGAÇÃO');
    const cx = x + w / 2, cy = y + h * 0.84, R = Math.min(h * 0.64, w * 0.46), range = RANGE[sc] || 10;
    const trk = s.trk == null ? s.psi : s.trk, gsk = (s.gs == null ? s.V : s.gs) / KT, fs = h * 0.036;
    // canto esquerdo: velocidade no solo, verdadeira e o vento com a seta
    txt(c, 'GS', x + 10, y + 16, F(fs * 0.85, 600), COL.white, 'left');
    txt(c, String(Math.round(gsk)), x + 10 + fs * 1.6, y + 16, F(fs * 1.25, 600), COL.white, 'left');
    txt(c, 'TAS', x + 10, y + 16 + h * 0.052, F(fs * 0.85, 600), COL.white, 'left');
    txt(c, String(Math.round(s.V / KT)), x + 10 + fs * 2.1, y + 16 + h * 0.052, F(fs, 600), COL.white, 'left');
    if (s.wspd >= 1) {
      const wy = y + 16 + h * 0.105;
      txt(c, `${String(Math.round(s.wdir) % 360).padStart(3, '0')}°/ ${Math.round(s.wspd)}`, x + 10, wy, F(fs, 600), COL.white, 'left');
      // a seta aponta para onde o vento sopra, na tela com a trajetória para cima
      c.save(); c.translate(x + 10 + fs * 1.4, wy + h * 0.085); c.rotate((s.wdir + 180 - trk) * D2R);
      const L = h * 0.05; c.strokeStyle = COL.white; c.fillStyle = COL.white; c.lineWidth = 2;
      c.beginPath(); c.moveTo(0, L); c.lineTo(0, -L + 5); c.stroke();
      c.beginPath(); c.moveTo(0, -L); c.lineTo(-5, -L + 8); c.lineTo(5, -L + 8); c.closePath(); c.fill();
      c.restore();
    }
    // centro: alcance, trajetória e o norte magnético
    const bw = w * 0.17, by = y + 6, bh = h * 0.07;
    c.fillStyle = '#000'; c.strokeStyle = COL.white; c.lineWidth = 1.5; rr(c, cx - bw / 2, by, bw, bh, 2); c.fill(); c.stroke();
    txt(c, String(Math.round(trk) % 360).padStart(3, '0'), cx, by + bh / 2 + 1, F(h * 0.05, 600), COL.white);
    txt(c, 'TRK', cx - bw / 2 - 4, by + bh / 2, F(fs * 0.9, 600), COL.green, 'right');
    txt(c, 'MAG', cx + bw / 2 + 4, by + bh / 2, F(fs * 0.9, 600), COL.green, 'left');
    if (w > 300) {
      const rx = cx - bw / 2 - fs * 2.6 - w * 0.1;
      c.strokeStyle = COL.white; c.lineWidth = 1; c.strokeRect(rx, by, w * 0.085, bh);
      txt(c, 'RANGE', rx + w * 0.0425, by + bh * 0.3, F(fs * 0.5, 600), COL.white);
      txt(c, String(range), rx + w * 0.0425, by + bh * 0.72, F(fs * 0.75, 600), COL.white);
    }
    // canto direito: próximo fixo (magenta), distância e hora estimada (UTC)
    const nxt = WPTS.find(([, wx]) => wx > s.x + 0.05);
    if (nxt) {
      const dist = Math.hypot(nxt[1] - s.x, s.y), eta = new Date(Date.now() + dist / Math.max(gsk, 60) * 3600e3);
      txt(c, nxt[0], x + w - 10, y + 16, F(fs * 1.05, 600), COL.magenta, 'right');
      txt(c, `${dist < 10 ? dist.toFixed(1) : Math.round(dist)}NM`, x + w - 10, y + 16 + h * 0.052, F(fs, 600), COL.white, 'right');
      txt(c, `${String(eta.getUTCHours()).padStart(2, '0')}${String(eta.getUTCMinutes()).padStart(2, '0')}.${Math.floor(eta.getUTCSeconds() / 6)}z`, x + w - 10, y + 16 + h * 0.1, F(fs * 0.9, 600), COL.white, 'right');
    }
    c.save(); c.beginPath(); c.rect(x + 3, y + h * 0.1, w - 6, h * 0.83); c.clip();
    c.translate(cx, cy);
    const ppn = R / range, tr = trk * D2R;
    const toND = (ex, ny) => { const dx = ex - s.x, dy = ny - s.y; return [(dx * Math.cos(tr) - dy * Math.sin(tr)) * ppn, -(dx * Math.sin(tr) + dy * Math.cos(tr)) * ppn]; };
    // rota: linha magenta entre os fixos; o próximo fixo em magenta, os outros em branco
    c.strokeStyle = COL.magenta; c.lineWidth = 1.8; c.beginPath();
    WPTS.forEach(([, wx], i) => { const p = toND(wx, 0); if (i) c.lineTo(p[0], p[1]); else c.moveTo(p[0], p[1]); }); c.stroke();
    WPTS.forEach(([nm, wx]) => { const p = toND(wx, 0); if (Math.hypot(p[0], p[1]) > R * 1.25 || nm === 'RW09') return; const act = nxt && nxt[0] === nm; fix(c, p[0], p[1], 7, act ? COL.magenta : COL.white); txt(c, nm, p[0] + 9, p[1] + 11, F(fs * 0.8, 600), act ? COL.magenta : COL.white, 'left'); });
    // pista e aeroporto
    const r = rwy(), e = [r.x + Math.sin(r.hdg * D2R) * r.len, r.y + Math.cos(r.hdg * D2R) * r.len];
    const a1 = toND(r.x, r.y), a2 = toND(e[0], e[1]);
    c.strokeStyle = COL.white; c.lineWidth = Math.max(3, ppn * 0.05); c.beginPath(); c.moveTo(a1[0], a1[1]); c.lineTo(a2[0], a2[1]); c.stroke();
    c.strokeStyle = COL.cyan; c.lineWidth = 1.4; c.beginPath(); c.arc((a1[0] + a2[0]) / 2, (a1[1] + a2[1]) / 2 - 12, 4.5, 0, Math.PI * 2); c.stroke();
    txt(c, 'RW09', (a1[0] + a2[0]) / 2 + 8, (a1[1] + a2[1]) / 2 - 12, F(fs * 0.8, 600), COL.cyan, 'left');
    // VOR (hexágono verde-água) com o identificador
    const vp = toND(VOR.x, VOR.y);
    c.strokeStyle = COL.cyan; c.lineWidth = 1.3; c.beginPath();
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; c.lineTo(vp[0] + Math.cos(a) * 5, vp[1] + Math.sin(a) * 5); } c.closePath(); c.stroke();
    txt(c, VOR.id, vp[0] + 8, vp[1] + 10, F(fs * 0.8, 600), COL.cyan, 'left');
    // arco da bússola: marcas a cada 5°, números a cada 30° (em dezenas)
    c.strokeStyle = COL.white; c.lineWidth = 1.5;
    c.beginPath(); c.arc(0, 0, R, (-90 - 62) * D2R, (-90 + 62) * D2R); c.stroke();
    for (let d = 0; d < 360; d += 5) {
      const rel = ((d - trk + 540) % 360) - 180;
      if (Math.abs(rel) > 62) continue;
      const an = (rel - 90) * D2R, l = d % 10 ? 6 : 12;
      c.beginPath(); c.moveTo(Math.cos(an) * R, Math.sin(an) * R); c.lineTo(Math.cos(an) * (R - l), Math.sin(an) * (R - l)); c.stroke();
      if (d % 30 === 0) { c.save(); c.translate(Math.cos(an) * (R - 24), Math.sin(an) * (R - 24)); c.rotate(rel * D2R); txt(c, String(d / 10), 0, 0, F(h * 0.045, 500), COL.white); c.restore(); }
    }
    // linha da trajetória até o arco, com a marca de meio alcance, e o ponteiro do rumo (proa) no arco
    c.beginPath(); c.moveTo(0, -14); c.lineTo(0, -R); c.stroke();
    c.beginPath(); c.moveTo(-6, -R / 2); c.lineTo(6, -R / 2); c.stroke();
    txt(c, String(range / 2), -9, -R / 2, F(fs * 0.85, 600), COL.white, 'right');
    c.fillStyle = COL.white; c.beginPath(); c.moveTo(0, -R + 1); c.lineTo(-7, -R - 11); c.lineTo(7, -R - 11); c.closePath(); c.fill();
    const hrel = ((s.psi - trk + 540) % 360) - 180;
    if (Math.abs(hrel) < 60) { c.save(); c.rotate(hrel * D2R); c.beginPath(); c.moveTo(0, -R - 1); c.lineTo(-6, -R + 10); c.lineTo(6, -R + 10); c.closePath(); c.strokeStyle = COL.white; c.lineWidth = 1.6; c.stroke(); c.restore(); }
    // vetor de tendência da curva (30, 60 e 90 s)
    const om = s.V > 1 ? (G * Math.tan(s.phi * D2R) / s.V) : 0, vnm = gsk / 3600;
    c.strokeStyle = COL.green; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -14);
    let px = 0, py = -14, ang = 0;
    for (let t = 0; t <= 90; t += 3) { px += Math.sin(ang) * vnm * 3 * ppn; py -= Math.cos(ang) * vnm * 3 * ppn; ang += om * 3; c.lineTo(px, py); }
    if (Math.abs(om) > 0.002) c.stroke();
    // símbolo do avião
    c.strokeStyle = COL.white; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -14); c.lineTo(-8, 10); c.lineTo(8, 10); c.closePath(); c.stroke();
    c.restore();
    // rodapé: TCAS e os dois VOR (L e R) com a distância DME
    const dme = Math.hypot(VOR.x - s.x, VOR.y - s.y).toFixed(1), fy = y + h * 0.78;
    txt(c, 'TCAS', x + 10, fy - h * 0.1, F(fs * 0.85, 600), COL.amber, 'left');
    txt(c, 'OFF', x + 10, fy - h * 0.06, F(fs * 0.85, 600), COL.amber, 'left');
    [['L', x + 10, 'left'], ['R', x + w - 10, 'right']].forEach(([sd, tx, al]) => {
      txt(c, `VOR ${sd}`, tx, fy, F(fs * 0.85, 600), COL.green, al);
      txt(c, VOR.id, tx, fy + h * 0.045, F(fs * 0.85, 600), COL.green, al);
      txt(c, `DME ${dme}`, tx, fy + h * 0.09, F(fs * 0.85, 600), COL.green, al);
    });
  }

  /* ---------- aula do ND ----------
     Desenha o ND numa situação fixa de exemplo (ao sul da rota, voltando para ela numa curva leve, com vento de lado)
     e devolve, para cada informação, o ponto do marcador numerado e o retângulo do recorte (em pixels). */
  const ND_SAMPLE = { x: -30, y: -6, psi: 66, trk: 60, gs: 236 * KT, V: 214 * KT, phi: 12, gamma: 0, h: 3000, wdir: 300, wspd: 28 };
  const ND_INFO = [
    ['GS', 'Velocidade no solo', 'GS (ground speed) é a velocidade em relação ao chão, em nós. É ela que define quanto tempo falta para chegar: com vento de cauda fica maior que a TAS, com vento de frente fica menor.'],
    ['TAS', 'Velocidade verdadeira', 'TAS (true airspeed) é a velocidade real em relação ao ar em volta. Em altitude o ar é rarefeito, então a TAS fica bem maior que a velocidade indicada do PFD.'],
    ['WIND', 'Vento e seta do vento', 'Direção de onde o vento vem (graus magnéticos) e a velocidade em nós, por exemplo 300°/ 28. A seta aponta para onde o vento sopra, já girada para a tela: seta para baixo é vento de frente, para cima é de cauda, de lado empurra o avião para fora da rota.'],
    ['TRK', 'Trajetória (TRK) e MAG', 'O número na caixa é a trajetória sobre o solo, o caminho que o avião realmente faz. Neste modo a tela gira para a trajetória ficar sempre para cima. MAG indica que os graus são magnéticos (da bússola).'],
    ['RANGE', 'Alcance', 'Distância, em milhas náuticas, do avião até o arco da bússola. O piloto troca no painel: 10 NM para a aproximação, 40 NM ou mais em cruzeiro.'],
    ['NEXT', 'Próximo fixo, distância e hora', 'Em magenta, o nome do próximo ponto da rota (fixo). Embaixo, a distância até ele e a hora estimada de passagem em UTC (z = horário de Greenwich), calculada com a GS.'],
    ['ARC', 'Arco da bússola', 'Rosa dos ventos cortada: marcas a cada 5°, números a cada 30° em dezenas (9 = 090°, 12 = 120°). Gira conforme a trajetória muda.'],
    ['PTR', 'Ponteiros de trajetória e de proa', 'O triângulo cheio no topo marca a trajetória. O triângulo vazado mostra para onde o nariz aponta (proa). A diferença entre os dois é a deriva causada pelo vento de lado.'],
    ['HALF', 'Linha da trajetória e meio alcance', 'A linha branca sai do avião até o arco, na direção da trajetória. O tracinho com número marca a metade do alcance (aqui, 20 NM).'],
    ['ROUTE', 'Rota e fixos', 'A linha magenta é a rota ativa programada no computador de voo (FMC). As estrelas são os fixos; o próximo fica em magenta e os outros em branco.'],
    ['RWY', 'Pista e aeroporto', 'A pista aparece em branco no tamanho certo para a escala, com o círculo azul do aeroporto e o nome da pista (RW09 = rumo 090°).'],
    ['VOR', 'VOR', 'Estação de rádio no chão (hexágono azul) com o identificador. O avião sintoniza o VOR para saber em que direção ele está e, com o DME, a que distância.'],
    ['TREND', 'Vetor de tendência', 'A curva verde mostra por onde o avião vai passar nos próximos 30, 60 e 90 segundos se mantiver a inclinação. Só aparece em curva.'],
    ['ACFT', 'Símbolo do avião', 'O triângulo branco é o próprio avião, sempre no mesmo lugar. Tudo no mapa se move em volta dele.'],
    ['TCAS', 'TCAS OFF', 'TCAS é o sistema anticolisão que mostra outros aviões por perto. Em âmbar, OFF avisa que ele está desligado (aqui o simulador não tem outros aviões).'],
    ['VORLR', 'VOR L / VOR R e DME', 'Os dois receptores de VOR (esquerdo e direito), a estação sintonizada em cada um e a distância DME até ela, em milhas náuticas.'],
  ];
  function ndTeach(c, w, h) {
    const keep = s, keepSc = sc;
    s = Object.assign({}, s, ND_SAMPLE); sc = 'cruzeiro';
    c.fillStyle = '#05070a'; c.fillRect(0, 0, w, h);
    drawND(c, 0, 0, w, h);
    const cx = w / 2, cy = h * 0.84, R = Math.min(h * 0.64, w * 0.46), fs = h * 0.036, range = RANGE[sc], ppn = R / range, tr = s.trk * D2R;
    const toND = (ex, ny) => { const dx = ex - s.x, dy = ny - s.y; return [cx + (dx * Math.cos(tr) - dy * Math.sin(tr)) * ppn, cy - (dx * Math.sin(tr) + dy * Math.cos(tr)) * ppn]; };
    const bw = w * 0.17, bh = h * 0.07, fy = h * 0.78, rxb = cx - bw / 2 - fs * 2.6 - w * 0.1;
    const bravo = toND(-25, 0), leg = toND(-33, 0), rw = toND(1.1, 0), vor = toND(VOR.x, VOR.y), arcP = [cx - R * Math.sin(40 * D2R), cy - R * Math.cos(40 * D2R)];
    const om = G * Math.tan(s.phi * D2R) / s.V, vnm = s.gs / KT / 3600;
    let px = 0, py = -14, ang = 0; for (let t = 0; t < 45; t += 3) { px += Math.sin(ang) * vnm * 3 * ppn; py -= Math.cos(ang) * vnm * 3 * ppn; ang += om * 3; }
    const box = (x0, y0, bw2, bh2) => [x0, y0, bw2, bh2];
    const geo = {
      GS: [[fs * 6.4, 16], box(4, 2, fs * 5.6, h * 0.05)],
      TAS: [[fs * 6.4, 16 + h * 0.052], box(4, 4 + h * 0.03, fs * 5.6, h * 0.05)],
      WIND: [[fs * 7, 16 + h * 0.105], box(4, 16 + h * 0.079, fs * 6.4, h * 0.16)],
      TRK: [[cx, 6 + bh + 8], box(cx - bw / 2 - fs * 2.6, 2, bw + fs * 5.2, bh + 8)],
      RANGE: [[rxb + w * 0.0425, 6 + bh + 8], box(rxb - 4, 2, w * 0.085 + 8, bh + 8)],
      NEXT: [[w - fs * 6.6, 16 + h * 0.05], box(w - fs * 6.4, 2, fs * 6.4 - 2, h * 0.13)],
      ARC: [arcP, box(arcP[0] - R * 0.3, arcP[1] - R * 0.2, R * 0.6, R * 0.42)],
      PTR: [[cx - 24, cy - R - 12], box(cx - R * 0.32, cy - R - 20, R * 0.64, 42)],
      HALF: [[cx - 52, cy - R / 2], box(cx - 50, cy - R / 2 - 22, 100, 44)],
      ROUTE: [leg, box(bravo[0] - 44, bravo[1] - 34, 110, 64)],
      RWY: [[rw[0] - 18, rw[1] + 12], box(rw[0] - 40, rw[1] - 40, 104, 64)],
      VOR: [[vor[0] - 14, vor[1] + 10], box(vor[0] - 30, vor[1] - 26, 80, 52)],
      TREND: [[cx - 16, cy + py + 10], box(cx - 20, cy + py - 30, Math.max(60, px + 50), 70)],
      ACFT: [[cx + 22, cy + 2], box(cx - 26, cy - 26, 52, 46)],
      TCAS: [[4 + fs * 2.6, fy - h * 0.08], box(2, fy - h * 0.13, fs * 3.6, h * 0.1)],
      VORLR: [[4 + fs * 4.6, fy + h * 0.045], box(2, fy - h * 0.03, fs * 5.4, h * 0.14)],
    };
    s = keep; sc = keepSc;
    return ND_INFO.map(([id, title, text], i) => ({ n: i + 1, id, title, text, at: geo[id][0], box: geo[id][1] }));
  }

  function alerts() {
    const out = [];
    const kias = ias(), m = mach();
    if (kias > P.vmo + 2 || m > P.mmo) out.push(['red', 'OVERSPEED']);
    if (!s.ground && s.flap >= 24 && s.gear < 0.99 && hft() < 1500) out.push(['red', 'CONFIG GEAR']);
    const vfe = P.vfe[ctl.flaps] || 365;
    if (ctl.flaps > 0 && kias > vfe + 3) out.push(['amber', `>FLAP LIMIT ${vfe}`]);
    if (s.gear > 0.01 && kias > P.vlo + 3 && !s.ground) out.push(['amber', `>GEAR LIMIT ${P.vlo}`]);
    if (fail && fail.fire) out.push(['red', 'FIRE ENG 2']);
    if (s.cab > 10000) out.push(['red', 'CABIN ALTITUDE']);
    if (s.eng) s.eng.forEach((on, i) => { if (!on) out.push(['amber', fail && fail.cut[i] ? `ENG ${i + 1} SHUTDOWN` : `ENG ${i + 1} FAIL`]); });
    if (fail && fail.id === 'trem' && ctl.gearDown && s.gear < 0.99 && fail.gt > 12) out.push(['amber', 'GEAR DISAGREE']);
    if (s.tailstrike) out.push(['amber', 'TAIL STRIKE']);
    if (ctl.sb > 0.05 && !s.ground && (s.flap >= 24 || hft() < 800)) out.push(['amber', 'SPEEDBRAKE EXT']);
    if (s.gear > 0.01 && s.gear < 0.99) out.push(['white', 'GEAR IN TRANSIT']);
    return out;
  }
  /* ---------- aulas do PFD e do EICAS (mesma ideia da aula do ND) ---------- */
  // desenha o painel num estado de exemplo e devolve cada informação com o retângulo a destacar (pixels)
  function sampled(sample, scn, demoState, fn) {
    const keep = s, keepSc = sc, keepDemo = demo;
    s = Object.assign({}, s, sample); sc = scn; demo = demoState;
    try { return fn(); } finally { s = keep; sc = keepSc; demo = keepDemo; }
  }
  const PFD_INFO = [
    ['FMA', 'Modos do piloto automático (FMA)', 'Três colunas no alto: à esquerda o modo das manetes (SPD = mantém a velocidade, THR REF = empuxo de decolagem ou subida, IDLE = marcha lenta), no meio o modo lateral (LNAV = rota do FMC, LOC = localizador do ILS, HDG = proa) e à direita o vertical (VNAV, G/S = rampa do ILS, FLARE = arredondamento). Um modo que acabou de entrar ganha uma caixa branca por 10 s.'],
    ['AFDS', 'Estado do piloto automático', 'CMD = piloto automático ligado; FD = só o diretor de voo (o piloto voa seguindo as barras); LAND 3 = os três pilotos automáticos prontos para o pouso automático.'],
    ['ADI', 'Horizonte artificial', 'Azul é o céu e marrom é o chão. A linha branca é o horizonte e a escada de números mostra quantos graus o nariz está acima ou abaixo dele. Em curva, o horizonte inteiro inclina.'],
    ['BANK', 'Escala de inclinação', 'Marcas de 10°, 20°, 30°, 45° e 60° no arco de cima. O triângulo que se move mostra quanto as asas estão inclinadas; acima de 35° ele fica âmbar (BANK ANGLE). O trapézio embaixo dele é o indicador de derrapagem.'],
    ['ACFT', 'Símbolo do avião', 'As duas "asas" pretas e o quadradinho no centro são o próprio avião, sempre fixos. O horizonte se move atrás deles.'],
    ['FD', 'Diretor de voo', 'A cruz magenta mostra para onde o piloto automático quer levar o nariz: se a barra horizontal está acima do quadradinho, puxe; se a vertical está à direita, incline para a direita. Manter o quadradinho no centro da cruz é seguir a orientação.'],
    ['SPD', 'Fita e caixa de velocidade', 'Velocidade indicada em nós. A fita corre atrás da caixa, que mostra o valor atual.'],
    ['SEL', 'Velocidade selecionada', 'O número magenta em cima é a velocidade escolhida no painel do piloto automático (MCP). O marcador magenta na fita mostra onde ela fica.'],
    ['BAR', 'Faixas de limite', 'As listras vermelhas e pretas marcam a velocidade máxima (em cima) e a de estol (embaixo). A faixa âmbar avisa que a velocidade mínima de manobra está perto.'],
    ['TREND', 'Vetor de tendência', 'A linha verde sai da caixa e aponta para a velocidade que o avião terá em 10 segundos se nada mudar: para cima está acelerando, para baixo está perdendo velocidade.'],
    ['REF', 'Velocidades de referência e de flap', 'Marcas verdes na fita: REF é a velocidade de aproximação (VREF); os números (25, 20, 10…) são as velocidades mínimas para recolher os flaps até aquela posição. Na decolagem aparecem V1, VR e V2.'],
    ['FLREF', 'Flaps e VREF', 'Embaixo da fita: "30/152" quer dizer flaps 30 com VREF de 152 kt, a configuração escolhida para pousar. Em altitude este lugar mostra o número Mach.'],
    ['ALT', 'Fita e caixa de altitude', 'Altitude em pés. Na caixa, os milhares ficam grandes e as centenas menores.'],
    ['SALT', 'Altitude selecionada', 'O número magenta em cima da fita é a altitude escolhida no MCP (na aproximação, a altitude de arremetida). O marcador magenta mostra onde ela fica na fita.'],
    ['BARO', 'Ajuste do altímetro', 'A pressão usada pelo altímetro: 1013 HPA (ou STD acima de 18.000 ft, padrão internacional). Com a pressão do aeroporto, o altímetro mostra a altitude certa sobre o nível do mar.'],
    ['VS', 'Velocidade vertical', 'O ponteiro mostra quantos milhares de pés por minuto o avião sobe ou desce; o número aparece acima de 400 ft/min. Na rampa de 3° a descida fica perto de 750 a 800 ft/min.'],
    ['ILS', 'ILS sintonizado', 'O identificador e o curso da pista (IESC/090°), a distância DME até a antena e "ILS" em verde quando o sinal está bom.'],
    ['DIAM', 'Losangos do ILS', 'O losango da direita é a rampa (glide slope): acima do centro, o avião está baixo. O de baixo é o localizador: à direita do centro, a pista está à direita. Os dois no centro = avião na rampa e alinhado.'],
    ['MINS', 'Mínimos', 'BARO 200 é a altitude de decisão: se o piloto não vir a pista ao chegar nela, arremete. Abaixo dos mínimos o número fica âmbar.'],
    ['RA', 'Radioaltímetro', 'A altura real sobre o chão, medida por rádio. Aparece abaixo de 2.500 ft, grande no centro, e é a referência para o arredondamento.'],
    ['HDG', 'Proa e proa selecionada', 'A rosa da bússola mostra a proa (para onde o nariz aponta) na caixa. Em magenta, a proa escolhida no MCP (090H) e o marcador na rosa. MAG = graus magnéticos.'],
    ['GS', 'Velocidade no solo', 'GS é a velocidade em relação ao chão, a mesma do ND. Com vento de frente fica menor que a indicada.'],
  ];
  function pfdTeach(c, w, h) {
    return sampled({ h: 1200 * FT, V: 160 * KT, gamma: -3 * D2R, theta: 3.2, alpha: 6.2, phi: 9, ground: false, flap: 30, gear: 1, x: -3.5, y: 0.04, psi: 92, gs: 150 * KT, fdPitch: 4.6, spool: 0.42 }, 'aproximacao', 'app', () => {
      // tendência e modos do exemplo sem mexer no voo de verdade (e sem as caixas de "modo novo")
      const keepTr = trend, keepFp = fmaPrev.slice(), keepFt = fmaT.slice(), f0 = fma();
      trend = 1.6; fmaPrev = f0.m.concat(f0.st); fmaT = [0, 0, 0, 0];
      drawPFD(c, 0, 0, w, h);
      trend = keepTr; fmaPrev = keepFp; fmaT = keepFt;
      const cx = w * 0.45, cy = h * 0.45, aw = w * 0.42, ah = h * 0.5, th = ah * 1.12, ty = cy - th / 2, tx = w * 0.035, tw = w * 0.135;
      const ax = cx + aw / 2 + w * 0.03, awd = w * 0.16, fcw = aw * 1.25 / 3, R = ah * 0.46;
      const ppk = th / 120, kias = ias(), vy = (v) => cy - (v - kias) * ppk;
      const g = {
        FMA: [cx - fcw * 1.5, h * 0.02, fcw * 3, h * 0.07], AFDS: [cx - w * 0.09, cy - ah / 2 - h * 0.06, w * 0.18, h * 0.05],
        ADI: [cx - aw / 2, cy - ah / 2, aw, ah], BANK: [cx - R - 14, cy - R - 16, R * 2 + 28, R * 0.55],
        ACFT: [cx - aw * 0.4, cy - 10, aw * 0.8, 28], FD: [cx - aw * 0.32, cy - ah * 0.34, aw * 0.64, ah * 0.66],
        SPD: [tx - 4, cy - th * 0.07, tw + 4, th * 0.14], SEL: [tx, ty - h * 0.06, tw, h * 0.055], BAR: [tx + tw - 10, vy(stallIas(30, 9) * 1.15), 12, ty + th - vy(stallIas(30, 9) * 1.15)],
        TREND: [tx + tw - 30, vy(kias + 16) - 4, 16, cy - vy(kias + 16) + 6], REF: [tx + tw * 0.35, vy(P.vref + 12), tw * 0.68, vy(P.vref - 3) - vy(P.vref + 12)],
        FLREF: [tx - 2, ty + th + h * 0.015, tw + 6, h * 0.05], ALT: [ax, cy - th * 0.07, awd + 8, th * 0.14], SALT: [ax, ty - h * 0.06, awd + 6, h * 0.055],
        BARO: [ax - 4, ty + th + h * 0.015, awd + 10, h * 0.05], VS: [w * 0.89, cy - th * 0.45, w * 0.1, th * 0.9],
        ILS: [cx - aw / 2 - w * 0.025, h * 0.105, w * 0.2, h * 0.1], DIAM: [cx - aw * 0.25, cy - ah * 0.24, aw * 0.75, ah * 0.74],
        MINS: [cx + aw / 2 - w * 0.09, h * 0.105, w * 0.1, h * 0.08], RA: [cx - aw * 0.16, cy + ah / 2 - ah * 0.27, aw * 0.32, ah * 0.14],
        HDG: [cx - w * 0.2, h * 0.78, w * 0.4, h * 0.15], GS: [4, h * 0.85, w * 0.2, h * 0.045],
      };
      return PFD_INFO.map(([id, title, text]) => ({ id, title, text, box: g[id] }));
    });
  }
  const EICAS_INFO = [
    ['TAT', 'TAT', 'Temperatura total do ar: a do ar lá fora somada ao aquecimento por compressão com a velocidade. Serve, entre outras coisas, para o computador calcular o empuxo.'],
    ['MODE', 'Modo e referência de empuxo', 'Em verde: TO (decolagem), CLB (subida) ou CRZ (cruzeiro). O número verde acima de cada motor é o N1 de referência desse modo, o valor que as manetes devem buscar.'],
    ['N1', 'N1', 'Rotação do ventilador (fan) de cada motor, em % da rotação máxima. É o principal indicador de empuxo do 747-8 (motores GEnx). A fita enche de baixo para cima; o traço verde é a referência e o vermelho, o limite.'],
    ['EGT', 'EGT', 'Temperatura dos gases do escapamento, em °C. Sobe com a potência; passar do traço vermelho estraga a turbina, por isso o piloto acompanha principalmente na decolagem.'],
    ['MSG', 'Mensagens', 'Alertas e lembretes da tripulação. Vermelho = aviso (agir já, como CONFIG GEAR); âmbar = cuidado (atenção, como >FLAP LIMIT); branco = memo, só lembra uma situação normal (AUTOBRAKES RTO, SEATBELTS ON).'],
    ['GEAR', 'Trem de pouso', 'DOWN em verde = as três pernas embaixo e travadas. UP = recolhido. Enquanto se mexe, a caixa fica hachurada em âmbar.'],
    ['FLAPS', 'Flaps', 'Posição dos flaps (0 a 30). Só aparece quando eles não estão recolhidos. Fica magenta enquanto estão se movendo até a posição escolhida.'],
    ['STAB', 'Compensador (STAB)', 'Posição do estabilizador horizontal, de ND (nariz para baixo) a NU (nariz para cima), em unidades. No chão aparece a faixa verde: o compensador precisa estar dentro dela para decolar, senão a buzina de configuração toca.'],
    ['CAB', 'Altitude da cabine', 'CAB ALT é a "altitude" que os passageiros sentem lá dentro (a cabine é pressurizada; em cruzeiro fica perto de 7.000 ft). LDG ALT é a altitude do aeroporto de destino, para a pressurização se ajustar até o pouso.'],
    ['PRESS', 'Pressurização', 'DUCT PRESS: pressão do ar tirado dos motores para os sistemas. RATE: quanto a cabine sobe ou desce por minuto. ΔP: diferença de pressão entre dentro e fora, em psi.'],
    ['WT', 'Peso e combustível', 'GROSS WT é o peso total do avião e TOTAL FUEL o combustível a bordo, ambos em toneladas (KGS × 1000). O peso cai conforme o combustível é queimado.'],
    ['SAT', 'SAT e temperatura do combustível', 'SAT é a temperatura do ar parado lá fora. FUEL TEMP é a do combustível nos tanques: em voos longos e frios, ele não pode chegar perto do ponto de congelamento.'],
  ];
  function eicasTeach(c, w, h) {
    return sampled({ h: 0, V: 112 * KT, gamma: 0, theta: 0, phi: 0, ground: true, flap: 20, gear: 1, spool: 0.97, cab: 50, cabRate: 0, fuel: 150, fuel0: 150, ttrim: 0 }, 'decolagem', null, () => {
      const kf = ctl.flaps, kt = ctl.thr; ctl.flaps = 20; ctl.thr = 1;
      drawEICAS(c, 0, 0, w, h);
      ctl.flaps = kf; ctl.thr = kt;
      const fs = Math.min(h * 0.034, w * 0.042), ew = w * 0.66, rx = w * 0.69, gw = w * 0.15, gh = fs * 1.45, gy = h * 0.5;
      const g = {
        TAT: [4, 2, fs * 5.2, fs * 2.2], MODE: [6, 2, ew, fs * 3.4], N1: [4, fs * 3.1, ew + 4, h * 0.5 - fs * 3.1 + 4],
        EGT: [4, h * 0.53, ew + 4, h * 0.235], MSG: [rx - 4, h * 0.1, w - rx, h * 0.14], GEAR: [rx - 4, gy - 4, gw + 8, gh + fs * 1.6],
        FLAPS: [rx + gw / 2 - fs * 2.4, gy + gh + fs * 1.6, fs * 3.8, h * 0.78 - (gy + gh + fs * 1.6) + 4], STAB: [w - fs * 4.6 - 3, h * 0.46, fs * 4.6, h * 0.3],
        CAB: [4, h * 0.805, w * 0.33, h * 0.075], PRESS: [w * 0.35, h * 0.805, w * 0.3, h * 0.075], WT: [w * 0.62, h * 0.805, w * 0.375, h * 0.075], SAT: [w * 0.38, h * 0.875, w * 0.615, h * 0.05],
      };
      return EICAS_INFO.map(([id, title, text]) => ({ id, title, text, box: g[id] }));
    });
  }

  // EICAS no formato de fitas verticais (como na foto do painel): para cada motor, caixa com o valor,
  // fita que enche de baixo para cima, traço vermelho do limite e, no N1, o traço verde da referência
  function tape(c, cx, top, bh, frac, refFrac, redFrac, val, bw, fsz) {
    const boxH = fsz * 1.35;
    c.fillStyle = '#000'; c.strokeStyle = COL.white; c.lineWidth = 1.2; c.fillRect(cx - bw / 2, top, bw, boxH); c.strokeRect(cx - bw / 2, top, bw, boxH);
    txt(c, val, cx, top + boxH / 2 + 1, F(fsz, 600), COL.white);
    const t0 = top + boxH + 4, tw = Math.max(6, bw * 0.3), ty = (f) => t0 + bh * (1 - clamp(f, 0, 1));
    c.strokeRect(cx - tw / 2, t0, tw, bh);
    const fy = ty(frac); c.fillStyle = '#d7dee3'; c.fillRect(cx - tw / 2 + 1.5, fy, tw - 3, t0 + bh - fy - 1);
    c.strokeStyle = COL.white; c.lineWidth = 2; c.beginPath(); c.moveTo(cx - tw / 2 - 3, fy); c.lineTo(cx + tw / 2 + 3, fy); c.stroke();
    c.strokeStyle = COL.red; c.beginPath(); c.moveTo(cx - tw / 2 - 3, ty(redFrac)); c.lineTo(cx + tw / 2 + 3, ty(redFrac)); c.stroke();
    if (refFrac != null) { c.strokeStyle = COL.green; c.beginPath(); c.moveTo(cx - tw / 2 - 4, ty(refFrac)); c.lineTo(cx + tw / 2 + 4, ty(refFrac)); c.stroke(); }
  }
  // modo de empuxo de referência mostrado no alto (TO na decolagem, CLB na subida, CRZ em cruzeiro)
  function thrustMode() {
    if (s.ground || (hft() < 1500 && fpm() > 0 && ctl.thr > 0.9)) return ['TO', n1Of(1) - 1];
    if (fpm() > 500) return ['CLB', n1Of(0.92)];
    return ['CRZ', n1Of(0.8)];
  }
  // mensagens de memória (brancas) do EICAS: lembretes do estado do avião, abaixo dos alertas
  function memos() {
    const out = [];
    if (s.ground && sc === 'decolagem' && ctl.thr > 0.5) out.push('AUTOBRAKES RTO');
    if (sc === 'aproximacao') out.push('AUTOBRAKES 3');
    if (s.ground && s.V < 1 && ctl.thr < 0.08) out.push('PARK BRAKE SET');
    if (ctl.sb > 0.05 && !s.ground) out.push('SPEEDBRAKE ARMED');
    if (hft() < 10300) out.push('SEATBELTS ON');
    return out;
  }
  // EICAS do 747-8 (como no avião): N1 em fitas altas com a referência verde, EGT em fitas menores,
  // memos e alertas à direita, trem, compensador (STAB) e, embaixo, cabine, peso e combustível
  function drawEICAS(c, x, y, w, h) {
    frame(c, x, y, w, h, 'EICAS · MOTORES E ALERTAS');
    const fs = Math.min(h * 0.034, w * 0.042), sp = clamp(s.spool, 0, 1), n1 = n1Of(sp), egt = 380 + 560 * Math.pow(sp, 1.4);
    const { T } = atm(), sat = T - 273.15, tat = T * (1 + 0.2 * mach() * mach()) - 273.15, [mode, ref] = thrustMode();
    const sg = (v) => `${v >= 0 ? '+' : ''}${Math.round(v)}c`;
    const ex = x + 6, ew = w * 0.66, cw = ew / 4, bw = Math.min(cw * 0.8, fs * 3.8);
    // alto: TAT e o modo de empuxo
    txt(c, 'TAT', x + 10, y + fs * 1.3, F(fs * 0.85, 600), COL.cyan, 'left');
    txt(c, sg(tat), x + 10 + fs * 2.1, y + fs * 1.3, F(fs * 0.9, 600), COL.white, 'left');
    txt(c, mode, ex + ew * 0.62, y + fs * 1.3, F(fs * 1.05, 600), COL.green);
    // N1: referência verde em cima, caixa e fita alta
    const n1Top = y + fs * 3.3, n1Bh = y + h * 0.5 - (n1Top + fs * 1.35 + 4);
    for (let i = 0; i < 4; i++) {
      const cx = ex + cw * (i + 0.5);
      txt(c, ref.toFixed(1), cx, n1Top - fs * 0.75, F(fs * 0.95, 600), COL.green);
      const n1i = engPow(i) >= 1 ? n1 : engPow(i) > 0 ? n1Of(0) : clamp(ias() / 12, 0, 26);
      tape(c, cx, n1Top, n1Bh, n1i / 110, ref / 110, 102 / 110, n1i.toFixed(1), bw, fs);
    }
    txt(c, 'N1', ex + ew / 2, n1Top + fs * 3.2, F(fs * 0.9, 600), COL.cyan);
    // EGT: caixa e fita menor
    const egTop = y + h * 0.54, egBh = y + h * 0.76 - (egTop + fs * 1.35 + 4);
    for (let i = 0; i < 4; i++) {
      const egti = engPow(i) >= 1 ? egt : engPow(i) > 0 ? 400 : 60 + clamp(ias() / 12, 0, 26) * 4;
      tape(c, ex + cw * (i + 0.5), egTop, egBh, egti / 1100, null, 1060 / 1100, String(Math.round(egti)), bw, fs);
    }
    txt(c, 'EGT', ex + ew / 2, egTop + fs * 1.35 + 4 + egBh * 0.4, F(fs * 0.9, 600), COL.cyan);
    // coluna da direita: alertas (vermelho/âmbar) e memos (branco)
    const rx = x + w * 0.69, mfs = fs * 0.8;
    const msgs = alerts().map(([k, t]) => [COL[k], t]).concat(memos().map((t) => [COL.white, t])).slice(0, 7);
    msgs.forEach(([col, t], i) => txt(c, t, rx, y + h * 0.13 + i * mfs * 1.3, F(mfs, 600), col, 'left'));
    // trem
    const gw = w * 0.15, gh = fs * 1.45, gx = rx + gw / 2, gy = y + h * 0.5;
    const gtxt = s.gear >= 0.99 ? 'DOWN' : s.gear <= 0.01 ? 'UP' : '', gcol = s.gear >= 0.99 ? COL.green : COL.white;
    c.strokeStyle = s.gear > 0.01 && s.gear < 0.99 ? COL.amber : gcol; c.lineWidth = 1.6; c.strokeRect(gx - gw / 2, gy, gw, gh);
    if (gtxt) txt(c, gtxt, gx, gy + gh / 2 + 1, F(fs, 600), gcol);
    else { c.save(); c.beginPath(); c.rect(gx - gw / 2, gy, gw, gh); c.clip(); c.strokeStyle = COL.amber; for (let k = -40; k < gw + 40; k += 6) { c.beginPath(); c.moveTo(gx - gw / 2 + k, gy + gh); c.lineTo(gx - gw / 2 + k + 12, gy); c.stroke(); } c.restore(); }
    txt(c, 'GEAR', gx, gy + gh + fs * 0.8, F(fs * 0.85, 600), COL.cyan);
    // flaps (só quando baixados), ao lado do trem
    if (s.flap > 0.2 || ctl.flaps > 0) {
      const fx = gx, fy0 = gy + gh + fs * 2.6, fy1 = y + h * 0.78, fyy = (f) => fy0 + (fy1 - fy0) * f / 30, moving = Math.abs(s.flap - ctl.flaps) > 0.2;
      txt(c, 'FLAPS', fx, fy0 - fs * 0.6, F(fs * 0.75, 600), COL.cyan);
      c.strokeStyle = COL.white; c.lineWidth = 1.2; c.strokeRect(fx - 4, fy0, 8, fy1 - fy0);
      c.fillStyle = moving ? COL.magenta : COL.green; c.fillRect(fx - 4, fy0, 8, fyy(s.flap) - fy0);
      txt(c, String(Math.round(s.flap)), fx - 7, fyy(s.flap), F(fs * 0.85, 600), moving ? COL.magenta : COL.green, 'right');
    }
    // compensador do profundor (STAB): escala de 0 (ND, nariz baixo) a 15 (NU, nariz alto); no chão aparece a faixa verde de decolagem
    const stab = clamp(6 + s.ttrim * 0.35, 0, 15), sx = x + w - 12, s0 = y + h * 0.5, s1 = y + h * 0.69, syy = (u) => s0 + (s1 - s0) * u / 15;
    txt(c, 'ND', sx, s0 - fs * 0.7, F(fs * 0.7, 600), COL.cyan);
    txt(c, 'NU', sx, s1 + fs * 0.7, F(fs * 0.7, 600), COL.cyan);
    c.strokeStyle = COL.white; c.lineWidth = 1.2; c.beginPath(); c.moveTo(sx, s0); c.lineTo(sx, s1); c.moveTo(sx - 3, s0); c.lineTo(sx, s0); c.moveTo(sx - 3, s1); c.lineTo(sx, s1); c.stroke();
    if (s.ground) { c.fillStyle = COL.green; c.fillRect(sx - 4, syy(3.5), 4, syy(9) - syy(3.5)); }
    c.fillStyle = COL.green; c.beginPath(); c.moveTo(sx + 1, syy(stab)); c.lineTo(sx + 7, syy(stab) - 4); c.lineTo(sx + 7, syy(stab) + 4); c.closePath(); c.fill();
    txt(c, 'STAB', sx - fs * 0.9, (s0 + s1) / 2, F(fs * 0.6, 600), COL.cyan, 'right');
    c.strokeStyle = COL.green; c.lineWidth = 1.2; c.strokeRect(sx - fs * 1.6, s1 + fs * 1.25, fs * 2.2, fs * 1.15);
    txt(c, stab.toFixed(1), sx - fs * 0.5, s1 + fs * 1.85, F(fs * 0.8, 600), COL.green);
    // rodapé: pressurização, peso bruto, combustível e temperaturas
    const pr = (hf) => 14.696 * Math.pow(1 - 6.8756e-6 * hf, 5.2559), dp = Math.max(0, pr(s.cab || 0) - pr(Math.max(0, hft())));
    const bfs = fs * 0.72, l1 = y + h * 0.83, l2 = l1 + bfs * 1.45, duct = Math.round(17 + 20 * sp);
    txt(c, 'CAB ALT', x + 10, l1, F(bfs, 600), COL.cyan, 'left');
    txt(c, `${Math.round((s.cab || 0) / 10) * 10}`, x + 10 + bfs * 5.3, l1, F(bfs, 600), COL.white, 'left');
    txt(c, 'LDG ALT', x + 10, l2, F(bfs, 600), COL.cyan, 'left');
    txt(c, '50 AUTO', x + 10 + bfs * 5.3, l2, F(bfs, 600), COL.white, 'left');
    txt(c, `DUCT ${duct} ${duct + 1}`, x + w * 0.36, l1, F(bfs, 600), COL.cyan, 'left');
    txt(c, `RATE ${Math.round((s.cabRate || 0) / 50) * 50}  ΔP ${dp.toFixed(1)}`, x + w * 0.36, l2, F(bfs, 600), COL.cyan, 'left');
    const gross = P.m / 1000 - ((s.fuel0 || s.fuel) - s.fuel), ftemp = Math.max(-37, 15 + (sat - 15) * 0.35);
    txt(c, `GROSS WT ${gross.toFixed(1)}`, x + w - 10, l1, F(bfs, 600), COL.white, 'right');
    txt(c, `TOTAL FUEL ${s.fuel.toFixed(1)}`, x + w - 10, l2, F(bfs, 600), COL.white, 'right');
    txt(c, `SAT ${sg(sat)}  FUEL TEMP ${sg(ftemp)}  KGS X 1000`, x + w - 10, l2 + bfs * 1.45, F(bfs * 0.85, 600), COL.cyan, 'right');
  }

  let L = null;
  function size(w) {
    if (w >= 640) { const pw = (w - 16) / 3; L = { kind: 'row', pw, ph: pw * 1.08 }; return Math.round(L.ph); }
    const half = (w - 8) / 2;
    L = { kind: 'stack', pfdH: w * 0.86, half, halfH: half * 1.15 };
    return Math.round(L.pfdH + 8 + L.halfH);
  }
  function draw(c, w) {
    if (!L) size(w);
    if (L.kind === 'row') { drawPFD(c, 0, 0, L.pw, L.ph); drawND(c, L.pw + 8, 0, L.pw, L.ph); drawEICAS(c, (L.pw + 8) * 2, 0, L.pw, L.ph); }
    else { drawPFD(c, 0, 0, w, L.pfdH); drawND(c, 0, L.pfdH + 8, L.half, L.halfH); drawEICAS(c, L.half + 8, L.pfdH + 8, L.half, L.halfH); }
  }

  /* ---------- vistas pequenas (lado e trás) ---------- */
  // Vista lateral no estilo prancha (traço branco, detalhes em rosa), feita do desenho de referência do
  // 747-8 e espelhada: nariz para a direita. 76,3 m de comprimento = 261 px; rodas no chão em y = 118.
  // O profundor, os flaps, os spoilers e o trem são camadas separadas que se mexem com os comandos.
  const IMG = 'x="21.32" y="60.58" width="262.55" height="54.02"';
  // o trem só aparece abaixo da barriga e, no principal, abaixo da nacele que fica na frente dele
  const BELLY = 'M137 108.6 L141.6 108.6 L141.6 112.6 L161.6 112.6 L161.6 108.6 L168 108.6 L168 126 L137 126 Z M247 107.6 L263 107.4 L263 126 L247 126 Z';
  // roda vista de lado: pneu com flanco e brilho, aro, cubo e parafusos
  const wheel = (cx, cy, r) => {
    const bolts = [0, 1, 2, 3, 4].map((i) => { const a = (i * 72 - 90) * Math.PI / 180; return `M${(cx + Math.cos(a) * r * 0.4).toFixed(2)} ${(cy + Math.sin(a) * r * 0.4).toFixed(2)}h.01`; }).join('');
    return `<circle class="j7g-tire" cx="${cx}" cy="${cy}" r="${r}"/><circle class="j7g-wall" cx="${cx}" cy="${cy}" r="${(r * 0.81).toFixed(2)}"/>` +
      `<path class="j7g-shine" d="M${(cx - r * 0.72).toFixed(2)} ${(cy - r * 0.42).toFixed(2)} A${(r * 0.84).toFixed(2)} ${(r * 0.84).toFixed(2)} 0 0 1 ${(cx - r * 0.25).toFixed(2)} ${(cy - r * 0.8).toFixed(2)}"/>` +
      `<circle class="j7g-rim" cx="${cx}" cy="${cy}" r="${(r * 0.56).toFixed(2)}"/><circle class="j7g-hub" cx="${cx}" cy="${cy}" r="${(r * 0.24).toFixed(2)}"/><path class="j7g-bolt" d="${bolts}"/>`;
  };
  // perna do trem principal com truque de 4 rodas (de lado aparecem 2): cilindro, haste cromada, compasso e viga
  const R = 2.35, AY = 118 - R;
  const bogie = (sx, far) => `<g class="j7g${far ? ' j7g-far' : ''}">
            <rect class="j7g-strut" x="${sx - 0.75}" y="104" width="1.5" height="9.7"/>
            <rect class="j7g-piston" x="${sx - 0.42}" y="113.6" width=".84" height="2.2"/>
            <path class="j7g-link" d="M${sx + 0.45} 113.5 L${sx + 0.95} 114.25 L${sx + 0.42} 115"/>
            <rect class="j7g-strut" x="${sx - 2.95}" y="${AY - 0.5}" width="5.9" height="1" rx=".5"/>
            ${wheel(+(sx - 2.6).toFixed(1), AY, R)}${wheel(+(sx + 2.6).toFixed(1), AY, R)}
          </g>`;
  const RN = 2.15, NY = 118 - RN;
  const noseGear = `<g class="j7g">
            <g class="j7g-far">${wheel(255.6, NY - 0.2, RN)}</g>
            <path class="j7g-link" d="M255.3 110.4 L259.8 107.6"/><circle class="j7g-hub" cx="255.3" cy="110.4" r=".32"/>
            <rect class="j7g-strut" x="254.35" y="104" width="1.3" height="7.7"/>
            <rect class="j7g-strut" x="254.05" y="109.2" width="1.9" height=".8" rx=".25"/>
            <rect class="j7g-piston" x="254.58" y="111.6" width=".84" height="4.3"/>
            <path class="j7g-link" d="M255.6 111.4 L256.6 112.65 L255.45 113.8"/>
            <path class="j7g-door" d="M249.6 107.7 L253.8 107.45 L253.7 110.3 L249.7 110.7 Z"/>
            ${wheel(255, NY, RN)}
          </g>`;
  const minisHTML = `
    <figure class="card mini">
      <figcaption class="mono small">VISTA LATERAL · arfagem, profundor, flaps e trem</figcaption>
      <svg viewBox="0 0 300 130" class="mini__svg" aria-label="747-8 visto de lado">
        <defs>
          <clipPath id="j7GearOut"><path d="${BELLY}"/></clipPath>
        </defs>
        <rect class="m-ground" x="0" y="118" width="300" height="12"/>
        <g id="j7Side">
          <g clip-path="url(#j7GearOut)"><g id="j7GearS">
            ${bogie(148, true)}
            ${bogie(158, false)}
            ${noseGear}
          </g></g>
          <image class="j7-photo" href="assets/747-lado.webp" ${IMG}/>
          <g id="j7Elev">
            <image href="assets/747-lado-prof.webp" ${IMG}/>
            <path class="j7-tint" d="M31.8 87.9 L21.8 87.9 L22.2 89.1 L28.9 91.4 L31.8 92.2 Z"/>
          </g>
          <path id="j7SpS1" class="j7-spoiler" d=""/><path id="j7SpS2" class="j7-spoiler" d=""/>
          <g id="j7Flap"><path class="m-surf" d="M141.5 103.5 Q142.5 104.3 141.5 105.1 L128 104 L128 103.3 Z"/></g>
        </g>
      </svg>
    </figure>
    <figure class="card mini">
      <figcaption class="mono small">VISTA DE TRÁS · rolagem, ailerons e spoilers</figcaption>
      <svg viewBox="0 0 300 130" class="mini__svg" aria-label="747-8 visto de trás">
        <rect class="m-ground" x="0" y="118" width="300" height="12"/>
        <g id="j7Rear">
          <image class="j7-photo" href="assets/747-tras.webp" x="32.86" y="40.89" width="234.41" height="77.64"/>
          <g id="j7GearR"><image href="assets/747-tras-trem.webp" x="32.86" y="40.89" width="234.41" height="77.64"/></g>
          <path id="j7SpL" class="j7-spoiler" d=""/><path id="j7SpR" class="j7-spoiler" d=""/>
          <path id="j7AilLo" class="m-surf" d=""/><path id="j7AilRo" class="m-surf" d=""/>
          <path id="j7AilLi" class="m-surf" d=""/><path id="j7AilRi" class="m-surf" d=""/>
          <path id="j7ElevL" class="m-surf" d=""/><path id="j7ElevR" class="m-surf" d=""/>
          <g id="j7Rud"><path class="m-surf" d="M149.5 45 L150.5 45 L151 83 L149 83 Z"/></g>
        </g>
      </svg>
    </figure>`;
  // asa vista de trás (desenho de referência): bordo de fuga do centro (150; 104,2) à ponta (150 ± 116,6; 89,5);
  // t vai de 0 (centro) a 1 (ponta)
  const wingPt = (t, sd) => [+(150 + sd * 116.6 * t).toFixed(1), +(104.2 - 14.7 * t).toFixed(1)];
  // aileron: placa presa na articulação (0,6 acima do bordo de fuga) até o bordo de fuga deslocado d para cima
  // (o profundor usa a mesma placa articulada)
  const hinged = (a, b, d) => `M${a[0]} ${(a[1] - 0.6).toFixed(2)} L${b[0]} ${(b[1] - 0.6).toFixed(2)} L${b[0]} ${(b[1] - d + 0.4).toFixed(2)} L${a[0]} ${(a[1] - d + 0.4).toFixed(2)} Z`;
  const surf = (t0, t1, sd, d) => hinged(wingPt(t0, sd), wingPt(t1, sd), d);
  // spoiler: placa no extradorso que levanta d
  const spoil = (t0, t1, sd, h) => { const a = wingPt(t0, sd), b = wingPt(t1, sd), y = 1.6, d = h * 0.6; return d < 0.05 ? '' : `M${a[0]} ${(a[1] - y).toFixed(2)} L${b[0]} ${(b[1] - y).toFixed(2)} L${b[0]} ${(b[1] - y - d).toFixed(2)} L${a[0]} ${(a[1] - y - d).toFixed(2)} Z`; };
  // spoiler visto de lado: placa articulada na frente (hx, hy); k de 0 (recolhido) a 1 (45°)
  const spoilerSide = (hx, hy, L, k) => {
    if (k < 0.02) return '';
    const a = (4.3 + k * 45) * Math.PI / 180, tx = hx - L * Math.cos(a), ty = hy - L * Math.sin(a);
    const nx = Math.sin(a) * 1.1, ny = -Math.cos(a) * 1.1;   // espessura da placa, para cima
    return `M${hx} ${hy} L${tx.toFixed(2)} ${ty.toFixed(2)} L${(tx + nx).toFixed(2)} ${(ty + ny).toFixed(2)} L${(hx + nx).toFixed(2)} ${(hy + ny).toFixed(2)} Z`;
  };
  function minis(root) {
    const $ = (id) => root.querySelector('#' + id);
    if (!$('j7Side')) return;
    // gira em torno das rodas principais (no chão, a cauda encosta na pista perto de 11°) e sobe um pouco ao sair do chão
    const lift = 9 * (1 - Math.exp(-Math.max(0, s.h) / 12));
    $('j7Side').setAttribute('transform', `translate(0 ${(-lift).toFixed(2)}) rotate(${(-s.theta).toFixed(2)} 153.2 118)`);
    $('j7Elev').setAttribute('transform', `rotate(${(ctl.elev * 22).toFixed(1)} 31.8 90.1)`);
    // flap: desce e corre para trás (Fowler), aumentando a área e a curvatura da asa
    const fl = s.flap / 30;
    $('j7Flap').setAttribute('transform', `translate(${(-fl * 2.2).toFixed(2)} ${(fl * 0.6).toFixed(2)}) rotate(${(-fl * 34).toFixed(1)} 141.5 104.3)`);
    // trem: as pernas saem da barriga (o recorte esconde o que ainda está dentro)
    $('j7GearS').setAttribute('transform', `translate(0 ${(-(1 - s.gear) * 10.5).toFixed(2)})`);
    $('j7GearR').style.opacity = s.gear.toFixed(2);
    $('j7GearR').setAttribute('transform', `translate(0 ${(-(1 - s.gear) * 6).toFixed(1)})`);
    $('j7Rear').setAttribute('transform', `rotate(${s.phi.toFixed(2)} 150 100)`);
    // ailerons: os internos sempre; os externos só com flaps baixados (em alta velocidade ficam travados)
    const ai = ctl.ail * 2.2, ao = s.flap > 0.5 ? ctl.ail * 2.8 : 0;
    $('j7AilRi').setAttribute('d', surf(0.40, 0.50, 1, ai));
    $('j7AilLi').setAttribute('d', surf(0.40, 0.50, -1, -ai));
    $('j7AilRo').setAttribute('d', surf(0.70, 0.94, 1, ao));
    $('j7AilLo').setAttribute('d', surf(0.70, 0.94, -1, -ao));
    // spoilers: sobem juntos como freio aerodinâmico e, na curva, sobem na asa que desce
    const sb = Math.max(ctl.sb, s.groundSb || 0);
    const spR = Math.max(sb, ctl.ail > 0.15 ? ctl.ail * 0.7 : 0) * 6, spL = Math.max(sb, ctl.ail < -0.15 ? -ctl.ail * 0.7 : 0) * 6;
    $('j7SpR').setAttribute('d', spoil(0.14, 0.38, 1, spR));
    $('j7SpL').setAttribute('d', spoil(0.14, 0.38, -1, spL));
    // de lado se vê a asa direita: os spoilers dela levantam a borda de trás
    $('j7SpS1').setAttribute('d', spoilerSide(144, 99.3, 7.5, spR / 6));
    $('j7SpS2').setAttribute('d', spoilerSide(134.5, 98.4, 7.5, spR / 6));
    // profundores vistos de trás: sobem com o manche puxado
    const e = ctl.elev * 3;
    // estabilizador visto de trás: bordo de fuga da raiz (150 ± 3,8; 94,4) à ponta (150 ± 46; 87,8)
    $('j7ElevR').setAttribute('d', hinged([153.8, 94.4], [196, 87.8], e));
    $('j7ElevL').setAttribute('d', hinged([146.2, 94.4], [104, 87.8], e));
    $('j7Rud').setAttribute('transform', `translate(${(ctl.rud * 2.5).toFixed(1)} 0)`);
  }

  /* ---------- o que está acontecendo ---------- */
  function explain() {
    const out = [];
    const kias = ias(), alt = hft(), vs = fpm(), vs1 = Math.round(stallIas(s.flap, s.phi));
    if (fail) out.push(['warn', `PANE · ${FAILS[fail.id].title}: ${fail.on ? FAILS[fail.id].intro : 'ela vai acontecer daqui a pouco.'}`]);
    if (demo) out.push(['', `Piloto de demonstração: ${DEMO[demo]}. Mexa em qualquer comando para assumir.`]);
    if (msg) out.push([msg.cls, msg.txt]);
    if (s.stalled) out.push(['warn', 'ESTOL. O manche vibra (stick shaker) e o nariz cai sozinho. Para sair: empurre o manche, potência máxima e asas niveladas.']);
    else if (!s.ground && s.A && s.alpha > s.A.acrit - 1.5) out.push(['warn', `Perto do estol: o manche começa a vibrar (stick shaker). Estol a ~${vs1} kt nesta configuração. Baixe o nariz ou aumente a potência.`]);
    for (const [, t] of alerts()) {
      if (t === 'OVERSPEED') out.push(['warn', `OVERSPEED: acima da velocidade máxima (${P.vmo} kt ou Mach ${P.mmo}). Reduza as manetes e levante um pouco o nariz.`]);
      else if (t === 'CONFIG GEAR') out.push(['warn', 'CONFIG GEAR: flaps de pouso baixados e o trem ainda em cima. Baixe o trem.']);
      else if (t.startsWith('>FLAP')) out.push(['warn', `Rápido demais para flaps ${ctl.flaps}: o limite é ${P.vfe[ctl.flaps]} kt (marcado no velocímetro).`]);
      else if (t.startsWith('>GEAR')) out.push(['warn', `O trem só pode subir ou descer abaixo de ${P.vlo} kt.`]);
    }
    if (sc === 'decolagem' && s.ground && !airborneOnce) {
      if (kias < 80) out.push(['', 'Corrida de decolagem: manetes em potência de decolagem (TOGA). Os quatro motores levam alguns segundos para chegar ao N1 máximo.']);
      else if (kias < P.v1) out.push(['', `"Oitenta nós". Próxima chamada: V1 a ${P.v1} kt. Até a V1 ainda dá para abortar a decolagem.`]);
      else if (kias < P.vr) out.push(['', `V1 (${P.v1} kt): agora a decolagem continua mesmo se um motor falhar. Rotação a ${P.vr} kt.`]);
      else out.push(['', `ROTATE (${P.vr} kt): puxe o manche aos poucos. O nariz sobe uns 3° por segundo. No chão, acima de 11° a cauda bate na pista.`]);
    }
    if (sc === 'decolagem' && !s.ground && alt < 3000) {
      if (s.gear > 0.5 && vs > 300) out.push(['', 'Razão de subida positiva: recolha o trem ("positive rate, gear up").']);
      else if (s.gear <= 0.5 && ctl.flaps > 0 && kias > 200) out.push(['', `Acima de 200 kt: recolha os flaps aos poucos (20 → 10 → 5 → 1 → 0). Limite atual: ${P.vfe[ctl.flaps]} kt.`]);
      else if (kias < P.v2) out.push(['warn', `Abaixo da V2 (${P.v2} kt): baixe um pouco o nariz para ganhar velocidade.`]);
    }
    if (sc === 'aproximacao' && !s.ground) {
      const g = rwyGeom();
      if (g.ahead && g.dist < 25) {
        if (g.gsDev > 120) out.push(['', `Acima da rampa (${Math.round(g.gsDev)} ft): reduza um pouco as manetes ou baixe o nariz.`]);
        else if (g.gsDev < -120) out.push(['warn', `Abaixo da rampa (${Math.round(-g.gsDev)} ft): aumente um pouco a potência.`]);
        else out.push(['', `Na rampa de 3° (ILS), a ${g.dist.toFixed(1)} NM da pista. Mantenha ~${P.vref + 5} kt e uns -800 ft/min.`]);
        if (Math.abs(g.loc) > 1) out.push(['', `Fora do eixo da pista: a pista está à ${g.loc > 0 ? 'direita' : 'esquerda'}. Incline um pouco para lá.`]);
      }
      if (alt < 60 && alt > 1) out.push(['', 'Arredondamento: a uns 30 ft puxe só um pouco o manche (cerca de +20) e leve as manetes para marcha lenta.']);
      else if (alt < 1000) out.push(['', `${Math.round(alt / 10) * 10} ft de altura (rádio-altímetro).`]);
    }
    if (ctl.elev > 0.08) out.push(['', 'Manche puxado: o profundor sobe e o nariz sobe. No 747, com 350 t, o nariz gira devagar, uns 3° por segundo.']);
    else if (ctl.elev < -0.08) out.push(['', 'Manche empurrado: o profundor desce e o nariz desce. O avião ganha velocidade.']);
    if (Math.abs(ctl.ail) > 0.08) {
      const d = ctl.ail > 0 ? 'direita' : 'esquerda';
      out.push(['', `Manche girado para a ${d}: os ailerons e os spoilers da asa ${d} sobem para ajudar a inclinar.${s.flap < 0.5 ? ' Com flaps recolhidos, os ailerons externos ficam travados (em alta velocidade eles torceriam a asa).' : ''}`]);
    }
    if (Math.abs(s.phi) > 35 && !s.ground) out.push(['warn', `BANK ANGLE: ${Math.round(Math.abs(s.phi))}° de inclinação passa do limite de 35° do alerta do 747-8. A voz avisa "bank angle" e o ponteiro do PFD fica âmbar. Centre o manche para nivelar as asas.`]);
    if (Math.abs(s.phi) > 5 && !s.ground) { const om = G * Math.tan(s.phi * D2R) / s.V / D2R; out.push(['', `Inclinado ${Math.round(Math.abs(s.phi))}°: curva de ${Math.abs(om).toFixed(1)}°/s. A linha verde no ND mostra para onde o avião vai nos próximos 90 s.`]); }
    if (Math.abs(ctl.rud) > 0.08) out.push(['', `Pedal ${ctl.rud > 0 ? 'direito' : 'esquerdo'}: o leme guina o nariz. No 747 ele é usado sobretudo com vento cruzado ou motor parado.`]);
    if (ctl.sb > 0.05) out.push(['', `Freio aerodinâmico em ${Math.round(ctl.sb * 100)}%: os spoilers sobem nas duas asas, a sustentação cai e o arrasto aumenta. Serve para descer sem ganhar velocidade.`]);
    if (Math.abs(s.spool - ctl.thr) > 0.06) out.push(['', `Motores ${s.spool < ctl.thr ? 'acelerando' : 'reduzindo'}: N1 ${n1Of(s.spool).toFixed(0)}% indo para ${n1Of(ctl.thr).toFixed(0)}%. Motores a jato levam alguns segundos para responder.`]);
    if (s.gear > 0.01 && s.gear < 0.99) out.push(['', `Trem ${ctl.gearDown ? 'descendo' : 'subindo'}: as portas abrem e as 18 rodas entram ou saem do alojamento (uns 10 s).`]);
    if (s.ground && kias < 3 && airborneOnce) out.push(['', 'Avião parado. Escolha um cenário para voar de novo.']);
    if (!out.length) out.push(['', `Voo estabilizado: ${Math.round(kias)} kt, ${Math.round(alt / 100) * 100} ft, N1 ${n1Of(s.spool).toFixed(0)}%. Com o manche solto, o avião mantém a atitude compensada (${s.ttrim.toFixed(1)}°).`]);
    return out;
  }
  function warn() {
    if (s.stalled) return 'STALL · STICK SHAKER';
    if (!s.ground && s.A && s.alpha > s.A.acrit - 1.5) return 'STICK SHAKER';
    const a = alerts().find(([k]) => k === 'red');
    return a ? a[1] : '';
  }

  start('cruzeiro');
  return {
    id: 'b747', flaps: DET, flapLabel: (f) => String(f), scenarios: SCENARIOS, defaultScenario: 'cruzeiro',
    start, step, size, draw, minisHTML, minis, explain, warn, trim, takeover, demo: () => !!demo, ndTeach, pfdTeach, eicasTeach,
    startFail, failAct, failState, stopFail: () => { fail = null; s.eng = [1, 1, 1, 1]; },
    trimText: () => `${s.ttrim >= 0 ? '+' : ''}${s.ttrim.toFixed(1)}°`,
    n1: () => n1Of(ctl.thr),
  };
}

window.Cockpit747 = { create };
})();
