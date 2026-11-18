# Mixa vozes + sons da mata + trilha de suspense. Uso: python3 audio.py <pasta com nar/ e sfx/> <saida.wav>
# Voz do homem de preto: mais grave (rubberband) e com eco curto. Música e efeitos abaixam sozinhos sob as falas.
import sys, os, json, subprocess, re, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
from scipy.ndimage import maximum_filter1d, uniform_filter1d
BASE, OUT = sys.argv[1], sys.argv[2]
AQUI = os.path.dirname(os.path.abspath(__file__))
TP = json.load(open(f'{AQUI}/tempos.json')); S, E, VOZ, D = TP['S'], TP['E'], TP['VOZ'], TP['DUR']
PAL = json.load(open(f'{AQUI}/palavras.json'))
SR = 44100; n = int(SR * D); t = np.arange(n) / SR; rng = np.random.default_rng(7)
norm = lambda w: re.sub(r'[^\wà-ÿ-]', '', w.lower())
def P(k, frase, d=0):
    alvo = [norm(w) for w in frase.split()]; ws = PAL[k]
    for i in range(len(ws) - len(alvo) + 1):
        if all(norm(ws[i + j][0]) == alvo[j] for j in range(len(alvo))): return S[k] + ws[i][1] + d
    raise SystemExit(f'frase não achada: {k} {frase}')
def filt(x, kind, fc, order=2, axis=-1): return sosfilt(butter(order, fc, kind, fs=SR, output='sos'), x, axis=axis)
def env(points): return np.interp(t, [p[0] for p in points], [p[1] for p in points])
# ---------------- efeitos ----------------
sfx = np.zeros((n, 2)); SM = {}
def smp(k):
    if k not in SM:
        d, sr = sf.read(f'{BASE}/sfx/{k}.wav'); d = d if d.ndim == 2 else np.stack([d, d], 1)
        d = filt(d, 'low', 9000, 4, axis=0); d = filt(d, 'high', 40, 2, axis=0); SM[k] = d / max(1e-9, np.sqrt((d ** 2).mean()) * 4)
    return SM[k]
def ps(t0, k, g=1.0, dur=None, fin=0.3, fout=0.8, off=0.0):
    d = smp(k)[int(off * SR):]
    if dur: d = d[:int(dur * SR)]
    L = len(d); e = np.ones(L); nf = min(L, int(fin * SR)); no = min(L, int(fout * SR))
    if nf: e[:nf] = np.linspace(0, 1, nf)
    if no: e[-no:] *= np.linspace(1, 0, no)
    i = int(t0 * SR); end = min(n, i + L)
    if 0 <= i < n: sfx[i:end] += d[:end - i] * e[:end - i, None] * g
def amb(k, t0, t1, g):  # ambiente em laço, com emendas cruzadas
    tot = len(smp(k)) / SR; o = t0; off = 0.0
    while o < t1 - .05:
        L = min(t1 - o + .8, tot - off); ps(o, k, g, dur=L, fin=1.2 if o == t0 else .8, fout=1.2 if o + L >= t1 else .8, off=off); o += L - .8; off = 1.0 if off == 0 else .5
c2 = S['a05'] - 6.2; c3 = S['n30'] - 5.8; fim = E['f15'] + .9
AMB = [('noite', .3, S['n07'] - .9, .55), ('drone', S['n05'] + 2, S['n07'] - 1.2, .45),
       ('seringal', S['n07'] - .9, S['n08'] - .3, .5), ('dia', S['n08'] - .3, S['n10'] - .3, .5), ('chuva', S['n10'] - .3, P('n10', 'O dinheiro') - .2, .6),
       ('seringal', P('n10', 'O dinheiro') - .2, S['n11'] - .3, .45), ('noite', S['n11'] - .3, S['a03'] - 2.2, .5), ('tarde', S['a03'] - 2.2, c2 - .6, .45),
       ('seringal', S['a05'] - .4, P('n14', 'Levava') + 3.4, .45), ('dia', P('n14', 'Levava') + 3.4, S['n15'] + 4, .5), ('dia', S['n15'] + 4, S['n16'] - 1.6, .28),
       ('dia', S['n16'] - 1.6, S['n24'] + 6, .22), ('drone', S['n25'] - .3, S['n26'] + 6, .35), ('dia', S['n26'] - .3, S['n27'] - 2.4, .12),
       ('dia', S['n30'] - .4, S['n33'] - 2.4, .32), ('dia', S['n33'] - 2.4, P('n33', 'Depois,') - .2, .4), ('chuva', P('n33', 'Depois,') - .2, P('n33', 'E mais') - .2, .55),
       ('tarde', P('n33', 'E mais') - .2, S['n35'] - .3, .4), ('dia', S['n35'] - .3, S['n36'] - .3, .45), ('chuva', S['n36'] - .3, P('n36', 'Aquele homem') - .25, .5),
       ('tarde', S['a08'] - 2.0, fim, .4), ('noite', fim, S['n38'] - .3, .4), ('drone', fim + 4, S['n38'] - .3, .45), ('tarde', S['n38'] - .3, P('n38', 'Os seringueiros') - .25, .4),
       ('dia', P('n38', 'Os seringueiros') - .25, S['n39'] - .3, .45), ('noite', S['n39'] - .3, S['n41'] - .3, .45), ('drone', S['n40'] - .3, D - 4, .4),
       ('noite', S['n41'] - .3, D - 1, .25)]
for k, a, b, g in AMB: amb(k, a, b, g)
EV = [('passos', S['n02'] - .2, .5, 9), ('passos', S['n05'] - .3, .45, 4.2), ('vento', S['d05'] - .1, .9, 6.5), ('trovao', S['n06'] - .3 - 1.4, 1.4, None),
      ('passos', S['n07'] - .9, .35, 6), ('passos', S['n12'] - .3, .35, 7), ('cartuchos', S['n14'] - .3 + .4, .9, 3.2), ('passos', P('n14', 'Levava') + 3.4, .4, 6),
      ('passaros', P('n15', 'Os pássaros') - .2, .9, None), ('rumor', P('n15', 'ruído') - .1, 1.0, None), ('passos', S['n16'] - 1.6, .9, 3.5),
      ('correria', P('n16', 'Uma capivara') - .1, .6, 3), ('macaco', P('n17', 'quando um macaco') - .1, .9, None), ('queixadas', S['n18'] - .3, 1.0, 7.2),
      ('onca', S['n20'] - .1, 1.0, None), ('correria', S['n20'], .5, 7), ('anta', S['n22'] + .6, 1.0, None), ('correria', S['n22'] + .4, .5, 5),
      ('araras', S['n23'] - .3, 1.0, 8), ('correria', S['n24'] - .3, .9, 9), ('araras', S['n24'] + 1, .6, 8), ('queixadas', S['n24'] + 3, .5, 6),
      ('respiracao', S['f12'] - 8.6, .7, 8.6), ('passos', S['f12'] - 7, .45, 3.6), ('respiracao', S['n27'] - 2.4, .65, 10), ('respiracao', S['n28'] + 4, .45, 10), ('respiracao', S['n29'], .55, 7),
      ('passos', S['n30'] - .4, .35, 8), ('passos', S['n33'] - 2.4, .4, 3), ('passos', P('n34', 'Seguiu pegadas') - .25, .35, 6),
      ('passos', S['a08'] - 2.0, .4, 2.6), ('passos', fim + 3.2, .4, 6), ('arara1', S['n37'] - 1.5, .4, None),
      ('pesados', P('n41', 'passos') - .2, 1.1, 10), ('arara1', E['d06'] + 2.2, .8, None)]
for k, t0, g, du in EV: ps(t0, k, g, dur=du, fin=.05 if k in ('trovao', 'onca', 'anta', 'macaco') else .3)
# silêncio absoluto na cena 6 (só a respiração)
cala = 1 - env([(0, 0), (S['n27'] - 2.6, 0), (S['n27'] - 2.0, .92), (S['n30'] - 6.4, .92), (S['n30'] - 5.8, 0), (D, 0)])
sfx = sfx * cala[:, None]
for k, t0, g, du in EV:
    if k == 'respiracao' and S['n27'] - 3 < t0 < S['n30']: ps(t0, k, g * .9, dur=du)
sfx = filt(sfx, 'high', 30, axis=0)
# ---------------- música: cordas graves, pulso e crescendo ----------------
mus = np.zeros((n, 2))
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def put(sig, start, pan=.5, g=1.0):
    i = int(start * SR)
    if i >= n or i + len(sig) <= 0: return
    if i < 0: sig = sig[-i:]; i = 0
    e = min(n, i + len(sig)); s = sig[:e - i] * g; mus[i:e, 0] += s * np.cos(pan * np.pi / 2); mus[i:e, 1] += s * np.sin(pan * np.pi / 2)
def ad(L, a, r): x = np.ones(L); na = max(1, int(a * SR)); nr = max(1, int(r * SR)); x[:na] = np.linspace(0, 1, na) ** 1.5; x[-nr:] *= np.linspace(1, 0, nr) ** 1.5; return x
def cordas(m, dur, g=1.0, bright=5):
    L = int(dur * SR); tt = np.arange(L) / SR; f = hz(m); s = np.zeros(L)
    for det in (-.004, 0, .005):
        vib = 1 + .003 * np.sin(2 * np.pi * 4.8 * tt + rng.random() * 6); ph = 2 * np.pi * np.cumsum(f * (1 + det) * vib) / SR
        for k in range(1, bright + 1): s += np.sin(k * ph) / (k ** 1.4) / 3
    return filt(s, 'low', 2400) * ad(L, min(2.5, dur * .4), min(2.5, dur * .4)) * g * .1
def timp(m, g=1.0):
    L = int(2.2 * SR); tt = np.arange(L) / SR; f = hz(m) * (1 + .2 * np.exp(-tt * 30)); ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) + .35 * np.sin(1.5 * ph)) * np.exp(-tt * 2.4) * g * .3 + filt(rng.standard_normal(L), 'low', 260) * np.exp(-tt * 22) * g * .12
def flauta(m, dur, g=1.0):
    L = int(dur * SR); tt = np.arange(L) / SR; ph = 2 * np.pi * hz(m) * tt * (1 + .004 * np.sin(2 * np.pi * 5.2 * tt)); s = np.sin(ph) + .25 * np.sin(2 * ph) + .08 * np.sin(3 * ph)
    return (s + .05 * filt(rng.standard_normal(L), 'band', [800, 3000])) * ad(L, .08, min(.4, dur * .5)) * g * .05
def pulso(t0, t1, bpm, m, g):  # batida grave tipo coração
    k = 0; per = 60 / bpm
    while t0 + k * per < t1: put(timp(m, g), t0 + k * per); put(timp(m, g * .55), t0 + k * per + .22); k += 1
CH = {'Dm': (38, 45, 50, 53, 57), 'Bb': (34, 46, 50, 53, 58), 'Gm': (31, 43, 50, 55, 58), 'A': (33, 45, 49, 52, 57), 'F': (29, 41, 48, 53, 57),
      'C': (36, 43, 48, 52, 55), 'Ebm': (39, 46, 51, 54, 58), 'Cm': (36, 43, 48, 51, 55), 'Am': (33, 45, 48, 52, 57)}
# seções: (início, fim, acordes, intensidade)
SEC = [(.2, 3.6, ['Dm'], .5), (3.6, S['n05'] - .3, ['Dm', 'Bb', 'Gm', 'A'], .55), (S['n05'] - .3, S['d05'] - .3, ['Dm', 'Ebm', 'Dm', 'Cm', 'Ebm', 'A'], .7),
       (S['d05'] - .3, S['n07'] - 1.0, ['Ebm', 'Dm', 'Bb', 'A', 'Dm'], .85), (S['n07'] - .9, S['n11'] - .3, ['F', 'C', 'Dm', 'Bb', 'F', 'C', 'Gm', 'A'], .45),
       (S['n11'] - .3, S['a03'] - 2.2, ['Dm', 'Ebm'], .6), (S['a03'] - 2.2, c2 - .4, ['F', 'Am', 'Dm', 'Bb', 'Gm', 'A'], .45), (c2, S['a05'] - .4, ['Dm'], .5),
       (S['a05'] - .4, S['n15'] - .3, ['F', 'C', 'Dm', 'Am', 'Bb'], .4), (S['n15'] - .3, S['n16'] - 1.6, ['Dm', 'Cm', 'Ebm'], .55),
       (S['n16'] - 1.6, S['f12'] - 9.0, ['Dm', 'Ebm', 'Dm', 'Cm', 'Ebm', 'Dm', 'A', 'Ebm'], .75), (S['n25'] - .3, S['n27'] - 2.4, ['Am', 'Dm', 'Bb', 'A'], .45),
       (c3, S['n30'] - .4, ['Dm'], .45), (S['n30'] - .4, S['a08'] - 2.0, ['Dm', 'Bb', 'Gm', 'Am', 'Dm', 'Bb', 'Gm', 'A'], .45), (S['a08'] - 2.0, fim, ['Gm', 'Dm'], .35),
       (fim, S['n37'] - .3, ['Dm', 'Ebm', 'Cm', 'Ebm'], .8), (S['n37'] - .3, S['n40'] - .3, ['Dm', 'Bb', 'Gm', 'A', 'Dm'], .5),
       (S['n40'] - .3, S['d06'] - .3, ['Dm', 'Ebm', 'Cm', 'Ebm', 'Dm', 'A'], .65), (S['d06'] - .3, D - .2, ['Ebm', 'Dm', 'Bb', 'Gm', 'Dm'], .7)]
for a, b, chs, I in SEC:
    L = (b - a) / len(chs)
    for j, ch in enumerate(chs):
        for i, m in enumerate(CH[ch]): put(cordas(m, L + 2.0, (1.4 if i < 2 else .6) * I), a + j * L - .2, .3 + .1 * i)
# melodia leve no tempo bom (as caçadas dão certo)
mel = [74, 72, 69, 67, 69, 72, 74, 77, 74, 72, 69, 67, 65, 67, 69, 67]
for k in range(int((S['n11'] - S['n08']) / .75)): put(flauta(mel[k % 16], .7, .9), S['n08'] - .3 + k * .75, .55)
pulso(S['n05'] + 3, S['d05'] - .3, 54, 38, .45); pulso(S['d05'] - .3, S['n06'] - 1.7, 76, 38, .6)
pulso(S['n16'] - 1.6, S['f12'] - 9.0, 96, 38, .55); pulso(fim + 3, S['n37'] - .3, 60, 38, .5); pulso(S['n41'] - .3, S['d06'] - .3, 50, 36, .5)
for tt0, g in [(S['d01'] - .4, 1.0), (S['n06'] - .3 - 1.4, 1.2), (3.6, .6), (c2, .8), (c3, .8), (P('n11', 'Vinha') - .1, .9), (P('n19', 'Mas o que veio') - .2, .9),
               (S['n20'] - .2, .8), (S['f12'] - 9.0, .9), (E['f15'] + 13.6, 1.0), (P('n42', 'Seus olhos') - .2, 1.0), (S['d06'] - .2, 1.1), (E['d06'] + 7.6, 1.0)]: put(timp(38, g), tt0, .5)
# crescendo no desaparecimento
put(cordas(62, 12, .8, 7) * np.linspace(.2, 1.6, int(14 * SR))[:int(12 * SR)], fim + 1.5, .7)
rev = np.zeros_like(mus)
for dl, g in ((.041, .5), (.067, .42), (.097, .36), (.149, .3), (.23, .22), (.36, .16), (.52, .1), (.71, .06)):
    k = int(dl * SR); rev[k:] += mus[:-k] * g
mus = filt(mus * .7 + rev * .6, 'high', 30, axis=0)
# música some na fuga dos bichos (só os sons) e na cena do silêncio
mus *= env([(0, 0), (.5, 1), (S['n24'] + 2, 1), (S['n24'] + 5, .35), (S['f12'] - 9.2, .35), (S['f12'] - 8.8, 0), (S['n25'] - .6, 0), (S['n25'] + .5, 1),
             (S['n27'] - 2.6, 1), (S['n27'] - 1.6, 0), (c3 - .2, 0), (c3 + .6, 1), (D - 2.5, 1), (D - .2, 0)])[:, None]
mus /= np.abs(mus).max()
# ---------------- vozes ----------------
nar = np.zeros(n)
def grave(k):  # homem de preto: 3 semitons abaixo, mesmo tempo
    w = f'{BASE}/nar/{k}.wav'; o = f'{BASE}/nar/{k}_grave.wav'
    if not os.path.exists(o): subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', w, '-af', 'rubberband=pitch=0.84:formant=preserved,aecho=0.7:0.5:60|110:0.25|0.15', o], check=True)
    return o
for k, t0 in S.items():
    w = grave(k) if VOZ[k] == 'D' else f'{BASE}/nar/{k}.wav'
    d, sr = sf.read(w); d = d if d.ndim == 1 else d.mean(1); d = filt(d, 'high', 70)
    rms = np.sqrt((d[np.abs(d) > .01] ** 2).mean()); d = d / rms * .16 * {'N': 1, 'F': .95, 'A': .95, 'D': 1.05}[VOZ[k]] * (.7 if k == 'f12' else 1)
    i = int(t0 * SR); e = min(n, i + len(d)); nar[i:e] += d[:e - i]
nar = np.tanh(nar * 1.4) / 1.4
a = np.abs(nar); k = int(.05 * SR); voice = np.clip(np.convolve(a, np.ones(k) / k, 'same') / .04, 0, 1)
voice = uniform_filter1d(maximum_filter1d(voice, int(.5 * SR)), int(.35 * SR))
mix = mus * .2 * (1 - .5 * voice)[:, None] + sfx / max(1e-9, np.abs(sfx).max()) * .55 * (1 - .55 * voice)[:, None] + np.stack([nar, nar], 1)
mix *= env([(0, 0), (.05, 1), (D - 1.2, 1), (D - .1, 0)])[:, None]
mix = np.tanh(mix * 1.1) / np.tanh(1.1); mix /= np.abs(mix).max() / .95
sf.write(OUT, mix.astype(np.float32), SR); print('ok', OUT)
