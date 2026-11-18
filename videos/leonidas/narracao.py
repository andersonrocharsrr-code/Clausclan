# Narração (ElevenLabs, voz Rodrigo Custódio, ritmo de documentário). Uso: python3 narracao.py <pasta-de-saida> [falas...]
import json, os, subprocess, sys, urllib.request
VOZ = '2xzOKgdTB2i5ia63CcIn'  # Rodrigo Custódio
VEL = 1.1
FALAS = {
 'a': 'Em quatrocentos e oitenta antes de Cristo, o maior império do mundo marchou contra a Grécia. E, num desfiladeiro entre a montanha e o mar, um rei de Esparta decidiu não recuar: Leônidas.',
 'b': 'Em Esparta, os meninos deixavam a casa dos pais aos sete anos para entrar na agogê: luta, fome, frio e disciplina. Viravam hoplitas, com escudo redondo, lança longa, capacete de bronze e capa vermelha.',
 'c': 'Leônidas não deveria ser rei: tinha irmãos mais velhos. Por isso passou pela agogê como qualquer espartano. Com a morte do irmão Cleômenes, assumiu o trono, e casou com Gorgo, famosa pela inteligência.',
 'd': 'Do outro lado do mar, o rei persa Xerxes queria vingar a derrota do pai em Maratona. Reuniu um exército gigantesco e cruzou o Helesponto por pontes de barcos.',
 'e': 'A Grécia precisava ganhar tempo. O plano: segurar os persas nas Termópilas, uma passagem tão estreita que um exército enorme não conseguia usar o seu tamanho.',
 'f': 'Esparta estava em festa religiosa. Então Leônidas partiu com trezentos espartanos, todos com filhos vivos, para que nenhuma família acabasse. No caminho, uns sete mil gregos se juntaram a eles.',
 'g': 'Xerxes mandou um recado: entreguem as armas. Leônidas respondeu: Môlon labé. Venha pegá-las. Quando disseram que as flechas cobririam o sol, o espartano Dienekes respondeu: Melhor. Lutaremos à sombra.',
 'h': 'Os persas atacaram em ondas. Os gregos fecharam a falange: escudo colado em escudo, lanças para a frente. No segundo dia, vieram os Imortais, a tropa de elite de Xerxes. Também foram barrados.',
 'i': 'Então veio a traição. Um homem da região, Efialtes, mostrou aos persas um caminho pelas montanhas. Os gregos seriam cercados.',
 'j': 'Leônidas mandou a maioria dos aliados embora. Ficou com os trezentos, mais téspios e tebanos. No terceiro dia, lutaram até o fim. Leônidas caiu, e os gregos lutaram para proteger o corpo do seu rei.',
 'k': 'Os persas passaram. Mas o tempo ganho ajudou a Grécia a se organizar: venceu no mar, em Salamina, e em terra, em Plateias. Xerxes nunca conquistou a Grécia.',
 'l': 'No lugar da batalha, o poeta Simônides escreveu: Estrangeiro, vá dizer aos espartanos que aqui jazemos, obedientes às suas leis. Hoje, uma estátua de Leônidas guarda o desfiladeiro, com duas palavras: Môlon labé.',
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
