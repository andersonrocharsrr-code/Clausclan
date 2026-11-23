# Narração (ElevenLabs, voz Rodrigo Custódio, ritmo de documentário). Uso: python3 narracao.py <pasta-de-saida> [falas...]
import json, os, subprocess, sys, urllib.request
VOZ = '2xzOKgdTB2i5ia63CcIn'  # Rodrigo Custódio
VEL = 1.15
FALAS = {
 'a': 'Olhe para o céu à noite. Cada ponto de luz é um sol. E existem mais estrelas no universo do que grãos de areia em todas as praias da Terra. O universo é grande demais para a nossa mente.',
 'b': 'A luz, a coisa mais rápida que existe, leva oito minutos para vir do Sol até aqui. Para cruzar a Via Láctea, leva cem mil anos. E a Via Láctea é só uma entre centenas de bilhões de galáxias.',
 'c': 'A parte que conseguimos ver, o universo observável, tem cerca de noventa e três bilhões de anos-luz de diâmetro. E o que existe além dessa fronteira? Ninguém sabe. Muitos cientistas acham que o universo pode ser infinito.',
 'd': 'Se for, ele não tem borda, nem centro. E, segundo alguns físicos, em algum lugar muito, muito distante, poderia existir até uma cópia exata de você, assistindo a este mesmo vídeo.',
 'e': 'E o cosmos é brutal. O espaço vazio está a duzentos e setenta graus abaixo de zero. Estrelas explodem e destroem tudo à sua volta. Buracos negros engolem o que chega perto, até a luz.',
 'f': 'Galáxias inteiras colidem. Um asteroide acabou com os dinossauros. E daqui a uns cinco bilhões de anos, o Sol vai inchar e pode engolir a Terra.',
 'g': 'Diante disso, o que somos nós? Se toda a história do universo coubesse em um ano, a humanidade só apareceria nos últimos minutos do dia trinta e um de dezembro. E a Terra, vista de longe, é só um pontinho azul.',
 'h': 'Mas como tudo isso começou? A ciência diz que, há treze vírgula oito bilhões de anos, todo o universo estava concentrado num estado minúsculo e quentíssimo. Então, ele começou a se expandir. Chamamos isso de Big Bang.',
 'i': 'Não foi uma explosão no espaço. Foi o próprio espaço nascendo e se esticando. Até hoje, as galáxias se afastam umas das outras. E o eco desse começo foi encontrado: uma radiação fraca que chega de todas as direções do céu.',
 'j': 'Só que nem todo mundo aceita essa história. Há quem diga que o Big Bang é uma invenção, e que a verdade está sendo escondida. Há quem acredite que vivemos numa simulação de computador, criada por alguém de fora.',
 'k': 'Outros falam num multiverso: o nosso universo seria só uma bolha entre infinitas outras. E há físicos que propõem que o universo nunca começou, e passa por ciclos eternos de nascimento e morte.',
 'l': 'Nenhuma dessas ideias foi provada. Mas elas mostram uma coisa: a pergunta sobre a nossa origem é tão grande, que a ciência ainda não tem todas as respostas.',
 'm': 'E aqui vem uma curiosidade: quem primeiro propôs a ideia que virou o Big Bang foi Georges Lemaître, um padre católico e físico belga. Para ele, ciência e fé não eram inimigas.',
 'n': 'A ciência explica como o universo funciona. Mas por que existe alguma coisa, em vez de nada? Para bilhões de pessoas, a resposta é Deus: um criador que deu o primeiro passo, e acendeu a primeira luz.',
 'o': 'Talvez nunca saibamos tudo. Mas, num universo tão imenso e tão brutal, nós somos a parte do cosmos que consegue olhar para cima, e perguntar de onde viemos.',
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
