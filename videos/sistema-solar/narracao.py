# Narração (ElevenLabs, voz Rodrigo Custódio). Uso: python3 narracao.py <pasta-de-saida> [falas...]
import json, os, subprocess, sys, urllib.request
VOZ = '2xzOKgdTB2i5ia63CcIn'  # Rodrigo Custódio
VEL = 1.17
FALAS = {
 'intro': 'Este é o nosso endereço no universo: o Sistema Solar. Uma estrela e oito planetas. Vamos visitar cada um de perto, e descobrir quantos anos têm, e do que é feito o ar de cada mundo.',
 'sol': 'Tudo começa no Sol, que nasceu há quatro vírgula seis bilhões de anos. Ele gira em si mesmo em vinte e cinco dias, e leva duzentos e trinta milhões de anos para dar uma volta na nossa galáxia, a oitocentos e vinte e oito mil quilômetros por hora. É feito de hidrogênio, setenta e três por cento, e hélio, vinte e cinco por cento.',
 'mercurio': 'Mercúrio, o menor planeta e o mais próximo do Sol, tem quatro vírgula cinco bilhões de anos. Ele leva mil quatrocentas e oito horas para girar em si mesmo, mas só oitenta e oito dias para dar a volta no Sol, voando a cento e setenta mil quilômetros por hora. Quase não tem atmosfera: só traços de oxigênio, sódio, hidrogênio e hélio.',
 'venus': 'Vênus tem quatro vírgula cinco bilhões de anos, e gira tão devagar que leva duzentos e quarenta e três dias para dar uma volta em si mesmo: mais que o seu ano, de duzentos e vinte e cinco dias. Ele viaja a cento e vinte e seis mil quilômetros por hora. Sua atmosfera é noventa e seis e meio por cento gás carbônico, e três e meio por cento nitrogênio.',
 'terra': 'E aqui está a nossa casa, com quatro vírgula cinquenta e quatro bilhões de anos. O dia tem vinte e quatro horas, o ano trezentos e sessenta e cinco dias, e viajamos ao redor do Sol a cento e sete mil quilômetros por hora. Nosso ar tem setenta e oito por cento de nitrogênio, vinte e um por cento de oxigênio, quase um por cento de argônio, e um pouquinho de gás carbônico.',
 'marte': 'Marte, o planeta vermelho, tem quatro vírgula seis bilhões de anos. Seu dia dura vinte e quatro horas e trinta e sete minutos, quase como o nosso, mas o ano leva seiscentos e oitenta e sete dias, a oitenta e sete mil quilômetros por hora. Sua atmosfera, cem vezes mais fina que a nossa, é noventa e cinco por cento gás carbônico, com um pouco de nitrogênio e argônio.',
 'jupiter': 'Júpiter, o gigante, tem quatro vírgula seis bilhões de anos. É o planeta que gira mais rápido: um dia lá dura só dez horas. Já uma volta no Sol leva quase doze anos, a quarenta e sete mil quilômetros por hora. Ele não tem chão: é uma bola de gás, com noventa por cento de hidrogênio e dez por cento de hélio.',
 'saturno': 'Saturno, o senhor dos anéis, tem quatro vírgula cinco bilhões de anos. O dia dura dez horas e meia, e o ano, vinte e nove anos e meio, viajando a trinta e cinco mil quilômetros por hora. Sua atmosfera tem noventa e seis por cento de hidrogênio e três por cento de hélio, e ele é tão leve que boiaria na água.',
 'urano': 'Urano, o gigante de gelo, tem quatro vírgula cinco bilhões de anos, e gira deitado. Seu dia dura dezessete horas, e o ano, oitenta e quatro anos, a vinte e quatro mil quilômetros por hora. A atmosfera tem oitenta e três por cento de hidrogênio, quinze por cento de hélio, e dois por cento de metano, que dá essa cor azul esverdeada.',
 'netuno': 'Netuno, o último planeta, também tem quatro vírgula cinco bilhões de anos. O dia dura dezesseis horas, mas uma volta no Sol leva cento e sessenta e cinco anos, a vinte mil quilômetros por hora. Sua atmosfera é oitenta por cento hidrogênio, dezenove por cento hélio, e um pouco de metano. E lá sopram os ventos mais fortes do Sistema Solar.',
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
