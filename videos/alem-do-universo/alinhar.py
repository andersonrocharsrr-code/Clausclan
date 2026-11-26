# Corta o silêncio das pontas de cada fala e alinha palavra por palavra (ElevenLabs forced-alignment). Uso: python3 alinhar.py <pasta com nar/>
import json, os, sys, numpy as np, soundfile as sf, requests
from narracao import FALAS
P = sys.argv[1]; so = sys.argv[2:]; out = json.load(open('palavras.json')) if so else {}
for k, txt in FALAS.items():
    if so and k not in so: continue
    d, sr = sf.read(f'{P}/nar/{k}.wav'); a = np.abs(d) > .02; i0, i1 = np.argmax(a), len(a) - np.argmax(a[::-1])
    d = d[max(0, i0 - int(.04 * sr)): min(len(d), i1 + int(.12 * sr))]; sf.write(f'{P}/nar/{k}.wav', d, sr)
    r = requests.post('https://api.elevenlabs.io/v1/forced-alignment', headers={'xi-api-key': os.environ.get('ELEVENLABS_API_KEY', 'proxy')},
                      files={'file': (f'{k}.wav', open(f'{P}/nar/{k}.wav', 'rb'), 'audio/wav')}, data={'text': txt.replace(';', ',')}, timeout=120)
    r.raise_for_status(); ws = [w for w in r.json()['words'] if w['text'].strip()]
    out[k] = [[w['text'], round(w['start'], 3), round(w['end'], 3)] for w in ws]; print(k, round(len(d) / sr, 2), len(out[k]), flush=True)
json.dump(out, open('palavras.json', 'w'), ensure_ascii=False)
