import { useEffect, useRef, useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { keyframes } from '@emotion/react';
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

const SEP = '  •  ';

const OPENING_HEADLINES = [
  'Polls open — coalition season begins',
  'The seven blocs assemble as the chase for a mandate gets underway',
  'Newsroom on watch as candidates take the floor',
  'First gavel falls — opening bell rings on the coalition race',
  'Capital stirs as the campaign trail opens',
];

function pickOpeningHeadline(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash + name.charCodeAt(i)) % 997;
  return OPENING_HEADLINES[hash % OPENING_HEADLINES.length];
}

const REPEATS_PER_CYCLE = 3;

const FINAL_ROUND_MESSAGE = 'This is the final round';

function buildNewsText(
  name: string,
  turnIndex: number,
  headline: Headline | null,
  isFinalRound: boolean,
): string {
  const phrase = pickNextPhrase(name, turnIndex);
  const second = headline ? headline.text : pickOpeningHeadline(name);
  const segments = isFinalRound
    ? `${phrase}${SEP}${second}${SEP}${FINAL_ROUND_MESSAGE}${SEP}`
    : `${phrase}${SEP}${second}${SEP}`;
  return segments.repeat(REPEATS_PER_CYCLE);
}

const FADE_MS = 300;
const SECONDS_PER_CHAR = 0.18;
const MIN_DURATION_S = 15;

const scroll = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
`;

type Props = {
  lastHeadline: Headline | null;
  currentPlayerName: string;
  currentPlayerIndex: number;
  isFinalRound?: boolean;
};

export function HeadlineTicker({
  lastHeadline,
  currentPlayerName,
  currentPlayerIndex,
  isFinalRound = false,
}: Props) {
  const desired = buildNewsText(
    currentPlayerName,
    currentPlayerIndex,
    lastHeadline,
    isFinalRound,
  );
  const [displayed, setDisplayed] = useState(desired);
  const [opacity, setOpacity] = useState(1);
  const swapTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (desired === displayed) return;
    setOpacity(0);
    swapTimerRef.current = window.setTimeout(() => {
      setDisplayed(desired);
      setOpacity(1);
      swapTimerRef.current = null;
    }, FADE_MS);
    return () => {
      if (swapTimerRef.current !== null) {
        window.clearTimeout(swapTimerRef.current);
        swapTimerRef.current = null;
      }
    };
  }, [desired, displayed]);

  const duration = Math.max(MIN_DURATION_S, displayed.length * SECONDS_PER_CHAR);

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
      >
        <Box
          sx={{
            display: 'flex',
            width: 'max-content',
            opacity,
            transition: `opacity ${FADE_MS}ms ease`,
            animation: `${scroll} ${duration}s linear infinite`,
            willChange: 'transform',
          }}
        >
          {[0, 1].map((copy) => (
            <Typography
              key={copy}
              component="span"
              aria-hidden={copy === 1}
              sx={{
                flexShrink: 0,
                fontSize: 18,
                fontWeight: 700,
                fontFamily: '"Source Sans 3", system-ui, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '0.22em',
                color: 'common.white',
                lineHeight: 1,
                whiteSpace: 'nowrap',
              }}
            >
              {displayed}
            </Typography>
          ))}
        </Box>
      </Box>
    </Stack>
  );
}
