// ================= EXEMPLO 20 s — ritmo rápido, zoom de entrada, máquina de escrever, sépia =================
const SEPIA='<defs><filter id="sepia"><feColorMatrix type="matrix" values="0.55 0.6 0.15 0 0.02 0.3 0.62 0.13 0 0 0.2 0.45 0.2 0 0 0 0 0 1 0"/></filter></defs>';
// texto em máquina de escrever, com cursor e traço que cresce
function typeText(x,y,str,t0,t1,o={}){const {size=40,col='#fff6e6',cps=22,sub=null,subSize=30}=o;
 const id=AN((t)=>{const n=Math.max(0,Math.min(str.length,Math.floor((t-t0)*cps)));const cur=(n<str.length||((t*2)%1<0.5))&&t<t1-0.3?'▌':'';return{text:t<t0?'':str.slice(0,n)+cur}});
 const w=str.length*size*0.68,bw=Math.max(w,sub?sub.length*subSize*0.66:0);
 const line=G(R(x,y+14,w,4,'#c8452f'),(t)=>({t:`translate(${x},0) scale(${ramp(t,t0,t0+str.length/cps).toFixed(3)},1) translate(${-x},0)`}));
 let s=`<text id="${id}" x="${x}" y="${y}" font-size="${size}" fill="${col}" font-weight="bold" letter-spacing="3"></text>`+line;
 if(sub){const t2=t0+str.length/cps+0.2;const id2=AN((t)=>{const n=Math.max(0,Math.min(sub.length,Math.floor((t-t2)*cps*1.4)));return{text:t<t2?'':sub.slice(0,n)}});s+=`<text id="${id2}" x="${x}" y="${y+56}" font-size="${subSize}" fill="#ffe9c4" letter-spacing="3"></text>`}
 return G(G(R(x-30,y-size-26,bw+90,sub?size+120:size+60,'#05080b',12,'opacity=".55" filter="url(#blur12)"'),()=>({}))+s,(t)=>({o:Math.min(ramp(t,t0-0.2,t0),1-ramp(t,t1-0.3,t1))}))}
const DAWN=[[0,'#2c4c72'],[0.5,'#7b9cbb'],[0.85,'#f0c79a'],[1,'#f8dcb8']];
// --- 1: o porto ao amanhecer — avanço rápido até o Arizona ---
shot(0,4.2,(p,tl)=>{const u=ease(Math.min(1,tl/4.6));return{x:lerp(960,820,u),y:lerp(560,640,u),z:lerp(1.0,2.5,u*u)}},()=>{
 const WY=700;
 const ships=[{x:2050,s:0.7,cls:'nv'},{x:1500,s:0.72,cls:'ca'},{x:760,s:0.85,cls:'az'},{x:120,s:0.7,cls:'wv'}];
 let sh='';ships.forEach(o=>sh+=reflect(bship,{x:o.x,y:WY,s:o.s,f:-1,cls:o.cls,pal:PAL_DAWN},0.3)+bship({x:o.x,y:WY,s:o.s,f:-1,cls:o.cls,pal:PAL_DAWN,flag:1}));
 return L(0.05,skyRect(DAWN,WY)+glow(1500,WY-40,520,'#ffd8a8','#fff4e0')+cloudBank(5,140,460,10,'#f4e0c8',0.5,6))+
 L(0.2,ridge(WY-20,220,7,'#4a5a52',0.9,60,0.2)+Pa(`M${X0} ${WY-20} L${X0+XW} ${WY-20} L${X0+XW} ${WY} L${X0} ${WY}Z`,'#4a5a44'))+
 L(1,seaGrad(WY,[[0,'#d8b898'],[0.15,'#5a7a92'],[1,'#1c3a4c']])+ripples(9,180,WY+8,1100,'#ffe8c8',0.16)+sh)+
 L(0,typeText(96,200,'PEARL HARBOR · HAVAÍ',0.4,4.0,{size:44,sub:'DOMINGO, 7 DE DEZEMBRO DE 1941'}));
});
// --- 2: dentro do navio — 07h55, a bandeira sobe ---
shot(4.2,8.2,(p,tl)=>{const u=ease(Math.min(1,tl/4));return{x:lerp(1060,940,u),y:lerp(520,560,u),z:lerp(1.35,1.05,u)}},()=>{
 const DK=830,W='#ddd6c6',Wd='#aaa59a';
 let deck=R(X0,DK,XW,600,'#6a5c48')+R(X0,DK-4,XW,6,'#8a7a5e');for(let i=0;i<40;i++)deck+=R(-900+i*100,DK+8,3,500,'#5a4c3a');
 let rail='';for(let x=-900;x<=2900;x+=180)rail+=Ln(x,DK,x,DK-80,'#2a333b',4);rail+=Ln(X0,DK-80,X0+XW,DK-80,'#2a333b',3)+Ln(X0,DK-42,X0+XW,DK-42,'#2a333b',2.4);
 let men='';for(let i=0;i<7;i++)men+=man({x:240+i*120,y:DK,h:300,col:W,dark:Wd,hat:'dixie',f:1,ph:i,la:4,le:8,ra:-3,re:10,skin:['#c49a76','#b58a66','#d0a888'][i%3]});
 men+=man({x:1180,y:DK,h:320,col:'#ddd6c6',dark:'#aaa59a',hat:'peak',hc:'#2a2a2a',kit:'officer',f:-1,ph:9,la:4,le:8,ra:-3,re:10});
 const pole=R(1500,240,10,DK-240,'#c8c8c8')+Ci(1505,236,9,'#d8c088');
 const flag=G(`<g>`+waving(usFlag(200,120),200,120,0,8)+`</g>`,(t)=>({t:`translate(1510,${(DK-150-ramp(t,0.3,3.8)*(DK-420)).toFixed(1)})`}));
 return L(0.05,skyRect(DAWN,780)+glow(1600,740,500,'#ffd8a8','#fff4e0'))+L(0.3,ridge(780,150,13,'#4a5a52',0.9,80,0.14)+seaGrad(780,[[0,'#d8b898'],[0.15,'#5a7a92'],[1,'#1c3a4c']]))+
 L(1,deck+pole+flag+men+rail)+L(0,typeText(96,200,'07H55',0.5,4.0,{size:60,sub:'A BANDEIRA SOBE NOS NAVIOS'}));
});
// --- 3: o céu se enche de aviões ---
shot(8.2,12.2,(p,tl)=>{const u=ease(Math.min(1,tl/3.6));return{x:lerp(900,1000,u),y:lerp(760,420,u),z:lerp(1.05,1.0,u)}},()=>{
 const DK=1080;let pl='';
 const P=[[0,0],[-150,-50],[150,-50],[-300,-100],[300,-100],[-80,-170],[80,-170],[-230,-220],[230,-220]];
 P.forEach(([dx,dy],i)=>{const type=i%3?'kate':'zero';pl+=G(plane(type,{x:0,y:0,s:0.55,pal:PL_DAWN,gearDown:0,torp:0,ph:i}),(t)=>{const u=(t-0.8)/3.4;return{t:`translate(${(-700+u*2900+dx).toFixed(1)},${(380+dy-u*60+sin(t*2+i)*4).toFixed(1)})`,o:u<0?0:1}})});
 let far='';for(let i=0;i<20;i++){const q=rng(i*7+3);q();far+=G(planeFar({x:0,y:0,s:0.18,col:'#2a3646',type:i%3?'kate':'zero'}),(t)=>({t:`translate(${(-300+q()*2400*0+i*110+t*240).toFixed(1)},${(160+(i%5)*40).toFixed(1)})`}))}
 const pole=R(1500,240,10,800,'#c8c8c8')+`<g transform="translate(1510,280)">`+waving(usFlag(200,120),200,120,0,8)+`</g>`;
 return L(0.05,skyRect(DAWN,DK)+glow(1600,900,600,'#ffd8a8','#fff4e0')+cloudBank(17,100,700,12,'#f4e0c8',0.45,6))+L(0.4,far)+L(0.8,pole)+L(1,pl)+
 L(0,typeText(96,200,'O CÉU SE ENCHE DE AVIÕES',1.4,4.0,{size:40}));
});
// --- 4: hoje — o memorial do USS Arizona ---
function harborScene(WY,mode){const sea=mode==='now'?[[0,'#8ab4c8'],[0.15,'#3a7a9a'],[1,'#123a50']]:[[0,'#8a8c86'],[0.15,'#4a5f68'],[1,'#17303e']];
 let s=skyRect(mode==='now'?DAY_SKY:SMOKE_SKY,WY)+ridge(WY-20,180,723,'#4a6a46',0.9,60,0.2)+shore(WY,'#5a7650');
 if(mode==='now')s+=seaGrad(WY+4,sea)+ripples(725,160,WY+10,1100,'#ffffff',0.14)+azMemorial(960,WY+30,1.0);
 else s+=column(900,WY-30,2.6,731,{w:1.5,lean:0.4,rate:0.06,n:30,t0:-6})+azWreck({x:960,y:WY+20,s:1.0,f:-1,pal:PAL_SMK})+bigFire(820,WY-20,1.4,733,-99,1.3)+seaGrad(WY+6,sea)+oilSlick(735,200,1800,WY+30,WY+140,10,1)+ripples(737,140,WY+10,1100,'#ffffff',0.1);
 return s}
shot(12.2,16.0,(p,tl)=>{const u=ease(Math.min(1,tl/4.6));return{x:960,y:lerp(560,520,u),z:lerp(1.0,1.25,u)}},()=>{
 return L(1,harborScene(600,'now'))+L(0,typeText(96,200,'HOJE',0.4,3.6,{size:56,sub:'MEMORIAL DO USS ARIZONA'}));
});
// --- 5: o mesmo lugar em 1941 — sépia — o Arizona em chamas ---
shot(16.0,20,(p,tl)=>{const u=ease(Math.min(1,(tl+0.6)/4.6));return{x:960,y:lerp(520,500,u),z:lerp(1.22,1.45,u)}},()=>{
 const dark=G(R(-300,-300,2600,1700,'#000'),(t)=>({o:ramp(t,3.3,4)}));
 return SEPIA+L(1,`<g filter="url(#sepia)">`+harborScene(600,'1941')+`</g>`)+L(0,typeText(96,200,'7 DE DEZEMBRO DE 1941',0.3,3.9,{size:44,sub:'08H06 · O USS ARIZONA EM CHAMAS',col:'#fff0d8'})+dark);
});
