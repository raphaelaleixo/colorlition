import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { PlayerSlot } from 'react-gameroom';
import { CandidateCard } from './CandidateCard';
import { useT } from '../../i18n';

interface CandidateRosterProps {
  players: readonly PlayerSlot[];
}

export function CandidateRoster({ players }: CandidateRosterProps) {
  const t = useT();
  return (
    <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
      <Stack spacing={1}>
        <Typography variant="h4" sx={{ fontWeight: 900 }}>
          {t('candidateRoster.heading')}
        </Typography>
        <Box sx={{ borderBottom: '1px solid', borderColor: 'rule.hair' }} />
      </Stack>
      <Stack spacing={1}>
        {players.map((p) => (
          <CandidateCard key={p.id} player={p} />
        ))}
      </Stack>
    </Stack>
  );
}
