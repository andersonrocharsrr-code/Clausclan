// ================= PADRÃO VISUAL NOVO (igual à chamada): textos limpos, legenda palavra por palavra, luz de cinema =================
const CAPFONT="font-family:'Liberation Sans Narrow','Liberation Sans',sans-serif";
const SHADOW='paint-order:stroke fill;stroke:#000;stroke-opacity:.55;stroke-linejoin:round';
// títulos sem caixa, no alto à esquerda
function cleanTitle(title,sub,tin,tout,big=0){const x=96,y=big?168:150,fs=big?66:44;const w=Math.max(title.length*fs*0.62,120);
 const ul=G(R(x,y+16,w,4,'#c8452f'),(t)=>({t:`translate(${x},0) scale(${ramp(t,tin,tin+0.5).toFixed(3)},1) translate(${-x},0)`}));
 return G(`<text x="${x}" y="${y}" font-size="${fs}" font-weight="bold" fill="#fff6e6" letter-spacing="3" class="ns" style="${SHADOW};stroke-width:6px">${title}</text>`+ul+
  (sub?`<text x="${x}" y="${y+58}" font-size="28" fill="#ffe2b0" letter-spacing="3" class="ns" style="${SHADOW};stroke-width:5px">${sub}</text>`:''),
  (t)=>({o:win(t,tin,tout,0.5),t:`translate(${lerp(-24,0,ease(ramp(t,tin,tin+0.6))).toFixed(1)},0)`}))}
lower=function(title,sub,tin,tout){return cleanTitle(title,sub,tin,tout,0)};
timeStamp=function(txt,tin,tout,o={}){return cleanTitle(txt,o.sub||'',tin,tout,1)};
{const _tt=typeText;typeText=function(x,y,s,t0,t1,o={}){return _tt(x,y,s,t0,t1,Object.assign({box:0},o))}}

// legenda palavra por palavra a partir de WORDS [[início,fim,texto,começoDeTrecho],...]
function buildCaptions(WORDS,total){
 const disp=(s)=>s.toUpperCase().replace(/(\d+):(\d+)/,'$1H$2');
 const isKey=(raw,prevRaw,first)=>{const c=raw.replace(/[^\p{L}\p{N}]/gu,'');if(!c)return 0;if(/\d/.test(c))return 1;
  const STOP=new Set(['UM','UMA','UNS','UMAS','O','A','OS','AS','E','DE','DO','DA','DOS','DAS','EM','NO','NA','NOS','NAS','QUE','POR','PARA','COM','SE','MAS','AO','AOS','À','ÀS','SEU','SUA']);if(STOP.has(c.toUpperCase()))return 0;const sentStart=first||/[.?!]$/.test(prevRaw||'');return !sentStart&&/^\p{Lu}/u.test(c)&&c.length>1?1:0};
 // páginas de até 2 linhas (~34 caracteres por linha); quebra também no fim da frase
 const pages=[];let cur=null;
 WORDS.forEach((w,i)=>{const [t0,t1,raw,first]=w;const d=disp(raw),k=isKey(raw,i?WORDS[i-1][2]:'',first);
  if(!cur||first||cur.full){cur={lines:[[]],len:[0],full:false};pages.push(cur)}
  let L=cur.lines.length-1;if(cur.len[L]+d.length+1>34){if(L===1){cur={lines:[[]],len:[0],full:false};pages.push(cur);L=0}else{cur.lines.push([]);cur.len.push(0);L=1}}
  cur.lines[L].push([d,t0,k]);cur.len[L]+=d.length+1;cur.end=t1;if(/[.?!]$/.test(raw))cur.full=true});
 let s='';pages.forEach((p,pi)=>{const st=p.lines[0][0][1],nx=pages[pi+1]?pages[pi+1].lines[0][0][1]:total;const en=Math.min(nx,p.end+0.9);
  let txt='';p.lines.forEach((ln,li)=>{let sp='';ln.forEach(([d,tw,k])=>{const id=AN((t)=>({attrs:{'fill-opacity':t>=tw?Math.min(1,(t-tw)/0.08).toFixed(2):0,'stroke-opacity':t>=tw?(0.8*Math.min(1,(t-tw)/0.08)).toFixed(2):0}}));
    sp+=`<tspan id="${id}" fill="${'#ffffff'}" fill-opacity="0" stroke-opacity="0">${d} </tspan>`});
   txt+=`<text x="960" y="${(p.lines.length>1?918:950)+li*62}" font-size="52" text-anchor="middle" font-weight="bold" class="ns" style="${CAPFONT};paint-order:stroke fill;stroke:#000;stroke-width:7px;stroke-linejoin:round">${sp}</text>`});
  s+=G(txt,(t)=>({o:(t>=st-0.05&&t<en)?1:0}))});
 return s}
// camada final: luz de cinema + legenda (fica por cima de todos os planos)
function styleOverlay(WORDS,total){
 const g=`<defs><radialGradient id="stv" cx="50%" cy="46%" r="72%"><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".62"/></radialGradient>
 <linearGradient id="stw" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="#ffcf98" stop-opacity=".16"/><stop offset=".55" stop-color="#ffcf98" stop-opacity="0"/></linearGradient>
 <linearGradient id="stb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".62"/></linearGradient></defs>`;
 shot(0,total,()=>({x:960,y:540,z:1}),()=>L(0,g+R(-10,-10,1940,1100,'url(#stw)',0,'style="mix-blend-mode:screen"')+R(-10,-10,1940,1100,'url(#stv)')+R(0,760,1920,320,'url(#stb)')+buildCaptions(WORDS,total)));
 // a camada de cima não deve "aparecer" aos poucos no começo
 shots[shots.length-1].t0=-1;
}
