import { CARDS_PER_SEGMENT } from './constants';
import { computeWinners } from './scoring';
import type { ColorlitionGameState, SegmentKey, Card, Segment } from './types';

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
    return endRound(next);
  }
  next.currentPlayerIndex = found;
  return next;
}

export function endRound(state: ColorlitionGameState): ColorlitionGameState {
  const next = deepClone(state);
  // Flush already happened at claim time (see claim()). Here we just reset.
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

export function drawAndPlace(
  state: ColorlitionGameState,
  segmentKey: SegmentKey,
): ColorlitionGameState {
  const next = deepClone(state);
  if (next.deck.length === 0) return next; // nothing to do; caller shouldn't invoke

  // Pop first card.
  let card = next.deck.shift() as Card;

  // Exit Poll: trigger final round, re-draw.
  if (card.kind === 'exitPoll') {
    next.exitPollDrawn = true;
    next.phase = 'finalRound';
    if (next.deck.length === 0) {
      // Exit Poll was literally last card: skip placement, advance turn.
      return advanceTurn(next);
    }
    card = next.deck.shift() as Card;
  }

  // Place into segment.
  const seg = next.segments.find((s) => s.key === segmentKey);
  if (!seg || !canPlaceInSegment(seg)) {
    // Invalid placement target. Caller should prevent this via UI, but if
    // it happens, surface via error rather than silently corrupting state.
    throw new Error(`drawAndPlace: invalid segment target ${segmentKey}`);
  }
  seg.cards.push(card);

  // Implicit Exit Poll: if deck is empty after a non-exit-poll draw, mark final round.
  if (next.deck.length === 0 && !next.exitPollDrawn) {
    next.exitPollDrawn = true;
    next.phase = 'finalRound';
  }

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
  segmentKeys: ReadonlyArray<{ key: SegmentKey; label: string }>,
  startingHands: Record<string, Card> = {},
): ColorlitionGameState {
  const playerCount = turnOrder.length;
  const segments: Segment[] = segmentKeys.slice(0, playerCount).map((s) => ({
    key: s.key,
    label: s.label,
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
    segments,
    turnOrder,
    currentPlayerIndex: 0,
    roundLeadIndex: 0,
    roundNumber: 1,
    playerState,
    winnerIds: null,
    scoreBreakdown: null,
    headlines: [],
  };
}
