// ================= A floresta amazônica: céus, árvores, chão, água, neblina e luz =================
// Cada cena da mata é montada em camadas com profundidade (fundo → frente). As camadas pesadas
// (copas, troncos, chão) são pintadas uma vez e guardadas; só a câmera, a neblina, a luz e as folhas da frente mexem.
const PAL = {
  noite: { ceu: ['#02060c', '#061424', '#0b2436', '#123546'], luz: '196,218,232', lx: -1, far: '#123038', haze: '#1b4250', mid: '#0b2226', near: '#05110f',
    folhas: ['#061512', '#0b2420', '#14332c', '#21463c'], rim: '150,190,210', chao: '#081512', trilha: '#16241f', terra: '#0f1c18', fog: '120,160,178', agua: '#0e2a34', banho: 'rgba(12,34,58,1)', banhoA: .5 },
  amanhecer: { ceu: ['#24394a', '#5f6e66', '#d39556', '#f6d38c'], luz: '255,206,132', lx: 1, far: '#4f6448', haze: '#b79a72', mid: '#2a442e', near: '#11251a',
    folhas: ['#0e2116', '#1b3a24', '#2f5832', '#5a7a3a'], rim: '255,196,110', chao: '#2a321e', trilha: '#5e4a30', terra: '#3e3424', fog: '240,210,160', agua: '#4a5a4a', banho: 'rgba(120,80,30,1)', banhoA: .14 },
  manha: { ceu: ['#4f8580', '#8fb79a', '#cfe2bc', '#eef2d2'], luz: '252,244,206', lx: 1, far: '#5a8a5c', haze: '#9fc0a0', mid: '#2f5d3a', near: '#163522',
    folhas: ['#10301c', '#1e4a2a', '#346e3a', '#6a9a48'], rim: '240,248,200', chao: '#2e4026', trilha: '#6a5436', terra: '#4a3c28', fog: '226,238,222', agua: '#3e6a68', banho: 'rgba(40,70,40,1)', banhoA: .06 },
  chuva: { ceu: ['#2e3c3c', '#4a5a56', '#6c7c74', '#8a9a90'], luz: '196,210,204', lx: -1, far: '#3a5048', haze: '#6e807a', mid: '#22362c', near: '#101e18',
    folhas: ['#0c1e16', '#173226', '#284a36', '#44664a'], rim: '170,196,190', chao: '#1e2a22', trilha: '#3a372a', terra: '#2c2a20', fog: '170,186,182', agua: '#2e4440', banho: 'rgba(30,50,50,1)', banhoA: .3 },
  tarde: { ceu: ['#2e3e52', '#8a6e56', '#e19a52', '#f7cf86'], luz: '255,186,104', lx: 1, far: '#4c5636', haze: '#c38c58', mid: '#2b3822', near: '#141c10',
    folhas: ['#121c0e', '#22341a', '#3c5226', '#7a7a34'], rim: '255,176,84', chao: '#2a2818', trilha: '#6a4828', terra: '#3e2e1a', fog: '244,184,120', agua: '#5a5040', banho: 'rgba(110,60,20,1)', banhoA: .14 },
  crepusculo: { ceu: ['#120f22', '#3a2440', '#8e3e36', '#d97a40'], luz: '236,128,72', lx: 1, far: '#252330', haze: '#6a3a3a', mid: '#161820', near: '#090a0e',
    folhas: ['#07090a', '#0f1414', '#1a2220', '#2e3428'], rim: '230,120,70', chao: '#0e0f10', trilha: '#2a2018', terra: '#1a1612', fog: '170,110,100', agua: '#2a2028', banho: 'rgba(60,20,30,1)', banhoA: .35 },
};
// ---------- céu ----------
const ESTRELAS = (() => { const q = rng(77), a = []; for (let i = 0; i < 420; i++)a.push([q() * W, q() * H * .75, .5 + q() * 1.5, .25 + q() * .75]); return a })();
function ceu(p, o = {}) {
  const st = p.ceu; c.fillStyle = lg(0, 0, 0, o.hy ?? 760, st.map((col, i) => [i / (st.length - 1), col])); c.fillRect(0, 0, W, H);
  if (o.estrelas) ESTRELAS.forEach(([x, y, r, b], i) => { const al = b * o.estrelas * (.7 + .3 * sin((o.t || 0) * 1.7 + i)); c.fillStyle = `rgba(230,240,255,${al.toFixed(3)})`; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill() });
  if (o.lua) lua(o.lua[0], o.lua[1], o.lua[2] || 70, o.luaA ?? 1, o.t || 0);
  if (o.sol) { add(() => { glow(o.sol[0], o.sol[1], 900, p.luz, .32); glow(o.sol[0], o.sol[1], 260, '255,240,200', .5) }); disc(o.sol[0], o.sol[1], 46, 'rgba(255,248,226,.95)') }
  if (o.nuvens) nuvens(o.nuvens, p, o.t || 0, o.lua);
}
function lua(x, y, r, a = 1, t = 0) {
  add(() => { glow(x, y, r * 9, '150,180,210', .16 * a); glow(x, y, r * 3.2, '210,226,240', .22 * a); glow(x, y, r * 1.5, '240,240,225', .3 * a) });
  c.save(); c.globalAlpha = a; c.fillStyle = rg(x - r * .3, y - r * .3, r * .1, r * 1.05, [[0, '#fbf8ea'], [.7, '#ece6c8'], [1, '#d6d0b0']]); c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
  c.beginPath(); c.arc(x, y, r, 0, TAU); c.clip(); const q = rng(4);
  for (let i = 0; i < 14; i++) { const a2 = q() * TAU, d = q() * r * .8; ell(x + cos(a2) * d, y + sin(a2) * d, r * (.08 + q() * .2), r * (.06 + q() * .16), q() * 3, `rgba(150,150,130,${.12 + q() * .15})`) }
  c.restore();
}
function nuvens(n, p, t, luaP) {
  const q = rng(31);
  for (let i = 0; i < n; i++) {
    const x = ((q() * (W + 1200) + t * (6 + q() * 8)) % (W + 1200)) - 600, y = 80 + q() * 380, w = 260 + q() * 520, h = 30 + q() * 50;
    const lit = luaP ? clamp(1 - Math.hypot(x - luaP[0], y - luaP[1]) / 900) : .4;
    for (let k = 0; k < 6; k++) { const dx = (q() - .5) * w, dy = (q() - .5) * h; c.fillStyle = rg(x + dx, y + dy, 0, w * .4, [[0, `rgba(${shade(p.luz, .55 + lit * .5)},${.16 + lit * .2})`], [1, `rgba(${shade(p.luz, .4)},0)`]]); c.beginPath(); c.ellipse(x + dx, y + dy, w * .4, h, 0, 0, TAU); c.fill() }
  }
}
// ---------- vegetação ----------
// tufo de folhas de copa: três tons, o lado da luz mais claro
function tufo(x, y, r, cols, lx, q, rimRgb) {
  const n = 7 + (r / 6 | 0);
  for (let k = 0; k < n; k++) { const a = q() * TAU, d = q() * r * .7; ell(x + cos(a) * d, y + sin(a) * d * .7 + r * .1, r * (.32 + q() * .3), r * (.22 + q() * .2), q() * 3, cols[0]) }
  for (let k = 0; k < n; k++) { const a = q() * TAU, d = q() * r * .55; ell(x + cos(a) * d + lx * r * .1, y + sin(a) * d * .6 - r * .05, r * (.26 + q() * .24), r * (.18 + q() * .16), q() * 3, cols[1]) }
  for (let k = 0; k < n * .6; k++) { const a = -PI / 2 + lx * .7 + (q() - .5) * 1.6, d = r * (.3 + q() * .45); ell(x + cos(a) * d, y + sin(a) * d * .7, r * (.14 + q() * .16), r * (.1 + q() * .1), q() * 3, cols[2]) }
  if (rimRgb) for (let k = 0; k < n * .3; k++) { const a = -PI / 2 + lx * .9 + (q() - .5) * 1.1, d = r * (.55 + q() * .3); ell(x + cos(a) * d, y + sin(a) * d * .7, r * (.06 + q() * .07), r * (.04 + q() * .04), q() * 3, `rgba(${rimRgb},${.12 + q() * .2})`) }
}
function copa(x, y, r, cols, lx, q, rimRgb) { const n = 4 + (r / 40 | 0); for (let i = 0; i < n; i++) { const a = q() * PI + PI, d = q() * r * .7; tufo(x + cos(a) * d * 1.2, y + sin(a) * d * .5, r * (.35 + q() * .35), cols, lx, q, rimRgb) } tufo(x, y, r * .55, cols, lx, q, rimRgb) }
// tronco largo com sapopemas (raízes tabulares), casca, musgo e cipó enrolado
function tronco(x, yb, w, h, o, q) {
  const { esc = '#1a1410', med = '#3a2e22', luz = '#6a5640', lx = -1, raiz = 1, musgo = '#3a5a2a', rim = null } = o;
  const top = yb - h, curva = (q() - .5) * w * .4;
  const corpo = () => { c.beginPath(); c.moveTo(x - w / 2, yb); c.bezierCurveTo(x - w * .5 + curva * .3, yb - h * .4, x - w * .42 + curva, top + h * .2, x - w * .36 + curva, top); c.lineTo(x + w * .36 + curva, top); c.bezierCurveTo(x + w * .42 + curva, top + h * .2, x + w * .5 + curva * .3, yb - h * .4, x + w / 2, yb); c.closePath() };
  // sapopemas
  if (raiz) for (let k = 0; k < 4 + raiz * 2; k++) { const s = k % 2 ? 1 : -1, ext = w * (.5 + q() * 1.3) * raiz, hh = h * (.12 + q() * .2) * Math.min(1.4, raiz), x0 = x + s * w * (.1 + q() * .3);
    const g = lg(x0, 0, x0 + s * ext, 0, [[0, s === lx ? luz : med], [1, esc]]); c.fillStyle = g; c.beginPath(); c.moveTo(x0 - s * w * .08, yb - hh); c.quadraticCurveTo(x0 + s * ext * .3, yb - hh * .35, x0 + s * ext, yb + 4); c.lineTo(x0 - s * w * .1, yb + 4); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = Math.max(1, w * .02); c.beginPath(); c.moveTo(x0, yb - hh * .9); c.quadraticCurveTo(x0 + s * ext * .3, yb - hh * .3, x0 + s * ext * .95, yb + 2); c.stroke() }
  const L = lx < 0 ? 0 : 1; c.fillStyle = lg(x - w / 2, 0, x + w / 2, 0, L ? [[0, esc], [.45, med], [.82, luz], [1, med]] : [[0, med], [.18, luz], [.55, med], [1, esc]]); corpo(); c.fill();
  c.save(); corpo(); c.clip();
  for (let k = 0; k < w / 3; k++) { const bx = x + (q() - .5) * w, by = top + q() * h, bl = 20 + q() * h * .25; c.strokeStyle = `rgba(0,0,0,${.12 + q() * .2})`; c.lineWidth = 1 + q() * w * .025; c.beginPath(); c.moveTo(bx, by); c.quadraticCurveTo(bx + (q() - .5) * 8, by + bl / 2, bx + (q() - .5) * 6, by + bl); c.stroke() }
  for (let k = 0; k < w / 6; k++) { const bx = x + lx * w * (.1 + q() * .35), by = top + q() * h; c.strokeStyle = `rgba(255,240,210,${.04 + q() * .07})`; c.lineWidth = 1 + q() * 2; c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + (q() - .5) * 4, by + 15 + q() * 50); c.stroke() }
  for (let k = 0; k < 5; k++) { const my = top + q() * h, mx = x - lx * w * (.1 + q() * .3); ell(mx, my, w * (.08 + q() * .16), 6 + q() * 20, 0, musgo + '88') }
  if (rim) { c.fillStyle = lg(x + lx * w / 2, 0, x + lx * w * .3, 0, [[0, `rgba(${rim},.55)`], [1, `rgba(${rim},0)`]]); c.fillRect(x - w, top, w * 2, h) }
  c.restore();
  if (o.cipo) { c.strokeStyle = o.cipo; c.lineWidth = Math.max(2, w * .05); c.beginPath(); for (let yy = yb; yy > top; yy -= w * .7) { c.moveTo(x - w * .48, yy); c.quadraticCurveTo(x, yy - w * .5, x + w * .48, yy - w * .35) } c.stroke() }
}
function palmeira(x, yb, h, cols, q, sway = 0) {
  const tx = x + h * .12 * (q() - .5) + sway, ty = yb - h;
  c.strokeStyle = cols[0]; c.lineWidth = h * .035; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, yb); c.quadraticCurveTo(x + (tx - x) * .2, yb - h * .5, tx, ty); c.stroke();
  c.strokeStyle = 'rgba(255,240,200,.08)'; c.lineWidth = h * .01; for (let k = 1; k < 12; k++) { const u = k / 12, px = lerp(x, tx, u * u * .5 + u * .5), py = lerp(yb, ty, u); c.beginPath(); c.moveTo(px - h * .017, py); c.lineTo(px + h * .017, py - 3); c.stroke() }
  for (let k = 0; k < 11; k++) {
    const a = -PI / 2 + (k / 10 - .5) * 3.4 + (q() - .5) * .3, len = h * (.32 + q() * .14), droop = .5 + q() * .35, col = cols[1 + (k % 2)];
    const ex = tx + cos(a) * len, ey = ty + sin(a) * len * .6 + len * droop * .55, mx = tx + cos(a) * len * .5, my = ty + sin(a) * len * .45 - len * .05;
    c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); c.moveTo(tx, ty); c.quadraticCurveTo(mx, my, ex, ey); c.stroke();
    for (let j = 1; j < 16; j++) { const u = j / 16, px = (1 - u) * (1 - u) * tx + 2 * u * (1 - u) * mx + u * u * ex, py = (1 - u) * (1 - u) * ty + 2 * u * (1 - u) * my + u * u * ey, fl = len * .2 * (1 - u * .6); for (const s of [-1, 1]) { c.lineWidth = 2.2; c.beginPath(); c.moveTo(px, py); c.lineTo(px + s * fl * .35 + cos(a) * fl * .3, py + fl * .8); c.stroke() } }
  }
}
// folha grande (helicônia, bananeira-brava, costela-de-adão), do pé (x,y) na direção ang
function folha(x, y, len, ang, wd, col, nerv, furos) {
  c.save(); c.translate(x, y); c.rotate(ang);
  c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(len * .25, -wd, len * .75, -wd * .9, len, 0); c.bezierCurveTo(len * .75, wd * .9, len * .25, wd, 0, 0); c.fillStyle = col; c.fill();
  if (nerv) { c.strokeStyle = nerv; c.lineWidth = Math.max(1, wd * .06); c.beginPath(); c.moveTo(0, 0); c.lineTo(len * .98, 0); c.stroke(); c.lineWidth = Math.max(.6, wd * .025); for (let k = 1; k < 8; k++) { const u = k / 8; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(len * u, 0); c.quadraticCurveTo(len * (u + .05), s * wd * .4, len * (u + .1), s * wd * .75 * sin(PI * (u + .05))); c.stroke() } } }
  if (furos) { c.globalCompositeOperation = 'destination-out'; for (let k = 1; k < 5; k++) { ell(len * (k / 5), -wd * .55, len * .04, wd * .12, .3, '#000'); ell(len * (k / 5) + len * .05, wd * .5, len * .04, wd * .12, -.3, '#000') } c.globalCompositeOperation = 'source-over' }
  c.restore();
}
function samambaia(x, y, s, col, q, sway = 0) { for (let k = 0; k < 9; k++) { const a = -PI / 2 + (k / 8 - .5) * 2.6 + sway * .1, len = s * (.6 + q() * .4); c.strokeStyle = col; c.lineWidth = 2; const ex = x + cos(a) * len, ey = y + sin(a) * len * .7 + len * .25; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + cos(a) * len * .5, y + sin(a) * len * .6, ex, ey); c.stroke(); for (let j = 1; j < 12; j++) { const u = j / 12, px = lerp(x, ex, u), py = lerp(y, ey, u) - sin(u * PI) * len * .15, fl = len * .14 * (1 - u * .7); c.lineWidth = 2.5; c.beginPath(); c.moveTo(px, py); c.lineTo(px - sin(a) * fl, py + cos(a) * fl * .5 + fl * .3); c.moveTo(px, py); c.lineTo(px + sin(a) * fl, py - cos(a) * fl * .5 + fl * .3); c.stroke() } } }
function bromelia(x, y, s, cols, q) { for (let k = 0; k < 9; k++) { const a = -PI / 2 + (k / 8 - .5) * 2.4; folha(x, y, s * (.7 + q() * .4), a, s * .1, cols[k % 2], null) } ell(x, y - s * .12, s * .09, s * .18, 0, cols[2] || '#b8342a') }
// cipós pendurados do alto da tela, balançando
function cipos(t, seed, n, cols, o = {}) {
  const q = rng(seed); c.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const x = q() * (W + 200) - 100 + (o.px || 0), len = H * (.2 + q() * .7), sw = sin(t * (.5 + q() * .4) + i) * (8 + q() * 16) * (o.vento ?? 1), col = cols[i % cols.length], lw = 2 + q() * 4;
    c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(x, -20); c.quadraticCurveTo(x + sw * .5 + (q() - .5) * 60, len * .5, x + sw, len); c.stroke();
    for (let k = 0; k < len / 50; k++) { const u = (k + .5) / (len / 50), px = lerp(x, x + sw, u * u), py = -20 + (len + 20) * u; if (q() < .55) folha(px, py, 16 + q() * 18, PI / 2 + (q() - .5) * 2, 6 + q() * 4, col) }
  }
}
// ---------- textura de neblina (guardada) ----------
const NEVOA = (() => { const g = document.createElement('canvas'); g.width = 1024; g.height = 256; const x = g.getContext('2d'), q = rng(5);
  for (let i = 0; i < 70; i++) { const px = q() * 1024, py = 70 + q() * 120, r = 60 + q() * 140; for (const dx of [-1024, 0, 1024]) { const gr = x.createRadialGradient(px + dx, py, 0, px + dx, py, r); gr.addColorStop(0, `rgba(255,255,255,${.1 + q() * .12})`); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(px + dx - r, py - r, r * 2, r * 2) } }
  return g })();
const NEVOA_COR = new Map();
function nevoaCor(rgb) { let e = NEVOA_COR.get(rgb); if (e) return e; e = document.createElement('canvas'); e.width = 1024; e.height = 256; const x = e.getContext('2d'); x.drawImage(NEVOA, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = `rgb(${rgb})`; x.fillRect(0, 0, 1024, 256); NEVOA_COR.set(rgb, e); return e }
function neblina(y, h, a, t, rgb, vel = 12, off = 0) {
  if (a <= 0) return; const img = nevoaCor(rgb), w = h * 4, dx = ((t * vel + off) % w + w) % w;
  c.save(); c.globalAlpha *= a; for (let x = -dx - w; x < W + w; x += w) c.drawImage(img, x, y - h / 2, w, h); c.restore();
}
// raios de luz entre as copas (luz volumétrica) com poeira brilhando
function raios(x, y, ang, n, a, rgb, t, seed = 1) {
  if (a <= 0) return; const q = rng(seed);
  add(() => {
    for (let i = 0; i < n; i++) {
      const ox = x + (q() - .5) * 900, wd = 30 + q() * 110, len = 900 + q() * 500, aa = ang + (q() - .5) * .08, fl = a * (.5 + .5 * sin(t * (.3 + q() * .3) + i * 2)) * (.4 + q() * .6);
      c.save(); c.translate(ox, y); c.rotate(aa); c.fillStyle = lg(0, 0, 0, len, [[0, `rgba(${rgb},${.22 * fl})`], [.6, `rgba(${rgb},${.08 * fl})`], [1, `rgba(${rgb},0)`]]); c.beginPath(); c.moveTo(-wd * .3, 0); c.lineTo(wd * .3, 0); c.lineTo(wd, len); c.lineTo(-wd, len); c.closePath(); c.fill(); c.restore();
    }
    const p = rng(seed + 9); for (let i = 0; i < 60; i++) { const px = x + (p() - .5) * 1100 + sin(t * .3 + i) * 30, py = y + 150 + p() * 700 + cos(t * .25 + i) * 20; disc(px, py, 1 + p() * 1.6, `rgba(${rgb},${a * (.2 + .3 * sin(t * 2 + i))})`) }
  });
}
function vagalumes(t, n, a, seed = 3, area = [0, 300, W, 800]) { if (a <= 0) return; const q = rng(seed); add(() => { for (let i = 0; i < n; i++) { const x = area[0] + q() * area[2] + sin(t * .4 + i) * 40, y = area[1] + q() * area[3] + cos(t * .33 + i * 2) * 25, b = Math.max(0, sin(t * (1 + q()) + q() * 9)) ** 3 * a; glow(x, y, 14, '200,255,140', .5 * b); disc(x, y, 1.6, `rgba(230,255,190,${b})`) } }) }
function chuva(t, a, seed = 8, ang = .15) { if (a <= 0) return; const q = rng(seed); c.save(); c.strokeStyle = `rgba(210,225,225,${.28 * a})`; c.lineWidth = 1.4; c.beginPath(); for (let i = 0; i < 520; i++) { const sp = 1400 + q() * 600, x0 = q() * (W + 300), y = ((q() * H + t * sp) % (H + 200)) - 100, x = x0 - y * ang, l = 30 + q() * 40; c.moveTo(x, y); c.lineTo(x - l * ang, y + l) } c.stroke(); c.restore() }

// ---------- camadas da mata ----------
function camFundo(pk, seed, hy, o = {}) { // parede de copas ao longe, com névoa
  const p = PAL[pk];
  return camada(`fundo|${pk}|${seed}|${hy}|${o.samauma}`, W + 800, H, (w, h) => {
    const q = rng(seed), lx = p.lx;
    if (o.samauma) { const sx = w * (o.samauma), sy = hy - 330; c.fillStyle = mix(p.far, p.haze, .35); c.fillRect(sx - 20, sy, 40, hy - sy + 100); for (const s of [-1, 1]) { c.strokeStyle = mix(p.far, p.haze, .35); c.lineWidth = 14; c.beginPath(); c.moveTo(sx, sy + 40); c.quadraticCurveTo(sx + s * 120, sy - 10, sx + s * 260, sy - 40); c.stroke() } copa(sx, sy - 70, 260, [mix(p.far, p.haze, .4), mix(p.far, p.haze, .25), mix(p.far, '#ffffff', .12)], lx, q, p.rim) }
    for (let row = 0; row < 3; row++) {
      const hz = .55 - row * .22, cols = [mix(p.far, p.haze, hz), mix(p.far, p.haze, hz - .12), mix(p.far, '#ffffff', .08 + (2 - row) * .03)];
      for (let x = -80; x < w + 80; x += 90 + q() * 70) copa(x, hy - 120 + row * 60 + (q() - .5) * 80, 90 + q() * 70 + row * 20, cols, lx, q, row === 2 ? p.rim : null);
      c.fillStyle = cols[0]; c.fillRect(0, hy - 40 + row * 60, w, h);
    }
    c.fillStyle = lg(0, hy - 200, 0, hy + 140, [[0, `rgba(${p.fog},0)`], [.6, `rgba(${p.fog},.22)`], [1, `rgba(${p.fog},.05)`]]); c.fillRect(0, hy - 200, w, 340);
  });
}
function camTroncos(pk, seed, hy, plano, o = {}) { // plano 0 = longe, 1 = meio
  const p = PAL[pk];
  return camada(`troncos|${pk}|${seed}|${hy}|${plano}|${o.palmas ?? 1}`, W + 800, H, (w, h) => {
    const q = rng(seed + plano * 17), hz = plano ? .1 : .38, lx = p.lx;
    const esc = mix(p.mid, p.haze, hz), med = mix(p.mid, p.haze, hz + .14), luz = mix(p.mid, '#d8d0b0', .12 + hz * .4);
    const cols = [mix(p.folhas[0], p.haze, hz), mix(p.folhas[1], p.haze, hz), mix(p.folhas[2], p.haze, hz * .8)];
    const base = hy + (plano ? 60 : 10);
    for (let k = 0; k < (plano ? 7 : 11); k++) {
      const x = q() * w, tw = plano ? 40 + q() * 80 : 18 + q() * 34;
      if (q() < .3 * (o.palmas ?? 1)) palmeira(x, base + 10, (plano ? 520 : 360) + q() * 200, [esc, cols[1], cols[2]], q);
      else tronco(x, base + q() * 30, tw, base + 80, { esc, med, luz, lx, raiz: plano ? .8 + q() * .5 : .5, musgo: mix(p.folhas[2], p.haze, hz) }, q);
    }
    for (let k = 0; k < (plano ? 10 : 14); k++) { const x = q() * w; c.strokeStyle = esc; c.lineWidth = plano ? 4 : 2.5; c.beginPath(); c.moveTo(x, -10); c.quadraticCurveTo(x + (q() - .5) * 120, base * .5, x + (q() - .5) * 80, base * (.4 + q() * .6)); c.stroke() }
    for (let x = -60; x < w + 60; x += 60 + q() * 80) copa(x, (plano ? 30 : 60) + q() * 140, 120 + q() * 90, cols, lx, q, plano ? p.rim : null);
    for (let x = 0; x < w; x += 70 + q() * 90) { const s = (plano ? 90 : 60) + q() * 60; if (q() < .5) samambaia(x, base + 40, s, cols[1], q); else for (let j = 0; j < 4; j++) folha(x + j * 10, base + 50, s * (.8 + q() * .5), -PI / 2 + (j - 1.5) * .45, s * .16, cols[j % 3], null) }
  });
}
function camChao(pk, seed, hy, o = {}) {
  const p = PAL[pk];
  return camada(`chao|${pk}|${seed}|${hy}|${o.trilha}|${o.agua}|${o.lama}`, W + 800, H, (w, h) => {
    const q = rng(seed + 3); c.fillStyle = lg(0, hy, 0, h, [[0, mix(p.chao, p.haze, .3)], [1, p.chao]]); c.fillRect(0, hy, w, h - hy);
    if (o.agua) { const ay = hy + (o.agua.y ?? 120), ah = o.agua.h ?? 160; c.fillStyle = lg(0, ay, 0, ay + ah, [[0, mix(p.agua, p.haze, .3)], [1, p.agua]]); c.beginPath(); c.moveTo(0, ay + 20); for (let x = 0; x <= w; x += 60) c.lineTo(x, ay + sin(x * .006) * 16); c.lineTo(w, ay + ah); for (let x = w; x >= 0; x -= 60) c.lineTo(x, ay + ah + sin(x * .005 + 1) * 20); c.closePath(); c.fill();
      for (let i = 0; i < 60; i++) pill(q() * w, ay + 10 + q() * (ah - 20), 40 + q() * 160, 2 + q() * 2, `rgba(${p.luz},${.08 + q() * .12})`) }
    if (o.trilha) { // trilha em perspectiva, sumindo entre as árvores
      const cx = w / 2 + (o.trilha.dx ?? 0), cv2 = o.trilha.curva ?? 120;
      c.fillStyle = lg(0, hy, 0, h, [[0, mix(p.trilha, p.haze, .35)], [1, p.trilha]]); c.beginPath(); c.moveTo(cx - 30 + cv2, hy + 8); c.bezierCurveTo(cx + cv2 * .4, hy + 120, cx - 260, h - 200, cx - 620, h + 10); c.lineTo(cx + 560, h + 10); c.bezierCurveTo(cx + 260, h - 200, cx + cv2 * .7 + 40, hy + 120, cx + 30 + cv2, hy + 8); c.closePath(); c.fill();
      for (let i = 0; i < 260; i++) { const u = q(), yy = lerp(hy + 10, h, u * u), xx = cx + (q() - .5) * lerp(60, 1200, u * u); ell(xx, yy, lerp(1.5, 9, u), lerp(.8, 4, u), q() * 3, `rgba(${q() < .5 ? '0,0,0' : p.luz},${.08 + q() * .12})`) }
      if (o.lama) for (let i = 0; i < 7; i++) { const u = .35 + q() * .6, yy = lerp(hy + 40, h - 60, u), xx = cx + (q() - .5) * lerp(80, 600, u), rx = lerp(20, 120, u), ry = lerp(4, 20, u), pts = []; for (let k = 0; k < 9; k++) { const a = k / 9 * TAU, rr = .75 + q() * .4; pts.push([xx + cos(a) * rx * rr, yy + sin(a) * ry * rr]) } blob(pts, `rgba(25,18,10,.45)`); c.save(); c.translate(0, -ry * .15); c.scale(1, 1); blob(pts.map(([a, b]) => [xx + (a - xx) * .8, yy + (b - yy) * .55 - ry * .1]), `rgba(${p.luz},.12)`); c.restore() }
    }
    for (let x = -40; x < w + 40; x += 26 + q() * 30) { const r = 30 + q() * 50; tufo(x, hy + 6 + q() * 20, r, [mix(p.folhas[0], p.haze, .25), mix(p.folhas[1], p.haze, .22), mix(p.folhas[2], p.haze, .2)], p.lx, q, null) }
    for (let i = 0; i < 900; i++) { const u = q(), yy = lerp(hy + 30, h, u), xx = q() * w, s = lerp(2, 12, u); ell(xx, yy, s, s * .4, q() * 3, [p.folhas[0], p.folhas[1], p.terra, mix(p.terra, '#8a5a2a', .4)][i % 4]) }
    for (let k = 0; k < 9; k++) { const x0 = q() * w, y0 = hy + 30 + q() * (h - hy - 60); c.strokeStyle = mix(p.mid, p.terra, .5); c.lineWidth = 4 + q() * 10; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y0); c.bezierCurveTo(x0 + 80, y0 - 20, x0 + 160, y0 + 30, x0 + 260 + q() * 200, y0 + 10); c.stroke(); c.strokeStyle = `rgba(${p.luz},.1)`; c.lineWidth = 2; c.stroke() }
    if (o.tronco) { const tx = w * .5 + (o.tronco.dx ?? 300), ty = hy + (o.tronco.y ?? 160); c.save(); c.translate(tx, ty); c.rotate(-.05); c.fillStyle = lg(0, -50, 0, 40, [[0, mix(p.mid, '#c8b890', .2)], [.5, p.mid], [1, '#050505']]); c.beginPath(); c.roundRect(-420, -46, 840, 92, 46); c.fill(); ell(420, 0, 30, 46, 0, mix(p.terra, '#b08050', .3)); for (let j = 0; j < 8; j++) ell(-300 + j * 80, -38, 40, 10, 0, mix(p.folhas[2], p.haze, .1) + 'aa'); c.restore() }
  });
}
function camFrente(pk, seed, o = {}) { // troncos grandes nas laterais, bem perto
  const p = PAL[pk];
  return camada(`frente|${pk}|${seed}|${o.lados}`, W + 800, H, (w, h) => {
    const q = rng(seed + 41), lx = p.lx, lados = o.lados ?? [.24, .79];
    lados.forEach((fx, i) => tronco(w * fx + (q() - .5) * 100, h + 60, 170 + q() * 120, h + 200, { esc: '#020504', med: p.near, luz: mix(p.near, '#c0b090', .14), lx, raiz: 1.3, musgo: p.folhas[2], rim: p.rim, cipo: mix(p.near, p.folhas[2], .3) }, q));
  });
}
// cena de mata completa. cfg: { pk, seed, hy, px, z, trilha, agua, lama, tronco, samauma, ceu:{...}, nevoa, raios, frente, vento, chuva, atras, meio, perto, vagalumes }
function mata(tl, t, cfg) {
  const p = PAL[cfg.pk], hy = cfg.hy ?? 700, px = cfg.px || 0, z = cfg.z || 1, fy = cfg.fy ?? H * .62, seed = cfg.seed || 1;
  const lay = (img, par, dy = 0) => { const s = 1 + (z - 1) * par; c.save(); c.translate(W / 2, fy); c.scale(s, s); c.translate(-W / 2, -fy); let x0 = -400 - px * par; if (x0 > -100 || x0 < W - img.width + 100) { const iw = img.width; x0 = ((x0 % iw) + iw) % iw - iw; for (let x = x0; x < W + 200; x += iw) c.drawImage(img, x, dy) } else c.drawImage(img, x0, dy); c.restore() };
  const scr = (par, fn) => { const s = 1 + (z - 1) * par; c.save(); c.translate(W / 2, fy); c.scale(s, s); c.translate(-W / 2 - px * par, -fy); fn(); c.restore() };
  c.save(); c.translate(0, cfg.dy || 0);
  ceu(p, Object.assign({ hy, t }, cfg.ceu || {}));
  lay(camFundo(cfg.pk, seed, hy, { samauma: cfg.samauma }), .15);
  neblina(hy - 40, 260, (cfg.nevoa ?? .5) * .9, t, p.fog, 8, seed * 300);
  if (cfg.atras) scr(.3, () => cfg.atras(tl, t));
  if (cfg.troncos !== 0) lay(camTroncos(cfg.pk, seed, hy, 0, cfg), .35);
  neblina(hy + 40, 320, (cfg.nevoa ?? .5) * .8, t, p.fog, 14, seed * 500);
  lay(camChao(cfg.pk, seed, hy, cfg), .75);
  if (cfg.troncos !== 0) lay(camTroncos(cfg.pk, seed, hy, 1, cfg), .6);
  if (cfg.meio) scr(.75, () => cfg.meio(tl, t));
  neblina(hy + 220, 360, (cfg.nevoa ?? .5) * .45, t, p.fog, 20, seed * 700);
  if (cfg.raios) raios(cfg.raios[0], cfg.raios[1] ?? -100, cfg.raios[2] ?? -.25 * p.lx, cfg.raios[3] ?? 7, cfg.raios[4] ?? .8, p.luz, t, seed);
  if (cfg.perto) scr(1, () => cfg.perto(tl, t));
  if (cfg.frente !== 0) lay(camFrente(cfg.pk, seed, { lados: cfg.lados }), 1.2);
  if (cfg.cipos !== 0) scr(1.3, () => cipos(t, seed + 7, cfg.cipos || 7, [p.near, mix(p.near, p.folhas[1], .4)], { vento: cfg.vento ?? 1 }));
  if (cfg.vagalumes) vagalumes(t, 40, cfg.vagalumes, seed);
  if (cfg.folhas !== 0) folhagemFrente(t, seed, p, cfg.vento ?? 1, cfg.folhas || 1);
  if (cfg.chuva) chuva(t, cfg.chuva, seed);
  c.restore();
}
// folhas grandes e escuras na frente da câmera, mexendo com o vento
function folhagemFrente(t, seed, p, vento, k = 1) {
  const q = rng(seed + 99);
  for (let i = 0; i < 14 * k; i++) {
    const side = q() < .5 ? -1 : 1, x = side < 0 ? q() * 360 - 60 : W - q() * 360 + 60, y = H + 30 - q() * 160, len = 260 + q() * 300, ang = -PI / 2 + side * (.3 + q() * .9) * -1 + sin(t * (.7 + q() * .5) + i) * .05 * vento;
    folha(x, y, len, ang, len * (.14 + q() * .1), i % 3 ? '#030806' : mix(p.near, '#000000', .3), 'rgba(255,255,255,.035)');
  }
}
