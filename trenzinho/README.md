# O Trenzinho das Cores — videoclipe infantil

O resultado é o vídeo `videos/trenzinho-das-cores.mp4` (1920x1080, 30 quadros por segundo, música original, 2:17).

Esta pasta guarda só o desenho que gera o vídeo (SVG + JavaScript, sem build). Não tem página para assistir:
`gravacao.html` é apenas o quadro que o `gravar.js` fotografa.

## Como funciona

A música é o relógio: cada quadro é desenhado por `T.seek(t)` a partir do tempo da música,
então a animação nunca sai do ritmo.

| Arquivo | O que tem |
| --- | --- |
| `js/letra.js` | Tempo de cada palavra cantada (mexe as bocas). |
| `js/base.js` | Utilidades, ritmo (batida de 0,4594 s) e paleta de cores. |
| `js/arte.js` | Peças de cenário: árvores, casas, nuvens, montanhas, flores, trilho. |
| `js/trem.js` | Locomotiva, vagões (vermelho, amarelo, azul, verde), vapor e rosto. |
| `js/bichos.js` | Macaquinho, girafa, coelhinho, ursinho e borboleta. |
| `js/mundos.js` | Cenários em camadas: vale, estação, floresta, ponte, campo, praça, pôr do sol. |
| `js/frontal.js` | Cena do trem visto de frente. |
| `js/clipe.js` | Linha do tempo: câmera, coreografia e efeitos de cada verso. |

## Gravar o MP4 de novo

```
cd trenzinho && node gravar.js ../videos/trenzinho-das-cores.mp4
```

Precisa de `playwright` e `ffmpeg`. Leva uns 6 minutos.
