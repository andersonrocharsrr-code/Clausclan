/* Rádio: um voo de treino do hangar ao pouso falando com o Solo e a Torre, no padrão da fraseologia
   do DECEA (em português) e da OACI (em inglês). Aeródromo e frequências são fictícios. */
(() => {
'use strict';
const $ = (s) => document.querySelector(s);
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- O voo ----------
   atc: fala do controle. pil: fala do piloto; com "op" vira escolha (a primeira opção é a certa, a ordem é sorteada). */
const FASES = ['Táxi', 'Decolagem', 'Circuito', 'Pouso'];
const VOO = [
  { quem: 'pil', fase: 0, freq: 'SOLO 121.9', op: [
    { pt: 'Solo Hangar, PR-HGE, Cessna 172 no hangar 3, voo local visual, solicita instruções para táxi.', en: 'Hangar Ground, PR-HGE, Cessna 172 at hangar 3, local VFR flight, request taxi.',
      por: 'Chamada inicial completa: a estação que você chama, o seu indicativo, onde você está e o que quer.' },
    { pt: 'Oi, Solo, aqui é o PR-HGE. Já posso ir para a pista?', en: 'Hi Ground, this is PR-HGE. Can I go to the runway now?',
      por: 'No rádio não se conversa de forma informal. A chamada segue a ordem: estação chamada, indicativo, posição e pedido.' },
    { pt: 'PR-HGE solicita táxi.', en: 'PR-HGE, request taxi.',
      por: 'Faltou chamar a estação (Solo Hangar) e dizer onde você está. Sem a posição, o Solo não sabe por onde mandar você.' },
  ] },
  { quem: 'atc', fase: 0, freq: 'SOLO 121.9',
    pt: 'PR-HGE, Solo Hangar, pista 27, vento 260 graus, 8 nós, ajuste 1017, táxi para o ponto de espera da pista 27 via Alfa, transponder 4521.',
    fpt: 'Papa Romeo Hotel Golf Echo, Solo Hangar, pista dois sete, vento dois meia zero graus, oito nós, ajuste uno zero uno sete, táxi para o ponto de espera da pista dois sete via Alfa, transponder quatro cinco dois uno.',
    en: 'PR-HGE, Hangar Ground, runway 27, wind 260 degrees 8 knots, QNH 1017, taxi to holding point runway 27 via Alpha, squawk 4521.',
    fen: 'Papa Romeo Hotel Golf Echo, Hangar Ground, runway two seven, wind two six zero degrees eight knots, QNH one zero one seven, taxi to holding point runway two seven via Alpha, squawk four five two one.' },
  { quem: 'pil', fase: 0, freq: 'SOLO 121.9', op: [
    { pt: 'Pista 27, ajuste 1017, táxi para o ponto de espera da pista 27 via Alfa, transponder 4521, PR-HGE.', en: 'Runway 27, QNH 1017, taxi to holding point runway 27 via Alpha, squawk 4521, PR-HGE.',
      por: 'Cotejamento certo: pista, ajuste do altímetro, rota de táxi e código do transponder voltam para o Solo. O vento não precisa ser repetido.' },
    { pt: 'Ciente, PR-HGE.', en: 'Roger, PR-HGE.',
      por: '"Ciente" não basta. Instrução de táxi, pista, ajuste do altímetro e código do transponder sempre têm de ser cotejados, ou seja, repetidos.' },
    { pt: 'Pista 27, táxi via Alfa, PR-HGE.', en: 'Runway 27, taxi via Alpha, PR-HGE.',
      por: 'Faltaram o ajuste do altímetro (1017) e o código do transponder (4521). Os dois sempre se repetem.' },
  ] },
  { quem: 'atc', fase: 0, freq: 'SOLO 121.9', pt: 'PR-HGE, chame a Torre Hangar em 118.1.', fpt: 'Papa Romeo Hotel Golf Echo, chame a Torre Hangar em uno uno oito decimal uno.',
    en: 'PR-HGE, contact Hangar Tower 118.1.', fen: 'Papa Romeo Hotel Golf Echo, contact Hangar Tower one one eight decimal one.' },
  { quem: 'pil', fase: 0, freq: 'SOLO 121.9', pt: 'Torre 118.1, PR-HGE.', en: 'Tower 118.1, PR-HGE.' },

  { quem: 'pil', fase: 1, freq: 'TORRE 118.1', op: [
    { pt: 'Torre Hangar, PR-HGE, no ponto de espera da pista 27, pronto para decolagem.', en: 'Hangar Tower, PR-HGE, holding point runway 27, ready for departure.',
      por: 'Você diz onde está e que está pronto. Quem decide a hora de entrar na pista é a Torre.' },
    { pt: 'Torre Hangar, PR-HGE, entrando na pista 27 para decolar.', en: 'Hangar Tower, PR-HGE, entering runway 27 for takeoff.',
      por: 'Nunca entre na pista sem autorização. Entrar por conta própria é incursão em pista, uma das maiores causas de acidente no solo.' },
    { pt: 'Torre Hangar, PR-HGE, pronto.', en: 'Hangar Tower, PR-HGE, ready.',
      por: 'Pronto onde? Faltou a posição: no ponto de espera da pista 27.' },
  ] },
  { quem: 'atc', fase: 1, freq: 'TORRE 118.1', pt: 'PR-HGE, pista 27, vento 250 graus, 7 nós, autorizado decolar.',
    fpt: 'Papa Romeo Hotel Golf Echo, pista dois sete, vento dois cinco zero graus, sete nós, autorizado decolar.',
    en: 'PR-HGE, runway 27, wind 250 degrees 7 knots, cleared for takeoff.', fen: 'Papa Romeo Hotel Golf Echo, runway two seven, wind two five zero degrees seven knots, cleared for takeoff.' },
  { quem: 'pil', fase: 1, freq: 'TORRE 118.1', op: [
    { pt: 'Autorizado decolar pista 27, PR-HGE.', en: 'Cleared for takeoff runway 27, PR-HGE.',
      por: 'Autorização de decolagem se coteja sempre junto com a pista. Assim ninguém decola da pista errada.' },
    { pt: 'Decolando, PR-HGE.', en: 'Taking off, PR-HGE.',
      por: 'Faltaram a autorização e a pista. Repetir a pista é a última barreira contra decolar da pista errada.' },
    { pt: 'Ciente, PR-HGE.', en: 'Roger, PR-HGE.',
      por: 'Autorização para entrar, decolar ou pousar numa pista nunca se responde só com "ciente": repita a autorização e a pista.' },
  ] },

  { quem: 'pil', fase: 2, freq: 'TORRE 118.1', op: [
    { pt: 'Torre Hangar, PR-HGE, perna do vento, pista 27.', en: 'Hangar Tower, PR-HGE, downwind runway 27.',
      por: 'Reporte de posição no circuito: indicativo, a perna em que você está e a pista.' },
    { pt: 'Torre Hangar, PR-HGE, voando paralelo à pista.', en: 'Hangar Tower, PR-HGE, flying parallel to the runway.',
      por: 'Use o nome da perna: perna do vento. Assim a Torre e os outros aviões do circuito sabem exatamente onde você está.' },
    { pt: 'Torre Hangar, PR-HGE, na final, pista 27.', en: 'Hangar Tower, PR-HGE, final runway 27.',
      por: 'Posição errada: você está na perna do vento. Ainda faltam a perna base e a final.' },
  ] },
  { quem: 'atc', fase: 2, freq: 'TORRE 118.1', pt: 'PR-HGE, reporte na perna base.', fpt: 'Papa Romeo Hotel Golf Echo, reporte na perna base.',
    en: 'PR-HGE, report base.', fen: 'Papa Romeo Hotel Golf Echo, report base.' },
  { quem: 'pil', fase: 2, freq: 'TORRE 118.1', pt: 'Ciente, PR-HGE.', en: 'Wilco, PR-HGE.' },
  { quem: 'pil', fase: 2, freq: 'TORRE 118.1', op: [
    { pt: 'PR-HGE, perna base, pista 27.', en: 'PR-HGE, base runway 27.',
      por: 'Reporte certo. Na perna base a Torre confere a sequência e libera o pouso.' },
    { pt: 'PR-HGE, curvando.', en: 'PR-HGE, turning.',
      por: 'Curvando para onde? Diga a posição: perna base, pista 27.' },
    { pt: 'PR-HGE, perna base. Posso pousar?', en: 'PR-HGE, base. Can I land?',
      por: 'Não se pede pouso em forma de pergunta. Reporte a posição; a autorização de pouso vem da Torre.' },
  ] },

  { quem: 'atc', fase: 3, freq: 'TORRE 118.1', pt: 'PR-HGE, pista 27, vento 260 graus, 8 nós, autorizado pouso.',
    fpt: 'Papa Romeo Hotel Golf Echo, pista dois sete, vento dois meia zero graus, oito nós, autorizado pouso.',
    en: 'PR-HGE, runway 27, wind 260 degrees 8 knots, cleared to land.', fen: 'Papa Romeo Hotel Golf Echo, runway two seven, wind two six zero degrees eight knots, cleared to land.' },
  { quem: 'pil', fase: 3, freq: 'TORRE 118.1', op: [
    { pt: 'Autorizado pouso pista 27, PR-HGE.', en: 'Cleared to land runway 27, PR-HGE.',
      por: 'Igual à decolagem: repita a autorização e a pista.' },
    { pt: 'Pousando, PR-HGE.', en: 'Landing, PR-HGE.',
      por: 'Faltaram a autorização e a pista.' },
    { pt: 'Pista 27, PR-HGE.', en: 'Runway 27, PR-HGE.',
      por: 'Faltou mostrar que você entendeu a autorização: "autorizado pouso".' },
  ] },
  { quem: 'atc', fase: 3, freq: 'TORRE 118.1', pt: 'PR-HGE, livre a pista pela próxima à direita e chame o Solo em 121.9.',
    fpt: 'Papa Romeo Hotel Golf Echo, livre a pista pela próxima à direita e chame o Solo em uno dois uno decimal nove.',
    en: 'PR-HGE, vacate right at the next taxiway, contact Ground 121.9.', fen: 'Papa Romeo Hotel Golf Echo, vacate right at the next taxiway, contact Ground one two one decimal niner.' },
  { quem: 'pil', fase: 3, freq: 'TORRE 118.1', op: [
    { pt: 'Livrando à direita, Solo 121.9, PR-HGE.', en: 'Vacating right, Ground 121.9, PR-HGE.',
      por: 'Troca de frequência sempre se coteja com o número. Assim você não se perde no rádio.' },
    { pt: 'Ciente, PR-HGE.', en: 'Roger, PR-HGE.',
      por: 'Faltou repetir a frequência nova. Se você errar a frequência, ninguém mais escuta você.' },
    { pt: 'Livrando à direita, Solo 112.9, PR-HGE.', en: 'Vacating right, Ground 112.9, PR-HGE.',
      por: 'A frequência foi repetida errada: é 121.9, não 112.9. O cotejamento existe para pegar esse tipo de erro.' },
  ] },
];

/* ---------- Alfabeto e números ---------- */
const ALFA = [['A', 'Alfa', 'ÁL-fa'], ['B', 'Bravo', 'BRA-vo'], ['C', 'Charlie', 'TCHAR-li'], ['D', 'Delta', 'DÉL-ta'], ['E', 'Echo', 'É-co'], ['F', 'Foxtrot', 'FÓKS-trot'],
  ['G', 'Golf', 'GÓLF'], ['H', 'Hotel', 'rô-TÉL'], ['I', 'India', 'ÍN-dia'], ['J', 'Juliett', 'DJÚ-li-ét'], ['K', 'Kilo', 'QUÍ-lo'], ['L', 'Lima', 'LÍ-ma'], ['M', 'Mike', 'MÁIK'],
  ['N', 'November', 'no-VÉM-ber'], ['O', 'Oscar', 'ÓS-car'], ['P', 'Papa', 'pa-PÁ'], ['Q', 'Quebec', 'que-BÉK'], ['R', 'Romeo', 'RÔ-mi-o'], ['S', 'Sierra', 'si-É-ra'],
  ['T', 'Tango', 'TÂN-go'], ['U', 'Uniform', 'IÚ-ni-form'], ['V', 'Victor', 'VÍC-tor'], ['W', 'Whiskey', 'UÍS-qui'], ['X', 'X-ray', 'ÉKS-rei'], ['Y', 'Yankee', 'IÂN-qui'], ['Z', 'Zulu', 'ZÚ-lu']];
const NUM_PT = ['zero', 'uno', 'dois', 'três', 'quatro', 'cinco', 'meia', 'sete', 'oito', 'nove'];
const NUM_EN = ['zero', 'one', 'two', 'tree', 'four', 'fife', 'six', 'seven', 'eight', 'niner'];

/* ---------- Estado ---------- */
let lang = 'pt', passo = 0, erros = 0, escolhas = 0, timer = 0, voz = false;

function canSpeak() { try { return !!window.speechSynthesis && speechSynthesis.getVoices().length > 0; } catch { return false; } }
function falar(txt) {
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(txt);
    u.lang = lang === 'pt' ? 'pt-BR' : 'en-US'; u.rate = 1.05;
    const v = speechSynthesis.getVoices().find((x) => x.lang.replace('_', '-').startsWith(u.lang.slice(0, 2)));
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  } catch {}
}

function msg(l, extra = '') {
  const atc = l.quem === 'atc', txt = l[lang], fala = atc ? l[lang === 'pt' ? 'fpt' : 'fen'] : '';
  const d = document.createElement('div');
  d.className = `rd-msg rd-msg--${atc ? 'atc' : 'pil'}`;
  d.innerHTML = `<span class="rd-msg__who">${atc ? esc(l.freq.split(' ')[0]) : 'Você'} <i>${esc(l.freq.split(' ')[1])}</i></span>`
    + `<p>${esc(txt)}</p>`
    + (fala ? `<span class="rd-msg__fala">Fala: ${esc(fala)}</span>` : '')
    + (atc && voz ? '<button type="button" class="rd-msg__play">Ouvir</button>' : '') + extra;
  d.querySelector('.rd-msg__play')?.addEventListener('click', () => falar(fala));
  const log = $('#rdLog');
  log.appendChild(d);
  log.scrollTop = log.scrollHeight;
}

function fases(f) {
  $('#rdFases').innerHTML = FASES.map((n, i) => `<li class="${i < f ? 'is-done' : i === f ? 'is-now' : ''}">${n}</li>`).join('');
}

function avancar() {
  clearTimeout(timer);
  const opts = $('#rdOpts');
  opts.innerHTML = '';
  if (passo >= VOO.length) return fim();
  const l = VOO[passo];
  fases(l.fase);
  if (!l.op) {
    timer = setTimeout(() => { msg(l); passo++; avancar(); }, l.quem === 'atc' ? 700 : 450);
    return;
  }
  // Vez do piloto: três frases, uma certa
  const ord = l.op.map((o, i) => ({ o, i })).sort(() => Math.random() - 0.5);
  let errou = false;
  opts.innerHTML = '<span class="label">Sua vez: o que você responde?</span>';
  ord.forEach(({ o, i }) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'rd-opt'; b.textContent = o[lang];
    b.addEventListener('click', () => {
      if (i === 0) {
        escolhas++; if (errou) erros++;
        msg({ quem: 'pil', freq: l.freq, pt: o.pt, en: o.en }, `<span class="rd-msg__ok">${esc(o.por)}</span>`);
        passo++; avancar();
      } else {
        errou = true;
        b.disabled = true; b.classList.add('is-wrong');
        $('#rdFb').hidden = false;
        $('#rdFb').innerHTML = `<b>Não é bem assim.</b> ${esc(o.por)}`;
      }
    });
    opts.appendChild(b);
  });
  $('#rdFb').hidden = true;
}

function fim() {
  fases(FASES.length);
  const certas = escolhas - erros;
  $('#rdOpts').innerHTML = `<div class="rd-end"><b>Voo concluído.</b> Você acertou de primeira ${certas} de ${escolhas} respostas.`
    + (erros ? ' Repita o voo até acertar todas: a fraseologia vira hábito com a repetição.' : ' Fraseologia de piloto de verdade!') + '</div>';
  $('#rdFb').hidden = true;
}

function reiniciar() {
  clearTimeout(timer);
  try { speechSynthesis?.cancel(); } catch {}
  passo = 0; erros = 0; escolhas = 0;
  $('#rdLog').innerHTML = '<p class="rd-note">Você está no Cessna 172 PR-HGE, no hangar 3, com o motor ligado e o rádio no Solo em 121.9. Chame o Solo para pedir o táxi.</p>';
  avancar();
}

/* ---------- Soletrar ---------- */
function soletrar() {
  const s = $('#rdSpell').value.toUpperCase();
  const nums = lang === 'pt' ? NUM_PT : NUM_EN;
  const out = [];
  for (const ch of s) {
    const a = ALFA.find((x) => x[0] === ch);
    if (a) out.push(a[1]);
    else if (/[0-9]/.test(ch)) out.push(nums[+ch]);
    else if (ch === '.' || ch === ',') out.push('decimal');
  }
  $('#rdSpellOut').textContent = out.length ? out.join(' ') : '…';
}

function tabelas() {
  $('#rdAlfa').innerHTML = ALFA.map(([l, w, p]) => `<div><b>${l}</b><span>${w}</span><i>${p}</i></div>`).join('');
  $('#rdNums').innerHTML = NUM_PT.map((n, i) => `<div><b>${i}</b><span>${n}</span><i>${NUM_EN[i]}</i></div>`).join('');
}

function setLang(l) {
  lang = l;
  document.querySelectorAll('#rdLang [data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === l)));
  soletrar();
  reiniciar();
}

let pronto = false;
function init() {
  if (!$('#rdLog')) return;
  tabelas();
  $('#rdLang').addEventListener('click', (e) => { const b = e.target.closest('[data-lang]'); if (b && b.dataset.lang !== lang) setLang(b.dataset.lang); });
  $('#rdAgain').addEventListener('click', reiniciar);
  $('#rdSpell').addEventListener('input', soletrar);
  voz = canSpeak();
  try { speechSynthesis?.addEventListener?.('voiceschanged', () => { voz = canSpeak(); }); } catch {}
  soletrar();
}
// Começa o voo quando a aba abre (e não reinicia se você voltar para ela no meio)
function start() {
  if (!pronto) { pronto = true; reiniciar(); }
}
window.Radio = { init, start };
})();
