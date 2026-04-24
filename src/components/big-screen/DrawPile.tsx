import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export function DrawPile({ remaining }: { remaining: number }) {
  return (
    <Stack sx={{ p: 1, border: '1px solid #ccc', display: 'inline-flex' }}>
      <Typography>Draw Pile: {remaining} cards</Typography>
    </Stack>
  );
}
