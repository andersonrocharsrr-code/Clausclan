# Voyager 1: um dia-luz da Terra — roteiro (3:51, vertical)

**Formato:** 1080×1920 (TikTok), 30 qps, 231 s. **Modelo:** Recorte Dourado (padrão da Starship): planos de luz e sombra,
grão de papel, paleta ocre, creme, dourado e azul-ardósia, placas que se escrevem, cartões de capítulo e legenda palavra por palavra.
**Voz:** Rodrigo Custódio (ElevenLabs), velocidade 1,1. **Transições suaves:** névoa, escuro, luz dourada, cortina, zoom, círculo e deslizar.
**Trilha:** pads de sintetizador, cordas, coro suave e sininhos em arpejo (Ré maior); efeitos de espaço profundo, telemetria,
lançamento, ondas de plasma, disco de vinil, vento e chuva, carro, avião, geladeira, antena e relógio.
**Vídeo pronto:** `videos/voyager.mp4`.

## Fatos usados

| Item | Valor |
| --- | --- |
| Marco | Voyager 1 a 1 dia-luz da Terra em 18/11/2026 (~10h16 UTC), ≈ 26 bilhões de km; primeiro objeto humano |
| Lançamentos | Voyager 2: 20/08/1977; Voyager 1: 05/09/1977 (rota mais rápida), foguete Titan IIIE-Centaur, Cabo Canaveral |
| Nave | ≈ 800 kg; antena de 3,7 m; geradores de plutônio-238; plataforma de câmeras; haste do magnetômetro |
| Rota | alinhamento que se repete a cada ~175 anos; estilingue gravitacional |
| Planetas | Júpiter 1979 (vulcões em Io), Saturno 1980–81 (anéis, Titã); Voyager 2: Urano 1986 e Netuno 1989 |
| Disco de ouro | sons, música, imagens e saudações em 55 línguas |
| 1990 | "pálido ponto azul", a ~6 bilhões de km |
| 2012 | heliopausa; espaço interestelar |
| Dia-luz | luz ≈ 300.000 km/s (7,5 voltas na Terra por segundo); 24 h de luz ≈ 26 bilhões de km |
| Exemplos | Lua ≈ 1,3 s; Sol ≈ 8 min; Netuno ≈ 4 h; Voyager 1: 1 dia; carro a 100 km/h ≈ 29.600 anos; avião a 900 km/h ≈ 3.300 anos; Voyager a ≈ 61.000 km/h: 49 anos |
| Comunicação | 1 dia para ir e 1 para voltar; transmissor ≈ 23 W (lâmpada de geladeira); antenas de 70 m na Califórnia, Espanha e Austrália |
| Energia | plutônio, perde ~4 W por ano; 2 de 10 instrumentos ligados (magnetômetro e ondas de plasma) |
| Próxima Centauri | ≈ 4,2 anos-luz (≈ 1.500 dias-luz); mais de 70 mil anos no ritmo da Voyager |

Fontes: NASA/JPL, EarthSky, The Conversation, Space.com, Al Jazeera (nov/2026).

## Capítulos

1. **A Missão** — lançamento, as sondas gêmeas, a nave por dentro, alinhamento, estilingue, Júpiter, Saturno, Urano e Netuno, disco de ouro, pálido ponto azul, heliopausa.
2. **O Dia-Luz** — a velocidade da luz, 7,5 voltas na Terra, o relógio de 24 h, a escada da luz (Lua, Sol, Netuno, Voyager), carro, avião e Voyager, a conversa de 2 dias, a lâmpada de geladeira e as antenas.
3. **O Futuro** — plutônio, instrumentos desligados, Próxima Centauri, computadores de 1977 e o final.

## Como refazer

```
python3 narracao.py <pasta>/nar && python3 alinhar.py <pasta> && python3 tempos.py <pasta>
python3 efeitos.py <pasta>/sfx && python3 audio.py <pasta> <pasta>/audio.wav
node render.js <pasta>/video.mp4
ffmpeg -i <pasta>/video.mp4 -i <pasta>/audio.wav -c:v libx264 -preset slow -crf 24 -maxrate 3800k -bufsize 7600k -pix_fmt yuv420p -c:a aac -b:a 192k -shortest ../voyager.mp4
```
