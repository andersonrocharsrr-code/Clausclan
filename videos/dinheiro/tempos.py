# Linha do tempo: cortes presos às frases da fala (palavras.json), cartões de capítulo e legenda. Uso: python3 tempos.py <pasta com nar/>
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from narracao import FALAS
import soundfile as sf
PASTA = sys.argv[1]
CAPS = {'b': 'A TROCA', 'd': 'AS PRIMEIRAS CONTAS', 'e': 'AS MOEDAS', 'g': 'O PAPEL-MOEDA', 'h': 'OS BANCOS', 'i': 'A PRATA QUE RODOU O MUNDO', 'j': 'A CONFIANÇA', 'l': 'O DINHEIRO DIGITAL'}
GAP = {k: (1.2 if k == 'a' else 1.85 if k in CAPS else .8) for k in FALAS}
PAL = json.load(open('palavras.json'))
NARS = {}; t = 0
for k in FALAS:
    t += GAP[k]; NARS[k] = round(t, 2); d, sr = sf.read(f'{PASTA}/nar/{k}.wav'); t += len(d) / sr
DUR = round(t + 1.6, 1)
norm = lambda w: re.sub(r'[^\wÀ-ÿ-]', '', w).lower()
def T(k, txt):
    alvo = [norm(w) for w in txt.split()]; ws = PAL[k]
    for i in range(len(ws) - len(alvo) + 1):
        if all(norm(ws[i + j][0]) == alvo[j] for j in range(len(alvo))): return round(NARS[k] + ws[i][1] - .12, 2)
    raise SystemExit(f'frase não achada: {k} {txt}')
N = lambda k: round(NARS[k] - .25, 2)
C = lambda k: round(NARS[k] - GAP[k] + .05, 2)
CUTS = [0, T('a', 'Mas, por'), T('a', 'Então, como'),
  C('b'), N('b'), T('b', 'Isso se'), T('b', 'Mas tinha'),
  N('c'), T('c', 'Em latim'), T('c', 'E, segundo'),
  C('d'), N('d'), T('d', 'e anotavam'), T('d', 'O siclo'), T('d', 'Muitos historiadores'),
  C('e'), N('e'), T('e', 'surgiram as'), T('e', 'Agora, ninguém'),
  N('f'), T('f', 'A palavra'), T('f', 'Na China'),
  C('g'), N('g'), T('g', 'a China'), T('g', 'Quando Marco'), T('g', 'Mas veio'),
  C('h'), N('h'), T('h', 'Famílias como'), T('h', 'e criaram'),
  C('i'), N('i'), T('i', 'Ela circulava'), T('i', 'Financiou'),
  C('j'), N('j'), T('j', 'Em mil'), T('j', 'Até que'), T('j', 'Desde então'),
  N('k'), T('k', 'O Brasil'), T('k', 'Em março'), T('k', 'até o Plano'),
  C('l'), N('l'), T('l', 'Vieram os'),
  N('m'), T('m', 'Um pedaço'), DUR]
assert all(a < b for a, b in zip(CUTS, CUTS[1:])), CUTS
CAPT = [[C(k), i + 1, v] for i, (k, v) in enumerate(CAPS.items())]
DEST = {'celular', 'dinheiro', 'mundo', 'escambo', 'trigo', 'peixe', 'sal', 'pecuniário', 'salário', 'mesopotâmia', 'barro', 'siclo', 'escrita', 'lídia', 'moedas', 'leão', 'contar', 'dracma', 'denário', 'moneta', 'cordão', 'papel-moeda', 'ouro', 'inflação', 'banco', 'médici', 'londres', 'potosí', 'global', 'china', 'indígenas', 'dólar', 'ligação', 'confiamos', 'derrete', 'nove', 'oitenta', 'real', 'computadores', 'pix', 'acordo', 'acreditamos', 'bitcoin', 'turquia', 'electro', 'cambistas', 'impérios', 'dia', 'prata'}
leg = []
for k in FALAS:
    g = []
    ws = PAL[k]
    for i, (w, s, e) in enumerate(ws):
        g.append([w.upper(), round(NARS[k] + s, 3)])
        if w[-1] in '.,:?!' or len(g) == 4 or i == len(ws) - 1:
            d = next((j for j, x in enumerate(g) if norm(x[0]) in DEST), -1)
            leg.append({'t0': round(g[0][1] - .05, 3), 'w': g, 'dest': d, 'fim': round(NARS[k] + e + .25, 3)}); g = []
for a, b in zip(leg, leg[1:]): a['t1'] = round(min(b['t0'], a['fim']), 3)
leg[-1]['t1'] = leg[-1]['fim']
open('tempos.js', 'w').write(f'const CUTS = {json.dumps(CUTS)}, DUR = {DUR};\nconst CAPT = {json.dumps(CAPT, ensure_ascii=False)};\nconst LEG = {json.dumps(leg, ensure_ascii=False)};\n')
json.dump({'CUTS': CUTS, 'DUR': DUR, 'NARS': NARS, 'CAPT': CAPT}, open('tempos.json', 'w'), ensure_ascii=False)
print(len(CUTS) - 1, 'cenas', DUR, 's')
