# Narração (ElevenLabs, voz Jonas). Uso: python3 narracao.py <pasta-de-saida>
import json, os, subprocess, sys, urllib.request
VOZ = 'wTABSOIKENuRDeLiHYDF'  # Jonas - Dynamic, Lively, Friendly (pt-BR), mais lento e firme
FALAS = {
 'a': 'Transilvânia, nas montanhas da Romênia. No alto de um castelo coberto de neve, vive o conde Drácula.',
 'b': 'Criado pelo escritor Bram Stoker em 1897, ele dorme de dia num caixão e, à noite, sai em forma de morcego, atrás de sangue.',
 'c': 'A inspiração veio de um príncipe de verdade: Vlad, o Empalador. Mais de cem anos depois, Drácula ainda é o vampiro mais famoso do mundo.',
}
if __name__ == '__main__':
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    for k in (sys.argv[2:] or list(FALAS)):
        body = json.dumps({'text': FALAS[k], 'model_id': 'eleven_multilingual_v2',
            'voice_settings': {'stability': 0.7, 'similarity_boost': 0.8, 'style': 0.05, 'speed': 0.9}}).encode()
        req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{VOZ}?output_format=mp3_44100_128',
            data=body, headers={'Content-Type': 'application/json', 'xi-api-key': os.environ.get('ELEVENLABS_API_KEY', 'proxy')})
        open(f'{out}/{k}.mp3', 'wb').write(urllib.request.urlopen(req).read())
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'{out}/{k}.mp3', '-ar', '44100', '-ac', '1', f'{out}/{k}.wav'], check=True)
        d = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f'{out}/{k}.wav'], capture_output=True, text=True).stdout.strip()
        print(k, d)
