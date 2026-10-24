/* Hangar Escola: cockpit do Boeing 747-8.
   Modelo de voo de massa pontual (unidades SI) afinado com números do 747-8 a 350 t: cruzeiro Mach 0,85 a 37.000 ft,
   aproximação a 155 kt com flaps 30, rotação a ~158 kt com flaps 20 e estol limpo perto de 165 kt.
   Telas no estilo Boeing: PFD (voo), ND (navegação) e EICAS (motores e alertas). Números aproximados, para estudo. */
(() => {
'use strict';

const D2R = Math.PI / 180, KT = 0.514444, FT = 0.3048, NM = 1852, G = 9.81;
const P = {
  m: 350000, S: 554, CLa: 0.095, a0: -2.5, CLmax: 1.40, cd0: 0.017, k: 0.043,
  T0: 4 * 296000, gearCD: 0.020, sbCD: 0.035, sbCL: 0.30, incid: 2,
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
  const a0 = P.a0 - 0.75 * dCL / P.CLa;
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

function create(ctl) {
  let s = {};
  let sc = 'cruzeiro';
  let msg = null;          // mensagem temporária (pouso, cauda na pista)
  let iasPrev = 0, trend = 0, airborneOnce = false;

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
    iasPrev = ias(); trend = 0;
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
    // os motores a jato demoram alguns segundos para acelerar (spool)
    s.spool += (ctl.thr - s.spool) * dt * 0.35;
    s.flap += Math.sign(ctl.flaps - s.flap) * Math.min(Math.abs(ctl.flaps - s.flap), 3 * dt);
    s.gear += Math.sign(ctl.gearDown - s.gear) * Math.min(Math.abs(ctl.gearDown - s.gear), dt / 10);
    s.phi += ((s.ground ? 0 : ctl.ail * 35) - s.phi) * dt * 0.45;
    // depois do pouso, com as manetes em marcha lenta, os spoilers de solo sobem sozinhos
    s.groundSb = s.ground && airborneOnce && ctl.thr < 0.08 ? 1 : 0;
    const sb = Math.max(ctl.sb, s.groundSb);
    // manche = atitude do nariz em relação ao compensador; o 747 gira o nariz no máximo uns 3°/s
    let tcmd = s.ttrim + ctl.elev * 12;
    if (s.ground) tcmd = clamp(tcmd, 0, 16) * clamp((kias - 120) / 40, 0, 1);
    s.theta += clamp((tcmd - s.theta) * 0.9 * dt, -3 * dt, 3 * dt);
    if (s.ground) {
      s.theta = Math.max(0, s.theta); s.gamma = 0; s.alpha = s.theta + P.incid;
      const A = aero(s, sb), L = q * P.S * A.CL, D = q * P.S * A.CD, T = thrust(s.spool, rho, M);
      const mu = ctl.thr < 0.08 && V > 1 ? 0.25 : 0.015;   // em marcha lenta no solo: freio automático
      s.V = Math.max(0, V + ((T - D - mu * Math.max(0, W - L)) / P.m) * dt);
      if (s.theta > 11 && !s.tailstrike) { s.tailstrike = true; msg = { t: 8, cls: 'warn', txt: 'TAIL STRIKE: com o nariz acima de 11° no solo, a cauda do 747 encosta na pista. Puxe o manche mais devagar na rotação.' }; }
      if (L > W) { s.ground = false; s.gamma = 0.0005; s.airH = 0; airborneOnce = true; }
      s.h = 0; s.stalled = false; s.A = A;
    } else {
      s.alpha = s.theta - s.gamma / D2R;
      let A = aero(s, sb);
      if (s.alpha > A.acrit) s.stalled = true; else if (s.alpha < A.acrit - 1) s.stalled = false;
      // em estol o nariz cai sozinho (o vento empurra a cauda para cima); o manche puxado só atrasa isso
      if (s.alpha > A.acrit) { s.theta -= (s.alpha - A.acrit + 1.5) * 1.1 * dt; s.alpha = s.theta - s.gamma / D2R; A = aero(s, sb); }
      const L = q * P.S * A.CL, D = q * P.S * A.CD, T = thrust(s.spool, rho, M), al = s.alpha * D2R;
      s.V = Math.max(40, V + ((T * Math.cos(al) - D) / P.m - G * Math.sin(s.gamma)) * dt);
      s.gamma += ((L * Math.cos(s.phi * D2R) + T * Math.sin(al) - W * Math.cos(s.gamma)) / (P.m * V)) * dt;
      s.psi = (s.psi + (L * Math.sin(s.phi * D2R) / (P.m * V * Math.cos(s.gamma))) / D2R * dt + ctl.rud * 0.6 * dt + 360) % 360;
      s.h += V * Math.sin(s.gamma) * dt;
      s.airH = Math.max(s.airH || 0, s.h / FT);
      s.A = A;
      if (s.h <= 0) touchdown();
    }
    const gs = s.V * Math.cos(s.gamma);
    s.x += gs * Math.sin(s.psi * D2R) * dt / NM;
    s.y += gs * Math.cos(s.psi * D2R) * dt / NM;
    s.fuel = Math.max(0, s.fuel - 4 * ffEngine() * dt / 3600 / 1000);
    s.ball = clamp(-ctl.rud * 0.7 + ctl.ail * 0.15, -1, 1);
    const now = ias();
    trend += ((now - iasPrev) / Math.max(dt, 1e-3) - trend) * Math.min(1, dt * 1.5);
    iasPrev = now;
    if (msg && (msg.t -= dt) <= 0) msg = null;
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
  const COL = { white: '#f2f5f7', green: '#3be36c', magenta: '#f03bd9', cyan: '#4fd7ff', amber: '#ffb000', red: '#ff3b30', gray: '#3a4147', sky: '#2c74c9', ground: '#8a5730' };
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
    c.fillStyle = Math.abs(s.phi) > 35 ? COL.amber : COL.white;
    c.beginPath(); c.moveTo(0, -R + 1); c.lineTo(-6, -R + 11); c.lineTo(6, -R + 11); c.closePath(); c.fill();
    c.restore();
    // símbolo do avião (fixo)
    c.save(); c.translate(cx, cy);
    c.fillStyle = '#000'; c.strokeStyle = COL.white; c.lineWidth = 1.6;
    const wl = aw * 0.24, wo = aw * 0.12;
    [[-1], [1]].forEach(([sd]) => { c.beginPath(); c.moveTo(sd * wo, -3); c.lineTo(sd * (wo + wl), -3); c.lineTo(sd * (wo + wl), 3); c.lineTo(sd * (wo + 7), 3); c.lineTo(sd * (wo + 7), 12); c.lineTo(sd * wo, 12); c.closePath(); c.fill(); c.stroke(); });
    c.fillRect(-4, -4, 8, 8); c.strokeRect(-4, -4, 8, 8);
    c.restore();
    // altitude-rádio e indicação da rampa
    if (alt < 2500 && !s.ground) txt(c, `RA ${Math.round(alt / 10) * 10}`, cx - aw / 2 + 8, cy + ah / 2 - 28, F(ah * 0.06, 600), alt < 500 ? COL.amber : COL.white, 'left');
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
    // vetor de tendência: onde a velocidade estará em 10 s
    const tv = clamp(trend * 10, -60, 60);
    if (Math.abs(tv) > 2) { c.strokeStyle = COL.green; c.lineWidth = 2; c.beginPath(); c.moveTo(tx + tw - 22, cy); c.lineTo(tx + tw - 22, vy(kias + tv)); c.stroke(); }
    c.restore();
    c.fillStyle = '#000'; c.strokeStyle = COL.white; c.lineWidth = 1.6; rr(c, tx - 2, cy - th * 0.05, tw - 2, th * 0.1, 3); c.fill(); c.stroke();
    txt(c, Math.max(0, Math.round(kias)), tx + tw * 0.48, cy + 1, F(th * 0.075, 600), kias < vs1 * 1.05 && !s.ground ? COL.amber : COL.white);
    const mc = mach();
    if (mc > 0.4) txt(c, mc.toFixed(3).slice(1), tx + tw / 2, ty + th + h * 0.04, F(h * 0.04, 600), COL.white);
    else txt(c, 'kt', tx + tw / 2, ty + th + h * 0.04, F(h * 0.035), '#9aa6b0');
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
    c.restore();
    c.fillStyle = '#000'; c.strokeStyle = COL.white; rr(c, ax + 3, cy - th * 0.055, awd + 4, th * 0.11, 3); c.fill(); c.stroke();
    const a10 = Math.max(0, Math.round(alt / 20) * 20);
    txt(c, Math.floor(a10 / 1000), ax + awd * 0.46, cy + 1, F(th * 0.085, 600), COL.white, 'right');
    txt(c, String(a10 % 1000).padStart(3, '0'), ax + awd * 0.48, cy + 2, F(th * 0.06, 600), COL.white, 'left');
    txt(c, alt > 18000 ? 'STD' : '1013 HPA', ax + awd / 2, ty + th + h * 0.04, F(h * 0.035, 600), COL.cyan);
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
    c.restore();
    c.fillStyle = '#000'; c.strokeStyle = COL.white; rr(c, cx - w * 0.055, y + h * 0.79, w * 0.11, h * 0.05, 3); c.fill(); c.stroke();
    txt(c, String(Math.round(s.psi) % 360).padStart(3, '0'), cx, y + h * 0.815, F(h * 0.036, 600), COL.white);
    // modos (piloto automático desligado)
    txt(c, 'A/T OFF   VOO MANUAL', cx, y + h * 0.065, F(h * 0.032, 600), COL.green);
  }

  function drawND(c, x, y, w, h) {
    frame(c, x, y, w, h, 'ND · NAVEGAÇÃO');
    const cx = x + w / 2, cy = y + h * 0.8, R = Math.min(h * 0.6, w * 0.44), range = RANGE[sc] || 10;
    const gs = s.V * Math.cos(s.gamma) / KT;
    txt(c, `GS ${Math.round(gs)}`, x + 10, y + 16, F(h * 0.042, 600), COL.white, 'left');
    txt(c, `TAS ${Math.round(s.V / KT)}`, x + 10, y + 16 + h * 0.055, F(h * 0.034), COL.white, 'left');
    c.fillStyle = '#000'; c.strokeStyle = COL.white; c.lineWidth = 1.5; rr(c, cx - w * 0.09, y + 6, w * 0.18, h * 0.07, 3); c.fill(); c.stroke();
    txt(c, String(Math.round(s.psi) % 360).padStart(3, '0'), cx, y + 6 + h * 0.037, F(h * 0.048, 600), COL.white);
    txt(c, 'HDG', cx - w * 0.11, y + 6 + h * 0.037, F(h * 0.032, 600), COL.green, 'right');
    txt(c, 'MAG', cx + w * 0.11, y + 6 + h * 0.037, F(h * 0.032, 600), COL.green, 'left');
    c.save(); c.beginPath(); c.rect(x + 3, y + h * 0.1, w - 6, h * 0.83); c.clip();
    c.translate(cx, cy);
    c.strokeStyle = COL.white; c.lineWidth = 1.4;
    c.beginPath(); c.arc(0, 0, R, (-90 - 62) * D2R, (-90 + 62) * D2R); c.stroke();
    for (let d = 0; d < 360; d += 5) {
      const rel = ((d - s.psi + 540) % 360) - 180;
      if (Math.abs(rel) > 62) continue;
      const an = (rel - 90) * D2R, l = d % 10 ? 6 : 11;
      c.beginPath(); c.moveTo(Math.cos(an) * R, Math.sin(an) * R); c.lineTo(Math.cos(an) * (R - l), Math.sin(an) * (R - l)); c.stroke();
      if (d % 30 === 0) txt(c, d / 10, Math.cos(an) * (R - 22), Math.sin(an) * (R - 22), F(h * 0.04, 600), COL.white);
    }
    c.setLineDash([4, 6]); c.beginPath(); c.arc(0, 0, R / 2, (-90 - 62) * D2R, (-90 + 62) * D2R); c.stroke(); c.setLineDash([]);
    // pista
    const g = rwyGeom(), ppn = R / range;
    const toND = (ex, ny) => { const dx = ex - s.x, dy = ny - s.y, ps = s.psi * D2R; return [(dx * Math.cos(ps) - dy * Math.sin(ps)) * ppn, -(dx * Math.sin(ps) + dy * Math.cos(ps)) * ppn]; };
    const r = rwy(), e = [r.x + Math.sin(r.hdg * D2R) * r.len, r.y + Math.cos(r.hdg * D2R) * r.len];
    const a1 = toND(r.x, r.y), a2 = toND(e[0], e[1]);
    if (sc === 'aproximacao' || sc === 'decolagem') {
      const ext = toND(r.x - Math.sin(r.hdg * D2R) * 14, r.y - Math.cos(r.hdg * D2R) * 14);
      c.strokeStyle = COL.magenta; c.lineWidth = 1.6; c.setLineDash([8, 6]); c.beginPath(); c.moveTo(ext[0], ext[1]); c.lineTo(a1[0], a1[1]); c.stroke(); c.setLineDash([]);
      c.strokeStyle = COL.white; c.lineWidth = Math.max(3, ppn * 0.05); c.beginPath(); c.moveTo(a1[0], a1[1]); c.lineTo(a2[0], a2[1]); c.stroke();
      txt(c, r.name, a2[0] + 8, a2[1], F(h * 0.034, 600), COL.white, 'left');
    }
    // vetor de tendência da curva (30, 60 e 90 s)
    const om = s.V > 1 ? (G * Math.tan(s.phi * D2R) / s.V) : 0, vnm = gs / 3600;
    c.strokeStyle = COL.green; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 0);
    let px = 0, py = 0, ang = 0;
    for (let t = 0; t <= 90; t += 3) { px += Math.sin(ang) * vnm * 3 * ppn; py -= Math.cos(ang) * vnm * 3 * ppn; ang += om * 3; c.lineTo(px, py); }
    c.stroke();
    c.strokeStyle = COL.white; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -12); c.lineTo(-8, 10); c.lineTo(8, 10); c.closePath(); c.stroke();
    c.restore();
    txt(c, `${range} NM`, x + 10, y + h * 0.88, F(h * 0.032), '#c9d2d8', 'left');
    if (sc === 'aproximacao' || sc === 'decolagem') {
      txt(c, r.name, x + w - 10, y + 16, F(h * 0.04, 600), COL.white, 'right');
      txt(c, `${g.dist.toFixed(1)} NM`, x + w - 10, y + 16 + h * 0.055, F(h * 0.036), COL.white, 'right');
    }
  }

  function dial(c, cx, cy, r, val, max, redline, label) {
    const a0 = Math.PI * 0.8, a1 = Math.PI * 2.05, an = a0 + (a1 - a0) * clamp(val / max, 0, 1.05);
    c.fillStyle = '#4b5359'; c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, r, a0, an); c.closePath(); c.fill();
    c.strokeStyle = COL.white; c.lineWidth = 1.6; c.beginPath(); c.arc(cx, cy, r, a0, a1); c.stroke();
    const ar = a0 + (a1 - a0) * redline / max;
    c.strokeStyle = COL.red; c.lineWidth = 2.5; c.beginPath(); c.moveTo(cx + Math.cos(ar) * r * 0.75, cy + Math.sin(ar) * r * 0.75); c.lineTo(cx + Math.cos(ar) * r * 1.12, cy + Math.sin(ar) * r * 1.12); c.stroke();
    c.strokeStyle = COL.white; c.lineWidth = 2; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(an) * r, cy + Math.sin(an) * r); c.stroke();
    c.fillStyle = '#000'; c.strokeStyle = COL.white; c.lineWidth = 1.2; rr(c, cx - r * 0.55, cy - r * 1.62, r * 1.3, r * 0.5, 2); c.fill(); c.stroke();
    txt(c, label, cx + r * 0.1, cy - r * 1.36, F(r * 0.36, 600), COL.white);
  }
  function alerts() {
    const out = [];
    const kias = ias(), m = mach();
    if (kias > P.vmo + 2 || m > P.mmo) out.push(['red', 'OVERSPEED']);
    if (!s.ground && s.flap >= 24 && s.gear < 0.99 && hft() < 1500) out.push(['red', 'CONFIG GEAR']);
    const vfe = P.vfe[ctl.flaps] || 365;
    if (ctl.flaps > 0 && kias > vfe + 3) out.push(['amber', `>FLAP LIMIT ${vfe}`]);
    if (s.gear > 0.01 && kias > P.vlo + 3 && !s.ground) out.push(['amber', `>GEAR LIMIT ${P.vlo}`]);
    if (s.tailstrike) out.push(['amber', 'TAIL STRIKE']);
    if (ctl.sb > 0.05 && !s.ground && (s.flap >= 24 || hft() < 800)) out.push(['amber', 'SPEEDBRAKE EXT']);
    if (s.gear > 0.01 && s.gear < 0.99) out.push(['white', 'GEAR IN TRANSIT']);
    return out;
  }
  function drawEICAS(c, x, y, w, h) {
    frame(c, x, y, w, h, 'EICAS · MOTORES E ALERTAS');
    const n1 = n1Of(s.spool), egt = 380 + 560 * Math.pow(clamp(s.spool, 0, 1), 1.4), ff = ffEngine() / 1000;
    const cw = (w - 16) / 4, r = Math.min(cw * 0.36, h * 0.085);
    for (let i = 0; i < 4; i++) {
      const cx = x + 8 + cw * (i + 0.5);
      dial(c, cx, y + h * 0.22, r, n1, 110, 102, n1.toFixed(1));
      dial(c, cx, y + h * 0.44, r * 0.85, egt, 1100, 1060, Math.round(egt));
      txt(c, ff.toFixed(1), cx, y + h * 0.545, F(h * 0.035, 600), COL.white);
    }
    txt(c, 'N1', x + w / 2, y + h * 0.3, F(h * 0.032, 600), COL.cyan);
    txt(c, 'EGT', x + w / 2, y + h * 0.505, F(h * 0.03, 600), COL.cyan);
    txt(c, 'FF t/h', x + w / 2, y + h * 0.585, F(h * 0.026, 600), COL.cyan);
    // alertas
    const al = alerts();
    al.slice(0, 5).forEach(([k, t], i) => txt(c, t, x + 12, y + h * 0.65 + i * h * 0.05, F(h * 0.038, 600), COL[k], 'left'));
    // flaps
    const fx = x + w * 0.8, fy0 = y + h * 0.64, fy1 = y + h * 0.86;
    txt(c, 'FLAPS', fx, fy0 - h * 0.025, F(h * 0.03, 600), COL.cyan);
    c.strokeStyle = COL.white; c.lineWidth = 1.3; c.strokeRect(fx - 5, fy0, 10, fy1 - fy0);
    const fyy = (f) => fy0 + (fy1 - fy0) * f / 30;
    c.fillStyle = Math.abs(s.flap - ctl.flaps) > 0.2 ? COL.magenta : COL.green;
    c.fillRect(fx - 5, fy0, 10, fyy(s.flap) - fy0);
    [0, 1, 5, 10, 20, 25, 30].forEach((d) => { if (d === 0 || d === 1) return; c.beginPath(); c.moveTo(fx + 5, fyy(d)); c.lineTo(fx + 9, fyy(d)); c.stroke(); });
    txt(c, Math.round(s.flap), fx - 10, fyy(s.flap), F(h * 0.038, 600), Math.abs(s.flap - ctl.flaps) > 0.2 ? COL.magenta : COL.green, 'right');
    // trem
    const gx = x + w * 0.56, gy = y + h * 0.7;
    txt(c, 'GEAR', gx, gy - h * 0.035, F(h * 0.03, 600), COL.cyan);
    const gtxt = s.gear >= 0.99 ? 'DOWN' : s.gear <= 0.01 ? 'UP' : '';
    const gcol = s.gear >= 0.99 ? COL.green : COL.white;
    c.strokeStyle = s.gear > 0.01 && s.gear < 0.99 ? COL.amber : gcol; c.lineWidth = 1.6; c.strokeRect(gx - w * 0.08, gy - h * 0.02, w * 0.16, h * 0.05);
    if (gtxt) txt(c, gtxt, gx, gy + h * 0.005, F(h * 0.036, 600), gcol);
    else { c.save(); c.beginPath(); c.rect(gx - w * 0.08, gy - h * 0.02, w * 0.16, h * 0.05); c.clip(); c.strokeStyle = COL.amber; for (let k = -40; k < 60; k += 6) { c.beginPath(); c.moveTo(gx - w * 0.08 + k, gy + h * 0.03); c.lineTo(gx - w * 0.08 + k + 12, gy - h * 0.02); c.stroke(); } c.restore(); }
    // combustível e temperatura
    const { T } = atm(), tat = T * (1 + 0.2 * mach() * mach()) - 273.15;
    txt(c, `FUEL ${s.fuel.toFixed(1)} t`, gx, y + h * 0.8, F(h * 0.034, 600), COL.white);
    txt(c, `TAT ${tat >= 0 ? '+' : ''}${Math.round(tat)}°C`, gx, y + h * 0.85, F(h * 0.03), COL.white);
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
  // faixa de 0,8 sobre a linha (y0 acima do bordo de fuga), deslocada d para cima
  const strip = (a, b, y0, d) => `M${a[0]} ${(a[1] - y0 - d - 0.4).toFixed(2)} L${b[0]} ${(b[1] - y0 - d - 0.4).toFixed(2)} L${b[0]} ${(b[1] - y0 - d + 0.4).toFixed(2)} L${a[0]} ${(a[1] - y0 - d + 0.4).toFixed(2)} Z`;
  // aileron: placa presa na articulação (0,6 acima do bordo de fuga) até o bordo de fuga deslocado d para cima
  const surf = (t0, t1, sd, d) => { const a = wingPt(t0, sd), b = wingPt(t1, sd);
    return `M${a[0]} ${(a[1] - 0.6).toFixed(2)} L${b[0]} ${(b[1] - 0.6).toFixed(2)} L${b[0]} ${(b[1] - d + 0.4).toFixed(2)} L${a[0]} ${(a[1] - d + 0.4).toFixed(2)} Z`; };
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
    $('j7ElevR').setAttribute('d', strip([153.8, 94.4], [196, 87.8], 0, e));
    $('j7ElevL').setAttribute('d', strip([146.2, 94.4], [104, 87.8], 0, e));
    $('j7Rud').setAttribute('transform', `translate(${(ctl.rud * 2.5).toFixed(1)} 0)`);
  }

  /* ---------- o que está acontecendo ---------- */
  function explain() {
    const out = [];
    const kias = ias(), alt = hft(), vs = fpm(), vs1 = Math.round(stallIas(s.flap, s.phi));
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
    start, step, size, draw, minisHTML, minis, explain, warn, trim,
    trimText: () => `${s.ttrim >= 0 ? '+' : ''}${s.ttrim.toFixed(1)}°`,
    n1: () => n1Of(ctl.thr),
  };
}

window.Cockpit747 = { create };
})();
