import { useEffect, useMemo, useRef } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { scorePlayer } from '../../game/scoring';
import { colorsInPlay } from '../../game/summarize';
import { useGame } from '../../contexts/GameContext';
import { PALETTE, chipSxFor, pivotStripes } from '../../theme/colors';
import type { Card, Color, PlayerRoundStatus } from '../../game/types';

export type LeaderRow = {
  playerId: string;
  name: string;
  base: Card[];
  roundStatus: PlayerRoundStatus;
  isCurrent: boolean;
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
const BUBBLE_BASE_MS = 780;
const BUBBLE_STAGGER_MS = 90;

function Waffle({ cards }: { cards: Card[] }) {
  const visible = cards.slice(0, WAFFLE_SLOTS);
  const empty = Math.max(0, WAFFLE_SLOTS - visible.length);

  const seenIds = useRef<Set<string>>(new Set(visible.map((c) => c.id)));
  const newIds = useMemo(() => {
    const fresh = new Set<string>();
    for (const c of visible) if (!seenIds.current.has(c.id)) fresh.add(c.id);
    return fresh;
  }, [visible]);
  useEffect(() => {
    seenIds.current = new Set(visible.map((c) => c.id));
  });

  let bubbleIdx = 0;
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(10, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        gap: '2px',
        height: '100%',
        aspectRatio: '10 / 3',
        '@keyframes waffleBubbleUp': {
          '0%': {
            transform: 'translateY(140%) scale(0) rotate(-12deg)',
            opacity: 0,
          },
          '45%': {
            transform: 'translateY(-32%) scale(1.4) rotate(6deg)',
            opacity: 1,
          },
          '70%': {
            transform: 'translateY(12%) scale(0.88) rotate(-3deg)',
            opacity: 1,
          },
          '88%': {
            transform: 'translateY(-4%) scale(1.05) rotate(1deg)',
            opacity: 1,
          },
          '100%': {
            transform: 'translateY(0) scale(1) rotate(0)',
            opacity: 1,
          },
        },
      }}
    >
      {visible.map((card, i) => {
        const isNew = newIds.has(card.id);
        const delay = isNew ? bubbleIdx++ * BUBBLE_STAGGER_MS : 0;
        return (
          <Box
            key={`${card.id}-${i}`}
            sx={{
              backgroundColor: card.kind === 'bloc' ? PALETTE[card.color] : 'rule.hair',
              transformOrigin: 'center bottom',
              animation: isNew
                ? `waffleBubbleUp ${BUBBLE_BASE_MS}ms cubic-bezier(0.22, 0.61, 0.36, 1) ${delay}ms both`
                : 'none',
              '@media (prefers-reduced-motion: reduce)': {
                animation: 'none',
              },
            }}
          />
        );
      })}
      {Array.from({ length: empty }).map((_, i) => (
        <Box key={`empty-${i}`} sx={{ backgroundColor: 'rule.hair' }} />
      ))}
    </Box>
  );
}

export function Leaderboard({ rows }: { rows: LeaderRow[] }) {
  const { gameState } = useGame();
  const pivotBg = pivotStripes(gameState ? colorsInPlay(gameState) : [], 'vertical');
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
    <Stack spacing={2}>
      <Stack spacing={1}>
        <Stack
          direction="row"
          sx={{ alignItems: 'baseline', justifyContent: 'space-between' }}
        >
          <Typography variant="h4" sx={{ fontWeight: 900 }}>Current Campaign</Typography>
          <Typography
            variant="overline"
            sx={{
              color: 'text.secondary',
              letterSpacing: '0.14em',
              fontSize: 18,
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            Round {gameState?.roundNumber ?? 1}
          </Typography>
        </Stack>
        <Box sx={{ borderBottom: '1px solid', borderColor: 'rule.hair' }} />
      </Stack>
      {scored.map((r) => {
        const grants = r.base.filter((c) => c.kind === 'grant').length;
        const pivots = r.base.filter((c) => c.kind === 'pivot').length;
        return (
          <Stack
            key={r.playerId}
            direction="row"
            spacing={2}
            sx={{
              py: 1,
              minHeight: 68,
              alignItems: 'stretch',
              borderBottom: '1px solid',
              borderColor: 'rule.hair',
              '&:last-of-type': { borderBottom: 'none' },
            }}
          >
            <Waffle cards={orderBlocs(r.base, r.positiveColors, r.negativeColors)} />
            <Stack sx={{ flex: 1, minWidth: 0, justifyContent: 'center' }}>
              <Typography
                variant="body1"
                noWrap
                sx={{ fontWeight: 700, textTransform: 'uppercase' }}
              >
                {r.name}
              </Typography>
              {(r.isCurrent || r.roundStatus === 'claimed') && (
                <Stack
                  direction="row"
                  spacing={0.75}
                  sx={{
                    alignItems: 'center',
                    color: r.isCurrent ? '#1F7540' : '#911414',
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: 'currentColor',
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    variant="caption"
                    noWrap
                    sx={{ color: 'inherit', fontWeight: 600 }}
                  >
                    {r.isCurrent ? 'Current player' : 'Claimed segments'}
                  </Typography>
                </Stack>
              )}
            </Stack>
            <Stack spacing={0.5} sx={{ minWidth: 90, justifyContent: 'center' }}>
              {grants > 0 && (
                <Chip
                  size="small"
                  label={
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                      }}
                    >
                      <span>Grants</span>
                      <span>× {grants}</span>
                    </Box>
                  }
                  sx={{
                    ...chipSxFor('grant'),
                    '& .MuiChip-label': { fontWeight: 700, width: '100%' },
                  }}
                />
              )}
              {pivots > 0 && (
                <Chip
                  size="small"
                  label={
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                      }}
                    >
                      <span>Pivots</span>
                      <span>× {pivots}</span>
                    </Box>
                  }
                  sx={{
                    ...chipSxFor('pivot'),
                    background: pivotBg,
                    '& .MuiChip-label': { fontWeight: 700, width: '100%' },
                  }}
                />
              )}
            </Stack>
          </Stack>
        );
      })}
    </Stack>
  );
}
