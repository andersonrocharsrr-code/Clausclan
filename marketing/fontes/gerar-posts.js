const { chromium } = (() => { try { return require('playwright'); } catch { return require('/opt/node22/lib/node_modules/playwright'); } })();
(async()=>{
 const b=await chromium.launch();
 for (const h of [1350,1920]) {
  const p=await b.newPage({viewport:{width:1080,height:h}});
  p.on('pageerror',e=>console.log('ERR',e.message));
  await p.goto('file://'+__dirname+'/post.html?h='+h); await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(400);
  await p.screenshot({path:__dirname+`/post-${h}.png`});
 }
 await b.close();})();
