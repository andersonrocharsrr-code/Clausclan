// ================= DRÁCULA — 30 s — Recorte Dourado em paleta noturna =================
const NARS = { a: 2.2, b: 9.8, c: 18.6 };
const DUR = 30.0;
const CUTS = [0, 7.7, 9.8, 13.9, 15.4, 16.9, 18.6, 23.4, DUR];
const TX = 110, TY = 170;
// legendas a partir de palavras.json (embutidas por montar.py em legendas.js)

// --- 1: o castelo ao longe, na neve, e a câmera se aproxima ---
shot(CUTS[0], CUTS[1], (tl, t) => {
  const u = ease(ramp(tl, 0, 7.7)), z = lerp(1, 1.9, u * u);
  zoomTela(z, 1000, 520, () => {
    ceuNoite(t, { lx: 1380, ly: 250, lr: 110 }); montanhas(t, 900);
    floresta(760, 11, 70, 50, 90, '#0e141c', 'rgba(200,210,226,.7)'); castelo(1000, 600, .62, t);
    floresta(820, 12, 50, 90, 150, '#0a0e14', 'rgba(210,220,234,.8)', -60, 640); floresta(820, 13, 50, 90, 150, '#0a0e14', 'rgba(210,220,234,.8)', 1360, W + 60);
    chaoNeve(900); floresta(940, 14, 26, 220, 340, '#06080c', 'rgba(220,228,240,.85)', -80, 420); floresta(950, 15, 26, 220, 360, '#06080c', 'rgba(220,228,240,.85)', 1500, W + 80);
    revoada(t, 3, 14, 1380, 250, 160, 1.2, .5);
  });
  neve(t, 140, 1, 2.2, 60); neve(t, 60, 2, 4, 110);
  typeText(tl, TX, TY, 'TRANSILVÂNIA', 2.0, 7.4, { sub: 'MONTES CÁRPATOS · ROMÊNIA' });
});
// --- 2: a torre do conde, morcegos saindo da janela ---
shot(CUTS[1], CUTS[2], (tl, t) => {
  const z = lerp(1.0, 1.35, ease(ramp(tl, 0, 2.1)));
  zoomTela(z, 1060, 400, () => { ceuNoite(t, { lx: 1500, ly: 220, lr: 150 }); castelo(1020, 1180, 2.4, t) });
  revoada(t + 3, 7, 26, 1080, 300, 120, 2.6, 1.4, { espalha: .6 });
  neve(t, 120, 3, 3, 80); neve(t, 40, 4, 6, 140);
  label(W / 2, 980 - 120, 'CONDE DRÁCULA', { size: 120, align: 'center', col: GELO, a: ramp(tl, .2, .5) });
});
// --- 3: o rosto do Drácula, de perto ---
shot(CUTS[2], CUTS[3], (tl, t) => {
  c.fillStyle = '#030408'; c.fillRect(0, 0, W, H); add(() => glow(960, 480, 900, '70,90,140', .25)); neve(t, 40, 5, 2, 40, .4);
  const z = lerp(2.3, 2.9, ease(ramp(tl, 0, 4.1))); c.save(); c.translate(960, 600 + (1 - ease(ramp(tl, 0, 4.1))) * 60); c.scale(z, z); draculaRosto(t, { olho: .35 + .4 * ramp(tl, 2, 4), boca: 0 }); c.restore();
  typeText(tl, TX, TY, 'BRAM STOKER · 1897', .3, 4.0, { sub: 'O ROMANCE "DRÁCULA"' });
});
// --- 4: de dia, no caixão ---
shot(CUTS[3], CUTS[4], (tl, t) => {
  zoomTela(lerp(1.15, 1.0, ease(ramp(tl, 0, 1.5))), 960, 760, () => cripta(t, 0));
  label(W / 2, 260, 'DE DIA, NO CAIXÃO', { size: 90, align: 'center', col: GELO, a: ramp(tl, .1, .4) });
});
// --- 5: à noite, a tampa abre e os morcegos saem ---
shot(CUTS[4], CUTS[5], (tl, t) => {
  cripta(t, eo(ramp(tl, 0, .5))); c.fillStyle = `rgba(3,4,8,${ramp(tl, .6, 1.4) * .6})`; c.fillRect(0, 0, W, H);
  revoada(tl + .2, 11, 40, 960, 600, 90, 3.4, 1.2, { espalha: 2.2 });
  label(W / 2, 260, 'À NOITE, EM FORMA DE MORCEGO', { size: 80, align: 'center', col: GELO, a: ramp(tl, .1, .4) });
});
// --- 6: os caninos — zoom na boca ---
shot(CUTS[5], CUTS[6], (tl, t) => {
  c.fillStyle = '#030408'; c.fillRect(0, 0, W, H); add(() => glow(960, 540, 900, '140,20,30', .18 + .12 * ramp(tl, .4, 1)));
  const z = lerp(3.0, 4.6, ease(ramp(tl, 0, 1.7))); c.save(); c.translate(960, 540 - 62 * z * .55); c.scale(z, z); draculaRosto(t, { olho: 1, boca: eo(ramp(tl, .1, .7)), gota: ramp(tl, .8, 1.7) }); c.restore();
  label(W - 100, 240, 'ATRÁS DE SANGUE', { size: 80, align: 'right', col: SANGUE2, a: ramp(tl, .6, .9) });
});
// --- 7: Vlad III, o Empalador ---
shot(CUTS[6], CUTS[7], (tl, t) => {
  c.fillStyle = '#05060a'; c.fillRect(0, 0, W, H); add(() => glow(700, 520, 700, '120,130,170', .2 * ramp(tl, 0, .8)));
  c.save(); c.translate(700, 560); const z = lerp(1.9, 2.1, ease(ramp(tl, 0, 4.8))); c.scale(z, z); c.globalAlpha = ramp(tl, 0, .8); vladRetrato(t); c.restore();
  c.strokeStyle = '#3a3020'; c.lineWidth = 26; c.strokeRect(300, 40, 800, 1000); c.strokeStyle = '#6a5a3a'; c.lineWidth = 6; c.strokeRect(286, 26, 828, 1028);
  label(1240, 420, 'VLAD III', { size: 140, col: GELO, a: ramp(tl, 2.6, 3.0) }); label(1240, 500, 'O EMPALADOR', { size: 70, col: SANGUE2, a: ramp(tl, 3.2, 3.6) }); label(1240, 560, 'PRÍNCIPE DA VALÁQUIA · SÉCULO XV', { size: 36, col: GELO, a: ramp(tl, 3.6, 4.0), w: 600 });
  typeText(tl, TX, TY, 'A INSPIRAÇÃO', .2, 2.6, { size: 60, sub: 'UM PRÍNCIPE DE VERDADE' });
});
// --- 8: o castelo sob a lua — título ---
shot(CUTS[7], CUTS[8], (tl, t) => {
  const z = lerp(1.25, 1.0, ease(ramp(tl, 0, 6.6)));
  zoomTela(z, 960, 560, () => { ceuNoite(t, { lx: 960, ly: 330, lr: 170 }); montanhas(t, 940); floresta(800, 21, 60, 50, 90, '#0e141c', 'rgba(200,210,226,.7)'); castelo(960, 680, .78, t); chaoNeve(960); floresta(980, 22, 30, 220, 360, '#06080c', 'rgba(220,228,240,.85)', -80, 380); floresta(990, 23, 30, 220, 360, '#06080c', 'rgba(220,228,240,.85)', 1540, W + 80) });
  revoada(t, 31, 30, 960, 330, 220, 1.6, .7); neve(t, 130, 6, 2.4, 60); neve(t, 50, 7, 4.5, 110);
  label(W / 2, 760, 'DRÁCULA', { size: 220, align: 'center', col: SANGUE2, a: ramp(tl, 1.6, 2.4) }); label(W / 2, 830, 'O VAMPIRO MAIS FAMOSO DO MUNDO', { size: 50, align: 'center', col: GELO, a: ramp(tl, 3.6, 4.2), w: 600 });
});
function zoomTela(z, fx, fy, fn) { c.save(); c.translate(fx, fy); c.scale(z, z); c.translate(-fx, -fy); fn(); c.restore() }
