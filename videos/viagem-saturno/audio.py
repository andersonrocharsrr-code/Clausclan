# Trilha da viagem (61 s): "vuuum" da dobra espacial, grave espacial e acorde na chegada em Saturno.
import sys, numpy as np, wave
SR=48000; DUR=61.0; t=np.arange(int(SR*DUR))/SR
rng=np.random.default_rng(9)
def env(a,b,c,d): return np.clip((t-a)/max(b-a,1e-3),0,1)*np.clip((d-t)/max(d-c,1e-3),0,1)
def tom(f,amp,vib=.002): return amp*np.sin(2*np.pi*f*t*(1+vib*np.sin(2*np.pi*.07*t))+rng.uniform(0,6))
som=(tom(55,.45)+tom(82.4,.22))*env(0,3,57,61)
# dobra espacial: ruído grave filtrado que sobe e desce (0–20 s)
r=rng.standard_normal(len(t))
for _ in range(10): r=np.convolve(r,np.ones(32)/32,'same')
vel=np.clip(t/3,0,1)*np.clip((18-t)/6,0,1)
som+=r*6.0*vel*(.6+.4*np.sin(2*np.pi*t*.5))
# pulso grave crescente na dobra
som+=np.sin(2*np.pi*(40+30*vel)*t)*.25*vel
acorde=sum(tom(f,a) for f,a in [(220,.08),(277.2,.06),(329.6,.06),(440,.03)])
som+=acorde*env(18,26,40,48)                       # sistema solar
acorde2=sum(tom(f,a) for f,a in [(196,.09),(246.9,.07),(293.7,.07),(392,.05),(587.3,.02)])
som+=acorde2*env(44,54,58,61)*1.3                  # chegada em Saturno
som*=np.minimum(1,t/1.5)*np.minimum(1,(DUR-t)/2.5)
som/=np.abs(som).max()/0.6
st=np.stack([som,np.roll(som,300)],1)
w=wave.open(sys.argv[1],'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((st*32767).astype('<i2').tobytes()); w.close()
