import Chip from '@mui/material/Chip';
import type { Card as GameCard } from '../../game/types';

export function Card({ card }: { card: GameCard }) {
  if (card.kind === 'bloc') return <Chip label={`${card.color} #${card.value}`} />;
  if (card.kind === 'grant') return <Chip label="Public Grant" />;
  if (card.kind === 'pivot') return <Chip label="Pivot" />;
  return <Chip label="Exit Poll" />;
}
