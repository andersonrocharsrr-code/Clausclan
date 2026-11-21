# Linha do tempo: cortes presos às frases da narração (palavras.json) + legendas. Uso: python3 tempos.py <pasta com nar/>
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from narracao import FALAS
import soundfile as sf
PASTA = sys.argv[1]
GAP = {'a': 3.0, 'b': 2.6, 'c': 1.3, 'd': 1.3, 'e': 1.3, 'f': 1.3, 'g': 1.3, 'h': 2.6, 'i': 1.3, 'j': 1.3, 'k': 1.3, 'l': 2.6, 'm': 1.3, 'n': 1.5}
CAPS = {'b': 'A MISSÃO', 'h': 'O DIA-LUZ', 'l': 'O FUTURO'}
PAL = json.load(open('palavras.json'))
NARS, NARD = {}, {}; t = 0
for k in FALAS:
    t += GAP[k]; NARS[k] = round(t, 2); d, sr = sf.read(f'{PASTA}/nar/{k}.wav'); NARD[k] = round(len(d) / sr, 2); t += NARD[k]
DUR = round(t + 6.5, 1)
norm = lambda w: re.sub(r'[^\wÀ-ÿ-]', '', w).lower()
def T(k, txt):
    alvo = [norm(w) for w in txt.split()]; ws = PAL[k]
    for i in range(len(ws) - len(alvo) + 1):
        if all(norm(ws[i + j][0]) == alvo[j] for j in range(len(alvo))): return round(NARS[k] + ws[i][1] - .12, 2)
    raise SystemExit(f'frase não achada: {k} {txt}')
N = lambda k: round(NARS[k] - .3, 2)
C = lambda k: round(NARS[k] - GAP[k] + .15, 2)  # cartão de capítulo no intervalo
CUTS = [0, T('a', 'uma nave'), T('a', 'a um dia-luz'), T('a', 'O nome'),
  C('b'), T('b', 'e a Voyager 1'), T('b', 'Cada uma'),
  N('c'), T('c', 'A gravidade'),
  N('d'), T('d', 'Depois veio'), T('d', 'A Voyager 2'),
  N('e'), T('e', 'e saudações'),
  N('f'), T('f', 'um pontinho'),
  N('g'),
  C('h'), T('h', 'Em um'), T('h', 'Um dia-luz é'),
  N('i'), T('i', 'A de Netuno'), T('i', 'E a da'),
  N('j'), T('j', 'De avião'), T('j', 'A Voyager'),
  N('k'), T('k', 'A Voyager transmite'), T('k', 'e as antenas'),
  C('l'), T('l', 'Dos dez'),
  N('m'), T('m', 'A Voyager levaria'),
  N('n'), T('n', 'Um dia-luz'), DUR]
DESTAQUE = {'dia-luz', 'voyager', 'sondas', 'antena', 'planetas', 'estilingue', 'júpiter', 'io', 'saturno', 'titã', 'urano', 'netuno', 'ouro', 'línguas', 'nave', 'terra', 'pixel', 'heliopausa', 'interestelar', 'luz', 'segundo', 'terra', 'bilhões', 'lua', 'sol', 'inteiro', 'carro', 'anos', 'avião', 'quarenta', 'dia', 'geladeira', 'sussurro', 'plutônio', 'dois', 'próxima', 'setenta', 'chave', 'curiosidade', 'gente', 'combustível', 'minutos', 'horas', 'mil', 'casa'}

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
