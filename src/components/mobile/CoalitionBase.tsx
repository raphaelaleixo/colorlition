import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Card } from '../shared/Card';
import type { Card as GameCard } from '../../game/types';

export function CoalitionBase({ base }: { base: GameCard[] }) {
  return (
    <Stack spacing={1}>
      <Typography variant="h6">Your Coalition</Typography>
      {base.length === 0 && <Typography sx={{ color: 'text.secondary' }}>(empty)</Typography>}
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        {base.map((c) => (
          <Card key={c.id} card={c} />
        ))}
      </Stack>
    </Stack>
  );
}
