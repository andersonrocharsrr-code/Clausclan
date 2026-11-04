# Gera a narração do vídeo tutorial do Caixa com vozes neurais pt-BR (edge-tts).
import asyncio, json, os, sys
import edge_tts

VOZES = {'antonio': 'pt-BR-AntonioNeural', 'francisca': 'pt-BR-FranciscaNeural', 'thalita': 'pt-BR-ThalitaMultilingualNeural'}

async def main(saida):
    falas = json.load(open(os.path.join(os.path.dirname(__file__), 'falas.json')))
    for nome, voz in VOZES.items():
        os.makedirs(f'{saida}/{nome}', exist_ok=True)
        for k, texto in falas.items():
            for tentativa in range(4):
                try:
                    await edge_tts.Communicate(texto, voz, rate='+0%').save(f'{saida}/{nome}/{k}.mp3')
                    break
                except Exception as e:
                    print('repetindo', nome, k, e); await asyncio.sleep(3 * (tentativa + 1))
            else:
                raise SystemExit(f'falhou {nome} {k}')
        print(nome, 'ok')

asyncio.run(main(sys.argv[1]))
