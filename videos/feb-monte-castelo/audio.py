# Som do vídeo: narração (Rodrigo Custódio) em primeiro plano + trilha original (Ré menor, caixa militar e cordas)
# + efeitos do motor sfx (skill sound-design, claude-motion) presos às ações de cada cena. Saída: out/mix.wav
import sys, json, pathlib, subprocess, numpy as np, soundfile as sf
AQUI = pathlib.Path(__file__).resolve().parent; sys.path.insert(0, str(AQUI.parents[1] / 'ferramentas/claude-motion'))
from sfx.synth import click, pop, whoosh, chime, impact, riser, blip
TP = json.load(open(AQUI / 'tempos.json')); C = TP['CUTS']; DUR = TP['DUR']; NARS = TP['NARS']; SR = 48000; N = int(SR * DUR)
PASTA = sys.argv[1]; rng = np.random.default_rng(5); tt = lambda d: np.arange(int(d * SR)) / SR; hz = lambda m: 440 * 2 ** ((m - 69) / 12)
def put(buf, sig, t0, g=1., pan=0.):
    sig = np.asarray(sig, dtype=float); i = int(t0 * SR)
    if i < 0: sig = sig[-i:]; i = 0
    if i >= N: return
    j = min(N, i + len(sig)); s = sig[:j - i] * g; buf[i:j, 0] += s * (1 - max(0, pan)); buf[i:j, 1] += s * (1 + min(0, pan))
def lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.zeros_like(x); acc = 0.
    for i in range(len(x)): acc = (1 - a) * x[i] + a * acc; y[i] = acc
    return y
def env(L, a=.01, r=.2): e = np.ones(L); na, nr = max(1, int(a * SR)), max(1, min(L, int(r * SR))); e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.linspace(1, 0, nr); return e
def saw(f, d): t = tt(d); return sum(2 * ((f * (1 + x) * t + i * .3) % 1) - 1 for i, x in enumerate((-.005, 0, .006))) / 3
def cordas(ms, d, g=1., fc=1500): return lp(sum(saw(hz(m), d) for m in ms) / len(ms), fc) * env(int(d * SR), .5, .7) * g
def caixa(g=1.): t = tt(.14); n = rng.uniform(-1, 1, len(t)); return (n - lp(n, 1800)) * np.exp(-t * 26) * g
def bumbo(g=1.): t = tt(.4); f = 50 + 90 * np.exp(-t * 30); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7) * g
mus = np.zeros((N, 2)); sfx = np.zeros((N, 2))
# trilha: Ré menor → Si bemol → Fá → Lá, 2 compassos cada a 112 BPM; marcha de caixa; abre em Ré maior na vitória (cena 21)
BPM = 112; b = 60 / BPM; prog = [[50, 53, 57], [46, 50, 53], [53, 57, 60], [45, 49, 52]]; vit = C[21]
t0 = 0.; k = 0
while t0 < DUR:
    ch = prog[k % 4] if t0 < vit else [[50, 54, 57], [55, 59, 62], [57, 61, 64], [50, 54, 57]][k % 4]
    put(mus, cordas(ch + [ch[0] - 12], b * 8 + .5, .5 if t0 < vit else .6, 1300 if t0 < vit else 2200), t0); t0 += b * 8; k += 1
x = 0.; i = 0
while x < DUR:
    forte = (C[14] <= x < C[21]) or x >= vit
    put(mus, caixa(.35 if i % 4 == 0 else .18), x); put(mus, caixa(.12), x + b * .75) if forte else None
    if i % 2 == 0: put(mus, bumbo(.5 if forte else .3), x)
    x += b; i += 1
for k in (2, 14, 21, 32): put(mus, bumbo(.9), C[k]); put(mus, np.asarray(impact(1.4)), C[k], .5)   # cartões de capítulo
put(mus, np.asarray(riser(C[21] - C[20], 200, 4000)), C[20], .25)
# efeitos presos às ações (tempo local de cada cena somado ao início da cena)
cliques = {1: [1.0], 5: [.5], 7: [.45], 11: [.85], 12: [1.4], 22: [.1], 26: [.45, 1.35, 2.25], 34: [.6]}
for k, ts in cliques.items():
    for tl in ts: put(sfx, click(1900), C[k] + tl, .45, .2)
carimbos = {5: 1.7, 7: .9, 15: .5, 24: .45, 28: .7}
for k, tl in carimbos.items(): put(sfx, bumbo(1.0), C[k] + tl); put(sfx, np.asarray(pop(300, 120, .2)), C[k] + tl, .4)
for k in range(1, len(C) - 1): put(sfx, np.asarray(whoosh(.22, 800, 3200, peak=.5)), C[k] - .08, .12, (-1) ** k * .3)   # corte rápido
put(sfx, np.asarray(impact(1.6)), C[3] + 1.2, .5); put(sfx, np.asarray(whoosh(1.4, 2000, 200, peak=.3)), C[3] + 1.2, .25)  # navio afunda
for k, n in ((4, 6), (8, 18), (31, 14), (32, 20)):  # contadores
    for j in range(n): put(sfx, np.asarray(blip(1200 + 40 * (j % 6), .05, .02)), C[k] + .2 + j * (1.6 / n), .12)
for j in range(4): put(sfx, np.asarray(whoosh(.9, 300, 2400, peak=.6)), C[25] + .2 + j * .5, .3, -.4 + .3 * j)   # aviões
t = tt(L := C[20] - C[18]); n = rng.uniform(-1, 1, len(t)); put(sfx, (lp(n, 700) - lp(n, 150)) * 1.5 * env(len(t), .6, .6), C[18], .5)  # vento na neve
put(sfx, np.asarray(chime([587.33, 739.99, 880.0, 1174.66], dur=2.2, tau=.8)), C[23] + .3, .5)   # bandeira no topo
put(sfx, np.asarray(chime([587.33, 880.0, 1174.66], dur=2.0, tau=.7)), C[34] + .6, .45)          # medalha final
# narração em primeiro plano; trilha abaixa sob a voz
nar = np.zeros(N)
for k, t0 in NARS.items():
    d, sr = sf.read(f'{PASTA}/nar/{k}.wav'); d = d if d.ndim == 1 else d.mean(1); d = d / np.abs(d).max(); i = int(t0 * SR); j = min(N, i + len(d)); nar[i:j] += d[:j - i]
v = np.convolve(np.abs(nar), np.ones(int(.08 * SR)) / int(.08 * SR), 'same'); v = np.clip(v / .08, 0, 1)
mix = mus * .07 * (1 - .5 * v)[:, None] + sfx * .16 * (1 - .4 * v)[:, None] + np.stack([nar, nar], 1) * .9
fade = np.ones(N); fade[-int(.5 * SR):] = np.linspace(1, 0, int(.5 * SR)); mix *= fade[:, None]; mix *= .93 / np.abs(mix).max()
(AQUI / 'out').mkdir(exist_ok=True); sf.write(AQUI / 'out/mix_raw.wav', mix.astype(np.float32), SR)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', AQUI / 'out/mix_raw.wav', '-af', 'loudnorm=I=-14:TP=-1:LRA=11', '-ar', '48000', AQUI / 'out/mix.wav'], check=True); print('out/mix.wav')
