# O boato do apagão de 17 de novembro — roteiro (2:10, vertical)

**Formato:** 1080×1920 (TikTok, Reels, status do WhatsApp), 30 qps, 131 s.
**Modelo:** Recorte Dourado (planos de luz e sombra, grão de papel, placas que se escrevem, legenda palavra por palavra),
com a **paleta "Elétrica"**: azul-noite e aço, âmbar das lâmpadas, ciano de tela, vermelho de alerta e verde de "checado".
**Voz:** Rodrigo Custódio (ElevenLabs), velocidade 1,1 (um pouco mais rápida). Legenda no meio da parte de baixo,
acima dos botões do TikTok. **Transições** variadas em todo corte: deslizar, apagão (piscar e escurecer), flash, glitch,
cortina com faixa âmbar, zoom, círculo.
**Trilha:** pulso eletrônico tenso (Lá menor, 112 bpm) na primeira metade; silêncio e carimbo "FALSO" na virada;
depois a mesma batida mais clara (Dó maior, com sinos). Efeitos: zumbido elétrico, queda de energia, notificações,
chiado de TV, rádio, alerta, chuva, carimbo.
**Vídeo pronto:** `videos/apagao.mp4`.

## Estrutura

1. **O boato (0:00–1:05):** apresenta o apagão como foi espalhado e reúne as "pistas".
2. **Virada (1:05):** "Só que nada disso é verdade" — carimbo FALSO.
3. **A checagem (1:08–2:10):** cada pista desmentida, na mesma ordem.

## Fatos usados (checagens de Exame, Terra, Boatos.org, Defesa Civil, nov/2026)

| Pista do boato | O que é de verdade |
| --- | --- |
| Apagão mundial na terça, 17/11/2026, por até 90 dias, espalhado no TikTok, X, Facebook e Instagram (milhões de visualizações) | Não houve apagão; o dia passou normalmente |
| Os Simpsons: cena do diário da Lisa com "17 de novembro" e uma tempestade (episódio de 2023) | O episódio não fala em 2026 nem em apagão mundial |
| Postagem atribuída ao Google mandando ver o fim do episódio | A postagem era falsa |
| Teste nacional do sistema de alerta de emergência dos EUA (FEMA/FCC) no dia 17 | Teste de rotina exigido por lei; a FEMA disse que não desliga energia nem internet |
| Defesa Civil orientando kit de água, comida e remédios para 72 horas | Prevenção contra enchentes e temporais; nota: "Não há evidências de que o mundo enfrentará um apagão em 17 de novembro de 2026" |
| "90 dias" | Vem de um plano militar americano para bases funcionarem sem energia de fora, não de um aviso à população |
| — | O ONS não anunciou desligamento; cada país tem a sua rede, e um apagão simultâneo no planeta é praticamente impossível |

Cuidados: sem personagens nem logotipos reais (a TV mostra uma casinha genérica; a postagem é um perfil genérico).

## Cenas

| # | Imagem | Na tela |
| --- | --- | --- |
| 0 | Calendário 17 de novembro sobre a cidade à noite; círculo vermelho no dia | NOVEMBRO 2026 · 17 · TERÇA-FEIRA |
| 1 | Celular com o feed rolando e balões de alerta | NAS REDES SOCIAIS |
| 2 | A cidade apagando prédio por prédio; lâmpada, wi-fi e celular riscados | — |
| 3 | O globo escurecendo | ATÉ 90 DIAS |
| 4 | Nove celulares com o alerta e corações subindo | MILHÕES DE VISUALIZAÇÕES |
| 5 | Os itens do kit caindo na mesa | KIT DE SOBREVIVÊNCIA |
| 6 | Pista 1: TV antiga com um desenho genérico | OS SIMPSONS · EPISÓDIO DE 2023 |
| 7 | O diário: "17 de novembro" e o desenho da tempestade | O DIÁRIO DA LISA |
| 8 | Postagem atribuída ao Google | POSTAGEM |
| 9–10 | Pista 2: torre de rádio; celular vibrando com "ISTO É UM TESTE" | TESTE NACIONAL · ALERTA DE EMERGÊNCIA |
| 11 | Pista 3: kit e relógio de 72 horas | DEFESA CIVIL · ÁGUA · COMIDA · REMÉDIOS |
| 12 | Base militar e bateria de 90 dias | PLANO MILITAR |
| 13 | As pistas se juntam e viram "APAGÃO MUNDIAL" | NASCEU O BOATO |
| 14 | Carimbo | SÓ QUE... · FALSO · VAMOS POR PARTES |
| 15–16 | A TV com a checagem; a postagem com carimbo | FALA EM 2026? NÃO · APAGÃO MUNDIAL? NÃO · FALSA |
| 17–18 | A torre; a cidade acesa com ✓ | TESTE DE ROTINA · EXIGIDO POR LEI · NÃO DESLIGA ENERGIA ✓ INTERNET ✓ |
| 19–20 | Chuva e enchente; a nota da Defesa Civil | PREVENÇÃO · "NÃO HÁ EVIDÊNCIAS DE UM APAGÃO NO DIA 17 DE NOVEMBRO" |
| 21 | Sala de controle com o mapa do Brasil | ONS · NENHUM DESLIGAMENTO ANUNCIADO |
| 22–23 | Globo com redes separadas; interruptor | CADA PAÍS, SUA PRÓPRIA REDE · IMPOSSÍVEL |
| 24–25 | Calendário vira para 18; a cidade acesa | 18 · QUARTA-FEIRA |
| 26 | Lupa sobre a postagem | CONFIRA A FONTE ✓ |

## Como refazer

```
python3 narracao.py <pasta>/nar      # 12 falas, voz Rodrigo Custódio
python3 alinhar.py <pasta>           # corta silêncios e gera palavras.json (forced-alignment)
python3 tempos.py <pasta>            # cortes das 27 cenas e legendas
python3 efeitos.py <pasta>/sfx       # efeitos (ElevenLabs sound-generation)
python3 audio.py <pasta> <pasta>/audio.wav
node render.js <pasta>/video.mp4
ffmpeg -i <pasta>/video.mp4 -i <pasta>/audio.wav -c:v libx264 -preset slow -crf 23 -maxrate 4000k -bufsize 8000k -pix_fmt yuv420p -c:a aac -b:a 192k -shortest ../apagao.mp4
```
