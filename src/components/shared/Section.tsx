import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';

type Props = {
  heading?: string;
  children: ReactNode;
  dense?: boolean;
  sx?: SxProps<Theme>;
};

// Shared panel used across big-screen and mobile. Renders an optional
// serif heading with a rule.hair underline, then the children inside a
// paper-white surface with airy (or dense) padding.
export function Section({ heading, children, dense = false, sx }: Props) {
  return (
    <Stack
      spacing={2}
      sx={[
        {
          p: dense ? 2 : 3,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'rule.hair',
        },
        ...(Array.isArray(sx) ? sx : [sx]).filter(Boolean),
      ]}
    >
      {heading && (
        <Stack spacing={1}>
          <Typography variant="h4">{heading}</Typography>
          <Box sx={{ borderBottom: '1px solid', borderColor: 'rule.hair' }} />
        </Stack>
      )}
      {children}
    </Stack>
  );
}
