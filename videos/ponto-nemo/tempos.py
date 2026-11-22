# Linha do tempo (15 s): cortes presos às palavras da fala + legenda palavra por palavra. Uso: python3 tempos.py
import json, re
OFF, DUR = .35, 15.0
ws = [[w, round(s + OFF, 3), round(e + OFF, 3)] for w, s, e in json.load(open('palavras_curta.json'))['a']]
def T(txt):
    for i, w in enumerate(ws):
        if w[0].strip('.,') == txt: return round(w[1] - .15, 2)
CUTS = [0, T('A'), T('Às'), T('E'), DUR]
DEST = {'pacífico', 'nemo', 'isolado', 'seiscentos', 'quilômetros', 'astronautas', 'espacial', 'morrer'}
leg, g = [], []
for i, w in enumerate(ws):
    g.append(w)
    if w[0][-1] in '.,' or len(g) == 4 or i == len(ws) - 1:
        d = next((k for k, x in enumerate(g) if re.sub(r'\W', '', x[0].lower()) in DEST), -1)
        leg.append({'t0': g[0][1] - .05, 'w': [[x[0].upper(), x[1]] for x in g], 'dest': d}); g = []
for a, b in zip(leg, leg[1:]): a['t1'] = b['t0']
leg[-1]['t1'] = DUR - .2
open('tempos.js', 'w').write(f'const CUTS = {json.dumps(CUTS)}, DUR = {DUR}, OFF = {OFF};\nconst LEG = {json.dumps(leg, ensure_ascii=False)};\n')
print(CUTS, len(leg))
