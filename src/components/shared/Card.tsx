import Chip from '@mui/material/Chip';
import { chipSxFor } from '../../theme/colors';
import type { Card as GameCard } from '../../game/types';

export function Card({ card }: { card: GameCard }) {
  if (card.kind === 'bloc') {
    return <Chip label={`${card.color} #${card.value}`} sx={chipSxFor(card.color)} />;
  }
  if (card.kind === 'grant') return <Chip label="Public Grant" sx={chipSxFor('grant')} />;
  if (card.kind === 'pivot') return <Chip label="Pivot" sx={chipSxFor('pivot')} />;
  return <Chip label="Exit Poll" sx={chipSxFor('exitPoll')} />;
}
