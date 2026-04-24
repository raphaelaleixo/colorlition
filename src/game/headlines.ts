import { BLOC_NAMES } from './data/demands';
import { IRONIC_DICTIONARY, SEGMENT_CITIZENS, type IronicEntry } from './data/headlines';
import type { Card, Color, Headline, Segment } from './types';

function isBloc(card: Card): card is Extract<Card, { kind: 'bloc' }> {
  return card.kind === 'bloc';
}

function sortedColors(cards: Card[]): Color[] {
  const colors: Color[] = [];
  for (const c of cards) {
    if (isBloc(c)) colors.push(c.color);
  }
  return colors.slice().sort();
}

function findDictionaryEntry(
  segmentKey: Segment['key'],
  colors: Color[],
): IronicEntry | null {
  const sorted = colors.slice().sort();
  return (
    IRONIC_DICTIONARY.find(
      (e) =>
        e.segmentKey === segmentKey &&
        e.colors.length === sorted.length &&
        e.colors.every((c, i) => c === sorted[i]),
    ) ?? null
  );
}

function renderSegmentFull(segment: Segment): string {
  const cards = segment.cards;
  const allBlocs = cards.every(isBloc);

  if (!allBlocs) {
    return `A mixed coalition of interests claims the ${segment.label}.`;
  }

  // All three are blocs. Group by color.
  const blocs = cards.filter(isBloc);
  const counts: Partial<Record<Color, number>> = {};
  for (const b of blocs) {
    counts[b.color] = (counts[b.color] ?? 0) + 1;
  }
  const entries = Object.entries(counts) as [Color, number][];

  // Uniform: one color with count 3.
  if (entries.length === 1) {
    const [color] = entries[0];
    return `The ${segment.label} speaks with one voice as ${BLOC_NAMES[color]} dominates.`;
  }

  // Duopoly: two colors with counts 2 + 1.
  if (entries.length === 2) {
    const sorted = entries.slice().sort((a, b) => b[1] - a[1]);
    const [majority] = sorted[0];
    const [minority] = sorted[1];
    return `${BLOC_NAMES[majority]} dominates the ${segment.label}, with ${BLOC_NAMES[minority]} clinging on.`;
  }

  // Three different colors. Try dictionary first.
  const colors = sortedColors(cards);
  const dict = findDictionaryEntry(segment.key, colors);
  if (dict) return dict.headline;

  // Coalition fallback.
  const [a, b, c] = colors;
  return `An unlikely coalition forms in the ${segment.label}: ${BLOC_NAMES[a]}, ${BLOC_NAMES[b]}, and ${BLOC_NAMES[c]}.`;
}

function renderRisingDemand(segment: Segment, card: Card): string | null {
  if (!isBloc(card)) return null;
  return `${segment.label} Headline: Demands for ${BLOC_NAMES[card.color]} begin to rise among ${SEGMENT_CITIZENS[segment.key]}.`;
}

function renderTenseAlliance(segment: Segment): string | null {
  if (segment.cards.length !== 2) return null;
  const [a, b] = segment.cards;
  if (!isBloc(a) || !isBloc(b)) return null;
  if (a.color === b.color) return null;
  // Order by alphabetical color for a stable sentence.
  const [first, second] = [a, b].sort((x, y) => (x.color < y.color ? -1 : 1));
  return `${segment.label} Headline: A tense alliance forms as ${BLOC_NAMES[first.color]} and ${BLOC_NAMES[second.color]} interests collide.`;
}

export function deriveHeadline(
  segmentBefore: Segment,
  segmentAfter: Segment,
  placedCard: Card,
  roundNumber: number,
  seq: number,
): Headline | null {
  const n = segmentAfter.cards.length;

  // Rule 1: segment full.
  if (n === 3) {
    const text = renderSegmentFull(segmentAfter);
    return {
      id: `h-${roundNumber}-${segmentAfter.key}-${seq}`,
      kind: 'segment_full',
      segmentKey: segmentAfter.key,
      roundNumber,
      text,
    };
  }

  // Rule 2: tense alliance on the second card.
  if (n === 2) {
    const text = renderTenseAlliance(segmentAfter);
    if (!text) return null;
    return {
      id: `h-${roundNumber}-${segmentAfter.key}-${seq}`,
      kind: 'tense_alliance',
      segmentKey: segmentAfter.key,
      roundNumber,
      text,
    };
  }

  // Rule 3: rising demand on the first card.
  if (n === 1 && segmentBefore.cards.length === 0) {
    const text = renderRisingDemand(segmentAfter, placedCard);
    if (!text) return null;
    return {
      id: `h-${roundNumber}-${segmentAfter.key}-${seq}`,
      kind: 'rising_demand',
      segmentKey: segmentAfter.key,
      roundNumber,
      text,
    };
  }

  return null;
}
