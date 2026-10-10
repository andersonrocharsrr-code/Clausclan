import numpy as np, random, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont
W,H=1080,2340
rng=np.random.default_rng(7); random.seed(7)
yy,xx=np.mgrid[0:H,0:W].astype(np.float32)
# space background
bg=np.zeros((H,W,3),np.float32)
bg[...,0]=4+6*(yy/H); bg[...,1]=6+10*(yy/H); bg[...,2]=14+30*(yy/H)
# planet: big circle centered below-left
cx,cy,R=-500,2900,1900
d=np.sqrt((xx-cx)**2+(yy-cy)**2)
inside=d<R
t=np.clip((R-d)/R,0,1)
planet=np.stack([30+80*t**0.3,60+90*t**0.3,110+100*t**0.3],-1)
bg=np.where(inside[...,None],planet,bg)
rim=np.exp(-((d-R)/18)**2)
glow=np.exp(-np.clip(d-R,0,None)/140)*(~inside)
bg+=rim[...,None]*np.array([120,190,255])+glow[...,None]*np.array([20,60,140])
# orange fire streak (curve)
streak=np.zeros((H,W),np.float32)
img=Image.new('L',(W,H),0); dr=ImageDraw.Draw(img)
pts=[(int(W*0.95-(i/200)**1.6*W*1.1), int(1150+(i/200)**1.2*1300)) for i in range(201)]
for i,(x,y) in enumerate(pts):
    r=int(4+i*0.35); dr.ellipse([x-r,y-r,x+r,y+r],fill=255)
s=np.asarray(img.filter(ImageFilter.GaussianBlur(40)),np.float32)/255
core=np.asarray(img.filter(ImageFilter.GaussianBlur(8)),np.float32)/255
bg+=s[...,None]*np.array([255,110,20])*1.3+core[...,None]*np.array([255,230,180])
# stars
for _ in range(900):
    x,y=rng.integers(0,W),rng.integers(0,int(H*0.7))
    if not inside[y,x]: bg[y,x]+=rng.uniform(80,255)
bg=np.clip(bg,0,255).astype(np.uint8)
base=Image.fromarray(bg)
# tall segmented digits
time=sys.argv[1] if len(sys.argv)>1 else "0236"
SEG={'0':'abcdef','1':'bc','2':'abged','3':'abgcd','4':'fgbc','5':'afgcd','6':'afgedc','7':'abc','8':'abcdefg','9':'abcdfg'}
def digit(dr,x0,y0,w,h,th,ch):
    m=y0+h//2
    seg={'a':(x0,y0,x0+w,y0+th),'d':(x0,y0+h-th,x0+w,y0+h),'g':(x0,m-th//2,x0+w,m+th//2),
         'f':(x0,y0,x0+th,m),'b':(x0+w-th,y0,x0+w,m),'e':(x0,m,x0+th,y0+h),'c':(x0+w-th,m,x0+w,y0+h)}
    for k in SEG[ch]: dr.rectangle(seg[k],fill=255)
mask=Image.new('L',(W,H),0); md=ImageDraw.Draw(mask)
dw,dh,th,gap=200,900,52,30
tx=(W-(4*dw+3*gap))//2; ty=330
for i,c in enumerate(time): digit(md,tx+i*(dw+gap),ty,dw,dh,th,c)
fade=np.clip(1-(yy-(ty+dh*0.45))/(dh*0.6),0,1)
m=(np.asarray(mask,np.float32)/255*fade*255).astype(np.uint8)
shadow=Image.new('RGB',(W,H),(0,0,0))
base.paste(shadow,(0,0),Image.fromarray(m).filter(ImageFilter.GaussianBlur(25)).point(lambda v:v*0.6))
base.paste(Image.new('RGB',(W,H),(245,247,255)),(0,0),Image.fromarray(m))
f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',52)
d2=ImageDraw.Draw(base); txt="25 NOV 2028"
d2.text(((W-d2.textlength(txt,font=f))/2,240),txt,font=f,fill=(235,238,250))
base.save(sys.argv[2] if len(sys.argv)>2 else 'out.png')
