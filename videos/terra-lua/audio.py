# Trilha ambiente de 60 s: grave espacial, acorde que abre ao sair da Terra e cresce na chegada à Lua.
# python3 audio.py saida.wav
import sys, numpy as np, wave
SR=48000; DUR=60.0; t=np.arange(int(SR*DUR))/SR
rng=np.random.default_rng(3)
def env(a,b,c,d):  # sobe de a até b, fica, desce de c até d
    return np.clip((t-a)/max(b-a,1e-3),0,1)*np.clip((d-t)/max(d-c,1e-3),0,1)
def tom(f,amp,vib=.002):
    return amp*np.sin(2*np.pi*f*t*(1+vib*np.sin(2*np.pi*.07*t))+rng.uniform(0,6))
som = (tom(55,.5)+tom(82.4,.25))*env(0,4,56,60)                       # grave o tempo todo
acorde = sum(tom(f,a) for f,a in [(220,.10),(277.2,.07),(329.6,.07),(440,.04)])
som += acorde*env(10,20,40,50)                                         # abre quando a Terra fica inteira
acorde2 = sum(tom(f,a) for f,a in [(196,.09),(246.9,.07),(293.7,.07),(392,.05),(587.3,.02)])
som += acorde2*env(38,52,57,60)*1.3                                    # chegada à Lua
r=rng.standard_normal(len(t))
for _ in range(8): r=np.convolve(r,np.ones(48)/48,'same')
som += r*3.0*(.4+.6*env(0,5,55,60))                                    # "ar" bem grave, sem chiado
som *= np.minimum(1,t/2)*np.minimum(1,(DUR-t)/2.5)
som /= np.abs(som).max()/0.6
st=np.stack([som,np.roll(som,300)],1)
w=wave.open(sys.argv[1],'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((st*32767).astype('<i2').tobytes()); w.close()
