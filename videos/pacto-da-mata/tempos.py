# Linha do tempo: início de cada fala (pausas ajustadas para fechar 10:00 exatos) e legendas palavra por palavra.
# Uso: python3 tempos.py            (lê falas.py e palavras.json; escreve tempos.js e tempos.json)
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from falas import FALAS, FINAL, DUR
PAL = json.load(open('palavras.json'))
# pausas fixas (cenas sem fala, cartões de capítulo); as outras encolhem/esticam juntas para fechar a duração
FIXA = {'n01': 7.2, 'd01': 2.4, 'f04': 2.2, 'n06': 1.6, 'n07': 2.4, 'a03': 2.2, 'a05': 5.8, 'n16': 1.6,
        'f12': 9.0, 'n27': 2.4, 'n30': 5.8, 'n33': 2.4, 'a08': 2.0, 'n37': 16.0}
fala = {k: PAL[k][-1][2] for k, *_ in FALAS}
livre = DUR - FINAL - sum(fala.values()) - sum(FIXA.get(k, 0) for k, *_ in FALAS)
base = {k: g for k, _, g, _ in FALAS if k not in FIXA}
MIN = 0.3; esc = (livre - MIN * len(base)) / sum(max(0, g - MIN) for g in base.values())
gap = {k: FIXA.get(k, MIN + max(0, base.get(k, 0) - MIN) * esc) for k, *_ in FALAS}
S, E, t = {}, {}, 0.0
for k, *_ in FALAS: t += gap[k]; S[k] = round(t, 3); t += fala[k]; E[k] = round(t, 3)
print('fator das pausas livres: %.2f | fim da última fala %.1f s | duração %.1f s' % (esc, t, DUR))
assert esc > 0, 'falas longas demais para 10 minutos'
DESTAQUE = {'amazônia', 'firmino', 'menino', 'chuva', 'limites', 'vazias', 'cheia', 'sempre', 'demônio', 'conhecido', 'seringal', 'riqueza',
            'passeio', 'veado', 'anta', 'vara', 'seringueiros', 'pacto', 'sobreviver', 'confiante', 'dono', 'explicar', 'espingarda', 'diferente',
            'ruído', 'capivara', 'macaco', 'porcos-do-mato', 'gelar', 'onça-pintada', 'fugindo', 'maneira', 'araras', 'fugir', 'estranha',
            'jabuti', 'medo', 'silêncio', 'respiração', 'sozinho', 'rotina', 'desaparecido', 'afastar', 'outra', 'animal', 'desaparecido',
            'desconhecido', 'cantar', 'visto', 'dias', 'pegada', 'cobrar', 'pertencia', 'pesados', 'brasas', 'coisa', 'dívidas'}
VOZ = {k: v for k, v, *_ in FALAS}
leg = []
for k, v, _, txt in FALAS:
    ws = [(w, S[k] + a, S[k] + b) for w, a, b in PAL[k]]
    fr, usado = [], False
    def fecha():
        global fr, usado
        if fr: leg.append({'t0': round(fr[0][1] - .1, 2), 't1': round(fr[-1][3] + .5, 2), 'v': v, 'w': [[w, round(a, 2), h] for w, a, h, _ in fr]}); fr = []; usado = False
    for w, a, b in ws:
        nu = re.sub(r'[^\wÀ-ÿ-]', '', w).lower(); h = 1 if v == 'N' and nu in DESTAQUE and not usado else 0; usado = usado or bool(h)
        fr.append([w.upper(), a, h, b]); n = len(fr); ch = sum(len(x[0]) + 1 for x in fr)
        if w[-1] in '.:?!' or (w[-1] in ',;' and (n >= 4 or ch > 34)) or ch > 74: fecha()
    fecha()
for i in range(len(leg) - 1): leg[i]['t1'] = min(leg[i]['t1'], leg[i + 1]['t0'])
FW = {k: [[w, round(S[k] + a, 2)] for w, a, b in PAL[k]] for k in S}
open('tempos.js', 'w').write('// gerado por tempos.py\n' + f'const S = {json.dumps(S)};\nconst E = {json.dumps(E)};\nconst DUR = {DUR};\n'
    f'const FW = {json.dumps(FW, ensure_ascii=False)};\nconst LEG = {json.dumps(leg, ensure_ascii=False)};\n')
json.dump({'S': S, 'E': E, 'DUR': DUR, 'VOZ': VOZ}, open('tempos.json', 'w'))
