// node render.js <saida.mp4> [largura] [fps] [so_quadros: "0,5,10"]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
(async () => {
  const out = process.argv[2] || 'telescopio.mp4';
  const W = +(process.argv[3] || 1080), FPS = +(process.argv[4] || 30);
  const so = process.argv[5];
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 400, height: 400 } });
  await p.goto('file://' + path.join(__dirname, 'index.html') + '?w=' + W);
  const fs = require('fs'), url64 = f => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(__dirname, 'fotos', f)).toString('base64');
  const fonte = 'data:font/woff2;base64,' + fs.readFileSync(path.join(__dirname, 'fontes', 'homemade-apple-latin-400-normal.woff2')).toString('base64');
  await p.evaluate(([a, b, f]) => carregar(a, b, f), [url64('terra-tex.jpg'), url64('lua-tex.jpg'), fonte]);
  const DUR = await p.evaluate('DUR');
  let tempos = so ? so.split(',').map(Number) : [...Array(Math.round(DUR * FPS)).keys()].map(i => i / FPS);
  // pedaços em paralelo: INI e FIM (índices de quadro)
  if (!so && process.env.FIM) tempos = tempos.slice(+(process.env.INI || 0), +process.env.FIM);
  let ff;
  if (!so) ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let i = 0; i < tempos.length; i++) {
    const url = await p.evaluate(t => { render(t); return document.getElementById('c').toDataURL('image/png'); }, tempos[i]);
    const buf = Buffer.from(url.split(',')[1], 'base64');
    if (so) require('fs').writeFileSync(out.replace(/\.\w+$/, '') + '-' + tempos[i] + '.png', buf);
    else if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 30 === 0) console.log(`quadro ${i}/${tempos.length}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  if (ff) { ff.stdin.end(); await new Promise(r => ff.on('close', r)); }
  await b.close();
})();
