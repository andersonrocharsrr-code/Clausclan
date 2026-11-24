# Narração (ElevenLabs, voz Rodrigo Custódio, ritmo de documentário). Uso: python3 narracao.py <pasta-de-saida> [falas...]
import json, os, subprocess, sys, urllib.request
VOZ = '2xzOKgdTB2i5ia63CcIn'  # Rodrigo Custódio
VEL = 1.15
FALAS = {
 'a': 'Pouca gente sabe, mas o Brasil lutou na Segunda Guerra Mundial, e venceu uma das batalhas mais difíceis da Itália.',
 'b': 'Em mil novecentos e quarenta e dois, submarinos alemães afundaram navios brasileiros na nossa própria costa. Centenas de pessoas morreram. E o Brasil declarou guerra.',
 'c': 'Diziam que era mais fácil uma cobra fumar do que o Brasil ir à guerra. Pois a cobra fumou: mais de vinte e cinco mil brasileiros da Força Expedicionária partiram para a Itália.',
 'd': 'Em julho de mil novecentos e quarenta e quatro, eles desembarcaram em Nápoles e se juntaram ao Quinto Exército americano, sob o comando do general Mascarenhas de Moraes.',
 'e': 'O grande desafio estava nas montanhas: Monte Castelo, uma posição alemã lá no alto, com visão de todo o vale.',
 'f': 'Os brasileiros atacaram em novembro e em dezembro, na neve e num frio abaixo de zero, muitos sem nunca ter visto neve. Todos os ataques falharam.',
 'g': 'Até que, em vinte e um de fevereiro de mil novecentos e quarenta e cinco, depois de horas subindo a encosta sob fogo, os pracinhas tomaram o topo. Monte Castelo era brasileiro.',
 'h': 'No céu, os pilotos do Senta a Pua destruíam pontes, trens e depósitos alemães. Em terra vieram Castelnuovo e Montese, a batalha mais sangrenta da FEB.',
 'i': 'E em Fornovo, uma divisão alemã inteira se rendeu aos brasileiros: cerca de quinze mil prisioneiros.',
 'j': 'Cerca de quatrocentos e cinquenta pracinhas não voltaram para casa. Mas o Brasil saiu da guerra com uma vitória que ninguém esperava. A cobra fumou.',
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
