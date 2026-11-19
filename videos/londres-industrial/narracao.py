# Narração (ElevenLabs, voz Rodrigo Custódio, ritmo de documentário). Uso: python3 narracao.py <pasta-de-saida> [falas...]
import json, os, subprocess, sys, urllib.request
VOZ = '2xzOKgdTB2i5ia63CcIn'  # Rodrigo Custódio
VEL = 1.1
FALAS = {
 'a': 'No século dezenove, Londres virou a maior cidade do mundo. E o que mudou tudo foi uma máquina que fervia água e fazia o mundo andar: a máquina a vapor.',
 'b': 'A revolução industrial começou na Grã-Bretanha, por volta de mil setecentos e sessenta. O escocês James Watt aperfeiçoou a máquina a vapor, e o carvão virou o combustível de tudo: fábricas, navios e trens.',
 'c': 'Londres cresceu como nunca. Em mil oitocentos e um, tinha cerca de um milhão de habitantes. Cem anos depois, mais de seis milhões. Gente do campo chegava todos os dias, em busca de trabalho.',
 'd': 'No rio Tâmisa, as docas recebiam navios do mundo inteiro, com algodão, açúcar, chá e madeira. Estivadores carregavam sacas o dia todo, e as chaminés de fábricas, cervejarias e oficinas soltavam fumaça sem parar.',
 'e': 'Nas ruas, milhares de cavalos puxavam carroças, carruagens e ônibus. Vendedores gritavam, cachorros corriam entre as rodas, e os lampiões a gás, novidade da época, iluminavam a cidade à noite.',
 'f': 'Mas o progresso tinha um preço. Os operários trabalhavam doze, às vezes catorze horas por dia. As crianças também: limpavam chaminés por dentro, vendiam jornais e trabalhavam em fábricas por quase nada.',
 'g': 'Nos bairros pobres, famílias inteiras dividiam um único quarto. A fumaça do carvão criava uma névoa amarela, que os londrinos chamavam de sopa de ervilha. E o rio virou esgoto.',
 'h': 'Em mil oitocentos e cinquenta e quatro, a cólera matou centenas de pessoas no bairro do Soho. O médico John Snow descobriu que a doença vinha da água de uma bomba pública, e convenceu as autoridades a tirar a alavanca.',
 'i': 'Quatro anos depois, no calor do verão, o Tâmisa fedia tanto que os deputados mal conseguiam trabalhar: foi o Grande Fedor. O engenheiro Joseph Bazalgette construiu, então, centenas de quilômetros de esgotos, que funcionam até hoje.',
 'j': 'Em mil oitocentos e cinquenta e um, Londres mostrou ao mundo o seu poder: a Grande Exposição, num palácio de ferro e vidro, o Palácio de Cristal. Seis milhões de visitantes vieram ver as máquinas do futuro.',
 'k': 'Em mil oitocentos e sessenta e três, nasceu ali o primeiro metrô do mundo, com trens a vapor correndo em túneis debaixo da cidade.',
 'l': 'E os trabalhadores começaram a se unir. Em mil oitocentos e oitenta e oito, as meninas de uma fábrica de fósforos, envenenadas pelo fósforo branco, fizeram greve e venceram. No ano seguinte, os estivadores pararam o porto.',
 'm': 'Aos poucos, vieram leis que tiraram as crianças das fábricas, limitaram as horas de trabalho e levaram água limpa para as casas.',
 'n': 'A revolução industrial trouxe fumaça, dor e desigualdade. Mas também trens, luz, esgotos e máquinas que mudaram a vida de todos nós. E muito disso começou nas ruas de Londres, debaixo de uma nuvem de vapor.',
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
