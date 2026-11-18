# Gera as vozes (ElevenLabs) e o tempo de cada palavra. Uso: python3 narracao.py <pasta> [ids...]
# Narrador: Onildo Rocha (voz da biblioteca da ElevenLabs). Firmino: Gélson Bertol. Seu Anselmo: Matheus Moretti.
# Homem de preto: Rodrigo Custódio, depois engrossada no audio.py. A chave fica no proxy; nunca no código.
import base64, json, os, subprocess, sys, urllib.request
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from falas import FALAS
VOZES = {'N': 'vr6MVhO51WHYH7ev2Qn9', 'F': 'nTlnHbWVNC3Uiuychvrv', 'D': '2xzOKgdTB2i5ia63CcIn', 'A': 'QVAas5gGwu8nTdZ3MUpQ'}
AJUSTE = {  # stability, style, speed
    'N': (0.50, 0.25, 1.16), 'F': (0.40, 0.35, 1.06), 'D': (0.70, 0.15, 0.95), 'A': (0.40, 0.35, 1.08)}
ESPECIAL = {'f12': (0.30, 0.5, 0.95), 'd06': (0.75, 0.2, 0.88)}
PAL = 'palavras.json'
if __name__ == '__main__':
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    pal = json.load(open(PAL)) if os.path.exists(PAL) else {}
    ids = sys.argv[2:] or [f[0] for f in FALAS]
    for i, (k, v, _, txt) in enumerate(FALAS):
        if k not in ids: continue
        st, sty, sp = ESPECIAL.get(k, AJUSTE[v])
        prev = ' '.join(f[3] for f in FALAS[max(0, i - 2):i] if f[1] == v)[-300:]
        body = {'text': txt, 'model_id': 'eleven_multilingual_v2',
                'voice_settings': {'stability': st, 'similarity_boost': 0.8, 'style': sty, 'speed': sp, 'use_speaker_boost': True}}
        if prev: body['previous_text'] = prev
        req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{VOZES[v]}/with-timestamps?output_format=mp3_44100_128',
            data=json.dumps(body).encode(), headers={'Content-Type': 'application/json', 'xi-api-key': os.environ.get('ELEVENLABS_API_KEY', 'proxy')})
        r = json.load(urllib.request.urlopen(req))
        open(f'{out}/{k}.mp3', 'wb').write(base64.b64decode(r['audio_base64']))
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'{out}/{k}.mp3', '-ar', '44100', '-ac', '1', f'{out}/{k}.wav'], check=True)
        al = r['alignment']; ws, cur, a = [], '', None
        for ch, t0, t1 in zip(al['characters'], al['character_start_times_seconds'], al['character_end_times_seconds']):
            if ch.isspace():
                if cur: ws.append([cur, round(a, 3), round(b, 3)]); cur = ''
            else:
                if not cur: a = t0
                cur += ch; b = t1
        if cur: ws.append([cur, round(a, 3), round(b, 3)])
        pal[k] = ws
        print(k, v, round(ws[-1][2], 2), 's')
    json.dump(pal, open(PAL, 'w'), ensure_ascii=False)
