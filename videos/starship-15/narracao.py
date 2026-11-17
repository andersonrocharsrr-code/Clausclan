# Gera a narração (ElevenLabs, voz Rodrigo Custódio). Uso: python3 narracao.py <pasta-de-saida>
# A chave fica no ambiente/proxy; nunca no código.
import json, os, subprocess, sys, urllib.request
VOZ = '2xzOKgdTB2i5ia63CcIn'
FALAS = {
 'a': 'Treze de novembro de 2026. No sul do Texas, o maior foguete já construído está pronto para o seu décimo quinto voo.',
 'b': 'A Starship tem cento e vinte e quatro metros de altura, mais que um prédio de quarenta andares, e nove metros de largura. São duas partes: o propulsor Super Heavy, com setenta e dois metros, e a nave, com cinquenta e dois. Abastecida, pesa cerca de cinco mil e trezentas toneladas.',
 'c': 'Na base, trinta e três motores Raptor três queimam metano e oxigênio líquidos. Juntos, empurram com mais de nove mil toneladas de força. A nave leva outros seis motores para chegar à órbita.',
 'd': 'A missão: levar vinte e seis satélites Starlink a duzentos e setenta e cinco quilômetros de altura, dar catorze voltas na Terra e, pela primeira vez, trazer a nave de volta para a torre de lançamento.',
 'e': 'Ninguém pilota. Os computadores de bordo guiam tudo. A nave reentra de barriga, freando no ar. Perto do chão, liga os motores, vira de pé e desce devagar, até ser agarrada pelos braços da torre.',
 'f': 'Depois de vinte e duas horas e meia no espaço, a nave quarenta e dois pousou nos braços da torre. O propulsor se perdeu no mar. Mas, pela primeira vez, uma nave voltou da órbita para casa.',
}
if __name__ == '__main__':
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    so = sys.argv[2:] or list(FALAS)
    for k in so:
        body = json.dumps({'text': FALAS[k], 'model_id': 'eleven_multilingual_v2',
            'voice_settings': {'stability': 0.5, 'similarity_boost': 0.8, 'style': 0.15, 'speed': 1.08}}).encode()
        req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{VOZ}?output_format=mp3_44100_128',
            data=body, headers={'Content-Type': 'application/json', 'xi-api-key': os.environ.get('ELEVENLABS_API_KEY', 'proxy')})
        open(f'{out}/{k}.mp3', 'wb').write(urllib.request.urlopen(req).read())
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'{out}/{k}.mp3', '-ar', '44100', '-ac', '1', f'{out}/{k}.wav'], check=True)
        d = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f'{out}/{k}.wav'], capture_output=True, text=True).stdout.strip()
        print(k, d)
