// UI dictionary — flat keys, dotted naming for organization. Values are
// strings; placeholders use {token} format and are interpolated by t().
//
// This file is the single source of truth for UI keys. Adding a key here
// grows the UIKey union; pt-BR.ts must mirror every key (TS-enforced).
const en = {
  // Common / shared
  'common.backToHome': 'Back to home',
  'common.cancel': 'Cancel',
  'common.loading': 'Loading…',
  'common.roomLabel': 'Room {id}',
  'common.roomShort': 'Room',

  // Home
  'home.tagline.bold': 'Build a coalition. Mind the contradictions.',
  'home.tagline.detail':
    'A real-time card draft for 2 to 5 players, dressed up as 2026 politics.',
  'home.cta.create': 'Create Game',
  'home.cta.creating': 'Creating…',
  'home.cta.join': 'Join with code →',
  'home.cta.howToPlay': 'How to play →',

  // Host-warning modal (used on Home & Join)
  'hostWarning.title': 'Heads up',
  'hostWarning.body':
    "You're about to host on what looks like a phone. The host screen works best on a larger display — a TV or monitor.",
  'hostWarning.confirm': 'Host anyway',

  // Join
  'join.title': 'Resume',
  'join.subtitle':
    'Enter the room code your friends shared to jump back in.',
  'join.codeLabel': 'Room code',
  'join.errorRoomNotFound':
    'Room not found. Check the code and try again.',
  'join.cta.host': 'Resume as host',
  'join.cta.hostBusy': 'Resuming…',
  'join.cta.player': 'Resume as player →',
  'join.cta.playerBusy': 'Resuming…',

  // PlayerJoinPage
  'playerJoin.title': 'File your candidacy',
  'playerJoin.nameLabel': 'Your name',
  'playerJoin.errorEmpty': 'Enter your name',
  'playerJoin.submit': 'Join',
  'playerJoin.submitBusy': 'Joining…',
  'playerJoin.rejoinTitle': 'Tap your name',
  'playerJoin.rejoinBody':
    'The game has started. Choose your spot to rejoin.',
  'playerJoin.statusReady': 'Ready',
  'playerJoin.statusFiled': 'Filed',

  // PlayerPage
  'playerPage.missingIds': 'Missing room or player id.',
  'playerPage.invalidSlot': 'Invalid player slot.',
  'playerPage.invalidSlotId': 'Invalid slot id',
  'playerPage.claiming': "You're claiming Slot {playerId}. Enter your name:",
  'playerPage.nameLabel': 'Your Name',
  'playerPage.join': 'Join',
  'playerPage.joining': 'Joining…',
  'playerPage.youReady': "You're ready, {name}",
  'playerPage.youReadySub': 'Campaign starts when the host calls it',
  'playerPage.youWon': 'You won!',
  'playerPage.gameOver': 'Game over',
  'playerPage.fallbackPlayer': 'Player {id}',
  'playerPage.seatOverline': '{id} · Seat {playerId}',
  'playerPage.divider.voterSegments': 'voter segments',
  'playerPage.divider.addToSegment': 'add to a segment',
  'playerPage.divider.orClaim': 'or claim from a segment',
  'playerPage.action.add': 'Add',
  'playerPage.action.claim': 'Claim',
  'playerPage.finalRound': 'FINAL ROUND',
  'playerPage.yourCampaign': 'Your Campaign',
  'playerPage.points': '{score} pts',

  // TurnActions
  'turn.exitPollTriggered': 'Exit Poll triggered — FINAL ROUND',
  'turn.youDrew': 'You drew',
  'turn.placeIn': 'place in',
  'turn.orClaim': 'or claim',
  'turn.claimSegment': 'Claim {segment}',

  // ExitPoll acknowledgement (mobile)
  'exitPoll.continue': 'Continue',
  'exitPoll.waitingFor': '{name} is reviewing the Exit Poll…',

  // DrawZone
  'draw.button': 'Draw',
  'draw.waiting': 'Waiting',
  'draw.waitingFor': 'Waiting for',
  'draw.youClaimed': 'You claimed a segment this round',

  // CoalitionBase
  'coalition.heading': 'Your Coalition',
  'coalition.empty': '(empty)',

  // CoalitionBreakdown
  'breakdown.empty': 'No cards yet.',
  'breakdown.allyHint': '(+2 points)',
  'breakdown.pivotHint': '(wildcard)',

  // SegmentsReadonly + BigScreen heading
  'segments.heading': 'Voter Segments',
  'segments.claimedBy': 'Claimed by',
  'segments.claimedByShort': 'claimed by #{id}',

  // ScoreChart
  'scoreChart.heading': 'Poll Results',
  'scoreChart.tickStart': 'Start',
  'scoreChart.tickRound': 'R{round}',

  // Leaderboard
  'leaderboard.heading': 'Current Campaign',
  'leaderboard.round': 'Round {round}',
  'leaderboard.currentPlayer': 'Current player',
  'leaderboard.claimedSegments': 'Claimed segments',
  'leaderboard.allies': 'Allies',
  'leaderboard.undecided': 'Undecided',

  // WinnerScreen
  'winner.gameOver': 'Game Over',
  'winner.wins': '{name}, {title} Wins!',
  'winner.coWinners': 'Co-winners: {lines}',
  'winner.tableHeader.player': 'Player',
  'winner.tableHeader.positiveBlocs': 'Positive blocs',
  'winner.tableHeader.positive': 'Positive',
  'winner.tableHeader.negativeBlocs': 'Negative blocs',
  'winner.tableHeader.negative': 'Negative',
  'winner.tableHeader.grants': 'Grants',
  'winner.tableHeader.total': 'Total',

  // BigScreen
  'bigScreen.loading': 'Loading game…',
  'bigScreen.qrAriaLabel': 'Show join QR code',

  // RoomInfoModal labels
  'roomInfo.heading': 'Room',
  'roomInfo.joinLink': 'Join',
  'roomInfo.rejoinLink': 'Rejoin',
  'roomInfo.close': 'Close',

  // LobbyView
  'lobby.dateline': 'CAMPAIGN 2026 · DAY ZERO · CANDIDATES CONVENING',
  'lobby.scanToJoinPrefix': 'Scan to join · or ',
  'lobby.accessHere': 'access here',

  // CandidateCard
  'candidate.statusFiled': 'FILED',
  'candidate.statusReady': 'READY',
  'candidate.empty': 'Awaiting candidate',

  // CandidateRoster
  'candidateRoster.heading': 'Candidates',

  // LaunchCampaignBar
  'launch.bar': 'Launch Campaign · {ready} of {max} candidates ready →',

  // RoomNotFound
  'roomNotFound.title': 'Room not found',
  'roomNotFound.bodyPrefix': 'No game with code ',
  'roomNotFound.bodySuffix': ". Check the code on the host's screen.",
  'roomNotFound.bodyNoCode':
    "No game at this address. Check the code on the host's screen.",

  // HowToPlayPage
  'howTo.overline': 'The Manual',
  'howTo.title': 'How to Play',
  'howTo.intro':
    'Colorlition is a real-time card-drafting game for 2 to 5 players, dressed up as 2026 coalition politics. You play a candidate adding Interest Blocs to Voter Segments and claiming the ones that fit, racing to assemble a stable governing coalition of at most three colors while keeping policy contradictions off your record.',
  'howTo.section.setup': 'Setup',
  'howTo.section.deck': 'The Deck',
  'howTo.section.turn': 'Your Turn',
  'howTo.section.turnOver': 'Two Actions, One Choice',
  'howTo.section.scoring': 'Scoring',
  'howTo.section.scoringOver': 'The Coalition vs. The Noise',
  'howTo.section.finalRound': 'The Final Round',
  'howTo.section.finalRoundOver': 'Exit Poll Triggered',
  'howTo.section.glossary': 'Glossary',
  'howTo.section.glossaryOver': 'The Vocabulary',
  'howTo.deck.intro': 'The deck contains',
  'howTo.deck.cardsBold': '88 cards',
  'howTo.deck.cardsAfter': ':',
  'howTo.deck.row1.bold': '63 Interest Bloc cards',
  'howTo.deck.row1.detail':
    ' — 9 cards in each of the seven colors (Red, Purple, Green, Blue, Orange, Yellow, Grey).',
  'howTo.deck.row2.bold': '10 Allies',
  'howTo.deck.row2.detail':
    ' — non-partisan power-brokers worth a flat +2 points.',
  'howTo.deck.row3.bold': '3 Undecideds',
  'howTo.deck.row3.detail':
    ' — wild cards that fill any bloc at scoring.',
  'howTo.deck.row4.bold': '1 Exit Poll',
  'howTo.deck.row4.detail':
    ' — shuffled into the bottom 15 cards; triggers the final round.',
  'howTo.segments.intro':
    'The number of active Voter Segments equals the number of players. Each segment can hold up to three cards. Segments are drawn from a fixed cast: the Industrial Belt, Urban Professionals, the Agricultural Frontier, the Financial District, and the Periphery.',
  'howTo.turn.intro':
    'On your turn you take exactly one of two actions:',
  'howTo.turn.add.title': 'Add Representation',
  'howTo.turn.add.body':
    'Draw one card from the pile and place it in any Voter Segment that has fewer than three cards. If the card is an Interest Bloc, its "We want…" demand appears privately on your phone first. Once you commit it to a segment, the demand becomes public on the big screen.',
  'howTo.turn.claim.title': 'Claim Demands',
  'howTo.turn.claim.body':
    'Take every card from a single segment into your Base. You sit out the rest of the round. The round ends once each player has claimed.',
  'howTo.scoring.intro':
    'At the end of the game, your Base is tallied color by color using a triangular scale — bigger blocs are worth disproportionately more.',
  'howTo.scoring.colHeader1': 'Cards of one color',
  'howTo.scoring.colHeader2': 'Points',
  'howTo.scoring.row.1card': '1 card',
  'howTo.scoring.row.2cards': '2 cards',
  'howTo.scoring.row.3cards': '3 cards',
  'howTo.scoring.row.4cards': '4 cards',
  'howTo.scoring.row.5cards': '5 cards',
  'howTo.scoring.row.6cards': '6+ cards',
  'howTo.scoring.point1.bold': '1. Pick your top three colors.',
  'howTo.scoring.point1.body':
    ' The three colors with the most cards in your Base score positively.',
  'howTo.scoring.point2.bold': '2. Subtract the rest.',
  'howTo.scoring.point2.body':
    ' Every other color is a Policy Contradiction — its triangular value is subtracted.',
  'howTo.scoring.point3.bold': '3. Undecideds optimize themselves.',
  'howTo.scoring.point3.body':
    " The game assigns each Undecided to whichever color produces the best net score for you. You don't have to pick.",
  'howTo.scoring.point4.bold': '4. Add Allies.',
  'howTo.scoring.point4.body':
    ' Each Ally in your Base adds a flat +2 points.',
  'howTo.scoring.notePrefix': 'The live ',
  'howTo.scoring.noteItalic': 'Poll Results',
  'howTo.scoring.noteSuffix':
    ' on the big screen show this calculation in real time as cards land.',
  'howTo.finalRound.body':
    'The Exit Poll is shuffled into the bottom 15 cards of the deck. The moment it is drawn, every player who has not yet claimed gets one final action — then the game ends and scoring begins. Watch your Base before then: a fourth color sneaking into it can flip from positive to negative on a single late draw.',
  'howTo.glossary.interestBloc.term': 'Interest Bloc',
  'howTo.glossary.interestBloc.def':
    'A colored card representing a voter group with a "We want…" demand.',
  'howTo.glossary.voterSegment.term': 'Voter Segment',
  'howTo.glossary.voterSegment.def':
    'A row on the table where blocs accumulate. One segment per player; max three cards each.',
  'howTo.glossary.base.term': 'Base / Coalition',
  'howTo.glossary.base.def':
    'The cards a player has claimed. Scored at the end.',
  'howTo.glossary.claim.term': 'Claim Demands',
  'howTo.glossary.claim.def':
    'The action of taking all cards in one segment into your Base; you exit the round.',
  'howTo.glossary.contradictions.term': 'Policy Contradictions',
  'howTo.glossary.contradictions.def':
    'Colors outside your top three. Their points are subtracted (a.k.a. "Flip-Flops").',
  'howTo.glossary.poll.term': 'Poll Results',
  'howTo.glossary.poll.def':
    'The live leaderboard — Positive minus Negative, plus Allies.',
  'howTo.glossary.undecided.term': 'Undecided',
  'howTo.glossary.undecided.def':
    'A wild card. Auto-assigned at scoring to maximize your net total.',
  'howTo.glossary.ally.term': 'Ally',
  'howTo.glossary.ally.def':
    'A non-partisan power-broker worth a flat +2 points.',
  'howTo.glossary.exitPoll.term': 'Exit Poll',
  'howTo.glossary.exitPoll.def':
    'Hidden in the bottom 15 cards. Drawing it triggers the final round.',

  // PageFooter
  'footer.madeByPrefix': 'Made by ',
  'footer.madeByLink': 'Raphael Aleixo / Ludoratory',
  'footer.madeBySuffix': '.',
  'footer.licensePrefix': 'Licensed under ',
  'footer.licenseLink': 'CC BY-NC-SA 4.0',
  'footer.licenseSuffix': '.',

  // Mock dev panel (DEV-only). Keep in dict for completeness but pt-BR can
  // mirror EN since it isn't player-facing.
  'mock.controls': 'Mock Controls',
  'mock.expand': 'Expand mock controls',
  'mock.minimize': 'Minimize mock controls',
  'mock.phaseInfo': 'Phase: {phase} · Round {round} · Deck {deck}',
  'mock.drawAndPlace': 'Draw & place (next turn)',
  'mock.drawPivot': 'Draw pivot',
  'mock.drawGrant': 'Draw grant',
  'mock.drawExitPoll': 'Draw exit poll',
  'mock.ackExitPoll': 'Ack exit poll',
  'mock.claim': 'Current player claims',
  'mock.endRound': 'Claim last → end round',
  'mock.endGame': 'End game now',
  'mock.advanceReveal': 'Advance reveal',
  'mock.reset': 'Reset',

  // Locale switcher (Phase E)
  'locale.switcher.aria': 'Language',
} as const satisfies Record<string, string>;

export type UIKey = keyof typeof en;
export type UIDict = Record<UIKey, string>;

export default en;
