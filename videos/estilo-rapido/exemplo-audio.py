import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
SR=44100; D=20.0; n=int(SR*D); t=np.arange(n)/SR
rng=np.random.default_rng(31)
def filt(x,kind,fc,order=2): return sosfilt(butter(order,fc,kind,fs=SR,output='sos'),x)
def env(points): return np.interp(t,[p[0] for p in points],[p[1] for p in points])
nz=lambda: rng.standard_normal(n)
sfx=np.zeros((n,2))
def put(t0,sig,pan=0.5,g=1.0):
    i=int(t0*SR)
    if i>=n or i<0: return
    e=min(n,i+len(sig)); s=sig[:e-i]*g; sfx[i:e,0]+=s*np.cos(pan*np.pi/2)*1.4; sfx[i:e,1]+=s*np.sin(pan*np.pi/2)*1.4
def bed(sig,pts,g=1.0,st=7000):
    sfx[:,0]+=sig*env(pts)*g; sfx[:,1]+=np.roll(sig,st)*env(pts)*g
# ---------- efeitos do ElevenLabs ----------
SM={}
def smp(k):
    if k not in SM:
        d,sr=sf.read(f'sfx/{k}.wav'); d=d if d.ndim==2 else np.stack([d,d],1)
        d=sosfilt(butter(4,7500,'low',fs=SR,output='sos'),d,axis=0)
        d=d/max(1e-9,np.abs(d).max()); SM[k]=d
    return SM[k]
def ps(t0,k,g=1.0,dur=None,fin=0.3,fout=0.8,pan=0.5,off=0.0):
    d=smp(k); i0=int(off*SR); d=d[i0:]
    if dur: d=d[:int(dur*SR)]
    L=len(d); e=np.ones(L); nf=int(fin*SR); no=int(fout*SR)
    if nf>0: e[:nf]=np.linspace(0,1,min(nf,L))[:nf] if nf<=L else np.linspace(0,1,L)
    if no>0 and no<L: e[-no:]*=np.linspace(1,0,no)
    i=int(t0*SR)
    if i>=n: return
    end=min(n,i+L); seg=d[:end-i]*e[:end-i,None]*g
    sfx[i:end,0]+=seg[:,0]*np.cos(pan*np.pi/2)*1.41; sfx[i:end,1]+=seg[:,1]*np.sin(pan*np.pi/2)*1.41
def loop(t0,t1,k,g):
    t=t0
    while t<t1-0.5:
        L=len(smp(k))/SR-1.5; dd=min(L,t1-t); ps(t,k,g,dur=dd+1.2,fin=1.2,fout=1.2,off=0.5); t+=dd
ps(0,'harbor',0.35,dur=4.6,fin=0.3,fout=0.8); loop(0,4.6,'ocean',0.2)
ps(4.2,'flag',0.35,dur=4.3,fin=0.3,fout=0.8)
ps(7.8,'planes_away',0.5,dur=4.6,fin=0.8,fout=0.8); ps(9.4,'flyby',0.55,pan=0.6,dur=3,fin=0.2,fout=0.8)
ps(12.2,'memorial',0.3,dur=4,fin=0.3,fout=0.6); ps(12.2,'ocean',0.2,dur=4,fin=0.3,fout=0.6)
ps(16,'harbor',0.3,dur=4,fin=0.1,fout=1.2); ps(16.1,'aa_gun',0.3,dur=3.8,fin=0.2,fout=1.2,pan=0.3); ps(16.3,'flak',0.3,dur=3.6,fin=0.2,fout=1.2,pan=0.7)
sfx=filt(sfx.T,'high',28).T
sfx/=max(1e-9,np.abs(sfx).max())
# ---------- música ----------
mus=np.zeros((n,2))
def hz(m): return 440*2**((m-69)/12)
def add(sig,start,pan=0.5,g=1.0):
    i=int(start*SR)
    if i>=n: return
    e=min(n,i+len(sig)); s=sig[:e-i]*g; mus[i:e,0]+=s*np.cos(pan*np.pi/2); mus[i:e,1]+=s*np.sin(pan*np.pi/2)
def ad(L,a,r):
    x=np.ones(L); na=max(1,int(a*SR)); nr=max(1,int(r*SR)); x[:na]=np.linspace(0,1,na)**1.5; x[-nr:]*=np.linspace(1,0,nr)**1.5; return x
def strings(m,dur,g=1.0,bright=6):
    L=int(dur*SR); tt=np.arange(L)/SR; f=hz(m); s=np.zeros(L)
    for det in (-0.005,0,0.004):
        vib=1+0.004*np.sin(2*np.pi*5.1*tt+rng.random()*6); ph=2*np.pi*np.cumsum(f*(1+det)*vib)/SR
        for k in range(1,bright+1): s+=np.sin(k*ph)/(k**1.25)/3
    return s*ad(L,min(1.8,dur*.35),min(2.2,dur*.4))*g*0.10
def stac(m,g=1.0):
    L=int(0.26*SR); tt=np.arange(L)/SR; ph=2*np.pi*hz(m)*tt; s=sum(np.sin(k*ph)/k for k in range(1,7))
    return s*np.exp(-tt*13)*np.minimum(1,tt*400)*g*0.085
def timp(m,g=1.0):
    L=int(1.6*SR); tt=np.arange(L)/SR; f=hz(m)*(1+0.25*np.exp(-tt*30)); ph=2*np.pi*np.cumsum(f)/SR
    return (np.sin(ph)+0.4*np.sin(1.5*ph))*np.exp(-tt*3.2)*g*0.22+filt(rng.standard_normal(L),'low',300)*np.exp(-tt*26)*g*0.1
def snare(g=1.0):
    L=int(0.12*SR); tt=np.arange(L)/SR; return filt(rng.standard_normal(L),'band',[900,4500])*np.exp(-tt*38)*g*0.06
def brass(m,dur,g=1.0):
    L=int(dur*SR); tt=np.arange(L)/SR; ph=2*np.pi*hz(m)*tt; s=sum(np.sin(k*ph)*(0.9**k) for k in range(1,12))
    return filt(s,'low',1800)*ad(L,0.25,0.8)*g*0.05
CH={'Dm':(26,38,50,57,62,65),'Bb':(22,34,46,53,58,62),'Gm':(19,31,43,55,58,62),'A':(21,33,45,52,57,61),'Eb':(27,39,51,58,63,67)}
cuts=[0,4.2,8.2,12.2,16.0,20]; prog=['Dm','Bb','Gm','Eb','Dm']
for i,c in enumerate(prog):
    st=cuts[i]; L=cuts[i+1]-st; notes=CH[c]; inten=[0.6,0.7,0.85,0.55,0.9][i]
    for j,m in enumerate(notes): add(strings(m,L+1.5,(1.4 if j<2 else 0.7)*inten,6),st,0.25+0.1*j)
    add(timp(notes[1],0.6*inten),st,0.5)
    nk=int(L*4)
    for k in range(nk):
        if i==3: break
        m=notes[2] if k%4!=3 else notes[3]
        add(stac(m-12 if k%8<6 else m-5,(0.9 if k%4==0 else 0.5)*inten),st+k*0.25,0.42)
for k in range(8): add(timp(26,0.5),16.0+k*0.5,0.5)
rev=np.zeros_like(mus)
for d,g in ((0.037,.5),(0.053,.42),(0.079,.36),(0.127,.3),(0.21,.22),(0.33,.16),(0.47,.1)):
    k=int(d*SR); rev[k:]+=mus[:-k]*g
mus=mus*0.75+rev*0.55
mus=filt(mus.T,'high',28).T
mus*=env([(0,0),(0.4,.8),(18.5,.9),(20,0)])[:,None]
mus/=np.abs(mus).max()
# ---------- narração ----------
NAR={'a':0.4,'b':5.3,'c':11.3}
nar=np.zeros(n)
for k,t0 in NAR.items():
    d,sr=sf.read(f'nar/{k}.wav'); d=d if d.ndim==1 else d.mean(1); i=int(t0*SR); e=min(n,i+len(d)); nar[i:e]+=d[:e-i]
    print(k,t0,round(t0+len(d)/SR,2))
nar=nar/np.abs(nar).max()*0.92
# abaixar música/efeitos sob a voz (sidechain suave)
a=np.abs(nar); k=int(0.05*SR); sm=np.convolve(a,np.ones(k)/k,'same')
voice=np.clip(sm/0.05,0,1)
from scipy.ndimage import maximum_filter1d, uniform_filter1d
voice=uniform_filter1d(maximum_filter1d(voice,int(0.5*SR)),int(0.35*SR))
duck_m=1-0.55*voice; duck_s=1-0.6*voice
mix=mus*0.24*duck_m[:,None]+sfx*0.34*duck_s[:,None]+np.stack([nar,nar],1)
mix*=env([(0,0),(0.05,1),(19.0,1),(20,0)])[:,None]
mix=np.tanh(mix*1.05)/np.tanh(1.05)
mix/=np.abs(mix).max()/0.95
sf.write('audio.wav',mix.astype(np.float32),SR)
print('ok')
