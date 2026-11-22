# A vastidão do universo observável — roteiro (4:30, vertical)

**Formato:** 1080×1920 (TikTok), 30 qps, 271,8 s. **Modelo:** Recorte Dourado (padrão da Starship): paleta ocre, creme,
dourado e azul-ardósia sobre o espaço, grão de papel, placas que se escrevem, 4 capítulos, legenda palavra por palavra.
**Voz:** Rodrigo Custódio (ElevenLabs), velocidade 1,0 (ritmo de documentário). **Transições suaves.**
**Trilha:** pads, cordas, coro e sininhos; efeitos de espaço profundo, noite, Sol, buraco negro, coro cósmico, colisão, mar, luz.
**Vídeo pronto:** `videos/universo.mp4`.

## Desenhos principais

Galáxias espirais de partículas (braços azulados, núcleo dourado, poeira e nebulosas rosadas), Andrômeda inclinada, fusão das
galáxias, buraco negro com disco de acreção, lente gravitacional, anéis de fótons e estrelas curvadas; James Webb com 18 espelhos,
tripé, escudo solar de 5 camadas, painel e antena; campo profundo com centenas de galáxias e estrelas de 6 pontas; teia cósmica;
Laniakea em correntes; radiação cósmica de fundo; Terra com continentes reais, nuvens e lado noturno; planetas; Nuvem de Oort;
laranja e grão de areia; mapa do Brasil (Rio Branco → São Paulo); mão com o Sistema Solar.

## Fatos usados

| Item | Valor |
| --- | --- |
| Terra | 12.742 km de diâmetro; Lua a 384.400 km (todos os outros planetas cabem enfileirados nesse espaço) |
| Sol | ~109 vezes o diâmetro da Terra; ~1,3 milhão de Terras dentro; luz leva ~8 min 20 s |
| Netuno | ~4,5 bilhões de km do Sol (~4 horas-luz); Nuvem de Oort pode passar de 1 ano-luz |
| Escala | Sol = laranja (10 cm) → Terra = grão de areia a ~10 m; Próxima Centauri = laranja a ~3.000 km |
| Via Láctea | centenas de bilhões de estrelas; ~100 mil anos-luz; Sol a ~26 mil anos-luz do centro; Sagitário A* (~4 milhões de sóis); volta em ~230 milhões de anos; se fosse do tamanho do Brasil, o Sistema Solar até Netuno teria ~4 cm |
| Andrômeda | ~2,5 milhões de anos-luz; ~1 trilhão de estrelas; visível a olho nu; pode se fundir com a Via Láctea em alguns bilhões de anos |
| Grupo Local / Laniakea | dezenas de galáxias / ~100 mil galáxias em ~500 milhões de anos-luz ("céu imenso" em havaiano) |
| James Webb (2022) | campo do tamanho de um grão de areia no braço esticado, com milhares de galáxias |
| Universo observável | ~93 bilhões de anos-luz; centenas de bilhões de galáxias; idade 13,8 bilhões de anos; expansão do espaço; radiação de fundo de ~380 mil anos após o Big Bang |

## Como refazer

```
python3 narracao.py <pasta>/nar && python3 alinhar.py <pasta> && python3 tempos.py <pasta>
python3 efeitos.py <pasta>/sfx && python3 audio.py <pasta> <pasta>/audio.wav
node render.js <pasta>/video.mp4
ffmpeg -i <pasta>/video.mp4 -i <pasta>/audio.wav -c:v libx264 -preset slow -crf 25 -maxrate 3800k -bufsize 7600k -pix_fmt yuv420p -c:a aac -b:a 192k -shortest ../universo.mp4
```
