# Narração (ElevenLabs, voz Rodrigo Custódio). Uso: python3 narracao.py <pasta-de-saida> [falas...]
import json, os, subprocess, sys, urllib.request
VOZ = '2xzOKgdTB2i5ia63CcIn'  # Rodrigo Custódio
VEL = 1.17
FALAS = {
 'intro': 'Este é o nosso endereço no universo: o Sistema Solar. Uma estrela e oito planetas. Vamos visitar cada um de perto, e descobrir quantos anos têm, e do que é feito o ar de cada mundo.',
 'sol': 'Tudo começa no Sol, que nasceu há cerca de quatro vírgula seis bilhões de anos, de uma nuvem de gás e poeira. Ele é feito de hidrogênio, setenta e três por cento, e hélio, vinte e cinco por cento. No núcleo, a quinze milhões de graus, o hidrogênio vira hélio, e essa energia ilumina todos os planetas.',
 'mercurio': 'Mercúrio é o menor planeta e o mais próximo do Sol. Tem cerca de quatro vírgula cinco bilhões de anos, como quase todos os planetas. Ele quase não tem atmosfera: só uma camada finíssima, a exosfera, com oxigênio, sódio, hidrogênio e hélio. De dia passa de quatrocentos graus, e à noite cai a cento e setenta negativos.',
 'venus': 'Vênus tem quase o tamanho da Terra, mas é um inferno. Também com cerca de quatro vírgula cinco bilhões de anos, vive coberto por nuvens de ácido sulfúrico. Sua atmosfera é noventa e seis e meio por cento gás carbônico, e três e meio por cento nitrogênio. Esse gás prende o calor: a superfície chega a quatrocentos e sessenta graus.',
 'terra': 'E aqui está a nossa casa. A Terra tem quatro vírgula cinquenta e quatro bilhões de anos, e é o único planeta conhecido com vida. Seu ar tem setenta e oito por cento de nitrogênio, vinte e um por cento de oxigênio, quase um por cento de argônio, e um pouquinho de gás carbônico.',
 'marte': 'Marte, o planeta vermelho, tem cerca de quatro vírgula seis bilhões de anos. A cor vem da ferrugem que cobre o solo. Sua atmosfera é cem vezes mais fina que a nossa: noventa e cinco por cento gás carbônico, com um pouco de nitrogênio e argônio. Lá fica o Monte Olimpo, o maior vulcão do Sistema Solar.',
 'jupiter': 'Júpiter é o gigante: cabem mais de mil Terras dentro dele. Com cerca de quatro vírgula seis bilhões de anos, foi o primeiro planeta a se formar. Não tem chão: é uma bola de gás, com noventa por cento de hidrogênio e dez por cento de hélio. Sua Grande Mancha Vermelha é uma tempestade maior que a Terra.',
 'saturno': 'Saturno, o senhor dos anéis, tem cerca de quatro vírgula cinco bilhões de anos. Seus anéis são bilhões de pedaços de gelo e rocha. A atmosfera tem noventa e seis por cento de hidrogênio e três por cento de hélio. Ele é tão leve que boiaria numa banheira gigante.',
 'urano': 'Urano, o gigante de gelo, também tem cerca de quatro vírgula cinco bilhões de anos, e gira deitado, como se tivesse levado uma pancada no passado. Sua atmosfera tem oitenta e três por cento de hidrogênio, quinze por cento de hélio, e dois por cento de metano, que dá essa cor azul esverdeada.',
 'netuno': 'Netuno, o último planeta, fica a quatro bilhões e meio de quilômetros do Sol, e tem a mesma idade dos outros. Sua atmosfera é oitenta por cento hidrogênio, dezenove por cento hélio, e um pouco de metano, que o deixa azul. Lá sopram os ventos mais fortes do Sistema Solar: mais de dois mil quilômetros por hora.',
 'final': 'Oito planetas, uma estrela, todos nascidos da mesma nuvem, há quatro bilhões e meio de anos. E de todos esses mundos, só um, até onde sabemos, tem alguém olhando para o céu e se perguntando de onde viemos.',
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
