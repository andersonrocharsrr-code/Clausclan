// ================= Figuras: pessoas da Londres vitoriana e animais =================
// Escala: pessoa com 400 de altura (pés em 0,0). Luz vem da esquerda: o lado esquerdo é mais claro.
function sh(hex, k) { const n = parseInt(hex.slice(1), 16), r = Math.min(255, (n >> 16) * k | 0), g = Math.min(255, (n >> 8 & 255) * k | 0), b = Math.min(255, (n & 255) * k | 0); return `rgb(${r},${g},${b})` }

// ---------- cabeça de frente (centro do rosto em 0,0) ----------
function cabecaFrente(o = {}) {
  const pele = o.pele || F.pele, pele0 = o.pele0 || F.pele0, cab = o.cabelo || '#2a2018', mulher = o.mulher;
  if (mulher && o.chapeu !== 'touca') { el(0, -10, 36, 40, cab); if (o.coque !== false) el(0, -44, 18, 14, cab) }
  el(-27, 2, 6, 10, pele0); el(27, 2, 6, 10, sh(pele0.startsWith('#') ? pele0 : '#9a745a', .85));
  bezPoly([[0, -34], [24, -32, 27, -8], [26, 14, 16, 30], [0, 40, -16, 30], [-26, 14, -27, -8], [-24, -32, 0, -34]], pele);
  bezPoly([[0, -34], [24, -32, 27, -8], [26, 14, 16, 30], [0, 40], [8, 10]], pele0);
  // olhos: branco, íris, pupila, brilho, pálpebra
  for (const sx of [-1, 1]) { el(sx * 11, -4, 6.5, 3.6, '#ece4d6'); disc(sx * 10.5, -4, 3, o.olho || '#4a3a2a'); disc(sx * 10.5, -4, 1.5, '#0a0806'); disc(sx * 9.6, -5, .8, '#fff'); c.strokeStyle = 'rgba(40,20,10,.7)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(sx * 4, -6); c.quadraticCurveTo(sx * 11, -10, sx * 18, -5); c.stroke(); line(sx * 4, -13, sx * 18, -14 + (o.serio ? sx * 1.5 : 0), mulher ? '#4a3020' : cab, mulher ? 1.6 : 2.6) }
  poly([[-1, -6], [4, 10], [-3, 11]], pele0); c.fillStyle = 'rgba(60,30,20,.3)'; el(-3, 11, 4, 2, 'rgba(60,30,20,.35)'); el(3, 11, 4, 2, 'rgba(60,30,20,.35)');
  bezPoly([[-8, 20], [0, 18], [8, 20], [0, 24]], mulher ? '#a04a44' : '#8a4a3a'); line(-8, 20, 8, 20, 'rgba(40,10,10,.6)', 1.2);
  if (mulher) { disc(-14, 10, 5, 'rgba(200,90,80,.18)'); disc(14, 10, 5, 'rgba(200,90,80,.18)') }
  if (o.fuligem) { c.fillStyle = 'rgba(20,18,16,.35)'; el(-12, 14, 9, 7, 'rgba(20,18,16,.35)'); el(14, -18, 8, 5, 'rgba(20,18,16,.3)'); el(4, 28, 7, 5, 'rgba(20,18,16,.3)') }
  if (o.idade) { c.strokeStyle = 'rgba(80,40,20,.35)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-12, -22); c.lineTo(12, -22); c.moveTo(-10, -26); c.lineTo(10, -26); c.moveTo(-18, 6); c.quadraticCurveTo(-14, 14, -16, 20); c.moveTo(18, 6); c.quadraticCurveTo(14, 14, 16, 20); c.stroke() }
  // pelos do rosto
  const b = o.barba;
  if (b === 'costeleta' || b === 'cheia') { bezPoly([[-26, -8], [-28, 14], [-18, 30], [-14, 24], [-20, 10], [-22, -8]], cab); bezPoly([[26, -8], [28, 14], [18, 30], [14, 24], [20, 10], [22, -8]], cab) }
  if (b === 'cheia') bezPoly([[-20, 18], [-18, 40, 0, 46], [18, 40, 20, 18], [8, 26], [0, 27], [-8, 26]], cab);
  if (b === 'bigode' || b === 'cheia' || b === 'bigodao') { const w = b === 'bigodao' ? 24 : 13; bezPoly([[-w, 20], [-6, 12], [0, 15], [6, 12], [w, 20], [6, 18], [0, 19], [-6, 18]], cab) }
  // cabelo e chapéu
  const ch = o.chapeu;
  if (!ch || ch === 'bone' || ch === 'coco') { if (o.careca) bezPoly([[-27, -6], [-28, -24, -20, -30], [-22, -18], [-24, -4]], cab); else bezPoly([[-27, -2], [-30, -34, 0, -40], [30, -34, 27, -2], [22, -20], [6, -26], [-14, -24], [-22, -16]], mulher ? cab : cab) }
  if (mulher && !ch) { bezPoly([[-26, -10], [-20, -38, 0, -38], [-2, -26], [-16, -20]], cab); bezPoly([[26, -10], [20, -38, 0, -38], [2, -26], [16, -20]], cab); c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-14, -34); c.quadraticCurveTo(-20, -24, -24, -12); c.stroke() }
  if (o.peruca) { el(0, -26, 32, 18, '#d8d4cc'); for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) el(sx * 30, -12 + k * 12, 8, 6, '#cfcac0'); el(-8, -32, 10, 6, '#e8e4dc') }
  if (ch === 'cartola') { bezPoly([[-28, -8], [-30, -30, 0, -32], [30, -30, 28, -8], [20, -22], [-20, -22]], cab); rr(-40, -30, 80, 7, 3, '#121214'); rr(-26, -88, 52, 60, 3, '#1a1a1e'); rr(-26, -88, 22, 60, 3, '#2a2a30'); rr(-26, -40, 52, 9, 0, o.fita || '#3a2a20'); c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(-20, -86, 5, 44) }
  else if (ch === 'coco') { bezPoly([[-36, -30], [-30, -36], [-26, -66, 0, -70], [26, -66, 30, -36], [36, -30], [0, -26]], '#1c1a18'); bezPoly([[-30, -36], [-26, -66, 0, -70], [-6, -40]], '#2e2a26'); rr(-27, -42, 54, 6, 2, '#0e0c0a') }
  else if (ch === 'bone') { bezPoly([[-30, -24], [-30, -46, 0, -50], [30, -46, 30, -24], [0, -20]], o.boneCor || '#3a3a34'); bezPoly([[-30, -24], [-44, -18], [-20, -16], [0, -18]], sh(o.boneCor || '#3a3a34', .7)); bezPoly([[-30, -24], [-30, -46, 0, -50], [-4, -24]], 'rgba(255,255,255,.08)'); disc(0, -48, 3, '#222') }
  else if (ch === 'touca') { bezPoly([[-34, 14], [-40, -30, 0, -48], [40, -30, 34, 14], [24, 8], [24, -20, 0, -30], [-24, -20, -24, 8]], o.toucaCor || '#4a4038'); bezPoly([[0, -48], [40, -30, 34, 14], [24, 8], [24, -20, 0, -30]], 'rgba(0,0,0,.2)'); el(-8, 44, 8, 5, o.fitaCor || '#5a3030'); el(8, 44, 8, 5, o.fitaCor || '#5a3030'); disc(0, 44, 4, o.fitaCor || '#4a2424') }
  else if (ch === 'capacete') { bezPoly([[-30, -24], [-30, -60, -10, -82], [0, -88], [10, -82], [30, -60, 30, -24]], '#141a2a'); bezPoly([[0, -88], [10, -82], [30, -60, 30, -24], [6, -24]], '#0c1018'); disc(0, -48, 9, '#b8b090'); disc(0, -48, 5, '#8a8460'); disc(0, -90, 4, '#b8b090'); rr(-30, -28, 60, 6, 2, '#0a0e16'); line(-26, -22, -24, 20, '#0a0e16', 3); line(26, -22, 24, 20, '#0a0e16', 3) }
}
// ---------- cabeça de perfil (virada para a direita) ----------
function cabecaLado(o = {}) {
  const pele = o.pele || F.pele, pele0 = o.pele0 || F.pele0, cab = o.cabelo || '#2a2018';
  if (o.mulher) { el(-10, -6, 30, 34, cab); el(-26, -24, 14, 12, cab) }
  bezPoly([[-22, -30], [10, -38, 24, -18], [26, -6], [32, 4], [26, 8], [24, 18], [18, 30, 0, 36], [-16, 30], [-24, 10]], pele); bezPoly([[-22, -30], [-24, 10], [-16, 30], [-6, 20], [-10, -10]], pele0);
  el(-6, 0, 6, 9, pele0); c.strokeStyle = 'rgba(80,40,20,.5)'; c.lineWidth = 1.3; c.beginPath(); c.arc(-6, 0, 4, -1, 2); c.stroke();
  el(14, -6, 3.6, 3, '#ece4d6'); disc(16, -6, 2, '#2a1a10'); line(8, -13, 22, -13, cab, 2.4); line(18, 20, 26, 18, '#8a4a3a', 2);
  if (o.barba === 'costeleta' || o.barba === 'cheia') bezPoly([[-14, -6], [-12, 22], [0, 30], [2, 22], [-6, 10], [-8, -6]], cab);
  if (o.barba === 'cheia') bezPoly([[0, 26], [10, 40], [24, 30], [22, 22], [8, 26]], cab);
  if (o.barba === 'bigode' || o.barba === 'cheia' || o.barba === 'bigodao') bezPoly([[16, 12], [30, 16], [18, 18]], cab);
  const ch = o.chapeu;
  if (!ch || ch === 'bone' || ch === 'coco') bezPoly([[-24, -2], [-26, -36, 4, -38], [24, -30], [12, -24], [-10, -20], [-16, -6]], cab);
  if (ch === 'cartola') { rr(-30, -40, 64, 7, 3, '#121214'); rr(-20, -98, 46, 60, 3, '#1a1a1e'); rr(-20, -98, 16, 60, 3, '#2a2a30'); rr(-20, -50, 46, 9, 0, '#3a2a20') }
  else if (ch === 'coco') { bezPoly([[-30, -30], [-24, -64, 4, -68], [28, -60, 26, -32], [34, -28], [0, -26]], '#1c1a18'); rr(-24, -40, 50, 6, 2, '#0e0c0a') }
  else if (ch === 'bone') { bezPoly([[-26, -22], [-24, -46, 4, -48], [26, -40, 24, -24], [44, -18], [20, -16]], o.boneCor || '#3a3a34') }
  else if (ch === 'touca') { bezPoly([[-28, 10], [-30, -40, 10, -44], [34, -26], [26, 6], [16, -20, -16, -14]], o.toucaCor || '#4a4038') }
  else if (ch === 'capacete') { bezPoly([[-26, -24], [-24, -70, 6, -86], [30, -60, 26, -24]], '#141a2a'); disc(6, -50, 7, '#b8b090') }
}
// ---------- mão (punho) ----------
function mao(x, y, r, pele = F.pele, pele0 = F.pele0) { c.save(); c.translate(x, y); rr(-r, -r, r * 2, r * 2.3, r * .7, pele); rr(0, -r, r, r * 2.3, r * .6, pele0); c.strokeStyle = 'rgba(80,40,20,.45)'; c.lineWidth = Math.max(1, r * .12); for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(-r * .8, r * (.1 + k * .5)); c.lineTo(r * .7, r * (.1 + k * .5)); c.stroke() } c.restore() }

// ---------- pessoa de frente (pés em 0,0; altura h) ----------
// o.roupa: 'casaca' | 'jaqueta' | 'colete' | 'vestido' | 'farda' | 'menino';  o.segura: 'saco' | 'jornais' | 'vara' | 'escova' | 'caixa' | 'bengala' | 'mapa'
function pessoaFrente(x, y, h, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(h / 400, h / 400); const cor = o.cor || '#2e3034', cor0 = sh(cor, .65), cal = o.calca || '#26282c', pele = o.pele || F.pele, pele0 = o.pele0 || F.pele0, rp = o.roupa || 'casaca', resp = sin(t * 2 + x) * 1.5;
  c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(0, 2, 70, 10, 0, 0, 7); c.fill();
  const saia = rp === 'vestido';
  if (!saia) {
    for (const sx of [-1, 1]) { poly([[sx * 4, -200], [sx * 40, -200], [sx * 34, -14], [sx * 10, -14]], sx < 0 ? cal : sh(cal, .75)); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 2; c.beginPath(); c.moveTo(sx * 22, -190); c.lineTo(sx * 22, -20); c.stroke(); bezPoly([[sx * 8, -20], [sx * 38, -20], [sx * 44, -4], [sx * 42, 2], [sx * 6, 2]], '#141210'); el(sx * 30, -8, 8, 3, 'rgba(255,255,255,.12)') }
    if (rp === 'menino') { for (const sx of [-1, 1]) { rr(sx > 0 ? 8 : -36, -100, 28, 86, 4, pele); if (sx > 0) rr(22, -100, 14, 86, 4, pele0) } poly([[-40, -200], [40, -200], [36, -96], [-36, -96]], cal); for (const sx of [-1, 1]) bezPoly([[sx * 8, -20], [sx * 38, -20], [sx * 44, -4], [sx * 6, 2]], o.descalco ? pele0 : '#141210') }
  } else {
    bezPoly([[-48, -210], [-62, -120], [-92, -4], [0, 4], [92, -4], [62, -120], [48, -210]], cor); bezPoly([[0, -210], [48, -210], [62, -120], [92, -4], [10, 4]], cor0);
    c.strokeStyle = 'rgba(0,0,0,.22)'; c.lineWidth = 2.5; for (const fx of [-60, -30, 20, 50]) { c.beginPath(); c.moveTo(fx * .45, -190); c.quadraticCurveTo(fx * .8, -90, fx, -6); c.stroke() } rr(-92, -14, 184, 10, 3, sh(cor, .5));
    if (o.avental) { bezPoly([[-34, -200], [34, -200], [44, -60], [-44, -60]], o.avental); c.strokeStyle = 'rgba(0,0,0,.15)'; c.lineWidth = 2; for (const fx of [-20, 0, 20]) { c.beginPath(); c.moveTo(fx * .8, -196); c.lineTo(fx * 1.1, -64); c.stroke() } }
    bezPoly([[-16, -4], [-6, 2], [-22, 4]], '#141210'); bezPoly([[16, -4], [6, 2], [22, 4]], '#141210');
  }
  // tronco
  const ca = rp === 'casaca', co = rp === 'colete', fa = rp === 'farda';
  if (ca) { bezPoly([[-56, -306], [-64, -200], [-62, -110], [-20, -110], [-10, -200], [0, -300]], cor); bezPoly([[56, -306], [64, -200], [62, -110], [20, -110], [10, -200], [0, -300]], cor0) }
  bezPoly([[-52, -306], [-58, -200], [52, -200], [58, -306], [0, -316]], co ? '#d8d0bc' : saia ? cor : fa ? '#141a2a' : cor);
  if (ca || co || rp === 'jaqueta') { bezPoly([[-24, -306], [-26, -206], [26, -206], [24, -306], [0, -296]], co ? (o.colete || '#4a3a2a') : (o.colete || '#4a3e30')); bezPoly([[0, -296], [24, -306], [26, -206], [2, -206]], 'rgba(0,0,0,.18)'); for (let k = 0; k < 5; k++) disc(0, -290 + k * 18, 2.6, '#b8a878'); poly([[-12, -312], [12, -312], [6, -286], [-6, -286]], '#e8e0cc'); bezPoly([[-8, -306], [8, -306], [4, -292], [-4, -292]], o.gravata || '#5a1e1e') }
  if (ca || rp === 'jaqueta') { poly([[-24, -306], [-40, -280], [-26, -230]], sh(cor, 1.15)); poly([[24, -306], [40, -280], [26, -230]], sh(cor, .8)) }
  if (fa) { for (let k = 0; k < 6; k++) disc(0, -296 + k * 16, 3, '#b8b090'); rr(-54, -214, 108, 10, 2, '#0a0e16') }
  if (saia) { bezPoly([[-52, -306], [-46, -250], [-30, -230], [0, -224], [30, -230], [46, -250], [52, -306]], o.xale || sh(cor, .8)); poly([[-14, -312], [14, -312], [0, -260]], '#e8e0cc') }
  if (!co) { c.fillStyle = 'rgba(255,255,255,.06)'; c.fillRect(-50, -300, 10, 90) }
  // braços (para baixo, ou segurando algo)
  const seg = o.segura, braco = (sx, cc, cc0) => { bezPoly([[sx * 50, -304], [sx * 66, -290], [sx * 70, -200], [sx * 58, -186], [sx * 48, -200], [sx * 46, -280]], sx < 0 ? cc : cc0); if (co) { rr(sx > 0 ? 50 : -66, -232, 16, 40, 6, sx < 0 ? pele : pele0) } mao(sx * 58, -184, 10, pele, pele0) };
  const corB = co ? '#d8d0bc' : fa ? '#141a2a' : cor;
  if (seg === 'saco') { braco(-1, corB, sh(corB, .8)); bezPoly([[20, -350], [90, -360], [100, -300], [40, -290]], '#a88a5a'); bezPoly([[60, -356], [90, -360], [100, -300], [70, -296]], '#8a6e44'); line(30, -340, 80, -350, 'rgba(0,0,0,.2)', 3); bezPoly([[48, -306], [66, -330], [72, -310], [58, -290]], corB); mao(66, -334, 10, pele, pele0) }
  else { braco(-1, corB, sh(corB, .8)); braco(1, corB, sh(corB, .8)) }
  if (seg === 'jornais') { c.save(); c.translate(70, -220); c.rotate(.1); rr(-16, -40, 32, 70, 3, '#d8d0bc'); for (let k = 0; k < 5; k++) line(-12, -32 + k * 12, 12, -32 + k * 12, 'rgba(40,40,40,.4)', 2); c.restore(); bezPoly([[-40, -310], [60, -200], [70, -190], [-30, -300]], '#5a4a36') }
  if (seg === 'vara') { line(58, -184, 58, -560, '#4a3a28', 8); line(58, -560, 70, -580, '#4a3a28', 6); if (o.chama) { add(() => glow(70, -582, 60, AMB, .8)); disc(70, -584, 6, F.chama) } }
  if (seg === 'escova') { line(-58, -184, -40, -460, '#3a2a1a', 7); for (let k = 0; k < 14; k++) { const a = k / 14 * 2 * PI; line(-40, -460, -40 + cos(a) * 40, -460 + sin(a) * 40, '#141210', 3) } line(58, -184, 70, -40, '#3a2a1a', 6); el(70, -40, 26, 10, '#141210') }
  if (seg === 'bengala') line(58, -184, 66, 0, '#2a1a10', 5);
  if (seg === 'caixa') { rr(-40, -230, 80, 50, 4, '#8a6e44'); rr(0, -230, 40, 50, 4, '#6e5634'); line(-40, -206, 40, -206, '#4a3a22', 2) }
  if (seg === 'mapa') { c.save(); c.translate(0, -200); rr(-70, -40, 140, 80, 3, '#d8ccb0'); for (let k = 0; k < 4; k++) line(-60, -24 + k * 16, 60, -24 + k * 16, 'rgba(60,50,40,.35)', 2); for (let k = 0; k < 9; k++) disc(-30 + (k * 23) % 60, -20 + (k * 17) % 40, 3, '#1a1a1a'); disc(6, 4, 5, '#7a1a1a'); c.restore(); mao(-58, -200, 10, pele, pele0); mao(58, -200, 10, pele, pele0) }
  // pescoço e cabeça
  poly([[-12, -330], [12, -330], [10, -310], [-10, -310]], pele0);
  if (ca || fa || rp === 'jaqueta') { poly([[-26, -316], [-14, -330], [0, -312]], '#e8e0cc'); poly([[26, -316], [14, -330], [0, -312]], '#d8d0bc') }
  if (o.cachecol) { bezPoly([[-24, -322], [24, -322], [20, -306], [-20, -306]], o.cachecol); rr(8, -310, 14, 50, 3, o.cachecol) }
  c.save(); c.translate(0, -362 + resp * .3); cabecaFrente(o); c.restore();
  c.restore();
}
// ---------- pessoa de perfil andando (virada para a direita; dir -1 vira) ----------
function pessoaLado(x, y, h, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(h / 400 * (o.dir || 1), h / 400); const cor = o.cor || '#2e3034', cor0 = sh(cor, .65), cal = o.calca || '#26282c', ph = (o.passo ?? t * 1.6) * 2 * PI, sw = o.parado ? 0 : sin(ph), bob = o.parado ? 0 : Math.abs(cos(ph)) * 5, pele = o.pele || F.pele, pele0 = o.pele0 || F.pele0, saia = o.roupa === 'vestido';
  c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(0, 2, 60, 9, 0, 0, 7); c.fill(); c.translate(0, -bob);
  const perna = (a, cc) => { c.save(); c.translate(0, -196); c.rotate(a); poly([[-16, 0], [18, 0], [14, 96], [-12, 96]], cc); c.translate(0, 94); c.rotate(-a * .4 + (a < 0 ? .2 : 0)); poly([[-12, 0], [14, 0], [12, 86], [-10, 86]], cc); bezPoly([[-12, 82], [14, 82], [36, 90], [36, 100], [-12, 100]], '#141210'); c.restore() };
  if (!saia) { perna(-sw * .4, sh(cal, .7)); perna(sw * .4, cal) }
  else { bezPoly([[-40, -206], [-56, -100], [-70, 0], [72, 0], [58, -100], [40, -206]], cor); bezPoly([[0, -206], [40, -206], [58, -100], [72, 0], [16, 0]], cor0); c.strokeStyle = 'rgba(0,0,0,.2)'; c.lineWidth = 2; for (const fx of [-40, -10, 30]) { c.beginPath(); c.moveTo(fx * .5, -190); c.quadraticCurveTo(fx * .8 + sw * 8, -90, fx + sw * 12, -4); c.stroke() } if (o.avental) bezPoly([[16, -200], [40, -200], [60, -60], [26, -60]], o.avental) }
  const braco = (a, cc) => { c.save(); c.translate(0, -296); c.rotate(a); poly([[-12, 0], [14, 0], [12, 90], [-10, 90]], cc); c.translate(0, 88); c.rotate(-.2); poly([[-10, 0], [12, 0], [10, 70], [-8, 70]], cc); mao(1, 80, 10, pele, pele0); c.restore() };
  const cb = o.roupa === 'colete' ? '#d8d0bc' : cor, cb0 = () => sh(cb, .85);
  braco(sw * .35, sh(cb, .7));
  bezPoly([[-30, -310], [-36, -200], [-30, -196], [34, -196], [36, -250], [30, -310], [0, -318]], o.roupa === 'colete' ? '#d8d0bc' : cor);
  if (o.roupa === 'colete') bezPoly([[0, -306], [30, -306], [34, -200], [4, -200]], o.colete || '#4a3a2a');
  if (o.roupa === 'casaca' || !o.roupa) bezPoly([[-30, -220], [-40, -110], [-6, -116], [0, -200]], cor0);
  c.fillStyle = 'rgba(255,255,255,.07)'; c.fillRect(-26, -300, 8, 90);
  if (o.segura === 'fardo') { c.save(); c.translate(-30, -330); c.rotate(-.12); rr(-70, -80, 130, 110, 10, '#b8a070'); rr(-10, -80, 70, 110, 10, '#9a8458'); c.strokeStyle = 'rgba(80,60,30,.5)'; c.lineWidth = 1.5; for (let k = 0; k < 9; k++) { c.beginPath(); c.moveTo(-66, -72 + k * 12); c.lineTo(56, -72 + k * 12); c.stroke() } for (const bx of [-40, 20]) line(bx, -82, bx, 32, '#4a3a20', 5); line(-72, -20, 62, -20, '#4a3a20', 5); c.restore(); c.save(); c.translate(0, -296); c.rotate(-2.2); poly([[-12, 0], [14, 0], [12, 80], [-10, 80]], cb0()); c.restore() }
  if (o.segura === 'saco') { bezPoly([[-40, -360], [40, -380], [56, -320], [-30, -300]], '#a88a5a'); bezPoly([[10, -376], [40, -380], [56, -320], [20, -312]], '#8a6e44') }
  braco(-sw * .35, cb);
  if (o.segura === 'cartaz') { line(20, -230, 30, -560, '#4a3a28', 7); rr(-80, -620, 220, 110, 4, o.cartazCor || '#d8ccb0'); txt(o.cartaz || '', 30, -552, 34, '#2a1a10', { align: 'center' }) }
  poly([[0, -336], [16, -336], [14, -314], [0, -314]], pele0);
  c.save(); c.translate(4, -366); cabecaLado(o); c.restore();
  c.restore();
}

// ================= Animais =================
// cavalo de lado (virado para a direita), andando a passo; arreio de carroça opcional (coelheira, antolhos, rédeas)
function cavaloLado(x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s * (o.dir || 1), s); const cor = o.cor || '#4a3020', cor0 = sh(cor, .62), cor1 = sh(cor, 1.3), crina = o.crina || '#141010', ph = (o.passo ?? t * 1.1) * 2 * PI, anda = o.parado ? 0 : 1;
  c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(0, 4, 190, 14, 0, 0, 7); c.fill();
  const perna = (hx, hy, k, frente, cc) => { const a = sin(ph + k) * .32 * anda, b = Math.max(0, -sin(ph + k + .8)) * .9 * anda; c.save(); c.translate(hx, hy); c.rotate(a); bezPoly([[-16, 0], [-18, 40, -12, 70], [12, 70], [18, 30, 14, 0]], cc); c.translate(0, 68); c.rotate(frente ? -b * .6 : b); poly([[-9, 0], [9, 0], [8, 54], [-7, 54]], cc); el(0, 54, 11, 8, cc); c.translate(0, 56); poly([[-8, 0], [9, 0], [12, 16], [-10, 16]], o.meia && frente ? '#d8d0c0' : cc); poly([[-11, 14], [13, 14], [15, 24], [-12, 24]], '#1a1612'); c.restore() };
  perna(-110, -150, 3.1, 0, cor0); perna(90, -150, 1.2, 1, cor0);
  // cauda
  c.save(); c.translate(-150, -190); c.rotate(.5 + sin(t * 2) * .08); bezPoly([[0, 0], [-30, 40, -22, 120], [-6, 130], [6, 60, 14, 6]], crina); c.restore();
  // corpo: barril com planos de luz e sombra
  bezPoly([[-168, -196], [-170, -250, -120, -262], [-60, -262, -10, -246], [60, -246, 100, -262], [150, -250, 168, -206], [160, -160, 120, -146], [40, -128, -40, -132], [-130, -140, -168, -196]], cor);
  bezPoly([[-150, -152], [-40, -132, 40, -130], [130, -146], [120, -170], [0, -162], [-130, -172]], cor0); el(-118, -204, 50, 48, 'rgba(0,0,0,.12)'); el(126, -208, 40, 44, 'rgba(255,255,255,.05)');
  bezPoly([[-140, -236], [-80, -252], [20, -254], [60, -248], [0, -240], [-100, -234]], cor1);
  
  perna(-130, -158, 0, 0, cor); perna(110, -156, 4.2, 1, cor);
  // pescoço e cabeça
  bezPoly([[86, -256], [110, -330, 168, -372], [204, -356], [206, -324], [176, -250], [166, -206]], cor); bezPoly([[160, -250], [196, -320], [200, -350], [210, -330], [180, -260]], cor0);
  c.save(); c.translate(200, -350); c.rotate(.55 + sin(t * 2.2) * .03 * anda);
  bezPoly([[-24, -16], [-10, -30], [16, -22], [70, -4], [86, 8], [82, 24], [60, 26], [10, 22], [-20, 18]], cor); bezPoly([[10, 22], [60, 26], [82, 24], [86, 8], [60, 12], [20, 10]], cor0);
  el(80, 14, 8, 6, cor0); disc(76, 10, 2.5, '#0a0806'); c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(78, 20); c.lineTo(86, 22); c.stroke();
  el(14, -6, 7, 5, '#0e0a08'); disc(12, -7, 1.6, '#fff'); poly([[-18, -22], [-10, -50], [0, -24]], cor); poly([[-14, -24], [-10, -44], [-4, -26]], cor0);
  if (o.mancha) poly([[24, -18], [70, -4], [72, 2], [26, -10]], '#d8d0c0');
  if (o.arreio) { line(-6, -10, 72, 8, '#1a1210', 4); line(-6, 14, 60, 22, '#1a1210', 4); line(2, -20, 2, 22, '#1a1210', 4); rr(4, -16, 22, 18, 3, '#141010'); disc(60, 16, 4, '#b8a070') }
  c.restore();
  // crina
  c.fillStyle = crina; c.beginPath(); c.moveTo(196, -356); for (let k = 0; k <= 8; k++) { const u = k / 8; c.lineTo(lerp(196, 112, u) - 6 - sin(t * 3 + k) * 3, lerp(-356, -252, u) - 14 + (k % 2) * 8) } c.lineTo(112, -246); c.quadraticCurveTo(150, -300, 196, -340); c.fill();
  if (o.arreio) {
    bezPoly([[146, -318], [176, -330], [184, -300], [176, -230], [150, -214], [138, -240], [150, -290]], '#2a1a12'); bezPoly([[152, -310], [170, -318], [174, -296], [168, -240], [152, -228], [148, -250]], '#5a3a22'); for (const yy of [-300, -262]) { line(170, yy, 196, yy - 10, '#b8a070', 4); disc(196, yy - 10, 4, '#d8c890') }
    rr(-40, -262, 70, 22, 6, '#1e1410'); line(-40, -252, -200, -230, '#1e1410', 6); line(150, -230, -200, -210, '#2a1a12', 4); line(-30, -240, -30, -150, '#1e1410', 5);
  }
  c.restore();
}
// cachorro de rua (vira-lata), trotando
function cachorro(x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s * (o.dir || 1), s); const cor = o.cor || '#6a5440', cor0 = sh(cor, .65), ph = t * 5 + (o.ph || 0), anda = o.parado ? 0 : 1;
  c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(0, 3, 70, 7, 0, 0, 7); c.fill();
  const perna = (hx, k, cc) => { const a = sin(ph + k) * .5 * anda; c.save(); c.translate(hx, -46); c.rotate(a); poly([[-7, 0], [7, 0], [5, 44], [-5, 44]], cc); el(2, 44, 7, 4, cc); c.restore() };
  perna(-36, 2, cor0); perna(34, 0, cor0);
  c.save(); c.translate(-56, -66); c.rotate(-.8 + sin(t * 9) * .3); bezPoly([[0, 0], [-10, -22], [-6, -40], [4, -20], [6, 0]], cor); c.restore();
  bezPoly([[-60, -70], [-40, -84], [30, -86], [56, -76], [52, -46], [20, -40], [-40, -42], [-62, -52]], cor); bezPoly([[-62, -52], [-40, -42], [20, -40], [52, -46], [40, -56], [-50, -58]], cor0); el(-30, -60, 18, 10, o.mancha || 'rgba(230,220,200,.35)');
  perna(-46, 3, cor); perna(42, 1, cor);
  c.save(); c.translate(56, -80); c.rotate(-.15 + (o.late ? sin(t * 12) * .08 : 0));
  bezPoly([[-10, 6], [-4, -18], [20, -24], [44, -10], [50, 0], [44, 8], [20, 12]], cor); poly([[44, -6], [52, -2], [44, 2]], '#141010'); disc(24, -12, 2.6, '#0a0806'); disc(23.4, -12.6, .8, '#fff');
  bezPoly([[0, -14], [-10, -34], [6, -22]], cor0); bezPoly([[6, -18], [10, -38], [16, -20]], cor); if (o.late) poly([[30, 6], [48, 8], [40, 14]], '#5a1a1a');
  rr(-12, 0, 14, 8, 3, o.coleira || '#5a1a1a'); c.restore();
  c.restore();
}
// gato sentado (ou andando), rabo enrolado e balançando
function gato(x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s * (o.dir || 1), s); const cor = o.cor || '#3a3430', cor0 = sh(cor, .6);
  c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(0, 3, 40, 6, 0, 0, 7); c.fill();
  c.strokeStyle = cor; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(-20, -6); c.quadraticCurveTo(-60 + sin(t * 2) * 6, -10, -52 + sin(t * 2.3) * 10, -50); c.stroke();
  bezPoly([[-30, 0], [-34, -40, -14, -62], [14, -64], [24, -40, 22, 0]], cor); bezPoly([[0, -64], [14, -64], [24, -40, 22, 0], [4, 0]], cor0);
  el(-14, -2, 10, 5, cor); el(10, -2, 10, 5, cor0);
  c.save(); c.translate(4, -76); el(0, 0, 24, 20, cor); poly([[-20, -8], [-16, -32], [-4, -16]], cor); poly([[20, -8], [16, -32], [4, -16]], cor0); poly([[-16, -12], [-14, -26], [-8, -16]], '#7a5a5a');
  for (const sx of [-1, 1]) { el(sx * 8, -2, 5, 4, '#c8b040'); el(sx * 8, -2, 1.4, 3.4, '#0a0806') } poly([[-3, 6], [3, 6], [0, 9]], '#c08080'); c.strokeStyle = 'rgba(220,220,210,.5)'; c.lineWidth = 1; for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(sx * 6, 8); c.lineTo(sx * 26, 4 + k * 4); c.stroke() } c.restore();
  if (o.listras) { c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 3; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(-26, -46 + k * 10); c.quadraticCurveTo(-10, -50 + k * 10, 0, -44 + k * 10); c.stroke() } }
  c.restore();
}
// pombo: cinza com pescoço iridescente; bica o chão ou voa
function pombo(x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s * (o.dir || 1), s); const bica = o.voa ? 0 : Math.max(0, sin(t * 4 + (o.ph || 0))) ;
  if (o.voa) { const a = sin(t * 18 + (o.ph || 0)); el(0, 0, 22, 9, '#6a7078'); poly([[-6, -2], [-20, -30 * a - 4], [10, -4]], '#5a6068'); poly([[-6, 2], [-24, 28 * a + 4], [10, 4]], '#4a5058'); el(22, -4, 7, 6, '#4a5a5a'); poly([[28, -4], [34, -2], [28, 0]], '#c8b0a0'); c.restore(); return }
  line(-4, 0, -6, -10, '#b06a5a', 2); line(4, 0, 4, -10, '#b06a5a', 2);
  bezPoly([[-24, -18], [-20, -30, 0, -32], [16, -30, 18, -18], [10, -8], [-14, -8]], '#7a8088'); bezPoly([[-24, -18], [-34, -14], [-18, -12]], '#3a3e44'); bezPoly([[-16, -26], [6, -28], [2, -16], [-14, -14]], '#5a6068'); line(-14, -20, 0, -20, '#2a2e34', 2);
  c.save(); c.translate(14, -26); c.rotate(bica * .9); el(0, -4, 7, 9, '#4a6a68'); el(4, -12, 6, 6, '#6a7078'); disc(6, -13, 1.6, '#c86a2a'); poly([[9, -12], [16, -10], [9, -9]], '#d8c0b0'); c.restore();
  c.restore();
}
// rato correndo
function rato(x, y, s, t, o = {}) { c.save(); c.translate(x, y); c.scale(s * (o.dir || 1), s); const a = sin(t * 20); c.strokeStyle = '#6a5a50'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-20, -6); c.quadraticCurveTo(-40, -2 + a * 3, -54, -10); c.stroke(); el(0, -8, 22, 10, '#4a4038'); el(-2, -12, 18, 5, '#5a5048'); el(20, -10, 9, 7, '#4a4038'); disc(14, -16, 4, '#7a5a5a'); disc(23, -12, 1.6, '#0a0806'); disc(29, -9, 1.6, '#c08080'); line(-10, -2, -12 + a * 4, 2, '#4a4038', 2.5); line(10, -2, 12 - a * 4, 2, '#4a4038', 2.5); c.restore() }
