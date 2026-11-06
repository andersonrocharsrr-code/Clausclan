# Gera a narração do vídeo com a voz "Will" do ElevenLabs (a chave vem do secret ELEVENLABS_API_KEY).
import base64, json, os, sys, urllib.request

CHAVE = os.environ['ELEVENLABS_API_KEY']
SAIDA = sys.argv[1]
WILL_PADRAO = 'bIHbv24MWmeRgasZH58o'  # id da voz pré-pronta "Will"
os.makedirs(SAIDA, exist_ok=True)

def chamar(metodo, caminho, corpo=None):
    req = urllib.request.Request('https://api.elevenlabs.io' + caminho, method=metodo,
                                 data=json.dumps(corpo).encode() if corpo else None,
                                 headers={'xi-api-key': CHAVE, 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read())

voz = WILL_PADRAO
try:
    vozes = chamar('GET', '/v1/voices').get('voices', [])
    achou = [v for v in vozes if v.get('name', '').split(' ')[0].lower() == 'will']
    if achou:
        voz = achou[0]['voice_id']
    print('voz:', voz, [v.get('name') for v in achou])
except Exception as e:  # sem permissão de listar vozes: usa o id conhecido
    print('não listou as vozes, usando o id padrão da Will:', type(e).__name__)

falas = json.load(open(os.path.join(os.path.dirname(__file__), 'falas.json')))
for k, texto in falas.items():
    r = chamar('POST', f'/v1/text-to-speech/{voz}/with-timestamps?output_format=mp3_44100_128', {
        'text': texto, 'model_id': 'eleven_multilingual_v2',
        'voice_settings': {'stability': 0.5, 'similarity_boost': 0.75, 'style': 0.2, 'use_speaker_boost': True},
    })
    open(f'{SAIDA}/{k}.mp3', 'wb').write(base64.b64decode(r['audio_base64']))
    json.dump(r.get('alignment'), open(f'{SAIDA}/{k}.json', 'w'), ensure_ascii=False)
    print(k, 'ok')
