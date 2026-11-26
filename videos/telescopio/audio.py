# Som ambiente do telescópio: grave contínuo que cresce com o zoom. python3 audio.py saida.wav
import sys, numpy as np, wave
SR=48000; DUR=16.0; t=np.arange(int(SR*DUR))/SR
rng=np.random.default_rng(7)
def ease(x): x=np.clip(x,0,1); return x*x*x*(x*(6*x-15)+10)
k=ease((t-1.0)/(DUR-1.8))
som=np.zeros_like(t)
for f,a in [(55,.5),(82.4,.3),(110,.18),(164.8,.10),(220,.05)]:
    som+=a*np.sin(2*np.pi*f*t*(1+.0015*np.sin(2*np.pi*.11*t))+rng.uniform(0,6))
# ar/ruído filtrado bem suave (sem chiado)
r=rng.standard_normal(len(t)); 
for _ in range(6): r=np.convolve(r,np.ones(64)/64,'same')
som+= r*4.0*(.3+.7*k)
som*= (.35+.65*k)                       # cresce com o zoom
som*= np.minimum(1,t/1.5)*np.minimum(1,(DUR-t)/1.2)
som/= np.abs(som).max()/0.6
st=np.stack([som, np.roll(som,240)],1)
w=wave.open(sys.argv[1],'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((st*32767).astype('<i2').tobytes()); w.close()
