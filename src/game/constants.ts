import type { Color, SegmentKey } from './types';
// `import type` is required: types.ts imports COLORS/SEGMENT_KEYS from this
// file, so a value-level import would create a runtime circular dependency.

export const COLORS = [
  'red',
  'purple',
  'green',
  'blue',
  'orange',
  'yellow',
  'grey',
] as const;

// Segment keys are stable IDs; user-visible labels are resolved from the
// active locale's GameDict at render time (see i18n/game/*.ts segmentLabels).
export const SEGMENT_KEYS = [
  { key: 'industrial' },
  { key: 'urban' },
  { key: 'agricultural' },
  { key: 'financial' },
  { key: 'periphery' },
] as const;

// Backwards-compat alias — many call sites still import SEGMENT_NAMES.
export const SEGMENT_NAMES = SEGMENT_KEYS;

export const CARDS_PER_COLOR = 9;
export const CARDS_PER_SEGMENT = 3;
export const GRANTS_IN_DECK = 10;
export const PIVOTS_IN_DECK = 3;
export const GRANT_VALUE = 2;
export const EXIT_POLL_BOTTOM_WINDOW = 15;
export const MIN_PLAYERS = 2;
export const EXCLUDE_COLOR_AT_PLAYERS = 3;
export const MAX_PLAYERS = 5;
export const TOP_POSITIVE_COLORS = 3;

const EXCLUSION_GROUP_A: Color[] = ['red', 'green', 'purple'];
const EXCLUSION_GROUP_B: Color[] = ['blue', 'orange', 'yellow', 'grey'];

function pickOne<T>(pool: T[]): T {
  return pool[Math.floor(Math.random() * pool.length)];
}

// Per-arity color exclusion rule. 2 players drops two colors (one from each
// group) so the deck doesn't tilt entirely warm or entirely cool. 3 players
// drops one random color (existing rule). 4+ keep the full deck.
export function excludedColorsFor(playerCount: number): Color[] {
  if (playerCount === 2) return [pickOne(EXCLUSION_GROUP_A), pickOne(EXCLUSION_GROUP_B)];
  if (playerCount === 3) return [pickOne(Array.from(COLORS))];
  return [];
}

// Per-arity segment layout. 2 players use a tapered 1/2/3 capacity across
// the first three named segments; 3+ use the existing uniform-3 rows, one
// per player.
export function segmentLayoutFor(
  playerCount: number,
): { key: SegmentKey; capacity: number }[] {
  if (playerCount === 2) {
    // 2-player layout uses the first three named segments (industrial, urban,
    // agricultural). Reordering SEGMENT_KEYS would change which segments these
    // capacities map to.
    return [
      { key: SEGMENT_KEYS[0].key, capacity: 1 },
      { key: SEGMENT_KEYS[1].key, capacity: 2 },
      { key: SEGMENT_KEYS[2].key, capacity: 3 },
    ];
  }
  return SEGMENT_KEYS.slice(0, playerCount).map((s) => ({
    key: s.key,
    capacity: CARDS_PER_SEGMENT,
  }));
}
