import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { summarizeCoalition } from '../../game/summarize';
import { chipSxFor, type ChipKey } from '../../theme/colors';
import type { Card as GameCard } from '../../game/types';

export function CoalitionBase({ base }: { base: GameCard[] }) {
  const rows = summarizeCoalition(base);
  return (
    <Stack spacing={1}>
      <Typography variant="h6">Your Coalition</Typography>
      {rows.length === 0 && <Typography sx={{ color: 'text.secondary' }}>(empty)</Typography>}
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        {rows.map((r) => (
          <Chip
            key={r.label}
            label={`${r.label} (${r.count})`}
            sx={chipSxFor(r.label as ChipKey)}
          />
        ))}
      </Stack>
    </Stack>
  );
}
