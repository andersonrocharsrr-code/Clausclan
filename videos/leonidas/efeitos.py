# Efeitos sonoros (ElevenLabs sound-generation). Uso: python3 efeitos.py <pasta>/sfx
import json, os, subprocess, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
SFX = {
 'vento': ('Strong wind blowing through a rocky mountain pass, steady', 8),
 'marcha': ('Large army of soldiers marching in step on dirt, armor clinking, rhythmic', 8),
 'tambores': ('Ancient war drums beating slowly, epic and deep', 8),
 'batalha': ('Ancient battle: clashing bronze shields and spears, men shouting, chaotic', 8),
 'flechas': ('Thousands of arrows whistling through the air and hitting shields', 5),
 'escudo': ('Heavy bronze shield hit by a spear, metallic clang', 1.5),
 'impacto': ('Deep cinematic boom hit with short reverb tail', 2.5),
 'whoosh': ('Fast clean cinematic whoosh transition', 1.5),
 'mar': ('Calm sea waves on a rocky shore', 8),
 'fogo': ('Crackling bonfire at night', 6),
 'remos': ('Ancient ship oars rowing in water, wooden creaking, waves', 6),
 'corneta': ('Ancient war horn blowing a long low note', 4),
 'pedra': ('Chisel carving stone, hammer taps', 4),
 'criancas': ('Boys training outdoors, shouting and wooden sticks clashing', 6),
 'corte': ('Royal palace hall ambience with distant murmur and a gong', 6),
 'noite': ('Night in the mountains, crickets and soft wind', 8),
 'grito': ('Group of ancient soldiers giving a short battle cry together', 3),
 'multidao': ('Crowd celebrating a festival at night with ancient lyre and singing', 6),
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
