import { useEffect, useRef, useState } from 'react';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { keyframes } from '@emotion/react';
import type { PlayerSlot } from 'react-gameroom';

const AMBIENT_HEADLINES = [
  'Newsroom on watch as candidates take the floor',
  'The seven blocs assemble — coalition season is upon us',
  "Polling booths primed; tonight's contest awaits its candidates",
  'Press corps pours in; a long evening of speculation begins',
  'First gavel falls — opening bell rings on the coalition race',
  'Voter segments hold their breath; alliances yet unmade',
  'Pollsters check their models one final time',
  'Capital stirs as the campaign trail opens',
];

const READY_TEMPLATES: Array<(name: string) => string> = [
  (n) => `${n} launches campaign`,
  (n) => `${n} hits the campaign trail`,
  (n) => `${n} throws hat in the ring`,
  (n) => `${n} opens campaign HQ`,
  (n) => `${n} files candidacy`,
  (n) => `${n} kicks off the campaign`,
  (n) => `${n} plants the flag`,
];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h + s.charCodeAt(i)) % 997;
  return h;
}

function pickReadyPhrase(name: string): string {
  return READY_TEMPLATES[hashStr(name) % READY_TEMPLATES.length](name);
}

function pickTwoAmbient(): [string, string] {
  const a = Math.floor(Math.random() * AMBIENT_HEADLINES.length);
  let b = Math.floor(Math.random() * (AMBIENT_HEADLINES.length - 1));
  if (b >= a) b += 1;
  return [AMBIENT_HEADLINES[a], AMBIENT_HEADLINES[b]];
}

const FADE_MS = 300;
const SECONDS_PER_CHAR = 0.18;
const MIN_DURATION_S = 15;
const SEP = '  •  ';
const REPEATS_PER_CYCLE = 2;

const scroll = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
`;

interface LobbyTickerProps {
  players: readonly PlayerSlot[];
}

export function LobbyTicker({ players }: LobbyTickerProps) {
  // Pick two ambient headlines once, on mount. They never change.
  const [ambient] = useState(pickTwoAmbient);

  const readyPhrases = players
    .filter((p) => p.status === 'ready')
    .map((p) => pickReadyPhrase(p.name ?? `Candidate ${p.id}`));
  const segments = [...ambient, ...readyPhrases];
  const desired = (segments.join(SEP) + SEP).repeat(REPEATS_PER_CYCLE);

  const [displayed, setDisplayed] = useState(desired);
  const [opacity, setOpacity] = useState(1);
  const swapTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (desired === displayed) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
