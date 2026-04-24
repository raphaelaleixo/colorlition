import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Card } from '../shared/Card';
import type { Card as GameCard } from '../../game/types';

export type CoalitionRow = {
  playerId: string;
  name: string;
  base: GameCard[];
};

export function PublicCoalitions({ rows }: { rows: CoalitionRow[] }) {
  return (
    <Stack spacing={1}>
      <Typography variant="h6">Coalitions</Typography>
      {rows.map((row) => (
        <Stack
          key={row.playerId}
          direction="row"
          spacing={1}
          sx={{ p: 1, border: '1px solid #ccc', alignItems: 'center' }}
        >
          <Typography sx={{ minWidth: 160 }}>{row.name}</Typography>
          {row.base.length === 0 && <Typography sx={{ color: 'text.secondary' }}>(empty)</Typography>}
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            {row.base.map((c) => (
              <Card key={c.id} card={c} />
            ))}
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}
