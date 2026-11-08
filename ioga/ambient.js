/* Sereno — som ambiente gerado na hora (Web Audio), sem arquivos de áudio.
   chuva: ruído rosa filtrado com gotas; mar: ondas lentas; tacas: notas longas de taça tibetana; floresta: vento e pássaros. */
(() => {
  'use strict';
  const SONS = [
    ['nenhum', 'Sem som ambiente', '🔇'],
    ['tacas', 'Taças tibetanas', '🔔'],
    ['chuva', 'Chuva', '🌧️'],
    ['mar', 'Mar', '🌊'],
    ['floresta', 'Floresta', '🌳'],
  ];
  let ctx = null, master = null, nodes = [], timers = [], cur = 'nenhum', vol = 0.5;
  const buffers = {};

  // Ruído de 4 segundos em loop: branco, rosa (mais suave) ou marrom (grave).
  function noise(type) {
    if (buffers[type]) return buffers[type];
    const len = ctx.sampleRate * 4, buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        if (type === 'pink') {
          b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852;
          b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
          d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926;
        } else if (type === 'brown') {
          last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5;
        } else d[i] = w * 0.5;
      }
      // Emenda suave do fim com o começo para o loop não estalar.
      const f = 2000;
      for (let i = 0; i < f; i++) { const k = i / f; d[len - f + i] = d[len - f + i] * (1 - k) + d[i] * k; }
    }
    buffers[type] = buf;
    return buf;
  }
  function src(type) { const s = ctx.createBufferSource(); s.buffer = noise(type); s.loop = true; s.start(); nodes.push(s); return s; }
  function filt(kind, f, q) { const n = ctx.createBiquadFilter(); n.type = kind; n.frequency.value = f; if (q) n.Q.value = q; nodes.push(n); return n; }
  function gain(v) { const g = ctx.createGain(); g.gain.value = v; nodes.push(g); return g; }
  function lfo(freq, depth, target, offset) {
    const o = ctx.createOscillator(); o.frequency.value = freq;
    const g = gain(depth); o.connect(g).connect(target);
    if (offset != null) target.value = offset;
    o.start(); nodes.push(o); return o;
  }
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); };
  const rnd = (a, b) => a + Math.random() * (b - a);

  // Uma nota de taça: parciais inarmônicas que somem devagar.
  function tigela(freq, g = 0.05, out = master) {
    const t = ctx.currentTime;
    [[1, 1], [2.76, 0.35], [5.4, 0.12]].forEach(([m, a]) => {
      const o = ctx.createOscillator(), v = ctx.createGain();
      o.type = 'sine'; o.frequency.value = freq * m;
      const trem = ctx.createOscillator(), tg = ctx.createGain();
      trem.frequency.value = rnd(3, 5); tg.gain.value = freq * m * 0.002; trem.connect(tg).connect(o.frequency);
      v.gain.setValueAtTime(0.0001, t);
      v.gain.exponentialRampToValueAtTime(g * a, t + 0.04);
      v.gain.exponentialRampToValueAtTime(0.0001, t + 9);
      o.connect(v).connect(out); o.start(t); o.stop(t + 9.2); trem.start(t); trem.stop(t + 9.2);
    });
  }
  function piar(out) {
    const n = Math.floor(rnd(2, 5)), base = rnd(2600, 3800);
    for (let i = 0; i < n; i++) {
      const t = ctx.currentTime + i * rnd(0.13, 0.2);
      const o = ctx.createOscillator(), v = ctx.createGain();
      o.frequency.setValueAtTime(base, t); o.frequency.exponentialRampToValueAtTime(base * rnd(1.15, 1.45), t + 0.08);
      v.gain.setValueAtTime(0.0001, t); v.gain.exponentialRampToValueAtTime(0.025, t + 0.015); v.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
      o.connect(v).connect(out); o.start(t); o.stop(t + 0.13);
    }
  }

  const BUILD = {
    chuva() {
      src('pink').connect(filt('highpass', 350)).connect(filt('lowpass', 7000)).connect(gain(0.9)).connect(master);
      const perto = gain(0.0); src('white').connect(filt('bandpass', 3200, 0.7)).connect(perto).connect(master);
      lfo(0.05, 0.08, perto.gain, 0.12);
      const gota = () => {
        const t = ctx.currentTime, o = ctx.createOscillator(), v = ctx.createGain();
        o.frequency.setValueAtTime(rnd(1800, 3200), t); o.frequency.exponentialRampToValueAtTime(rnd(600, 1000), t + 0.03);
        v.gain.setValueAtTime(0.0001, t); v.gain.exponentialRampToValueAtTime(rnd(0.01, 0.03), t + 0.005); v.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
        o.connect(v).connect(master); o.start(t); o.stop(t + 0.06);
        later(gota, rnd(60, 380));
      };
      gota();
    },
    mar() {
      const onda = gain(0); src('brown').connect(filt('lowpass', 700)).connect(onda).connect(master);
      lfo(1 / 11, 0.45, onda.gain, 0.6);
      const espuma = gain(0); src('white').connect(filt('highpass', 1800)).connect(filt('lowpass', 6000)).connect(espuma).connect(master);
      lfo(1 / 11, 0.05, espuma.gain, 0.055);
    },
    tacas() {
      // Fundo: duas notas longas e graves, com um leve vaivém.
      [[110, 0.1], [164.81, 0.06], [220.5, 0.035]].forEach(([f, g]) => {
        const o = ctx.createOscillator(); o.frequency.value = f; o.start(); nodes.push(o);
        const v = gain(g); o.connect(v).connect(master); lfo(rnd(0.05, 0.11), g * 0.5, v.gain, g);
      });
      const notas = [220, 261.63, 293.66, 329.63, 392, 440];
      const toca = () => { tigela(notas[Math.floor(Math.random() * notas.length)], 0.1); later(toca, rnd(7000, 13000)); };
      later(toca, 1200);
    },
    floresta() {
      const vento = filt('bandpass', 500, 0.6); const vg = gain(0);
      src('brown').connect(vento).connect(vg).connect(master);
      lfo(0.07, 0.4, vg.gain, 0.9); lfo(0.04, 220, vento.frequency, 520);
      src('pink').connect(filt('highpass', 2500)).connect(gain(0.05)).connect(master); // folhas
      const canto = () => { piar(master); later(canto, rnd(2500, 8000)); };
      later(canto, 1500);
    },
  };

  function stop(fade = 1.2) {
    timers.forEach(clearTimeout); timers = [];
    if (!master) return;
    const m = master, ns = nodes;
    master = null; nodes = [];
    try { m.gain.cancelScheduledValues(ctx.currentTime); m.gain.setTargetAtTime(0, ctx.currentTime, fade / 4); } catch { /* nada */ }
    setTimeout(() => ns.forEach((n) => { try { n.stop && n.stop(); } catch { /* já parou */ } try { n.disconnect(); } catch { /* nada */ } }), fade * 1000 + 300);
  }
  function start(kind, audioCtx, volume) {
    stop(0.6);
    cur = kind || 'nenhum';
    if (volume != null) vol = volume;
    if (!audioCtx || cur === 'nenhum' || !BUILD[cur]) return;
    ctx = audioCtx;
    master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    BUILD[cur]();
    master.gain.setTargetAtTime(vol * 0.7, ctx.currentTime, 0.8);
  }
  function setVolume(v) { vol = v; if (master) master.gain.setTargetAtTime(vol * 0.7, ctx.currentTime, 0.15); }
  const playing = () => !!master;

  window.Amb = { SONS, start, stop, setVolume, playing, get current() { return cur; } };
})();
