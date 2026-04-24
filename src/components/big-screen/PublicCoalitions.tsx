import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { summarizeCoalition } from '../../game/summarize';
import { chipSxFor, type ChipKey } from '../../theme/colors';
import { labelFor, type LabelKey } from '../../game/data/demands';
import { Section } from '../shared/Section';
import type { Card as GameCard } from '../../game/types';

export type CoalitionRow = {
  playerId: string;
  name: string;
  base: GameCard[];
};

export function PublicCoalitions({ rows }: { rows: CoalitionRow[] }) {
  return (
    <Section heading="Coalitions">
      {rows.map((row) => {
        const summary = summarizeCoalition(row.base);
        return (
          <Stack
            key={row.playerId}
            direction="row"
            spacing={2}
            sx={{
              alignItems: 'center',
              py: 1.5,
              borderBottom: '1px solid',
              borderColor: 'rule.hair',
              '&:last-of-type': { borderBottom: 'none' },
            }}
          >
            <Typography variant="h4" sx={{ minWidth: 160 }}>
              {row.name}
            </Typography>
            {summary.length === 0 && (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                (empty)
              </Typography>
            )}
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', flex: 1 }}>
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
    </Section>
  );
}
