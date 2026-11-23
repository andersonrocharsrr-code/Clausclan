# Narração (ElevenLabs, voz Rodrigo Custódio, ritmo de documentário). Uso: python3 narracao.py <pasta-de-saida> [falas...]
import json, os, subprocess, sys, urllib.request
VOZ = '2xzOKgdTB2i5ia63CcIn'  # Rodrigo Custódio
VEL = 1.15
FALAS = {
 'a': 'Imagine olhar para o céu à noite e saber que, em dois planetas vizinhos, existem cidades, florestas e seres vivos olhando de volta para nós. E se Marte e Vênus fossem habitáveis como a Terra?',
 'b': 'Os três planetas nasceram quase juntos, há quatro bilhões e meio de anos. Marte, no começo, tinha rios e talvez um oceano. Vênus pode ter tido mares antes de virar um forno. Num universo um pouco diferente, os três poderiam ter continuado vivos.',
 'c': 'Então, o Sistema Solar teria três mundos azuis. À noite, Vênus brilharia no céu mais forte do que nunca, e Marte seria um pontinho vermelho cheio de luzes de cidades, visto pelos telescópios.',
 'd': 'Marte é menor que a Terra, e a gravidade lá é só trinta e oito por cento da nossa. Por isso, a vida marciana poderia ser alta e leve: árvores gigantes, animais de pernas longas, e pessoas que pulariam quase três vezes mais alto que nós.',
 'e': 'O dia em Marte dura quase o mesmo que o nosso: vinte e quatro horas e trinta e nove minutos. Mas o ano dura seiscentos e oitenta e sete dias. Um marciano de dez anos já teria quase dezenove anos da Terra. E no céu, duas luas: Fobos e Deimos.',
 'f': 'Vênus é quase do tamanho da Terra, então a gravidade seria parecida. Mas ele está mais perto do Sol: seria um mundo quente, de florestas densas, nuvens grossas e chuvas fortes. Talvez com criaturas que voam devagar no ar pesado.',
 'g': 'E o mais estranho: em Vênus, um dia é mais longo que um ano. O planeta gira tão devagar que o Sol nasce no oeste e leva meses para atravessar o céu. Um venusiano viveria tardes que duram semanas.',
 'h': 'Agora imagine nós indo visitar. Com foguetes de hoje, a viagem até Vênus levaria uns cinco meses, e até Marte, de seis a nove. As naves partiriam nas janelas de lançamento, quando os planetas ficam mais perto.',
 'i': 'Ao chegar em Marte, um turista da Terra se sentiria leve: cada passo viraria um salto. Veria duas luas no céu e cidades feitas para gente alta. E uma ligação para casa levaria de três a vinte e dois minutos para chegar.',
 'j': 'Em Vênus, o visitante sentiria o calor úmido de uma estufa gigante. Ficaria impressionado com florestas sem fim, e com um Sol que quase não se mexe no céu.',
 'k': 'E se eles viessem nos visitar? Um marciano, acostumado com pouca gravidade, se sentiria quase três vezes mais pesado na Terra. Andaria devagar, talvez com uma roupa robótica para ajudar as pernas.',
 'l': 'Já um venusiano estranharia os nossos dias curtos, com o Sol nascendo e se pondo o tempo todo. Sentiria frio no nosso inverno, e ficaria encantado com a neve, coisa que talvez nunca tivesse visto.',
 'm': 'Haveria comércio, intercâmbio de estudantes, campeonatos entre planetas, e talvez até casamentos interplanetários. E, claro, discussões sem fim sobre quem tem o melhor planeta.',
 'n': 'Na vida real, Marte é um deserto gelado, e Vênus é um inferno de quatrocentos e sessenta graus. A Terra é o único lugar conhecido com vida. Por isso, cuidar dela é cuidar do único lar que temos. Pelo menos, por enquanto.',
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
