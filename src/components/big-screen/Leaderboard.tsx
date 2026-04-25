import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { scorePlayer } from '../../game/scoring';
import { Section } from '../shared/Section';
import { PALETTE, chipSxFor } from '../../theme/colors';
import type { Card, Color } from '../../game/types';

export type LeaderRow = {
  playerId: string;
  name: string;
  base: Card[];
};

function orderBlocs(base: Card[], positive: Color[], negative: Color[]): Card[] {
  const out: Card[] = [];
  for (const color of [...positive, ...negative]) {
    for (const card of base) {
      if (card.kind === 'bloc' && card.color === color) out.push(card);
    }
  }
  return out;
}

const WAFFLE_SLOTS = 30;

function Waffle({ cards }: { cards: Card[] }) {
  const empty = Math.max(0, WAFFLE_SLOTS - cards.length);
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(10, 10px)',
        gridAutoRows: '10px',
        gap: '2px',
      }}
    >
      {cards.slice(0, WAFFLE_SLOTS).map((card, i) => (
        <Box
          key={`${card.id}-${i}`}
          sx={{
            width: 10,
            height: 10,
            backgroundColor: card.kind === 'bloc' ? PALETTE[card.color] : 'rule.hair',
          }}
        />
      ))}
      {Array.from({ length: empty }).map((_, i) => (
        <Box
          key={`empty-${i}`}
          sx={{ width: 10, height: 10, backgroundColor: 'rule.hair' }}
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
    <Section heading="Current Campaign" dense>
      {scored.map((r, idx) => {
        const grants = r.base.filter((c) => c.kind === 'grant').length;
        const pivots = r.base.filter((c) => c.kind === 'pivot').length;
        return (
          <Stack
            key={r.playerId}
            direction="row"
            spacing={2}
            sx={{
              py: 1,
              alignItems: 'center',
              borderBottom: '1px solid',
              borderColor: 'rule.hair',
              '&:last-of-type': { borderBottom: 'none' },
            }}
          >
            <Stack sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body1" noWrap>
                {idx + 1}. {r.name}
              </Typography>
              <Typography variant="h4" sx={{ fontFeatureSettings: "'tnum' 1" }}>
                {r.total}
              </Typography>
            </Stack>
            <Waffle cards={orderBlocs(r.base, r.positiveColors, r.negativeColors)} />
            <Stack spacing={0.5} sx={{ minWidth: 90 }}>
              {grants > 0 && (
                <Chip size="small" label={`Grants × ${grants}`} sx={chipSxFor('grant')} />
              )}
              {pivots > 0 && (
                <Chip size="small" label={`Pivots × ${pivots}`} sx={chipSxFor('pivot')} />
              )}
            </Stack>
          </Stack>
        );
      })}
    </Section>
  );
}
