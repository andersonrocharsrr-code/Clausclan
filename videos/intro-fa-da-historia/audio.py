# Trilha original épica (Ré menor, 120 BPM: tambores de guerra que crescem, cordas, metais a cada era, drop em 6 s) + efeitos.
import numpy as np, soundfile as sf, subprocess, pathlib
AQUI = pathlib.Path(__file__).resolve().parent; SR = 48000; DUR = 10.0; N = int(SR * DUR)
rng = np.random.default_rng(11); tt = lambda d: np.arange(int(d * SR)) / SR; hz = lambda m: 440 * 2 ** ((m - 69) / 12)
ERAS = [1.5, 2.3, 3.1, 3.9, 4.7]; GRAB, RELEASE, DROP, TAG, TOBTN, CLICK = 1.0, 5.4, 6.0, 7.0, 8.2, 8.8
def env(L, a=.005, r=.1): e = np.ones(L); na, nr = max(1, int(a * SR)), max(1, min(L, int(r * SR))); e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.linspace(1, 0, nr); return e
def lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.zeros_like(x); acc = 0.
    for i in range(len(x)): acc = (1 - a) * x[i] + a * acc; y[i] = acc
    return y
def put(buf, sig, t0, g=1., pan=0.):
    i = int(t0 * SR)
    if i < 0: sig = sig[-i:]; i = 0
    j = min(N, i + len(sig)); s = sig[:j - i] * g; buf[i:j, 0] += s * (1 - max(0, pan)); buf[i:j, 1] += s * (1 + min(0, pan))
mus = np.zeros((N, 2)); sfx = np.zeros((N, 2))
def saw(f, d, det=(-.005, 0, .006)): t = tt(d); return sum(2 * ((f * (1 + x) * t + i * .31) % 1) - 1 for i, x in enumerate(det)) / len(det)
def cordas(ms, d, g=1., fc=1600, a=.4): return lp(sum(saw(hz(m), d) for m in ms) / len(ms), fc) * env(int(d * SR), a, .6) * g
def metal(ms, d=.6, g=1.): t = tt(d); s = lp(sum(saw(hz(m), d, (-.003, .004)) for m in ms) / len(ms), 2200) * (1 - np.exp(-t * 60)) * np.exp(-t * 2.2); return s * g
def tambor(f=70, g=1., d=.5): t = tt(d); fr = f + 60 * np.exp(-t * 25); n = rng.uniform(-1, 1, len(t)); return (np.sin(2 * np.pi * np.cumsum(fr) / SR) + .25 * lp(n, 900)) * np.exp(-t * 6) * g
def caixa(g=1., d=.12): t = tt(d); n = rng.uniform(-1, 1, len(t)); return (n - lp(n, 1500)) * np.exp(-t * 28) * g
def coro(ms, d, g=1.):
    src = sum(np.sign(np.sin(2 * np.pi * hz(m) * (1 + x) * tt(d))) for m in ms for x in (-.004, .004)) / (2 * len(ms)); s = lp(src, 1100) - lp(src, 500)
    return s * env(len(s), .25, .8) * g * 2
Dm, Bb, F, C, A = [62, 65, 69], [58, 62, 65], [57, 60, 65], [55, 60, 64], [57, 61, 64]
# subida: cordas graves, tambores que dobram (semínimas → colcheias → semicolcheias)
put(mus, cordas([38, 50, 57], 6.0, .5, 900), 0); put(mus, cordas(Dm + [74], 3.2, .3, 2000, .8), 2.8)
for b in np.arange(0, 6, .5): put(mus, tambor(65, .6 if b % 1 == 0 else .4), b)
for b in np.arange(2.0, 6, .25): put(mus, tambor(110, .25), b + .125, pan=.3)
for k in range(16): put(mus, caixa(.1 + .03 * k), 5.0 + k * .0625)
t = tt(1.0); put(mus, rng.uniform(-1, 1, len(t)) * np.linspace(0, 1, len(t)) ** 2 * .2, 5.0)
for i, (te, ch) in enumerate(zip(ERAS, [Dm, Bb, F, C, A])): put(mus, metal([c - 12 for c in ch] + ch, .7, .55), te, pan=-.3 + .15 * i)
# drop: acorde enorme, coro, tambores de batalha e cordas em Ré menor → Si bemol → Fá → Lá
put(mus, metal([38, 50, 57, 62, 65, 69], 2.2, .9), DROP); put(mus, coro([62, 65, 69, 74], 4.0, .5), DROP)
for t0, ch, base in [(6.0, Dm, 38), (7.0, Bb, 34), (8.0, F, 41), (9.0, A, 45)]: put(mus, cordas(ch + [ch[0] - 12, base], 1.3, .45, 2400, .15), t0)
for b in np.arange(DROP, 9.6, .5): put(mus, tambor(60, .8), b); put(mus, tambor(95, .35), b + .25, pan=-.3)
for b in np.arange(6.5, 9.6, 1.0): put(mus, caixa(.45, .18), b)
# efeitos
def click(g=1.): t = tt(.03); a = np.sin(2 * np.pi * 2200 * t) * np.exp(-t * 300); return np.concatenate([a, np.zeros(int(.05 * SR)), a * .6]) * g
def whoosh(d, f0, f1, g=1.):
    t = tt(d); n = rng.uniform(-1, 1, len(t)); fc = np.geomspace(f0, f1, len(t)); y = np.zeros_like(n); acc = 0.
    for i in range(len(n)): a = np.exp(-2 * np.pi * fc[i] / SR); acc = (1 - a) * n[i] + a * acc; y[i] = acc
    return y * np.sin(np.pi * np.linspace(0, 1, len(t))) ** 1.5 * g * 3
def tick(f=2600, g=1.): t = tt(.02); return np.sin(2 * np.pi * f * t) * np.exp(-t * 260) * g
def sino(ms, g=1.): t = tt(1.6); return sum(np.sin(2 * np.pi * hz(m) * t) * np.exp(-t * (1.6 + i)) for i, m in enumerate(ms)) / len(ms) * g
put(sfx, click(.5)[:int(.03 * SR)], GRAB); put(sfx, click(.4)[:int(.03 * SR)], RELEASE)
for te in ERAS: put(sfx, whoosh(.4, 500, 3500, .22), te - .38)
for k in range(64): put(sfx, tick(2400 + 20 * (k % 12), .12), GRAB + .5 + k * (RELEASE - GRAB - .6) / 64)  # anos rolando no arraste
put(sfx, whoosh(.8, 4000, 300, .3), RELEASE + .05); put(sfx, tambor(45, 1.2, 1.2), DROP)
for k in range(3): put(sfx, tick(1800 + 300 * k, .3), TAG + k * .25)
put(sfx, whoosh(.4, 700, 2800, .15), TOBTN - .15); put(sfx, click(.5), CLICK - .01); put(sfx, sino([81, 86, 88], .45), CLICK + .03)
mix = mus * .5 + sfx * .62; fade = np.ones(N); fade[-int(.45 * SR):] = np.linspace(1, 0, int(.45 * SR)); mix *= fade[:, None]; mix *= .93 / np.abs(mix).max()
(AQUI / 'out').mkdir(exist_ok=True); sf.write(AQUI / 'out/mix_raw.wav', mix.astype(np.float32), SR)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', AQUI / 'out/mix_raw.wav', '-af', 'loudnorm=I=-15:TP=-1:LRA=11', '-ar', '48000', AQUI / 'out/mix.wav'], check=True); print('out/mix.wav')
