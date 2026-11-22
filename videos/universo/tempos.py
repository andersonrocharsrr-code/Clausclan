# Linha do tempo: cortes presos às frases da narração (palavras.json) + legendas. Uso: python3 tempos.py <pasta com nar/>
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from narracao import FALAS
import soundfile as sf
PASTA = sys.argv[1]
GAP = {'a': 4.0, 'b': 3.0, 'c': 1.5, 'd': 1.5, 'e': 1.5, 'f': 3.0, 'g': 1.5, 'h': 1.5, 'i': 3.0, 'j': 1.5, 'k': 1.5, 'l': 3.0, 'm': 1.5, 'n': 1.5, 'o': 2.5}
CAPS = {'b': 'O SISTEMA SOLAR', 'f': 'A VIA LÁCTEA', 'i': 'AS GALÁXIAS', 'l': 'O UNIVERSO OBSERVÁVEL'}
PAL = json.load(open('palavras.json'))
NARS, NARD = {}, {}; t = 0
for k in FALAS:
    t += GAP[k]; NARS[k] = round(t, 2); d, sr = sf.read(f'{PASTA}/nar/{k}.wav'); NARD[k] = round(len(d) / sr, 2); t += NARD[k]
DUR = round(t + 8.0, 1)
norm = lambda w: re.sub(r'[^\wÀ-ÿ-]', '', w).lower()
def T(k, txt):
    alvo = [norm(w) for w in txt.split()]; ws = PAL[k]
    for i in range(len(ws) - len(alvo) + 1):
        if all(norm(ws[i + j][0]) == alvo[j] for j in range(len(alvo))): return round(NARS[k] + ws[i][1] - .12, 2)
    raise SystemExit(f'frase não achada: {k} {txt}')
N = lambda k: round(NARS[k] - .3, 2)
C = lambda k: round(NARS[k] - GAP[k] + .15, 2)  # cartão de capítulo no intervalo
CUTS = [0, T('a', 'Cada pontinho'), T('a', 'E tudo'), T('a', 'Vamos fazer'),
  C('b'), T('b', 'A Lua'), T('b', 'Nesse espaço'),
  N('c'), T('c', 'E a luz'),
  N('d'), T('d', 'E, muito'),
  N('e'), T('e', 'E a estrela'),
  C('f'), T('f', 'Ela tem'),
  N('g'), T('g', 'onde fica'), T('g', 'E o Sol'),
  N('h'),
  C('i'), T('i', 'Ela tem'), T('i', 'e dá para'), T('i', 'A luz que'), T('i', 'E, daqui'),
  N('j'), T('j', 'Que, por'), T('j', 'com cerca'),
  N('k'), T('k', 'Nessa imagem'),
  C('l'), T('l', 'e centenas'), T('l', 'Há mais'),
  N('m'), T('m', 'Porque'),
  N('n'), T('n', 'Além dela'),
  N('o'), T('o', 'estamos nós'), DUR]
DESTAQUE = {'sol', 'observável', 'casa', 'terra', 'lua', 'planetas', 'milhão', 'minutos', 'netuno', 'oort', 'ano-luz', 'laranja', 'areia', 'quilômetros', 'via', 'láctea', 'galáxia', 'anos-luz', 'espiral', 'buraco', 'duzentos', 'brasil', 'mão', 'andrômeda', 'trilhão', 'olho', 'humanos', 'galáxia', 'local', 'laniakea', 'webb', 'grão', 'milhares', 'noventa', 'praias', 'treze', 'expande', 'antiga', 'chegar', 'imensidão', 'nós', 'fora', 'estrelas', 'centenas', 'bilhões'}

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
