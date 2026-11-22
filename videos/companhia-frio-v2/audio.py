# Trilha da versão 2: música gerada na ElevenLabs (musica.mp3), poucos efeitos e a narração BEM acima da música.
# Uso: python3 audio.py <pasta-da-voz> <saida.wav>   (a pasta tem a.wav ... f.wav de ../companhia-frio/narracao.py)
import sys, subprocess, numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt
SR, DUR = 44100, 35.0
N = int(SR * DUR); rng = np.random.default_rng(7)
def filt(x, kind, fc, order=2): return sosfilt(butter(order, fc, kind, fs=SR, output='sos'), x)
def tt(d): return np.arange(int(d * SR)) / SR
def put(buf, sig, st, g=1.0): i = int(st * SR); sig = sig[:max(0, len(buf) - i)]; buf[i:i + len(sig)] += sig * g
def rms(x): return np.sqrt(np.mean(x ** 2) + 1e-12)

# música
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', 'musica.mp3', '-ac', '2', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True, check=True).stdout
mus = np.frombuffer(raw, np.int16).reshape(-1, 2).astype(np.float64) / 32768; mus = np.pad(mus, ((0, max(0, N - len(mus))), (0, 0)))[:N]
# voz
voz = np.zeros(N)
for k, st in (('a', .4), ('b', 5.9), ('c', 11.9), ('d', 19.1), ('e', 23.9), ('f', 29.6)):
    sr, v = wavfile.read(f'{sys.argv[1]}/{k}.wav'); put(voz, v.astype(np.float64) / 32768, st)
voz /= np.max(np.abs(voz))
# efeitos leves
sfx = np.zeros(N)
def whoosh(d=.45):
    x = tt(d); n = rng.standard_normal(len(x)); return (filt(n, 'bandpass', [300, 1400]) * (1 - x / d) + filt(n, 'bandpass', [1400, 5000]) * (x / d)) * np.sin(np.pi * x / d) ** 2
def pop(f0=900): x = tt(.12); return np.sin(2 * np.pi * np.cumsum(f0 * np.exp(-x * 22) + 180) / SR) * np.exp(-x * 38)
def sino(m, d=.6): x = tt(d); f = 440 * 2 ** ((m - 69) / 12); return sum(np.sin(2 * np.pi * f * r * x) * a for r, a in [(1, 1), (2.76, .4)]) * np.exp(-x * 5) * np.minimum(1, x * 400)
def brilho(base=91): o = np.zeros(int(SR)); [put(o, sino(base + d, .5) * .2, i * .06) for i, d in enumerate([0, 4, 7, 12, 16, 19])]; return o
for c in (2.45, 5.5, 11.5, 18.6, 23.5, 29.2): put(sfx, whoosh(), c - .3, .25)
for st in (3.3, 6.3, 12.6, 14.9, 21.5, 25.25, 26.35, 31.6): put(sfx, pop(), st, .18)
for st in (7.55, 15.1, 28.6): put(sfx, brilho(), st, .25)
# níveis: música baixa o tempo todo e ainda mais baixa quando a voz fala
fala = np.convolve(np.abs(voz) > .03, np.ones(int(.3 * SR)) / int(.3 * SR), 'same'); fala = np.minimum(1, fala * 4)
alvo = rms(voz[np.abs(voz) > .03])
mus *= (alvo / rms(mus)) * (0.32 - 0.20 * fala)[:, None]      # ≈ -10 dB sem voz, ≈ -18 dB embaixo da voz
mix = mus + np.stack([voz, voz], 1) + np.stack([sfx, sfx], 1)
mix[-int(.6 * SR):] *= np.linspace(1, 0, int(.6 * SR))[:, None]
mix *= .89 / np.max(np.abs(mix))
wavfile.write(sys.argv[2], SR, (mix * 32767).astype(np.int16)); print('ok')
