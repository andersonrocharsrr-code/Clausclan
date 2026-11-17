# Efeitos sintetizados (sem chiado): espadas, rugido, martelos, manivela. Uso: python3 sintetiza.py <pasta sfx>
import sys, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
SR = 44100; out = sys.argv[1]; rng = np.random.default_rng(7)
f = lambda x, k, fc, o=2: sosfilt(butter(o, fc, k, fs=SR, output='sos'), x)
def espada(n=1.2):
    L = int(n * SR); t = np.arange(L) / SR; s = np.zeros(L)
    for fr, a, d in ((1840, 1, 7), (2630, .7, 9), (3410, .5, 11), (4920, .3, 14), (1210, .5, 6)): s += a * np.sin(2 * np.pi * fr * t + rng.random() * 6) * np.exp(-t * d)
    s += f(rng.standard_normal(L), 'band', [1500, 6000]) * np.exp(-t * 60) * 1.5
    return f(s, 'low', 7000) * .5
def rugido(n=3.0):
    L = int(n * SR); t = np.arange(L) / SR; env = np.minimum(1, t / .35) * np.exp(-np.maximum(0, t - 1.2) * 1.6)
    f0 = 95 + 25 * np.sin(np.pi * t / n); ph = 2 * np.pi * np.cumsum(f0) / SR
    s = sum(np.sin(k * ph) / k for k in range(1, 14)) * (1 + .5 * np.sin(2 * np.pi * 28 * t))
    s = s + 2.5 * f(rng.standard_normal(L), 'band', [120, 1400]) * (1 + np.sin(2 * np.pi * 31 * t))
    return f(s * env, 'low', 3500) * .25
def martelos(n=8.0):
    L = int(n * SR); s = np.zeros(L)
    for k in range(int(n * 2.4)):
        i = int((k / 2.4 + rng.random() * .2) * SR); m = min(L - i, int(.3 * SR)); t = np.arange(m) / SR
        s[i:i + m] += (np.sin(2 * np.pi * (700 + rng.random() * 400) * t) * .6 + f(rng.standard_normal(m), 'band', [400, 3000])) * np.exp(-t * 30) * (.4 + .6 * rng.random())
    return f(s, 'low', 6500) * .5
def manivela(n=8.0):
    L = int(n * SR); t = np.arange(L) / SR; s = f(rng.standard_normal(L), 'band', [180, 900]) * (.5 + .5 * np.sin(2 * np.pi * 1.4 * t) ** 2)
    for k in range(int(n * 3)):
        i = int(k / 3 * SR); m = min(L - i, int(.12 * SR)); tt = np.arange(m) / SR; s[i:i + m] += np.sin(2 * np.pi * 320 * tt) * np.exp(-tt * 40) * .8
    return f(s, 'low', 5000) * .5
def estereo(x): x = x / max(1e-9, np.abs(x).max()) * .9; return np.stack([x, np.roll(x, 300)], 1)
sf.write(f'{out}/espadas.wav', estereo(np.concatenate([espada(1.0), espada(.8), espada(1.3), np.zeros(int(.4 * SR)), espada(1.0), espada(1.2)])), SR)
sf.write(f'{out}/espada.wav', estereo(espada(1.4)), SR)
sf.write(f'{out}/rugido.wav', estereo(rugido()), SR)
sf.write(f'{out}/martelos.wav', estereo(martelos()), SR)
sf.write(f'{out}/manivela.wav', estereo(manivela()), SR)
print('ok')
