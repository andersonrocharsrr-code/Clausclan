# Linha do tempo: cortes presos às frases da narração (palavras.json) + legendas. Uso: python3 tempos.py <pasta com nar/>
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from narracao import FALAS
import soundfile as sf
PASTA = sys.argv[1]
GAP = {'a': .5, 'b': .6, 'c': .7, 'd': .7, 'e': .6, 'f': .6, 'g': 1.3, 'h': .9, 'i': .6, 'j': .6, 'k': .6, 'l': .8}
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
CUTS = [0, T('a', 'Nas redes'), T('a', 'Sem luz'), T('a', 'E por'),
  N('b'), T('b', 'E muita'),
  N('c'), T('c', 'Internautas'), T('c', 'E uma postagem'),
  N('d'), T('d', 'Para o mesmo'),
  N('e'),
  N('f'), T('f', 'Junte tudo'),
  N('g'),
  N('h'), T('h', 'E a postagem'),
  N('i'), T('i', 'E a própria'),
  N('j'), T('j', 'E a Defesa'),
  N('k'), T('k', 'E cada país'), T('k', 'Desligar o'),
  N('l'), T('l', 'As luzes'), T('l', 'Antes de'), DUR]
DESTAQUE = {'novembro', 'energia', 'noventa', 'milhões', 'sobrevivência', 'desenho', 'lisa', 'tempestade', 'google', 'alerta', 'emergência', 'setenta', 'militar', 'boato',
            'verdade', 'partes', 'falsa', 'rotina', 'internet', 'enchentes', 'evidências', 'ons', 'rede', 'impossível', 'acesas', 'fonte', 'simpsons', 'lei', 'americano', 'luz', 'apagão', 'dezessete', 'desligamento', 'passou'}
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
open('tempos.js', 'w').write('// gerado por tempos.py\n' + f'const NARS = {json.dumps(NARS)};\nconst CUTS = {json.dumps(CUTS)};\nconst DUR = {DUR};\nconst LEG = {json.dumps(leg, ensure_ascii=False)};\n')
json.dump({'NARS': NARS, 'NARD': NARD, 'CUTS': CUTS, 'DUR': DUR}, open('tempos.json', 'w'))
print('duração', DUR, '| cenas', len(CUTS) - 1); print([round(CUTS[i + 1] - CUTS[i], 1) for i in range(len(CUTS) - 1)])
