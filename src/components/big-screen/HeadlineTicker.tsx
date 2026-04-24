import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { keyframes } from '@emotion/react';
import type { Headline } from '../../game/types';

const tickerKeyframes = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
`;

const EMPTY_PLACEHOLDER = 'The wire is quiet. Awaiting the first move…';

// Repeat enough that the scrolling track is always wider than the viewport —
// prevents empty gaps when the headline list is short. Formula: aim for at
// least ~4 items in the "base set" before doubling for the seamless loop.
function repeatCountFor(itemCount: number): number {
  return Math.max(1, Math.ceil(4 / Math.max(1, itemCount)));
}

// Duration tuned so scroll speed stays around ~100px/s regardless of list size.
function tickerDurationSeconds(doubledCount: number): number {
  return Math.max(20, doubledCount * 4);
}

export function HeadlineTicker({ headlines }: { headlines: Headline[] }) {
  const hasContent = headlines.length > 0;
  let doubled: Headline[] = [];
  let duration = 30;
  if (hasContent) {
    const repeat = repeatCountFor(headlines.length);
    const base: Headline[] = [];
    for (let i = 0; i < repeat; i++) base.push(...headlines);
    doubled = [...base, ...base];
    duration = tickerDurationSeconds(doubled.length);
  }

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
        {hasContent ? (
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
                  sx={{ fontSize: 28, fontWeight: 600, lineHeight: 1 }}
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
        ) : (
          <Typography
            sx={{
              px: 3,
              color: 'text.secondary',
              fontFamily: '"Playfair Display", Georgia, serif',
              fontStyle: 'italic',
              fontSize: 22,
            }}
          >
            {EMPTY_PLACEHOLDER}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}
