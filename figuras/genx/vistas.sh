#!/bin/sh
# Gera as 9 vistas do GEnx-2B (giro de 190° a 350°) nos dois temas, 4 de cada vez.
cd "$(dirname "$0")/../.."
for az in 190 210 230 250 270 290 310 330 350; do
  for t in escuro claro; do echo "$az $t"; done
done | xargs -P 4 -L 1 sh -c 'if [ "$1" = claro ]; then node figuras/genx/build.mjs --az $0 --light; else node figuras/genx/build.mjs --az $0; fi | tail -1'
