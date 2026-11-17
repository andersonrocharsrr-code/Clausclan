# Gera a narração (ElevenLabs, voz Rodrigo Custódio). Uso: python3 narracao.py <pasta-de-saida> [falas...]
# A chave fica no ambiente/proxy; nunca no código.
import json, os, subprocess, sys, urllib.request
VOZ = '2xzOKgdTB2i5ia63CcIn'
FALAS = {
 'a': 'Roma, ano oitenta depois de Cristo. No centro da maior cidade do mundo, cinquenta mil pessoas se espremem num edifício de pedra que acaba de ficar pronto. Lá dentro, homens armados vão lutar diante do imperador. Bem-vindo ao Coliseu.',
 'b': 'O imperador Vespasiano começou a obra por volta do ano setenta, no lugar de um lago do palácio de Nero. O filho dele, Tito, inaugurou o anfiteatro com cem dias de jogos. São cento e oitenta e nove metros de comprimento e quarenta e oito de altura, como um prédio de quinze andares. Por fora, três andares de arcos, oitenta em cada volta, com colunas de três estilos diferentes. Tudo em pedra travertino, presa com grampos de ferro.',
 'c': 'Os oitenta portões deixavam a multidão entrar e sair em poucos minutos. Cada um sabia o seu lugar: os senadores embaixo, perto da arena; o povo mais acima; as mulheres e os pobres lá no alto. O sol era barrado por um toldo gigante, o velário, puxado por marinheiros com cordas e mastros. E o chão da arena era de madeira coberta de areia, que em latim se diz harena.',
 'd': 'Os gladiadores eram, na maioria, escravos, prisioneiros de guerra ou condenados, mas alguns eram homens livres atrás de fama e dinheiro. Treinavam numa escola ao lado, o Ludus Magnus. Cada tipo lutava de um jeito. O mirmilão usava um capacete de metal com crista, escudo grande e espada curta, o gládio. O trácio tinha um escudo pequeno e uma espada curva. O secutor, de capacete liso e olhos pequenos, enfrentava o reciário, que lutava sem capacete, com uma rede e um tridente.',
 'e': 'Um dia de jogos começava cedo, com a caça a animais trazidos de todo o império: leões, ursos, elefantes. Anos depois, o imperador Domiciano construiu, debaixo da arena, o hipogeu: túneis e elevadores que levantavam as feras e os cenários por alçapões no chão. À tarde vinham as lutas de gladiadores, o ponto alto do dia. Quando um lutador caía, quem decidia se ele vivia ou morria era quem pagava os jogos, muitas vezes o próprio imperador, ouvindo os gritos da multidão.',
 'f': 'Ao contrário do que mostram os filmes, nem toda luta terminava em morte. Gladiadores custavam caro, e os melhores viravam ídolos, com os nomes pintados nas paredes. Mesmo assim, ao longo dos séculos, milhares morreram na areia do Coliseu.',
 'g': 'Com o fim do império, os jogos perderam força. As lutas de gladiadores acabaram no século cinco, e as caçadas, cerca de cem anos depois. Terremotos derrubaram parte das paredes, e as pedras foram levadas para construir igrejas e palácios.',
 'h': 'Hoje, quase dois mil anos depois, milhões de pessoas visitam o Coliseu todos os anos. A arena ficou em silêncio, mas o maior anfiteatro do mundo antigo continua de pé, no coração de Roma.',
}
SPEED = {}
if __name__ == '__main__':
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    for k in (sys.argv[2:] or list(FALAS)):
        body = json.dumps({'text': FALAS[k], 'model_id': 'eleven_multilingual_v2',
            'voice_settings': {'stability': 0.6, 'similarity_boost': 0.8, 'style': 0.1, 'speed': SPEED.get(k, 1.04)}}).encode()
        req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{VOZ}?output_format=mp3_44100_128',
            data=body, headers={'Content-Type': 'application/json', 'xi-api-key': os.environ.get('ELEVENLABS_API_KEY', 'proxy')})
        open(f'{out}/{k}.mp3', 'wb').write(urllib.request.urlopen(req).read())
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'{out}/{k}.mp3', '-ar', '44100', '-ac', '1', f'{out}/{k}.wav'], check=True)
        d = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f'{out}/{k}.wav'], capture_output=True, text=True).stdout.strip()
        print(k, d)
