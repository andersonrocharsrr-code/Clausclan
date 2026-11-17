# Mixa narração (Jonas) + efeitos + música sombria (órgão e cordas graves). Uso: python3 audio.py <pasta com nar/ e sfx/> <saida.wav>
import sys, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
from scipy.ndimage import maximum_filter1d, uniform_filter1d
BASE, OUT = sys.argv[1], sys.argv[2]
SR = 44100; D = 30.0; n = int(SR * D); t = np.arange(n) / SR; rng = np.random.default_rng(13)
NAR = {'a': 2.2, 'b': 9.8, 'c': 18.6}; C = [0, 7.7, 9.8, 13.9, 15.4, 16.9, 18.6, 23.4, D]
filt = lambda x, k, fc, o=2, axis=-1: sosfilt(butter(o, fc, k, fs=SR, output='sos'), x, axis=axis)
env = lambda pts: np.interp(t, [p[0] for p in pts], [p[1] for p in pts])
sfx = np.zeros((n, 2)); SM = {}
def smp(k):
    if k not in SM:
        d, _ = sf.read(f'{BASE}/sfx/{k}.wav'); d = d if d.ndim == 2 else np.stack([d, d], 1); d = filt(d, 'low', 7000, 4, axis=0); SM[k] = d / max(1e-9, np.abs(d).max())
    return SM[k]
def ps(t0, k, g, dur=None, fin=.3, fout=.8, off=0):
    d = smp(k)[int(off * SR):]; d = d[:int(dur * SR)] if dur else d; L = len(d); e = np.ones(L)
    nf, no = min(L, int(fin * SR)), min(L, int(fout * SR)); e[:nf] = np.linspace(0, 1, nf) if nf else 1; e[L - no:] *= np.linspace(1, 0, no) if no else 1
    i = int(t0 * SR); j = min(n, i + L); sfx[i:j] += d[:j - i] * e[:j - i, None] * g
ps(0, 'vento', .7, dur=10, fin=1.2, fout=1.5); ps(9.6, 'vento', .45, dur=4.4, fin=.4, fout=.8, off=2); ps(23.2, 'vento', .6, dur=6.8, fin=1, fout=2)
ps(3.0, 'lobo', .55, dur=5, fin=.2, fout=1.5); ps(25.5, 'lobo', .4, dur=4.5, fin=.2, fout=2)
ps(5.6, 'morcegos', .35, dur=4, fin=.3, fout=1); ps(7.7, 'morcegos', .8, dur=3.5, fin=.05, fout=1); ps(15.5, 'morcegos', .9, dur=3.5, fin=.05, fout=1.2); ps(24.5, 'morcegos', .4, dur=4, fin=.5, fout=1.5)
ps(15.25, 'caixao', .8, dur=3, fin=.02, fout=1); ps(13.9, 'sino', .55, dur=5, fin=.02, fout=2); ps(18.4, 'trovao', .55, dur=5, fin=.1, fout=2)
ps(9.8, 'coracao', .5, dur=4, fin=.3, fout=1); ps(16.9, 'coracao', .7, dur=2.4, fin=.1, fout=1)
sfx = filt(sfx, 'high', 28, axis=0); sfx /= max(1e-9, np.abs(sfx).max())
mus = np.zeros((n, 2)); hz = lambda m: 440 * 2 ** ((m - 69) / 12)
def add(sig, st, pan=.5, g=1.):
    i = int(st * SR); j = min(n, i + len(sig)); s = sig[:j - i] * g; mus[i:j, 0] += s * np.cos(pan * np.pi / 2); mus[i:j, 1] += s * np.sin(pan * np.pi / 2)
def adsr(L, a, r): x = np.ones(L); na, nr = max(1, int(a * SR)), max(1, int(r * SR)); x[:na] = np.linspace(0, 1, na); x[-nr:] *= np.linspace(1, 0, nr); return x
def orgao(m, dur, g=1.):
    L = int(dur * SR); tt = np.arange(L) / SR; s = np.zeros(L)
    for mult, a in ((1, 1), (2, .6), (3, .3), (4, .35), (.5, .5), (6, .12)): s += a * np.sin(2 * np.pi * hz(m) * mult * tt * (1 + .0015 * np.sin(2 * np.pi * 5.5 * tt)))
    return filt(s, 'low', 2500) * adsr(L, .25, 1.2) * g * .045
def cordas(m, dur, g=1.):
    L = int(dur * SR); tt = np.arange(L) / SR; s = np.zeros(L)
    for det in (-.006, 0, .005):
        ph = 2 * np.pi * np.cumsum(hz(m) * (1 + det) * (1 + .004 * np.sin(2 * np.pi * 5 * tt + rng.random() * 6))) / SR
        for k in range(1, 7): s += np.sin(k * ph) / k ** 1.3 / 3
    return s * adsr(L, min(1.6, dur * .3), min(2, dur * .4)) * g * .09
def timp(m, g=1.):
    L = int(1.8 * SR); tt = np.arange(L) / SR; ph = 2 * np.pi * np.cumsum(hz(m) * (1 + .25 * np.exp(-tt * 30))) / SR
    return (np.sin(ph) + .4 * np.sin(1.5 * ph)) * np.exp(-tt * 2.8) * g * .24
ACORD = {'Dm': (38, 50, 53, 57, 62), 'Bb': (34, 46, 50, 53, 58), 'Gm': (31, 43, 50, 55, 58), 'A': (33, 45, 49, 52, 57), 'Eb': (39, 51, 55, 58, 63)}
prog = ['Dm', 'Dm', 'Bb', 'Gm', 'A', 'Eb', 'Gm', 'Dm']
for i, ch in enumerate(prog):
    st, L = C[i], C[i + 1] - C[i]
    for j, m in enumerate(ACORD[ch]): add(cordas(m - 12 if j < 2 else m, L + 1.5, 1.2 if j < 2 else .6), st, .3 + .1 * j)
    if i in (1, 2, 5, 6, 7): [add(orgao(m, L + 1, .9), st, .5) for m in ACORD[ch][1:4]]
    add(timp(ACORD[ch][0], .7 if i in (1, 2, 5, 7) else .4), st, .5)
for k in range(6): add(timp(26, .45), 16.9 + k * .28, .5)
rev = np.zeros_like(mus)
for d, g in ((.041, .5), (.067, .42), (.11, .36), (.19, .3), (.31, .22), (.47, .16), (.7, .1)): k = int(d * SR); rev[k:] += mus[:-k] * g
mus = filt(mus * .7 + rev * .6, 'high', 28, axis=0); mus *= env([(0, 0), (1.5, .9), (D - 2, .9), (D - .1, 0)])[:, None]; mus /= np.abs(mus).max()
nar = np.zeros(n)
for k, t0 in NAR.items():
    d, _ = sf.read(f'{BASE}/nar/{k}.wav'); d = d if d.ndim == 1 else d.mean(1); d /= np.abs(d).max(); i = int(t0 * SR); j = min(n, i + len(d)); nar[i:j] += d[:j - i]
nar = nar / np.abs(nar).max() * .92
a = np.abs(nar); k = int(.05 * SR); v = np.clip(np.convolve(a, np.ones(k) / k, 'same') / .05, 0, 1); v = uniform_filter1d(maximum_filter1d(v, int(.5 * SR)), int(.35 * SR))
mix = mus * .26 * (1 - .5 * v)[:, None] + sfx * .38 * (1 - .55 * v)[:, None] + np.stack([nar, nar], 1)
mix *= env([(0, 0), (.05, 1), (D - 1, 1), (D - .05, 0)])[:, None]; mix = np.tanh(mix * 1.05) / np.tanh(1.05); mix /= np.abs(mix).max() / .95
sf.write(OUT, mix.astype(np.float32), SR); print('ok')
