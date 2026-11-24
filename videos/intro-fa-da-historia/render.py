# Render da intro Fã da História (skill product-launch-motion): Playwright + subquadros + ffmpeg tmix (desfoque de movimento) a 60 qps.
#   python3 render.py probe t1 t2 ...  -> probe/sheet.png       python3 render.py full -> out/video.mp4
import asyncio, io, subprocess, sys, threading, http.server, functools, pathlib
from playwright.async_api import async_playwright
AQUI = pathlib.Path(__file__).resolve().parent; FPS, SUB, DUR = 60, 2, 10.0
def servidor():
    h = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(AQUI)); h.log_message = lambda *a: None
    s = http.server.ThreadingHTTPServer(('127.0.0.1', 8773), h); threading.Thread(target=s.serve_forever, daemon=True).start(); return s
async def snap(pg, t):
    await pg.evaluate('t => seek(t)', t); await pg.evaluate('() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))')
    return await pg.locator('#film').screenshot(type='png')
async def main():
    modo = sys.argv[1]; s = servidor()
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--font-render-hinting=none', '--force-color-profile=srgb', '--disable-threaded-animation'])
        pg = await b.new_page(viewport={'width': 1080, 'height': 1920}); await pg.goto('http://127.0.0.1:8773/index.html?render'); await pg.wait_for_function('window.READY === true')
        if modo == 'probe':
            from PIL import Image
            (AQUI / 'probe').mkdir(exist_ok=True); ims = [Image.open(io.BytesIO(await snap(pg, float(x)))).convert('RGB').resize((270, 480)) for x in sys.argv[2:]]
            cols = min(8, len(ims)); rows = (len(ims) + cols - 1) // cols; S = Image.new('RGB', (270 * cols, 480 * rows))
            for i, im in enumerate(ims): S.paste(im, ((i % cols) * 270, (i // cols) * 480))
            S.save(AQUI / 'probe/sheet.png'); print('probe/sheet.png')
        else:
            (AQUI / 'out').mkdir(exist_ok=True); vf = f"tmix=frames={SUB}:weights='{' '.join(['1'] * SUB)}',select='eq(mod(n\\,{SUB})\\,{SUB - 1})',setpts=N/({FPS}*TB),scale=out_color_matrix=bt709:out_range=tv,format=yuv420p"
            ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'image2pipe', '-framerate', str(FPS * SUB), '-c:v', 'png', '-i', '-', '-vf', vf, '-r', str(FPS), '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-tune', 'film', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', str(AQUI / 'out/video.mp4')], stdin=subprocess.PIPE)
            n = int(DUR * FPS * SUB)
            for i in range(n):
                t = (i // SUB) / FPS + ((i % SUB) - (SUB - 1) / 2) / (FPS * SUB); ff.stdin.write(await snap(pg, max(0.0, t)))
                if i % 120 == 0: print(f'{i}/{n}', flush=True)
            ff.stdin.close(); ff.wait(); print('out/video.mp4')
        await b.close()
    s.shutdown()
asyncio.run(main())
