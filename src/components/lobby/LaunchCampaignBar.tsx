import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { isLikelyMobileHost } from 'react-gameroom';
import { useT } from '../../i18n';

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
  const t = useT();
  // Cached once per mount — useragent doesn't change inside a session and
  // we want to avoid re-running the sniff on every render.
  const isPhone = useMemo(() => isLikelyMobileHost(), []);
  if (isPhone) return null;

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
        bgcolor: 'background.paper',
        color: 'text.primary',
        py: 2.5,
        px: 3,
        textAlign: 'center',
        cursor: canStart ? 'pointer' : 'not-allowed',
        opacity: canStart ? 1 : 0.5,
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
        {t('launch.bar', { ready: readyCount, max: maxCount })}
      </Typography>
    </Box>
  );
}
