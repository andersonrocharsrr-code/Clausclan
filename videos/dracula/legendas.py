# legendas.js a partir de palavras.json (tempo real de cada palavra). NARS igual ao de cenas.js.
import json, re
NARS = {'a': 2.2, 'b': 9.8, 'c': 18.6}
DESTAQUE = {'transilvânia', 'drácula', 'neve', 'stoker', 'caixão', 'morcego', 'sangue', 'empalador', 'vampiro', 'castelo', 'verdade', 'mundo'}
P = json.load(open('palavras.json')); leg = []
for k, t0 in NARS.items():
    fr, usado = [], False
    for w, a, b in P[k]:
        nu = re.sub(r'[^\wÀ-ÿ]', '', w).lower(); h = 1 if nu in DESTAQUE and not usado else 0; usado = usado or bool(h)
        fr.append([w.upper(), round(t0 + a, 2), h, t0 + b]); ch = sum(len(x[0]) + 1 for x in fr)
        if w[-1] in '.:' or (w[-1] == ',' and (len(fr) >= 4 or ch > 30)) or ch > 60:
            leg.append({'t0': round(fr[0][1] - .1, 2), 't1': round(fr[-1][3] + .45, 2), 'w': [[x[0], x[1], x[2]] for x in fr]}); fr, usado = [], False
    if fr: leg.append({'t0': round(fr[0][1] - .1, 2), 't1': round(fr[-1][3] + .45, 2), 'w': [[x[0], x[1], x[2]] for x in fr]})
for i in range(len(leg) - 1): leg[i]['t1'] = min(leg[i]['t1'], leg[i + 1]['t0'])
open('legendas.js', 'w').write('// gerado por legendas.py\nconst LEG = ' + json.dumps(leg, ensure_ascii=False) + ';\n')
for l in leg: print(l['t0'], ' '.join(('*' if h else '') + w for w, _, h in l['w']))
