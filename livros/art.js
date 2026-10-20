/* Ilustrações prontas (desenhadas em SVG). Servem de capa, de imagem no texto e de fundo da leitura. */
const Arte = (() => {
const rng=s=>()=>((s=Math.imul(s^(s>>>15),2246822507)+0x6D2B79F5|0)>>>0)/4294967296;
/* ---------- ilustrações (SVG gerado) ---------- */
function pine(x,y,h,c){const w=h*.42;let d='';for(let k=0;k<4;k++){const t=y-h+k*h*.2, bt=t+h*.36, ww=w*(.32+k*.24);d+=`M${x},${t} L${x+ww/2},${bt} L${x-ww/2},${bt}Z`;}
 return `<path d="${d}M${x-h*.025},${y-h*.25}h${h*.05}V${y}h-${h*.05}Z" fill="${c}"/>`;}
function ridge(r,y,amp,step,c,W=1200,H=700){let d=`M0,${H} L0,${y}`;let v=y;for(let x=0;x<=W;x+=step){v=y-amp*(.4+.6*r())*Math.abs(Math.sin(x*.004+r()));d+=` L${x},${v.toFixed(1)}`;}return `<path d="${d} L${W},${H}Z" fill="${c}"/>`;}

function forest(id,o={}){const r=rng(11);let s='';
 for(let k=0;k<160;k++){const y=r()*380;s+=`<circle cx="${r()*1200}" cy="${y}" r="${(r()*1.4+.3).toFixed(2)}" fill="#fff" opacity="${(r()*.8+.2)*(1-y/450)}"/>`;}
 let trees3='',trees2='',trees1='';
 for(let x=-20;x<1240;x+=26+r()*22)trees3+=pine(x,500+r()*20,90+r()*70,'#1c2550');
 for(let x=-30;x<1240;x+=40+r()*40){if(x>420&&x<800&&r()<.8)continue;trees2+=pine(x,610+r()*20,150+r()*110,'#111735');}
 [[-10,760,520],[90,760,430],[180,760,330],[1040,760,470],[1150,760,560],[960,760,300]].forEach(([x,y,h])=>trees1+=pine(x,y,h,'#070a18'));
 let ff='';for(let k=0;k<30;k++)ff+=`<circle cx="${300+r()*650}" cy="${430+r()*230}" r="${(1.5+r()*2.5).toFixed(1)}" fill="#ffd98a" filter="url(#${id}g)" opacity="${.5+r()*.5}"/>`;
 return `<svg viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%;display:block">
 <defs>
  <linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#070d24"/><stop offset=".45" stop-color="#1a2752"/><stop offset=".75" stop-color="#46467a"/><stop offset="1" stop-color="#8b6e90"/></linearGradient>
  <radialGradient id="${id}m"><stop offset="0" stop-color="#fff6d8" stop-opacity=".75"/><stop offset=".25" stop-color="#cdd6ff" stop-opacity=".25"/><stop offset="1" stop-color="#cdd6ff" stop-opacity="0"/></radialGradient>
  <radialGradient id="${id}l"><stop offset="0" stop-color="#ffc56b" stop-opacity=".9"/><stop offset="1" stop-color="#ff9b3d" stop-opacity="0"/></radialGradient>
  <linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8ecff" stop-opacity=".22"/><stop offset="1" stop-color="#e8ecff" stop-opacity="0"/></linearGradient>
  <radialGradient id="${id}c" cx=".5" cy=".3"><stop offset="0" stop-color="#5b6aa6"/><stop offset="1" stop-color="#151b3a"/></radialGradient>
  <filter id="${id}f" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="16"/></filter>
  <filter id="${id}g" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="2.5"/></filter>
 </defs>
 <rect width="1200" height="700" fill="url(#${id}s)"/>${s}
 <circle cx="830" cy="150" r="260" fill="url(#${id}m)"/>
 <circle cx="830" cy="150" r="54" fill="#f6efd6"/><circle cx="812" cy="138" r="11" fill="#e3d8b6" opacity=".6"/><circle cx="846" cy="168" r="7" fill="#e3d8b6" opacity=".5"/><circle cx="851" cy="131" r="5" fill="#e3d8b6" opacity=".45"/>
 ${ridge(rng(3),420,90,30,'#2f3566')}${ridge(rng(5),470,60,24,'#252a55')}
 <ellipse cx="600" cy="480" rx="700" ry="40" fill="#b8bfe6" opacity=".25" filter="url(#${id}f)"/>
 ${trees3}
 <path d="M300,700 L560,600 Q620,585 680,600 L960,700Z" fill="url(#${id}c)"/>
 <polygon points="780,180 880,180 760,700 470,700" fill="url(#${id}b)"/>
 ${trees2}
 <ellipse cx="600" cy="600" rx="520" ry="34" fill="#c7cdf2" opacity=".22" filter="url(#${id}f)"/>
 <circle cx="612" cy="598" r="70" fill="url(#${id}l)"/>
 <g fill="#06081a"><circle cx="600" cy="560" r="9"/><path d="M600,566 C588,568 584,590 580,624 L620,624 C616,590 612,568 600,566Z"/><path d="M608,582 l6,14" stroke="#06081a" stroke-width="4"/></g>
 <circle cx="614" cy="600" r="5" fill="#ffe0a0"/>
 ${trees1}${ff}
 </svg>`;}

function lighthouse(id){const r=rng(7);let rain='',clouds='',waves='';
 for(let k=0;k<26;k++)clouds+=`<ellipse cx="${r()*1300-50}" cy="${r()*260}" rx="${120+r()*200}" ry="${30+r()*50}" fill="${r()<.5?'#0b161d':'#3e5864'}" opacity="${.35+r()*.4}" filter="url(#${id}f)"/>`;
 for(let k=0;k<9;k++){const y=440+k*30+k*k*2;let d=`M-20,${y}`;for(let x=0;x<=1240;x+=40)d+=` Q${x+20},${y-8-r()*10} ${x+40},${y}`;waves+=`<path d="${d}" fill="none" stroke="#a9dbe2" stroke-opacity="${.08+k*.025}" stroke-width="${1+k*.35}"/>`;}
 for(let k=0;k<260;k++){const x=r()*1260,y=r()*700,l=14+r()*22;rain+=`<line x1="${x}" y1="${y}" x2="${x-l*.35}" y2="${y+l}" stroke="#cfe3ea" stroke-opacity="${.12+r()*.25}" stroke-width="1"/>`;}
 return `<svg viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%;display:block">
 <defs>
  <linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#08131a"/><stop offset=".5" stop-color="#1c3540"/><stop offset="1" stop-color="#3f6068"/></linearGradient>
  <linearGradient id="${id}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d3d46"/><stop offset="1" stop-color="#050d11"/></linearGradient>
  <linearGradient id="${id}b" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#ffefc2" stop-opacity=".75"/><stop offset="1" stop-color="#ffefc2" stop-opacity="0"/></linearGradient>
  <radialGradient id="${id}l"><stop offset="0" stop-color="#fff3cc"/><stop offset=".3" stop-color="#ffd27a" stop-opacity=".6"/><stop offset="1" stop-color="#ffb347" stop-opacity="0"/></radialGradient>
  <linearGradient id="${id}t" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e9e1cf"/><stop offset="1" stop-color="#9c9483"/></linearGradient>
  <filter id="${id}f" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22"/></filter>
  <filter id="${id}g" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>
 </defs>
 <rect width="1200" height="700" fill="url(#${id}s)"/>${clouds}
 <polyline points="250,40 225,120 262,128 214,250 240,256 205,350" fill="none" stroke="#e8f6ff" stroke-width="7" opacity=".35" filter="url(#${id}g)"/>
 <polyline points="250,40 225,120 262,128 214,250 240,256 205,350" fill="none" stroke="#f4fbff" stroke-width="2"/>
 <rect y="430" width="1200" height="270" fill="url(#${id}w)"/>${waves}
 <polygon points="760,150 0,40 0,330" fill="url(#${id}b)" opacity=".8"/>
 <polygon points="760,150 -40,180 -40,300" fill="url(#${id}b)" opacity=".35"/>
 <path d="M700,700 L720,520 L760,470 L790,380 L830,345 L900,330 L990,338 L1060,320 L1200,300 L1200,700Z" fill="#060c10"/>
 <path d="M720,520 L760,470 L790,380 L830,345 L870,340" fill="none" stroke="#21363e" stroke-width="3"/>
 <ellipse cx="720" cy="560" rx="120" ry="34" fill="#e8f4f6" opacity=".35" filter="url(#${id}f)"/>
 <ellipse cx="690" cy="600" rx="60" ry="14" fill="#fff" opacity=".35" filter="url(#${id}g)"/>
 <g transform="translate(900,0)">
  <path d="M-34,340 L-24,170 L24,170 L34,340Z" fill="url(#${id}t)"/>
  <path d="M-31,290 L31,290 L32.5,315 L-32.5,315Z M-27.5,230 L27.5,230 L29,255 L-29,255Z M-25,180 L25,180 L25.5,195 L-25.5,195Z" fill="#8c3a37"/>
  <rect x="-32" y="164" width="64" height="8" fill="#2a2a2a"/>
  <rect x="-20" y="128" width="40" height="36" fill="#ffe7a8"/>
  <path d="M-20,128 h40 M-7,128 v36 M7,128 v36" stroke="#2a2a2a" stroke-width="3"/>
  <path d="M-26,128 L0,100 L26,128Z" fill="#2a2a2a"/><rect x="-1.5" y="88" width="3" height="14" fill="#2a2a2a"/>
  <rect x="-6" y="250" width="12" height="20" rx="6" fill="#ffd27a" opacity=".85"/>
 </g>
 <circle cx="900" cy="148" r="120" fill="url(#${id}l)"/>
 ${rain}
 </svg>`;}

function castle(id){const r=rng(19);let birds='',streaks='';
 for(let k=0;k<7;k++){const x=260+r()*300,y=150+r()*120,s=6+r()*8;birds+=`<path d="M${x-s},${y-s*.4} Q${x-s*.4},${y-s*.5} ${x},${y} Q${x+s*.4},${y-s*.5} ${x+s},${y-s*.4}" fill="none" stroke="#3a2340" stroke-width="2.2" stroke-linecap="round"/>`;}
 for(let k=0;k<8;k++)streaks+=`<ellipse cx="${r()*1200}" cy="${120+r()*260}" rx="${160+r()*260}" ry="${6+r()*10}" fill="${r()<.5?'#ffb3a1':'#f7d0b5'}" opacity="${.25+r()*.3}"/>`;
 const tw=(x,w,h,top)=>`<rect x="${x}" y="${top}" width="${w}" height="${h}"/><path d="M${x-4},${top} L${x+w/2},${top-w*1.4} L${x+w+4},${top}Z"/>`;
 return `<svg viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%;display:block">
 <defs>
  <linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2152"/><stop offset=".35" stop-color="#6e4579"/><stop offset=".62" stop-color="#d9806f"/><stop offset=".8" stop-color="#f6c48c"/></linearGradient>
  <radialGradient id="${id}u"><stop offset="0" stop-color="#fff2c9"/><stop offset=".2" stop-color="#ffd590" stop-opacity=".8"/><stop offset="1" stop-color="#ff9f6e" stop-opacity="0"/></radialGradient>
  <filter id="${id}f" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="18"/></filter>
 </defs>
 <rect width="1200" height="700" fill="url(#${id}s)"/>
 <circle cx="420" cy="470" r="330" fill="url(#${id}u)"/><circle cx="420" cy="470" r="62" fill="#fff4d4"/>
 ${streaks}
 ${ridge(rng(23),440,110,28,'#8c5a86')}
 <ellipse cx="500" cy="470" rx="600" ry="40" fill="#ffd2c0" opacity=".45" filter="url(#${id}f)"/>
 ${ridge(rng(29),510,90,26,'#5c3d6e')}
 ${ridge(rng(31),590,60,22,'#3a2a52')}
 <path d="M600,700 C700,520 780,430 900,410 C1010,395 1100,430 1200,470 L1200,700Z" fill="#221838"/>
 <g fill="#1a1230">${tw(830,34,90,330)}${tw(880,60,100,320)}${tw(950,28,150,260)}${tw(990,70,90,330)}${tw(1070,30,110,310)}
  <rect x="860" y="360" width="230" height="70"/><path d="M860,360 h230 v-8 h-10 v-6 h-10 v6 h-10 v-6 h-10 v6 h-10 v-6 h-10 v6 h-10 v-6 h-10 v6 h-10 v-6 h-10 v6 h-10 v-6 h-10 v6 h-10 v-6 h-10 v6 h-10 v-6 h-10 v6 h-10 v-6 h-10 v6 h-10 v-6 h-10 v6 h-10 v-6 h-10 v6 h-10 v-6 h-10 v6 h-10v8z"/></g>
 <g fill="#ffcf7a"><rect x="962" y="300" width="5" height="9" rx="2"/><rect x="905" y="345" width="5" height="8" rx="2"/><rect x="1015" y="355" width="5" height="8" rx="2"/><rect x="845" y="365" width="4" height="7" rx="2"/><rect x="1082" y="340" width="4" height="7" rx="2"/><rect x="925" y="390" width="5" height="8" rx="2"/></g>
 <ellipse cx="380" cy="640" rx="560" ry="40" fill="#f2c2c8" opacity=".35" filter="url(#${id}f)"/>
 ${birds}
 </svg>`;}

function seaCover(id){const r=rng(41);let p='';for(let k=0;k<40;k++)p+=`<circle cx="${r()*400}" cy="${r()*600}" r="${r()*3+1}" fill="#bff3ff" opacity="${r()*.5}"/>`;
 return `<svg viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%;display:block"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b7c92"/><stop offset=".5" stop-color="#0d3d5c"/><stop offset="1" stop-color="#061629"/></linearGradient><radialGradient id="${id}r" cx=".5" cy="0" r="1"><stop offset="0" stop-color="#d6fbff" stop-opacity=".5"/><stop offset=".6" stop-color="#d6fbff" stop-opacity="0"/></radialGradient></defs>
 <rect width="400" height="600" fill="url(#${id})"/><rect width="400" height="600" fill="url(#${id}r)"/>${p}
 <g fill="#05101e" opacity=".9"><path d="M120,330 c40,-30 110,-30 150,0 c-40,30 -110,30 -150,0z M270,330 l40,-25 v50z"/><circle cx="150" cy="326" r="4" fill="#bff3ff"/></g>
 <path d="M0,600 C60,520 80,470 60,420 C110,470 120,540 140,600Z M400,600 C350,540 330,480 350,430 C300,480 290,550 280,600Z" fill="#04121c"/></svg>`;}
function glassCover(id){const r=rng(53);let b='';for(let k=0;k<14;k++){const x=20+k*27,h=120+r()*260;b+=`<rect x="${x}" y="${600-h-90}" width="22" height="${h}" fill="#c7f0ff" opacity="${.1+r()*.3}" stroke="#e6faff" stroke-opacity=".5"/>`;}
 return `<svg viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%;display:block"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2d1e5c"/><stop offset=".55" stop-color="#7a3f8f"/><stop offset="1" stop-color="#ec8fae"/></linearGradient></defs>
 <rect width="400" height="600" fill="url(#${id})"/><circle cx="300" cy="140" r="60" fill="#ffe5f0" opacity=".85"/>${b}<rect y="510" width="400" height="90" fill="#1d1238"/></svg>`;}
function emberCover(id){const r=rng(61);let e='';for(let k=0;k<50;k++)e+=`<circle cx="${r()*400}" cy="${r()*600}" r="${r()*2.5+.5}" fill="#ffb35c" opacity="${r()}"/>`;
 return `<svg viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%;display:block"><defs><radialGradient id="${id}" cx=".5" cy=".75" r=".8"><stop offset="0" stop-color="#f08a3c"/><stop offset=".35" stop-color="#7a2b1f"/><stop offset="1" stop-color="#1a0b0d"/></radialGradient></defs>
 <rect width="400" height="600" fill="url(#${id})"/>${e}<path d="M200,300 C240,360 250,400 230,450 C220,420 205,410 200,400 C195,420 175,430 170,450 C150,400 160,360 200,300Z" fill="#ffd27a" opacity=".9"/></svg>`;}


  let n = 0;
  const TEMAS = [
    { id: 'floresta', name: 'Floresta ao luar', fn: forest },
    { id: 'farol', name: 'Farol na tempestade', fn: lighthouse },
    { id: 'aurora', name: 'Castelo na aurora', fn: castle },
    { id: 'mar', name: 'Fundo do mar', fn: seaCover },
    { id: 'brasa', name: 'Noite de brasas', fn: emberCover },
    { id: 'vidro', name: 'Cidade de vidro', fn: glassCover },
  ];
  const byId = Object.fromEntries(TEMAS.map((t) => [t.id, t]));
  return {
    temas: TEMAS,
    svg(id) { const t = byId[id] || TEMAS[0]; return t.fn('art' + (++n) + '_'); },
    name(id) { return (byId[id] || TEMAS[0]).name; },
  };
})();
