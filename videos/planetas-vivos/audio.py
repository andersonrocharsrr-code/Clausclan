# Mixa narração (Rodrigo Custódio) + efeitos + trilha espacial (pads de sintetizador, cordas, coro suave, sininhos em arpejo). Uso: python3 audio.py <pasta com nar/ e sfx/> <saida.wav>
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
for k in range(len(C) - 1): cena(k, 'vazio', .35)
for k, nome, g in [(0, 'noite', .5), (8, 'noite', .45), (10, 'ventomarte', .5), (11, 'ventomarte', .4), (15, 'ventomarte', .45), (17, 'floresta', .5), (17, 'chuva', .45), (18, 'floresta', .45), (18, 'voo', .45), (20, 'floresta', .4), (21, 'floresta', .4), (25, 'ventomarte', .4), (26, 'ventomarte', .35), (28, 'calor', .45), (28, 'floresta', .3), (29, 'floresta', .4), (34, 'neve', .5), (35, 'festa', .35), (36, 'discussao', .55), (12, 'relogio', .45), (32, 'robo', .5)]:
    cena(k, nome, g)
CAPS_I = (3, 9, 16, 22, 30)
for k in range(1, len(C) - 1):
    if k in CAPS_I: ps(C[k], 'impacto', .55, dur=3, fin=.01, fout=.8)
    else: ps(C[k] - .25, 'whoosh', .35, dur=3, fin=.02, fout=.5)
for k, nome, g, dt in [(2, 'brilho', .45, .2), (6, 'brilho', .4, .4), (7, 'orbita', .45, .2), (11, 'pulo', .5, .3), (11, 'pulo', .45, 1.4), (11, 'pulo', .45, 2.5), (22, 'foguete', .75, 2.3), (23, 'orbita', .45, .4), (24, 'orbita', .4, .3), (25, 'pulo', .45, .4), (25, 'pulo', .45, 1.6), (27, 'sinal', .5, .2), (30, 'nave', .65, 2.0), (31, 'impacto', .4, 1.4), (37, 'impacto', .45, .3), (39, 'brilho', .45, .5)]:
    ps(C[k] + dt, nome, g, dur=7, fin=.05, fout=1.0)
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
def pad(m, dur, g=1.):  # pad de sintetizador: dente de serra desafinado com filtro que abre devagar
    L = int(dur * SR); tt = np.arange(L) / SR; s = np.zeros(L)
    for det in (-.006, -.002, .003, .007): s += 2 * ((hz(m) * (1 + det) * tt + rng.random()) % 1) - 1
    return filt(s, 'low', 1100) * adsr(L, min(2.5, dur * .4), min(2.5, dur * .4)) * g * .022
def sininho(m, g=1.):
    L = int(2.2 * SR); tt = np.arange(L) / SR; return (np.sin(2 * np.pi * hz(m) * tt) + .25 * np.sin(2 * np.pi * hz(m) * 2.76 * tt)) * np.exp(-tt * 2.2) * g * .05
AC = {'C': (36, 48, 52, 55, 60, 64), 'Csus': (36, 48, 53, 55, 60, 65), 'F': (29, 41, 48, 53, 57, 60), 'Fmaj7': (29, 41, 48, 52, 57, 64), 'G': (31, 43, 50, 55, 59, 62), 'Am': (33, 45, 52, 57, 60, 64), 'Em': (40, 52, 55, 59, 64, 67), 'Dm': (38, 50, 53, 57, 62, 65)}
prog = (['Csus', 'C', 'Fmaj7', 'C', 'Am', 'F', 'G', 'C', 'Em', 'F', 'C', 'G', 'Am', 'F', 'C', 'G', 'Dm', 'G', 'C', 'Am', 'F', 'G', 'C', 'Em', 'F', 'G', 'Am', 'F', 'C', 'G', 'F', 'C', 'Dm', 'G', 'Am', 'F', 'C', 'G', 'Fmaj7', 'Csus'])[:len(C) - 1]
capitulos = set(CAPS_I)
for i, ch in enumerate(prog):
    st, L = C[i], C[i + 1] - C[i]; nt = AC[ch]
    add(pad(nt[0], L + 2.5, 1.2), st, .5); [add(pad(m, L + 2.5, .7), st, .2 + .15 * j) for j, m in enumerate(nt[2:5])]
    for j, m in enumerate(nt[:2]): add(cordas(m, L + 1.6, .8), st, .4)
    if i in (0, 2, 3, 9, 16, 22, 30, 38, 39): [add(coro(m, L + 1.4, .7), st, .5) for m in nt[2:5]]
    seq = [nt[2] + 12, nt[3] + 12, nt[4] + 12, nt[5] + 12, nt[4] + 12, nt[3] + 12]
    for k in range(int(L / .42)): add(sininho(seq[k % len(seq)], .9 if k % 6 == 0 else .55), st + k * .42, .3 + .4 * (k % 2))
    if i in capitulos: add(timp(nt[0] - 12, .7), st, .5); add(sinoG(nt[2] + 12, .6), st, .55)
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
mix = mus * .17 * (1 - .5 * v)[:, None] + sfx * .22 * (1 - .55 * v)[:, None] + np.stack([nar, nar], 1)
mix *= env([(0, 0), (.05, 1), (D - 1.5, 1), (D - .05, 0)])[:, None]; mix = np.tanh(mix * 1.05) / np.tanh(1.05); mix /= np.abs(mix).max() / .95
sf.write(OUT, mix.astype(np.float32), SR); print('ok')
