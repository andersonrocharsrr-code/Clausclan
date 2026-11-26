# Linha do tempo: abertura → (viagem + narração) para o Sol e cada planeta → volta para longe no final.
import json, soundfile as sf
from narracao import FALAS
PAL = json.load(open('palavras.json'))
dur = {k: len(sf.read(f'out/nar/{k}.wav')[0]) / sf.info(f'out/nar/{k}.wav').samplerate for k in FALAS}
VIAGEM, ANTES = 2.8, 1.3      # a viagem dura 2,8 s e a narração entra 1,3 s antes de chegar
seg = []; t = 1.0
seg.append({'id': 'intro', 'v0': 0, 'n0': t, 'n1': t + dur['intro']}); t += dur['intro'] + .5
for k in ['sol', 'mercurio', 'venus', 'terra', 'marte', 'jupiter', 'saturno', 'urano', 'netuno', 'final']:
    v0 = t; n0 = v0 + VIAGEM - ANTES; seg.append({'id': k, 'v0': round(v0, 3), 'n0': round(n0, 3), 'n1': round(n0 + dur[k], 3)}); t = n0 + dur[k] + .35
DUR = round(t + 2.2, 2)
for s in seg: s['pal'] = [[w, round(s['n0'] + a, 3)] for w, a, b in PAL[s['id']]]
open('tempos.js', 'w').write(f'window.SEG = {json.dumps(seg, ensure_ascii=False)}; window.DUR = {DUR};\n')
json.dump({'SEG': [{k: v for k, v in s.items() if k != 'pal'} for s in seg], 'DUR': DUR}, open('tempos.json', 'w'), ensure_ascii=False, indent=1)
print('DUR', DUR, [(s['id'], round(s['v0'], 1)) for s in seg])
