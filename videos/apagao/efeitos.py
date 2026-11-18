# Efeitos sonoros (ElevenLabs sound-generation). Uso: python3 efeitos.py <pasta>/sfx
import json, os, subprocess, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
SFX = {
 'zumbido': ('Electrical transformer hum and buzzing power lines at night, steady', 8),
 'desliga': ('Huge city power outage: electrical spark, deep power down whine fading out, lights turning off with clunks', 5),
 'liga': ('Power coming back on: electrical hum rising, fluorescent lights flickering on with clicks', 4),
 'whoosh': ('Fast clean cinematic whoosh transition', 1.5),
 'glitch': ('Short digital glitch, data corruption stutter and static burst', 1.5),
 'notif': ('Several smartphone notification pings in quick succession', 4),
 'carimbo': ('Heavy rubber stamp slamming on paper with a deep cinematic impact', 1.5),
 'chuva': ('Heavy rain storm with distant thunder rolling', 8),
 'alerta': ('Generic electronic two-tone warning beep alarm from a phone, three times', 4),
 'teclado': ('Fast typing on a keyboard', 3),
 'vibra': ('Smartphone vibrating on a wooden table', 3),
 'cidade': ('Calm city night ambience, distant traffic, soft wind', 8),
 'tv': ('Old CRT television turning on with static noise and a high pitched whine', 3),
 'impacto': ('Deep cinematic boom hit with short reverb tail', 2.5),
 'lapis': ('Pencil writing quickly on paper', 3),
 'radar': ('Radio tower transmission: electronic pulses and sonar like radio beeps', 5),
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
