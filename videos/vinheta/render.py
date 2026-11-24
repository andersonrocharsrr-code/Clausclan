# Renderiza a vinheta quadro a quadro (Playwright + Chromium), com desfoque de movimento por subquadros.
#   python3 render.py probe 1 4.2 5.8 8.6   -> probe/sheet.png (quadros soltos para revisar)
#   python3 render.py full                   -> out/video.mp4 (30 qps, 4 subquadros por quadro)
import asyncio, io, json, subprocess, sys, threading, http.server, functools, pathlib
import numpy as np
from PIL import Image
from playwright.async_api import async_playwright
AQUI = pathlib.Path(__file__).parent; TL = json.load(open(AQUI / 'timeline.json')); FPS, DUR, SUB = TL['fps'], TL['duration'], 4
CHROME = '/opt/pw-browsers/chromium'
def servidor():
    h = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(AQUI)); h.log_message = lambda *a: None
    s = http.server.ThreadingHTTPServer(('127.0.0.1', 8771), h); threading.Thread(target=s.serve_forever, daemon=True).start(); return s
async def foto(pg, t):
    await pg.evaluate('t => seek(t)', t); await pg.evaluate('() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))')
    return np.asarray(Image.open(io.BytesIO(await pg.locator('canvas').screenshot(type='png'))).convert('RGB'), dtype=np.float32)
async def main():
    modo = sys.argv[1]; s = servidor()
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME, args=['--font-render-hinting=none', '--force-color-profile=srgb'])
        pg = await b.new_page(viewport={'width': 1080, 'height': 1920}); await pg.goto('http://127.0.0.1:8771/vinheta.html?render'); await pg.wait_for_function('window.ready === true')
        await pg.add_style_tag(content='canvas{height:1920px!important;width:1080px!important}#hud{display:none}')
        if modo == 'probe':
            (AQUI / 'probe').mkdir(exist_ok=True); ims = [Image.fromarray((await foto(pg, float(x))).astype(np.uint8)).resize((360, 640)) for x in sys.argv[2:]]
            folha = Image.new('RGB', (360 * len(ims), 640)); [folha.paste(im, (i * 360, 0)) for i, im in enumerate(ims)]; folha.save(AQUI / 'probe/sheet.png'); print('probe/sheet.png')
        else:
            (AQUI / 'out').mkdir(exist_ok=True); ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', '1080x1920', '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', str(AQUI / 'out/video.mp4')], stdin=subprocess.PIPE)
            n = int(DUR * FPS)
            for f in range(n):
                acc = sum([await foto(pg, (f + k / SUB) / FPS) for k in range(SUB)]) / SUB
                ff.stdin.write(acc.clip(0, 255).astype(np.uint8).tobytes())
                if f % 30 == 0: print(f'{f}/{n}', flush=True)
            ff.stdin.close(); ff.wait(); print('out/video.mp4')
        await b.close()
    s.shutdown()
asyncio.run(main())
