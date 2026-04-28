import { COLORS, TOP_POSITIVE_COLORS } from './constants';
import type { GameDict } from '../i18n';
import type { Color } from './types';

export function deriveVictoryTitle(
  rawColorCounts: Record<Color, number>,
  dict: GameDict,
): string {
  const present = (COLORS as readonly Color[]).filter(
    (c) => rawColorCounts[c] > 0,
  );
  if (present.length === 0) return dict.reluctantCandidateTitle;

  // Mirror scoring's positive-tier selection on raw blocs only — pivots are
  // excluded so the title keys on what the player actually drafted, not on
  // wild assignments.
  const sorted = present
    .slice()
    .sort((a, b) => rawColorCounts[b] - rawColorCounts[a] || a.localeCompare(b));
  const positiveColors = sorted.slice(0, TOP_POSITIVE_COLORS);

  const max = rawColorCounts[positiveColors[0]];
  const top = positiveColors.filter((c) => rawColorCounts[c] === max);

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
