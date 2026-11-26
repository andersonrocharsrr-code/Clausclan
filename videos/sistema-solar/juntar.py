# Encaixa as viagens corrigidas (out/voo*.mp4) por cima do vídeo inteiro e junta com o som → ../sistema-solar.mp4
import json, subprocess, pathlib
A = pathlib.Path(__file__).resolve().parent; O = A / 'out'
voos = json.load(open(O / 'voos.json')); cmd = ['ffmpeg', '-v', 'error', '-y', '-i', str(O / 'video.mp4')]
for nome, f0 in voos: cmd += ['-itsoffset', f'{f0 / 30:.6f}', '-i', str(O / nome)]
cmd += ['-i', str(O / 'mix.wav')]; fc = []; ant = '0:v'
for k, (nome, f0) in enumerate(voos, 1): fc.append(f'[{ant}][{k}:v]overlay=eof_action=pass:repeatlast=0[v{k}]'); ant = f'v{k}'
cmd += ['-filter_complex', ';'.join(fc), '-map', f'[{ant}]', '-map', f'{len(voos) + 1}:a', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p',
        '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-shortest', str(A.parent / 'sistema-solar.mp4')]
subprocess.run(cmd, check=True); print('JUNTOU')
