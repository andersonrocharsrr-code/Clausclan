# Linha do tempo: cada trecho começa com a transição (a cena anterior encolhe num círculo) e a fala entra logo depois.
import json, soundfile as sf
from narracao import FALAS
PAL = json.load(open('palavras.json'))
dur = {k: len(sf.read(f'out/nar/{k}.wav')[0]) / sf.info(f'out/nar/{k}.wav').samplerate for k in FALAS}
seg = []; t = 0.0
for i, k in enumerate(FALAS):
    v0 = t; n0 = v0 + (.6 if i == 0 else .45); seg.append({'id': k, 'v0': round(v0, 3), 'n0': round(n0, 3), 'n1': round(n0 + dur[k], 3)}); t = n0 + dur[k] + .2
DUR = round(t + 3.6, 2)
for s in seg: s['pal'] = [[w, round(s['n0'] + a, 3), round(s['n0'] + b, 3)] for w, a, b in PAL[s['id']]]
open('tempos.js', 'w').write(f'window.SEG = {json.dumps(seg, ensure_ascii=False)}; window.DUR = {DUR};\n')
json.dump({'SEG': [{k: v for k, v in s.items() if k != 'pal'} for s in seg], 'DUR': DUR}, open('tempos.json', 'w'), ensure_ascii=False, indent=1)
print('DUR', DUR, [(s['id'], round(s['v0'], 1)) for s in seg])
