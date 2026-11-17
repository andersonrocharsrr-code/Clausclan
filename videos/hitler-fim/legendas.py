# Gera legendas.js (legenda palavra por palavra) a partir de palavras.json (tempos do alinhamento da narração).
import json, re
NAR = {'a': 3.0, 'b': 25.0, 'c': 52.0, 'd': 97.0, 'e': 124.0, 'f': 151.0, 'g': 176.0, 'h': 201.0}
DESTAQUE = {'ruínas', 'exército', 'milhões', 'partida', 'bunker', 'concreto', 'chancelaria', 'geradores', 'existem', 'parar', 'abril', 'soviéticos', 'curvado',
            'berlim', 'perdida', 'fim', 'cercada', 'afastam', 'telegrama', 'prendê-lo', 'escondidas', 'traição',
            'braun', 'testamento', 'judeus', 'dönitz', 'tiro', 'gasolina', 'vermelha', 'filhos', 'rende', 'condições',
            'europa', 'pessoas', 'holocausto', 'terra', 'cabeça', 'sucessor', 'reichstag', 'tarde', 'quarteirões', 'secretária', 'final', 'aérea', 'artilharia', 'companheira', 'cidade'}
P = json.load(open('palavras.json')); leg = []; usados = set()
for k, t0 in NAR.items():
    fr = []
    def fecha():
        global fr
        if fr: leg.append({'t0': round(fr[0][1] - .1, 2), 't1': round(fr[-1][3] + .45, 2), 'w': [[w, a, h] for w, a, h, _ in fr]}); fr = []; usados.clear()
    for w, a, b in P[k]:
        nu = re.sub(r'[^\wÀ-ÿ]', '', w).lower(); h = 1 if nu in DESTAQUE and not usados else 0; usados.update([nu] if h else [])
        fr.append([w.upper(), round(t0 + a, 2), h, t0 + b])
        n = len(fr); ch = sum(len(x[0]) + 1 for x in fr)
        if w[-1] in '.:?' or (w[-1] == ',' and (n >= 4 or ch > 34)) or ch > 78: fecha()
    fecha()
for i in range(len(leg) - 1): leg[i]['t1'] = min(leg[i]['t1'], leg[i + 1]['t0'])
open('legendas.js', 'w').write('// gerado por legendas.py\nconst LEG = ' + json.dumps(leg, ensure_ascii=False) + ';\n')
for l in leg: print(l['t0'], l['t1'], ' '.join(('*' if h else '') + w for w, _, h in l['w']))
