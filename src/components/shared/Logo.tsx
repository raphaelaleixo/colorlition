import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography, { type TypographyProps } from '@mui/material/Typography';
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

// Italic "color"-tinted logotype shared by the big screen and the player
// view. The "color" span hue is picked once per mount from the bloc palette
// so each device gets its own accent on load.
export function Logo({ variant = 'h1', sx }: { variant?: TypographyProps['variant']; sx?: TypographyProps['sx'] }) {
  const [logoColor] = useState(
    () =>
      PALETTE[
        LOGO_COLOR_KEYS[Math.floor(Math.random() * LOGO_COLOR_KEYS.length)]
      ],
  );
  return (
    <Typography
      variant={variant}
      sx={{ fontStyle: 'italic', fontWeight: 900, ...sx }}
    >
      <Box component="span" sx={{ color: logoColor }}>
        color
      </Box>
      lition
    </Typography>
  );
}
