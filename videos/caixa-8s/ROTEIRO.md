# App Caixa — vídeo de 8 s (vertical, para Reels/Status)

Estilo de comercial curto: fundo claro, texto grande que entra palavra por palavra, bonecos fofos
desenhados com volume (folha de papel aflita e a caixinha azul do ícone), sons de pop/whoosh e música animada.

| Tempo | Cena | Na tela | Narração |
|---|---|---|---|
| 0,0–2,5 | 1 | Folha aflita no meio da papelada; "Fechar o caixa no papel?" e carimbo vermelho "Nunca mais." (papéis voam, a folha sorri) | "Fechar o caixa no papel? Nunca mais." |
| 2,5–5,15 | 2 | Celular com o app; microfone ouvindo; notas entram (Raimunda, Francisca, Ana Paula) e o total sobe até R$ 1.000; "Você fala, ele soma." | "No app Caixa, você fala e ele soma tudo." |
| 5,15–6,75 | 3 | Caixinha pula, moedas e confete; "Fechou!"; cartão "Caixa da semana R$ 1.000" ✓ | "Fechou!" |
| 6,75–8,0 | 4 | Ícone do app, "Caixa", "Você fala. Ele fecha o caixa.", botão "Baixe o app" | — |

## Como gerar

```
python3 narracao.py /tmp/voz                 # voz (ElevenLabs, Rodrigo Custódio)
python3 audio.py /tmp/voz /tmp/mix.wav       # música + efeitos + voz
node render.js /tmp/video.mp4                # quadros (1080×1920, 30 fps)
ffmpeg -i /tmp/video.mp4 -i /tmp/mix.wav -c:v copy -c:a aac -b:a 192k -af loudnorm=I=-14:TP=-1.5 -shortest -movflags +faststart ../caixa-8s.mp4
```
Quadros soltos para conferir: `node render.js --fotos <pasta> 1.2 3.6 5.6`.
