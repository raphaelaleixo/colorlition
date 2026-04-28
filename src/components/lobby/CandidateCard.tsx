import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { PlayerSlot } from 'react-gameroom';
import { format, useGameDict, useT } from '../../i18n';
import type { UIKey } from '../../i18n';

interface CandidateCardProps {
  player: PlayerSlot;
}

const STATUS_KEY: Record<'joining' | 'ready', UIKey> = {
  joining: 'candidate.statusFiled',
  ready: 'candidate.statusReady',
};

export function CandidateCard({ player }: CandidateCardProps) {
  const t = useT();
  const dict = useGameDict();

  if (player.status === 'empty') {
    return (
      <Stack
        sx={{
          p: 2,
          minHeight: 72,
          border: '1px dashed',
          borderColor: 'rule.hair',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        <Typography variant="overline" sx={{ color: 'text.secondary' }}>
          {t('candidate.empty')}
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack
      spacing={0.5}
      sx={{
        p: 2,
        minHeight: 72,
        border: '1px solid',
        borderColor: 'rule.strong',
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant="overline" sx={{ color: 'text.secondary' }}>
        {t(STATUS_KEY[player.status])}
      </Typography>
      <Typography variant="h4">
        {player.name ?? format(dict.candidateFallback, { id: String(player.id) })}
      </Typography>
    </Stack>
  );
}
