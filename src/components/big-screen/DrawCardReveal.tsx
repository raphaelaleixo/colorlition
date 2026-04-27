import { useContext, useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import { Card } from '../shared/Card';
import { RevealControlContext } from './revealControl';
import type { Card as GameCard, PendingDraw } from '../../game/types';

// The medium-card overlay shown on the big screen between draw and place.
// Driven by `pendingDraw` on the shared game state — appears as soon as the
// active player draws, departs after they place. Enforces a minimum on-screen
// time so a fast placement still leaves the card readable.
const ENTER_MS = 320;
const EXIT_MS = 380;
const MIN_VISIBLE_MS = 1500;

type Phase = 'centered' | 'departing';
type RevealState = { card: GameCard; phase: Phase; startedAt: number };

export function DrawCardReveal({
  pendingDraw,
  exitPollRevealing,
  onRevealingChange,
}: {
  pendingDraw: PendingDraw | null;
  // ExitPollReveal owns the centered overlay slot during its own reveal.
  // Hold off on starting our reveal until it has finished.
  exitPollRevealing: boolean;
  onRevealingChange?: (revealing: boolean) => void;
}) {
  const [reveal, setReveal] = useState<RevealState | null>(null);
  const revealControl = useContext(RevealControlContext);
  const isManualReveal = revealControl !== null;

  // Notify parent so segment rows can hold a freshly-arrived card behind a
  // placeholder until our exit animation completes.
  useEffect(() => {
    onRevealingChange?.(reveal !== null);
  }, [reveal, onRevealingChange]);

  // Start the reveal when a pending draw appears (and the exit poll overlay
  // isn't currently occupying the centered slot).
  useEffect(() => {
    if (reveal) return;
    if (!pendingDraw) return;
    if (exitPollRevealing) return;
    setReveal({
      card: pendingDraw.card,
      phase: 'centered',
      startedAt: Date.now(),
    });
  }, [pendingDraw, exitPollRevealing, reveal]);

  // When the player places (pendingDraw clears) while we're still centered,
  // schedule the exit. Honor the minimum visible time floor so a fast place
  // doesn't cut the card off the screen instantly.
  const departingScheduledRef = useRef(false);
  useEffect(() => {
    if (!reveal) return;
    if (reveal.phase !== 'centered') return;
    if (pendingDraw) return; // still on screen, awaiting placement
    if (departingScheduledRef.current) return;
    if (isManualReveal) return; // mock: external advance kicks departing
    departingScheduledRef.current = true;
    const elapsed = Date.now() - reveal.startedAt;
    const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);
    const t = setTimeout(() => {
      setReveal((prev) => (prev ? { ...prev, phase: 'departing' } : null));
    }, remaining);
    return () => clearTimeout(t);
  }, [reveal, pendingDraw, isManualReveal]);

  // Departing → cleared.
  useEffect(() => {
    if (!reveal || reveal.phase !== 'departing') return;
    const t = setTimeout(() => {
      setReveal(null);
      departingScheduledRef.current = false;
    }, EXIT_MS);
    return () => clearTimeout(t);
  }, [reveal]);

  // Manual-advance hook (mock dev panel only): kick centered → departing on
  // tick changes, irrespective of pendingDraw clearing.
  const advanceTick = revealControl?.advanceTick;
  useEffect(() => {
    if (advanceTick === undefined) return;
    setReveal((prev) =>
      prev && prev.phase === 'centered' ? { ...prev, phase: 'departing' } : prev,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advanceTick]);

  if (!reveal) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        zIndex: (t) => t.zIndex.modal,
        pointerEvents: 'none',
        transformOrigin: 'center center',
        '@keyframes drawRevealEnter': {
          '0%': { opacity: 0, transform: 'translate(-50%, -50%) scale(0.5)' },
          '70%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1.06)' },
          '100%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
        },
        '@keyframes drawRevealExit': {
          '0%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
          '100%': { opacity: 0, transform: 'translate(-50%, -50%) scale(0.4)' },
        },
        animation:
          reveal.phase === 'centered'
            ? `drawRevealEnter ${ENTER_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1) both`
            : `drawRevealExit ${EXIT_MS}ms cubic-bezier(0.55, 0, 0.55, 0.2) both`,
        '@media (prefers-reduced-motion: reduce)': {
          animation: 'none',
          transform: 'translate(-50%, -50%)',
          opacity: reveal.phase === 'centered' ? 1 : 0,
        },
      }}
    >
      <Card card={reveal.card} size="medium" showDemand />
    </Box>
  );
}
