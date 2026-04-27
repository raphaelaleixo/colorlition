import { SINGLE_TITLES, DUAL_TITLES, TRIPLE_TITLES } from './data/titles';
import type { Color } from './types';

export function deriveVictoryTitle(
  positiveColors: Color[],
  colorCounts: Record<Color, number>,
): string {
  if (positiveColors.length === 0) return 'the Reluctant Candidate';

  // Key the title only on colors tied for the highest count among the
  // player's positives. If 4+ raw colors tie at that count, scoring already
  // capped positives at 3 (alphabetical tiebreaker), so `top` is at most 3.
  const max = Math.max(...positiveColors.map((c) => colorCounts[c]));
  const top = positiveColors.filter((c) => colorCounts[c] === max);

  if (top.length === 1) {
    return SINGLE_TITLES[top[0]] ?? 'the Unclassified Leader';
  }

  const key = top.slice().sort().join('+');

  if (top.length === 2) {
    return DUAL_TITLES[key] ?? 'the Unclassified Leader';
  }

  if (top.length === 3) {
    return TRIPLE_TITLES[key] ?? 'the Unclassified Leader';
  }

  return 'the Unclassified Leader';
}
