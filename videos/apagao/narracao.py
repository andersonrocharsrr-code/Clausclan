# Narração (ElevenLabs, voz Rodrigo Custódio, um pouco mais rápida). Uso: python3 narracao.py <pasta-de-saida> [falas...]
import json, os, subprocess, sys, urllib.request
VOZ = '2xzOKgdTB2i5ia63CcIn'  # Rodrigo Custódio
VEL = 1.1
FALAS = {
 'a': 'Terça-feira, dezessete de novembro. Nas redes sociais, o aviso se espalhou rápido: o mundo inteiro ia ficar sem energia. Sem luz, sem internet, sem celular. E por até noventa dias.',
 'b': 'Os vídeos somaram milhões de visualizações nas redes. E muita gente correu para montar um kit de sobrevivência.',
 'c': 'A primeira "prova" veio de um desenho animado: Os Simpsons. Internautas destacaram uma cena do diário da Lisa, com a data de dezessete de novembro e uma tempestade. E uma postagem, atribuída ao Google, mandava assistir ao final do episódio.',
 'd': 'A segunda pista veio dos Estados Unidos. Para o mesmo dia dezessete, o governo americano marcou um teste nacional do sistema de alerta de emergência.',
 'e': 'No Brasil, a Defesa Civil vinha orientando as famílias a guardar água, comida e remédios para setenta e duas horas.',
 'f': 'E os noventa dias? Vieram de um plano militar americano, para as bases funcionarem sem energia de fora. Junte tudo isso, e pronto: nasceu o boato do apagão.',
 'g': 'Só que nada disso é verdade. Vamos por partes.',
 'h': 'O episódio dos Simpsons não fala em dois mil e vinte e seis, nem em apagão mundial. E a postagem do Google era falsa.',
 'i': 'O teste americano é de rotina, exigido por lei. E a própria agência avisou: ele não desliga a energia, nem a internet.',
 'j': 'O kit de setenta e duas horas é prevenção contra enchentes e temporais. E a Defesa Civil Nacional foi direta: não há evidências de um apagão no dia dezessete de novembro.',
 'k': 'O ONS, que comanda a energia do Brasil, não anunciou nenhum desligamento. E cada país tem a sua própria rede elétrica. Desligar o planeta inteiro, ao mesmo tempo, é praticamente impossível.',
 'l': 'O dia dezessete chegou, e passou. As luzes continuaram acesas. Antes de compartilhar, confira a fonte.',
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
