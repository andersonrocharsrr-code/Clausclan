# Render do vídeo FEB em Monte Castelo (skill product-launch-motion): Playwright + subquadros + ffmpeg tmix (desfoque de movimento) a 60 qps.
#   python3 render.py probe t1 t2 ...  -> probe/sheet.png       python3 render.py full -> out/video.mp4
import asyncio, io, subprocess, sys, threading, http.server, functools, pathlib
from playwright.async_api import async_playwright
AQUI = pathlib.Path(__file__).resolve().parent; FPS, SUB = 30, 1; import json; DUR = json.load(open(AQUI / 'tempos.json'))['DUR']
def servidor():
    h = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(AQUI)); h.log_message = lambda *a: None
    s = http.server.ThreadingHTTPServer(('127.0.0.1', 8810 + (int(sys.argv[2]) + 1 if sys.argv[1] == 'full' and len(sys.argv) > 3 else 0)), h); threading.Thread(target=s.serve_forever, daemon=True).start(); return s
async def snap(pg, t):
    await pg.evaluate('t => seek(t)', t); await pg.evaluate('() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))')
    return await pg.locator('#tela').screenshot(type='png')
async def main():
    modo = sys.argv[1]; s = servidor()
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--font-render-hinting=none', '--force-color-profile=srgb', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width': 1080, 'height': 1920}, device_scale_factor=2); await pg.goto(f'http://127.0.0.1:{s.server_address[1]}/index.html?render'); await pg.wait_for_function('window.READY === true', timeout=180000)
        if modo == 'quadro':
            (AQUI / 'probe').mkdir(exist_ok=True); open(AQUI / 'probe/quadro.png', 'wb').write(await snap(pg, float(sys.argv[2]))); print('probe/quadro.png')
        elif modo == 'probe':
            from PIL import Image
            (AQUI / 'probe').mkdir(exist_ok=True); ims = [Image.open(io.BytesIO(await snap(pg, float(x)))).convert('RGB').resize((270, 480)) for x in sys.argv[2:]]
            cols = min(8, len(ims)); rows = (len(ims) + cols - 1) // cols; S = Image.new('RGB', (270 * cols, 480 * rows))
            for i, im in enumerate(ims): S.paste(im, ((i % cols) * 270, (i // cols) * 480))
            S.save(AQUI / 'probe/sheet.png'); print('probe/sheet.png')
        else:
            parte = int(sys.argv[2]) if len(sys.argv) > 3 else 0; nparts = int(sys.argv[3]) if len(sys.argv) > 3 else 1
            (AQUI / 'out').mkdir(exist_ok=True); vf = f"scale=out_color_matrix=bt709:out_range=tv,format=yuv420p"
            ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'image2pipe', '-framerate', str(FPS * SUB), '-c:v', 'png', '-i', '-', '-vf', vf, '-r', str(FPS), '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-tune', 'film', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', str(AQUI / f'out/parte{parte}.mp4')], stdin=subprocess.PIPE)
            nf = int(DUR * FPS); f0, f1 = nf * parte // nparts, nf * (parte + 1) // nparts; n = (f1 - f0) * SUB
            for i in range(f0 * SUB, f1 * SUB):
                t = (i // SUB) / FPS + ((i % SUB) - (SUB - 1) / 2) / (FPS * SUB); ff.stdin.write(await snap(pg, max(0.0, t)))
                if i % 300 == 0: print(f'{i - f0 * SUB}/{n}', flush=True)
            ff.stdin.close(); ff.wait(); print(f'out/parte{parte}.mp4')
        await b.close()
    s.shutdown()
asyncio.run(main())
