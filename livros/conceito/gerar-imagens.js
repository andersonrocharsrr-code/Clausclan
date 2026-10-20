// Gera as imagens do conceito a partir de telas.html.
// Uso: node livros/conceito/gerar-imagens.js
const path = require('path');
const { chromium } = (() => { try { return require('playwright'); } catch { return require('/opt/node22/lib/node_modules/playwright'); } })();
const TELAS = ['editor', 'leitura', 'trilha', 'celular'];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2 });
  p.on('pageerror', e => console.log('ERRO', e.message));
  await p.goto('file://' + path.join(__dirname, 'telas.html'));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(800);
  for (const t of TELAS) {
    const out = path.join(__dirname, 'imagens', `${t}.jpg`);
    await p.locator('#' + t).screenshot({ path: out, type: 'jpeg', quality: 90 });
    console.log('ok', out);
  }
  await b.close();
})();
