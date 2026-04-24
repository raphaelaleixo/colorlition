import { SINGLE_TITLES, DUAL_TITLES, TRIPLE_TITLES } from './data/titles';
import type { Color } from './types';

export function deriveVictoryTitle(positiveColors: Color[]): string {
  if (positiveColors.length === 0) return '…the Reluctant Candidate';

  if (positiveColors.length === 1) {
    return SINGLE_TITLES[positiveColors[0]] ?? '…the Unclassified Leader';
  }

  const key = positiveColors.slice().sort().join('+');

  if (positiveColors.length === 2) {
    return DUAL_TITLES[key] ?? '…the Unclassified Leader';
  }

  if (positiveColors.length === 3) {
    return TRIPLE_TITLES[key] ?? '…the Unclassified Leader';
  }

  return '…the Unclassified Leader';
}
