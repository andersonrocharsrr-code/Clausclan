// ================= Personagens: Firmino, o homem de preto, Seu Anselmo e o indígena =================
// Corpo inteiro de lado: unidades com 100 = altura da pessoa, pés em (0,0), olhando para a direita (+x).
// Rostos de frente (closes): cabeça com ~100 de altura, centro em (0,0).

// segmento afinado com pontas redondas (membros)
function seg(x0, y0, x1, y1, w0, w1, col) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  c.fillStyle = col; c.beginPath(); c.moveTo(x0 + nx * w0 / 2, y0 + ny * w0 / 2); c.lineTo(x1 + nx * w1 / 2, y1 + ny * w1 / 2); c.lineTo(x1 - nx * w1 / 2, y1 - ny * w1 / 2); c.lineTo(x0 - nx * w0 / 2, y0 - ny * w0 / 2); c.closePath(); c.fill();
  c.beginPath(); c.arc(x0, y0, w0 / 2, 0, TAU); c.fill(); c.beginPath(); c.arc(x1, y1, w1 / 2, 0, TAU); c.fill();
}
function ik(sx, sy, tx, ty, l1, l2, dir = 1) { // cotovelo/joelho para alcançar (tx,ty)
  const dx = tx - sx, dy = ty - sy, d = clamp(Math.hypot(dx, dy), 1e-3, l1 + l2 - 1e-3), a = Math.atan2(dy, dx), b = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  return [sx + cos(a - dir * b) * l1, sy + sin(a - dir * b) * l1];
}
const PELE_F = { pele: '#b97f58', sombra: '#8a5a3c', luz: '#d9a47a' };
// ---------- a espingarda de dois canos (sempre a mesma) ----------
// origem no punho (atrás do gatilho); canos para +x até 40, coronha para -x até -26
function espingarda(o = {}) {
  const madeira = o.madeira || '#4a2a16', madL = '#7a4a26', aco = '#2a2c30', acoL = '#7c8088';
  // coronha
  c.fillStyle = lg(0, -2, 0, 7, [[0, madL], [.5, madeira], [1, '#2a170c']]); c.beginPath(); c.moveTo(-1, -2.4); c.lineTo(-8, -1.8); c.quadraticCurveTo(-18, -1.6, -26, -2.2); c.lineTo(-26.6, 6.8); c.quadraticCurveTo(-17, 4.6, -9, 2.8); c.quadraticCurveTo(-4, 2.6, -1, 2.2); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(30,14,6,.5)'; c.lineWidth = .25; for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(-3 - k * .5, -1 + k * .6); c.quadraticCurveTo(-14, -.8 + k * 1.1, -25.5, -1 + k * 1.5); c.stroke() }
  c.fillStyle = '#1a1a1a'; c.beginPath(); c.moveTo(-26, -2.2); c.lineTo(-27.2, -2.3); c.lineTo(-27.8, 6.9); c.lineTo(-26.6, 6.8); c.fill();
  // ferragem (báscula) e cães
  c.fillStyle = lg(0, -4, 0, 2.4, [[0, acoL], [.4, '#4a4e56'], [1, aco]]); c.beginPath(); c.roundRect(-1.4, -3.8, 8.6, 6, 1); c.fill();
  c.strokeStyle = 'rgba(220,210,180,.35)'; c.lineWidth = .18; c.beginPath(); c.moveTo(.4, -1); c.quadraticCurveTo(2.5, -2.4, 4.6, -1); c.quadraticCurveTo(2.5, .6, .4, -1); c.stroke();
  for (const dx of [0, .9]) { c.fillStyle = dx ? '#3a3c42' : '#55585f'; c.beginPath(); c.moveTo(.6 + dx, -3.4); c.quadraticCurveTo(-.6 + dx, -6.4, -2.2 + dx, -6.2); c.lineTo(-1.6 + dx, -5.4); c.quadraticCurveTo(-.4 + dx, -5, 1.6 + dx, -3.4); c.fill() }
  // guarda-mato e gatilhos
  c.strokeStyle = '#3a3c42'; c.lineWidth = .55; c.beginPath(); c.moveTo(-.6, 2.2); c.quadraticCurveTo(1.2, 5.6, 5, 2.2); c.stroke(); c.lineWidth = .45; c.beginPath(); c.moveTo(1.3, 2.2); c.quadraticCurveTo(1.1, 3.6, .5, 4); c.moveTo(2.5, 2.2); c.quadraticCurveTo(2.4, 3.5, 1.9, 3.9); c.stroke();
  // telha (madeira sob os canos)
  c.fillStyle = lg(0, -.4, 0, 2.2, [[0, madL], [1, madeira]]); c.beginPath(); c.moveTo(7, -.6); c.lineTo(21, -.5); c.quadraticCurveTo(22.4, .5, 21, 1.8); c.lineTo(7, 2.2); c.closePath(); c.fill();
  // dois canos
  for (const [y0, y1] of [[-3.3, -1.85], [-1.85, -.4]]) { c.fillStyle = lg(0, y0, 0, y1, [[0, '#8a8e96'], [.35, '#3a3d44'], [1, '#17181b']]); c.fillRect(7, y0, 33, y1 - y0) }
  c.fillStyle = '#9aa0a8'; c.fillRect(7, -3.5, 33, .3); disc(40, -2.6, .7, '#0a0a0a'); disc(40, -1.1, .7, '#0a0a0a'); disc(39.2, -3.6, .3, '#c8c0a0');
  if (o.brilho) add(() => glow(20, -2, 30, '255,60,40', o.brilho));
}
// ---------- mãos de lado (punho fechado segurando) ----------
function maoLado(x, y, a, pel, s = 1) { at(x, y, s, () => { c.fillStyle = pel.sombra; c.beginPath(); c.roundRect(-2, -1.6, 4, 3.6, 1.2); c.fill(); c.fillStyle = pel.pele; c.beginPath(); c.roundRect(-1.8, -1.9, 3.6, 3.2, 1.1); c.fill(); c.strokeStyle = pel.sombra; c.lineWidth = .25; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(-1.4 + k * 1.1, -.2); c.lineTo(-1.4 + k * 1.1, 1.3); c.stroke() } ell(-1.6, -1.4, 1, .6, -.5, pel.luz) }, a) }
// ---------- cabeça de perfil (olhando para +x). o: { idade, medo, boca, chapeu, olhar } ----------
function cabecaFirmino(o = {}) {
  const pl = PELE_F, barba = o.barba ?? .4;
  // pescoço
  c.fillStyle = lg(-4, 0, 3, 0, [[0, '#7a4e32'], [1, pl.sombra]]); c.beginPath(); c.moveTo(-3.6, 1.5); c.quadraticCurveTo(-3.2, 5, -4.6, 8.6); c.lineTo(3.6, 8.6); c.quadraticCurveTo(2, 6, 2.4, 3.4); c.closePath(); c.fill();
  c.fillStyle = 'rgba(40,20,10,.35)'; c.beginPath(); c.moveTo(-1.8, 3.6); c.quadraticCurveTo(1, 5.4, 2.6, 4.2); c.lineTo(2.4, 3.2); c.closePath(); c.fill();
  // crânio + rosto de perfil
  const perfil = () => { c.beginPath(); c.moveTo(-6, -4); c.bezierCurveTo(-6.6, -9.5, -1, -11.5, 3, -9.8); c.bezierCurveTo(5.4, -8.6, 5.8, -6, 5.9, -4.2); c.lineTo(6.3, -3.2); c.lineTo(5.9, -2.3); c.bezierCurveTo(6.8, -1.2, 7.8, .3, 7.2, .9); c.lineTo(5.9, 1.1); c.quadraticCurveTo(6.2, 1.9, 5.8, 2.4); c.quadraticCurveTo(6.1, 3, 5.6, 3.5); c.quadraticCurveTo(5.8, 4.8, 4.6, 5.6); c.quadraticCurveTo(2.6, 6.6, 1, 5.7); c.lineTo(-1.8, 3.6); c.bezierCurveTo(-4.6, 4.4, -6.4, 1.6, -6, -4); c.closePath() };
  c.fillStyle = lg(-6, 0, 7, 0, [[0, pl.sombra], [.55, pl.pele], [1, pl.luz]]); perfil(); c.fill();
  c.save(); perfil(); c.clip();
  // barba por fazer
  const q = rng(11); c.fillStyle = `rgba(40,28,20,${.25 + barba * .45})`; for (let i = 0; i < 160 + barba * 300; i++) { const x = -1.5 + q() * 7.5, y = 1 + q() * 5.5; if (x * .6 + y > 1.5) c.fillRect(x, y, .22, .22) }
  if (barba > .7) { c.fillStyle = `rgba(70,60,52,${(barba - .7) * 2})`; c.beginPath(); c.moveTo(-1.5, 2.5); c.quadraticCurveTo(3, 4, 6, 3.4); c.quadraticCurveTo(5.6, 7.6, 2, 7.4); c.quadraticCurveTo(-1, 6.4, -1.5, 2.5); c.fill() }
  // rugas e marca do sol
  c.strokeStyle = 'rgba(90,50,30,.5)'; c.lineWidth = .22; c.beginPath(); c.moveTo(3.6, -4.8); c.lineTo(5.4, -5); c.moveTo(1.8, -1); c.quadraticCurveTo(3, 1.4, 4.2, 2.6); c.moveTo(3.2, -2.6); c.lineTo(2.5, -2.1); c.moveTo(3.3, -2.2); c.lineTo(2.7, -1.6); c.stroke();
  c.restore();
  // orelha
  ell(-1.6, -1.4, 1.4, 2.1, -.2, pl.sombra); ell(-1.4, -1.4, .9, 1.5, -.2, pl.pele);
  // olho, sobrancelha
  const md = o.medo || 0; ell(3.9, -3.6, 1.05, .55 + md * .3, -.1, '#efe6d6'); disc(4.3 + (o.olhar || 0) * .3, -3.6, .45, '#3a2414'); disc(4.4, -3.75, .14, 'rgba(255,255,255,.8)');
  c.strokeStyle = '#2a1a10'; c.lineWidth = .7; c.beginPath(); c.moveTo(2.4, -5 - md * .6); c.quadraticCurveTo(4, -5.7 - md * .5, 5.6, -5.1 + md * .3); c.stroke();
  // boca (abre quando fala)
  const bo = o.boca || 0; c.fillStyle = '#5a2a1c'; c.beginPath(); c.moveTo(4.4, 2.5); c.quadraticCurveTo(5.4, 2.6 + bo * .8, 5.8, 2.5); c.quadraticCurveTo(5.3, 2.4, 4.4, 2.5); c.fill();
  // costeleta / cabelo
  c.fillStyle = o.cabelo || '#2a2018'; c.beginPath(); c.moveTo(-6, -4); c.quadraticCurveTo(-6.4, -1, -4.4, 1.2); c.lineTo(-3.4, -2); c.lineTo(-.4, -2.6); c.lineTo(0, -5); c.closePath(); c.fill(); c.fillRect(-.3, -4.4, .8, 3);
  if (o.chapeu !== 0) chapeuCouro(o.sujo || 0);
}
function chapeuCouro(sujo = 0) {
  const cor = mix('#6e4a2a', '#4a3a2a', sujo);
  // aba
  c.fillStyle = lg(0, -6, 0, -3.6, [[0, mix('#8a6038', '#5a4630', sujo)], [1, '#3a2614']]); c.beginPath(); c.moveTo(-9.6, -4.4); c.quadraticCurveTo(-2, -6.6, 10, -5.2); c.quadraticCurveTo(11, -4.4, 9.6, -3.9); c.quadraticCurveTo(0, -4.6, -9, -3.4); c.quadraticCurveTo(-10.4, -3.8, -9.6, -4.4); c.fill();
  // copa com afundado
  c.fillStyle = lg(-6, 0, 6, 0, [[0, '#3e2814'], [.5, cor], [1, mix(cor, '#c8a070', .3)]]); c.beginPath(); c.moveTo(-6.4, -5.4); c.quadraticCurveTo(-6.6, -10.6, -4.6, -11.8); c.quadraticCurveTo(-1, -10.6, 1, -12.2); c.quadraticCurveTo(4.6, -12.2, 5.8, -10.4); c.quadraticCurveTo(6.6, -8, 6.2, -5.2); c.closePath(); c.fill();
  c.fillStyle = '#2a1a0c'; c.beginPath(); c.moveTo(-6.4, -5.4); c.lineTo(6.2, -5.2); c.lineTo(6.3, -6.6); c.lineTo(-6.5, -6.8); c.fill();
  c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = .3; c.beginPath(); c.moveTo(-3, -11.2); c.quadraticCurveTo(-1, -9, 1, -11.6); c.stroke(); c.strokeStyle = 'rgba(255,220,170,.18)'; c.beginPath(); c.moveTo(3.6, -11.6); c.quadraticCurveTo(5.6, -9, 5.6, -7); c.stroke();
}
// ---------- Firmino de corpo inteiro, de lado ----------
// o: { fase (passo), anda (0..1), arma: 'baixo'|'mira'|'mao'|'ombro'|'nenhuma', inclina, medo, boca, olhar, idade (0..1), cabeca (giro em rad), sentado }
function firmino(x, y, h, o = {}, flip = false) {
  at(x, y, h / 100, () => {
    const f = o.fase || 0, an = o.anda ?? 0, idade = o.idade || 0, pl = PELE_F;
    const camisa = mix('#cdb68a', '#9a8a68', idade * .6), camS = mix('#9c845c', '#6a5c44', idade * .6), calca = '#25262b', calcaL = '#3a3c44', bota = '#111214';
    const inc = o.inclina ?? (an * .05), bob = an * Math.abs(sin(f)) * 1.2;
    const hip = o.sentado ? [0, -27] : [0, -48.6 + bob], sh = [hip[0] + 2 + inc * 30, hip[1] - 31.4], nk = [sh[0] + 2.2, sh[1] - 4];
    // pernas: ângulos de passo
    const perna = (ph, far) => {
      let foot;
      if (o.sentado) foot = far ? [19, 0] : [22, 0];
      else { const s = sin(ph), cc = cos(ph); foot = [s * 10.5 * an, -Math.max(0, cc) * 5 * an]; }
      const knee = ik(hip[0], hip[1], foot[0], foot[1] - 4, 22.8, 22.4, 1);
      const sc = far ? .72 : 1;
      seg(hip[0], hip[1], knee[0], knee[1], 11, 8.6, far ? shadeHex(calca, .7) : calca);
      seg(knee[0], knee[1], foot[0], foot[1] - 4, 8.6, 7.6, far ? shadeHex(calca, .7) : calca);
      if (!far) { c.strokeStyle = 'rgba(255,255,255,.08)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(hip[0] + 3, hip[1] + 2); c.lineTo(knee[0] + 3, knee[1]); c.stroke() }
      // bota de borracha até a canela
      const bk = [lerp(knee[0], foot[0], .32), lerp(knee[1], foot[1] - 4, .32)];
      seg(bk[0], bk[1], foot[0], foot[1] - 4, 9.4, 8.6, far ? '#0a0a0b' : bota);
      c.fillStyle = far ? '#0a0a0b' : bota; c.beginPath(); c.moveTo(foot[0] - 4.6, foot[1] - 6.6); c.lineTo(foot[0] + 4, foot[1] - 6.4); c.quadraticCurveTo(foot[0] + 9.6, foot[1] - 4.6, foot[0] + 9.6, foot[1] - .2); c.lineTo(foot[0] - 4.6, foot[1]); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,255,255,.12)'; if (!far) c.fillRect(foot[0] - 3.4, bk[1] + 1, 1.1, (foot[1] - bk[1]) * .6);
      c.fillStyle = '#2a2a2c'; c.fillRect(foot[0] - 4.8, foot[1] - 1.2, 14.4, 1.2);
      void sc;
    };
    // pose da arma: posição do punho (gx,gy) e ângulo
    const pose = o.arma ?? 'baixo';
    let G = null;
    if (pose === 'baixo') G = [hip[0] + 8, hip[1] - 4, -.42 - (o.levanta || 0) * .4];
    else if (pose === 'mira') G = [sh[0] + 25, sh[1] + 3.2, -.03 + (o.sobe || 0)];
    else if (pose === 'mao') G = [hip[0] + 6, hip[1] + 4, .12];
    else if (pose === 'ombro') { const a = -2.45, ox = sh[0] + 1, oy = sh[1] - 3; G = [ox - (cos(a) * 12 - sin(a) * -.6), oy - (sin(a) * 12 + cos(a) * -.6), a] } // cano apoiado no alto do ombro
    else if (pose === 'colo') G = [hip[0] + 12, hip[1] - 5, -.05];
    const gp = (lx, ly) => G ? [G[0] + cos(G[2]) * lx - sin(G[2]) * ly, G[1] + sin(G[2]) * lx + cos(G[2]) * ly] : null;
    const braco = (far) => {
      const s0 = [sh[0] + (far ? 1.6 : -1.2), sh[1] + 2.4];
      let hand;
      if (!G) hand = [s0[0] + sin(f + (far ? 0 : PI)) * 7 * an + 2, s0[1] + 30];
      else if (pose === 'mao') hand = far ? [s0[0] - sin(f) * 6 * an + 2, s0[1] + 30] : gp(0, 1);
      else if (pose === 'ombro') hand = far ? [s0[0] - sin(f) * 6 * an + 2, s0[1] + 30] : gp(-2, 1);
      else hand = far ? gp(15, 1.4) : gp(-.5, 1);
      // cotovelo sempre para baixo (o lado mais natural)
      const e1 = ik(s0[0], s0[1], hand[0], hand[1], 15.5, 15, 1), e2 = ik(s0[0], s0[1], hand[0], hand[1], 15.5, 15, -1), el = e1[1] > e2[1] ? e1 : e2;
      const cs = far ? shadeHex(camisa, .72) : camisa;
      seg(s0[0], s0[1], el[0], el[1], 6.8, 5.8, cs);
      c.strokeStyle = 'rgba(80,60,30,.35)'; c.lineWidth = .5; c.beginPath(); c.moveTo(lerp(s0[0], el[0], .4) - 1, lerp(s0[1], el[1], .4)); c.lineTo(lerp(s0[0], el[0], .7) + 1, lerp(s0[1], el[1], .7)); c.stroke();
      const mid = [lerp(el[0], hand[0], .22), lerp(el[1], hand[1], .22)]; // manga dobrada até o cotovelo
      seg(el[0], el[1], mid[0], mid[1], 6.2, 5.6, far ? shadeHex(camS, .8) : camS);
      seg(mid[0], mid[1], hand[0], hand[1], 4.4, 3.6, far ? pl.sombra : pl.pele);
      c.strokeStyle = far ? 'rgba(0,0,0,.15)' : 'rgba(255,220,180,.25)'; c.lineWidth = .8; c.beginPath(); c.moveTo(mid[0], mid[1] - 1.2); c.lineTo(lerp(mid[0], hand[0], .8), lerp(mid[1], hand[1], .8) - 1); c.stroke();
      return hand;
    };
    // ordem: braço de trás, perna de trás, (arma atrás), tronco, perna da frente, arma, braço da frente, cabeça
    const hf = braco(true), segura2 = G && (pose === 'baixo' || pose === 'mira' || pose === 'colo');
    if (!segura2) maoLado(hf[0], hf[1], 0, { pele: pl.sombra, sombra: '#6a422a', luz: pl.pele }, .9);
    perna(f + PI, true);
    
    // tronco: camisa bege com dobras
    c.fillStyle = lg(-8, 0, 10, 0, [[0, camS], [.6, camisa], [1, mix(camisa, '#fff2d0', .25)]]); c.beginPath();
    c.moveTo(hip[0] - 8.6, hip[1] + 2); c.quadraticCurveTo(hip[0] - 9.6, hip[1] - 16, sh[0] - 8.4, sh[1] + 2); c.quadraticCurveTo(sh[0] - 4, sh[1] - 4.4, nk[0] + 1.4, nk[1] + 1.6); c.quadraticCurveTo(sh[0] + 9, sh[1] + 2, sh[0] + 8.6, sh[1] + 12); c.quadraticCurveTo(hip[0] + 9.4, hip[1] - 14, hip[0] + 8.6, hip[1] + 2); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(80,60,30,.35)'; c.lineWidth = .6; c.beginPath(); c.moveTo(sh[0] + 3, sh[1] + 6); c.quadraticCurveTo(sh[0] + 1, hip[1] - 14, hip[0] + 4, hip[1] - 2); c.moveTo(sh[0] - 4, sh[1] + 9); c.quadraticCurveTo(hip[0] - 3, hip[1] - 12, hip[0] - 2, hip[1]); c.stroke();
    if (idade > .3) { c.fillStyle = `rgba(80,60,30,${(idade - .3) * .5})`; for (const [a, b] of [[-3, -64], [4, -58], [-1, -70]]) ell(a, b + bob, 2.5, 1.6, .4, c.fillStyle) }
    // gola
    c.fillStyle = camS; c.beginPath(); c.moveTo(nk[0] - 3, nk[1] + 2); c.lineTo(nk[0] + 3.4, nk[1] + 3.6); c.lineTo(nk[0] + 1, nk[1] + 6.4); c.closePath(); c.fill();
    // cinto, bolsa de couro com alça cruzada
    c.fillStyle = '#3a2412'; c.beginPath(); c.moveTo(hip[0] - 8.8, hip[1] - 1); c.lineTo(hip[0] + 8.8, hip[1] - 1); c.lineTo(hip[0] + 8.8, hip[1] + 2.4); c.lineTo(hip[0] - 8.8, hip[1] + 2.4); c.fill(); c.fillStyle = '#8a7a50'; c.fillRect(hip[0] + 5.6, hip[1] - .8, 2, 2.8);
    c.strokeStyle = '#4a2c14'; c.lineWidth = 2; c.beginPath(); c.moveTo(sh[0] + 4, sh[1] - 1); c.lineTo(hip[0] - 7, hip[1] + 4); c.stroke();
    c.fillStyle = lg(0, hip[1], 0, hip[1] + 12, [[0, '#7a4e28'], [1, '#4a2c14']]); c.beginPath(); c.roundRect(hip[0] - 12.6, hip[1] + 1, 9, 10, 1.6); c.fill(); c.fillStyle = '#5a3418'; c.fillRect(hip[0] - 12.6, hip[1] + 1, 9, 3.6);
    perna(f, false);
    if (G && pose !== 'ombro') at(G[0], G[1], 1, () => espingarda({ brilho: o.brilho }), G[2]);
    const hn = braco(false);
    if (G && pose === 'ombro') at(G[0], G[1], 1, () => espingarda({ brilho: o.brilho }), G[2]); // por cima do ombro e do braço
    if (segura2) maoLado(hf[0], hf[1], G[2], { pele: pl.sombra, sombra: '#6a422a', luz: pl.pele }, .9); maoLado(hn[0], hn[1], G ? G[2] : 0, pl, 1);
    at(nk[0] + 2.6, nk[1] - 7.4, 1, () => cabecaFirmino({ medo: o.medo, boca: o.boca, olhar: o.olhar, barba: .4 + idade * .7, sujo: idade, cabelo: idade > .5 ? '#4a4038' : '#2a2018' }), (o.cabeca || 0) + (pose === 'mira' ? .12 : 0));
    c.fillStyle = camS; c.beginPath(); c.moveTo(nk[0] - 3.4, nk[1] - .4); c.quadraticCurveTo(nk[0] + .4, nk[1] + 2.4, nk[0] + 4.8, nk[1] + .6); c.lineTo(nk[0] + 3.2, nk[1] + 4); c.lineTo(nk[0] + .6, nk[1] + 2.6); c.lineTo(nk[0] - 2.2, nk[1] + 3.8); c.closePath(); c.fill();
  }, 0, flip);
}
// animal abatido carregado no ombro (deitado de lado sobre os ombros)
function carga(bicho, x, y, h, t, flip) { const s = h / 100; at(x + (flip ? -1 : 1) * 3 * s, y - 83 * s, s * .5, () => { c.save(); c.scale(1, -1); c.rotate(.08); bicho(t, { anda: 0 }); c.restore() }, 0, flip) }
function shadeHex(col, k) { let v; if (col[0] === '#') { const n = parseInt(col.slice(1), 16); v = [n >> 16, (n >> 8) & 255, n & 255] } else v = col.match(/[\d.]+/g).slice(0, 3).map(Number); return '#' + v.map(x => Math.max(0, Math.min(255, Math.round(x * k))).toString(16).padStart(2, '0')).join('') }

// ---------- boca sincronizada com a fala ----------
function bocaFala(k, t) {
  if (!FW[k] || t < S[k] || t > E[k] + .1) return 0; const ws = FW[k];
  for (let i = 0; i < ws.length; i++) { const t0 = ws[i][1], t1 = i + 1 < ws.length ? ws[i + 1][1] : E[k]; if (t >= t0 && t < t1) { const dur = Math.max(.12, Math.min(t1 - t0, ws[i][0].length * .075)); const u = (t - t0) / dur; return u < 1 ? .35 + .65 * Math.abs(sin(u * PI * Math.max(1, ws[i][0].length / 3))) : 0 } }
  return 0;
}
function falando(ks, t) { return Math.max(...ks.map(k => bocaFala(k, t))) }

// ---------- rostos de frente (closes). Firmino: rostoFirmino(o); Anselmo: closeAnselmo(t, o) ----------
// o: { medo, sorriso, boca, olharX, olharY, suor, idade, raiva, vermelho, preocupado }
function rostoFirmino(o = {}) { rostoFrente(Object.assign({ tipo: 'F' }, o)) }
function closeAnselmo(t, o = {}) { at(0, 0, 1, () => rostoFrente(Object.assign({ tipo: 'A' }, o))) }
function rostoFrente(o) {
  const A = o.tipo === 'A', pl = A ? PELE_A : PELE_F, md = o.medo || 0, so = o.sorriso || 0, idade = A ? .6 : (o.idade || 0), ox = (o.olharX || 0), oy = (o.olharY || 0);
  const cab = A ? '#cfcac2' : (idade > .5 ? '#4a4038' : '#2a2018'), sob = A ? '#d8d4cc' : '#2a1c12', larg = A ? 47 : 44;
  // pescoço e roupa
  c.fillStyle = pl.sombra; c.fillRect(-24, 40, 48, 50);
  if (A) {
    c.fillStyle = lg(-90, 0, 90, 0, [[0, '#bfb6a4'], [.6, '#ece6d8'], [1, '#d0c8b6']]); c.beginPath(); c.moveTo(-130, 150); c.quadraticCurveTo(-110, 72, -34, 62); c.lineTo(34, 62); c.quadraticCurveTo(110, 72, 130, 150); c.fill();
    poly([[-34, 60], [-4, 98], [-14, 108], [-44, 70]], '#e0d8c8'); poly([[34, 60], [4, 98], [14, 108], [44, 70]], '#d4ccbc'); disc(0, 112, 2.4, '#cfc6b0'); disc(0, 134, 2.4, '#cfc6b0');
    for (const k of [-1, 1]) { c.strokeStyle = '#4a2a1a'; c.lineWidth = 10; c.beginPath(); c.moveTo(k * 50, 70); c.lineTo(k * 56, 150); c.stroke() }
  } else {
    c.fillStyle = lg(-80, 0, 80, 0, [[0, '#7a6648'], [.5, mix('#cdb68a', '#9a8a68', idade * .6)], [1, '#8a7656']]); c.beginPath(); c.moveTo(-120, 150); c.quadraticCurveTo(-100, 72, -30, 62); c.lineTo(0, 92); c.lineTo(30, 62); c.quadraticCurveTo(100, 72, 120, 150); c.fill();
    poly([[-30, 62], [-6, 96], [-22, 104], [-40, 70]], '#9c845c'); poly([[30, 62], [6, 96], [22, 104], [40, 70]], '#8a7450');
    c.strokeStyle = '#4a2c14'; c.lineWidth = 9; c.beginPath(); c.moveTo(-62, 72); c.lineTo(40, 150); c.stroke();
  }
  for (const k of [-1, 1]) { ell(k * larg, 2, 8, 14, 0, pl.sombra); ell(k * (larg - 1), 2, 5, 10, 0, pl.pele) }
  const cara = () => { c.beginPath(); c.moveTo(0, -54); c.bezierCurveTo(30, -54, larg, -36, larg, -8); c.bezierCurveTo(larg, 18, 36, 38, 22, 50); c.bezierCurveTo(12, 58, -12, 58, -22, 50); c.bezierCurveTo(-36, 38, -larg, 18, -larg, -8); c.bezierCurveTo(-larg, -36, -30, -54, 0, -54); c.closePath() };
  c.fillStyle = rg(-14, -14, 6, 72, [[0, pl.luz], [.55, pl.pele], [1, pl.sombra]]); cara(); c.fill();
  c.save(); cara(); c.clip();
  ell(-24, 14, 12, 7, 0, 'rgba(170,80,50,.18)'); ell(24, 14, 12, 7, 0, 'rgba(170,80,50,.18)');
  if (!A) { c.fillStyle = 'rgba(80,40,20,.16)'; c.fillRect(-50, -60, 100, 22);
    const q = rng(12), bb = .45 + idade * .55; for (let i = 0; i < 1400 + idade * 1800; i++) { const x = (q() - .5) * 92, y = 8 + q() * 54; if (y > 18 - Math.abs(x) * .05 && !(Math.abs(x) < 11 && y > 29 && y < 41)) { c.fillStyle = `rgba(36,26,20,${(.18 + q() * .3) * (.6 + bb * .5)})`; c.fillRect(x, y, .7 + q() * .5, .7 + q() * .5) } }
    if (idade > .6) { c.fillStyle = `rgba(80,72,66,${(idade - .6) * 2})`; c.beginPath(); c.moveTo(-42, 12); c.quadraticCurveTo(-30, 68, 0, 72); c.quadraticCurveTo(30, 68, 42, 12); c.quadraticCurveTo(20, 40, 0, 36); c.quadraticCurveTo(-20, 40, -42, 12); c.fill() }
  }
  c.fillStyle = lg(-10, 0, 48, 0, [[0, 'rgba(60,30,15,0)'], [1, 'rgba(40,20,10,.42)']]); c.fillRect(-50, -60, 100, 130);
  c.restore();
  // cabelo (Anselmo: grisalho, entradas; Firmino: costeletas sob o chapéu)
  if (A) { c.fillStyle = cab; c.beginPath(); c.moveTo(-larg - 2, 0); c.quadraticCurveTo(-larg - 4, -40, -24, -54); c.quadraticCurveTo(-10, -50, -14, -42); c.quadraticCurveTo(-36, -36, -40, -6); c.closePath(); c.fill(); c.beginPath(); c.moveTo(larg + 2, 0); c.quadraticCurveTo(larg + 4, -40, 24, -54); c.quadraticCurveTo(10, -50, 14, -42); c.quadraticCurveTo(36, -36, 40, -6); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(200,196,188,.6)'; c.lineWidth = 1; for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(k * 4, -55); c.quadraticCurveTo(k * 6, -50, k * 7, -44); c.stroke() } }
  else { c.fillStyle = cab; for (const k of [-1, 1]) { c.beginPath(); c.moveTo(k * 45, -28); c.quadraticCurveTo(k * 48, -6, k * 42, 6); c.lineTo(k * 38, -24); c.fill() } }
  // olhos
  for (const k of [-1, 1]) {
    const ex = k * 17, ey = -6, ab = 1 + md * .5 - (A ? .1 : 0);
    c.fillStyle = 'rgba(90,50,30,.32)'; c.beginPath(); c.ellipse(ex, ey + 1, 11, 7 * ab, 0, 0, TAU); c.fill();
    c.save(); c.beginPath(); c.moveTo(ex - 9.5, ey); c.quadraticCurveTo(ex, ey - 6.4 * ab, ex + 9.5, ey); c.quadraticCurveTo(ex, ey + 5 * ab - so * 2, ex - 9.5, ey); c.closePath(); c.fillStyle = '#ede4d4'; c.fill(); c.clip();
    const ix = ex + ox * 4, iy = ey + oy * 3; disc(ix, iy, 4.6, A ? '#4a5a5a' : '#4a2c18'); disc(ix, iy, 3.2, A ? '#2a3434' : '#2a1a0e'); disc(ix, iy, 1.8 + md * .6, '#060404'); disc(ix - 1.4, iy - 1.6, 1.1, 'rgba(255,255,255,.9)');
    if (o.vermelho) disc(ix + 1.2, iy + 1, 1, `rgba(255,70,40,${o.vermelho})`);
    c.fillStyle = 'rgba(60,30,20,.3)'; c.fillRect(ex - 12, ey - 8, 24, 3 + (1 - md) * 1.5);
    c.restore();
    c.strokeStyle = '#2a1a10'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(ex - 9.5, ey); c.quadraticCurveTo(ex, ey - 6.4 * ab, ex + 9.5, ey); c.stroke();
    const pre = o.preocupado || 0, inner = ey - 13 - md * 6 - pre * 4 + (o.raiva || 0) * 5, outer = ey - 14 + md * 1;
    c.fillStyle = sob; c.beginPath(); c.moveTo(k * 5, inner); c.quadraticCurveTo(k * 16, ey - 19 - md * 3, k * 28, outer); c.lineTo(k * 27, outer + 3.4); c.quadraticCurveTo(k * 16, ey - 15 - md * 3, k * 5, inner + 4); c.fill();
    c.strokeStyle = 'rgba(90,50,30,.5)'; c.lineWidth = .8; for (let j = 0; j < 3; j++) { c.beginPath(); c.moveTo(k * 28, ey - 2 + j * 3); c.lineTo(k * 33, ey - 4 + j * 4.5); c.stroke() }
    if (A) { c.strokeStyle = 'rgba(120,70,50,.35)'; c.lineWidth = 1; c.beginPath(); c.moveTo(ex - 8, ey + 7); c.quadraticCurveTo(ex, ey + 10, ex + 8, ey + 7); c.stroke() }
  }
  c.strokeStyle = `rgba(90,50,30,${.3 + md * .3 + idade * .2})`; c.lineWidth = 1; for (let j = 0; j < 3; j++) { c.beginPath(); c.moveTo(-22, -30 - j * 6); c.quadraticCurveTo(0, -33 - j * 6 - md * 3 - (o.preocupado || 0) * 3, 22, -30 - j * 6); c.stroke() }
  // nariz
  c.fillStyle = 'rgba(110,60,35,.5)'; c.beginPath(); c.moveTo(-3, -4); c.quadraticCurveTo(-5, 12, -9, 20); c.quadraticCurveTo(-2, 25, 0, 24); c.quadraticCurveTo(-4, 20, -3, -4); c.fill();
  ell(-5.5, 21, 3, 1.8, 0, 'rgba(60,30,18,.7)'); ell(5.5, 21, 3, 1.8, 0, 'rgba(60,30,18,.7)'); ell(-2, 15, 3, 6, 0, 'rgba(255,220,180,.25)');
  // boca
  const bo = o.boca || 0, my = 36;
  c.fillStyle = '#4a1c12'; c.beginPath(); c.moveTo(-13 - so * 3, my - so * 3); c.quadraticCurveTo(0, my - 2 + so * 2, 13 + so * 3, my - so * 3); c.quadraticCurveTo(0, my + 2 + bo * 10 + so * 4 + md * 2, -13 - so * 3, my - so * 3); c.fill();
  if (bo > .2 || so > .3) { c.fillStyle = '#e8dcc4'; c.beginPath(); c.moveTo(-9 - so * 2, my - so * 2); c.quadraticCurveTo(0, my + so, 9 + so * 2, my - so * 2); c.lineTo(8, my + 1.6); c.lineTo(-8, my + 1.6); c.fill() }
  c.strokeStyle = 'rgba(110,55,40,.6)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-8, my + 6 + bo * 8); c.quadraticCurveTo(0, my + 8 + bo * 8, 8, my + 6 + bo * 8); c.stroke();
  c.strokeStyle = 'rgba(90,45,25,.45)'; c.lineWidth = 1.2; for (const k of [-1, 1]) { c.beginPath(); c.moveTo(k * 11, 18); c.quadraticCurveTo(k * 19, 30, k * 16, 42); c.stroke() }
  if (A) { // bigode grisalho
    c.fillStyle = '#dcd8d0'; c.beginPath(); c.moveTo(-22, 36); c.quadraticCurveTo(-14, 20, 0, 26); c.quadraticCurveTo(14, 20, 22, 36); c.quadraticCurveTo(12, 30, 0, 32); c.quadraticCurveTo(-12, 30, -22, 36); c.fill();
    c.strokeStyle = 'rgba(150,140,130,.6)'; c.lineWidth = .8; for (let k = -5; k <= 5; k++) { c.beginPath(); c.moveTo(k * 3, 26 + Math.abs(k) * .3); c.lineTo(k * 3.6, 32 + Math.abs(k) * .4); c.stroke() }
  }
  if (o.suor) for (const [x, y] of [[-26, -26], [20, -22], [32, 4]]) ell(x, y, 1.8, 2.8, 0, 'rgba(240,250,255,.6)');
  if (!A) chapeuFrente(idade);
}
function chapeuFrente(idade) { // chapéu de couro visto de frente: aba em elipse, copa com afundado
  const ch = mix('#6e4a2a', '#4a3a2a', idade), chL = mix(ch, '#d8a870', .3);
  c.fillStyle = lg(0, -64, 0, -30, [[0, mix(ch, '#000000', .25)], [1, '#1e1208']]); c.beginPath(); c.ellipse(0, -44, 98, 20, 0, PI, TAU); c.fill(); // aba de trás
  c.fillStyle = lg(-46, 0, 46, 0, [[0, '#2e1c0e'], [.35, ch], [.7, chL], [1, mix(ch, '#000000', .2)]]); c.beginPath(); c.moveTo(-46, -46); c.bezierCurveTo(-50, -84, -40, -104, -22, -106); c.quadraticCurveTo(-8, -98, 0, -100); c.quadraticCurveTo(8, -98, 22, -106); c.bezierCurveTo(40, -104, 50, -84, 46, -46); c.closePath(); c.fill();
  c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.moveTo(-6, -100); c.quadraticCurveTo(-12, -80, -4, -62); c.quadraticCurveTo(4, -80, 6, -100); c.fill();
  c.fillStyle = 'rgba(255,220,170,.12)'; c.beginPath(); c.ellipse(24, -84, 8, 16, .2, 0, TAU); c.fill();
  c.fillStyle = '#24160a'; c.beginPath(); c.moveTo(-47, -46); c.quadraticCurveTo(0, -52, 47, -46); c.lineTo(47, -58); c.quadraticCurveTo(0, -63, -47, -58); c.fill();
  c.fillStyle = lg(0, -46, 0, -22, [[0, chL], [.4, ch], [1, '#1a1008']]); c.beginPath(); c.ellipse(0, -44, 98, 20, 0, 0, PI); c.lineTo(-98, -44); c.quadraticCurveTo(0, -56, 98, -44); c.fill(); // aba da frente
  c.strokeStyle = 'rgba(30,18,8,.6)'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(0, -44, 98, 20, 0, .05, PI - .05); c.stroke();
  c.fillStyle = 'rgba(0,0,0,.42)'; c.beginPath(); c.ellipse(0, -24, 46, 10, 0, 0, PI); c.lineTo(-46, -24); c.quadraticCurveTo(0, -34, 46, -24); c.fill(); // sombra na testa
}

// ---------- o homem de preto (silhueta escura, cabelo comprido, só os olhos vermelhos; fumaça vermelha em volta) ----------
// fumaça vermelha (aura) atrás dele
function auraVermelha(x, y, r, t, a = 1, seed = 3) {
  if (a <= 0) return; const q = rng(seed);
  add(() => glow(x, y, r * 1.3, '150,20,24', .32 * a));
  for (let i = 0; i < 26; i++) { const ang = q() * TAU, d = r * (.45 + q() * .7), px = x + cos(ang + t * .05) * d * 1.3, py = y + sin(ang) * d * .8 + sin(t * .4 + i) * r * .03 - t * 4 % 1, rr = r * (.15 + q() * .25); c.fillStyle = rg(px, py, 0, rr, [[0, `rgba(120,18,22,${.22 * a})`], [1, 'rgba(90,10,15,0)']]); c.beginPath(); c.arc(px, py, rr, 0, TAU); c.fill() }
}
function olhoBrasa(x, y, w, ol, t, k) { // olho amendoado vermelho com brilho
  add(() => { glow(x, y, w * 5 * ol, '255,30,15', .25 * ol); glow(x, y, w * 1.6 * ol, '255,90,50', .55 * ol) });
  c.fillStyle = `rgba(255,${60 + 50 * ol},${30 * ol},${Math.min(1, ol * 1.2)})`; c.beginPath(); c.moveTo(x - w, y + w * .1); c.quadraticCurveTo(x, y - w * .62, x + w, y - k * w * .12); c.quadraticCurveTo(x, y + w * .45, x - w, y + w * .1); c.fill();
  disc(x, y - w * .05, w * .3, `rgba(255,${190 + 40 * sin(t * 7 + k)},120,${ol})`); disc(x, y - w * .05, w * .12, `rgba(40,0,0,${ol})`);
}
// de frente, pés em (0,0), altura 100 (ele é mais alto: use h maior). o: { olhos (0..1), cabeca, vento, aura }
function homemPreto(x, y, h, t, o = {}) {
  at(x, y, h / 100, () => {
    const v = (o.vento || 0) * sin(t * 2.3), up = o.cabeca ?? .5, ol = o.olhos ?? 1, hy = -94 - up * .6;
    auraVermelha(0, -60, 70, t, o.aura ?? .8, 7);
    // névoa vermelha rasteira nos pés
    for (let i = 0; i < 7; i++) { const px = (i - 3) * 9 + sin(t * .6 + i) * 3; c.fillStyle = rg(px, -3, 0, 14, [[0, 'rgba(110,15,20,.35)'], [1, 'rgba(110,15,20,0)']]); c.beginPath(); c.arc(px, -3, 14, 0, TAU); c.fill() }
    // sobretudo
    c.fillStyle = lg(-20, 0, 20, 0, [[0, '#020102'], [.6, '#070405'], [1, '#100809']]); c.beginPath(); c.moveTo(-11, -84); c.quadraticCurveTo(-20, -80, -20, -64); c.lineTo(-23 - v * 3, -2); c.quadraticCurveTo(-8, 1 + v, 0, -1); c.quadraticCurveTo(10, 1 - v, 23 + v * 4, -3); c.lineTo(20, -64); c.quadraticCurveTo(20, -80, 11, -84); c.closePath(); c.fill();
    // contorno avermelhado
    c.strokeStyle = 'rgba(190,40,40,.35)'; c.lineWidth = .8; c.beginPath(); c.moveTo(-11, -84); c.quadraticCurveTo(-20, -80, -20, -64); c.lineTo(-23 - v * 3, -2); c.moveTo(11, -84); c.quadraticCurveTo(20, -80, 20, -64); c.lineTo(23 + v * 4, -3); c.stroke();
    for (const k of [-1, 1]) { c.fillStyle = '#040203'; c.beginPath(); c.moveTo(k * 15, -80); c.quadraticCurveTo(k * 21, -60, k * 19, -42); c.lineTo(k * 14.5, -42); c.quadraticCurveTo(k * 15.5, -60, k * 11, -76); c.fill(); ell(k * 17, -39.4, 2, 3, 0, '#120c0c') }
    // cabelo comprido caindo dos lados do rosto até os ombros
    c.fillStyle = '#030102'; c.beginPath(); c.moveTo(-7.4, hy - 6); c.lineTo(-8.4, hy + 14); c.quadraticCurveTo(-4, hy + 17, 0, hy + 15); c.quadraticCurveTo(4, hy + 17, 8.4, hy + 14); c.lineTo(7.4, hy - 6); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(120,30,30,.25)'; c.lineWidth = .3; for (let k = -3; k <= 3; k++) { if (Math.abs(k) < 2) continue; c.beginPath(); c.moveTo(k * 2.1, hy - 5); c.lineTo(k * 2.3 + v * .3, hy + 14); c.stroke() }
    // rosto em sombra total
    c.fillStyle = '#060304'; c.beginPath(); c.ellipse(0, hy, 5.2, 7.4, 0, 0, TAU); c.fill();
    if (ol > 0) for (const k of [-1, 1]) olhoBrasa(k * 2.3, hy - 1.4, 1.2, ol, t, k);
    // chapéu de aba larga com copa afundada e luz vermelha na borda
    c.fillStyle = '#050304'; c.beginPath(); c.ellipse(0, hy - 6.4, 15.5, 3, 0, 0, TAU); c.fill();
    c.fillStyle = lg(-7, 0, 7, 0, [[0, '#030202'], [.7, '#0c0708'], [1, '#1a0c0d']]); c.beginPath(); c.moveTo(-7.4, hy - 6.6); c.quadraticCurveTo(-7.8, hy - 14.8, -4.2, hy - 15.6); c.quadraticCurveTo(-1.6, hy - 13.4, 0, hy - 14.6); c.quadraticCurveTo(1.6, hy - 13.4, 4.2, hy - 15.6); c.quadraticCurveTo(7.8, hy - 14.8, 7.4, hy - 6.6); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(200,50,50,.4)'; c.lineWidth = .4; c.beginPath(); c.ellipse(0, hy - 6.5, 15.5, 3, 0, PI * 1.04, PI * 1.96); c.stroke(); c.beginPath(); c.moveTo(-4.2, hy - 15.6); c.quadraticCurveTo(-1.6, hy - 13.4, 0, hy - 14.6); c.quadraticCurveTo(1.6, hy - 13.4, 4.2, hy - 15.6); c.stroke();
  });
}
// close do rosto do homem de preto: igual à silhueta, maior. o: { olhos, cabeca (0..1) }
function rostoPreto(t, o = {}) {
  const up = o.cabeca ?? .3, ol = o.olhos ?? 1;
  auraVermelha(0, 30, 260, t, o.aura ?? 1, 11);
  // ombros e sobretudo
  c.fillStyle = lg(0, 40, 0, 200, [[0, '#0a0506'], [1, '#020102']]); c.beginPath(); c.moveTo(-200, 220); c.quadraticCurveTo(-180, 90, -70, 66); c.lineTo(70, 66); c.quadraticCurveTo(180, 90, 200, 220); c.fill();
  c.strokeStyle = 'rgba(190,40,40,.35)'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-200, 220); c.quadraticCurveTo(-180, 90, -70, 66); c.moveTo(200, 220); c.quadraticCurveTo(180, 90, 70, 66); c.stroke();
  // cabelo comprido
  c.fillStyle = '#030102'; c.beginPath(); c.moveTo(-50, -50 + up * 6); c.lineTo(-58, 110); c.quadraticCurveTo(-30, 126, 0, 118); c.quadraticCurveTo(30, 126, 58, 110); c.lineTo(50, -50 + up * 6); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(130,30,30,.2)'; c.lineWidth = 1.2; for (const k of [-46, -40, -33, 33, 40, 46]) { c.beginPath(); c.moveTo(k, -40); c.quadraticCurveTo(k * 1.05, 40, k * 1.12 + sin(t * .7 + k) * 2, 112); c.stroke() }
  // rosto em sombra
  c.fillStyle = '#070304'; c.beginPath(); c.ellipse(0, 4, 34, 48, 0, 0, TAU); c.fill();
  c.fillStyle = rg(0, -8 - up * 3, 2, 40, [[0, `rgba(90,10,12,${.25 * ol})`], [1, 'rgba(90,10,12,0)']]); c.beginPath(); c.ellipse(0, 4, 34, 48, 0, 0, TAU); c.fill();
  for (const k of [-1, 1]) olhoBrasa(k * 15, -6 - up * 3, 8.4, ol, t, k);
  // chapéu
  const by = -46 + up * 8;
  c.fillStyle = '#040203'; c.beginPath(); c.ellipse(0, by, 165, 30, 0, PI, TAU); c.fill();
  c.fillStyle = lg(-60, 0, 60, 0, [[0, '#030202'], [.75, '#0e0809'], [1, '#1c0e0f']]); c.beginPath(); c.moveTo(-58, by - 4); c.bezierCurveTo(-64, -112, -52, -136, -30, -138); c.quadraticCurveTo(-12, -122, 0, -128); c.quadraticCurveTo(12, -122, 30, -138); c.bezierCurveTo(52, -136, 64, -112, 58, by - 4); c.fill();
  c.fillStyle = 'rgba(0,0,0,.4)'; c.beginPath(); c.ellipse(-20, -118, 10, 14, .3, 0, TAU); c.ellipse(20, -118, 10, 14, -.3, 0, TAU); c.fill();
  c.fillStyle = lg(0, by - 6, 0, by + 30, [[0, '#120a0b'], [1, '#020102']]); c.beginPath(); c.ellipse(0, by, 165, 30, 0, 0, PI); c.lineTo(-165, by); c.quadraticCurveTo(0, by - 12, 165, by); c.fill();
  c.strokeStyle = 'rgba(210,50,50,.38)'; c.lineWidth = 2.4; c.beginPath(); c.ellipse(0, by, 165, 30, 0, PI * 1.02, PI * 1.98); c.stroke(); c.lineWidth = 1.6; c.beginPath(); c.moveTo(-58, by - 4); c.bezierCurveTo(-64, -112, -52, -136, -30, -138); c.moveTo(58, by - 4); c.bezierCurveTo(64, -112, 52, -136, 30, -138); c.stroke();
}

// ---------- Seu Anselmo (de frente, 3/4). o: { boca, sorriso, braco: 'dinheiro'|'cintura'|'baixo', olhar, preocupado } ----------
const PELE_A = { pele: '#d8a882', sombra: '#a87a5a', luz: '#ecc4a0' };
function anselmo(x, y, h, t, o = {}) {
  at(x, y, h / 100, () => {
    const pl = PELE_A, cal = '#5a5650', camisa = '#ece6d8', camS = '#bfb6a4', susp = '#4a2a1a';
    for (const k of [-1, 1]) { c.fillStyle = k < 0 ? shadeHex(cal, .8) : cal; c.beginPath(); c.moveTo(k * 1, -46); c.lineTo(k * 13, -46); c.lineTo(k * 11.5, -3); c.lineTo(k * 3, -3); c.fill(); c.fillStyle = '#2a1a10'; c.beginPath(); c.roundRect(k * 7 - 5.5, -4, 11, 4, 1.6); c.fill() }
    // camisa branca com barriga
    c.fillStyle = lg(-16, 0, 16, 0, [[0, camS], [.55, camisa], [1, '#d6cebe']]); c.beginPath(); c.moveTo(-13, -46); c.quadraticCurveTo(-18, -60, -15, -76); c.quadraticCurveTo(-12, -83, -5, -84); c.lineTo(5, -84); c.quadraticCurveTo(12, -83, 15, -76); c.quadraticCurveTo(18, -60, 13, -46); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(120,110,90,.35)'; c.lineWidth = .4; for (let j = 0; j < 4; j++) disc(0, -78 + j * 8, .55, '#cfc6b0'); c.beginPath(); c.moveTo(0, -82); c.lineTo(0, -48); c.stroke();
    c.fillStyle = '#3a2a1a'; c.fillRect(-13.4, -48, 26.8, 2.6);
    for (const k of [-1, 1]) { c.strokeStyle = susp; c.lineWidth = 2; c.beginPath(); c.moveTo(k * 7, -83); c.quadraticCurveTo(k * 8.6, -66, k * 7.6, -47); c.stroke(); disc(k * 7.6, -48, 1, '#b89a5a') }
    // braços (mangas arregaçadas)
    const br = o.braco || 'baixo';
    for (const k of [-1, 1]) {
      const sh = [k * 14, -79]; let hd;
      if (br === 'cintura') hd = [k * 13, -50]; else if (br === 'dinheiro' && k > 0) hd = [8, -58]; else if (br === 'aponta' && k > 0) hd = [22, -66]; else hd = [k * 18, -46];
      const el = ik(sh[0], sh[1], hd[0], hd[1], 15, 14, k > 0 ? -1 : 1);
      seg(sh[0], sh[1], el[0], el[1], 7.4, 6.6, k < 0 ? camS : camisa); const m = [lerp(el[0], hd[0], .2), lerp(el[1], hd[1], .2)]; seg(el[0], el[1], m[0], m[1], 7, 6.4, k < 0 ? '#b0a690' : '#dcd4c2'); seg(m[0], m[1], hd[0], hd[1], 5, 4.4, k < 0 ? pl.sombra : pl.pele); ell(hd[0], hd[1] + 1.4, 2.6, 3, 0, pl.pele);
      if (br === 'dinheiro' && k > 0) { at(hd[0] + 1, hd[1] - 1, 1, () => { for (let j = 0; j < 4; j++) { c.fillStyle = ['#8aa078', '#a0b48a', '#7a9468', '#b4c49c'][j]; c.beginPath(); c.roundRect(-1 + j * .6, -5 - j * .8, 11, 5, .5); c.fill(); c.strokeStyle = 'rgba(40,60,30,.4)'; c.lineWidth = .2; c.stroke() } }, -.4) }
    }
    // cabeça
    c.fillStyle = pl.sombra; c.fillRect(-3.4, -88, 6.8, 5);
    at(0, -94, 1, () => rostoA(o, t));
  });
}
function rostoA(o, t) { // cabeça do Anselmo em unidades pequenas (altura ~17)
  const pl = PELE_A;
  for (const k of [-1, 1]) ell(k * 6.4, .5, 1.3, 2, 0, pl.sombra);
  c.fillStyle = rg(-2, -2, 1, 10, [[0, pl.luz], [.6, pl.pele], [1, pl.sombra]]); c.beginPath(); c.ellipse(0, 0, 6.6, 8, 0, 0, TAU); c.fill();
  c.fillStyle = '#c8c4bc'; c.beginPath(); c.ellipse(0, -5, 6.9, 4, 0, PI, 0); c.fill(); c.fillStyle = pl.pele; c.beginPath(); c.ellipse(0, -5.6, 4.6, 2.6, 0, PI, 0); c.fill(); // careca no alto
  for (const k of [-1, 1]) { ell(k * 2.5 + (o.olhar || 0) * .3, -.8, .9, .45, 0, '#f0e8dc'); disc(k * 2.5 + (o.olhar || 0) * .5, -.8, .35, '#3a3028'); c.fillStyle = '#d8d4cc'; c.save(); c.translate(k * 2.5, -2.2 - (o.preocupado || 0) * .3); c.rotate(k * (o.preocupado ? -.25 : .1)); c.fillRect(-1.5, -.3, 3, .7); c.restore() }
  c.fillStyle = 'rgba(140,90,60,.5)'; c.beginPath(); c.moveTo(-.3, -.6); c.lineTo(-1.1, 2.6); c.lineTo(.6, 2.8); c.fill();
  const bo = o.boca || 0, so = o.sorriso || 0; c.fillStyle = '#5a2a20'; c.beginPath(); c.moveTo(-1.8 - so, 4.6 - so * .4); c.quadraticCurveTo(0, 4.8 + bo * 1.6 + so, 1.8 + so, 4.6 - so * .4); c.quadraticCurveTo(0, 4.4, -1.8 - so, 4.6 - so * .4); c.fill();
  // bigode grisalho
  c.fillStyle = '#d6d2ca'; c.beginPath(); c.moveTo(-3.4, 4.4); c.quadraticCurveTo(-1.8, 2.4, 0, 3.1); c.quadraticCurveTo(1.8, 2.4, 3.4, 4.4); c.quadraticCurveTo(1.6, 3.8, 0, 4.1); c.quadraticCurveTo(-1.6, 3.8, -3.4, 4.4); c.fill(); c.fillStyle = 'rgba(140,130,120,.5)'; c.fillRect(-2.4, 3.6, 4.8, .3);
  c.strokeStyle = 'rgba(140,90,60,.4)'; c.lineWidth = .2; c.beginPath(); c.moveTo(-2, -4.2); c.lineTo(2, -4.2); c.moveTo(-1.6, -3.5); c.lineTo(1.6, -3.5); c.stroke();
}
// ---------- o indígena correndo com o jabuti no aturá (cesto) ----------
const PELE_I = { pele: '#9a6440', sombra: '#6e4428', luz: '#bc8458' };
function indigena(x, y, h, t, o = {}) {
  at(x, y, h / 100, () => {
    const f = o.fase ?? t * 10, pl = PELE_I, an = o.anda ?? 1;
    const hip = [0, -50 + Math.abs(sin(f)) * 2.4], sh = [hip[0] + 7, -80 + Math.abs(sin(f)) * 2.4];
    const perna = (ph, far) => { const s = sin(ph), cc = cos(ph); const foot = [s * 20 * an, -Math.max(0, cc) * 12 * an]; const kn = ik(hip[0], hip[1], foot[0], foot[1] - 3, 24, 24, 1); const col = far ? pl.sombra : pl.pele; seg(hip[0], hip[1], kn[0], kn[1], 9.4, 7.4, col); seg(kn[0], kn[1], foot[0], foot[1] - 3, 7.2, 5.6, col); ell(foot[0] + 2.6, foot[1] - 1.6, 4.6, 1.8, 0, far ? '#5a3820' : pl.sombra) };
    const braco = (ph, far) => { const s0 = [sh[0] + (far ? 1.5 : -1), sh[1] + 2.4], s = sin(ph); const hd = [s0[0] + s * 13, s0[1] + 22 - Math.abs(s) * 4]; const el = ik(s0[0], s0[1], hd[0], hd[1], 15, 14, -1); const col = far ? pl.sombra : pl.pele; seg(s0[0], s0[1], el[0], el[1], 6.6, 5.4, col); seg(el[0], el[1], hd[0], hd[1], 5.4, 4.4, col); ell(hd[0], hd[1] + .6, 2.2, 2.6, 0, col) };
    braco(f, true); perna(f + PI, true);
    // tronco inclinado para frente
    c.fillStyle = lg(-6, 0, 12, 0, [[0, pl.sombra], [.6, pl.pele], [1, pl.luz]]); c.beginPath(); c.moveTo(hip[0] - 7, hip[1] + 2); c.quadraticCurveTo(hip[0] - 7, hip[1] - 18, sh[0] - 7, sh[1] + 1); c.quadraticCurveTo(sh[0], sh[1] - 3.6, sh[0] + 7, sh[1] + 2); c.quadraticCurveTo(hip[0] + 11, hip[1] - 14, hip[0] + 7, hip[1] + 2); c.closePath(); c.fill();
    // pintura de urucum e jenipapo (faixas discretas)
    c.strokeStyle = 'rgba(30,20,20,.55)'; c.lineWidth = .9; c.beginPath(); c.moveTo(sh[0] - 4, sh[1] + 9); c.lineTo(sh[0] + 6, sh[1] + 10); c.moveTo(sh[0] - 4.5, sh[1] + 12); c.lineTo(sh[0] + 6.4, sh[1] + 13); c.stroke();
    // tanga/calção de fibra escura e cinto de fibra
    c.fillStyle = '#3a2a1c'; c.beginPath(); c.moveTo(hip[0] - 7.6, hip[1] - 3); c.lineTo(hip[0] + 8, hip[1] - 3); c.lineTo(hip[0] + 7, hip[1] + 7); c.lineTo(hip[0] - 7, hip[1] + 7); c.fill(); c.fillStyle = '#a8803a'; c.fillRect(hip[0] - 7.8, hip[1] - 3.4, 15.8, 1.4);
    perna(f, false);
    // aturá nas costas, preso por alça na testa, com o jabuti
    at(sh[0] - 15, sh[1] + 12, 1, () => cestoJabuti(t, o), -.25);
    c.strokeStyle = '#8a6a3a'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(sh[0] - 9, sh[1] - 2); c.quadraticCurveTo(sh[0] - 2, sh[1] - 16, sh[0] + 6, sh[1] - 13.6); c.stroke();
    braco(f + PI, false);
    // cabeça de perfil com cabelo em cuia e colar de sementes
    at(sh[0] + 3.4, sh[1] - 8, 1, () => {
      c.fillStyle = pl.sombra; c.fillRect(-3, 2, 5, 6);
      c.fillStyle = lg(-6, 0, 7, 0, [[0, pl.sombra], [.6, pl.pele], [1, pl.luz]]); c.beginPath(); c.moveTo(-5.6, -3); c.bezierCurveTo(-6, -9, 0, -10.6, 3.6, -8.4); c.bezierCurveTo(5.6, -6.6, 5.4, -3.6, 5.6, -2.4); c.quadraticCurveTo(6.9, -.4, 6.4, .6); c.lineTo(5.4, .8); c.quadraticCurveTo(5.6, 2.2, 5.2, 2.8); c.quadraticCurveTo(4.6, 5.2, 2, 5.4); c.lineTo(-1.6, 3.6); c.bezierCurveTo(-4.6, 3.6, -6, 1.6, -5.6, -3); c.fill();
      ell(3.4, -2.8, .9, .5, 0, '#f0e6d6'); disc(3.8 + (o.olhar || 0), -2.8, .4, '#1a1008'); c.strokeStyle = '#1a1008'; c.lineWidth = .5; c.beginPath(); c.moveTo(2.2, -4); c.lineTo(5, -4.2); c.stroke();
      c.fillStyle = 'rgba(170,40,30,.55)'; c.fillRect(1.6, -1.4, 4, .9); // urucum no rosto
      c.fillStyle = '#0c0a0a'; c.beginPath(); c.moveTo(-6.2, -1); c.bezierCurveTo(-7, -10, 1, -11.6, 4.8, -8.6); c.quadraticCurveTo(5.8, -6.6, 5.4, -4.8); c.lineTo(1, -5.2); c.lineTo(-1.6, -4.4); c.lineTo(-2.6, -.6); c.closePath(); c.fill();
      c.fillStyle = 'rgba(140,160,190,.25)'; c.beginPath(); c.ellipse(0, -8.2, 4, 1.2, -.2, PI, TAU); c.fill();
      for (let k = 0; k < 7; k++) disc(-2 + k * 1.1, 6.6 + sin(k * .7) * .8, .55, k % 2 ? '#c8382a' : '#e8d8b0');
    });
  });
}
function cestoJabuti(t, o = {}) { // aturá de fibra trançada (cone) com jabuti dentro, cabeça para fora
  c.save();
  c.fillStyle = lg(-8, 0, 8, 0, [[0, '#6a4a22'], [.5, '#b08a4a'], [1, '#7a5a2a']]); c.beginPath(); c.moveTo(-8, -10); c.lineTo(8, -10); c.lineTo(5, 14); c.quadraticCurveTo(0, 16, -5, 14); c.closePath(); c.fill();
  c.save(); c.beginPath(); c.moveTo(-8, -10); c.lineTo(8, -10); c.lineTo(5, 14); c.quadraticCurveTo(0, 16, -5, 14); c.closePath(); c.clip();
  c.strokeStyle = 'rgba(60,40,15,.6)'; c.lineWidth = .45; for (let k = -20; k < 20; k += 2) { c.beginPath(); c.moveTo(k, -10); c.lineTo(k + 12, 16); c.moveTo(k + 12, -10); c.lineTo(k, 16); c.stroke() }
  c.restore();
  c.fillStyle = '#8a6a32'; c.fillRect(-8.6, -11, 17.2, 2.2);
  // jabuti: casco com placas (escudos) e cabeça/pata para fora
  const sp = sin(t * 2) * .6;
  c.fillStyle = '#6a5a3a'; c.beginPath(); c.ellipse(6.8 + sp * .3, -12.6, 2.3, 1.5, -.4, 0, TAU); c.fill(); disc(7.8 + sp * .3, -13.2, .35, '#0a0a0a'); ell(6.2, -11.4, 1.4, .9, 0, '#c8642a');
  c.fillStyle = lg(0, -19, 0, -10, [[0, '#4a3a22'], [1, '#22180c']]); c.beginPath(); c.ellipse(0, -11, 7.4, 6.6, 0, PI, TAU); c.fill();
  c.strokeStyle = '#1a1208'; c.lineWidth = .4; for (const [cx, cy, r] of [[0, -14.6, 2.1], [-3.8, -12.8, 1.8], [3.8, -12.8, 1.8], [-1.9, -16.6, 1.5], [1.9, -16.6, 1.5]]) { c.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + PI / 6; c[k ? 'lineTo' : 'moveTo'](cx + cos(a) * r, cy + sin(a) * r * .8) } c.closePath(); c.fillStyle = '#c89a3a'; c.globalAlpha = .55; c.fill(); c.globalAlpha = 1; c.stroke() }
  c.restore();
}
// seringueiro/morador genérico (de frente), para cenas de procura e do barracão
function seringueiro(x, y, h, t, o = {}) {
  at(x, y, h / 100, () => {
    const roupa = o.roupa || '#7a6a50', pele = o.pele || '#a8704a', s = o.anda ? sin(t * 6 + (o.ph || 0)) : 0;
    for (const k of [-1, 1]) { c.fillStyle = k < 0 ? '#2a2620' : '#3a342a'; c.beginPath(); c.moveTo(k, -46); c.lineTo(k * 11, -46); c.lineTo(k * 9 + k * s * 2, -2); c.lineTo(k * 3 + k * s * 2, -2); c.fill(); ell(k * 6 + k * s * 2, -1.5, 5, 2, 0, '#141414') }
    c.fillStyle = lg(-14, 0, 14, 0, [[0, shadeHex(roupa, .75)], [1, roupa]]); c.beginPath(); c.moveTo(-12, -46); c.quadraticCurveTo(-15, -70, -12, -80); c.lineTo(12, -80); c.quadraticCurveTo(15, -70, 12, -46); c.fill();
    for (const k of [-1, 1]) { seg(k * 13, -78, k * 16, -60, 6, 5, shadeHex(roupa, k < 0 ? .75 : .9)); seg(k * 16, -60, k * 15 + (o.facao && k > 0 ? 6 : 0), -46, 5, 4, pele) }
    if (o.facao) { c.save(); c.translate(21, -46); c.rotate(.6); c.fillStyle = '#b8bcc0'; c.beginPath(); c.moveTo(0, 0); c.lineTo(26, -1); c.quadraticCurveTo(28, 1, 25, 2.6); c.lineTo(0, 2); c.fill(); c.fillStyle = '#3a2412'; c.fillRect(-7, -.4, 7, 3); c.restore() }
    if (o.lampiao) { const lx2 = -17, ly = -44; line(lx2, ly - 6, lx2, ly, '#3a3a3a', .6); c.fillStyle = '#3a3226'; c.fillRect(lx2 - 3, ly, 6, 1.2); add(() => glow(lx2, ly + 4, 60, '255,170,80', .5)); ell(lx2, ly + 4, 2.4, 3.2, 0, '#ffd890'); c.fillStyle = '#3a3226'; c.fillRect(lx2 - 3, ly + 7, 6, 1.2) }
    c.fillStyle = shadeHex(pele, .8); c.fillRect(-3, -85, 6, 6);
    ell(0, -91, 6, 7.4, 0, pele); c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(2, -91, 4, 7, 0, -PI / 2, PI / 2); c.fill();
    c.fillStyle = o.chapeu || '#c8b070'; c.beginPath(); c.ellipse(0, -96, 11, 2.2, 0, 0, TAU); c.fill(); c.beginPath(); c.ellipse(0, -97, 6, 4.6, 0, PI, TAU); c.fill(); c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(-6, -97.6, 12, 1.2);
  });
}
