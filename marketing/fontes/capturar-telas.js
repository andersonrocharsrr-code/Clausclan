const { chromium } = (() => { try { return require('playwright'); } catch { return require('/opt/node22/lib/node_modules/playwright'); } })();
const now = new Date(); const ym = now.toISOString().slice(0,7);
const d = (day) => `${ym}-${String(day).padStart(2,'0')}`;
let i=0; const id=()=>'x'+(i++);
const E=(kind,title,amount,cat,day,method='pix')=>({id:id(),kind,title,amount:Math.round(amount*100),cat,method,notes:'',date:d(day),createdAt:Date.now()+i});
const expenses=[
 E('in','Salário',4800,'salario',5), E('in','Freela site',900,'freela',3),
 E('out','Aluguel',1350,'moradia',5), E('out','Mercado Extra',412.6,'mercado',6,'credito'),
 E('out','iFood',58.9,'alimentacao',6,'credito'), E('out','Uber',23.5,'transporte',6),
 E('out','Conta de luz',187.4,'contas',3), E('out','Academia',99.9,'saude',2,'credito'),
 E('out','Cinema',64,'lazer',4,'credito'), E('out','Padaria',18.4,'alimentacao',7),
 E('out','Gasolina',150,'transporte',4,'debito'), E('out','Farmácia',42.3,'saude',1),
];
const fixed=[];for(const t of ['Aluguel','Conta de luz','Academia']){const e=expenses.find(x=>x.title===t);const f={id:'f'+t,kind:'out',title:t,amount:e.amount,cat:e.cat,method:e.method,day:+e.date.slice(8),from:ym,last:ym};fixed.push(f);e.fixedId=f.id;}
const nd=(n)=>{const x=new Date();x.setDate(x.getDate()+n);return x.toISOString().slice(0,10);};
const reminders=[{id:'r1',title:'Conta de luz',amount:18740,cat:'contas',due:nd(1)+'T09:00',anchorDay:1,remind:1440,repeat:'monthly',firedPre:'',firedAt:''},
 {id:'r2',title:'Internet',amount:9990,cat:'contas',due:nd(3)+'T09:00',anchorDay:1,remind:1440,repeat:'monthly',firedPre:'',firedAt:''},
 {id:'r3',title:'Cartão de crédito',amount:84520,cat:'outros',due:nd(8)+'T09:00',anchorDay:1,remind:1440,repeat:'monthly',firedPre:'',firedAt:''}];
const REM=process.env.REM==='1', ALL=process.env.ALL==='1';
const state={expenses,fixed,reminders:(REM||ALL)?reminders:[],notifyOn:!REM,notifyTested:true,budget:350000,theme:'light',themeV:2,catBudgets:{mercado:80000},
 goals:[{id:'g1',name:'Viagem de férias',target:500000,deadline:'',color:'#06b6d4',icon:'x-plane',moves:[{id:'m',date:d(1),amount:310000,start:true}],createdAt:1}]};
(async()=>{
 const b=await chromium.launch({channel:'chromium',args:['--lang=pt-BR'],env:{...process.env,LANG:'pt_BR.UTF-8',LANGUAGE:'pt_BR'}}); const ctx=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:3,locale:'pt-BR',colorScheme:'light',permissions:['notifications']});
 await ctx.addInitScript(s=>{localStorage.setItem('meus-gastos:v1',s);localStorage.setItem('nexa-auth-skip','1');sessionStorage.setItem('nexa-entered','1');try{Object.defineProperty(Notification,'permission',{get:()=>'granted'});Notification.requestPermission=async()=>'granted';}catch(e){}},JSON.stringify(state));
 const p=await ctx.newPage(); p.on('pageerror',e=>console.log('ERR',e.message));
 await p.goto('http://localhost:8765/gastos/'); await p.waitForTimeout(2500);
 if(ALL){
  await p.screenshot({path:'cur-resumo.png'});
  await p.click('[data-view="gastos"]'); await p.waitForTimeout(700); await p.screenshot({path:'cur-gastos.png'});
  await p.click('[data-view="lembretes"]'); await p.waitForTimeout(700); await p.screenshot({path:'cur-lembretes.png'});
  await p.click('#tabTools'); await p.waitForTimeout(900); await p.screenshot({path:'cur-ferramentas.png'});
  await b.close(); return;
 }
 if(!REM){ await p.screenshot({path:'s-resumo.png'});
 if(process.env.VOZ==='1'){
  await p.addStyleTag({content:'.quick__tool.is-listening::before,.quick__tool.is-listening::after{display:none!important}'});
  await p.evaluate(()=>{const m=document.querySelector('#quickMic');m.classList.add('is-listening');m.closest('.quick__field').classList.add('is-listening');const q=document.querySelector('#quickInput');q.placeholder='Ouvindo… ex.: "gastei 30 reais no mercado"';});
  await p.waitForTimeout(400); await p.screenshot({path:'s-mic.png'});
  await p.evaluate(()=>{const m=document.querySelector('#quickMic');m.classList.remove('is-listening');m.closest('.quick__field').classList.remove('is-listening');document.querySelector('#quickInput').placeholder='Ex.: uber 23,50 ontem';});
  await p.fill('#quickInput','gastei 30 reais na padaria'); await p.evaluate(()=>{const q=document.querySelector('#quickInput');q.setSelectionRange(0,0);q.scrollLeft=0;q.blur();}); await p.waitForTimeout(600); await p.screenshot({path:'s-voz2.png'});
  await p.fill('#quickInput',''); await p.waitForTimeout(300);
  await p.setInputFiles('#scanInput','cupom.png'); await p.waitForTimeout(1500);
  await p.evaluate(()=>{const a=document.querySelector('#expAmount');a.value='89,90';a.dispatchEvent(new Event('input',{bubbles:true}));
   const f=document.querySelector('#formExp');f.title.value='Supermercado Bom Preço';f.date.value='2026-10-06';
   document.querySelector('#dlgExp .cat-opt[data-cat="mercado"]').click();
   const bx=document.querySelector('#scanStatus');bx.hidden=false;bx.className='scan-status is-done';document.activeElement&&document.activeElement.blur();document.querySelector('#scanText').textContent='Li: valor, data, loja. Confira antes de salvar.';});
  await p.waitForTimeout(500); await p.screenshot({path:'s-cupom.png'});
  console.log(await p.evaluate(()=>document.querySelector('#scanText').textContent));
  await b.close(); return;
 }
 await p.click('[data-view="gastos"]'); await p.waitForTimeout(800); await p.screenshot({path:'s-gastos.png'});
 await p.click('[data-view="resumo"]'); await p.mouse.wheel(0,700); await p.waitForTimeout(800); await p.screenshot({path:'s-resumo2.png'});
 await p.mouse.wheel(0,900); await p.waitForTimeout(800); await p.screenshot({path:'s-resumo3.png'});
 await p.mouse.wheel(0,-5000); await p.waitForTimeout(600); await p.fill('#quickInput','mercado 89,90 ontem'); await p.waitForTimeout(700); await p.screenshot({path:'s-quick.png'});
 } else {
 await p.click('[data-view="lembretes"]'); await p.waitForTimeout(800); await p.screenshot({path:'s-lembretes.png'});
 await p.click('#btnNotif'); await p.waitForTimeout(600); await p.screenshot({path:'s-sino.png'});
 }
 await b.close();})();
