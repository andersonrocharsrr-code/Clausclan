# Efeitos sonoros (ElevenLabs sound-generation). Uso: python3 efeitos.py <pasta>/sfx
import json, os, subprocess, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
SFX = {
 'vazio': ('Vast empty deep space drone, very low, dark and majestic, slow evolving', 8),
 'whoosh': ('Soft airy cinematic whoosh transition', 1.5),
 'impacto': ('Huge deep cinematic boom with long dark reverb', 3),
 'brilho': ('Crystal shimmer sparkle sweep, magical', 2),
 'sol': ('Low roaring plasma of a star, rumble and crackle', 6),
 'luz': ('Bright fast light beam swoosh with a high tone', 2),
 'gelo': ('Freezing icy wind, crystals cracking, cold eerie', 6),
 'explosao': ('Gigantic star explosion, powerful blast and debris, long tail', 5),
 'buraco': ('Ominous black hole sub bass rumble with distorted swirling wind', 6),
 'colisao': ('Two galaxies colliding, slow massive rumble, cosmic', 4),
 'asteroide': ('Asteroid entering atmosphere with burning roar then massive impact explosion', 4),
 'relogio': ('Slow deep clock ticking, cinematic, echo', 5),
 'bigbang': ('The birth of the universe, rising whoosh into enormous explosion with shimmering aftermath', 5),
 'estatica': ('Old radio static noise with faint hiss, cosmic microwave background', 5),
 'misterio': ('Mysterious dark tension drone with distant whispers, conspiracy', 6),
 'digital': ('Digital glitch and computer data stream, sci-fi', 4),
 'bolhas': ('Ethereal floating bubbles, soft magical pops, dreamy', 5),
 'coro': ('Soft heavenly choir aah with warm light, divine and peaceful', 7),
 'giz': ('Chalk writing on a blackboard, a few strokes', 3),
}
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
def gera(k):
    txt, d = SFX[k]
    if os.path.exists(f'{out}/{k}.wav'): return k
    body = json.dumps({'text': txt, 'duration_seconds': d, 'prompt_influence': .5}).encode()
    req = urllib.request.Request('https://api.elevenlabs.io/v1/sound-generation', data=body, headers={'Content-Type': 'application/json', 'xi-api-key': os.environ.get('ELEVENLABS_API_KEY', 'proxy')})
    open(f'{out}/{k}.mp3', 'wb').write(urllib.request.urlopen(req, timeout=180).read())
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'{out}/{k}.mp3', '-ar', '44100', '-ac', '2', f'{out}/{k}.wav'], check=True); return k
with ThreadPoolExecutor(4) as ex:
    for k in ex.map(gera, SFX): print(k, flush=True)
