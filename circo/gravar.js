// Grava o clipe em MP4 (1920x1080, 30 quadros por segundo) com a música original.
// O vídeo é gravado em sequências curtas (uns 17 s cada), que depois são juntadas na ordem.
// Uso: node gravar.js [saida.mp4]     (precisa de playwright e ffmpeg instalados)
const { chromium } = require('playwright');
const { spawn, execFileSync } = require('child_process');
const path = require('path'), fs = require('fs'), os = require('os');
const FPS = 30, DUR = 171.16, N = Math.ceil(DUR * FPS), SEQ = 10, W = Math.min(4, os.cpus().length);
const out = path.resolve(process.argv[2] || 'o-circo-chegou-na-cidade.mp4');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'circo-'));
const url = 'file://' + path.join(__dirname, 'gravacao.html');
const fila = [...Array(SEQ).keys()];

async function operario() {
  const br = await chromium.launch();
  const pg = await br.newPage({ viewport: { width: 1920, height: 1080 } });
  pg.on('pageerror', e => { console.error('ERRO NA PÁGINA', e.message); process.exitCode = 1; });
  await pg.goto(url); await pg.waitForFunction('window.PRONTO');
  while (fila.length) {
    const k = fila.shift(), a = Math.floor(N * k / SEQ), b = Math.floor(N * (k + 1) / SEQ), arq = path.join(tmp, `seq${String(k).padStart(2, '0')}.mp4`);
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '14', '-pix_fmt', 'yuv420p', '-r', String(FPS), arq], { stdio: ['pipe', 'inherit', 'inherit'] });
    const fim = new Promise((ok, erro) => ff.on('close', c => c ? erro(new Error('ffmpeg ' + c)) : ok()));
    for (let f = a; f < b; f++) {
      await pg.evaluate(t => T.seek(t), f / FPS);
      const img = await pg.screenshot({ type: 'jpeg', quality: 95 });
      if (!ff.stdin.write(img)) await new Promise(r => ff.stdin.once('drain', r));
    }
    ff.stdin.end(); await fim; console.log(`sequência ${k + 1}/${SEQ} pronta (${(a / FPS).toFixed(1)}s a ${(b / FPS).toFixed(1)}s)`);
  }
  await br.close();
}
(async () => {
  await Promise.all([...Array(W)].map(operario));
  const lista = path.join(tmp, 'lista.txt');
  fs.writeFileSync(lista, [...Array(SEQ).keys()].map(k => `file '${path.join(tmp, `seq${String(k).padStart(2, '0')}.mp4`)}'`).join('\n'));
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lista, '-i', path.join(__dirname, 'musica.m4a'), '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', process.env.CRF || '26', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-t', String(DUR), out], { stdio: 'inherit' });
  fs.rmSync(tmp, { recursive: true }); console.log('pronto:', out);
})();
