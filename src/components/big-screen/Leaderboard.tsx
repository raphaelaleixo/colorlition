import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { scorePlayer } from '../../game/scoring';
import { Section } from '../shared/Section';
import { PALETTE } from '../../theme/colors';
import type { Card, Color } from '../../game/types';

export type LeaderRow = {
  playerId: string;
  name: string;
  base: Card[];
};

function orderWaffle(base: Card[], positive: Color[], negative: Color[]): Card[] {
  const out: Card[] = [];
  for (const color of [...positive, ...negative]) {
    for (const card of base) {
      if (card.kind === 'bloc' && card.color === color) out.push(card);
    }
  }
  for (const card of base) if (card.kind === 'pivot') out.push(card);
  for (const card of base) if (card.kind === 'grant') out.push(card);
  return out;
}

function fillFor(card: Card): string {
  if (card.kind === 'bloc') return PALETTE[card.color];
  if (card.kind === 'pivot') return '#1A1613';
  if (card.kind === 'grant') return '#6B625A';
  return '#6B625A';
}

function Waffle({ cards }: { cards: Card[] }) {
  if (cards.length === 0) return null;
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '2px', pt: 0.75 }}>
      {cards.map((card, i) => (
        <Box
          key={`${card.id}-${i}`}
          sx={{ width: 10, height: 10, backgroundColor: fillFor(card) }}
        />
      ))}
    </Box>
  );
}

export function Leaderboard({ rows }: { rows: LeaderRow[] }) {
  const scored = rows
    .map((r) => {
      const bd = scorePlayer(r.playerId, r.base);
      return {
        ...r,
        total: bd.total,
        positiveColors: bd.positiveColors,
        negativeColors: bd.negativeColors,
      };
    })
    .sort((a, b) => b.total - a.total);
  return (
    <Section heading="Projected Mandate" dense>
      {scored.map((r, idx) => (
        <Stack
          key={r.playerId}
          spacing={0.5}
          sx={{
            py: 1,
            borderBottom: '1px solid',
            borderColor: 'rule.hair',
            '&:last-of-type': { borderBottom: 'none' },
          }}
        >
          <Stack
            direction="row"
            sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}
          >
            <Typography variant="body1">
              {idx + 1}. {r.name}
            </Typography>
            <Typography variant="h4" sx={{ fontFeatureSettings: "'tnum' 1" }}>
              {r.total}
            </Typography>
          </Stack>
          <Waffle cards={orderWaffle(r.base, r.positiveColors, r.negativeColors)} />
        </Stack>
      ))}
    </Section>
  );
}
