import { COLORS, TOP_POSITIVE_COLORS, GRANT_VALUE } from './constants';
import type { Card, Color, ScoreBreakdown } from './types';

export function triangular(n: number): number {
  if (n <= 0) return 0;
  // Cap at 6 — the 7th+ card of one color adds nothing. Drives the pivot
  // optimizer to divert wilds away from already-saturated colors.
  if (n >= 6) return 21;
  return (n * (n + 1)) / 2;
}

type ScoredAssignment = {
  assignment: Color[];
  counts: Record<Color, number>;
  positiveColors: Color[];
  negativeColors: Color[];
  positive: number;
  negative: number;
};

function emptyCounts(): Record<Color, number> {
  const out = {} as Record<Color, number>;
  for (const c of COLORS) out[c] = 0;
  return out;
}

function* enumerateAssignments(pivots: number): Generator<Color[]> {
  if (pivots === 0) {
    yield [];
    return;
  }
  // Combinations with repetition (multisets) of size `pivots` over COLORS.
  // Using indices to avoid duplicates like [red, blue] / [blue, red].
  const n = COLORS.length;
  const idx = Array(pivots).fill(0);
  while (true) {
    yield idx.map((i) => COLORS[i] as Color);
    let i = pivots - 1;
    while (i >= 0 && idx[i] === n - 1) i--;
    if (i < 0) return;
    idx[i]++;
    for (let j = i + 1; j < pivots; j++) idx[j] = idx[i];
  }
}

function scoreAssignment(baseCounts: Record<Color, number>, assignment: Color[]): ScoredAssignment {
  const counts = { ...baseCounts };
  for (const c of assignment) counts[c] += 1;

  const nonZero = COLORS.filter((c) => counts[c] > 0) as Color[];
  // Sort by count desc, tiebreak alphabetical for determinism.
  nonZero.sort((a, b) => counts[b] - counts[a] || a.localeCompare(b));

  const positiveColors = nonZero.slice(0, TOP_POSITIVE_COLORS);
  const negativeColors = nonZero.slice(TOP_POSITIVE_COLORS);

  const positive = positiveColors.reduce((sum, c) => sum + triangular(counts[c]), 0);
  const negative = negativeColors.reduce((sum, c) => sum + triangular(counts[c]), 0);

  return { assignment, counts, positiveColors, negativeColors, positive, negative };
}

export function scorePlayer(playerId: string, base: Card[]): ScoreBreakdown {
  const baseCounts = emptyCounts();
  let pivots = 0;
  let grantsRaw = 0;
  for (const card of base) {
    if (card.kind === 'bloc') baseCounts[card.color] += 1;
    else if (card.kind === 'pivot') pivots += 1;
    else if (card.kind === 'grant') grantsRaw += 1;
  }

  let best: ScoredAssignment | null = null;
  for (const assignment of enumerateAssignments(pivots)) {
    const scored = scoreAssignment(baseCounts, assignment);
    if (!best) {
      best = scored;
      continue;
    }
    const netNew = scored.positive - scored.negative;
    const netBest = best.positive - best.negative;
    if (netNew > netBest || (netNew === netBest && scored.positive > best.positive)) {
      best = scored;
    }
  }

  // `best` can only be null when COLORS is empty, which is unreachable in v1.
  if (!best) throw new Error('scoring: no assignment evaluated');

  const grants = grantsRaw * GRANT_VALUE;
  return {
    playerId,
    colorCounts: best.counts,
    pivotAssignments: best.assignment,
    positiveColors: best.positiveColors,
    negativeColors: best.negativeColors,
    positive: best.positive,
    negative: best.negative,
    grants,
    total: best.positive - best.negative + grants,
  };
}

export type WinnerResult = {
  winnerIds: string[];
  breakdowns: ScoreBreakdown[];
};

function countRaw(base: Card[], kind: Card['kind']): number {
  return base.filter((c) => c.kind === kind).length;
}

export function computeWinners(
  turnOrder: string[],
  playerBases: Record<string, Card[]>,
): WinnerResult {
  const breakdowns = turnOrder.map((id) => scorePlayer(id, playerBases[id] ?? []));
  const maxTotal = Math.max(...breakdowns.map((b) => b.total));
  let candidates = breakdowns.filter((b) => b.total === maxTotal).map((b) => b.playerId);

  if (candidates.length > 1) {
    // Tiebreaker 1: more grants (raw count).
    const grantCount = (id: string) => countRaw(playerBases[id] ?? [], 'grant');
    const maxGrants = Math.max(...candidates.map(grantCount));
    candidates = candidates.filter((id) => grantCount(id) === maxGrants);
  }
  if (candidates.length > 1) {
    // Tiebreaker 2: fewer total cards in base.
    const baseLen = (id: string) => (playerBases[id] ?? []).length;
    const minLen = Math.min(...candidates.map(baseLen));
    candidates = candidates.filter((id) => baseLen(id) === minLen);
  }
  if (candidates.length > 1) {
    // Tiebreaker 3: earliest slot in turnOrder.
    const firstIdx = Math.min(...candidates.map((id) => turnOrder.indexOf(id)));
    candidates = [turnOrder[firstIdx]];
  }

  return { winnerIds: candidates, breakdowns };
}

export function projectedMandate(base: Card[]): number {
  return scorePlayer('__tmp__', base).total;
}
