import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface WaitingViewProps {
  message: string;
  overline?: string;
  subtext?: string;
}

// Card-shaped placeholder echoing DrawZone's empty state — dashed outline,
// 10:7 aspect ratio, paper background — with a pulsing overline above the
// main message. Reuses the DrawZone visual so the player's pre-game wait
// reads as the same kind of "card-slot is here" affordance as the in-game
// draw zone.
export function WaitingView({ message, overline = 'Waiting', subtext }: WaitingViewProps) {
  return (
    <Box
      sx={(theme) => ({
        width: '100%',
        aspectRatio: '10 / 7',
        borderRadius: 1.5,
        outline: `1px dashed ${theme.palette.rule.strong}`,
        outlineOffset: '-1px',
        backgroundColor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        boxSizing: 'border-box',
      })}
    >
      <Stack spacing={0.5} sx={{ alignItems: 'center', px: 2 }}>
        <Typography
          variant="overline"
          sx={{
            color: 'text.secondary',
            letterSpacing: '0.14em',
            fontWeight: 700,
            '@keyframes waitingPulse': {
              '0%, 100%': { opacity: 0.55 },
              '50%': { opacity: 1 },
            },
            animation: 'waitingPulse 1.6s ease-in-out infinite',
            '@media (prefers-reduced-motion: reduce)': {
              animation: 'none',
              opacity: 0.85,
            },
          }}
        >
          {overline}
        </Typography>
        <Typography
          variant="h4"
          sx={{ fontWeight: 900, textAlign: 'center', lineHeight: 1.2 }}
        >
          {message}
        </Typography>
        {subtext && (
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              textAlign: 'center',
              pt: 0.5,
              maxWidth: 280,
            }}
          >
            {subtext}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}
