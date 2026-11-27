// node render.js <saida.mp4|teste.png> [largura] [fps] [so_quadros "0,5"]   (INI/FIM = pedaço de quadros)
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path'), fs = require('fs');
(async () => {
  const out = process.argv[2], W = +(process.argv[3] || 1080), FPS = +(process.argv[4] || 30), so = process.argv[5];
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 400, height: 400 } });
  p.on('pageerror', e => console.log('ERRO', e.message));
  await p.goto('file://' + path.join(__dirname, 'index.html') + '?w=' + W);
  const nomes = await p.evaluate('IMAGENS'); const m = {};
  for (const k in nomes) m[k] = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, 'fotos', nomes[k])).toString('base64');
  await p.evaluate(m => carregar(m), m); await p.evaluate(() => document.fonts.ready);
  const DUR = await p.evaluate('DUR');
  let tempos = so ? so.split(',').map(Number) : [...Array(Math.round(DUR * FPS)).keys()].map(i => i / FPS);
  if (!so && process.env.FIM) tempos = tempos.slice(+(process.env.INI || 0), +process.env.FIM);
  let ff; if (!so) ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < tempos.length; i++) {
    const url = await p.evaluate(t => { render(t); return document.getElementById('c').toDataURL('image/png'); }, tempos[i]);
    const buf = Buffer.from(url.split(',')[1], 'base64');
    if (so) fs.writeFileSync(out.replace(/\.\w+$/, '') + '-' + tempos[i] + '.png', buf);
    else if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 60 === 0) console.log(`quadro ${i}/${tempos.length}`);
  }
  if (ff) { ff.stdin.end(); await new Promise(r => ff.on('close', r)); }
  await b.close();
})();
