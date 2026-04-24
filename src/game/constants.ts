export const COLORS = [
  'red',
  'purple',
  'green',
  'blue',
  'orange',
  'yellow',
  'grey',
] as const;

export const SEGMENT_NAMES = [
  { key: 'industrial', label: 'Industrial Belt' },
  { key: 'urban', label: 'Urban Professionals' },
  { key: 'agricultural', label: 'Agricultural Frontier' },
  { key: 'financial', label: 'Financial District' },
  { key: 'periphery', label: 'Periphery' },
] as const;

export const CARDS_PER_COLOR = 9;
export const CARDS_PER_SEGMENT = 3;
export const GRANTS_IN_DECK = 10;
export const PIVOTS_IN_DECK = 3;
export const GRANT_VALUE = 2;
export const EXIT_POLL_BOTTOM_WINDOW = 15;
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 5;
export const TOP_POSITIVE_COLORS = 3;
