import { CARDS_PER_SEGMENT } from './constants';
import { computeWinners, scorePlayer } from './scoring';
import type { ColorlitionGameState, SegmentKey, Card, Segment, ScoreSnapshot } from './types';
import { deriveHeadline } from './headlines';

function snapshotScores(
  turnOrder: string[],
  playerState: ColorlitionGameState['playerState'],
  roundNumber: number,
): ScoreSnapshot {
  const scores: Record<string, number> = {};
  for (const pid of turnOrder) {
    scores[pid] = scorePlayer(pid, playerState[pid]?.base ?? []).total;
  }
  return { roundNumber, scores };
}

function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

export function currentPlayerId(state: ColorlitionGameState): string {
  return state.turnOrder[state.currentPlayerIndex];
}

export function canPlaceInSegment(segment: Segment): boolean {
  return segment.cards.length < CARDS_PER_SEGMENT && segment.claimedBy === null;
}

export function canClaimSegment(segment: Segment): boolean {
  return segment.cards.length > 0 && segment.claimedBy === null;
}

export function advanceTurn(state: ColorlitionGameState): ColorlitionGameState {
  const next = deepClone(state);
  const n = next.turnOrder.length;
  let found = -1;
  for (let step = 1; step <= n; step++) {
    const idx = (state.currentPlayerIndex + step) % n;
    const pid = next.turnOrder[idx];
    if (next.playerState[pid].roundStatus === 'active') {
      found = idx;
      break;
    }
  }
  if (found === -1) {
    // Round is over — no active players left.
    return enterRoundEnd(next);
  }
  next.currentPlayerIndex = found;
  return next;
}

// Pause point at the end of a round. Keeps segments in their final claimed
// state (cards + claimedBy intact) so the big screen can render the
// "all segments claimed" tableau before the reset. Bases are already flushed
// at claim time, so we snapshot the score now — the chart updates immediately.
export function enterRoundEnd(state: ColorlitionGameState): ColorlitionGameState {
  const next = deepClone(state);
  next.phase = 'roundEnd';
  next.scoreHistory.push(
    snapshotScores(next.turnOrder, next.playerState, next.roundNumber),
  );
  return next;
}

// Completes the round-end transition: clears segments, re-activates players,
// then either advances to the next round or — if the Exit Poll was drawn —
// computes winners and ends the game. Idempotent on non-roundEnd input.
export function commitRoundEnd(state: ColorlitionGameState): ColorlitionGameState {
  const next = deepClone(state);
  for (const seg of next.segments) {
    seg.cards = [];
    seg.claimedBy = null;
  }
  for (const pid of next.turnOrder) {
    next.playerState[pid].roundStatus = 'active';
  }

  if (next.exitPollDrawn) {
    next.phase = 'scoring';
    const bases: Record<string, Card[]> = {};
    for (const pid of next.turnOrder) bases[pid] = next.playerState[pid].base;
    const result = computeWinners(next.turnOrder, bases);
    next.scoreBreakdown = result.breakdowns;
    next.winnerIds = result.winnerIds;
    next.phase = 'ended';
    return next;
  }

  next.roundLeadIndex = (next.roundLeadIndex + 1) % next.turnOrder.length;
  next.currentPlayerIndex = next.roundLeadIndex;
  next.roundNumber += 1;
  next.phase = 'turn';
  return next;
}

// Pop a card from the deck and park it on shared state as `pendingDraw`. The
// player picks a placement target in a separate action (`placePendingDraw`),
// which lets the big screen render the medium-card reveal during the gap.
//
// Exit Poll is special: drawing it only flips `exitPollDrawn` + `phase`. The
// next-card draw is deferred to `acknowledgeExitPoll` so the Big Screen's
// ExitPollReveal can play to completion before the DrawCardReveal kicks in
// (otherwise both reveals race on the same atomic state update and the
// Exit Poll card gets visually obscured).
export function drawCard(state: ColorlitionGameState): ColorlitionGameState {
  const next = deepClone(state);
  if (next.pendingDraw) return next; // already drew; UI should prevent this
  if (next.deck.length === 0) return next;

  const card = next.deck.shift() as Card;

  if (card.kind === 'exitPoll') {
    next.exitPollDrawn = true;
    next.exitPollAcknowledged = false;
    next.phase = 'finalRound';
    return next;
  }

  // Implicit Exit Poll: a normal card just emptied the deck without the
  // explicit card surfacing. Defensive — shouldn't happen in normal play
  // since the Exit Poll is always inserted into the deck. Push the card
  // back so acknowledgeExitPoll picks it up via the same deferred path
  // as the explicit case (avoids a race between the two reveals).
  if (next.deck.length === 0 && !next.exitPollDrawn) {
    next.deck.push(card);
    next.exitPollDrawn = true;
    next.exitPollAcknowledged = false;
    next.phase = 'finalRound';
    return next;
  }

  next.pendingDraw = {
    playerId: currentPlayerId(next),
    card,
    exitPollTriggered: false,
  };
  return next;
}

// Active player's "Continue" tap after the Exit Poll is drawn. Flips the ack
// flag (so the Big Screen reveal departs) and performs the deferred draw so
// the player still gets a placeable card on their turn. If the deck is empty
// (Exit Poll was the last card), advance the turn instead.
export function acknowledgeExitPoll(
  state: ColorlitionGameState,
): ColorlitionGameState {
  if (!state.exitPollDrawn || state.exitPollAcknowledged) return state;
  const next = deepClone(state);
  next.exitPollAcknowledged = true;

  if (next.deck.length === 0) {
    return advanceTurn(next);
  }
  const card = next.deck.shift() as Card;
  next.pendingDraw = {
    playerId: currentPlayerId(next),
    card,
    exitPollTriggered: true,
  };
  return next;
}

// Land the previously-drawn card into a segment, generate the headline, and
// advance the turn. Implicit Exit Poll fires here if this draw drained the
// deck without the explicit Exit Poll card surfacing.
export function placePendingDraw(
  state: ColorlitionGameState,
  segmentKey: SegmentKey,
): ColorlitionGameState {
  const next = deepClone(state);
  const pending = next.pendingDraw;
  if (!pending) {
    throw new Error('placePendingDraw: no pendingDraw on state');
  }
  const seg = next.segments.find((s) => s.key === segmentKey);
  if (!seg || !canPlaceInSegment(seg)) {
    throw new Error(`placePendingDraw: invalid segment target ${segmentKey}`);
  }
  const segmentBefore = {
    ...seg,
    cards: seg.cards.slice(),
    claimedBy: seg.claimedBy,
  };
  seg.cards.push(pending.card);
  const headline = deriveHeadline(
    segmentBefore,
    seg,
    pending.card,
    next.roundNumber,
    0,
  );
  if (headline) next.lastHeadline = headline;

  next.pendingDraw = null;

  return advanceTurn(next);
}

export function claim(
  state: ColorlitionGameState,
  segmentKey: SegmentKey,
): ColorlitionGameState {
  const next = deepClone(state);
  const pid = currentPlayerId(next);
  const seg = next.segments.find((s) => s.key === segmentKey);
  if (!seg || !canClaimSegment(seg)) {
    throw new Error(`claim: invalid claim target ${segmentKey}`);
  }
  next.playerState[pid].base.push(...seg.cards);
  seg.cards = [];
  seg.claimedBy = pid;
  next.playerState[pid].roundStatus = 'claimed';
  return advanceTurn(next);
}

export function buildInitialGameState(
  deck: Card[],
  turnOrder: string[],
  segmentKeys: ReadonlyArray<{ key: SegmentKey }>,
  startingHands: Record<string, Card> = {},
): ColorlitionGameState {
  const playerCount = turnOrder.length;
  const segments: Segment[] = segmentKeys.slice(0, playerCount).map((s) => ({
    key: s.key,
    cards: [],
    claimedBy: null,
  }));
  const playerState: ColorlitionGameState['playerState'] = {};
  for (const pid of turnOrder) {
    const starter = startingHands[pid];
    playerState[pid] = { base: starter ? [starter] : [], roundStatus: 'active' };
  }
  return {
    phase: 'turn',
    deck,
    exitPollDrawn: false,
    exitPollAcknowledged: false,
    segments,
    turnOrder,
    currentPlayerIndex: 0,
    roundLeadIndex: 0,
    roundNumber: 1,
    playerState,
    winnerIds: null,
    scoreBreakdown: null,
    lastHeadline: null,
    scoreHistory: [snapshotScores(turnOrder, playerState, 0)],
    pendingDraw: null,
  };
}
