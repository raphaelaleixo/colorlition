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
export const MIN_PLAYERS = 3;
export const EXCLUDE_COLOR_AT_PLAYERS = 3;
export const MAX_PLAYERS = 5;
export const TOP_POSITIVE_COLORS = 3;
