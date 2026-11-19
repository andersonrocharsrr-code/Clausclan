# Linha do tempo: cortes presos às frases da narração (palavras.json) + legendas. Uso: python3 tempos.py <pasta com nar/>
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from narracao import FALAS
import soundfile as sf
PASTA = sys.argv[1]
GAP = {'a': 6.0, 'b': 3.0, 'c': 3.0, 'd': 1.6, 'e': 1.6, 'f': 3.0, 'g': 1.6, 'h': 1.6, 'i': 1.6, 'j': 3.0, 'k': 1.6, 'l': 1.6, 'm': 1.6, 'n': 1.8}
CAPS = {'b': 'O VAPOR', 'c': 'A CIDADE', 'f': 'O PREÇO', 'j': 'O FUTURO'}
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
CUTS = [0, T('a', 'No século'), T('a', 'E o'),
  C('b'), T('b', 'O escocês'), T('b', 'e o carvão'), T('b', 'fábricas'),
  C('c'), T('c', 'Cem anos'), T('c', 'Gente do'),
  N('d'), T('d', 'Estivadores'), T('d', 'e as chaminés'),
  N('e'), T('e', 'Vendedores'), T('e', 'e os lampiões'),
  C('f'), T('f', 'As crianças'), T('f', 'vendiam'),
  N('g'), T('g', 'A fumaça'), T('g', 'E o rio'),
  N('h'), T('h', 'O médico'), T('h', 'e convenceu'),
  N('i'), T('i', 'O engenheiro'),
  C('j'), T('j', 'num palácio'), T('j', 'Seis milhões'),
  N('k'), T('k', 'o primeiro'),
  N('l'), T('l', 'as meninas'), T('l', 'fizeram greve'), T('l', 'No ano'),
  N('m'), T('m', 'e levaram'),
  N('n'), T('n', 'Mas também'), T('n', 'E muito'), DUR]
DESTAQUE = {'londres', 'vapor', 'watt', 'carvão', 'trens', 'milhão', 'milhões', 'trabalho', 'tâmisa', 'estivadores', 'fumaça', 'cavalos', 'cachorros', 'gás', 'preço', 'catorze', 'chaminés', 'nada', 'quarto', 'ervilha', 'esgoto', 'cólera', 'snow', 'alavanca', 'fedor', 'bazalgette', 'hoje', 'cristal', 'futuro', 'metrô', 'túneis', 'unir', 'fósforos', 'venceram', 'porto', 'leis', 'limpa', 'desigualdade', 'esgotos', 'nós', 'maior', 'docas', 'sopa', 'bomba', 'exposição', 'greve', 'crianças', 'jornais', 'escocês', 'campo', 'navios'}

leg = []
for k in FALAS:
    fr, usado = [], False
    def fecha():
        global fr, usado
        if fr: leg.append({'t0': round(fr[0][1] - .08, 2), 't1': round(fr[-1][3] + .35, 2), 'w': [[w, a, h] for w, a, h, _ in fr]}); fr = []; usado = False
    for w, a, b in PAL[k]:
        nu = norm(w); h = 1 if nu in DESTAQUE and not usado else 0; usado = usado or bool(h)
        fr.append([w.upper(), round(NARS[k] + a, 2), h, NARS[k] + b]); n = len(fr); ch = sum(len(x[0]) + 1 for x in fr)
        if w[-1] in '.:?' or (w[-1] in ',;' and (n >= 4 or ch > 34)) or ch > 66: fecha()
    fecha()
for i in range(len(leg) - 1): leg[i]['t1'] = min(leg[i]['t1'], leg[i + 1]['t0'])
open('tempos.js', 'w').write('// gerado por tempos.py\n' + f'const NARS = {json.dumps(NARS)};\nconst CAPS = {json.dumps(CAPS, ensure_ascii=False)};\nconst CUTS = {json.dumps(CUTS)};\nconst DUR = {DUR};\nconst LEG = {json.dumps(leg, ensure_ascii=False)};\n')
json.dump({'NARS': NARS, 'NARD': NARD, 'CUTS': CUTS, 'DUR': DUR}, open('tempos.json', 'w'))
print('duração', DUR, '| cenas', len(CUTS) - 1); print([round(CUTS[i + 1] - CUTS[i], 1) for i in range(len(CUTS) - 1)])
