import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography, { type TypographyProps } from '@mui/material/Typography';
import { FONT_SERIF } from '../../theme/typography';
import { PALETTE } from '../../theme/colors';

const DOT_COLOR_KEYS = [
  'red',
  'purple',
  'green',
  'blue',
  'orange',
  'yellow',
  'grey',
] as const;

interface LogoProps {
  variant?: TypographyProps['variant'];
  layout?: 'inline' | 'stacked';
  sx?: TypographyProps['sx'];
}

// "Color•lition" with the • picked once per mount from the bloc palette so
// each device gets its own accent on load.
export function Logo({ variant = 'h1', layout = 'inline', sx }: LogoProps) {
  const [dotColor] = useState(
    () => PALETTE[DOT_COLOR_KEYS[Math.floor(Math.random() * DOT_COLOR_KEYS.length)]],
  );

  const wordmark = (
    <>
      Color
      <Box component="span" sx={{ color: dotColor }}>
        •
      </Box>
      lition
    </>
  );

  if (layout === 'stacked') {
    return (
      <Box sx={{ display: 'inline-block', fontFamily: FONT_SERIF, ...sx }}>
        <Box
          component="span"
          sx={{
            display: 'block',
            fontWeight: '900',
            fontSize: '0.95em',
            lineHeight: '1',
            paddingLeft: '1.55em',
            marginBottom: '-0.35em',
          }}
        >
          The
        </Box>
        <Box
          component="span"
          sx={{
            display: 'block',
            fontWeight: 900,
            lineHeight: 0.95,
          }}
        >
          {wordmark}
        </Box>
      </Box>
    );
  }

  return (
    <Typography variant={variant} sx={{ fontWeight: 900, ...sx }}>
      The {wordmark}
    </Typography>
  );
}
