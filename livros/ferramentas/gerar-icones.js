// Gera os ícones PNG a partir de icon.svg. Uso: node livros/ferramentas/gerar-icones.js
const fs = require('fs'), path = require('path');
const { chromium } = (() => { try { return require('playwright'); } catch { return require('/opt/node22/lib/node_modules/playwright'); } })();
const dir = path.join(__dirname, '..');
const svg = fs.readFileSync(path.join(dir, 'icon.svg'), 'utf8');
(async () => {
  const b = await chromium.launch(), p = await b.newPage();
  const shot = async (name, size, pad, round) => {
    await p.setViewportSize({ width: size, height: size });
    const inner = svg.replace('rx="11"', round ? 'rx="11"' : 'rx="0"');
    await p.setContent(`<body style="margin:0;background:${pad ? '#0c0a12' : 'transparent'}"><div style="width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center">${inner.replace('<svg ', `<svg width="${size - pad * 2}" height="${size - pad * 2}" `)}</div></body>`);
    await p.screenshot({ path: path.join(dir, name), omitBackground: !pad });
  };
  await shot('icon-192.png', 192, 0, true);
  await shot('icon-512.png', 512, 0, true);
  await shot('apple-touch-icon.png', 180, 0, false);
  await shot('icon-maskable-512.png', 512, 0, false);
  await b.close();
})();
