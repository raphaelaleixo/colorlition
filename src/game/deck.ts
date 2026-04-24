import {
  COLORS,
  CARDS_PER_COLOR,
  GRANTS_IN_DECK,
  PIVOTS_IN_DECK,
  EXIT_POLL_BOTTOM_WINDOW,
} from './constants';
import type { Card, Color } from './types';

export function buildDeck(excludedColor?: Color): Card[] {
  const deck: Card[] = [];
  for (const color of COLORS) {
    if (color === excludedColor) continue;
    for (let value = 0; value < CARDS_PER_COLOR; value++) {
      deck.push({
        id: `bloc-${color}-${value}`,
        kind: 'bloc',
        color: color as Color,
        value,
      });
    }
  }
  for (let i = 0; i < GRANTS_IN_DECK; i++) {
    deck.push({ id: `grant-${i}`, kind: 'grant' });
  }
  for (let i = 0; i < PIVOTS_IN_DECK; i++) {
    deck.push({ id: `pivot-${i}`, kind: 'pivot' });
  }
  // Full deck: 63 blocs + 10 grants + 3 pivots = 76. With one color excluded: 67.
  return deck;
}

export function pickRandomColor(excludedColor?: Color): Color {
  const pool = COLORS.filter((c) => c !== excludedColor);
  return pool[Math.floor(Math.random() * pool.length)] as Color;
}

// Deal one starting bloc card to each player, each a distinct color (and none
// of the excluded color). Returns the deck with those cards removed plus a
// { playerId -> Card } map of what each player starts with.
export function pickStartingHands(
  deck: Card[],
  playerIds: string[],
  excludedColor?: Color,
): { deck: Card[]; hands: Record<string, Card> } {
  const available = COLORS.filter((c) => c !== excludedColor) as Color[];
  if (playerIds.length > available.length) {
    throw new Error(
      `pickStartingHands: ${playerIds.length} players exceeds available colors (${available.length})`,
    );
  }
  const shuffledColors = shuffle(available).slice(0, playerIds.length);
  const remaining = deck.slice();
  const hands: Record<string, Card> = {};
  playerIds.forEach((pid, i) => {
    const color = shuffledColors[i];
    const idx = remaining.findIndex((c) => c.kind === 'bloc' && c.color === color);
    if (idx === -1) {
      throw new Error(`pickStartingHands: no ${color} bloc left in deck`);
    }
    const [card] = remaining.splice(idx, 1);
    hands[pid] = card;
  });
  return { deck: remaining, hands };
}

export function shuffle<T>(array: T[]): T[] {
  const result = array.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function placeExitPoll(shuffledDeck: Card[]): Card[] {
  const result = shuffledDeck.slice();
  const window = Math.min(EXIT_POLL_BOTTOM_WINDOW, result.length);
  // Pick an insertion index in the bottom `window` positions of the final deck.
  // Since we insert one card, the final deck length is result.length + 1.
  // We want the Exit Poll to sit at some index in [finalLen - window, finalLen - 1].
  const finalLen = result.length + 1;
  const minIdx = Math.max(0, finalLen - window);
  const maxIdx = finalLen - 1;
  const insertAt = minIdx + Math.floor(Math.random() * (maxIdx - minIdx + 1));
  const exitPoll: Card = { id: 'exit-poll', kind: 'exitPoll' };
  result.splice(insertAt, 0, exitPoll);
  return result;
}

export function createShuffledDeck(): Card[] {
  return placeExitPoll(shuffle(buildDeck()));
}
