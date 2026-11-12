# O Circo Chegou na Cidade — videoclipe infantil

O resultado é o vídeo `videos/o-circo-chegou-na-cidade.mp4` (1920x1080, 30 quadros por segundo, música original, 2:51).

Esta pasta guarda só o desenho que gera o vídeo (SVG + JavaScript, sem build). Não tem página para assistir:
`gravacao.html` é apenas o quadro que o `gravar.js` fotografa.

Usa peças do `trenzinho/` (utilidades, cenário, rosto, macaquinho e coelho), então as duas pastas andam juntas.

| Arquivo | O que tem |
| --- | --- |
| `js/letra.js` | Tempo de cada palavra cantada. |
| `js/elenco.js` | Chico, mágico, malabarista, bailarina, equilibrista, as quatro crianças e o leão. |
| `js/cenario.js` | Lado de fora (cidade e lona), picadeiro, arquibancada de perto e cortinas. |
| `js/clipe.js` | Linha do tempo: quem entra em cada verso, câmera, coreografia e efeitos. |

## Gravar o MP4 de novo

```
cd circo && CRF=29 node gravar.js ../videos/o-circo-chegou-na-cidade.mp4
```

Grava em 10 sequências de uns 17 segundos e junta na ordem com a música. Precisa de `playwright` e `ffmpeg`.
