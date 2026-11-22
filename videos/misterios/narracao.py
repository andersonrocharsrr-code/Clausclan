# Narração (ElevenLabs, voz Rodrigo Custódio, ritmo de documentário). Uso: python3 narracao.py <pasta-de-saida> [falas...]
import json, os, subprocess, sys, urllib.request
VOZ = '2xzOKgdTB2i5ia63CcIn'  # Rodrigo Custódio
VEL = 1.15
FALAS = {
 'a': 'O universo está cheio de coisas tão estranhas que parecem ficção científica. Estrelas que giram centenas de vezes por segundo. Pontos de luz mais brilhantes que galáxias inteiras. Nuvens onde estrelas estão nascendo agora. Vamos conhecer alguns desses mistérios.',
 'b': 'Comece com uma estrela muitas vezes maior que o Sol. No fim da vida, ela explode numa supernova, e o núcleo desaba sobre si mesmo. O que sobra é uma estrela de nêutrons: mais massa que o Sol, espremida numa bola de uns vinte quilômetros, do tamanho de uma cidade.',
 'c': 'Ela é tão densa que uma colher de chá desse material pesaria cerca de um bilhão de toneladas, mais que todos os seres humanos da Terra juntos.',
 'd': 'Algumas giram tão rápido que lançam feixes de rádio pelo espaço, como um farol. Cada vez que o feixe passa pela Terra, captamos um pulso. Por isso, se chamam pulsares. O mais rápido conhecido gira setecentas e dezesseis vezes por segundo.',
 'e': 'O primeiro foi descoberto em mil novecentos e sessenta e sete, pela estudante Jocelyn Bell. O sinal era tão regular que ganhou o apelido de homenzinhos verdes, como se fosse uma mensagem alienígena.',
 'f': 'No centro da Nebulosa do Caranguejo, há um pulsar que gira trinta vezes por segundo. Ele nasceu de uma explosão que astrônomos chineses viram no céu em mil e cinquenta e quatro, brilhando até durante o dia.',
 'g': 'Agora, imagine um buraco negro bilhões de vezes mais pesado que o Sol. Ele engole gás e estrelas, e o disco em volta fica tão quente que brilha mais que a galáxia inteira. Isso é um quasar.',
 'h': 'O primeiro identificado, o três C duzentos e setenta e três, está a dois bilhões e meio de anos-luz, e brilha como quatro trilhões de sóis. Mesmo tão longe, dá para vê-lo com um telescópio amador.',
 'i': 'Em dois mil e vinte e quatro, foi anunciado o quasar mais brilhante já encontrado: quinhentos trilhões de vezes mais brilhante que o Sol. O buraco negro dele engole o equivalente a um Sol por dia.',
 'j': 'A uns sete mil anos-luz daqui, na Nebulosa da Águia, ficam os Pilares da Criação: colunas gigantes de gás e poeira, fotografadas pelo Hubble em mil novecentos e noventa e cinco. A maior tem uns quatro anos-luz de altura.',
 'k': 'Dentro delas, estrelas estão nascendo, e a luz delas vai esculpindo os pilares, como o vento esculpe uma rocha. Em dois mil e vinte e dois, o James Webb mostrou esse berçário com detalhes nunca vistos.',
 'l': 'E há um mistério: alguns astrônomos sugeriram que uma explosão pode já ter destruído os pilares. Como a luz deles leva milênios para chegar, ainda os veríamos inteiros. Isso nunca foi confirmado.',
 'm': 'A uns trinta milhões de anos-luz está a Galáxia Sombreiro. Vista quase de lado, parece um chapéu mexicano: um núcleo brilhante cercado por um anel escuro de poeira.',
 'n': 'Ela tem cerca de cinquenta mil anos-luz de diâmetro, quase dois mil aglomerados de estrelas em volta e um buraco negro de um bilhão de sóis. No infravermelho, o James Webb a mostrou parecendo um alvo.',
 'o': 'E o maior mistério de todos: tudo o que conseguimos ver, estrelas, planetas e galáxias, é só cinco por cento do universo. O resto é matéria escura e energia escura. E ninguém sabe ainda o que elas são.',
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
