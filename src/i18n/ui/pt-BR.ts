import type { UIDict } from './en';

// pt-BR mirror of en.ts. TS enforces that every key in en.ts is present here.
// Tone: journalistic / news-headline register matching the Economist-flavored
// English voice. Keep the political vocabulary (Bloco de Interesse, Coalizão,
// etc.) consistent with the game's narrative.
const ptBR: UIDict = {
  // Common / shared
  'common.backToHome': 'Voltar ao início',
  'common.cancel': 'Cancelar',
  'common.loading': 'Carregando…',
  'common.roomLabel': 'Sala {id}',
  'common.roomShort': 'Sala',

  // Home
  'home.tagline.bold':
    'Monte uma coalizão. Vigie as contradições.',
  'home.tagline.detail':
    'Um draft de cartas em tempo real para 2 a 5 jogadores, vestido com a roupagem da política de 2026.',
  'home.cta.create': 'Criar partida',
  'home.cta.creating': 'Criando…',
  'home.cta.join': 'Entrar com código →',
  'home.cta.howToPlay': 'Como jogar →',

  // Host-warning modal
  'hostWarning.title': 'Atenção',
  'hostWarning.body':
    'Você está prestes a hospedar a partida em algo que parece ser um celular. A tela do anfitrião funciona melhor em telas maiores — uma TV ou monitor.',
  'hostWarning.confirm': 'Hospedar mesmo assim',

  // Join
  'join.title': 'Retomar',
  'join.subtitle':
    'Digite o código da sala que seus amigos compartilharam para voltar à partida.',
  'join.codeLabel': 'Código da sala',
  'join.errorRoomNotFound':
    'Sala não encontrada. Confira o código e tente novamente.',
  'join.cta.host': 'Retomar como anfitrião',
  'join.cta.hostBusy': 'Retomando…',
  'join.cta.player': 'Retomar como jogador →',
  'join.cta.playerBusy': 'Retomando…',

  // PlayerJoinPage
  'playerJoin.title': 'Registre sua candidatura',
  'playerJoin.nameLabel': 'Seu nome',
  'playerJoin.errorEmpty': 'Digite seu nome',
  'playerJoin.submit': 'Entrar',
  'playerJoin.submitBusy': 'Entrando…',
  'playerJoin.rejoinTitle': 'Toque no seu nome',
  'playerJoin.rejoinBody':
    'A partida já começou. Escolha sua vaga para retornar.',
  'playerJoin.statusReady': 'Pronto',
  'playerJoin.statusFiled': 'Registrado',

  // PlayerPage
  'playerPage.missingIds': 'Sala ou jogador não identificados.',
  'playerPage.invalidSlot': 'Vaga de jogador inválida.',
  'playerPage.invalidSlotId': 'Identificador de vaga inválido',
  'playerPage.claiming':
    'Você está reivindicando a vaga {playerId}. Digite seu nome:',
  'playerPage.nameLabel': 'Seu nome',
  'playerPage.join': 'Entrar',
  'playerPage.joining': 'Entrando…',
  'playerPage.youReady': 'Você está pronto, {name}',
  'playerPage.youReadySub':
    'A campanha começa quando o anfitrião abrir as urnas',
  'playerPage.youWon': 'Você venceu!',
  'playerPage.gameOver': 'Fim de jogo',
  'playerPage.fallbackPlayer': 'Jogador {id}',
  'playerPage.seatOverline': '{id} · Cadeira {playerId}',
  'playerPage.divider.voterSegments': 'segmentos eleitorais',
  'playerPage.divider.addToSegment': 'adicionar a um segmento',
  'playerPage.divider.orClaim': 'ou reivindicar de um segmento',
  'playerPage.action.add': 'Adicionar',
  'playerPage.action.claim': 'Reivindicar',
  'playerPage.finalRound': 'RODADA FINAL',
  'playerPage.yourCampaign': 'Sua campanha',
  'playerPage.points': '{score} pts',

  // TurnActions
  'turn.exitPollTriggered': 'Boca de urna acionada — RODADA FINAL',
  'turn.youDrew': 'Você comprou',
  'turn.placeIn': 'colocar em',
  'turn.orClaim': 'ou reivindicar',
  'turn.claimSegment': 'Reivindicar {segment}',

  // ExitPoll acknowledgement (mobile)
  'exitPoll.continue': 'Continuar',
  'exitPoll.waitingFor': '{name} está olhando a boca de urna…',

  // DrawZone
  'draw.button': 'Comprar',
  'draw.waiting': 'Aguardando',
  'draw.waitingFor': 'Aguardando',
  'draw.youClaimed': 'Você reivindicou um segmento nesta rodada',

  // CoalitionBase
  'coalition.heading': 'Sua coalizão',
  'coalition.empty': '(vazia)',

  // CoalitionBreakdown
  'breakdown.empty': 'Nenhuma carta ainda.',
  'breakdown.allyHint': '(+2 pontos)',
  'breakdown.pivotHint': '(coringa)',

  // SegmentsReadonly + BigScreen heading
  'segments.heading': 'Segmentos eleitorais',
  'segments.claimedBy': 'Reivindicado por',
  'segments.claimedByShort': 'reivindicado por #{id}',

  // ScoreChart
  'scoreChart.heading': 'Pesquisa de opinião',
  'scoreChart.tickStart': 'Início',
  'scoreChart.tickRound': 'R{round}',

  // Leaderboard
  'leaderboard.heading': 'Campanha em curso',
  'leaderboard.round': 'Rodada {round}',
  'leaderboard.currentPlayer': 'Jogando agora',
  'leaderboard.claimedSegments': 'Já reivindicou',
  'leaderboard.allies': 'Aliados',
  'leaderboard.undecided': 'Indecisos',

  // WinnerScreen
  'winner.gameOver': 'Fim de jogo',
  'winner.wins': '{name}, {title}, vence!',
  'winner.coWinners': 'Co-vencedores: {lines}',
  'winner.tableHeader.player': 'Jogador',
  'winner.tableHeader.positiveBlocs': 'Blocos positivos',
  'winner.tableHeader.positive': 'Positivo',
  'winner.tableHeader.negativeBlocs': 'Blocos negativos',
  'winner.tableHeader.negative': 'Negativo',
  'winner.tableHeader.grants': 'Aliados',
  'winner.tableHeader.total': 'Total',

  // BigScreen
  'bigScreen.loading': 'Carregando partida…',
  'bigScreen.qrAriaLabel': 'Mostrar QR de entrada',

  // RoomInfoModal labels
  'roomInfo.heading': 'Sala',
  'roomInfo.joinLink': 'Entrar',
  'roomInfo.rejoinLink': 'Retomar',
  'roomInfo.close': 'Fechar',

  // LobbyView
  'lobby.dateline':
    'CAMPANHA 2026 · DIA ZERO · CANDIDATOS SE REÚNEM',
  'lobby.scanToJoinPrefix': 'Escaneie para entrar · ou ',
  'lobby.accessHere': 'acesse aqui',

  // CandidateCard
  'candidate.statusFiled': 'REGISTRADO',
  'candidate.statusReady': 'PRONTO',
  'candidate.empty': 'Aguardando candidato',

  // CandidateRoster
  'candidateRoster.heading': 'Candidatos',

  // LaunchCampaignBar
  'launch.bar':
    'Lançar campanha · {ready} de {max} candidatos prontos →',

  // RoomNotFound
  'roomNotFound.title': 'Sala não encontrada',
  'roomNotFound.bodyPrefix': 'Nenhuma partida com o código ',
  'roomNotFound.bodySuffix':
    '. Confira o código na tela do anfitrião.',
  'roomNotFound.bodyNoCode':
    'Nenhuma partida neste endereço. Confira o código na tela do anfitrião.',

  // HowToPlayPage
  'howTo.overline': 'O Manual',
  'howTo.title': 'Como jogar',
  'howTo.intro':
    'Colorlition é um jogo de drafting de cartas em tempo real para 2 a 5 jogadores, com a roupagem da política de coalizão de 2026. Você joga como um candidato adicionando Blocos de Interesse a Segmentos Eleitorais e reivindicando os que cabem em sua estratégia, correndo para montar uma coalizão de governo estável de no máximo três cores enquanto mantém contradições políticas longe da sua ficha.',
  'howTo.section.setup': 'Preparação',
  'howTo.section.deck': 'O baralho',
  'howTo.section.turn': 'Sua vez',
  'howTo.section.turnOver': 'Duas ações, uma escolha',
  'howTo.section.scoring': 'Pontuação',
  'howTo.section.scoringOver': 'A coalizão contra o ruído',
  'howTo.section.finalRound': 'A rodada final',
  'howTo.section.finalRoundOver': 'Boca de urna acionada',
  'howTo.section.glossary': 'Glossário',
  'howTo.section.glossaryOver': 'O vocabulário',
  'howTo.deck.intro': 'O baralho contém',
  'howTo.deck.cardsBold': '88 cartas',
  'howTo.deck.cardsAfter': ':',
  'howTo.deck.row1.bold': '63 Blocos de Interesse',
  'howTo.deck.row1.detail':
    ' — 9 cartas em cada uma das sete cores (Vermelho, Roxo, Verde, Azul, Laranja, Amarelo, Cinza).',
  'howTo.deck.row2.bold': '10 Aliados',
  'howTo.deck.row2.detail':
    ' — articuladores apartidários que valem +2 pontos cada.',
  'howTo.deck.row3.bold': '3 Indecisos',
  'howTo.deck.row3.detail':
    ' — coringas que preenchem qualquer bloco na contagem final.',
  'howTo.deck.row4.bold': '1 Boca de Urna',
  'howTo.deck.row4.detail':
    ' — embaralhada nas 15 cartas finais; aciona a rodada final.',
  'howTo.segments.intro':
    'O número de Segmentos Eleitorais ativos é igual ao número de jogadores. Cada segmento comporta no máximo três cartas. Os segmentos são extraídos de um elenco fixo: o Cinturão Industrial, os Profissionais Urbanos, a Fronteira Agrícola, o Distrito Financeiro e a Periferia.',
  'howTo.turn.intro':
    'Na sua vez, você toma exatamente uma de duas ações:',
  'howTo.turn.add.title': 'Adicionar Representação',
  'howTo.turn.add.body':
    'Compre uma carta da pilha e coloque-a em qualquer Segmento Eleitoral que tenha menos de três cartas. Se a carta for um Bloco de Interesse, sua demanda — o "Queremos…" — aparece em privado primeiro no seu celular. Quando você a deposita em um segmento, a demanda se torna pública na tela grande.',
  'howTo.turn.claim.title': 'Reivindicar Demandas',
  'howTo.turn.claim.body':
    'Leve todas as cartas de um único segmento para sua Base. Você fica de fora do resto da rodada. A rodada termina quando todos os jogadores tiverem reivindicado.',
  'howTo.scoring.intro':
    'Ao final da partida, sua Base é contada cor por cor usando uma escala triangular — blocos maiores valem desproporcionalmente mais.',
  'howTo.scoring.colHeader1': 'Cartas de uma cor',
  'howTo.scoring.colHeader2': 'Pontos',
  'howTo.scoring.row.1card': '1 carta',
  'howTo.scoring.row.2cards': '2 cartas',
  'howTo.scoring.row.3cards': '3 cartas',
  'howTo.scoring.row.4cards': '4 cartas',
  'howTo.scoring.row.5cards': '5 cartas',
  'howTo.scoring.row.6cards': '6+ cartas',
  'howTo.scoring.point1.bold': '1. Escolha suas três cores principais.',
  'howTo.scoring.point1.body':
    ' As três cores com mais cartas na sua Base pontuam positivamente.',
  'howTo.scoring.point2.bold': '2. Subtraia o resto.',
  'howTo.scoring.point2.body':
    ' Toda outra cor é uma Contradição Política — seu valor triangular é subtraído.',
  'howTo.scoring.point3.bold': '3. Os Indecisos se otimizam sozinhos.',
  'howTo.scoring.point3.body':
    ' O jogo atribui cada Indeciso à cor que produz o melhor saldo líquido para você. Você não precisa escolher.',
  'howTo.scoring.point4.bold': '4. Some os Aliados.',
  'howTo.scoring.point4.body':
    ' Cada Aliado na sua Base soma +2 pontos.',
  'howTo.scoring.notePrefix': 'A ',
  'howTo.scoring.noteItalic': 'Pesquisa de opinião',
  'howTo.scoring.noteSuffix':
    ' ao vivo na tela grande mostra esse cálculo em tempo real conforme as cartas são jogadas.',
  'howTo.finalRound.body':
    'A Boca de Urna fica embaralhada nas 15 últimas cartas do baralho. No instante em que ela é comprada, todo jogador que ainda não reivindicou tem uma ação final — e então a partida acaba e a contagem começa. Vigie sua Base até lá: uma quarta cor entrando sorrateiramente pode virar de positiva para negativa numa única compra tardia.',
  'howTo.glossary.interestBloc.term': 'Bloco de Interesse',
  'howTo.glossary.interestBloc.def':
    'Uma carta colorida representando um grupo de eleitores com uma demanda — o "Queremos…".',
  'howTo.glossary.voterSegment.term': 'Segmento Eleitoral',
  'howTo.glossary.voterSegment.def':
    'Uma fileira na mesa onde os blocos se acumulam. Um segmento por jogador; máximo de três cartas em cada.',
  'howTo.glossary.base.term': 'Base / Coalizão',
  'howTo.glossary.base.def':
    'As cartas que um jogador reivindicou. Pontuadas no fim da partida.',
  'howTo.glossary.claim.term': 'Reivindicar Demandas',
  'howTo.glossary.claim.def':
    'A ação de levar todas as cartas de um segmento para sua Base; você sai da rodada.',
  'howTo.glossary.contradictions.term': 'Contradições Políticas',
  'howTo.glossary.contradictions.def':
    'Cores fora das suas três principais. Seus pontos são subtraídos (a.k.a. "Reviravoltas").',
  'howTo.glossary.poll.term': 'Pesquisa de opinião',
  'howTo.glossary.poll.def':
    'O placar ao vivo — Positivos menos Negativos, mais Aliados.',
  'howTo.glossary.undecided.term': 'Indeciso',
  'howTo.glossary.undecided.def':
    'Um coringa. Atribuído automaticamente na pontuação para maximizar seu saldo líquido.',
  'howTo.glossary.ally.term': 'Aliado',
  'howTo.glossary.ally.def':
    'Um articulador apartidário que vale +2 pontos.',
  'howTo.glossary.exitPoll.term': 'Boca de Urna',
  'howTo.glossary.exitPoll.def':
    'Escondida nas 15 últimas cartas. Comprá-la aciona a rodada final.',

  // PageFooter — autoria e licença, mantemos a estrutura
  'footer.madeByPrefix': 'Feito por ',
  'footer.madeByLink': 'Raphael Aleixo / Ludoratory',
  'footer.madeBySuffix': '.',
  'footer.licensePrefix': 'Licenciado sob ',
  'footer.licenseLink': 'CC BY-NC-SA 4.0',
  'footer.licenseSuffix': '.',

  // Mock dev panel (DEV-only)
  'mock.controls': 'Controles do Mock',
  'mock.expand': 'Expandir controles do mock',
  'mock.minimize': 'Minimizar controles do mock',
  'mock.phaseInfo': 'Fase: {phase} · Rodada {round} · Baralho {deck}',
  'mock.drawAndPlace': 'Comprar e colocar (próxima vez)',
  'mock.drawPivot': 'Comprar indeciso',
  'mock.drawGrant': 'Comprar aliado',
  'mock.drawExitPoll': 'Comprar boca de urna',
  'mock.ackExitPoll': 'Confirmar boca de urna',
  'mock.claim': 'Jogador atual reivindica',
  'mock.endRound': 'Reivindicar último → encerrar rodada',
  'mock.endGame': 'Encerrar partida agora',
  'mock.advanceReveal': 'Avançar revelação',
  'mock.reset': 'Reiniciar',

  // Locale switcher
  'locale.switcher.aria': 'Idioma',
};

export default ptBR;
