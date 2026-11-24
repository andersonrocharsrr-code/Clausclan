"""Som da vinheta "Mistérios do Universo" (motor sfx do claude-motion). Todo tempo vem de timeline.json.

    cd ferramentas/claude-motion && python3 -m sfx ../../videos/vinheta/som.py
"""
import pathlib
from sfx.synth import blip, chime, envelope, impact, pad, pop, riser, whoosh

AQUI = pathlib.Path(__file__).resolve().parent
TIMELINE = str(AQUI / "timeline.json")
OUT = str(AQUI / "out/som.wav")
TARGET_LUFS = -14.0

# Lá menor: Am(add9) misterioso antes do drop, Fmaj7 → Am no título.
AM9 = [110.0, 164.81, 220.0, 261.63, 329.63, 493.88]
FMAJ7 = [87.31, 174.61, 220.0, 261.63, 329.63]
AM = [110.0, 220.0, 261.63, 329.63, 440.0, 659.25]
PALAVRAS = [440.0, 523.25, 659.25]


def score(mix, tl):
    s1, s2, s3, s4 = tl["s1"], tl["s2"], tl["s3"], tl["s4"]
    dur = tl["duration"]
    put = mix.put
    drop = s2["drop"]
    vol = envelope([(0, 0), (0.8, 0.8), (s1["warp"], 1), (drop - 0.05, 1.1), (drop + 0.05, 0.3), (drop + 0.9, 1), (s4["fim"], 1), (dur, 0)])
    mix.put_stereo(0, *pad(dur, [(0, AM9), (drop, FMAJ7), (s2["palavra3"], AM)], volume=vol), gain=0.05)
    # compasso 1: o ponto de luz pulsa
    put(s1["ponto"], blip(220.0, dur=0.6, tau=0.25), 0.12)
    for p in s1["pulso"]:
        put(p, blip(329.63, dur=0.5, tau=0.18), 0.1)
    # riser do começo até o drop, whoosh no warp
    put(s1["ponto"], riser(drop - s1["ponto"], 180, 4200), 0.22)
    put(s1["warp"], whoosh(1.2, 300, 3800, peak=0.35), 0.3)
    # drop: impacto + acorde
    put(drop, impact(1.6), 0.34)
    put(drop, chime([220.0, 329.63, 440.0, 659.25], dur=2.4, tau=0.9), 0.12)
    # palavras do título
    for i, k in enumerate(["palavra1", "palavra2", "palavra3"]):
        put(s2[k], whoosh(0.32, 500, 2600, peak=0.5), 0.12, pan=-0.3 + i * 0.3)
        put(s2[k] + 0.12, blip(PALAVRAS[i], dur=0.35, tau=0.1), 0.18)
    # anel, planeta e selo
    put(s3["anel"], whoosh(0.9, 900, 300, peak=0.4), 0.1, pan=-0.5)
    put(s3["planeta"], pop(523.25, 880.0), 0.2, pan=0.4)
    put(s3["selo"], chime([659.25, 880.0, 1318.5], dur=1.6, tau=0.6), 0.16)
