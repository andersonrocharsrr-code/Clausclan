# Gera a narração (ElevenLabs, voz Rodrigo Custódio). Uso: python3 narracao.py <pasta-de-saida> [falas...]
# A chave fica no ambiente/proxy; nunca no código.
import json, os, subprocess, sys, urllib.request
VOZ = '2xzOKgdTB2i5ia63CcIn'
FALAS = {
 'a': 'Primeiro de fevereiro de 2003. Na Flórida, famílias esperam o ônibus espacial Columbia, que deve pousar às nove e dezesseis da manhã. Ele nunca chegou.',
 'b': 'O Columbia foi o primeiro ônibus espacial a voar, em 1981. Tem trinta e sete metros de comprimento e vinte e quatro de asa a asa. Na sua vigésima oitava missão, leva sete astronautas para dezesseis dias de ciência.',
 'c': 'Dezesseis de janeiro. Oitenta e um segundos após a decolagem, um pedaço de espuma se solta do tanque externo. Pesa setecentos e sessenta gramas, mas bate na asa esquerda a quase novecentos quilômetros por hora e abre um furo. Ninguém a bordo percebe.',
 'd': 'No espaço, a missão vai bem. Em terra, engenheiros veem a batida nos vídeos e pedem fotos da asa. O pedido é cancelado: a conclusão é que a espuma não oferece perigo.',
 'e': 'Primeiro de fevereiro. Na volta, a borda da asa passa de mil e quinhentos graus. Pelo furo, o ar em brasa entra e derrete a asa por dentro. Os sensores param, um a um. Às oito e cinquenta e nove, o comandante Rick Husband responde ao controle. A frase fica pela metade.',
 'f': 'A dezoito vezes a velocidade do som, a sessenta quilômetros de altura, o Columbia se desfaz sobre o Texas. Os sete astronautas morrem.',
 'g': 'Rick Husband. William McCool. Michael Anderson. Kalpana Chawla. David Brown. Laurel Clark. E Ilan Ramon, o primeiro astronauta de Israel.',
 'h': 'Mais de oitenta e quatro mil pedaços foram recolhidos. A investigação culpou a espuma e uma cultura acostumada ao risco. Os ônibus espaciais ficaram dois anos e meio no chão. E, desde então, cada nave passou a ser inspecionada no espaço antes de voltar.',
}
SPEED = {'g': 1.0, 'f': 1.02}
if __name__ == '__main__':
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    for k in (sys.argv[2:] or list(FALAS)):
        body = json.dumps({'text': FALAS[k], 'model_id': 'eleven_multilingual_v2',
            'voice_settings': {'stability': 0.55, 'similarity_boost': 0.8, 'style': 0.1, 'speed': SPEED.get(k, 1.12)}}).encode()
        req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{VOZ}?output_format=mp3_44100_128',
            data=body, headers={'Content-Type': 'application/json', 'xi-api-key': os.environ.get('ELEVENLABS_API_KEY', 'proxy')})
        open(f'{out}/{k}.mp3', 'wb').write(urllib.request.urlopen(req).read())
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'{out}/{k}.mp3', '-ar', '44100', '-ac', '1', f'{out}/{k}.wav'], check=True)
        d = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f'{out}/{k}.wav'], capture_output=True, text=True).stdout.strip()
        print(k, d)
