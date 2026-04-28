import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { isLikelyMobileHost } from 'react-gameroom';

interface LaunchCampaignBarProps {
  readyCount: number;
  maxCount: number;
  canStart: boolean;
  onLaunch: () => void;
}

export function LaunchCampaignBar({
  readyCount,
  maxCount,
  canStart,
  onLaunch,
}: LaunchCampaignBarProps) {
  // Cached once per mount — useragent doesn't change inside a session and
  // we want to avoid re-running the sniff on every render.
  const isPhone = useMemo(() => isLikelyMobileHost(), []);
  if (isPhone) return null;

  const label = `Launch Campaign · ${readyCount} of ${maxCount} candidates ready →`;

  return (
    <Box
      component="button"
      type="button"
      onClick={canStart ? onLaunch : undefined}
      disabled={!canStart}
      sx={{
        display: 'block',
        width: '100%',
        border: 'none',
        borderTop: '1px solid',
        borderColor: 'rule.strong',
        bgcolor: 'text.primary',
        color: 'background.default',
        py: 2.5,
        px: 3,
        textAlign: 'center',
        cursor: canStart ? 'pointer' : 'not-allowed',
        opacity: canStart ? 1 : 0.4,
        transition: 'opacity 160ms ease',
        '&:hover': canStart
          ? { opacity: 0.9 }
          : undefined,
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'text.primary',
          outlineOffset: -4,
        },
      }}
    >
      <Typography
        component="span"
        sx={{
          fontFamily: 'inherit',
          fontWeight: 700,
          fontSize: 14,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}
