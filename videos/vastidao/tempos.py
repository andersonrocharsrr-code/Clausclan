# Linha do tempo: cortes presos às frases da narração (palavras.json) + legendas. Uso: python3 tempos.py <pasta com nar/>
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from narracao import FALAS
import soundfile as sf
PASTA = sys.argv[1]
GAP = {k: 2.5 if k == 'a' else 3.0 if k in 'behjm' else 1.6 for k in 'abcdefghijklmno'}
CAPS = {'b': 'A VASTIDÃO', 'e': 'BRUTAL', 'h': 'O COMEÇO', 'j': 'AS TEORIAS', 'm': 'E DEUS?'}
PAL = json.load(open('palavras.json'))
NARS, NARD = {}, {}; t = 0
for k in FALAS:
    t += GAP[k]; NARS[k] = round(t, 2); d, sr = sf.read(f'{PASTA}/nar/{k}.wav'); NARD[k] = round(len(d) / sr, 2); t += NARD[k]
DUR = round(t + 6.0, 1)
norm = lambda w: re.sub(r'[^\wÀ-ÿ-]', '', w).lower()
def T(k, txt):
    alvo = [norm(w) for w in txt.split()]; ws = PAL[k]
    for i in range(len(ws) - len(alvo) + 1):
        if all(norm(ws[i + j][0]) == alvo[j] for j in range(len(alvo))): return round(NARS[k] + ws[i][1] - .12, 2)
    raise SystemExit(f'frase não achada: {k} {txt}')
N = lambda k: round(NARS[k] - .3, 2)
C = lambda k: round(NARS[k] - GAP[k] + .15, 2)  # cartão de capítulo no intervalo
CUTS = [0, T('a', 'E existem'), T('a', 'O universo é'),
  C('b'), T('b', 'Para cruzar'), T('b', 'E a Via'),
  N('c'), T('c', 'E o que'), T('c', 'Muitos cientistas'),
  N('d'), T('d', 'E, segundo'),
  C('e'), T('e', 'Estrelas explodem'), T('e', 'Buracos negros'),
  N('f'), T('f', 'Um asteroide'), T('f', 'E daqui'),
  N('g'), T('g', 'Se toda'), T('g', 'E a Terra'),
  C('h'), T('h', 'A ciência'), T('h', 'Então, ele'), T('h', 'Chamamos'),
  N('i'), T('i', 'Até hoje'), T('i', 'E o eco'),
  C('j'), T('j', 'Há quem diga'), T('j', 'Há quem acredite'),
  N('k'), T('k', 'E há físicos'),
  N('l'),
  C('m'), T('m', 'Para ele'),
  N('n'), T('n', 'Para bilhões'),
  N('o'), T('o', 'nós somos'), DUR]
DESTAQUE = {'sol', 'areia', 'mente', 'rápida', 'mil', 'galáxias', 'observável', 'sabe', 'infinito', 'centro', 'cópia', 'brutal', 'zero', 'explodem', 'luz', 'colidem', 'dinossauros', 'engolir', 'nós', 'minutos', 'azul', 'começou', 'quentíssimo', 'expandir', 'bang', 'espaço', 'afastam', 'eco', 'radiação', 'história', 'invenção', 'escondida', 'simulação', 'multiverso', 'bolha', 'ciclos', 'provada', 'respostas', 'curiosidade', 'lemaître', 'padre', 'fé', 'nada', 'deus', 'criador', 'primeira', 'tudo', 'brutal', 'viemos', 'universo'}

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
