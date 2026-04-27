import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography, { type TypographyProps } from '@mui/material/Typography';
import { FONT_SERIF } from '../../theme/typography';
import { PALETTE } from '../../theme/colors';

const LOGO_COLOR_KEYS = [
  'red',
  'purple',
  'green',
  'blue',
  'orange',
  'yellow',
  'grey',
] as const;

interface LogoProps {
  // Drives the wordmark size in inline layout (uses MUI Typography variants).
  variant?: TypographyProps['variant'];
  // 'inline' = "The Colorlition" on one line (headers).
  // 'stacked' = Guardian-style "The" above "Colorlition" (home hero).
  layout?: 'inline' | 'stacked';
  sx?: TypographyProps['sx'];
}

// Italic "Color"-tinted logotype shared by the big screen, player view, and
// home page. The "Color" span hue is picked once per mount from the bloc
// palette so each device gets its own accent on load. Stacked layout uses em
// units so a single fontSize override on the parent scales both lines.
export function Logo({ variant = 'h1', layout = 'inline', sx }: LogoProps) {
  const [logoColor] = useState(
    () =>
      PALETTE[
        LOGO_COLOR_KEYS[Math.floor(Math.random() * LOGO_COLOR_KEYS.length)]
      ],
  );

  if (layout === 'stacked') {
    return (
      <Box sx={{ display: 'inline-block', fontFamily: FONT_SERIF, ...sx }}>
        <Box
          component="span"
          sx={{
            display: 'block',
            fontStyle: 'italic',
            fontWeight: 700,
            // Closer to the wordmark size — kept slightly under so the eye
            // still treats the wordmark as primary.
            fontSize: '0.55em',
            letterSpacing: '0.02em',
            lineHeight: 1,
            // Indent so "The" sits above the "or" between the two l's of
            // Colorlition (between "Col" and "lition"). Tuned visually for
            // italic Playfair 900; iterate by eye if the alignment drifts.
            pl: '1.95em',
            // Slight overlap with the wordmark below for a tighter masthead.
            mb: '-0.08em',
          }}
        >
          The
        </Box>
        <Box
          component="span"
          sx={{
            display: 'block',
            fontStyle: 'italic',
            fontWeight: 900,
            lineHeight: 0.95,
          }}
        >
          <Box component="span" sx={{ color: logoColor }}>
            Color
          </Box>
          lition
        </Box>
      </Box>
    );
  }

  return (
    <Typography
      variant={variant}
      sx={{ fontStyle: 'italic', fontWeight: 900, ...sx }}
    >
      The{' '}
      <Box component="span" sx={{ color: logoColor }}>
        Color
      </Box>
      lition
    </Typography>
  );
}
