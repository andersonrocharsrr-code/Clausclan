# A história do dinheiro — pixel art (3:43, vertical)

**Formato:** 1080×1920 (TikTok), 30 qps, 222,7 s. Desenhado numa tela de 180×320 pixels e ampliado 6× (pixel art), linhas de TV,
transição em pontilhado de pixels, fonte Pixelify Sans, legenda palavra por palavra, 8 capítulos com cartão e moeda girando.
**Voz:** Rodrigo Custódio (ElevenLabs), velocidade 1,2. **Som:** trilha chiptune 8-bit que muda a cada capítulo; efeitos de moeda,
máquina de escrever, martelo, impressora, corrente rompendo.
**Vídeo pronto:** `videos/dinheiro.mp4`.

## Capítulos

| # | Capítulo | Conteúdo |
| --- | --- | --- |
| — | Abertura | Café pago no celular; milhares de anos sem dinheiro |
| 1 | A troca | Escambo (peixe por trigo); o problema da troca; gado, grãos, conchas e sal; *pecus* → pecuniário; sal → salário (tradição) |
| 2 | As primeiras contas | Mesopotâmia (~5.000 anos): templos com cevada e prata, dívidas em tabuletas de barro, o siclo; a escrita e as contas |
| 3 | As moedas | Lídia (~600 a.C., hoje Turquia), electro com leão; dracma e denário; Juno Moneta → moeda; moedas chinesas com furo |
| 4 | O papel-moeda | China (há quase mil anos); Marco Polo espantado; imprimir demais = inflação |
| 5 | Os bancos | Cambistas em bancos de madeira (banca); os Médici; carta de crédito Florença → Londres |
| 6 | A prata que rodou o mundo | Potosí (Bolívia), peso de oito, primeira moeda global (América, Europa, China); trabalho forçado indígena |
| 7 | A confiança | Papel trocado por ouro; 1944, dólar preso ao ouro; 1971, fim da troca; o dinheiro vale porque confiamos; Brasil com 9 moedas, março de 1990 (+80% num mês), Plano Real (1994) |
| 8 | O dinheiro digital | Números em computadores; cartões, bitcoin (2009), Pix (2020); final: o dinheiro é um acordo |

## Como gerar

```
python3 narracao.py <p>/nar && python3 alinhar.py <p> && python3 tempos.py <p>
python3 audio.py <p> <p>/audio.wav && node render.js <p>/video.mp4
```
