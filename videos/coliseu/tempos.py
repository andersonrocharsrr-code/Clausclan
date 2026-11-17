# Linha do tempo do vídeo: duração de cada fala (do áudio real, se existir; senão estimada pelo texto),
# cortes das cenas e legendas palavra por palavra. Uso: python3 tempos.py [pasta-com-nar/]
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from narracao import FALAS
PASTA = sys.argv[1] if len(sys.argv) > 1 else ''
CPS = 233 / 18.065                                   # caracteres por segundo (medido na fala a)
GAP = {'a': 2.5, 'b': 3, 'c': 3, 'd': 3, 'e': 3, 'f': 2.4, 'g': 3, 'h': 3}
PAL = json.load(open('palavras.json')) if os.path.exists('palavras.json') else {}
def dur(k):
    w = f'{PASTA}/nar/{k}.wav'
    if PASTA and os.path.exists(w):
        import soundfile as sf; d, sr = sf.read(w); return round(len(d) / sr, 2), True
    return round(len(FALAS[k]) / CPS, 2), False
NARS, NARD, REAL = {}, {}, {}; t = 0
for k in FALAS: t += GAP[k]; NARS[k] = round(t, 2); NARD[k], REAL[k] = dur(k); t += NARD[k]
DUR = round(t + 6, 1)
def frac(k, txt):  # posição de uma frase dentro da fala (pelas palavras reais, se houver)
    if k in PAL:
        alvo = txt.split()[0].strip(',.:').lower()
        for w, a, b in PAL[k]:
            if w.strip(',.:').lower() == alvo: return a / NARD[k]
    return FALAS[k].index(txt) / len(FALAS[k])
T = lambda k, txt: round(NARS[k] + frac(k, txt) * NARD[k], 2)
CARD = lambda k: round(NARS[k] - 1.0, 2)
CUTS = [0, T('a', 'cinquenta mil') - .4, T('a', 'Lá dentro'), T('a', 'Bem-vindo'),
        CARD('b'), T('b', 'O filho dele'), T('b', 'São cento'), T('b', 'Por fora'), T('b', 'Tudo em pedra'),
        CARD('c'), T('c', 'Cada um'), T('c', 'O sol'), T('c', 'E o chão'),
        CARD('d'), T('d', 'Cada tipo'), T('d', 'O trácio'), T('d', 'O secutor'),
        CARD('e'), T('e', 'Anos depois'), T('e', 'À tarde'), T('e', 'Quando um lutador'),
        round(NARS['f'] - 1.2, 2), T('f', 'Gladiadores custavam'), T('f', 'Mesmo assim'),
        CARD('g'), T('g', 'Terremotos'), T('g', 'e as pedras'),
        round(NARS['h'] - 1.0, 2), T('h', 'A arena'), DUR]
# legendas palavra por palavra (tempo real se houver alinhamento; senão proporcional ao texto)
DESTAQUE = {'coliseu', 'imperador', 'nero', 'tito', 'jogos', 'metros', 'arcos', 'travertino', 'ferro', 'portões', 'senadores', 'alto',
            'velário', 'harena', 'escravos', 'fama', 'magnus', 'crista', 'gládio', 'curva', 'tridente', 'império', 'hipogeu', 'alçapões',
            'gladiadores', 'multidão', 'morte', 'ídolos', 'areia', 'força', 'depois', 'palácios', 'roma', 'anfiteatro', 'mil', 'pedra', 'animais'}
leg = []
for k, txt in FALAS.items():
    if k in PAL: ws = [(w, NARS[k] + a, NARS[k] + b) for w, a, b in PAL[k]]
    else:
        ws, pos = [], 0
        for w in txt.split():
            i = txt.index(w, pos); a = i / len(txt) * NARD[k]; pos = i + len(w); ws.append((w, NARS[k] + a, NARS[k] + pos / len(txt) * NARD[k]))
    fr, usado = [], False
    def fecha():
        global fr, usado
        if fr: leg.append({'t0': round(fr[0][1] - .1, 2), 't1': round(fr[-1][3] + .45, 2), 'w': [[w, a, h] for w, a, h, _ in fr]}); fr = []; usado = False
    for w, a, b in ws:
        nu = re.sub(r'[^\wÀ-ÿ]', '', w).lower(); h = 1 if nu in DESTAQUE and not usado else 0; usado = usado or bool(h)
        fr.append([w.upper(), round(a, 2), h, b]); n = len(fr); ch = sum(len(x[0]) + 1 for x in fr)
        if w[-1] in '.:?' or (w[-1] in ',;' and (n >= 4 or ch > 34)) or ch > 78: fecha()
    fecha()
for i in range(len(leg) - 1): leg[i]['t1'] = min(leg[i]['t1'], leg[i + 1]['t0'])
open('tempos.js', 'w').write('// gerado por tempos.py\n' + f'const NARS = {json.dumps(NARS)};\nconst NARD = {json.dumps(NARD)};\nconst CUTS = {json.dumps([round(x, 2) for x in CUTS])};\nconst DUR = {DUR};\nconst LEG = {json.dumps(leg, ensure_ascii=False)};\n')
json.dump({'NARS': NARS, 'NARD': NARD, 'CUTS': CUTS, 'DUR': DUR}, open('tempos.json', 'w'))
print('voz real:', [k for k in REAL if REAL[k]], '| duração', DUR, '| cortes', len(CUTS) - 1)
