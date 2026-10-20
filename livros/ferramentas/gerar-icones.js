// Gera o ícone do Imersa em todos os tamanhos a partir de icone.js:
// livros/icon.svg e PNGs do site, e livros-android/assets (depois rode "npx capacitor-assets generate --android").
// Uso: node livros/ferramentas/gerar-icones.js
const fs = require('fs'), path = require('path');
const { chromium } = (() => { try { return require('playwright'); } catch { return require('/opt/node22/lib/node_modules/playwright'); } })();
const { full, fore, back, maskable } = require('./icone');
const web = path.join(__dirname, '..'), apk = path.join(__dirname, '..', '..', 'livros-android', 'assets');
(async () => {
  fs.writeFileSync(path.join(web, 'icon.svg'), full('i') + '\n');
  const b = await chromium.launch(), p = await b.newPage();
  const shot = async (file, size, svg, transparent) => {
    await p.setViewportSize({ width: size, height: size });
    await p.setContent(`<body style="margin:0;background:transparent">${svg.replace('<svg ', `<svg width="${size}" height="${size}" style="display:block" `)}</body>`);
    await p.screenshot({ path: file, omitBackground: !!transparent });
  };
  await shot(path.join(web, 'icon-192.png'), 192, full('a'), true);
  await shot(path.join(web, 'icon-512.png'), 512, full('a'), true);
  await shot(path.join(web, 'apple-touch-icon.png'), 180, full('a', 0));
  await shot(path.join(web, 'icon-maskable-512.png'), 512, maskable('a'));
  if (fs.existsSync(apk)) {
    await shot(path.join(apk, 'icon-only.png'), 1024, full('a', 0));
    await shot(path.join(apk, 'icon-background.png'), 1024, back('a'));
    await shot(path.join(apk, 'icon-foreground.png'), 1024, fore('a'), true);
  }
  await b.close();
})();
