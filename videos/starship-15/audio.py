# Mixa narração + efeitos + música. Uso: python3 audio.py <pasta com nar/ e sfx/> <saida.wav>
import sys, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
from scipy.ndimage import maximum_filter1d, uniform_filter1d
BASE, OUT = sys.argv[1], sys.argv[2]
SR = 44100; D = 90.5; n = int(SR * D); t = np.arange(n) / SR
rng = np.random.default_rng(15)
CUTS = [0, 4.6, 9.7, 18.2, 25.0, 30.3, 36.8, 41.2, 45.0, 51.3, 54.8, 60.3, 64.4, 68.0, 72.6, 76.0, 83.0, 85.3, D]
NAR = {'a': 0.4, 'b': 9.9, 'c': 30.5, 'd': 45.2, 'e': 60.5, 'f': 76.1}
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
ps(0, 'wind', 0.5, dur=8, fin=0.5, fout=1.5); ps(7, 'wind', 0.4, dur=3, fin=1, fout=1)
ps(31.3, 'ignite', 0.6, dur=5.7, fin=0.4, fout=0.3); ps(36.6, 'launch', 1.0, dur=5.0, fin=0.15, fout=0.9)
ps(41.2, 'launch', 0.25, dur=3.8, fin=0.3, fout=1.2, off=3)
ps(54.8, 'wind', 0.5, dur=5.6, fin=0.4, fout=0.8)
ps(64.4, 'reentry', 0.7, dur=3.8, fin=0.3, fout=0.5); ps(68.0, 'reentry', 0.45, dur=1.6, fin=0.1, fout=0.6, off=1)
ps(69.15, 'launch', 0.7, dur=3.5, fin=0.15, fout=0.3, off=1.5); ps(72.6, 'burn', 0.9, dur=6, fin=0.05, fout=1.5)
ps(77.5, 'wind', 0.4, dur=5.6, fin=1, fout=0.6); ps(84.0, 'splash', 0.8, dur=2.4, fin=0.02, fout=1.2); ps(85.3, 'wind', 0.45, dur=5.2, fin=0.5, fout=1.5)
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
#        1     2     3     4     5     6     7     8     9     10    11    12    13    14    15    16    17    18
prog = ['Dm', 'Bb', 'Dm', 'F', 'Gm', 'A', 'Dm', 'Bb', 'F', 'C', 'Gm', 'Dm', 'A', 'Bb', 'C', 'F', 'Gm', 'D']
inten = [.6, .7, .5, .5, .6, .8, 1., .8, .5, .6, .75, .6, .85, .9, 1., .6, .5, .8]
fast = {0, 1, 5, 6, 10, 12, 13, 14}   # cenas no estilo rápido: staccato por baixo
for i, ch in enumerate(prog):
    st = CUTS[i]; L = CUTS[i + 1] - st; notes = CH[ch]
    for j, m in enumerate(notes): add(strings(m, L + 1.5, (1.4 if j < 2 else 0.7) * inten[i], 6), st, 0.25 + 0.1 * j)
    add(timp(notes[1], 0.6 * inten[i]), st, 0.5)
    if i in fast:
        for k in range(int(L * 4)):
            m = notes[2] if k % 4 != 3 else notes[3]
            add(stac(m - 12 if k % 8 < 6 else m - 5, (0.9 if k % 4 == 0 else 0.5) * inten[i]), st + k * 0.25, 0.42)
for k in range(6): add(timp(26, 0.45), 72.6 + k * 0.5, 0.5)
rev = np.zeros_like(mus)
for d, g in ((0.037, .5), (0.053, .42), (0.079, .36), (0.127, .3), (0.21, .22), (0.33, .16), (0.47, .1)):
    k = int(d * SR); rev[k:] += mus[:-k] * g
mus = filt(mus * 0.75 + rev * 0.55, 'high', 28, axis=0)
mus *= env([(0, 0), (0.4, .8), (D - 2.5, .9), (D - 0.2, 0)])[:, None]; mus /= np.abs(mus).max()
# ---------- narração ----------
nar = np.zeros(n)
for k, t0 in NAR.items():
    d, sr = sf.read(f'{BASE}/nar/{k}.wav'); d = d if d.ndim == 1 else d.mean(1); d = d / np.abs(d).max(); i = int(t0 * SR); e = min(n, i + len(d)); nar[i:e] += d[:e - i]
    print(k, t0, round(t0 + len(d) / SR, 2))
nar = nar / np.abs(nar).max() * 0.92
# música e efeitos abaixam sob a voz
a = np.abs(nar); k = int(0.05 * SR); voice = np.clip(np.convolve(a, np.ones(k) / k, 'same') / 0.05, 0, 1)
voice = uniform_filter1d(maximum_filter1d(voice, int(0.5 * SR)), int(0.35 * SR))
mix = mus * 0.24 * (1 - 0.55 * voice)[:, None] + sfx * 0.36 * (1 - 0.62 * voice)[:, None] + np.stack([nar, nar], 1)
mix *= env([(0, 0), (0.05, 1), (D - 1.2, 1), (D - 0.1, 0)])[:, None]
mix = np.tanh(mix * 1.05) / np.tanh(1.05); mix /= np.abs(mix).max() / 0.95
sf.write(OUT, mix.astype(np.float32), SR); print('ok')
