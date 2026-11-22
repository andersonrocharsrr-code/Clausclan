# Narração (ElevenLabs, voz Rodrigo Custódio, ritmo de documentário). Uso: python3 narracao.py <pasta-de-saida> [falas...]
import json, os, subprocess, sys, urllib.request
VOZ = '2xzOKgdTB2i5ia63CcIn'  # Rodrigo Custódio
VEL = 1.0
FALAS = {
 'a': 'Olhe para o céu numa noite escura. Cada pontinho de luz é um sol. E tudo o que conseguimos enxergar, até o limite, se chama universo observável. Vamos fazer essa viagem, começando aqui, em casa.',
 'b': 'A Terra tem quase treze mil quilômetros de diâmetro. A Lua está a trezentos e oitenta e quatro mil quilômetros. Nesse espaço, caberiam todos os outros planetas do sistema solar, enfileirados.',
 'c': 'O Sol é tão grande que caberia dentro dele mais de um milhão de Terras. E a luz dele leva oito minutos para chegar até nós.',
 'd': 'Netuno, o último planeta, fica a quatro bilhões e meio de quilômetros do Sol. E, muito além dele, a Nuvem de Oort, uma esfera de gelo e cometas, pode se estender por mais de um ano-luz.',
 'e': 'Para entender a escala: se o Sol fosse uma laranja, a Terra seria um grão de areia a dez metros de distância. E a estrela mais próxima seria outra laranja, a quase três mil quilômetros.',
 'f': 'O Sol é só uma entre centenas de bilhões de estrelas da Via Láctea, a nossa galáxia. Ela tem cerca de cem mil anos-luz de diâmetro: a luz leva cem mil anos para atravessá-la.',
 'g': 'Estamos num dos braços da espiral, a uns vinte e seis mil anos-luz do centro, onde fica um buraco negro com quatro milhões de vezes a massa do Sol. E o Sol leva duzentos e trinta milhões de anos para dar uma volta na galáxia.',
 'h': 'Se a Via Láctea fosse do tamanho do Brasil, o sistema solar inteiro, até Netuno, caberia na palma da mão.',
 'i': 'A grande vizinha é Andrômeda, a dois milhões e meio de anos-luz. Ela tem cerca de um trilhão de estrelas, e dá para vê-la a olho nu, longe das luzes da cidade. A luz que chega hoje dela partiu antes de existirem seres humanos como nós. E, daqui a alguns bilhões de anos, ela e a Via Láctea podem se encontrar e virar uma só galáxia.',
 'j': 'As duas fazem parte do Grupo Local, com dezenas de galáxias. Que, por sua vez, está dentro de Laniakea, um superaglomerado com cerca de cem mil galáxias, espalhadas por quinhentos milhões de anos-luz.',
 'k': 'Em dois mil e vinte e dois, o telescópio James Webb fotografou um pedacinho do céu do tamanho de um grão de areia, segurado com o braço esticado. Nessa imagem, apareceram milhares de galáxias, cada uma com bilhões de estrelas.',
 'l': 'Ao todo, o universo observável tem cerca de noventa e três bilhões de anos-luz de diâmetro, e centenas de bilhões de galáxias. Há mais estrelas do que grãos de areia em todas as praias da Terra.',
 'm': 'Mas, se o universo tem treze bilhões e oitocentos milhões de anos, como pode medir noventa e três bilhões? Porque o próprio espaço se expande, e levou as galáxias para mais longe enquanto a luz viajava.',
 'n': 'No limite está a luz mais antiga, de quando o universo tinha só trezentos e oitenta mil anos. Além dela, não dá para ver. Não porque acaba, mas porque a luz ainda não teve tempo de chegar.',
 'o': 'E, no meio de toda essa imensidão, num pontinho azul em volta de uma estrela comum, estamos nós, capazes de olhar para cima e perguntar o que existe lá fora.',
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
