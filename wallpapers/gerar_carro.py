"""Wallpaper 1080x2340: relogio vertical em faixa vermelha + carro esportivo estilizado."""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

S = 2  # supersampling para bordas suaves
W, H = 1080 * S, 2340 * S
hora = sys.argv[1] if len(sys.argv) > 1 else "095225"
data = sys.argv[2] if len(sys.argv) > 2 else "02.05.2027"
saida = sys.argv[3] if len(sys.argv) > 3 else "carro_vermelho.png"

yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)

# fundo preto com leve vinheta avermelhada
bg = np.zeros((H, W, 3), np.float32)
glow = np.exp(-(((xx - W * 0.5) / (W * 0.7)) ** 2 + ((yy - H * 0.62) / (H * 0.25)) ** 2))
bg += glow[..., None] * np.array([60, 6, 8])
img = Image.fromarray(np.clip(bg, 0, 255).astype(np.uint8))
d = ImageDraw.Draw(img)

# faixa vermelha vertical com degrade
bx0, bx1, by0, by1 = int(W * 0.30), int(W * 0.70), 0, int(H * 0.67)
band = np.zeros((by1 - by0, bx1 - bx0, 3), np.float32)
t = np.linspace(0, 1, by1 - by0)[:, None]
band[..., 0] = 200 - 70 * t
band[..., 1] = 18 - 10 * t
band[..., 2] = 22 - 12 * t
img.paste(Image.fromarray(band.astype(np.uint8)), (bx0, by0))

# digitos segmentados empilhados (HH / MM / SS)
SEG = {'0': 'abcdef', '1': 'bc', '2': 'abged', '3': 'abgcd', '4': 'fgbc', '5': 'afgcd',
       '6': 'afgedc', '7': 'abc', '8': 'abcdefg', '9': 'abcdfg'}

def digito(x0, y0, w, h, th, ch, cor):
    m = y0 + h // 2
    seg = {'a': (x0, y0, x0 + w, y0 + th), 'd': (x0, y0 + h - th, x0 + w, y0 + h),
           'g': (x0, m - th // 2, x0 + w, m + th // 2),
           'f': (x0, y0, x0 + th, m), 'b': (x0 + w - th, y0, x0 + w, m),
           'e': (x0, m, x0 + th, y0 + h), 'c': (x0 + w - th, m, x0 + w, y0 + h)}
    for k in SEG[ch]:
        d.rectangle(seg[k], fill=cor)

dw, dh, th, gx, gy = 150 * S, 250 * S, 46 * S, 34 * S, 40 * S
x0 = (W - (2 * dw + gx)) // 2
y0 = 330 * S
for linha in range(3):
    for col in range(2):
        digito(x0 + col * (dw + gx), y0 + linha * (dh + gy), dw, dh, th,
               hora[linha * 2 + col], (250, 250, 250))

fonte = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf', 56 * S)
d.text(((W - d.textlength(data, font=fonte)) / 2, 235 * S), data, font=fonte, fill=(250, 250, 250))

# ---- carro esportivo (perfil lateral estilizado) ----
cx, base = W * 0.5, H * 0.74  # centro e linha do chao
L = W * 0.96
def P(u, v):  # u: 0..1 ao longo do carro (frente->tras), v: altura relativa a L
    return (cx - L / 2 + u * L, base - v * L)

perfil = [P(0.00, 0.060), P(0.01, 0.090), P(0.08, 0.110), P(0.22, 0.135), P(0.34, 0.150),
          P(0.42, 0.190), P(0.50, 0.222), P(0.58, 0.228), P(0.67, 0.212), P(0.80, 0.175),
          P(0.90, 0.162), P(0.93, 0.190), P(1.00, 0.192), P(1.00, 0.178), P(0.975, 0.160),
          P(1.00, 0.140), P(1.00, 0.090), P(0.99, 0.050),
          P(0.94, 0.040), P(0.06, 0.040), P(0.01, 0.045)]

corpo = Image.new('L', (W, H), 0)
ImageDraw.Draw(corpo).polygon(perfil, fill=255)
# gradiente vermelho no corpo (mais claro em cima, reflexo)
cor = np.zeros((H, W, 3), np.float32)
vt = np.clip((base - yy) / (0.26 * L), 0, 1)
cor[..., 0] = 90 + 170 * vt ** 0.8
cor[..., 1] = 4 + 22 * vt ** 3
cor[..., 2] = 8 + 20 * vt ** 3
# linha de reflexo horizontal na lateral
faixa = np.exp(-((base - yy - 0.115 * L) / (0.008 * L)) ** 2)
cor += faixa[..., None] * np.array([120, 60, 60])
img.paste(Image.fromarray(np.clip(cor, 0, 255).astype(np.uint8)), (0, 0), corpo)

# janelas
janela = [P(0.44, 0.185), P(0.50, 0.212), P(0.58, 0.218), P(0.66, 0.205), P(0.76, 0.175)]
d.polygon(janela, fill=(18, 18, 22))
d.line([P(0.615, 0.215), P(0.63, 0.178)], fill=(90, 10, 14), width=10 * S)

# caixas de roda e rodas
for u in (0.19, 0.80):
    wx, wy = P(u, 0.0)
    r = 0.072 * L
    d.ellipse([wx - r * 1.12, wy - r * 2.12, wx + r * 1.12, wy + 0.12 * r], fill=(8, 0, 0))
    d.ellipse([wx - r, wy - 2 * r, wx + r, wy], fill=(14, 14, 16))
    d.ellipse([wx - r * 0.68, wy - r * 1.68, wx + r * 0.68, wy - r * 0.32], fill=(70, 70, 76))
    d.ellipse([wx - r * 0.55, wy - r * 1.55, wx + r * 0.55, wy - r * 0.45], fill=(25, 25, 28))
    for a in np.linspace(0, 2 * np.pi, 10, endpoint=False):
        d.line([(wx, wy - r), (wx + np.cos(a) * r * 0.62, wy - r + np.sin(a) * r * 0.62)],
               fill=(150, 150, 158), width=7 * S)
    d.ellipse([wx - r * 0.14, wy - r * 1.14, wx + r * 0.14, wy - r * 0.86], fill=(200, 20, 30))

# lanterna traseira e farol com brilho
luz = Image.new('RGB', (W, H), (0, 0, 0))
dl = ImageDraw.Draw(luz)
dl.polygon([P(0.950, 0.138), P(1.000, 0.135), P(1.000, 0.118), P(0.945, 0.124)], fill=(255, 40, 40))
dl.polygon([P(0.015, 0.095), P(0.085, 0.110), P(0.082, 0.097), P(0.020, 0.085)], fill=(255, 245, 225))
brilho = luz.filter(ImageFilter.GaussianBlur(40 * S))
img = Image.fromarray(np.clip(np.asarray(img, np.float32) + np.asarray(luz, np.float32)
                              + 2.2 * np.asarray(brilho, np.float32), 0, 255).astype(np.uint8))

# reflexo no chao molhado
arr = np.asarray(img, np.float32)
by = int(base)
alt = H - by
ref = arr[by - alt:by][::-1].copy()
ref[:, :, :] *= np.linspace(0.45, 0.0, alt)[:, None, None]
ref = np.asarray(Image.fromarray(ref.astype(np.uint8)).filter(ImageFilter.GaussianBlur(6 * S)), np.float32)
# listras horizontais de asfalto molhado
listras = (np.sin(np.arange(alt) * 0.9) * 0.5 + 0.5)[:, None, None] * 0.35 + 0.65
arr[by:] = np.clip(arr[by:] * 0.3 + ref * listras, 0, 255)
img = Image.fromarray(arr.astype(np.uint8))

img.resize((W // S, H // S), Image.LANCZOS).save(saida)
print(saida)
