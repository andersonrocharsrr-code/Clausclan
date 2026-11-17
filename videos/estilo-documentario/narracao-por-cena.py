import json,subprocess,sys,re
exec(open('nar.py').read().split('only=sys.argv')[0].replace('import json,subprocess,sys',''))  # carrega T
T['4b']="Bombardeiros B-26 Marauder e torpedeiros TBF Avenger aproximaram-se da frota japonesa. Outras formações, incluindo bombardeiros B-17, também participaram das operações."
S={}
for k in T: S.setdefault(k[0],[]).append(k)
keys=sorted(S)
def gen(sc,seed,out):
    txt=' '.join(T[k] for k in S[sc]);i=keys.index(sc)
    d={"text":txt,"model_id":"eleven_multilingual_v2","language_code":"pt","seed":seed,
       "voice_settings":{"stability":0.75,"similarity_boost":0.8,"style":0.0,"use_speaker_boost":True,"speed":1.08}}
    if i>0: d["previous_text"]=' '.join(T[k] for k in S[keys[i-1]])[-400:]
    if i<len(keys)-1: d["next_text"]=' '.join(T[k] for k in S[keys[i+1]])[:300]
    r=subprocess.run(["curl","-sS","-o",out+".mp3","-w","%{http_code}","-X","POST","-H","xi-api-key: proxy-injected","-H","Content-Type: application/json","-d",json.dumps(d),
      "https://api.elevenlabs.io/v1/text-to-speech/2xzOKgdTB2i5ia63CcIn?output_format=mp3_44100_128"],capture_output=True,text=True)
    subprocess.run(["ffmpeg","-y","-v","error","-i",out+".mp3","-af","silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse",out+".wav"])
    return r.stdout
def stt(wav):
    r=subprocess.run(["curl","-sS","-X","POST","-H","xi-api-key: proxy-injected","-F","model_id=scribe_v1","-F","language_code=pt","-F","timestamps_granularity=word","-F",f"file=@{wav}","https://api.elevenlabs.io/v1/speech-to-text"],capture_output=True,text=True)
    return [w for w in json.loads(r.stdout)['words'] if w['type']=='word']
if __name__=='__main__':
    sc=sys.argv[1];seeds=[int(x) for x in sys.argv[2:]] or [4242]
    for sd in seeds:
        out=f"nar2/{sc}_{sd}";print(sc,sd,gen(sc,sd,out),flush=True)
        w=stt(out+".wav");json.dump(w,open(out+".json","w"))
        gaps=[(round(w[i+1]['start']-w[i]['end'],2),w[i]['text'],w[i+1]['text']) for i in range(len(w)-1)]
        print(' | '.join(f"{a}>{b}:{g}" for g,a,b in gaps if g>0.3))
