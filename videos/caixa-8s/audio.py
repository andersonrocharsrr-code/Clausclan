# Trilha do vídeo de 8 s: música animada (120 bpm), efeitos (whoosh, pop, carimbo, moedas) e narração.
# Uso: python3 audio.py <pasta-da-voz> <saida.wav>   (a pasta tem a.wav, b.wav, c.wav de narracao.py)
import sys, numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt
SR, DUR = 44100, 8.0
N = int(SR * DUR); t = np.arange(N) / SR
mus = np.zeros((N, 2)); sfx = np.zeros((N, 2)); voz = np.zeros(N)
rng = np.random.default_rng(7)
def filt(x, kind, fc, order=2): return sosfilt(butter(order, fc, kind, fs=SR, output='sos'), x)
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def put(buf, sig, start, pan=.5, g=1.0):
    i = int(start * SR); sig = sig[:max(0, len(buf) - i)]
    if buf.ndim == 1: buf[i:i + len(sig)] += sig * g
    else: buf[i:i + len(sig), 0] += sig * g * np.sqrt(1 - pan); buf[i:i + len(sig), 1] += sig * g * np.sqrt(pan)
def tt(d): return np.arange(int(d * SR)) / SR

# ---------- música ----------
def pluck(m, d=.45, g=1.0):
    x = tt(d); f = hz(m); s = sum(np.sin(2 * np.pi * f * k * x) / k ** 1.3 for k in range(1, 7))
    return filt(s * np.exp(-x * 9) * g, 'lowpass', 5200)
def baixo(m, d=.45): x = tt(d); return np.sin(2 * np.pi * hz(m) * x) * np.minimum(1, x * 200) * np.exp(-x * 3)
def bumbo(): x = tt(.35); f = 55 + 120 * np.exp(-x * 30); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 11)
def chimbal(): x = tt(.06); return filt(rng.standard_normal(len(x)), 'highpass', 7000) * np.exp(-x * 70) * .5
def palmas(): x = tt(.18); return filt(rng.standard_normal(len(x)), 'bandpass', [900, 2600]) * np.exp(-x * 26)
ACORDES = [(60, 64, 67), (55, 59, 62, 67), (57, 60, 64), (53, 57, 60, 65)]  # Dó, Sol, Lá menor, Fá (1 compasso de 2 s cada)
BEAT = .5
for c in range(4):
    ac = ACORDES[c]
    for k in range(8):  # colcheias
        st = c * 2 + k * BEAT / 2; nota = ac[[0, 1, 2, 1, 0, 2, 1, 2][k] % len(ac)] + 12
        put(mus, pluck(nota, .35, .22), st, pan=.35 + .3 * (k % 2))
    for b in range(4):
        st = c * 2 + b * BEAT
        put(mus, baixo(ac[0] - 24), st, g=.35)
        if st >= 2.5: put(mus, bumbo(), st, g=.55)
        if st >= 2.5: put(mus, chimbal(), st + BEAT / 2, pan=.6, g=.35)
        if st >= 2.5 and b % 2 == 1: put(mus, palmas(), st, g=.22)
# acorde final segurando no fim
for m in (60, 64, 67, 72): put(mus, pluck(m, 1.2, .25), 7.5, pan=.5)
mus = filt(mus.T, 'highpass', 40).T

# ---------- efeitos ----------
def whoosh(d=.45):
    x = tt(d); n = rng.standard_normal(len(x)); env = np.sin(np.pi * x / d) ** 2
    lo = filt(n, 'bandpass', [300, 1400]); hi = filt(n, 'bandpass', [1400, 5000])
    return (lo * (1 - x / d) + hi * (x / d)) * env * .7
def pop(f0=900):
    x = tt(.12); f = f0 * np.exp(-x * 22) + 180; return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 38)
def carimbo():
    x = tt(.3); thump = np.sin(2 * np.pi * np.cumsum(90 * np.exp(-x * 9) + 50) / SR) * np.exp(-x * 14)
    clique = filt(rng.standard_normal(len(x)), 'bandpass', [1500, 4500]) * np.exp(-x * 60) * .6
    return thump + clique
def sino(m, d=1.0):
    x = tt(d); return sum(np.sin(2 * np.pi * hz(m) * r * x) * a for r, a in [(1, 1), (2.76, .4), (5.4, .2)]) * np.exp(-x * 4.5) * np.minimum(1, x * 400)
def moedas():
    out = np.zeros(int(.9 * SR))
    for i in range(9):
        s = sino(96 + rng.integers(-3, 4), .3) * .25; j = int((i * .07 + rng.random() * .03) * SR); out[j:j + len(s)] += s[:len(out) - j]
    return out
put(sfx, whoosh(), 2.5 - .3, pan=.3, g=.55)
put(sfx, whoosh(), 5.15 - .3, pan=.7, g=.55)
put(sfx, whoosh(), 6.75 - .3, pan=.4, g=.55)
put(sfx, carimbo(), 1.62, g=.8)
for st in (.25, .39, .53, .67, .81): put(sfx, pop(1200), st, pan=.5, g=.12)       # palavras do título
for st in (3.30, 3.72, 4.14): put(sfx, pop(1000), st, pan=.5, g=.5)              # notas entrando
put(sfx, pop(700), 3.0, g=.35)                                                    # caixinha aparece
for m in (84, 88, 91): put(sfx, sino(m), 5.36, g=.22)                             # "Fechou!"
put(sfx, moedas(), 5.34, pan=.5, g=.8)
put(sfx, sino(96, .6) + sino(100, .6), 5.78, g=.15)                               # check do total
put(sfx, pop(600), 6.82, g=.45)                                                   # ícone

# ---------- narração ----------
pasta = sys.argv[1]
for k, st in (('a', .20), ('b', 2.70), ('c', 5.38)):
    sr, v = wavfile.read(f'{pasta}/{k}.wav'); v = v.astype(np.float64) / 32768; put(voz, v, st)
# música abaixa quando a voz entra (envelope suave)
e = np.convolve(np.abs(voz) > .02, np.ones(int(.25 * SR)) / int(.25 * SR), 'same')
duck = 1 - .5 * np.minimum(1, e * 3)
mix = mus * duck[:, None] * .9 + sfx + np.stack([voz, voz], 1) * 1.15
mix[-int(.4 * SR):] *= np.linspace(1, 0, int(.4 * SR))[:, None]
mix *= .89 / np.max(np.abs(mix))
wavfile.write(sys.argv[2], SR, (mix * 32767).astype(np.int16))
print('ok', sys.argv[2])
