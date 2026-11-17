# Gera a narração (ElevenLabs, voz Rodrigo Custódio). Uso: python3 narracao.py <pasta-de-saida> [falas...]
# A chave fica no ambiente/proxy; nunca no código.
import json, os, subprocess, sys, urllib.request
VOZ = '2xzOKgdTB2i5ia63CcIn'
FALAS = {
 'a': 'Abril de 1945. Berlim, a capital da Alemanha nazista, é um mar de ruínas. Os bombardeios destruíram bairros inteiros, e pelo leste avança o maior exército da guerra. Debaixo da cidade, Adolf Hitler vive os seus últimos dias.',
 'b': 'Desde janeiro, ele mora num abrigo de concreto, oito metros abaixo do jardim da Chancelaria. São salas pequenas, com luz elétrica dia e noite e o barulho constante dos geradores. Dali, Hitler comanda exércitos que já quase não existem. Tem cinquenta e seis anos, mas anda curvado, e a mão esquerda treme sem parar.',
 'c': 'Dezesseis de abril. Cerca de dois milhões e meio de soldados soviéticos atacam a partir do rio Oder, a menos de cem quilômetros de Berlim. No dia vinte, aniversário de Hitler, a artilharia soviética começa a atingir a cidade. Dois dias depois, numa reunião no bunker, ele explode de raiva e admite, pela primeira vez, que a guerra está perdida. Decide ficar em Berlim até o fim. No dia vinte e cinco, a cidade está cercada. No mesmo dia, soldados americanos e soviéticos se encontram no rio Elba, e a Alemanha fica partida ao meio.',
 'd': 'Enquanto isso, os homens mais próximos se afastam. Hermann Göring, chefe da força aérea, manda um telegrama pedindo para assumir o comando. Hitler manda prendê-lo. No dia vinte e oito, uma rádio inglesa revela que Heinrich Himmler, o chefe da SS, negociava com os aliados às escondidas. Para Hitler, é a traição final.',
 'e': 'Na madrugada do dia vinte e nove, com os soviéticos a poucos quarteirões, ele se casa com Eva Braun, sua companheira de muitos anos, numa pequena sala do bunker. Logo depois, dita o seu testamento a uma secretária. Culpa os judeus pela guerra que ele mesmo começou e nomeia o almirante Karl Dönitz como sucessor.',
 'f': 'Trinta de abril, por volta das três e meia da tarde. Hitler se mata com um tiro, e Eva Braun toma veneno. Os corpos são levados para o jardim, cobertos de gasolina e queimados, como ele tinha ordenado. Naquela noite, soldados soviéticos chegam ao alto do Reichstag, o antigo parlamento, e erguem a bandeira vermelha.',
 'g': 'No dia seguinte, Joseph Goebbels e a mulher, Magda, envenenam os seis filhos e se matam. Em dois de maio, Berlim se rende. Cinco dias depois, a Alemanha assina a rendição sem condições, e no dia oito de maio a guerra termina na Europa.',
 'h': 'A guerra que Hitler começou matou dezenas de milhões de pessoas. Seis milhões de judeus foram assassinados no Holocausto. O homem que prometia um império de mil anos terminou escondido debaixo da terra, enquanto a cidade desabava sobre a sua cabeça.',
}
SPEED = {}
if __name__ == '__main__':
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    for k in (sys.argv[2:] or list(FALAS)):
        body = json.dumps({'text': FALAS[k], 'model_id': 'eleven_multilingual_v2',
            'voice_settings': {'stability': 0.6, 'similarity_boost': 0.8, 'style': 0.1, 'speed': SPEED.get(k, 1.0)}}).encode()
        req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{VOZ}?output_format=mp3_44100_128',
            data=body, headers={'Content-Type': 'application/json', 'xi-api-key': os.environ.get('ELEVENLABS_API_KEY', 'proxy')})
        open(f'{out}/{k}.mp3', 'wb').write(urllib.request.urlopen(req).read())
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'{out}/{k}.mp3', '-ar', '44100', '-ac', '1', f'{out}/{k}.wav'], check=True)
        d = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f'{out}/{k}.wav'], capture_output=True, text=True).stdout.strip()
        print(k, d)
