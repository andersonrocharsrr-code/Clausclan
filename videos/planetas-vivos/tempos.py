# Linha do tempo: cortes presos às frases da narração (palavras.json) + legendas. Uso: python3 tempos.py <pasta com nar/>
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from narracao import FALAS
import soundfile as sf
PASTA = sys.argv[1]
GAP = {k: 2.0 if k == 'a' else 2.8 if k in 'bdfhk' else 1.3 for k in 'abcdefghijklmn'}
CAPS = {'b': 'TRÊS MUNDOS VIVOS', 'd': 'MARTE', 'f': 'VÊNUS', 'h': 'A VIAGEM', 'k': 'ELES AQUI'}
PAL = json.load(open('palavras.json'))
NARS, NARD = {}, {}; t = 0
for k in FALAS:
    t += GAP[k]; NARS[k] = round(t, 2); d, sr = sf.read(f'{PASTA}/nar/{k}.wav'); NARD[k] = round(len(d) / sr, 2); t += NARD[k]
DUR = round(t + 4.5, 1)
norm = lambda w: re.sub(r'[^\wÀ-ÿ-]', '', w).lower()
def T(k, txt):
    alvo = [norm(w) for w in txt.split()]; ws = PAL[k]
    for i in range(len(ws) - len(alvo) + 1):
        if all(norm(ws[i + j][0]) == alvo[j] for j in range(len(alvo))): return round(NARS[k] + ws[i][1] - .12, 2)
    raise SystemExit(f'frase não achada: {k} {txt}')
N = lambda k: round(NARS[k] - .3, 2)
C = lambda k: round(NARS[k] - GAP[k] + .15, 2)  # cartão de capítulo no intervalo
CUTS = [0, T('a', 'existem cidades'), T('a', 'E se'),
  C('b'), T('b', 'Marte, no'), T('b', 'Vênus pode'), T('b', 'Num universo'),
  N('c'), T('c', 'À noite'),
  C('d'), T('d', 'Por isso'), T('d', 'e pessoas'),
  N('e'), T('e', 'Mas o'), T('e', 'Um marciano'), T('e', 'E no'),
  C('f'), T('f', 'Mas ele'), T('f', 'Talvez com'),
  N('g'), T('g', 'O planeta'), T('g', 'Um venusiano'),
  C('h'), T('h', 'Com foguetes'), T('h', 'As naves'),
  N('i'), T('i', 'Veria duas'), T('i', 'E uma'),
  N('j'), T('j', 'Ficaria'),
  C('k'), T('k', 'Um marciano'), T('k', 'Andaria'),
  N('l'), T('l', 'Sentiria'),
  N('m'), T('m', 'E, claro'),
  N('n'), T('n', 'A Terra'), T('n', 'Pelo menos'), DUR]
DESTAQUE = {'nós', 'terra', 'juntos', 'oceano', 'forno', 'vivos', 'azuis', 'cidades', 'gravidade', 'leve', 'gigantes', 'alto', 'minutos', 'dias', 'dezenove', 'luas', 'tamanho', 'quente', 'pesado', 'ano', 'oeste', 'semanas', 'visitar', 'meses', 'nove', 'lançamento', 'salto', 'alta', 'chegar', 'estufa', 'céu', 'pesado', 'robótica', 'curtos', 'neve', 'comércio', 'interplanetários', 'planeta', 'gelado', 'graus', 'vida', 'lar', 'enquanto', 'marte', 'vênus'}

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
