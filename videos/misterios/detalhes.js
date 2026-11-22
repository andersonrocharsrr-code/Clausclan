// ================= Mistérios: pulsares, quasares, Pilares da Criação, Sombreiro, matéria escura =================
// estrela supergigante com superfície fervendo e erupções
function supergigante(x, y, r, t, o = {}) { const cor = o.cor || ['255,120,60', '#ff7a3c', '#ffb070', '#ffe0b0']; glow(x, y, r * 2.2, cor[0], .35); c.save(); c.beginPath(); c.arc(x, y, r, 0, 7); c.clip(); c.fillStyle = rg(x - r * .3, y - r * .3, r * .1, r * 1.1, [[0, cor[3]], [.5, cor[2]], [1, cor[1]]]); c.fillRect(x - r, y - r, 2 * r, 2 * r); const q = rng(4); for (let i = 0; i < 160; i++) { const a = q() * 7, d = Math.sqrt(q()) * r, s = r * (.04 + q() * .07), b = .5 + .5 * sin(t * 2 + i); el(x + cos(a) * d, y + sin(a) * d, s, s * .8, `rgba(${q() < .5 ? '255,230,170' : '180,60,20'},${.18 + b * .18})`) } c.fillStyle = rg(x, y, r * .6, r, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(80,10,0,.55)']]); c.fillRect(x - r, y - r, 2 * r, 2 * r); c.restore(); for (let k = 0; k < 6; k++) { const a = k * 1.1 + t * .1, l = r * (.12 + .06 * sin(t * 1.5 + k)); c.strokeStyle = `rgba(${cor[0]},.55)`; c.lineWidth = r * .03; c.beginPath(); c.arc(x + cos(a) * r, y + sin(a) * r, l, a - 1.2, a + 1.2); c.stroke() } }
// supernova: clarão, onda de choque e filamentos de detritos (u = 0..1)
function supernova(x, y, u, t) { const R = 60 + u * 900; c.save(); c.globalCompositeOperation = 'lighter'; glow(x, y, R * 1.2, '255,240,210', .9 * (1 - u * .6)); glow(x, y, R * .5, '255,255,255', 1 - u); const q = rng(8); for (let i = 0; i < 220; i++) { const a = q() * 7, d = R * (.5 + q() * .5), l = 20 + q() * 60; c.strokeStyle = `rgba(${q() < .5 ? '255,150,90' : '140,190,255'},${.6 * (1 - u * .5)})`; c.lineWidth = 2 + q() * 3; c.beginPath(); c.moveTo(x + cos(a) * d, y + sin(a) * d); c.lineTo(x + cos(a) * (d + l), y + sin(a) * (d + l)); c.stroke() } c.strokeStyle = `rgba(200,220,255,${.7 * (1 - u)})`; c.lineWidth = 10; c.beginPath(); c.arc(x, y, R, 0, 7); c.stroke(); c.restore() }
// estrela de nêutrons / pulsar: esfera azul-branca, linhas de campo magnético e dois feixes que giram
function pulsar(x, y, r, t, o = {}) { const ang = o.ang ?? t * (o.giro ?? 2), incl = .5;
  c.save(); c.translate(x, y); c.globalCompositeOperation = 'lighter';
  const fx = Math.cos(ang) * incl, eixo = [sin(fx) * .9, -cos(fx)];
  for (const sd of [1, -1]) { const ex = eixo[0] * sd, ey = eixo[1] * sd, L = o.L || 900, w = .14 + .05 * Math.abs(sin(ang)); const g = c.createLinearGradient(0, 0, ex * L, ey * L); g.addColorStop(0, 'rgba(200,230,255,.85)'); g.addColorStop(.4, 'rgba(140,190,255,.35)'); g.addColorStop(1, 'rgba(120,170,255,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(0, 0); const a0 = Math.atan2(ey, ex); c.lineTo(cos(a0 - w) * L, sin(a0 - w) * L); c.lineTo(cos(a0 + w) * L, sin(a0 + w) * L); c.closePath(); c.fill() }
  c.strokeStyle = 'rgba(150,200,255,.35)'; c.lineWidth = 2; for (let k = 1; k <= 5; k++) for (const sd of [1, -1]) { c.save(); c.rotate(Math.atan2(eixo[1], eixo[0]) + PI / 2); c.beginPath(); c.ellipse(sd * r * k * .9, 0, r * k * .9, r * k * 1.6, 0, 0, 7); c.stroke(); c.restore() }
  glow(0, 0, r * 5, '170,210,255', .6); c.restore(); disc(x, y, r, '#e8f2ff'); disc(x - r * .25, y - r * .25, r * .6, '#ffffff'); c.strokeStyle = 'rgba(120,170,255,.8)'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, r, 0, 7); c.stroke() }
// cidade de prédios (para comparar o tamanho)
function cidadeSilhueta(x0, x1, y, t) { const q = rng(6); for (let x = x0; x < x1;) { const w = 30 + q() * 50, h = 60 + q() * 220; rr(x, y - h, w, h, 2, '#1a2234'); for (let r2 = 10; r2 < h - 10; r2 += 22) for (let c2 = 6; c2 < w - 8; c2 += 14) if (q() < .4) { c.fillStyle = 'rgba(255,214,140,.7)'; c.fillRect(x + c2, y - h + r2, 6, 9) } x += w + 4 } }
// balança: colher de estrela de nêutrons × humanidade
function balanca(x, y, t, u) { const inc = .18 * u; c.save(); c.translate(x, y); rr(-10, 0, 20, 360, 4, '#8a8478'); rr(-90, 350, 180, 24, 6, '#5a5448'); c.rotate(-inc); rr(-360, -10, 720, 20, 6, '#b8a070'); for (const sd of [-1, 1]) { line(sd * 340, 0, sd * 300, 160, '#8a8478', 3); line(sd * 340, 0, sd * 380, 160, '#8a8478', 3); el(sd * 340, 170, 110, 18, '#5a5448') } c.restore();
  const yl = y + 170 + Math.sin(inc) * 340, yr = y + 170 - Math.sin(inc) * 340; const cx = x - 340 * Math.cos(inc), cx2 = x + 340 * Math.cos(inc);
  c.save(); c.translate(cx, yl - 20); c.rotate(-.2); el(0, 0, 46, 22, '#c8ccd4'); el(0, 0, 36, 15, '#9aa4b8'); glow(0, -4, 60, '180,210,255', .8); disc(0, -4, 12, '#e8f2ff'); rr(40, -6, 140, 12, 6, '#c8ccd4'); c.restore();
  const q = rng(3); for (let i = 0; i < 160; i++) { const px = cx2 - 90 + q() * 180, py = yr - 10 - q() * 60 * (1 - Math.abs(px - cx2) / 120); disc(px, py, 3, `rgba(${200 + q() * 50 | 0},${170 + q() * 40 | 0},${140 + q() * 30 | 0},.9)`); disc(px, py - 6, 2.5, '#3a2a20') } }
// osciloscópio com os pulsos chegando
function osciloscopio(x, y, w, h, t, o = {}) { rr(x - 12, y - 12, w + 24, h + 24, 18, '#1a1e26'); rr(x, y, w, h, 10, '#06140e'); c.strokeStyle = 'rgba(80,200,140,.15)'; c.lineWidth = 1; for (let k = 1; k < 10; k++) { line(x + k * w / 10, y, x + k * w / 10, y + h, 'rgba(80,200,140,.15)', 1); line(x, y + k * h / 6, x + w, y + k * h / 6, 'rgba(80,200,140,.15)', 1) } const per = o.per || .25, q = rng(2); c.strokeStyle = '#6cf0a8'; c.lineWidth = 3; c.beginPath(); for (let i = 0; i <= w; i += 2) { const tt = t * (o.vel || 1) - i / w * 2, fase = ((tt / per) % 1 + 1) % 1, pico = fase < .05 ? Math.sin(fase / .05 * PI) : 0, ruido = (sin(i * 1.7 + t * 30) + sin(i * 3.1)) * 2; const yy = y + h * .7 - pico * h * .55 + ruido; i ? c.lineTo(x + i, yy) : c.moveTo(x, yy) } c.stroke(); add(() => glow(x + w * .5, y + h * .5, w * .6, '80,220,150', .08)) }
// papel do registrador de 1967 com o sinal
function papelRegistro(x, y, w, t, u) { rr(x, y, w, 300, 4, '#efe6d0'); c.strokeStyle = 'rgba(120,140,170,.35)'; c.lineWidth = 1; for (let k = 0; k < 12; k++) line(x, y + 20 + k * 24, x + w, y + 20 + k * 24, 'rgba(120,140,170,.35)', 1); for (let k = 0; k < w; k += 40) line(x + k, y, x + k, y + 300, 'rgba(120,140,170,.25)', 1); c.strokeStyle = '#2a3a6a'; c.lineWidth = 2.5; c.beginPath(); const fim = w * u; for (let i = 0; i <= fim; i += 3) { const pico = (i % 120) < 6 ? 90 : 0, yy = y + 200 + sin(i * .3) * 8 + sin(i * .11 + 2) * 10 - pico; i ? c.lineTo(x + i, yy) : c.moveTo(x, yy) } c.stroke(); rr(x + fim - 6, y + 170, 12, 40, 3, '#8a2a2a') }
// nebulosa do Caranguejo: brilho azulado + rede de filamentos laranja e vermelhos, pulsar no centro
function caranguejo(x, y, R, t) { c.save(); c.translate(x, y); c.globalCompositeOperation = 'lighter'; c.save(); c.scale(1, .72); glow(0, 0, R * 1.1, '90,140,255', .45); glow(0, 0, R * .5, '170,200,255', .5); c.restore(); const q = rng(54);
  for (let i = 0; i < 140; i++) { const a0 = q() * 7, d0 = R * (.2 + q() * .75); let px = cos(a0) * d0, py = sin(a0) * d0 * .72; c.strokeStyle = q() < .55 ? `rgba(255,${(110 + q() * 80) | 0},60,${.35 + q() * .35})` : `rgba(255,90,110,${.3 + q() * .3})`; c.lineWidth = 1.5 + q() * 2.5; c.beginPath(); c.moveTo(px, py); for (let k = 0; k < 6; k++) { px += (q() - .5) * R * .16 + cos(a0) * R * .04; py += (q() - .5) * R * .16 + sin(a0) * R * .03; c.lineTo(px, py) } c.stroke() }
  for (let i = 0; i < 300; i++) { const a = q() * 7, d = R * Math.sqrt(q()); c.fillStyle = 'rgba(200,220,255,.25)'; c.fillRect(cos(a) * d, sin(a) * d * .72, 2, 2) } c.restore(); const pis = (Math.floor(t * 30) % 2) ? .9 : .4; glow(x, y, 40, '220,235,255', pis); disc(x, y, 6, '#fff') }
// jatos de um quasar (dois feixes com nós de matéria)
function jatos(x, y, L, t, ang = -PI / 2) { c.save(); c.translate(x, y); c.rotate(ang + PI / 2); c.globalCompositeOperation = 'lighter'; for (const sd of [-1, 1]) { const g = c.createLinearGradient(0, 0, 0, sd * L); g.addColorStop(0, 'rgba(200,220,255,.9)'); g.addColorStop(1, 'rgba(120,160,255,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(-8, 0); c.lineTo(-30, sd * L); c.lineTo(30, sd * L); c.lineTo(8, 0); c.fill(); for (let k = 0; k < 6; k++) { const ph = ((t * .5 + k / 6) % 1); glow(0, sd * ph * L, 30 * (1 - ph * .5), '210,230,255', .8 * (1 - ph)) } } c.restore() }
// telescópio amador num tripé
function lunetaTripe(x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); for (const a of [-.35, 0, .35]) line(0, 0, sin(a) * 220, 300, '#3a3a40', 10); c.save(); c.rotate(-.7); rr(-40, -34, 300, 68, 14, '#d8dce4'); rr(-40, -34, 300, 22, 10, '#f0f2f6'); rr(250, -40, 30, 80, 8, '#2a2a30'); rr(-70, -20, 40, 40, 6, '#2a2a30'); c.restore(); disc(0, 0, 18, '#2a2a30'); c.restore() }
// telescópio Hubble
function hubble(x, y, s, t) { c.save(); c.translate(x, y); c.scale(s, s); c.rotate(-.15); for (const sd of [-1, 1]) { rr(-60, sd * 120 - 30, 240, 60, 3, '#2a3a68'); for (let k = 1; k < 8; k++) line(-60 + k * 30, sd * 120 - 30, -60 + k * 30, sd * 120 + 30, '#4a5a90', 2); line(40, sd * 30, 40, sd * 90, '#8a8a90', 5) } rr(-200, -60, 420, 120, 20, '#c8ccd4'); rr(-200, -60, 420, 40, 16, '#e8ecf2'); for (let k = 0; k < 6; k++) line(-180 + k * 70, -60, -180 + k * 70, 60, 'rgba(90,90,100,.4)', 2); rr(-260, -50, 70, 100, 10, '#a8acb4'); c.save(); c.translate(220, -60); c.rotate(-.6); rr(0, 0, 90, 10, 3, '#c8ccd4'); c.restore(); disc(225, 0, 50, '#1a1a20'); c.restore() }
// Pilares da Criação (versão Hubble ou James Webb)
function pilares(t, o = {}) { const webb = o.webb, q = rng(15);
  c.fillStyle = webb ? lg(0, 0, 0, H, [[0, '#1a1430'], [.5, '#2a3048'], [1, '#30243a']]) : lg(0, 0, 0, H, [[0, '#0e2a30'], [.5, '#1e4a48'], [1, '#2a3a30']]); c.fillRect(0, 0, W, H);
  c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 26; i++) glow(q() * W, q() * H, 200 + q() * 300, webb ? (q() < .5 ? '120,110,200' : '200,120,90') : (q() < .5 ? '60,160,150' : '160,170,90'), .14); c.restore();
  const n = webb ? 900 : 260; for (let i = 0; i < n; i++) { const b = q(); c.fillStyle = `rgba(255,${(230 + q() * 25) | 0},${(200 + q() * 55) | 0},${.4 + b * .6})`; const s2 = .8 + b * 2.4; c.fillRect(q() * W, q() * H, s2, s2); if (webb && b > .985) { const sx = q() * W, sy = q() * H; for (let k = 0; k < 6; k++) { const a = k * PI / 3 + PI / 2; line(sx, sy, sx + cos(a) * 26, sy + sin(a) * 26, 'rgba(255,240,220,.5)', 1.5) } glow(sx, sy, 16, '255,240,220', .9) } }
  const pil = [[320, 1700, 230, 1150, 0], [620, 1700, 130, 640, 1], [860, 1700, 150, 760, 2]];
  pil.forEach(([bx, by, w, h, k]) => { const topo = by - h, pts = []; for (let j = 0; j <= 24; j++) { const u = j / 24, ww = w * (1 - u * .55) * (1 + .12 * sin(u * 9 + k)); pts.push([bx - ww / 2 + sin(u * 7 + k) * 20, by - u * h]) } const pts2 = []; for (let j = 24; j >= 0; j--) { const u = j / 24, ww = w * (1 - u * .55) * (1 + .1 * sin(u * 7 + k + 2)); pts2.push([bx + ww / 2 + sin(u * 6 + k) * 18, by - u * h]) }
    const corpo = webb ? lg(bx, topo, bx, by, [[0, 'rgba(230,150,90,.95)'], [.4, 'rgba(150,80,50,.9)'], [1, 'rgba(70,40,40,.95)']]) : lg(bx, topo, bx, by, [[0, '#8a6a3a'], [.5, '#4a3a22'], [1, '#2a2216']]); poly([...pts, ...pts2], corpo);
    c.strokeStyle = webb ? 'rgba(255,200,150,.7)' : 'rgba(240,210,150,.65)'; c.lineWidth = 4; c.beginPath(); pts2.slice(0, 8).forEach((p, i) => i ? c.lineTo(...p) : c.moveTo(...p)); c.stroke();
    for (let m = 0; m < 30; m++) { const u = q() * .95, px = bx + (q() - .5) * w * (1 - u * .5), py = by - u * h; el(px, py, 10 + q() * 30, 6 + q() * 16, `rgba(${webb ? '90,40,30' : '30,24,14'},.35)`, q()) }
    for (let m = 0; m < 6; m++) { const ph = ((t * .15 + m / 6 + k * .3) % 1); pill(bx + (q() - .5) * w * .3, topo - ph * 120, 30 + ph * 50, 10, `rgba(${webb ? '255,190,150' : '200,230,200'},${.4 * (1 - ph)})`) }
    if (webb) for (let m = 0; m < 3; m++) { const px = bx + (q() - .5) * w * .4, py = topo + 20 + q() * 80; glow(px, py, 30, '255,90,60', .8); line(px, py, px + 30, py - 40, 'rgba(255,120,90,.6)', 3) } });
}
// Galáxia Sombreiro: núcleo brilhante, disco quase de lado com faixa escura de poeira, halo e aglomerados globulares
function sombreiroIR(x, y, R, t, o = {}) { const ir = o.ir; c.save(); c.translate(x, y); c.rotate(-.08);
  if (!ir) { c.save(); c.globalCompositeOperation = 'lighter'; c.save(); c.scale(1, .62); glow(0, 0, R * .9, '255,240,215', .55); glow(0, 0, R * .45, '255,245,225', .8); glow(0, 0, R * .18, '255,255,240', 1); c.restore(); c.save(); c.scale(1, .2); glow(0, 0, R * 1.15, '230,220,200', .5); c.restore(); c.restore();
    c.save(); c.scale(1, .16); c.strokeStyle = 'rgba(40,24,14,.9)'; c.lineWidth = R * .22; c.beginPath(); c.ellipse(0, R * .1, R * .98, R * .98, 0, 0, PI); c.stroke(); c.strokeStyle = 'rgba(70,40,20,.55)'; c.lineWidth = R * .12; c.beginPath(); c.ellipse(0, R * .1, R * 1.06, R * 1.06, 0, 0, PI); c.stroke(); const q = rng(4); for (let i = 0; i < 60; i++) { const a = q() * PI, rr2 = R * (.9 + q() * .2); el(cos(a) * rr2, R * .1 + sin(a) * rr2, R * .03, R * .1, 'rgba(255,220,180,.18)') } c.restore();
    const q2 = rng(21); for (let i = 0; i < 220; i++) { const a = q2() * 7, d = R * (.6 + q2() * 1.1); disc(cos(a) * d, sin(a) * d * .75, 1.5 + q2() * 1.5, 'rgba(255,240,215,.6)') } }
  else { c.save(); c.scale(1, .3); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(0, 0, R * .55, 0, 0, R * 1.1); g.addColorStop(0, 'rgba(255,120,40,0)'); g.addColorStop(.3, 'rgba(255,140,60,.9)'); g.addColorStop(.6, 'rgba(230,90,40,.7)'); g.addColorStop(1, 'rgba(150,40,20,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, R * 1.1, 0, 7); c.fill(); const q = rng(9); for (let i = 0; i < 160; i++) { const a = q() * 7, rr2 = R * (.72 + q() * .28); glow(cos(a) * rr2, sin(a) * rr2, R * .05, '255,200,140', .5) } c.restore(); glow(0, 0, R * .12, '170,200,255', .7); disc(0, 0, R * .03, '#dfe8ff') }
  c.restore() }
// pizza: 5% matéria comum, 27% matéria escura, 68% energia escura
function pizzaCosmica(x, y, r, u) { const fatias = [[.05, '#f0b94a', 'MATÉRIA COMUM · 5%'], [.27, '#7a5ad8', 'MATÉRIA ESCURA · 27%'], [.68, '#2a3a78', 'ENERGIA ESCURA · 68%']]; let a = -PI / 2; fatias.forEach(([f, cor, nome], i) => { const a1 = a + f * 2 * PI * u; c.fillStyle = cor; c.beginPath(); c.moveTo(x, y); c.arc(x, y, r * (i === 0 ? 1.08 : 1), a, a1); c.closePath(); c.fill(); c.strokeStyle = '#07090f'; c.lineWidth = 4; c.stroke(); const am = (a + a1) / 2; if (u > .95) txt(nome, x + cos(am) * r * (i === 0 ? 1.45 : .55), y + sin(am) * r * (i === 0 ? 1.45 : .55), i === 0 ? 34 : 38, '#fff6e0', { align: 'center' }); a = a1 }) }
function pulsoLuz(x0, y0, x1, y1, u, cor = '255,232,170') { if (u <= 0 || u >= 1) return; const x = lerp(x0, x1, u), y = lerp(y0, y1, u); line(x0, y0, x, y, `rgba(${cor},.45)`, 3); add(() => glow(x, y, 70, cor, .9)); disc(x, y, 7, '#fffaf0') }

// ================= supergigante (versão final): granulação fina na mesma cor =================
function supergigante(x, y, r, t, o = {}) { const cor = o.cor || ['255,120,60', '#ff7a3c', '#ffb070', '#ffe0b0']; glow(x, y, r * 2.2, cor[0], .35); c.save(); c.beginPath(); c.arc(x, y, r, 0, 7); c.clip(); c.fillStyle = rg(x - r * .3, y - r * .3, r * .1, r * 1.1, [[0, cor[3]], [.55, cor[2]], [1, cor[1]]]); c.fillRect(x - r, y - r, 2 * r, 2 * r); const q = rng(4); for (let i = 0; i < 900; i++) { const a = q() * 7, d = Math.sqrt(q()) * r, s = r * (.012 + q() * .025), b = .5 + .5 * sin(t * 3 + i); el(x + cos(a) * d, y + sin(a) * d, s, s * .85, `rgba(255,255,255,${.04 + b * .06})`); el(x + cos(a) * d + s, y + sin(a) * d + s, s * .5, s * .4, `rgba(0,0,40,${.05})`) } c.fillStyle = rg(x, y, r * .55, r, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(10,20,60,.5)']]); c.fillRect(x - r, y - r, 2 * r, 2 * r); c.restore(); for (let k = 0; k < 7; k++) { const a = k * .95 + t * .08, l = r * (.1 + .05 * sin(t * 1.5 + k)); c.strokeStyle = `rgba(${cor[0]},.5)`; c.lineWidth = r * .025; c.beginPath(); c.arc(x + cos(a) * r, y + sin(a) * r, l, a - 1.2, a + 1.2); c.stroke() } }
// ================= Pilares da Criação (versão final, mais realista) =================
function pilares(t, o = {}) { const webb = o.webb, q = rng(15);
  c.fillStyle = webb ? lg(0, 0, 0, H, [[0, '#120e26'], [.45, '#22284a'], [1, '#2a1e34']]) : lg(0, 0, 0, H, [[0, '#0a2228'], [.45, '#1a4442'], [1, '#22362c']]); c.fillRect(0, 0, W, H);
  c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 40; i++) { const x = q() * W, y = q() * H, r = 160 + q() * 340; glow(x, y, r, webb ? (q() < .5 ? '110,100,210' : '210,130,90') : (q() < .5 ? '60,170,160' : '170,180,100'), .1) } c.restore();
  const n = webb ? 1100 : 320; for (let i = 0; i < n; i++) { const b = q(); c.fillStyle = `rgba(255,${(232 + q() * 23) | 0},${(205 + q() * 50) | 0},${.35 + b * .6})`; const s2 = .8 + b * 2.2; c.fillRect(q() * W, q() * H, s2, s2); if (webb && b > .987) { const sx = q() * W, sy = q() * H; for (let k = 0; k < 6; k++) { const a = k * PI / 3 + PI / 2; line(sx, sy, sx + cos(a) * 28, sy + sin(a) * 28, 'rgba(255,240,220,.45)', 1.5) } glow(sx, sy, 18, '255,240,220', .9) } }
  const pil = [[330, 1760, 250, 1220, 0], [640, 1760, 150, 700, 1], [880, 1760, 170, 820, 2]];
  pil.forEach(([bx, by, w, h, k]) => { const topo = by - h, qq = rng(100 + k);
    // corpo: dezenas de nuvens translúcidas sobrepostas, afinando para cima e inclinando um pouco
    for (let m = 0; m < 170; m++) { const u = Math.pow(qq(), .85), ww = w * (1 - u * .55), px = bx + sin(u * 5 + k) * 26 + (qq() - .5) * ww * .9, py = by - u * h, rr2 = ww * (.18 + qq() * .25); const base = webb ? [150 - u * 40, 80 - u * 20, 60] : [55 + u * 30, 48 + u * 26, 30 + u * 10]; el(px, py, rr2, rr2 * (.7 + qq() * .5), `rgba(${base[0] | 0},${base[1] | 0},${base[2] | 0},${.22 + qq() * .2})`, qq() * 3) }
    // bordas iluminadas pelas estrelas jovens (lado de cima/direita) e pontas que evaporam
    c.save(); c.globalCompositeOperation = 'lighter'; for (let m = 0; m < 50; m++) { const u = .3 + qq() * .7, ww = w * (1 - u * .55), px = bx + sin(u * 5 + k) * 26 + ww * (.25 + qq() * .25), py = by - u * h; el(px, py, ww * .12, ww * .06, webb ? 'rgba(255,190,140,.2)' : 'rgba(230,220,160,.18)', qq() * 3) }
    const tx = bx + sin(5 + k) * 26; glow(tx, topo, w * .5, webb ? '255,170,120' : '220,230,190', .35); for (let m = 0; m < 14; m++) { const a = -PI / 2 + (qq() - .5) * 1.4, d = w * (.2 + qq() * .4); pill(tx + cos(a) * d, topo + sin(a) * d * .6, 40 + qq() * 40, 8, webb ? 'rgba(255,200,160,.25)' : 'rgba(230,240,210,.22)') } c.restore();
    // "dedos" de gás com estrelas nascendo
    for (let m = 0; m < 4; m++) { const u = .55 + qq() * .4, ww = w * (1 - u * .55), px = bx + sin(u * 5 + k) * 26 + (qq() - .5) * ww * .8, py = by - u * h; bezPoly([[px - 8, py], [px - 6, py - 40, px, py - 50], [px + 6, py - 40, px + 8, py]], webb ? 'rgba(150,80,60,.8)' : 'rgba(70,58,36,.85)'); if (webb) { glow(px, py - 46, 22, '255,90,60', .9); line(px, py - 46, px + 20, py - 80, 'rgba(255,120,90,.6)', 3) } else glow(px, py - 46, 10, '255,230,190', .5) }
    // vapor subindo das pontas
    for (let m = 0; m < 6; m++) { const ph = ((t * .15 + m / 6 + k * .3) % 1); pill(tx + (qq() - .5) * w * .3, topo - ph * 140, 30 + ph * 60, 10, `rgba(${webb ? '255,190,150' : '210,235,210'},${.35 * (1 - ph)})`) } });
}

// ================= FOTOS REAIS (mandadas pelo Anderson): Pilares da Criação e Galáxia Sombreiro =================
const FOTO = {}; function foto(n) { return FOTO[n] || (FOTO[n] = Object.assign(new Image(), { src: 'fotos/' + n + '.jpg' })) }
// estrelas brilhantes da foto (coordenadas já na tela 1080×1920) para cintilar
const PIL_EST = [[226, 98, 1], [413, 711, 1.3], [873, 230, .9], [89, 83, .7], [942, 152, .6], [330, 690, .5], [700, 860, .5]];
const PIL_PONTA = [[344, 290, 1.2], [746, 522, 1], [932, 800, .8], [400, 830, .6], [210, 1060, .5]];
function pilaresImg(webb) {
  return cache(webb ? 'pilW' : 'pilH', W, H, () => { const f = foto('pilares'), s = H / f.height, w = f.width * s;
    c.fillStyle = '#05070c'; c.fillRect(0, 0, W, H);
    c.filter = webb ? 'sepia(.6) saturate(2.1) hue-rotate(-14deg) contrast(1.18) brightness(1.1)' : 'contrast(1.08) saturate(1.12) brightness(1.03)';
    c.drawImage(f, 540 - 882, 0, w, H); c.filter = 'none';
    if (webb) { // o Webb enxerga através da poeira: muito mais estrelas, e as recém-nascidas brilham em vermelho
      const q = rng(2022); c.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 900; i++) { const x = q() * W, y = q() * H, r = .6 + q() * q() * 2.6; c.fillStyle = `rgba(255,${(225 + q() * 30) | 0},${(190 + q() * 60) | 0},${.35 + q() * .5})`; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill() }
      for (let i = 0; i < 26; i++) { const x = q() * W, y = q() * H, L2 = 14 + q() * 30; c.strokeStyle = 'rgba(255,240,210,.55)'; c.lineWidth = 1.4; c.beginPath(); for (let k = 0; k < 3; k++) { const a = k * PI / 3 + PI / 2; c.moveTo(x - cos(a) * L2, y - sin(a) * L2); c.lineTo(x + cos(a) * L2, y + sin(a) * L2) } c.stroke(); const g = c.createRadialGradient(x, y, 0, x, y, 9); g.addColorStop(0, 'rgba(255,255,245,1)'); g.addColorStop(1, 'rgba(255,220,170,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, 9, 0, 7); c.fill() }
      c.globalCompositeOperation = 'source-over' }
    // vinheta suave
    const g = c.createRadialGradient(540, 900, 500, 540, 900, 1250); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.45)'); c.fillStyle = g; c.fillRect(0, 0, W, H) }) }
function pilares(t, o = {}) { const webb = o.webb, img = pilaresImg(webb), z = 1.02 + .015 * sin(t * .25);
  c.save(); c.translate(540, 960); c.scale(z, z); c.translate(-540 + 6 * sin(t * .2), -960); c.drawImage(img, 0, 0); c.restore();
  c.save(); c.globalCompositeOperation = 'lighter';
  // a luz das estrelas jovens "evapora" as pontas: brilho que pulsa e vapor subindo
  PIL_PONTA.forEach(([x, y, k], i) => { glow(x, y - 10, 70 * k, webb ? '255,170,110' : '150,230,255', (.18 + .08 * sin(t * 1.3 + i)) * k); const q = rng(40 + i); for (let j = 0; j < 14; j++) { const f = (t * .12 + q()) % 1, xx = x + (q() - .5) * 90 * k + sin(t + j) * 6, yy = y - 10 - f * 140 * k; c.fillStyle = webb ? `rgba(255,190,140,${.16 * (1 - f) * k})` : `rgba(190,240,255,${.16 * (1 - f) * k})`; c.beginPath(); c.ellipse(xx, yy, 10 * k * (1 + f), 4 * k * (1 + f), 0, 0, 7); c.fill() } });
  if (webb) { [[352, 300], [372, 330], [760, 540], [728, 560], [940, 812], [905, 845], [420, 845], [240, 1075]].forEach(([x, y], i) => { const b = .6 + .4 * sin(t * 2 + i * 1.7); glow(x, y, 26, '255,70,40', .8 * b); c.fillStyle = `rgba(255,120,90,${.9 * b})`; c.beginPath(); c.arc(x, y, 3.5, 0, 7); c.fill() }) }
  PIL_EST.forEach(([x, y, k], i) => { const b = .55 + .45 * sin(t * 2.2 + i * 2.1), L2 = 46 * k * b; c.strokeStyle = `rgba(255,235,215,${.55 * b})`; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x - L2, y); c.lineTo(x + L2, y); c.moveTo(x, y - L2); c.lineTo(x, y + L2); c.stroke(); glow(x, y, 18 * k, '255,230,210', .5 * b) });
  c.restore() }
// recorte redondo, com borda esfumada, para mostrar os pilares pequenos no meio do espaço
function pilaresMini(x, y, r, t) { const img = cache('pilMini', 800, 800, () => { c.drawImage(pilaresImg(false), 540 - 520, 1000 - 560, 1040, 1120, 0, 0, 800, 862); c.globalCompositeOperation = 'destination-in'; const g = c.createRadialGradient(400, 400, 250, 400, 400, 400); g.addColorStop(0, '#000'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, 800, 800); c.globalCompositeOperation = 'source-over' });
  c.drawImage(img, x - r, y - r, 2 * r, 2 * r); c.save(); c.globalCompositeOperation = 'lighter'; glow(x - r * .25, y - r * .45, r * .2, '150,230,255', .15 + .05 * sin(t)); c.restore() }

function sombreiroImg() { return cache('somF', 1000, 750, () => { const f = foto('sombreiro'); c.filter = 'contrast(1.08) saturate(1.15)'; c.drawImage(f, 0, 0, 1000, 750); c.filter = 'none';
  c.globalCompositeOperation = 'destination-in'; c.save(); c.translate(500, 375); c.scale(1, .75); const g = c.createRadialGradient(0, 0, 300, 0, 0, 500); g.addColorStop(0, '#000'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(-500, -500, 1000, 1000); c.restore(); c.globalCompositeOperation = 'source-over' }) }

function sombreiro(x, y, R, t, o = {}) {
  if (o.ir) return sombreiroIR(x, y, R, t, o);
  const img = sombreiroImg(), w = 2.35 * R, h = w * .75, z = 1 + .01 * sin(t * .3);
  c.save(); c.translate(x, y); c.scale(z, z); c.globalCompositeOperation = 'screen'; c.drawImage(img, -w / 2, -h / 2 - R * .02, w, h);
  c.globalCompositeOperation = 'lighter'; c.save(); c.scale(1, .5); glow(0, 0, R * .35, '255,235,200', .12 + .05 * sin(t * .8)); c.restore();
  const q = rng(33); for (let i = 0; i < 40; i++) { const a = q() * 7, d = R * (.4 + q() * .7), b = .5 + .5 * sin(t * (1 + q()) + i); c.fillStyle = `rgba(255,240,215,${.35 * b})`; c.beginPath(); c.arc(cos(a) * d, sin(a) * d * .62, 1.4, 0, 7); c.fill() }
  c.restore() }

// ================= TELESCÓPIOS (versões detalhadas) =================
// gradiente de cilindro (luz vindo de cima) ao longo do eixo x local
function tuboGrad(y0, y1, cores) { const g = c.createLinearGradient(0, y0, 0, y1); cores.forEach((k, i) => g.addColorStop(i / (cores.length - 1), k)); return g }
function cilindro(x0, x1, r, cores) { c.fillStyle = tuboGrad(-r, r, cores); c.fillRect(x0, -r, x1 - x0, 2 * r) }
const METAL = ['#3a3e46', '#9aa0aa', '#eef1f5', '#b8bec8', '#5a606a', '#24272d'];
const PRETO = ['#08090b', '#2a2d33', '#4a4e56', '#2a2d33', '#101114', '#050506'];

// telescópio amador: refrator branco numa montagem equatorial sobre tripé de alumínio
function lunetaTripe(x, y, s) { c.save(); c.translate(x, y); c.scale(s, s);
  // sombra no chão
  c.fillStyle = 'rgba(0,0,0,.45)'; c.beginPath(); c.ellipse(10, 318, 260, 26, 0, 0, 7); c.fill();
  // pernas do tripé (tubo grosso em cima, fino embaixo, trava e pé de borracha)
  for (const [a, atras] of [[-.42, 0], [.05, 1], [.4, 0]]) { c.save(); c.translate(0, 40); c.rotate(-a); const d = atras ? .6 : 1;
    c.globalAlpha = atras ? .75 : 1; c.fillStyle = tuboGrad(-10, 10, ['#2a2c30', '#6a6e76', '#c8ccd4', '#6a6e76', '#1e2024']); c.save(); c.rotate(PI / 2); c.fillRect(0, -11, 150, 22); c.fillStyle = tuboGrad(-7, 7, ['#3a3c40', '#9aa0a8', '#f0f2f6', '#9aa0a8', '#2a2c30']); c.fillRect(150, -7, 140 * d + 30, 14); c.fillStyle = '#141518'; c.fillRect(140, -13, 18, 26); c.fillStyle = '#c0392b'; c.fillRect(146, -16, 8, 6); c.fillStyle = '#101010'; c.fillRect(150 + 140 * d + 26, -9, 16, 18); c.restore(); c.restore() }
  // bandeja de acessórios com oculares
  c.fillStyle = '#22252a'; c.beginPath(); c.moveTo(-70, 150); c.lineTo(70, 150); c.lineTo(46, 172); c.lineTo(-46, 172); c.closePath(); c.fill(); c.fillStyle = '#3a3e46'; c.fillRect(-70, 146, 140, 6); for (let k = -1; k <= 1; k++) { c.fillStyle = '#111'; c.fillRect(k * 34 - 8, 128, 16, 20); c.fillStyle = '#7a8088'; c.fillRect(k * 34 - 8, 128, 16, 5) }
  // cabeça do tripé e montagem
  c.fillStyle = tuboGrad(20, 50, ['#4a4e56', '#2a2c30', '#141518']); c.fillRect(-46, 22, 92, 26);
  c.fillStyle = tuboGrad(-50, 30, ['#e8ebf0', '#c8ccd4', '#8a8e96', '#4a4e56']); c.beginPath(); c.moveTo(-30, 26); c.lineTo(-38, -30); c.lineTo(34, -48); c.lineTo(40, 26); c.closePath(); c.fill(); c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = 2; c.stroke();
  disc(-38, 0, 11, '#1a1a1e'); disc(-38, 0, 5, '#8a8e96'); disc(36, -10, 9, '#1a1a1e'); disc(36, -10, 4, '#8a8e96'); // botões de ajuste fino
  // eixo do contrapeso e contrapeso
  c.save(); c.rotate(.75); c.fillStyle = tuboGrad(-5, 5, METAL); c.fillRect(0, -5, 190, 10); c.fillStyle = tuboGrad(-30, 30, ['#2a2c30', '#8a8e96', '#d8dce2', '#6a6e76', '#1a1b1e']); c.fillRect(120, -30, 50, 60); disc(145, -34, 6, '#111'); c.restore();
  // tubo óptico, apontado para o céu
  c.save(); c.translate(0, -40); c.rotate(-.7);
  c.fillStyle = '#1a1b1e'; c.fillRect(-70, 28, 190, 12); // trilho (dovetail)
  cilindro(-150, 220, 40, ['#6a6e76', '#c8ccd4', '#ffffff', '#e4e7ec', '#9a9ea6', '#4a4e56']); // tubo branco
  c.fillStyle = 'rgba(212,160,60,.9)'; c.fillRect(120, -40, 6, 80); c.fillRect(130, -40, 3, 80); // faixas douradas
  cilindro(220, 330, 46, PRETO); c.fillStyle = 'rgba(255,255,255,.06)'; c.fillRect(220, -46, 110, 14); // para-sereno
  c.fillStyle = tuboGrad(-44, 44, ['#0a1a30', '#2a5a8a', '#8ad0ff', '#2a5a8a', '#0a1a30']); c.beginPath(); c.ellipse(330, 0, 9, 44, 0, 0, 7); c.fill(); c.fillStyle = 'rgba(200,240,255,.7)'; c.beginPath(); c.ellipse(331, -18, 3, 12, 0, 0, 7); c.fill(); // lente com reflexo
  for (const xa of [-60, 70]) { cilindro(xa - 10, xa + 10, 46, PRETO); disc(xa, -50, 6, '#2a2c30') } // anéis de fixação
  cilindro(-215, -150, 22, PRETO); for (const sd of [-1, 1]) { c.fillStyle = '#c8ccd4'; c.fillRect(-196, sd * 22, 10, sd * 18); disc(-191, sd * 42, 9, '#2a2c30') } // focalizador e botões
  c.save(); c.translate(-215, 0); c.fillStyle = '#1a1b1e'; c.fillRect(-26, -16, 26, 32); c.rotate(-PI / 2); cilindro(16, 70, 13, PRETO); c.fillStyle = '#b8bec8'; c.fillRect(40, -14, 4, 28); c.restore(); // diagonal + ocular
  c.save(); c.translate(0, -62); cilindro(-60, 70, 12, ['#3a3e46', '#c8ccd4', '#f6f8fa', '#8a8e96', '#2a2c30']); c.fillStyle = '#1a1b1e'; c.fillRect(-40, 10, 8, 14); c.fillRect(40, 10, 8, 14); c.fillStyle = '#2a5a8a'; c.beginPath(); c.ellipse(70, 0, 3, 11, 0, 0, 7); c.fill(); c.restore(); // buscadora
  c.restore(); c.restore() }

// Hubble: escudo de luz com porta aberta, corpo com isolamento prateado, painéis solares e antenas
function hubble(x, y, s, t) { c.save(); c.translate(x, y); c.scale(s, s); c.rotate(-.15 + .03 * sin(t * .3));
  // painéis solares (atrás do corpo)
  for (const sd of [-1, 1]) { line(-30, sd * 60, -30, sd * 110, '#9aa0aa', 6); c.save(); c.translate(-30, sd * 110); const L2 = 290, w2 = 84;
    c.fillStyle = '#c8a050'; c.fillRect(-w2 / 2 - 4, sd > 0 ? 0 : -L2 - 4, w2 + 8, L2 + 4);
    const g = c.createLinearGradient(-w2 / 2, 0, w2 / 2, sd * L2); g.addColorStop(0, '#1a2a5a'); g.addColorStop(.45, '#2a4a9a'); g.addColorStop(.55, '#4a6ac0'); g.addColorStop(1, '#14204a'); c.fillStyle = g; c.fillRect(-w2 / 2, sd > 0 ? 4 : -L2, w2, L2 - 4);
    c.strokeStyle = 'rgba(150,180,240,.35)'; c.lineWidth = 1; for (let i = 1; i < 6; i++) { c.beginPath(); c.moveTo(-w2 / 2 + i * w2 / 6, sd * 4); c.lineTo(-w2 / 2 + i * w2 / 6, sd * L2); c.stroke() } for (let j = 1; j < 24; j++) { c.beginPath(); c.moveTo(-w2 / 2, sd * j * L2 / 24); c.lineTo(w2 / 2, sd * j * L2 / 24); c.stroke() }
    c.fillStyle = 'rgba(200,170,90,.9)'; c.fillRect(-3, sd > 0 ? 0 : -L2, 6, L2); // haste central
    c.save(); c.globalCompositeOperation = 'lighter'; const sh = ((t * 40) % 400) - 60; const g2 = c.createLinearGradient(0, sd * (sh - 40), 0, sd * (sh + 40)); g2.addColorStop(0, 'rgba(120,160,255,0)'); g2.addColorStop(.5, 'rgba(160,200,255,.25)'); g2.addColorStop(1, 'rgba(120,160,255,0)'); c.fillStyle = g2; c.fillRect(-w2 / 2, sd > 0 ? 4 : -L2, w2, L2 - 4); c.restore(); c.restore() }
  // escudo de luz (frente) e porta da abertura
  cilindro(60, 270, 64, ['#4a4e56', '#a8aeb8', '#eceff3', '#c8ccd4', '#7a7e86', '#2a2c30']);
  for (let k = 0; k < 7; k++) { c.fillStyle = 'rgba(60,60,70,.35)'; c.fillRect(80 + k * 28, -64, 2, 128) }
  c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(60, -64, 6, 128);
  c.save(); c.translate(270, -64); c.rotate(-1.1); c.fillStyle = tuboGrad(0, 14, ['#f2f4f7', '#a8aeb8', '#5a5e66']); c.fillRect(0, -7, 128, 14); c.fillStyle = '#2a2c30'; c.fillRect(-6, -9, 12, 18); c.restore();
  c.fillStyle = '#050608'; c.beginPath(); c.ellipse(270, 0, 14, 64, 0, 0, 7); c.fill(); c.strokeStyle = '#d8dce2'; c.lineWidth = 3; c.stroke();
  // corpo: seção de equipamentos e escudo traseiro com mantas de isolamento (prateado, amassadinho)
  cilindro(-270, 60, 80, ['#3a3c42', '#9aa0aa', '#f4f6f8', '#d4d8de', '#8a8e96', '#26282c']);
  const q = rng(1990); for (let i = 0; i < 70; i++) { const px = -265 + q() * 320, py = -76 + q() * 152, w3 = 14 + q() * 40, h3 = 8 + q() * 22; c.fillStyle = q() < .5 ? 'rgba(255,255,255,.12)' : 'rgba(40,40,50,.12)'; c.beginPath(); c.moveTo(px, py); c.lineTo(px + w3, py + q() * 6); c.lineTo(px + w3 - q() * 8, py + h3); c.lineTo(px + q() * 6, py + h3 - q() * 4); c.fill() }
  for (let k = 0; k < 10; k++) { c.fillStyle = 'rgba(40,40,50,.35)'; c.fillRect(-260 + k * 32, -80, 2, 160) } // baias de equipamentos
  c.fillStyle = 'rgba(30,30,36,.5)'; c.fillRect(-270, -80, 330, 3); c.fillRect(-270, 77, 330, 3);
  for (const bx of [-200, -100]) { c.fillStyle = '#d8b060'; c.fillRect(bx, -30, 40, 26); c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(bx, -30, 40, 4) } // painéis dourados de manutenção
  c.fillStyle = tuboGrad(-80, 80, ['#2a2c30', '#7a7e86', '#c8ccd4', '#6a6e76', '#1a1b1e']); c.fillRect(-290, -78, 20, 156); // fundo
  // antenas de alto ganho em mastros
  for (const sd of [-1, 1]) { line(-150, sd * 80, -150, sd * 190, '#c8ccd4', 4); c.save(); c.translate(-150, sd * 200); c.rotate(sd * .4); c.fillStyle = tuboGrad(-30, 30, ['#f4f6f8', '#b8bec8', '#6a6e76']); c.beginPath(); c.ellipse(0, 0, 32, 10, 0, 0, 7); c.fill(); line(0, 0, 0, -sd * 22, '#c8ccd4', 2); disc(0, -sd * 22, 3, '#fff'); c.restore() }
  // sol batendo
  c.save(); c.globalCompositeOperation = 'lighter'; glow(-60, -70, 60, '255,250,235', .25); c.restore();
  c.restore() }
// Sombreiro no infravermelho (como a imagem do Webb/MIRI): sem o bojo, só o anel de poeira, em grumos branco-azulados
function sombreiroIR(x, y, R, t) { const img = cache('somIR', 1200, 560, () => { const X = 600, Y = 280, A = 520, B = 140, q = rng(2024);
    c.save(); c.translate(X, Y); c.globalCompositeOperation = 'lighter';
    const g = c.createRadialGradient(0, 0, 0, 0, 0, A * 1.1); g.addColorStop(0, 'rgba(40,70,150,.35)'); g.addColorStop(.7, 'rgba(25,45,110,.25)'); g.addColorStop(1, 'rgba(10,20,60,0)'); c.save(); c.scale(1, B / A * 1.6); c.fillStyle = g; c.beginPath(); c.arc(0, 0, A * 1.1, 0, 7); c.fill(); c.restore();
    for (let i = 0; i < 5200; i++) { const a = q() * 7, rad = .78 + (q() + q() + q() - 1.5) * .16 + .05 * sin(a * 6 + q()), rx = cos(a) * A * rad, ry = sin(a) * B * rad, s = 2 + q() * q() * 16, br = q();
      c.fillStyle = br < .55 ? `rgba(150,185,255,${.05 + q() * .08})` : br < .9 ? `rgba(225,235,255,${.06 + q() * .1})` : `rgba(255,210,170,${.08 + q() * .08})`; c.beginPath(); c.ellipse(rx, ry, s, s * .55, a + PI / 2, 0, 7); c.fill() }
    for (let i = 0; i < 260; i++) { const a = q() * 7, rad = .7 + q() * .2, rx = cos(a) * A * rad, ry = sin(a) * B * rad; c.fillStyle = `rgba(255,255,255,${.25 + q() * .35})`; c.beginPath(); c.arc(rx, ry, 1.2 + q() * 2.2, 0, 7); c.fill() }
    c.globalCompositeOperation = 'source-over'; for (let i = 0; i < 140; i++) { const a = q() * 7, rad = .7 + q() * .2; c.fillStyle = `rgba(4,8,24,${.25 + q() * .3})`; c.beginPath(); c.ellipse(cos(a) * A * rad, sin(a) * B * rad, 4 + q() * 12, 3 + q() * 5, a + PI / 2, 0, 7); c.fill() } // buracos escuros nos grumos
    c.globalCompositeOperation = 'lighter'; const g2 = c.createRadialGradient(0, 0, 0, 0, 0, 60); g2.addColorStop(0, 'rgba(220,235,255,.9)'); g2.addColorStop(.2, 'rgba(120,160,255,.35)'); g2.addColorStop(1, 'rgba(40,60,160,0)'); c.fillStyle = g2; c.beginPath(); c.arc(0, 0, 60, 0, 7); c.fill(); c.restore() });
  const w = 2.3 * R, h = w * 560 / 1200; c.save(); c.translate(x, y); c.rotate(-.06); c.scale(1, 1 + .01 * sin(t)); c.globalCompositeOperation = 'lighter'; c.drawImage(img, -w / 2, -h / 2, w, h); glow(0, 0, R * .06, '200,220,255', .4 + .2 * sin(t * 2)); c.restore() }
