// node render.js <saida.mp4|teste.png> <cena 1|2|3> [largura] [fps] [so_quadros "0,5"]
// INI/FIM (variáveis de ambiente) = pedaço de quadros, para gerar em paralelo
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path'), fs = require('fs');
(async () => {
  const out = process.argv[2], cena = process.argv[3] || '1';
  const W = +(process.argv[4] || 1080), FPS = +(process.argv[5] || 30), so = process.argv[6];
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 400, height: 400 } });
  p.on('pageerror', e => console.log('ERRO', e.message));
  await p.goto('file://' + path.join(__dirname, 'index.html') + '?w=' + W + '&cena=' + cena);
  const nomes = await p.evaluate('TEXTURAS');
  const m = {}; for (const k in nomes) { const f = nomes[k]; m[k] = 'data:image/' + (f.endsWith('.png') ? 'png' : 'jpeg') + ';base64,' + fs.readFileSync(path.join(__dirname, 'fotos', f)).toString('base64'); }
  await p.evaluate(m => carregar(m), m);
  const DUR = await p.evaluate('DUR');
  let tempos = so ? so.split(',').map(Number) : [...Array(Math.round(DUR * FPS)).keys()].map(i => i / FPS);
  if (!so && process.env.FIM) tempos = tempos.slice(+(process.env.INI || 0), +process.env.FIM);
  let ff;
  if (!so) ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let i = 0; i < tempos.length; i++) {
    const url = await p.evaluate(t => { render(t); return document.getElementById('c').toDataURL('image/png'); }, tempos[i]);
    const buf = Buffer.from(url.split(',')[1], 'base64');
    if (so) fs.writeFileSync(out.replace(/\.\w+$/, '') + '-' + cena + '-' + tempos[i] + '.png', buf);
    else if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 30 === 0) console.log(`quadro ${i}/${tempos.length}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  if (ff) { ff.stdin.end(); await new Promise(r => ff.on('close', r)); }
  await b.close();
})();
