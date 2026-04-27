import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

const STATS: ReadonlyArray<{ value: string; label: string; caption: string }> = [
  { value: '3–5', label: 'Players',     caption: 'One Voter Segment per player.' },
  { value: '88',  label: 'Cards',       caption: '63 Blocs, 10 Allies, 3 Undecideds, 1 Exit Poll.' },
  { value: '7',   label: 'Voter blocs', caption: 'Industrial Belt to Periphery.' },
  { value: '3',   label: 'Coalition',   caption: 'Top three colors score; the rest subtract.' },
];

export function StakesGrid() {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
        columnGap: { xs: 3, sm: 4 },
        rowGap: { xs: 3, sm: 0 },
      }}
    >
      {STATS.map((s) => (
        <Stack key={s.label} spacing={0.5}>
          <Typography
            variant="h1"
            sx={{ fontSize: { xs: 44, sm: 56 }, lineHeight: 1, fontWeight: 700 }}
          >
            {s.value}
          </Typography>
          <Typography variant="overline" sx={{ color: 'text.secondary' }}>
            {s.label}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
            {s.caption}
          </Typography>
        </Stack>
      ))}
    </Box>
  );
}
