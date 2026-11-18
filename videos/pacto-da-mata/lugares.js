// ================= Lugares e objetos: barracão do seringal, seringueira, lamparina, cartuchos, dinheiro, relâmpago =================
// barracão de madeira sobre esteios, varanda, telhado de palha, pélas de borracha e sacas. Base do esteio em (x,yb), largura em px.
function barracao(x, yb, wd, p, t, o = {}) {
  const s = wd / 1000, noite = o.noite;
  at(x, yb, s, () => {
    const mad = noite ? '#2a2018' : '#7a5a3a', madL = noite ? '#3a2e22' : '#a07a50', madE = noite ? '#140e0a' : '#4a3422';
    // esteios
    for (let k = 0; k <= 8; k++) { c.fillStyle = madE; c.fillRect(-500 + k * 125 - 9, -120, 18, 120) }
    c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(-520, -14, 1040, 14);
    // assoalho e varanda
    c.fillStyle = madE; c.fillRect(-540, -134, 1080, 18); c.fillStyle = madL; c.fillRect(-540, -138, 1080, 6);
    // paredes de tábuas
    c.fillStyle = lg(-480, 0, 480, 0, [[0, mad], [.5, madL], [1, mad]]); c.fillRect(-470, -460, 760, 324);
    c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 3; for (let xx = -470; xx < 290; xx += 34) { c.beginPath(); c.moveTo(xx, -460); c.lineTo(xx, -136); c.stroke() }
    c.strokeStyle = 'rgba(255,230,190,.07)'; c.lineWidth = 2; for (let xx = -460; xx < 290; xx += 34) { c.beginPath(); c.moveTo(xx, -460); c.lineTo(xx, -136); c.stroke() }
    // porta e janela
    c.fillStyle = noite ? '#080604' : '#1e140c'; c.fillRect(-150, -400, 130, 262); c.fillRect(70, -380, 150, 110);
    if (noite) add(() => { glow(-85, -280, 260, '255,170,80', .4); glow(145, -325, 200, '255,170,80', .35) });
    if (noite) { c.fillStyle = 'rgba(255,180,90,.55)'; c.fillRect(-146, -396, 122, 256); c.fillRect(74, -376, 142, 102) }
    c.fillStyle = madE; c.fillRect(140, -380, 8, 110); c.fillRect(70, -330, 150, 7);
    // telhado de palha em duas águas (lado), com franja
    c.fillStyle = lg(0, -640, 0, -440, [[0, noite ? '#3a3426' : '#b8a068'], [1, noite ? '#1e1a12' : '#7a6a40']]); c.beginPath(); c.moveTo(-580, -430); c.lineTo(-90, -660); c.lineTo(560, -430); c.lineTo(520, -410); c.lineTo(-560, -410); c.closePath(); c.fill();
    c.strokeStyle = noite ? 'rgba(0,0,0,.35)' : 'rgba(80,60,30,.45)'; c.lineWidth = 2.4; for (let k = 0; k < 70; k++) { const u = k / 70, xx = -570 + u * 1120; c.beginPath(); c.moveTo(xx, -414); c.lineTo(lerp(xx, -90, .35) + (k % 3) * 4, lerp(-414, -650, .35)); c.stroke() }
    c.fillStyle = noite ? '#141008' : '#5a4a2a'; for (let k = 0; k < 90; k++) { const xx = -575 + k * 12.6; c.fillRect(xx, -416, 5, 14 + (k * 7) % 11) }
    // varanda: guarda-corpo, pélas de borracha, sacas, rede
    c.fillStyle = madE; c.fillRect(-540, -240, 1080, 10); for (let k = 0; k <= 18; k++) c.fillRect(-540 + k * 60, -240, 7, 104);
    for (const px of [-540, 534]) c.fillRect(px, -440, 14, 304);
    if (o.rede !== 0) { c.strokeStyle = noite ? '#4a2a2a' : '#c8503a'; c.lineWidth = 9; c.beginPath(); c.moveTo(300, -420); c.quadraticCurveTo(410, -250, 528, -420); c.stroke(); c.strokeStyle = noite ? '#3a3a2a' : '#e8c060'; c.lineWidth = 3; c.beginPath(); c.moveTo(304, -414); c.quadraticCurveTo(410, -258, 524, -414); c.stroke() }
    if (o.pelas !== 0) for (let k = 0; k < 9; k++) { const px = -420 + (k % 5) * 54 + (k > 4 ? 27 : 0), py = -168 - (k > 4 ? 46 : 0); ell(px, py, 30, 26, 0, noite ? '#1a1410' : '#3e2e20'); ell(px - 8, py - 8, 12, 8, -.4, noite ? 'rgba(255,255,255,.04)' : 'rgba(255,230,190,.14)') }
    for (let k = 0; k < 4; k++) { c.fillStyle = noite ? '#3a362a' : '#c8b88a'; c.beginPath(); c.roundRect(-20 + k * 70, -214, 64, 78, 14); c.fill(); c.fillStyle = 'rgba(0,0,0,.15)'; c.fillRect(-20 + k * 70, -190, 64, 4) }
    // escada
    c.fillStyle = madE; for (let k = 0; k < 5; k++) c.fillRect(560 + k * 20, -120 + k * 24 - 14, 90, 10); c.save(); c.translate(560, -134); c.rotate(.88); c.fillRect(0, 0, 190, 10); c.restore();
  });
  if (o.fumaca !== 0) { const q = rng(3); for (let i = 0; i < 14; i++) { const ph = (t * .08 + q()) % 1, sx = x - wd * .3 + sin(t * .5 + i) * 10 + ph * 60, sy = yb - wd * .62 - ph * 360; glow(sx, sy, 40 + ph * 120, noite ? '90,100,110' : '230,226,214', .25 * (1 - ph)) } }
}
// seringueira com cortes em espiral e tigelinha do látex
function seringueira(x, yb, w, h, p, seed) {
  const q = rng(seed); tronco(x, yb, w, h, { esc: mix(p.mid, '#000000', .3), med: mix(p.mid, '#9a8a70', .25), luz: mix(p.mid, '#e0d8c0', .35), lx: p.lx, raiz: .3, musgo: p.folhas[2] }, q);
  c.strokeStyle = 'rgba(30,20,12,.7)'; c.lineWidth = Math.max(1.5, w * .03); for (let k = 0; k < 5; k++) { const y = yb - h * .12 - k * w * .25; c.beginPath(); c.moveTo(x - w * .42, y); c.lineTo(x + w * .3, y - w * .35); c.stroke() }
  c.strokeStyle = 'rgba(245,240,225,.8)'; c.lineWidth = Math.max(1, w * .015); c.beginPath(); c.moveTo(x + w * .3, yb - h * .12 - w * .35); c.lineTo(x + w * .3, yb - h * .12 + w * .05); c.stroke();
  c.fillStyle = '#5a3a22'; c.beginPath(); c.moveTo(x + w * .2, yb - h * .12 + w * .05); c.lineTo(x + w * .42, yb - h * .12 + w * .05); c.lineTo(x + w * .38, yb - h * .12 + w * .16); c.lineTo(x + w * .24, yb - h * .12 + w * .16); c.fill(); c.fillStyle = '#f0ece0'; c.fillRect(x + w * .21, yb - h * .12 + w * .05, w * .2, w * .025);
}
function lamparina(x, y, s, t, a = 1) {
  at(x, y, s, () => {
    c.fillStyle = lg(-10, 0, 10, 0, [[0, '#4a4440'], [.5, '#9a948a'], [1, '#3a3430']]); c.beginPath(); c.moveTo(-10, 0); c.lineTo(10, 0); c.lineTo(8, -18); c.lineTo(-8, -18); c.fill(); c.fillStyle = '#6a645c'; c.fillRect(-2, -26, 4, 8);
    const fl = 1 + .1 * sin(t * 23) + .06 * sin(t * 37);
    add(() => { glow(0, -36, 260 * a, '255,160,70', .35 * a); glow(0, -36, 60 * a, '255,200,120', .6 * a) });
    c.fillStyle = `rgba(255,200,90,${a})`; c.beginPath(); c.moveTo(-3, -27); c.quadraticCurveTo(-4.5 * fl, -36, 0, -46 * fl); c.quadraticCurveTo(4.5 * fl, -36, 3, -27); c.fill(); c.fillStyle = `rgba(255,250,220,${a})`; c.beginPath(); c.ellipse(0, -31, 1.6, 4, 0, 0, TAU); c.fill();
  });
}
function cartucho(x, y, s, ang = 0) { at(x, y, s, () => { c.fillStyle = lg(0, -4, 0, 4, [[0, '#d84a3a'], [.5, '#a82a20'], [1, '#6a1810']]); c.fillRect(-12, -4, 18, 8); c.fillStyle = lg(0, -4.4, 0, 4.4, [[0, '#f0d890'], [.5, '#c8a050'], [1, '#7a5a20']]); c.fillRect(6, -4.4, 7, 8.8); c.fillStyle = '#5a4018'; c.fillRect(12.4, -4.4, 1.2, 8.8); c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(-12, -3, 25, 1.2) }, ang) }
function notas(x, y, s, n, ang = 0) { at(x, y, s, () => { for (let j = 0; j < n; j++) { c.save(); c.translate(j * 3, -j * 2.4); c.rotate((j % 3 - 1) * .06); c.fillStyle = ['#7f9a6a', '#9ab07a', '#6e8a5c', '#a8bc8a'][j % 4]; c.beginPath(); c.roundRect(-30, -14, 60, 28, 2); c.fill(); c.strokeStyle = 'rgba(40,60,30,.45)'; c.lineWidth = 1; c.strokeRect(-26, -10, 52, 20); disc(0, 0, 6, 'rgba(40,60,30,.25)'); c.restore() } }, ang) }
// relâmpago: clarão e raio recortado
function relampago(t, t0, x = 1300, seed = 4) {
  const u = t - t0; if (u < 0 || u > .7) return 0; const f = u < .08 ? 1 : u < .16 ? .3 : u < .24 ? .9 : Math.max(0, 1 - (u - .24) / .46);
  if (u < .3) { const q = rng(seed); c.save(); c.strokeStyle = `rgba(230,240,255,${f})`; c.lineWidth = 5; c.shadowColor = 'rgba(180,200,255,1)'; c.shadowBlur = 30; c.beginPath(); let px = x, py = -20; c.moveTo(px, py); while (py < 520) { px += (q() - .5) * 90; py += 30 + q() * 50; c.lineTo(px, py) } c.stroke(); c.restore() }
  c.fillStyle = `rgba(220,232,255,${f * .75})`; c.fillRect(0, 0, W, H); return f;
}
// folhas girando no vento (redemoinho)
function redemoinho(t, cx, cy, n, a, seed = 9, cols = ['#1a3a2a', '#2a4a30', '#4a5a2a', '#6a5a2a']) {
  if (a <= 0) return; const q = rng(seed);
  for (let i = 0; i < n; i++) { const r = 80 + q() * 520, sp = (.8 + q()) * (q() < .5 ? 1 : 1.2), ang = q() * TAU + t * sp * 2.2, x = cx + cos(ang) * r * 1.6, y = cy + sin(ang) * r * .45 - q() * 300 + sin(t * 3 + i) * 20; c.save(); c.globalAlpha = a * (.5 + q() * .5); folha(x, y, 16 + q() * 26, ang * 3 + t * 6, 6 + q() * 5, cols[i % cols.length]); c.restore() }
}
// pó/folhas levantadas por animais correndo
function poeira(t, x, y, a, rgb = '120,110,90', seed = 2) { if (a <= 0) return; const q = rng(seed); for (let i = 0; i < 18; i++) { const ph = (t * (1 + q()) + q()) % 1; glow(x - ph * 160 + (q() - .5) * 80, y - ph * 60 - q() * 30, 30 + ph * 70, rgb, .22 * a * (1 - ph)) } }
