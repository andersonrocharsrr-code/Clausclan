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

# Nexa Money — controle de gastos e entradas (`gastos/`)

App web instalável (PWA, sem build) para organizar **gastos e entradas do mês**, com **orçamento**,
**limites por categoria**, **calculadora automática** e **lembretes por data**. Abre com uma animação da marca
(o N se desenhando) e uma tela de início com o botão **Acessar meu painel**.

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
  Aviso com vibração no dia combinado, mensagem do WhatsApp personalizável (com sua **chave Pix**), **recibo**
  em imagem/PDF e **ficha por pessoa** (histórico, totais e se costuma pagar em dia).
- **Previsão do fim do mês**: saldo de hoje + fixos, contas dos lembretes e cobranças que ainda vão cair,
  menos o gasto do dia a dia estimado; diz quanto dá para gastar por dia para não fechar no vermelho.
- **Gastos que se repetem**: detecta assinaturas e contas mensais (custo por mês e por ano), avisa quando algo
  ficou mais caro e transforma em fixo com um toque.
- **Modo privacidade** (👁 no topo): esconde todos os valores da tela.
- **Lembrete diário** para lançar os gastos do dia (menu ⋯).
- **Atalhos no ícone**: segure o ícone do app para Falar gasto, Ler comprovante, Nova cobrança ou Novo gasto.
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

---

# Fazenda Aurora — jogo de fazenda (`fazenda/`)

Jogo web instalável (PWA, sem build) para gerenciar uma fazenda, com **mapa animado** da propriedade:
animais passeando, moinho girando, fumaça na chaminé, peixes nadando, riacho correndo, tratores rodando nas
estradas, nuvens, pássaros, chuva e ciclo de dia e noite.

Abra `fazenda/index.html` por um servidor (GitHub Pages, ou `python3 -m http.server` na raiz e acesse
`http://localhost:8000/fazenda/`). No celular, use "Adicionar à tela inicial" para instalar.

## Como funciona
- **Lavouras**: 8 campos (3 liberados, os outros à venda). 16 culturas: alface, cenoura, milho, milho para silagem,
  trigo, amendoim, tomate, soja, abóbora, girassol, feijão, arroz, morango, cana, algodão e café, liberadas por nível.
  Toque num campo para plantar; quando brilhar, toque de novo para colher. Adubo acelera e aumenta a colheita.
- **Animais**: vacas (leite), bois e porcos (engordam e valem mais), cavalos (renda com passeios), ovelhas (lã),
  galinhas (ovos) e tanque de tilápias. Eles comem sozinhos do armazém: silagem no pasto, grãos no chiqueiro e no
  galinheiro, ração no tanque. Cercados podem ser ampliados.
- **Máquinas**: compra e venda de tratores (50, 110 e 220 cv), colheitadeira, pulverizador, quadriciclo e caminhão.
  Tratores maiores liberam culturas pesadas e rendem mais; cada uso desgasta e pede revisão.
- **Mercado**: preços mudam a cada dia de jogo, compra de insumos e **encomendas** que pagam acima do mercado.
- O progresso fica salvo no aparelho, e a fazenda continua produzindo por até 4 h com o app fechado.

---

# Último Dia — sobrevivência zumbi (`ultimo-dia/`)

Jogo web instalável (PWA, sem build) de sobrevivência num apocalipse zumbi, visto de cima. Não existe vitória:
o objetivo é sobreviver o máximo de dias numa cidade que caiu.

Abra `ultimo-dia/index.html` por um servidor (GitHub Pages, ou `python3 -m http.server` na raiz e acesse
`http://localhost:8000/ultimo-dia/`). Funciona no celular (joystick na tela) e no computador (teclado e mouse).

## Como funciona
- **Mundo**: cidade gerada a cada partida com casas, casas abandonadas, mercados, postos, hospital, delegacia,
  oficina, escola, igreja e fábrica, além de fazendas, floresta, lagos e rodovias. Móveis (geladeira, armário,
  guarda-roupa, armário de remédios, armário de armas…) têm saque de acordo com o lugar. Portas trancadas, janelas
  que quebram (e cortam), visão bloqueada por paredes e telhados que só se abrem quando você olha para dentro.
- **Sobrevivência**: fome, sede, sono, fôlego, temperatura (roupa, chuva, fogo), estresse, medo, dor, enjoo, peso
  carregado e ferimentos (arranhão, corte, mordida, tiro, queimadura, fratura) com sangramento, curativos que sujam,
  infecção e antibióticos. A mordida infecta e não tem cura. A comida estraga; enlatados duram para sempre.
- **Combate**: faca, taco, pé de cabra, martelo, facão, machado, lança, pistola, revólver, espingarda,
  submetralhadora, rifle e molotov. Armas desgastam, munição é rara e **todo barulho atrai zumbis**.
- **Zumbis**: lentos, recém-infectados, corredores e brutamontes. Seguem o som, contornam paredes, derrubam portas,
  barricadas e muros, ficam dentro dos prédios e migram em **hordas** pelo mapa — mesmo longe de você.
- **Construção**: barricadas (até 3 camadas), cercas, muros de madeira e metal, portões, baús, cama improvisada,
  fogão improvisado, gerador, torre de vigia, canteiro (horta), coletor de chuva e bancada. Desmonte móveis para
  conseguir tábuas e pregos, corte árvores e serre troncos.
- **Veículos**: carro, caminhonete, moto, caminhão, trator, ambulância e viatura, com combustível, bateria, pneus,
  motor e lataria. Precisa da chave (achada em casas e corpos) ou de ligação direta. Atropelar zumbis estraga o carro.
- **Habilidades** que sobem com o uso (e com livros): corpo a corpo, armas de fogo, construção, mecânica, medicina,
  agricultura, sobrevivência (pesca, caça, coleta) e furtividade. Sete profissões iniciais.
- **Mundo dinâmico**: dia e noite, chuva, tempestade com trovões, neblina, a energia e a água acabam alguns dias
  depois, incêndios que se espalham, plantas que crescem, rádio com avisos.
- **Sobreviventes**: comerciantes (troca com crédito), famílias que pedem remédios e depois aparecem na sua base
  pedindo para entrar, sobreviventes que podem entrar no grupo, pedidos de socorro e saqueadores que assaltam você
  e atacam a base.
- O jogo salva sozinho no aparelho. A morte é permanente.
