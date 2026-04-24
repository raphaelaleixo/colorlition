import type { SxProps, Theme } from '@mui/material/styles';

// Saturated journalism palette tuned for WCAG AA with white text (contrast
// ≥ 4.5:1 against #ffffff). Every bloc hue sits at L≈0.13–0.18 — saturation
// stays high so each color remains identifiable, but lightness is pulled
// down enough that white labels are legible. Yellow reads as deep mustard,
// orange as rust; that's the cost of AA compliance. Pivot and Grant share
// one "neutral" ink swatch. Exit Poll is a deeper alert-crimson distinct
// from bloc red.

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
  red:      { bg: '#A82929', fg: '#ffffff' },
  purple:   { bg: '#7333B8', fg: '#ffffff' },
  green:    { bg: '#1F7540', fg: '#ffffff' },
  blue:     { bg: '#235A9E', fg: '#ffffff' },
  orange:   { bg: '#A45A22', fg: '#ffffff' },
  yellow:   { bg: '#8A6C14', fg: '#ffffff' },
  grey:     { bg: '#5A5A5A', fg: '#ffffff' },
  pivot:    NEUTRAL,
  grant:    NEUTRAL,
  exitPoll: { bg: '#911414', fg: '#ffffff' },
};

export function chipSxFor(key: ChipKey): SxProps<Theme> {
  const { bg, fg } = PALETTE[key];
  return {
    backgroundColor: bg,
    color: fg,
    fontWeight: 500,
  };
}
