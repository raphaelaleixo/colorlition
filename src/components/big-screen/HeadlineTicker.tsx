import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import type { Headline } from '../../game/types';

const EMPTY_PLACEHOLDER = 'The wire is quiet. Awaiting the first move…';

// Duration scales with headline count so the crawl speed stays readable at
// any list size. One headline gets ~8s of screen time on average.
function tickerDurationSeconds(count: number): number {
  return Math.max(30, count * 8);
}

export function HeadlineTicker({ headlines }: { headlines: Headline[] }) {
  const hasContent = headlines.length > 0;
  // Duplicate the list so translateX(-50%) produces a seamless loop.
  const doubled = hasContent ? [...headlines, ...headlines] : [];
  const duration = tickerDurationSeconds(headlines.length);

  return (
    <Stack
      direction="row"
      sx={{
        flex: 'none',
        borderTop: '1px solid',
        borderColor: 'rule.strong',
        bgcolor: 'background.default',
        alignItems: 'stretch',
        height: 56,
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
        <Typography variant="overline" sx={{ color: 'error.main' }}>
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
              display: 'inline-flex',
              whiteSpace: 'nowrap',
              animation: `ticker ${duration}s linear infinite`,
              '@keyframes ticker': {
                '0%': { transform: 'translateX(0)' },
                '100%': { transform: 'translateX(-50%)' },
              },
              '&:hover': { animationPlayState: 'paused' },
            }}
          >
            {doubled.map((h, i) => (
              <Stack
                key={`${h.id}-${i}`}
                direction="row"
                sx={{ alignItems: 'center', mr: 4 }}
              >
                <Typography variant="body1" component="span">
                  {h.text}
                </Typography>
                <Typography
                  variant="body1"
                  component="span"
                  sx={{ ml: 4, color: 'text.secondary' }}
                >
                  •
                </Typography>
              </Stack>
            ))}
          </Box>
        ) : (
          <Typography
            variant="body1"
            sx={{
              px: 3,
              color: 'text.secondary',
              fontFamily: '"Playfair Display", Georgia, serif',
              fontStyle: 'italic',
            }}
          >
            {EMPTY_PLACEHOLDER}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}
