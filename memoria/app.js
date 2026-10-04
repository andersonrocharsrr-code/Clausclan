/* Memória & Quebra-cabeça — jogo para celular (sem dependências). */
(() => {
  'use strict';

  // ===== Configuração =====
  const MEM_LEVELS = [
    { id: 'facil', label: 'Fácil', cols: 3, rows: 4 },
    { id: 'medio', label: 'Médio', cols: 4, rows: 4 },
    { id: 'dificil', label: 'Difícil', cols: 4, rows: 5 },
    { id: 'expert', label: 'Expert', cols: 5, rows: 6 },
  ];

  const THEMES = [
    { id: 'animais', label: 'Animais', items: ['🐶', '🐱', '🦊', '🐼', '🐨', '🐯', '🦁', '🐸', '🐵', '🐧', '🐙', '🦄', '🐢', '🦋', '🐝', '🐬', '🦉', '🐰'] },
    { id: 'frutas', label: 'Frutas', items: ['🍓', '🍌', '🍇', '🍎', '🍉', '🍍', '🥝', '🍒', '🍑', '🥥', '🍋', '🥭', '🍐', '🫐', '🍈', '🥑', '🌽', '🥕'] },
    { id: 'espaco', label: 'Espaço', items: ['🚀', '🪐', '🌙', '⭐', '☄️', '👽', '🛸', '🌍', '🌞', '🔭', '🛰️', '🌌', '🌠', '🌑', '🌈', '⚡', '🌋', '💫'] },
    { id: 'esportes', label: 'Esportes', items: ['⚽', '🏀', '🎾', '⚾', '🏈', '🏐', '🏉', '🎱', '🏓', '🏸', '🥊', '⛳', '🛹', '🏆', '🥇', '🎯', '🏹', '🤿'] },
    { id: 'comidas', label: 'Comidas', items: ['🍕', '🍔', '🍩', '🌭', '🍿', '🧁', '🍟', '🍪', '🍫', '🍦', '🥨', '🌮', '🍣', '🥞', '🧇', '🍭', '🎂', '🥐'] },
  ];

  const PUZ_LEVELS = [
    { n: 3, label: '3 × 3', sub: 'Fácil', stars: [60, 150] },
    { n: 4, label: '4 × 4', sub: 'Médio', stars: [180, 420] },
    { n: 5, label: '5 × 5', sub: 'Difícil', stars: [420, 900] },
  ];

  // Imagens do quebra-cabeça (SVG desenhado aqui mesmo, funciona offline).
  const SCENE_NAMES = ['Praia', 'Noite', 'Arco-íris', 'Jardim'];
  const SCENES = [
    // Pôr do sol na praia
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
      <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4c1d95"/><stop offset=".55" stop-color="#f472b6"/><stop offset="1" stop-color="#fdba74"/></linearGradient>
      <linearGradient id="m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0e7490"/><stop offset="1" stop-color="#164e63"/></linearGradient></defs>
      <rect width="300" height="300" fill="url(#s)"/>
      <circle cx="150" cy="170" r="62" fill="#fde047"/>
      <circle cx="60" cy="60" r="2" fill="#fff"/><circle cx="230" cy="40" r="2.5" fill="#fff"/><circle cx="270" cy="90" r="1.8" fill="#fff"/><circle cx="110" cy="30" r="1.5" fill="#fff"/>
      <path d="M30 80 q20 -14 40 0 q20 -14 40 0" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="4" stroke-linecap="round"/>
      <rect y="190" width="300" height="70" fill="url(#m)"/>
      <path d="M90 205 h120 M110 222 h80 M130 238 h40" stroke="#fde047" stroke-opacity=".7" stroke-width="5" stroke-linecap="round"/>
      <path d="M0 255 q75 -20 150 0 t150 0 v45 h-300z" fill="#fcd34d"/>
      <path d="M232 262 q-6 -70 10 -120" fill="none" stroke="#78350f" stroke-width="9" stroke-linecap="round"/>
      <g fill="#15803d"><path d="M242 142 q-40 -10 -60 18 q30 -8 60 -18z"/><path d="M242 142 q30 -30 58 -12 q-30 0 -58 12z"/><path d="M242 142 q-10 -40 -46 -40 q26 14 46 40z"/><path d="M242 142 q20 -36 50 -32 q-30 10 -50 32z"/></g>
      <circle cx="60" cy="275" r="10" fill="#f97316"/><path d="M50 275 h20" stroke="#fff" stroke-width="3"/>
    </svg>`,
    // Montanhas à noite
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
      <defs><linearGradient id="n" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f172a"/><stop offset="1" stop-color="#3730a3"/></linearGradient></defs>
      <rect width="300" height="300" fill="url(#n)"/>
      <g fill="#fff"><circle cx="30" cy="40" r="2"/><circle cx="80" cy="90" r="1.6"/><circle cx="140" cy="30" r="2.2"/><circle cx="190" cy="80" r="1.5"/><circle cx="260" cy="120" r="2"/><circle cx="110" cy="140" r="1.4"/><circle cx="40" cy="150" r="1.8"/><circle cx="170" cy="130" r="1.2"/></g>
      <circle cx="225" cy="62" r="34" fill="#fef9c3"/><circle cx="240" cy="52" r="30" fill="#1e1b4b"/>
      <path d="M0 230 l70 -110 l45 60 l55 -95 l70 115 l60 -60 v160 h-300z" fill="#6366f1"/>
      <path d="M70 120 l18 28 l-12 -4 l-10 10 l-12 -8 z M170 85 l22 36 l-14 -6 l-10 12 l-12 -10 l-8 4z" fill="#e0e7ff"/>
      <path d="M0 250 l60 -50 l50 30 l70 -60 l60 45 l60 -35 v120 h-300z" fill="#312e81"/>
      <g fill="#064e3b"><path d="M30 300 l16 -60 l16 60z"/><path d="M60 300 l12 -44 l12 44z"/><path d="M220 300 l18 -70 l18 70z"/><path d="M252 300 l12 -46 l12 46z"/><path d="M130 300 l10 -36 l10 36z"/></g>
    </svg>`,
    // Balões e arco-íris
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
      <rect width="300" height="300" fill="#7dd3fc"/>
      <g fill="none" stroke-width="16"><path d="M10 300 a140 140 0 0 1 280 0" stroke="#ef4444"/><path d="M26 300 a124 124 0 0 1 248 0" stroke="#f97316"/><path d="M42 300 a108 108 0 0 1 216 0" stroke="#facc15"/><path d="M58 300 a92 92 0 0 1 184 0" stroke="#22c55e"/><path d="M74 300 a76 76 0 0 1 152 0" stroke="#3b82f6"/><path d="M90 300 a60 60 0 0 1 120 0" stroke="#8b5cf6"/></g>
      <g fill="#fff"><circle cx="50" cy="60" r="18"/><circle cx="72" cy="52" r="22"/><circle cx="96" cy="62" r="16"/><circle cx="210" cy="40" r="14"/><circle cx="230" cy="34" r="18"/><circle cx="250" cy="42" r="13"/></g>
      <path d="M150 140 v40" stroke="#334155" stroke-width="2"/><ellipse cx="150" cy="112" rx="26" ry="32" fill="#ec4899"/>
      <path d="M95 190 v40" stroke="#334155" stroke-width="2"/><ellipse cx="95" cy="164" rx="20" ry="25" fill="#facc15"/>
      <path d="M215 175 v40" stroke="#334155" stroke-width="2"/><ellipse cx="215" cy="150" rx="22" ry="27" fill="#10b981"/>
      <ellipse cx="142" cy="100" rx="6" ry="10" fill="#fff" fill-opacity=".5"/><ellipse cx="89" cy="155" rx="5" ry="8" fill="#fff" fill-opacity=".5"/><ellipse cx="208" cy="140" rx="5" ry="8" fill="#fff" fill-opacity=".5"/>
    </svg>`,
    // Jardim de flores
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
      <rect width="300" height="300" fill="#fef3c7"/>
      <circle cx="250" cy="55" r="32" fill="#fb923c"/>
      <path d="M0 200 q75 -40 150 0 t150 0 v100 h-300z" fill="#86efac"/>
      <path d="M0 235 q75 -30 150 0 t150 0 v65 h-300z" fill="#22c55e"/>
      <g stroke="#15803d" stroke-width="5"><path d="M60 290 v-110"/><path d="M150 290 v-140"/><path d="M240 290 v-100"/></g>
      <g fill="#ec4899"><circle cx="60" cy="160" r="16"/><circle cx="42" cy="178" r="16"/><circle cx="78" cy="178" r="16"/><circle cx="48" cy="198" r="16"/><circle cx="72" cy="198" r="16"/></g><circle cx="60" cy="183" r="11" fill="#fde047"/>
      <g fill="#a855f7"><circle cx="150" cy="122" r="20"/><circle cx="126" cy="144" r="20"/><circle cx="174" cy="144" r="20"/><circle cx="134" cy="170" r="20"/><circle cx="166" cy="170" r="20"/></g><circle cx="150" cy="150" r="14" fill="#fde047"/>
      <g fill="#ef4444"><circle cx="240" cy="168" r="15"/><circle cx="224" cy="184" r="15"/><circle cx="256" cy="184" r="15"/><circle cx="230" cy="202" r="15"/><circle cx="250" cy="202" r="15"/></g><circle cx="240" cy="188" r="10" fill="#fde047"/>
      <g fill="#1e293b"><ellipse cx="105" cy="70" rx="10" ry="7"/></g><g fill="#fff" fill-opacity=".8"><ellipse cx="99" cy="61" rx="7" ry="5"/><ellipse cx="111" cy="61" rx="7" ry="5"/></g>
      <path d="M95 70 h20" stroke="#facc15" stroke-width="3"/>
    </svg>`,
  ].map((svg) => `url("data:image/svg+xml,${encodeURIComponent(svg.replace(/\s+/g, ' '))}")`);

  const STAR_SVG = '<svg viewBox="0 0 24 24"><path d="M12 2.6l2.85 5.9 6.5.85-4.75 4.5 1.2 6.45L12 17.2l-5.8 3.1 1.2-6.45-4.75-4.5 6.5-.85z" fill="currentColor" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>';
  const icon = (id) => `<svg><use href="#i-${id}"/></svg>`;

  // ===== Armazenamento (pode falhar em modo privado) =====
  const store = {
    get(key, fallback) {
      try {
        const v = localStorage.getItem('memoria.' + key);
        return v == null ? fallback : JSON.parse(v);
      } catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem('memoria.' + key, JSON.stringify(value)); } catch { /* ignora */ }
    },
  };

  const settings = Object.assign(
    { tab: 'memory', level: 'facil', theme: 'animais', puzzle: 3, scene: -1, sound: true, numbers: true },
    store.get('settings', {})
  );
  const saveSettings = () => store.set('settings', settings);

  // ===== Utilidades =====
  const $ = (sel) => document.querySelector(sel);
  const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };
  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const vibrate = (p) => { try { navigator.vibrate && navigator.vibrate(p); } catch { /* ignora */ } };
  const currentMemLevel = () => MEM_LEVELS.find((l) => l.id === settings.level) || MEM_LEVELS[0];
  const currentTheme = () => THEMES.find((t) => t.id === settings.theme) || THEMES[0];
  const currentPuzLevel = () => PUZ_LEVELS.find((l) => l.n === settings.puzzle) || PUZ_LEVELS[0];

  // ===== Som (Web Audio, sem arquivos) =====
  let audio = null;
  function tone(freq, dur = 0.08, type = 'triangle', vol = 0.15, delay = 0) {
    if (!settings.sound) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === 'suspended') audio.resume();
      const t = audio.currentTime + delay;
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(gain).connect(audio.destination);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    } catch { /* sem áudio */ }
  }
  const sfx = {
    tap: () => tone(720, 0.04, 'sine', 0.08),
    flip: () => tone(560, 0.06),
    slide: () => tone(330, 0.05, 'sine', 0.12),
    match: () => { tone(660, 0.1); tone(990, 0.14, 'triangle', 0.15, 0.08); },
    miss: () => tone(180, 0.16, 'square', 0.06),
    win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'triangle', 0.16, i * 0.12)),
  };

  // ===== Telas =====
  const screens = { home: $('#home'), game: $('#game') };
  function show(name) {
    Object.entries(screens).forEach(([k, el]) => { el.hidden = k !== name; });
    window.scrollTo(0, 0);
  }

  const board = $('#board');
  const stage = $('#stage');
  const banner = $('#banner');
  let bannerTimer = 0;
  function flash(text, ms = 900) {
    clearTimeout(bannerTimer);
    banner.textContent = text;
    banner.hidden = false;
    banner.style.animation = 'none';
    void banner.offsetWidth; // reinicia a animação
    banner.style.animation = '';
    if (ms) bannerTimer = setTimeout(() => { banner.hidden = true; }, ms);
  }
  function hideBanner() { clearTimeout(bannerTimer); banner.hidden = true; }

  // ===== Cronômetro =====
  const timer = {
    elapsed: 0, startedAt: 0, running: false, id: 0,
    reset() { this.stop(); this.elapsed = 0; render.time(0); },
    start() {
      if (this.running) return;
      this.running = true;
      this.startedAt = performance.now();
      this.id = setInterval(() => render.time(this.seconds()), 250);
    },
    stop() {
      if (!this.running) return;
      this.elapsed += performance.now() - this.startedAt;
      this.running = false;
      clearInterval(this.id);
    },
    seconds() {
      const ms = this.elapsed + (this.running ? performance.now() - this.startedAt : 0);
      return Math.floor(ms / 1000);
    },
  };

  const render = {
    time: (s) => { $('#hudTime').textContent = fmtTime(s); },
    moves: (m) => { $('#hudMoves').textContent = m; },
    progress: (a, b) => {
      $('#hudPairs').textContent = `${a}/${b}`;
      $('#progressBar').style.width = `${b ? (a / b) * 100 : 0}%`;
    },
  };

  // ===== Estado da partida =====
  let game = null; // { mode: 'memory' | 'puzzle', ... }

  function stopGame() {
    timer.stop();
    hideBanner();
    setPaused(false);
    if (game && game.timeouts) game.timeouts.forEach(clearTimeout);
    game = null;
  }

  // ===== Pausa =====
  function setPaused(on) {
    const layer = $('#pauseLayer');
    if (on) {
      if (!game || game.done || game.paused) return;
      game.paused = true;
      timer.stop();
      togglePeek(false);
      board.classList.add('is-paused');
      $('#pauseInfo').textContent = `${fmtTime(timer.seconds())} · ${game.moves} ${game.mode === 'memory' ? 'jogadas' : 'movimentos'}`;
      layer.hidden = false;
    } else {
      board.classList.remove('is-paused');
      layer.hidden = true;
      if (game && game.paused) {
        game.paused = false;
        if (game.started && !game.done) timer.start();
      }
    }
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && game && game.started) setPaused(true);
  });

  // ===================================================================
  // Jogo da memória
  // ===================================================================
  function startMemory() {
    stopGame();
    const level = currentMemLevel();
    const theme = currentTheme();
    const pairs = (level.cols * level.rows) / 2;
    const symbols = shuffle(theme.items.slice()).slice(0, pairs);
    const deck = shuffle(symbols.flatMap((s) => [s, s]));

    game = {
      mode: 'memory', level, theme, pairs,
      moves: 0, found: 0, combo: 0,
      open: [], pending: null, locked: true, started: false, done: false, paused: false, timeouts: [],
      cards: [],
    };

    board.className = 'board board--memory';
    board.style.setProperty('--cols', level.cols);
    board.innerHTML = '';
    deck.forEach((symbol, i) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'card is-open';
      el.style.animationDelay = `${i * 22}ms`;
      el.setAttribute('aria-label', `Carta ${symbol}`);
      el.innerHTML = `<span class="card__inner"><span class="card__face card__back"></span><span class="card__face card__front">${symbol}</span></span>`;
      el.addEventListener('click', () => onCardTap(i));
      board.appendChild(el);
      game.cards.push({ symbol, el, matched: false });
    });

    $('#hudProgressLabel').textContent = 'Pares';
    $('#puzFoot').hidden = true;
    timer.reset();
    render.moves(0);
    render.progress(0, pairs);
    show('game');
    layout();

    // Mostra todas as cartas por alguns segundos para memorizar.
    const g = game;
    flash('Memorize! 👀', 0);
    g.timeouts.push(setTimeout(() => {
      if (game !== g) return;
      g.cards.forEach((c) => {
        c.el.classList.remove('is-open');
        c.el.setAttribute('aria-label', 'Carta virada');
      });
      sfx.flip();
      flash('Valendo! 🚀', 700);
      g.locked = false;
    }, 1600 + pairs * 140));
  }

  // Fecha o par errado que ainda está à mostra (menos `keep`, que continua aberta).
  function closePending(keep = null) {
    const g = game;
    if (!g.pending) return;
    clearTimeout(g.pending.timeout);
    g.pending.cards.forEach((c) => {
      c.el.classList.remove('is-wrong');
      if (c !== keep) {
        c.el.classList.remove('is-open');
        c.el.setAttribute('aria-label', 'Carta virada');
      }
    });
    g.pending = null;
  }

  function onCardTap(i) {
    const g = game;
    if (!g || g.mode !== 'memory' || g.locked || g.paused) return;
    const card = g.cards[i];
    if (card.matched || g.open.includes(card)) return;

    // Tocar numa nova carta fecha na hora o par errado anterior (jogo mais ágil).
    closePending(card);

    if (!g.started) { g.started = true; timer.start(); }

    card.el.classList.add('is-open');
    card.el.setAttribute('aria-label', `Carta ${card.symbol}`);
    sfx.flip();
    g.open.push(card);
    if (g.open.length < 2) return;

    const [a, b] = g.open;
    g.open = [];
    g.moves++;
    render.moves(g.moves);

    if (a.symbol === b.symbol) {
      a.matched = b.matched = true;
      g.found++;
      g.combo++;
      render.progress(g.found, g.pairs);
      g.timeouts.push(setTimeout(() => {
        a.el.classList.add('is-matched');
        b.el.classList.add('is-matched');
        sfx.match();
        vibrate(30);
        if (g.combo >= 2 && g.found < g.pairs) flash(`Combo x${g.combo}! 🔥`, 700);
      }, 250));
      if (g.found === g.pairs) {
        timer.stop();
        g.locked = true;
        g.done = true;
        g.timeouts.push(setTimeout(() => winMemory(g), 900));
      }
    } else {
      g.combo = 0;
      const pending = { cards: [a, b], timeout: 0 };
      g.pending = pending;
      pending.timeout = setTimeout(() => {
        a.el.classList.add('is-wrong');
        b.el.classList.add('is-wrong');
        sfx.miss();
        vibrate([20, 40, 20]);
        pending.timeout = setTimeout(() => { if (g.pending === pending) closePending(); }, 550);
      }, 350);
    }
  }

  function winMemory(g) {
    if (game !== g) return;
    const secs = timer.seconds();
    const stars = g.moves <= Math.ceil(g.pairs * 1.5) ? 3 : g.moves <= g.pairs * 2.2 ? 2 : 1;
    const key = `mem-${g.level.id}`;
    const isRecord = saveRecord(key, secs, g.moves);
    showWin({
      stars, secs, moves: g.moves, key, isRecord,
      title: stars === 3 ? 'Memória de elefante! 🐘' : stars === 2 ? 'Mandou bem!' : 'Conseguiu!',
      text: `Você encontrou os <b>${g.pairs} pares</b> do tema ${g.theme.label.toLowerCase()} no nível ${g.level.label.toLowerCase()}.`,
    });
  }

  // ===================================================================
  // Quebra-cabeça deslizante
  // ===================================================================
  function startPuzzle() {
    stopGame();
    const level = currentPuzLevel();
    const n = level.n;
    const sceneIndex = settings.scene >= 0 ? settings.scene : Math.floor(Math.random() * SCENES.length);
    const image = SCENES[sceneIndex];

    // Embaralha com movimentos válidos a partir da imagem montada (sempre tem solução).
    const grid = Array.from({ length: n * n }, (_, i) => (i + 1) % (n * n)); // 0 = espaço vazio
    let empty = n * n - 1;
    let last = -1;
    do {
      for (let k = 0; k < n * n * 25; k++) {
        const opts = neighbors(empty, n).filter((p) => p !== last);
        const pick = opts[Math.floor(Math.random() * opts.length)];
        grid[empty] = grid[pick];
        grid[pick] = 0;
        last = empty;
        empty = pick;
      }
    } while (isSolved(grid));

    game = {
      mode: 'puzzle', level, n, grid, image, sceneName: SCENE_NAMES[sceneIndex],
      moves: 0, started: false, locked: false, done: false, paused: false, timeouts: [], tiles: {},
    };

    board.className = 'board board--puzzle' + (settings.numbers ? '' : ' hide-numbers');
    board.style.setProperty('--n', n);
    board.innerHTML = '<div class="tiles"></div>';
    const wrap = board.firstChild;
    for (let id = 1; id < n * n; id++) {
      const home = id - 1;
      const hr = Math.floor(home / n);
      const hc = home % n;
      const el = document.createElement('div');
      el.className = 'tile';
      el.style.width = el.style.height = `${100 / n}%`;
      el.innerHTML = `<div class="tile__img"><span class="tile__num">${id}</span></div>`;
      const img = el.firstChild;
      img.style.backgroundImage = image;
      img.style.backgroundSize = `${n * 100}% ${n * 100}%`;
      img.style.backgroundPosition = `${(hc / (n - 1)) * 100}% ${(hr / (n - 1)) * 100}%`;
      el.addEventListener('pointerdown', (e) => { e.preventDefault(); onTileTap(id); });
      wrap.appendChild(el);
      game.tiles[id] = el;
    }
    placeTiles();

    $('#hudProgressLabel').textContent = 'No lugar';
    $('#puzFoot').hidden = false;
    $('[data-action="numbers"]').setAttribute('aria-pressed', String(settings.numbers));
    timer.reset();
    render.moves(0);
    show('game');
    layout();
  }

  function neighbors(pos, n) {
    const r = Math.floor(pos / n), c = pos % n, out = [];
    if (r > 0) out.push(pos - n);
    if (r < n - 1) out.push(pos + n);
    if (c > 0) out.push(pos - 1);
    if (c < n - 1) out.push(pos + 1);
    return out;
  }

  function isSolved(grid) {
    for (let i = 0; i < grid.length - 1; i++) if (grid[i] !== i + 1) return false;
    return true;
  }

  function placeTiles() {
    const { grid, n, tiles } = game;
    let home = 0;
    grid.forEach((id, pos) => {
      if (!id) return;
      const el = tiles[id];
      el.style.transform = `translate(${(pos % n) * 100}%, ${Math.floor(pos / n) * 100}%)`;
      const ok = pos === id - 1;
      el.classList.toggle('is-home', ok);
      if (ok) home++;
    });
    render.progress(home, n * n - 1);
  }

  function onTileTap(id) {
    const g = game;
    if (!g || g.mode !== 'puzzle' || g.locked || g.paused) return;
    const { grid, n } = g;
    const pos = grid.indexOf(id);
    const empty = grid.indexOf(0);
    const r = Math.floor(pos / n), c = pos % n;
    const er = Math.floor(empty / n), ec = empty % n;
    if (r !== er && c !== ec) { vibrate(10); return; }

    // Desliza todas as peças entre a tocada e o espaço vazio (linha ou coluna).
    const step = r === er ? (c < ec ? -1 : 1) : (r < er ? -n : n);
    let cur = empty;
    while (cur !== pos) {
      grid[cur] = grid[cur + step];
      cur += step;
    }
    grid[pos] = 0;

    if (!g.started) { g.started = true; timer.start(); }
    g.moves++;
    render.moves(g.moves);
    sfx.slide();
    placeTiles();

    if (isSolved(grid)) {
      g.locked = true;
      g.done = true;
      timer.stop();
      g.timeouts.push(setTimeout(() => {
        board.classList.add('is-solved');
        sfx.match();
      }, 200));
      g.timeouts.push(setTimeout(() => winPuzzle(g), 1200));
    }
  }

  function winPuzzle(g) {
    if (game !== g) return;
    const secs = timer.seconds();
    const [s3, s2] = g.level.stars;
    const stars = secs <= s3 ? 3 : secs <= s2 ? 2 : 1;
    const key = `puz-${g.n}`;
    const isRecord = saveRecord(key, secs, g.moves);
    showWin({
      stars, secs, moves: g.moves, key, isRecord,
      title: stars === 3 ? 'Mestre do quebra-cabeça! 🧩' : stars === 2 ? 'Mandou bem!' : 'Conseguiu!',
      text: `Você montou a imagem <b>${g.sceneName}</b> no tabuleiro ${g.level.label}.`,
    });
  }

  let peekEl = null;
  function togglePeek(force) {
    const on = force ?? !peekEl;
    if (on && game && game.mode === 'puzzle' && !peekEl) {
      peekEl = document.createElement('div');
      peekEl.className = 'peek';
      peekEl.style.backgroundImage = game.image;
      peekEl.addEventListener('pointerdown', () => togglePeek(false));
      board.appendChild(peekEl);
    } else if (!on && peekEl) {
      peekEl.remove();
      peekEl = null;
    }
    $('[data-action="peek"]').setAttribute('aria-pressed', String(!!peekEl));
  }

  // ===================================================================
  // Tamanho do tabuleiro conforme a tela
  // ===================================================================
  function layout() {
    if (!game) return;
    const cs = getComputedStyle(stage);
    const W = Math.min(stage.clientWidth, 560);
    const H = stage.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    if (game.mode === 'memory') {
      const { cols, rows } = game.level;
      const gap = W < 400 ? 8 : 12;
      const ratio = 0.76; // largura / altura da carta
      let w = (W - gap * (cols - 1)) / cols;
      w = Math.min(w, ((H - gap * (rows - 1)) / rows) * ratio, 120);
      board.style.setProperty('--gap', `${gap}px`);
      board.style.setProperty('--card-w', `${Math.floor(w)}px`);
      board.style.setProperty('--card-h', `${Math.floor(w / ratio)}px`);
    } else {
      board.style.setProperty('--size', `${Math.floor(Math.min(W, H, 520))}px`);
    }
  }
  window.addEventListener('resize', layout);

  // ===================================================================
  // Vitória, recordes e confete
  // ===================================================================
  function showWin({ stars, title, text, secs, moves, key, isRecord }) {
    const best = store.get('records', {})[key];
    $('#winStars').innerHTML = [1, 2, 3].map((i) => STAR_SVG.replace('<svg', `<svg class="${i <= stars ? 'on' : 'off'}"`)).join('');
    $('#winTitle').textContent = title;
    $('#winText').innerHTML = text;
    $('#winTime').textContent = fmtTime(secs);
    $('#winMoves').textContent = moves;
    $('#winBest').textContent = best ? fmtTime(best.time) : '—';
    $('#winRecord').hidden = !isRecord;
    $('#winModal').hidden = false;
    sfx.win();
    vibrate([40, 60, 40, 60, 120]);
    confetti();
  }

  function saveRecord(key, secs, moves) {
    const all = store.get('records', {});
    const prev = all[key];
    const better = !prev || secs < prev.time || (secs === prev.time && moves < prev.moves);
    all[key] = {
      time: prev ? Math.min(prev.time, secs) : secs,
      moves: prev ? Math.min(prev.moves, moves) : moves,
      wins: (prev ? prev.wins || 0 : 0) + 1,
    };
    store.set('records', all);
    return better && !!prev; // a primeira vitória não conta como "novo recorde"
  }

  function showRecords() {
    const all = store.get('records', {});
    const row = (label, r) => `<div class="records__row"><span>${label}</span><span>${
      r ? `<b>${fmtTime(r.time)}</b> · ${r.moves} jogadas · ${r.wins} ${r.wins === 1 ? 'vitória' : 'vitórias'}` : 'Ainda não jogado'
    }</span></div>`;
    $('#recordsList').innerHTML =
      `<h3>${icon('cards')}Memória</h3>` + MEM_LEVELS.map((l) => row(l.label, all[`mem-${l.id}`])).join('') +
      `<h3>${icon('puzzle')}Quebra-cabeça</h3>` + PUZ_LEVELS.map((l) => row(l.label, all[`puz-${l.n}`])).join('');
    $('#recordsModal').hidden = false;
  }

  function confetti() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = $('#confetti');
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const colors = ['#ffbf47', '#3fe0b8', '#ff6f7d', '#7d6bff', '#ffffff'];
    const parts = Array.from({ length: 160 }, () => ({
      x: innerWidth / 2 + (Math.random() - 0.5) * 80,
      y: innerHeight * 0.4,
      vx: (Math.random() - 0.5) * 13,
      vy: -Math.random() * 13 - 4,
      s: Math.random() * 6 + 5,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      c: colors[Math.floor(Math.random() * colors.length)],
      round: Math.random() < 0.3,
    }));
    const end = performance.now() + 3200;
    (function frame(now) {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      parts.forEach((p) => {
        p.vy += 0.3;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.c;
        if (p.round) { ctx.beginPath(); ctx.arc(0, 0, p.s / 3, 0, Math.PI * 2); ctx.fill(); }
        else ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
        ctx.restore();
      });
      if (now < end) requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, innerWidth, innerHeight);
    })(performance.now());
  }

  // ===================================================================
  // Tela inicial
  // ===================================================================
  function options(container, cls, items, isOn, onPick) {
    container.innerHTML = '';
    items.forEach((item) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = cls;
      b.setAttribute('role', 'radio');
      b.innerHTML = item.html;
      b.setAttribute('aria-checked', String(isOn(item)));
      b.addEventListener('click', () => {
        onPick(item);
        saveSettings();
        container.querySelectorAll('[role="radio"]').forEach((c, i) => c.setAttribute('aria-checked', String(isOn(items[i]))));
        sfx.tap();
        renderHome();
      });
      container.appendChild(b);
    });
  }

  options($('#memLevels'), 'seg__opt',
    MEM_LEVELS.map((l) => ({ ...l, html: `${l.label}<small>${(l.cols * l.rows) / 2} pares</small>` })),
    (l) => l.id === settings.level, (l) => { settings.level = l.id; });
  options($('#memThemes'), 'pick',
    THEMES.map((t) => ({ ...t, html: `<span class="pick__art">${t.items[0]}</span>${t.label}` })),
    (t) => t.id === settings.theme, (t) => { settings.theme = t.id; });
  options($('#puzLevels'), 'seg__opt',
    PUZ_LEVELS.map((l) => ({ ...l, html: `${l.label}<small>${l.sub}</small>` })),
    (l) => l.n === settings.puzzle, (l) => { settings.puzzle = l.n; });
  options($('#puzScenes'), 'pick',
    [{ i: -1, html: '<span class="pick__art">🎲</span>Surpresa' }].concat(
      SCENES.map((img, i) => ({ i, html: `<span class="pick__art" style="background-image:${img.replace(/"/g, "'")}"></span>${SCENE_NAMES[i]}` }))
    ),
    (s) => s.i === settings.scene, (s) => { settings.scene = s.i; });

  let lastFanTheme = null;
  let lastPreview = null;
  function renderHome() {
    const tab = settings.tab === 'puzzle' ? 'puzzle' : 'memory';
    document.body.dataset.tab = tab;
    $('#tabMemory').setAttribute('aria-selected', String(tab === 'memory'));
    $('#tabPuzzle').setAttribute('aria-selected', String(tab === 'puzzle'));
    $('#panelMemory').hidden = tab !== 'memory';
    $('#panelPuzzle').hidden = tab !== 'puzzle';
    $('#playLabel').textContent = tab === 'memory' ? 'Jogar memória' : 'Jogar quebra-cabeça';

    // Leque de cartas com o tema escolhido.
    const theme = currentTheme();
    if (lastFanTheme !== theme.id) {
      lastFanTheme = theme.id;
      $('#memFan').innerHTML = `<span class="fan__card">${theme.items[0]}</span><span class="fan__card fan__card--back"></span><span class="fan__card">${theme.items[0]}</span>`;
    }

    // Miniatura do quebra-cabeça.
    const previewKey = settings.scene;
    if (lastPreview !== previewKey) {
      lastPreview = previewKey;
      const prev = $('#puzPreview');
      if (settings.scene < 0) {
        prev.className = 'mini-puzzle is-surprise';
        prev.innerHTML = SCENES.map((img, i) => `<i style="background-image:${img.replace(/"/g, "'")};animation-delay:${i * 60}ms"></i>`).join('');
      } else {
        const img = SCENES[settings.scene].replace(/"/g, "'");
        const order = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        prev.className = 'mini-puzzle';
        prev.innerHTML = order.map((p, k) => (p === 8
          ? '<i class="empty"></i>'
          : `<i style="background-image:${img};background-position:${(p % 3) * 50}% ${Math.floor(p / 3) * 50}%;animation-delay:${k * 40}ms"></i>`)).join('');
      }
    }

    // Recorde do nível escolhido.
    const all = store.get('records', {});
    const best = (r) => (r
      ? `${icon('trophy')}Seu recorde: <strong>${fmtTime(r.time)}</strong> · <strong>${r.moves}</strong> jogadas`
      : `${icon('trophy')}Sem recorde neste nível ainda. Que tal agora?`);
    $('#memBest').innerHTML = best(all[`mem-${settings.level}`]);
    $('#puzBest').innerHTML = best(all[`puz-${settings.puzzle}`]);
  }

  function renderSound() {
    const b = $('[data-action="sound"]');
    b.innerHTML = icon(settings.sound ? 'sound' : 'mute');
    b.setAttribute('aria-label', settings.sound ? 'Som ligado' : 'Som desligado');
  }

  document.querySelectorAll('.tab').forEach((t) => t.addEventListener('click', () => {
    if (settings.tab === t.dataset.tab) return;
    settings.tab = t.dataset.tab;
    saveSettings();
    sfx.tap();
    renderHome();
  }));

  renderSound();
  renderHome();

  // ===================================================================
  // Navegação (o botão "voltar" do celular volta ao menu)
  // ===================================================================
  function enterGame(start) {
    $('#winModal').hidden = true;
    togglePeek(false);
    if (!history.state || !history.state.inGame) history.pushState({ inGame: true }, '');
    start();
  }
  function goHome() {
    if (history.state && history.state.inGame) { history.back(); return; }
    leaveGame();
  }
  function leaveGame() {
    stopGame();
    togglePeek(false);
    $('#winModal').hidden = true;
    renderHome();
    show('home');
  }
  window.addEventListener('popstate', () => {
    if (!screens.game.hidden) leaveGame();
  });

  let lastMode = 'memory';
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    switch (btn.dataset.action) {
      case 'play':
        lastMode = settings.tab === 'puzzle' ? 'puzzle' : 'memory';
        enterGame(lastMode === 'puzzle' ? startPuzzle : startMemory);
        break;
      case 'restart':
        if (game) lastMode = game.mode;
        enterGame(lastMode === 'puzzle' ? startPuzzle : startMemory);
        break;
      case 'home': goHome(); break;
      case 'pause': setPaused(true); break;
      case 'resume': setPaused(false); break;
      case 'sound': settings.sound = !settings.sound; saveSettings(); renderSound(); sfx.tap(); break;
      case 'peek': togglePeek(); break;
      case 'numbers':
        settings.numbers = !settings.numbers;
        saveSettings();
        board.classList.toggle('hide-numbers', !settings.numbers);
        btn.setAttribute('aria-pressed', String(settings.numbers));
        break;
      case 'records': showRecords(); break;
      case 'close-modal': $('#recordsModal').hidden = true; break;
    }
  });

  $('#recordsModal').addEventListener('click', (e) => {
    if (e.target.id === 'recordsModal') e.currentTarget.hidden = true;
  });

  // Funciona offline / instalável.
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
})();
