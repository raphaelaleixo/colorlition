import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { keyframes } from '@emotion/react';
import type { Headline } from '../../game/types';

const tickerKeyframes = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
`;

const EMPTY_PLACEHOLDER_TEXT = 'The wire is quiet. Awaiting the first move…';

// Synthesized "headline" used when there are no real ones yet — keeps the
// ticker animating so the user sees it's a live chyron rather than a panel.
const PLACEHOLDER_ENTRY: Headline = {
  id: 'placeholder',
  kind: 'rising_demand',
  segmentKey: 'industrial',
  roundNumber: 0,
  text: EMPTY_PLACEHOLDER_TEXT,
};

// Repeat enough that the scrolling track is always wider than the viewport —
// prevents empty gaps when the headline list is short. Aim for at least ~4
// items in the "base set" before doubling for the seamless loop.
function repeatCountFor(itemCount: number): number {
  return Math.max(1, Math.ceil(4 / Math.max(1, itemCount)));
}

// Duration tuned so scroll speed stays around ~100px/s regardless of list size.
function tickerDurationSeconds(doubledCount: number): number {
  return Math.max(20, doubledCount * 4);
}

export function HeadlineTicker({ headlines }: { headlines: Headline[] }) {
  // Firebase RTDB can return arrays as objects in some edge cases. Coerce
  // so .length / .map never silently yield undefined.
  const list: Headline[] = Array.isArray(headlines)
    ? headlines
    : Object.values((headlines ?? {}) as Record<string, Headline>);

  // If there are no real headlines, use the placeholder as the single entry
  // so the ticker still animates.
  const isEmpty = list.length === 0;
  const source: Headline[] = isEmpty ? [PLACEHOLDER_ENTRY] : list;

  const repeat = repeatCountFor(source.length);
  const base: Headline[] = [];
  for (let i = 0; i < repeat; i++) base.push(...source);
  const doubled: Headline[] = [...base, ...base];
  const duration = tickerDurationSeconds(doubled.length);

  return (
    <Stack
      direction="row"
      sx={{
        flex: 'none',
        borderTop: '1px solid',
        borderColor: 'rule.strong',
        bgcolor: 'background.default',
        alignItems: 'stretch',
        height: 80,
      }}
    >
      <Box
        sx={{
          px: 3,
          display: 'flex',
          alignItems: 'center',
          borderRight: '1px solid',
          borderColor: 'rule.hair',
        }}
      >
        <Typography
          sx={{
            color: 'error.main',
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
          {doubled.map((h, i) => (
            <Stack
              key={`${h.id}-${i}`}
              direction="row"
              sx={{ alignItems: 'center', mr: 5 }}
            >
              <Typography
                component="span"
                sx={{
                  fontSize: 28,
                  fontWeight: isEmpty ? 400 : 600,
                  fontStyle: isEmpty ? 'italic' : 'normal',
                  fontFamily: isEmpty
                    ? '"Playfair Display", Georgia, serif'
                    : undefined,
                  color: isEmpty ? 'text.secondary' : 'text.primary',
                  lineHeight: 1,
                }}
              >
                {h.text}
              </Typography>
              <Typography
                component="span"
                sx={{
                  ml: 5,
                  fontSize: 28,
                  fontWeight: 700,
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
