# Solara Coberturas — site

Landing page estática (HTML + CSS + JS, sem build) para uma empresa de coberturas.

Abra `index.html` no navegador ou publique a pasta em qualquer hospedagem estática
(GitHub Pages, Netlify, Vercel).

## Personalizar
- **WhatsApp:** `assets/main.js`, constante `WHATSAPP` (ex.: `5511999999999`).
- **Nome/marca, textos, contato e depoimentos:** `index.html`.
- **Cores e fontes:** variáveis no topo de `assets/style.css`.
- **Fotos:** troque as URLs das `<img>` pelas fotos reais dos seus projetos.

---

# Minhas Contas — app de contas e cobranças (`contas/`)

App web instalável (PWA, sem build) para organizar **contas a pagar** e **cobranças a receber**,
com **lembretes por data e horário**.

Abra `contas/index.html` por um servidor (ex.: GitHub Pages, ou `python3 -m http.server` na raiz
e acesse `http://localhost:8000/contas/`). No celular, use "Adicionar à tela inicial" para instalar.

## O que faz
- Cadastro de contas (💸 a pagar) e cobranças (💰 a receber): descrição, valor, pessoa/empresa,
  categoria, vencimento (data + horário), observações (código de barras, Pix…).
- **Lembretes**: no horário ou com antecedência (15 min até 1 semana). Toque em 🔔 no topo para
  permitir notificações; também toca um aviso sonoro e aparece um alerta na tela.
- **Repetição** semanal, mensal ou anual: ao marcar "Paguei"/"Recebi", o próximo vencimento é criado.
- Resumo: total a pagar, a receber, vencidos e saldo previsto. Filtros e busca.
- **Exportar para calendário (.ics)** com alarmes — use isto para receber lembretes mesmo com o
  app fechado (Google Agenda, calendário do iPhone/Android).
- Backup e restauração em arquivo `.json`.

## Observações
- Os dados ficam salvos **somente neste navegador/aparelho** (localStorage). Faça backup de vez em quando.
- As notificações do app disparam enquanto ele estiver aberto (ou em segundo plano no navegador).
  Para avisos garantidos com o app fechado, exporte para o calendário.
