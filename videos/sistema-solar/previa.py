# Tira imagens de prévia: python3 previa.py nome:t nome:t ... -> probe/<nome>.png e probe/previa.png
import sys, asyncio, threading, http.server, functools, pathlib
from playwright.async_api import async_playwright
AQUI = pathlib.Path(__file__).resolve().parent
h = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(AQUI)); h.log_message = lambda *a: None
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 8795), h); threading.Thread(target=srv.serve_forever, daemon=True).start()
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width': 1080, 'height': 1920}); pg.on('console', lambda m: print('console:', m.text)); pg.on('pageerror', lambda e: print('ERRO:', e))
        await pg.goto('http://127.0.0.1:8795/index.html'); await pg.wait_for_function('window.READY === true', timeout=120000)
        (AQUI / 'probe').mkdir(exist_ok=True)
        for arg in sys.argv[1:]:
            nome, t = arg.split(':'); await pg.evaluate('([n, t]) => previa(n, t)', [nome, float(t)])
            await pg.locator('#tela').screenshot(path=str(AQUI / f'probe/{nome}.png')); print(nome)
        await b.close()
asyncio.run(main())
