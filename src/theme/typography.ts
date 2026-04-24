// Type scale from spec §1. Headlines are Playfair Display (serif),
// body/UI is Source Sans 3 (sans). Mobile scaling handled in
// src/theme/components.ts via MuiTypography breakpoint overrides.

import type { TypographyVariantsOptions } from '@mui/material/styles';

const SERIF = '"Playfair Display", Georgia, serif';
const SANS = '"Source Sans 3", system-ui, sans-serif';

export const typography: TypographyVariantsOptions = {
  fontFamily: SANS,
  h1: { fontFamily: SERIF, fontWeight: 700, fontSize: 48, lineHeight: 1.15 },
  h2: { fontFamily: SERIF, fontWeight: 700, fontSize: 36, lineHeight: 1.15 },
  h3: { fontFamily: SERIF, fontWeight: 700, fontSize: 28, lineHeight: 1.2 },
  h4: { fontFamily: SERIF, fontWeight: 600, fontSize: 22, lineHeight: 1.25 },
  h5: { fontFamily: SERIF, fontWeight: 600, fontSize: 18, lineHeight: 1.3 },
  h6: {
    fontFamily: SANS,
    fontWeight: 600,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    lineHeight: 1.4,
  },
  body1: { fontFamily: SANS, fontWeight: 400, fontSize: 16, lineHeight: 1.5 },
  body2: { fontFamily: SANS, fontWeight: 400, fontSize: 14, lineHeight: 1.5 },
  caption: {
    fontFamily: SANS,
    fontStyle: 'italic',
    fontSize: 13,
    lineHeight: 1.3,
  },
  overline: {
    fontFamily: SANS,
    fontWeight: 600,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    lineHeight: 1.4,
  },
  button: {
    fontFamily: SANS,
    fontWeight: 600,
    textTransform: 'none',
    letterSpacing: '0.02em',
  },
};

// Export the font stacks so other files (e.g. components.ts) can reference them.
export const FONT_SERIF = SERIF;
export const FONT_SANS = SANS;
