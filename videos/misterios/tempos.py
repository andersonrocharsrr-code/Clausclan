# Linha do tempo: cortes presos às frases da narração (palavras.json) + legendas. Uso: python3 tempos.py <pasta com nar/>
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from narracao import FALAS
import soundfile as sf
PASTA = sys.argv[1]
GAP = {'a': 2.5, 'b': 2.4, 'c': 1.0, 'd': 1.0, 'e': 1.0, 'f': 1.0, 'g': 2.4, 'h': 1.0, 'i': 1.0, 'j': 2.4, 'k': 1.0, 'l': 1.0, 'm': 2.4, 'n': 1.0, 'o': 2.4}
CAPS = {'b': 'PULSARES', 'g': 'QUASARES', 'j': 'OS PILARES DA CRIAÇÃO', 'm': 'A GALÁXIA SOMBREIRO', 'o': 'O MAIOR MISTÉRIO'}
PAL = json.load(open('palavras.json'))
NARS, NARD = {}, {}; t = 0
for k in FALAS:
    t += GAP[k]; NARS[k] = round(t, 2); d, sr = sf.read(f'{PASTA}/nar/{k}.wav'); NARD[k] = round(len(d) / sr, 2); t += NARD[k]
DUR = round(t + 5.0, 1)
norm = lambda w: re.sub(r'[^\wÀ-ÿ-]', '', w).lower()
def T(k, txt):
    alvo = [norm(w) for w in txt.split()]; ws = PAL[k]
    for i in range(len(ws) - len(alvo) + 1):
        if all(norm(ws[i + j][0]) == alvo[j] for j in range(len(alvo))): return round(NARS[k] + ws[i][1] - .12, 2)
    raise SystemExit(f'frase não achada: {k} {txt}')
N = lambda k: round(NARS[k] - .3, 2)
C = lambda k: round(NARS[k] - GAP[k] + .15, 2)  # cartão de capítulo no intervalo
CUTS = [0, T('a', 'Estrelas que'), T('a', 'Pontos de'), T('a', 'Nuvens onde'),
  C('b'), T('b', 'No fim'), T('b', 'O que sobra'),
  N('c'),
  N('d'), T('d', 'Cada vez'), T('d', 'O mais'),
  N('e'), T('e', 'O sinal'),
  N('f'), T('f', 'Ele nasceu'),
  C('g'), T('g', 'Ele engole'), T('g', 'Isso é'),
  N('h'), T('h', 'Mesmo tão'),
  N('i'), T('i', 'O buraco'),
  C('j'), T('j', 'fotografadas'), T('j', 'A maior'),
  N('k'), T('k', 'Em dois'),
  N('l'), T('l', 'Como a'),
  C('m'), T('m', 'Vista quase'),
  N('n'), T('n', 'No infravermelho'),
  C('o'), T('o', 'O resto'), T('o', 'E ninguém'), DUR]
DESTAQUE = {'estranhas', 'segundo', 'galáxias', 'nascendo', 'mistérios', 'supernova', 'nêutrons', 'cidade', 'toneladas', 'juntos', 'farol', 'pulso', 'pulsares', 'setecentas', 'jocelyn', 'verdes', 'alienígena', 'caranguejo', 'trinta', 'dia', 'buraco', 'quasar', 'trilhões', 'amador', 'brilhante', 'sol', 'águia', 'criação', 'hubble', 'altura', 'nascendo', 'webb', 'destruído', 'milênios', 'confirmado', 'sombreiro', 'chapéu', 'poeira', 'aglomerados', 'alvo', 'cinco', 'escura', 'sabe', 'rocha', 'mil', 'ficção'}

leg = []
for k in FALAS:
    fr, usado = [], False
    def fecha():
        global fr, usado
        if fr: leg.append({'t0': round(fr[0][1] - .08, 2), 't1': round(fr[-1][3] + .35, 2), 'w': [[w, a, h] for w, a, h, _ in fr]}); fr = []; usado = False
    for w, a, b in PAL[k]:
        nu = norm(w); h = 1 if nu in DESTAQUE and not usado else 0; usado = usado or bool(h)
        fr.append([w.upper(), round(NARS[k] + a, 2), h, NARS[k] + b]); n = len(fr); ch = sum(len(x[0]) + 1 for x in fr)
        if w[-1] in '.:?' or (w[-1] in ',;' and (n >= 3 or ch > 20)) or ch > 32: fecha()
    fecha()
for i in range(len(leg) - 1): leg[i]['t1'] = min(leg[i]['t1'], leg[i + 1]['t0'])
open('tempos.js', 'w').write('// gerado por tempos.py\n' + f'const NARS = {json.dumps(NARS)};\nconst CAPS = {json.dumps(CAPS, ensure_ascii=False)};\nconst CUTS = {json.dumps(CUTS)};\nconst DUR = {DUR};\nconst LEG = {json.dumps(leg, ensure_ascii=False)};\n')
json.dump({'NARS': NARS, 'NARD': NARD, 'CUTS': CUTS, 'DUR': DUR}, open('tempos.json', 'w'))
print('duração', DUR, '| cenas', len(CUTS) - 1); print([round(CUTS[i + 1] - CUTS[i], 1) for i in range(len(CUTS) - 1)])
