# A Revolução Industrial em Londres — roteiro (3:50)

**Formato:** vertical 1080×1920 (TikTok), 30 qps, 229 s. As cenas são desenhadas num mundo 1920×1080 e a câmera passeia por ele com zoom 1,5; embaixo fica a faixa escura da legenda. **Modelo:** Recorte Dourado (planos de luz e sombra, grão de papel, placas que se
escrevem, cartões de capítulo, legenda palavra por palavra), com **paleta própria "Fuligem"**, escura e sombria, no clima de Londres:
fuligem, carvão, ardósia, névoa cinza-esverdeada e amarela ("sopa de ervilha"), tijolo escurecido, Tâmisa barrento,
verde-garrafa e a única luz quente, o **âmbar dos lampiões a gás**. Chuva fina, fumaça de chaminé e névoa passando.
**Voz:** Rodrigo Custódio (ElevenLabs), velocidade 1,1. **Transições suaves:** névoa que passa, escuro, luz âmbar, cortina de borda macia, zoom lento, círculo de borda macia e deslizar com fusão.
**Trilha:** cordas e violoncelos graves, coro baixo, tique-taque de máquina, tímpanos e sinos; efeitos de cascos nos
paralelepípedos, máquina a vapor, fábrica, docas, rio, chuva, trem, túnel, apito, sino, relógio, multidão, cachorro e pombos.
**Vídeo pronto:** `videos/londres-industrial.mp4`.

## Personagens e bichos (detalhados)

Pessoas com rosto completo (olhos com íris e brilho, sobrancelhas, nariz, boca, orelhas, costeletas, bigode, barba, rugas,
fuligem no rosto), chapéus da época (cartola, chapéu-coco, boné, touca com laço, capacete de policial, peruca do século XVIII)
e roupas (casaca com colete e gravata, mangas de camisa e colete, vestido com xale e avental, farda de policial, menino descalço).
Personagens: James Watt, John Snow, Joseph Bazalgette, estivadores, limpador de chaminé, jornaleiro, acendedor de lampião,
operários, meninas dos fósforos, policial. Bichos: cavalos com coelheira, antolhos e rédeas; cachorros, gato listrado, pombos e ratos.
Cenários: casas de tijolo geminadas com chaminés, lojas, fábricas com telhado em serra, armazéns das docas, guindastes,
veleiros e vapores, ônibus a cavalo de dois andares, cabriolé, carroça, locomotiva, máquina a vapor de balancim, São Paulo,
Parlamento com a torre do relógio, Palácio de Cristal, túneis de tijolo, bomba d'água de Broad Street e Tower Bridge.

## Lugares (cada cena num canto diferente da cidade)

Rua em perspectiva até o domo de São Paulo · colina com bosque olhando a cidade · mar de telhados · ponte de pedra com tráfego ·
mercado coberto com barracas · praça georgiana com jardim à noite · viaduto de trem com lojas nos arcos · cais do Tâmisa na névoa ·
casas antigas de madeira no Soho · praça com igreja e taverna · casarões brancos · portão da fábrica de fósforos · parque com coreto e
escola · beco de cortiço com varais · teatro iluminado · docas, cais com fardos (os estivadores carregam fardos de algodão nas costas).

## Fatos usados

| Item | Valor |
| --- | --- |
| Início | Grã-Bretanha, por volta de 1760; James Watt (escocês, 1736–1819) aperfeiçoou a máquina a vapor |
| População | Londres ≈ 1 milhão em 1801; mais de 6 milhões por volta de 1900 (Grande Londres) |
| Docas | West India Docks (1802); algodão, açúcar, chá, madeira |
| Ruas | ônibus a cavalo, cabriolés, carroças; iluminação a gás desde o início do século |
| Trabalho | jornadas de 12 a 14 horas; crianças limpando chaminés, vendendo jornais, nas fábricas |
| Névoa | "pea-souper" (sopa de ervilha), causada pela fumaça do carvão |
| Cólera | Soho, 1854; John Snow ligou as mortes à bomba de Broad Street e a alavanca foi retirada |
| Grande Fedor | 1858; Joseph Bazalgette construiu os esgotos (1859–1875), em uso até hoje |
| Grande Exposição | 1851, Palácio de Cristal (Hyde Park), cerca de 6 milhões de visitantes |
| Metrô | Metropolitan Railway, 1863, o primeiro do mundo, com trens a vapor |
| Greves | meninas dos fósforos (Bow, 1888, fósforo branco), greve das docas (1889) |
| Leis | Factory Acts (crianças fora das fábricas, menos horas), escolas, água limpa |

## Capítulos

1. **O Vapor** — máquina a vapor, Watt, carvão, fábricas, navios e trens.
2. **A Cidade** — população, docas, chaminés, ruas com cavalos, lampiões.
3. **O Preço** — fábrica, crianças, cortiços, névoa, rio-esgoto, cólera, Grande Fedor, esgotos.
4. **O Futuro** — Palácio de Cristal, metrô, greves, novas leis, final com Tower Bridge ao entardecer.

## Como refazer

```
python3 narracao.py <pasta>/nar && python3 alinhar.py <pasta> && python3 tempos.py <pasta>
python3 efeitos.py <pasta>/sfx && python3 audio.py <pasta> <pasta>/audio.wav
node render.js <pasta>/video.mp4
ffmpeg -i <pasta>/video.mp4 -i <pasta>/audio.wav -c:v libx264 -preset slow -crf 25 -maxrate 4000k -bufsize 8000k -pix_fmt yuv420p -c:a aac -b:a 192k -shortest ../londres-industrial.mp4
```
