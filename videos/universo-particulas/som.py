# Som ambiente da amostra: drone grave com acorde suspenso, brilho de "estrelas" e um sopro que cresce no fim.
import numpy as np, wave
SR, D = 48000, 12.0; t = np.arange(int(SR * D)) / SR; r = np.random.default_rng(3)
env = np.clip(t / 2.5, 0, 1) * np.clip((D - t) / 1.5, 0, 1)
dr = sum(np.sin(2 * np.pi * f * t + np.sin(2 * np.pi * .1 * t) * k) * a for f, a, k in [(55, .5, .3), (82.4, .3, .2), (110, .2, .4), (164.8, .12, .1), (246.9, .06, .2)])
ruido = np.convolve(r.standard_normal(len(t)), np.ones(400) / 400, 'same') * 3 * (t / D) ** 2
bri = np.zeros_like(t)
for k in range(28):
    t0 = r.uniform(.5, D - 1); f = r.choice([1318.5, 1760, 1975.5, 2637]); i = int(t0 * SR); n = int(1.5 * SR); tt = np.arange(n) / SR
    bri[i:i + n] += (np.sin(2 * np.pi * f * tt) * np.exp(-tt * 3) * .05)[:len(bri) - i]
x = (dr * .5 + ruido * .3 + bri) * env; x = x / np.abs(x).max() * .5
st = np.stack([x, np.roll(x, 600)], 1); w = wave.open('out/som.wav', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes()); w.close(); print('ok')
