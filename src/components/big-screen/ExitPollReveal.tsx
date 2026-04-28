import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { Card } from '../shared/Card';
import type { ExitPollCard } from '../../game/types';

const REVEAL_OUT_MS = 380;

const EXIT_POLL_CARD: ExitPollCard = { id: 'exit-poll-reveal', kind: 'exitPoll' };

type Phase = 'centered' | 'departing' | null;

// Stays centered until the active player taps Continue on their mobile,
// flipping `exitPollAcknowledged` true. Then plays the depart animation
// and clears. No auto-depart timer — the moment is meant to hold.
export function ExitPollReveal({
  exitPollDrawn,
  exitPollAcknowledged,
  onRevealingChange,
}: {
  exitPollDrawn: boolean;
  exitPollAcknowledged: boolean;
  onRevealingChange?: (revealing: boolean) => void;
}) {
  const [phase, setPhase] = useState<Phase>(
    exitPollDrawn && !exitPollAcknowledged ? 'centered' : null,
  );

  // Render-phase transitions: enter when the trigger flips, depart when ack
  // flips. setState during render is intentional — it lets the overlay paint
  // on the very next commit (a useEffect would cause a one-frame flash before
  // the centered animation kicks in, and trips lints in the other direction).
  if (exitPollDrawn && !exitPollAcknowledged && phase === null) {
    setPhase('centered');
  } else if (exitPollAcknowledged && phase === 'centered') {
    setPhase('departing');
  }

  // Notify the parent so adjacent reveals (e.g. the deferred follow-up card
  // reveal) can hold until our depart animation completes.
  useEffect(() => {
    onRevealingChange?.(phase !== null);
  }, [phase, onRevealingChange]);

  useEffect(() => {
    if (phase !== 'departing') return;
    const t = setTimeout(() => setPhase(null), REVEAL_OUT_MS);
    return () => clearTimeout(t);
  }, [phase]);

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
