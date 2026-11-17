# Linha do tempo: cortes das cenas presos às frases da narração (palavras.json) + legendas. Uso: python3 tempos.py <pasta com nar/>
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from narracao import FALAS
import soundfile as sf
PASTA = sys.argv[1]
GAP = {'a': 3.0, 'b': 3.4, 'c': 1.5, 'd': 3.4, 'e': 1.5, 'f': 1.5, 'g': 3.4, 'h': 1.5, 'i': 3.4, 'j': 1.5, 'k': 3.4, 'l': 2.0}
PAL = json.load(open('palavras.json'))
NARS, NARD = {}, {}; t = 0
for k in FALAS:
    t += GAP[k]; NARS[k] = round(t, 2); d, sr = sf.read(f'{PASTA}/nar/{k}.wav'); NARD[k] = round(len(d) / sr, 2); t += NARD[k]
DUR = round(max(t + 4.5, 300.0), 1)
norm = lambda w: re.sub(r'[^\wÀ-ÿȘșȚțĂă-]', '', w).lower()
def T(k, txt):
    alvo = [norm(w) for w in txt.split()]; ws = PAL[k]
    for i in range(len(ws) - len(alvo) + 1):
        if all(norm(ws[i + j][0]) == alvo[j] for j in range(len(alvo))): return round(NARS[k] + ws[i][1] - .15, 2)
    raise SystemExit(f'frase não achada: {k} {txt}')
CARD = lambda k: round(NARS[k] - 1.2, 2); ANTES = lambda k: round(NARS[k] - .6, 2)
CUTS = [0, T('a', 'Foi aqui'), T('a', 'Mas, antes'),
  CARD('b'), T('b', 'O pai'), T('b', 'Por isso'),
  ANTES('c'), T('c', 'Passaram anos'), T('c', 'Radu se adaptou'),
  CARD('d'), T('d', 'e governou'), T('d', 'Para punir'), T('d', 'Por isso'),
  ANTES('e'), T('e', 'Vlad atacou'), T('e', 'Dias depois'), T('e', 'O sultão recuou'),
  ANTES('f'), T('f', 'Morreu lutando'), T('f', 'Onde foi'),
  CARD('g'), T('g', 'À noite'), T('g', 'Em 1890'), T('g', 'Ali leu'),
  ANTES('h'), T('h', 'Passou anos'), T('h', 'Em 1897'),
  CARD('i'), T('i', 'O anfitrião'), T('i', 'não aparece'), T('i', 'e desce'), T('i', 'De dia'), T('i', 'À noite'),
  ANTES('j'), T('j', 'Para enfrentá-lo'), T('j', 'O conde só'),
  CARD('k'), T('k', 'O cinema'), T('k', 'a capa'), T('k', 'os dentes'), T('k', 'Hoje'), T('k', 'A fortaleza'),
  ANTES('l'), T('l', 'Mas o filho'), T('l', 'Enquanto houver'), DUR]
DESTAQUE = {'transilvânia', 'vampiro', 'osso', 'sighișoara', 'dragão', 'drăculea', 'reféns', 'ódio', 'valáquia', 'estaca', 'empalador', 'mehmed', 'noite',
            'estacas', 'recuou', 'hungria', 'ninguém', 'stoker', 'whitby', 'diabo', 'nome', 'transilvânia', 'drácula', 'cárpatos', 'espelho', 'lagarto', 'caixão',
            'névoa', 'tempestade', 'helsing', 'castelo', 'vlad', 'nosferatu', 'lugosi', 'lee', 'bran', 'poenari', 'quinhentos', 'lua', 'vivo', 'teatro', 'crueldade', 'diários'}
leg = []
for k in FALAS:
    fr, usado = [], False
    def fecha():
        global fr, usado
        if fr: leg.append({'t0': round(fr[0][1] - .1, 2), 't1': round(fr[-1][3] + .45, 2), 'w': [[w, a, h] for w, a, h, _ in fr]}); fr = []; usado = False
    for w, a, b in PAL[k]:
        nu = norm(w); h = 1 if nu in DESTAQUE and not usado else 0; usado = usado or bool(h)
        fr.append([w.upper(), round(NARS[k] + a, 2), h, NARS[k] + b]); n = len(fr); ch = sum(len(x[0]) + 1 for x in fr)
        if w[-1] in '.:?' or (w[-1] in ',;' and (n >= 4 or ch > 34)) or ch > 72: fecha()
    fecha()
for i in range(len(leg) - 1): leg[i]['t1'] = min(leg[i]['t1'], leg[i + 1]['t0'])
open('tempos.js', 'w').write('// gerado por tempos.py\n' + f'const NARS = {json.dumps(NARS)};\nconst CUTS = {json.dumps(CUTS)};\nconst DUR = {DUR};\nconst LEG = {json.dumps(leg, ensure_ascii=False)};\n')
json.dump({'NARS': NARS, 'NARD': NARD, 'CUTS': CUTS, 'DUR': DUR}, open('tempos.json', 'w'))
print('duração', DUR, '| cenas', len(CUTS) - 1); print([round(CUTS[i + 1] - CUTS[i], 1) for i in range(len(CUTS) - 1)])
