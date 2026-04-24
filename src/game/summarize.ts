import { COLORS } from './constants';
import type { Card, Color } from './types';

export type CoalitionSummaryRow = { label: string; count: number };

export function summarizeCoalition(base: Card[]): CoalitionSummaryRow[] {
  const byColor: Record<Color, number> = {} as Record<Color, number>;
  for (const c of COLORS) byColor[c] = 0;
  let pivots = 0;
  let grants = 0;
  for (const card of base) {
    if (card.kind === 'bloc') byColor[card.color] += 1;
    else if (card.kind === 'pivot') pivots += 1;
    else if (card.kind === 'grant') grants += 1;
  }
  const rows: CoalitionSummaryRow[] = [];
  for (const c of COLORS) {
    if (byColor[c] > 0) rows.push({ label: c, count: byColor[c] });
  }
  if (pivots > 0) rows.push({ label: 'pivot', count: pivots });
  if (grants > 0) rows.push({ label: 'grant', count: grants });
  return rows;
}
