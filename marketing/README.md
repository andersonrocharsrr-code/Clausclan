# Nexa Money — material de divulgação

Tudo o que foi feito para divulgar o app: vídeos, artes e os arquivos que geram cada um,
para poder ajustar textos, tempos, sons ou cores no futuro.

## O que tem aqui

| Pasta | Conteúdo |
|---|---|
| `videos/` | `nexa-money-anuncio-51s.mp4` (anúncio principal, fundo branco e verde, com legendas e sons) e `nexa-money-tiktok-16s.mp4` (versão rápida com cortes na batida) |
| `artes/` | Post para feed (1080×1350), Stories (1080×1920), Status do WhatsApp com rodapé livre para a legenda, e as telas da versão atual do app |
| `fontes/` | Os arquivos que geram os vídeos e as artes (explicados abaixo) |

## Arquivos de `fontes/`

| Arquivo | Para que serve |
|---|---|
| `anuncio-51s.html` | Todas as cenas, textos, legendas e tempos do anúncio de 51 s |
| `anuncio-tiktok.html` | Cenas e tempos da versão TikTok |
| `post.html` | Artes estáticas (feed, stories e status) |
| `musica-anuncio.py` | Trilha e efeitos sonoros do anúncio (cliques, pops, foto, som do sino do app) |
| `musica-tiktok.py` | Trilha da versão TikTok |
| `capturar-telas.js` | Abre o app com dados de exemplo e tira os prints `s-*.png` usados nas cenas |
| `gravar-video.js` | Grava os quadros de um vídeo a partir do `.html` |
| `gerar-posts.js` / `gerar-status.js` | Geram as artes a partir do `post.html` |
| `cupom.py` | Desenha a foto do cupom fiscal usada na cena "Fotografe" |
| `s-*.png`, `cupom.png`, `jakarta-*.woff2` | Prints do app, foto do cupom e a fonte usada |

## Como gerar de novo

Precisa de Node.js com Playwright, Python 3 com NumPy e Pillow, e ffmpeg.

```bash
cd marketing/fontes

# 1. (opcional) Atualizar os prints do app: sirva o repositório e capture
(cd ../.. && python3 -m http.server 8765 &)
node capturar-telas.js                 # telas principais
REM=1 node capturar-telas.js           # tela de lembretes e sino
VOZ=1 node capturar-telas.js           # microfone, voz reconhecida e cupom lido

# 2. Gravar o vídeo de 51 s (1530 quadros) e juntar com a trilha
mkdir -p quadros
node gravar-video.js anuncio-51s.html all quadros
python3 musica-anuncio.py musica.wav
ffmpeg -framerate 30 -i quadros/f%04d.png -i musica.wav -c:v libx264 -pix_fmt yuv420p -crf 17 \
  -af loudnorm=I=-16:TP=-1.5:LRA=11 -c:a aac -b:a 192k -shortest anuncio.mp4

# 3. Ver um quadro específico (ex.: 18,8 s e 36,6 s) sem gravar tudo
node gravar-video.js anuncio-51s.html 18.8,36.6 quadros

# 4. Artes
node gerar-posts.js      # post-1350.png (feed) e post-1920.png (stories)
node gerar-status.js     # post-status.png (status do WhatsApp)
```

## Onde mexer

- **Textos e legendas:** procure o texto dentro de `anuncio-51s.html` e troque.
- **Tempo das cenas:** cada cena tem `--s` (entrada) e `--e` (saída) em segundos; cada elemento tem `--d` (quando aparece).
- **Sons:** em `musica-anuncio.py`, cada efeito é uma linha com o segundo em que toca. O som do sino é o `app_beep()`, igual ao do app (880 Hz e 1175 Hz).
- **Cores:** variáveis no topo do `.html` (`--g1`, `--g2`, `--g3` são os verdes da marca).
