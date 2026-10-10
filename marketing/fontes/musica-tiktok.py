import numpy as np, wave, sys
SR=44100; B=60/128; NB=34; DUR=NB*B+0.6; N=int(SR*DUR)
L=np.zeros(N); R=np.zeros(N); rng=np.random.default_rng(7)
f=lambda m:440*2**((m-69)/12)
def add(sig,start,amp=1.0,pan=0.0):
    i0=int(start*SR); n=min(len(sig),N-i0)
    if n<=0: return
    L[i0:i0+n]+=sig[:n]*amp*(1-pan); R[i0:i0+n]+=sig[:n]*amp*(1+pan)
def tt(d): return np.arange(int(d*SR))/SR
def kick(): t=tt(.35); return np.sin(2*np.pi*np.cumsum(45+160*np.exp(-t*35))/SR)*np.exp(-t*9)
def clap():
    t=tt(.25); n=rng.standard_normal(len(t)); env=np.exp(-t*22)
    for d in (0.01,0.02): env+=np.exp(-np.clip(t-d,0,None)*60)*(t>d)*.6
    return np.convolve(n,np.ones(6)/6,'same')*env*.6
def hat(d=.05): t=tt(d); n=rng.standard_normal(len(t)); return (n-np.convolve(n,np.ones(3)/3,'same'))*np.exp(-t*90)
def sub(m,d): t=tt(d); return np.tanh(2.2*np.sin(2*np.pi*f(m)*t))*np.minimum(1,t/.005)*np.exp(-t*1.5)*np.minimum(1,(d-t)/.02)
def stab(ms,d,bright=1.0):
    t=tt(d); s=0
    for m in ms:
        for det in (-0.08,0.08):
            ph=2*np.pi*f(m+det)*t; s+=sum(np.sin(k*ph)/k*(bright**(k-1)) for k in range(1,7))
    return s/len(ms)*np.exp(-t*6)*np.minimum(1,t/.004)
prog=[(57,[69,72,76]),(53,[65,69,72]),(48,[67,72,76]),(55,[67,71,74])]  # Am F C G
# Intro (batidas 0-8): acordes filtrados + clap fraco, riser e rufada no fim
for b in range(0,8):
    root,ch=prog[(b//2)%4]
    if b%2==0: add(stab(ch,2*B,0.35),b*B,.4); add(sub(root-24,2*B-.02),b*B,.18)
    add(hat(),b*B+B/2,.14,.3)
    if b in (1,3,5): add(clap(),b*B,.5)
for k in range(16):  # rufada de caixa acelerando nas batidas 6-8
    add(clap(),6*B+k*B/8,.08+.25*k/16)
t=tt(4*B); add(rng.standard_normal(len(t))*(t/(4*B))**3*.25,4*B)
# Queda (batidas 8-32)
for b in range(8,32):
    root,ch=prog[((b-8)//2)%4]
    add(kick(),b*B,.9)
    if b%2==1: add(clap(),b*B,.45)
    for k in range(4): add(hat(.03 if k%2 else .06),b*B+k*B/4,.07 if k%2 else .11,(-.4 if k%2 else .4))
    if b%2==0: add(sub(root-24,2*B-.02),b*B,.38)
    for k,o in enumerate((0,.75,1.5)):  # stabs sincopados
        if k<2 or b%2==1: add(stab(ch,.18,.7),b*B+o*B,.09,.2*(-1)**k)
# impacto na queda e no fechamento
for b0 in (8,26):
    t=tt(1.2); add((np.sin(2*np.pi*np.cumsum(30+120*np.exp(-t*10))/SR)*.8+rng.standard_normal(len(t))*.25*np.exp(-t*8))*np.exp(-t*3),b0*B,.7)
# stutter nas palavras rápidas (24-26)
for k in range(8): add(stab(prog[0][1],.08,.9),24*B+k*B/4,.08)
# final: acorde aberto
add(stab([69,72,76,81],3,0.5),32*B,.45); add(sub(45,2.5),32*B,.3)
for s in (L,R):
    s/=1
mx=max(np.abs(L).max(),np.abs(R).max()); L/=mx*1.1; R/=mx*1.1
L=np.tanh(L*1.4)/np.tanh(1.4); R=np.tanh(R*1.4)/np.tanh(1.4)
fade=np.clip((DUR-np.arange(N)/SR)/0.8,0,1); L*=fade; R*=fade
pcm=(np.stack([L,R],1)*32000).astype(np.int16)
w=wave.open(sys.argv[1],'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close()
