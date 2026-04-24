import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { keyframes } from '@emotion/react';
import type { Headline } from '../../game/types';

const tickerKeyframes = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
`;

// Rotating phrasings for "X is next to act" — rotates per turn so the ticker
// feels alive rather than repeating the same phrase. Expand this list freely
// to add more flavor; order doesn't matter since we index by turn count.
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

// Turn index alone would give the same phrasing whenever a given player comes
// up. Mixing in a name hash breaks that pattern so players see different
// phrasings across turns even if the rotation aligns unfavorably.
function variationIndex(name: string, turnIndex: number): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash + name.charCodeAt(i)) % 997;
  return (hash + turnIndex) % NEXT_VARIATIONS.length;
}

function pickNextPhrase(name: string, turnIndex: number): string {
  const fn = NEXT_VARIATIONS[variationIndex(name, turnIndex)];
  return fn(name);
}

// Repeat enough that the scrolling track is always wider than the viewport —
// prevents empty gaps when the source list is short. Aim for at least ~4
// items in the "base set" before doubling for the seamless loop.
function repeatCountFor(itemCount: number): number {
  return Math.max(1, Math.ceil(4 / Math.max(1, itemCount)));
}

// Duration tuned so scroll speed stays around ~100px/s regardless of size.
function tickerDurationSeconds(doubledCount: number): number {
  return Math.max(20, doubledCount * 4);
}

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
  const nextPhrase = pickNextPhrase(currentPlayerName, currentPlayerIndex);

  // Source is always at least the next-to-act line. If we have a real
  // headline stored, append its text so the ticker alternates:
  // "<next-to-act> • <last headline> • <next-to-act> • …"
  const sourceTexts: string[] = [nextPhrase];
  if (lastHeadline) sourceTexts.push(lastHeadline.text);

  const repeat = repeatCountFor(sourceTexts.length);
  const base: string[] = [];
  for (let i = 0; i < repeat; i++) base.push(...sourceTexts);
  const doubled: string[] = [...base, ...base];
  const duration = tickerDurationSeconds(doubled.length);

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
            alignItems: 'center',
            width: 'max-content',
            flexShrink: 0,
            whiteSpace: 'nowrap',
            willChange: 'transform',
            animation: `${tickerKeyframes} ${duration}s linear infinite`,
            '&:hover': { animationPlayState: 'paused' },
          }}
        >
          {doubled.map((text, i) => (
            <Stack
              key={`item-${i}`}
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
                {text}
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
