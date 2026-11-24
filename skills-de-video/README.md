# Skills de vídeo do Clausclan

Índice de todas as skills de vídeo e animação instaladas neste repositório.

As skills de verdade ficam em `.claude/skills/<nome>/`, porque é só ali que o Claude as reconhece. Esta pasta é só o
guia; nada aqui precisa ser movido. As ferramentas de apoio (motores, exemplos, sons) ficam em `ferramentas/`.

Total: **32 skills**: 31 de vídeo, instaladas entre nov/2026 e esta data, mais a `anatomy`, que já existia.

---

## Qual usar? (guia rápido)

| Você quer… | Use |
|---|---|
| Vídeo longo de documentário (3–4 min) no padrão Starship / Recorte Dourado, com narração | o motor próprio dos vídeos em `videos/` (ver `videos/recorte-dourado/README.md`) |
| Intro, vinheta ou "sting" curto (5–15 s) cheio de movimento | **product-launch-motion** (fizemos a do Fã da História e o sting do canal) |
| Vídeo em Remotion (React) bem acabado | **motion-design** + **review-loop** (claude-motion), com as regras do **klik-anim** |
| Produção completa e guiada: perguntas → storyboard aprovado → plano → vídeo | **klik-remotion-method** |
| Efeitos sonoros sintetizados no tempo da imagem | **sound-design** (sem baixar nada) |
| Efeitos sonoros reais de uma biblioteca de sons livres | **sound-effects** |
| Animações por cima de um vídeo de alguém falando | **motion-broll** |
| Recortar uma pessoa ou objeto do fundo do vídeo | **object-separation** (melhor no seu computador) |
| Simulação: enxames, partículas, máquina em 3D com a câmera voando | **web-sims** |
| Entradas prontas tipo bounce/zoom/flip | **animate-css** |
| Ilustração técnica isométrica e interativa (site, explicação) | **anatomy** |

---

## 1. claude-motion — kit de motion design para Remotion

Origem: [whaleyxbt/claude-motion](https://github.com/whaleyxbt/claude-motion) · licença MIT. Ferramentas em `ferramentas/claude-motion/`.

| Skill | Para que serve |
|---|---|
| `motion-design` | Regras de bom gosto com números: curvas de movimento, molas, tempo de leitura, tipografia, cor, textura e transições. |
| `review-loop` | Revisão obrigatória: renderiza um rascunho, monta uma folha com um quadro por batida, confere e corrige antes de entregar. |
| `sound-design` | Motor de som em Python, sem baixar nada. Gera cliques, whooshes, impactos, sinos e fundo musical, no tempo exato e com volume de −14 LUFS. |
| `web-sims` | Vídeos de simulação feitos como uma página HTML e capturados a 60 fps. |

Feito com ele: `videos/vinheta-remotion.mp4` (vinheta Mistérios do Universo).

## 2. Howseen — motion design em HTML

Origem: [howseen-ai/claude-motion-design](https://github.com/howseen-ai/claude-motion-design) · MIT. Exemplo em `ferramentas/claude-motion-design/`.

| Skill | Para que serve |
|---|---|
| `motion-design-html` | Filmes feitos só com código: HTML, navegador e ffmpeg, com desfoque de movimento, cortes na batida, efeitos no pico do som, revisão com notas e modo de copiar um vídeo de referência quadro a quadro. Renomeada de `motion-design` para não conflitar com a do claude-motion. |

Feito com ela: `videos/vinheta.mp4` (primeira vinheta Mistérios do Universo).

## 3. motion-graphics — Barty-Bart

Origem: [Barty-Bart/motion-graphics](https://github.com/Barty-Bart/motion-graphics) · MIT (os sons vêm com `LICENSES.md`).

| Skill | Para que serve |
|---|---|
| `motion-broll` | Recebe um vídeo de alguém falando e o texto da fala e cria animações que entram no momento de cada palavra. |
| `object-separation` | Recorta pessoa, produto ou mão do fundo do vídeo com o modelo SAM 2. É pesada; roda melhor no computador. |
| `explainer-high-energy` | Promo agitada de 12–20 s, com cortes na batida e texto animado. |
| `explainer-default` | Demonstração limpa de 45–90 s de um aplicativo ou produto. |
| `explainer-engaging` | Explicação de 10–30 s numa tomada só, com a câmera seguindo um elemento. |
| `sound-effects` | Efeitos sonoros reais de uma biblioteca livre, com a música na batida e volume medido. |

## 4. remotion-motion-graphics — haidrrrry

Origem: [haidrrrry/claude-remotion-skill](https://github.com/haidrrrry/claude-remotion-skill) · MIT. Exemplo em `ferramentas/claude-remotion-skill/`.

| Skill | Para que serve |
|---|---|
| `remotion-motion-graphics` | Regras para o Remotion não ficar "genérico de IA": sem movimento linear, entradas com 2–3 propriedades, elementos em sequência, fundo animado, grão e vinheta, além de uma biblioteca de componentes. A descrição dela diz para usar "toda vez" que se pede vídeo, então ela tende a entrar sozinha. |

## 5. Klik — t3knobox

Origem: [t3knobox/klik-anim-skill-creation](https://github.com/t3knobox/klik-anim-skill-creation) · **sem arquivo de licença** (o README manda instalar em projetos).

| Skill | Para que serve |
|---|---|
| `klik-anim` | Leis de animação para tudo que se mexe dentro da cena (tempo, ordem, onde o olho vai, tempo de leitura, efeitos sem repetição) e um verificador automático: `node .claude/skills/klik-anim/scripts/lint-motion.mjs <pasta>`. |
| `klik-cam` | Leis da câmera, com um controle de energia de 0 a 5: aproximações, órbitas, profundidade e desfoque. |
| `klik-remotion-method` | Método completo: perguntas fixas → storyboard aprovado em quadros → plano congelado → construção → revisão. Vídeos de 30 s ou mais gastam muito do limite de uso. |

## 6. Skills oficiais do Remotion

Origem: [remotion-dev/skills](https://github.com/remotion-dev/skills). É o pré-requisito do Klik: a fonte oficial de como o Remotion funciona.

| Skill | Para que serve |
|---|---|
| `remotion-best-practices` | Ponto de partida: direciona para as outras skills do Remotion. |
| `remotion-create` | Cria um projeto de vídeo Remotion novo. |
| `remotion-docs` | Pesquisa a documentação do Remotion. |
| `remotion-render` | Exporta vídeo, imagem ou linha do tempo editável. |
| `remotion-studio` | Abre a prévia ao vivo (Remotion Studio). |
| `remotion-markup` | Boas práticas de conteúdo, animação e efeitos. |
| `remotion-interactivity` | Deixa camadas e tempos editáveis no Studio. |
| `remotion-captions` | Transcreve a fala e anima legendas. |
| `remotion-maps` | Mapas animados. |
| `remotion-multimedia` | Lê e manipula arquivos de áudio e vídeo (Mediabunny). |
| `remotion-saas` | Constrói um aplicativo em cima do Remotion. |
| `remotion-upgrade` | Atualiza o Remotion e os pacotes ligados a ele. |
| `remotion-license` | Informações de licença do Remotion: empresas com mais de 3 pessoas precisam de licença paga. |

## 7. product-launch-motion — Abubakr Chan

Origem: [AbubakrChan/product-launch-motion](https://github.com/AbubakrChan/product-launch-motion) · MIT (os filmes de exemplo não vieram; ver `NOTICE`).

| Skill | Para que serve |
|---|---|
| `product-launch-motion` | Filmes de lançamento: uma forma que nunca corta, cursor que clica e arrasta, molas, música que guia o tempo, efeitos no pico do som e desfoque de movimento a 60 fps. |
| `product-launch-motion-v1` | Versão antiga, guiada por narração, com GSAP e HyperFrames. Pode precisar de bibliotecas que não foram testadas aqui. |

Feito com ela: `videos/sting-canal.mp4` (sting Mistérios do Universo) e `videos/intro-fa-da-historia.mp4` (intro do Fã da História).

## 8. animate-css — criada aqui

Biblioteca [Animate.css 4.1.1](https://github.com/animate-css/animate.css) · Hippocratic License 2.1. Arquivo em `ferramentas/animate-css/`.

| Skill | Para que serve |
|---|---|
| `animate-css` | Usa as 97 animações prontas (bounceIn, zoomIn, flipInX…) sem quebrar o render quadro a quadro. Diz como posicionar cada animação no tempo exato e quais opções do navegador evitam diferenças entre renders. |

## 9. Já existia antes

| Skill | Para que serve |
|---|---|
| `anatomy` | Figuras isométricas em SVG, interativas, para explicar ideias técnicas. Foi usada no Hangar Escola (tubo de Pitot do AF447). |

---

## Observações deste ambiente

- **Navegador:** já está instalado. No Node use `require('playwright')` direto; no Python, `executable_path="/opt/pw-browsers/chromium"`. No Remotion, `--browser-executable=/opt/pw-browsers/chromium`.
- **Narração em português:** voz do Rodrigo Custódio (ElevenLabs).
- **Dependências Python já instaladas:** playwright, numpy, pillow, imageio-ffmpeg, librosa, soundfile, matplotlib.
- **Cada skill tem uma nota "Clausclan" no topo** do `SKILL.md` com o que muda neste repositório.
- **Atualizar uma skill:** baixe de novo o repositório de origem e copie a pasta por cima, mantendo a nota "Clausclan".
