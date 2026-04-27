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
  // Track which card ids are new since the previous render to drive the
  // highlight animation. Reading the ref in useMemo is render-phase, but the
  // alternative (storing in state) would cause an extra re-render every time
  // `visible` changes, which is exactly what this ref pattern was chosen to
  // avoid.
  const newIds = useMemo(() => {
    const fresh = new Set<string>();
    // eslint-disable-next-line react-hooks/refs
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
        flexShrink: 0,
        height: 60,
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

// One row of the campaign leaderboard: waffle + name/status + Allies/Undecided
// chips. Exported so the player's mobile view can render the same shape for
// their own coalition (with `showName={false}`).
export function CampaignRow({
  row,
  showName = true,
}: {
  row: LeaderRow;
  showName?: boolean;
}) {
  const { gameState } = useGame();
  const pivotBg = pivotStripes(
    gameState ? colorsInPlay(gameState) : [],
    'vertical',
  );
  const bd = scorePlayer(row.playerId, row.base);
  const grants = row.base.filter((c) => c.kind === 'grant').length;
  const pivots = row.base.filter((c) => c.kind === 'pivot').length;

  return (
    <Stack
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
      <Waffle cards={orderBlocs(row.base, bd.positiveColors, bd.negativeColors)} />
      <Stack sx={{ flex: 1, minWidth: 0, justifyContent: 'center' }}>
        {showName && (
          <Typography
            variant="body1"
            noWrap
            sx={{ fontWeight: 700, textTransform: 'uppercase' }}
          >
            {row.name}
          </Typography>
        )}
        <Stack
          direction="row"
          spacing={0.75}
          aria-hidden={!(row.isCurrent || row.roundStatus === 'claimed')}
          sx={{
            alignItems: 'center',
            color: row.isCurrent ? '#1F7540' : '#911414',
            visibility:
              row.isCurrent || row.roundStatus === 'claimed' ? 'visible' : 'hidden',
            ...(row.isCurrent && {
              '@keyframes currentPlayerPulse': {
                '0%, 100%': { opacity: 0.55 },
                '50%': { opacity: 1 },
              },
              animation: 'currentPlayerPulse 1.4s ease-in-out infinite',
              '@media (prefers-reduced-motion: reduce)': {
                animation: 'none',
              },
            }),
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
            {row.isCurrent
              ? 'Current player'
              : row.roundStatus === 'claimed'
                ? 'Claimed segments'
                : 'Current player'}
          </Typography>
        </Stack>
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
                <span>Allies</span>
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
                <span>Undecided</span>
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
}

export function Leaderboard({ rows }: { rows: LeaderRow[] }) {
  const { gameState } = useGame();
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
      {rows.map((r) => (
        <CampaignRow key={r.playerId} row={r} />
      ))}
    </Stack>
  );
}
