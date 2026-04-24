// Paper-cream + ink palette for the Modern Data Journalism aesthetic.
// Built on MUI's built-in palette keys where they fit; adds `claim` and
// `rule` as custom keys (typed via src/theme/augment.d.ts).

import type { PaletteOptions } from '@mui/material/styles';

export const palette: PaletteOptions = {
  mode: 'light',
  primary: {
    main: '#1A1613',       // ink — Draw, Create Game, Start Game buttons
    dark: '#3B302A',       // hover
    contrastText: '#FAF8F3',
  },
  error: {
    main: '#8B1A1A',       // FINAL ROUND accent, error messages
  },
  background: {
    default: '#FAF8F3',    // page / paper cream
    paper: '#FFFFFF',      // panel / inner surface
  },
  text: {
    primary: '#1A1613',    // ink
    secondary: '#6B625A',  // muted warm grey
    disabled: '#B2A89C',
  },
  claim: {
    main: '#8B1A1A',
    contrastText: '#FFFFFF',
  },
  rule: {
    hair: '#E6DFD2',
    strong: '#C2B8A8',
    ink: '#1A1613',
  },
};
