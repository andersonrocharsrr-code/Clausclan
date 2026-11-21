# Efeitos sonoros (ElevenLabs sound-generation). Uso: python3 efeitos.py <pasta>/sfx
import json, os, subprocess, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
SFX = {
 'espaco': ('Deep space ambience, soft low cosmic drone, calm and vast', 8),
 'sinal': ('Old spacecraft telemetry radio beeps and soft static, distant', 6),
 'foguete': ('Huge rocket launch: massive roaring engines, rumble and crackle building up', 8),
 'contagem': ('Mission control countdown chatter, radio voice beeps, 1970s', 5),
 'whoosh': ('Soft deep cinematic whoosh transition', 1.5),
 'impacto': ('Deep cinematic boom hit with long reverb, epic space', 2.5),
 'plasma': ('Eerie space plasma wave sounds recorded by a probe, whistling tones', 6),
 'vinil': ('Vinyl record crackle with a faint old orchestral melody', 6),
 'vento': ('Gentle wind blowing through trees', 5),
 'chuva': ('Soft rain falling', 5),
 'carro': ('Car driving on a highway passing by', 5),
 'aviao': ('Jet airplane cruising engine sound from inside the cabin', 6),
 'geladeira': ('Refrigerator door opening and soft electric hum', 4),
 'antena': ('Large radio telescope dish motors turning, mechanical servo hum', 5),
 'relogio': ('Clock ticking steadily', 6),
 'luz': ('Bright magical shimmer sweep, sparkling', 2),
 'desliga': ('Electronic device powering down with a descending beep', 3),
 'grav': ('Spacecraft flyby whoosh with deep gravitational rumble', 4),
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
