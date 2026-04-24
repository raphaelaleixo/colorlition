import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { COLORS } from '../../game/constants';
import type { Card as GameCard, Color } from '../../game/types';

function summarize(base: GameCard[]): { label: string; count: number }[] {
  const byColor: Record<Color, number> = {} as Record<Color, number>;
  for (const c of COLORS) byColor[c] = 0;
  let pivots = 0;
  let grants = 0;
  for (const card of base) {
    if (card.kind === 'bloc') byColor[card.color] += 1;
    else if (card.kind === 'pivot') pivots += 1;
    else if (card.kind === 'grant') grants += 1;
  }
  const rows: { label: string; count: number }[] = [];
  for (const c of COLORS) {
    if (byColor[c] > 0) rows.push({ label: c, count: byColor[c] });
  }
  if (pivots > 0) rows.push({ label: 'pivot', count: pivots });
  if (grants > 0) rows.push({ label: 'grant', count: grants });
  return rows;
}

export function CoalitionBase({ base }: { base: GameCard[] }) {
  const rows = summarize(base);
  return (
    <Stack spacing={1}>
      <Typography variant="h6">Your Coalition</Typography>
      {rows.length === 0 && <Typography sx={{ color: 'text.secondary' }}>(empty)</Typography>}
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        {rows.map((r) => (
          <Chip key={r.label} label={`${r.label} (${r.count})`} />
        ))}
      </Stack>
    </Stack>
  );
}
