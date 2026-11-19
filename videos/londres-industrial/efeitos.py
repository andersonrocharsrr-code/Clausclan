# Efeitos sonoros (ElevenLabs sound-generation). Uso: python3 efeitos.py <pasta>/sfx
import json, os, subprocess, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
SFX = {
 'cidade': ('Victorian London street ambience: horse hooves on cobblestones, carriage wheels, distant crowd chatter', 8),
 'cascos': ('Horses walking on cobblestones pulling a heavy carriage, wooden wheels creaking', 8),
 'vapor': ('Old steam engine working: piston rhythm, hissing steam, metal clanking', 8),
 'fabrica': ('Victorian factory interior: looms clattering, belts and gears, loud machinery', 8),
 'docas': ('Busy 19th century docks: ship ropes creaking, seagulls, men shouting, crates', 8),
 'rio': ('Calm river water lapping against stone walls, distant boat horn', 8),
 'chuva': ('Light rain on a city street at night with distant thunder', 8),
 'fogo': ('Coal fire crackling in a small fireplace', 6),
 'trem': ('Old steam train passing: chugging, whistle, wheels on rails', 8),
 'tunel': ('Steam train echoing inside a brick tunnel', 6),
 'apito': ('Old steam locomotive whistle blowing', 3),
 'sino': ('Large church bell tolling once in a foggy city', 5),
 'relogio': ('Big old clock ticking loudly', 6),
 'multidao': ('Crowd of workers cheering and chanting at a rally', 6),
 'jornaleiro': ('Victorian street with a boy shouting newspaper, crowd walking', 5),
 'carvao': ('Shoveling coal and coal cart wheels in a mine, dripping water', 6),
 'vento': ('Cold wind over rooftops and chimneys', 8),
 'whoosh': ('Soft deep cinematic whoosh transition', 1.5),
 'impacto': ('Deep dark cinematic boom hit with reverb', 2.5),
 'bomba': ('Old iron hand water pump creaking and water splashing', 4),
 'canetas': ('Quill pen scratching on paper', 3),
 'pombos': ('Pigeons cooing and flapping wings', 5),
 'latido': ('Dog barking in a city street', 3),
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
