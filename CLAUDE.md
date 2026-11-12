# Instruções para o Claude (repositório Clausclan)

Lido no começo de cada sessão. Vale para qualquer conta do Claude ligada a este GitHub.

## Com quem você fala

- O dono é o Anderson (Rio Branco / Boca do Acre). Responda **sempre em português do Brasil**, simples e direto.
  Ele usa pelo celular e manda prints; explique o que mudou em termos de uso, não de código.
- **Nunca peça senha, token ou chave no chat.** Segredos ficam nos *secrets* do GitHub Actions
  (Settings → Secrets and variables → Actions) ou nas configurações do ambiente do Claude.

## Como trabalhar (todas as mudanças)

1. Comece do `main` atualizado, num branch de trabalho (o da sessão).
2. Faça a mudança e **teste no navegador** (Playwright) antes de enviar. Mostre prints quando for visual.
3. Commit em português, explicando o porquê. Push e **abra um PR**.
4. **Só faça o merge quando o Anderson mandar** ("Faça o merge", "Faz o merge"), e só com o CI verde.
5. Depois do merge, espere o workflow do `main` terminar e mande o link do APK (abaixo) com a versão nova.

## App Caixa (o principal): `caixa/` + `caixa-android/`

PWA estático (sem build) em `caixa/`, empacotado como APK Android com Capacitor 8 em `caixa-android/`.

- **APK:** https://github.com/andersonrocharsrr-code/Clausclan/releases/download/caixa/caixa.apk
- **CI:** `.github/workflows/caixa-apk.yml` roda em push que mexe em `caixa/**` ou `caixa-android/**`
  (no `main` e nos branches `ccr-**` / `claude/**`). No `main` publica na Release `caixa`:
  `caixa.apk`, `caixa-web.zip` e `versao.json` (`versao`, `apkMin`, `nativo`, `checksum`).

### A cada mudança em `caixa/` (obrigatório, senão o celular fica com a versão velha)

- Em `caixa/index.html`, aumente o `?v=` do arquivo que mudou (`app.js?v=N`, `style.css?v=N`…).
- Em `caixa/sw.js`, aumente `CACHE = 'caixa-vN'` e atualize a lista `FILES` com os mesmos `?v=`.
- Confira a sintaxe com `node --input-type=module --check < caixa/app.js`
  (o `node --check app.js` sozinho não pega todos os erros).

### Atualização dos celulares

- O app consulta o `versao.json` ao abrir e mostra "Versão nova" **no máximo uma vez por dia**
  (combinado com o Anderson). Quem quiser antes instala pelo link do APK.
- Mudança só em `caixa/` → atualização pelas telas (zip), sem APK novo.
- Plugin novo, permissão no `AndroidManifest.xml` ou qualquer coisa nativa em `caixa-android/` →
  o `apkMin` sobe e **precisa instalar o APK novo**. Avise o Anderson quando for o caso.

### Licença (servidor na Cloudflare)

- `cloudflare/caixa-licenca/` (Worker): cada celular tem um código fixo (ex.: `RHKX-5G45`);
  a validade vem assinada (Ed25519). Painel do dono em `/painel` (+7/+15/+30 dias, nome, bloquear).
- URL: https://caixa-licenca.andersonrocharsrr.workers.dev — a chave pública fica em `caixa/licenca-config.js`.
- Deploy: `.github/workflows/caixa-licenca.yml`, com os secrets `CLOUDFLARE_API_TOKEN`,
  `CLOUDFLARE_ACCOUNT_ID`, `CAIXA_ADMIN_SENHA` e `CAIXA_LICENCA_SEED` (nunca mude a SEED: invalida tudo).
- Celular novo no app Android ganha 7 dias de teste; sem licença os totais aparecem como "—".

### Microfone (notas por voz)

- 🎤 ao lado de "Notas 25%". No APK usa o plugin `@capgo/capacitor-speech-recognition`
  (`continuousPTT`, para só após 4 s de silêncio, sem mexer no volume: `muteRecognizerBeep: false`).
- A frase é lida por `lerFalaNota()` em `caixa/app.js`:
  - "pagou/recebido/devolveu" **ou** a faixa falada (25%, 40%, 50%, comissão) → nota paga;
  - só nome e valor → nota feita (Rp se a cliente já pagou nota na semana ou se falar "reposição"; senão Ab).
- Cliente recebe **só nome e sobrenome** (lista `NAO_NOME` corta verbos e palavras como "pegou", "mercadoria").
- Na conferência: "✓ Correto, falar mais" (verde) guarda e escuta a próxima; "✓ Pronto, lançar" (azul) lança tudo.
- Ao mudar o leitor, teste as frases antigas também (ex.: "Raimunda, 500, 25%" = R$ 500 nos 25%).

### Regras de negócio que já foram combinadas (não desfazer)

- Ordem da aba Recebimento: Ler folha, Cabeçalho, Notas quitadas, Notas 25%, Notas 40% e 50%,
  Notas feitas, Pepino parcial, Pepino extra, Notas antecipadas, Recebimento.
- Notas 25% e 40/50% têm a bolinha "Antecipado" (valor pago antes e já no sistema).
- Pepino parcial tem "↕ Mover" para 25% ou 40%: o que ela paga agora entra no recebido do dia do Mover;
  o que já tinha pago fica no dia do parcial.
- Depósito e gasto do Pila exigem foto (comprovante/recibo), guardada no aparelho (IndexedDB `caixa-fotos`).
- Puxar a tela para baixo atualiza sem recarregar a página.

### Testar no navegador

- Sirva a pasta: `cd caixa && python3 -m http.server 8765` e abra `http://127.0.0.1:8765/`.
- No Playwright: `serviceWorkers: 'block'`, `sessionStorage.setItem('caixa.semIntro','1')` (pula a abertura)
  e troque `licenca-config.js` por `window.CAIXA_LICENCA = null;` (desliga a trava da licença no teste).
- Estado de teste: `localStorage['caixa.atual']` com `{ nome, cidade, data, foiCobrar, qtNotas, notas25: [...] }`.

## Outros apps neste repositório

Cada um tem sua pasta e, quando tem APK, seu workflow em `.github/workflows/`
(ex.: `relatorios/` + `relatorios-android/`, `confirma/` + `confirma-android/`, `treino/`, `livros/`, `aviao/`).

- `trenzinho/`: videoclipe infantil "O Trenzinho das Cores" (SVG + JS sincronizado com a música).
  O que vale é o vídeo `videos/trenzinho-das-cores.mp4`; o Anderson **não quer página** para assistir.
  Mudou o desenho? Regrave o vídeo com `cd trenzinho && node gravar.js ../videos/trenzinho-das-cores.mp4`.
A mesma regra vale: testar, PR, merge só quando o Anderson mandar.
