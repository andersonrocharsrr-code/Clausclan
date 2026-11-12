// Grava o clipe em MP4 (1920x1080, 30 quadros por segundo) com a música original.
// Uso: node gravar.js [saida.mp4]     (precisa de playwright e ffmpeg instalados)
const { chromium } = require('playwright');
const { spawn, execFileSync } = require('child_process');
const path = require('path'), fs = require('fs'), os = require('os');
const FPS = 30, DUR = 137.28, N = Math.ceil(DUR * FPS), W = Math.min(4, os.cpus().length);
const out = path.resolve(process.argv[2] || 'trenzinho-das-cores.mp4');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'trenzinho-'));
const url = 'file://' + path.join(__dirname, 'gravacao.html');

async function parte(k) {
  const a = Math.floor(N * k / W), b = Math.floor(N * (k + 1) / W), arq = path.join(tmp, `p${k}.mp4`);
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '14', '-pix_fmt', 'yuv420p', '-r', String(FPS), arq], { stdio: ['pipe', 'inherit', 'inherit'] });
  const fim = new Promise((ok, erro) => ff.on('close', c => c ? erro(new Error('ffmpeg ' + c)) : ok()));
  const br = await chromium.launch();
  const pg = await br.newPage({ viewport: { width: 1920, height: 1080 } });
  pg.on('pageerror', e => { console.error('ERRO NA PÁGINA', e.message); process.exitCode = 1; });
  await pg.goto(url); await pg.waitForFunction('window.PRONTO');
  for (let f = a; f < b; f++) {
    await pg.evaluate(t => T.seek(t), f / FPS);
    const img = await pg.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(img)) await new Promise(r => ff.stdin.once('drain', r));
    if (k === 0 && (f - a) % 150 === 0) console.log(`quadro ${f - a}/${b - a} (de cada parte)`);
  }
  ff.stdin.end(); await br.close(); await fim; return arq;
}
(async () => {
  const partes = await Promise.all([...Array(W).keys()].map(parte));
  const lista = path.join(tmp, 'lista.txt'); fs.writeFileSync(lista, partes.map(p => `file '${p}'`).join('\n'));
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lista, '-i', path.join(__dirname, 'musica.m4a'), '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', '26', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-t', String(DUR), out], { stdio: 'inherit' });
  fs.rmSync(tmp, { recursive: true }); console.log('pronto:', out);
})();
