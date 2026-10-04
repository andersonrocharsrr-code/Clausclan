/* Último Dia — interface: HUD, painéis (mochila, saúde, construção, mapa, diálogos, troca, veículo) e telas. */
'use strict';

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmtKg = (w) => (w < 10 ? w.toFixed(1) : Math.round(w)) + ' kg';

const UI = {
  playing: false, acts: {}, aid: 0, cur: null, ctx: null,
  act(fn) { const id = 'a' + (++this.aid); this.acts[id] = fn; return id; },
  panelOpen() { return !$('#panel').hidden; },
};

/* ---------- avisos ---------- */
G.onSay = (msg, kind) => {
  const box = $('#toasts');
  const el = document.createElement('div');
  el.className = 'toast ' + (kind || ''); el.textContent = msg;
  box.prepend(el);
  while (box.children.length > 4) box.lastChild.remove();
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 400); }, kind === 'bad' ? 4200 : 3200);
};

/* ---------- painel genérico ---------- */
UI.open = function (title, html, opts = {}) {
  const p = $('#panel');
  $('#panelTitle').innerHTML = title;
  $('#panelTabs').innerHTML = opts.tabs ? opts.tabs.map((t) => `<button class="ptab ${t.on ? 'on' : ''}" data-a="${this.act(t.fn)}">${t.l}</button>`).join('') : '';
  $('#panelBody').innerHTML = typeof html === 'function' ? html() : html;
  p.hidden = false; p.className = 'panel ' + (opts.cls || '');
  this.cur = opts.redraw || null;
  G.paused = true; G.input.attack = false; G.input.mv = { x: 0, y: 0 };
};
UI.redraw = function () { if (this.cur && this.panelOpen()) this.cur(); };
UI.closePanel = function () {
  $('#panel').hidden = true; this.cur = null; G.paused = false; this.acts = {};
  if (this.onClose) { const f = this.onClose; this.onClose = null; f(); }
};
$('#panel').addEventListener('click', (e) => {
  const b = e.target.closest('[data-a]');
  if (b) { const f = UI.acts[b.dataset.a]; if (f) { sfx('ui'); f(b); } return; }
  if (e.target.closest('[data-close]') || e.target.classList.contains('panel__backdrop')) UI.closePanel();
});

/* ---------- HUD ---------- */
function moodles() {
  const p = S.player, m = [];
  const add = (i, l, lv, d) => m.push({ i, l, lv, d });
  if (p.hun < 40) add('🍽️', p.hun < 5 ? 'Morrendo de fome' : p.hun < 20 ? 'Faminto' : 'Com fome', p.hun < 20 ? 2 : 1, 'Coma algo. Comida enlatada dura muito; a fresca estraga rápido.');
  if (p.thi < 40) add('💧', p.thi < 5 ? 'Desidratado' : p.thi < 20 ? 'Com muita sede' : 'Com sede', p.thi < 20 ? 2 : 1, 'Beba água. Água de lago precisa ser fervida.');
  if (p.ene < 30) add('😴', p.ene < 12 ? 'Exausto' : 'Cansado', p.ene < 12 ? 2 : 1, 'Durma numa cama em lugar seguro.');
  if (p.temp < 38) add('🥶', p.temp < 25 ? 'Hipotermia' : 'Com frio', p.temp < 25 ? 2 : 1, 'Vista roupas quentes, entre em casa ou fique perto do fogo.');
  if (p.temp > 66) add('🥵', 'Com calor', 1, 'Tire roupas e beba água.');
  if (p.wet > 30) add('🌧️', 'Molhado', 1, 'Roupa molhada esfria o corpo. Uma capa de chuva ajuda.');
  if (p.str > 50) add('😰', p.str > 75 ? 'Muito estressado' : 'Estressado', p.str > 75 ? 2 : 1, 'Leia, coma algo bom, fume ou durma.');
  if (p.fear > 40) add('😱', p.fear > 70 ? 'Em pânico' : 'Com medo', p.fear > 70 ? 2 : 1, 'O medo atrapalha a mira. Afaste-se dos zumbis.');
  if (p.pain > 20) add('🤕', p.pain > 50 ? 'Dor forte' : 'Dor', p.pain > 50 ? 2 : 1, 'Analgésicos aliviam. Trate os ferimentos.');
  const bl = p.wounds.filter((w) => w.bl).length;
  if (bl) add('🩸', `Sangrando${bl > 1 ? ' ×' + bl : ''}`, 2, 'Enfaixe já! Abra Saúde.');
  if (p.wounds.some((w) => w.inf)) add('🦠', 'Ferimento infeccionado', 2, 'Antibióticos curam. Desinfete antes de enfaixar.');
  if (p.wounds.some((w) => w.dirty)) add('🧻', 'Curativo sujo', 1, 'Troque o curativo para evitar infecção.');
  if (p.knox && p.knoxT > 1500) add('🤒', 'Febre', 2, 'Isso não parece uma gripe...');
  if (p.sick > 30) add('🤢', 'Enjoado', p.sick > 60 ? 2 : 1, 'Comida estragada ou água suja. Descanse e beba água limpa.');
  if (invOver()) add('🎒', 'Carga pesada', 1, 'Você está lento. Largue itens ou use uma mochila.');
  if (p.sta < 20) add('🫁', 'Sem fôlego', 1, 'Pare de correr um pouco.');
  if (p.light) add('🔦', 'Lanterna acesa', 0, 'A luz te ajuda a ver, mas também deixa você mais visível.');
  if (G.input.sneak) add('👣', 'Agachado', 0, 'Mais silencioso e difícil de ver.');
  return m;
}
let hudT = 0, lastMood = '';
UI.hud = function (dt) {
  hudT -= dt; if (hudT > 0) return; hudT = 0.12;
  const p = S.player;
  $('#hDay').textContent = `Dia ${dayOf()}`;
  $('#hClock').textContent = clockStr();
  $('#hWeather').textContent = WEATHER[S.weather.k];
  $('#hTemp').textContent = `${Math.round(ambientTemp())}°C`;
  $('#hpBar').style.width = Math.max(0, p.hp) + '%';
  $('#hpBar').parentElement.classList.toggle('low', p.hp < 35);
  $('#staBar').style.width = p.sta + '%';
  const ms = moodles(), key = ms.map((m) => m.l).join('|');
  if (key !== lastMood) {
    lastMood = key;
    $('#moodles').innerHTML = ms.map((m, i) => `<button class="mood lv${m.lv}" data-m="${i}" title="${esc(m.l)}"><span>${m.i}</span><em>${esc(m.l)}</em></button>`).join('');
    UI.moods = ms;
  }
  // arma equipada
  const it = p.eq.mao;
  const w = $('#weapon');
  if (p.inCar) {
    const v = p.inCar, d = VT[v.t];
    w.innerHTML = `<b>${d.n}</b><span>⛽ ${Math.round(v.fuel)}/${d.fuel} L · 🔋 ${Math.round(v.bat)}% · ${Math.round(Math.abs(v.sp) * 7)} km/h${v.on ? '' : ' · desligado'}</span>`;
  } else if (it) {
    const d = ITEMS[it.k];
    w.innerHTML = `<b>${d.i} ${esc(d.n)}</b><span>${d.wp && d.wp.gun ? `${it.a}/${d.wp.mag} · reserva ${countItem(d.wp.ammo)}` : d.wp ? `condição ${Math.round(Math.max(0, it.d) / d.wp.dur * 100)}%` : ''}</span>`;
  } else w.innerHTML = '<b>✊ Mãos vazias</b><span>empurrão</span>';
  $('#btnReload').hidden = !(it && ITEMS[it.k].wp && ITEMS[it.k].wp.gun) || p.inCar;
  $('#btnAttack').hidden = !!p.inCar;
  $('#btnAttack').textContent = it && ITEMS[it.k].throw ? '🍾' : it && ITEMS[it.k].wp && ITEMS[it.k].wp.gun ? '🔫' : it ? '🪓' : '✊';
  // interação
  const inter = interactions();
  G.interactCache = inter;
  const ib = $('#btnUse');
  if (inter && inter.opts.length) { ib.classList.remove('dim'); $('#useLbl').textContent = inter.opts.length > 1 ? inter.name : inter.opts[0].l; }
  else { ib.classList.add('dim'); $('#useLbl').textContent = 'Usar'; }
  // ação em andamento
  const a = p.action, ab = $('#actionBar');
  if (a) { ab.hidden = false; $('#actionLbl').textContent = a.l; $('#actionFill').style.width = Math.min(100, a.t / a.d * 100) + '%'; }
  else if (p.sleeping) { ab.hidden = false; $('#actionLbl').textContent = `Dormindo… ${clockStr()}`; $('#actionFill').style.width = p.ene + '%'; }
  else ab.hidden = true;
  $('#buildBar').hidden = !G.buildSel;
  if (G.buildSel) { const [bx, by] = buildTarget(); const err = canBuild(G.buildSel, bx, by); $('#buildLbl').textContent = err || `${G.buildSel.n}: toque em ✔ para construir`; $('#buildOk').disabled = !!err; }
  // recados da base
  if (S.notes.length && S.base && dist(p.x, p.y, S.base.x, S.base.y) < 12) { for (const n of S.notes.splice(0)) say('📝 ' + n, 'bad'); }
};
$('#moodles').addEventListener('click', (e) => { const b = e.target.closest('.mood'); if (b && UI.moods) { const m = UI.moods[+b.dataset.m]; if (m) say(`${m.i} ${m.l}: ${m.d}`); } });
UI.refreshButtons = function () {
  $('#btnSneak').classList.toggle('on', !!G.input.sneak);
  $('#btnRun').classList.toggle('on', !!G.input.runToggle);
};

/* ---------- interação ---------- */
UI.interact = function () {
  if (UI.panelOpen()) return;
  const inter = G.interactCache || interactions();
  if (!inter || !inter.opts.length) { if (S.player.action) cancelAction(); return; }
  if (inter.opts.length === 1) { inter.opts[0].fn(); G.interactCache = null; return; }
  UI.open(esc(inter.name), () => `<div class="opts">${inter.opts.map((o) => `<button class="opt" data-a="${UI.act(() => { UI.closePanel(); o.fn(); })}">${esc(o.l)}</button>`).join('')}</div>`, { cls: 'small' });
};

/* ---------- mochila ---------- */
const CAT_ORDER = ['arma', 'municao', 'comida', 'bebida', 'medico', 'ferramenta', 'roupa', 'veiculo', 'material', 'leitura', 'misc'];
function invTabs(on) {
  return [
    { l: '🎒 Mochila', on: on === 'inv', fn: () => UI.openInventory() },
    { l: '❤️ Saúde', on: on === 'health', fn: () => UI.openHealth() },
    { l: '🧠 Habilidades', on: on === 'skills', fn: () => UI.openSkills() },
    { l: '🔨 Criar', on: on === 'craft', fn: () => UI.openCraft() },
  ];
}
function equippedSlot(it) { for (const [k, v] of Object.entries(S.player.eq)) if (v === it) return k; return null; }
function itemActions(it) {
  const p = S.player, d = ITEMS[it.k], a = [];
  const done = (fn) => () => { fn(); UI.redraw(); };
  if (d.food) a.push([d.can && !canOpen(it) ? 'Comer (precisa abridor)' : d.cat === 'bebida' ? 'Beber' : 'Comer', done(() => eat(it))]);
  if (d.water && it.w > 0 && it.k === 'garrafa') a.push([it.dirty ? 'Beber (suja!)' : 'Beber', done(() => drinkFrom(it))]);
  if (d.water && it.w > 0) a.push(['Esvaziar', done(() => { it.w = 0; it.dirty = 0; })]);
  if (d.med === 'bandagem' || d.med === 'trapo' || d.med === 'desinfetante' || d.med === 'sutura' || d.med === 'tala') a.push(['Tratar ferimentos', () => UI.openHealth()]);
  if (['analgesico', 'antibiotico', 'calmante'].includes(d.med)) a.push(['Tomar', done(() => useMed(it))]);
  if (d.smoke) a.push(['Fumar', done(() => smoke(it))]);
  if (d.wp || d.throw) {
    if (p.eq.mao === it) a.push(['Guardar arma', done(() => { p.eq.mao = null; })]);
    else a.push(['Empunhar', done(() => { p.eq.mao = it; })]);
    if (d.wp && d.wp.gun) {
      if (p.eq.mao === it && it.a < d.wp.mag && countItem(d.wp.ammo)) a.push(['Recarregar', () => { UI.closePanel(); reload(); }]);
      if (it.a > 0) a.push(['Descarregar', done(() => { giveItem(newItem(d.wp.ammo, { q: it.a })); it.a = 0; })]);
    }
  }
  if (it.k === 'lanterna') { a.push([p.light ? 'Desligar' : 'Ligar', done(() => UI.toggleLight())]); }
  if ((it.k === 'lanterna' || it.k === 'radio') && countItem('pilhas') && it.c < 90) a.push(['Trocar pilhas', done(() => { takeItem('pilhas'); it.c = 100; })]);
  if (it.k === 'radio') a.push(['Ouvir rádio', () => UI.openRadio()]);
  if (d.wear) {
    const slot = d.wear.slot;
    if (p.eq[slot] === it) a.push(['Tirar', done(() => { p.eq[slot] = null; })]);
    else a.push(['Vestir', done(() => { p.eq[slot] = it; })]);
  }
  if (d.cat === 'leitura') a.push(['Ler', () => { UI.closePanel(); read(it); }]);
  if (it.k === 'gerador') a.push(['Instalar (construção)', () => UI.openBuild()]);
  if (d.seed) a.push(['Como plantar', () => say('Faça um canteiro (construção, precisa de pá) e plante nele.')]);
  if (it.k === 'galao' && it.f > 0) a.push(['Abastecer veículo próximo', done(() => fuelNearby(it))]);
  if (it.k === 'tronco' && hasTag('serra')) a.push(['Serrar em tábuas', done(() => craft(CRAFTS[0]))]);
  a.push(['Largar', done(() => { removeItem(it); dropBag(p.x, p.y, [it]); })]);
  return a;
}
function fuelNearby(g) {
  const p = S.player;
  const v = S.vehs.find((v) => dist(v.x, v.y, p.x, p.y) < 2.8);
  if (!v) return say('Fique perto de um veículo.');
  const n = Math.min(g.f, VT[v.t].fuel - v.fuel); v.fuel += n; g.f -= n; say(`${VT[v.t].n}: +${Math.round(n)} L.`, 'good');
}
let openItem = null;
UI.openInventory = function () {
  const draw = () => {
    const p = S.player, w = listW(p.inv), cap = capacity();
    const groups = {};
    for (const it of p.inv) (groups[ITEMS[it.k].cat] = groups[ITEMS[it.k].cat] || []).push(it);
    let h = `<div class="cap ${w > cap ? 'over' : ''}"><span>Peso</span><div class="bar"><i style="width:${Math.min(100, w / cap * 100)}%"></i></div><b>${fmtKg(w)} / ${fmtKg(cap)}</b></div>`;
    if (!p.inv.length) h += '<p class="empty">Mochila vazia. Revire armários, geladeiras e corpos.</p>';
    for (const c of CAT_ORDER) {
      if (!groups[c]) continue;
      h += `<h4>${CAT_LBL[c]}</h4><div class="items"><div class="thead"><span class="ic"></span><span class="nm">Item</span><span class="ct">Categoria</span><span class="wt">Peso</span></div>`;
      for (const it of groups[c]) {
        const sl = equippedSlot(it), f = fresh(it);
        h += `<div class="item ${openItem === it ? 'open' : ''} ${f === 2 ? 'rot' : ''}">
          <button class="item__row" data-a="${UI.act(() => { openItem = openItem === it ? null : it; draw(); })}">
            <span class="ic">${ITEMS[it.k].i}</span><span class="nm">${esc(itemName(it))}${sl ? ' <em class="tag">equipado</em>' : ''}</span><span class="ct">${CAT_LBL[ITEMS[it.k].cat] || ''}</span><span class="wt">${fmtKg(itemW(it))}</span>
          </button>
          ${openItem === it ? `<div class="item__acts">${itemActions(it).map(([l, fn]) => `<button data-a="${UI.act(fn)}">${esc(l)}</button>`).join('')}</div>` : ''}
        </div>`;
      }
      h += '</div>';
    }
    $('#panelBody').innerHTML = h;
  };
  UI.open('Mochila', '', { tabs: invTabs('inv'), redraw: draw });
  draw();
};

/* ---------- saúde ---------- */
UI.openHealth = function () {
  const draw = () => {
    const p = S.player;
    const bar = (l, v, inv) => `<div class="stat"><span>${l}</span><div class="bar ${(inv ? v > 60 : v < 30) ? 'bad' : ''}"><i style="width:${clamp(v, 0, 100)}%"></i></div><b>${Math.round(v)}</b></div>`;
    let h = '<div class="stats">' + bar('❤️ Saúde', p.hp) + bar('🍽️ Saciedade', p.hun) + bar('💧 Hidratação', p.thi) + bar('😴 Energia', p.ene) +
      bar('🌡️ Temperatura', p.temp) + bar('😰 Estresse', p.str, 1) + bar('🤕 Dor', p.pain, 1) + bar('🤢 Enjoo', p.sick, 1) + '</div>';
    h += '<h4>Ferimentos</h4>';
    if (!p.wounds.length) h += '<p class="empty">Nenhum ferimento. Continue assim.</p>';
    for (const w of p.wounds) {
      const st = [w.bl ? '🩸 sangrando' : null, w.band ? (w.dirty ? '🧻 curativo sujo' : '🩹 enfaixado') : null, w.dis ? '🧴 desinfetado' : null, w.sut ? '🪡 suturado' : null, w.inf ? '🦠 infeccionado' : null, w.glass ? '🔹 cacos de vidro' : null].filter(Boolean).join(' · ');
      const acts = [];
      if (w.glass) acts.push(['Tirar cacos', () => treat(w, 'vidro')]);
      if (!w.dis && w.k !== 'fratura') acts.push([`Desinfetar (${countItem('desinfetante') ? 'ok' : 'sem'})`, () => treat(w, 'desinfetante')]);
      if (w.k === 'fratura') acts.push([`Tala (${countItem('tala')})`, () => treat(w, 'tala')]);
      else {
        if (!w.band || w.dirty) {
          acts.push([`${w.band ? 'Trocar curativo' : 'Enfaixar'}: bandagem (${countItem('bandagem')})`, () => { w.band = 0; w.dirty = 0; treat(w, 'bandagem'); }]);
          acts.push([`${w.band ? 'Trocar' : 'Enfaixar'}: trapos (${countItem('trapo')})`, () => { w.band = 0; w.dirty = 0; treat(w, 'trapo'); }]);
        }
        if (!w.sut && ['corte', 'mordida', 'tiro', 'vidro'].includes(w.k)) acts.push(['Suturar', () => treat(w, 'sutura')]);
      }
      h += `<div class="wound"><b>${WOUND_LBL[w.k]}</b><small>${st || 'cicatrizando'}</small>
        <div class="item__acts">${acts.map(([l, fn]) => `<button data-a="${UI.act(() => { fn(); draw(); })}">${esc(l)}</button>`).join('')}</div></div>`;
    }
    if (p.wounds.some((w) => w.k === 'mordida')) h += '<p class="warn">Mordidas de zumbi quase sempre infectam. Não há cura conhecida… aproveite o tempo que tiver.</p>';
    const meds = p.inv.filter((i) => ['analgesico', 'antibiotico', 'calmante'].includes(ITEMS[i.k].med));
    if (meds.length) h += '<h4>Remédios</h4><div class="item__acts">' + meds.map((it) => `<button data-a="${UI.act(() => { useMed(it); draw(); })}">${ITEMS[it.k].i} Tomar ${esc(ITEMS[it.k].n.toLowerCase())}</button>`).join('') + '</div>';
    $('#panelBody').innerHTML = h;
  };
  UI.open('Saúde', '', { tabs: invTabs('health'), redraw: draw });
  draw();
};

/* ---------- habilidades ---------- */
UI.openSkills = function () {
  const p = S.player, prof = PROFS.find((x) => x.k === p.prof);
  let h = `<div class="prof">${prof.i} <b>${prof.n}</b><small>Dia ${dayOf()} · ${S.stats.kills} zumbis abatidos · ${S.stats.made} construções</small></div>`;
  for (const [k, s] of Object.entries(SKILLS)) {
    const v = p.sk[k], next = SKILL_XP[v.l + 1], prev = SKILL_XP[v.l];
    const pct = v.l >= 5 ? 100 : (v.xp - prev) / (next - prev) * 100;
    h += `<div class="skill"><span class="ic">${s.i}</span><div><b>${s.n}</b><small>${s.d}</small><div class="pips">${[1, 2, 3, 4, 5].map((n) => `<i class="${n <= v.l ? 'on' : ''}"></i>`).join('')}<div class="bar"><i style="width:${pct}%"></i></div></div></div></div>`;
  }
  h += '<p class="hint">Você aprende fazendo: lute para treinar combate, construa para treinar construção. Livros dão um bom impulso.</p>';
  UI.open('Habilidades', h, { tabs: invTabs('skills') });
};

/* ---------- criar ---------- */
UI.openCraft = function (bench) {
  const draw = () => {
    let h = '';
    for (const c of CRAFTS) {
      const miss = [];
      for (const t of c.tools) if (!hasTag(t)) miss.push(toolName(t));
      for (const [k, q] of Object.entries(c.need)) if (countItem(k) < q) miss.push(`${q}× ${ITEMS[k].n}`);
      if (c.fuel && !S.player.inv.some((i) => i.k === 'galao' && i.f >= c.fuel)) miss.push(`${c.fuel} L de gasolina`);
      if (c.needLvl && lvl(c.needLvl[0]) < c.needLvl[1]) miss.push(`${SKILLS[c.needLvl[0]].n} ${c.needLvl[1]}`);
      if (c.bench && !nearObj(S.player.x, S.player.y, 'bancada', 4)) miss.push('bancada perto');
      const need = Object.entries(c.need).map(([k, q]) => `${q}× ${ITEMS[k].n}`).join(', ') + (c.fuel ? `, ${c.fuel} L gasolina` : '') + (c.tools.length ? ` · ferramenta: ${c.tools.map(toolName).join(', ')}` : '');
      h += `<div class="recipe ${miss.length ? 'no' : ''}"><span class="ic">${ITEMS[c.out[0]].i}</span><div><b>${esc(c.n)}</b><small>${esc(need)}</small>${miss.length ? `<small class="miss">Falta: ${esc(miss.join(', '))}</small>` : ''}</div>
        <button ${miss.length ? 'disabled' : ''} data-a="${UI.act(() => { craft(c); draw(); })}">Criar</button></div>`;
    }
    $('#panelBody').innerHTML = h;
  };
  UI.open(bench === true ? 'Bancada' : 'Criar', '', { tabs: invTabs('craft'), redraw: draw });
  draw();
};
G.onCraft = (b) => UI.openCraft(b);

/* ---------- construção ---------- */
UI.openBuild = function () {
  if (S.player.inCar) return say('Saia do veículo para construir.');
  let h = '<p class="hint">Escolha o que construir. O local é o quadrado à sua frente — vire o personagem para mirar.</p>';
  for (const r of RECIPES) {
    const err = canBuild(r);
    const need = Object.entries(r.need).map(([k, q]) => `${q}× ${ITEMS[k].n}`).join(', ') || 'nada';
    h += `<div class="recipe ${err ? 'no' : ''}"><span class="ic">${r.i}</span><div><b>${esc(r.n)}</b><small>${esc(r.desc)}</small><small>${esc(need)}${r.tools.length ? ' · ' + r.tools.map(toolName).join(', ') : ''} · ${SKILLS[r.sk[0]].n} ${r.sk[1]}</small>${err ? `<small class="miss">${esc(err)}</small>` : ''}</div>
      <button ${err ? 'disabled' : ''} data-a="${UI.act(() => { G.buildSel = r; UI.closePanel(); })}">Escolher</button></div>`;
  }
  UI.open('Construção', h);
};
UI.confirmBuild = function () { if (G.buildSel) { const r = G.buildSel; build(r); if (!['barricada', 'cerca', 'muro', 'muro_metal'].includes(r.k)) G.buildSel = null; } };
UI.cancelBuild = function () { G.buildSel = null; };

/* ---------- contêiner ---------- */
G.onContainer = (c) => UI.openContainer(c);
UI.openContainer = function (c) {
  const p = S.player;
  let list, name, cap;
  if (c.v) { list = trunkItems(c.v); name = `Porta-malas · ${VT[c.v.t].n}`; cap = VT[c.v.t].trunk; }
  else { list = containerItems(c.o, c.x, c.y); name = c.o.t === 'cadaver' ? 'Corpo' : FURN[c.o.t].n; cap = FURN[c.o.t].cap; }
  if (!c.v && c.o.t !== 'bolsa_chao' && c.o.t !== 'cadaver' && !c.seen) { c.seen = 1; makeNoise(p.x, p.y, 2, false); }
  const draw = () => {
    const w = listW(list), pw = listW(p.inv), pc = capacity();
    let h = `<div class="cols"><section><h4>${esc(name)} <small>${fmtKg(w)}${cap < 900 ? ' / ' + fmtKg(cap) : ''}</small></h4>`;
    if (list.length) h += `<button class="all" data-a="${UI.act(() => { for (const it of list.slice()) { list.splice(list.indexOf(it), 1); giveItem(it); } sfx('pegar'); draw(); })}">Pegar tudo</button>`;
    h += '<div class="items">' + (list.length ? list.map((it) => `<button class="item__row ${fresh(it) === 2 ? 'rot' : ''}" data-a="${UI.act(() => { list.splice(list.indexOf(it), 1); giveItem(it); sfx('pegar'); if (it.k === 'chave_carro' && !it.kid) assignKey(it, p.x, p.y); draw(); })}"><span class="ic">${ITEMS[it.k].i}</span><span class="nm">${esc(itemName(it))}</span><span class="ct">${CAT_LBL[ITEMS[it.k].cat] || ''}</span><span class="wt">${fmtKg(itemW(it))} ›</span></button>`).join('') : '<p class="empty">Vazio.</p>') + '</div></section>';
    h += `<section><h4>Você <small class="${pw > pc ? 'over' : ''}">${fmtKg(pw)} / ${fmtKg(pc)}</small></h4><div class="items">`;
    h += p.inv.map((it) => `<button class="item__row" data-a="${UI.act(() => { if (cap < 900 && listW(list) + itemW(it) > cap) return say('Não cabe.'); removeItem(it); addTo(list, it); draw(); })}"><span class="ic">${ITEMS[it.k].i}</span><span class="nm">${esc(itemName(it))}${equippedSlot(it) ? ' <em class="tag">eq.</em>' : ''}</span><span class="ct">${CAT_LBL[ITEMS[it.k].cat] || ''}</span><span class="wt">‹ ${fmtKg(itemW(it))}</span></button>`).join('') + '</div></section></div>';
    $('#panelBody').innerHTML = h;
  };
  UI.open('Saquear', '', { redraw: draw, cls: 'wide' });
  UI.onClose = () => { if (!c.v && c.o) G.chunkDirty(c.x, c.y); };
  draw();
};

/* ---------- veículo ---------- */
G.onVehicle = (v) => UI.openVehicle(v);
UI.openVehicle = function (v) {
  const p = S.player, d = VT[v.t], mec = lvl('mecanica');
  const draw = () => {
    const pc = (n) => `<div class="bar ${n < 30 ? 'bad' : ''}"><i style="width:${clamp(n, 0, 100)}%"></i></div>`;
    let h = `<div class="stats">
      <div class="stat"><span>⛽ Combustível</span>${pc(v.fuel / d.fuel * 100)}<b>${Math.round(v.fuel)} L</b></div>
      <div class="stat"><span>🔋 Bateria</span>${pc(v.bat)}<b>${Math.round(v.bat)}%</b></div>
      <div class="stat"><span>⚙️ Motor</span>${pc(v.eng)}<b>${Math.round(v.eng)}%</b></div>
      <div class="stat"><span>🚗 Lataria</span>${pc(v.hp / d.hp * 100)}<b>${Math.round(v.hp / d.hp * 100)}%</b></div>
      ${v.tires.map((t, i) => `<div class="stat"><span>🛞 Pneu ${i + 1}</span>${pc(t)}<b>${t <= 0 ? 'furado' : Math.round(t) + '%'}</b></div>`).join('')}
    </div><p class="hint">${hasKey(v) ? '🔑 Você pode ligar este veículo.' : 'Sem chave: procure nas casas próximas ou faça ligação direta (Mecânica 1 + chave de fenda).'}</p>`;
    const acts = [];
    const g = p.inv.find((i) => i.k === 'galao' && i.f > 0);
    if (g) acts.push([`Abastecer com galão (${Math.round(g.f)} L)`, () => fuelNearby(g)]);
    const ge = p.inv.find((i) => i.k === 'galao' && i.f < ITEMS.galao.fuel);
    if (ge && hasTag('mangueira') && v.fuel > 0) acts.push(['Tirar gasolina com mangueira', () => { const n = Math.min(v.fuel, ITEMS.galao.fuel - ge.f); v.fuel -= n; ge.f += n; say(`Galão: +${Math.round(n)} L.`); }]);
    const bat = p.inv.find((i) => i.k === 'bateria');
    if (hasTag('chave')) {
      if (bat) acts.push([`Instalar bateria (${Math.round(bat.c)}%)`, () => { const old = v.bat; v.bat = bat.c; bat.c = old; addXP('mecanica', 2); say('Bateria trocada.'); }]);
      else if (v.bat > 0) acts.push(['Retirar bateria', () => { giveItem(newItem('bateria', { c: v.bat })); v.bat = 0; addXP('mecanica', 1); }]);
      const worst = v.tires.indexOf(Math.min(...v.tires));
      const tire = p.inv.find((i) => i.k === 'pneu');
      if (tire && v.tires[worst] < 90) acts.push(['Trocar o pior pneu', () => { const old = v.tires[worst]; v.tires[worst] = tire.c != null ? tire.c : 90; removeItem(tire); if (old > 20) giveItem(newItem('pneu', { c: old })); addXP('mecanica', 3); say('Pneu trocado.'); }]);
      const best = v.tires.indexOf(Math.max(...v.tires));
      if (v.tires[best] > 20) acts.push(['Retirar um pneu', () => { giveItem(newItem('pneu', { c: v.tires[best] })); v.tires[best] = 0; addXP('mecanica', 1); }]);
      if (countItem('pecas') && v.eng < 100) acts.push([mec >= 1 ? 'Consertar motor (1 peça)' : 'Consertar motor (precisa Mecânica 1)', () => { if (mec < 1) return say('Preciso de Mecânica 1.'); takeItem('pecas'); v.eng = Math.min(100, v.eng + 15 + mec * 6); addXP('mecanica', 6); say('O motor está melhor.', 'good'); }]);
    }
    if (countItem('sucata') >= 2 && hasTag('martelo') && v.hp < d.hp) acts.push(['Reparar lataria (2 sucatas)', () => { takeItem('sucata', 2); v.hp = Math.min(d.hp, v.hp + d.hp * 0.2); addXP('mecanica', 3); }]);
    if (!hasTag('chave')) h += '<p class="hint">Uma chave inglesa permite trocar bateria, pneus e consertar o motor.</p>';
    h += '<div class="item__acts">' + acts.map(([l, fn]) => `<button data-a="${UI.act(() => { fn(); draw(); })}">${esc(l)}</button>`).join('') + '</div>';
    $('#panelBody').innerHTML = h;
  };
  UI.open(`${d.n} ${colorName(v.col)}`, '', { redraw: draw });
  draw();
};

/* ---------- mapa e rádio ---------- */
UI.openMap = function () {
  const sz = Math.min(window.innerWidth - 40, window.innerHeight - 220, 600);
  const radio = S.player.inv.find((i) => i.k === 'radio');
  UI.open('Mapa', `<div class="map"><canvas id="mapCv" width="${Math.round(sz * 2)}" height="${Math.round(sz * 2)}" style="width:${sz}px;height:${sz}px"></canvas></div>
    <p class="hint">Só aparece o que você já viu. 📍 base · ● sobreviventes · 🔑 carro da sua chave${radio && radio.c > 0 ? ' · manchas vermelhas: hordas (rádio)' : ''}</p>
    ${radio ? `<button class="all" data-a="${UI.act(() => UI.openRadio())}">📻 Ouvir rádio</button>` : ''}`, { cls: 'wide' });
  for (const h of S.hordes) h.known = radio && radio.c > 0 ? 1 : h.known;
  drawMap($('#mapCv'));
};
UI.openRadio = function () {
  const r = S.player.inv.find((i) => i.k === 'radio');
  let h = '';
  if (!r || !(r.c > 0)) h = '<p class="empty">O rádio está sem pilhas.</p>';
  else if (!S.radioLog.length) h = '<p class="empty">Só chiado...</p>';
  else h = S.radioLog.map((m) => `<div class="radio"><small>Dia ${dayOf(m.t)} · ${clockStr(m.t)}</small><p>${esc(m.msg)}</p></div>`).join('');
  UI.open('📻 Rádio', h);
};

/* ---------- menu ---------- */
UI.openMenu = function () {
  UI.open('Pausa', `<div class="opts">
    <button class="opt" data-a="${UI.act(() => UI.closePanel())}">▶ Continuar</button>
    <button class="opt" data-a="${UI.act(() => { SOUND.unlock(); SOUND.setOn(!SOUND.on); UI.openMenu(); })}">${SOUND.on ? '🔊 Som: ligado' : '🔇 Som: desligado'}</button>
    <button class="opt" data-a="${UI.act(() => UI.openHelp())}">❓ Como jogar</button>
    <button class="opt" data-a="${UI.act(() => { saveGame(); say('Jogo salvo.'); UI.closePanel(); })}">💾 Salvar agora</button>
    <button class="opt" data-a="${UI.act(() => UI.sleepHere())}">😴 Dormir no chão</button>
    <button class="opt danger" data-a="${UI.act(() => { if (confirm('Desistir deste mundo? O progresso será apagado.')) { deleteSave(); location.reload(); } })}">☠️ Desistir e recomeçar</button>
  </div>`, { cls: 'small' });
};
UI.sleepHere = function () { UI.closePanel(); startSleep(0.5); };
UI.toggleLight = function () {
  const p = S.player;
  if (p.inCar) { p.inCar.lights = p.inCar.lights ? 0 : 1; return; }
  const l = p.inv.find((i) => i.k === 'lanterna');
  if (!l) return say('Você não tem lanterna.');
  if (!(l.c > 0)) return say('A lanterna está sem pilhas.');
  p.light = p.light ? 0 : 1;
};
UI.openHelp = function () {
  UI.open('Como jogar', `<div class="help">
    <p><b>Objetivo:</b> sobreviver o máximo de dias. Não existe vitória — só quanto tempo você aguenta.</p>
    <p><b>Celular:</b> arraste o lado esquerdo para andar (até a borda = correr). Botões à direita: atacar, usar, correr, agachar, mochila e construir.</p>
    <p><b>Câmera:</b> isométrica. Aproxime e afaste com dois dedos na metade direita da tela, com a roda do mouse, com + e − ou com os botões ＋ e −.</p>
    <p><b>Computador:</b> WASD anda · Shift corre · C agacha · mouse mira · clique ataca · E usa · I mochila · B constrói · M mapa · H saúde · R recarrega · F lanterna.</p>
    <p><b>Barulho atrai zumbis.</b> Tiros, carros, vidro quebrando, martelo e geradores chamam atenção. O anel branco mostra até onde o som foi.</p>
    <p><b>Saque:</b> chegue perto de armários, geladeiras e corpos e toque em Usar. Portas trancadas: pé de cabra ou quebre a janela (cuidado com os cacos).</p>
    <p><b>Comida estraga.</b> Enlatados duram para sempre (precisa abridor ou faca). Geladeiras seguram a comida até a energia acabar.</p>
    <p><b>Ferimentos:</b> enfaixe o que sangra, desinfete para não infeccionar. Mordida de zumbi… é o fim, só não se sabe quando.</p>
    <p><b>Construção:</b> martelo + tábuas + pregos. Desmonte móveis para tirar tábuas, ou corte árvores (machado) e serre os troncos.</p>
    <p><b>Veículos:</b> precisam de chave (ou ligação direta), bateria, gasolina e pneus. Chaves aparecem em casas e em corpos.</p>
    <p><b>Mundo vivo:</b> a energia e a água vão acabar, hordas migram pelo mapa, sobreviventes pedem ajuda, trocam itens… ou roubam você.</p>
  </div>`);
};

/* ---------- sobreviventes ---------- */
G.onDialog = (n, mode) => UI.openNpc(n, mode);
function foodItems() { return S.player.inv.filter((i) => ITEMS[i.k].food && fresh(i) < 2); }
UI.openNpc = function (n, mode) {
  n.met = 1;
  const p = S.player, kind = NPC_KINDS[n.kind];
  const trust = n.trust > 60 ? 'confia em você' : n.trust > 25 ? 'simpatiza com você' : n.trust > -10 ? 'desconfiado' : 'hostil';
  const head = `<div class="npc"><span class="av" style="background:${kind.col}">${esc(n.name[0])}</span><div><b>${esc(n.name)}</b><small>${n.kind === 'familia' ? `Família (${n.size || 3} pessoas)` : kind.n} · ${trust}</small></div></div>`;
  const say2 = (t) => `<blockquote>${esc(t)}</blockquote>`;
  const opts = [];
  const finish = (f) => () => { f(); UI.openNpc(n, 'falar'); };
  let line = '';
  if (mode === 'assalto') {
    line = n.raid ? 'Essa base agora é nossa. Larga tudo e some!' : 'Parado aí. Passa a comida e ninguém se machuca.';
    const food = foodItems();
    if (food.length >= 2) opts.push(['Entregar 2 comidas', () => { for (const it of food.slice(0, 2)) { removeItem(it); n.inv.push(it); } n.st = n.raid ? 'fuga' : 'casa'; n.trust += 10; say(`${n.name} pegou a comida e se afastou.`); UI.closePanel(); }]);
    opts.push(['Recusar (lutar!)', () => { n.st = 'ataque'; UI.closePanel(); }]);
    opts.push(['Correr', () => { n.st = 'ataque'; UI.closePanel(); say('Corre!', 'bad'); }]);
  } else if (mode === 'chegada') {
    line = `Lembra da gente? Você nos ajudou. Está tudo perdido lá fora... Podemos ficar com você? Somos ${n.size || 3}. A gente ajuda a buscar comida e vigiar.`;
    opts.push(['Aceitar: “Entrem.”', () => { n.st = 'base'; n.gx = S.base.x; n.gy = S.base.y; n.trust += 30; say(`${n.name} e a família agora vivem na sua base.`, 'good'); UI.closePanel(); }]);
    opts.push(['Recusar: “Não há espaço.”', () => {
      n.away = 1; n.st = 'casa'; say(`${n.name} baixa a cabeça e vai embora.`);
      if (chance(0.4)) S.events.push({ at: S.time + rint(2, 4) * 1440, k: 'virou_bandido', id: n.id });
      UI.closePanel();
    }]);
  } else if (n.hostile) {
    line = 'Some daqui antes que eu mude de ideia.';
  } else if (n.st === 'seguir' || n.st === 'base' || n.st === 'guardar') {
    line = n.st === 'seguir' ? 'Tô contigo. O que fazemos?' : 'Tudo calmo por aqui. Por enquanto.';
    if (n.st !== 'seguir') opts.push(['Venha comigo', finish(() => { n.st = 'seguir'; })]);
    if (n.st === 'seguir') opts.push(['Espere aqui e vigie', finish(() => { n.st = 'guardar'; n.gx = n.x; n.gy = n.y; })]);
    if (n.st === 'seguir' && S.base) opts.push(['Volte para a base', finish(() => { n.st = 'base'; n.gx = S.base.x; n.gy = S.base.y; n.x = S.base.x; n.y = S.base.y; })]);
    const f = foodItems()[0];
    if (f) opts.push([`Dar ${ITEMS[f.k].n.toLowerCase()}`, finish(() => { removeItem(f); n.inv.push(f); n.trust += 5; say(`${n.name} guardou a comida.`); })]);
    const w = p.inv.find((i) => ITEMS[i.k].wp && !ITEMS[i.k].wp.gun && i !== p.eq.mao);
    if (w && !n.wp) opts.push([`Dar ${ITEMS[w.k].n.toLowerCase()} para se defender`, finish(() => { removeItem(w); n.wp = w.k; say(`${n.name} agora está armado.`); })]);
    opts.push(['Dispensar do grupo', () => { n.st = 'casa'; n.away = 1; say(`${n.name} segue seu caminho.`); UI.closePanel(); }]);
  } else if (n.kind === 'comerciante') {
    line = 'Tenho de tudo um pouco. Nada é de graça, mas sou justo.';
    opts.push(['Negociar', () => UI.openTrade(n)]);
    opts.push(['Alguma notícia?', finish(() => tellNews(n))]);
  } else if (n.kind === 'familia') {
    const q = n.quest;
    if (q && !q.done) {
      line = { antibiotico: 'Minha filha está com uma infecção feia... Você tem antibióticos? Eu pago com comida.', analgesico: 'Meu pai quebrou a perna. Precisamos de analgésicos, por favor.', bandagem: `Estamos sem curativos. Consegue ${q.q} bandagens?`, feijao: `As crianças estão com fome... ${q.q} latas de feijão, qualquer coisa.` }[q.need];
      if (countItem(q.need) >= q.q || (ITEMS[q.need].uses && p.inv.some((i) => i.k === q.need))) {
        opts.push([`Entregar ${ITEMS[q.need].n.toLowerCase()}`, finish(() => {
          if (ITEMS[q.need].uses) removeItem(p.inv.find((i) => i.k === q.need)); else takeItem(q.need, q.q);
          q.done = 1; n.trust += 45; for (const it of q.reward) giveItem(it);
          n.arriveAt = S.time + 3 * 1440;
          say(`${n.name}: "Deus te abençoe!" Você recebeu comida em troca.`, 'good'); addXP('medicina', 3);
        })]);
      }
    } else line = n.trust > 40 ? 'Obrigado de novo pelo que fez por nós.' : 'Estamos nos virando como dá.';
    opts.push(['Alguma notícia?', finish(() => tellNews(n))]);
  } else if (n.kind === 'solitario') {
    line = n.trust >= 40 ? 'Sozinho lá fora ninguém dura muito, né?' : 'Mantém distância. Já vi gente boa virar bicho.';
    const f = foodItems()[0];
    if (f) opts.push([`Oferecer ${ITEMS[f.k].n.toLowerCase()} (+confiança)`, finish(() => { removeItem(f); n.inv.push(f); n.trust += 15; say(`${n.name} aceitou, desconfiado.`); })]);
    if (n.trust >= 40) opts.push(['Convidar para o grupo', () => { n.st = 'seguir'; say(`${n.name} agora anda com você.`, 'good'); UI.closePanel(); }]);
    else opts.push(['Convidar para o grupo', finish(() => say(`${n.name}: "Ainda não te conheço o suficiente."`))]);
    opts.push(['Alguma notícia?', finish(() => tellNews(n))]);
  }
  opts.push(['Tchau', () => UI.closePanel()]);
  UI.open(esc(n.name), head + (line ? say2(line) : '') + `<div class="opts">${opts.map(([l, fn]) => `<button class="opt" data-a="${UI.act(fn)}">${esc(l)}</button>`).join('')}</div>`, { cls: 'small' });
};
function tellNews(n) {
  if (n.news && S.time - n.news < 720) return say(`${n.name}: "Já te contei o que sei."`);
  n.news = S.time;
  const p = S.player, r = R();
  if (r < 0.35) {
    const b = pick(S.bld.filter((b) => ['delegacia', 'hospital', 'oficina', 'posto', 'mercado', 'fabrica', 'celeiro'].includes(b.t)));
    for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) S.seen[ix(x, y)] = 1;
    say(`${n.name}: "Tem ${b.n.toLowerCase()} ao ${dirName(b.x - p.x, b.y - p.y)} daqui. Marquei no seu mapa."`);
  } else if (r < 0.6 && S.hordes.length) {
    const h = S.hordes[0]; h.known = 1;
    say(`${n.name}: "Vi uma horda grande perto de ${placeName(h.cx || h.tx, h.cy || h.ty)}. Fica longe."`);
  } else if (r < 0.8) {
    const v = S.vehs.find((v) => v.fuel > 15 && v.eng > 50 && !S.seen[ix(Math.floor(v.x), Math.floor(v.y))]);
    if (v) { for (let y = -2; y <= 2; y++) for (let x = -2; x <= 2; x++) if (inb(Math.floor(v.x) + x, Math.floor(v.y) + y)) S.seen[ix(Math.floor(v.x) + x, Math.floor(v.y) + y)] = 1; say(`${n.name}: "Tem ${VT[v.t].n.toLowerCase()} com gasolina ao ${dirName(v.x - p.x, v.y - p.y)}. Marquei no mapa."`); }
    else say(`${n.name}: "A energia não volta mais. Guarda água."`);
  } else say(`${n.name}: "${pick(['Eles ouvem tudo. Tiro é a última opção.', 'De noite os corredores ficam piores. Fica em casa.', 'Barricada nas janelas primeiro. Porta eles derrubam devagar.', 'Os saqueadores ficam numa casa da cidade. Cuidado.'])}"`);
}
UI.openTrade = function (n) {
  const p = S.player;
  const val = (it) => Math.max(0.5, ITEMS[it.k].v * (it.q || 1) * (fresh(it) === 2 ? 0.1 : fresh(it) === 1 ? 0.6 : 1));
  const sellMul = 0.6 + clamp(n.trust, 0, 100) / 400;
  const draw = () => {
    let h = `<p class="hint">Venda itens para ganhar crédito com ${esc(n.name)} e use o crédito para levar o que precisa.</p><div class="credit">Crédito: <b>${n.credit.toFixed(1)}</b></div><div class="cols">`;
    h += `<section><h4>${esc(n.name)} vende</h4><div class="items">` + (n.inv.length ? n.inv.map((it) => { const c = val(it); return `<button class="item__row ${c > n.credit ? 'dim' : ''}" data-a="${UI.act(() => { if (c > n.credit) return say('Crédito insuficiente.'); n.credit -= c; n.inv.splice(n.inv.indexOf(it), 1); giveItem(it); draw(); })}"><span class="ic">${ITEMS[it.k].i}</span><span class="nm">${esc(itemName(it))}</span><span class="wt">${c.toFixed(1)}</span></button>`; }).join('') : '<p class="empty">Nada à venda.</p>') + '</div></section>';
    h += `<section><h4>Você vende</h4><div class="items">` + p.inv.map((it) => { const c = val(it) * sellMul; return `<button class="item__row" data-a="${UI.act(() => { removeItem(it); n.inv.push(it); n.credit += c; draw(); })}"><span class="ic">${ITEMS[it.k].i}</span><span class="nm">${esc(itemName(it))}</span><span class="wt">+${c.toFixed(1)}</span></button>`; }).join('') + '</div></section></div>';
    $('#panelBody').innerHTML = h;
  };
  UI.open('Negociar', '', { redraw: draw, cls: 'wide' });
  draw();
};

/* ---------- morte ---------- */
G.onDeath = (cause) => {
  UI.playing = false;
  const txt = { zumbi: 'A febre venceu. Você se levantou de novo… mas não era mais você.', devorado: 'Eram muitos. Você foi devorado.', fome: 'Você morreu de fome.', sede: 'Você morreu de sede.', frio: 'O frio levou você.', sangue: 'Você sangrou até a morte.', fogo: 'O fogo te consumiu.', explosao: 'Uma explosão acabou com tudo.', 'explosão': 'Uma explosão acabou com tudo.', acidente: 'O acidente foi fatal.', saqueadores: 'Saqueadores te mataram.', ferimentos: 'Seus ferimentos foram graves demais.' }[cause] || 'Você morreu.';
  const days = ((S.time - START_MIN) / 1440);
  setTimeout(() => {
    $('#deathTxt').textContent = txt;
    $('#deathStats').innerHTML = `<div><b>${Math.floor(days)}</b><span>dias e ${Math.floor((days % 1) * 24)} h</span></div><div><b>${S.stats.kills}</b><span>zumbis</span></div><div><b>${S.stats.made}</b><span>construções</span></div>`;
    $('#death').hidden = false; $('#hud').hidden = true; UI.closePanel();
  }, 1600);
};
$('#deathAgain').addEventListener('click', () => { location.reload(); });

/* ---------- botões ---------- */
holdBtn($('#btnAttack'), () => { if (G.buildSel) UI.confirmBuild(); else G.input.attack = true; }, () => { G.input.attack = false; });
$('#btnUse').addEventListener('click', () => UI.interact());
$('#btnInv').addEventListener('click', () => UI.openInventory());
$('#btnBuild').addEventListener('click', () => UI.openBuild());
$('#btnMap').addEventListener('click', () => UI.openMap());
$('#btnMenu').addEventListener('click', () => UI.openMenu());
$('#btnZoomIn').addEventListener('click', () => zoomBy(1.2));
$('#btnZoomOut').addEventListener('click', () => zoomBy(1 / 1.2));
$('#btnReload').addEventListener('click', () => reload());
$('#btnLight').addEventListener('click', () => UI.toggleLight());
$('#btnRun').addEventListener('click', () => { G.input.runToggle = !G.input.runToggle; if (G.input.runToggle) G.input.sneak = false; UI.refreshButtons(); });
$('#btnSneak').addEventListener('click', () => { G.input.sneak = !G.input.sneak; if (G.input.sneak) G.input.runToggle = false; UI.refreshButtons(); });
$('#buildOk').addEventListener('click', () => UI.confirmBuild());
$('#buildCancel').addEventListener('click', () => UI.cancelBuild());
$('#weapon').addEventListener('click', () => UI.openInventory());

/* ---------- tela inicial ---------- */
UI.start = function () {
  const has = hasSave();
  $('#btnContinue').hidden = !has;
  $('#profs').innerHTML = PROFS.map((p) => `<button class="profbtn" data-p="${p.k}"><span>${p.i}</span><b>${p.n}</b><small>${p.d}</small></button>`).join('');
};
$('#btnNew').addEventListener('click', () => { if (hasSave() && !confirm('Começar um mundo novo apaga o progresso atual. Continuar?')) return; $('#startMain').hidden = true; $('#startProf').hidden = false; });
$('#btnBackProf').addEventListener('click', () => { $('#startMain').hidden = false; $('#startProf').hidden = true; });
$('#profs').addEventListener('click', (e) => {
  const b = e.target.closest('[data-p]'); if (!b) return;
  deleteSave();
  genWorld(Math.floor(Math.random() * 1e9), b.dataset.p);
  spawnAnimals(5);
  beginPlay(true);
});
$('#btnContinue').addEventListener('click', () => {
  const d = loadGame(); if (!d) { say('Não foi possível carregar o jogo.'); return; }
  S = d; beginPlay(false);
});
$('#btnHowto').addEventListener('click', () => { $('#howto').hidden = !$('#howto').hidden; });
function beginPlay(fresh) {
  $('#start').hidden = true; $('#hud').hidden = false;
  G.resetChunks(); G.cam.x = S.player.x; G.cam.y = S.player.y;
  UI.playing = true; G.speed = 1; G.paused = false;
  computeVis();
  if (fresh) {
    setTimeout(() => say('Dia 1, 08:00. A cidade caiu durante a noite. Você está em casa.'), 400);
    setTimeout(() => say('Revire a casa atrás de comida, água e algo para se defender.'), 3600);
    setTimeout(() => say(touchMode ? 'Arraste o lado esquerdo para andar. "Usar" interage com o que está à frente.' : 'WASD anda, E usa, clique ataca, I abre a mochila.'), 6800);
  } else say(`Bem-vindo de volta. Dia ${dayOf()}, ${clockStr()}.`);
}
