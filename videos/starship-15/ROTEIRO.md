# Starship · Voo 15 — roteiro (1 min 30 s)

Animação realista em 2D, narração em pt-BR (ElevenLabs, voz Rodrigo Custódio), 1920×1080, 30 qps.
Vídeo pronto: `videos/starship-15.mp4`.

Números usados (voo de 13/11/2026, Starbase, Texas — Starship versão 3):

| Item | Valor |
| --- | --- |
| Altura total | 124 m (propulsor 72 m + nave 52 m) |
| Largura | 9 m |
| Peso abastecida | cerca de 5.300 t |
| Motores | 33 Raptor 3 no propulsor + 6 na nave |
| Combustível | metano líquido + oxigênio líquido |
| Empuxo na decolagem | mais de 9.000 t |
| Missão | 26 satélites Starlink a 275 km, 14 voltas, 22h30 no espaço |
| Resultado | nave 42 agarrada pela torre em 14/11; propulsor 22 abortou a captura e caiu no mar |

Peso e empuxo variam um pouco de fonte para fonte; por isso a narração diz "cerca de" e "mais de".

## Cenas e narração

| Tempo | Cena | Na tela | Narração |
| --- | --- | --- | --- |
| 0:00 | **Abertura (estilo rápido).** Starbase no fim da tarde, a câmera avança rápido até o foguete. | STARBASE · TEXAS / 13 DE NOVEMBRO DE 2026 | Treze de novembro de 2026. |
| 0:04 | De perto, a câmera sobe pelo foguete na torre, com vapor saindo dos tanques. | STARSHIP · 15º VOO / O MAIOR FOGUETE JÁ CONSTRUÍDO | No sul do Texas, o maior foguete já construído está pronto para o seu décimo quinto voo. |
| 0:09 | **CAPÍTULO 1 · O GIGANTE.** Foguete em pé; a régua sobe até 124 m, aparece o prédio de 40 andares e a largura. | 124 m DE ALTURA · PRÉDIO DE 40 ANDARES 120 m · 9 m DE LARGURA | A Starship tem cento e vinte e quatro metros de altura, mais que um prédio de quarenta andares, e nove metros de largura. |
| 0:18 | As duas partes se separam um pouco, cada uma com a sua medida. | SUPER HEAVY, O PROPULSOR, 72 m · STARSHIP, A NAVE, 52 m | São duas partes: o propulsor Super Heavy, com setenta e dois metros, e a nave, com cinquenta e dois. |
| 0:25 | Abastecimento: o gelo sobe pelos tanques e o contador de peso dispara. | 5.300 t · ≈ 13 JUMBOS 747 CARREGADOS | Abastecida, pesa cerca de cinco mil e trezentas toneladas. |
| 0:30 | **CAPÍTULO 2 · A FORÇA.** Os 33 motores vistos por baixo, acendendo anel por anel. | 33 MOTORES RAPTOR 3 · METANO LÍQUIDO + OXIGÊNIO LÍQUIDO | Na base, trinta e três motores Raptor três queimam metano e oxigênio líquidos. |
| 0:36 | Decolagem (estilo rápido): fogo, fumaça e a tela tremendo. | MAIS DE 9.000 t DE EMPUXO NA DECOLAGEM | Juntos, empurram com mais de nove mil toneladas de força. |
| 0:41 | No alto, o propulsor fica para trás e a nave segue sozinha. | A NAVE · 6 MOTORES / RUMO À ÓRBITA | A nave leva outros seis motores para chegar à órbita. |
| 0:45 | **CAPÍTULO 3 · A MISSÃO.** Em órbita, os satélites saem pela fenda, um a um. | SATÉLITES STARLINK: 26/26 · ALTITUDE: 275 km | A missão: levar vinte e seis satélites Starlink a duzentos e setenta e cinco quilômetros de altura, |
| 0:51 | Globo com a órbita e o contador de voltas. | VOLTAS NA TERRA 14/14 · 22H30 NO ESPAÇO | dar catorze voltas na Terra |
| 0:54 | A torre de braços abertos; a câmera avança rápido (estilo rápido). | DE VOLTA PARA A TORRE / PELA PRIMEIRA VEZ | e, pela primeira vez, trazer a nave de volta para a torre de lançamento. |
| 1:00 | **CAPÍTULO 4 · POUSAR SOZINHO.** A nave na mira do computador, com a rota até a torre. | NINGUÉM PILOTA · PILOTO AUTOMÁTICO · altitude e velocidade | Ninguém pilota. Os computadores de bordo guiam tudo. |
| 1:04 | Reentrada: a barriga preta em brasa, a Terra embaixo. | REENTRADA DE BARRIGA / FREANDO NO AR | A nave reentra de barriga, freando no ar. |
| 1:08 | Queda de barriga, os motores acendem e a nave vira de pé. | LIGA OS MOTORES / E VIRA DE PÉ | Perto do chão, liga os motores, vira de pé e desce devagar, |
| 1:12 | A nave desce e os braços da torre fecham. | AGARRADA NO AR / PELOS BRAÇOS DA TORRE | até ser agarrada pelos braços da torre. |
| 1:16 | A nave pendurada na torre; a câmera se afasta. | 14 DE NOVEMBRO DE 2026 / NAVE 42 · 22H30 NO ESPAÇO | Depois de vinte e duas horas e meia no espaço, a nave quarenta e dois pousou nos braços da torre. |
| 1:23 | **Volta ao dia anterior, em sépia:** o propulsor cai no mar. | PROPULSOR 22 / CAPTURA ABORTADA · CAIU NO MAR | O propulsor se perdeu no mar. |
| 1:25 | Pôr do sol, a nave na torre. Final. | A PRIMEIRA NAVE A VOLTAR DA ÓRBITA PARA CASA | Mas, pela primeira vez, uma nave voltou da órbita para casa. |

## Como refazer

```
python3 narracao.py <pasta>/nar          # narração (ElevenLabs)
# efeitos sonoros: ElevenLabs sound-generation em <pasta>/sfx (launch, ignite, wind, reentry, burn, splash)
node render.js <pasta>/video.mp4         # imagem (Playwright + ffmpeg)
python3 audio.py <pasta> <pasta>/audio.wav
ffmpeg -i <pasta>/video.mp4 -i <pasta>/audio.wav -c:v copy -c:a aac -b:a 192k -shortest ../starship-15.mp4
```

`index.html` aberto no navegador mostra a prévia sem som. As cenas ficam em `cenas.js` e o desenho (foguete, torre, chamas, textos) em `motor.js`.
