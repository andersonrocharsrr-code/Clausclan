// ================= ARTE NOVA (nível da chamada): retratos em close, cenários pintados =================
// ---------- retrato de busto, rosto 3/4 voltado para a direita, luz vinda da esquerda ----------
function portrait(P){const {skin='#d8a57e',skinD='#a8744e',hair='#2a2420',cap=null,capCol='#efede6',uni='jpwhite',age=0.6,eye='#3a2a1c',brow='#2a2420',rim='#ffcf98',seed=1,blinks=[1.6,4.9,8.3,11.7]}=P;
 const id=gid('pt');let b='';
 const HEAD='M -110 -60 C -118 -150 -50 -200 15 -198 C 85 -196 120 -140 112 -60 C 110 -30 117 -14 113 6 C 109 30 112 62 100 96 C 86 136 60 166 25 171 C -15 173 -60 151 -88 106 C -106 76 -112 30 -112 -10 Z';
 // ---- tronco / uniforme ----
 const TORSO='M -330 560 C -320 360 -190 268 -78 240 L 92 240 C 205 268 330 360 340 560 Z';
 const U={jpwhite:['#ecebe3','#b9b5a9'],jpnavy:['#1d2534','#10161f'],khaki:['#c2ae7c','#8e7c52'],smoking:['#6a2228','#3e1216']}[uni];
 b+=`<defs><linearGradient id="${id}t" x1="0" x2="1"><stop offset="0" stop-color="${U[0]}"/><stop offset=".55" stop-color="${U[0]}"/><stop offset="1" stop-color="${U[1]}"/></linearGradient>
 <linearGradient id="${id}s" x1="0" x2="1"><stop offset="0" stop-color="${skin}"/><stop offset=".55" stop-color="${skin}"/><stop offset="1" stop-color="${skinD}"/></linearGradient>
 <linearGradient id="${id}r" x1="0" x2="1"><stop offset=".7" stop-color="${rim}" stop-opacity="0"/><stop offset="1" stop-color="${rim}" stop-opacity=".85"/></linearGradient>
 <clipPath id="${id}c"><path d="${HEAD}"/></clipPath></defs>`;
 // pescoço
 b+=Pa('M -62 110 L -54 250 L 66 250 L 74 110 Z',skinD)+Pa('M -62 110 L -54 250 L 6 250 L 10 140 Z',skin,'opacity=".6"');
 b+=Pa(TORSO,`url(#${id}t)`);
 if(uni==='jpwhite'||uni==='jpnavy'){const c=uni==='jpwhite'?'#f4f2ea':'#141b28';
  b+=Pa('M -78 212 Q 8 246 92 212 L 96 256 Q 8 292 -82 256 Z',c)+Pa('M -78 212 Q 8 246 92 212','none',`stroke="${uni==='jpwhite'?'#a8a498':'#2c3648'}" stroke-width="3"`);
  for(let i=0;i<4;i++)b+=Ci(10,300+i*62,7,'#d8b04a')+Ci(8,298+i*62,2.5,'#fff3c0');
  b+=Ln(10,268,10,560,uni==='jpwhite'?'#c9c5b8':'#0c1118',2);
  // dragonas/insígnias de ombro
  b+=Pa('M -250 330 L -130 284 L -118 312 L -238 362 Z','#c9a040')+Pa('M 245 330 L 135 284 L 124 312 L 232 362 Z','#a8842c');
  for(const sx of [-200,-170])b+=Ci(sx,322+(sx+200)*-0.4,6,'#fff0b0');
  if(uni==='jpnavy')b+=R(-72,226,26,22,'#c9a040',3)+R(64,226,26,22,'#a8842c',3);
 }else if(uni==='khaki'){b+=Pa('M -70 230 L 10 330 L 92 230 L 120 262 L 10 380 L -100 262 Z','#d2bf8e')+Pa('M 0 300 L 20 300 L 26 520 L 10 545 L -6 520 Z','#20232a');
  for(const [sx,dir] of [[-70,1],[84,-1]])for(let k=0;k<4;k++)b+=Pa(starP(sx+dir*(k*14),268+k*4,6),'#e8d070');
  b+=Ln(10,380,10,560,'#8e7c52',2);
 }else if(uni==='smoking'){b+=Pa('M -60 236 L 10 320 L 82 236 L 30 560 L -10 560 Z','#efece4')+Pa('M -2 260 L 22 260 L 26 420 L 10 440 L -6 420 Z','#3a2a4a');
  b+=Pa('M -78 240 L 4 330 L -40 560 L -130 560 L -90 380 Z','#3e1216')+Pa('M 92 240 L 18 330 L 58 560 L 150 560 L 108 380 Z','#2c0c10');
  b+=Pa('M -78 240 L 4 330 L -40 560','none','stroke="#c8a050" stroke-width="3"')+Pa('M 92 240 L 18 330 L 58 560','none','stroke="#a8843c" stroke-width="3"');}
 // ---- cabeça ----
 b+=El(-110,24,20,34,skinD)+El(-108,24,11,22,'#8a5a3c','opacity=".5"');  // orelha
 b+=Pa(HEAD,`url(#${id}s)`);
 b+=`<g clip-path="url(#${id}c)">`;
 // cabelo (laterais) e testa
 b+=Pa('M -114 -70 Q -110 -150 -40 -175 Q -90 -120 -96 -30 Q -104 -8 -112 0 Z',hair,cap?'opacity=".9"':'');
 if(!cap)b+=Pa('M -112 -60 C -110 -170 -30 -215 40 -205 C 100 -196 126 -150 118 -90 C 90 -140 30 -150 -20 -140 C -70 -130 -96 -100 -112 -60Z',hair);
 // sombras do rosto
 b+=Pa('M 60 -40 Q 92 10 80 70 Q 70 120 30 160 L 130 160 L 130 -60Z',skinD,'opacity=".42"');
 b+=Pa('M -40 120 Q 10 150 70 128 Q 50 170 10 172 Q -30 166 -40 120Z',skinD,'opacity=".35"');
 b+=Pa('M -92 40 Q -70 110 -20 140',`none`,`stroke="${skinD}" stroke-width="10" opacity=".25"`);
 // olhos
 const eyeP=(x,y,w,h)=>`M ${x-w} ${y} Q ${x} ${y-h} ${x+w} ${y-2} Q ${x} ${y+h*0.55} ${x-w} ${y} Z`;
 b+=Pa('M -78 -22 Q -40 -40 -4 -26 Q -40 -34 -78 -18Z',skinD,'opacity=".55"')+Pa('M 34 -24 Q 62 -36 88 -24 Q 62 -30 34 -20Z',skinD,'opacity=".55"');
 b+=Pa(eyeP(-40,2,30,20),'#f2ece2')+Pa(eyeP(60,2,22,17),'#e6ddd0');
 b+=Ci(-34,2,11.5,eye)+Ci(-34,2,5.5,'#0e0a08')+Ci(-30,-2,3,'#ffffff')+Ci(64,2,9.5,eye)+Ci(64,2,4.5,'#0e0a08')+Ci(67,-1,2.4,'#ffffff');
 b+=Pa(`M -72 2 Q -40 -22 -8 0`,'none',`stroke="#2a1a12" stroke-width="5" stroke-linecap="round"`)+Pa(`M 38 2 Q 60 -17 84 0`,'none',`stroke="#2a1a12" stroke-width="4" stroke-linecap="round"`);
 b+=Pa('M -66 14 Q -40 22 -12 12','none',`stroke="${skinD}" stroke-width="2.5" opacity=".8"`)+Pa('M 42 13 Q 62 20 80 12','none',`stroke="${skinD}" stroke-width="2" opacity=".8"`);
 if(age>0.4)b+=Pa('M -64 26 Q -40 36 -16 26','none',`stroke="${skinD}" stroke-width="2" opacity=".6"`)+Pa('M -80 -6 L -92 -12 M -80 4 L -94 4','none',`stroke="${skinD}" stroke-width="1.6" opacity=".6"`);
 // pálpebras para piscar
 const lid=G(Pa(eyeP(-40,2,32,22),skin)+Pa(eyeP(60,2,24,19),skinD)+Pa('M -72 4 Q -40 14 -8 4','none','stroke="#2a1a12" stroke-width="4"')+Pa('M 38 4 Q 60 12 84 4','none','stroke="#2a1a12" stroke-width="3"'),
  (t)=>({o:blinks.some(bt=>t>=bt&&t<bt+0.13)?1:0}));
 b+=lid;
 // sobrancelhas
 b+=Pa('M -84 -30 Q -50 -52 -6 -40 L -8 -32 Q -48 -42 -82 -22Z',brow)+Pa('M 34 -38 Q 62 -50 92 -36 L 90 -30 Q 62 -40 36 -30Z',brow);
 // nariz
 b+=Pa('M 14 -14 Q 22 30 44 62 Q 36 74 20 72','none',`stroke="${skinD}" stroke-width="4" stroke-linecap="round"`)+Pa('M 22 -6 Q 34 30 50 60 Q 40 68 28 66 Q 34 40 22 -6Z',skinD,'opacity=".45"')+El(26,70,7,4,'#6a3a24','opacity=".6"');
 b+=Pa('M -10 52 Q 6 62 22 74','none',`stroke="${skinD}" stroke-width="2" opacity=".4"`);
 // sulcos e boca
 if(age>0.3)b+=Pa('M -2 66 Q -18 92 -10 118','none',`stroke="${skinD}" stroke-width="3" opacity="${0.3+age*0.4}"`)+Pa('M 58 70 Q 76 92 70 116','none',`stroke="${skinD}" stroke-width="3" opacity="${0.3+age*0.4}"`);
 b+=Pa('M -2 108 Q 28 104 62 106','none','stroke="#6a3426" stroke-width="5" stroke-linecap="round"')+Pa('M 6 116 Q 30 126 54 115 Q 30 120 6 116Z','#b07058','opacity=".7"');
 b+=Pa('M 0 106 Q -6 110 -4 116','none','stroke="#6a3426" stroke-width="2" opacity=".6"');
 if(age>0.6)b+=Pa('M -60 -70 Q -10 -80 40 -72 M -50 -86 Q 0 -96 50 -88','none',`stroke="${skinD}" stroke-width="2" opacity=".35"`);
 // luz de contorno (direita) e brilho na testa/maçã
 b+=R(-130,-210,260,400,`url(#${id}r)`)+El(-58,-110,40,22,'#ffffff','opacity=".09"')+El(-70,60,26,18,'#ffffff','opacity=".07"');
 b+=`</g>`;
 b+=Pa(HEAD,'none',`stroke="${rim}" stroke-width="3" opacity=".5" stroke-dasharray="0 260 300 2000"`);
 // ---- quepe ----
 if(cap){const band=cap==='us'?'#1a1a1a':'#141414';
  b+=Pa('M -128 -112 Q -124 -222 8 -232 Q 146 -224 146 -112 L 136 -86 Q 10 -104 -118 -88 Z',capCol)+Pa('M 40 -228 Q 140 -216 146 -112 L 136 -86 Q 100 -92 70 -95 Q 92 -160 40 -228Z','#000','opacity=".18"');
  b+=Pa('M -120 -112 Q 10 -126 140 -110 L 136 -84 Q 10 -100 -118 -86 Z',band);
  b+=Pa('M -66 -88 Q 60 -96 158 -62 Q 128 -42 34 -52 Q -30 -56 -66 -74 Z','#0c0c0c')+Pa('M -40 -84 Q 60 -90 140 -64','none','stroke="#5a5a5a" stroke-width="3" opacity=".7"');
  if(cap==='us'){b+=Pa('M -20 -78 Q 50 -82 120 -62','none','stroke="#d8b04a" stroke-width="5" stroke-dasharray="10 6"');b+=Pa('M 4 -150 L 30 -132 L 56 -150 L 46 -122 L 14 -122Z','#d8b04a')+Ci(30,-112,8,'#d8b04a')}
  else{b+=Ci(28,-112,13,'#d8b04a')+Pa('M 6 -112 Q 28 -136 50 -112 Q 28 -126 6 -112Z','#e8c860')+Pa('M 22 -112 L 34 -112 L 28 -100Z','#e8c860')}
 }
 return b}
function starP(x,y,r){let p='';for(let i=0;i<10;i++){const a=-PI/2+i*PI/5,rr=i%2?r*0.42:r;p+=(i?'L':'M')+(x+rr*Math.cos(a)).toFixed(1)+' '+(y+rr*Math.sin(a)).toFixed(1)}return p+'Z'}
// respiração e leve movimento
const breathe=(inner,x,y,s=1)=>G(inner,(t)=>({t:`translate(${x},${(y+Math.sin(t*1.3)*2.5).toFixed(2)}) rotate(${(Math.sin(t*0.5)*0.8).toFixed(2)}) scale(${s})`}));
// poeira no ar iluminada
function dust(seed,n,x0,x1,y0,y1,col='#ffe8c0'){const q=rng(seed);let s='';for(let i=0;i<n;i++){const x=lerp(x0,x1,q()),y=lerp(y0,y1,q()),r=1+q()*2.4,ph=q()*6;s+=G(Ci(0,0,r,col),(t)=>({t:`translate(${(x+Math.sin(t*0.3+ph)*30).toFixed(1)},${(y-((t*8+ph*40)%300)).toFixed(1)})`,o:0.25+0.35*Math.sin(t+ph)**2}))}return s}
const BLUR=(sd)=>{const id=gid('bl');return [id,`<defs><filter id="${id}" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="${sd}"/></filter></defs>`]};
// ---------- cenários dos retratos ----------
function bgCabin(){const [f,d]=BLUR(6);let s=d+`<g filter="url(#${f})">`+R(-600,-600,3200,2400,'#2a1a10');for(let i=0;i<26;i++)s+=R(-600+i*130,-600,4,2400,'#1a0e08');
 for(const [x,y] of [[400,330],[760,300]])s+=Ci(x,y,86,'#3a2a1c')+Ci(x,y,70,'#f4d8a0')+Ci(x,y,70,'#ffe8c0','opacity=".6"');
 s+=R(1300,200,520,340,'#5a4028')+R(1316,216,488,308,'#cdb88a')+`<g transform="translate(1316,216) scale(0.254,0.293)" opacity=".75">${pacMap(PARCH)}</g>`;
 s+=Pa('M 330 330 L 470 330 L 1100 1100 L 500 1100Z','#ffd9a0','opacity=".12"')+Pa('M 700 300 L 830 300 L 1400 1100 L 860 1100Z','#ffd9a0','opacity=".1"');
 s+=R(-600,820,3200,600,'#1a0e08')+`</g>`+dust(5,40,300,1100,300,1000);return s}
function bgBridge(){const [f,d]=BLUR(5);let s=d+`<g filter="url(#${f})">`+R(-600,-600,3200,2400,'#1c222a')+skyRect([[0,'#2a3a5a'],[0.6,'#a87a6a'],[1,'#f4c08a']],560,120)+R(-600,560,3200,120,'#3a4a5e')+glow(1500,540,420,'#ffc890','#fff0d0');
 for(let i=0;i<8;i++)s+=R(-200+i*320,100,26,600,'#141a20');s+=R(-600,90,3200,30,'#141a20')+R(-600,660,3200,600,'#20262e');
 s+=man({x:1560,y:1000,h:420,col:'#1d2534',dark:'#10161f',pants:'#1d2534',hat:'peak',hc:'#141414',kit:'officer',f:-1,ph:3,la:4,le:10,ra:-3,re:12,skin:'#c89a72'});
 s+=`</g>`;return s}
function bgBasement(){const [f,d]=BLUR(6);let s=d+`<g filter="url(#${f})">`+R(-600,-600,3200,2400,'#1e2a22');for(let i=0;i<18;i++)s+=R(-600+i*190,-600,3,2400,'#0e1610');
 for(let i=0;i<14;i++){const q=rng(i+9);q();s+=R(250+q()*1400,200+q()*400,70+q()*60,90+q()*50,'#e8dcc0',2,`opacity=".55" transform="rotate(${(q()-0.5)*10} 900 400)"`)}
 s+=Pa('M 1260 120 L 1340 120 L 1360 150 L 1240 150Z','#2a4a2a')+Ci(1300,152,12,'#fff2c0')+Pa('M 1240 150 L 1360 150 L 1700 1100 L 900 1100Z','#ffe8b0','opacity=".1"');
 s+=R(-600,860,3200,600,'#0e140f')+`</g>`+dust(7,46,900,1700,200,1000);return s}
function bgOffice(){let s=R(-600,-600,3200,2400,'#cfc4a8');for(let i=0;i<20;i++)s+=R(-600+i*170,-600,2,2400,'#000','opacity=".05"');
 s+=R(560,110,1400,760,'#4a3420')+`<g transform="translate(580,130)"><svg width="1360" height="720" viewBox="0 0 1920 1016" preserveAspectRatio="none" overflow="hidden">${pacMap({gid:'pof'})}</svg></g>`;
 s+=Pa('M -200 -100 L 200 -100 L 700 1100 L -100 1100Z','#fff4d8','opacity=".18"');return s}
const NIM_MAP=(lon,lat)=>{const [x,y]=PJ(lon,lat);return [580+x*1360/1920,130+y*720/1016]};
// ---------- Midway pintada ao entardecer (da chamada) ----------
const GOLD=[[0,'#3c5a86'],[0.45,'#8fa6c0'],[0.8,'#f0c890'],[1,'#f7dcae']];
function albatross(x,y,s=1,f=1,ph=0){let b='';const W='#f4f2ec',D='#2a2a2c';
 b+=El(0,-20,30,14,W)+Pa('M-24 -26 Q-40 -30 -52 -22 Q-38 -18 -24 -18Z',D)+Pa('M10 -30 Q30 -46 42 -40 Q36 -30 20 -26Z',W)+Ci(36,-40,9,W)+Pa('M43 -42 L64 -38 L44 -36Z','#e8c8a0')+Ci(38,-42,1.8,D)+Pa('M34 -45 Q38 -47 42 -44',D);
 b+=Pa('M-20 -24 Q0 -36 20 -24 Q0 -20 -20 -24Z',D,'opacity=".9"')+Ln(-6,-8,-8,4,'#c8a088',2.4)+Ln(6,-8,6,4,'#c8a088',2.4);
 return G(`<g transform="translate(${x},${y}) scale(${s*f},${s})">${b}</g>`,(t)=>({t:`translate(0,${(Math.sin(t*1.5+ph)*1.5).toFixed(2)})`}))}
function ironwood(x,y,h,c='#3a5a3a'){let b=Ln(0,0,2,-h*0.5,'#5a4632',6);for(let i=0;i<6;i++){const yy=-h*0.35-i*h*0.11,w=h*(0.42-i*0.05);b+=El((i%2?6:-6),yy,w,h*0.09,c,'opacity=".95"')}return `<g transform="translate(${x},${y})">${b}</g>`}
function midwayPanorama(o={}){const HZ=600;let L0=skyRect(GOLD,HZ)+glow(1500,HZ-30,700,'#ffcc88','#fff6dc')+cloudBank(31,90,420,12,'#ffe8cc',0.55,6);
 let sea=seaGrad(HZ,[[0,'#f2c79a'],[0.08,'#7c98ae'],[0.4,'#3d6b88'],[1,'#1c3e58']])+sunPath(1500,HZ+4,1000,'#ffe0b0')+ripples(33,200,HZ+8,1100,'#ffffff',0.16);
 let far=Pa(`M300 ${HZ+6} Q600 ${HZ-16} 1100 ${HZ-10} Q1400 ${HZ-6} 1700 ${HZ+6}Z`,'#c8b890')+R(560,HZ-40,140,30,'#8a8a80')+Pa(`M550 ${HZ-40} Q630 ${HZ-64} 710 ${HZ-40}Z`,'#6a6e66')+R(760,HZ-34,100,24,'#8a8a80');
 const TX=o.tower?1180:980,TH=o.tower?300:110;far+=Ln(TX,HZ-12,TX,HZ-TH,'#3a3a38',o.tower?5:3)+Ln(TX-30,HZ-12,TX,HZ-TH,'#3a3a38',2)+Ln(TX+30,HZ-12,TX,HZ-TH,'#3a3a38',2)+(o.tower?Ln(TX-40,HZ-TH+20,TX+40,HZ-TH+20,'#3a3a38',3)+Ci(TX,HZ-TH,5,'#ff5a3a'):'');
 for(let i=0;i<10;i++)far+=ironwood(330+i*90+(i%3)*14,HZ-8,60+(i%4)*14,'#4a6646');
 let reef='';for(let i=0;i<14;i++)reef+=G(Pa(`M${-200+i*170} ${HZ+120} q40 -10 80 0`,'none','stroke="#ffffff" stroke-width="3" opacity=".5"'),(t)=>({o:0.3+0.3*Math.sin(t*2+i)}));
 const sand=Pa(`M-600 ${HZ+250} Q300 ${HZ+170} 1100 ${HZ+200} Q1900 ${HZ+230} 2700 ${HZ+180} L2700 1700 L-600 1700Z`,'#e6d2a2')+Pa(`M-600 ${HZ+262} Q300 ${HZ+182} 1100 ${HZ+212} Q1900 ${HZ+242} 2700 ${HZ+192}`,'none','stroke="#f8f0dc" stroke-width="6" opacity=".7"');
 let near='';for(let i=0;i<5;i++)near+=ironwood(-260+i*95,HZ+240,190+i*16,'#36583a');near+=ironwood(2050,HZ+230,240,'#36583a')+ironwood(2160,HZ+250,200,'#36583a');
 const bd=albatross(820,HZ+330,1.3,1,0)+albatross(980,HZ+350,1.35,-1,1.4)+albatross(1420,HZ+300,1.0,1,2.1)+albatross(1560,HZ+316,1.0,-1,0.6)+albatross(300,HZ+380,1.6,1,2.6);
 let rings='';if(o.tower)for(let i=0;i<4;i++)rings+=G(Ci(TX,HZ-TH,40,'none','stroke="#ffe9a0" stroke-width="3"'),(t)=>{const u=((t-o.tower+i*0.6)/2.4)%1;return{t:`translate(${TX},${HZ-TH}) scale(${(1+u*9).toFixed(3)}) translate(${-TX},${-HZ+TH})`,o:t<o.tower?0:(1-u)*0.8}});
 return {sky:L0,birds:birds(400,180,7,41,'#2a2a30',30,-2,1.1),sea:sea+far+reef+rings,near:sand+bd+near}}
