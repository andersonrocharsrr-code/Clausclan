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

// ---------- Monomotor de asa baixa (o Hangar H-1) ----------
function grad(c, x0, y0, x1, y1, stops) { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, cor]) => g.addColorStop(o, cor)); return g; }
// Visto de trás, centro da fuselagem em (x, y); envergadura ~ 220*s; incl em graus (positivo: asa esquerda baixa, curva à esquerda)
function leveTras(c, x, y, s, incl = 0, o = {}) {
  c.save(); c.translate(x, y); c.rotate(-incl * Math.PI / 180); c.scale(s, s);
  const sol = o.sol ?? -1; // luz vindo da esquerda (-1) ou da direita (1)
  // Disco da hélice (aparece em volta da fuselagem)
  c.fillStyle = 'rgba(220,230,240,.10)'; c.beginPath(); c.arc(0, 0, 34, 0, 7); c.fill();
  // Trem fixo
  c.strokeStyle = '#3b434b'; c.lineWidth = 3;
  for (const k of [-1, 1]) { c.beginPath(); c.moveTo(k * 8, 12); c.lineTo(k * 30, 34); c.stroke();
    c.fillStyle = grad(c, k * 30 - 7, 0, k * 30 + 7, 0, [[0, '#2a2f34'], [0.5, '#4b535b'], [1, '#1b1f23']]); c.beginPath(); c.ellipse(k * 30, 37, 4, 7.5, 0, 0, 7); c.fill();
    c.fillStyle = '#e9edf1'; c.beginPath(); c.ellipse(k * 30, 31, 6, 5, 0, Math.PI, 0); c.fill(); }
  // Asas com diedro: de cima clara, de baixo sombreada
  for (const k of [-1, 1]) {
    const di = -0.09; // diedro: as pontas sobem
    c.fillStyle = grad(c, 0, -6, 0, 6, [[0, '#fbfcfd'], [0.45, '#dfe5ea'], [0.55, '#a9b3bc'], [1, '#7d8792']]);
    c.beginPath(); c.moveTo(k * 10, 0); c.lineTo(k * 112, 2 + 102 * di - 2.5); c.quadraticCurveTo(k * 118, 2 + 104 * di, k * 112, 2 + 102 * di + 3.5);
    c.lineTo(k * 10, 12); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(40,48,56,.5)'; c.lineWidth = 0.8; c.stroke();
    c.strokeStyle = 'rgba(70,80,90,.35)'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(k * 70, 2 + 62 * di + 0.6); c.lineTo(k * 108, 2 + 98 * di + 0.6); c.stroke();
    // luz de navegação na ponta e strobe
    c.fillStyle = k < 0 ? '#ff3b30' : '#34d058'; c.beginPath(); c.arc(k * 113, 2 + 103 * di + 0.6, 1.8, 0, 7); c.fill();
  }
  // Fuselagem (seção quase circular) com luz lateral
  c.fillStyle = (() => { const g = c.createRadialGradient(sol * 6, -8, 2, 0, 0, 22); g.addColorStop(0, '#ffffff'); g.addColorStop(0.6, '#d5dce2'); g.addColorStop(1, '#78838e'); return g; })();
  c.beginPath(); c.ellipse(0, 0, 15, 17, 0, 0, 7); c.fill();
  // Faixa rosa da pintura
  c.strokeStyle = '#d63384'; c.lineWidth = 2.2; c.beginPath(); c.ellipse(0, 0, 15, 17, 0, Math.PI * 0.08, Math.PI * 0.92); c.stroke();
  // Cabine (vidro escuro com reflexo)
  c.fillStyle = grad(c, 0, -17, 0, -6, [[0, '#1d2a38'], [1, '#3c5266']]); c.beginPath(); c.ellipse(0, -9, 10, 8, 0, Math.PI, 0); c.fill();
  c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 1; c.beginPath(); c.arc(-3, -9, 6, Math.PI * 1.15, Math.PI * 1.5); c.stroke();
  // Profundor (estabilizador horizontal, mais perto de quem olha)
  c.fillStyle = grad(c, 0, -5, 0, 3, [[0, '#ffffff'], [0.5, '#dfe5ea'], [1, '#8a95a0']]);
  c.beginPath(); c.moveTo(-46, -3); c.quadraticCurveTo(-50, -1, -46, 1.5); c.lineTo(46, 1.5); c.quadraticCurveTo(50, -1, 46, -3); c.closePath(); c.fill();
  // Leme e deriva
  c.fillStyle = grad(c, -5, 0, 5, 0, [[0, sol < 0 ? '#ffffff' : '#9aa5b0'], [1, sol < 0 ? '#9aa5b0' : '#ffffff']]);
  c.beginPath(); c.moveTo(-3.5, -12); c.lineTo(-2, -52); c.lineTo(2, -52); c.lineTo(3.5, -12); c.closePath(); c.fill();
  c.fillStyle = '#d63384'; c.fillRect(-2.4, -50, 4.8, 9);
  c.fillStyle = '#ff3b30'; c.beginPath(); c.arc(0, -53, 1.6, 0, 7); c.fill();
  c.fillStyle = '#fff'; c.beginPath(); c.arc(0, -16.5, 1.2, 0, 7); c.fill();
  c.restore();
}
// Visto de cima, nariz para cima (ang em graus, 0 = norte); comprimento ~ 80*s
function leveTopo(c, x, y, s, ang = 0, o = {}) {
  c.save(); c.translate(x, y); c.rotate(ang * Math.PI / 180); c.scale(s, s * (o.achatar ?? 1));
  if (o.sombra) { c.save(); c.translate(o.sombra[0], o.sombra[1]); c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(0, 0, 50, 10, 0, 0, 7); c.ellipse(0, 0, 8, 40, 0, 0, 7); c.fill(); c.restore(); }
  c.fillStyle = 'rgba(230,236,242,.14)'; c.beginPath(); c.ellipse(0, -40, 13, 2.2, 0, 0, 7); c.fill(); // hélice girando
  const asa = grad(c, -55, 0, 55, 0, [[0, '#c9d1d8'], [0.5, '#ffffff'], [1, '#c9d1d8']]);
  c.fillStyle = asa; c.beginPath(); c.moveTo(-55, -10); c.lineTo(55, -10); c.quadraticCurveTo(58, -6, 55, 3); c.lineTo(-55, 3); c.quadraticCurveTo(-58, -6, -55, -10); c.fill();
  c.strokeStyle = 'rgba(60,70,80,.35)'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(-52, 0); c.lineTo(-30, 0); c.moveTo(30, 0); c.lineTo(52, 0); c.moveTo(-28, 0.5); c.lineTo(-8, 0.5); c.moveTo(8, 0.5); c.lineTo(28, 0.5); c.stroke();
  c.fillStyle = '#ff3b30'; c.beginPath(); c.arc(-56, -4, 1.5, 0, 7); c.fill(); c.fillStyle = '#34d058'; c.beginPath(); c.arc(56, -4, 1.5, 0, 7); c.fill();
  c.fillStyle = grad(c, -20, 0, 20, 0, [[0, '#c9d1d8'], [0.5, '#ffffff'], [1, '#c9d1d8']]);
  c.beginPath(); c.moveTo(-20, 30); c.lineTo(20, 30); c.lineTo(19, 35); c.lineTo(-19, 35); c.closePath(); c.fill();
  c.fillStyle = grad(c, -7, 0, 7, 0, [[0, '#aeb8c2'], [0.5, '#ffffff'], [1, '#aeb8c2']]);
  c.beginPath(); c.moveTo(0, -40); c.quadraticCurveTo(7, -36, 6.5, -20); c.lineTo(5.5, 10); c.lineTo(2.5, 36); c.lineTo(-2.5, 36); c.lineTo(-5.5, 10); c.lineTo(-6.5, -20); c.quadraticCurveTo(-7, -36, 0, -40); c.fill();
  c.fillStyle = '#d63384'; c.fillRect(-1.2, -2, 2.4, 36);
  c.fillStyle = grad(c, 0, -22, 0, -4, [[0, '#24364a'], [1, '#476178']]); c.beginPath(); c.ellipse(0, -13, 4.6, 9, 0, 0, 7); c.fill();
  c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(-2, -19); c.lineTo(-2.5, -10); c.stroke();
  c.restore();
}
// Campo visto do alto: mosaico de plantações com ruído (para as cenas aéreas)
function campos(c, x, y, w, h, seed = 1, esc = 1) {
  const img = c.createImageData(Math.max(1, Math.round(w * esc)), Math.max(1, Math.round(h * esc))), d = img.data, W = img.width, H = img.height;
  const pal = [[86, 112, 62], [120, 136, 74], [70, 96, 58], [140, 126, 82], [96, 120, 70], [60, 82, 52]];
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const p = Math.pow(j / H, 1.6) * 0.9 + 0.1, u = i / W * 18 / p + seed, v = j / H * 10 / p;
    const cel = pal[Math.floor(hash2(Math.floor(u), Math.floor(v)) * pal.length)], n = 0.85 + fbm(u * 3, v * 3, 3) * 0.3, hz = 1 - Math.pow(1 - j / H, 3) * 0.55;
    const k = (j * W + i) * 4; d[k] = mix(170, cel[0] * n, hz); d[k + 1] = mix(186, cel[1] * n, hz); d[k + 2] = mix(198, cel[2] * n, hz); d[k + 3] = 255;
  }
  const off = document.createElement('canvas'); off.width = W; off.height = H; off.getContext('2d').putImageData(img, 0, 0); c.drawImage(off, x, y, w, h);
}
window.Realismo = { nuvem, ceu, terreno, chuva, jato, fbm, hash2, leveTras, leveTopo, campos };
})();
