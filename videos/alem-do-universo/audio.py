# Som deste vídeo (diferente do Sistema Solar): pulso grave como batida de coração que acelera no final, textura de cristal no alto,
# em cada transição um sopro ao contrário que sobe e um impacto fundo quando a janela vira ponto; "tic" digital quando o título abre;
# teclas na pergunta final. Narração na frente, com abafamento da trilha. Saída: out/mix.wav (-14 LUFS)
import json, pathlib, subprocess, numpy as np, soundfile as sf
AQUI = pathlib.Path(__file__).resolve().parent
TP = json.load(open(AQUI / 'tempos.json')); SEG = TP['SEG']; DUR = TP['DUR']; SR = 48000; N = int(SR * DUR)
rng = np.random.default_rng(4); tt = lambda d: np.arange(int(d * SR)) / SR; hz = lambda m: 440 * 2 ** ((m - 69) / 12)
def put(buf, sig, t0, g=1., pan=0.):
    i = int(t0 * SR)
    if i >= N or i < 0: return
    j = min(N, i + len(sig)); s = sig[:j - i] * g; buf[i:j, 0] += s * (1 - max(0, pan)); buf[i:j, 1] += s * (1 + min(0, pan))
from scipy.signal import lfilter
def lp(x, a): return lfilter([a], [1, a - 1], x)
def lpv(x, a): # passa-baixa com coeficiente que muda no tempo, em blocos
    y = np.zeros_like(x); zi = np.zeros(1)
    for k in range(0, len(x), 256): c = a[k]; y[k:k + 256], zi = lfilter([c], [1, c - 1], x[k:k + 256], zi=zi)
    return y
mus = np.zeros((N, 2)); sfx = np.zeros((N, 2))
# fundo: acorde de Lá menor com nona, bem aberto, respirando devagar
t = tt(DUR)
for m, g, pan in [(33, .5, 0), (45, .35, -.3), (52, .25, .3), (60, .18, -.2), (64, .14, .2), (71, .1, 0)]:
    for dt in (-.0015, .0015): put(mus, np.sin(2 * np.pi * hz(m) * (1 + dt) * t + rng.random() * 6) * g * (.75 + .25 * np.sin(2 * np.pi * (.03 + .01 * m / 70) * t + m)), 0, 1, pan)
# cristais no alto
for k in range(int(DUR * 1.4)):
    t0 = rng.random() * DUR; f = hz(rng.choice([76, 79, 81, 83, 84, 88])); d = tt(2.5); put(mus, np.sin(2 * np.pi * f * d) * np.exp(-d * 1.6) * (1 - np.exp(-d * 60)) * .05, t0, 1, rng.uniform(-.8, .8))
# pulso grave: começa a cada 1,6 s e acelera para 0,9 s no final
tp = 1.0
while tp < DUR - 3:
    d = tt(.9); f = 52 * np.exp(-d * 6) + 38; put(mus, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-d * 5.5) * .55, tp)
    tp += 1.6 - .7 * (tp / DUR)
# transições: sopro ao contrário + impacto quando vira ponto
CONT = {'espaco', 'andromeda'}
for s in SEG[1:]:
    if s['id'] in CONT: continue
    d = tt(1.5); x = rng.standard_normal(len(d)); a = .002 + .25 * (d / 1.5) ** 2.5; sw = lpv(x, a) * (d / 1.5) ** 2 * 1.4; put(sfx, sw, s['v0'], .5, -.2); put(sfx, sw[::-1] * 0, s['v0'])
    b = tt(2.2); boom = np.sin(2 * np.pi * np.cumsum(34 + 40 * np.exp(-b * 10)) / SR) * np.exp(-b * 2.2) + lp(rng.standard_normal(len(b)), .03) * np.exp(-b * 9) * 1.5; put(sfx, boom, s['v0'] + 1.45, .8)
    sh = tt(1.6); put(sfx, np.sin(2 * np.pi * hz(88) * sh) * np.exp(-sh * 2.5) * .25 + np.sin(2 * np.pi * hz(95) * sh) * np.exp(-sh * 3) * .15, s['v0'] + 1.45, .7, .4)
# "tic" digital quando cada título abre
for s in SEG:
    for j in range(3): c = tt(.03); put(sfx, np.sin(2 * np.pi * 2400 * c) * np.exp(-c * 180), s['n0'] + j * .07, .25, .2 * (j - 1))
# teclas na pergunta final (18 letras em 1,2 s)
tq = SEG[-1]['n1'] + .3
for j in range(18): c = tt(.04); put(sfx, (rng.standard_normal(len(c)) * .5 + np.sin(2 * np.pi * 1800 * c)) * np.exp(-c * 120), tq + j * 1.2 / 18, .22, rng.uniform(-.3, .3))
c = tt(4); put(sfx, np.sin(2 * np.pi * np.cumsum(30 + 30 * np.exp(-c * 4)) / SR) * np.exp(-c * .9), tq + 1.3, .7)
nar = np.zeros(N)
for s in SEG:
    d, sr = sf.read(AQUI / f"out/nar/{s['id']}.wav"); d = d if d.ndim == 1 else d.mean(1)
    if sr != SR: d = np.interp(np.arange(int(len(d) * SR / sr)) * sr / SR, np.arange(len(d)), d)
    d = d / np.abs(d).max(); i = int(s['n0'] * SR); j = min(N, i + len(d)); nar[i:j] += d[:j - i]
v = np.convolve(np.abs(nar), np.ones(int(.1 * SR)) / int(.1 * SR), 'same'); v = np.clip(v / .08, 0, 1)
mix = mus * .09 * (1 - .45 * v)[:, None] + sfx * .2 * (1 - .3 * v)[:, None] + np.stack([nar, nar], 1) * .9
f = np.ones(N); f[:int(.6 * SR)] = np.linspace(0, 1, int(.6 * SR)); f[-int(1.5 * SR):] = np.linspace(1, 0, int(1.5 * SR)); mix *= f[:, None]; mix *= .93 / np.abs(mix).max()
sf.write(AQUI / 'out/mix_raw.wav', mix.astype(np.float32), SR)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', AQUI / 'out/mix_raw.wav', '-af', 'loudnorm=I=-14:TP=-1:LRA=11', '-ar', '48000', AQUI / 'out/mix.wav'], check=True); print('out/mix.wav')
