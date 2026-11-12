// Gera as capas (1280x720) para o YouTube a partir de um quadro de cada clipe, com o título por cima.
// Uso: node videos/capas/fazer-capas.js
const { chromium } = require('playwright');
const path = require('path');
const raiz = path.join(__dirname, '..', '..');
const CAPAS = [
  { pasta: 'trenzinho', t: 9.0, arq: 'trenzinho-das-cores.jpg', linhas: ['TRENZINHO', 'DAS CORES'], y: 170, tam: 165, selo: 'MÚSICA DAS CORES', sx: 960, sy: 985 },
  { pasta: 'circo', t: 129.6, arq: 'o-circo-chegou-na-cidade.jpg', linhas: ['O CIRCO CHEGOU!'], y: 190, tam: 172, selo: 'BATE PALMA E DANÇA', sx: 960, sy: 1000 },
  { pasta: 'planeta', t: 109.0, arq: 'a-viagem-ao-planeta-dos-numeros.jpg', linhas: ['PLANETA DOS', 'NÚMEROS'], y: 180, tam: 172, selo: 'CONTE DE 1 A 10', sx: 1540, sy: 960 }
];
(async () => {
  const br = await chromium.launch();
  for (const c of CAPAS) {
    const pg = await br.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 / 3 });
    await pg.goto('file://' + path.join(raiz, c.pasta, 'gravacao.html')); await pg.waitForFunction('window.PRONTO');
    await pg.evaluate(c => {
      T.seek(c.t);
      const cores = ['#F0665A', '#F7C245', '#6EC3EE', '#3DB57C', '#F58F3C', '#B79AE0'];
      const a = `text-anchor="middle" font-family="Fredoka, Arial, sans-serif" font-weight="700" font-size="${c.tam}" letter-spacing="4"`;
      let s = '', i = 0; const x = c.x || 960;
      c.linhas.forEach((txt, k) => {
        const y = c.y + k * c.tam * 0.98, sp = [...txt].map(ch => ch === ' ' ? ' ' : `<tspan fill="${cores[i++ % 6]}">${ch}</tspan>`).join('');
        s += `<text x="${x}" y="${y + 16}" ${a} fill="#2B2046" stroke="#2B2046" stroke-width="64" stroke-linejoin="round" opacity=".55">${txt}</text><text x="${x}" y="${y}" ${a} fill="#fff" stroke="#fff" stroke-width="50" stroke-linejoin="round">${txt}</text><text x="${x}" y="${y}" ${a}>${sp}</text>`;
      });
            s += `<g transform="translate(${c.sx},${c.sy}) rotate(-3)"><rect x="-330" y="-52" width="660" height="96" rx="48" fill="#F0665A" stroke="#fff" stroke-width="10"/><text x="0" y="16" text-anchor="middle" font-family="Fredoka, Arial, sans-serif" font-weight="700" font-size="58" fill="#fff" letter-spacing="2">${c.selo}</text></g>`;
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.innerHTML = s; document.getElementById('palco').appendChild(g);
    }, c);
    await pg.screenshot({ path: path.join(__dirname, c.arq), type: 'jpeg', quality: 90 });
    await pg.close(); console.log('capa:', c.arq);
  }
  await br.close();
})();
