# Mixa narração + efeitos + música. Uso: python3 audio.py <pasta com nar/ e sfx/> <saida.wav>
import sys, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
from scipy.ndimage import maximum_filter1d, uniform_filter1d
BASE, OUT = sys.argv[1], sys.argv[2]
import json, os
TP = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tempos.json')))
SR = 44100; D = TP['DUR']; n = int(SR * D); t = np.arange(n) / SR
rng = np.random.default_rng(15)
CUTS = TP['CUTS']; NAR = TP['NARS']; C = CUTS
def filt(x, kind, fc, order=2, axis=-1): return sosfilt(butter(order, fc, kind, fs=SR, output='sos'), x, axis=axis)
def env(points): return np.interp(t, [p[0] for p in points], [p[1] for p in points])
# ---------- efeitos (ElevenLabs), sem chiado: corta agudos acima de 7 kHz ----------
sfx = np.zeros((n, 2)); SM = {}
def smp(k):
    if k not in SM:
        d, sr = sf.read(f'{BASE}/sfx/{k}.wav'); d = d if d.ndim == 2 else np.stack([d, d], 1)
        d = filt(d, 'low', 7000, 4, axis=0); SM[k] = d / max(1e-9, np.abs(d).max())
    return SM[k]
def ps(t0, k, g=1.0, dur=None, fin=0.3, fout=0.8, off=0.0):
    d = smp(k)[int(off * SR):]
    if dur: d = d[:int(dur * SR)]
    L = len(d); e = np.ones(L); nf = min(L, int(fin * SR)); no = min(L, int(fout * SR))
    if nf: e[:nf] = np.linspace(0, 1, nf)
    if no: e[-no:] *= np.linspace(1, 0, no)
    i = int(t0 * SR); end = min(n, i + L)
    if i < n: sfx[i:end] += d[:end - i] * e[:end - i, None] * g
def cena(k): return C[k], C[k + 1] - C[k]
for k, nome, g in [(0, 'crowd', .25), (0, 'wind', .35), (1, 'crowd', .6), (2, 'cheer', .7), (5, 'cheer', .25), (7, 'wind', .2), (9, 'crowd', .4), (10, 'crowd', .3),
                   (11, 'wind', .5), (12, 'wind', .2), (16, 'crowd', .5), (17, 'cheer', .55), (18, 'manivela', .55), (18, 'hangar', .3), (19, 'cheer', .7), (19, 'espadas', .8),
                   (20, 'crowd', .7), (21, 'cheer', .4), (22, 'wind', .2), (23, 'wind', .5), (24, 'wind', .4), (25, 'rumble', .9), (25, 'explosions', .5), (26, 'wind', .3),
                   (26, 'martelos', .2), (27, 'crowd', .35), (27, 'wind', .25), (28, 'wind', .3), (28, 'bells', .2)]:
    st, L = cena(k); dd = L + .6; tot = len(smp(nome)) / SR - .6; o = 0.0
    while dd > 0.05: ps(st + o, nome, g, dur=min(dd, tot), fin=.4 if o == 0 else .8, fout=.6 if dd <= tot else .8, off=0 if o == 0 else .4); o += max(.5, min(dd, tot) - .8); dd -= max(.5, min(dd, tot) - .8)
ps(C[4] + 5.0, 'martelos', .6, dur=C[5] - C[4] - 5, fin=.6, fout=.6); ps(C[8] + .7, 'stamp', .6, dur=1.2, fin=.01, fout=.4)
for dt in (2.5, 4.0, 5.5, 7.0): ps(C[13] + dt, 'espada', .35, dur=1.2, fin=.01, fout=.5)
ps(C[14] + .3, 'espada', .35, dur=1.3, fin=.01, fout=.6); ps(C[15] + .2, 'espada', .3, dur=1.3, fin=.01, fout=.6)
ps(C[17] + 4.2, 'rugido', .9, dur=3, fin=.05, fout=.6); ps(C[19] - .4, 'rugido', .8, dur=3, fin=.05, fout=.6)
sfx = filt(sfx, 'high', 28, axis=0); sfx /= max(1e-9, np.abs(sfx).max())
# ---------- música: cordas, staccato nas cenas rápidas e tímpano em cada corte ----------
mus = np.zeros((n, 2))
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def add(sig, start, pan=0.5, g=1.0):
    i = int(start * SR)
    if i >= n: return
    e = min(n, i + len(sig)); s = sig[:e - i] * g; mus[i:e, 0] += s * np.cos(pan * np.pi / 2); mus[i:e, 1] += s * np.sin(pan * np.pi / 2)
def ad(L, a, r):
    x = np.ones(L); na = max(1, int(a * SR)); nr = max(1, int(r * SR)); x[:na] = np.linspace(0, 1, na) ** 1.5; x[-nr:] *= np.linspace(1, 0, nr) ** 1.5; return x
def strings(m, dur, g=1.0, bright=6):
    L = int(dur * SR); tt = np.arange(L) / SR; f = hz(m); s = np.zeros(L)
    for det in (-0.005, 0, 0.004):
        vib = 1 + 0.004 * np.sin(2 * np.pi * 5.1 * tt + rng.random() * 6); ph = 2 * np.pi * np.cumsum(f * (1 + det) * vib) / SR
        for k in range(1, bright + 1): s += np.sin(k * ph) / (k ** 1.25) / 3
    return s * ad(L, min(1.8, dur * .35), min(2.2, dur * .4)) * g * 0.10
def stac(m, g=1.0):
    L = int(0.26 * SR); tt = np.arange(L) / SR; ph = 2 * np.pi * hz(m) * tt; s = sum(np.sin(k * ph) / k for k in range(1, 7))
    return s * np.exp(-tt * 13) * np.minimum(1, tt * 400) * g * 0.085
def timp(m, g=1.0):
    L = int(1.6 * SR); tt = np.arange(L) / SR; f = hz(m) * (1 + 0.25 * np.exp(-tt * 30)); ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) + 0.4 * np.sin(1.5 * ph)) * np.exp(-tt * 3.2) * g * 0.22 + filt(rng.standard_normal(L), 'low', 300) * np.exp(-tt * 26) * g * 0.1
CH = {'Dm': (26, 38, 50, 57, 62, 65), 'Bb': (22, 34, 46, 53, 58, 62), 'Gm': (19, 31, 43, 55, 58, 62), 'A': (21, 33, 45, 52, 57, 61),
      'F': (29, 41, 53, 57, 60, 65), 'C': (24, 36, 48, 55, 60, 64), 'D': (26, 38, 50, 57, 62, 66)}
def brass(m, dur, g=1.0):
    L = int(dur * SR); tt = np.arange(L) / SR; ph = 2 * np.pi * hz(m) * tt * (1 + .003 * np.sin(2 * np.pi * 5 * tt)); s = sum(np.sin(k * ph) * (0.85 ** k) for k in range(1, 12))
    return filt(s, 'low', 2600) * ad(L, 0.06, min(.5, dur * .4)) * g * 0.05
def fanfarra(st, raiz, g=1.0):  # chamada de trompas romanas
    for k, (iv, d) in enumerate([(0, .22), (0, .22), (7, .22), (12, .9), (7, .3), (12, 1.4)]): add(brass(raiz + iv, d + .1, g), st + sum(x[1] for x in [(0, .22), (0, .22), (7, .22), (12, .9), (7, .3), (12, 1.4)][:k]), .5)
#        1     2     3     4     5     6     7     8     9     10    11    12    13    14    15    16    17    18    19    20    21    22    23    24    25    26    27    28    29
prog = ['Dm', 'Bb', 'F', 'Dm', 'Gm', 'F', 'C', 'F', 'Dm', 'Bb', 'F', 'C', 'Dm', 'Gm', 'Dm', 'Bb', 'A', 'Dm', 'Gm', 'Dm', 'A', 'F', 'C', 'Dm', 'Gm', 'Dm', 'Bb', 'F', 'D']
inten = [.7, .75, .85, .9, .55, .7, .5, .55, .45, .55, .5, .5, .45, .6, .7, .7, .75, .8, .6, .95, .85, .6, .5, .4, .45, .7, .5, .55, .75]
fast = {0, 1, 2, 17, 19, 20}
timps = {3, 4, 9, 13, 17, 19, 24, 25}
for i, ch in enumerate(prog[:len(CUTS) - 1]):
    st = CUTS[i]; L = CUTS[i + 1] - st; notes = CH[ch]
    for j, m in enumerate(notes): add(strings(m, L + 1.5, (1.4 if j < 2 else 0.7) * inten[i], 6), st, 0.25 + 0.1 * j)
    if i in timps: add(timp(notes[1], 0.6 * inten[i]), st, 0.5)
    if i in fast:
        for k in range(int(L * 4)):
            m = notes[2] if k % 4 != 3 else notes[3]
            add(stac(m - 12 if k % 8 < 6 else m - 5, (0.9 if k % 4 == 0 else 0.5) * inten[i]), st + k * 0.25, 0.42)
for i, raiz in ((3, 50), (4, 50), (9, 53), (13, 50), (17, 50), (24, 43), (28, 50)): fanfarra(CUTS[i] + (.0 if i == 3 else .1), raiz, 1.0 if i in (3, 28) else .7)



rev = np.zeros_like(mus)
for d, g in ((0.037, .5), (0.053, .42), (0.079, .36), (0.127, .3), (0.21, .22), (0.33, .16), (0.47, .1)):
    k = int(d * SR); rev[k:] += mus[:-k] * g
mus = filt(mus * 0.75 + rev * 0.55, 'high', 28, axis=0)
mus *= env([(0, 0), (0.4, .8), (D - 2.5, .9), (D - 0.2, 0)])[:, None]; mus /= np.abs(mus).max()
# ---------- narração ----------
nar = np.zeros(n)
for k, t0 in NAR.items():
    if not os.path.exists(f'{BASE}/nar/{k}.wav'): print(k, 'sem voz ainda'); continue
    d, sr = sf.read(f'{BASE}/nar/{k}.wav'); d = d if d.ndim == 1 else d.mean(1); d = d / np.abs(d).max(); i = int(t0 * SR); e = min(n, i + len(d)); nar[i:e] += d[:e - i]
    print(k, t0, round(t0 + len(d) / SR, 2))
nar = nar / max(1e-9, np.abs(nar).max()) * 0.92
# música e efeitos abaixam sob a voz
a = np.abs(nar); k = int(0.05 * SR); voice = np.clip(np.convolve(a, np.ones(k) / k, 'same') / 0.05, 0, 1)
voice = uniform_filter1d(maximum_filter1d(voice, int(0.5 * SR)), int(0.35 * SR))
mix = mus * 0.24 * (1 - 0.55 * voice)[:, None] + sfx * 0.36 * (1 - 0.62 * voice)[:, None] + np.stack([nar, nar], 1)
mix *= env([(0, 0), (0.05, 1), (D - 1.2, 1), (D - 0.1, 0)])[:, None]
mix = np.tanh(mix * 1.05) / np.tanh(1.05); mix /= np.abs(mix).max() / 0.95
sf.write(OUT, mix.astype(np.float32), SR); print('ok')
