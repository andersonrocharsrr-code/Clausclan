# Efeitos sonoros (ElevenLabs sound-generation). Uso: python3 efeitos.py <pasta>/sfx
import json, os, subprocess, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
SFX = {
 'espaco': ('Deep space ambience, soft low cosmic drone, vast and calm', 8),
 'noite': ('Quiet night in the countryside, crickets and gentle wind', 8),
 'whoosh': ('Soft deep cinematic whoosh transition', 1.5),
 'impacto': ('Deep cinematic boom hit with long reverb, epic space', 2.5),
 'brilho': ('Bright magical shimmer sweep, sparkling stars', 2),
 'sol': ('Deep rumbling roar of the sun, plasma and fire, cinematic', 6),
 'buraco': ('Black hole deep ominous rumble with swirling wind, sub bass', 6),
 'galaxia': ('Ethereal cosmic choir pad with shimmering sparkles', 6),
 'colisao': ('Slow massive cosmic collision rumble, deep and long', 6),
 'telescopio': ('Space telescope mechanism unfolding, motors and clicks in vacuum, soft', 4),
 'mar': ('Gentle sea waves on a beach at night', 6),
 'luz': ('Fast light beam whoosh with a bright tone', 2),
 'pulso': ('Low cosmic pulse heartbeat, deep and slow', 5),
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
