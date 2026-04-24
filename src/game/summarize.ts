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
  // Blocs sorted by count desc; ties fall back to COLORS declaration order for
  // determinism. Pivot and Grant always pinned to the end (they aren't scored
  // like blocs, so grouping them together reads as "other cards").
  const blocRows: CoalitionSummaryRow[] = COLORS
    .map((c, idx) => ({ label: c, count: byColor[c], idx }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count || a.idx - b.idx)
    .map(({ label, count }) => ({ label, count }));

  const rows: CoalitionSummaryRow[] = blocRows.slice();
  if (pivots > 0) rows.push({ label: 'pivot', count: pivots });
  if (grants > 0) rows.push({ label: 'grant', count: grants });
  return rows;
}
