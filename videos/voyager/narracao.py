# Narração (ElevenLabs, voz Rodrigo Custódio, ritmo de documentário). Uso: python3 narracao.py <pasta-de-saida> [falas...]
import json, os, subprocess, sys, urllib.request
VOZ = '2xzOKgdTB2i5ia63CcIn'  # Rodrigo Custódio
VEL = 1.1
FALAS = {
 'a': 'Em dezoito de novembro de dois mil e vinte e seis, uma nave lançada em mil novecentos e setenta e sete chegou aonde nenhum objeto humano jamais esteve: a um dia-luz de distância da Terra. O nome dela é Voyager 1.',
 'b': 'Em mil novecentos e setenta e sete, a NASA lançou duas sondas gêmeas: a Voyager 2, em agosto, e a Voyager 1, em setembro, numa rota mais rápida. Cada uma pesava cerca de oitocentos quilos, com uma antena de quase quatro metros apontada para casa.',
 'c': 'Elas aproveitaram um alinhamento raro dos planetas, que só se repete a cada cento e setenta e cinco anos. A gravidade de cada planeta funcionava como um estilingue: dava impulso e mudava a direção da nave, quase sem gastar combustível.',
 'd': 'Em mil novecentos e setenta e nove, as duas passaram por Júpiter e descobriram vulcões ativos na lua Io. Depois veio Saturno, com seus anéis e a lua Titã. A Voyager 2 seguiu adiante, e é até hoje a única nave que visitou Urano e Netuno.',
 'e': 'A bordo, cada uma leva um disco de ouro, com sons e imagens da Terra: música, o barulho do vento e da chuva, e saudações em cinquenta e cinco línguas. Uma mensagem para quem, um dia, encontrar a nave.',
 'f': 'Em mil novecentos e noventa, a seis bilhões de quilômetros, a Voyager 1 virou a câmera para trás e fotografou a Terra: um pontinho azul-claro, menor que um pixel. A ideia foi do astrônomo Carl Sagan, e a foto ficou conhecida como o Pálido Ponto Azul.',
 'g': 'Em dois mil e doze, ela atravessou a heliopausa, a fronteira onde termina o vento do Sol, e entrou no espaço interestelar.',
 'h': 'Mas, afinal, o que é um dia-luz? A luz é a coisa mais rápida do universo: quase trezentos mil quilômetros por segundo. Em um único segundo, ela daria sete voltas e meia ao redor da Terra. Um dia-luz é a distância que a luz percorre em vinte e quatro horas: cerca de vinte e seis bilhões de quilômetros.',
 'i': 'Para comparar: a luz da Lua chega até nós em pouco mais de um segundo. A do Sol, em oito minutos. A de Netuno, em umas quatro horas. E a da Voyager 1, em um dia inteiro.',
 'j': 'De carro, a cem quilômetros por hora, sem nunca parar, essa viagem levaria quase trinta mil anos. De avião, mais de três mil. A Voyager, a sessenta e um mil quilômetros por hora, levou quarenta e nove anos.',
 'k': 'E a conversa também fica lenta. Um comando enviado da Terra leva um dia para chegar, e a resposta, mais um dia. A Voyager transmite com a potência de uma lâmpada de geladeira, e as antenas gigantes da NASA, na Califórnia, na Espanha e na Austrália, captam esse sussurro.',
 'l': 'A energia vem do calor do plutônio, e diminui um pouco a cada ano. Dos dez instrumentos científicos, só dois continuam ligados.',
 'm': 'E, mesmo assim, ela mal começou. A estrela mais próxima fica a mais de quatro anos-luz. A Voyager levaria mais de setenta mil anos para chegar tão longe.',
 'n': 'Com computadores mais simples que a chave de um carro, a Voyager 1 segue em frente, levando o disco de ouro e a nossa curiosidade. Um dia-luz longe de casa, e ainda falando com a gente.',
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
