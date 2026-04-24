import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { summarizeCoalition } from '../../game/summarize';
import { chipSxFor, type ChipKey } from '../../theme/colors';
import { labelFor, type LabelKey } from '../../game/data/demands';
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
      {rows.map((row) => {
        const summary = summarizeCoalition(row.base);
        return (
          <Stack
            key={row.playerId}
            direction="row"
            spacing={1}
            sx={{ p: 1, border: '1px solid #ccc', alignItems: 'center' }}
          >
            <Typography sx={{ minWidth: 160 }}>{row.name}</Typography>
            {summary.length === 0 && (
              <Typography sx={{ color: 'text.secondary' }}>(empty)</Typography>
            )}
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              {summary.map((s) => (
                <Chip
                  key={s.label}
                  label={`${labelFor(s.label as LabelKey)} (${s.count})`}
                  sx={chipSxFor(s.label as ChipKey)}
                />
              ))}
            </Stack>
          </Stack>
        );
      })}
    </Stack>
  );
}
