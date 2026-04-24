import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { summarizeCoalition } from '../../game/summarize';
import { chipSxFor, type ChipKey } from '../../theme/colors';
import { labelFor, type LabelKey } from '../../game/data/demands';
import { Section } from '../shared/Section';
import type { Card as GameCard } from '../../game/types';

export function CoalitionBase({ base }: { base: GameCard[] }) {
  const rows = summarizeCoalition(base);
  return (
    <Section heading="Your Coalition" dense>
      {rows.length === 0 && (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          (empty)
        </Typography>
      )}
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        {rows.map((r) => (
          <Chip
            key={r.label}
            label={`${labelFor(r.label as LabelKey)} (${r.count})`}
            sx={chipSxFor(r.label as ChipKey)}
          />
        ))}
      </Stack>
    </Section>
  );
}
