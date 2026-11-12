# A Viagem ao Planeta dos Números — videoclipe infantil

O resultado é o vídeo `videos/a-viagem-ao-planeta-dos-numeros.mp4` (1920x1080, 30 quadros por segundo, música original, 2:31).

Esta pasta guarda só o desenho que gera o vídeo (SVG + JavaScript, sem build). Não tem página para assistir:
`gravacao.html` é apenas o quadro que o `gravar.js` fotografa. Usa peças do `trenzinho/` (utilidades, cenário e rosto).

| Arquivo | O que tem |
| --- | --- |
| `js/letra.js` | Tempo de cada palavra cantada. |
| `js/espaco.js` | Foguete, astronautas, estrelas, luas, cometa, planetas, alienígenas, robôs, fundo do espaço e base de lançamento. |
| `js/clipe.js` | Linha do tempo: contagem regressiva, de 1 a 10, dedos da mão, desfile, pouso e mensagem final. |
| `PROMPT.md` | Roteiro em texto (em inglês) para usar em ferramentas de vídeo por IA, com os tempos reais da música. |

## Gravar o MP4 de novo

```
cd planeta && CRF=26 node gravar.js ../videos/a-viagem-ao-planeta-dos-numeros.mp4
```
