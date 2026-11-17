# Drácula — roteiro (30 s)

**Modelo:** Recorte Dourado, com **paleta noturna**: preto e azul-frio, branco da neve e da lua; o dourado vira **vermelho-sangue**.
**Formato:** 1920×1080, 30 qps, 30 s. Voz **Jonas** (ElevenLabs, "Jonas - Dynamic, Lively, Friendly", mais lenta e firme). Legenda palavra por palavra.
**Vídeo pronto:** `videos/dracula.mp4`.

| Tempo | Imagem | Na tela | Narração | Som |
| --- | --- | --- | --- | --- |
| 0:00–0:07 | O castelo gótico no penhasco, ao longe, sob a lua cheia; montanhas com neve, floresta de abetos nevados, neve caindo, morcegos cruzando a lua. A câmera se aproxima devagar. | TRANSILVÂNIA / MONTES CÁRPATOS · ROMÊNIA | Transilvânia, nas montanhas da Romênia. No alto de um castelo coberto de neve… | vento gelado, uivo de lobo, órgão |
| 0:07–0:09 | De perto, a torre com janelas acesas; uma revoada de morcegos sai. | CONDE DRÁCULA | …vive o conde Drácula. | morcegos, tímpano |
| 0:09–0:13 | O rosto do Drácula: pele pálida, cabelo preto com o bico na testa e têmporas grisalhas, orelhas pontudas, olhos vermelhos que acendem, capa de gola alta com forro vermelho e medalhão. A câmera aproxima. | BRAM STOKER · 1897 / O ROMANCE "DRÁCULA" | Criado pelo escritor Bram Stoker em 1897… | batida de coração |
| 0:13–0:15 | A cripta de pedra com velas e o caixão fechado. | DE DIA, NO CAIXÃO | …ele dorme de dia num caixão e… | sino ao longe |
| 0:15–0:16 | A tampa abre e uma nuvem de morcegos sai. | À NOITE, EM FORMA DE MORCEGO | …à noite, sai em forma de morcego… | rangido do caixão, morcegos |
| 0:16–0:18 | Zoom na boca: ela abre e mostra os caninos; uma gota de sangue escorre. Olhos em brasa. | ATRÁS DE SANGUE | …atrás de sangue. | coração, tímpanos rápidos |
| 0:18–0:23 | Retrato de Vlad III em moldura: gorro vermelho com pérolas e joia, cabelo longo, bigode. | A INSPIRAÇÃO / UM PRÍNCIPE DE VERDADE · VLAD III · O EMPALADOR · PRÍNCIPE DA VALÁQUIA · SÉCULO XV | A inspiração veio de um príncipe de verdade: Vlad, o Empalador. | trovão ao longe |
| 0:23–0:30 | O castelo na frente da lua cheia, morcegos em volta, neve caindo; a câmera se afasta. | DRÁCULA · O VAMPIRO MAIS FAMOSO DO MUNDO | Mais de cem anos depois, Drácula ainda é o vampiro mais famoso do mundo. | vento, lobo, acorde final |

## Como refazer

```
python3 narracao.py <pasta>/nar      # voz Jonas; palavras.json = forced-alignment das falas
python3 legendas.py                  # legendas.js
node render.js <pasta>/video.mp4
python3 audio.py <pasta> <pasta>/audio.wav   # efeitos em <pasta>/sfx: vento, lobo, morcegos, caixao, sino, trovao, coracao
ffmpeg -i <pasta>/video.mp4 -i <pasta>/audio.wav -c:v libx264 -crf 24 -c:a aac -b:a 192k -shortest ../dracula.mp4
```
Desenhos em `dracula.js` (céu, castelo, floresta, neve, morcegos, rosto, cripta, Vlad); cores do estilo trocadas em `motor.js`.
