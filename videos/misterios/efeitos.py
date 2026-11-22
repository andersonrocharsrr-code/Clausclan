# Efeitos sonoros (ElevenLabs sound-generation). Uso: python3 efeitos.py <pasta>/sfx
import json, os, subprocess, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
SFX = {
 'espaco': ('Deep space ambience, soft low cosmic drone, vast and calm', 8),
 'whoosh': ('Soft deep cinematic whoosh transition', 1.5),
 'impacto': ('Deep cinematic boom hit with long reverb, epic space', 2.5),
 'brilho': ('Bright magical shimmer sweep, sparkling stars', 2),
 'buraco': ('Black hole deep ominous rumble with swirling wind, sub bass', 6),
 'galaxia': ('Ethereal cosmic choir pad with shimmering sparkles', 6),
 'luz': ('Fast light beam whoosh with a bright tone', 2),
 'telescopio': ('Space telescope mechanism unfolding, motors and clicks in vacuum, soft', 4),
 'pulso': ('Low cosmic pulse heartbeat, deep and slow', 5),
 'supernova': ('Massive star explosion, huge cinematic supernova blast with deep rumble and long tail', 5),
 'pulsar': ('Radio telescope recording of a pulsar, fast regular rhythmic ticking pulses with static', 6),
 'radio': ('Old 1960s chart recorder and radio static with faint regular beeps, vintage lab', 5),
 'quasar': ('Powerful cosmic jet roaring, deep energy beam hum with crackle, cinematic', 6),
 'nebulosa': ('Soft ethereal space nebula ambience, airy wind and gentle shimmering tones', 7),
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
