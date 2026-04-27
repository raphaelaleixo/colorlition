import { useContext, useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import { Card } from '../shared/Card';
import { RevealControlContext } from './VoterSegments';
import type { ExitPollCard } from '../../game/types';

const REVEAL_HOLD_MS = 1200;
const REVEAL_OUT_MS = 380;

const EXIT_POLL_CARD: ExitPollCard = { id: 'exit-poll-reveal', kind: 'exitPoll' };

type Phase = 'centered' | 'departing' | null;

export function ExitPollReveal({
  exitPollDrawn,
  onRevealingChange,
}: {
  exitPollDrawn: boolean;
  onRevealingChange?: (revealing: boolean) => void;
}) {
  const prevDrawnRef = useRef(exitPollDrawn);
  const [phase, setPhase] = useState<Phase>(null);
  const revealControl = useContext(RevealControlContext);
  const isManualReveal = revealControl !== null;

  // Notify the parent so adjacent reveals (e.g. the segment-card reveal
  // for the second card drawn in this turn) can hold until we're done.
  useEffect(() => {
    onRevealingChange?.(phase !== null);
  }, [phase, onRevealingChange]);

  // Detect false→true transition during render so the overlay paints on the
  // very next commit.
  if (!prevDrawnRef.current && exitPollDrawn && phase === null) {
    setPhase('centered');
  }
  prevDrawnRef.current = exitPollDrawn;

  useEffect(() => {
    if (phase === 'centered') {
      if (isManualReveal) return; // wait for an external advance trigger
      const t = setTimeout(() => setPhase('departing'), REVEAL_HOLD_MS);
      return () => clearTimeout(t);
    }
    if (phase === 'departing') {
      const t = setTimeout(() => setPhase(null), REVEAL_OUT_MS);
      return () => clearTimeout(t);
    }
  }, [phase, isManualReveal]);

  // Manual-advance hook: when advanceTick changes during the centered phase,
  // kick the flow into departing.
  const advanceTick = revealControl?.advanceTick;
  useEffect(() => {
    if (advanceTick === undefined) return;
    if (phase === 'centered') setPhase('departing');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advanceTick]);

  if (phase === null) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        zIndex: (t) => t.zIndex.modal,
        pointerEvents: 'none',
        transformOrigin: 'center center',
        '@keyframes exitPollRevealEnter': {
          '0%': { opacity: 0, transform: 'translate(-50%, -50%) scale(0.5)' },
          '70%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1.06)' },
          '100%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
        },
        '@keyframes exitPollRevealExit': {
          '0%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
          '100%': { opacity: 0, transform: 'translate(-50%, -50%) scale(0.4)' },
        },
        animation:
          phase === 'centered'
            ? 'exitPollRevealEnter 320ms cubic-bezier(0.34, 1.56, 0.64, 1) both'
            : `exitPollRevealExit ${REVEAL_OUT_MS}ms cubic-bezier(0.55, 0, 0.55, 0.2) both`,
        '@media (prefers-reduced-motion: reduce)': {
          animation: 'none',
          transform: 'translate(-50%, -50%)',
          opacity: phase === 'centered' ? 1 : 0,
        },
      }}
    >
      <Card card={EXIT_POLL_CARD} size="medium" showDemand />
    </Box>
  );
}
