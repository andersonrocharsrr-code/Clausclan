# Linha do tempo: cortes presos às frases da narração + legenda palavra por palavra. Uso: python3 tempos.py <pasta com nar/>
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from narracao import FALAS
import soundfile as sf
PASTA = sys.argv[1]
GAP = {k: (.8 if k == 'a' else 1.4 if k in 'begj' else .8) for k in FALAS}
CAPS = {'b': 'A GUERRA CHEGA', 'e': 'MONTE CASTELO', 'g': 'A VITÓRIA', 'j': 'O LEGADO'}
PAL = json.load(open('palavras.json'))
NARS = {}; t = 0
for k in FALAS:
    t += GAP[k]; NARS[k] = round(t, 2); d, sr = sf.read(f'{PASTA}/nar/{k}.wav'); t += len(d) / sr
DUR = round(t + 1.6, 1)
norm = lambda w: re.sub(r'[^\wÀ-ÿ-]', '', w).lower()
def T(k, txt):
    alvo = [norm(w) for w in txt.split()]; ws = PAL[k]
    for i in range(len(ws) - len(alvo) + 1):
        if all(norm(ws[i + j][0]) == alvo[j] for j in range(len(alvo))): return round(NARS[k] + ws[i][1] - .1, 2)
    raise SystemExit(f'frase não achada: {k} {txt}')
N = lambda k: round(NARS[k] - GAP[k] + .05, 2) if k in CAPS else round(NARS[k] - .2, 2)
CUTS = [0, T('a', 'e venceu'),
  N('b'), T('b', 'submarinos'), T('b', 'Centenas'), T('b', 'E o Brasil'),
  N('c'), T('c', 'Pois a'), T('c', 'mais de'), T('c', 'partiram'),
  N('d'), T('d', 'eles desembarcaram'), T('d', 'e se juntaram'), T('d', 'sob o'),
  N('e'), T('e', 'uma posição'), T('e', 'com visão'),
  N('f'), T('f', 'na neve'), T('f', 'muitos sem'), T('f', 'Todos os'),
  N('g'), T('g', 'depois de'), T('g', 'os pracinhas'), T('g', 'Monte Castelo era'),
  N('h'), T('h', 'destruíam'), T('h', 'Em terra'), T('h', 'a batalha'),
  N('i'), T('i', 'uma divisão'), T('i', 'cerca de'),
  N('j'), T('j', 'Mas o'), T('j', 'A cobra'), DUR]
assert all(a < b for a, b in zip(CUTS, CUTS[1:])), CUTS
DEST = {'brasil', 'itália', 'navios', 'guerra', 'cobra', 'fumou', 'mil', 'nápoles', 'mascarenhas', 'castelo', 'vale', 'neve', 'falharam', 'fevereiro', 'topo', 'brasileiro', 'pua', 'montese', 'fornovo', 'prisioneiros', 'casa', 'vitória', 'esperava', 'segunda', 'difíceis', 'quinto', 'alemã', 'pracinhas', 'sangrenta', 'rendeu'}
leg = []
for k in FALAS:
    g = []
    for i, (w, s, e) in enumerate(PAL[k]):
        g.append([w.upper(), round(NARS[k] + s, 3)])
        if w[-1] in '.,:?!' or len(g) == 3 or i == len(PAL[k]) - 1:
            d = next((j for j, x in enumerate(g) if norm(x[0]) in DEST), -1)
            leg.append({'t0': round(g[0][1] - .04, 3), 'w': g, 'dest': d, 'fim': round(NARS[k] + e + .2, 3)}); g = []
for a, b in zip(leg, leg[1:]): a['t1'] = round(min(b['t0'], a['fim']), 3)
leg[-1]['t1'] = leg[-1]['fim']
CAPT = {CUTS.index(N(k)): v for k, v in CAPS.items()}
open('tempos.js', 'w').write(f'const CUTS = {json.dumps(CUTS)}, DUR = {DUR}, CAPT = {json.dumps(CAPT, ensure_ascii=False)};\nconst NARS = {json.dumps(NARS)};\nconst LEG = {json.dumps(leg, ensure_ascii=False)};\n')
json.dump({'CUTS': CUTS, 'DUR': DUR, 'NARS': NARS, 'CAPT': CAPT}, open('tempos.json', 'w'), ensure_ascii=False)
print(len(CUTS) - 1, 'cenas', DUR, 's', [round(b - a, 1) for a, b in zip(CUTS, CUTS[1:])])
