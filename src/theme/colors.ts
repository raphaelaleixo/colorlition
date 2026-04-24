import type { SxProps, Theme } from '@mui/material/styles';

// Saturated journalism palette. Bloc hues sit around S=60-75%, L=45-55% so
// they read as clearly-distinct colors without feeling neon. Pivot and Grant
// share a single "neutral" ink swatch — together they're the non-color cards,
// set visually apart from any of the seven blocs. Exit Poll is a deeper
// alert-crimson that's distinct from bloc red.

export type ChipKey =
  | 'red'
  | 'purple'
  | 'green'
  | 'blue'
  | 'orange'
  | 'yellow'
  | 'grey'
  | 'pivot'
  | 'grant'
  | 'exitPoll';

type Swatch = { bg: string; fg: string };

const NEUTRAL: Swatch = { bg: '#222222', fg: '#ffffff' };

export const PALETTE: Record<ChipKey, Swatch> = {
  red:      { bg: '#D12B2B', fg: '#ffffff' },
  purple:   { bg: '#8A3FC2', fg: '#ffffff' },
  green:    { bg: '#2E9E56', fg: '#ffffff' },
  blue:     { bg: '#2970BA', fg: '#ffffff' },
  orange:   { bg: '#E68433', fg: '#1a1a1a' },
  yellow:   { bg: '#E6BC33', fg: '#1a1a1a' },
  grey:     { bg: '#808080', fg: '#ffffff' },
  pivot:    NEUTRAL,
  grant:    NEUTRAL,
  exitPoll: { bg: '#B81818', fg: '#ffffff' },
};

export function chipSxFor(key: ChipKey): SxProps<Theme> {
  const { bg, fg } = PALETTE[key];
  return {
    backgroundColor: bg,
    color: fg,
    fontWeight: 500,
  };
}
