import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useGame } from '../../contexts/GameContext';
import { canPlaceInSegment, canClaimSegment } from '../../game/actions';
import { Card } from '../shared/Card';
import { Section } from '../shared/Section';
import { useGameDict, useT } from '../../i18n';
import type { ColorlitionGameState, SegmentKey } from '../../game/types';

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
  const { placePendingDraw, claim } = useGame();
  const dict = useGameDict();
  const t = useT();
  const [busy, setBusy] = useState(false);

  const pending = gameState.pendingDraw;

  const handlePlace = async (segmentKey: SegmentKey) => {
    setBusy(true);
    try {
      await placePendingDraw(segmentKey);
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
              {t('turn.exitPollTriggered')}
            </Typography>
          )}
          <Typography variant="overline" sx={{ color: 'text.secondary' }}>
            {t('turn.youDrew')}
          </Typography>
          <Box sx={{ alignSelf: 'flex-start' }}>
            <Card card={pending.card} size="medium" showDemand />
          </Box>
          <RuledDivider label={t('turn.placeIn')} />
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
                {dict.segmentLabels[s.key]}
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
        <RuledDivider label={t('turn.orClaim')} />
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
              {t('turn.claimSegment', { segment: dict.segmentLabels[s.key] })}
            </Button>
          ))}
        </Stack>
      </Stack>
    </Section>
  );
}
