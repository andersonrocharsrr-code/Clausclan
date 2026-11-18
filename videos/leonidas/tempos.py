# Linha do tempo: cortes presos às frases da narração (palavras.json) + legendas. Uso: python3 tempos.py <pasta com nar/>
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from narracao import FALAS
import soundfile as sf
PASTA = sys.argv[1]
GAP = {'a': .6, 'b': 2.0, 'c': .8, 'd': 2.0, 'e': 2.0, 'f': .7, 'g': .8, 'h': .8, 'i': .9, 'j': .8, 'k': 2.0, 'l': 1.0}
CAPS = {'b': 'ESPARTA', 'd': 'O IMPÉRIO', 'e': 'TERMÓPILAS', 'k': 'O LEGADO'}
PAL = json.load(open('palavras.json'))
NARS, NARD = {}, {}; t = 0
for k in FALAS:
    t += GAP[k]; NARS[k] = round(t, 2); d, sr = sf.read(f'{PASTA}/nar/{k}.wav'); NARD[k] = round(len(d) / sr, 2); t += NARD[k]
DUR = round(t + 3.0, 1)
norm = lambda w: re.sub(r'[^\wÀ-ÿ-]', '', w).lower()
def T(k, txt):
    alvo = [norm(w) for w in txt.split()]; ws = PAL[k]
    for i in range(len(ws) - len(alvo) + 1):
        if all(norm(ws[i + j][0]) == alvo[j] for j in range(len(alvo))): return round(NARS[k] + ws[i][1] - .12, 2)
    raise SystemExit(f'frase não achada: {k} {txt}')
N = lambda k: round(NARS[k] - .3, 2)
C = lambda k: round(NARS[k] - GAP[k] + .15, 2)  # cartão de capítulo no intervalo
CUTS = [0, T('a', 'E num'), T('a', 'um rei'),
  C('b'), T('b', 'luta'), T('b', 'Viravam'),
  N('c'), T('c', 'Com a'), T('c', 'e casou'),
  C('d'), T('d', 'Reuniu'),
  C('e'), T('e', 'uma passagem'),
  N('f'), T('f', 'Então'), T('f', 'No caminho'),
  N('g'), T('g', 'Leônidas respondeu'), T('g', 'Quando'), T('g', 'Melhor'),
  N('h'), T('h', 'Os gregos'), T('h', 'No segundo'), T('h', 'Também'),
  N('i'), T('i', 'Os gregos'),
  N('j'), T('j', 'No terceiro'), T('j', 'Leônidas caiu'),
  C('k'), T('k', 'venceu no'), T('k', 'e em'), T('k', 'Xerxes nunca'),
  N('l'), T('l', 'Estrangeiro'), T('l', 'Hoje'), T('l', 'com duas'), DUR]
DESTAQUE = {'império', 'grécia', 'recuar', 'leônidas', 'agogê', 'disciplina', 'hoplitas', 'bronze', 'rei', 'agogê', 'gorgo', 'xerxes', 'maratona', 'gigantesco', 'barcos', 'tempo', 'termópilas', 'tamanho',
            'religiosa', 'trezentos', 'vivos', 'mil', 'armas', 'labé', 'sol', 'sombra', 'ondas', 'falange', 'imortais', 'barrados', 'traição', 'efialtes', 'cercados', 'embora', 'fim', 'rei', 'passaram',
            'salamina', 'plateias', 'nunca', 'simônides', 'leis', 'estátua', 'desfiladeiro', 'escudo', 'inteligência', 'trono', 'pegá-las', 'melhor', 'cristo', 'helesponto'}

leg = []
for k in FALAS:
    fr, usado = [], False
    def fecha():
        global fr, usado
        if fr: leg.append({'t0': round(fr[0][1] - .08, 2), 't1': round(fr[-1][3] + .35, 2), 'w': [[w, a, h] for w, a, h, _ in fr]}); fr = []; usado = False
    for w, a, b in PAL[k]:
        nu = norm(w); h = 1 if nu in DESTAQUE and not usado else 0; usado = usado or bool(h)
        fr.append([w.upper(), round(NARS[k] + a, 2), h, NARS[k] + b]); n = len(fr); ch = sum(len(x[0]) + 1 for x in fr)
        if w[-1] in '.:?' or (w[-1] in ',;' and (n >= 3 or ch > 18)) or ch > 30: fecha()
    fecha()
for i in range(len(leg) - 1): leg[i]['t1'] = min(leg[i]['t1'], leg[i + 1]['t0'])
open('tempos.js', 'w').write('// gerado por tempos.py\n' + f'const NARS = {json.dumps(NARS)};\nconst CAPS = {json.dumps(CAPS, ensure_ascii=False)};\nconst CUTS = {json.dumps(CUTS)};\nconst DUR = {DUR};\nconst LEG = {json.dumps(leg, ensure_ascii=False)};\n')
json.dump({'NARS': NARS, 'NARD': NARD, 'CUTS': CUTS, 'DUR': DUR}, open('tempos.json', 'w'))
print('duração', DUR, '| cenas', len(CUTS) - 1); print([round(CUTS[i + 1] - CUTS[i], 1) for i in range(len(CUTS) - 1)])
