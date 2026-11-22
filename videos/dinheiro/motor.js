// ===== Motor de pixel art: tudo é desenhado numa tela pequena (180×320) e ampliado 6× sem suavizar =====
const W = 1080, H = 1920, PW = 180, PH = 320, K = 6, PI = Math.PI, { sin, cos, floor, abs, min, max, sqrt, hypot } = Math;
const cv = document.getElementById('c'), CC = cv.getContext('2d');
const mk = () => { const k = document.createElement('canvas'); k.width = PW; k.height = PH; return k };
const bufA = mk(), bufB = mk(); let p = bufA.getContext('2d');
const lerp = (a, b, u) => a + (b - a) * u, clamp = (x, a, b) => min(b, max(a, x)), ramp = (t, a, b) => clamp((t - a) / (b - a), 0, 1), ease = u => u * u * (3 - 2 * u);
function rng(s) { s = s % 2147483647 || 1; return () => (s = (s * 16807) % 2147483647, (s - 1) / 2147483646) }
const R = (x, y, w, h, col) => { p.fillStyle = col; p.fillRect(floor(x), floor(y), floor(w), floor(h)) };
const px = (x, y, col) => R(x, y, 1, 1, col);
function disco(x, y, r, col) { x = floor(x); y = floor(y); for (let j = -r; j <= r; j++) { const w = floor(sqrt(max(0, r * r - j * j))); R(x - w, y + j, 2 * w + 1, 1, col) } }
function elipse(x, y, rx, ry, col) { x = floor(x); y = floor(y); for (let j = -ry; j <= ry; j++) { const w = floor(rx * sqrt(max(0, 1 - (j * j) / (ry * ry)))); R(x - w, y + j, 2 * w + 1, 1, col) } }
function linha(x0, y0, x1, y1, col, e = 1, pont = 0) { const n = max(abs(x1 - x0), abs(y1 - y0)) | 0; for (let i = 0; i <= n; i++) { if (pont && floor(i / pont) % 2) continue; const u = n ? i / n : 0; R(lerp(x0, x1, u), lerp(y0, y1, u), e, e, col) } }
// sprite: cada letra é uma cor da paleta; '.' é transparente; e = escala
function sprite(rows, pal, x, y, flip, e = 1) { rows.forEach((s, j) => [...s].forEach((ch, i) => { if (ch !== '.' && pal[ch]) R(x + (flip ? s.length - 1 - i : i) * e, y + j * e, e, e, pal[ch]) })) }
const larg = rows => rows[0].length;
// degradê em faixas com pontilhado (cara de 16 bits)
function faixas(y0, y1, cores) { const n = cores.length, h = (y1 - y0) / n; for (let k = 0; k < n; k++) { R(0, y0 + k * h, PW, h + 1, cores[k]); if (k < n - 1) for (let x = 0; x < PW; x += 2) { px(x + ((k) % 2), floor(y0 + (k + 1) * h) - 1, cores[k + 1]); px(x + 1, floor(y0 + (k + 1) * h) - 2 + (x % 4 ? 0 : 0), cores[k + 1]) } } }
const P = { pre: '#0d0b14', esc: '#1c1830', ama: '#ffd23a', our: '#f0b030', our2: '#c07818', our3: '#7a4810', pra: '#d8dce8', pra2: '#9aa0b8', pra3: '#5a6078', bra: '#ffffff', cre: '#f4e4c0', ver: '#e83040', vd: '#3caa50', vd2: '#26783a', az: '#3a78d8', az2: '#24448e', ceu: '#7ac0f0', mar: '#2a6ab8', ter: '#8a5a30', ter2: '#5a3a20', are: '#e0c080', are2: '#c09858', pel: '#e8b890', pel2: '#b07850', pel3: '#7a4a2a', cin: '#6a6a80' };

// estrelas
const EST = (() => { const q = rng(7), a = []; for (let i = 0; i < 140; i++) a.push([floor(q() * PW), floor(q() * PH), q()]); return a })();
function estrelas(t, ate = PH) { EST.forEach(([x, y, f]) => { if (y >= ate) return; const b = sin(t * (2 + f * 3) + f * 40); px(x, y, b > .7 ? '#ffffff' : b > -.2 ? '#8a9ad0' : '#3a4270') }) }

// ---------- texto em resolução cheia (fonte pixel Pixelify Sans) ----------
let FILA = [];
function txt(s, x, y, size, col, o = {}) { FILA.push([s, x, y, size, col, o]) }
function desenhaTextos() { FILA.forEach(([s, x, y, size, col, o]) => { if ((o.a ?? 1) <= 0 || !s) return; CC.save(); CC.globalAlpha = o.a ?? 1; let sz = floor(max(size, 30) * 1.4); CC.font = `700 ${sz}px "Pixelify Sans"`; CC.textAlign = o.align || 'center'; CC.textBaseline = 'alphabetic';
  const mw = o.max || W - 70; while (CC.measureText(s).width > mw && sz > 24) { sz -= 2; CC.font = `700 ${sz}px "Pixelify Sans"` }
  const e = max(3, floor(sz / 14)); CC.fillStyle = 'rgba(10,8,18,.9)'; CC.fillText(s, x + e, y + e); CC.fillText(s, x, y + e); CC.fillText(s, x + e, y); CC.fillText(s, x + 2 * e, y + 2 * e); CC.fillStyle = col; CC.fillText(s, x, y); CC.restore() }); FILA = [] }
function maquina(s, tl, t0, cps = 20) { const n = floor(clamp((tl - t0) * cps, 0, s.length)); return s.slice(0, n) + (n > 0 && n < s.length && floor(tl * 6) % 2 ? '_' : '') }
// placa no alto da tela: título + subtítulo, escritos letra a letra
function placa(tl, tit, sub, o = {}) { const t0 = o.t0 ?? .3; txt(maquina(tit, tl, t0, 22), 540, o.y ?? 250, o.size ?? 54, o.cor ?? P.ama); if (sub) txt(maquina(sub, tl, t0 + .4, 26), 540, (o.y ?? 250) + (o.dy ?? 64), o.size2 ?? 28, P.bra) }
// número/palavra grande que entra "pulando"
function grande(tl, s, y, size, col, t0 = .2) { const u = ramp(tl, t0, t0 + .25); if (u <= 0) return; const b = u < 1 ? 1 + .25 * sin(u * PI) : 1; txt(s, 540, y, size * b, col) }

// ---------- cenas, transições e legenda ----------
const SH = [];
const shot = (a, b, fn) => SH.push({ a, b, fn });
const L = i => CUTS[i + 1] - CUTS[i];
function legenda(t) { const g = LEG.find(g => t >= g.t0 && t < g.t1); if (!g) return; CC.font = '700 56px "Pixelify Sans"'; const parts = g.w.map(w => w[0]);
  const linhas = [[]]; parts.forEach((w, i) => { const l = linhas[linhas.length - 1]; const cand = [...l.map(i2 => parts[i2]), w].join(' '); if (l.length && CC.measureText(cand).width > W - 140) linhas.push([i]); else l.push(i) });
  linhas.forEach((l, li) => { let x = (W - CC.measureText(l.map(i => parts[i]).join(' ')).width) / 2; const y = 1650 + li * 72; l.forEach(i => { const [w, a] = g.w[i], dito = t >= a; const col = !dito ? 'rgba(255,255,255,.4)' : g.dest === i ? P.ama : '#ffffff'; FILA.push([w, x, y, 40, col, { align: 'left' }]); CC.font = '700 56px "Pixelify Sans"'; x += CC.measureText(w + ' ').width }) }) }
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5], TR = .45;
function render(t) {
  const i = max(0, SH.findIndex(s => t >= s.a && t < s.b)), s = SH[i]; p = bufA.getContext('2d'); p.clearRect(0, 0, PW, PH); s.fn(t - s.a, t); const tA = FILA; FILA = [];
  let dither = null; if (i > 0 && t - s.a < TR) { const ant = SH[i - 1]; p = bufB.getContext('2d'); p.clearRect(0, 0, PW, PH); ant.fn(t - ant.a, t); const tB = FILA; FILA = []; dither = (t - s.a) / TR; FILA.push(...(dither < .5 ? tB : tA)) } else FILA.push(...tA);
  if (dither !== null) { const ga = bufA.getContext('2d'), da = ga.getImageData(0, 0, PW, PH), db = bufB.getContext('2d').getImageData(0, 0, PW, PH), lim = dither * 16;
    for (let y = 0; y < PH; y++) for (let x = 0; x < PW; x++) { if (BAYER[(floor(y / 2) % 4) * 4 + (floor(x / 2) % 4)] >= lim) { const k = (y * PW + x) * 4; da.data[k] = db.data[k]; da.data[k + 1] = db.data[k + 1]; da.data[k + 2] = db.data[k + 2]; da.data[k + 3] = db.data[k + 3] } } ga.putImageData(da, 0, 0) }
  CC.imageSmoothingEnabled = false; CC.fillStyle = '#000'; CC.fillRect(0, 0, W, H); CC.drawImage(bufA, 0, 0, W, H);
  CC.fillStyle = 'rgba(0,0,0,.10)'; for (let y = 0; y < H; y += K) CC.fillRect(0, y + K - 1, W, 1); // linhas de TV
  // faixa escura atrás da legenda
  const g = CC.createLinearGradient(0, 1540, 0, 1800); g.addColorStop(0, 'rgba(8,6,16,0)'); g.addColorStop(.4, 'rgba(8,6,16,.55)'); g.addColorStop(1, 'rgba(8,6,16,.55)'); CC.fillStyle = g; CC.fillRect(0, 1540, W, 380);
  legenda(t); desenhaTextos();
  const f = min(ramp(t, 0, .3), 1 - ramp(t, DUR - .5, DUR)); if (f < 1) { CC.fillStyle = `rgba(0,0,0,${1 - f})`; CC.fillRect(0, 0, W, H) } }
