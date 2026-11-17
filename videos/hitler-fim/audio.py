# Mixa narração + efeitos + música. Uso: python3 audio.py <pasta com nar/ e sfx/> <saida.wav>
import sys, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
from scipy.ndimage import maximum_filter1d, uniform_filter1d
BASE, OUT = sys.argv[1], sys.argv[2]
SR = 44100; D = 230.0; n = int(SR * D); t = np.arange(n) / SR
rng = np.random.default_rng(15)
CUTS = [0, 10.4, 14.1, 18.0, 24.0, 32.2, 39.5, 44.2, 47.0, 51.0, 63.6, 69.4, 81.0, 85.0, 91.2, 96.0, 101.0, 109.0, 117.0, 123.0, 134.5, 148.0, 154.6, 158.6, 165.0, 176.0, 183.8, 188.0, 193.4, 201.0, 210.0, D]
NAR = {'a': 3.0, 'b': 25.0, 'c': 52.0, 'd': 97.0, 'e': 124.0, 'f': 151.0, 'g': 176.0, 'h': 201.0}
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
ps(0, 'ruins', 0.6, dur=10.6, fin=1.0, fout=0.6); ps(9.0, 'ruins', 0.3, dur=5, fin=0.5, fout=0.5, off=3)
ps(10.4, 'planes', 0.8, dur=3.9, fin=0.4, fout=0.6)
ps(14.1, 'artillery', 0.25, dur=4.0, fin=0.4, fout=0.6)
ps(18.0, 'ruins', 0.35, dur=6.2, fin=0.3, fout=0.8, off=2)
ps(24.0, 'generator', 0.3, dur=8.2, fin=1.0, fout=0.3); ps(32.2, 'generator', 0.6, dur=12.0, fin=0.2, fout=0.6, off=1)
ps(44.2, 'generator', 0.35, dur=6.8, fin=0.3, fout=1.0, off=2)
ps(53.0, 'artillery', 0.5, dur=10.6, fin=1.0, fout=0.8); ps(63.6, 'explosions', 0.8, dur=5.8, fin=0.1, fout=0.8); ps(63.6, 'artillery', 0.4, dur=5.8, fin=0.2, fout=0.8, off=2)
ps(69.4, 'generator', 0.35, dur=11.6, fin=0.3, fout=0.6); ps(72.3, 'dust', 0.5, dur=3, fin=0.05, fout=0.8)
ps(81.0, 'artillery', 0.35, dur=4.0, fin=0.3, fout=0.4, off=4); ps(85.0, 'wind', 0.35, dur=6.2, fin=0.5, fout=0.6)
ps(96.0, 'generator', 0.3, dur=5.0, fin=0.5, fout=0.6, off=3)
ps(103.5, 'typewriter', 0.25, dur=3, fin=0.1, fout=0.5); ps(107.4, 'stamp', 1.0, dur=1.5, fin=0.01, fout=0.4)
ps(109.4, 'radio', 0.55, dur=6, fin=0.1, fout=1.0); ps(117.0, 'generator', 0.35, dur=6.0, fin=0.4, fout=0.8, off=4)
ps(123.0, 'generator', 0.3, dur=11.5, fin=0.4, fout=0.5); ps(126.3, 'dust', 0.7, dur=3.5, fin=0.05, fout=0.8); ps(130.8, 'dust', 0.5, dur=3.5, fin=0.05, fout=0.8)
ps(134.5, 'typewriter', 0.55, dur=10, fin=0.1, fout=0.4); ps(144.5, 'typewriter', 0.4, dur=3.5, fin=0.1, fout=1.0, off=2)
ps(151.9, 'clock', 0.7, dur=2.7, fin=0.05, fout=0.5); ps(148.4, 'typewriter', 0.12, dur=2.6, fin=0.4, fout=0.8, off=4)
ps(154.6, 'generator', 0.4, dur=3.0, fin=0.2, fout=0.05, off=5)
ps(158.6, 'fire', 0.7, dur=6.4, fin=0.6, fout=0.8); ps(158.6, 'ruins', 0.3, dur=6.4, fin=0.6, fout=0.8, off=4)
ps(165.0, 'explosions', 0.45, dur=6, fin=0.3, fout=0.6); ps(170.0, 'artillery', 0.35, dur=6, fin=0.3, fout=1.5, off=5)
ps(177.0, 'candle', 0.6, dur=4, fin=0.05, fout=1.0)
ps(183.8, 'wind', 0.4, dur=4.2, fin=0.4, fout=0.6)
ps(188.0, 'hangar', 0.25, dur=5.4, fin=0.3, fout=0.5)
ps(193.4, 'bells', 0.7, dur=7.6, fin=0.2, fout=1.2); ps(193.4, 'cheer', 0.55, dur=7.6, fin=0.2, fout=1.2)
ps(210.0, 'ruins', 0.4, dur=20, fin=1.0, fout=4.0); ps(219.0, 'ruins', 0.25, dur=10, fin=1.0, fout=4.0, off=2)
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
#        1     2     3     4     5     6     7     8     9     10    11    12    13    14    15    16    17    18    19    20    21    22    23    24    25    26    27    28    29    30    31
prog = ['Dm', 'Bb', 'Gm', 'A', 'Dm', 'Bb', 'Gm', 'Dm', 'A', 'Dm', 'Gm', 'A', 'Dm', 'F', 'C', 'Gm', 'Bb', 'Gm', 'A', 'Dm', 'Bb', 'A', 'Dm', 'Gm', 'Bb', 'Dm', 'F', 'C', 'F', 'Dm', 'D']
inten = [.6, .7, .7, .55, .55, .45, .5, .45, .5, .7, .85, .8, .75, .55, .6, .5, .55, .55, .6, .55, .55, .4, .45, .55, .75, .35, .5, .55, .8, .55, .6]
fast = {1, 9, 10, 12}               # staccato nas cenas de ataque e cerco
timps = {0, 4, 9, 10, 15, 19, 21, 24, 29}
for i, ch in enumerate(prog):
    st = CUTS[i]; L = CUTS[i + 1] - st; notes = CH[ch]
    for j, m in enumerate(notes): add(strings(m, L + 1.5, (1.4 if j < 2 else 0.7) * inten[i], 6), st, 0.25 + 0.1 * j)
    if i in timps: add(timp(notes[1], 0.6 * inten[i]), st, 0.5)
    if i in fast:
        for k in range(int(L * 4)):
            m = notes[2] if k % 4 != 3 else notes[3]
            add(stac(m - 12 if k % 8 < 6 else m - 5, (0.9 if k % 4 == 0 else 0.5) * inten[i]), st + k * 0.25, 0.42)
for k in range(5): add(timp(26, 0.5), 151.0 + k * 0.9, 0.5)


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
