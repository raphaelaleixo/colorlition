import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Card } from './Card';
import type { Segment } from '../../game/types';

export function SegmentRow({ segment }: { segment: Segment }) {
  return (
    <Stack direction="row" spacing={1} sx={{ p: 1, border: '1px solid #ccc', alignItems: 'center' }}>
      <Typography sx={{ minWidth: 200 }}>{segment.label}</Typography>
      <Stack direction="row" spacing={1}>
        {segment.cards.map((c) => (
          <Card key={c.id} card={c} />
        ))}
      </Stack>
      {segment.claimedBy !== null && (
        <Typography sx={{ ml: 2 }}>— claimed by #{segment.claimedBy}</Typography>
      )}
    </Stack>
  );
}
