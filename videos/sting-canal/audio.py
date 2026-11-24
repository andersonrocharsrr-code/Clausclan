# Trilha original (Lá menor, 120 BPM, subida → drop em 6 s) + efeitos sintetizados no tempo do filme. Saída: out/mix.wav
import numpy as np, soundfile as sf, subprocess, pathlib
AQUI = pathlib.Path(__file__).resolve().parent; SR = 48000; DUR = 10.0; N = int(SR * DUR); BEAT = .5
rng = np.random.default_rng(7); tt = lambda d: np.arange(int(d * SR)) / SR
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
def env(L, a=.005, r=.1): e = np.ones(L); na, nr = max(1, int(a * SR)), max(1, min(L, int(r * SR))); e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.linspace(1, 0, nr); return e
def lp(x, fc): # passa-baixa de 1 polo (simples e estável)
    a = np.exp(-2 * np.pi * fc / SR); y = np.zeros_like(x); acc = 0.
    for i in range(len(x)): acc = (1 - a) * x[i] + a * acc; y[i] = acc
    return y
def put(buf, sig, t0, g=1., pan=0.):
    i = int(t0 * SR)
    if i < 0: sig = sig[-i:]; i = 0
    j = min(N, i + len(sig)); s = sig[:j - i] * g; buf[i:j, 0] += s * (1 - max(0, pan)); buf[i:j, 1] += s * (1 + min(0, pan))
musica = np.zeros((N, 2)); sfx = np.zeros((N, 2))
# ---------- instrumentos ----------
def saw(f, d, det=(-.004, 0, .005)): t = tt(d); return sum(2 * ((f * (1 + x) * t + i * .37) % 1) - 1 for i, x in enumerate(det)) / len(det)
def pluck(m, d=.35, g=1.): t = tt(d); s = (np.sign(np.sin(2 * np.pi * hz(m) * t)) * .4 + np.sin(2 * np.pi * hz(m) * t)) * np.exp(-t * 9); return s * g
def kick(g=1.): t = tt(.35); f = 48 + 110 * np.exp(-t * 32); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7) * g
def snare(g=1., d=.18): t = tt(d); return (rng.uniform(-1, 1, len(t)) * .7 + np.sin(2 * np.pi * 190 * t) * .4) * np.exp(-t * 22) * g
def hat(g=1.): t = tt(.05); n = rng.uniform(-1, 1, len(t)); n = n - lp(n, 6000); return n * np.exp(-t * 70) * g
def clap(g=1.): t = tt(.2); n = rng.uniform(-1, 1, len(t)); e = sum(np.exp(-np.maximum(t - k * .011, 0) * 60) * (t >= k * .011) for k in range(3)); return (n - lp(n, 1200)) * e * g * .5
def bass(m, d, g=1.): t = tt(d); return (np.sin(2 * np.pi * hz(m) * t) + .3 * np.sin(4 * np.pi * hz(m) * t)) * env(len(t), .01, .05) * g
def pad(ms, d, g=1., fc=1400): return lp(sum(saw(hz(m), d) for m in ms) / len(ms), fc) * env(int(d * SR), .6, .8) * g
# ---------- trilha ----------
AM, F, C, G = [57, 60, 64], [53, 57, 60], [48, 55, 60, 64], [55, 59, 62]
PENTA = [69, 72, 74, 76, 79, 81]
put(musica, pad(AM + [45], 6.0, .5, 900), 0); put(musica, pad(AM + [71], 2.2, .35, 1800), 3.9)
for k in range(48):  # arpejo: colcheias até 2 s, depois semicolcheias, crescendo
    t0 = k * .125
    if t0 >= 6: break
    if t0 < 2 and k % 2: continue
    put(musica, pluck(PENTA[(k * 3) % 6] - (12 if k % 4 == 0 else 0), .3, .16 + .12 * t0 / 6), t0, pan=.3 * np.sin(k))
for k in range(int(2 / .25), int(6 / .25)): put(musica, hat(.18 if k % 2 else .1), k * .25)
for b in (4.5, 5.5): put(musica, snare(.35), b)
for k in range(16): put(musica, snare(.12 + .03 * k, .09), 5.0 + k * .0625)  # rufo em fusas
t = tt(1.0); put(musica, (rng.uniform(-1, 1, len(t)) * np.linspace(0, 1, len(t)) ** 2) * .25, 5.0)  # subida de ruído
# drop: bumbo em todo tempo, palmas no 2 e 4, baixo e acordes
seq = [(6.0, AM, 45), (7.0, F, 41), (8.0, C, 48), (9.0, AM, 45)]
for b in np.arange(6.0, 9.6, BEAT): put(musica, kick(.9), b)
for b in np.arange(6.5, 9.6, 1.0): put(musica, clap(.6), b)
for t0, ch, bm in seq:
    d = 1.0 if t0 < 9 else 1.0
    put(musica, pad(ch + [ch[0] + 12], d + .3, .45, 2600), t0); put(musica, bass(bm, d * .95, .55), t0)
    for k in range(8): put(musica, hat(.12), t0 + k * .125 + .0625)
put(musica, pad(AM + [69, 76], 1.2, .5, 3000), 9.0)
# ---------- efeitos (cada um no seu momento do filme) ----------
def click(g=1.): t = tt(.03); a = np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 300); return np.concatenate([a, np.zeros(int(.05 * SR)), a * .6]) * g
def key(g=1.): t = tt(.03); n = rng.uniform(-1, 1, len(t)); return (n - lp(n, 2500)) * np.exp(-t * 180) * g
def whoosh(d, f0, f1, g=1.):
    t = tt(d); n = rng.uniform(-1, 1, len(t)); fc = np.geomspace(f0, f1, len(t)); y = np.zeros_like(n); acc = 0.
    for i in range(len(n)): a = np.exp(-2 * np.pi * fc[i] / SR); acc = (1 - a) * n[i] + a * acc; y[i] = acc
    return y * np.sin(np.pi * np.linspace(0, 1, len(t))) ** 1.5 * g * 3
def thump(g=1.): return kick(g) * 1.2
def tick(f=3200, g=1.): t = tt(.02); return np.sin(2 * np.pi * f * t) * np.exp(-t * 260) * g
def pop(m, g=1.): t = tt(.16); f = hz(m) * (1 + .6 * np.exp(-t * 40)); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 18) * g
def chime(ms, g=1.): t = tt(1.4); return sum(np.sin(2 * np.pi * hz(m) * t) * np.exp(-t * (2 + i)) for i, m in enumerate(ms)) / len(ms) * g
for tc in (1.0, 3.0, 8.8): put(sfx, click(.5), tc - .01, .2)
put(sfx, click(.45)[:int(.03 * SR)], 5.2); put(sfx, click(.4)[:int(.03 * SR)], 5.9)
for tc, f0, f1, g in [(1.0, 600, 4000, .25), (3.0, 500, 3500, .28), (5.0, 3500, 400, .25), (8.3, 800, 3000, .15)]: put(sfx, whoosh(.45, f0, f1, g), tc - .2)
for i in range(len('O que existe além?')): put(sfx, key(.35 + .1 * rng.random()), 1.5 + i * .0625, pan=-.2 + .02 * i)
last = -1; v0 = -1
for i in range(int(1.35 * SR / 480)):  # odômetro: um tique a cada número novo
    tt0 = 3.25 + i * 480 / SR; u = min(1, (tt0 - 3.25) / 1.35); v = round(93 * (1 - (1 - u) ** 4))
    if v != v0 and tt0 - last > .028: put(sfx, tick(2800 + v * 8, .25), tt0); last = tt0; v0 = v
t = tt(.7); n = rng.uniform(-1, 1, len(t)); put(sfx, (n - lp(n, 800)) * np.sin(np.pi * np.linspace(0, 1, len(t))) * .25, 5.2, pan=.4)  # arraste do anel
put(sfx, whoosh(.6, 300, 6000, .35), 5.45)
put(sfx, thump(1.0), 6.0); put(sfx, chime([57, 64, 69], .3), 6.0)
for k, tc in enumerate((6.0, 6.25, 6.5)): put(sfx, thump(.55), tc); put(sfx, pop(PENTA[k] - 12, .3), tc)
for k, tc in enumerate((7.0, 7.5, 8.0)): put(sfx, pop(PENTA[k + 1], .35), tc, pan=-.3 + .3 * k)
put(sfx, chime([76, 81, 88], .4), 8.82)
# ---------- mixagem ----------
mix = musica * .5 + sfx * .62; fade = np.ones(N); fade[-int(.4 * SR):] = np.linspace(1, 0, int(.4 * SR)); mix *= fade[:, None]; mix *= .93 / np.abs(mix).max()
(AQUI / 'out').mkdir(exist_ok=True); sf.write(AQUI / 'out/mix_raw.wav', mix.astype(np.float32), SR)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', AQUI / 'out/mix_raw.wav', '-af', 'loudnorm=I=-15:TP=-1:LRA=11', '-ar', '48000', AQUI / 'out/mix.wav'], check=True)
print('out/mix.wav')
