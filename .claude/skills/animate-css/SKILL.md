---
name: animate-css
description: Usar as animações prontas do Animate.css (fadeIn, bounceIn, zoomIn, slideInUp, flipInX, heartBeat, backInDown… 97 no total) nos vídeos deste repositório SEM quebrar o render quadro a quadro. Use quando pedirem "animate.css", uma entrada/saída pronta tipo bounce/zoom/flip, ou um efeito clássico de CSS em vídeos feitos com seek(t) (HTML + Playwright) ou com Remotion.
---

# Animate.css nos vídeos (render determinístico)

Biblioteca: Animate.css 4.1.1 (Hippocratic License 2.1 — uso livre, exceto usos que violem direitos humanos).
- Arquivo pronto: `ferramentas/animate-css/animate.min.css` (copie para a pasta do vídeo, junto com o `LICENSE`).
- No Remotion: `ferramentas/claude-motion` já tem o pacote (`import 'animate.css';`).
- Lista de efeitos e prévia: https://animate.style

## O problema
Animações CSS rodam no relógio real do navegador. Nos nossos vídeos cada quadro é calculado pelo tempo `t`
(`seek(t)` com Playwright, ou `useCurrentFrame()` no Remotion). Se a animação "correr sozinha", o render sai
tremido ou fora de sincronia. **Regra: a animação nunca toca sozinha — ela é posicionada no tempo exato.**

## Jeito 1 — páginas seek(t) (HTML + Playwright)
```html
<link rel="stylesheet" href="animate.min.css">
<div id="titulo" class="animate__animated animate__bounceIn" style="--animate-duration:.8s">Título</div>
```
```js
// no fim de window.seek(t): posiciona cada animação CSS no tempo do filme
const INICIO = { titulo: 1.5 };            // quando cada elemento começa (segundos do filme)
for (const a of document.getAnimations()) {
  a.pause();
  const id = a.effect?.target?.id; const t0 = INICIO[id] ?? 0;
  a.currentTime = Math.max(0, (t - t0) * 1000);   // antes do início fica no 1º quadro da animação
}
```
Antes de `t0`, esconda o elemento (opacity 0) se a animação não começar invisível.

**Obrigatório no render:** abra o Chromium com
`--disable-threaded-animation --disable-gpu-rasterization --disable-checker-imaging --run-all-compositor-stages-before-draw`.
Sem isso o Chrome reaproveita a "imagem" da camada animada e o mesmo instante sai diferente conforme o quadro anterior
(testado aqui: ~7 mil pixels diferentes sem as flags, zero com elas).

## Jeito 2 — Remotion
```tsx
const frame = useCurrentFrame(); const {fps} = useVideoConfig();
const t0 = 1.5, atraso = -(frame / fps - t0);           // atraso negativo = já começou há (t - t0) s
<div className="animate__animated animate__zoomIn"
     style={{animationPlayState: 'paused', animationDelay: `${atraso}s`, animationFillMode: 'both', ['--animate-duration' as string]: '0.8s'}} />
```

## Gosto (combine com as skills de motion design)
- Prefira entradas sóbrias (`fadeInUp`, `zoomIn`, `backInUp`, `flipInX`) para texto; deixe `bounce`, `rubberBand`,
  `tada`, `heartBeat`, `jello` para UM destaque por vídeo (botão de inscrever, logo).
- Ajuste a duração por `--animate-duration`; saídas mais curtas que entradas.
- Não misture com transições CSS próprias; o resto do movimento continua em molas/beziers do `seek(t)`.
- Revise com quadros (contact sheet) como sempre: a animação deve estar no mesmo ponto em todo render.
