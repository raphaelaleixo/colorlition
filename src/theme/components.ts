// MUI component overrides for the v3 theme. References palette tokens by
// string path ('primary.main', 'rule.hair', etc.) — resolved by MUI at
// runtime so no circular theme import.

import type { Components, Theme } from '@mui/material/styles';
import { FONT_SANS } from './typography';

export const components: Components<Omit<Theme, 'components'>> = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        backgroundColor: '#FAF8F3',
        color: '#1A1613',
        fontFamily: FONT_SANS,
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      },
      table: { fontFeatureSettings: "'tnum' 1" },
    },
  },

  MuiTypography: {
    styleOverrides: {
      root: ({ theme }) => ({
        [theme.breakpoints.down('sm')]: {
          // Single-override mobile down-scale per spec §1.
          '&.MuiTypography-h1': { fontSize: 32 },
          '&.MuiTypography-h2': { fontSize: 26 },
          '&.MuiTypography-h3': { fontSize: 22 },
          '&.MuiTypography-h4': { fontSize: 18 },
          '&.MuiTypography-h5': { fontSize: 16 },
          '&.MuiTypography-h6': { fontSize: 12 },
          '&.MuiTypography-body1': { fontSize: 14 },
          '&.MuiTypography-body2': { fontSize: 12 },
          '&.MuiTypography-caption': { fontSize: 11 },
          '&.MuiTypography-overline': { fontSize: 10 },
        },
      }),
    },
  },

  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 2,
        boxShadow: 'none',
        fontFamily: FONT_SANS,
        fontWeight: 600,
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      },
    },
  },

  MuiButton: {
    defaultProps: { disableElevation: true, disableRipple: false },
    styleOverrides: {
      root: {
        borderRadius: 1,
        fontFamily: FONT_SANS,
        fontWeight: 600,
        textTransform: 'none',
        letterSpacing: '0.02em',
      },
    },
    variants: [
      {
        props: { color: 'claim' },
        style: ({ theme }) => ({
          backgroundColor: theme.palette.claim.main,
          color: theme.palette.claim.contrastText,
          '&:hover': { backgroundColor: theme.palette.claim.main, opacity: 0.88 },
        }),
      },
    ],
  },

  MuiTextField: {
    defaultProps: { variant: 'outlined', size: 'small' },
    styleOverrides: {
      root: ({ theme }) => ({
        '& .MuiOutlinedInput-root': {
          borderRadius: 0,
          '& fieldset': { borderColor: theme.palette.rule.strong },
        },
      }),
    },
  },

  MuiTableCell: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderBottom: `1px solid ${theme.palette.rule.hair}`,
      }),
      head: ({ theme }) => ({
        ...theme.typography.overline,
        color: theme.palette.text.secondary,
      }),
    },
  },
};
