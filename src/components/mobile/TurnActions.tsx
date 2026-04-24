import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useGame } from '../../contexts/GameContext';
import { canPlaceInSegment, canClaimSegment } from '../../game/actions';
import { Card } from '../shared/Card';
import type { ColorlitionGameState, Card as GameCard, SegmentKey } from '../../game/types';

type PendingDraw = { card: GameCard; exitPollTriggered: boolean };

export function TurnActions({ gameState }: { gameState: ColorlitionGameState }) {
  const { drawAndPlace, claim } = useGame();
  const [pending, setPending] = useState<PendingDraw | null>(null);
  const [busy, setBusy] = useState(false);

  const canDraw = gameState.deck.length > 0 && gameState.segments.some(canPlaceInSegment);

  const handleDraw = async () => {
    // Simulate client-side draw to preview the card; don't write yet.
    // We "peek" by copying the first card; the real write happens in handlePlace.
    const first = gameState.deck[0];
    if (!first) return;
    if (first.kind === 'exitPoll') {
      const second = gameState.deck[1];
      if (!second) {
        // Exit Poll is last card — no placement. Fire drawAndPlace with any key; actions.ts skips placement.
        setBusy(true);
        try {
          // Pass the first available segment key — drawAndPlace will short-circuit.
          await drawAndPlace(gameState.segments[0].key);
        } finally {
          setBusy(false);
        }
        return;
      }
      setPending({ card: second, exitPollTriggered: true });
    } else {
      setPending({ card: first, exitPollTriggered: false });
    }
  };

  const handlePlace = async (segmentKey: SegmentKey) => {
    setBusy(true);
    try {
      await drawAndPlace(segmentKey);
      setPending(null);
    } finally {
      setBusy(false);
    }
  };

  const handleClaim = async (segmentKey: SegmentKey) => {
    setBusy(true);
    try {
      await claim(segmentKey);
    } finally {
      setBusy(false);
    }
  };

  if (pending) {
    return (
      <Stack spacing={1} sx={{ p: 2, border: '1px solid #333' }}>
        {pending.exitPollTriggered && (
          <Typography color="warning.main">Exit Poll triggered — FINAL ROUND</Typography>
        )}
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography>You drew:</Typography>
          <Card card={pending.card} />
        </Stack>
        <Typography>Place in which segment?</Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          {gameState.segments.map((s) => (
            <Button
              key={s.key}
              variant="contained"
              disabled={busy || !canPlaceInSegment(s)}
              onClick={() => handlePlace(s.key)}
            >
              {s.label}
            </Button>
          ))}
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack spacing={1} sx={{ p: 2, border: '1px solid #333' }}>
      <Button variant="contained" onClick={handleDraw} disabled={busy || !canDraw}>
        Draw
      </Button>
      <Typography>— or claim a segment:</Typography>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        {gameState.segments.map((s) => (
          <Button
            key={s.key}
            variant="outlined"
            disabled={busy || !canClaimSegment(s)}
            onClick={() => handleClaim(s.key)}
          >
            Claim {s.label}
          </Button>
        ))}
      </Stack>
    </Stack>
  );
}
