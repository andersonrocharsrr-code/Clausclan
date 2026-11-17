# Recorte Dourado — o modelo de animação dos nossos vídeos

Nome do estilo aprovado pelo Anderson em nov/2026. Quando ele pedir "no estilo Recorte Dourado"
(ou "no padrão do vídeo da Starship"), é este aqui.

Exemplo pronto: `videos/starship-15.mp4` — código em `videos/starship-15/`.

## Como é o visual

- **Desenho plano, tipo recorte de papel.** Cada objeto tem 3 a 5 planos de cor com borda reta
  (sombra, meio-tom, luz). Nada de esfumaçado: fumaça, nuvem e chama também são formas planas.
- **Paleta quente.** Ocre, creme e dourado; azul-ardósia no céu, no mar e no espaço; preto-tinta
  (`#14161d`) nas sombras. Dourado dos destaques: `#f0b94a`; traços: `#d9b35a`; texto: `#fff6e0`.
- **Cena escura com o objeto surgindo.** Fundo quase preto, peça em bronze, brilho quente acendendo aos poucos
  (ex.: os 33 motores).
- **Grão de papel** por cima de tudo e cantos escurecidos.
- **Câmera calma:** avanço ou afastamento lento; corte seco entre as cenas.
- **Pessoas** em formas planas, de costas ou de lado, braços para baixo ou segurando algo; capim balançando na frente.

## Textos

- Fonte **Fira Sans Extra Condensed** (pesos 600 e 800), tudo em maiúsculas, com sombra suave (sem caixa atrás).
- **Legenda no rodapé, palavra por palavra:** a frase já tem o lugar marcado e cada palavra entra na hora em que
  é dita; **uma** palavra em dourado por frase; números por extenso, como na narração.
- **Placa no canto de cima:** título que se escreve letra por letra, traço dourado embaixo e uma linha menor.
- **Cartão de capítulo:** tela escura, "CAPÍTULO N" em dourado e o título grande em creme.
- Números e medidas grandes na própria cena (ex.: `124 m`, `5.300 t`), fora da faixa da legenda (y < 800).

## Som

Narração ElevenLabs (voz Rodrigo Custódio), cordas calmas, tímpano nos cortes, efeitos com agudos cortados
(sem chiado). Música e efeitos abaixam sozinhos quando a voz entra.

## Como fazer um vídeo novo neste estilo

1. Copie `videos/starship-15/` para `videos/<assunto>/`.
2. Escreva as falas em `narracao.py` e gere o áudio. Meça a duração de cada fala para marcar os cortes.
3. Gere o tempo de cada palavra (ElevenLabs *forced-alignment* → `palavras.json`) e rode `legendas.py`.
4. Em `cenas.js`, troque as cenas (`shot(início, fim, desenho)`) e a lista `CUTS`.
   Em `motor.js`, aproveite o que é do estilo e troque só os desenhos do assunto:
   - do estilo (reaproveitar): `bands`, `disc`, `pill`, `glow`, `sky`, `sunGlow`, `cloudsBand`, `stars`, `grass`,
     `person`, `smokeRoll`, `plume`, `typeText`, `chapter`, `label`, `dim`, `legenda`, `finish`, `sepia`;
   - do assunto (trocar): `booster`, `ship`, `tower`, `mesa`, `earthLimb`, `farBuildings`.
5. Confira quadros soltos: `node render.js --fotos <pasta> 2 10 20 ...`
6. Renderize, mixe e junte (comandos no fim de `videos/starship-15/ROTEIRO.md`).
   O grão pesa no arquivo: use `-crf 27 -maxrate 3500k` para ficar perto de 25 MB em 1 min 30 s.
7. Escreva o `ROTEIRO.md` do vídeo (tabela tempo / cena / na tela / narração).
