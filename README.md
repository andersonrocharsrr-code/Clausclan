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

---

# Meus Gastos — controle de gastos e entradas (`gastos/`)

App web instalável (PWA, sem build) para organizar **gastos e entradas do mês**, com **orçamento**,
**limites por categoria**, **calculadora automática** e **lembretes por data**. Visual limpo, tema claro/escuro.

Abra `gastos/index.html` por um servidor (GitHub Pages, ou `python3 -m http.server` na raiz e acesse
`http://localhost:8000/gastos/`). Para instalar no celular, use **⋯ → Instalar app no celular** (ou o menu do
navegador → "Instalar app" / "Adicionar à tela inicial"): fica com ícone próprio, abre em tela cheia e funciona offline.

## O que faz
- **Lançamento rápido**: digite uma frase como `uber 23,50 ontem`, `mercado 89,90`, `tênis 300 3x` ou
  `+3500 salário`. O app reconhece valor (aceita contas), categoria, data (hoje, ontem, dia da semana, 10/03),
  forma de pagamento e parcelas.
- **Lançar por voz** (🎤): fale "gastei 30 reais no mercado" e confira a prévia antes de lançar.
- **Ler comprovante pela foto** (📷): o app lê total, data e loja do cupom e abre o formulário preenchido
  (leitor de texto Tesseract.js, baixado só no primeiro uso).
- **Entradas**: salário, freelance, vendas… O Resumo mostra entradas, saídas e **saldo** do mês.
- **Quem me deve / a quem devo**: empréstimos e contas divididas, pagamentos parciais e cobrança pronta pelo WhatsApp.
- **Calendário do mês**: cada dia colorido conforme o gasto (verde → vermelho); toque para ver os gastos do dia.
- **Relatório do mês**: imagem para compartilhar (WhatsApp etc.) ou PDF.
- **Orçamento e limites por categoria**: limite geral do mês e limites como "Mercado até R$ 800".
  Avisa ao passar de 80% e de 100%.
- **Fixos automáticos**: ligue "Repetir todo mês" (aluguel, internet, salário) e o app lança sozinho no dia.
- **Resumo do mês**: destaques automáticos (variação por categoria, quanto guardou, ritmo de gastos),
  gráfico por categoria, gastos por dia e **últimos 6 meses** (saídas x entradas).
- **Faturas do cartão**: com o dia de fechamento e vencimento, soma compras no crédito e parcelas na fatura certa.
- **Categorias personalizadas** com nome, cor e ícone.
- **Metas de economia**: valor, prazo, cor e ícone. Mostra o progresso e quanto guardar por mês para
  chegar no prazo; registre quanto guardou ou retirou. Comemora quando a meta é concluída.
- **Foto do comprovante** em cada lançamento (fica salva no aparelho e vai junto no backup).
- **Calculadora** com histórico e **Dividir a conta**; parcelamento no crédito (2x–24x).
- **Lembretes** com data, horário, antecedência e repetição; "Paguei" lança o gasto e agenda o próximo.
- Exportar o mês para planilha (`.csv`), lembretes para o calendário (`.ics`) e backup `.json` completo.

## Observações
- Os dados ficam salvos **somente neste navegador/aparelho**. Faça backup de vez em quando (menu ⋯).
- Para avisos garantidos com o app fechado, exporte os lembretes para o calendário (menu ⋯).
