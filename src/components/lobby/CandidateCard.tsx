import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { PlayerSlot } from 'react-gameroom';

interface CandidateCardProps {
  player: PlayerSlot;
}

const STATUS_LABEL: Record<'joining' | 'ready', string> = {
  joining: 'FILED',
  ready: 'READY',
};

export function CandidateCard({ player }: CandidateCardProps) {
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
          Awaiting candidate
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
        {STATUS_LABEL[player.status]}
      </Typography>
      <Typography variant="h4">{player.name ?? `Candidate ${player.id}`}</Typography>
    </Stack>
  );
}
