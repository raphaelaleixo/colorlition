import type { SxProps, Theme } from '@mui/material/styles';

// Muted, print-journalism-inspired palette. All hues share a similar
// saturation range (~35-55%) and lightness (~45-60%) so they sit together
// without clashing. Pivot is ink-black, Grant is paper-cream, Exit Poll is
// an urgent crimson — each visually distinct from the seven bloc colors.

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

export const PALETTE: Record<ChipKey, Swatch> = {
  red:      { bg: '#BF4040', fg: '#ffffff' },
  purple:   { bg: '#7359A3', fg: '#ffffff' },
  green:    { bg: '#4A9464', fg: '#ffffff' },
  blue:     { bg: '#407AA6', fg: '#ffffff' },
  orange:   { bg: '#D99640', fg: '#1a1a1a' },
  yellow:   { bg: '#D9B859', fg: '#1a1a1a' },
  grey:     { bg: '#8C8C8C', fg: '#ffffff' },
  pivot:    { bg: '#262626', fg: '#ffffff' },
  grant:    { bg: '#F2EFE6', fg: '#1a1a1a' },
  exitPoll: { bg: '#B01F1F', fg: '#ffffff' },
};

export function chipSxFor(key: ChipKey): SxProps<Theme> {
  const { bg, fg } = PALETTE[key];
  return {
    backgroundColor: bg,
    color: fg,
    border: key === 'grant' ? '1px solid #d9d4c5' : 'none',
    fontWeight: 500,
  };
}
