/* Fibrafit — exercícios: como executar, erros comuns, músculos e animação.
   kind: w = carga × repetições · bw = peso do corpo (carga extra opcional) · t = tempo em segundos
   c: 1 = exercício multiarticular (base do treino: mais carga e mais descanso). */
(() => {
  'use strict';
  const GROUPS = ['Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Quadríceps', 'Posterior', 'Glúteos', 'Panturrilha', 'Abdômen', 'Cardio'];
  const EQUIPS = ['Barra', 'Halteres', 'Máquina', 'Polia', 'Peso corporal', 'Smith', 'Kettlebell', 'Elástico', 'Outro'];

  const X = (id, name, group, equip, anim, mus, steps, errors, more = {}) => ({ id, name, group, equip, anim, mus, steps, errors, kind: 'w', c: 0, ...more });

  const LIB = [
    /* ---------------- Peito ---------------- */
    X('supino-reto', 'Supino reto', 'Peito', 'Barra', { m: 'bench' }, 'Peitoral maior · tríceps · deltoide anterior', [
      'Deite no banco com os olhos embaixo da barra e apoie os pés firmes no chão.',
      'Segure a barra um pouco além da largura dos ombros e junte as escápulas.',
      'Tire a barra do suporte e posicione-a acima dos ombros, braços estendidos.',
      'Inspire e desça a barra de forma controlada até tocar a linha do peito.',
      'Empurre a barra para cima soltando o ar, sem perder a estabilidade.',
    ], ['Tirar os pés do chão ou o quadril do banco', 'Descer a barra sem controle ou quicar no peito', 'Abrir demais os cotovelos (90° do tronco)', 'Usar uma carga que comprometa a execução'], { c: 1 }),
    X('supino-inclinado', 'Supino inclinado', 'Peito', 'Barra', { m: 'bench', tilt: 28 }, 'Peitoral superior · deltoide anterior · tríceps', [
      'Ajuste o banco entre 30° e 45° e deite com os pés firmes no chão.',
      'Segure a barra um pouco além da largura dos ombros, escápulas juntas.',
      'Desça a barra controlando até a parte alta do peito, logo abaixo da clavícula.',
      'Empurre para cima e um pouco para trás, terminando acima dos ombros.',
    ], ['Inclinar o banco demais (vira desenvolvimento)', 'Descer a barra no meio do peito ou no pescoço', 'Arquear demais as costas para tirar o peito do banco', 'Travar os cotovelos com tranco no topo'], { c: 1 }),
    X('supino-reto-halter', 'Supino reto com halteres', 'Peito', 'Halteres', { m: 'bench', impl: 'dumbbell' }, 'Peitoral maior · tríceps · deltoide anterior', [
      'Sente com os halteres nas coxas e deite levando-os junto ao peito.',
      'Comece com os halteres acima do peito, palmas para a frente.',
      'Desça controlando até os cotovelos ficarem um pouco abaixo do banco.',
      'Empurre para cima aproximando os halteres no topo, sem bater um no outro.',
    ], ['Descer rápido e perder o controle dos halteres', 'Abrir os cotovelos totalmente na linha dos ombros', 'Deixar os punhos dobrarem para trás', 'Largar os halteres de qualquer jeito no fim'], { c: 1 }),
    X('supino-inclinado-halter', 'Supino inclinado com halteres', 'Peito', 'Halteres', { m: 'bench', tilt: 28, impl: 'dumbbell' }, 'Peitoral superior · deltoide anterior · tríceps', [
      'Ajuste o banco entre 30° e 45° e apoie bem as costas e os pés.',
      'Comece com os halteres acima do peito, braços estendidos.',
      'Desça controlando até a altura da parte alta do peito.',
      'Empurre para cima soltando o ar, juntando levemente os halteres no topo.',
    ], ['Banco inclinado demais', 'Cotovelos muito abertos', 'Amplitude curta por excesso de carga', 'Tirar o quadril do banco'], { c: 1 }),
    X('supino-maquina', 'Supino na máquina', 'Peito', 'Máquina', { m: 'bench', impl: 'handle' }, 'Peitoral maior · tríceps · deltoide anterior', [
      'Ajuste o banco para as pegadas ficarem na linha do meio do peito.',
      'Apoie as costas no encosto e junte as escápulas.',
      'Empurre as pegadas até quase estender os braços, soltando o ar.',
      'Volte devagar até sentir o alongamento no peito, sem soltar o peso.',
    ], ['Pegadas altas demais (na linha do pescoço)', 'Desencostar as costas para empurrar', 'Deixar o peso bater no fim de cada repetição'], { c: 1 }),
    X('crucifixo-halter', 'Crucifixo com halteres', 'Peito', 'Halteres', { m: 'bench', fly: 1, impl: 'dumbbell' }, 'Peitoral maior · deltoide anterior', [
      'Deite no banco com os halteres acima do peito, palmas uma de frente para a outra.',
      'Mantenha os cotovelos levemente flexionados durante todo o movimento.',
      'Abra os braços em arco até sentir o peito alongar, na altura do tronco.',
      'Feche os braços pelo mesmo arco, como se abraçasse uma árvore.',
    ], ['Esticar totalmente os cotovelos (sobrecarrega o ombro)', 'Descer os halteres além da linha do tronco', 'Transformar em supino dobrando muito os cotovelos', 'Usar carga alta demais'], {}),
    X('crossover', 'Crossover', 'Peito', 'Polia', { m: 'crossover' }, 'Peitoral maior · deltoide anterior', [
      'Fique no meio das polias altas, um pé à frente e o tronco levemente inclinado.',
      'Segure as pegadas com os cotovelos levemente flexionados.',
      'Traga as mãos para baixo e para a frente, em arco, até se encontrarem.',
      'Segure um instante contraindo o peito e volte devagar.',
    ], ['Dobrar e esticar os cotovelos (vira empurrar)', 'Deixar os ombros subirem', 'Balançar o tronco para ajudar', 'Voltar rápido deixando o peso puxar'], {}),
    X('peck-deck', 'Voador (peck deck)', 'Peito', 'Máquina', { m: 'peckdeck' }, 'Peitoral maior · deltoide anterior', [
      'Ajuste o banco para as pegadas ficarem na altura do peito.',
      'Encoste as costas e segure as pegadas com os cotovelos levemente flexionados.',
      'Feche os braços à frente do peito, contraindo o peitoral.',
      'Abra devagar até sentir o alongamento, sem passar da linha do tronco.',
    ], ['Banco baixo ou alto demais', 'Desencostar as costas', 'Abrir além do confortável para o ombro'], {}),
    X('flexao', 'Flexão de braço', 'Peito', 'Peso corporal', { m: 'pushup' }, 'Peitoral maior · tríceps · deltoide anterior · abdômen', [
      'Apoie as mãos no chão um pouco além da largura dos ombros.',
      'Estenda as pernas e mantenha o corpo reto da cabeça aos calcanhares.',
      'Desça o peito em direção ao chão com os cotovelos a uns 45° do tronco.',
      'Empurre o chão para subir, mantendo o abdômen firme.',
      'Se estiver difícil, apoie os joelhos no chão.',
    ], ['Deixar o quadril cair ou empinar', 'Abrir os cotovelos em 90°', 'Fazer meia repetição', 'Projetar a cabeça para a frente'], { kind: 'bw', c: 1 }),
    X('paralelas', 'Paralelas', 'Peito', 'Peso corporal', { m: 'dips' }, 'Peitoral inferior · tríceps · deltoide anterior', [
      'Apoie as mãos nas barras com os braços estendidos e ombros longe das orelhas.',
      'Incline levemente o tronco à frente para trabalhar mais o peito.',
      'Desça controlando até os cotovelos chegarem a cerca de 90°.',
      'Empurre para cima até estender os braços.',
    ], ['Descer além do confortável para o ombro', 'Deixar os ombros subirem até as orelhas', 'Balançar as pernas para subir'], { kind: 'bw', c: 1 }),

    /* ---------------- Costas ---------------- */
    X('barra-fixa', 'Barra fixa', 'Costas', 'Peso corporal', { m: 'pullup' }, 'Grande dorsal · bíceps · romboides', [
      'Segure a barra com as palmas para a frente, um pouco além dos ombros.',
      'Comece pendurado com os braços estendidos e o abdômen firme.',
      'Puxe o corpo levando o peito em direção à barra, cotovelos para baixo.',
      'Passe o queixo da barra e desça devagar até estender os braços.',
      'Sem conseguir ainda? Use elástico ou a máquina graviton.',
    ], ['Balançar o corpo para subir (kipping)', 'Fazer só meia repetição', 'Encolher os ombros nas orelhas', 'Soltar o corpo na descida'], { kind: 'bw', c: 1 }),
    X('puxada-frente', 'Puxada frontal', 'Costas', 'Polia', { m: 'pulldown' }, 'Grande dorsal · bíceps · romboides', [
      'Ajuste o apoio das coxas e segure a barra um pouco além da largura dos ombros.',
      'Incline levemente o tronco para trás e estufe o peito.',
      'Puxe a barra até a parte alta do peito, levando os cotovelos para baixo.',
      'Volte devagar até estender os braços, sem soltar o peso.',
    ], ['Puxar a barra atrás da nuca', 'Jogar o tronco para trás para roubar', 'Puxar com os braços e esquecer as costas', 'Deixar a barra subir rápido'], { c: 1 }),
    X('remada-curvada', 'Remada curvada', 'Costas', 'Barra', { m: 'row' }, 'Grande dorsal · romboides · trapézio · lombar', [
      'Segure a barra na largura dos ombros e flexione levemente os joelhos.',
      'Incline o tronco à frente com a coluna neutra, quase paralelo ao chão.',
      'Puxe a barra em direção ao umbigo levando os cotovelos para trás.',
      'Desça controlando até estender os braços, mantendo o tronco parado.',
    ], ['Arredondar a coluna', 'Levantar o tronco a cada repetição', 'Puxar a barra para o peito com os cotovelos abertos', 'Usar o impulso das pernas'], { c: 1 }),
    X('remada-unilateral', 'Remada unilateral (serrote)', 'Costas', 'Halteres', { m: 'row', one: 1, impl: 'dumbbell', t: -12 }, 'Grande dorsal · romboides · bíceps', [
      'Apoie a mão e o joelho do mesmo lado no banco; o outro pé no chão.',
      'Deixe o halter pendurado com o braço estendido e as costas retas.',
      'Puxe o halter em direção ao quadril, cotovelo rente ao corpo.',
      'Desça devagar até estender o braço. Faça as séries dos dois lados.',
    ], ['Girar o tronco para levantar o peso', 'Puxar o halter para o ombro', 'Arredondar as costas'], { c: 1 }),
    X('remada-baixa', 'Remada baixa', 'Costas', 'Polia', { m: 'seatedrow' }, 'Grande dorsal · romboides · trapézio médio', [
      'Sente com os pés apoiados e os joelhos levemente flexionados.',
      'Segure o triângulo com os braços estendidos e o tronco ereto.',
      'Puxe em direção ao abdômen juntando as escápulas.',
      'Volte devagar estendendo os braços, sem curvar o tronco para a frente.',
    ], ['Balançar o tronco para trás e para a frente', 'Encolher os ombros', 'Arredondar as costas na volta'], { c: 1 }),
    X('remada-maquina', 'Remada na máquina', 'Costas', 'Máquina', { m: 'seatedrow' }, 'Grande dorsal · romboides · trapézio médio', [
      'Ajuste o banco para as pegadas ficarem na altura do meio do peito.',
      'Apoie o peito no encosto e segure as pegadas.',
      'Puxe levando os cotovelos para trás e juntando as escápulas.',
      'Volte devagar até estender os braços.',
    ], ['Desencostar o peito do apoio', 'Encolher os ombros', 'Voltar rápido deixando o peso bater'], { c: 1 }),
    X('levantamento-terra', 'Levantamento terra', 'Costas', 'Barra', { m: 'deadlift' }, 'Lombar · glúteos · posteriores de coxa · trapézio', [
      'Pés na largura do quadril, com a barra sobre o meio do pé.',
      'Segure a barra logo por fora das pernas, quadril para trás e coluna neutra.',
      'Encha o peito de ar, contraia o abdômen e tire a folga da barra.',
      'Empurre o chão e suba estendendo quadril e joelhos juntos, barra rente às pernas.',
      'Desça controlando, levando o quadril para trás primeiro.',
    ], ['Arredondar a coluna', 'Afastar a barra do corpo', 'Subir o quadril antes do tronco', 'Jogar o tronco para trás no topo'], { c: 1 }),
    X('pulldown', 'Pulldown braço reto', 'Costas', 'Polia', { m: 'straightpull' }, 'Grande dorsal · redondo maior', [
      'Fique de frente para a polia alta, com o tronco levemente inclinado.',
      'Segure a barra ou corda com os braços quase estendidos.',
      'Leve as mãos em arco até as coxas, sem dobrar os cotovelos.',
      'Volte devagar até sentir as costas alongarem.',
    ], ['Dobrar os cotovelos (vira tríceps)', 'Balançar o tronco', 'Subir os ombros'], {}),

    /* ---------------- Ombros ---------------- */
    X('desenvolvimento-halter', 'Desenvolvimento com halteres', 'Ombros', 'Halteres', { m: 'press', seated: 1 }, 'Deltoide anterior e lateral · tríceps', [
      'Sente com as costas apoiadas e os halteres na altura dos ombros.',
      'Palmas para a frente e cotovelos um pouco à frente do corpo.',
      'Empurre os halteres para cima até quase estender os braços.',
      'Desça controlando até a altura das orelhas.',
    ], ['Arquear a lombar para empurrar', 'Descer pouco (amplitude curta)', 'Bater os halteres no topo', 'Cotovelos totalmente para trás'], { c: 1 }),
    X('desenvolvimento-barra', 'Desenvolvimento com barra', 'Ombros', 'Barra', { m: 'press', impl: 'barbell' }, 'Deltoide anterior · tríceps · trapézio', [
      'Em pé, segure a barra na altura da clavícula, mãos um pouco além dos ombros.',
      'Contraia glúteos e abdômen para não arquear as costas.',
      'Empurre a barra para cima tirando a cabeça do caminho.',
      'No topo, a barra fica sobre a cabeça; desça controlando até a clavícula.',
    ], ['Arquear muito a lombar', 'Empurrar a barra para a frente do corpo', 'Usar impulso das pernas sem querer'], { c: 1 }),
    X('desenvolvimento-maquina', 'Desenvolvimento na máquina', 'Ombros', 'Máquina', { m: 'press', seated: 1, impl: 'handle' }, 'Deltoide anterior e lateral · tríceps', [
      'Ajuste o banco para as pegadas ficarem na altura dos ombros.',
      'Apoie bem as costas no encosto.',
      'Empurre para cima até quase estender os braços.',
      'Desça devagar até a altura das orelhas.',
    ], ['Banco baixo demais', 'Desencostar as costas', 'Travar os cotovelos com força'], { c: 1 }),
    X('elevacao-lateral', 'Elevação lateral', 'Ombros', 'Halteres', { m: 'lateral' }, 'Deltoide lateral', [
      'Em pé, halteres ao lado do corpo e cotovelos levemente flexionados.',
      'Eleve os braços para os lados até a altura dos ombros.',
      'Lidere o movimento com os cotovelos, punhos alinhados.',
      'Desça devagar, sem deixar os halteres caírem.',
    ], ['Subir acima da linha dos ombros', 'Balançar o corpo para levantar', 'Encolher o trapézio', 'Girar os punhos como se servisse água'], {}),
    X('elevacao-frontal', 'Elevação frontal', 'Ombros', 'Halteres', { m: 'frontraise' }, 'Deltoide anterior', [
      'Em pé, halteres à frente das coxas.',
      'Eleve os braços à frente até a altura dos ombros.',
      'Mantenha o tronco parado e o abdômen firme.',
      'Desça controlando.',
    ], ['Subir acima dos ombros', 'Jogar o tronco para trás', 'Usar impulso'], {}),
    X('face-pull', 'Face pull', 'Ombros', 'Polia', { m: 'facepull' }, 'Deltoide posterior · trapézio médio · manguito rotador', [
      'Ajuste a polia na altura do rosto e segure a corda com as palmas para baixo.',
      'Dê um passo para trás com os braços estendidos.',
      'Puxe a corda em direção ao rosto, abrindo as mãos e levando os cotovelos para trás e para cima.',
      'Segure um instante e volte devagar.',
    ], ['Polia baixa demais', 'Puxar para o pescoço com os cotovelos baixos', 'Inclinar o tronco para trás'], {}),
    X('encolhimento', 'Encolhimento (trapézio)', 'Ombros', 'Halteres', { m: 'shrug' }, 'Trapézio superior', [
      'Em pé, halteres ao lado do corpo e braços estendidos.',
      'Suba os ombros em direção às orelhas, sem dobrar os cotovelos.',
      'Segure um segundo no alto.',
      'Desça devagar até alongar.',
    ], ['Girar os ombros', 'Dobrar os cotovelos', 'Projetar a cabeça para a frente'], {}),

    /* ---------------- Bíceps ---------------- */
    X('rosca-direta', 'Rosca direta', 'Bíceps', 'Barra', { m: 'curl' }, 'Bíceps · braquial', [
      'Em pé, segure a barra com as palmas para cima na largura dos ombros.',
      'Cotovelos colados ao lado do corpo.',
      'Flexione os cotovelos levando a barra até a altura do peito.',
      'Desça devagar até estender os braços.',
    ], ['Balançar o tronco para subir', 'Afastar os cotovelos do corpo', 'Descer só até a metade'], {}),
    X('rosca-alternada', 'Rosca alternada', 'Bíceps', 'Halteres', { m: 'curl', impl: 'dumbbell' }, 'Bíceps · braquial', [
      'Em pé, halteres ao lado do corpo com as palmas para dentro.',
      'Suba um halter girando a palma para cima durante o movimento.',
      'Mantenha o cotovelo parado ao lado do corpo.',
      'Desça devagar e alterne os braços.',
    ], ['Balançar o corpo', 'Levar o cotovelo para a frente', 'Descer rápido'], {}),
    X('rosca-martelo', 'Rosca martelo', 'Bíceps', 'Halteres', { m: 'curl', impl: 'dumbbell' }, 'Braquiorradial · braquial · bíceps', [
      'Em pé, halteres ao lado do corpo com as palmas viradas para dentro.',
      'Suba os halteres mantendo a pegada neutra, como um martelo.',
      'Cotovelos fixos ao lado do corpo.',
      'Desça controlando.',
    ], ['Girar o punho durante o movimento', 'Balançar o tronco', 'Afastar os cotovelos'], {}),
    X('rosca-scott', 'Rosca Scott', 'Bíceps', 'Barra', { m: 'scott' }, 'Bíceps · braquial', [
      'Ajuste o banco para a axila encaixar no topo do apoio.',
      'Apoie a parte de trás dos braços no banco e segure a barra.',
      'Suba a barra flexionando os cotovelos.',
      'Desça devagar quase até estender, sem travar com tranco.',
    ], ['Tirar os braços do apoio', 'Soltar o peso na descida', 'Estender com tranco no fim'], {}),
    X('rosca-polia', 'Rosca na polia', 'Bíceps', 'Polia', { m: 'curl', cable: 1, impl: 'handle' }, 'Bíceps · braquial', [
      'De frente para a polia baixa, segure a barra com as palmas para cima.',
      'Cotovelos colados ao corpo.',
      'Flexione os cotovelos trazendo a barra até o peito.',
      'Volte devagar, mantendo a tensão do cabo.',
    ], ['Inclinar o tronco para trás', 'Afastar os cotovelos', 'Deixar o cabo puxar rápido'], {}),

    /* ---------------- Tríceps ---------------- */
    X('triceps-corda', 'Tríceps corda', 'Tríceps', 'Polia', { m: 'pushdown' }, 'Tríceps', [
      'De frente para a polia alta, segure a corda com as palmas para dentro.',
      'Cotovelos colados ao corpo e tronco levemente inclinado.',
      'Estenda os cotovelos levando a corda para baixo e abrindo as pontas no final.',
      'Volte devagar até os antebraços passarem da horizontal.',
    ], ['Mexer os cotovelos para a frente e para trás', 'Jogar o peso do corpo sobre a corda', 'Subir rápido demais'], {}),
    X('triceps-pulley', 'Tríceps pulley (barra)', 'Tríceps', 'Polia', { m: 'pushdown' }, 'Tríceps', [
      'Segure a barra da polia alta com as palmas para baixo.',
      'Cotovelos fixos ao lado do corpo.',
      'Empurre a barra para baixo até estender os braços.',
      'Volte devagar sem deixar os cotovelos subirem.',
    ], ['Afastar os cotovelos do corpo', 'Inclinar demais o tronco', 'Encolher os ombros'], {}),
    X('triceps-testa', 'Tríceps testa', 'Tríceps', 'Barra', { m: 'skull' }, 'Tríceps (cabeça longa)', [
      'Deite no banco segurando a barra acima do peito, braços estendidos.',
      'Incline levemente os braços em direção à cabeça e mantenha-os fixos.',
      'Dobre os cotovelos descendo a barra em direção à testa, devagar.',
      'Estenda os cotovelos voltando à posição inicial.',
    ], ['Abrir os cotovelos para os lados', 'Mexer o braço junto (vira supino)', 'Descer rápido perto do rosto'], {}),
    X('triceps-frances', 'Tríceps francês', 'Tríceps', 'Halteres', { m: 'overhead' }, 'Tríceps (cabeça longa)', [
      'Sentado com as costas apoiadas, segure um halter com as duas mãos acima da cabeça.',
      'Cotovelos apontando para cima, perto da cabeça.',
      'Desça o halter atrás da cabeça dobrando os cotovelos.',
      'Estenda os braços voltando ao alto.',
    ], ['Abrir os cotovelos', 'Arquear a lombar', 'Descer sem controle atrás da cabeça'], {}),
    X('supino-fechado', 'Supino fechado', 'Tríceps', 'Barra', { m: 'bench', close: 1 }, 'Tríceps · peitoral · deltoide anterior', [
      'Deite no banco e segure a barra na largura dos ombros.',
      'Desça a barra até a parte baixa do peito com os cotovelos perto do corpo.',
      'Empurre para cima estendendo os braços.',
    ], ['Mãos coladas demais (força os punhos)', 'Abrir os cotovelos', 'Quicar a barra no peito'], { c: 1 }),
    X('mergulho-banco', 'Mergulho no banco', 'Tríceps', 'Peso corporal', { m: 'dips', bench: 1 }, 'Tríceps · deltoide anterior', [
      'Apoie as mãos na borda do banco atrás de você, dedos para a frente.',
      'Estenda as pernas à frente (ou dobre os joelhos para facilitar).',
      'Desça o corpo dobrando os cotovelos até cerca de 90°.',
      'Empurre para subir até estender os braços.',
    ], ['Descer demais (força o ombro)', 'Afastar o corpo do banco', 'Abrir os cotovelos para os lados'], { kind: 'bw' }),

    /* ---------------- Quadríceps ---------------- */
    X('agachamento', 'Agachamento livre', 'Quadríceps', 'Barra', { m: 'squat' }, 'Quadríceps · glúteos · posteriores · lombar', [
      'Apoie a barra no alto das costas (trapézio), não no pescoço.',
      'Pés na largura dos ombros, pontas levemente para fora.',
      'Inspire, contraia o abdômen e desça levando o quadril para trás e para baixo.',
      'Desça até o quadril chegar perto da linha dos joelhos, mantendo os calcanhares no chão.',
      'Suba empurrando o chão e soltando o ar.',
    ], ['Deixar os joelhos caírem para dentro', 'Tirar os calcanhares do chão', 'Arredondar a lombar no fundo', 'Inclinar demais o tronco à frente'], { c: 1 }),
    X('agachamento-smith', 'Agachamento no Smith', 'Quadríceps', 'Smith', { m: 'squat', smith: 1 }, 'Quadríceps · glúteos', [
      'Posicione a barra no alto das costas e os pés um pouco à frente da barra.',
      'Destrave a barra girando os punhos.',
      'Desça até as coxas ficarem perto da horizontal.',
      'Suba empurrando o chão. Trave a barra girando os punhos no fim.',
    ], ['Pés embaixo da barra (sobrecarrega joelhos)', 'Joelhos para dentro', 'Esquecer de travar a barra no fim'], { c: 1 }),
    X('agachamento-goblet', 'Agachamento goblet', 'Quadríceps', 'Kettlebell', { m: 'goblet' }, 'Quadríceps · glúteos · abdômen', [
      'Segure o kettlebell ou halter junto ao peito, cotovelos para baixo.',
      'Pés um pouco além da largura dos ombros.',
      'Desça entre as pernas mantendo o peito aberto.',
      'Suba empurrando o chão. Ótimo para aprender o agachamento.',
    ], ['Deixar o peso afastar do peito', 'Calcanhares saindo do chão', 'Joelhos para dentro'], { c: 1 }),
    X('agachamento-bulgaro', 'Agachamento búlgaro', 'Quadríceps', 'Halteres', { m: 'lunge', bulg: 1 }, 'Quadríceps · glúteos', [
      'Fique de costas para o banco e apoie o peito do pé de trás nele.',
      'O pé da frente fica afastado o bastante para o joelho não passar muito da ponta do pé.',
      'Desça na vertical até a coxa da frente ficar perto da horizontal.',
      'Suba empurrando com o calcanhar da frente. Faça os dois lados.',
    ], ['Pé da frente perto demais do banco', 'Joelho da frente caindo para dentro', 'Tronco balançando para os lados'], { c: 1 }),
    X('leg-press', 'Leg press 45°', 'Quadríceps', 'Máquina', { m: 'legpress' }, 'Quadríceps · glúteos', [
      'Sente com as costas e o quadril bem apoiados no encosto.',
      'Pés na plataforma na largura dos ombros.',
      'Destrave e desça a plataforma até os joelhos formarem cerca de 90°.',
      'Empurre de volta sem travar os joelhos no topo.',
    ], ['Tirar o quadril do banco no fundo', 'Travar os joelhos esticados', 'Joelhos para dentro', 'Descer pouco por excesso de carga'], { c: 1 }),
    X('cadeira-extensora', 'Cadeira extensora', 'Quadríceps', 'Máquina', { m: 'extension' }, 'Quadríceps', [
      'Ajuste o encosto para o joelho ficar alinhado com o eixo da máquina.',
      'Apoio na parte baixa da canela, acima do tornozelo.',
      'Estenda os joelhos até as pernas ficarem retas.',
      'Segure um instante e desça devagar.',
    ], ['Joelho desalinhado com o eixo', 'Tirar o quadril do banco', 'Descer o peso rápido'], {}),
    X('afundo', 'Afundo', 'Quadríceps', 'Halteres', { m: 'lunge' }, 'Quadríceps · glúteos', [
      'Em pé com halteres ao lado do corpo, dê um passo largo à frente.',
      'Desça na vertical até o joelho de trás quase tocar o chão.',
      'O joelho da frente fica acima do tornozelo.',
      'Suba empurrando com a perna da frente.',
    ], ['Passo curto (joelho passa muito da ponta do pé)', 'Tronco caindo à frente', 'Joelho da frente para dentro'], { c: 1 }),

    /* ---------------- Posterior ---------------- */
    X('stiff', 'Stiff', 'Posterior', 'Barra', { m: 'hinge' }, 'Posteriores de coxa · glúteos · lombar', [
      'Em pé, barra à frente das coxas e joelhos levemente flexionados.',
      'Leve o quadril para trás inclinando o tronco com a coluna neutra.',
      'Desça a barra rente às pernas até sentir o alongamento atrás da coxa.',
      'Suba levando o quadril à frente e contraindo os glúteos.',
    ], ['Arredondar as costas', 'Afastar a barra das pernas', 'Dobrar demais os joelhos (vira agachamento)'], { c: 1 }),
    X('terra-romeno', 'Levantamento terra romeno', 'Posterior', 'Barra', { m: 'hinge', deep: 1 }, 'Posteriores de coxa · glúteos · lombar', [
      'Comece em pé segurando a barra, joelhos levemente flexionados.',
      'Empurre o quadril para trás deslizando a barra pelas coxas.',
      'Desça até a altura dos joelhos ou do meio da canela, sem curvar a coluna.',
      'Volte estendendo o quadril.',
    ], ['Coluna arredondada', 'Barra longe do corpo', 'Descer além da sua flexibilidade'], { c: 1 }),
    X('mesa-flexora', 'Mesa flexora', 'Posterior', 'Máquina', { m: 'legcurl' }, 'Posteriores de coxa', [
      'Deite de bruços com o joelho logo depois da borda do banco.',
      'Apoio acima dos calcanhares.',
      'Flexione os joelhos trazendo os calcanhares em direção aos glúteos.',
      'Desça devagar até quase estender.',
    ], ['Tirar o quadril do banco', 'Subir com tranco', 'Descer rápido'], {}),
    X('cadeira-flexora', 'Cadeira flexora', 'Posterior', 'Máquina', { m: 'seatedcurl' }, 'Posteriores de coxa', [
      'Sente com o joelho alinhado ao eixo e trave as coxas no apoio.',
      'Apoio acima dos calcanhares.',
      'Flexione os joelhos levando o apoio para baixo e para trás.',
      'Volte devagar.',
    ], ['Coxas soltas do apoio', 'Voltar rápido', 'Joelho desalinhado com o eixo'], {}),

    /* ---------------- Glúteos ---------------- */
    X('elevacao-pelvica', 'Elevação pélvica', 'Glúteos', 'Barra', { m: 'hipthrust' }, 'Glúteo máximo · posteriores', [
      'Apoie a parte de cima das costas no banco e a barra sobre o quadril (use uma proteção).',
      'Pés no chão na largura do quadril, joelhos dobrados.',
      'Empurre o quadril para cima até o tronco ficar alinhado com as coxas.',
      'Contraia os glúteos no topo, olhando para a frente, e desça devagar.',
    ], ['Arquear a lombar no topo em vez de usar o glúteo', 'Pés longe ou perto demais', 'Subir com tranco'], { c: 1 }),
    X('ponte', 'Ponte de glúteo', 'Glúteos', 'Peso corporal', { m: 'hipthrust', floor: 1 }, 'Glúteo máximo · posteriores', [
      'Deite de costas com os joelhos dobrados e os pés no chão.',
      'Braços ao lado do corpo.',
      'Eleve o quadril até alinhar joelhos, quadril e ombros.',
      'Segure um instante e desça devagar.',
    ], ['Arquear a lombar', 'Empurrar com a ponta dos pés', 'Descer rápido'], { kind: 'bw' }),
    X('gluteo-polia', 'Glúteo na polia (coice)', 'Glúteos', 'Polia', { m: 'kickback' }, 'Glúteo máximo', [
      'Prenda a tornozeleira na polia baixa e apoie as mãos na máquina.',
      'Incline levemente o tronco e mantenha o abdômen firme.',
      'Leve a perna para trás estendendo o quadril.',
      'Volte devagar. Faça os dois lados.',
    ], ['Arquear a lombar para subir mais a perna', 'Girar o quadril', 'Balançar o corpo'], {}),
    X('cadeira-abdutora', 'Cadeira abdutora', 'Glúteos', 'Máquina', { m: 'abduction' }, 'Glúteo médio', [
      'Sente com as costas apoiadas e as pernas nos apoios.',
      'Abra as pernas empurrando os apoios para fora.',
      'Segure um instante aberto.',
      'Volte devagar sem deixar o peso bater.',
    ], ['Balançar o tronco', 'Fechar rápido', 'Amplitude curta'], {}),
    X('cadeira-adutora', 'Cadeira adutora', 'Glúteos', 'Máquina', { m: 'abduction', in: 1 }, 'Adutores', [
      'Sente com as costas apoiadas e as pernas abertas nos apoios.',
      'Feche as pernas apertando os apoios.',
      'Volte devagar até a abertura confortável.',
    ], ['Abrir além do confortável', 'Fechar com tranco'], {}),

    /* ---------------- Panturrilha ---------------- */
    X('panturrilha-pe', 'Panturrilha em pé', 'Panturrilha', 'Máquina', { m: 'calf' }, 'Gastrocnêmio · sóleo', [
      'Apoie a ponta dos pés na plataforma, calcanhares para fora.',
      'Desça os calcanhares até alongar bem a panturrilha.',
      'Suba na ponta dos pés o mais alto que conseguir.',
      'Segure um segundo no alto e desça devagar.',
    ], ['Amplitude curta', 'Dobrar os joelhos para ajudar', 'Fazer rápido, quicando'], {}),
    X('panturrilha-sentado', 'Panturrilha sentado', 'Panturrilha', 'Máquina', { m: 'calf', seated: 1 }, 'Sóleo · gastrocnêmio', [
      'Sente com o apoio sobre as coxas, perto dos joelhos.',
      'Ponta dos pés na plataforma.',
      'Suba os calcanhares o máximo possível.',
      'Desça devagar até alongar.',
    ], ['Quicar no fundo', 'Amplitude curta'], {}),

    /* ---------------- Abdômen ---------------- */
    X('abdominal-supra', 'Abdominal supra', 'Abdômen', 'Peso corporal', { m: 'crunch' }, 'Reto abdominal', [
      'Deite de costas com os joelhos dobrados e os pés no chão.',
      'Mãos cruzadas no peito ou atrás da cabeça, sem puxar o pescoço.',
      'Solte o ar e enrole o tronco tirando as escápulas do chão.',
      'Desça devagar.',
    ], ['Puxar a cabeça com as mãos', 'Subir com impulso', 'Tirar a lombar do chão'], { kind: 'bw' }),
    X('elevacao-pernas', 'Elevação de pernas', 'Abdômen', 'Peso corporal', { m: 'legraise' }, 'Reto abdominal (porção inferior) · flexores do quadril', [
      'Deite de costas com as pernas estendidas e mãos ao lado do corpo.',
      'Mantenha a lombar encostada no chão.',
      'Eleve as pernas até ficarem verticais.',
      'Desça devagar sem encostar os pés no chão.',
    ], ['Lombar descolando do chão', 'Descer as pernas rápido', 'Usar impulso'], { kind: 'bw' }),
    X('prancha', 'Prancha', 'Abdômen', 'Peso corporal', { m: 'plank' }, 'Abdômen · lombar · glúteos', [
      'Apoie os antebraços no chão, cotovelos embaixo dos ombros.',
      'Estenda as pernas apoiando a ponta dos pés.',
      'Corpo reto da cabeça aos calcanhares, abdômen e glúteos contraídos.',
      'Respire normalmente e segure o tempo da série.',
    ], ['Quadril caindo', 'Quadril alto demais', 'Prender a respiração'], { kind: 't' }),

    /* ---------------- Cardio ---------------- */
    X('esteira', 'Esteira', 'Cardio', 'Outro', { m: 'walk' }, 'Condicionamento · pernas', [
      'Comece caminhando de 3 a 5 minutos para aquecer.',
      'Aumente a velocidade ou a inclinação aos poucos.',
      'Mantenha o tronco ereto e solte o corrimão.',
      'Termine com alguns minutos mais leves.',
    ], ['Segurar no corrimão o tempo todo', 'Passadas longas demais', 'Começar forte sem aquecer'], { kind: 't' }),
    X('bicicleta', 'Bicicleta', 'Cardio', 'Outro', { m: 'bike' }, 'Condicionamento · quadríceps', [
      'Ajuste o banco: com o pedal embaixo, o joelho fica quase estendido.',
      'Comece leve e aumente a carga aos poucos.',
      'Mantenha o tronco estável.',
    ], ['Banco baixo demais', 'Balançar o quadril', 'Carga alta demais logo no início'], { kind: 't' }),
    X('corda', 'Pular corda', 'Cardio', 'Outro', { m: 'rope' }, 'Condicionamento · panturrilhas · coordenação', [
      'Segure as pontas com os cotovelos perto do corpo.',
      'Gire a corda com os punhos, não com os braços.',
      'Pule baixo, na ponta dos pés.',
    ], ['Pular alto demais', 'Girar com os ombros', 'Aterrissar com o calcanhar'], { kind: 't' }),
    X('remo-ergometro', 'Remo ergômetro', 'Cardio', 'Outro', { m: 'rower' }, 'Condicionamento · costas · pernas', [
      'Prenda os pés e segure a pegada com os braços estendidos.',
      'Empurre primeiro com as pernas, depois incline o tronco e puxe com os braços.',
      'Volte na ordem inversa: braços, tronco e pernas.',
    ], ['Puxar com os braços antes das pernas', 'Arredondar as costas', 'Voltar rápido demais'], { kind: 't' }),
  ];

  window.KDATA = { GROUPS, EQUIPS, LIB };
})();
