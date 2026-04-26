import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Card } from '../shared/Card';
import { Section } from '../shared/Section';
import { CARDS_PER_SEGMENT } from '../../game/constants';
import type { Segment, Card as GameCard } from '../../game/types';

const CLAIM_ZOOM_MS = 600;

function CardSlot() {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        aspectRatio: '7 / 10',
        borderRadius: 1.25,
        border: '1px dashed',
        borderColor: 'rule.strong',
        backgroundColor: 'background.default',
      }}
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

  useEffect(() => {
    if (!animating) return;
    const t = setTimeout(() => setAnimating(false), CLAIM_ZOOM_MS);
    return () => clearTimeout(t);
  }, [animating]);

  const showZoom = claimed && animating;
  const emptySlots = Math.max(0, CARDS_PER_SEGMENT - segment.cards.length);
  const snapshotPad = Math.max(
    0,
    CARDS_PER_SEGMENT - snapshotRef.current.length,
  );

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
                {segment.cards.map((c) => (
                  <Card key={c.id} card={c} fluid />
                ))}
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
