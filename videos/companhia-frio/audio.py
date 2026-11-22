# Trilha do vídeo de 35 s: música animada (120 bpm), efeitos (whoosh, pop, brilho, chiado do gás, baque) e narração.
# Uso: python3 audio.py <pasta-da-voz> <saida.wav>   (a pasta tem a.wav ... f.wav de narracao.py)
import sys, numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt
SR, DUR = 44100, 35.0
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
for c in range(17):  # 17 compassos de 2 s = 34 s
    ac = ACORDES[c % 4]
    for k in range(8):  # colcheias
        st = c * 2 + k * BEAT / 2; nota = ac[[0, 1, 2, 1, 0, 2, 1, 2][k] % len(ac)] + 12
        put(mus, pluck(nota, .35, .2), st, pan=.35 + .3 * (k % 2))
    for b in range(4):
        st = c * 2 + b * BEAT
        put(mus, baixo(ac[0] - 24), st, g=.35)
        if st >= 2.5: put(mus, bumbo(), st, g=.5)
        if st >= 2.5: put(mus, chimbal(), st + BEAT / 2, pan=.6, g=.3)
        if st >= 5.5 and b % 2 == 1: put(mus, palmas(), st, g=.2)
for m in (60, 64, 67, 72): put(mus, pluck(m, 1.5, .25), 34.0, pan=.5)
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
def chiado(d):
    x = tt(d); return filt(rng.standard_normal(len(x)), 'bandpass', [2500, 8000]) * np.minimum(1, x * 3) * np.minimum(1, (d - x) * 3) * .35
def baque():
    x = tt(.5); return np.sin(2 * np.pi * np.cumsum(70 * np.exp(-x * 6) + 40) / SR) * np.exp(-x * 7) + filt(rng.standard_normal(len(x)), 'lowpass', 900) * np.exp(-x * 20) * .5
def brilho_s(n=7, base=96):
    out = np.zeros(int(1.0 * SR))
    for i in range(n):
        s_ = sino(base + [0, 4, 7, 12, 16, 19, 24][i % 7], .5) * .2; j = int(i * .06 * SR); out[j:j + len(s_)] += s_[:len(out) - j]
    return out
for c, pan in zip((5.5, 11.5, 18.6, 23.5, 29.2), (.3, .7, .3, .7, .5)): put(sfx, whoosh(), c - .3, pan=pan, g=.55)
put(sfx, carimbo(), .5, g=.25)                                                     # termômetro
put(sfx, pop(700), 2.6, g=.4); put(sfx, brilho_s(), 2.75, g=.5)                    # logo + mascote
for st in (5.65, 11.65, 18.75, 23.65): put(sfx, pop(900), st, g=.4)                # etiqueta de cada serviço
put(sfx, pop(1100), 6.1, g=.3)
put(sfx, brilho_s(), 7.55, g=.7); put(sfx, pop(1100), 7.65, g=.35)                 # LED acende
put(sfx, pop(1100), 12.3, g=.35)
put(sfx, whoosh(1.0), 14.4, pan=.7, g=.4); put(sfx, brilho_s(), 15.45, g=.6); put(sfx, pop(1100), 15.4, g=.35)  # cortina da limpeza
put(sfx, chiado(2.6), 19.0, pan=.5, g=.5)                                           # gás
for m in (91, 96): put(sfx, sino(m, .8), 21.5, g=.25)                              # medição ok
put(sfx, carimbo(), 25.25, g=.5); put(sfx, whoosh(.5), 25.6, pan=.2, g=.4)          # sai o velho
put(sfx, baque(), 26.25, g=.7); put(sfx, pop(1000), 26.35, g=.3)                    # entra o novo
put(sfx, brilho_s(9, 91), 27.3, g=.6); put(sfx, chiado(1.2), 27.3, g=.25)           # o frio volta
put(sfx, pop(700), 29.3, g=.4); put(sfx, brilho_s(), 29.4, g=.5)                    # final
for st in (31.6, 31.8, 32.0, 32.2): put(sfx, pop(1200), st, g=.25)
# ---------- narração ----------
pasta = sys.argv[1]
for k, st in (('a', .4), ('b', 5.9), ('c', 11.9), ('d', 19.1), ('e', 23.9), ('f', 29.6)):
    sr, v = wavfile.read(f'{pasta}/{k}.wav'); v = v.astype(np.float64) / 32768; put(voz, v, st)
# música abaixa quando a voz entra (envelope suave)
e = np.convolve(np.abs(voz) > .02, np.ones(int(.25 * SR)) / int(.25 * SR), 'same')
duck = 1 - .5 * np.minimum(1, e * 3)
mix = mus * duck[:, None] * .9 + sfx + np.stack([voz, voz], 1) * 1.15
mix[-int(.5 * SR):] *= np.linspace(1, 0, int(.5 * SR))[:, None]
mix *= .89 / np.max(np.abs(mix))
wavfile.write(sys.argv[2], SR, (mix * 32767).astype(np.int16))
print('ok', sys.argv[2])
