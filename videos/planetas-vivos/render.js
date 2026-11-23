// Uso: node render.js <saida.mp4> [t0 t1]   |   node render.js --fotos <pasta> t1 t2 ...
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const path = require('path'); const fs = require('fs');
(async () => {
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] }); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => { console.error('ERRO', e.message); process.exit(1) });
  await p.goto('file://' + path.join(__dirname, 'index.html') + '?render&pal=' + (process.env.PAL || 'oceano')); await p.evaluate(() => PRONTO);
  const snap = (t, q) => p.evaluate(([t, q]) => { render(t); return cv.toDataURL('image/jpeg', q).slice(23) }, [t, q]);
  if (process.argv[2] === '--fotos') { const d = process.argv[3]; fs.mkdirSync(d, { recursive: true }); for (const t of process.argv.slice(4)) fs.writeFileSync(`${d}/t${(+t).toFixed(1).padStart(5, '0')}.jpg`, Buffer.from(await snap(+t, .85), 'base64')); await b.close(); return }
  const FPS = 30, DUR = await p.evaluate(() => DUR), t0 = +(process.argv[3] || 0), t1 = +(process.argv[4] || DUR);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', FPS, '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', process.argv[2]], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = Math.round(t0 * FPS); i < Math.round(t1 * FPS); i++) { const buf = Buffer.from(await snap(i / FPS, .95), 'base64'); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)) }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close();
})();
