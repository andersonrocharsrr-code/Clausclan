/* Último Dia — efeitos sonoros sintetizados com Web SOUND (sem arquivos de áudio).
   Sons do mundo têm volume e estéreo pela distância até o jogador. */
'use strict';

const SND_KEY = 'ultimo-dia-som';
const SOUND = {
  ctx: null, master: null, sfxBus: null, ambBus: null, noise: null, brown: null,
  on: (() => { try { return localStorage.getItem(SND_KEY) !== '0'; } catch (e) { return true; } })(),
  last: {}, loops: {}, voices: 0,
};

SOUND.unlock = function () {
  if (!this.ctx) {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    const c = this.ctx = new AC();
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 4; comp.connect(c.destination);
    this.master = c.createGain(); this.master.gain.value = this.on ? 0.8 : 0; this.master.connect(comp);
    this.sfxBus = c.createGain(); this.sfxBus.connect(this.master);
    this.ambBus = c.createGain(); this.ambBus.connect(this.master);
    // ruído branco e marrom pré-gerados
    const len = c.sampleRate * 2;
    this.noise = c.createBuffer(1, len, c.sampleRate); const d = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.brown = c.createBuffer(1, len, c.sampleRate); const b = this.brown.getChannelData(0); let l = 0;
    for (let i = 0; i < len; i++) { l = (l + 0.02 * (Math.random() * 2 - 1)) / 1.02; b[i] = l * 3.5; }
  }
  if (this.ctx.state === 'suspended') this.ctx.resume();
};
SOUND.setOn = function (v) {
  this.on = v; try { localStorage.setItem(SND_KEY, v ? '1' : '0'); } catch (e) { /* ok */ }
  if (this.master) this.master.gain.setTargetAtTime(v ? 0.8 : 0, this.ctx.currentTime, 0.05);
};
['pointerdown', 'keydown', 'touchstart'].forEach((ev) => window.addEventListener(ev, () => SOUND.unlock(), { passive: true }));

/* ---------- blocos de síntese ---------- */
function aOut(vol, pan) {
  const c = SOUND.ctx, g = c.createGain(); g.gain.value = vol;
  if (pan && c.createStereoPanner) { const p = c.createStereoPanner(); p.pan.value = clamp(pan, -1, 1); g.connect(p); p.connect(SOUND.sfxBus); }
  else g.connect(SOUND.sfxBus);
  return g;
}
function aEnv(param, t, a, d, peak, end = 0.0001) {
  param.setValueAtTime(0.0001, t); param.exponentialRampToValueAtTime(peak, t + a); param.exponentialRampToValueAtTime(end, t + a + d);
}
function aNoise(out, t, dur, { type = 'lowpass', f = 1000, f2, q = 0.8, a = 0.003, vol = 1, brown = false, rate = 1 } = {}) {
  const c = SOUND.ctx, s = c.createBufferSource(); s.buffer = brown ? SOUND.brown : SOUND.noise; s.playbackRate.value = rate;
  const fl = c.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(f, t); fl.Q.value = q;
  if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur);
  const g = c.createGain(); aEnv(g.gain, t, a, dur, vol);
  s.connect(fl); fl.connect(g); g.connect(out);
  s.start(t, Math.random() * 1.5); s.stop(t + a + dur + 0.05);
}
function aTone(out, t, dur, { type = 'sine', f = 440, f2, a = 0.005, vol = 1, filter, q = 1 } = {}) {
  const c = SOUND.ctx, o = c.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
  const g = c.createGain(); aEnv(g.gain, t, a, dur, vol);
  if (filter) { const fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = filter; fl.Q.value = q; o.connect(fl); fl.connect(g); } else o.connect(g);
  g.connect(out); o.start(t); o.stop(t + a + dur + 0.05);
  return o;
}

/* ---------- catálogo de sons ---------- */
const GUN = {
  pistola: { f: 1800, body: 140, dur: 0.18, vol: 1 }, revolver: { f: 1300, body: 110, dur: 0.26, vol: 1.1 },
  espingarda: { f: 900, body: 70, dur: 0.42, vol: 1.3 }, smg: { f: 2200, body: 160, dur: 0.1, vol: 0.75 }, rifle: { f: 1100, body: 60, dur: 0.55, vol: 1.35 },
};
const SFX = {
  tiro(o, t, x) {
    const g = GUN[x.k] || GUN.pistola;
    aNoise(o, t, g.dur, { f: g.f * 3, f2: 300, vol: g.vol, a: 0.001 });
    aNoise(o, t, g.dur * 1.8, { f: 500, f2: 120, vol: g.vol * 0.7, brown: true, a: 0.002 });
    aTone(o, t, g.dur, { f: g.body * 2, f2: 40, vol: g.vol * 0.9, a: 0.001 });
    aNoise(o, t + 0.06, g.dur * 3, { type: 'bandpass', f: 700, q: 0.5, vol: g.vol * 0.12 }); // eco
  },
  vazio(o, t) { aTone(o, t, 0.03, { type: 'square', f: 2400, vol: 0.25, filter: 3000 }); },
  recarga(o, t) { aNoise(o, t, 0.05, { type: 'bandpass', f: 2500, q: 3, vol: 0.5 }); aTone(o, t + 0.18, 0.04, { type: 'square', f: 1300, vol: 0.25, filter: 2500 }); aNoise(o, t + 0.2, 0.06, { type: 'bandpass', f: 3500, q: 4, vol: 0.5 }); },
  golpe(o, t) { aNoise(o, t, 0.16, { type: 'bandpass', f: 600, f2: 2200, q: 1.5, vol: 0.35, a: 0.03 }); },
  acerto(o, t, x) {
    aTone(o, t, 0.12, { f: 150, f2: 50, vol: 0.9 });
    aNoise(o, t, x.blade ? 0.09 : 0.06, x.blade ? { type: 'highpass', f: 2500, vol: 0.4 } : { f: 900, vol: 0.6 });
    aNoise(o, t + 0.01, 0.12, { f: 400, vol: 0.4, brown: true });
  },
  esmaga(o, t) { aNoise(o, t, 0.25, { f: 700, f2: 150, vol: 0.7, brown: true }); aTone(o, t, 0.2, { f: 90, f2: 40, vol: 0.6 }); },
  vidro(o, t) {
    aNoise(o, t, 0.25, { type: 'highpass', f: 3000, vol: 0.7, a: 0.001 });
    for (let i = 0; i < 9; i++) aTone(o, t + Math.random() * 0.25, 0.08 + Math.random() * 0.15, { f: 2500 + Math.random() * 4500, vol: 0.12 });
  },
  pancada(o, t) { aTone(o, t, 0.18, { f: 95, f2: 45, vol: 0.9 }); aNoise(o, t, 0.15, { f: 500, vol: 0.6, brown: true }); aNoise(o, t, 0.05, { f: 1800, vol: 0.25 }); },
  porta(o, t, x) {
    const c = SOUND.ctx, osc = c.createOscillator(); osc.type = 'sawtooth';
    const base = x.close ? 260 : 340; osc.frequency.setValueAtTime(base, t);
    for (let i = 1; i < 8; i++) osc.frequency.linearRampToValueAtTime(base * (0.8 + Math.random() * 0.5), t + i * 0.04);
    const fl = c.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.value = 1200; fl.Q.value = 6;
    const g = c.createGain(); aEnv(g.gain, t, 0.03, 0.3, 0.14); osc.connect(fl); fl.connect(g); g.connect(o); osc.start(t); osc.stop(t + 0.4);
    if (x.close) aTone(o, t + 0.3, 0.12, { f: 110, f2: 50, vol: 0.6 });
  },
  gemido(o, t, x) {
    const c = SOUND.ctx, dur = 0.7 + Math.random() * 0.9, f = (x.big ? 60 : 85) + Math.random() * 45;
    const osc = c.createOscillator(); osc.type = 'sawtooth'; osc.frequency.setValueAtTime(f, t);
    osc.frequency.linearRampToValueAtTime(f * (x.angry ? 1.5 : 1.15), t + dur * 0.35); osc.frequency.linearRampToValueAtTime(f * 0.8, t + dur);
    const lfo = c.createOscillator(); lfo.frequency.value = 5 + Math.random() * 4; const lg = c.createGain(); lg.gain.value = f * 0.06; lfo.connect(lg); lg.connect(osc.frequency);
    const f1 = c.createBiquadFilter(); f1.type = 'bandpass'; f1.frequency.value = x.angry ? 900 : 550; f1.Q.value = 3;
    const f2 = c.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = 1800;
    const g = c.createGain(); aEnv(g.gain, t, 0.12, dur, x.angry ? 0.5 : 0.35);
    osc.connect(f1); f1.connect(f2); f2.connect(g); g.connect(o);
    osc.start(t); lfo.start(t); osc.stop(t + dur + 0.2); lfo.stop(t + dur + 0.2);
    aNoise(o, t, dur, { type: 'bandpass', f: 1500, q: 1, vol: 0.06, a: 0.1 }); // respiração
  },
  mordida(o, t) { aNoise(o, t, 0.12, { f: 1500, vol: 0.9, a: 0.001 }); aNoise(o, t + 0.05, 0.2, { f: 500, vol: 0.7, brown: true }); aTone(o, t, 0.1, { f: 140, f2: 60, vol: 0.6 }); },
  dor(o, t) { aTone(o, t, 0.28, { type: 'sawtooth', f: 210, f2: 140, vol: 0.35, filter: 900, q: 4, a: 0.02 }); },
  passo(o, t, x) { aNoise(o, t, x.run ? 0.07 : 0.05, { f: x.grass ? 900 : 1500, f2: 300, vol: x.run ? 0.35 : 0.18, a: 0.002 }); },
  martelo(o, t) { aTone(o, t, 0.08, { type: 'triangle', f: 1600, f2: 1400, vol: 0.4 }); aTone(o, t, 0.1, { f: 160, f2: 70, vol: 0.6 }); aNoise(o, t, 0.04, { f: 3000, vol: 0.3 }); },
  machado(o, t) { aTone(o, t, 0.12, { f: 120, f2: 60, vol: 0.9 }); aNoise(o, t, 0.08, { type: 'bandpass', f: 1100, q: 2, vol: 0.6 }); },
  serra(o, t) { aNoise(o, t, 0.25, { type: 'bandpass', f: 2200, f2: 1500, q: 4, vol: 0.4, a: 0.05 }); },
  pegar(o, t) { aTone(o, t, 0.06, { f: 520, f2: 760, vol: 0.18 }); aNoise(o, t, 0.05, { type: 'bandpass', f: 1800, q: 1, vol: 0.12 }); },
  comer(o, t) { for (let i = 0; i < 3; i++) aNoise(o, t + i * 0.13, 0.06, { type: 'bandpass', f: 1200 + Math.random() * 800, q: 2, vol: 0.4 }); },
  beber(o, t) { for (let i = 0; i < 3; i++) aTone(o, t + i * 0.18, 0.1, { f: 260, f2: 520, vol: 0.35 }); },
  nivel(o, t) { [523, 659, 784, 1047].forEach((f, i) => aTone(o, t + i * 0.09, 0.22, { type: 'triangle', f, vol: 0.22 })); },
  alerta(o, t) { aTone(o, t, 0.25, { type: 'triangle', f: 330, f2: 300, vol: 0.18 }); },
  radio(o, t) { aNoise(o, t, 0.5, { type: 'bandpass', f: 1800, q: 0.7, vol: 0.18, a: 0.02 }); aTone(o, t + 0.45, 0.12, { type: 'square', f: 1000, vol: 0.06, filter: 2000 }); },
  arremesso(o, t) { aNoise(o, t, 0.3, { type: 'bandpass', f: 400, f2: 1600, q: 2, vol: 0.4, a: 0.05 }); },
  fogo(o, t) { aNoise(o, t, 0.6, { f: 1200, f2: 300, vol: 0.8, a: 0.01 }); aNoise(o, t, 1, { f: 300, vol: 0.5, brown: true, a: 0.05 }); },
  explosao(o, t) { aNoise(o, t, 1.8, { f: 900, f2: 60, vol: 1.6, brown: true, a: 0.002 }); aTone(o, t, 0.8, { f: 70, f2: 25, vol: 1.2, a: 0.002 }); aNoise(o, t, 0.3, { f: 5000, f2: 500, vol: 0.6 }); },
  trovao(o, t) { aNoise(o, t, 0.15, { type: 'highpass', f: 1500, vol: 0.35 }); aNoise(o, t + 0.05, 3.2, { f: 220, f2: 50, vol: 1.4, brown: true, a: 0.1 }); },
  batida(o, t) { aNoise(o, t, 0.5, { f: 1200, f2: 150, vol: 1.1, a: 0.001 }); aTone(o, t, 0.3, { f: 80, f2: 35, vol: 1 }); for (let i = 0; i < 5; i++) aTone(o, t + Math.random() * 0.2, 0.2, { type: 'triangle', f: 700 + Math.random() * 1800, vol: 0.12 }); },
  partida(o, t, x) {
    for (let i = 0; i < 4; i++) aTone(o, t + i * 0.13, 0.11, { type: 'sawtooth', f: 55, f2: 70, vol: 0.4, filter: 400 });
    if (x.ok) aTone(o, t + 0.55, 0.6, { type: 'sawtooth', f: 60, f2: 110, vol: 0.5, filter: 700 });
  },
  clique(o, t) { aTone(o, t, 0.03, { type: 'square', f: 900, vol: 0.2, filter: 1500 }); aTone(o, t + 0.25, 0.03, { type: 'square', f: 900, vol: 0.2, filter: 1500 }); },
  buzina(o, t) { aTone(o, t, 0.55, { type: 'square', f: 392, vol: 0.25, filter: 1800, a: 0.01 }); aTone(o, t, 0.55, { type: 'square', f: 494, vol: 0.22, filter: 1800, a: 0.01 }); },
  sirene(o, t) { const s = aTone(o, t, 3, { type: 'sawtooth', f: 650, vol: 0.3, filter: 2200, a: 0.05 }); for (let i = 0; i < 6; i++) { s.frequency.linearRampToValueAtTime(1250, t + i * 0.5 + 0.25); s.frequency.linearRampToValueAtTime(650, t + i * 0.5 + 0.5); } },
  alarme(o, t) { for (let i = 0; i < 4; i++) aTone(o, t + i * 0.25, 0.14, { type: 'square', f: i % 2 ? 1100 : 900, vol: 0.18, filter: 2500 }); },
  coracao(o, t) { aTone(o, t, 0.1, { f: 60, f2: 40, vol: 0.7 }); aTone(o, t + 0.22, 0.12, { f: 55, f2: 35, vol: 0.55 }); },
  ui(o, t) { aTone(o, t, 0.03, { f: 900, f2: 700, vol: 0.08 }); },
};
// intervalo mínimo entre repetições do mesmo som (s)
const SFX_GAP = { dor: 0.35, mordida: 0.2, passo: 0.22, gemido: 0.35, pancada: 0.12, acerto: 0.04, ui: 0.05, pegar: 0.05, vidro: 0.1, alarme: 0.9, coracao: 0.8, tiro: 0.03 };

/** Toca um som. x,y = posição no mundo (omitido = no jogador). */
function sfx(name, x, y, opt = {}) {
  const A = SOUND; if (!A.ctx || !A.on || A.ctx.state !== 'running' || !SFX[name]) return;
  if (G.speed > 1 && !['mordida', 'dor', 'alerta', 'nivel', 'ui'].includes(name)) return; // dormindo: silêncio
  const now = A.ctx.currentTime;
  if (now - (A.last[name] || 0) < (SFX_GAP[name] || 0)) return;
  let vol = opt.vol || 1, pan = 0;
  if (x != null && S) {
    const p = S.player, d = dist(x, y, p.x, p.y), R = opt.range || 30;
    if (d > R) return;
    vol *= Math.pow(1 - d / R, 1.6);
    if (isInside(x, y) !== isInside(p.x, p.y) && d > 2) vol *= 0.55; // paredes abafam
    pan = clamp((x - p.x) / 10, -0.85, 0.85);
    if (vol < 0.02) return;
  }
  A.last[name] = now;
  SFX[name](aOut(vol, pan), now + 0.01, opt);
}

/* ---------- sons contínuos (chuva, vento, motor, fogo, gerador, grilos) ---------- */
function loopSrc(buf, filterType, f, q) {
  const c = SOUND.ctx, s = c.createBufferSource(); s.buffer = buf; s.loop = true;
  const fl = c.createBiquadFilter(); fl.type = filterType; fl.frequency.value = f; fl.Q.value = q || 0.7;
  const g = c.createGain(); g.gain.value = 0;
  s.connect(fl); fl.connect(g); g.connect(SOUND.ambBus); s.start();
  return { s, fl, g };
}
function ensureLoops() {
  const A = SOUND, L = A.loops, c = A.ctx;
  if (L.ready) return;
  L.rain = loopSrc(A.noise, 'lowpass', 2600);
  L.wind = loopSrc(A.brown, 'lowpass', 400);
  L.fire = loopSrc(A.noise, 'bandpass', 900, 0.6);
  L.gen = (() => { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 58; const fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 300; const g = c.createGain(); g.gain.value = 0; o.connect(fl); fl.connect(g); g.connect(A.ambBus); o.start(); return { o, g }; })();
  // motor: duas ondas desafinadas num passa-baixa
  const eg = c.createGain(); eg.gain.value = 0; const ef = c.createBiquadFilter(); ef.type = 'lowpass'; ef.frequency.value = 500; ef.Q.value = 2; ef.connect(eg); eg.connect(A.ambBus);
  const e1 = c.createOscillator(); e1.type = 'sawtooth'; const e2 = c.createOscillator(); e2.type = 'square';
  e1.connect(ef); const e2g = c.createGain(); e2g.gain.value = 0.4; e2.connect(e2g); e2g.connect(ef); e1.start(); e2.start();
  L.engine = { e1, e2, ef, g: eg };
  L.ready = true;
}
let crackT = 0, cricketT = 0, beatT = 0, groanT = 0;
function audioFrame(dt) {
  const A = SOUND; if (!A.ctx || A.ctx.state !== 'running' || !S || !A.on) return;
  ensureLoops();
  const L = A.loops, t = A.ctx.currentTime, p = S.player;
  const set = (param, v, tc = 0.3) => param.setTargetAtTime(v, t, tc);
  const quiet = G.paused || S.dead ? 0.25 : 1;
  const inside = isInside(p.x, p.y) || !!p.inCar;
  // chuva e vento
  set(L.rain.g.gain, S.rain * (inside ? 0.06 : 0.16) * quiet);
  set(L.rain.fl.frequency, inside ? 800 : 2600);
  const windy = S.weather.k === 'tempestade' ? 0.22 : S.weather.k === 'chuva' ? 0.1 : 0.05;
  set(L.wind.g.gain, windy * (inside ? 0.4 : 1) * quiet, 1);
  // fogo mais próximo
  let fd = 99;
  for (const k of Object.keys(S.fires)) { const i = +k, d = dist(i % MAP_W + 0.5, Math.floor(i / MAP_W) + 0.5, p.x, p.y); if (d < fd) fd = d; }
  for (const [k, o] of Object.entries(S.objs)) if (o.t === 'fogueira' && o.lit) { const i = +k, d = dist(i % MAP_W + 0.5, Math.floor(i / MAP_W) + 0.5, p.x, p.y) + 3; if (d < fd) fd = d; }
  const fv = fd < 16 ? Math.pow(1 - fd / 16, 1.5) : 0;
  set(L.fire.g.gain, fv * 0.25 * quiet);
  crackT -= dt; if (fv > 0.05 && crackT <= 0) { crackT = 0.05 + Math.random() * 0.25; const o = aOut(fv * 0.5, 0); aNoise(o, t, 0.02, { type: 'highpass', f: 2000, vol: 0.6 + Math.random() * 0.6, a: 0.001 }); }
  // gerador
  let gd = 99; for (const [k, o] of Object.entries(S.objs)) if (o.t === 'gerador' && o.on) { const i = +k; gd = Math.min(gd, dist(i % MAP_W, Math.floor(i / MAP_W), p.x, p.y)); }
  set(L.gen.g.gain, (gd < 20 ? Math.pow(1 - gd / 20, 1.4) * 0.12 : 0) * quiet);
  // motor
  const v = p.inCar && p.inCar.on ? p.inCar : null;
  if (v) {
    const sp = Math.abs(v.sp) / VT[v.t].spd, base = VT[v.t].moto ? 70 : v.t === 'caminhao' || v.t === 'trator' ? 32 : 42;
    set(L.engine.e1.frequency, base + sp * base * 2.2, 0.15); set(L.engine.e2.frequency, (base + sp * base * 2.2) * 1.01, 0.15);
    set(L.engine.ef.frequency, 300 + sp * 900, 0.2); set(L.engine.g.gain, (0.1 + sp * 0.1) * quiet, 0.1);
  } else set(L.engine.g.gain, 0, 0.2);
  if (G.paused || S.dead) return;
  // grilos à noite, ao ar livre
  cricketT -= dt;
  if (cricketT <= 0) { cricketT = 0.6 + Math.random() * 1.6; if (daylight() < 0.3 && S.rain < 0.2 && !inside && G.speed === 1) { const o = aOut(0.05, rnd(-0.6, 0.6)); const f = 4200 + Math.random() * 600; for (let i = 0; i < 3; i++) aTone(o, t + i * 0.06, 0.03, { f, vol: 0.5 }); } }
  // coração quando a saúde está baixa
  beatT -= dt; if (p.hp < 30 && beatT <= 0) { beatT = 0.6 + p.hp / 60; sfx('coracao'); }
  // gemidos dos zumbis próximos
  groanT -= dt;
  if (groanT <= 0) {
    groanT = 0.4 + Math.random() * 0.6;
    const near = []; for (const z of S.zs) if (Math.abs(z.x - p.x) < 18 && Math.abs(z.y - p.y) < 18 && !(z.down > 0)) near.push(z);
    if (near.length) { const z = near[Math.floor(Math.random() * near.length)]; if (z.st === 'chase' || Math.random() < 0.45) sfx('gemido', z.x, z.y, { range: 18, angry: z.st === 'chase', big: z.t === 'brutamontes' }); }
  }
}
