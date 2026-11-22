# Gera a narração (ElevenLabs, voz Rodrigo Custódio). Uso: python3 narracao.py <pasta-de-saida>
# A chave fica no ambiente/proxy; nunca no código.
import json, os, subprocess, sys, urllib.request
VOZ = '2xzOKgdTB2i5ia63CcIn'
FALAS = {
 'a': 'Seu freezer ou geladeira deu problema? Chama a Companhia do Frio!',
 'b': 'Adaptação de LED: o freezer fica iluminado e o produto aparece muito mais.',
 'c': 'Limpeza do condensador: tira toda a sujeira, e o equipamento volta a gelar como novo.',
 'd': 'Recuperação de gás, com equipamento certo e medição na hora.',
 'e': 'Troca de compressor: sai o velho, entra o novo, e o frio volta.',
 'f': 'Companhia do Frio. Refrigeração e assistência técnica especializada.',
}
if __name__ == '__main__':
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    for k in sys.argv[2:] or list(FALAS):
        body = json.dumps({'text': FALAS[k], 'model_id': 'eleven_multilingual_v2',
            'voice_settings': {'stability': 0.45, 'similarity_boost': 0.8, 'style': 0.35, 'speed': 1.12}}).encode()
        req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{VOZ}?output_format=mp3_44100_128',
            data=body, headers={'Content-Type': 'application/json', 'xi-api-key': os.environ.get('ELEVENLABS_API_KEY', 'proxy')})
        open(f'{out}/{k}.mp3', 'wb').write(urllib.request.urlopen(req).read())
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'{out}/{k}.mp3', '-ar', '44100', '-ac', '1', f'{out}/{k}.wav'], check=True)
        d = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f'{out}/{k}.wav'], capture_output=True, text=True).stdout.strip()
        print(k, d)
