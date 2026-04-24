import {
  COLORS,
  CARDS_PER_COLOR,
  GRANTS_IN_DECK,
  PIVOTS_IN_DECK,
  EXIT_POLL_BOTTOM_WINDOW,
} from './constants';
import type { Card, Color } from './types';

export function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (const color of COLORS) {
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
  return deck; // 63 blocs + 10 grants + 3 pivots = 76 cards. Exit Poll added by placeExitPoll.
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
