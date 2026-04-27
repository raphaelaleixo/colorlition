import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Card } from '../shared/Card';
import { Section } from '../shared/Section';
import { CARDS_PER_SEGMENT } from '../../game/constants';
import type { Segment, Card as GameCard } from '../../game/types';

const CLAIM_ZOOM_MS = 600;
const CLAIM_EXIT_MS = 420;
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
  variant: 'static' | 'animated' | 'exiting';
}) {
  const positioned = variant === 'animated' || variant === 'exiting';
  return (
    <Box
      sx={{
        position: positioned ? 'absolute' : 'relative',
        inset: positioned ? 0 : undefined,
        flex: positioned ? undefined : 1,
        minWidth: 0,
        height: positioned ? undefined : 'calc((100cqw - 24px) * 10 / 21)',
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
        '@keyframes claimZoomOut': {
          '0%': { transform: 'scale(1)', opacity: 1 },
          '40%': { transform: 'scale(1.06)', opacity: 1 },
          '100%': { transform: 'scale(0.6)', opacity: 0 },
        },
        animation:
          variant === 'animated'
            ? `claimZoomIn ${CLAIM_ZOOM_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1) both`
            : variant === 'exiting'
              ? `claimZoomOut ${CLAIM_EXIT_MS}ms cubic-bezier(0.55, 0, 0.55, 0.2) both`
              : 'none',
        '@media (prefers-reduced-motion: reduce)': {
          animation: 'none',
          ...(variant === 'exiting' ? { opacity: 0 } : null),
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

function SegmentRow({
  segment,
  idx,
  nameFor,
  isPageRevealing,
  renderAction,
  bare = false,
}: {
  segment: Segment;
  idx: number;
  nameFor: (playerId: string) => string;
  // True while the page-level draw reveal (centered or departing) is on
  // screen. While true, a freshly-arrived card in this segment is held back
  // as an empty slot; it scales in only after the reveal exits.
  isPageRevealing: boolean;
  // Optional trailing slot rendered after the card row — used by the player
  // view to surface a per-segment Claim/Add-here button.
  renderAction?: (segment: Segment) => ReactNode;
  // When true, skip the per-row Section wrapper. Used by VoterSegments'
  // singleColumn mode so segments share one outer box with hair dividers.
  bare?: boolean;
}) {
  const claimed = segment.claimedBy !== null;
  const prevClaimedByRef = useRef(segment.claimedBy);
  const prevCardsRef = useRef<GameCard[]>(segment.cards);
  const snapshotRef = useRef<GameCard[]>([]);
  const [animating, setAnimating] = useState(false);
  // When the round commits and segments reset, animate the just-vacated
  // "Claimed by …" overlay out instead of letting it pop. Holds the
  // departing player's name for the duration of the exit animation.
  const [exitingClaimedBy, setExitingClaimedBy] = useState<string | null>(null);

  const lastSeenLenRef = useRef(segment.cards.length);
  // Card waiting to be promoted into a scale-in animation. Either populated
  // immediately on arrival (no page reveal active) or queued until the page
  // reveal finishes.
  const [scaleInId, setScaleInId] = useState<string | null>(null);
  const [pendingArrivalId, setPendingArrivalId] = useState<string | null>(null);
  const wasRevealingRef = useRef(isPageRevealing);

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
  // Detect the claimed→unclaimed transition (round reset) and capture the
  // outgoing player so the overlay can animate out before disappearing.
  const justUnclaimed =
    prevClaimedByRef.current !== null &&
    segment.claimedBy === null &&
    exitingClaimedBy === null;
  if (justUnclaimed) {
    setExitingClaimedBy(prevClaimedByRef.current);
  }
  prevClaimedByRef.current = segment.claimedBy;

  // Arrival detection: a new card landed in this segment.
  const prevLen = lastSeenLenRef.current;
  const currentLen = segment.cards.length;
  if (currentLen > prevLen && !claimed) {
    const newCard = segment.cards[currentLen - 1];
    if (isPageRevealing) {
      setPendingArrivalId(newCard.id);
    } else {
      setScaleInId(newCard.id);
    }
  }
  lastSeenLenRef.current = currentLen;

  // Page reveal just finished — promote any queued arrival.
  useEffect(() => {
    if (wasRevealingRef.current && !isPageRevealing && pendingArrivalId) {
      setScaleInId(pendingArrivalId);
      setPendingArrivalId(null);
    }
    wasRevealingRef.current = isPageRevealing;
  }, [isPageRevealing, pendingArrivalId]);

  useEffect(() => {
    if (!scaleInId) return;
    const t = setTimeout(() => setScaleInId(null), SLOT_IN_MS);
    return () => clearTimeout(t);
  }, [scaleInId]);

  useEffect(() => {
    if (!animating) return;
    const t = setTimeout(() => setAnimating(false), CLAIM_ZOOM_MS);
    return () => clearTimeout(t);
  }, [animating]);

  useEffect(() => {
    if (exitingClaimedBy === null) return;
    const t = setTimeout(() => setExitingClaimedBy(null), CLAIM_EXIT_MS);
    return () => clearTimeout(t);
  }, [exitingClaimedBy]);

  const showZoom = claimed && animating;
  const emptySlots = Math.max(0, CARDS_PER_SEGMENT - segment.cards.length);
  const snapshotPad = Math.max(
    0,
    CARDS_PER_SEGMENT - snapshotRef.current.length,
  );

  // While an arrival is queued behind the page reveal, render the new card's
  // slot as empty so the small card doesn't pop in before the reveal exits.
  const hideLastCard = pendingArrivalId !== null;
  const cardsToShow = hideLastCard
    ? segment.cards.slice(0, -1)
    : segment.cards;

  const inner = (
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
              {cardsToShow.map((c) => (
                <Card
                  key={c.id}
                  card={c}
                  fluid
                  sx={
                    c.id === scaleInId
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
        {exitingClaimedBy !== null && !claimed && (
          <ClaimedOverlay
            name={nameFor(exitingClaimedBy)}
            variant="exiting"
          />
        )}
      </Box>
      {renderAction && (
        <Box
          sx={{
            flexShrink: 0,
            alignSelf: 'center',
            width: 84,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          {renderAction(segment)}
        </Box>
      )}
    </Stack>
  );

  if (bare) return inner;
  return (
    <Section dense sx={{ borderColor: 'rule.strong' }}>
      {inner}
    </Section>
  );
}

export function VoterSegments({
  segments,
  nameFor,
  isPageRevealing = false,
  singleColumn = false,
  renderAction,
}: {
  segments: Segment[];
  nameFor: (playerId: string) => string;
  isPageRevealing?: boolean;
  // Player view stacks segments vertically; big screen uses 3 columns.
  singleColumn?: boolean;
  renderAction?: (segment: Segment) => ReactNode;
}) {
  if (singleColumn) {
    return (
      <Box
        sx={{
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'rule.strong',
        }}
      >
        {segments.map((s, idx) => (
          <Box
            key={s.key}
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: '1px solid',
              borderColor: 'rule.hair',
              '&:last-of-type': { borderBottom: 'none' },
            }}
          >
            <SegmentRow
              segment={s}
              idx={idx}
              nameFor={nameFor}
              isPageRevealing={isPageRevealing}
              renderAction={renderAction}
              bare
            />
          </Box>
        ))}
      </Box>
    );
  }
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
        <SegmentRow
          key={s.key}
          segment={s}
          idx={idx}
          nameFor={nameFor}
          isPageRevealing={isPageRevealing}
          renderAction={renderAction}
        />
      ))}
    </Box>
  );
}
