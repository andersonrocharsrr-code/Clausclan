# Leônidas, o rei de Esparta — roteiro (3:03, vertical)

**Formato:** 1080×1920 (TikTok, Reels, status do WhatsApp), 30 qps, 183 s.
**Modelo:** Recorte Dourado (planos de luz e sombra, grão de papel, placas que se escrevem, legenda palavra por palavra),
com a **paleta "Bronze e Vinho"**: vinho-escuro, terracota, bronze polido, azul do Egeu, oliva, mármore e capa carmim.
Títulos em letras romanas (**Cinzel**, licença OFL) e **faixa grega (meandro)** sob as placas e nos cartões de capítulo.
**Voz:** Rodrigo Custódio (ElevenLabs), velocidade 1,1. **Transições:** escuro, poeira, flash, cortina de bronze, zoom, círculo e deslizar.
**Trilha:** cordas graves, coro, metais e tambores de guerra (sintetizados), em Ré menor; efeitos de vento, marcha,
batalha, flechas, escudos, fogo, mar, remos, corneta e cinzel na pedra.
**Vídeo pronto:** `videos/leonidas.mp4`.

## Os espartanos (desenho)

Capacete coríntio (calota, bochechas até o queixo com a abertura em T, guarda-nariz, olhos visíveis, barba por baixo),
crista de crina — **atravessada no de Leônidas**, de frente para trás nos outros —, couraça muscular de bronze, ptéruges
(tiras de linho), quíton vermelho, grevas de bronze, sandálias, capa carmim, **áspis** com borda de bronze e o **Λ** (lambda)
de Esparta, **dory** (lança de freixo com ponta de ferro e ponteira de bronze). Vistos de frente, de perfil marchando e em combate.
Persas: turbante com faixa no queixo, túnica longa bordada, calças, escudo de vime, aljava e lança com a romã de ouro dos Imortais.

## Fatos usados

| Item | Valor |
| --- | --- |
| Invasão | 480 a.C., Xerxes I, filho de Dario (derrotado em Maratona, 490 a.C.); pontes de barcos no Helesponto |
| Esparta | agogê a partir dos 7 anos; hoplitas |
| Leônidas | filho de Anaxândridas II; irmãos mais velhos Cleômenes e Dorieu; rei por volta de 489 a.C.; casado com Gorgo |
| Termópilas | "Portões Quentes" (fontes de água quente); passagem estreita entre a montanha e o mar |
| Carneia | festa religiosa em honra de Apolo; por isso Esparta mandou só 300 (todos com filhos vivos) |
| Aliados | cerca de 7 mil gregos; no fim ficaram 700 téspios e 400 tebanos |
| Frases | "Molon labe" (Plutarco); Dienekes: "lutaremos à sombra" (Heródoto) |
| Traição | Efialtes mostrou o caminho pelas montanhas; terceiro dia: Leônidas morre |
| Depois | Salamina (480 a.C., no mar) e Plateias (479 a.C., em terra) |
| Epitáfio | Simônides: "Estrangeiro, vá dizer aos espartanos que aqui jazemos, obedientes às suas leis" |
| Hoje | estátua de bronze de Leônidas nas Termópilas, com "ΜΟΛΩΝ ΛΑΒΕ" |

Cuidados: sem violência explícita; a morte de Leônidas aparece como capacete, escudo, lança e capa no chão.

## Cenas

| # | Imagem | Na tela |
| --- | --- | --- |
| 0–2 | Exército persa ao pôr do sol; as Termópilas do alto; Leônidas com a crista atravessada | 480 a.C. · LEÔNIDAS · REI DE ESPARTA |
| 3–5 | Cap. 1 Esparta: o menino sai de casa; meninos treinando na neve; o hoplita com as peças apontadas | AGOGÊ · LUTA · FOME · FRIO · DISCIPLINA · HOPLITA |
| 6–8 | Três irmãos em quadros; Leônidas rei; Gorgo | O TERCEIRO FILHO · REI DE ESPARTA · GORGO |
| 9–10 | Cap. 2 O Império: Xerxes no trono em Persépolis; a ponte de barcos | XERXES I · HELESPONTO |
| 11–13 | Cap. 3 Termópilas: o mapa com as rotas; a passagem estreita; a festa de Carneia | O PLANO · PORTÕES QUENTES · FESTA DE CARNEIA |
| 14–15 | Os 300 marchando; aliados com outros escudos | 300 ESPARTANOS · + 7.000 |
| 16–19 | O mensageiro persa; o capacete de perto; flechas cobrindo o sol | ENTREGUEM AS ARMAS · MOLON LABE · LUTAREMOS À SOMBRA |
| 20–23 | Ondas de persas; a falange de frente; os Imortais; o choque | EM ONDAS · A FALANGE · OS IMORTAIS · BARRADOS |
| 24–28 | Efialtes guia os persas à noite; esquema do cerco; os aliados partem; o último dia; o capacete no chão | EFIALTES · CERCADOS · 300 / 700 / 400 · LEÔNIDAS |
| 29–32 | Cap. 4 O Legado: persas passam; Salamina; Plateias; o mapa | SALAMINA · PLATEIAS · A GRÉCIA RESISTIU |
| 33–36 | A pedra com o epitáfio; a estátua de bronze; o pedestal | SIMÔNIDES · TERMÓPILAS, HOJE · MOLON LABE |

## Como refazer

```
python3 narracao.py <pasta>/nar && python3 alinhar.py <pasta> && python3 tempos.py <pasta>
python3 efeitos.py <pasta>/sfx && python3 audio.py <pasta> <pasta>/audio.wav
node render.js <pasta>/video.mp4
ffmpeg -i <pasta>/video.mp4 -i <pasta>/audio.wav -c:v libx264 -preset slow -crf 23 -maxrate 4000k -bufsize 8000k -pix_fmt yuv420p -c:a aac -b:a 192k -shortest ../leonidas.mp4
```
Desenhos: `figuras.js` (hoplitas, persas, Xerxes, Gorgo, meninos), `cenarios.js` (céus, Termópilas, Esparta, Persépolis, mapa, trirremes), `cenas.js`.
