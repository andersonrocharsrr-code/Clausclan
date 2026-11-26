#!/bin/bash
# Render completo em 3 partes paralelas → concatena → mux com o som.
cd "$(dirname "$0")"
for p in 0 1; do python3 render.py full $p 4 > out/render$p.log 2>&1 & done; wait
for p in 2 3; do python3 render.py full $p 4 > out/render$p.log 2>&1 & done; wait
printf "file 'parte0.mp4'\nfile 'parte1.mp4'\nfile 'parte2.mp4'\nfile 'parte3.mp4'\n" > out/lista.txt
ffmpeg -v error -y -f concat -safe 0 -i out/lista.txt -c copy out/video.mp4
ffmpeg -v error -y -i out/video.mp4 -i out/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -movflags +faststart -shortest ../alem-do-universo.mp4
echo FIM
