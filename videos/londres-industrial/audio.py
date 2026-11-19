# Mixa narração (Rodrigo Custódio) + efeitos + trilha sombria (cordas graves, coro baixo, tique-taque de máquina, sinos). Uso: python3 audio.py <pasta com nar/ e sfx/> <saida.wav>
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
for k, nome, g in [(0, 'rio', .5), (1, 'cidade', .6), (2, 'vapor', .8), (3, 'vento', .3), (4, 'vapor', .3), (4, 'fogo', .3), (5, 'carvao', .7), (6, 'fabrica', .3), (7, 'cidade', .3), (7, 'vento', .3),
                   (8, 'cidade', .6), (9, 'cascos', .5), (9, 'vento', .3), (10, 'docas', .7), (11, 'docas', .5), (12, 'fabrica', .4), (12, 'vento', .3), (13, 'cascos', .8), (13, 'cidade', .4), (14, 'cidade', .5),
                   (15, 'chuva', .2), (15, 'cidade', .2), (16, 'fabrica', .8), (16, 'relogio', .5), (17, 'vento', .6), (18, 'jornaleiro', .6), (19, 'fogo', .4), (19, 'chuva', .2), (20, 'cidade', .3), (20, 'vento', .4),
                   (21, 'rio', .6), (22, 'chuva', .7), (22, 'cascos', .3), (23, 'canetas', .4), (23, 'fogo', .2), (24, 'bomba', .5), (24, 'cidade', .2), (25, 'rio', .5), (25, 'cidade', .3), (26, 'tunel', .2), (26, 'rio', .4),
                   (27, 'cidade', .4), (28, 'vento', .2), (29, 'cidade', .5), (29, 'vapor', .3), (30, 'cidade', .4), (31, 'tunel', .8), (32, 'multidao', .4), (33, 'fabrica', .4), (34, 'multidao', .7), (35, 'multidao', .5),
                   (35, 'docas', .3), (36, 'cidade', .4), (37, 'bomba', .4), (38, 'vento', .4), (39, 'trem', .5), (40, 'rio', .4), (40, 'trem', .3)]:
    cena(k, nome, g)
TRS = {1: 'whoosh', 2: 'whoosh', 4: 'whoosh', 6: 'impacto', 8: 'impacto', 9: 'whoosh', 10: 'whoosh', 11: 'impacto', 12: 'whoosh', 13: 'whoosh', 14: 'whoosh', 17: 'whoosh', 18: 'whoosh', 19: 'whoosh', 20: 'whoosh',
       21: 'whoosh', 23: 'whoosh', 24: 'whoosh', 25: 'impacto', 26: 'whoosh', 28: 'whoosh', 29: 'whoosh', 30: 'whoosh', 31: 'whoosh', 33: 'impacto', 34: 'whoosh', 35: 'whoosh', 36: 'whoosh', 37: 'impacto', 39: 'whoosh', 40: 'whoosh'}
for k, nome in TRS.items(): ps(C[k] - (.25 if nome == 'whoosh' else 0), nome, .4 if nome == 'whoosh' else .45, dur=3, fin=.02, fout=.5)
for k in (3, 7, 16, 27): ps(C[k], 'impacto', .55, dur=3, fin=.01, fout=.8)
for k, nome, g, dt in [(0, 'sino', .55, 1.0), (7, 'sino', .4, .3), (22, 'sino', .45, .5), (40, 'sino', .5, 6.0), (14, 'latido', .5, 1.0), (14, 'pombos', .4, .2), (11, 'pombos', .3, .5), (31, 'apito', .5, .5), (39, 'apito', .45, .2), (2, 'apito', .25, 4.5)]:
    ps(C[k] + dt, nome, g, dur=6, fin=.05, fout=1.0)
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
def tique(g=1.):  # tique-taque metálico de máquina
    L = int(.08 * SR); return filt(rng.standard_normal(L), 'band', [1800, 4200]) * np.exp(-np.arange(L) / SR * 70) * g * .12
def grave(m, dur, g=1.):  # violoncelo/contrabaixo: dente de serra filtrado, arco lento
    L = int(dur * SR); tt = np.arange(L) / SR; s = np.zeros(L)
    for det in (-.003, 0, .004): s += 2 * ((hz(m) * (1 + det) * tt * (1 + .003 * np.sin(2 * np.pi * 5 * tt)) + rng.random()) % 1) - 1
    return filt(s, 'low', 700) * adsr(L, min(1.2, dur * .3), min(2, dur * .4)) * g * .05
AC = {'Dm': (38, 50, 53, 57, 62), 'Bb': (34, 46, 50, 53, 58), 'Gm': (31, 43, 50, 55, 58), 'A': (33, 45, 49, 52, 57), 'C': (36, 48, 52, 55, 60), 'F': (41, 53, 57, 60, 65), 'Eb': (39, 51, 55, 58, 63), 'Cm': (36, 48, 51, 55, 60), 'D': (38, 50, 54, 57, 62), 'G': (31, 43, 50, 55, 59)}
prog = (['Dm', 'Dm', 'Bb', 'Dm', 'Gm', 'Dm', 'A', 'Dm', 'Bb', 'F', 'Dm', 'Gm', 'Cm', 'Dm', 'Bb', 'Gm', 'Dm', 'Cm', 'Gm', 'Dm', 'Eb', 'Cm', 'Dm', 'Gm', 'A', 'Dm', 'Bb', 'F', 'C', 'F', 'Dm', 'Bb', 'Gm', 'A', 'Dm', 'Bb', 'F', 'C', 'Dm', 'Bb', 'D'])[:len(C) - 1]
maquina = {2, 4, 5, 6, 12, 16, 29, 31, 39}; escuras = {17, 19, 20, 21, 22, 23, 24, 25, 38}; capitulos = {3, 7, 16, 27}
for i, ch in enumerate(prog):
    st, L = C[i], C[i + 1] - C[i]; nt = AC[ch]
    for j, m in enumerate(nt): add(cordas(m - 12 if j < 2 else m, L + 1.6, 1.0 if j < 2 else .45), st, .3 + .1 * j)
    add(grave(nt[0] - 12, L + 1.2, 1.0), st, .45)
    if i in escuras or i in (0, 40): [add(coro(m, L + 1.4, .8), st, .5) for m in nt[2:5]]
    if i in maquina:
        for k in range(int(L / .5)): add(tique(1 if k % 2 == 0 else .6), st + k * .5, .35 + .3 * (k % 2))
    if i in capitulos: add(timp(nt[0], .8), st, .5); add(sinoG(nt[1] + 12, .7), st, .55)
rev = np.zeros_like(mus)
for d, g in ((.041, .5), (.067, .44), (.11, .38), (.19, .32), (.31, .24), (.47, .18), (.7, .12), (1.0, .07)): k = int(d * SR); rev[k:] += mus[:-k] * g
mus = filt(mus * .7 + rev * .55, 'high', 28, axis=0); mus *= env([(0, 0), (2, .9), (D - 3, .95), (D - .1, 0)])[:, None]; mus /= np.abs(mus).max()
nar = np.zeros(n)
for k, t0 in NAR.items():
    d, _ = sf.read(f'{BASE}/nar/{k}.wav'); d = d if d.ndim == 1 else d.mean(1); d /= np.abs(d).max()
    partes = [(t0, d)]
    if k in TP.get('CORTE', {}): ts, extra = TP['CORTE'][k]; cs = int(ts * SR); partes = [(t0, d[:cs]), (t0 + ts + extra, d[cs:])]
    for st, dd in partes: i = int(st * SR); j = min(n, i + len(dd)); nar[i:j] += dd[:j - i]
nar = nar / np.abs(nar).max() * .92
a = np.abs(nar); k = int(.05 * SR); v = np.clip(np.convolve(a, np.ones(k) / k, 'same') / .05, 0, 1); v = uniform_filter1d(maximum_filter1d(v, int(.5 * SR)), int(.35 * SR))
mix = mus * .25 * (1 - .5 * v)[:, None] + sfx * .32 * (1 - .55 * v)[:, None] + np.stack([nar, nar], 1)
mix *= env([(0, 0), (.05, 1), (D - 1.5, 1), (D - .05, 0)])[:, None]; mix = np.tanh(mix * 1.05) / np.tanh(1.05); mix /= np.abs(mix).max() / .95
sf.write(OUT, mix.astype(np.float32), SR); print('ok')
