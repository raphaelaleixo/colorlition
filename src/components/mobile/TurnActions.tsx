import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useGame } from '../../contexts/GameContext';
import { canPlaceInSegment, canClaimSegment } from '../../game/actions';
import { DEMANDS } from '../../game/data/demands';
import { Card } from '../shared/Card';
import { Section } from '../shared/Section';
import type { ColorlitionGameState, Card as GameCard, SegmentKey } from '../../game/types';

type PendingDraw = { card: GameCard; exitPollTriggered: boolean };

function RuledDivider({ label }: { label: string }) {
  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
      <Box sx={{ flex: 1, borderTop: '1px solid', borderColor: 'rule.hair' }} />
      <Typography variant="overline" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Box sx={{ flex: 1, borderTop: '1px solid', borderColor: 'rule.hair' }} />
    </Stack>
  );
}

export function TurnActions({ gameState }: { gameState: ColorlitionGameState }) {
  const { drawAndPlace, claim } = useGame();
  const [pending, setPending] = useState<PendingDraw | null>(null);
  const [busy, setBusy] = useState(false);

  const canDraw = gameState.deck.length > 0 && gameState.segments.some(canPlaceInSegment);

  const handleDraw = async () => {
    const first = gameState.deck[0];
    if (!first) return;
    if (first.kind === 'exitPoll') {
      const second = gameState.deck[1];
      if (!second) {
        setBusy(true);
        try {
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
      <Section dense>
        <Stack spacing={2}>
          {pending.exitPollTriggered && (
            <Typography variant="body1" sx={{ color: 'error.main', fontWeight: 700 }}>
              Exit Poll triggered — FINAL ROUND
            </Typography>
          )}
          <Typography variant="overline" sx={{ color: 'text.secondary' }}>
            You drew
          </Typography>
          <Box sx={{ alignSelf: 'flex-start' }}>
            <Card card={pending.card} />
          </Box>
          {pending.card.kind === 'bloc' && (
            <Typography
              variant="body1"
              sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic' }}
            >
              We want: "{DEMANDS[pending.card.color]?.[pending.card.value]}"
            </Typography>
          )}
          <RuledDivider label="place in" />
          <Stack spacing={1}>
            {gameState.segments.map((s) => (
              <Button
                key={s.key}
                variant="contained"
                color="primary"
                disabled={busy || !canPlaceInSegment(s)}
                onClick={() => handlePlace(s.key)}
                sx={{ py: 1.5 }}
              >
                {s.label}
              </Button>
            ))}
          </Stack>
        </Stack>
      </Section>
    );
  }

  return (
    <Section dense>
      <Stack spacing={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleDraw}
          disabled={busy || !canDraw}
          sx={{ py: 1.75 }}
        >
          Draw
        </Button>
        <RuledDivider label="or claim" />
        <Stack spacing={1}>
          {gameState.segments.map((s) => (
            <Button
              key={s.key}
              variant="contained"
              color="claim"
              disabled={busy || !canClaimSegment(s)}
              onClick={() => handleClaim(s.key)}
              sx={{ py: 1.5 }}
            >
              Claim {s.label}
            </Button>
          ))}
        </Stack>
      </Stack>
    </Section>
  );
}
