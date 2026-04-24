import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { chipSxFor } from '../../theme/colors';
import { DEMANDS } from '../../game/data/demands';
import type { Card as GameCard } from '../../game/types';

type Props = { card: GameCard; showDemand?: boolean };

export function Card({ card, showDemand = false }: Props) {
  let chip: React.ReactNode;
  if (card.kind === 'bloc') {
    chip = <Chip label={`${card.color} #${card.value}`} sx={chipSxFor(card.color)} />;
  } else if (card.kind === 'grant') {
    chip = <Chip label="Public Grant" sx={chipSxFor('grant')} />;
  } else if (card.kind === 'pivot') {
    chip = <Chip label="Pivot" sx={chipSxFor('pivot')} />;
  } else {
    chip = <Chip label="Exit Poll" sx={chipSxFor('exitPoll')} />;
  }

  if (!showDemand || card.kind !== 'bloc') return <>{chip}</>;

  const demand = DEMANDS[card.color]?.[card.value];
  if (!demand) return <>{chip}</>;

  return (
    <Stack spacing={0.25} sx={{ maxWidth: 160 }}>
      {chip}
      <Typography variant="caption" sx={{ fontStyle: 'italic', lineHeight: 1.2 }}>
        "{demand}"
      </Typography>
    </Stack>
  );
}
