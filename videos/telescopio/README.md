# Telescópio (zoom realista no espaço)

Zoom contínuo "de telescópio": Júpiter ao fundo, uma lua pequena na frente, e a câmera aproxima até as crateras encherem a tela.
Tudo é desenhado por computador (shader WebGL em `index.html`), sem fotos.

- Vídeo mudo: `node render.js saida.mp4 1080 30` (≈3,5 s por quadro neste servidor)
- Quadros de teste: `node render.js teste.png 540 30 "0,6,10,15"`
- Som: `python3 audio.py som.wav` e juntar com ffmpeg.
