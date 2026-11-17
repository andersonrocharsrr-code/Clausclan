// ================= Letras góticas, título com asas de morcego, cartão de capítulo e efeitos de clima =================
const GOT = '"UnifrakturCook", "Pirata One", serif', PIRATA = '"Pirata One", serif';
function txtG(str, x, y, size, col, o = {}) {
  c.save(); c.globalAlpha *= o.a ?? 1; c.font = `700 ${size}px ${o.fonte || GOT}`; c.textAlign = o.align || 'left'; if ('letterSpacing' in c) c.letterSpacing = (o.ls ?? size * .01) + 'px';
  c.shadowColor = 'rgba(0,0,0,.9)'; c.shadowBlur = size * .25; c.shadowOffsetY = size * .05; c.fillStyle = col; c.fillText(str, x, y);
  if (o.borda) { c.shadowBlur = 0; c.lineWidth = size * .03; c.strokeStyle = o.borda; c.strokeText(str, x, y) }
  c.restore();
}
function asa(dir, w, h, t, cor, rim) { // asa de morcego saindo de (0,0) para o lado dir
  const f = sin(t * 3) * .06; c.save(); c.scale(dir, 1); c.rotate(-f);
  const P = [[0, -h * .15], [w * .25, -h * .55], [w * .55, -h * .72], [w * .82, -h * .62], [w, -h * .3]];
  c.beginPath(); c.moveTo(0, h * .2); c.lineTo(...P[0]); c.quadraticCurveTo(w * .1, -h * .5, P[1][0], P[1][1]); c.quadraticCurveTo(w * .4, -h * .8, P[2][0], P[2][1]); c.quadraticCurveTo(w * .7, -h * .75, P[3][0], P[3][1]); c.quadraticCurveTo(w * .95, -h * .55, P[4][0], P[4][1]);
  c.quadraticCurveTo(w * .86, -h * .05, w * .8, h * .08); c.quadraticCurveTo(w * .7, -h * .1, w * .58, h * .14); c.quadraticCurveTo(w * .46, -h * .02, w * .34, h * .2); c.quadraticCurveTo(w * .2, h * .04, w * .06, h * .26); c.closePath();
  c.fillStyle = cor; c.fill(); c.strokeStyle = rim; c.lineWidth = Math.max(1.5, h * .025); c.stroke();
  c.strokeStyle = 'rgba(120,20,30,.55)'; c.lineWidth = Math.max(1, h * .018); for (const [px, py] of [[w * .8, h * .08], [w * .58, h * .14], [w * .34, h * .2], [w, -h * .3]]) { c.beginPath(); c.moveTo(w * .02, -h * .1); c.quadraticCurveTo(px * .5, py - h * .3, px, py); c.stroke() }
  c.restore();
}
function tituloMorcego(x, y, size, t, a = 1, str = 'Drácula') {
  if (a <= 0) return; c.save(); c.globalAlpha = a; c.font = `700 ${size}px ${GOT}`; const w = c.measureText(str).width;
  const ab = eo(clamp(a * 1.4)); c.save(); c.translate(x - w / 2 - size * .05, y - size * .32); c.scale(ab, ab); asa(-1, size * 2.1, size * 1.3, t, '#0a0b10', '#6a0a14'); c.restore(); c.save(); c.translate(x + w / 2 + size * .05, y - size * .32); c.scale(ab, ab); asa(1, size * 2.1, size * 1.3, t, '#0a0b10', '#6a0a14'); c.restore();
  add(() => glow(x, y - size * .35, size * 2.4, '160,20,30', .28));
  txtG(str, x + size * .03, y + size * .04, size, '#1a0004', { align: 'center' }); txtG(str, x, y, size, '#c8141e', { align: 'center', borda: '#ff5a5a' });
  morcego(x - w * .18, y - size * 1.02 + sin(t * 3) * 6, size / 34, t, 1, 1);
  c.restore();
}
function capitulo(tl, n, titulo) {
  const a = 1 - ramp(tl, 1.25, 1.75); if (a <= 0) return; c.save(); c.globalAlpha = a; c.fillStyle = '#050508'; c.fillRect(0, 0, W, H); add(() => glow(W / 2, 540, 700, '140,20,30', .16));
  const u = eo(ramp(tl, 0, .55)); txt(`CAPÍTULO ${n}`, W / 2, 440, 44, '#b0141e', { align: 'center', w: 600, ls: 16 }); c.fillStyle = '#b0141e'; c.fillRect(W / 2 - 280 * u, 468, 560 * u, 3);
  c.globalAlpha = a * u; txtG(titulo, W / 2, 620 + (1 - u) * 20, 128, '#e8e2d6', { align: 'center' }); morcego(W / 2 + 420 * (1 - u) - 60, 340, 2.2, tl, 2, -1); c.restore();
}
function placaG(tl, x, y, str, t0, t1, o = {}) { const a = Math.min(ramp(tl, t0 - .2, t0 + .2), 1 - ramp(tl, t1 - .3, t1)); if (a <= 0) return; c.save(); c.globalAlpha = a; c.font = `700 ${o.size || 84}px ${GOT}`; const w = c.measureText(str).width; c.restore(); c.save(); c.globalAlpha = a; c.translate(x + w * .3, y - 20); c.scale(1.8, 1); glow(0, 0, 120 + w * .35, '0,0,0', .55); c.restore(); txtG(str, x, y, o.size || 84, o.col || '#e8e2d6', { a, align: o.align }); if (o.sub) txt(o.sub, x, y + (o.size || 84) * .62, o.subSize || 36, o.subCol || '#c8d0dc', { a, w: 600, ls: 6, align: o.align }) }
// clima
function nevoa(y, h, a, t, seed = 1, cor = '200,210,226') { const q = rng(seed); for (let i = 0; i < 14; i++) { const x = ((q() * W * 1.5 + t * (8 + q() * 16)) % (W * 1.5)) - W * .25, yy = y + q() * h, w = 400 + q() * 600; c.fillStyle = `rgba(${cor},${a * (.3 + q() * .5)})`; c.beginPath(); c.ellipse(x, yy, w, 26 + q() * 40, 0, 0, 7); c.fill() } }
function raios(x, y, n, len, a, t, cor = '200,215,240') { add(() => { for (let k = 0; k < n; k++) { const ang = PI / 2 + (k - n / 2) * .09 + sin(t * .3 + k) * .02; c.fillStyle = `rgba(${cor},${a * (.4 + .6 * ((k * 37) % 7) / 7)})`; c.beginPath(); c.moveTo(x, y); c.lineTo(x + cos(ang - .025) * len, y + sin(ang - .025) * len); c.lineTo(x + cos(ang + .025) * len, y + sin(ang + .025) * len); c.fill() } }) }
function corvos(t, seed, n, cx, cy, r) { const q = rng(seed); for (let i = 0; i < n; i++) { const a = q() * 6 + t * (.2 + q() * .3), x = cx + cos(a) * r * (1 + q()), y = cy + sin(a) * r * .3 + sin(t * 2 + i) * 8, f = sin(t * 9 + i) * 8; c.strokeStyle = '#06060a'; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 14, y - f); c.quadraticCurveTo(x - 6, y - 4, x, y); c.quadraticCurveTo(x + 6, y - 4, x + 14, y - f); c.stroke() } }
function moldura(x, y, w, h, cor = '#3a3020', cor2 = '#6a5a3a') { c.strokeStyle = cor; c.lineWidth = 26; c.strokeRect(x, y, w, h); c.strokeStyle = cor2; c.lineWidth = 6; c.strokeRect(x - 14, y - 14, w + 28, h + 28); c.strokeStyle = 'rgba(0,0,0,.6)'; c.lineWidth = 4; c.strokeRect(x + 14, y + 14, w - 28, h - 28) }
function filmeAntigo(t, a = 1) { c.save(); c.globalAlpha = a; c.fillStyle = '#000'; c.fillRect(0, 0, 150, H); c.fillRect(W - 150, 0, 150, H); for (let y = -60 + (t * 300) % 90; y < H; y += 90) { c.fillStyle = '#d8d8d0'; c.fillRect(40, y, 60, 46); c.fillRect(W - 100, y, 60, 46) } const q = rng(Math.floor(t * 24)); c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 2; for (let i = 0; i < 3; i++) { const x = 150 + q() * (W - 300); c.beginPath(); c.moveTo(x, 0); c.lineTo(x + q() * 6, H); c.stroke() } for (let i = 0; i < 20; i++) disc(150 + q() * (W - 300), q() * H, q() * 3, 'rgba(255,255,255,.35)'); c.restore() }
function pb(k = 1) { c.save(); c.filter = `grayscale(${k}) contrast(1.25) brightness(.95)`; c.drawImage(cv, 0, 0); c.restore() }
