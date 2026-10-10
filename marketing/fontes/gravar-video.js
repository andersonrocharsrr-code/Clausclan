const { chromium } = (() => { try { return require('playwright'); } catch { return require('/opt/node22/lib/node_modules/playwright'); } })();
const [,, html, mode, out] = process.argv; const FPS=30;
(async()=>{
 const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1080,height:1920}});
 p.on('pageerror',e=>console.log('ERR',e.message));
 await p.goto('file://'+__dirname+'/'+html); await p.waitForFunction('window.ready');
 const DUR=await p.evaluate('window.DUR');
 const R = mode.startsWith('range:') ? mode.split(':').slice(1).map(Number) : null;
 let n = R ? R[0] : 0;
 const times = R ? [...Array(R[1]-R[0]).keys()].map(i=>(i+R[0])/FPS) : mode==='all' ? [...Array(Math.round(FPS*DUR)).keys()].map(i=>i/FPS) : mode.split(',').map(Number);

 for(const t of times){ await p.evaluate(t=>window.seek(t),t); await p.screenshot({path:`${out}/f${String(n++).padStart(4,'0')}.png`}); }
 await b.close();})();
