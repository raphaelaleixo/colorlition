import type { SxProps, Theme } from '@mui/material/styles';
import type { IconType } from 'react-icons';
import {
  PiHandFist,
  PiTree,
  PiUsersFour,
  PiMoneyWavy,
  PiTractor,
  PiShieldCheckered,
  PiChurch,
} from 'react-icons/pi';
import type { Color } from '../game/types';

// Saturated journalism palette tuned for WCAG AA with white text (contrast
// ≥ 4.5:1 against #ffffff). Every bloc hue sits at L≈0.13–0.18 — saturation
// stays high so each color remains identifiable, but lightness is pulled
// down enough that white labels are legible. Yellow reads as deep mustard,
// orange as rust; that's the cost of AA compliance. Pivot and Grant share
// one neutral ink swatch. Exit Poll is a deeper alert-crimson distinct
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

const NEUTRAL = '#222222';

export const PALETTE: Record<ChipKey, string> = {
  red:      '#A82929',
  purple:   '#7333B8',
  green:    '#1F7540',
  blue:     '#235A9E',
  orange:   '#A45A22',
  yellow:   '#8A6C14',
  grey:     '#5A5A5A',
  pivot:    NEUTRAL,
  grant:    NEUTRAL,
  exitPoll: '#911414',
};

export function chipSxFor(key: ChipKey): SxProps<Theme> {
  return {
    backgroundColor: PALETTE[key],
    color: '#ffffff',
    fontWeight: 500,
  };
}

// Striped rainbow built from the in-play bloc colors, used as the pivot card
// / chip background. Hard color stops (no blend). 'horizontal' stripes run
// across (180deg gradient), 'vertical' stripes run up-down (90deg gradient).
export function pivotStripes(
  colors: Color[],
  orientation: 'horizontal' | 'vertical' = 'horizontal',
): string {
  if (colors.length === 0) return PALETTE.pivot;
  if (colors.length === 1) return PALETTE[colors[0]];
  const step = 100 / colors.length;
  const stops = colors
    .map((c, i) => `${PALETTE[c]} ${i * step}%, ${PALETTE[c]} ${(i + 1) * step}%`)
    .join(', ');
  const angle = orientation === 'vertical' ? '90deg' : '180deg';
  return `linear-gradient(${angle}, ${stops})`;
}

export const COLOR_ICONS: Record<Color, IconType> = {
  red: PiHandFist,
  green: PiTree,
  purple: PiUsersFour,
  blue: PiMoneyWavy,
  orange: PiTractor,
  yellow: PiShieldCheckered,
  grey: PiChurch,
};
