# Mistérios do universo — roteiro (3:52, vertical)

**Formato:** 1080×1920 (TikTok), 30 qps, 231,7 s. **Modelo:** Recorte Dourado (padrão da Starship), legenda palavra por palavra,
5 capítulos com cartão "CAPÍTULO N" e transições variadas (névoa, íris, cortina, deslize, zoom, flash, escuro).
**Voz:** Rodrigo Custódio (ElevenLabs), velocidade 1,15 (um pouco mais rápida).
**Trilha:** pads, cordas, coro e sininhos; efeitos de supernova, pulsar (tique-taque de rádio), registrador de 1967, buraco negro,
jato de quasar, nebulosa, galáxia, telescópio.
**Vídeo pronto:** `videos/misterios.mp4`.

## Capítulos

1. **Pulsares** — supergigante → supernova → estrela de nêutrons do tamanho de uma cidade (~20 km); colher de chá ≈ 1 bilhão de
   toneladas; farol de rádio; 716 voltas por segundo; Jocelyn Bell, 1967, "homenzinhos verdes" (LGM-1); Caranguejo (30 voltas/s),
   explosão vista pelos chineses em 1054, de dia.
2. **Quasares** — buraco negro bilhões de vezes o Sol, disco mais brilhante que a galáxia; 3C 273 (2,5 bilhões de anos-luz,
   ~4 trilhões de sóis, visível com telescópio amador); recorde de 2024 (J0529-4351): 500 trilhões de sóis, come ~1 Sol por dia.
3. **Os Pilares da Criação** — Nebulosa da Águia (~7.000 anos-luz), Hubble 1995, ~4 anos-luz de altura, berçário de estrelas,
   James Webb 2022 (comparação lado a lado), hipótese de destruição (nunca confirmada).
4. **A Galáxia Sombreiro** — ~30 milhões de anos-luz, "chapéu mexicano", ~50.000 anos-luz, ~2.000 aglomerados globulares,
   buraco negro de ~1 bilhão de sóis; no infravermelho do Webb, um "alvo" (anel de poeira).
5. **O maior mistério** — só ~5% é matéria comum; ~27% matéria escura, ~68% energia escura.

## Imagens

- **Pilares da Criação** e **Galáxia Sombreiro:** fotos reais mandadas pelo Anderson (`fotos/`), animadas com zoom lento,
  estrelas cintilando e vapor nas pontas dos pilares; versão "Webb" com tons dourados, mais estrelas e protoestrelas vermelhas.
- Sombreiro no infravermelho: anel de poeira em grumos branco-azulados, como a imagem do Webb/MIRI.
- Telescópio amador detalhado (refrator, buscadora, ocular, montagem equatorial, contrapeso, tripé) e Hubble detalhado
  (isolamento prateado, painéis solares, porta da abertura, antenas).

## Como gerar

```
python3 narracao.py <pasta>/nar && python3 alinhar.py <pasta> && python3 tempos.py
python3 efeitos.py <pasta>/sfx && python3 audio.py <pasta> <pasta>/audio.wav
node render.js <pasta>/video.mp4
```
