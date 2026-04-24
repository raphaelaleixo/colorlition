import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import type { Headline } from '../../game/types';

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

const SCROLL_SPEED = 100;
// Belt-and-suspenders cap — pair-based append/delete should self-balance, but
// if anything ever runs away we force-trim the front pair past this count.
const MAX_CHILDREN = 100;

type TickerItem =
  | { id: number; kind: 'entry'; text: string }
  | { id: number; kind: 'sentinel' };

type SentinelState = 'none' | 'entered' | 'exited';

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
  const viewportRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const hoverRef = useRef(false);

  const mutationPendingRef = useRef(false);
  const pendingOffsetShiftRef = useRef(0);

  // The current news — slot 0 is the active player's phrase, slot 1 (if any)
  // is the latest headline. Each sentinel-entry beat picks news[cursor % len]
  // and appends it. Replaced (not grown) when props change.
  const newsRef = useRef<string[]>([]);
  const newsCursorRef = useRef(0);
  const lastNewsKeyRef = useRef<string>('');

  // Lifecycle state per sentinel id.
  const sentinelStateRef = useRef<Map<number, SentinelState>>(new Map());
  const itemsRef = useRef<TickerItem[]>([]);

  const makePair = (text: string): TickerItem[] => [
    { id: seqRef.current++, kind: 'entry', text },
    { id: seqRef.current++, kind: 'sentinel' },
  ];

  const buildNews = (
    name: string,
    turnIndex: number,
    headline: Headline | null,
  ): string[] => {
    const phrase = pickNextPhrase(name, turnIndex);
    return headline ? [phrase, headline.text] : [phrase];
  };

  // Seed with one pair using news[0]. Start the pair off-screen right so it
  // scrolls in from the right edge — subsequent sentinel beats append more.
  useEffect(() => {
    const news = buildNews(currentPlayerName, currentPlayerIndex, lastHeadline);
    newsRef.current = news;
    newsCursorRef.current = 0;
    lastNewsKeyRef.current = `${currentPlayerName}:${currentPlayerIndex}|${lastHeadline?.id ?? ''}`;
    if (viewportRef.current) {
      offsetRef.current = viewportRef.current.getBoundingClientRect().width;
    }
    setItems(makePair(news[0]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rebuild the news array when props change. Cursor resets to 0 so the next
  // sentinel beat shows news[0] (the new player's phrase) first.
  useEffect(() => {
    const key = `${currentPlayerName}:${currentPlayerIndex}|${lastHeadline?.id ?? ''}`;
    if (key === lastNewsKeyRef.current) return;
    lastNewsKeyRef.current = key;
    newsRef.current = buildNews(currentPlayerName, currentPlayerIndex, lastHeadline);
    newsCursorRef.current = 0;
  }, [lastHeadline, currentPlayerName, currentPlayerIndex]);

  // After each commit: sync itemsRef, evict sentinel state for removed ids,
  // apply the pending offset shift, release the mutation lock.
  useLayoutEffect(() => {
    itemsRef.current = items;
    const live = new Set(
      items.filter((i) => i.kind === 'sentinel').map((i) => i.id),
    );
    for (const id of Array.from(sentinelStateRef.current.keys())) {
      if (!live.has(id)) sentinelStateRef.current.delete(id);
    }
    if (pendingOffsetShiftRef.current !== 0) {
      offsetRef.current += pendingOffsetShiftRef.current;
      pendingOffsetShiftRef.current = 0;
      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(${offsetRef.current}px)`;
      }
    }
    mutationPendingRef.current = false;
  }, [items]);

  useEffect(() => {
    let raf = 0;
    let prev = performance.now();

    const deletePairAt = (sentinelIdx: number): boolean => {
      const track = trackRef.current;
      if (!track) return false;
      if (sentinelIdx < 1) return false;
      const entryEl = track.children[sentinelIdx - 1] as HTMLElement | undefined;
      const sentinelEl = track.children[sentinelIdx] as HTMLElement | undefined;
      const afterEl = track.children[sentinelIdx + 1] as HTMLElement | undefined;
      if (!entryEl || !sentinelEl) return false;
      const entryLeft = entryEl.getBoundingClientRect().left;
      // Pair advance = distance from entry's left to the element after the
      // sentinel (or sentinel's right if nothing follows).
      let pairAdvance: number;
      if (afterEl) {
        pairAdvance = afterEl.getBoundingClientRect().left - entryLeft;
      } else {
        pairAdvance = sentinelEl.getBoundingClientRect().right - entryLeft;
      }
      pendingOffsetShiftRef.current += pairAdvance;
      mutationPendingRef.current = true;
      setItems((prevItems) => [
        ...prevItems.slice(0, sentinelIdx - 1),
        ...prevItems.slice(sentinelIdx + 1),
      ]);
      return true;
    };

    const appendPair = (text: string) => {
      mutationPendingRef.current = true;
      setItems((prevItems) => [...prevItems, ...makePair(text)]);
    };

    const tick = (now: number) => {
      const dt = now - prev;
      prev = now;
      if (!hoverRef.current) {
        offsetRef.current -= (SCROLL_SPEED * dt) / 1000;
      }
      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(${offsetRef.current}px)`;
      }

      const track = trackRef.current;
      const viewport = viewportRef.current;
      if (!mutationPendingRef.current && track && viewport) {
        const viewportRect = viewport.getBoundingClientRect();
        const currentItems = itemsRef.current;
        const children = track.children;
        let mutated = false;

        for (let i = 0; i < currentItems.length && i < children.length; i++) {
          const item = currentItems[i];
          if (item.kind !== 'sentinel') continue;
          const el = children[i] as HTMLElement;
          const rect = el.getBoundingClientRect();
          const state: SentinelState =
            sentinelStateRef.current.get(item.id) ?? 'none';

          if (state === 'none') {
            if (rect.left < viewportRect.right) {
              sentinelStateRef.current.set(item.id, 'entered');
              if (!mutated) {
                const news = newsRef.current;
                if (news.length > 0) {
                  const text = news[newsCursorRef.current % news.length];
                  newsCursorRef.current++;
                  appendPair(text);
                  mutated = true;
                }
              }
            }
          } else if (state === 'entered') {
            if (rect.right < viewportRect.left) {
              sentinelStateRef.current.set(item.id, 'exited');
              if (!mutated) {
                if (deletePairAt(i)) {
                  mutated = true;
                }
              }
            }
          }
        }

        if (!mutated && track.childElementCount > MAX_CHILDREN) {
          // Front pair is guaranteed [entry, sentinel]; delete at index 1.
          if (deletePairAt(1)) mutated = true;
        }
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
        ref={viewportRef}
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
            position: 'relative',
            willChange: 'transform',
          }}
        >
          {items.map((item) =>
            item.kind === 'entry' ? (
              <Box
                key={item.id}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  px: 2.5,
                }}
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
              </Box>
            ) : (
              <Box
                key={item.id}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  px: 2.5,
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: 'error.main',
                    lineHeight: 1,
                  }}
                >
                  •
                </Typography>
              </Box>
            ),
          )}
        </Box>
      </Box>
    </Stack>
  );
}
