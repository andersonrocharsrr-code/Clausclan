# Figuras interativas

Ilustrações isométricas feitas com a skill Anatomy (`.claude/skills/anatomy`, licença MIT).

Cada pasta tem um `build.mjs` que gera as páginas usadas pelo app em `aviao/assets/`:

    node figuras/pitot/build.mjs          # tema escuro  -> aviao/assets/fig-pitot.html
    node figuras/pitot/build.mjs --light  # tema claro   -> aviao/assets/fig-pitot-light.html

Depois de gerar, suba a versão do cache (`?v=` e `hangar-escola-vN` em `aviao/sw.js`).
