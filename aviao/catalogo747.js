/* Hangar Escola: catálogo de categorias de peças do Boeing 747-8, organizado por sistema.
   Cada linha de "itens" é "Nome | Para que serve"; a numeração (1 a 295) é contínua entre as seções. */
(() => {
'use strict';

const SECOES = [
  {
    id: 'estrutura', titulo: 'Estrutura e peças externas', parte: 'fuselagem',
    intro: 'O 747-8 existe em duas versões principais: o 747-8 Intercontinental (747-8I), para passageiros, e o 747-8 Freighter (747-8F), para cargas. A estrutura básica é semelhante, mas há diferenças importantes na configuração interna e nas portas de carga.',
    nota: 'Os itens estruturais são os principais tipos de componentes, não uma relação de cada peça individual do catálogo de fabricação.',
    itens: `Fuselagem | É o corpo principal do avião.
Revestimento externo | Forma a superfície externa e ajuda a manter a estrutura aerodinâmica.
Anteparos estruturais | Dividem e reforçam partes internas da fuselagem.
Longarinas da fuselagem | Reforçam a estrutura longitudinal do corpo.
Cavernas estruturais | Mantêm o formato da fuselagem e distribuem cargas estruturais.
Asas | Produzem a sustentação necessária para o voo.
Longarinas das asas | São elementos estruturais principais que suportam esforços de flexão.
Nervuras das asas | Mantêm o perfil aerodinâmico e distribuem esforços.
Pontas das asas | Definem as extremidades das asas e influenciam o escoamento do ar.
Bordo de ataque | É a parte dianteira da asa que encontra o ar primeiro.
Bordo de fuga | É a parte traseira da asa, onde ficam diversas superfícies móveis.
Carenagens | Cobrem mecanismos e componentes para reduzir o arrasto e proteger os equipamentos.
Radome | Cobertura aerodinâmica do radar meteorológico localizado na região dianteira.
Janelas do cockpit | Permitem que os pilotos observem o exterior.
Janelas da cabine | Permitem a entrada de luz e a visão externa dos passageiros.
Portas de passageiros | Permitem o embarque e desembarque.
Portas de carga | Permitem carregar e descarregar mercadorias.
Portas de serviço | Permitem acesso para abastecimento, manutenção e outros serviços, conforme a porta.
Escotilhas de manutenção | Facilitam o acesso a determinados equipamentos internos.
Drenos estruturais | Permitem a saída de água acumulada em locais específicos.
Antenas externas | Permitem comunicação, navegação e outras funções eletrônicas.
Luzes externas | Auxiliam a operação, a sinalização e a visibilidade da aeronave.`,
  },
  {
    id: 'asas', titulo: 'Asas e superfícies de controle', parte: 'asa',
    intro: 'As asas do 747-8 não servem apenas para manter o avião no ar. Elas também contêm mecanismos que ajudam a controlar a aeronave, modificar a sustentação e reduzir a velocidade durante o pouso.',
    nota: 'Os componentes internos dos mecanismos variam conforme a superfície e o conjunto instalado. A tabela descreve as categorias principais, sem enumerar todas as peças de cada mecanismo.',
    itens: `Flaps | Aumentam a sustentação e o arrasto, ajudando nas operações de decolagem e pouso.
Slats | Superfícies móveis no bordo de ataque que ajudam a asa a produzir sustentação em ângulos elevados.
Spoilers | Interrompem parte do fluxo de ar sobre a asa, reduzindo a sustentação e aumentando o arrasto.
Speedbrakes | Nome usado para a função de frenagem aerodinâmica realizada pelos spoilers.
Ailerons | Controlam principalmente o movimento de rolagem, inclinando o avião para a esquerda ou para a direita.
Trilhos dos flaps | Guiam o movimento dos flaps durante sua extensão e retração.
Atuadores dos flaps | Transformam a energia do sistema de acionamento em movimento dos flaps.
Atuadores dos spoilers | Movimentam os painéis de spoiler conforme os comandos do sistema de controle.
Mecanismos de transmissão | Distribuem o movimento entre componentes móveis, conforme o sistema.
Sensores de posição | Informam aos sistemas da aeronave a posição de superfícies móveis.
Dobradiças e articulações | Permitem que as superfícies móveis girem em torno de seus pontos de fixação.
Trilhos e mecanismos dos slats | Orientam o deslocamento dos slats.`,
  },
  {
    id: 'cauda', titulo: 'Cauda e estabilização', parte: 'estabv',
    itens: `Estabilizador vertical | Ajuda a manter a estabilidade direcional do avião.
Leme de direção | Controla principalmente o movimento de guinada, direcionando o nariz para a esquerda ou para a direita.
Estabilizadores horizontais | Ajudam a manter o equilíbrio longitudinal da aeronave.
Profundores | Controlam principalmente o movimento de arfagem, elevando ou baixando o nariz.
Sistema de compensação longitudinal | Permite ajustar o equilíbrio aerodinâmico e reduzir a força necessária nos comandos.
Atuadores do leme | Movimentam o leme de direção.
Atuadores dos profundores | Movimentam os profundores.
Elementos estruturais da empenagem | Suportam os esforços aerodinâmicos da cauda.`,
  },
  {
    id: 'motores', titulo: 'Motores GEnx-2B', parte: 'motor',
    intro: 'O 747-8 utiliza quatro motores turbofan General Electric GEnx-2B, desenvolvidos para essa família de aeronaves. Eles produzem o empuxo que impulsiona o avião para a frente. Cada motor contém numerosos componentes; estes são alguns dos principais.',
    nota: 'Como o motor funciona: o fan movimenta o ar; o compressor aumenta a pressão de parte desse ar; o combustível é queimado no núcleo; e os gases quentes movimentam as turbinas. A energia produzida mantém o compressor e o fan em funcionamento, enquanto o fluxo de ar gera empuxo.',
    itens: `Fan (ventilador frontal) | Acelera uma grande quantidade de ar para produzir a maior parte do empuxo.
Pás do fan | Transferem energia ao ar que passa pelo ventilador.
Cubo do fan | Sustenta e conecta as pás ao conjunto rotativo.
Carcaça do fan | Envolve e protege o conjunto frontal do motor.
Duto de entrada | Conduz o ar para o motor.
Compressor de baixa pressão | Comprime o ar nas etapas iniciais do núcleo do motor.
Compressor de alta pressão | Eleva a pressão do ar antes da combustão.
Câmara de combustão | Mistura combustível e ar comprimido e queima essa mistura.
Injetores de combustível | Distribuem o combustível na câmara de combustão.
Ignitores | Produzem a centelha necessária para iniciar a combustão.
Turbina de alta pressão | Extrai energia dos gases quentes para acionar o compressor de alta pressão.
Turbina de baixa pressão | Aciona o conjunto de baixa pressão e o fan.
Eixos do motor | Transmitem torque entre turbinas e compressores.
Rolamentos | Sustentam os eixos rotativos e reduzem o atrito.
Sistema de lubrificação | Distribui óleo para lubrificar e auxiliar no resfriamento de componentes.
Trocadores de calor do óleo | Transferem calor do óleo para outro meio de resfriamento.
Sistema de controle eletrônico do motor | Gerencia o funcionamento do motor dentro dos limites previstos.
Sensores do motor | Medem parâmetros como temperatura, pressão e velocidade de rotação.
Bocal de exaustão | Orienta a saída dos gases do motor.
Nacele | Estrutura externa que envolve e integra o motor à aeronave.
Reversor de empuxo | Redireciona parte do fluxo para ajudar a desacelerar o avião após o pouso.
Sistema de partida | Faz o motor atingir a rotação necessária para iniciar seu funcionamento.
Sistema de ignição | Fornece a energia para iniciar a combustão quando necessário.
Sistema de medição de combustível | Controla a quantidade de combustível fornecida ao motor.
Sistema de detecção de incêndio | Detecta condições de incêndio na região monitorada do motor.
Suportes do motor | Transferem os esforços do motor para a estrutura da aeronave.`,
  },
  {
    id: 'trem', titulo: 'Trem de pouso e frenagem', parte: 'trem',
    intro: 'O 747-8 possui um conjunto de trem de pouso robusto, projetado para suportar o peso da aeronave durante o taxiamento, a decolagem e o pouso.',
    extraTitulo: 'Como o avião freia?',
    extra: ['Freios das rodas: produzem atrito e dissipam energia em forma de calor.', 'Spoilers: reduzem a sustentação, transferindo mais peso para as rodas e aumentando o arrasto.', 'Reversores de empuxo: ajudam a desacelerar a aeronave após o toque na pista.', 'Resistência aerodinâmica: contribui para a perda de velocidade.'],
    nota: 'Esses recursos trabalham em conjunto, respeitando as condições de operação e as limitações de cada sistema.',
    itens: `Trem de pouso dianteiro | Sustenta a parte dianteira do avião no solo.
Trens de pouso principais | Sustentam a maior parte do peso da aeronave.
Trens de pouso da fuselagem | Conjuntos principais instalados sob a região central do corpo do avião.
Trens de pouso das asas | Conjuntos instalados sob as asas.
Amortecedores oleopneumáticos | Absorvem parte da energia do impacto durante o pouso.
Pneus | Permitem o contato das rodas com a pista.
Rodas | Sustentam os pneus e acomodam os conjuntos de frenagem.
Freios multidisco | Transformam energia cinética em calor para desacelerar a aeronave.
Discos de freio | São comprimidos durante a frenagem para gerar atrito.
Pinças e conjuntos de acionamento dos freios | Aplicam a força necessária aos discos, conforme o projeto do sistema.
Sistema antitravamento | Ajuda a evitar que as rodas travem durante a frenagem.
Sistema de direção da roda dianteira | Permite controlar a direção do avião durante o deslocamento no solo.
Atuadores de direção | Movimentam o conjunto de direção do trem dianteiro.
Portas do trem de pouso | Cobrem partes dos alojamentos quando o trem está recolhido.
Mecanismos de recolhimento | Movimentam o trem entre as posições recolhida e estendida.
Travas do trem de pouso | Mantêm o conjunto nas posições previstas de operação.
Sensores de posição | Informam se o trem está recolhido, em trânsito ou estendido.
Sistema de emergência de extensão | Permite estender o trem por um procedimento alternativo previsto para situações de falha.`,
  },
  {
    id: 'combustivel', titulo: 'Sistema de combustível', parte: 'asa',
    intro: 'O sistema de combustível armazena, distribui e fornece querosene de aviação aos quatro motores.',
    nota: 'A disposição dos tanques, as válvulas e a lógica de transferência dependem da configuração específica da aeronave. A lista reúne as principais categorias funcionais, não todos os componentes do circuito.',
    itens: `Tanques de combustível | Armazenam o combustível em compartimentos distribuídos pela aeronave.
Bombas de combustível | Movimentam o combustível pelos circuitos de alimentação e transferência.
Válvulas de combustível | Abrem, fecham ou regulam a passagem do combustível.
Tubulações | Transportam o combustível entre tanques e componentes.
Filtros | Retêm partículas e contaminantes conforme o projeto do sistema.
Sensores de quantidade | Medem a quantidade de combustível nos tanques.
Sensores de temperatura | Monitoram a temperatura do combustível em pontos determinados.
Indicadores de pressão | Permitem monitorar a pressão nos circuitos correspondentes.
Válvulas de transferência | Controlam a transferência de combustível entre compartimentos.
Válvulas de alimentação dos motores | Controlam o fornecimento de combustível aos motores.
Sistema de ventilação dos tanques | Controla a pressão dos tanques dentro dos limites previstos.
Painel de abastecimento | Permite controlar operações de abastecimento a partir do ponto de serviço apropriado.
Conexões de abastecimento | Permitem conectar o equipamento de abastecimento à aeronave.
Computador ou sistema de indicação de combustível | Processa informações e apresenta dados relevantes à tripulação.`,
  },
  {
    id: 'hidraulico', titulo: 'Sistema hidráulico',
    intro: 'O sistema hidráulico utiliza fluido pressurizado para movimentar equipamentos que exigem forças elevadas. No 747-8, há quatro sistemas hidráulicos principais, projetados para fornecer potência a diferentes equipamentos e oferecer redundância.',
    extraTitulo: 'Quais equipamentos utilizam energia hidráulica?',
    extra: ['Superfícies primárias de controle de voo.', 'Flaps e spoilers.', 'Trem de pouso.', 'Freios.', 'Direção do trem dianteiro.', 'Outros mecanismos de controle e atuação previstos no projeto.'],
    nota: 'A distribuição exata das funções entre os quatro sistemas é específica do projeto e não deve ser deduzida apenas pela semelhança entre os componentes.',
    itens: `Reservatórios hidráulicos | Armazenam o fluido hidráulico.
Bombas acionadas pelos motores | Produzem pressão hidráulica usando energia mecânica dos motores.
Bombas elétricas | Utilizam energia elétrica para fornecer pressão hidráulica nas condições previstas.
Bombas pneumáticas | Utilizam energia pneumática em funções específicas do sistema.
Tubulações hidráulicas | Transportam o fluido pressurizado.
Válvulas de controle | Direcionam o fluxo do fluido para os equipamentos necessários.
Válvulas de retenção | Impedem o fluxo reverso em circuitos específicos.
Filtros hidráulicos | Retêm partículas que poderiam danificar componentes.
Acumuladores hidráulicos | Armazenam energia hidráulica e ajudam a amortecer variações de pressão, conforme a aplicação.
Atuadores hidráulicos | Convertem pressão hidráulica em movimento mecânico.
Sensores de pressão | Monitoram a pressão nos circuitos.
Sensores de temperatura | Monitoram a temperatura do fluido.
Indicadores de quantidade | Informam a quantidade de fluido nos reservatórios.
Trocadores de calor | Ajudam a controlar a temperatura do fluido.
Vedações | Evitam vazamentos nos componentes e nas conexões.`,
  },
  {
    id: 'eletrico', titulo: 'Sistema elétrico',
    intro: 'O sistema elétrico alimenta os equipamentos eletrônicos, os instrumentos, a iluminação e diversos mecanismos da aeronave.',
    nota: 'O sistema também possui mecanismos de proteção, monitoramento e transferência de alimentação, destinados a preservar funções essenciais em caso de falha de uma fonte.',
    itens: `Geradores acionados pelos motores | Produzem energia elétrica durante o funcionamento dos motores.
Geradores da APU | Fornecem energia elétrica quando a unidade auxiliar está em funcionamento e nas condições previstas.
Baterias | Fornecem energia para determinadas funções e situações de emergência.
Barramentos elétricos | Distribuem energia para os diferentes circuitos.
Disjuntores | Protegem circuitos contra determinadas condições de sobrecorrente.
Relés | Controlam a conexão e a desconexão de circuitos elétricos.
Contatores | Comutam circuitos de potência.
Cabos elétricos | Transportam energia e sinais elétricos.
Conectores | Permitem conectar os cabos aos equipamentos.
Transformadores | Alteram níveis de tensão alternada quando necessário.
Conversores de energia | Convertem energia elétrica entre formas ou níveis necessários.
Unidades de distribuição elétrica | Distribuem e controlam a alimentação de circuitos.
Sensores elétricos | Medem grandezas elétricas ou condições dos equipamentos.
Painéis de controle | Permitem monitorar e comandar funções elétricas.
Sistema de alimentação externa | Permite receber energia elétrica de equipamentos de solo.`,
  },
  {
    id: 'apu', titulo: 'Unidade auxiliar de potência (APU)', parte: 'apu',
    intro: 'A APU é uma pequena turbina instalada na região traseira da fuselagem. Ela não substitui os quatro motores principais durante o voo normal.',
    nota: 'A APU pode fornecer energia elétrica e, conforme as condições operacionais, ar pneumático para funções da aeronave em solo e para outras situações previstas pelo projeto.',
    itens: `Entrada de ar | Fornece ar à unidade.
Compressor | Comprime o ar necessário ao funcionamento da turbina.
Câmara de combustão | Queima combustível para produzir gases quentes.
Turbina | Extrai energia dos gases da combustão.
Sistema de lubrificação | Lubrifica os componentes móveis.
Sistema de combustível | Fornece combustível à APU.
Sistema de partida | Faz a APU atingir a rotação necessária para funcionar.
Gerador elétrico | Produz energia elétrica.
Sistema de controle | Controla o funcionamento e protege a unidade.
Sensores de monitoramento | Medem condições operacionais da APU.
Dutos pneumáticos | Conduzem o ar produzido ou disponibilizado pela unidade para as funções previstas.
Escape | Conduz os gases para fora da aeronave.`,
  },
  {
    id: 'cockpit', titulo: 'Cockpit e instrumentos de voo', parte: 'cabine',
    intro: 'O cockpit é o local onde os pilotos monitoram e controlam o 747-8. Ele reúne telas eletrônicas, comandos de voo, instrumentos de navegação e sistemas de comunicação.',
    nota: 'Os computadores de controle de voo, o sistema de gerenciamento de voo e o piloto automático não são a mesma coisa. O primeiro grupo participa do controle da aeronave; o FMS auxilia no planejamento e gerenciamento da trajetória; e o piloto automático executa comandos de controle de acordo com os modos selecionados e as condições do sistema.',
    itens: `Manche (coluna de controle) | Permite aos pilotos comandar a rolagem, girando o volante, e a arfagem, empurrando ou puxando a coluna.
Pedais do leme | Permitem comandar o leme de direção.
Alavancas de potência | Permitem ajustar o empuxo solicitado aos motores.
Painel de instrumentos | Reúne controles e indicadores utilizados pela tripulação.
Telas de voo primárias (PFD) | Apresentam informações essenciais, como atitude, altitude e velocidade.
Telas de navegação (ND) | Apresentam informações de navegação e representação da rota.
Telas EICAS | Apresentam informações sobre os motores e outros sistemas, incluindo avisos e mensagens.
Painel de controle de voo automático | Permite selecionar modos de orientação e parâmetros, como altitude e velocidade.
Piloto automático | Controla os comandos de voo para manter ou modificar a trajetória conforme os modos selecionados.
Sistema diretor de voo | Apresenta indicações para orientar os pilotos na execução da trajetória comandada.
Sistema de gerenciamento de voo (FMS) | Auxilia no planejamento e na execução da navegação e do perfil de voo.
Computadores de dados aerodinâmicos | Processam dados como velocidade, altitude e pressão.
Computadores de controle de voo | Processam informações e participam do controle das superfícies de voo.
Painéis superiores | Reúnem comandos de vários sistemas, como elétrico, hidráulico e combustível.
Painel central de comandos | Agrupa controles utilizados durante a operação da aeronave.
Pedestal central | Abriga controles de potência, comunicação e outros comandos.
Cronômetros e relógios | Auxiliam no controle do tempo e em procedimentos operacionais.
Registradores de dados de voo | Registram parâmetros operacionais para análise posterior.
Gravador de voz da cabine | Registra os sons e as comunicações no cockpit, conforme os requisitos e a configuração aplicáveis.
Alarmes sonoros | Alertam a tripulação sobre determinadas condições.
Painéis de iluminação | Permitem ajustar a iluminação dos instrumentos e controles.`,
  },
  {
    id: 'navegacao', titulo: 'Navegação, comunicação e sensores', parte: 'pitot',
    intro: 'Esses equipamentos permitem determinar a posição da aeronave, identificar outras aeronaves, receber informações meteorológicas e manter contato com o controle de tráfego aéreo.',
    nota: 'A quantidade e o tipo de equipamentos instalados podem variar conforme a versão, a configuração e os requisitos operacionais.',
    itens: `Antenas GNSS/GPS | Recebem sinais de satélites para determinar a posição.
Sistemas de referência inercial | Calculam informações de atitude e movimento a partir de sensores inerciais.
Receptores de navegação por rádio | Recebem sinais de sistemas de navegação terrestres.
Receptores ILS | Recebem informações utilizadas na aproximação e no alinhamento com a pista equipada.
Rádio VHF | Permite comunicação por voz em frequências aeronáuticas.
Rádio HF | Permite comunicações de longo alcance em condições apropriadas.
Transponder | Transmite informações de identificação e outros dados solicitados pelos sistemas de vigilância.
Sistema anticolisão de tráfego (TCAS) | Ajuda a identificar conflitos com outras aeronaves e fornece alertas ou orientações de resolução.
Radar meteorológico | Detecta condições meteorológicas relevantes à frente da aeronave.
Receptor de alertas meteorológicos | Recebe informações meteorológicas transmitidas por sistemas compatíveis.
Sensores de temperatura externa | Medem a temperatura do ar exterior.
Tubos de pressão total | Captam a pressão total do ar para os sistemas de dados aerodinâmicos.
Tomadas de pressão estática | Captam a pressão estática do ambiente.
Sensores de ângulo de ataque | Medem o ângulo entre o escoamento do ar e uma referência da aeronave.
Sensores de atitude e movimento | Fornecem dados para os sistemas de navegação e controle.
Antenas de comunicação por satélite | Permitem comunicações via satélite, quando instaladas e habilitadas.
Sistemas de identificação e vigilância | Auxiliam a identificação e o acompanhamento da aeronave.`,
  },
  {
    id: 'pressurizacao', titulo: 'Pressurização, ar-condicionado e ventilação',
    intro: 'O 747-8 precisa manter condições adequadas de temperatura, pressão e circulação de ar para os passageiros, a tripulação e os equipamentos.',
    nota: 'A pressurização não significa simplesmente bombear ar para dentro da cabine. É necessário equilibrar a entrada e a saída de ar, mantendo a diferença de pressão dentro dos limites estruturais da aeronave.',
    itens: `Unidades de ar-condicionado | Tratam o ar antes de distribuí-lo pela cabine.
Compressores e turbomáquinas do sistema de tratamento de ar | Participam do condicionamento do ar, conforme a arquitetura do sistema.
Trocadores de calor | Transferem calor para ajudar a controlar a temperatura do ar.
Válvulas de controle de fluxo | Regulam a passagem de ar entre os circuitos.
Dutos de ventilação | Transportam o ar para diferentes áreas.
Ventiladores | Promovem a circulação do ar.
Difusores | Distribuem o ar na cabine.
Sensores de temperatura | Monitoram a temperatura nas zonas controladas.
Sensores de pressão da cabine | Medem a pressão interna.
Controladores de pressurização | Regulam a pressurização de acordo com os parâmetros operacionais.
Válvulas de saída de ar | Controlam a quantidade de ar que sai da cabine e, consequentemente, influenciam sua pressão.
Válvulas de segurança de pressão | Protegem a estrutura contra diferenças de pressão fora dos limites previstos.
Válvulas de admissão de ar | Controlam a entrada de ar em circuitos específicos.
Filtros de ar | Retêm partículas conforme o tipo de filtro e o circuito.
Painéis de controle ambiental | Permitem monitorar e comandar funções do sistema.`,
  },
  {
    id: 'incendio', titulo: 'Proteção contra incêndio',
    intro: 'Os sistemas de proteção contra incêndio detectam condições anormais e permitem que a tripulação tome as medidas previstas para proteger a aeronave.',
    nota: 'A proteção contra incêndio não depende de um único equipamento: envolve detecção, indicação, procedimentos operacionais e, quando aplicável, extinção.',
    itens: `Sensores de incêndio | Detectam condições compatíveis com incêndio nas áreas monitoradas.
Circuitos de detecção | Transportam os sinais dos sensores para os sistemas de monitoramento.
Painéis de alerta | Informam à tripulação sobre a detecção de incêndio.
Extintores de incêndio dos motores | Liberam agente extintor nos compartimentos previstos.
Recipientes de agente extintor | Armazenam o agente usado no sistema de extinção.
Válvulas de descarga | Controlam a liberação do agente extintor.
Sistemas de extinção da APU | Permitem combater incêndios na região protegida da unidade auxiliar.
Extintores portáteis | Permitem à tripulação combater determinados princípios de incêndio na cabine.
Detectores de fumaça | Detectam fumaça nas áreas monitoradas, como os lavatórios e compartimentos previstos.
Sistemas de detecção de fumaça nos compartimentos de carga | Monitoram as áreas de carga protegidas pelo sistema.
Alarmes e indicadores | Informam a localização ou a condição de uma ocorrência detectada, conforme o sistema.`,
  },
  {
    id: 'gelo', titulo: 'Proteção contra gelo e chuva',
    intro: 'Durante o voo, o gelo pode se formar em determinadas superfícies e prejudicar a aerodinâmica ou o funcionamento de sensores. O 747-8 possui sistemas destinados a reduzir esses riscos.',
    nota: 'Os sistemas antigelo e de degelo não são iguais: um procura impedir a formação de gelo; o outro remove o gelo que já se formou.',
    itens: `Aquecedores dos sensores de pressão | Evitam a formação de gelo em sensores protegidos pelo sistema.
Aquecedores das sondas de dados aerodinâmicos | Mantêm as sondas dentro das condições térmicas previstas.
Sistema antigelo dos motores | Ajuda a impedir a formação de gelo em áreas específicas da entrada de ar dos motores.
Sistema antigelo das asas | Protege as regiões previstas contra a formação de gelo.
Sistema de aquecimento dos para-brisas | Ajuda a evitar o congelamento e o embaçamento das superfícies transparentes.
Limpadores dos para-brisas | Removem água da superfície externa para melhorar a visibilidade.
Controladores térmicos | Regulam funções de aquecimento.
Sensores de temperatura | Fornecem informações para o controle e monitoramento térmico.
Válvulas de controle de ar quente | Regulam o fluxo de ar quente utilizado em circuitos específicos de proteção.`,
  },
  {
    id: 'oxigenio', titulo: 'Oxigênio e equipamentos de emergência',
    intro: 'O avião precisa fornecer recursos para proteger passageiros e tripulantes em situações de emergência.',
    nota: 'A configuração dos equipamentos varia conforme a versão e a organização interna da aeronave.',
    itens: `Máscaras de oxigênio dos passageiros | Fornecem oxigênio quando ocorre uma despressurização ou outra condição prevista.
Máscaras de oxigênio dos pilotos | Permitem que os pilotos recebam oxigênio em situações que o exijam.
Reservatórios ou geradores de oxigênio | Fornecem oxigênio conforme a arquitetura do sistema instalado.
Reguladores de oxigênio | Controlam o fornecimento de oxigênio aos usuários.
Tubulações de oxigênio | Transportam oxigênio nos sistemas que utilizam distribuição canalizada.
Reguladores de pressão | Controlam a pressão de fornecimento nos circuitos correspondentes.
Cilindros de oxigênio portáteis | Permitem fornecer oxigênio em situações específicas.
Escorregadores de evacuação | Ajudam os ocupantes a sair rapidamente da aeronave em uma evacuação prevista.
Saídas de emergência | Permitem a evacuação da cabine.
Iluminação de emergência | Ajuda a orientar os ocupantes quando a iluminação normal não está disponível.
Sinalização de emergência | Indica saídas e caminhos de evacuação.
Equipamentos de primeiros socorros | Permitem prestar assistência médica inicial.
Equipamentos de proteção respiratória da tripulação | Protegem a respiração em determinadas situações de emergência.`,
  },
  {
    id: 'cabine', titulo: 'Portas, cabine e equipamentos internos',
    intro: 'Esta seção se aplica principalmente ao 747-8 Intercontinental, embora parte dos componentes também exista na versão cargueira.',
    itens: `Assentos | Acomodam passageiros e tripulantes.
Trilhos dos assentos | Permitem a fixação dos assentos à estrutura da cabine.
Cintos de segurança | Retêm os ocupantes durante as fases de voo e situações previstas.
Compartimentos superiores | Armazenam bagagens de mão.
Painéis de cabine | Formam partes dos acabamentos internos.
Revestimentos do piso | Protegem o piso e proporcionam uma superfície de circulação.
Galley | É a área de preparação e organização de alimentos e bebidas.
Fornos | Aquecem alimentos.
Refrigeradores | Mantêm determinados alimentos e bebidas resfriados.
Lavatórios | Permitem a higiene pessoal dos passageiros.
Sistema de água potável | Armazena e distribui água para os pontos de consumo.
Sistema de coleta de resíduos | Recolhe e armazena os resíduos dos lavatórios.
Iluminação da cabine | Ilumina os espaços internos.
Luzes individuais de leitura | Permitem que os passageiros iluminem sua área de assento.
Alto-falantes | Reproduzem anúncios e outros sinais sonoros.
Sistema de entretenimento | Disponibiliza conteúdos audiovisuais aos passageiros, quando instalado.
Painéis de chamada da tripulação | Permitem solicitar assistência.
Detectores de fumaça dos lavatórios | Monitoram a presença de fumaça nas áreas protegidas.
Mecanismos das portas | Permitem abrir, fechar e travar as portas.
Vedações das portas | Ajudam a manter a estanqueidade da cabine pressurizada.
Sensores das portas | Informam a condição das portas aos sistemas correspondentes.`,
  },
  {
    id: 'carga', titulo: 'Compartimento de carga',
    intro: 'O 747-8F foi desenvolvido especificamente para o transporte de cargas e possui características próprias de carregamento. O 747-8I também dispõe de compartimentos de bagagem e carga.',
    nota: 'O 747-8F possui uma porta de carga no nariz, que se abre para cima, para facilitar determinadas operações de carregamento. Os equipamentos de movimentação e a disposição do compartimento dependem da configuração cargueira.',
    itens: `Piso estrutural de carga | Suporta as cargas transportadas dentro dos limites estabelecidos.
Trilhos de movimentação | Orientam o deslocamento de equipamentos de carga.
Roletes de carga | Facilitam a movimentação de paletes e contêineres compatíveis.
Travadores de carga | Mantêm as unidades de carga posicionadas durante o transporte.
Redes de contenção | Ajudam a impedir o deslocamento de cargas em áreas previstas.
Pontos de amarração | Permitem fixar cargas compatíveis com o sistema instalado.
Sensores de portas de carga | Informam a posição ou condição das portas monitoradas.
Atuadores das portas | Movimentam as portas de carga por meio do sistema de acionamento.
Vedações das portas | Ajudam a manter a estanqueidade nos compartimentos pressurizados.
Sistema de detecção de fumaça | Monitora os compartimentos de carga protegidos.
Iluminação do compartimento | Permite visualizar a área de carga durante as operações.
Equipamentos de movimentação de carga | Facilitam o carregamento e descarregamento conforme a configuração da aeronave.`,
  },
  {
    id: 'computadores', titulo: 'Controle, computadores e monitoramento',
    intro: 'Além dos computadores encontrados no cockpit, a aeronave utiliza unidades eletrônicas distribuídas para controlar e monitorar diferentes funções.',
    nota: 'Essas unidades não são todas iguais. Cada uma possui funções, interfaces e requisitos próprios.',
    itens: `Unidades eletrônicas de controle | Executam funções de controle específicas.
Computadores de gerenciamento de sistemas | Coordenam funções e processam informações dos sistemas correspondentes.
Módulos de entrada e saída | Recebem sinais de sensores e enviam comandos a equipamentos.
Conversores de sinal | Transformam sinais para formatos compatíveis com os equipamentos.
Redes de comunicação de dados | Permitem a troca de informações entre unidades eletrônicas.
Sensores de vibração | Detectam vibrações em equipamentos monitorados.
Sensores de posição | Informam a posição de componentes móveis.
Sensores de pressão | Medem a pressão em circuitos e compartimentos específicos.
Sensores de temperatura | Medem a temperatura de componentes e ambientes.
Sensores de fluxo | Medem ou monitoram o fluxo em circuitos específicos.
Sistemas de diagnóstico | Auxiliam na identificação de falhas e condições anormais.
Interfaces de manutenção | Permitem acessar informações técnicas e realizar verificações autorizadas.
Unidades de registro | Armazenam informações operacionais ou de diagnóstico, conforme o sistema.`,
  },
  {
    id: 'fixadores', titulo: 'Fixadores, conectores e pequenas peças',
    intro: 'Cada conjunto contém muitas peças menores, que também são indispensáveis. Elas são encontradas em diferentes partes da aeronave, e seus materiais, dimensões e especificações variam conforme a aplicação.',
    itens: `Parafusos | Unem componentes por meio de fixação mecânica.
Porcas | Permitem fixar conjuntos rosqueados.
Arruelas | Distribuem cargas, protegem superfícies ou desempenham funções específicas de fixação.
Rebites | Unem chapas e elementos estruturais.
Pinos | Posicionam, articulam ou fixam componentes.
Buchas | Guiam movimentos ou reduzem desgaste em determinadas articulações.
Rolamentos | Permitem movimento relativo entre componentes com atrito reduzido.
Molas | Armazenam e liberam energia mecânica ou exercem força de retorno.
Anéis de retenção | Impedem o deslocamento axial de componentes em determinadas montagens.
Juntas | Ajudam a impedir vazamentos entre superfícies unidas.
O-rings | Fazem a vedação em conexões e componentes compatíveis.
Mangueiras | Transportam fluidos ou gases em circuitos específicos.
Tubos rígidos | Transportam fluidos, gases ou outros meios previstos pelo projeto.
Abraçadeiras | Fixam ou agrupam tubos, mangueiras e cabos.
Conectores elétricos | Estabelecem ligações elétricas entre equipamentos.
Terminais elétricos | Permitem terminar e conectar condutores.
Suportes de montagem | Fixam equipamentos à estrutura.
Calços e espaçadores | Mantêm distâncias ou posições especificadas entre componentes.
Isolantes elétricos | Evitam contatos elétricos indevidos e ajudam a proteger circuitos.
Proteções térmicas | Reduzem a transferência de calor para componentes sensíveis.
Materiais de isolamento acústico | Reduzem a transmissão de ruído para determinadas áreas.`,
  },
];

let n = 0;
SECOES.forEach((s) => {
  s.itens = s.itens.split('\n').map((linha) => {
    const [nome, funcao] = linha.split(' | ');
    return { n: ++n, nome: nome.trim(), funcao: funcao.trim() };
  });
});

window.Catalogo747 = {
  secoes: SECOES,
  total: n,
  referencias: [
    ['Página oficial do Boeing 747-8', 'Informações gerais sobre a aeronave.', 'https://www.boeing.com/commercial/747-8'],
    ['Características do 747-8 para planejamento de aeroportos (PDF)', 'Documento da Boeing com dimensões, estrutura externa e características operacionais.', 'https://www.boeing.com/content/dam/boeing/v2/airports/acaps/747-8_Rev_E.pdf'],
    ['FAA: operação de aviões grandes em aeroportos', 'Informações regulatórias sobre aeronaves de grande porte, como o 747-8.', 'https://www.faa.gov/airports/engineering/nla_mos'],
  ],
};
})();
