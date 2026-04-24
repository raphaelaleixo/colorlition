import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { projectedMandate } from '../../game/scoring';
import { Section } from '../shared/Section';
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
    <Section heading="Projected Mandate" dense>
      {scored.map((r, idx) => (
        <Stack
          key={r.playerId}
          direction="row"
          sx={{
            justifyContent: 'space-between',
            alignItems: 'baseline',
            py: 1,
            borderBottom: '1px solid',
            borderColor: 'rule.hair',
            '&:last-of-type': { borderBottom: 'none' },
          }}
        >
          <Typography variant="body1">
            {idx + 1}. {r.name}
          </Typography>
          <Typography
            variant="h4"
            sx={{ fontFeatureSettings: "'tnum' 1" }}
          >
            {r.total}
          </Typography>
        </Stack>
      ))}
    </Section>
  );
}
