import type { GameDict } from '../i18n';
import type { Color } from './types';

export function deriveVictoryTitle(
  positiveColors: Color[],
  colorCounts: Record<Color, number>,
  dict: GameDict,
): string {
  if (positiveColors.length === 0) return dict.reluctantCandidateTitle;

  // Key the title only on colors tied for the highest count among the
  // player's positives. If 4+ raw colors tie at that count, scoring already
  // capped positives at 3 (alphabetical tiebreaker), so `top` is at most 3.
  const max = Math.max(...positiveColors.map((c) => colorCounts[c]));
  const top = positiveColors.filter((c) => colorCounts[c] === max);

  if (top.length === 1) {
    return dict.singleTitles[top[0]] ?? dict.unclassifiedLeaderTitle;
  }

  const key = top.slice().sort().join('+');

  if (top.length === 2) {
    return dict.dualTitles[key] ?? dict.unclassifiedLeaderTitle;
  }

  if (top.length === 3) {
    return dict.tripleTitles[key] ?? dict.unclassifiedLeaderTitle;
  }

  return dict.unclassifiedLeaderTitle;
}
