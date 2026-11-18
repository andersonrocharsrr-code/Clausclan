# Narração (ElevenLabs, voz Rodrigo Custódio). Uso: python3 narracao.py <pasta-de-saida> [falas...]
import json, os, subprocess, sys, urllib.request
VOZ = '2xzOKgdTB2i5ia63CcIn'  # Rodrigo Custódio - Serious and Tranquil
FALAS = {
 'a': 'Nas montanhas da Transilvânia, a neve cobre castelos que parecem saídos de um pesadelo. Foi aqui, na Romênia, que nasceu a lenda do vampiro mais famoso do mundo. Mas, antes do monstro, existiu um homem de carne e osso.',
 'b': 'Vlad nasceu por volta de 1431, na cidade de Sighișoara. O pai, também chamado Vlad, entrou para a Ordem do Dragão, uma irmandade de nobres cristãos que lutava contra os turcos otomanos. Por isso ficou conhecido como Vlad Dracul, o dragão. O filho virou Drăculea: o filho do dragão.',
 'c': 'Ainda menino, Vlad e o irmão mais novo, Radu, foram entregues ao sultão otomano como reféns, para garantir a lealdade do pai. Passaram anos na corte turca, aprendendo a língua, a guerra e a política. Radu se adaptou. Vlad cresceu com ódio.',
 'd': 'Em 1456, Vlad assumiu o trono da Valáquia, ao sul da Transilvânia, e governou com mão de ferro. Para punir inimigos, ladrões e traidores, usava um castigo terrível: a empalação, numa estaca de madeira. Por isso ganhou o apelido que o acompanha até hoje: Vlad Țepeș, o Empalador.',
 'e': 'Em 1462, o sultão Mehmed Segundo, o conquistador de Constantinopla, invadiu a Valáquia com um exército enorme. Vlad atacou o acampamento turco à noite, de surpresa. Dias depois, perto da capital, Târgoviște, os turcos encontraram uma floresta de estacas: milhares de prisioneiros empalados. O sultão recuou.',
 'f': 'Vlad perdeu o trono, passou anos preso na Hungria e voltou a reinar por pouco tempo. Morreu lutando contra os otomanos, por volta de 1476. Onde foi enterrado, até hoje ninguém sabe ao certo.',
 'g': 'Quatrocentos anos depois, em Londres, um irlandês chamado Bram Stoker trabalhava como gerente de um grande teatro. À noite, escrevia. Em mil oitocentos e noventa, na biblioteca da cidade de Whitby, na Inglaterra, encontrou um livro antigo sobre a Valáquia. Ali leu sobre um príncipe chamado Drácula, e uma nota dizendo que, na língua do lugar, Drácula queria dizer diabo.',
 'h': 'Stoker gostou do nome. Passou anos pesquisando lendas, mapas e costumes da Europa Oriental, sem nunca pisar na Transilvânia. Em 1897, lançou o romance Drácula, contado em cartas e diários dos personagens.',
 'i': 'No livro, o jovem advogado Jonathan Harker viaja até um castelo nos Cárpatos para vender uma casa em Londres a um conde. O anfitrião é pálido, tem dentes afiados, não aparece no espelho e desce as paredes do castelo como um lagarto. De dia, dorme num caixão com terra da sua terra natal. À noite, vira morcego, lobo ou névoa.',
 'j': 'Drácula viaja de navio até a Inglaterra, chega a Whitby numa tempestade e começa a caçar. Para enfrentá-lo, o professor Van Helsing reúne um grupo armado de alho, crucifixos e estacas de madeira. O conde só é vencido no fim, de volta ao seu castelo.',
 'k': 'O Drácula do livro não é Vlad, mas carrega o seu nome, a sua terra e a sua fama de crueldade. O cinema fez o resto: o Nosferatu de 1922, a capa de Bela Lugosi em 1931, os dentes e os olhos vermelhos de Christopher Lee em 1958. Hoje, turistas do mundo inteiro visitam o Castelo de Bran, chamado de Castelo do Drácula, embora Vlad talvez nunca tenha morado lá. A fortaleza que foi dele, em Poenari, é uma ruína no alto de uma montanha.',
 'l': 'Vlad, o Empalador, morreu há mais de quinhentos anos. Mas o filho do dragão nunca deixou de assombrar a noite. Enquanto houver neve nos Cárpatos e morcegos sob a lua, Drácula continuará vivo.',
}
SPEED = {}
if __name__ == '__main__':
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    for k in (sys.argv[2:] or list(FALAS)):
        body = json.dumps({'text': FALAS[k], 'model_id': 'eleven_multilingual_v2',
            'voice_settings': {'stability': 0.6, 'similarity_boost': 0.8, 'style': 0.1, 'speed': SPEED.get(k, 1.02)}}).encode()
        req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{VOZ}?output_format=mp3_44100_128',
            data=body, headers={'Content-Type': 'application/json', 'xi-api-key': os.environ.get('ELEVENLABS_API_KEY', 'proxy')})
        open(f'{out}/{k}.mp3', 'wb').write(urllib.request.urlopen(req).read())
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'{out}/{k}.mp3', '-ar', '44100', '-ac', '1', f'{out}/{k}.wav'], check=True)
        d = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f'{out}/{k}.wav'], capture_output=True, text=True).stdout.strip()
        print(k, d)
