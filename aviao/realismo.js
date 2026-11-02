/* Desenho realista no canvas: nuvens com textura (ruído fractal) e luz do sol, céu, chuva, poeira e um jato de lado.
   Usado pelas aulas de meteorologia. As nuvens são calculadas pixel a pixel uma vez e guardadas. */
(() => {
'use strict';
function hash2(i, j) { let n = i * 374761393 + j * 668265263; n = (n ^ (n >>> 13)) * 1274126177; return ((n ^ (n >>> 16)) >>> 0) / 4294967295; }
function vnoise(x, y) {
  const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const a = hash2(i, j), b = hash2(i + 1, j), c = hash2(i, j + 1), d = hash2(i + 1, j + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y, o = 6) { let s = 0, a = 0.5, f = 1; for (let k = 0; k < o; k++) { s += a * vnoise(x * f, y * f); f *= 2.03; a *= 0.5; } return s / (1 - Math.pow(0.5, o)); }
const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const mix = (a, b, t) => a + (b - a) * t;
const cache = new Map();

// Nuvem: "bolhas" (elipses) que definem a forma; o ruído recorta as bordas e cria os rolos; a luz vem de cima à esquerda.
// opts: escala do ruído, amp (quanto o ruído recorta), topo/base (para escurecer a base), cores lit/sombra, luz [dx, dy], seed
function nuvem(W, H, bolhas, o = {}) {
  const key = JSON.stringify([W, H, bolhas, o]); if (cache.has(key)) return cache.get(key);
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const c = cv.getContext('2d'), img = c.createImageData(W, H), d = img.data;
  const sc = o.escala ?? 5 / Math.max(60, Math.min(W, H) * 0.5), amp = o.amp ?? 0.7, seed = o.seed ?? 3.7, rol = o.rolos ?? 0.55;
  const lit = o.lit || [255, 253, 248], som = o.sombra || [74, 86, 104], baseCor = o.baseCor || [46, 52, 64];
  const topo = o.topo ?? 0, base = o.base ?? H, L = o.luz || [-0.7, -1];
  const F = new Float32Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let m = -9; for (const b of bolhas) { const dx = (x - b.x) / b.rx, dy = (y - b.y) / b.ry; m = Math.max(m, (1 - Math.sqrt(dx * dx + dy * dy)) * (b.k || 1)); }
    if (m < -amp) { F[y * W + x] = -1; continue; }
    // ruído "inchado" (valor absoluto) imita os rolos dos cumulus
    const n = fbm(x * sc + seed, y * sc + seed * 1.7), n2 = Math.abs(fbm(x * sc * 2.3 + 9, y * sc * 2.3 + 4, 4) - 0.5) * 2, n3 = Math.abs(fbm(x * sc * 5 + 2, y * sc * 5 + 7, 3) - 0.5) * 2;
    F[y * W + x] = m + (n - 0.5) * amp + rol * ((0.5 - n2) * 0.45 + (0.5 - n3) * 0.15);
  }
  // Campo desfocado para a sombra: evita listras na direção da luz
  const B = new Float32Array(W * H), T = new Float32Array(W * H), r = Math.max(2, Math.round(Math.min(W, H) * 0.02));
  for (let y = 0; y < H; y++) { let acc = 0; for (let x = -r; x < W + r; x++) { const xa = x + r, xs = x - r - 1; if (xa < W && xa >= 0) acc += Math.max(0, F[y * W + xa]); if (xs >= 0 && xs < W) acc -= Math.max(0, F[y * W + xs]); if (x >= 0 && x < W) T[y * W + x] = acc / (2 * r + 1); } }
  for (let x = 0; x < W; x++) { let acc = 0; for (let y = -r; y < H + r; y++) { const ya = y + r, ys = y - r - 1; if (ya < H && ya >= 0) acc += T[ya * W + x]; if (ys >= 0 && ys < H) acc -= T[ys * W + x]; if (y >= 0 && y < H) B[y * W + x] = acc / (2 * r + 1); } }
  const passo = Math.max(2, Math.round(Math.min(W, H) * 0.02));
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const f = F[y * W + x]; if (f <= 0) continue;
    const a = sm(0, 0.14, f);
    // Sombra: quanta nuvem há entre o ponto e o sol
    let occ = 0; for (let k = 1; k <= 7; k++) { const sx = Math.round(x + L[0] * passo * k), sy = Math.round(y + L[1] * passo * k); if (sx >= 0 && sy >= 0 && sx < W && sy < H) occ += B[sy * W + sx]; }
    const luz = Math.exp(-occ * 1.1), g = sm(0, 1, (y - topo) / Math.max(1, base - topo)), borda = 1 - sm(0, 0.3, f);
    // luz direta + um pouco de luz ambiente; borda fina iluminada ("forro de prata")
    const k0 = 0.18 + 0.82 * Math.pow(luz, 0.85) * (1 - 0.5 * g) + borda * 0.25 * luz;
    const i = (y * W + x) * 4;
    for (let ch = 0; ch < 3; ch++) d[i + ch] = Math.min(255, mix(mix(som[ch], lit[ch], Math.min(1, k0)), baseCor[ch], g * g * 0.6));
    d[i + 3] = a * 255 * (o.alfa ?? 1);
  }
  c.putImageData(img, 0, 0); cache.set(key, cv); return cv;
}
// Céu em degradê e um pouco de névoa no horizonte
function ceu(c, w, h, cores, chao) {
  const g = c.createLinearGradient(0, 0, 0, chao); cores.forEach((cor, i) => g.addColorStop(i / (cores.length - 1), cor));
  c.fillStyle = g; c.fillRect(0, 0, w, chao);
}
function terreno(c, w, h, chao, cor1 = '#2b3a2a', cor2 = '#141c14', seed = 1) {
  // Morros ao fundo com ruído e o chão em degradê
  c.fillStyle = 'rgba(40,52,62,.85)'; c.beginPath(); c.moveTo(0, chao);
  for (let x = 0; x <= w; x += 4) c.lineTo(x, chao - 6 - fbm(x * 0.012 + seed, 2.3) * h * 0.06); c.lineTo(w, chao); c.closePath(); c.fill();
  const g = c.createLinearGradient(0, chao, 0, h); g.addColorStop(0, cor1); g.addColorStop(1, cor2); c.fillStyle = g; c.fillRect(0, chao, w, h - chao);
}
// Cortina de chuva: véu em degradê com bordas irregulares e riscos inclinados
function chuva(c, x0, x1, y0, y1, o = {}) {
  const inc = o.inc ?? 0.12, dens = o.dens ?? 0.5, cor = o.cor || '170,185,205';
  const forma = () => { c.beginPath();
    for (let y = y0; y <= y1; y += 6) c.lineTo(x0 + (y - y0) * inc - fbm(y * 0.02, 1.1) * (x1 - x0) * 0.15, y);
    for (let y = y1; y >= y0; y -= 6) c.lineTo(x1 + (y - y0) * inc + fbm(y * 0.02, 5.3) * (x1 - x0) * 0.15, y);
    c.closePath(); };
  c.save(); if ('filter' in c) c.filter = `blur(${Math.max(3, (x1 - x0) * 0.05)}px)`;
  const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, `rgba(${cor},0)`); g.addColorStop(0.12, `rgba(${cor},${0.55 * dens})`); g.addColorStop(1, `rgba(${cor},${0.2 * dens})`);
  forma(); c.fillStyle = g; c.fill(); c.restore();
  c.save(); forma(); c.clip(); c.strokeStyle = `rgba(${cor},${0.3 * dens})`; c.lineWidth = 0.8;
  const n = Math.round((x1 - x0) * (y1 - y0) / 300 * dens);
  for (let i = 0; i < n; i++) { const x = x0 + hash2(i, 7) * (x1 - x0 + (y1 - y0) * inc), y = y0 + 8 + hash2(i, 3) * (y1 - y0), L = 8 + hash2(i, 9) * 14; c.beginPath(); c.moveTo(x, y); c.lineTo(x + L * inc, y + L); c.stroke(); }
  c.restore();
}
// Jato bimotor visto de lado, nariz para a direita (comprimento ~ s)
function jato(c, x, y, s, ang = 0, cor = '#e9edf1') {
  c.save(); c.translate(x, y); c.rotate(ang); const k = s / 100;
  c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(0, 6 * k, 48 * k, 4 * k, 0, 0, 7); c.fill();
  const g = c.createLinearGradient(0, -6 * k, 0, 6 * k); g.addColorStop(0, cor); g.addColorStop(1, '#8e99a4');
  c.fillStyle = g; c.beginPath();
  c.moveTo(50 * k, 0); c.quadraticCurveTo(48 * k, -5 * k, 40 * k, -5.5 * k); c.lineTo(-38 * k, -5 * k); c.lineTo(-50 * k, -22 * k); c.lineTo(-56 * k, -22 * k); c.lineTo(-52 * k, -3 * k); c.lineTo(-50 * k, 2 * k);
  c.quadraticCurveTo(-40 * k, 5 * k, -30 * k, 5.5 * k); c.lineTo(38 * k, 5.5 * k); c.quadraticCurveTo(48 * k, 5 * k, 50 * k, 0); c.fill();
  c.fillStyle = '#1b2633'; c.beginPath(); c.moveTo(44 * k, -3 * k); c.lineTo(47 * k, -1.5 * k); c.lineTo(41 * k, -1.5 * k); c.closePath(); c.fill();
  c.fillStyle = '#7d8893'; c.beginPath(); c.moveTo(4 * k, 2 * k); c.lineTo(-14 * k, 8 * k); c.lineTo(-20 * k, 8 * k); c.lineTo(-8 * k, 2 * k); c.closePath(); c.fill();
  c.fillStyle = '#9aa5b0'; c.beginPath(); c.ellipse(2 * k, 7 * k, 8 * k, 2.6 * k, 0, 0, 7); c.fill();
  c.fillStyle = '#2b3540'; for (let i = 0; i < 12; i++) c.fillRect((30 - i * 5.5) * k, -2.5 * k, 2 * k, 1.8 * k);
  c.restore();
}
window.Realismo = { nuvem, ceu, terreno, chuva, jato, fbm, hash2 };
})();
