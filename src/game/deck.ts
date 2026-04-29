import {
  COLORS,
  CARDS_PER_COLOR,
  GRANTS_IN_DECK,
  PIVOTS_IN_DECK,
  EXIT_POLL_BOTTOM_WINDOW,
} from './constants';
import type { Card, Color } from './types';

export function buildDeck(excluded: Color[] = []): Card[] {
  const skip = new Set(excluded);
  const deck: Card[] = [];
  for (const color of COLORS) {
    if (skip.has(color as Color)) continue;
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
  // 7 colors × 9 = 63 blocs full deck. 5 colors → 45, 6 colors → 54.
  return deck;
}

export function pickStartingHands(
  deck: Card[],
  playerIds: string[],
  excluded: Color[] = [],
  cardsPerPlayer = 1,
): { deck: Card[]; hands: Record<string, Card[]> } {
  const skip = new Set(excluded);
  const available = COLORS.filter((c) => !skip.has(c as Color)) as Color[];
  const required = playerIds.length * cardsPerPlayer;
  if (required > available.length) {
    throw new Error(
      `pickStartingHands: ${playerIds.length} players × ${cardsPerPlayer} cards = ${required} colors needed, only ${available.length} available`,
    );
  }
  const shuffledColors = shuffle(available).slice(0, required);
  const remaining = deck.slice();
  const hands: Record<string, Card[]> = {};
  playerIds.forEach((pid, playerIdx) => {
    hands[pid] = [];
    for (let cardIdx = 0; cardIdx < cardsPerPlayer; cardIdx++) {
      const color = shuffledColors[playerIdx * cardsPerPlayer + cardIdx];
      const idx = remaining.findIndex(
        (c) => c.kind === 'bloc' && c.color === color,
      );
      if (idx === -1) {
        throw new Error(`pickStartingHands: no ${color} bloc left in deck`);
      }
      const [card] = remaining.splice(idx, 1);
      hands[pid].push(card);
    }
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
