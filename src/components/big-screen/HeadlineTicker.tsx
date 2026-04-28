import { useEffect, useRef, useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { keyframes } from '@emotion/react';
import { format, useGameDict } from '../../i18n';
import type { GameDict } from '../../i18n';
import { renderHeadline } from '../../game/headlines';
import type { Headline } from '../../game/types';

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h + s.charCodeAt(i)) % 997;
  return h;
}

function pickNextPhrase(name: string, turnIndex: number, dict: GameDict): string {
  const idx = (hashStr(name) + turnIndex) % dict.nextVariations.length;
  return format(dict.nextVariations[idx], { name });
}

function pickOpeningHeadline(name: string, dict: GameDict): string {
  const idx = hashStr(name) % dict.openingHeadlines.length;
  return dict.openingHeadlines[idx];
}

const SEP = '  •  ';
const REPEATS_PER_CYCLE = 3;

function buildNewsText(
  name: string,
  turnIndex: number,
  headline: Headline | null,
  isFinalRound: boolean,
  dict: GameDict,
): string {
  const phrase = pickNextPhrase(name, turnIndex, dict);
  const second = headline
    ? renderHeadline(headline, dict)
    : pickOpeningHeadline(name, dict);
  const segments = isFinalRound
    ? `${phrase}${SEP}${second}${SEP}${dict.finalRoundMessage}${SEP}`
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
  const dict = useGameDict();
  const desired = buildNewsText(
    currentPlayerName,
    currentPlayerIndex,
    lastHeadline,
    isFinalRound,
    dict,
  );
  const [displayed, setDisplayed] = useState(desired);
  const [opacity, setOpacity] = useState(1);
  const swapTimerRef = useRef<number | null>(null);

  // Headline fade animation: kick the fade-out, then swap text + fade back in
  // after FADE_MS. The setState IS the effect's purpose.
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
