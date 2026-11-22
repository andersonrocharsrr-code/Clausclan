# Ponto Nemo — pixel art (15 s, vertical)

**Formato:** 1080×1920 (TikTok), 30 qps, 15,0 s. Tudo desenhado numa tela de 180×320 pixels e ampliado 6× (pixel art),
com linhas de TV, transição em pontilhado de pixels e fonte Pixelify Sans. **Voz:** Rodrigo Custódio (velocidade 1,2, pausas
encurtadas por `pausas.py`). **Som:** música chiptune em Lá menor (onda quadrada, triângulo e ruído) e efeitos 8-bit.
**Vídeo pronto:** `videos/ponto-nemo.mp4`.

**Fala:** "No meio do Pacífico fica o Ponto Nemo, o lugar mais isolado da Terra. A terra mais próxima está a dois mil e seiscentos
quilômetros. Às vezes, os humanos mais perto são os astronautas da Estação Espacial. E é ali que as naves espaciais vão morrer."

| Cena | Imagem |
| --- | --- |
| 1 | Globo em pixel gira até o Pacífico Sul; marcador vermelho; "PONTO NEMO", 48°52'S 123°23'O |
| 2 | Mapa de cima: círculo de 2.688 km até as ilhas Ducie, Motu Nui e Maher; boia no centro |
| 3 | Estação Espacial passando a ~400 km, astronauta acenando, linha até a boia |
| 4 | Nave pegando fogo cai no mar e afunda no "cemitério de naves" (mais de 260 naves) |

**Gerar:** `python3 narracao.py <p>/nar && python3 alinhar.py <p> && python3 pausas.py <p> && python3 tempos.py &&
python3 audio.py <p> <p>/audio.wav && node render.js <p>/video.mp4`
