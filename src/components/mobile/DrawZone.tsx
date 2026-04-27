import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useGame } from '../../contexts/GameContext';
import { canPlaceInSegment } from '../../game/actions';
import { Card } from '../shared/Card';
import type {
  Card as GameCard,
  ColorlitionGameState,
} from '../../game/types';

const ENTER_MS = 320;
const EXIT_MS = 380;

// Card-shaped slot under the header that holds the active player's Draw
// button. Shares the medium card's 10:7 aspect ratio so the affordance
// reads as "this is where a card will appear" before they tap.
export function DrawZone({
  gameState,
  isMyTurn,
  currentPlayerName,
}: {
  gameState: ColorlitionGameState;
  isMyTurn: boolean;
  currentPlayerName: string;
}) {
  const { drawCard } = useGame();
  const [busy, setBusy] = useState(false);

  const pending = gameState.pendingDraw;
  const canDraw =
    isMyTurn &&
    !pending &&
    gameState.deck.length > 0 &&
    gameState.segments.some(canPlaceInSegment);

  // Local mirror of pendingDraw with phase state so the card can scale-in
  // when it arrives and scale-out when it leaves (placement). The shared
  // `pendingDraw` flips immediately on place, so we hold on to the card
  // here for the duration of the exit animation.
  const [reveal, setReveal] = useState<{
    card: GameCard;
    phase: 'entering' | 'idle' | 'exiting';
  } | null>(null);

  // Render-time detection so the very first commit already shows the
  // entering frame (no flash of un-animated state).
  if (pending && !reveal) {
    setReveal({ card: pending.card, phase: 'entering' });
  } else if (!pending && reveal && reveal.phase !== 'exiting') {
    setReveal({ ...reveal, phase: 'exiting' });
  }

  useEffect(() => {
    if (!reveal) return;
    if (reveal.phase === 'entering') {
      const t = setTimeout(
        () => setReveal((r) => (r ? { ...r, phase: 'idle' } : r)),
        ENTER_MS,
      );
      return () => clearTimeout(t);
    }
    if (reveal.phase === 'exiting') {
      const t = setTimeout(() => setReveal(null), EXIT_MS);
      return () => clearTimeout(t);
    }
  }, [reveal]);

  const handleDraw = async () => {
    setBusy(true);
    try {
      await drawCard();
    } finally {
      setBusy(false);
    }
  };

  const showCard = reveal !== null;

  return (
    <Box
      sx={(theme) => ({
        width: '100%',
        aspectRatio: '10 / 7',
        borderRadius: 1.5,
        outline: showCard ? 'none' : `1px dashed ${theme.palette.rule.strong}`,
        outlineOffset: '-1px',
        backgroundColor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: showCard ? 0 : 2,
        boxSizing: 'border-box',
      })}
    >
      {reveal ? (
        <Box
          sx={{
            width: '100%',
            transformOrigin: 'center center',
            '@keyframes drawZoneEnter': {
              '0%': { opacity: 0, transform: 'scale(0.5)' },
              '70%': { opacity: 1, transform: 'scale(1.06)' },
              '100%': { opacity: 1, transform: 'scale(1)' },
            },
            '@keyframes drawZoneExit': {
              '0%': { opacity: 1, transform: 'scale(1)' },
              '100%': { opacity: 0, transform: 'scale(0.4)' },
            },
            animation:
              reveal.phase === 'exiting'
                ? `drawZoneExit ${EXIT_MS}ms cubic-bezier(0.55, 0, 0.55, 0.2) both`
                : reveal.phase === 'entering'
                  ? `drawZoneEnter ${ENTER_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1) both`
                  : 'none',
            '@media (prefers-reduced-motion: reduce)': {
              animation: 'none',
              opacity: reveal.phase === 'exiting' ? 0 : 1,
            },
          }}
        >
          <Card card={reveal.card} size="medium" showDemand fluid />
        </Box>
      ) : isMyTurn ? (
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={handleDraw}
          disabled={busy || !canDraw}
          sx={{
            minWidth: 84,
            py: 0.75,
            fontWeight: 700,
            letterSpacing: '0.04em',
            '@keyframes buttonFadeIn': {
              from: { opacity: 0, transform: 'translateY(4px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
            animation: 'buttonFadeIn 220ms ease-out both',
            '@media (prefers-reduced-motion: reduce)': {
              animation: 'none',
            },
          }}
        >
          Draw
        </Button>
      ) : (
        <Stack spacing={0.5} sx={{ alignItems: 'center', px: 2 }}>
          <Typography
            variant="overline"
            sx={{
              color: 'text.secondary',
              letterSpacing: '0.14em',
              fontWeight: 700,
              '@keyframes waitingPulse': {
                '0%, 100%': { opacity: 0.55 },
                '50%': { opacity: 1 },
              },
              animation: 'waitingPulse 1.6s ease-in-out infinite',
              '@media (prefers-reduced-motion: reduce)': {
                animation: 'none',
                opacity: 0.85,
              },
            }}
          >
            Waiting for
          </Typography>
          <Typography
            variant="h4"
            sx={{ fontWeight: 900, textAlign: 'center', lineHeight: 1.1 }}
          >
            {currentPlayerName}
          </Typography>
        </Stack>
      )}
    </Box>
  );
}
