const { chromium } = (() => { try { return require('playwright'); } catch { return require('/opt/node22/lib/node_modules/playwright'); } })();
(async()=>{
 const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1080,height:1920}});
 p.on('pageerror',e=>console.log('ERR',e.message));
 await p.goto('file://'+__dirname+'/post.html?h=1920&mode=status'); await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(400);
 await p.screenshot({path:__dirname+'/post-status.png'}); await b.close();})();
