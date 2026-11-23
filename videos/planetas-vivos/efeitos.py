# Efeitos sonoros (ElevenLabs sound-generation). Uso: python3 efeitos.py <pasta>/sfx
import json, os, subprocess, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
SFX = {
 'vazio': ('Calm deep space ambience, soft warm drone, hopeful', 8),
 'whoosh': ('Soft airy cinematic whoosh transition', 1.5),
 'impacto': ('Deep cinematic boom with warm reverb', 3),
 'brilho': ('Crystal shimmer sparkle sweep, magical', 2),
 'noite': ('Quiet night outdoors, gentle breeze, very soft distant city', 8),
 'ventomarte': ('Thin dry alien wind blowing over a red desert, eerie and soft', 7),
 'floresta': ('Dense humid alien jungle ambience with strange birds and insects, soft rain', 8),
 'chuva': ('Heavy tropical rain on big leaves', 6),
 'voo': ('Large gentle creatures flapping wings slowly in the air, soft whooshes', 5),
 'relogio': ('Clock ticking, clean and rhythmic', 4),
 'pulo': ('Playful cartoon jump boing, light and springy', 1.5),
 'foguete': ('Rocket launch roar with deep rumble, rising', 6),
 'orbita': ('Ethereal sci-fi swoosh in space, smooth', 3),
 'sinal': ('Radio transmission beeps and soft static, space communication', 4),
 'nave': ('Alien spaceship hovering hum with soft warbling tones, landing', 6),
 'robo': ('Mechanical exoskeleton servo whirs and heavy footsteps', 4),
 'neve': ('Soft winter wind with gentle snowfall, cozy', 6),
 'festa': ('Happy crowd cheering at a stadium celebration, distant', 5),
 'discussao': ('Funny cartoon voices arguing in gibberish, playful, no words', 4),
 'calor': ('Hot humid air, cicadas buzzing loudly in heat', 5),
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
