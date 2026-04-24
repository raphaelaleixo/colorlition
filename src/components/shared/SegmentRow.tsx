import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Card } from './Card';
import type { Segment } from '../../game/types';

type Props = { segment: Segment; showDemand?: boolean };

export function SegmentRow({ segment, showDemand = false }: Props) {
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{ p: 1, border: '1px solid #ccc', alignItems: 'flex-start' }}
    >
      <Typography sx={{ minWidth: 200, pt: 0.5 }}>{segment.label}</Typography>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        {segment.cards.map((c) => (
          <Card key={c.id} card={c} showDemand={showDemand} />
        ))}
      </Stack>
      {segment.claimedBy !== null && (
        <Typography sx={{ ml: 2, pt: 0.5 }}>— claimed by #{segment.claimedBy}</Typography>
      )}
    </Stack>
  );
}
