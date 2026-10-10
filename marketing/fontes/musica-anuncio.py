import numpy as np, wave, sys
SR=44100; DUR=51.0; N=int(SR*DUR)
M=np.zeros((N,2)); FX=np.zeros((N,2)); rng=np.random.default_rng(3)
f=lambda m:440*2**((m-69)/12)
def tt(d): return np.arange(int(d*SR))/SR
def put(buf,sig,start,amp=1.0,pan=0.0):
    i0=int(start*SR); n=min(len(sig),N-i0)
    if n<=0 or i0<0: return
    buf[i0:i0+n,0]+=sig[:n]*amp*(1-pan); buf[i0:i0+n,1]+=sig[:n]*amp*(1+pan)
def lp(x,k): return np.convolve(x,np.ones(k)/k,'same')

# ---------- Trilha animada (116 BPM) ----------
B=60/116; BAR=4*B
prog=[(48,[60,64,67,72]),(43,[59,62,67,71]),(45,[60,64,69,72]),(41,[60,65,69,72])]  # C G Am F
def tone(m,d,dec,h=(1,.35,.15,.06)):
    t=tt(d); s=sum(a*np.sin(2*np.pi*f(m)*(k+1)*t) for k,a in enumerate(h))
    return s*np.exp(-t*dec)*np.minimum(1,t/.004)
def stab(ms,d=.22): return sum(tone(m+det,d,9) for m in ms for det in (-.07,.07))/len(ms)/2
def pad(ms,d):
    t=tt(d); s=sum(np.sin(2*np.pi*f(m+det)*t) for m in ms for det in (-.05,.05))
    return s/len(ms)/2*np.minimum(1,t/.6)*np.minimum(1,(d-t)/.6)
def kick(): t=tt(.28); return np.sin(2*np.pi*np.cumsum(50+120*np.exp(-t*32))/SR)*np.exp(-t*11)
def clap():
    t=tt(.2); n=rng.standard_normal(len(t)); env=np.exp(-t*25)
    for d in (.008,.016): env=env+np.exp(-np.clip(t-d,0,None)*70)*(t>d)*.5
    return (n-lp(n,8))*env*.7
def hat(d=.05,dec=70): t=tt(d); n=rng.standard_normal(len(t)); return (n-lp(n,3))*np.exp(-t*dec)
def bass(m,d): t=tt(d); return np.tanh(1.6*np.sin(2*np.pi*f(m)*t))*np.exp(-t*4)*np.minimum(1,t/.004)*np.minimum(1,(d-t)/.02)
s=0.0; b=0
while s<DUR:
    root,ch=prog[b%4]; full=4.55<=s+0.01 and s<47.5
    put(M,pad(ch,BAR+.6),s,.07)
    if s<4.5:
        for k in range(8): put(M,hat(),s+k*B/2,.06,.3)
        for k in range(4): put(M,stab(ch),s+k*B,.15); put(M,bass(root-24,BAR),s,.08)
    if full:
        for k in range(4):
            put(M,kick(),s+k*B,.32)
            if k%2: put(M,clap(),s+k*B,.16)
            put(M,hat(.09,30),s+k*B+B/2,.05,.25)   # chimbal aberto no contratempo
            for q in (1,3): put(M,hat(),s+k*B+q*B/4,.025,-.3)
            put(M,bass(root-12,B/2-.02),s+k*B+B/2,.16)
            put(M,bass(root-24,B/2-.02),s+k*B,.10)
        for o in (0,1.5,2.5,3.5): put(M,stab(ch),s+o*B,.075,.15)
        arp=[ch[0]+12,ch[2]+12,ch[3]+12,ch[1]+12]
        for k in range(8): put(M,tone(arp[k%4],.25,14,(1,.2)),s+k*B/2+B/4,.035,-.35)
    s+=BAR; b+=1
put(M,pad([60,64,67,72,76],3.6),47.6,.16)
for k in range(4): put(M,kick(),47.6+k*B,.18*(1-k/4))

# ---------- Efeitos ----------
put0=put
def putfx(sig,start,*a):
    put(FX,sig,start+3.0 if start>=21.4 else start,*a)

def pop(p=1.0): t=tt(.12); return np.sin(2*np.pi*np.cumsum(900*p*np.exp(-t*25)+300*p)/SR)*np.exp(-t*30)
def whoosh(d=.7):
    t=tt(d); n=rng.standard_normal(len(t)); x=lp(n,12)-lp(n,60)
    return x*np.sin(np.pi*t/d)**2
def key():
    t=tt(.035); n=rng.standard_normal(len(t)); return (lp(n,2)*np.exp(-t*160)+.4*np.sin(2*np.pi*2200*t)*np.exp(-t*220))
def soft_tick(): t=tt(.04); return np.sin(2*np.pi*1800*t)*np.exp(-t*120)
def chime(ms,d=1.6,dec=3.0):
    t=tt(d); s=sum((np.sin(2*np.pi*f(m)*t)+.2*np.sin(2*np.pi*f(m)*2.76*t)*np.exp(-t*6)) for m in ms)
    return s/len(ms)*np.exp(-t*dec)*np.minimum(1,t/.005)
def app_beep():
    # Igual ao beep() do app: 880 Hz e 1175 Hz, 0,18 s de intervalo, envelope exponencial até 0,2.
    out=np.zeros(int(.6*SR))
    for i,fr in enumerate((880,1175)):
        t=tt(.17); g=np.where(t<.02,0.0001*(0.2/0.0001)**(t/.02),0.2*(0.0001/0.2)**((t-.02)/.14)); g[t>.16]=0
        seg=np.sin(2*np.pi*fr*t)*g; i0=int(i*.18*SR); out[i0:i0+len(seg)]+=seg
    return out/0.2
def tap():
    t=tt(.05); n=rng.standard_normal(len(t)); return lp(n,3)*np.exp(-t*140)+.5*np.sin(2*np.pi*600*t)*np.exp(-t*90)
def shutter():
    out=np.zeros(int(.25*SR))
    for d in (0,.09):
        t=tt(.06); n=rng.standard_normal(len(t)); seg=lp(n,2)*np.exp(-t*90); i0=int(d*SR); out[i0:i0+len(seg)]+=seg
    return out
def mic_on(): t=tt(.25); return np.sin(2*np.pi*np.cumsum(np.where(t<.11,660,990))/SR)*np.exp(-((t%.11)*25))*(t<.22)

for x in (.1,.6,1.1,1.6): putfx(pop(.8),x+.4,.12,(-.3 if x in (.1,1.1) else .3))
putfx(chime([84,91],2.0,2.5),5.95,.22)
TYPE_AT,STEP=10.1,0.075
for i in range(19): putfx(key(),TYPE_AT+i*STEP+rng.uniform(-.008,.008),.22+.06*rng.random(),.15)
putfx(chime([88,95],1.2,4),11.9,.2)
for x in (12.3,15.8,17.5,22.9,27.0): putfx(pop(1.0),x+.05,.11)
putfx(tap(),15.48,.35); putfx(mic_on(),15.6,.16); putfx(chime([88,95],1.2,4),17.35,.18); put0(FX,tap(),19.63,.35)
put0(FX,shutter(),20.9,.32); put0(FX,chime([88,95],1.2,4),21.7,.18)
for x in (22.5,37.8,39.2): putfx(soft_tick(),x+.1,.12)
for k in range(14): putfx(soft_tick(),23.1+1.2*(1-(1-k/14)**.5)*1.0,.05)
putfx(tap(),31.35,.35)
putfx(app_beep(),31.6,.42)
putfx(app_beep(),33.55,.42)
for k,x in enumerate((41.6,41.9,42.2,42.5)): putfx(pop(.9+.12*k),x+.05,.11)
putfx(chime([72,79,84,88],3.0,1.4),45.85,.22)

# Abaixa a música levemente quando há efeitos (ducking suave)
env=lp(np.abs(FX[:,0])+np.abs(FX[:,1]),int(.08*SR)); duck=1-np.clip(env*3,0,.35)
mix=M*duck[:,None]+FX
t=np.arange(N)/SR; mix*=(np.clip(t/1.0,0,1)*np.clip((DUR-t)/1.5,0,1))[:,None]
mix/=np.abs(mix).max()*1.12
pcm=(mix*32000).astype(np.int16)
w=wave.open(sys.argv[1],'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close()
