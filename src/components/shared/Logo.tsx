import Box from '@mui/material/Box';
import Typography, { type TypographyProps } from '@mui/material/Typography';
import { FONT_SERIF } from '../../theme/typography';

interface LogoProps {
  variant?: TypographyProps['variant'];
  layout?: 'inline' | 'stacked';
  sx?: TypographyProps['sx'];
}

export function Logo({ variant = 'h1', layout = 'inline', sx }: LogoProps) {
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
          Color•lition
        </Box>
      </Box>
    );
  }

  return (
    <Typography variant={variant} sx={{ fontWeight: 900, ...sx }}>
      The Color•lition
    </Typography>
  );
}
