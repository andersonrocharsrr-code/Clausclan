#!/bin/bash
# Depois de reinício do contêiner: refaz partes 2 e 3 (já com a câmera corrigida) e as viagens 4 e 5,
# junta tudo e encaixa as viagens 1–5 (partes 0 e 1 foram feitas antes da correção).
cd "$(dirname "$0")"
python3 render.py full 2 4 > out/render2.log 2>&1 &
python3 render.py full 3 4 > out/render3.log 2>&1 &
python3 render.py voos 4 5 > out/voos.log 2>&1 &
wait
printf '[["voo1.mp4",418],["voo2.mp4",1084],["voo3.mp4",1763],["voo4.mp4",%s],["voo5.mp4",%s]]' $(grep '^voo4' out/voos.log | cut -d' ' -f2) $(grep '^voo5' out/voos.log | cut -d' ' -f2) > out/voos.json
printf "file 'parte0.mp4'\nfile 'parte1.mp4'\nfile 'parte2.mp4'\nfile 'parte3.mp4'\n" > out/lista.txt
ffmpeg -v error -y -f concat -safe 0 -i out/lista.txt -c copy out/video.mp4
python3 juntar.py && echo FIM
