import Box from '@mui/material/Box';
import type { ComponentProps } from 'react';
import { PALETTE } from '../../theme/colors';

const STRIP_COLORS = ['red', 'purple', 'green', 'blue', 'orange', 'yellow', 'grey'] as const;

interface SpectrumProps {
  height?: number;
  sx?: ComponentProps<typeof Box>['sx'];
}

export function Spectrum({ height = 6, sx }: SpectrumProps) {
  const stops = STRIP_COLORS.map((k, i) => {
    const start = (i / STRIP_COLORS.length) * 100;
    const end = ((i + 1) / STRIP_COLORS.length) * 100;
    return `${PALETTE[k]} ${start}%, ${PALETTE[k]} ${end}%`;
  }).join(', ');

  return (
    <Box
      role="presentation"
      sx={{
        height,
        background: `linear-gradient(90deg, ${stops})`,
        ...sx,
      }}
    />
  );
}
