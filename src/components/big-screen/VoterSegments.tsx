import { createContext, useContext, useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Card } from '../shared/Card';
import { Section } from '../shared/Section';
import { CARDS_PER_SEGMENT } from '../../game/constants';
import type { Segment, Card as GameCard } from '../../game/types';

// Dev/mock helper. When provided, the reveal pauses in the `centered` phase
// indefinitely and only advances when `advanceTick` changes (e.g. a button
// click). Production callers leave this null and the timer-based flow runs.
export type RevealControl = { advanceTick: number };
export const RevealControlContext = createContext<RevealControl | null>(null);

const CLAIM_ZOOM_MS = 600;
const REVEAL_HOLD_MS = 1200;
const REVEAL_OUT_MS = 380;
const SLOT_IN_MS = 380;

function CardSlot() {
  return (
    <Box
      sx={(theme) => ({
        flex: 1,
        minWidth: 0,
        aspectRatio: '7 / 10',
        borderRadius: 1.25,
        // Use outline instead of border so the dashed indicator never
        // participates in layout — switching slot↔card causes no nudge.
        outline: `1px dashed ${theme.palette.rule.strong}`,
        outlineOffset: '-1px',
        backgroundColor: 'background.default',
      })}
    />
  );
}

function ClaimedOverlay({
  name,
  variant,
}: {
  name: string;
  variant: 'static' | 'animated';
}) {
  const animated = variant === 'animated';
  return (
    <Box
      sx={{
        position: animated ? 'absolute' : 'relative',
        inset: animated ? 0 : undefined,
        flex: animated ? undefined : 1,
        minWidth: 0,
        height: animated ? undefined : 'calc((100cqw - 24px) * 10 / 21)',
        borderRadius: 1.25,
        border: '1px dashed',
        borderColor: 'rule.strong',
        backgroundColor: 'rule.hair',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transformOrigin: 'center center',
        '@keyframes claimZoomIn': {
          '0%': { transform: 'scale(0.2)', opacity: 0 },
          '60%': { transform: 'scale(1.04)', opacity: 1 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        animation: animated
          ? `claimZoomIn ${CLAIM_ZOOM_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1) both`
          : 'none',
        '@media (prefers-reduced-motion: reduce)': {
          animation: 'none',
        },
      }}
    >
      <Typography
        sx={{
          color: 'text.secondary',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          textAlign: 'center',
          px: 1,
          lineHeight: 1.1,
          fontSize: 'clamp(0.75rem, 4cqw, 1.5rem)',
        }}
      >
        Claimed by
        <Box component="br" />
        <Box
          component="span"
          sx={{
            fontSize: 'clamp(1rem, 7cqw, 2.5rem)',
            color: 'text.primary',
          }}
        >
          {name}
        </Box>
      </Typography>
    </Box>
  );
}

function CardRevealOverlay({
  card,
  phase,
}: {
  card: GameCard;
  phase: 'centered' | 'departing';
}) {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        zIndex: (t) => t.zIndex.modal,
        pointerEvents: 'none',
        transformOrigin: 'center center',
        '@keyframes cardRevealEnter': {
          '0%': { opacity: 0, transform: 'translate(-50%, -50%) scale(0.5)' },
          '70%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1.06)' },
          '100%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
        },
        '@keyframes cardRevealExit': {
          '0%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
          '100%': { opacity: 0, transform: 'translate(-50%, -50%) scale(0.4)' },
        },
        animation:
          phase === 'centered'
            ? 'cardRevealEnter 320ms cubic-bezier(0.34, 1.56, 0.64, 1) both'
            : `cardRevealExit ${REVEAL_OUT_MS}ms cubic-bezier(0.55, 0, 0.55, 0.2) both`,
        '@media (prefers-reduced-motion: reduce)': {
          animation: 'none',
          transform: 'translate(-50%, -50%)',
          opacity: phase === 'centered' ? 1 : 0,
        },
      }}
    >
      <Card card={card} size="medium" showDemand />
    </Box>
  );
}

function SegmentRow({
  segment,
  idx,
  nameFor,
}: {
  segment: Segment;
  idx: number;
  nameFor: (playerId: string) => string;
}) {
  const claimed = segment.claimedBy !== null;
  const prevClaimedByRef = useRef(segment.claimedBy);
  const prevCardsRef = useRef<GameCard[]>(segment.cards);
  const snapshotRef = useRef<GameCard[]>([]);
  const [animating, setAnimating] = useState(false);

  // Reveal flow: when a new card lands in this segment, hold it at the
  // viewport center in medium variant (`centered`), then scale it out
  // (`departing`); only after it's off screen does the slot's small card
  // scale in (`arriving`).
  const lastSeenLenRef = useRef(segment.cards.length);
  const [revealCard, setRevealCard] = useState<GameCard | null>(null);
  const [revealPhase, setRevealPhase] = useState<
    'centered' | 'departing' | 'arriving' | null
  >(null);
  const revealControl = useContext(RevealControlContext);
  const isManualReveal = revealControl !== null;

  // Keep latest pre-claim cards available for the snapshot.
  if (!claimed) prevCardsRef.current = segment.cards;

  // Detect the unclaimed→claimed transition during render so the very first
  // committed paint already includes the animated overlay (no static flash).
  const justClaimed =
    prevClaimedByRef.current === null && segment.claimedBy !== null;
  if (justClaimed && !animating) {
    snapshotRef.current = prevCardsRef.current;
    setAnimating(true);
  }
  prevClaimedByRef.current = segment.claimedBy;

  // Detect a card being added during render so the new card is hidden from
  // the slot on the very first commit (no flash before the reveal kicks in).
  const prevSeenLen = lastSeenLenRef.current;
  const currentLen = segment.cards.length;
  if (currentLen > prevSeenLen && !claimed) {
    setRevealCard(segment.cards[currentLen - 1]);
    setRevealPhase('centered');
  }
  lastSeenLenRef.current = currentLen;

  useEffect(() => {
    if (!animating) return;
    const t = setTimeout(() => setAnimating(false), CLAIM_ZOOM_MS);
    return () => clearTimeout(t);
  }, [animating]);

  useEffect(() => {
    if (revealCard === null) return;
    if (revealPhase === 'centered') {
      if (isManualReveal) return; // wait for an external advance trigger
      const t = setTimeout(() => setRevealPhase('departing'), REVEAL_HOLD_MS);
      return () => clearTimeout(t);
    }
    if (revealPhase === 'departing') {
      const t = setTimeout(() => setRevealPhase('arriving'), REVEAL_OUT_MS);
      return () => clearTimeout(t);
    }
    if (revealPhase === 'arriving') {
      const t = setTimeout(() => {
        setRevealCard(null);
        setRevealPhase(null);
      }, SLOT_IN_MS);
      return () => clearTimeout(t);
    }
  }, [revealCard, revealPhase, isManualReveal]);

  // Manual-advance hook: when the external advanceTick changes during the
  // `centered` phase, kick the flow into `departing`.
  const advanceTick = revealControl?.advanceTick;
  useEffect(() => {
    if (advanceTick === undefined) return;
    if (revealPhase === 'centered') setRevealPhase('departing');
    // intentionally ignore revealPhase in deps so this fires only on tick
    // changes, not on every phase change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advanceTick]);

  const showZoom = claimed && animating;
  const emptySlots = Math.max(0, CARDS_PER_SEGMENT - segment.cards.length);
  const snapshotPad = Math.max(
    0,
    CARDS_PER_SEGMENT - snapshotRef.current.length,
  );

  // While the reveal is centered or departing, the new card hasn't "arrived"
  // in the slot yet — show an empty slot in its place. The slot card mounts
  // (and scales in) only on phase 'arriving', after the overlay has exited.
  const hideLastCard =
    revealCard !== null &&
    (revealPhase === 'centered' || revealPhase === 'departing');
  const cardsToShow = hideLastCard
    ? segment.cards.slice(0, -1)
    : segment.cards;
  const slotInIdx =
    revealCard !== null && revealPhase === 'arriving'
      ? segment.cards.length - 1
      : -1;

  return (
    <Section dense sx={{ borderColor: 'rule.strong' }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Typography
          sx={{
            fontFamily: '"Source Sans 3", system-ui, sans-serif',
            fontSize: 23,
            fontWeight: 700,
            color: 'text.secondary',
            minWidth: 26,
            textAlign: 'center',
            flexShrink: 0,
            lineHeight: 1,
          }}
        >
          {idx + 1}
        </Typography>
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            position: 'relative',
            containerType: 'inline-size',
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            {showZoom ? (
              <>
                {snapshotRef.current.map((c) => (
                  <Card key={c.id} card={c} fluid />
                ))}
                {Array.from({ length: snapshotPad }).map((_, i) => (
                  <CardSlot key={`pad-${i}`} />
                ))}
              </>
            ) : claimed ? (
              <ClaimedOverlay
                name={nameFor(segment.claimedBy!)}
                variant="static"
              />
            ) : (
              <>
                {cardsToShow.map((c, i) => (
                  <Card
                    key={c.id}
                    card={c}
                    fluid
                    sx={
                      i === slotInIdx
                        ? {
                            transformOrigin: 'center center',
                            '@keyframes slotScaleIn': {
                              '0%': { opacity: 0, transform: 'scale(0)' },
                              '60%': {
                                opacity: 1,
                                transform: 'scale(1.12)',
                              },
                              '100%': {
                                opacity: 1,
                                transform: 'scale(1)',
                              },
                            },
                            animation: `slotScaleIn ${SLOT_IN_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1) both`,
                            '@media (prefers-reduced-motion: reduce)': {
                              animation: 'none',
                            },
                          }
                        : undefined
                    }
                  />
                ))}
                {hideLastCard && <CardSlot key="reveal-placeholder" />}
                {Array.from({ length: emptySlots }).map((_, i) => (
                  <CardSlot key={`empty-${i}`} />
                ))}
              </>
            )}
          </Stack>
          {showZoom && (
            <ClaimedOverlay
              name={nameFor(segment.claimedBy!)}
              variant="animated"
            />
          )}
        </Box>
      </Stack>
      {revealCard !== null &&
        (revealPhase === 'centered' || revealPhase === 'departing') && (
          <CardRevealOverlay card={revealCard} phase={revealPhase} />
        )}
    </Section>
  );
}

export function VoterSegments({
  segments,
  nameFor,
}: {
  segments: Segment[];
  nameFor: (playerId: string) => string;
}) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: 2,
        alignItems: 'flex-start',
      }}
    >
      {segments.map((s, idx) => (
        <SegmentRow key={s.key} segment={s} idx={idx} nameFor={nameFor} />
      ))}
    </Box>
  );
}
