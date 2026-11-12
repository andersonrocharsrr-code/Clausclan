# O Trenzinho das Cores — videoclipe infantil

Clipe em desenho 2D (SVG + JavaScript, sem build) sincronizado com a música `musica.m4a` (2:17).

- **Assistir:** abra `trenzinho/index.html` por um servidor (GitHub Pages ou `python3 -m http.server`).
  Botões: tocar/pausar, voltar ao começo, barra de posição e tela cheia.
- **Vídeo pronto:** `videos/trenzinho-das-cores.mp4` (1920x1080, 30 quadros por segundo, música original).

## Como funciona

A música é o relógio: cada quadro é desenhado por `T.seek(t)` a partir do tempo do áudio,
então a animação nunca sai do ritmo (pode pausar, voltar e pular).

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
| `js/tocador.js` | Controles da página. |

## Gravar o MP4 de novo

```
cd trenzinho && node gravar.js ../videos/trenzinho-das-cores.mp4
```

Precisa de `playwright` e `ffmpeg`. Leva uns 6 minutos.
