# Efeitos sonoros (ElevenLabs, geração de som). Uso: python3 sfx.py <pasta> [nomes...]
import json, os, subprocess, sys, urllib.request
SONS = {
    'noite': ('Amazon rainforest at night, crickets, tree frogs, distant owl, soft wind in leaves, calm ambience, no music', 22),
    'dia': ('Amazon rainforest daytime ambience, many tropical birds singing, insects buzzing, gentle leaves, no music', 22),
    'seringal': ('rural village morning in the Amazon, roosters far away, birds, wooden house creaking, people distant, calm', 20),
    'tarde': ('tropical forest at sunset, cicadas loud, birds settling, warm calm ambience', 20),
    'vento': ('strong gust of wind swirling leaves in a forest, rising whoosh, eerie', 8),
    'trovao': ('single loud thunder crack close, lightning strike, rumble fading', 6),
    'chuva': ('heavy tropical rain on forest leaves, steady downpour', 20),
    'passos': ('footsteps walking on dry leaves and twigs on a forest trail, rubber boots, slow steady pace', 12),
    'correria': ('stampede of wild animals running through jungle undergrowth, hooves, branches breaking, leaves crashing', 12),
    'queixadas': ('herd of wild peccaries running and grunting, teeth clacking, rustling brush', 10),
    'araras': ('flock of macaws flying overhead, loud squawking calls, wings flapping', 10),
    'macaco': ('capuchin monkey screeching and jumping between branches, leaves shaking', 6),
    'onca': ('jaguar running fast through jungle, heavy paws on ground, a short low growl', 6),
    'anta': ('large heavy animal crashing through dense jungle brush, branches snapping, heavy thuds', 6),
    'passaros': ('many birds suddenly taking flight in alarm, wings flapping, alarm calls', 6),
    'respiracao': ('man breathing heavily and nervously, close up, quiet forest silence', 10),
    'pesados': ('slow heavy ominous footsteps in a dark forest, deep thuds on soft ground, eerie silence', 12),
    'drone': ('dark supernatural low drone, ominous deep hum, horror atmosphere, no melody', 20),
    'arara1': ('single macaw scream far away echoing in the forest at night', 4),
    'rumor': ('distant low rumble echoing through a forest, something big moving far away', 6),
    'cartuchos': ('shotgun shells dropping into a leather bag, small clinks', 4),
}
if __name__ == '__main__':
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    for k in (sys.argv[2:] or list(SONS)):
        txt, d = SONS[k]
        req = urllib.request.Request('https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128', data=json.dumps({'text': txt, 'duration_seconds': d, 'prompt_influence': 0.45}).encode(),
                                     headers={'Content-Type': 'application/json', 'xi-api-key': os.environ.get('ELEVENLABS_API_KEY', 'proxy')})
        open(f'{out}/{k}.mp3', 'wb').write(urllib.request.urlopen(req).read())
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'{out}/{k}.mp3', '-ar', '44100', '-ac', '2', f'{out}/{k}.wav'], check=True)
        print(k, 'ok')
