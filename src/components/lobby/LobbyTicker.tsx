import { useEffect, useMemo, useRef, useState } from 'react';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { keyframes } from '@emotion/react';
import type { PlayerSlot } from 'react-gameroom';
import { format, useGameDict } from '../../i18n';
import type { GameDict } from '../../i18n';

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h + s.charCodeAt(i)) % 997;
  return h;
}

function pickReadyPhrase(name: string, dict: GameDict): string {
  const idx = hashStr(name) % dict.readyTemplates.length;
  return format(dict.readyTemplates[idx], { name });
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
  const dict = useGameDict();

  // Pick two ambient indices once, on mount. They never change. We hold
  // indices not text so a locale switch surfaces translated copy without
  // disturbing the picked pair.
  const [ambientIndices] = useState<[number, number]>(() => {
    const a = Math.floor(Math.random() * dict.ambientHeadlines.length);
    let b = Math.floor(Math.random() * (dict.ambientHeadlines.length - 1));
    if (b >= a) b += 1;
    return [a, b];
  });

  const ambient = useMemo<[string, string]>(
    () => [
      dict.ambientHeadlines[ambientIndices[0]],
      dict.ambientHeadlines[ambientIndices[1]],
    ],
    [dict, ambientIndices],
  );

  const desired = useMemo(() => {
    const readyPhrases = players
      .filter((p) => p.status === 'ready')
      .map((p) => pickReadyPhrase(p.name ?? format(dict.candidateFallback, { id: p.id }), dict));
    const segments = [...ambient, ...readyPhrases];
    return (segments.join(SEP) + SEP).repeat(REPEATS_PER_CYCLE);
  }, [players, ambient, dict]);

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
          {dict.newsroomChip}
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
