# Mixa narração + efeitos + trilha eletrônica (pulso de sintetizador; tensa no boato, clara na checagem).
# Uso: python3 audio.py <pasta com nar/ e sfx/> <saida.wav>
import sys, os, json, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
from scipy.ndimage import maximum_filter1d, uniform_filter1d
BASE, OUT = sys.argv[1], sys.argv[2]
TP = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tempos.json')))
SR = 44100; D = TP['DUR']; n = int(SR * D); t = np.arange(n) / SR; rng = np.random.default_rng(7); C = TP['CUTS']; NAR = TP['NARS']
filt = lambda x, k, fc, o=2, axis=-1: sosfilt(butter(o, fc, k, fs=SR, output='sos'), x, axis=axis)
env = lambda pts: np.interp(t, [p[0] for p in pts], [p[1] for p in pts])
# ---------- efeitos ----------
sfx = np.zeros((n, 2)); SM = {}
def smp(k):
    if k not in SM:
        d, _ = sf.read(f'{BASE}/sfx/{k}.wav'); d = d if d.ndim == 2 else np.stack([d, d], 1); d = filt(d, 'low', 9000, 4, axis=0); SM[k] = d / max(1e-9, np.abs(d).max())
    return SM[k]
def ps(t0, k, g, dur=None, fin=.02, fout=.4):
    d = smp(k); d = d[:int(dur * SR)] if dur else d; L = len(d); e = np.ones(L); nf, no = min(L, int(fin * SR)), min(L, int(fout * SR))
    if nf: e[:nf] = np.linspace(0, 1, nf)
    if no: e[L - no:] *= np.linspace(1, 0, no)
    i = int(max(0, t0) * SR); j = min(n, i + L)
    if i < n: sfx[i:j] += d[:j - i] * e[:j - i, None] * g
def cena(k, nome, g):  # cobre a cena k com um som de fundo, repetindo
    st, fim = C[k], C[k + 1] + .3; tot = len(smp(nome)) / SR
    while st < fim - .1: d = min(tot, fim - st); ps(st, nome, g, dur=d, fin=.4, fout=.6); st += max(.5, d - .6)
TR = {1: 'whoosh', 2: 'desliga', 3: 'impacto', 4: 'glitch', 5: 'whoosh', 6: 'whoosh', 7: 'whoosh', 8: 'whoosh', 9: 'whoosh', 10: 'impacto', 11: 'glitch', 12: 'whoosh', 13: 'whoosh',
      14: 'desliga', 15: 'glitch', 16: 'impacto', 17: 'whoosh', 18: 'whoosh', 19: 'whoosh', 20: 'impacto', 21: 'whoosh', 22: 'glitch', 23: 'whoosh', 24: 'whoosh', 25: 'liga', 26: 'whoosh'}
for k, nome in TR.items(): ps(C[k] - (.25 if nome == 'whoosh' else 0), nome, {'whoosh': .55, 'impacto': .5, 'glitch': .5, 'desliga': .8, 'liga': .7}[nome], dur=4)
for k, nome, g in [(0, 'cidade', .5), (0, 'zumbido', .25), (1, 'notif', .5), (4, 'notif', .35), (6, 'tv', .4), (7, 'lapis', .5), (9, 'radar', .5), (10, 'radar', .3), (12, 'zumbido', .35),
                   (13, 'zumbido', .4), (17, 'radar', .35), (18, 'cidade', .4), (19, 'chuva', .8), (21, 'zumbido', .3), (24, 'cidade', .45), (25, 'cidade', .5), (26, 'cidade', .3)]: cena(k, nome, g)
for k, nome, g, dt in [(0, 'teclado', .0, 0), (10, 'vibra', .7, .6), (10, 'alerta', .45, .7), (14, 'carimbo', .9, 1.0), (16, 'carimbo', .9, .5), (23, 'carimbo', .8, 2.2), (20, 'teclado', .45, 1.2), (11, 'teclado', .0, 0), (1, 'teclado', .35, .2),
                       (5, 'impacto', .3, 0), (13, 'impacto', .6, 1.6), (26, 'impacto', .5, 2.6)]:
    if g: ps(C[k] + dt, nome, g, dur=5)
sfx = filt(sfx, 'high', 30, axis=0); sfx /= max(1e-9, np.abs(sfx).max())
# ---------- trilha ----------
mus = np.zeros((n, 2)); hz = lambda m: 440 * 2 ** ((m - 69) / 12); BPM = 112; BT = 60 / BPM
def add(sig, st, pan=.5, g=1.):
    i = int(st * SR)
    if i >= n or i < 0: return
    j = min(n, i + len(sig)); s = sig[:j - i] * g; mus[i:j, 0] += s * np.cos(pan * np.pi / 2); mus[i:j, 1] += s * np.sin(pan * np.pi / 2)
def adsr(L, a, r): x = np.ones(L); na, nr = max(1, int(a * SR)), max(1, int(r * SR)); x[:na] = np.linspace(0, 1, na); x[-nr:] *= np.linspace(1, 0, nr); return x
def saw(f, L, det=(-.007, 0, .006)):
    tt = np.arange(L) / SR; return sum(2 * ((f * (1 + d) * tt + rng.random()) % 1) - 1 for d in det) / len(det)
def pad(m, dur, g=1.): L = int(dur * SR); return filt(saw(hz(m), L), 'low', 1400) * adsr(L, min(1.2, dur * .3), min(1.5, dur * .4)) * g * .05
def baixo(m, g=1.): L = int(BT / 2 * .9 * SR); tt = np.arange(L) / SR; s = filt(saw(hz(m), L, (0,)), 'low', 500) + .6 * np.sin(2 * np.pi * hz(m) * tt); return s * np.exp(-tt * 6) * g * .16
def bumbo(g=1.): L = int(.35 * SR); tt = np.arange(L) / SR; ph = 2 * np.pi * np.cumsum(50 + 110 * np.exp(-tt * 28)) / SR; return np.sin(ph) * np.exp(-tt * 9) * g * .5
def chimbal(g=1.): L = int(.06 * SR); return filt(rng.standard_normal(L), 'high', 7000) * np.exp(-np.arange(L) / SR * 60) * g * .06
def sino(m, g=1.): L = int(1.6 * SR); tt = np.arange(L) / SR; return (np.sin(2 * np.pi * hz(m) * tt) + .3 * np.sin(2 * np.pi * hz(m) * 3 * tt)) * np.exp(-tt * 3) * g * .06
AC = {'Am': (45, 57, 60, 64), 'F': (41, 57, 60, 65), 'C': (48, 55, 60, 64), 'G': (43, 55, 59, 62), 'Dm': (38, 57, 62, 65), 'E': (40, 56, 59, 64)}
VIRA = C[14]
def trecho(t0, t1, prog, tenso):
    bar = 4 * BT; k = 0; st = t0
    while st < t1:
        ch = AC[prog[k % len(prog)]]; L = min(bar, t1 - st)
        for j, m in enumerate(ch[1:]): add(pad(m, L + .8, .9), st, .3 + .2 * j)
        for b in range(8):
            tb = st + b * BT / 2
            if tb >= t1: break
            add(baixo(ch[0] - 12 + (12 if b % 4 == 3 else 0), 1 if tenso else .7), tb, .5)
            add(chimbal(1 if b % 2 else .5), tb, .65)
            if b % 2 == 0 and (tenso or b % 4 == 0): add(bumbo(.8 if tenso else .5), tb, .5)
        if not tenso: add(sino(ch[3] + 12, .8), st, .6); add(sino(ch[2] + 12, .6), st + 2 * BT, .4)
        st += bar; k += 1
trecho(0, VIRA, ['Am', 'F', 'Dm', 'E'], True)
trecho(VIRA + 1.6, D, ['C', 'G', 'Am', 'F'], False)
rev = np.zeros_like(mus)
for d, g in ((.05, .4), (.09, .32), (.15, .25), (.24, .18), (.37, .12)): k = int(d * SR); rev[k:] += mus[:-k] * g
mus = filt(mus + rev * .6, 'high', 30, axis=0); mus *= env([(0, 0), (1.5, .85), (VIRA - .1, .95), (VIRA, 0), (VIRA + 1.6, 0), (VIRA + 2.6, .9), (D - 3, .9), (D - .1, 0)])[:, None]; mus /= np.abs(mus).max()
# ---------- narração ----------
nar = np.zeros(n)
for k, t0 in NAR.items():
    d, _ = sf.read(f'{BASE}/nar/{k}.wav'); d = d if d.ndim == 1 else d.mean(1); d /= np.abs(d).max(); i = int(t0 * SR); j = min(n, i + len(d)); nar[i:j] += d[:j - i]
nar = nar / np.abs(nar).max() * .92
a = np.abs(nar); k = int(.05 * SR); v = np.clip(np.convolve(a, np.ones(k) / k, 'same') / .05, 0, 1); v = uniform_filter1d(maximum_filter1d(v, int(.5 * SR)), int(.35 * SR))
mix = mus * .2 * (1 - .45 * v)[:, None] + sfx * .34 * (1 - .5 * v)[:, None] + np.stack([nar, nar], 1)
mix *= env([(0, 0), (.05, 1), (D - 1.2, 1), (D - .05, 0)])[:, None]; mix = np.tanh(mix * 1.05) / np.tanh(1.05); mix /= np.abs(mix).max() / .95
sf.write(OUT, mix.astype(np.float32), SR); print('ok')
