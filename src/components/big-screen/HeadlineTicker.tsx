import { useEffect, useRef, useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import type { Headline } from '../../game/types';

// Rotating phrasings for "X is next to act" — rotates per turn so the ticker
// feels alive rather than repeating the same phrase.
const NEXT_VARIATIONS: Array<(name: string) => string> = [
  (n) => `${n} is next to act`,
  (n) => `Next on the floor: ${n}`,
  (n) => `Newsroom awaits ${n}`,
  (n) => `${n} on the clock`,
  (n) => `All eyes on ${n}`,
  (n) => `${n} steps to the rostrum`,
  (n) => `The chamber turns to ${n}`,
  (n) => `Cameras roll for ${n}`,
  (n) => `Press corps leans in as ${n} deliberates`,
  (n) => `${n} holds the floor`,
  (n) => `The wire awaits ${n}`,
  (n) => `${n} considers the next move`,
  (n) => `${n} takes the podium`,
  (n) => `Reporters crowd around ${n}`,
  (n) => `${n} weighs their options`,
];

function variationIndex(name: string, turnIndex: number): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash + name.charCodeAt(i)) % 997;
  return (hash + turnIndex) % NEXT_VARIATIONS.length;
}

function pickNextPhrase(name: string, turnIndex: number): string {
  const fn = NEXT_VARIATIONS[variationIndex(name, turnIndex)];
  return fn(name);
}

// Scroll speed in px/sec.
const SCROLL_SPEED = 100;
// Number of copies of the initial phrase used to seed the track on mount.
// Enough to fill a ~2x 1920px viewport at typical phrase widths.
const SEED_COPIES = 6;

type TickerItem = { id: number; text: string };

type Props = {
  lastHeadline: Headline | null;
  currentPlayerName: string;
  currentPlayerIndex: number;
};

export function HeadlineTicker({
  lastHeadline,
  currentPlayerName,
  currentPlayerIndex,
}: Props) {
  const [items, setItems] = useState<TickerItem[]>([]);
  const seqRef = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const hoverRef = useRef(false);
  const lastFedPhraseKey = useRef<string | null>(null);
  const lastFedHeadlineId = useRef<string | null>(null);

  // Seed the track on mount so the first render isn't empty.
  useEffect(() => {
    const phrase = pickNextPhrase(currentPlayerName, currentPlayerIndex);
    const seeds: TickerItem[] = [];
    for (let i = 0; i < SEED_COPIES; i++) {
      seeds.push({ id: seqRef.current++, text: phrase });
    }
    setItems(seeds);
    lastFedPhraseKey.current = `${currentPlayerName}:${currentPlayerIndex}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Append a new item whenever the current-player phrase changes, or a new
  // headline arrives. Never remove existing items — they just keep scrolling
  // out on the left.
  useEffect(() => {
    const phrase = pickNextPhrase(currentPlayerName, currentPlayerIndex);
    const phraseKey = `${currentPlayerName}:${currentPlayerIndex}`;

    const additions: TickerItem[] = [];
    if (lastFedPhraseKey.current !== null && lastFedPhraseKey.current !== phraseKey) {
      additions.push({ id: seqRef.current++, text: phrase });
      lastFedPhraseKey.current = phraseKey;
    }
    if (lastHeadline && lastFedHeadlineId.current !== lastHeadline.id) {
      additions.push({ id: seqRef.current++, text: lastHeadline.text });
      lastFedHeadlineId.current = lastHeadline.id;
    }
    if (additions.length > 0) {
      setItems((prev) => [...prev, ...additions]);
    }
  }, [lastHeadline, currentPlayerName, currentPlayerIndex]);

  // rAF scroll loop — translates the track left at a constant pixel rate.
  // Runs once on mount; the growing `items` array doesn't restart the loop.
  useEffect(() => {
    let raf = 0;
    let prev = performance.now();
    const tick = (now: number) => {
      const dt = now - prev;
      prev = now;
      if (!hoverRef.current) {
        offsetRef.current -= (SCROLL_SPEED * dt) / 1000;
      }
      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(${offsetRef.current}px)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Stack
      direction="row"
      sx={{
        flex: 'none',
        bgcolor: 'text.primary',
        alignItems: 'stretch',
        height: 80,
      }}
    >
      <Box
        sx={{
          px: 3,
          display: 'flex',
          alignItems: 'center',
          bgcolor: 'error.main',
        }}
      >
        <Typography
          sx={{
            color: 'common.white',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            fontWeight: 700,
            fontSize: 18,
          }}
        >
          Headlines
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
        }}
        onMouseEnter={() => {
          hoverRef.current = true;
        }}
        onMouseLeave={() => {
          hoverRef.current = false;
        }}
      >
        <Box
          ref={trackRef}
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: 'max-content',
            flexShrink: 0,
            whiteSpace: 'nowrap',
            willChange: 'transform',
          }}
        >
          {items.map((item) => (
            <Stack
              key={item.id}
              direction="row"
              sx={{ alignItems: 'center', mr: 5 }}
            >
              <Typography
                component="span"
                sx={{
                  fontSize: 28,
                  fontWeight: 800,
                  fontFamily: '"Source Sans 3", system-ui, sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'common.white',
                  lineHeight: 1,
                }}
              >
                {item.text}
              </Typography>
              <Typography
                component="span"
                sx={{
                  ml: 5,
                  fontSize: 28,
                  fontWeight: 800,
                  color: 'error.main',
                  lineHeight: 1,
                }}
              >
                •
              </Typography>
            </Stack>
          ))}
        </Box>
      </Box>
    </Stack>
  );
}
