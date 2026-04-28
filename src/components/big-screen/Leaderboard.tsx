import { useEffect, useMemo, useRef } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useGame } from '../../contexts/GameContext';
import { scorePlayer } from '../../game/scoring';
import { useT } from '../../i18n';
import { PALETTE, chipSxFor, pivotStripes } from '../../theme/colors';
import type { Card, Color, PlayerRoundStatus } from '../../game/types';

export type LeaderRow = {
  playerId: string;
  name: string;
  base: Card[];
  roundStatus: PlayerRoundStatus;
  isCurrent: boolean;
};

// Group bloc cards by color, ordered by raw bloc count desc (alpha tiebreak).
// Pivots are NOT folded in here — the waffle only shows bloc cards, so the
// visible ordering should reflect the visible quantities. (scorePlayer's
// positive/negative arrays bake in pivot assignments and would order
// differently from what's actually painted.)
function orderBlocs(base: Card[]): Card[] {
  const counts = new Map<Color, number>();
  for (const card of base) {
    if (card.kind === 'bloc') {
      counts.set(card.color, (counts.get(card.color) ?? 0) + 1);
    }
  }
  const colors = [...counts.keys()].sort(
    (a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0) || a.localeCompare(b),
  );
  const out: Card[] = [];
  for (const color of colors) {
    for (const card of base) {
      if (card.kind === 'bloc' && card.color === color) out.push(card);
    }
  }
  return out;
}

const WAFFLE_COLS = 10;
const WAFFLE_ROWS = 3;
const WAFFLE_SLOTS = WAFFLE_COLS * WAFFLE_ROWS;
const BUBBLE_BASE_MS = 780;
const BUBBLE_STAGGER_MS = 90;
// How long an existing cell takes to glide to its new slot when colors
// re-rank (e.g. a fresh card pushes one color past another). Slightly slower
// than the bubble's settle so the slide reads as "thoughtful" not snap.
const REORDER_MS = 480;
const CELL_W_PCT = 100 / WAFFLE_COLS;
const CELL_H_PCT = 100 / WAFFLE_ROWS;

// Cells are absolutely positioned and keyed by card.id, so when `cards`
// re-orders (color groups re-rank by quantity) each cell's transform
// changes and CSS transitions slide it to its new slot. A static backdrop
// of WAFFLE_SLOTS rule.hair tiles fills any unclaimed slot; real cards
// overlay matching slots. 1px padding on every tile lets the parent's
// (paper) background show through, producing the original 2px seam.
function Waffle({ cards }: { cards: Card[] }) {
  const visible = cards.slice(0, WAFFLE_SLOTS);

  const seenIds = useRef<Set<string>>(new Set(visible.map((c) => c.id)));
  // Track which card ids are new since the previous render to drive the
  // bubble-up animation. Reading the ref in useMemo is render-phase, but
  // the alternative (storing in state) would cause an extra re-render every
  // time `visible` changes, which is exactly what this ref pattern avoids.
  const newIds = useMemo(() => {
    const fresh = new Set<string>();
    // eslint-disable-next-line react-hooks/refs
    for (const c of visible) if (!seenIds.current.has(c.id)) fresh.add(c.id);
    return fresh;
  }, [visible]);
  useEffect(() => {
    seenIds.current = new Set(visible.map((c) => c.id));
  });

  const tileSx = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: `${CELL_W_PCT}%`,
    height: `${CELL_H_PCT}%`,
    padding: '1px',
    boxSizing: 'border-box' as const,
  };

  let bubbleIdx = 0;
  return (
    <Box
      sx={{
        position: 'relative',
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
      {Array.from({ length: WAFFLE_SLOTS }).map((_, i) => {
        const col = i % WAFFLE_COLS;
        const row = Math.floor(i / WAFFLE_COLS);
        return (
          <Box
            key={`empty-${i}`}
            sx={{
              ...tileSx,
              transform: `translate(${col * 100}%, ${row * 100}%)`,
              pointerEvents: 'none',
            }}
          >
            <Box
              sx={{
                width: '100%',
                height: '100%',
                backgroundColor: 'rule.hair',
              }}
            />
          </Box>
        );
      })}
      {visible.map((card, i) => {
        const col = i % WAFFLE_COLS;
        const row = Math.floor(i / WAFFLE_COLS);
        const isNew = newIds.has(card.id);
        const delay = isNew ? bubbleIdx++ * BUBBLE_STAGGER_MS : 0;
        return (
          <Box
            key={card.id}
            sx={{
              ...tileSx,
              transform: `translate(${col * 100}%, ${row * 100}%)`,
              transition: `transform ${REORDER_MS}ms cubic-bezier(0.22, 0.61, 0.36, 1)`,
              '@media (prefers-reduced-motion: reduce)': {
                transition: 'none',
              },
            }}
          >
            <Box
              sx={{
                width: '100%',
                height: '100%',
                backgroundColor:
                  card.kind === 'bloc' ? PALETTE[card.color] : 'rule.hair',
                transformOrigin: 'center bottom',
                animation: isNew
                  ? `waffleBubbleUp ${BUBBLE_BASE_MS}ms cubic-bezier(0.22, 0.61, 0.36, 1) ${delay}ms both`
                  : 'none',
                '@media (prefers-reduced-motion: reduce)': {
                  animation: 'none',
                },
              }}
            />
          </Box>
        );
      })}
    </Box>
  );
}

// One row of the campaign leaderboard: waffle + name/status + Allies/Undecided
// chips. Exported so the player's mobile view can render the same shape for
// their own coalition (with `showName={false}`).
export function CampaignRow({
  row,
  showName = true,
  showStatus = true,
}: {
  row: LeaderRow;
  showName?: boolean;
  showStatus?: boolean;
}) {
  const t = useT();
  const grants = row.base.filter((c) => c.kind === 'grant').length;
  const pivots = row.base.filter((c) => c.kind === 'pivot').length;
  // Stripes show this player's pivot assignments — one stripe per Undecided,
  // colored where it's currently helping. Computed only when there are pivots
  // to display (the chip itself is gated on pivots > 0).
  const pivotBg =
    pivots > 0
      ? pivotStripes(scorePlayer(row.playerId, row.base).pivotAssignments, 'vertical')
      : PALETTE.pivot;

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
      <Waffle cards={orderBlocs(row.base)} />
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
        {showStatus && (
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
                ? t('leaderboard.currentPlayer')
                : row.roundStatus === 'claimed'
                  ? t('leaderboard.claimedSegments')
                  : t('leaderboard.currentPlayer')}
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
                <span>{t('leaderboard.allies')}</span>
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
                <span>{t('leaderboard.undecided')}</span>
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
  const t = useT();
  return (
    <Stack spacing={2}>
      <Stack spacing={1}>
        <Stack
          direction="row"
          sx={{ alignItems: 'baseline', justifyContent: 'space-between' }}
        >
          <Typography variant="h4" sx={{ fontWeight: 900 }}>{t('leaderboard.heading')}</Typography>
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
            {t('leaderboard.round', { round: gameState?.roundNumber ?? 1 })}
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
