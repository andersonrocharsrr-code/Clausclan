/* Motor de som do Imersa.
   Ambientes, músicas e efeitos são gerados na hora com Web Audio (não precisam de arquivos).
   Sons do usuário (gravados ou enviados) entram com o id "u:<id da mídia>". */
const Som = (() => {
  let ctx, bus, master, verb, noise = {};
  let masterVol = 0.9, muted = false;
  const userLoader = { get: null }; // função async (mediaId) => Blob, definida pelo app
  const bufCache = new Map();

  /* ---------- catálogo ---------- */
  const CAT = [
    // ambientes (tocam em loop)
    { id: 'b:rain', name: 'Chuva', kind: 'amb', icon: 'rain', tags: 'natureza clima água' },
    { id: 'b:storm', name: 'Tempestade', kind: 'amb', icon: 'zap', tags: 'clima chuva trovão' },
    { id: 'b:wind', name: 'Vento', kind: 'amb', icon: 'wind', tags: 'natureza clima' },
    { id: 'b:sea', name: 'Mar e ondas', kind: 'amb', icon: 'waves', tags: 'mar praia água' },
    { id: 'b:river', name: 'Riacho', kind: 'amb', icon: 'droplet', tags: 'natureza água rio' },
    { id: 'b:forest', name: 'Floresta à noite', kind: 'amb', icon: 'moon', tags: 'natureza grilos noite coruja' },
    { id: 'b:birds', name: 'Manhã com pássaros', kind: 'amb', icon: 'bird', tags: 'natureza dia manhã' },
    { id: 'b:fire', name: 'Fogueira', kind: 'amb', icon: 'flame', tags: 'fogo lareira acampamento' },
    { id: 'b:cave', name: 'Caverna', kind: 'amb', icon: 'mountain', tags: 'gotas eco subterrâneo' },
    { id: 'b:heart', name: 'Batimentos', kind: 'amb', icon: 'heart', tags: 'suspense medo tensão' },
    { id: 'b:void', name: 'Vazio misterioso', kind: 'amb', icon: 'spark', tags: 'mistério espaço sonho' },
    // músicas
    { id: 'b:m_calm', name: 'Noturno calmo', kind: 'mus', icon: 'music', tags: 'calma noite paz' },
    { id: 'b:m_hope', name: 'Aurora', kind: 'mus', icon: 'music', tags: 'esperança alegria aventura' },
    { id: 'b:m_sad', name: 'Melancolia', kind: 'mus', icon: 'music', tags: 'triste saudade' },
    { id: 'b:m_mystery', name: 'Mistério', kind: 'mus', icon: 'music', tags: 'segredo enigma' },
    { id: 'b:m_tension', name: 'Tensão', kind: 'mus', icon: 'music', tags: 'perigo medo ação' },
    // efeitos (tocam uma vez)
    { id: 'b:thunder', name: 'Trovão', kind: 'fx', icon: 'zap', tags: 'tempestade clima' },
    { id: 'b:steps', name: 'Passos', kind: 'fx', icon: 'steps', tags: 'andar caminhar' },
    { id: 'b:door', name: 'Porta rangendo', kind: 'fx', icon: 'door', tags: 'casa abrir' },
    { id: 'b:knock', name: 'Batidas na porta', kind: 'fx', icon: 'door', tags: 'bater visita' },
    { id: 'b:owl', name: 'Coruja', kind: 'fx', icon: 'bird', tags: 'noite floresta' },
    { id: 'b:wolf', name: 'Lobo uivando', kind: 'fx', icon: 'moon', tags: 'noite floresta medo' },
    { id: 'b:bell', name: 'Sino', kind: 'fx', icon: 'bell', tags: 'igreja castelo' },
    { id: 'b:branch', name: 'Galho quebrando', kind: 'fx', icon: 'branch', tags: 'floresta passo' },
    { id: 'b:heartbeat', name: 'Coração', kind: 'fx', icon: 'heart', tags: 'susto medo' },
    { id: 'b:drop', name: 'Gota d\'água', kind: 'fx', icon: 'droplet', tags: 'água caverna' },
    { id: 'b:magic', name: 'Magia', kind: 'fx', icon: 'spark', tags: 'fantasia feitiço brilho' },
    { id: 'b:whoosh', name: 'Vulto passando', kind: 'fx', icon: 'wind', tags: 'susto vento rápido' },
    { id: 'b:glass', name: 'Vidro quebrando', kind: 'fx', icon: 'glass', tags: 'janela quebrar' },
    { id: 'b:clock', name: 'Relógio', kind: 'fx', icon: 'clock', tags: 'tempo tic-tac' },
    { id: 'b:sword', name: 'Espada', kind: 'fx', icon: 'sword', tags: 'batalha luta metal' },
  ];
  const byId = Object.fromEntries(CAT.map((s) => [s.id, s]));

  /* ---------- base ---------- */
  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return ctx; }
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 4;
    master = ctx.createGain(); master.gain.value = muted ? 0 : masterVol;
    bus = ctx.createGain();
    bus.connect(master); master.connect(comp); comp.connect(ctx.destination);
    verb = ctx.createConvolver(); verb.buffer = impulse(3.2, 2.4);
    const vg = ctx.createGain(); vg.gain.value = 0.55; verb.connect(vg); vg.connect(bus);
    noise.white = makeNoise('white'); noise.pink = makeNoise('pink'); noise.brown = makeNoise('brown');
    return ctx;
  }
  function impulse(sec, decay) {
    const len = ctx.sampleRate * sec, b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay); }
    return b;
  }
  function makeNoise(type) {
    const len = ctx.sampleRate * 6, b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (type === 'white') d[i] = w * 0.5;
      else if (type === 'pink') {
        b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852;
        b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
        d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926;
      } else { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
    }
    return b;
  }
  const now = () => ctx.currentTime;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  function G(v = 1) { const g = ctx.createGain(); g.gain.value = v; return g; }
  function F(type, freq, Q = 1) { const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = Q; return f; }
  function chain(...n) { for (let i = 0; i < n.length - 1; i++) n[i].connect(n[i + 1]); return n[n.length - 1]; }
  function noiseSrc(type, t = now(), dur) {
    const s = ctx.createBufferSource(); s.buffer = noise[type]; s.loop = true;
    s.start(t, Math.random() * 5); if (dur) s.stop(t + dur); return s;
  }
  function osc(type, freq, t = now(), dur) {
    const o = ctx.createOscillator(); o.type = type; o.frequency.value = freq; o.start(t); if (dur) o.stop(t + dur); return o;
  }
  // envelope: sobe em "a" segundos até "peak" e cai até quase zero em "d"
  function env(g, t, a, peak, d) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
    return g;
  }
  function lfo(param, freq, depth, base, t = now(), dur) {
    const o = osc('sine', freq, t, dur), g = G(depth); o.connect(g); g.connect(param); if (base != null) param.value = base; return o;
  }

  /* Cada som toca dentro de uma "voz": dry vai com direção (pan) para o bus, wet vai para o eco (reverb). */
  // ajuste de volume por som, medido para que todos soem parecidos no mesmo volume
  const LEVEL = { forest: 6, birds: 5, river: 2.5, wind: 2, void: 1.5, m_tension: 1.5, door: 3, clock: 4, sword: 2.5, whoosh: 2.5, drop: 2, glass: 1.5, owl: 0.6, wolf: 0.55, bell: 0.7 };
  function voice(vol = 1, pan = 0, level = 1) {
    const dry = G(1), wet = G(1), gd = G(vol * level), gw = G(vol * level), send = G(0.18);
    const p = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (p) { p.pan.value = pan; dry.connect(gd); gd.connect(p); p.connect(bus); } else { dry.connect(gd); gd.connect(bus); }
    dry.connect(send); send.connect(wet); wet.connect(gw); gw.connect(verb);
    return {
      dry, wet, srcs: [], timers: [], dead: false,
      setVol(v, ramp = 0.4) { v *= level; [gd, gw].forEach((g) => { g.gain.cancelScheduledValues(now()); g.gain.setValueAtTime(g.gain.value, now()); g.gain.linearRampToValueAtTime(Math.max(0.0001, v), now() + ramp); }); },
      fadeIn(v, sec) { v *= level; [gd, gw].forEach((g) => { g.gain.setValueAtTime(0.0001, now()); g.gain.linearRampToValueAtTime(Math.max(0.0001, v), now() + sec); }); },
      kill(sec = 0.1) {
        this.dead = true; this.timers.forEach(clearTimeout);
        [gd, gw].forEach((g) => { g.gain.cancelScheduledValues(now()); g.gain.setValueAtTime(g.gain.value, now()); g.gain.linearRampToValueAtTime(0.0001, now() + sec); });
        setTimeout(() => { this.srcs.forEach((s) => { try { s.stop(); } catch (e) { /* já parou */ } }); [gd, gw, dry, wet].forEach((n) => n.disconnect()); if (p) p.disconnect(); }, sec * 1000 + 150);
      },
      keep(...s) { this.srcs.push(...s); return s[0]; },
      // repete fn com intervalo aleatório (para gotas, estalos, pássaros…)
      every(min, max, fn, first = 0) {
        const loop = () => { if (this.dead) return; fn(); this.timers.push(setTimeout(loop, rnd(min, max) * 1000)); };
        this.timers.push(setTimeout(loop, first * 1000));
      },
    };
  }

  /* ---------- efeitos (uma vez) ---------- */
  const FX = {
    thunder(v, t, k = 1) {
      const c = noiseSrc('white', t, 0.5), cg = env(G(), t, 0.005, 0.6 * k, 0.35);
      chain(c, F('highpass', 1200), cg, v.dry);
      const r = noiseSrc('brown', t, 7), lp = F('lowpass', 900), rg = G(0);
      lp.frequency.setValueAtTime(900, t); lp.frequency.exponentialRampToValueAtTime(110, t + 4);
      rg.gain.setValueAtTime(0.0001, t); rg.gain.linearRampToValueAtTime(1.2 * k, t + 0.08);
      let tt = t + 0.3; for (let i = 0; i < 4; i++) { rg.gain.setTargetAtTime(rnd(0.4, 1) * k, tt, 0.15); tt += rnd(0.3, 0.8); }
      rg.gain.setTargetAtTime(0.0001, tt, 1.1);
      chain(r, lp, rg, v.dry); rg.connect(v.wet);
      v.keep(c, r); return 7;
    },
    steps(v, t) {
      for (let i = 0; i < 5; i++) {
        const s = t + i * 0.52 + rnd(-0.03, 0.03);
        const a = noiseSrc('brown', s, 0.3); chain(a, F('bandpass', rnd(280, 420), 1.2), env(G(), s, 0.004, 1.4, 0.14), v.dry);
        const b = noiseSrc('white', s, 0.2); chain(b, F('highpass', 2500), env(G(), s + 0.01, 0.004, 0.18, 0.07), v.dry);
        v.keep(a, b);
      }
      return 3.2;
    },
    door(v, t) {
      const o = osc('sawtooth', 90, t, 2.4), curve = new Float32Array(40);
      for (let i = 0; i < 40; i++) curve[i] = 70 + 60 * Math.sin(i / 6) + rnd(-15, 15) + i * 1.5;
      o.frequency.setValueCurveAtTime(curve, t, 2.2);
      const g = G(0); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.35, t + 0.2); g.gain.setValueAtTime(0.35, t + 1.8); g.gain.linearRampToValueAtTime(0.0001, t + 2.3);
      const f1 = F('bandpass', 900, 7), f2 = F('bandpass', 2300, 5);
      o.connect(f1); o.connect(f2); f1.connect(g); f2.connect(g); g.connect(v.dry); g.connect(v.wet);
      v.keep(o); return 2.6;
    },
    knock(v, t) {
      [0, 0.26, 0.52, 1.3, 1.56].forEach((d) => {
        const s = t + d, o = osc('sine', 150, s, 0.25);
        o.frequency.setValueAtTime(160, s); o.frequency.exponentialRampToValueAtTime(80, s + 0.1);
        chain(o, env(G(), s, 0.002, 1, 0.16), v.dry);
        const n = noiseSrc('brown', s, 0.15); chain(n, F('lowpass', 900), env(G(), s, 0.002, 1.2, 0.08), v.dry);
        v.keep(o, n);
      });
      return 2.2;
    },
    owl(v, t) {
      [[0, 0.42], [0.75, 0.22], [1.02, 0.5]].forEach(([d, len]) => {
        const s = t + d, o = osc('sine', 390, s, len + 0.2);
        o.frequency.setValueAtTime(400, s); o.frequency.linearRampToValueAtTime(340, s + len);
        lfo(o.frequency, 6, 5, null, s, len + 0.2);
        const g = G(0); g.gain.setValueAtTime(0.0001, s); g.gain.linearRampToValueAtTime(0.5, s + 0.06); g.gain.setValueAtTime(0.5, s + len - 0.08); g.gain.exponentialRampToValueAtTime(0.0001, s + len + 0.1);
        chain(o, F('lowpass', 900), g); g.connect(v.dry); g.connect(v.wet); v.keep(o);
      });
      return 2.5;
    },
    wolf(v, t) {
      const pts = [[0, 300], [0.9, 540], [2.2, 590], [3.3, 430], [3.9, 360]];
      const mk = (type, mul, vol) => {
        const o = osc(type, 300 * mul, t, 4.2);
        pts.forEach(([d, f], i) => i ? o.frequency.linearRampToValueAtTime(f * mul, t + d) : o.frequency.setValueAtTime(f * mul, t));
        lfo(o.frequency, 5.2, 7 * mul, null, t + 0.6, 3.6);
        const g = G(0); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.5); g.gain.setValueAtTime(vol, t + 3.2); g.gain.linearRampToValueAtTime(0.0001, t + 4.1);
        chain(o, F('lowpass', 1500), g); g.connect(v.dry); g.connect(v.wet); v.keep(o);
      };
      mk('sawtooth', 1, 0.09); mk('sine', 1, 0.35); mk('sine', 2, 0.06);
      return 5;
    },
    bell(v, t) {
      const f = 196;
      [[0.5, 0.5, 6], [1, 0.6, 5], [1.19, 0.35, 4], [1.56, 0.25, 3], [2, 0.3, 3], [2.51, 0.15, 2], [2.66, 0.12, 2], [3.01, 0.1, 1.6], [4.1, 0.06, 1.2]].forEach(([m, a, d]) => {
        const o = osc('sine', f * m, t, d + 0.1), g = env(G(), t, 0.004, a * 0.5, d);
        o.connect(g); g.connect(v.dry); g.connect(v.wet); v.keep(o);
      });
      return 6.5;
    },
    branch(v, t) {
      [[0, 0.9], [0.06, 0.5], [0.13, 0.3]].forEach(([d, a]) => {
        const s = t + d, n = noiseSrc('white', s, 0.1);
        chain(n, F('highpass', rnd(1400, 2400)), env(G(), s, 0.001, a, 0.05), v.dry); v.keep(n);
      });
      const b = noiseSrc('brown', t, 0.3); chain(b, F('lowpass', 500), env(G(), t, 0.002, 1, 0.12), v.dry); v.keep(b);
      return 1;
    },
    heartbeat(v, t, n = 3) {
      for (let i = 0; i < n; i++) beat(v, t + i * 0.86);
      return n * 0.86 + 0.5;
    },
    drop(v, t, k = 1) {
      [0, rnd(0.35, 0.6)].forEach((d, i) => {
        const s = t + d, o = osc('sine', 1400, s, 0.4);
        o.frequency.setValueAtTime(rnd(1100, 1600), s); o.frequency.exponentialRampToValueAtTime(rnd(380, 520), s + 0.12);
        const g = env(G(), s, 0.002, (i ? 0.25 : 0.45) * k, 0.22); o.connect(g); g.connect(v.dry); g.connect(v.wet); v.keep(o);
      });
      return 2;
    },
    magic(v, t) {
      [72, 76, 79, 84, 86, 88, 91, 96].forEach((m, i) => {
        const s = t + i * 0.07;
        [['sine', 1, 0.2], ['triangle', 2, 0.05]].forEach(([w, mul, a]) => {
          const o = osc(w, mtof(m) * mul, s, 1.6), g = env(G(), s, 0.005, a, 1.4); o.connect(g); g.connect(v.dry); g.connect(v.wet); v.keep(o);
        });
      });
      const n = noiseSrc('white', t, 1.8), g = G(0);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.12, t + 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.7);
      chain(n, F('highpass', 7000), g); g.connect(v.wet); v.keep(n);
      return 3;
    },
    whoosh(v, t) {
      const n = noiseSrc('white', t, 1.2), f = F('bandpass', 300, 1.6), g = G(0);
      f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(2600, t + 0.45); f.frequency.exponentialRampToValueAtTime(400, t + 1);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(1, t + 0.45); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
      if (ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.setValueAtTime(-1, t); p.pan.linearRampToValueAtTime(1, t + 1); chain(n, f, g, p, v.dry); } else chain(n, f, g, v.dry);
      v.keep(n); return 1.5;
    },
    glass(v, t) {
      const n = noiseSrc('white', t, 0.6); chain(n, F('highpass', 3000), env(G(), t, 0.001, 0.9, 0.45), v.dry); v.keep(n);
      for (let i = 0; i < 16; i++) {
        const s = t + Math.pow(Math.random(), 2) * 0.8, o = osc('sine', rnd(2800, 7500), s, 0.4), g = env(G(), s, 0.001, rnd(0.03, 0.12), rnd(0.08, 0.3));
        o.connect(g); g.connect(v.dry); g.connect(v.wet); v.keep(o);
      }
      return 1.8;
    },
    clock(v, t) {
      for (let i = 0; i < 8; i++) {
        const s = t + i * 0.5, n = noiseSrc('white', s, 0.05);
        chain(n, F('bandpass', i % 2 ? 2100 : 3100, 6), env(G(), s, 0.001, 1.2, 0.03), v.dry); v.keep(n);
      }
      return 4.3;
    },
    sword(v, t) {
      const n = noiseSrc('white', t, 0.7), f = F('bandpass', 1500, 3), g = G(0);
      f.frequency.setValueAtTime(1500, t); f.frequency.exponentialRampToValueAtTime(6500, t + 0.45);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.5, t + 0.35); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
      chain(n, f, g, v.dry); v.keep(n);
      [2480, 3720, 5210, 6900].forEach((fr, i) => { const o = osc('sine', fr, t + 0.42, 1.6), e = env(G(), t + 0.42, 0.002, 0.12 / (i + 1), 1.4); o.connect(e); e.connect(v.dry); e.connect(v.wet); v.keep(o); });
      return 2.3;
    },
  };
  function beat(v, t, k = 1) {
    [[0, 1], [0.27, 0.6]].forEach(([d, a]) => {
      const s = t + d, o = osc('sine', 70, s, 0.3);
      o.frequency.setValueAtTime(75, s); o.frequency.exponentialRampToValueAtTime(38, s + 0.14);
      chain(o, env(G(), s, 0.006, a * 1.3 * k, 0.2), v.dry); v.keep(o);
    });
  }

  /* ---------- ambientes (loop) ---------- */
  const AMB = {
    rain(v, k = 1) {
      chain(v.keep(noiseSrc('pink')), F('highpass', 500), F('lowpass', 7000), G(0.55 * k), v.dry);
      chain(v.keep(noiseSrc('brown')), F('lowpass', 300), G(0.3 * k), v.dry);
      v.every(0.03, 0.12, () => {
        const s = now() + 0.05, n = noiseSrc('white', s, 0.06);
        const p = ctx.createStereoPanner ? ctx.createStereoPanner() : G(1); if (p.pan) p.pan.value = rnd(-0.9, 0.9);
        chain(n, F('highpass', rnd(2000, 5000)), env(G(), s, 0.001, rnd(0.03, 0.14) * k, 0.03), p, v.dry);
      });
    },
    storm(v) {
      AMB.rain(v, 1.4); AMB.wind(v, 0.7);
      v.every(10, 24, () => { FX.thunder(v, now() + 0.05, rnd(0.5, 1)); }, rnd(3, 6));
    },
    wind(v, k = 1) {
      const f = F('bandpass', 500, 0.8), g = G(0.45 * k);
      chain(v.keep(noiseSrc('pink')), f, g, v.dry);
      v.keep(lfo(f.frequency, 0.07, 280, 520)); v.keep(lfo(g.gain, 0.11, 0.25 * k, 0.45 * k));
      const f2 = F('bandpass', 1300, 9), g2 = G(0.06 * k);
      chain(v.keep(noiseSrc('pink')), f2, g2, v.dry); v.keep(lfo(f2.frequency, 0.05, 350, 1300)); v.keep(lfo(g2.gain, 0.09, 0.05 * k, 0.06 * k));
    },
    sea(v) {
      const lp = F('lowpass', 500), g = G(0.1), foam = G(0.02);
      chain(v.keep(noiseSrc('brown')), lp, g, v.dry);
      chain(v.keep(noiseSrc('pink')), F('highpass', 1800), foam, v.dry);
      const wave = () => {
        const t = now() + 0.05, up = rnd(2.2, 3.2), down = rnd(3.5, 5.5), peak = rnd(0.7, 1.1);
        g.gain.setTargetAtTime(peak, t, up / 3); g.gain.setTargetAtTime(0.12, t + up, down / 3);
        lp.frequency.setTargetAtTime(1500, t, up / 3); lp.frequency.setTargetAtTime(380, t + up, down / 3);
        foam.gain.setTargetAtTime(0.16 * peak, t + up * 0.8, 0.4); foam.gain.setTargetAtTime(0.015, t + up + 0.6, down / 3);
        return up + down;
      };
      const loop = () => { if (v.dead) return; v.timers.push(setTimeout(loop, wave() * 1000)); }; loop();
    },
    river(v) {
      const g = G(0.4); chain(v.keep(noiseSrc('pink')), F('bandpass', 1100, 0.7), g, v.dry);
      v.keep(lfo(g.gain, 2.7, 0.08, 0.4)); v.keep(lfo(g.gain, 0.31, 0.1));
      chain(v.keep(noiseSrc('white')), F('highpass', 3200), G(0.05), v.dry);
      v.every(0.08, 0.35, () => {
        const s = now() + 0.05, o = osc('sine', rnd(500, 1200), s, 0.15);
        o.frequency.exponentialRampToValueAtTime(rnd(900, 2200), s + 0.06); chain(o, env(G(), s, 0.003, rnd(0.01, 0.04), 0.06), v.dry);
      });
    },
    forest(v) {
      [[4400, 0.85, -0.6], [4900, 1.15, 0.5], [4150, 1.4, 0.1]].forEach(([fr, per, pan], i) => {
        const p = ctx.createStereoPanner ? ctx.createStereoPanner() : G(1); if (p.pan) p.pan.value = pan; p.connect(v.dry);
        v.every(per * 0.9, per * 1.1, () => {
          const s = now() + 0.05;
          for (let j = 0; j < 3; j++) { const o = osc('sine', fr, s + j * 0.055, 0.05); chain(o, env(G(), s + j * 0.055, 0.004, 0.035, 0.035), p); }
        }, i * 0.3);
      });
      chain(v.keep(noiseSrc('pink')), F('bandpass', 380, 0.7), G(0.09), v.dry);
      v.every(18, 35, () => FX.owl({ ...v, dry: half(v.dry, 0.06), wet: half(v.wet, 0.1), keep: () => {} }, now() + 0.05), rnd(6, 12));
    },
    birds(v) {
      chain(v.keep(noiseSrc('pink')), F('highpass', 1500), G(0.035), v.dry);
      v.every(0.4, 2.2, () => {
        const s = now() + 0.05, base = rnd(2400, 4600), n = Math.floor(rnd(2, 6)), len = rnd(0.05, 0.12), sweep = rnd(-1200, 1500);
        const p = ctx.createStereoPanner ? ctx.createStereoPanner() : G(1); if (p.pan) p.pan.value = rnd(-0.8, 0.8); p.connect(v.dry); p.connect(v.wet);
        for (let j = 0; j < n; j++) {
          const st = s + j * (len + rnd(0.02, 0.08)), o = osc('sine', base, st, len + 0.05);
          o.frequency.setValueAtTime(base, st); o.frequency.linearRampToValueAtTime(Math.max(800, base + sweep), st + len);
          chain(o, env(G(), st, 0.008, rnd(0.04, 0.1), len), p);
        }
      });
    },
    fire(v) {
      const g = G(0.5); chain(v.keep(noiseSrc('brown')), F('lowpass', 380), g, v.dry); v.keep(lfo(g.gain, 0.4, 0.12, 0.5));
      chain(v.keep(noiseSrc('pink')), F('bandpass', 900, 0.5), G(0.04), v.dry);
      v.every(0.02, 0.22, () => {
        const s = now() + 0.04, n = noiseSrc('white', s, 0.05);
        chain(n, F('highpass', rnd(1500, 4500)), env(G(), s, 0.001, rnd(0.04, 0.45), rnd(0.004, 0.03)), v.dry);
      });
    },
    cave(v) {
      [55, 82.6].forEach((fr) => { chain(v.keep(osc('sine', fr)), G(0.06), v.dry); });
      chain(v.keep(noiseSrc('brown')), F('lowpass', 140), G(0.22), v.dry);
      v.every(1.2, 3.8, () => FX.drop({ ...v, keep: () => {} }, now() + 0.05, rnd(0.25, 0.7)));
    },
    heart(v) { v.every(0.86, 0.86, () => beat(v, now() + 0.05, 0.9)); },
    void(v) {
      const lp = F('lowpass', 300, 4);
      [55, 55.4, 82.4, 110.3].forEach((fr) => chain(v.keep(osc('sawtooth', fr)), G(0.05), lp));
      lp.connect(v.dry); lp.connect(v.wet); v.keep(lfo(lp.frequency, 0.05, 180, 320));
      const hi = G(0.02); chain(v.keep(osc('sine', 1760)), hi, v.wet); v.keep(lfo(hi.gain, 0.2, 0.02, 0.02));
      chain(v.keep(osc('sine', 1318.5)), G(0.012), v.wet);
    },
  };
  function half(node, k) { const g = G(k); g.connect(node); return g; }

  /* ---------- músicas ---------- */
  const MUS = {
    m_calm: { chords: [[48, 55, 64, 71], [45, 52, 60, 67], [41, 48, 57, 64], [43, 50, 59, 62]], dur: 6, wave: 'sine', cut: 1800, arp: 0.75, arpP: 0.6 },
    m_hope: { chords: [[50, 57, 62, 66], [45, 52, 61, 64], [47, 54, 62, 66], [43, 50, 59, 62]], dur: 4, wave: 'triangle', cut: 2400, arp: 0.5, arpP: 0.8 },
    m_sad: { chords: [[45, 52, 57, 60], [41, 48, 57, 60], [48, 55, 60, 64], [43, 50, 55, 59]], dur: 5.5, wave: 'triangle', cut: 1400, arp: 1.1, arpP: 0.55 },
    m_mystery: { chords: [[38, 45, 50, 53, 64], [38, 44, 50, 53, 63], [36, 43, 50, 51, 62], [37, 44, 49, 53, 61]], dur: 7, wave: 'sine', cut: 1200, arp: 0.9, arpP: 0.3 },
    m_tension: { chords: [[33, 40, 45, 46], [33, 39, 45, 46], [34, 41, 46, 47], [33, 40, 45, 51]], dur: 4, wave: 'sawtooth', cut: 700, pulse: true },
  };
  function music(v, cfg) {
    const lp = F('lowpass', cfg.cut, 0.7); lp.connect(v.dry); lp.connect(v.wet);
    let i = 0, t = now() + 0.1;
    const tick = () => {
      if (v.dead) return;
      while (t < now() + cfg.dur * 1.5) {
        const ch = cfg.chords[i % cfg.chords.length], end = t + cfg.dur * 1.2;
        ch.forEach((m) => [-6, 6].forEach((det) => {
          const o = osc(cfg.wave, mtof(m), t, cfg.dur * 1.25); o.detune.value = det;
          const g = G(0); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(cfg.pulse ? 0.02 : 0.045, t + cfg.dur * 0.3); g.gain.setValueAtTime(cfg.pulse ? 0.02 : 0.045, end - cfg.dur * 0.3); g.gain.linearRampToValueAtTime(0.0001, end);
          o.connect(g); g.connect(lp);
        }));
        const b = osc('sine', mtof(ch[0] - 12), t, cfg.dur * 1.2), bg = G(0);
        bg.gain.setValueAtTime(0.0001, t); bg.gain.linearRampToValueAtTime(0.12, t + 1); bg.gain.linearRampToValueAtTime(0.0001, end); b.connect(bg); bg.connect(v.dry);
        if (cfg.arp) {
          for (let s = t; s < t + cfg.dur - 0.1; s += cfg.arp) {
            if (Math.random() > cfg.arpP) continue;
            const m = ch[Math.floor(Math.random() * ch.length)] + 12 + (Math.random() < 0.4 ? 12 : 0);
            const o = osc('sine', mtof(m), s, 2.2), o2 = osc('triangle', mtof(m) * 2, s, 1.2);
            const g = env(G(), s, 0.004, 0.07, 1.9), g2 = env(G(), s, 0.004, 0.012, 0.9);
            o.connect(g); o2.connect(g2); [g, g2].forEach((n) => { n.connect(v.dry); n.connect(v.wet); });
          }
        }
        if (cfg.pulse) {
          for (let s = t; s < t + cfg.dur - 0.01; s += 0.25) {
            const o = osc('sawtooth', mtof(ch[0]), s, 0.25), f = F('lowpass', 400, 4);
            f.frequency.setValueAtTime(900, s); f.frequency.exponentialRampToValueAtTime(150, s + 0.18);
            chain(o, f, env(G(), s, 0.004, (Math.round((s - t) * 4) % 4 === 0) ? 0.22 : 0.12, 0.18), v.dry);
          }
        }
        t += cfg.dur; i++;
      }
      v.timers.push(setTimeout(tick, 900));
    };
    tick();
  }

  /* ---------- sons do usuário ---------- */
  async function userBuffer(id) {
    if (bufCache.has(id)) return bufCache.get(id);
    const p = (async () => {
      const blob = await userLoader.get(id.slice(2));
      if (!blob) throw new Error('som não encontrado');
      const arr = await blob.arrayBuffer();
      return await new Promise((res, rej) => ctx.decodeAudioData(arr, res, rej));
    })();
    bufCache.set(id, p);
    p.catch(() => bufCache.delete(id));
    return p;
  }
  async function userSource(v, id, loop) {
    const buf = await userBuffer(id);
    if (v.dead) return 0;
    const s = ctx.createBufferSource(); s.buffer = buf; s.loop = loop; s.connect(v.dry); s.start(now() + 0.02); v.keep(s);
    return buf.duration;
  }

  /* ---------- API pública ---------- */
  function startLoop(id, vol, pan = 0, fade = 2.5) {
    init();
    const key = id.slice(2), v = voice(vol, pan, LEVEL[key] || 1); v.fadeIn(vol, fade);
    if (id.startsWith('u:')) userSource(v, id, true).catch(() => {});
    else if (AMB[key]) AMB[key](v);
    else if (MUS[key]) music(v, MUS[key]);
    else if (FX[key]) v.every(4, 8, () => FX[key](v, now() + 0.05));
    return v;
  }
  async function playFx(id, vol = 0.9, pan = 0) {
    init();
    const key = id.slice(2), v = voice(vol, pan, LEVEL[key] || 1);
    let dur = 3;
    if (id.startsWith('u:')) dur = await userSource(v, id, false).catch(() => 0);
    else if (FX[key]) dur = FX[key](v, now() + 0.03);
    else { v.kill(0); return startPreviewLoop(id, vol); }
    v.timers.push(setTimeout(() => v.kill(0.3), (dur + 1.5) * 1000));
    return v;
  }
  function startPreviewLoop(id, vol) { const v = startLoop(id, vol, 0, 0.6); setTimeout(() => v.kill(1.2), 7000); return v; }

  // camadas de ambiente ativas: { id: voice }
  let amb = {}, mus = null, musId = null, preview = null;
  function setAmbience(layers, fade = 3) {
    init();
    const want = Object.fromEntries(layers.map((l) => [l.id, l.vol]));
    for (const id of Object.keys(amb)) if (!(id in want)) { amb[id].kill(fade); delete amb[id]; }
    for (const [id, vol] of Object.entries(want)) { if (amb[id]) amb[id].setVol(vol, 1.5); else amb[id] = startLoop(id, vol, 0, fade); }
  }
  function setMusic(id, vol = 0.5, fade = 4) {
    init();
    if (id === musId) { if (mus) mus.setVol(vol, 1.5); return; }
    if (mus) mus.kill(fade);
    mus = id ? startLoop(id, vol, 0, fade) : null; musId = id || null;
  }
  function stopAll(fade = 1.5) { setAmbience([], fade); setMusic(null, 0.5, fade); stopPreview(); }
  function stopPreview() { if (preview) { preview.kill(0.4); preview = null; } }
  // ouvir um som antes de escolher (ambiente e música tocam por alguns segundos)
  async function previewSound(id, vol = 0.8, pan = 0) {
    init(); stopPreview();
    const info = info_(id);
    preview = info.kind === 'fx' ? await playFx(id, vol, pan) : startPreviewLoop(id, vol);
    return preview;
  }
  function info_(id) { return byId[id] || { id, kind: 'user', name: 'Meu som', icon: 'mic' }; }
  // Sai do app (outra tela, celular bloqueado): os sons pausam e voltam junto com a leitura.
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend(); else ctx.resume();
  });
  function setMaster(v) { masterVol = v; if (master && !muted) master.gain.setTargetAtTime(v, now(), 0.05); }
  function setMuted(m) { muted = m; if (master) master.gain.setTargetAtTime(m ? 0 : masterVol, now(), 0.08); }

  return {
    init, catalog: CAT, info: info_, userLoader, playFx, setAmbience, setMusic, stopAll, previewSound, stopPreview,
    setMaster, setMuted, get muted() { return muted; }, get ready() { return !!ctx && ctx.state === 'running'; },
    forget(id) { bufCache.delete(id); },
  };
})();
