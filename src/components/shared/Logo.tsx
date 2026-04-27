import { useState, useEffect } from 'react';
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

const CYCLE_INTERVAL_MS = 2200;
const TRANSITION_MS = 900;

interface LogoProps {
  variant?: TypographyProps['variant'];
  layout?: 'inline' | 'stacked';
  sx?: TypographyProps['sx'];
}

// "Color•lition" — the • cycles through the seven bloc palette colors with
// a smooth CSS transition between steps. Starts from a random index so two
// devices on the same screen aren't in sync.
export function Logo({ variant = 'h1', layout = 'inline', sx }: LogoProps) {
  const [colorIdx, setColorIdx] = useState(() =>
    Math.floor(Math.random() * DOT_COLOR_KEYS.length),
  );

  useEffect(() => {
    const id = setInterval(() => {
      setColorIdx((i) => (i + 1) % DOT_COLOR_KEYS.length);
    }, CYCLE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const dotColor = PALETTE[DOT_COLOR_KEYS[colorIdx]];

  const wordmark = (
    <>
      Color
      <Box
        component="span"
        sx={{
          color: dotColor,
          transition: `color ${TRANSITION_MS}ms ease-in-out`,
        }}
      >
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
