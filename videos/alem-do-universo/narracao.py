# Narração (ElevenLabs, voz Rodrigo Custódio). Uso: python3 narracao.py <pasta-de-saida> [falas...]
import json, os, subprocess, sys, urllib.request
VOZ = '2xzOKgdTB2i5ia63CcIn'  # Rodrigo Custódio
VEL = 1.2
FALAS = {
 'terra': 'Você está aqui. Num planeta azul, com oito bilhões de pessoas, girando a mil seiscentos e setenta quilômetros por hora... e você nem sente.',
 'espaco': 'Subindo só cem quilômetros, o céu azul acaba. Começa o espaço: escuro, silencioso, gelado. A Lua fica a trezentos e oitenta e quatro mil quilômetros.',
 'sistema': 'Mais longe, a Terra vira um pontinho. Oito planetas, centenas de luas e milhões de asteroides, girando em volta de uma estrela comum: o Sol, com quatro bilhões e seiscentos milhões de anos.',
 'via': 'E o Sol é só uma entre quatrocentos bilhões de estrelas da Via Láctea. Ao redor delas, mais de cem bilhões de planetas. A luz leva cem mil anos para atravessar a nossa galáxia.',
 'andromeda': 'Ali está Andrômeda, a dois milhões e meio de anos-luz, com um trilhão de estrelas e, talvez, trilhões de planetas. E ela está vindo na nossa direção.',
 'galaxias': 'Depois dela, mais galáxias. Talvez dois trilhões, presas numa teia gigante de matéria escura. Juntas, somam setenta sextilhões de estrelas: mais que todos os grãos de areia da Terra.',
 'universo': 'Tudo isso cabe no universo que a gente consegue ver: noventa e três bilhões de anos-luz, com treze bilhões e oitocentos milhões de anos de idade.',
 'alem': 'E depois? Onde o universo termina? Será que existe um limite... ou outros universos, como bolhas, cada um com suas próprias leis? Ninguém sabe. Mas tudo isso começa aqui, num pontinho azul. Então me diz: onde a gente está, de verdade?',
}
if __name__ == '__main__':
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    for k in (sys.argv[2:] or list(FALAS)):
        body = json.dumps({'text': FALAS[k], 'model_id': 'eleven_multilingual_v2',
            'voice_settings': {'stability': 0.55, 'similarity_boost': 0.8, 'style': 0.15, 'speed': VEL}}).encode()
        req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{VOZ}?output_format=mp3_44100_128',
            data=body, headers={'Content-Type': 'application/json', 'xi-api-key': os.environ.get('ELEVENLABS_API_KEY', 'proxy')})
        open(f'{out}/{k}.mp3', 'wb').write(urllib.request.urlopen(req).read())
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'{out}/{k}.mp3', '-ar', '44100', '-ac', '1', f'{out}/{k}.wav'], check=True)
        d = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f'{out}/{k}.wav'], capture_output=True, text=True).stdout.strip()
        print(k, d, flush=True)
