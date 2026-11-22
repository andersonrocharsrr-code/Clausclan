# Narração (ElevenLabs, voz Rodrigo Custódio, ritmo de documentário). Uso: python3 narracao.py <pasta-de-saida> [falas...]
import json, os, subprocess, sys, urllib.request
VOZ = '2xzOKgdTB2i5ia63CcIn'  # Rodrigo Custódio
VEL = 1.2
FALAS = {
 'a': 'Hoje, você paga um café com um toque no celular. Mas, por milhares de anos, não existia dinheiro nenhum. Então, como ele surgiu? E como mudou o mundo?',
 'b': 'No começo, as pessoas trocavam coisas: um peixe por um saco de trigo, uma ovelha por ferramentas. Isso se chama escambo. Mas tinha um problema: e se o pescador quisesse trigo, e o agricultor não quisesse peixe? A troca simplesmente não acontecia.',
 'c': 'Por isso, muitos povos passaram a usar coisas que todo mundo aceitava: gado, grãos, conchas e até sal. Em latim, gado era pécus, e daí vem a palavra pecuniário. E, segundo a tradição, a palavra salário vem do sal.',
 'd': 'Há uns cinco mil anos, na Mesopotâmia, os templos guardavam cevada e prata, e anotavam as dívidas em tabuletas de barro. O siclo era um peso de prata usado para dar preço às coisas. Muitos historiadores dizem que a escrita nasceu, em parte, para fazer essas contas.',
 'e': 'Por volta de seiscentos antes de Cristo, no reino da Lídia, onde hoje é a Turquia, surgiram as primeiras moedas: pedacinhos de electro, uma mistura de ouro e prata, com o desenho de um leão. Agora, ninguém precisava pesar o metal. Bastava contar.',
 'f': 'A ideia se espalhou. Os gregos tinham o dracma, e os romanos, o denário. A palavra moeda vem do templo de Juno Moneta, em Roma, onde as moedas eram fabricadas. Na China, as moedas de bronze eram redondas, com um furo quadrado no meio, para passar um cordão.',
 'g': 'Carregar milhares de moedas era pesado. Então, há quase mil anos, a China criou o papel-moeda. Quando Marco Polo viu aquilo, ficou espantado: papel valendo como ouro. Mas veio a primeira lição: quando o governo imprimiu papel demais, os preços dispararam. Era a inflação.',
 'h': 'Na Itália, os cambistas trabalhavam em bancos de madeira nas praças. Daí vem a palavra banco. Famílias como os Médici emprestavam dinheiro a reis e papas, e criaram as cartas de crédito: um comerciante deixava ouro em Florença e retirava em Londres, sem carregar nada pelo caminho.',
 'i': 'Nos anos mil e quinhentos, a prata das minas de Potosí, na Bolívia, virou o peso de oito espanhol, a primeira moeda global. Ela circulava da América à Europa, e até a China. Financiou impérios, mas a um custo terrível para os indígenas que trabalhavam nas minas.',
 'j': 'Durante muito tempo, o papel-moeda podia ser trocado por ouro. Em mil novecentos e quarenta e quatro, o dólar virou a base do mundo, preso ao ouro. Até que, em mil novecentos e setenta e um, os Estados Unidos cortaram essa ligação. Desde então, o dinheiro vale porque confiamos nele.',
 'k': 'E quando a confiança acaba, o dinheiro derrete. O Brasil já teve nove moedas diferentes. Em março de mil novecentos e noventa, a inflação passou de oitenta por cento num só mês. Os preços mudavam no mesmo dia, até o Plano Real, em mil novecentos e noventa e quatro.',
 'l': 'Hoje, a maior parte do dinheiro nem existe em papel: são números em computadores. Vieram os cartões, o bitcoin, em dois mil e nove, e o Pix, em dois mil e vinte, que mudou o jeito do brasileiro pagar.',
 'm': 'Das conchas ao celular, o dinheiro mudou de forma muitas vezes. Mas, no fundo, ele sempre foi a mesma coisa: um acordo. Um pedaço de papel, ou um número na tela, só vale porque todos nós acreditamos nele.',
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
