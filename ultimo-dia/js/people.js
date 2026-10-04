/* Último Dia — pessoas e zumbis: aparência (roupa, cabelo, pele, chapéu) e desenho em pé na visão isométrica,
   com pernas de dois segmentos, braços com cotovelo, rosto, armas na mão, rasgos e sangue nos zumbis. */
'use strict';

const SKINS = ['#e4b892', '#d9a77a', '#c28a5e', '#a8754a', '#7a5032', '#5e3c26', '#f0cfb0'];
const ZSKINS = ['#8f9a80', '#9aa08a', '#7f8a72', '#a59f8a', '#8a9382'];
const HAIRS = ['#2a1d14', '#4a3020', '#6e4a2a', '#b89a60', '#141414', '#7a4a2a', '#8a8a86', '#c8c0b0'];
const SHIRTS = ['#6a4a4a', '#4a5a6e', '#5e6a4a', '#7a6a4e', '#3e3e44', '#8a7a6a', '#5a4a62', '#2e4a5a', '#7a3a32', '#a09a8a', '#466048'];
const PANTS = ['#3d4a5e', '#2f3540', '#8a7d5e', '#2a2a2c', '#55554f', '#4a3e30'];
const SHIRT_TYPES = ['camiseta', 'camiseta', 'xadrez', 'moletom', 'jaqueta', 'regata'];
const HAIR_STYLES = ['curto', 'curto', 'longo', 'careca', 'rabo', 'curto', 'bone'];
const PROF_LOOK = {
  policial: { shirt: '#2f3f5a', type: 'uniforme', pants: '#22283a', hat: 'quepe', hair: 'curto' },
  carpinteiro: { shirt: '#8a3a2e', type: 'xadrez', pants: '#3d4a5e', belt: '#6a4a2a', hair: 'curto' },
  mecanico: { shirt: '#3a5068', type: 'macacao', pants: '#3a5068', hair: 'curto', hat: 'bone', hatCol: '#7a2a24' },
  enfermeira: { shirt: '#5a8f88', type: 'jaleco', pants: '#5a8f88', hair: 'rabo' },
  agricultor: { shirt: '#4a6a8a', type: 'xadrez', pants: '#3d4a5e', hat: 'chapeu', hair: 'curto' },
  escoteiro: { shirt: '#7a7450', type: 'camiseta', pants: '#5a5440', hat: 'bone', hatCol: '#4a5a3a', hair: 'curto' },
  desempregado: { shirt: '#6a5a6a', type: 'moletom', pants: '#3d4a5e', hair: 'longo' },
};
const looks = new WeakMap();
// aparência estável por entidade (não vai para o save: é sempre recalculada da mesma semente)
function lookOf(e, kind) {
  let L = looks.get(e);
  if (L) return L;
  const seed = kind === 'player' ? 7 : (e.seed != null ? e.seed * 7 + 3 : e.id * 13 + 5);
  const r = mulberry(seed + 99);
  const pk = (a) => a[Math.floor(r() * a.length)];
  L = { skin: pk(SKINS), hairCol: pk(HAIRS), hair: pk(HAIR_STYLES), shirt: pk(SHIRTS), type: pk(SHIRT_TYPES), pants: pk(PANTS), shoes: r() < 0.5 ? '#1e1c1a' : '#4a3a2a', build: 0.92 + r() * 0.2, hat: null };
  if (L.hair === 'bone') { L.hair = 'curto'; L.hat = 'bone'; L.hatCol = pk(['#7a2a24', '#2a3a5a', '#3a4a2a', '#2a2a2a']); }
  if (kind === 'player') Object.assign(L, PROF_LOOK[e.prof] || {}, { skin: '#e0b08a', hairCol: '#2a1d14', build: 1 });
  if (kind === 'npc') {
    if (e.kind === 'bandido') Object.assign(L, { type: 'jaqueta', shirt: '#2a2626', pants: '#2a2a2c', mask: '#8a2a24' });
    if (e.kind === 'comerciante') Object.assign(L, { type: 'jaqueta', shirt: '#6a5038', pack: '#5a4a32' });
    if (e.kind === 'solitario') L.type = 'moletom';
  }
  if (kind === 'zombie') {
    const zt = e.t;
    L.skin = zt === 'recente' ? mixc(pk(SKINS), '#9aa08a', 0.35) : pk(ZSKINS);
    L.shirt = e.shirt || L.shirt; L.torn = 0.4 + r() * 0.6; L.blood = 0.3 + r() * 0.7;
    L.limp = r() < 0.5 ? 0.3 + r() * 0.5 : 0; L.tilt = (r() - 0.5) * 0.5; L.dangle = r() < 0.25 ? (r() < 0.5 ? -1 : 1) : 0;
    if (zt === 'brutamontes') { L.build = 1.45; L.type = 'regata'; L.hair = 'careca'; L.hat = null; }
    if (zt === 'corredor') { L.build = 0.84; L.lean = 1; }
    if (r() < 0.3) L.hair = 'careca';
    L.hat = r() < 0.15 ? L.hat : null;
  }
  looks.set(e, L);
  return L;
}

// visual do jogador com as roupas vestidas por cima do uniforme da profissão
function playerLook(p) {
  const L = Object.assign({}, lookOf(p, 'player')), e = p.eq;
  if (e.tronco && e.tronco.k === 'jaqueta') Object.assign(L, { type: 'jaqueta', shirt: '#5a3a24' });
  if (e.tronco && e.tronco.k === 'moletom') Object.assign(L, { type: 'moletom', shirt: '#5a5a62' });
  if (e.capa) Object.assign(L, { type: 'jaqueta', shirt: '#c8a832' });
  if (e.colete) L.vest = '#2a3038';
  if (e.costas) L.pack = e.costas.k === 'mochila_grande' ? '#3e4a30' : '#4a5a3a';
  if (p.hitT > 0) L.shirt = mixc(L.shirt, '#c02a20', 0.55), L.skin = mixc(L.skin, '#e05040', 0.3);
  return L;
}

/* ---------- armas na mão (em pixels de escala 1, apontando para +x) ---------- */
const WEAPON_ART = {
  faca: (g, s) => { g.fillStyle = '#3a2a1e'; g.fillRect(-2 * s, -1.2 * s, 5 * s, 2.4 * s); g.fillStyle = '#c8ccd0'; g.beginPath(); g.moveTo(3 * s, -1.4 * s); g.lineTo(11 * s, 0); g.lineTo(3 * s, 1.4 * s); g.fill(); },
  faca_cozinha: (g, s) => WEAPON_ART.faca(g, s),
  taco: (g, s) => { g.strokeStyle = '#a8784a'; g.lineCap = 'round'; g.lineWidth = 2.2 * s; g.beginPath(); g.moveTo(-3 * s, 0); g.lineTo(6 * s, 0); g.stroke(); g.lineWidth = 3.8 * s; g.beginPath(); g.moveTo(6 * s, 0); g.lineTo(19 * s, 0); g.stroke(); },
  pe_cabra: (g, s) => { g.strokeStyle = '#8a2a24'; g.lineCap = 'round'; g.lineWidth = 2 * s; g.beginPath(); g.moveTo(-3 * s, 0); g.lineTo(16 * s, 0); g.quadraticCurveTo(19 * s, 0, 19 * s, 3 * s); g.stroke(); },
  martelo: (g, s) => { g.strokeStyle = '#8a6a44'; g.lineCap = 'round'; g.lineWidth = 2 * s; g.beginPath(); g.moveTo(-2 * s, 0); g.lineTo(11 * s, 0); g.stroke(); g.fillStyle = '#4a4e52'; g.fillRect(10 * s, -4 * s, 3.5 * s, 8 * s); },
  facao: (g, s) => { g.fillStyle = '#2a2a2a'; g.fillRect(-2 * s, -1.3 * s, 5 * s, 2.6 * s); g.fillStyle = '#b8bcc0'; g.beginPath(); g.moveTo(3 * s, -1.6 * s); g.lineTo(17 * s, -2.2 * s); g.lineTo(19 * s, 0); g.lineTo(3 * s, 1.6 * s); g.fill(); },
  machado: (g, s) => { g.strokeStyle = '#8a6a44'; g.lineCap = 'round'; g.lineWidth = 2.2 * s; g.beginPath(); g.moveTo(-3 * s, 0); g.lineTo(16 * s, 0); g.stroke(); g.fillStyle = '#5a5e62'; g.beginPath(); g.moveTo(12 * s, -1 * s); g.lineTo(18 * s, -6 * s); g.lineTo(19 * s, 2 * s); g.lineTo(13 * s, 2 * s); g.fill(); g.fillStyle = '#c8ccd0'; g.fillRect(17.5 * s, -5.5 * s, 1.5 * s, 7 * s); },
  lanca: (g, s) => { g.strokeStyle = '#9a7a4a'; g.lineCap = 'round'; g.lineWidth = 1.8 * s; g.beginPath(); g.moveTo(-6 * s, 0); g.lineTo(22 * s, 0); g.stroke(); g.fillStyle = '#b8bcc0'; g.beginPath(); g.moveTo(22 * s, -1.5 * s); g.lineTo(27 * s, 0); g.lineTo(22 * s, 1.5 * s); g.fill(); },
  pa: (g, s) => { g.strokeStyle = '#8a6a44'; g.lineCap = 'round'; g.lineWidth = 2 * s; g.beginPath(); g.moveTo(-3 * s, 0); g.lineTo(15 * s, 0); g.stroke(); g.fillStyle = '#6a6e72'; g.beginPath(); g.ellipse(18 * s, 0, 4 * s, 3 * s, 0, 0, 7); g.fill(); },
  chave_inglesa: (g, s) => { g.strokeStyle = '#8a9096'; g.lineCap = 'round'; g.lineWidth = 2.4 * s; g.beginPath(); g.moveTo(-2 * s, 0); g.lineTo(11 * s, 0); g.stroke(); g.lineWidth = 2 * s; g.beginPath(); g.arc(13 * s, 0, 2.6 * s, 0.6, 5.7); g.stroke(); },
  pistola: (g, s) => { g.fillStyle = '#1c1d1f'; g.fillRect(-1 * s, -1.5 * s, 10 * s, 3 * s); g.fillRect(-1 * s, -1 * s, 3 * s, 5 * s); },
  revolver: (g, s) => { g.fillStyle = '#2a2b2e'; g.fillRect(0, -1.3 * s, 11 * s, 2.6 * s); g.beginPath(); g.arc(2 * s, 0, 2.4 * s, 0, 7); g.fill(); g.fillStyle = '#5a3a2a'; g.fillRect(-2 * s, -1 * s, 3 * s, 5 * s); },
  espingarda: (g, s) => { g.fillStyle = '#5a3a24'; g.fillRect(-9 * s, -1.6 * s, 9 * s, 3.4 * s); g.fillStyle = '#26272a'; g.fillRect(0, -1.2 * s, 18 * s, 2.4 * s); g.fillStyle = '#4a3020'; g.fillRect(6 * s, -1.6 * s, 6 * s, 3.2 * s); },
  smg: (g, s) => { g.fillStyle = '#1e1f21'; g.fillRect(-4 * s, -1.8 * s, 15 * s, 3.6 * s); g.fillRect(2 * s, 1 * s, 2.4 * s, 6 * s); g.fillRect(-4 * s, 0, 2.5 * s, 4 * s); },
  rifle: (g, s) => { g.fillStyle = '#6a4a2c'; g.fillRect(-10 * s, -1.6 * s, 12 * s, 3.4 * s); g.fillStyle = '#26272a'; g.fillRect(2 * s, -1 * s, 19 * s, 2 * s); g.fillStyle = '#1a1a1a'; g.fillRect(2 * s, -3.4 * s, 7 * s, 2 * s); },
  molotov: (g, s) => { g.fillStyle = '#5a8a6a'; g.fillRect(0, -2.5 * s, 7 * s, 5 * s); g.fillRect(7 * s, -1 * s, 3 * s, 2 * s); g.fillStyle = '#e0d0b0'; g.fillRect(10 * s, -1.4 * s, 2.5 * s, 2.8 * s); },
};
const TWO_HANDED = new Set(['espingarda', 'rifle', 'smg', 'machado', 'pa', 'lanca']);

/* ---------- desenho ---------- */
// gradientes reaproveitados por aparência (as coordenadas são relativas ao boneco)
function gcache(L, key, make) {
  const c = L._gc || (L._gc = new Map());
  let v = c.get(key);
  if (!v) { if (c.size > 24) c.clear(); v = make(); c.set(key, v); }
  return v;
}
function limb(g, ax, ay, bx, by, cx, cy, w, col) {
  g.strokeStyle = 'rgba(18,14,10,.62)'; g.lineWidth = w + 1.5 * K; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.lineTo(cx, cy); g.stroke(); // contorno
  g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.lineTo(cx, cy); g.stroke(); }
function drawPerson(x, y, z, a, o) {
  const L = o.look, s = K * 1.1 * (o.scale || 1), zb = !!o.zombie;
  const fx = Math.cos(a) - Math.sin(a), fy = (Math.cos(a) + Math.sin(a)) / 2, fl = Math.hypot(fx, fy) || 1, dx = fx / fl, dy = fy / fl;
  const front = dy > -0.2, prof = Math.abs(dx); // de frente / de perfil
  const g = ctx;
  g.save(); g.translate(PX(x, y), PY(x, y, z));
  g.lineCap = 'round'; g.lineJoin = 'round';
  // sombra
  g.fillStyle = 'rgba(0,0,0,.34)'; g.beginPath(); g.ellipse(1 * s, 0.5 * s, 12 * s * L.build, 5.5 * s, 0, 0, 7); g.fill();
  if (o.down) { drawLying(g, L, s, dx, zb); g.restore(); return; }
  const amp = clamp(o.amp == null ? 1 : o.amp, 0, 1.15), ph = o.t || 0;
  const bw = 8 * s * L.build * (1 - 0.32 * prof); // meia largura dos ombros
  const lean = (L.lean ? 1 : 0) + (o.lunge || 0) * 1.2;
  const bob = Math.abs(Math.cos(ph)) * amp * 1.6 * s;
  // --- pernas (a de trás primeiro, mais escura) ---
  const hipY = -27 * s, legX = 3.6 * s * L.build * (1 - 0.45 * prof);
  const legs = [-1, 1].map((sg) => {
    const limp = L.limp && sg === 1 ? 1 - L.limp : 1;
    const st = Math.sin(ph) * sg * amp * limp;
    const fxo = st * dx * 7 * s, fyo = st * dy * 3.5 * s;
    const footX = sg * legX + fxo, footY = -2 * s + fyo;
    const lift = Math.max(0, -Math.cos(ph) * sg) * amp * 2.5 * s; // pé de trás levanta
    const kneeX = sg * legX * 0.95 + fxo * 0.5 + dx * 1.5 * s, kneeY = -14 * s + fyo * 0.5 - lift;
    return { sg, footX, footY: footY - lift, kneeX, kneeY, depth: fyo };
  }).sort((p, q) => p.depth - q.depth);
  for (const lg of legs) {
    const back = lg === legs[0];
    limb(g, lg.sg * legX * 0.9, hipY + bob * 0.3, lg.kneeX, lg.kneeY, lg.footX, lg.footY, 5.6 * s * Math.sqrt(L.build), back ? shade(L.pants, -0.25) : L.pants);
    g.fillStyle = back ? shade(L.shoes, -0.2) : L.shoes;
    g.beginPath(); g.ellipse(lg.footX + dx * 1.8 * s, lg.footY + 0.5 * s, (3.4 + prof * 1.2) * s, 2.2 * s, 0, 0, 7); g.fill();
    if (zb && L.torn > 0.6 && lg.sg === 1) { g.fillStyle = L.skin; g.fillRect(lg.kneeX - 1.5 * s, lg.kneeY - 2 * s, 3 * s, 4 * s); }
  }
  // corpo sobe e desce; inclinação para frente (corredor e investida)
  g.translate(dx * lean * 3 * s, -bob + dy * lean * 1.5 * s);
  const shY = -49 * s, waistY = -27 * s;
  // --- braços ---
  const wk = o.wk, atk = o.atk || 0;
  const armPos = (sg) => {
    const shx = sg * bw, shy = shY + 2 * s;
    let ex, ey, hx, hy;
    if (zb && L.dangle !== sg) { // braços estendidos para a frente
      const reach = 1 + (o.lunge || 0) * 0.6, droop = Math.sin(ph * 0.5 + sg) * 1.5 * s;
      ex = shx * 0.8 + dx * 8 * s * reach; ey = shy + 2 * s + dy * 4 * s * reach + droop;
      hx = shx * 0.55 + dx * 17 * s * reach; hy = shy + 3 * s + dy * 8.5 * s * reach + droop;
    } else if (!zb && wk && TWO_HANDED.has(wk)) { // arma de duas mãos: as duas mãos à frente
      ex = shx * 0.8 + dx * 5 * s; ey = shy + 9 * s + dy * 3 * s;
      hx = dx * (sg === 1 ? 12 : 5) * s + sg * 2 * s; hy = -36 * s + dy * (sg === 1 ? 6 : 3) * s;
    } else if (!zb && sg === 1 && (atk > 0 || (wk && ITEMS[wk] && ITEMS[wk].wp && ITEMS[wk].wp.gun))) {
      const k = atk > 0 ? Math.sin((1 - atk / 0.22) * Math.PI) : 0.6; // golpe ou mira
      ex = shx + dx * (4 + k * 6) * s; ey = shy + 7 * s + dy * (2 + k * 3) * s - k * 4 * s;
      hx = shx * 0.6 + dx * (8 + k * 11) * s; hy = shy + 11 * s + dy * (4 + k * 6) * s - k * 9 * s;
    } else { // balanço ao andar
      const st = -Math.sin(ph) * sg * amp;
      ex = shx * 1.08 + st * dx * 3 * s; ey = shy + 10 * s + st * dy * 1.5 * s;
      hx = shx * 1.02 + st * dx * 6 * s; hy = shy + 20 * s + st * dy * 3 * s;
    }
    return { sg, shx, shy, ex, ey, hx, hy };
  };
  const sleeve = L.type === 'regata' ? L.skin : L.type === 'camiseta' || L.type === 'jaleco' ? 'short' : L.shirt;
  const drawArm = (A, far) => {
    const up = sleeve === 'short' || sleeve === L.skin ? L.shirt : sleeve;
    const lw = 4.4 * s * Math.sqrt(L.build);
    if (sleeve === L.skin) limb(g, A.shx, A.shy, A.ex, A.ey, A.hx, A.hy, lw, far ? shade(L.skin, -0.2) : L.skin);
    else if (sleeve === 'short') { limb(g, A.shx, A.shy, A.ex, A.ey, A.hx, A.hy, lw * 0.92, far ? shade(L.skin, -0.2) : L.skin); g.strokeStyle = far ? shade(up, -0.25) : up; g.lineWidth = lw * 1.12; g.beginPath(); g.moveTo(A.shx, A.shy); g.lineTo(lerp(A.shx, A.ex, 0.55), lerp(A.shy, A.ey, 0.55)); g.stroke(); }
    else limb(g, A.shx, A.shy, A.ex, A.ey, A.hx, A.hy, lw * 1.05, far ? shade(up, -0.25) : up);
    if (zb && L.blood > 0.6 && A.sg === -1) { g.strokeStyle = 'rgba(100,14,10,.7)'; g.lineWidth = lw * 0.9; g.beginPath(); g.moveTo(lerp(A.ex, A.hx, 0.4), lerp(A.ey, A.hy, 0.4)); g.lineTo(A.hx, A.hy); g.stroke(); }
    g.fillStyle = far ? shade(L.skin, -0.2) : L.skin; g.beginPath(); g.arc(A.hx, A.hy, 2.7 * s, 0, 7); g.fill(); g.strokeStyle = 'rgba(18,14,10,.5)'; g.lineWidth = 0.9 * K; g.stroke();
  };
  const arms = [armPos(-1), armPos(1)];
  // o braço do lado para onde ele olha fica atrás do corpo quando está de perfil ou de costas
  const farSg = !front ? 0 : prof > 0.45 ? Math.sign(dx) : 0;
  if (!front) for (const A of arms) drawArm(A, true);
  else for (const A of arms) if (A.sg === farSg) drawArm(A, true);
  const weapon = () => {
    if (!wk || zb || !WEAPON_ART[wk]) return;
    const A = arms[1];
    let ang = Math.atan2(dy * 0.5 + 0.12, dx);
    if (!TWO_HANDED.has(wk) && !(ITEMS[wk].wp && ITEMS[wk].wp.gun) && !atk) ang = Math.atan2(0.9, dx * 0.4); // arma branca descansando
    if (atk > 0 && !(ITEMS[wk].wp && ITEMS[wk].wp.gun)) ang += (1 - atk / 0.22) * 2.2 - 1.6;
    g.save(); g.translate(A.hx, A.hy); g.rotate(ang); WEAPON_ART[wk](g, s); g.restore();
  };
  if (!front) weapon();
  // mochila atrás
  if (L.pack && front) { g.fillStyle = shade(L.pack, -0.2); rr(g, -bw * 0.8, shY - 1 * s, bw * 1.6, 19 * s, 3 * s); g.fill(); }
  // --- tronco ---
  const waistW = bw * (L.build > 1.3 ? 1.05 : 0.78);
  const torso = () => { g.beginPath(); g.moveTo(-bw, shY + 2 * s); g.quadraticCurveTo(-bw, shY - 2 * s, -bw * 0.6, shY - 2 * s); g.lineTo(bw * 0.6, shY - 2 * s); g.quadraticCurveTo(bw, shY - 2 * s, bw, shY + 2 * s); g.lineTo(waistW, waistY); g.lineTo(-waistW, waistY); g.closePath(); };
  const gr = gcache(L, 't' + L.shirt + bw.toFixed(1), () => { const q = g.createLinearGradient(-bw, 0, bw, 0); q.addColorStop(0, shade(L.shirt, 0.14)); q.addColorStop(0.6, L.shirt); q.addColorStop(1, shade(L.shirt, -0.28)); return q; });
  torso(); g.fillStyle = gr; g.fill(); g.strokeStyle = 'rgba(18,14,10,.62)'; g.lineWidth = 1.5 * K; g.stroke();
  if (L.build > 1.3) { g.fillStyle = shade(L.shirt, -0.1); g.beginPath(); g.ellipse(dx * 2 * s, -34 * s, waistW * 0.9, 7 * s, 0, 0, 7); g.fill(); } // barriga
  g.save(); torso(); g.clip();
  if (L.type === 'xadrez') { g.strokeStyle = shade(L.shirt, -0.35); g.lineWidth = 1.2 * s; g.beginPath(); for (let k = -10; k <= 10; k += 4) { g.moveTo(k * s, shY - 3 * s); g.lineTo(k * s, waistY); } for (let k = shY; k < waistY; k += 4 * s) { g.moveTo(-bw, k); g.lineTo(bw, k); } g.stroke(); }
  if (L.type === 'jaqueta' && front) { g.fillStyle = shade(L.shirt, -0.3); g.fillRect(-1 * s + dx * 2 * s, shY, 2 * s, waistY - shY); g.fillStyle = '#d8d0c0'; g.fillRect(-2.5 * s + dx * 2 * s, shY - 1 * s, 5 * s, 6 * s); }
  if (L.type === 'moletom') { g.fillStyle = shade(L.shirt, -0.2); if (front) g.fillRect(-bw * 0.55, -36 * s, bw * 1.1, 6 * s); else { g.beginPath(); g.ellipse(0, shY + 2 * s, bw * 0.7, 5 * s, 0, 0, 7); g.fill(); } }
  if (L.type === 'uniforme' && front) { g.fillStyle = '#d8b84a'; g.beginPath(); g.arc(-bw * 0.45 + dx * 2 * s, shY + 6 * s, 1.6 * s, 0, 7); g.fill(); g.fillStyle = shade(L.shirt, -0.25); g.fillRect(-bw, shY + 1 * s, bw * 2, 1.4 * s); }
  if (L.type === 'macacao' && front) { g.strokeStyle = shade(L.shirt, -0.3); g.lineWidth = 1.6 * s; g.beginPath(); g.moveTo(-bw * 0.45, shY - 1 * s); g.lineTo(-bw * 0.35, -36 * s); g.moveTo(bw * 0.45, shY - 1 * s); g.lineTo(bw * 0.35, -36 * s); g.stroke(); g.fillStyle = shade(L.shirt, 0.08); g.fillRect(-bw * 0.4, -38 * s, bw * 0.8, 6 * s); }
  if (L.type === 'jaleco' && front) { g.fillStyle = shade(L.shirt, -0.25); g.beginPath(); g.moveTo(-3 * s + dx * 2 * s, shY - 2 * s); g.lineTo(dx * 2 * s, shY + 5 * s); g.lineTo(3 * s + dx * 2 * s, shY - 2 * s); g.fill(); }
  if (L.type === 'regata') { g.fillStyle = L.skin; g.beginPath(); g.ellipse(-bw * 0.85, shY + 2 * s, 3 * s, 5 * s, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(bw * 0.85, shY + 2 * s, 3 * s, 5 * s, 0, 0, 7); g.fill(); }
  if (zb) { // rasgos e sangue
    const rnd2 = mulberry(Math.floor(L.torn * 1000) + 3);
    for (let k = 0; k < 2 + L.torn * 3; k++) {
      const tx = (rnd2() - 0.5) * bw * 1.6, ty = shY + rnd2() * (waistY - shY);
      g.fillStyle = k % 2 ? L.skin : 'rgba(20,16,12,.55)';
      g.beginPath(); g.moveTo(tx, ty); g.lineTo(tx + 3 * s, ty + 1 * s); g.lineTo(tx + 1 * s, ty + 4 * s); g.lineTo(tx - 2 * s, ty + 2.5 * s); g.closePath(); g.fill();
    }
    g.fillStyle = `rgba(105,14,10,${0.35 + L.blood * 0.4})`;
    g.beginPath(); g.ellipse(dx * 2 * s, shY + 4 * s, bw * 0.55, 6 * s * L.blood, 0, 0, 7); g.fill();
    g.fillRect(dx * 2 * s - 1 * s, shY + 6 * s, 2 * s, 9 * s * L.blood);
  }
  if (L.vest) { g.fillStyle = L.vest; rr(g, -bw * 0.82, shY + 1 * s, bw * 1.64, (waistY - shY) - 3 * s, 2.5 * s); g.fill(); g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(-bw * 0.82, shY + 9 * s, bw * 1.64, 1.2 * s); if (front) { g.fillStyle = '#d8d0b0'; g.fillRect(-3 * s + dx * 2 * s, shY + 4 * s, 6 * s, 2 * s); } }
  g.restore();
  // cinto
  g.fillStyle = L.belt || 'rgba(20,18,16,.6)'; g.fillRect(-waistW, waistY - 2.4 * s, waistW * 2, 2.6 * s);
  if (L.pack && !front) { g.fillStyle = L.pack; rr(g, -bw * 0.75, shY - 1 * s, bw * 1.5, 20 * s, 3 * s); g.fill(); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(-bw * 0.75, shY + 8 * s, bw * 1.5, 2 * s); }
  if (front) for (const A of arms) if (A.sg !== farSg) drawArm(A, false);
  if (front) weapon();
  // --- pescoço e cabeça ---
  const tilt = L.tilt || 0;
  const hx = dx * 1.8 * s + tilt * 4 * s, hy = -60 * s;
  g.fillStyle = shade(L.skin, -0.15); g.fillRect(-2.6 * s + dx * s, shY - 5 * s, 5.2 * s, 5 * s);
  g.save(); g.translate(hx, hy); g.rotate(tilt * 0.6);
  const hr = 7.2 * s;
  const hg = gcache(L, 'h' + L.skin + hr.toFixed(1), () => { const q = g.createRadialGradient(-2.5 * s, -2.5 * s, 1, 0, 0, hr); q.addColorStop(0, shade(L.skin, 0.12)); q.addColorStop(1, shade(L.skin, -0.15)); return q; });
  g.fillStyle = hg; g.beginPath(); g.ellipse(0, 0, hr * (1 - 0.06 * prof), hr * 1.05, 0, 0, 7); g.fill();
  g.strokeStyle = 'rgba(18,14,10,.6)'; g.lineWidth = 1.5 * K; g.stroke();
  // orelhas
  g.fillStyle = shade(L.skin, -0.1);
  if (prof < 0.7 || !front) { g.beginPath(); g.ellipse(-hr * 0.98, 0.8 * s, 1.6 * s, 2.4 * s, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(hr * 0.98, 0.8 * s, 1.6 * s, 2.4 * s, 0, 0, 7); g.fill(); }
  else { g.beginPath(); g.ellipse(-dx * 2.5 * s, 0.8 * s, 1.6 * s, 2.4 * s, 0, 0, 7); g.fill(); }
  // rosto
  if (front) {
    const ex = dx * 3 * s;
    if (zb) {
      g.fillStyle = 'rgba(40,20,20,.8)'; g.beginPath(); g.ellipse(ex - 2.8 * s, -0.5 * s, 1.7 * s, 1.4 * s, 0, 0, 7); g.ellipse(ex + 2.8 * s, -0.5 * s, 1.7 * s, 1.4 * s, 0, 0, 7); g.fill();
      g.fillStyle = o.eyes || '#d8d8b0'; g.fillRect(ex - 3.2 * s, -0.9 * s, 1 * s, 1 * s); g.fillRect(ex + 2.4 * s, -0.9 * s, 1 * s, 1 * s);
      g.fillStyle = '#3a0c0a'; g.beginPath(); g.ellipse(ex, 3.8 * s, 2.2 * s, 1.5 * s + (o.lunge || 0) * 1.2 * s, 0, 0, 7); g.fill();
      g.fillStyle = 'rgba(110,14,10,.75)'; g.fillRect(ex - 1 * s, 4.5 * s, 2 * s, 4 * s * L.blood);
    } else {
      g.fillStyle = '#2a2018'; g.fillRect(ex - 3.4 * s, -1 * s, 1.6 * s, 1.8 * s); g.fillRect(ex + 1.8 * s, -1 * s, 1.6 * s, 1.8 * s);
      g.fillStyle = shade(L.hairCol, 0.05); g.fillRect(ex - 3.8 * s, -3 * s, 2.4 * s, 0.9 * s); g.fillRect(ex + 1.4 * s, -3 * s, 2.4 * s, 0.9 * s);
      g.fillStyle = shade(L.skin, -0.22); g.fillRect(ex + dx * 1.5 * s - 0.6 * s, 0.5 * s, 1.2 * s, 2.4 * s);
      g.fillStyle = '#7a4a3a'; g.fillRect(ex - 1.6 * s, 4 * s, 3.2 * s, 0.9 * s);
      if (L.mask) { g.fillStyle = L.mask; g.beginPath(); g.moveTo(-hr, 1 * s); g.lineTo(hr, 1 * s); g.lineTo(dx * 2 * s, hr * 1.05); g.closePath(); g.fill(); }
    }
  }
  // cabelo
  g.fillStyle = L.hairCol;
  if (L.hair !== 'careca') {
    g.beginPath();
    if (front) g.ellipse(0, -2.6 * s, hr * 1.02, hr * 0.68, 0, Math.PI, Math.PI * 2);
    else g.ellipse(0, -0.5 * s, hr * 1.03, hr * 1.02, 0, Math.PI * 0.95, Math.PI * 2.05);
    g.fill();
    if (front) { g.beginPath(); g.ellipse(-dx * 2 * s, -3 * s, hr * 0.85, hr * 0.45, 0, 0, 7); g.fill(); }
    if (L.hair === 'longo') { g.fillRect(-hr * 1.02, -1 * s, hr * 0.45, hr * 1.4); g.fillRect(hr * 0.57, -1 * s, hr * 0.45, hr * 1.4); if (!front) g.fillRect(-hr, 0, hr * 2, hr * 1.4); }
    if (L.hair === 'rabo' && !front) { g.beginPath(); g.ellipse(0, hr * 0.9, 2.5 * s, 5 * s, 0, 0, 7); g.fill(); }
    if (zb && L.torn > 0.75) { g.fillStyle = shade(L.skin, -0.1); g.beginPath(); g.arc(2 * s, -4 * s, 2.5 * s, 0, 7); g.fill(); }
  } else { g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.arc(-2 * s, -4 * s, 2.5 * s, 0, 7); g.fill(); }
  // chapéus
  if (L.hat === 'bone' || L.hat === 'quepe') {
    const hc = L.hat === 'quepe' ? '#1f2a3e' : L.hatCol;
    g.fillStyle = hc; g.beginPath(); g.ellipse(0, -3.5 * s, hr * 1.05, hr * 0.62, 0, Math.PI, Math.PI * 2); g.fill(); g.fillRect(-hr * 1.05, -4 * s, hr * 2.1, 1.6 * s);
    g.fillStyle = shade(hc, -0.25); g.beginPath(); g.ellipse(dx * hr * 0.9, -2.5 * s + dy * 1.5 * s, hr * (0.45 + prof * 0.35), hr * 0.25, 0, 0, 7); g.fill();
    if (L.hat === 'quepe') { g.fillStyle = '#d8b84a'; g.fillRect(-1 * s + dx * 2 * s, -6.5 * s, 2 * s, 2 * s); }
  } else if (L.hat === 'chapeu') {
    g.fillStyle = '#c8a860'; g.beginPath(); g.ellipse(0, -3 * s, hr * 1.7, hr * 0.5, 0, 0, 7); g.fill();
    g.fillStyle = '#b8984e'; g.beginPath(); g.ellipse(0, -5.5 * s, hr * 0.85, hr * 0.62, 0, Math.PI, Math.PI * 2); g.fill(); g.fillRect(-hr * 0.85, -6 * s, hr * 1.7, 2.6 * s);
    g.fillStyle = '#6a4a2a'; g.fillRect(-hr * 0.85, -4.2 * s, hr * 1.7, 1.2 * s);
  }
  if (o.helmet) { g.fillStyle = '#3a3e44'; g.beginPath(); g.ellipse(0, -1.5 * s, hr * 1.12, hr * 1.02, 0, Math.PI * 0.92, Math.PI * 2.08); g.fill(); }
  g.restore();
  g.restore();
}
// caído no chão (zumbi derrubado, jogador dormindo)
function drawLying(g, L, s, dx, zb) {
  const dir = dx >= 0 ? 1 : -1;
  g.save(); g.scale(dir, 1);
  g.strokeStyle = L.pants; g.lineWidth = 5 * s; g.beginPath(); g.moveTo(-6 * s, -3 * s); g.lineTo(-20 * s, -1 * s); g.moveTo(-6 * s, -5 * s); g.lineTo(-19 * s, -6 * s); g.stroke();
  g.fillStyle = L.shoes; g.beginPath(); g.ellipse(-21 * s, -1 * s, 2.5 * s, 2 * s, 0, 0, 7); g.ellipse(-20 * s, -6 * s, 2.5 * s, 2 * s, 0, 0, 7); g.fill();
  g.fillStyle = L.shirt; rr(g, -7 * s, -9 * s, 18 * s, 9 * s, 3 * s); g.fill();
  if (zb) { g.fillStyle = 'rgba(105,14,10,.55)'; g.beginPath(); g.ellipse(2 * s, -4 * s, 5 * s, 3 * s, 0, 0, 7); g.fill(); }
  g.strokeStyle = L.skin; g.lineWidth = 3.6 * s; g.beginPath(); g.moveTo(8 * s, -8 * s); g.lineTo(14 * s, -13 * s); g.stroke();
  g.fillStyle = L.skin; g.beginPath(); g.arc(15 * s, -5 * s, 5.8 * s, 0, 7); g.fill();
  if (L.hair !== 'careca') { g.fillStyle = L.hairCol; g.beginPath(); g.arc(16.5 * s, -5 * s, 5.8 * s, -1.2, 1.2); g.fill(); }
  g.restore();
}
