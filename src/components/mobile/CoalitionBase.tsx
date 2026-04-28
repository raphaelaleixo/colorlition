import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { summarizeCoalition } from '../../game/summarize';
import { chipSxFor, type ChipKey } from '../../theme/colors';
import { useLabelFor, useT } from '../../i18n';
import { Section } from '../shared/Section';
import type { Card as GameCard, LabelKey } from '../../game/types';

export function CoalitionBase({ base }: { base: GameCard[] }) {
  const rows = summarizeCoalition(base);
  const labelFor = useLabelFor();
  const t = useT();
  return (
    <Section heading={t('coalition.heading')} dense>
      {rows.length === 0 && (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t('coalition.empty')}
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
