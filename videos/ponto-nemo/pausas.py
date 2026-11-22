# Encurta as pausas longas da fala (máx. 0,28 s) para o vídeo caber em 15 s. Uso: python3 pausas.py <pasta com nar/>
import json, sys, numpy as np, soundfile as sf
P = sys.argv[1]; d, sr = sf.read(f'{P}/nar/a.wav'); ws = json.load(open('palavras.json'))['a']
MAX = .28; partes, novo, corte, ini = [], [], 0.0, 0.0
for i, (w, s, e) in enumerate(ws):
    if i and s - ws[i - 1][2] > MAX + .05:
        a = ws[i - 1][2] + .1; b = s - (MAX - .1)  # tira o miolo da pausa
        partes.append(d[int(ini * sr):int(a * sr)]); corte += b - a; ini = b
    novo.append([w, round(s - corte, 3), round(e - corte, 3)])
partes.append(d[int(ini * sr):]); f = .006; out = []
for p in partes:  # emendas com fade curtinho
    p = p.copy(); n = int(f * sr); p[:n] *= np.linspace(0, 1, n); p[-n:] *= np.linspace(1, 0, n); out.append(p)
sf.write(f'{P}/nar/a_curta.wav', np.concatenate(out), sr); json.dump({'a': novo}, open('palavras_curta.json', 'w'), ensure_ascii=False)
print(round(sum(len(p) for p in out) / sr, 2))
