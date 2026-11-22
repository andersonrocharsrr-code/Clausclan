# Som 8-bit: narração (Rodrigo Custódio) + trilha chiptune que muda a cada capítulo + efeitos (moedas, máquina de escrever, transições). Uso: python3 audio.py <pasta com nar/> <saida.wav>
import sys, json, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
from scipy.ndimage import maximum_filter1d, uniform_filter1d
from narracao import FALAS
P, OUT = sys.argv[1], sys.argv[2]
TP = json.load(open('tempos.json')); SR = 44100; DUR = TP['DUR']; n = int(SR * DUR); rng = np.random.default_rng(4); C = TP['CUTS']
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
def env(L, a=.004, r=.05): e = np.ones(L); na, nr = max(1, int(a * SR)), max(1, min(L, int(r * SR))); e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.linspace(1, 0, nr); return e
def quad(m, d, duty=.25, g=1.): L = int(d * SR); ph = (hz(m) * np.arange(L) / SR) % 1; return np.where(ph < duty, 1., -1.) * env(L, .003, min(.08, d * .5)) * g
def tri(m, d, g=1.): L = int(d * SR); ph = (hz(m) * np.arange(L) / SR) % 1; return (4 * np.abs(ph - .5) - 1) * env(L, .003, .03) * g
def ruido(d, g=1., dec=30, passo=8): L = int(d * SR); x = np.repeat(rng.uniform(-1, 1, L // passo + 1), passo)[:L]; return x * np.exp(-np.arange(L) / SR * dec) * g
mus = np.zeros(n); sfx = np.zeros(n)
def add(buf, sig, t0):
    i = int(t0 * SR)
    if i >= n or i < 0: return
    j = min(n, i + len(sig)); buf[i:j] += sig[:j - i]
# trilha: cada trecho (entre cartões de capítulo) tem acordes próprios; 120 bpm em colcheias
caps = [c[0] for c in TP['CAPT']]; trechos = [0] + caps + [DUR]
PROGS = [[(60, [60, 64, 67, 72]), (57, [57, 60, 64, 69]), (53, [53, 57, 60, 65]), (55, [55, 59, 62, 67])],   # Dó: abertura alegre
         [(57, [57, 60, 64, 69]), (55, [55, 59, 62, 67]), (53, [53, 57, 60, 65]), (55, [55, 59, 62, 67])],   # troca
         [(57, [57, 60, 64, 69]), (52, [52, 56, 59, 64]), (57, [57, 60, 64, 69]), (52, [52, 56, 59, 64])],   # Mesopotâmia (exótico)
         [(62, [62, 66, 69, 74]), (59, [59, 62, 66, 71]), (55, [55, 59, 62, 67]), (57, [57, 61, 64, 69])],   # moedas
         [(57, [57, 60, 64, 69]), (60, [60, 64, 67, 72]), (62, [62, 65, 69, 74]), (64, [64, 67, 71, 76])],   # China (pentatônico)
         [(65, [65, 69, 72, 77]), (60, [60, 64, 67, 72]), (62, [62, 65, 69, 74]), (60, [60, 64, 67, 72])],   # bancos
         [(52, [52, 55, 59, 64]), (48, [48, 52, 55, 60]), (50, [50, 54, 57, 62]), (47, [47, 51, 54, 59])],   # prata (sombrio)
         [(55, [55, 59, 62, 67]), (52, [52, 55, 59, 64]), (48, [48, 52, 55, 60]), (50, [50, 54, 57, 62])],   # confiança
         [(60, [60, 64, 67, 71]), (57, [57, 60, 64, 67]), (53, [53, 57, 60, 64]), (55, [55, 59, 62, 65])]]   # digital
e8 = .25
for s_i, (a, b) in enumerate(zip(trechos, trechos[1:])):
    prog = PROGS[s_i % len(PROGS)]; t = a + (1.8 if s_i else 0); k = 0
    while t < b - .1:
        raiz, arp = prog[(k // 8) % 4]
        add(mus, quad(arp[(k * (3 if s_i == 2 else 1)) % 4] + 12, e8 * .85, .125 if s_i % 2 else .25, .13), t)
        if k % 2 == 0: add(mus, tri(raiz - 24, e8 * 1.8, .42), t)
        if k % 4 == 2: add(mus, ruido(.05, .14, 70), t)
        if k % 8 == 0: add(mus, ruido(.15, .3, 22), t); add(mus, tri(raiz - 36, .22, .5) * np.exp(-np.arange(int(.22 * SR)) / SR * 14), t)
        if k % 8 == 4: add(mus, ruido(.1, .24, 28), t)
        if k % 16 == 0 and k > 0: add(mus, quad(arp[2] + 24, e8 * 6, .5, .045), t)
        t += e8; k += 1
    if s_i: # fanfarra do cartão de capítulo
        for j, m in enumerate([72, 76, 79, 84]): add(sfx, quad(m, .12, .5, .25), a + .05 + j * .1)
        add(sfx, quad(88, .5, .25, .2), a + .45)
        for j in range(14): add(sfx, quad(70 + (j % 3), .025, .5, .07), a + .5 + j * .05)
for c in C[1:-1]:  # transição: varredura de ruído
    L = int(.3 * SR); x = np.repeat(rng.uniform(-1, 1, L // 4 + 1), 4)[:L] * np.linspace(1, 0, L) * .18; add(sfx, x, c - .05)
def moeda_som(t0, g=.3): add(sfx, quad(88, .06, .5, g), t0); add(sfx, quad(93, .25, .5, g * .8), t0 + .06)
moeda_som(C[0] + 1.8, .35); add(sfx, quad(84, .4, .5, .2), C[0] + 2.0)         # PAGO!
for i in range(12): moeda_som(C[2] + .2 + i * .35, .12)                         # chuva de moedas do título
for k in (17, 19, 21, 24, 43, 46): moeda_som(C[k] + .3, .25)
for i in range(10): add(sfx, ruido(.04, .25, 80, 2), C[20] + .2 + i / 1.5)        # martelo cunhando moedas
for i in range(20): add(sfx, ruido(.05, .12, 50, 3), C[26] + .1 + i * .17)       # impressora
add(sfx, ruido(.5, .6, 8, 16), C[38] + 1.2); add(sfx, quad(40, .3, .5, .3), C[38] + 1.2)  # corrente rompe
for i in range(6): add(sfx, quad(60 - i * 3, .25, .5, .15), C[40] + .5 + i * .3)  # derretendo
for i in range(8): add(sfx, quad(76 + i * 2, .05, .5, .12), C[42] + .5 + i * .3)  # preço subindo
add(sfx, quad(81, .1, .5, .2), C[46] + 2.8); add(sfx, quad(88, .3, .5, .2), C[46] + 2.9)  # Pix
nar = np.zeros(n)
for k, t0 in TP['NARS'].items():
    d, _ = sf.read(f'{P}/nar/{k}.wav'); d = d if d.ndim == 1 else d.mean(1); d /= np.abs(d).max(); add(nar, d * .92, t0)
sos = butter(2, 5000, 'low', fs=SR, output='sos'); mus = sosfilt(sos, mus); mus /= np.abs(mus).max(); sfx /= max(1e-9, np.abs(sfx).max())
a = np.abs(nar); k = int(.05 * SR); v = np.clip(np.convolve(a, np.ones(k) / k, 'same') / .05, 0, 1); v = uniform_filter1d(maximum_filter1d(v, int(.4 * SR)), int(.3 * SR))
mix = mus * .17 * (1 - .45 * v) + sfx * .3 * (1 - .35 * v) + nar
fade = np.ones(n); fade[:int(.3 * SR)] = np.linspace(0, 1, int(.3 * SR)); fade[-int(1.2 * SR):] = np.linspace(1, 0, int(1.2 * SR)); mix *= fade; mix = np.tanh(mix * 1.05) / np.tanh(1.05); mix /= np.abs(mix).max() / .95
sf.write(OUT, np.stack([mix, mix], 1).astype(np.float32), SR); print('ok')
