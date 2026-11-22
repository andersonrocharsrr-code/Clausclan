# Som em estilo 8-bit: narração (Rodrigo Custódio) + música chiptune (onda quadrada, triângulo, ruído) + efeitos. Uso: python3 audio.py <pasta com nar/> <saida.wav>
import sys, json, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
from scipy.ndimage import maximum_filter1d, uniform_filter1d
P, OUT = sys.argv[1], sys.argv[2]
SR, DUR, OFF = 44100, 15.0, .35; n = int(SR * DUR); rng = np.random.default_rng(4)
CUTS = json.loads(open('tempos.js').read().split('CUTS = ')[1].split(',  DUR')[0].split(', DUR')[0])
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
def env(L, a=.005, r=.05): e = np.ones(L); na, nr = max(1, int(a * SR)), max(1, int(r * SR)); e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.linspace(1, 0, nr); return e
def quad(m, d, duty=.25, g=1.): L = int(d * SR); ph = (hz(m) * np.arange(L) / SR) % 1; return np.where(ph < duty, 1., -1.) * env(L, .003, min(.08, d * .5)) * g
def tri(m, d, g=1.): L = int(d * SR); ph = (hz(m) * np.arange(L) / SR) % 1; return (4 * np.abs(ph - .5) - 1) * env(L, .003, .03) * g
def ruido(d, g=1., dec=30): L = int(d * SR); x = np.repeat(rng.uniform(-1, 1, L // 8 + 1), 8)[:L]; return x * np.exp(-np.arange(L) / SR * dec) * g
mus = np.zeros(n); sfx = np.zeros(n)
def add(buf, sig, t0): i = int(t0 * SR); j = min(n, i + len(sig)); buf[i:j] += sig[:j - i] if i < n else 0
# música: Lá menor misterioso, 132 bpm, colcheias
bpm = 132; b = 60 / bpm; e8 = b / 2
prog = [(57, [57, 60, 64, 69]), (53, [53, 57, 60, 65]), (55, [55, 59, 62, 67]), (52, [52, 56, 59, 64])]  # Am F G E
t = 0.0; k = 0
while t < DUR:
    raiz, arp = prog[(k // 8) % 4]
    add(mus, quad(arp[k % 4] + 12, e8 * .9, .125, .16), t)              # arpejo agudo
    if k % 2 == 0: add(mus, tri(raiz - 24, e8 * 1.8, .45), t)           # baixo triângulo
    if k % 4 == 2: add(mus, ruido(.06, .18, 60), t)                     # chimbal
    if k % 8 == 0: add(mus, ruido(.18, .35, 18), t); add(mus, tri(raiz - 36, .25, .5) * np.exp(-np.arange(int(.25 * SR)) / SR * 14), t)  # bumbo
    if k % 8 == 4: add(mus, ruido(.12, .3, 25), t)                      # caixa
    if k >= 16 and k % 8 == 0: add(mus, quad(arp[3] + 12, b * 3.5, .5, .07), t)  # melodia longa por cima
    t += e8; k += 1
# efeitos
for c in CUTS[1:-1]:  # transição: varredura de ruído
    L = int(.35 * SR); f = np.linspace(1, 0, L); x = np.repeat(rng.uniform(-1, 1, L // 4 + 1), 4)[:L] * f * .25; add(sfx, x, c - .05)
for i, tt in enumerate(np.arange(1.95, 3.5, .5)): add(sfx, quad(84 + (i % 2) * 7, .07, .5, .22), tt)          # bipe do marcador
for i in range(10): add(sfx, quad(72 + i, .03, .25, .12), CUTS[0] + 1.6 + i * .1)                             # máquina de escrever do título
for i in range(3): add(sfx, quad(79 + i * 5, .06, .5, .18), CUTS[1] + .8 + i * .3)                             # ilhas aparecendo
for tt in (CUTS[2] + .5, CUTS[2] + 1.5, CUTS[2] + 2.5): add(sfx, quad(91, .05, .5, .15), tt); add(sfx, quad(96, .05, .5, .12), tt + .08)  # bipe da estação
L = int(1.8 * SR); f = np.linspace(0, 1, L); x = np.repeat(rng.uniform(-1, 1, L // 12 + 1), 12)[:L]; add(sfx, x * f * .35, CUTS[3])  # fogo da reentrada
add(sfx, ruido(1.2, .9, 3.5), CUTS[3] + 1.75); add(sfx, tri(33, .8, .6) * np.exp(-np.arange(int(.8 * SR)) / SR * 4), CUTS[3] + 1.75)  # explosão + baque
for i in range(8): add(sfx, quad(76 + int(rng.integers(0, 12)), .04, .5, .1), CUTS[3] + 2.0 + i * .13)        # bolhas
nar = np.zeros(n); d, _ = sf.read(f'{P}/nar/a_curta.wav'); d = d if d.ndim == 1 else d.mean(1); d /= np.abs(d).max(); add(nar, d * .92, OFF)
sos = butter(2, 5500, 'low', fs=SR, output='sos'); mus = sosfilt(sos, mus); mus /= np.abs(mus).max(); sfx /= max(1e-9, np.abs(sfx).max())
a = np.abs(nar); k = int(.05 * SR); v = np.clip(np.convolve(a, np.ones(k) / k, 'same') / .05, 0, 1); v = uniform_filter1d(maximum_filter1d(v, int(.4 * SR)), int(.3 * SR))
mix = mus * .2 * (1 - .45 * v) + sfx * .3 * (1 - .4 * v) + nar
fade = np.ones(n); fade[-int(.4 * SR):] = np.linspace(1, 0, int(.4 * SR)); mix *= fade; mix = np.tanh(mix * 1.05) / np.tanh(1.05); mix /= np.abs(mix).max() / .95
sf.write(OUT, np.stack([mix, mix], 1).astype(np.float32), SR); print('ok')
