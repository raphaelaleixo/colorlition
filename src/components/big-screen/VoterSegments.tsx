import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Card } from '../shared/Card';
import { Section } from '../shared/Section';
import { CARDS_PER_SEGMENT } from '../../game/constants';
import type { Segment } from '../../game/types';

function CardSlot() {
  return (
    <Box
      sx={{
        width: 56,
        height: 80,
        borderRadius: 1.25,
        border: '1px dashed',
        borderColor: 'rule.strong',
        flexShrink: 0,
      }}
    />
  );
}

export function VoterSegments({ segments }: { segments: Segment[] }) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-start' }}>
      {segments.map((s, idx) => {
        const emptySlots = Math.max(0, CARDS_PER_SEGMENT - s.cards.length);
        return (
          <Section key={s.key} dense sx={{ width: 'fit-content' }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Typography
                variant="h3"
                sx={{ color: 'text.secondary', minWidth: 28, textAlign: 'center' }}
              >
                {idx + 1}
              </Typography>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                {s.cards.map((c) => (
                  <Card key={c.id} card={c} />
                ))}
                {Array.from({ length: emptySlots }).map((_, i) => (
                  <CardSlot key={`empty-${i}`} />
                ))}
              </Stack>
              {s.claimedBy !== null && (
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', fontStyle: 'italic', pl: 1 }}
                >
                  claimed
                </Typography>
              )}
            </Stack>
          </Section>
        );
      })}
    </Box>
  );
}
