# Companhia do Frio — vídeo de 35 s (vertical, para Reels/Status)

Mesmo estilo do comercial do Caixa (texto entrando palavra por palavra, selos, pops), nas cores da marca:
azul-noite, faixas azuis diagonais e neve caindo. Mascote real (floco de neve técnico) recortado do PNG da empresa.

| Tempo | Cena | Na tela | Narração |
|---|---|---|---|
| 0–5,5 | Abertura | "Seu freezer ou geladeira deu problema?", termômetro subindo; entra a logo e o mascote | "Seu freezer ou geladeira deu problema? Chama a Companhia do Frio!" |
| 5,5–11,5 | 1 · LED | Foto do serviço → foto do freezer aceso (clarão e brilhos); "Produto aparece muito mais." | "Adaptação de LED: o freezer fica iluminado e o produto aparece muito mais." |
| 11,5–18,6 | 2 · Limpeza | Condensador sujo → cortina revela o limpo; "Volta a gelar como novo!" | "Limpeza do condensador: tira toda a sujeira, e o equipamento volta a gelar como novo." |
| 18,6–23,5 | 3 · Gás | Manifold com dois relógios (baixa/alta), ponteiros firmam; "Medição na hora"; mascote no canto | "Recuperação de gás, com equipamento certo e medição na hora." |
| 23,5–29,2 | 4 · Compressor | Foto do compressor velho sai (✕), o novo entra (✓); rajada de neve; "E o frio volta!" | "Troca de compressor: sai o velho, entra o novo, e o frio volta." |
| 29,2–35 | Final | Logo, "Refrigeração e assistência técnica especializada.", 4 serviços ✓, mascote | "Companhia do Frio. Refrigeração e assistência técnica especializada." |

## Fotos (`fotos/`)
Originais enviadas pelo Anderson (`*-original.*`, `logo-faixa.jpg`, fotos de serviço) e recortes sem fundo
(`mascote.png`, `logo.png`, `logo-frase.png`, `compressor-velho.png`, `compressor-novo.png`).

## Como gerar
```
python3 narracao.py /tmp/voz
python3 audio.py /tmp/voz /tmp/mix.wav
node render.js /tmp/video.mp4                       # 1080×1920, 30 fps
ffmpeg -i /tmp/video.mp4 -i /tmp/mix.wav -c:v libx264 -crf 23 -pix_fmt yuv420p -c:a aac -b:a 192k -af loudnorm=I=-14:TP=-1.5 -shortest -movflags +faststart ../companhia-frio.mp4
```
Quadros soltos: `node render.js --fotos <pasta> 3.8 8.8 16 22.5 28`.
