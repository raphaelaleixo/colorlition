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
        flex: 1,
        minWidth: 0,
        aspectRatio: '7 / 10',
        borderRadius: 1.25,
        border: '1px dashed',
        borderColor: 'rule.strong',
      }}
    />
  );
}

export function VoterSegments({
  segments,
  nameFor,
}: {
  segments: Segment[];
  nameFor: (playerId: string) => string;
}) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: 2,
        alignItems: 'flex-start',
      }}
    >
      {segments.map((s, idx) => {
        const claimed = s.claimedBy !== null;
        const emptySlots = Math.max(0, CARDS_PER_SEGMENT - s.cards.length);
        return (
          <Section key={s.key} dense>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Typography
                variant="h3"
                sx={{
                  color: 'text.secondary',
                  minWidth: 28,
                  textAlign: 'center',
                  flexShrink: 0,
                }}
              >
                {idx + 1}
              </Typography>
              <Stack
                direction="row"
                spacing={1.5}
                sx={{
                  alignItems: 'center',
                  flex: 1,
                  position: 'relative',
                  containerType: 'inline-size',
                }}
              >
                {claimed ? (
                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      height: 'calc((100cqw - 24px) * 10 / 21)',
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
                        sx={{
                          color: 'text.secondary',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.12em',
                          textAlign: 'center',
                          px: 1,
                          lineHeight: 1.1,
                          fontSize: 'clamp(0.75rem, 4cqw, 1.5rem)',
                        }}
                      >
                        Claimed by
                        <Box component="br" />
                        <Box
                          component="span"
                          sx={{
                            fontSize: 'clamp(1rem, 7cqw, 2.5rem)',
                            color: 'text.primary',
                          }}
                        >
                          {nameFor(s.claimedBy!)}
                        </Box>
                      </Typography>
                  </Box>
                ) : (
                  <>
                    {s.cards.map((c) => (
                      <Card key={c.id} card={c} fluid />
                    ))}
                    {Array.from({ length: emptySlots }).map((_, i) => (
                      <CardSlot key={`empty-${i}`} />
                    ))}
                  </>
                )}
              </Stack>
            </Stack>
          </Section>
        );
      })}
    </Box>
  );
}
