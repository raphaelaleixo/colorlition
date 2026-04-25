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

const CARD_W = 56;
const CARD_H = 80;
const CARD_GAP = 12;
const CLAIMED_BOX_W = CARD_W * CARDS_PER_SEGMENT + CARD_GAP * (CARDS_PER_SEGMENT - 1);

export function VoterSegments({
  segments,
  nameFor,
}: {
  segments: Segment[];
  nameFor: (playerId: string) => string;
}) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-start' }}>
      {segments.map((s, idx) => {
        const claimed = s.claimedBy !== null;
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
              {claimed ? (
                <Box
                  sx={{
                    width: CLAIMED_BOX_W,
                    height: CARD_H,
                    borderRadius: 1.25,
                    border: '1px dashed',
                    borderColor: 'rule.strong',
                    backgroundColor: 'rule.hair',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      textAlign: 'center',
                      px: 1,
                      lineHeight: 1.1,
                    }}
                  >
                    Claimed by
                    <Box component="br" />
                    <Box component="span" sx={{ fontSize: '1.15rem', color: 'text.primary' }}>
                      {nameFor(s.claimedBy!)}
                    </Box>
                  </Typography>
                </Box>
              ) : (
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  {s.cards.map((c) => (
                    <Card key={c.id} card={c} />
                  ))}
                  {Array.from({ length: emptySlots }).map((_, i) => (
                    <CardSlot key={`empty-${i}`} />
                  ))}
                </Stack>
              )}
            </Stack>
          </Section>
        );
      })}
    </Box>
  );
}
