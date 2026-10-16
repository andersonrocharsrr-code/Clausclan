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

Jogo web instalável (PWA, sem build) de sobrevivência num apocalipse zumbi, com câmera isométrica (2.5D)
que aproxima e afasta (pinça, roda do mouse ou botões ＋/－), paredes que se recortam perto do personagem,
névoa pela linha de visão e paleta dessaturada. Não existe vitória:
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
- **Som**: todos os efeitos são sintetizados na hora (Web Audio, sem arquivos): tiros diferentes por arma, golpes,
  vidro quebrando, portas, gemidos dos zumbis com direção e distância, passos, martelo, machado, motor que acelera,
  batidas, buzina, sirene, alarme, trovão, chuva, vento, fogo, gerador, grilos à noite e coração quando a saúde
  está baixa. Liga/desliga no menu ⋯.
- O jogo salva sozinho no aparelho. A morte é permanente.

---

# Fibra — treinador visual de musculação (`treino/` e `treino-android/`)

App web instalável (PWA, sem build) e app Android (APK): um treinador de musculação no bolso que mostra
**o que fazer, como fazer, quanto fazer e quando descansar**.

Abra `treino/index.html` por um servidor (GitHub Pages, ou `python3 -m http.server` na raiz e acesse
`http://localhost:8000/treino/`). No celular, use o menu do navegador → "Instalar app" / "Adicionar à tela inicial".

## O que faz
- **Plano sob medida**: no primeiro acesso o app pergunta nome, objetivo (ganho de massa, força,
  condicionamento ou manutenção), dias por semana (2 a 6) e nível, e monta uma sugestão de rotina
  (corpo inteiro, empurrar/puxar/pernas ou superior/inferior) com séries, repetições e descanso de acordo
  com o objetivo. Iniciantes recebem versões mais fáceis de aprender. Mostra um aviso de saúde antes.
- **Início**: "Olá, nome", treino do dia com grupos musculares, número de exercícios, tempo estimado e
  intensidade, botão grande **Começar treino**, a semana e um resumo da evolução (treinos, semanas seguidas,
  % de aumento da carga média).
- **Figura animada em cada exercício** (desenhada pelo app, sem vídeo): posição inicial → movimento →
  posição final, com **câmera lenta**, músculos trabalhados destacados e marcas de técnica:
  🟢 trajetória correta, 🔴 limite que não deve ser ultrapassado, 🟡 abdômen estabilizado.
- **Guia de cada exercício**: passo a passo, **erros a evitar** e músculos trabalhados (60 exercícios).
- **Treino guiado**: um exercício por vez, "Série 1/4", carga e repetições com botões − / +, o que você fez
  da última vez e **✓ Série concluída**. Depois vem a tela de **descanso** (contagem regressiva, −15 s / +15 s,
  respiração guiada, prévia da próxima série) e **Próxima série →**. Cronômetro para prancha e cardio,
  aquecimento e drop set, troca/reordenação de exercícios e anotações. A tela fica acesa durante o treino e,
  no app Android, o fim do descanso avisa mesmo com a tela bloqueada.
- **Evolução**: tabela semana a semana (carga e repetições) e gráfico de cada exercício, recordes pessoais
  (1RM estimado), frequência semanal, volume, séries por grupo muscular e **medidas corporais**
  (peso, cintura, quadril, peito, braço, coxa e % de gordura).
- **Perfil**: refazer o plano, tema claro/escuro, descanso padrão, som e avisos, backup/restauração (`.json`)
  e exportação para planilha (`.csv`).

## Imagens licenciadas (opcional)
Cada exercício em `treino/data.js` aceita um campo `media` com o caminho de um GIF, WebP ou vídeo (MP4/WebM).
Quando existe, o app mostra essa mídia no lugar da figura animada (o vídeo também tem câmera lenta).

## App Android
O projeto Capacitor fica em `treino-android/`. O GitHub Actions (`.github/workflows/fibra-apk.yml`) gera o APK
a cada mudança em `treino/` ou `treino-android/`. No `main`, com o segredo `NEXA_SIGNING_SEED` configurado (o
mesmo do Nexa Money), publica em:
`https://github.com/andersonrocharsrr-code/Clausclan/releases/download/fibra/fibra.apk`.
Sem o segredo, o APK de teste fica em "Artifacts" na execução.

## Observações
- Os dados ficam salvos **somente neste aparelho**. Faça backup de vez em quando (Perfil).
- O app oferece orientações gerais; não é prescrição médica nem substitui um profissional.

---

# Fechamento de Caixa — app de caixa semanal (`caixa/`)

App web instalável (PWA, sem build) que faz as contas da folha **CAIXA** e **lê fotos com IA** (Claude).

Abra `caixa/index.html` por um servidor (GitHub Pages, ou `python3 -m http.server` na raiz e acesse
`http://localhost:8000/caixa/`). No celular, use o menu do navegador → "Adicionar à tela inicial".

## O que faz
- **Foto das notas**: o app lê número, cliente, cidade, valor e se a nota foi paga nos 25% ou nos 40%/50%,
  e coloca cada uma na lista certa (dá para mover com um toque). Aceita várias fotos de uma vez e vai somando.
  Itens lidos ficam marcados em amarelo para conferir.
- **Pepino extra** (nota impressa, 2 fotos): a 1ª do **topo** (nº, cidade, cliente) cria a nota; a 2ª do **final**
  lê cada pagamento com a data e lança **só o que foi pago na semana do caixa** (segunda a domingo, pela data da folha).
  Ex.: na folha de 05/10, um pagamento de 09/10 entra e o de 12/10 fica para a outra semana (aviso na nota).
  Datas com o zero cortado lido como 8/9/6 ("88/10") são acertadas pelo calendário.
- **Foto da folha de fechamento** (em branco ou preenchida à mão): identifica os campos e preenche o app.
- Contas automáticas: **V. pep. 5%** (5% do "foi cobrar"), totais das notas, **pepino extra** e
  **recebimento** = notas 25% + notas 40/50% + antecipados + pepino extra + pepino parcial (o valor dos pepinos fica só como registro).
- **3 abas**: Recebimento, Despesas e Depósito.
- **Despesas**: ajuda de custo, vale adiantado, salário (só entra na conta se for preenchido), mecânica,
  despesas supervisor, excedido, **despesas do Pila** (refeição, salário, hotel ou outra), Outros e OBS.
- **Depósito**: lance cada depósito que fez — escolha onde (empresa/espécie, banco/TED ou Pix; vem marcado pela
  semana: semana 1 = empresa), digite o valor e toque em **Lançar depósito**. Nada é lançado sozinho. O app mostra
  **quanto falta depositar** = recebimento − despesas − já depositado, recalculado sempre que entra recebimento ou despesa.
  O Pix é só controle no app. Na folha gerada vai o **total a depositar** num campo só: Depto. empresa espécie na
  semana de pagamento, Depto. banco/TED nas outras.
  A semana vem impressa na folha CAIXA: tire a foto da folha em branco no início da semana e o app pega a semana (e
  cidade, nome, data, foi cobrar e qt. de notas). O app não adivinha pela data. Ele confere o "foi cobrar" com o
  V. pep. 5% impresso; se a folha for de outra semana, o fechamento atual é salvo em ☰ e começa um novo.
- **Notas feitas (vendas)**: uma linha por dia (dia, Ab, Rp, valor). A soma vira o **Valor deixado**
  e as **Notas deixadas** da folha (não entram nas contas do caixa).
- **Nº de pinos / Valor dos pepinos**: o valor é digitado e só abre depois que o Nº de pinos é preenchido. Na folha
  (e no resumo) eles somam também os pepinos parciais (quantidade e o que ficou devendo) e as notas em branco
  (quantidade e valor sem os 25%: × 0,75).
- **Notas antecipadas**: uma linha por nota (nome e valor); o total vira **Antecipados**.
- **Pepino parcial** (aba Relatório): por nota, só valor da nota, recebido e devolução. O que ficou devendo é
  calculado com os 25%, aparece discreto no canto: (nota − devolução) × 0,75 − recebido (nota 436, devolveu 118,
  nada pago → 238,50). O recebido entra no recebimento; nas notas em branco sai a nota inteira (sem o valor da nota:
  devolução + (recebido + devendo) ÷ 0,75). No relatório, o parcial é o que ficou devendo.
- **Data automática**: a data do fechamento acompanha o calendário (ao abrir, ao voltar ao app e na virada do dia).
  Mudada à mão, vale só naquele dia; numa semana nova a data não pula e o app avisa para começar o fechamento novo.
  Antecipadas, pepino extra e pepino parcial entram no recebimento.
- **Gerar caixa** (fim da semana): monta a folha CAIXA igual à impressa, já preenchida — o impresso em preto
  e o preenchido em azul com letra de mão (fonte Caveat, `caixa/fonts/`, licença OFL). Antes avisa o que pode
  estar faltando (depósito, valor deixado, assinatura, itens para conferir). **Salvar na galeria** (no APK vai
  para Imagens/Caixa pelo plugin nativo `CaixaNativePlugin`; no site baixa o PNG), mandar a imagem ou imprimir (no
  site). O desenho fica em `caixa/folha.js`.
- **Relatório** (aba própria): o relatório diário no modelo do vendedor, preenchido com o que foi lançado.
  Notas pagas do dia (25% / 40%) e total, recebido do dia e total, pepino extra resolvido no dia (pelas datas dos
  pagamentos) e total, depósitos do dia, valor em mãos, notas feitas e antecipadas (do dia e total, pelas
  listas). Cada item da lista guarda o dia em que foi pago/lançado (as notas, o dia em que a foto foi lida) e os
  totais contam só até o dia do relatório. Notas feitas: Ab (abertura) + Rp (reposição) por dia. O pepino parcial
  do relatório é quanto a cliente ficou devendo: cada valor é lançado (pode lançar várias vezes no dia); o do dia soma
  os lançamentos do dia e o total soma todos até o dia do relatório. Notas em branco = notas
  a cobrar menos as pagas/parciais, pelo valor da nota (25%: recebido ÷ 0,75, com a comissão da cliente; 40% e 50%: o próprio recebido, pois a nota quitada é paga cheia; ou o TOTAL impresso, quando lido; arredondado para o real)
  mais a devolução ("TOTAL DE DEVOLUCOES", lido da foto e conferido com os itens devolvidos, ou digitado na nota). Placa, modelo, locadora, Km e supervisor
  ficam guardados para as próximas semanas. Mandar pelo WhatsApp ou copiar.
- Listas de lançamentos (notas, pepinos, antecipadas, notas feitas, despesas, depósitos, parcial) ficam recolhidas:
  **Ver lançamentos (N)** abre a lista (mostra também quantas estão para conferir); ao adicionar uma linha ela abre sozinha.
- Cada aba lembra onde a tela parou. **Puxar para atualizar**: no topo, arrastar para baixo e soltar recarrega o app
  (sem a introdução; dados, aba e posição continuam).
- **Notificações** (☰ → 🔔; bolinha vermelha no ☰ quando há aviso): lembrete escrito para cada dia da semana;
  "Vamo receber esses parcial" quando um pepino parcial passa de 24 h ainda devendo; na quinta, faltando mais de 7
  notas e mais de R$ 6.000 para a meta da rota (Capital: 25 notas feitas / R$ 22.000 de valor deixado; Município:
  30 notas / R$ 32.000; escolhida em ☰ → 🎯 Meta pessoal), "Vamos fechar essa rota até sexta-feira"; na sexta, faltando mais de 4 notas e R$ 3.000 ou mais, "Quero
  essa rota fechada hoje". No APK os mesmos avisos vão para a **barra de notificações do celular** (plugin
  `@capacitor/local-notifications`), agendados no Android: lembrete às 8h, quinta/sexta às 8h, parcial 24 h depois
  de lançado e depois às 9h de cada dia enquanto estiver devendo; só entre 8h e 18h (o que cairia de noite vai para as 8h seguintes). São refeitos a cada mudança nos lançamentos.
- **Meta pessoal** (☰ → 🎯): o vendedor define a meta dele (valor deixado e notas feitas) e escolhe a meta da rota
  (Capital ou Município). O app mostra quanto falta deixar, quantas notas faltam e a média por nota (sem centavos, arredondada para mais no próximo valor par) para fechar até
  sexta-feira (e por dia); no sábado e no domingo, se ainda não fechou, recalcula para o dia. Barras de progresso.
- **Salvar fechamento**: depois do primeiro salvamento, salva sozinho a cada 30 min se algo mudou; abrir um salvamento
  pergunta antes ("Carregar último salvamento?").
- **Introdução** ao abrir: a maquininha imprime a nota do fechamento, o carimbo "FECHADO ✓" bate e aparece "Fechamento de Caixa" (≈4 s; um toque pula).
- **Remover lançamento**: o ✕ pergunta antes (mostra o tipo, o nome e o valor); depois de remover, uma barra embaixo
  oferece **Desfazer** por 3 segundos e devolve o lançamento ao mesmo lugar.
- **Lançamentos travados**: depois de lançada, a linha só muda em **Editar** → **✓ Lançar** (sair sem lançar desfaz). Linha nova
  só conta depois de lançada. Notas feitas: cada linha é uma nota (Ab ou Rp) e o valor; editada em outro dia, só o valor
  acrescentado entra no relatório daquele dia.
- **Campos de dinheiro** começam em 0,00 e os números entram pela direita (617 → 6,17; 61700 → 617,00).
- Salvar fechamentos e mandar resumo pelo WhatsApp.

## App Android (APK) — pasta `caixa-android/`
O mesmo app empacotado com **Capacitor**: lê as fotos pela IA do mesmo jeito, com câmera e galeria.
No Android, "Mandar resumo" e "Mandar / salvar" da folha gerada abrem o compartilhar do celular
(o WebView não imprime). O botão voltar fecha janelas e volta para a 1ª aba.

O APK é gerado pelo GitHub Actions (`.github/workflows/caixa-apk.yml`) a cada mudança em `caixa/` ou
`caixa-android/`. No `main`, com o segredo `NEXA_SIGNING_SEED`, ele fica no link fixo:
https://github.com/andersonrocharsrr-code/Clausclan/releases/download/caixa/caixa.apk
Sem o segredo (ou fora do `main`) sai um APK de teste em "Artifacts" na execução.

## Leitura das fotos (⚙)
- **Gratuita** (padrão): leitor de texto no próprio celular (Tesseract.js, o mesmo do Nexa Money; baixado na 1ª vez).
  Lê o que é **impresso**: as notas (cupom térmico: cliente, cidade e o valor de "Recebi o valor de R$…" /
  "Total de pagamentos"; "Nota quitada com 25% de desconto" = notas 25%, "Nota quitada" = notas 40% e 50%, com 50%
  quando a comissão é metade do TOTAL) e o cabeçalho da folha CAIXA (semana, data, foi cobrar, qt. de notas).
  Fotos pequenas são ampliadas; o zero cortado da impressora lido como 8/9 nos centavos vira ,00. A folha é tentada em
  4 giros e 2 tamanhos, juntando o que cada tentativa leu. Se não achar nada, mostra o que o leitor enxergou.
  Uma nota por foto, esticada e nítida. Não lê letra de mão (pepino extra). Código em `caixa/leitor.js`.
- **IA econômica** (Claude Haiku, centavos) e **IA mais precisa** (Claude Opus): leem foto tremida e letra de mão.
  Precisam da chave da API da Anthropic (console.anthropic.com), salva só no aparelho; cada foto é cobrada na sua conta.

---

# Confirma Nota — confirmação de compra e cobrança (`confirma/` e `confirma-android/`)

App para mandar duas mensagens automáticas pelo WhatsApp e acompanhar as respostas.

- **✅ Confirmação**: "Aqui é Mary, o motivo do meu contato é SOMENTE para confirmar a sua nota com vendedor … no dia …".
  Campos **Nome da cliente** (com 🎤 para falar e preencher), **Nome do vendedor** (toque e escolha na lista
  cadastrada em Ajustes, ou cadastre um novo ali mesmo), **Data da nota** (sai como `07.08.2026`) e **Telefone** (também com 🎤: fale os números e ele vira `(68) 99212-6985`).
- **💰 Cobrança**: "Me chamo Mary, Trabalho na empresa FC ENXOVAIS com o vendedor de enxoval … nota em aberto … no
  valor de 215,00 tal qual venceu no dia 18/05/2026 …". Campos cliente (🎤), vendedor (lista), **Valor da nota**,
  **Venceu no dia** e **Telefone** (com 🎤).
- Nas duas abas a mensagem aparece pronta, com saudação automática (Bom dia / Boa tarde / Boa noite), e os botões
  **Enviar no WhatsApp**, **Copiar** e **Compartilhar**.
- **📋 Contatos**: confirmações ficam "Aguardando" até **✅ Respondeu** (anota o valor da compra); cobranças ficam
  "Em aberto" até **💵 Pagou** (anota o valor pago). Separados em blocos (Confirmações e Cobranças) com a quantidade; com mais de 3, os outros ficam recolhidos em
  "▾ Ver todas as … (N)". Filtros por tipo e por situação; "Cobrar de novo" reabre o WhatsApp.
- **⚙️ Ajustes**: nome da atendente, empresa, lista de vendedores, os dois modelos de mensagem
  (`{saudacao}`, `{cliente}`, `{atendente}`, `{empresa}`, `{vendedor}`, `{data}`, `{valor}`, `{vencimento}`),
  lembrete para cobrar a resposta (1 h a 2 dias), resumo diário das pendentes e backup em `.json`.
- **App Android** (`confirma-android/`, Capacitor): ditado por voz nativo do Android e **notificações** agendadas
  no celular (funcionam com o app fechado). O APK é gerado pelo GitHub Actions (`.github/workflows/confirma-apk.yml`);
  no `main`, com o segredo `NEXA_SIGNING_SEED`, sai no link fixo
  `https://github.com/andersonrocharsrr-code/Clausclan/releases/download/confirma/confirma.apk`.
