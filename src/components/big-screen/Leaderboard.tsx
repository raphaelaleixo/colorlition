import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { projectedMandate } from '../../game/scoring';
import type { Card } from '../../game/types';

export type LeaderRow = {
  playerId: string;
  name: string;
  base: Card[];
};

export function Leaderboard({ rows }: { rows: LeaderRow[] }) {
  const scored = rows
    .map((r) => ({ ...r, total: projectedMandate(r.base) }))
    .sort((a, b) => b.total - a.total);
  return (
    <Stack spacing={1}>
      <Typography variant="h6">Projected Mandate</Typography>
      {scored.map((r, idx) => (
        <Stack
          key={r.playerId}
          direction="row"
          sx={{ p: 1, border: '1px solid #ccc', justifyContent: 'space-between' }}
        >
          <Typography>
            {idx + 1}. {r.name}
          </Typography>
          <Typography>{r.total}</Typography>
        </Stack>
      ))}
    </Stack>
  );
}
