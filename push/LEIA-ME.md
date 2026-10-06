# Servidor de notificações do Nexa Money

Este servidor envia as notificações do app **mesmo com o app fechado** (lembretes de contas,
cobranças do "Quem me deve", assinaturas, lembrete diário, resumo da noite e backup).

Ele roda de graça no **Cloudflare Workers** e guarda só a data, o título e o texto dos próximos
avisos de cada celular. Nenhum gasto é enviado para cá.

## Como colocar no ar (uma vez só, cerca de 10 minutos)

1. **Criar o Worker**
   - Entre em https://dash.cloudflare.com
   - No menu da esquerda, abra **Compute (Workers)** → **Workers & Pages**.
   - Toque em **Create** → **Create Worker** (ou "Start with Hello World").
   - Nome: `nexa-money-push` → **Deploy**.

2. **Colar o código**
   - Na tela do Worker, toque em **Edit code**.
   - Apague tudo o que estiver no arquivo e cole todo o conteúdo do arquivo `worker.js` desta pasta.
   - Toque em **Deploy**.

3. **Criar o banco de dados**
   - No menu da esquerda, abra **Storage & Databases** → **D1 SQL Database**.
   - **Create** → nome `nexa-money` → **Create**. (As tabelas são criadas sozinhas.)

4. **Ligar o banco ao Worker**
   - Volte em **Workers & Pages** → `nexa-money-push` → aba **Settings** (ou **Bindings**).
   - **Bindings** → **Add** → **D1 database**.
   - **Variable name:** `DB` (exatamente assim, em maiúsculas) → escolha o banco `nexa-money` → **Deploy/Save**.

5. **Ligar o agendamento a cada minuto**
   - Ainda em **Settings**, procure **Trigger events** (ou **Triggers**) → **Add** → **Cron Triggers**.
   - Escolha **Every minute** (ou digite `* * * * *`) → **Add/Save**.

6. **Conferir**
   - Abra o endereço do Worker, algo como `https://nexa-money-push.SEU-NOME.workers.dev`.
   - Deve aparecer: `{"ok":true,"app":"nexa-money-push"}`.
   - Abra também o mesmo endereço terminando em `/key`. Deve aparecer uma chave longa.
   - Envie esse endereço para ligar o app a ele.

## Como funciona

- O app cadastra o celular quando a pessoa liga o sino 🔔 e permite as notificações.
- Sempre que algo muda no app, ele envia a lista dos próximos avisos (até ~60 dias).
- A cada minuto o servidor envia os avisos que venceram (Web Push com chaves VAPID,
  criadas automaticamente na primeira vez e guardadas no banco).
- Se a pessoa desinstalar o app ou bloquear as notificações, o servidor apaga o cadastro sozinho.
