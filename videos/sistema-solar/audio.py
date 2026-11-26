# Som: narração do Rodrigo Custódio na frente; trilha espacial (pad em Ré, grave contínuo), whoosh + subida em cada viagem,
# sino quando a ficha aparece e bip quando cada barra de gás cresce. Saída: out/mix.wav (-14 LUFS)
import sys, json, pathlib, subprocess, re, numpy as np, soundfile as sf
AQUI = pathlib.Path(__file__).resolve().parent; sys.path.insert(0, str(AQUI.parents[1] / 'ferramentas/claude-motion'))
from sfx.synth import whoosh, chime, riser, blip
TP = json.load(open(AQUI / 'tempos.json')); SEG = TP['SEG']; DUR = TP['DUR']; SR = 48000; N = int(SR * DUR)
PAL = json.load(open(AQUI / 'palavras.json')); rng = np.random.default_rng(9); tt = lambda d: np.arange(int(d * SR)) / SR; hz = lambda m: 440 * 2 ** ((m - 69) / 12)
def put(buf, sig, t0, g=1., pan=0.):
    sig = np.asarray(sig, dtype=float); i = int(t0 * SR)
    if i >= N: return
    j = min(N, i + len(sig)); s = sig[:j - i] * g; buf[i:j, 0] += s * (1 - max(0, pan)); buf[i:j, 1] += s * (1 + min(0, pan))
def env(L, a, r): e = np.ones(L); na, nr = max(1, int(a * SR)), max(1, min(L, int(r * SR))); e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.linspace(1, 0, nr); return e
def pad(ms, d): t = tt(d); s = sum(np.sin(2 * np.pi * hz(m) * t * (1 + dt)) * (.6 if m < 50 else .35) for m in ms for dt in (-.002, .002)); return s / len(ms) * env(len(t), 3, 3)
mus = np.zeros((N, 2)); sfx = np.zeros((N, 2))
acordes = [[38, 50, 57, 62, 64], [34, 46, 53, 58, 62], [41, 53, 57, 60, 65], [36, 48, 55, 60, 64]]   # Ré sus, Si bemol, Fá, Dó
t0, k = 0., 0
while t0 < DUR: put(mus, pad(acordes[k % 4], 14), t0, 1, (-1) ** k * .2); t0 += 11; k += 1
t = tt(DUR); put(mus, np.sin(2 * np.pi * 36.7 * t) * .5 * (1 + .3 * np.sin(2 * np.pi * .05 * t)), 0)     # grave contínuo
norm = lambda w: re.sub(r'[^a-zà-ÿ]', '', w.lower())
GAS = ['hidrogênio', 'hélio', 'oxigênio', 'sódio', 'nitrogênio', 'argônio', 'gás', 'metano']
for s in SEG[1:]:
    put(sfx, np.asarray(riser(1.6, 150, 2400)), s['v0'], .35); put(sfx, np.asarray(whoosh(2.2, 300, 5000, peak=.55)), s['v0'] + .5, .6)
    if s['id'] != 'final':
        put(sfx, np.asarray(chime([587.33, 880.0, 1174.66], dur=2.4, tau=.9)), s['n0'] - .1, .35)
        vistos = set()
        for w, a, b in PAL[s['id']]:
            n = norm(w)
            if n in GAS and n not in vistos: vistos.add(n); put(sfx, np.asarray(blip(1400, .06, .03)), s['n0'] + a, .25, .3)
put(sfx, np.asarray(riser(8, 60, 1200)), .5, .25)
nar = np.zeros(N)
for s in SEG:
    d, sr = sf.read(AQUI / f"out/nar/{s['id']}.wav"); d = d if d.ndim == 1 else d.mean(1)
    if sr != SR: d = np.interp(np.arange(int(len(d) * SR / sr)) * sr / SR, np.arange(len(d)), d)
    d = d / np.abs(d).max(); i = int(s['n0'] * SR); j = min(N, i + len(d)); nar[i:j] += d[:j - i]
v = np.convolve(np.abs(nar), np.ones(int(.1 * SR)) / int(.1 * SR), 'same'); v = np.clip(v / .08, 0, 1)
mix = mus * .06 * (1 - .45 * v)[:, None] + sfx * .14 * (1 - .4 * v)[:, None] + np.stack([nar, nar], 1) * .9
f = np.ones(N); f[-int(2 * SR):] = np.linspace(1, 0, int(2 * SR)); mix *= f[:, None]; mix *= .93 / np.abs(mix).max()
sf.write(AQUI / 'out/mix_raw.wav', mix.astype(np.float32), SR)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', AQUI / 'out/mix_raw.wav', '-af', 'loudnorm=I=-14:TP=-1:LRA=11', '-ar', '48000', AQUI / 'out/mix.wav'], check=True); print('out/mix.wav')
