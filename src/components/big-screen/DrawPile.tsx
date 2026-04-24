import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export function DrawPile({ remaining }: { remaining: number }) {
  return (
    <Stack
      direction="row"
      sx={{ alignItems: 'baseline', gap: 1.5, py: 1 }}
    >
      <Typography
        variant="h2"
        sx={{ fontFeatureSettings: "'tnum' 1", minWidth: 60 }}
      >
        {remaining}
      </Typography>
      <Typography variant="overline" sx={{ color: 'text.secondary' }}>
        cards remaining
      </Typography>
    </Stack>
  );
}
