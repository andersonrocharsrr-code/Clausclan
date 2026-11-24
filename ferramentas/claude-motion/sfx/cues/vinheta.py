"""Som da vinheta "Mistérios do Universo" (versão Remotion). Todo tempo vem de src/vinheta/timeline.json.

    python3 -m sfx sfx/cues/vinheta.py
"""
from sfx.synth import blip, chime, envelope, impact, pad, pop, riser, whoosh

TIMELINE = "src/vinheta/timeline.json"
OUT = "public/vinheta.wav"
TARGET_LUFS = -14.0

# Lá menor: Am(add9) misterioso → Fmaj7 no drop → Am quando o título assenta.
AM9 = [110.0, 164.81, 220.0, 261.63, 329.63, 493.88]
FMAJ7 = [87.31, 174.61, 220.0, 261.63, 329.63]
AM = [110.0, 220.0, 261.63, 329.63, 440.0, 659.25]
PALAVRAS = [440.0, 523.25, 659.25]


def score(mix, tl):
    s1, s2, s3, s4 = tl["s1"], tl["s2"], tl["s3"], tl["s4"]
    dur, drop = tl["duration"], s2["drop"]
    put = mix.put
    vol = envelope([(0, 0.6), (s1["warp"], 1), (drop - 0.05, 1.1), (drop + 0.05, 0.35), (drop + 0.9, 1), (s4["fim"], 1), (dur, 0)])
    mix.put_stereo(0, *pad(dur, [(0, AM9), (drop, FMAJ7), (s2["palavras"][2], AM)], volume=vol), gain=0.05)
    for p in s1["pulso"]:
        put(p, blip(329.63, dur=0.5, tau=0.18), 0.1)
    put(s1["ponto"], riser(drop - s1["ponto"], 180, 4200), 0.2)
    put(s1["warp"], whoosh(1.2, 300, 3800, peak=0.35), 0.28)
    put(drop, impact(1.6), 0.34)
    put(drop, chime([220.0, 329.63, 440.0, 659.25], dur=2.4, tau=0.9), 0.12)
    for i, w in enumerate(s2["palavras"]):
        put(w, whoosh(0.32, 500, 2600, peak=0.5), 0.11, pan=-0.3 + i * 0.3)
        put(w + 0.12, blip(PALAVRAS[i], dur=0.35, tau=0.1), 0.16)
    put(s3["anel"], whoosh(0.9, 900, 300, peak=0.4), 0.1, pan=-0.5)
    put(s3["planeta"], pop(523.25, 880.0), 0.2, pan=0.4)
    put(s3["selo"], chime([659.25, 880.0, 1318.5], dur=1.6, tau=0.6), 0.16)
