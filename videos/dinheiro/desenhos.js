// ===== Desenhos em pixel: pessoas, objetos, moedas e cenários =====
// pessoa (~26 px de altura, pés em y). o: pele, cab, roupa, calca, chapeu ('coroa','turbante','gorro','capacete','boina','toga'), anda, braco ('cima','frente','ambos'), flip, barba, t
function pessoa(x, y, o = {}) { x = floor(x); y = floor(y); const t = o.t || 0, an = o.anda ? floor(t * 6) % 2 : 0, f = o.flip ? -1 : 1, pele = o.pele || P.pel, cab = o.cab || '#3a2414', roupa = o.roupa || '#a04030', calca = o.calca || '#4a3a2a';
  const sombra = 'rgba(0,0,0,.25)'; elipse(x, y + 1, 6, 1, sombra);
  // pernas
  R(x - 3, y - 8 + (an ? 1 : 0), 2, 8 - (an ? 1 : 0), calca); R(x + 1, y - 8 + (an ? 0 : 1), 2, 8 - (an ? 0 : 1), calca); R(x - 3, y - 1, 3, 1, '#2a1a10'); R(x + 1, y - 1, 3, 1, '#2a1a10');
  // corpo (túnica/toga mais longa)
  const longo = o.longo ? 4 : 0; R(x - 4, y - 17, 8, 9 + longo, roupa); R(x - 4, y - 17, 8, 1, 'rgba(255,255,255,.2)'); R(x + (f > 0 ? 2 : -4), y - 16, 2, 8 + longo, 'rgba(0,0,0,.18)'); if (o.cinto) R(x - 4, y - 10, 8, 1, o.cinto);
  // braços
  const br = o.braco; const bx1 = x - 5, bx2 = x + 4;
  if (br === 'cima' || br === 'ambos') { R(f > 0 ? bx2 : bx1, y - 23, 1.5, 7, roupa); R(f > 0 ? bx2 : bx1, y - 24, 2, 2, pele) } else if (br === 'frente') { R(f > 0 ? bx2 : bx1 - 3, y - 15, 4, 2, roupa); R(f > 0 ? bx2 + 4 : bx1 - 4, y - 15, 2, 2, pele) } else { R(f > 0 ? bx2 : bx1, y - 16 + (an ? 1 : 0), 1.5, 7, roupa); R(f > 0 ? bx2 : bx1, y - 10 + (an ? 1 : 0), 2, 2, pele) }
  if (br === 'ambos') { R(f > 0 ? bx1 : bx2, y - 23, 1.5, 7, roupa); R(f > 0 ? bx1 : bx2, y - 24, 2, 2, pele) } else { R(f > 0 ? bx1 : bx2, y - 16 + (an ? 0 : 1), 1.5, 7, roupa); R(f > 0 ? bx1 : bx2, y - 10 + (an ? 0 : 1), 2, 2, pele) }
  // cabeça
  R(x - 3, y - 24, 6, 7, pele); R(x - 3, y - 18, 6, 1, o.pele2 || P.pel2); px(x + (f > 0 ? 1 : -2), y - 22, '#1a1018'); px(x + (f > 0 ? 2 : -3), y - 20, o.pele2 || P.pel2);
  R(x - 3, y - 25, 6, 2, cab); R(x + (f > 0 ? -3 : 2), y - 24, 1, 4, cab); if (o.barba) R(x - 3, y - 19, 6, 2, cab);
  const ch = o.chapeu;
  if (ch === 'coroa') { R(x - 3, y - 27, 6, 2, P.our); px(x - 3, y - 28, P.our); px(x, y - 28, P.our); px(x + 2, y - 28, P.our); px(x, y - 27, P.ver) }
  if (ch === 'turbante') { R(x - 4, y - 27, 8, 3, o.chapCor || '#e8e0c8'); px(x, y - 28, o.chapCor || '#e8e0c8') }
  if (ch === 'gorro') { R(x - 4, y - 27, 8, 2, o.chapCor || '#8a2a2a'); R(x - 3, y - 29, 5, 2, o.chapCor || '#8a2a2a') }
  if (ch === 'capacete') { R(x - 4, y - 27, 8, 3, '#c8a050'); R(x - 1, y - 30, 2, 3, P.ver) }
  if (ch === 'boina') { R(x - 4, y - 26, 9, 2, o.chapCor || '#2a2a50'); R(x - 3, y - 27, 6, 1, o.chapCor || '#2a2a50') }
  if (ch === 'cartola') { R(x - 4, y - 26, 8, 1, '#1a1a22'); R(x - 3, y - 32, 6, 6, '#1a1a22') }
  if (ch === 'lampada') { R(x - 4, y - 27, 8, 3, '#e8c020'); disco(x, y - 27, 1, '#ffffa0') }
}
// ---------- objetos (sprites) ----------
const SP = {
  peixe: [['..bbbb...b', '.bbbbbb.bb', 'bebbbbbbbb', '.bbbbbb.bb', '..bbbb...b'], { b: '#8ac0e0', e: '#1a1018' }],
  saco: [['..t..t..', '...tt...', '..ssss..', '.ssssss.', 'ssssssss', 'ssmsmsss', 'ssssssss', 'sssssss.', '.ssssss.'], { t: '#e8c040', s: '#c8a068', m: '#8a6a40' }],
  sal: [['...kk...', '..ssss..', '.ssssss.', 'ssssssss', 'ssssssss', 'ssssssss', '.ssssss.'], { k: '#8a6a40', s: '#f4f4f8' }],
  ovelha: [['..wwwwww....', '.wwwwwwwwkk.', 'wwwwwwwwwkkk', 'wwwwwwwwwkek', '.wwwwwwwww..', '..k.k..k.k..', '..k.k..k.k..'], { w: '#f4f0e8', k: '#3a3030', e: '#fff' }],
  vaca: [['...........h.h', '.wwbbwwwwww.kk', 'wwwbbwwwbbwkkk', 'wwwwwwwwbbwkek', '.wwwwbbwwwww..', '..wwwwwwwww...', '..k.k....k.k..', '..k.k....k.k..'], { w: '#f4f0e8', b: '#3a3030', k: '#5a4040', h: '#e8e0c0', e: '#fff' }],
  concha: [['.cccc.', 'cdcdcc', 'ccdcdc', 'cdcdcc', '.cccc.'], { c: '#f4e8d0', d: '#c8a880' }],
  tabuleta: [['.bbbbbbbbbb.', 'bccccccccccb', 'bc.c..c.cc.b', 'bccccccccccb', 'bcc.c..c.c.b', 'bccccccccccb', 'bc.cc.c..ccb', 'bccccccccccb', 'bcc.c.cc.c.b', 'bccccccccccb', '.bbbbbbbbbb.'], { b: '#8a5a30', c: '#c08a50', '.': null }],
  nota: [['gggggggggggggg', 'gddddddddddddg', 'gd.o....ddddg.', 'gdooo...d..dg', 'gd.o....ddddg.', 'gddddddddddddg', 'gggggggggggggg'], { g: '#2a8a4a', d: '#6ac080', o: '#f0d060' }],
  barra: [['..oooooo..', '.oyyyyyyo.', 'oyyyyyyyyo', 'oooooooooo'], { o: '#c07818', y: '#ffd23a' }],
  cel: [['kkkkkkk', 'kbbbbbk', 'kbbbbbk', 'kbbbbbk', 'kbbbbbk', 'kbbbbbk', 'kbbbbbk', 'kkkokkk'], { k: '#1a1a22', b: '#3aa0e0', o: '#8a8a9a' }],
  cartao: [['aaaaaaaaaaaa', 'aaaaaaaaaaaa', 'aooaaaaaaaaa', 'aooaaaaaaaaa', 'aaaaaaaaaaaa', 'abbbabbbabba', 'aaaaaaaaaaaa'], { a: '#3a54b8', o: '#f0c040', b: '#c8d8ff' }],
  cafe: [['.s.s..', '..s.s.', 'wwwwww.', 'wccccww', 'wccccw.w', 'wwwwww.', '.wwww..'], { s: '#c8c8d8', w: '#f4f4f8', c: '#6a3a1a' }],
  navio: [['......m.......', '.....wm.......', '....wwm.ww....', '...wwwmwww....', '..wwwwmwwww...', '......m.......', 'bbbbbbbbbbbbbb', '.bbbbbbbbbbbb.', '..bbbbbbbbbb..'], { m: '#5a3a20', w: '#f4ead0', b: '#7a4a24' }],
  carta: [['wwwwwwwwww', 'wlllllllww', 'wwwwwwwwww', 'wllllllwww', 'wwwwwwwwww', 'wlllllwwrw', 'wwwwwwwrrr'], { w: '#f4e8c8', l: '#8a7a5a', r: '#c02030' }],
};
const sp = (n, x, y, e = 1, flip = false) => sprite(SP[n][0], SP[n][1], floor(x), floor(y), flip, e);
// moeda em pixel (r = raio), com relevo (máscara de 9×9) e brilho; giro = cos do ângulo (efeito de girar)
const RELEVO = {
  leao: ['..##.##..', '.#######.', '##.###.##', '#########', '.#######.', '..#.#.#..', '.##...##.', '.#.....#.', '.........'],
  coruja: ['.#.....#.', '.##...##.', '#########', '#.#####.#', '##.###.##', '.#######.', '.#######.', '..#####..', '..#...#..'],
  perfil: ['...###...', '..#####..', '.######..', '.#####...', '######...', '.#####...', '..####...', '..####...', '..#####..'],
  furo: ['.........', '.........', '.........', '...###...', '...###...', '...###...', '.........', '.........', '.........'],
  cifrao: ['....#....', '..####...', '.#..#....', '.#..#....', '..####...', '....#.#..', '....#.#..', '.#####...', '....#....'],
  b: ['.#.#.....', '#####....', '.#..#....', '.#..#....', '.###.....', '.#..#....', '.#..#....', '#####....', '.#.#.....'],
};
function moeda(x, y, r, o = {}) { x = floor(x); y = floor(y); const giro = o.giro ?? 1, rx = max(1, floor(r * abs(giro))), c1 = o.c1 || P.our, c2 = o.c2 || P.our2, c3 = o.c3 || P.our3;
  elipse(x + 1, y + 1, rx, r, 'rgba(0,0,0,.3)'); elipse(x, y, rx, r, c3); elipse(x, y, max(1, rx - 1), r - 1, c2); elipse(x - (rx > 3 ? 1 : 0), y - 1, max(1, rx - 2), r - 2, c1);
  if (abs(giro) > .5 && o.relevo && r >= 6) { const m = RELEVO[o.relevo], e = max(1, floor((r * 1.25) / 9)); const ox = x - floor(4.5 * e * abs(giro)), oy = y - floor(4.5 * e); m.forEach((s, j) => [...s].forEach((ch, i) => { if (ch === '#') { R(ox + i * e * abs(giro), oy + j * e + 1, max(1, e * abs(giro)), e, c3); R(ox + i * e * abs(giro), oy + j * e, max(1, e * abs(giro)), e, o.rel || c2) } })); if (o.relevo === 'furo') R(x - floor(r * .3 * abs(giro)), y - floor(r * .3), floor(r * .6 * abs(giro)) + 1, floor(r * .6) + 1, o.fundo || '#1c1830') }
  if (abs(giro) > .3) { px(x - floor(rx * .5), y - floor(r * .6), '#fff8d0'); px(x - floor(rx * .5) + 1, y - floor(r * .6), '#fff8d0'); px(x - floor(rx * .5), y - floor(r * .6) + 1, '#fff8d0') } }
const PRATA = { c1: '#e8ecf4', c2: '#a8b0c4', c3: '#5a6078' }, BRONZE = { c1: '#d89058', c2: '#a05a28', c3: '#5a3010' }, ELECTRO = { c1: '#f0dc80', c2: '#c0a040', c3: '#6a5418' };
// cédula grande
function cedula(x, y, w, h, o = {}) { x = floor(x); y = floor(y); const c1 = o.c1 || '#3a9a5a', c2 = o.c2 || '#7ac88a', c3 = o.c3 || '#1e5a34'; R(x + 1, y + 1, w, h, 'rgba(0,0,0,.3)'); R(x, y, w, h, c1); R(x + 1, y + 1, w - 2, h - 2, c2); R(x + 2, y + 2, w - 4, h - 4, c1);
  for (let i = 4; i < w - 4; i += 3) px(x + i, y + 3, c2); disco(x + floor(w * .3), y + floor(h / 2), floor(h * .28), c2); disco(x + floor(w * .3), y + floor(h / 2), floor(h * .2), c3); if (o.txt) R(x + floor(w * .6), y + floor(h * .3), floor(w * .25), 2, c3); R(x + floor(w * .6), y + floor(h * .55), floor(w * .3), 1, c3); R(x + floor(w * .6), y + floor(h * .7), floor(w * .2), 1, c3) }
// ---------- cenários ----------
function ceuDia(cores = ['#3a78c8', '#5a98e0', '#7ab8f0', '#a8d4f8']) { faixas(0, 200, cores) }
function nuvem(x, y, e = 1) { x = floor(x); [[0, 2, 14, 4], [3, 0, 8, 3], [10, 1, 6, 3]].forEach(([a, b, w, h]) => R(x + a * e, y + b * e, w * e, h * e, '#f4f8ff')); R(x, y + 5 * e, 16 * e, 1 * e, '#c8d8f0') }
function sol(x, y, r, cor = '#fff0a0') { disco(x, y, r + 2, 'rgba(255,240,160,.25)'); disco(x, y, r, cor) }
function chao(y0, c1, c2, seed = 1) { R(0, y0, PW, PH - y0, c1); const q = rng(seed); for (let i = 0; i < 120; i++) R(q() * PW, y0 + 1 + q() * (PH - y0), 2 + q() * 3, 1, c2) }
function montanhas(y, cor, seed, amp = 30) { const q = rng(seed); let h = amp * .5; for (let x = 0; x < PW; x++) { h = clamp(h + (q() - .5) * 4, amp * .2, amp); R(x, y - h, 1, h + 1, cor) } }
function palmeira(x, y) { R(x, y - 20, 2, 20, '#7a5a30'); [[-8, -22], [8, -22], [-6, -26], [6, -25], [0, -27]].forEach(([dx, dy]) => linha(x + 1, y - 20, x + 1 + dx, y + dy + 2, P.vd2, 2)) }
function casinha(x, y, w, h, cor, telhado) { R(x, y - h, w, h, cor); for (let i = 0; i < w; i++) R(x - 1 + i, y - h - floor(min(i, w - i) * .5) - 1, 2, floor(min(i, w - i) * .5) + 1, telhado || '#a04a2a'); R(x + floor(w / 2) - 1, y - 5, 3, 5, '#3a2414'); R(x + 2, y - h + 3, 2, 2, '#ffe080') }
function zigurate(x, y, e = 1) { const cores = ['#c89a58', '#b08048', '#d8aa68']; for (let k = 0; k < 4; k++) { const w = (60 - k * 13) * e, h = 9 * e; R(x - w / 2, y - (k + 1) * h, w, h, cores[k % 3]); R(x - w / 2, y - (k + 1) * h, w, 1, '#e8c088'); for (let i = 0; i < w; i += 4) px(x - w / 2 + i, y - k * h - 3, '#8a6030') } R(x - 3 * e, y - 36 * e, 6 * e, 36 * e, '#a87840'); for (let j = 0; j < 36 * e; j += 2) R(x - 3 * e, y - j, 6 * e, 1, '#c89a58') }
function templo(x, y, w, h, cor = '#e8e0d0', sombra = '#a8a090') { R(x, y - 4, w, 4, sombra); R(x + 2, y - 6, w - 4, 2, cor); const n = floor(w / 7); for (let i = 0; i < n; i++) { const cx = x + 3 + i * (w - 6) / (n - 1) - 1; R(cx, y - 6 - h, 3, h, cor); px(cx + 2, y - 6 - h + 2, sombra); R(cx + 2, y - 6 - h, 1, h, sombra) } R(x, y - 10 - h, w, 4, cor); for (let i = 0; i <= w / 2; i++) R(x + i, y - 10 - h - floor(i * .25), w - 2 * i, 1, i % 3 ? cor : sombra) }
function balanca(x, y, ang = 0, cargaE, cargaD) { R(x - 1, y - 30, 3, 30, '#8a6a40'); R(x - 6, y - 1, 13, 2, '#5a4028'); const dx = 22, dy = Math.round(ang * dx); linha(x - dx, y - 28 + dy, x + dx, y - 28 - dy, '#c8a060', 2); disco(x, y - 29, 2, P.our);
  for (const [s, carga] of [[-1, cargaE], [1, cargaD]]) { const px0 = x + s * dx, py0 = y - 28 - s * dy; linha(px0, py0, px0 - 6, py0 + 12, '#c8a060'); linha(px0, py0, px0 + 6, py0 + 12, '#c8a060'); R(px0 - 8, py0 + 12, 17, 2, '#c8a060'); if (carga) carga(px0, py0 + 12) } }
const MAPA = (() => { const k = document.createElement('canvas'); k.width = 360; k.height = 180; const g = k.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, 360, 180);
  CONTINENTES.forEach(pts => { g.fillStyle = '#0f0'; g.beginPath(); pts.forEach(([lo, la], j) => j ? g.lineTo(lo + 180, 90 - la) : g.moveTo(lo + 180, 90 - la)); g.closePath(); g.fill() });
  const d = g.getImageData(0, 0, 360, 180).data; return (lo, la) => { const x = ((floor(lo + 180) % 360) + 360) % 360, y = clamp(floor(90 - la), 0, 179); return d[(y * 360 + x) * 4 + 1] > 128 } })();
// mapa-múndi em pixel: (lon0..lon1, lat0..lat1) dentro do retângulo x,y,w,h
function mapa(x, y, w, h, lon0, lon1, lat1, lat0, cores = ['#24448e', '#2a54a8', '#5a9a4a', '#3a7a3a']) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const lo = lerp(lon0, lon1, i / w), la = lerp(lat1, lat0, j / h); const terra = MAPA(lo, la); px(x + i, y + j, terra ? ((i + j) % 7 ? cores[2] : cores[3]) : ((i * 3 + j * 5) % 11 ? cores[0] : cores[1])) }
  return (lo, la) => [x + (lo - lon0) / (lon1 - lon0) * w, y + (lat1 - la) / (lat1 - lat0) * h] }
function moldura(cor = P.our) { R(0, 0, PW, 2, cor); R(0, PH - 2, PW, 2, cor); R(0, 0, 2, PH, cor); R(PW - 2, 0, 2, PH, cor) }
function chuvaMoedas(t, n = 30, seed = 3, cor = null) { const q = rng(seed); for (let i = 0; i < n; i++) { const x = q() * PW, v = 30 + q() * 40, y = ((t * v + q() * 400) % 380) - 40, g = cos(t * 4 + i); moeda(x, y, 4 + floor(q() * 3), Object.assign({ giro: g }, cor || {})) } }
function brilhos(t, x, y, r, n = 6, cor = '#fff8c0') { for (let i = 0; i < n; i++) { const a = i * 2.4 + t, d = r * (.5 + .5 * sin(t * 2 + i)), b = sin(t * 5 + i * 1.7); if (b > .3) { const bx = x + cos(a) * d, by = y + sin(a) * d; px(bx, by, cor); px(bx - 1, by, cor); px(bx + 1, by, cor); px(bx, by - 1, cor); px(bx, by + 1, cor) } } }

// ================= VERSÕES DETALHADAS (resolução dupla): pessoas e moedas =================
// clareia/escurece uma cor #rrggbb
function tom(h, k) { const v = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); return '#' + v.map(c => clamp(Math.round(k > 0 ? c + (255 - c) * k : c * (1 + k)), 0, 255).toString(16).padStart(2, '0')).join('') }
function pessoa(x, y, o = {}) { if (o.e) { p.save(); p.translate(f2(x), f2(y)); p.scale(o.e, o.e); pessoa(0, 0, Object.assign({}, o, { e: 0 })); p.restore(); return } const X = f2(x), Y = f2(y), t = o.t || 0, an = o.anda ? floor(t * 6) % 2 : 0, f = o.flip ? -1 : 1;
  const pele = o.pele || P.pel, pele2 = o.pele2 || tom(pele, -.22), cab = o.cab || '#3a2414', roupa = o.roupa || '#a04030', calca = o.calca || '#4a3a2a';
  // N: retângulo em pixels finos, espelhado conforme o lado para onde a pessoa olha
  const N = (nx, ny, nw, nh, col) => { const ax = f > 0 ? nx : -nx - nw; R(X + ax / 2, Y + ny / 2, nw / 2, nh / 2, col) };
  elipse(X, Y + .5, 6, 1, 'rgba(0,0,0,.25)');
  // pernas e sapatos
  const l1 = an ? -2 : 0, l2 = an ? 0 : -2; N(-6, -16 - l1, 5, 16 + l1, calca); N(1, -16 - l2, 5, 16 + l2, tom(calca, -.15)); N(-6, -16 - l1, 1, 16 + l1, tom(calca, .15));
  N(-7, -3 - l1, 7, 3, '#2a1a10'); N(1, -3 - l2, 7, 3, '#22150c'); N(-6, -3 - l1, 3, 1, '#5a3a24');
  // tronco
  const lg = o.longo ? 8 : 0, cor2 = tom(roupa, -.22), cor3 = tom(roupa, .2);
  N(-8, -34, 16, 18 + lg, roupa); N(-8, -34, 3, 18 + lg, cor3); N(4, -34, 4, 18 + lg, cor2); N(-2, -34, 4, 3, pele); N(-1, -31, 2, 2, pele2); for (let k = 0; k < 3; k++) N(-1, -28 + k * 4, 1, 1, cor2);
  if (o.cinto) { N(-8, -20, 16, 2, o.cinto); N(-1, -20, 3, 2, P.ama) } if (lg) N(-8, -17 + lg, 16, 1, cor2);
  // braços (manga + mão)
  const braco = (lado, pose) => { const bx = lado > 0 ? 8 : -11; if (pose === 'cima') { N(bx, -46, 3, 13, lado > 0 ? cor2 : cor3); N(bx, -49, 3, 3, pele) } else if (pose === 'frente') { N(lado > 0 ? 6 : -9, -31, 10, 3, lado > 0 ? cor2 : cor3); N(lado > 0 ? 15 : -12, -32, 3, 4, pele) } else { const d = an ? (lado > 0 ? 1 : -1) : 0; N(bx, -33 + d, 3, 13, lado > 0 ? cor2 : cor3); N(bx, -20 + d, 3, 3, pele) } };
  const b1 = o.braco === 'ambos' ? 'cima' : o.braco, b2 = o.braco === 'ambos' ? 'cima' : null; braco(-1, b2); braco(1, b1);
  // cabeça: rosto com sombra, olho, sobrancelha, nariz, boca e orelha
  N(-2, -37, 4, 3, pele2); N(-6, -49, 12, 13, pele); N(3, -49, 3, 13, pele2); N(-6, -38, 12, 2, pele2);
  N(1, -45, 2, 2, '#1a1018'); N(1, -46, 1, 1, '#ffffff'); N(0, -47, 3, 1, tom(cab, -.1)); N(5, -43, 2, 2, pele2); N(1, -40, 3, 1, tom(pele, -.35)); N(-4, -44, 2, 3, pele2);
  // cabelo
  N(-7, -52, 13, 4, cab); N(-7, -48, 3, 6, cab); N(-5, -52, 6, 1, tom(cab, .25)); if (o.barba) { N(-6, -40, 12, 4, cab); N(-2, -40, 6, 1, pele2); N(0, -39, 3, 1, tom(pele, -.35)) }
  const ch = o.chapeu, cc = o.chapCor;
  if (ch === 'coroa') { N(-6, -55, 12, 4, P.our); N(-6, -55, 12, 1, P.ama); [-6, -1, 4].forEach(a => N(a, -58, 2, 3, P.our)); N(-1, -54, 2, 2, P.ver); N(3, -54, 2, 2, '#3a78d8') }
  if (ch === 'turbante') { const c0 = cc || '#e8e0c8'; N(-8, -55, 16, 6, c0); for (let k = 0; k < 3; k++) N(-8, -54 + k * 2, 16, 1, tom(c0, -.12)); N(-2, -57, 5, 2, c0) }
  if (ch === 'gorro') { const c0 = cc || '#8a2a2a'; N(-8, -54, 16, 4, c0); N(-6, -58, 11, 4, tom(c0, .1)); N(-8, -51, 16, 1, tom(c0, -.25)) }
  if (ch === 'capacete') { N(-8, -55, 16, 6, '#c8a050'); N(-8, -55, 16, 1, '#f0d080'); N(-8, -50, 3, 6, '#a88038'); N(-2, -61, 4, 6, P.ver); N(-1, -61, 2, 6, '#ff6060') }
  if (ch === 'boina') { const c0 = cc || '#2a2a50'; N(-8, -53, 18, 4, c0); N(-6, -55, 12, 2, tom(c0, .15)) }
  if (ch === 'cartola') { N(-9, -52, 18, 2, '#1a1a22'); N(-6, -64, 12, 12, '#1a1a22'); N(-6, -55, 12, 2, '#8a2a2a') } }

// moeda detalhada: borda serrilhada, relevo fino, brilho e giro
function moeda(x, y, r, o = {}) { x = f2(x); y = f2(y); const giro = o.giro ?? 1, g = abs(giro), rx = max(.5, f2(r * g)), c1 = o.c1 || P.our, c2 = o.c2 || P.our2, c3 = o.c3 || P.our3;
  elipse(x + .5, y + .5, rx, r, 'rgba(0,0,0,.3)'); elipse(x, y, rx, r, c3); elipse(x, y, max(.5, rx - .5), r - .5, c2); elipse(x - (rx > 2 ? .5 : 0), y - .5, max(.5, rx - 1.5), r - 1.5, c1);
  if (r >= 5 && g > .4) { const n = floor(r * 3); for (let i = 0; i < n; i++) { const a = i / n * 2 * PI; pf(x + cos(a) * (rx - .8), y + sin(a) * (r - .8), i % 2 ? c2 : tom(c1, .25)) } elipse(x, y, max(.5, rx - 2.5), r - 2.5, tom(c1, -.06)) }
  if (g > .5 && o.relevo && r >= 5) { const m = RELEVO[o.relevo], e = max(.5, f2((r * 1.3) / 9)); const ox = x - 4.5 * e * g, oy = y - 4.5 * e;
    m.forEach((s, j) => [...s].forEach((ch, i) => { if (ch === '#') { R(ox + i * e * g, oy + j * e + .5, max(.5, e * g), e, c3); R(ox + i * e * g, oy + j * e, max(.5, e * g), e, o.rel || tom(c1, .3)) } }));
    if (o.relevo === 'furo') R(x - f2(r * .32 * g), y - f2(r * .32), f2(r * .64 * g) + .5, f2(r * .64) + .5, o.fundo || '#1c1830') }
  if (g > .3) { const hx = x - rx * .5, hy = y - r * .55; pf(hx, hy, '#fffbe0'); pf(hx + .5, hy, '#fffbe0'); pf(hx, hy + .5, '#fffbe0'); pf(hx - .5, hy + 1, tom(c1, .5)); pf(hx + 1, hy - .5, tom(c1, .5)) } }
// chão com textura fina
function chao(y0, c1, c2, seed = 1) { R(0, y0, PW, PH - y0, c1); const q = rng(seed); for (let i = 0; i < 360; i++) R(q() * PW, y0 + .5 + q() * (PH - y0), .5 + q() * 2.5, .5, i % 3 ? c2 : tom(c1, .12)) }
function montanhas(y, cor, seed, amp = 30) { const q = rng(seed); let h = amp * .5; for (let x = 0; x < PW; x += .5) { h = clamp(h + (q() - .5) * 2.4, amp * .2, amp); R(x, y - h, .5, h + 1, cor); pf(x, y - h, tom(cor, .18)) } }
function nuvem(x, y, e = 1) { x = f2(x); [[0, 2, 14, 4], [3, 0, 8, 3], [10, 1, 6, 3]].forEach(([a, b, w, h]) => R(x + a * e, y + b * e, w * e, h * e, '#f4f8ff')); R(x + 3 * e, y, 6 * e, .5, '#ffffff'); R(x, y + 5 * e, 16 * e, 1 * e, '#c8d8f0'); R(x + 1 * e, y + 5.5 * e, 14 * e, .5, '#a8bce0') }
