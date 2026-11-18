# Mixa narração (Rodrigo Custódio) + efeitos + trilha gótica (órgão, cordas graves, coro, sinos). Uso: python3 audio.py <pasta com nar/ e sfx/> <saida.wav>
import sys, os, json, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
from scipy.ndimage import maximum_filter1d, uniform_filter1d
BASE, OUT = sys.argv[1], sys.argv[2]
TP = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tempos.json')))
SR = 44100; D = TP['DUR']; n = int(SR * D); t = np.arange(n) / SR; rng = np.random.default_rng(31); C = TP['CUTS']; NAR = TP['NARS']
filt = lambda x, k, fc, o=2, axis=-1: sosfilt(butter(o, fc, k, fs=SR, output='sos'), x, axis=axis)
env = lambda pts: np.interp(t, [p[0] for p in pts], [p[1] for p in pts])
sfx = np.zeros((n, 2)); SM = {}
def smp(k):
    if k not in SM:
        d, _ = sf.read(f'{BASE}/sfx/{k}.wav'); d = d if d.ndim == 2 else np.stack([d, d], 1); d = filt(d, 'low', 7000, 4, axis=0); SM[k] = d / max(1e-9, np.abs(d).max())
    return SM[k]
def ps(t0, k, g, dur=None, fin=.3, fout=.8, off=0):
    d = smp(k)[int(off * SR):]; d = d[:int(dur * SR)] if dur else d; L = len(d)
    if L <= 0: return
    e = np.ones(L); nf, no = min(L, int(fin * SR)), min(L, int(fout * SR))
    if nf: e[:nf] = np.linspace(0, 1, nf)
    if no: e[L - no:] *= np.linspace(1, 0, no)
    i = int(t0 * SR); j = min(n, i + L)
    if i < n: sfx[i:j] += d[:j - i] * e[:j - i, None] * g
def cena(k, nome, g, ini=0, fim=0):  # cobre a cena k com o som (repetindo se precisar)
    st, L = C[k] + ini, C[k + 1] - C[k] - ini - fim + .6; tot = len(smp(nome)) / SR - .6; o = 0.0
    while L > .05: d = min(L, tot); ps(st + o, nome, g, dur=d, fin=.5 if o == 0 else .8, fout=.8, off=0 if o == 0 else .4); o += max(.5, d - .8); L -= max(.5, d - .8)
for k, nome, g in [(0, 'vento', .7), (1, 'vento', .5), (2, 'vento', .55), (3, 'vento', .4), (4, 'vento', .2), (6, 'tambores', .35), (7, 'tambores', .45), (9, 'vento', .25), (11, 'corvos', .6), (11, 'vento', .35),
                   (12, 'vento', .25), (13, 'tambores', .6), (14, 'fogo', .5), (14, 'cavalos', .8), (14, 'batalha', .55), (15, 'corvos', .55), (15, 'vento', .45), (16, 'cavalos', .45), (17, 'corrente', .55), (18, 'batalha', .5), (18, 'vento', .5),
                   (19, 'vento', .4), (20, 'londres', .65), (21, 'pena', .6), (22, 'vento', .45), (23, 'paginas', .5), (24, 'pena', .7), (25, 'paginas', .35), (26, 'paginas', .5), (27, 'vento', .55), (27, 'cavalos', .4),
                   (28, 'vento', .2), (31, 'vento', .2), (32, 'vento', .5), (33, 'tempestade', .85), (34, 'vento', .15), (35, 'vento', .45), (35, 'cavalos', .35), (37, 'projetor', .6), (38, 'projetor', .6), (39, 'vento', .2),
                   (40, 'turistas', .5), (40, 'vento', .3), (41, 'vento', .6), (42, 'vento', .35), (43, 'vento', .45), (44, 'vento', .65)]:
    cena(k, nome, g)
for k, nome, g, dt in [(0, 'lobo', .5, 4), (1, 'morcegos', .7, .3), (3, 'sino', .5, 2), (8, 'coracao', .5, 1.6), (10, 'sino', .45, .1), (12, 'trovao', .5, .4), (14, 'trovao', .6, 1.1), (19, 'sino', .4, .6), (22, 'sino', .3, 1),
                       (26, 'orgao', .5, .2), (27, 'lobo', .6, 3), (28, 'coracao', .55, .2), (29, 'orgao', .35, 0), (30, 'morcegos', .5, .4), (31, 'caixao', .7, .5), (32, 'grito', .8, 0), (32, 'lobo', .7, L32 := (C[33] - C[32]) * .36),
                       (33, 'trovao', .8, 1.4), (33, 'trovao', .7, 4.3), (36, 'orgao', .45, 0), (39, 'coracao', .5, 0), (43, 'grito', .7, 1.2), (44, 'lobo', .5, 3), (44, 'morcegos', .5, 6)]:
    ps(C[k] + dt, nome, g, dur=6, fin=.05, fout=1.2)
sfx = filt(sfx, 'high', 28, axis=0); sfx /= max(1e-9, np.abs(sfx).max())
mus = np.zeros((n, 2)); hz = lambda m: 440 * 2 ** ((m - 69) / 12)
def add(sig, st, pan=.5, g=1.):
    i = int(st * SR)
    if i >= n: return
    j = min(n, i + len(sig)); s = sig[:j - i] * g; mus[i:j, 0] += s * np.cos(pan * np.pi / 2); mus[i:j, 1] += s * np.sin(pan * np.pi / 2)
def adsr(L, a, r): x = np.ones(L); na, nr = max(1, int(a * SR)), max(1, int(r * SR)); x[:na] = np.linspace(0, 1, na); x[-nr:] *= np.linspace(1, 0, nr); return x
def orgao(m, dur, g=1.):
    L = int(dur * SR); tt = np.arange(L) / SR; s = np.zeros(L)
    for mult, a in ((1, 1), (2, .6), (3, .3), (4, .35), (.5, .5), (6, .12), (8, .08)): s += a * np.sin(2 * np.pi * hz(m) * mult * tt * (1 + .0015 * np.sin(2 * np.pi * 5.5 * tt)))
    return filt(s, 'low', 2600) * adsr(L, .3, 1.4) * g * .04
def cordas(m, dur, g=1.):
    L = int(dur * SR); tt = np.arange(L) / SR; s = np.zeros(L)
    for det in (-.006, 0, .005):
        ph = 2 * np.pi * np.cumsum(hz(m) * (1 + det) * (1 + .004 * np.sin(2 * np.pi * 5 * tt + rng.random() * 6))) / SR
        for k in range(1, 7): s += np.sin(k * ph) / k ** 1.3 / 3
    return s * adsr(L, min(1.8, dur * .3), min(2.2, dur * .4)) * g * .09
def coro(m, dur, g=1.):  # "aah" grave: vogal com formantes
    L = int(dur * SR); tt = np.arange(L) / SR; src = np.zeros(L)
    for det in (-.004, 0, .004, .008): src += np.sign(np.sin(2 * np.pi * hz(m) * (1 + det) * tt + rng.random() * 6)) * .25
    s = sum(filt(src, 'band', [f * .9, f * 1.1]) * a for f, a in ((700, 1), (1100, .6), (2500, .2)))
    return s * adsr(L, min(2, dur * .35), min(2.4, dur * .4)) * g * .06
def sinoG(m, g=1.):
    L = int(5 * SR); tt = np.arange(L) / SR; s = sum(a * np.sin(2 * np.pi * hz(m) * r * tt) * np.exp(-tt * d) for r, a, d in ((1, 1, .8), (2.01, .6, 1.2), (2.4, .4, 1.6), (3.0, .3, 2), (4.2, .2, 2.6)))
    return s * g * .08
def timp(m, g=1.):
    L = int(1.8 * SR); tt = np.arange(L) / SR; ph = 2 * np.pi * np.cumsum(hz(m) * (1 + .25 * np.exp(-tt * 30))) / SR
    return (np.sin(ph) + .4 * np.sin(1.5 * ph)) * np.exp(-tt * 2.8) * g * .24
AC = {'Dm': (38, 50, 53, 57, 62), 'Bb': (34, 46, 50, 53, 58), 'Gm': (31, 43, 50, 55, 58), 'A': (33, 45, 49, 52, 57), 'Eb': (39, 51, 55, 58, 63), 'F': (41, 53, 57, 60, 65), 'Cm': (36, 48, 51, 55, 60), 'C': (36, 48, 52, 55, 60)}
prog = (['Dm', 'Dm', 'Bb', 'Gm', 'Dm', 'A', 'Gm', 'Cm', 'Dm', 'Bb', 'Gm', 'Cm', 'Dm', 'Eb', 'Cm', 'Gm', 'A', 'Dm', 'Bb', 'Gm', 'F', 'C', 'Dm', 'Bb', 'Gm', 'F', 'Dm', 'Gm', 'Dm', 'A', 'Bb', 'Gm', 'Cm', 'Dm', 'F', 'Gm', 'Dm', 'Gm', 'A', 'Dm', 'Bb', 'Gm', 'Dm', 'A', 'Dm'] * 2)[:len(C) - 1]
cartoes = {3, 9, 20, 27, 36}; tensas = {11, 14, 15, 30, 32, 33, 39}
for i, ch in enumerate(prog):
    st, L = C[i], C[i + 1] - C[i]; nt = AC[ch]
    for j, m in enumerate(nt): add(cordas(m - 12 if j < 2 else m, L + 1.6, 1.15 if j < 2 else .55), st, .3 + .1 * j)
    if i in cartoes or i in (0, 1, 12, 42, 43, 44): [add(orgao(m, L + 1.2, .9), st, .5) for m in nt[1:4]]
    if i in (1, 12, 13, 15, 42, 43, 44): [add(coro(m, L + 1.4, .9), st, .5) for m in nt[2:5]]
    if i in cartoes: add(timp(nt[0], .8), st, .5); add(sinoG(nt[1] + 12, .9), st, .55)
    if i in tensas:
        for k in range(int(L * 2)): add(timp(nt[0], .35 + .25 * (k % 2 == 0)), st + k * .5, .5)
for k in range(8): add(timp(26, .5), C[1] + k * .3, .5)
rev = np.zeros_like(mus)
for d, g in ((.041, .5), (.067, .44), (.11, .38), (.19, .32), (.31, .24), (.47, .18), (.7, .12), (1.0, .07)): k = int(d * SR); rev[k:] += mus[:-k] * g
mus = filt(mus * .65 + rev * .65, 'high', 28, axis=0); mus *= env([(0, 0), (2, .9), (D - 3, .95), (D - .1, 0)])[:, None]; mus /= np.abs(mus).max()
nar = np.zeros(n)
for k, t0 in NAR.items():
    d, _ = sf.read(f'{BASE}/nar/{k}.wav'); d = d if d.ndim == 1 else d.mean(1); d /= np.abs(d).max()
    partes = [(t0, d)]
    if k in TP.get('CORTE', {}): ts, extra = TP['CORTE'][k]; cs = int(ts * SR); partes = [(t0, d[:cs]), (t0 + ts + extra, d[cs:])]
    for st, dd in partes: i = int(st * SR); j = min(n, i + len(dd)); nar[i:j] += dd[:j - i]
nar = nar / np.abs(nar).max() * .92
a = np.abs(nar); k = int(.05 * SR); v = np.clip(np.convolve(a, np.ones(k) / k, 'same') / .05, 0, 1); v = uniform_filter1d(maximum_filter1d(v, int(.5 * SR)), int(.35 * SR))
mix = mus * .26 * (1 - .5 * v)[:, None] + sfx * .36 * (1 - .58 * v)[:, None] + np.stack([nar, nar], 1)
mix *= env([(0, 0), (.05, 1), (D - 1.5, 1), (D - .05, 0)])[:, None]; mix = np.tanh(mix * 1.05) / np.tanh(1.05); mix /= np.abs(mix).max() / .95
sf.write(OUT, mix.astype(np.float32), SR); print('ok')
